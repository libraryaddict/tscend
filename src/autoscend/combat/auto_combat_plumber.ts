import { equippedAmount, Monster, myClass, myLocation, myPp } from "kolmafia";
import { $class, $item, $location, $skill } from "libram";

import { auto_useSkill, canUse } from "./auto_combat_util";

//Path specific combat handling for path of the plumber

//defined in /autoscend/combat/auto_combat_plumber.ash
export function auto_combatPlumberStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  //stage 5 killing the enemy. plumber specific

  if (myClass() !== $class`Plumber`) {
    return "";
  }
  // note: Juggle Fireballs CAN be used multiple times, but it is only
  // useful if you have level 3 fire and therefore get healed

  if (myPp() > 2 && canUse($skill`[7332]Juggle Fireballs`, true)) {
    return auto_useSkill($skill`[7332]Juggle Fireballs`);
  }

  if (
    enemy.physicalResistance >= 80 ||
    (myLocation() === $location`The Smut Orc Logging Camp` &&
      0 < equippedAmount($item`frosty button`))
  ) {
    if (canUse($skill`[7333]Fireball Barrage`, false)) {
      return auto_useSkill($skill`[7333]Fireball Barrage`);
    }
    //this skill comes from the IOTM Beach Comb
    if (canUse($skill`Beach Combo`, true)) {
      return auto_useSkill($skill`Beach Combo`);
    }
    if (canUse($skill`Fireball Toss`, false)) {
      return auto_useSkill($skill`Fireball Toss`, false);
    }
  }

  if (canUse($skill`[7336]Multi-Bounce`, false)) {
    return auto_useSkill($skill`[7336]Multi-Bounce`);
  }
  //this skill comes from the IOTM Beach Comb
  if (canUse($skill`Beach Combo`, true)) {
    return auto_useSkill($skill`Beach Combo`);
  }
  if (canUse($skill`Jump Attack`, false)) {
    return auto_useSkill($skill`Jump Attack`, false);
  }
  // Fallback, since maybe we only have fire flower equipped.
  if (canUse($skill`[7333]Fireball Barrage`, false)) {
    {
      return auto_useSkill($skill`[7333]Fireball Barrage`);
    }
    return auto_useSkill($skill`Fireball Toss`, false);
  }

  return "";
}
