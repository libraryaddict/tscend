import {
  blackMarketAvailable,
  Familiar,
  myBasestat,
  myFamiliar,
  myPath,
  myPrimestat,
  totalTurnsPlayed,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $location, $path, $phylum, get, set } from "libram";

import { GodLobster, L11_BlackForest, L11_Pyramid } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv } from "../../executors/auto_adventure";
import { auto_log_error } from "../../utils/auto_log";
import { internalQuestStatus } from "../../utils/auto_util";

//Defined in autoscend/paths/quantum_terrarium.ash
export function in_quantumTerrarium(): boolean {
  return myPath() === $path`Quantum Terrarium`;
}

function qt_turnsToNextQuantumAlignment(): number {
  return totalTurnsPlayed() - get("_nextQuantumAlignment");
}

function LX_quantumTerrariumDo(): boolean {
  switch (myFamiliar()) {
    case $familiar`Machine Elf`:
      // lets order this by familiar ID in ascending order
      // use free fights for experience and abstractions
      if (get("_machineTunnelsAdv") < 5) {
        return autoAdv($location`The Deep Machine Tunnels`);
      }
      break;
    case $familiar`God Lobster`:
      // use free fights for experience
      if (GodLobster.godLobsterFightsRemaining() > 0) {
        if (myBasestat(myPrimestat()) < 70) {
          // 33 advs worth of +10 stats/combat is better than 1.5*70 to all 3 stats
          if (!possessEquipment($item`God Lobster's Scepter`)) {
            // fight it with no equipment to get the Scepter
            return GodLobster.godLobsterCombat($item.none, 1);
          } else {
            // fight it with the Scepter for the stats buff
            return GodLobster.godLobsterCombat($item`God Lobster's Scepter`, 2);
          }
        } else {
          // get experience
          return GodLobster.godLobsterCombat();
        }
      }
      break;
    case $familiar`Reassembled Blackbird`:
      if (!(
        internalQuestStatus("questL11Black") < 0 ||
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable()
      )) {
        return L11_BlackForest.L11_blackMarket();
      }
      break;
    case $familiar`Reconstituted Crow`:
      if (!(
        internalQuestStatus("questL11Black") < 0 ||
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable()
      )) {
        return L11_BlackForest.L11_blackMarket();
      }
      break;
    case $familiar`Melodramedary`:
      if (!(
        internalQuestStatus("questL11Desert") !== 0 ||
        get("desertExploration") >= 100
      )) {
        return L11_Pyramid.L11_aridDesert();
      }
      break;
    default:
      break;
  }
  return false;
}

registerQuestTask({
  name: "LX_quantumTerrarium",
  completed: () => !in_quantumTerrarium(),
  ready: () => true,
  do: LX_quantumTerrariumDo,
  locations: $location`The Deep Machine Tunnels`,
  desiredEncounters: () => [
    {
      monster: $phylum`weird`,
      needAmount:
        myFamiliar() === $familiar`Machine Elf`
          ? 5 - get("_machineTunnelsAdv")
          : 0,
    },
  ],
});

export function qt_initializeSettings(): void {
  if (in_quantumTerrarium()) {
    set("auto_skipNuns", true); //Remove when leprechaun swapping is supported at nuns.
  }
}

function qt_FamiliarAvailable(fam: Familiar): boolean {
  //Check to see if target familiar can be forced.
  const qt_FamiliarKey: string = `<option value="${fam.id.toString()}">`;
  const qt_TerrariumPage: string = visitUrl("qterrarium.php");
  if (qt_turnsToNextQuantumAlignment() > 1) {
    return false;
  } else if (qt_TerrariumPage.includes(qt_FamiliarKey)) {
    return true;
  } else {
    return false;
  }
}

export function qt_FamiliarSwap(fam: Familiar): boolean {
  //Swap/designate next familiar swap if possible.
  if (fam === $familiar.none) {
    auto_log_error(
      `${fam.toString()} is not a valid familiar, weird behaviour.`,
    );
    return false;
  } else if (qt_FamiliarAvailable(fam)) {
    visitUrl(`qterrarium.php?pwd=&action=fam&fid=${fam.id}`);
    return true;
  } else {
    return false;
  }
}

export function auto_refreshQTFam(): void {
  if (in_quantumTerrarium()) {
    // go to familiar page to ensure QT mafia prefs are up to date
    visitUrl("familiar.php");
  }
}
