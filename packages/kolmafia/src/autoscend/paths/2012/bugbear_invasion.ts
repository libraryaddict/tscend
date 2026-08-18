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
  $locations,
  $modifier,
  $monster,
  $path,
  $phylum,
  $skill,
  $slot,
  get,
  set,
} from "libram";

import { pullXWhenHaveY } from "../../auto_acquire";
import {
  auto_triggerPostAdventure,
  autoAdv,
  autoAdvBypass$1,
} from "../../auto_adventure";
import {
  autoEquip,
  autoEquipToSlot,
  possessEquipment,
} from "../../auto_equipment";
import {
  auto_have_familiar,
  handleFamiliar,
  handleFamiliar$1,
} from "../../auto_familiar";
import { LX_attemptPowerLevelTask } from "../../auto_powerlevel";
import { uneffect } from "../../auto_restore";
import {
  auto_have_skill,
  auto_log_info,
  AutoStopError,
  internalQuestStatus,
} from "../../auto_util";
import { zone_available } from "../../auto_zone";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../../engine/engine";
import { maximizer } from "../../utils/maximizer";
import { inAftercore } from "../casual";

//Defined in autoscend/paths/bugbear_invasion.ash
export function in_bugbear(): boolean {
  return myPath() === $path`Bugbear Invasion`;
}

export function bugbear_initializeSettings(): void {
  if (in_bugbear()) {
    // Lair is replaced
    set("auto_wandOfNagamar", false);
    set("auto_getBeehive", false);
    set("auto_holeinthesky", false);
    set("auto_getStarKey", false);
    set(
      "nsTowerDoorKeysUsed",
      "Boris's key,Jarlsberg's key,Sneaky Pete's key,Richard's star key,skeleton key,digital key",
    );
    // banishing beasts / constructs can screw up bugbear hunting
    set("auto_dontPhylumBanish", true);
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

  let unlockLocation: Location = $location.none;
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
      unlockLocation = $location`The Hippy Camp (Bombed Back to the Stone Age)`;
      if (zone_available(unlockLocation)) {
        break;
      }
      unlockLocation = $location`The Orcish Frat House (Bombed Back to the Stone Age)`;
      break;
    default:
      abort(`Invalid Biodata location ${loc}`);
  }

  if (!zone_available(unlockLocation)) {
    return false;
  }

  if (isBanished($phylum`beast`)) {
    set("_auto_screechDelay", "beast");
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
    autoEquip($item`bugbear detector`);
  }

  if (
    get("_hipsterAdv") < 7 &&
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

  return autoAdv(unlockLocation);
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
    autoEquip($item`bugbear communicator badge`);
  } else {
    handleFamiliar("item");
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv(loc);
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

  return autoAdv(loc);
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

  return autoAdv(loc);
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

  return autoAdv(loc);
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

  return autoAdv(loc);
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
    get("tomeSummons") < 3
  ) {
    cliExecute("make fluorescent lightbulb");
  }

  autoEquip($item`UV monocular`);

  if (possessEquipment($item`fire`)) {
    autoEquip($item`fire`);
  }

  if (possessEquipment($item`fluorescent lightbulb`)) {
    autoEquip($item`fluorescent lightbulb`);
  }

  if (possessEquipment($item`Rain-Doh green lantern`)) {
    autoEquip($item`Rain-Doh green lantern`);
  } else if (possessEquipment($item`magic lamp`)) {
    autoEquip($item`magic lamp`);
  } else if (possessEquipment($item`oil lamp`)) {
    autoEquip($item`oil lamp`);
  }

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv(loc);
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

  return autoAdv(loc);
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

  return autoAdv(loc);
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

  return autoAdv(loc);
}

function LX_bugbearGallery(): boolean {
  const loc: Location = $location`Galley`;
  if (bugbear_UnlockMothership(loc)) {
    return true;
  }
  if (bugbear_ZoneOpen(loc) === false || bugbear_ZoneCleared(loc)) {
    return false;
  }

  maximizer.weight($modifier`Monster Level`, 1000);

  auto_log_info(`Clearing Bugbear Mothership - ${loc}`, "blue");

  return autoAdv(loc);
}

function LX_bugbearBridge(): boolean {
  if (get("mothershipProgress") !== 3) {
    return false;
  }

  if (
    internalQuestStatus("questL13Final") < 0 ||
    internalQuestStatus("questL13Final") > 3
  ) {
    return false;
  }

  if (
    toLowerCase(get("auto_towerBreak")) === "naughty sorceress" ||
    toLowerCase(get("auto_towerBreak")) === "the naughty sorceress" ||
    toLowerCase(get("auto_towerBreak")) === "ns" ||
    toLowerCase(get("auto_towerBreak")) === "sorceress" ||
    toLowerCase(get("auto_towerBreak")) === "level 6" ||
    toLowerCase(get("auto_towerBreak")) === "chamber"
  ) {
    abort("auto_towerBreak set to abort here.");
  }

  auto_log_info("Clearing Bugbear Mothership - Bridge", "blue");

  if (itemAmount($item`Jeff Goldblum larva`) === 0) {
    visitUrl("council.php");
  }

  auto_triggerPostAdventure();

  if (myClass() === $class`Turtle Tamer`) {
    autoEquip($item`Ouija Board, Ouija Board`);
  }

  if (pullsRemaining() === -1 || pullsRemaining() > 0) {
    if (canEquip($item`Oscus's garbage can lid`)) {
      pullXWhenHaveY($item`Oscus's garbage can lid`, 1, 0);
    }
  }

  autoEquipToSlot($slot`off-hand`, $item`Oscus's garbage can lid`);

  handleFamiliar("boss");

  maximizer
    .weight($modifier`Damage Reduction`, 10)
    .weight($modifier`Moxie`, 3)
    .weight($modifier`Damage Absorption`, 0.5)
    .max($modifier`Damage Absorption`, 1000)
    .weight($modifier`Monster Level`, -5)
    .weight($modifier`Maximum HP`, 1.5)
    .weight($modifier`Item Drop`, 0)
    .weight($modifier`Meat Drop`, 0);

  if (itemAmount($item`Jeff Goldblum larva`) > 0) {
    autoAdvBypass$1("place.php?whichplace=bugbearship&action=bb_bridge");
  }

  const ret: boolean = autoAdvBypass$1(
    "place.php?whichplace=bugbearship&action=bb_bridge",
  );

  if (get("auto_stayInRun", false)) {
    throw new AutoStopError(
      "User wanted to stay in run (auto_stayInRun), we are done.",
    );
  }

  visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
  if (!inAftercore()) {
    abort(
      `Yeah, so, I'm done. You might be stuck at the final boss, or just with a king in a prism. I don't know and quite frankly, after the last ${myDaycount()} days, I don't give a damn. That's right, I said it. Bitches.`,
    );
  }

  return ret;
}

registerQuestTask({
  name: "LX_bugbearKeyOTron",
  completed: () => !in_bugbear() || itemAmount($item`key-o-tron`) > 0,
  ready: () => true,
  do: LX_bugbearKeyOTron,
  locations: $location`The Sleazy Back Alley`,
  desiredEncounters: () => [
    {
      item: $item`BURT`,
      needAmount:
        itemAmount($item`key-o-tron`) === 0 ? 5 - itemAmount($item`BURT`) : 0,
    },
  ],
});

const LX_bugbearWasteProcessingTask: QuestTask = registerQuestTask({
  name: "LX_bugbearWasteProcessing",
  completed: () =>
    !in_bugbear() || bugbear_ZoneCleared($location`Waste Processing`),
  ready: () => true,
  do: LX_bugbearWasteProcessing,
  locations: $locations`The Sleazy Back Alley, Waste Processing`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Waste Processing`),
    },
  ],
});
const LX_bugbearMedbayTask: QuestTask = registerQuestTask({
  name: "LX_bugbearMedbay",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Medbay`),
  ready: () => true,
  do: LX_bugbearMedbay,
  locations: $locations`The Spooky Forest, Medbay`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Medbay`),
    },
  ],
});
const LX_bugbearSonarTask: QuestTask = registerQuestTask({
  name: "LX_bugbearSonar",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Sonar`),
  ready: () => true,
  do: LX_bugbearSonar,
  locations: $locations`The Batrat and Ratbat Burrow, Sonar`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Sonar`),
    },
  ],
});
const LX_bugbearScienceLabTask: QuestTask = registerQuestTask({
  name: "LX_bugbearScienceLab",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Science Lab`),
  ready: () => true,
  do: LX_bugbearScienceLab,
  locations: $locations`Cobb's Knob Laboratory, Science Lab`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Science Lab`),
    },
  ],
});
const LX_bugbearMorgueTask: QuestTask = registerQuestTask({
  name: "LX_bugbearMorgue",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Morgue`),
  ready: () => true,
  do: LX_bugbearMorgue,
  locations: $locations`The VERY Unquiet Garves, Morgue`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Morgue`),
    },
  ],
});
const LX_bugbearSpecialOpsTask: QuestTask = registerQuestTask({
  name: "LX_bugbearSpecialOps",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Special Ops`),
  ready: () => true,
  do: LX_bugbearSpecialOps,
  locations: $locations`Lair of the Ninja Snowmen, Special Ops`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Special Ops`),
    },
  ],
});
const LX_bugbearNavigationTask: QuestTask = registerQuestTask({
  name: "LX_bugbearNavigation",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Navigation`),
  ready: () => true,
  do: LX_bugbearNavigation,
  locations: $locations`The Haunted Gallery, Navigation`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Navigation`),
    },
  ],
});
const LX_bugbearEngineeringTask: QuestTask = registerQuestTask({
  name: "LX_bugbearEngineering",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Engineering`),
  ready: () => true,
  do: LX_bugbearEngineering,
  locations: $locations`The Penultimate Fantasy Airship, Engineering`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Engineering`),
    },
  ],
});
const LX_bugbearGalleryTask: QuestTask = registerQuestTask({
  name: "LX_bugbearGallery",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Galley`),
  ready: () => true,
  do: LX_bugbearGallery,
  locations: $locations`The Hippy Camp (Bombed Back to the Stone Age), The Orcish Frat House (Bombed Back to the Stone Age), Galley`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Galley`),
    },
  ],
});

function LX_bugbearInvasionFloorsDo(): boolean {
  if (itemAmount($item`key-o-tron`) === 0) {
    return false;
  }

  return runTaskChain([
    // First floor
    LX_bugbearWasteProcessingTask,
    LX_bugbearMedbayTask,
    LX_bugbearSonarTask,
    // Second floor
    LX_bugbearScienceLabTask,
    LX_bugbearMorgueTask,
    LX_bugbearSpecialOpsTask,
    // Third floor
    LX_bugbearNavigationTask,
    LX_bugbearEngineeringTask,
    LX_bugbearGalleryTask,
  ]);
}

registerQuestTask({
  name: "LX_bugbearInvasionFloorsDo",
  completed: () => !in_bugbear(),
  ready: () => true,
  do: LX_bugbearInvasionFloorsDo,
});

const LX_bugbearNavigationForceTask: QuestTask = registerQuestTask({
  name: "LX_bugbearNavigationForce",
  completed: () => !in_bugbear() || bugbear_ZoneCleared($location`Navigation`),
  ready: () => true,
  do: () =>
    internalQuestStatus("questL12War") >= 1 && LX_bugbearNavigationForce(),
  locations: $locations`The Haunted Gallery, Navigation`,
  desiredEncounters: () => [
    {
      monster: $phylum`beast`,
      needAmount: bugbear_BioDataRemaining($location`Navigation`),
    },
  ],
});
const LX_bugbearBridgeTask: QuestTask = registerQuestTask({
  name: "LX_bugbearBridge",
  completed: () => !in_bugbear() || internalQuestStatus("questL13Final") > 3,
  ready: () => true,
  do: LX_bugbearBridge,
  desiredEncounters: () => [
    {
      monster: $monster`Bugbear Captain`,
      needAmount: internalQuestStatus("questL13Final") > 3 ? 0 : 1,
    },
  ],
});

function LX_bugbearInvasionFinaleDo(): boolean {
  if (
    runTaskChain([
      LX_bugbearNavigationForceTask,
      LX_bugbearBridgeTask,
      LX_attemptPowerLevelTask,
    ])
  ) {
    return true;
  }

  abort("Bugbear Invasion tasks remain but can't figure out what to do.");
  return false;
}

const LX_bugbearInvasionFinaleTask: QuestTask = registerQuestTask({
  name: "LX_bugbearInvasionFinale",
  completed: () => !in_bugbear(),
  ready: () => itemAmount($item`key-o-tron`) > 0,
  do: LX_bugbearInvasionFinaleDo,
});

export function LX_bugbearInvasionFinale(): boolean {
  return runQuestTask(LX_bugbearInvasionFinaleTask);
}
