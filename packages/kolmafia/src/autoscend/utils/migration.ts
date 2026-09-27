import { getProperty, propertyExists, setProperty } from "kolmafia";
import { get, set } from "libram";

const settingExtras =
  // @ts-expect-error TS2591
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:setting_extras") as Record<
    string,
    { previousNames?: string[] }
  >;

function checkTrackers() {
  // TODO Check tracker keys, ensure they're all valid. Esp when I migrate over to a fancier version
}

// Bump when a setting needs to be renamed
export function autoscend_current_version(): string {
  return "2.0.0";
}

export function migrateProperties(): void {
  if (get("tscend_migrationVersion") === autoscend_current_version()) return;

  for (const [property, extra] of Object.entries(settingExtras)) {
    if (propertyExists(property)) continue;

    const previousNames = [...(extra.previousNames ?? [])];

    if (
      !propertyExists("tscend_migrationVersion") &&
      property.startsWith("tscend_")
    ) {
      previousNames.unshift(property.replace(/^tscend_/, "auto_"));
    }

    const previous = previousNames.find((name) => propertyExists(name));
    if (previous === undefined) continue;

    setProperty(property, getProperty(previous));
  }

  set("tscend_migrationVersion", autoscend_current_version());
}

export function fixMigration(): boolean {
  checkTrackers();

  return true;
}
