// Generates typed libram get()/set() + kolmafia getProperty() overloads from data/settings/**/*.yml.
// Usage: node eslint-rules/scripts/generate-property-declarations.mjs [--watch]
import { promises as fs, watch } from "fs";
import path from "path";
import * as prettier from "prettier";
import { parse } from "yaml";

const SETTINGS_DIR = "data/settings";
const TRACKING_FILE = "data/tracking/tracking.yml";
// One copy per workspace - a cross-project-referenced copy doesn't merge its augmentation.
const OUT_FILES = [
  "packages/kolmafia/src/autoscend/generated/internal-properties.d.ts",
  "packages/relay/src/generated/internal-properties.d.ts",
];
const RUNTIME_OUT_FILE =
  "packages/kolmafia/src/autoscend/generated/property-types.ts";
const TRACKER_RUNTIME_OUT_FILE =
  "packages/kolmafia/src/autoscend/generated/tracker-types.ts";
// The copy the shipped bundle actually uses - see libramOverridePlugin in esbuild.mjs.
const LIBRAM_PROPERTY_TYPES_FILE =
  "packages/kolmafia/node_modules/libram/dist/propertyTypes.js";

// yml `type:` -> the libram propertyTypes.js array get()/set() consult for it.
const LIBRAM_ARRAY_FOR_TYPE = {
  boolean: "booleanProperties",
  int: "numericProperties",
  float: "numericProperties",
  string: "stringProperties",
};

// yml `type:` -> [TS type, kolmafia class import needed]
const TYPE_INFO = {
  boolean: { ts: "boolean" },
  int: { ts: "number" },
  float: { ts: "number" },
  string: { ts: "string" },
  tags: { ts: "string" },
  familiar: { ts: "Familiar", import: "Familiar" },
  location: { ts: "Location", import: "Location" },
  item: { ts: "Item", import: "Item" },
  monster: { ts: "Monster", import: "Monster" },
  stat: { ts: "Stat", import: "Stat" },
  phylum: { ts: "Phylum", import: "Phylum" },
};

// Like TYPE_INFO, but a field's type may be a list (eg `[item, skill]`) for a TS union.
const TRACKER_TYPE_INFO = {
  string: { ts: "string" },
  familiar: { ts: "Familiar", import: "Familiar" },
  location: { ts: "Location", import: "Location" },
  item: { ts: "Item", import: "Item" },
  monster: { ts: "Monster", import: "Monster" },
  skill: { ts: "Skill", import: "Skill" },
  phylum: { ts: "Phylum", import: "Phylum" },
};

const ALLOWED_FIELDS = new Set([
  "name",
  "type",
  "description",
  "default",
  "resets",
  "allowDuplicateTags",
  "tagsSeperator",
  "possibleValues",
  "possibleValuesSource",
  "tags",
]);
const RESET_KINDS = new Set(["day", "ascend", "start"]);

// Class types and "unknown" don't support a default at all.
function defaultMatchesType(type, value) {
  switch (type) {
    case "boolean":
      return typeof value === "boolean";
    case "int":
      return typeof value === "number" && Number.isInteger(value);
    case "float":
      return typeof value === "number";
    case "string":
      return typeof value === "string";
    case "item":
    case "familiar":
      return typeof value === "string";
    case "tags":
      return true;
    default:
      return false;
  }
}

function validateSetting(file, property, value, errors) {
  for (const field of Object.keys(value)) {
    if (!ALLOWED_FIELDS.has(field)) {
      errors.push(`${file}: "${property}" has unrecognized field "${field}"`);
    }
  }

  if (value.type === undefined) {
    errors.push(`${file}: "${property}" is missing "type"`);
  } else if (value.type !== "unknown" && !TYPE_INFO[value.type]) {
    errors.push(`${file}: "${property}" has unrecognized type "${value.type}"`);
  }

  if (
    value.default !== undefined &&
    !defaultMatchesType(value.type, value.default)
  ) {
    errors.push(
      `${file}: "${property}" has a default (${JSON.stringify(value.default)}) that doesn't match its type "${value.type}"`,
    );
  }

  if (value.resets !== undefined) {
    if (!RESET_KINDS.has(value.resets)) {
      errors.push(
        `${file}: "${property}" has resets "${value.resets}", must be ${[...RESET_KINDS].forEach((s) => `"${s}"`).join(" or ")}`,
      );
    }
  }
}

// Splices our own auto_* property names into libram's arrays, for runtime type recognition.
async function patchLibramPropertyTypes(byType) {
  let content = await fs.readFile(LIBRAM_PROPERTY_TYPES_FILE, "utf8");
  const original = content;

  const namesByArray = new Map();
  for (const [type, arrayName] of Object.entries(LIBRAM_ARRAY_FOR_TYPE)) {
    if (!namesByArray.has(arrayName)) namesByArray.set(arrayName, new Set());
    for (const name of byType.get(type) ?? []) {
      namesByArray.get(arrayName).add(name);
    }
  }

  for (const [arrayName, names] of namesByArray) {
    const pattern = new RegExp(`export const ${arrayName} = (\\[[^\\]]*\\]);`);
    const match = content.match(pattern);
    if (!match) {
      throw new Error(
        `Could not find libram's "${arrayName}" array to patch in ${LIBRAM_PROPERTY_TYPES_FILE} - has libram changed its format?`,
      );
    }

    const existing = JSON.parse(match[1]);
    const existingSet = new Set(existing);
    const additions = [...names].filter((name) => !existingSet.has(name));
    const merged = [...existing, ...additions];

    content = content.replace(
      pattern,
      `export const ${arrayName} = ${JSON.stringify(merged)};`,
    );
  }

  if (content === original) return;

  await fs.writeFile(LIBRAM_PROPERTY_TYPES_FILE, content);
  console.log(`Patched ${LIBRAM_PROPERTY_TYPES_FILE}`);
}

// Reads libram's own class-typed property names, so their get() can drop `| null` too.
async function readLibramClassPropertyNames(type) {
  const content = await fs.readFile(LIBRAM_PROPERTY_TYPES_FILE, "utf8");
  const arrayName = `${type}Properties`;
  const match = content.match(
    new RegExp(`export const ${arrayName} = (\\[[^\\]]*\\]);`),
  );
  if (!match) {
    throw new Error(
      `Could not find libram's "${arrayName}" array in ${LIBRAM_PROPERTY_TYPES_FILE} - has libram changed its format?`,
    );
  }
  return JSON.parse(match[1]);
}

export async function main() {
  const files = (
    await fs.readdir(SETTINGS_DIR, { recursive: true, withFileTypes: true })
  ).filter(
    (f) => f.isFile() && f.name.endsWith(".yml") && f.name !== "groups.yml",
  );

  // ts type -> property names
  const byType = new Map();
  const errors = [];

  for (const file of files) {
    const relativePath = path.join(file.parentPath, file.name);
    const data = parse(await fs.readFile(relativePath, "utf8"));
    if (!data) continue;

    for (const [property, value] of Object.entries(data)) {
      validateSetting(relativePath, property, value, errors);

      const info = TYPE_INFO[value.type];
      if (!info) continue; // "unknown" or unrecognized - falls back to libram's plain string overload

      if (!byType.has(value.type)) byType.set(value.type, []);
      byType.get(value.type).push(property);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid data/settings yml:\n${errors.join("\n")}`);
  }

  await patchLibramPropertyTypes(byType);

  // Class-typed properties, merged with libram's own same-named arrays.
  const classTypes = Object.keys(TYPE_INFO)
    .filter((type) => TYPE_INFO[type].import)
    .sort();
  const libramNamesByClassType = new Map(
    await Promise.all(
      classTypes.map(async (type) => [
        type,
        await readLibramClassPropertyNames(type),
      ]),
    ),
  );
  // libram types some properties we retype ourselves; get() checks boolean before the class
  // types at runtime, so ours has to win here too.
  const ownNames = new Set([...byType.values()].flat());
  const overriddenLibramNames = (type) =>
    (libramNamesByClassType.get(type) ?? []).filter((name) =>
      ownNames.has(name),
    );
  const namesForType = (type) =>
    [
      ...new Set([
        ...(libramNamesByClassType.get(type) ?? []).filter(
          (name) => !ownNames.has(name),
        ),
        ...(byType.get(type) ?? []),
      ]),
    ].sort();

  const types = [...new Set([...byType.keys(), ...classTypes])].sort();
  const unionName = (type) =>
    `${type[0].toUpperCase()}${type.slice(1)}Property`;

  const usedImports = types
    .map((type) => TYPE_INFO[type].import)
    .filter((name) => name !== undefined)
    .sort();

  const unions = types
    .map((type) => {
      const names = (
        TYPE_INFO[type].import ? namesForType(type) : byType.get(type).sort()
      ).map((n) => JSON.stringify(n));
      return `type ${unionName(type)} =\n  | ${names.join("\n  | ")};`;
    })
    .join("\n\n");

  const getOverloads = types
    .map((type) => {
      const { ts, import: isClass } = TYPE_INFO[type];
      const name = unionName(type);
      // A class-typed property's get() never returns null - see utils/libram.ts.
      if (isClass) {
        return `  function get(property: ${name}, _default?: ${ts}): ${ts};`;
      }
      return [
        `  function get(property: ${name}): ${ts};`,
        `  function get(property: ${name}, _default: ${ts}): ${ts};`,
      ].join("\n");
    })
    .join("\n");

  const setOverloads = types
    .map((type) => {
      const { ts } = TYPE_INFO[type];
      return `  function set(property: ${unionName(type)}, value: ${ts}): ${ts};`;
    })
    .join("\n");

  const allPropertiesUnion = types.map(unionName).join(" | ");

  const content = `// AUTO-GENERATED by eslint-rules/scripts/generate-property-declarations.mjs from data/settings/**/*.yml.
// Do not edit by hand - run \`yarn generate:properties\` to update.
import type { ${usedImports.join(", ")} } from "kolmafia";

${unions}

declare module "libram" {
${getOverloads}

${setOverloads}
}

declare module "kolmafia" {
  function getProperty(
    name: ${allPropertiesUnion},
    globalValue?: boolean,
  ): string;
}
`;

  for (const outFile of OUT_FILES) {
    await writeGenerated(outFile, content);
  }

  const libramAlias = (type) =>
    `libram${type[0].toUpperCase()}${type.slice(1)}Properties`;
  const libramImport = classTypes
    .map((type) => `  ${type}Properties as ${libramAlias(type)},`)
    .join("\n");
  const runtimeArrays = classTypes
    .map((type) => {
      const names = (byType.get(type) ?? [])
        .sort()
        .map((n) => JSON.stringify(n));
      const overridden = overriddenLibramNames(type);
      const base = overridden.length
        ? `${libramAlias(type)}.filter((p) => !${JSON.stringify(overridden)}.includes(p))`
        : libramAlias(type);
      return `export const ${type}Properties = [...${base}, ${names.join(", ")}] as const;`;
    })
    .join("\n\n");

  // Every preference a tracker section writes to via handleTracker().
  const trackingConfig = parse(await fs.readFile(TRACKING_FILE, "utf8"));
  const trackerKeys = Object.values(trackingConfig)
    .map((entry) => entry.property)
    .sort()
    .map((n) => JSON.stringify(n));

  const runtimeContent = `// AUTO-GENERATED by eslint-rules/scripts/generate-property-declarations.mjs from data/settings/**/*.yml
// and data/tracking/tracking.yml.
// Do not edit by hand - run \`yarn generate:properties\` to update.
import {
${libramImport}
} from "libram";

${runtimeArrays}

export const trackerKeys = [${trackerKeys.join(", ")}] as const;
export type TrackerKey = (typeof trackerKeys)[number];
`;

  await writeGenerated(RUNTIME_OUT_FILE, runtimeContent);

  await generateTrackerTypes(trackingConfig);
}

function validateTrackerField(category, field, errors) {
  const ALLOWED_FIELD_KEYS = new Set(["name", "label", "type", "optional"]);
  for (const key of Object.keys(field)) {
    if (!ALLOWED_FIELD_KEYS.has(key)) {
      errors.push(
        `${TRACKING_FILE}: tracker "${category}" has a field with unrecognized key "${key}"`,
      );
    }
  }
  if (!field.name) {
    errors.push(
      `${TRACKING_FILE}: tracker "${category}" has a field missing "name"`,
    );
  }
  if (!field.label) {
    errors.push(
      `${TRACKING_FILE}: tracker "${category}" field "${field.name}" is missing "label"`,
    );
  }
  const types = Array.isArray(field.type) ? field.type : [field.type];
  if (types.length === 0 || types.some((t) => t === undefined)) {
    errors.push(
      `${TRACKING_FILE}: tracker "${category}" field "${field.name}" is missing "type"`,
    );
  }
  for (const type of types) {
    if (type !== undefined && !TRACKER_TYPE_INFO[type]) {
      errors.push(
        `${TRACKING_FILE}: tracker "${category}" field "${field.name}" has unrecognized type "${type}"`,
      );
    }
  }
}

// Generates the TrackerEntry union plus the lookup tables handleTracker() needs.
async function generateTrackerTypes(trackingConfig) {
  const errors = [];
  for (const [category, entry] of Object.entries(trackingConfig)) {
    if (!entry.property) {
      errors.push(`${TRACKING_FILE}: "${category}" is missing "property"`);
    }
    for (const field of entry.fields ?? []) {
      validateTrackerField(category, field, errors);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Invalid data/tracking/tracking.yml:\n${errors.join("\n")}`,
    );
  }

  const categories = Object.keys(trackingConfig).sort();

  const variantName = (category) =>
    `${category[0].toUpperCase()}${category.slice(1)}Tracked`;

  const fieldTsType = (field) => {
    const types = Array.isArray(field.type) ? field.type : [field.type];
    return types.map((t) => TRACKER_TYPE_INFO[t].ts).join(" | ");
  };

  const variants = categories
    .map((category) => {
      const fields = (trackingConfig[category].fields ?? [])
        .map((f) => `  ${f.name}${f.optional ? "?" : ""}: ${fieldTsType(f)};`)
        .join("\n");
      return `export type ${variantName(category)} = {\n  tracker: "${category}";\n${fields}\n};`;
    })
    .join("\n\n");

  const fieldNamesByCategory = categories
    .map((category) => {
      const names = (trackingConfig[category].fields ?? []).map((f) =>
        JSON.stringify(f.name),
      );
      return `  ${category}: [${names.join(", ")}],`;
    })
    .join("\n");

  const propertyByCategory = categories
    .map(
      (category) =>
        `  ${category}: ${JSON.stringify(trackingConfig[category].property)},`,
    )
    .join("\n");

  const imports = [
    ...new Set(
      categories.flatMap((category) =>
        (trackingConfig[category].fields ?? []).flatMap((f) => {
          const types = Array.isArray(f.type) ? f.type : [f.type];
          return types.map((t) => TRACKER_TYPE_INFO[t].import).filter(Boolean);
        }),
      ),
    ),
  ].sort();

  const content = `// AUTO-GENERATED by eslint-rules/scripts/generate-property-declarations.mjs from data/tracking/tracking.yml.
// Do not edit by hand - run \`yarn generate:properties\` to update.
import type { ${imports.join(", ")} } from "kolmafia";

import type { TrackerKey } from "./property-types";

export const trackerCategories = [
  ${categories.map((c) => JSON.stringify(c)).join(",\n  ")},
] as const;
export type TrackerCategory = (typeof trackerCategories)[number];

${variants}

export type TrackerEntry = ${categories.map(variantName).join(" | ")};

// The field order handleTracker() reads off a TrackerEntry, matching tracking.yml.
export const trackerFieldNames: Record<TrackerCategory, readonly string[]> = {
${fieldNamesByCategory}
};

// Which KoLmafia preference each category's rows are appended to.
export const trackerProperty: Record<TrackerCategory, TrackerKey> = {
${propertyByCategory}
};
`;

  await writeGenerated(TRACKER_RUNTIME_OUT_FILE, content);
}

async function writeGenerated(outFile, content) {
  const formatted = await prettier.format(content, { filepath: outFile });

  await fs.mkdir(path.dirname(outFile), { recursive: true });

  const existing = await fs.readFile(outFile, "utf8").catch(() => null);
  if (existing === formatted) return;

  await fs.writeFile(outFile, formatted);
  console.log(`Wrote ${outFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--watch")) {
    await main();

    let pending = null;
    const rerun = () => {
      clearTimeout(pending);
      pending = setTimeout(() => main().catch(console.error), 100);
    };

    console.log(`Watching ${SETTINGS_DIR} and ${TRACKING_FILE} for changes...`);
    watch(SETTINGS_DIR, { recursive: true }, (_event, filename) => {
      if (filename?.endsWith(".yml")) rerun();
    });
    watch(TRACKING_FILE, rerun);
  } else {
    await main();
  }
}
