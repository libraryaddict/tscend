import { availableAmount } from "kolmafia";
import { $item } from "libram";

import { auto_is_valid } from "../../auto_util";

export function auto_haveTearawayPants(): boolean {
  if (
    auto_is_valid($item`tearaway pants`) &&
    availableAmount($item`tearaway pants`) > 0
  ) {
    return true;
  }
  return false;
}
