import {
  cliExecute,
  containsText,
  Familiar,
  itemAmount,
  myFamiliar,
  myPrimestat,
  toLowerCase,
  useFamiliar,
} from "kolmafia";
import { $item, get } from "libram";

import {
  canChangeFamiliar,
  canChangeToFamiliar,
  lookupFamiliarDatafile,
  pathHasFamiliar,
} from "../../auto_familiar";
import { auto_is_valid } from "../../auto_util";

//	This is meant for items that have a date of 2017.

function auto_hasMummingTrunk(): boolean {
  if (
    !pathHasFamiliar() ||
    itemAmount($item`mumming trunk`) === 0 ||
    !auto_is_valid($item`mumming trunk`)
  ) {
    return false;
  }
  return true;
}

//Defined in autoscend/iotms/mr2017.ash
export function auto_checkFamiliarMummery(fam: Familiar): boolean {
  if (containsText(get("_mummeryMods"), fam.toString())) {
    return false;
  }
  return true;
}

function mummifyFamiliar(fam: Familiar, bonus: string): boolean {
  if (
    !canChangeToFamiliar(fam) ||
    !auto_hasMummingTrunk() ||
    !auto_checkFamiliarMummery(fam)
  ) {
    return false;
  }

  bonus = toLowerCase(bonus);
  // I don't want to alter CS behaviour so I'm leaving a couple things in that are otherwise irrelevant.
  const last: Familiar = myFamiliar();
  let goal: number;

  switch (bonus) {
    case "1":
    case "meat":
      goal = 1;
      break;
    case "2":
    case "mp":
    case "mp regen":
    case "mpregen":
      goal = 2;
      break;
    case "3":
    case "mus":
    case "muscle":
      goal = 3;
      break;
    case "4":
    case "item":
      goal = 4;
      break;
    case "5":
    case "mysticality":
    case "myst":
      goal = 5;
      break;
    case "6":
    case "hp":
    case "hp regen":
    case "hpregen":
      goal = 6;
      break;
    case "7":
    case "mox":
    case "moxie":
      goal = 7;
      break;
    default:
      return false;
  }

  if (
    containsText(get("_mummeryUses"), goal.toString()) ||
    goal < 1 ||
    goal >= 8
  ) {
    return false;
  }
  // CS will use this.
  if (canChangeFamiliar()) {
    useFamiliar(fam);
  }

  cliExecute(`mummery ${goal}`);
  // CS will use this.
  if (myFamiliar() !== last && canChangeFamiliar()) {
    useFamiliar(last);
  }

  return true;
}

// Will provide the appropriate bonus to an arbitrary familiar.
export function mummifyFamiliar$2(fam: Familiar = myFamiliar()): boolean {
  if (!auto_hasMummingTrunk() || !auto_checkFamiliarMummery(fam)) {
    return false;
  }

  let targetBonus: string = "";

  switch (myFamiliar()) {
    case lookupFamiliarDatafile("meat"):
      targetBonus = "meat";
      break;
    case lookupFamiliarDatafile("item"):
      targetBonus = "item";
      break;
    case lookupFamiliarDatafile("gremlins"):
      targetBonus = "hp";
      break;
    case lookupFamiliarDatafile("regen"):
      targetBonus = "mp";
      break;
    case lookupFamiliarDatafile("stat"):
      targetBonus = myPrimestat().toString();
      break;
  }
  return mummifyFamiliar(fam, targetBonus);
}
