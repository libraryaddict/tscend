import {
  availableAmount,
  availableChoiceOptions,
  Item,
  itemAmount,
  myPath,
} from "kolmafia";
import { $item, get, set } from "libram";

import {
  auto_autoConsumeOne,
  auto_canEat,
  spleen_left,
  stomach_left,
} from "../../auto_consume";
import { clearSoftblock, isSoftBlockInPlace } from "../../auto_routing";
import { auto_is_valid, auto_runChoice } from "../../auto_util";
import { ConsumeAction } from "../../autoscend_record";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_small } from "../../paths/2023/small";

export function auto_havePastaWand(): boolean {
  if (
    auto_is_valid($item`legendary pasta wand`) &&
    availableAmount($item`legendary pasta wand`) > 0
  ) {
    return true;
  }
  return false;
}

// keys are the legendary dishes, values are their respective base dishes
export function legendaryNoodleDishes(): Map<Item, Item> {
  const dishes: Map<Item, Item> = new Map();
  dishes.set($item`Tubetto Gelatto`, $item`tomb aspic`);
  dishes.set($item`Formica e Pepe`, $item`hot honey ant`);
  dishes.set($item`Gnocci Domani`, $item`later tots`);
  dishes.set($item`Linguini Ubriacapa`, $item`sauced mutton`);
  dishes.set($item`Pasta Grimavera`, $item`haunted crudités`);
  dishes.set($item`Orzo di Riso`, $item`spicy onigiri`);
  dishes.set($item`Arrattabbattabiata`, $item`ratbatatouille`);
  dishes.set($item`Pesto alla Marziano`, $item`alien salad`);
  dishes.set($item`Frutti di Scatoletta`, $item`can of tuna`);
  return dishes;
}

export function numPreparedLegendaryNoodleDishes(): number {
  let num: number = 0;
  for (const dish of legendaryNoodleDishes().keys()) {
    if (auto_canEat(dish)) {
      num += itemAmount(dish);
    }
  }
  return num;
}

// pick a legendary noodle to consume (or to check that we have one avail. to consume)
export function auto_findPreparedLegendaryNoods(): Item {
  for (const it of legendaryNoodleDishes().keys()) {
    if (auto_canEat(it) && itemAmount(it) > 0) {
      return it;
    }
  }
  return $item.none;
}

export function numBaseLegendaryNoodleDishes(): number {
  let num: number = 0;
  for (const preparedDish of legendaryNoodleDishes().keys()) {
    if (auto_canEat(preparedDish)) {
      num += itemAmount(
        legendaryNoodleDishes().get(preparedDish) ?? $item.none,
      );
    }
  }
  return num;
}

// pick a base noodle to consume, to be crafted into legendary (or to check that we have one avail. to consume)
// returns the legendary dish the noods are crafted into
export function auto_findBaseLegendaryNoods(): Item {
  if (itemAmount($item`legendary noodles`) < 1) {
    return $item.none;
  }
  for (const it of legendaryNoodleDishes().keys()) {
    if (
      itemAmount(legendaryNoodleDishes().get(it) ?? $item.none) > 0 &&
      auto_canEat(it)
    ) {
      return it;
    }
  }
  return $item.none;
}

function canEatSomeLegNoods(): boolean {
  // testing Gnocci Domani first because it satisfies all three of the "current" letter-restricted paths (BHY, 11TIHAU, G-lover)
  if (auto_canEat($item`Gnocci Domani`)) {
    return true;
  }
  // all other paths "currently" must not be able to eat legendary noodles. 57 is Thrifty.
  else if (myPath().id < 58) {
    return false;
  }
  // heuristics not good enough here, we need to test each dish
  for (const it of legendaryNoodleDishes().keys()) {
    if (auto_canEat(it)) return true;
  }
  return false;
}

export function auto_willEatLegendaryNoodles(): boolean {
  // Min adv per full filter is set to four because we don't differentiate between the quality of the noodles when we force-eat them, and the "worst" ones average 4 per full (others are 5)
  return (
    canEatSomeLegNoods() &&
    auto_canEat($item`Orzo di Riso`) &&
    !get("auto_limitConsume", false) &&
    get("auto_consumeMinAdvPerFill", 0) <= 4.0 &&
    !in_small() &&
    !in_plumber()
  );
}

export function legendaryPastaSoftblockInPlace(): boolean {
  if (
    auto_findBaseLegendaryNoods() !== $item.none ||
    auto_findPreparedLegendaryNoods() !== $item.none
  ) {
    clearSoftblock("legendaryPasta");
    return false;
  }

  return isSoftBlockInPlace("legendaryPasta");
}

export function auto_legendaryNoodlesAvailable(): boolean {
  if (stomach_left() < 1 || !auto_willEatLegendaryNoodles()) {
    return false;
  }
  if (auto_findPreparedLegendaryNoods() !== $item.none) {
    return true;
  }
  if (auto_findBaseLegendaryNoods() !== $item.none) {
    return true;
  }
  return false;
}

export function auto_forceCombatLegendaryNoodles(): boolean {
  // we are overriding the normal consumption loop due to the nature of the food's effect (eating when we are ready to force)
  // so we make a ConsumeAction record to record what we want to eat and then feed it into auto_autoConsumeOne()
  // values taken from auto_consume.ash
  const AUTO_ORGAN_STOMACH_1: number = 1;
  const AUTO_OBTAIN_NULL_1: number = 100;
  const AUTO_OBTAIN_CRAFT_1: number = 101;
  let action: ConsumeAction;
  // select a dish and then create a record, prioritizing dishes that are already crafted first
  const prospective_dish: Item = auto_findPreparedLegendaryNoods();
  if (prospective_dish !== $item.none) {
    action = new ConsumeAction(
      prospective_dish,
      0,
      1,
      5,
      10,
      AUTO_ORGAN_STOMACH_1,
      AUTO_OBTAIN_NULL_1,
    );
  } else {
    const prospective_dish_1: Item = auto_findBaseLegendaryNoods();
    if (prospective_dish_1 !== $item.none) {
      action = new ConsumeAction(
        prospective_dish_1,
        0,
        1,
        4,
        10,
        AUTO_ORGAN_STOMACH_1,
        AUTO_OBTAIN_CRAFT_1,
      );
    } else {
      return false;
    }
  }
  // we communicate via the pref to the ChoiceHandler below to take the amygdala force-combat option
  set("auto_forceCombatWithLegendaryNoodles", true);
  if (auto_autoConsumeOne(action)) {
    return true;
  }
  // We unset it if we didn't consume it
  set("auto_forceCombatWithLegendaryNoodles", false);
  return false;
}

export function legendaryNoodlesChoiceHandler(): void {
  let target_choice: number;
  // force combats if requested
  if (get("auto_forceCombatWithLegendaryNoodles", false)) {
    target_choice = 2;
    set("auto_forceCombatWithLegendaryNoodles", false);
  } else if (
    !get("_legendaryNoodlesSpleen") &&
    spleen_left() > 0 &&
    !isActuallyEd()
  ) {
    target_choice = 1;
  } else {
    // take famxp if nothing else
    target_choice = 4;
  }
  // sometimes options 1 and 4 aren't available, so fallback to 5 (double food effects) which always is and shouldn't ever? be detrimental
  if (target_choice in availableChoiceOptions()) {
    auto_runChoice(target_choice);
  } else {
    auto_runChoice(5);
  }
}
