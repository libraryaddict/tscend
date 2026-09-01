import { $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { fastenerCount, lumberCount } from "../../quests/level_09";
import { auto_is_valid } from "../../utils/auto_util";

export function haveBatWings(): boolean {
  if (auto_is_valid($item`bat wings`) && possessEquipment($item`bat wings`)) {
    return true;
  }
  return false;
}

export function canLeapBridge(): boolean {
  // bat wings allow for us to leap bridge at 5/6 progress (25 of 30)
  if (!haveBatWings()) {
    return false;
  }
  if (fastenerCount() < 25 || lumberCount() < 25) {
    return false;
  }
  return true;
}

export function swoopsRemaining(): number {
  if (!haveBatWings()) {
    return 0;
  }
  return 11 - get("_batWingsSwoopUsed");
}
