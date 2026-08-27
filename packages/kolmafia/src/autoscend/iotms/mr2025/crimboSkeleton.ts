import { itemAmount, myLocation } from "kolmafia";
import { $familiar, $item, $phyla, get, set } from "libram";

import { inebriety_left, spleen_left, stomach_left } from "../../auto_consume";
import { auto_have_familiar } from "../../auto_familiar";
import { auto_is_valid, auto_zonePhylumPercent } from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";

export function haveCrimboSkeleton(): boolean {
  if (auto_have_familiar($familiar`Skeleton of Crimbo Past`)) {
    return true;
  }
  return false;
}

export function wantSoCP(): void {
  if (!haveCrimboSkeleton()) {
    return;
  }
  let availableKnuckles: number = itemAmount($item`knucklebone`);

  // Only farm for gruel if we don't have enough knuckles to pick it if we wanted gruel
  if (
    auto_is_valid($item`medicinal gruel`) &&
    !isActuallyEd() &&
    spleen_left() > 0 &&
    !get("_crimboPastMedicalGruel") &&
    availableKnuckles < 5
  ) {
    availableKnuckles -= 5;
  }
  if (
    auto_is_valid($item`Smoking Pope`) &&
    inebriety_left() > 0 &&
    !get("_crimboPastSmokingPope")
  ) {
    availableKnuckles -= 5;
  }
  if (
    auto_is_valid($item`prize turkey`) &&
    stomach_left() > 0 &&
    !get("_crimboPastPrizeTurkey")
  ) {
    availableKnuckles -= 5;
  }
  if (
    availableKnuckles >= 0 &&
    (!get("auto_farmSoCP", false) || get("_knuckleboneDrops") >= 100)
  ) {
    set("auto_preferSoCP", false);
    return;
  }

  let amt: number = 0;
  for (const phyl of $phyla`constellation, elemental, hippy, horror, mer-kin, plant, slime, bug`) {
    amt += auto_zonePhylumPercent(myLocation(), phyl);
  }

  //want 10% or fewer of the available mobs to be knucklebone eligible, otherwise why bother with this guy vs fairychauns/fairyballs/fairyeverythings?
  set("auto_preferSoCP", amt <= 0.1);
}
