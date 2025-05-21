
import * as vscode from 'vscode';
import { HaskellDebugSession } from './debugAdapter';
import { startGhcidOnHaskellOpen } from './diagnostics';  // Merged file
import { execFile } from 'child_process';
import path from 'path';
import os from 'os';
import { import_data } from './importData';



export async function activate(context: vscode.ExtensionContext) {
 
    import_data();
    const platform = os.platform();
    const scriptName = platform === 'win32' ? 'check-ghcid.bat' : 'check-ghcid.sh';
    console.log(context.extensionPath);
    
    const scriptPath = path.join(context.extensionPath, 'scripts', scriptName);
  
    execFile(scriptPath, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showWarningMessage(
          '⚠️ "ghcid" is not installed. Diagnostics and live error checking will be unavailable. Please install it via `cabal install ghcid` or `stack install ghcid`.'
        );
        console.warn(`ghcid check script output: ${stderr || stdout}`);
      } else {
        console.log(`ghcid is installed: ${stdout.trim()}`);
      }
    });
    // Start Ghcid and Diagnostics when opening a Haskell file
    startGhcidOnHaskellOpen(context);

    // Register Hello World Command
    const disposable = vscode.commands.registerCommand('cardanovscDebugger.helloWorld', () => {

        vscode.window.showInformationMessage('Hello World from CardanoVSC Debugger!');
    });
    context.subscriptions.push(disposable);
    
    
    
    try {
        // Register configuration provider
        const configProvider = new HaskellConfigurationProvider();
        context.subscriptions.push(
            vscode.debug.registerDebugConfigurationProvider('haskell', configProvider)
        );
        
        
        // Register debug adapter descriptor factory
        const debugAdapterFactory = new InlineDebugAdapterFactory();
        context.subscriptions.push(
            vscode.debug.registerDebugAdapterDescriptorFactory('haskell', debugAdapterFactory)
        );

        console.log(debugAdapterFactory);
        console.log('Haskell debugger providers registered successfully');
    
        
    } catch (error) {
        
        console.error('Failed to register debug providers:', error);
        vscode.window.showErrorMessage('Failed to initialize Haskell debugger');
    }
}

export function deactivate() {
    console.log('Haskell Debugger extension deactivated');
}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(
        session: vscode.DebugSession
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
       
        

        try {
            return new vscode.DebugAdapterInlineImplementation(new HaskellDebugSession());
        } catch (error) {
            throw error;
        }
    }
}

class HaskellConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration,
        token?: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DebugConfiguration> {
        try {
            if (
                config.type !== 'haskell' ||
                config.request !== 'launch' ||
                config.program !== 'cabal repl --repl-no-load' ||
                !config.name
            ) {
                return this.createDefaultConfig();
            }
            
           
            

            return this.validateAndEnhanceConfig(config);
            
        } catch (error) {
            return undefined;
        }
    }

    private createDefaultConfig(): vscode.DebugConfiguration | undefined {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'haskell') {
            if (!this.isHaskellFile(editor.document.fileName)) {
                this.showFileTypeError();
                return undefined;
            }

            return {
                type: 'haskell',
                name: 'Debug Cabal Project',
                request: 'launch',
                program: 'cabal repl --repl-no-load',
                activeFile: editor.document.fileName,
                showIO: true,
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            };
        }

        this.showNoHaskellFileError();
        return undefined;
    }

    private validateAndEnhanceConfig(config: vscode.DebugConfiguration): vscode.DebugConfiguration | undefined {
        const editor = vscode.window.activeTextEditor;
        
        if (editor?.document.languageId === 'haskell' && !config.activeFile) {
            if (!this.isHaskellFile(editor.document.fileName)) {
                this.showFileTypeError();
                return undefined;
            }
            config.activeFile = editor.document.fileName;
        }

        if (!config.program && !config.activeFile) {
            this.showNoHaskellFileError();
            return undefined;
        }

        config.program = config.program || 'cabal repl --repl-no-load';
        config.showIO = config.showIO !== false;
        config.cwd = config.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        return config;
    }

    private isHaskellFile(filePath: string): boolean {
        return filePath.endsWith('.hs');
    }

    private async showFileTypeError(): Promise<void> {
        await vscode.window.showErrorMessage(
            "Active file must be a Haskell source file (.hs)"
        );
    }

    private async showNoHaskellFileError(): Promise<void> {
        await vscode.window.showErrorMessage(
            "Please open a Haskell file or specify 'program' in your launch configuration"
        );
    }
}



