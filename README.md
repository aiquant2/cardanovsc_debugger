# ⚡ cardanovsc_debugger 🚀  
[![Version](https://vsmarketplacebadges.dev/version/AIQUANT-TECHNOLOGIES.cardanovsc.svg)](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc)  [![Downloads](https://vsmarketplacebadges.dev/downloads/AIQUANT-TECHNOLOGIES.cardanovsc.svg)]([https://marketplace.visualstudio.com/items?itemName=juanblanco.solidity](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc)) [![Installs](https://vsmarketplacebadges.dev/installs/AIQUANT-TECHNOLOGIES.cardanovsc.svg)](https://marketplace.visualstudio.com/items?itemName=AIQUANT-TECHNOLOGIES.cardanovsc)


## ✨ Features

**cardanovsc_debugger (vscode extension)** is a lightweight yet powerful Visual Studio Code extension tailored for debugging Haskell and Plutus smart contracts. Whether you're developing for the Cardano blockchain or experimenting with Plutus scripts, this extension provides:

- 🔍 Seamless debugging support for `.hs` (Haskell) files.
- showing `module_name `, `file_name` , `argument value` , functions in debug variable section .
- 📂 Integrated with VS Code Debug Adapter Protocol.
- 🚀 Real-time error checking and suggestion 
- and also register command to get latest utxo of script after locking transaction. that is `get_latest_utxo`


Perfect for developers working with Cardano’s Plutus smart contracts, CardanoVSC Debugger brings precision debugging right inside VS Code.


## 🚀 Getting Started

To start debugging Haskell or Plutus smart contracts with cardanovsc_debugger, follow the instructions below to set up your development environment and extension.


## 📥 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/AIQUANT-Tech/CardanoVSC.git
   cd CardanoVSC/cardanovsc-debugger/
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Debug the extension by clicking the VS Code debug icon.

OR, you can also do like this :

1. Go to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/vscode).
2. Click **Install** or use the **Extensions** view in VS Code (`Ctrl+Shift+X`) and search for `cardanovsc_debugger`.
3. Upon installation, a notification will prompt you to install the cardanovsc extension as it is a required dependency for cardanovsc_debugger.
4. Once installed, the extension will activate automatically when you open `.hs` files in vscode.





Upon installation, a notification will prompt you to install the cardanovsc extension as it is a required dependency for cardanovsc_debugger.

## 🏗️ Development

### ✅ Running Tests


To run tests:
```sh
npm run test
```
## 📂 FOLDER STRUCTURE

```
└── 📁cardanovsc_debugger
    └── 📁.vscode
        └── extensions.json
        └── launch.json
        └── settings.json
        └── tasks.json
    └── 📁media
    └── 📁scripts
    └── 📁src
        └── debugAdapter.ts
        └── diagnostics.ts
        └── extension.ts
        └── importData.ts
        └── 📁utils
            └── extractHaskellFunctions.ts
            └── webview.ts
        └── 📁test
            └── extension.test.ts
            └── diagnostics.test.ts
            └── debugAdapter.test.ts
    └── .gitignore
    └── .vscode-test.mjs
    └── .vscodeignore
    └── CHANGELOG.md
    └── eslint.config.mjs
    └── package-lock.json
    └── package.json
    └── README.md
    └── tsconfig.json
    └── vsc-extension-quickstart.md

```
## 🛠️ Usage
### Install 
##### cabal
```
$ cabal update
$ cabal install ghcid
```


### Run
## 1. Create a project

### Cabal project
```
$ mkdir project_name
$ cd project_name
$ cabal init
```

1. Open a `.hs` (Haskell) file in your VS Code workspace.
2. Press `ctrl+shift+D` or go to the **Run and Debug** sidebar and select **debug cabal project**.
3. 🚀 Automatic Debug Configuration 🚀 : When you open a Haskell file and start debugging, CardanoVSC Debugger intelligently creates a default debug configuration without requiring manual setup.

##### It checks if the file is a valid Haskell source.

##### If valid, it auto-generates a configuration like the following:
```
{
  "type": "haskell",
  "name": "debug cabal project",
  "request": "launch",
  "program": "cabal repl --repl-no-load",
  "activeFile": "${file}",
  "showIO": true,
  "cwd": "${workspaceFolder}"
}
```

## 🧩 Manual Setup (Optional)
##### If you prefer manual configuration, create or update .vscode/launch.json with the following json:
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "haskell",
      "request": "launch",
      "name": "Debug Cabal Project",
      "program": "cabal repl --repl-no-load",
      "activeFile": "${file}",
      "showIO": true,
      "cwd": "${workspaceFolder}"
    }
  ]
}
```
You can customize name, cwd, or add more configs based on your needs.


## 🤝 Contributing
Contributions are welcome! Please open an issue or pull request on GitHub.

## 📜 License
This project is licensed under the MIT License.

## 📌Scope and Design Documentation

- **Scope and Design Document:** https://github.com/AIQUANT-Tech/CardanoVSC/blob/main/DesignDocs/CardanoVSC-Scope_Design_Document.pdf
- **Figma Design:** https://www.figma.com/design/MiVmXAtePUc3UndaGl7eGK


