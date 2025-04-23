
import * as os from 'os';

import debounce from 'lodash/debounce';
import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

const diagnosticCollection = vscode.languages.createDiagnosticCollection("haskell");

 export const debouncedRunCabalBuild = debounce(parseCabalErrors, 1000, { leading: false, trailing: true });

export function parseCabalErrors(output: string, workspacePath: string) {
  diagnosticCollection.clear();
  const diagnosticsMap: Map<string, vscode.Diagnostic[]> = new Map();
  console.log("out",output);

  const errorRegex = /^(?<file>.+):(?<line>\d+):(?<column>\d+):\s+(?<type>error|warning|info):\s+(?<message>[\s\S]+?)(?=\n\S|$)/gm;
console.log(errorRegex);

  let match;
  let foundError = false;
 let extractedContent;
  while ((match = errorRegex.exec(output)) !== null) {
      foundError = true;

      const { file, line, column, type } = match.groups!;
      let message = match.groups!.message.trim();
      console.log("msg",message);
      console.log(type);
      const severity = getDiagnosticSeverity(type);
      console.log(severity);
      
      const filePath = path.resolve(workspacePath, file);
      console.log(filePath);
      const fileUri = vscode.Uri.file(filePath);

      const lineNum = parseInt(line) - 1;
      const colNum = parseInt(column) - 1;

      
      // Fetch the actual line text from the source file
      const document= vscode.workspace.textDocuments.find(doc => doc.fileName === filePath);
      if (!document) {
          console.error(`Document not found for file: ${filePath}`);
          continue;
      }

      const lineText = document.lineAt(lineNum).text;
        // Extract and log content from message up to lineText
    const startIdx = output.indexOf(message);
    const endIdx = output.indexOf(lineText, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
         extractedContent = output.substring(startIdx, endIdx + lineText.length);
        console.log("Extracted Content:", extractedContent);
    } else {
      extractedContent="no suggestion";
        console.warn("Could not extract full range.");
    }
    message = extractedContent
    .split("\n")
    .filter(line => !/^\s*\d*\s*\|/.test(line)) // Remove lines with optional number + "|"
    .join("\n");

      console.log("lineText:", lineText);

      // Find the next space after the column number
      const substringFromCol = lineText.substring(colNum);
      console.log("substringFromCol:", substringFromCol);

      let nextSpaceIndex = substringFromCol.indexOf(' ');
      if (nextSpaceIndex === -1) {
          nextSpaceIndex = substringFromCol.length; // If no space is found, use the entire substring
      }

      // Calculate the error length
      const errorLength = nextSpaceIndex;

      // Adjust the range to cover the entire error word
      const range = new vscode.Range(lineNum, colNum, lineNum, colNum + errorLength);

      const diagnostic = new vscode.Diagnostic(range, message , severity);

      if (!diagnosticsMap.has(fileUri.fsPath)) {
          diagnosticsMap.set(fileUri.fsPath, []);
      }
      diagnosticsMap.get(fileUri.fsPath)?.push(diagnostic);
  }

  const dependencyErrorRegex = /Error:\s+\[Cabal-\d+\]\nCould not resolve dependencies:\n([\s\S]+?)(?=\nAfter searching|$)/g;
  while ((match = dependencyErrorRegex.exec(output)) !== null) {
      foundError = true;

      const message = "Cabal Dependency Error: \n" + match[1].trim();
      const workspaceUri = vscode.Uri.file(workspacePath);
      const diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), message, vscode.DiagnosticSeverity.Error);
      diagnosticsMap.set(workspaceUri.fsPath, [diagnostic]);
  }

  const missingSourceRegex = /can't find source for (\S+) in ([\s\S]+?)(?=\n|$)/g;
  while ((match = missingSourceRegex.exec(output)) !== null) {
      foundError = true;

      const fileName = match[1];
      const message = `Missing source file: ${fileName} in ${match[2].trim()}`;
      const workspaceUri = vscode.Uri.file(workspacePath);
      const diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, message.length), message, vscode.DiagnosticSeverity.Error);
      diagnosticsMap.set(workspaceUri.fsPath, [diagnostic]);
  }

  if (!foundError) {
      const fallbackErrorRegex = /Error:([\s\S]+)/;
      const fallbackMatch = fallbackErrorRegex.exec(output);
      if (fallbackMatch) {
          const message = "error:\n" + fallbackMatch[1].trim();
          const workspaceUri = vscode.Uri.file(workspacePath);
          const diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 1, 0), message, vscode.DiagnosticSeverity.Error);
          diagnosticsMap.set(workspaceUri.fsPath, [diagnostic]);
      }
  }

  // Set diagnostics for all files
  for (const [file, diagnostics] of diagnosticsMap.entries()) {
      diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
  }
}

function getDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
        case "error":
            return vscode.DiagnosticSeverity.Error;
        case "warning":
            return vscode.DiagnosticSeverity.Warning;
        case "info":
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}

