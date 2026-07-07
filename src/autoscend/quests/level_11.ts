import {
  abort,
  availableChoiceOptions,
  blackMarketAvailable,
  buy,
  canDrink,
  canEquip,
  cliExecute,
  closetAmount,
  containsText,
  council,
  creatableAmount,
  create,
  Element,
  equip,
  equippedAmount,
  equippedItem,
  Familiar,
  friarsAvailable,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
  hiddenTempleUnlocked,
  indexOf,
  inebrietyLimit,
  inHardcore,
  isBanished,
  Item,
  itemAmount,
  itemDropModifier,
  Location,
  max,
  Modifier,
  monsterLevelAdjustment,
  myAdventures,
  myAscensions,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myHash,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  mySign,
  myTurncount,
  npcPrice,
  numericModifier,
  pullsRemaining,
  random,
  retrieveItem,
  runChoice,
  setProperty,
  splitString,
  squareRoot,
  substring,
  takeCloset,
  toBoolean,
  toFloat,
  toInt,
  toItem,
  toLocation,
  toMonster,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
  $coinmaster,
  $effect,
  $effects,
  $element,
  $elements,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $path,
  $phylum,
  $skill,
  $slot,
  $slots,
  $stat,
} from "libram";

import {
  auto_advToReserve,
  LX_doVacation,
  speculative_pool_skill,
} from "../../autoscend";
import {
  auto_buyUpTo,
  canPull$1,
  npcStoreDiscountMulti,
  pullXWhenHaveY,
} from "../auto_acquire";
import {
  autoAdv$1,
  autoAdv$2,
  autoAdvBypass,
  autoAdvBypass$1,
  autoLuckyAdv$1,
} from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import {
  auto_autoConsumeOne,
  auto_findBestConsumeAction,
  autoDrink,
  canDrink$1,
  expectedAdventuresFrom,
  inebriety_left,
} from "../auto_consume";
import {
  addToMaximize,
  autoEquip,
  autoEquip$1,
  autoForceEquip$1,
  autoForceEquip$3,
  equipBaseline,
  equipMaximizedGear,
  equipmentAmount,
  possessEquipment,
  possessUnrestricted,
  removeFromMaximize,
  resetMaximize,
} from "../auto_equipment";
import {
  auto_famModifiers$2,
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
  is100FamRun,
} from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  provideItem$2,
  providePlusCombat$2,
  provideResistances,
  provideResistances$4,
} from "../auto_providers";
import { acquireHP, acquireMP$2, uneffect } from "../auto_restore";
import {
  auto_reserveUndergroundAdventures,
  auto_waitForDay2,
  canBurnDelay,
} from "../auto_routing";
import {
  auto_can_equip,
  auto_canForceNextNoncombat,
  auto_change_mcd,
  auto_combat_appearance_rates$1,
  auto_convertDesiredML,
  auto_forceNextNoncombat$1,
  auto_haveQueuedForcedNonCombat,
  auto_inRonin,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$3,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  auto_MaxMLToCap,
  auto_wishForEffect,
  autoCraft,
  backupSetting,
  canSniff,
  canSummonMonster,
  cloversAvailable$1,
  internalQuestStatus,
  isGuildClass,
  lastAdventureSpecialNC,
  meatReserve,
  ovenHandle,
  restoreSetting,
  summonMonster,
} from "../auto_util";
import { zone_delay, zone_isAvailable$1 } from "../auto_zone";
import { ConsumeAction } from "../autoscend_record";
import { getSniffer, isSniffed } from "../combat/auto_combat_util";
import {
  considerGrimstoneGolem,
  handleBjornify,
  LX_ornateDowsingRod$1,
} from "../iotms/mr2014";
import { auto_sourceTerminalEducate } from "../iotms/mr2016";
import { auto_beachCombHead, auto_changeSnapperPhylum } from "../iotms/mr2019";
import { auto_canCamelSpit, auto_mapTheMonsters } from "../iotms/mr2020";
import { auto_haveGreyGoose, auto_haveMaydayContract } from "../iotms/mr2022";
import {
  auto_getCitizenZone,
  auto_habitatFightsLeft,
  auto_haveBofa,
  auto_haveCCSC,
  auto_lostStomach$1,
  auto_makeMonkeyPawWish$1,
  auto_monkeyPawWishesLeft,
} from "../iotms/mr2023";
import { auto_haveTearawayPants } from "../iotms/mr2024";
import {
  auto_spadeDigSkeleton,
  auto_spadeDigsRemaining,
  auto_wantToSpadeDigSkeleton,
} from "../iotms/mr2026";
import {
  isActuallyEd,
  L9_ed_chasmStart,
} from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_avantGuard } from "../paths/avant_guard";
import { is_boris } from "../paths/avatar_of_boris";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { in_bhy } from "../paths/bees_hate_you";
import {
  bat_formBats$1,
  bat_reallyPickSkills,
  bat_wantHowl,
  in_darkGyffte,
} from "../paths/dark_gyffte";
import { in_glover } from "../paths/g_lover";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { lar_repeat } from "../paths/live_ascend_repeat";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_ocrs } from "../paths/one_crazy_random_summer";
import { in_plumber, plumber_equipTool$1 } from "../paths/path_of_the_plumber";
import { in_picky } from "../paths/picky";
import { in_pokefam } from "../paths/pocket_familiars";
import {
  in_quantumTerrarium,
  qt_FamiliarSwap,
} from "../paths/quantum_terrarium";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { in_wereprof, is_professor, is_werewolf } from "../paths/wereprofessor";
import { in_wildfire } from "../paths/wildfire";
import { in_robot, robot_delay } from "../paths/you_robot";
import { in_zootomist } from "../paths/zootomist";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { L3_tavern } from "./level_03";
import { L9_chasmBuild } from "./level_09";
import { L10_holeInTheSkyUnlock, L10_topFloor } from "./level_10";

class desert_buff_record {
  constructor(
    public weapon: Item = Item.none,
    public offhand: Item = Item.none,
    public famEquip: Item = Item.none,
    public fam: Familiar = Familiar.none,
    public progress: number = 0,
  ) {}
}

function desertBuffs(): desert_buff_record {
  const dbr: desert_buff_record = new desert_buff_record();

  dbr.progress = 1;

  const compassValid: boolean = possessUnrestricted(
    $item`UV-resistant compass`,
  );
  const lhmValid: boolean = canChangeToFamiliar($familiar`Left-Hand Man`);
  const meloValid: boolean = canChangeToFamiliar($familiar`Melodramedary`);
  const odrValid: boolean = possessUnrestricted($item`ornate dowsing rod`);
  const knifeValid: boolean = possessUnrestricted($item`survival knife`);

  dbr.fam = Familiar.none;
  dbr.famEquip = Item.none;
  dbr.offhand = Item.none;
  dbr.weapon = Item.none;
  // No contention for weapon so always use survival knife if we have it
  if (knifeValid) {
    dbr.weapon = $item`survival knife`;
    dbr.progress += 2;
  }
  // If we can't use the Ornate dowsing rod
  if (!odrValid) {
    // And we can use the compass
    if (compassValid) {
      // And we have the Left-Hand man but not the Melodramedary
      // Free up our offhand for something useful
      if (lhmValid && !meloValid) {
        dbr.fam = $familiar`Left-Hand Man`;
        dbr.famEquip = $item`UV-resistant compass`;
        dbr.progress += 1;
      } else {
        // Otherwise hold the compass
        dbr.offhand = $item`UV-resistant compass`;
        dbr.progress += 1;
      }
    }
    // If we have the Melodramedary use it!
    if (meloValid) {
      dbr.fam = $familiar`Melodramedary`;
      dbr.progress += 1;
    }
  } else {
    // Otherwise
    // If we have it and a Left-Hand man is our best familiar choice
    // but we have no compass free up our offhand
    if (!compassValid && lhmValid && !meloValid) {
      dbr.fam = $familiar`Left-Hand Man`;
      dbr.famEquip = $item`ornate dowsing rod`;
      dbr.progress += 2;
    } else {
      // Otherwise we can just hold it
      dbr.offhand = $item`ornate dowsing rod`;
      dbr.progress += 2;
    }
    // Melodramedary is better here though
    if (meloValid) {
      dbr.fam = $familiar`Melodramedary`;
      dbr.progress += 1;
    } else if (compassValid && lhmValid) {
      // Otherwise we can give the compass to the Left-Hand man if possible
      dbr.fam = $familiar`Left-Hand Man`;
      dbr.famEquip = $item`UV-resistant compass`;
      dbr.progress += 1;
    }
  }
  // There are some other familiars we might choose if nothing affects progress
  if (dbr.fam === Familiar.none) {
    if (
      toInt(getProperty("_hipsterAdv")) < 7 &&
      canChangeToFamiliar($familiar`Artistic Goth Kid`)
    ) {
      dbr.fam = $familiar`Artistic Goth Kid`;
    } else if (
      toInt(getProperty("_hipsterAdv")) < 7 &&
      canChangeToFamiliar($familiar`Mini-Hipster`)
    ) {
      dbr.fam = $familiar`Mini-Hipster`;
    }
  }

  return dbr;
}

//Defined in autoscend/quests/level_11.ash
function shenItemsReturnedOrInProgress(): number {
  const progress: number = internalQuestStatus("questL11Shen");
  if (progress < 1) {
    return 0;
  }
  if (progress < 3) {
    return 1;
  } else if (progress < 5) {
    return 2;
  } else {
    return 3;
  }
}

export function shenSnakeLocations(
  day: number,
  n_items_returned: number,
): Location[] {
  // Returns the locations in which we will find snakes for Shen, on a particular day.
  // From https://kol.coldfront.net/thekolwiki/index.php/Shen_Copperhead,_Nightclub_Owner
  const batsnake = $locations`The Batrat and Ratbat Burrow`;
  const frozen = $locations`Lair of the Ninja Snowmen`;
  const burning = $locations`The Castle in the Clouds in the Sky (Top Floor)`;
  const ten_heads = $locations`The Hole in the Sky`;
  const frattle = $locations`The Smut Orc Logging Camp`;
  const snakleton = $locations`The Unquiet Garves, The VERY Unquiet Garves`;

  // The three snakes for the current day, in the order Shen assigns them.
  let snakes: Location[][] = [];

  if (in_koe()) {
    snakes = [ten_heads, frattle, frozen];
  } else {
    switch (day) {
      case 1:
        snakes = [batsnake, frozen, burning];
        break;
      case 2:
        snakes = [frattle, snakleton, ten_heads];
        break;
      case 3:
        snakes = [frozen, batsnake, snakleton];
        break;
      case 4:
        snakes = [frattle, batsnake, snakleton];
        break;
      case 5:
        snakes = [burning, frattle, ten_heads];
        break;
      case 6:
        snakes = [burning, batsnake, ten_heads];
        break;
      case 7:
        snakes = [frattle, snakleton, ten_heads];
        break;
      case 8:
        snakes = [snakleton, burning, frattle];
        break;
      case 9:
        snakes = [snakleton, frattle, ten_heads];
        break;
      case 10:
        snakes = [ten_heads, batsnake, burning];
        break;
      case 11:
        snakes = [frozen, batsnake, burning];
        break;
    }
  }

  return snakes.flatMap((l) => l).slice(n_items_returned);
}

function shenZonesToAvoidBecauseMaybeSnake(): Location[] {
  if (toInt(getProperty("shenInitiationDay")) > 0) {
    const day: number = toInt(getProperty("shenInitiationDay"));
    const items_returned: number = shenItemsReturnedOrInProgress();
    return shenSnakeLocations(day, items_returned);
  } else {
    // Assume we're going to start Shen today, tomorrow, or two days from now.
    const zones_to_avoid: Set<Location> = new Set();
    if (myLevel() < 11) {
      //if level 10, assume shen today or tomorrow, otherwise up to two days from now
      const beforeThatDay: number = myLevel() >= 10 ? 2 : 3;
      for (let day: number = 0; day < beforeThatDay; day++) {
        for (const z of shenSnakeLocations(day + myDaycount(), 0)) {
          zones_to_avoid.add(z);
        }
      }
    } else {
      // if we're already level 11, well either be starting ASAP
      for (const z of shenSnakeLocations(myDaycount(), 0)) {
        zones_to_avoid.add(z);
      }
    }
    // if ran out of stuff to do and need to get enchanted bean for L10 quest, don't delay for bat snake
    if (
      internalQuestStatus("questL10Garbage") === 0 &&
      toInt(getProperty("auto_delayLastLevel")) === 10 &&
      itemAmount($item`enchanted bean`) === 0
    ) {
      zones_to_avoid.delete($location`The Batrat and Ratbat Burrow`);
    }
    // don't delay Hole in the Sky in WereProf if ran out of stuff to do
    if (
      toInt(getProperty("auto_powerLevelLastAttempted")) === myTurncount() &&
      in_wereprof()
    ) {
      zones_to_avoid.delete($location`The Hole in the Sky`);
    }

    return [...zones_to_avoid];
  }
}

export function shenShouldDelayZone(loc: Location): boolean {
  return (
    shenZonesToAvoidBecauseMaybeSnake().includes(loc) && !isAboutToPowerlevel()
  ); // don't bother with delaying a Shen zone if we've run out of stuff to do
}

export function getShenZonesTurnsSpent(): Map<Location, number> {
  const delayValues: Map<Location, number> = new Map();
  if (getProperty("auto_shenZonesTurnsSpent") !== "") {
    const zones: Map<number, string> = new Map(
      splitString(getProperty("auto_shenZonesTurnsSpent"), ";").map(
        (_v, _i) => [_i, _v],
      ),
    );
    for (const [, zone] of zones) {
      const loc: Location = toLocation(substring(zone, 0, indexOf(zone, ":")));
      const turns_spent: number = toInt(
        substring(zone, indexOf(zone, ":") + 1),
      );
      delayValues.set(loc, turns_spent);
    }
  }
  return delayValues;
}

export function LX_unlockHiddenTemple(): boolean {
  // replaces L2_treeCoin(),  L2_spookyMap(),  L2_spookyFertilizer() & L2_spookySapling()

  if (in_glover()) {
    // Spooky Temple map ain't nuthin' but a 'G' Thang.
    return false;
  }

  if (hiddenTempleUnlocked()) {
    return false;
  }
  if (itemAmount($item`spooky sapling`) === 0 && myMeat() < 100) {
    return false;
  }
  if (canBurnDelay($location`The Spooky Forest`)) {
    // Arboreal Respite choice adventure has a delay of 5 adventures.
    return false;
  }
  auto_log_info("Attempting to make the Hidden Temple less hidden.", "blue");
  pullXWhenHaveY($item`Spooky-Gro fertilizer`, 1, 0);
  if (autoAdv$2($location`The Spooky Forest`)) {
    if (
      itemAmount($item`Spooky Temple map`) > 0 &&
      itemAmount($item`Spooky-Gro fertilizer`) > 0 &&
      itemAmount($item`spooky sapling`) > 0
    ) {
      use(1, $item`Spooky Temple map`);
    }
    return true;
  }
  return false;
}

export function hasSpookyravenLibraryKey(): boolean {
  return (
    itemAmount($item`[1764]Spookyraven library key`) > 0 ||
    itemAmount($item`[7302]Spookyraven library key`) > 0
  );
}

function hasILoveMeVolI(): boolean {
  return (
    itemAmount($item`[2258]"I Love Me, Vol. I"`) > 0 ||
    itemAmount($item`[7262]"I Love Me, Vol. I"`) > 0
  );
}

function useILoveMeVolI(): boolean {
  if (itemAmount($item`[2258]"I Love Me, Vol. I"`) > 0) {
    return use(1, $item`[2258]"I Love Me, Vol. I"`);
  } else if (itemAmount($item`[7262]"I Love Me, Vol. I"`) > 0) {
    return use(1, $item`[7262]"I Love Me, Vol. I"`);
  }
  return false;
}

export function LX_unlockHauntedBilliardsRoom(delayKitchen: boolean): boolean {
  // delayKitchen if true will force the check for 9 hot res & 9 stench res to be used
  if (internalQuestStatus("questM20Necklace") !== 0) {
    return false;
  }

  if (toInt(getProperty("manorDrawerCount")) >= 24) {
    cliExecute("refresh inv");
  }

  if (itemAmount($item`Spookyraven billiards room key`) > 0) {
    return false;
  }

  if (isAboutToPowerlevel()) {
    // if we're at the point where we need to level up to get more quests other than this, we might as well just do this instead
    delayKitchen = false;
  }
  if (delayKitchen) {
    const resGoals: Map<Element, number> = new Map();
    resGoals.set($element`hot`, 9);
    resGoals.set($element`stench`, 9);
    // check to see if we can acquire sufficient hot and stench res for the kitchen
    const resPossible: Map<Element, number> = provideResistances(
      resGoals,
      $location`The Haunted Kitchen`,
      true,
      false,
      true,
    );
    delayKitchen =
      (resPossible.get($element`hot`) ??
        resPossible.set($element`hot`, 0).get($element`hot`)) < 9 ||
      (resPossible.get($element`stench`) ??
        resPossible.set($element`stench`, 0).get($element`stench`)) < 9;
  }

  if (delayKitchen && isActuallyEd()) {
    // If we already have all the elemental wards as ed we're probably not going to get any better, so might as well get it over with
    delayKitchen = !haveSkill($skill`Even More Elemental Wards`);
  }

  if (!delayKitchen) {
    const resGoal: Map<Element, number> = new Map();
    resGoal.set($element`hot`, 9);
    resGoal.set($element`stench`, 9);
    const resPossible: Map<Element, number> = provideResistances(
      resGoal,
      $location`The Haunted Kitchen`,
      true,
      true,
      false,
    );
    auto_log_info(
      `Looking for the Billards Room key (Hot/Stench:${resPossible.get($element`hot`) ?? resPossible.set($element`hot`, 0).get($element`hot`)}/${resPossible.get($element`stench`) ?? resPossible.set($element`stench`, 0).get($element`stench`)}): Progress ${getProperty("manorDrawerCount")}/24`,
      "blue",
    );

    if (
      auto_spadeDigsRemaining() > 0 &&
      getProperty("lastAdventure") === "The Haunted Kitchen"
    ) {
      return auto_spadeDigSkeleton();
    }
    if (autoAdv$2($location`The Haunted Kitchen`)) {
      return true;
    }
  }
  return false;
}

export function LX_unlockHauntedBilliardsRoom$1(): boolean {
  return LX_unlockHauntedBilliardsRoom(true);
}

export function LX_unlockHauntedLibrary(): boolean {
  //Adventure in the haunted billiards room to get the key to the haunted library
  if (
    internalQuestStatus("questM20Necklace") < 1 ||
    internalQuestStatus("questM20Necklace") > 2
  ) {
    return false;
  }
  if (
    itemAmount($item`Spookyraven billiards room key`) < 1 ||
    hasSpookyravenLibraryKey()
  ) {
    return false;
  }
  //equipment handling
  let expectPool: number = speculative_pool_skill();
  const staffOfFats: Item = $item`[2268]Staff of Fats`; //regular staff of fats. +5 pool +2 training
  const EdStaffOfFats: Item = $item`[7964]Staff of Fats`; //ed path version of staff of fats. +5 pool
  const EdStaffOfEd: Item = $item`[7961]Staff of Ed`; //ed path version of staff of ed. +5 pool

  if (is_boris()) {
    auto_log_info("Boris cannot equip a pool cue.", "blue");
  } else if (in_tcrs()) {
    auto_log_info(
      "During this Crazy Summer Pool Cues are used differently.",
      "blue",
    );
  } else if (expectPool > 17) {
    auto_log_info("I don't need to equip a cue to beat this ghostie.", "blue");
  } else {
    if (possessEquipment(staffOfFats)) {
      autoEquip$1(staffOfFats); //+5 pool skill & +2 training gains.
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfEd) && expectPool + 5 > 13) {
      autoEquip$1(EdStaffOfEd); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfFats) && expectPool + 5 > 13) {
      autoEquip$1(EdStaffOfFats); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment($item`pool cue`) && expectPool + 3 > 13) {
      autoEquip$1($item`pool cue`); //+3 pool skill
      expectPool += 3;
    }
  }

  if (in_small() && myInebriety() < inebrietyLimit() && myLevel() > 10) {
    // in small we should have astral pilsners assuming the user knows what they are doing
    // so just drink one if we can get the max adventures out of it
    const bestDrinkAction: ConsumeAction = auto_findBestConsumeAction("drink");
    if (bestDrinkAction.it === $item`astral pilsner`) {
      auto_autoConsumeOne(bestDrinkAction);
    } else {
      auto_log_info$1(
        "You didn't take astral pilsners or you're somehow on day 4 of Small. Make better life choices.",
      );
    }
  }
  //inebrity handling. do not care if: auto succeed or can't drink or ran out of things to do.
  const wildfire_check: boolean = !(in_wildfire() && inHardcore()); //hardcore wildfire ignore inebriety limits
  if (
    expectPool < 18 &&
    canDrink() &&
    !isAboutToPowerlevel() &&
    wildfire_check
  ) {
    //paths with inebrity limit under 11 should wait until they are at max to do this
    if (myInebriety() < inebrietyLimit() && inebrietyLimit() < 11) {
      auto_log_info("I will come back when I had more to drink.", "green");
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
    if (myInebriety() < inebrietyLimit() && myInebriety() < 8) {
      auto_log_info("I will come back when I had more to drink.", "green");
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
    if (myInebriety() > 11) {
      const penalty: number = 2 * (10 - myInebriety());
      auto_log_info(
        `I overshot my inebrity goal for the [Haunted Billiards Room] which gives me a penalty of ${penalty}pool skill. I will come back tomorrow or if I run out of things to do.`,
        "green",
      );
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
  }
  //+3 pool skill & +1 training gains. speculative_pool_skill() already assumed we would use it if we can.
  buffMaintain$4($effect`Chalky Hand`);

  if (internalQuestStatus("questM20Necklace") === 2) {
    // only force after we get the pool cue NC.
    const NCForced: boolean = auto_forceNextNoncombat$1(
      $location`The Haunted Billiards Room`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < toInt(getProperty("auto_runDayCount")) &&
      !isAboutToPowerlevel()
    ) {
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
  }
  auto_log_info("It's billiards time!", "blue");
  return autoAdv$2($location`The Haunted Billiards Room`);
}

export function LX_unlockManorSecondFloor(): boolean {
  if (
    internalQuestStatus("questM20Necklace") < 3 ||
    internalQuestStatus("questM20Necklace") > 4
  ) {
    return false;
  }
  //No sense in trying to go to the library if constructs (writing desk) are banished and we already have a killing jar and haven't done the desert yet
  if (
    isBanished($phylum`construct`) &&
    toInt(getProperty("screechCombats")) > 0 &&
    itemAmount($item`killing jar`) > 0 &&
    (toInt(getProperty("gnasirProgress")) & 4) !== 4
  ) {
    setProperty("screechDelay", "construct");
    return false;
  }

  if (!hasSpookyravenLibraryKey()) {
    return false;
  }
  //finish quest
  if (itemAmount($item`Lady Spookyraven's necklace`) > 0) {
    auto_log_info("Giving Lady Spookyraven her necklace.", "blue");
    visitUrl("place.php?whichplace=manor1&action=manor1_ladys");
    visitUrl("place.php?whichplace=manor2&action=manor2_ladys");
    return true;
  }

  if (myTurncount() === toInt(getProperty("_LAR_skipNC163"))) {
    auto_log_info$1(
      "In LAR path NC163 is forced to reoccur if we skip it. Go do something else.",
    );
    return false;
  }

  auto_log_info("Well, we need writing desks", "blue");
  auto_log_info("Going to the library!", "blue");
  if (
    toInt(getProperty("writingDesksDefeated")) <= 3 ||
    toMonster(getProperty("nosyNoseMonster")) === $monster`writing desk`
  ) {
    // nose sniff is weak so probably want fairy familiar first. this condition should change if banshee librarian is added as a YR target for killing jar
    if (
      (itemAmount($item`killing jar`) > 0 ||
        isBanished($monster`banshee librarian`)) &&
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1($location`The Haunted Library`).get(
        $monster`writing desk`,
      ) ??
        auto_combat_appearance_rates$1($location`The Haunted Library`)
          .set($monster`writing desk`, 0.0)
          .get($monster`writing desk`)) < 100
    ) {
      handleFamiliar$1($familiar`Nosy Nose`);
    }
  }
  if (toInt(getProperty("writingDesksDefeated")) <= 3) {
    if (
      canSniff($monster`writing desk`, $location`The Haunted Library`) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a writing desk.",
      );
    }
  }

  auto_getCitizenZone($location`The Haunted Library`, false); //since want to adventure in the Haunted Library anyway
  return autoAdv$2($location`The Haunted Library`);
}

export function LX_spookyravenManorFirstFloor(): boolean {
  if (toInt(getProperty("lastSecondFloorUnlock")) >= myAscensions()) {
    return false;
  }

  if (
    LX_unlockManorSecondFloor() ||
    LX_unlockHauntedLibrary() ||
    LX_unlockHauntedBilliardsRoom$1()
  ) {
    return true;
  }
  return false;
}

export function LX_danceWithLadySpookyraven(): boolean {
  if (
    internalQuestStatus("questM21Dance") < 2 ||
    internalQuestStatus("questM21Dance") > 3
  ) {
    return false;
  }

  if (
    itemAmount($item`Lady Spookyraven's powder puff`) === 1 &&
    itemAmount($item`Lady Spookyraven's dancing shoes`) === 1 &&
    itemAmount($item`Lady Spookyraven's finest gown`) === 1
  ) {
    visitUrl("place.php?whichplace=manor2&action=manor2_ladys");
  }

  auto_log_info("Finished Spookyraven, just dancing with the lady.", "blue");
  if (autoAdv$2($location`The Haunted Ballroom`)) {
    if (in_lowkeysummer()) {
      // need to open the Haunted Nursery for the music box key.
      visitUrl("place.php?whichplace=manor3&action=manor3_ladys");
    }
    return true;
  }
  return false;
}

export function hauntedBedroomChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  if (choice === 876) {
    // One Simple Nightstand (The Haunted Bedroom)
    if (
      (myMeat() < 1000 + meatReserve() &&
        auto_is_valid($item`old leather wallet`) &&
        !in_wotsf()) ||
      in_amw()
    ) {
      runChoice(1); // get old leather wallet worth ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Muscle` &&
      myBuffedstat($stat`Muscle`) < 150
    ) {
      runChoice(3); // spend 1 ghost key for primestat, get ~200 muscle XP
    } else {
      runChoice(2); // get min(200,muscle) of muscle XP
    }
  } else if (choice === 877) {
    // One Mahogany Nightstand (The Haunted Bedroom)
    runChoice(1); // get half of a memo or old coin purse
  } else if (choice === 878) {
    // One Ornate Nightstand (The Haunted Bedroom)
    let needSpectacles: boolean =
      !possessEquipment($item`Lord Spookyraven's spectacles`) &&
      internalQuestStatus("questL11Manor") < 2;
    if (is_boris() || in_wotsf() || (in_nuclear() && inHardcore())) {
      needSpectacles = false;
    }
    if (needSpectacles) {
      runChoice(3); // get Lord Spookyraven's spectacles
    } else if (
      itemAmount($item`disposable instant camera`) === 0 &&
      internalQuestStatus("questL11Palindome") < 1
    ) {
      runChoice(4); // get disposable instant camera
    } else if (
      myPrimestat() !== $stat`Mysticality` ||
      myMeat() < 1000 + meatReserve() ||
      in_amw()
    ) {
      runChoice(1); // get ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Mysticality` &&
      myBuffedstat($stat`Mysticality`) < 150
    ) {
      runChoice(5); // spend 1 ghost key for primestat, get ~200 mysticality XP
    } else {
      runChoice(2); // get min(200,mys) of mys XP
    }
  } else if (choice === 879) {
    // One Rustic Nightstand (The Haunted Bedroom)
    if (options.has(4)) {
      runChoice(4); // only shows up rarely. still worth ~1 mil in mall
    }
    if (in_bhy() && itemAmount($item`antique hand mirror`) < 1) {
      runChoice(3); // fight the remains of a jilted mistress for the antique hand mirror
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Moxie` &&
      myBuffedstat($stat`Moxie`) < 150
    ) {
      runChoice(5); // spend 1 ghost key for primestat, get ~200 moxie XP
    } else {
      runChoice(1); // get moxie substats
    }
  } else if (choice === 880) {
    // One Elegant Nightstand (The Haunted Bedroom)
    if (
      internalQuestStatus("questM21Dance") < 2 &&
      itemAmount($item`Lady Spookyraven's finest gown`) === 0
    ) {
      runChoice(1); // get Lady Spookyraven's Gown
    } else {
      runChoice(2); // get elegant nightstick
    }
  } else {
    abort("unhandled choice in hauntedBedroomChoiceHandler");
  }
}

export function LX_getLadySpookyravensFinestGown(): boolean {
  if (internalQuestStatus("questM21Dance") !== 1) {
    return false;
  }
  // Elegant animated nightstand has a delay of 6(?) adventures.
  // TODO: add a check for delay burning?
  // Might not be worth it since we need to fight ornate nightstands for the spectacles and camera
  let needSpectacles: boolean =
    !possessEquipment($item`Lord Spookyraven's spectacles`) &&
    internalQuestStatus("questL11Manor") < 2;
  let needCamera: boolean =
    itemAmount($item`disposable instant camera`) === 0 &&
    internalQuestStatus("questL11Palindome") < 1;
  if (is_boris() || in_wotsf() || (in_nuclear() && inHardcore())) {
    needSpectacles = false;
  }
  if (in_pokefam()) {
    needCamera = false;
  }
  if (needCamera && needSpectacles) {
    // if in a path that needs both you want a two night stand with ornate, olfacting ornate nightstand is a problem
    // for the script because it will work against the elegant nightstand and most olfaction skills aren't cancelled
    // easily without changing locations, but Nosy Nose will be turned off once it's no longer the used familiar
    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      !is100FamRun()
    ) {
      let ornateRate: number =
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`).get(
          $monster`animated ornate nightstand`,
        ) ??
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`)
          .set($monster`animated ornate nightstand`, 0.0)
          .get($monster`animated ornate nightstand`);
      const elegantRate: number =
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`).get(
          $monster`elegant animated nightstand`,
        ) ??
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`)
          .set($monster`elegant animated nightstand`, 0.0)
          .get($monster`elegant animated nightstand`);
      if ($location`The Haunted Bedroom`.turnsSpent < 6 && elegantRate !== 0) {
        //non 0 value for elegant before 7 is spurious
        ornateRate += elegantRate; //not a real rate but only correct for the purpose of checking if it is 100
      }
      if (ornateRate < 99.9) {
        handleFamiliar$1($familiar`Nosy Nose`);
      }
    }
  }

  if (itemAmount($item`Lady Spookyraven's finest gown`) > 0) {
    // got the Bedroom item but we might still need items for other parts
    // of the macguffin quest if we got unlucky
    if (!needSpectacles && !needCamera) {
      return false;
    }
  }

  auto_log_info(
    "Spookyraven: Bedroom, rummaging through nightstands looking for naughty meatbag trinkets.",
    "blue",
  );
  if (autoAdv$2($location`The Haunted Bedroom`)) {
    return true;
  }
  return false;
}

export function LX_getLadySpookyravensDancingShoes(): boolean {
  if (internalQuestStatus("questM21Dance") !== 1) {
    return false;
  }

  if (itemAmount($item`Lady Spookyraven's dancing shoes`) > 0) {
    return false;
  }

  if (canBurnDelay($location`The Haunted Gallery`)) {
    // Louvre It or Leave It choice adventure has a delay of 5 adventures.
    return false;
  }

  backupSetting("louvreDesiredGoal", "7"); // lets just let mafia automate this for us.
  auto_log_info("Spookyraven: Gallery", "blue");

  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (autoAdv$2($location`The Haunted Gallery`)) {
    return true;
  }
  return false;
}

export function LX_getLadySpookyravensPowderPuff(): boolean {
  if (internalQuestStatus("questM21Dance") !== 1) {
    return false;
  }

  if (itemAmount($item`Lady Spookyraven's powder puff`) > 0) {
    return false;
  }

  if (canBurnDelay($location`The Haunted Bathroom`)) {
    // Never Gonna Make You Up choice adventure has a delay of 5 adventures.
    return false;
  }

  auto_log_info("Spookyraven: Bathroom", "blue");

  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (!zone_delay($location`The Haunted Bathroom`)._boolean) {
    const NCForced: boolean = auto_forceNextNoncombat$1(
      $location`The Haunted Bathroom`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < toInt(getProperty("auto_runDayCount")) &&
      !isAboutToPowerlevel()
    ) {
      return false;
    }
  }
  if (autoAdv$2($location`The Haunted Bathroom`)) {
    return true;
  }
  return false;
}

export function LX_spookyravenManorSecondFloor(): boolean {
  if (toInt(getProperty("lastSecondFloorUnlock")) < myAscensions()) {
    return false;
  }
  if (
    LX_danceWithLadySpookyraven() ||
    LX_getLadySpookyravensFinestGown() ||
    LX_getLadySpookyravensDancingShoes() ||
    LX_getLadySpookyravensPowderPuff()
  ) {
    return true;
  }
  return false;
}

export function blackForestChoiceHandler(choice: number): void {
  if (choice === 923) {
    // All Over the Map (The Black Forest)
    if (5 in availableChoiceOptions()) {
      // only available with Candy Cane Sword Cane equipped
      runChoice(5); // +8 exploration
      runChoice(1); // go to You Found Your Thrill (#924)
    } else {
      runChoice(1); // go to You Found Your Thrill (#924)
    }
  } else if (choice === 924) {
    if (toBoolean(getProperty("auto_getBeehive")) && myAdventures() > 3) {
      runChoice(3); // go to Bee Persistent (#1018)
    } else if (
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      runChoice(2); // go to The Blackberry Cobbler (#928)
    } else {
      runChoice(1); // Attack the bushes (fight blackberry bush)
    }
  } else if (choice === 925) {
    // The Blackest Smith (The Black Forest)
    runChoice(5); // skip
  } else if (choice === 926) {
    // Be Mine (The Black Forest)
    runChoice(4); // skip
  } else if (choice === 927) {
    // Sunday Black Sunday (The Black Forest)
    runChoice(3); // skip
  } else if (choice === 928) {
    if (
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      runChoice(4); // get Blackberry Galoshes
    } else {
      runChoice(5); // skip
    }
  } else if (choice === 1018) {
    // Bee Persistent (The Black Forest)
    if (toBoolean(getProperty("auto_getBeehive")) && myAdventures() > 2) {
      runChoice(1); // go to Bee Rewarded (#1019)
    } else {
      runChoice(2); // skip
    }
  } else if (choice === 1019) {
    // Bee Rewarded (The Black Forest)
    if (toBoolean(getProperty("auto_getBeehive"))) {
      runChoice(1); // get the beehive
    } else {
      runChoice(2); // skip
    }
  } else {
    abort("unhandled choice in blackForestChoiceHandler");
  }
}

export function L11_blackMarket(): boolean {
  if (
    internalQuestStatus("questL11Black") < 0 ||
    internalQuestStatus("questL11Black") > 1 ||
    blackMarketAvailable()
  ) {
    return false;
  }
  if (
    possessEquipment($item`blackberry galoshes`) &&
    !auto_can_equip($item`blackberry galoshes`) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }

  if (isBanished($phylum`beast`) && toInt(getProperty("screechCombats")) > 0) {
    setProperty("screechDelay", "beast");
    return false; // Can't get the reassembled blackbird if beasts are banished
  }

  if (in_quantumTerrarium()) {
    //swap to the blackbird or crow if we can
    if (
      !$familiars`Reassembled Blackbird, Reconstituted Crow`.includes(
        myFamiliar(),
      )
    ) {
      qt_FamiliarSwap($familiar`Reassembled Blackbird`);
      qt_FamiliarSwap($familiar`Reconstituted Crow`);
    }
  }

  if ($location`The Black Forest`.turnsSpent > 12 && !in_avantGuard()) {
    auto_log_warning(
      "We have spent a bit many adventures in The Black Forest... manually checking",
      "red",
    );
    visitUrl("place.php?whichplace=woods");
    visitUrl("woods.php");
    if ($location`The Black Forest`.turnsSpent > 30) {
      abort(
        'We have spent too many turns in The Black Forest and haven\'t found The Black Market. Something is wrong. (try "refresh quests" on the cli)',
      );
    }
  }

  auto_log_info(
    `Must find the Black Market: ${getProperty("blackForestProgress")}`,
    "blue",
  );
  if (
    internalQuestStatus("questL11Black") === 0 &&
    itemAmount($item`black map`) === 0
  ) {
    council();
    const galoshes: Item = $item`blackberry galoshes`;
    if (
      !possessEquipment(galoshes) &&
      auto_can_equip(galoshes) &&
      canPull$1(galoshes)
    ) {
      pullXWhenHaveY(galoshes, 1, 0);
    }
  }

  if (itemAmount($item`beehive`) > 0) {
    setProperty("auto_getBeehive", false.toString());
  }

  autoEquip($slot`acc3`, $item`blackberry galoshes`);
  //If we want the Beehive, and don\'t have enough adventures, this is dangerous.
  if (toBoolean(getProperty("auto_getBeehive")) && myAdventures() < 3) {
    return false;
  }
  if (
    itemAmount($item`reassembled blackbird`) > 0 &&
    auto_haveGreyGoose() &&
    !possessEquipment($item`blackberry galoshes`) &&
    itemAmount($item`blackberry`) < 2 &&
    !in_darkGyffte()
  ) {
    auto_log_info$1(
      "Bringing the Grey Goose to emit some drones at a blackberry bush.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  const advSpent: boolean = autoAdv$2($location`The Black Forest`);
  //For people with autoCraft set to false for some reason
  if (
    itemAmount($item`reassembled blackbird`) === 0 &&
    creatableAmount($item`reassembled blackbird`) > 0
  ) {
    create(1, $item`reassembled blackbird`);
  }
  if (advSpent) {
    return true;
  }
  return false;
}

export function L11_getBeehive(): boolean {
  if (!blackMarketAvailable() || !toBoolean(getProperty("auto_getBeehive"))) {
    return false;
  }
  if (
    internalQuestStatus("questL13Final") >= 7 ||
    itemAmount($item`beehive`) > 0
  ) {
    auto_log_info(
      "Nevermind, wall of skin already defeated (or we already have a beehiven). We do not need a beehive. Bloop.",
      "blue",
    );
    setProperty("auto_getBeehive", false.toString());
    return false;
  }

  auto_log_info("Must find a beehive!", "blue");

  const NCForced: boolean = auto_forceNextNoncombat$1(
    $location`The Black Forest`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < toInt(getProperty("auto_runDayCount")) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  const advSpent: boolean = autoAdv$2($location`The Black Forest`);
  if (itemAmount($item`beehive`) > 0) {
    setProperty("auto_getBeehive", false.toString());
  }
  return advSpent;
}

export function L11_forgedDocuments(): boolean {
  if (
    internalQuestStatus("questL11Black") < 0 ||
    internalQuestStatus("questL11Black") > 2 ||
    !blackMarketAvailable()
  ) {
    return false;
  }
  if (itemAmount($item`forged identification documents`) > 0) {
    return false;
  }
  if (
    !in_wotsf() &&
    myMeat() < npcPrice($item`forged identification documents`)
  ) {
    if (isAboutToPowerlevel()) {
      abort(
        "Could not afford to buy Forged Identification Documents, can not steal identities!",
      );
    }
    return false;
  }

  auto_log_info("Getting the McMuffin Book", "blue");
  if (in_wotsf()) {
    // TODO: move this to WotSF path file if one is ever created.
    const pages: Map<number, string> = new Map();
    pages.set(0, "shop.php?whichshop=blackmarket");
    pages.set(1, "shop.php?whichshop=blackmarket&action=fightbmguy");
    return autoAdvBypass(0, pages, $location`Noob Cave`, null);
  }
  if (is_werewolf()) {
    return false; // can't access shops as a werewolf
  }
  auto_buyUpTo(1, $item`forged identification documents`);
  if (itemAmount($item`forged identification documents`) > 0) {
    return true;
  }
  auto_log_warning(
    "Could not buy Forged Identification Documents, can't get booze now!",
    "red",
  );
  return false;
}

export function L11_mcmuffinDiary(): boolean {
  if (
    internalQuestStatus("questL11MacGuffin") !== 1 ||
    internalQuestStatus("questL11Black") < 2
  ) {
    return false;
  }
  if (is_werewolf()) {
    return false; //can't access stores as werewolf which includes the shore
  }
  if (in_koe() && itemAmount($item`forged identification documents`) > 0) {
    council(); // Shore doesn't exist in Exploathing so we acquire diary from the council
  }
  if (itemAmount($item`your father's MacGuffin diary`) > 0) {
    use(
      itemAmount($item`your father's MacGuffin diary`),
      $item`your father's MacGuffin diary`,
    );
    return true;
  }
  if (itemAmount($item`copy of a jerk adventurer's father's diary`) > 0) {
    use(
      itemAmount($item`copy of a jerk adventurer's father's diary`),
      $item`copy of a jerk adventurer's father's diary`,
    );
    return true;
  }
  if (
    myAdventures() < 4 ||
    myMeat() < 500 ||
    itemAmount($item`forged identification documents`) === 0
  ) {
    if (isAboutToPowerlevel()) {
      abort("Could not vacation at the shore to find your fathers diary!");
    }
    return false;
  }

  auto_log_info("Getting the McMuffin Diary", "blue");
  setProperty("auto_considerCCSCShore", false.toString());
  LX_doVacation();
  setProperty("auto_considerCCSCShore", true.toString());
  for (const diary of $items`your father's MacGuffin diary, copy of a jerk adventurer's father's diary`) {
    if (itemAmount(diary) > 0) {
      use(itemAmount(diary), diary);
      return true;
    }
  }
  return false;
}

function auto_visit_gnasir(): void {
  //Visits gnasir, can change based on path
  if (in_koe()) {
    visitUrl("place.php?whichplace=exploathing_beach&action=expl_gnasir");
  } else {
    visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
  }
}

export function L11_getUVCompass(): boolean {
  //acquire a [UV-resistant compass] if needed
  if (
    possessEquipment($item`ornate dowsing rod`) &&
    auto_can_equip($item`ornate dowsing rod`)
  ) {
    return false; //already have a dowsing rod. we do not need a compass.
  }
  if (!auto_can_equip($item`UV-resistant compass`)) {
    return false;
  }
  if (possessEquipment($item`UV-resistant compass`)) {
    return false; //already have compass
  }
  if (in_koe()) {
    return false; //impossible to get compass in this path. [The Shore, Inc] is unavailable
  }
  if (is_werewolf()) {
    return false; // can't access shore as a werewolf
  }

  pullXWhenHaveY($item`Shore Inc. Ship Trip Scrip`, 1, 0);
  if (itemAmount($item`Shore Inc. Ship Trip Scrip`) === 0) {
    return LX_doVacation();
  }

  if (create(1, $item`UV-resistant compass`)) {
    return true;
  } else {
    cliExecute("refresh inv");
    if (possessEquipment($item`UV-resistant compass`)) {
      return true;
    } else {
      abort(
        "I have the Scrip for it but am failing to buy [UV-resistant compass] for some reason. buy it manually and run me again",
      );
    }
  }

  return false;
}

export function L11_hasUltrahydrated(): boolean {
  if (
    haveEffect($effect`Ultrahydrated`) > 0 &&
    internalQuestStatus("questL11Desert") < 1
  ) {
    return true;
  }
  return false;
}

export function L11_aridDesert(): boolean {
  if (internalQuestStatus("questL11Desert") !== 0) {
    return false;
  }
  // Fix broken desert tracking. pocket familiars failing as of r19010. plumber as of r20019
  if (in_plumber() || in_pokefam()) {
    visitUrl("place.php?whichplace=desertbeach", false);
  }
  if (toInt(getProperty("desertExploration")) >= 100) {
    return false; //done exploring
  }

  if (
    auto_haveMaydayContract() &&
    myDaycount() < 2 &&
    !isAboutToPowerlevel() &&
    auto_is_valid($item`survival knife`)
  ) {
    // if we can get (and use) the survival knife on day 2 and we're on day 1, lets delay until day 2
    // unless we have absolutely nothing else to do.
    // hardcode the paths & classes we know will get the survival knife on day 2 until mafia
    // exposes functions to either allow us to calculate seeds ourselves or just tell us what we will get.
    if (in_small() && $classes`Turtle Tamer, Sauceror`.includes(myClass())) {
      return false;
    }
    if (myPath() === $path`Standard` && myClass() === $class`Pastamancer`) {
      return false;
    }
  }

  if (LX_ornateDowsingRod$1(true)) {
    //spend adv trying to get [Ornate Dowsing Rod]. doing_desert_now = true.
    return true;
  }
  if (L11_getUVCompass()) {
    //spend adv trying to get [UV-resistant compass]
    return true;
  }
  if (robot_delay("desert")) {
    return false; //delay for You, Robot path
  }
  if (itemAmount($item`milestone`) > 0) {
    //use milestone if we got one from the rock garden
    use(1, $item`milestone`);
  }

  const dbr: desert_buff_record = desertBuffs();
  let progress: number = dbr.progress;
  if (toBoolean(getProperty("bondDesert"))) {
    progress += 2;
  }
  if (getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb") {
    //TODO verify spelling on this string
    progress += 2;
  }

  if (toBoolean(getProperty("auto_gnasirUnlocked"))) {
    if (LX_spookyravenManorFirstFloor()) {
      // make sure we've actually done the Haunted Library before we want to hand in a killing jar
      return true;
    }

    if ((toInt(getProperty("gnasirProgress")) & 2) !== 2) {
      let canBuyPaint: boolean = true;
      if (in_wotsf() || in_nuclear() || is_werewolf()) {
        canBuyPaint = false;
      }

      if (
        itemAmount($item`can of black paint`) > 0 ||
        (myMeat() >= npcPrice($item`can of black paint`) && canBuyPaint)
      ) {
        auto_buyUpTo(1, $item`can of black paint`);
        auto_log_info("Returning the Can of Black Paint", "blue");
        auto_visit_gnasir();
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        visitUrl("choice.php?whichchoice=805&option=2&pwd=");
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          cliExecute("refresh inv");
          if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
            if (itemAmount($item`can of black paint`) === 0) {
              auto_log_warning(
                "Mafia did not track gnasir Can of Black Paint (0x2). Fixing.",
                "red",
              );
              setProperty(
                "gnasirProgress",
                (toInt(getProperty("gnasirProgress")) | 2).toString(),
              );
              return true;
            } else {
              abort(
                "Returned can of black paint but did not return can of black paint.",
              );
            }
          } else {
            if ((toInt(getProperty("gnasirProgress")) & 2) !== 2) {
              auto_log_warning(
                "Mafia did not track gnasir Can of Black Paint (0x2). Fixing.",
                "red",
              );
              setProperty(
                "gnasirProgress",
                (toInt(getProperty("gnasirProgress")) | 2).toString(),
              );
            }
          }
        }
        use(1, $item`desert sightseeing pamphlet`);
        return true;
      }
    }

    if (
      itemAmount($item`killing jar`) > 0 &&
      (toInt(getProperty("gnasirProgress")) & 4) !== 4
    ) {
      auto_log_info("Returning the killing jar", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
        cliExecute("refresh inv");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          abort("Returned killing jar but did not return killing jar.");
        } else {
          if ((toInt(getProperty("gnasirProgress")) & 4) !== 4) {
            auto_log_warning(
              "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
              "red",
            );
            setProperty(
              "gnasirProgress",
              (toInt(getProperty("gnasirProgress")) | 4).toString(),
            );
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    if (
      itemAmount($item`worm-riding manual page`) >= 15 &&
      (toInt(getProperty("gnasirProgress")) & 8) !== 8
    ) {
      auto_log_info("Returning the worm-riding manual pages", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`worm-riding hooks`) === 0) {
        auto_log_error(
          "We messed up in the Desert, get the Worm-Riding Hooks and use them please.",
        );
        abort(
          "We messed up in the Desert, get the Worm-Riding Hooks and use them please.",
        );
      }
      if (itemAmount($item`worm-riding manual page`) >= 15) {
        auto_log_warning(
          "Mafia doesn't realize that we've returned the worm-riding manual pages... fixing",
          "red",
        );
        cliExecute("refresh all");
        if ((toInt(getProperty("gnasirProgress")) & 8) !== 8) {
          auto_log_warning(
            "Mafia did not track gnasir Worm-Riding Manual Pages (0x8). Fixing.",
            "red",
          );
          setProperty(
            "gnasirProgress",
            (toInt(getProperty("gnasirProgress")) | 8).toString(),
          );
        }
      }
      return true;
    }

    if (
      itemAmount($item`worm-riding hooks`) > 0 &&
      (toInt(getProperty("gnasirProgress")) & 16) !== 16
    ) {
      pullXWhenHaveY($item`drum machine`, 1, 0);
      if (itemAmount($item`drum machine`) === 0) {
        auto_makeMonkeyPawWish$1($item`drum machine`);
      }
      if (itemAmount($item`drum machine`) > 0) {
        auto_log_info("Drum machine desert time!", "blue");
        use(1, $item`drum machine`);
        return true;
      }
    }
    // If we have done the Worm-Riding Hooks or the Killing jar, don\'t do this.
    if (
      100 - toInt(getProperty("desertExploration")) <= 15 &&
      (toInt(getProperty("gnasirProgress")) & 12) === 0
    ) {
      pullXWhenHaveY($item`killing jar`, 1, 0);
      if (itemAmount($item`killing jar`) > 0) {
        auto_log_info("Secondary killing jar handler", "blue");
        auto_visit_gnasir();
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        visitUrl("choice.php?whichchoice=805&option=2&pwd=");
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          cliExecute("refresh inv");
          if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
            abort(
              "Returned killing jar (secondary) but did not return killing jar.",
            );
          } else {
            if ((toInt(getProperty("gnasirProgress")) & 4) !== 4) {
              auto_log_warning(
                "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
                "red",
              );
              setProperty(
                "gnasirProgress",
                (toInt(getProperty("gnasirProgress")) | 4).toString(),
              );
            }
          }
        }
        use(1, $item`desert sightseeing pamphlet`);
        return true;
      }
    }
  }

  if (
    haveEffect($effect`Ultrahydrated`) > 0 ||
    toInt(getProperty("desertExploration")) === 0
  ) {
    auto_log_info("Searching for the pyramid", "blue");
    if (in_heavyrains()) {
      autoEquip$1($item`Thor's Pliers`);
    }

    if (
      possessEquipment($item`reinforced beaded headband`) &&
      possessEquipment($item`bullet-proof corduroys`) &&
      possessEquipment($item`round purple sunglasses`)
    ) {
      for (const it of $items`beer helmet, distressed denim pants, bejeweled pledge pin`) {
        takeCloset(closetAmount(it), it);
      }
    }

    auto_buyUpTo(1, $item`hair spray`);
    buffMaintain$4($effect`Butt-Rock Hair`);
    if (myPrimestat() === $stat`Muscle`) {
      auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
      buffMaintain$4($effect`Go Get 'Em, Tiger!`);
      auto_buyUpTo(1, $item`blood of the Wereseal`);
      buffMaintain$4($effect`Temporary Lycanthropy`);
    }

    if (myMp() > 30 && myHp() < myMaxhp() * 0.5) {
      acquireHP();
    }

    if (
      (inHardcore() || pullsRemaining() === 0) &&
      itemAmount($item`worm-riding hooks`) > 0 &&
      toInt(getProperty("desertExploration")) <= 100 - 5 * progress &&
      (toInt(getProperty("gnasirProgress")) & 16) !== 16 &&
      itemAmount($item`stone rose`) === 0
    ) {
      if (itemAmount($item`drum machine`) > 0) {
        auto_log_info("Found the drums, now we use them!", "blue");
        use(1, $item`drum machine`);
      } else {
        auto_log_info("Off to find the drums!", "blue");
        autoAdv$1(1, $location`The Oasis`);
      }
      return true;
    }

    if ((toInt(getProperty("gnasirProgress")) & 1) !== 1) {
      const expectedOasisTurns: number = 8 - $location`The Oasis`.turnsSpent;
      const equivProgress: number = expectedOasisTurns * progress;
      const need_1: number = 100 - toInt(getProperty("desertExploration"));
      auto_log_info(`expectedOasis: ${expectedOasisTurns}`, "brown");
      auto_log_info(`equivProgress: ${equivProgress}`, "brown");
      auto_log_info(`need: ${need_1}`, "brown");
      if (
        need_1 <= 15 &&
        15 >= equivProgress &&
        itemAmount($item`stone rose`) === 0
      ) {
        auto_log_info("It seems raisinable to hunt a Stone Rose. Beep", "blue");
        autoAdv$1(1, $location`The Oasis`);
        return true;
      }
    }

    if (dbr.fam !== Familiar.none) {
      if (in_quantumTerrarium()) {
        qt_FamiliarSwap(dbr.fam);
      } else {
        handleFamiliar$1(dbr.fam);
      }
    }
    if (dbr.weapon !== Item.none) {
      autoEquip($slot`weapon`, dbr.weapon);
    }
    if (dbr.offhand !== Item.none) {
      autoEquip($slot`off-hand`, dbr.offhand);
    }
    if (dbr.famEquip !== Item.none) {
      autoEquip($slot`familiar`, dbr.famEquip);
    }
    setProperty("choiceAdventure805", (1).toString());
    const need: number = 100 - toInt(getProperty("desertExploration"));
    auto_log_info(`Need for desert: ${need}`, "blue");
    auto_log_info(
      `Worm riding: ${itemAmount($item`worm-riding manual page`)}`,
      "blue",
    );

    if (
      !toBoolean(getProperty("auto_gnasirUnlocked")) &&
      $location`The Arid, Extra-Dry Desert`.turnsSpent > 10 &&
      toInt(getProperty("desertExploration")) > 10
    ) {
      auto_log_info(
        "Did not appear to notice that Gnasir unlocked, assuming so at this point.",
        "green",
      );
      setProperty("auto_gnasirUnlocked", true.toString());
    }

    if (
      toBoolean(getProperty("auto_gnasirUnlocked")) &&
      itemAmount($item`stone rose`) > 0 &&
      (toInt(getProperty("gnasirProgress")) & 1) !== 1
    ) {
      auto_log_info("Returning the stone rose", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
        cliExecute("refresh inv");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          abort("Returned stone rose but did not return stone rose.");
        } else {
          if ((toInt(getProperty("gnasirProgress")) & 1) !== 1) {
            auto_log_warning(
              "Mafia did not track gnasir Stone Rose (0x1). Fixing.",
              "red",
            );
            setProperty(
              "gnasirProgress",
              (toInt(getProperty("gnasirProgress")) | 1).toString(),
            );
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    autoAdv$1(1, $location`The Arid, Extra-Dry Desert`);

    if (containsText(getProperty("lastEncounter"), "A Sietch in Time")) {
      auto_log_info(
        "We've found the gnome!! Sightseeing pamphlets for everyone!",
        "green",
      );
      setProperty("auto_gnasirUnlocked", true.toString());
    }

    if (
      containsText(getProperty("lastEncounter"), "He Got His Just Desserts")
    ) {
      takeCloset(closetAmount($item`beer helmet`), $item`beer helmet`);
      takeCloset(
        closetAmount($item`distressed denim pants`),
        $item`distressed denim pants`,
      );
      takeCloset(
        closetAmount($item`bejeweled pledge pin`),
        $item`bejeweled pledge pin`,
      );
    }
  } else {
    const need: number = 100 - toInt(getProperty("desertExploration"));
    auto_log_info(
      `Getting some ultrahydrated, I suppose. Desert left: ${need}`,
      "blue",
    );
    if (
      !toBoolean(getProperty("oasisAvailable")) &&
      haveEffect($effect`Ultrahydrated`) === 0
    ) {
      return autoAdv$1(1, $location`The Arid, Extra-Dry Desert`);
    }

    if (auto_haveBofa() && !isAboutToPowerlevel()) {
      // wait for a monster to give us ultrahydrated
      return false;
    }

    if (!autoAdv$1(1, $location`The Oasis`)) {
      auto_log_warning(
        "Could not visit the Oasis for some reason, desertExploration may be incorrect.",
        "red",
      );
      const initial: number = toInt(getProperty("desertExploration"));
      const page: string = visitUrl("place.php?whichplace=desertbeach");
      const desert_matcher: AshMatcher = new AshMatcher(
        'title="[(](\\d+)% explored[)]"',
        page,
      );
      if (desert_matcher.find()) {
        const found: number = toInt(desert_matcher.group(1));
        if (found !== initial) {
          auto_log_info(
            `Incorrectly had exploration value of ${initial} when it should be at ${found}. This was corrected. Trying to resume.`,
            "blue",
          );
          setProperty("desertExploration", found.toString());
          return true;
        }
        if (!autoAdv$1(1, $location`The Oasis`)) {
          abort(
            "Tried to adventure in The Oasis but could not. property desertExploration determined to be correct",
          );
        }
      } else {
        abort(
          "Tried to adventure in The Oasis but could not, and could not verify the actual exploration amount of the desert",
        );
      }
    }
  }
  return true;
}

export function LX_killBaaBaaBuran(): boolean {
  if (!hiddenTempleUnlocked()) {
    return false;
  }
  if (
    itemAmount($item`stone wool`) === 0 &&
    haveEffect($effect`Stone-Faced`) === 0
  ) {
    // try to clover/summon baa baa first
    if (auto_haveGreyGoose()) {
      auto_log_info$1(
        "Bringing the Grey Goose to emit some drones at a Sheep carving.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    } else {
      handleFamiliar("item");
    }
    addToMaximize("20 item 400max");
    // Right now clovers are "cheaper" than summons, so use clover first, but not our last.
    if (cloversAvailable$1() > 1) {
      return autoLuckyAdv$1($location`The Hidden Temple`);
    }

    if (canSummonMonster($monster`Baa'baa'bu'ran`)) {
      return summonMonster($monster`Baa'baa'bu'ran`);
    }
  }
  return false;
}

export function L11_unlockHiddenCity(): boolean {
  if (
    !hiddenTempleUnlocked() ||
    internalQuestStatus("questL11Worship") < 0 ||
    internalQuestStatus("questL11Worship") > 2
  ) {
    return false;
  }
  if (myAdventures() - auto_advToReserve() <= 3) {
    return false;
  }

  auto_log_info("Searching for the Hidden City", "blue");
  if (!in_glover() && !in_tcrs()) {
    // BaaBaabaran is the best source of stone wool
    if (LX_killBaaBaaBuran()) {
      return true;
    }

    if (
      itemAmount($item`stone wool`) === 0 &&
      haveEffect($effect`Stone-Faced`) === 0
    ) {
      //try to pull stone wool
      pullXWhenHaveY($item`stone wool`, 1, 0);
    }

    buffMaintain$4($effect`Stone-Faced`);
    if (haveEffect($effect`Stone-Faced`) === 0) {
      if (isAboutToPowerlevel()) {
        //we ran out of other quests to do. stop waiting for optimal conditions
        //TODO replace this abort with a function that adventures in the ziggurat for stone wool.
        abort(
          "We need [Stone Wool] to unlock the hidden city and were unable to get it via Lucky!. This scenario is not currently automated. Please manually acquire 2 [Stone Wool] then run autoscend again.",
        );
      } else {
        //go do other things while we keep waiting for semirare
        return false;
      }
    }
  } else if (in_glover()) {
    if (haveEffect($effect`Stone-Faced`) === 0) {
      auto_wishForEffect($effect`Stone-Faced`);
    } else {
      return false;
    }
  }
  return autoAdv$2($location`The Hidden Temple`);
}

export function hiddenTempleChoiceHandler(choice: number, page: string): void {
  if (choice === 123) {
    // At Least It's Not Full Of Trash
    runChoice(2); // Go to Beginning at the Beginning of Beginning
    visitUrl("choice.php");
    cliExecute("dvorak"); // Solve puzzle and go to No Visible Means of Support (#125)
  } else if (choice === 125) {
    // No Visible Means of Support
    runChoice(3); // Unlock the Hidden City!
  } else if (choice === 579) {
    // Such Great Heights
    if (
      itemAmount($item`stone wool`) >= 2 &&
      toInt(getProperty("lastTempleAdventures")) < myAscensions()
    ) {
      runChoice(3); // if we have plenty of stone wool, take the adventures first (and reset Mayam)
    } else if (
      itemAmount($item`the Nostril of the Serpent`) === 0 &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      runChoice(2); // Get The Nostril of the Serpent
    } else {
      runChoice(3); // +3 adventures and extend 10 effects (first time) or skip
    }
  } else if (choice === 580) {
    // The Hidden Heart of the Hidden Temple
    if (
      !containsText(
        page,
        "The door is decorated with that little lightning-tailed guy from your father's diary.",
      )
    ) {
      runChoice(2); // Go to Unconfusing Buttons (#584) or Confusing Buttons (#583)
    } else {
      runChoice(1); // Go to At Least It's Not Full Of Trash (#123)
    }
  } else if (choice === 581) {
    // Such Great Depths
    runChoice(3); // Fight the Clan of cave bars
  } else if (choice === 582) {
    // Fitting In
    if (
      itemAmount($item`the Nostril of the Serpent`) > 0 &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      runChoice(2); // Go to The Hidden Heart of the Hidden Temple (#580)
    } else {
      runChoice(1); // Go to Such Great Heights (#579)
    }
  } else if (choice === 583) {
    // Confusing Buttons
    runChoice(1); // Randomly changes The Hidden Heart of the Hidden Temple
  } else if (choice === 584) {
    // Unconfusing Buttons
    runChoice(4); // Go to The Hidden Heart of the Hidden Temple (Pikachutlotal) (#580)
  } else {
    abort("unhandled choice in hiddenTempleChoiceHandler");
  }
}

export function liana_cleared(loc: Location): boolean {
  //need to check the combat names due to wanderers
  //we are assuming victory. you could have potentially fought liana without machete and then ran away. but you we are assuming you didn't
  let dense_liana_defeated: number = 0;
  const area_combats_seen: Map<number, string> = new Map(
    splitString(loc.combatQueue, "; ").map((_v, _i) => [_i, _v]),
  );
  for (const [, s] of area_combats_seen) {
    if (s === "dense liana") {
      dense_liana_defeated += 1;
    }
  }
  return dense_liana_defeated > 2;
}

function L11_hiddenTavernUnlock(): boolean {
  return L11_hiddenTavernUnlock$1(false);
}

function L11_hiddenTavernUnlock$1(force: boolean): boolean {
  if (!auto_is_valid($item`book of matches`)) {
    return false;
  }

  if (myAscensions() === toInt(getProperty("hiddenTavernUnlock"))) {
    return true;
  }

  if (force) {
    if (!inHardcore()) {
      pullXWhenHaveY($item`book of matches`, 1, 0);
      if (itemAmount($item`book of matches`) === 0) {
        auto_makeMonkeyPawWish$1($item`book of matches`);
      }
    }
  }

  if (myAscensions() > toInt(getProperty("hiddenTavernUnlock"))) {
    if (itemAmount($item`book of matches`) > 0) {
      use(1, $item`book of matches`);
      return true;
    }
    return false;
  }
  return true;
}

export function hiddenCityChoiceHandler(choice: number): void {
  if (choice === 780) {
    // Action Elevator (The Hidden Apartment Building)
    if (haveEffect($effect`Thrice-Cursed`) > 0) {
      runChoice(1); // fight the spirit
    } else if (
      4 in availableChoiceOptions() &&
      haveEffect($effect`Thrice-Cursed`) === 0
    ) {
      // Use CCSC to get Cursed +1
      runChoice(4);
      if (haveEffect($effect`Thrice-Cursed`) > 0) {
        runChoice(1); // fight the spirit
      } else {
        runChoice(2); // get cursed
      }
    } else {
      runChoice(2); // get cursed
    }
  } else if (choice === 781) {
    // Earthbound and Down (An Overgrown Shrine (Northwest))
    if (toInt(getProperty("hiddenApartmentProgress")) === 0) {
      runChoice(1); // unlock the Hidden Apartment Building
    } else if (itemAmount($item`moss-covered stone sphere`) > 0) {
      runChoice(2); // get the stone triangle
    } else {
      runChoice(6); // skip
    }
  } else if (choice === 783) {
    // Water You Dune (An Overgrown Shrine (Southwest))
    if (toInt(getProperty("hiddenHospitalProgress")) === 0) {
      runChoice(1); // unlock the Hidden Hospital
    } else if (itemAmount($item`dripping stone sphere`) > 0) {
      runChoice(2); // get the stone triangle
    } else {
      runChoice(6); // skip
    }
  } else if (choice === 784) {
    // You, M. D. (The Hidden Hospital)
    runChoice(1); // fight the spirit
  } else if (choice === 785) {
    // Air Apparent (An Overgrown Shrine (Northeast))

    if (toInt(getProperty("hiddenOfficeProgress")) === 0) {
      runChoice(1); // unlock the Hidden Office Building
    } else if (
      itemAmount(
        // either use CCSC + unlock or just unlock based on user sphere presence
        $item`crackling stone sphere`,
      ) > 0
    ) {
      if (4 in availableChoiceOptions()) {
        runChoice(4); // get free meat via CCSC
      }
      runChoice(2); // get the stone triangle
    } else {
      runChoice(6); // skip
    }
  } else if (choice === 786) {
    // Working Holiday (The Hidden Office Building)
    if (itemAmount($item`McClusky file (complete)`) > 0) {
      runChoice(1); // fight the spirit
    } else if (itemAmount($item`boring binder clip`) === 0) {
      runChoice(2); // get boring binder clip
    } else {
      runChoice(3); // fight an accountant
    }
  } else if (choice === 787) {
    // Fire When Ready (An Overgrown Shrine (Southeast))
    if (toInt(getProperty("hiddenBowlingAlleyProgress")) === 0) {
      runChoice(1); // unlock the Hidden Bowling Alley
    } else if (itemAmount($item`scorched stone sphere`) > 0) {
      runChoice(2); // get the stone triangle
    } else {
      runChoice(6); // skip
    }
  } else if (choice === 788) {
    // Life is Like a Cherry of Bowls (The Hidden Bowling Alley)
    if (2 in availableChoiceOptions()) {
      runChoice(2); // bowl for stats 4 times then fight the spirit on 5th occurrence
      runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    } else {
      runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    }
  } else if (choice === 789) {
    // Where Does The Lone Ranger Take His Garbagester? (The Hidden Park)
    if (toInt(getProperty("relocatePygmyJanitor")) !== myAscensions()) {
      runChoice(2); // Relocate the Pygmy Janitor to the park
    } else {
      runChoice(1); // Get Hidden City zone items
    }
  } else if (choice === 791) {
    // Legend of the Temple in the Hidden City (A Massive Ziggurat)
    if (itemAmount($item`stone triangle`) === 4) {
      runChoice(1); // fight the Protector Spirit (or replacement)
    } else {
      runChoice(6); // skip
    }
  } else if (choice === 1002) {
    // Temple of the Legend in the Hidden City (A Massive Ziggurat/Actually Ed the Undying)
    if (itemAmount($item`stone triangle`) === 4) {
      runChoice(1); // Put the Ancient Amulet back
    } else {
      runChoice(6); // skip
    }
  } else {
    abort("unhandled choice in hiddenCityChoiceHandler");
  }
}

export function L11_hiddenCity(): boolean {
  if (
    internalQuestStatus("questL11Worship") < 3 ||
    internalQuestStatus("questL11Worship") > 4
  ) {
    return false;
  }

  if (itemAmount($item`[2180]ancient amulet`) === 1) {
    return true;
  } else if (itemAmount($item`[7963]ancient amulet`) === 0 && isActuallyEd()) {
    return true;
  }

  if (
    internalQuestStatus("questL11Curses") > 1 ||
    itemAmount($item`moss-covered stone sphere`) > 0
  ) {
    uneffect($effect`Thrice-Cursed`);
  }
  //can we handle this zone?
  if (!in_pokefam() && !in_darkGyffte() && !in_aosol() && !in_wereprof()) {
    if (!acquireHP()) {
      //try to restore HP to max.
      auto_log_warning$1(
        "Delaying hidden city because we are unable to restore HP",
      );
      return false; //could not heal HP. we should go do something else first
    }
  }
  if (in_robot() && myLevel() < 13) {
    return false;
  }

  const weapon_ghost_dmg: number = toInt(
    numericModifier("hot damage") +
      numericModifier("cold damage") +
      numericModifier("stench damage") +
      numericModifier("sleaze damage") +
      numericModifier("spooky damage"),
  );
  if (
    !in_robot() &&
    !in_darkGyffte() &&
    weapon_ghost_dmg < 20 &&
    !acquireMP$2(
      //we can not rely on melee/ranged weapon to kill the ghost
      30,
      0,
    )
  ) {
    //try getting some MP, relying on a spell to kill them instead. TODO verify we have a spell
    auto_log_warning(
      "We can not reliably kill Specters in hidden city due to a shortage of MP and elemental weapon dmg. Delaying zone",
      "red",
    );
    return false;
  }

  if (
    internalQuestStatus("questL11Curses") === 0 &&
    haveEffect($effect`Ancient Fortitude`) === 0
  ) {
    auto_log_info("The idden [sic] apartment!", "blue");

    let elevatorAction: boolean =
      !zone_delay($location`The Hidden Apartment Building`)._boolean ||
      auto_haveQueuedForcedNonCombat();

    let canDrinkCursedPunch: boolean =
      canDrink$1($item`Cursed Punch`) &&
      !toBoolean(getProperty("auto_limitConsume")) &&
      !in_tcrs() &&
      !in_small();
    //todo: in_tcrs check quality and size of cursed punch instead of skipping? if that is possible

    let cursesNeeded: number = 3;
    if (haveEffect($effect`Once-Cursed`) > 0) {
      cursesNeeded = 2;
    }
    if (haveEffect($effect`Twice-Cursed`) > 0) {
      cursesNeeded = 1;
    }
    if (auto_haveCCSC()) {
      cursesNeeded -= 1;
    }
    //able to drink, enough liver?
    if (canDrinkCursedPunch) {
      let inebrietyAllowedForPunch: number = inebriety_left();
      if (in_quantumTerrarium() && myFamiliar() === $familiar`Stooper`) {
        //in QT the limit is lower or else will be overdrunk when Stooper changes
        inebrietyAllowedForPunch -= 1;
      }

      if (
        inebrietyAllowedForPunch <
        cursesNeeded * $item`Cursed Punch`.inebriety
      ) {
        canDrinkCursedPunch = false;
      }
    }

    if (
      !elevatorAction &&
      $location`The Hidden Apartment Building`.turnsSpent <= 4 &&
      auto_canForceNextNoncombat()
    ) {
      //should we try to force the noncombat?
      let shouldForceElevatorAction: boolean = false;

      if (
        haveEffect($effect`Thrice-Cursed`) > 0 ||
        (haveEffect($effect`Twice-Cursed`) > 0 && auto_haveCCSC())
      ) {
        shouldForceElevatorAction = true;
      } else if (canDrinkCursedPunch) {
        if (toFloat(getProperty("auto_consumeMinAdvPerFill")) !== 0) {
          //try to respect user setting for cursed punch while there is apartment delay
          //give it at least +1 adv that it saves fighting a pygmy shaman
          const advPerFillFromCursedPunch: number = toInt(
            (expectedAdventuresFrom($item`Cursed Punch`) + 1) /
              $item`Cursed Punch`.inebriety,
          );
          if (
            advPerFillFromCursedPunch <
            toFloat(getProperty("auto_consumeMinAdvPerFill"))
          ) {
            canDrinkCursedPunch = false;
          }
        }
        //can drink and inebriety allows it
        if (canDrinkCursedPunch) {
          const canBuyCursedPunch: boolean =
            myMeat() >= cursesNeeded * 500 * npcStoreDiscountMulti() &&
            !is_werewolf(); //can't buy cursed punch as a werewolf

          if (canBuyCursedPunch) {
            L11_hiddenTavernUnlock$1(true);

            if (myAscensions() === toInt(getProperty("hiddenTavernUnlock"))) {
              shouldForceElevatorAction = true;
            }
          }
        }
      }

      if (shouldForceElevatorAction) {
        elevatorAction = auto_forceNextNoncombat$1(
          $location`The Hidden Apartment Building`,
        );
        // delay if we are out of NC forcers and haven't run out of things to do
        if (
          !elevatorAction &&
          myDaycount() < toInt(getProperty("auto_runDayCount")) &&
          !isAboutToPowerlevel()
        ) {
          return false;
        }
      }
    }

    if (!elevatorAction) {
      auto_log_info(
        `Hidden Apartment Progress: ${getProperty("hiddenApartmentProgress")}`,
        "blue",
      );

      const turnsUntilElevatorAction: number = zone_delay(
        $location`The Hidden Apartment Building`,
      )._int;

      if (
        auto_have_familiar($familiar`Nosy Nose`) &&
        auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
      ) {
        if (
          haveEffect($effect`Thrice-Cursed`) < turnsUntilElevatorAction + 1 &&
          (auto_combat_appearance_rates$1(
            $location`The Hidden Apartment Building`,
          ).get($monster`pygmy shaman`) ??
            auto_combat_appearance_rates$1(
              $location`The Hidden Apartment Building`,
            )
              .set($monster`pygmy shaman`, 0.0)
              .get($monster`pygmy shaman`)) < 100
        ) {
          handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of shamen. the deleveling can also help survive being cursed
        } else if (
          (auto_combat_appearance_rates$1(
            $location`The Hidden Office Building`,
          ).get($monster`pygmy witch accountant`) ??
            auto_combat_appearance_rates$1(
              $location`The Hidden Office Building`,
            )
              .set($monster`pygmy witch accountant`, 0.0)
              .get($monster`pygmy witch accountant`)) >= 20 &&
          itemAmount($item`McClusky file (complete)`) === 0
        ) {
          //once done with curses will want witch accountants
          if (
            itemAmount($item`McClusky file (page 4)`) === 0 ||
            toMonster(getProperty("nosyNoseMonster")) ===
              $monster`pygmy witch accountant`
          ) {
            handleFamiliar$1($familiar`Nosy Nose`);
          }
        }
      }
      return autoAdv$2($location`The Hidden Apartment Building`);
    } else {
      if (haveEffect($effect`Thrice-Cursed`) === 0) {
        //can drink and inebriety allows it
        if (canDrinkCursedPunch) {
          L11_hiddenTavernUnlock$1(true);
          if (
            myAscensions() === toInt(getProperty("hiddenTavernUnlock")) &&
            !is_werewolf()
          ) {
            auto_buyUpTo(cursesNeeded, $item`Cursed Punch`);
            if (itemAmount($item`Cursed Punch`) < cursesNeeded) {
              abort(
                "Could not acquire Cursed Punch, unable to deal with Hidden Apartment Properly",
              );
            }
            autoDrink(cursesNeeded, $item`Cursed Punch`);
          }
        }
      } else {
        setProperty(
          "auto_nextEncounter",
          "ancient protector spirit (The Hidden Apartment Building)",
        );
      }
      auto_log_info(
        `Hidden Apartment Progress: ${getProperty("hiddenApartmentProgress")}`,
        "blue",
      );
      return autoAdv$2($location`The Hidden Apartment Building`);
    }
  }

  if (
    internalQuestStatus("questL11Business") === 0 &&
    myAdventures() + $location`The Hidden Office Building`.turnsSpent >= 11
  ) {
    auto_log_info("The idden [sic] office!", "blue");

    if (creatableAmount($item`McClusky file (complete)`) > 0) {
      create(1, $item`McClusky file (complete)`);
      if (itemAmount($item`McClusky file (complete)`) === 0) {
        abort("Failed to create $item[McClusky file (complete)]");
      }
    }

    const turnsUntilWorkingHoliday: number = zone_delay(
      $location`The Hidden Office Building`,
    )._int;
    let workingHoliday: boolean =
      turnsUntilWorkingHoliday === 0 || auto_haveQueuedForcedNonCombat();

    if (
      turnsUntilWorkingHoliday > 1 &&
      itemAmount($item`McClusky file (complete)`) > 0 &&
      auto_canForceNextNoncombat()
    ) {
      if (auto_forceNextNoncombat$1($location`The Hidden Office Building`)) {
        //how many delay turns should this save to be considered?
        workingHoliday = true;
      } else if (
        myDaycount() < toInt(getProperty("auto_runDayCount")) &&
        !isAboutToPowerlevel()
      ) {
        // delay if we are out of NC forcers and haven't run out of things to do
        return false;
      }
    }

    function missingMcCluskyFiles(): number {
      //files are obtained in order
      if (itemAmount($item`McClusky file (complete)`) > 0) {
        return 0;
      } else if (itemAmount($item`McClusky file (page 5)`) > 0) {
        return 0;
      } else if (itemAmount($item`McClusky file (page 4)`) > 0) {
        return 1;
      } else if (itemAmount($item`McClusky file (page 3)`) > 0) {
        return 2;
      } else if (itemAmount($item`McClusky file (page 2)`) > 0) {
        return 3;
      } else if (itemAmount($item`McClusky file (page 1)`) > 0) {
        return 4;
      } else {
        return 5;
      }
    }

    if (!workingHoliday && missingMcCluskyFiles() > 0) {
      //need more accountants
      if (
        auto_have_familiar($familiar`Nosy Nose`) &&
        auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
        (auto_combat_appearance_rates$1(
          $location`The Hidden Office Building`,
        ).get($monster`pygmy witch accountant`) ??
          auto_combat_appearance_rates$1($location`The Hidden Office Building`)
            .set($monster`pygmy witch accountant`, 0.0)
            .get($monster`pygmy witch accountant`)) < 100
      ) {
        handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
      }
    }

    auto_log_info(
      `Hidden Office Progress: ${getProperty("hiddenOfficeProgress")}`,
      "blue",
    );

    if (
      workingHoliday &&
      itemAmount($item`boring binder clip`) > 0 &&
      missingMcCluskyFiles() > 0 &&
      (auto_combat_appearance_rates$1(
        $location`The Hidden Apartment Building`,
      ).get($monster`pygmy witch accountant`) ??
        auto_combat_appearance_rates$1($location`The Hidden Apartment Building`)
          .set($monster`pygmy witch accountant`, 0.0)
          .get($monster`pygmy witch accountant`)) >=
        missingMcCluskyFiles() * 25
    ) {
      //Hidden Apartment unmodified 25% chance of accountant is better if only 1 missingMcCluskyFiles
      //office noncombat is already one guaranteed accountant so with more missingMcCluskyFiles only go Apartment if better rate
      auto_log_info(
        "About to meet the boss in the Hidden Office. Trying to gather missing files in the Apartment instead to save delay.",
        "blue",
      );
      if (
        auto_have_familiar($familiar`Nosy Nose`) &&
        auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
      ) {
        handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
      }
      return autoAdv$2($location`The Hidden Apartment Building`);
    }

    if (workingHoliday && itemAmount($item`McClusky file (complete)`) > 0) {
      setProperty(
        "auto_nextEncounter",
        "ancient protector spirit (The Hidden Office Building)",
      );
    }
    return autoAdv$2($location`The Hidden Office Building`);
  }

  if (internalQuestStatus("questL11Spare") === 0) {
    auto_log_info("The idden [sic] bowling alley!", "blue");
    L11_hiddenTavernUnlock$1(true);
    if (myAscensions() === toInt(getProperty("hiddenTavernUnlock"))) {
      if (itemAmount($item`Bowl of Scorpions`) === 0 && !is_werewolf()) {
        //can't access shops as werewolf
        auto_buyUpTo(1, $item`Bowl of Scorpions`);
        if (in_ocrs()) {
          auto_buyUpTo(3, $item`Bowl of Scorpions`);
        }
      }
    }

    buffMaintain$4($effect`Fishy Whiskers`);
    auto_log_info(
      `Hidden Bowling Alley Progress: ${getProperty("hiddenBowlingAlleyProgress")}`,
      "blue",
    );
    if (
      canSniff($monster`pygmy bowler`, $location`The Hidden Bowling Alley`) &&
      itemAmount($item`bowling ball`) < 1 &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a Pygmy Bowler.",
      );
    }
    if (
      auto_canCamelSpit() &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) < 2
    ) {
      auto_log_info$1(
        "Bringing the Camel to spit on a Pygmy Bowler for bowling balls.",
      );
      handleFamiliar$1($familiar`Melodramedary`);
    }
    if (
      auto_haveGreyGoose() &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) < 3
    ) {
      auto_log_info$1(
        "Bringing the Grey Goose to emit some drones at a Pygmy Bowler for bowling balls.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (
      itemAmount($item`bowling ball`) > 0 &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) === 5
    ) {
      setProperty(
        "auto_nextEncounter",
        "ancient protector spirit (The Hidden Bowling Alley)",
      );
    }
    return autoAdv$2($location`The Hidden Bowling Alley`);
  }

  if (internalQuestStatus("questL11Doctor") === 0) {
    if (itemAmount($item`dripping stone sphere`) > 0) {
      return true;
    }
    auto_log_info("The idden [sic] ospital!", "blue");

    autoEquip$1($item`bloodied surgical dungarees`);
    autoEquip$1($item`half-size scalpel`);
    autoEquip$1($item`surgical apron`);
    autoEquip($slot`acc3`, $item`head mirror`);
    autoEquip($slot`acc2`, $item`surgical mask`);

    let surgeonGearWanted: number = 0;
    for (const it of $items`bloodied surgical dungarees, half-size scalpel, surgical apron, head mirror, surgical mask`) {
      if (!possessEquipment(it) && auto_can_equip(it)) {
        surgeonGearWanted += 1;
      }
    }
    if (surgeonGearWanted > 0) {
      //need more surgeons?
      if (
        auto_have_familiar($familiar`Nosy Nose`) &&
        auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
        (auto_combat_appearance_rates$1($location`The Hidden Hospital`).get(
          $monster`pygmy witch surgeon`,
        ) ??
          auto_combat_appearance_rates$1($location`The Hidden Hospital`)
            .set($monster`pygmy witch surgeon`, 0.0)
            .get($monster`pygmy witch surgeon`)) < 100
      ) {
        if (
          surgeonGearWanted >= 2 ||
          toMonster(getProperty("nosyNoseMonster")) ===
            $monster`pygmy witch surgeon`
        ) {
          handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
        }
      }
    }
    auto_log_info(
      `Hidden Hospital Progress: ${getProperty("hiddenHospitalProgress")}`,
      "blue",
    );
    return autoAdv$2($location`The Hidden Hospital`);
  }

  if (itemAmount($item`moss-covered stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv$2($location`An Overgrown Shrine (Northwest)`);
  }

  if (itemAmount($item`crackling stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv$2($location`An Overgrown Shrine (Northeast)`);
  }

  if (itemAmount($item`dripping stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv$2($location`An Overgrown Shrine (Southwest)`);
  }

  if (itemAmount($item`scorched stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv$2($location`An Overgrown Shrine (Southeast)`);
  }

  if (itemAmount($item`stone triangle`) === 4) {
    auto_log_info("Fighting the out-of-work spirit", "blue");
    acquireHP();
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$3($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$3($effect`Tricky Timpani`, 30, 1, 10);
    }
    setProperty("auto_nextEncounter", "Protector Spectre");
    handleFamiliar("boss");
    const advSpent: boolean = autoAdv$2($location`A Massive Ziggurat`);
    if (internalQuestStatus("questL11MacGuffin") > 2) {
      // Actually Ed finishes this quest when all 3 parts of the staff are returned
      council();
    }
    return advSpent;
  }

  return false;
}

export function L11_hiddenCityZones(): boolean {
  if (
    internalQuestStatus("questL11Worship") < 3 ||
    internalQuestStatus("questL11Worship") > 4
  ) {
    return false;
  }

  function equipMachete(): boolean {
    if (in_avantGuard()) {
      return false; //combats aren't free so no point in equipping a Machete
    }
    if (auto_can_equip($item`antique machete`)) {
      if (possessEquipment($item`antique machete`)) {
        return autoForceEquip$3($item`antique machete`);
      } else if (
        !possessEquipment($item`muculent machete`) &&
        canPull$1($item`antique machete`)
      ) {
        pullXWhenHaveY($item`antique machete`, 1, 0);
        return autoForceEquip$3($item`antique machete`);
      }
    }
    if (auto_can_equip($item`muculent machete`)) {
      if (
        !possessEquipment($item`muculent machete`) &&
        canPull$1($item`muculent machete`)
      ) {
        pullXWhenHaveY($item`muculent machete`, 1, 0);
      }
      return autoForceEquip$3($item`muculent machete`);
    }
    return false;
  }

  L11_hiddenTavernUnlock();

  const canUseMachete: boolean =
    !is_boris() && !in_wotsf() && !in_pokefam() && !in_avantGuard();
  const needMachete: boolean =
    canUseMachete &&
    !possessEquipment($item`antique machete`) &&
    (inHardcore() || in_lol());
  const needRelocate: boolean =
    toInt(getProperty("relocatePygmyJanitor")) !== myAscensions();

  if (needMachete || needRelocate) {
    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      auto_changeSnapperPhylum($phylum`dude`);
    }
    return autoAdv$2($location`The Hidden Park`);
  }

  if (toInt(getProperty("breathitinCharges")) > 0) {
    // Shrines & Ziggurat are outdoor zones with free combats. Let's not waste Breathitin charges.
    return false;
  }

  if (auto_habitatFightsLeft() > 0) {
    // Don't waste habitat wanderers clearing dense liana's
    return false;
  }

  if (toInt(getProperty("hiddenApartmentProgress")) === 0) {
    if (canUseMachete && !equipMachete()) {
      return false;
    }
    if (!canUseMachete && auto_haveTearawayPants()) {
      autoForceEquip$3($item`tearaway pants`);
    }
    return autoAdv$2($location`An Overgrown Shrine (Northwest)`);
  }

  if (toInt(getProperty("hiddenOfficeProgress")) === 0) {
    if (canUseMachete && !equipMachete()) {
      return false;
    }
    if (!canUseMachete && auto_haveTearawayPants()) {
      autoForceEquip$3($item`tearaway pants`);
    }
    return autoAdv$2($location`An Overgrown Shrine (Northeast)`);
  }

  if (toInt(getProperty("hiddenHospitalProgress")) === 0) {
    if (canUseMachete && !equipMachete()) {
      return false;
    }
    if (!canUseMachete && auto_haveTearawayPants()) {
      autoForceEquip$3($item`tearaway pants`);
    }
    return autoAdv$2($location`An Overgrown Shrine (Southwest)`);
  }

  if (toInt(getProperty("hiddenBowlingAlleyProgress")) === 0) {
    if (canUseMachete && !equipMachete()) {
      return false;
    }
    if (!canUseMachete && auto_haveTearawayPants()) {
      autoForceEquip$3($item`tearaway pants`);
    }
    return autoAdv$2($location`An Overgrown Shrine (Southeast)`);
  }

  if (!toBoolean(getProperty("auto_openedziggurat"))) {
    if (canUseMachete && !equipMachete()) {
      return false;
    }
    if (!canUseMachete && auto_haveTearawayPants()) {
      autoForceEquip$3($item`tearaway pants`);
    }
    const advSpent: boolean = autoAdv$2($location`A Massive Ziggurat`);
    if (
      getProperty("lastEncounter") ===
        "Legend of the Temple in the Hidden City" ||
      (isActuallyEd() &&
        getProperty("lastEncounter") ===
          "Temple of the Legend in the Hidden City")
    ) {
      setProperty("auto_openedziggurat", true.toString());
    }
    return advSpent;
  }
  return false;
}

export function L11_mauriceSpookyraven(): boolean {
  if (
    internalQuestStatus("questL11Manor") < 0 ||
    internalQuestStatus("questL11Manor") > 3 ||
    internalQuestStatus("questM21Dance") < 4
  ) {
    return false;
  }

  if (
    (isActuallyEd() && itemAmount($item`[7962]Eye of Ed`) === 0) ||
    itemAmount($item`[2286]Eye of Ed`) > 0
  ) {
    return true;
  }
  if (in_robot() && myLevel() < 13) {
    return false; //delay fight so we can make sure we are strong enough to beat him
  }

  if (internalQuestStatus("questL11Manor") < 1) {
    auto_log_info("Searching for the basement of Spookyraven", "blue");
    if (!lar_repeat($location`The Haunted Ballroom`)) {
      return false;
    }

    if (auto_wantToSpadeDigSkeleton($location`The Haunted Ballroom`)) {
      return auto_spadeDigSkeleton();
    }
    if (canBurnDelay($location`The Haunted Ballroom`)) {
      // We'll All Be Flat choice adventure has a delay of 5 adventures.
      return false;
    }
    return autoAdv$2($location`The Haunted Ballroom`);
  }
  if (itemAmount($item`recipe: mortar-dissolving solution`) === 0) {
    if (possessEquipment($item`Lord Spookyraven's spectacles`)) {
      equip($slot`acc3`, $item`Lord Spookyraven's spectacles`);
    }
    visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
    use(1, $item`recipe: mortar-dissolving solution`);
  }

  if (internalQuestStatus("questL11Manor") > 2) {
    if (is_professor()) {
      return false; //Can't beat Lord Spookyraven as the Professor
    }
    auto_log_info("Down with the tyrant of Spookyraven!", "blue");
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$3($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$3($effect`Tricky Timpani`, 30, 1, 10);
    }
    acquireHP();
    const resGoal: Map<Element, number> = new Map();
    for (const ele of $elements`hot, cold, stench, sleaze, spooky`) {
      resGoal.set(ele, 3);
    }
    provideResistances$4(resGoal, $location`Summoning Chamber`, false);
    // The autoAdvBypass case is probably suitable for Ed but we'd need to verify it.
    if (isActuallyEd()) {
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberboss");
      if (internalQuestStatus("questL11MacGuffin") > 2) {
        // Actually Ed finishes this quest when all 3 parts of the staff are returned
        council();
      }
    } else {
      setProperty("auto_nonAdvLoc", true.toString());
      autoAdv$2($location`Summoning Chamber`);
    }
    return true;
  }

  if (!toBoolean(getProperty("auto_haveoven"))) {
    ovenHandle();
  }

  if (itemAmount($item`wine bomb`) === 1) {
    visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
    if (internalQuestStatus("questL11Manor") === 3) {
      return true;
    } else {
      abort("Tried to use the wine bomb but it somehow failed?");
    }
  }

  if (
    !possessEquipment($item`Lord Spookyraven's spectacles`) ||
    is_boris() ||
    in_wotsf() ||
    in_bhy() ||
    in_robot() ||
    (in_nuclear() && !toBoolean(getProperty("auto_haveoven")))
  ) {
    auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
    // I suppose we can let anyone in without the Spectacles.
    if (itemAmount($item`loosening powder`) === 0) {
      return autoAdv$2($location`The Haunted Kitchen`);
    }
    if (itemAmount($item`powdered castoreum`) === 0) {
      return autoAdv$2($location`The Haunted Conservatory`);
    }
    if (itemAmount($item`drain dissolver`) === 0) {
      return autoAdv$2($location`The Haunted Bathroom`);
    }
    if (itemAmount($item`triple-distilled turpentine`) === 0) {
      return autoAdv$2($location`The Haunted Gallery`);
    }
    //3rd floor unlock fix. can manually adv without starting quest. but autoAdv fails until quest is started. so start the quest
    if (internalQuestStatus("questM17Babies") === -1) {
      visitUrl("place.php?whichplace=manor3&action=manor3_ladys"); //talk to 3rd floor ghost to start quest
    }
    if (itemAmount($item`detartrated anhydrous sublicalc`) === 0) {
      return autoAdv$2($location`The Haunted Laboratory`);
    }
    if (itemAmount($item`triatomaceous dust`) === 0) {
      return autoAdv$2($location`The Haunted Storage Room`);
    }

    visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
    return true;
  }

  if (
    itemAmount($item`blasting soda`) === 1 &&
    itemAmount($item`bottle of Chateau de Vinegar`) === 1
  ) {
    auto_log_info(
      "Time to cook up something explosive! Science fair unstable fulminate time!",
      "green",
    );
    ovenHandle();
    autoCraft(
      "cook",
      1,
      $item`bottle of Chateau de Vinegar`,
      $item`blasting soda`,
    );
    if (itemAmount($item`unstable fulminate`) === 0) {
      auto_log_warning(
        "We could not make an Unstable Fulminate but we think we have an oven. Do this manually and resume?",
        "red",
      );
      auto_log_warning(
        "Speculating that get_campground() was incorrect at ascension start...",
        "red",
      );
      // This issue is valid as of mafia r16799
      setProperty("auto_haveoven", false.toString());
      ovenHandle();
      autoCraft(
        "cook",
        1,
        $item`bottle of Chateau de Vinegar`,
        $item`blasting soda`,
      );
      if (itemAmount($item`unstable fulminate`) === 0) {
        if (in_nuclear()) {
          auto_log_warning(
            "Could not make an Unstable Fulminate, assuming we have no oven for realz...",
            "red",
          );
          return true;
        } else {
          abort(
            "Could not make an Unstable Fulminate, make it manually and resume",
          );
        }
      }
    }
  }

  if (getProperty("spookyravenRecipeUsed") !== "with_glasses") {
    abort(
      "Did not read Mortar Recipe with the Spookyraven glasses. We can't proceed.",
    );
  }

  if (auto_reserveUndergroundAdventures()) {
    return false;
  }

  if (
    itemAmount($item`bottle of Chateau de Vinegar`) === 0 &&
    !possessEquipment($item`unstable fulminate`) &&
    internalQuestStatus("questL11Manor") < 3
  ) {
    if (
      isBanished($phylum`construct`) &&
      toInt(getProperty("screechCombats")) > 0
    ) {
      setProperty("screechDelay", "construct");
      return false; //No sense in trying to go to the Wine Cellar if constructs (Wine Racks) are banished
    }

    auto_log_info("Searching for vinegar", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats$1();
    }
    if (
      friarsAvailable() &&
      !toBoolean(getProperty("friarsBlessingReceived"))
    ) {
      cliExecute("friars booze");
    }
    if (
      canSniff(
        $monster`possessed wine rack`,
        $location`The Haunted Wine Cellar`,
      ) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a Possessed Wine Rack.",
      );
    }
    return autoAdv$2($location`The Haunted Wine Cellar`);
  }
  if (
    itemAmount($item`blasting soda`) === 0 &&
    !possessEquipment($item`unstable fulminate`) &&
    internalQuestStatus("questL11Manor") < 3
  ) {
    if (
      isBanished($phylum`undead`) &&
      toInt(getProperty("screechCombats")) > 0
    ) {
      setProperty("screechDelay", "undead");
      return false; //No sense in trying to go to the Laundry Room if undead (Cabinet of Dr. Limpieza) are banished
    }

    auto_log_info("Searching for baking soda, I mean, blasting pop.", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats$1();
    }
    auto_lostStomach$1(true);
    if (
      canSniff(
        $monster`cabinet of Dr. Limpieza`,
        $location`The Haunted Laundry Room`,
      ) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a Cabinet of Dr. Limpieza.",
      );
    }
    return autoAdv$2($location`The Haunted Laundry Room`);
  }

  if (
    possessEquipment($item`unstable fulminate`) &&
    internalQuestStatus("questL11Manor") < 3
  ) {
    // Zootomist probably wants to wait until D2 in SC for this.
    if (auto_inRonin() && in_zootomist()) {
      if (auto_waitForDay2()) {
        auto_log_debug$1("Delaying Monstrous Boiler waiting for day 2.");
        return false;
      }
    }

    auto_MaxMLToCap(auto_convertDesiredML(82), true);
    addToMaximize(`500ml ${auto_convertDesiredML(82)}max`);

    if (in_picky() && itemAmount($item`gumshoes`) > 0) {
      auto_change_mcd(0);
      autoEquip($slot`acc2`, $item`gumshoes`);
    }

    if (is_professor()) {
      // +ML is BAD for professor
      auto_change_mcd(0);
      removeFromMaximize(`500ml ${auto_convertDesiredML(82)}max`);
    }

    if (monsterLevelAdjustment() < 57) {
      buffMaintain$4($effect`Sweetbreads Flambé`);
    }

    if (!autoForceEquip$1($slot`off-hand`, $item`unstable fulminate`)) {
      abort(
        "Unstable Fulminate was not equipped. Please report this and include the following: Equipped items and if you have or don't have an Unstable Fulminate. For now, get the wine bomb manually, and run again.",
      );
    }

    auto_log_info("Now we mix and heat it up.", "blue");
    return autoAdv$2($location`The Haunted Boiler Room`);
  }
  return false;
}

function L11_redZeppelin(): boolean {
  if (internalQuestStatus("questL11Shen") < 8 && !isAboutToPowerlevel()) {
    return false;
  }

  if (
    internalQuestStatus("questL11Ron") < 0 ||
    internalQuestStatus("questL11Ron") > 1
  ) {
    return false;
  }

  if (internalQuestStatus("questL11Ron") === 0) {
    return autoAdv$2($location`A Mob of Zeppelin Protesters`);
  }
  // TODO: create lynyrd skin items

  setProperty("choiceAdventure856", (1).toString());
  if (auto_haveCCSC()) {
    setProperty("choiceAdventure857", (2).toString());
  } else {
    setProperty("choiceAdventure857", (1).toString());
  }
  setProperty("choiceAdventure858", (1).toString());
  buffMaintain$4($effect`Greasy Peasy`);
  buffMaintain$4($effect`Musky`);
  buffMaintain$4($effect`Blood-Gorged`);
  if (!in_wotsf()) {
    pullXWhenHaveY($item`deck of lewd playing cards`, 1, 0);
  }

  if (itemAmount($item`Flamin' Whatshisname`) > 0) {
    backupSetting("choiceAdventure866", (3).toString());
  } else {
    backupSetting("choiceAdventure866", (2).toString());
  }

  addToMaximize("100sleaze damage,100sleaze spell damage");
  if (auto_is_valid$3($effect`Oiled, Slick`)) {
    auto_beachCombHead("sleaze");
  }
  for (const sl of $slots`acc1, acc2, acc3`) {
    if (
      numericModifier(equippedItem(sl), "sleaze damage") +
        numericModifier(equippedItem(sl), "sleaze spell damage") <
      60
    ) {
      if (
        itemAmount($item`mini kiwi`) >= 2 &&
        equipmentAmount($item`mini kiwi bikini`) < 3 &&
        auto_is_valid($item`mini kiwi bikini`)
      ) {
        create(1, $item`mini kiwi bikini`);
      }
    }
  }

  equipMaximizedGear();

  if (
    auto_is_valid($item`lynyrd snare`) &&
    itemAmount($item`lynyrd snare`) > 0 &&
    toInt(getProperty("_lynyrdSnareUses")) < 3 &&
    myHp() > 150
  ) {
    return autoAdvBypass$1(
      "inv_use.php?pwd=&whichitem=7204&checked=1",
      $location`A Mob of Zeppelin Protesters`,
    );
  }

  if (
    toInt(getProperty("zeppelinProtestors")) < 75 &&
    cloversAvailable$1() > 0
  ) {
    // "zeppelinProtestors" is number killed so far, so it ends when we hit 80
    if (cloversAvailable$1() >= 3) {
      if (!in_koe() || myDaycount() > 1) {
        // in koe, if d1 save bend hell for invader
        buffMaintain$3($effect`Bendin' Hell`, 0, 0, 1);
      }
      for (const ef of $effects`Dirty Pear, Fifty Ways to Bereave Your Lover`) {
        // double sleaze dmg, +100 sleaze dmg,
        let target_sleaze: number = 400;
        const current_sleaze: number =
          numericModifier(Modifier.get("Sleaze Damage")) +
          numericModifier(Modifier.get("Sleaze Spell Damage"));
        if (
          possessEquipment($item`candy cane sword cane`) &&
          auto_is_valid($item`candy cane sword cane`)
        ) {
          target_sleaze = 190; // We need so much less sleaze damage with the candy cane sword doubling
        }
        if (current_sleaze < target_sleaze) {
          if (haveEffect(ef) === 0) {
            auto_wishForEffect(ef);
          }
        }
      } // effects
    } // have clovers
    if (in_tcrs()) {
      if (myClass() === $class`Sauceror` && mySign() === "Blender") {
        if (0 === haveEffect($effect`Improprie Tea`)) {
          auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
          use(1, $item`Ben-Gal™ Balm`);
        }
      }
    }
    const fire_protestors: number =
      itemAmount($item`Flamin' Whatshisname`) > 0 ? 10 : 3;
    let sleaze_amount: number =
      numericModifier("sleaze damage") + numericModifier("sleaze spell damage");
    if (auto_haveCCSC()) {
      sleaze_amount = sleaze_amount * 2;
    }
    const sleaze_protestors: number = squareRoot(sleaze_amount);
    let lynyrd_protestors: number = haveEffect($effect`Musky`) > 0 ? 6 : 3;
    for (const it of $items`lynyrdskin cap, lynyrdskin tunic, lynyrdskin breeches`) {
      if (possessEquipment(it) && canEquip(it)) {
        lynyrd_protestors += 5;
      }
    }
    auto_log_info(`Hiding in the bushes: ${lynyrd_protestors}`, "blue");
    auto_log_info(`Going to a bench: ${sleaze_protestors}`, "blue");
    auto_log_info(`Heading towards the flames${fire_protestors}`, "blue");
    const best_protestors: number = max(
      fire_protestors,
      max(sleaze_protestors, lynyrd_protestors),
    );
    if (best_protestors >= 10) {
      if (best_protestors === lynyrd_protestors) {
        for (const it of $items`lynyrdskin cap, lynyrdskin tunic, lynyrdskin breeches`) {
          autoEquip$1(it);
        }
        setProperty("choiceAdventure866", (1).toString());
      } else if (best_protestors === sleaze_protestors) {
        setProperty("choiceAdventure866", (2).toString());
      } else if (best_protestors === fire_protestors) {
        setProperty("choiceAdventure866", (3).toString());
      }
      return autoLuckyAdv$1($location`A Mob of Zeppelin Protesters`);
    }
  }

  if (auto_waitForDay2()) {
    auto_log_debug$1("Delaying zeppelin protestors waiting for day 2 clovers.");
    return false;
  }

  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    auto_changeSnapperPhylum($phylum`dude`);
  }

  const lastProtest: number = toInt(getProperty("zeppelinProtestors"));
  if (
    canSniff(
      $monster`Blue Oyster cultist`,
      $location`A Mob of Zeppelin Protesters`,
    ) &&
    auto_mapTheMonsters()
  ) {
    auto_log_info$1(
      "Attemping to use Map the Monsters to olfact a Blue Oyster Cultist.",
    );
  }
  const retval: boolean = autoAdv$2($location`A Mob of Zeppelin Protesters`);
  if (!lastAdventureSpecialNC()) {
    if (lastProtest === toInt(getProperty("zeppelinProtestors"))) {
      setProperty(
        "zeppelinProtestors",
        (toInt(getProperty("zeppelinProtestors")) + 1).toString(),
      );
    }
  } else {
    setProperty("lastEncounter", "Clear Special NC");
  }
  restoreSetting("choiceAdventure866");
  setProperty("choiceAdventure856", (2).toString());
  setProperty("choiceAdventure857", (2).toString());
  setProperty("choiceAdventure858", (2).toString());
  return retval;
}

function L11_ronCopperhead(): boolean {
  if (
    internalQuestStatus("questL11Ron") < 2 ||
    internalQuestStatus("questL11Ron") > 4
  ) {
    return false;
  }

  if (
    internalQuestStatus("questL11Ron") > 1 &&
    internalQuestStatus("questL11Ron") < 5
  ) {
    if (
      itemAmount($item`Red Zeppelin ticket`) < 1 &&
      !in_wotsf() &&
      !is_werewolf()
    ) {
      // no black market in wotsf, can't access as werewolf
      // use the priceless diamond since we go to the effort of trying to get one in the Copperhead Club
      // and it saves us 4.5k meat.
      if (itemAmount($item`priceless diamond`) > 0) {
        buy($coinmaster`The Black Market`, 1, $item`Red Zeppelin ticket`);
      } else if (myMeat() > npcPrice($item`Red Zeppelin ticket`)) {
        auto_buyUpTo(1, $item`Red Zeppelin ticket`);
      }
    }
    // For Glark Cables. OPTIMAL!
    bat_formBats$1();
    if (
      canSniff($monster`red butler`, $location`The Red Zeppelin`) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a Red Butler.",
      );
    }
    if (auto_canCamelSpit()) {
      auto_log_info$1(
        "Bringing the Camel to spit on a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Melodramedary`);
    }
    if (auto_haveGreyGoose()) {
      auto_log_info$1(
        "Bringing the Grey Goose to emit some drones at a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (internalQuestStatus("questL11Ron") === 4) {
      setProperty("auto_nextEncounter", 'Ron "The Weasel" Copperhead');
    }
    const retval: boolean = autoAdv$2($location`The Red Zeppelin`);
    // open red boxes when we get them (not sure if this is the place for this but it'll do for now)
    if (itemAmount($item`red box`) > 0) {
      use(itemAmount($item`red box`), $item`red box`);
    }
    return retval;
  }

  if (internalQuestStatus("questL11Ron") < 5) {
    abort("Ron should be done with but tracking is not complete!");
  }
  // Copperhead Charm (rampant) autocreated successfully
  return false;
}

export function L11_shenStartQuest(): boolean {
  // as the first adventure in the Copperhead Club is always the first Shen NC
  // we can adventure there once as soon as it's open to start the quest and lock in
  // our zones
  if (internalQuestStatus("questL11Shen") !== 0) {
    return false;
  }

  auto_log_info(
    "Going to see the World's Biggest Jerk about some snakes and stones and stuff.",
    "blue",
  );
  if (autoAdv$2($location`The Copperhead Club`)) {
    if (internalQuestStatus("questL11Shen") === 1) {
      auto_log_info("It seems Shen has given us a quest.", "blue");
      auto_log_info$1(
        "I am going to avoid the following zones until Shen tells me to go there or until I run out of other things to do:",
      );
      let linec: number = 1;
      for (const z of shenZonesToAvoidBecauseMaybeSnake()) {
        auto_log_info$1(`${linec++}. ${z}`);
        setProperty(
          "auto_shenZonesTurnsSpent",
          `${getProperty("auto_shenZonesTurnsSpent")}${z}:${z.turnsSpent};`,
        );
      }
      setProperty(
        "auto_lastShenTurn",
        $location`The Copperhead Club`.turnsSpent.toString(),
      );
    }
    return true;
  }
  return false;
}

export function L11_shenCopperhead(): boolean {
  if (
    internalQuestStatus("questL11Shen") < 0 ||
    internalQuestStatus("questL11Shen") > 7
  ) {
    return false;
  }

  if (L11_shenStartQuest()) {
    return true;
  }

  if (internalQuestStatus("questL11Shen") < 1) {
    // if we haven't spoke to Shen for the first time yet, don't try to handle the quest.
    return false;
  }

  if (isBanished($phylum`dude`) && toInt(getProperty("screechCombats")) > 0) {
    setProperty("screechDelay", "dude");
    return false; //Probably should delay the Copperhead Club because dudes are important here
  }

  if (
    internalQuestStatus("questL11Shen") === 2 ||
    internalQuestStatus("questL11Shen") === 4 ||
    internalQuestStatus("questL11Shen") === 6
  ) {
    if (is_professor()) {
      return false; //can't do Copperhead Club as a Professor but can do other parts of Shen quest
    }
    if (
      itemAmount($item`crappy waiter disguise`) > 0 &&
      haveEffect($effect`Crappily Disguised as a Waiter`) === 0 &&
      !in_tcrs()
    ) {
      use(1, $item`crappy waiter disguise`);
      // default to getting unnamed cocktails to turn into Flamin' Whatsisnames.
      let behindtheStacheOption: number = 4;
      if (
        itemAmount($item`priceless diamond`) > 0 ||
        itemAmount($item`Red Zeppelin ticket`) > 0 ||
        myMeat() > 10000 ||
        (internalQuestStatus("questL11Shen") === 6 &&
          itemAmount($item`unnamed cocktail`) > 0)
      ) {
        if (getProperty("copperheadClubHazard") !== "lantern") {
          // got priceless diamond or zeppelin ticket (or we are rich) so lets burn the place down (and make Flamin' Whatsisnames)
          behindtheStacheOption = 3;
        }
      } else if (
        haveEquipped($item`candy cane sword cane`) &&
        itemAmount($item`priceless diamond`) === 0 &&
        itemAmount($item`Red Zeppelin ticket`) === 0
      ) {
        behindtheStacheOption = 5;
      } else {
        if (getProperty("copperheadClubHazard") !== "ice") {
          // knock over the ice bucket & try for the priceless diamond.
          behindtheStacheOption = 2;
        }
      }
      setProperty("choiceAdventure855", behindtheStacheOption.toString());
    }

    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      auto_changeSnapperPhylum($phylum`dude`);
    }
    // monster level increases zone damage
    addToMaximize("-10ml");
    uneffect($effect`Ur-Kel's Aria of Annoyance`);
    if (autoAdv$2($location`The Copperhead Club`)) {
      if (containsText(getProperty("lastEncounter"), "Shen Copperhead, ")) {
        setProperty(
          "auto_lastShenTurn",
          $location`The Copperhead Club`.turnsSpent.toString(),
        );
      }
      return true;
    }
    return false;
  }

  if (
    internalQuestStatus("questL11Shen") === 1 ||
    internalQuestStatus("questL11Shen") === 3 ||
    internalQuestStatus("questL11Shen") === 5
  ) {
    let it: Item = toItem(getProperty("shenQuestItem"));
    if (it === Item.none && isActuallyEd()) {
      // temp workaround until mafia bug is fixed - https://kolmafia.us/showthread.php?23742
      cliExecute("refresh quests");
      it = toItem(getProperty("shenQuestItem"));
    }
    let goal: Location = Location.none;
    switch (it) {
      case $item`The Stankara Stone`:
        goal = $location`The Batrat and Ratbat Burrow`;
        break;
      case $item`The First Pizza`:
        goal = $location`Lair of the Ninja Snowmen`;
        break;
      case $item`Murphy's Rancid Black Flag`:
        goal = $location`The Castle in the Clouds in the Sky (Top Floor)`;
        break;
      case $item`The Eye of the Stars`:
        goal = $location`The Hole in the Sky`;
        break;
      case $item`The Lacrosse Stick of Lacoronado`:
        goal = $location`The Smut Orc Logging Camp`;
        break;
      case $item`The Shield of Brook`:
        goal = $location`The Unquiet Garves`;
        break;
    }
    if (goal === Location.none) {
      abort("Could not parse Shen event");
    }

    if (!zone_isAvailable$1(goal)) {
      // handle paths which don't need Tower keys but the World's Biggest Jerk asks for The Eye of the Stars
      if (goal === $location`The Hole in the Sky`) {
        if (!toBoolean(getProperty("auto_holeinthesky"))) {
          setProperty("auto_holeinthesky", true.toString());
        }
        return L10_topFloor() || L10_holeInTheSkyUnlock();
      }
      return false;
    } else {
      // If we haven't completed the top floor, try to complete it.
      if (
        goal === $location`The Castle in the Clouds in the Sky (Top Floor)` &&
        (L10_topFloor() || L10_holeInTheSkyUnlock())
      ) {
        return true;
      } else if (
        goal === $location`The Smut Orc Logging Camp` &&
        (L9_ed_chasmStart() || L9_chasmBuild())
      ) {
        return true;
      } else if (auto_wantToSpadeDigSkeleton(goal)) {
        return auto_spadeDigSkeleton();
      }
      if (canBurnDelay(goal)) {
        // Snakes have variable delay of 3-5 adventures but we can burn at least 3 of that.
        return false;
      }

      return autoAdv$2(goal);
    }
  }

  if (internalQuestStatus("questL11Shen") < 8) {
    abort(
      `Shen should be done with but tracking is not complete! Status: ${getProperty("questL11Shen")}`,
    );
  }
  //Now have a Copperhead Charm
  return false;
}

export function L11_talismanOfNam(): boolean {
  if (L11_shenCopperhead() || L11_redZeppelin() || L11_ronCopperhead()) {
    return true;
  }
  if (creatableAmount($item`Talisman o' Namsilat`) > 0) {
    if (create(1, $item`Talisman o' Namsilat`)) {
      return true;
    }
  }

  return false;
}

export function L11_palindome(): boolean {
  if (
    internalQuestStatus("questL11Palindome") < 0 ||
    internalQuestStatus("questL11Palindome") > 5
  ) {
    return false;
  }

  if (!possessEquipment($item`Talisman o' Namsilat`)) {
    return false;
  }

  if (
    myMeat() <
      (2 -
        (itemAmount($item`photograph of a red nugget`) +
          itemAmount($item`photograph of God`))) *
        500 &&
    internalQuestStatus("questL11Palindome") < 1
  ) {
    auto_log_info$1("Not enough meat for the Palindome");
    return false;
  }

  let total: number = 0;
  total = total + itemAmount($item`photograph of a red nugget`);
  total = total + itemAmount($item`photograph of an ostrich egg`);
  total = total + itemAmount($item`photograph of God`);
  total = total + itemAmount($item`photograph of a dog`);

  if (isBanished($phylum`dude`) && toInt(getProperty("screechCombats")) > 0) {
    setProperty("screechDelay", "dude");
    return false; //If new phylum banishers come out, this should be updated.
  }

  let lovemeDone: boolean =
    hasILoveMeVolI() || internalQuestStatus("questL11Palindome") >= 1;
  if (!lovemeDone && toInt(getProperty("palindomeDudesDefeated")) >= 5) {
    const palindomeCheck: string = visitUrl("place.php?whichplace=palindome");
    lovemeDone = lovemeDone || containsText(palindomeCheck, "pal_drlabel");
  }

  auto_log_info("In the palindome : emodnilap eht nI", "blue");

  function makeWetStuntNutStew(): boolean {
    if (
      itemAmount($item`bird rib`) > 0 &&
      itemAmount($item`lion oil`) > 0 &&
      itemAmount($item`wet stew`) === 0
    ) {
      autoCraft("cook", 1, $item`bird rib`, $item`lion oil`);
    }

    if (
      itemAmount($item`stunt nuts`) > 0 &&
      itemAmount($item`wet stew`) > 0 &&
      itemAmount($item`wet stunt nut stew`) === 0
    ) {
      autoCraft("cook", 1, $item`wet stew`, $item`stunt nuts`);
    }
    if (itemAmount($item`wet stunt nut stew`) > 0) {
      return true;
    }
    return false;
  }
  //
  //	In hardcore, guild-class, the right side of the or doesn't happen properly due us farming the
  //	Mega Gem within the if, with pulls, it works fine. Need to fix this. This is bad.
  //
  function doWhiteys(): boolean {
    //After we get the photos
    //First try wishing, then try Whitey's. At 0% item / combat / food drop, this expects to take ~19 turns. At a very achievable 100% item, 10 turns.
    //The alternate route takes 14 turns so always worth trying Whitey's IMO.
    //If we hit this, we should only need to finish the L11 quest so it won't hurt to do everything in provideItem
    //since we will need +item for tomb rats in ~15 turns anyway. Buffs from wishes should still be active
    //since they are 30 turns from monkey paw wishes and 20 turns from pocket/genie wishes.
    if (auto_monkeyPawWishesLeft() > 0) {
      for (const it of $items`lion oil, bird rib`) {
        if (itemAmount(it) > 0) {
          continue;
        }
        auto_makeMonkeyPawWish$1(it);
      }
      if (itemAmount($item`lion oil`) > 0 && itemAmount($item`bird rib`) > 0) {
        return makeWetStuntNutStew();
      }
      //wasn't able to make the stew so continue to Whitey's
    }
    // in normal, we delayed until this was all we had to do. In hardcore we do it earlier.
    provideItem$2(300, $location`Whitey's Grove`, !inHardcore());
    setProperty("auto_doWhiteys", true.toString());
    if (itemAmount($item`white page`) > 0) {
      setProperty("choiceAdventure940", (1).toString());
      if (itemAmount($item`bird rib`) > 0) {
        setProperty("choiceAdventure940", (2).toString());
      }

      if (toInt(getProperty("lastGuildStoreOpen")) < myAscensions()) {
        auto_log_warning(
          "This is probably no longer needed as of r16907. Please remove me",
          "blue",
        );
        auto_log_warning(
          "Going to pretend we have unlocked the Guild because Mafia will assume we need to do that before going to Whitey's Grove and screw up us. We'll fix it afterwards.",
          "red",
        );
      }
      backupSetting("lastGuildStoreOpen", myAscensions().toString());
      const pages: Map<number, string> = new Map();
      pages.set(0, "inv_use.php?pwd&which=3&whichitem=7555");
      pages.set(
        1,
        `choice.php?pwd&whichchoice=940&option=${getProperty("choiceAdventure940")}`,
      );
      if (autoAdvBypass(0, pages, $location`Whitey's Grove`, null)) {
      }
      restoreSetting("lastGuildStoreOpen");
      return true;
    }
    //Can't do Whitey's Grove if beasts are banished
    if (
      isBanished($phylum`beast`) &&
      toInt(getProperty("screechCombats")) > 0
    ) {
      setProperty("screechDelay", "beast");
      return false; //If new phylum banishers come out, this should be updated.
    }
    providePlusCombat$2(15, $location`Whitey's Grove`, false);
    // +item is nice to get that food
    bat_formBats$1();
    auto_lostStomach$1(true);
    auto_log_info("Off to the grove for some doofy food!", "blue");
    return autoAdv$1(1, $location`Whitey's Grove`);
  }

  if (
    itemAmount($item`wet stunt nut stew`) === 0 &&
    internalQuestStatus("questL11Palindome") >= 3
  ) {
    if (makeWetStuntNutStew()) {
      return true;
    }
  }

  if (
    itemAmount($item`wet stunt nut stew`) > 0 &&
    !possessEquipment($item`Mega Gem`)
  ) {
    if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
      equip($slot`acc3`, $item`Talisman o' Namsilat`);
    }
    visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
  }

  if (
    total === 0 &&
    !possessEquipment($item`Mega Gem`) &&
    lovemeDone &&
    (inHardcore() || toBoolean(getProperty("auto_doWhiteys"))) &&
    itemAmount($item`wet stunt nut stew`) === 0 &&
    (internalQuestStatus("questL11Palindome") >= 3 || isGuildClass()) &&
    !toBoolean(getProperty("auto_bruteForcePalindome"))
  ) {
    if (itemAmount($item`wet stunt nut stew`) === 0) {
      equipBaseline();
      if (
        itemAmount($item`bird rib`) === 0 ||
        itemAmount($item`lion oil`) === 0
      ) {
        return doWhiteys();
      } else if (itemAmount($item`stunt nuts`) === 0) {
        auto_log_info("We got no nuts!! :O", "Blue");
        autoEquip($slot`acc3`, $item`Talisman o' Namsilat`);
        return autoAdv$1(1, $location`Inside the Palindome`);
      } else {
        abort("Some sort of Wet Stunt Nut Stew error. Try making it yourself?");
      }
      return true;
    }
  }
  if (
    ((total === 4 && hasILoveMeVolI()) ||
      (total === 0 && possessEquipment($item`Mega Gem`))) &&
    lovemeDone
  ) {
    if (hasILoveMeVolI()) {
      useILoveMeVolI();
    }
    if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
      equip($slot`acc3`, $item`Talisman o' Namsilat`);
    }

    if (internalQuestStatus("questL11Palindome") < 1) {
      visitUrl("place.php?whichplace=palindome&action=pal_drlabel");
      visitUrl(
        "choice.php?pwd&whichchoice=872&option=1&photo1=2259&photo2=7264&photo3=7263&photo4=7265",
      );
    }

    if (isActuallyEd()) {
      if (internalQuestStatus("questL11MacGuffin") > 2) {
        // Actually Ed finishes this quest when all 3 parts of the staff are returned
        council();
      }
      return true;
    }
    // is step 4 when we got the wet stunt nut stew?
    if (internalQuestStatus("questL11Palindome") < 5) {
      if (itemAmount($item`"2 Love Me, Vol. 2"`) > 0) {
        use(1, $item`"2 Love Me, Vol. 2"`);
        auto_log_info(
          "Oh no, we died from reading a book. I'm going to take a nap.",
          "blue",
        );
        setProperty("_auto_forcePokefamRestore", true.toString());
        acquireHP();
        bat_reallyPickSkills(20);
      }
      if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
        equip($slot`acc3`, $item`Talisman o' Namsilat`);
      }
      visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
      if (!inHardcore() && itemAmount($item`wet stunt nut stew`) === 0) {
        if (
          itemAmount($item`wet stew`) === 0 &&
          itemAmount($item`Mega Gem`) === 0
        ) {
          pullXWhenHaveY($item`wet stew`, 1, 0);
        }
        if (
          itemAmount($item`stunt nuts`) === 0 &&
          itemAmount($item`Mega Gem`) === 0
        ) {
          pullXWhenHaveY($item`stunt nuts`, 1, 0);
        }
      }
      if (inHardcore()) {
        return true;
      }
    }

    if (!possessEquipment($item`Mega Gem`)) {
      if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
        equip($slot`acc3`, $item`Talisman o' Namsilat`);
      }
      visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
    }

    if (!possessEquipment($item`Mega Gem`)) {
      auto_log_warning(
        "No mega gem for us. Well, no raisin to go further here....",
        "red",
      );
      return false;
    }
    autoEquip($slot`acc2`, $item`Mega Gem`);
    autoEquip($slot`acc3`, $item`Talisman o' Namsilat`);
    const palinChoice: number = random(3) + 1;
    setProperty("choiceAdventure131", palinChoice.toString());

    auto_log_info("War sir is raw!!", "blue");

    const pages: Map<number, string> = new Map();
    pages.set(0, "place.php?whichplace=palindome&action=pal_drlabel");
    pages.set(1, `choice.php?pwd&whichchoice=131&option=${palinChoice}`);
    setProperty("auto_nextEncounter", "Dr. Awkward");
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$3($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$3($effect`Tricky Timpani`, 30, 1, 10);
    }
    autoAdvBypass(0, pages, $location`Noob Cave`, null);
    return true;
  } else {
    if (pullsRemaining() === 0) {
      // used our pulls today before getting to palindrome. Delay until next day or run out of other stuff to do
      if (!isAboutToPowerlevel()) {
        auto_log_debug$1("Delaying palindrome.");
        return false;
      } else {
        if (internalQuestStatus("questL11Palindome") > 2) {
          return doWhiteys(); //Initial call to do Whitey's Grove
        }
      }
    }
    if (myMp() > 60 || considerGrimstoneGolem(true)) {
      handleBjornify($familiar`Grimstone Golem`);
    }
    if (internalQuestStatus("questL11Palindome") > 1) {
      if (!toBoolean(getProperty("auto_bruteForcePalindome"))) {
        auto_log_error("Palindome failure:");
        auto_log_error("You probably just need to get a Mega Gem to fix this.");
        abort(
          "We have made too much progress in the Palindome and should not be here.",
        );
      } else {
        auto_log_error(
          "We need wet stunt nut stew to get the Mega Gem, but I've been told to get it via the mercy adventure.",
        );
        auto_log_error(
          "Set auto_bruteForcePalindome=false to try to get a stunt nut stew",
        );
        auto_log_error(
          "(We typically only set this option in hardcore Kingdom of Exploathing, in which the White Forest isn't available)",
        );
      }
    }

    let dudesToDown: number = 5;
    if (
      internalQuestStatus("questL11Palindome") < 1 &&
      itemAmount($item`photograph of a dog`) === 0
    ) {
      //TODO if no camera check if it is better to pull or go get one, than to find 4 more dudes and a Bob
      if (
        itemAmount($item`disposable instant camera`) === 0 ||
        !auto_is_valid($item`disposable instant camera`)
      ) {
        dudesToDown = 10; //if bob can't be photographed need to down more dudes
      }
    }

    autoEquip($slot`acc3`, $item`Talisman o' Namsilat`);
    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      auto_changeSnapperPhylum($phylum`dude`);
    } else if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
    ) {
      let noseDudesOn: boolean = true;
      if (
        itemAmount($item`stunt nuts`) === 0 &&
        itemAmount($item`wet stunt nut stew`) === 0
      ) {
        //may want to use an item familiar first for stunt nuts
        //unfortunately the sniff condition system means if taking the nose later after using different sniffs on a dude it will only be able to whiff on the same dude
        const stuntNutDropModifierWithoutFamiliar: number = toInt(
          itemDropModifier() +
            numericModifier("Food Drop") -
            auto_famModifiers$2("Item Drop"),
        );
        if (stuntNutDropModifierWithoutFamiliar < 234) {
          //30% base drop chance
          noseDudesOn = false;
        }
      }
      if (noseDudesOn) {
        const whiffedBob: boolean =
          toMonster(getProperty("nosyNoseMonster")) === $monster`Racecar Bob` ||
          toMonster(getProperty("nosyNoseMonster")) === $monster`Bob Racecar`;
        if (
          isBanished($monster`Flock of Stab-bats`) &&
          isBanished($monster`Taco Cat`) &&
          isBanished($monster`Tan Gnat`) &&
          isBanished($monster`Evil Olive`)
        ) {
          //only dudes left already
          noseDudesOn = false;
        } else if (
          toInt(getProperty("palindomeDudesDefeated")) >= dudesToDown
        ) {
          if (dudesToDown >= 10 && whiffedBob) {
            //when looking for photograph of a dog without disposable instant camera
            //the 10th or later dude must be a Bob, keep using the nose if it's tracking Bob
            noseDudesOn = true;
          } else {
            //had enough dudes
            noseDudesOn = false;
          }
        } else if (
          toInt(getProperty("palindomeDudesDefeated")) ===
          dudesToDown - 1
        ) {
          if (!whiffedBob) {
            //don't need to start sniffing the last dude
            noseDudesOn = false;
          }
        } else if (
          isSniffed($monster`Racecar Bob`, $skill`Transcendent Olfaction`) ||
          isSniffed($monster`Bob Racecar`, $skill`Transcendent Olfaction`) ||
          isSniffed($monster`Drab Bard`, $skill`Transcendent Olfaction`) ||
          getSniffer($monster`Racecar Bob`, false) ===
            $skill`Transcendent Olfaction` ||
          getSniffer($monster`Bob Racecar`, false) ===
            $skill`Transcendent Olfaction`
        ) {
          //olfaction is or will be used and is probably powerful enough not to need weak nose tracking on
          noseDudesOn = false;
        }
      }
      if (noseDudesOn) {
        handleFamiliar$1($familiar`Nosy Nose`);
      }
    }

    if (
      canSniff($monster`Bob Racecar`, $location`Inside the Palindome`) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info$1(
        "Attemping to use Map the Monsters to olfact a Bob Racecar.",
      );
    }
    const advSpent: boolean = autoAdv$2($location`Inside the Palindome`);
    if (
      $location`Inside the Palindome`.turnsSpent > 30 &&
      !in_pokefam() &&
      !in_koe() &&
      !in_avantGuard() &&
      auto_is_valid($item`disposable instant camera`)
    ) {
      abort(
        "It appears that we've spent too many turns in the Palindome. If you run me again, I'll try one more time but many I failed finishing the Palindome",
      );
    } else {
      return advSpent;
    }
  }
  return false;
}

export function L11_unlockPyramid(): boolean {
  visitUrl("place.php?whichplace=desertbeach");
  if (
    internalQuestStatus("questL11Desert") < 1 ||
    toInt(getProperty("desertExploration")) < 100 ||
    internalQuestStatus("questL11Pyramid") > -1
  ) {
    return false;
  }
  if (isActuallyEd()) {
    return false; //ed starts with pyramid unlocked and cannot adventure there
  }
  //get staff of ed if possible. we are only checking the non equipment version of it.
  //the equipment version is actually ed the undying path exclusive
  if (creatableAmount($item`[2325]Staff of Ed`) > 0) {
    create(1, $item`[2325]Staff of Ed`);
  }
  if (itemAmount($item`[2325]Staff of Ed`) === 0) {
    return false;
  }

  auto_log_info("Reveal the pyramid", "blue");
  if (in_koe()) {
    visitUrl("place.php?whichplace=exploathing_beach&action=expl_pyramidpre");
    cliExecute("refresh quests");
  } else {
    visitUrl("place.php?whichplace=desertbeach&action=db_pyramid1");
  }
  //check results of above URL visit
  if (internalQuestStatus("questL11Pyramid") > -1) {
    return true; //unlock successful
  } else {
    //unlock failed
    cliExecute("refresh quests"); //maybe it worked and mafia did not notice?
    if (internalQuestStatus("questL11Pyramid") > -1) {
      return true; //actually unlock did not fail.
    }

    const initial: number = toInt(getProperty("desertExploration"));
    const page: string = visitUrl("place.php?whichplace=desertbeach");
    const desert_matcher: AshMatcher = new AshMatcher(
      'title="[(](\\d+)% explored[)]"',
      page,
    );
    if (desert_matcher.find()) {
      const found: number = toInt(desert_matcher.group(1));
      if (found !== initial) {
        auto_log_info(
          `Incorrectly had exploration value of ${initial} when it should be at ${found}. This was corrected. Trying to resume.`,
          "blue",
        );
        setProperty("desertExploration", found.toString());
        return true;
      }
      abort(
        "Tried to open the Pyramid but could not. property desertExploration determined to be correct",
      );
    }
    abort(
      "Tried to open the Pyramid but could not. could not verify the actual exploration amount of the desert",
    );
  }

  return false;
}

export function L11_unlockEd(): boolean {
  if (
    internalQuestStatus("questL11Pyramid") < 0 ||
    internalQuestStatus("questL11Pyramid") > 3 ||
    toBoolean(getProperty("pyramidBombUsed"))
  ) {
    return false;
  }
  if (isActuallyEd()) {
    return true;
  }
  if (auto_reserveUndergroundAdventures()) {
    return false;
  }

  if (internalQuestStatus("questL03Rat") < 2) {
    auto_log_warning(
      "Uh oh, didn't do the tavern and we are at the pyramid....",
      "red",
    );
    // Forcing Tavern.
    setProperty("auto_forceTavern", true.toString());
    if (L3_tavern()) {
      return true;
    }
  }

  auto_log_info(
    `In the pyramid (W:${itemAmount($item`crumbling wooden wheel`)}) (R:${itemAmount($item`tomb ratchet`)}) (U:${getProperty("controlRoomUnlock")})`,
    "blue",
  );

  if (!toBoolean(getProperty("middleChamberUnlock"))) {
    return autoAdv$1(1, $location`The Upper Chamber`);
  }

  let total: number = itemAmount($item`crumbling wooden wheel`);
  total = total + itemAmount($item`tomb ratchet`);

  if (
    total >= 10 &&
    myAdventures() >= 4 &&
    toBoolean(getProperty("controlRoomUnlock"))
  ) {
    visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
    let x: number = 0;
    while (x < 10) {
      if (itemAmount($item`crumbling wooden wheel`) > 0) {
        visitUrl(
          `choice.php?pwd&whichchoice=929&option=1&choiceform1=Use+a+wheel+on+the+peg&pwd=${myHash()}`,
        );
      } else {
        visitUrl("choice.php?whichchoice=929&option=2&pwd");
      }
      x = x + 1;
      if (x === 3 || x === 7 || x === 10) {
        visitUrl(
          `choice.php?pwd&whichchoice=929&option=5&choiceform5=Head+down+to+the+Lower+Chambers+%281%29&pwd=${myHash()}`,
        );
      }
      if (x === 3 || x === 7) {
        visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
      }
    }
    return true;
  }
  if (total < 10) {
    // tomb ratchets have 20% drop rate
    provideItem$2(400, $location`The Middle Chamber`, true);
  }

  if (toBoolean(getProperty("controlRoomUnlock"))) {
    if (
      !containsText(
        getProperty("auto_banishes"),
        $monster`tomb servant`.toString(),
      ) &&
      !containsText(
        getProperty("auto_banishes"),
        $monster`tomb asp`.toString(),
      ) &&
      getProperty("olfactedMonster") !== $monster`tomb rat`.toString()
    ) {
      return autoAdv$1(1, $location`The Upper Chamber`);
    }
  }

  if (
    canSniff($monster`tomb rat`, $location`The Middle Chamber`) &&
    auto_mapTheMonsters()
  ) {
    auto_log_info$1("Attemping to use Map the Monsters to olfact a Tomb Rat.");
  }

  if (auto_haveGreyGoose() && itemAmount($item`tangle of rat tails`) >= 1) {
    auto_log_info$1(
      "Bringing the Grey Goose to emit some drones at some rat kings.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  if (
    auto_can_equip($item`pro skateboard`) &&
    equipmentAmount($item`pro skateboard`) > 0 &&
    itemAmount($item`tangle of rat tails`) >= 1 &&
    !toBoolean(getProperty("_epicMcTwistUsed")) &&
    !in_pokefam()
  ) {
    auto_log_info$1("Be like Tony Hawk on a Tomb Rat King!");
    autoEquip$1($item`pro skateboard`);
  }

  return autoAdv$1(1, $location`The Middle Chamber`);
}

export function L11_defeatEd(): boolean {
  if (
    internalQuestStatus("questL11Pyramid") !== 3 ||
    !toBoolean(getProperty("pyramidBombUsed"))
  ) {
    return false;
  }

  if (myAdventures() - auto_advToReserve() <= 7) {
    return false;
  }

  if (itemAmount($item`[2334]Holy MacGuffin`) === 1) {
    council();
    return true;
  }

  if (is_professor()) {
    return false; //need to wait until werewolf because can't survive combat long enough as a Prof
  }

  let baseML: number = monsterLevelAdjustment();
  if (in_heavyrains()) {
    baseML = baseML + 60;
  }
  if (baseML > 150) {
    for (const s of $slots`acc1, acc2, acc3`) {
      if (equippedItem(s) === $item`Hand in Glove`) {
        equip(s, Item.none);
      }
    }
    uneffect($effect`Ur-Kel's Aria of Annoyance`);
    if (possessEquipment($item`beer helmet`)) {
      autoEquip$1($item`beer helmet`);
    }
  }
  if (in_koe()) {
    retrieveItem(1, $item`low-pressure oxygen tank`);
    autoForceEquip$3($item`low-pressure oxygen tank`);
  }

  plumber_equipTool$1($stat`Moxie`);

  auto_log_info("Time to waste all of Ed's Ka Coins :(", "blue");

  setProperty("auto_nextEncounter", "Ed the Undying");
  setProperty("auto_nonAdvLoc", true.toString());
  autoAdv$2($location`The Lower Chambers`);
  if (in_pokefam() || in_koe()) {
    cliExecute("refresh inv");
  }

  if (itemAmount($item`[2334]Holy MacGuffin`) !== 0) {
    council();
  }
  return true;
}
