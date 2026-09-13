import { create, itemAmount, storageAmount, toLowerCase } from "kolmafia";
import { $item } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { pullXWhenHaveY } from "../../helpers/auto_acquire";
import { auto_is_valid } from "../../utils/auto_util";
import { auto_inPath } from "../../utils/kolmafiaUtils";

//Defined in autoscend/paths/heavy_rains.ash
export function in_iluh(): boolean {
  return auto_inPath("11 Things I Hate About U");
}

export function iluh_foodConsumable(str: string): boolean {
  if (!in_iluh()) {
    return true;
  }

  const foodConsume: string = toLowerCase(str);
  //Not actually going to ever be consumed but need this exception to actually make it for the Palindome quest
  if (
    foodConsume.includes("stunt nut") ||
    foodConsume.includes("wet stew") ||
    foodConsume.includes("wet stunt nut stew")
  ) {
    return true;
  }
  //can't consume anything with a u in it. Must have an i in it
  if (foodConsume.includes("u")) {
    return false;
  }
  if (foodConsume.includes("i")) {
    return true;
  }

  return false;
}

export function iluh_famAllowed(fam: string): boolean {
  if (!in_iluh()) {
    return true;
  }
  //Is there an acceptable number of u's? Familiars with u's in name deal 10-20 sleaze damage per U each round
  if (toLowerCase(fam).includes("u")) {
    return false;
  }
  return true;
}

export function iluh_buyEquiq(): void {
  if (!in_iluh()) {
    return;
  }

  if (
    itemAmount($item`mini kiwi`) >= 4 &&
    !possessEquipment($item`mini kiwi whipping stick`)
  ) {
    create(1, $item`mini kiwi whipping stick`);
  }
  if (
    itemAmount($item`mini kiwi`) >= 3 &&
    !possessEquipment($item`mini kiwi invisible dirigible`)
  ) {
    create(1, $item`mini kiwi invisible dirigible`);
  }
  return;
}

export function iluh_pulls(): void {
  if (!in_iluh()) {
    return;
  }

  if (
    storageAmount($item`mini kiwi whipping stick`) > 0 &&
    auto_is_valid($item`mini kiwi whipping stick`)
  ) {
    pullXWhenHaveY($item`mini kiwi whipping stick`, 1, 0);
  }
  if (
    storageAmount($item`mini kiwi bikini`) > 0 &&
    auto_is_valid($item`mini kiwi bikini`)
  ) {
    pullXWhenHaveY($item`mini kiwi bikini`, 1, 0);
  }
  if (
    storageAmount($item`mini kiwi invisible dirigible`) > 0 &&
    auto_is_valid($item`mini kiwi invisible dirigible`)
  ) {
    pullXWhenHaveY($item`mini kiwi invisible dirigible`, 1, 0);
  }
}
