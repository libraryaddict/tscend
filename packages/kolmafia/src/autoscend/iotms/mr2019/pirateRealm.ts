import { isUnrestricted, myAdventures, visitUrl } from "kolmafia";
import { $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";

function pirateRealmAvailable(): boolean {
  if (!isUnrestricted($item`PirateRealm membership packet`)) {
    return false;
  }
  if (get("prAlways") || get("_prToday")) {
    return true;
  }
  return false;
}

function LX_unlockPirateRealmDo(): boolean {
  visitUrl("place.php?whichplace=realm_pirate&action=pr_port");
  return true;
}

export const LX_unlockPirateRealmTask: QuestTask = registerQuestTask({
  name: "LX_unlockPirateRealm",
  completed: () =>
    possessEquipment($item`PirateRealm eyepatch`) || !pirateRealmAvailable(),
  ready: () =>
    pirateRealmAvailable() &&
    !possessEquipment($item`PirateRealm eyepatch`) &&
    myAdventures() >= 40,
  do: LX_unlockPirateRealmDo,
});

export function LX_unlockPirateRealm(): boolean {
  return runQuestTask(LX_unlockPirateRealmTask);
}
