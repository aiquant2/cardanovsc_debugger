/// imp
/*
import {
    DebugSession,
    InitializedEvent,
    OutputEvent,
    TerminatedEvent,
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
// eslint-disable-next-line @typescript-eslint/naming-convention
import * as child_process from 'child_process';
import * as fs from 'fs';

interface HaskellLaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    program: string;
    stopOnEntry?: boolean;
    showIO?: boolean;
    runMain?: boolean;
    runFunction?: string;
}

export class HaskellDebugSession extends DebugSession {
    private ghciProcess: child_process.ChildProcess | undefined;
    private readyToRun = false;
    private functionToRun: string | null = null;
    
    public constructor() {
        super();
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);
    }

    protected initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments
    ): void {
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsFunctionBreakpoints = true;
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: HaskellLaunchRequestArguments
    ): void {
        if (!args.program) {
            this.sendErrorResponse(response, {
                id: 1002,
                format: `No program specified to launch in GHCi.`
            });
            return;
        }

        const program = args.program;
        if (!fs.existsSync(program)) {
            this.sendErrorResponse(response, {
                id: 1004,
                format: `The file ${program} does not exist. Please open a valid .hs file.`
            });
            return;
        }

        this.functionToRun = args.runFunction || null;

        this.sendEvent(new OutputEvent(`Launching GHCi with file: ${program}\n`, 'stdout'));

        try {
            this.ghciProcess = child_process.spawn('caba', [program], {
                cwd: process.cwd(),
                shell: true
            });

            this.ghciProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString();
                this.sendEvent(new OutputEvent(output, 'stdout'));

                if (output.includes('*Main>') && this.ghciProcess) {
                    if (!this.readyToRun) {
                        this.readyToRun = true;

                        if (args.runMain) {
                            this.ghciProcess.stdin?.write("main\n");
                        } else if (this.functionToRun) {
                            this.ghciProcess.stdin?.write(`${this.functionToRun}\n`);
                        }
                    }
                }
            });

            this.ghciProcess.on('data', (data: Buffer) => {
                this.sendEvent(new OutputEvent(data.toString(), 'stderr'));
            });

            this.ghciProcess.on('exit', (code: number | null) => {
                this.sendEvent(new OutputEvent(`GHCi exited with code ${code}\n`, 'stdout'));
                this.sendEvent(new TerminatedEvent());
            });

            this.ghciProcess.on('error', (err) => {
                this.sendEvent(new OutputEvent(`Failed to start GHCi: ${err.message}\n`, 'stderr'));
            });

            this.sendResponse(response);
        } catch (error: any) {
            this.sendErrorResponse(response, {
                id: 1001,
                format: `Failed to launch GHCi: ${error.message}`
            });
        }
    }

    protected evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments
    ): void {
        if (!this.ghciProcess) {
            this.sendErrorResponse(response, {
                id: 1003,
                format: 'GHCi process not running'
            });
            return;
        }

        const expression = args.expression;
        this.ghciProcess.stdin?.write(`${expression}\n`);

        response.body = {
            result: `Evaluating: ${expression}`,
            variablesReference: 0
        };
        this.sendResponse(response);
    }

    protected disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
        args: DebugProtocol.DisconnectArguments
    ): void {
        if (this.ghciProcess) {
            this.ghciProcess.kill();
            this.ghciProcess = undefined;
        }
        this.sendResponse(response);
    }
}
*/

// import * as vscode from 'vscode';
// import * as path from 'path';
// import {
//     DebugSession,
//     InitializedEvent,
//     OutputEvent,
//     TerminatedEvent,
// } from 'vscode-debugadapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import * as child_process from 'child_process';
// import * as fs from 'fs';

// interface HaskellLaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
//     program: string;
//     stopOnEntry?: boolean;
//     showIO?: boolean;
//     runMain?: boolean;
//     runFunction?: string;
//     workspacePath?: string;
// }

// export class HaskellDebugSession extends DebugSession {
//     private ghciProcess: child_process.ChildProcess | undefined;
//     private readyToRun = false;
//     private functionToRun: string | null = null;
//     private diagnosticCollection: vscode.DiagnosticCollection;

//     public constructor() {
//         super();
//         this.setDebuggerLinesStartAt1(true);
//         this.setDebuggerColumnsStartAt1(true);
//         this.diagnosticCollection = vscode.languages.createDiagnosticCollection('haskell-debug');
//     }

//     protected initializeRequest(
//         response: DebugProtocol.InitializeResponse,
//         args: DebugProtocol.InitializeRequestArguments
//     ): void {
//         response.body = response.body || {};
//         response.body.supportsConfigurationDoneRequest = true;
//         response.body.supportsEvaluateForHovers = true;
//         response.body.supportsFunctionBreakpoints = true;
//         this.sendResponse(response);
//         this.sendEvent(new InitializedEvent());
//     }

//     protected launchRequest(
//         response: DebugProtocol.LaunchResponse,
//         args: HaskellLaunchRequestArguments
//     ): void {
//         if (!args.program) {
//             this.sendErrorResponse(response, {
//                 id: 1002,
//                 format: `No program specified to launch in GHCi.`
//             });
//             return;
//         }

//         const program = args.program;
//         if (!fs.existsSync(program)) {
//             this.sendErrorResponse(response, {
//                 id: 1004,
//                 format: `The file ${program} does not exist. Please open a valid .hs file.`
//             });
//             return;
//         }

//         this.functionToRun = args.runFunction || null;
//         const workspacePath = args.workspacePath || path.dirname(program);

//         this.sendEvent(new OutputEvent(`Launching GHCi with file: ${program}\n`, 'stdout'));

//         try {
//             this.ghciProcess = child_process.spawn('cabal repl', [program], {
//                 cwd: workspacePath,
//                 shell: true
//             });

//             this.ghciProcess.stdout?.on('data', (data: Buffer) => {
//                 const output = data.toString();
//                 this.sendEvent(new OutputEvent(output, 'stdout'));
//                 this.parseGHCiErrors(output, workspacePath);

//                 if (output.includes('*Main>') && this.ghciProcess) {
//                     if (!this.readyToRun) {
//                         this.readyToRun = true;

//                         if (args.runMain) {
//                             this.ghciProcess.stdin?.write("main\n");
//                         } else if (this.functionToRun) {
//                             this.ghciProcess.stdin?.write(`${this.functionToRun}\n`);
//                         }
//                     }
//                 }
//             });

//             this.ghciProcess.stderr?.on('data', (data: Buffer) => {
//                 const output = data.toString();
//                 this.sendEvent(new OutputEvent(output, 'stderr'));
//                 this.parseGHCiErrors(output, workspacePath);
//             });

//             this.ghciProcess.on('exit', (code: number | null) => {
//                 this.sendEvent(new OutputEvent(`GHCi exited with code ${code}\n`, 'stdout'));
//                 this.sendEvent(new TerminatedEvent());
//             });

//             this.ghciProcess.on('error', (err) => {
//                 this.sendEvent(new OutputEvent(`Failed to start GHCi: ${err.message}\n`, 'stderr'));
//             });

//             this.sendResponse(response);
//         } catch (error: any) {
//             this.sendErrorResponse(response, {
//                 id: 1001,
//                 format: `Failed to launch GHCi: ${error.message}`
//             });
//         }
//     }

//     private parseGHCiErrors(output: string, workspacePath: string) {
//         this.diagnosticCollection.clear();
//         const diagnosticsMap: Map<string, vscode.Diagnostic[]> = new Map();

//         // Enhanced regex to handle multi-line error messages
//         const errorRegex = /^(?<file>.+):(?<line>\d+):(?<column>\d+):\s*(?<type>error|warning|info):\s*(?<message>[\s\S]+?)(?=\n\S|\n*$)/gm;
//         let match;
//         let foundError = false;

//         while ((match = errorRegex.exec(output)) !== null) {
//             foundError = true;
//             const { file, line, column, type, message } = match.groups!;
//             const severity = this.getDiagnosticSeverity(type);

//             const filePath = path.resolve(workspacePath, file);
//             const fileUri = vscode.Uri.file(filePath);

//             const lineNum = parseInt(line) - 1;
//             const colNum = parseInt(column) - 1;

//             // Try to get the actual line text to determine error length
//             let errorLength = 1;
//             try {
//                 const document = fs.readFileSync(filePath, 'utf-8');
//                 const lines = document.split('\n');
//                 if (lineNum < lines.length) {
//                     const lineText = lines[lineNum];
//                     const errorPart = lineText.substring(colNum);
//                     const nextSpace = errorPart.search(/\s/);
//                     errorLength = nextSpace === -1 ? errorPart.length : nextSpace;
//                 }
//             } catch (e) {
//                 // If we can't read the file, just use default length
//             }

//             const range = new vscode.Range(
//                 lineNum,
//                 colNum,
//                 lineNum,
//                 colNum + Math.max(1, errorLength)
//             );

//             // Clean up the message by removing any source code preview
//             let cleanMessage = message.replace(/^\s*\d+\s*\|.*$/gm, '').trim();

//             const diagnostic = new vscode.Diagnostic(range, cleanMessage, severity);
//             diagnostic.source = 'ghci';

//             if (!diagnosticsMap.has(fileUri.fsPath)) {
//                 diagnosticsMap.set(fileUri.fsPath, []);
//             }
//             diagnosticsMap.get(fileUri.fsPath)?.push(diagnostic);
//         }

//         // Handle dependency errors
//         const dependencyErrorRegex = /Error:\s*\[Cabal-\d+\]\nCould not resolve dependencies:\n([\s\S]+?)(?=\nAfter searching|$)/g;
//         while ((match = dependencyErrorRegex.exec(output)) !== null) {
//             foundError = true;
//             const message = "Cabal Dependency Error: \n" + match[1].trim();
//             const workspaceUri = vscode.Uri.file(workspacePath);
//             const diagnostic = new vscode.Diagnostic(
//                 new vscode.Range(0, 0, 0, 1),
//                 message,
//                 vscode.DiagnosticSeverity.Error
//             );
//             diagnosticsMap.set(workspaceUri.fsPath, [diagnostic]);
//         }

//         // Handle missing file errors
//         const missingFileRegex = /Can't find file:\s*(.+)/g;
//         while ((match = missingFileRegex.exec(output)) !== null) {
//             foundError = true;
//             const message = `Missing file: ${match[1].trim()}`;
//             const workspaceUri = vscode.Uri.file(workspacePath);
//             const diagnostic = new vscode.Diagnostic(
//                 new vscode.Range(0, 0, 0, 1),
//                 message,
//                 vscode.DiagnosticSeverity.Error
//             );
//             diagnosticsMap.set(workspaceUri.fsPath, [diagnostic]);
//         }

//         // Set diagnostics for all files
//         for (const [file, diagnostics] of diagnosticsMap.entries()) {
//             this.diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
//         }
//     }

//     private getDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
//         switch (severity) {
//             case "error":
//                 return vscode.DiagnosticSeverity.Error;
//             case "warning":
//                 return vscode.DiagnosticSeverity.Warning;
//             case "info":
//                 return vscode.DiagnosticSeverity.Information;
//             default:
//                 return vscode.DiagnosticSeverity.Error;
//         }
//     }

//     protected evaluateRequest(
//         response: DebugProtocol.EvaluateResponse,
//         args: DebugProtocol.EvaluateArguments
//     ): void {
//         if (!this.ghciProcess) {
//             this.sendErrorResponse(response, {
//                 id: 1003,
//                 format: 'GHCi process not running'
//             });
//             return;
//         }

//         const expression = args.expression;
//         this.ghciProcess.stdin?.write(`${expression}\n`);

//         response.body = {
//             result: `Evaluating: ${expression}`,
//             variablesReference: 0
//         };
//         this.sendResponse(response);
//     }

//     protected disconnectRequest(
//         response: DebugProtocol.DisconnectResponse,
//         args: DebugProtocol.DisconnectArguments
//     ): void {
//         if (this.ghciProcess) {
//             this.ghciProcess.kill();
//             this.ghciProcess = undefined;
//         }
//         this.diagnosticCollection.dispose();
//         this.sendResponse(response);
//     }
// }

// /// imp
// import {
//     DebugSession,
//     InitializedEvent,
//     OutputEvent,
//     TerminatedEvent,
// } from 'vscode-debugadapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import * as child_process from 'child_process';
// import * as vscode from "vscode";

// interface HaskellLaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
//     program?: string;
//     stopOnEntry?: boolean;
//     showIO?: boolean;
//     runMain?: boolean;
//     runFunction?: string;
//     activeFile?: string;
//     cabalProjectRoot?: string;
//     cwd?: string;
// }

// export class HaskellDebugSession extends DebugSession {
//     private ghciProcess: child_process.ChildProcess | undefined;
//     private readyToRun = false;
//     private functionToRun: string | null = null;

//     public constructor() {
//         super();
//         this.setDebuggerLinesStartAt1(true);
//         this.setDebuggerColumnsStartAt1(true);
//     }

//     protected initializeRequest(
//         response: DebugProtocol.InitializeResponse,
//         args: DebugProtocol.InitializeRequestArguments
//     ): void {
//         response.body = response.body || {};
//         response.body.supportsConfigurationDoneRequest = true;
//         response.body.supportsEvaluateForHovers = true;
//         response.body.supportsFunctionBreakpoints = true;
//         this.sendResponse(response);
//         this.sendEvent(new InitializedEvent());
//     }

//     protected async launchRequest(response: DebugProtocol.LaunchResponse, args: HaskellLaunchRequestArguments): Promise<void> {
//         try {
//             const programCommand = args.program?.trim();
//             const workspaceFolder = args.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

//             if (!programCommand || !programCommand.startsWith("cabal repl")) {
//                 this.sendEvent(new OutputEvent('Please set "program": "cabal repl --repl-no-load" in launch.json\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             if (!workspaceFolder) {
//                 this.sendEvent(new OutputEvent('No workspace folder found\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             const [cmd, ...cmdArgs] = programCommand.split(" ");

//             this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
//                 cwd: workspaceFolder,
//                 shell: true
//             });

//             this.ghciProcess.stdout?.on('data', (data: Buffer) => {
//                 const text = data.toString();
//                 this.sendEvent(new OutputEvent(text));

//                 // Detect GHCi prompt and load file if needed
//                 if ((text.includes("Prelude>") || text.includes("Ok,")) && args.activeFile) {
//                     this.loadHaskellFile(args.activeFile);
//                 }
//             });

//             this.ghciProcess.stderr?.on('data', (data: Buffer) => {
//                 this.sendEvent(new OutputEvent(`stderr: ${data.toString()}`));
//             });

//             this.ghciProcess.on('exit', (code) => {
//                 this.sendEvent(new OutputEvent(`GHCi exited with code ${code}\n`));
//                 this.sendEvent(new TerminatedEvent());
//             });

//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1001,
//                 format: `Failed to launch debug session: ${error}`
//             });
//         }
//     }

//     private loadHaskellFile(filePath: string): void {
//         if (!this.ghciProcess) return;

//         if (!filePath.endsWith('.hs')) {
//             this.sendEvent(new OutputEvent('File must be a Haskell source file (.hs)\n'));
//             return;
//         }

//         this.ghciProcess.stdin?.write(`:l ${filePath}\n`);
//     }

//     protected evaluateRequest(
//         response: DebugProtocol.EvaluateResponse,
//         args: DebugProtocol.EvaluateArguments
//     ): void {
//         try {
//             if (!this.ghciProcess) {
//                 throw new Error('GHCi process not running');
//             }

//             const expression = args.expression;
//             this.ghciProcess.stdin?.write(`${expression}\n`);

//             response.body = {
//                 result: `Evaluating: ${expression}`,
//                 variablesReference: 0
//             };
//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1003,
//                 format: `Evaluation failed: ${error}`
//             });
//         }
//     }

//     protected disconnectRequest(
//         response: DebugProtocol.DisconnectResponse,
//         args: DebugProtocol.DisconnectArguments
//     ): void {
//         if (this.ghciProcess) {
//             this.ghciProcess.kill();
//             this.ghciProcess = undefined;
//         }
//         this.sendEvent(new TerminatedEvent());
//         this.sendResponse(response);
//     }
// }

// import {
//     DebugSession,
//     InitializedEvent,
//     OutputEvent,
//     TerminatedEvent,
// } from 'vscode-debugadapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import * as child_process from 'child_process';
// import * as vscode from "vscode";
// import * as fs from 'fs/promises';

// interface HaskellLaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
//     program?: string;
//     stopOnEntry?: boolean;
//     showIO?: boolean;
//     runMain?: boolean;
//     runFunction?: string;
//     activeFile?: string;
//     cabalProjectRoot?: string;
//     cwd?: string;
// }

// export class HaskellDebugSession extends DebugSession {
//     private ghciProcess: child_process.ChildProcess | undefined;
//     private isFileLoaded = false;
//     private loadDebounceTimer: NodeJS.Timeout | undefined;
//     private lastLoadedFileContent: string | undefined;

//     public constructor() {
//         super();
//         this.setDebuggerLinesStartAt1(true);
//         this.setDebuggerColumnsStartAt1(true);
//     }

//     protected initializeRequest(
//         response: DebugProtocol.InitializeResponse,
//         args: DebugProtocol.InitializeRequestArguments
//     ): void {
//         response.body = response.body || {};
//         response.body.supportsConfigurationDoneRequest = true;
//         response.body.supportsEvaluateForHovers = true;
//         response.body.supportsFunctionBreakpoints = true;
//         this.sendResponse(response);
//         this.sendEvent(new InitializedEvent());
//     }

//     protected async launchRequest(response: DebugProtocol.LaunchResponse, args: HaskellLaunchRequestArguments): Promise<void> {
//         try {
//             const programCommand = args.program?.trim();
//             const workspaceFolder = args.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

//             if (!programCommand || !programCommand.startsWith("cabal repl")) {
//                 this.sendEvent(new OutputEvent('Please set "program": "cabal repl --repl-no-load" in launch.json\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             if (!workspaceFolder) {
//                 this.sendEvent(new OutputEvent('No workspace folder found\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             const [cmd, ...cmdArgs] = programCommand.split(" ");

//             this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
//                 cwd: workspaceFolder,
//                 shell: true
//             });

//             this.ghciProcess.stdout?.on('data', (data: Buffer) => {
//                 const text = data.toString();
//                 this.sendEvent(new OutputEvent(text));

//                 // Only try to load the file if it hasn't been loaded yet
//                 if ((text.includes("Prelude>") || text.includes("*Main>") || text.includes("Ok,")) && !this.isFileLoaded) {
//                     if (args.activeFile) {
//                         this.loadHaskellFile(args.activeFile);
//                     }
//                 }
//             });

//             this.ghciProcess.stderr?.on('data', (data: Buffer) => {
//                 this.sendEvent(new OutputEvent(`stderr: ${data.toString()}`));
//             });

//             this.ghciProcess.on('exit', (code) => {
//                 this.sendEvent(new OutputEvent(`GHCi exited with code ${code}\n`));
//                 this.sendEvent(new TerminatedEvent());
//             });

//             // Initial file load if specified
//             if (args.activeFile) {
//                 await this.loadHaskellFile(args.activeFile);
//             }

//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1001,
//                 format: `Failed to launch debug session: ${error}`
//             });
//         }
//     }

//     private async loadHaskellFile(filePath: string): Promise<void> {
//         if (!this.ghciProcess) return;

//         if (this.loadDebounceTimer) {
//             clearTimeout(this.loadDebounceTimer);
//             this.loadDebounceTimer = undefined;
//         }

//         try {
//             const currentContent = await fs.readFile(filePath, 'utf8');
//             if (currentContent === this.lastLoadedFileContent && this.isFileLoaded) {
//                 this.sendEvent(new OutputEvent(`No changes in ${filePath}, skipping reload.\n`));
//                 return;
//             }

//             this.lastLoadedFileContent = currentContent;

//             if (!filePath.endsWith('.hs')) {
//                 this.sendEvent(new OutputEvent('File must be a Haskell source file (.hs)\n'));
//                 return;
//             }

//             this.loadDebounceTimer = setTimeout(() => {
//                 this.sendEvent(new OutputEvent(`Loading Haskell file: ${filePath}\n`));
//                 this.ghciProcess?.stdin?.write(`:l ${filePath}\n`);
//                 this.isFileLoaded = true;
//                 this.loadDebounceTimer = undefined;
//             }, 300); // debounce delay
//         } catch (error) {
//             this.sendEvent(new OutputEvent(`Error loading file: ${error}\n`));
//         }
//     }

//     protected evaluateRequest(
//         response: DebugProtocol.EvaluateResponse,
//         args: DebugProtocol.EvaluateArguments
//     ): void {
//         try {
//             if (!this.ghciProcess) {
//                 throw new Error('GHCi process not running');
//             }

//             const expression = args.expression;
//             this.ghciProcess.stdin?.write(`${expression}\n`);

//             response.body = {
//                 result: `Evaluating: ${expression}`,
//                 variablesReference: 0
//             };
//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1003,
//                 format: `Evaluation failed: ${error}`
//             });
//         }
//     }

//     protected disconnectRequest(
//         response: DebugProtocol.DisconnectResponse,
//         args: DebugProtocol.DisconnectArguments
//     ): void {
//         if (this.loadDebounceTimer) {
//             clearTimeout(this.loadDebounceTimer);
//         }

//         if (this.ghciProcess) {
//             this.ghciProcess.kill();
//             this.ghciProcess = undefined;
//         }
//         this.sendEvent(new TerminatedEvent());
//         this.sendResponse(response);
//     }
// }

// import {
//     DebugSession,
//     InitializedEvent,
//     OutputEvent,
//     TerminatedEvent,
// } from 'vscode-debugadapter';
// import { DebugProtocol } from 'vscode-debugprotocol';
// import * as child_process from 'child_process';
// import * as vscode from "vscode";
// import * as fs from 'fs/promises';

// interface HaskellLaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
//     program?: string;
//     stopOnEntry?: boolean;
//     showIO?: boolean;
//     runMain?: boolean;
//     runFunction?: string;
//     activeFile?: string;
//     cabalProjectRoot?: string;
//     cwd?: string;
// }

// export class HaskellDebugSession extends DebugSession {
//     private ghciProcess: child_process.ChildProcess | undefined;
//     private isFileLoaded = false;
//     private loadDebounceTimer: NodeJS.Timeout | undefined;
//     private lastLoadedFileContent: string | undefined;
//     private launchArgs: HaskellLaunchRequestArguments | undefined;

//     public constructor() {
//         super();
//         this.setDebuggerLinesStartAt1(true);
//         this.setDebuggerColumnsStartAt1(true);
//     }

//     protected initializeRequest(
//         response: DebugProtocol.InitializeResponse,
//         args: DebugProtocol.InitializeRequestArguments
//     ): void {
//         response.body = response.body || {};
//         response.body.supportsConfigurationDoneRequest = true;
//         response.body.supportsEvaluateForHovers = true;
//         response.body.supportsFunctionBreakpoints = true;
//         response.body.supportsRestartRequest = true; // Enable restart support
//         this.sendResponse(response);
//         this.sendEvent(new InitializedEvent());
//     }

//     protected async launchRequest(response: DebugProtocol.LaunchResponse, args: HaskellLaunchRequestArguments): Promise<void> {
//         try {
//             console.log("launch");

//             const programCommand = args.program?.trim();
//             const workspaceFolder = args.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

//             if (!programCommand || !programCommand.startsWith("cabal repl")) {
//                 this.sendEvent(new OutputEvent('Please set "program": "cabal repl --repl-no-load" in launch.json\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             if (!workspaceFolder) {
//                 this.sendEvent(new OutputEvent('No workspace folder found\n'));
//                 this.sendResponse(response);
//                 return;
//             }

//             const [cmd, ...cmdArgs] = programCommand.split(" ");

//             this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
//                 cwd: workspaceFolder,
//                 shell: true
//             });

//             this.ghciProcess.stdout?.on('data', (data: Buffer) => {
//                 const text = data.toString();
//                 this.sendEvent(new OutputEvent(text));

//                 // Only try to load the file if it hasn't been loaded yet
//                 if ((text.includes("Prelude>") || text.includes("*Main>") || text.includes("Ok,")) && !this.isFileLoaded) {
//                     if (args.activeFile) {
//                         this.loadHaskellFile(args.activeFile);
//                     }
//                 }
//             });

//             this.ghciProcess.stderr?.on('data', (data: Buffer) => {
//                 this.sendEvent(new OutputEvent(`stderr: ${data.toString()}`));
//             });

//             this.ghciProcess.on('exit', (code) => {
//                 this.sendEvent(new OutputEvent(`GHCi exited with code ${code}\n`));
//                 this.sendEvent(new TerminatedEvent());
//             });

//             // Initial file load if specified
//             if (args.activeFile) {
//                 await this.loadHaskellFile(args.activeFile);
//             }

//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1001,
//                 format: `Failed to launch debug session: ${error}`
//             });
//         }
//     }

//     protected restartRequest(
//         response: DebugProtocol.RestartResponse,
//         args: DebugProtocol.RestartArguments
//     ): void {
//         console.log("restart");

//         this.sendEvent(new OutputEvent('Restarting debug session...\n'));

//         // Reset state
//         this.isFileLoaded = false;
//         this.lastLoadedFileContent = undefined;

//         // Start a new session with the stored launch args
//         if (args) {
//             this.launchRequest(response, args);
//         } else {
//             this.sendErrorResponse(response, {
//                 id: 1004,
//                 format: 'Cannot restart: No previous launch configuration available'
//             });
//         }
//     }

//     private async loadHaskellFile(filePath: string): Promise<void> {
//         if (!this.ghciProcess) return;

//         if (this.loadDebounceTimer) {
//             clearTimeout(this.loadDebounceTimer);
//             this.loadDebounceTimer = undefined;
//         }

//         try {
//             const currentContent = await fs.readFile(filePath, 'utf8');
//             if (currentContent === this.lastLoadedFileContent && this.isFileLoaded) {
//                 this.sendEvent(new OutputEvent(`No changes in ${filePath}, skipping reload.\n`));
//                 return;
//             }

//             this.lastLoadedFileContent = currentContent;

//             if (!filePath.endsWith('.hs')) {
//                 this.sendEvent(new OutputEvent('File must be a Haskell source file (.hs)\n'));
//                 return;
//             }

//             this.loadDebounceTimer = setTimeout(() => {
//                 this.sendEvent(new OutputEvent(`Loading Haskell file: ${filePath}\n`));
//                 this.ghciProcess?.stdin?.write(`:l ${filePath}\n`);
//                 this.isFileLoaded = true;
//                 this.loadDebounceTimer = undefined;
//             }, 300); // debounce delay
//         } catch (error) {
//             this.sendEvent(new OutputEvent(`Error loading file: ${error}\n`));
//         }
//     }

//     protected evaluateRequest(
//         response: DebugProtocol.EvaluateResponse,
//         args: DebugProtocol.EvaluateArguments
//     ): void {
//         try {
//             if (!this.ghciProcess) {
//                 throw new Error('GHCi process not running');
//             }

//             const expression = args.expression;
//             this.ghciProcess.stdin?.write(`${expression}\n`);

//             response.body = {
//                 result: `Evaluating: ${expression}`,
//                 variablesReference: 0
//             };
//             this.sendResponse(response);
//         } catch (error) {
//             this.sendErrorResponse(response, {
//                 id: 1003,
//                 format: `Evaluation failed: ${error}`
//             });
//         }
//     }

//     protected disconnectRequest(
//         response: DebugProtocol.DisconnectResponse,
//         args: DebugProtocol.DisconnectArguments
//     ): void {
//         if (this.loadDebounceTimer) {
//             clearTimeout(this.loadDebounceTimer);
//         }

//         if (this.ghciProcess) {
//             this.ghciProcess.kill();
//             this.ghciProcess = undefined;
//         }
//         this.sendEvent(new TerminatedEvent());
//         this.sendResponse(response);
//     }
// }
//immm

import {
  DebugSession,
  InitializedEvent,
  OutputEvent,
  TerminatedEvent,
} from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
import * as child_process from "child_process";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import { parseCabalErrors } from "./diagnostic";

interface HaskellLaunchRequestArguments
  extends DebugProtocol.LaunchRequestArguments {
  program?: string;
  stopOnEntry?: boolean;
  showIO?: boolean;
  runMain?: boolean;
  runFunction?: string;
  activeFile?: string;
  cabalProjectRoot?: string;
  cwd?: string;
}

export class HaskellDebugSession extends DebugSession {
  private ghciProcess: child_process.ChildProcess | undefined;
  private isFileLoaded = false;
  private loadDebounceTimer: NodeJS.Timeout | undefined;
  private lastLoadedFileContent: string | undefined;
  private launchArgs: HaskellLaunchRequestArguments | undefined;
  private isRestarting = false;

  public constructor() {
    super();
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);
  }

  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsEvaluateForHovers = true;
    response.body.supportsFunctionBreakpoints = true;
    response.body.supportsRestartRequest = true;
    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }


public async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: HaskellLaunchRequestArguments
  ): Promise<void> {
    try {
      const editor = vscode.window.activeTextEditor;
  
      args.activeFile = editor?.document.fileName;
      this.launchArgs = args;
  
      const programCommand = args.program?.trim();
      const workspaceFolder =
        args.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  
      if (!programCommand || !programCommand.startsWith("cabal repl")) {
        this.sendEvent(
          new OutputEvent(
            'Please set "program": "cabal repl --repl-no-load" in launch.json\n',
            'console'
          )
        );
        this.sendResponse(response);
        return;
      }
  
      if (!workspaceFolder) {
        this.sendEvent(new OutputEvent("No workspace folder found\n", 'stderr'));
        this.sendResponse(response);
        return;
      }
  
      // Kill existing process if any
      if (this.ghciProcess) {
        this.ghciProcess.removeAllListeners();
        this.ghciProcess.kill("SIGKILL");
        this.ghciProcess = undefined;
      }
  
      const [cmd, ...cmdArgs] = programCommand.split(" ");
  
      this.sendEvent(new OutputEvent("Launching GHCi...\n", 'console'));
  
      this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
        cwd: workspaceFolder,
        shell: true,
      });
  
      this.ghciProcess.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();
        this.sendEvent(new OutputEvent(text, 'stdout'));
  
        if (
          (text.includes("Prelude>") ||
            text.includes("*Main>") ||
            text.includes("Ok,")) &&
          !this.isFileLoaded
        ) {
          if (args.activeFile) {
            this.loadHaskellFile(args.activeFile);
          }
        }
      });
  
      this.ghciProcess.stderr?.on("data", (data: Buffer) => {
        parseCabalErrors(data.toString(), workspaceFolder);
        this.sendEvent(new OutputEvent(data.toString(), 'stderr'));
      });
  
      this.ghciProcess.on("exit", (code) => {
        if (!this.isRestarting) {
          this.sendEvent(
            new OutputEvent(`GHCi exited with code ${code}\n`, 'console')
          );
          this.sendEvent(new TerminatedEvent());
        }
      });
  
      if (args.activeFile) {
        await this.loadHaskellFile(args.activeFile);
      }
  
      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1001,
        format: `Failed to launch debug session: ${error}`,
      });
    }
  }
  

  protected async restartRequest(
    response: DebugProtocol.RestartResponse,
    args: DebugProtocol.RestartArguments
  ): Promise<void> {
    try {
      this.isRestarting = true;
      this.sendEvent(new OutputEvent("Restarting debug session...\n"));

      // Clean up existing process
      if (this.ghciProcess) {
        this.ghciProcess.removeAllListeners();
        this.ghciProcess.kill("SIGKILL");
        this.ghciProcess = undefined;
      }

      // Reset state
      this.isFileLoaded = false;
      this.lastLoadedFileContent = undefined;

      if (this.loadDebounceTimer) {
        clearTimeout(this.loadDebounceTimer);
        this.loadDebounceTimer = undefined;
      }

      // Start a new session
      if (this.launchArgs) {
        await this.launchRequest(response, this.launchArgs);
      } else {
        this.sendErrorResponse(response, {
          id: 1004,
          format: "Cannot restart: No previous launch configuration available",
        });
      }
    } finally {
      this.isRestarting = false;
    }
  }

  private async loadHaskellFile(filePath: string): Promise<void> {
    if (!this.ghciProcess) return;

    if (this.loadDebounceTimer) {
      clearTimeout(this.loadDebounceTimer);
      this.loadDebounceTimer = undefined;
    }

    try {
      const currentContent = await fs.readFile(filePath, "utf8");
      if (currentContent === this.lastLoadedFileContent && this.isFileLoaded) {
        this.sendEvent(
          new OutputEvent(`No changes in ${filePath}, skipping reload.\n`)
        );
        return;
      }

      this.lastLoadedFileContent = currentContent;

      if (!filePath.endsWith(".hs")) {
        this.sendEvent(
          new OutputEvent("File must be a Haskell source file (.hs)\n")
        );
        return;
      }

      this.loadDebounceTimer = setTimeout(() => {
        this.sendEvent(new OutputEvent(`Loading Haskell file: ${filePath}\n`));
        this.ghciProcess?.stdin?.write(`:l ${filePath}\n`);
        this.isFileLoaded = true;
        this.loadDebounceTimer = undefined;
      }, 300);
    } catch (error) {
      this.sendEvent(new OutputEvent(`Error loading file: ${error}\n`));
    }
  }

  protected evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ): void {
    try {
      if (!this.ghciProcess) {
        throw new Error("GHCi process not running");
      }

      const expression = args.expression;
      this.ghciProcess.stdin?.write(`${expression}\n`);

      response.body = {
        result: `Evaluating: ${expression}`,
        variablesReference: 0,
      };
      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1003,
        format: `Evaluation failed: ${error}`,
      });
    }
  }

  protected disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments
  ): void {
    if (this.loadDebounceTimer) {
      clearTimeout(this.loadDebounceTimer);
    }

    if (this.ghciProcess) {
      this.ghciProcess.removeAllListeners();
      this.ghciProcess.kill();
      this.ghciProcess = undefined;
    }
    this.sendEvent(new TerminatedEvent());
    this.sendResponse(response);
  }
}
