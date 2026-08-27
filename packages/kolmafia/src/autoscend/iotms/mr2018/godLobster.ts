import {
  availableAmount,
  equip,
  equippedItem,
  Item,
  useFamiliar,
} from "kolmafia";
import { $familiar, $item, $location, $slot, get, set } from "libram";

import { autoAdvBypass$1, CombatMacro } from "../../auto_adventure";
import { canChangeToFamiliar, handleFamiliar$1 } from "../../auto_familiar";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";

export function godLobsterFightsRemaining(): number {
  return 3 - get("_godLobsterFights");
}

export function godLobsterCombat(
  it: Item = $item.none,
  goal: number = 3,
  option?: CombatMacro,
): boolean {
  // it = equipment we want the God Lobster to wear
  // goal = option we want to select in the post-combat choice
  if (!canChangeToFamiliar($familiar`God Lobster`)) {
    return false;
  }
  if (goal < 1 || goal > 3) {
    return false;
  }
  if (get("_godLobsterFights") >= 3) {
    return false;
  }
  if (it !== $item.none && availableAmount(it) === 0) {
    return false;
  }
  if (goal === 1 && it === $item`God Lobster's Crown`) {
    return false;
  }

  if (!in_quantumTerrarium()) {
    handleFamiliar$1($familiar`God Lobster`);
    useFamiliar($familiar`God Lobster`);
  }

  if (equippedItem($slot`familiar`) !== it && it !== $item.none) {
    equip($slot`familiar`, it);
  }

  set("_auto_lobsterChoice", goal);
  return autoAdvBypass$1(
    "main.php?fightgodlobster=1",
    $location`Noob Cave`,
    option,
  );
}
