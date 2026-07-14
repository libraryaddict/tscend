import {
  getProperty,
  haveEffect,
  haveEquipped,
  Monster,
  monsterHp,
  setProperty,
  splitString,
  toInt,
  toSkill,
} from "kolmafia";
import { $effect, $item, $monster, $skill } from "libram";

import { auto_haveCosmicBowlingBall } from "../iotms/mr2022";
import { dartSkill } from "../iotms/mr2024";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
  wereprof_oculus,
} from "../paths/wereprofessor";
import {
  auto_useSkill,
  canUse,
  canUse$3,
  haveUsed,
  markAsUsed,
  useItem$1,
} from "./auto_combat_util";

//defined in /autoscend/combat/auto_combat_wereprofessor.ash
export function auto_combatWereProfessorStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  if (!in_wereprof()) {
    return "";
  }

  if (is_professor()) {
    setProperty("auto_skipStage3", true.toString()); //Don't even want to try Stage 3 as a Professor
  }

  if (enemy === $monster`wall of bones`) {
    if (
      canUse($skill`Slaughter`) &&
      haveEffect($effect`Everything Looks Red`) === 0
    ) {
      return auto_useSkill($skill`Slaughter`);
    }
  }

  return "";
}

export function auto_combatWereProfessorStage4(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  //only care about Advanced Research as a Professor
  if (!in_wereprof()) {
    return "";
  }

  for (const str of splitString(
    getProperty("wereProfessorAdvancedResearch"),
    ",",
  )) {
    if (toInt(str) === enemy.id) {
      return "";
    }
  }

  if (is_professor() && wereprof_oculus() && !haveUsed(toSkill(7512))) {
    markAsUsed(toSkill(7512));
    return toSkill(7512).toString();
  }
  return "";
}

export function auto_combatWereProfessorStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  if (!in_wereprof()) {
    return "";
  }

  const enemy_physical_immune: boolean = enemy.physicalResistance > 99;

  if (is_werewolf()) {
    if (enemy_physical_immune && canUse($skill`Bite`, true)) {
      return auto_useSkill($skill`Bite`, true); // elemental damage skill
    } else if (
      haveEquipped($item`Everfull Dart Holster`) &&
      toInt(getProperty("_dartsLeft")) > 0
    ) {
      //want dart skill as high as possible for Professor
      return auto_useSkill(dartSkill());
    }
    if (!enemy_physical_immune && canUse($skill`Rend`, false)) {
      return auto_useSkill($skill`Rend`, true);
    }
    return "attack with weapon"; //worst case scenario just use this
  }
  if (is_professor()) {
    if (
      haveEquipped($item`Everfull Dart Holster`) &&
      toInt(getProperty("_dartsLeft")) > 0
    ) {
      //want dart skill as high as possible for Professor
      return auto_useSkill(dartSkill());
    } else if (
      auto_haveCosmicBowlingBall() &&
      canUse$3($item`cosmic bowling ball`) &&
      !enemy_physical_immune &&
      monsterHp() < 100
    ) {
      return useItem$1($item`cosmic bowling ball`); // 100 physical damage
    } else {
      return "runaway"; //Can't do anything further as Professor other than using items/running away
    }
  }
  return "";
}
