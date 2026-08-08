import { readdirSync, readFileSync } from "fs";
import path from "path";
import * as propertyTypes from "libram/dist/propertyTypes.js";
import { parse } from "yaml";

const SETTINGS_DIR = path.join(import.meta.dirname, "..", "data", "settings");

// Properties libram already knows the type of. get() itself type-checks these via
// overloads on string-literal unions, so we only need to recognize the name here -
// raw get()/getProperty()/set() calls commonly bypass the typed helpers to read/write
// the underlying string value directly, so we don't type-check these ourselves.
const libramKnownProperties = new Set<string>([
  ...propertyTypes.booleanProperties,
  ...propertyTypes.numericProperties,
  ...propertyTypes.monsterNumericProperties,
  ...propertyTypes.familiarNumericProperties,
  ...propertyTypes.itemNumericProperties,
  ...propertyTypes.stringProperties,
  ...propertyTypes.numericOrStringProperties,
  ...propertyTypes.locationProperties,
  ...propertyTypes.monsterProperties,
  ...propertyTypes.familiarProperties,
  ...propertyTypes.statProperties,
  ...propertyTypes.phylumProperties,
  ...propertyTypes.itemProperties,
]);

// KoLmafia creates these dynamically per choice adventure, so they can't be enumerated.
const knownPatterns = [/^choiceAdventure\d+$/];

function loadOurProperties(): ReadonlyMap<string, string> {
  const result = new Map<string, string>();

  const files = readdirSync(SETTINGS_DIR, {
    recursive: true,
    withFileTypes: true,
  }).filter(
    (f) => f.isFile() && f.name.endsWith(".yml") && f.name !== "groups.yml",
  );

  for (const file of files) {
    const data = parse(
      readFileSync(path.join(file.parentPath, file.name), "utf8"),
    );
    if (!data) continue;

    for (const [property, value] of Object.entries(
      data as Record<string, { type: string }>,
    )) {
      result.set(property, value.type);
    }
  }

  return result;
}

// name -> type, for properties we define ourselves (data/settings/**/*.yml). We fully
// control these, so we type-check calls using them.
export const internalProperties = loadOurProperties();

// All property names we can enumerate (dynamic patterns like choiceAdventure\d+ can't be), for
// suggesting a fix when someone typos a property name.
export const knownPropertyNames: readonly string[] = [
  ...internalProperties.keys(),
  ...libramKnownProperties,
];

export function isKnownProperty(name: string): boolean {
  return (
    internalProperties.has(name) ||
    libramKnownProperties.has(name) ||
    knownPatterns.some((pattern) => pattern.test(name))
  );
}
