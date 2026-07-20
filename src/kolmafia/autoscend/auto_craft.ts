import {
  abort,
  cliExecute,
  craftType,
  getProperty,
  getRelated,
  Item,
  itemAmount,
  myHash,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, $items } from "libram";

import {
  auto_is_valid,
  auto_log_debug$1,
  auto_log_warning$1,
} from "./auto_util";
import { hasLegionKnife } from "./iotms/mr2011";

//Defined in autoscend/auto_craft.ash
function is_foldable(target: Item): boolean {
  //mafia does not provide an easy means of checking if an item possesses the foldable property.
  //This function checks if the item possesses that property. It does not care if you actually have it
  return getRelated(target, "fold").size > 1;
}

function foldable_amount(target: Item): number {
  //counts how many copies we can fold of a certain item.
  if (!is_foldable(target)) {
    return 0;
  }
  let retval: number = 0;
  for (const it of Item.get(Object.keys(getRelated(target, "fold")))) {
    retval += itemAmount(it);
  }
  return retval;
}

export function auto_fold(target: Item): boolean {
  //fold an item using mafia fold cli command. with checks to ensure everything worked as expected.
  if (!is_foldable(target)) {
    auto_log_debug$1(`[${target}] is not foldable`);
    return false;
  }
  if (itemAmount(target) > 0) {
    return true; //we already have the desired item
  }
  if (foldable_amount(target) === 0) {
    auto_log_debug$1(
      `Can not fold [${target}] because we do not possess the required items`,
    );
    return false;
  }
  auto_log_debug$1(`folding [${target}]`);
  const start_amt: number = itemAmount(target);
  cliExecute(`fold ${target}`);
  if (itemAmount(target) === start_amt + 1) {
    return true;
  }
  abort(
    `Mysteriously failed to fold [${target}]. please fold it manually and run me again`,
  );
  return false;
}

function untinkerable(target: Item): boolean {
  //does the item target possess the untinkerable property. this does not care if we actually have it or can untinker. only the property.
  //exceptions that can be untinkered even though they are no longer pasteable
  if ($items`31337 scroll`.includes(target)) {
    return true;
  }
  //exceptions that can not be untinkered even though they are pasteable exist.
  //most return craft_type of "Meatpasting (not untinkerable)" and as such need no special handling.
  //this is special handling for those whom mafia incorrectly returns "Meatpasting" for
  if (
    $items`chaos popcorn, cold clusterbomb, hot clusterbomb, sleaze clusterbomb, spooky clusterbomb, stench clusterbomb`.includes(
      target,
    )
  ) {
    return false;
  }
  return craftType(target) === "Meatpasting";
}

export function canUntinker(target: Item = Item.none): boolean {
  if (target === Item.none) {
    //do we possess the means to untinker.
    if (
      hasLegionKnife() &&
      auto_is_valid($item`Loathing Legion universal screwdriver`)
    ) {
      return true; //universal screwdriver can be used to untinker items
    }
    return getProperty("questM01Untinker") === "finished";
  }
  if (!canUntinker()) {
    auto_log_debug$1(
      `We can not untinker [${target}] because we can not untinker anything right now`,
    );
    return false;
  }
  if (itemAmount(target) === 0) {
    auto_log_debug$1(
      `We can not untinker [${target}] because we do not have any`,
    );
    return false;
  }
  return untinkerable(target);
}

export function untinker(target: Item, amount: number = 1): boolean {
  if (!canUntinker(target)) {
    return false;
  }
  if (amount < 1) {
    auto_log_debug$1(
      `Attempted to untinker [${target}] and detected an invalid desired untinker amount of ${amount}`,
    );
    return false;
  }
  if (itemAmount(target) < amount) {
    auto_log_warning$1(
      `Attempted to untinker ${amount} [${target}] but we only have ${itemAmount(target)}. which is how many we will untinker instead`,
    );
    amount = itemAmount(target); //we can not untinker more than we have
  }

  const untinker_all: boolean = amount === itemAmount(target);
  auto_log_debug$1(`Attempted to untinker ${amount} [${target}]`);
  const start_amt: number = itemAmount(target);
  const LLUS: Item = $item`Loathing Legion universal screwdriver`;

  if (getProperty("questM01Untinker") === "finished") {
    if (untinker_all) {
      visitUrl(
        `place.php?whichplace=forestvillage&action=fv_untinker&pwd=&preaction=untinker&whichitem=${toInt(target)}&untinkerall=on`,
      );
    } else {
      for (
        let i = 1,
          _last = amount,
          _step = 1,
          _up = i <= _last,
          _inc = _up ? Math.abs(_step) : -Math.abs(_step);
        _up ? i <= _last : i >= _last;
        i += _inc
      ) {
        visitUrl(
          `place.php?whichplace=forestvillage&action=fv_untinker&pwd=&preaction=untinker&whichitem=${toInt(target)}`,
        );
      }
    }
  } else if (hasLegionKnife() && auto_is_valid(LLUS) && auto_fold(LLUS)) {
    if (untinker_all) {
      visitUrl(
        `inv_use.php?pwd=${myHash()}&whichitem=4926&action=screw&dowhichitem=${toInt(target)}&untinkerall=on`,
        false,
      );
    } else {
      for (
        let i = 1,
          _last_1 = amount,
          _step_1 = 1,
          _up_1 = i <= _last_1,
          _inc_1 = _up_1 ? Math.abs(_step_1) : -Math.abs(_step_1);
        _up_1 ? i <= _last_1 : i >= _last_1;
        i += _inc_1
      ) {
        visitUrl(
          `inv_use.php?pwd=${myHash()}&whichitem=4926&action=screw&dowhichitem=${toInt(target)}`,
          false,
        );
      }
    }
  }

  const success_amt: number = start_amt - itemAmount(target);
  if (success_amt === amount) {
    return true;
  }
  auto_log_warning$1(
    `Untinkering ${amount} [${target}] mysteriously failed. Only ${success_amt} were untinkered`,
  );
  return false;
}
