import {
  abort,
  getProperty,
  min,
  Monster,
  monsterHp,
  myHp,
  myMask,
  numericModifier,
  setProperty,
  Skill,
  toInt,
} from "kolmafia";
import { auto_log_info } from "../auto_util";
import {
  canSurvive$1,
  canUse$1,
  canUse$2,
  useSkill$1,
  useSkill$2,
} from "./auto_combat_util";
import { in_disguises } from "../paths/disguises_delimit";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Path specific combat handling for Disguises Delimit

//defined in /autoscend/combat/auto_combat_disguises_delimit.ash
export function disguises_combat_helper(
  round_1: number,
  enemy: Monster,
  text: string,
): void {
  //identify mask worn during Disguises Delimit path
  if (!in_disguises()) {
    return;
  }
  //note that mafia has a function my_mask().
  //TODO compare if it is more reliable than our own mask matcher to see if we should switch
  let disguises: number = -1;
  const maskMatch: AshMatcher = new AshMatcher("mask(\\d+).png", text);
  if (maskMatch.find()) {
    disguises = toInt(maskMatch.group(1));
    if (round_1 === 0) {
      auto_log_info(`Found mask: ${disguises}`, "green");
    }
  } else if (enemy === Monster.get("Your Shadow")) {
    //matcher fails on your shadow and it always wears mask 1.
    disguises = 1;
    auto_log_info("Found mask: 1", "green");
  } else {
    abort(
      `Failed to identify the mask worn by the monster [${enemy}]. Finish this combat manually then run me again`,
    );
  }
  setProperty("_auto_combatDisguisesDelimitMask", disguises.toString());
}

export function auto_combatDisguisesStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  if (!in_disguises()) {
    return "";
  }
  //some masks are treated like puzzle bosses. requiring either an immediate swap or special action handling
  const disguises: number = toInt(
    getProperty("_auto_combatDisguisesDelimitMask"),
  );
  //mask 7 = bandit mask = +300% enemy defense
  if (disguises === 7 && canUse$2(Skill.get("Swap Mask"))) {
    return useSkill$2(Skill.get("Swap Mask"));
  }
  //mask 3 = protest mask = +30ML. can only attack with weapon or change mask. if changed can only use items or attack with weapon
  if (disguises === 3) {
    if (canSurvive$1(1.5)) {
      return "attack with weapon";
    }
    abort(
      "May not be able to survive combat. Is swapping protest mask still not allowing us to do anything?",
    );
  }
  //this is code is unreachable. it needs fixing.
  if (myMask() === "protest mask" && canUse$2(Skill.get("Swap Mask"))) {
    return useSkill$2(Skill.get("Swap Mask"));
  }

  return "";
}

export function auto_combatDisguisesStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 5 = kill
  if (!in_disguises()) {
    return "";
  }

  const disguises: number = toInt(
    getProperty("_auto_combatDisguisesDelimitMask"),
  );
  if (disguises === 13) {
    //welding mask
    //reflect damage from spells back to player. kept if mask is changed
    //some spells actually damage the monster too.
    //saucegeyser confirmed to not damage the monster. saucestorm confirmed to damage the monster.
    if (enemy.physicalResistance >= 80) {
      if (
        myHp() > monsterHp() + 150 &&
        canUse$1(Skill.get("Saucestorm"), false)
      ) {
        return useSkill$1(Skill.get("Saucestorm"), false);
      }
      if (canUse$2(Skill.get("Implode Universe"))) {
        return useSkill$1(Skill.get("Implode Universe"), true);
      }
      //TODO check if our physical attack can deal elemental damage.
      abort(
        "Not sure how to handle a physically resistent enemy wearing a welding mask.",
      );
    }
    if (canSurvive$1(1.5) && round_1 < 10) {
      return "attack with weapon";
    }
    if (canUse$2(Skill.get("Implode Universe"))) {
      return useSkill$1(Skill.get("Implode Universe"), true);
    }
    abort("Not sure how to handle welding mask.");
  }
  if (disguises === 25) {
    //tiki mask
    //triples HP and hard caps damage at 10 per source. kept if mask is changed
    //seal clubbers have ways to increase this damage but its overly complicated to calculate. simplified calculation is used.
    const hot_dmg: number = toInt(min(10, numericModifier("hot damage")));
    const cold_dmg: number = toInt(min(10, numericModifier("cold damage")));
    const stench_dmg: number = toInt(min(10, numericModifier("stench damage")));
    const sleaze_dmg: number = toInt(min(10, numericModifier("sleaze damage")));
    const spooky_dmg: number = toInt(min(10, numericModifier("spooky damage")));
    const attack_dmg: number =
      10 + hot_dmg + cold_dmg + stench_dmg + sleaze_dmg + spooky_dmg;

    if (attack_dmg > 20) {
      return "attack with weapon";
    }
    if (canUse$1(Skill.get("Saucestorm"), false)) {
      return useSkill$1(Skill.get("Saucestorm"), false);
    }
  }

  return "";
}
