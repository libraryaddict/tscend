import {
  cliExecute,
  equip,
  equippedItem,
  haveFamiliar,
  indexOf,
  isUnrestricted,
  itemAmount,
  myAscensions,
  myFullness,
  myHash,
  myInebriety,
  myPrimestat,
  mySign,
  Skill,
  Slot,
  toLowerCase,
  userConfirm,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $item,
  $skill,
  $slot,
  $slots,
  $stat,
  get,
  set,
} from "libram";

import { auto_buyUpTo } from "../../auto_acquire";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_abort,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$1,
  auto_is_valid$2,
  auto_log_info,
  auto_log_warning,
  inCanadiaSign,
  inGnomeSign,
  inKnollSign,
  isDesertAvailable,
} from "../../auto_util";
import { in_lowkeysummer } from "../../paths/2020/low_key_summer";
import { cyrptEvilBonus } from "../../quests/level_07";

export function spoonCombatSkill(): Skill {
  switch (myPrimestat()) {
    case $stat`Muscle`:
      return $skill`Dragoon Platoon`;
    case $stat`Mysticality`:
      return $skill`Spittoon Monsoon`;
    case $stat`Moxie`:
      return $skill`Festoon Buffoon`;
    default:
      auto_abort("Invalid mainstat, what?");
      return $skill.none; // needed or mafia complains about missing return value
  }
}

function auto_spoonGetDesiredSign(): string {
  const spoonsign: string = toLowerCase(get("auto_spoonsign"));

  function statSign(musc: string, myst: string, mox: string): string {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        return musc;
      case $stat`Mysticality`:
        return myst;
      case $stat`Moxie`:
        return mox;
      default:
        auto_abort("Invalid mainstat, what?");
        return "butts"; // needed or mafia complains about missing return value
    }
  }
  // coerce spoonsign to be one of the nine signs, instead of shorthands
  switch (spoonsign) {
    case "knoll":
      return statSign("mongoose", "wallaby", "vole");
    case "canadia":
      return statSign("platypus", "opossum", "marmot");
    case "gnomad":
      return statSign("wombat", "blender", "packrat");
    case "mongoose":
    case "wallaby":
    case "vole":
    case "platypus":
    case "opossum":
    case "marmot":
    case "wombat":
    case "blender":
    case "packrat":
      return spoonsign;
    case "clover":
      // a couple extra alternate labels
      return "marmot";
    case "famweight":
    case "weight":
    case "familiar weight":
    case "familiar":
    case "fam":
      return "platypus";
    case "food":
      return "opossum";
    case "booze":
      return "blender";
    default:
      // spoonsign is invalid or none/false/whatever to say don't do this
      return "";
  }
}

export function spoonTuneConfirm(): void {
  if (
    !possessEquipment($item`hewn moon-rune spoon`) ||
    !auto_is_valid($item`hewn moon-rune spoon`)
  ) {
    // couldn't change signs if we wanted to
    return;
  }

  if (get("auto_spoonconfirmed", 0) === myAscensions()) {
    return;
  }

  const spoonsign: string = auto_spoonGetDesiredSign();
  if (spoonsign === "") {
    // the user doesn't want to change signs
    return;
  }

  if (
    userConfirm(
      `You're currently set to change signs to ${spoonsign} after wrapping up your business in your current sign. Do you want to interrupt the script to go change that? Will default to 'No' in 15 seconds.`,
      15000,
      false,
    )
  ) {
    auto_abort(
      "Alright, please go change auto_spoonsign via the autoscend relay script and then rerun.",
    );
  } else {
    set("auto_spoonconfirmed", myAscensions());
  }
}

function auto_spoonReadyToTuneMoon(): boolean {
  if (
    !possessEquipment($item`hewn moon-rune spoon`) ||
    !auto_is_valid($item`hewn moon-rune spoon`)
  ) {
    // need a valid spoon to change moon signs
    return false;
  }

  const currsign: string = toLowerCase(mySign());
  const spoonsign: string = auto_spoonGetDesiredSign();

  if (spoonsign === "") {
    // the user doesn't want to change signs automatically
    return false;
  }

  if (spoonsign === currsign) {
    // we'd just be changing to the same sign, so do nothing
    return false;
  }

  const toKnoll: boolean = ["mongoose", "wallaby", "vole"].includes(spoonsign);
  const toCanadia: boolean = ["platypus", "opossum", "marmot"].includes(
    spoonsign,
  );
  const toGnomad: boolean = ["wombat", "blender", "packrat"].includes(
    spoonsign,
  );

  if (!toKnoll && !toCanadia && !toGnomad) {
    auto_abort(
      "Something weird is going on with auto_spoonsign. It's not an invalid/blank value, but also not a knoll, canadia, or gnomad sign? This is impossible.",
    );
  }

  if (
    mySign() === "Vole" &&
    (get("cyrptAlcoveEvilness") > 14 + cyrptEvilBonus() ||
      get("questL07Cyrptic") === "unstarted")
  ) {
    // we want to stay vole long enough to do the alcove, since the initiative helps
    return false;
  }

  if (inKnollSign() && !toKnoll) {
    if (get("questM01Untinker") !== "finished") {
      // just finish the untinker quest if we can, it's free.
      visitUrl(
        "place.php?whichplace=forestvillage&preaction=screwquest&action=fv_untinker_quest",
      );
      visitUrl("place.php?whichplace=knoll_friendly&action=dk_innabox");
      visitUrl("place.php?whichplace=forestvillage&action=fv_untinker");
    }
    if (!isDesertAvailable()) {
      // we want to get the meatcar via the knoll store
      return false;
    }
    if (
      (auto_get_campground().has($item`Asdon Martin keyfob (on ring)`) &&
        isUnrestricted($item`Asdon Martin keyfob (on ring)`)) ||
      (auto_is_valid$1($familiar`Cookbookbat`) &&
        haveFamiliar($familiar`Cookbookbat`))
    ) {
      // we want to get the bugbear outfit before switching away for easy bread access
      if (
        !auto_buyUpTo(1, $item`bugbear beanie`) ||
        !auto_buyUpTo(1, $item`bugbear bungguard`)
      ) {
        return false;
      }
    }
    // We want the frilly skirt in LKS
    if (in_lowkeysummer()) {
      if (!auto_buyUpTo(1, $item`frilly skirt`)) {
        return false;
      }
    }
  }

  if (
    inCanadiaSign() &&
    !toCanadia &&
    itemAmount($item`logging hatchet`) === 0
  ) {
    // want to make sure we've grabbed the logging hatchet before switching away from canadia
    return false;
  }

  if (
    inGnomeSign() &&
    !toGnomad &&
    auto_is_valid$2($skill`Torso Awareness`) &&
    !auto_have_skill($skill`Torso Awareness`)
  ) {
    // we want to know about our torso before swapping away from gnomad signs
    return false;
  }

  if (currsign === "opossum" && myFullness() === 0) {
    // we want to eat something before swapping away from opossum
    return false;
  }

  if (currsign === "blender" && myInebriety() === 0) {
    // we want to drink something before swapping away from blender
    return false;
  }

  return true;
}

export function spoonTuneMoon(): boolean {
  if (!auto_spoonReadyToTuneMoon()) {
    return false;
  }

  let wasspoon: Slot = $slot.none;
  for (const sl of $slots`acc1, acc2, acc3`) {
    if (equippedItem(sl) === $item`hewn moon-rune spoon`) {
      equip(sl, $item.none);
      wasspoon = sl;
      break;
    }
  }

  const spoonsign: string = auto_spoonGetDesiredSign();
  let signnum: number = 0;
  for (const sign of [
    "mongoose",
    "wallaby",
    "vole",
    "platypus",
    "opossum",
    "marmot",
    "wombat",
    "blender",
    "packrat",
  ]) {
    ++signnum;
    if (sign === spoonsign) {
      break;
    }
  }

  const res: string = visitUrl(`inv_use.php?whichitem=10254&pwd=${myHash()}`);
  const cantune: boolean =
    indexOf(
      res,
      "You can't figure out the angle to see the moon's reflection in the spoon anymore.",
    ) === -1;
  if (cantune) {
    auto_log_info(`Changing signs to ${spoonsign}, sign #${signnum}`, "blue");
    visitUrl(
      `inv_use.php?whichitem=10254&pwd&doit=96&whichsign=${signnum}`,
      true,
    );
    cliExecute("refresh all");
  } else {
    auto_log_warning(
      `Tried to change signs to ${spoonsign}, but moon has already been tuned`,
      "red",
    );
  }

  if (wasspoon !== $slot.none) {
    equip(wasspoon, $item`hewn moon-rune spoon`);
  }

  return cantune;
}
