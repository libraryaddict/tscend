import { equip, equippedItem, Item, toLowerCase, visitUrl } from "kolmafia";
import { $item, $slot, get } from "libram";

import { possessEquipment } from "../../auto_equipment";

export function adjustEdHat(goal: string): boolean {
  if (!possessEquipment($item`The Crown of Ed the Undying`)) {
    return false;
  }
  let option: number = -1;
  goal = toLowerCase(goal);
  if ((goal === "muscle" || goal === "bear") && get("edPiece") !== "bear") {
    option = 1;
  } else if (
    (goal === "myst" || goal === "mysticality" || goal === "owl") &&
    get("edPiece") !== "owl"
  ) {
    option = 2;
  } else if (
    (goal === "moxie" || goal === "puma") &&
    get("edPiece") !== "puma"
  ) {
    option = 3;
  } else if (
    (goal === "ml" || goal === "hyena") &&
    get("edPiece") !== "hyena"
  ) {
    option = 4;
  } else if (
    (goal === "meat" ||
      goal === "item" ||
      goal === "items" ||
      goal === "drops" ||
      goal === "mouse") &&
    get("edPiece") !== "mouse"
  ) {
    option = 5;
  } else if (
    (goal === "regen" ||
      goal === "regenerate" ||
      goal === "miss" ||
      goal === "dodge" ||
      goal === "weasel") &&
    get("edPiece") !== "weasel"
  ) {
    option = 6;
  } else if (
    (goal === "breathe" || goal === "underwater" || goal === "fish") &&
    get("edPiece") !== "fish"
  ) {
    option = 7;
  }

  const oldHat: Item = equippedItem($slot`hat`);

  if (option !== -1) {
    if (oldHat !== $item`The Crown of Ed the Undying`) {
      equip($slot`hat`, $item`The Crown of Ed the Undying`);
    }
    visitUrl("inventory.php?action=activateedhat");
    visitUrl(`choice.php?pwd=&whichchoice=1063&option=${option}`, true);
    if (oldHat !== $item`The Crown of Ed the Undying`) {
      equip($slot`hat`, oldHat);
    }
    return true;
  }
  return false;
}
