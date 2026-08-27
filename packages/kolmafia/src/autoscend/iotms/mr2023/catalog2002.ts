import {
  availableAmount,
  buy,
  haveCampground,
  haveEquipped,
  inHardcore,
  Item,
  itemAmount,
  myDaycount,
  myLevel,
  use,
  visitUrl,
} from "kolmafia";
import { $coinmaster, $item, $skill, get } from "libram";

import { SeptEmberCenser, TrainSet } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import { disregardInstantKarma } from "../../auto_powerlevel";
import {
  auto_get_campground,
  auto_have_skill,
  auto_ignoreExperience,
  auto_is_valid,
  auto_log_debug,
  can_read_skillbook,
  handleTracker,
  haveCampgroundMaid,
  wrap_item,
} from "../../auto_util";
import { in_lol } from "../../paths/2023/legacy_of_loathing";

let $_auto_have2002Catalog_catalog: Item | undefined;

function auto_have2002Catalog(): boolean {
  $_auto_have2002Catalog_catalog ??= wrap_item($item`2002 Mr. Store Catalog`);
  if (
    auto_is_valid($_auto_have2002Catalog_catalog) &&
    (itemAmount($_auto_have2002Catalog_catalog) > 0 ||
      haveEquipped($_auto_have2002Catalog_catalog))
  ) {
    return true;
  }
  return false;
}

function remainingCatalogCredits(): number {
  if (!auto_have2002Catalog()) {
    return 0;
  }
  if (!get("_2002MrStoreCreditsCollected")) {
    // using item collects credits
    if (in_lol()) {
      //autoscend doesn't always trigger in LoL, switching to specify Replica
      use($item`Replica 2002 Mr. Store Catalog`);
    } else {
      use($item`2002 Mr. Store Catalog`);
    }
  }
  return get("availableMrStore2002Credits");
}

export function haveIdolMicrophone(): boolean {
  if (itemAmount($item`Loathing Idol Microphone`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (75% charged)`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (50% charged)`) > 0) {
    return true;
  }
  if (itemAmount($item`Loathing Idol Microphone (25% charged)`) > 0) {
    return true;
  }
  return false;
}

export function buyFrom2002MrStore(): void {
  if (remainingCatalogCredits() === 0) {
    return;
  }
  auto_log_debug(
    `Have ${remainingCatalogCredits()} credit(s) to buy from Mr. Store 2002. Let's spend them!`,
  );
  // manual of secret door detection. skill: Secret door awareness
  let itemConsidering: Item = $item`Manual of Secret Door Detection`;
  if (
    can_read_skillbook(itemConsidering) &&
    remainingCatalogCredits() > 0 &&
    !auto_have_skill($skill`Secret Door Awareness`) &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    use(itemConsidering);
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
  //Pro skateboard to dupe tomb rat king drops
  itemConsidering = $item`pro skateboard`;
  if (
    remainingCatalogCredits() > 0 &&
    auto_is_valid(itemConsidering) &&
    !possessEquipment(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
  //FLUDA is +25% item, and a pickpocket
  itemConsidering = $item`Flash Liquidizer Ultra Dousing Accessory`;
  if (
    remainingCatalogCredits() > 0 &&
    auto_is_valid(itemConsidering) &&
    !possessEquipment(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
  // meat butler on day 1 of run
  itemConsidering = $item`Meat Butler`;
  if (
    haveCampground() &&
    remainingCatalogCredits() > 0 &&
    myDaycount() === 1 &&
    !haveCampgroundMaid() &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
    use(itemConsidering);
    visitUrl("campground.php"); // get butler meat
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
  // giant black monolith. Mostly useful at low level for stats
  if (
    haveCampground() &&
    (myLevel() < 13 || get("auto_disregardInstantKarma", false)) &&
    !(SeptEmberCenser.haveSeptEmberCenser() || TrainSet.haveTrainSet()) &&
    !auto_ignoreExperience()
  ) {
    itemConsidering = $item`Giant black monolith`;
    if (
      remainingCatalogCredits() > 0 &&
      !auto_get_campground().has(itemConsidering) &&
      auto_is_valid(itemConsidering)
    ) {
      buy($coinmaster`Mr. Store 2002`, 1, itemConsidering);
      use(itemConsidering);
      handleTracker({
        what: "Mr. Store 2002",
        detail: `Claimed ${itemConsidering}`,
        property: "auto_iotm_claim",
      });
      visitUrl("campground.php?action=monolith");
    }
  }
  // crimbo cookie. Should we expand to buy more or use in more paths beyond HC LoL?
  itemConsidering = $item`Crimbo cookie sheet`;
  if (
    remainingCatalogCredits() > 0 &&
    inHardcore() &&
    myDaycount() === 1 &&
    in_lol()
  ) {
    buy(
      $coinmaster`Mr. Store 2002`,
      remainingCatalogCredits(),
      itemConsidering,
    );
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
  // loathing idol microphone. Use remaining credits
  itemConsidering = $item`Loathing Idol Microphone`;
  if (remainingCatalogCredits() > 0 && auto_is_valid(itemConsidering)) {
    buy(
      $coinmaster`Mr. Store 2002`,
      remainingCatalogCredits(),
      itemConsidering,
    );
    handleTracker({
      what: "Mr. Store 2002",
      detail: `Claimed ${itemConsidering}`,
      property: "auto_iotm_claim",
    });
  }
}

export function useBlackMonolith(): void {
  // done if already used it today
  if (get("_blackMonolithUsed")) {
    return;
  }
  // done if we don't want stats
  if (!disregardInstantKarma()) {
    return;
  }
  // done if we don't have monolith
  if (!auto_get_campground().has($item`Giant black monolith`)) {
    return;
  }
  // use monolith
  visitUrl("campground.php?action=monolith");
}

export function dousesRemaining(): number {
  const fluda: Item = $item`Flash Liquidizer Ultra Dousing Accessory`;
  if (availableAmount(fluda) < 1 || !auto_is_valid(fluda)) {
    return 0;
  }
  return 3 - get("_douseFoeUses");
}
