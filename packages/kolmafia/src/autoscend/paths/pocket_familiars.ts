import {
  cliExecute,
  gitExists,
  itemAmount,
  Modifier,
  myLevel,
  myPath,
  myPrimestat,
  retrieveItem,
  visitUrl,
} from "kolmafia";
import { $item, $items, $modifier, $path, get, set } from "libram";

import { possessEquipment } from "../auto_equipment";
import { auto_log_info, internalQuestStatus } from "../auto_util";
import { equipWarOutfit, warAdventure } from "../quests/level_12";
import { Maximizer } from "../utils/maximizer";

// This uses Ezandora's wonderful Helix Fossil script to handle building a team and combat.
//Defined in autoscend/paths/pocket_familiars.ash
export function in_pokefam(): boolean {
  return myPath() === $path`Pocket Familiars`;
}

export function pokefam_initializeSettings(): void {
  if (in_pokefam()) {
    // No need to restore HP or MP in Pocket Familiars.
    set("auto_ignoreRestoreFailure", true);
    // No need for a beehive as combat is different.
    set("auto_getBeehive", false);
    // We can't flyer, but all the sidequests are unlocked, so we can still war as frat
    set("auto_ignoreFlyer", true);
    // No Naughty Sorceress so no need for a wand.
    set("auto_wandOfNagamar", false);
    // runs are probably going to take at least 3 days, maybe 4 in hardcore
    set("auto_runDayCount", 3);
  }
}

export function pokefam_buildDefaultMaximize(target: Maximizer): void {
  // Combat is completely different in pokefam, so most stuff doesn't matter there
  target.weight($modifier`Item Drop`, 5).weight($modifier`Meat Drop`);
  if (myLevel() < 13 || get("auto_disregardInstantKarma", false)) {
    target
      .weight($modifier`Experience`, 10)
      .weight(Modifier.get(`${myPrimestat()} Experience Percent`), 5);
  }
}

export function pokefam_getHats(): void {
  if (!in_pokefam()) {
    return;
  }
  visitUrl("shop.php?whichshop=pokefam");
  if (itemAmount($item`1,960 pokédollar bill`) < 50) {
    return;
  }
  for (const it of $items`Team Avarice cap, Team Sloth cap, Team Wrath cap, Mu cap`) {
    if (
      !possessEquipment(it) &&
      itemAmount($item`1,960 pokédollar bill`) >= 50
    ) {
      retrieveItem(1, it);
    }
  }
}

export function pokefam_makeTeam(): boolean {
  if (in_pokefam()) {
    // Choose "strongest 2" in order to allow a middle spot for a pocket familiar to level up and earn pokebucks.
    if (gitExists("Ezandora-Helix-Fossil")) {
      auto_log_info("Setting our team via Ezandora:", "green");
      cliExecute("PocketFamiliarsAutoSelect Strongest 2;");
      return true;
    }
  }
  return true;
}

export function L12_pokefam_clearBattlefield(): boolean {
  // Pocket Familiars specific handling for clearing the battlefield.
  if (!in_pokefam()) {
    return false;
  }

  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }

  if (get("hippiesDefeated") < 1000 && get("fratboysDefeated") < 1000) {
    auto_log_info("Doing the wars.", "blue");
    equipWarOutfit();
    return warAdventure();
  }
  return false;
}
