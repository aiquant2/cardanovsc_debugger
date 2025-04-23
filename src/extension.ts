// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';
// import { HaskellDebugSession } from './debugAdapter';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	console.log('Congratulations, your extension "demo-extension" is now active!');
// 	const disposable = vscode.commands.registerCommand('demo-extension.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from demo_extension!');
// 	});
// 	context.subscriptions.push(disposable);
// 	 // Register configuration provider
// 	 context.subscriptions.push(
//         vscode.debug.registerDebugConfigurationProvider('haskell', new HaskellConfigurationProvider())
//     );
// 	 // Register our debug adapter
// 	 context.subscriptions.push(
//         vscode.debug.registerDebugAdapterDescriptorFactory('haskell', {
//             createDebugAdapterDescriptor(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
//                 // Use inline implementation
//                 return new vscode.DebugAdapterInlineImplementation(new HaskellDebugSession());
//             }
//         })
//     );
	
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}
// class HaskellConfigurationProvider implements vscode.DebugConfigurationProvider {
//     /**
//      * Massage a debug configuration just before a debug session is being launched
//      */
//     resolveDebugConfiguration(
//         folder: vscode.WorkspaceFolder | undefined,
//         config: vscode.DebugConfiguration,
//         token?: vscode.CancellationToken
//     ): vscode.ProviderResult<vscode.DebugConfiguration> {

//         // If launch.json is missing or empty
//         // eslint-disable-next-line eqeqeq
//         if (!config.type&& !config.request && !config.name) {
//             const editor = vscode.window.activeTextEditor;
//             if (editor && editor.document.languageId === 'haskell') {
//                 config.label='Haskell Debugger',
//                 config.type = 'haskell';
//                 config.name = 'Debug Haskell';
//                 config.request = 'launch';
//                 config.program = '${workspaceFolder}'; // Default path to the compiled Haskell program
//                 config.stopOnEntry = false; // Default to false for Haskell
//             }
//         }

//         // Validate required program path
//         if (!config.program) {
//             const message = "Please open a Haskell file or specify 'program' in your launch configuration";
//             return vscode.window.showErrorMessage(message).then(_ => {
//                 return undefined; // Abort launch
//             });
//         }

//         // Set default values if not specified
//         config.stopOnEntry = config.stopOnEntry || false;
//         config.showIO = config.showIO || true;

//         return config;
//     }
// }


import * as vscode from 'vscode';
import { HaskellDebugSession } from './debugAdapter';
import { debouncedRunCabalBuild } from './diagnostic';

export function activate(context: vscode.ExtensionContext) {
    console.log('Haskell Debugger extension activated');
    // vscode.workspace.onDidChangeTextDocument((event) => {
    //             if (event.document.languageId === "haskell" || event.document.languageId === "cabal") {
    //                 // Check if a .hs file is currently open
    //                 const isHsFileOpen = vscode.window.visibleTextEditors.some(
    //                     editor => editor.document.languageId === "haskell"
    //                 );
    //                 if (isHsFileOpen) {
    //                     debouncedRunCabalBuild("", ""); // Delayed execution to avoid frequent builds
    //                 }}});
            
    // Register commands
    const disposable = vscode.commands.registerCommand('haskell-debugger.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Haskell Debugger!');
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
            console.error('Failed to create debug adapter:', error);
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
            // If launch.json is missing or empty
            if (!config.type && !config.request && !config.name) {
                return this.createDefaultConfig();
            }

            // Validate and enhance the configuration
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
                stopOnEntry: false,
                showIO: true,
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            };
        }

        this.showNoHaskellFileError();
        return undefined;
    }

    private validateAndEnhanceConfig(config: vscode.DebugConfiguration): vscode.DebugConfiguration | undefined {
        const editor = vscode.window.activeTextEditor;
        
        // Set active file from editor if not specified
        if (editor?.document.languageId === 'haskell' && !config.activeFile) {
            if (!this.isHaskellFile(editor.document.fileName)) {
                this.showFileTypeError();
                return undefined;
            }
            config.activeFile = editor.document.fileName;
        }

        // Validate we have either a program or active file
        if (!config.program && !config.activeFile) {
            this.showNoHaskellFileError();
            return undefined;
        }

        // Set default values
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