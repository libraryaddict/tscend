import {
  abort,
  availableAmount,
  availableChoiceOptions,
  buy,
  canAdventure,
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
  handlingChoice,
  haveCampground,
  haveEquipped,
  heartstoneMiddleLetter,
  heartstoneStringLength,
  historicalPrice,
  isBanished,
  Item,
  itemAmount,
  itemDropsArray,
  knollAvailable,
  lastMonster,
  Location,
  Monster,
  myAdventures,
  myDaycount,
  myFamiliar,
  myFullness,
  myHash,
  myInebriety,
  myLevel,
  myLocation,
  myMeat,
  myPath,
  sellPrice,
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
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $stat,
  EternityCodpiece,
  get,
  getKramcoWandererChance,
  have,
  isVoteWandererNow,
  isWandererNow,
  set,
  Wanderer,
} from "libram";

import { auto_unreservedAdvRemaining } from "../../../autoscend";
import { auto_buyUpTo, auto_hermit } from "../../auto_acquire";
import { autoAdvBypass } from "../../auto_adventure";
import {
  auto_autoConsumeOne,
  auto_canEat,
  AUTO_OBTAIN_NULL,
  AUTO_ORGAN_LIVER,
  autoChew,
  canChew,
  fullness_left,
  getMinimumAdventuresToMaintain,
  inebriety_left,
  spleen_left,
  stomach_left,
} from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { haveFreeRestAvailable } from "../../auto_restore";
import { clearSoftblock, isSoftBlockInPlace } from "../../auto_routing";
import {
  auto_get_campground,
  auto_is_valid,
  auto_is_valid$2,
  auto_isInIncompleteZone,
  auto_isWorthSniffing,
  auto_isWorthYellowRaying,
  auto_location_monsters,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  auto_wantToBanish,
  auto_wantToFreeKillWithNoDrops,
  auto_zoneCopyableMonsters,
  autoCraft,
  canSummonMonster,
  handleTracker,
  internalQuestStatus,
  isFreeMonster,
  meatReserve,
  safeGet,
  set_next_fight_is_free,
  summonMonster,
  TrackerKey,
} from "../../auto_util";
import { zone_delay } from "../../auto_zone";
import { ConsumeAction } from "../../autoscend_record";
import { auto_canUse, isSniffed } from "../../combat/auto_combat_util";
import { getIncompleteQuestTasks, taskLocations } from "../../engine/engine";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { in_small } from "../../paths/2023/small";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { is_werewolf } from "../../paths/2024/wereprofessor";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
} from "../../quests/level_09";
import { L10_needAmuletOfPlotSignificance } from "../../quests/level_10";
import {
  L11_needDrumMachine,
  L11_needTombRatchet,
  L11_needWetStew,
} from "../../quests/level_11";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";
import { maximizer } from "../../utils/maximizer";
import { auto_haveKramcoSausageOMatic } from "../2010/mr2019";
import { auto_haveTrainSet } from "./mr2022";
import { auto_haveCCSC } from "./mr2023";
import { auto_haveBatWings, auto_haveSpringShoes } from "./mr2024";
import {
  auto_bczRefractedGaze,
  auto_canTracesBandit,
  auto_haveMonodent,
  auto_isPotentialTalkToSomeFishTarget,
  haveUsedPeridot,
} from "./mr2025";

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
  return EternityCodpiece.currentGems().includes(it);
}

const CODPIECE_MANAGED_GEMS: Item[] = $items`blood cubic zirconia, Baseball Diamond, Heartstone, Peridot of Peril`;

// Prefer a spare Heartstone that isn't wanted for stealing a heart this pass over a massive gemstone.
function auto_codpieceFillerItem(): Item {
  return (
    $items`Heartstone, massive gemstone`.find(
      (i) =>
        (maximizer.getBonus(i) <= 0 || !CODPIECE_MANAGED_GEMS.includes(i)) &&
        itemAmount(i) > 0,
    ) ?? $item.none
  );
}

// These gems compete for the same slot, so scoring them individually only lets the
// maximizer pick one. Folding their scores into the codpiece's instead reflects the
// true value of wearing all of them at once via its five gem slots.
export function auto_codpieceFoldGemScores(): void {
  if (!auto_haveEternityCodpiece()) {
    maximizer.clearFoldedBonuses($item`The Eternity Codpiece`);
    return;
  }

  maximizer.foldBonusesInto(
    $item`The Eternity Codpiece`,
    CODPIECE_MANAGED_GEMS,
  );
}

export function auto_codpieceReconcileGem(gem: Item): void {
  if (!CODPIECE_MANAGED_GEMS.includes(gem)) {
    return;
  }

  const wanted: boolean =
    maximizer.getBonus(gem) > 0 || gem === $item`Heartstone`; // <3 the stone
  const codpieceWorn: boolean = haveEquipped($item`The Eternity Codpiece`);
  const inCodpiece: boolean = auto_isInEternityCodpiece(gem);
  const slots: readonly Slot[] = EternityCodpiece.SLOTS;

  // If we want to wear this and it's not already socketed or worn elsewhere
  if (wanted && codpieceWorn && !inCodpiece && !haveEquipped(gem)) {
    // Find the first slot that is unused, or not special
    const emptySlot = slots.find((s) => equippedItem(s) === $item.none);
    const backfillSlot = [...slots]
      .reverse()
      .find((s) => maximizer.getBonus(equippedItem(s)) <= 0);
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

    const filler = auto_codpieceFillerItem();

    // Baseball Diamond is always ejected
    // Since holding it idle isn't worth the slot either way.
    if (
      gem !== $item`Baseball Diamond` &&
      (filler === $item.none || filler === equippedItem(slots[idx]))
    ) {
      return;
    }

    equip(slots[idx], filler);
  }
}

// Backfills any remaining empty codpiece slots.
export function auto_codpieceFillEmptySlots(): void {
  if (!haveEquipped($item`The Eternity Codpiece`)) {
    return;
  }

  for (const slot of EternityCodpiece.SLOTS) {
    if (equippedItem(slot) !== $item.none) {
      continue;
    }
    const filler = auto_codpieceFillerItem();
    if (filler === $item.none) {
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
  if (possessEquipment($item`Heartstone`)) {
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
  return $item.none;
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

  // TOMB hasn't performed well, especially when we need 10.

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

  // Some item drop
  words.push(
    "WIDE",
    "BETA",
    "FIVE",
    "FAST",
    "RAVE",
    "GAME",
    "EVER",
    "HAVE",
    "RAIN",
    "SEEN",
    "FOOL",
    "HELD",
  );
  return words;
}

export function auto_heartstoneCurrentWord(): string {
  let currentWord = get("heartstoneLetters").toUpperCase();
  // Ensure its always a word that's less than 4 chars
  currentWord = currentWord.slice(
    currentWord.length - (currentWord.length % 4),
  );
  return currentWord;
}

export function auto_heartstoneShouldStealHeartInCombat(): boolean {
  if (!auto_haveHeartstone() || !auto_canUse($skill`Steal Monster's Heart`)) {
    return false;
  }

  const letter = heartstoneMiddleLetter(lastMonster()).toUpperCase();

  // If we can't steal a heart
  if (letter === "") return false;

  const currentWord = auto_heartstoneCurrentWord();
  const allWords = auto_heartstoneWordsToAimFor();

  // If this letter alone will sastify a word, always take it
  if (allWords.includes(currentWord + letter)) {
    return true;
  }

  const { letterChances } = auto_heartstoneLetterChances();

  let currentWordIsStillOnTrack = false;

  for (const word of allWords) {
    if (!word.startsWith(currentWord)) continue;

    const missingLetters = word.substring(currentWord.length).split("");

    let snipedALetter: boolean = false;
    // We have 100% chance of the current letter, so we don't check it
    if (missingLetters[0] === letter) {
      missingLetters.shift();
      snipedALetter = true;
    }

    const worstChanceOfAnyMissingLetter = missingLetters
      .map((l) => letterChances.get(l) ?? 0)
      .reduce((worst, chance) => Math.min(worst, chance), 1000);

    // Less than 5% chance of ever finding one of the missing letters -> not on track
    if (worstChanceOfAnyMissingLetter <= 5) continue;

    // We sniped the letter, which means if we steal this monster, we'd have progress
    if (snipedALetter) {
      return true;
    }

    currentWordIsStillOnTrack = true;
  }

  // The current word is valid, but, we would lose progress if we stole this letter
  if (currentWordIsStillOnTrack) {
    return false;
  }

  // The current word is a lost cause, return true if there's actually a word.
  return currentWord.length > 0;
}

export function auto_heartstoneShouldEquipForStealHeart(
  location: Location,
): boolean {
  if (location === $location.none || location === $location`Noob Cave`) {
    return false;
  }

  if (
    !auto_haveHeartstone() ||
    !auto_is_valid$2($skill`Steal Monster's Heart`)
  ) {
    return false;
  }

  const currentWord = auto_heartstoneCurrentWord();
  const allWords = auto_heartstoneWordsToAimFor();

  const { letterChances, currentLocationLetters } =
    auto_heartstoneLetterChances(location);

  // Would fighting here plausibly give us progress towards a target word?
  // Is the current string leading to something?
  let currentWordPossible = false;

  for (const word of allWords) {
    if (!word.startsWith(currentWord)) continue;

    const missingLetters = word.substring(currentWord.length).split("");

    const worstChanceOfAnyMissingLetter = missingLetters
      .map((l) => letterChances.get(l) ?? 0)
      .reduce((worst, chance) => Math.min(worst, chance), 1000);

    // Less than 5% chance of ever finding one of the missing letters -> not achievable
    if (worstChanceOfAnyMissingLetter <= 5) continue;

    // The current word is clearly possible
    currentWordPossible = true;

    // If no letters here to be gained
    if ((currentLocationLetters.get(missingLetters[0]) ?? 0) <= 0) {
      continue;
    }
    // We would gain progress here
    return true;
  }

  // No candidate word we can make progress on here -> only worth it to dump
  // (fill with garbage) an existing word so we can start fresh next time
  return currentWord.length > 0 && !currentWordPossible;
}

/**
 * Compiles the chance of encountering each heartstone letter across every location tied to an incomplete quest task, optionally also tracking the chances specific to a single `location` of interest.
 *
 * This is a bit flawed, as it doesn't yet know what words are going to be more efficient to aim for, could be eyeing a d5 task on d1 for example.
 */
function auto_heartstoneLetterChances(location?: Location): {
  letterChances: Map<string, number>;
  currentLocationLetters: Map<string, number>;
} {
  const allLocations: Location[] = getIncompleteQuestTasks()
    .flatMap((t) => taskLocations(t))
    .filter(
      (l): l is Location =>
        !!l && l !== $location.none && l !== $location`Noob Cave`,
    );

  if (
    location &&
    location !== $location.none &&
    location !== $location`Noob Cave` &&
    !allLocations.includes(location)
  ) {
    allLocations.push(location);
  }

  const currentLocationLetters: Map<string, number> = new Map();
  const letterChances: Map<string, number> = new Map();

  for (const loc of allLocations) {
    if (loc.combatPercent <= 0) continue;

    for (const [monster, chance] of auto_location_monsters(loc)) {
      if (chance <= 0 || monster.boss) continue;

      const letter = heartstoneMiddleLetter(monster);

      if (letter === "") continue;

      letterChances.set(letter, (letterChances.get(letter) ?? 0) + chance);

      if (loc === location) {
        currentLocationLetters.set(
          letter,
          (currentLocationLetters.get(letter) ?? 0) + chance,
        );
      }
    }
  }

  return { letterChances, currentLocationLetters };
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
    let my_drop: Item = $item.none;
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
      location: myLocation(),
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
        location: myLocation(),
        detail: "Dig up something ancient",
        property: "auto_otherstuff",
      });
      return true;
    }
  }
  return false;
}

export function auto_spadeDigSkeleton(place: Location): boolean {
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
    try {
      set_next_fight_is_free();
      if (autoAdvBypass(0, pages, place)) {
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
    } finally {
      // Reset the flag
      set_next_fight_is_free(false);
    }
  }
  return false;
}

export function auto_wantToSpadeDigSkeleton(loc: Location): boolean {
  // haunted kitchen is the only zone that calls auto_spadeDigSkeleton() and does not call this function
  // (because it's the only non-delay zone currently supported)
  const valid_loc: boolean = spadeDelayZones().includes(loc);
  const have_digs: boolean = auto_spadeDigsRemaining() > 0;
  const delay_left: boolean = zone_delay(loc).shouldDelay;
  const zone_set: boolean = safeGet("lastAdventure") === loc;
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
  if (!isSoftBlockInPlace("legendaryPasta")) {
    return false;
  }
  if (
    auto_findBaseLegendaryNoods() !== $item.none ||
    auto_findPreparedLegendaryNoods() !== $item.none
  ) {
    clearSoftblock("legendaryPasta");
    return false;
  }
  return true;
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
  let effect: Effect = $effect.none;
  let stat: Stat = $stat.none;

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

  const statAmount = stat !== $stat.none ? extraScore * 50 : 0;
  const effectTurns = effect !== $effect.none ? extraScore * 20 : 0;

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
        reqEffect !== $effect.none &&
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
  if (reqEffect !== $effect.none) {
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
  effect: Effect = $effect.none,
): ConsumeAction {
  // Get the raw adv gain
  const advs: number = Math.min(
    pick.reduce((sum, ing) => sum + ing.data.adventures, 0),
    auto_cupOfThirteenAdvRemaining(),
  );
  // Boost the value if we're looking for this effect
  const value =
    effect !== $effect.none && pick.some((i) => i.data.effect === effect)
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

  const action = auto_bestCupOfThirteenAction($effect.none);

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
  return $item.none;
}

export function auto_baseballInningsRemaining(): number {
  return 3 - get("_baseballInnings");
}

export function auto_baseballFreefightMonster(): Monster {
  return auto_baseballFreefightsRemaining() > 0
    ? safeGet("_curveballMonster")
    : $monster.none;
}

export function auto_baseballFreefightsRemaining(): number {
  return get("_curveballFightsLeft", 0);
}

export function auto_baseballRecruits(): Monster[] {
  // Fills to 9; once full, recruiting a new monster bumps slot 0 out.
  return get("baseballTeam")
    .split(",")
    .filter(Boolean)
    .map((s) => Monster.get(s));
}

function auto_playBaseballGame(assignments: BaseballAssignment[]): boolean {
  visitUrl(`inventory.php?pwd=${myHash()}&action=pball`, false);

  if (!handlingChoice()) return false;

  // The order here matters
  const finishers: [Element, string, TrackerKey | undefined][] = [
    [$element`hot`, "Yellow Ray", "auto_yellowRays"],
    [$element`cold`, "Banish", "auto_banishes"],
    [$element`spooky`, "Free Fights", "auto_instakill"],
    [$element`stench`, "Extra Zone Copies", "auto_copies"],
    [$element`sleaze`, "High ML", undefined],
  ];

  const fillerPriority = new Map<string, [number, string]>([
    [
      "Throw a Garbageball",
      [
        (auto_is_valid($item`discarded hot dog`) && canEat()) ||
        (auto_is_valid($item`most of a beer`) && canDrink())
          ? 100
          : -1,
        "Food/Drink",
      ],
    ],
    ["Throw Some Smoke", [99, "+5 All Stats"]], // +5 stats
    ["Throw One in the Deep Freeze", [98, "3 DR"]], // +3 DR
    ["Throw a Bacon-Wrapped Slider", [5, "+Init"]], // Combat init
    ["Throw a Snow Ball", [4, "2-4 MP Regen"]], // +2-4 MP Regen
    ["Throw a Ghost Pitch", [3, "3-5 HP Regen"]], // 3-5 HP Regen
    ["Throw a Slurve", [-2, "Sleaze Res"]], // Sleaze res
    ["Bring the Heat", [-3, "Hot Dmg"]], // +5 hot dmg
    ["Draw a Skull on the Ball", [-4, "Reduce Enemy Attack/Def"]], // Reduced att+def
    ["Throw a Beanball", [-5, "Passive Stench Dmg"]], // Passive stench damage
  ]);

  const playedCounts = new Map<Element, number>();
  const track: [Monster, string, TrackerKey | undefined][] = [];

  function isSafeToPlay(element: Element, currentSlot: number): boolean {
    const finisherHere = assignments.find(
      (a) => a.finisherSlot === currentSlot,
    );

    // If this slot is a finisher, we must play its element.
    if (finisherHere) {
      return element === finisherHere.element;
    }

    // We cannot premature a 3rd element in a normal slot.
    if ((playedCounts.get(element) ?? 0) === 2) {
      return false;
    }

    // Do we have enough slots left for our mandatory setups?
    let totalNeeded = 0;
    let availableSlots = 0;

    // Look at all remaining slots after this one
    for (let k = currentSlot + 1; k < 9; k++) {
      const futureFinisher = assignments.find((a) => a.finisherSlot === k);

      if (!futureFinisher) {
        // It's a free slot we can use for setups
        availableSlots++;
        continue;
      }

      // Calculate how many setups this finisher still needs
      let needed = 2 - (playedCounts.get(futureFinisher.element) ?? 0);

      // If we are playing its setup right now, it needs 1 less!
      if (element === futureFinisher.element) {
        needed--;
      }

      totalNeeded += Math.max(0, needed);

      // If the setups we need are greater than the free slots available before
      // this finisher, then playing this element would starve us
      if (totalNeeded > availableSlots) {
        return false;
      }
    }

    return true;
  }

  const team = auto_baseballRecruits();
  let lastRetry = -1;

  // Play the game
  for (let i = 0; i < 9; i++) {
    const options = availableChoiceOptions();

    let bestElement = $element.none;
    let bestChoice = 0;
    let highestPriority = -9999;
    let gain: string = "???";
    let trackerKey: TrackerKey | undefined = undefined;

    for (const [element, eleGain, key] of finishers) {
      // If our math says it ruins a finisher, skip it
      if (!isSafeToPlay(element, i)) continue;

      const choiceNum = finishers.findIndex(([e]) => e === element) + 1;

      // Check our priorities, we default to -1000, which is still better than nothing
      const priority: [number, string] = fillerPriority.get(
        options[choiceNum],
      ) ?? [-1000, eleGain];

      // Pick the safe choice with the highest score
      if (priority[0] > highestPriority) {
        highestPriority = priority[0];
        bestElement = element;
        bestChoice = choiceNum;
        gain = priority[1];
        trackerKey = key;
      }
    }

    if (bestChoice === 0) {
      if (lastRetry !== i) {
        lastRetry = i;
        visitUrl("choice.php");
        i--;
        continue;
      }
      abort(
        `Failed to find a valid pitch for baseball slot ${i}. Available options are ${availableChoiceOptions()}`,
      );
    }
    // This was a finisher
    if (highestPriority === -1000) {
      track.push([team[i], gain, trackerKey]);
    }

    // Track the pitch
    playedCounts.set(bestElement, (playedCounts.get(bestElement) ?? 0) + 1);

    auto_log_info(
      `Baseball round ${i + 1}, throwing ${bestElement} ball #${playedCounts.get(bestElement)} at ${team[i]} for ${gain}`,
    );
    visitUrl(`choice.php?pwd&whichchoice=1598&option=${bestChoice}`);
  }

  for (const [monster, gain, trackerKey] of track) {
    for (const key of ["auto_otherstuff", trackerKey]) {
      if (!key) continue;

      handleTracker({
        what: $item`Baseball Diamond`,
        detail: `${monster} - ${gain}`,
        property: key as TrackerKey,
      });
    }
  }
  visitUrl(`choice.php?pwd&whichchoice=1598&option=6`);

  if (auto_baseballRecruits().length > 0) {
    abort(`Expected to have played baseball, did not.`);
  }

  return true;
}

interface BaseballAssignment {
  element: Element;
  finisherMonster: Monster;
  finisherSlot: number;
  normalSlots: number[];
}

function auto_baseballGetDesiredElements(
  mon: Monster,
  loc: Location = myLocation(),
): Element[] {
  const elements: Element[] = [];
  if (auto_isWorthYellowRaying(mon, loc)) {
    elements.push($element`hot`);
  }

  if (auto_isWorthSniffing(mon, loc)) {
    elements.push($element`stench`);
    elements.push($element`spooky`);
  } else if (auto_haveMonodent() && mon === $monster`some fish`) {
    elements.push($element`spooky`);
  }
  if (
    !isBanished(mon) &&
    auto_wantToBanish(mon, loc) &&
    auto_isInIncompleteZone(mon)
  ) {
    elements.push($element`cold`);
  }
  return elements;
}

function auto_baseballBuildAssignments(team: Monster[]): BaseballAssignment[] {
  const possible: [Element[], number][] = team
    .map(
      (mon, slot) =>
        [slot < 2 ? [] : auto_baseballGetDesiredElements(mon), slot] as [
          Element[],
          number,
        ],
    )
    .filter(([eles]) => eles.length > 0);

  possible.sort((a, b) => a[1] - b[1]);

  function compareAssignments(
    a: [Element, number][],
    b: [Element, number][],
  ): boolean {
    if (a.length !== b.length) {
      return a.length > b.length;
    }

    // Same number of finishers. Prefer earlier finish slots if its the same monster, otherwise later
    const aSlots = a.map(([, slot]) => slot);
    const bSlots = b.map(([, slot]) => slot);

    for (let i = 0; i < aSlots.length; i++) {
      if (aSlots[i] !== bSlots[i]) {
        // If its the same monster, prefer earlier slots
        if (team[aSlots[i]] === team[bSlots[i]]) {
          return aSlots[i] < bSlots[i];
        }
        // If its not the same, prefer latter (we'd get better targets perhaps)
        return aSlots[i] > bSlots[i];
      }
    }

    return false;
  }

  function getLargestGroup(
    claimed: Element[],
    startSlot: number,
  ): [Element, number][] {
    const candidates = possible.filter((p) => p[1] <= startSlot);

    let best: [Element, number][] = [];

    for (const [eles, slot] of candidates) {
      for (const ele of eles) {
        if (claimed.includes(ele)) continue;

        const result = getLargestGroup([...claimed, ele], slot - 1);
        const candidate = [...result, [ele, slot]] as [Element, number][];

        if (compareAssignments(candidate, best)) {
          best = candidate;
        }

        // If this branch already hit the theoretical maximum,
        // we don't need to explore weaker branches.
        const maxPossible = Math.floor((startSlot - 1) / 3);
        if (best.length === maxPossible) {
          return best;
        }
      }
    }

    return best;
  }

  const largest = getLargestGroup([], 9);

  const assignments: BaseballAssignment[] = largest.map(
    ([element, finisherSlot]) => ({
      element,
      finisherSlot,
      finisherMonster: team[finisherSlot],
      normalSlots: [],
    }),
  );

  // Fill unused slots into normal positions.
  for (let i = 0; i < 9; i++) {
    if (assignments.some((a) => a.finisherSlot === i)) {
      continue;
    }

    assignments.find((a) => a.normalSlots.length < 2)?.normalSlots.push(i);
  }

  return assignments;
}

// Monsters at loc (with their encounter rate) that a copier (sword, baseball diamond, ...)
// could actually track/target.

// Score bonus rather than forcing the item on, so it only wins its equip slot when worth it.
export function auto_baseballDiamondMaximizerBonus(loc: Location): number {
  if (!auto_have_baseball_diamond()) return 0;

  if (
    auto_baseballInningsRemaining() === 0 &&
    (!canEat() ||
      !canDrink() ||
      (fullness_left() > 0 && inebriety_left() > 0) ||
      getMinimumAdventuresToMaintain() + 10 > myAdventures())
  ) {
    return 0;
  }

  const team = auto_baseballRecruits();
  const assignments = auto_baseballBuildAssignments(team);

  const assignedElements = assignments.map((a) => a.element);

  // Is this monster one we want to sniff or YR, and we do not have assignments for already
  const hasWorthyTarget = auto_zoneCopyableMonsters(loc).some(
    ([mon]) =>
      (auto_isWorthYellowRaying(mon, loc) || auto_isWorthSniffing(mon, loc)) &&
      auto_baseballGetDesiredElements(mon, loc).some(
        (e) => !assignedElements.includes(e),
      ),
  );

  const hasWorthyTargetsInTeam = assignments.length > 0;

  if (hasWorthyTargetsInTeam) {
    // When our baseball has worthy targets, then we don't wear the baseball if we're adventuring in a zone without a worthy target
    return hasWorthyTarget ? 250 : 0;
  }

  // When our baseball has no worthy targets in it
  if (team.length < 6) {
    // we are filling the baseballs first 6 slots and we avoid the worthy zones
    return hasWorthyTarget ? 0 : 50;
  } else {
    // we'll try to fill the last 3 when we've recruited enough (fillers).
    return hasWorthyTarget ? 250 : 0;
  }
}

export function auto_baseballShouldReplaceWithFish(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!auto_have_baseball_diamond() || !auto_haveMonodent()) {
    return false;
  }
  if (enemy === $monster`some fish`) {
    return false;
  }
  if (!auto_isPotentialTalkToSomeFishTarget(loc, enemy)) {
    return false;
  }
  if (
    auto_isWorthYellowRaying(enemy, loc) ||
    auto_isWorthSniffing(enemy, loc)
  ) {
    // Already a good target, no need to replace it.
    return false;
  }

  return true;
}

function auto_baseballIsLoadBearing(
  assignments: BaseballAssignment[],
): boolean {
  // normalSlots are unchecked padding; only the finisher is an actual target.
  let start = 0;
  for (const assignment of assignments) {
    // We start at slot 1, check if the finisher slot allows 2 slots before it
    if (start + 2 >= assignment.finisherSlot) {
      // We don't have enough slots
      return true;
    }

    // Add the 3 slots, 2 for the prep, 1 for the finisher
    start += 3;
  }

  // Didn't hit true, not load bearing
  return false;
}

function auto_baseballShouldPlay(
  team: Monster[],
  assignments: BaseballAssignment[],
): boolean {
  if (team.length !== 9) {
    return false;
  }

  // Exclude the sniffed monster
  const validAssignments = assignments.filter(
    (a) =>
      !isSniffed(a.finisherMonster, $item`Baseball Diamond`) &&
      a.finisherMonster !== auto_baseballFreefightMonster(),
  );

  // Play it when we have 3 assignments
  if (validAssignments.length === 3) {
    return true;
  }

  // Or 2 assignments and we'd lose an assignment if we don't play a game
  if (
    validAssignments.length === 2 &&
    auto_baseballIsLoadBearing(validAssignments)
  ) {
    return true;
  }

  return false;
}

export function auto_tryPlayBaseball(): boolean {
  const team = auto_baseballRecruits();
  if (team.length !== 9) {
    return false;
  }

  const assignments = auto_baseballBuildAssignments(team);

  if (!auto_baseballShouldPlay(team, assignments)) {
    return false;
  }

  if (!auto_playBaseballGame(assignments)) {
    return false;
  }

  return true;
}

// Soft-delay a level's quest-turn-in while a recruited teammate here hasn't been played yet.
function auto_baseballShouldDelayZone(
  zoneMonsters: [Monster, number][],
): boolean {
  if (auto_baseballInningsRemaining() <= 0) {
    return false;
  }

  const freeFightsMonster = auto_baseballFreefightMonster();

  if (
    zoneMonsters.some(
      ([mon]) =>
        mon === freeFightsMonster || isSniffed(mon, $item`Baseball Diamond`),
    )
  ) {
    return false;
  }

  const team = auto_baseballRecruits();
  if (team.length === 0) {
    return false;
  }

  const assignments = auto_baseballBuildAssignments(team);

  return (
    assignments.some((assignment) =>
      zoneMonsters.some(([mon]) => mon === assignment.finisherMonster),
    ) && isSoftBlockInPlace("baseballDiamond")
  );
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
  return safeGet("swordOfSWordsMonster");
}

export function auto_swordFamiliarWantsMonsterDrops(
  sMonster: Monster,
  chanceToEncounterMonster: number = 0, // The chance we have of encountering the monster, between 0 to 100, 100 is eg, summons or perildot
): boolean {
  // Does not determine if we want to be using the familiar right now.
  if (sMonster === $monster.none || sMonster.boss || !sMonster.copyable) {
    return false;
  }

  const currentlyTracking = auto_sword_of_swords_tracking() === sMonster;
  // Amount of days left in this run, always at least 1
  const daysLeftInRun = Math.max(
    get("auto_runDayCount", 0) + (myDaycount() - 1),
    1,
  );

  // Free kills
  if (
    sMonster === $monster`shadow slab` &&
    auto_is_valid($item`shadow brick`)
  ) {
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
    $monsters`smut orc pipelayer, smut orc jacker`.includes(sMonster) &&
    lumberCount() < bridgeGoal()
  ) {
    return true;
  } else if (
    $monsters`smut orc screwer, smut orc nailer`.includes(sMonster) &&
    fastenerCount() < bridgeGoal()
  ) {
    return true;
  }

  // Crypt
  if (
    $monsters`skeleton astronaut, spiny skelelton, toothy sklelton`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`evil eye`) &&
    get("cyrptNookEvilness") - itemAmount($item`evil eye`) * 3 >
      13 + (!currentlyTracking ? 3 : 0) &&
    !in_koe()
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
    (1 + itemAmount($item`A-Boo clue`)) * 30 < get("booPeakProgress") - 2 // We don't value this if we'd get the same outcome with a normal fight
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
    // Opening it will get us to progress of 1, then we subtract 5 from that
    6 -
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
  return auto_swordFamiliarWantsMonsterDrops(
    auto_sword_of_swords_tracking(),
    100,
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
    auto_sword_of_swords_kills_left() <= 10 ||
    auto_sword_of_swords_switches_left() <= 0
  ) {
    return false;
  }
  if (auto_sword_of_swords_tracking() === enemy) {
    return false; // already tracking it
  }
  return auto_swordFamiliarWantsMonsterDrops(enemy, chance);
}

export function auto_preferSwordFamiliar(place: Location) {
  if (!auto_have_sword_familiar()) return;
  set("_auto_preferSwordFam", auto_wantSwordFamiliar(place));
}

export function auto_wantSwordFamiliar(place: Location): boolean {
  if (!auto_have_sword_familiar() || auto_sword_of_swords_kills_left() <= 0) {
    return false;
  }
  // If no drops here
  if (
    auto_location_monsters(place).every(
      ([mon, rate]) => !mon.copyable || mon.boss || rate <= 0,
    )
  ) {
    return false;
  }
  // If we plan to refracted gaze at this location
  if (
    auto_bczRefractedGaze(
      // If we're going to peridot
      haveEquipped($item`Peridot of Peril`) && !haveUsedPeridot(place),
    )
  ) {
    return false;
  }
  // Traces/afterimage bandit chains force the same rematch either way, and fantasy bandit's own drop is conditional (never overwritten), so it's free
  if (auto_canTracesBandit() && auto_desires_sword_familiar_drops()) {
    return true;
  }
  // Don't bring the sword out if we're about to hit a wanderer
  if (
    auto_sword_of_swords_tracking() !== $monster.none &&
    ([Wanderer.Digitize, Wanderer.Enamorang, Wanderer.Romantic].some((w) =>
      isWandererNow(w),
    ) ||
      (auto_haveKramcoSausageOMatic() && getKramcoWandererChance() >= 0.9) ||
      (auto_have_familiar($familiar`Mini-Hipster`) &&
        canChangeToFamiliar($familiar`Mini-Hipster`) &&
        isWandererNow(Wanderer.Familiar)) ||
      (isVoteWandererNow() && possessEquipment($item`"I Voted!" sticker`)))
  ) {
    return false;
  }
  if (
    !zone_delay(place).shouldDelay &&
    place !== $location`The Haunted Kitchen`
  ) {
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
      chance > 0 && auto_swordFamiliarWantsMonsterDrops(mon, chance),
  );
}

function auto_swordFamiliarShouldDelayZone(monsters: Monster[]): boolean {
  // Soft-delay a level's quest-turn-in while we're still farming value.
  return (
    monsters.includes(auto_sword_of_swords_tracking()) &&
    auto_desires_sword_familiar_drops() &&
    isSoftBlockInPlace("swordTracking")
  );
}

// Soft-delay leaving these zones (a level's quest-turn-in, typically) while the Sword of S Words or Baseball Diamond is still mid-farm on a monster that only appears here.
export function auto_copierShouldDelayZone(locs: Location[]): boolean {
  if (isAboutToPowerlevel()) return false;
  const zoneMonsters = locs.flatMap(auto_zoneCopyableMonsters);
  return (
    auto_swordFamiliarShouldDelayZone(zoneMonsters.map(([mon]) => mon)) ||
    auto_baseballShouldDelayZone(zoneMonsters)
  );
}

type SummonSwordTarget = {
  monsters: Monster[];
  item: Item;
  predicate?: () => boolean;
};
// Monsters worth spending a spare summon on to bootstrap the sword's first target
const SWORD_SUMMONABLE_TARGETS: SummonSwordTarget[] = [
  {
    monsters: $monsters`shadow slab`,
    item: $item`shadow brick`,
    // No predicate, we can't ensure we can visit
    // TODO In the future, some 'can we defeat this'
    predicate: () => myLevel() >= 5,
  },

  {
    monsters: $monsters`smut orc pipelayer`,
    item: $item`morningwood plank`,
    // Trainset already covers it, otherwise if we wouldn't be able to adventure there anyways
    predicate: () =>
      !auto_haveTrainSet() && myLevel() < 9 && lumberCount() + 3 < bridgeGoal(),
  },
  {
    monsters: $monsters`smut orc screwer`,
    item: $item`morningwood plank`,
    // Trainset already covers it, otherwise if we wouldn't be able to adventure there anyways
    predicate: () =>
      !auto_haveTrainSet() &&
      myLevel() < 9 &&
      fastenerCount() + 3 < bridgeGoal(),
  },

  {
    monsters: $monsters`toothy sklelton, spiny skelelton`,
    item: $item`evil eye`,
    // If we wouldn't be able to adventure there, and we haven't already decreased the evil somehow
    predicate: () => myLevel() < 7 && get("cyrptNookEvilness") === 50,
  },
];

function auto_summonIsGoodSwordTarget(target: SummonSwordTarget): boolean {
  if (!auto_is_valid(target.item)) return false;

  if (target.predicate !== undefined && !target.predicate()) return false;

  const desiredHits = target.monsters.filter(
    (monster) =>
      auto_swordFamiliarWantsMonsterDrops(monster, 100) &&
      canSummonMonster(monster),
  );

  if (desiredHits.length === 0) return false;

  for (const loc of Location.all()) {
    if (!canAdventure(loc)) continue;

    const monsters = auto_location_monsters(loc);

    const totalChance = monsters
      .filter(([m, chance]) => desiredHits.includes(m) && chance > 0)
      .map(([, chance]) => chance)
      .reduce((l, r) => l + r, 0);

    // If the total chance ends up being undesirable
    if (totalChance <= 65) continue;

    // If we don't want a poor chance
    if (
      !desiredHits.some(
        (m) => !auto_swordFamiliarWantsMonsterDrops(m, totalChance),
      )
    ) {
      continue;
    }

    return false;
  }

  return true;
}

export function auto_swordIsWillingToSwitchTargets(): boolean {
  if (
    !auto_have_sword_familiar() ||
    auto_desires_sword_familiar_drops() ||
    auto_sword_of_swords_switches_left() <= 0 ||
    auto_sword_of_swords_kills_left() <= 10
  ) {
    return false;
  }

  return true;
}

export function auto_summonSwordTarget(): boolean {
  if (in_quantumTerrarium() || !auto_swordIsWillingToSwitchTargets()) {
    return false;
  }

  // If we haven't visited the council yet
  if (get("lastCouncilVisit") < Math.min(myLevel(), 13, 3)) {
    return false;
  }

  const target = SWORD_SUMMONABLE_TARGETS.find((target) =>
    auto_summonIsGoodSwordTarget(target),
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

  const targetMonster: Monster = target.monsters.find((m) =>
    auto_swordFamiliarWantsMonsterDrops(m, 100),
  )!;

  return summonMonster(targetMonster);
}

export function auto_interestingCoinsSpendable(): number {
  let pref = get("auto_interestingCoins");
  if (!/^-?\d+$/.test(pref)) {
    pref = "1";
  }

  const match = pref.match(/^(-?)(\d+)$/)!;

  const relative = match !== null && match[1] === "-";
  const amount = parseInt(match[2]);
  const coins = itemAmount($item`Interesting Coin`);

  // We can spend only so many coins a day
  if (relative) {
    const spentToday = get("_auto_interestingCoinsSpent", 0);
    // We can spend this many more coins today
    let canSpendToday = amount - spentToday;
    // Don't spend more than we have
    canSpendToday = Math.min(coins, canSpendToday);
    // Don't go below 0
    return Math.max(0, canSpendToday);
  }

  // We can spend as many coins as we have, except for this amount
  return Math.max(0, coins - amount);
}

export function auto_acquireInterestingItem(
  item: Item,
  speculating: boolean = false,
): boolean {
  if (itemAmount(item) > 0) {
    return true;
  }

  const price = sellPrice($coinmaster`interesting`, item);

  if (price > auto_interestingCoinsSpendable()) {
    return false;
  }

  if (speculating) {
    return creatableAmount(item) > 0;
  }

  buy($coinmaster`Interesting Coin`, 1, item);

  if (itemAmount(item) === 0) {
    return false;
  }

  handleTracker({
    what: `Spend your Interesting Coins`,
    detail: `Claimed ${item.toString()}`,
    property: "auto_iotm_claim",
  });

  auto_spendInterestingCoins(price);

  return true;
}

export function auto_spendInterestingCoins(count: number) {
  set(
    "_auto_interestingCoinsSpent",
    get("_auto_interestingCoinsSpent", 0) + count,
  );
}

// Mafia doesn't track remaining Exercise Liquidity charges yet, so we bank them ourselves
// in auto_exerciseLiquidity: incremented here on chew, decremented in
// replaceMonsterCombatString() when the skill is actually cast. Remove once mafia adds
// official tracking.
export function auto_chewLiquidAsset(
  doingBedtime: boolean = false,
  speculative: boolean = false,
): boolean {
  if (
    !auto_is_valid$2($skill`Exercise Liquidity`) ||
    !canChew($item`liquid asset`) ||
    spleen_left() < $item`liquid asset`.spleen ||
    (!doingBedtime && isActuallyEd())
  ) {
    return false;
  }

  if (!auto_acquireInterestingItem($item`liquid asset`, speculative)) {
    return false;
  }

  if (speculative) return true;

  if (!autoChew(1, $item`liquid asset`)) {
    return false;
  }

  set("auto_exerciseLiquidity", get("auto_exerciseLiquidity", 0) + 1);
  return true;
}

export function wantToThrowCoinAtEm(loc: Location, enemy: Monster): boolean {
  // returns true if we want to throw interesting coin, based off wantToThrowGravel
  // eslint-disable-next-line local/verify-properties
  if (get("_interestingCoinHeads", false)) {
    return false;
  }

  if (isFreeMonster(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  if (auto_interestingCoinsSpendable() <= 0) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}
