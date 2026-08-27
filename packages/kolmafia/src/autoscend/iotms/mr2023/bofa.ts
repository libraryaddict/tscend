import { haveSkill, Monster, myLocation, Phylum } from "kolmafia";
import { $locations, $monster, $monsters, $phyla, $skill, get } from "libram";

import { FantasyRealm } from "../../../types";
import { auto_is_valid$2, safeGet } from "../../auto_util";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { cyrptEvilBonus } from "../../quests/level_07";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";

export function haveBofa(): boolean {
  return (
    auto_is_valid$2($skill`Just the Facts`) && haveSkill($skill`Just the Facts`)
  );
}

export function canHabitat(): boolean {
  if (!haveBofa()) {
    return false;
  }
  if (get("_monsterHabitatsRecalled") >= 3) {
    // no charges left
    return false;
  }
  if (get("_monsterHabitatsFightsLeft") > 0) {
    // already habitating something but we may not need all 5 of them in certain situations
    switch (safeGet("_monsterHabitatsMonster")) {
      case $monster`fantasy bandit`:
        return FantasyRealm.fantasyBanditsFought() < 5;
      case $monster`modern zmobie`:
        return get("cyrptAlcoveEvilness") > 13;
      case $monster`dirty old lihc`:
        return get("cyrptNicheEvilness") > 13;
      default:
        return false;
    }
  }
  return true;
}

export function habitatTarget(target: Monster): boolean {
  if (!canHabitat()) {
    return false;
  }
  if (
    safeGet("_monsterHabitatsMonster") === target &&
    get("_monsterHabitatsFightsLeft") > 0
  ) {
    // already habitating this monster
    return false;
  }
  {
    switch (target) {
      case $monster`fantasy bandit`:
        // only worth it if we need all 5.
        return FantasyRealm.fantasyBanditsFought() === 0;
      case $monster`modern zmobie`:
        // only worth it if we need 30 or more evilness reduced.
        return get("cyrptAlcoveEvilness") - 5 * (5 + cyrptEvilBonus()) > 13;
      case $monster`dirty old lihc`:
        // only worth it if we need 18 or more evilness reduced.
        // avant guard makes free fights cost a turn. Use DOL in place of tentacle
        return (
          in_avantGuard() &&
          get("cyrptNicheEvilness") - 5 * (3 + cyrptEvilBonus()) > 13
        );
      case $monster`lobsterfrogman`: {
        // only worth it if we need 3+ barrels
        const sonofa_complete: boolean =
          get("sidequestLighthouseCompleted") === "hippy" ||
          get("sidequestLighthouseCompleted") === "fratboy";
        return !sonofa_complete && auto_gunpowderBarrelsWanted() > 1;
      }
      case $monster`Eldritch Tentacle`:
        // Max tentacles fought being free is 11, so don't habitat if we've fought more than 6
        // This variable increments at the end of combat, so we need 5 here.
        if (get("_eldritchTentaclesFoughtToday") > 5) {
          return false;
        }

        // don't habitat free fights in avant guard
        return (
          !in_avantGuard() &&
          (safeGet("auto_habitatMonster") === target ||
            (safeGet("_monsterHabitatsMonster") === target &&
              get("_monsterHabitatsFightsLeft") === 0))
        );
      default:
        return safeGet("auto_habitatMonster") === target;
    }
  }
  return false;
}

export function habitatFightsLeft(): number {
  return get("_monsterHabitatsFightsLeft");
}

export function habitatMonster(): Monster {
  if (get("_monsterHabitatsFightsLeft") > 0) {
    return safeGet("_monsterHabitatsMonster");
  }
  return $monster.none;
}

export function canCircadianRhythm(): boolean {
  if (!haveBofa()) {
    return false;
  }
  if (get("_circadianRhythmsRecalled")) {
    return false;
  }
  return true;
}

export function circadianRhythmTarget(target: Monster): boolean {
  if (!canCircadianRhythm()) {
    return false;
  }
  if (
    !$monsters`shadow bat, shadow cow, shadow devil, shadow guy, shadow hexagon, shadow orb, shadow prism, shadow slab, shadow snake, shadow spider, shadow stalk, shadow tree`.includes(
      target,
    )
  ) {
    return false;
  }
  return true;
}

export function circadianRhythmTarget$1(target: Phylum): boolean {
  if (!canCircadianRhythm()) {
    return false;
  }
  if (!(
    $phyla`orc, hippy`.includes(target) &&
    $locations`The Battlefield (Hippy Uniform), The Battlefield (Frat Uniform)`.includes(
      myLocation(),
    )
  )) {
    return false;
  }
  return true;
}

export function wishFactsLeft(): number {
  if (!haveBofa()) {
    return 0;
  }
  return 3 - get("_bookOfFactsWishes");
}
