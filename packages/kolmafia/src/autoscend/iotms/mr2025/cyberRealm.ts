import {
  expectedDamage,
  isUnrestricted,
  Monster,
  myMaxhp,
  turnsPlayed,
} from "kolmafia";
import {
  $item,
  $location,
  $modifier,
  $monsters,
  $skill,
  get,
  set,
} from "libram";

import { autoAdv } from "../../executors/auto_adventure";
import { auto_have_skill } from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";

// These monsters will replace our skills with 'Throw rock'
const cyberMonsters = $monsters`zombie process, botfly, network worm, ICE man, rat (remote access trojan), firewall, ICE barrier, corruption quarantine, parental controls, null container`;

export function isCyberMonster(monster: Monster): boolean {
  return cyberMonsters.includes(monster);
}

export function haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  return get("crAlways") || get("_crToday");
}

export function cyberrealmFreeFights(): number {
  if (!haveCyberRealm() || !auto_have_skill($skill`OVERCLOCK(10)`)) {
    return 0;
  }

  return 10 - get("_cyberFreeFights");
}

/**
 * If we would win if we threw rocks every round at every cyber monster we might encounter
 */
function wouldSurvive(tryMaximize: boolean): boolean {
  if (tryMaximize) {
    maximizer.weight($modifier`Monster Level`, -100, false);
    maximizer.maximize();
  }

  // Apparently kolmafia doesn't understand how cyberrealm stats works, so let us assume always 50 hp (60 for sanity) which is 6 rounds to kill
  return cyberMonsters.every((m) => expectedDamage(m) * 6 < myMaxhp());
}

export function cyberRealmCombat(): boolean {
  if (cyberrealmFreeFights() <= 0) {
    return false;
  }

  // Check if we can naturally survive
  if (!wouldSurvive(false)) {
    // If we tried maximizing for cyber in the last 10 turns but failed, then return false
    if (get("_tscend_lastCyberAttempt") + 10 > turnsPlayed()) {
      return false;
    }

    // Try maximizing, and if we would fail, record it so we skip it for the next 10 turns
    if (!wouldSurvive(true)) {
      set("_tscend_lastCyberAttempt", turnsPlayed());
      return false;
    }
  }

  return autoAdv($location`Cyberzone 1`);
}
