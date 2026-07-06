import {
  abort,
  availableAmount,
  ceil,
  cliExecute,
  containsText,
  creatableAmount,
  create,
  eat,
  Effect,
  equip,
  equippedItem,
  getProperty,
  haveFamiliar,
  indexOf,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  max,
  min,
  myAdventures,
  myAscensions,
  myDaycount,
  myFamiliar,
  myFullness,
  myHash,
  myInebriety,
  myLevel,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  mySign,
  myTurncount,
  Phylum,
  removeProperty,
  setProperty,
  Skill,
  Slot,
  splitString,
  toBoolean,
  toFloat,
  toInt,
  toLowerCase,
  toPhylum,
  totalTurnsPlayed,
  userConfirm,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $phylum,
  $skill,
  $slots,
  $stat,
} from "libram";

import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv, CombatMacro } from "../auto_adventure";
import {
  canEat$1,
  consumptionProgress,
  spleen_left,
  stomach_left,
} from "../auto_consume";
import {
  addToMaximize,
  autoEquip$1,
  equipMaximizedGear,
  possessEquipment,
} from "../auto_equipment";
import { canChangeToFamiliar } from "../auto_familiar";
import {
  auto_burnMP,
  auto_can_equip,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$1,
  auto_is_valid$2,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  handleTracker$1,
  inCanadiaSign,
  inGnomeSign,
  inKnollSign,
  isDesertAvailable,
  loopHandlerDelayAll,
  meatReserve,
  wrap_item,
} from "../auto_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { cyrptEvilBonus$1 } from "../quests/level_07";

// This is meant for items that have a date of 2019

//Defined in autoscend/iotms/mr2019.ash
function auto_sausageEaten(): number {
  return toInt(getProperty("_sausagesEaten"));
}

function auto_sausageLeftToday(): number {
  return 23 - auto_sausageEaten();
}

function auto_sausageUnitsNeededForSausage(numSaus: number): number {
  return 111 * numSaus;
}

function auto_sausageMeatPasteNeededForSausage(numSaus: number): number {
  return ceil(toFloat(auto_sausageUnitsNeededForSausage(numSaus)) / 10.0);
}

export function auto_sausageFightsToday(): number {
  return toInt(getProperty("_sausageFights"));
}

export function auto_sausageBlocked(): boolean {
  if (in_tcrs()) {
    return true;
  }

  if (!canEat$1($item`magical sausage`)) {
    return true;
  }

  if (auto_sausageLeftToday() <= 0) {
    return true;
  }

  if (stomach_left() < 0) {
    //can still be eaten with===0
    return true;
  }

  return false;
}

export function auto_sausageWanted(): boolean {
  if (auto_sausageBlocked()) {
    return false;
  }
  // if adventures not needed yet, leave most sausages to acquireMP()
  if (myAdventures() > 10) {
    // only grind up to one per level in reserve instead of always grinding all the meat that isn't nailed down
    auto_sausageGrind(myLevel() - toInt(getProperty("_sausagesMade")));
    // it would be a good idea to eat one early on for MP but 2-3 things currently don't allow it:
    // auto_sausageGrind wants 90 turncount and desert unlocked, acquireMP() wants it to restore at least 300 MP
    return false;
  }
  // grind and eat sausages once adventures are needed, progressively with eating or drinking to keep a steady source of MP

  if (auto_sausageLeftToday() <= 0) {
    return false;
  }

  const sausageMade: number = toInt(getProperty("_sausagesMade"));
  let sausageForBreakfast: number; // estimate up to how many sausages before drinks and food?
  let totalSausageEstimated: number; // estimate up to how many sausages by the time liver and stomach will be full?
  // are there more casings from previous days or copied goblins?
  const extraCasings: number =
    itemAmount($item`magical sausage casing`) +
    sausageMade -
    auto_sausageFightsToday();

  if (myDaycount() === 1) {
    // by the time turn 90 allows grinding now, organs will not be empty and more sausages may be eaten anyways
    sausageForBreakfast = 1;
    totalSausageEstimated = max(9, sausageMade);
  } else {
    sausageForBreakfast = 6;
    // are there more sausages left from previous days?
    const extraSausage: number =
      itemAmount($item`magical sausage`) + auto_sausageEaten() - sausageMade;
    totalSausageEstimated = min(23, 13 + extraCasings + extraSausage);
    totalSausageEstimated = max(totalSausageEstimated, sausageMade);
  }
  // if expectations for today have already been reached lift them
  if (auto_sausageEaten() >= totalSausageEstimated) {
    totalSausageEstimated = 23;
  }
  // sausage consumption progresses with eating or drinking
  const progress: number = consumptionProgress();
  let totalSausageToEat: number =
    ceil(progress * (totalSausageEstimated - sausageForBreakfast)) +
    sausageForBreakfast;
  // a reserve is kept for MP restoration
  const noMP: boolean = in_darkGyffte();
  let sausage_reserve_size: number = noMP ? 0 : 3;
  // no more reserve when close to full or when completely out of adventures
  if (progress > 0.9) {
    sausage_reserve_size = 2;
  }
  if (progress > 0.95) {
    sausage_reserve_size = 1;
  }
  if (myAdventures() === 0) {
    sausage_reserve_size = 0;
  }
  // the reserve also needs to be planned inside the daily limit
  totalSausageToEat = min(totalSausageToEat, 23 - sausage_reserve_size);
  // try to grind up to the reserve on top of what we want to eat
  const totalSausageToGrind: number = totalSausageToEat + sausage_reserve_size;
  const sausageToGrind: number = min(23, totalSausageToGrind) - sausageMade;

  auto_sausageGrind(sausageToGrind);
  // eat if there is enough after grinding to respect the reserve
  let sausageToEat: number = totalSausageToEat - auto_sausageEaten();
  const sausageAvailable: number =
    itemAmount($item`magical sausage`) - sausage_reserve_size;
  sausageToEat = min(sausageToEat, sausageAvailable);

  if (sausageToEat > 0) {
    return auto_sausageEatEmUp(sausageToEat);
  }

  return false;
}

export function auto_sausageGrind(numSaus: number): boolean {
  return auto_sausageGrind$1(numSaus, false);
}

function auto_sausageGrind$1(
  numSaus: number,
  failIfCantMakeAll: boolean,
): boolean {
  // Some paths are pretty meat-intensive early. Just in case...
  if (myTurncount() < 90 || !isDesertAvailable()) {
    return false;
  }

  if (in_tcrs()) {
    return false;
  }

  const casingsOwned: number = itemAmount($item`magical sausage casing`);

  if (casingsOwned === 0) {
    return false;
  }
  //it is actually possible to have a casing but not have the kramco grinder
  if (!possessEquipment(wrap_item($item`Kramco Sausage-o-Matic™`))) {
    return false;
  }

  if (numSaus <= 0) {
    return false;
  }

  if (casingsOwned < numSaus) {
    if (failIfCantMakeAll) {
      return false;
    }
    numSaus = casingsOwned;
  }

  const sausMade: number = toInt(getProperty("_sausagesMade"));
  let pastesNeeded: number = 0;
  const pastesAvail: number = itemAmount($item`meat paste`);
  const meatToSave: number = 1000 + meatReserve();
  for (
    let i = 1,
      _last_3 = numSaus,
      _step_3 = 1,
      _up_3 = i <= _last_3,
      _inc_3 = _up_3 ? Math.abs(_step_3) : -Math.abs(_step_3);
    _up_3 ? i <= _last_3 : i >= _last_3;
    i += _inc_3
  ) {
    const sausNum: number = i + sausMade;
    const pastesForThisSaus: number =
      auto_sausageMeatPasteNeededForSausage(sausNum);
    if (
      (pastesNeeded + pastesForThisSaus - pastesAvail) * 10 + meatToSave >
      myMeat()
    ) {
      if (failIfCantMakeAll) {
        return false;
      }
      if (i === 1) {
        return false;
      }
      numSaus = i - 1;
      break;
    }
    pastesNeeded += pastesForThisSaus;
  }

  auto_log_info("Let's grind some sausage!", "blue");
  if (!create(numSaus, $item`magical sausage`)) {
    auto_log_warning("Something went wrong while grinding sausage...", "red");
    return false;
  }
  loopHandlerDelayAll();

  return true;
}

export function auto_sausageEatEmUp(maxToEat: number): boolean {
  if (auto_sausageBlocked()) {
    return false;
  }
  // sausage_reserve_size is handled in auto_sausageWanted()

  if (itemAmount($item`magical sausage`) < 1) {
    return false;
  }

  const noMP: boolean = in_darkGyffte();
  const originalMp: number = myMaxmp();
  if (!noMP) {
    auto_log_info(
      "We're gonna slurp up some sausage, let's make sure we have enough max mp",
      "blue",
    );
    cliExecute("checkpoint");
    addToMaximize("1000mp,-tie");
    equipMaximizedGear();
  }
  // I could optimize this a little more by eating more sausage at once if you have enough max mp...
  // but meh.
  while (maxToEat > 0 && itemAmount($item`magical sausage`) > 0) {
    if (auto_sausageLeftToday() <= 0) {
      break;
    }
    if (!noMP) {
      const desiredMp: number = max(myMaxmp() - 999, 0);
      const mpToBurn: number = max(myMp() - desiredMp, 0);
      if (mpToBurn > 0) {
        auto_burnMP(mpToBurn);
      }
    }

    if (!eat(1, $item`magical sausage`)) {
      auto_log_warning("Somehow failed to eat a sausage! What??", "red");
      return false;
    }
    handleTracker($item`magical sausage`.toString(), "auto_eaten");
    maxToEat--;
  }
  // burn any mp that'll go away when equipment switches back
  if (!noMP) {
    const mpToBurn: number = max(myMp() - originalMp, 0);
    if (mpToBurn > 0) {
      auto_burnMP(mpToBurn);
    }
    cliExecute("outfit checkpoint");
  }

  return true;
}

export function auto_haveKramcoSausageOMatic(): boolean {
  const kramco: Item = wrap_item($item`Kramco Sausage-o-Matic™`);
  if (possessEquipment(kramco) && auto_can_equip(kramco)) {
    return true;
  }
  return false;
}

export function auto_sausageGoblin(): boolean {
  return auto_sausageGoblin$2(Location.none, null);
}

export function auto_sausageGoblin$2(
  loc: Location,
  option: CombatMacro,
): boolean {
  // Sausage Goblins have super low encounter priority so they will be overriden
  // by all sorts stuff like superlikelies, wanderers and semi-rares.
  // The good news is, being overridden just means adventure there again to get it

  if (!auto_haveKramcoSausageOMatic()) {
    return false;
  }
  // Formula = (y+1) / (5+x*3+max(0,x-5)^3)
  // y is turns since the last goblin
  // x is the number of goblins you've already encountered that day.
  // spoilered by The Dictator in ASS Discord #iotm-discussion
  // intervals are therefore 0, 7, 10, 13, 16, 19, 23, 33, 55, 95, 128...
  const sausageFights: number = toInt(getProperty("_sausageFights"));
  const numerator: number =
    totalTurnsPlayed() - toFloat(getProperty("_lastSausageMonsterTurn")) + 1.0;
  const denominator: number =
    5.0 + sausageFights * 3.0 + max(0.0, sausageFights - 5.0) ** 3.0;
  if (sausageFights > 0 && numerator / denominator < 1.0) {
    return false;
  }

  if (loc === Location.none) {
    return true;
  }

  if (autoEquip$1(wrap_item($item`Kramco Sausage-o-Matic™`))) {
    setProperty("auto_nextEncounter", "sausage goblin");
    return autoAdv(1, loc, option);
  }
  setProperty("auto_nextEncounter", "");
  return false;
}

function auto_haveLilDoctorBag(): boolean {
  if (
    auto_is_valid($item`Lil' Doctor™ bag`) &&
    availableAmount($item`Lil' Doctor™ bag`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_chestXraysRemaining(): number {
  if (!auto_haveLilDoctorBag() || !auto_is_valid$2($skill`Chest X-Ray`)) {
    return 0;
  }

  return 3 - toInt(getProperty("_chestXRayUsed"));
}

export function auto_reflexHammersRemaining(): number {
  if (!auto_haveLilDoctorBag() || !auto_is_valid$2($skill`Reflex Hammer`)) {
    return 0;
  }

  return 3 - toInt(getProperty("_reflexHammerUsed"));
}

function pirateRealmAvailable(): boolean {
  if (!isUnrestricted($item`PirateRealm membership packet`)) {
    return false;
  }
  if (
    toBoolean(getProperty("prAlways")) ||
    toBoolean(getProperty("_prToday"))
  ) {
    return true;
  }
  return false;
}

export function LX_unlockPirateRealm(): boolean {
  if (!pirateRealmAvailable()) {
    return false;
  }
  if (possessEquipment($item`PirateRealm eyepatch`)) {
    return false;
  }
  if (myAdventures() < 40) {
    return false;
  }

  visitUrl("place.php?whichplace=realm_pirate&action=pr_port");
  return true;
}

function auto_saberChoice(choice: string): boolean {
  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (!isUnrestricted(saber)) {
    return false;
  }
  if (!possessEquipment(saber)) {
    return false;
  }
  if (toInt(getProperty("_saberMod")) !== 0) {
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

export function auto_saberDailyUpgrade(day: number): boolean {
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
export function auto_saberChargesAvailable(): number {
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
  return 5 - toInt(getProperty("_saberForceUses"));
}

export function auto_combatSaberBanish(): string {
  setProperty("choiceAdventure1387", (1).toString());
  return `skill ${$skill`Use the Force`}`;
}

export function auto_combatSaberYR(): string {
  setProperty("choiceAdventure1387", (3).toString());
  return `skill ${$skill`Use the Force`}`;
}

export function auto_spoonCombatSkill(): Skill {
  switch (myPrimestat()) {
    case $stat`Muscle`:
      return $skill`Dragoon Platoon`;
    case $stat`Mysticality`:
      return $skill`Spittoon Monsoon`;
    case $stat`Moxie`:
      return $skill`Festoon Buffoon`;
    default:
      abort("Invalid mainstat, what?");
      return Skill.none; // needed or mafia complains about missing return value
  }
}

function auto_spoonGetDesiredSign(): string {
  const spoonsign: string = toLowerCase(getProperty("auto_spoonsign"));

  function statSign(musc: string, myst: string, mox: string): string {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        return musc;
      case $stat`Mysticality`:
        return myst;
      case $stat`Moxie`:
        return mox;
      default:
        abort("Invalid mainstat, what?");
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

export function auto_spoonTuneConfirm(): void {
  if (
    !possessEquipment($item`hewn moon-rune spoon`) ||
    !auto_is_valid($item`hewn moon-rune spoon`)
  ) {
    // couldn't change signs if we wanted to
    return;
  }

  if (toInt(getProperty("auto_spoonconfirmed")) === myAscensions()) {
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
    abort(
      "Alright, please go change auto_spoonsign via the autoscend relay script and then rerun.",
    );
  } else {
    setProperty("auto_spoonconfirmed", myAscensions().toString());
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
    abort(
      "Something weird is going on with auto_spoonsign. It's not an invalid/blank value, but also not a knoll, canadia, or gnomad sign? This is impossible.",
    );
  }

  if (
    mySign() === "Vole" &&
    (toInt(getProperty("cyrptAlcoveEvilness")) > 14 + cyrptEvilBonus$1() ||
      getProperty("questL07Cyrptic") === "unstarted")
  ) {
    // we want to stay vole long enough to do the alcove, since the initiative helps
    return false;
  }

  if (inKnollSign() && !toKnoll) {
    if (getProperty("questM01Untinker") !== "finished") {
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

export function auto_spoonTuneMoon(): boolean {
  if (!auto_spoonReadyToTuneMoon()) {
    return false;
  }

  let wasspoon: Slot = Slot.none;
  for (const sl of $slots`acc1, acc2, acc3`) {
    if (equippedItem(sl) === $item`hewn moon-rune spoon`) {
      equip(sl, Item.none);
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

  if (wasspoon !== Slot.none) {
    equip(wasspoon, $item`hewn moon-rune spoon`);
  }

  return cantune;
}

function auto_beachCombAvailable(): boolean {
  if (
    !isUnrestricted($item`Beach Comb Box`) ||
    !possessEquipment($item`Beach Comb`)
  ) {
    return false;
  }

  return true;
}

function auto_beachCombHeadNumFrom(name: string): number {
  switch (toLowerCase(name)) {
    case "hot":
      return 1;
    case "cold":
      return 2;
    case "stench":
      return 3;
    case "spooky":
      return 4;
    case "sleaze":
      return 5;
    case "muscle":
    case "musc":
      return 6;
    case "mysticality":
    case "myst":
      return 7;
    case "moxie":
    case "mox":
      return 8;
    case "init":
    case "initiative":
      return 9;
    case "weight":
    case "familiar":
      return 10;
    case "exp":
    case "stats":
      return 11;
  }
  auto_log_error(`Invalid string ${name}provided to auto_beachCombHeadNumFrom`);
  return -1;
}

function auto_beachCombHeadEffectFromNum(num: number): Effect {
  switch (num) {
    case 1:
      return $effect`Hot-Headed`;
    case 2:
      return $effect`Cold as Nice`;
    case 3:
      return $effect`A Brush with Grossness`;
    case 4:
      return $effect`Does It Have a Skull In There??`;
    case 5:
      return $effect`Oiled, Slick`;
    case 6:
      return $effect`Lack of Body-Building`;
    case 7:
      return $effect`We're All Made of Starfish`;
    case 8:
      return $effect`Pomp & Circumsands`;
    case 9:
      return $effect`Resting Beach Face`;
    case 10:
      return $effect`Do I Know You From Somewhere?`;
    case 11:
      return $effect`You Learned Something Maybe!`;
  }
  auto_log_error(
    `Invalid number ${num} provided to auto_beachCombHeadEffectFromNum`,
  );
  return Effect.none;
}

export function auto_beachCombHeadEffect(name: string): Effect {
  return auto_beachCombHeadEffectFromNum(auto_beachCombHeadNumFrom(name));
}

export function auto_canBeachCombHead(name: string): boolean {
  if (!auto_beachCombAvailable()) {
    return false;
  }
  const head: number = auto_beachCombHeadNumFrom(name);
  for (const [, usedHead] of splitString(
    getProperty("_beachHeadsUsed"),
    ",",
  ).entries()) {
    if (head.toString() === usedHead) {
      return false;
    }
  }
  return toInt(getProperty("_freeBeachWalksUsed")) < 11;
}

export function auto_beachCombHead(name: string): boolean {
  if (!auto_beachCombAvailable()) {
    return false;
  }
  if (!auto_canBeachCombHead(name)) {
    return false;
  }

  const ret: boolean = cliExecute(
    `beach head ${auto_beachCombHeadNumFrom(name)}`,
  );

  if (ret) {
    handleTracker$1($item`Beach Comb`.toString(), name, "auto_otherstuff");
  }
  return ret;
}

function auto_beachCombFreeUsesLeft(): number {
  if (
    !auto_beachCombAvailable() ||
    toInt(getProperty("_freeBeachWalksUsed")) >= 11
  ) {
    return 0;
  }
  return 11 - toInt(getProperty("_freeBeachWalksUsed"));
}

export function auto_beachUseFreeCombs(): boolean {
  const freeCombs: number = auto_beachCombFreeUsesLeft();
  if (myAdventures() === 0) {
    return false;
  }
  if (freeCombs <= 0) {
    return false;
  }
  cliExecute(`combo ${freeCombs}`);
  return true;
}
// place.php?whichplace=campaway
export function auto_campawayAvailable(): boolean {
  return (
    isUnrestricted($item`Distant Woods Getaway Brochure`) &&
    toBoolean(getProperty("getawayCampsiteUnlocked"))
  );
}

export function auto_campawayGrabBuffs(): boolean {
  if (!auto_campawayAvailable()) {
    return false;
  }

  const lim: number =
    4 -
    toInt(getProperty("_campAwaySmileBuffs")) -
    toInt(getProperty("_campAwayCloudBuffs"));
  for (let i: number = 0; i < lim; i++) {
    visitUrl("place.php?whichplace=campaway&action=campaway_sky");
  }

  if (
    toInt(getProperty("_campAwayCloudBuffs")) === 0 &&
    itemAmount($item`campfire smoke`) + creatableAmount($item`campfire smoke`) >
      0
  ) {
    if (itemAmount($item`campfire smoke`) === 0) {
      create(1, $item`campfire smoke`);
    }
    const message: string = "why is my computer on fire?";
    visitUrl(
      `inv_use.php?pwd=&which=3&whichitem=${toInt($item`campfire smoke`)}`,
    );
    visitUrl(`choice.php?pwd=&whichchoice=1394&option=1&message=${message}`);
    visitUrl("place.php?whichplace=campaway&action=campaway_sky");
  }

  return true;
}

export function auto_havePillKeeper(): boolean {
  return (
    possessEquipment($item`Eight Days a Week Pill Keeper`) &&
    isUnrestricted($item`Unopened Eight Days a Week Pill Keeper`)
  );
}

export function auto_pillKeeperUses(): number {
  if (!auto_havePillKeeper()) {
    return 0;
  }
  return (
    spleen_left() / 3 + 1 - toInt(toBoolean(getProperty("_freePillKeeperUsed")))
  );
}

export function auto_pillKeeperFreeUseAvailable(): boolean {
  return (
    auto_havePillKeeper() && !toBoolean(getProperty("_freePillKeeperUsed"))
  );
}

export function auto_pillKeeperAvailable(): boolean {
  return auto_pillKeeperUses() > 0;
}

function auto_pillKeeper(pill: number): boolean {
  if (auto_pillKeeperUses() === 0) {
    return false;
  }
  auto_log_info(`Using pill keeper: consuming pill #${pill}`, "blue");
  visitUrl("main.php?eowkeeper=1", false);
  const page: string = visitUrl(
    `choice.php?pwd=&whichchoice=1395&pwd&option=${pill}`,
    true,
  );
  // Succeeded in consuming a pill
  if (containsText(page, "You grab the day")) {
    let detail: string = "unknown";
    switch (pill) {
      case 1:
        detail = "yellow ray";
        break;
      case 2:
        detail = "potion";
        break;
      case 3:
        detail = "noncombat";
        break;
      case 4:
        detail = "resistance";
        break;
      case 5:
        detail = "stat";
        break;
      case 6:
        detail = "fam weight";
        break;
      case 7:
        detail = "semirare";
        break;
      case 8:
        detail = "random";
        break;
    }
    handleTracker$1(
      $item`Eight Days a Week Pill Keeper`.toString(),
      detail,
      "auto_chewed",
    );
    return true;
  }
  // yellow ray, noncombat, or semirare already queued
  if (containsText(page, "You can't take any more of that right now.")) {
    auto_log_warning(`Pill keeper pill #${pill} already in effect`, "red");
    return true;
  }

  if (
    containsText(
      page,
      "Your spleen can't handle any more days worth of medicine!",
    )
  ) {
    auto_log_warning("Not enough spleen remaining to use pill keeper", "red");
  }
  // Failed to consume a pill
  return false;
}

export function auto_pillKeeper$1(pill: string): boolean {
  let pillId: number = 0;
  switch (toLowerCase(pill)) {
    case "yr":
    case "yellow ray":
      pillId = 1;
      break;
    case "potion":
      pillId = 2;
      break;
    case "noncombat":
    case "bell":
      pillId = 3;
      break;
    case "resistance":
      pillId = 4;
      break;
    case "stat":
      pillId = 5;
      break;
    case "weight":
    case "fam weight":
      pillId = 6;
      break;
    case "semirare":
      pillId = 7;
      break;
    case "random":
      pillId = 8;
      break;
    default:
      abort(`invalid argument to auto_pillKeeper: "${pill}"`);
  }

  return auto_pillKeeper(pillId);
}

// Note this doesn't clamp to 15 - that's enforced elsewhere.

export function auto_changeSnapperPhylum(toChange: Phylum): boolean {
  // Calling this function with a suitable phylum (anything other than none)
  // will cause the Red-Nosed Snapper to be changed to that phylum during pre-Adventure handling.
  // This will overwrite any current phylum, losing all progress towards that item (this is intended)
  // You have been warned.

  if (
    !canChangeToFamiliar($familiar`Red-Nosed Snapper`) ||
    toChange === Phylum.none
  ) {
    return false;
  }
  setProperty("auto_snapperPhylum", toChange.toString());
  return true;
}

export function auto_snapperPreAdventure(loc: Location): void {
  if (myFamiliar() !== $familiar`Red-Nosed Snapper`) {
    return;
  }

  let desiredPhylum: string = getProperty("auto_snapperPhylum");
  if (desiredPhylum !== "" && toPhylum(desiredPhylum) === Phylum.none) {
    auto_log_warning(
      `auto_snapperPhylum was set to bad value: ${desiredPhylum}. Should be a valid phylum.`,
      "red",
    );
    removeProperty("auto_snapperPhylum");
    return;
  }

  if (getProperty("redSnapperPhylum") === desiredPhylum) {
    auto_log_debug$1(
      `Red-Nosed Snapper is already guiding you towards ${desiredPhylum}`,
    );
    return;
  }
  // this is mainly in case autoChooseFamiliar switches to the Snapper due to no "better" +item familiars being available
  // It is preferred that you do not rely on this to change phylum in a quest, call changeSnapperPhylum in the quest handling code instead.
  if (desiredPhylum === "" && toInt(getProperty("redSnapperProgress")) === 0) {
    switch (loc) {
      case $location`The Penultimate Fantasy Airship`:
      case $location`The Hidden Park`:
      case $location`The Hidden Hospital`:
      case $location`The Hidden Office Building`:
      case $location`The Hidden Apartment Building`:
      case $location`The Hidden Bowling Alley`:
      case $location`The Copperhead Club`:
      case $location`A Mob of Zeppelin Protesters`:
      case $location`The Red Zeppelin`:
      case $location`Inside the Palindome`:
      case $location`The Neverending Party`:
      case $location`South of the Border`:
      case $location`The Valley of Rof L'm Fao`:
        desiredPhylum = $phylum`dude`.toString(); // human musk (banisher)

        break;
      case $location`The Hole in the Sky`:
        desiredPhylum = $phylum`constellation`.toString(); // micronova (yellow ray)

        break;
      case $location`The Smut Orc Logging Camp`:
        desiredPhylum = $phylum`orc`.toString(); // boot flask (size 3 awesome booze)

        break;
      case $location`The Outskirts of Cobb's Knob`:
      case $location`Cobb's Knob Barracks`:
      case $location`Cobb's Knob Kitchens`:
      case $location`Cobb's Knob Harem`:
      case $location`Cobb's Knob Treasury`:
      case $location`Cobb's Knob Laboratory`:
        desiredPhylum = $phylum`goblin`.toString(); // guffin (size 3 awesome food)

        break;
      case $location`The "Fun" House`:
        desiredPhylum = $phylum`horror`.toString(); // powdered madness (free kill)

        break;
      case $location`Twin Peak`:
        // this is actually a dude heavy zone *but* we want to fight the topiary monsters for rusty hedge trimmers.
        desiredPhylum = $phylum`beast`.toString();
        break;
      default:
        auto_log_info(
          `Going to ${loc} with the Red-Nosed Snapper without setting a phylum. This is not necessarily bad but it might be worth checking.`,
          "blue",
        );
        return;
    }
  }

  if (desiredPhylum !== "") {
    cliExecute(`snapper ${desiredPhylum}`);
    auto_log_info(
      `Red-Nosed Snapper is now guiding you towards ${desiredPhylum}`,
      "blue",
    );
  }
}
