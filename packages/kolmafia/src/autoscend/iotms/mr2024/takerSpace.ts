import {
  creatableAmount,
  create,
  Item,
  itemAmount,
  myAscensions,
  visitUrl,
} from "kolmafia";
import { $item, $skill, get } from "libram";

import { SpringShoes } from "../../../types";
import {
  auto_get_campground,
  auto_is_valid,
  auto_is_valid$2,
  handleTracker,
} from "../../utils/auto_util";

function auto_haveTakerSpace(): boolean {
  return (
    auto_get_campground().has($item`TakerSpace letter of Marque`) &&
    auto_is_valid($item`TakerSpace letter of Marque`)
  );
}

let $_auto_checkTakerSpace_ts_letter: Item | undefined;

export function checkTakerSpace(): void {
  if (!auto_haveTakerSpace()) {
    return;
  }
  $_auto_checkTakerSpace_ts_letter ??= $item`TakerSpace letter of Marque`;
  if (!get("_takerSpaceSuppliesDelivered")) {
    // visit the workshed to get the supplies
    visitUrl("campground.php?action=workshed");
  }
  // unlock the island if we can (6 turn save)
  if (
    get("lastIslandUnlock") < myAscensions() &&
    itemAmount($item`pirate dinghy`) === 0 &&
    creatableAmount($item`pirate dinghy`) > 0
  ) {
    if (create(1, $item`pirate dinghy`)) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $_auto_checkTakerSpace_ts_letter,
        detail: $item`pirate dinghy`.toString(),
      });
    }
  }
  // deft pirate hook would be worth it but hard for autoscend to use
  // anchor bomb is a free banish but only for 30 turns, if we have Spring Kick we won't use it
  if (
    !(SpringShoes.haveSpringShoes() && auto_is_valid$2($skill`Spring Kick`)) &&
    creatableAmount($item`anchor bomb`) > 0
  ) {
    if (create(1, $item`anchor bomb`)) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $_auto_checkTakerSpace_ts_letter,
        detail: $item`anchor bomb`.toString(),
      });
    }
  }
  // goldschlepper is EPIC booze
  let createable: number = creatableAmount(
    $item`tankard of spiced Goldschlepper`,
  );
  if (createable > 0) {
    if (create(1, $item`tankard of spiced Goldschlepper`)) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $_auto_checkTakerSpace_ts_letter,
        detail: $item`tankard of spiced Goldschlepper`.toString(),
      });
    }
  }
  // tankard of spiced rum is awesome booze
  createable = creatableAmount($item`tankard of spiced rum`);
  if (createable > 0) {
    if (create(1, $item`tankard of spiced rum`)) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $_auto_checkTakerSpace_ts_letter,
        detail: $item`tankard of spiced rum`.toString(),
      });
    }
  }
  // cursed Aztec tamale is awesome food, and only uses spices
  createable = creatableAmount($item`cursed Aztec tamale`);
  if (createable > 0) {
    if (create(1, $item`cursed Aztec tamale`)) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $_auto_checkTakerSpace_ts_letter,
        detail: $item`cursed Aztec tamale`.toString(),
      });
    }
  }
}
