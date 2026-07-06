import {
  abort,
  canEquip,
  Class,
  cliExecute,
  create,
  Effect,
  Familiar,
  getProperty,
  haveEffect,
  isBanished,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  myClass,
  myDaycount,
  myPath,
  Path,
  Phylum,
  pullsRemaining,
  replaceString,
  setProperty,
  Skill,
  Slot,
  toBoolean,
  toInt,
  toLowerCase,
  use,
  visitUrl,
} from "kolmafia";
import { pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$2, autoAdvBypass$6 } from "../auto_adventure";
import {
  addToMaximize,
  autoEquip,
  autoEquip$1,
  possessEquipment,
} from "../auto_equipment";
import {
  auto_have_familiar,
  handleFamiliar,
  handleFamiliar$1,
} from "../auto_familiar";
import { LX_attemptPowerLevel } from "../auto_powerlevel";
import { uneffect } from "../auto_restore";
import {
  auto_have_skill,
  auto_log_info,
  internalQuestStatus,
} from "../auto_util";
import { zone_available } from "../auto_zone";
import { inAftercore } from "./casual";

//Defined in autoscend/paths/bugbear_invasion.ash
export function in_bugbear(): boolean {
  return myPath() === Path.get("Bugbear Invasion");
}

export function bugbear_initializeSettings(): void {
  if (in_bugbear()) {
    // Lair is replaced
    setProperty("auto_wandOfNagamar", false.toString());
    setProperty("auto_getBeehive", false.toString());
    setProperty("auto_holeinthesky", false.toString());
    setProperty("auto_getStarKey", false.toString());
    setProperty(
      "nsTowerDoorKeysUsed",
      "Boris's key,Jarlsberg's key,Sneaky Pete's key,Richard's star key,skeleton key,digital key",
    );
    // banishing beasts / constructs can screw up bugbear hunting
    setProperty("auto_dontPhylumBanish", true.toString());
  }
}

function bugbear_Status(loc: Location): string {
  if (loc.zone !== "Mothership") {
    abort("Invalid Mothership zone");
  }
  return getProperty(`status${replaceString(loc.toString(), " ", "")}`);
}

export function bugbear_BioDataRemaining(loc: Location): number {
  const value: string = bugbear_Status(loc);
  if (value === "unlocked" || value === "open" || value === "cleared") {
    return 0;
  }
  switch (loc) {
    case Location.get("Waste Processing"):
    case Location.get("Medbay"):
    case Location.get("Sonar"):
      return 3 - toInt(value);
    case Location.get("Science Lab"):
    case Location.get("Morgue"):
    case Location.get("Special Ops"):
      return 6 - toInt(value);
    case Location.get("Engineering"):
    case Location.get("Navigation"):
    case Location.get("Galley"):
      return 9 - toInt(value);
    default:
      abort(`Invalid Biodata location ${loc}`);
  }

  return 0;
}

function bugbear_ZoneOpen(loc: Location): boolean {
  const value: string = bugbear_Status(loc);
  return value === "open";
}

function bugbear_ZoneCleared(loc: Location): boolean {
  const value: string = bugbear_Status(loc);
  return value === "cleared";
}

function bugbear_UnlockMothership(loc: Location): boolean {
  const remaining: number = bugbear_BioDataRemaining(loc);
  if (remaining === 0) {
    return false;
  }

  let unlockLocation: Location = Location.none;
  switch (loc) {
    case Location.get("Waste Processing"):
      unlockLocation = Location.get("The Sleazy Back Alley");
      break;
    case Location.get("Medbay"):
      if (internalQuestStatus("questL02Larva") !== 9999) {
        return false;
      }
      unlockLocation = Location.get("The Spooky Forest");
      break;
    case Location.get("Sonar"):
      if (internalQuestStatus("questL04Bat") !== 9999) {
        return false;
      }
      unlockLocation = Location.get("The Batrat and Ratbat Burrow");
      break;
    case Location.get("Science Lab"):
      unlockLocation = Location.get("Cobb's Knob Laboratory");
      break;
    case Location.get("Morgue"):
      unlockLocation = Location.get("The VERY Unquiet Garves");
      break;
    case Location.get("Special Ops"):
      if (internalQuestStatus("questL08Trapper") !== 9999) {
        return false;
      }
      unlockLocation = Location.get("Lair of the Ninja Snowmen");
      break;
    case Location.get("Engineering"):
      if (internalQuestStatus("questL10Garbage") !== 9999) {
        return false;
      }
      unlockLocation = Location.get("The Penultimate Fantasy Airship");
      break;
    case Location.get("Navigation"):
      if (internalQuestStatus("questL11Manor") !== 9999) {
        return false;
      }
      unlockLocation = Location.get("The Haunted Gallery");
      break;
    case Location.get("Galley"):
      unlockLocation = Location.get(
        "The Hippy Camp (Bombed Back to the Stone Age)",
      );
      if (zone_available(unlockLocation)) {
        break;
      }
      unlockLocation = Location.get(
        "The Orcish Frat House (Bombed Back to the Stone Age)",
      );
      break;
    default:
      abort(`Invalid Biodata location ${loc}`);
  }

  if (!zone_available(unlockLocation)) {
    return false;
  }

  if (isBanished(Phylum.get("beast"))) {
    setProperty("screechDelay", "beast");
    return false; // Can't fight bugbears if beasts are banished
  }

  if (
    itemAmount(Item.get("key-o-tron")) === 0 &&
    itemAmount(Item.get("BURT")) >= 5
  ) {
    create(1, Item.get("key-o-tron"));
    use(1, Item.get("key-o-tron"));
  }

  if (!possessEquipment(Item.get("bugbear detector"))) {
    pullXWhenHaveY(Item.get("bugbear detector"), 1, 0);
  }

  if (
    !possessEquipment(Item.get("bugbear detector")) &&
    itemAmount(Item.get("BURT")) >= 25
  ) {
    create(1, Item.get("bugbear detector"));
  }

  if (possessEquipment(Item.get("bugbear detector"))) {
    autoEquip$1(Item.get("bugbear detector"));
  }

  if (
    toInt(getProperty("_hipsterAdv")) < 7 &&
    isUnrestricted(Familiar.get("Artistic Goth Kid")) &&
    auto_have_familiar(Familiar.get("Artistic Goth Kid"))
  ) {
    // TODO: Use crayon shavings to copy
    auto_log_info(`Hipster Adv: ${getProperty("_hipsterAdv")}`, "blue");
    handleFamiliar$1(Familiar.get("Artistic Goth Kid"));
  }

  if (itemAmount(Item.get("key-o-tron")) === 0) {
    auto_log_info("Need a Key-o-tron to scan bugbears", "blue");
  } else {
    auto_log_info(
      `Scanning bugbears in ${unlockLocation} to unlock ${loc}`,
      "blue",
    );
  }
  // TODO: Backups and copies would be real good but
  // existing copying code is real bad

  return autoAdv$2(unlockLocation);
}

function LX_bugbearKeyOTron(): boolean {
  if (itemAmount(Item.get("key-o-tron")) !== 0) {
    return false;
  }

  return bugbear_UnlockMothership(Location.get("Waste Processing"));
}

function LX_bugbearWasteProcessing(): boolean {
  const loc: Location = Location.get("Waste Processing");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (
    !possessEquipment(Item.get("bugbear communicator badge")) &&
    itemAmount(Item.get("handful of juicy garbage")) > 0
  ) {
    use(1, Item.get("handful of juicy garbage"));
    return true;
  }

  if (possessEquipment(Item.get("bugbear communicator badge"))) {
    autoEquip$1(Item.get("bugbear communicator badge"));
  } else {
    handleFamiliar("item");
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearMedbay(): boolean {
  const loc: Location = Location.get("Medbay");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearSonar(): boolean {
  const loc: Location = Location.get("Sonar");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearScienceLab(): boolean {
  const loc: Location = Location.get("Science Lab");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  handleFamiliar("item");

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearMorgue(): boolean {
  const loc: Location = Location.get("Morgue");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  handleFamiliar("item");

  return autoAdv$2(loc);
}

function LX_bugbearSpecialOps(): boolean {
  const loc: Location = Location.get("Special Ops");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (!possessEquipment(Item.get("UV monocular"))) {
    pullXWhenHaveY(Item.get("UV monocular"), 1, 0);
  }

  if (
    !possessEquipment(Item.get("UV monocular")) &&
    itemAmount(Item.get("BURT")) >= 50
  ) {
    create(1, Item.get("UV monocular"));
  }

  if (!possessEquipment(Item.get("UV monocular"))) {
    return false;
  }

  if (
    !possessEquipment(Item.get("fluorescent lightbulb")) &&
    auto_have_skill(Skill.get("Summon Clip Art")) &&
    toInt(getProperty("tomeSummons")) < 3
  ) {
    cliExecute("make fluorescent lightbulb");
  }

  autoEquip$1(Item.get("UV monocular"));

  if (possessEquipment(Item.get("fire"))) {
    autoEquip$1(Item.get("fire"));
  }

  if (possessEquipment(Item.get("fluorescent lightbulb"))) {
    autoEquip$1(Item.get("fluorescent lightbulb"));
  }

  if (possessEquipment(Item.get("Rain-Doh green lantern"))) {
    autoEquip$1(Item.get("Rain-Doh green lantern"));
  } else if (possessEquipment(Item.get("magic lamp"))) {
    autoEquip$1(Item.get("magic lamp"));
  } else if (possessEquipment(Item.get("oil lamp"))) {
    autoEquip$1(Item.get("oil lamp"));
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearEngineering(): boolean {
  const loc: Location = Location.get("Engineering");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  handleFamiliar("item");

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearNavigation(): boolean {
  const loc: Location = Location.get("Navigation");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (haveEffect(Effect.get("N-Spatial vision")) > 0) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearNavigationForce(): boolean {
  const loc: Location = Location.get("Navigation");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (haveEffect(Effect.get("N-Spatial vision")) > 0) {
    uneffect(Effect.get("N-Spatial vision"));
  }

  if (haveEffect(Effect.get("N-Spatial vision")) > 0) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearGallery(): boolean {
  const loc: Location = Location.get("Galley");
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  addToMaximize("1000ml");

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearBridge(): boolean {
  if (toInt(getProperty("mothershipProgress")) !== 3) {
    return false;
  }

  if (
    internalQuestStatus("questL13Final") < 0 ||
    internalQuestStatus("questL13Final") > 3
  ) {
    return false;
  }

  if (
    toLowerCase(getProperty("auto_towerBreak")) === "naughty sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "the naughty sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "ns" ||
    toLowerCase(getProperty("auto_towerBreak")) === "sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 6" ||
    toLowerCase(getProperty("auto_towerBreak")) === "chamber"
  ) {
    abort("auto_towerBreak set to abort here.");
  }

  auto_log_info("Clearing Bugbear Mothership - Bridge", "blue");

  if (itemAmount(Item.get("Jeff Goldblum larva")) === 0) {
    visitUrl("council.php");
  }

  cliExecute("scripts/autoscend/auto_post_adv.js");

  if (myClass() === Class.get("Turtle Tamer")) {
    autoEquip$1(Item.get("Ouija Board, Ouija Board"));
  }

  if (pullsRemaining() === -1 || pullsRemaining() > 0) {
    if (canEquip(Item.get("Oscus's garbage can lid"))) {
      pullXWhenHaveY(Item.get("Oscus's garbage can lid"), 1, 0);
    }
  }

  autoEquip(Slot.get("off-hand"), Item.get("Oscus's garbage can lid"));

  handleFamiliar("boss");

  addToMaximize("10dr,3moxie,0.5da 1000max,-5ml,1.5hp,0item,0meat");

  let ret: boolean = false;
  if (itemAmount(Item.get("Jeff Goldblum larva")) > 0) {
    ret = autoAdvBypass$6("place.php?whichplace=bugbearship&action=bb_bridge");
  }

  ret = autoAdvBypass$6("place.php?whichplace=bugbearship&action=bb_bridge");

  if (toBoolean(getProperty("auto_stayInRun"))) {
    abort("User wanted to stay in run (auto_stayInRun), we are done.");
  }

  visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
  if (!inAftercore()) {
    abort(
      `Yeah, so, I'm done. You might be stuck at the final boss, or just with a king in a prism. I don't know and quite frankly, after the last ${myDaycount()} days, I don't give a damn. That's right, I said it. Bitches.`,
    );
  }

  return ret;
}

export function LX_bugbearInvasion(): boolean {
  if (!in_bugbear()) {
    return false;
  }

  if (LX_bugbearKeyOTron()) {
    return true;
  }

  if (itemAmount(Item.get("key-o-tron")) === 0) {
    return false;
  }
  // First floor
  if (LX_bugbearWasteProcessing()) {
    return true;
  }
  if (LX_bugbearMedbay()) {
    return true;
  }
  if (LX_bugbearSonar()) {
    return true;
  }
  // Second floor
  if (LX_bugbearScienceLab()) {
    return true;
  }
  if (LX_bugbearMorgue()) {
    return true;
  }
  if (LX_bugbearSpecialOps()) {
    return true;
  }
  // Third floor
  if (LX_bugbearNavigation()) {
    return true;
  }
  if (LX_bugbearEngineering()) {
    return true;
  }
  if (LX_bugbearGallery()) {
    return true;
  }

  return false;
}

export function LX_bugbearInvasionFinale(): boolean {
  if (!in_bugbear()) {
    return false;
  }
  if (itemAmount(Item.get("key-o-tron")) === 0) {
    return false;
  }

  if (internalQuestStatus("questL12War") >= 1 && LX_bugbearNavigationForce()) {
    return true;
  }
  if (LX_bugbearBridge()) {
    return true;
  }
  if (LX_attemptPowerLevel()) {
    return true;
  }

  abort("Bugbear Invasion tasks remain but can't figure out what to do.");
  return false;
}
