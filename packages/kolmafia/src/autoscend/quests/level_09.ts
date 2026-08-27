import {
  availableAmount,
  blackMarketAvailable,
  buy,
  canadiaAvailable,
  cliExecute,
  closetAmount,
  containsText,
  council,
  creatableAmount,
  create,
  Element,
  Familiar,
  floor,
  friarsAvailable,
  handlingChoice,
  haveEffect,
  haveSkill,
  inHardcore,
  Item,
  itemAmount,
  itemDropModifier,
  lastChoice,
  Location,
  min,
  monsterLevelAdjustment,
  myBjornedFamiliar,
  myHash,
  myHp,
  myLevel,
  myMaxhp,
  myMeat,
  myMp,
  myServant,
  myTurncount,
  npcPrice,
  numericModifier,
  squareRoot,
  takeCloset,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $monster,
  $servant,
  $skill,
  $slot,
  get,
  set,
} from "libram";

import { resetState } from "../../autoscend";
import {
  AutoAsdonMartin,
  Autumnaton,
  BatWings,
  BeachComb,
  Bjorn,
  CamelSpit,
  Cartography,
  CrownOfEd,
  GreyGoose,
  JanuaryTote,
  MayamCalendar,
  MonkeyPaw,
  SeptEmberCenser,
  SwordOfSwords,
  TrainSet,
} from "../../types";
import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv, autoLuckyAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import { handleChoiceAdv as handleChoiceAdv } from "../auto_choice_adv";
import {
  autoEquip,
  autoEquipToSlot,
  autoForceEquip$3,
  equipMaximizedGear,
  equipStatgainIncreasers$2,
  possessEquipment,
  resetMaximize,
  simMaximizeWith,
  simValue,
} from "../auto_equipment";
import {
  auto_famModifiers$2,
  auto_have_familiar,
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar$1,
} from "../auto_familiar";
import { disregardInstantKarma, isAboutToPowerlevel } from "../auto_powerlevel";
import {
  provideInitiative,
  provideItem$2,
  provideResistances,
} from "../auto_providers";
import { acquireFullHP, acquireMP, uneffect } from "../auto_restore";
import { auto_waitForDay2 } from "../auto_routing";
import {
  adjustForYellowRayIfPossible,
  auto_abort,
  auto_convertDesiredML,
  auto_ignoreExperience,
  auto_inRonin,
  auto_is_valid,
  auto_is_valid$3,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_MaxMLToCap,
  autoMaximize$1,
  cloversAvailable,
  elemental_resist_value,
  internalQuestStatus,
  isGuildClass,
  loopHandler,
  safeGet,
  setFlavour,
} from "../auto_util";
import { auto_canUse } from "../combat/auto_combat_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { in_bhy } from "../paths/2011/bees_hate_you";
import { kolhs_mandatorySchool } from "../paths/2013/kolhs";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_gnoob } from "../paths/2017/gelatinous_noob";
import { in_glover } from "../paths/2018/g_lover";
import { bat_formMist, in_darkGyffte } from "../paths/2019/dark_gyffte";
import { in_koe } from "../paths/2019/kingdom_of_exploathing";
import { in_plumber } from "../paths/2020/path_of_the_plumber";
import { in_quantumTerrarium } from "../paths/2021/quantum_terrarium";
import { robot_delay } from "../paths/2021/you_robot";
import { in_avantGuard } from "../paths/2024/avant_guard";
import { is_professor, is_werewolf } from "../paths/2024/wereprofessor";
import { Maximizer, maximizer } from "../utils/maximizer";
import { shenShouldDelayZone } from "./level_11";

//Defined in autoscend/quests/level_09.ash
function LX_loggingHatchetDo(): boolean {
  auto_log_info("Acquiring the logging hatchet from Camp Logging Camp", "blue");
  autoAdv($location`Camp Logging Camp`);
  return true;
}

export const LX_loggingHatchetTask: QuestTask = registerQuestTask({
  name: "LX_loggingHatchet",
  completed: () =>
    availableAmount($item`logging hatchet`) > 0 ||
    (!canadiaAvailable() &&
      (get("moonTuned") ||
        !possessEquipment($item`hewn moon-rune spoon`) ||
        !auto_is_valid($item`hewn moon-rune spoon`))) ||
    internalQuestStatus("questL09Topping") > 0 ||
    get("chasmBridgeProgress") >= bridgeGoal(),
  ready: () =>
    canadiaAvailable() &&
    // avoid infinite loop in kolhs. we can not get the hatchet until we finish mandatory school for the day
    !kolhs_mandatorySchool() &&
    availableAmount($item`logging hatchet`) === 0 &&
    $location`Camp Logging Camp`.turnsSpent === 0 &&
    $location`Camp Logging Camp`.combatQueue === "" &&
    $location`Camp Logging Camp`.noncombatQueue === "",
  do: LX_loggingHatchetDo,
  locations: $location`Camp Logging Camp`,
});

export function LX_loggingHatchet(): boolean {
  return runQuestTask(LX_loggingHatchetTask);
}

function L9_leafletQuestDo(): boolean {
  //get a [strange leaflet]
  if (closetAmount($item`strange leaflet`) > 0) {
    takeCloset(1, $item`strange leaflet`);
  }
  if (availableAmount($item`strange leaflet`) === 0) {
    council();
    if (itemAmount($item`strange leaflet`) === 0) {
      auto_log_debug(
        "Tried to grab a [strange leaflet] from the council and it did not work... This needs fixing. skipping for now.",
      );
      return false;
    }
  }

  auto_log_info("Got a leaflet to do", "blue");
  if (disregardInstantKarma() && !auto_ignoreExperience()) {
    //checks a user setting as well as current level
    equipStatgainIncreasers$2();
    cliExecute("leaflet"); //also gain +200 substats for each stat
    if (get("leafletCompleted")) {
      set("auto_leaflet_done", true);
    }
  } else {
    cliExecute("leaflet nomagic"); //no substat gains
    set("auto_leaflet_done", true); // we're done here even with no stats
  }

  return get("leafletCompleted");
}

export const L9_leafletQuestTask: QuestTask = registerQuestTask({
  name: "L9_leafletQuest",
  completed: () => get("leafletCompleted") || get("auto_leaflet_done", false),
  ready: () =>
    myLevel() >= 9 &&
    !isActuallyEd() &&
    !in_koe() &&
    !get("leafletCompleted") &&
    !get("auto_leaflet_done", false),
  do: L9_leafletQuestDo,
});

export function L9_leafletQuest(): boolean {
  return runQuestTask(L9_leafletQuestTask);
}

function L9_chasmMaximizeForNoncombat(): void {
  auto_log_info("Let's assess our scores for blech house", "blue");
  let best: string = "mus";
  const loc: Location = $location`The Smut Orc Logging Camp`;
  const mustry = (m: Maximizer): void => {
    m.weight($modifier`Muscle`, 1000)
      .weight($modifier`Weapon Damage`, 1000)
      .weight($modifier`Weapon Damage Percent`, 10000);
  };
  const mystry = (m: Maximizer): void => {
    m.weight($modifier`Mysticality`, 1000)
      .weight($modifier`Spell Damage`, 1000)
      .weight($modifier`Spell Damage Percent`, 10000);
  };
  const moxtry = (m: Maximizer): void => {
    m.weight($modifier`Moxie`, 1000).weight(
      $modifier`Sleaze Resistance`,
      10000,
    );
  };
  simMaximizeWith(mustry, loc);
  const musmus: number = simValue($modifier`Buffed Muscle`);
  const musflat: number = simValue($modifier`Weapon Damage`); //incorrectly includes 15% weapon power
  const musperc: number = simValue($modifier`Weapon Damage Percent`);
  const musscore: number = floor(
    squareRoot(((musmus + musflat) / 15) * (1 + musperc / 100)),
  );
  auto_log_info(`Muscle score: ${musscore}`, "blue");
  simMaximizeWith(mystry, loc);
  const mysmys: number = simValue($modifier`Buffed Mysticality`);
  const mysflat: number = simValue($modifier`Spell Damage`);
  const mysperc: number = simValue($modifier`Spell Damage Percent`);
  const mysscore: number = floor(
    squareRoot(((mysmys + mysflat) / 15) * (1 + mysperc / 100)),
  );
  auto_log_info(`Mysticality score: ${mysscore}`, "blue");
  if (mysscore >= musscore) {
    //overwrite equal muscle score if possible because it may be 1 lower than predicted due to the above weapon damage issue
    best = "mys";
  }
  simMaximizeWith(moxtry, loc);
  const moxmox: number = simValue($modifier`Buffed Moxie`);
  const moxres: number = simValue($modifier`Sleaze Resistance`);
  const moxscore: number = floor(
    squareRoot((moxmox / 30) * (1 + moxres * 0.69)),
  );
  auto_log_info(`Moxie score: ${moxscore}`, "blue");
  if (moxscore >= mysscore && moxscore >= musscore) {
    best = "mox";
  }
  switch (best) {
    case "mus":
      maximizer
        .weight($modifier`Muscle`, 1000)
        .weight($modifier`Weapon Damage`, 1000)
        .weight($modifier`Weapon Damage Percent`, 10000);
      set("choiceAdventure1345", 1);
      break;
    case "mys":
      maximizer
        .weight($modifier`Mysticality`, 1000)
        .weight($modifier`Spell Damage`, 1000)
        .weight($modifier`Spell Damage Percent`, 10000);
      set("choiceAdventure1345", 2);
      break;
    case "mox":
      maximizer
        .weight($modifier`Moxie`, 1000)
        .weight($modifier`Sleaze Resistance`, 10000);
      set("choiceAdventure1345", 3);
      break;
  }
}

export function bridgeGoal(): number {
  return !BatWings.auto_haveBatWings() ? 30 : 25;
}

export function fastenerCount(): number {
  let base: number = get("chasmBridgeProgress");
  base = base + itemAmount($item`thick caulk`);
  base = base + itemAmount($item`long hard screw`);
  base = base + itemAmount($item`messy butt joint`);
  base = base + 5 * itemAmount($item`smut orc keepsake box`);

  return base;
}

export function lumberCount(): number {
  let base: number = get("chasmBridgeProgress");
  base = base + itemAmount($item`morningwood plank`);
  base = base + itemAmount($item`raging hardwood plank`);
  base = base + itemAmount($item`weirdwood plank`);
  base = base + 5 * itemAmount($item`smut orc keepsake box`);

  return base;
}

export function L9_swordWantsChasmMonster(): boolean {
  if (!SwordOfSwords.auto_swordIsWillingToSwitchTargets()) return false;

  return (
    SwordOfSwords.auto_swordFamiliarWantsMonsterDrops(
      $monster`smut orc pipelayer`,
      100,
    ) ||
    SwordOfSwords.auto_swordFamiliarWantsMonsterDrops(
      $monster`smut orc jacker`,
      100,
    )
  );
}

function finishBuildingSmutOrcBridgeDo(): boolean {
  // use any keepsake boxes we have
  const keepsakeBox: Item = $item`smut orc keepsake box`;
  if (itemAmount(keepsakeBox) > 0 && auto_is_valid(keepsakeBox)) {
    use(itemAmount(keepsakeBox), keepsakeBox);
  }
  // make sure our progress count is correct before we do anything.
  visitUrl(
    `place.php?whichplace=orc_chasm&action=bridge${get("chasmBridgeProgress")}`,
  );
  // finish chasm if we can
  if (BatWings.auto_canLeapBridge()) {
    autoForceEquip$3($item`bat wings`);
    visitUrl("place.php?whichplace=orc_chasm&action=bridge_jump");
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    return true;
  }
  if (get("chasmBridgeProgress") >= 30) {
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    return true;
  }

  return false;
}

export const finishBuildingSmutOrcBridgeTask: QuestTask = registerQuestTask({
  name: "finishBuildingSmutOrcBridge",
  completed: () =>
    internalQuestStatus("questL09Topping") > 0 ||
    get("chasmBridgeProgress") >= bridgeGoal(),
  ready: () =>
    internalQuestStatus("questL09Topping") === 0 &&
    lumberCount() >= bridgeGoal() &&
    fastenerCount() >= bridgeGoal(),
  do: finishBuildingSmutOrcBridgeDo,
});

export function finishBuildingSmutOrcBridge(): boolean {
  return runQuestTask(finishBuildingSmutOrcBridgeTask);
}

export function prepareForSmutOrcs(): void {
  if (lumberCount() >= bridgeGoal() && fastenerCount() >= bridgeGoal()) {
    // must be here for shen snake and quest objective is already done
    // set blech NC and don't bother prepping for the zone
    auto_log_info(
      "Adventuring at Smut Orc Logging Camp when quest is done. Skipping preparing to maximize zone progress.",
      "blue",
    );
    set("choiceAdventure1345", 1);
    return;
  }
  // -Combat is useless here since NC is triggered by killing Orcs...So we kill orcs better!
  // -ML helps us deal more cold damage and trigger the NC faster.
  AutoAsdonMartin.asdonBuff($effect`Driving Intimidatingly`);
  // Check our Load out to see if spells are the best option for Orc-Thumping
  if (isGuildClass()) {
    // This only applies to classes which can use perm'd skills,
    // so let's not waste time and console spam when we're a class or path that can't do any of this.
    let useSpellsInOrcCamp: boolean = false;

    acquireMP(32, 0); //pre_adv will always do this later, but waiting for it may fail checks of ability to cast spells here
    if (
      setFlavour($element`cold`) &&
      auto_canUse($skill`Stuffed Mortar Shell`)
    ) {
      useSpellsInOrcCamp = true;
    }

    if (
      setFlavour($element`cold`) &&
      auto_canUse($skill`Cannelloni Cannon`, false)
    ) {
      useSpellsInOrcCamp = true;
    }

    if (auto_canUse($skill`Saucegeyser`, false)) {
      useSpellsInOrcCamp = true;
    }

    if (auto_canUse($skill`Saucecicle`, false)) {
      useSpellsInOrcCamp = true;
    }
    // Always Maximize and choose our default Non-Com First, in case we are wrong about the non-com we MAY have some gear still equipped to help us.
    if (useSpellsInOrcCamp === true) {
      auto_log_info("Preparing to Blast Orcs with Cold Spells!", "blue");
      maximizer
        .weight($modifier`Mysticality`)
        .weight($modifier`Spell Damage`, 40)
        .weight($modifier`Spell Damage Percent`, 80)
        .weight($modifier`Cold Spell Damage`, 40)
        .weight($modifier`Monster Level`, -1000);
      buffMaintain$2($effect`Carol of the Hells`, 50, 1, 1);
      buffMaintain$2($effect`Song of Sauce`, 150, 1, 1);

      auto_log_info(
        "If we encounter Blech House when we are not expecting it we will stop.",
        "blue",
      );
      auto_log_info(
        "Currently setup for Myst/Spell Damage, option 2: Blast it down with a spell",
        "blue",
      );
      set("choiceAdventure1345", 0);
    } else {
      auto_log_info("Preparing to Ice-Punch Orcs!", "blue");
      maximizer
        .weight($modifier`Muscle`)
        .weight($modifier`Weapon Damage`, 40)
        .weight($modifier`Weapon Damage Percent`, 60)
        .weight($modifier`Cold Damage`, 40)
        .weight($modifier`Monster Level`, -1000);
      buffMaintain$2($effect`Carol of the Bulls`, 50, 1, 1);
      buffMaintain$2($effect`Song of the North`, 150, 1, 1);

      auto_log_info(
        "If we encounter Blech House when we are not expecting it we will stop.",
        "blue",
      );
      auto_log_info(
        "Currently setup for Muscle/Weapon Damage, option 1: Kick it down",
        "blue",
      );
      set("choiceAdventure1345", 0);
    }
  }
  // This adds a tonne of damage and NC progress
  buffMaintain$2($effect`Triple-Sized`);

  if (get("smutOrcNoncombatProgress") === 15) {
    // If we think the non-com will hit NOW we clear maximizer to keep previous settings from carrying forward
    resetMaximize();

    auto_log_info("The smut orc noncombat is about to hit...");
    // This is a hardcoded patch for Dark Gyffte
    // TODO: once explicit formulas are spaded, use simulated maximizer
    // to determine best approach.
    L9_chasmMaximizeForNoncombat();
    return;
  }

  if (in_plumber() && possessEquipment($item`frosty button`)) {
    autoEquip($item`frosty button`);
  }

  if (inHardcore()) {
    if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
      if (
        !haveSkill($skill`Powerful Vocal Chords`) &&
        itemAmount($item`baby oil shooter`) === 0
      ) {
        handleFamiliar$1($familiar`Robortender`);
      }
    }

    if (fastenerCount() < bridgeGoal()) {
      autoEquip($item`loadstone`);
    }
    if (lumberCount() < bridgeGoal()) {
      autoEquip($item`logging hatchet`);
    }

    return;
  }

  let need: number = (bridgeGoal() - get("chasmBridgeProgress")) / 5;
  if (need > 0) {
    while (need > 0 && itemAmount($item`snow berries`) >= 2) {
      cliExecute("make 1 snow boards");
      need = need - 1;
      visitUrl(
        `place.php?whichplace=orc_chasm&action=bridge${get("chasmBridgeProgress")}`,
      );
    }
  }

  if (get("chasmBridgeProgress") < bridgeGoal()) {
    if (fastenerCount() < bridgeGoal()) {
      autoEquip($item`loadstone`);
    }
    if (lumberCount() < bridgeGoal()) {
      autoEquip($item`logging hatchet`);
    }

    return;
  }
}

function L9_chasmBuildDo(): boolean {
  if (finishBuildingSmutOrcBridge()) {
    return true;
  }

  if (safeGet("auto_familiarChoice") !== $familiar`Sword of S Words`) {
    if (
      auto_inRonin() ||
      MayamCalendar.auto_haveMayamCalendar() ||
      SeptEmberCenser.auto_haveSeptEmberCenser()
    ) {
      if (auto_waitForDay2()) {
        auto_log_debug("Delaying Logging Camp waiting for day 2.");
        return false;
      }
    }

    if (
      Math.min(fastenerCount(), lumberCount()) < bridgeGoal() &&
      SwordOfSwords.auto_copierShouldDelayZone(
        $locations`The Smut Orc Logging Camp`,
      )
    ) {
      auto_log_debug("Delaying L9 Chasm - still farming a copier target.");
      return false;
    }

    if (
      shenShouldDelayZone($location`The Smut Orc Logging Camp`) &&
      (TrainSet.auto_haveTrainSet() ||
        !SwordOfSwords.auto_haveSwordFamiliar() ||
        !SwordOfSwords.auto_swordIsWillingToSwitchTargets() ||
        in_quantumTerrarium() ||
        !canChangeToFamiliar($familiar`Sword of S Words`))
    ) {
      auto_log_debug("Delaying Logging Camp in case of Shen.");
      return false;
    }
    if (robot_delay("chasm")) {
      return false; //delay for You, Robot path
    }
    if (
      Autumnaton.auto_hasAutumnaton() &&
      !isAboutToPowerlevel() &&
      $location`The Smut Orc Logging Camp`.turnsSpent > 0 &&
      (fastenerCount() < bridgeGoal() || lumberCount() < bridgeGoal())
    ) {
      // delay zone to allow autumnaton to grab bridge parts
      // unless we have ran out of other stuff to do
      return false;
    }

    if (LX_loggingHatchet()) {
      // turn free, might save some adventures. May as well get it if we can.
      return true;
    }
  }

  auto_log_info("Chasm time", "blue");
  // prepareForSmutOrcs() called in pre-adv
  autoAdv($location`The Smut Orc Logging Camp`);

  return true;
}

export const L9_chasmBuildTask: QuestTask = registerQuestTask({
  name: "L9_chasmBuild",
  completed: () =>
    internalQuestStatus("questL09Topping") > 0 ||
    get("chasmBridgeProgress") >= bridgeGoal(),
  ready: () =>
    internalQuestStatus("questL09Topping") === 0 &&
    get("chasmBridgeProgress") < bridgeGoal(),
  do: L9_chasmBuildDo,
  locations: $location`The Smut Orc Logging Camp`,
  desiredEncounters: () => {
    const fastenerNeed: number = bridgeGoal() - fastenerCount();
    const lumberNeed: number = bridgeGoal() - lumberCount();
    return [
      { item: $item`thick caulk`, needAmount: fastenerNeed },
      { item: $item`long hard screw`, needAmount: fastenerNeed },
      { item: $item`messy butt joint`, needAmount: fastenerNeed },
      { item: $item`morningwood plank`, needAmount: lumberNeed },
      { item: $item`raging hardwood plank`, needAmount: lumberNeed },
      { item: $item`weirdwood plank`, needAmount: lumberNeed },
      {
        item: $item`smut orc keepsake box`,
        needAmount: Math.ceil(Math.max(fastenerNeed, lumberNeed) / 5),
      },
    ];
  },
});

export function L9_chasmBuild(): boolean {
  return runQuestTask(L9_chasmBuildTask);
}

export function L9_aBooPeakWorthBurningLuckOn(): boolean {
  if (in_bhy() || is_professor() || in_glover()) {
    return false;
  }
  if (
    internalQuestStatus("questL09Topping") < 2 ||
    internalQuestStatus("questL09Topping") > 3
  ) {
    return false;
  }
  const clueAmt: number =
    itemAmount($item`A-Boo clue`) + (get("auto_abooclover", false) ? 1 : 0);

  const progressLeft: number = get("booPeakProgress");

  // If we would not finish it in 3 fights, 2 would effectively be a clue + adv after all.
  if (clueAmt * 30 + 6 >= progressLeft) {
    return false;
  }

  if (containsText(visitUrl("place.php?whichplace=highlands"), "fire1.gif")) {
    return false;
  }

  return true;
}

function L9_aBooPeakDo(): boolean {
  if (SwordOfSwords.auto_copierShouldDelayZone($locations`A-Boo Peak`)) {
    auto_log_debug("Delaying L9 A-Boo Peak - still farming a copier target.");
    return false;
  }
  if (containsText(visitUrl("place.php?whichplace=highlands"), "fire1.gif")) {
    return false;
  }

  let clue: Item = $item`A-Boo clue`;
  if (in_glover()) {
    if (itemAmount($item`A-Boo glue`) > 0 && itemAmount(clue) > 0) {
      use(1, $item`A-Boo glue`);
    }
    clue = $item`glued A-Boo clue`;
  }
  const clueAmt: number =
    itemAmount(clue) + (get("auto_aboopending", 0) !== 0 ? 1 : 0);

  if (is_professor() && clueAmt >= 3) {
    return false; // We have clues but we can't survive them so not worth trying when we only have 1 hp
  }

  if (clueAmt * 30 < get("booPeakProgress")) {
    auto_log_info(`A-Boo Peak (initial): ${get("booPeakProgress")}`, "blue");

    // If a clue would speed things up
    if (clueAmt * 30 + 4 < get("booPeakProgress")) {
      // boo clues have 15% drop
      provideItem$2(567, $location`A-Boo Peak`, false);
    }

    return autoAdv($location`A-Boo Peak`);
  }

  let booCloversOk: boolean = false;
  if (cloversAvailable() > 0) {
    if (in_glover()) {
      if (itemAmount($item`A-Boo glue`) > 0) {
        booCloversOk = true;
      }
    } else if (in_bhy()) {
      // bees hate clues, don't waste clovers on them
      booCloversOk = false;
    } else {
      booCloversOk = true;
    }
  }

  if (get("auto_abooclover", false) && clueAmt >= get("booPeakProgress") / 30) {
    // if you get lucky/have enough item drop to get 3 clues while getting to 90% haunted, don't waste a clover getting more.
    auto_log_info(
      "We have enough A-boo clues to clear the peak, lets not waste a clover",
    );
    set("auto_abooclover", false);
  }

  auto_log_info(`A-Boo Peak: ${get("booPeakProgress")}`, "blue");
  const clueCheck: boolean = clueAmt > 0;
  if (
    get("auto_abooclover", false) &&
    get("booPeakProgress") >= 30 &&
    booCloversOk
  ) {
    if (autoLuckyAdv($location`A-Boo Peak`)) {
      set("auto_abooclover", false);
      return true;
    }
  } else if (clueCheck && get("booPeakProgress") > 2) {
    let doThisBoo: boolean = false;

    const priorBjorn: Familiar = myBjornedFamiliar();

    const allowResistanceFamiliarSwitches = (m: Maximizer): void => {
      if (!canChangeFamiliar() || in_avantGuard()) {
        return;
      }
      m.allowSwitch($familiar`Exotic Parrot`)
        .allowSwitch($familiar`Mu`)
        .allowSwitch($familiar`Trick-or-Treating Tot`);
    };

    autoMaximize$1(
      (m) => {
        m.weight($modifier`Spooky Resistance`)
          .weight($modifier`Cold Resistance`)
          .weight($modifier`Maximum HP`, 0.01)
          .exclude($item`Snow Suit`);
        if (
          isActuallyEd() &&
          possessEquipment($item`The Crown of Ed the Undying`)
        ) {
          m.exclude($item`lihc face`);
        }
        allowResistanceFamiliarSwitches(m);
      },
      0,
      0,
      true,
    );
    let coldResist: number = toInt(simValue($modifier`Cold Resistance`));
    let spookyResist: number = toInt(simValue($modifier`Spooky Resistance`));
    const hpDifference: number = toInt(
      simValue($modifier`Maximum HP`) - numericModifier($modifier`Maximum HP`),
    );
    let effectiveCurrentHP: number = myHp();
    //	Do we need to manually adjust for the parrot?

    if (
      blackMarketAvailable() &&
      itemAmount($item`can of black paint`) === 0 &&
      haveEffect($effect`Red Door Syndrome`) === 0 &&
      myMeat() >= npcPrice($item`can of black paint`) &&
      !is_werewolf()
    ) {
      auto_buyUpTo(1, $item`can of black paint`);
      coldResist += 2;
      spookyResist += 2;
    } else if (
      itemAmount($item`can of black paint`) > 0 &&
      haveEffect($effect`Red Door Syndrome`) === 0
    ) {
      coldResist += 2;
      spookyResist += 2;
    }

    if (0 === haveEffect($effect`Mist Form`)) {
      if (haveSkill($skill`Mist Form`)) {
        coldResist += 4;
        spookyResist += 4;
        effectiveCurrentHP -= 10;
      } else if (
        haveSkill($skill`Spectral Awareness`) &&
        0 === haveEffect($effect`Spectral Awareness`)
      ) {
        coldResist += 2;
        spookyResist += 2;
        effectiveCurrentHP -= 10;
      }
    }

    if (
      itemAmount($item`spooky powder`) > 0 &&
      haveEffect($effect`Spookypants`) === 0
    ) {
      spookyResist = spookyResist + 1;
    }
    if (
      itemAmount($item`ectoplasmic orbs`) > 0 &&
      haveEffect($effect`Balls of Ectoplasm`) === 0
    ) {
      spookyResist = spookyResist + 1;
    }
    if (
      itemAmount($item`black eyedrops`) > 0 &&
      haveEffect($effect`Hyphemariffic`) === 0
    ) {
      spookyResist = spookyResist + 9;
    }
    if (
      itemAmount($item`cold powder`) > 0 &&
      haveEffect($effect`Insulated Trousers`) === 0
    ) {
      coldResist = coldResist + 1;
    }
    if (BeachComb.auto_canBeachCombHead("cold")) {
      coldResist = coldResist + 3;
    }
    if (BeachComb.auto_canBeachCombHead("spooky")) {
      spookyResist = spookyResist + 3;
    }
    //Calculate how much boo peak damage does per unit resistance.
    let estimatedCold: number = toInt(
      (13 + 25 + 50 + 125 + 250) *
        ((100.0 - elemental_resist_value(coldResist)) / 100.0),
    );
    let estimatedSpooky: number = toInt(
      (13 + 25 + 50 + 125 + 250) *
        ((100.0 - elemental_resist_value(spookyResist)) / 100.0),
    );
    auto_log_info(`Current HP: ${myHp()}/${myMaxhp()}`, "blue");
    auto_log_info(
      `Expected cold damage: ${estimatedCold} Expected spooky damage: ${estimatedSpooky}`,
      "blue",
    );
    auto_log_info(
      `Expected Cold Resist: ${coldResist} Expected Spooky Resist: ${spookyResist} Expected HP Difference: ${hpDifference}`,
      "blue",
    );
    let totalDamage: number = estimatedCold + estimatedSpooky;

    if (get("booPeakProgress") <= 6) {
      estimatedCold = (estimatedCold * 38) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 38) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    } else if (get("booPeakProgress") <= 12) {
      estimatedCold = (estimatedCold * 88) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 88) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    } else if (get("booPeakProgress") <= 20) {
      estimatedCold = (estimatedCold * 213) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 213) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    }

    if (get("booPeakProgress") <= 20) {
      auto_log_info("Don't need a full A-Boo Clue, adjusting values:", "blue");
      auto_log_info(
        `Expected cold damage: ${estimatedCold} Expected spooky damage: ${estimatedSpooky}`,
        "blue",
      );
      auto_log_info(
        `Expected Cold Resist: ${coldResist} Expected Spooky Resist: ${spookyResist} Expected HP Difference: ${hpDifference}`,
        "blue",
      );
    }

    const considerHP: number = myMaxhp() + hpDifference;

    let mp_need: number = toInt(20 + simValue($modifier`Mana Cost`));
    if (myHp() - totalDamage > 50) {
      mp_need = mp_need - 20;
    }

    loopHandler(
      "_auto_lastABooConsider",
      "_auto_lastABooCycleFix",
      "We are in an A-Boo Peak cycle and can't find anything else to do. Aborting. If you have actual other quests left, please report this. Otherwise, complete A-Boo peak manually",
      15,
    );

    if (get("booPeakProgress") === 0) {
      doThisBoo = true;
    }
    if (
      min(effectiveCurrentHP, myMaxhp() + hpDifference) > totalDamage &&
      myMp() >= mp_need
    ) {
      doThisBoo = true;
    }
    if (
      considerHP >= totalDamage &&
      myMp() >= mp_need &&
      haveSkill($skill`Cannelloni Cocoon`)
    ) {
      doThisBoo = true;
    }
    //assume min bandage HP resotred to ensure we can heal enough
    if (
      considerHP >= totalDamage &&
      isActuallyEd() &&
      itemAmount($item`linen bandages`) * 20 + myHp() >= totalDamage
    ) {
      doThisBoo = true;
    }
    //do clue if it is one of the last things to do
    if (isAboutToPowerlevel() && myLevel() >= 13) {
      doThisBoo = true;
    }

    if (doThisBoo) {
      buffMaintain$2($effect`Go Get 'Em, Tiger!`);
      bat_formMist();
      if (0 === haveEffect($effect`Mist Form`)) {
        buffMaintain$2($effect`Spectral Awareness`, 10, 1, 1);
      }
      maximizer
        .weight($modifier`Spooky Resistance`, 1000)
        .weight($modifier`Cold Resistance`, 1000)
        .weight($modifier`Maximum HP`, 10);
      allowResistanceFamiliarSwitches(maximizer);
      CrownOfEd.adjustEdHat("ml");

      buffMaintain$2($effect`Astral Shell`, 10, 1, 1);
      buffMaintain$2($effect`Elemental Saucesphere`, 10, 1, 1);
      buffMaintain$2($effect`Scariersauce`, 10, 1, 1);
      buffMaintain$2($effect`Scarysauce`, 10, 1, 1);
      buffMaintain$2($effect`Spookypants`);
      buffMaintain$2($effect`Hyphemariffic`);
      buffMaintain$2($effect`Insulated Trousers`);
      buffMaintain$2($effect`Balls of Ectoplasm`);
      buffMaintain$2($effect`Red Door Syndrome`);
      buffMaintain$2($effect`Well-Oiled`);

      if (auto_is_valid$3($effect`Cold as Nice`)) {
        BeachComb.auto_beachCombHead("cold");
      }
      if (auto_is_valid$3($effect`Does It Have a Skull In There??`)) {
        BeachComb.auto_beachCombHead("spooky");
      }

      set("choiceAdventure611", "1");

      if (get("auto_aboopending", 0) === 0) {
        if (itemAmount(clue) > 0 && use(1, clue)) {
          set("auto_aboopending", myTurncount());
        }
      }
      if (canChangeToFamiliar($familiar`Trick-or-Treating Tot`)) {
        handleFamiliar$1($familiar`Trick-or-Treating Tot`);
      } else if (canChangeToFamiliar($familiar`Mu`)) {
        handleFamiliar$1($familiar`Mu`);
      } else if (canChangeToFamiliar($familiar`Exotic Parrot`)) {
        handleFamiliar$1($familiar`Exotic Parrot`);
      }
      // When booPeakProgress <= 0, we want to leave this adventure. Can we?
      // I can not figure out how to do this via ASH since the adventure completes itself?
      // However, in mafia, (src/net/sourceforge/kolmafia/session/ChoiceManager.java)
      // upon case 611, if booPeakProgress <= 0, set choiceAdventure611 to 2
      // If lastDecision was 2, revert choiceAdventure611 to 1 (or perhaps unset it?)
      try {
        autoAdv($location`A-Boo Peak`);
      } finally {
        if (get("lastEncounter") !== "The Horror...") {
          auto_log_warning(
            "Wandering adventure interrupt of A-Boo Peak, refreshing inventory.",
            "red",
          );
          cliExecute("refresh inv");
          if (
            [
              "Battlie Knight Ghost",
              "Claybender Sorcerer Ghost",
              "Dusken Raider Ghost",
              "Space Tourist Explorer Ghost",
              "Whatsian Commando Ghost",
            ].includes(get("lastEncounter"))
          ) {
            //clue usage probably failed somehow
            try {
              use(1, clue); //will not be consumed if a clue is already active
            } catch {}
          }
        } else {
          set("auto_aboopending", 0);
        }
      }
      set("_auto_forcePokefamRestore", true);
      acquireFullHP();
      if (
        myHp() * 4 < myMaxhp() &&
        itemAmount($item`scroll of drastic healing`) > 0 &&
        (!isActuallyEd() || !in_darkGyffte())
      ) {
        use(1, $item`scroll of drastic healing`);
      }
      Bjorn.handleBjornify(priorBjorn);
      return true;
    }

    auto_log_info("Nevermind, that peak is too scary!", "green");
    resetState();
    Bjorn.handleBjornify(priorBjorn);
  } else {
    if ($location`A-Boo Peak`.turnsSpent < 10) {
      // boo clues have 15% drop
      provideItem$2(567, $location`A-Boo Peak`, false);
    }

    autoAdv($location`A-Boo Peak`);
    set("auto_aboopending", 0);

    return true;
  }
  return false;
}

const L9_aBooPeakTask: QuestTask = registerQuestTask({
  name: "L9_aBooPeak",
  completed: () => internalQuestStatus("questL09Topping") > 3,
  ready: () => internalQuestStatus("questL09Topping") >= 2,
  do: L9_aBooPeakDo,
  locations: $location`A-Boo Peak`,
  desiredEncounters: () => {
    const clue: Item = in_glover()
      ? $item`glued A-Boo clue`
      : $item`A-Boo clue`;
    return [
      {
        item: clue,
        needAmount:
          get("auto_aboopending", 0) +
          itemAmount(clue) -
          Math.ceil(get("booPeakProgress") / 34),
      },
    ];
  },
});

export function L9_aBooPeak(): boolean {
  return runQuestTask(L9_aBooPeakTask);
}

export function hedgeTrimmersNeeded(): number {
  const twinPeakProgress: number = get("twinPeakProgress");
  const needStench: boolean = (twinPeakProgress & 1) === 0;
  const needFood: boolean = (twinPeakProgress & 2) === 0;
  const needJar: boolean = (twinPeakProgress & 4) === 0;
  const needInit: boolean =
    needStench || needFood || needJar || twinPeakProgress === 7;
  let neededTrimmers: number = -itemAmount($item`rusty hedge trimmers`);
  if (needStench) {
    neededTrimmers++;
  }
  if (needFood) {
    neededTrimmers++;
  }
  if (needJar) {
    neededTrimmers++;
  }
  if (needInit) {
    neededTrimmers++;
  }

  return neededTrimmers;
}
// returns true if can successfully do one of the tasks at the great overlook lodge NC (606)
export function prepareForTwinPeak(speculative: boolean): boolean {
  const progress: number = get("twinPeakProgress");
  const needStench: boolean = (progress & 1) === 0;
  const needFood: boolean = (progress & 2) === 0;
  const needJar: boolean = (progress & 4) === 0;
  const needInit: boolean = progress === 7;

  if (needInit) {
    if (provideInitiative(40, $location`Twin Peak`, true, speculative) >= 40) {
      return true;
    } else {
      //init test shows up last. if we can't do it there is no point in checking rest of function.
      return false;
    }
  }

  if (needJar && itemAmount($item`jar of oil`) >= 1) {
    return true;
  }

  if (needFood) {
    let food_drop: number =
      itemDropModifier() + numericModifier($modifier`Food Drop`);
    food_drop -= auto_famModifiers$2("Item Drop");

    if (myServant() === $servant`Cat`) {
      food_drop -= numericModifier(
        $familiar`Baby Gravy Fairy`,
        "Item Drop",
        $servant`Cat`.level,
        $item.none,
      );
    }
    if (
      food_drop < 50 &&
      food_drop >= 20 &&
      haveEffect($effect`Brother Flying Burrito's Blessing`) === 0
    ) {
      if (friarsAvailable() && !get("friarsBlessingReceived") && !speculative) {
        cliExecute("friars food");
      }
      if (haveEffect($effect`Brother Flying Burrito's Blessing`) > 0) {
        food_drop = food_drop + 30;
      }
    }
    if (
      food_drop < 50.0 &&
      itemAmount($item`eagle feather`) > 0 &&
      haveEffect($effect`Eagle Eyes`) === 0 &&
      auto_is_valid($item`eagle feather`)
    ) {
      if (!speculative) {
        use(1, $item`eagle feather`);
      }
      food_drop = food_drop + 20;
    }
    if (
      food_drop < 50.0 &&
      itemAmount($item`resolution: be happier`) > 0 &&
      haveEffect($effect`Joyful Resolve`) === 0 &&
      auto_is_valid($item`resolution: be happier`)
    ) {
      if (!speculative) {
        buffMaintain$2($effect`Joyful Resolve`);
      }
      food_drop = food_drop + 15;
    }
    if (food_drop >= 50.0) {
      return true;
    }
  }

  if (needStench) {
    const resGoal: Map<Element, number> = new Map();
    resGoal.set($element`stench`, 4);
    // check if we can get enough stench res before we start applying anything
    const resPossible: Map<Element, number> = provideResistances(
      resGoal,
      $location`Twin Peak`,
      true,
      true,
      true,
    );
    if ((resPossible.get($element`stench`) ?? 0) >= 4) {
      if (!speculative) {
        provideResistances(resGoal, $location`Twin Peak`, true, true, false);
      }
      return true;
    }
  }

  return false;
}

function L9_twinPeakDo(): boolean {
  if (
    hedgeTrimmersNeeded() > 0 &&
    SwordOfSwords.auto_copierShouldDelayZone($locations`Twin Peak`)
  ) {
    auto_log_debug("Delaying L9 Twin Peak - still farming a copier target.");
    return false;
  }

  if (get("twinPeakProgress") >= 15) {
    return false;
  }

  if (
    hedgeTrimmersNeeded() > 0 &&
    Autumnaton.auto_autumnatonCanAdv($location`Twin Peak`) &&
    !isAboutToPowerlevel() &&
    ($location`Twin Peak`.turnsSpent > 0 || get("twinPeakProgress") > 0)
  ) {
    // using trimmers doesn't increment turns_spent, so look at quest status also
    // delay zone to allow autumnaton to grab rusty hedge trimmers
    // unless we have ran out of other stuff to do
    return false;
  }
  //main lodge NC. we swap around this value multiple times. initially set to 0 to prevent mistakes.
  set("choiceAdventure606", "0");
  //-combat via combining 2 IOTMs. Needs to be moved to providePlusNonCombat
  if (myMp() > 60 || Bjorn.considerGrimstoneGolem(true)) {
    Bjorn.handleBjornify($familiar`Grimstone Golem`);
  }

  buffMaintain$2($effect`Fishy Whiskers`); //heavy rains specific reduce item drop penalty by 10%
  //BHY specific prevent wandering bees from skipping the burning the hotel down choice and wasting turns
  buffMaintain$2($effect`Float Like a Butterfly, Smell Like a Bee`);

  if (in_bhy()) {
    // we can't make an oil jar to solve the quest, just adventure until the hotel is burned down
    return autoAdv($location`Twin Peak`);
  }

  if (!prepareForTwinPeak(true)) {
    auto_log_debug(
      "Can't complete any task at the Great Overlook Lodge. Will come back to Twin Peak later",
    );
    return false;
  }

  auto_log_info("Twin Peak", "blue");

  if (
    itemAmount($item`rusty hedge trimmers`) === 0 &&
    $location`Twin Peak`.turnsSpent === 0 &&
    Autumnaton.auto_hasAutumnaton()
  ) {
    // wish for trimmer so we can later send fallbot for the rest
    MonkeyPaw.auto_makeMonkeyPawWish$1($item`rusty hedge trimmers`);
  }

  const starting_trimmers: number = itemAmount($item`rusty hedge trimmers`);
  if (starting_trimmers > 0) {
    equipMaximizedGear();
    // use() aborts the whole script with "Manual control requested for choice #606"
    // (choiceAdventure606 is set to "0" above, which KoLmafia treats as its own abort
    // sentinel, not a safe no-op) since this redirects straight into choice.php;
    // visitUrl() bypasses that and lets the real choice dispatcher handle it instead.
    const trimmerText = visitUrl(
      `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`rusty hedge trimmers`.id}`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), trimmerText);
    }
    cliExecute("refresh inv");
    if (itemAmount($item`rusty hedge trimmers`) === starting_trimmers) {
      auto_abort(
        "Tried using a rusty hedge trimmer but that didn't seem to work",
      );
    }
    auto_log_info(
      `Hedge trimming situation: ${get("choiceAdventure606", 0)}`,
      "green",
    );
    const page: string = visitUrl("main.php");
    if (
      containsText(page, "choice.php") &&
      !containsText(page, "Really Sticking Her Neck Out") &&
      !containsText(page, "It Came from Beneath the Sewer?")
    ) {
      auto_log_info("Inside of a Rusty Hedge Trimmer sequence.", "blue");
    } else {
      auto_log_info("Rusty Hedge Trimmer Sequence completed itself.", "blue");
      return true;
    }
  }

  if (
    get("auto_shinningStarted", false) &&
    CamelSpit.auto_canCamelSpit() &&
    Cartography.auto_canMapTheMonsters()
  ) {
    // Shh! You want to get sued?
    if (adjustForYellowRayIfPossible($monster`bearpig topiary animal`)) {
      if (Cartography.auto_mapTheMonsters()) {
        handleFamiliar$1($familiar`Melodramedary`);
        auto_log_info(
          "Attemping to use Map the Monsters to Yellow Ray a Camel Spitted bearpig topiary animal. Yes that is a mouthful but lets hope it works and we get 4 rusty hedge trimmers!",
        );
      }
    } else {
      return false;
    }
  }
  if (GreyGoose.auto_haveGreyGoose()) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones to get some hedge trimmers.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }
  return autoAdv($location`Twin Peak`);
}

const L9_twinPeakTask: QuestTask = registerQuestTask({
  name: "L9_twinPeak",
  completed: () => internalQuestStatus("questL09Topping") > 3,
  ready: () => internalQuestStatus("questL09Topping") >= 2,
  do: L9_twinPeakDo,
  locations: $location`Twin Peak`,
  desiredEncounters: () => [
    {
      item: $item`rusty hedge trimmers`,
      needAmount: hedgeTrimmersNeeded(),
    },
  ],
});

export function L9_twinPeak(): boolean {
  return runQuestTask(L9_twinPeakTask);
}

function L9_oilPeakDo(): boolean {
  // We deliberately don't do a delay check here, who knows how you buffed...
  auto_MaxMLToCap(auto_convertDesiredML(100), false);

  if (
    monsterLevelAdjustment() < 50 &&
    myLevel() < 12 &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }

  if (is_professor()) {
    return false; //can't do Oil Peak as a Professor
  }

  if (containsText(visitUrl("place.php?whichplace=highlands"), "fire3.gif")) {
    const oilProgress: number = get("twinPeakProgress");
    const needJar: boolean =
      (oilProgress & 4) === 0 && itemAmount($item`jar of oil`) === 0;
    if (!needJar || in_bhy()) {
      return false;
    } else if (itemAmount($item`bubblin' crude`) >= 12) {
      if (in_glover()) {
        if (itemAmount($item`crude oil congealer`) > 0) {
          use(1, $item`crude oil congealer`);
        } else {
          if (itemAmount($item`G`) > 2) {
            buy($coinmaster`G-Mart`, 1, $item`crude oil congealer`);
            use(1, $item`crude oil congealer`);
          } else {
            return false;
          }
        }
      } else if (
        auto_is_valid($item`bubblin' crude`) &&
        creatableAmount($item`jar of oil`) > 0
      ) {
        create(1, $item`jar of oil`);
      }
      if (itemAmount($item`jar of oil`) > 0) {
        return true;
      }
    }
    auto_log_info("Oil Peak is finished but we need more crude!", "blue");
  }

  buffMaintain$2($effect`Fishy Whiskers`);

  auto_MaxMLToCap(auto_convertDesiredML(100), true);

  if (monsterLevelAdjustment() < 50) {
    buffMaintain$2($effect`The Dinsey Look`);
  }
  if (monsterLevelAdjustment() < 60) {
    if (itemAmount($item`dress pants`) > 0) {
      autoEquipToSlot($slot`pants`, $item`dress pants`);
    } else {
      JanuaryTote.januaryToteAcquire($item`tinsel tights`);
    }
  }
  // Maximize Asdon usage
  if (
    haveEffect($effect`Driving Recklessly`) === 0 &&
    haveEffect($effect`Driving Wastefully`) === 0
  ) {
    const loc: Location = $location`Oil Peak`;
    const mlAtLeast =
      (min: number) =>
      (m: Maximizer): void => {
        m.weight($modifier`Monster Level`, 1000).min(
          $modifier`Monster Level`,
          min,
        );
      };
    if (
      ((simMaximizeWith(mlAtLeast(75), loc) &&
        !simMaximizeWith(mlAtLeast(100), loc)) ||
        (simMaximizeWith(mlAtLeast(25), loc) &&
          !simMaximizeWith(mlAtLeast(50), loc)) ||
        !simMaximizeWith(mlAtLeast(11), loc)) &&
      haveEffect($effect`Driving Wastefully`) === 0
    ) {
      AutoAsdonMartin.asdonBuff($effect`Driving Recklessly`);
    } else if (haveEffect($effect`Driving Recklessly`) === 0) {
      AutoAsdonMartin.asdonBuff($effect`Driving Wastefully`);
    }
  }

  maximizer
    .weight($modifier`Monster Level`, 1000)
    .max($modifier`Monster Level`, auto_convertDesiredML(100));

  auto_log_info(`Oil Peak with ML: ${monsterLevelAdjustment()}`, "blue");

  autoAdv($location`Oil Peak`);
  if (get("lastEncounter") === "Unimpressed with Pressure") {
    set("oilPeakProgress", 0.0);
    // Brute Force grouping with tavern (if not done) to maximize tangles while we have a high ML.
    auto_log_info(
      "Checking to see if we should do the tavern while we are running high ML.",
      "green",
    );
    set("auto_forceTavern", true);
    // Remove Driving Wastefully if we had it
    if (0 < haveEffect($effect`Driving Wastefully`)) {
      uneffect($effect`Driving Wastefully`);
    }
  }
  return true;
}

const L9_oilPeakTask: QuestTask = registerQuestTask({
  name: "L9_oilPeak",
  completed: () => internalQuestStatus("questL09Topping") > 3,
  ready: () => internalQuestStatus("questL09Topping") >= 2,
  do: L9_oilPeakDo,
  locations: $location`Oil Peak`,
  desiredEncounters: () => {
    const oilProgress: number = get("twinPeakProgress");
    const needJar: boolean =
      (oilProgress & 4) === 0 && itemAmount($item`jar of oil`) === 0;
    return [
      {
        item: $item`bubblin' crude`,
        needAmount:
          needJar && !in_glover() ? 12 - itemAmount($item`bubblin' crude`) : 0,
      },
      {
        item: $item`jar of oil`,
        needAmount: needJar && in_glover() ? 1 : 0,
      },
    ];
  },
});

export function L9_oilPeak(): boolean {
  return runQuestTask(L9_oilPeakTask);
}

function L9_highLandlordDo(): boolean {
  if (internalQuestStatus("questL09Topping") === 1) {
    auto_log_info(
      "Visiting the Highland Lord's tower <ominous music plays>",
      "blue",
    );
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    set("auto_grimstoneFancyOilPainting", false);
    return true;
  }

  return runTaskChain([
    L9_aBooPeakTask,
    L9_oilPeakTask,
    L9_twinPeakTask,
    L9_highLandlordCouncilTask,
  ]);
}

const L9_highLandlordCouncilTask: QuestTask = registerQuestTask({
  name: "L9_highLandlordCouncil",
  completed: () => internalQuestStatus("questL09Topping") > 3,
  ready: () => {
    if (internalQuestStatus("questL09Topping") < 3) {
      return false;
    }
    return true;
  },
  do: () => {
    auto_log_info(
      "Aw, sweet, dude! You totally lit all the signal fires!",
      "blue",
    );
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    council();
  },
});

export const L9_highLandlordTask: QuestTask = registerQuestTask({
  name: "L9_highLandlord",
  completed: () => internalQuestStatus("questL09Topping") > 3,
  ready: () =>
    internalQuestStatus("questL09Topping") >= 1 &&
    get("chasmBridgeProgress") >= bridgeGoal() &&
    (!isActuallyEd() || get("auto_chasmBusted", false)),
  do: L9_highLandlordDo,
});

export function L9_highLandlord(): boolean {
  return runQuestTask(L9_highLandlordTask);
}
