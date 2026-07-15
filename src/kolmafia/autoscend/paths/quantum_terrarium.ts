import {
  blackMarketAvailable,
  Familiar,
  getProperty,
  Item,
  myBasestat,
  myFamiliar,
  myPath,
  myPrimestat,
  print,
  setProperty,
  toInt,
  totalTurnsPlayed,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $location, $path } from "libram";

import { autoAdv } from "../auto_adventure";
import { possessEquipment } from "../auto_equipment";
import { internalQuestStatus } from "../auto_util";
import {
  auto_godLobsterFightsRemaining,
  godLobsterCombat,
} from "../iotms/mr2018";
import { L11_aridDesert, L11_blackMarket } from "../quests/level_11";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/quantum_terrarium.ash
export function in_quantumTerrarium(): boolean {
  return myPath() === $path`Quantum Terrarium`;
}

function qt_turnsToNextQuantumAlignment(): number {
  return totalTurnsPlayed() - toInt(getProperty("_nextQuantumAlignment"));
}

export function LX_quantumTerrarium(): boolean {
  if (!in_quantumTerrarium()) {
    return false;
  }

  switch (myFamiliar()) {
    case $familiar`Machine Elf`:
      // lets order this by familiar ID in ascending order
      // use free fights for experience and abstractions
      if (toInt(getProperty("_machineTunnelsAdv")) < 5) {
        return autoAdv($location`The Deep Machine Tunnels`);
      }
      break;
    case $familiar`God Lobster`:
      // use free fights for experience
      if (auto_godLobsterFightsRemaining() > 0) {
        if (myBasestat(myPrimestat()) < 70) {
          // 33 advs worth of +10 stats/combat is better than 1.5*70 to all 3 stats
          if (!possessEquipment($item`God Lobster's Scepter`)) {
            // fight it with no equipment to get the Scepter
            return godLobsterCombat(Item.none, 1);
          } else {
            // fight it with the Scepter for the stats buff
            return godLobsterCombat($item`God Lobster's Scepter`, 2);
          }
        } else {
          // get experience
          return godLobsterCombat();
        }
      }
      break;
    case $familiar`Reassembled Blackbird`:
      if (!(
        internalQuestStatus("questL11Black") < 0 ||
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable()
      )) {
        return L11_blackMarket();
      }
      break;
    case $familiar`Reconstituted Crow`:
      if (!(
        internalQuestStatus("questL11Black") < 0 ||
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable()
      )) {
        return L11_blackMarket();
      }
      break;
    case $familiar`Melodramedary`:
      if (!(
        internalQuestStatus("questL11Desert") !== 0 ||
        toInt(getProperty("desertExploration")) >= 100
      )) {
        return L11_aridDesert();
      }
      break;
    default:
      break;
  }
  return false;
}

export function qt_initializeSettings(): void {
  if (in_quantumTerrarium()) {
    setProperty("auto_skipNuns", true.toString()); //Remove when leprechaun swapping is supported at nuns.
  }
}

function qt_FamiliarAvailable(fam: Familiar): boolean {
  //Check to see if target familiar can be forced.
  const qt_FamiliarKey: string = `<option value="${toInt(fam).toString()}">`;
  const qt_TerrariumPage: string = visitUrl("qterrarium.php");
  const qt_FamiliarSearch: AshMatcher = new AshMatcher(
    qt_FamiliarKey,
    qt_TerrariumPage,
  );

  if (qt_turnsToNextQuantumAlignment() > 1) {
    return false;
  } else if (qt_FamiliarSearch.find()) {
    return true;
  } else {
    return false;
  }
}

export function qt_FamiliarSwap(fam: Familiar): boolean {
  //Swap/designate next familiar swap if possible.
  if (fam === Familiar.none) {
    print(`${fam.toString()} is not a valid familiar, weird behaviour.`);
    return false;
  } else if (qt_FamiliarAvailable(fam)) {
    visitUrl(`qterrarium.php?pwd=&action=fam&fid=${toInt(fam)}`);
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
