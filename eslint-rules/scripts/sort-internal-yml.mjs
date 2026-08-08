import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const path = fileURLToPath(
  new URL("../../data/settings/internal.yml", import.meta.url),
);
const doc = parseDocument(readFileSync(path, "utf8"));

doc.contents.items.sort((a, b) => {
  const aKey = String(a.key);
  const bKey = String(b.key);

  const priority = (key) =>
    key.startsWith("auto_") || key.includes("*auto*") ? 0 : 1;

  return priority(aKey) - priority(bKey) || aKey.localeCompare(bKey);
});

writeFileSync(path, doc.toString());
