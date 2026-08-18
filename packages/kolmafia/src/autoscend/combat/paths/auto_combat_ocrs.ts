import { containsText, lastMonster, Monster, myMp } from "kolmafia";
import { $items, $skill, $skills, get, set } from "libram";

import {
  auto_have_skill,
  auto_log_error,
  auto_log_warning,
  isFreeMonster,
} from "../../auto_util";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import {
  combat_status_add,
  combat_status_check,
  markAsUsed,
  markAsUsed$1,
} from "../auto_combat_util";

//Path specific combat handling for One Crazy Random Summer

//defined in /autoscend/combat/auto_combat_ocrs.ash
export function ocrs_combat_helper(page: string): Monster {
  if (!in_ocrs()) {
    auto_log_error("Should not be in ocrs_combat_helper if not on the path!");
  }
  //	ghostly				physical resistance
  //	untouchable			damage reduced to 5, instant kills still good (much less of an issue now
  /*
		For no staggers, don\'t use staggers
		For blocks skills/combat items, we can probably set them all to used as well.
	*/

  if (isFreeMonster(lastMonster())) {
    if (
      !combat_status_check("cleesh") &&
      auto_have_skill($skill`CLEESH`) &&
      myMp() > 10
    ) {
      set("auto_useCleesh", false);
      combat_status_add("cleesh");
    }
  }

  if (lastMonster().randomModifiers.includes("unstoppable")) {
    if (!combat_status_check("unstoppable")) {
      for (const it of $items`DNA extraction syringe, Rain-Doh indigo cup, Rain-Doh blue balls`) {
        markAsUsed$1(it);
      }
      for (const sk of $skills`Air Dirty Laundry, Ply Reality, Summon Love Mosquito, Summon Love Gnats, Micrometeorite`) {
        markAsUsed(sk);
      }
      //Block weaksauce and pocket crumbs?
    }
  }

  if (lastMonster().randomModifiers.includes("annoying")) {
    if (
      containsText(
        page,
        "makes the most annoying noise you've ever heard, stopping you in your tracks.",
      )
    ) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }
    set("auto_funCombatHandler", get("_auto_combatState"));
  }

  if (lastMonster().randomModifiers.includes("restless")) {
    if (containsText(page, "moves out of the way")) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }
    if (containsText(page, "quickly moves out of the way")) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }
    if (containsText(page, "will have moved by the time")) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }

    set("auto_funCombatHandler", get("_auto_combatState"));
  }

  if (lastMonster().randomModifiers.includes("phase-shifting")) {
    if (containsText(page, "blinks out of existence before")) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }
    set("auto_funCombatHandler", get("_auto_combatState"));
  }

  if (lastMonster().randomModifiers.includes("cartwheeling")) {
    if (containsText(page, "cartwheels out of the way")) {
      auto_log_warning("Last action failed, uh oh! Trying to undo!", "olive");
      set("_auto_combatState", get("auto_funCombatHandler"));
    }
    set("auto_funCombatHandler", get("_auto_combatState"));
  }

  set("auto_useCleesh", false);
  if (lastMonster().randomModifiers.includes("ticking")) {
    if (
      !combat_status_check("cleesh") &&
      auto_have_skill($skill`CLEESH`) &&
      myMp() > 10
    ) {
      set("auto_useCleesh", true);
    }
  }
  if (lastMonster().randomModifiers.includes("untouchable")) {
    if (
      !combat_status_check("cleesh") &&
      auto_have_skill($skill`CLEESH`) &&
      myMp() > 10
    ) {
      set("auto_useCleesh", true);
    }
  }
  return lastMonster();
}
