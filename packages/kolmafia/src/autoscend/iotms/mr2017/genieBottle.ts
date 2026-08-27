import {
  containsText,
  Effect,
  haveEffect,
  Item,
  itemAmount,
  Monster,
  myAdventures,
  myHash,
  myLocation,
  toInt,
  toItem,
  toLowerCase,
  visitUrl,
} from "kolmafia";
import { $item, $location, $monsters, get } from "libram";

import { autoAdvBypass, CombatMacro } from "../../auto_adventure";
import {
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  wrap_item,
} from "../../auto_util";
import { glover_usable$1 } from "../../paths/2018/g_lover";

export function auto_haveGenieBottleOrPocketWishes(): boolean {
  const bottle: Item = wrap_item($item`genie bottle`);
  return (
    (itemAmount(bottle) > 0 && auto_is_valid(bottle)) ||
    (itemAmount($item`pocket wish`) > 0 && auto_is_valid($item`pocket wish`))
  );
}

export function auto_wishesAvailable(): number {
  let wishes: number = 0;
  const bottle: Item = wrap_item($item`genie bottle`);
  if (itemAmount(bottle) > 0 && auto_is_valid(bottle)) {
    wishes += 3 - get("_genieWishesUsed");
  }
  if (auto_is_valid($item`pocket wish`)) {
    wishes += itemAmount($item`pocket wish`);
  }
  return wishes;
}

export function makeGenieWish(wish: string): boolean {
  const starting_wishes: number = auto_wishesAvailable();
  if (starting_wishes < 1) {
    return false;
  }

  let wish_provider: number = 0;
  const bottle: Item = wrap_item($item`genie bottle`);
  if (
    auto_is_valid(bottle) &&
    itemAmount(bottle) > 0 &&
    get("_genieWishesUsed") < 3
  ) {
    wish_provider = toInt(bottle);
  } else if (
    itemAmount($item`pocket wish`) > 0 &&
    auto_is_valid($item`pocket wish`)
  ) {
    wish_provider = toInt($item`pocket wish`);
  }
  if (wish_provider === 0) {
    auto_log_warning(
      "auto_wishesAvailable() thinks I have remaining wishes but makeGenieWish(string wish) was unable to find a valid source for them. wishing failed",
      "red",
    );
    return false;
  }

  visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${wish_provider}`,
    false,
  );
  visitUrl(`choice.php?pwd=&whichchoice=1267&option=1&wish=${wish}`);

  if (auto_wishesAvailable() === starting_wishes) {
    auto_log_warning(`Wish: '${wish}' failed`, "red");
    return false;
  }

  handleTracker({
    what: toItem(wish_provider),
    location: myLocation(),
    detail: wish,
    property: "auto_wishes",
  });
  return true;
}

export function makeGenieWish$1(eff: Effect): boolean {
  if (haveEffect(eff) > 0) {
    return false;
  }
  if (myAdventures() === 0) {
    return false;
  }
  if (!glover_usable$1(eff)) {
    //check if we are in glover and if the effect works in glover. as you can get nonfunctional effects
    return false;
  }

  return makeGenieWish(`to be ${eff}`) || haveEffect(eff) > 0;
}

// Track any failed wishes this run
const failedWishMonsters: Monster[] = [];

export function canGenieCombat(mon: Monster): boolean {
  if (!mon.wishable) {
    return false;
  }

  const bottle: Item = wrap_item($item`genie bottle`);
  const haveBottle: boolean = itemAmount(bottle) > 0;
  const bottleWishesLeft: boolean = get("_genieWishesUsed") < 3;
  const canUseBottle: boolean =
    haveBottle && bottleWishesLeft && auto_is_valid(bottle);
  const havePocket: boolean = itemAmount($item`pocket wish`) > 0;
  const canUsePocket: boolean = havePocket && auto_is_valid($item`pocket wish`);
  if (!canUseBottle && !canUsePocket) {
    return false;
  }
  if (get("_genieFightsUsed") >= 3) {
    return false; // max 3 fights per day
  }
  if (myAdventures() === 0) {
    return false; // cannot fight if no adv remaining
  }
  const attr: string = toLowerCase(mon.attributes);
  if (containsText(attr, "nocopy") || containsText(attr, "boss")) {
    return false;
  }
  // Per wiki page these can't be wished. Didn't bother to add other crypt monsters as we don't summon them
  // https://kol.coldfront.net/thekolwiki/index.php/Rubbed_it_the_Right_Way
  if ($monsters`fantasy bandit, modern zmobie`.includes(mon)) {
    return false;
  }
  if (failedWishMonsters.includes(mon)) {
    return false;
  }
  return true;
}

export function makeGenieCombat(mon: Monster, option?: CombatMacro): boolean {
  if (!canGenieCombat(mon)) {
    return false;
  }

  auto_log_info(`Using genie to summon ${mon.name}`, "blue");
  const wish: string = `to fight a ${mon}`;
  const prev_genieFightsUsed: number = get("_genieFightsUsed");
  const pages: Map<number, string> = new Map();
  const bottle: Item = wrap_item($item`genie bottle`);
  let wish_provider: number = toInt(bottle);
  if (itemAmount($item`pocket wish`) > 0 && auto_is_valid($item`pocket wish`)) {
    wish_provider = toInt($item`pocket wish`);
  }
  pages.set(
    0,
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${wish_provider}`,
  ); //false
  pages.set(
    1,
    `choice.php?pwd=${myHash()}&whichchoice=1267&option=1&wish=${wish}`,
  );
  pages.set(2, "main.php");

  autoAdvBypass(5, pages, $location`Noob Cave`, option);

  if (prev_genieFightsUsed === get("_genieFightsUsed")) {
    failedWishMonsters.push(mon);
    auto_log_warning(`Wish: '${wish}' failed`, "red");
    return false;
  }
  handleTracker({
    what: mon,
    detail: toItem(wish_provider).toString(),
    property: "auto_copies",
  });
  handleTracker({
    what: toItem(wish_provider),
    location: myLocation(),
    detail: wish,
    property: "auto_wishes",
  });
  return true;
}

export function makeGeniePocket(): boolean {
  const bottle: Item = wrap_item($item`genie bottle`);
  if (itemAmount(bottle) === 0) {
    return false;
  }
  if (get("_genieWishesUsed") >= 3) {
    return false;
  }

  const count_1: number = itemAmount($item`pocket wish`);

  const wish: string = "for more wishes";
  visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${toInt(bottle)}`,
    false,
  );
  visitUrl(`choice.php?pwd=${myHash()}&whichchoice=1267&option=1&wish=${wish}`);

  if (count_1 === itemAmount($item`pocket wish`)) {
    return false;
  }

  handleTracker({
    what: bottle,
    detail: "for more wishes",
    property: "auto_wishes",
  });
  return true;
}
