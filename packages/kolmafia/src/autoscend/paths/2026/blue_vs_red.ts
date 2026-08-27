import { Monster, myPath } from "kolmafia";
import { $path, get, set } from "libram";

import { fileAsMap } from "../../utils/kolmafiaUtils";

export function in_bluevsred(): boolean {
  return myPath() === $path`Blue vs. Red`;
}

export function bluevsred_isBlue(): boolean {
  // eslint-disable-next-line local/verify-properties
  return in_bluevsred() && get("blueVsRedTeam") === "blue";
}

export function bluevsred_isRed(): boolean {
  // eslint-disable-next-line local/verify-properties
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

const bluevsred_monsterColors = new Map<
  number,
  { blue: string; red: string }
>();
for (const byId of (
  fileAsMap("autoscend_paths.txt", [String, Number, Number, "string[]"]).get(
    "bluevsred",
  ) ?? new Map<number, Map<number, string[]>>()
).values()) {
  function sanitize(str: string) {
    str = str.trim().toLowerCase();
    if (str === "red" || str === "blue") return str;
    return "";
  }
  for (const [monsterId, [, colorIfBlue, colorIfRed]] of byId) {
    let blue = sanitize(colorIfBlue);
    let red = sanitize(colorIfRed);
    if (blue === "") blue = red;
    if (red === "") red = blue;
    bluevsred_monsterColors.set(monsterId, {
      blue: blue,
      red: red,
    });
  }
}

function bluevsred_colorFor(monsterId: number, team: "blue" | "red"): string {
  const colors = bluevsred_monsterColors.get(monsterId);
  return colors ? colors[team] : "";
}

export function bluevsred_willEncounterFight(monster: Monster): boolean {
  if (!in_bluevsred()) {
    return true;
  }

  const ourTeam = bluevsred_isBlue() ? "blue" : "red";
  const otherTeam = ourTeam === "blue" ? "red" : "blue";

  // We will encounter a NC when the monster is the same color as us.
  // The data is incomplete, so:
  // 1. If we can resolve it by the color we will see them as, use that
  // 2. If that's missing, fall back to the color the other team will see them as
  // 3. If that's missing too, we don't know what color it is, so assume it's a NC to be safe
  const color =
    bluevsred_colorFor(monster.id, ourTeam) ||
    bluevsred_colorFor(monster.id, otherTeam);

  return color ? color !== ourTeam : false;
}
