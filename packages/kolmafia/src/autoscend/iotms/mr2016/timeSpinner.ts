import { containsText, itemAmount, Monster, visitUrl } from "kolmafia";
import { $item, $location, $locations, get } from "libram";

import { autoAdvBypass, CombatMacro } from "../../auto_adventure";
import {
  auto_abort,
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
  handleTracker,
} from "../../auto_util";

function timeSpinnerRemaining(verify: boolean): number {
  //how many time spinner minutes remain to be used.
  if (
    !auto_is_valid($item`Time-Spinner`) ||
    itemAmount($item`Time-Spinner`) === 0
  ) {
    return 0; //time-spinner is not available at all. thus we have 0 minutes to utilize
  }
  let spins_used: number = get("_timeSpinnerMinutesUsed");
  if (verify) {
    visitUrl("inv_use.php?pwd=&which=3&whichitem=9104"); //visit time-spinner to update remaining minutes
    const spins_new: number = get("_timeSpinnerMinutesUsed");
    if (spins_used !== spins_new) {
      auto_log_warning(
        "Detected and corrected erroneous tracking of _timeSpinnerMinutesUsed",
        "red",
      );
      spins_used = spins_new;
    }
  }
  return 10 - spins_used;
}

export function timeSpinnerAdventure(option?: CombatMacro): boolean {
  //spend 1 minutes to Adventure Way Back in Time
  if (timeSpinnerRemaining(true) < 1) {
    return false;
  }
  const pages: Map<number, string> = new Map();
  pages.set(0, "inv_use.php?pwd=&which=3&whichitem=9104");
  pages.set(1, "choice.php?pwd=&whichchoice=1195&option=3");
  return autoAdvBypass(0, pages, $location`Noob Cave`, option);
}

function canTimeSpinnerMonster(mon: Monster): boolean {
  // Can only time spinner summon copyable monsters
  if (!mon.copyable || mon.id < 0) {
    return false;
  }

  const name: string = mon.toString();
  for (const loc of $locations.all()) {
    if (containsText(loc.combatQueue, name)) {
      return true;
    }
  }
  return false;
}

export function timeSpinnerCombat(
  goal: Monster,
  speculative: boolean = false,
  option?: CombatMacro,
): boolean {
  //spend 3 minutes to Travel to a Recent Fight
  if (timeSpinnerRemaining(!speculative) < 3) {
    return false;
  }
  if (!canTimeSpinnerMonster(goal)) {
    return false;
  }
  if (speculative) {
    // error checking passed, assume rest will work
    return true;
  }
  auto_log_info(`Using time spinner to summon ${goal.name}`, "blue");
  const pages: Map<number, string> = new Map();
  pages.set(0, "inv_use.php?pwd=&which=3&whichitem=9104");
  pages.set(1, "choice.php?pwd=&whichchoice=1195&option=1");
  pages.set(2, `choice.php?pwd=&whichchoice=1196&option=1&monid=${goal.id}`);
  if (autoAdvBypass(0, pages, $location`Noob Cave`, option)) {
    handleTracker({
      what: goal,
      detail: $item`Time-Spinner`.toString(),
      property: "auto_copies",
    });
    return true;
  }
  if (get("lastEncounter") === "Travel to a Recent Fight") {
    visitUrl("choice.php?pwd&whichchoice=1196&option=2");
  } else {
    auto_abort(
      "Time-Spinner combat failed and we were unable to leave the Time-Spinner",
    );
  }
  return false;
}
