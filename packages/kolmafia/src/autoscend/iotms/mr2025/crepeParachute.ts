import {
  canAdventure,
  Location,
  Monster,
  toMonster,
  turnsPlayed,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $location, $monster, get, have, set } from "libram";

import { BCZ, Peridot, SwordOfSwords } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import { zone_delay } from "../../auto_zone";
import { monsterWants, QuestTask } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdvBypass$1 } from "../../executors/auto_adventure";
import {
  bluevsred_willEncounterFight,
  in_bluevsred,
} from "../../paths/2026/blue_vs_red";
import { auto_log_info } from "../../utils/auto_log";
import {
  auto_is_valid,
  auto_locationMonsters,
  auto_runChoice,
  handleTracker,
  zoneRank,
} from "../../utils/auto_util";

export function haveCrepeParachute(): boolean {
  const cape = $item`crepe paper parachute cape`;
  return auto_is_valid(cape) && possessEquipment(cape);
}

export function canParachute(): boolean {
  return haveCrepeParachute() && !have($effect`Everything looks Beige`);
}

function parachuteUsefulAt(loc: Location): boolean {
  if (Peridot.havePeridot() && !Peridot.haveUsedPeridot(loc)) return false;
  return !BCZ.bczRefractedGaze(true, loc);
}

function wantToParachuteInto(mon: Monster): boolean {
  if (!bluevsred_willEncounterFight(mon)) return false;

  const wants = monsterWants(mon);
  if (
    wants.some(
      (want) => want.byMonster !== undefined || want.byPhylum !== undefined,
    )
  ) {
    return true;
  }

  return wants.length > 0 && !SwordOfSwords.swordWillOverwriteDrops(mon);
}

function bestParachuteTarget(loc: Location, available: Monster[]): Monster {
  if (!parachuteUsefulAt(loc)) return $monster.none;

  let targets = available.filter(wantToParachuteInto);

  if (targets.length === 0 && !available.every(bluevsred_willEncounterFight)) {
    targets = available.filter(bluevsred_willEncounterFight);
  }

  if (targets.length === 0) return $monster.none;

  return targets.reduce((best, mon) =>
    zoneRank(mon, loc) < zoneRank(best, loc) ? mon : best,
  );
}

let lastParachuteAttempt = "";

function parachuteAttemptKey(): string {
  return `${get("lastAdventure")}:${turnsPlayed()}`;
}

function parachuteWanted(loc: Location): boolean {
  if (loc === $location.none || !canAdventure(loc) || !parachuteUsefulAt(loc)) {
    return false;
  }

  const encounters: [Monster, number][] = auto_locationMonsters(loc).filter(
    ([, rate]) => rate > 0,
  );
  const wanted = encounters.filter(([mon]) => wantToParachuteInto(mon));
  const wantedRate: number = wanted.reduce((sum, [, rate]) => sum + rate, 0);
  // Only if we think we'd encounter at least one, and it's not very likely already
  // Note: NCs do adjust the encounter rate, but that's kind of ok?
  if (wanted.length > 0) return wantedRate <= 90;

  // If we are in BvR and this zone needs delay burned
  if (!in_bluevsred() || zone_delay(loc).delayRemaining <= 0) {
    return false;
  }

  let fightsRate = 0;
  let noFightsRate = 0;

  encounters.forEach(([monster, rate]) => {
    if (bluevsred_willEncounterFight(monster)) {
      fightsRate += rate;
    } else {
      noFightsRate += rate;
    }
  });

  // If there's even 30% more chance to encounter an allied (choice) monster
  // And we have an actual fight we could do if we parachute in to burn delay
  return noFightsRate * 3 > fightsRate && fightsRate > 0;
}

function wantToParachute(): boolean {
  if (!canParachute()) return false;

  const key = parachuteAttemptKey();
  if (lastParachuteAttempt === key) return false;

  if (parachuteWanted(get("lastAdventure"))) return true;

  lastParachuteAttempt = key;
  return false;
}

export function parachuteChoiceHandler(page: string): void {
  const loc = get("lastAdventure");
  const available = [...page.matchAll(/<option value="(\d+)">/g)].map(
    ([, id]) => toMonster(Number(id)),
  );
  const target = bestParachuteTarget(loc, available);

  if (target === $monster.none) {
    auto_log_info(
      `Parachuting from ${loc} but none of ${available.join(", ")} are wanted, backing out`,
    );
    visitUrl("main.php");
    return;
  }

  handleTracker({
    tracker: "monstersMapped",
    source: $item`crepe paper parachute cape`,
    location: loc,
    monster: target,
  });
  auto_runChoice(1, `monid=${target.id}`);
}

export const parachuteTask: QuestTask = registerQuestTask({
  name: "crepeParachute",
  completed: () => !haveCrepeParachute(),
  ready: wantToParachute,
  do: () => {
    lastParachuteAttempt = parachuteAttemptKey();
    const loc = get("lastAdventure");
    const available = auto_locationMonsters(loc)
      .filter(([, rate]) => rate > 0)
      .map(([mon]) => mon);
    set("tscend_nextEncounter", bestParachuteTarget(loc, available));
    try {
      return autoAdvBypass$1("inventory.php?action=parachute&pwd", loc);
    } finally {
      set("tscend_nextEncounter", "");
    }
  },
});
