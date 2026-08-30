import { readdirSync, readFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { parse } from "yaml";

const SETTINGS_DIR = path.join(import.meta.dirname, "..", "data", "settings");

type LibramPropertyTypes = Record<
  | "booleanProperties"
  | "numericProperties"
  | "monsterNumericProperties"
  | "familiarNumericProperties"
  | "itemNumericProperties"
  | "stringProperties"
  | "numericOrStringProperties"
  | "locationProperties"
  | "monsterProperties"
  | "familiarProperties"
  | "statProperties"
  | "phylumProperties"
  | "itemProperties",
  readonly string[]
>;

// Resolved against packages/kolmafia's own libram copy, not a root dependency.
const require = createRequire(import.meta.url);
const propertyTypesPath = require.resolve("libram/dist/propertyTypes.js", {
  paths: [path.join(import.meta.dirname, "..", "packages", "kolmafia")],
});
const propertyTypes = (await import(propertyTypesPath)) as LibramPropertyTypes;

// Properties libram already knows the type of - get() itself type-checks these.
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

// name -> type, for properties we define ourselves (data/settings/**/*.yml).
export const internalProperties = loadOurProperties();

// Enumerable property names, for suggesting a fix on a typo.
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

// Value category get() returns for libram-known properties only.
const libramPropertyCategories = new Map<string, string>([
  ...propertyTypes.booleanProperties.map((name): [string, string] => [
    name,
    "boolean",
  ]),
  ...[
    ...propertyTypes.numericProperties,
    ...propertyTypes.monsterNumericProperties,
    ...propertyTypes.familiarNumericProperties,
    ...propertyTypes.itemNumericProperties,
  ].map((name): [string, string] => [name, "number"]),
  ...propertyTypes.stringProperties.map((name): [string, string] => [
    name,
    "string",
  ]),
  ...propertyTypes.numericOrStringProperties.map((name): [string, string] => [
    name,
    "string",
  ]),
  ...propertyTypes.locationProperties.map((name): [string, string] => [
    name,
    "location",
  ]),
  ...propertyTypes.monsterProperties.map((name): [string, string] => [
    name,
    "monster",
  ]),
  ...propertyTypes.familiarProperties.map((name): [string, string] => [
    name,
    "familiar",
  ]),
  ...propertyTypes.statProperties.map((name): [string, string] => [
    name,
    "stat",
  ]),
  ...propertyTypes.phylumProperties.map((name): [string, string] => [
    name,
    "phylum",
  ]),
  ...propertyTypes.itemProperties.map((name): [string, string] => [
    name,
    "item",
  ]),
]);

const primitiveCategories = new Set(["boolean", "number", "string"]);

export function primitiveGetCategory(name: string): string | undefined {
  const ourType = internalProperties.get(name);
  if (ourType !== undefined) {
    return ourType === "int" || ourType === "float" ? "number" : ourType;
  }

  return libramPropertyCategories.get(name);
}

export function isNonPrimitiveGetCategory(category: string): boolean {
  return !primitiveCategories.has(category);
}
