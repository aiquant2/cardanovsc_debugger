// import * as path from 'path';
// import * as fs from 'fs/promises';
// import * as vscode from 'vscode';
// import { DebugClient } from 'vscode-debugadapter-testsupport';
// import { DebugProtocol } from 'vscode-debugprotocol';

// const PROJECT_ROOT = path.resolve(__dirname, '../../test');
// const MAIN_FILE = path.join(PROJECT_ROOT, 'app', 'Main.hs');

// suite('Haskell Debug Adapter', async function () {
//   this.timeout(30000); // suite timeout

//   let client: DebugClient;


//     // Start debug client
//     client = new DebugClient(
//       'node',
//       path.resolve(__dirname, '../../out/debugAdapter.js'),
//       'haskell'
//     );

//     await client.start();

//     // Open the file in VSCode
//     const doc = await vscode.workspace.openTextDocument(MAIN_FILE);
//     await vscode.window.showTextDocument(doc);
  

//   after(async function () {
//     this.timeout(5000);
//     await client.stop();
//   });

//   test('should launch GHCi and load Main.hs', async function () {
//     this.timeout(20000);

//     await client.launch({
    
//       type: "haskell",
//       request: "launch",
//       name: "haskell Debug",
//       program: "cabal repl --repl-no-load",
//       activeFile: MAIN_FILE,
//       showIO: true,
//       cwd: PROJECT_ROOT
//     });

//     const stoppedEvent = await client.waitForEvent('stopped') as DebugProtocol.StoppedEvent;
//     console.log('[TEST] Stopped event received:', stoppedEvent);

   
//     // If we reached here, GHCi has launched and loaded successfully
//   });
// });

// import * as path from 'path';
// import * as fs from 'fs/promises';
// import * as vscode from 'vscode';
// import { DebugClient } from 'vscode-debugadapter-testsupport';
// import { DebugProtocol } from 'vscode-debugprotocol';

// const PROJECT_ROOT = path.resolve(__dirname, '../../test');
// const MAIN_FILE = path.join(PROJECT_ROOT, 'app', 'Main.hs');

// suite('Haskell Debug Adapter', async function () {
//   this.timeout(30000); // suite timeout

//   let client: DebugClient;

//   setup(async function() {
//     // Start debug client
//     client = new DebugClient(
//       'node',
//       path.resolve(__dirname, '../../out/debugAdapter.js'),
//       'haskell'
//     );

//     await client.start();

//     // Open the file in VSCode
//     const doc = await vscode.workspace.openTextDocument(MAIN_FILE);
//     await vscode.window.showTextDocument(doc);
//   });

//   after(async function () {
//     this.timeout(5000);
//     if (client) {
//       await client.stop();
//     }
//   });

//   test('should launch GHCi and load Main.hs', async function () {
//     this.timeout(20000);

//     await client.launch({
//       type: "haskell",
//       request: "launch",
//       name: "haskell Debug",
//       program: "cabal repl --repl-no-load",
//       activeFile: MAIN_FILE,
//       showIO: true,
//       cwd: PROJECT_ROOT
//     });

//     const stoppedEvent = await client.waitForEvent('stopped') as DebugProtocol.StoppedEvent;
//     console.log('[TEST] Stopped event received:', stoppedEvent);
    
//     // Additional assertions can be added here to verify the debug session state
//   });
// });

// import * as path from 'path';
// import * as vscode from 'vscode';
// import { DebugClient } from 'vscode-debugadapter-testsupport';
// import { suite, test } from 'mocha';

// suite('Haskell Debug Adapter', () => {
//     const PROJECT_ROOT = path.join(__dirname, '..', '..', 'test');
//     const MAIN_FILE = path.join(PROJECT_ROOT, 'app', 'Main.hs');
    
//     let dc: DebugClient;
// console.log("1");

//     setup(async () => {
//         console.log("2");
        
//         // Open the project folder first
//         await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(PROJECT_ROOT));
        
//         // Then open the specific file
//         const doc = await vscode.workspace.openTextDocument(MAIN_FILE);
//         await vscode.window.showTextDocument(doc);

//         // Initialize debug client
//         dc = new DebugClient(
//             'node',
//             path.join(__dirname, '..', '..', 'out', 'debugAdapter.js'),
//             'haskell'
//         );
//         await dc.start();
//     });
// console.log("3");

//     teardown(async () => {
//         await dc.stop();
//     });

//     test('should launch GHCi and load Main.hs', async () => {
//         await dc.launch({
//             type: "haskell",
//             name: "Haskell Debug Test",
//             request: "launch",
//             program: "cabal repl --repl-no-load",
//             activeFile: MAIN_FILE,
//             cwd: PROJECT_ROOT,
//             showIO: true
//         });

//         // Wait for initialization
//         await dc.waitForEvent('initialized');
        
//         // Wait for stopped event (breakpoint, pause, etc)
//         const stoppedEvent = await dc.waitForEvent('stopped');
//         console.log('Debugger stopped:', stoppedEvent);
//         console.log("4");
        
//     });
// });

// import * as path from 'path';
// import * as vscode from 'vscode';
// import { DebugClient } from 'vscode-debugadapter-testsupport';
// import { suite, test } from 'mocha';
// import assert from 'assert';
// import("chai").then((chai) => {
//     const expect = chai.expect;
    
    
//     const PROJECT_ROOT = path.join(__dirname, '..', '..', 'test');
//     const MAIN_FILE = path.join(PROJECT_ROOT, 'app', 'Main.hs');
    
//     let dc: DebugClient;
//     setup(async function() {
//         console.log("[SETUP] Initializing debug client");
//         dc = new DebugClient(
//             'node',
//             path.join(__dirname, '..', '..', 'out', 'src', 'debugAdapter.js'),
//             'haskell'
//         );
//         await dc.start();

//         console.log("[SETUP] Opening workspace");
//         const openFolderSuccess = await vscode.commands.executeCommand(
//             'vscode.openFolder', 
//             vscode.Uri.file(PROJECT_ROOT)
//         );
//         expect(openFolderSuccess).to.be.true;
        
//         console.log("[SETUP] Opening test file");
//         const doc = await vscode.workspace.openTextDocument(MAIN_FILE);
//         await vscode.window.showTextDocument(doc);
//     });
//     teardown(async function() {
//         console.log("[TEARDOWN] Stopping debug client");
//         await dc.stop();
//     });
//     suite('initialize', () => {

//         test('should return supported features', () => {
//             return dc.initializeRequest().then(response => {
//                 response.body = response.body || {};
//                 assert.equal(response.body.supportsConfigurationDoneRequest, true);
//             });
//         });
    
//         test('should produce error for invalid \'pathFormat\'', done => {
//             dc.initializeRequest({
//                 adapterID: 'haskell',
//                 linesStartAt1: true,
//                 columnsStartAt1: true,
//                 pathFormat: 'url'
//             }).then(response => {
//                 done(new Error("does not report error on invalid 'pathFormat' attribute"));
//             }).catch(err => {
//                 // error expected
//                 done();
//             });
//         });
//     });
//     suite('Haskell Debug Adapter', function() {
//         this.timeout(30000); // Suite-level timeout

  


 

//     test('should launch GHCi and load Main.hs', async function() {
//         this.timeout(20000); // Test-specific timeout

//         console.log("[TEST] Launching debug session");
//         const launchResponse = await dc.launch({
//             type: "haskell",
//             name: "Haskell Debug Test",
//             request: "launch",
//             program: "cabal repl --repl-no-load",
//             activeFile: MAIN_FILE,
//             cwd: PROJECT_ROOT,
//             showIO: true
//         });
//         expect(launchResponse).to.not.be.undefined;

//         console.log("[TEST] Waiting for initialized event");
//         const initializedEvent = await dc.waitForEvent('initialized');
//         expect(initializedEvent).to.exist;
//         expect(initializedEvent.type).to.equal('event');
//         expect(initializedEvent.event).to.equal('initialized');

//         console.log("[TEST] Verifying GHCi output");
//         const output = await dc.waitForEvent('Prelude>', 10000);
//         expect(output).to.satisfy((out: string) => 
//             out.includes('Prelude>') || out.includes('Ok,') || out.includes('*Main>'),
//             'Expected GHCi prompt not found'
//         );

//         console.log("[TEST] Verifying file load");
//         const loadOutput = await dc.waitForEvent(`Loading Haskell file: ${MAIN_FILE}`, 5000);
//         expect(loadOutput).to.include(
//             `Loading Haskell file: ${MAIN_FILE}`,
//             'File loading message not found'
//         );

//         console.log("[TEST] Completed successfully");
//     });

// });

// });


import * as path from 'path';
import * as vscode from 'vscode';
import { DebugClient } from 'vscode-debugadapter-testsupport';
import { suite, test } from 'mocha';

const PROJECT_ROOT = path.join(__dirname, '..', '..', 'test');
const MAIN_FILE = path.join(PROJECT_ROOT, 'app', 'Main.hs');
const DEBUG_ADAPTER = path.join(__dirname, '..', '..', 'out','debugAdapter.js');
import("chai").then((chai) => {
    const expect = chai.expect;
  
suite('Haskell Debug Adapter', function() {
    this.timeout(30000); // Suite-level timeout

    let dc: DebugClient;

    setup(async function() {
        console.log("[SETUP] Initializing debug client");
        dc = new DebugClient('node', DEBUG_ADAPTER, 'haskell');
        await dc.start();

        console.log("[SETUP] Opening workspace");
        const openFolderSuccess = await vscode.commands.executeCommand(
            'vscode.openFolder', 
            vscode.Uri.file(PROJECT_ROOT)
        );
        expect(openFolderSuccess).to.be.true;
        
        console.log("[SETUP] Opening test file");
        const doc = await vscode.workspace.openTextDocument(MAIN_FILE);
        await vscode.window.showTextDocument(doc);
    });

    teardown(async function() {
        console.log("[TEARDOWN] Stopping debug client");
        await dc.stop();
    });

    suite('initialize', function() {
        test('should return supported features', async function() {
            const response = await dc.initializeRequest();
            response.body = response.body || {};
            expect(response.body.supportsConfigurationDoneRequest).to.be.true;
            expect(response.body.supportsFunctionBreakpoints).to.be.true;
            expect(response.body.supportsRestartRequest).to.be.true;
        });

        test('should produce error for invalid pathFormat', async function() {
            try {
                await dc.initializeRequest({
                    adapterID: 'haskell',
                    linesStartAt1: true,
                    columnsStartAt1: true,
                    pathFormat: 'url' as any // Deliberately wrong type
                });
                expect.fail('Should have thrown error for invalid pathFormat');
            } catch (err) {
                expect(err).to.exist;
            }
        });
    });

    suite('launch', function() {
        test('should launch GHCi and load Main.hs', async function() {
            this.timeout(20000);

            console.log("[TEST] Launching debug session");
            const launchResponse = await dc.launch({
                type: "haskell",
                name: "Haskell Debug Test",
                request: "launch",
                program: "cabal repl --repl-no-load",
                activeFile: MAIN_FILE,
                cwd: PROJECT_ROOT,
                showIO: true
            });
            expect(launchResponse).to.exist;

            console.log("[TEST] Waiting for initialized event");
            const initializedEvent = await dc.waitForEvent('initialized');
            expect(initializedEvent).to.exist;
            expect(initializedEvent.type).to.equal('event');
            expect(initializedEvent.event).to.equal('initialized');

            console.log("[TEST] Verifying GHCi output");
            const output = await dc.waitForEvent('Prelude>', 10000);
            expect(output).to.satisfy((out: string) => 
                out.includes('Prelude>') || out.includes('Ok,') || out.includes('*Main>'),
                'Expected GHCi prompt not found'
            );

            console.log("[TEST] Verifying file load");
            const loadOutput = await dc.waitForEvent(`Loading Haskell file: ${MAIN_FILE}`, 5000);
            expect(loadOutput).to.include(
                `Loading Haskell file: ${MAIN_FILE}`,
                'File loading message not found'
            );
        });

        test('should handle stop on entry', async function() {
            this.timeout(20000);

            await dc.launch({
                type: "haskell",
                name: "Stop on Entry Test",
                request: "launch",
                program: "cabal repl --repl-no-load",
                activeFile: MAIN_FILE,
                cwd: PROJECT_ROOT,
                stopOnEntry: true,
                showIO: true
            });

            await dc.waitForEvent('initialized');
            await dc.configurationDoneRequest();

            const stoppedEvent = await dc.waitForEvent('stopped');
            expect(stoppedEvent).to.exist;
            expect(stoppedEvent.body.reason).to.equal('entry');
        });
    });

    suite('invalid requests', function() {
        test('unknown request should produce error', async function() {
            try {
                await (dc as any).send('illegal_request');
                expect.fail('Should have thrown error for unknown request');
            } catch (err) {
                expect(err).to.exist;
            }
        });
    });
});});