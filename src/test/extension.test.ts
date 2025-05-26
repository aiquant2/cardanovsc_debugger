jest.mock('vscode', () => {
    const original = jest.requireActual('vscode');
    return {
      ...original,
      window: {
        ...original.window,
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        createStatusBarItem: jest.fn(() => ({
          text: '',
          show: jest.fn(),
        })),
        activeTextEditor: {
          document: {
            languageId: 'haskell',
            fileName: '/path/to/file/Main.hs',
          },
        },
      },
      commands: {
        ...original.commands,
        registerCommand: jest.fn(),
      },
      debug: {
        ...original.debug,
        registerDebugConfigurationProvider: jest.fn(),
        registerDebugAdapterDescriptorFactory: jest.fn(),
      },
      DebugAdapterInlineImplementation: jest.fn().mockImplementation(() => {
        return {};
      }),
    };
  });
  
  jest.mock('../diagnostics', () => ({
    startGhcidOnHaskellOpen: jest.fn(),
  }));
  
  import * as vscode from 'vscode';
  import {
    activate,
    deactivate,
    HaskellConfigurationProvider,
    InlineDebugAdapterFactory,
  } from '../extension';
  import { startGhcidOnHaskellOpen } from '../diagnostics';
  
  const mockContext: any = {
    subscriptions: [],
    extensionPath: '/path/to/extension',
  };
  
  describe('Extension Activation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('registers commands, providers, and diagnostics', async () => {
      await activate(mockContext);
  
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'cardanovscDebugger.helloWorld',
        expect.any(Function)
      );
      expect(vscode.debug.registerDebugConfigurationProvider).toHaveBeenCalledWith(
        'haskell',
        expect.any(HaskellConfigurationProvider)
      );
      expect(vscode.debug.registerDebugAdapterDescriptorFactory).toHaveBeenCalledWith(
        'haskell',
        expect.any(InlineDebugAdapterFactory)
      );
      expect(startGhcidOnHaskellOpen).toHaveBeenCalledWith(mockContext);
    });
  });
  
  describe('Extension Deactivation', () => {
    it('logs deactivation message', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      deactivate();
      expect(logSpy).toHaveBeenCalledWith('Haskell Debugger extension deactivated');
    });
  });
  
  describe('HaskellConfigurationProvider', () => {
    let provider: HaskellConfigurationProvider;
  
    beforeEach(() => {
      jest.clearAllMocks();
      provider = new HaskellConfigurationProvider();
    });
  
    it('returns default config for Haskell files', async () => {
      const config = await provider.resolveDebugConfiguration(undefined, {
        type: 'haskell',
        name: 'Debug Haskell',
        request: 'launch',
      });
  
      expect(config).toEqual(
        expect.objectContaining({
          type: 'haskell',
          request: 'launch',
          program: 'cabal repl --repl-no-load',
          showIO: true,
        })
      );
    });
  
    it('returns undefined and shows error for non-Haskell files', async () => {
      Object.defineProperty(vscode.window, 'activeTextEditor', {
        value: {
          document: {
            languageId: 'javascript',
            fileName: 'index.js',
          },
        },
        configurable: true,
      });
  
      const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
  
      const config = await provider.resolveDebugConfiguration(undefined, {
        type: undefined,
        name: undefined,
        request: undefined,
      } as any);
  
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        "Please open a Haskell file or specify 'program' in your launch configuration"
      );
      expect(config).toBeUndefined();
    });
  });
  
  describe('InlineDebugAdapterFactory', () => {
    it('creates debug adapter descriptor successfully', () => {
      const factory = new InlineDebugAdapterFactory();
      const session = {} as vscode.DebugSession;
      const descriptor = factory.createDebugAdapterDescriptor(session);
      expect(descriptor).toBeDefined();
    });
  
    it('throws error when descriptor creation fails', () => {
      (vscode.DebugAdapterInlineImplementation as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create adapter');
      });
  
      const factory = new InlineDebugAdapterFactory();
  
      expect(() => factory.createDebugAdapterDescriptor({} as any)).toThrow(
        'Failed to create adapter'
      );
    });
  });
  





// new new  

// import * as vscode from 'vscode';
// import * as extension from '../extension';

// // Mocks
// jest.mock('vscode', () => {
//   return {
//     window: {
//       showInformationMessage: jest.fn(),
//       showWarningMessage: jest.fn(),
//       showErrorMessage: jest.fn(),
//       activeTextEditor: {
//         document: {
//           languageId: 'haskell',
//           fileName: 'Main.hs'
//         }
//       }
//     },
//     commands: {
//       registerCommand: jest.fn(() => ({
//         dispose: jest.fn()
//       }))
//     },
//     debug: {
//       registerDebugConfigurationProvider: jest.fn(() => ({
//         dispose: jest.fn()
//       })),
//       registerDebugAdapterDescriptorFactory: jest.fn(() => ({
//         dispose: jest.fn()
//       })),
//       DebugAdapterInlineImplementation: jest.fn()
//     },
//     workspace: {
//       workspaceFolders: [{ uri: { fsPath: '/workspace' } }]
//     },
//     extensions: {},
//   };
// });

// jest.mock('child_process', () => ({
//   execFile: jest.fn((scriptPath, callback) => {
//     // Simulate a successful call
//     callback(null, 'Installed', '');
//   })
// }));

// jest.mock('os', () => ({
//   platform: jest.fn(() => 'linux')
// }));

// jest.mock('../diagnostics', () => ({
//   startGhcidOnHaskellOpen: jest.fn()
// }));

// jest.mock('../utils/webview', () => ({
//   config_disposal: jest.fn()
// }));

// // Begin tests
// describe('Extension Activate', () => {
//   const mockContext: any = {
//     extensionPath: '/mock-extension',
//     subscriptions: []
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should activate the extension without crashing', async () => {
//     await extension.activate(mockContext);

//     expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
//       'cardanovscDebugger.helloWorld',
//       expect.any(Function)
//     );

//     expect(vscode.debug.registerDebugConfigurationProvider).toHaveBeenCalled();
//     expect(vscode.debug.registerDebugAdapterDescriptorFactory).toHaveBeenCalled();
//     expect(extension.isCabalAvailable).toBe(true);
//   });


//   it('should create default config for Haskell files', () => {
//     const provider = new extension.HaskellConfigurationProvider();

//     const config = provider['createDefaultConfig']();
//     expect(config?.type).toBe('haskell');
//     expect(config?.program).toContain('cabal');
//     expect(config?.cwd).toBe('/workspace');
//   });

//   it('should return undefined for non-Haskell files', async () => {
//     (vscode.window.activeTextEditor!.document.fileName as any) = 'Main.txt';
//     const provider = new extension.HaskellConfigurationProvider();
//     const config = provider['createDefaultConfig']();

//     expect(config).toBeUndefined();
//     expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
//       expect.stringContaining('Active file must be a Haskell source file')
//     );
//   });
// });
