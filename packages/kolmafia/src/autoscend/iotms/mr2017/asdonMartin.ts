import {
  ceil,
  cliExecute,
  create,
  Effect,
  fuelCost,
  getFuel,
  haveEffect,
  isUnrestricted,
  Item,
  itemAmount,
  max,
  min,
  myClass,
  myMeat,
  npcPrice,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $class, $effect, $effects, $item, $items, $skill, get } from "libram";

import {
  auto_get_campground,
  auto_is_valid,
  auto_log_info,
  isGeneralStoreAvailable,
  meatReserve,
} from "../../auto_util";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { inAftercore } from "../../paths/casual";

export function canAsdonBuff(goal: Effect): boolean {
  if (!auto_get_campground().has($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (!isUnrestricted($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (
    !$effects`Driving Intimidatingly, Driving Obnoxiously, Driving Observantly, Driving Quickly, Driving Recklessly, Driving Safely, Driving Stealthily, Driving Wastefully, Driving Waterproofly`.includes(
      goal,
    )
  ) {
    return false;
  }
  if (getFuel() < 37) {
    return false;
  }
  if ($effect`Driving Wastefully` === goal && get("oilPeakProgress") === 0.0) {
    return false;
  }
  if (haveEffect(goal) > 0) {
    return false;
  }
  return true;
}

export function asdonBuff(goal: Effect): boolean {
  if (!canAsdonBuff(goal)) {
    return false;
  }

  let needShrug: boolean = false;
  for (const eff of $effects`Driving Intimidatingly, Driving Obnoxiously, Driving Observantly, Driving Quickly, Driving Recklessly, Driving Safely, Driving Stealthily, Driving Wastefully, Driving Waterproofly`) {
    if (haveEffect(eff) > 0 && eff !== goal) {
      needShrug = true;
    }
  }

  if (needShrug) {
    visitUrl("campground.php?pwd=&preaction=undrive");
  }

  let effectNum: number = -1;
  switch (goal) {
    case $effect`Driving Intimidatingly`:
      effectNum = 6;
      break;
    case $effect`Driving Obnoxiously`:
      effectNum = 0;
      break;
    case $effect`Driving Observantly`:
      effectNum = 7;
      break;
    case $effect`Driving Quickly`:
      effectNum = 5;
      break;
    case $effect`Driving Recklessly`:
      effectNum = 4;
      break;
    case $effect`Driving Safely`:
      effectNum = 3;
      break;
    case $effect`Driving Stealthily`:
      effectNum = 1;
      break;
    case $effect`Driving Wastefully`:
      effectNum = 2;
      break;
    case $effect`Driving Waterproofly`:
      effectNum = 8;
      break;
  }
  visitUrl(`campground.php?pwd=&preaction=drive&whichdrive=${effectNum}`);

  return true;
}

export function asdonAutoFeed(goal: number = -1): boolean {
  if (myClass() === $class`Ed the Undying`) {
    return false;
  }
  if (!auto_get_campground().has($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (!isUnrestricted($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (getFuel() > 137) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }

  if (goal === -1) {
    goal = 137;
    if (get("_missileLauncherUsed")) {
      goal = 87;
    }
  }

  let didOnce: boolean = false;
  for (const it of $items`a little sump'm sump'm, ancient frozen dinner, antique packet of ketchup, backwoods screwdriver, bag of GORP, ballroom blintz, bean burrito, bilge wine, bottle of laundry sherry, bowl of cottage cheese, black forest ham, cactus fruit, CSA scoutmaster's "water", enchanted bean burrito, giant heirloom grape tomato, gin and tonic, haggis-wrapped haggis-stuffed haggis, ice-cold Willer, insanely spicy bean burrito, insanely spicy enchanted bean burrito, insanely spicy jumping bean burrito, jumping bean burrito, jungle floor wax, loaf of soda bread, margarita, McLeod's Hard Haggis-Ade, mimosette, Mornington crescent roll, open sauce, pink pony, roll in the hay, screwdriver, slap and tickle, slip 'n' slide, snifter of thoroughly aged brandy, spicy bean burrito, spicy enchanted bean burrito, spicy jumping bean burrito, stolen sushi, strawberry daiquiri, tequila sunrise, tequila sunset, Typical Tavern swill, vodka and tonic, water purification pills, zmobie`) {
    if (itemAmount(it) > 0) {
      let toFeed: number = min(10, itemAmount(it));
      if (get("auto_ashtonLimit") !== "") {
        const limit: number = toInt(get("auto_ashtonLimit"));
        toFeed = max(0, toFeed - limit);
      }
      asdonFeed(it, toFeed);
      didOnce = true;
    }
    if (getFuel() > goal) {
      break;
    }
  }

  const meat_cutoff: number = max(3500, 2000 + meatReserve());
  const can_buy_dough: boolean = npcPrice($item`wad of dough`) > 0;
  const can_buy_flower: boolean =
    npcPrice($item`all-purpose flower`) > 0 &&
    auto_is_valid($item`all-purpose flower`);
  //Dough prices: Madeline's Baking Supply is 40. other stores 50. flower ~50 meat per dough in batches of ~40.
  //only use flower if direct buying of dough is not available.
  if (
    getFuel() < goal &&
    myMeat() > meat_cutoff &&
    isGeneralStoreAvailable() &&
    !in_koe() &&
    can_buy_flower &&
    !can_buy_dough
  ) {
    let want: number = (goal + 5 - getFuel()) / 6;
    want = min(3 + (myMeat() - meat_cutoff) / 1000, want);
    if (want > 0) {
      //flower drops 35 to 45 wads of dough per use. safeguard against inf loop. assume worst drop to let it run enough times.
      const loop_count: number = ceil(want / 35);
      for (
        let i = 1,
          _last_2 = loop_count,
          _step_2 = 1,
          _up_2 = i <= _last_2,
          _inc_2 = _up_2 ? Math.abs(_step_2) : -Math.abs(_step_2);
        _up_2 ? i <= _last_2 : i >= _last_2;
        i += _inc_2
      ) {
        if (myMeat() > meat_cutoff && itemAmount($item`wad of dough`) < want) {
          use(1, $item`all-purpose flower`); //mafia will automatically buy it first
        }
      }
      want = min(want, itemAmount($item`wad of dough`));
      create(want, $item`loaf of soda bread`);
      asdonFeed($item`loaf of soda bread`, want);
      didOnce = true;
    }
  }

  if (
    getFuel() < goal &&
    myMeat() > meat_cutoff &&
    can_buy_dough &&
    isGeneralStoreAvailable() &&
    !in_koe()
  ) {
    const can_buy: number =
      (myMeat() - meat_cutoff) / npcPrice($item`wad of dough`);
    let want: number = (goal + 5 - getFuel()) / 6;
    want = min(want, can_buy);
    if (want > 0) {
      create(want, $item`loaf of soda bread`);
      asdonFeed($item`loaf of soda bread`, want);
      didOnce = true;
    }
  }

  if (didOnce) {
    cliExecute("refresh inv");
  }

  return getFuel() >= goal;
}

function asdonFeed(it: Item, qty: number): boolean {
  if (!auto_get_campground().has($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (!isUnrestricted($item`Asdon Martin keyfob (on ring)`)) {
    return false;
  }
  if (qty < 1 || itemAmount(it) < qty) {
    return false;
  }

  const oldFuel: number = getFuel();
  visitUrl(
    `campground.php?pwd=&action=fuelconvertor&qty=${qty}&iid=${toInt(it)}`,
  );
  const newFuel: number = getFuel();

  auto_log_info(
    `Compressed ${qty} ${it} into sheep, I mean fuel: ${oldFuel} --> ${newFuel}`,
    "green",
  );
  return true;
}

export function asdonCanMissile(): boolean {
  return (
    auto_get_campground().has($item`Asdon Martin keyfob (on ring)`) &&
    getFuel() >= fuelCost($skill`Asdon Martin: Missile Launcher`) &&
    !get("_missileLauncherUsed")
  );
}
