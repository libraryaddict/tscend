import { availableAmount } from "kolmafia";
import { $item } from "libram";

import { auto_abort, auto_runChoice } from "../../auto_util";

//	This is meant for items that have a date of 2012

//Defined in autoscend/iotms/mr2012.ash
export function auto_reagnimatedGetPart(): void {
  if (availableAmount($item`gnomish housemaid's kgnee`) === 0) {
    // The housemaid's kgnee is the equipment that justified using the gnome.
    auto_runChoice(4);
  } else if (availableAmount($item`gnomish coal miner's lung`) === 0) {
    // May as well get the rest of these on subsequent days.
    auto_runChoice(2);
  } else if (availableAmount($item`gnomish athlete's foot`) === 0) {
    auto_runChoice(5);
  } else if (availableAmount($item`gnomish tennis elbow`) === 0) {
    auto_runChoice(3);
  } else if (availableAmount($item`gnomish swimmer's ears`) === 0) {
    auto_runChoice(1);
  } else {
    auto_abort("unhandled choice in auto_reagnimatedGetPart");
  }
}
