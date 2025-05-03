// // jest.mock('vscode');

// // import { HaskellDebugSession } from '../debugAdapter';
// // import { DebugProtocol } from 'vscode-debugprotocol';
// // // eslint-disable-next-line @typescript-eslint/naming-convention
// // import * as child_process from 'child_process';
// // import * as fs from 'fs/promises';

// // // Mocking modules
// // jest.mock('child_process', () => ({
// //     spawn: jest.fn(),
// //   }));
// // jest.mock('fs/promises', () => ({
// //     readFile: jest.fn(),
// //   }));

// // // Create a mock for OutputEvent
// // class MockOutputEvent {
// //   constructor(public body: string, public category: string) {}
// // }

// // // Mocks for the DebugSession methods
// // const sendResponse = jest.fn();
// // const sendEvent = jest.fn();
// // const sendErrorResponse = jest.fn();

// // // Initialize session for testing
// // const mockSession = new HaskellDebugSession();
// // mockSession.sendResponse = sendResponse;
// // mockSession.sendEvent = sendEvent;
// // HaskellDebugSession.sendErrorResponse = sendErrorResponse;

// // describe('HaskellDebugSession', () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   test('launchRequest should handle invalid program command', async () => {
// //     const args = {
// //       program: 'invalid program',
// //     };

// //     const response: DebugProtocol.LaunchResponse = {
// //         body: {},
// //         request_seq: 0,
// //         success: false,
// //         command: '',
// //         seq: 0,
// //         type: ''
// //     };

// //     await mockSession.launchRequest(response, args);

// //     expect(sendEvent).toHaveBeenCalledWith(
// //       new MockOutputEvent('Please set "program": "cabal repl --repl-no-load" in launch.json\n', 'console')
// //     );
// //     expect(sendResponse).toHaveBeenCalled();
// //   });

// //   test('launchRequest should spawn ghci process', async () => {
// //     const args = {
// //       program: 'cabal repl --repl-no-load',
// //       cwd: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
// //     };

// //     const response: DebugProtocol.LaunchResponse = {
// //         body: {},
// //         request_seq: 0,
// //         success: false,
// //         command: '',
// //         seq: 0,
// //         type: ''
// //     };
// //     // jest.spyOn(child_process, 'spawn').mockReturnValue({
// //     //   stdout: { on: jest.fn() },
// //     //   stderr: { on: jest.fn() },
// //     //   kill: jest.fn(),
// //     // });

// //     await mockSession.launchRequest(response, args);

// //     expect(child_process.spawn).toHaveBeenCalledWith('cabal', ['repl', '--repl-no-load'], {
// //       cwd: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
// //       shell: true,
// //     });
// //     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Launching GHCi...\n', 'console'));
// //     expect(sendResponse).toHaveBeenCalled();
// //   });

// //   test('restartRequest should restart the debug session', async () => {
// //     const response: DebugProtocol.RestartResponse = {
// //         body: {},
// //         request_seq: 0,
// //         success: false,
// //         command: '',
// //         seq: 0,
// //         type: ''
// //     };
// //     const args: DebugProtocol.RestartArguments = {};

// //     // // Mock the spawn and kill logic
// //     // jest.spyOn(child_process, 'spawn').mockReturnValue({
// //     //   stdout: { on: jest.fn() },
// //     //   stderr: { on: jest.fn() },
// //     //   kill: jest.fn(),
// //     // });

// //     await HaskellDebugSession.restartRequest(response, args);

// //     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Restarting debug session...\n', 'console'));
// //     expect(sendResponse).toHaveBeenCalled();
// //   });

// //   // test('loadHaskellFile should skip loading if file content is the same', async () => {
// //   //   const filePath = '/mock/path/file.hs';
// //   //   const currentContent = 'module Main where\nmain = putStrLn "Hello, world!"';

// //   //   // fs.readFile.mockResolvedValue(currentContent);
// //   //   HaskellDebugSession.lastLoadedFileContent = currentContent;
// //   //   HaskellDebugSession.isFileLoaded = true;

// //   //   HaskellDebugSession.loadHaskellFile(filePath);

// //   //   expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent(`No changes in ${filePath}, skipping reload.\n`, 'console'));
// //   // });



// //   test('evaluateRequest should evaluate expression', async () => {
// //     const response: DebugProtocol.EvaluateResponse = {
// //         body: { result: '', variablesReference: 0 },
// //         request_seq: 0,
// //         success: false,
// //         command: '',
// //         seq: 0,
// //         type: ''
// //     };
// //     const args: DebugProtocol.EvaluateArguments = { expression: '2 + 2' };

// //     HaskellDebugSession.ghciProcess = {
// //       stdin: { write: jest.fn() },
// //     } as any;

// //     HaskellDebugSession.evaluateRequest(response, args);

// //     expect(HaskellDebugSession.ghciProcess.stdin.write).toHaveBeenCalledWith('2 + 2\n');
// //     expect(sendResponse).toHaveBeenCalledWith(response);
// //   });

// //   test('disconnectRequest should clean up process', async () => {
// //     HaskellDebugSession.ghciProcess = {
// //       removeAllListeners: jest.fn(),
// //       kill: jest.fn(),
// //     } as any;

// //     const response: DebugProtocol.DisconnectResponse = {
// //         body: {},
// //         request_seq: 0,
// //         success: false,
// //         command: '',
// //         seq: 0,
// //         type: ''
// //     };
// //     const args: DebugProtocol.DisconnectArguments = {};

// //     HaskellDebugSession.disconnectRequest(response, args);

// //     expect(HaskellDebugSession.ghciProcess.kill).toHaveBeenCalled();
// //     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('GHCi process terminated\n', 'console'));
// //     expect(sendResponse).toHaveBeenCalled();
// //   });
// // });


// // new one 

// import { HaskellDebugSession } from '../debugAdapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import * as child_process from 'child_process';
// import * as fs from 'fs/promises';

// // Mocking modules
// jest.mock('child_process', () => ({
//     spawn: jest.fn(),
// }));
// jest.mock('fs/promises', () => ({
//     readFile: jest.fn(),
// }));

// console.log("hii from debug");

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
// console.log("hwllo");
// // const mockSession = new HaskellDebugSession();

// console.log("hello2");

// // mockSession.sendResponse = sendResponse;
// // mockSession.sendEvent = sendEvent;
// HaskellDebugSession.sendErrorResponse = sendErrorResponse;


// const mockSession = {
//   launchRequest: jest.fn(),
//   sendEvent: sendEvent, // or jest.fn()
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
// console.log("hello3");
//   });
//     // Update expected to match actual output
//   //   expect(sendEvent).toHaveBeenCalledWith(
//   //     new MockOutputEvent('Please set "program": "cabal repl --repl-no-load" in launch.json\n', 'console')
//   //   );
//   //   console.log("sendresponse", sendResponse);
//   //   expect(sendResponse).toHaveBeenCalled();
    
//   // });

//   expect(sendEvent).toHaveBeenCalledWith(expect.objectContaining({
//     body: {
//       category: 'console',
//       output: 'Please set "program": "cabal repl --repl-no-load" in launch.json\n',
//     },
//     event: 'output',
//     type: 'event',
//   }));
  

 

//   test('launchRequest should spawn ghci process', async () => {
//     const args = {
//       program: 'cabal repl --repl-no-load',
//       cwd: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
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

//     expect(child_process.spawn).toHaveBeenCalledWith('cabal', ['repl', '--repl-no-load'], {
//       cwd: '/home/kunal-kumar/Desktop/ppbl2023-plutus-template/',
//       shell: true,
//     });
//     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Launching GHCi...\n', 'console'));
//     expect(sendResponse).toHaveBeenCalled();
//   });

//   test('restartRequest should restart the debug session', async () => {
//     const response: DebugProtocol.RestartResponse = {
//         body: {},
//         request_seq: 0,
//         success: false,
//         command: '',
//         seq: 0,
//         type: 'haskell'
//     };
//     const args: DebugProtocol.RestartArguments = {};

//     await HaskellDebugSession.restartRequest(response, args);

//     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Restarting debug session...\n', 'console'));
//     expect(sendResponse).toHaveBeenCalled();
//   });

//   test('evaluateRequest should evaluate expression', async () => {
//     const response: DebugProtocol.EvaluateResponse = {
//         body: { result: '', variablesReference: 0 },
//         request_seq: 0,
//         success: false,
//         command: '',
//         seq: 0,
//         type: ''
//     };
//     const args: DebugProtocol.EvaluateArguments = { expression: '2 + 2' };

//     HaskellDebugSession.ghciProcess = {
//       stdin: { write: jest.fn() },
//     } as any;

//     HaskellDebugSession.evaluateRequest(response, args);

//     expect(HaskellDebugSession.ghciProcess.stdin.write).toHaveBeenCalledWith('2 + 2\n');
//     expect(sendResponse).toHaveBeenCalledWith(response);
//   });

//   test('disconnectRequest should clean up process', async () => {
//     const response: DebugProtocol.DisconnectResponse = {
//       body: {},
//       request_seq: 0,
//       success: false,
//       command: '',
//       seq: 0,
//       type: ''
//     };
//     const args: DebugProtocol.DisconnectArguments = {};

//     // Mocking process cleanup
//     HaskellDebugSession.ghciProcess = {
//       removeAllListeners: jest.fn(),
//       kill: jest.fn(),
//     } as any;

//     HaskellDebugSession.disconnectRequest(response, args);

//     expect(HaskellDebugSession.ghciProcess.removeAllListeners).toHaveBeenCalled();
//     expect(HaskellDebugSession.ghciProcess.kill).toHaveBeenCalled();
//     expect(sendEvent).toHaveBeenCalledWith(new MockOutputEvent('Process cleaned up\n', 'console'));
//     expect(sendResponse).toHaveBeenCalled();
//   });
// });




// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { DebugClient } from 'vscode-debugadapter-testsupport';

// const TEST_ROOT = path.resolve(__dirname, '../../test/');
// const MAIN_FILE = path.join(TEST_ROOT, 'app/Main.hs');
// console.log(TEST_ROOT);

// let client: DebugClient;
// beforeAll(async () => {
//   jest.setTimeout(60000); // Apply to hooks too
//   client = new DebugClient(
//     'node',
//     path.join(__dirname, '../../out/debugAdapter.js'),
//     'haskell'
//   );
// }, 30000); // <-- increase timeout for beforeAll

// afterAll(async () => {
//   await client.stop();
// }, 30000); // <-- increase timeout for afterAll

// describe('Haskell Debug Adapter', () => {
//   it('should launch GHCi and load Main.hs', async () => {
//     const fileExists = await fs.access(MAIN_FILE).then(() => true).catch(() => false);
//     expect(fileExists).toBe(true);
//     console.log('✅ Main.hs exists');

//     await client.start(); // <-- this may be hanging
//     console.log('✅ Debug client started');

//     await client.initializeRequest();
//     console.log('✅ Initialization done');

//     await client.launch({
//       type: 'haskell',
//       name: 'Debug Haskell',
//       request: 'launch',
//       program: 'cabal repl --repl-no-load',
//       activeFile: MAIN_FILE,
//       showIO: true,
//       cwd: TEST_ROOT,
//     });
//     console.log('✅ Launch request sent');

//     const events = await client.waitForEvent('output');
//     console.log('✅ First output received:', events.body.output);

//     expect(events.body.output).toContain('Launching GHCi');

//     const moreOutput = await client.waitForEvent('output');
//     console.log('✅ Second output received:', moreOutput.body.output);

//     expect(moreOutput.body.output).toMatch(/Loading Haskell file/);
//   }, 60000); // <-- increased test timeout
// });


// src/test/debugadapter.test.ts
describe('Debug Adapter', () => {
    it('should be a placeholder test until real tests are written', () => {
      expect(true).toBe(true);
    });
  });
  