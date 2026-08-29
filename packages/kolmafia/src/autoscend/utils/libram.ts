import { removeProperty } from "kolmafia";
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

export function set<D extends { toString(): string }>(
  property: string,
  value: D,
): D {
  if (
    typeof value === "string" &&
    value === "" &&
    internalPropertyNames.has(property)
  ) {
    removeProperty(property);
    return value;
  }

  return libramSet(property, value);
}
