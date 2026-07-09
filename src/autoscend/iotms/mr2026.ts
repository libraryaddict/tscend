import {
  availableAmount,
  availableChoiceOptions,
  canInteract,
  equippedItem,
  extractItems,
  getProperty,
  Item,
  itemAmount,
  Location,
  Monster,
  myLocation,
  myPath,
  runChoice,
  setProperty,
  toBoolean,
  toInt,
  toLocation,
  visitUrl,
} from "kolmafia";
import { $item, $location, $slots } from "libram";

import { autoAdvBypass } from "../auto_adventure";
import {
  auto_autoConsumeOne,
  auto_canEat,
  spleen_left,
  stomach_left,
} from "../auto_consume";
import {
  auto_is_valid,
  auto_log_error,
  auto_wantToFreeKillWithNoDrops,
  handleTracker$1,
  handleTracker$2,
  isFreeMonster$1,
} from "../auto_util";
import { zone_delay } from "../auto_zone";
import { ConsumeAction } from "../autoscend_record";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_small } from "../paths/small";

// This is meant for items that have a date of 2026

export function auto_haveEternityCodpiece(): boolean {
  if (
    auto_is_valid($item`The Eternity Codpiece`) &&
    availableAmount($item`The Eternity Codpiece`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_isInEternityCodpiece(it: Item): boolean {
  for (const s of $slots`codpiece1, codpiece2, codpiece3, codpiece4, codpiece5`) {
    if (equippedItem(s) === it) {
      return true;
    }
  }
  return false;
}

//Defined in autoscend/iotms/mr2026.ash
function auto_haveLegendarySealClubbingClub(): boolean {
  if (
    auto_is_valid($item`legendary seal-clubbing club`) &&
    availableAmount($item`legendary seal-clubbing club`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_clubEmBackInTimesRemaining(): number {
  if (!auto_haveLegendarySealClubbingClub()) {
    return 0;
  }

  return 5 - toInt(getProperty("_clubEmTimeUsed"));
}

export function wantToClubEmBackInTime(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Club Em Back In Time, based off wantToThrowGravel

  if (auto_clubEmBackInTimesRemaining() === 0) {
    return false;
  }

  if (isFreeMonster$1(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

function auto_haveHeartstone(): boolean {
  if (!auto_is_valid($item`Heartstone`)) {
    return false;
  }
  if (availableAmount($item`Heartstone`) > 0) {
    return true;
  }
  if (auto_isInEternityCodpiece($item`Heartstone`)) {
    return true;
  }
  return false;
}

export function auto_heartstoneLuckRemaining(): number {
  if (!auto_haveHeartstone()) {
    return 0;
  }
  if (getProperty("heartstoneLuckUnlocked") !== "true") {
    return 0;
  }

  if (toBoolean(getProperty("_heartstoneLuckUsed"))) {
    return 0;
  }
  return 1;
}

export function auto_haveArchaeologistSpade(): boolean {
  if (
    auto_is_valid($item`Archaeologist's Spade`) &&
    availableAmount($item`Archaeologist's Spade`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_spadeDigsRemaining(): number {
  if (!auto_haveArchaeologistSpade()) {
    return 0;
  }

  return 11 - toInt(getProperty("_archSpadeDigs"));
}

export function auto_spadeDigItem(): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 1;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    visitUrl(use_url);
    const result_1: string = visitUrl(choice_url);
    const drops: Map<Item, number> = new Map(
      Object.entries(extractItems(result_1)).map(([_k, _v]) => [
        Item.get(_k),
        _v,
      ]),
    );
    let my_drop: Item = Item.none;
    let total_items_dropped: number = 0;
    for (const [it, n] of drops) {
      my_drop = it;
      total_items_dropped += n;
    }
    if (total_items_dropped !== 1) {
      auto_log_error(
        `Seem to have got ${total_items_dropped} from spade dig nearby, expecting 1.`,
      );
      handleTracker$2(
        SPADE.toString(),
        myLocation().toString(),
        `Dig up something nearby reported ${total_items_dropped} drops`,
        "auto_otherstuff",
      );
      return total_items_dropped !== 0;
    }
    if (n_digs > auto_spadeDigsRemaining()) {
      // check we actually have fewer digs left now before returning
      handleTracker$2(
        SPADE.toString(),
        `Dig up something nearby - ${myLocation()}`,
        my_drop.toString(),
        "auto_otherstuff",
      );
      return true;
    }
    handleTracker$1(
      SPADE.toString(),
      "FAILED: Dig up something nearby",
      "auto_otherstuff",
    );
  }
  return false;
}

function auto_spadeDigAncient(): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 2;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;
  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    visitUrl(use_url);
    visitUrl(choice_url);
    if (n_digs > auto_spadeDigsRemaining()) {
      // check we actually have fewer digs left now before returning
      handleTracker$1(
        SPADE.toString(),
        "Dig up something ancient",
        "auto_otherstuff",
      );
      return true;
    }
  }
  return false;
}

export function auto_spadeDigSkeleton(): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 3;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    const pages: Map<number, string> = new Map();
    pages.set(0, use_url);
    pages.set(1, choice_url);
    const loc: Location = myLocation();
    if (autoAdvBypass(0, pages, $location`Noob Cave`, null)) {
      handleTracker$1(
        SPADE.toString(),
        `Dig up a skeleton - ${loc}`,
        "auto_otherstuff",
      );
      return true;
    }
    handleTracker$1(
      SPADE.toString(),
      "FAILED: Dig up a skeleton",
      "auto_otherstuff",
    );
  }
  return false;
}

export function auto_wantToSpadeDigSkeleton(loc: Location): boolean {
  // haunted kitchen is the only zone that calls auto_spadeDigSkeleton() and does not call this function
  // (because it's the only non-delay zone currently supported)
  const valid_loc: boolean = spadeDelayZones().has(loc);
  const have_digs: boolean = auto_spadeDigsRemaining() > 0;
  const delay_left: boolean = zone_delay(loc)._boolean;
  const zone_set: boolean = toLocation(getProperty("lastAdventure")) === loc;
  if (valid_loc && have_digs && delay_left && zone_set) {
    return true;
  }
  return false;
}

export function spadeDelayZones(): Map<Location, boolean> {
  const desired_zones: Map<Location, boolean> = new Map();
  desired_zones.set($location`The Unquiet Garves`, true);
  desired_zones.set($location`The Haunted Ballroom`, true);
  return desired_zones;
}

export function auto_burnRemainingSpadeDigs(): boolean {
  const n_digs: number = auto_spadeDigsRemaining();
  for (let ii: number = 0; ii < n_digs; ii++) {
    auto_spadeDigAncient();
  }
  return auto_spadeDigsRemaining() === 0;
}

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
  return Item.none;
}

export function numBaseLegendaryNoodleDishes(): number {
  let num: number = 0;
  for (const preparedDish of legendaryNoodleDishes().keys()) {
    if (auto_canEat(preparedDish))
      num += itemAmount(
        legendaryNoodleDishes().get(preparedDish) ??
          legendaryNoodleDishes()
            .set(preparedDish, Item.none)
            .get(preparedDish),
      );
  }
  return num;
}
// pick a base noodle to consume, to be crafted into legendary (or to check that we have one avail. to consume)
// returns the legendary dish the noods are crafted into
export function auto_findBaseLegendaryNoods(): Item {
  if (itemAmount($item`legendary noodles`) < 1) {
    return Item.none;
  }
  for (const it of legendaryNoodleDishes().keys()) {
    if (
      itemAmount(
        legendaryNoodleDishes().get(it) ??
          legendaryNoodleDishes().set(it, Item.none).get(it),
      ) > 0 &&
      auto_canEat(it)
    ) {
      return it;
    }
  }
  return Item.none;
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
  // We exclude small because we want to be careful about maximizing the quality of our food when we only have two space, and we exclude plumber because plumber consumption is weird
  return (
    canEatSomeLegNoods() &&
    auto_canEat($item`Orzo di Riso`) &&
    !toBoolean(getProperty("auto_limitConsume")) &&
    !in_small() &&
    !in_plumber()
  );
}

export function auto_legendaryNoodlesAvailable(): boolean {
  if (stomach_left() < 1 || !auto_willEatLegendaryNoodles()) {
    return false;
  }
  if (auto_findPreparedLegendaryNoods() !== Item.none) {
    return true;
  }
  if (auto_findBaseLegendaryNoods() !== Item.none) {
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
  let action: ConsumeAction = new ConsumeAction();
  // select a dish and then create a record, prioritizing dishes that are already crafted first
  const prospective_dish: Item = auto_findPreparedLegendaryNoods();
  if (prospective_dish !== Item.none) {
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
    if (prospective_dish_1 !== Item.none) {
      action = new ConsumeAction(
        prospective_dish_1,
        0,
        1,
        5,
        10,
        AUTO_ORGAN_STOMACH_1,
        AUTO_OBTAIN_CRAFT_1,
      );
    } else {
      return false;
    }
  }
  // we communicate via the pref to the ChoiceHandler below to take the amygdala force-combat option
  setProperty("auto_forceCombatWithLegendaryNoodles", true.toString());
  if (auto_autoConsumeOne(action)) {
    return true;
  }
  return false;
}

export function legendaryNoodlesChoiceHandler(): void {
  let target_choice: number;
  // force combats if requested
  if (toBoolean(getProperty("auto_forceCombatWithLegendaryNoodles"))) {
    target_choice = 2;
    setProperty("auto_forceCombatWithLegendaryNoodles", false.toString());
  } else if (
    !toBoolean(
      // or use a spleen instead of a stomach
      getProperty("_legendaryNoodlesSpleen"),
    ) &&
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
    runChoice(target_choice);
  } else {
    runChoice(5);
  }
}
