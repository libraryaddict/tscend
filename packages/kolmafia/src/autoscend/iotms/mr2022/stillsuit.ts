import {
  equip,
  Familiar,
  familiarEquippedEquipment,
  haveFamiliar,
  itemAmount,
  myFamiliar,
  retrieveItem,
  round,
} from "kolmafia";
import { $familiar, $familiars, $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import {
  handleFamiliar$1,
  is100FamRun,
  pathAllowsChangingFamiliar,
} from "../../auto_familiar";
import {
  auto_is_valid,
  auto_is_valid$1,
  auto_log_warning,
  safeGet,
} from "../../auto_util";

export function auto_hasStillSuit(): boolean {
  return (
    possessEquipment($item`tiny stillsuit`) &&
    auto_is_valid($item`tiny stillsuit`)
  );
}

export function auto_expectedStillsuitAdvs(): number {
  if (!auto_hasStillSuit()) {
    return 0;
  }
  const sweat: number = get("familiarSweat");
  // can't consume until at least 10 sweat has been accumulated
  if (sweat < 10) {
    return 0;
  }

  return round(sweat ** 0.4);
}

export function utilizeStillsuit(): void {
  //called at the end of pre adv to make sure stillsuit is at least kept equipped on a familiar in the terrarium
  if (!auto_hasStillSuit()) {
    return;
  }
  //if there is a tiny stillsuit in inventory then unless there was a tracking error it is not worn by any familiar
  if (!pathAllowsChangingFamiliar()) {
    return;
  }
  //make sure all this nice familiar sweat doesn't go uncollected when current familiar is wearing something else
  if (familiarEquippedEquipment(myFamiliar()) === $item`tiny stillsuit`) {
    return;
  }

  function sweetestSweatFamiliar(): Familiar {
    const currentFamiliar: Familiar = myFamiliar();
    //todo better choice of best familiar effects
    for (const sweetSweatFamiliar of $familiars`Grinning Turtle, Grouper Groupie, Star Starfish, Cat Burglar, Slimeling, Sleazy Gravy Fairy`) {
      //these give item and sleaze
      if (
        haveFamiliar(sweetSweatFamiliar) &&
        auto_is_valid$1(sweetSweatFamiliar) &&
        sweetSweatFamiliar !== currentFamiliar
      ) {
        return sweetSweatFamiliar;
      }
    }
    for (const commonFamiliar of $familiars`Baby Gravy Fairy, Smiling Rat, Mosquito, Reassembled Blackbird`) {
      //default fall back, you probably have one of these
      if (
        haveFamiliar(commonFamiliar) &&
        auto_is_valid$1(commonFamiliar) &&
        commonFamiliar !== currentFamiliar
      ) {
        return commonFamiliar;
      }
    }
    for (const anyFamiliar of $familiars.all()) {
      //if all else failed just pick any available familiar that can wear equipment
      if (
        haveFamiliar(anyFamiliar) &&
        auto_is_valid$1(anyFamiliar) &&
        anyFamiliar !== currentFamiliar &&
        !$familiars`Comma Chameleon, Mad Hatrack, Fancypants Scarecrow, Disembodied Hand, Ghost of Crimbo Carols, Ghost of Crimbo Cheer, Ghost of Crimbo Commerce`.includes(
          anyFamiliar,
        )
      ) {
        return anyFamiliar;
      }
    }
    return $familiar.none;
  }
  const chosenStillsuitFamiliar: Familiar = sweetestSweatFamiliar();
  if (
    familiarEquippedEquipment(chosenStillsuitFamiliar) !== $item`tiny stillsuit`
  ) {
    if (itemAmount($item`tiny stillsuit`) === 0) {
      retrieveItem($item`tiny stillsuit`);
    }
    if (itemAmount($item`tiny stillsuit`) > 0) {
      equip(chosenStillsuitFamiliar, $item`tiny stillsuit`);
    } else {
      auto_log_warning(
        "Failed to recover tiny stillsuit from the familiar mafia thinks is wearing it",
      );
    }
    if (is100FamRun()) {
      handleFamiliar$1(safeGet("auto_100familiar")); //just make extra sure this didnt break 100 familiar runs but familiar should not have been swapped
    }
  }
}
