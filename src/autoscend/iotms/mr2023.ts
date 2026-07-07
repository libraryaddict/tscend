import {
  abort,
  availableAmount,
  buy,
  canAdventure,
  canInteract,
  cliExecute,
  containsText,
  creatableAmount,
  create,
  Effect,
  equippedItem,
  expectedDamage,
  Familiar,
  floor,
  fullnessLimit,
  getCampground,
  getDwelling,
  getLocationMonsters,
  getProperty,
  haveCampground,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  haveSkill,
  inHardcore,
  Item,
  itemAmount,
  itemFact,
  Location,
  max,
  monkeyPaw,
  Monster,
  myAdventures,
  myDaycount,
  myFamiliar,
  myFullness,
  myLevel,
  myLocation,
  myMaxhp,
  myMeat,
  myPokeFam,
  myPrimestat,
  numericModifier,
  Phylum,
  setProperty,
  Skill,
  toBoolean,
  toFamiliar,
  toInt,
  toLowerCase,
  toMonster,
  turnsPlayed,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  weaponHands,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $monsters,
  $phyla,
  $skill,
  $slot,
  $stat,
} from "libram";

import { autoAdv$2, autoAdvBypass } from "../auto_adventure";
import { fullness_left, inebriety_left } from "../auto_consume";
import {
  addBonusToMaximize,
  equipRollover,
  is_watch,
  possessEquipment,
  possessOutfit$1,
  simMaximizeWith$1,
  simValue,
} from "../auto_equipment";
import {
  auto_have_familiar,
  auto_needsGoodFamiliarEquipment,
  canChangeToFamiliar,
  findNonRockFamiliarInTerrarium,
  findRockFamiliarInTerrarium,
  is100FamRun,
  isAttackFamiliar,
  pathHasFamiliar,
} from "../auto_familiar";
import { disregardInstantKarma } from "../auto_powerlevel";
import {
  auto_potentialMaxFreeRests,
  doFreeRest,
  haveAnyIotmAlternativeRestSiteAvailable,
  haveFreeRestAvailable,
  uneffect,
} from "../auto_restore";
import { solveDelayZone$1 } from "../auto_routing";
import {
  auto_can_equip,
  auto_canForceNextNoncombat,
  auto_forceNextNoncombat$1,
  auto_get_campground,
  auto_have_skill,
  auto_haveQueuedForcedNonCombat,
  auto_ignoreExperience,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$4,
  auto_log_debug$1,
  auto_log_info$1,
  auto_queueIgnore,
  auto_turbo,
  auto_wantToFreeKillWithNoDrops,
  backupSetting,
  can_read_skillbook,
  handleTracker$1,
  handleTracker$2,
  haveCampgroundMaid,
  isFreeMonster$1,
  isGuildClass,
  meatReserve,
  wrap_item,
} from "../auto_util";
import { canUse$2 } from "../combat/auto_combat_util";
import { in_avantGuard } from "../paths/avant_guard";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_small } from "../paths/small";
import { in_wereprof, is_werewolf } from "../paths/wereprofessor";
import { cyrptEvilBonus$1 } from "../quests/level_07";
import { L10_needUmbrella } from "../quests/level_10";
import { fantasyBanditsFought } from "./mr2018";
import { auto_haveTrainSet } from "./mr2022";
import {
  auto_goingToMouthwashLevel,
  auto_haveSeptEmberCenser,
  auto_haveTearawayPants,
  expected_level_after_mouthwash,
} from "./mr2024";
import { auto_haveMcHugeLargeSkis } from "./mr2025";

// This is meant for items that have a date of 2023

let $_auto_haveRockGarden_rockGarden: Item | undefined;

//Defined in autoscend/iotms/mr2023.ash
function auto_haveRockGarden(): boolean {
  $_auto_haveRockGarden_rockGarden ??= $item`packet of rock seeds`;
  return (
    auto_is_valid($_auto_haveRockGarden_rockGarden) &&
    auto_get_campground().has($_auto_haveRockGarden_rockGarden)
  );
}

export function rockGardenEnd(): void {
  //broke these out so they aren't handled at the start of everyday but ASAP after numberology
  //while we will probably never get these automatically, should handle them anyway
  if (
    itemAmount($item`molehill mountain`) > 0 &&
    !toBoolean(getProperty("_molehillMountainUsed"))
  ) {
    use(1, $item`molehill mountain`);
  }

  if (
    itemAmount($item`strange stalagmite`) > 0 &&
    !toBoolean(getProperty("_strangeStalagmiteUsed"))
  ) {
    use(1, $item`strange stalagmite`);
  }
  return;
}

export function pickRocks(): void {
  //Pick rocks everyday
  //If we manage to get a lodestone, will not use it, because it is a one-a-day and user may want to use it in specific places
  if (!auto_haveRockGarden()) {
    return;
  }
  visitUrl("campground.php?action=rgarden1");
  if (toInt(getProperty("desertExploration")) < 100) {
    visitUrl("campground.php?action=rgarden2");
  }
  visitUrl("campground.php?action=rgarden3");
  return;
}

export function wantToThrowGravel(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Groveling Gravel. Not intended to exhaustivly list all valid targets.
  // simply enough to use the few gravels we get in run.

  if (itemAmount($item`groveling gravel`) === 0) {
    return false;
  }
  if (!auto_is_valid($item`groveling gravel`)) {
    return false;
  }
  if (isFreeMonster$1(enemy, loc)) {
    // don't use gravel against inherently free fights
    return false;
  }
  // prevent overuse after breaking ronin or in casual
  if (canInteract()) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

let $_auto_haveSITCourse_sitCourse: Item | undefined;

function auto_haveSITCourse(): boolean {
  $_auto_haveSITCourse_sitCourse ??= Item.get(
    "S.I.T. Course Completion Certificate",
  );
  return (
    auto_is_valid($_auto_haveSITCourse_sitCourse) &&
    itemAmount($_auto_haveSITCourse_sitCourse) > 0
  );
}

export function auto_SITCourse(): void {
  if (!auto_haveSITCourse()) {
    return;
  }
  //Get cryptobotanist if under level 8 or switch to insectologist if possible
  if (
    (myLevel() < 8 && !haveSkill($skill`Cryptobotanist`)) ||
    (!toBoolean(getProperty("_sitCourseCompleted")) &&
      myLevel() >= 8 &&
      !haveSkill($skill`Insectologist`))
  ) {
    use(1, $item`S.I.T. Course Completion Certificate`);
    //auto_run_choice(1494);
    return;
  }
}

export function auto_havePayPhone(): boolean {
  return (
    auto_is_valid($item`closed-circuit pay phone`) &&
    itemAmount($item`closed-circuit pay phone`) > 0
  );
}

export function auto_allRifts(): Map<Location, boolean> {
  return new Map([
    [$location`Shadow Rift (Desert Beach)`, true],
    [$location`Shadow Rift (Forest Village)`, true],
    [$location`Shadow Rift (Mt. McLargeHuge)`, true],
    [$location`Shadow Rift (Somewhere Over the Beanstalk)`, true],
    [$location`Shadow Rift (Spookyraven Manor Third Floor)`, true],
    [$location`Shadow Rift (The 8-Bit Realm)`, true],
    [$location`Shadow Rift (The Ancient Buried Pyramid)`, true],
    [$location`Shadow Rift (The Castle in the Clouds in the Sky)`, true],
    [$location`Shadow Rift (The Distant Woods)`, true],
    [$location`Shadow Rift (The Hidden City)`, true],
    [$location`Shadow Rift (The Misspelled Cemetary)`, true],
    [$location`Shadow Rift (The Nearby Plains)`, true],
    [$location`Shadow Rift (The Right Side of the Tracks)`, true],
  ]);
}

export function auto_availableBrickRift(): Location {
  if (!auto_havePayPhone()) {
    return Location.none;
  }

  if (in_avantGuard() && !auto_haveQueuedForcedNonCombat()) {
    //if no NC forced, don't adventure in zone
    return Location.none;
  }

  const riftsWithBricks: Location[] = $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary)`;
  const riftsWithWishes: Map<Location, boolean> = auto_riftsWithWishes();
  // First loop checks for bricks and wishes if we have BoFA
  if (auto_haveBofa() && auto_wishFactsLeft() > 0) {
    for (const loc of riftsWithBricks) {
      if (riftsWithWishes.has(loc) && canAdventure(loc)) {
        return loc;
      }
    }
  }
  // Then ignore wishes
  for (const loc of riftsWithBricks) {
    if (canAdventure(loc)) {
      return loc;
    }
  }
  return Location.none;
}

function auto_riftsWithWishes(): Map<Location, boolean> {
  const out: Map<Location, boolean> = new Map();
  for (const loc of auto_allRifts().keys()) {
    for (const m of Monster.get(Object.keys(getLocationMonsters(loc)))) {
      if (itemFact(m) === $item`pocket wish`) {
        out.set(loc, true);
        break;
      }
    }
  }
  return out;
}

export function auto_neededShadowBricks(): number {
  if (!auto_havePayPhone() || in_avantGuard()) {
    return 0;
  }

  const currentBricks: number = itemAmount($item`shadow brick`);
  const bricksUsedToday: number = toInt(getProperty("_shadowBricksUsed"));
  return max(0, 13 - currentBricks - bricksUsedToday);
}

function auto_getPhoneQuest(): boolean {
  if (!auto_havePayPhone()) {
    return false;
  }

  if (getProperty("questRufus") !== "unstarted") {
    // already started quest
    return true;
  }
  // get artifact quest
  // auto_choice_adv handles actually picking it
  use($item`closed-circuit pay phone`);

  return getProperty("questRufus") !== "unstarted";
}

export function auto_doPhoneQuest(): boolean {
  if (!auto_havePayPhone()) {
    return false;
  }
  // only accept and do quest if we can get bricks or force a noncombat
  if (
    auto_availableBrickRift() === Location.none ||
    !auto_canForceNextNoncombat()
  ) {
    return false;
  }
  // already finished phone quest today
  if (
    toBoolean(getProperty("_shadowAffinityToday")) &&
    haveEffect($effect`Shadow Affinity`) === 0 &&
    getProperty("questRufus") === "unstarted"
  ) {
    return false;
  }
  // not high enough level yet. Survive at least 2 hits
  if (myMaxhp() <= expectedDamage($monster`shadow slab`) * 2) {
    return false;
  }
  // in pokefam, we want at least 2 level 5s
  if (in_pokefam()) {
    // mafia can lose track of the team, so visit famteam so we're up to date
    visitUrl("famteam.php");
    const pokelevel1: number = myPokeFam(0).pokeLevel;
    const pokelevel2: number = myPokeFam(1).pokeLevel;
    const pokelevel3: number = myPokeFam(2).pokeLevel;
    let numFives: number = 0;
    if (pokelevel1 === 5) {
      numFives++;
    }
    if (pokelevel2 === 5) {
      numFives++;
    }
    if (pokelevel3 === 5) {
      numFives++;
    }
    if (numFives < 2) {
      return false;
    }
  }
  // don't start quest if fights will already be free... unless we already have shadow affinity
  if (
    isFreeMonster$1($monster`shadow slab`, auto_availableBrickRift()) &&
    haveEffect($effect`Shadow Affinity`) === 0
  ) {
    return false;
  }
  // get quest
  if (!auto_getPhoneQuest()) {
    abort("Failed to get Rufus quest from cursed phone.");
  }
  // finish quest
  if (getProperty("questRufus") === "step1") {
    use($item`closed-circuit pay phone`);
    if (getProperty("questRufus") !== "unstarted") {
      abort("Failed to finish Rufus quest from cursed phone.");
    }
    return true;
  }
  //Force a non combat instead of adventuring there to save turns, especially in AG
  if (auto_haveQueuedForcedNonCombat()) {
    return autoAdv$2(auto_availableBrickRift());
  }

  if (auto_canForceNextNoncombat() && in_avantGuard()) {
    //in avant guard, want to avoid adventuring here unless you can force an NC
    return auto_forceNextNoncombat$1(auto_availableBrickRift());
  }

  backupSetting("shadowLabyrinthGoal", "browser"); // use mafia's automation handling for the Shadow Rift NC.
  return autoAdv$2(auto_availableBrickRift());
}

export function auto_isShadowRiftMonster(m: Monster): boolean {
  const reg: Monster[] = $monsters`shadow bat, shadow cow, shadow devil, shadow guy, shadow hexagon, shadow orb, shadow prism, shadow slab, shadow snake, shadow spider, shadow stalk, shadow tree`;
  const boss: Monster[] = $monsters`shadow cauldron, shadow matrix, shadow orrery, shadow scythe, shadow spire, shadow tongue`;
  return reg.includes(m) || boss.includes(m);
}

let $_auto_haveMonkeyPaw_paw: Item | undefined;

export function auto_haveMonkeyPaw(): boolean {
  $_auto_haveMonkeyPaw_paw ??= $item`cursed monkey's paw`;
  return (
    auto_is_valid($_auto_haveMonkeyPaw_paw) &&
    (itemAmount($_auto_haveMonkeyPaw_paw) > 0 ||
      haveEquipped($_auto_haveMonkeyPaw_paw))
  );
}

export function auto_monkeyPawWishesLeft(): number {
  if (auto_haveMonkeyPaw()) {
    return 5 - toInt(getProperty("_monkeyPawWishesUsed"));
  }
  return 0;
}

export function auto_makeMonkeyPawWish(wish: Effect): boolean {
  if (!auto_haveMonkeyPaw()) {
    auto_log_info$1(
      `Requested monkey paw wish without paw available, skipping ${wish.toString()}`,
    );
    return false;
  }
  if (auto_monkeyPawWishesLeft() < 1) {
    auto_log_info$1(`Out of monkey paw wishes, skipping ${wish.toString()}`);
    return false;
  }
  const success: boolean = monkeyPaw(wish);
  if (success) {
    handleTracker$2(
      $item`cursed monkey's paw`.toString(),
      myLocation().toString(),
      wish.toString(),
      "auto_wishes",
    );
  }
  return success;
}

export function auto_makeMonkeyPawWish$1(wish: Item): boolean {
  if (!auto_haveMonkeyPaw()) {
    auto_log_info$1(
      `Requested monkey paw wish without paw available, skipping ${wish.toString()}`,
    );
    return false;
  }
  if (auto_monkeyPawWishesLeft() < 1) {
    auto_log_info$1(`Out of monkey paw wishes, skipping ${wish.toString()}`);
    return false;
  }
  const success: boolean = monkeyPaw(wish);
  if (success) {
    handleTracker$1(
      $item`cursed monkey's paw`.toString(),
      wish.toString(),
      "auto_wishes",
    );
  }
  return success;
}

let $_auto_haveCincho_cincho: Item | undefined;

export function auto_haveCincho(): boolean {
  $_auto_haveCincho_cincho ??= wrap_item($item`Cincho de Mayo`);
  if (
    auto_is_valid($_auto_haveCincho_cincho) &&
    (itemAmount($_auto_haveCincho_cincho) > 0 ||
      haveEquipped($_auto_haveCincho_cincho))
  ) {
    return true;
  }

  return false;
}

function auto_currentCinch(): number {
  if (!auto_haveCincho()) {
    return 0;
  }
  return 100 - toInt(getProperty("_cinchUsed"));
}

function auto_cinchFromNextRest(): number {
  let cinchoRestsAlready: number = toInt(getProperty("_cinchoRests"));
  // calculating for how much cinch NEXT rest will give
  cinchoRestsAlready++;
  return auto_cinchFromRestN(cinchoRestsAlready);
}

function auto_cinchFromRestN(n: number): number {
  let cinchGainedFromRest: number = 5;
  if (n <= 5) {
    cinchGainedFromRest = 30;
  } else if (n === 6) {
    cinchGainedFromRest = 25;
  } else if (n === 7) {
    cinchGainedFromRest = 20;
  } else if (n === 8) {
    cinchGainedFromRest = 15;
  } else if (n === 9) {
    cinchGainedFromRest = 10;
  }

  return cinchGainedFromRest;
}
function auto_cinchAfterNextRest(): number {
  return auto_currentCinch() + auto_cinchFromNextRest();
}

export function auto_nextRestOverCinch(): boolean {
  return auto_cinchAfterNextRest() > 100;
}

export function auto_getCinch(goal: number): boolean {
  if (is_werewolf()) {
    return false; //can't rest as werewolf
  }
  if (auto_currentCinch() >= goal) {
    return true;
  }
  if (!haveFreeRestAvailable()) {
    // don't have enough cinch and don't have any free rests left
    return false;
  }
  if (
    !haveAnyIotmAlternativeRestSiteAvailable() &&
    getDwelling() === $item`big rock` &&
    !in_small()
  ) {
    // don't have anywhere to rest
    // get dwelling returns big rock when no place to rest in campsite
    // exception for Small path as you can't use housing in-run so you will always have a big rock.
    return false;
  }
  // use free rests until have enough cinch or out of rests
  while (
    auto_currentCinch() < goal &&
    haveFreeRestAvailable() &&
    !in_wereprof()
  ) {
    if (!doFreeRest()) {
      auto_log_debug$1(
        "Failed to rest to charge cincho. Will try again later.",
      );
      return false;
    }
  }
  // go for cinch as a professor. commented out for now because mafia tracking of free rests as a prof MAY not be working as expected
  /*while(auto_currentCinch() < goal && haveFreeRestAvailable() && is_professor())
	{
		visit_url("place.php?whichplace=wereprof_cottage&action=wereprof_sleep"); //just visit the cottage to sleep as professor
	}*/
  // see if we got enough cinch after using free rests
  if (auto_currentCinch() >= goal) {
    return true;
  }
  return false;
}

export function shouldCinchoConfetti(): boolean {
  // Cincho: Confetti Extravaganza doubles stat gains of current combat
  // costs 5 cinch and flips out the monster
  // cast this skill when we can't cast any more fiesta exists
  // can't cast it if we don't have it
  if (!canUse$2($skill`Cincho: Confetti Extravaganza`)) {
    return false;
  }
  // don't over level
  if (!disregardInstantKarma()) {
    return false;
  }
  // save cinch for fiest exit
  if (auto_currentCinch() > 60) {
    return false;
  }
  // use all free rests before using confetti. May get enough cinch to fiesta exit
  if (
    haveFreeRestAvailable() ||
    numericModifier("Free Rests") < auto_potentialMaxFreeRests()
  ) {
    return false;
  }
  // canSurvive checked in calling location. This function is only available to combat files
  return true;
}

function auto_potentialMaxCinchLeft(): number {
  const max_rests: number = auto_potentialMaxFreeRests();
  const curr_free_rests_used: number = toInt(getProperty("_cinchoRests"));
  let cinch: number = auto_currentCinch();
  for (
    let irest: number = curr_free_rests_used + 1;
    irest < max_rests;
    irest++
  ) {
    cinch = cinch + auto_cinchFromRestN(irest);
  }
  return cinch;
}

export function auto_cinchForcesLeft(): number {
  return floor(auto_potentialMaxCinchLeft() / 60);
}

let $_auto_have2002Catalog_catalog: Item | undefined;

function auto_have2002Catalog(): boolean {
  $_auto_have2002Catalog_catalog ??= wrap_item($item`2002 Mr. Store Catalog`);
  if (
    auto_is_valid($_auto_have2002Catalog_catalog) &&
    (itemAmount($_auto_have2002Catalog_catalog) > 0 ||
      haveEquipped($_auto_have2002Catalog_catalog))
  ) {
    return true;
  }
  return false;
}

function remainingCatalogCredits(): number {
  if (!auto_have2002Catalog()) {
    return 0;
  }
  if (!toBoolean(getProperty("_2002MrStoreCreditsCollected"))) {
    // using item collects credits
    if (in_lol()) {
      //autoscend doesn't always trigger in LoL, switching to specify Replica
      use($item`Replica 2002 Mr. Store Catalog`);
    } else {
      use($item`2002 Mr. Store Catalog`);
    }
  }
  return toInt(getProperty("availableMrStore2002Credits"));
}

export function auto_haveIdolMicrophone(): boolean {
  if (itemAmount($item`Loathing Idol Microphone`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (75% charged)`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (50% charged)`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (25% charged)`) > 0) {
    return true;
  }
  return false;
}

export function auto_buyFrom2002MrStore(): void {
  if (remainingCatalogCredits() === 0) {
    return;
  }
  auto_log_debug$1(
    `Have ${remainingCatalogCredits()} credit(s) to buy from Mr. Store 2002. Let's spend them!`,
  );
  // manual of secret door detection. skill: Secret door awareness
  let itemConsidering: Item = $item`Manual of Secret Door Detection`;
  if (
    can_read_skillbook(itemConsidering) &&
    remainingCatalogCredits() > 0 &&
    !auto_have_skill($skill`Secret Door Awareness`) &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    use(itemConsidering);
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
  //Pro skateboard to dupe tomb rat king drops
  itemConsidering = $item`pro skateboard`;
  if (
    remainingCatalogCredits() > 0 &&
    auto_is_valid(itemConsidering) &&
    !possessEquipment(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
  //FLUDA is +25% item, and a pickpocket
  itemConsidering = $item`Flash Liquidizer Ultra Dousing Accessory`;
  if (
    remainingCatalogCredits() > 0 &&
    auto_is_valid(itemConsidering) &&
    !possessEquipment(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
  // meat butler on day 1 of run
  itemConsidering = $item`Meat Butler`;
  if (
    haveCampground() &&
    remainingCatalogCredits() > 0 &&
    myDaycount() === 1 &&
    !haveCampgroundMaid() &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    use(itemConsidering);
    visitUrl("campground.php"); // get butler meat
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
  // giant black monolith. Mostly useful at low level for stats
  if (
    haveCampground() &&
    (myLevel() < 13 || toBoolean(getProperty("auto_disregardInstantKarma"))) &&
    !(auto_haveSeptEmberCenser() || auto_haveTrainSet()) &&
    !auto_ignoreExperience()
  ) {
    itemConsidering = $item`Giant black monolith`;
    if (
      remainingCatalogCredits() > 0 &&
      !auto_get_campground().has(itemConsidering) &&
      auto_is_valid(itemConsidering)
    ) {
      buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
      use(itemConsidering);
      handleTracker$1(
        "Mr. Store 2002",
        `Claimed ${itemConsidering}`,
        "auto_iotm_claim",
      );
      visitUrl("campground.php?action=monolith");
    }
  }
  // crimbo cookie. Should we expand to buy more or use in more paths beyond HC LoL?
  itemConsidering = $item`Crimbo cookie sheet`;
  if (
    remainingCatalogCredits() > 0 &&
    inHardcore() &&
    myDaycount() === 1 &&
    in_lol()
  ) {
    buy(
      $coinmaster`Mr. Store 2002`,
      remainingCatalogCredits(),
      itemConsidering,
    );
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
  // loathing idol microphone. Use remaining credits
  itemConsidering = $item`Loathing Idol Microphone`;
  if (remainingCatalogCredits() > 0 && auto_is_valid(itemConsidering)) {
    buy(
      $coinmaster`Mr. Store 2002`,
      remainingCatalogCredits(),
      itemConsidering,
    );
    handleTracker$1(
      "Mr. Store 2002",
      `Claimed ${itemConsidering}`,
      "auto_iotm_claim",
    );
  }
}

export function auto_useBlackMonolith(): void {
  // done if already used it today
  if (toBoolean(getProperty("_blackMonolithUsed"))) {
    return;
  }
  // done if we don't want stats
  if (!disregardInstantKarma()) {
    return;
  }
  // done if we don't have monolith
  if (!auto_get_campground().has($item`Giant black monolith`)) {
    return;
  }
  // use monolith
  visitUrl("campground.php?action=monolith");
}

export function auto_dousesRemaining(): number {
  const fluda: Item = $item`Flash Liquidizer Ultra Dousing Accessory`;
  if (availableAmount(fluda) < 1 || !auto_is_valid(fluda)) {
    return 0;
  }
  return 3 - toInt(getProperty("_douseFoeUses"));
}

let $_auto_haveAugustScepter_scepter: Item | undefined;

export function auto_haveAugustScepter(): boolean {
  $_auto_haveAugustScepter_scepter ??= wrap_item($item`august scepter`);
  if (
    auto_is_valid($_auto_haveAugustScepter_scepter) &&
    (itemAmount($_auto_haveAugustScepter_scepter) > 0 ||
      haveEquipped($_auto_haveAugustScepter_scepter))
  ) {
    return true;
  }
  return false;
}

export function auto_scepterSkills(): void {
  if (!auto_haveAugustScepter()) {
    return;
  }

  if (
    canUse$2($skill`Aug. 24th: Waffle Day!`) &&
    !toBoolean(getProperty("_aug24Cast"))
  ) {
    useSkill($skill`Aug. 24th: Waffle Day!`); //get some waffles to hopefully change some bad monsters to better ones
  }
  if (
    canUse$2($skill`Aug. 28th: Race Your Mouse Day!`) &&
    !toBoolean(getProperty("_aug28Cast")) &&
    pathHasFamiliar()
  ) {
    const hundred_fam: Familiar = toFamiliar(getProperty("auto_100familiar"));
    if (
      ((in_avantGuard() && inHardcore()) ||
        (hundred_fam !== Familiar.none &&
          (isAttackFamiliar(hundred_fam) || hundred_fam.block))) &&
      haveFamiliar(findRockFamiliarInTerrarium())
    ) {
      useFamiliar(findRockFamiliarInTerrarium());
      useSkill($skill`Aug. 28th: Race Your Mouse Day!`); //Fam equipment to lower weight of attack familiar or Burly bodyguard (Avant Guard) for Gremlins
    } else if (auto_needsGoodFamiliarEquipment() || in_small()) {
      if (!is100FamRun()) {
        useFamiliar(findNonRockFamiliarInTerrarium()); //equip non-rock fam to ensure we get tiny gold medal
      } else {
        useFamiliar(hundred_fam); // assuming non-rock familiar
      }
      useSkill($skill`Aug. 28th: Race Your Mouse Day!`); //Fam equipment
    }
  }
  //see how much mana cost reduction we can get (up to 3mp)
  simMaximizeWith$1("-1000mana cost");

  const manaCostMaximize: number = toInt(simValue("Mana Cost"));
  if (!auto_turbo()) {
    if (
      manaCostMaximize < 3 &&
      canUse$2($skill`Aug. 30th: Beach Day!`) &&
      !toBoolean(getProperty("_aug30Cast")) &&
      toInt(getProperty("_augSkillsCast")) < 5
    ) {
      useSkill($skill`Aug. 30th: Beach Day!`); //For -MP (and Rollover Adventures)
    }
  }
}

export function auto_scepterRollover(): void {
  //We don't want the baywatch if our accessory slots are already filled with > 7 adventure items or we if one of the slots is the counterclockwise watch
  const noWatch: boolean =
    (numericModifier(equippedItem($slot`acc1`), "Adventures") >= 7 &&
      numericModifier(equippedItem($slot`acc2`), "Adventures") >= 7 &&
      numericModifier(equippedItem($slot`acc3`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc1`)) &&
      numericModifier(equippedItem($slot`acc1`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc2`)) &&
      numericModifier(equippedItem($slot`acc2`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc3`)) &&
      numericModifier(equippedItem($slot`acc3`), "Adventures") >= 7);
  if (
    !noWatch &&
    canUse$2($skill`Aug. 30th: Beach Day!`) &&
    !toBoolean(getProperty("_aug30Cast")) &&
    toInt(getProperty("_augSkillsCast")) < 5
  ) {
    useSkill($skill`Aug. 30th: Beach Day!`); //For Rollover adventures (and -MP)
    equipRollover(true);
  }
  //Get mainstats
  if (toInt(getProperty("_augSkillsCast")) < 5 && myLevel() < 13) {
    if (
      canUse$2($skill`Aug. 12th: Elephant Day!`) &&
      !toBoolean(getProperty("_aug12Cast")) &&
      myPrimestat() === $stat`Muscle`
    ) {
      useSkill($skill`Aug. 12th: Elephant Day!`); //get muscle stubstats
    }
    if (
      canUse$2($skill`Aug. 11th: Presidential Joke Day!`) &&
      !toBoolean(getProperty("_aug11Cast")) &&
      myPrimestat() === $stat`Mysticality`
    ) {
      useSkill($skill`Aug. 11th: Presidential Joke Day!`); //get mysticality stubstats
    }
    if (
      canUse$2($skill`Aug. 23rd: Ride the Wind Day!`) &&
      !toBoolean(getProperty("_aug23Cast")) &&
      myPrimestat() === $stat`Moxie`
    ) {
      useSkill($skill`Aug. 23rd: Ride the Wind Day!`); //get moxies stubstats
    }
  }
  if (
    canUse$2(Skill.get("Aug. 13th: Left/Off Hander's Day!")) &&
    !toBoolean(getProperty("_aug13Cast")) &&
    toInt(getProperty("_augSkillsCast")) < 5 &&
    numericModifier(equippedItem($slot`off-hand`), "Adventures") > 0 &&
    weaponHands(equippedItem($slot`off-hand`)) === 0
  ) {
    useSkill(Skill.get("Aug. 13th: Left/Off Hander's Day!")); //bump up the off-hand
  }
  if (
    canUse$2($skill`Aug. 27th: Just Because Day!`) &&
    !toBoolean(getProperty("_aug27Cast")) &&
    toInt(getProperty("_augSkillsCast")) < 5
  ) {
    useSkill($skill`Aug. 27th: Just Because Day!`); //3 random buffs
  }
}

export function auto_lostStomach$1(force: boolean): void {
  if (!auto_haveAugustScepter() || in_small() || fullnessLimit() === 0) {
    return;
  }
  //Cast Roller Coaster Day if forced to and fullness is greater than 0 and it's available to cast
  if (
    force &&
    myFullness() > 0 &&
    toInt(getProperty("_augSkillsCast")) < 5 &&
    !toBoolean(getProperty("_aug16Cast"))
  ) {
    useSkill($skill`Aug. 16th: Roller Coaster Day!`);
  }
  //Otherwise leave Roller Coaster Day until near the end of the day and it's available to cast
  if (
    fullness_left() === 0 &&
    inebriety_left() === 0 &&
    myAdventures() < 10 &&
    toInt(getProperty("_augSkillsCast")) < 5 &&
    !toBoolean(getProperty("_aug16Cast")) &&
    !force
  ) {
    useSkill($skill`Aug. 16th: Roller Coaster Day!`);
  }
}

export function auto_haveBofa(): boolean {
  return (
    auto_is_valid$2($skill`Just the Facts`) && haveSkill($skill`Just the Facts`)
  );
}

export function auto_canHabitat(): boolean {
  if (!auto_haveBofa()) {
    return false;
  }
  if (toInt(getProperty("_monsterHabitatsRecalled")) >= 3) {
    // no charges left
    return false;
  }
  if (toInt(getProperty("_monsterHabitatsFightsLeft")) > 0) {
    // already habitating something but we may not need all 5 of them in certain situations
    switch (toMonster(getProperty("_monsterHabitatsMonster"))) {
      case $monster`fantasy bandit`:
        return fantasyBanditsFought() < 5;
      case $monster`modern zmobie`:
        return toInt(getProperty("cyrptAlcoveEvilness")) > 13;
      case $monster`dirty old lihc`:
        return toInt(getProperty("cyrptNicheEvilness")) > 13;
      default:
        return false;
    }
  }
  return true;
}

export function auto_habitatTarget(target: Monster): boolean {
  if (!auto_canHabitat()) {
    return false;
  }
  if (
    toMonster(getProperty("_monsterHabitatsMonster")) === target &&
    toInt(getProperty("_monsterHabitatsFightsLeft")) > 0
  ) {
    // already habitating this monster
    return false;
  }
  {
    // only worth it if we need all 5.
    // only worth it if we need 30 or more evilness reduced.
    // only worth it if we need 18 or more evilness reduced.
    // avant guard makes free fights cost a turn. Use DOL in place of tentacle
    // only worth it if we need 3+ barrels

    switch (target) {
      case $monster`fantasy bandit`:
        return fantasyBanditsFought() === 0;
      case $monster`modern zmobie`:
        return (
          toInt(getProperty("cyrptAlcoveEvilness")) -
            5 * (5 + cyrptEvilBonus$1()) >
          13
        );
      case $monster`dirty old lihc`:
        return (
          in_avantGuard() &&
          toInt(getProperty("cyrptNicheEvilness")) -
            5 * (3 + cyrptEvilBonus$1()) >
            13
        );
      case $monster`lobsterfrogman`: {
        const sonofa_complete: boolean =
          getProperty("sidequestLighthouseCompleted") === "hippy" ||
          getProperty("sidequestLighthouseCompleted") === "fratboy";
        return !sonofa_complete && itemAmount($item`barrel of gunpowder`) < 4;
      }
      case $monster`Eldritch Tentacle`:
        // Max tentacles fought being free is 11, so don't habitat if we've fought more than 6
        // This variable increments at the end of combat, so we need 5 here.
        if (toInt(getProperty("_eldritchTentaclesFoughtToday")) > 5) {
          return false;
        }

        // don't habitat free fights in avant guard
        return (
          !in_avantGuard() &&
          (toMonster(getProperty("auto_habitatMonster")) === target ||
            (toMonster(getProperty("_monsterHabitatsMonster")) === target &&
              toInt(getProperty("_monsterHabitatsFightsLeft")) === 0))
        );
      default:
        return toMonster(getProperty("auto_habitatMonster")) === target;
    }
  }
  return false;
}

export function auto_habitatFightsLeft(): number {
  return toInt(getProperty("_monsterHabitatsFightsLeft"));
}

export function auto_habitatMonster(): Monster {
  if (toInt(getProperty("_monsterHabitatsFightsLeft")) > 0) {
    return toMonster(getProperty("_monsterHabitatsMonster"));
  }
  return Monster.none;
}

export function auto_canCircadianRhythm(): boolean {
  if (!auto_haveBofa()) {
    return false;
  }
  if (toBoolean(getProperty("_circadianRhythmsRecalled"))) {
    return false;
  }
  return true;
}

export function auto_circadianRhythmTarget(target: Monster): boolean {
  if (!auto_canCircadianRhythm()) {
    return false;
  }
  if (
    !$monsters`shadow bat, shadow cow, shadow devil, shadow guy, shadow hexagon, shadow orb, shadow prism, shadow slab, shadow snake, shadow spider, shadow stalk, shadow tree`.includes(
      target,
    )
  ) {
    return false;
  }
  return true;
}

export function auto_circadianRhythmTarget$1(target: Phylum): boolean {
  if (!auto_canCircadianRhythm()) {
    return false;
  }
  if (!(
    $phyla`orc, hippy`.includes(target) &&
    $locations`The Battlefield (Hippy Uniform), The Battlefield (Frat Uniform)`.includes(
      myLocation(),
    )
  )) {
    return false;
  }
  return true;
}

function auto_wishFactsLeft(): number {
  if (!auto_haveBofa()) {
    return 0;
  }
  return 3 - toInt(getProperty("_bookOfFactsWishes"));
}

function auto_haveJillOfAllTrades(): boolean {
  if (auto_have_familiar($familiar`Jill-of-All-Trades`)) {
    return true;
  }
  return false;
}

function getParsedCandleMode(): string {
  // returns candle mode which matches our familiar categories
  switch (getProperty("ledCandleMode")) {
    case "disco":
      return "item";
    case "ultraviolet":
      return "meat";
    case "reading":
      return "stat";
    case "red":
      return "boss";
    default:
      return "unknown";
  }
}

export function auto_handleJillOfAllTrades(): void {
  if (!auto_haveJillOfAllTrades() || itemAmount($item`LED candle`) === 0) {
    return;
  }
  // only bother to configure candle if Jill is equiped
  if (myFamiliar() !== $familiar`Jill-of-All-Trades`) {
    return;
  }

  const currentMode: string = getParsedCandleMode();
  // want to configure jill to have bonus of whatever fam type we last looked up
  const desiredCandleMode: string = getProperty("auto_lastFamiliarLookupType");

  auto_log_debug$1(
    `Jill current mode: ${currentMode} and desired is ${desiredCandleMode}`,
  );
  if (currentMode === desiredCandleMode) {
    return;
  }

  switch (desiredCandleMode) {
    case "item":
    case "regen":
    case "init":
    case "gremlin":
    case "gremlins":
    case "yellowray":
      cliExecute("jillcandle item");
      break;
    case "meat":
      cliExecute("jillcandle meat");
      break;
    case "stat":
    case "drop":
      cliExecute("jillcandle stat");
      break;
    case "boss":
      cliExecute("jillcandle attack");
      break;
    default:
      abort("tried to configure Jill's LED Candle with a non-supported type");
  }

  return;
}

export function auto_haveEagle(): boolean {
  if (canChangeToFamiliar($familiar`Patriotic Eagle`)) {
    return true;
  }
  return false;
}

export function auto_forceEagle(famChoice: Familiar): Familiar {
  //Force the Patriotic Eagle if we used a banish recently and can't use one until we burn 11 combats with the Eagle
  if (
    auto_haveEagle() &&
    toInt(getProperty("screechCombats")) > 0 &&
    !auto_queueIgnore()
  ) {
    auto_log_info$1("Forcing Patriotic Eagle");
    return $familiar`Patriotic Eagle`;
  }
  return famChoice;
}

export function auto_canRWBBlast(): boolean {
  if (!auto_haveEagle()) {
    return false;
  }
  if (!auto_is_valid$2($skill`%fn, fire a Red, White and Blue Blast`)) {
    return false;
  }
  if (haveEffect($effect`Everything Looks Red, White and Blue`) > 0) {
    //Already have ELRWB
    return false;
  }
  if (auto_habitatMonster() !== Monster.none) {
    //don't want to RWB Blast a Habitated monster
    return false;
  }
  return true;
}

export function auto_RWBBlastTarget(target: Monster): boolean {
  if (!auto_canRWBBlast()) {
    return false;
  }
  switch (target) {
    case $monster`modern zmobie`:
      // only worth it if we need 15 or more evilness reduced
      return (
        toInt(getProperty("cyrptAlcoveEvilness")) -
          3 * (5 + cyrptEvilBonus$1()) >
        13
      );
    case $monster`dirty old lihc`:
      // only worth it if we need 9 or more evilness reduced.
      return (
        toInt(getProperty("cyrptNicheEvilness")) -
          3 * (3 + cyrptEvilBonus$1()) >
        13
      );
    default:
      return toMonster(getProperty("rwbMonster")) === target;
  }
  return false;
}

export function auto_RWBMonster(): Monster {
  if (toInt(getProperty("rwbMonsterCount")) < 3) {
    return toMonster(getProperty("rwbMonster"));
  }
  return Monster.none;
}

function activeCitZoneMod(): string {
  // get the active Citizen of a Zone mods, if any
  if (!auto_haveEagle() || haveEffect($effect`Citizen of a Zone`) === 0) {
    return "";
  }
  visitUrl("desc_effect.php?whicheffect=9391a5f7577e30ac3af6309804da6944"); // visit url to refresh Mafia's _citizenZoneMods preference
  const activeCitZoneMod_1: string = toLowerCase(
    getProperty("_citizenZoneMods"),
  );
  return activeCitZoneMod_1;
}

function auto_citZoneModIsGoal(goal: string): boolean {
  const activeCitZoneMod_1: string = activeCitZoneMod();

  if (
    containsText(activeCitZoneMod_1, goal) ||
    (goal === "spec" && containsText(activeCitZoneMod_1, "cold resistance"))
  ) {
    return true;
  }
  return false;
}

function auto_citizenZonePrep(goal: string): boolean {
  const activeCitZoneMod_1: string = activeCitZoneMod();
  if (myMeat() < meatReserve() && goal !== "mp") {
    return false; //don't attempt to change if we don't have a lot of meat and we are going for something other than mp
  }
  if (
    haveEffect($effect`Citizen of a Zone`) > 0 &&
    containsText(activeCitZoneMod_1, goal)
  ) {
    auto_log_info$1("No need to remove Citizen of a Zone");
    return false;
  }
  if (
    haveEffect($effect`Citizen of a Zone`) > 0 &&
    !containsText(activeCitZoneMod_1, goal) &&
    itemAmount($item`soft green echo eyedrop antidote`) === 0
  ) {
    auto_log_info$1("Can't remove Citizen of a Zone");
    return false;
  }
  if (
    !auto_citZoneModIsGoal(goal) &&
    itemAmount($item`soft green echo eyedrop antidote`) > 0
  ) {
    //try to remove Citizen of a Zone
    uneffect($effect`Citizen of a Zone`);
    if (haveEffect($effect`Citizen of a Zone`) > 0) {
      auto_log_debug$1("Tried to remove Citizen of a Zone but couldn't");
      return false;
    }
  }
  return true;
}

function citizenZones(goal: string): Map<Location, boolean> {
  if (goal === "meat") {
    return new Map([
      [$location`The Battlefield (Frat Uniform)`, true],
      [$location`The Battlefield (Hippy Uniform)`, true],
      [$location`The Hidden Hospital`, true],
      [$location`The Haunted Bathroom`, true],
      [$location`The Castle in the Clouds in the Sky (Basement)`, true],
      [$location`Lair of the Ninja Snowmen`, true],
      [$location`The Defiled Cranny`, true],
      [$location`The Laugh Floor`, true],
      [$location`The Batrat and Ratbat Burrow`, true],
      [$location`The Sleazy Back Alley`, true],
    ]);
  }
  if (goal === "item") {
    return new Map([
      [$location`The Haunted Laundry Room`, true],
      [$location`Whitey's Grove`, true],
      [$location`The Icy Peak`, true],
      [$location`Itznotyerzitz Mine`, true],
      [$location`The Dark Heart of the Woods`, true],
      [$location`The Hidden Temple`, true],
      [$location`The Haunted Library`, true],
      [$location`The Bat Hole Entrance`, true],
      [$location`Noob Cave`, true],
    ]);
  }
  if (goal === "init") {
    return new Map([
      [$location`The Feeding Chamber`, true],
      [$location`An Unusually Quiet Barroom Brawl`, true],
      [$location`Oil Peak`, true],
      [$location`Cobb's Knob Kitchens`, true],
      [$location`The VERY Unquiet Garves`, true],
      [$location`The Haunted Kitchen`, true],
    ]);
  }
  if (goal === "mp") {
    return new Map([
      [$location`The Upper Chamber`, true],
      [$location`Inside the Palindome`, true],
      [$location`A-Boo Peak`, true],
      [$location`The Hippy Camp`, true],
      [$location`Megalo-City`, true],
      [$location`Shadow Rift`, true],
      [$location`Vanya's Castle`, true],
      [$location`The Hatching Chamber`, true],
      [$location`Wartime Hippy Camp (Frat Disguise)`, true],
      [$location`The Orcish Frat House`, true],
      [$location`The Middle Chamber`, true],
      [$location`The Black Forest`, true],
      [$location`The Haunted Ballroom`, true],
      [$location`The Red Zeppelin`, true],
      [$location`The Hidden Park`, true],
      [$location`Twin Peak`, true],
      [$location`The Smut Orc Logging Camp`, true],
      [$location`The Daily Dungeon`, true],
      [$location`The Spooky Forest`, true],
    ]);
  }
  if (goal === "spec") {
    //prismatic resistance
    return new Map([[$location`The Outskirts of Cobb's Knob`, true]]);
  }
  return new Map([[Location.none, true]]);
}
export function auto_getCitizenZone(loc: Location, inCombat: boolean): boolean {
  const eagle: Familiar = $familiar`Patriotic Eagle`;
  //zones are approximately organized by autoscend level quest structure
  const meatZones: Map<Location, boolean> = citizenZones("meat");
  const itemZones: Map<Location, boolean> = citizenZones("item");
  const initZones: Map<Location, boolean> = citizenZones("init");
  //mp zones are organized by 20-30 mp regen then 10-15 mp regen and then approximately autoscend level quest structure
  const mpZones: Map<Location, boolean> = citizenZones("mp");
  const specZones: Map<Location, boolean> = citizenZones("spec");
  activeCitZoneMod();
  let goal: string;

  if (!canAdventure(loc)) {
    return false;
  }
  //set goal for tracking
  if (
    specZones.has(loc) &&
    auto_goingToMouthwashLevel() &&
    expected_level_after_mouthwash() < 13 &&
    turnsPlayed() === 0
  ) {
    //only want spec to get cold res for septEmberCenser usage and only if we don't get to L13. Don't want to do this outside of D1
    //ideally also have spring away or some other free run
    goal = "spec";
  } else if (meatZones.has(loc)) {
    goal = "meat";
  } else if (itemZones.has(loc)) {
    goal = "item";
  } else if (initZones.has(loc)) {
    goal = "init";
  } else if (mpZones.has(loc)) {
    goal = "mp";
  } else {
    //if for some reason we make it into the location getCitizenZone and it's not in any of the defined zones, get the item buff
    auto_log_debug$1(
      "Somehow we got here and don't actually want to use the Eagle",
    );
    return false;
  }
  if (!auto_citizenZonePrep(goal)) {
    return false;
  }

  function wantToFreeRun(): boolean {
    if (loc === solveDelayZone$1()) {
      return true;
    }
    return false;
  }
  if (!inCombat) {
    if (useFamiliar(eagle)) {
      if (wantToFreeRun()) {
        setProperty("auto_forceFreeRun", true.toString());
      }
      if (!autoAdv$2(loc)) {
        auto_log_debug$1(
          `Attempted to get citizen of a zone buff for ${goal} goal however we failed.`,
        );
        return false;
      }
    }
  } else {
    handleTracker$2(
      "Citizen of a Zone",
      myLocation().toString(),
      goal,
      "auto_otherstuff",
    );
    return true;
  }
  return false;
}

export function auto_getCitizenZone$1(goal: string): boolean {
  const zones: Map<Location, boolean> = citizenZones(goal);

  if (!auto_citizenZonePrep(goal)) {
    return false;
  }

  for (const loc of zones.keys()) {
    if (!canAdventure(loc)) {
      continue;
    }
    return auto_getCitizenZone(loc, false);
  }
  return false;
}

export function auto_haveBurningLeaves(): boolean {
  return (
    auto_is_valid$4("Burning Leaves") &&
    $item`A Guide to Burning Leaves`.toString() in getCampground()
  );
}

export function auto_initBurningLeaves(): boolean {
  if (!auto_haveBurningLeaves()) {
    return false;
  }
  if (availableAmount($item`rake`) < 1) {
    // visit the pile of burning leaves to grab the rakes
    visitUrl("campground.php?preaction=leaves");
  }
  return availableAmount($item`rake`) > 0;
}

export function auto_defaultBurnLeaves(): boolean {
  // Returns true if we made everything we want, false if anything fails.
  if (!auto_haveBurningLeaves()) {
    return false;
  }

  auto_initBurningLeaves();

  let success: boolean = true;

  if (
    !($item`forest canopy bed`.toString() in getCampground()) &&
    getDwelling() !== $item`big rock` &&
    auto_haveCincho() &&
    creatableAmount($item`forest canopy bed`) > 0
  ) {
    // get and use the forest canopy bed if we don't have one already and have a Cincho as it is +5 free rests
    if (create(1, $item`forest canopy bed`)) {
      handleTracker$1(
        "Burning Leaves",
        `Claimed ${$item`forest canopy bed`}`,
        "auto_iotm_claim",
      );
      success = success && use(1, $item`forest canopy bed`);
    } else {
      return false;
    }
  }

  if (
    $item`forest canopy bed`.toString() in getCampground() &&
    haveEffect($effect`Resined`) === 0 &&
    creatableAmount($item`distilled resin`) > 0
  ) {
    // Get the Resined effect if we don't have it as it is net positive for leaves.
    if (create(1, $item`distilled resin`)) {
      handleTracker$1(
        "Burning Leaves",
        `Claimed ${$item`distilled resin`}`,
        "auto_iotm_claim",
      );
      success = success && use(1, $item`distilled resin`);
    } else {
      return false;
    }
  }

  if (
    in_avantGuard() &&
    itemAmount($item`autumnic bomb`) === 0 &&
    creatableAmount($item`autumnic bomb`) > 0
  ) {
    if (create(1, $item`autumnic bomb`)) {
      //Reduces enemy hp in half, useful for bodyguards with 40K hp
      handleTracker$1(
        "Burning Leaves",
        `Claimed ${$item`autumnic bomb`}`,
        "auto_iotm_claim",
      );
    } else {
      success = false;
    }
  }

  if (
    !isGuildClass() &&
    $item`forest canopy bed`.toString() in getCampground()
  ) {
    success = success && auto_makeAutumnalAegis(); // +2 resistance to all elements, 250 DA (for megalo-city with no tao)
  }
  return success;
}

export function auto_makeAutumnalAegis(): boolean {
  if (!auto_haveBurningLeaves()) {
    return false;
  }
  if (
    creatableAmount($item`autumnal aegis`) > 0 &&
    itemAmount($item`autumnal aegis`) === 0
  ) {
    if (create(1, $item`autumnal aegis`)) {
      // So-so resistance to all elements, 250 DA (for megalo-city)
      handleTracker$1(
        "Burning Leaves",
        `Claimed ${$item`autumnal aegis`}`,
        "auto_iotm_claim",
      );
    }
  }
  return availableAmount($item`autumnal aegis`) > 0;
}

export function auto_remainingBurningLeavesFights(): number {
  if (!auto_haveBurningLeaves()) {
    return 0;
  }
  return 5 - toInt(getProperty("_leafMonstersFought"));
}

export function auto_fightFlamingLeaflet(): boolean {
  if (auto_remainingBurningLeavesFights() < 1) {
    return false;
  }
  if (availableAmount($item`inflammable leaf`) < 11) {
    return false;
  }

  if (auto_haveTearawayPants()) {
    addBonusToMaximize($item`tearaway pants`, 500); // plants give turns when you tearaway
  }

  const pages: Map<number, string> = new Map();
  pages.set(0, "campground.php?preaction=leaves");
  pages.set(1, "choice.php?pwd&whichchoice=1510&option=1&leaves=11");
  return autoAdvBypass(0, pages, $location`Noob Cave`, null);
}

export function auto_haveCCSC(): boolean {
  if (
    auto_can_equip($item`candy cane sword cane`) &&
    availableAmount($item`candy cane sword cane`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_handleCCSC(): boolean {
  if (!auto_haveCCSC()) {
    return false;
  }
  const place: Location = myLocation();
  /* Where/Why We Want Only Certain Locations
	 The Sleazy Back Alley - 11-leaf clover (only visit if we are a moxie class unlocking guild, but still potentially useful)
	 The Daily Dungeon - Eleven-foot pole replacement. +1 Fat Loot Token
	 The Shore, Inc. Travel Agency - 2 Scrips and all stats
	 The Defiled Cranny - -11 evilness
	 The eXtreme Slope - If we can't do ninja snowmen for some reason, gives us 2 pieces of equipment in one NC
	 The Penultimate Fantasy Airship - Get an umbrella for basement, only if we don't have one.
	 The Black Forest - +8 exploration
	 The Copperhead Club - Gives us a priceless diamond, saving 4950-5000 meat
	 The Hidden Apartment Building - +1 cursed level, Doesn't leave NC
	 The Hidden Bowling Alley - 1 less bowling ball needed
	 An Overgrown Shrine (Northeast) - Free Meat
	 A Mob of Zeppelin Protesters - Double Sleaze Protestors
	 Wartime Frat House/Camp - Skip non-useful NC to go to war start NC
	 */

  if (
    (place === $location`The Hidden Bowling Alley` &&
      itemAmount($item`bowling ball`) > 0 &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) < 5 &&
      !toBoolean(getProperty("candyCaneSwordBowlingAlley"))) ||
    (place === $location`The Shore, Inc. Travel Agency` &&
      itemAmount($item`forged identification documents`) === 0 &&
      !toBoolean(getProperty("candyCaneSwordShore"))) ||
    (place === $location`The eXtreme Slope` &&
      !possessEquipment($item`eXtreme scarf`) &&
      !possessEquipment($item`snowboarder pants`) &&
      !auto_haveMcHugeLargeSkis()) ||
    (place === $location`The Copperhead Club` &&
      itemAmount($item`priceless diamond`) === 0 &&
      itemAmount($item`Red Zeppelin ticket`) === 0 &&
      !toBoolean(getProperty("candyCaneSwordCopperheadClub"))) ||
    (place === $location`The Defiled Cranny` &&
      !toBoolean(getProperty("candyCaneSwordDefiledCranny"))) ||
    (place === $location`The Black Forest` &&
      !toBoolean(getProperty("candyCaneSwordBlackForest"))) ||
    (place === $location`The Hidden Apartment Building` &&
      !toBoolean(getProperty("candyCaneSwordApartmentBuilding"))) ||
    (place === $location`An Overgrown Shrine (Northeast)` &&
      !toBoolean(getProperty("_candyCaneSwordOvergrownShrine")) &&
      toInt(getProperty("hiddenOfficeProgress")) > 0) ||
    (place === $location`The Overgrown Lot` &&
      !toBoolean(getProperty("_candyCaneSwordOvergrownLot"))) ||
    (place === $location`The Penultimate Fantasy Airship` &&
      L10_needUmbrella()) ||
    (place === $location`Wartime Frat House` &&
      possessOutfit$1("War Hippy Fatigues")) ||
    (place === $location`Wartime Hippy Camp` &&
      possessOutfit$1("Frat Warrior Fatigues")) ||
    $locations`The Sleazy Back Alley, A Mob of Zeppelin Protesters, The Daily Dungeon`.includes(
      place,
    )
  ) {
    return true;
  }
  return false;
}

export function auto_remainingCandyCaneSlashes(): number {
  if (!auto_haveCCSC()) {
    return 0;
  }
  return 11 - toInt(getProperty("_surprisinglySweetSlashUsed"));
}
