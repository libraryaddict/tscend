import {
  creatableAmount,
  haveCampground,
  Item,
  itemAmount,
  myLocation,
  sellPrice,
} from "kolmafia";
import { $coinmaster, $familiar, $item, $phyla, get, set } from "libram";

import { ArchSpade } from "../../../types";
import { inebriety_left, spleen_left, stomach_left } from "../../auto_consume";
import {
  auto_have_familiar,
  canChangeToFamiliar,
} from "../../helpers/auto_familiar";
import { doFreeRest, freeRestsRemaining } from "../../helpers/auto_restore";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { auto_is_valid, auto_zonePhylumPercent } from "../../utils/auto_util";

export function haveCrimboSkeleton(): boolean {
  if (auto_have_familiar($familiar`Skeleton of Crimbo Past`)) {
    return true;
  }
  return false;
}

function knuckleRestsAvailable(): number {
  if (
    !haveCampground() ||
    !canChangeToFamiliar($familiar`Skeleton of Crimbo Past`)
  ) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      5 - get("_knuckleboneRests"),
      freeRestsRemaining() - (ArchSpade.elfToiletInFuture() ? 1 : 0),
    ),
  );
}

export function canBuyWithKnuckles(it: Item): boolean {
  return (
    creatableAmount(it) > 0 ||
    itemAmount($item`knucklebone`) + knuckleRestsAvailable() >=
      sellPrice($coinmaster`Skeleton of Crimbo Past`, it)
  );
}

export function restForKnuckles(it: Item): void {
  while (
    itemAmount($item`knucklebone`) <
      sellPrice($coinmaster`Skeleton of Crimbo Past`, it) &&
    knuckleRestsAvailable() > 0
  ) {
    if (!doFreeRest()) {
      return;
    }
  }
}

export function wantSoCP(): void {
  if (!haveCrimboSkeleton()) {
    return;
  }
  const availableKnuckles: number = itemAmount($item`knucklebone`);
  let wantedKnuckles: number = 0;

  // Only farm for gruel if we don't have enough knuckles to pick it if we wanted gruel
  if (
    auto_is_valid($item`medicinal gruel`) &&
    !isActuallyEd() &&
    spleen_left() > 0 &&
    !get("_crimboPastMedicalGruel") &&
    availableKnuckles < 5
  ) {
    wantedKnuckles = 5;
  }
  if (
    auto_is_valid($item`Smoking Pope`) &&
    inebriety_left() > 0 &&
    !get("_crimboPastSmokingPope")
  ) {
    wantedKnuckles += 5;
  }
  if (
    auto_is_valid($item`prize turkey`) &&
    stomach_left() > 0 &&
    !get("_crimboPastPrizeTurkey")
  ) {
    wantedKnuckles += 5;
  }
  if (
    availableKnuckles >= wantedKnuckles &&
    (!get("tscend_farmSoCP", false) || get("_knuckleboneDrops") >= 100)
  ) {
    set("tscend_preferSoCP", false);
    return;
  }

  const undesiredMonsters: number = auto_zonePhylumPercent(
    myLocation(),
    $phyla`constellation, elemental, hippy, horror, mer-kin, plant, slime, bug`,
  );

  //want 10% or fewer of the available mobs to be knucklebone eligible, otherwise why bother with this guy vs fairychauns/fairyballs/fairyeverythings?
  set("tscend_preferSoCP", undesiredMonsters <= 0.1);
}
