import {
  availableAmount,
  cliExecute,
  containsText,
  Location,
  myFamiliar,
  myPrimestat,
  splitString,
  toLowerCase,
} from "kolmafia";
import { $familiar, $item, $location, $locations, $stat, get } from "libram";

import { auto_abort } from "../../auto_util";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";

export function latteDropName(l: Location): string {
  switch (l) {
    case $location`The Mouldering Mansion`:
      return "ancient";
    case $location`The Overgrown Lot`:
      return "basil";
    case $location`Whitey's Grove`:
      return "belgian";
    case $location`The Bugbear Pen`:
      return "bug-thistle";
    case $location`Madness Bakery`:
      return "butternut";
    case $location`The Black Forest`:
      return "cajun";
    case $location`The Haunted Billiards Room`:
      return "chalk";
    case $location`The Dire Warren`:
      return "carrot";
    case $location`Barrrney's Barrr`:
      return "carrrdamom";
    case $location`The Haunted Kitchen`:
      return "chili";
    case $location`The Sleazy Back Alley`:
      return "cloves";
    case $location`The Haunted Boiler Room`:
      return "coal";
    case $location`The Icy Peak`:
      return "cocoa";
    case $location`The Cola Wars Battlefield`:
      return "diet";
    case $location`Itznotyerzitz Mine`:
      return "dwarf";
    case $location`The Feeding Chamber`:
      return "filth";
    case $location`The Road to the White Citadel`:
      return "flour";
    case $location`The Fungal Nethers`:
      return "fungus";
    case $location`The Hidden Park`:
      return "grass";
    case $location`Cobb's Knob Barracks`:
      return "greasy";
    case $location`The Daily Dungeon`:
      return "healing";
    case $location`The Dark Neck of the Woods`:
      return "hellion";
    case $location`Wartime Frat House (Hippy Disguise)`:
      return "greek";
    case $location`The Old Rubee Mine`:
      return "grobold";
    case $location`The Bat Hole Entrance`:
      return "guarna";
    case $location`1st Floor, Shiawase-Mitsuhama Building`:
      return "gunpowder";
    case $location`Hobopolis Town Square`:
      return "hobo";
    case $location`The Haunted Library`:
      return "ink";
    case $location`Wartime Hippy Camp (Frat Disguise)`:
      return "kombucha";
    case $location`The Defiled Niche`:
      return "lihc";
    case $location`The Arid, Extra-Dry Desert`:
      return "lizard";
    case $location`Cobb's Knob Laboratory`:
      return "mega";
    case $location`The Unquiet Garves`:
      return "mold";
    case $location`The Briniest Deepests`:
      return "msg";
    case $location`The Haunted Pantry`:
      return "noodles";
    case $location`The Ice Hole`:
      return "norwhal";
    case $location`The Old Landfill`:
      return "oil";
    case $location`The Haunted Gallery`:
      return "paint";
    case $location`The Stately Pleasure Dome`:
      return "paradise";
    case $location`The Spooky Forest`:
      return "rawhide";
    case $location`The Brinier Deepers`:
      return "rock";
    case $location`The Briny Deeps`:
      return "salt";
    case $location`Noob Cave`:
      return "sandalwood";
    case $location`Cobb's Knob Kitchens`:
      return "sausage";
    case $location`The Hole in the Sky`:
      return "space";
    case $location`The Copperhead Club`:
      return "squash";
    case $location`The Caliginous Abyss`:
      return "squamous";
    case $location`The VERY Unquiet Garves`:
      return "teeth";
    case $location`The Middle Chamber`:
      return "venom";
    case $location`The Dark Elbow of the Woods`:
      return "vitamins";
    case $location`The Dark Heart of the Woods`:
      return "wing";
    default:
      return "";
  }
}

export function latteDropAvailable(l: Location): boolean {
  // obviously no latte drops are available if you don't HAVE a latte
  if (availableAmount($item`latte lovers member's mug`) === 0) {
    return false;
  }
  const latteDrop: string = latteDropName(l);
  if (latteDrop === "") {
    return false;
  }
  return !containsText(get("latteUnlocks"), latteDrop);
}

export function latteDropWanted(l: Location): boolean {
  return (
    latteDropAvailable(l) &&
    !$locations`Noob Cave, The Haunted Boiler Room, The Arid\, Extra-Dry Desert`.includes(
      l,
    )
  );
}

function auto_latteTranslate(ingredient: string): string {
  switch (toLowerCase(ingredient)) {
    case "combat":
      return "wing";
    case "noncombat":
    case "noncom":
      return "ink";
    case "famxp":
      return "vitamins";
    case "exp":
      switch (myPrimestat()) {
        case $stat`Muscle`:
          return "vanilla";
        case $stat`Mysticality`:
          return "pumpkin";
        case $stat`Moxie`:
          return "cinnamon";
      }
      break;
    case "fam":
    case "weight":
    case "famweight":
      return "rawhide";
    case "prismatic":
    case "prism":
    case "pris":
      return "paint";
    case "meat":
      return "cajun";
    case "item":
      return "carrot";
  }
  return toLowerCase(ingredient);
}

function auto_latteRefill(
  want1: string,
  want2: string,
  want3: string,
  force: boolean,
): boolean {
  if (availableAmount($item`latte lovers member's mug`) === 0) {
    return false;
  }

  if (get("_latteRefillsUsed") >= 3) {
    return false;
  }
  // don't want to waste banishes
  if (!get("_latteBanishUsed") && !force) {
    return false;
  }

  const unlocked: string[] = splitString(get("latteUnlocks"), ",");

  want1 = auto_latteTranslate(want1);
  want2 = auto_latteTranslate(want2);
  want3 = auto_latteTranslate(want3);

  const wants: Map<number, string> = new Map();
  if (want1 !== "") {
    if (!unlocked.includes(want1)) {
      return false;
    }
    wants.set(wants.size, want1);
  }
  if (want2 !== "") {
    if (!unlocked.includes(want2)) {
      return false;
    }
    wants.set(wants.size, want2);
  }
  if (want3 !== "") {
    if (!unlocked.includes(want3)) {
      return false;
    }
    wants.set(wants.size, want3);
  }

  function haveWant(want: string): boolean {
    want = auto_latteTranslate(want);
    for (const [, s] of wants) {
      if (s === want) {
        return true;
      }
    }
    return false;
  }

  function tryAddWant(want: string): boolean {
    if (wants.size >= 3 || haveWant(want)) {
      return false;
    }
    want = auto_latteTranslate(want);
    if (!unlocked.includes(want)) {
      return false;
    }

    wants.set(wants.size, want);
    return true;
  }

  if (in_darkGyffte()) {
    tryAddWant("healing");
  }

  if (!haveWant("combat")) {
    tryAddWant("noncombat");
  }

  tryAddWant("item");
  tryAddWant("meat");

  if (myFamiliar() !== $familiar.none) {
    tryAddWant("famweight");
  }

  tryAddWant("exp");
  tryAddWant("grass");

  if (myFamiliar() !== $familiar.none) {
    tryAddWant("famxp");
  }
  // just to make sure we have at least 3 ingredients
  for (const want of ["pumpkin", "cinnamon", "vanilla"]) {
    tryAddWant(want);
  }

  if (wants.size < 3) {
    auto_abort(
      "Something went terribly wrong while trying to refill latte. Yikes!",
    );
  }

  cliExecute(
    `latte refill ${wants.get(0) ?? ""} ${wants.get(1) ?? ""} ${wants.get(2) ?? ""}`,
  );
  return true;
}

function auto_latteRefill$2(
  want1: string,
  want2: string,
  force: boolean,
): boolean {
  return auto_latteRefill(want1, want2, "", force);
}

export function latteRefill$4(
  want1: string = "",
  force: boolean = false,
): boolean {
  return auto_latteRefill$2(want1, "", force);
}
