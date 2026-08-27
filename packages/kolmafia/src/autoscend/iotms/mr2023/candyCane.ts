import { availableAmount, itemAmount, Location, myLocation } from "kolmafia";
import { $item, $location, $locations, get } from "libram";

import { McHugeLarge } from "../../../types";
import { possessEquipment, possessOutfit } from "../../auto_equipment";
import { auto_can_equip } from "../../auto_util";
import { L10_needUmbrella } from "../../quests/level_10";

export function haveCCSC(): boolean {
  if (
    auto_can_equip($item`candy cane sword cane`) &&
    availableAmount($item`candy cane sword cane`) > 0
  ) {
    return true;
  }
  return false;
}

export function handleCCSC(): boolean {
  if (!haveCCSC()) {
    return false;
  }
  const place: Location = myLocation();
  /* Where/Why We Want Only Certain Locations
	 The Sleazy Back Alley - 11-leaf clover (only visit if we are a moxie class unlocking guild, but still potentially useful)
	 The Daily Dungeon - Eleven-foot pole replacement. +1 Fat Loot Token
	 The Shore, Inc. Travel Agency - 2 Scrips and all stats
	 The Defiled Cranny - -11 evilness
	 The eXtreme Slope - If we can't do ninja snowmen for some reason, gives us 2 pieces of equipment in one NC
	 The Penultimate Fantasy Airship - Get an umbrella for basement, only if we don't have one.
	 The Black Forest - +8 exploration
	 The Copperhead Club - Gives us a priceless diamond, saving 4950-5000 meat
	 The Hidden Apartment Building - +1 cursed level, Doesn't leave NC
	 The Hidden Bowling Alley - 1 less bowling ball needed
	 An Overgrown Shrine (Northeast) - Free Meat
	 A Mob of Zeppelin Protesters - Double Sleaze Protestors
	 Wartime Frat House/Camp - Skip non-useful NC to go to war start NC
	 */

  if (
    (place === $location`The Hidden Bowling Alley` &&
      itemAmount($item`bowling ball`) > 0 &&
      get("hiddenBowlingAlleyProgress") < 5 &&
      !get("candyCaneSwordBowlingAlley")) ||
    (place === $location`The Shore, Inc. Travel Agency` &&
      itemAmount($item`forged identification documents`) === 0 &&
      !get("candyCaneSwordShore")) ||
    (place === $location`The eXtreme Slope` &&
      !possessEquipment($item`eXtreme scarf`) &&
      !possessEquipment($item`snowboarder pants`) &&
      !McHugeLarge.haveMcHugeLargeSkis()) ||
    (place === $location`The Copperhead Club` &&
      itemAmount($item`priceless diamond`) === 0 &&
      itemAmount($item`Red Zeppelin ticket`) === 0 &&
      !get("candyCaneSwordCopperheadClub")) ||
    (place === $location`The Defiled Cranny` &&
      !get("candyCaneSwordDefiledCranny")) ||
    (place === $location`The Black Forest` &&
      !get("candyCaneSwordBlackForest")) ||
    (place === $location`The Hidden Apartment Building` &&
      !get("candyCaneSwordApartmentBuilding")) ||
    (place === $location`An Overgrown Shrine (Northeast)` &&
      !get("_candyCaneSwordOvergrownShrine") &&
      get("hiddenOfficeProgress") > 0) ||
    (place === $location`The Overgrown Lot` &&
      !get("_candyCaneSwordOvergrownLot")) ||
    (place === $location`The Penultimate Fantasy Airship` &&
      L10_needUmbrella()) ||
    (place === $location`Wartime Frat House` &&
      possessOutfit("War Hippy Fatigues")) ||
    (place === $location`Wartime Hippy Camp` &&
      possessOutfit("Frat Warrior Fatigues")) ||
    $locations`The Sleazy Back Alley, A Mob of Zeppelin Protesters, The Daily Dungeon`.includes(
      place,
    )
  ) {
    return true;
  }
  return false;
}

export function remainingCandyCaneSlashes(): number {
  if (!haveCCSC()) {
    return 0;
  }
  return 11 - get("_surprisinglySweetSlashUsed");
}
