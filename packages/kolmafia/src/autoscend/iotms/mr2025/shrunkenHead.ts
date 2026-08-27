import {
  appearanceRates,
  containsText,
  getMonsters,
  Location,
  Monster,
  shrunkenHeadZombie,
} from "kolmafia";
import { $item, $monster, $skill, get } from "libram";

import { auto_is_valid, safeGet } from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";

function auto_haveShrunkenHead(): boolean {
  if (get("hasShrunkenHead") && auto_is_valid($item`shrunken head`)) {
    return true;
  }
  return false;
}

export function wantToShrunkenHead(enemy: Monster): boolean {
  if (!auto_haveShrunkenHead()) {
    return false;
  }

  if (!auto_canUse($skill`Prepare to reanimate your Foe`)) {
    return false;
  }

  if (!enemy.copyable) {
    return false;
  }
  // as the created zombie doesn't die, get one that gives +item and no passive damage
  let hasItem: boolean = false;
  for (const [, bonus] of shrunkenHeadZombie(enemy).entries()) {
    if (containsText(bonus, "Attack")) {
      return false;
    }
    if (containsText(bonus, "Item Drop")) {
      hasItem = true;
    }
  }

  return hasItem;
}

export function wantToShrunkenHead$1(place: Location): boolean {
  if (!auto_haveShrunkenHead()) {
    return false;
  }

  const next: Monster = safeGet("auto_nextEncounter");
  if (next !== $monster.none) {
    //next monster is forced by zone mechanics or some other mechanism
    return wantToShrunkenHead(next);
  } else {
    for (const [, mon] of getMonsters(place).entries()) {
      if ((appearanceRates(place)[mon.toString()] ??= 0.0) > 0) {
        if (wantToShrunkenHead(mon)) {
          return true;
        }
      }
    }
  }
  return false;
}
