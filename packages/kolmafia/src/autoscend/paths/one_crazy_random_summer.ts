import {
  containsText,
  getProperty,
  haveEffect,
  lastMonster,
  myPath,
  setProperty,
} from "kolmafia";
import { $effect, $path } from "libram";

import { acquireHP } from "../auto_restore";
import { auto_log_warning, handleTracker } from "../auto_util";

//Defined in autoscend/paths/one_crazy_random_summer.ash
export function in_ocrs(): boolean {
  return myPath() === $path`One Crazy Random Summer`;
}

export function ocrs_postHelper(): boolean {
  if (in_ocrs()) {
    return false;
  }

  setProperty("auto_useCleesh", false.toString());
  return true;
}

export function ocrs_postCombatResolve(): boolean {
  if (haveEffect($effect`Beaten Up`) > 0 && in_ocrs()) {
    if (
      containsText(getProperty("auto_funPrefix"), "annoying") ||
      containsText(getProperty("auto_funPrefix"), "phase-shifting") ||
      containsText(getProperty("auto_funPrefix"), "restless") ||
      containsText(getProperty("auto_funPrefix"), "ticking")
    ) {
      auto_log_warning(
        "Probably beaten up by FUN! Trying to recover instead of aborting",
        "red",
      );
      handleTracker({
        what: lastMonster(),
        detail: getProperty("auto_funPrefix"),
        property: "auto_funTracker",
      });
      acquireHP();
    }
  }

  return false;
}
