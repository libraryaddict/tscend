import { alliedRadio, itemAmount } from "kolmafia";
import { $item, get } from "libram";

import { possessEquipment } from "../../../auto_equipment";
import { auto_is_valid, handleTracker } from "../../../utils/auto_util";

export function haveARB(): boolean {
  return (
    (possessEquipment($item`Allied Radio Backpack`) &&
      auto_is_valid($item`Allied Radio Backpack`)) ||
    (auto_is_valid($item`handheld Allied radio`) &&
      itemAmount($item`handheld Allied radio`) > 0)
  );
}

export function canARBSupplyDrop(): boolean {
  return ARBSupplyDropsLeft() > 0;
}

export function ARBSupplyDropsLeft(): number {
  if (!haveARB()) {
    return 0;
  }
  const n_backpack_left: number = haveARB()
    ? Math.max(0, 3 - get("_alliedRadioDropsUsed"))
    : 0;
  return n_backpack_left + itemAmount($item`handheld Allied radio`);
}

export function ARBSupplyDrop(req: string): boolean {
  if (!canARBSupplyDrop()) {
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
      if (get("_alliedRadioMaterielIntel")) {
        return false;
      }
      radio = "materiel intel";
      break;
    case "res":
    case "wsb":
      if (get("_alliedRadioWildsunBoon")) {
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
    handleTracker({
      tracker: "iotmsUsed",
      iotm: $item`Allied Radio Backpack`,
      detail: radio,
    });
    return true;
  }

  return false;
}
