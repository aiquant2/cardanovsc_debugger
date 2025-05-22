
jest.mock('vscode', () => {
  const original = jest.requireActual('vscode');
  return {
    ...original,
    window: {
      ...original.window,
      createStatusBarItem: jest.fn(() => ({
        text: '',
        show: jest.fn(),
      })),
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      activeTextEditor: {
        document: {
          languageId: 'haskell',
          fileName: '/home/kunal-kumar/cardanovsc_debugger/test/app/Main.hs',
        },
      },
    },
    StatusBarAlignment: {
      Left: 1,
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
      return { /* stub methods if needed */ };
    }),
  };
});

import * as vscode from 'vscode';
import { activate, deactivate, HaskellConfigurationProvider, InlineDebugAdapterFactory } from '../extension';
import { startGhcidOnHaskellOpen } from '../diagnostics';

jest.mock('../diagnostics', () => ({
  startGhcidOnHaskellOpen: jest.fn(),
}));

const mockContext: any = { subscriptions: [] };

describe('Extension Activate', () => {
  it('should register commands and debug providers', () => {
    activate(mockContext);

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'cardanovscDebugger.helloWorld',
      expect.any(Function)
    );
    expect(vscode.debug.registerDebugConfigurationProvider).toHaveBeenCalled();
    expect(vscode.debug.registerDebugAdapterDescriptorFactory).toHaveBeenCalled();
  });
});

describe('Extension Deactivate', () => {
  it('should log deactivation', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    deactivate();
    expect(logSpy).toHaveBeenCalledWith('Haskell Debugger extension deactivated');
  });
});

describe('HaskellConfigurationProvider', () => {
  let provider: HaskellConfigurationProvider;
  jest.clearAllMocks();
  beforeEach(() => {
    provider = new HaskellConfigurationProvider();
    jest.spyOn(vscode.window, 'showErrorMessage').mockImplementation(jest.fn());
  });

  it('should return default config for .hs files', async () => {
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
      })
    );
  });



  it('should show error for unsupported file types', async () => {
    Object.defineProperty(vscode.window, 'activeTextEditor', {
      value: {
        document: { languageId: 'javascript', fileName: 'file.js' },
      },
      configurable: true,
    });
  
    (vscode.window.showErrorMessage as jest.Mock).mockClear();
  
    const config = await provider.resolveDebugConfiguration(undefined, {
      type: undefined,
      name: undefined,
      request: undefined,
    } as any); // simulate empty config
  
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Active file must be a Haskell source file (.hs)'
    );
    expect(config).toBeUndefined();
  });
  
});

describe('InlineDebugAdapterFactory', () => {
  it('should create debug adapter descriptor', () => {
    const factory = new InlineDebugAdapterFactory();
    const session = {} as vscode.DebugSession;
    const descriptor = factory.createDebugAdapterDescriptor(session);
    expect(descriptor).toBeDefined();
  });

  it('should log error on failure', () => {
    const errorFactory = new InlineDebugAdapterFactory();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (vscode.DebugAdapterInlineImplementation as jest.Mock).mockImplementation(() => {
      throw new Error('Debug adapter creation failed');
    });

    expect(() => errorFactory.createDebugAdapterDescriptor({} as any)).toThrow(
      'Debug adapter creation failed'
    );
    expect(spy).toHaveBeenCalledWith('Failed to create debug adapter:', expect.any(Error));
  });
});

