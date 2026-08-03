import {
  abort,
  buy,
  canAdventure,
  canInteract,
  ceil,
  cliExecute,
  containsText,
  creatableAmount,
  create,
  equip,
  equippedItem,
  getOutfits,
  getProperty,
  getWorkshed,
  guildStoreAvailable,
  handlingChoice,
  haveEffect,
  inHardcore,
  isBanished,
  Item,
  itemAmount,
  knollAvailable,
  lastChoice,
  Location,
  min,
  mpCost,
  myAdventures,
  myAscensions,
  myBasestat,
  myBuffedstat,
  myDaycount,
  myLevel,
  myMeat,
  myMp,
  myPrimestat,
  mySign,
  npcPrice,
  outfit,
  outfitPieces,
  Phylum,
  runTurn,
  storageAmount,
  toLowerCase,
  toPhylum,
  use,
  useSkill,
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
  $phylum,
  $skill,
  $slot,
  $stat,
  get,
  set,
} from "libram";

import { auto_advToReserve, LX_doVacation } from "../../autoscend";
import { auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv, autoAdvBypass$1 } from "../auto_adventure";
import {
  autoEquipToSlot,
  autoOutfit,
  equipStatgainIncreasers$1,
  possessEquipment,
  possessOutfit,
} from "../auto_equipment";
import {
  canChangeToFamiliar,
  handleFamiliar$1,
  wantCubeling,
} from "../auto_familiar";
import { disregardInstantKarma, isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_combat_appearance_rates$1,
  auto_have_skill,
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
  auto_recipeIngredients,
  auto_runChoice,
  auto_turbo,
  canSummonMonster,
  have_workshed,
  haveCampgroundMaid,
  inKnollSign,
  internalQuestStatus,
  isArmoryAvailable,
  isDesertAvailable,
  isGeneralStoreAvailable,
  meatReserve,
  summonMonster,
} from "../auto_util";
import { zone_isAvailable } from "../auto_zone";
import { auto_canUse } from "../combat/auto_combat_util";
import {
  DesiredDrop,
  DesiredFights,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import {
  acquiredFantasyRealmToken,
  fantasyBanditsFought,
  fantasyRealmToken,
} from "../iotms/mr2018";
import {
  auto_backupUsesLeft,
  auto_fireExtinguisherCharges,
  auto_haveBackupCamera,
} from "../iotms/mr2021";
import { dronesOut } from "../iotms/mr2022";
import { auto_canHabitat, auto_haveCCSC } from "../iotms/mr2023";
import { auto_canTracesBandit, auto_tracesUsesLeft } from "../iotms/mr2025";
import {
  ed_DelayNC_DailyDungeon,
  edUnderworldChoiceHandler,
} from "../paths/actually_ed_the_undying";
import { in_bhy } from "../paths/bees_hate_you";
import { bat_reallyPickSkills } from "../paths/dark_gyffte";
import { gnoob_startAscension } from "../paths/gelatinous_noob";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_plumber } from "../paths/path_of_the_plumber";
import { picky_startAscension } from "../paths/picky";
import { in_quantumTerrarium } from "../paths/quantum_terrarium";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { L6_friarsGetParts } from "./level_06";
import { L8_trapperQuest } from "./level_08";
import {
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
  prepareForTwinPeak,
} from "./level_09";
import { L10_basement, L10_holeInTheSkyUnlock, L10_topFloor } from "./level_10";
import {
  L11_getBeehive,
  L11_hiddenCity,
  L11_mauriceSpookyraven,
  L11_needTombRatchet,
  LX_getLadySpookyravensPowderPuff,
  LX_unlockHauntedLibrary,
  LX_unlockManorSecondFloor,
} from "./level_11";
import {
  get8BitFatLootToken,
  LX_getDigitalKeyTask,
  LX_getStarKeyTask,
  needStarKey,
  towerKeyCount,
} from "./level_13";

// This file should contain functions for adventuring which are not related to any of the council quests nor any "optional" quests.

//Defined in autoscend/quests/level_any.ash
export function LX_handleIntroAdventures(): void {
  // This function simply handles the "intro" adventures many challenge paths have upon a new ascension.
  // Handling these in this manner allows us to sidestep potential mafia issues related to parsing of status
  if (handlingChoice()) {
    const choice: number = lastChoice();

    if (995 === choice) {
      // 995 is "Being Picky", intro for Picky (Winter 2014 challenge path).
      picky_startAscension();
    }

    if (1023 === choice) {
      // 1023 is "Like a Bat Into Hell" where Actually Ed enters the Underworld when losing combat
      // It is conceivable that we could be stuck in this when the script is (re)started if we lost the previous combat.
      edUnderworldChoiceHandler(choice);
    }

    if (1230 === choice) {
      // 1230 is "Welcome to the Kingdom, Gelatinous Noob", intro for Gelatinous Noob (Spring 2017 challenge path).
      // TODO: This should be refactored to use the choiceAdventureScript instead of this terrible hack.
      visitUrl("main.php");
      const page: string = visitUrl("api.php?what=status&for=4", false);
      gnoob_startAscension(page);
    }

    if (1342 === choice) {
      // 1342 is "Torpor", the non-combat Vampyre ends up in when losing combat or resting at campground.
      // It is conceivable that we could be stuck in this when the script is (re)started if we lost the previous combat.
      auto_log_info(
        "Torporing, since I think we're already in torpor.",
        "blue",
      );
      bat_reallyPickSkills(20);
    }

    if (1343 === choice) {
      // 1343 is "Intro: View of a Vampire", intro for Dark Gyffte (Spring 2019 challenge path).
      auto_runChoice(1);
      bat_reallyPickSkills(20);
    }

    if ([1495].includes(choice)) {
      // 1495 is "Into the Shadows", intro for Avatar of Shadows Over Loathing (Spring 2023 challenge path).
      // These intros have "meaningful" choices with respect to the run so we don't want to handle them automatically and will intentionally abort here.
      abort(
        "You are stuck in an intro adventure which requires you to choose a path. I suggest you do so before trying to run autoscend and you may have better results.",
      );
    }

    if (
      [
        1046, 1405, 1416, 1419, 1446, 1450, 1464, 1480, 1503, 1507, 1519, 1531,
        1552, 1559,
      ].includes(choice)
    ) {
      // 1046 is "Actually Ed the Undying", intro for Actually Ed the Undying (Spring 2015 challenge path).
      // 1405 is "Let's, uh, go!", intro for Path of the Plumber (Spring 2020 challenge path).
      // 1416 is "Low-Key Summer", intro for Low-Key Summer (Summer 2020 challenge path).
      // 1419 is "Grey Sky Morning", intro for Grey Goo (Fall 2020 challenge path).
      // 1446 is "You, Robot", intro for You, Robot (Spring 2021 challenge path).
      // 1450 is "Wildfire!", intro for Wildfire (Fall 2021 challenge path).
      // 1464 is "Your Friend Goo", intro for Grey You (Spring 2022 challenge path).
      // 1480 is "Fall of the Dinosaurs", intro for Fall of the Dinosaurs (Fall 2022 challenge path).
      // 1503 is "Starting Your Legacy", intro for Legacy of Loathing (Summer 2023 challenge path).
      // 1507 is "Jumbled in the Bungle", intro for A Shrunken Adventurer am I (Fall 2023 challenge path).
      // 1519 is "The coffee was *gasp* decaf!", intro for WereProfessor (Spring 2024 challenge path).
      // 1531 is "A-1 Sound and the Sound's So Suardin'", intro for Avant Guard (Fall 2024 challenge path).
      // 1552 is "Zoonopeia", intro for Z is for Zootomist (Spring 2025 challenge path).
      // 1559 is "Hat Trick!", intro for Hat Trick (Summer 2025 challenge path).
      // yes they really phoned some of the titles of these in.
      auto_runChoice(1);
    }
  }
}

export function LX_bitchinMeatcar_condition(): boolean {
  return knollAvailable() && get("auto_spoonconfirmed", 0) === myAscensions();
}

function LX_bitchinMeatcarDo(): boolean {
  //calculate meat costs of building your meatcar.
  //if player manually partially assembled it then it will work, just think it costs slightly more meat than it actually does
  let meatRequired: number = 0;
  if (knollAvailable()) {
    if (itemAmount($item`meat stack`) === 0) {
      meatRequired += 100;
    }
    for (const it of $items`spring, sprocket, cog, empty meat tank, tires, sweet rims`) {
      if (itemAmount(it) === 0) {
        meatRequired += npcPrice(it);
      }
    }
  }
  if (!knollAvailable()) {
    //outside of knollsign you need to pay 70 meat for the meatpaste and buy [sweet rims]
    meatRequired = 70 + npcPrice($item`sweet rims`);
  }

  if (creatableAmount($item`bitchin' meatcar`) > 0) {
    return create(1, $item`bitchin' meatcar`);
  } else if (myMeat() < meatRequired) {
    auto_log_info(
      "I do not have enough meat to build a meatcar... doing something else",
      "red",
    );
    return false;
  }

  if (
    itemAmount($item`Gnollish toolbox`) > 0 &&
    auto_is_valid($item`Gnollish toolbox`)
  ) {
    if (use(1, $item`Gnollish toolbox`)) {
      return true;
    }
  }

  let enginePartsMissing: number = 0;
  for (const it of $items`spring, sprocket, cog, empty meat tank`) {
    if (itemAmount(it) === 0) {
      enginePartsMissing += 1;
    }
  }
  if (
    itemAmount($item`tires`) > 0 &&
    enginePartsMissing >= 4 &&
    (auto_combat_appearance_rates$1($location`The Degrassi Knoll Garage`).get(
      $monster`Gnollish Gearhead`,
    ) ??
      auto_combat_appearance_rates$1($location`The Degrassi Knoll Garage`)
        .set($monster`Gnollish Gearhead`, 0.0)
        .get($monster`Gnollish Gearhead`)) < 77.0
  ) {
    //all parts of the engine are missing and would take a while to acquire from lootboxes at normal appearance rates
    if (pullXWhenHaveY($item`meat engine`, 1, 0)) {
      auto_log_info(
        "Already have tires, better skip the toolbox gacha",
        "blue",
      );
      return true;
    }
  }
  //if you reached this point then it means you need to spend adventures to acquire more parts
  auto_log_info("Farming for a Bitchin' Meatcar", "blue");
  //start untinker quest if possible to gain access to hostile dgrassi knoll
  if (getProperty("questM01Untinker") === "unstarted") {
    visitUrl(
      "place.php?whichplace=forestvillage&preaction=screwquest&action=fv_untinker_quest",
    );
  }
  //attempt to adventure in degrassi knoll garage, if failed attempt to unlock it via guild
  if (autoAdv($location`The Degrassi Knoll Garage`)) {
    return true;
  } else if (guildStoreAvailable()) {
    visitUrl("guild.php?place=paco");
    return true;
  }
  //could not adventure in degrassi knoll garage and could not unlock it. you are probably too early in the run and need to come back to it later.
  return false;
}

const LX_bitchinMeatcarTask: QuestTask = registerQuestTask({
  name: "LX_bitchinMeatcar",
  completed: () =>
    isDesertAvailable() || itemAmount($item`bitchin' meatcar`) > 0,
  ready: () =>
    itemAmount($item`bitchin' meatcar`) === 0 &&
    //it is impossible to make a meatcar in this combo of path and signs.
    !(in_bhy() && !inKnollSign()) &&
    LX_bitchinMeatcar_condition(),
  do: LX_bitchinMeatcarDo,
  locations: $location`The Degrassi Knoll Garage`,
  desiredEncounters: () => {
    return [...auto_recipeIngredients($item`bitchin' meatcar`, true)]
      .map(([i, amount]) => ({ item: i, needAmount: amount }))
      .filter((a) => a.needAmount > 0);
  },
});

export function LX_bitchinMeatcar(): boolean {
  return runQuestTask(LX_bitchinMeatcarTask);
}

function LX_unlockDesertDo(): boolean {
  if (in_nuclear()) {
    if (isAboutToPowerlevel()) {
      auto_log_info(
        "We ran out of things to do. Trying to prematurely unlock Desert",
        "blue",
      );
    } else {
      auto_log_info(
        "In Nuclear Autumn you get a free desert pass at level 11. skipping unlocking it for now",
        "blue",
      );
      return false;
    }
  }

  if (in_bhy() && !inKnollSign()) {
    //it is impossible to make a meatcar in this combo of path and signs.
    return LX_desertAlternate(); //so buying a bus ticket is the only possible way to unlock the desert for this combo
  }
  //knollsign lets you buy the meatcar for less meat than a desert pass without spending any adv.
  if (inKnollSign()) {
    return LX_bitchinMeatcar();
  }
  //if wealthy enough just buy the desert pass outright instead of spending adventures.
  if (
    myMeat() >= npcPrice($item`Desert Bus pass`) + 1000 &&
    isGeneralStoreAvailable()
  ) {
    auto_log_info(
      "We're rich, let's take the bus instead of building a car.",
      "blue",
    );
    auto_buyUpTo(1, $item`Desert Bus pass`);
    if (itemAmount($item`Desert Bus pass`) > 0) {
      return true;
    }
  }
  //plumbers should wait until they are rich enough to buy the desert pass. As they have few uses for meat.
  if (in_plumber() && !isAboutToPowerlevel()) {
    auto_log_info(
      "Plumbers have few uses for meat. Delaying desert unlock until we can buy a pass.",
      "blue",
    );
    return false;
  }
  //spend adv to unlock the desert
  return LX_bitchinMeatcar();
}

export const LX_unlockDesertTask: QuestTask = registerQuestTask({
  name: "LX_unlockDesert",
  completed: () => isDesertAvailable(),
  ready: () => !isDesertAvailable(),
  do: LX_unlockDesertDo,
});

export function LX_unlockDesert(): boolean {
  return runQuestTask(LX_unlockDesertTask);
}

function LX_desertAlternate(): boolean {
  if (in_nuclear()) {
    return LX_hippyBoatman();
  }
  if (get("lastDesertUnlock") === myAscensions()) {
    return false;
  }
  if (knollAvailable()) {
    return false;
  }
  if (
    myMeat() >= npcPrice($item`Desert Bus pass`) &&
    isGeneralStoreAvailable()
  ) {
    auto_buyUpTo(1, $item`Desert Bus pass`);
    if (itemAmount($item`Desert Bus pass`) > 0) {
      return true;
    }
  }
  return false;
}

function LX_islandAccessDo(): boolean {
  if (in_lowkeysummer()) {
    return LX_hippyBoatman();
  }

  if (
    get("lastIslandUnlock") < myAscensions() &&
    itemAmount($item`pirate dinghy`) > 0 &&
    !get("_pirateDinghyUsed")
  ) {
    use(1, $item`pirate dinghy`);
    return true;
  }

  if (
    itemAmount($item`Shore Inc. Ship Trip Scrip`) >= 3 &&
    get("lastIslandUnlock") !== myAscensions() &&
    myMeat() >= npcPrice($item`dingy planks`) &&
    isGeneralStoreAvailable()
  ) {
    cliExecute("make dinghy plans");
    auto_buyUpTo(1, $item`dingy planks`);
    use(1, $item`dinghy plans`);
    return true;
  }

  if (
    itemAmount($item`dingy dinghy`) > 0 ||
    get("lastIslandUnlock") === myAscensions()
  ) {
    if (get("lastIslandUnlock") === myAscensions()) {
      let reallyUnlocked: boolean = false;
      for (const it of $items`dingy dinghy, skeletal skiff, yellow submarine, pirate dinghy`) {
        if (itemAmount(it) > 0) {
          reallyUnlocked = true;
        }
      }
      if (getProperty("peteMotorbikeGasTank") === "Extra-Buoyant Tank") {
        reallyUnlocked = true;
      }
      if (internalQuestStatus("questM19Hippy") >= 3) {
        reallyUnlocked = true;
      }
      if (!reallyUnlocked) {
        auto_log_warning(
          "lastIslandUnlock is incorrect, you have no way to get to the Island. Unless you barrel smashed when that was allowed. Did you barrel smash? Well, correcting....",
          "red",
        );
        set("lastIslandUnlock", myAscensions() - 1);
        return true;
      }
    }
    return false;
  }

  if (!isDesertAvailable() || !isGeneralStoreAvailable()) {
    return LX_desertAlternate();
  }

  if (myAdventures() <= 9 || myMeat() < 1900) {
    return false;
  }

  auto_log_info("At the shore, la de da!", "blue");
  if (itemAmount($item`dinghy plans`) > 0) {
    abort("Dude, we got Dinghy Plans... we should not be here....");
  }
  while (
    itemAmount($item`Shore Inc. Ship Trip Scrip`) < 3 &&
    itemAmount($item`dinghy plans`) === 0
  ) {
    if (!LX_doVacation()) {
      //tries to vacation and if fails it will break the loop
      break;
    }
  }
  if (itemAmount($item`Shore Inc. Ship Trip Scrip`) < 3) {
    auto_log_warning(
      "Failed to get enough Shore Scrip for some raisin, continuing...",
      "red",
    );
    return false;
  }

  if (
    myMeat() >= npcPrice($item`dingy planks`) &&
    itemAmount($item`dinghy plans`) === 0 &&
    isGeneralStoreAvailable()
  ) {
    cliExecute("make dinghy plans");
    auto_buyUpTo(1, $item`dingy planks`);
    use(1, $item`dinghy plans`);
    return true;
  }
  return false;
}

export const LX_islandAccessTask: QuestTask = registerQuestTask({
  name: "LX_islandAccess",
  completed: () => false,
  ready: () => !in_koe(),
  do: LX_islandAccessDo,
});

export function LX_islandAccess(): boolean {
  return runQuestTask(LX_islandAccessTask);
}

function startHippyBoatmanSubQuestDo(): boolean {
  visitUrl("place.php?whichplace=woods&action=woods_smokesignals");
  visitUrl("choice.php?pwd=&whichchoice=798&option=1");
  visitUrl("choice.php?pwd=&whichchoice=798&option=2");
  visitUrl("woods.php");
  return true;
}

export const startHippyBoatmanSubQuestTask: QuestTask = registerQuestTask({
  name: "startHippyBoatmanSubQuest",
  completed: () => getProperty("questM19Hippy") !== "unstarted" || in_koe(),
  ready: () =>
    myBasestat(myPrimestat()) >= 25 &&
    getProperty("questM19Hippy") === "unstarted" &&
    !in_koe(),
  do: startHippyBoatmanSubQuestDo,
});

export function startHippyBoatmanSubQuest(): boolean {
  return runQuestTask(startHippyBoatmanSubQuestTask);
}

function LX_hippyBoatmanDo(): boolean {
  if (internalQuestStatus("questM19Hippy") < 0) {
    startHippyBoatmanSubQuest();

    if (internalQuestStatus("questM19Hippy") < 0) {
      abort("Failed to unlock The Old Landfill. Not sure what to do now...");
    }
    return true;
  }

  if (
    itemAmount($item`old claw-foot bathtub`) > 0 &&
    itemAmount($item`old clothesline pole`) > 0 &&
    itemAmount($item`antique cigar sign`) > 0 &&
    itemAmount($item`Worse Homes and Gardens`) > 0
  ) {
    create(1, $item`junk junk`);
    visitUrl("place.php?whichplace=woods&action=woods_hippy");
    if (internalQuestStatus("questM19Hippy") > 3) {
      return true;
    }
    abort(
      "Failed to create the junk junk or finish the quest for some reason!",
    );
  }

  return autoAdv($location`The Old Landfill`);
}

const LX_hippyBoatmanTask: QuestTask = registerQuestTask({
  name: "LX_hippyBoatman",
  completed: () =>
    get("lastIslandUnlock") >= myAscensions() ||
    internalQuestStatus("questM19Hippy") > 3,
  ready: () =>
    itemAmount($item`junk junk`) === 0 &&
    internalQuestStatus("questM19Hippy") <= 3 &&
    myBasestat(myPrimestat()) >= 25,
  do: LX_hippyBoatmanDo,
  locations: $location`The Old Landfill`,
  desiredEncounters: () =>
    itemAmount($item`junk junk`) > 0
      ? []
      : $items`old claw-foot bathtub, old clothesline pole, antique cigar sign, Worse Homes and Gardens`
          .map((it) => ({ item: it, needAmount: 1 - itemAmount(it) }))
          .filter((a) => a.needAmount > 0),
});

export function LX_hippyBoatman(): boolean {
  return runQuestTask(LX_hippyBoatmanTask);
}

export function oldLandfillChoiceHandler(choice: number): void {
  if (choice === 794) {
    // Once More Unto the Junk
    if (itemAmount($item`junk junk`) === 0) {
      if (itemAmount($item`old claw-foot bathtub`) === 0) {
        auto_runChoice(1); // go to The Bathroom of Ten Men (#795)
      } else if (itemAmount($item`old clothesline pole`) === 0) {
        auto_runChoice(2); // go to The Den of Iquity (#796)
      } else if (itemAmount($item`antique cigar sign`) === 0) {
        auto_runChoice(3); // go to Let's Workshop This a Little (#797)
      } else {
        auto_runChoice(1); // go to The Bathroom of Ten Men (#795)
      }
    } else {
      // TODO: Add handling to get the eternal car battery
      // doesn't look like there's mafia tracking for it yet.
      if (itemAmount($item`tangle of copper wire`) === 0) {
        auto_runChoice(2); // go to The Den of Iquity (#796)
      } else if (itemAmount($item`Junk-Bond`) === 0) {
        auto_runChoice(3); // go to Let's Workshop This a Little (#797)
      } else {
        auto_runChoice(1); // go to The Bathroom of Ten Men (#795)
      }
    }
  } else if (choice === 795) {
    // The Bathroom of Ten Men
    if (itemAmount($item`old claw-foot bathtub`) === 0) {
      auto_runChoice(1); // get old claw-foot bathtub
    } else {
      auto_runChoice(2); // fight a random enemy from the zone
    }
  } else if (choice === 796) {
    // The Den of Iquity
    if (itemAmount($item`old clothesline pole`) === 0) {
      auto_runChoice(2); // get old clothesline pole
    } else {
      auto_runChoice(3); // get tangle of copper wire
    }
  } else if (choice === 797) {
    // Let's Workshop This a Little
    if (itemAmount($item`antique cigar sign`) === 0) {
      auto_runChoice(3); // get antique cigar sign
    } else {
      auto_runChoice(1); // get Junk-Bond
    }
  } else {
    abort("unhandled choice in oldLandfillChoiceHandler");
  }
}

function LX_lockPickingDo(): boolean {
  // As of r20114, this choice does not work in choice adventure script
  if (itemAmount($item`Boris's key`) === 0) {
    set("choiceAdventure1414", 1);
  } else if (itemAmount($item`Jarlsberg's key`) === 0) {
    set("choiceAdventure1414", 2);
  } else if (itemAmount($item`Sneaky Pete's key`) === 0) {
    set("choiceAdventure1414", 3);
  }

  useSkill(1, $skill`Lock Picking`);
  runTurn();
  return get("lockPicked");
}

export const LX_lockPickingTask: QuestTask = registerQuestTask({
  name: "LX_lockPicking",
  completed: () => towerKeyCount(false) >= 3,
  ready: () =>
    auto_have_skill($skill`Lock Picking`) &&
    !get("lockPicked") &&
    towerKeyCount(false) < 3 &&
    myMp() >= mpCost($skill`Lock Picking`),
  do: LX_lockPickingDo,
});

export function LX_lockPicking(): boolean {
  return runQuestTask(LX_lockPickingTask);
}

export function estimateDailyDungeonAdvNeeded(): number {
  //estimates the amount of adventures we expect to need to do the daily dungeon. the result is only an estimate and not exact.
  //uses your current tools rather than potential tools. so it does not account for the possibility of pulling something or getting a cubeling drop.

  const progress: number = get("_lastDailyDungeonRoom");
  let adv_needed: number = 15 - progress;
  if (progress < 5) {
    adv_needed = adv_needed - 2;
    if (possessEquipment($item`ring of Detect Boring Doors`)) {
      adv_needed = adv_needed - 4;
    }
  } else if (progress < 10) {
    adv_needed = adv_needed - 1;
    if (possessEquipment($item`ring of Detect Boring Doors`)) {
      adv_needed = adv_needed - 2;
    }
  }

  let random_NC_tool_count: number = 0;
  if (itemAmount($item`eleven-foot pole`) > 0) {
    random_NC_tool_count++;
  }
  if (
    itemAmount($item`Platinum Yendorian Express Card`) > 0 ||
    itemAmount($item`Pick-O-Matic lockpicks`) > 0 ||
    creatableAmount($item`skeleton key`) + itemAmount($item`skeleton key`) > 2
  ) {
    random_NC_tool_count++;
  }

  if (random_NC_tool_count > 0) {
    adv_needed = adv_needed / (1 + random_NC_tool_count);
  }

  return adv_needed;
}

function LX_wantSummonFantasyBandit(): boolean {
  return (
    towerKeyCount(false) < 3 &&
    (internalQuestStatus("questL13Final") === 5 || auto_turbo()) &&
    !acquiredFantasyRealmToken() &&
    ((auto_haveBackupCamera() &&
      auto_backupUsesLeft() >= 4 - fantasyBanditsFought()) ||
      auto_canHabitat() ||
      (auto_canTracesBandit() &&
        auto_tracesUsesLeft() >= 4 - fantasyBanditsFought())) &&
    canSummonMonster($monster`fantasy bandit`)
  );
}

function LX_fatLootTokenDo(): boolean {
  if (!canChangeToFamiliar($familiar`Gelatinous Cubeling`) && inHardcore()) {
    //if unable to get the daily dungeon tools then prefer to do fantasy realm over daily dungeon
    if (fantasyRealmToken()) {
      return true;
    }
  }
  if (LX_dailyDungeonToken()) {
    return true;
  }
  if (get("dailyDungeonDone") && myDaycount() > 1) {
    //wait until daily dungeon is done before considering doing fantasy realm
    if (fantasyRealmToken()) {
      return true;
    }
  }
  if (
    towerKeyCount(false) < 3 &&
    (internalQuestStatus("questL13Final") === 5 || auto_turbo())
  ) {
    if (LX_wantSummonFantasyBandit()) {
      return summonMonster($monster`fantasy bandit`);
    }
    // todo, add pref for 8bit token already being bought once mafia supports it
    if (towerKeyCount() === 2) {
      // get last fat loot token from 8-bit realm
      // save until actually needed as takes many turns
      return get8BitFatLootToken();
    }
  }

  return false;
}

export const LX_fatLootTokenTask: QuestTask = registerQuestTask({
  name: "LX_fatLootToken",
  completed: () => false,
  //have enough tokens
  ready: () =>
    !(towerKeyCount(false) >= 3 && !get("auto_forceFatLootToken", false)),
  do: LX_fatLootTokenDo,
  reqAdventures: () => (LX_wantSummonFantasyBandit() ? 5 : 0),
  desiredEncounters: () => {
    if (!LX_wantSummonFantasyBandit()) return [];

    return [
      {
        monster: $monster`fantasy bandit`,
        needAmount: 5 - fantasyBanditsFought(),
      },
    ].filter((a) => a.needAmount > 0);
  },
});

export function LX_fatLootToken(): boolean {
  return runQuestTask(LX_fatLootTokenTask);
}

export function useTonicDjinn(): void {
  //configure and use Tonic Djinn if one was found in the daily dungeon
  if (
    itemAmount($item`tonic djinn`) > 0 &&
    !get("_tonicDjinn") &&
    auto_is_valid($item`tonic djinn`)
  ) {
    if (myMeat() < 500 + meatReserve()) {
      set("choiceAdventure778", "1"); // Wealth!
    } else if (disregardInstantKarma()) {
      if (myPrimestat() === $stat`Muscle`) {
        set("choiceAdventure778", "2");
        equipStatgainIncreasers$1($stat`Muscle`, false); // Strength!
      } else if (myPrimestat() === $stat`Mysticality`) {
        set("choiceAdventure778", "3");
        equipStatgainIncreasers$1($stat`Mysticality`, false); // Wisdom!
      } else {
        set("choiceAdventure778", "4");
        equipStatgainIncreasers$1($stat`Moxie`, false); // Panache!
      }
    } else {
      set("choiceAdventure778", "1"); // Wealth!
    }
    use(1, $item`tonic djinn`);
  }
}

function LX_dailyDungeonToken(): boolean {
  if (get("dailyDungeonDone")) {
    return false; // already done today
  }
  if (wantCubeling()) {
    return false; //can switch to cubeling so wait until we have all the tool drops before doing daily dungeon
  }

  let needPole: boolean = true;
  if (auto_haveCCSC()) {
    needPole = false; // candy cane sword cane can act as an eleven-foot pole so don't buy if we already have it
  }

  if (canInteract()) {
    //if you can not use cubeling then mallbuy missing tools in casual and postronin
    if (needPole) {
      auto_buyUpTo(1, $item`eleven-foot pole`);
    }
    auto_buyUpTo(1, $item`Pick-O-Matic lockpicks`);
    if (!possessEquipment($item`ring of Detect Boring Doors`)) {
      //do not buy a second one if already equipped
      auto_buyUpTo(1, $item`ring of Detect Boring Doors`);
    }
  }
  //if you can not use the cubeling then pull the missing tools if possible
  if (needPole) {
    // don't need the Eleven-foot Pole if we have the Candy Cane Sword Cane as it adds turn free NCs.
    pullXWhenHaveY($item`eleven-foot pole`, 1, 0);
  }
  if (!possessEquipment($item`ring of Detect Boring Doors`)) {
    //do not pull a second one if already equipped
    pullXWhenHaveY($item`ring of Detect Boring Doors`, 1, 0);
  }
  if (
    itemAmount($item`Pick-O-Matic lockpicks`) === 0 &&
    storageAmount($item`Platinum Yendorian Express Card`) > 0
  ) {
    pullXWhenHaveY($item`Platinum Yendorian Express Card`, 1, 0);
  }
  if (itemAmount($item`Platinum Yendorian Express Card`) === 0) {
    pullXWhenHaveY($item`Pick-O-Matic lockpicks`, 1, 0);
  }
  //if you do not have an unlimited lockpick then handle skeleton keys and verify primary stat
  if (
    itemAmount($item`Platinum Yendorian Express Card`) === 0 &&
    itemAmount($item`Pick-O-Matic lockpicks`) === 0
  ) {
    let skeleton_key_amt_needed: number = 2;
    if (
      containsText(
        getProperty("nsTowerDoorKeysUsed"),
        $item`skeleton key`.toString(),
      )
    ) {
      skeleton_key_amt_needed--;
    }

    let skeleton_key_amt_to_create: number =
      skeleton_key_amt_needed - itemAmount($item`skeleton key`);
    skeleton_key_amt_to_create = min(
      creatableAmount($item`skeleton key`),
      skeleton_key_amt_to_create,
    );
    if (skeleton_key_amt_to_create > 0) {
      create(skeleton_key_amt_to_create, $item`skeleton key`);
    }
    //make sure we have the means to handle choice adventure 692 [I Wanna Be a Door]
    if (
      itemAmount($item`skeleton key`) < skeleton_key_amt_needed &&
      myBasestat(myPrimestat()) < 30
    ) {
      //no lockpick, not enough skeleton key, and not enough primestat.
      //checking basestat because buffed can become lower based on equipment worn. and also if mainstat is under 30 and you got no lockpicks then you should probably delay daily dungeon
      return false;
    }
  }

  if (ed_DelayNC_DailyDungeon()) {
    return false;
  }

  useTonicDjinn();
  // make sure we have enough adventures. since partial completion means wasted adventures.
  const adv_budget: number = myAdventures() - auto_advToReserve();
  if (adv_budget < 1 + ceil(estimateDailyDungeonAdvNeeded())) {
    return false; //not enough adv
  }

  auto_log_info("Doing the daily dungeon", "blue");

  if (
    get("_lastDailyDungeonRoom") === 4 ||
    get("_lastDailyDungeonRoom") === 9
  ) {
    autoEquipToSlot($slot`acc3`, $item`ring of Detect Boring Doors`);
  }

  return autoAdv($location`The Daily Dungeon`);
}

export function dailyDungeonChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  //noncombat choices handler for daily dungeon.

  switch (choice) {
    case 689: // The Final Reward (Daily Dungeon 15th room)
      auto_runChoice(1); // Get fat loot token

      break;
    case 690: // The First Chest Isn't the Deepest. (Daily Dungeon 5th room)
    case 691: // Second Chest (Daily Dungeon 10th room)
      if (options.has(4)) {
        auto_runChoice(4); // Get a fat loot token with your Candy Cane Sword Cane
        if (options.has(2)) {
          auto_runChoice(2); // skip 3 rooms using ring of Detect Boring Doors
        } else {
          auto_runChoice(3); // skip 1 room
        }
      } else if (options.has(2)) {
        auto_runChoice(2); // skip 3 rooms using ring of Detect Boring Doors
      } else {
        auto_runChoice(3); // skip 1 room
      }
      break;
    case 692: // I Wanna Be a Door (Daily Dungeon)
      if (options.has(3)) {
        auto_runChoice(3); // use [Pick-O-Matic Lockpicks] to skip
      } else if (options.has(7)) {
        auto_runChoice(7); // use [Platinum Yendorian Express Card] to skip
      } else if (
        itemAmount($item`skeleton key`) > 1 ||
        (itemAmount($item`skeleton key`) > 0 &&
          containsText(
            getProperty("nsTowerDoorKeysUsed"),
            $item`skeleton key`.toString(),
          ))
      ) {
        auto_runChoice(2); // use [Skeleton Key] to skip
      } else if (
        myPrimestat() === $stat`Muscle` &&
        myBuffedstat($stat`Muscle`) >= 30
      ) {
        auto_runChoice(4); // spend adv and not guarenteed to work
      } else if (
        myPrimestat() === $stat`Mysticality` &&
        myBuffedstat($stat`Mysticality`) >= 30
      ) {
        auto_runChoice(5); // spend adv and not guarenteed to work
      } else if (
        myPrimestat() === $stat`Moxie` &&
        myBuffedstat($stat`Moxie`) >= 30
      ) {
        auto_runChoice(6); // spend adv and not guarenteed to work
      } else {
        abort(
          "I made an error and tried to adventure in the daily dungeon when I have no means of handling [I Wanna Be a Door]",
        );
      }
      break;
    case 693: // It's Almost Certainly a Trap (Daily Dungeon)
      if (options.has(4)) {
        auto_runChoice(4); // use Candy cane sword cane to skip and get stats
      } else if (options.has(2)) {
        auto_runChoice(2); // use eleven-foot pole to skip
      } else {
        auto_runChoice(1); // take damage to progress
      }
      break;
    default:
      abort("unhandled choice in dailyDungeonChoiceHandler");
      break;
  }
}

function LX_dolphinKingMapDo(): boolean {
  auto_buyUpTo(1, $item`snorkel`);
  const oldHat: Item = equippedItem($slot`hat`);
  equip($item`snorkel`);
  use(1, $item`Dolphin King's map`);
  equip(oldHat);
  return true;
}

const LX_dolphinKingMapTask: QuestTask = registerQuestTask({
  name: "LX_dolphinKingMap",
  completed: () => itemAmount($item`Dolphin King's map`) === 0,
  ready: () =>
    itemAmount($item`Dolphin King's map`) > 0 &&
    (possessEquipment($item`snorkel`) ||
      (myMeat() >= npcPrice($item`snorkel`) && isArmoryAvailable())),
  do: LX_dolphinKingMapDo,
});

export function LX_dolphinKingMap(): boolean {
  return runQuestTask(LX_dolphinKingMapTask);
}

function LX_meatMaidDo(): boolean {
  auto_log_info("Got a brain, trying to make and use a meat maid now.", "blue");
  cliExecute("make meat maid");
  use(1, $item`Meat maid`);
  return true;
}

const LX_meatMaidTask: QuestTask = registerQuestTask({
  name: "LX_meatMaid",
  completed: () => false,
  ready: () =>
    haveCampgroundMaid() &&
    knollAvailable() &&
    myDaycount() === 1 &&
    getProperty("questL07Cyrptic") === "finished" &&
    itemAmount($item`smart skull`) > 0 &&
    itemAmount($item`disembodied brain`) > 0,
  do: LX_meatMaidDo,
});

export function LX_meatMaid(): boolean {
  return runQuestTask(LX_meatMaidTask);
}

export function LX_getDesiredWorkshed(): Item {
  const currentWorkshed: string = toLowerCase(getProperty("auto_workshed"));
  //return the actual item name in case a shorthand is used
  switch (currentWorkshed) {
    case "takerspace":
      return $item`TakerSpace letter of Marque`;
    case "model train set":
    case "train":
      return $item`model train set`;
    case "cold medicine cabinet":
    case "cmc":
      return $item`cold medicine cabinet`;
    case "asdon martin keyfob":
    case "asdon":
      return $item`Asdon Martin keyfob (on ring)`;
    case "diabolic pizza cube":
    case "pizza":
      return $item`diabolic pizza cube`; //unless support is added, don't want to use this

    case "portable mayo clinic":
    case "mayo":
      return $item`portable Mayo Clinic`;
    case "little geneticist dna-splicing lab":
    case "dnalab":
      return $item`Little Geneticist DNA-Splicing Lab`;
    case "snow machine":
      //passive worksheds
      return $item`snow machine`; //but you need a garden

    case "warbear auto-anvil":
      return $item`warbear auto-anvil`;
    case "warbear chemistry lab":
      return $item`warbear chemistry lab`;
    case "warbear high-efficiency still":
      return $item`warbear high-efficiency still`;
    case "warbear induction oven":
      return $item`warbear induction oven`;
    case "warbear jackhammer drill press":
      return $item`warbear jackhammer drill press`; //We very rarely pulverize things but if someone really wants to use it, sure they can select it

    case "warbear lp-rom burner":
      return $item`warbear LP-ROM burner`; //If someone really wants to record some AT buffs on their own, allow them to select it

    case "spinning wheel":
      return $item`spinning wheel`; //If someone really wants additional meat. They will need to use it on their own

    case "auto":
    default:
      // auto_workshed is invalid or none/false/whatever to say don't do this
      return Item.none;
  }
}

function LX_setWorkshedDo(): boolean {
  const desiredShed: Item = LX_getDesiredWorkshed();
  const existingShed: Item = getWorkshed();

  //Check to make sure we can use the workshed item and that it isn't already in the campground. If already in campground, return false also
  //These first 2 ifs are only used if something valid other than auto is specified. Otherwise we go to the auto
  if (
    desiredShed !== Item.none &&
    auto_is_valid(desiredShed) &&
    existingShed !== desiredShed &&
    itemAmount(desiredShed) > 0
  ) {
    use(1, desiredShed);
    return true;
  }
  if (existingShed === desiredShed && existingShed !== Item.none) {
    return false;
  }
  //Auto workshed changing
  if (desiredShed === Item.none) {
    //Check if there is an existing shed. We only want to go into this if statement once to use the best available workshed
    if (existingShed === Item.none) {
      if (canSetWorkshed($item`model train set`)) {
        use(1, $item`model train set`);
        auto_log_info("Installed your model train set");
        return true;
      }
      if (canSetWorkshed($item`Asdon Martin keyfob (on ring)`)) {
        use(1, $item`Asdon Martin keyfob (on ring)`);
        auto_log_info("Installed your Asdon Martin keyfob");
        return true;
      }
      if (canSetWorkshed($item`cold medicine cabinet`)) {
        use(1, $item`cold medicine cabinet`);
        auto_log_info("Installed your cold medicine cabinet");
        return true;
      }
      if (canSetWorkshed($item`TakerSpace letter of Marque`)) {
        use(1, $item`TakerSpace letter of Marque`);
        auto_log_info("Installed your TakerSpace letter of Marque");
        return true;
      }
      if (canSetWorkshed($item`Little Geneticist DNA-Splicing Lab`)) {
        use(1, $item`Little Geneticist DNA-Splicing Lab`);
        auto_log_info("Installed your little geneticist dna-splicing lab");
        return true;
      }
      if (canSetWorkshed($item`portable Mayo Clinic`)) {
        use(1, $item`portable Mayo Clinic`);
        auto_log_info("Installed your portable mayo clinic");
        return true;
      }
      auto_log_warning("Unable to find workshed to install");
      return false;
    }
    //once we have enough fasteners and only if we are currently using the model train set
    if (
      fastenerCount() >= 30 &&
      lumberCount() >= 30 &&
      existingShed === $item`model train set`
    ) {
      if (canSetWorkshed($item`Asdon Martin keyfob (on ring)`)) {
        use(1, $item`Asdon Martin keyfob (on ring)`);
        auto_log_info("Changed your workshed to Asdon Martin keyfob");
        return true;
      }
      if (canSetWorkshed($item`cold medicine cabinet`)) {
        use(1, $item`cold medicine cabinet`);
        auto_log_info("Changed your workshed to cold medicine cabinet");
        return true;
      }
      if (canSetWorkshed($item`Little Geneticist DNA-Splicing Lab`)) {
        use(1, $item`Little Geneticist DNA-Splicing Lab`);
        auto_log_info(
          "Changed your workshed to little geneticist dna-splicing lab",
        );
        return true;
      }
      if (canSetWorkshed($item`portable Mayo Clinic`)) {
        use(1, $item`portable Mayo Clinic`);
        auto_log_info("Changed your workshed to portable mayo clinic");
        return true;
      }
      auto_log_warning(
        `You have no workshed to change to so leaving it as ${getWorkshed().toString()}`,
      );
      return false; //return false if no other workshed is available
    }
  }
  return false;
}

export const LX_setWorkshedTask: QuestTask = registerQuestTask({
  name: "LX_setWorkshed",
  completed: () => get("_workshedItemUsed"),
  ready: () =>
    //Don't even try if the workshed has already been changed once
    !get("_workshedItemUsed") &&
    //Not usable in certain paths
    have_workshed(),
  do: LX_setWorkshedDo,
});

export function LX_setWorkshed(): boolean {
  return runQuestTask(LX_setWorkshedTask);
}

function canSetWorkshed(it: Item): boolean {
  return auto_is_valid(it) && itemAmount(it) > 0;
}

function LX_ForceNCDo(): boolean {
  const desiredNCLocation: Location = get(
    "auto_forceNonCombatLocation",
    Location.none,
  );
  //return the actual item name in case a shorthand is used
  switch (desiredNCLocation) {
    case $location`The Dark Neck of the Woods`:
    case $location`The Dark Elbow of the Woods`:
    case $location`The Dark Heart of the Woods`:
      return L6_friarsGetParts();
    case $location`The Castle in the Clouds in the Sky (Basement)`:
      return L10_basement();
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      return L10_topFloor();
    case $location`The Hole in the Sky`:
      return L10_holeInTheSkyUnlock();
    case $location`The Haunted Billiards Room`:
      return LX_unlockHauntedLibrary();
    case $location`The Haunted Bathroom`:
      return LX_getLadySpookyravensPowderPuff();
    case $location`The Black Forest`:
      return L11_getBeehive();
    case $location`The Hidden Apartment Building`:
    case $location`The Hidden Office Building`:
      return L11_hiddenCity();
    case $location`The eXtreme Slope`:
      return L8_trapperQuest();
    default:
      auto_log_warning(
        `Attempted to force NC in unexpected location: ${desiredNCLocation}`,
      );
      return false;
  }
}

export const LX_ForceNCTask: QuestTask = registerQuestTask({
  name: "LX_ForceNC",
  completed: () => false,
  ready: () =>
    getProperty("auto_forceNonCombatSource") === "McHugeLarge left ski" &&
    get("auto_avalancheDeployed", false) &&
    getProperty("auto_forceNonCombatSource") === "jurassic parka" &&
    get("auto_parkaSpikesDeployed", false) &&
    get("auto_forceNonCombatLocation", Location.none) !== Location.none,
  do: LX_ForceNCDo,
});

export function LX_ForceNC(): boolean {
  return runQuestTask(LX_ForceNCTask);
}

function LX_dronesOutDo(): boolean {
  const canExtingo: boolean =
    auto_fireExtinguisherCharges() > 30 &&
    auto_canUse($skill`Fire Extinguisher: Polar Vortex`, false);

  auto_log_info("Have drones out so re-routing to not waste");
  //where to go to. Not handling Smut Orc Keepsake, Blackberry Bush due to adventuring conditions required. If they happen to show up, they are handled in auto_combat
  if (
    needStarKey() &&
    itemAmount($item`star`) < 7 &&
    itemAmount($item`line`) < 6 &&
    zone_isAvailable($location`The Hole in the Sky`)
  ) {
    auto_log_info("Going to HiTS");
    if (
      get("auto_priorLocation", Location.none) !==
      $location`The Hole in the Sky`
    ) {
      set("auto_skipStage2", true);
      set("auto_skipStage4", true);
    }
    return autoAdv($location`The Hole in the Sky`); //Stars and Lines
  }
  if (
    get("middleChamberUnlock") &&
    L11_needTombRatchet() &&
    itemAmount($item`tangle of rat tails`) >= 1 &&
    zone_isAvailable($location`The Middle Chamber`)
  ) {
    auto_log_info("Going to Middle Chamber");
    if (
      get("auto_priorLocation", Location.none) !== $location`The Middle Chamber`
    ) {
      set("auto_skipStage4", true); //don't set skipStage2 because rat king
    }
    return autoAdv($location`The Middle Chamber`); //Tomb ratchets
  }
  if (
    internalQuestStatus("questL09Topping") >= 2 &&
    internalQuestStatus("questL09Topping") <= 3 &&
    hedgeTrimmersNeeded() > 1 &&
    zone_isAvailable($location`Twin Peak`) &&
    prepareForTwinPeak(true)
  ) {
    auto_log_info("Going to Twin Peak");
    if (get("auto_priorLocation", Location.none) !== $location`Twin Peak`) {
      set("auto_skipStage2", true);
      set("auto_skipStage4", true);
    }
    return autoAdv($location`Twin Peak`); //Hedge trimmers
  }
  if (
    internalQuestStatus("questL11Ron") > 1 &&
    internalQuestStatus("questL11Ron") < 5 &&
    zone_isAvailable($location`The Red Zeppelin`)
  ) {
    auto_log_info("Going to the Red Zeppelin");
    if (
      get("auto_priorLocation", Location.none) !== $location`The Red Zeppelin`
    ) {
      set("auto_skipStage4", true); //don't set skipStage2 because glark cables
    }
    return autoAdv($location`The Red Zeppelin`); //Glark cables
  }
  if (
    !canExtingo &&
    get("hiddenBowlingAlleyProgress") + itemAmount($item`bowling ball`) < 6 &&
    zone_isAvailable($location`The Hidden Bowling Alley`)
  ) {
    auto_log_info("Going to the Hidden Bowling Alley");
    if (
      get("auto_priorLocation", Location.none) !==
      $location`The Hidden Bowling Alley`
    ) {
      set("auto_skipStage2", true);
      set("auto_skipStage4", true);
    }
    return autoAdv($location`The Hidden Bowling Alley`); //Bowling balls
  }
  if (
    internalQuestStatus("questL04Bat") <= 1 &&
    zone_isAvailable($location`The Batrat and Ratbat Burrow`)
  ) {
    auto_log_info("Going to the Batrat and Ratbat Burrow");
    if (
      get("auto_priorLocation", Location.none) !==
      $location`The Batrat and Ratbat Burrow`
    ) {
      set("auto_skipStage2", true);
      set("auto_skipStage4", true);
    }
    return autoAdv($location`The Batrat and Ratbat Burrow`); //Sonar-in-a-Biscuit
  }
  if (
    internalQuestStatus("questL08Trapper") === 1 &&
    zone_isAvailable($location`The Goatlet`)
  ) {
    auto_log_info("Going to the Goatlet");
    if (get("auto_priorLocation", Location.none) !== $location`The Goatlet`) {
      set("auto_skipStage2", true);
      set("auto_skipStage4", true);
    }
    return autoAdv($location`The Goatlet`); //Goat cheese
  }
  if (
    itemAmount($item`stone wool`) === 0 &&
    haveEffect($effect`Stone-Faced`) === 0 &&
    canSummonMonster($monster`Baa'baa'bu'ran`) &&
    internalQuestStatus("questL11Worship") < 3 &&
    myLevel() >= 11
  ) {
    auto_log_info("Summoning Baa baa buran");
    return summonMonster($monster`Baa'baa'bu'ran`); //Stone wool
  }
  return false;
}

export const LX_dronesOutTask: QuestTask = registerQuestTask({
  name: "LX_dronesOut",
  completed: () =>
    !canChangeToFamiliar($familiar`Grey Goose`) && !in_quantumTerrarium(),
  ready: () => dronesOut(),
  do: LX_dronesOutDo,
  locations: $locations`The Hole in the Sky, The Middle Chamber, Twin Peak, The Red Zeppelin, The Hidden Bowling Alley, The Batrat and Ratbat Burrow, The Goatlet`,
  desiredEncounters: () => {
    const entries: (DesiredDrop | DesiredFights)[] = [];
    if (needStarKey() && zone_isAvailable($location`The Hole in the Sky`)) {
      (
        [
          [$item`star`, 8],
          [$item`line`, 7],
          [$item`star chart`, 1],
        ] as [Item, number][]
      )
        .map(([i, amount]) => ({
          item: i,
          needAmount: amount - itemAmount(i),
        }))
        .filter(({ needAmount }) => needAmount > 0)
        .forEach((i) => entries.push(i));
    }
    if (
      get("middleChamberUnlock") &&
      L11_needTombRatchet() &&
      zone_isAvailable($location`The Middle Chamber`) &&
      itemAmount($item`tangle of rat tails`) === 0
    ) {
      entries.push({ item: $item`tangle of rat tails`, needAmount: 1 });
    }
    if (
      internalQuestStatus("questL09Topping") >= 2 &&
      internalQuestStatus("questL09Topping") <= 3 &&
      hedgeTrimmersNeeded() > 1 &&
      zone_isAvailable($location`Twin Peak`)
    ) {
      entries.push({
        item: $item`rusty hedge trimmers`,
        needAmount: hedgeTrimmersNeeded(),
      });
    }
    if (
      internalQuestStatus("questL11Ron") > 1 &&
      internalQuestStatus("questL11Ron") < 5 &&
      zone_isAvailable($location`The Red Zeppelin`) &&
      auto_is_valid($item`glark cable`)
    ) {
      const glarkNeedAmount =
        5 - (get("_glarkCableUses") + itemAmount($item`glark cable`));
      if (glarkNeedAmount > 0) {
        entries.push({
          item: $item`glark cable`,
          needAmount: glarkNeedAmount,
        });
      }
    }
    if (
      get("hiddenBowlingAlleyProgress") + itemAmount($item`bowling ball`) < 6 &&
      zone_isAvailable($location`The Hidden Bowling Alley`)
    ) {
      entries.push({
        item: $item`bowling ball`,
        needAmount:
          6 -
          get("hiddenBowlingAlleyProgress") -
          itemAmount($item`bowling ball`),
      });
    }
    if (
      internalQuestStatus("questL08Trapper") === 1 &&
      zone_isAvailable($location`The Goatlet`) &&
      itemAmount($item`goat cheese`) < 3
    ) {
      entries.push({
        item: $item`goat cheese`,
        needAmount: 3 - itemAmount($item`goat cheese`),
      });
    }
    if (
      itemAmount($item`stone wool`) === 0 &&
      haveEffect($effect`Stone-Faced`) === 0 &&
      canSummonMonster($monster`Baa'baa'bu'ran`) &&
      internalQuestStatus("questL11Worship") < 3 &&
      myLevel() >= 11
    ) {
      entries.push({ monster: $monster`Baa'baa'bu'ran`, needAmount: 1 });
    }
    return entries;
  },
});

export function freeCandyFightsLeft(): number {
  // Map isn't valid
  if (!auto_is_valid($item`map to a candy-rich block`)) {
    return 0;
  }
  // Map is done
  if (
    get("_mapToACandyRichBlockUsed") &&
    get("_auto_candyMapCompleted", false)
  ) {
    return 0;
  }
  if (
    !get("_mapToACandyRichBlockUsed") &&
    itemAmount($item`map to a candy-rich block`) > 0
  ) {
    return 5;
  }
  visitUrl("place.php?whichplace=town&action=town_trickortreat");
  const block: string = getProperty("_trickOrTreatBlock");
  const m: AshMatcher = new AshMatcher("D", block);
  let n_unused_dark: number = 0;
  while (m.find()) {
    n_unused_dark++;
  }
  return n_unused_dark;
}

function candyBlockDo(): boolean {
  // Set choice defaults
  set("choiceAdventure804", "2"); // don't halt on map use
  set("choiceAdventure806", "1"); // grab the big bowl of candy
  //Based on freecandy's trickTreatTasks.ts
  if (
    get("_mapToACandyRichBlockUsed") &&
    get("_auto_candyMapCompleted", false)
  ) {
    return false;
  }
  if (candyBlockOutfit("treat") === "") {
    //don't have an outfit to trick or treat in
    return false;
  }
  const houseNumbers: Map<number, number> = new Map([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 6],
    [7, 7],
    [8, 8],
    [9, 9],
    [10, 10],
    [11, 11],
  ]);
  const treatedHouse: Map<number, number> = new Map();
  let count_1: number = 0;
  let tricked: boolean = false;
  let treated: boolean = false;

  if (
    !get("_mapToACandyRichBlockUsed") &&
    itemAmount($item`map to a candy-rich block`) > 0
  ) {
    outfit(candyBlockOutfit("treat"));
    use(1, $item`map to a candy-rich block`);
  }
  if (get("_mapToACandyRichBlockUsed")) {
    let blockHtml: string = visitUrl(
      "place.php?whichplace=town&action=town_trickortreat",
    );
    function refreshBlock(): void {
      blockHtml = visitUrl(
        "place.php?whichplace=town&action=town_trickortreat",
      );
    }
    //treat
    auto_log_info("Get some treats");
    for (const house of houseNumbers.keys()) {
      outfit(candyBlockOutfit("treat"));
      const treat: AshMatcher = new AshMatcher(
        `whichhouse=${house}>[^>]*?house_l`,
        blockHtml,
      );
      const starhouse: AshMatcher = new AshMatcher(
        `whichhouse=${house}>[^>]*?starhouse`,
        blockHtml,
      );
      //treat
      if (treat.find()) {
        treatedHouse.set(count_1, house);
        count_1 += 1;
        visitUrl(`choice.php?whichchoice=804&option=3&whichhouse=${house}&pwd`);
      }
      if (starhouse.find()) {
        treatedHouse.set(count_1, house);
        count_1 += 1;
        visitUrl("place.php?whichplace=town&action=town_trickortreat");
        visitUrl(`choice.php?whichchoice=804&option=3&whichhouse=${house}`);
        visitUrl("choice.php?whichchoice=806&option=2");
        refreshBlock();
      }
      treated = true;
    }
    refreshBlock();
    //trick
    auto_log_info("Perform some tricks");
    for (const house of houseNumbers.keys()) {
      if (treatedHouse.has(house)) {
        continue;
      }
      const trick: AshMatcher = new AshMatcher(
        `whichhouse=${house}>[^>]*?house_d`,
        blockHtml,
      );
      //trick
      if (trick.find()) {
        autoOutfit(candyBlockOutfit("treat"));
        tricked = autoAdvBypass$1(
          `choice.php?whichchoice=804&option=3&whichhouse=${house}&pwd`,
        );
        refreshBlock();
        if (tricked) {
          return true;
        }
      }
      tricked = true;
    }
    if (treated && tricked) {
      set("_auto_candyMapCompleted", true);
      return true;
    }
  }
  return false;
}

const candyBlockTask: QuestTask = registerQuestTask({
  name: "candyBlock",
  completed: () =>
    !auto_is_valid($item`map to a candy-rich block`) ||
    (get("_mapToACandyRichBlockUsed") && get("_auto_candyMapCompleted", false)),
  ready: () => true,
  do: candyBlockDo,
});

export function candyBlock(): boolean {
  return runQuestTask(candyBlockTask);
}

export function candyBlockOutfit(type_1: string): string {
  if (type_1 === "treat") {
    for (const [x, fit] of getOutfits().entries()) {
      if (
        fit === " - No Change - " ||
        fit === "Birthday Suit" ||
        fit === "Your Previous Outfit"
      ) {
        continue;
      }
      if (
        [
          "Legendary Regalia of the Chelonian Overlord",
          "Legendary Regalia of the Groovelord",
          "Legendary Regalia of the Master Squeezeboxer",
          "Legendary Regalia of the Pasta Master",
          "Legendary Regalia of the Saucemaestro",
          "Legendary Regalia of the Seal Crusher",
          "Terra Cotta Tackle",
          "Eldritch Equipage",
          "Filthy Hippy Disguise",
          "Trainbot Trappings",
          "Frat Warrior Fatigues",
          "Black Armaments",
          "Knob Goblin Harem Girl Disguise",
        ].includes(fit)
      ) {
        return fit;
      }
      //if we don't have one of the bestTreatOutfits just choose the last one in the list that's an actual outfit
      if (x === getOutfits().length) {
        return fit;
      }
    }
    if (["mongoose", "wallaby", "vole"].includes(toLowerCase(mySign()))) {
      for (const [, it] of outfitPieces("Bugbear Costume").entries()) {
        if (possessEquipment(it)) {
          continue;
        }
        buy(1, it);
      }
      if (possessOutfit("Bugbear Costume")) {
        return "Bugbear Costume";
      }
    }
  } else {
    return "";
  }

  return "";
}
function LX_lastChanceDo(): boolean {
  //miscellaneous calls that aren't powerlevelling but need to be done at some point based on certain conditions
  if (getProperty("screechDelay") !== "") {
    let banishLoc: Location = Location.none;
    auto_log_warning(
      "Patriotic Eagle's screech banished something we need and we can't adventure anywhere else",
    );
    while (
      (get("screechCombats") > 0 || banishLoc === Location.none) &&
      myAdventures() > 2 &&
      isBanished(get("screechDelay", Phylum.none))
    ) {
      handleFamiliar$1($familiar`Patriotic Eagle`); //force eagle to be used
      if (runTaskChain([LX_getDigitalKeyTask, LX_getStarKeyTask])) {
        continue;
      } else {
        if (LX_unlockManorSecondFloor() && L11_mauriceSpookyraven()) {
          banishLoc = $location`Noob Cave`;
          autoAdv(banishLoc); //adventure here to banish constructs and be able to progress other quests after we no longer need constructs
        } else if (
          canAdventure($location`Cobb's Knob Harem`) &&
          !isBanished($phylum`goblin`)
        ) {
          banishLoc = $location`Cobb's Knob Harem`;
          autoAdv(banishLoc);
        } else if (
          canAdventure($location`The Outskirts of Cobb's Knob`) &&
          !isBanished($phylum`goblin`)
        ) {
          //to open up access to the Harem. Not banishing in the Outskirts so that we can get the combat in the Harem if needed
          autoAdv($location`The Outskirts of Cobb's Knob`);
        } else {
          //Nothing else to do but abort and have the user manually clear it
          abort(
            "You should manually clear the Eagle Screech counter. We recommend some other required zone you haven't been to yet or Noob Cave if all else fails",
          );
          continue;
        }
      }
    }
    if (get("screechCombats") > 0) {
      auto_log_warning(
        "Couldn't clear screech delay without running out of adventures",
      );
      return false;
    }
    if (isBanished(get("screechDelay", Phylum.none))) {
      autoAdv(banishLoc); //adventure here to banish goblins or constructs and be able to progress other quests
    }
    set("screechDelay", "");
    return true;
  }
  // Need the digital key and star key so if we have nothing to do before the L13 quest, might as well do them here
  if (runTaskChain([LX_getDigitalKeyTask, LX_getStarKeyTask])) {
    return true;
  }
  return false;
}

export const LX_lastChanceTask: QuestTask = registerQuestTask({
  name: "LX_lastChance",
  completed: () => false,
  ready: () => true,
  do: LX_lastChanceDo,
  locations: $locations`Cobb's Knob Harem, The Outskirts of Cobb's Knob`,
  desiredEncounters: () =>
    get("screechDelay") !== "" && isBanished(toPhylum(get("screechDelay")))
      ? [
          {
            monster: toPhylum(get("screechDelay")),
            needAmount: Math.max(1, get("screechCombats")),
          },
        ]
      : [],
});

export function LX_lastChance(): boolean {
  return runQuestTask(LX_lastChanceTask);
}
