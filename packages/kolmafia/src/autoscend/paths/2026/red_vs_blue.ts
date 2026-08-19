import { myPath } from "kolmafia";
import { $path, get, set } from "libram";

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
    set("auto_skipL12Farm", true); // can softlock
  }
}
