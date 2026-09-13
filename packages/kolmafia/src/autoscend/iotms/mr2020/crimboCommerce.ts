import { cliExecuteOutput, Item, myLevel } from "kolmafia";
import { $familiar, $item, get, set } from "libram";

import { auto_abort, auto_log_info } from "../../utils/auto_log";
import { auto_is_valid$1 } from "../../utils/auto_util";

export function buyCrimboCommerceMallItem(): boolean {
  if (!auto_is_valid$1($familiar`Ghost of Crimbo Commerce`)) {
    return false;
  }

  const ghostItem: Item = get("commerceGhostItem");
  if (ghostItem === $item.none) {
    // haven't triggered the greedy ghost message at least once yet.
    return false;
  }

  if (get("auto_boughtCommerceGhostItem") === ghostItem) {
    // already bought the item.
    return false;
  }

  auto_log_info(
    `Commerce Ghost wants us to buy a ${ghostItem} which will give us roughly ${myLevel() * 25} substats in the next combat with it.`,
  );

  const output: string = cliExecuteOutput(`buy from mall [${ghostItem}]`);
  if (!output.includes("Purchases complete.")) {
    auto_abort(`Something went wrong buying ${ghostItem} from the mall.`);
  } else {
    set("auto_boughtCommerceGhostItem", ghostItem);
  }
  return true;
}
