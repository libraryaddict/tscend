import {
  expectedDamage,
  isUnrestricted,
  Monster,
  monsterHp,
  myHp,
} from "kolmafia";
import { $item, $location, $monsters, $skill, get } from "libram";

import { autoAdv } from "../../executors/auto_adventure";
import { auto_have_skill } from "../../utils/auto_util";

// These monsters will replace our skills with 'Throw rock'
const cyberMonsters = $monsters`zombie process, botfly, network worm, ICE man, rat (remote access trojan), firewall, ICE barrier, corruption quarantine, parental controls, null container`;

export function isCyberMonster(monster: Monster): boolean {
  return cyberMonsters.includes(monster);
}

export function haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  if (get("crAlways") || get("_crToday")) {
    return true;
  }
  return false;
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
function wouldSurvive(): boolean {
  return cyberMonsters.every((m) => {
    // A rock deals 10 damage per round, which means we must survive that many rounds
    const rounds = Math.ceil(monsterHp(m) / 10);
    // There is a limit of 30 rounds, let us use 29
    if (rounds >= 29) {
      return false;
    }

    // We need to deal more damage than them
    return expectedDamage(m) * rounds < myHp();
  });
}

export function cyberRealmCombat(): boolean {
  if (cyberrealmFreeFights() <= 0 || !wouldSurvive()) {
    return false;
  }

  return autoAdv($location`Cyberzone 1`);
}
