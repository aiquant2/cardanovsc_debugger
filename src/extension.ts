
import * as vscode from "vscode";
import { HaskellDebugSession } from "./debugAdapter";
import { startGhcidOnHaskellOpen } from "./diagnostics";
import axios from "axios";
import { getLoadingHtml, wrapHtml, buildUtxoHtml } from "./utils/webview";

const BLOCKFROST_API_KEY = "preprodyTn8tbXVaM3yr5LRyM5RDwhuopT06lAD";
const NETWORK = "preprod";

export function activate(context: vscode.ExtensionContext) {
  console.log("Haskell Debugger extension activated");

  startGhcidOnHaskellOpen(context);

  const helloCmd = vscode.commands.registerCommand(
    "cardanovscDebugger.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from CardanoVSC Debugger!");
    }
  );
  context.subscriptions.push(helloCmd);

  const utxoCmd = vscode.commands.registerCommand(
    "cardanovscDebugger.getUtxoDetails",
    async () => {
      const inputAddress = await vscode.window.showInputBox({
        prompt: "Enter the Cardano script address",
        placeHolder: "addr1...",
        ignoreFocusOut: true,
      });

      const scriptAddress = inputAddress?.trim();

      if (!scriptAddress) {
        vscode.window.showErrorMessage("Script address is required.");
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "cardanoUtxoInfo",
        "Cardano UTXO Info",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getLoadingHtml(scriptAddress);

      try {
        const utxoRes = await axios.get(
          `https://cardano-${NETWORK}.blockfrost.io/api/v0/addresses/${scriptAddress}/utxos`,
          {
            headers: { project_id: BLOCKFROST_API_KEY },
          }
        );

        const utxos = utxoRes.data;
        if (!utxos || utxos.length === 0) {
          panel.webview.html = wrapHtml(`<p>No UTXOs found at this address.</p>`);
          return;
        }

        const latestUtxo = utxos[utxos.length - 1];

        let datumHtml = "";
        if (latestUtxo.data_hash) {
          try {
            const datumRes = await axios.get(
              `https://cardano-${NETWORK}.blockfrost.io/api/v0/scripts/datum/${latestUtxo.data_hash}`,
              { headers: { project_id: BLOCKFROST_API_KEY } }
            );

            datumHtml = `
              <h3>Datum Hash</h3><code class="highlight">${latestUtxo.data_hash}</code>
              <h3>Datum Value</h3><pre>${JSON.stringify(datumRes.data, null, 2)}</pre>`;
          } catch {
            datumHtml = `<p>❌ Failed to fetch datum for hash <code class="highlight">${latestUtxo.data_hash}</code></p>`;
          }
        } else if (latestUtxo.inline_datum) {
          datumHtml = `<h3>Inline Datum</h3><code>${latestUtxo.inline_datum}</code>`;
        }

        panel.webview.html = buildUtxoHtml(latestUtxo, datumHtml);
      } catch (err: any) {
        panel.webview.html = wrapHtml(
          `<p style="color:red;">❌ Error: ${err.message || err}</p>`
        );
      }
    }
  );
  context.subscriptions.push(utxoCmd);

  const configProvider = new HaskellConfigurationProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("haskell", configProvider)
  );

  const debugAdapterFactory = new InlineDebugAdapterFactory();
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory("haskell", debugAdapterFactory)
  );
}

export function deactivate() {
  console.log("Haskell Debugger extension deactivated");
}

export class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(
      session: vscode.DebugSession
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
      try {
        return new vscode.DebugAdapterInlineImplementation(new HaskellDebugSession());
      } catch (error) {
        console.error('Failed to create debug adapter:', error);
        throw error; // re-throw so test can catch it
      }
    }
  }
  

export class HaskellConfigurationProvider implements vscode.DebugConfigurationProvider {
  resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    if (!config.type && !config.request && !config.name) {
      return this.createDefaultConfig();
    }
    return this.validateAndEnhanceConfig(config);
  }

  private createDefaultConfig(): vscode.DebugConfiguration | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId !== "haskell") {
      this.showNoHaskellFileError();
      return undefined;
    }

    return {
      type: "haskell",
      name: "Debug Haskell",
      request: "launch",
      program: "cabal repl --repl-no-load",
      activeFile: editor.document.fileName,
      showIO: true,
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    };
  }

  private validateAndEnhanceConfig(
    config: vscode.DebugConfiguration
  ): vscode.DebugConfiguration {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === "haskell" && !config.activeFile) {
      config.activeFile = editor.document.fileName;
    }

    config.program = config.program || "cabal repl --repl-no-load";
    config.stopOnEntry = config.stopOnEntry || false;
    config.showIO = config.showIO !== false;
    config.cwd = config.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return config;
  }

  private async showNoHaskellFileError(): Promise<void> {
    await vscode.window.showErrorMessage(
      "Active file must be a Haskell source file (.hs)"
    );
  }
}
