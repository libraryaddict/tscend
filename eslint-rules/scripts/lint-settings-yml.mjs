// Enforces and auto-fixes structure across data/settings/**/*.yml:
// - internal.yml's top-level keys are sorted (auto_-prefixed first, then alphabetically)
// - every setting entry's fields are reordered into a single canonical order, and only
//   recognized fields are allowed
//
// Usage: node eslint-rules/scripts/lint-settings-yml.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";

const SETTINGS_DIR = "data/settings";
const INTERNAL_FILE = path.join(SETTINGS_DIR, "internal.yml");

// Canonical field order. Any subset is fine, but present fields must appear in this order.
const FIELD_ORDER = [
  "name",
  "type",
  "dropdown",
  "description",
  "default",
  "resets",
  "tags",
];
const ALLOWED_FIELDS = new Set(FIELD_ORDER);

function sortInternalKeys(doc) {
  doc.contents.items.sort((a, b) => {
    const aKey = String(a.key);
    const bKey = String(b.key);

    const priority = (key) =>
      key.startsWith("auto_") || key.includes("*auto*") ? 0 : 1;

    return priority(aKey) - priority(bKey) || aKey.localeCompare(bKey);
  });
}

export async function main() {
  const files = (
    await fs.readdir(SETTINGS_DIR, { recursive: true, withFileTypes: true })
  ).filter(
    (f) => f.isFile() && f.name.endsWith(".yml") && f.name !== "groups.yml",
  );

  const errors = [];
  let changedFiles = 0;

  for (const file of files) {
    const relativePath = path.join(file.parentPath, file.name);
    const existing = readFileSync(relativePath, "utf8");
    const doc = parseDocument(existing);
    if (!doc.contents) continue;

    let hasUnrecognizedField = false;

    for (const entry of doc.contents.items) {
      const property = String(entry.key);
      const fields = entry.value.items;
      const unrecognized = fields
        .map((field) => String(field.key))
        .filter((key) => !ALLOWED_FIELDS.has(key));

      if (unrecognized.length > 0) {
        hasUnrecognizedField = true;
        errors.push(
          `${relativePath}: "${property}" has unrecognized field(s) ${unrecognized
            .map((f) => `"${f}"`)
            .join(", ")} - only ${FIELD_ORDER.join(", ")} are allowed`,
        );
        continue;
      }

      fields.sort(
        (a, b) =>
          FIELD_ORDER.indexOf(String(a.key)) -
          FIELD_ORDER.indexOf(String(b.key)),
      );
    }

    if (hasUnrecognizedField) continue;

    if (relativePath === INTERNAL_FILE) sortInternalKeys(doc);

    const sorted = doc.toString({ lineWidth: 0, flowCollectionPadding: false });
    if (sorted === existing) continue;

    writeFileSync(relativePath, sorted);
    changedFiles++;
  }

  if (changedFiles > 0) {
    console.log(`Reordered fields in ${changedFiles} file(s)`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid data/settings yml:\n${errors.join("\n")}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
