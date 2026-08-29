import { propertyExists, removeProperty } from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $monster,
  $phylum,
  $stat,
  get as libramGet,
  set as libramSet,
} from "libram";

import {
  familiarProperties,
  itemProperties,
  locationProperties,
  monsterProperties,
  phylumProperties,
  statProperties,
} from "../generated/property-types";

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

// Every class-typed property's get() is declared non-null in
// eslint-rules/generated/internal-properties.d.ts (see generate-property-declarations.mjs),
// but libram's real get() can still return null there: it only substitutes the default for
// an unset ("") value, so a property whose stored value is itself the "none" sentinel comes
// back null even when given a default. noneByProperty lets us always pass a default - the
// caller's own, or the type's .none - so that never happens, matching what the types promise.
const noneByProperty = new Map<string, unknown>([
  ...locationProperties.map((key) => [key, $location.none] as const),
  ...monsterProperties.map((key) => [key, $monster.none] as const),
  ...familiarProperties.map((key) => [key, $familiar.none] as const),
  ...itemProperties.map((key) => [key, $item.none] as const),
  ...statProperties.map((key) => [key, $stat.none] as const),
  ...phylumProperties.map((key) => [key, $phylum.none] as const),
]);

export function get(property: string, default_?: unknown): unknown {
  const fallback =
    default_ !== undefined ? default_ : noneByProperty.get(property);

  const value = (
    libramGet as unknown as (key: string, fallback?: unknown) => unknown
  )(property, fallback);

  return value === null ? fallback : value;
}
