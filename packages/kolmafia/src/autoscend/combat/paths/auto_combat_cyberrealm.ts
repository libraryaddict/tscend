import { haveSkill, Monster } from "kolmafia";
import { $monsters, $skill } from "libram";

import { CombatMacroReturns } from "../../executors/auto_adventure";
import { auto_abort } from "../../utils/auto_log";
import { auto_useSkill, canSurvive } from "../auto_combat_util";

const cyberMonsters = $monsters`zombie process, botfly, network worm, ICE man, rat (remote access trojan), firewall, ICE barrier, corruption quarantine, parental controls, null container`;

export function auto_combatCyberrealmStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  if (!cyberMonsters.includes(enemy) || !haveSkill($skill`Throw Cyber Rock`)) {
    return undefined;
  }

  if (!canSurvive(2.0)) {
    auto_abort(`Uh oh, we don't expect to survive this.`);
  }

  return auto_useSkill($skill`Throw Cyber Rock`);
}
