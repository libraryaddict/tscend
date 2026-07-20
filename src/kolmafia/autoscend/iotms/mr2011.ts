import {
  getRelated,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
} from "kolmafia";
import { $item, $items } from "libram";

import { canPull, pullXWhenHaveY } from "../auto_acquire";
import { auto_log_warning } from "../auto_util";

//	This is meant for items that have a date of 2011

//Defined in autoscend/iotms/mr2011.ash
export function isClipartItem(it: Item): boolean {
  return $items`Ur-Donut, The Bomb, box of Familiar Jacks, bucket of wine, ultrafondue, oversized snowflake, unbearable light, crystal skull, borrowed time, box of hammers, shining halo, furry halo, frosty halo, time halo, Lumineux Limnio, Morto Moreto, Temps Tempranillo, Bordeaux Marteaux, Fromage Pinotage, Beignet Milgranet, Muschat, cool jelly donut, shrapnel jelly donut, occult jelly donut, thyme jelly donut, frozen danish, smashed danish, forbidden danish, cool cat claw, blunt cat claw, shadowy cat claw, cheezburger, toasted brie, potion of the field gar, too legit potion, Bright Water, cold-filtered water, graveyard snowglobe, cool cat elixir, potion of the captain's hammer, potion of X-ray vision, potion of the litterbox, potion of animal rage, potion of punctual companionship, holy bomb\, batman, bobcat grenade, chocolate frosted sugar bomb, broken glass grenade, noxious gas grenade, skull with a fuse in it, boozebomb, 4:20 bomb, blunt icepick, fluorescent lightbulb, blammer, clock-cleaning hammer, hammerus, broken clock, dethklok, glacial clock`.includes(
    it,
  );
}

export function hasLegionKnife(): boolean {
  //checks if we have the [Loathing Legion knife] in any one of its foldable forms.
  if (!isUnrestricted($item`Loathing Legion knife`)) {
    //not auto_is_valid as some paths might restrict specific forms only
    return false;
  }
  if (inHardcore()) {
    return false; //LLK specifically does not work in hardcore.
  }
  //we need to check all possible forms it might be in
  for (const it of Item.get(
    Object.keys(getRelated($item`Loathing Legion knife`, "fold")),
  )) {
    if (itemAmount(it) > 0) {
      return true;
    }
  }
  return false;
}

export function pullLegionKnife(): boolean {
  //acquire the [Loathing Legion knife] if we do not already have it.
  if (!isUnrestricted($item`Loathing Legion knife`)) {
    //not auto_is_valid as some paths might restrict specific forms only
    return false;
  }
  if (inHardcore()) {
    return false; //loathing legion knife is not usable in hardcore
  }
  if (hasLegionKnife()) {
    return true; //already have it
  }
  let target: Item = Item.none;
  for (const it of Item.get(
    Object.keys(getRelated($item`Loathing Legion knife`, "fold")),
  )) {
    if (canPull(it)) {
      target = it;
      break;
    }
  }
  if (target === Item.none) {
    return false; //we do not have the item to pull
  }
  const start_amt: number = itemAmount(target);
  pullXWhenHaveY(target, 1, 0);
  if (itemAmount(target) === 1 + start_amt) {
    return true;
  }
  auto_log_warning(
    `Mysteriously failed to pull [${target}]. even though we should have been able to get it`,
    "red",
  );
  return false;
}
