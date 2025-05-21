import * as vscode from "vscode";

export const import_data = async () => {
  try {
    const ext = vscode.extensions.getExtension("AIQUANT-TECHNOLOGIES.cardanovsc");

    if (!ext) {
      vscode.window.showErrorMessage("Cardanovsc extension not found.");
      return;
    }

    const api = ext.isActive ? ext.exports : await ext.activate();

    if (!api) {
      vscode.window.showErrorMessage("Cardanovsc extension not ready. Please activate it and try again.");
      return;
    }

    const config = api.getFirstNetworkConfig();
    if (!config) {
      vscode.window.showErrorMessage("No Cardano network config found. Please connect via the 'cardanovsc' extension.");
      return;
    }

    const lucid = await api.initializeLucid(config.network, config.apiKey);
    if (lucid) {
      vscode.window.showInformationMessage("Lucid initialized successfully.");
    }

  } catch (error: any) {
    console.error("Error initializing Lucid:", error);
    vscode.window.showErrorMessage(`Failed to initialize Lucid: ${error.message || error}`);
  }
};
