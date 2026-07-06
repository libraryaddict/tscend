import { getProperty, haveEquipped, Item, itemAmount, toInt } from "kolmafia";
import { $item } from "libram";

import { auto_is_valid } from "../auto_util";

//	This is meant for items that have a date of 2007

let $_auto_hasNavelRing_navelRing: Item | undefined;
let $_auto_hasNavelRing_replicaNavelRing: Item | undefined;

//Defined in autoscend/iotms/mr2007.ash
export function auto_hasNavelRing(): boolean {
  // check for normal version
  $_auto_hasNavelRing_navelRing ??= $item`navel ring of navel gazing`;
  if (
    auto_is_valid($_auto_hasNavelRing_navelRing) &&
    (itemAmount($_auto_hasNavelRing_navelRing) > 0 ||
      haveEquipped($_auto_hasNavelRing_navelRing))
  ) {
    return true;
  }
  // check for replica in LoL path
  $_auto_hasNavelRing_replicaNavelRing ??= Item.get(
    "replica navel ring of navel gazing",
  );
  return (
    auto_is_valid($_auto_hasNavelRing_replicaNavelRing) &&
    (itemAmount($_auto_hasNavelRing_replicaNavelRing) > 0 ||
      haveEquipped($_auto_hasNavelRing_replicaNavelRing))
  );
}

export function auto_navelFreeRunChance(): number {
  // returns 0 - 100. 0 = 0% of a free run. 100 = 100% chance of a free run
  if (!auto_hasNavelRing()) {
    return 0;
  }
  // https://kol.coldfront.net/thekolwiki/index.php/Navel_ring_of_navel_gazing
  const navelRunAways: number = toInt(getProperty("_navelRunaways"));
  if (navelRunAways < 3) {
    return 100;
  }
  if (navelRunAways < 6) {
    return 80;
  }
  if (navelRunAways < 9) {
    return 50;
  }
  return 20;
}
