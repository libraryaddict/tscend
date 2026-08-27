import {
  cliExecute,
  Location,
  myFamiliar,
  Phylum,
  removeProperty,
  toPhylum,
} from "kolmafia";
import { $familiar, $location, $phylum, get, set } from "libram";

import { canChangeToFamiliar } from "../../auto_familiar";
import {
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  safeGet,
} from "../../auto_util";

// Note this doesn't clamp to 15 - that's enforced elsewhere.

export function auto_changeSnapperPhylum(toChange: Phylum): boolean {
  // Calling this function with a suitable phylum (anything other than none)
  // will cause the Red-Nosed Snapper to be changed to that phylum during pre-Adventure handling.
  // This will overwrite any current phylum, losing all progress towards that item (this is intended)
  // You have been warned.

  if (
    !canChangeToFamiliar($familiar`Red-Nosed Snapper`) ||
    toChange === $phylum.none
  ) {
    return false;
  }
  set("auto_snapperPhylum", toChange);
  return true;
}

export function auto_snapperPreAdventure(loc: Location): void {
  if (myFamiliar() !== $familiar`Red-Nosed Snapper`) {
    return;
  }

  let desiredPhylum: string = get("auto_snapperPhylum");
  if (desiredPhylum !== "" && toPhylum(desiredPhylum) === $phylum.none) {
    auto_log_warning(
      `auto_snapperPhylum was set to bad value: ${desiredPhylum}. Should be a valid phylum.`,
      "red",
    );
    removeProperty("auto_snapperPhylum");
    return;
  }

  if (safeGet("redSnapperPhylum") === toPhylum(desiredPhylum)) {
    auto_log_debug(
      `Red-Nosed Snapper is already guiding you towards ${desiredPhylum}`,
    );
    return;
  }
  // this is mainly in case autoChooseFamiliar switches to the Snapper due to no "better" +item familiars being available
  // It is preferred that you do not rely on this to change phylum in a quest, call changeSnapperPhylum in the quest handling code instead.
  if (desiredPhylum === "" && get("redSnapperProgress") === 0) {
    switch (loc) {
      case $location`The Penultimate Fantasy Airship`:
      case $location`The Hidden Park`:
      case $location`The Hidden Hospital`:
      case $location`The Hidden Office Building`:
      case $location`The Hidden Apartment Building`:
      case $location`The Hidden Bowling Alley`:
      case $location`The Copperhead Club`:
      case $location`A Mob of Zeppelin Protesters`:
      case $location`The Red Zeppelin`:
      case $location`Inside the Palindome`:
      case $location`The Neverending Party`:
      case $location`South of the Border`:
      case $location`The Valley of Rof L'm Fao`:
        desiredPhylum = $phylum`dude`.toString(); // human musk (banisher)

        break;
      case $location`The Hole in the Sky`:
        desiredPhylum = $phylum`constellation`.toString(); // micronova (yellow ray)

        break;
      case $location`The Smut Orc Logging Camp`:
        desiredPhylum = $phylum`orc`.toString(); // boot flask (size 3 awesome booze)

        break;
      case $location`The Outskirts of Cobb's Knob`:
      case $location`Cobb's Knob Barracks`:
      case $location`Cobb's Knob Kitchens`:
      case $location`Cobb's Knob Harem`:
      case $location`Cobb's Knob Treasury`:
      case $location`Cobb's Knob Laboratory`:
        desiredPhylum = $phylum`goblin`.toString(); // guffin (size 3 awesome food)

        break;
      case $location`The "Fun" House`:
        desiredPhylum = $phylum`horror`.toString(); // powdered madness (free kill)

        break;
      case $location`Twin Peak`:
        // this is actually a dude heavy zone *but* we want to fight the topiary monsters for rusty hedge trimmers.
        desiredPhylum = $phylum`beast`.toString();
        break;
      default:
        auto_log_info(
          `Going to ${loc} with the Red-Nosed Snapper without setting a phylum. This is not necessarily bad but it might be worth checking.`,
          "blue",
        );
        return;
    }
  }

  if (desiredPhylum !== "") {
    cliExecute(`snapper ${desiredPhylum}`);
    auto_log_info(
      `Red-Nosed Snapper is now guiding you towards ${desiredPhylum}`,
      "blue",
    );
  }
}
