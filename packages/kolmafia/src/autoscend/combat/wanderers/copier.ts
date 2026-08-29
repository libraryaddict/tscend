import {
  appearanceRates,
  currentRound,
  haveEffect,
  haveEquipped,
  itemAmount,
  Location,
  Monster,
  myLocation,
  setLocation,
  Skill,
} from "kolmafia";
import { $effect, $familiar, $item, $skill, get } from "libram";

import { AutoLeprecondo, Eagle, Roman, SwordOfSwords } from "../../../types";
import { auto_canChew, autoChew, spleen_left } from "../../auto_consume";
import { autoEquip } from "../../auto_equipment";
import { handleFamiliar$1 } from "../../auto_familiar";
import {
  auto_getMonsters,
  auto_is_valid,
  auto_is_valid$2,
  auto_shouldCopySomeMore,
  auto_turbo,
} from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_small } from "../../paths/2023/small";
import { auto_canUse } from "../auto_combat_util";

export function getCopier(
  enemy: Monster,
  inCombat: boolean = currentRound() > 0,
): Skill {
  if (
    (Roman.haveRoman() && haveEffect($effect`Everything Looks Purple`) === 0) ||
    (haveEquipped($item`Roman Candelabra`) &&
      auto_canUse($skill`Blow the Purple Candle!`, true, inCombat) &&
      haveEffect($effect`Everything Looks Purple`) === 0)
  ) {
    return $skill`Blow the Purple Candle!`;
  }
  if (
    Eagle.haveEagle() &&
    auto_canUse(
      $skill`%fn, fire a Red, White and Blue Blast`,
      true,
      inCombat,
    ) &&
    !(haveEffect($effect`Everything Looks Red, White and Blue`) > 0) &&
    enemy.copyable
  ) {
    return $skill`%fn, fire a Red, White and Blue Blast`;
  }
  if (get("phosphorTracesUses") > AutoLeprecondo.getReservedTraces()) {
    return $skill`Create an Afterimage`;
  } else if (
    !isActuallyEd() &&
    !in_small() &&
    // Only chew traces if we're in turbo mode
    auto_turbo() &&
    !inCombat &&
    itemAmount($item`phosphor traces`) > 0 &&
    spleen_left() >= $item`phosphor traces`.spleen &&
    auto_canChew($item`phosphor traces`) &&
    auto_is_valid($item`phosphor traces`) &&
    auto_is_valid$2($skill`Create an Afterimage`)
  ) {
    return $skill`Create an Afterimage`;
  }
  return $skill.none;
}

export function adjustForCopyIfPossible(target: Monster): boolean {
  const copier: Skill = getCopier(target, false);
  if (copier === $skill`Blow the Purple Candle!`) {
    return autoEquip($item`Roman Candelabra`);
  }
  if (copier === $skill`%fn, fire a Red, White and Blue Blast`) {
    handleFamiliar$1($familiar`Patriotic Eagle`);
  }
  if (
    copier === $skill`Create an Afterimage` &&
    get("phosphorTracesUses") === 0
  ) {
    return autoChew(1, $item`phosphor traces`);
  }
  return false;
}

export function auto_wantToCopy(enemy: Monster, loc?: Location): boolean {
  if (enemy.boss || !enemy.copyable || SwordOfSwords.swordIsTracking(enemy)) {
    return false;
  }

  const locCache: Location = myLocation();
  try {
    if (loc) {
      setLocation(loc);
    }
    const toCopy: Monster[] = auto_getMonsters("copy");
    return toCopy.includes(enemy) && auto_shouldCopySomeMore(enemy);
  } finally {
    if (loc) {
      setLocation(locCache);
    }
  }
}

export function auto_zoneCopyableMonsters(loc: Location): [Monster, number][] {
  return Object.entries(appearanceRates(loc))
    .map(([_k, _v]) => [Monster.get(_k), _v] as [Monster, number])
    .filter(
      ([mon, rate]) => rate > 0 && mon.id > 0 && mon.copyable && !mon.boss,
    );
}
