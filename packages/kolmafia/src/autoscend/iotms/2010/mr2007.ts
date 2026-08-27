import { haveEquipped, Item, itemAmount } from "kolmafia";
import { $item, get } from "libram";

import { auto_is_valid } from "../../auto_util";

//	This is meant for items that have a date of 2007

let NavelRing$$$_auto_hasNavelRing_navelRing: Item | undefined;
let NavelRing$$$_auto_hasNavelRing_replicaNavelRing: Item | undefined;

//Defined in autoscend/iotms/mr2007.ash
export function NavelRing$$auto_hasNavelRing(): boolean {
  // check for normal version
  NavelRing$$$_auto_hasNavelRing_navelRing ??= $item`navel ring of navel gazing`;
  if (
    auto_is_valid(NavelRing$$$_auto_hasNavelRing_navelRing) &&
    (itemAmount(NavelRing$$$_auto_hasNavelRing_navelRing) > 0 ||
      haveEquipped(NavelRing$$$_auto_hasNavelRing_navelRing))
  ) {
    return true;
  }
  // check for replica in LoL path
  NavelRing$$$_auto_hasNavelRing_replicaNavelRing ??= Item.get(
    "replica navel ring of navel gazing",
  );
  return (
    auto_is_valid(NavelRing$$$_auto_hasNavelRing_replicaNavelRing) &&
    (itemAmount(NavelRing$$$_auto_hasNavelRing_replicaNavelRing) > 0 ||
      haveEquipped(NavelRing$$$_auto_hasNavelRing_replicaNavelRing))
  );
}

export function NavelRing$$auto_navelFreeRunChance(): number {
  // returns 0 - 100. 0 = 0% of a free run. 100 = 100% chance of a free run
  if (!NavelRing$$auto_hasNavelRing()) {
    return 0;
  }
  // https://kol.coldfront.net/thekolwiki/index.php/Navel_ring_of_navel_gazing
  const navelRunAways: number = get("_navelRunaways");
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
