import {
  currentRound,
  equip,
  equippedAmount,
  equippedItem,
  haveEquipped,
  Item,
  visitUrl,
  weaponHands,
} from "kolmafia";
import { $item, $skill, $slot, get } from "libram";

import {
  autoForceEquip,
  autoForceEquip$2,
  possessEquipment,
} from "../../auto_equipment";
import { auto_have_skill, auto_is_valid } from "../../auto_util";

export function auto_haveAprilShowerShield(): boolean {
  const shield: Item = $item`April Shower Thoughts shield`;
  return auto_is_valid(shield) && possessEquipment(shield);
}

export function auto_getGlobs(): boolean {
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  //if breakfast hasn't run yet or they haven't been manually collected
  if (!get("_aprilShowerGlobsCollected")) {
    visitUrl("inventory.php?action=shower");
    return true;
  }
  return false;
}

export function auto_equipAprilShieldBuff(): boolean {
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  //force equip the shield if this is called
  if (weaponHands(equippedItem($slot`weapon`)) > 1) {
    //if a 2 handed weapon is equipped, unequip it
    equip($item.none, $slot`weapon`);
  }
  return autoForceEquip$2($item`April Shower Thoughts shield`, true);
}

export function auto_unequipAprilShieldBuff(): boolean {
  //Because Empathy gets replaced by Thoughtful Empathy when cast with the Shield equipped,
  //we need to make sure this is unequipped if we want to have both Empathy and Thoughtful Empathy
  if (haveEquipped($item`April Shower Thoughts shield`)) {
    return autoForceEquip($slot`off-hand`, $item.none, true);
  }
  return true;
}

export function auto_canNorthernExplosionFE(): boolean {
  //Northern Explosion becomes Feel Envy-adjacent once per day
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  if (!auto_have_skill($skill`Northern Explosion`)) {
    return false;
  }
  if (get("_aprilShowerNorthernExplosion")) {
    return false;
  }
  if (
    currentRound() > 0 &&
    equippedAmount($item`April Shower Thoughts shield`) === 0
  ) {
    return false;
  }
  return true;
}
