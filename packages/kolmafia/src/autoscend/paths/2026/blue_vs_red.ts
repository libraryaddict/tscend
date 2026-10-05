import {
  getProperty,
  Monster,
  myPath,
  removeProperty,
  setProperty,
} from "kolmafia";
import { $path, get, set } from "libram";

import { auto_log_info } from "../../utils/auto_log";

const observedBlueVsRedEncounters: string =
  "tscend_observedBlueVsRedEncounters";
const overriddenEncounters: Map<Monster, "red" | "blue"> = new Map();
let blueVsRedLoaded: boolean = false;
let lastSeenBvR: Monster = get("lastBlueVsRedNCMonster");

function loadOverrides() {
  if (blueVsRedLoaded) return;

  blueVsRedLoaded = true;

  const val = getProperty(observedBlueVsRedEncounters);
  let save = false;

  if (val.startsWith("[")) {
    for (const [monster, team] of JSON.parse(val)) {
      const mon = Monster.get(monster);
      if (mon.blueVsRedTeam !== "unknown") {
        save = true;
        continue;
      }

      overriddenEncounters.set(Monster.get(monster), team);
    }

    if (save) {
      saveOverrides();
    }
  }
}

export function addDetectedBvREncounter() {
  loadOverrides();

  const monster: Monster = get("lastBlueVsRedNCMonster");

  if (monster === lastSeenBvR) return;

  lastSeenBvR = monster;

  addOverride(monster);
}

function addOverride(monster: Monster) {
  // If already known by mafia or us
  if (
    monster.blueVsRedTeam === get("blueVsRedTeam") ||
    overriddenEncounters.get(monster) === get("blueVsRedTeam")
  ) {
    return;
  }

  auto_log_info(
    `Adding detected blue vs red encounter of ${monster.name} to the list, it seems it is on team ${get("blueVsRedTeam")}`,
  );

  overriddenEncounters.set(monster, get("blueVsRedTeam") as "red" | "blue");
  saveOverrides();
}

function saveOverrides() {
  if (overriddenEncounters.size === 0) {
    removeProperty(observedBlueVsRedEncounters);
  } else {
    setProperty(
      observedBlueVsRedEncounters,
      JSON.stringify(
        [...overriddenEncounters].map(
          ([mon, team]) => `[${mon.id}]${mon.name} | ${team}`,
        ),
      ),
    );
  }
}

export function in_bluevsred(): boolean {
  return myPath() === $path`Blue vs. Red`;
}

export function bluevsred_isBlue(): boolean {
  return in_bluevsred() && get("blueVsRedTeam") === "blue";
}

export function bluevsred_isRed(): boolean {
  return in_bluevsred() && get("blueVsRedTeam") === "red";
}

export function bluevsred_initializeSettings(): void {
  if (!in_bluevsred()) {
    return;
  }
  //wand not used in this path
  set("tscend_wandOfNagamar", false);

  if (bluevsred_isRed()) {
    set("tscend_hippyInstead", true);
    set("tscend_skipNuns", true);
  }
}

export function bluevsred_willEncounterFight(monster: Monster): boolean {
  if (!in_bluevsred()) {
    return true;
  }

  // Try to detect the last blue vs red monster, adding unknown
  addDetectedBvREncounter();

  // "enemy" means they're on no team, otherwise they're "red" or "blue"
  // There's "unknown", but for our sanity they're also on no team.
  const team = overriddenEncounters.get(monster) ?? monster.blueVsRedTeam;

  if (team !== "blue" && team !== "red") {
    return true;
  }

  return team !== (bluevsred_isBlue() ? "blue" : "red");
}
