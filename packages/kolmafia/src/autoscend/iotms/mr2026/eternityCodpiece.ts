import { availableAmount, Item } from "kolmafia";
import { $item, EternityCodpiece } from "libram";

import { auto_is_valid } from "../../utils/auto_util";

// This is meant for items that have a date of 2026
export function haveEternityCodpiece(): boolean {
  if (
    auto_is_valid($item`The Eternity Codpiece`) &&
    availableAmount($item`The Eternity Codpiece`) > 0
  ) {
    return true;
  }
  return false;
}

export function isInEternityCodpiece(it: Item): boolean {
  return EternityCodpiece.currentGems().includes(it);
}
