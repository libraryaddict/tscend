import {
  Effect,
  haveEquipped,
  Item,
  itemAmount,
  monkeyPaw,
  myLocation,
} from "kolmafia";
import { $item, get } from "libram";

import { auto_is_valid, auto_log_info, handleTracker } from "../../auto_util";

let $_auto_haveMonkeyPaw_paw: Item | undefined;

export function haveMonkeyPaw(): boolean {
  $_auto_haveMonkeyPaw_paw ??= $item`cursed monkey's paw`;
  return (
    auto_is_valid($_auto_haveMonkeyPaw_paw) &&
    (itemAmount($_auto_haveMonkeyPaw_paw) > 0 ||
      haveEquipped($_auto_haveMonkeyPaw_paw))
  );
}

export function monkeyPawWishesLeft(): number {
  if (haveMonkeyPaw()) {
    return 5 - get("_monkeyPawWishesUsed");
  }
  return 0;
}

export function makeMonkeyPawWish(wish: Effect): boolean {
  if (!haveMonkeyPaw()) {
    auto_log_info(
      `Requested monkey paw wish without paw available, skipping ${wish.toString()}`,
    );
    return false;
  }
  if (monkeyPawWishesLeft() < 1) {
    auto_log_info(`Out of monkey paw wishes, skipping ${wish.toString()}`);
    return false;
  }
  const success: boolean = monkeyPaw(wish);
  if (success) {
    handleTracker({
      what: $item`cursed monkey's paw`,
      location: myLocation(),
      detail: wish.toString(),
      property: "auto_wishes",
    });
  }
  return success;
}

export function makeMonkeyPawWish$1(wish: Item): boolean {
  if (!haveMonkeyPaw()) {
    auto_log_info(
      `Requested monkey paw wish without paw available, skipping ${wish.toString()}`,
    );
    return false;
  }
  if (monkeyPawWishesLeft() < 1) {
    auto_log_info(`Out of monkey paw wishes, skipping ${wish.toString()}`);
    return false;
  }
  const success: boolean = monkeyPaw(wish);
  if (success) {
    handleTracker({
      what: $item`cursed monkey's paw`,
      location: myLocation(),
      detail: wish.toString(),
      property: "auto_wishes",
    });
  }
  return success;
}
