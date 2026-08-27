import {
  buy,
  Item,
  itemAmount,
  myClass,
  myPrimestat,
  visitUrl,
} from "kolmafia";
import { $class, $coinmaster, $item, $items, $stat, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";

function auto_latheHardwood(toLathe: Item): boolean {
  // can't lathe if lathe is out of standard (or otherwise unusable)
  if (!auto_is_valid($item`SpinMaster™ lathe`)) {
    return false;
  }
  // can't lathe... without a lathe
  if (itemAmount($item`SpinMaster™ lathe`) < 1) {
    return false;
  }
  // if breakfast hasn't run and you haven't grabbed it manually, we won't
  // see the scrap if we don't go grab it ourself. So do that, if needed.
  if (!get("_spinmasterLatheVisited")) {
    visitUrl("shop.php?whichshop=lathe");
  }
  // can't lathe without hardwood
  if (itemAmount($item`flimsy hardwood scraps`) < 1) {
    return false;
  }
  // can't lathe things that aren't made of hardwood
  if (
    !$items`beechwood blowgun, birch battery, ebony epee, maple magnet, weeping willow wand`.includes(
      toLathe,
    )
  ) {
    return false;
  }

  return buy($coinmaster`Your SpinMaster&trade; lathe`, 1, toLathe);
}

export function latheAppropriateWeapon(): boolean {
  let toLathe: Item = $item.none;

  switch (myPrimestat()) {
    case $stat`Muscle`:
      toLathe = $item`ebony epee`;
      break;
    case $stat`Mysticality`:
      toLathe = $item`weeping willow wand`;
      break;
    case $stat`Moxie`:
      toLathe = $item`beechwood blowgun`;
      break;
  }

  switch (myClass()) {
    case $class`Plumber`:
      // autoscend likes Plumber to go for moxie, so let's make sure it
      // does even if another stat is ahead at the start of the day.
      toLathe = $item`beechwood blowgun`;
      break;
  }
  // If any future classes also have a variable mainstat, specify the desired item here
  // don't want to accidentally use a second scrap in casual or something
  if (possessEquipment(toLathe)) {
    return false;
  }

  return auto_latheHardwood(toLathe);
}
