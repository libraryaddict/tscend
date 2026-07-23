import {
  alliedRadio,
  getProperty,
  itemAmount,
  myLevel,
  toBoolean,
  toInt,
  use,
} from "kolmafia";
import { $item } from "libram";

import { possessEquipment } from "../auto_equipment";
import {
  auto_is_valid,
  handleTracker$1,
  internalQuestStatus,
} from "../auto_util";
import { in_zootomist } from "../paths/zootomist";

//Defined in autoscend/iotms/ttt.ash

export function auto_useWardrobe(): void {
  if (!auto_is_valid($item`wardrobe-o-matic`)) {
    return;
  }
  if (itemAmount($item`wardrobe-o-matic`) === 0) {
    return;
  }
  // check one of the 3 prefs which get set when wardrobe is used each day
  if (getProperty("_futuristicHatModifier") !== "") {
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

export function auto_haveARB(): boolean {
  return (
    possessEquipment($item`Allied Radio Backpack`) &&
    auto_is_valid($item`Allied Radio Backpack`)
  );
}

export function auto_canARBSupplyDrop(): boolean {
  return auto_ARBSupplyDropsLeft() > 0;
}

export function auto_ARBSupplyDropsLeft(): number {
  if (!auto_is_valid($item`Allied Radio Backpack`)) {
    return 0;
  }
  const n_backpack_left: number = auto_haveARB()
    ? 3 - toInt(getProperty("_alliedRadioDropsUsed"))
    : 0;
  return n_backpack_left + itemAmount($item`handheld Allied radio`);
}

export function ARBSupplyDrop(req: string): boolean {
  if (!auto_canARBSupplyDrop()) {
    return false;
  }
  let radio: string;
  switch (req) {
    case "non-combat":
    case "nc":
    case "sniper support":
      radio = "sniper support";
      break;
    case "item drop":
    case "item":
    case "materiel intel":
      if (toBoolean(getProperty("_alliedRadioMaterielIntel"))) {
        return false;
      }
      radio = "materiel intel";
      break;
    case "res":
    case "wsb":
      if (toBoolean(getProperty("_alliedRadioWildsunBoon"))) {
        return false;
      }
      radio = "wildsun boon";
      break;
    case "food":
    case "rations":
      radio = "rations";
      break;
    case "drink":
    case "fuel":
      radio = "fuel";
      break;
    case "ellipsoidtine":
      radio = "ellipsoidtine";
      break;
    case "radio":
    default:
      radio = "radio";
      break;
  }
  if (alliedRadio(radio)) {
    handleTracker$1(
      $item`Allied Radio Backpack`.toString(),
      radio,
      "auto_iotm_claim",
    );
    return true;
  }

  return false;
}
