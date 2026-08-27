import { isUnrestricted, Item, Skill, visitUrl } from "kolmafia";
import { $item, $skill, get, set } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid$2, wrap_item } from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";

function auto_saberChoice(choice: string): boolean {
  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (!isUnrestricted(saber)) {
    return false;
  }
  if (!possessEquipment(saber)) {
    return false;
  }
  if (get("_saberMod") !== 0) {
    return false;
  }

  let choiceNum: number = 5; // Maybe Later
  switch (choice) {
    case "mp regen":
    case "mp":
      choiceNum = 1;
      break;
    case "ml":
    case "monster level":
      choiceNum = 2;
      break;
    case "res":
    case "resistance":
      choiceNum = 3;
      break;
    case "fam":
    case "fam weight":
    case "familiar weight":
    case "weight":
      choiceNum = 4;
      break;
  }

  visitUrl("main.php?action=may4", false);
  visitUrl(`choice.php?pwd=&whichchoice=1386&option=${choiceNum}`);
  return true;
}

export function saberDailyUpgrade(day: number): boolean {
  if (isActuallyEd()) {
    return auto_saberChoice("mp");
  }
  // Maybe famweight is better, I don't know.
  if (in_plumber()) {
    return auto_saberChoice("res");
  }

  return auto_saberChoice("fam");
}

/* Out-of-combat Saber check: doesn't check that it's equipped
 */
export function saberChargesAvailable(): number {
  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (!isUnrestricted(saber)) {
    return 0;
  }
  if (!possessEquipment(saber)) {
    return 0;
  }
  if (!auto_is_valid$2($skill`Use the Force`)) {
    return 0; //if the combat skill is not valid it can not be used even if the saber itself is valid
  }
  return 5 - get("_saberForceUses");
}

export function combatSaberBanish(): Skill {
  set("choiceAdventure1387", 1);
  return $skill`Use the Force`;
}

export function combatSaberYR(): Skill {
  set("choiceAdventure1387", 3);
  return $skill`Use the Force`;
}
