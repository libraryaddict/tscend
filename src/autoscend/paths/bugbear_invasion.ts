import {
  abort,
  canEquip,
  cliExecute,
  create,
  getProperty,
  haveEffect,
  isBanished,
  isUnrestricted,
  itemAmount,
  Location,
  myClass,
  myDaycount,
  myPath,
  pullsRemaining,
  replaceString,
  setProperty,
  toBoolean,
  toInt,
  toLowerCase,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $location,
  $path,
  $phylum,
  $skill,
  $slot,
} from "libram";

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
  return myPath() === $path`Bugbear Invasion`;
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
    case $location`Waste Processing`:
    case $location`Medbay`:
    case $location`Sonar`:
      return 3 - toInt(value);
    case $location`Science Lab`:
    case $location`Morgue`:
    case $location`Special Ops`:
      return 6 - toInt(value);
    case $location`Engineering`:
    case $location`Navigation`:
    case $location`Galley`:
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
    case $location`Waste Processing`:
      unlockLocation = $location`The Sleazy Back Alley`;
      break;
    case $location`Medbay`:
      if (internalQuestStatus("questL02Larva") !== 9999) {
        return false;
      }
      unlockLocation = $location`The Spooky Forest`;
      break;
    case $location`Sonar`:
      if (internalQuestStatus("questL04Bat") !== 9999) {
        return false;
      }
      unlockLocation = $location`The Batrat and Ratbat Burrow`;
      break;
    case $location`Science Lab`:
      unlockLocation = $location`Cobb's Knob Laboratory`;
      break;
    case $location`Morgue`:
      unlockLocation = $location`The VERY Unquiet Garves`;
      break;
    case $location`Special Ops`:
      if (internalQuestStatus("questL08Trapper") !== 9999) {
        return false;
      }
      unlockLocation = $location`Lair of the Ninja Snowmen`;
      break;
    case $location`Engineering`:
      if (internalQuestStatus("questL10Garbage") !== 9999) {
        return false;
      }
      unlockLocation = $location`The Penultimate Fantasy Airship`;
      break;
    case $location`Navigation`:
      if (internalQuestStatus("questL11Manor") !== 9999) {
        return false;
      }
      unlockLocation = $location`The Haunted Gallery`;
      break;
    case $location`Galley`:
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

  if (isBanished($phylum`beast`)) {
    setProperty("screechDelay", "beast");
    return false; // Can't fight bugbears if beasts are banished
  }

  if (itemAmount($item`key-o-tron`) === 0 && itemAmount($item`BURT`) >= 5) {
    create(1, $item`key-o-tron`);
    use(1, $item`key-o-tron`);
  }

  if (!possessEquipment($item`bugbear detector`)) {
    pullXWhenHaveY($item`bugbear detector`, 1, 0);
  }

  if (
    !possessEquipment($item`bugbear detector`) &&
    itemAmount($item`BURT`) >= 25
  ) {
    create(1, $item`bugbear detector`);
  }

  if (possessEquipment($item`bugbear detector`)) {
    autoEquip$1($item`bugbear detector`);
  }

  if (
    toInt(getProperty("_hipsterAdv")) < 7 &&
    isUnrestricted($familiar`Artistic Goth Kid`) &&
    auto_have_familiar($familiar`Artistic Goth Kid`)
  ) {
    // TODO: Use crayon shavings to copy
    auto_log_info(`Hipster Adv: ${getProperty("_hipsterAdv")}`, "blue");
    handleFamiliar$1($familiar`Artistic Goth Kid`);
  }

  if (itemAmount($item`key-o-tron`) === 0) {
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
  if (itemAmount($item`key-o-tron`) !== 0) {
    return false;
  }

  return bugbear_UnlockMothership($location`Waste Processing`);
}

function LX_bugbearWasteProcessing(): boolean {
  const loc: Location = $location`Waste Processing`;
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (
    !possessEquipment($item`bugbear communicator badge`) &&
    itemAmount($item`handful of juicy garbage`) > 0
  ) {
    use(1, $item`handful of juicy garbage`);
    return true;
  }

  if (possessEquipment($item`bugbear communicator badge`)) {
    autoEquip$1($item`bugbear communicator badge`);
  } else {
    handleFamiliar("item");
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearMedbay(): boolean {
  const loc: Location = $location`Medbay`;
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
  const loc: Location = $location`Sonar`;
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
  const loc: Location = $location`Science Lab`;
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
  const loc: Location = $location`Morgue`;
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
  const loc: Location = $location`Special Ops`;
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (!possessEquipment($item`UV monocular`)) {
    pullXWhenHaveY($item`UV monocular`, 1, 0);
  }

  if (!possessEquipment($item`UV monocular`) && itemAmount($item`BURT`) >= 50) {
    create(1, $item`UV monocular`);
  }

  if (!possessEquipment($item`UV monocular`)) {
    return false;
  }

  if (
    !possessEquipment($item`fluorescent lightbulb`) &&
    auto_have_skill($skill`Summon Clip Art`) &&
    toInt(getProperty("tomeSummons")) < 3
  ) {
    cliExecute("make fluorescent lightbulb");
  }

  autoEquip$1($item`UV monocular`);

  if (possessEquipment($item`fire`)) {
    autoEquip$1($item`fire`);
  }

  if (possessEquipment($item`fluorescent lightbulb`)) {
    autoEquip$1($item`fluorescent lightbulb`);
  }

  if (possessEquipment($item`Rain-Doh green lantern`)) {
    autoEquip$1($item`Rain-Doh green lantern`);
  } else if (possessEquipment($item`magic lamp`)) {
    autoEquip$1($item`magic lamp`);
  } else if (possessEquipment($item`oil lamp`)) {
    autoEquip$1($item`oil lamp`);
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearEngineering(): boolean {
  const loc: Location = $location`Engineering`;
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
  const loc: Location = $location`Navigation`;
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (haveEffect($effect`N-Spatial vision`) > 0) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearNavigationForce(): boolean {
  const loc: Location = $location`Navigation`;
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  if (haveEffect($effect`N-Spatial vision`) > 0) {
    uneffect($effect`N-Spatial vision`);
  }

  if (haveEffect($effect`N-Spatial vision`) > 0) {
    return false;
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv$2(loc);
}

function LX_bugbearGallery(): boolean {
  const loc: Location = $location`Galley`;
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

  if (itemAmount($item`Jeff Goldblum larva`) === 0) {
    visitUrl("council.php");
  }

  cliExecute("scripts/autoscend/auto_post_adv.js");

  if (myClass() === $class`Turtle Tamer`) {
    autoEquip$1($item`Ouija Board\, Ouija Board`);
  }

  if (pullsRemaining() === -1 || pullsRemaining() > 0) {
    if (canEquip($item`Oscus's garbage can lid`)) {
      pullXWhenHaveY($item`Oscus's garbage can lid`, 1, 0);
    }
  }

  autoEquip($slot`off-hand`, $item`Oscus's garbage can lid`);

  handleFamiliar("boss");

  addToMaximize("10dr,3moxie,0.5da 1000max,-5ml,1.5hp,0item,0meat");

  let ret: boolean = false;
  if (itemAmount($item`Jeff Goldblum larva`) > 0) {
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

  if (itemAmount($item`key-o-tron`) === 0) {
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
  if (itemAmount($item`key-o-tron`) === 0) {
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
