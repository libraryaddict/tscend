import { $item } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";

export function auto_haveRoman(): boolean {
  if (
    auto_is_valid($item`Roman Candelabra`) &&
    possessEquipment($item`Roman Candelabra`)
  ) {
    return true;
  }
  return false;
}
