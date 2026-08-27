import {
  containsText,
  equip,
  equippedAmount,
  equippedItem,
  haveEffect,
  haveEquipped,
  Item,
  Skill,
  toInt,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $skill, $slot, get, set } from "libram";

import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_log_error,
  handleTracker,
} from "../../auto_util";
import { maximizer } from "../../utils/maximizer";

export function auto_hasPowerfulGlove(): boolean {
  return (
    possessEquipment($item`Powerful Glove`) &&
    auto_is_valid($item`mint-in-box Powerful Glove`)
  );
}

export function auto_powerfulGloveCharges(): number {
  if (!auto_hasPowerfulGlove()) {
    return 0;
  }
  return 100 - get("_powerfulGloveBatteryPowerUsed");
}

function auto_powerfulGloveNoncombatSkill(sk: Skill): boolean {
  if (!auto_hasPowerfulGlove() || !auto_is_valid$2(sk)) {
    return false;
  }

  if (auto_powerfulGloveCharges() < 5) {
    return false;
  }

  let old: Item = $item.none;
  if (!haveEquipped($item`Powerful Glove`)) {
    old = equippedItem($slot`acc3`);
    equip($slot`acc3`, $item`Powerful Glove`);
  }

  const ret: boolean = useSkill(1, sk);

  if (old !== $item.none) {
    equip($slot`acc3`, old);
  }

  if (ret) {
    handleTracker({ what: sk, property: "auto_powerfulglove" });
  } else {
    // if we fail to cast a skill, odds are something has gone wrong with
    // mafia's tracking. Let's check to make sure, then make sure we stop
    // attempting to use more cheats in vain if so.
    const page: string = visitUrl("desc_item.php?whichitem=991142661");
    if (containsText(page, "The Glove's battery is fully depleted.")) {
      auto_log_error(
        "Mafia's Powerful Glove battery tracking was wrong, correcting.",
      );
      set("_powerfulGloveBatteryPowerUsed", 100);
    }
  }

  return ret;
}

// Returns if replaces are available, optionally only if the Powerful Glove is equipped
export function auto_powerfulGloveReplacesAvailable(inCombat: boolean): number {
  if (!auto_hasPowerfulGlove()) {
    return 0;
  }

  if (inCombat && !haveEquipped($item`Powerful Glove`)) {
    return 0;
  }

  return toInt(auto_powerfulGloveCharges() / 10);
}

// Returns if replaces are available if the Powerful Glove was equipped

export function auto_powerfulGloveNoncombat(): boolean {
  if (0 < haveEffect($effect`Invisible Avatar`)) {
    return false;
  }

  return auto_powerfulGloveNoncombatSkill($skill`CHEAT CODE: Invisible Avatar`);
}

export function auto_powerfulGloveStats(): boolean {
  return auto_powerfulGloveNoncombatSkill($skill`CHEAT CODE: Triple Size`);
}

function auto_willEquipPowerfulGlove(): boolean {
  return maximizer.willEquip($item`Powerful Glove`);
}

export function auto_forceEquipPowerfulGlove(): boolean {
  if (!auto_hasPowerfulGlove()) {
    return false;
  }

  if (auto_willEquipPowerfulGlove()) {
    return true;
  }

  return autoEquipToSlot($slot`acc3`, $item`Powerful Glove`);
}

export function auto_burnPowerfulGloveCharges(): void {
  while (
    auto_is_valid$2($skill`CHEAT CODE: Triple Size`) &&
    auto_hasPowerfulGlove() &&
    auto_powerfulGloveCharges() >= 5
  ) {
    if (equippedAmount($item`Powerful Glove`) === 0) {
      equip($item`Powerful Glove`); //equip it to prevent use command from doing 20 cycles of equip, use skill, unequip.
    }
    auto_powerfulGloveStats();
  }
}
