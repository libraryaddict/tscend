import { $item, get } from "libram";

import { auto_is_valid } from "../../auto_util";

export function auto_haveMaydayContract(): boolean {
  if (get("hasMaydayContract") && auto_is_valid($item`gaffer's tape`)) {
    // use a potion to check mayday is allowed as auto_is_valid can return false for equipment & consumables in certain paths
    return true;
  }
  return false;
}
