import { itemDropModifier, Location, myPath, myTurncount } from "kolmafia";
import { $locations, $path, get, set } from "libram";

import { auto_abort } from "../../auto_util";
import { zone_needItem } from "../../auto_zone";

//Defined in autoscend/paths/live_ascend_repeat.ash
export function in_lar(): boolean {
  return myPath() === $path`Live. Ascend. Repeat.`;
}

export function lar_safeguard(): boolean {
  if (in_lar()) {
    const repeats: string = get("lastEncounter");
    if (
      repeats === "Skull, Skull, Skull" ||
      repeats === "Urning Your Keep" ||
      repeats === "Turn Your Head and Coffin" ||
      repeats === "Curtains" ||
      repeats === "There's No Ability Like Possibility" ||
      repeats === "Putting Off Is Off-Putting" ||
      repeats === "Huzzah!"
    ) {
      if (get("_auto_groundhogSkip", 0) === myTurncount()) {
        set(
          "_auto_groundhogSkipCounter",
          get("_auto_groundhogSkipCounter", 0) + 1,
        );
      }
      if (get("_auto_groundhogSkipCounter", 0) > 6) {
        auto_abort(
          "You are in a non-combat adventure that will infinitely loop. Please spend a turn somewhere else and re-run autoscend.",
        );
      }
      set("_auto_groundhogSkip", myTurncount());
    } else {
      set("_auto_groundhogSkipCounter", 0);
      set("_auto_groundhogSkip", -1);
    }
  }
  return false;
}

export function lar_repeat(loc: Location): boolean {
  if (in_lar()) {
    if (
      $locations`The Castle in the Clouds in the Sky (Ground Floor), The Defiled Alcove, The Defiled Niche, The Defiled Nook, The Haunted Ballroom`.includes(
        loc,
      )
    ) {
      if (get("_auto_groundhogSkip", 0) === myTurncount()) {
        return false;
      }
    }
  }
  return true;
}

export function lar_abort(loc: Location): boolean {
  if (in_lar()) {
    const { needItem, needScore } = zone_needItem(loc);
    if (!needItem) {
      return true;
    }
    //These should be places that we would not consider overriding with a YR.
    for (const place of $locations`The F'c'le, The Hole in the Sky`) {
      if (place === loc && itemDropModifier() < needScore) {
        auto_abort(
          `Not enough +item drop (${needScore}) for ${loc} only have: ${itemDropModifier()}`,
        );
      }
    }
  }
  return true;
}

export function LM_lar(): boolean {
  //Not best way but just do it...
  if (in_lar()) {
    if (get("_sourceTerminalDigitizeUses") < 3) {
      set("_sourceTerminalDigitizeUses", 3);
    }
  }
  return false;
}
