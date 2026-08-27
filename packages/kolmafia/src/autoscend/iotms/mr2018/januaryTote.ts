import {
  availableAmount,
  getRevision,
  Item,
  itemAmount,
  myHash,
  visitUrl,
} from "kolmafia";
import { $item, $items, get, set } from "libram";

import {
  auto_is_valid,
  auto_runChoice,
  hasTorso,
  wrap_item,
} from "../../auto_util";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { maximizer } from "../../utils/maximizer";

//	This is meant for items that have a date of 2018.

//Defined in autoscend/iotms/mr2018.ash
export function isjanuaryToteAvailable(): boolean {
  const tote: Item = wrap_item($item`January's Garbage Tote`);
  return itemAmount(tote) > 0 && auto_is_valid(tote) && !in_bhy();
}

export function januaryToteTurnsLeft(it: Item): number {
  if (!isjanuaryToteAvailable()) {
    return 0;
  }

  let score: number = 0;

  if (getRevision() < 18848) {
    switch (it) {
      case $item`deceased crimbo tree`:
        score = get("garbageTreeCharge", 0);
        break;
      case $item`broken champagne bottle`:
        score = get("garbageChampagneCharge", 0);
        break;
      case $item`makeshift garbage shirt`:
        score = get("garbageShirtCharge", 0);
        break;
    }
    return score;
  }

  switch (it) {
    case $item`deceased crimbo tree`:
      score = get("garbageTreeCharge");
      break;
    case $item`broken champagne bottle`:
      score = get("garbageChampagneCharge");
      break;
    case $item`makeshift garbage shirt`:
      score = get("garbageShirtCharge");
      break;
  }

  if (!get("_garbageItemChanged")) {
    switch (it) {
      case $item`deceased crimbo tree`:
        score += 1000;
        break;
      case $item`broken champagne bottle`:
        score += 11;
        break;
      case $item`makeshift garbage shirt`:
        score += 37;
        break;
    }
  }
  return score;
}

export function januaryToteAcquire(it: Item): boolean {
  //a function to acquire january's garbage tote equipment. like basic acquire command, this also returns true if you already have the item on hand.

  if (!isjanuaryToteAvailable()) {
    return false;
  }
  //in pre_adventure we routinely switch to wad of used tape. This allows us to avoid switching away from a desired item.
  //can't use adventure count in case of free fights.
  set("auto_januaryToteAcquireCalledThisTurn", true);
  //by default resetMaximize() will add a block for not equipping garbage tote items with charges to preserve the charges.
  //If we call januaryToteAcquire for an item we want to remove that block for that item.
  if (
    $items`deceased crimbo tree, broken champagne bottle, makeshift garbage shirt`.includes(
      it,
    )
  ) {
    maximizer.include(it);
  }
  //Special handling for if we already have the item on hand. We might want to replace it with itself
  //do not use possessEquipment nor equipmentAmount here, they have special handling for tote foldables that always counts number of january's garbage totes instead of the target item. Resulting in this if always being true.
  if (availableAmount(it) > 0) {
    let leftover_charges: number = 0;
    if (get("_garbageItemChanged")) {
      return true; //item already swapped today eliminating leftover charges. don't replace an item with itself.
    } else {
      //since item was not changed yet, count leftover charges from yesterday.
      //If target item has no charges at all then pretend it has 1 leftover to not replace it with itself.
      switch (it) {
        case $item`deceased crimbo tree`:
          leftover_charges = get("garbageTreeCharge");
          break;
        case $item`broken champagne bottle`:
          leftover_charges = get("garbageChampagneCharge");
          break;
        case $item`tinsel tights`:
          leftover_charges = 1;
          break;
        case $item`wad of used tape`:
          leftover_charges = 1;
          break;
        case $item`makeshift garbage shirt`:
          leftover_charges = get("garbageShirtCharge");
          break;
      }
    }
    if (leftover_charges > 0) {
      return true; //preserve leftover charges by keeping current instance of the item.
    }
  }

  let choice: number = 0;
  switch (it) {
    case $item`deceased crimbo tree`:
      choice = 1;
      break;
    case $item`broken champagne bottle`:
      choice = 2;
      break;
    case $item`tinsel tights`:
      choice = 3;
      break;
    case $item`wad of used tape`:
      choice = 4;
      break;
    case $item`makeshift garbage shirt`:
      choice = 5;
      break;
    case $item`Letter for Melvign the Gnome`:
      choice = 7;
      break;
  }

  if (choice === 2) {
    if (in_wotsf() || is_boris()) {
      return false;
    }
  }

  if (choice === 5 && !hasTorso()) {
    return false;
  }

  if (choice === 0) {
    return false;
  }

  if (choice === 7) {
    //can only get one letter per ascension
    if (
      get("questM22Shirt") !== "unstarted" ||
      itemAmount($item`Letter for Melvign the Gnome`) > 0
    ) {
      return false;
    }
    if (availableAmount($item`makeshift garbage shirt`) === 0) {
      //only rummage a new shirt if we don't already have one on hand.
      const tote: Item = wrap_item($item`January's Garbage Tote`);
      visitUrl(
        `inv_use.php?pwd=${myHash()}&which=3&whichitem=${tote.id}`,
        false,
      ); //rummage in your garbage tote
      auto_runChoice(5); //get garbage shirt
    }
    visitUrl("inv_equip.php?pwd=&which=2&action=equip&whichitem=9699"); //url fail to equip shirt to get a letter
  } else {
    const tote: Item = wrap_item($item`January's Garbage Tote`);
    visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=${tote.id}`, false); //rummage in your garbage tote
    auto_runChoice(choice); //get desired item
  }

  if (itemAmount(it) > 0) {
    return true;
  }
  return false;
}
