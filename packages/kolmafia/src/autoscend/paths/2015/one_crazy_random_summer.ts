import { haveEffect, lastMonster, myPath } from "kolmafia";
import { $effect, $path, get, set } from "libram";

import { acquireHP } from "../../helpers/auto_restore";
import { auto_log_warning } from "../../utils/auto_log";
import { handleTracker } from "../../utils/auto_util";

export function in_ocrs(): boolean {
  return myPath() === $path`One Crazy Random Summer`;
}

export function ocrs_postHelper(): boolean {
  if (in_ocrs()) {
    return false;
  }

  set("tscend_useCleesh", false);
  return true;
}

export function ocrs_postCombatResolve(): boolean {
  if (haveEffect($effect`Beaten Up`) > 0 && in_ocrs()) {
    if (
      get("tscend_funPrefix").includes("annoying") ||
      get("tscend_funPrefix").includes("phase-shifting") ||
      get("tscend_funPrefix").includes("restless") ||
      get("tscend_funPrefix").includes("ticking")
    ) {
      auto_log_warning(
        "Probably beaten up by FUN! Trying to recover instead of aborting",
        "red",
      );
      handleTracker({
        tracker: "ocrsFunTimes",
        monster: lastMonster(),
        fun: get("tscend_funPrefix"),
      });
      acquireHP();
    }
  }

  return false;
}
