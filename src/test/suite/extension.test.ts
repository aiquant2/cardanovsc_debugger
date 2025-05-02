import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate } from '../../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension activates successfully', async () => {
        const context = {
            subscriptions: [],
            extensionPath: '',
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            workspaceState: {} as vscode.Memento,
            globalState: {} as vscode.Memento,
            asAbsolutePath: (relativePath: string) => relativePath
        } as unknown as vscode.ExtensionContext;

        await activate(context);
        
        assert.ok(context.subscriptions.length > 0, 'Subscriptions should be added');
    });

    test('Hello World command registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('cardanovscDebugger.helloWorld'), 'Hello World command should be registered');
    });

    test('Debug configuration provider registered', async () => {
        const debugProviders = (vscode.debug as any)._debuggers;
        const haskellProvider = debugProviders.get('haskell');
        assert.ok(haskellProvider, 'Haskell debug configuration provider should be registered');
    });
});