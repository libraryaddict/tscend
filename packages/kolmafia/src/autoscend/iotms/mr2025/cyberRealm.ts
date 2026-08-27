import { isUnrestricted } from "kolmafia";
import { $item, get } from "libram";

// This is meant for items that have a date of 2025

//Defined in autoscend/iotms/mr2025.ash
export function auto_haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  if (get("crAlways") || get("_crToday")) {
    return true;
  }
  return false;
}
