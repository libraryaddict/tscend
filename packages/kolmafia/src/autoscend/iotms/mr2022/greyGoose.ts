import { familiarWeight, haveEffect, itemAmount } from "kolmafia";
import { $effect, $familiar, $item, get, set } from "libram";

import { auto_have_familiar } from "../../auto_familiar";
import { internalQuestStatus } from "../../auto_util";
import { needStarKey } from "../../quests/level_13";

export function haveGreyGoose(): boolean {
  if (auto_have_familiar($familiar`Grey Goose`)) {
    return true;
  }
  return false;
}

export function gooseExpectedDrones(): number {
  if (!haveGreyGoose()) {
    return 0;
  }
  const gooseWeight: number = familiarWeight($familiar`Grey Goose`);
  if (gooseWeight < 5) {
    return 0;
  }
  return gooseWeight - 5;
}

export function dronesOut(): boolean {
  //want a function to override the task order if we have drones out so as not to waste them
  if (!haveGreyGoose()) {
    return false;
  }
  if (get("gooseDronesRemaining") > 0) {
    return true;
  }
  return false;
}

export function prioritizeGoose(): void {
  //prioritize Goose only if we still have things to get
  if (!haveGreyGoose()) {
    return;
  }
  if (
    (internalQuestStatus("questL04Bat") <= 1 && gooseExpectedDrones() < 1) ||
    (itemAmount($item`stone wool`) === 0 &&
      haveEffect($effect`Stone-Faced`) === 0 &&
      internalQuestStatus("questL11Worship") <= 2 &&
      gooseExpectedDrones() < 1) ||
    (internalQuestStatus("questL08Trapper") <= 1 &&
      gooseExpectedDrones() < 1) ||
    (internalQuestStatus("questL09Topping") >= 2 &&
      internalQuestStatus("questL09Topping") <= 3 &&
      get("twinPeakProgress") < 15 &&
      gooseExpectedDrones() < 2) ||
    (needStarKey() &&
      itemAmount($item`star`) < 7 &&
      itemAmount($item`line`) < 6 &&
      gooseExpectedDrones() < 4) ||
    (internalQuestStatus("questL11Ron") < 5 && gooseExpectedDrones() < 2) ||
    (get("hiddenBowlingAlleyProgress") + itemAmount($item`bowling ball`) < 5 &&
      gooseExpectedDrones() < 2) ||
    (itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      9 &&
      itemAmount($item`tangle of rat tails`) > 0 &&
      gooseExpectedDrones() < 3)
  ) {
    set("auto_prioritizeGoose", true);
    return;
  }
  set("auto_prioritizeGoose", false);
}
