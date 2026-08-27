import { cliExecuteOutput, containsText, Item, myLevel } from "kolmafia";
import { $familiar, $item, set } from "libram";

import {
  auto_abort,
  auto_is_valid$1,
  auto_log_info,
  safeGet,
} from "../../auto_util";

export function auto_buyCrimboCommerceMallItem(): boolean {
  if (!auto_is_valid$1($familiar`Ghost of Crimbo Commerce`)) {
    return false;
  }

  const ghostItem: Item = safeGet("commerceGhostItem");
  if (ghostItem === $item.none) {
    // haven't triggered the greedy ghost message at least once yet.
    return false;
  }

  if (safeGet("auto_boughtCommerceGhostItem") === ghostItem) {
    // already bought the item.
    return false;
  }

  auto_log_info(
    `Commerce Ghost wants us to buy a ${ghostItem} which will give us roughly ${myLevel() * 25} substats in the next combat with it.`,
  );

  const output: string = cliExecuteOutput(`buy from mall [${ghostItem}]`);
  if (!containsText(output, "Purchases complete.")) {
    auto_abort(`Something went wrong buying ${ghostItem} from the mall.`);
  } else {
    set("auto_boughtCommerceGhostItem", ghostItem);
  }
  return true;
}
