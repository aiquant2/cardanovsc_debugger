
// jest.mock('child_process', () => ({
//   spawn: jest.fn(() => ({
//     stdout: { on: jest.fn() },
//     stderr: { on: jest.fn() },
//     on: jest.fn(),
//     removeAllListeners: jest.fn(),
//     kill: jest.fn(),
//   })),
// }));


// import { HaskellDebugSession } from '../debugAdapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import { ChildProcess } from 'child_process';

// // Mocking modules
// jest.mock('child_process', () => ({
//     spawn: jest.fn(),
// }));


// jest.mock('fs/promises', () => ({
//     readFile: jest.fn(),
// }));

// console.log("hii from debug");

// beforeEach(() => {
//   jest.clearAllMocks();
// });

// // MockOutputEvent modified to match the actual OutputEvent structure
// class MockOutputEvent {
//   constructor(public body: string, public category: string) {}
//   event = 'output'; // Adding the event property
//   seq = 0;          // Adding the seq property
//   type = 'event';   // Adding the type property
// }

// // Mocks for the DebugSession methods
// const sendResponse = jest.fn();
// const sendEvent = jest.fn();
// const sendErrorResponse = jest.fn();

// // Initialize session for testing

// HaskellDebugSession.sendErrorResponse = sendErrorResponse;

// const mockSession = {
//   launchRequest: async (_response: any, args: { program: string; }) => {
//     if (args.program !== 'cabal repl --repl-no-load') {
//       sendEvent({
//         body: {
//           category: 'console',
//           output: 'Please set "program": "cabal repl --repl-no-load" in launch.json\n',
//         },
//         event: 'output',
//         type: 'event',
//       });
//     }
//   }
// };



// describe('HaskellDebugSession', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

  
//   test('launchRequest should handle invalid program command', async () => {
//     const args = {
//       program: 'invalid program',
//     };

//     const response: DebugProtocol.LaunchResponse = {
//         body: {},
//         request_seq: 0,
//         success: false,
//         command: '',
//         seq: 0,
//         type: ''
//     };

//     await mockSession.launchRequest(response, args);

// expect(sendEvent).toHaveBeenCalledWith(expect.objectContaining({
//   body: {
//     category: 'console',
//     output: 'Please set "program": "cabal repl --repl-no-load" in launch.json\n',
//   },
//   event: 'output',
//   type: 'event',
// }));

// });

// // launch request

//   // test('launchRequest should spawn ghci process', async () => {
//   //   const args = {
//   //     name: 'haskell',
//   //     type: 'haskell',
//   //     request: 'launch',
//   //     program: 'cabal repl --repl-no-load',
//   //     cwd: '/home/kunal-kumar/cardanovsc_debugger/test/app/',
//   //   };

//   //   const response: DebugProtocol.LaunchResponse = {
//   //     body: {},
//   //     request_seq: 0,
//   //     success: false,
//   //     command: '',
//   //     seq: 0,
//   //     type: ''
//   //   };

//   //   await mockSession.launchRequest(response, args);

//   //   expect(child_process.spawn).toHaveBeenCalledWith('cabal', ['repl', '--repl-no-load'], {
//   //     cwd: '/home/kunal-kumar/cardanovsc_debugger/test/app/',
//   //     shell: true,
//   //   });
//   //   expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Launching GHCi...\n', 'console'));
//   //   expect(sendResponse).toHaveBeenCalled();
//   // });

//   // restart request

//   test('restartRequest should restart the debug session', () => {
//     const response: DebugProtocol.RestartResponse = {
//       body: {},
//       request_seq: 0,
//       success: false,
//       command: '',
//       seq: 0,
//       type: 'haskell'
//     };

//     const args: DebugProtocol.RestartArguments = {};

//     const mockSendEvent = jest.fn();
//     const mockSendResponse = jest.fn();

//     HaskellDebugSession.sendEvent = mockSendEvent;
//     HaskellDebugSession.sendResponse = mockSendResponse;


//     expect(mockSendEvent).toHaveBeenCalledWith(expect.objectContaining({
//       body: {
//         output: 'Restarting debug session...\n',
//         category: 'console'
//       },
//       event: 'output',
//       type: 'event'
//     }));
    
//     expect(mockSendResponse).toHaveBeenCalledWith(response);
//   });

// // test evaluate request 

//   test('evaluateRequest should evaluate expression', () => {
//     const response: DebugProtocol.EvaluateResponse = {
//       body: { result: '', variablesReference: 0 },
//       request_seq: 0,
//       success: false,
//       command: '',
//       seq: 0,
//       type: ''
//     };

//     const args: DebugProtocol.EvaluateArguments = { expression: '2 + 2' };

//     // Mock stdin.write
//     const mockWrite = jest.fn();
  

//     // Mock sendResponse
//     const mockSendResponse = jest.fn();
//     HaskellDebugSession.sendResponse = mockSendResponse;

//     // Call the method under test

//     // Assertions
//     expect(mockWrite).toHaveBeenCalledWith('2 + 2\n');
//     expect(mockSendResponse).toHaveBeenCalledWith(expect.objectContaining({
//       body: { result: '4', variablesReference: 0 },
//       success: true
//     }));
//   });

//   // Mocking the functions directly
// jest.mock('/home/kunal-kumar/cardanovsc_debugger/src/test/debugadapter.test.ts', () => ({
//   ...jest.requireActual('/home/kunal-kumar/cardanovsc_debugger/src/debugAdapter.ts').HaskellDebugSession,
//   sendEvent: jest.fn(),
//   sendResponse: jest.fn(),
// }));

// test('disconnectRequest should clean up process', () => {
//   const response: DebugProtocol.DisconnectResponse = {
//     body: {},
//     request_seq: 0,
//     success: false,
//     command: '',
//     seq: 0,
//     type: '',
//   };

//   const args: DebugProtocol.DisconnectArguments = {};

//   class TestSession extends HaskellDebugSession {
//     // Mocked methods for process cleanup
//     public mockRemoveAllListeners = jest.fn();
//     public mockKill = jest.fn();

//     constructor() {
//       super();
      
//       // Directly mock the `ghciProcess` for testing.
//       this.ghciProcess = {
//         removeAllListeners: this.mockRemoveAllListeners,
//         kill: this.mockKill,
//       } as unknown as ChildProcess; // Mock `ChildProcess` properly
//     }

//     // Override sendEvent and sendResponse to mock implementations
//     public override sendEvent = jest.fn();
//     public override sendResponse = jest.fn();

//     // Now we are implementing this method for the test
//     public testDisconnect(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments) {
//       // Perform the actual clean-up logic you want to test
//       this.ghciProcess?.removeAllListeners();
//       this.ghciProcess?.kill();
      
//       // Call sendEvent and sendResponse to simulate response
//       this.sendEvent({
//         body: { output: 'Process cleaned up\n', category: 'console' },
//       });
//       this.sendResponse(response);
//     }
//   }

//   // Create instance of the TestSession
//   const session = new TestSession();

//   // Call the disconnectRequest method
//   session.testDisconnect(response, args);

//   // Assertions: Now we can safely test the mocked `ghciProcess`
//   expect(session.ghciProcess!.removeAllListeners).toHaveBeenCalled();
//   expect(session.ghciProcess!.kill).toHaveBeenCalled();

//   // Ensure sendEvent and sendResponse are called with correct parameters
//   expect(session.sendEvent).toHaveBeenCalledWith(
//     expect.objectContaining({
//       body: { output: 'Process cleaned up\n', category: 'console' },
//     }),
//   );
//   expect(session.sendResponse).toHaveBeenCalledWith(response);
// });

// });




  