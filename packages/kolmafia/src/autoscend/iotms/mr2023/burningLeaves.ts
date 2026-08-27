import {
  availableAmount,
  creatableAmount,
  create,
  getCampground,
  getDwelling,
  haveEffect,
  itemAmount,
  use,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $location, get } from "libram";

import { Cincho, TearawayPants } from "../../../types";
import { autoAdvBypass } from "../../auto_adventure";
import { addBonusToMaximize } from "../../auto_equipment";
import { auto_is_valid$4, handleTracker, isGuildClass } from "../../auto_util";
import { in_avantGuard } from "../../paths/2024/avant_guard";

export function auto_haveBurningLeaves(): boolean {
  return (
    auto_is_valid$4("Burning Leaves") &&
    $item`A Guide to Burning Leaves`.toString() in getCampground()
  );
}

export function auto_initBurningLeaves(): boolean {
  if (!auto_haveBurningLeaves()) {
    return false;
  }
  if (availableAmount($item`rake`) < 1) {
    // visit the pile of burning leaves to grab the rakes
    visitUrl("campground.php?preaction=leaves");
  }
  return availableAmount($item`rake`) > 0;
}

export function auto_defaultBurnLeaves(): boolean {
  // Returns true if we made everything we want, false if anything fails.
  if (!auto_haveBurningLeaves()) {
    return false;
  }

  auto_initBurningLeaves();

  let success: boolean = true;

  if (
    !($item`forest canopy bed`.toString() in getCampground()) &&
    getDwelling() !== $item`big rock` &&
    Cincho.auto_haveCincho() &&
    creatableAmount($item`forest canopy bed`) > 0
  ) {
    // get and use the forest canopy bed if we don't have one already and have a Cincho as it is +5 free rests
    if (create(1, $item`forest canopy bed`)) {
      handleTracker({
        what: "Burning Leaves",
        detail: `Claimed ${$item`forest canopy bed`}`,
        property: "auto_iotm_claim",
      });
      success = success && use(1, $item`forest canopy bed`);
    } else {
      return false;
    }
  }

  if (
    $item`forest canopy bed`.toString() in getCampground() &&
    haveEffect($effect`Resined`) === 0 &&
    creatableAmount($item`distilled resin`) > 0
  ) {
    // Get the Resined effect if we don't have it as it is net positive for leaves.
    if (create(1, $item`distilled resin`)) {
      handleTracker({
        what: "Burning Leaves",
        detail: `Claimed ${$item`distilled resin`}`,
        property: "auto_iotm_claim",
      });
      success = success && use(1, $item`distilled resin`);
    } else {
      return false;
    }
  }

  if (
    in_avantGuard() &&
    itemAmount($item`autumnic bomb`) === 0 &&
    creatableAmount($item`autumnic bomb`) > 0
  ) {
    if (create(1, $item`autumnic bomb`)) {
      //Reduces enemy hp in half, useful for bodyguards with 40K hp
      handleTracker({
        what: "Burning Leaves",
        detail: `Claimed ${$item`autumnic bomb`}`,
        property: "auto_iotm_claim",
      });
    } else {
      success = false;
    }
  }

  if (
    !isGuildClass() &&
    $item`forest canopy bed`.toString() in getCampground()
  ) {
    success = success && auto_makeAutumnalAegis(); // +2 resistance to all elements, 250 DA (for megalo-city with no tao)
  }
  return success;
}

export function auto_makeAutumnalAegis(): boolean {
  if (!auto_haveBurningLeaves()) {
    return false;
  }
  if (
    creatableAmount($item`autumnal aegis`) > 0 &&
    itemAmount($item`autumnal aegis`) === 0
  ) {
    if (create(1, $item`autumnal aegis`)) {
      // So-so resistance to all elements, 250 DA (for megalo-city)
      handleTracker({
        what: "Burning Leaves",
        detail: `Claimed ${$item`autumnal aegis`}`,
        property: "auto_iotm_claim",
      });
    }
  }
  return availableAmount($item`autumnal aegis`) > 0;
}

export function auto_remainingBurningLeavesFights(): number {
  if (!auto_haveBurningLeaves()) {
    return 0;
  }
  return 5 - get("_leafMonstersFought");
}

export function auto_fightFlamingLeaflet(): boolean {
  if (auto_remainingBurningLeavesFights() < 1) {
    return false;
  }
  if (availableAmount($item`inflammable leaf`) < 11) {
    return false;
  }

  if (TearawayPants.auto_haveTearawayPants()) {
    addBonusToMaximize($item`tearaway pants`, 500); // plants give turns when you tearaway
  }

  const pages: Map<number, string> = new Map();
  pages.set(0, "campground.php?preaction=leaves");
  pages.set(1, "choice.php?pwd&whichchoice=1510&option=1&leaves=11");
  return autoAdvBypass(0, pages, $location`Noob Cave`);
}
