import {
  equip,
  equippedAmount,
  getProperty,
  Item,
  myPath,
  numericModifier,
  toInt,
} from "kolmafia";
import { $items, $path, $slot } from "libram";

import { auto_getAllEquipabble$1 } from "../auto_equipment";
import { auto_can_equip } from "../auto_util";

//Defined in autoscend/paths/hattrick.ash
export function in_hattrick(): boolean {
  return myPath() === $path`Hat Trick`;
}

export function ht_equip_hats(): boolean {
  if (!in_hattrick()) {
    return false;
  }
  const availableHats: Map<Item, number> = auto_getAllEquipabble$1($slot`hat`);
  for (const [it] of availableHats) {
    let skip: boolean = false;
    //don't equip the following because they can mess us up later in the run or are useful for consumption (+/- combat and Thorns)
    for (const bl of $items`Mer-kin sneakmask, coconut shell`) {
      if (it === bl) {
        skip = true;
      }
    }
    if (numericModifier(it, "Thorns") > 0) {
      skip = true;
    }
    if (numericModifier(it, "Combat Rate") !== 0) {
      skip = true;
    }
    //Only check to not equip these if MLSafetyLimit is not set or is not set low (-ML hats)
    if (
      getProperty("auto_MLSafetyLimit") === "" ||
      toInt(getProperty("auto_MLSafetyLimit")) >= 25
    ) {
      if (numericModifier(it, "Monster Level") < 0) {
        skip = true;
      }
    }
    //Only check to not equip these if MLSafetyLimit is set low (+ML hats)
    if (toInt(getProperty("auto_MLSafetyLimit")) < 25) {
      if (numericModifier(it, "Monster Level") > 0) {
        skip = true;
      }
    }
    if (equippedAmount(it) > 0) {
      skip = true;
    }
    if (!skip && auto_can_equip(it)) {
      equip(it);
    }
  }
  return false;
}
