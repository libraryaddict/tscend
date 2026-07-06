import {
  cliExecute,
  floristAvailable,
  getFloristPlants,
  getProperty,
  itemAmount,
  knollAvailable,
  Location,
  monsterLevelAdjustment,
  mpCost,
  myClass,
  myDaycount,
  myLocation,
  myMp,
  toInt,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $class, $effect, $item, $location, $skill } from "libram";

import { auto_buyUpTo } from "../auto_acquire";
import { buffMaintain$3 } from "../auto_buff";
import { possessEquipment } from "../auto_equipment";
import { auto_have_skill, auto_log_warning, autoCraft } from "../auto_util";
import { is_professor } from "../paths/wereprofessor";

//	This is meant for items that have a date of 2013

//Defined in autoscend/iotms/mr2013.ash
export function makeStartingSmiths(): void {
  if (!auto_have_skill($skill`Summon Smithsness`)) {
    return;
  }

  if (itemAmount($item`lump of Brituminous coal`) === 0) {
    if (myMp() < 3 * mpCost($skill`Summon Smithsness`)) {
      auto_log_warning(
        "You don't have enough MP for initialization, it might be ok but probably not.",
        "red",
      );
    }
    useSkill(3, $skill`Summon Smithsness`);
  }

  if (knollAvailable()) {
    auto_buyUpTo(1, $item`maiden wig`);
  }

  switch (myClass()) {
    case $class`Seal Clubber`:
      if (!possessEquipment($item`Meat Tenderizer is Murder`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`seal-clubbing club`,
        );
      }
      if (
        !possessEquipment($item`Vicar's Tutu`) &&
        itemAmount($item`lump of Brituminous coal`) > 0 &&
        knollAvailable()
      ) {
        auto_buyUpTo(1, $item`frilly skirt`);
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`frilly skirt`,
        );
      }
      break;
    case $class`Turtle Tamer`:
      if (!possessEquipment($item`Work is a Four Letter Sword`)) {
        auto_buyUpTo(1, $item`sword hilt`);
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`sword hilt`,
        );
      }
      if (!possessEquipment($item`Ouija Board, Ouija Board`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`turtle totem`,
        );
      }
      break;
    case $class`Sauceror`:
      if (!possessEquipment($item`Saucepanic`)) {
        autoCraft("smith", 1, $item`lump of Brituminous coal`, $item`saucepan`);
      }
      if (
        !possessEquipment($item`A Light that Never Goes Out`) &&
        itemAmount($item`lump of Brituminous coal`) > 0
      ) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`third-hand lantern`,
        );
      }
      break;
    case $class`Pastamancer`:
      if (!possessEquipment($item`Hand that Rocks the Ladle`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`pasta spoon`,
        );
      }
      break;
    case $class`Disco Bandit`:
      if (!possessEquipment($item`Frankly Mr. Shank`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`disco ball`,
        );
      }
      break;
    case $class`Accordion Thief`:
      if (!possessEquipment($item`Shakespeare's Sister's Accordion`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`stolen accordion`,
        );
      }
      break;
  }

  if (
    knollAvailable() &&
    !possessEquipment($item`Hairpiece On Fire`) &&
    itemAmount($item`lump of Brituminous coal`) > 0
  ) {
    autoCraft("smith", 1, $item`lump of Brituminous coal`, $item`maiden wig`);
  }
  buffMaintain$3($effect`Merry Smithsness`, 0, 1, 10);
}

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

function trickMafiaAboutFlorist(): void {
  // This only works if you actually have the Florist Friar but it isn\'t detected by Mafia
  // This may not be the most optimal way to do it.
  visitUrl("choice.php?whichchoice=720&pwd=&option=4");
  visitUrl("place.php?whichplace=forestvillage&action=fv_friar");
  visitUrl("choice.php?whichchoice=720&pwd=&option=4");
  //We might not need to do this last one...
  visitUrl("choice.php?whichchoice=720&pwd=&option=4");
}

export function oldPeoplePlantStuff(): void {
  if (!floristAvailable()) {
    return;
  }

  if (didWePlantHere(myLocation())) {
    return;
  }
  let addml: boolean = true;
  if (
    (monsterLevelAdjustment() > toInt(getProperty("auto_MLSafetyLimit")) &&
      getProperty("auto_MLSafetyLimit") !== "") ||
    toInt(getProperty("auto_MLSafetyLimit")) === -1
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
