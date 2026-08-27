import {
  canEquip,
  equippedItem,
  itemAmount,
  myInebriety,
  myLocation,
  myMaxmp,
  myMp,
  useSkill,
} from "kolmafia";
import { $item, $location, $skill, $slot, get } from "libram";

import { spleen_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";
import { in_small } from "../../paths/2023/small";

export function canUseSweatpants(): boolean {
  if (
    possessEquipment($item`designer sweatpants`) &&
    canEquip($item`designer sweatpants`) &&
    auto_is_valid($item`designer sweatpants`)
  ) {
    return true;
  }
  return false;
}

export function getSweat(): number {
  return get("sweat");
}

export function sweatpantsPreAdventure(): void {
  if (!canUseSweatpants()) {
    return;
  }
  if (in_small()) {
    return; // small can't clean organs
  }

  if (
    myLocation() === $location`A Mob of Zeppelin Protesters` &&
    equippedItem($slot`pants`) !== $item`lynyrdskin breeches`
  ) {
    return; //want to keep all the sleaze damage bonus in this location
  }

  const sweat: number = getSweat();
  const liverCleaned: number = get("_sweatOutSomeBoozeUsed");

  if (sweat >= 25 && liverCleaned < 3 && myInebriety() > 0) {
    if (
      myLocation() === $location`The Haunted Billiards Room` &&
      myInebriety() <= 10
    ) {
      //want to keep inebriety for pool skill
    } else {
      useSkill($skill`Sweat Out Some Booze`);
    }
  }

  if (sweat >= 95) {
    if (
      get("auto_pvpEnable", false) &&
      spleen_left() >= 4 * (1 + itemAmount($item`sweat-ade`))
    ) {
      // Our player participates in PVP, let's give them a low-effort spleen item to end the day with, if there's still room.
      useSkill($skill`Make Sweat-Ade`);
    } else if (myMp() < myMaxmp()) {
      // This is just opportunistic use of sweat. This skill should be used in auto_restore.ash.
      useSkill($skill`Sip Some Sweat`);
    }
  }
}
