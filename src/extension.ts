
import * as vscode from 'vscode';
import { HaskellDebugSession } from './debugAdapter';
import { startGhcidOnHaskellOpen } from './diagnostics';  // Merged file


export function activate(context: vscode.ExtensionContext) {
    
    console.log('Haskell Debugger extension activated');
    
    
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
        
        console.log(configProvider);
        
        // Register debug adapter descriptor factory
        const debugAdapterFactory = new InlineDebugAdapterFactory();
        context.subscriptions.push(
            vscode.debug.registerDebugAdapterDescriptorFactory('haskell', debugAdapterFactory)
        );

        
        console.log(debugAdapterFactory);
        console.log('Haskell debugger providers registered successfully');
    }
        
    catch (error) {
        
        console.error('Failed to register debug providers:', error);
        vscode.window.showErrorMessage('Failed to initialize Haskell debugger');
    }
}

    export function deactivate() {
    console.log('Haskell Debugger extension deactivated');
}

export class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(
        session: vscode.DebugSession
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
       
        

        try {
            return new vscode.DebugAdapterInlineImplementation(new HaskellDebugSession());
        } catch (error) {
            console.error('Failed to create debug adapter:', error);
            throw error;
        }
    }
}

export class HaskellConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration,
        token?: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DebugConfiguration> {
        try {
            if (!config.type && !config.request && !config.name) {
                return this.createDefaultConfig();
            }

            return this.validateAndEnhanceConfig(config);
            
        } catch (error) {
            console.error('Error resolving debug configuration:', error);
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
                name: 'Debug Haskell',
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
        config.stopOnEntry = config.stopOnEntry || false;
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




// function extractHaskellFunctions(code: string): string[] {
//     const functionRegex = /^([a-z][\w']*)\s*(::|=)/gm;
//     const functions: string[] = [];
//     let match: RegExpExecArray | null;
  
//     while ((match = functionRegex.exec(code)) !== null) {
//       functions.push(match[1]);
//     }
  
//     return Array.from(new Set(functions)); // Remove duplicates
//   }