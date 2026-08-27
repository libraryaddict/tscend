import {
  Familiar,
  haveFamiliar,
  myFamiliar,
  myLevel,
  myPath,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import { $familiar, $path, get } from "libram";

import { canChangeToFamiliar } from "../../auto_familiar";
import { internalQuestStatus } from "../../auto_util";
import { inAftercore } from "../../paths/casual";

export function getSpaceJelly(): boolean {
  if (!canChangeToFamiliar($familiar`Space Jellyfish`)) {
    return false;
  }
  if (get("_seaJellyHarvested")) {
    return false;
  }
  if (!haveFamiliar($familiar`Space Jellyfish`)) {
    return false;
  }
  if (myLevel() < 11) {
    return false;
  }
  if (myPath() !== $path`Standard`) {
    if (!inAftercore()) {
      return false;
    }
  }

  if (internalQuestStatus("questS01OldGuy") < 0) {
    visitUrl("oldman.php");
    visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
  }
  const old: Familiar = myFamiliar();
  useFamiliar($familiar`Space Jellyfish`);
  visitUrl("place.php?whichplace=thesea");
  visitUrl("place.php?whichplace=thesea&action=thesea_left2");
  visitUrl("choice.php?pwd=&whichchoice=1219&option=1");
  useFamiliar(old);
  return true;
}

export function auto_breatheOutsLeft(): number {
  return get("_hotJellyUses");
}
