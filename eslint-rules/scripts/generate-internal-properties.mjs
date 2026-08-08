// One-off generator: scans get()/getProperty()/set() call sites across packages/**/src
// and emits data/settings/internal.yml with any property name not already known to
// libram's built-in property typing or already registered in data/settings/**/*.yml.
//
// Usage: node eslint-rules/scripts/generate-internal-properties.mjs
import { promises as fs } from "fs";
import path from "path";
import { parse, stringify } from "yaml";
import * as propertyTypes from "libram/dist/propertyTypes.js";

const SRC_DIRS = [
  "packages/kolmafia/src",
  "packages/browser/src",
  "packages/shared/src",
  "packages/relay/src",
];

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full)));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// Extracts the (possibly nested) argument list text for a call whose name ends at `openParenIndex - 1`.
function extractArgs(text, openParenIndex) {
  let depth = 0;
  let inString = null;
  const args = [];
  let current = "";

  for (let i = openParenIndex; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      current += ch;
      if (ch === "\\") {
        current += text[++i];
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      if (depth === 1 && ch === "(") continue; // skip the opening paren of this call
      current += ch;
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0 && ch === ")") {
        if (current.trim() !== "") args.push(current.trim());
        return args;
      }
      current += ch;
      continue;
    }

    if (ch === "," && depth === 1) {
      args.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  return args;
}

function findCalls(source, fnName) {
  const calls = [];
  const pattern = new RegExp(`(?<![.\\w])${fnName}\\s*\\(`, "g");
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const openParenIndex = match.index + match[0].length - 1;
    const args = extractArgs(source, openParenIndex);
    calls.push(args);
  }
  return calls;
}

function stringLiteral(arg) {
  const m = /^["'`]([A-Za-z0-9_]+)["'`]$/.exec(arg);
  return m ? m[1] : null;
}

// Infer a settings-yml-style type from a default-value expression.
function inferType(arg) {
  // Single-arg get(name) only means "exists" (boolean) for libram's known Deprecated*Property
  // names; for our own custom properties it hits libram's generic get(property: string,
  // _default?: string): string overload instead, so it tells us nothing about the real type.
  if (arg === undefined) return "unknown";
  if (/^(true|false)$/.test(arg)) return "boolean";
  if (/^-?\d+(\.\d+)?$/.test(arg)) return /\./.test(arg) ? "float" : "int";
  if (/^["'`].*["'`]$/.test(arg)) return "string";
  const enumMatch = /^([A-Za-z]+)\.none$/.exec(arg);
  if (enumMatch) return enumMatch[1].toLowerCase();
  return "unknown";
}

async function main() {
  const knownNames = new Set([
    ...propertyTypes.booleanProperties,
    ...propertyTypes.numericProperties,
    ...propertyTypes.monsterProperties,
    ...propertyTypes.monsterNumericProperties,
    ...propertyTypes.locationProperties,
    ...propertyTypes.stringProperties,
    ...propertyTypes.numericOrStringProperties,
    ...propertyTypes.familiarProperties,
    ...propertyTypes.familiarNumericProperties,
    ...propertyTypes.statProperties,
    ...propertyTypes.phylumProperties,
    ...propertyTypes.itemProperties,
    ...propertyTypes.itemNumericProperties,
  ]);

  const settingsDir = "data/settings";
  const settingsFiles = (
    await fs.readdir(settingsDir, { recursive: true, withFileTypes: true })
  ).filter(
    (f) => f.isFile() && f.name.endsWith(".yml") && f.name !== "internal.yml",
  );
  for (const file of settingsFiles) {
    const full = path.join(file.parentPath, file.name);
    const data = parse(await fs.readFile(full, "utf8"));
    if (!data) continue;
    for (const key of Object.keys(data)) knownNames.add(key);
  }

  const files = (await Promise.all(SRC_DIRS.map(listFiles))).flat();

  // name -> Map<type, count>
  const typeCounts = new Map();
  // name -> Map<type, count>, from get() call sites only (more informative than getProperty's raw string)
  const typedCounts = new Map();

  function record(map, name, type) {
    if (!map.has(name)) map.set(name, new Map());
    const counts = map.get(name);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");

    for (const args of findCalls(source, "get")) {
      const name = stringLiteral(args[0]);
      if (!name) continue;
      const type = inferType(args[1]);
      record(typeCounts, name, type);
      record(typedCounts, name, type);
    }

    for (const args of findCalls(source, "getProperty")) {
      const name = stringLiteral(args[0]);
      if (!name) continue;
      record(typeCounts, name, "string");
    }

    for (const args of findCalls(source, "set")) {
      const name = stringLiteral(args[0]);
      if (!name) continue;
      const type = inferType(args[1]);
      record(typeCounts, name, type);
      record(typedCounts, name, type);
    }
  }

  const result = {};
  const conflicts = [];

  for (const name of [...typeCounts.keys()].sort()) {
    if (knownNames.has(name)) continue;
    // Dynamic, per-choice-adventure properties KoLmafia creates at runtime - handled by regex in the lint rule.
    if (/^choiceAdventure\d+$/.test(name)) continue;

    // Prefer types inferred from get()'s default value over getProperty()'s raw "string" return,
    // since the default value reflects how the property is actually meant to be used.
    const counts = typedCounts.get(name) ?? typeCounts.get(name);
    // Prefer any type we could actually infer over "unknown" (an uninferrable default/value expression).
    const known = [...counts.entries()].filter(([t]) => t !== "unknown");
    const sorted = (known.length > 0 ? known : [...counts.entries()]).sort(
      (a, b) => b[1] - a[1],
    );
    const [bestType] = sorted[0];

    if (sorted.length > 1) {
      conflicts.push(
        `${name}: ${sorted.map(([t, c]) => `${t}(${c})`).join(", ")}`,
      );
    }

    result[name] = { type: bestType };
  }

  await fs.writeFile(path.join(settingsDir, "internal.yml"), stringify(result));

  console.log(
    `Wrote ${Object.keys(result).length} entries to data/settings/internal.yml`,
  );
  if (conflicts.length > 0) {
    console.log(
      `\n${conflicts.length} properties had conflicting inferred types (kept the most common) - please review:`,
    );
    for (const c of conflicts) console.log(`  ${c}`);
  }
}

await main();
