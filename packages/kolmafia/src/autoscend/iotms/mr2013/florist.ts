import {
  cliExecute,
  floristAvailable,
  getFloristPlants,
  Location,
  monsterLevelAdjustment,
  myClass,
  myDaycount,
  myLocation,
  myPath,
  toInt,
} from "kolmafia";
import { $class, $location, $path, get } from "libram";

import { is_professor } from "../../paths/2024/wereprofessor";

function didWePlantHere(loc: Location): boolean {
  const places: Map<Location, string[]> = new Map(
    Object.entries(getFloristPlants()).map(([_k, _v]) => [
      Location.get(_k),
      _v,
    ]),
  );
  for (const place of places.keys()) {
    if (loc === place) {
      return true;
    }
  }
  return false;
}

export function haveFlorist() {
  return myPath() !== $path`Standard` && floristAvailable();
}

export function oldPeoplePlantStuff(): void {
  if (!haveFlorist()) {
    return;
  }

  if (didWePlantHere(myLocation())) {
    return;
  }
  let addml: boolean = true;
  if (
    (monsterLevelAdjustment() > toInt(get("auto_MLSafetyLimit")) &&
      get("auto_MLSafetyLimit") !== "") ||
    toInt(get("auto_MLSafetyLimit")) === -1
  ) {
    addml = false;
  }
  if (is_professor()) {
    addml = false;
  }

  if (myLocation() === $location`The Outskirts of Cobb's Knob`) {
    cliExecute("florist plant rad-ish radish");
    cliExecute("florist plant celery stalker");
  } else if (myLocation() === $location`The Spooky Forest`) {
    cliExecute("florist plant seltzer watercress");
    cliExecute("florist plant lettuce spray");
    cliExecute("florist plant deadly cinnamon");
  } else if (myLocation() === $location`The Haunted Bathroom`) {
    if (addml) {
      cliExecute("florist plant war lily");
    }
    cliExecute("florist plant Impatiens");
    cliExecute("florist plant arctic moss");
  } else if (myLocation() === $location`The Haunted Ballroom`) {
    cliExecute("florist plant stealing magnolia");
    cliExecute("florist plant aloe guv'nor");
    cliExecute("florist plant pitcher plant");
  } else if (myLocation() === $location`The Defiled Nook`) {
    cliExecute("florist plant horn of plenty");
  } else if (myLocation() === $location`The Defiled Alcove`) {
    cliExecute("florist plant shuffle truffle");
  } else if (myLocation() === $location`The Defiled Niche`) {
    cliExecute("florist plant wizard's wig");
  } else if (myLocation() === $location`The Obligatory Pirate's Cove`) {
    if (addml) {
      cliExecute("florist plant rabid dogwood");
    }
    cliExecute("florist plant artichoker");
  } else if (
    myLocation() === $location`Barrrney's Barrr` &&
    myClass() !== $class`Ed the Undying`
  ) {
    cliExecute("florist plant spider plant");
    cliExecute("florist plant red fern");
    cliExecute("florist plant bamboo!");
  } else if (myLocation() === $location`The Penultimate Fantasy Airship`) {
    cliExecute("florist plant rutabeggar");
    cliExecute("florist plant smoke-ra");
    cliExecute("florist plant skunk cabbage");
  } else if (
    myLocation() ===
      $location`The Castle in the Clouds in the Sky (Basement)` &&
    myDaycount() === 1
  ) {
    if (addml) {
      cliExecute("florist plant blustery puffball");
    }
    cliExecute("florist plant dis lichen");
    cliExecute("florist plant max headshroom");
  } else if (
    myLocation() ===
    $location`The Castle in the Clouds in the Sky (Ground Floor)`
  ) {
    cliExecute("florist plant canned spinach");
  } else if (myLocation() === $location`Oil Peak`) {
    if (addml) {
      cliExecute("florist plant rabid dogwood");
    }
    cliExecute("florist plant artichoker");
    cliExecute("florist plant celery stalker");
  } else if (myLocation() === $location`The Haunted Boiler Room`) {
    if (addml) {
      cliExecute("florist plant war lily");
    }
    cliExecute("florist plant red fern");
    cliExecute("florist plant arctic moss");
  } else if (myLocation() === $location`A Massive Ziggurat`) {
    cliExecute("florist plant skunk cabbage");
    cliExecute("florist plant deadly cinnamon");
  } else if (myLocation() === $location`The Arid, Extra-Dry Desert`) {
    cliExecute("florist plant rad-ish radish");
    cliExecute("florist plant lettuce spray");
  } else if (myLocation() === $location`The Hidden Apartment Building`) {
    cliExecute("florist plant impatiens");
    cliExecute("florist plant spider plant");
    cliExecute("florist plant pitcher plant");
  } else if (myLocation() === $location`The Hidden Office Building`) {
    cliExecute("florist plant canned spinach");
  } else if (myLocation() === $location`The Hidden Bowling Alley`) {
    cliExecute("florist plant Stealing Magnolia");
  } else if (myLocation() === $location`The Hidden Hospital`) {
    cliExecute("florist plant bamboo!");
    cliExecute("florist plant aloe guv'nor");
  } else if (myLocation() === $location`The Upper Chamber`) {
    if (addml) {
      cliExecute("florist plant Blustery Puffball");
    }
    cliExecute("florist plant Loose Morels");
    cliExecute("florist plant Foul Toadstool");
  } else if (myLocation() === $location`The Middle Chamber`) {
    cliExecute("florist plant Horn of Plenty");
    cliExecute("florist plant max headshroom");
    cliExecute("florist plant Dis Lichen");
  } else if (myLocation() === $location`The Battlefield (Frat Uniform)`) {
    cliExecute("florist plant Seltzer Watercress");
    cliExecute("florist plant Smoke-ra");
    cliExecute("florist plant Rutabeggar");
  } else if (
    myLocation() === $location`The Secret Government Laboratory` &&
    myDaycount() === 1
  ) {
    cliExecute("florist plant Pitcher Plant");
    cliExecute("florist plant Canned Spinach");
  } else if (myLocation() === $location`The Hippy Camp` && myDaycount() === 1) {
    cliExecute("florist plant Seltzer Watercress");
    cliExecute("florist plant Rad-ish Radish");
  } else if (
    myLocation() === $location`Pirates of the Garbage Barges` &&
    myDaycount() === 1
  ) {
    cliExecute("florist plant Pitcher Plant");
    cliExecute("florist plant Canned Spinach");
  } else if (myLocation() === $location`The Battlefield (Hippy Uniform)`) {
    cliExecute("florist plant Seltzer Watercress");
    cliExecute("florist plant Smoke-ra");
    cliExecute("florist plant Rutabeggar");
  }
}
