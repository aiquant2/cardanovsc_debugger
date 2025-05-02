import * as assert from 'assert';
import * as vscode from 'vscode';
import { HaskellDebugSession } from '../../debugAdapter';
import { HaskellLaunchRequestArguments } from '../../debugAdapter';
import { DebugProtocol } from "vscode-debugprotocol";

suite('Haskell Debug Adapter Tests', () => {
    let debugSession: HaskellDebugSession;

    setup(() => {
        debugSession = new HaskellDebugSession();
    });

    teardown(() => {
        // Clean up if needed
    });

    test('Debug session initializes correctly', () => {
        const response = { body: {} } as DebugProtocol.InitializeResponse;
        HaskellDebugSession.initializeRequest(response, {} as DebugProtocol.InitializeRequestArguments);
        
       if(response.body){
        assert.ok(response.body.supportsConfigurationDoneRequest, 'Should support configuration done request');
        assert.ok(response.body.supportsEvaluateForHovers, 'Should support evaluate for hovers');
        assert.ok(response.body.supportsFunctionBreakpoints, 'Should support function breakpoints');
        assert.ok(response.body.supportsRestartRequest, 'Should support restart request');
       }
    });

    test('Launch request validates program command', async () => {
        const response = {} as DebugProtocol.LaunchResponse;
        const args: HaskellLaunchRequestArguments = {

            program: 'invalid-command',
        
        };

        await debugSession.launchRequest(response, args);
        
        // We can't directly check the error response, but we can verify the behavior
        // through the output events (would need to mock or spy on sendEvent)
    });

    test('Launch request with valid cabal command', async () => {
        const response = {} as DebugProtocol.LaunchResponse;
        const args: HaskellLaunchRequestArguments = {
            program: 'cabal repl --repl-no-load',
            request: 'launch',
            type: 'haskell',
            cwd: __dirname // Use test directory as workspace
        };

        await debugSession.launchRequest(response, args);
        
        // Again, would need to verify through output events or mock the child process
    });

    test('Restart request works correctly', async () => {
        const launchResponse = {} as DebugProtocol.LaunchResponse;
        const restartResponse = {} as DebugProtocol.RestartResponse;
        
        const args: HaskellLaunchRequestArguments = {
            program: 'cabal repl --repl-no-load',
            request: 'launch',
            type: 'haskell',
            cwd: __dirname
        };

        await debugSession.launchRequest(launchResponse, args);
        await debugSession.restartRequest(restartResponse, {});
        
        // Verify the restart process (would need more detailed assertions with mocks)
    });

    test('Disconnect request cleans up resources', () => {
        const response = {} as DebugProtocol.DisconnectResponse;
        debugSession.disconnectRequest(response, {});
        
        // Verify resources are cleaned up (would need to mock/spy on ghciProcess)
    });
});

// Helper interface for DebugProtocol types
interface DebugProtocol {
    interface InitializeResponse {
        body?: any;
    }
    interface LaunchResponse {}
    interface RestartResponse {}
    interface InitializeRequestArguments {}
    interface DisconnectResponse {}
}