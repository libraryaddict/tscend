import { $item, $skill, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_can_equip, auto_is_valid$2 } from "../../auto_util";

//	This is meant for items that have a date of 2016.
//	Handling: Witchess Set, Snojo, Source Terminal, Protonic Accelerator Pack
//			Time-Spinner

//Defined in autoscend/iotms/mr2016.ash
function auto_haveJokestersGun(): boolean {
  if (
    possessEquipment($item`The Jokester's gun`) &&
    auto_can_equip($item`The Jokester's gun`)
  ) {
    return true;
  }
  return false;
}

export function auto_jokesterGunFreeKillAvailable(): boolean {
  if (
    !auto_haveJokestersGun() ||
    !auto_is_valid$2($skill`Fire the Jokester's Gun`)
  ) {
    return false;
  }

  return !get("_firedJokestersGun");
}
