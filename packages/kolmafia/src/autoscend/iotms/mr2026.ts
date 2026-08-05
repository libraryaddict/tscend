import {
  abort,
  appearanceRates,
  availableAmount,
  availableChoiceOptions,
  buy,
  canDrink,
  canEat,
  canInteract,
  cliExecute,
  closetAmount,
  creatableAmount,
  cupOf13sTier,
  Effect,
  Element,
  entityDecode,
  equip,
  equippedItem,
  extractItems,
  fullnessLimit,
  getProperty,
  haveCampground,
  haveEquipped,
  heartstoneMiddleLetter,
  heartstoneStringLength,
  historicalPrice,
  Item,
  itemAmount,
  itemDropsArray,
  knollAvailable,
  Location,
  Monster,
  myAdventures,
  myDaycount,
  myFamiliar,
  myFullness,
  myHash,
  myInebriety,
  myLocation,
  myMeat,
  myPath,
  Slot,
  spleenLimit,
  Stat,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $elements,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  EternityCodpiece,
  get,
  have,
  set,
} from "libram";

import { auto_unreservedAdvRemaining } from "../../autoscend";
import { auto_buyUpTo, auto_hermit } from "../auto_acquire";
import { autoAdvBypass } from "../auto_adventure";
import {
  auto_autoConsumeOne,
  auto_canEat,
  AUTO_OBTAIN_NULL,
  AUTO_ORGAN_LIVER,
  autoChew,
  fullness_left,
  inebriety_left,
  spleen_left,
  stomach_left,
} from "../auto_consume";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "../auto_familiar";
import { haveFreeRestAvailable } from "../auto_restore";
import { allowSoftblock } from "../auto_routing";
import {
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_location_monsters,
  auto_log_error,
  auto_log_warning,
  auto_runChoice,
  auto_wantToFreeKillWithNoDrops,
  auto_wantToSniff,
  auto_wantToYellowRay,
  autoCraft,
  canSummonMonster,
  handleTracker,
  internalQuestStatus,
  isFreeMonster,
  meatReserve,
  safeGet,
  summonMonster,
} from "../auto_util";
import { monster_to_location, zone_delay } from "../auto_zone";
import { ConsumeAction } from "../autoscend_record";
import { getIncompleteQuestTasks } from "../engine/engine";
import { maximizer } from "../maximizer";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_avantGuard } from "../paths/avant_guard";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_quantumTerrarium } from "../paths/quantum_terrarium";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { is_werewolf } from "../paths/wereprofessor";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
} from "../quests/level_09";
import { L10_needAmuletOfPlotSignificance } from "../quests/level_10";
import {
  L11_needDrumMachine,
  L11_needTombRatchet,
  L11_needWetStew,
} from "../quests/level_11";
import { auto_gunpowderBarrelsWanted } from "../quests/level_12";
import { auto_haveCCSC } from "./mr2023";
import {
  auto_haveBatWings,
  auto_haveChestMimic,
  auto_haveMayamCalendar,
  auto_haveSpringShoes,
} from "./mr2024";
import { auto_canTracesBandit, auto_haveMonodent } from "./mr2025";

// This is meant for items that have a date of 2026

// Mafia doesn't track remaining Exercise Liquidity charges yet, so we bank them ourselves
// in auto_exerciseLiquidity: incremented here on chew, decremented in
// replaceMonsterCombatString() when the skill is actually cast. Remove once mafia adds
// official tracking.
export function auto_chewLiquidAsset(): boolean {
  if (
    !auto_is_valid$2($skill`Exercise Liquidity`) ||
    !auto_is_valid($item`liquid asset`) ||
    spleen_left() < $item`liquid asset`.spleen ||
    isActuallyEd()
  ) {
    return false;
  }

  if (itemAmount($item`liquid asset`) === 0) {
    if (
      // Never drop below 1 coin, we gain 3 at RO
      itemAmount($item`Interesting Coin`) <= 1 ||
      creatableAmount($item`liquid asset`) < 1
    ) {
      return false;
    }

    buy($coinmaster`Interesting Coin`, 1, $item`liquid asset`);
  }

  if (!autoChew(1, $item`liquid asset`)) {
    return false;
  }

  set("auto_exerciseLiquidity", get("auto_exerciseLiquidity", 0) + 1);
  return true;
}

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
  return EternityCodpiece.currentGems().includes(it);
}

const CODPIECE_MANAGED_GEMS: Item[] = $items`blood cubic zirconia, Baseball Diamond, Heartstone`;

// Gems folded into the codpiece's score by the most recent auto_codpieceFoldGemScores() call.
const codpieceFoldedGemsThisPass = new Set<Item>();

// Prefer a spare Heartstone that isn't wanted for stealing a heart this pass over a massive gemstone.
function auto_codpieceFillerItem(): Item {
  return (
    $items`Heartstone, massive gemstone`.find(
      (i) =>
        (!codpieceFoldedGemsThisPass.has(i) ||
          !CODPIECE_MANAGED_GEMS.includes(i)) &&
        itemAmount(i) > 0,
    ) ?? Item.none
  );
}

// Written once per slot the first time we borrow it, then only ever read.
function auto_codpieceOriginalGems(): Item[] {
  const raw = getProperty("_auto_codpiece_original_gems").split(",");

  if (raw.length === 5) {
    return raw.map((s) => Item.get(parseInt(s)));
  }

  set(
    "_auto_codpiece_original_gems",
    EternityCodpiece.currentGems()
      .map((g) => g.id)
      .join(","),
  );
  return EternityCodpiece.currentGems();
}

// These gems compete for the same slot, so scoring them individually only lets the
// maximizer pick one. Folding their scores into the codpiece's instead reflects the
// true value of wearing all of them at once via its five gem slots.
export function auto_codpieceFoldGemScores(): void {
  codpieceFoldedGemsThisPass.clear();

  if (!auto_haveEternityCodpiece()) {
    return;
  }

  let codpieceBonus = 0;
  for (const gem of CODPIECE_MANAGED_GEMS) {
    const amount = maximizer.getBonus(gem);
    if (amount <= 0) {
      continue;
    }
    codpieceBonus += amount;
    maximizer.clearBonus(gem);
    codpieceFoldedGemsThisPass.add(gem);
  }

  if (codpieceBonus > 0) {
    maximizer.bonus($item`The Eternity Codpiece`, codpieceBonus);
  }
}

export function auto_codpieceReconcileGem(gem: Item): void {
  if (!CODPIECE_MANAGED_GEMS.includes(gem)) {
    return;
  }

  const wanted: boolean = codpieceFoldedGemsThisPass.has(gem);
  const codpieceWorn: boolean = haveEquipped($item`The Eternity Codpiece`);
  const inCodpiece: boolean = auto_isInEternityCodpiece(gem);
  const slots: readonly Slot[] = EternityCodpiece.SLOTS;
  const originals: Item[] = auto_codpieceOriginalGems();

  // If we want to wear this and it's not already socketed or worn elsewhere
  if (wanted && codpieceWorn && !inCodpiece && !haveEquipped(gem)) {
    // Find the first slot that is unused, or not special
    const emptySlot = slots.find((s) => equippedItem(s) === Item.none);
    const backfillSlot = [...slots]
      .reverse()
      .find(
        (s) =>
          !CODPIECE_MANAGED_GEMS.includes(equippedItem(s)) &&
          equippedItem(s) === originals[slots.indexOf(s)],
      );
    const target = emptySlot ?? backfillSlot;
    // If no slot
    if (!target) {
      return;
    }

    equip(target, gem);
    return;
  }

  // If it's socketed but no longer wanted, free the slot back up, whether or not
  // the codpiece is still worn, so a still-wanted gem can backfill it later.
  if (!wanted && inCodpiece) {
    const idx = slots.findIndex((s) => equippedItem(s) === gem);
    if (idx === -1) {
      return;
    }

    // Baseball Diamond is always ejected rather than restoring whatever the slot
    // originally held, since holding it idle isn't worth the slot either way.
    if (gem === $item`Baseball Diamond`) {
      equip(slots[idx], auto_codpieceFillerItem());
      return;
    }

    if (originals[idx] === Item.none || itemAmount(originals[idx]) === 0) {
      return;
    }
    equip(slots[idx], originals[idx]);
  }
}

// Backfills any remaining empty codpiece slots.
export function auto_codpieceFillEmptySlots(): void {
  if (!haveEquipped($item`The Eternity Codpiece`)) {
    return;
  }

  for (const slot of EternityCodpiece.SLOTS) {
    if (equippedItem(slot) !== Item.none) {
      continue;
    }
    const filler = auto_codpieceFillerItem();
    if (filler === Item.none) {
      return;
    }
    equip(slot, filler);
  }
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

  return 5 - get("_clubEmTimeUsed");
}

export function wantToClubEmBackInTime(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Club Em Back In Time, based off wantToThrowGravel

  if (auto_clubEmBackInTimesRemaining() === 0) {
    return false;
  }

  if (isFreeMonster(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

export function auto_haveHeartstone(): boolean {
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

export function auto_getItemToEquipHeartstone(): Item {
  if (
    auto_haveEternityCodpiece() &&
    auto_isInEternityCodpiece($item`Heartstone`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (auto_haveHeartstone()) {
    return $item`Heartstone`;
  }
  return Item.none;
}

export function auto_heartstoneLuckRemaining(): number {
  if (!auto_haveHeartstone()) {
    return 0;
  }
  if (getProperty("heartstoneLuckUnlocked") !== "true") {
    return 0;
  }

  if (get("_heartstoneLuckUsed")) {
    return 0;
  }
  return 1;
}

function auto_heartstoneWordsToAimFor(): string[] {
  // This function could be better, instead of being greedy
  // It also doesn't consider what we can realistically encounter
  const words: string[] = [];

  // Try to learn these skills, unless we are low karma, then only LUCK
  for (const [prop, word, always] of [
    ["heartstoneBanishUnlocked", "GONE", false],
    ["heartstoneBuffUnlocked", "BUFF", false],
    ["heartstoneKillUnlocked", "KILL", false],
    ["heartstoneLuckUnlocked", "LUCK", true],
    ["heartstonePalsUnlocked", "PALS", false],
    ["heartstoneStunUnlocked", "STUN", false],
  ] as [string, string, boolean][]) {
    if (!always && get("bankedKarma") < 1000) continue;

    if (get(prop) === "false") words.push(word);
  }

  if (L11_needDrumMachine()) words.push("DRUM");

  if (L10_needAmuletOfPlotSignificance()) words.push("PLOT");

  // Copy / YR
  if (auto_is_valid($item`viral video`)) {
  words.push("TAPE");
  }
  // Free run + 30 turn banish
  if (auto_is_valid($item`handful of split pea soup`)) {
  words.push("SOUP");
  }

  if (
    auto_is_valid($item`grim fairy tale`) &&
    !isActuallyEd() &&
    spleenLimit() >= 3
  ) {
    words.push("TALE");
  }

  if (L11_needWetStew()) {
    words.push("STEW");
  }

  if (L11_needTombRatchet()) {
    words.push("TOMB");
  }

  if (
    itemAmount($item`enchanted bean`) === 0 &&
    internalQuestStatus("questL10Garbage") < 2 &&
    !auto_haveBatWings()
  ) {
    words.push("PLOT");
  }

  if (
    !auto_haveCCSC() &&
    !availableAmount($item`eleven-foot pole`) &&
    !canChangeToFamiliar($familiar`Gelatinous Cubeling`)
  ) {
    words.push("POLE");
  }

  if (!have($item`savings bond`) && auto_is_valid($item`savings bond`)) {
    words.push("BOND");
  }

  if (
    !have($item`the most dangerous bait`) &&
    auto_is_valid($item`the most dangerous bait`)
  ) {
    words.push("MOST");
  }

  // Go for +fam if we can
  if (pathHasFamiliar() && !in_avantGuard()) {
    words.push(
      "CUTE",
      "WARM",
      "ROCK",
      "WEEK",
      "GRIN",
      "CHOW",
      "LOVE",
      "WITH",
      "WITH",
      "JIVE",
      "GLOW",
      "BLUE",
      "FOOT",
      "BLUE",
      "FLAG",
    );

    if (pathAllowsChangingFamiliar() && myFamiliar().experience < 350) {
      words.push("SLOW");
    }
  }
  return words;
}

/**
 *
 * @param location non-null if we're speculating for equipping heartstone
 * @returns true if we should use the skill, or wear the heartstone for a potential stolen heart
 */
export function auto_heartstoneShouldStealHeart(location?: Location): boolean {
  if (location === $location.none || location === $location`Noob Cave`) {
    return false;
  }

  const inCombat: boolean = !location;

  if (
    !auto_haveHeartstone() ||
    !haveEquipped(auto_getItemToEquipHeartstone()) ||
    !auto_is_valid$2($skill`Steal Monster's Heart`) ||
    (inCombat && !auto_have_skill($skill`Steal Monster's Heart`)) || // If in combat and don't have skill
    get("_lastCombatActions")
      .split(";")
      .includes(`sk${$skill`Steal Monster's Heart`.id}`) // If already used this combat
  ) {
    return false;
  }

  const letter = inCombat ? heartstoneMiddleLetter().toUpperCase() : "";

  // If we can't steal a heart
  if (inCombat && letter === "") return false;

  let currentWord = get("heartstoneLetters").toUpperCase();
  // Ensure its always a word that's less than 4 chars
  currentWord = currentWord.slice(Math.floor(currentWord.length / 4) * 4);
  currentWord += letter;
  const allWords = auto_heartstoneWordsToAimFor();

  // If this will sastify a word
  if (currentWord.length >= 4 && allWords.includes(currentWord)) {
    return true;
  }

  // Get every location of every task we have not finished
  // This is a bit flawed, as it doesn't yet know what words are going to be more efficient to aim for, could be eyeing a d5 task on d1 for example
  const allLocations: Location[] = getIncompleteQuestTasks()
    .map((t) => t.locations)
    .filter(Boolean)
    .flatMap((t) =>
      typeof t === "function" ? t() : !Array.isArray(t) ? [t] : t,
    )
    .filter(
      (l): l is Location =>
        !!l && l !== Location.none && l !== $location`Noob Cave`,
    );

  if (location && !allLocations.includes(location)) {
    allLocations.push(location);
  }

  const locationLetters: Map<string, number> = new Map();
  const letterChances: Map<string, number> = new Map();

  // Compile a map of chances for the letter to be sastified via a combat
  for (const loc of allLocations) {
    if (loc.combatPercent <= 0) continue;

    for (const [monster, chance] of auto_location_monsters(loc)) {
      if (chance <= 0 || monster.boss) continue;

      const letter = heartstoneMiddleLetter(monster);

      if (!letter) continue;

      letterChances.set(letter, (letterChances.get(letter) ?? 0) + chance);

      if (loc === location) {
        locationLetters.set(letter, chance);
      }
    }
  }

  // Only if we have letters already and we're in combat
  let getRidOfCurrentWord = inCombat && currentWord.length > 1;

  for (const word of allWords) {
    if (!word.startsWith(currentWord)) continue;

    const remainingLetters = word.substring(currentWord.length).split("");

    const chance = remainingLetters
      .map((l) => letterChances.get(l) ?? 0)
      .reduce((l, r) => Math.min(l, r), 0);

    // If we have less than 5% chance to fulfil this word, we won't mark it as eligable
    if (chance <= 5) continue;

    // If we're speculating
    if (!inCombat) {
      // If the current location has nothing for us here
      if ((locationLetters.get(remainingLetters[0]) ?? 0) <= 0) {
        // Continue, try find another word
        continue;
      }

      return true;
    }

    getRidOfCurrentWord = false;
  }

  // At this point, we're either not in combat, or we're in combat but the current monster isn't going to get anywhere good
  return getRidOfCurrentWord;
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

  return 11 - get("_archSpadeDigs");
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
      handleTracker({
        what: SPADE,
        location: myLocation(),
        detail: `Dig up something nearby reported ${total_items_dropped} drops`,
        property: "auto_otherstuff",
      });
      return total_items_dropped !== 0;
    }
    if (n_digs > auto_spadeDigsRemaining()) {
      // check we actually have fewer digs left now before returning
      handleTracker({
        what: SPADE,
        location: myLocation(),
        detail: `Dig up something nearby - ${my_drop}`,
        property: "auto_otherstuff",
      });
      return true;
    }
    handleTracker({
      what: SPADE,
      detail: "FAILED: Dig up something nearby",
      property: "auto_otherstuff",
    });
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
      handleTracker({
        what: SPADE,
        detail: "Dig up something ancient",
        property: "auto_otherstuff",
      });
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
      handleTracker({
        what: SPADE,
        location: loc,
        detail: `Dig up a skeleton`,
        property: "auto_otherstuff",
      });
      return true;
    }
    handleTracker({
      what: SPADE,
      location: loc,
      detail: "FAILED: Dig up a skeleton",
      property: "auto_otherstuff",
    });
  }
  return false;
}

export function auto_wantToSpadeDigSkeleton(loc: Location): boolean {
  // haunted kitchen is the only zone that calls auto_spadeDigSkeleton() and does not call this function
  // (because it's the only non-delay zone currently supported)
  const valid_loc: boolean = spadeDelayZones().includes(loc);
  const have_digs: boolean = auto_spadeDigsRemaining() > 0;
  const delay_left: boolean = zone_delay(loc)._boolean;
  const zone_set: boolean = safeGet("lastAdventure", Location.none) === loc;
  if (valid_loc && have_digs && delay_left && zone_set) {
    return true;
  }
  return false;
}

export function spadeDelayZones(): Location[] {
  return [$location`The Unquiet Garves`, $location`The Haunted Ballroom`];
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
    if (auto_canEat(preparedDish)) {
      num += itemAmount(legendaryNoodleDishes().get(preparedDish) ?? Item.none);
    }
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
      itemAmount(legendaryNoodleDishes().get(it) ?? Item.none) > 0 &&
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
    count: () => number = () => itemAmount(item),
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
  addIngredient($item`pristine fish scale`);
  addIngredient($item`yam`);
  addIngredient($item`mini kiwi bikini`, () =>
    // Only available if we're past the protesters and the tower is known not sleaze
    // Sleaze is the only test that doesn't start with "people"
    get("telescope2").startsWith("people") &&
    internalQuestStatus("questL11Ron") >= 2
      ? itemAmount($item`mini kiwi bikini`)
      : 0,
  );

  // Add a few items from the war, but only if the war is over and we have duplicates
  if (get("questL12War") === "finished") {
    for (const it of $items`hippy protest button, Lockenstock™ sandals, didgeridooka, wicker shield, oversized pipe, fire poi, Gaia beads, hippy medical kit, flowing hippy skirt, round green sunglasses`) {
      if (itemAmount(it) <= 1) {
        continue;
      }

      // Always keep 1
      addIngredient(it, () => itemAmount(it) - 1);
    }
  }

  return cupOfThirteenIngredients;
}

export function auto_canDrinkCupOfThirteen(): boolean {
  if (in_tcrs() || in_small() || !canDrink()) return false;
  if (get("auto_limitConsume", false)) return false;

  // Falls back to at least 3 advs remaining, which should mean only when it's trying to get the effect as consume would already skip it for better items.
  const minAdvPerFill = get("auto_consumeMinAdvPerFill", 0) || 3;

  if (auto_cupOfThirteenAdvRemaining() < minAdvPerFill) return false;

  if (!auto_is_valid($item`Cup of 13s`)) return false;

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
    [$effect`Runneth Over`, 100], // 50% item drop
    [$effect`Runneth On Empty`, myMeat() > meatReserve() + 3000 ? 5 : 200], // 100% meat drop
    [$effect`Runneth a Tight Ship`, 1], // +5 fam exp
    [$effect`Runneth With The Pack`, 3], // +5 fam weight
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

      auto_log_warning(
        `Failed to acquire ${need()} x ${ingredient.item} when trying to gather ingredients for cup of 13`,
      );
      return false;
    }
    return true;
  };

  return new ConsumeAction(
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
    auto_log_warning(
      `Failed to consume cup of 13s ingredients: ${pick.map((i) => i.item.name).join(", ")}`,
    );
    cliExecute("refresh inventory");
  }

  handleTracker({
    what: $item`Cup of 13s`,
    detail: `${myAdventures() - preAdvs}Advs`,
    property: "auto_drunken",
  });

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

export function auto_have_baseball_diamond(): boolean {
  if (!auto_is_valid($item`Baseball Diamond`)) {
    return false;
  }
  if (availableAmount($item`Baseball Diamond`) > 0) {
    return true;
  }
  if (auto_isInEternityCodpiece($item`Baseball Diamond`)) {
    return true;
  }
  return false;
}

export function auto_getItemToEquipBaseballDiamond(): Item {
  if (
    auto_haveEternityCodpiece() &&
    auto_isInEternityCodpiece($item`Baseball Diamond`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (auto_have_baseball_diamond()) {
    return $item`Baseball Diamond`;
  }
  return Item.none;
}

export function auto_baseball_innings_left(): number {
  return 3 - get("_baseballInnings");
}

export function auto_baseball_team(): Monster[] {
  // Fills to 9; once full, recruiting a new monster bumps slot 0 out.
  return get("baseballTeam")
    .split(",")
    .filter(Boolean)
    .map((s) => Monster.get(s));
}

function auto_baseball_game(plan: Element[]): boolean {
  if (plan.length !== 9) return false;

  if (auto_baseball_innings_left() === 0) return false;

  if (auto_baseball_team().length !== 9) return false;

  visitUrl(`inventory.php?pwd=${myHash()}&action=pball`, false);

  const order: Element[] = $elements`hot, cold, spooky, stench, sleaze`;

  for (let i = 0; i < 9; i++) {
    visitUrl(
      `choice.php?pwd&whichchoice=1598&option=${order.indexOf(plan[i]) + 1}`,
    );
  }
  visitUrl(`choice.php?pwd&whichchoice=1598&option=6`);

  if (auto_baseball_team().length > 0) {
    abort(`Expected to have played baseball, did not.`);
  }
  return true;
}

interface BaseballAssignment {
  element: Element;
  finisherSlot: number;
  normalSlots: number[];
}

function auto_baseballScorchExtras(mon: Monster): boolean {
  // Extra-copy targets that aren't Yellow Ray candidates
  if (mon === $monster`shadow slab`) {
    return auto_haveChestMimic();
  }
  if (mon === $monster`dairy goat`) {
    return !auto_haveMayamCalendar();
  }
  if (mon === $monster`beanbat`) {
    return !auto_haveBatWings();
  }
  return $monsters`pygmy bowler, red butler, baa-relief sheep, blackberry bush`.includes(
    mon,
  );
}

export function auto_baseballScorchWorthy(
  mon: Monster,
  loc: Location,
): boolean {
  // Scorcher guarantees every drop from one fight, so YR's target list applies here too.
  return auto_wantToYellowRay(mon, loc) || auto_baseballScorchExtras(mon);
}

function auto_baseballWorthyTarget(mon: Monster, loc: Location): boolean {
  return auto_baseballScorchWorthy(mon, loc) || auto_wantToSniff(mon, loc);
}

function auto_baseballScorchWorthyAnywhere(mon: Monster): boolean {
  if (
    auto_baseballScorchExtras(mon) ||
    auto_wantToYellowRay(mon, myLocation())
  ) {
    return true;
  }
  return false;
}

function auto_baseballBuildAssignments(team: Monster[]): BaseballAssignment[] {
  const claimed: boolean[] = new Array(team.length).fill(false);
  const assignments: BaseballAssignment[] = [];
  let hotAssigned = false;
  let stenchAssigned = false;
  let spookyAssigned = false;

  for (let i = 0; i < team.length; i++) {
    const unclaimedBefore: number[] = [];
    for (let j = 0; j < i; j++) {
      if (!claimed[j]) {
        unclaimedBefore.push(j);
      }
    }
    if (unclaimedBefore.length < 2) {
      continue;
    }

    const mon = team[i];
    let element: Element | undefined;
    if (!hotAssigned && auto_baseballScorchWorthyAnywhere(mon)) {
      element = $element`hot`;
    } else if (!stenchAssigned && auto_wantToSniff(mon, myLocation())) {
      element = $element`stench`;
    } else if (!spookyAssigned) {
      element = $element`spooky`;
    }
    if (!element) {
      continue;
    }

    const normalSlots = unclaimedBefore.slice(0, 2);
    claimed[i] = true;
    claimed[normalSlots[0]] = true;
    claimed[normalSlots[1]] = true;

    assignments.push({ element, finisherSlot: i, normalSlots });

    if (element === $element`hot`) {
      hotAssigned = true;
    } else if (element === $element`stench`) {
      stenchAssigned = true;
    } else {
      spookyAssigned = true;
    }
  }

  return assignments;
}

function auto_baseballIsSlotZeroLoadBearing(
  assignments: BaseballAssignment[],
): boolean {
  // normalSlots are unchecked padding; only the finisher is an actual target.
  return assignments.some((a) => a.finisherSlot === 0);
}

export function auto_baseballSlotZeroLoadBearing(): boolean {
  const team = auto_baseball_team();
  if (team.length !== 9) {
    return false;
  }
  return auto_baseballIsSlotZeroLoadBearing(
    auto_baseballBuildAssignments(team),
  );
}

export function auto_baseballPitchPlan(): Element[] | undefined {
  const team = auto_baseball_team();
  if (team.length !== 9) {
    return undefined;
  }

  const assignments = auto_baseballBuildAssignments(team);
  const plan: Element[] = new Array(9).fill(Element.none);
  const claimedSlots = new Set<number>();

  for (const a of assignments) {
    plan[a.finisherSlot] = a.element;
    claimedSlots.add(a.finisherSlot);
    for (const s of a.normalSlots) {
      plan[s] = a.element;
      claimedSlots.add(s);
    }
  }

  // Leftover slots just repeat an already-active element
  const fillerElement = assignments[0]?.element ?? $element`stench`;
  for (let i = 0; i < 9; i++) {
    if (!claimedSlots.has(i)) {
      plan[i] = fillerElement;
    }
  }

  return plan;
}

const BASEBALL_TARGET_BONUS = 250;
const BASEBALL_FILLER_BONUS = 50;
const BASEBALL_FILLER_BONUS_REPEAT_ZONE = 8;

// Once a zone has already secured a finisher target, don't keep burning filler slots on it.
function auto_baseballZoneAlreadyTapped(loc: Location): boolean {
  const team = auto_baseball_team();
  for (const a of auto_baseballBuildAssignments(team)) {
    if (monster_to_location(team[a.finisherSlot]).includes(loc)) {
      return true;
    }
  }
  return false;
}

// Monsters at loc (with their encounter rate) that a copier (sword, baseball diamond, ...)
// could actually track/target.
function auto_zoneCopyableMonsters(loc: Location): [Monster, number][] {
  return Object.entries(appearanceRates(loc))
    .map(([_k, _v]) => [Monster.get(_k), _v] as [Monster, number])
    .filter(
      ([mon, rate]) => rate > 0 && mon.id > 0 && mon.copyable && !mon.boss,
    );
}

// Score bonus rather than forcing the item on, so it only wins its equip slot when worth it.
export function auto_baseballDiamondMaximizerBonus(loc: Location): number {
  if (!auto_have_baseball_diamond()) {
    return 0;
  }
  if (auto_baseball_team().length === 9 && auto_baseballSlotZeroLoadBearing()) {
    return 0;
  }

  const hasWorthyTarget = auto_zoneCopyableMonsters(loc).some(([mon]) =>
    auto_baseballWorthyTarget(mon, loc),
  );

  if (hasWorthyTarget) {
    return BASEBALL_TARGET_BONUS;
  }

  // Slots 0-5 are the filler each of the 3 assignments needs, so always keep recruiting
  // those; past that, only recruit more once we've given up holding out for a target.
  if (auto_baseball_team().length >= 6 && allowSoftblock("baseballDiamond")) {
    return 0;
  }

  return auto_baseballZoneAlreadyTapped(loc)
    ? BASEBALL_FILLER_BONUS_REPEAT_ZONE
    : BASEBALL_FILLER_BONUS;
}

export function auto_baseballWantsSomeFish(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!auto_have_baseball_diamond() || !auto_haveMonodent()) {
    return false;
  }
  if (enemy === $monster`some fish`) {
    return false;
  }
  if (auto_baseballWorthyTarget(enemy, loc)) {
    // Already a good target, no need to replace it.
    return false;
  }

  const team = auto_baseball_team();
  if (team.length < 9) {
    return true;
  }
  return !auto_baseballSlotZeroLoadBearing();
}

function auto_baseballZoneHasUnclaimedTarget(
  loc: Location,
  assignments: BaseballAssignment[],
  team: Monster[],
): boolean {
  const claimedFinishers = new Set(
    assignments.map((a) => team[a.finisherSlot]),
  );
  return auto_zoneCopyableMonsters(loc).some(
    ([mon]) =>
      !claimedFinishers.has(mon) && auto_baseballWorthyTarget(mon, loc),
  );
}

export function auto_tryPlayBaseball(): boolean {
  const team = auto_baseball_team();
  if (team.length !== 9) {
    return false;
  }

  const assignments = auto_baseballBuildAssignments(team);
  const slotZeroLoadBearing = auto_baseballIsSlotZeroLoadBearing(assignments);
  if (
    !slotZeroLoadBearing &&
    assignments.length < 3 &&
    auto_baseballZoneHasUnclaimedTarget(myLocation(), assignments, team) &&
    allowSoftblock("baseballDiamond")
  ) {
    return false; // safe to hold out for a better lineup
  }

  const plan = auto_baseballPitchPlan();
  if (!plan || !auto_baseball_game(plan)) {
    return false;
  }

  for (const a of assignments) {
    const effect =
      a.element === $element`hot`
        ? "Drop Items"
        : a.element === $element`spooky`
          ? "Free Fights"
          : "Extra Zone Copies";
    handleTracker({
      what: $item`Baseball Diamond`,
      detail: `${team[a.finisherSlot]} - ${effect}`,
      property: "auto_otherstuff",
    });
  }

  return true;
}

export function auto_baseball_freefight_monster(): Monster {
  return get("_curveballMonster", $monster.none);
}

export function auto_baseball_freefights_left(): number {
  return get("_curveballFightsLeft", 0);
}

export function auto_have_sword_familiar(): boolean {
  return (
    !in_quantumTerrarium() &&
    pathHasFamiliar() &&
    auto_have_familiar($familiar`Sword of S Words`)
  );
}

export function auto_sword_of_swords_kills_left(): number {
  return Math.max(0, 100 - get("_swordOfSWordsKills"));
}

export function auto_sword_of_swords_switches_left(): number {
  return 3 - get("_swordOfSWordsMonsterChanged");
}

export function auto_sword_of_swords_tracking(): Monster {
  return safeGet("swordOfSWordsMonster", Monster.none);
}

export function auto_swordFamiliarWantsMonsterDrops(
  sMonster: Monster,
  chanceToEncounterMonster: number = 0, // The chance we have of encountering the monster, between 0 to 100, 100 is eg, summons or perildot
): boolean {
  // Does not determine if we want to be using the familiar right now.
  if (sMonster === Monster.none) {
    return false;
  }

  const currentlyTracking = auto_sword_of_swords_tracking() === sMonster;
  // Amount of days left in this run, always at least 1
  const daysLeftInRun = Math.max(
    get("auto_runDayCount", 0) + (myDaycount() - 1),
    1,
  );

  // Free kills
  if (sMonster === $monster`shadow slab`) {
    // We use 13 a day, subtract the bricks we have on hand and return the total amount of bricks
    const bricksNeeded =
      13 * daysLeftInRun -
      (get("_shadowBricksUsed") + itemAmount($item`shadow brick`));

    if (bricksNeeded > 0) {
      return true;
    }
  }

  // Smut orcs
  if (
    $monsters`smut orc jacker, smut orc nailer, smut orc pipelayer, smut orc screwer`.includes(
      sMonster,
    )
  ) {
    const fastenerNeed: number = bridgeGoal() - fastenerCount();
    const lumberNeed: number = bridgeGoal() - lumberCount();
    // We don't actually sword this monster, maybe in the future?
    if (fastenerNeed > 0 || lumberNeed > 0) {
      return true;
    }
  }

  // Crypt
  if (
    $monsters`skeleton astronaut, spiny skelelton, toothy sklelton`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`evil eye`) &&
    get("cyrptNookEvilness") - itemAmount($item`evil eye`) * 3 > 13
  ) {
    return true;
  }

  // Some free runs
  if (
    (currentlyTracking || chanceToEncounterMonster >= 100) &&
    !auto_haveSpringShoes() &&
    sMonster === $monster`Green Ops Soldier`
  ) {
    // A flat 20, because we don't actually sword this monster as of time of writing
    return itemAmount($item`green smoke bomb`) < 20;
  }

  // Pyamid of ed
  if (
    currentlyTracking &&
    sMonster === $monster`tomb rat` &&
    L11_needTombRatchet()
  ) {
    return true;
  }

  // Aboo peak
  if (
    $monsters`Battlie Knight Ghost, Claybender Sorcerer Ghost, Dusken Raider Ghost, Space Tourist Explorer Ghost, Whatsian Commando Ghost`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`A-Boo clue`) &&
    itemAmount($item`A-Boo clue`) * 30 < get("booPeakProgress") - 2 // We don't value this if we'd get the same outcome with a normal fight
  ) {
    return true;
  }

  // High Peak
  if (
    $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`rusty hedge trimmers`) &&
    hedgeTrimmersNeeded() > 0
  ) {
    return true;
  }

  // Lobster man
  if (
    (!auto_havePastaWand() ||
      !canEat() ||
      fullness_left() < 1 ||
      !auto_is_valid($item`Tubetto Gelatto`) ||
      auto_sword_of_swords_tracking() === $monster`lobsterfrogman` ||
      get("legendaryNoodlesAmygdala") === 0) &&
    sMonster === $monster`lobsterfrogman` &&
    auto_gunpowderBarrelsWanted() > 0
  ) {
    return true;
  }

  // Bowling ball
  if (
    sMonster === $monster`pygmy bowler` &&
    //
    5 -
      Math.max(get("hiddenBowlingAlleyProgress"), 0) -
      (itemAmount($item`bowling ball`) + closetAmount($item`bowling ball`)) >
      0
  ) {
    return true;
  }

  // Bat cave
  if (
    (currentlyTracking || !auto_haveBatWings()) &&
    auto_is_valid($item`sonar-in-a-biscuit`) &&
    internalQuestStatus("questL04Bat") + itemAmount($item`sonar-in-a-biscuit`) <
      3 &&
    itemDropsArray(sMonster).some(
      (s) => s.drop === $item`sonar-in-a-biscuit` && s.rate > 0,
    )
  ) {
    return true;
  }

  return false;
}

export function auto_desires_sword_familiar_drops(): boolean {
  // Returns if the sword familiar is currently set to a monster that we want the drops of
  return auto_swordFamiliarWantsMonsterDrops(auto_sword_of_swords_tracking());
}

function auto_swordFamiliarWantsToTrack(
  mon: Monster,
  chance: number = 0,
): boolean {
  // The sword can only copy drops from copyable, non-boss monsters
  return (
    mon.copyable &&
    !mon.boss &&
    auto_swordFamiliarWantsMonsterDrops(mon, chance)
  );
}

export function auto_wantToStartTrackingSwordMonster(
  enemy: Monster,
  chance: number = 0,
): boolean {
  // Targets the current enemy for future fights - doesn't affect this fight's own drops.
  if (myFamiliar() !== $familiar`Sword of S Words`) {
    return false;
  }
  if (
    auto_sword_of_swords_kills_left() <= 0 ||
    auto_sword_of_swords_switches_left() <= 0
  ) {
    return false;
  }
  if (auto_sword_of_swords_tracking() === enemy) {
    return false; // already tracking it
  }
  return auto_swordFamiliarWantsToTrack(enemy, chance);
}

export function auto_swordWantsToStopKilling() {
  if (myFamiliar() !== $familiar`Sword of S Words`) return false;

  if (auto_sword_of_swords_tracking() === Monster.none) return false;

  return !auto_swordFamiliarWantsToTrack(auto_sword_of_swords_tracking(), 100);
}

export function auto_wantSwordFamiliar(place: Location): boolean {
  if (!auto_have_sword_familiar() || auto_sword_of_swords_kills_left() <= 0) {
    return false;
  }
  // Traces/afterimage bandit chains force the same rematch either way, and fantasy bandit's own drop is conditional (never overwritten), so it's free
  if (auto_canTracesBandit() && auto_desires_sword_familiar_drops()) {
    return true;
  }
  if (!zone_delay(place)._boolean) {
    return false;
  }
  if (auto_desires_sword_familiar_drops()) {
    return true; // already tracking something useful
  }
  if (auto_sword_of_swords_switches_left() <= 0) {
    return false;
  }
  // Is there anything here worth switching our tracked monster to?
  return auto_location_monsters(place).some(
    ([mon, chance]) =>
      chance > 0 && auto_swordFamiliarWantsToTrack(mon, chance),
  );
}

function auto_swordFamiliarShouldDelayZone(monsters: Monster[]): boolean {
  // Soft-delay a level's quest-turn-in while we're still farming value.
  return (
    monsters.includes(auto_sword_of_swords_tracking()) &&
    auto_desires_sword_familiar_drops() &&
    allowSoftblock("swordTracking")
  );
}

function auto_baseballShouldDelayZone(
  zoneMonsters: [Monster, number][],
): boolean {
  // Soft-delay a level's quest-turn-in while a recruited teammate here hasn't been played yet.
  if (auto_baseball_innings_left() <= 0) {
    return false;
  }
  const team = auto_baseball_team();
  if (team.length === 0) {
    return false;
  }
  // A guaranteed (100%) encounter chance means we'll fight it on our very next adventure
  // here regardless of when we turn in, so there's nothing left to protect by delaying.
  const unreliableTargets = new Set(
    zoneMonsters.filter(([, rate]) => rate < 100).map(([mon]) => mon),
  );
  return (
    auto_baseballBuildAssignments(team).some((a) =>
      unreliableTargets.has(team[a.finisherSlot]),
    ) && allowSoftblock("baseballDiamond")
  );
}

// Soft-delay leaving these zones (a level's quest-turn-in, typically) while the Sword of S Words or Baseball Diamond is still mid-farm on a monster that only appears here.
export function auto_copierShouldDelayZone(locs: Location[]): boolean {
  const zoneMonsters = locs.flatMap(auto_zoneCopyableMonsters);
  return (
    auto_swordFamiliarShouldDelayZone(zoneMonsters.map(([mon]) => mon)) ||
    auto_baseballShouldDelayZone(zoneMonsters)
  );
}

// Monsters worth spending a spare summon on to bootstrap the sword's first target
const SWORD_SUMMONABLE_TARGETS: Monster[] = $monsters`shadow slab`;

export function auto_summonSwordTarget(): boolean {
  if (
    !auto_have_sword_familiar() ||
    auto_sword_of_swords_tracking() !== Monster.none ||
    auto_sword_of_swords_switches_left() <= 0 ||
    auto_sword_of_swords_kills_left() <= 0
  ) {
    return false;
  }

  const target = SWORD_SUMMONABLE_TARGETS.find(
    (mon) =>
      auto_swordFamiliarWantsMonsterDrops(mon, 100) && canSummonMonster(mon),
  );
  if (!target) {
    return false;
  }

  if (myFamiliar() !== $familiar`Sword of S Words`) {
    // Some summon methods (e.g. the chest mimic's mimic egg) fight immediately via an
    // item use, bypassing the normal pre_adv familiar switch, so force it right now too.
    if (
      !handleFamiliar$1($familiar`Sword of S Words`) ||
      !useFamiliar($familiar`Sword of S Words`)
    ) {
      return false;
    }
  }

  return summonMonster(target);
}
