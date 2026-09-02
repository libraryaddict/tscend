import { Monster, myPath } from "kolmafia";
import { $path, get, set } from "libram";

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
  set("auto_wandOfNagamar", false);

  if (bluevsred_isRed()) {
    set("auto_hippyInstead", true);
    set("auto_skipNuns", true);
  }
}

export function bluevsred_willEncounterFight(monster: Monster): boolean {
  if (!in_bluevsred()) {
    return true;
  }

  // "enemy" means they're on no team, otherwise they're "red" or "blue"
  // There's "unknown", but for our sanity they're also on no team.
  const team = monster.blueVsRedTeam;
  if (team !== "blue" && team !== "red") {
    return true;
  }

  return team !== (bluevsred_isBlue() ? "blue" : "red");
}
