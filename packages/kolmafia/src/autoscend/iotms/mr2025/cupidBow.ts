import { Item } from "kolmafia";
import { $item } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";

export function auto_haveCupidBow(): boolean {
  const bow: Item = $item`toy Cupid bow`;
  return auto_is_valid(bow) && possessEquipment(bow);
}
