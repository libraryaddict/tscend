import { currentRound, Location, Monster, Skill } from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  get,
  LegendarySealClubbingClub,
  set,
} from "libram";
import { BadlyRomanticArrow } from "libram/dist/resources/2011/ObtuseAngel";

import { Bofa, SealClubbingClub, SwordOfSwords } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { autoEquip } from "../../auto_equipment";
import { handleFamiliar$1 } from "../../auto_familiar";
import { solveDelayZone } from "../../auto_routing";
import {
  auto_getMonsters,
  auto_log_info,
  auto_shouldCopySomeMore,
  instakillable,
  isFreeMonster,
} from "../../auto_util";
import { L11_wantsPygmyBowlerWandererHunt } from "../../quests/level_11";
import { auto_canUse, replaceMonsterCombatString } from "../auto_combat_util";
import { auto_wantToCopy } from "./copier";

// Unlike the other copiers, this queues a delayed wanderer instead of an
// immediate fight.
export function getWandererCreator(
  enemy: Monster,
  inCombat: boolean = currentRound() > 0,
): Skill {
  if (enemy.boss || !enemy.copyable) {
    return $skill.none;
  }
  if (
    instakillable(enemy) &&
    SealClubbingClub.clubIntoNextWeekTimesRemaining() > 0 &&
    (get("clubEmNextWeekMonster") === $monster.none ||
      SealClubbingClub.isOverdueClubIntoNextWeek()) &&
    (!inCombat || auto_canUse($skill`Club 'Em Into Next Week`, true, inCombat))
  ) {
    return $skill`Club 'Em Into Next Week`;
  }
  // Wink at / Fire a badly romantic arrow are the same Obtuse Angel skill at
  // different familiar weights, sharing one daily use and one queued monster.
  if (get("romanticTarget") === $monster.none) {
    if (auto_canUse($skill`Fire a badly romantic arrow`, true, inCombat)) {
      return $skill`Fire a badly romantic arrow`;
    }
    if (auto_canUse($skill`Wink at`, true, inCombat)) {
      return $skill`Wink at`;
    }
  }
  return $skill.none;
}

export function adjustForWandererCreatorIfPossible(target: Monster): boolean {
  const wanderer: Skill = getWandererCreator(target, false);
  if (wanderer === $skill`Club 'Em Into Next Week`) {
    return autoEquip($item`legendary seal-clubbing club`);
  }
  if (
    wanderer === $skill`Fire a badly romantic arrow` ||
    wanderer === $skill`Wink at`
  ) {
    handleFamiliar$1($familiar`Obtuse Angel`);
  }
  return false;
}

export function auto_wantToCreateWanderer(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!instakillable(enemy) || SwordOfSwords.swordIsTracking(enemy)) {
    return false;
  }

  return (
    L11_wantsPygmyBowlerWandererHunt() ||
    (auto_getMonsters("wanderer").includes(enemy) &&
      auto_shouldCopySomeMore(enemy)) ||
    // Anything worth copying is also worth banking as a delayed wanderer
    // when no copier is available for it this fight.
    auto_wantToCopy(enemy, loc)
  );
}

export function auto_copierFightsLeft(mon: Monster): number {
  let fights: number = 0;

  if (get("_chainedPurpleCandleMonster") === mon) {
    fights++;
  }

  if (get("_afterimageMonster") === mon) {
    fights++;
  }

  return fights;
}

export function auto_wandererFightsLeft(mon: Monster): number {
  let fights = 0;

  if (Bofa.habitatMonster() === mon) {
    fights += Bofa.habitatFightsLeft();
  }
  if (
    LegendarySealClubbingClub.clubIntoNextWeekMonster() === mon &&
    LegendarySealClubbingClub.turnsUntilNextWeekFight() >= 0
  ) {
    fights++;
  }

  if (BadlyRomanticArrow.copiedMonster() === mon) fights++;

  return fights;
}

// The overdue fight will happen regardless, so this should be prioritized
// before it overwrites something else we wanted to burn delay with.
export function burnDelayWithClubEmIntoNextWeek(): boolean {
  if (!SealClubbingClub.isOverdueClubIntoNextWeek()) {
    return false;
  }

  let clubEmZone: Location =
    L11_wantsPygmyBowlerWandererHunt() &&
    replaceMonsterCombatString(get("clubEmNextWeekMonster")) !== undefined &&
    handleFamiliar$1($familiar`Sword of S Words`)
      ? $location`The Hidden Bowling Alley`
      : solveDelayZone(
          isFreeMonster(get("clubEmNextWeekMonster")) &&
            get("breathitinCharges") > 0,
        );
  if (clubEmZone === $location.none) {
    // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
    // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
    clubEmZone = $location`Noob Cave`;
  }
  auto_log_info(
    `Fighting a ${get("clubEmNextWeekMonster")} in ${clubEmZone.toString()} to burn delay!`,
    "green",
  );
  set("auto_nextEncounter", get("clubEmNextWeekMonster").toString());
  if (autoAdv(clubEmZone)) {
    return true;
  }
  set("auto_nextEncounter", "");
  return false;
}
