import { propertyExists, removeProperty } from "kolmafia";
import { set as libramSet } from "libram";

export * from "libram";

const settingExtras =
  // @ts-expect-error TS2591
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:setting_extras") as Record<string, { internal?: boolean }>;

// Properties declared in data/settings/internal.yml are our own internal bookkeeping,
// never user-facing config - "" is this codebase's universal clear/unset sentinel for
// them (see defaultConfig in auto_settings.ts), so storing it as a literal empty string
// instead of removing the property is always a mistake.
const internalPropertyNames = new Set(
  Object.entries(settingExtras)
    .filter(([, extra]) => extra.internal)
    .map(([property]) => property),
);

// We override libram's set() here, namely to avoid unneeded properties being written out without having to specialcase it everywhere
export function set<D extends { toString(): string }>(
  property: string,
  value: D,
): D {
  // If we're setting it to an empty string, remove instead
  if (
    typeof value === "string" &&
    value === "" &&
    internalPropertyNames.has(property)
  ) {
    removeProperty(property);
    return value;
  }
  // If we're setting it to a boolean, and that boolean is false, then don't change an empty property to false
  if (
    typeof value === "boolean" &&
    value === false &&
    internalPropertyNames.has(property) &&
    !propertyExists(property)
  ) {
    return value;
  }

  return libramSet(property, value);
}
