import { availableAmount } from "kolmafia";
import { $item, $skill, get } from "libram";

import { auto_is_valid, auto_is_valid$2 } from "../../auto_util";

function auto_haveLilDoctorBag(): boolean {
  if (
    auto_is_valid($item`Lil' Doctor™ bag`) &&
    availableAmount($item`Lil' Doctor™ bag`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_chestXraysRemaining(): number {
  if (!auto_haveLilDoctorBag() || !auto_is_valid$2($skill`Chest X-Ray`)) {
    return 0;
  }

  return 3 - get("_chestXRayUsed");
}

export function auto_reflexHammersRemaining(): number {
  if (!auto_haveLilDoctorBag() || !auto_is_valid$2($skill`Reflex Hammer`)) {
    return 0;
  }

  return 3 - get("_reflexHammerUsed");
}
