import { Location } from "kolmafia";
import { $item, $location, get, set } from "libram";

import { autoAdv } from "../../auto_adventure";
import { autoEquip, possessEquipment } from "../../auto_equipment";
import { auto_can_equip } from "../../auto_util";
import { is_professor } from "../../paths/2024/wereprofessor";

// This is meant for items that have a date of 2022

//Defined in autoscend/iotms/mr2022.ash
export function auto_haveCursedMagnifyingGlass(): boolean {
  if (
    possessEquipment($item`cursed magnifying glass`) &&
    auto_can_equip($item`cursed magnifying glass`)
  ) {
    return true;
  }
  return false;
}

export function auto_voidMonster(loc: Location = $location.none): boolean {
  // Cursed Magnifying Glass gives a void monster combat every 13 turns. The first 5 are free fights
  // _voidFreeFights counts up from 0 and stays at 5 once all free fights are completed for the day
  if (!auto_haveCursedMagnifyingGlass()) {
    return false;
  }

  if (is_professor()) {
    return false; //can't beat the void guys as a professor
  }
  // return false if we've fought the 5 free void monsters already today or we're still charging up the counter
  if (get("_voidFreeFights") >= 5 || get("cursedMagnifyingGlassCount") !== 13) {
    return false;
  }

  if (loc === $location.none) {
    return true;
  }

  if (autoEquip($item`cursed magnifying glass`)) {
    set("auto_nextEncounter", "void guy"); //which of the 3 is random, but they're all same phylum and free under same conditions
    return autoAdv(loc);
  }
  set("auto_nextEncounter", "");
  return false;
}
