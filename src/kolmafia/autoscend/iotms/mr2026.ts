import {
  abort,
  availableAmount,
  availableChoiceOptions,
  canDrink,
  canEat,
  canInteract,
  cliExecute,
  cupOf13sTier,
  Effect,
  entityDecode,
  equippedItem,
  extractItems,
  fullnessLimit,
  getProperty,
  haveCampground,
  heartstoneStringLength,
  historicalPrice,
  Item,
  itemAmount,
  knollAvailable,
  Location,
  Monster,
  myAdventures,
  myFullness,
  myHash,
  myInebriety,
  myLocation,
  myMeat,
  myPath,
  runChoice,
  setProperty,
  Stat,
  toBoolean,
  toInt,
  toLocation,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $items, $location, $slots, get, have } from "libram";

import { auto_unreservedAdvRemaining } from "../../autoscend";
import { auto_buyUpTo, auto_hermit } from "../auto_acquire";
import { autoAdvBypass } from "../auto_adventure";
import {
  auto_autoConsumeOne,
  auto_canEat,
  AUTO_OBTAIN_NULL,
  AUTO_ORGAN_LIVER,
  fullness_left,
  inebriety_left,
  spleen_left,
  stomach_left,
} from "../auto_consume";
import { haveFreeRestAvailable } from "../auto_restore";
import {
  auto_get_campground,
  auto_is_valid,
  auto_log_error,
  auto_log_warning$1,
  auto_wantToFreeKillWithNoDrops,
  autoCraft,
  handleTracker$1,
  handleTracker$2,
  internalQuestStatus,
  isFreeMonster$1,
  meatReserve,
} from "../auto_util";
import { zone_delay } from "../auto_zone";
import { ConsumeAction } from "../autoscend_record";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { is_werewolf } from "../paths/wereprofessor";

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

export function auto_haveElfToilet(): boolean {
  return (
    auto_is_valid($item`Archaeologist's Spade`) &&
    !is_werewolf() && // Werewolf doesn't have campground?
    !in_small() &&
    canEat() &&
    fullnessLimit() > 1 &&
    haveCampground() &&
    // Coerce to a boolean
    !!auto_get_campground().get($item`Pork Elf toilet`)
  );
}

export function auto_elfToiletReady(freeOnly: boolean = true): boolean {
  return (
    auto_haveElfToilet() &&
    myFullness() > 1 &&
    !get("_porkElfToiletUsed") &&
    (haveFreeRestAvailable() || (!freeOnly && auto_unreservedAdvRemaining()))
  );
}

export function auto_useElfToilet(): boolean {
  // Elf toilet requires campground, but takes priority over any other rest site while it's ready.
  cliExecute("campground rest campground");

  if (!get("_porkElfToiletUsed") || auto_elfToiletReady()) {
    abort(`Expected elf toilet to have been used, but was not.`);
  }

  return true;
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
    if (autoAdvBypass(0, pages, $location`Noob Cave`)) {
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
  let action: ConsumeAction;
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

class CupOfThirteenData {
  constructor(
    public item: Item,
    public adventures: number,
    public effect: Effect,
    public effectDuration: number,
    public stat: Stat,
    public statAmount: number,
  ) {}
}

interface CupOfThirteenIngredient {
  item: Item;
  data: CupOfThirteenData;
  count: () => number; // How much of this is available
  acquire?: (count: number) => boolean;
}

function getCupOfThirteenData(item: Item): CupOfThirteenData {
  const valuableness = cupOf13sTier(item);
  const adventures = Math.min(valuableness, 1 + (item.id % 5));
  const extraScore = valuableness - adventures;

  const index = heartstoneStringLength(entityDecode(item.name)) % 13;
  let effect: Effect = Effect.none;
  let stat: Stat = Stat.none;

  if (extraScore > 0) {
    switch (index) {
      case 0:
        stat = Stat.get("Muscle");
        break;
      case 1:
        stat = Stat.get("Mysticality");
        break;
      case 2:
        stat = Stat.get("Moxie");
        break;
      default:
        effect = Effect.get(3105 + index);
        break;
    }
  }

  const statAmount = stat !== Stat.none ? extraScore * 50 : 0;
  const effectTurns = effect !== Effect.none ? extraScore * 20 : 0;

  return new CupOfThirteenData(
    item,
    adventures,
    effect,
    effectTurns,
    stat,
    statAmount,
  );
}

function getCupIngredients(): CupOfThirteenIngredient[] {
  const cupOfThirteenIngredients: CupOfThirteenIngredient[] = [];
  // Fill in ingredients
  function addIngredient(
    item: Item,
    count: () => number,
    acquire?: (count: number) => boolean,
  ): void {
    cupOfThirteenIngredients.push({
      item,
      data: getCupOfThirteenData(item),
      count,
      acquire,
    });
  }

  const pastaReserved = new Map<Item, number>();

  // We always ensure legendary noodles has a chance to be eaten
  // Start with the amount of legendary noodles we have
  let keepReserved = availableAmount($item`legendary noodles`);

  // Reserve 3 more if future noodle summons are available
  if (
    auto_havePastaWand() &&
    get("noodleSummons") === 0 &&
    !get("_legendaryPastaWaveCast")
  ) {
    keepReserved += 3;
  }

  // Don't go above 6 ingredients reserved
  keepReserved = Math.min(
    6,
    keepReserved,
    // Some paths don't allow eating
    fullness_left() +
      (isActuallyEd() || get("_legendaryNoodlesSpleen") ? 0 : 1), // If we're converting a fullness to spleen, add 1
  );

  const noodleDishes = [...legendaryNoodleDishes().keys()];
  // Reserve ingredients first, then start storing what is available to use
  for (const ingred of noodleDishes) {
    const amount = itemAmount(ingred);

    // Reserve as much as needed
    const toReserve = Math.min(keepReserved, amount);
    keepReserved -= toReserve;

    // Add the amount, minus the amount we've reserved
    pastaReserved.set(ingred, amount - toReserve);
  }

  // Hardcoded, maybe in the future?
  for (const ingred of noodleDishes) {
    addIngredient(ingred, () => pastaReserved.get(ingred) ?? 0);
  }

  // Now the ingredients we just don't care about. Not very filled out as its annoying
  for (const item of $items`spoon, jumbo olive, black picnic basket`) {
    addIngredient(item, () => itemAmount(item));
  }

  // Some +meat drop from npc store
  addIngredient(
    $item`loose purse strings`,
    () => Math.max(0, Math.floor((myMeat() - meatReserve()) / 100)), // Store has @ 100 meat
    (count: number) => auto_buyUpTo(count, $item`loose purse strings`),
  );

  if (knollAvailable()) {
    // 4 adv turn gen, requires 2 meat smiths so only if knoll
    addIngredient(
      $item`dripping meat staff`,
      () => Math.max(0, Math.floor((myMeat() - meatReserve()) / 400)), // Each staff costs 400~ approx
      (count: number) => {
        return (
          // Gather the ingredients
          auto_buyUpTo(count, $item`big stick`) && // Buy from store
          cliExecute(`make ${count} meat stack`) && // Make some meat stacks
          auto_hermit(count, $item`ketchup`) && // Including from hermit
          autoCraft("smith", count, $item`big stick`, $item`meat stack`) >=
            count && // Smith staffs
          autoCraft("smith", count, $item`basic meat staff`, $item`ketchup`) >=
            count // Smith dripping staffs
        );
      },
    ); // 5 adv turn gen, requires 2 meat smiths so only if knoll & has at least 5 dry noodles. 5 being the magic number to say they're not being as utilized as they could be
    addIngredient(
      $item`starchy staff`,
      () =>
        myMeat() > meatReserve() + 200 && itemAmount($item`dry noodles`) >= 5
          ? 1
          : 0,
      (count: number) => {
        return (
          // Gather the ingredients
          auto_buyUpTo(count, $item`big stick`) && // Buy from store
          cliExecute(`make ${count} meat stack`) && // Make some meat stacks
          autoCraft("smith", count, $item`big stick`, $item`meat stack`) >=
            count && // Smith staffs
          autoCraft(
            "smith",
            count,
            $item`basic meat staff`,
            $item`dry noodles`,
          ) >= count // Smith dripping staffs
        );
      },
    );
  }

  // Some other items you might have lying around?
  addIngredient($item`mini kiwi bikini`, () =>
    // Only available if we're past the protesters and the tower is known not sleaze
    // Sleaze is the only test that doesn't start with "people"
    get("telescope2").startsWith("people") &&
    internalQuestStatus("questL11Ron") >= 2
      ? itemAmount($item`mini kiwi bikini`)
      : 0,
  );

  // Add a few items from the war, but only if the war is over and we have duplicates
  if (get("questL12War") === "finished")
    for (const it of $items`hippy protest button, Lockenstock™ sandals, didgeridooka, wicker shield, oversized pipe, fire poi, Gaia beads, hippy medical kit, flowing hippy skirt, round green sunglasses`) {
      if (itemAmount(it) <= 1) {
        continue;
      }

      // Always keep 1
      addIngredient(it, () => itemAmount(it) - 1);
    }

  return cupOfThirteenIngredients;
}

export function auto_canDrinkCupOfThirteen(): boolean {
  if (in_tcrs() || in_small() || !canDrink()) return false;
  if (get("auto_limitConsume", false)) return false;

  // Falls back to at least 3 advs remaining, which should mean only when it's trying to get the effect as consume would already skip it for better items.
  const minAdvPerFill = get("auto_consumeMinAdvPerFill", 0) || 3;

  if (auto_cupOfThirteenAdvRemaining() < minAdvPerFill) return false;

  // eslint-disable-next-line libram/verify-constants
  if (!auto_is_valid($item`Cup of 13s`)) return false;

  // eslint-disable-next-line libram/verify-constants
  if (!have($item`Cup of 13s`)) return false;

  return true;
}

export function auto_cupOfThirteenAdvRemaining(): number {
  return get(`_cupOf13sJewels`, 13);
}

function auto_bestCupOfThirteenAction(
  reqEffect: Effect,
): ConsumeAction | undefined {
  // Get all the possible ingredients
  const ingredients: CupOfThirteenIngredient[] = getCupIngredients();
  // Boost these effects up when we're comparing, we prioritize item drop if we don't need meat
  const effectScores: Map<Effect, number> = new Map([
    // eslint-disable-next-line libram/verify-constants
    [$effect`Runneth Over`, 100], // 50% item drop
    // eslint-disable-next-line libram/verify-constants
    [$effect`Runneth On Empty`, myMeat() > meatReserve() + 3000 ? 5 : 200], // 100% meat drop
    // eslint-disable-next-line libram/verify-constants
    [$effect`Runneth a Tight Ship `, 1], // +5 fam exp
    // eslint-disable-next-line libram/verify-constants
    [$effect`Runneth With The Pack`, 3], // +5 fam weight
    // eslint-disable-next-line libram/verify-constants
    [$effect`Runneth Wild`, 0.1], // +100 init
  ]);

  // Cache prices
  const prices = new Map(
    ingredients.map((ingredient) => [
      ingredient.item,
      historicalPrice(ingredient.item),
    ]),
  );

  // How many adventures we can actually make use of. An ingredient's adventures beyond this are worthless for sorting purposes, so once
  // we're close to the cap we stop favoring high-adventure ingredients over ones that score better in other ways.
  const advCap = auto_cupOfThirteenAdvRemaining();

  // Sort them with capped adventures; called again after each pick since the cap shrinks as ingredients are selected
  const sortIngredients = (): void => {
    const usefulAdvs: number = advCap - usedAdvs;

    ingredients.sort((itm1, itm2) => {
      const a = itm1.data;
      const b = itm2.data;
      // Prefer ingredients with more adventures, but only up to what we can still use
      const aAdv = Math.min(a.adventures, usefulAdvs);
      const bAdv = Math.min(b.adventures, usefulAdvs);
      if (aAdv !== bAdv) {
        return bAdv - aAdv;
      }

      // If we're looking for an effect, prefer the one with the longest duration when both of the ingredients has the requested effect
      // We don't care if these are dragged to the bottom
      if (
        reqEffect !== Effect.none &&
        a.effect === reqEffect &&
        a.effect === b.effect &&
        a.effectDuration !== b.effectDuration
      ) {
        return b.effectDuration - a.effectDuration;
      }

      const effScore1 =
        (effectScores.get(a.effect) ?? 0) * (a.effectDuration ?? 0);
      const effScore2 =
        (effectScores.get(b.effect) ?? 0) * (b.effectDuration ?? 0);

      // Prefer the ingredient that gives us the better effects
      if (effScore1 !== effScore2) {
        return effScore2 - effScore1;
      }

      if (a.statAmount !== b.statAmount) {
        // Should add some weight for our lowest stat perhaps?
        return (b.statAmount ?? 0) - (a.statAmount ?? 0);
      }

      // Otherwise prefer the lower mall price
      return prices.get(a.item)! - prices.get(b.item)!;
    });
  };

  const selected: CupOfThirteenIngredient[] = [];
  let usedAdvs = 0;

  // If we require an effect
  if (reqEffect !== Effect.none) {
    sortIngredients();
    // Find an ingredient that we can use
    const effect = ingredients.find(
      (unit) => unit.data.effect === reqEffect && unit.count() > 0,
    );

    // If we can't acquire the effect
    if (!effect) {
      return undefined;
    }

    // Ensure this ingredient is used
    selected.push(effect);
    usedAdvs += effect.data.adventures;
  }

  // Fill out the rest of the ingredients one at a time, re-sorting after each pick so ingredients
  // that would push us past the adv cap lose their priority to ones that don't
  while (selected.length < 3) {
    // Re-sort so ingredients that would push us past the adv cap lose priority to ones that don't
    sortIngredients();
    const next = ingredients.find(
      (ingred) =>
        ingred.count() > selected.filter((sel) => sel === ingred).length,
    );

    if (!next) {
      break;
    }

    selected.push(next);
    usedAdvs += next.data.adventures;
  }

  if (selected.length !== 3) {
    return undefined;
  }

  const action = auto_cupOfThirteenConsumeAction(selected, reqEffect);

  if (action.adventures < get("auto_consumeMinAdvPerFill", 0.0)) {
    return undefined;
  }

  return action;
}

function auto_cupOfThirteenConsumeAction(
  pick: CupOfThirteenIngredient[],
  effect: Effect = Effect.none,
): ConsumeAction {
  // Get the raw adv gain
  const advs: number = Math.min(
    pick.reduce((sum, ing) => sum + ing.data.adventures, 0),
    auto_cupOfThirteenAdvRemaining(),
  );
  // Boost the value if we're looking for this effect
  const value =
    effect !== Effect.none && pick.some((i) => i.data.effect === effect)
      ? 10
      : 0;

  const prep = () => {
    for (const ingredient of pick) {
      // Returns the count of items we don't have
      const need = () =>
        pick.filter((p) => p.item === ingredient.item).length -
        itemAmount(ingredient.item);

      if (need() <= 0) {
        continue;
      }

      // If we can acquire it, try acquire, then if successfully acquired enough
      if (ingredient.acquire && ingredient.acquire(need()) && need() <= 0) {
        continue;
      }

      auto_log_warning$1(
        `Failed to acquire ${need()} x ${ingredient.item} when trying to gather ingredients for cup of 13`,
      );
      return false;
    }
    return true;
  };

  return new ConsumeAction(
    // eslint-disable-next-line libram/verify-constants
    $item`Cup of 13s`,
    0,
    1,
    advs,
    value + advs,
    AUTO_ORGAN_LIVER,
    AUTO_OBTAIN_NULL,
    {
      castOde: false,
      hasOwnTracking: true,
      consume: () => prep() && auto_mixAndDrinkCupOfThirteen(pick),
      prep,
    },
  );
}

function auto_mixAndDrinkCupOfThirteen(
  pick: CupOfThirteenIngredient[],
): boolean {
  const prevInebriety: number = myInebriety();
  const preAdvs = myAdventures();
  visitUrl(`inventory.php?pwd=${myHash()}&action=cupof13s`);
  visitUrl(
    `choice.php?pwd=${myHash()}&whichchoice=1601&option=1` +
      `&whichitem1=${pick[0].item.id}&whichitem2=${pick[1].item.id}&whichitem3=${pick[2].item.id}`,
  );

  if (prevInebriety === myInebriety()) {
    visitUrl("main.php"); // Ensure we're not 'still in choice'
    auto_log_warning$1(
      `Failed to consume cup of 13s ingredients: ${pick.map((i) => i.item.name).join(", ")}`,
    );
    cliExecute("refresh inventory");
  }

  handleTracker$1(
    // eslint-disable-next-line libram/verify-constants
    $item`Cup of 13s`.toString(),
    `${myAdventures() - preAdvs}Advs`,
    "auto_drunken",
  );

  return myInebriety() !== prevInebriety;
}

export function auto_getDrinkCupOfThirteenForEffect(
  effect: Effect,
): ConsumeAction | undefined {
  // Ensure that we only use this if we can actually use this
  if (!auto_canDrinkCupOfThirteen() || inebriety_left() <= 0 || have(effect)) {
    return undefined;
  }

  return auto_bestCupOfThirteenAction(effect);
}

export function auto_cupOfThirteenBestConsumeAction():
  ConsumeAction | undefined {
  if (!auto_canDrinkCupOfThirteen()) {
    return undefined;
  }

  const action = auto_bestCupOfThirteenAction(Effect.none);

  if (!action) {
    return undefined;
  }

  // If the adv gain is less than what we could possibly gain, we aim for 4+ adv ingreds, so we lower the desirability
  if (
    action.adventures < Math.min(auto_cupOfThirteenAdvRemaining(), 12) &&
    inebriety_left() >= 4
  ) {
    // If we have at least 7 inebriety left, we're probably not going to run out of room on our next drink, so lower the desirability further to avoid drinking at 9 when we could go higher.
    if (inebriety_left() > 6) {
      action.desirability /= 4;
    } else {
      action.desirability /= 2;
    }
  }

  return action;
}
