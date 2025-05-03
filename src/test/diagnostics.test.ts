// jest.mock('vscode');

// import * as vscode from 'vscode';
// import { spawn } from 'child_process';
// import * as path from 'path';
// import { diagnosticCollection, startGhcidOnHaskellOpen, stopGhcid, parseCabalErrors, updateErrorDecorations } from '../diagnostics';

// jest.mock('child_process', () => ({
//   spawn: jest.fn(),
// }));

// jest.mock('vscode', () => ({
//   ...jest.requireActual('vscode'),
//   languages: {
//     createDiagnosticCollection: jest.fn(() => ({
//       clear: jest.fn(),
//       set: jest.fn(),
//     })),
//   },
//   window: {
//     createStatusBarItem: jest.fn(() => ({
//       show: jest.fn(),
//       text: '',
//       tooltip: '',
//     })),
//     onDidChangeActiveTextEditor: jest.fn(),
//     showErrorMessage: jest.fn(),
//     activeTextEditor: {
//       document: {
//         languageId: 'haskell',
//       },
//     },
//   },
//   workspace: {
//     rootPath: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
//     onDidOpenTextDocument: jest.fn(),
//     onDidChangeTextDocument: jest.fn(),
//     textDocuments: [
//       {
//         uri: {
//           fsPath: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs',
//         },
//         languageId: 'haskell',
//         lineAt: jest.fn(() => ({
//           text: 'mock content',
//         })),
//       },
//     ],
//   },
// }));

// describe('diagnostic.ts', () => {
//   let context: vscode.ExtensionContext;

//   beforeEach(() => {
//     context = {
//       subscriptions: [],
//     } as any;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should initialize ghcid process on Haskell file open', async () => {
//     const startGhcidMock = jest.spyOn(diagnosticCollection, 'clear');
//     const mockSpawn = jest.fn().mockReturnValue({
//       stdout: {
//         on: jest.fn(),
//       },
//       stderr: {
//         on: jest.fn(),
//       },
//       on: jest.fn(),
//     });

//     (spawn as jest.Mock) = mockSpawn;

//     startGhcidOnHaskellOpen(context);

//     expect(mockSpawn).toHaveBeenCalledWith('ghcid', ['--command', 'cabal repl'], {
//       cwd: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
//       shell: true,
//     });
//   });

//   it('should stop ghcid process when stopGhcid is called', () => {
//     const mockGhcidProcess = {
//       kill: jest.fn(),
//     };

//     (spawn as jest.Mock) = jest.fn().mockReturnValue(mockGhcidProcess);

//     // Simulate the ghcid process running
//     startGhcidOnHaskellOpen(context);
//     stopGhcid();

//     expect(mockGhcidProcess.kill).toHaveBeenCalled();
//   });

//   it('should parse Cabal errors and update diagnostics correctly', () => {
//     const output = `
//       /home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs:1:1: error: some error message
//       /home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs:2:5: warning: some warning message
//     `;
//     parseCabalErrors(output, '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs');

//     // Verify that diagnostics were added correctly
//     expect(diagnosticCollection.set).toHaveBeenCalled();
//   });

//   it('should update error decorations in active editor', () => {
//     const mockActiveEditor = vscode.window.activeTextEditor;
//     const mockDiagnostics = [
//       new vscode.Diagnostic(
//         new vscode.Range(0, 0, 0, 1),
//         'Error message',
//         vscode.DiagnosticSeverity.Error
//       ),
//     ];

//     // Mock the `diagnosticCollection.get` method to return mock diagnostics
//     (diagnosticCollection.get as jest.Mock).mockReturnValue(mockDiagnostics);

//     updateErrorDecorations();
//     if (mockActiveEditor) {
//     // Check if decorations were applied
//     expect(mockActiveEditor.setDecorations).toHaveBeenCalled();
//     }
//   });


//   it('should handle ghcid output and create correct diagnostics', () => {
//     const outputLines = [
//       '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs:1:1: error: some error message',
//       '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/src/HelloWorld/Compiler.hs:2:5: warning: some warning message',
//       'All good',
//     ];

//     const processGhcidOutputMock = jest.spyOn(diagnosticCollection, 'clear');
// console.log("hii");

// console.log(processGhcidOutputMock);

//     // processGhcidOutputMock(outputLines);

//     expect(processGhcidOutputMock).toHaveBeenCalled();
//     expect(diagnosticCollection.set).toHaveBeenCalled();
//   });
// });

// jest.mock('vscode', () => {
//   const originalModule = jest.requireActual('vscode');
//   return {
//     ...originalModule,
//     window: {
//       ...originalModule.window,
//       showInformationMessage: jest.fn(),
//       showErrorMessage: jest.fn(),
//     },
//     commands: {
//       ...originalModule.commands,
//       registerCommand: jest.fn(),
//     },
//     debug: {
//       ...originalModule.debug,
//       registerDebugConfigurationProvider: jest.fn(),
//       registerDebugAdapterDescriptorFactory: jest.fn(),
//     },
//     DebugAdapterInlineImplementation: jest.fn().mockImplementation(() => ({})),
//   };
// });

// // diagnostics.test.ts
// describe('Diagnostics Module', () => {
//   it('should pass this placeholder test', () => {
//     expect(true).toBe(true);
//   });
// });



// src/test/diagnostics.test.ts
describe('Diagnostics', () => {
    it('should be a placeholder test until real tests are written', () => {
      expect(true).toBe(true);
    });
  });
  