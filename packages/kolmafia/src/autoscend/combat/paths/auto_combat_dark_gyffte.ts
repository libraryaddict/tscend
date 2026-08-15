import { Monster } from "kolmafia";
import { $skill, get, set } from "libram";

import { CombatMacroReturns } from "../../auto_adventure";
import { handleTracker } from "../../auto_util";
import { bat_shouldEnsorcel } from "../../paths/2019/dark_gyffte";
import { auto_canUse, auto_useSkill } from "../auto_combat_util";

//Path specific combat handling for dark gyffte

//defined in /autoscend/combat/auto_combat_dark_gyffte.ash
export function auto_combatDarkGyffteStage2(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
  //Ensorcel is a Dark Gyffte specific skill that lets you mind control an enemy to becoming a minion 3/day.
  //mechanically it is a free runaway that also gives you a vampyre specific pet based on the phylum of the monster you are facing.
  if (
    bat_shouldEnsorcel(enemy) &&
    auto_canUse($skill`Ensorcel`) &&
    get("auto_bat_ensorcels", 0) < 3
  ) {
    set("auto_bat_ensorcels", get("auto_bat_ensorcels", 0) + 1);
    handleTracker({
      what: enemy,
      detail: $skill`Ensorcel`,
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Ensorcel`);
  }

  return undefined;
}
