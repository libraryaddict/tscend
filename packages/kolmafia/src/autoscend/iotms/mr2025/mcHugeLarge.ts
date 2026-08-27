import { availableAmount, canEquip, visitUrl } from "kolmafia";
import { $item, $items, $slot, get } from "libram";

import { autoForceEquip, possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";

export function auto_haveMcHugeLargeSkis(): boolean {
  if (
    auto_is_valid($item`McHugeLarge duffel bag`) &&
    availableAmount($item`McHugeLarge duffel bag`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_canEquipAllMcHugeLarge(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  let success: boolean = true;
  for (const it of $items`McHugeLarge duffel bag, McHugeLarge right pole, McHugeLarge left pole, McHugeLarge right ski, McHugeLarge left ski`) {
    success = canEquip(it) && success;
  }
  return success;
}

export function auto_equipAllMcHugeLarge(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  if (!possessEquipment($item`McHugeLarge right pole`)) {
    auto_openMcLargeHugeSkis();
  }
  autoForceEquip($slot`back`, $item`McHugeLarge duffel bag`);
  autoForceEquip($slot`weapon`, $item`McHugeLarge right pole`);
  autoForceEquip($slot`off-hand`, $item`McHugeLarge left pole`);
  autoForceEquip($slot`acc1`, $item`McHugeLarge left ski`);
  autoForceEquip($slot`acc2`, $item`McHugeLarge right ski`);
  return true;
}

export function auto_openMcLargeHugeSkis(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  if (possessEquipment($item`McHugeLarge right pole`)) {
    return true;
  }
  //~ use($item[McHugeLarge duffel bag]); // does not work - need Mafia CLI tool?
  visitUrl("inventory.php?action=skiduffel");
  return possessEquipment($item`McHugeLarge right pole`);
}

export function auto_McLargeHugeForcesLeft(): number {
  if (!auto_haveMcHugeLargeSkis()) {
    return 0;
  }
  const used: number = get("_mcHugeLargeAvalancheUses");
  return 3 - used;
}

export function auto_McLargeHugeSniffsLeft(): number {
  if (!auto_haveMcHugeLargeSkis()) {
    return 0;
  }
  const used: number = get("_mcHugeLargeSlashUses");
  return 3 - used;
}
