import { containsText, isUnrestricted, toLowerCase, visitUrl } from "kolmafia";
import { $item, get } from "libram";

import { spleen_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_abort,
  auto_log_info,
  auto_log_warning,
  handleTracker,
} from "../../auto_util";

export function havePillKeeper(): boolean {
  return (
    possessEquipment($item`Eight Days a Week Pill Keeper`) &&
    isUnrestricted($item`Unopened Eight Days a Week Pill Keeper`)
  );
}

export function pillKeeperUses(): number {
  if (!havePillKeeper()) {
    return 0;
  }
  return Math.max(
    0,
    Math.floor(spleen_left() / 3) + (pillKeeperFreeUseAvailable() ? 1 : 0),
  );
}

export function pillKeeperFreeUseAvailable(): boolean {
  return havePillKeeper() && !get("_freePillKeeperUsed");
}

export function pillKeeperAvailable(): boolean {
  return pillKeeperUses() > 0;
}

function auto_pillKeeper(pill: number): boolean {
  if (pillKeeperUses() === 0) {
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
    handleTracker({
      what: $item`Eight Days a Week Pill Keeper`,
      detail: detail,
      property: "auto_chewed",
    });
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

export function pillKeeper$1(pill: string): boolean {
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
      auto_abort(`invalid argument to auto_pillKeeper: "${pill}"`);
  }

  return auto_pillKeeper(pillId);
}
