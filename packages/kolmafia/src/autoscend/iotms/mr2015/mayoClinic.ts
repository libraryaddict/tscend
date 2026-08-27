import {
  haveFamiliar,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  myDaycount,
  myMeat,
} from "kolmafia";
import { $familiar, $item, $items, get } from "libram";

import { auto_buyUpTo } from "../../auto_acquire";
import { auto_get_campground } from "../../auto_util";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { in_gnoob } from "../../paths/2017/gelatinous_noob";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { inAftercore } from "../../paths/casual";

export function mayoItems(): boolean {
  if (!isUnrestricted($item`portable Mayo Clinic`)) {
    return false;
  }
  if (get("_mayoDeviceRented")) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }
  if (!auto_get_campground().has($item`portable Mayo Clinic`)) {
    return false;
  }
  if (myMeat() < 10000) {
    return false;
  }

  let mayos: Item[] = [];
  if (is_boris()) {
    switch (myDaycount()) {
      case 1:
        mayos = $items`tomayohawk-style reflex hammer`;
        break;
      case 2:
      case 3:
      case 4:
        mayos = $items`mayo lance`;
        break;
    }
  } else if (in_heavyrains() && !inHardcore()) {
    switch (myDaycount()) {
      case 1:
        mayos = [$item.none];
        break;
      case 2:
        mayos = $items`miracle whip`;
        break;
      case 3:
      case 4:
        mayos = $items`sphygmayomanometer`;
        break;
    }
  } else if (in_gnoob()) {
    switch (myDaycount()) {
      default:
        mayos = [$item.none];
        break;
    }
  } else if (in_lta()) {
    switch (myDaycount()) {
      default:
        mayos = [$item.none];
        break;
    }
  } else {
    switch (myDaycount()) {
      case 1:
      case 2:
      case 3:
      case 4:
        mayos = $items`mayo lance`;
        break;
    }
  }

  for (const mayo of mayos) {
    if (mayo === $item`mayo lance`) {
      if (haveFamiliar($familiar`Crimbo Shrub`)) {
        continue;
      }
      if (haveFamiliar($familiar`Intergnat`)) {
        continue;
      }
    }
    if (mayo === $item.none) {
      return false;
    }
    if (itemAmount(mayo) === 0) {
      auto_buyUpTo(1, mayo);
      return true;
    }
  }

  return false;
}
