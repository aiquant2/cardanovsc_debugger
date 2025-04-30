# ⚡ cardanovsc_debugger 🚀  
[![Version](https://vsmarketplacebadges.dev/version/AIQUANT-TECHNOLOGIES.cardanovsc_debugger.svg)](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc_debugger)  
[![Downloads](https://vsmarketplacebadges.dev/downloads/AIQUANT-TECHNOLOGIES.cardanovsc_debugger.svg)](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc_debugger)  
[![Installs](https://vsmarketplacebadges.dev/installs/AIQUANT-TECHNOLOGIES.cardanovsc_debugger.svg)](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc_debugger)

## ✨ Features

**cardanovsc_debugger** is a lightweight yet powerful Visual Studio Code extension tailored for debugging Haskell and Plutus smart contracts. Whether you're developing for the Cardano blockchain or experimenting with Plutus scripts, this extension provides:

- 🔍 Seamless debugging support for `.hs` (Haskell) files.
- 🧠 Launch configuration support for customized debugging.
- `showIO`: Show standard I/O during debug.
- 📂 Integrated with VS Code Debug Adapter Protocol.
- 🚀 Real-time error checking and suggestion 


Perfect for developers working with Cardano’s Plutus smart contracts, CardanoVSC Debugger brings precision debugging right inside VS Code.


## 🚀 Getting Started

To start debugging Haskell or Plutus smart contracts with cardanovsc_debugger, follow the instructions below to set up your development environment and extension.


## 📥 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/AIQUANT-Tech/CardanoVSC.git
   cd CardanoVSC/cardanovsc/
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Debug the extension by clicking the VS Code debug icon.


OR, you can also do like this :

1. Go to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc_debugger).
2. Click **Install** or use the **Extensions** view in VS Code (`Ctrl+Shift+X`) and search for `cardanovsc_debugger`.
3. Once installed, the extension will activate automatically when you open `.hs` files.



## 📂 FOLDER STRUCTURE

```
└── 📁cardanovsc_debugger
    └── 📁.vscode
        └── extensions.json
        └── launch.json
        └── settings.json
        └── tasks.json
    └── 📁dist-newstyle
        └── 📁cache
            └── compiler
    └── 📁src
        └── cardanovscDebugAdapter.ts
        └── diagnostics.ts
        └── extension.ts
        └── 📁test
            └── extension.test.ts
    └── .gitignore
    └── .vscode-test.mjs
    └── .vscodeignore
    └── CHANGELOG.md
    └── diagnostic.js
    └── diagnostic.js.map
    └── eslint.config.mjs
    └── package-lock.json
    └── package.json
    └── README.md
    └── tsconfig.json
    └── vsc-extension-quickstart.md

```
## 🛠️ Usage

1. Open a `.hs` (Haskell) file in your VS Code workspace.
2. Press `ctrl+shift+D` or go to the **Run and Debug** sidebar and select **Run Extension**.
3. It automatically Configures your `launch.json` with the required fields:
```json OR you can also manually Configure like this:
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"args": [
				"--extensionDevelopmentPath=${workspaceFolder}"
			],
			"outFiles": [
				"${workspaceFolder}/out/**/*.js"
			],
			"preLaunchTask": "${defaultBuildTask}"
		}
	]
}

4.🚀 Automatic Debug Configuration 🚀 : When you open a Haskell file and start debugging, CardanoVSC Debugger intelligently creates a default debug configuration without requiring manual setup.

It checks if the file is a valid Haskell source.

If valid, it auto-generates a configuration like the following:

{
  "type": "haskell",
  "name": "Debug Haskell",
  "request": "launch",
  "program": "cabal repl --repl-no-load",
  "activeFile": "<your-current-haskell-file>",
  "showIO": true,
  "cwd": "<your-workspace-folder>"
}

This configuration is created dynamically using the active Haskell file in the editor.

If the file is not recognized as a valid Haskell file, a warning is displayed.

Start DebuggingPress F5 or open the Command Palette (Ctrl + Shift + P) → select and start Debugging: Run Extension.

Fix Errors Before DebuggingEnsure errors shown in the Problems panel are resolved for a smoother debugging experience. Suggestions will appear when you hover over the issues.


