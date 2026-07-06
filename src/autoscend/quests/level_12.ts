import {
  abort,
  availableAmount,
  ceil,
  cliExecute,
  closetAmount,
  containsText,
  council,
  create,
  equip,
  equippedAmount,
  Familiar,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
  inebrietyLimit,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  itemDropModifier,
  lastMonster,
  Location,
  max,
  meatDropModifier,
  min,
  Monster,
  monsterLevelAdjustment,
  mpCost,
  myAdventures,
  myAscensions,
  myBuffedstat,
  myDaycount,
  myInebriety,
  myLevel,
  myMeat,
  myMp,
  npcPrice,
  outfit,
  sell,
  setProperty,
  takeCloset,
  toBoolean,
  toFamiliar,
  toFloat,
  toInt,
  toMonster,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
} from "libram";

import { resetState } from "../../autoscend";
import {
  acquireHermitItem,
  acquireOrPull,
  auto_buyUpTo,
  canPull$1,
  pullXWhenHaveY,
  pulverizeThing,
} from "../auto_acquire";
import {
  autoAdv,
  autoAdv$1,
  autoAdv$2,
  autoAdvBypass,
  autoLuckyAdv$1,
} from "../auto_adventure";
import { buffMaintain$3 } from "../auto_buff";
import {
  autoChew,
  autoEat,
  canChew,
  canEat$1,
  spleen_left,
  stomach_left,
} from "../auto_consume";
import {
  addToMaximize,
  autoEquip,
  autoForceEquip$3,
  autoOutfit,
  equipMaximizedGear,
  possessEquipment,
  possessOutfit,
  possessOutfit$1,
  simMaximizeWith,
  simValue,
} from "../auto_equipment";
import {
  auto_have_familiar,
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
  isAttackFamiliar,
  lookupFamiliarDatafile,
} from "../auto_familiar";
import {
  highestScalingZone,
  isAboutToPowerlevel,
  LX_freeCombats$1,
} from "../auto_powerlevel";
import {
  provideItem$2,
  provideMeat$1,
  providePlusCombat,
} from "../auto_providers";
import { acquireHP, doRest, uneffect } from "../auto_restore";
import {
  adjustForReplaceIfPossible$1,
  auto_combatModCap,
  auto_forceNextCombat$1,
  auto_forceNextNoncombat$1,
  auto_get_campground,
  auto_have_skill,
  auto_haveQueuedForcedCombat,
  auto_is_valid,
  auto_is_valid$3,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_totalEffectWishesAvailable,
  canSummonMonster,
  canYellowRay,
  canYellowRay$1,
  cloversAvailable$1,
  handleTracker$1,
  internalQuestStatus,
  remainingNCForcesToday,
  summonMonster,
  wrap_item,
} from "../auto_util";
import { zone_isAvailable$1 } from "../auto_zone";
import { WarPlan } from "../autoscend_record";
import { auto_JunkyardCombatHandler } from "../combat/auto_combat_quest";
import { zataraAvailable } from "../iotms/clan";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import {
  chateaumantegna_havePainting,
  chateaumantegna_usePainting,
} from "../iotms/mr2015";
import { auto_sourceTerminalEducate, timeSpinnerCombat } from "../iotms/mr2016";
import {
  auto_haveVotingBooth,
  auto_voteMonster,
  auto_voteMonster$1,
  auto_voteMonster$2,
  januaryToteTurnsLeft,
  neverendingPartyCombat,
  songboomSetting,
} from "../iotms/mr2018";
import { auto_sausageGoblin, auto_sausageGoblin$2 } from "../iotms/mr2019";
import { auto_cargoShortsOpenPocket } from "../iotms/mr2020";
import {
  auto_backupTarget,
  auto_fireExtinguisherCharges,
} from "../iotms/mr2021";
import { auto_hasAutumnaton, auto_haveGreyGoose } from "../iotms/mr2022";
import {
  auto_doPhoneQuest,
  auto_dousesRemaining,
  auto_getCitizenZone$1,
  auto_haveAugustScepter,
  auto_haveCCSC,
  auto_havePayPhone,
} from "../iotms/mr2023";
import { auto_swoopsRemaining } from "../iotms/mr2024";
import { auto_havePeridot, haveUsedPeridot$1 } from "../iotms/mr2025";
import {
  auto_haveArchaeologistSpade,
  auto_spadeDigsRemaining,
} from "../iotms/mr2026";
import {
  ed_DelayNC$1,
  edAcquireHP,
  isActuallyEd,
} from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_avantGuard } from "../paths/avant_guard";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { in_bhy } from "../paths/bees_hate_you";
import { inAftercore } from "../paths/casual";
import {
  bat_formMist$1,
  bat_wantHowl,
  in_darkGyffte,
} from "../paths/dark_gyffte";
import { in_disguises } from "../paths/disguises_delimit";
import { in_glover } from "../paths/g_lover";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_iluh } from "../paths/i_love_u_hate";
import {
  in_koe,
  L12_koe_clearBattlefield,
  L12_koe_finalizeWar,
} from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lar } from "../paths/live_ascend_repeat";
import {
  in_pokefam,
  L12_pokefam_clearBattlefield,
} from "../paths/pocket_familiars";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { in_wereprof, is_professor, is_werewolf } from "../paths/wereprofessor";
import { wildfire_warboss_check } from "../paths/wildfire";
import { robot_delay } from "../paths/you_robot";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { LX_islandAccess } from "./level_any";

let $_static_0 = false;

//###########################################
/*
Below are relevant locations for the war.
war not started or finished with this side undefeated:
[Frat House]
[The Orcish Frat House (In Disguise)]	//r26631 changed from [Frat House In Disguise]
[Hippy Camp]
[The Hippy Camp (In Disguise)]	//r26631 changed from [Hippy Camp In Disguise]
War started:
[Wartime Frat House]
[Wartime Frat House (Hippy Disguise)]
[Wartime Hippy Camp]
[Wartime Hippy Camp (Frat Disguise)]
War finished & side defeated:
[The Orcish Frat House (Bombed Back to the Stone Age)]
[The Hippy Camp (Bombed Back to the Stone Age)]
*/
//###########################################

//Defined in autoscend/quests/level_12.ash
function copy_warplan(target: WarPlan, source: WarPlan): void {
  //record A = B; does not copy the contents of B into record A, it instead copies memory references. Thus A merely becomes an alias for B and changing one changes the other as well.
  //this function serves to copy the data from B to into A
  //designed to be used with target.copy_warplan(source)

  target.doArena = source.doArena;
  target.doJunkyard = source.doJunkyard;
  target.doLighthouse = source.doLighthouse;
  target.doOrchard = source.doOrchard;
  target.doNuns = source.doNuns;
  target.doFarm = source.doFarm;
}

export function auto_warSide(): string {
  //returns the side you are fighting for in the form of a string.
  //this is used to check checking mafia's sidequest tracking, as they use these string values to indicate which side completed which quest.
  if (toBoolean(getProperty("auto_hippyInstead"))) {
    return "hippy";
  } else {
    return "fratboy";
  }
}

function auto_warSideQuestsDone(): number {
  //counts how many sidequests you have completed for the side for which you are fighting in the war.

  let sidequests_done: number = 0;

  if (getProperty("sidequestArenaCompleted") === auto_warSide()) {
    sidequests_done++;
  }
  if (getProperty("sidequestJunkyardCompleted") === auto_warSide()) {
    sidequests_done++;
  }
  if (getProperty("sidequestLighthouseCompleted") === auto_warSide()) {
    sidequests_done++;
  }
  if (getProperty("sidequestOrchardCompleted") === auto_warSide()) {
    sidequests_done++;
  }
  if (getProperty("sidequestNunsCompleted") === auto_warSide()) {
    sidequests_done++;
  }
  if (getProperty("sidequestFarmCompleted") === auto_warSide()) {
    sidequests_done++;
  }

  return sidequests_done;
}

function auto_warSideQuestsState(): WarPlan {
  // Returns a record indicating current completion state of the war sidequests.

  const ret: WarPlan = new WarPlan();
  ret.doArena = getProperty("sidequestArenaCompleted") === auto_warSide();
  ret.doJunkyard = getProperty("sidequestJunkyardCompleted") === auto_warSide();
  ret.doLighthouse =
    getProperty("sidequestLighthouseCompleted") === auto_warSide();
  ret.doOrchard = getProperty("sidequestOrchardCompleted") === auto_warSide();
  ret.doNuns = getProperty("sidequestNunsCompleted") === auto_warSide();
  ret.doFarm = getProperty("sidequestFarmCompleted") === auto_warSide();
  return ret;
}

export function auto_warEnemiesRemaining(): number {
  // Returns the number of enemies left to defeat in the fratboy-hippy war.

  let enemiesRemaining: number = 1000;
  if (auto_warSide() === "hippy") {
    enemiesRemaining = 1000 - toInt(getProperty("fratboysDefeated"));
  } else {
    enemiesRemaining = 1000 - toInt(getProperty("hippiesDefeated"));
  }
  return enemiesRemaining;
}

export function auto_warKillsPerBattle(): number {
  // returns how many enemies you will kill per battle at hippy-fratboy war at your current number of sidequests done.
  return auto_warKillsPerBattle$1(auto_warSideQuestsDone());
}

function auto_warKillsPerBattle$1(sidequests: number): number {
  // returns how many enemies you will kill per battle at hippy-fratboy war at a specified number of sidequests done.

  let kills: number = 2 ** sidequests;
  // Avatar of Sneaky Pete has a motorbike mod that gives +3 kills/battle.
  if (getProperty("peteMotorbikeCowling") === "Rocket Launcher") {
    kills += 3;
  }
  //License to Adventure Path specific check
  //TODO add it. it deals +3 kills per battle

  return kills;
}

let $_auto_estimatedAdventuresForChaosButterfly_expectedItemDropMulti:
  number | undefined;

function auto_estimatedAdventuresForChaosButterfly(): number {
  // Returns an ESTIMATE of how many adventures it will take to acquire a chaos butterfly.

  if (
    toBoolean(getProperty("chaosButterflyThrown")) ||
    itemAmount($item`chaos butterfly`) > 0
  ) {
    return 0;
  }
  if (canPull$1($item`chaos butterfly`)) {
    return 0;
  }
  // 4 enemies in [The Castle in the Clouds in the Sky (Ground Floor)] ~25% chance to encounter the one we want.
  // roughly estimate 4 turns per possibility giant encounter. at base drop this means ~20 adv needed.
  const expected_turns_until_fight: number = 4;
  if (canYellowRay$1()) {
    return expected_turns_until_fight;
  }
  // This function is called frequently (especially by auto_bestWarPlan), so
  // to avoid adding a maximizer call to every single adventure at the war
  // sidequests, estimate this value the first time this function is called
  // during each execution of the script.

  $_auto_estimatedAdventuresForChaosButterfly_expectedItemDropMulti ??= 0;
  if (!$_static_0) {
    auto_log_info(
      "Estimating adventures needed to obtain chaos butterfly.",
      "green",
    );
    handleFamiliar("item");
    simMaximizeWith(
      $location`The Castle in the Clouds in the Sky (Ground Floor)`,
      "20 item",
    );
    $_auto_estimatedAdventuresForChaosButterfly_expectedItemDropMulti =
      1 + simValue("Item Drop") / 100;
    $_static_0 = true;
  }

  const butterfly_drop_rate: number = 0.2;
  const expected_fights_until_drop: number = max(
    1.0,
    1.0 /
      ($_auto_estimatedAdventuresForChaosButterfly_expectedItemDropMulti *
        butterfly_drop_rate),
  );

  const ret: number = ceil(
    expected_turns_until_fight * expected_fights_until_drop,
  );
  auto_log_info(
    `I estimate it will take ${ret} fights for a chaos butterfly to drop.`,
    "green",
  );
  return ret;
}

function auto_estimatedAdventuresForDooks(): number {
  let advCost_1: number = 40;
  //TODO account for having done free fights in those zones
  advCost_1 -= $location`McMillicancuddy's Barn`.turnsSpent;
  advCost_1 -= $location`McMillicancuddy's Pond`.turnsSpent;
  advCost_1 -= $location`McMillicancuddy's Back 40`.turnsSpent;
  advCost_1 -= $location`McMillicancuddy's Other Back 40`.turnsSpent;
  //these paths cannot use butterfly
  if (in_bhy() || in_pokefam() || in_glover()) {
    return advCost_1;
  }
  //chaos butterfly calculations
  const advToGetCB: number = auto_estimatedAdventuresForChaosButterfly();
  if (
    toBoolean(getProperty("chaosButterflyThrown")) ||
    itemAmount($item`chaos butterfly`) > 0
  ) {
    advCost_1 -= 15;
  } else if (advToGetCB < 15) {
    advCost_1 = advCost_1 - 15 + advToGetCB;
  }

  return advCost_1;
}

function bitmask_from_warplan(plan: WarPlan): number {
  let bitmask: number = 0;
  if (auto_warSide() === "fratboy") {
    bitmask |= toInt(plan.doArena) << 0;
    bitmask |= toInt(plan.doJunkyard) << 1;
    bitmask |= toInt(plan.doLighthouse) << 2;
    bitmask |= toInt(plan.doOrchard) << 3;
    bitmask |= toInt(plan.doNuns) << 4;
    bitmask |= toInt(plan.doFarm) << 5;
  } else {
    bitmask |= toInt(plan.doArena) << 5;
    bitmask |= toInt(plan.doJunkyard) << 4;
    bitmask |= toInt(plan.doLighthouse) << 3;
    bitmask |= toInt(plan.doOrchard) << 2;
    bitmask |= toInt(plan.doNuns) << 1;
    bitmask |= toInt(plan.doFarm) << 0;
  }
  return bitmask;
}

export function auto_bestWarPlan(): WarPlan {
  if (in_koe()) {
    const do_nothing: WarPlan = new WarPlan();
    return do_nothing;
  }
  //if a sidequest is done already then consider it as planned.
  const retval: WarPlan = auto_warSideQuestsState();
  //Path specific blocks where a sidequest is not possible or really bad.
  let considerArena: boolean = true;
  let considerJunkyard: boolean = true;
  const considerLighthouse: boolean = true;
  let considerOrchard: boolean = true;
  let considerNuns: boolean = true;
  const considerFarm: boolean = true;

  if (in_bhy() || in_pokefam()) {
    considerArena = false;
    considerJunkyard = false;
  }
  if (in_wotsf()) {
    considerNuns = false;
  }
  if (in_tcrs()) {
    considerNuns = false;
    considerOrchard = false;
  }
  if (in_glover()) {
    considerArena = false;
  }
  if (auto_warSide() === "hippy") {
    //arena not implemented for hippies yet. TODO implement it then remove this
    considerArena = false;
  }
  if (toBoolean(getProperty("auto_skipNuns"))) {
    considerNuns = false;
  }
  if (toBoolean(getProperty("auto_ignoreFlyer"))) {
    considerArena = false;
  }
  // Calculate the adventure cost of doing each sidequest.
  const advCostArena: number = 0; //Arena actual cost is 0 adventures... unless you mess it up. TODO: check if messed up.
  const advCostJunkyard: number = 10; //placeholder estimate. TODO actual math
  const advCostLighthouse: number = 10; //placeholder estimate. TODO actual math
  const advCostOrchard: number = 10; //placeholder estimate. TODO actual math
  const advCostNuns: number = 20; //placeholder estimate. TODO actual math
  const advCostFarm: number = auto_estimatedAdventuresForDooks();
  // Start with the sidequests already completed.
  // Greedily add the sidequest that saves the most adventures, breaking
  // early if no sidequest saves any adventures.
  const prospective_plan: WarPlan = new WarPlan();
  const test: WarPlan = new WarPlan();
  for (let i: number = 0; i < 6; i++) {
    //every single loop we want a prospective plan that starts out the same as retval. and adds the best sidequest for that loop. unless all of the sidequests cause us to lose adv in which case it should remain as retval
    copy_warplan(prospective_plan, retval);
    let bestQuestProfit: number = 0;
    let profit: number = 0;

    if (considerFarm) {
      copy_warplan(test, retval);
      test.doFarm = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostFarm;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }

    if (considerNuns) {
      copy_warplan(test, retval);
      test.doNuns = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostNuns;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }

    if (considerOrchard) {
      copy_warplan(test, retval);
      test.doOrchard = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostOrchard;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }

    if (considerLighthouse) {
      copy_warplan(test, retval);
      test.doLighthouse = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostLighthouse;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }

    if (considerJunkyard) {
      copy_warplan(test, retval);
      test.doJunkyard = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostJunkyard;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }

    if (considerArena) {
      copy_warplan(test, retval);
      test.doArena = true;
      profit =
        auto_warTotalBattles$1(retval) -
        auto_warTotalBattles$1(test) -
        advCostArena;
      if (profit > bestQuestProfit) {
        bestQuestProfit = profit;
        copy_warplan(prospective_plan, test);
      }
    }
    //quit the loop early if the prospective plan is the same as retval
    //we want to compare the contents rather than the memory addresses so we are first converting it to bitmask integer value before testing
    if (
      bitmask_from_warplan(retval) === bitmask_from_warplan(prospective_plan)
    ) {
      break;
    }
    copy_warplan(retval, prospective_plan); //add a singular sidequest then go back to the start of the loop.
  }

  return retval;
}

function __auto_warTotalBattles(plan: number, remaining: number): number {
  // Prefer to use the version of this function that uses a WarPlan.
  // This is not meant to be used externally.
  // |plan| is a 6-bit bitmask where the lowest bit is a 1
  // if we finish the first quest, etc.
  // E.g. 39 is (32+0+0+4+2+1), meaning we are planning
  // to finish quests 1, 2, 3, 6.

  let total_battles: number = 0;
  let completed_quests: number = 0;

  function fightUntilRemaining(target_remaining: number): void {
    const to_kill: number = max(0, remaining - target_remaining);
    const kills_per_battle: number = auto_warKillsPerBattle$1(completed_quests);
    const battles: number = ceil(toFloat(to_kill) / kills_per_battle);

    total_battles += battles;
    remaining -= battles * kills_per_battle;
  }
  // 3 quests are accessible simultaneously.
  completed_quests += plan & 1;
  completed_quests += (plan >> 1) & 1;
  completed_quests += (plan >> 2) & 1;

  fightUntilRemaining(1000 - 64);
  // Mark newly accessible quest completed, fight until next quest is available.
  completed_quests += (plan >> 3) & 1;
  fightUntilRemaining(1000 - 192);

  completed_quests += (plan >> 4) & 1;
  fightUntilRemaining(1000 - 458);

  completed_quests += (plan >> 5) & 1;
  fightUntilRemaining(0);

  return total_battles;
}

function auto_warTotalBattles(plan: WarPlan, remaining: number): number {
  return __auto_warTotalBattles(bitmask_from_warplan(plan), remaining);
}

function auto_warTotalBattles$1(plan: WarPlan): number {
  return auto_warTotalBattles(plan, auto_warEnemiesRemaining());
}

export function equipWarOutfit(): void {
  equipWarOutfit$1(true);
}

function equipWarOutfit$1(lock: boolean): void {
  //equip the war outfit suitable for your side of the war. due to problem with maximizer we use autoForceEquip
  //lock means we want to lock the maximizer slots in question for the rest of the current loop (aka the next autoAdv).
  //sometimes we wear the outfit. visit url. fail and want to continue on to do another quest instead of aborting or returning true.
  //in such cases we want lock to be false

  let parts: Map<Item, boolean> = new Map();
  if (auto_warSide() === "hippy") {
    parts = new Map([
      [$item`reinforced beaded headband`, true],
      [$item`bullet-proof corduroys`, true],
      [$item`round purple sunglasses`, true],
    ]);
  } else {
    parts = new Map([
      [$item`beer helmet`, true],
      [$item`distressed denim pants`, true],
      [$item`bejeweled pledge pin`, true],
    ]);
  }
  for (const it of parts.keys()) {
    if (itemAmount(it) === 0 && equippedAmount(it) === 0) {
      if (closetAmount(it) > 0) {
        takeCloset(1, it);
      } else {
        abort(
          `I mysteriously do not have [${it}] which is needed for the war outfit`,
        );
      }
    }
    if (lock) {
      autoForceEquip$3(it);
    } else {
      equip(it);
    }
  }
}

export function haveWarOutfit(canWear: boolean): boolean {
  if (!toBoolean(getProperty("auto_hippyInstead"))) {
    return possessOutfit("Frat Warrior Fatigues", canWear);
  } else {
    return possessOutfit("War Hippy Fatigues", canWear);
  }
  return true;
}

export function haveWarOutfit$1(): boolean {
  return haveWarOutfit(false);
}

export function warAdventure(): boolean {
  if (
    auto_have_familiar($familiar`Space Jellyfish`) &&
    toInt(getProperty("_spaceJellyfishDrops")) < 3
  ) {
    handleFamiliar$1($familiar`Space Jellyfish`);
  }

  if (!toBoolean(getProperty("auto_hippyInstead"))) {
    //Commented out until Green smoke bomb support is added
    if (auto_warEnemiesRemaining() <= 600 && auto_haveGreyGoose()) {
      auto_log_info$1(
        "Bringing the Grey Goose to emit some drones at a GrOPs hopefully.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (!autoAdv$1(1, $location`The Battlefield (Frat Uniform)`)) {
      setProperty(
        "hippiesDefeated",
        (toInt(getProperty("hippiesDefeated")) + 1).toString(),
      );
      visitUrl("island.php");
    }
  } else {
    if (!autoAdv$1(1, $location`The Battlefield (Hippy Uniform)`)) {
      setProperty(
        "fratboysDefeated",
        (toInt(getProperty("fratboysDefeated")) + 1).toString(),
      );
      visitUrl("island.php");
    }
  }
  return true;
}

export function L12_getOutfit(): boolean {
  if (internalQuestStatus("questL12War") !== 0) {
    return false;
  }
  // if you already have the war outfit we don't need to do anything now
  if (haveWarOutfit$1()) {
    return false;
  }
  //heavy rains softcore pull handling
  if (!inHardcore() && in_heavyrains()) {
    // auto_warhippyspy indicates rainman was already used to copy a war hippy spy in heavy rains. if it failed to YR pull missing items
    if (
      getProperty("auto_warhippyspy") === "done" &&
      toBoolean(getProperty("auto_hippyInstead"))
    ) {
      pullXWhenHaveY($item`reinforced beaded headband`, 1, 0);
      pullXWhenHaveY($item`round purple sunglasses`, 1, 0);
      pullXWhenHaveY($item`bullet-proof corduroys`, 1, 0);
    }
    // auto_orcishfratboyspy indicates rainman was already used to copy an orcish frat boy in heavy rains. if it failed to YR pull missing items
    if (
      getProperty("auto_orcishfratboyspy") === "done" &&
      !toBoolean(getProperty("auto_hippyInstead"))
    ) {
      pullXWhenHaveY($item`beer helmet`, 1, 0);
      pullXWhenHaveY($item`bejeweled pledge pin`, 1, 0);
      pullXWhenHaveY($item`distressed denim pants`, 1, 0);
    }
  }
  //softcore pull handling for all other paths. Can't pull gear in LoL
  if (!inHardcore() && !in_heavyrains() && !in_lol()) {
    if (toBoolean(getProperty("auto_hippyInstead"))) {
      pullXWhenHaveY($item`reinforced beaded headband`, 1, 0);
      pullXWhenHaveY($item`round purple sunglasses`, 1, 0);
      pullXWhenHaveY($item`bullet-proof corduroys`, 1, 0);
    } else {
      pullXWhenHaveY($item`beer helmet`, 1, 0);
      pullXWhenHaveY($item`bejeweled pledge pin`, 1, 0);
      pullXWhenHaveY($item`distressed denim pants`, 1, 0);
    }
  }
  // if you have war outfit now then you just pulled it. so this time we return true as something changed
  if (haveWarOutfit$1()) {
    return true;
  }
  // if you reached this point you are either in hardcore or are in softcore but ran out of pulls
  // if really in softcore and out of pulls then returning false here lets you skip it until tomorrow
  if (!inHardcore() && !in_lol()) {
    return false;
  }
  // if outfit could not be pulled and have a [Filthy Hippy Disguise] outfit then wear it and adventure in Frat House to get war outfit
  if (
    auto_warSide() === "fratboy" &&
    possessOutfit$1("Filthy Hippy Disguise")
  ) {
    autoOutfit("Filthy Hippy Disguise");
    return autoAdv$2($location`Wartime Frat House (Hippy Disguise)`);
  }
  // if outfit could not be pulled and have a [Frat Boy Ensemble] outfit then wear it and adventure in Hippy Camp to get war outfit
  if (auto_warSide() === "hippy" && possessOutfit$1("Frat Boy Ensemble")) {
    autoOutfit("Frat Boy Ensemble");
    return autoAdv$2($location`Wartime Hippy Camp (Frat Disguise)`);
  }

  if (L12_preOutfit()) {
    return true;
  }
  return false;
}

export function L12_preOutfit(): boolean {
  if (toInt(getProperty("lastIslandUnlock")) !== myAscensions()) {
    return false;
  }
  // in softcore you will pull the war outfit, no need to get pre outfit
  if (!inHardcore() && !in_lol()) {
    return false;
  }

  if (myLevel() < 9) {
    return false;
  }

  if (haveWarOutfit$1()) {
    return false;
  }
  // if siding with frat and already own [Filthy Hippy Disguise] outfit needed to get the frat boy war outfit
  if (
    !toBoolean(getProperty("auto_hippyInstead")) &&
    possessOutfit$1("Filthy Hippy Disguise")
  ) {
    return false;
  }
  // if siding with hippies and already own [Frat Boy Ensemble] outfit needed to get the hippy war outfit
  if (
    toBoolean(getProperty("auto_hippyInstead")) &&
    possessOutfit$1("Frat Boy Ensemble")
  ) {
    return false;
  }

  if (isActuallyEd()) {
    if (!canYellowRay$1() && myLevel() < 12) {
      return false;
    }
  }

  if (
    haveSkill($skill`Calculate the Universe`) &&
    myDaycount() === 1 &&
    toInt(getProperty("_universeCalculated")) <
      min(3, toInt(getProperty("skillLevel144")))
  ) {
    return false;
  }
  //use a summon if we can guarentee outfit drops via yellow ray
  if (canSummonMonster($monster`Orcish Frat Boy Spy`) && canYellowRay$1()) {
    let summonTarget: Monster = $monster`War Hippy Spy`;
    if (!toBoolean(getProperty("auto_hippyInstead"))) {
      summonTarget = $monster`Orcish Frat Boy Spy`;
    }
    auto_log_info$1(
      `Trying to summon a ${summonTarget}, which we will yellow ray for war outfit.`,
    );
    return summonMonster(summonTarget);
  }

  if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
    if (
      !haveSkill($skill`Ink Gland`) &&
      itemAmount($item`shot of granola liqueur`) === 0
    ) {
      handleFamiliar$1($familiar`Robortender`);
    }
  }

  let adventure_status: boolean = false;
  // fighting for fratboys, adventure in hippy camp for [filthy hippy disguise] outfit to then adventure in frat house for frat war outfit
  if (!toBoolean(getProperty("auto_hippyInstead"))) {
    auto_log_info("Trying to acquire a filthy hippy outfit", "blue");
    if (internalQuestStatus("questL12War") === -1) {
      adventure_status = autoAdv$1(1, $location`The Hippy Camp`);
    } else {
      adventure_status = autoAdv$1(1, $location`Wartime Hippy Camp`);
    }
  } else {
    // fighting for hippies, adventure in orcish frat house for [Frat Boy Ensemble] outfit to then adventure in hippy camp for hippy war outfit
    auto_log_info("Trying to acquire a frat boy ensemble", "blue");
    if (internalQuestStatus("questL12War") === -1) {
      adventure_status = autoAdv$1(1, $location`The Orcish Frat House`);
    } else {
      adventure_status = autoAdv$1(1, $location`Wartime Frat House`);
    }
  }
  // We check the adventure status to avoid an infinite loop if we can't access any of these zones.
  if (adventure_status) {
    return true;
  } else {
    auto_log_error(
      "Please report this. L12 war pre outfit acquisition mysteriously failed... skipping",
    );
    return false;
  }
}

export function L12_startWar(): boolean {
  if (internalQuestStatus("questL12War") !== 0) {
    return false;
  }

  if (in_koe()) {
    return false;
  }

  if (!haveWarOutfit(true)) {
    return false;
  }

  if (toInt(getProperty("lastIslandUnlock")) < myAscensions()) {
    return false;
  }

  if (myMp() > 60 || considerGrimstoneGolem(true)) {
    handleBjornify($familiar`Grimstone Golem`);
  }

  if (
    !in_darkGyffte() &&
    myMp() > 50 &&
    haveSkill($skill`Incredible Self-Esteem`) &&
    !toBoolean(getProperty("_incredibleSelfEsteemCast"))
  ) {
    useSkill(1, $skill`Incredible Self-Esteem`);
  }
  // wear the appropriate war outfit based on auto_hippyInstead
  equipWarOutfit();

  if (auto_haveCCSC() && !haveSkill($skill`Comprehensive Cartography`)) {
    autoForceEquip$3($item`candy cane sword cane`);
  }
  // start the war when siding with frat boys
  if (!toBoolean(getProperty("auto_hippyInstead"))) {
    auto_log_info("Must save the ferret!!", "blue");
    if (L12_singleNCForWarStart()) {
      const NCForced: boolean = auto_forceNextNoncombat$1(
        $location`Wartime Hippy Camp`,
      );
    }
    autoAdv$1(1, $location`Wartime Hippy Camp`);
    //if war started, accept flyer quest for fratboys.
    //this is only started here and only for frat.
    //move this to dedicated function that can start it for both sides as appropriate
    if (internalQuestStatus("questL12War") === 1) {
      visitUrl("bigisland.php?place=concert&pwd");
    }
  } else {
    // start the war when siding with hippies
    auto_log_info("Must save the goldfish!!", "blue");
    if (L12_singleNCForWarStart()) {
      const NCForced: boolean = auto_forceNextNoncombat$1(
        $location`Wartime Frat House`,
      );
    }
    autoAdv$1(1, $location`Wartime Frat House`);
  }

  return true;
}

export function L12_filthworms(): boolean {
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestOrchardCompleted") !== "none"
  ) {
    return false;
  }
  if (in_tcrs() || in_koe()) {
    return false;
  }
  if (itemAmount($item`heart of the filthworm queen`) > 0) {
    return false;
  }
  if (auto_warEnemiesRemaining() === 0) {
    return false;
  }
  //can fight filthworms early as fratboys so long as you do not wear a frat outfit.
  //maximizer can accidentally end up wearing the outfit and cause infinite loop.
  //might want to fight filthworms early to flyer. determining exactly when is overly complex so we are just assuming always.
  //the frat outfits are pretty weak and as such its no big loss if we don't wear it when doing it early.
  function preventFratOutfitsIfNeeded(): void {
    if (
      auto_warSide() === "fratboy" &&
      toInt(getProperty("hippiesDefeated")) < 64
    ) {
      //helmet is least useful with +40 max MP enchantment.
      if (possessOutfit$1("frat warrior fatigues")) {
        addToMaximize("-equip beer helmet");
      }
      //pants and hat are identical, randomly selected hat for exclusion
      if (possessOutfit$1("frat boy ensemble")) {
        addToMaximize("-equip orcish baseball cap");
      }
    }
  }
  //if we can kill the queen we don't care about gland drops anymore. kill her and finish this
  if (itemAmount($item`filthworm royal guard scent gland`) > 0) {
    use(1, $item`filthworm royal guard scent gland`);
  }
  if (haveEffect($effect`Filthworm Guard Stench`) > 0) {
    auto_log_info("Finishing the orchard.", "blue");
    preventFratOutfitsIfNeeded();
    return autoAdv$1(1, $location`The Filthworm Queen's Chamber`);
  }
  //if we can guarentee stealing the stench gland then no point in buffing item drop
  let glandGuaranteed: boolean = true;
  if (
    auto_have_skill($skill`Lash of the Cobra`) &&
    toInt(getProperty("_edLashCount")) < 30
  ) {
    auto_log_info$1("Ed will steal stench glands using [Lash of the Cobra]");
  } else if (
    toInt(
      //	else if(auto_have_skill($skill[Smash & Graaagh]))
      //	{
      //		//only 30 per day, can't find mafia tracking for it so it can't be implemented yet.
      //		//Needs to be implemented in auto_combat.ash too before uncommenting this block
      //		auto_log_info("Zombie Master will steal stench glands using [Smash & Graaagh]");
      //	}
      getProperty("_xoHugsUsed"),
    ) < 10 &&
    canChangeToFamiliar($familiar`XO Skeleton`)
  ) {
    auto_log_info$1("Will steal stench glands using [XO Skeleton]");
    handleFamiliar$1($familiar`XO Skeleton`);
  } else if (auto_dousesRemaining() > 0) {
    auto_log_info$1("Will steal stench glands using FLUDA douse");
  } else if (auto_swoopsRemaining() > 0) {
    auto_log_info$1("Will steal stench glands using Swoop like a Bat");
  } else if (auto_fireExtinguisherCharges() > 10) {
    auto_log_info$1(
      "Will steal stench glands using polar vortex ability of [Industrial Fire Extinguisher]",
    );
  } else if (
    canYellowRay(
      //TODO add IOTM cat burglar stealing support here with another else if
      // or if we're about to yellow ray
      $monster`filthworm drone`,
    )
  ) {
    auto_log_info$1("We're going to yellow ray the stench glands.");
  } else if (auto_haveArchaeologistSpade() && auto_spadeDigsRemaining() >= 3) {
    auto_log_info$1(
      "Will dig up stench glands with Archaeologist's Spade if we don't get it in combat",
    );
  } else if (itemDropModifier() < 900.0) {
    //could not guarentee stealing. check if it should be delayed otherwise buff item drops instead
    if (
      haveEffect($effect`Everything Looks Yellow`) > 0 &&
      haveEffect($effect`Everything Looks Yellow`) <= 100
    ) {
      //yellow ray is on cooldown for now, we may be able to delay filthworms task until next yellow ray
      let delayFilthworms: boolean = false;

      if (getProperty("questL11MacGuffin") !== "finished") {
        //level 11 quest not finished, filthworms can wait
        if (isAboutToPowerlevel()) {
          auto_log_info$1(
            "Proceeding with filthworms because something seems to be holding up the level 11 quest.",
          );
        } else {
          delayFilthworms = true;
        }
      } else if (
        auto_warSide() === "fratboy" &&
        toInt(getProperty("hippiesDefeated")) < 64
      ) {
        //frat side has not defeated enough hippies to reach filthworms quest
        if (
          toInt(getProperty("flyeredML")) >= 10000 ||
          !isAboutToPowerlevel()
        ) {
          //if not stalled at flyering wait for battlefield, else can wait for optimal conditions because L12_lastDitchFlyer also waits on isAboutToPowerlevel()
          delayFilthworms = true;
        }
      } else if (auto_warSide() === "hippy") {
        const quest_planned: WarPlan = auto_bestWarPlan();
        if (
          quest_planned.doNuns &&
          getProperty("sidequestNunsCompleted") === "none"
        ) {
          //can wait until nuns finished
          delayFilthworms = true;
        }
        if (
          quest_planned.doFarm &&
          getProperty("sidequestFarmCompleted") === "none" &&
          !toBoolean(getProperty("auto_skipL12Farm"))
        ) {
          //can wait until farm finished
          delayFilthworms = true;
        }
      }

      if (delayFilthworms) {
        auto_log_info$1("Delaying filthworms because Everything Looks Yellow");
        return false;
      }
    }
    // filth worm glands have 10% drop rate
    // getting here means we don't have a yellow ray, not delaying for the yr, and don't have enough +item yet
    provideItem$2(900, $location`The Feeding Chamber`, false);

    if (in_lar()) {
      equipMaximizedGear();
      if (itemDropModifier() < 400.0) {
        abort(
          "Can not handle item drop amount for the Filthworms, deja vu!! Either get us to +400% and rerun or do it yourself.",
        );
      }
    }
    if (itemDropModifier() < 800.0) {
      glandGuaranteed = false;
      if (possessEquipment($item`Retrospecs`)) {
        //preadv would give a 50%item accessory a value of 2500 but when multiple fights are expected in each zone this accessory should be equivalent to 100%item?
        addToMaximize("+2500bonus Retrospecs");
      }
    }
  }

  auto_log_info("Doing the orchard.", "blue");
  //use the stench glands to unlock the next step of the quest.
  if (itemAmount($item`filthworm hatchling scent gland`) > 0) {
    use(1, $item`filthworm hatchling scent gland`);
  }
  if (itemAmount($item`filthworm drone scent gland`) > 0) {
    use(1, $item`filthworm drone scent gland`);
  }

  if (auto_cargoShortsOpenPocket(343)) {
    // skip straight to the Royal Guard Chamber
    handleTracker$1(
      wrap_item($item`Cargo Cultist Shorts`).toString(),
      $effect`Filthworm Drone Stench`.toString(),
      "auto_otherstuff",
    );
  }

  preventFratOutfitsIfNeeded();

  let retval: boolean = false;
  if (haveEffect($effect`Filthworm Drone Stench`) > 0) {
    //last gland
    if (haveEffect($effect`Filthworm Drone Stench`) === 1 && !glandGuaranteed) {
      //running out of effect, failing on the last turn would mean having to start over from The Hatching Chamber
      if (!toBoolean(getProperty("auto_limitConsume"))) {
        if (
          canChew($item`spooky jelly`) &&
          spleen_left() >= $item`spooky jelly`.spleen &&
          acquireOrPull($item`spooky jelly`) &&
          autoChew(1, $item`spooky jelly`)
        ) {
          auto_log_info$1(
            "Only one turn left in The Royal Guard Chamber, using spooky jelly emanations to avoid having to start over from the beginning",
          );
          glandGuaranteed = true;
        } else if (
          canEat$1($item`toast with spooky jelly`) &&
          stomach_left() >= $item`toast with spooky jelly`.fullness &&
          acquireOrPull($item`toast with spooky jelly`) &&
          autoEat(1, $item`toast with spooky jelly`)
        ) {
          //with values like 10 to 20 turns saved, not checking get_property("auto_consumeMinAdvPerFill").to_float()
          auto_log_info$1(
            "Only one turn left in The Royal Guard Chamber, using spooky jelly toast emanations to avoid having to start over from the beginning",
          );
          glandGuaranteed = true;
        }
      }
      if (glandGuaranteed) {
        //gland that was not guaranteed is forced now
        if (
          possessEquipment($item`broken champagne bottle`) &&
          januaryToteTurnsLeft($item`broken champagne bottle`) > 0
        ) {
          addToMaximize("-equip Broken Champagne Bottle"); //using this charge is no longer necessary, restore maximizer block that was removed
        }
      }
      //todo if still not glandGuaranteed try to force the use of free kills in combat?
    }
    retval = autoAdv$1(1, $location`The Royal Guard Chamber`);
  } else if (haveEffect($effect`Filthworm Larva Stench`) > 0) {
    retval = autoAdv$1(1, $location`The Feeding Chamber`);
  } else {
    retval = autoAdv$1(1, $location`The Hatching Chamber`);
  }

  return retval;
}

export function L12_orchardFinalize(): boolean {
  if (
    toInt(getProperty("hippiesDefeated")) < 64 &&
    !toBoolean(getProperty("auto_hippyInstead"))
  ) {
    return false;
  }
  if (
    getProperty("sidequestOrchardCompleted") !== "none" ||
    itemAmount($item`heart of the filthworm queen`) === 0
  ) {
    return false;
  }
  if (itemAmount($item`A Light that Never Goes Out`) === 1) {
    pulverizeThing($item`A Light that Never Goes Out`);
  }
  equipWarOutfit();
  if (is_werewolf()) {
    visitUrl("bigisland.php?place=orchard&action=stand&pwd=");
    return true; // can't access the shop as a werewolf so just want to return after done
  } else {
    visitUrl("bigisland.php?place=orchard&action=stand&pwd=");
    visitUrl("shop.php?whichshop=hippy");
  }
  return true;
}

function gremlinsFamiliar(): void {
  //when fighting gremlins we want to minimize the familiar ability to cause damage.

  if (in_avantGuard()) {
    return;
  }

  const hundred_fam: Familiar = toFamiliar(getProperty("auto_100familiar"));
  let strip_familiar: boolean = true;
  if (
    hundred_fam !== Familiar.none &&
    (isAttackFamiliar(hundred_fam) || hundred_fam.block)
  ) {
    //in 100% familiar run with an attack or block familiar
    setProperty("_auto_bad100Familiar", true.toString()); //do not buff bad familiar

    if (
      getProperty("questS01OldGuy") === "unstarted" &&
      !toBoolean(getProperty("_auto_seaQuestStartedToday"))
    ) {
      //easier to track if we tried today than to track if it is allowed in current path
      setProperty("_auto_seaQuestStartedToday", true.toString());
      visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); //get bathysphere by starting the sea quest
    }
    if (possessEquipment($item`mini kiwi invisible dirigible`) && !in_iluh()) {
      equip($slot`familiar`, $item`mini kiwi invisible dirigible`);
      strip_familiar = false;
      //disable maximizer switching of familiar equipment
      addToMaximize("-familiar");
    }
    if (possessEquipment($item`tiny consolation ribbon`)) {
      equip($slot`familiar`, $item`tiny consolation ribbon`);
      strip_familiar = false;
      //disable maximizer switching of familiar equipment
      addToMaximize("-familiar");
    }
    if (possessEquipment($item`little bitty bathysphere`)) {
      equip($slot`familiar`, $item`little bitty bathysphere`);
      strip_familiar = false;
      //disable maximizer switching of familiar equipment
      addToMaximize("-familiar");
    }
  } else if (lookupFamiliarDatafile("gremlins") === Familiar.none) {
    //none of the desired familiars available
    //don't know what familiar will be chosen or what its own equipment does
    strip_familiar = true;
    //maximizer will try to force an equip into familiar slot. So disable maximizer switching of familiar equipment
    addToMaximize("-familiar");
  } else {
    //desired familiars will be available. their own equipment or generic weight boosting familiar equipment is beneficial
    strip_familiar = false;
    //there is a limited list of harmful familiar equipment to forbid
    for (const fameq of $items`tiny bowler, ant hoe, ant pick, ant pitchfork, ant rake, ant sickle, oversized fish scaler, filthy child leash, plastic pumpkin bucket, little box of fireworks, moveable feast`) {
      const wrapped_fameq: Item = wrap_item(fameq);
      if (possessEquipment(wrapped_fameq)) {
        addToMaximize(`-equip ${wrapped_fameq.toString()}`);
      }
    }
  }
  if (strip_familiar) {
    equip($slot`familiar`, Item.none); //strip familiar equipment to avoid passive dmg
  }
}

export function L12_gremlins(): boolean {
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestJunkyardCompleted") !== "none"
  ) {
    return false;
  }
  if (in_koe() || in_pokefam() || in_bhy()) {
    return false;
  }
  if (is_professor()) {
    return false; //Only 1 HP as a professor so can't stasis long enough
  }
  if (
    toBoolean(getProperty("auto_hippyInstead")) &&
    toInt(getProperty("fratboysDefeated")) < 192
  ) {
    return false;
  }
  if (auto_warEnemiesRemaining() === 0) {
    return false;
  }
  if (in_zombieSlayer()) {
    if (
      !auto_have_skill($skill`Plague Claws`) &&
      itemAmount($item`seal tooth`) === 0
    ) {
      return false;
    }
  } else if (in_glover()) {
    const need: number = 30 - itemAmount($item`Doc Galaktik's Pungent Unguent`);
    if (need > 0 && itemAmount($item`molybdenum pliers`) === 0) {
      const meatNeed: number =
        need * npcPrice($item`Doc Galaktik's Pungent Unguent`);
      if (myMeat() < meatNeed) {
        return false;
      }
      auto_buyUpTo(30, $item`Doc Galaktik's Pungent Unguent`);
    }
  } else {
    if (itemAmount($item`seal tooth`) === 0) {
      acquireHermitItem($item`seal tooth`);
      if (itemAmount($item`seal tooth`) === 0) {
        abort(
          "We don't have a seal tooth. Stasising Gremlins is not going to go well if you lack something to stasis them with.",
        );
      }
    }
  }

  if (0 < haveEffect($effect`Curse of the Black Pearl Onion`)) {
    uneffect($effect`Curse of the Black Pearl Onion`);
  }

  if (
    0 < haveEffect($effect`Everything Is Bananas`) &&
    !uneffect($effect`Everything Is Bananas`)
  ) {
    //normally effect would not be used close enough to this quest for this to happen
    if (!isAboutToPowerlevel()) {
      auto_log_info$1("Delaying gremlins because Everything Is Bananas");
      return false;
    } else {
      abort(
        "Stuck with Everything Is Bananas effect at junkyard sidequest. Probably can't complete quest if gremlins unable to hit.",
      );
    }
  }

  if (itemAmount($item`molybdenum magnet`) === 0) {
    if (robot_delay("outfit")) {
      return false; //delay for You, Robot path
    }
    //if fighting for frat immediately grab it
    if (!toBoolean(getProperty("auto_hippyInstead"))) {
      equipWarOutfit();
      visitUrl("bigisland.php?action=junkman&pwd");
    }
    //if fighting for hippies grab magnet when enough fratboys killed
    if (
      toBoolean(getProperty("auto_hippyInstead")) &&
      toInt(getProperty("fratboysDefeated")) >= 192
    ) {
      equipWarOutfit();
      visitUrl("bigisland.php?action=junkman&pwd");
    }
    //if still don't have magnet something went wrong
    if (itemAmount($item`molybdenum magnet`) === 0) {
      abort(
        "We don't have the molybdenum magnet but should... please get it and rerun the script",
      );
    } else {
      return true;
    }
  }

  if (in_disguises()) {
    abort(
      "Do gremlins manually, sorry. Or set sidequestJunkyardCompleted=fratboy and we will just skip them",
    );
  }
  // Avoid killing the tool gremlins using familiar damage.
  gremlinsFamiliar();

  auto_log_info("Doing them gremlins", "blue");
  // ideally we want to survive a single attack
  addToMaximize("20dr,1da 1000max,-ml,-1000avoid attack");
  autoForceEquip$3($item`Peridot of Peril`);
  acquireHP();
  if (!bat_wantHowl($location`Over Where the Old Tires Are`)) {
    bat_formMist$1();
  }
  songboomSetting("dr");
  if (itemAmount($item`molybdenum hammer`) === 0) {
    autoAdv(
      1,
      $location`Next to that Barrel with Something Burning in it`,
      auto_JunkyardCombatHandler,
    );
    return true;
  }

  if (itemAmount($item`molybdenum screwdriver`) === 0) {
    autoAdv(
      1,
      $location`Out by that Rusted-Out Car`,
      auto_JunkyardCombatHandler,
    );
    return true;
  }

  if (itemAmount($item`molybdenum crescent wrench`) === 0) {
    autoAdv(
      1,
      $location`Over Where the Old Tires Are`,
      auto_JunkyardCombatHandler,
    );
    return true;
  }

  if (itemAmount($item`molybdenum pliers`) === 0) {
    autoAdv(
      1,
      $location`Near an Abandoned Refrigerator`,
      auto_JunkyardCombatHandler,
    );
    return true;
  }
  equipWarOutfit();
  visitUrl("bigisland.php?action=junkman&pwd");
  return true;
}

export function L12_sonofaBeach(): boolean {
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestLighthouseCompleted") !== "none"
  ) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  if (auto_warEnemiesRemaining() === 0) {
    return false;
  }
  if (
    toInt(getProperty("fratboysDefeated")) < 64 &&
    toBoolean(getProperty("auto_hippyInstead"))
  ) {
    return false;
  }
  if (itemAmount($item`barrel of gunpowder`) >= 5) {
    return false;
  }

  if (
    auto_hasAutumnaton() &&
    !isAboutToPowerlevel() &&
    $location`Sonofa Beach`.turnsSpent > 0
  ) {
    // delay zone to allow autumnaton to grab barrels
    // unless we have ran out of other stuff to do
    return false;
  }

  if (in_pokefam()) {
    if (
      containsText(
        $location`Sonofa Beach`.combatQueue,
        $monster`lobsterfrogman`.toString(),
      )
    ) {
      if (timeSpinnerCombat($monster`lobsterfrogman`)) {
        return true;
      }
    }
  }

  if (
    chateaumantegna_havePainting() &&
    !toBoolean(getProperty("chateauMonsterFought")) &&
    getProperty("chateauMonster") === $monster`lobsterfrogman`.toString()
  ) {
    auto_sourceTerminalEducate($skill`Extract`, $skill`Digitize`);
    if (chateaumantegna_usePainting()) {
      return true;
    }
  }

  if (
    isActuallyEd() &&
    itemAmount($item`talisman of Horus`) === 0 &&
    haveEffect($effect`Taunt of Horus`) === 0
  ) {
    return false;
  }
  if (ed_DelayNC$1(100.0)) {
    //zerg rush can deal 100% of maxHP in damage
    return false; //ed is not prepared. delay
  }
  //Seriously? http://alliancefromhell.com/viewtopic.php?t=1338
  if (itemAmount($item`wool hat`) === 1) {
    pulverizeThing($item`wool hat`);
  }
  if (itemAmount($item`goatskin umbrella`) === 1) {
    pulverizeThing($item`goatskin umbrella`);
  }

  if (!in_lar()) {
    const combat_bonus: number = providePlusCombat(
      auto_combatModCap(),
      $location`Sonofa Beach`,
      true,
      true,
    );
    if (combat_bonus <= 0.0) {
      auto_log_warning(
        `Something is keeping us from getting a suitable combat rate for [Lobsterfrogmen] in [Sonofa Beach]. we have: ${combat_bonus}`,
        "red",
      );
      resetState();
      return false;
    }
  }

  if (itemAmount($item`barrel of gunpowder`) < 4) {
    setProperty("auto_doCombatCopy", "yes");
  }

  const retval: boolean = autoAdv$2($location`Sonofa Beach`);

  setProperty("auto_doCombatCopy", "no");
  edAcquireHP();

  return retval;
}

export function L12_sonofaPrefix(): boolean {
  // this appears to be a copy & paste of L12_sonofaBeach() with some small changes
  // for Vote Monster/Macrometeor shenanigans. Refactor this so only the relevant code remains.

  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestLighthouseCompleted") !== "none"
  ) {
    return false;
  }
  if (L12_sonofaFinish()) {
    return true;
  }

  if (in_koe()) {
    return false;
  }

  if (
    getProperty("_sourceTerminalDigitizeMonster") ===
    $monster`lobsterfrogman`.toString()
  ) {
    return false;
  }
  if (itemAmount($item`barrel of gunpowder`) >= 4 && !auto_voteMonster()) {
    return false;
  }
  if (itemAmount($item`barrel of gunpowder`) >= 5) {
    return false;
  }

  if (
    chateaumantegna_havePainting() &&
    !toBoolean(getProperty("chateauMonsterFought")) &&
    getProperty("chateauMonster") === $monster`lobsterfrogman`.toString()
  ) {
    auto_sourceTerminalEducate($skill`Extract`, $skill`Digitize`);
    if (chateaumantegna_usePainting()) {
      return true;
    }
  }

  if (
    auto_backupTarget() &&
    toMonster(getProperty("lastCopyableMonster")) === $monster`lobsterfrogman`
  ) {
    //let LX_burnDelay() run prior to forcing backing up in noob cave
    return false;
  }

  if (!auto_get_campground().has($item`Source terminal`)) {
    if (
      (auto_voteMonster() || auto_sausageGoblin()) &&
      adjustForReplaceIfPossible$1()
    ) {
      try {
        if (itemAmount($item`barrel of gunpowder`) < 4) {
          setProperty("auto_doCombatCopy", "yes");
        }
        if (auto_voteMonster() && !auto_voteMonster$1(true)) {
          auto_voteMonster$2(false, $location`Sonofa Beach`);
          return true;
        } else if (auto_sausageGoblin() && !auto_haveVotingBooth()) {
          auto_sausageGoblin$2($location`Sonofa Beach`, null);
          return true;
        }
      } finally {
        setProperty("auto_combatDirective", "");
        setProperty("auto_doCombatCopy", "no");
      }
    }
    return false;
  }

  if (
    isActuallyEd() &&
    itemAmount($item`talisman of Horus`) === 0 &&
    haveEffect($effect`Taunt of Horus`) === 0
  ) {
    return false;
  }

  if (in_koe()) {
    return false;
  }
  //Seriously? http://alliancefromhell.com/viewtopic.php?t=1338
  if (itemAmount($item`wool hat`) === 1) {
    pulverizeThing($item`wool hat`);
  }
  if (itemAmount($item`goatskin umbrella`) === 1) {
    pulverizeThing($item`goatskin umbrella`);
  }

  let CForced: boolean = false;
  // skills/items that let us select monsters can have the effect of forcing
  // combat here too. Think PoP is the only one implemented for this quest (map the monsters being the other, not implemented).
  if (!auto_havePeridot() || haveUsedPeridot$1($location`Sonofa Beach`)) {
    if (auto_haveQueuedForcedCombat()) {
      CForced = true;
      auto_log_info$1(
        "Not trying to force combat again at Sonofa Beach because we already have a forced combat queued",
      );
    } else {
      CForced = auto_forceNextCombat$1($location`Sonofa Beach`);
      auto_log_info(
        `Trying to force combat at Sonofa Beach: ${CForced.toString()}`,
        "blue",
      );
    }
  }
  if (!in_lar() && !CForced) {
    const combat_bonus: number = providePlusCombat(
      auto_combatModCap(),
      $location`Sonofa Beach`,
      true,
      true,
    );
    if (combat_bonus <= 0.0) {
      auto_log_warning(
        `Something is keeping us from getting a suitable combat rate for [Lobsterfrogmen] in [Sonofa Beach]. we have: ${combat_bonus}`,
        "red",
      );
      resetState();
      return false;
    }
  }

  if (itemAmount($item`barrel of gunpowder`) < 4) {
    setProperty("auto_doCombatCopy", "yes");
  }

  if (
    myMp() < mpCost($skill`Digitize`) &&
    auto_get_campground().has($item`Source terminal`) &&
    isUnrestricted($item`Source terminal`) &&
    getProperty("_sourceTerminalDigitizeMonster") !==
      $monster`lobsterfrogman`.toString() &&
    toInt(getProperty("_sourceTerminalDigitizeUses")) < 3
  ) {
    resetState();
    return false;
  }

  if (possessEquipment($item`"I Voted!" sticker`) && myAdventures() > 15) {
    if (
      haveSkill($skill`Meteor Lore`) &&
      toInt(getProperty("_macrometeoriteUses")) < 10
    ) {
      if (auto_voteMonster()) {
        setProperty("auto_combatDirective", "start;skill macrometeorite");
        autoEquip($slot`acc3`, $item`"I Voted!" sticker`);
      } else {
        return false;
      }
    }
  }

  auto_sourceTerminalEducate($skill`Extract`, $skill`Digitize`);

  const retval: boolean = autoAdv$2($location`Sonofa Beach`);
  if (!retval) {
    auto_log_error("Failed to adventure in [Sonofa Beach]");
    resetState();
  }
  edAcquireHP();
  return retval;
}

export function L12_sonofaFinish(): boolean {
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestLighthouseCompleted") !== "none"
  ) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  if (itemAmount($item`barrel of gunpowder`) < 5) {
    return false;
  }
  if (!haveWarOutfit$1()) {
    return false;
  }
  if (
    toInt(getProperty("fratboysDefeated")) < 64 &&
    toBoolean(getProperty("auto_hippyInstead"))
  ) {
    return false;
  }

  equipWarOutfit();
  visitUrl("bigisland.php?place=lighthouse&action=pyro&pwd");
  visitUrl("bigisland.php?place=lighthouse&action=pyro&pwd");
  return true;
}

export function L12_flyerBackup(): boolean {
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }
  if (toInt(getProperty("flyeredML")) >= 10000) {
    return false;
  }
  if (
    itemAmount($item`rock band flyers`) === 0 &&
    itemAmount($item`jam band flyers`) === 0
  ) {
    return false;
  }
  if (toInt(getProperty("choiceAdventure1003")) >= 3) {
    return false;
  }
  if (toBoolean(getProperty("auto_ignoreFlyer"))) {
    return false;
  }

  return LX_freeCombats$1(true);
}

export function L12_lastDitchFlyer(): boolean {
  if (toBoolean(getProperty("auto_ignoreFlyer"))) {
    return false;
  }
  if (!auto_bestWarPlan().doArena) {
    return false; //we are not planning to do arena this ascension
  }
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestArenaCompleted") !== "none" ||
    toInt(getProperty("flyeredML")) >= 10000
  ) {
    return false;
  }
  if (
    itemAmount($item`rock band flyers`) === 0 &&
    itemAmount($item`jam band flyers`) === 0
  ) {
    return false;
  }
  if (myLevel() < 13 && !isAboutToPowerlevel()) {
    return false; //let the powerlevel lock release first so we can do quests that are waiting for optimal conditions.
  }

  auto_log_info(
    "Not enough flyer ML but we are ready for the war... uh oh",
    "blue",
  );
  if (LX_freeCombats$1(true)) {
    //try to use free combats to make up the difference.
    return true;
  }

  const scalezone: Location = highestScalingZone();
  let flyer_gains: number =
    myBuffedstat($stat`Moxie`) + monsterLevelAdjustment();
  switch (scalezone) {
    case $location`The Neverending Party`:
      flyer_gains += 20;
      break;
    case $location`VYKEA`:
      flyer_gains += 6;
      break;
    case $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`:
    case $location`The Deep Dark Jungle`:
    case $location`Sloppy Seconds Diner`:
      flyer_gains += 5;
      break;
  }
  const adv_needed: number =
    (10000.0 - toFloat(getProperty("flyeredML"))) / flyer_gains;

  const plan_do_arena: WarPlan = auto_bestWarPlan();
  plan_do_arena.doArena = true;
  const plan_no_arena: WarPlan = auto_bestWarPlan();
  plan_no_arena.doArena = false;
  const adv_saved: number =
    auto_warTotalBattles$1(plan_no_arena) -
    auto_warTotalBattles$1(plan_do_arena);

  if (adv_needed > adv_saved) {
    return false; //if we lose advs by doing last ditch flyering then do not do it
  }

  if (scalezone === $location`The Neverending Party`) {
    return neverendingPartyCombat();
  }
  if (scalezone !== Location.none) {
    return autoAdv$2(scalezone);
  }
  return false;
}

export function L12_flyerFinish(): boolean {
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }
  if (
    itemAmount($item`rock band flyers`) === 0 &&
    itemAmount($item`jam band flyers`) === 0
  ) {
    return false;
  }
  if (toInt(getProperty("flyeredML")) < 10000) {
    if (getProperty("sidequestArenaCompleted") !== "none") {
      auto_log_warning(
        "Sidequest Arena detected as completed but flyeredML is not appropriate, fixing.",
        "red",
      );
      setProperty("flyeredML", (10000).toString());
    } else {
      return false;
    }
  }
  if (toBoolean(getProperty("auto_ignoreFlyer"))) {
    return false;
  }
  if (robot_delay("outfit")) {
    return false; //delay for You, Robot path
  }

  auto_log_info("Done with this Flyer crap", "blue");
  equipWarOutfit$1(false);
  visitUrl("bigisland.php?place=concert&pwd");

  cliExecute("refresh inv");
  if (
    itemAmount($item`rock band flyers`) === 0 &&
    itemAmount($item`jam band flyers`) === 0
  ) {
    return true;
  }
  auto_log_warning(
    "We thought we had enough flyeredML, but we don't. Big sadness, let's try that again.",
    "red",
  );
  setProperty("flyeredML", (9999).toString());
  return false;
}

export function L12_themtharHills(): boolean {
  if (
    internalQuestStatus("questL12War") !== 1 ||
    getProperty("sidequestNunsCompleted") !== "none"
  ) {
    return false;
  }

  if (auto_warEnemiesRemaining() === 0) {
    return false;
  }

  if (in_tcrs() || in_koe() || in_wotsf()) {
    return false;
  }
  // delay nuns if we have free fights available as it would cap meat drop to 1,000
  if (toInt(getProperty("breathitinCharges")) > 0 && !isAboutToPowerlevel()) {
    return false;
  }

  if (
    (toInt(getProperty("hippiesDefeated")) < 192 &&
      !toBoolean(getProperty("auto_hippyInstead"))) ||
    toBoolean(getProperty("auto_skipNuns"))
  ) {
    return false;
  } else {
    auto_log_info("Themthar Nuns!", "blue");
  }

  handleFamiliar("meat");
  //can only do this in Avant Guard in 6 turns in HC or 8 turns in Normal. Need the August Scepter. If day 1, can't get enough waffles so don't even bother with this
  setProperty("auto_delayWar", false.toString());
  if (in_avantGuard()) {
    if (!auto_haveAugustScepter()) {
      // no scepter = no waffles = impossible
      // macrometeorite / replace enemy use different code and don't work for this
      setProperty("auto_skipNuns", "true");
      return false;
    }
    if (myDaycount() === 1) {
      // don't have enough waffles yet
      return false;
    }
    auto_log_info$1("Checking how much meat drop we can get");
    if (
      (inHardcore() &&
        itemAmount($item`waffle`) <= 6 &&
        $location`The Themthar Hills`.turnsSpent + itemAmount($item`waffle`) >
          6) ||
      (itemAmount($item`waffle`) <= 8 &&
        $location`The Themthar Hills`.turnsSpent + itemAmount($item`waffle`) >
          8)
    ) {
      return false;
    }
    const meatProvide: number = inHardcore()
      ? toInt(provideMeat$1(1800, true, true))
      : toInt(provideMeat$1(1600, true, true));
    if ((inHardcore() && !(meatProvide >= 1800)) || !(meatProvide >= 1600)) {
      let bonusMeat: number = 0;
      let getInhaler: boolean = false;
      let doRufus: boolean = false;
      if (
        haveEffect($effect`Sinuses For Miles`) <= 0 &&
        itemAmount($item`Mick's IcyVapoHotness Inhaler`) < 1 &&
        auto_is_valid($item`Mick's IcyVapoHotness Inhaler`) &&
        cloversAvailable$1() > 0 &&
        zone_isAvailable$1(
          $location`The Castle in the Clouds in the Sky (Top Floor)`,
        )
      ) {
        bonusMeat += 200;
        getInhaler = true;
      }
      if (
        auto_havePayPhone() &&
        !toBoolean(getProperty("_shadowAffinityToday")) &&
        itemAmount($item`Rufus's shadow lodestone`) < 1
      ) {
        bonusMeat += 200;
        doRufus = true;
      }
      const bonusMeatNeeded: number = inHardcore()
        ? 1800 - meatProvide
        : 1600 - meatProvide;
      if (bonusMeatNeeded - bonusMeat <= 0) {
        if (getInhaler) {
          auto_log_info$1("Getting Inhaler");
          return autoLuckyAdv$1(
            $location`The Castle in the Clouds in the Sky (Top Floor)`,
          );
        }
        if (doRufus) {
          auto_log_info$1("Doing Pay Phone Quest for Shadow Waters");
          return auto_doPhoneQuest();
        }
      } else {
        setProperty("auto_delayWar", true.toString());
        return false;
      }
    }
  }
  // Outside of AG, if we have 3+ effect wishes we'll be wishing for Sinuses for Miles instead
  let considerCloverForInhaler: boolean =
    (in_avantGuard() || auto_totalEffectWishesAvailable() < 3) &&
    auto_is_valid($item`Mick's IcyVapoHotness Inhaler`);
  considerCloverForInhaler =
    considerCloverForInhaler &&
    zone_isAvailable$1(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    );
  // Target 1000 + 400% = 5000 meat per brigand. Of course we want more, but don\'t bother unless we can get this.
  let meat_need: number = 400.0;
  //count inhaler if we have one or if we have a clover to obtain one and can use one
  if (
    itemAmount($item`Mick's IcyVapoHotness Inhaler`) > 0 ||
    (cloversAvailable$1() > 0 && considerCloverForInhaler)
  ) {
    meat_need = meat_need - 200;
  }
  if (
    in_darkGyffte() &&
    haveSkill($skill`Wolf Form`) &&
    0 === haveEffect($effect`Wolf Form`)
  ) {
    meat_need = meat_need - 150;
  }
  if (
    zataraAvailable() &&
    toBoolean(
      toInt(0 === haveEffect($effect`Meet the Meat`)) &
        toInt(auto_is_valid$3($effect`Meet the Meat`)),
    )
  ) {
    meat_need = meat_need - 100;
  }

  const famChoice: Familiar = toFamiliar(getProperty("auto_familiarChoice"));
  if (canChangeFamiliar() && famChoice !== Familiar.none) {
    // if we're in a 100% run, this property returns "none" which will unequip our familiar and ruin a 100% run.
    useFamiliar(famChoice);
  }
  equipMaximizedGear();
  let meatDropHave: number = provideMeat$1(1800, true, true);

  if (
    isActuallyEd() &&
    haveSkill($skill`Curse of Fortune`) &&
    itemAmount($item`Ka coin`) > 0
  ) {
    meatDropHave = meatDropHave + 200;
  }
  if (meatDropHave < meat_need) {
    auto_log_warning(
      `Meat drop (${meatDropHave}) is pretty low, (we want: ${meat_need}) probably not worth it to try this.`,
      "red",
    );

    const minget: number = 800.0 * (meatDropHave / 100.0);
    const meatneed: number = 100000 - toInt(getProperty("currentNunneryMeat"));
    auto_log_info(
      `The min we expect is: ${minget} and we need: ${meatneed}`,
      "blue",
    );

    if (minget < meatneed) {
      const curMeat: number = toInt(getProperty("currentNunneryMeat"));
      const advs: number = $location`The Themthar Hills`.turnsSpent;
      const needMeat: number = 100000 - curMeat;

      let failNuns: boolean = true;
      if (advs < 25) {
        const advLeft: number = 25 - $location`The Themthar Hills`.turnsSpent;
        const needPerAdv: number = needMeat / advLeft;
        if (minget > needPerAdv) {
          auto_log_info(
            "We don't have the desired +meat but should be able to complete the nuns to our advantage",
            "green",
          );
          failNuns = false;
        }
      }

      if (failNuns) {
        setProperty("auto_skipNuns", "true");
        return false;
      }
    } else {
      auto_log_info("The min should be enough! Doing it!!", "purple");
    }
  }

  if (considerCloverForInhaler) {
    if (
      haveEffect($effect`Sinuses For Miles`) <= 0 &&
      itemAmount($item`Mick's IcyVapoHotness Inhaler`) < 1 &&
      cloversAvailable$1() > 0
    ) {
      //use clover to get inhaler
      return autoLuckyAdv$1(
        $location`The Castle in the Clouds in the Sky (Top Floor)`,
      );
    }
  }

  auto_getCitizenZone$1("meat"); //because it can take a turn, get this before getting any other buffs
  provideMeat$1(1800, true, false); // Do as much as possible to get meat drops

  {
    equipWarOutfit();

    const lastMeat: number = toInt(getProperty("currentNunneryMeat"));
    const myLastMeat: number = myMeat();
    auto_log_info(`Meat drop to start: ${meatDropModifier()}`, "blue");
    if (!autoAdv$1(1, $location`The Themthar Hills`)) {
      //Maybe we passed it!
      visitUrl("bigisland.php?place=nunnery");
    }
    if (lastMonster() !== $monster`dirty thieving brigand`) {
      return true;
    }
    if (
      getProperty("lastEncounter") !==
      $monster`dirty thieving brigand`.toString()
    ) {
      return true;
    }

    const curMeat: number = toInt(getProperty("currentNunneryMeat"));
    if (lastMeat === curMeat) {
      const diffMeat_1: number = myMeat() - myLastMeat;
      setProperty("currentNunneryMeat", diffMeat_1.toString());
    }

    const advs: number = $location`The Themthar Hills`.turnsSpent + 1;

    let diffMeat: number = curMeat - lastMeat;
    let average: number = curMeat / advs;
    auto_log_info(`Cur Meat: ${curMeat} Average: ${average}`, "blue");

    diffMeat = toInt(diffMeat * 1.2);
    average = toInt(average * 1.2);
  }
  return true;
}

function LX_obtainChaosButterfly(): boolean {
  if (in_bhy() || in_pokefam() || in_glover()) {
    return false;
  }
  if (toBoolean(getProperty("chaosButterflyThrown"))) {
    return false;
  }
  if (!isUnrestricted($item`chaos butterfly`)) {
    return false;
  }
  if (internalQuestStatus("questL10Garbage") < 8) {
    return false;
  }
  // Softcore pull
  if (
    canPull$1($item`chaos butterfly`) &&
    !toBoolean(getProperty("chaosButterflyThrown")) &&
    itemAmount($item`chaos butterfly`) === 0
  ) {
    if (pullXWhenHaveY($item`chaos butterfly`, 1, 0)) {
      return true;
    } else {
      auto_log_warning(
        "failed to pull [chaos butterfly] for some reason",
        "red",
      );
    }
  }
  // Fight possibility giant for chaos butterfly if profitable.
  if (
    !toBoolean(getProperty("chaosButterflyThrown")) &&
    itemAmount($item`chaos butterfly`) === 0 &&
    auto_estimatedAdventuresForChaosButterfly() < 15
  ) {
    if (
      autoAdv$1(
        1,
        $location`The Castle in the Clouds in the Sky (Ground Floor)`,
      )
    ) {
      return true;
    } else {
      auto_log_warning(
        "For some reason failed to adventure in [The Castle in the Clouds in the Sky (Ground Floor)] for a [chaos butterfly]... skipping",
        "red",
      );
    }
  }
  // Special-case using chaos butterfly in the Barn right after acquiring it,
  // to avoid any funny business where we don't use the chaos butterfly,
  // adventure somewhere else, our CCS uses the chaos butterfly, and we
  // suddenly realize that we want to complete dooks after all.
  if (
    !toBoolean(getProperty("chaosButterflyThrown")) &&
    itemAmount($item`chaos butterfly`) > 0 &&
    !in_pokefam()
  ) {
    if ($location`McMillicancuddy's Barn`.turnsSpent > 0) {
      auto_log_warning(
        "I seem to have spent turns in [McMillicancuddy's Barn] without using the [chaos butterfly] which I have. Something is not right...",
        "red",
      );
    } else {
      auto_log_warning(
        "Looks like I should use the [chaos butterfly] in [McMillicancuddy's Barn]",
        "blue",
      );
      return autoAdv$1(1, $location`McMillicancuddy's Barn`);
    }
  }

  return false;
}

export function L12_farm(): boolean {
  if (toBoolean(getProperty("auto_skipL12Farm"))) {
    return false;
  }
  if (getProperty("sidequestFarmCompleted") !== "none") {
    setProperty("auto_skipL12Farm", "true");
    return false;
  }
  if (
    auto_warEnemiesRemaining() === 0 &&
    toInt(getProperty("auto_L12FarmStage")) < 4
  ) {
    return false;
  }
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }
  //Does fratboy side have access to farm yet?
  //TODO verify this works with pocket familiar. And if not then make special handling for pokefam
  if (
    auto_warSide() === "fratboy" &&
    toInt(getProperty("hippiesDefeated")) < 458
  ) {
    return false;
  }

  const plan: WarPlan = auto_bestWarPlan();
  if (!plan.doFarm) {
    return false;
  }
  // Acquire and use chaos butterfly if needed and desired
  if (LX_obtainChaosButterfly()) {
    return true;
  }

  auto_log_info("Save McMillicancuddy's Farm from the Dooks", "blue");
  // There is no mafia tracking for stages of this sidequest
  // Because Mafia's adventures spent count also increments on a free fight, we cannot
  // rely on adventures spent count to see if a zone is clear.
  // Instead, we use the internal property auto_L12FarmStage to determine
  // which section of the farm is available.
  // Note that this code uses switch fall-through, and does not use breaks.

  switch (toInt(getProperty("auto_L12FarmStage"))) {
    case 0:
      if (autoAdv$1(1, $location`McMillicancuddy's Barn`)) {
        return true;
      }
      setProperty("auto_L12FarmStage", "1");
    case 1:
      if (autoAdv$1(1, $location`McMillicancuddy's Pond`)) {
        return true;
      }
      setProperty("auto_L12FarmStage", "2");
    case 2:
      if (autoAdv$1(1, $location`McMillicancuddy's Back 40`)) {
        return true;
      }
      setProperty("auto_L12FarmStage", "3");
    case 3:
      if (autoAdv$1(1, $location`McMillicancuddy's Other Back 40`)) {
        return true;
      }
      setProperty("auto_L12FarmStage", "4");
    case 4:
      equipWarOutfit();
      visitUrl("bigisland.php?place=farm&action=farmer&pwd");
      if (getProperty("sidequestFarmCompleted") !== "none") {
        return true;
      }
      abort(
        "Failed to turn in L12 Farm sidequest. please finish it manually and run me again",
      );
  }
  // This really should not happen. Maybe if auto_L12FarmStage is in an invalid state (not 0-4).
  abort(
    `I am confused about where I am in the dooks. Please report this. auto_L12FarmStage=${getProperty("auto_L12FarmStage")}`,
  );
  return false;
}

export function L12_clearBattlefield(): boolean {
  if (
    !inAftercore() &&
    myInebriety() < inebrietyLimit() &&
    !toBoolean(getProperty("_gardenHarvested"))
  ) {
    const camp: Map<Item, number> = auto_get_campground();
    if (
      camp.has($item`packet of thanksgarden seeds`) &&
      camp.has($item`cornucopia`) &&
      (camp.get($item`cornucopia`) ??
        camp.set($item`cornucopia`, 0).get($item`cornucopia`)) > 0 &&
      internalQuestStatus("questL12War") >= 1 &&
      isUnrestricted($item`packet of thanksgarden seeds`)
    ) {
      cliExecute("garden pick");
    }
  }
  if (in_koe()) {
    return L12_koe_clearBattlefield();
  }
  if (in_pokefam()) {
    return L12_pokefam_clearBattlefield();
  }
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }
  let enemies_defeated: number = toInt(getProperty("hippiesDefeated"));
  if (auto_warSide() === "hippy") {
    enemies_defeated = toInt(getProperty("fratboysDefeated"));
  }
  if (enemies_defeated >= 1000) {
    return false; //already done
  }

  const quest_done: WarPlan = auto_warSideQuestsState();
  const quest_planned: WarPlan = auto_bestWarPlan();
  //which sidequests have we reached already?
  const quest_reached: WarPlan = new WarPlan();
  if (auto_warSide() === "fratboy") {
    quest_reached.doArena = true;
    quest_reached.doJunkyard = true;
    quest_reached.doLighthouse = true;
    if (enemies_defeated >= 64) {
      quest_reached.doOrchard = true;
    }
    if (enemies_defeated >= 192) {
      quest_reached.doNuns = true;
    }
    if (enemies_defeated >= 458) {
      quest_reached.doFarm = true;
    }
  } else {
    quest_reached.doFarm = true;
    quest_reached.doNuns = true;
    quest_reached.doOrchard = true;
    if (enemies_defeated >= 64) {
      quest_reached.doLighthouse = true;
    }
    if (enemies_defeated >= 192) {
      quest_reached.doJunkyard = true;
    }
    if (enemies_defeated >= 458) {
      quest_reached.doArena = true;
    }
  }
  //should we wait for a sidequest to be done first before clearing out the battlefield?
  const wait_for_arena: boolean =
    !quest_done.doArena && quest_planned.doArena && quest_reached.doArena;
  const wait_for_junkyard: boolean =
    !quest_done.doJunkyard &&
    quest_planned.doJunkyard &&
    quest_reached.doJunkyard;
  const wait_for_lighthouse: boolean =
    !quest_done.doLighthouse &&
    quest_planned.doLighthouse &&
    quest_reached.doLighthouse;
  const wait_for_orchard: boolean =
    !quest_done.doOrchard && quest_planned.doOrchard && quest_reached.doOrchard;
  const wait_for_nuns: boolean =
    !quest_done.doNuns && quest_planned.doNuns && quest_reached.doNuns;
  const wait_for_farm: boolean =
    !quest_done.doFarm && quest_planned.doFarm && quest_reached.doFarm;
  if (
    wait_for_arena ||
    wait_for_junkyard ||
    wait_for_lighthouse ||
    wait_for_orchard ||
    wait_for_nuns ||
    wait_for_farm
  ) {
    return false; //we are waiting for a sidequest to finish first
  }

  if (enemies_defeated < 64 && auto_is_valid($item`stuffing fluffer`)) {
    if (
      itemAmount($item`stuffing fluffer`) === 0 &&
      itemAmount($item`cashew`) >= 3
    ) {
      create(1, $item`stuffing fluffer`);
    }
    if (
      itemAmount($item`stuffing fluffer`) === 0 &&
      itemAmount($item`cornucopia`) > 0 &&
      auto_is_valid($item`cornucopia`)
    ) {
      return use(1, $item`cornucopia`);
    }
    if (itemAmount($item`stuffing fluffer`) > 0) {
      auto_log_info(
        "Detonating a [Stuffing Fluffer] which should kill 36-46 soldiers on each side.",
        "blue",
      );
      return use(1, $item`stuffing fluffer`);
    }
  }

  auto_log_info("Doing the wars.", "blue");
  equipWarOutfit();
  return warAdventure();
}

export function L12_finalizeWar(): boolean {
  if (in_koe()) {
    return L12_koe_finalizeWar();
  }
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }

  if (
    toInt(getProperty("hippiesDefeated")) < 1000 &&
    toInt(getProperty("fratboysDefeated")) < 1000
  ) {
    return false;
  }

  if (wildfire_warboss_check()) {
    return false;
  }
  if (robot_delay("outfit3")) {
    return false;
  }
  if (is_professor()) {
    return false; //need to wait until werewolf because can't survive combat long enough as a Prof
  }

  if (possessOutfit$1("War Hippy Fatigues")) {
    auto_log_info("Getting dimes.", "blue");
    if (in_wereprof()) {
      //Need to manually equip because professor
      if (!haveEquipped($item`bullet-proof corduroys`)) {
        equip($item`bullet-proof corduroys`);
      }
      if (!haveEquipped($item`round purple sunglasses`)) {
        equip($item`round purple sunglasses`);
      }
      if (!haveEquipped($item`reinforced beaded headband`)) {
        equip($item`reinforced beaded headband`);
      }
    } else {
      outfit("War Hippy Fatigues");
    }
    for (const it of $items`PADL Phone, red class ring, blue class ring, white class ring`) {
      sell(it.buyer, itemAmount(it), it);
    }
    for (const it of $items`beer helmet, distressed denim pants, bejeweled pledge pin`) {
      sell(it.buyer, itemAmount(it) - 1, it);
    }
    if (isActuallyEd()) {
      for (const it of $items`kick-ass kicks, perforated battle paddle, bottle opener belt buckle, keg shield, giant foam finger, war tongs, energy drink IV, Elmley shades, beer bong`) {
        sell(it.buyer, itemAmount(it), it);
      }
    }
  }
  if (possessOutfit$1("Frat Warrior Fatigues")) {
    auto_log_info("Getting quarters.", "blue");
    if (in_wereprof()) {
      //Need to manually equip because professor
      if (!haveEquipped($item`beer helmet`)) {
        equip($item`beer helmet`);
      }
      if (!haveEquipped($item`distressed denim pants`)) {
        equip($item`distressed denim pants`);
      }
      if (!haveEquipped($item`bejeweled pledge pin`)) {
        equip($item`bejeweled pledge pin`);
      }
    } else {
      outfit("Frat Warrior Fatigues");
    }
    for (const it of $items`pink clay bead, purple clay bead, green clay bead, communications windchimes`) {
      sell(it.buyer, itemAmount(it), it);
    }
    for (const it of $items`bullet-proof corduroys, round purple sunglasses, reinforced beaded headband`) {
      sell(it.buyer, itemAmount(it) - 1, it);
    }
    if (isActuallyEd()) {
      for (const it of $items`hippy protest button, Lockenstock™ sandals, didgeridooka, wicker shield, oversized pipe, fire poi, Gaia beads, hippy medical kit, flowing hippy skirt, round green sunglasses`) {
        sell(it.buyer, itemAmount(it), it);
      }
    }
  }
  // Just in case we need the extra turngen to complete this day
  if (in_darkGyffte()) {
    const have_1: number =
      itemAmount($item`Monstar energy beverage`) +
      itemAmount($item`carbonated soy milk`);
    if (have_1 < 5) {
      let need: number = 5 - have_1;
      if (!toBoolean(getProperty("auto_hippyInstead"))) {
        need = min(need, $coinmaster`Quartersmaster`.availableTokens / 3);
        cliExecute(`make ${need} Monstar energy beverage`);
      } else {
        need = min(need, $coinmaster`Dimemaster`.availableTokens / 3);
        cliExecute(`make ${need} carbonated soy milk`);
      }
    }
  }

  const have: number =
    itemAmount($item`filthy poultice`) + itemAmount($item`gauze garter`);
  if (have < 10 && !isActuallyEd()) {
    let need: number = 10 - have;
    if (!toBoolean(getProperty("auto_hippyInstead"))) {
      need = min(need, $coinmaster`Quartersmaster`.availableTokens / 2);
      cliExecute(`make ${need} gauze garter`);
    } else {
      need = min(need, $coinmaster`Dimemaster`.availableTokens / 2);
      cliExecute(`make ${need} filthy poultice`);
    }
  }

  if (possessOutfit$1("War Hippy Fatigues")) {
    if (in_wereprof()) {
      //Need to manually equip because professor
      if (!haveEquipped($item`bullet-proof corduroys`)) {
        equip($item`bullet-proof corduroys`);
      }
      if (!haveEquipped($item`round purple sunglasses`)) {
        equip($item`round purple sunglasses`);
      }
      if (!haveEquipped($item`reinforced beaded headband`)) {
        equip($item`reinforced beaded headband`);
      }
    }
    while ($coinmaster`Dimemaster`.availableTokens >= 5) {
      cliExecute(
        `make ${$coinmaster`Dimemaster`.availableTokens / 5} fancy seashell necklace`,
      );
    }
    while ($coinmaster`Dimemaster`.availableTokens >= 2) {
      cliExecute(
        `make ${$coinmaster`Dimemaster`.availableTokens / 2} filthy poultice`,
      );
    }
    while ($coinmaster`Dimemaster`.availableTokens >= 1) {
      cliExecute(
        `make ${$coinmaster`Dimemaster`.availableTokens} water pipe bomb`,
      );
    }
  }

  if (possessOutfit$1("Frat Warrior Fatigues")) {
    if (in_wereprof()) {
      //Need to manually equip because professor
      if (!haveEquipped($item`beer helmet`)) {
        equip($item`beer helmet`);
      }
      if (!haveEquipped($item`distressed denim pants`)) {
        equip($item`distressed denim pants`);
      }
      if (!haveEquipped($item`bejeweled pledge pin`)) {
        equip($item`bejeweled pledge pin`);
      }
    }
    while ($coinmaster`Quartersmaster`.availableTokens >= 5) {
      cliExecute(
        `make ${$coinmaster`Quartersmaster`.availableTokens / 5} commemorative war stein`,
      );
    }
    while ($coinmaster`Quartersmaster`.availableTokens >= 2) {
      cliExecute(
        `make ${$coinmaster`Quartersmaster`.availableTokens / 2} gauze garter`,
      );
    }
    while ($coinmaster`Quartersmaster`.availableTokens >= 1) {
      cliExecute(
        `make ${$coinmaster`Quartersmaster`.availableTokens} beer bomb`,
      );
    }
  }

  if (myMp() < 40) {
    // fyi https://kol.coldfront.net/thekolwiki/index.php/Chateau_Mantegna states you wont get pantsgiving benefits resting there (presumably campsite as well)
    // so not sure this is doing much
    if (possessEquipment($item`Pantsgiving`)) {
      equip($item`Pantsgiving`);
    }
    doRest();
  }
  equipWarOutfit();
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$3($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$3($effect`Tricky Timpani`, 30, 1, 10);
  }
  // AMW buff
  if (in_amw()) {
    buffMaintain$3($effect`Stewing`, 0, 1, 10);
  }
  acquireHP();
  auto_log_info("Let's fight the boss!", "blue");

  const bossFight: Location = $location`Noob Cave`;

  if (auto_have_familiar($familiar`Machine Elf`)) {
    handleFamiliar$1($familiar`Machine Elf`);
  }
  const pages: Map<number, string> = new Map();
  pages.set(0, "bigisland.php?place=camp&whichcamp=1");
  pages.set(1, "bigisland.php?place=camp&whichcamp=2");
  pages.set(2, "bigisland.php?action=bossfight&pwd");
  if (!autoAdvBypass(0, pages, bossFight, null)) {
    auto_log_warning("Boss already defeated, ignoring", "red");
  }

  if (in_pokefam()) {
    visitUrl("island.php");
    council();
  }

  cliExecute("refresh quests");
  if (internalQuestStatus("questL12War") === 1) {
    abort("Failing to complete the war.");
  }
  council();
  return true;
}

export function L12_islandWar(): boolean {
  if (
    internalQuestStatus("questL12War") === 0 &&
    toInt(getProperty("lastIslandUnlock")) !== myAscensions()
  ) {
    return LX_islandAccess();
  }
  if (robot_delay("outfit")) {
    return false; //delay for You, Robot path
  }
  if (getProperty("auto_delayWar") === true.toString()) {
    setProperty("auto_delayWar", false.toString());
    return false; //delay war at Nuns so we can maybe get the Inhaler
  }
  if (L12_preOutfit() || L12_getOutfit() || L12_startWar()) {
    return true;
  }
  if (
    L12_filthworms() ||
    L12_orchardFinalize() ||
    L12_gremlins() ||
    L12_flyerFinish() ||
    L12_sonofaBeach() ||
    L12_sonofaFinish() ||
    L12_themtharHills() ||
    L12_farm()
  ) {
    return true;
  }
  if (L12_clearBattlefield() || L12_finalizeWar()) {
    return true;
  }
  return false;
}

export function L12_opportunisticWarStart(): boolean {
  // If we have all the resources to start the war in one turn, do that.
  if (internalQuestStatus("questL12War") !== 0) {
    return false;
  }
  if (!haveWarOutfit(true)) {
    return false;
  }
  if (!L12_singleNCForWarStart()) {
    return false;
  }
  if (remainingNCForcesToday() === 0) {
    return false;
  }
  // Dinghy the island if we can.
  if (toInt(getProperty("lastIslandUnlock")) !== myAscensions()) {
    if (availableAmount($item`pirate dinghy`) > 0) {
      use($item`pirate dinghy`);
    }
  }
  if (toInt(getProperty("lastIslandUnlock")) !== myAscensions()) {
    return false;
  }
  return L12_startWar();
}

function L12_singleNCForWarStart(): boolean {
  return auto_haveCCSC() || haveSkill($skill`Comprehensive Cartography`);
}
