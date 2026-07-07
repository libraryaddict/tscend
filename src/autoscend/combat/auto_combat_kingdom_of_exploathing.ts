import {
  buffedHitStat,
  haveEquipped,
  min,
  Monster,
  monsterLevelAdjustment,
  myDaycount,
  numericModifier,
  toInt,
} from "kolmafia";
import { $elements, $item, $monster, $skill } from "libram";

import { auto_useSkill, canUse, canUse$3, useItem$1 } from "./auto_combat_util";

//Path specific combat handling for Kingdom of Exploathing

//defined in /autoscend/combat/auto_combat_kingdom_of_exploathing.ash
export function auto_combatExploathingStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  //#stage1 = 1st round actions: puzzle boss, banish, escape, pickpocket, etc. things that need to be done before debuff

  if (
    enemy === $monster`the invader` &&
    canUse($skill`Lunging Thrust-Smack`, false) &&
    haveEquipped($item`June cleaver`)
  ) {
    return auto_useSkill($skill`Lunging Thrust-Smack`, false);
  }

  if (
    enemy === $monster`the invader` &&
    canUse($skill`Weapon of the Pastalord`, false)
  ) {
    return auto_useSkill($skill`Weapon of the Pastalord`, false);
  }

  if (enemy === $monster`skeleton astronaut`) {
    if (myDaycount() === 1 && canUse$3($item`exploding cigar`, false)) {
      return useItem$1($item`exploding cigar`);
    }
    let dmg: number = 0;
    for (const el of $elements`hot, cold, sleaze, spooky, stench`) {
      dmg += toInt(min(10, numericModifier(`${el.toString()} Damage`)));
    }
    // 10 physical + 10 prismatic is enough to be better than Saucestorm.
    // Otherwise, saucestorm deals 20 damage/round.
    if (dmg >= 10 && buffedHitStat() >= 120 + monsterLevelAdjustment()) {
      return "attack with weapon";
    } else if (canUse($skill`Saucestorm`, false)) {
      return auto_useSkill($skill`Saucestorm`, false);
    }
  }

  return "";
}
