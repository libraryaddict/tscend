import {
  bjornifyFamiliar,
  equippedItem,
  Familiar,
  haveFamiliar,
  inHardcore,
  myBjornedFamiliar,
  myFamiliar,
} from "kolmafia";
import { $familiar, $item, $slot, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { canChangeFamiliar } from "../../auto_familiar";
import { auto_is_valid } from "../../auto_util";
import { bridgeGoal } from "../../quests/level_09";

//	This is meant for items that have a date of 2014.
//	Handling: Bjorn, Little Geneticist DNA-Splicing Lab, Xi-Receiver Unit
//

//Defined in autoscend/iotms/mr2014.ash
export function handleBjornify(fam: Familiar): boolean {
  if (inHardcore()) {
    return false;
  }

  if (equippedItem($slot`back`) !== $item`Buddy Bjorn`) {
    return false;
  }

  if (myBjornedFamiliar() === fam) {
    return true;
  }

  if (!canChangeFamiliar() && fam === myFamiliar()) {
    return false;
  }

  if (haveFamiliar(fam)) {
    bjornifyFamiliar(fam);
  } else {
    if (haveFamiliar($familiar`El Vibrato Megadrone`)) {
      bjornifyFamiliar($familiar`El Vibrato Megadrone`);
    } else {
      if (
        myFamiliar() !== $familiar`Grimstone Golem` &&
        haveFamiliar($familiar`Grimstone Golem`)
      ) {
        bjornifyFamiliar($familiar`Grimstone Golem`);
      } else if (haveFamiliar($familiar`Adorable Seal Larva`)) {
        bjornifyFamiliar($familiar`Adorable Seal Larva`);
      } else {
        return false;
      }
    }
  }
  return true;
}

export function considerGrimstoneGolem(bjornCrown: boolean): boolean {
  if (!haveFamiliar($familiar`Grimstone Golem`)) {
    return false;
  }
  if (!auto_is_valid($item`grimstone mask`)) {
    return false;
  }

  if (bjornCrown && get("_grimstoneMaskDropsCrown") !== 0) {
    return false;
  }

  if (
    get("desertExploration") >= 70 &&
    get("chasmBridgeProgress") >= bridgeGoal() - 1
  ) {
    return false;
  }

  if (get("chasmBridgeProgress") >= bridgeGoal() - 1) {
    if (!get("auto_grimstoneOrnateDowsingRod", false)) {
      return false;
    }
    if (!auto_is_valid($item`grimstone mask`)) {
      return false;
    }
    if (possessEquipment($item`ornate dowsing rod`)) {
      return false;
    }
  }

  if (get("desertExploration") >= 70) {
    if (!get("auto_grimstoneFancyOilPainting", false)) {
      return false;
    }
  }

  return true;
}
