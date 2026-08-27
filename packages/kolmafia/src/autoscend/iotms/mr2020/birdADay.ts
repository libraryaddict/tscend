import { itemAmount, numericModifier, use } from "kolmafia";
import { $effect, $item, $skill, get } from "libram";

import { auto_have_skill, auto_is_valid, auto_log_info } from "../../auto_util";

// This is meant for items that have a date of 2020

//Defined in autoscend/iotms/mr2020.ash
function auto_haveBirdADayCalendar(): boolean {
  return (
    itemAmount($item`Bird-a-Day calendar`) > 0 &&
    auto_is_valid($item`Bird-a-Day calendar`)
  );
}

export function auto_birdOfTheDay(): boolean {
  if (auto_haveBirdADayCalendar() && get("_birdOfTheDay") === "") {
    auto_log_info("What a beautiful morning! What's today's bird?");
    return use(1, $item`Bird-a-Day calendar`);
  }
  return false;
}

function auto_birdIsValid(): boolean {
  // can't seek a bird if you can't use or don't own the calendar
  if (!auto_haveBirdADayCalendar()) {
    return false;
  }
  // don't want to overwrite favorite bird automatically
  // however, if they already overwrote favorite bird manually today
  // and we somehow have enough mp to continue casting
  // it might as well be an option
  // hence===0 and not <= 0
  if (auto_birdsLeftToday() === 0) {
    return false;
  }

  if (!get("_canSeekBirds")) {
    use(1, $item`Bird-a-Day calendar`);
  }

  return true;
}

export function auto_birdModifier(mod: string): number {
  if (!auto_birdIsValid()) {
    return 0;
  }

  return numericModifier($effect`Blessing of the Bird`, mod);
}

export function auto_favoriteBirdModifier(mod: string): number {
  return numericModifier($effect`Blessing of your favorite Bird`, mod);
}

function auto_birdsSought(): number {
  return get("_birdsSoughtToday");
}

function auto_birdsLeftToday(): number {
  return 6 - auto_birdsSought();
}

export function auto_birdCanSeek(): boolean {
  if (!auto_birdIsValid()) {
    return false;
  }

  return auto_have_skill($skill`Seek out a Bird`);
}

export function auto_favoriteBirdCanSeek(): boolean {
  // can't seek out your favorite if you already did today
  if (get("_favoriteBirdVisited")) {
    return false;
  }

  return auto_have_skill($skill`Visit your Favorite Bird`);
}
