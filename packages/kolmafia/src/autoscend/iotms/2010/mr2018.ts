import {
  availableAmount,
  cliExecute,
  containsText,
  Effect,
  equip,
  equippedItem,
  Familiar,
  floor,
  getRevision,
  gitExists,
  haveEffect,
  haveFamiliar,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  lastChoice,
  lastMonster,
  Location,
  min,
  Monster,
  myFamiliar,
  myFullness,
  myHash,
  myLevel,
  myMeat,
  myPrimestat,
  random,
  splitString,
  Stat,
  toInt,
  toLowerCase,
  totalTurnsPlayed,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $slot,
  $stat,
  get,
  set,
} from "libram";

import { autoAdv, autoAdvBypass$1, CombatMacro } from "../../auto_adventure";
import {
  auto_spleenFamiliarAdvItemsPossessed,
  spleen_left,
} from "../../auto_consume";
import {
  autoEquipToSlot,
  equipStatgainIncreasers$1,
  possessEquipment,
} from "../../auto_equipment";
import {
  canChangeToFamiliar,
  handleFamiliar$1,
  is100FamRun,
} from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_abort,
  auto_is_valid,
  auto_is_valid$1,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  handleTracker,
  hasTorso,
  internalQuestStatus,
  safeGet,
  wrap_item,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import { in_disguises } from "../../paths/2018/disguises_delimit";
import { in_glover } from "../../paths/2018/g_lover";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { hedgeTrimmersNeeded } from "../../quests/level_09";
import { L10_needAmuletOfPlotSignificance } from "../../quests/level_10";
import { AshMatcher } from "../../utils/kolmafiaUtils";
import { maximizer } from "../../utils/maximizer";
import { auto_havePillKeeper } from "./mr2019";

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

export function auto_godLobsterFightsRemaining(): number {
  return 3 - get("_godLobsterFights");
}

export function godLobsterCombat(
  it: Item = $item.none,
  goal: number = 3,
  option?: CombatMacro,
): boolean {
  // it = equipment we want the God Lobster to wear
  // goal = option we want to select in the post-combat choice
  if (!canChangeToFamiliar($familiar`God Lobster`)) {
    return false;
  }
  if (goal < 1 || goal > 3) {
    return false;
  }
  if (get("_godLobsterFights") >= 3) {
    return false;
  }
  if (it !== $item.none && availableAmount(it) === 0) {
    return false;
  }
  if (goal === 1 && it === $item`God Lobster's Crown`) {
    return false;
  }

  if (!in_quantumTerrarium()) {
    handleFamiliar$1($familiar`God Lobster`);
    useFamiliar($familiar`God Lobster`);
  }

  if (equippedItem($slot`familiar`) !== it && it !== $item.none) {
    equip($slot`familiar`, it);
  }

  set("_auto_lobsterChoice", goal);
  return autoAdvBypass$1(
    "main.php?fightgodlobster=1",
    $location`Noob Cave`,
    option,
  );
}

export function fantasyRealmAvailable(): boolean {
  if (!isUnrestricted($item`FantasyRealm membership packet`)) {
    return false;
  }
  if (get("frAlways") || get("_frToday")) {
    return true;
  }
  return false;
}

export function fantasyBanditsFought(): number {
  if (containsText(get("_frMonstersKilled"), "fantasy bandit")) {
    for (const [, it] of splitString(get("_frMonstersKilled"), ",").entries()) {
      if (containsText(it, "fantasy bandit")) {
        const count_1: number = toInt((splitString(it, ":")[1] ??= ""));
        return count_1;
      }
    }
  }
  return 0;
}

export function acquiredFantasyRealmToken(): boolean {
  return fantasyBanditsFought() >= 5;
}

export function fantasyRealmToken(): boolean {
  if (!isUnrestricted($item`FantasyRealm membership packet`)) {
    return false;
  }

  if (acquiredFantasyRealmToken()) {
    return false;
  }

  if (
    (get("frAlways") || get("_frToday")) &&
    !possessEquipment($item`FantasyRealm G. E. M.`)
  ) {
    let option: number = 1;
    switch (myPrimestat()) {
      case $stat`Muscle`:
        option = 1;
        break;
      case $stat`Mysticality`:
        option = 2;
        break;
      case $stat`Moxie`:
        option = 3;
        break;
    }
    if (option === 1 && possessEquipment($item`FantasyRealm Warrior's Helm`)) {
      option = 2;
    }
    if (option === 2 && possessEquipment($item`FantasyRealm Mage's Hat`)) {
      option = 3;
    }
    if (option === 3 && possessEquipment($item`FantasyRealm Rogue's Mask`)) {
      option = 1;
    }
    visitUrl("place.php?whichplace=realm_fantasy&action=fr_initcenter", false);
    visitUrl(`choice.php?whichchoice=1280&pwd=&option=${option}`);
  }

  if (!possessEquipment($item`FantasyRealm G. E. M.`)) {
    return false;
  }
  // If we're not allowed to adventure without a familiar due to being in a 100% familiar run or Avant Guard
  if (is100FamRun() || in_avantGuard()) {
    return false;
  }

  if (possessEquipment($item`FantasyRealm G. E. M.`)) {
    autoEquipToSlot($slot`acc3`, $item`FantasyRealm G. E. M.`);
  }
  //This does not appear to check that we no longer need to adventure there...

  return autoAdv($location`The Bandit Crossroads`);
}

function allFantasyRealmLocations(): Location[] {
  return [
    $location`The Bandit Crossroads`,
    $location`The Cursed Village`,
    $location`The Evil Cathedral`,
    $location`The Archwizard's Tower`,
    $location`The Cursed Village Thieves' Guild`,
    $location`The Towering Mountains`,
    $location`The Foreboding Cave`,
    $location`The Lair of the Phoenix`,
    $location`The Old Rubee Mine`,
    $location`The Ogre Chieftain's Keep`,
    $location`The Master Thief's Chalet`,
    $location`The Mystic Wood`,
    $location`The Faerie Cyrkle`,
    $location`The Spider Queen's Lair`,
    $location`The Druidic Campsite`,
    $location`The Ley Nexus`,
    $location`The Putrid Swamp`,
    $location`Near the Witch's House`,
    $location`The Troll Fortress`,
    $location`The Dragon's Moor`,
    $location`The Sprawling Cemetery`,
    $location`The Labyrinthine Crypt`,
    $location`The Barrow Mounds`,
    $location`The Ghoul King's Catacomb`,
    $location`Duke Vampire's Chateau`,
  ];
}

export function isFantasyRealm(loc: Location): boolean {
  return allFantasyRealmLocations().includes(loc);
}

export function songboomSetting(goal: string): boolean {
  let option: number = 6;

  if (
    goal === "eye of the giger" ||
    goal === "spooky" ||
    goal === "nightmare" ||
    goal === $item`Nightmare Fuel`.toString() ||
    goal === "stats"
  ) {
    option = 1;
  } else if (
    goal === "food vibrations" ||
    goal === "food" ||
    goal === "food drops" ||
    goal === $item`Special Seasoning`.toString() ||
    goal === "spell damage" ||
    goal === "adventures" ||
    goal === "adv"
  ) {
    option = 2;
  } else if (
    goal === "remainin' alive" ||
    goal === "dr" ||
    goal === "damage reduction" ||
    goal === $item`Shielding Potion`.toString() ||
    goal === "delevel"
  ) {
    option = 3;
  } else if (
    goal === "these fists were made for punchin'" ||
    goal === "weapon damage" ||
    goal === "prismatic damage" ||
    goal === $item`Punching Potion`.toString() ||
    goal === "prismatic"
  ) {
    option = 4;
  } else if (
    goal === "total eclipse of your meat" ||
    goal === "meat" ||
    goal === "meat drop" ||
    goal === $item`Gathered Meat-Clip`.toString() ||
    goal === "base meat"
  ) {
    option = 5;
  } else if (goal === "silence" || goal === "none" || goal === "") {
    option = 6;
  }

  return songboomSetting$1(option);
}

function songboomSetting$1(option: number): boolean {
  if (!auto_is_valid($item`SongBoom™ BoomBox`)) {
    return false;
  }
  if (itemAmount($item`SongBoom™ BoomBox`) === 0) {
    return false;
  }
  if (get("_boomBoxSongsLeft") === 0) {
    if (option !== 6) {
      // Always allow turning off the song, if that is really something we want to do.
      return false;
    }
  }
  if (option < 0 || option > 6) {
    return false;
  }

  const currentSong: string = get("boomBoxSong");
  if (option === 1 && currentSong === "Eye of the Giger") {
    return false;
  } else if (option === 2 && currentSong === "Food Vibrations") {
    return false;
  } else if (option === 3 && currentSong === "Remainin' Alive") {
    return false;
  } else if (
    option === 4 &&
    currentSong === "These Fists Were Made for Punchin'"
  ) {
    return false;
  } else if (option === 5 && currentSong === "Total Eclipse of Your Meat") {
    return false;
  } else if (option === 6 && currentSong === "") {
    return false;
  }

  let boomsLeft: number = 0;
  let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=9919");
  // Find the number of songs left by matching the number in the "X more times" sentence. Overly flexible to prevent April Fools word salad breakage.
  // \\b(\\d+)\\b matches a whole number (\\d+) that's surrounded by word boundaries (\\b), e.g. a space
  // [^.]* matches any characters except a period (.), any number of times (*), capturing everything up to the end of the sentence
  // \\. matches the literal ending period to only check the top boombox sentence
  const boomMatcher: AshMatcher = new AshMatcher("\\b(\\d+)\\b[^.]*\\.", page);
  if (boomMatcher.find()) {
    boomsLeft = toInt(boomMatcher.group(1));
  } else {
    auto_log_warning("Could not find how many songs we have left...", "red");
    option = 6;
  }

  page = visitUrl(`choice.php?whichchoice=1312&option=${option}`);
  if (containsText(page, "don't want to break this thing")) {
    auto_log_warning("Unable to change BoomBoxen songen!", "red");
    return false;
  }
  if (option !== 6) {
    boomsLeft--;
  }
  auto_log_info(
    `Change successful to ${get("boomBoxSong")}. We have ${boomsLeft} SongBoom BoomBoxen songens left!`,
    "green",
  );
  return true;
}

export function auto_setSongboom(): void {
  if (!auto_is_valid($item`SongBoom™ BoomBox`)) {
    return;
  }
  if (itemAmount($item`SongBoom™ BoomBox`) === 0) {
    return;
  }
  if (get("auto_beatenUpCount", 0) > 5) {
    songboomSetting("dr");
  } else if (
    internalQuestStatus("questL12War") > 0 &&
    internalQuestStatus("questL12War") < 2
  ) {
    // Once we've started the war, we want to be able to micromanage songs
    // for Gremlins and Nuns. Don't break this for them.
  } else if (
    !isActuallyEd() &&
    internalQuestStatus("questL07Cyrptic") < 1 &&
    !(auto_havePillKeeper() && spleen_left() >= 3) &&
    spleen_left() >
      4 *
        min(auto_spleenFamiliarAdvItemsPossessed(), floor(spleen_left() / 4)) &&
    get("_boomBoxFights") === 10 &&
    get("_boomBoxSongsLeft") > 3
  ) {
    songboomSetting("nightmare");
  } else {
    if (myFullness() === 0 || itemAmount($item`Special Seasoning`) < 4) {
      songboomSetting("food");
    } else {
      if (in_glover() && myMeat() > 10000) {
        songboomSetting("dr");
      } else {
        songboomSetting("meat");
      }
    }
  }
}

export function catBurglarHeistsLeft(): number {
  if (
    !haveFamiliar($familiar`Cat Burglar`) ||
    !auto_is_valid$1($familiar`Cat Burglar`)
  ) {
    return 0;
  }
  const banked_heists: number = get("catBurglarBankHeists");
  let charge: number = get("_catBurglarCharge");
  const heists_complete: number = get("_catBurglarHeistsComplete");
  let heists_left: number = banked_heists - heists_complete;
  charge /= 10;
  while (charge >= 1) {
    heists_left++;
    charge /= 2;
  }
  return heists_left;
}

function catBurglarHeist$1(it: Item): boolean {
  /* Costly to call (requires two familiar swaps and a page load, even on failure)
   * so I recommend calling this only after we fight a monster.
   * Note that the Cat Burglar needs to be the active familiar in combat to heist that monster.
   */
  if (0 === catBurglarHeistsLeft()) {
    return false;
  }

  auto_log_info(`Trying to heist a ${it}`, "blue");
  const backup_familiar: Familiar = myFamiliar();
  try {
    useFamiliar($familiar`Cat Burglar`);

    let page: string = visitUrl("main.php?heist=1");
    const button: AshMatcher = new AshMatcher(
      `name="(st:\\d+:${toInt(it)})"`,
      page,
    );
    if (button.find()) {
      const choice_name: string = button.group(1);
      const url: string = `choice.php?whichchoice=1320&option=1&${choice_name}=${it.toString()}&pwd=${myHash()}`;
      page = visitUrl(url);
      handleTracker({
        what: $familiar`Cat Burglar`,
        detail: it.toString(),
        property: "auto_otherstuff",
      });
      return true;
    }
    auto_log_warning(
      `We don't seem to be able to heist a ${it}. Maybe we didn't fight it with the Cat Burglar?`,
      "red",
    );
    return false;
  } finally {
    useFamiliar(backup_familiar);
  }
}

export function catBurglarHeistDesires(): Map<Monster, Item> {
  /* Note that this is called from auto_pre_adv.ash - WE WILL OVERRIDE FAMILIAR IN
   * PREADVENTURE IF WE NEED THE BURGLE.
   */
  const wannaHeists: Map<Monster, Item> = new Map();

  if (
    !canChangeToFamiliar($familiar`XO Skeleton`) &&
    get("sidequestOrchardCompleted") === "none"
  ) {
    // Can't hugpocket? 1 turn filthworms is still a thing you can do!
    if (
      haveEffect($effect`Filthworm Larva Stench`) === 0 &&
      itemAmount($item`filthworm hatchling scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`larval filthworm`,
        $item`filthworm hatchling scent gland`,
      );
    }
    if (
      haveEffect($effect`Filthworm Drone Stench`) === 0 &&
      itemAmount($item`filthworm drone scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`filthworm drone`,
        $item`filthworm drone scent gland`,
      );
    }
    if (
      haveEffect($effect`Filthworm Guard Stench`) === 0 &&
      itemAmount($item`filthworm royal guard scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`filthworm royal guard`,
        $item`filthworm royal guard scent gland`,
      );
    }
  }

  const oreGoal: Item = safeGet("trapperOre");
  if (
    oreGoal !== $item.none &&
    itemAmount(oreGoal) < 3 &&
    internalQuestStatus("questL08Trapper") < 2 &&
    inHardcore()
  ) {
    wannaHeists.set($monster`mountain man`, oreGoal);
  }

  if (
    itemAmount($item`killing jar`) === 0 &&
    (get("gnasirProgress") & 4) === 0 &&
    inHardcore()
  ) {
    wannaHeists.set($monster`banshee librarian`, $item`killing jar`);
  }

  if (
    myLevel() >= 11 &&
    !possessEquipment($item`Mega Gem`) &&
    inHardcore() &&
    itemAmount($item`wet stew`) === 0 &&
    itemAmount($item`wet stunt nut stew`) === 0
  ) {
    if (itemAmount($item`bird rib`) === 0) {
      wannaHeists.set($monster`whitesnake`, $item`bird rib`);
    }
    if (itemAmount($item`lion oil`) === 0) {
      wannaHeists.set($monster`white lion`, $item`lion oil`);
    }
  }

  if (
    myLevel() >= 8 &&
    catBurglarHeistsLeft() >= 2 &&
    hedgeTrimmersNeeded() > 0
  ) {
    wannaHeists.set(
      $monster`bearpig topiary animal`,
      $item`rusty hedge trimmers`,
    );
    wannaHeists.set(
      $monster`elephant (meatcar?) topiary animal`,
      $item`rusty hedge trimmers`,
    );
    wannaHeists.set(
      $monster`spider (duck?) topiary animal`,
      $item`rusty hedge trimmers`,
    );
  }

  if (
    get("questL11Shen") === "finished" &&
    internalQuestStatus("questL11Ron") === 1 &&
    catBurglarHeistsLeft() >= 2
  ) {
    wannaHeists.set($monster`Blue Oyster cultist`, $item`cigarette lighter`);
  }
  // 18 is a totally arbitrary cutoff here, but it's probably fine.
  if ($location`The Penultimate Fantasy Airship`.turnsSpent >= 18) {
    if (L10_needAmuletOfPlotSignificance()) {
      wannaHeists.set(
        $monster`Quiet Healer`,
        $item`amulet of extreme plot significance`,
      );
    }
    if (
      !possessEquipment($item`Mohawk wig`) &&
      internalQuestStatus("questL10Garbage") < 10
    ) {
      wannaHeists.set($monster`Burly Sidekick`, $item`Mohawk wig`);
    }
  }

  return wannaHeists;
}

function catBurglarHeistDo(): boolean {
  // We can't know what's burgleable without checking the burgle noncombat,
  // and that's expensive to do repeatedly. So we burgle only if we want
  // to burgle the last monster. This is bad if you're about to leave a zone.
  const wannaHeists: Map<Monster, Item> = catBurglarHeistDesires();

  if (wannaHeists.has(lastMonster())) {
    catBurglarHeist$1(wannaHeists.get(lastMonster()) ?? $item.none);
  }
  // don't return true from this, isn't adventuring.
  return false;
}

export const catBurglarHeistTask: QuestTask = registerQuestTask({
  name: "catBurglarHeist",
  completed: () => false,
  ready: () => catBurglarHeistsLeft() > 0,
  do: catBurglarHeistDo,
});

export function catBurglarHeist(): boolean {
  return runQuestTask(catBurglarHeistTask);
}

export function cheeseWarMachine(
  stats: number,
  it: number,
  eff: number,
  potion: number,
): boolean {
  if (!auto_is_valid($item`Bastille Battalion control rig`)) {
    return false;
  }
  if (itemAmount($item`Bastille Battalion control rig`) === 0) {
    return false;
  }
  if (get("_bastilleGames") !== 0) {
    return false;
  }

  if (stats === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        stats = 2;
        break;
      case $stat`Mysticality`:
        stats = 1;
        break;
      case $stat`Moxie`:
        stats = 3;
        break;
    }
  }
  if (it === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        it = 1;
        break;
      case $stat`Mysticality`:
        it = 2;
        break;
      case $stat`Moxie`:
        it = 3;
        break;
    }
  }

  if (eff === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        eff = 1;
        break;
      case $stat`Mysticality`:
        eff = 2;
        break;
      case $stat`Moxie`:
        eff = 3;
        break;
    }
  }

  if (potion === 0) {
    potion = 1 + random(3);
  }

  if (stats < 1 || stats > 3) {
    return false;
  }
  if (it < 1 || it > 3) {
    return false;
  }
  if (eff < 1 || eff > 3) {
    return false;
  }
  if (potion < 1 || potion > 3) {
    return false;
  }
  equipStatgainIncreasers$1(myPrimestat(), true);
  const page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=9928`,
    false,
  );

  const first: AshMatcher = new AshMatcher("/bbatt/barb(\\d).png", page);
  if (first.find()) {
    let setting: number = toInt(first.group(1));
    while (setting !== stats) {
      visitUrl(`choice.php?whichchoice=1313&option=1&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const second: AshMatcher = new AshMatcher("/bbatt/bridge(\\d).png", page);
  if (second.find()) {
    let setting: number = toInt(second.group(1));
    while (setting !== it) {
      visitUrl(`choice.php?whichchoice=1313&option=2&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const third: AshMatcher = new AshMatcher("/bbatt/holes(\\d).png", page);
  if (third.find()) {
    let setting: number = toInt(third.group(1));
    while (setting !== eff) {
      visitUrl(`choice.php?whichchoice=1313&option=3&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const fourth: AshMatcher = new AshMatcher("/bbatt/moat(\\d).png", page);
  if (fourth.find()) {
    let setting: number = toInt(fourth.group(1));
    while (setting !== potion) {
      visitUrl(`choice.php?whichchoice=1313&option=4&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  visitUrl(`choice.php?whichchoice=1313&option=5&pwd=${myHash()}`, false);

  for (let i: number = 0; i < 5; i++) {
    visitUrl(`choice.php?whichchoice=1314&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1319&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1314&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1319&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1315&option=3&pwd=${myHash()}`);
    if (lastChoice() === 1316) {
      break;
    }
  }

  visitUrl(`choice.php?whichchoice=1316&option=3&pwd=${myHash()}`);
  return true;
}

export function neverendingPartyRemainingFreeFights(): number {
  //Returns how many free fights do you have remaining in neverending party?

  if (!neverendingPartyAvailable()) {
    return 0;
  }
  //if path randomizes names then the free fights are not free
  if (in_disguises() || in_ocrs()) {
    return 0;
  }
  //daily pass users do not get free fights
  if (get("_neverendingPartyToday")) {
    return 0;
  }
  //mafia counts how many times you fought there for free, not how many free fights remain.
  return 10 - get("_neverendingPartyFreeTurns");
}

export function neverendingPartyAvailable(): boolean {
  if (!get("neverendingPartyAlways") && !get("_neverendingPartyToday")) {
    // check mafia properties which track access.
    return false;
  }
  if (!auto_is_valid($item`Neverending Party invitation envelope`)) {
    return false;
  }
  if (get("_questPartyFair") === "finished") {
    // Can't adventure if the quest is complete for the day.
    return false;
  }
  return true;
}

export function neverendingPartyCombat(): boolean {
  if (!neverendingPartyAvailable()) {
    return false;
  }

  if (in_glover()) {
    // only non stat effect is valid in G-Lover
    fightClubSpa$1($effect`Flagrantly Fragrant`);
  } else {
    fightClubSpa();
  }
  //May need to actually have 1 adventure left.

  if (
    hasTorso() &&
    januaryToteTurnsLeft($item`makeshift garbage shirt`) > 0 &&
    auto_is_valid($item`makeshift garbage shirt`)
  ) {
    januaryToteAcquire($item`makeshift garbage shirt`);
    autoEquipToSlot($slot`shirt`, $item`makeshift garbage shirt`);
  }

  return autoAdv($location`The Neverending Party`);
}

export function neverendingPartyChoiceHandler(choice: number): void {
  if (choice === 1322) {
    // The Beginning of the Neverend
    auto_runChoice(2); // No, I'm just here to party (decline quest)
  } else if (choice === 1323) {
    // All Done!
    auto_runChoice(1); // Take your leave (get quest reward)
  } else if (choice === 1324) {
    // It Hasn't Ended, It's Just Paused
    let buff: Effect = $effect.none;
    switch (myPrimestat()) {
      case $stat`Muscle`:
        buff = $effect`Spiced Up`;
        break;
      case $stat`Mysticality`:
        buff = $effect`Tomes of Opportunity`;
        break;
      case $stat`Moxie`:
        buff = $effect`The Best Hair You've Ever Had`;
        break;
    }
    if (in_glover()) {
      // Can't use any of the buffs, may as well fight
      auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
    } else if (buff !== $effect.none && haveEffect(buff) < 9) {
      // Get the +mainstat% buff if we don't have enough turns of it to get us to the next scheduled NC.
      switch (myPrimestat()) {
        case $stat`Muscle`:
          auto_runChoice(2); // Check out the kitchen (go to Gone Kitchin')

          break;
        case $stat`Mysticality`:
          auto_runChoice(1); // Head upstairs (go to A Room With a View... Of a Bed)

          break;
        case $stat`Moxie`:
          auto_runChoice(4); // Investigate the basement (go to Basement Urges)

          break;
        default:
          auto_runChoice(5); // Pick a fight (fight a random monster from the zone)

          break;
      }
    } else if (isAboutToPowerlevel() || isActuallyEd()) {
      // If we're powerlevelling (or farming Ka) grab the +ML buff if we don't have enough turns
      // of it to get us to the next scheduled NC. Otherwise take the combat.
      if (haveEffect($effect`Citronella Armpits`) < 9) {
        auto_runChoice(3); // Go to the back yard (go to Forward to the Back)
      } else {
        auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
      }
    } else {
      auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
    }
  } else if (choice === 1325) {
    // A Room With a View... Of a Bed
    if (myPrimestat() === $stat`Mysticality`) {
      auto_runChoice(2); // Read the tomes (Get Tomes of Opportunity buff. 20 advs of +20% to all Mysticality Gains)
    } else {
      auto_runChoice(1); // Take a quick nap (Full HP & MP restore)
    }
  } else if (choice === 1326) {
    // Gone Kitchin'
    if (myPrimestat() === $stat`Muscle`) {
      auto_runChoice(2); // Check out the muscle spice (Get Spiced Up buff. 20 advs of +20% to all Muscle Gains)
    } else {
      auto_runChoice(1); // Peruse the cookbooks (get some myst substats)
    }
  } else if (choice === 1327) {
    // Forward to the Back
    auto_runChoice(2); // Rub the candle wax under your arms (Get Citronella Armpits buff. 50 advs of +30 to Monster Level)
  } else if (choice === 1328) {
    // Basement Urges
    if (myPrimestat() === $stat`Moxie`) {
      auto_runChoice(2); // Use the hair gel (Get The Best Hair You've Ever Had buff. 20 advs of +20% to all Moxie Gains)
    } else {
      auto_runChoice(1); // Use the workout equipment (get some muscle substats)
    }
  } else {
    auto_abort("unhandled choice in neverendingPartyChoiceHandler");
  }
}

export function auto_latteDropName(l: Location): string {
  switch (l) {
    case $location`The Mouldering Mansion`:
      return "ancient";
    case $location`The Overgrown Lot`:
      return "basil";
    case $location`Whitey's Grove`:
      return "belgian";
    case $location`The Bugbear Pen`:
      return "bug-thistle";
    case $location`Madness Bakery`:
      return "butternut";
    case $location`The Black Forest`:
      return "cajun";
    case $location`The Haunted Billiards Room`:
      return "chalk";
    case $location`The Dire Warren`:
      return "carrot";
    case $location`Barrrney's Barrr`:
      return "carrrdamom";
    case $location`The Haunted Kitchen`:
      return "chili";
    case $location`The Sleazy Back Alley`:
      return "cloves";
    case $location`The Haunted Boiler Room`:
      return "coal";
    case $location`The Icy Peak`:
      return "cocoa";
    case $location`The Cola Wars Battlefield`:
      return "diet";
    case $location`Itznotyerzitz Mine`:
      return "dwarf";
    case $location`The Feeding Chamber`:
      return "filth";
    case $location`The Road to the White Citadel`:
      return "flour";
    case $location`The Fungal Nethers`:
      return "fungus";
    case $location`The Hidden Park`:
      return "grass";
    case $location`Cobb's Knob Barracks`:
      return "greasy";
    case $location`The Daily Dungeon`:
      return "healing";
    case $location`The Dark Neck of the Woods`:
      return "hellion";
    case $location`Wartime Frat House (Hippy Disguise)`:
      return "greek";
    case $location`The Old Rubee Mine`:
      return "grobold";
    case $location`The Bat Hole Entrance`:
      return "guarna";
    case $location`1st Floor, Shiawase-Mitsuhama Building`:
      return "gunpowder";
    case $location`Hobopolis Town Square`:
      return "hobo";
    case $location`The Haunted Library`:
      return "ink";
    case $location`Wartime Hippy Camp (Frat Disguise)`:
      return "kombucha";
    case $location`The Defiled Niche`:
      return "lihc";
    case $location`The Arid, Extra-Dry Desert`:
      return "lizard";
    case $location`Cobb's Knob Laboratory`:
      return "mega";
    case $location`The Unquiet Garves`:
      return "mold";
    case $location`The Briniest Deepests`:
      return "msg";
    case $location`The Haunted Pantry`:
      return "noodles";
    case $location`The Ice Hole`:
      return "norwhal";
    case $location`The Old Landfill`:
      return "oil";
    case $location`The Haunted Gallery`:
      return "paint";
    case $location`The Stately Pleasure Dome`:
      return "paradise";
    case $location`The Spooky Forest`:
      return "rawhide";
    case $location`The Brinier Deepers`:
      return "rock";
    case $location`The Briny Deeps`:
      return "salt";
    case $location`Noob Cave`:
      return "sandalwood";
    case $location`Cobb's Knob Kitchens`:
      return "sausage";
    case $location`The Hole in the Sky`:
      return "space";
    case $location`The Copperhead Club`:
      return "squash";
    case $location`The Caliginous Abyss`:
      return "squamous";
    case $location`The VERY Unquiet Garves`:
      return "teeth";
    case $location`The Middle Chamber`:
      return "venom";
    case $location`The Dark Elbow of the Woods`:
      return "vitamins";
    case $location`The Dark Heart of the Woods`:
      return "wing";
    default:
      return "";
  }
}

export function auto_latteDropAvailable(l: Location): boolean {
  // obviously no latte drops are available if you don't HAVE a latte
  if (availableAmount($item`latte lovers member's mug`) === 0) {
    return false;
  }
  const latteDrop: string = auto_latteDropName(l);
  if (latteDrop === "") {
    return false;
  }
  return !containsText(get("latteUnlocks"), latteDrop);
}

export function auto_latteDropWanted(l: Location): boolean {
  return (
    auto_latteDropAvailable(l) &&
    !$locations`Noob Cave, The Haunted Boiler Room, The Arid\, Extra-Dry Desert`.includes(
      l,
    )
  );
}

function auto_latteTranslate(ingredient: string): string {
  switch (toLowerCase(ingredient)) {
    case "combat":
      return "wing";
    case "noncombat":
    case "noncom":
      return "ink";
    case "famxp":
      return "vitamins";
    case "exp":
      switch (myPrimestat()) {
        case $stat`Muscle`:
          return "vanilla";
        case $stat`Mysticality`:
          return "pumpkin";
        case $stat`Moxie`:
          return "cinnamon";
      }
      break;
    case "fam":
    case "weight":
    case "famweight":
      return "rawhide";
    case "prismatic":
    case "prism":
    case "pris":
      return "paint";
    case "meat":
      return "cajun";
    case "item":
      return "carrot";
  }
  return toLowerCase(ingredient);
}

function auto_latteRefill(
  want1: string,
  want2: string,
  want3: string,
  force: boolean,
): boolean {
  if (availableAmount($item`latte lovers member's mug`) === 0) {
    return false;
  }

  if (get("_latteRefillsUsed") >= 3) {
    return false;
  }
  // don't want to waste banishes
  if (!get("_latteBanishUsed") && !force) {
    return false;
  }

  const unlocked: string[] = splitString(get("latteUnlocks"), ",");

  want1 = auto_latteTranslate(want1);
  want2 = auto_latteTranslate(want2);
  want3 = auto_latteTranslate(want3);

  const wants: Map<number, string> = new Map();
  if (want1 !== "") {
    if (!unlocked.includes(want1)) {
      return false;
    }
    wants.set(wants.size, want1);
  }
  if (want2 !== "") {
    if (!unlocked.includes(want2)) {
      return false;
    }
    wants.set(wants.size, want2);
  }
  if (want3 !== "") {
    if (!unlocked.includes(want3)) {
      return false;
    }
    wants.set(wants.size, want3);
  }

  function haveWant(want: string): boolean {
    want = auto_latteTranslate(want);
    for (const [, s] of wants) {
      if (s === want) {
        return true;
      }
    }
    return false;
  }

  function tryAddWant(want: string): boolean {
    if (wants.size >= 3 || haveWant(want)) {
      return false;
    }
    want = auto_latteTranslate(want);
    if (!unlocked.includes(want)) {
      return false;
    }

    wants.set(wants.size, want);
    return true;
  }

  if (in_darkGyffte()) {
    tryAddWant("healing");
  }

  if (!haveWant("combat")) {
    tryAddWant("noncombat");
  }

  tryAddWant("item");
  tryAddWant("meat");

  if (myFamiliar() !== $familiar.none) {
    tryAddWant("famweight");
  }

  tryAddWant("exp");
  tryAddWant("grass");

  if (myFamiliar() !== $familiar.none) {
    tryAddWant("famxp");
  }
  // just to make sure we have at least 3 ingredients
  for (const want of ["pumpkin", "cinnamon", "vanilla"]) {
    tryAddWant(want);
  }

  if (wants.size < 3) {
    auto_abort(
      "Something went terribly wrong while trying to refill latte. Yikes!",
    );
  }

  cliExecute(
    `latte refill ${wants.get(0) ?? ""} ${wants.get(1) ?? ""} ${wants.get(2) ?? ""}`,
  );
  return true;
}

function auto_latteRefill$2(
  want1: string,
  want2: string,
  force: boolean,
): boolean {
  return auto_latteRefill(want1, want2, "", force);
}

export function auto_latteRefill$4(
  want1: string = "",
  force: boolean = false,
): boolean {
  return auto_latteRefill$2(want1, "", force);
}

export function auto_haveVotingBooth(): boolean {
  // is_unrestricted instead of auto_is_valid as the enchatments are usable in g lover.
  return (
    (get("_voteToday") || get("voteAlways")) &&
    isUnrestricted($item`voter registration form`)
  );
}

export function auto_voteSetup(
  candidate: number,
  first: number,
  second: number,
): boolean {
  if (candidate < 0 || candidate > 2) {
    return false;
  }
  if (first < 0 || first > 4) {
    return false;
  }
  if (second < 0 || second > 4) {
    return false;
  }
  if (first === second && first !== 0) {
    return false;
  }
  if (!auto_haveVotingBooth()) {
    return false;
  }
  if (get("_voteModifier") !== "") {
    return false;
  }
  if (possessEquipment($item`"I Voted!" sticker`)) {
    return false;
  }

  if (gitExists("Ezandora-Voting-Booth")) {
    cliExecute("VotingBooth.ash");
    return true;
  }

  if (candidate === 0) {
    candidate = 1 + random(2);
  }
  while (first === 0 || first === second) {
    first = 1 + random(4);
  }
  while (second === 0 || first === second) {
    second = 1 + random(4);
  }
  //When using random, should we check for negative initiatives?

  visitUrl("place.php?whichplace=town_right&action=townright_vote", false);
  visitUrl(
    `choice.php?whichchoice=1331&pwd=&option=1&g=${candidate}&local[]=${first}&local[]=${second}`,
  );
  return true;
}

export function auto_voteMonster(
  freeMon: boolean = false,
  loc: Location = $location.none,
): boolean {
  if (!auto_haveVotingBooth()) {
    return false;
  }
  if (get("_voteModifier") === "") {
    return false;
  }
  //Some things override this, like a semi-rare?

  if (get("lastVoteMonsterTurn") >= totalTurnsPlayed()) {
    return false;
  }
  if (totalTurnsPlayed() % 11 !== 1) {
    return false;
  }
  // is_unrestricted instead of auto_is_valid as the monsters can be encountered in g-lover
  if (
    !possessEquipment($item`"I Voted!" sticker`) ||
    !isUnrestricted($item`"I Voted!" sticker`)
  ) {
    return false;
  }

  if (freeMon && get("_voteFreeFights") >= 3) {
    return false;
  }

  if (loc === $location.none) {
    return true;
  }

  if (autoEquipToSlot($slot`acc3`, $item`"I Voted!" sticker`)) {
    set("auto_nextEncounter", safeGet("_voteMonster").toString());
    return autoAdv(loc);
  }
  set("auto_nextEncounter", "");
  return false;
}

export function fightClubNap(): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareNap")) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  visitUrl("choice.php?pwd=&whichchoice=1334&option=1");

  if (!get("_daycareNap")) {
    auto_abort("fightClubtracking failed");
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}

function fightClubSpa(): boolean {
  let option: number = 4;
  let st: Stat = myPrimestat();
  if (in_plumber()) {
    // We deal 250% of our Moxie, so if our Muscle is too high we... die.
    st = $stat`Moxie`;
  }
  switch (st) {
    case $stat`Muscle`:
      option = 1;
      break;
    case $stat`Mysticality`:
      option = 3;
      break;
    case $stat`Moxie`:
      option = 2;
      break;
  }
  return fightClubSpa$2(option);
}

export function fightClubSpa$1(eff: Effect): boolean {
  let option: number = 0;

  switch (eff) {
    case $effect`Muddled`:
      option = 1;
      break;
    case $effect`Ten out of Ten`:
      option = 2;
      break;
    case $effect`Uncucumbered`:
      option = 3;
      break;
    case $effect`Flagrantly Fragrant`:
      option = 4;
      break;
  }

  if (option === 0) {
    return false;
  }
  return fightClubSpa$2(option);
}

function fightClubSpa$2(option: number): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareSpa")) {
    return false;
  }
  if (option === 0) {
    option = 1 + random(4);
  }
  if (option < 1 || option > 4) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  visitUrl("choice.php?pwd=&whichchoice=1334&option=2");
  visitUrl(`choice.php?pwd=&whichchoice=1335&option=${option}`);

  if (!get("_daycareSpa")) {
    auto_abort("fightClubtracking failed");
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}

export function fightClubStats(): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareGymScavenges") > 0) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  // Enter the Boxing Daycare
  visitUrl("choice.php?pwd=&whichchoice=1334&option=3");
  // Scavenge for gym equipment
  visitUrl("choice.php?pwd=&whichchoice=1336&option=2");

  if (get("_daycareGymScavenges") !== 1) {
    // Seems like we can't trust KoLmafia to set this for us
    // auto_abort("fightClubtracking failed");
    set("_daycareGymScavenges", 1);
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}
