import {
  containsText,
  isUnrestricted,
  Location,
  myPrimestat,
  splitString,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, $location, $slot, $stat, get } from "libram";

import { autoAdv } from "../../auto_adventure";
import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import { is100FamRun } from "../../auto_familiar";
import { in_avantGuard } from "../../paths/2024/avant_guard";

export function fantasyRealmAvailable(): boolean {
  if (!isUnrestricted($item`FantasyRealm membership packet`)) {
    return false;
  }
  if (get("frAlways") || get("_frToday")) {
    return true;
  }
  return false;
}

export function fantasyBanditsFought(): number {
  if (containsText(get("_frMonstersKilled"), "fantasy bandit")) {
    for (const [, it] of splitString(get("_frMonstersKilled"), ",").entries()) {
      if (containsText(it, "fantasy bandit")) {
        const count_1: number = toInt((splitString(it, ":")[1] ??= ""));
        return count_1;
      }
    }
  }
  return 0;
}

export function acquiredFantasyRealmToken(): boolean {
  return fantasyBanditsFought() >= 5;
}

export function fantasyRealmToken(): boolean {
  if (!isUnrestricted($item`FantasyRealm membership packet`)) {
    return false;
  }

  if (acquiredFantasyRealmToken()) {
    return false;
  }

  if (
    (get("frAlways") || get("_frToday")) &&
    !possessEquipment($item`FantasyRealm G. E. M.`)
  ) {
    let option: number = 1;
    switch (myPrimestat()) {
      case $stat`Muscle`:
        option = 1;
        break;
      case $stat`Mysticality`:
        option = 2;
        break;
      case $stat`Moxie`:
        option = 3;
        break;
    }
    if (option === 1 && possessEquipment($item`FantasyRealm Warrior's Helm`)) {
      option = 2;
    }
    if (option === 2 && possessEquipment($item`FantasyRealm Mage's Hat`)) {
      option = 3;
    }
    if (option === 3 && possessEquipment($item`FantasyRealm Rogue's Mask`)) {
      option = 1;
    }
    visitUrl("place.php?whichplace=realm_fantasy&action=fr_initcenter", false);
    visitUrl(`choice.php?whichchoice=1280&pwd=&option=${option}`);
  }

  if (!possessEquipment($item`FantasyRealm G. E. M.`)) {
    return false;
  }
  // If we're not allowed to adventure without a familiar due to being in a 100% familiar run or Avant Guard
  if (is100FamRun() || in_avantGuard()) {
    return false;
  }

  if (possessEquipment($item`FantasyRealm G. E. M.`)) {
    autoEquipToSlot($slot`acc3`, $item`FantasyRealm G. E. M.`);
  }
  //This does not appear to check that we no longer need to adventure there...

  return autoAdv($location`The Bandit Crossroads`);
}

function allFantasyRealmLocations(): Location[] {
  return [
    $location`The Bandit Crossroads`,
    $location`The Cursed Village`,
    $location`The Evil Cathedral`,
    $location`The Archwizard's Tower`,
    $location`The Cursed Village Thieves' Guild`,
    $location`The Towering Mountains`,
    $location`The Foreboding Cave`,
    $location`The Lair of the Phoenix`,
    $location`The Old Rubee Mine`,
    $location`The Ogre Chieftain's Keep`,
    $location`The Master Thief's Chalet`,
    $location`The Mystic Wood`,
    $location`The Faerie Cyrkle`,
    $location`The Spider Queen's Lair`,
    $location`The Druidic Campsite`,
    $location`The Ley Nexus`,
    $location`The Putrid Swamp`,
    $location`Near the Witch's House`,
    $location`The Troll Fortress`,
    $location`The Dragon's Moor`,
    $location`The Sprawling Cemetery`,
    $location`The Labyrinthine Crypt`,
    $location`The Barrow Mounds`,
    $location`The Ghoul King's Catacomb`,
    $location`Duke Vampire's Chateau`,
  ];
}

export function isFantasyRealm(loc: Location): boolean {
  return allFantasyRealmLocations().includes(loc);
}
