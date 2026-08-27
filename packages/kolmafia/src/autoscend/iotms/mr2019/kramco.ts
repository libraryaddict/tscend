import {
  ceil,
  cliExecute,
  create,
  eat,
  Item,
  itemAmount,
  Location,
  max,
  min,
  myAdventures,
  myDaycount,
  myLevel,
  myMaxmp,
  myMeat,
  myMp,
  myTurncount,
  toFloat,
  totalTurnsPlayed,
} from "kolmafia";
import { $item, $location, $modifier, get, set } from "libram";

import { autoAdv, CombatMacro } from "../../auto_adventure";
import {
  auto_canEat,
  consumptionProgress,
  stomach_left,
} from "../../auto_consume";
import {
  autoEquip,
  equipMaximizedGear,
  possessEquipment,
} from "../../auto_equipment";
import {
  auto_burnMP,
  auto_can_equip,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  isDesertAvailable,
  loopHandlerDelayAll,
  meatReserve,
  wrap_item,
} from "../../auto_util";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { maximizer } from "../../utils/maximizer";

// This is meant for items that have a date of 2019

//Defined in autoscend/iotms/mr2019.ash
function auto_sausageEaten(): number {
  return get("_sausagesEaten");
}

function auto_sausageLeftToday(): number {
  return 23 - auto_sausageEaten();
}

function auto_sausageUnitsNeededForSausage(numSaus: number): number {
  return 111 * numSaus;
}

function auto_sausageMeatPasteNeededForSausage(numSaus: number): number {
  return ceil(toFloat(auto_sausageUnitsNeededForSausage(numSaus)) / 10.0);
}

export function auto_sausageFightsToday(): number {
  return get("_sausageFights");
}

export function auto_sausageBlocked(): boolean {
  if (in_tcrs()) {
    return true;
  }

  if (!auto_canEat($item`magical sausage`)) {
    return true;
  }

  if (auto_sausageLeftToday() <= 0) {
    return true;
  }

  if (stomach_left() < 0) {
    //can still be eaten with===0
    return true;
  }

  return false;
}

export function auto_sausageWanted(): boolean {
  if (auto_sausageBlocked()) {
    return false;
  }
  // if adventures not needed yet, leave most sausages to acquireMP()
  if (myAdventures() > 10) {
    // only grind up to one per level in reserve instead of always grinding all the meat that isn't nailed down
    auto_sausageGrind(myLevel() - get("_sausagesMade"));
    // it would be a good idea to eat one early on for MP but 2-3 things currently don't allow it:
    // auto_sausageGrind wants 90 turncount and desert unlocked, acquireMP() wants it to restore at least 300 MP
    return false;
  }
  // grind and eat sausages once adventures are needed, progressively with eating or drinking to keep a steady source of MP

  if (auto_sausageLeftToday() <= 0) {
    return false;
  }

  const sausageMade: number = get("_sausagesMade");
  let sausageForBreakfast: number; // estimate up to how many sausages before drinks and food?
  let totalSausageEstimated: number; // estimate up to how many sausages by the time liver and stomach will be full?
  // are there more casings from previous days or copied goblins?
  const extraCasings: number =
    itemAmount($item`magical sausage casing`) +
    sausageMade -
    auto_sausageFightsToday();

  if (myDaycount() === 1) {
    // by the time turn 90 allows grinding now, organs will not be empty and more sausages may be eaten anyways
    sausageForBreakfast = 1;
    totalSausageEstimated = max(9, sausageMade);
  } else {
    sausageForBreakfast = 6;
    // are there more sausages left from previous days?
    const extraSausage: number =
      itemAmount($item`magical sausage`) + auto_sausageEaten() - sausageMade;
    totalSausageEstimated = min(23, 13 + extraCasings + extraSausage);
    totalSausageEstimated = max(totalSausageEstimated, sausageMade);
  }
  // if expectations for today have already been reached lift them
  if (auto_sausageEaten() >= totalSausageEstimated) {
    totalSausageEstimated = 23;
  }
  // sausage consumption progresses with eating or drinking
  const progress: number = consumptionProgress();
  let totalSausageToEat: number =
    ceil(progress * (totalSausageEstimated - sausageForBreakfast)) +
    sausageForBreakfast;
  // a reserve is kept for MP restoration
  const noMP: boolean = in_darkGyffte();
  let sausage_reserve_size: number = noMP ? 0 : 3;
  // no more reserve when close to full or when completely out of adventures
  if (progress > 0.9) {
    sausage_reserve_size = 2;
  }
  if (progress > 0.95) {
    sausage_reserve_size = 1;
  }
  if (myAdventures() === 0) {
    sausage_reserve_size = 0;
  }
  // the reserve also needs to be planned inside the daily limit
  totalSausageToEat = min(totalSausageToEat, 23 - sausage_reserve_size);
  // try to grind up to the reserve on top of what we want to eat
  const totalSausageToGrind: number = totalSausageToEat + sausage_reserve_size;
  const sausageToGrind: number = min(23, totalSausageToGrind) - sausageMade;

  auto_sausageGrind(sausageToGrind);
  // eat if there is enough after grinding to respect the reserve
  let sausageToEat: number = totalSausageToEat - auto_sausageEaten();
  const sausageAvailable: number =
    itemAmount($item`magical sausage`) - sausage_reserve_size;
  sausageToEat = min(sausageToEat, sausageAvailable);

  if (sausageToEat > 0) {
    return auto_sausageEatEmUp(sausageToEat);
  }

  return false;
}

export function auto_sausageGrind(
  numSaus: number,
  failIfCantMakeAll: boolean = false,
): boolean {
  // Some paths are pretty meat-intensive early. Just in case...
  if (myTurncount() < 90 || !isDesertAvailable()) {
    return false;
  }

  if (in_tcrs()) {
    return false;
  }

  const casingsOwned: number = itemAmount($item`magical sausage casing`);

  if (casingsOwned === 0) {
    return false;
  }
  //it is actually possible to have a casing but not have the kramco grinder
  if (!possessEquipment(wrap_item($item`Kramco Sausage-o-Matic™`))) {
    return false;
  }

  if (numSaus <= 0) {
    return false;
  }

  if (casingsOwned < numSaus) {
    if (failIfCantMakeAll) {
      return false;
    }
    numSaus = casingsOwned;
  }

  const sausMade: number = get("_sausagesMade");
  let pastesNeeded: number = 0;
  const pastesAvail: number = itemAmount($item`meat paste`);
  const meatToSave: number = 1000 + meatReserve();
  for (
    let i = 1,
      _last_3 = numSaus,
      _step_3 = 1,
      _up_3 = i <= _last_3,
      _inc_3 = _up_3 ? Math.abs(_step_3) : -Math.abs(_step_3);
    _up_3 ? i <= _last_3 : i >= _last_3;
    i += _inc_3
  ) {
    const sausNum: number = i + sausMade;
    const pastesForThisSaus: number =
      auto_sausageMeatPasteNeededForSausage(sausNum);
    if (
      (pastesNeeded + pastesForThisSaus - pastesAvail) * 10 + meatToSave >
      myMeat()
    ) {
      if (failIfCantMakeAll) {
        return false;
      }
      if (i === 1) {
        return false;
      }
      numSaus = i - 1;
      break;
    }
    pastesNeeded += pastesForThisSaus;
  }

  auto_log_info("Let's grind some sausage!", "blue");
  if (!create(numSaus, $item`magical sausage`)) {
    auto_log_warning("Something went wrong while grinding sausage...", "red");
    return false;
  }
  loopHandlerDelayAll();

  return true;
}

export function auto_sausageEatEmUp(maxToEat: number): boolean {
  if (auto_sausageBlocked()) {
    return false;
  }
  // sausage_reserve_size is handled in auto_sausageWanted()

  if (itemAmount($item`magical sausage`) < 1) {
    return false;
  }

  const noMP: boolean = in_darkGyffte();
  const originalMp: number = myMaxmp();
  if (!noMP) {
    auto_log_info(
      "We're gonna slurp up some sausage, let's make sure we have enough max mp",
      "blue",
    );
    cliExecute("checkpoint");
    maximizer.weight($modifier`Maximum MP`, 1000).require("Tie", false);
    equipMaximizedGear();
  }
  // I could optimize this a little more by eating more sausage at once if you have enough max mp...
  // but meh.
  while (maxToEat > 0 && itemAmount($item`magical sausage`) > 0) {
    if (auto_sausageLeftToday() <= 0) {
      break;
    }
    if (!noMP) {
      const desiredMp: number = max(myMaxmp() - 999, 0);
      const mpToBurn: number = max(myMp() - desiredMp, 0);
      if (mpToBurn > 0) {
        auto_burnMP(mpToBurn);
      }
    }

    if (!eat(1, $item`magical sausage`)) {
      auto_log_warning("Somehow failed to eat a sausage! What??", "red");
      return false;
    }
    handleTracker({
      what: $item`magical sausage`,
      property: "auto_eaten",
    });
    maxToEat--;
  }
  // burn any mp that'll go away when equipment switches back
  if (!noMP) {
    const mpToBurn: number = max(myMp() - originalMp, 0);
    if (mpToBurn > 0) {
      auto_burnMP(mpToBurn);
    }
    cliExecute("outfit checkpoint");
  }

  return true;
}

export function auto_haveKramcoSausageOMatic(): boolean {
  const kramco: Item = wrap_item($item`Kramco Sausage-o-Matic™`);
  if (possessEquipment(kramco) && auto_can_equip(kramco)) {
    return true;
  }
  return false;
}

export function auto_sausageGoblin(
  loc: Location = $location.none,
  option?: CombatMacro,
): boolean {
  // Sausage Goblins have super low encounter priority so they will be overriden
  // by all sorts stuff like superlikelies, wanderers and semi-rares.
  // The good news is, being overridden just means adventure there again to get it

  if (!auto_haveKramcoSausageOMatic()) {
    return false;
  }
  // Formula = (y+1) / (5+x*3+max(0,x-5)^3)
  // y is turns since the last goblin
  // x is the number of goblins you've already encountered that day.
  // spoilered by The Dictator in ASS Discord #iotm-discussion
  // intervals are therefore 0, 7, 10, 13, 16, 19, 23, 33, 55, 95, 128...
  const sausageFights: number = get("_sausageFights");
  const numerator: number =
    totalTurnsPlayed() - get("_lastSausageMonsterTurn") + 1.0;
  const denominator: number =
    5.0 + sausageFights * 3.0 + max(0.0, sausageFights - 5.0) ** 3.0;
  if (sausageFights > 0 && numerator / denominator < 1.0) {
    return false;
  }

  if (loc === $location.none) {
    return true;
  }

  if (autoEquip(wrap_item($item`Kramco Sausage-o-Matic™`))) {
    set("auto_nextEncounter", "sausage goblin");
    return autoAdv(loc, option);
  }
  set("auto_nextEncounter", "");
  return false;
}
