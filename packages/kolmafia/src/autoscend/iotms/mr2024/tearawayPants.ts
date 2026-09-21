import { availableAmount, Monster } from "kolmafia";
import { $item, $phyla } from "libram";

import { auto_is_valid } from "../../utils/auto_util";

export function haveTearawayPants(): boolean {
  if (
    auto_is_valid($item`tearaway pants`) &&
    availableAmount($item`tearaway pants`) > 0
  ) {
    return true;
  }
  return false;
}

export function tearawayPantsDealsDamage(monster: Monster): boolean {
  return $phyla`demon, horror, undead, weird`.includes(monster.phylum);
}
