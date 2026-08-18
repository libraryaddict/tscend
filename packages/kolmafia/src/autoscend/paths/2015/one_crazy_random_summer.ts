import { containsText, haveEffect, lastMonster, myPath } from "kolmafia";
import { $effect, $path, get, set } from "libram";

import { acquireHP } from "../../auto_restore";
import { auto_log_warning, handleTracker } from "../../auto_util";

//Defined in autoscend/paths/one_crazy_random_summer.ash
export function in_ocrs(): boolean {
  return myPath() === $path`One Crazy Random Summer`;
}

export function ocrs_postHelper(): boolean {
  if (in_ocrs()) {
    return false;
  }

  set("auto_useCleesh", false);
  return true;
}

export function ocrs_postCombatResolve(): boolean {
  if (haveEffect($effect`Beaten Up`) > 0 && in_ocrs()) {
    if (
      containsText(get("auto_funPrefix"), "annoying") ||
      containsText(get("auto_funPrefix"), "phase-shifting") ||
      containsText(get("auto_funPrefix"), "restless") ||
      containsText(get("auto_funPrefix"), "ticking")
    ) {
      auto_log_warning(
        "Probably beaten up by FUN! Trying to recover instead of aborting",
        "red",
      );
      handleTracker({
        what: lastMonster(),
        detail: get("auto_funPrefix"),
        property: "auto_funTracker",
      });
      acquireHP();
    }
  }

  return false;
}
