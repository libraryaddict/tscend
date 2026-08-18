function checkTrackers() {
  // TODO Check tracker keys, ensure they're all valid. Esp when I migrate over to a fancier version
}

export function autoscend_current_version(): string {
  return "2.0.0";
}

export function fixMigration(): boolean {
  checkTrackers();

  return true;
}
