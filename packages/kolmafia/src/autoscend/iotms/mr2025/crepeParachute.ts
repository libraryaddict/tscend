import { Location, Monster, toMonster, turnsPlayed, visitUrl } from "kolmafia";
import { $effect, $item, $location, $monster, get, have } from "libram";

import { BCZ, Peridot, SwordOfSwords } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import { zone_available } from "../../auto_zone";
import { auto_wantToCopy } from "../../combat/wanderers/copier";
import { QuestTask } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdvBypass$1 } from "../../executors/auto_adventure";
import { auto_log_info } from "../../utils/auto_log";
import {
  auto_is_valid,
  auto_locationMonsters,
  auto_monsterHasWantedDrop,
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

function wantToParachuteInto(mon: Monster, loc: Location): boolean {
  if (Peridot.havePeridot() && !Peridot.haveUsedPeridot(loc)) return false;
  if (BCZ.bczRefractedGaze(true, loc)) return false;

  if (auto_wantToCopy(mon, loc)) return true;

  return (
    auto_monsterHasWantedDrop(mon) &&
    !SwordOfSwords.swordWillOverwriteDrops(mon)
  );
}

function bestParachuteTarget(loc: Location, available: Monster[]): Monster {
  const targets = available.filter((mon) => wantToParachuteInto(mon, loc));

  if (targets.length === 0) return $monster.none;

  return targets.reduce((best, mon) =>
    zoneRank(mon, loc) < zoneRank(best, loc) ? mon : best,
  );
}

let lastParachuteAttempt = "";

function parachuteAttemptKey(): string {
  return `${get("lastAdventure")}:${turnsPlayed()}`;
}

function wantToParachute(): boolean {
  const loc = get("lastAdventure");
  if (
    !canParachute() ||
    lastParachuteAttempt === parachuteAttemptKey() ||
    loc === $location.none ||
    !zone_available(loc)
  ) {
    return false;
  }

  const wanted: [Monster, number][] = auto_locationMonsters(loc).filter(
    ([mon, rate]) => rate > 0 && wantToParachuteInto(mon, loc),
  );
  const wantedRate: number = wanted.reduce((sum, [, rate]) => sum + rate, 0);
  // Only if we think we'd encounter at least one, and it's not superlikely already
  return wanted.length > 0 && wantedRate <= 85;
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
    return autoAdvBypass$1(
      "inventory.php?action=parachute&pwd",
      get("lastAdventure"),
    );
  },
});
