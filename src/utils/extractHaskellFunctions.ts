import * as fs from "fs/promises";

interface HaskellFunction {
  name: string;
  args: string[];
  body: string[];
}

/**
 * Extracts Haskell functions from the given file.
 * @param filePath - Path to the Haskell source file
 * @returns Array of Haskell function definitions with name, args, and body
 */
export async function extractHaskellFunctions(filePath: string): Promise<HaskellFunction[]> {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");

  const functionRegex = /^([a-zA-Z_][a-zA-Z0-9_']*)\s*((?:[^\=]*)?)\s*=\s*(.*)$/;

  const functions: HaskellFunction[] = [];
  let currentFunc: HaskellFunction | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("--")) {continue;}

    const match = trimmed.match(functionRegex);

    if (match) {
      if (currentFunc) {
        functions.push(currentFunc);
      }

      const name = match[1];
      const args = match[2].trim() ? match[2].trim().split(/\s+/) : [];
      const bodyLine = match[3];

      currentFunc = {
        name,
        args,
        body: [bodyLine],
      };
    } else if (currentFunc && /^\s+/.test(line)) {
      currentFunc.body.push(trimmed);
    } else {
      if (currentFunc) {
        functions.push(currentFunc);
        currentFunc = null;
      }
    }
  }

  if (currentFunc) {
    functions.push(currentFunc);
  }

  return functions;
}