import { promises as fs } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { parseDocument } from "yaml";

const SETTINGS_DIR = "data/settings";
const SRC_DIR = "packages";

async function findFiles(dir, matches) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await findFiles(full, matches)));
    else if (matches(entry.name)) files.push(full);
  }
  return files;
}

function collectStringLiterals(text, literals) {
  const source = ts.createSourceFile(
    "file.ts",
    text,
    ts.ScriptTarget.Latest,
    false,
  );

  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
    ) {
      literals.add(node.text);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
}

async function main() {
  const sourceFiles = await findFiles(SRC_DIR, (name) => /\.tsx?$/.test(name));

  const literals = new Set();
  for (const file of sourceFiles) {
    collectStringLiterals(await fs.readFile(file, "utf8"), literals);
  }

  const settingsFiles = (
    await fs.readdir(SETTINGS_DIR, { recursive: true, withFileTypes: true })
  ).filter(
    (f) => f.isFile() && f.name.endsWith(".yml") && f.name !== "groups.yml",
  );

  const unused = [];

  for (const file of settingsFiles) {
    const relativePath = path.join(file.parentPath, file.name);
    const doc = parseDocument(await fs.readFile(relativePath, "utf8"));
    if (!doc.contents) continue;

    for (const entry of doc.contents.items) {
      const property = String(entry.key);
      if (!literals.has(property)) {
        unused.push({ property, file: relativePath });
      }
    }
  }

  if (unused.length === 0) {
    console.log("No unused settings found.");
    return;
  }

  console.log(`${unused.length} declared setting(s) look unused:\n`);
  for (const { property, file } of unused) {
    console.log(`${property} (${file})`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
