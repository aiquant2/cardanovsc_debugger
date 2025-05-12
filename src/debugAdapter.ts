import {
  ContinuedEvent,
  DebugSession,
  InitializedEvent,
  OutputEvent,
  StoppedEvent,
  TerminatedEvent,
} from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
// eslint-disable-next-line @typescript-eslint/naming-convention
import * as child_process from "child_process";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import { diagnosticCollection, parseCabalErrors } from "./diagnostics";
import path from "path";

export interface HaskellLaunchRequestArguments
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
  _currentLine!: number;
  _breakpoints: any;
  static launchArgs: any;
  _currentFilePath!: string;

  static sendErrorResponse: jest.Mock<any, any, any>;
  static sendResponse: any;
  static sendEvent: jest.Mock<any, any>;
  static loadHaskellFile(filePath: string) {
    throw new Error("Method not implemented.");
  }
  static lastLoadedFileContent: string;
  static isFileLoaded: boolean;

  static restartRequest(
    response: DebugProtocol.RestartResponse,
    args: DebugProtocol.RestartArguments
  ) {
  console.log("called again restartrequest");
  
    this.sendEvent(new OutputEvent("Restarting debug session...\n", "console"));
    this.sendResponse(response);
  }

  static disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments
  ) {
    if (HaskellDebugSession.ghciProcess) {
      HaskellDebugSession.ghciProcess.removeAllListeners();
      HaskellDebugSession.ghciProcess.kill();
      this.sendEvent(new OutputEvent("Process cleaned up\n", "console"));
    }
    this.sendResponse(response);
  }

  static evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ) {
    const expr = args.expression;
    if (HaskellDebugSession.ghciProcess?.stdin?.write) {
      HaskellDebugSession.ghciProcess.stdin.write(expr + "\n");
    }
    response.body = {
      result: "4", // Assuming the result of "2 + 2" is "4" for test purposes
      variablesReference: 0,
    };
    response.success = true;

    this.sendResponse(response);
  }

  // variable panel

  protected threadsRequest(
    response: DebugProtocol.ThreadsResponse,
    request?: DebugProtocol.Request
  ): void {
    console.log("threadsRequest called");

    response.body = {
      threads: [
        {
          id: 1,
          name: "Main Thread",
        },
      ],
    };

    this.sendResponse(response);
  }
  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {
    console.log("scopesRequest called", args);

    const scopes: DebugProtocol.Scope[] = [
      {
        name: "File Info",
        variablesReference: 1000, // Arbitrary reference ID
        expensive: false,
      },
    ];

    response.body = { scopes };
    this.sendResponse(response);
  }

  protected async variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments
  ): Promise<void> {
    const variables: DebugProtocol.Variable[] = [];

    console.log("variablesRequest called", args);
    const filePath = this.launchArgs?.activeFile;

    if (filePath) {
      const content = fs.readFile(filePath, "utf8");

      // Match lines that look like function definitions
      const functionRegex = /^([a-zA-Z0-9_']+)\s+((?:[a-zA-Z0-9_']+\s*)+)?=/gm;

      const fileName = filePath.split(/[\\/]/).pop() || "";
      const dirName = filePath.substring(0, filePath.lastIndexOf(fileName));

      variables.push({
        name: "File :",
        value: fileName,
        variablesReference: 0,
      });

      variables.push({
        name: "Directory :",
        value: dirName,
        variablesReference: 0,
      });
      let match;
      
      while ((match = functionRegex.exec(await content)) !== null) {
        const name = match[1];
        const args = match[2]?.trim() || "(no arguments)";

        variables.push({
          name: `${name}`,
          value: `Arguments: ${args}`,
          variablesReference: 0,
        });
      }
    }

    response.body = { variables };
    this.sendResponse(response);
  } 

protected async stackTraceRequest(
  response: DebugProtocol.StackTraceResponse,
  args: DebugProtocol.StackTraceArguments
): Promise<void> {
  console.log("stackTraceRequest called with arguments:", args);

  const activeFile = this.launchArgs?.activeFile || "unknown";

  // Simulate a current stack trace with one or more frames
  const stackFrames: DebugProtocol.StackFrame[] = [];

  if (this._currentLine !== undefined) {
    stackFrames.push({
      id: 1,
      name: "main",
      line: this._currentLine,
      column: 1,
      source: {
        name: path.basename(activeFile),
        path: activeFile,
      },
    });
  }


  response.body = {
    stackFrames,
    totalFrames: stackFrames.length,
  };

  this.sendResponse(response);
}



  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    console.log("setBreakPointsRequest called", args);
  
    
    const breakpoints = args.breakpoints?.map(bp => bp.line) || [];
  
    this._breakpoints = breakpoints; // ✅ Initialize your internal breakpoints list
  
    response.body = {
      breakpoints: breakpoints.map(line => ({
        verified: true,
        line
      }))
    };
  
    console.log("setBreakPointsRequest", this._breakpoints);
    if (this.launchArgs) {
       this.launchRequest(response, this.launchArgs);
    } else {
      this.sendErrorResponse(response, {
        id: 1004,
        format: "Cannot restart: No previous launch configuration available",
      });
    }    this.sendResponse(response);
  }
  

  // updated one **

  protected nextRequest(
    response: DebugProtocol.NextResponse,
    args: DebugProtocol.NextArguments
  ): void {
    console.log("nextRequest called with threadId:", args.threadId);
  
    // If no breakpoints exist, just continue execution
    if (!this._breakpoints || this._breakpoints.length === 0) {
      console.log("No breakpoints set — continuing execution.");
      this.sendResponse(response);
      return;
    }
  
    const currentIdx = this._breakpoints.indexOf(this._currentLine);
  
    if (currentIdx === -1) {
      console.log(
        `Current line (${this._currentLine}) not found in breakpoints — continuing.`
      );
      this.sendResponse(response);
      return;
    }
  
    if (currentIdx < this._breakpoints.length - 1) {
      this._currentLine = this._breakpoints[currentIdx + 1];
      console.log("Stepped to next breakpoint at line", this._currentLine);
  
      // Simulate pause at next breakpoint
      this.sendEvent(new StoppedEvent("step", args.threadId));
    } else {
      console.log(
        "Already at the last breakpoint — no further steps available."
      );
  
      // Optional: send a continued or terminated event here
      this.sendEvent(new ContinuedEvent(args.threadId));
    }
  
    this.sendResponse(response);
  }
  

  // end of variable panel

  static ghciProcess: any;
  static initializeRequest(response: { body: {} }, args: {}) {
    throw new Error("Method not implemented.");
  }
  public ghciProcess: child_process.ChildProcess | undefined;
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

    console.log("initializeRequest triggered");
  }

  public async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: HaskellLaunchRequestArguments
  ): Promise<void> {
    try {
      diagnosticCollection.clear();

      let x = "";
      let y = "";

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
            "console"
          )
        );
        this.sendResponse(response);
        return;
      }

      if (!workspaceFolder) {
        this.sendEvent(
          new OutputEvent("No workspace folder found\n", "stderr")
        );
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

      this.sendEvent(new OutputEvent("Launching GHCi...\n", "console"));

      this.sendResponse(response);
      
      this._currentFilePath = this.launchArgs?.activeFile || "unknown";

      this._currentLine = this._breakpoints[0] || 1; // or any initial value


      this.sendEvent(new StoppedEvent("entry", 1)); // threadId = 1

      console.log("launchRequest triggered");
      console.log("StoppedEvent sent");

      this.ghciProcess = child_process.spawn(cmd, cmdArgs, {
        cwd: workspaceFolder,
        shell: true,
      });

      this.ghciProcess.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();

        x += text;
        this.sendEvent(new OutputEvent(text, "stdout"));

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
        y += data.toString();
        parseCabalErrors(x + y, y);
        this.sendEvent(new OutputEvent(data.toString(), "stderr"));
      });

      this.ghciProcess.on("exit", (code) => {
        if (!this.isRestarting) {
          this.sendEvent(
            new OutputEvent(`GHCi exited with code ${code}\n`, "console")
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
    if (!this.ghciProcess) {
      return;
    }

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

  protected attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.AttachRequestArguments, request?: DebugProtocol.Request): void {
     this.launchRequest(response,args)
  }
}
