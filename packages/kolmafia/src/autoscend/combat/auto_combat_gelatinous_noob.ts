import { Monster } from "kolmafia";
import { $monsters, $skill } from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import { in_gnoob } from "../paths/2017/gelatinous_noob";
import { auto_canUse, auto_useSkill, haveUsed } from "./auto_combat_util";

//defined in /autoscend/combat/auto_combat_gelatinous_noob.ash
export function auto_combatGelatinousNoobStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 5 = kill
  if (!in_gnoob()) {
    return undefined;
  }
  //3x elemental damage bonuses attack against duplicated [goat]. duplicated means double stats and double drops
  if (
    auto_canUse($skill`Gelatinous Kick`, false) &&
    haveUsed($skill`Duplicate`)
  ) {
    if ($monsters`dairy goat`.includes(enemy)) {
      return auto_useSkill($skill`Gelatinous Kick`, false);
    }
  }

  return undefined;
}
