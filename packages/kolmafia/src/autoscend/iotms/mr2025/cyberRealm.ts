import { isUnrestricted } from "kolmafia";
import { $item, $skill, get } from "libram";

import { auto_have_skill } from "../../utils/auto_util";

// This is meant for items that have a date of 2025

export function haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  if (get("crAlways") || get("_crToday")) {
    return true;
  }
  return false;
}

export function cyberrealmFreeFights(): number {
  if (!auto_have_skill($skill`OVERCLOCK(10)`)) {
    return 0;
  }

  return 10 - get("_cyberFreeFights");
}
