
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
import { Thread } from "@vscode/debugadapter";
import { importMap } from './config/importMap';

export interface thread extends DebugProtocol.Thread{
  id:number,
  name:string
}
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
public ghciProcess: child_process.ChildProcess | undefined;
private isFileLoaded = false;
private loadDebounceTimer: NodeJS.Timeout | undefined;
private lastLoadedFileContent: string | undefined;
private launchArgs: HaskellLaunchRequestArguments | undefined;
private isRestarting = false;
private static THREAD_ID = 1;
private datumValue: string = "";
_flag:boolean =false;
_currentLine!: number;
_breakpoints: any;
_currentFilePath!: string;
private _currentLineContent: string = "";
private _stepInFunction: string | null = null;
private _stepInArgs: string[] | null = null;



private _callStack: { name: string; args: string[]; line: number }[] = [];
  workspaceRoot!: string;
  static launchArgs: any;

  // variable panel

  protected threadsRequest (
    response: DebugProtocol.ThreadsResponse,
    _request?: DebugProtocol.Request
  ): void {
    
    response.body = {
   
      threads: [
        new Thread(HaskellDebugSession.THREAD_ID,"main")
      ]
    };

    this.sendResponse(response);
  }


  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {

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



private _variableStore: Map<string, Map<string, string>> = new Map(); // functionName → { argName → value }
private _functions: Map<string, string[]> = new Map(); // functionName → [arg1, arg2, ...]


// 6 no. 

protected async variablesRequest(
  response: DebugProtocol.VariablesResponse,
  args: DebugProtocol.VariablesArguments
): Promise<void> {
  const variables: DebugProtocol.Variable[] = [];

  const filePath = this.launchArgs?.activeFile;
  const currentLine = this._currentLine;

  const fileName = path.basename(filePath || "unknown");
  const dirName = path.dirname(filePath || "unknown");

  // 📁 Basic File Info

  variables.push(
    { name: "File", value: fileName, variablesReference: 0 },
    { name: "Directory", value: dirName, variablesReference: 0 },
    { name: "f: myValidator", value: `myValidator :: BuiltinData -> BuiltinData -> BuiltinData -> ()`, variablesReference: 0 },
    { name: "datum", value: this.datumValue || "<not set>", variablesReference: 0, evaluateName: "cborHex" },
    
  );

  const moduleName = filePath ? await this.getModuleNameFromFile(filePath) : null;
  if (moduleName) {
    variables.push({
      name: "📄 Module",
      value: moduleName,
      variablesReference: 0,
    });
  }

  // ▶️ Step-In Function Info (if user stepped into a function)
  if (this._stepInFunction) {
    variables.push({
      name: `▶ Step Into Function`,
      value: this._stepInFunction,
      variablesReference: 0,
    });

    // Show arguments passed to the function
    (this._stepInArgs || []).forEach((arg, index) => {
      variables.push({
        name: `  └─ arg${index + 1}`,
        value: arg,
        variablesReference: 0,
      });
    });
  }

  // 🔍 Scan parsed function calls up to current line for display
  if (filePath && currentLine !== undefined) {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n").slice(0, currentLine);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsed = this.parseFunctionCall(line);
      if (parsed) {
        const { name, args } = parsed;
        const lineNum = i + 1;

        variables.push({
          name: `Function (line ${lineNum})`,
          value: `${name} ${args.length > 0 ? args.join(" ") : "(no arguments)"}`,
          variablesReference: 0,
        });

        args.forEach((arg, index) => {
          variables.push({
            name: `  └─ arg${index + 1}`,
            value: arg,
            variablesReference: 0,
          });
          
        });
      }
    }
  }

  response.body = { variables };
  this.sendResponse(response);

}

private async getModuleNameFromFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      const match = line.match(/^\s*module\s+([\w.]+)(\s*\(.*\))?\s+where/);
      if (match) {
        console.log("✅ Module Found:", match[1]);
        return match[1]; // e.g., HelloWorld.Compiler
      }
    }

    console.warn("⚠️ No module declaration found in file:", filePath);
    return null;
  } catch (error) {
    console.error("❌ Failed to read file:", error);
    return null;
  }
}



// 4 no. without step in  

// protected async variablesRequest(
//   response: DebugProtocol.VariablesResponse,
//   args: DebugProtocol.VariablesArguments
// ): Promise<void> {
//   const variables: DebugProtocol.Variable[] = [];

//   const filePath = this.launchArgs?.activeFile;
//   const currentLine = this._currentLine;

//   const fileName = path.basename(filePath || "unknown");
//   const dirName = path.dirname(filePath || "unknown");

//   variables.push(
//     { name: "File", value: fileName, variablesReference: 0 },
//     { name: "Directory", value: dirName, variablesReference: 0 },
//     { name: "f: myValidator", value: `myValidator :: BuiltinData -> BuiltinData -> BuiltinData -> ()`, variablesReference: 0 },
//     { name: "datum", value: this.datumValue || "<not set>", variablesReference: 0, evaluateName: "cborHex" }
//   );

//   if (filePath && currentLine !== undefined) {
//     const content = await fs.readFile(filePath, "utf8");
//     const lines = content.split("\n").slice(0, currentLine);

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const parsed = this.parseFunctionCall(line);
//       if (parsed) {
//         const { name, args } = parsed;
//         const lineNum = i + 1;

//         variables.push({
//           name: `Function (line ${lineNum})`,
//           value: `${name} ${args.length > 0 ? args.join(" ") : "(no arguments)"}`,
//           variablesReference: 0,
//         });

//         args.forEach((arg, index) => {
//           variables.push({
//             name: `  └─ arg${index + 1}`,
//             value: arg,
//             variablesReference: 0,
//           });
//         });
//       }
//     }
//   }

//   response.body = { variables };
//   this.sendResponse(response);
// }
 

  protected async stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    args: DebugProtocol.StackTraceArguments
  ): Promise<void> {
    const activeFile = this.launchArgs?.activeFile || "unknown";
  
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

  protected setVariableRequest(
    response: DebugProtocol.SetVariableResponse,
    args: DebugProtocol.SetVariableArguments,
    request?: DebugProtocol.Request
  ): void {
    // Extract info from args
    const { variablesReference, name, value } = args;
  
  
    // You should apply the value update to the backend/debugged program here.
    // For example, call your internal logic to update the variable value.
  
    // Dummy implementation: simply echo the input
    response.body = {
      value: value,
      variablesReference: 0 // 0 means it's not an object with child properties
    };
  
    this.sendResponse(response);
  }
  
  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {

    const breakpoints = args.breakpoints?.map((bp) => bp.line) || [];

    this._breakpoints = breakpoints; // ✅ Initialize your internal breakpoints list

    response.body = {
      breakpoints: breakpoints.map((line) => ({
        verified: true,
        line,
      })),
    };

    if (this.launchArgs) {
      this.launchRequest(response, this.launchArgs);
    } else {
      this.sendErrorResponse(response, {
        id: 1004,
        format: "Cannot restart: No previous launch configuration available",
      });
    }
    this.sendResponse(response);
  }


// old working

  protected async nextRequest(
    response: DebugProtocol.NextResponse,
    args: DebugProtocol.NextArguments
  ): Promise<void> {
  
    if (!this._breakpoints || this._breakpoints.length === 0) {
      this._flag = true;
      
      this.sendResponse(response);
      if (this.launchArgs) {
        await this.launchRequest(response, this.launchArgs);
      } else {
        this.sendErrorResponse(response, {
          id: 1004,
          format: "Cannot restart: No previous launch configuration available",
        });
      }
      return;
    }
//
    const editor = vscode.window.activeTextEditor;
if (editor && this._currentLine) {
  const doc = editor.document;
  const currentLineText = doc.lineAt(this._currentLine - 1).text.trim();
  this._currentLineContent = currentLineText;
}


  
    // First step
    if (this._currentLine === undefined) {
      this._currentLine = this._breakpoints[0];
      this.sendEvent(new StoppedEvent("breakpoint", HaskellDebugSession.THREAD_ID));
      this.sendResponse(response);
      return;
    }
  
    const currentIdx = this._breakpoints.indexOf(this._currentLine);
  
    if (currentIdx === -1 || currentIdx === this._breakpoints.length - 1) {
      // No more breakpoints — continue execution
      this._currentLine === undefined;
      this._flag = true;
  
      this.sendEvent(new ContinuedEvent(HaskellDebugSession.THREAD_ID));
      this.sendResponse(response);
      if (this.launchArgs) {
        await this.launchRequest(response, this.launchArgs);
      } else {
        this.sendErrorResponse(response, {
          id: 1004,
          format: "Cannot restart: No previous launch configuration available",
        });
      }
      return;
    }
  
    // Move to next breakpoint
    this._currentLine = this._breakpoints[currentIdx + 1];
    this._flag = false;
  
    this.sendEvent(new StoppedEvent("step", HaskellDebugSession.THREAD_ID));
    this.sendResponse(response);
  }



// 1 no. 

  private parseFunctionCall(line: string): { name: string; args: string[] } | null {
    const trimmed = line.trim();
  
    // Ignore comments or type signatures
    if (!trimmed || trimmed.startsWith("--") || /^\w+\s*::/.test(trimmed)) {
      return null;
    }
  
    // Match: name [args] = RHS
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_']*)\s*(.*?)\s*=\s*(.+)$/);
    if (!match) return null;
  
    const name = match[1];
    const lhsArgs = match[2]?.trim().split(/\s+/).filter(Boolean) || [];
    const rhs = match[3].trim();
  
    console.log("parse call");
    
    // Now extract arguments from RHS function call
    const rhsArgsMatch = rhs.match(/^[a-zA-Z_][a-zA-Z0-9_']*\s+(.+)$/);
    let rhsArgs: string[] = [];
  
    if (rhsArgsMatch) {
      // Split arguments safely on spaces, but keep quoted strings together
      const argsPart = rhsArgsMatch[1];
      const argRegex = /"[^"]*"|[^\s]+/g;
      rhsArgs = [...argsPart.matchAll(argRegex)].map(m => m[0]);
    }
  
    // Use RHS arguments as function call arguments if no LHS ones
    const finalArgs = lhsArgs.length > 0 ? lhsArgs : rhsArgs;
  
    return { name, args: finalArgs };

    
  }

  // 6 no. 

  
  protected stepInTargetsRequest(
    response: DebugProtocol.StepInTargetsResponse,
    args: DebugProtocol.StepInTargetsArguments,
    request?: DebugProtocol.Request
  ): void {
    const filePath = this.launchArgs?.activeFile;
    const line = this._currentLine;
  
    console.log("hii");
    
    if (!filePath || line === undefined) {
      this.sendResponse(response);
      return;
    }
   console.log(filePath, "filepath");
   
    fs.readFile(filePath, "utf8").then((content) => {
      const lines = content.split("\n");
      const currentLineText = lines[line];
  
      const functions = this.extractFunctionsFromLine(currentLineText);
  
      console.log("stepinTargetrequest called");
      
      const targets = functions.map((fn, idx) => ({
        id: idx + 1,
        label: fn.name,
        line: line,
        column: fn.index + 1,
      }));
  
      const importMap = this.extractImportMapFromFile(content);

      console.log("📍 stepInTargetsRequest called");

      console.log(importMap);
      
      response.body = { targets };
      this.sendResponse(response);
    }).catch(() => this.sendResponse(response));
    this.sendEvent(new OutputEvent("📍 stepInTargetsRequest triggered\n"));

  }

  // *****

  // private extractImportMapFromFile(content: string): Record<string, string> {
  //   const map: Record<string, string> = {};
  //   const regex = /import\s+(\w+)\s+as\s+(\w+)/g;
  //   let match;
  
  //   while ((match = regex.exec(content)) !== null) {
  //     const [_, modulePath, alias] = match;
  //     map[alias] = modulePath;
  //   }
  
  //   return map;
  // }

  // new 

  private extractImportMapFromFile(fileContent: string): Record<string, string> {
    const importRegex = /^import\s+(qualified\s+)?([\w\.]+)(?:\s+as\s+(\w+))?(?:\s*\((.*?)\))?/gm;
    const importMap: Record<string, string> = {};
  
    let match: RegExpExecArray | null;
  
    while ((match = importRegex.exec(fileContent)) !== null) {
      const [, qualified, modulePath, alias, importedFns] = match;
      const moduleAlias = alias || (qualified ? modulePath : ""); // If no alias and not qualified, unqualified import
  
      if (importedFns) {
        const functions = importedFns.split(",").map(fn => fn.trim());
        for (const fn of functions) {
          importMap[fn] = modulePath;
        }
      }
  
      if (moduleAlias !== "") {
        importMap[moduleAlias] = modulePath;
      } else {
        importMap[modulePath] = modulePath;
      }
    }
  
    return importMap;
  }
  

  //
  private extractFunctionsFromLine(line: string): { name: string; index: number }[] {
    const matches: { name: string; index: number }[] = [];
  
    const cleanedLine = line.replace(/"[^"]*"/g, '""'); // Replace strings
  
    const regex = /\b([A-Za-z_][A-Za-z0-9_]*\.[a-z_][A-Za-z0-9_]*|[A-Za-z_][A-Za-z0-9_]*)\b/g;
  
    let match;
    while ((match = regex.exec(cleanedLine)) !== null) {
      const name = match[1];
  
      const keywords = new Set([
        "let", "in", "do", "case", "of", "then", "else", "where", "module", "import"
      ]);
  
      if (!keywords.has(name)) {
        matches.push({ name, index: match.index });
      }
    }
  
    console.log("💡 Extracted functions:", matches);
    return matches;
  }
  

// new new stepin



protected async stepInRequest(
  response: DebugProtocol.StepInResponse,
  args: DebugProtocol.StepInArguments
): Promise<void> {
  const filePath = this.launchArgs?.activeFile;
  const line = this._currentLine;

  if (!filePath || line === undefined) {
    this.sendResponse(response);
    return;
  }

  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");

  if (line < 0 || line >= lines.length) {
    this.sendEvent(new OutputEvent(`❌ Invalid line number: ${line}\n`));
    this.sendResponse(response);
    return;
  }

  const currentLineText =
    lines[line - 1]?.trim() !== ""
      ? lines[line - 1]
      : lines[line]?.trim() !== ""
      ? lines[line]
      : lines[line + 1] ?? "";

  console.log("📌 Current line number:", line);
  console.log("🔍 Raw line content:", JSON.stringify(currentLineText));

  const rhsMatch = currentLineText.split("=").slice(1).join("=").trim();

  if (!rhsMatch) {
    this.sendEvent(new OutputEvent("❌ No right-hand side expression to evaluate.\n"));
    this.sendResponse(response);
    return;
  }

  const calledFnMatch = rhsMatch.match(/^([a-zA-Z0-9_\.]+)/);
  const calledFnName = calledFnMatch?.[1];

  if (!calledFnName) {
    this.sendEvent(new OutputEvent("❌ No function call found on RHS.\n"));
    this.sendResponse(response);
    return;
  }

  console.log("🔧 Called function name:", calledFnName);

  const argsRegex = /\([^\)]*\)|"[^"]*"|[^\s]+/g;
  const allTokens = rhsMatch.match(argsRegex) || [];
  const filteredArgs = allTokens.filter(arg => !arg.includes(calledFnName));

  console.log("📦 Function arguments:", filteredArgs);

  const importMap = this.extractImportMapFromFile(content);

  let moduleAlias = "";
  let functionName = "";

  if (calledFnName.includes(".")) {
    [moduleAlias, functionName] = calledFnName.split(".");
  } else {
    functionName = calledFnName;

    // First, try to find the function in the current file
    const localFnLine = await this.findLineNumberOfFunction(filePath, functionName);
    if (localFnLine !== null) {
      moduleAlias = ""; // means it's local
    } else {
      // Check if it's in the import map (used without alias)
      const foundImport = Object.entries(importMap).find(([alias]) =>
        content.includes(`${alias}.${functionName}`)
      );

      if (foundImport) {
        [moduleAlias] = foundImport;
      } else {
        // Fallback to standard library functions
        const stdLibFallbacks: Record<string, string> = {
          putStrLn: "Prelude",
          print: "Prelude",
          return: "Prelude",
          show: "Prelude",
          writeFile: "Prelude",
          getLine: "Prelude",
          readFile: "Prelude",
          createDirectoryIfMissing: "System.Directory",
        };

        const fallbackModule = stdLibFallbacks[functionName];
        if (fallbackModule) {
          moduleAlias = fallbackModule;
        } else {
          this.sendEvent(
            new OutputEvent(
              `❌ Could not resolve module for unqualified function call '${functionName}'.\n` +
              `Hint: Ensure the function is defined locally or used with a qualified alias.\n`
            )
          );
          this.sendResponse(response);
          return;
        }
      }
    }
  }

  let targetFilePath = filePath;

  if (moduleAlias !== "") {
    const resolvedModule = importMap[moduleAlias] ?? moduleAlias;
    targetFilePath = this.resolveFilePathFromModule(resolvedModule);

    if (!targetFilePath) {
      this.sendEvent(new OutputEvent("❌ Could not resolve file path for module.\n"));
      this.sendResponse(response);
      return;
    }
  }

  const functionLine = await this.findLineNumberOfFunction(targetFilePath, functionName);

  console.log("📁 Resolved file path:", targetFilePath);

  if (functionLine !== null) {
    this._jumpToFile(targetFilePath, functionLine);

    this.sendEvent(new OutputEvent(
      `🪜 Stepped into '${functionName}' at ${targetFilePath}:${functionLine + 1}\n`
    ));

    this._stepInFunction = calledFnName;
    this._stepInArgs = filteredArgs;
    this._callStack.push({ name: calledFnName, args: filteredArgs, line });
  } else {
    console.log("❌ Function not found in file:", targetFilePath, "for function:", functionName);
    this.sendEvent(new OutputEvent("❌ Could not locate function definition.\n"));
  }

  this.sendResponse(response);
}


private _jumpToFile(filePath: string, line: number) {
  if (!this.launchArgs) {
    this.launchArgs = {} as HaskellLaunchRequestArguments; // Or your custom type
  }

  this.launchArgs.activeFile = filePath;
  this._currentLine = line;
  // Possibly emit event or update editor state if needed
}


 //
  private resolveFilePathFromModule(modulePath: string): string {
    console.log("work",this.workspaceRoot);
    
    return path.join(this.workspaceRoot, modulePath.replace(/\./g, '/')) + ".hs";
   
    
  }
  
  private async findLineNumberOfFunction(filePath: string, functionName: string): Promise<number | null> {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith(functionName + " ") || trimmed.startsWith(functionName + "::")) {
        return i;
      }
    }
    return null;
  }
  
  
  // end of variable panel



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
    response.body.supportsStepInTargetsRequest= true;
    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  public async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: HaskellLaunchRequestArguments
  ): Promise<void> {
    this.launchArgs = args;

    try {
      diagnosticCollection.clear();
   console.log(this._currentLine);
   
      let x = "";
      let y = "";
  
      // Set launch args
      const editor = vscode.window.activeTextEditor;
      args.activeFile = editor?.document.fileName;
      this.launchArgs = args;
  
      // Check program validity
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
  
      // 🔁 Reset critical flags and clean previous state
    
      this.isFileLoaded = false;
      this.isRestarting = false;
  
      // Kill existing GHCi process if any
      if (this.ghciProcess) {
        this.ghciProcess.removeAllListeners();
        this.ghciProcess.kill("SIGKILL");
        this.ghciProcess = undefined;
      }
  
      // Parse the program command
      const [cmd, ...cmdArgs] = programCommand.split(" ");
      this.sendEvent(new OutputEvent("Launching GHCi...\n", "console"));
  
      this._currentFilePath = args.activeFile || "unknown";
  
      // ✅ Breakpoint fallback logic
      if (!this._breakpoints || this._breakpoints.length === 0) {
        this._currentLine = 1;
        this.sendEvent(new StoppedEvent("entry", 1));
      } else {
        this._currentLine = this._breakpoints[0];
        this.sendEvent(new StoppedEvent("breakpoint", 1));
      }
     
      
  if(this._currentLine==-1){
    this._flag=true;
  }
      // Launch GHCi only once per launch
      if (this._flag) {
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
  
        this._flag = false;
      }
  
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
      this._flag=false;
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

  protected attachRequest(
    response: DebugProtocol.AttachResponse,
    args: DebugProtocol.AttachRequestArguments,
    request?: DebugProtocol.Request
  ): void {
    this.launchRequest(response, args);
  }
}































