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
  Monster,
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
  splitString,
  squareRoot,
  substring,
  takeCloset,
  toFloat,
  toInt,
  toLocation,
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
  $modifier,
  $monster,
  $path,
  $phylum,
  $skill,
  $slot,
  $slots,
  $stat,
  get,
  have,
  set,
} from "libram";

import {
  auto_advToReserve,
  LX_doVacation,
  speculative_pool_skill,
} from "../../autoscend";
import {
  auto_buyUpTo,
  canPull,
  npcStoreDiscountMulti,
  pullXWhenHaveY,
} from "../auto_acquire";
import {
  autoAdv,
  autoAdvBypass,
  autoAdvBypass$1,
  autoLuckyAdv,
} from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import {
  auto_autoConsumeOne,
  auto_canDrink,
  auto_findBestConsumeAction,
  autoDrink,
  expectedAdventuresFrom,
  inebriety_left,
} from "../auto_consume";
import {
  autoEquip,
  autoEquipToSlot,
  autoForceEquip,
  autoForceEquip$3,
  equipBaseline,
  equipMaximizedGear,
  equipmentAmount,
  possessEquipment,
  possessUnrestricted,
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
  providePlusCombat,
  provideResistances,
  provideResistances$4,
} from "../auto_providers";
import { acquireHP, acquireMP, uneffect } from "../auto_restore";
import {
  auto_reserveUndergroundAdventures,
  auto_waitForDay2,
  canBurnDelay,
} from "../auto_routing";
import {
  auto_can_equip,
  auto_canForceNextCombat,
  auto_canForceNextNoncombat,
  auto_change_mcd,
  auto_combat_appearance_rates$1,
  auto_convertDesiredML,
  auto_forceNextNoncombat,
  auto_haveCombatForceSource,
  auto_haveQueuedForcedCombat,
  auto_haveQueuedForcedNonCombat,
  auto_inRonin,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$3,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_MaxMLToCap,
  auto_runChoice,
  auto_wishForEffect,
  autoCraft,
  backupSetting,
  canSniff,
  canSummonMonster,
  cloversAvailable,
  internalQuestStatus,
  isGuildClass,
  lastAdventureSpecialNC,
  meatReserve,
  ovenHandle,
  restoreSetting,
  safeGet,
  summonMonster,
} from "../auto_util";
import { zone_delay, zone_isAvailable } from "../auto_zone";
import { ConsumeAction } from "../autoscend_record";
import { getSniffer, isSniffed } from "../combat/auto_combat_util";
import {
  DesiredDrop,
  DesiredFights,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
  taskLocations,
} from "../engine/engine";
import {
  considerGrimstoneGolem,
  handleBjornify,
  LX_ornateDowsingRod,
} from "../iotms/2010/mr2014";
import { auto_sourceTerminalEducate } from "../iotms/2010/mr2016";
import {
  auto_beachCombHead,
  auto_changeSnapperPhylum,
} from "../iotms/2010/mr2019";
import { auto_canCamelSpit, auto_mapTheMonsters } from "../iotms/2020/mr2020";
import {
  auto_haveGreyGoose,
  auto_haveMaydayContract,
} from "../iotms/2020/mr2022";
import {
  auto_getCitizenZone,
  auto_habitatFightsLeft,
  auto_haveBofa,
  auto_haveCCSC,
  auto_lostStomach,
  auto_makeMonkeyPawWish$1,
  auto_monkeyPawWishesLeft,
} from "../iotms/2020/mr2023";
import { auto_haveTearawayPants } from "../iotms/2020/mr2024";
import {
  auto_copierShouldDelayZone,
  auto_spadeDigSkeleton,
  auto_spadeDigsRemaining,
  auto_wantToSpadeDigSkeleton,
} from "../iotms/2020/mr2026";
import { in_bhy } from "../paths/2011/bees_hate_you";
import { in_wotsf } from "../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../paths/2012/avatar_of_boris";
import { in_heavyrains } from "../paths/2014/heavy_rains";
import { in_picky } from "../paths/2014/picky";
import {
  isActuallyEd,
  L9_ed_chasmStart,
} from "../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../paths/2015/one_crazy_random_summer";
import { in_nuclear } from "../paths/2016/nuclear_autumn";
import { lar_repeat } from "../paths/2017/live_ascend_repeat";
import { in_glover } from "../paths/2018/g_lover";
import { in_pokefam } from "../paths/2018/pocket_familiars";
import {
  bat_formBats,
  bat_reallyPickSkills,
  bat_wantHowl,
  in_darkGyffte,
} from "../paths/2019/dark_gyffte";
import { in_koe } from "../paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "../paths/2019/two_crazy_random_summer";
import { in_lowkeysummer } from "../paths/2020/low_key_summer";
import {
  in_plumber,
  plumber_equipTool,
} from "../paths/2020/path_of_the_plumber";
import {
  in_quantumTerrarium,
  qt_FamiliarSwap,
} from "../paths/2021/quantum_terrarium";
import { in_wildfire } from "../paths/2021/wildfire";
import { in_robot, robot_delay } from "../paths/2021/you_robot";
import { in_aosol } from "../paths/2023/avatar_of_shadows_over_loathing";
import { in_lol } from "../paths/2023/legacy_of_loathing";
import { in_small } from "../paths/2023/small";
import { in_avantGuard } from "../paths/2024/avant_guard";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
} from "../paths/2024/wereprofessor";
import { in_zootomist } from "../paths/2025/zootomist";
import { in_amw } from "../paths/2026/adventurer_meats_world";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { maximizer } from "../utils/maximizer";
import { L3_tavern } from "./level_03";
import { L8_trapperNinjaLair } from "./level_08";
import { L9_chasmBuild } from "./level_09";
import { L10_holeInTheSkyUnlockTask, L10_topFloorTask } from "./level_10";

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
      get("_hipsterAdv") < 7 &&
      canChangeToFamiliar($familiar`Artistic Goth Kid`)
    ) {
      dbr.fam = $familiar`Artistic Goth Kid`;
    } else if (
      get("_hipsterAdv") < 7 &&
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
  if (get("shenInitiationDay") > 0) {
    const day: number = get("shenInitiationDay");
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
      get("auto_delayLastLevel", 0) === 10 &&
      itemAmount($item`enchanted bean`) === 0
    ) {
      zones_to_avoid.delete($location`The Batrat and Ratbat Burrow`);
    }
    // don't delay Hole in the Sky in WereProf if ran out of stuff to do
    if (
      get("auto_powerLevelLastAttempted", 0) === myTurncount() &&
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

function LX_unlockHiddenTempleDo(): boolean {
  // replaces L2_treeCoin(),  L2_spookyMap(),  L2_spookyFertilizer() & L2_spookySapling()

  auto_log_info("Attempting to make the Hidden Temple less hidden.", "blue");
  pullXWhenHaveY($item`Spooky-Gro fertilizer`, 1, 0);
  if (autoAdv($location`The Spooky Forest`)) {
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

export const LX_unlockHiddenTempleTask: QuestTask = registerQuestTask({
  name: "LX_unlockHiddenTemple",
  // Spooky Temple map ain't nuthin' but a 'G' Thang.
  completed: () => hiddenTempleUnlocked(),
  ready: () =>
    !in_glover() &&
    !(itemAmount($item`spooky sapling`) === 0 && myMeat() < 100) &&
    // Arboreal Respite choice adventure has a delay of 5 adventures.
    !canBurnDelay($location`The Spooky Forest`),
  do: LX_unlockHiddenTempleDo,
  locations: $location`The Spooky Forest`,
});

export function LX_unlockHiddenTemple(): boolean {
  return runQuestTask(LX_unlockHiddenTempleTask);
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

export function LX_unlockHauntedBilliardsRoom(
  delayKitchen: boolean = true,
): boolean {
  // delayKitchen if true will force the check for 9 hot res & 9 stench res to be used
  if (internalQuestStatus("questM20Necklace") !== 0) {
    return false;
  }

  if (get("manorDrawerCount") >= 24) {
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
      (resPossible.get($element`hot`) ?? 0) < 9 ||
      (resPossible.get($element`stench`) ?? 0) < 9;
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
      `Looking for the Billards Room key (Hot/Stench:${resPossible.get($element`hot`) ?? 0}/${resPossible.get($element`stench`) ?? 0}): Progress ${getProperty("manorDrawerCount")}/24`,
      "blue",
    );

    if (
      auto_spadeDigsRemaining() > 0 &&
      getProperty("lastAdventure") === "The Haunted Kitchen"
    ) {
      return auto_spadeDigSkeleton($location`The Haunted Kitchen`);
    }
    if (autoAdv($location`The Haunted Kitchen`)) {
      return true;
    }
  }
  return false;
}

function LX_unlockHauntedLibraryDo(): boolean {
  //Adventure in the haunted billiards room to get the key to the haunted library
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
      autoEquip(staffOfFats); //+5 pool skill & +2 training gains.
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfEd) && expectPool + 5 > 13) {
      autoEquip(EdStaffOfEd); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfFats) && expectPool + 5 > 13) {
      autoEquip(EdStaffOfFats); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment($item`pool cue`) && expectPool + 3 > 13) {
      autoEquip($item`pool cue`); //+3 pool skill
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
      auto_log_info(
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
  buffMaintain$2($effect`Chalky Hand`);

  if (internalQuestStatus("questM20Necklace") === 2) {
    // only force after we get the pool cue NC.
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The Haunted Billiards Room`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel()
    ) {
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
  }
  auto_log_info("It's billiards time!", "blue");
  return autoAdv($location`The Haunted Billiards Room`);
}

export const LX_unlockHauntedLibraryTask: QuestTask = registerQuestTask({
  name: "LX_unlockHauntedLibrary",
  completed: () =>
    internalQuestStatus("questM20Necklace") > 2 || hasSpookyravenLibraryKey(),
  ready: () =>
    internalQuestStatus("questM20Necklace") >= 1 &&
    itemAmount($item`Spookyraven billiards room key`) >= 1,
  do: LX_unlockHauntedLibraryDo,
  locations: $location`The Haunted Billiards Room`,
});

export function LX_unlockHauntedLibrary(): boolean {
  return runQuestTask(LX_unlockHauntedLibraryTask);
}

function LX_unlockManorSecondFloorDo(): boolean {
  //No sense in trying to go to the library if constructs (writing desk) are banished and we already have a killing jar and haven't done the desert yet
  if (
    isBanished($phylum`construct`) &&
    get("screechCombats") > 0 &&
    itemAmount($item`killing jar`) > 0 &&
    (get("gnasirProgress") & 4) !== 4
  ) {
    set("_auto_screechDelay", "construct");
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

  if (myTurncount() === get("_LAR_skipNC163", 0)) {
    auto_log_info(
      "In LAR path NC163 is forced to reoccur if we skip it. Go do something else.",
    );
    return false;
  }

  auto_log_info("Well, we need writing desks", "blue");
  auto_log_info("Going to the library!", "blue");
  if (
    get("writingDesksDefeated") <= 3 ||
    safeGet("nosyNoseMonster", Monster.none) === $monster`writing desk`
  ) {
    // nose sniff is weak so probably want fairy familiar first. this condition should change if banshee librarian is added as a YR target for killing jar
    if (
      (itemAmount($item`killing jar`) > 0 ||
        isBanished($monster`banshee librarian`)) &&
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1($location`The Haunted Library`).get(
        $monster`writing desk`,
      ) ?? 0.0) < 100
    ) {
      handleFamiliar$1($familiar`Nosy Nose`);
    }
  }
  if (get("writingDesksDefeated") <= 3) {
    if (
      canSniff($monster`writing desk`, $location`The Haunted Library`) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a writing desk.",
      );
    }
  }

  auto_getCitizenZone($location`The Haunted Library`, false); //since want to adventure in the Haunted Library anyway
  return autoAdv($location`The Haunted Library`);
}

export const LX_unlockManorSecondFloorTask: QuestTask = registerQuestTask({
  name: "LX_unlockManorSecondFloor",
  completed: () => internalQuestStatus("questM20Necklace") > 4,
  ready: () => internalQuestStatus("questM20Necklace") >= 3,
  do: LX_unlockManorSecondFloorDo,
  locations: $location`The Haunted Library`,
  desiredEncounters: () => [
    {
      monster: $monster`writing desk`,
      needAmount:
        internalQuestStatus("questM20Necklace") <= 4
          ? 5 - get("writingDesksDefeated")
          : 0,
    },
    {
      item: $item`killing jar`,
      needAmount:
        itemAmount($item`killing jar`) < 1 &&
        (get("gnasirProgress") & 4) === 0 &&
        get("desertExploration") < 100
          ? 1
          : 0,
    },
  ],
});

export function LX_unlockManorSecondFloor(): boolean {
  return runQuestTask(LX_unlockManorSecondFloorTask);
}

const LX_unlockHauntedBilliardsRoomFirstFloorTask: QuestTask =
  registerQuestTask({
    name: "LX_unlockHauntedBilliardsRoomFirstFloor",
    completed: () => itemAmount($item`Spookyraven billiards room key`) > 0,
    ready: () => true,
    do: () => LX_unlockHauntedBilliardsRoom(),
    locations: $location`The Haunted Kitchen`,
  });

function LX_spookyravenManorFirstFloorDo(): boolean {
  return runTaskChain([
    LX_unlockManorSecondFloorTask,
    LX_unlockHauntedLibraryTask,
    LX_unlockHauntedBilliardsRoomFirstFloorTask,
  ]);
}

export const LX_spookyravenManorFirstFloorTask: QuestTask = registerQuestTask({
  name: "LX_spookyravenManorFirstFloor",
  completed: () => get("lastSecondFloorUnlock") >= myAscensions(),
  ready: () => true,
  do: LX_spookyravenManorFirstFloorDo,
});

export function LX_spookyravenManorFirstFloor(): boolean {
  return runQuestTask(LX_spookyravenManorFirstFloorTask);
}

function LX_danceWithLadySpookyravenDo(): boolean {
  if (
    itemAmount($item`Lady Spookyraven's powder puff`) === 1 &&
    itemAmount($item`Lady Spookyraven's dancing shoes`) === 1 &&
    itemAmount($item`Lady Spookyraven's finest gown`) === 1
  ) {
    visitUrl("place.php?whichplace=manor2&action=manor2_ladys");
  }

  auto_log_info("Finished Spookyraven, just dancing with the lady.", "blue");
  if (autoAdv($location`The Haunted Ballroom`)) {
    if (in_lowkeysummer()) {
      // need to open the Haunted Nursery for the music box key.
      visitUrl("place.php?whichplace=manor3&action=manor3_ladys");
    }
    return true;
  }
  return false;
}

export const LX_danceWithLadySpookyravenTask: QuestTask = registerQuestTask({
  name: "LX_danceWithLadySpookyraven",
  completed: () => internalQuestStatus("questM21Dance") > 3,
  ready: () => internalQuestStatus("questM21Dance") >= 2,
  do: LX_danceWithLadySpookyravenDo,
  locations: $location`The Haunted Ballroom`,
});

export function LX_danceWithLadySpookyraven(): boolean {
  return runQuestTask(LX_danceWithLadySpookyravenTask);
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
      auto_runChoice(1); // get old leather wallet worth ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Muscle` &&
      myBuffedstat($stat`Muscle`) < 150
    ) {
      auto_runChoice(3); // spend 1 ghost key for primestat, get ~200 muscle XP
    } else {
      auto_runChoice(2); // get min(200,muscle) of muscle XP
    }
  } else if (choice === 877) {
    // One Mahogany Nightstand (The Haunted Bedroom)
    auto_runChoice(1); // get half of a memo or old coin purse
  } else if (choice === 878) {
    // One Ornate Nightstand (The Haunted Bedroom)
    let needSpectacles: boolean =
      !possessEquipment($item`Lord Spookyraven's spectacles`) &&
      internalQuestStatus("questL11Manor") < 2;
    if (is_boris() || in_wotsf() || (in_nuclear() && inHardcore())) {
      needSpectacles = false;
    }
    if (needSpectacles) {
      auto_runChoice(3); // get Lord Spookyraven's spectacles
    } else if (
      itemAmount($item`disposable instant camera`) === 0 &&
      internalQuestStatus("questL11Palindome") < 1
    ) {
      auto_runChoice(4); // get disposable instant camera
    } else if (
      myPrimestat() !== $stat`Mysticality` ||
      myMeat() < 1000 + meatReserve() ||
      in_amw()
    ) {
      auto_runChoice(1); // get ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Mysticality` &&
      myBuffedstat($stat`Mysticality`) < 150
    ) {
      auto_runChoice(5); // spend 1 ghost key for primestat, get ~200 mysticality XP
    } else {
      auto_runChoice(2); // get min(200,mys) of mys XP
    }
  } else if (choice === 879) {
    // One Rustic Nightstand (The Haunted Bedroom)
    if (options.has(4)) {
      auto_runChoice(4); // only shows up rarely. still worth ~1 mil in mall
    }
    if (in_bhy() && itemAmount($item`antique hand mirror`) < 1) {
      auto_runChoice(3); // fight the remains of a jilted mistress for the antique hand mirror
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Moxie` &&
      myBuffedstat($stat`Moxie`) < 150
    ) {
      auto_runChoice(5); // spend 1 ghost key for primestat, get ~200 moxie XP
    } else {
      auto_runChoice(1); // get moxie substats
    }
  } else if (choice === 880) {
    // One Elegant Nightstand (The Haunted Bedroom)
    if (
      internalQuestStatus("questM21Dance") < 2 &&
      itemAmount($item`Lady Spookyraven's finest gown`) === 0
    ) {
      auto_runChoice(1); // get Lady Spookyraven's Gown
    } else {
      auto_runChoice(2); // get elegant nightstick
    }
  } else {
    abort("unhandled choice in hauntedBedroomChoiceHandler");
  }
}

function LX_getLadySpookyravensFinestGownDo(): boolean {
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
        ) ?? 0.0;
      const elegantRate: number =
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`).get(
          $monster`elegant animated nightstand`,
        ) ?? 0.0;
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
  if (autoAdv($location`The Haunted Bedroom`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensFinestGownTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensFinestGown",
    completed: () => internalQuestStatus("questM21Dance") > 1,
    ready: () => internalQuestStatus("questM21Dance") === 1,
    do: LX_getLadySpookyravensFinestGownDo,
    locations: $location`The Haunted Bedroom`,
  });

export function LX_getLadySpookyravensFinestGown(): boolean {
  return runQuestTask(LX_getLadySpookyravensFinestGownTask);
}

function LX_getLadySpookyravensDancingShoesDo(): boolean {
  backupSetting("louvreDesiredGoal", "7"); // lets just let mafia automate this for us.
  auto_log_info("Spookyraven: Gallery", "blue");

  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (autoAdv($location`The Haunted Gallery`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensDancingShoesTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensDancingShoes",
    completed: () =>
      internalQuestStatus("questM21Dance") > 1 ||
      itemAmount($item`Lady Spookyraven's dancing shoes`) > 0,
    ready: () =>
      internalQuestStatus("questM21Dance") === 1 &&
      // Louvre It or Leave It choice adventure has a delay of 5 adventures.
      !canBurnDelay($location`The Haunted Gallery`),
    do: LX_getLadySpookyravensDancingShoesDo,
    locations: $location`The Haunted Gallery`,
  });

export function LX_getLadySpookyravensDancingShoes(): boolean {
  return runQuestTask(LX_getLadySpookyravensDancingShoesTask);
}

function LX_getLadySpookyravensPowderPuffDo(): boolean {
  auto_log_info("Spookyraven: Bathroom", "blue");

  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (!zone_delay($location`The Haunted Bathroom`).shouldDelay) {
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The Haunted Bathroom`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel()
    ) {
      return false;
    }
  }
  if (autoAdv($location`The Haunted Bathroom`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensPowderPuffTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensPowderPuff",
    completed: () =>
      internalQuestStatus("questM21Dance") > 1 ||
      itemAmount($item`Lady Spookyraven's powder puff`) > 0,
    ready: () =>
      internalQuestStatus("questM21Dance") === 1 &&
      // Never Gonna Make You Up choice adventure has a delay of 5 adventures.
      !canBurnDelay($location`The Haunted Bathroom`),
    do: LX_getLadySpookyravensPowderPuffDo,
    locations: $location`The Haunted Bathroom`,
  });

export function LX_getLadySpookyravensPowderPuff(): boolean {
  return runQuestTask(LX_getLadySpookyravensPowderPuffTask);
}

function LX_spookyravenManorSecondFloorDo(): boolean {
  return runTaskChain([
    LX_danceWithLadySpookyravenTask,
    LX_getLadySpookyravensFinestGownTask,
    LX_getLadySpookyravensDancingShoesTask,
    LX_getLadySpookyravensPowderPuffTask,
  ]);
}

export const LX_spookyravenManorSecondFloorTask: QuestTask = registerQuestTask({
  name: "LX_spookyravenManorSecondFloor",
  completed: () => internalQuestStatus("questM21Dance") > 3,
  ready: () => get("lastSecondFloorUnlock") >= myAscensions(),
  do: LX_spookyravenManorSecondFloorDo,
});

export function LX_spookyravenManorSecondFloor(): boolean {
  return runQuestTask(LX_spookyravenManorSecondFloorTask);
}

export function blackForestChoiceHandler(choice: number): void {
  if (choice === 923) {
    // All Over the Map (The Black Forest)
    if (5 in availableChoiceOptions()) {
      // only available with Candy Cane Sword Cane equipped
      auto_runChoice(5); // +8 exploration
      auto_runChoice(1); // go to You Found Your Thrill (#924)
    } else {
      auto_runChoice(1); // go to You Found Your Thrill (#924)
    }
  } else if (choice === 924) {
    if (get("auto_getBeehive", false) && myAdventures() > 3) {
      auto_runChoice(3); // go to Bee Persistent (#1018)
    } else if (
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      auto_runChoice(2); // go to The Blackberry Cobbler (#928)
    } else {
      auto_runChoice(1); // Attack the bushes (fight blackberry bush)
    }
  } else if (choice === 925) {
    // The Blackest Smith (The Black Forest)
    auto_runChoice(5); // skip
  } else if (choice === 926) {
    // Be Mine (The Black Forest)
    auto_runChoice(4); // skip
  } else if (choice === 927) {
    // Sunday Black Sunday (The Black Forest)
    auto_runChoice(3); // skip
  } else if (choice === 928) {
    if (
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      auto_runChoice(4); // get Blackberry Galoshes
    } else {
      auto_runChoice(5); // skip
    }
  } else if (choice === 1018) {
    // Bee Persistent (The Black Forest)
    if (get("auto_getBeehive", false) && myAdventures() > 2) {
      auto_runChoice(1); // go to Bee Rewarded (#1019)
    } else {
      auto_runChoice(2); // skip
    }
  } else if (choice === 1019) {
    // Bee Rewarded (The Black Forest)
    if (get("auto_getBeehive", false)) {
      auto_runChoice(1); // get the beehive
    } else {
      auto_runChoice(2); // skip
    }
  } else {
    abort("unhandled choice in blackForestChoiceHandler");
  }
}

function L11_blackMarketDo(): boolean {
  if (isBanished($phylum`beast`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "beast");
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
      canPull(galoshes)
    ) {
      pullXWhenHaveY(galoshes, 1, 0);
    }
  }

  if (itemAmount($item`beehive`) > 0) {
    set("auto_getBeehive", false);
  }

  autoEquipToSlot($slot`acc3`, $item`blackberry galoshes`);
  //If we want the Beehive, and don\'t have enough adventures, this is dangerous.
  if (get("auto_getBeehive", false) && myAdventures() < 3) {
    return false;
  }
  if (
    itemAmount($item`reassembled blackbird`) > 0 &&
    auto_haveGreyGoose() &&
    !possessEquipment($item`blackberry galoshes`) &&
    itemAmount($item`blackberry`) < 2 &&
    !in_darkGyffte()
  ) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at a blackberry bush.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  const advSpent: boolean = autoAdv($location`The Black Forest`);
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

export const L11_blackMarketTask: QuestTask = registerQuestTask({
  name: "L11_blackMarket",
  completed: () =>
    internalQuestStatus("questL11Black") > 1 || blackMarketAvailable(),
  ready: () =>
    internalQuestStatus("questL11Black") >= 0 &&
    !(
      possessEquipment($item`blackberry galoshes`) &&
      !auto_can_equip($item`blackberry galoshes`) &&
      !isAboutToPowerlevel()
    ),
  do: L11_blackMarketDo,
  locations: $location`The Black Forest`,
  desiredEncounters: () => [
    {
      item: $item`black map`,
      needAmount:
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable() ||
        itemAmount($item`black map`) > 0
          ? 0
          : 1,
    },
    {
      item: $item`blackberry`,
      needAmount:
        possessEquipment($item`blackberry galoshes`) ||
        !auto_can_equip($item`blackberry galoshes`)
          ? 0
          : 3 - itemAmount($item`blackberry`),
    },
  ],
});

export function L11_blackMarket(): boolean {
  return runQuestTask(L11_blackMarketTask);
}

function L11_getBeehiveDo(): boolean {
  if (
    internalQuestStatus("questL13Final") >= 7 ||
    itemAmount($item`beehive`) > 0
  ) {
    auto_log_info(
      "Nevermind, wall of skin already defeated (or we already have a beehiven). We do not need a beehive. Bloop.",
      "blue",
    );
    set("auto_getBeehive", false);
    return false;
  }

  auto_log_info("Must find a beehive!", "blue");

  const NCForced: boolean = auto_forceNextNoncombat(
    $location`The Black Forest`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < get("auto_runDayCount", 0) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  const advSpent: boolean = autoAdv($location`The Black Forest`);
  if (itemAmount($item`beehive`) > 0) {
    set("auto_getBeehive", false);
  }
  return advSpent;
}

export const L11_getBeehiveTask: QuestTask = registerQuestTask({
  name: "L11_getBeehive",
  completed: () =>
    internalQuestStatus("questL13Final") >= 7 || itemAmount($item`beehive`) > 0,
  ready: () => blackMarketAvailable() && get("auto_getBeehive", false),
  do: L11_getBeehiveDo,
  locations: $location`The Black Forest`,
  desiredEncounters: () => [
    {
      item: $item`blackberry`,
      needAmount:
        possessEquipment($item`blackberry galoshes`) ||
        !auto_can_equip($item`blackberry galoshes`)
          ? 0
          : 3 - itemAmount($item`blackberry`),
    },
  ],
});

export function L11_getBeehive(): boolean {
  return runQuestTask(L11_getBeehiveTask);
}

function L11_forgedDocumentsDo(): boolean {
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
    return autoAdvBypass(0, pages, $location`Noob Cave`);
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

export const L11_forgedDocumentsTask: QuestTask = registerQuestTask({
  name: "L11_forgedDocuments",
  completed: () =>
    internalQuestStatus("questL11Black") > 2 ||
    itemAmount($item`forged identification documents`) > 0,
  ready: () =>
    internalQuestStatus("questL11Black") >= 0 &&
    blackMarketAvailable() &&
    (!in_wereprof() || is_professor()),
  do: L11_forgedDocumentsDo,
});

export function L11_forgedDocuments(): boolean {
  return runQuestTask(L11_forgedDocumentsTask);
}

function L11_mcmuffinDiaryDo(): boolean {
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
  set("auto_considerCCSCShore", false);
  LX_doVacation();
  set("auto_considerCCSCShore", true);
  for (const diary of $items`your father's MacGuffin diary, copy of a jerk adventurer's father's diary`) {
    if (itemAmount(diary) > 0) {
      use(itemAmount(diary), diary);
      return true;
    }
  }
  return false;
}

export const L11_mcmuffinDiaryTask: QuestTask = registerQuestTask({
  name: "L11_mcmuffinDiary",
  completed: () => internalQuestStatus("questL11MacGuffin") > 1,
  ready: () =>
    internalQuestStatus("questL11MacGuffin") === 1 &&
    internalQuestStatus("questL11Black") >= 2 &&
    (!in_wereprof() || is_professor()),
  do: L11_mcmuffinDiaryDo,
});

export function L11_mcmuffinDiary(): boolean {
  return runQuestTask(L11_mcmuffinDiaryTask);
}

function auto_visit_gnasir(): void {
  //Visits gnasir, can change based on path
  if (in_koe()) {
    visitUrl("place.php?whichplace=exploathing_beach&action=expl_gnasir");
  } else {
    visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
  }
}

function L11_getUVCompassDo(): boolean {
  //acquire a [UV-resistant compass] if needed
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

const L11_getUVCompassTask: QuestTask = registerQuestTask({
  name: "L11_getUVCompass",
  completed: () =>
    //already have a dowsing rod. we do not need a compass.
    (possessEquipment($item`ornate dowsing rod`) &&
      auto_can_equip($item`ornate dowsing rod`)) ||
    //already have compass
    possessEquipment($item`UV-resistant compass`) ||
    //impossible to get compass in this path. [The Shore, Inc] is unavailable
    in_koe(),
  ready: () => auto_can_equip($item`UV-resistant compass`) && !is_werewolf(),
  do: L11_getUVCompassDo,
});

export function L11_getUVCompass(): boolean {
  return runQuestTask(L11_getUVCompassTask);
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

function L11_aridDesertDo(): boolean {
  // Fix broken desert tracking. pocket familiars failing as of r19010. plumber as of r20019
  if (in_plumber() || in_pokefam()) {
    visitUrl("place.php?whichplace=desertbeach", false);
  }
  if (get("desertExploration") >= 100) {
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

  if (LX_ornateDowsingRod(true)) {
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
  if (get("bondDesert")) {
    progress += 2;
  }
  if (getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb") {
    //TODO verify spelling on this string
    progress += 2;
  }

  if (get("auto_gnasirUnlocked", false)) {
    if (LX_spookyravenManorFirstFloor()) {
      // make sure we've actually done the Haunted Library before we want to hand in a killing jar
      return true;
    }

    if ((get("gnasirProgress") & 2) !== 2) {
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
              set("gnasirProgress", get("gnasirProgress") | 2);
              return true;
            } else {
              abort(
                "Returned can of black paint but did not return can of black paint.",
              );
            }
          } else {
            if ((get("gnasirProgress") & 2) !== 2) {
              auto_log_warning(
                "Mafia did not track gnasir Can of Black Paint (0x2). Fixing.",
                "red",
              );
              set("gnasirProgress", get("gnasirProgress") | 2);
            }
          }
        }
        use(1, $item`desert sightseeing pamphlet`);
        return true;
      }
    }

    if (
      itemAmount($item`killing jar`) > 0 &&
      (get("gnasirProgress") & 4) !== 4
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
          if ((get("gnasirProgress") & 4) !== 4) {
            auto_log_warning(
              "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
              "red",
            );
            set("gnasirProgress", get("gnasirProgress") | 4);
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    if (
      itemAmount($item`worm-riding manual page`) >= 15 &&
      (get("gnasirProgress") & 8) !== 8
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
        if ((get("gnasirProgress") & 8) !== 8) {
          auto_log_warning(
            "Mafia did not track gnasir Worm-Riding Manual Pages (0x8). Fixing.",
            "red",
          );
          set("gnasirProgress", get("gnasirProgress") | 8);
        }
      }
      return true;
    }

    if (
      itemAmount($item`worm-riding hooks`) > 0 &&
      (get("gnasirProgress") & 16) !== 16
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
      100 - get("desertExploration") <= 15 &&
      (get("gnasirProgress") & 12) === 0
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
            if ((get("gnasirProgress") & 4) !== 4) {
              auto_log_warning(
                "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
                "red",
              );
              set("gnasirProgress", get("gnasirProgress") | 4);
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
    get("desertExploration") === 0
  ) {
    auto_log_info("Searching for the pyramid", "blue");
    if (in_heavyrains()) {
      autoEquip($item`Thor's Pliers`);
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
    buffMaintain$2($effect`Butt-Rock Hair`);
    if (myPrimestat() === $stat`Muscle`) {
      auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
      buffMaintain$2($effect`Go Get 'Em, Tiger!`);
      auto_buyUpTo(1, $item`blood of the Wereseal`);
      buffMaintain$2($effect`Temporary Lycanthropy`);
    }

    if (myMp() > 30 && myHp() < myMaxhp() * 0.5) {
      acquireHP();
    }

    if (
      (inHardcore() || pullsRemaining() === 0) &&
      itemAmount($item`worm-riding hooks`) > 0 &&
      get("desertExploration") <= 100 - 5 * progress &&
      (get("gnasirProgress") & 16) !== 16 &&
      itemAmount($item`stone rose`) === 0
    ) {
      if (itemAmount($item`drum machine`) > 0) {
        auto_log_info("Found the drums, now we use them!", "blue");
        use(1, $item`drum machine`);
      } else {
        auto_log_info("Off to find the drums!", "blue");
        autoAdv($location`The Oasis`);
      }
      return true;
    }

    if ((get("gnasirProgress") & 1) !== 1) {
      const expectedOasisTurns: number = 8 - $location`The Oasis`.turnsSpent;
      const equivProgress: number = expectedOasisTurns * progress;
      const need_1: number = 100 - get("desertExploration");
      auto_log_info(`expectedOasis: ${expectedOasisTurns}`, "brown");
      auto_log_info(`equivProgress: ${equivProgress}`, "brown");
      auto_log_info(`need: ${need_1}`, "brown");
      if (
        need_1 <= 15 &&
        15 >= equivProgress &&
        itemAmount($item`stone rose`) === 0
      ) {
        auto_log_info("It seems raisinable to hunt a Stone Rose. Beep", "blue");
        autoAdv($location`The Oasis`);
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
      autoEquipToSlot($slot`weapon`, dbr.weapon);
    }
    if (dbr.offhand !== Item.none) {
      autoEquipToSlot($slot`off-hand`, dbr.offhand);
    }
    if (dbr.famEquip !== Item.none) {
      autoEquipToSlot($slot`familiar`, dbr.famEquip);
    }
    set("choiceAdventure805", 1);
    const need: number = 100 - get("desertExploration");
    auto_log_info(`Need for desert: ${need}`, "blue");
    auto_log_info(
      `Worm riding: ${itemAmount($item`worm-riding manual page`)}`,
      "blue",
    );

    if (
      !get("auto_gnasirUnlocked", false) &&
      $location`The Arid, Extra-Dry Desert`.turnsSpent > 10 &&
      get("desertExploration") > 10
    ) {
      auto_log_info(
        "Did not appear to notice that Gnasir unlocked, assuming so at this point.",
        "green",
      );
      set("auto_gnasirUnlocked", true);
    }

    if (
      get("auto_gnasirUnlocked", false) &&
      itemAmount($item`stone rose`) > 0 &&
      (get("gnasirProgress") & 1) !== 1
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
          if ((get("gnasirProgress") & 1) !== 1) {
            auto_log_warning(
              "Mafia did not track gnasir Stone Rose (0x1). Fixing.",
              "red",
            );
            set("gnasirProgress", get("gnasirProgress") | 1);
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    autoAdv($location`The Arid, Extra-Dry Desert`);

    if (containsText(getProperty("lastEncounter"), "A Sietch in Time")) {
      auto_log_info(
        "We've found the gnome!! Sightseeing pamphlets for everyone!",
        "green",
      );
      set("auto_gnasirUnlocked", true);
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
    const need: number = 100 - get("desertExploration");
    auto_log_info(
      `Getting some ultrahydrated, I suppose. Desert left: ${need}`,
      "blue",
    );
    if (
      !get("oasisAvailable") &&
      $location`The Arid, Extra-Dry Desert`.turnsSpent > 0
    ) {
      auto_log_info(
        `Oasis doesn't seem to be available, but we've been to the desert. Checking it manually...`,
      );
      visitUrl(`place.php?whichplace=desertbeach`);
    }

    if (!get("oasisAvailable") && haveEffect($effect`Ultrahydrated`) === 0) {
      return autoAdv($location`The Arid, Extra-Dry Desert`);
    }

    if (auto_haveBofa() && !isAboutToPowerlevel()) {
      // wait for a monster to give us ultrahydrated
      return false;
    }

    if (!autoAdv($location`The Oasis`)) {
      auto_log_warning(
        "Could not visit the Oasis for some reason, desertExploration may be incorrect.",
        "red",
      );
      const initial: number = get("desertExploration");
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
          set("desertExploration", found);
          return true;
        }
        if (!autoAdv($location`The Oasis`)) {
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

const L11_aridDesertTask: QuestTask = registerQuestTask({
  name: "L11_aridDesert",
  completed: () => internalQuestStatus("questL11Desert") > 0,
  ready: () => internalQuestStatus("questL11Desert") === 0,
  do: L11_aridDesertDo,
  desiredEncounters: () => [
    {
      item: $item`stone rose`,
      needAmount:
        itemAmount($item`stone rose`) === 0 && (get("gnasirProgress") & 1) === 0
          ? 1
          : 0,
    },
    {
      item: $item`worm-riding manual page`,
      needAmount: 15 - itemAmount($item`worm-riding manual page`),
    },
  ],
});

export function L11_aridDesert(): boolean {
  return runQuestTask(L11_aridDesertTask);
}

function LX_killBaaBaaBuranDo(): boolean {
  if (
    itemAmount($item`stone wool`) === 0 &&
    haveEffect($effect`Stone-Faced`) === 0
  ) {
    // try to clover/summon baa baa first
    if (auto_haveGreyGoose()) {
      auto_log_info(
        "Bringing the Grey Goose to emit some drones at a Sheep carving.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    } else {
      handleFamiliar("item");
    }
    maximizer.weight($modifier`Item Drop`, 20).max($modifier`Item Drop`, 400);
    // Right now clovers are "cheaper" than summons, so use clover first, but not our last.
    if (cloversAvailable() > 1) {
      return autoLuckyAdv($location`The Hidden Temple`);
    }

    if (canSummonMonster($monster`Baa'baa'bu'ran`)) {
      return summonMonster($monster`Baa'baa'bu'ran`);
    }
  }
  return false;
}

const LX_killBaaBaaBuranTask: QuestTask = registerQuestTask({
  name: "LX_killBaaBaaBuran",
  completed: () =>
    itemAmount($item`stone wool`) > 0 || haveEffect($effect`Stone-Faced`) > 0,
  ready: () => hiddenTempleUnlocked(),
  do: LX_killBaaBaaBuranDo,
  locations: $location`The Hidden Temple`,
  desiredEncounters: () => [
    {
      monster: $monster`Baa'baa'bu'ran`,
      needAmount:
        itemAmount($item`stone wool`) > 0 ||
        haveEffect($effect`Stone-Faced`) > 0
          ? 0
          : 1,
    },
  ],
});

export function LX_killBaaBaaBuran(): boolean {
  return runQuestTask(LX_killBaaBaaBuranTask);
}

function L11_unlockHiddenCityDo(): boolean {
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

    buffMaintain$2($effect`Stone-Faced`);
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
  return autoAdv($location`The Hidden Temple`);
}

export const L11_unlockHiddenCityTask: QuestTask = registerQuestTask({
  name: "L11_unlockHiddenCity",
  completed: () => internalQuestStatus("questL11Worship") > 2,
  ready: () =>
    hiddenTempleUnlocked() &&
    internalQuestStatus("questL11Worship") >= 0 &&
    myAdventures() - auto_advToReserve() > 3,
  do: L11_unlockHiddenCityDo,
  locations: $location`The Hidden Temple`,
  reqAdventures: () =>
    hiddenTempleUnlocked() && internalQuestStatus("questL11Worship") >= 0
      ? 3
      : 0,
});

export function L11_unlockHiddenCity(): boolean {
  return runQuestTask(L11_unlockHiddenCityTask);
}

export function hiddenTempleChoiceHandler(choice: number, page: string): void {
  if (choice === 123) {
    // At Least It's Not Full Of Trash
    auto_runChoice(2); // Go to Beginning at the Beginning of Beginning
    visitUrl("choice.php");
    cliExecute("dvorak"); // Solve puzzle and go to No Visible Means of Support (#125)
  } else if (choice === 125) {
    // No Visible Means of Support
    auto_runChoice(3); // Unlock the Hidden City!
  } else if (choice === 579) {
    // Such Great Heights
    if (
      itemAmount($item`stone wool`) >= 2 &&
      get("lastTempleAdventures") < myAscensions()
    ) {
      auto_runChoice(3); // if we have plenty of stone wool, take the adventures first (and reset Mayam)
    } else if (
      itemAmount($item`the Nostril of the Serpent`) === 0 &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      auto_runChoice(2); // Get The Nostril of the Serpent
    } else {
      auto_runChoice(3); // +3 adventures and extend 10 effects (first time) or skip
    }
  } else if (choice === 580) {
    // The Hidden Heart of the Hidden Temple
    if (
      !containsText(
        page,
        "The door is decorated with that little lightning-tailed guy from your father's diary.",
      )
    ) {
      auto_runChoice(2); // Go to Unconfusing Buttons (#584) or Confusing Buttons (#583)
    } else {
      auto_runChoice(1); // Go to At Least It's Not Full Of Trash (#123)
    }
  } else if (choice === 581) {
    // Such Great Depths
    auto_runChoice(3); // Fight the Clan of cave bars
  } else if (choice === 582) {
    // Fitting In
    if (
      itemAmount($item`the Nostril of the Serpent`) > 0 &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      auto_runChoice(2); // Go to The Hidden Heart of the Hidden Temple (#580)
    } else {
      auto_runChoice(1); // Go to Such Great Heights (#579)
    }
  } else if (choice === 583) {
    // Confusing Buttons
    auto_runChoice(1); // Randomly changes The Hidden Heart of the Hidden Temple
  } else if (choice === 584) {
    // Unconfusing Buttons
    auto_runChoice(4); // Go to The Hidden Heart of the Hidden Temple (Pikachutlotal) (#580)
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

function L11_hiddenTavernUnlock(force: boolean = false): boolean {
  if (!auto_is_valid($item`book of matches`)) {
    return false;
  }

  if (myAscensions() === get("hiddenTavernUnlock")) {
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

  if (myAscensions() > get("hiddenTavernUnlock")) {
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
      auto_runChoice(1); // fight the spirit
    } else if (
      4 in availableChoiceOptions() &&
      haveEffect($effect`Thrice-Cursed`) === 0
    ) {
      // Use CCSC to get Cursed +1
      auto_runChoice(4);
      if (haveEffect($effect`Thrice-Cursed`) > 0) {
        auto_runChoice(1); // fight the spirit
      } else {
        auto_runChoice(2); // get cursed
      }
    } else {
      auto_runChoice(2); // get cursed
    }
  } else if (choice === 781) {
    // Earthbound and Down (An Overgrown Shrine (Northwest))
    if (get("hiddenApartmentProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Apartment Building
    } else if (itemAmount($item`moss-covered stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 783) {
    // Water You Dune (An Overgrown Shrine (Southwest))
    if (get("hiddenHospitalProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Hospital
    } else if (itemAmount($item`dripping stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 784) {
    // You, M. D. (The Hidden Hospital)
    auto_runChoice(1); // fight the spirit
  } else if (choice === 785) {
    // Air Apparent (An Overgrown Shrine (Northeast))

    if (get("hiddenOfficeProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Office Building
    } else if (
      itemAmount(
        // either use CCSC + unlock or just unlock based on user sphere presence
        $item`crackling stone sphere`,
      ) > 0
    ) {
      if (4 in availableChoiceOptions()) {
        auto_runChoice(4); // get free meat via CCSC
      }
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 786) {
    // Working Holiday (The Hidden Office Building)
    if (itemAmount($item`McClusky file (complete)`) > 0) {
      auto_runChoice(1); // fight the spirit
    } else if (itemAmount($item`boring binder clip`) === 0) {
      auto_runChoice(2); // get boring binder clip
    } else {
      auto_runChoice(3); // fight an accountant
    }
  } else if (choice === 787) {
    // Fire When Ready (An Overgrown Shrine (Southeast))
    if (get("hiddenBowlingAlleyProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Bowling Alley
    } else if (itemAmount($item`scorched stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 788) {
    // Life is Like a Cherry of Bowls (The Hidden Bowling Alley)
    if (2 in availableChoiceOptions()) {
      auto_runChoice(2); // bowl for stats 4 times then fight the spirit on 5th occurrence
      auto_runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    } else {
      auto_runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    }
  } else if (choice === 789) {
    // Where Does The Lone Ranger Take His Garbagester? (The Hidden Park)
    if (get("relocatePygmyJanitor") !== myAscensions()) {
      auto_runChoice(2); // Relocate the Pygmy Janitor to the park
    } else {
      auto_runChoice(1); // Get Hidden City zone items
    }
  } else if (choice === 791) {
    // Legend of the Temple in the Hidden City (A Massive Ziggurat)
    if (itemAmount($item`stone triangle`) === 4) {
      auto_runChoice(1); // fight the Protector Spirit (or replacement)
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 1002) {
    // Temple of the Legend in the Hidden City (A Massive Ziggurat/Actually Ed the Undying)
    if (itemAmount($item`stone triangle`) === 4) {
      auto_runChoice(1); // Put the Ancient Amulet back
    } else {
      auto_runChoice(6); // skip
    }
  } else {
    abort("unhandled choice in hiddenCityChoiceHandler");
  }
}

function L11_hiddenCityDo(): boolean {
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
      auto_log_warning(
        "Delaying hidden city because we are unable to restore HP",
      );
      return false; //could not heal HP. we should go do something else first
    }
  }
  if (in_robot() && myLevel() < 13) {
    return false;
  }

  const weapon_ghost_dmg: number = toInt(
    numericModifier($modifier`Hot Damage`) +
      numericModifier($modifier`Cold Damage`) +
      numericModifier($modifier`Stench Damage`) +
      numericModifier($modifier`Sleaze Damage`) +
      numericModifier($modifier`Spooky Damage`),
  );
  if (
    !in_robot() &&
    !in_darkGyffte() &&
    weapon_ghost_dmg < 20 &&
    !acquireMP(
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
      !zone_delay($location`The Hidden Apartment Building`).shouldDelay ||
      auto_haveQueuedForcedNonCombat();

    let canDrinkCursedPunch: boolean =
      auto_canDrink($item`Cursed Punch`) &&
      !get("auto_limitConsume", false) &&
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
            L11_hiddenTavernUnlock(true);

            if (myAscensions() === get("hiddenTavernUnlock")) {
              shouldForceElevatorAction = true;
            }
          }
        }
      }

      if (shouldForceElevatorAction) {
        elevatorAction = auto_forceNextNoncombat(
          $location`The Hidden Apartment Building`,
        );
        // delay if we are out of NC forcers and haven't run out of things to do
        if (
          !elevatorAction &&
          myDaycount() < get("auto_runDayCount", 0) &&
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
      ).delayRemaining;

      if (
        auto_have_familiar($familiar`Nosy Nose`) &&
        auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
      ) {
        if (
          haveEffect($effect`Thrice-Cursed`) < turnsUntilElevatorAction + 1 &&
          (auto_combat_appearance_rates$1(
            $location`The Hidden Apartment Building`,
          ).get($monster`pygmy shaman`) ?? 0.0) < 100
        ) {
          handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of shamen. the deleveling can also help survive being cursed
        } else if (
          (auto_combat_appearance_rates$1(
            $location`The Hidden Office Building`,
          ).get($monster`pygmy witch accountant`) ?? 0.0) >= 20 &&
          itemAmount($item`McClusky file (complete)`) === 0
        ) {
          //once done with curses will want witch accountants
          if (
            itemAmount($item`McClusky file (page 4)`) === 0 ||
            safeGet("nosyNoseMonster", Monster.none) ===
              $monster`pygmy witch accountant`
          ) {
            handleFamiliar$1($familiar`Nosy Nose`);
          }
        }
      }
      return autoAdv($location`The Hidden Apartment Building`);
    } else {
      if (haveEffect($effect`Thrice-Cursed`) === 0) {
        //can drink and inebriety allows it
        if (canDrinkCursedPunch) {
          L11_hiddenTavernUnlock(true);
          if (myAscensions() === get("hiddenTavernUnlock") && !is_werewolf()) {
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
        set(
          "auto_nextEncounter",
          "ancient protector spirit (The Hidden Apartment Building)",
        );
      }
      auto_log_info(
        `Hidden Apartment Progress: ${getProperty("hiddenApartmentProgress")}`,
        "blue",
      );
      return autoAdv($location`The Hidden Apartment Building`);
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

    const turnsUntilWorkingHoliday = zone_delay(
      $location`The Hidden Office Building`,
    ).delayRemaining;
    let workingHoliday: boolean =
      turnsUntilWorkingHoliday === 0 || auto_haveQueuedForcedNonCombat();

    if (
      turnsUntilWorkingHoliday > 1 &&
      itemAmount($item`McClusky file (complete)`) > 0 &&
      auto_canForceNextNoncombat()
    ) {
      if (auto_forceNextNoncombat($location`The Hidden Office Building`)) {
        //how many delay turns should this save to be considered?
        workingHoliday = true;
      } else if (
        myDaycount() < get("auto_runDayCount", 0) &&
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
        ).get($monster`pygmy witch accountant`) ?? 0.0) < 100
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
      ).get($monster`pygmy witch accountant`) ?? 0.0) >=
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
      return autoAdv($location`The Hidden Apartment Building`);
    }

    if (workingHoliday && itemAmount($item`McClusky file (complete)`) > 0) {
      set(
        "auto_nextEncounter",
        "ancient protector spirit (The Hidden Office Building)",
      );
    }
    return autoAdv($location`The Hidden Office Building`);
  }

  if (internalQuestStatus("questL11Spare") === 0) {
    auto_log_info("The idden [sic] bowling alley!", "blue");
    L11_hiddenTavernUnlock(true);
    if (myAscensions() === get("hiddenTavernUnlock")) {
      if (itemAmount($item`Bowl of Scorpions`) === 0 && !is_werewolf()) {
        //can't access shops as werewolf
        auto_buyUpTo(1, $item`Bowl of Scorpions`);
        if (in_ocrs()) {
          auto_buyUpTo(3, $item`Bowl of Scorpions`);
        }
      }
    }

    buffMaintain$2($effect`Fishy Whiskers`);
    auto_log_info(
      `Hidden Bowling Alley Progress: ${getProperty("hiddenBowlingAlleyProgress")}`,
      "blue",
    );
    if (
      canSniff($monster`pygmy bowler`, $location`The Hidden Bowling Alley`) &&
      itemAmount($item`bowling ball`) < 1 &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Pygmy Bowler.",
      );
    }
    if (auto_canCamelSpit() && get("hiddenBowlingAlleyProgress") < 2) {
      auto_log_info(
        "Bringing the Camel to spit on a Pygmy Bowler for bowling balls.",
      );
      handleFamiliar$1($familiar`Melodramedary`);
    }
    if (auto_haveGreyGoose() && get("hiddenBowlingAlleyProgress") < 3) {
      auto_log_info(
        "Bringing the Grey Goose to emit some drones at a Pygmy Bowler for bowling balls.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (
      itemAmount($item`bowling ball`) > 0 &&
      get("hiddenBowlingAlleyProgress") === 5
    ) {
      set(
        "auto_nextEncounter",
        "ancient protector spirit (The Hidden Bowling Alley)",
      );
    }
    return autoAdv($location`The Hidden Bowling Alley`);
  }

  if (internalQuestStatus("questL11Doctor") === 0) {
    if (itemAmount($item`dripping stone sphere`) > 0) {
      return true;
    }
    auto_log_info("The idden [sic] ospital!", "blue");

    autoEquip($item`bloodied surgical dungarees`);
    autoEquip($item`half-size scalpel`);
    autoEquip($item`surgical apron`);
    autoEquipToSlot($slot`acc3`, $item`head mirror`);
    autoEquipToSlot($slot`acc2`, $item`surgical mask`);

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
        ) ?? 0.0) < 100
      ) {
        if (
          surgeonGearWanted >= 2 ||
          safeGet("nosyNoseMonster", Monster.none) ===
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
    return autoAdv($location`The Hidden Hospital`);
  }

  if (itemAmount($item`moss-covered stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv($location`An Overgrown Shrine (Northwest)`);
  }

  if (itemAmount($item`crackling stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv($location`An Overgrown Shrine (Northeast)`);
  }

  if (itemAmount($item`dripping stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv($location`An Overgrown Shrine (Southwest)`);
  }

  if (itemAmount($item`scorched stone sphere`) > 0) {
    auto_log_info("Getting the stone triangles", "blue");
    return autoAdv($location`An Overgrown Shrine (Southeast)`);
  }

  if (itemAmount($item`stone triangle`) === 4) {
    auto_log_info("Fighting the out-of-work spirit", "blue");
    acquireHP();
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    }
    set("auto_nextEncounter", "Protector Spectre");
    handleFamiliar("boss");
    const advSpent: boolean = autoAdv($location`A Massive Ziggurat`);
    if (internalQuestStatus("questL11MacGuffin") > 2) {
      // Actually Ed finishes this quest when all 3 parts of the staff are returned
      council();
    }
    return advSpent;
  }

  return false;
}

export const L11_hiddenCityTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCity",
  completed: () => internalQuestStatus("questL11Worship") > 4,
  ready: () => internalQuestStatus("questL11Worship") >= 3,
  do: L11_hiddenCityDo,
  locations: $locations`The Hidden Apartment Building, The Hidden Office Building, The Hidden Bowling Alley, The Hidden Hospital, An Overgrown Shrine (Northwest), An Overgrown Shrine (Northeast), An Overgrown Shrine (Southwest), An Overgrown Shrine (Southeast), A Massive Ziggurat`,
  desiredEncounters: () => {
    const desired: (DesiredDrop | DesiredFights)[] = [];

    if (internalQuestStatus("questL11Worship") <= 4) {
      desired.push({
        monster: $monster`Protector Spectre`,
        needAmount: 1,
      });
    }

    if (itemAmount($item`McClusky file (complete)`) === 0) {
      desired.push(
        ...$items`McClusky file (page 1), McClusky file (page 2), McClusky file (page 3), McClusky file (page 4), McClusky file (page 5)`
          .filter((page) => itemAmount(page) === 0)
          .map((page) => ({
            item: page,
            needAmount: 1,
          })),
      );
    }

    if (
      !possessEquipment($item`attorney's badge`) &&
      auto_can_equip($item`attorney's badge`)
    ) {
      desired.push({ item: $item`attorney's badge`, needAmount: 1 });
    }

    return desired;
  },
});

export function L11_hiddenCity(): boolean {
  return runQuestTask(L11_hiddenCityTask);
}

function L11_hiddenCityZonesCanUseMachete(): boolean {
  return !is_boris() && !in_wotsf() && !in_pokefam() && !in_avantGuard();
}

function L11_hiddenCityZonesNeedPark(): boolean {
  const canUseMachete: boolean = L11_hiddenCityZonesCanUseMachete();
  const needMachete: boolean =
    canUseMachete &&
    !possessEquipment($item`antique machete`) &&
    (inHardcore() || in_lol());
  const needRelocate: boolean = get("relocatePygmyJanitor") !== myAscensions();
  return needMachete || needRelocate;
}

function L11_hiddenCityZonesEquipMachete(): boolean {
  if (in_avantGuard()) {
    return false; //combats aren't free so no point in equipping a Machete
  }
  if (auto_can_equip($item`antique machete`)) {
    if (possessEquipment($item`antique machete`)) {
      return autoForceEquip$3($item`antique machete`);
    } else if (
      !possessEquipment($item`muculent machete`) &&
      canPull($item`antique machete`)
    ) {
      pullXWhenHaveY($item`antique machete`, 1, 0);
      return autoForceEquip$3($item`antique machete`);
    }
  }
  if (auto_can_equip($item`muculent machete`)) {
    if (
      !possessEquipment($item`muculent machete`) &&
      canPull($item`muculent machete`)
    ) {
      pullXWhenHaveY($item`muculent machete`, 1, 0);
    }
    return autoForceEquip$3($item`muculent machete`);
  }
  return false;
}

function L11_hiddenCityZonesEquipForShrine(): boolean {
  const canUseMachete: boolean = L11_hiddenCityZonesCanUseMachete();
  if (canUseMachete && !L11_hiddenCityZonesEquipMachete()) {
    return false;
  }
  if (!canUseMachete && auto_haveTearawayPants()) {
    autoForceEquip$3($item`tearaway pants`);
  }
  return true;
}

function L11_hiddenCityZonesDo(): boolean {
  L11_hiddenTavernUnlock();

  if (L11_hiddenCityZonesNeedPark()) {
    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      auto_changeSnapperPhylum($phylum`dude`);
    }
    return autoAdv($location`The Hidden Park`);
  }

  if (get("breathitinCharges") > 0) {
    // Shrines & Ziggurat are outdoor zones with free combats. Let's not waste Breathitin charges.
    return false;
  }

  if (auto_habitatFightsLeft() > 0) {
    // Don't waste habitat wanderers clearing dense liana's
    return false;
  }

  return runTaskChain([
    L11_hiddenCityZonesNorthwestTask,
    L11_hiddenCityZonesNortheastTask,
    L11_hiddenCityZonesSouthwestTask,
    L11_hiddenCityZonesSoutheastTask,
    L11_hiddenCityZonesZigguratTask,
  ]);
}

function L11_hiddenCityZonesNorthwest(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Northwest)`);
}

const L11_hiddenCityZonesNorthwestTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZonesNorthwest",
  completed: () => get("hiddenApartmentProgress") > 0,
  ready: () => get("hiddenApartmentProgress") === 0,
  do: L11_hiddenCityZonesNorthwest,
  locations: $location`An Overgrown Shrine (Northwest)`,
  desiredEncounters: () => [
    {
      item: $item`moss-covered stone sphere`,
      needAmount: get("hiddenApartmentProgress") < 1 ? 1 : 0,
    },
  ],
});

function L11_hiddenCityZonesNortheast(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Northeast)`);
}

const L11_hiddenCityZonesNortheastTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZonesNortheast",
  completed: () => get("hiddenOfficeProgress") > 0,
  ready: () => get("hiddenOfficeProgress") === 0,
  do: L11_hiddenCityZonesNortheast,
  locations: $location`An Overgrown Shrine (Northeast)`,
  desiredEncounters: () => [
    {
      item: $item`crackling stone sphere`,
      needAmount: get("hiddenOfficeProgress") < 1 ? 1 : 0,
    },
  ],
});

function L11_hiddenCityZonesSouthwest(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Southwest)`);
}

const L11_hiddenCityZonesSouthwestTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZonesSouthwest",
  completed: () => get("hiddenHospitalProgress") > 0,
  ready: () => get("hiddenHospitalProgress") === 0,
  do: L11_hiddenCityZonesSouthwest,
  locations: $location`An Overgrown Shrine (Southwest)`,
  desiredEncounters: () => [
    {
      item: $item`dripping stone sphere`,
      needAmount: get("hiddenHospitalProgress") < 1 ? 1 : 0,
    },
  ],
});

function L11_hiddenCityZonesSoutheast(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Southeast)`);
}

const L11_hiddenCityZonesSoutheastTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZonesSoutheast",
  completed: () => get("hiddenBowlingAlleyProgress") > 0,
  ready: () => get("hiddenBowlingAlleyProgress") === 0,
  do: L11_hiddenCityZonesSoutheast,
  locations: $location`An Overgrown Shrine (Southeast)`,
  desiredEncounters: () => [
    {
      item: $item`scorched stone sphere`,
      needAmount: get("hiddenBowlingAlleyProgress") < 1 ? 1 : 0,
    },
  ],
});

function L11_hiddenCityZonesZiggurat(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  const advSpent: boolean = autoAdv($location`A Massive Ziggurat`);
  if (
    getProperty("lastEncounter") ===
      "Legend of the Temple in the Hidden City" ||
    (isActuallyEd() &&
      getProperty("lastEncounter") ===
        "Temple of the Legend in the Hidden City")
  ) {
    set("auto_openedziggurat", true);
  }
  return advSpent;
}

const L11_hiddenCityZonesZigguratTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZonesZiggurat",
  completed: () => get("auto_openedziggurat", false),
  ready: () => !get("auto_openedziggurat", false),
  do: L11_hiddenCityZonesZiggurat,
  locations: $location`A Massive Ziggurat`,
  desiredEncounters: () => [
    {
      monster: $monster`Protector Spectre`,
      needAmount: get("auto_openedziggurat") ? 0 : 1,
    },
  ],
});

export const L11_hiddenCityZonesTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZones",
  completed: () => internalQuestStatus("questL11Worship") > 4,
  ready: () => internalQuestStatus("questL11Worship") >= 3,
  do: L11_hiddenCityZonesDo,
  locations: $location`The Hidden Park`,
  desiredEncounters: () => [
    {
      item: $item`book of matches`,
      needAmount:
        itemAmount($item`book of matches`) === 0 &&
        myAscensions() < get("hiddenTavernUnlock")
          ? 1
          : 0,
    },
  ],
});

export function L11_hiddenCityZones(): boolean {
  return runQuestTask(L11_hiddenCityZonesTask);
}

function L11_mauriceSpookyravenAltPathwayActive(): boolean {
  return (
    !possessEquipment($item`Lord Spookyraven's spectacles`) ||
    is_boris() ||
    in_wotsf() ||
    in_bhy() ||
    in_robot() ||
    (in_nuclear() && !get("auto_haveoven", false))
  );
}

function L11_mauriceSpookyravenNormalPathwayReady(): boolean {
  const recipeUsed = getProperty("spookyravenRecipeUsed");
  if (recipeUsed === "without_glasses") {
    abort(
      "Did not read Mortar Recipe with the Spookyraven glasses. We can't proceed.",
    );
  }
  if (recipeUsed !== "with_glasses") {
    // Not read yet - let the Mortar task have its turn first.
    return false;
  }
  if (auto_reserveUndergroundAdventures()) {
    return false;
  }
  return true;
}

const L11_mauriceSpookyravenBallroomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBallroom",
  completed: () => internalQuestStatus("questL11Manor") >= 1,
  ready: () => internalQuestStatus("questL11Manor") < 1,
  do: () => {
    auto_log_info("Searching for the basement of Spookyraven", "blue");
    if (!lar_repeat($location`The Haunted Ballroom`)) {
      return false;
    }
    if (auto_wantToSpadeDigSkeleton($location`The Haunted Ballroom`)) {
      return auto_spadeDigSkeleton($location`The Haunted Ballroom`);
    }
    if (canBurnDelay($location`The Haunted Ballroom`)) {
      // We'll All Be Flat choice adventure has a delay of 5 adventures.
      return false;
    }
    return autoAdv($location`The Haunted Ballroom`);
  },
  locations: $location`The Haunted Ballroom`,
});

const L11_mauriceSpookyravenMortarTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenMortar",
  completed: () => getProperty("spookyravenRecipeUsed") !== "none",
  ready: () => internalQuestStatus("questL11Manor") >= 1,
  do: () => {
    if (itemAmount($item`recipe: mortar-dissolving solution`) === 0) {
      if (possessEquipment($item`Lord Spookyraven's spectacles`)) {
        equip($slot`acc3`, $item`Lord Spookyraven's spectacles`);
      }
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
      if (itemAmount($item`recipe: mortar-dissolving solution`) === 0) {
        abort(`Failed to acquire mortar-dissolving solution`);
      }
    }
    use(1, $item`recipe: mortar-dissolving solution`);
    return true;
  },
});

const L11_mauriceSpookyravenBossTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBoss",
  completed: () => internalQuestStatus("questL11Manor") > 3,
  ready: () => {
    if (internalQuestStatus("questL11Manor") <= 2) {
      return false;
    }
    if (is_professor()) {
      return false; //Can't beat Lord Spookyraven as the Professor
    }
    return true;
  },
  do: () => {
    auto_log_info("Down with the tyrant of Spookyraven!", "blue");
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
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
      set("auto_nonAdvLoc", true);
      autoAdv($location`Summoning Chamber`);
    }
    return true;
  },
  locations: $location`Summoning Chamber`,
});

const L11_mauriceSpookyravenOvenTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenOven",
  completed: () => get("auto_haveoven", false),
  ready: () => !get("auto_haveoven", false),
  do: () => {
    ovenHandle();
    return true;
  },
});

const L11_mauriceSpookyravenWineBombTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenWineBomb",
  completed: () => internalQuestStatus("questL11Manor") >= 3,
  ready: () =>
    itemAmount($item`wine bomb`) === 1 &&
    internalQuestStatus("questL11Manor") < 3,
  do: () => {
    visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
    if (internalQuestStatus("questL11Manor") < 3) {
      abort("Tried to use the wine bomb but it somehow failed?");
    }
    return true;
  },
});

const L11_mauriceSpookyravenAltPathwayTask: QuestTask = {
  name: "L11_mauriceSpookyravenAltPathway",
  completed: () =>
    getProperty("spookyravenRecipeUsed") === "with_glasses" ||
    have($item`bottle of Chateau de Vinegar`) ||
    have($item`unstable fulminate`) ||
    have($item`wine bomb`) ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => L11_mauriceSpookyravenAltPathwayActive(),
  do: () => {},
};

const L11_mauriceSpookyravenKitchenTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenKitchen",
    completed: () => itemAmount($item`loosening powder`) > 0,
    ready: () => itemAmount($item`loosening powder`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      // I suppose we can let anyone in without the Spectacles.
      return autoAdv($location`The Haunted Kitchen`);
    },
    locations: $location`The Haunted Kitchen`,
  },
);

const L11_mauriceSpookyravenConservatoryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenConservatory",
    completed: () => itemAmount($item`powdered castoreum`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Conservatory`);
    },
    locations: $location`The Haunted Conservatory`,
  },
);

const L11_mauriceSpookyravenBathroomTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenBathroom",
    completed: () => itemAmount($item`drain dissolver`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Bathroom`);
    },
    locations: $location`The Haunted Bathroom`,
  },
);

const L11_mauriceSpookyravenGalleryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenGallery",
    completed: () => itemAmount($item`triple-distilled turpentine`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Gallery`);
    },
    locations: $location`The Haunted Gallery`,
  },
);

const L11_mauriceSpookyravenLaboratoryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenLaboratory",
    completed: () => itemAmount($item`detartrated anhydrous sublicalc`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      //3rd floor unlock fix. can manually adv without starting quest. but autoAdv fails until quest is started. so start the quest
      if (internalQuestStatus("questM17Babies") === -1) {
        visitUrl("place.php?whichplace=manor3&action=manor3_ladys"); //talk to 3rd floor ghost to start quest
      }
      return autoAdv($location`The Haunted Laboratory`);
    },
    locations: $location`The Haunted Laboratory`,
  },
);

const L11_mauriceSpookyravenStorageRoomTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenStorageRoom",
    completed: () => itemAmount($item`triatomaceous dust`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) > 0 &&
      itemAmount($item`triatomaceous dust`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Storage Room`);
    },
    locations: $location`The Haunted Storage Room`,
  },
);

const L11_mauriceSpookyravenAltPathwayFinishTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenAltPathwayFinish",
    completed: () =>
      possessEquipment($item`unstable fulminate`) ||
      internalQuestStatus("questL11Manor") >= 3,
    ready: () =>
      !possessEquipment($item`unstable fulminate`) &&
      internalQuestStatus("questL11Manor") < 3 &&
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) > 0 &&
      itemAmount($item`triatomaceous dust`) > 0,
    do: () => {
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
      return true;
    },
  },
);

const L11_mauriceSpookyravenFulminateCraftTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenFulminateCraft",
  completed: () =>
    possessEquipment($item`unstable fulminate`) ||
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () =>
    itemAmount($item`blasting soda`) === 1 &&
    itemAmount($item`bottle of Chateau de Vinegar`) === 1,
  do: () => {
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
      set("auto_haveoven", false);
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
    return true;
  },
});

const L11_mauriceSpookyravenWineCellarTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenWineCellar",
  completed: () =>
    itemAmount($item`bottle of Chateau de Vinegar`) > 0 ||
    have($item`unstable fulminate`) ||
    have($item`wine bomb`) ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (L11_mauriceSpookyravenAltPathwayActive()) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    if (isBanished($phylum`construct`) && get("screechCombats") > 0) {
      set("_auto_screechDelay", "construct");
      return false; //No sense in trying to go to the Wine Cellar if constructs (Wine Racks) are banished
    }
    return true;
  },
  do: () => {
    auto_log_info("Searching for vinegar", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats();
    }
    if (friarsAvailable() && !get("friarsBlessingReceived")) {
      cliExecute("friars booze");
    }
    if (
      canSniff(
        $monster`possessed wine rack`,
        $location`The Haunted Wine Cellar`,
      ) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Possessed Wine Rack.",
      );
    }
    return autoAdv($location`The Haunted Wine Cellar`);
  },
  locations: $location`The Haunted Wine Cellar`,
});

const L11_mauriceSpookyravenLaundryRoomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenLaundryRoom",
  completed: () =>
    itemAmount($item`blasting soda`) > 0 ||
    possessEquipment($item`unstable fulminate`) ||
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (
      L11_mauriceSpookyravenAltPathwayActive() ||
      itemAmount($item`blasting soda`) > 0 ||
      possessEquipment($item`unstable fulminate`) ||
      internalQuestStatus("questL11Manor") >= 3
    ) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    if (isBanished($phylum`undead`) && get("screechCombats") > 0) {
      set("_auto_screechDelay", "undead");
      return false; //No sense in trying to go to the Laundry Room if undead (Cabinet of Dr. Limpieza) are banished
    }
    return true;
  },
  do: () => {
    auto_log_info("Searching for baking soda, I mean, blasting pop.", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats();
    }
    auto_lostStomach(true);
    if (
      canSniff(
        $monster`cabinet of Dr. Limpieza`,
        $location`The Haunted Laundry Room`,
      ) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Cabinet of Dr. Limpieza.",
      );
    }
    return autoAdv($location`The Haunted Laundry Room`);
  },
  locations: $location`The Haunted Laundry Room`,
});

const L11_mauriceSpookyravenBoilerRoomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBoilerRoom",
  completed: () =>
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (!possessEquipment($item`unstable fulminate`)) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    // Zootomist probably wants to wait until D2 in SC for this.
    if (auto_inRonin() && in_zootomist()) {
      if (auto_waitForDay2()) {
        auto_log_debug("Delaying Monstrous Boiler waiting for day 2.");
        return false;
      }
    }
    return true;
  },
  do: () => {
    auto_MaxMLToCap(auto_convertDesiredML(82), true);
    maximizer
      .weight($modifier`Monster Level`, 500)
      .max($modifier`Monster Level`, auto_convertDesiredML(82));

    if (in_picky() && itemAmount($item`gumshoes`) > 0) {
      auto_change_mcd(0);
      autoEquipToSlot($slot`acc2`, $item`gumshoes`);
    }

    if (is_professor()) {
      // +ML is BAD for professor
      auto_change_mcd(0);
      maximizer
        .clearWeight($modifier`Monster Level`)
        .clearMax($modifier`Monster Level`);
    }

    if (monsterLevelAdjustment() < 57) {
      buffMaintain$2($effect`Sweetbreads Flambé`);
    }

    if (!autoForceEquip($slot`off-hand`, $item`unstable fulminate`)) {
      abort(
        "Unstable Fulminate was not equipped. Please report this and include the following: Equipped items and if you have or don't have an Unstable Fulminate. For now, get the wine bomb manually, and run again.",
      );
    }

    auto_log_info("Now we mix and heat it up.", "blue");
    return autoAdv($location`The Haunted Boiler Room`);
  },
  locations: $location`The Haunted Boiler Room`,
});

function L11_mauriceSpookyravenDo(): boolean {
  if (
    (isActuallyEd() && itemAmount($item`[7962]Eye of Ed`) === 0) ||
    itemAmount($item`[2286]Eye of Ed`) > 0
  ) {
    return true;
  }
  if (in_robot() && myLevel() < 13) {
    return false; //delay fight so we can make sure we are strong enough to beat him
  }

  return runTaskChain([
    L11_mauriceSpookyravenBallroomTask,
    L11_mauriceSpookyravenMortarTask,
    L11_mauriceSpookyravenBossTask,
    L11_mauriceSpookyravenOvenTask,
    L11_mauriceSpookyravenWineBombTask,
    L11_mauriceSpookyravenKitchenTask,
    L11_mauriceSpookyravenConservatoryTask,
    L11_mauriceSpookyravenBathroomTask,
    L11_mauriceSpookyravenGalleryTask,
    L11_mauriceSpookyravenLaboratoryTask,
    L11_mauriceSpookyravenStorageRoomTask,
    L11_mauriceSpookyravenAltPathwayFinishTask,
    L11_mauriceSpookyravenFulminateCraftTask,
    L11_mauriceSpookyravenWineCellarTask,
    L11_mauriceSpookyravenLaundryRoomTask,
    L11_mauriceSpookyravenBoilerRoomTask,
  ]);
}

export const L11_mauriceSpookyravenTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyraven",
  completed: () => internalQuestStatus("questL11Manor") > 3,
  ready: () =>
    internalQuestStatus("questL11Manor") >= 0 &&
    internalQuestStatus("questM21Dance") >= 4,
  do: L11_mauriceSpookyravenDo,
  desiredEncounters: () => {
    const status: number = internalQuestStatus("questL11Manor");
    if (status > 3) {
      return [];
    }
    if (status > 2) {
      return [{ monster: $monster`Lord Spookyraven`, needAmount: 1 }];
    }
    const wantExplosives = !possessEquipment($item`unstable fulminate`);
    return [
      {
        item: $item`bottle of Chateau de Vinegar`,
        needAmount:
          wantExplosives &&
          itemAmount($item`bottle of Chateau de Vinegar`) === 0
            ? 1
            : 0,
      },
      {
        item: $item`blasting soda`,
        needAmount:
          wantExplosives && itemAmount($item`blasting soda`) === 0 ? 1 : 0,
      },
    ];
  },
});

export function L11_mauriceSpookyraven(): boolean {
  return runQuestTask(L11_mauriceSpookyravenTask);
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
    return autoAdv($location`A Mob of Zeppelin Protesters`);
  }
  // TODO: create lynyrd skin items

  set("choiceAdventure856", 1);
  if (auto_haveCCSC()) {
    set("choiceAdventure857", 2);
  } else {
    set("choiceAdventure857", 1);
  }
  set("choiceAdventure858", 1);
  buffMaintain$2($effect`Greasy Peasy`);
  buffMaintain$2($effect`Musky`);
  buffMaintain$2($effect`Blood-Gorged`);
  if (!in_wotsf()) {
    pullXWhenHaveY($item`deck of lewd playing cards`, 1, 0);
  }

  if (itemAmount($item`Flamin' Whatshisname`) > 0) {
    backupSetting("choiceAdventure866", (3).toString());
  } else {
    backupSetting("choiceAdventure866", (2).toString());
  }

  maximizer
    .weight($modifier`Sleaze Damage`, 100)
    .weight($modifier`Sleaze Spell Damage`, 100);
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
    get("_lynyrdSnareUses") < 3 &&
    myHp() > 150
  ) {
    return autoAdvBypass$1(
      "inv_use.php?pwd=&whichitem=7204&checked=1",
      $location`A Mob of Zeppelin Protesters`,
    );
  }

  if (get("zeppelinProtestors") < 75 && cloversAvailable() > 0) {
    // "zeppelinProtestors" is number killed so far, so it ends when we hit 80
    if (cloversAvailable() >= 3) {
      if (!in_koe() || myDaycount() > 1) {
        // in koe, if d1 save bend hell for invader
        buffMaintain$2($effect`Bendin' Hell`, 0, 0, 1);
      }
      for (const ef of $effects`Dirty Pear, Fifty Ways to Bereave Your Lover`) {
        // double sleaze dmg, +100 sleaze dmg,
        let target_sleaze: number = 400;
        const current_sleaze: number =
          numericModifier($modifier`Sleaze Damage`) +
          numericModifier($modifier`Sleaze Spell Damage`);
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
      numericModifier($modifier`Sleaze Damage`) +
      numericModifier($modifier`Sleaze Spell Damage`);
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
          autoEquip(it);
        }
        set("choiceAdventure866", 1);
      } else if (best_protestors === sleaze_protestors) {
        set("choiceAdventure866", 2);
      } else if (best_protestors === fire_protestors) {
        set("choiceAdventure866", 3);
      }
      return autoLuckyAdv($location`A Mob of Zeppelin Protesters`);
    }
  }

  if (auto_waitForDay2()) {
    auto_log_debug("Delaying zeppelin protestors waiting for day 2 clovers.");
    return false;
  }

  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    auto_changeSnapperPhylum($phylum`dude`);
  }

  const lastProtest: number = get("zeppelinProtestors");
  if (
    canSniff(
      $monster`Blue Oyster cultist`,
      $location`A Mob of Zeppelin Protesters`,
    ) &&
    auto_mapTheMonsters()
  ) {
    auto_log_info(
      "Attemping to use Map the Monsters to olfact a Blue Oyster Cultist.",
    );
  }
  const retval: boolean = autoAdv($location`A Mob of Zeppelin Protesters`);
  if (!lastAdventureSpecialNC()) {
    if (lastProtest === get("zeppelinProtestors")) {
      set("zeppelinProtestors", get("zeppelinProtestors") + 1);
    }
  } else {
    set("lastEncounter", "Clear Special NC");
  }
  restoreSetting("choiceAdventure866");
  set("choiceAdventure856", 2);
  set("choiceAdventure857", 2);
  set("choiceAdventure858", 2);
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
    bat_formBats();
    if (
      canSniff($monster`red butler`, $location`The Red Zeppelin`) &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Red Butler.",
      );
    }
    if (auto_canCamelSpit()) {
      auto_log_info(
        "Bringing the Camel to spit on a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Melodramedary`);
    }
    if (auto_haveGreyGoose()) {
      auto_log_info(
        "Bringing the Grey Goose to emit some drones at a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (internalQuestStatus("questL11Ron") === 4) {
      set("auto_nextEncounter", 'Ron "The Weasel" Copperhead');
    }
    const retval: boolean = autoAdv($location`The Red Zeppelin`);
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

function L11_shenStartQuestDo(): boolean {
  // as the first adventure in the Copperhead Club is always the first Shen NC
  // we can adventure there once as soon as it's open to start the quest and lock in
  // our zones
  auto_log_info(
    "Going to see the World's Biggest Jerk about some snakes and stones and stuff.",
    "blue",
  );
  if (autoAdv($location`The Copperhead Club`)) {
    if (internalQuestStatus("questL11Shen") === 1) {
      auto_log_info("It seems Shen has given us a quest.", "blue");
      auto_log_info(
        "I am going to avoid the following zones until Shen tells me to go there or until I run out of other things to do:",
      );
      let linec: number = 1;
      for (const z of shenZonesToAvoidBecauseMaybeSnake()) {
        auto_log_info(`${linec++}. ${z}`);
        set(
          "auto_shenZonesTurnsSpent",
          `${getProperty("auto_shenZonesTurnsSpent")}${z}:${z.turnsSpent};`,
        );
      }
      set("auto_lastShenTurn", $location`The Copperhead Club`.turnsSpent);
    }
    return true;
  }
  return false;
}

export const L11_shenStartQuestTask: QuestTask = registerQuestTask({
  name: "L11_shenStartQuest",
  completed: () => internalQuestStatus("questL11Shen") > 0,
  ready: () =>
    internalQuestStatus("questL11Shen") === 0 &&
    (!in_wereprof() || is_werewolf()),
  do: L11_shenStartQuestDo,
  locations: $location`The Copperhead Club`,
  desiredEncounters: () => [
    {
      item: $item`crappy waiter disguise`,
      needAmount: !in_tcrs()
        ? // terrible check
          5 - itemAmount($item`crappy waiter disguise`)
        : 0,
    },
  ],
});

function L11_shenWaiterNC():
  "lantern" | "cocktails" | "ice bucket" | "diamond" {
  // default to getting unnamed cocktails to turn into Flamin' Whatsisnames.
  if (
    itemAmount($item`priceless diamond`) > 0 ||
    itemAmount($item`Red Zeppelin ticket`) > 0 ||
    myMeat() > 10000 ||
    (internalQuestStatus("questL11Shen") === 6 &&
      itemAmount($item`unnamed cocktail`) > 0)
  ) {
    if (getProperty("copperheadClubHazard") !== "lantern") {
      // got priceless diamond or zeppelin ticket (or we are rich) so lets burn the place down (and make Flamin' Whatsisnames)
      return "lantern";
    }
  } else if (
    haveEquipped($item`candy cane sword cane`) &&
    itemAmount($item`priceless diamond`) === 0 &&
    itemAmount($item`Red Zeppelin ticket`) === 0
  ) {
    return "diamond";
  } else {
    if (getProperty("copperheadClubHazard") !== "ice") {
      // knock over the ice bucket & try for the priceless diamond.
      return "ice bucket";
    }
  }

  return "cocktails";
}

export function L11_shenStartQuest(): boolean {
  return runQuestTask(L11_shenStartQuestTask);
}

function L11_shenCopperheadDo(): boolean {
  if (L11_shenStartQuest()) {
    return true;
  }

  if (internalQuestStatus("questL11Shen") < 1) {
    // if we haven't spoke to Shen for the first time yet, don't try to handle the quest.
    return false;
  }

  if (isBanished($phylum`dude`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "dude");
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
      const behindtheStacheOption =
        ["gong", "ice bucket", "lantern", "cocktails", "diamond"].indexOf(
          L11_shenWaiterNC(),
        ) + 1;
      set("choiceAdventure855", behindtheStacheOption);
    }

    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      auto_changeSnapperPhylum($phylum`dude`);
    }
    // monster level increases zone damage
    maximizer.weight($modifier`Monster Level`, -10);
    uneffect($effect`Ur-Kel's Aria of Annoyance`);
    if (autoAdv($location`The Copperhead Club`)) {
      if (containsText(getProperty("lastEncounter"), "Shen Copperhead, ")) {
        set("auto_lastShenTurn", $location`The Copperhead Club`.turnsSpent);
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
    let it: Item = safeGet("shenQuestItem", Item.none);
    if (it === Item.none && isActuallyEd()) {
      // temp workaround until mafia bug is fixed - https://kolmafia.us/showthread.php?23742
      cliExecute("refresh quests");
      it = safeGet("shenQuestItem", Item.none);
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

    if (!zone_isAvailable(goal)) {
      // handle paths which don't need Tower keys but the World's Biggest Jerk asks for The Eye of the Stars
      if (goal === $location`The Hole in the Sky`) {
        if (!get("auto_holeinthesky", false)) {
          set("auto_holeinthesky", true);
        }
        return runTaskChain([L10_topFloorTask, L10_holeInTheSkyUnlockTask]);
      }
      return false;
    } else {
      // If we haven't completed the top floor, try to complete it.
      if (
        goal === $location`The Castle in the Clouds in the Sky (Top Floor)` &&
        runTaskChain([L10_topFloorTask, L10_holeInTheSkyUnlockTask])
      ) {
        return true;
      } else if (
        goal === $location`The Smut Orc Logging Camp` &&
        (L9_ed_chasmStart() || L9_chasmBuild())
      ) {
        return true;
      } else if (auto_wantToSpadeDigSkeleton(goal)) {
        return auto_spadeDigSkeleton(goal);
      }
      // similar if statements exist in the L8 quest file (see comments over there)
      // before delayburn because we *want* to fight NSAs if we're going ninja lair, not avoid them by burning delay
      if (goal === $location`Lair of the Ninja Snowmen`) {
        if (auto_canForceNextCombat() || auto_haveQueuedForcedCombat()) {
          if (L8_trapperNinjaLair()) {
            return true;
          }
        }
        if (
          toInt(internalQuestStatus("questL08Trapper")) === 2 &&
          auto_haveCombatForceSource() &&
          !isAboutToPowerlevel() &&
          !get("auto_L8_extremeInstead", false)
        ) {
          return false;
        }
      }
      if (canBurnDelay(goal)) {
        // Snakes have variable delay of 3-5 adventures but we can burn at least 3 of that.
        return false;
      }

      return autoAdv(goal);
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

export const L11_shenCopperheadTask: QuestTask = registerQuestTask({
  name: "L11_shenCopperhead",
  completed: () => internalQuestStatus("questL11Shen") > 7,
  ready: () => internalQuestStatus("questL11Shen") >= 0 && !is_professor(),
  do: L11_shenCopperheadDo,
  desiredEncounters: () => {
    const it: Item = safeGet("shenQuestItem", Item.none);
    return [
      {
        item: it,
        needAmount: it !== Item.none && itemAmount(it) === 0 ? 1 : 0,
      },
    ];
  },
});

export function L11_shenCopperhead(): boolean {
  return runQuestTask(L11_shenCopperheadTask);
}

const L11_redZeppelinTask: QuestTask = registerQuestTask({
  name: "L11_redZeppelin",
  completed: () => internalQuestStatus("questL11Ron") > 1,
  ready: () => true,
  do: L11_redZeppelin,
  locations: $location`A Mob of Zeppelin Protesters`,
  desiredEncounters: () => [
    {
      item: $item`cigarette lighter`,
      needAmount: auto_is_valid($item`cigarette lighter`)
        ? itemAmount($item`cigarette lighter`) -
          Math.round((80 - get("zeppelinProtestors")) / 3)
        : 0,
    },
    {
      item: $item`lynyrd snare`,
      needAmount: auto_is_valid($item`lynyrd snare`)
        ? 3 - get("_lynyrdSnareUses") - itemAmount($item`lynyrd snare`)
        : 0,
    },
  ],
});
const L11_ronCopperheadTask: QuestTask = registerQuestTask({
  name: "L11_ronCopperhead",
  completed: () => internalQuestStatus("questL11Ron") > 4,
  ready: () => true,
  do: L11_ronCopperhead,
  locations: $location`The Red Zeppelin`,
  desiredEncounters: () => [
    {
      monster: $monster`Ron "The Weasel" Copperhead`,
      needAmount: internalQuestStatus("questL11Ron") > 4 ? 0 : 1,
    },
    {
      item: $item`glark cable`,
      needAmount: auto_is_valid($item`glark cable`)
        ? 5 - (get("_glarkCableUses") + itemAmount($item`glark cable`))
        : 0,
    },
  ],
});

function L11_talismanOfNamDo(): boolean {
  if (
    runTaskChain([
      L11_shenCopperheadTask,
      L11_redZeppelinTask,
      L11_ronCopperheadTask,
    ])
  ) {
    return true;
  }
  if (creatableAmount($item`Talisman o' Namsilat`) > 0) {
    if (create(1, $item`Talisman o' Namsilat`)) {
      return true;
    }
  }

  return false;
}

export const L11_talismanOfNamTask: QuestTask = registerQuestTask({
  name: "L11_talismanOfNam",
  completed: () => itemAmount($item`Talisman o' Namsilat`) > 0,
  ready: () => true,
  do: L11_talismanOfNamDo,
});

export function L11_talismanOfNam(): boolean {
  return runQuestTask(L11_talismanOfNamTask);
}

function L11_palindomeDo(): boolean {
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
    auto_log_info("Not enough meat for the Palindome");
    return false;
  }

  let total: number = 0;
  total = total + itemAmount($item`photograph of a red nugget`);
  total = total + itemAmount($item`photograph of an ostrich egg`);
  total = total + itemAmount($item`photograph of God`);
  total = total + itemAmount($item`photograph of a dog`);

  if (isBanished($phylum`dude`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "dude");
    return false; //If new phylum banishers come out, this should be updated.
  }

  let lovemeDone: boolean =
    hasILoveMeVolI() || internalQuestStatus("questL11Palindome") >= 1;
  if (!lovemeDone && get("palindomeDudesDefeated", 0) >= 5) {
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
    set("auto_doWhiteys", true);
    if (itemAmount($item`white page`) > 0) {
      set("choiceAdventure940", 1);
      if (itemAmount($item`bird rib`) > 0) {
        set("choiceAdventure940", 2);
      }

      if (get("lastGuildStoreOpen") < myAscensions()) {
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
      if (autoAdvBypass(0, pages, $location`Whitey's Grove`)) {
      }
      restoreSetting("lastGuildStoreOpen");
      return true;
    }
    //Can't do Whitey's Grove if beasts are banished
    if (isBanished($phylum`beast`) && get("screechCombats") > 0) {
      set("_auto_screechDelay", "beast");
      return false; //If new phylum banishers come out, this should be updated.
    }
    providePlusCombat(15, $location`Whitey's Grove`, false);
    // +item is nice to get that food
    bat_formBats();
    auto_lostStomach(true);
    auto_log_info("Off to the grove for some doofy food!", "blue");
    return autoAdv($location`Whitey's Grove`);
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
    (inHardcore() || get("auto_doWhiteys", false)) &&
    itemAmount($item`wet stunt nut stew`) === 0 &&
    (internalQuestStatus("questL11Palindome") >= 3 || isGuildClass()) &&
    !get("auto_bruteForcePalindome", false)
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
        autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
        return autoAdv($location`Inside the Palindome`);
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
        set("_auto_forcePokefamRestore", true);
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
    autoEquipToSlot($slot`acc2`, $item`Mega Gem`);
    autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
    const palinChoice: number = random(3) + 1;
    set("choiceAdventure131", palinChoice);

    auto_log_info("War sir is raw!!", "blue");

    const pages: Map<number, string> = new Map();
    pages.set(0, "place.php?whichplace=palindome&action=pal_drlabel");
    pages.set(1, `choice.php?pwd&whichchoice=131&option=${palinChoice}`);
    set("auto_nextEncounter", "Dr. Awkward");
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    }
    autoAdvBypass(0, pages, $location`Noob Cave`);
    return true;
  } else {
    if (pullsRemaining() === 0) {
      // used our pulls today before getting to palindrome. Delay until next day or run out of other stuff to do
      if (!isAboutToPowerlevel() && !inHardcore()) {
        auto_log_debug("Delaying palindrome.");
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
      if (!get("auto_bruteForcePalindome", false)) {
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

    autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
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
            numericModifier($modifier`Food Drop`) -
            auto_famModifiers$2("Item Drop"),
        );
        if (stuntNutDropModifierWithoutFamiliar < 234) {
          //30% base drop chance
          noseDudesOn = false;
        }
      }
      if (noseDudesOn) {
        const whiffedBob: boolean =
          safeGet("nosyNoseMonster", Monster.none) === $monster`Racecar Bob` ||
          safeGet("nosyNoseMonster", Monster.none) === $monster`Bob Racecar`;
        if (
          isBanished($monster`Flock of Stab-bats`) &&
          isBanished($monster`Taco Cat`) &&
          isBanished($monster`Tan Gnat`) &&
          isBanished($monster`Evil Olive`)
        ) {
          //only dudes left already
          noseDudesOn = false;
        } else if (get("palindomeDudesDefeated") >= dudesToDown) {
          if (dudesToDown >= 10 && whiffedBob) {
            //when looking for photograph of a dog without disposable instant camera
            //the 10th or later dude must be a Bob, keep using the nose if it's tracking Bob
            noseDudesOn = true;
          } else {
            //had enough dudes
            noseDudesOn = false;
          }
        } else if (get("palindomeDudesDefeated") === dudesToDown - 1) {
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
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Bob Racecar.",
      );
    }
    const advSpent: boolean = autoAdv($location`Inside the Palindome`);
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

export const L11_palindomeTask: QuestTask = registerQuestTask({
  name: "L11_palindome",
  completed: () => internalQuestStatus("questL11Palindome") > 5,
  ready: () => internalQuestStatus("questL11Palindome") >= 0,
  do: L11_palindomeDo,
  locations: $locations`Whitey's Grove, Inside the Palindome`,
  desiredEncounters: () => {
    if (internalQuestStatus("questL11Palindome") > 5) {
      return [];
    }
    const desired: (DesiredDrop | DesiredFights)[] = [];
    const total: number =
      itemAmount($item`photograph of a red nugget`) +
      itemAmount($item`photograph of an ostrich egg`) +
      itemAmount($item`photograph of God`) +
      itemAmount($item`photograph of a dog`);
    if (total < 4 && !possessEquipment($item`Mega Gem`)) {
      desired.push({
        monster: $phylum`dude`,
        needAmount: 5 - get("palindomeDudesDefeated"),
      });
    }

    if (
      itemAmount($item`stunt nuts`) === 0 &&
      itemAmount($item`wet stunt nut stew`) === 0
    ) {
      desired.push({ item: $item`stunt nuts`, needAmount: 1 });
    }

    if (
      (itemAmount($item`lion oil`) === 0 ||
        itemAmount($item`bird rib`) === 0) &&
      itemAmount($item`wet stew`) === 0 &&
      itemAmount($item`wet stunt nut stew`) === 0 &&
      internalQuestStatus("questL11Palindome") < 5
    ) {
      desired.push(
        ...$items`lion oil, bird rib`
          .filter((it) => itemAmount(it) === 0)
          .map((it) => ({ item: it, needAmount: 1 })),
      );
    }

    return desired;
  },
});

export function L11_palindome(): boolean {
  return runQuestTask(L11_palindomeTask);
}

function L11_unlockPyramidDo(): boolean {
  visitUrl("place.php?whichplace=desertbeach");
  if (
    internalQuestStatus("questL11Desert") < 1 ||
    get("desertExploration") < 100 ||
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

    const initial: number = get("desertExploration");
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
        set("desertExploration", found);
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

export const L11_unlockPyramidTask: QuestTask = registerQuestTask({
  name: "L11_unlockPyramid",
  completed: () => internalQuestStatus("questL11Pyramid") > -1,
  ready: () => true,
  do: L11_unlockPyramidDo,
});

export function L11_unlockPyramid(): boolean {
  return runQuestTask(L11_unlockPyramidTask);
}

function L11_unlockUpperChamberDo(): boolean {
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
    set("auto_forceTavern", true);
    if (L3_tavern()) {
      return true;
    }
  }

  return autoAdv($location`The Upper Chamber`);
}

export const L11_unlockUpperChamberTask: QuestTask = registerQuestTask({
  name: "L11_unlockUpperChamber",
  completed: () => get("middleChamberUnlock"),
  ready: () => internalQuestStatus("questL11Pyramid") >= 0,
  do: L11_unlockUpperChamberDo,
  locations: $location`The Upper Chamber`,
});

export function L11_unlockUpperChamber(): boolean {
  return runQuestTask(L11_unlockUpperChamberTask);
}

function L11_unlockMiddleChamberDo(): boolean {
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
    set("auto_forceTavern", true);
    if (L3_tavern()) {
      return true;
    }
  }

  auto_log_info(
    `In the pyramid (W:${itemAmount($item`crumbling wooden wheel`)}) (R:${itemAmount($item`tomb ratchet`)}) (U:${getProperty("controlRoomUnlock")})`,
    "blue",
  );

  let total: number = itemAmount($item`crumbling wooden wheel`);
  total = total + itemAmount($item`tomb ratchet`);

  if (total >= 10 && myAdventures() >= 4 && get("controlRoomUnlock")) {
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

  if (get("controlRoomUnlock")) {
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
      return autoAdv($location`The Upper Chamber`);
    }
  }

  if (
    canSniff($monster`tomb rat`, $location`The Middle Chamber`) &&
    auto_mapTheMonsters()
  ) {
    auto_log_info("Attemping to use Map the Monsters to olfact a Tomb Rat.");
  }

  if (auto_haveGreyGoose() && itemAmount($item`tangle of rat tails`) >= 1) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at some rat kings.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  if (
    auto_can_equip($item`pro skateboard`) &&
    equipmentAmount($item`pro skateboard`) > 0 &&
    itemAmount($item`tangle of rat tails`) >= 1 &&
    !get("_epicMcTwistUsed") &&
    !in_pokefam()
  ) {
    auto_log_info("Be like Tony Hawk on a Tomb Rat King!");
    autoEquip($item`pro skateboard`);
  }

  return autoAdv($location`The Middle Chamber`);
}

export const L11_unlockMiddleChamberTask: QuestTask = registerQuestTask({
  name: "L11_unlockMiddleChamber",
  completed: () =>
    internalQuestStatus("questL11Pyramid") > 3 || get("pyramidBombUsed"),
  ready: () =>
    internalQuestStatus("questL11Pyramid") >= 0 && get("middleChamberUnlock"),
  do: L11_unlockMiddleChamberDo,
  locations: $locations`The Upper Chamber, The Middle Chamber`,
  desiredEncounters: () => {
    const remaining: number =
      10 -
      (itemAmount($item`crumbling wooden wheel`) +
        itemAmount($item`tomb ratchet`));
    return [
      { item: $item`crumbling wooden wheel`, needAmount: remaining },
      { item: $item`tomb ratchet`, needAmount: remaining },
    ];
  },
});

export function L11_unlockMiddleChamber(): boolean {
  return runQuestTask(L11_unlockMiddleChamberTask);
}

export const L11_unlockEdTask: QuestTask = registerQuestTask({
  name: "L11_unlockEd",
  completed: () =>
    get("middleChamberUnlock") &&
    (internalQuestStatus("questL11Pyramid") > 3 || get("pyramidBombUsed")),
  ready: () => true,
  do: () =>
    runTaskChain([L11_unlockUpperChamberTask, L11_unlockMiddleChamberTask]),
});

export function L11_unlockEd(): boolean {
  return runQuestTask(L11_unlockEdTask);
}

function L11_edDefeated(): boolean {
  return (
    itemAmount($item`[2334]Holy MacGuffin`) > 0 ||
    getProperty("questL11Pyramid") === "finished"
  );
}

function L11_edZones(): Location[] {
  return [
    L11_unlockUpperChamberTask,
    L11_unlockMiddleChamberTask,
    L11_defeatEdTask,
  ].flatMap(taskLocations);
}

const L11_edTurnInTask: QuestTask = registerQuestTask({
  name: "L11_edTurnIn",
  completed: () => get("auto_L11CouncilVisited", false),
  ready: () => {
    if (get("auto_L11CouncilVisited", false) || !L11_edDefeated()) {
      return false;
    }
    if (auto_copierShouldDelayZone(L11_edZones())) {
      auto_log_debug(
        "Delaying L11 turn-in - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: () => {
    council();
    set("auto_L11CouncilVisited", true);
    return true;
  },
});

function L11_defeatEdDo(): boolean {
  if (L11_edDefeated()) {
    return runQuestTask(L11_edTurnInTask);
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
      autoEquip($item`beer helmet`);
    }
  }
  if (in_koe()) {
    retrieveItem(1, $item`low-pressure oxygen tank`);
    autoForceEquip$3($item`low-pressure oxygen tank`);
  }

  plumber_equipTool($stat`Moxie`);

  auto_log_info("Time to waste all of Ed's Ka Coins :(", "blue");

  set("auto_nextEncounter", "Ed the Undying");
  set("auto_nonAdvLoc", true);
  autoAdv($location`The Lower Chambers`);
  if (in_pokefam() || in_koe()) {
    cliExecute("refresh inv");
  }

  if (L11_edDefeated()) {
    return runQuestTask(L11_edTurnInTask);
  }
  return true;
}

export const L11_defeatEdTask: QuestTask = registerQuestTask({
  name: "L11_defeatEd",
  completed: () => get("auto_L11CouncilVisited", false),
  ready: () => {
    if (get("auto_L11CouncilVisited", false)) {
      return false;
    }
    if (L11_edDefeated()) {
      return true;
    }
    return (
      internalQuestStatus("questL11Pyramid") === 3 &&
      get("pyramidBombUsed") &&
      myAdventures() - auto_advToReserve() > 7
    );
  },
  do: L11_defeatEdDo,
  locations: $location`The Lower Chambers`,
  desiredEncounters: () => [
    {
      monster: $monster`Ed the Undying`,
      needAmount: 1 - itemAmount($item`[2334]Holy MacGuffin`),
    },
  ],
  reqAdventures: () =>
    internalQuestStatus("questL11Pyramid") === 3 && get("pyramidBombUsed")
      ? 7
      : 0,
});

export function L11_defeatEd(): boolean {
  return runQuestTask(L11_defeatEdTask);
}

export function L11_needDrumMachine(): boolean {
  return (
    (get("gnasirProgress") & 16) === 0 &&
    auto_is_valid($item`drum machine`) &&
    !itemAmount($item`drum machine`) &&
    getProperty("questL11Desert") !== "finished"
  );
}

export function L11_needWetStew(): boolean {
  return (
    (itemAmount($item`lion oil`) === 0 || itemAmount($item`bird rib`) === 0) &&
    itemAmount($item`wet stew`) === 0 &&
    itemAmount($item`wet stunt nut stew`) === 0 &&
    !isActuallyEd() &&
    internalQuestStatus("questL11Palindome") < 5
  );
}

export function L11_needTombRatchet(): boolean {
  return (
    itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      10 && !get("pyramidBombUsed")
  );
}
