import {
  creatableAmount,
  create,
  isUnrestricted,
  itemAmount,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, get } from "libram";

// place.php?whichplace=campaway
export function auto_campawayAvailable(): boolean {
  return (
    isUnrestricted($item`Distant Woods Getaway Brochure`) &&
    get("getawayCampsiteUnlocked")
  );
}

export function auto_campawayGrabBuffs(): boolean {
  if (!auto_campawayAvailable()) {
    return false;
  }

  const lim: number =
    4 - get("_campAwaySmileBuffs") - get("_campAwayCloudBuffs");
  for (let i: number = 0; i < lim; i++) {
    visitUrl("place.php?whichplace=campaway&action=campaway_sky");
  }

  if (
    get("_campAwayCloudBuffs") === 0 &&
    itemAmount($item`campfire smoke`) + creatableAmount($item`campfire smoke`) >
      0
  ) {
    if (itemAmount($item`campfire smoke`) === 0) {
      create(1, $item`campfire smoke`);
    }
    const message: string = "why is my computer on fire?";
    visitUrl(
      `inv_use.php?pwd=&which=3&whichitem=${toInt($item`campfire smoke`)}`,
    );
    visitUrl(`choice.php?pwd=&whichchoice=1394&option=1&message=${message}`);
    visitUrl("place.php?whichplace=campaway&action=campaway_sky");
  }

  return true;
}
