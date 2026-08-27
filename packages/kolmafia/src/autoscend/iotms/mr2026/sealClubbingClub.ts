import { canInteract, Location, Monster } from "kolmafia";
import { $item, $skill, LegendarySealClubbingClub } from "libram";

import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_locationMonsters,
  auto_monsterHasWantedDrop,
  auto_wantToFreeKillWithNoDrops,
  instakillable,
  isFreeMonster,
} from "../../auto_util";

//Defined in autoscend/iotms/mr2026.ash
function auto_haveLegendarySealClubbingClub(): boolean {
  return (
    auto_is_valid($item`legendary seal-clubbing club`) &&
    possessEquipment($item`legendary seal-clubbing club`)
  );
}

export function auto_clubEmBackInTimesRemaining(): number {
  if (!auto_haveLegendarySealClubbingClub()) {
    return 0;
  }

  return LegendarySealClubbingClub.clubBackInTimeAvailable();
}

export function wantToClubEmBackInTime(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Club Em Back In Time, based off wantToThrowGravel

  if (auto_clubEmBackInTimesRemaining() === 0) {
    return false;
  }

  if (isFreeMonster(enemy, loc)) {
    // don't use free kills against inherently free fights
    return false;
  }

  if (canInteract()) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

export function auto_clubIntoNextWeekTimesRemaining(): number {
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

export function auto_clubAcrossBattlefieldTimesRemaining(): number {
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
  if (!instakillable(enemy)) return false;

  if (auto_clubAcrossBattlefieldTimesRemaining() === 0) {
    return false;
  }

  // needs another monster in the zone whose drop we actually want
  return auto_locationMonsters(loc).some(
    ([mon, rate]) =>
      rate > 0 && mon !== enemy && auto_monsterHasWantedDrop(mon),
  );
}

export function auto_wantToEquipClubAcrossBattlefield(loc: Location): boolean {
  if (auto_clubAcrossBattlefieldTimesRemaining() === 0) {
    return false;
  }

  // equipping in advance is only worth it if there are at least 2 monsters
  // in the zone we want the drops of, since we may end up fighting the desired encounter
  const wantedMonsterCount: number = auto_locationMonsters(loc).filter(
    ([mon, rate]) => rate > 0 && auto_monsterHasWantedDrop(mon),
  ).length;

  return wantedMonsterCount >= 2;
}
