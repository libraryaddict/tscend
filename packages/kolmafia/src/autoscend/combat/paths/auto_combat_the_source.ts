import {
  haveEffect,
  Monster,
  mpCost,
  myHp,
  myLocation,
  myMaxhp,
  myMp,
} from "kolmafia";
import { $effect, $locations, $monsters, $skill, get, set } from "libram";

import { CombatMacroReturns } from "../../auto_adventure";
import { auto_have_skill } from "../../auto_util";
import { auto_canUse, auto_useSkill } from "../auto_combat_util";

//Path specific combat handling for The Source

//defined in /autoscend/combat/auto_combat_the_source.ash
export function auto_combatTheSourceStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  //#stage1 = 1st round actions: puzzle boss, banish, escape, pickpocket, etc. things that need to be done before debuff

  if ($monsters`One Thousand Source Agents, Source Agent`.includes(enemy)) {
    if (auto_have_skill($skill`Data Siphon`)) {
      if (myMp() < 50) {
        if (
          auto_have_skill($skill`Source Punch`) &&
          myMp() >= mpCost($skill`Source Punch`)
        ) {
          return auto_useSkill($skill`Source Punch`, false);
        }
      } else if (myMp() > 125) {
        if (
          auto_canUse($skill`Reboot`) &&
          (haveEffect($effect`Latency`) > 0 || myHp() * 2 < myMaxhp())
        ) {
          return auto_useSkill($skill`Reboot`);
        }
        if (auto_canUse($skill`Humiliating Hack`)) {
          return auto_useSkill($skill`Humiliating Hack`);
        }
        if (auto_canUse($skill`Disarmament`)) {
          return auto_useSkill($skill`Disarmament`);
        }
        if (auto_canUse($skill`Big Guns`) && myHp() < 100) {
          return auto_useSkill($skill`Big Guns`);
        }
      } else if (myMp() > 100) {
        if (auto_canUse($skill`Humiliating Hack`)) {
          return auto_useSkill($skill`Humiliating Hack`);
        }
        if (auto_canUse($skill`Disarmament`)) {
          return auto_useSkill($skill`Disarmament`);
        }
      }

      if (auto_canUse($skill`Source Kick`, false)) {
        return auto_useSkill($skill`Source Kick`, false);
      }
    }

    if (auto_canUse($skill`Big Guns`)) {
      return auto_useSkill($skill`Big Guns`);
    }
    if (auto_canUse($skill`Source Punch`, false)) {
      return auto_useSkill($skill`Source Punch`, false);
    }
    return "runaway";
  }

  return undefined;
}

export function auto_combatTheSourceStage4(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
  //source terminal iotm source path specific action. provokes an agent into attacking you next turn 3/day
  //is turn referring to combat round or next adv? this is placed in stage 4 on the assumption it means next adv. if it means next combat round then it should be moved to stage 2
  if (
    auto_canUse($skill`Portscan`) &&
    myLocation().turnsSpent < 8 &&
    get("_sourceTerminalPortscanUses") < 3 &&
    !get("_portscanPending", false)
  ) {
    if (
      $locations`The Castle in the Clouds in the Sky (Ground Floor), The Haunted Bathroom, The Haunted Gallery`.includes(
        myLocation(),
      )
    ) {
      set("_portscanPending", true);
      return auto_useSkill($skill`Portscan`);
    }
  }

  return undefined;
}
