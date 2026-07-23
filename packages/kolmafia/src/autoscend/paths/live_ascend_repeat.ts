import {
  abort,
  getProperty,
  itemDropModifier,
  Location,
  myPath,
  myTurncount,
  setProperty,
  toInt,
} from "kolmafia";
import { $locations, $path } from "libram";

import { zone_needItem } from "../auto_zone";
import { generic_t } from "../autoscend_record";

//Defined in autoscend/paths/live_ascend_repeat.ash
export function in_lar(): boolean {
  return myPath() === $path`Live. Ascend. Repeat.`;
}

export function lar_safeguard(): boolean {
  if (in_lar()) {
    const repeats: string = getProperty("lastEncounter");
    if (
      repeats === "Skull, Skull, Skull" ||
      repeats === "Urning Your Keep" ||
      repeats === "Turn Your Head and Coffin" ||
      repeats === "Curtains" ||
      repeats === "There's No Ability Like Possibility" ||
      repeats === "Putting Off Is Off-Putting" ||
      repeats === "Huzzah!"
    ) {
      if (toInt(getProperty("_auto_groundhogSkip")) === myTurncount()) {
        setProperty(
          "_auto_groundhogSkipCounter",
          (toInt(getProperty("_auto_groundhogSkipCounter")) + 1).toString(),
        );
      }
      if (toInt(getProperty("_auto_groundhogSkipCounter")) > 6) {
        abort(
          "You are in a non-combat adventure that will infinitely loop. Please spend a turn somewhere else and re-run autoscend.",
        );
      }
      setProperty("_auto_groundhogSkip", myTurncount().toString());
    } else {
      setProperty("_auto_groundhogSkipCounter", (0).toString());
      setProperty("_auto_groundhogSkip", (-1).toString());
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
      if (toInt(getProperty("_auto_groundhogSkip")) === myTurncount()) {
        return false;
      }
    }
  }
  return true;
}

export function lar_abort(loc: Location): boolean {
  if (in_lar()) {
    const itemNeed: generic_t = zone_needItem(loc);
    if (!itemNeed._boolean) {
      return true;
    }
    //These should be places that we would not consider overriding with a YR.
    for (const place of $locations`The F'c'le, The Hole in the Sky`) {
      if (place === loc && itemDropModifier() < itemNeed._float) {
        abort(
          `Not enough +item drop (${itemNeed._float}) for ${loc} only have: ${itemDropModifier()}`,
        );
      }
    }
  }
  return true;
}

export function LM_lar(): boolean {
  //Not best way but just do it...
  if (in_lar()) {
    if (toInt(getProperty("_sourceTerminalDigitizeUses")) < 3) {
      setProperty("_sourceTerminalDigitizeUses", (3).toString());
    }
  }
  return false;
}
