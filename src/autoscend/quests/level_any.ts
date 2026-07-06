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
  runChoice,
  runTurn,
  setProperty,
  storageAmount,
  toBoolean,
  toFloat,
  toInt,
  toLocation,
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
  $monster,
  $phylum,
  $skill,
  $slot,
  $stat,
} from "libram";

import { auto_advToReserve, LX_doVacation } from "../../autoscend";
import { auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$1, autoAdv$2, autoAdvBypass$6 } from "../auto_adventure";
import {
  autoEquip,
  autoOutfit,
  equipStatgainIncreasers$1,
  possessEquipment,
  possessOutfit$1,
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
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
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
import { zone_isAvailable$1 } from "../auto_zone";
import { canUse$1 } from "../combat/auto_combat_util";
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
  LX_getLadySpookyravensPowderPuff,
  LX_unlockHauntedLibrary,
  LX_unlockManorSecondFloor,
} from "./level_11";
import {
  get8BitFatLootToken,
  LX_getDigitalKey,
  LX_getStarKey,
  needStarKey,
  towerKeyCount,
  towerKeyCount$1,
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
      runChoice(1);
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
      runChoice(1);
    }
  }
}

export function LX_bitchinMeatcar_condition(): boolean {
  return (
    knollAvailable() &&
    toInt(getProperty("auto_spoonconfirmed")) === myAscensions()
  );
}

export function LX_bitchinMeatcar(): boolean {
  if (isDesertAvailable()) {
    return false;
  }
  if (itemAmount($item`bitchin' meatcar`) > 0) {
    return false;
  }
  if (in_bhy() && !inKnollSign()) {
    //it is impossible to make a meatcar in this combo of path and signs.
    return false;
  }
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
  if (autoAdv$1(1, $location`The Degrassi Knoll Garage`)) {
    return true;
  } else if (guildStoreAvailable()) {
    visitUrl("guild.php?place=paco");
    return true;
  }
  //could not adventure in degrassi knoll garage and could not unlock it. you are probably too early in the run and need to come back to it later.
  return false;
}

export function LX_unlockDesert(): boolean {
  if (isDesertAvailable()) {
    return false;
  }

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

function LX_desertAlternate(): boolean {
  if (in_nuclear()) {
    return LX_hippyBoatman();
  }
  if (toInt(getProperty("lastDesertUnlock")) === myAscensions()) {
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

export function LX_islandAccess(): boolean {
  if (in_koe()) {
    return false;
  }

  if (in_lowkeysummer()) {
    return LX_hippyBoatman();
  }

  if (
    toInt(getProperty("lastIslandUnlock")) < myAscensions() &&
    itemAmount($item`pirate dinghy`) > 0 &&
    !toBoolean(getProperty("_pirateDinghyUsed"))
  ) {
    use(1, $item`pirate dinghy`);
    return true;
  }

  if (
    itemAmount($item`Shore Inc. Ship Trip Scrip`) >= 3 &&
    toInt(getProperty("lastIslandUnlock")) !== myAscensions() &&
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
    toInt(getProperty("lastIslandUnlock")) === myAscensions()
  ) {
    if (toInt(getProperty("lastIslandUnlock")) === myAscensions()) {
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
        setProperty("lastIslandUnlock", (myAscensions() - 1).toString());
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

export function startHippyBoatmanSubQuest(): boolean {
  if (
    myBasestat(myPrimestat()) >= 25 &&
    getProperty("questM19Hippy") === "unstarted" &&
    !in_koe()
  ) {
    let temp: string = visitUrl(
      "place.php?whichplace=woods&action=woods_smokesignals",
    );
    temp = visitUrl("choice.php?pwd=&whichchoice=798&option=1");
    temp = visitUrl("choice.php?pwd=&whichchoice=798&option=2");
    temp = visitUrl("woods.php");
    return true;
  }
  return false;
}

export function LX_hippyBoatman(): boolean {
  if (toInt(getProperty("lastIslandUnlock")) >= myAscensions()) {
    return false;
  }

  if (itemAmount($item`junk junk`) > 0) {
    return false;
  }

  if (internalQuestStatus("questM19Hippy") > 3) {
    return false;
  }

  if (myBasestat(myPrimestat()) < 25) {
    return false;
  }

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

  return autoAdv$2($location`The Old Landfill`);
}

export function oldLandfillChoiceHandler(choice: number): void {
  if (choice === 794) {
    // Once More Unto the Junk
    if (itemAmount($item`junk junk`) === 0) {
      if (itemAmount($item`old claw-foot bathtub`) === 0) {
        runChoice(1); // go to The Bathroom of Ten Men (#795)
      } else if (itemAmount($item`old clothesline pole`) === 0) {
        runChoice(2); // go to The Den of Iquity (#796)
      } else if (itemAmount($item`antique cigar sign`) === 0) {
        runChoice(3); // go to Let's Workshop This a Little (#797)
      } else {
        runChoice(1); // go to The Bathroom of Ten Men (#795)
      }
    } else {
      // TODO: Add handling to get the eternal car battery
      // doesn't look like there's mafia tracking for it yet.
      if (itemAmount($item`tangle of copper wire`) === 0) {
        runChoice(2); // go to The Den of Iquity (#796)
      } else if (itemAmount($item`Junk-Bond`) === 0) {
        runChoice(3); // go to Let's Workshop This a Little (#797)
      } else {
        runChoice(1); // go to The Bathroom of Ten Men (#795)
      }
    }
  } else if (choice === 795) {
    // The Bathroom of Ten Men
    if (itemAmount($item`old claw-foot bathtub`) === 0) {
      runChoice(1); // get old claw-foot bathtub
    } else {
      runChoice(2); // fight a random enemy from the zone
    }
  } else if (choice === 796) {
    // The Den of Iquity
    if (itemAmount($item`old clothesline pole`) === 0) {
      runChoice(2); // get old clothesline pole
    } else {
      runChoice(3); // get tangle of copper wire
    }
  } else if (choice === 797) {
    // Let's Workshop This a Little
    if (itemAmount($item`antique cigar sign`) === 0) {
      runChoice(3); // get antique cigar sign
    } else {
      runChoice(1); // get Junk-Bond
    }
  } else {
    abort("unhandled choice in oldLandfillChoiceHandler");
  }
}

export function LX_lockPicking(): boolean {
  if (!auto_have_skill($skill`Lock Picking`)) {
    return false;
  }

  if (toBoolean(getProperty("lockPicked"))) {
    return false;
  }

  if (towerKeyCount$1(false) >= 3) {
    return false;
  }

  if (myMp() < mpCost($skill`Lock Picking`)) {
    return false;
  }
  // As of r20114, this choice does not work in choice adventure script
  if (itemAmount($item`Boris's key`) === 0) {
    setProperty("choiceAdventure1414", (1).toString());
  } else if (itemAmount($item`Jarlsberg's key`) === 0) {
    setProperty("choiceAdventure1414", (2).toString());
  } else if (itemAmount($item`Sneaky Pete's key`) === 0) {
    setProperty("choiceAdventure1414", (3).toString());
  }

  useSkill(1, $skill`Lock Picking`);
  runTurn();
  return toBoolean(getProperty("lockPicked"));
}

export function estimateDailyDungeonAdvNeeded(): number {
  //estimates the amount of adventures we expect to need to do the daily dungeon. the result is only an estimate and not exact.
  //uses your current tools rather than potential tools. so it does not account for the possibility of pulling something or getting a cubeling drop.

  const progress: number = toFloat(getProperty("_lastDailyDungeonRoom"));
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

export function LX_fatLootToken(): boolean {
  if (
    towerKeyCount$1(false) >= 3 &&
    !toBoolean(getProperty("auto_forceFatLootToken"))
  ) {
    return false; //have enough tokens
  }

  if (!canChangeToFamiliar($familiar`Gelatinous Cubeling`) && inHardcore()) {
    //if unable to get the daily dungeon tools then prefer to do fantasy realm over daily dungeon
    if (fantasyRealmToken()) {
      return true;
    }
  }
  if (LX_dailyDungeonToken()) {
    return true;
  }
  if (toBoolean(getProperty("dailyDungeonDone")) && myDaycount() > 1) {
    //wait until daily dungeon is done before considering doing fantasy realm
    if (fantasyRealmToken()) {
      return true;
    }
  }
  if (
    towerKeyCount$1(false) < 3 &&
    (internalQuestStatus("questL13Final") === 5 || auto_turbo())
  ) {
    // at NS tower door and still need hero keys or going for turbo
    // summon and copy fantasy realm bandit. Allows for getting fantasy realm token without having FR available
    if (
      !acquiredFantasyRealmToken() &&
      ((auto_haveBackupCamera() &&
        auto_backupUsesLeft() >= 4 - fantasyBanditsFought()) ||
        auto_canHabitat()) &&
      canSummonMonster($monster`fantasy bandit`)
    ) {
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

export function useTonicDjinn(): void {
  //configure and use Tonic Djinn if one was found in the daily dungeon
  if (
    itemAmount($item`tonic djinn`) > 0 &&
    !toBoolean(getProperty("_tonicDjinn")) &&
    auto_is_valid($item`tonic djinn`)
  ) {
    if (myMeat() < 500 + meatReserve()) {
      setProperty("choiceAdventure778", "1"); // Wealth!
    } else if (disregardInstantKarma()) {
      if (myPrimestat() === $stat`Muscle`) {
        setProperty("choiceAdventure778", "2");
        equipStatgainIncreasers$1($stat`Muscle`, false); // Strength!
      } else if (myPrimestat() === $stat`Mysticality`) {
        setProperty("choiceAdventure778", "3");
        equipStatgainIncreasers$1($stat`Mysticality`, false); // Wisdom!
      } else {
        setProperty("choiceAdventure778", "4");
        equipStatgainIncreasers$1($stat`Moxie`, false); // Panache!
      }
    } else {
      setProperty("choiceAdventure778", "1"); // Wealth!
    }
    use(1, $item`tonic djinn`);
  }
}

function LX_dailyDungeonToken(): boolean {
  if (toBoolean(getProperty("dailyDungeonDone"))) {
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
    toInt(getProperty("_lastDailyDungeonRoom")) === 4 ||
    toInt(getProperty("_lastDailyDungeonRoom")) === 9
  ) {
    autoEquip($slot`acc3`, $item`ring of Detect Boring Doors`);
  }

  return autoAdv$1(1, $location`The Daily Dungeon`);
}

export function dailyDungeonChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  //noncombat choices handler for daily dungeon.

  switch (choice) {
    case 689: // The Final Reward (Daily Dungeon 15th room)
      runChoice(1); // Get fat loot token

      break;
    case 690: // The First Chest Isn't the Deepest. (Daily Dungeon 5th room)
    case 691: // Second Chest (Daily Dungeon 10th room)
      if (options.has(4)) {
        runChoice(4); // Get a fat loot token with your Candy Cane Sword Cane
        if (options.has(2)) {
          runChoice(2); // skip 3 rooms using ring of Detect Boring Doors
        } else {
          runChoice(3); // skip 1 room
        }
      } else if (options.has(2)) {
        runChoice(2); // skip 3 rooms using ring of Detect Boring Doors
      } else {
        runChoice(3); // skip 1 room
      }
      break;
    case 692: // I Wanna Be a Door (Daily Dungeon)
      if (options.has(3)) {
        runChoice(3); // use [Pick-O-Matic Lockpicks] to skip
      } else if (options.has(7)) {
        runChoice(7); // use [Platinum Yendorian Express Card] to skip
      } else if (
        itemAmount($item`skeleton key`) > 1 ||
        (itemAmount($item`skeleton key`) > 0 &&
          containsText(
            getProperty("nsTowerDoorKeysUsed"),
            $item`skeleton key`.toString(),
          ))
      ) {
        runChoice(2); // use [Skeleton Key] to skip
      } else if (
        myPrimestat() === $stat`Muscle` &&
        myBuffedstat($stat`Muscle`) >= 30
      ) {
        runChoice(4); // spend adv and not guarenteed to work
      } else if (
        myPrimestat() === $stat`Mysticality` &&
        myBuffedstat($stat`Mysticality`) >= 30
      ) {
        runChoice(5); // spend adv and not guarenteed to work
      } else if (
        myPrimestat() === $stat`Moxie` &&
        myBuffedstat($stat`Moxie`) >= 30
      ) {
        runChoice(6); // spend adv and not guarenteed to work
      } else {
        abort(
          "I made an error and tried to adventure in the daily dungeon when I have no means of handling [I Wanna Be a Door]",
        );
      }
      break;
    case 693: // It's Almost Certainly a Trap (Daily Dungeon)
      if (options.has(4)) {
        runChoice(4); // use Candy cane sword cane to skip and get stats
      } else if (options.has(2)) {
        runChoice(2); // use eleven-foot pole to skip
      } else {
        runChoice(1); // take damage to progress
      }
      break;
    default:
      abort("unhandled choice in dailyDungeonChoiceHandler");
      break;
  }
}

export function LX_dolphinKingMap(): boolean {
  if (itemAmount($item`Dolphin King's map`) > 0) {
    if (
      possessEquipment($item`snorkel`) ||
      (myMeat() >= npcPrice($item`snorkel`) && isArmoryAvailable())
    ) {
      auto_buyUpTo(1, $item`snorkel`);
      const oldHat: Item = equippedItem($slot`hat`);
      equip($item`snorkel`);
      use(1, $item`Dolphin King's map`);
      equip(oldHat);
      return true;
    }
  }
  return false;
}

export function LX_meatMaid(): boolean {
  if (!haveCampgroundMaid()) {
    return false;
  }
  if (
    !knollAvailable() ||
    myDaycount() !== 1 ||
    getProperty("questL07Cyrptic") !== "finished"
  ) {
    return false;
  }

  if (
    itemAmount($item`smart skull`) > 0 &&
    itemAmount($item`disembodied brain`) > 0
  ) {
    auto_log_info(
      "Got a brain, trying to make and use a meat maid now.",
      "blue",
    );
    cliExecute("make meat maid");
    use(1, $item`Meat maid`);
    return true;
  }

  return false;
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

export function LX_setWorkshed(): boolean {
  const desiredShed: Item = LX_getDesiredWorkshed();
  const existingShed: Item = getWorkshed();
  const workshedChanged: boolean = toBoolean(getProperty("_workshedItemUsed"));

  if (workshedChanged) {
    //Don't even try if the workshed has already been changed once
    return false;
  }
  if (!have_workshed()) {
    //Not usable in certain paths
    return false;
  }
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
        auto_log_info$1("Installed your model train set");
        return true;
      }
      if (canSetWorkshed($item`Asdon Martin keyfob (on ring)`)) {
        use(1, $item`Asdon Martin keyfob (on ring)`);
        auto_log_info$1("Installed your Asdon Martin keyfob");
        return true;
      }
      if (canSetWorkshed($item`cold medicine cabinet`)) {
        use(1, $item`cold medicine cabinet`);
        auto_log_info$1("Installed your cold medicine cabinet");
        return true;
      }
      if (canSetWorkshed($item`TakerSpace letter of Marque`)) {
        use(1, $item`TakerSpace letter of Marque`);
        auto_log_info$1("Installed your TakerSpace letter of Marque");
        return true;
      }
      if (canSetWorkshed($item`Little Geneticist DNA-Splicing Lab`)) {
        use(1, $item`Little Geneticist DNA-Splicing Lab`);
        auto_log_info$1("Installed your little geneticist dna-splicing lab");
        return true;
      }
      if (canSetWorkshed($item`portable Mayo Clinic`)) {
        use(1, $item`portable Mayo Clinic`);
        auto_log_info$1("Installed your portable mayo clinic");
        return true;
      }
      auto_log_warning$1("Unable to find workshed to install");
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
        auto_log_info$1("Changed your workshed to Asdon Martin keyfob");
        return true;
      }
      if (canSetWorkshed($item`cold medicine cabinet`)) {
        use(1, $item`cold medicine cabinet`);
        auto_log_info$1("Changed your workshed to cold medicine cabinet");
        return true;
      }
      if (canSetWorkshed($item`Little Geneticist DNA-Splicing Lab`)) {
        use(1, $item`Little Geneticist DNA-Splicing Lab`);
        auto_log_info$1(
          "Changed your workshed to little geneticist dna-splicing lab",
        );
        return true;
      }
      if (canSetWorkshed($item`portable Mayo Clinic`)) {
        use(1, $item`portable Mayo Clinic`);
        auto_log_info$1("Changed your workshed to portable mayo clinic");
        return true;
      }
      auto_log_warning$1(
        `You have no workshed to change to so leaving it as ${getWorkshed().toString()}`,
      );
      return false; //return false if no other workshed is available
    }
  }
  return false;
}

function canSetWorkshed(it: Item): boolean {
  return auto_is_valid(it) && itemAmount(it) > 0;
}

export function LX_ForceNC(): boolean {
  if (
    getProperty("auto_forceNonCombatSource") !== "McHugeLarge left ski" ||
    !toBoolean(getProperty("auto_avalancheDeployed"))
  ) {
    return false;
  }
  if (
    getProperty("auto_forceNonCombatSource") !== "jurassic parka" ||
    !toBoolean(getProperty("auto_parkaSpikesDeployed"))
  ) {
    return false;
  }
  const desiredNCLocation: Location = toLocation(
    getProperty("auto_forceNonCombatLocation"),
  );
  if (desiredNCLocation === Location.none) {
    return false;
  }
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
      auto_log_warning$1(
        `Attempted to force NC in unexpected location: ${desiredNCLocation}`,
      );
      return false;
  }
}

export function LX_dronesOut(): boolean {
  if (!dronesOut()) {
    return false;
  }
  let canExtingo: boolean = true;
  if (
    auto_fireExtinguisherCharges() <= 30 ||
    !canUse$1($skill`Fire Extinguisher: Polar Vortex`, false)
  ) {
    canExtingo = false;
  }
  auto_log_info$1("Have drones out so re-routing to not waste");
  //where to go to. Not handling Smut Orc Keepsake, Blackberry Bush due to adventuring conditions required. If they happen to show up, they are handled in auto_combat
  if (
    needStarKey() &&
    itemAmount($item`star`) < 7 &&
    itemAmount($item`line`) < 6 &&
    zone_isAvailable$1($location`The Hole in the Sky`)
  ) {
    auto_log_info$1("Going to HiTS");
    if (
      toLocation(getProperty("auto_priorLocation")) !==
      $location`The Hole in the Sky`
    ) {
      setProperty("auto_skipStage2", true.toString());
      setProperty("auto_skipStage4", true.toString());
    }
    return autoAdv$2($location`The Hole in the Sky`); //Stars and Lines
  }
  if (
    toBoolean(getProperty("middleChamberUnlock")) &&
    itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      10 &&
    itemAmount($item`tangle of rat tails`) >= 1 &&
    zone_isAvailable$1($location`The Middle Chamber`)
  ) {
    auto_log_info$1("Going to Middle Chamber");
    if (
      toLocation(getProperty("auto_priorLocation")) !==
      $location`The Middle Chamber`
    ) {
      setProperty("auto_skipStage4", true.toString()); //don't set skipStage2 because rat king
    }
    return autoAdv$2($location`The Middle Chamber`); //Tomb ratchets
  }
  if (
    internalQuestStatus("questL09Topping") >= 2 &&
    internalQuestStatus("questL09Topping") <= 3 &&
    hedgeTrimmersNeeded() > 1 &&
    zone_isAvailable$1($location`Twin Peak`) &&
    prepareForTwinPeak(true)
  ) {
    auto_log_info$1("Going to Twin Peak");
    if (
      toLocation(getProperty("auto_priorLocation")) !== $location`Twin Peak`
    ) {
      setProperty("auto_skipStage2", true.toString());
      setProperty("auto_skipStage4", true.toString());
    }
    return autoAdv$2($location`Twin Peak`); //Hedge trimmers
  }
  if (
    internalQuestStatus("questL11Ron") > 1 &&
    internalQuestStatus("questL11Ron") < 5 &&
    zone_isAvailable$1($location`The Red Zeppelin`)
  ) {
    auto_log_info$1("Going to the Red Zeppelin");
    if (
      toLocation(getProperty("auto_priorLocation")) !==
      $location`The Red Zeppelin`
    ) {
      setProperty("auto_skipStage4", true.toString()); //don't set skipStage2 because glark cables
    }
    return autoAdv$2($location`The Red Zeppelin`); //Glark cables
  }
  if (
    (canExtingo =
      false &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) +
        itemAmount($item`bowling ball`) <
        6 &&
      zone_isAvailable$1($location`The Hidden Bowling Alley`))
  ) {
    auto_log_info$1("Going to the Hidden Bowling Alley");
    if (
      toLocation(getProperty("auto_priorLocation")) !==
      $location`The Hidden Bowling Alley`
    ) {
      setProperty("auto_skipStage2", true.toString());
      setProperty("auto_skipStage4", true.toString());
    }
    return autoAdv$2($location`The Hidden Bowling Alley`); //Bowling balls
  }
  if (
    internalQuestStatus("questL04Bat") <= 1 &&
    zone_isAvailable$1($location`The Batrat and Ratbat Burrow`)
  ) {
    auto_log_info$1("Going to the Batrat and Ratbat Burrow");
    if (
      toLocation(getProperty("auto_priorLocation")) !==
      $location`The Batrat and Ratbat Burrow`
    ) {
      setProperty("auto_skipStage2", true.toString());
      setProperty("auto_skipStage4", true.toString());
    }
    return autoAdv$2($location`The Batrat and Ratbat Burrow`); //Sonar-in-a-Biscuit
  }
  if (
    internalQuestStatus("questL08Trapper") === 1 &&
    zone_isAvailable$1($location`The Goatlet`)
  ) {
    auto_log_info$1("Going to the Goatlet");
    if (
      toLocation(getProperty("auto_priorLocation")) !== $location`The Goatlet`
    ) {
      setProperty("auto_skipStage2", true.toString());
      setProperty("auto_skipStage4", true.toString());
    }
    return autoAdv$2($location`The Goatlet`); //Goat cheese
  }
  if (
    itemAmount($item`stone wool`) === 0 &&
    haveEffect($effect`Stone-Faced`) === 0 &&
    canSummonMonster($monster`Baa'baa'bu'ran`) &&
    internalQuestStatus("questL11Worship") < 3 &&
    myLevel() >= 11
  ) {
    auto_log_info$1("Summoning Baa baa buran");
    return summonMonster($monster`Baa'baa'bu'ran`); //Stone wool
  }
  return false;
}

export function freeCandyFightsLeft(): number {
  // Map isn't valid
  if (!auto_is_valid($item`map to a candy-rich block`)) {
    return 0;
  }
  // Map is done
  if (
    toBoolean(getProperty("_mapToACandyRichBlockUsed")) &&
    toBoolean(getProperty("_auto_candyMapCompleted"))
  ) {
    return 0;
  }
  if (
    !toBoolean(getProperty("_mapToACandyRichBlockUsed")) &&
    itemAmount($item`map to a candy-rich block`) > 0
  ) {
    return 5;
  }
  const blockHtml: string = visitUrl(
    "place.php?whichplace=town&action=town_trickortreat",
  );
  const block: string = getProperty("_trickOrTreatBlock");
  const m: AshMatcher = new AshMatcher("D", block);
  let n_unused_dark: number = 0;
  while (m.find()) {
    n_unused_dark++;
  }
  return n_unused_dark;
}

export function candyBlock(): boolean {
  // Set choice defaults
  setProperty("choiceAdventure804", "2"); // don't halt on map use
  setProperty("choiceAdventure806", "1"); // grab the big bowl of candy
  //Based on freecandy's trickTreatTasks.ts
  if (
    toBoolean(getProperty("_mapToACandyRichBlockUsed")) &&
    toBoolean(getProperty("_auto_candyMapCompleted"))
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
    !toBoolean(getProperty("_mapToACandyRichBlockUsed")) &&
    itemAmount($item`map to a candy-rich block`) > 0
  ) {
    outfit(candyBlockOutfit("treat"));
    use(1, $item`map to a candy-rich block`);
  }
  if (toBoolean(getProperty("_mapToACandyRichBlockUsed"))) {
    let blockHtml: string = visitUrl(
      "place.php?whichplace=town&action=town_trickortreat",
    );
    function refreshBlock(): void {
      blockHtml = visitUrl(
        "place.php?whichplace=town&action=town_trickortreat",
      );
    }
    //treat
    auto_log_info$1("Get some treats");
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
    auto_log_info$1("Perform some tricks");
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
        tricked = autoAdvBypass$6(
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
      setProperty("_auto_candyMapCompleted", true.toString());
      return true;
    }
  }
  return false;
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
      for (const [i, it] of outfitPieces("Bugbear Costume").entries()) {
        if (possessEquipment(it)) {
          continue;
        }
        buy(1, it);
      }
      if (possessOutfit$1("Bugbear Costume")) {
        return "Bugbear Costume";
      }
    }
  } else {
    return "";
  }

  return "";
}
export function LX_lastChance(): boolean {
  //miscellaneous calls that aren't powerlevelling but need to be done at some point based on certain conditions
  if (getProperty("screechDelay") !== "") {
    let banishLoc: Location = Location.none;
    auto_log_warning$1(
      "Patriotic Eagle's screech banished something we need and we can't adventure anywhere else",
    );
    while (
      (toInt(getProperty("screechCombats")) > 0 ||
        banishLoc === Location.none) &&
      myAdventures() > 2 &&
      isBanished(toPhylum(getProperty("screechDelay")))
    ) {
      handleFamiliar$1($familiar`Patriotic Eagle`); //force eagle to be used
      if (LX_getDigitalKey() || LX_getStarKey()) {
        continue;
      } else {
        if (LX_unlockManorSecondFloor() && L11_mauriceSpookyraven()) {
          banishLoc = $location`Noob Cave`;
          autoAdv$2(banishLoc); //adventure here to banish constructs and be able to progress other quests after we no longer need constructs
        } else if (
          canAdventure($location`Cobb's Knob Harem`) &&
          !isBanished($phylum`goblin`)
        ) {
          banishLoc = $location`Cobb's Knob Harem`;
          autoAdv$2(banishLoc);
        } else if (
          canAdventure($location`The Outskirts of Cobb's Knob`) &&
          !isBanished($phylum`goblin`)
        ) {
          //to open up access to the Harem. Not banishing in the Outskirts so that we can get the combat in the Harem if needed
          autoAdv$2($location`The Outskirts of Cobb's Knob`);
        } else {
          //Nothing else to do but abort and have the user manually clear it
          abort(
            "You should manually clear the Eagle Screech counter. We recommend some other required zone you haven't been to yet or Noob Cave if all else fails",
          );
          continue;
        }
      }
    }
    if (toInt(getProperty("screechCombats")) > 0) {
      auto_log_warning$1(
        "Couldn't clear screech delay without running out of adventures",
      );
      return false;
    }
    if (isBanished(toPhylum(getProperty("screechDelay")))) {
      autoAdv$2(banishLoc); //adventure here to banish goblins or constructs and be able to progress other quests
    }
    setProperty("screechDelay", "");
    return true;
  }
  // Need the digital key and star key so if we have nothing to do before the L13 quest, might as well do them here
  if (LX_getDigitalKey() || LX_getStarKey()) {
    return true;
  }
  return false;
}
