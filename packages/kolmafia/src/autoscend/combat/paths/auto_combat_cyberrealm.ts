import { haveSkill, Monster } from "kolmafia";
import { $skill } from "libram";

import { CyberRealm } from "../../../types";
import { CombatMacroReturns } from "../../executors/auto_adventure";
import { auto_abort } from "../../utils/auto_log";
import { auto_useSkill, canSurvive } from "../auto_combat_util";

export function auto_combatCyberrealmStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  if (
    !CyberRealm.isCyberMonster(enemy) ||
    !haveSkill($skill`Throw Cyber Rock`)
  ) {
    return undefined;
  }

  if (!canSurvive(2.0)) {
    auto_abort(`Uh oh, we don't expect to survive this.`);
  }

  return auto_useSkill($skill`Throw Cyber Rock`);
}
