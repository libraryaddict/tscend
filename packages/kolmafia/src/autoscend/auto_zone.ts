import {
  availableAmount,
  canadiaAvailable,
  canAdventure,
  containsText,
  fullnessLimit,
  getMonsters,
  gnomadsAvailable,
  guildAvailable,
  haveEffect,
  haveFamiliar,
  haveOutfit,
  haveSkill,
  inHardcore,
  isWearingOutfit,
  itemAmount,
  Location,
  Monster,
  monsterLevelAdjustment,
  myAscensions,
  myClass,
  myLevel,
  myPrimestat,
  toInt,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $skill,
  $stat,
  get,
} from "libram";

import { fullness_left, inebriety_left } from "./auto_consume";
import { possessEquipment, possessOutfit } from "./auto_equipment";
import {
  auto_combat_appearance_rates,
  auto_haveQueuedForcedNonCombat,
  auto_log_debug,
  canYellowRay,
  cloversAvailable,
  elemental_resist,
  internalQuestStatus,
  isDesertAvailable,
  isGuildClass,
  safeGet,
} from "./auto_util";
import { GhostBusting$$expectGhostReport } from "./iotms/2010/mr2016";
import { VotingBooth$$auto_voteMonster } from "./iotms/2010/mr2018";
import { Kramco$$auto_sausageGoblin } from "./iotms/2010/mr2019";
import {
  MushroomGarden$$auto_canFightPiranhaPlant,
  MushroomGarden$$auto_canTendMushroomGarden,
} from "./iotms/2020/mr2020";
import { BatWings$$auto_haveBatWings } from "./iotms/2020/mr2024";
import {
  bugbear_BioDataRemaining,
  in_bugbear,
} from "./paths/2012/bugbear_invasion";
import { kolhs_mandatorySchool } from "./paths/2013/kolhs";
import { in_lta } from "./paths/2017/license_to_adventure";
import { in_lar } from "./paths/2017/live_ascend_repeat";
import { in_koe } from "./paths/2019/kingdom_of_exploathing";
import { in_plumber } from "./paths/2020/path_of_the_plumber";
import { in_robot } from "./paths/2021/you_robot";
import { L8_forceExtremeInstead, L8_trapperTalk } from "./quests/level_08";
import { bridgeGoal } from "./quests/level_09";
import { L10_needAmuletOfPlotSignificance } from "./quests/level_10";
import {
  getShenZonesTurnsSpent,
  L11_needWetStew,
  liana_cleared,
} from "./quests/level_11";
import { need8BitPoints, needStarKey } from "./quests/level_13";
import {
  LX_doingPirates,
  LX_unlockThinknerdWarehouse,
  numPirateInsults,
} from "./quests/optional";
import { maximizer } from "./utils/maximizer";

//All functions should fail if the king is liberated?
//Zone functions come here.

//Defined in autoscend/auto_zone.ash
function zone_unlock(loc: Location): boolean {
  let unlocked: boolean;
  if (loc === $location`The Thinknerd Warehouse`) {
    unlocked = LX_unlockThinknerdWarehouse(false);
  } else if (loc === $location`Lair of the Ninja Snowmen` && L8_trapperTalk()) {
    unlocked = true;
  } else {
    auto_log_debug(`Don't know how to unlock ${loc}`);
    return false;
  }

  if (!unlocked) {
    auto_log_debug(`Wasnt able to unlock ${loc}`);
  }

  return unlocked;
}

export function zone_isAvailable(
  loc: Location,
  unlockIfPossible: boolean = true,
): boolean {
  if (zone_available(loc)) {
    return true;
  }

  if (unlockIfPossible) {
    zone_unlock(loc);
  }

  return zone_available(loc);
}

export function zone_delayable(): Map<Location, number> {
  const retval: Map<Location, number> = new Map();
  for (const loc of $locations.all()) {
    const { shouldDelay, delayRemaining } = zone_delay(loc);
    if (shouldDelay && zone_isAvailable(loc)) {
      retval.set(loc, delayRemaining);
    }
  }
  return retval;
}
// generic_t is defined in autoscend_record.ash

export function zone_needItem(loc: Location): {
  needItem: boolean;
  needScore: number;
} {
  // attempting to list these in descending order in relation to the quest they relate to
  // (so L13 quest stuff first then L12 then L11 and so on).
  let value: number = 0.0;
  let needScore: number = 0;
  let needItem: boolean = false;
  {
    switch (loc) {
      case $location`Hero's Field`:
        // bonus points cap at +400% item. Equivalent to a 20% item drop
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
          !possessOutfit("Frat Warrior Fatigues") &&
          !isWearingOutfit("War Hippy Fatigues")
        ) {
          //already in the other war outfit means only there to start the war
          value = 5.0;
        }
        break;
      case $location`Wartime Hippy Camp`:
        if (
          !possessOutfit("War Hippy Fatigues") &&
          !isWearingOutfit("Frat Warrior Fatigues")
        ) {
          //already in the other war outfit means only there to start the war
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
          (get("gnasirProgress") & 4) === 0 &&
          get("desertExploration") < 100
        ) {
          value = 10.0;
        }
        break;
      case $location`The Haunted Laundry Room`:
        value = 5.0 * (1.0 + get("auto_cabinetsencountered"));
        break;
      case $location`The Haunted Wine Cellar`:
        value = 5.0 * (1.0 + get("auto_wineracksencountered"));
        break;
      case $location`The Hidden Park`:
        if (get("hiddenTavernUnlock") < myAscensions()) {
          value = 20.0;
        }
        break;
      case $location`The Hidden Bowling Alley`:
        if (
          itemAmount($item`bowling ball`) === 0 &&
          get("hiddenBowlingAlleyProgress") < 5
        ) {
          value = 40.0;
        }
        break;
      case $location`The Hidden Temple`:
        //Only if we need stone wool manually for some reason.
        //Or via the semi-rare!		(100/50/20 for SR, 25 Sheep)
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
        if (L10_needAmuletOfPlotSignificance()) {
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
        if (get("chasmBridgeProgress") < bridgeGoal()) {
          value = 10.0;
        }
        break;
      case $location`A-Boo Peak`:
        if (get("auto_aboopending", 0) === 0) {
          value = 15.0;
        }
        break;
      case $location`Twin Peak`:
        value = 15.0;
        break;
      case $location`Oil Peak`:
        if (
          (get("twinPeakProgress") & 4) === 0 &&
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
          get("auto_wandOfNagamar", false)
        ) {
          value = 30.0;
        }
        break;
      case $location`Itznotyerzitz Mine`:
        if (!possessOutfit("Mining Gear") && cloversAvailable() === 0) {
          value = 10.0;
        }
        break;
      case $location`The Goatlet`: {
        let getMilk: boolean =
          (haveSkill($skill`Advanced Saucecrafting`) ||
            (myClass() === $class`Sauceror` &&
              (guildAvailable() || !get("auto_skipUnlockGuild", false)))) &&
          fullnessLimit() !== 0;
        const milksPerMilk: number = myClass() === $class`Sauceror` ? 3 : 1;
        const milkUsed: number =
          get("_milkOfMagnesiumUsed") || fullness_left() === 0 ? 1 : 0;
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
      }
      case $location`The eXtreme Slope`:
        if (!possessOutfit("eXtreme Cold-Weather Gear")) {
          value = 10.0;
        }
        break;
      case $location`The Defiled Nook`:
        // Handle for a gravy boat?
        if (get("cyrptNookEvilness") > 14) {
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
        if (!possessOutfit("Knob Goblin Harem Girl Disguise")) {
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
          !possessOutfit("Swashbuckling Getup") &&
          !possessEquipment($item`pirate fledges`)
        ) {
          value = 10.0;
        }
        break;
      case $location`The Old Landfill`:
        value = 5.0 * (1.0 + get("auto_junkspritesencountered"));
        break;
      case $location`The Deep Machine Tunnels`:
        value = 30.0; //Just a guess.

        break;
      case $location`Barf Mountain`:
        needScore = 15.0;
        break;
      case $location`The Velvet / Gold Mine`:
        if (!canYellowRay()) {
          //Just a guess
          needScore = 10.0;
        }
        break;
      case $location`The Haunted Pantry`:
        break;
      case $location`The Skeleton Store`:
        break;
      case $location`The Secret Government Laboratory`:
        break;
      // Bugbear Invasion Locations
      case $location`Waste Processing`:
        if (!possessEquipment($item`bugbear communicator badge`)) {
          needScore = 20.0;
        }
        break;
      case $location`Science Lab`:
        needScore = 30.0;
        break;
      case $location`Engineering`:
        needScore = 50.0;
        break;
      // End Bugbear Invasion Locations
      // A Shrunken Adventurer Am I (Small) Locations
      case $location`Fight in the Dirt`:
        value = 50.0;
        break;
      case $location`Fight in the Tall Grass`:
        value = 50.0;
        break;
      case $location`Fight in the Very Tall Grass`:
        value = 50.0;
        break;
      // End A Shrunken Adventurer Am I (Small) Locations
      // Shadow Rifts via cursed payphone or AoSOL path
      case $location`Shadow Rift (The Ancient Buried Pyramid)`:
      case $location`Shadow Rift (The Hidden City)`:
      case $location`Shadow Rift (The Misspelled Cemetary)`:
        value = 10.0;
        break;
      // End Shadow Rifts
      default:
        break;
    }
  }

  if (
    GhostBusting$$expectGhostReport() &&
    loc === safeGet("ghostLocation") &&
    get("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  if (value !== 0.0) {
    needItem = true;
    needScore = 10000.0 / value;

    if (in_lar()) {
      needScore = 5000.0 / value;
    }
    needScore -= 100.0;
  }
  return { needItem, needScore };
}

export function zone_needItemBooze(loc: Location): {
  needsItem: boolean;
  score: number;
} {
  // these matching a location case in zone_needItem will be called if the general item bonus could not be reached
  let value: number = 0.0;
  switch (loc) {
    case $location`The Haunted Wine Cellar`:
      value = 5.0 * (1.0 + get("auto_wineracksencountered"));
      break;
    default:
      break;
  }

  if (
    GhostBusting$$expectGhostReport() &&
    loc === safeGet("ghostLocation") &&
    get("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  let needBoozeScore: number = 0;
  if (value !== 0.0) {
    needBoozeScore = 10000.0 / value;

    if (in_lar()) {
      needBoozeScore = 5000.0 / value;
    }
    needBoozeScore -= 100.0;
  }
  return {
    needsItem: value !== 0,
    score: needBoozeScore,
  };
}

export function zone_needItemFood(loc: Location): {
  needsItem: boolean;
  score: number;
} {
  // these matching a location case in zone_needItem will be called if the general item bonus could not be reached
  let value: number = 0.0;
  {
    switch (loc) {
      case $location`The Haunted Laundry Room`:
        value = 5.0 * (1.0 + get("auto_cabinetsencountered"));
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
      case $location`The Goatlet`: {
        let getMilk: boolean =
          (haveSkill($skill`Advanced Saucecrafting`) ||
            (myClass() === $class`Sauceror` &&
              (guildAvailable() || !get("auto_skipUnlockGuild", false)))) &&
          fullnessLimit() !== 0;
        const milksPerMilk: number = myClass() === $class`Sauceror` ? 3 : 1;
        const milkUsed: number =
          get("_milkOfMagnesiumUsed") || fullness_left() === 0 ? 1 : 0;
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
      }
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
        break;
    }
  }

  if (
    GhostBusting$$expectGhostReport() &&
    loc === safeGet("ghostLocation") &&
    get("questPAGhost") === "started"
  ) {
    value = 0.0;
  }

  let needScore: number = 0;

  if (value !== 0.0) {
    needScore = 10000.0 / value;

    if (in_lar()) {
      needScore = 5000.0 / value;
    }
    needScore -= 100.0;
  }
  return {
    needsItem: value !== 0.0,
    score: needScore,
  };
}

export function zone_combatMod(loc: Location): {
  doCombatModifiers: boolean;
  desiredModifier: number;
} {
  // attempting to list these in descending order in relation to the quest they relate to
  // (so L13 quest stuff first then L12 then L11 and so on).
  const { shouldDelay } = zone_delay(loc);
  let desiredModifier: number = 0;
  switch (loc) {
    case $location`The Orcish Frat House`:
    case $location`The Hippy Camp`:
      if (myLevel() >= 9) {
        desiredModifier = -85;
      }
      break;
    case $location`Wartime Frat House`:
    case $location`Wartime Hippy Camp`:
      desiredModifier = -80;
      break;
    case $location`Sonofa Beach`:
      //when wanderer replacing strategy is about to be used, combat modifier is useless. these are the replaced wanderers
      if (
        VotingBooth$$auto_voteMonster() &&
        maximizer.willEquip($item`"I Voted!" sticker`)
      ) {
        desiredModifier = 0;
        break;
      }
      if (
        Kramco$$auto_sausageGoblin() &&
        maximizer.willEquip($item`Kramco Sausage-o-Matic™`)
      ) {
        desiredModifier = 0;
        break;
      }

      //otherwise if no wanderer replace
      desiredModifier = 90;
      break;
    case $location`The Upper Chamber`:
      desiredModifier = -85;
      break;
    case $location`The Haunted Billiards Room`:
      desiredModifier = -85;
      break;
    case $location`The Haunted Gallery`:
      if (
        !shouldDelay ||
        !containsText(get("relayCounters"), "Garden Banished")
      ) {
        desiredModifier = -80;
      }
      break;
    case $location`The Haunted Bathroom`:
      if (!shouldDelay) {
        desiredModifier = -90;
      }
      break;
    case $location`The Haunted Ballroom`:
      if (!shouldDelay && loc.turnsSpent > 0) {
        desiredModifier = -90;
      }
      break;
    case $location`The Hidden Park`:
      desiredModifier = -85;
      break;
    case $location`The Hidden Temple`:
      if (haveEffect($effect`Stone-Faced`) === 0) {
        desiredModifier = -90;
      }
      break;
    case $location`A Mob of Zeppelin Protesters`:
      if (internalQuestStatus("questL11Ron") >= 1) {
        desiredModifier = -70;
      }
      break;
    case $location`The Black Forest`:
      if (internalQuestStatus("questL13Final") < 6) {
        desiredModifier = 5;
      } else if (internalQuestStatus("questL13Final") === 6) {
        desiredModifier = -95;
      }
      break;
    case $location`Inside the Palindome`:
      if (
        (itemAmount($item`photograph of a red nugget`) === 0 ||
          itemAmount($item`photograph of an ostrich egg`) === 0 ||
          itemAmount($item`photograph of God`) === 0) &&
        internalQuestStatus("questL11Palindome") <= 2
      ) {
        desiredModifier = -70;
      } else if (
        3 <= internalQuestStatus("questL11Palindome") &&
        internalQuestStatus("questL11Palindome") <= 4
      ) {
        desiredModifier = 25;
      }
      break;
    case $location`Whitey's Grove`:
      if (L11_needWetStew()) {
        desiredModifier = 15;
      }
      break;
    case $location`The Penultimate Fantasy Airship`:
      if (
        !shouldDelay ||
        (BatWings$$auto_haveBatWings() &&
          availableAmount($item`S.O.C.K.`) === 0)
      ) {
        desiredModifier = -80;
      } else if (
        in_bugbear() &&
        bugbear_BioDataRemaining($location`Engineering`) > 0
      ) {
        // When hunting bugbears, we want normal combats, not NC combats
        desiredModifier = 10;
      } else {
        //Let us not worry about throttling the Airship
        //value = 20;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Basement)`:
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      desiredModifier = -95;
      break;
    case $location`Twin Peak`:
      desiredModifier = -85;
      break;
    case $location`The eXtreme Slope`:
      desiredModifier = -95;
      break;
    case $location`Itznotyerzitz Mine`:
      if (!possessOutfit("Mining Gear") && cloversAvailable() === 0) {
        desiredModifier = -90;
      }
      break;
    case $location`Lair of the Ninja Snowmen`:
      if (
        internalQuestStatus("questL08Trapper") < 3 &&
        !L8_forceExtremeInstead() &&
        itemAmount($item`ninja carabiner`) === 0
      ) {
        desiredModifier = 80;
      }
      break;
    case $location`The Dark Neck of the Woods`:
    case $location`The Dark Heart of the Woods`:
    case $location`The Dark Elbow of the Woods`:
      desiredModifier = -95;
      break;
    case $location`The Defiled Cranny`:
    case $location`The Defiled Alcove`:
      desiredModifier = -85;
      break;
    case $location`The Typical Tavern Cellar`:
      //We could cut it off early if the Rat Faucet is the last one
      //And marginally if we know the 3rd/6th square are forced events.
      //actual desired value for combat or non combat is decided by level_03.ash based on elemental damage bonus
      break;
    case $location`The Spooky Forest`:
      if (!shouldDelay) {
        desiredModifier = -85;
      }
      break;
    case $location`The Laugh Floor`:
      if (itemAmount($item`Azazel's lollipop`) < 1) {
        desiredModifier = toInt(15.0);
      }
      break;
    case $location`Infernal Rackets Backstage`:
      if (itemAmount($item`Azazel's unicorn`) < 1) {
        desiredModifier = -70;
      }
      break;
    case $location`Barrrney's Barrr`:
      if (numPirateInsults() >= 6) {
        desiredModifier = -80;
      } else {
        desiredModifier = 20;
      }
      break;
    case $location`The F'c'le`:
      if (!possessEquipment($item`pirate fledges`)) {
        desiredModifier = 20;
      }
      break;
    case $location`The Poop Deck`:
      desiredModifier = -80;
      break;
    case $location`The Obligatory Pirate's Cove`:
      if (!possessOutfit("Swashbuckling Getup")) {
        if (
          itemAmount($item`The Big Book of Pirate Insults`) > 0 &&
          numPirateInsults() < 3
        ) {
          desiredModifier = 0; // fights can give both outfit pieces and insults. better not start avoiding fights until first insults learned
        } else {
          desiredModifier = -60;
        }
      } else if (numPirateInsults() < 8) {
        desiredModifier = 40;
      }
      break;
    case $location`The Knob Shaft`:
      desiredModifier = 15;
      break;
    case $location`South of the Border`:
      desiredModifier = 50;
      break;
    case $location`The Icy Peak`:
      desiredModifier = 15;
      break;
    case $location`Pandamonium Slums`:
      desiredModifier = 5;
      break;
    case $location`The Haunted Pantry`:
      desiredModifier = 20;
      break;
    case $location`Cobb's Knob Treasury`:
      desiredModifier = 15;
      break;
    case $location`The VERY Unquiet Garves`:
      if (
        itemAmount($item`Wand of Nagamar`) === 0 &&
        internalQuestStatus("questL13Final") === 12 &&
        !in_koe()
      ) {
        desiredModifier = -100;
      }
      break;
    case $location`Super Villain's Lair`:
      if (
        !get("_villainLairColorChoiceUsed") ||
        !get("_villainLairDoorChoiceUsed") ||
        !get("_villainLairSymbologyChoiceUsed")
      ) {
        desiredModifier = -70;
      }
      break;
    case $location`Through the Spacegate`:
      desiredModifier = 5;
      break;
    case $location`The Ice Hotel`:
      desiredModifier = -85;
      break;
    // Bugbear Invasion Locations
    case $location`Sonar`:
      desiredModifier = -70;
      break;
    case $location`Morgue`:
      if (itemAmount($item`bugbear autopsy tweezers`) > 0) {
        desiredModifier = -70;
      }
      break;
    // End Bugbear Invasion Locations
    default:
      break;
  }

  if (in_lar()) {
    desiredModifier = 0;
  }

  if (
    GhostBusting$$expectGhostReport() &&
    loc === safeGet("ghostLocation") &&
    get("questPAGhost") === "started"
  ) {
    desiredModifier = 0;
  }

  return {
    doCombatModifiers: desiredModifier !== 0,
    desiredModifier,
  };
}

export function zone_delay(loc: Location): {
  shouldDelay: boolean;
  delayRemaining: number;
} {
  let delayRemaining: number = 0;
  const shenZones: Map<Location, number> = getShenZonesTurnsSpent();
  switch (loc) {
    case $location`The Oasis`:
      // Superlikely adventures take priority over all wanderers now.
      if (
        get("desertExploration") < 100 &&
        haveEffect($effect`Ultrahydrated`) > 0
      ) {
        delayRemaining = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Upper Chamber`:
      delayRemaining = 5 - loc.turnsSpent;
      break;
    case $location`The Middle Chamber`:
      delayRemaining = 10 - loc.turnsSpent;
      break;
    case $location`The Haunted Gallery`:
      delayRemaining = 5 - loc.turnsSpent;
      break;
    case $location`The Haunted Bathroom`:
      delayRemaining = 5 - loc.turnsSpent;
      break;
    case $location`The Haunted Ballroom`:
      delayRemaining = 5 - loc.turnsSpent;
      break;
    case $location`The Hidden Park`:
      if (
        !possessEquipment($item`antique machete`) &&
        !possessEquipment($item`muculent machete`) &&
        inHardcore()
      ) {
        delayRemaining = 6 - loc.turnsSpent;
      }
      break;
    case $location`The Hidden Apartment Building`:
      if (internalQuestStatus("questL11Curses") < 2) {
        if (loc.turnsSpent < 9) {
          delayRemaining = 8 - loc.turnsSpent;
        } else {
          delayRemaining = 7 - ((loc.turnsSpent - 9) % 8);
        }
      }
      break;
    case $location`The Hidden Office Building`:
      if (internalQuestStatus("questL11Business") < 2) {
        if (loc.turnsSpent < 6) {
          delayRemaining = 5 - loc.turnsSpent;
        } else {
          delayRemaining = 4 - ((loc.turnsSpent - 6) % 5);
        }
      }
      break;
    case $location`The Spooky Forest`:
      delayRemaining = 5 - loc.turnsSpent;
      break;
    case $location`The Boss Bat's Lair`:
      delayRemaining = 4 - loc.turnsSpent;
      break;
    case $location`Mist-Shrouded Peak`:
      delayRemaining = 4 - loc.turnsSpent;
      break;
    case $location`The Outskirts of Cobb's Knob`:
      if (internalQuestStatus("questL05Goblin") < 1) {
        delayRemaining = 10 - loc.turnsSpent;
      }
      break;
    case $location`The Penultimate Fantasy Airship`:
      if (get("questL10Garbage") === "step2") {
        delayRemaining = 5 - loc.turnsSpent;
      } else if (get("questL10Garbage") === "step3") {
        delayRemaining = 10 - loc.turnsSpent;
      } else if (get("questL10Garbage") === "step4") {
        delayRemaining = 15 - loc.turnsSpent;
      } else if (get("questL10Garbage") === "step5") {
        delayRemaining = 20 - loc.turnsSpent;
      } else if (get("questL10Garbage") === "step6") {
        delayRemaining = 25 - loc.turnsSpent;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Ground Floor)`:
      delayRemaining = 10 - loc.turnsSpent;
      break;
    case $location`The Haunted Pantry`:
      if (
        isGuildClass() &&
        myPrimestat() === $stat`Mysticality` &&
        !get("auto_skipUnlockGuild", false)
      ) {
        delayRemaining = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Sleazy Back Alley`:
      if (
        isGuildClass() &&
        myPrimestat() === $stat`Moxie` &&
        !get("auto_skipUnlockGuild", false)
      ) {
        delayRemaining = 5 - loc.turnsSpent;
      }
      break;
    case $location`The Smut Orc Logging Camp`:
      if (shenZones.has(loc) && get("chasmBridgeProgress") >= bridgeGoal()) {
        delayRemaining = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? 0));
      }
      break;
    case $location`The Hole in the Sky`:
      if (shenZones.has(loc) && !needStarKey()) {
        delayRemaining = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? 0));
      }
      break;
    case $location`The Unquiet Garves`:
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
    case $location`Lair of the Ninja Snowmen`:
    case $location`The Batrat and Ratbat Burrow`:
      if (shenZones.has(loc)) {
        delayRemaining = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? 0));
      }
      break;
    case $location`The Copperhead Club`:
      if (
        internalQuestStatus("questL11Shen") > 0 &&
        internalQuestStatus("questL11Shen") < 8
      ) {
        delayRemaining = 5 - (loc.turnsSpent - get("auto_lastShenTurn", 0));
      }
      break;
    case $location`The Hallowed Halls`:
    case $location`Art Class`:
    case $location`Chemistry Class`:
    case $location`Shop Class`:
      if (kolhs_mandatorySchool()) {
        //KOLHS path specific delay locations
        delayRemaining = 40 - get("_kolhsAdventures"); //shared counter of 40 adv between all 4 zones
      }
      break;
    case $location`Vanya's Castle`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        (get("8BitColor") === "black" || get("8BitColor") === "")
      ) {
        delayRemaining = 5 - get("8BitBonusTurns");
      }
      break;
    case $location`The Fungus Plains`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        get("8BitColor") === "red"
      ) {
        delayRemaining = 5 - get("8BitBonusTurns");
      }
      break;
    case $location`Megalo-City`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        get("8BitColor") === "blue"
      ) {
        delayRemaining = 5 - get("8BitBonusTurns");
      }
      break;
    case $location`Hero's Field`:
      if (
        need8BitPoints() &&
        possessEquipment($item`continuum transfunctioner`) &&
        get("8BitColor") === "green"
      ) {
        delayRemaining = 5 - get("8BitBonusTurns");
      }
      break;
    default:
      break;
  }

  delayRemaining = Math.max(0, delayRemaining);
  return {
    shouldDelay: delayRemaining > 0,
    delayRemaining,
  };
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
        get("_villainLairProgress") < 999 &&
        get("_auto_bondBriefing") === "started"
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
      retval = get("middleChamberUnlock");
      break;
    case $location`The Lower Chambers`:
      retval = get("lowerChamberUnlock");
      break;
    case $location`The Daily Dungeon`:
      retval = !get("dailyDungeonDone");
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
      if (get("lastTempleUnlock") === myAscensions()) {
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
      if (get("questL07Cyrptic") === "finished") {
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
        get("questL06Friar") !== "finished"
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
      if (get("lastIslandUnlock") === myAscensions()) {
        if (
          get("questL12War") === "unstarted" ||
          get("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`Barrrney's Barrr`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        get("lastIslandUnlock") === myAscensions()
      ) {
        if (
          get("questL12War") === "unstarted" ||
          get("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`The F'c'le`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        get("lastIslandUnlock") === myAscensions() &&
        internalQuestStatus("questM12Pirate") >= 5
      ) {
        if (
          get("questL12War") === "unstarted" ||
          get("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`The Poop Deck`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        get("lastIslandUnlock") === myAscensions() &&
        internalQuestStatus("questM12Pirate") >= 6
      ) {
        if (
          get("questL12War") === "unstarted" ||
          get("questL12War") === "finished"
        ) {
          retval = true;
        }
      }
      break;
    case $location`Belowdecks`:
      if (
        (haveOutfit("swashbuckling getup") ||
          possessEquipment($item`pirate fledges`)) &&
        get("lastIslandUnlock") === myAscensions() &&
        get("questM12Pirate") === "finished"
      ) {
        if (
          get("questL12War") === "unstarted" ||
          get("questL12War") === "finished"
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
      if (get("lastIslandUnlock") === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Orcish Frat House (In Disguise)`:
      if (
        get("lastIslandUnlock") === myAscensions() &&
        haveOutfit("Frat Boy Ensemble") &&
        internalQuestStatus("questL12War") !== 0 && //mafia always calls location Wartime with L12 quest
        internalQuestStatus("questL12War") !== 1 //mafia always calls location Wartime with L12 quest
      ) {
        retval = true;
      }
      break;
    case $location`The Hippy Camp (In Disguise)`:
      if (
        get("lastIslandUnlock") === myAscensions() &&
        haveOutfit("Filthy Hippy Disguise") &&
        internalQuestStatus("questL12War") !== 0 && //mafia always calls location Wartime with L12 quest
        internalQuestStatus("questL12War") !== 1 //mafia always calls location Wartime with L12 quest
      ) {
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
        get("hippiesDefeated") < 1000 &&
        haveOutfit("frat warrior fatigues") &&
        get("questL12War") !== "finished"
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
        get("fratboysDefeated") < 1000 &&
        haveOutfit("war hippy fatigues") &&
        get("questL12War") !== "finished"
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
        (get("sidequestJunkyardCompleted") === "none" ||
          get("flyeredML") < 10000) &&
        get("questL12War") !== "finished"
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
        get("sidequestNunsCompleted") === "none" &&
        get("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Hatching Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        get("sidequestOrchardCompleted") === "none" &&
        get("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Feeding Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        get("sidequestOrchardCompleted") === "none" &&
        haveEffect($effect`Filthworm Larva Stench`) > 0 &&
        get("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Royal Guard Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        get("sidequestOrchardCompleted") === "none" &&
        haveEffect($effect`Filthworm Drone Stench`) > 0 &&
        get("questL12War") !== "finished"
      ) {
        retval = true;
      }
      break;
    case $location`The Filthworm Queen's Chamber`:
      if (
        internalQuestStatus("questL12War") >= 1 &&
        get("sidequestOrchardCompleted") === "none" &&
        itemAmount($item`heart of the filthworm queen`) === 0 &&
        haveEffect($effect`Filthworm Guard Stench`) > 0 &&
        get("questL12War") !== "finished"
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
      if (get("lastCastleGroundUnlock") === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Castle in the Clouds in the Sky (Top Floor)`:
      if (get("lastCastleTopUnlock") === myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Hole in the Sky`:
      if (itemAmount($item`steam-powered model rocketship`) > 0 || in_koe()) {
        retval = true;
      }
      break;
    case $location`The Tunnel of L.O.V.E.`:
      if (get("loveTunnelAvailable") && !get("_loveTunnelUsed")) {
        retval = true;
      }
      break;
    case $location`Fastest Adventurer Contest`:
      if (get("nsContestants1") > 0) {
        retval = true;
      }
      break;
    case $location`The Enormous Greater-Than Sign`:
      if (get("lastPlusSignUnlock") < myAscensions()) {
        retval = true;
      }
      break;
    case $location`The Dungeons of Doom`:
      if (get("lastPlusSignUnlock") === myAscensions()) {
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
      if (get("nsContestants2") > 0) {
        retval = true;
      }
      break;
    case $location`Coldest Adventurer Contest`:
    case $location`Hottest Adventurer Contest`:
    case $location`Sleaziest Adventurer Contest`:
    case $location`Spookiest Adventurer Contest`:
    case $location`Stinkiest Adventurer Contest`:
      if (get("nsContestants3") > 0) {
        retval = true;
      }
      break;
    case $location`Tower Level 1`:
      if (get("questL13Final") === "step6") {
        retval = true;
      }
      break;
    case $location`Tower Level 2`:
      if (get("questL13Final") === "step7") {
        retval = true;
      }
      break;
    case $location`Tower Level 3`:
      if (get("questL13Final") === "step8") {
        retval = true;
      }
      break;
    case $location`Tower Level 4`:
      if (get("questL13Final") === "step9") {
        retval = true;
      }
      break;
    case $location`Tower Level 5`:
      if (get("questL13Final") === "step10") {
        retval = true;
      }
      break;
    case $location`The Naughty Sorceress' Chamber`:
      if (get("questL13Final") === "step11") {
        retval = true;
      }
      break;
    case $location`Barf Mountain`:
    case $location`Pirates of the Garbage Barges`:
    case $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`:
    case $location`The Toxic Teacups`:
      retval = get("stenchAirportAlways") || get("_stenchAirportToday");
      break;
    case $location`The Fun-Guy Mansion`:
    case $location`The Sunken Party Yacht`:
    case $location`Sloppy Seconds Diner`:
      retval = get("sleazeAirportAlways") || get("_sleazeAirportToday");
      break;
    case $location`The Secret Government Laboratory`:
    case $location`The Deep Dark Jungle`:
    case $location`The Mansion of Dr. Weirdeaux`:
      retval = get("spookyAirportAlways") || get("_spookyAirportToday");
      break;
    case $location`The Ice Hotel`:
    case $location`VYKEA`:
    case $location`The Ice Hole`:
      retval = get("coldAirportAlways") || get("_coldAirportToday");
      break;
    case $location`The SMOOCH Army HQ`:
    case $location`LavaCo™ Lamp Factory`:
    case $location`The Velvet / Gold Mine`:
    case $location`The Bubblin' Caldera`:
      retval = get("hotAirportAlways") || get("_hotAirportToday");
      break;
    case $location`The X-32-F Combat Training Snowman`:
      retval = get("snojoAvailable");
      break;
    case $location`Through the Spacegate`:
      retval = get("spacegateAlways") || get("_spacegateToday");
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
    // We go here to get the Logging Hatchet
    case $location`Camp Logging Camp`:
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
      if (get("gingerRetailUnlocked")) {
        retval =
          get("gingerbreadCityAvailable") || get("_gingerbreadCityToday");
      }
      break;
    case $location`Gingerbread Sewers`:
      if (get("gingerSewersUnlocked")) {
        retval =
          get("gingerbreadCityAvailable") || get("_gingerbreadCityToday");
      }
      break;
    case $location`Gingerbread Civic Center`:
    case $location`Gingerbread Industrial Zone`:
    case $location`Gingerbread Train Station`:
      retval = get("gingerbreadCityAvailable") || get("_gingerbreadCityToday");
      break;
    case $location`The Bandit Crossroads`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Towering Mountains`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Mystic Wood`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Putrid Swamp`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Cursed Village`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`The Sprawling Cemetery`:
      retval = containsText(get("_frAreasUnlocked"), loc.toString());
      break;
    case $location`Monorail Work Site`:
      retval = false;
      break;
    case $location`Your Mushroom Garden`:
      retval =
        MushroomGarden$$auto_canFightPiranhaPlant() ||
        MushroomGarden$$auto_canTendMushroomGarden();
      break;
  }
  // compare our result with Mafia's native function, log a warning if theres a difference. Ideally we can see if there are any differences between our code and Mafia's, and if not remove all of ours in favor of Mafia's
  const canAdvRetval: boolean = canAdventure(loc);
  if (canAdvRetval !== retval) {
    auto_log_debug(
      `Uh oh, autoscend and mafia's can_adventure() dont agree on whether we can adventure at ${loc} (autoscend: ${retval}, can_adventure(): ${canAdvRetval}). Will assume location available if either is true.`,
    );
    retval = retval || canAdvRetval;
  }

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

export function is_ghost_in_zone(loc: Location): boolean {
  //special location handling
  if (haveEffect($effect`Lucky!`) > 0) {
    return false; //we are grabbing a Lucky! so we will not encounter a ghost unless it is a wandering monster
  }
  {
    switch (loc) {
      case $location`A-Boo Peak`:
        if (get("booPeakProgress") === 0 && !get("booPeakLit")) {
          //forced noncombat of lighting the peak
          return false;
        }
        if (get("auto_aboopending", 0) !== 0) {
          //internal tracking by autoscend
          //our next visit to the peak will be The Horror NC adventure
          return false;
        }
        return true;
      case $location`The Haunted Gallery`:
        //special case for [ghost of Elizabeth Spookyraven] which only appears in [the haunted gallery] at the culmination of lights out quest
        //TODO implement doing the quest and then return true when the quest is at the right stage for her to appear
        return false;
      case $location`Summoning Chamber`:
        //special case for King Boo
        return in_plumber();
      case $location`The Hidden Hospital`:
        //if liana cleared then we can encounter ghost
        return (
          get("hiddenHospitalProgress") > 0 && get("hiddenHospitalProgress") < 7
        );
      case $location`The Hidden Office Building`: {
        const hasMcCluskyFile: boolean =
          availableAmount($item`McClusky file (complete)`) > 0;
        const totalTurnsSpent: number = $location`The Hidden Office Building`
          .turnsSpent;
        let delayForNextNoncombat: number = 4 - ((totalTurnsSpent - 1) % 5);
        if (auto_haveQueuedForcedNonCombat()) {
          delayForNextNoncombat = 0;
        }
        return hasMcCluskyFile && delayForNextNoncombat === 0;
      }
      case $location`The Hidden Apartment Building`: {
        const cursed: boolean = haveEffect($effect`Thrice-Cursed`) > 0;
        const totalTurnsSpent: number = Location.get(
          "The Hidden Apartment Building",
        ).turnsSpent;
        let delayForNextNoncombat: number = 7 - ((totalTurnsSpent - 9) % 8);
        if (totalTurnsSpent < 9) {
          delayForNextNoncombat = 8 - totalTurnsSpent;
        }
        if (auto_haveQueuedForcedNonCombat()) {
          delayForNextNoncombat = 0;
        }
        return cursed && delayForNextNoncombat === 0;
      }
      case $location`The Hidden Bowling Alley`:
        //if tracker is 6 we used just the right amount of bowling bowls
        return (
          get("hiddenBowlingAlleyProgress") === 6 &&
          availableAmount($item`bowling ball`) > 0
        );
      case $location`A Massive Ziggurat`:
        //massive ziggurat
        if (in_robot()) {
          //[Protector_S._P._E._C._T._R._E.] has 0 phys res and 100% all element res
          return false;
        }
        return (
          liana_cleared($location`A Massive Ziggurat`) &&
          availableAmount($item`stone triangle`) === 4
        );
      default: {
        //for all other zones
        const apprates: Map<Monster, number> = auto_combat_appearance_rates(
          loc,
          true,
        );
        for (const [, mob] of getMonsters(loc).entries()) {
          if ((apprates.get(mob) ?? 0.0) <= 0) {
            //won't show up because banished or req's not fulfilled
            continue;
          }
          if (mob.physicalResistance >= 80) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function monster_to_location(target: Monster): Location[] {
  const retval: Location[] = [];
  for (const loc of $locations.all()) {
    //check all locations in the game
    for (const [, mon] of getMonsters(loc).entries()) {
      if (target === mon) {
        retval.push(loc);
        break;
      }
    }
  }
  return retval;
}

export function auto_swoopLocations(): Location[] {
  return [
    $location`The Hatching Chamber`,
    $location`The Feeding Chamber`,
    $location`The Royal Guard Chamber`,
    $location`The Hidden Temple`,
    $location`The Goatlet`,
  ];
}
