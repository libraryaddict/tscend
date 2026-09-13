import { canInteract, choiceFollowsFight, Location, Monster } from "kolmafia";
import {
  $familiar,
  $item,
  $skill,
  get,
  LegendarySealClubbingClub,
} from "libram";

import { SwordOfSwords } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_locationMonsters,
  auto_monsterHasWantedDrop,
  auto_monsterWantedDrops,
  auto_saveFreeKillsForDesert,
  auto_wantToFreeKillWithNoDrops,
  instakillable,
  isFreeMonster,
} from "../../utils/auto_util";

function auto_haveLegendarySealClubbingClub(): boolean {
  return (
    auto_is_valid($item`legendary seal-clubbing club`) &&
    possessEquipment($item`legendary seal-clubbing club`)
  );
}

export function clubEmBackInTimesRemaining(): number {
  if (!auto_haveLegendarySealClubbingClub()) {
    return 0;
  }

  return LegendarySealClubbingClub.clubBackInTimeAvailable();
}

export function wantToClubEmBackInTime(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Club Em Back In Time, based off wantToThrowGravel

  if (clubEmBackInTimesRemaining() === 0) {
    return false;
  }

  if (isFreeMonster(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  if (auto_saveFreeKillsForDesert(enemy)) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

export function clubIntoNextWeekTimesRemaining(): number {
  if (
    !auto_haveLegendarySealClubbingClub() ||
    !auto_is_valid$2($skill`Club 'Em Into Next Week`)
  ) {
    return 0;
  }

  return LegendarySealClubbingClub.clubIntoNextWeekAvailable();
}

export function isOverdueClubIntoNextWeek(): boolean {
  return LegendarySealClubbingClub.turnsUntilNextWeekFight() <= 0;
}

function clubAcrossBattlefieldTimesRemaining(): number {
  if (
    !auto_haveLegendarySealClubbingClub() ||
    !auto_is_valid$2($skill`Club 'Em Across the Battlefield`)
  ) {
    return 0;
  }

  return LegendarySealClubbingClub.clubAcrossBattlefieldAvailable();
}

export function wantToClubAcrossBattlefield(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!instakillable(enemy) || choiceFollowsFight()) return false;

  if (clubAcrossBattlefieldTimesRemaining() === 0) {
    return false;
  }

  // The items the sword is already guaranteeing us off its tracked monster
  const swordWantedDrops = SwordOfSwords.swordFamiliarIsActivelyFarming()
    ? auto_monsterWantedDrops(SwordOfSwords.swordOfSwordsTracking())
    : [];

  // needs another monster in the zone with a wanted drop the sword isn't already covering
  return auto_locationMonsters(loc).some(([mon, rate]) => {
    if (rate <= 0 || mon === enemy) return false;
    const wanted = auto_monsterWantedDrops(mon);
    return (
      wanted.length > 0 &&
      !wanted.every((item) => swordWantedDrops.includes(item))
    );
  });
}

export function wantToEquipClubAcrossBattlefield(
  loc: Location,
  planToPeridot: boolean,
): boolean {
  if (clubAcrossBattlefieldTimesRemaining() === 0) {
    return false;
  }

  // peridot gives us a single fight here, and the sword switching onto a zone monster will likely cover its drops
  if (
    planToPeridot &&
    get("auto_familiarChoice") === $familiar`Sword of S Words` &&
    SwordOfSwords.swordIsWillingToSwitchTargets() &&
    auto_locationMonsters(loc).some(
      ([mon, rate]) =>
        rate > 0 && SwordOfSwords.swordFamiliarWantsMonsterDrops(mon),
    )
  ) {
    return false;
  }

  // equipping in advance is only worth it if there is a monster we want a drop of, and it's not a 100% chance
  const wantedMonsterCount: number = auto_locationMonsters(loc).filter(
    ([mon, rate]) => rate > 0 && auto_monsterHasWantedDrop(mon) && rate < 100,
  ).length;

  return wantedMonsterCount >= 1;
}
