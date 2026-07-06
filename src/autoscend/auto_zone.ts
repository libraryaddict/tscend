import {
  availableAmount,
  canadiaAvailable,
  canAdventure,
  containsText,
  equippedItem,
  fullnessLimit,
  getLocationMonsters,
  getMonsters,
  getProperty,
  gnomadsAvailable,
  guildAvailable,
  haveEffect,
  haveFamiliar,
  haveOutfit,
  haveSkill,
  inHardcore,
  isWearingOutfit,
  Item,
  itemAmount,
  itemDrops,
  itemDropsArray,
  Location,
  Monster,
  monsterLevelAdjustment,
  myAscensions,
  myClass,
  myLevel,
  myPrimestat,
  toBoolean,
  toFloat,
  toInt,
  toLocation,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $skill,
  $slot,
  $slots,
  $stat,
} from "libram";

import { fullness_left, inebriety_left } from "./auto_consume";
import { possessEquipment, possessOutfit$1 } from "./auto_equipment";
import {
  auto_combat_appearance_rates,
  auto_haveQueuedForcedNonCombat,
  auto_log_debug$1,
  canYellowRay$1,
  cloversAvailable$1,
  elemental_resist,
  internalQuestStatus,
  isDesertAvailable,
  isGuildClass,
} from "./auto_util";
import { generic_t } from "./autoscend_record";
import { expectGhostReport } from "./iotms/mr2016";
import { auto_voteMonster } from "./iotms/mr2018";
import { auto_sausageGoblin } from "./iotms/mr2019";
import {
  auto_canFightPiranhaPlant,
  auto_canTendMushroomGarden,
} from "./iotms/mr2020";
import { auto_haveBatWings } from "./iotms/mr2024";
import { bugbear_BioDataRemaining, in_bugbear } from "./paths/bugbear_invasion";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { kolhs_mandatorySchool } from "./paths/kolhs";
import { in_lta } from "./paths/license_to_adventure";
import { in_lar } from "./paths/live_ascend_repeat";
import { in_plumber } from "./paths/path_of_the_plumber";
import { in_robot } from "./paths/you_robot";
import { L8_forceExtremeInstead, L8_trapperTalk } from "./quests/level_08";
import { bridgeGoal } from "./quests/level_09";
import { getShenZonesTurnsSpent, liana_cleared } from "./quests/level_11";
import { need8BitPoints, needStarKey } from "./quests/level_13";
import {
  LX_doingPirates,
  LX_unlockThinknerdWarehouse,
  numPirateInsults,
} from "./quests/optional";

//All functions should fail if the king is liberated?
//Zone functions come here.

//Defined in autoscend/auto_zone.ash
function zone_unlock(loc: Location): boolean {
  let unlocked: boolean = false;
  if (loc === $location`The Thinknerd Warehouse`) {
    unlocked = LX_unlockThinknerdWarehouse(false);
  } else if (loc === $location`Lair of the Ninja Snowmen` && L8_trapperTalk()) {
    unlocked = true;
  } else {
    auto_log_debug$1(`Don't know how to unlock ${loc}`);
    return false;
  }

  if (!unlocked) {
    auto_log_debug$1(`Wasnt able to unlock ${loc}`);
  }

  return unlocked;
}

export function zone_isAvailable(
  loc: Location,
  unlockIfPossible: boolean,
): boolean {
  if (zone_available(loc)) {
    return true;
  }

  if (unlockIfPossible) {
    zone_unlock(loc);
  }

  return zone_available(loc);
}

export function zone_isAvailable$1(loc: Location): boolean {
  return zone_isAvailable(loc, true);
}

export function zone_delayable(): Map<Location, number> {
  const retval: Map<Location, number> = new Map();
  for (const loc of $locations.all()) {
    const locValue: generic_t = zone_delay(loc);
    if (locValue._boolean && zone_isAvailable$1(loc)) {
      retval.set(loc, locValue._int);
    }
  }
  return retval;
}
// generic_t is defined in autoscend_record.ash

export function zone_needItem(loc: Location): generic_t {
  // attempting to list these in descending order in relation to the quest they relate to
  // (so L13 quest stuff first then L12 then L11 and so on).
  const retval: generic_t = new generic_t();
  let value: number = 0.0;
  {
    // bonus points cap at +400% item. Equivalent to a 20% item drop
    //already in the other war outfit means only there to start the war
    //already in the other war outfit means only there to start the war
    //Only if we need stone wool manually for some reason.
    //Or via the semi-rare!		(100/50/20 for SR, 25 Sheep)

    let getMilk: boolean = false;
    let milksPerMilk: number = 0;
    let milkUsed: number = 0;
    switch (loc) {
      case $location`Hero's Field`:
        value = 20.0;
        break;
      case $location`The Hole in the Sky`:
        if (itemAmount($item`star`) < 8 || itemAmount($item`line`) < 7) {
          value = 30.0;
        }
        break;
      case $location`The Orcish Frat House`:
      case $location`The Hippy Camp`:
        value = 5.0;
        break;
      case $location`Wartime Frat House`:
        if (
          !possessOutfit$1("Frat Warrior Fatigues") &&
          !isWearingOutfit("War Hippy Fatigues")
        ) {
          value = 5.0;
        }
        break;
      case $location`Wartime Hippy Camp`:
        if (
          !possessOutfit$1("War Hippy Fatigues") &&
          !isWearingOutfit("Frat Warrior Fatigues")
        ) {
          value = 5.0;
        }
        break;
      case $location`The Battlefield (Frat Uniform)`:
      case $location`The Battlefield (Hippy Uniform)`:
        value = 5.0;
        break;
      case $location`The Hatching Chamber`:
      case $location`The Feeding Chamber`:
      case $location`The Royal Guard Chamber`:
        value = 10.0;
        break;
      case $location`The Oasis`:
        if (haveEffect($effect`Ultrahydrated`) > 0) {
          value = 30.0;
        }
        break;
      case $location`The Middle Chamber`:
        value = 20.0;
        break;
      case $location`The Haunted Library`:
        if (
          itemAmount($item`killing jar`) < 1 &&
          (toInt(getProperty("gnasirProgress")) & 4) === 0 &&
          toInt(getProperty("desertExploration")) < 100
        ) {
          value = 10.0;
        }
        break;
      case $location`The Haunted Laundry Room`:
        value = 5.0 * (1.0 + toFloat(getProperty("auto_cabinetsencountered")));
        break;
      case $location`The Haunted Wine Cellar`:
        value = 5.0 * (1.0 + toFloat(getProperty("auto_wineracksencountered")));
        break;
      case $location`The Hidden Park`:
        if (toInt(getProperty("hiddenTavernUnlock")) < myAscensions()) {
          value = 20.0;
        }
        break;
      case $location`The Hidden Bowling Alley`:
        if (
          itemAmount($item`bowling ball`) === 0 &&
          toInt(getProperty("hiddenBowlingAlleyProgress")) < 5
        ) {
          value = 40.0;
        }
        break;
      case $location`The Hidden Temple`:
        if (haveEffect($effect`Stone-Faced`) === 0) {
          value = 20.0;
        }
        break;
      case $location`The Black Forest`:
        if (!possessEquipment($item`blackberry galoshes`)) {
          value = 20.0;
        }
        break;
      case $location`Inside the Palindome`:
        if (
          itemAmount($item`stunt nuts`) === 0 &&
          itemAmount($item`wet stunt nut stew`) === 0
        ) {
          value = 30.0;
        }
        break;
      case $location`Whitey's Grove`:
        if (
          (itemAmount($item`lion oil`) === 0 ||
            itemAmount($item`bird rib`) === 0) &&
          itemAmount($item`wet stew`) === 0 &&
          itemAmount($item`wet stunt nut stew`) === 0 &&
          internalQuestStatus("questL11Palindome") < 5
        ) {
          value = 25.0;
        }
        break;
      case $location`The Copperhead Club`:
      case $location`A Mob of Zeppelin Protesters`:
        if (internalQuestStatus("questL11Ron") >= 1) {
          value = 15.0;
        }
        break;
      case $location`The Red Zeppelin`:
        value = 30.0;
        break;
      case $location`The Penultimate Fantasy Airship`:
        if (!possessEquipment($item`amulet of extreme plot significance`)) {
          value = 10.0;
        }
        if (!possessEquipment($item`Mohawk wig`)) {
          value = 10.0;
        }
        break;
      case $location`The Castle in the Clouds in the Sky (Basement)`:
        value = 40.0;
        break;
      case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
        value = 20.0;
        break;
      case $location`The Smut Orc Logging Camp`:
        if (toInt(getProperty("chasmBridgeProgress")) < bridgeGoal()) {
          value = 10.0;
        }
        break;
      case $location`A-Boo Peak`:
        if (toInt(getProperty("auto_aboopending")) === 0) {
          value = 15.0;
        }
        break;
      case $location`Twin Peak`:
        value = 15.0;
        break;
      case $location`Oil Peak`:
        if (
          (toInt(getProperty("twinPeakProgress")) & 4) === 0 &&
          itemAmount($item`bubblin' crude`) < 12 &&
          itemAmount($item`jar of oil`) < 1
        ) {
          if (monsterLevelAdjustment() > 100) {
            value = 10.0;
          } else if (monsterLevelAdjustment() > 50) {
            value = 30.0;
          } else if (monsterLevelAdjustment() > 20) {
            value = 10.0;
          }
        }
        break;
      case $location`The Valley of Rof L'm Fao`:
        if (
          itemAmount($item`lowercase N`) === 0 &&
          itemAmount($item`ND`) === 0 &&
          itemAmount($item`Wand of Nagamar`) === 0 &&
          toBoolean(getProperty("auto_wandOfNagamar"))
        ) {
          value = 30.0;
        }
      case $location`Itznotyerzitz Mine`:
        if (!possessOutfit$1("Mining Gear") && cloversAvailable$1() === 0) {
          value = 10.0;
        }
        break;
      case $location`The Goatlet`:
        getMilk =
          (haveSkill($skill`Advanced Saucecrafting`) ||
            (myClass() === $class`Sauceror` &&
              (guildAvailable() ||
                !toBoolean(getProperty("auto_skipUnlockGuild"))))) &&
          fullnessLimit() !== 0;
        milksPerMilk = myClass() === $class`Sauceror` ? 3 : 1;
        milkUsed =
          toBoolean(getProperty("_milkOfMagnesiumUsed")) ||
          fullness_left() === 0
            ? 1
            : 0;
        if (
          itemAmount($item`milk of magnesium`) +
            milksPerMilk * itemAmount($item`glass of goat's milk`) +
            milkUsed >=
          3
        ) {
          getMilk = false;
        }
        if (getMilk) {
          value = 20.0;
        } else {
          value = 40.0;
        }
        break;
      case $location`The eXtreme Slope`:
        if (!possessOutfit$1("eXtreme Cold-Weather Gear")) {
          value = 10.0;
        }
      case $location`The Defiled Nook`:
        // Handle for a gravy boat?
        if (toInt(getProperty("cyrptNookEvilness")) > 14) {
          value = 20.0;
        }
        break;
      case $location`The Dark Neck of the Woods`:
      case $location`The Dark Heart of the Woods`:
      case $location`The Dark Elbow of the Woods`:
      case $location`Pandamonium Slums`:
        if (
          LX_doingPirates() &&
          itemAmount($item`hot wing`) < 3 &&
          internalQuestStatus("questM12Pirate") <= 2
        ) {
          value = 30;
        }
        break;
      case $location`Cobb's Knob Barracks`:
        if (!haveOutfit("Knob Goblin Elite Guard Uniform")) {
          value = 10.0;
        }
        break;
      case $location`Cobb's Knob Harem`:
        if (itemAmount($item`Knob Goblin perfume`) === 0) {
          value = 25.0;
        }
        if (!possessOutfit$1("Knob Goblin Harem Girl Disguise")) {
          value = 20.0;
        }
        break;
      case $location`The Beanbat Chamber`:
        if (itemAmount($item`enchanted bean`) === 0) {
          value = 50.0;
        }
        if (internalQuestStatus("questL04Bat") < 3) {
          value = 10.0;
        }
        break;
      case $location`The Batrat and Ratbat Burrow`:
        if (internalQuestStatus("questL04Bat") < 3) {
          value = 15.0;
        }
        break;
      case $location`The Bat Hole Entrance`:
      case $location`Guano Junction`:
        if (internalQuestStatus("questL04Bat") < 3) {
          value = 10.0;
        }
        break;
      case $location`The Laugh Floor`:
        if (itemAmount($item`imp air`) < 5) {
          value = 15.0;
        }
        break;
      case $location`Infernal Rackets Backstage`:
        if (itemAmount($item`bus pass`) < 5) {
          value = 15.0;
        }
        break;
      case $location`Barrrney's Barrr`:
        if (itemAmount($item`cocktail napkin`) === 0) {
          value = 10.0;
        }
        break;
      case $location`The F'c'le`:
        if (
          itemAmount($item`ball polish`) === 0 ||
          itemAmount($item`mizzenmast mop`) === 0 ||
          itemAmount($item`rigging shampoo`) === 0
        ) {
          if (!possessEquipment($item`pirate fledges`)) {
            value = 30.0;
          }
        }
        break;
      case $location`The Obligatory Pirate's Cove`:
        if (
          !possessOutfit$1("Swashbuckling Getup") &&
          !possessEquipment($item`pirate fledges`)
        ) {
          value = 10.0;
        }
      case $location`The Old Landfill`:
        value =
          5.0 * (1.0 + toFloat(getProperty("auto_junkspritesencountered")));
        break;
      case $location`The Deep Machine Tunnels`:
        value = 30.0; //Just a guess.

        break;
      case $location`Barf Mountain`:
        retval._float = 15.0;
        break;
      case $location`The Velvet / Gold Mine`:
        if (!canYellowRay$1()) {
          //Just a guess
          retval._float = 10.0;
        }
        break;
      case $location`The Haunted Pantry`:
        break;
      case $location`The Skeleton Store`:
        break;
      case $location`The Secret Government Laboratory`:
        break;
      case $location`Waste Processing`:
        // Bugbear Invasion Locations
        if (!possessEquipment($item`bugbear communicator badge`)) {
          retval._float = 20.0;
        }
        break;
      case $location`Science Lab`:
        retval._float = 30.0;
        break;
      case $location`Engineering`:
        retval._float = 50.0;
        break;
      case $location`Fight in the Dirt`:
        // End Bugbear Invasion Locations
        // A Shrunken Adventurer Am I (Small) Locations
        value = 50.0;
        break;
      case $location`Fight in the Tall Grass`:
        value = 50.0;
        break;
      case $location`Fight in the Very Tall Grass`:
        value = 50.0;
        break;
      case $location`Shadow Rift (The Ancient Buried Pyramid)`:
      case $location`Shadow Rift (The Hidden City)`:
      case $location`Shadow Rift (The Misspelled Cemetary)`:
        // End A Shrunken Adventurer Am I (Small) Locations
        // Shadow Rifts via cursed payphone or AoSOL path
        value = 10.0;
        break;
      default:
        // End Shadow Rifts
        retval._error = true;
        break;
    }
  }

  if (
    expectGhostReport() &&
    loc === toLocation(getProperty("ghostLocation")) &&
    getProperty("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  if (value !== 0.0) {
    retval._boolean = true;
    retval._float = 10000.0 / value;

    if (in_lar()) {
      retval._float = 5000.0 / value;
    }
    retval._float -= 100.0;
  }
  return retval;
}

export function zone_needItemBooze(loc: Location): generic_t {
  // these matching a location case in zone_needItem will be called if the general item bonus could not be reached
  const retval: generic_t = new generic_t();
  let value: number = 0.0;
  switch (loc) {
    case $location`The Haunted Wine Cellar`:
      value = 5.0 * (1.0 + toFloat(getProperty("auto_wineracksencountered")));
      break;
    default:
      retval._error = true;
      break;
  }

  if (
    expectGhostReport() &&
    loc === toLocation(getProperty("ghostLocation")) &&
    getProperty("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  if (value !== 0.0) {
    retval._boolean = true;
    retval._float = 10000.0 / value;

    if (in_lar()) {
      retval._float = 5000.0 / value;
    }
    retval._float -= 100.0;
  }
  return retval;
}

export function zone_needItemFood(loc: Location): generic_t {
  // these matching a location case in zone_needItem will be called if the general item bonus could not be reached
  const retval: generic_t = new generic_t();
  let value: number = 0.0;
  {
    let getMilk: boolean = false;
    let milksPerMilk: number = 0;
    let milkUsed: number = 0;
    switch (loc) {
      case $location`The Haunted Laundry Room`:
        value = 5.0 * (1.0 + toFloat(getProperty("auto_cabinetsencountered")));
        break;
      case $location`Inside the Palindome`:
        if (
          itemAmount($item`stunt nuts`) === 0 &&
          itemAmount($item`wet stunt nut stew`) === 0
        ) {
          value = 30.0;
        }
        break;
      case $location`Whitey's Grove`:
        if (
          (itemAmount($item`lion oil`) === 0 ||
            itemAmount($item`bird rib`) === 0) &&
          itemAmount($item`wet stew`) === 0 &&
          itemAmount($item`wet stunt nut stew`) === 0 &&
          internalQuestStatus("questL11Palindome") < 5
        ) {
          value = 25.0;
        }
        break;
      case $location`The Goatlet`:
        getMilk =
          (haveSkill($skill`Advanced Saucecrafting`) ||
            (myClass() === $class`Sauceror` &&
              (guildAvailable() ||
                !toBoolean(getProperty("auto_skipUnlockGuild"))))) &&
          fullnessLimit() !== 0;
        milksPerMilk = myClass() === $class`Sauceror` ? 3 : 1;
        milkUsed =
          toBoolean(getProperty("_milkOfMagnesiumUsed")) ||
          fullness_left() === 0
            ? 1
            : 0;
        if (
          itemAmount($item`milk of magnesium`) +
            milksPerMilk * itemAmount($item`glass of goat's milk`) +
            milkUsed >=
          3
        ) {
          getMilk = false;
        }
        if (getMilk) {
          value = 20.0;
        } else {
          value = 40.0;
        }
        break;
      case $location`The Dark Neck of the Woods`:
      case $location`The Dark Heart of the Woods`:
      case $location`The Dark Elbow of the Woods`:
      case $location`Pandamonium Slums`:
        if (
          LX_doingPirates() &&
          itemAmount($item`hot wing`) < 3 &&
          internalQuestStatus("questM12Pirate") <= 2
        ) {
          value = 30;
        }
        break;
      case $location`The Haunted Pantry`:
        break;
      case $location`The Skeleton Store`:
        break;
      default:
        retval._error = true;
        break;
    }
  }

  if (
    expectGhostReport() &&
    loc === toLocation(getProperty("ghostLocation")) &&
    getProperty("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  if (value !== 0.0) {
    retval._boolean = true;
    retval._float = 10000.0 / value;

    if (in_lar()) {
      retval._float = 5000.0 / value;
    }
    retval._float -= 100.0;
  }
  return retval;
}

export function zone_combatMod(loc: Location): generic_t {
  // attempting to list these in descending order in relation to the quest they relate to
  // (so L13 quest stuff first then L12 then L11 and so on).
  const retval: generic_t = new generic_t();
  const delay: generic_t = zone_delay(loc);
  let value: number = 0;
  switch (loc) {
    case $location`The Orcish Frat House`:
    case $location`The Hippy Camp`:
      if (myLevel() >= 9) {
        value = -85;
      }
      break;
    case $location`Wartime Frat House`:
    case $location`Wartime Hippy Camp`:
      value = -80;
      break;
    case $location`Sonofa Beach`:
      //when wanderer replacing strategy is about to be used, combat modifier is useless. these are the replaced wanderers
      if (auto_voteMonster()) {
        for (const sl of $slots`acc3, acc2, acc1`) {
          if (
            getProperty(`_auto_maximize_equip_${sl.toString()}`) ===
            $item`"I Voted!" sticker`.toString()
          ) {
            value = 0;
            break;
          }
        }
      }
      if (
        auto_sausageGoblin() &&
        getProperty("_auto_maximize_equip_off-hand") ===
          $item`Kramco Sausage-o-Matic™`.toString()
      ) {
        value = 0;
        break;
      }

      //otherwise if no wanderer replace
      value = 90;
      break;
    case $location`The Upper Chamber`:
      value = -85;
      break;
    case $location`The Haunted Billiards Room`:
      value = -85;
      break;
    case $location`The Haunted Gallery`:
      if (
        delay._int === 0 ||
        !containsText(getProperty("relayCounters"), "Garden Banished")
      ) {
        value = -80;
      }
      break;
    case $location`The Haunted Bathroom`:
      if (delay._int === 0) {
        value = -90;
      }
      break;
    case $location`The Haunted Ballroom`:
      if (delay._int === 0 && loc.turnsSpent > 0) {
        value = -90;
      }
      break;
    case $location`The Hidden Park`:
      value = -85;
      break;
    case $location`The Hidden Temple`:
      if (haveEffect($effect`Stone-Faced`) === 0) {
        value = -90;
      }
      break;
    case $location`A Mob of Zeppelin Protesters`:
      if (internalQuestStatus("questL11Ron") >= 1) {
        value = -70;
      }
      break;
    case $location`The Black Forest`:
      if (internalQuestStatus("questL13Final") < 6) {
        value = 5;
      } else if (internalQuestStatus("questL13Final") === 6) {
        value = -95;
      }
      break;
    case $location`Inside the Palindome`:
      if (
        (itemAmount($item`photograph of a red nugget`) === 0 ||
          itemAmount($item`photograph of an ostrich egg`) === 0 ||
          itemAmount($item`photograph of God`) === 0) &&
        internalQuestStatus("questL11Palindome") <= 2
      ) {
        value = -70;
      } else if (
        3 <= internalQuestStatus("questL11Palindome") &&
        internalQuestStatus("questL11Palindome") <= 4
      ) {
        value = 25;
      }
      break;
    case $location`Whitey's Grove`:
      if (
        (itemAmount($item`lion oil`) === 0 ||
          itemAmount($item`bird rib`) === 0) &&
        itemAmount($item`wet stew`) === 0 &&
        itemAmount($item`wet stunt nut stew`) === 0 &&
        internalQuestStatus("questL11Palindome") < 5
      ) {
        value = 15;
      }
      break;
    case $location`The Penultimate Fantasy Airship`:
      if (
        delay._int === 0 ||
        (auto_haveBatWings() && availableAmount($item`S.O.C.K.`) === 0)
      ) {
        value = -80;
      } else if (
        in_bugbear() &&
        bugbear_BioDataRemaining($location`Engineering`) > 0
      ) {
        // When hunting bugbears, we want normal combats, not NC combats
        value = 10;
      } else {
        //Let us not worry about throttling the Airship
        //value = 20;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Basement)`:
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      value = -95;
      break;
    case $location`Twin Peak`:
      value = -85;
      break;
    case $location`The eXtreme Slope`:
      value = -95;
      break;
    case $location`Itznotyerzitz Mine`:
      if (!possessOutfit$1("Mining Gear") && cloversAvailable$1() === 0) {
        value = -90;
      }
      break;
    case $location`Lair of the Ninja Snowmen`:
      if (
        internalQuestStatus("questL08Trapper") < 3 &&
        !L8_forceExtremeInstead() &&
        itemAmount($item`ninja carabiner`) === 0
      ) {
        value = 80;
      }
      break;
    case $location`The Dark Neck of the Woods`:
    case $location`The Dark Heart of the Woods`:
    case $location`The Dark Elbow of the Woods`:
      value = -95;
      break;
    case $location`The Defiled Cranny`:
    case $location`The Defiled Alcove`:
      value = -85;
      break;
    case $location`The Typical Tavern Cellar`:
      //We could cut it off early if the Rat Faucet is the last one
      //And marginally if we know the 3rd/6th square are forced events.
      //actual desired value for combat or non combat is decided by level_03.ash based on elemental damage bonus
      break;
    case $location`The Spooky Forest`:
      if (delay._int === 0) {
        value = -85;
      }
      break;
    case $location`The Laugh Floor`:
      if (itemAmount($item`Azazel's lollipop`) < 1) {
        value = toInt(15.0);
      }
      break;
    case $location`Infernal Rackets Backstage`:
      if (itemAmount($item`Azazel's unicorn`) < 1) {
        value = -70;
      }
      break;
    case $location`Barrrney's Barrr`:
      if (numPirateInsults() >= 6) {
        value = -80;
      } else {
        value = 20;
      }
      break;
    case $location`The F'c'le`:
      if (!possessEquipment($item`pirate fledges`)) {
        value = 20;
      }
      break;
    case $location`The Poop Deck`:
      value = -80;
      break;
    case $location`The Obligatory Pirate's Cove`:
      if (!possessOutfit$1("Swashbuckling Getup")) {
        if (
          itemAmount($item`The Big Book of Pirate Insults`) > 0 &&
          numPirateInsults() < 3
        ) {
          value = 0; // fights can give both outfit pieces and insults. better not start avoiding fights until first insults learned
        } else {
          value = -60;
        }
      } else if (numPirateInsults() < 8) {
        value = 40;
      }
      break;
    case $location`The Knob Shaft`:
      value = 15;
      break;
    case $location`South of the Border`:
      value = 50;
      break;
    case $location`The Icy Peak`:
      value = 15;
      break;
    case $location`Pandamonium Slums`:
      value = 5;
      break;
    case $location`The Haunted Pantry`:
      value = 20;
      break;
    case $location`Cobb's Knob Treasury`:
      value = 15;
      break;
    case $location`The VERY Unquiet Garves`:
      if (
        itemAmount($item`Wand of Nagamar`) === 0 &&
        internalQuestStatus("questL13Final") === 12 &&
        !in_koe()
      ) {
        value = -100;
      }
      break;
    case $location`Super Villain's Lair`:
      if (
        !toBoolean(getProperty("_villainLairColorChoiceUsed")) ||
        !toBoolean(getProperty("_villainLairDoorChoiceUsed")) ||
        !toBoolean(getProperty("_villainLairSymbologyChoiceUsed"))
      ) {
        value = -70;
      }
      break;
    case $location`Through the Spacegate`:
      value = 5;
      break;
    case $location`The Ice Hotel`:
      value = -85;
      break;
    case $location`Sonar`:
      // Bugbear Invasion Locations
      value = -70;
      break;
    case $location`Morgue`:
      if (itemAmount($item`bugbear autopsy tweezers`) > 0) {
        value = -70;
      }
      break;
    default:
      // End Bugbear Invasion Locations
      retval._error = true;
      break;
  }

  if (in_lar()) {
    value = 0;
  }

  if (
    expectGhostReport() &&
    loc === toLocation(getProperty("ghostLocation")) &&
    getProperty("questPAGhost") === "started"
  ) {
    value = 0;
  }

  if (value !== 0) {
    retval._boolean = true;
    retval._int = value;
  }
  return retval;
}

export function zone_delay(loc: Location): generic_t {
  const retval: generic_t = new generic_t();
  let value: number = 0;
  const shenZones: Map<Location, number> = getShenZonesTurnsSpent();
  switch (loc) {
    case $location`The Oasis`:
      // Superlikely adventures take priority over all wanderers now.
      if (
        toInt(getProperty("desertExploration")) < 100 &&
        haveEffect($effect`Ultrahydrated`) > 0
      ) {
        value = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Upper Chamber`:
      value = 5 - loc.turnsSpent;
      break;
    case $location`The Middle Chamber`:
      value = 10 - loc.turnsSpent;
      break;
    case $location`The Haunted Gallery`:
      value = 5 - loc.turnsSpent;
      break;
    case $location`The Haunted Bathroom`:
      value = 5 - loc.turnsSpent;
      break;
    case $location`The Haunted Ballroom`:
      value = 5 - loc.turnsSpent;
      break;
    case $location`The Hidden Park`:
      if (
        !possessEquipment($item`antique machete`) &&
        !possessEquipment($item`muculent machete`) &&
        inHardcore()
      ) {
        value = 6 - loc.turnsSpent;
      }
      break;
    case $location`The Hidden Apartment Building`:
      if (internalQuestStatus("questL11Curses") < 2) {
        if (loc.turnsSpent < 9) {
          value = 8 - loc.turnsSpent;
        } else {
          value = 7 - ((loc.turnsSpent - 9) % 8);
        }
      }
      break;
    case $location`The Hidden Office Building`:
      if (internalQuestStatus("questL11Business") < 2) {
        if (loc.turnsSpent < 6) {
          value = 5 - loc.turnsSpent;
        } else {
          value = 4 - ((loc.turnsSpent - 6) % 5);
        }
      }
      break;
    case $location`The Spooky Forest`:
      value = 5 - loc.turnsSpent;
      break;
    case $location`The Boss Bat's Lair`:
      value = 4 - loc.turnsSpent;
      break;
    case $location`The Outskirts of Cobb's Knob`:
      if (internalQuestStatus("questL05Goblin") < 1) {
        value = 10 - loc.turnsSpent;
      } else {
        retval._error = true;
      }
      break;
    case $location`The Penultimate Fantasy Airship`:
      if (getProperty("questL10Garbage") === "step2") {
        value = 5 - loc.turnsSpent;
      } else if (getProperty("questL10Garbage") === "step3") {
        value = 10 - loc.turnsSpent;
      } else if (getProperty("questL10Garbage") === "step4") {
        value = 15 - loc.turnsSpent;
      } else if (getProperty("questL10Garbage") === "step5") {
        value = 20 - loc.turnsSpent;
      } else if (getProperty("questL10Garbage") === "step6") {
        value = 25 - loc.turnsSpent;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
      value = 10 - loc.turnsSpent;
      break;
    case $location`The Haunted Pantry`:
      if (
        isGuildClass() &&
        myPrimestat() === $stat`Mysticality` &&
        !toBoolean(getProperty("auto_skipUnlockGuild"))
      ) {
        value = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Sleazy Back Alley`:
      if (
        isGuildClass() &&
        myPrimestat() === $stat`Moxie` &&
        !toBoolean(getProperty("auto_skipUnlockGuild"))
      ) {
        value = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Smut Orc Logging Camp`:
      if (
        shenZones.has(loc) &&
        toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal()
      ) {
        value =
          3 -
          (loc.turnsSpent -
            (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
      }
      break;
    case $location`The Hole in the Sky`:
      if (shenZones.has(loc) && !needStarKey()) {
        value =
          3 -
          (loc.turnsSpent -
            (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
      }
      break;
    case $location`The Unquiet Garves`:
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
    case $location`Lair of the Ninja Snowmen`:
    case $location`The Batrat and Ratbat Burrow`:
      if (shenZones.has(loc)) {
        value =
          3 -
          (loc.turnsSpent -
            (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
      }
      break;
    case $location`The Copperhead Club`:
      if (
        internalQuestStatus("questL11Shen") > 0 &&
        internalQuestStatus("questL11Shen") < 8
      ) {
        value = 5 - (loc.turnsSpent - toInt(getProperty("auto_lastShenTurn")));
      }
      break;
    case $location`The Hallowed Halls`:
    case $location`Art Class`:
    case $location`Chemistry Class`:
    case $location`Shop Class`:
      if (kolhs_mandatorySchool()) {
        //KOLHS path specific delay locations
        value = 40 - toInt(getProperty("_kolhsAdventures")); //shared counter of 40 adv between all 4 zones
      }
      break;
    case $location`Vanya's Castle`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        (getProperty("8BitColor") === "black" ||
          getProperty("8BitColor") === "")
      ) {
        value = 5 - toInt(getProperty("8BitBonusTurns"));
      }
      break;
    case $location`The Fungus Plains`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        getProperty("8BitColor") === "red"
      ) {
        value = 5 - toInt(getProperty("8BitBonusTurns"));
      }
      break;
    case $location`Megalo-City`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        getProperty("8BitColor") === "blue"
      ) {
        value = 5 - toInt(getProperty("8BitBonusTurns"));
      }
      break;
    case $location`Hero's Field`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        getProperty("8BitColor") === "green"
      ) {
        value = 5 - toInt(getProperty("8BitBonusTurns"));
      }
      break;
    default:
      retval._error = true;
      break;
  }

  if (value > 0) {
    retval._boolean = true;
    retval._int = value;
  }
  return retval;
}

export function zone_available(loc: Location): boolean {
  let retval: boolean = false;

  if (kolhs_mandatorySchool()) {
    //kolhs path specifically blocks non school zones until school is done.
    if (
      $locations`The Hallowed Halls, Art Class, Chemistry Class, Shop Class`.includes(
        loc,
      )
    ) {
      retval = true;
    }
    return retval;
  }

  switch (loc) {
    case $location`The Copperhead Club`:
    case $location`A Mob of Zeppelin Protesters`:
      if (internalQuestStatus("questL11Shen") >= 0) {
        retval = true;
      }
      break;
    case $location`The Red Zeppelin`:
      if (internalQuestStatus("questL11Ron") >= 2) {
        retval = true;
      }
      break;
    case $location`Super Villain's Lair`:
      if (
        in_lta() &&
        toInt(getProperty("_villainLairProgress")) < 999 &&
        getProperty("_auto_bondBriefing") === "started"
      ) {
        retval = true;
      }
      break;
    case $location`South of the Border`:
    case $location`The Shore, Inc. Travel Agency`:
      if (isDesertAvailable()) {
        retval = true;
      }
      break;
    case $location`The Arid, Extra-Dry Desert`:
      if (internalQuestStatus("questL11Desert") >= 0) {
        retval = true;
      }
      break;
    case $location`The Oasis`:
      if ($location`The Arid, Extra-Dry Desert`.turnsSpent > 0) {
        retval = true;
      }
      break;
    case $location`The Upper Chamber`:
      if (internalQuestStatus("questL11Pyramid") >= 0) {
        retval = true;
      }
      break;
    case $location`The Middle Chamber`:
      retval = toBoolean(getProperty("middleChamberUnlock"));
      break;
    case $location`The Lower Chambers`:
      retval = toBoolean(getProperty("lowerChamberUnlock"));
      break;
    case $location`The Daily Dungeon`:
      retval = !toBoolean(getProperty("dailyDungeonDone"));
      break;
    case $location`The Overgrown Lot`:
      if (internalQuestStatus("questM24Doc") >= 0) {
        retval = true;
      }
      break;
    case $location`The Skeleton Store`:
      if (internalQuestStatus("questM23Meatsmith") >= 0) {
        retval = true;
      }
      break;
    case $location`Madness Bakery`: //can also be unlocked via hypnotic breadcrumbs. which matter in koe and nuclear autumn. but currently not tracked
      if (internalQuestStatus("questM25Armorer") >= 0) {
        retval = true;
      }
      break;
    case $location`The Deep Machine Tunnels`:
      if (
        haveFamiliar($familiar`Machine Elf`) ||
        haveEffect($effect`Inside The Snowglobe`) > 0
      ) {
        retval = true;
      }
      break;
    case $location`The Haunted Pantry`:
    case $location`The Haunted Kitchen`:
    case $location`The Haunted Conservatory`:
      if (internalQuestStatus("questM20Necklace") >= 0) {
        retval = true;
      }
      break;
    case $location`The Haunted Gallery`:
    case $location`The Haunted Bathroom`:
    case $location`The Haunted Bedroom`:
      if (internalQuestStatus("questM21Dance") >= 1) {
        retval = true;
      }
      break;
    case $location`The Haunted Billiards Room`:
      if (itemAmount($item`Spookyraven billiards room key`) > 0) {
        retval = true;
      }
      break;
    case $location`The Haunted Library`:
      if (itemAmount($item`[7302]Spookyraven library key`) > 0) {
        retval = true;
      }
      break;
    case $location`The Haunted Ballroom`:
      if (internalQuestStatus("questM21Dance") >= 3) {
        retval = true;
      }
      break;
    case $location`The Haunted Boiler Room`:
    case $location`The Haunted Laundry Room`:
    case $location`The Haunted Wine Cellar`:
      if (internalQuestStatus("questL11Manor") >= 1) {
        retval = true;
      }
      break;
    case $location`Summoning Chamber`:
      if (internalQuestStatus("questL11Manor") >= 11) {
        retval = true;
      }
      break;
    case $location`The Hidden Park`:
    case $location`An Overgrown Shrine (Northwest)`:
    case $location`An Overgrown Shrine (Southwest)`:
    case $location`An Overgrown Shrine (Northeast)`:
    case $location`An Overgrown Shrine (Southeast)`:
    case $location`A Massive Ziggurat`:
      if (internalQuestStatus("questL11Worship") >= 3) {
        retval = true;
      }
      break;
    case $location`The Hidden Apartment Building`:
      if (internalQuestStatus("questL11Curses") >= 0) {
        retval = true;
      }
      break;
    case $location`The Hidden Hospital`:
      if (internalQuestStatus("questL11Doctor") >= 0) {
        retval = true;
      }
      break;
    case $location`The Hidden Office Building`:
      if (internalQuestStatus("questL11Business") >= 0) {
        retval = true;
      }
      break;
    case $location`The Hidden Bowling Alley`:
      if (internalQuestStatus("questL11Spare") >= 0) {
        retval = true;
      }
      break;
    case $location`The Typical Tavern Cellar`:
      if (internalQuestStatus("questL03Rat") >= 0) {
        retval = true;
      }
      break;
    case $location`The Spooky Forest`:
      if (
        internalQuestStatus("questL02Larva") >= 0 ||
        internalQuestStatus("questG02Whitecastle") >= 0
      ) {
        retval = true;
      }
      break;
    case $location`The Hidden Temple`:
      if (toInt(getProperty("lastTempleUnlock")) === myAscensions()) {
        retval = true;
      }
      break;
    case $location`Vanya's Castle`:
    case $location`The Fungus Plains`:
    case $location`Megalo-City`:
    case $location`Hero's Field`:
      if (
        possessEquipment($item`continuum transfunctioner`) &&
        (internalQuestStatus("questL02Larva") >= 0 ||
          internalQuestStatus("questG02Whitecastle") >= 0)
      ) {
        retval = true;
      }
      break;
    case $location`The Black Forest`:
      if (internalQuestStatus("questL11MacGuffin") >= 0) {
        retval = true;
      }
      break;
    case $location`The Bat Hole Entrance`:
      if (internalQuestStatus("questL04Bat") >= 0) {
        retval = true;
      }
      break;
    case $location`Guano Junction`:
      if (
        elemental_resist($element`stench`) >= 1 &&
        internalQuestStatus("questL04Bat") >= 0
      ) {
        retval = true;
      }
      break;
    case $location`The Batrat and Ratbat Burrow`:
      if (internalQuestStatus("questL04Bat") >= 1) {
        retval = true;
      }
      break;
    case $location`The Beanbat Chamber`:
      if (internalQuestStatus("questL04Bat") >= 2) {
        retval = true;
      }
      break;
    case $location`The Boss Bat's Lair`:
      if (internalQuestStatus("questL04Bat") === 3) {
        retval = true;
      }
      break;
    case $location`The VERY Unquiet Garves`:
      if (getProperty("questL07Cyrptic") === "finished") {
        retval = true;
      }
      break;
    case $location`Whitey's Grove`:
      if (
        internalQuestStatus("questG02Whitecastle") >= 0 ||
        internalQuestStatus("questL11Palindome") >= 3
      ) {
        retval = true;
      }
      break;
    case $location`Inside the Palindome`:
      if (possessEquipment($item`Talisman o' Namsilat`)) {
        retval = true;
      }
      break;
    case $location`Noob Cave`:
    case $location`The Outskirts of Cobb's Knob`:
      retval = true;
      break;
    case $location`Cobb's Knob Barracks`:
    case $location`Cobb's Knob Kitchens`:
    case $location`Cobb's Knob Harem`:
    case $location`Cobb's Knob Treasury`:
    case $location`Throne Room`:
      if (internalQuestStatus("questL05Goblin") >= 1) {
        retval = true;
      }
      break;
    case $location`The Dark Neck of the Woods`:
    case $location`The Dark Heart of the Woods`:
    case $location`The Dark Elbow of the Woods`:
      if (
        internalQuestStatus("questL06Friar") >= 0 &&
        getProperty("questL06Friar") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Defiled Nook`:
    case $location`The Defiled Cranny`:
    case $location`The Defiled Alcove`:
    case $location`The Defiled Niche`:
      if (internalQuestStatus("questL07Cyrptic") >= 0) {
        retval = true;
      }
      break;
    case $location`Pandamonium Slums`:
    case $location`The Laugh Floor`:
    case $location`Infernal Rackets Backstage`:
      if (internalQuestStatus("questL06Friar") >= 10) {
        retval = true;
      }
      break;
    case $location`The Obligatory Pirate's Cove`:
      if (toInt(getProperty("lastIslandUnlock")) === myAscensions()) {
        if (
          getProperty("questL12War") === "unstarted" ||
          getProperty("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`Barrrney's Barrr`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        toInt(getProperty("lastIslandUnlock")) === myAscensions()
      ) {
        if (
          getProperty("questL12War") === "unstarted" ||
          getProperty("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`The F'c'le`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        toInt(getProperty("lastIslandUnlock")) === myAscensions() &&
        internalQuestStatus("questM12Pirate") >= 5
      ) {
        if (
          getProperty("questL12War") === "unstarted" ||
          getProperty("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`The Poop Deck`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        toInt(getProperty("lastIslandUnlock")) === myAscensions() &&
        internalQuestStatus("questM12Pirate") >= 6
      ) {
        if (
          getProperty("questL12War") === "unstarted" ||
          getProperty("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`Belowdecks`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        toInt(getProperty("lastIslandUnlock")) === myAscensions() &&
        getProperty("questM12Pirate") === "finished"
      ) {
        if (
          getProperty("questL12War") === "unstarted" ||
          getProperty("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`The Smut Orc Logging Camp`:
      if (internalQuestStatus("questL09Topping") >= 0) {
        retval = true;
      }
      break;
    case $location`A-Boo Peak`:
    case $location`Twin Peak`:
    case $location`Oil Peak`:
      if (internalQuestStatus("questL09Topping") >= 1) {
        retval = true;
      }
      break;
    case $location`The Orcish Frat House`:
    case $location`The Hippy Camp`:
      if (toInt(getProperty("lastIslandUnlock")) === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Orcish Frat House (In Disguise)`:
      if (
        toInt(getProperty("lastIslandUnlock")) === myAscensions() &&
        haveOutfit("Frat Boy Ensemble") &&
        internalQuestStatus("questL12War") !== 0 &&
        internalQuestStatus(
          //mafia always calls location Wartime with L12 quest
          "questL12War",
        ) !== 1
      ) {
        //mafia always calls location Wartime with L12 quest
        retval = true;
      }
      break;
    case $location`The Hippy Camp (In Disguise)`:
      if (
        toInt(getProperty("lastIslandUnlock")) === myAscensions() &&
        haveOutfit("Filthy Hippy Disguise") &&
        internalQuestStatus("questL12War") !== 0 &&
        internalQuestStatus(
          //mafia always calls location Wartime with L12 quest
          "questL12War",
        ) !== 1
      ) {
        //mafia always calls location Wartime with L12 quest
        retval = true;
      }
      break;
    case $location`Wartime Hippy Camp (Frat Disguise)`:
      if (
        internalQuestStatus("questL12War") === 0 &&
        (haveOutfit("frat warrior fatigues") || haveOutfit("frat boy ensemble"))
      ) {
        retval = true;
      }
      break;
    case $location`The Battlefield (Frat Uniform)`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        toInt(getProperty("hippiesDefeated")) < 1000 &&
        haveOutfit("frat warrior fatigues") &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`Wartime Frat House (Hippy Disguise)`:
      if (
        internalQuestStatus("questL12War") === 0 &&
        (haveOutfit("war hippy fatigues") ||
          haveOutfit("filthy hippy disguise"))
      ) {
        retval = true;
      }
      break;
    case $location`The Battlefield (Hippy Uniform)`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        toInt(getProperty("fratboysDefeated")) < 1000 &&
        haveOutfit("war hippy fatigues") &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`Next to that Barrel with Something Burning in it`:
    case $location`Near an Abandoned Refrigerator`:
    case $location`Over Where the Old Tires Are`:
    case $location`Out by that Rusted-Out Car`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        (getProperty("sidequestJunkyardCompleted") === "none" ||
          toInt(getProperty("flyeredML")) < 10000) &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`Sonofa Beach`:
      if (internalQuestStatus("questL12War") >= 1) {
        retval = true;
      }
      break;
    case $location`The Themthar Hills`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        getProperty("sidequestNunsCompleted") === "none" &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Hatching Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        getProperty("sidequestOrchardCompleted") === "none" &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Feeding Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        getProperty("sidequestOrchardCompleted") === "none" &&
        haveEffect($effect`Filthworm Larva Stench`) > 0 &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Royal Guard Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        getProperty("sidequestOrchardCompleted") === "none" &&
        haveEffect($effect`Filthworm Drone Stench`) > 0 &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Filthworm Queen's Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        getProperty("sidequestOrchardCompleted") === "none" &&
        itemAmount($item`heart of the filthworm queen`) === 0 &&
        haveEffect($effect`Filthworm Guard Stench`) > 0 &&
        getProperty("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`Itznotyerzitz Mine`:
    case $location`The Goatlet`:
      if (internalQuestStatus("questL08Trapper") >= 1) {
        retval = true;
      }
      break;
    case $location`The eXtreme Slope`:
    case $location`Lair of the Ninja Snowmen`:
      if (internalQuestStatus("questL08Trapper") >= 2) {
        retval = true;
      }
      break;
    case $location`Mist-Shrouded Peak`:
      if (internalQuestStatus("questL08Trapper") >= 3) {
        retval = true;
      }
      break;
    case $location`The Icy Peak`:
      if (internalQuestStatus("questL08Trapper") >= 6) {
        retval = true;
      }
      break;
    case $location`The Penultimate Fantasy Airship`:
      if (internalQuestStatus("questL10Garbage") >= 1) {
        retval = true;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Basement)`:
      if (itemAmount($item`S.O.C.K.`) > 0) {
        retval = true;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
      if (toInt(getProperty("lastCastleGroundUnlock")) === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      if (toInt(getProperty("lastCastleTopUnlock")) === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Hole in the Sky`:
      if (itemAmount($item`steam-powered model rocketship`) > 0 || in_koe()) {
        retval = true;
      }
      break;
    case $location`The Tunnel of L.O.V.E.`:
      if (
        toBoolean(getProperty("loveTunnelAvailable")) &&
        !toBoolean(getProperty("_loveTunnelUsed"))
      ) {
        retval = true;
      }
      break;
    case $location`Fastest Adventurer Contest`:
      if (toInt(getProperty("nsContestants1")) > 0) {
        retval = true;
      }
      break;
    case $location`The Enormous Greater-Than Sign`:
      if (toInt(getProperty("lastPlusSignUnlock")) < myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Dungeons of Doom`:
      if (toInt(getProperty("lastPlusSignUnlock")) === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Limerick Dungeon`:
    case $location`The Sleazy Back Alley`:
    case $location`The Haiku Dungeon`:
      retval = true;
      break;
    case $location`Smartest Adventurer Contest`:
    case $location`Strongest Adventurer Contest`:
    case $location`Smoothest Adventurer Contest`:
      if (toInt(getProperty("nsContestants2")) > 0) {
        retval = true;
      }
      break;
    case $location`Coldest Adventurer Contest`:
    case $location`Hottest Adventurer Contest`:
    case $location`Sleaziest Adventurer Contest`:
    case $location`Spookiest Adventurer Contest`:
    case $location`Stinkiest Adventurer Contest`:
      if (toInt(getProperty("nsContestants3")) > 0) {
        retval = true;
      }
      break;
    case $location`Tower Level 1`:
      if (getProperty("questL13Final") === "step6") {
        retval = true;
      }
      break;
    case $location`Tower Level 2`:
      if (getProperty("questL13Final") === "step7") {
        retval = true;
      }
      break;
    case $location`Tower Level 3`:
      if (getProperty("questL13Final") === "step8") {
        retval = true;
      }
      break;
    case $location`Tower Level 4`:
      if (getProperty("questL13Final") === "step9") {
        retval = true;
      }
      break;
    case $location`Tower Level 5`:
      if (getProperty("questL13Final") === "step10") {
        retval = true;
      }
      break;
    case $location`The Naughty Sorceress' Chamber`:
      if (getProperty("questL13Final") === "step11") {
        retval = true;
      }
      break;
    case $location`Barf Mountain`:
    case $location`Pirates of the Garbage Barges`:
    case $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`:
    case $location`The Toxic Teacups`:
      retval =
        toBoolean(getProperty("stenchAirportAlways")) ||
        toBoolean(getProperty("_stenchAirportToday"));
      break;
    case $location`The Fun-Guy Mansion`:
    case $location`The Sunken Party Yacht`:
    case $location`Sloppy Seconds Diner`:
      retval =
        toBoolean(getProperty("sleazeAirportAlways")) ||
        toBoolean(getProperty("_sleazeAirportToday"));
      break;
    case $location`The Secret Government Laboratory`:
    case $location`The Deep Dark Jungle`:
    case $location`The Mansion of Dr. Weirdeaux`:
      retval =
        toBoolean(getProperty("spookyAirportAlways")) ||
        toBoolean(getProperty("_spookyAirportToday"));
      break;
    case $location`The Ice Hotel`:
    case $location`VYKEA`:
    case $location`The Ice Hole`:
      retval =
        toBoolean(getProperty("coldAirportAlways")) ||
        toBoolean(getProperty("_coldAirportToday"));
      break;
    case $location`The SMOOCH Army HQ`:
    case $location`LavaCo™ Lamp Factory`:
    case $location`The Velvet / Gold Mine`:
    case $location`The Bubblin' Caldera`:
      retval =
        toBoolean(getProperty("hotAirportAlways")) ||
        toBoolean(getProperty("_hotAirportToday"));
      break;
    case $location`The X-32-F Combat Training Snowman`:
      retval = toBoolean(getProperty("snojoAvailable"));
      break;
    case $location`Through the Spacegate`:
      retval =
        toBoolean(getProperty("spacegateAlways")) ||
        toBoolean(getProperty("_spacegateToday"));
      break;
    case $location`The Old Landfill`:
      if (internalQuestStatus("questM19Hippy") >= 0) {
        retval = true;
      }
      break;
    case $location`Cobb's Knob Laboratory`:
    case $location`The Knob Shaft`:
      if (itemAmount($item`Cobb's Knob lab key`) > 0) {
        retval = true;
      }
      break;
    case $location`Cobb's Knob Menagerie, Level 1`:
    case $location`Cobb's Knob Menagerie, Level 2`:
    case $location`Cobb's Knob Menagerie, Level 3`:
      if (itemAmount($item`Cobb's Knob Menagerie key`) > 0) {
        retval = true;
      }
      break;
    case $location`The Red Queen's Garden`:
      if (haveEffect($effect`Down the Rabbit Hole`) > 0) {
        retval = true;
      }
      break;
    case $location`The Bugbear Pen`:
      if (internalQuestStatus("questM03Bugbear") >= 0) {
        retval = true;
      }
      break;
    case $location`The Spooky Gravy Burrow`:
      //May need to be corrected
      if (internalQuestStatus("questM03Bugbear") >= 99) {
        retval = true;
      }
      break;
    case $location`Investigating a Plaintive Telegram`:
      if (
        itemAmount($item`plaintive telegram`) > 0 &&
        internalQuestStatus("questLTTQuestByWire") >= 0
      ) {
        retval = true;
      }
      break;
    case $location`Drunken Stupor`:
      if (inebriety_left() < 0) {
        retval = true;
      }
      break;
    case $location`Thugnderdome`:
      if (isDesertAvailable()) {
        retval = gnomadsAvailable();
      }
      break;
    case $location`Camp Logging Camp`:
      // We go here to get the Logging Hatchet
      if (!in_koe() && canadiaAvailable()) {
        retval = true;
      }
      break;
    case $location`The Thinknerd Warehouse`:
      if (internalQuestStatus("questM22Shirt") >= 0) {
        retval = true;
      }
      break;
    case $location`Gingerbread Upscale Retail District`:
      if (toBoolean(getProperty("gingerRetailUnlocked"))) {
        retval =
          toBoolean(getProperty("gingerbreadCityAvailable")) ||
          toBoolean(getProperty("_gingerbreadCityToday"));
      }
      break;
    case $location`Gingerbread Sewers`:
      if (toBoolean(getProperty("gingerSewersUnlocked"))) {
        retval =
          toBoolean(getProperty("gingerbreadCityAvailable")) ||
          toBoolean(getProperty("_gingerbreadCityToday"));
      }
      break;
    case $location`Gingerbread Civic Center`:
    case $location`Gingerbread Industrial Zone`:
    case $location`Gingerbread Train Station`:
      retval =
        toBoolean(getProperty("gingerbreadCityAvailable")) ||
        toBoolean(getProperty("_gingerbreadCityToday"));
      break;
    case $location`The Bandit Crossroads`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Towering Mountains`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Mystic Wood`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Putrid Swamp`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Cursed Village`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Sprawling Cemetery`:
      retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
      break;
    case $location`Monorail Work Site`:
      retval = false;
      break;
    case $location`Your Mushroom Garden`:
      retval = auto_canFightPiranhaPlant() || auto_canTendMushroomGarden();
      break;
  }
  // compare our result with Mafia's native function, log a warning if theres a difference. Ideally we can see if there are any differences between our code and Mafia's, and if not remove all of ours in favor of Mafia's
  const canAdvRetval: boolean = canAdventure(loc);
  if (canAdvRetval !== retval) {
    auto_log_debug$1(
      `Uh oh, autoscend and mafia's can_adventure() dont agree on whether we can adventure at ${loc} (autoscend: ${retval}, can_adventure(): ${canAdvRetval}). Will assume location available if either is true.`,
    );
    retval = retval || canAdvRetval;
  }

  return retval;
}

function zone_difficulty(loc: Location): generic_t {
  const retval: generic_t = new generic_t();
  //Should we handle when we are expecting a wanderer?

  retval._int = 0;
  retval._monster = Monster.none;

  const mobs: Map<Monster, boolean> = new Map(
    Object.entries(getLocationMonsters(loc)).map(([_k, _v]) => [
      Monster.get(_k),
      _v,
    ]),
  );
  if (mobs.size > 0) {
    for (const mon of mobs.keys()) {
      retval._int = mon.baseDefense;
      retval._monster = mon;
      break;
    }
  }

  switch (loc) {
    case $location`The Shore, Inc. Travel Agency`:
      retval._int = 0;
      break;
    case $location`Super Villain's Lair`:
      break;
    case $location`South of the Border`:
      break;
    case $location`The Arid, Extra-Dry Desert`:
      break;
    case $location`The Oasis`:
      if (haveEffect($effect`Ultrahydrated`) === 0) {
        retval._int = 0;
      }
      break;
    case $location`The Upper Chamber`:
      break;
    case $location`The Middle Chamber`:
      break;
    case $location`The Lower Chambers`:
      break;
    case $location`The Daily Dungeon`:
      break;
    case $location`The Overgrown Lot`:
      break;
    case $location`The Skeleton Store`:
      break;
    case $location`Madness Bakery`:
      break;
    case $location`The Deep Machine Tunnels`:
      break;
    case $location`The Haunted Pantry`:
      break;
    case $location`The Haunted Kitchen`:
      break;
    case $location`The Haunted Conservatory`:
      break;
    case $location`The Haunted Gallery`:
    case $location`The Haunted Bathroom`:
    case $location`The Haunted Bedroom`:
      break;
    case $location`The Haunted Billiards Room`:
      break;
    case $location`The Haunted Library`:
      break;
    case $location`The Haunted Ballroom`:
      break;
    case $location`The Haunted Boiler Room`:
    case $location`The Haunted Laundry Room`:
    case $location`The Haunted Wine Cellar`:
      break;
    case $location`Summoning Chamber`:
      break;
    case $location`The Hidden Park`:
      break;
    case $location`An Overgrown Shrine (Northwest)`:
    case $location`An Overgrown Shrine (Southwest)`:
    case $location`An Overgrown Shrine (Northeast)`:
    case $location`An Overgrown Shrine (Southeast)`:
      if (
        $items`antique machete, muculent machete`.includes(
          equippedItem($slot`weapon`),
        )
      ) {
        retval._int = 0;
      }
      break;
    case $location`A Massive Ziggurat`:
      break;
    case $location`The Hidden Apartment Building`:
      break;
    case $location`The Hidden Hospital`:
      break;
    case $location`The Hidden Office Building`:
      break;
    case $location`The Hidden Bowling Alley`:
      break;
    case $location`The Typical Tavern Cellar`:
      break;
    case $location`The Spooky Forest`:
      break;
    case $location`The Hidden Temple`:
      break;
    case $location`The Black Forest`:
      break;
    case $location`The Bat Hole Entrance`:
      break;
    case $location`Guano Junction`:
      break;
    case $location`The Batrat and Ratbat Burrow`:
      break;
    case $location`The Beanbat Chamber`:
      break;
    case $location`The Boss Bat's Lair`:
      break;
    case $location`The VERY Unquiet Garves`:
      break;
    case $location`Whitey's Grove`:
      break;
    case $location`Inside the Palindome`:
      break;
    case $location`Noob Cave`:
    case $location`The Outskirts of Cobb's Knob`:
      retval._boolean = true;
      break;
    case $location`Cobb's Knob Barracks`:
    case $location`Cobb's Knob Kitchens`:
    case $location`Cobb's Knob Harem`:
    case $location`Cobb's Knob Treasury`:
    case $location`Throne Room`:
      break;
    case $location`The Dark Neck of the Woods`:
    case $location`The Dark Heart of the Woods`:
    case $location`The Dark Elbow of the Woods`:
      break;
    case $location`The Defiled Nook`:
    case $location`The Defiled Cranny`:
    case $location`The Defiled Alcove`:
    case $location`The Defiled Niche`:
      break;
    case $location`Pandamonium Slums`:
    case $location`The Laugh Floor`:
    case $location`Infernal Rackets Backstage`:
      break;
    case $location`The Obligatory Pirate's Cove`:
      break;
    case $location`Barrrney's Barrr`:
      break;
    case $location`The F'c'le`:
      break;
    case $location`The Poop Deck`:
      break;
    case $location`Belowdecks`:
      break;
    case $location`The Smut Orc Logging Camp`:
      break;
    case $location`A-Boo Peak`:
    case $location`Twin Peak`:
    case $location`Oil Peak`:
      break;
    case $location`Wartime Hippy Camp (Frat Disguise)`:
      break;
    case $location`The Battlefield (Frat Uniform)`:
      break;
    case $location`Next to that Barrel with Something Burning in it`:
    case $location`Near an Abandoned Refrigerator`:
    case $location`Over Where the Old Tires Are`:
    case $location`Out by that Rusted-Out Car`:
      break;
    case $location`Sonofa Beach`:
      break;
    case $location`The Themthar Hills`:
      break;
    case $location`The Hatching Chamber`:
      break;
    case $location`The Feeding Chamber`:
      break;
    case $location`The Royal Guard Chamber`:
      break;
    case $location`The Filthworm Queen's Chamber`:
      break;
    case $location`Itznotyerzitz Mine`:
    case $location`The Goatlet`:
      break;
    case $location`The eXtreme Slope`:
    case $location`Lair of the Ninja Snowmen`:
      break;
    case $location`Mist-Shrouded Peak`:
      break;
    case $location`The Icy Peak`:
      break;
    case $location`The Penultimate Fantasy Airship`:
      break;
    case $location`The Castle in the Clouds in the Sky (Basement)`:
      break;
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
      break;
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      break;
    case $location`The Hole in the Sky`:
      break;
    case $location`Fastest Adventurer Contest`:
      break;
    case $location`The Enormous Greater-Than Sign`:
      break;
    case $location`The Dungeons of Doom`:
      break;
    case $location`The Limerick Dungeon`:
    case $location`The Sleazy Back Alley`:
    case $location`The Haiku Dungeon`:
      break;
    case $location`Smartest Adventurer Contest`:
    case $location`Strongest Adventurer Contest`:
    case $location`Smoothest Adventurer Contest`:
      break;
    case $location`Coldest Adventurer Contest`:
    case $location`Hottest Adventurer Contest`:
    case $location`Sleaziest Adventurer Contest`:
    case $location`Spookiest Adventurer Contest`:
    case $location`Stinkiest Adventurer Contest`:
      break;
    case $location`Barf Mountain`:
    case $location`Pirates of the Garbage Barges`:
    case $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`:
    case $location`The Toxic Teacups`:
      break;
    case $location`The Fun-Guy Mansion`:
    case $location`The Sunken Party Yacht`:
    case $location`Sloppy Seconds Diner`:
      break;
    case $location`The Secret Government Laboratory`:
    case $location`The Deep Dark Jungle`:
    case $location`The Mansion of Dr. Weirdeaux`:
      break;
    case $location`The Ice Hotel`:
    case $location`VYKEA`:
    case $location`The Ice Hole`:
      break;
    case $location`The SMOOCH Army HQ`:
    case $location`LavaCo™ Lamp Factory`:
    case $location`The Velvet / Gold Mine`:
    case $location`The Bubblin' Caldera`:
      break;
    case $location`The X-32-F Combat Training Snowman`:
      break;
    case $location`Through the Spacegate`:
      break;
    case $location`The Old Landfill`:
      break;
    case $location`The Red Queen's Garden`:
      break;
    case $location`The Bugbear Pen`:
      break;
    case $location`The Spooky Gravy Burrow`:
      break;
    case $location`Investigating a Plaintive Telegram`:
      break;
    case $location`Drunken Stupor`:
      retval._int = 0;
      break;
    case $location`Thugnderdome`:
      break;
    case $location`The Thinknerd Warehouse`:
      break;
    case $location`Gingerbread Upscale Retail District`:
      break;
    case $location`Gingerbread Sewers`:
      break;
    case $location`Gingerbread Civic Center`:
    case $location`Gingerbread Industrial Zone`:
    case $location`Gingerbread Train Station`:
      break;
    case $location`Monorail Work Site`:
      break;
    case $location`A Maze of Sewer Tunnels`:
      break;
  }
  //	This is just to do a mass test.
  //	default:
  //		abort("Can't find " + loc);
  //		break;

  return retval;
}

export function zone_hasLuckyAdventure(loc: Location): boolean {
  if (
    $locations`Vanya's Castle, The Fungus Plains, Megalo-City, Hero's Field, A Maze of Sewer Tunnels, A Mob of Zeppelin Protesters, A-Boo Peak, An Octopus's Garden, Art Class, Cola Wars Battlefield (Cloaca Uniform), Cola Wars Battlefield (Dyspepsi Uniform), The Cola Wars Battlefield, Burnbarrel Blvd., Camp Logging Camp, Chemistry Class, Cobb's Knob Barracks, Cobb's Knob Harem, Cobb's Knob Kitchens, Cobb's Knob Laboratory, Cobb's Knob Menagerie\, Level 2, Cobb's Knob Treasury, Elf Alley, Exposure Esplanade, The Orcish Frat House, The Orcish Frat House (In Disguise), Guano Junction, The Hippy Camp, The Hippy Camp (In Disguise), Itznotyerzitz Mine, Lair of the Ninja Snowmen, Lemon Party, Madness Reef, Oil Peak, Outskirts of Camp Logging Camp, Pandamonium Slums, Shop Class, South of the Border, The "Fun" House, The Ancient Hobo Burial Ground, The Batrat and Ratbat Burrow, The Black Forest, The Brinier Deepers, The Briny Deeps, The Bugbear Pen, The Castle in the Clouds in the Sky (Basement), The Castle in the Clouds in the Sky (Ground Floor), The Castle in the Clouds in the Sky (Top Floor), The Copperhead Club, The Dark Elbow of the Woods, The Dark Heart of the Woods, The Dark Neck of the Woods, The Dive Bar, The Goatlet, The Hallowed Halls, The Haunted Ballroom, The Haunted Billiards Room, The Haunted Boiler Room, The Haunted Conservatory, The Haunted Gallery, The Haunted Kitchen, The Haunted Library, The Haunted Pantry, The Haunted Storage Room, The Heap, The Hidden Park, The Hidden Temple, The Icy Peak, The Knob Shaft, The Limerick Dungeon, The Mer-Kin Outpost, The Oasis, The Obligatory Pirate's Cove, The Outskirts of Cobb's Knob, The Poker Room, The Primordial Soup, The Purple Light District, The Red Zeppelin, The Roulette Tables, The Sleazy Back Alley, The Smut Orc Logging Camp, The Spectral Pickle Factory, The Spooky Forest, The Spooky Gravy Burrow, The Unquiet Garves, The VERY Unquiet Garves, The Valley of Rof L'm Fao, The Wreck of the Edgar Fitzsimmons, Thugnderdome, Tower Ruins, Twin Peak, Vanya's Castle Chapel, Whitey's Grove, Ye Olde Medievale Villagee`.includes(
      loc,
    )
  ) {
    return true;
  }
  return false;
}

function zones_available(): Map<number, Location> {
  const retval: Map<number, Location> = new Map();
  for (const loc of $locations.all()) {
    if (zone_isAvailable(loc, false)) {
      retval.set(retval.size, loc);
    }
  }
  return retval;
}

function mobs_available(): Map<number, Monster> {
  const list: Map<Monster, boolean> = new Map();
  const retval: Map<number, Monster> = new Map();
  for (const [idx, loc] of zones_available()) {
    for (const [idx_1, mob] of getMonsters(loc).entries()) {
      list.set(mob, true);
    }
  }
  for (const mob of list.keys()) {
    retval.set(retval.size, mob);
  }
  return retval;
}

function drops_available(): Map<number, Item> {
  const list: Map<Item, boolean> = new Map();
  const retval: Map<number, Item> = new Map();
  for (const [idx, mob] of mobs_available()) {
    for (const it of Item.get(Object.keys(itemDrops(mob)))) {
      list.set(it, true);
    }
  }
  for (const it of list.keys()) {
    retval.set(retval.size, it);
  }
  return retval;
}

function hugpocket_available(): Map<number, Item> {
  const list: Map<Item, boolean> = new Map();
  const retval: Map<number, Item> = new Map();
  for (const [idx, mob] of mobs_available()) {
    for (const [idx_1, drop] of itemDropsArray(mob).entries()) {
      if (drop.type === "0") {
        list.set(drop.drop, true);
      } else if (
        drop.rate > 0 &&
        drop.type !== "n" &&
        drop.type !== "c" &&
        drop.type !== "b"
      ) {
        list.set(drop.drop, true);
      }
    }
  }
  for (const it of list.keys()) {
    retval.set(retval.size, it);
  }
  return retval;
}

export function is_ghost_in_zone(loc: Location): boolean {
  //special location handling
  let totalTurnsSpent: number = 0;
  let delayForNextNoncombat: number = 0;
  if (haveEffect($effect`Lucky!`) > 0) {
    return false; //we are grabbing a Lucky! so we will not encounter a ghost unless it is a wandering monster
  }
  {
    //forced noncombat of lighting the peak
    //internal tracking by autoscend
    //our next visit to the peak will be The Horror NC adventure
    //special case for [ghost of Elizabeth Spookyraven] which only appears in [the haunted gallery] at the culmination of lights out quest
    //TODO implement doing the quest and then return true when the quest is at the right stage for her to appear
    //special case for King Boo
    //if liana cleared then we can encounter ghost

    let hasMcCluskyFile: boolean = false;
    let cursed: boolean = false;
    //if tracker is 6 we used just the right amount of bowling bowls
    //massive ziggurat
    //[Protector_S._P._E._C._T._R._E.] has 0 phys res and 100% all element res
    //for all other zones

    let apprates: Map<Monster, number> = new Map();
    switch (loc) {
      case $location`A-Boo Peak`:
        if (
          toInt(getProperty("booPeakProgress")) === 0 &&
          !toBoolean(getProperty("booPeakLit"))
        ) {
          return false;
        }
        if (toInt(getProperty("auto_aboopending")) !== 0) {
          return false;
        }
        return true;
      case $location`The Haunted Gallery`:
        return false;
      case $location`Summoning Chamber`:
        return in_plumber();
      case $location`The Hidden Hospital`:
        return (
          toInt(getProperty("hiddenHospitalProgress")) > 0 &&
          toInt(getProperty("hiddenHospitalProgress")) < 7
        );
      case $location`The Hidden Office Building`:
        hasMcCluskyFile = availableAmount($item`McClusky file (complete)`) > 0;
        totalTurnsSpent = $location`The Hidden Office Building`.turnsSpent;
        delayForNextNoncombat = 4 - ((totalTurnsSpent - 1) % 5);
        if (auto_haveQueuedForcedNonCombat()) {
          delayForNextNoncombat = 0;
        }
        return hasMcCluskyFile && delayForNextNoncombat === 0;
      case $location`The Hidden Apartment Building`:
        cursed = haveEffect($effect`Thrice-Cursed`) > 0;
        totalTurnsSpent = $location`The Hidden Apartment Building`.turnsSpent;
        delayForNextNoncombat = 7 - ((totalTurnsSpent - 9) % 8);
        if (totalTurnsSpent < 9) {
          delayForNextNoncombat = 8 - totalTurnsSpent;
        }
        if (auto_haveQueuedForcedNonCombat()) {
          delayForNextNoncombat = 0;
        }
        return cursed && delayForNextNoncombat === 0;
      case $location`The Hidden Bowling Alley`:
        return (
          toInt(getProperty("hiddenBowlingAlleyProgress")) === 6 &&
          availableAmount($item`bowling ball`) > 0
        );
      case $location`A Massive Ziggurat`:
        if (in_robot()) {
          return false;
        }
        return (
          liana_cleared($location`A Massive Ziggurat`) &&
          availableAmount($item`stone triangle`) === 4
        );
      default:
        apprates = auto_combat_appearance_rates(loc, true);
        for (const [idx, mob] of getMonsters(loc).entries()) {
          if ((apprates.get(mob) ?? apprates.set(mob, 0.0).get(mob)) <= 0) {
            //won't show up because banished or req's not fulfilled
            continue;
          }
          if (mob.physicalResistance >= 80) {
            return true;
          }
        }
    }
  }

  return false;
}

export function monster_to_location(target: Monster): Map<Location, boolean> {
  const retval: Map<Location, boolean> = new Map();
  for (const loc of $locations.all()) {
    //check all locations in the game
    for (const [idx, mon] of getMonsters(loc).entries()) {
      if (target === mon) {
        retval.set(loc, true);
        break;
      }
    }
  }
  return retval;
}

export function auto_swoopLocations(): Map<Location, boolean> {
  return new Map([
    [$location`The Hatching Chamber`, true],
    [$location`The Feeding Chamber`, true],
    [$location`The Royal Guard Chamber`, true],
    [$location`The Hidden Temple`, true],
    [$location`The Goatlet`, true],
  ]);
} /*
	case $location[The Oasis]:
	case $location[The Arid\, Extra-Dry Desert]:
	case $location[The Shore\, Inc. Travel Agency]:
	case $location[The Upper Chamber]:
	case $location[The Middle Chamber]:
	case $location[The Lower Chambers]:
	case $location[The Daily Dungeon]:
	case $location[The Skeleton Store]:
	case $location[Madness Bakery]:
	case $location[The Deep Machine Tunnels]:
	case $location[Super Villain\'s Lair]:
	case $location[The Haunted Kitchen]:
	case $location[The Haunted Conservatory]:
	case $location[The Haunted Gallery]:
	case $location[The Haunted Bathroom]:
	case $location[The Haunted Bedroom]:
	case $location[The Haunted Ballroom]:
	case $location[The Haunted Boiler Room]:
	case $location[The Haunted Laundry Room]:
	case $location[The Haunted Wine Cellar]:
	case $location[Summoning Chamber]:
	case $location[The Hidden Park]:
	case $location[The Hidden Apartment Building]:
	case $location[The Hidden Hospital]:
	case $location[The Hidden Office Building]:
	case $location[The Hidden Bowling Alley]:
	case $location[An Overgrown Shrine (Northwest)]:
	case $location[An Overgrown Shrine (Southwest)]:
	case $location[An Overgrown Shrine (Northeast)]:
	case $location[An Overgrown Shrine (Southeast)]:
	case $location[A Massive Ziggurat]:
	case $location[The Typical Tavern Cellar]:
	case $location[The Spooky Forest]:
	case $location[The Hidden Temple]:
	case $location[The Black Forest]:
	case $location[The Beanbat Chamber]:
	case $location[The Bat Hole Entrance]:
	case $location[The Batrat And Ratbat Burrow]:
	case $location[Guano Junction]:
	case $location[The Boss Bat\'s Lair]:
	case $location[The VERY Unquiet Garves]:
	case $location[Inside the Palindome]:
	case $location[The Outskirts of Cobb\'s Knob]:
	case $location[Cobb\'s Knob Harem]:
	case $location[Cobb\'s Knob Treasury]:
	case $location[Throne Room]:
	case $location[The Dark Neck of the Woods]:
	case $location[The Dark Heart of the Woods]:
	case $location[The Dark Elbow of the Woods]:
	case $location[Pandamonium Slums]:
	case $location[The Laugh Floor]:
	case $location[Infernal Rackets Backstage]:
	case $location[The Defiled Nook]:
	case $location[The Defiled Cranny]:
	case $location[The Defiled Alcove]:
	case $location[The Defiled Niche]:
	case $location[Barrrney\'s Barrr]:
	case $location[The F\'c\'le]:
	case $location[The Poop Deck]:
	case $location[Belowdecks]:
	case $location[The Battlefield (Frat Uniform)]:
	case $location[Wartime Hippy Camp (Frat Disguise)]:
	case $location[Next to that Barrel with Something Burning in it]:
	case $location[Near an Abandoned Refrigerator]:
	case $location[Over Where the Old Tires Are]:
	case $location[Out by that Rusted-Out Car]:
	case $location[The Extreme Slope]:
	case $location[Lair of the Ninja Snowmen]:
	case $location[Sonofa Beach]:
	case $location[The Themthar Hills]:
	case $location[The Hatching Chamber]:
	case $location[The Feeding Chamber]:
	case $location[The Royal Guard Chamber]:
	case $location[The Filthworm Queen\'s Chamber]:
	case $location[Noob Cave]:
	case $location[The Smut Orc Logging Camp]:
	case $location[A-Boo Peak]:
	case $location[Twin Peak]:
	case $location[Oil Peak]:
	case $location[Itznotyerzitz Mine]:
	case $location[The Goatlet]:
	case $location[Mist-Shrouded Peak]:
	case $location[The Icy Peak]:
	case $location[The Penultimate Fantasy Airship]:
	case $location[The Castle in the Clouds in the Sky (Basement)]:
	case $location[The Castle in the Clouds in the Sky (Ground Floor)]:
	case $location[The Castle in the Clouds in the Sky (Top Floor)]:
	case $location[The Hole in the Sky]:
	case $location[Fastest Adventurer Contest]:
	case $location[Smartest Adventurer Contest]:
	case $location[Hottest Adventurer Contest]:
	case $location[Barf Mountain]:
	case $location[The Bubblin\' Caldera]:
	case $location[The X-32-F Combat Training Snowman]:
	case $location[Through the Spacegate]:
	case $location[A Maze of Sewer Tunnels]:
	case $location[The Ice Hotel]:
	case $location[Whitey\'s Grove]:
	case $location[Gingerbread Upscale Retail District]:
	case $location[The Haiku Dungeon]:
	case $location[The Limerick Dungeon]:
	case $location[The Skeleton Store]:
	case $location[The Overgrown Lot]:
	case $location[The Secret Government Laboratory]:
	case $location[The Velvet / Gold Mine]:
	case $location[The Copperhead Club]:
	case $location[A Mob Of Zeppelin Protesters]:
	case $location[The Red Zeppelin]:
	case $location[The Bandit Crossroads]:
	case $location[The Towering Mountains]:
	case $location[The Mystic Wood]:
	case $location[The Putrid Swamp]:
	case $location[The Cursed Village]:
	case $location[The Sprawling Cemetary]:
	default:
*/
