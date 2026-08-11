import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const path = fileURLToPath(
  new URL("../../data/settings/internal.yml", import.meta.url),
);

export async function main() {
  const existing = readFileSync(path, "utf8");
  const doc = parseDocument(existing);

  doc.contents.items.sort((a, b) => {
    const aKey = String(a.key);
    const bKey = String(b.key);

    const priority = (key) =>
      key.startsWith("auto_") || key.includes("*auto*") ? 0 : 1;

    return priority(aKey) - priority(bKey) || aKey.localeCompare(bKey);
  });

  const sorted = doc.toString();
  if (sorted === existing) return;

  writeFileSync(path, sorted);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
