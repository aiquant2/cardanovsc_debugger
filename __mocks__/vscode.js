// module.exports = {
//     languages: {
//       createDiagnosticCollection: jest.fn(() => ({
//         set: jest.fn(),
//         clear: jest.fn(),
//         delete: jest.fn(),
//       })),
//     },
//     window: {
//       showInformationMessage: jest.fn(),
//       showErrorMessage: jest.fn(),
//     },
//     workspace: {
//       onDidSaveTextDocument: jest.fn(),
//       getConfiguration: jest.fn(() => ({
//         get: jest.fn(),
//       })),
//     },
//     Uri: {
//       file: jest.fn(),
//     },
//     DiagnosticSeverity: {
//       Error: 0,
//       Warning: 1,
//       Information: 2,
//       Hint: 3,
//     },
//   };
  

// module.exports = {
//     languages: {
//       createDiagnosticCollection: jest.fn(() => ({
//         set: jest.fn(),
//         clear: jest.fn(),
//       })),
//     },
//     DiagnosticSeverity: {
//       Error: 0,
//       Warning: 1,
//       Information: 2,
//       Hint: 3,
//     },
//     Range: function () {},
//     Diagnostic: function () {},
//     OverviewRulerLane: {
//       Right: 2,
//     },
//     window: {
//       activeTextEditor: {
//         setDecorations: jest.fn(),
//       },
//     },
//   };
  




module.exports = {
    languages: {
      createDiagnosticCollection: jest.fn(() => ({
        set: jest.fn(),
        clear: jest.fn(),
        delete: jest.fn(),
      })),
    },
    window: {
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
    },
    workspace: {
      onDidSaveTextDocument: jest.fn(),
      getConfiguration: jest.fn(() => ({
        get: jest.fn(),
      })),
    },
    Uri: {
      file: jest.fn(),
    },
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3,
    },
  };
  