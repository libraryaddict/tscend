import {
  itemAmount,
  monsterLevelAdjustment,
  myMeat,
  npcPrice,
  retrieveItem,
  toInt,
} from "kolmafia";
import { $item, $location, get } from "libram";

import { providePlusCombat, providePlusNonCombat } from "../../auto_providers";
import {
  auto_can_equip,
  auto_combatModCap,
  auto_is_valid,
  auto_log_info,
  meatReserve,
} from "../../auto_util";
import { in_lar } from "../../paths/2017/live_ascend_repeat";
import { is_werewolf } from "../../paths/2024/wereprofessor";
import { in_hattrick } from "../../paths/2025/hattrick";

export function have_fireworks_shop(): boolean {
  if (is_werewolf()) {
    return false; //can't access fireworks shop as a werewolf
  }
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (!auto_is_valid($item`clan underground fireworks shop`)) {
    return false;
  }
  return get("_fireworksShop");
}

export function auto_buyFireworksHat(): boolean {
  if (
    myMeat() < npcPrice($item`porkpie-mounted popper`) + meatReserve() &&
    auto_is_valid($item`porkpie-mounted popper`)
  ) {
    auto_log_info(
      "Want to buy a hat from the fireworks shop, but don't have enough meat. Will try again later.",
    );
    return false;
  }
  // noncombat is most valuable hat but has no effect in LAR and can't be removed in Hat Trick
  if (
    auto_can_equip($item`porkpie-mounted popper`) &&
    !(in_lar() || in_hattrick())
  ) {
    const simNonCombat: number = providePlusNonCombat(
      auto_combatModCap(),
      $location`Noob Cave`,
      true,
      true,
    );
    if (simNonCombat < auto_combatModCap()) {
      retrieveItem(1, $item`porkpie-mounted popper`);
      return true;
    }
  }
  // +combat hat is second most useful but has no effect in LAR and can't be removed in Hat Trick
  if (
    auto_can_equip($item`sombrero-mounted sparkler`) &&
    !(in_lar() || in_hattrick())
  ) {
    const simCombat: number = providePlusCombat(
      auto_combatModCap(),
      $location`Noob Cave`,
      true,
      true,
    );
    if (simCombat < auto_combatModCap()) {
      retrieveItem(1, $item`sombrero-mounted sparkler`);
      return true;
    }
  }
  // ML hat is least useful
  // todo: add functionality to simulate acquiring ML instead of just looking at current ML
  if (auto_can_equip($item`fedora-mounted fountain`)) {
    if (monsterLevelAdjustment() < toInt(get("auto_MLSafetyLimit"))) {
      retrieveItem(1, $item`fedora-mounted fountain`);
      return true;
    }
  }

  return false;
}
