import { availableAmount } from "kolmafia";
import { $item } from "libram";

import { auto_is_valid } from "../../auto_util";

export function haveSpringShoes(): boolean {
  if (
    auto_is_valid($item`spring shoes`) &&
    availableAmount($item`spring shoes`) > 0
  ) {
    return true;
  }
  return false;
}
