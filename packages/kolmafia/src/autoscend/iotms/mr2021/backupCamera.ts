import { cliExecute, itemAmount, Location, myAdventures } from "kolmafia";
import { $item, $location, $monster, $slot, get, set } from "libram";

import { auto_advToReserve } from "../../../autoscend";
import { Autumnaton, Bofa, FantasyRealm } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { inebriety_left, stomach_left } from "../../auto_consume";
import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_wandererFightsLeft,
  internalQuestStatus,
  safeGet,
} from "../../auto_util";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_robot } from "../../paths/2021/you_robot";
import { cyrptEvilBonus } from "../../quests/level_07";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";
import { needStarKey } from "../../quests/level_13";

export function auto_haveBackupCamera(): boolean {
  return (
    possessEquipment($item`backup camera`) &&
    auto_is_valid($item`backup camera`)
  );
}

export function auto_enableBackupCameraReverser(): void {
  if (auto_haveBackupCamera() && !get("backupCameraReverserEnabled")) {
    cliExecute("backupcamera reverser on");
  }
}

export function auto_backupUsesLeft(): number {
  if (auto_haveBackupCamera()) {
    return 11 + (in_robot() ? 5 : 0) - get("_backUpUses");
  }
  return 0;
}

export function auto_backupTarget(): boolean {
  // can't backup if we don't have camera or it isn't available
  if (!auto_haveBackupCamera()) {
    return false;
  }
  // can't backup if no more charges left
  if (auto_backupUsesLeft() < 1) {
    return false;
  }
  // don't backup into a fight we just lost. Prevent continuously getting beaten up
  if (get("auto_beatenUpLastAdv", false)) {
    return false;
  }
  // don't backup if nextAdventure is None as a combat was somewhere that is not a zone
  if (safeGet("nextAdventure") === $location.none) {
    return false;
  }
  // don't backup into oliver's (it won't be free and will waste a free fight and currently also mess up tracking)
  if (
    safeGet("nextAdventure") === $location`An Unusually Quiet Barroom Brawl`
  ) {
    return false;
  }
  // determine if we want to backup
  const wantBackupLFM: boolean =
    auto_gunpowderBarrelsWanted() -
      auto_wandererFightsLeft($monster`lobsterfrogman`) >
      0 &&
    get("sidequestLighthouseCompleted") === "none" &&
    internalQuestStatus("questL12War") === 1 &&
    !Autumnaton.auto_hasAutumnaton() &&
    !in_koe();
  const habitatZombieEvil: number =
    auto_wandererFightsLeft($monster`modern zmobie`) > 0
      ? auto_wandererFightsLeft($monster`modern zmobie`) *
        (5 + cyrptEvilBonus())
      : 0;
  const wantBackupZmobie: boolean =
    get("cyrptAlcoveEvilness") > 14 + cyrptEvilBonus() + habitatZombieEvil &&
    internalQuestStatus("questL07Cyrptic") === 0;

  switch (safeGet("lastCopyableMonster")) {
    case $monster`lobsterfrogman`:
      if (wantBackupLFM) {
        return true;
      }
      break;
    case $monster`modern zmobie`:
      if (wantBackupZmobie) {
        return true;
      }
      break;
    case $monster`sausage goblin`:
      if (!wantBackupLFM && !wantBackupZmobie && auto_backupUsesLeft() > 5) {
        return true;
      }
      break;
    case $monster`Eldritch Tentacle`:
      //backup tentacles if lots of backups remaining or use all remaining charges if at end of day
      if (auto_backupUsesLeft() > 6) {
        return true;
      }
      if (
        myAdventures() <= 1 + auto_advToReserve() &&
        inebriety_left() === 0 &&
        stomach_left() < 1
      ) {
        return true;
      }
      break;
    case $monster`fantasy bandit`:
      if (
        !FantasyRealm.acquiredFantasyRealmToken() &&
        auto_backupUsesLeft() >= 5 - FantasyRealm.fantasyBanditsFought() &&
        Bofa.auto_habitatMonster() !== $monster`fantasy bandit`
      ) {
        return true;
      }
      break;
    case $monster`Green Ops Soldier`:
      if (
        get("hippiesDefeated") > 399 &&
        get("hippiesDefeated") < 1000 &&
        !in_koe()
      ) {
        return true;
      }
      break;
    case $monster`Skinflute`:
    case $monster`Camel's Toe`:
      if (
        needStarKey() &&
        itemAmount($item`star`) < 8 &&
        itemAmount($item`line`) < 7
      ) {
        return true;
      }
      break;
    default:
      break;
  }

  return false;
}

export function auto_backupToYourLastEnemy(loc: Location): boolean {
  // can't backup if we don't have the camera or no charges left or no valid target/location
  if (
    !auto_haveBackupCamera() ||
    auto_backupUsesLeft() === 0 ||
    !auto_backupTarget() ||
    loc === $location.none
  ) {
    return false;
  }

  if (autoEquipToSlot($slot`acc3`, $item`backup camera`)) {
    set("auto_nextEncounter", safeGet("lastCopyableMonster"));
    return autoAdv(loc);
  }
  set("auto_nextEncounter", "");
  return false;
}
