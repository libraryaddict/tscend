import {
  availableAmount,
  cliExecute,
  craft,
  Item,
  itemAmount,
  min,
  myMeat,
  splitString,
  toInt,
} from "kolmafia";
import { $item, $items, get } from "libram";

import { canUntinker, untinker } from "../../auto_craft";
import { auto_is_valid } from "../../auto_util";

function auto_havePowerPlant(): boolean {
  return (
    itemAmount($item`potted power plant`) > 0 &&
    auto_is_valid($item`potted power plant`)
  );
}

export function auto_harvestBatteries(): boolean {
  if (!auto_havePowerPlant() || get("_pottedPowerPlant") === "0,0,0,0,0,0,0") {
    return false;
  }
  // Stolen straight from mafia's breakfast handling.
  cliExecute(`inv_use.php?pwd&whichitem=${toInt($item`potted power plant`)}`);

  const status: Map<number, string> = new Map(
    splitString(get("_pottedPowerPlant"), ",").map((_v, _i) => [_i, _v]),
  );

  for (let pp: number = 0; pp < status.size; pp++) {
    if (toInt(status.get(pp) ?? "") > 0) {
      cliExecute(`choice.php?pwd&whichchoice=1448&option=1&pp=${pp + 1}`);
    }
  }
  return true;
}

// These points the value of a battery represented in AAAs.
let $_batteryPoints_points: Map<Item, number> | undefined;

function batteryPoints(battery: Item): number {
  $_batteryPoints_points ??= new Map([
    [$item`battery (AAA)`, 1],
    [$item`battery (AA)`, 2],
    [$item`battery (D)`, 3],
    [$item`battery (9-Volt)`, 4],
    [$item`battery (lantern)`, 5],
    [$item`battery (car)`, 6],
  ]);
  return $_batteryPoints_points.get(battery) ?? 0;
}

// These points represent a quantity of AAAs if all batteries were untinkered.
function totalBatteryPoints(): number {
  let totalPoints: number = 0;

  for (const it of $items`battery (AAA), battery (AA), battery (D), battery (9-Volt), battery (lantern), battery (car)`) {
    totalPoints += availableAmount(it) * batteryPoints(it);
  }

  return totalPoints;
}

function batteryCombine(battery: Item, simulate: boolean = false): boolean {
  // Mafia's create() function only allows one single recipe for crafting batteries. This can result in situations where you can in fact craft a battery but it fails due to it not being the singular recipe supported by it.
  // Mafia's can_create() has the same issue. use simulate in this function to determine if we can actually create a battery (or already have it).
  // To get batteries use can_get_battery() and auto_getBattery(), which will be calling this function and untinker as necessary
  // This is very dense, apologies.
  if (batteryPoints(battery) === 0) {
    //0 means it is not a battery
    return false;
  }
  // We already have this battery, no need to make more yet.
  if (availableAmount(battery) >= 1) {
    return true;
  }
  // We're targetting a AA.
  if (battery === $item`battery (AA)`) {
    // There's only one way to craft a AA.
    if (availableAmount($item`battery (AAA)`) >= 2) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (AAA)`, $item`battery (AAA)`);
      return availableAmount($item`battery (AA)`) >= 1;
    }
    return false;
  } else if (battery === $item`battery (D)`) {
    // From here on out, we try to resolve the crafting in a single step if possible, starting with largest battery + smallest battery.
    if (
      availableAmount($item`battery (AA)`) >= 1 &&
      availableAmount($item`battery (AAA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (AA)`, $item`battery (AAA)`);
      return availableAmount($item`battery (D)`) >= 1;
    } else if (
      availableAmount(
        // If crafting requires multiple steps, we rely on recursion.
        $item`battery (AAA)`,
      ) >= 3
    ) {
      if (simulate) {
        return true;
      }
      batteryCombine($item`battery (AA)`);
      craft("combine", 1, $item`battery (AA)`, $item`battery (AAA)`);
      return availableAmount($item`battery (D)`) >= 1;
    }
    return false;
  } else if (battery === $item`battery (9-Volt)`) {
    // Single step.
    if (
      availableAmount($item`battery (D)`) >= 1 &&
      availableAmount($item`battery (AAA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (D)`, $item`battery (AAA)`);
      return availableAmount($item`battery (9-Volt)`) >= 1;
    } else if (
      availableAmount(
        // Single step.
        $item`battery (AA)`,
      ) >= 2
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (AA)`, $item`battery (AA)`);
      return availableAmount($item`battery (9-Volt)`) >= 1;
    } else if (
      availableAmount(
        // Every multi step case with recursion.
        $item`battery (AAA)`,
      ) >= 4 ||
      (availableAmount($item`battery (AA)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 2)
    ) {
      if (simulate) {
        return true;
      }
      batteryCombine($item`battery (D)`);
      craft("combine", 1, $item`battery (D)`, $item`battery (AAA)`);
      return availableAmount($item`battery (9-Volt)`) >= 1;
    }
    return false;
  } else if (battery === $item`battery (lantern)`) {
    // Single step.
    if (
      availableAmount($item`battery (9-Volt)`) >= 1 &&
      availableAmount($item`battery (AAA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (9-Volt)`, $item`battery (AAA)`);
      return availableAmount($item`battery (lantern)`) >= 1;
    } else if (
      availableAmount(
        // Single step.
        $item`battery (D)`,
      ) >= 1 &&
      availableAmount($item`battery (AA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (D)`, $item`battery (AA)`);
      return availableAmount($item`battery (lantern)`) >= 1;
    } else if (
      availableAmount(
        // Every multi step case with recursion.
        $item`battery (AAA)`,
      ) >= 5 ||
      (availableAmount($item`battery (AA)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 3) ||
      (availableAmount($item`battery (D)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 2) ||
      (availableAmount($item`battery (AA)`) >= 2 &&
        availableAmount($item`battery (AAA)`) >= 1)
    ) {
      if (simulate) {
        return true;
      }
      batteryCombine($item`battery (9-Volt)`);
      craft("combine", 1, $item`battery (9-Volt)`, $item`battery (AAA)`);
      return availableAmount($item`battery (lantern)`) >= 1;
    }
    return false;
  } else if (battery === $item`battery (car)`) {
    // Single step.
    if (
      availableAmount($item`battery (lantern)`) >= 1 &&
      availableAmount($item`battery (AAA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (lantern)`, $item`battery (AAA)`);
      return availableAmount($item`battery (car)`) >= 1;
    } else if (
      availableAmount(
        // Single step.
        $item`battery (9-Volt)`,
      ) >= 1 &&
      availableAmount($item`battery (AA)`) >= 1
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (9-Volt)`, $item`battery (AA)`);
      return availableAmount($item`battery (car)`) >= 1;
    } else if (
      availableAmount(
        // Single step.
        $item`battery (D)`,
      ) >= 2
    ) {
      if (simulate) {
        return true;
      }
      craft("combine", 1, $item`battery (D)`, $item`battery (D)`);
      return availableAmount($item`battery (car)`) >= 1;
    } else if (
      availableAmount(
        // The only multi-step case that can't be resolved by the same function (can't turn AAs into a lantern without a AA or D)
        $item`battery (AA)`,
      ) >= 3
    ) {
      if (simulate) {
        return true;
      }
      batteryCombine($item`battery (9-Volt)`);
      craft("combine", 1, $item`battery (9-Volt)`, $item`battery (AA)`);
      return availableAmount($item`battery (car)`) >= 1;
    } else if (
      availableAmount(
        // Every other multi step case with recursion.
        $item`battery (AAA)`,
      ) >= 6 ||
      (availableAmount($item`battery (AA)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 4) ||
      (availableAmount($item`battery (D)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 3) ||
      (availableAmount($item`battery (9-Volt)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 2) ||
      (availableAmount($item`battery (AA)`) >= 2 &&
        availableAmount($item`battery (AAA)`) >= 2) ||
      (availableAmount($item`battery (D)`) >= 1 &&
        availableAmount($item`battery (AA)`) >= 1 &&
        availableAmount($item`battery (AAA)`) >= 1)
    ) {
      if (simulate) {
        return true;
      }
      batteryCombine($item`battery (lantern)`);
      craft("combine", 1, $item`battery (lantern)`, $item`battery (AAA)`);
      return availableAmount($item`battery (car)`) >= 1;
    }
  }
  return false;
}

export function can_get_battery(target: Item): boolean {
  if (batteryPoints(target) === 0) {
    //0 means target is not a battery
    return false;
  }
  if (availableAmount(target) > 0) {
    //already have it
    return true;
  }
  if (canUntinker()) {
    return totalBatteryPoints() >= batteryPoints(target); //we can untinker. so just count battery points
  }
  return batteryCombine(target, true); //can not untinker. only check meatpasting by simulating batteryCombine
}

export function auto_getBattery(target: Item): boolean {
  // This function will ensure target battery is available before use, if possible.
  if (batteryPoints(target) === 0) {
    //0 means target is not a battery
    return false;
  }
  if (availableAmount(target) >= 1) {
    return true; //we already have the target. we are done here
  }
  //try to create target
  if (batteryCombine(target)) {
    return true;
  }
  //try to use untinkering to get target or enough AAA to make target
  if (totalBatteryPoints() >= batteryPoints(target) && canUntinker()) {
    for (const it of $items`battery (car), battery (lantern), battery (9-Volt), battery (D), battery (AA)`) {
      if (myMeat() < 10) {
        break; //we ran out of meat and can no longer meatpaste
      }
      //Batteries always untinker into an [AAA] and an [X-1] battery. where X was previous battery value.
      //so if we have a higher value battery just walk it down to the target.
      if (batteryPoints(it) > batteryPoints(target)) {
        //we have a higher tier battery we can untinker down to target
        untinker(it);
        if (batteryCombine(target)) {
          //either we untinkered down to target. or we got enough AAA to make target now.
          return true;
        }
      } else {
        //all the batteries we had to begin with were smaller than target. They were just the wrong values to merge.
        //so just break them apart until you are able to make target
        for (
          let i = 1,
            _last_4 = min(6, itemAmount(it)),
            _step_4 = 1,
            _up_4 = i <= _last_4,
            _inc_4 = _up_4 ? Math.abs(_step_4) : -Math.abs(_step_4);
          _up_4 ? i <= _last_4 : i >= _last_4;
          i += _inc_4
        ) {
          untinker(it);
          if (batteryCombine(target)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
