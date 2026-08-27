import {
  getRelated,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
} from "kolmafia";
import { $item } from "libram";

import { canPull, pullXWhenHaveY } from "../../auto_acquire";
import { auto_log_warning } from "../../auto_util";

export function hasLegionKnife(): boolean {
  //checks if we have the [Loathing Legion knife] in any one of its foldable forms.
  if (!isUnrestricted($item`Loathing Legion knife`)) {
    //not auto_is_valid as some paths might restrict specific forms only
    return false;
  }
  if (inHardcore()) {
    return false; //LLK specifically does not work in hardcore.
  }
  //we need to check all possible forms it might be in
  for (const it of Item.get(
    Object.keys(getRelated($item`Loathing Legion knife`, "fold")),
  )) {
    if (itemAmount(it) > 0) {
      return true;
    }
  }
  return false;
}

export function pullLegionKnife(): boolean {
  //acquire the [Loathing Legion knife] if we do not already have it.
  if (!isUnrestricted($item`Loathing Legion knife`)) {
    //not auto_is_valid as some paths might restrict specific forms only
    return false;
  }
  if (inHardcore()) {
    return false; //loathing legion knife is not usable in hardcore
  }
  if (hasLegionKnife()) {
    return true; //already have it
  }
  let target: Item = $item.none;
  for (const it of Item.get(
    Object.keys(getRelated($item`Loathing Legion knife`, "fold")),
  )) {
    if (canPull(it)) {
      target = it;
      break;
    }
  }
  if (target === $item.none) {
    return false; //we do not have the item to pull
  }
  const start_amt: number = itemAmount(target);
  pullXWhenHaveY(target, 1, 0);
  if (itemAmount(target) === 1 + start_amt) {
    return true;
  }
  auto_log_warning(
    `Mysteriously failed to pull [${target}]. even though we should have been able to get it`,
    "red",
  );
  return false;
}
