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

// "" is the unset sentinel for our internal properties - storing it literally is a bug.
const internalPropertyNames = new Set(
  Object.entries(settingExtras)
    .filter(([, extra]) => extra.internal)
    .map(([property]) => property),
);

// Overridden to avoid writing out unneeded properties, without specialcasing every call site.
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
  // Don't turn an unset property into an explicit false
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

// Always pass a default, so a stored "none" sentinel never breaks the non-null get() type.
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
