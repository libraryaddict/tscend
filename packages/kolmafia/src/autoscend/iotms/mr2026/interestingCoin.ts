import {
  buy,
  canInteract,
  creatableAmount,
  Item,
  itemAmount,
  Location,
  Monster,
  sellPrice,
} from "kolmafia";
import { $coinmaster, $item, $skill, get, set } from "libram";

import {
  auto_canChew,
  autoChew,
  can_consume,
  spleen_left,
} from "../../auto_consume";
import {
  auto_is_valid$2,
  auto_saveFreeKillsForDesert,
  auto_wantToFreeKillWithNoDrops,
  handleTracker,
  isFreeMonster,
} from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";

function interestingCoinsSpendable(): number {
  let pref = get("auto_interestingCoins");
  if (!/^-?\d+$/.test(pref)) {
    pref = "1";
  }

  const match = pref.match(/^(-?)(\d+)$/)!;

  const relative = match !== null && match[1] === "-";
  const amount = parseInt(match[2]);
  const coins = itemAmount($item`Interesting Coin`);

  // We can spend only so many coins a day
  if (relative) {
    const spentToday = get("_auto_interestingCoinsSpent", 0);
    // We can spend this many more coins today
    let canSpendToday = amount - spentToday;
    // Don't spend more than we have
    canSpendToday = Math.min(coins, canSpendToday);
    // Don't go below 0
    return Math.max(0, canSpendToday);
  }

  // We can spend as many coins as we have, except for this amount
  return Math.max(0, coins - amount);
}

export function acquireInterestingItem(
  item: Item,
  speculating: boolean = false,
): boolean {
  if (itemAmount(item) > 0) {
    return true;
  }

  const price = sellPrice($coinmaster`interesting`, item);

  if (price > interestingCoinsSpendable()) {
    return false;
  }

  if (speculating) {
    return creatableAmount(item) > 0;
  }

  buy($coinmaster`Interesting Coin`, 1, item);

  if (itemAmount(item) === 0) {
    return false;
  }

  handleTracker({
    tracker: "iotmsUsed",
    iotm: `Spend your Interesting Coins`,
    detail: `Claimed ${item.toString()}`,
  });

  spendInterestingCoins(price);

  return true;
}

export function spendInterestingCoins(count: number) {
  set(
    "_auto_interestingCoinsSpent",
    get("_auto_interestingCoinsSpent", 0) + count,
  );
}

export function chewLiquidAsset(
  estimatedTurnsSaves: number,
  doingBedtime: boolean = false,
  speculative: boolean = false,
): boolean {
  const allowedSizedDiet =
    estimatedTurnsSaves / Math.max(3, get("auto_consumeMinAdvPerFill", 0.0));

  if (
    !can_consume() ||
    !auto_is_valid$2($skill`Exercise Liquidity`) ||
    !auto_canChew($item`liquid asset`) ||
    (!doingBedtime && allowedSizedDiet < $item`liquid asset`.spleen) ||
    spleen_left() < $item`liquid asset`.spleen ||
    (!doingBedtime && isActuallyEd())
  ) {
    return false;
  }

  if (!acquireInterestingItem($item`liquid asset`, speculative)) {
    return false;
  }

  if (speculative) return true;

  if (!autoChew(1, $item`liquid asset`)) {
    return false;
  }

  return true;
}

export function wantToThrowCoinAtEm(loc: Location, enemy: Monster): boolean {
  // returns true if we want to throw interesting coin, based off wantToThrowGravel

  if (get("_interestingCoinHeads", false)) {
    return false;
  }

  if (isFreeMonster(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  if (interestingCoinsSpendable() <= 0) {
    return false;
  }

  if (auto_saveFreeKillsForDesert(enemy)) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}
