import {
  canInteract,
  ceil,
  containsText,
  haveFamiliar,
  inHardcore,
  Item,
  itemAmount,
  knollAvailable,
  max,
  min,
  myLevel,
  myLocation,
  myMeat,
  totalTurnsPlayed,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $location, get, set } from "libram";

import { pullXWhenHaveY } from "../../auto_acquire";
import { autoChew, fullness_left, inebriety_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { haveSpleenFamiliar } from "../../auto_familiar";
import {
  auto_freeCrafts,
  auto_get_campground,
  auto_is_valid,
  auto_is_valid$1,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  internalQuestStatus,
  meatReserve,
} from "../../auto_util";
import { in_kolhs } from "../../paths/2013/kolhs";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_small } from "../../paths/2023/small";
import {
  auto_bestWarPlan,
  auto_warKillsPerBattle,
} from "../../quests/level_12";

export function haveColdMedCabinet(): boolean {
  return (
    auto_get_campground().has($item`cold medicine cabinet`) &&
    auto_is_valid($item`cold medicine cabinet`)
  );
}

export function CMCconsultsLeft(): number {
  if (!haveColdMedCabinet()) {
    return 0;
  }
  let consultsUsed: number = get("_coldMedicineConsults");
  if (consultsUsed > 5) {
    auto_log_warning(
      "Mafia's tracking of Cold Medicine Cabinet consults today errored (reported > 5 uses today). Reseting to 5.",
      "red",
    );
    consultsUsed = 5;
  }
  return 5 - consultsUsed;
}

function auto_CMCconsultAvailable(): boolean {
  if (CMCconsultsLeft() === 0) {
    return false;
  }

  const nextConsult: number = get("_nextColdMedicineConsult");
  //prior to first use each day, prop value is 0
  if (nextConsult === 0) {
    return true;
  }
  return totalTurnsPlayed() >= nextConsult;
}

export function CMCconsult(): void {
  //consume previously bought items if conditions are right
  //perhaps pill was bought yesterday with full spleen
  function notAboutToDoNuns(): boolean {
    //should avoid getting more free kill charges when about to do nuns because the fights would be capped to 1000 meat
    if (myLevel() >= 12) {
      if (myLocation() === $location`The Themthar Hills`) {
        return false;
      }
      if (
        myLocation() === $location`The Battlefield (Frat Uniform)` &&
        get("sidequestNunsCompleted") === "none"
      ) {
        const hippiesDefeated: number = get("hippiesDefeated");
        if (hippiesDefeated <= 208 && auto_bestWarPlan().doNuns) {
          const turnsUntilNuns: number = min(
            16,
            ceil(max(0, 191.0 - hippiesDefeated) / auto_warKillsPerBattle()),
          );
          if (get("breathitinCharges") + 5 >= turnsUntilNuns) {
            return false; //may do nuns before breathitin charges get used up
          }
        }
      }
      if (
        get("auto_hippyInstead", false) &&
        internalQuestStatus("questL12War") === 1 &&
        get("sidequestNunsCompleted") === "none"
      ) {
        if (
          auto_bestWarPlan().doNuns &&
          (get("sidequestOrchardCompleted") !== "none" ||
            !auto_bestWarPlan().doOrchard)
        ) {
          return false; //war started and about to start nuns as hippy anytime?
        }
      }
    }
    return true;
  }
  function shouldChewBreathitin(): boolean {
    if (myLocation() === $location`The Hidden Park`) {
      //already free [dense liana] should come right after and would waste charges
      //can't know how many combats will remain in the park which is ideally noncombats
      return false;
    }
    return notAboutToDoNuns();
  }
  if (
    shouldChewBreathitin() &&
    !isActuallyEd() &&
    !haveSpleenFamiliar() &&
    !canInteract()
  ) {
    pullXWhenHaveY($item`Breathitin™`, 1, 0);
  }
  if (
    itemAmount($item`Breathitin™`) > 0 &&
    shouldChewBreathitin() &&
    !canInteract()
  ) {
    autoChew(1, $item`Breathitin™`);
  }
  if (itemAmount($item`Homebodyl™`) > 0 && auto_freeCrafts() < 5) {
    autoChew(1, $item`Homebodyl™`);
  }
  //use fleshazole if we don't have much meat
  if (
    itemAmount($item`Fleshazole™`) > 0 &&
    myMeat() + 2000 < meatReserve() &&
    myLevel() >= 5
  ) {
    autoChew(1, $item`Fleshazole™`);
  }

  if (!auto_CMCconsultAvailable()) {
    return;
  }

  if (get("_auto_coldMedicineLocked", false)) {
    //haven't visited yet since it was last locked so always visit to update available consults
    set("_auto_coldMedicineLocked", false);
  } else if (
    CMCconsultsLeft() <= 2 &&
    auto_freeCrafts() >= 5 &&
    possessEquipment($item`ice crown`) &&
    myMeat() >= meatReserve()
  ) {
    //only looking for Breathitin from at least 11 fights spent underground
    if (myLocation().environment !== "underground") {
      //if Breathitin was not available last turn and last location was not underground it will still not be available now so no visit needed
      return;
    }
  }

  let bestOption: number = -1;
  let consumableBought: Item = $item.none;
  const page: string = visitUrl("campground.php?action=workshed");
  if (containsText(page, "Breathitin")) {
    auto_log_info("Buying Breathitin pill from CMC", "blue");
    bestOption = 5;
    consumableBought = $item`Breathitin™`;
  } else if (
    !(
      auto_is_valid$1($familiar`Cookbookbat`) &&
      haveFamiliar($familiar`Cookbookbat`) &&
      knollAvailable()
    ) &&
    containsText(page, "Homebodyl") &&
    auto_freeCrafts() < 5
  ) {
    // don't need free crafts if we have the Cookbookbat in knoll signs.
    // Cookbookbat gives us 5 free cooks every day & we only use free crafting on cooking in knoll signs
    auto_log_info("Buying Homebodyl pill from CMC", "blue");
    bestOption = 5;
    consumableBought = $item`Homebodyl™`;
  } else if ((!in_small() || inHardcore()) && containsText(page, "ice crown")) {
    // don't need the ice crown in Normal Small as we pull hats.
    auto_log_info("Buying ice crown from CMC", "blue");
    bestOption = 1;
  } else if (
    containsText(page, "Fleshazole") &&
    myMeat() + 2000 < meatReserve()
  ) {
    auto_log_info("Buying Fleshazole pill from CMC", "blue");
    bestOption = 5;
    consumableBought = $item`Fleshazole™`;
  } else if (
    CMCconsultsLeft() > 2 &&
    !canInteract() &&
    !in_small() &&
    !in_kolhs()
  ) {
    //reserve the last 2 consults for something more valuable than booze/food
    //consume logic will drink/eat later
    if (inebriety_left() > 0) {
      auto_log_info("Buying booze from CMC", "blue");
      bestOption = 3;
    } else if (fullness_left() > 0) {
      auto_log_info("Buying food from CMC", "blue");
      bestOption = 2;
    }
  }

  if (bestOption !== -1) {
    set("_auto_coldMedicineLocked", true); //when taking a consultation, set property as a reminder to always check again next time consultations are unlocked
    auto_runChoice(bestOption);
  }

  if (
    consumableBought === $item`Homebodyl™` ||
    (consumableBought === $item`Breathitin™` && shouldChewBreathitin())
  ) {
    autoChew(1, consumableBought);
  }

  if (
    consumableBought === $item`Fleshazole™` &&
    myMeat() < meatReserve() &&
    myLevel() >= 5
  ) {
    autoChew(1, consumableBought);
  }
}
