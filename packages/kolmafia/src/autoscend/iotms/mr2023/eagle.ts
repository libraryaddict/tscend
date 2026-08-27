import {
  canAdventure,
  containsText,
  Familiar,
  haveEffect,
  itemAmount,
  Location,
  Monster,
  myLocation,
  myMeat,
  toLowerCase,
  turnsPlayed,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $skill,
  get,
  set,
} from "libram";

import { Bofa, SeptEmberCenser } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { canChangeToFamiliar, handleFamiliar$1 } from "../../auto_familiar";
import { uneffect } from "../../auto_restore";
import { solveDelayZone } from "../../auto_routing";
import {
  auto_is_valid$2,
  auto_log_debug,
  auto_log_info,
  auto_queueIgnore,
  handleTracker,
  meatReserve,
  safeGet,
} from "../../auto_util";
import { cyrptEvilBonus } from "../../quests/level_07";

export function auto_haveEagle(): boolean {
  if (canChangeToFamiliar($familiar`Patriotic Eagle`)) {
    return true;
  }
  return false;
}

export function auto_forceEagle(famChoice: Familiar): Familiar {
  //Force the Patriotic Eagle if we used a banish recently and can't use one until we burn 11 combats with the Eagle
  if (auto_haveEagle() && get("screechCombats") > 0 && !auto_queueIgnore()) {
    auto_log_info("Forcing Patriotic Eagle");
    return $familiar`Patriotic Eagle`;
  }
  return famChoice;
}

export function auto_canRWBBlast(): boolean {
  if (!auto_haveEagle()) {
    return false;
  }
  if (!auto_is_valid$2($skill`%fn, fire a Red, White and Blue Blast`)) {
    return false;
  }
  if (haveEffect($effect`Everything Looks Red, White and Blue`) > 0) {
    //Already have ELRWB
    return false;
  }
  if (Bofa.auto_habitatMonster() !== $monster.none) {
    //don't want to RWB Blast a Habitated monster
    return false;
  }
  return true;
}

export function auto_RWBBlastTarget(target: Monster): boolean {
  if (!auto_canRWBBlast()) {
    return false;
  }
  switch (target) {
    case $monster`modern zmobie`:
      // only worth it if we need 15 or more evilness reduced
      return get("cyrptAlcoveEvilness") - 3 * (5 + cyrptEvilBonus()) > 13;
    case $monster`dirty old lihc`:
      // only worth it if we need 9 or more evilness reduced.
      return get("cyrptNicheEvilness") - 3 * (3 + cyrptEvilBonus()) > 13;
    default:
      return safeGet("rwbMonster") === target;
  }
  return false;
}

export function auto_RWBMonster(): Monster {
  if (get("rwbMonsterCount") < 3) {
    return safeGet("rwbMonster");
  }
  return $monster.none;
}

function activeCitZoneMod(): string {
  // get the active Citizen of a Zone mods, if any
  if (!auto_haveEagle() || haveEffect($effect`Citizen of a Zone`) === 0) {
    return "";
  }
  visitUrl("desc_effect.php?whicheffect=9391a5f7577e30ac3af6309804da6944"); // visit url to refresh Mafia's _citizenZoneMods preference
  const activeCitZoneMod_1: string = toLowerCase(get("_citizenZoneMods"));
  return activeCitZoneMod_1;
}

function auto_citZoneModIsGoal(goal: string): boolean {
  const activeCitZoneMod_1: string = activeCitZoneMod();

  if (
    containsText(activeCitZoneMod_1, goal) ||
    (goal === "spec" && containsText(activeCitZoneMod_1, "cold resistance"))
  ) {
    return true;
  }
  return false;
}

function auto_citizenZonePrep(goal: string): boolean {
  if (!auto_haveEagle()) return false;

  const activeCitZoneMod_1: string = activeCitZoneMod();
  if (myMeat() < meatReserve() && goal !== "mp") {
    return false; //don't attempt to change if we don't have a lot of meat and we are going for something other than mp
  }
  if (
    haveEffect($effect`Citizen of a Zone`) > 0 &&
    containsText(activeCitZoneMod_1, goal)
  ) {
    auto_log_info("No need to remove Citizen of a Zone");
    return false;
  }
  if (
    haveEffect($effect`Citizen of a Zone`) > 0 &&
    !containsText(activeCitZoneMod_1, goal) &&
    itemAmount($item`soft green echo eyedrop antidote`) === 0
  ) {
    auto_log_info("Can't remove Citizen of a Zone");
    return false;
  }
  if (
    !auto_citZoneModIsGoal(goal) &&
    itemAmount($item`soft green echo eyedrop antidote`) > 0
  ) {
    //try to remove Citizen of a Zone
    uneffect($effect`Citizen of a Zone`);
    if (haveEffect($effect`Citizen of a Zone`) > 0) {
      auto_log_debug("Tried to remove Citizen of a Zone but couldn't");
      return false;
    }
  }
  return true;
}

function citizenZones(goal: string): Location[] {
  if (goal === "meat") {
    return [
      $location`The Battlefield (Frat Uniform)`,
      $location`The Battlefield (Hippy Uniform)`,
      $location`The Hidden Hospital`,
      $location`The Haunted Bathroom`,
      $location`The Castle in the Clouds in the Sky (Basement)`,
      $location`Lair of the Ninja Snowmen`,
      $location`The Defiled Cranny`,
      $location`The Laugh Floor`,
      $location`The Batrat and Ratbat Burrow`,
      $location`The Sleazy Back Alley`,
    ];
  }
  if (goal === "item") {
    return [
      $location`The Haunted Laundry Room`,
      $location`Whitey's Grove`,
      $location`The Icy Peak`,
      $location`Itznotyerzitz Mine`,
      $location`The Dark Heart of the Woods`,
      $location`The Hidden Temple`,
      $location`The Haunted Library`,
      $location`The Bat Hole Entrance`,
      $location`Noob Cave`,
    ];
  }
  if (goal === "init") {
    return [
      $location`The Feeding Chamber`,
      $location`An Unusually Quiet Barroom Brawl`,
      $location`Oil Peak`,
      $location`Cobb's Knob Kitchens`,
      $location`The VERY Unquiet Garves`,
      $location`The Haunted Kitchen`,
    ];
  }
  if (goal === "mp") {
    return [
      $location`The Upper Chamber`,
      $location`Inside the Palindome`,
      $location`A-Boo Peak`,
      $location`The Hippy Camp`,
      $location`Megalo-City`,
      $location`Shadow Rift`,
      $location`Vanya's Castle`,
      $location`The Hatching Chamber`,
      $location`Wartime Hippy Camp (Frat Disguise)`,
      $location`The Orcish Frat House`,
      $location`The Middle Chamber`,
      $location`The Black Forest`,
      $location`The Haunted Ballroom`,
      $location`The Red Zeppelin`,
      $location`The Hidden Park`,
      $location`Twin Peak`,
      $location`The Smut Orc Logging Camp`,
      $location`The Daily Dungeon`,
      $location`The Spooky Forest`,
    ];
  }
  if (goal === "spec") {
    //prismatic resistance
    return $locations`The Outskirts of Cobb's Knob`;
  }
  return [$location.none];
}

export function auto_getCitizenZone(loc: Location, inCombat: boolean): boolean {
  if (!auto_haveEagle()) return false;

  const eagle: Familiar = $familiar`Patriotic Eagle`;
  //zones are approximately organized by autoscend level quest structure
  const meatZones: Location[] = citizenZones("meat");
  const itemZones: Location[] = citizenZones("item");
  const initZones: Location[] = citizenZones("init");
  //mp zones are organized by 20-30 mp regen then 10-15 mp regen and then approximately autoscend level quest structure
  const mpZones: Location[] = citizenZones("mp");
  const specZones: Location[] = citizenZones("spec");
  activeCitZoneMod();
  let goal: string;

  if (!canAdventure(loc)) {
    return false;
  }
  //set goal for tracking
  if (
    specZones.includes(loc) &&
    SeptEmberCenser.auto_goingToMouthwashLevel() &&
    SeptEmberCenser.expected_level_after_mouthwash() < 13 &&
    turnsPlayed() === 0
  ) {
    //only want spec to get cold res for septEmberCenser usage and only if we don't get to L13. Don't want to do this outside of D1
    //ideally also have spring away or some other free run
    goal = "spec";
  } else if (meatZones.includes(loc)) {
    goal = "meat";
  } else if (itemZones.includes(loc)) {
    goal = "item";
  } else if (initZones.includes(loc)) {
    goal = "init";
  } else if (mpZones.includes(loc)) {
    goal = "mp";
  } else {
    //if for some reason we make it into the location getCitizenZone and it's not in any of the defined zones, get the item buff
    auto_log_debug(
      "Somehow we got here and don't actually want to use the Eagle",
    );
    return false;
  }
  if (!auto_citizenZonePrep(goal)) {
    return false;
  }

  function wantToFreeRun(): boolean {
    if (loc === solveDelayZone()) {
      return true;
    }
    return false;
  }
  if (!inCombat) {
    if (auto_haveEagle() && handleFamiliar$1(eagle)) {
      if (wantToFreeRun()) {
        set("auto_forceFreeRun", true);
      }
      if (!autoAdv(loc)) {
        auto_log_debug(
          `Attempted to get citizen of a zone buff for ${goal} goal however we failed.`,
        );
        return false;
      }
    }
  } else {
    handleTracker({
      what: "Citizen of a Zone",
      location: myLocation(),
      detail: goal,
      property: "auto_otherstuff",
    });
    return true;
  }
  return false;
}

export function auto_getCitizenZone$1(goal: string): boolean {
  if (!auto_haveEagle()) return false;

  const zones: Location[] = citizenZones(goal);

  if (!auto_citizenZonePrep(goal)) {
    return false;
  }

  for (const loc of zones) {
    if (!canAdventure(loc)) {
      continue;
    }
    return auto_getCitizenZone(loc, false);
  }
  return false;
}
