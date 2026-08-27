import { itemAmount, myLevel, use } from "kolmafia";
import { $item, get } from "libram";

import { auto_is_valid, internalQuestStatus } from "../../../auto_util";
import { in_zootomist } from "../../../paths/2025/zootomist";

//Defined in autoscend/iotms/ttt.ash

export function useWardrobe(): void {
  if (!auto_is_valid($item`wardrobe-o-matic`)) {
    return;
  }
  if (itemAmount($item`wardrobe-o-matic`) === 0) {
    return;
  }
  // check one of the 3 prefs which get set when wardrobe is used each day
  if (get("_futuristicHatModifier") !== "") {
    return;
  }
  // wait for level 5 to get an upgraded wardrobe
  if (myLevel() < 5) {
    return;
  }
  // Zooto will be at 10 in very few turns
  if (myLevel() < 10 && in_zootomist()) {
    return;
  }
  // wait for level 15 if close and not at NS tower
  if (myLevel() === 14 && internalQuestStatus("questL13Final") < 0) {
    return;
  }
  // only need to use it so we get the hat, shirt, fam equip
  // let maximizer handle if any of it is worth equipping
  use($item`wardrobe-o-matic`);
}
