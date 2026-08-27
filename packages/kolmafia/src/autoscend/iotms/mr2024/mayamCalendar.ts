import {
  availableAmount,
  cliExecute,
  Item,
  myLevel,
  splitString,
} from "kolmafia";
import { $item, get } from "libram";

import { Cincho, SeptEmberCenser } from "../../../types";
import { auto_wantFamXP, switchToFamXP } from "../../auto_familiar";
import { auto_is_valid, auto_log_info, handleTracker } from "../../auto_util";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { in_zootomist } from "../../paths/2025/zootomist";
import { bridgeGoal, fastenerCount, lumberCount } from "../../quests/level_09";

export function haveMayamCalendar(): boolean {
  if (
    !in_lol() &&
    auto_is_valid($item`Mayam Calendar`) &&
    availableAmount($item`Mayam Calendar`) > 0
  ) {
    return true;
  }
  return false;
}

export function MayamIsUsed(glyph: string): boolean {
  const used: Map<number, string> = new Map(
    splitString(get("_mayamSymbolsUsed"), ",").map((_v, _i) => [_i, _v]),
  );
  for (const [, str] of used) {
    if (glyph === str) {
      return true;
    }
  }
  return false;
}

export function MayamAllUsed(): boolean {
  // mayam is currently fully used if all 3 ring1 symbols have been used
  return (
    MayamIsUsed("yam4") && MayamIsUsed("clock") && MayamIsUsed("explosion")
  );
}

export function MayamClaim(str: string): boolean {
  if (!haveMayamCalendar()) {
    return false;
  }
  const rings: Map<number, string> = new Map(
    splitString(str, " ").map((_v, _i) => [_i, _v]),
  );
  for (const [, s] of rings) {
    if (MayamIsUsed(s)) {
      return false;
    }
  }
  cliExecute(`mayam rings ${str}`);
  handleTracker({
    what: "Mayam Calendar",
    detail: `Claimed ${str}`,
    property: "auto_iotm_claim",
  });
  return true;
}

function auto_MayamClaimStinkBomb(): boolean {
  if (!haveMayamCalendar()) {
    return false;
  }
  if (
    MayamIsUsed("vessel") ||
    MayamIsUsed("yam2") ||
    MayamIsUsed("cheese") ||
    MayamIsUsed("explosion")
  ) {
    return false;
  }
  const it: Item = $item`stuffed yam stinkbomb`;
  const n_start: number = availableAmount(it);
  cliExecute("mayam rings vessel yam cheese explosion");
  if (availableAmount(it) > n_start) {
    handleTracker({
      what: "Mayam Calendar",
      detail: `Claimed ${it}`,
      property: "auto_iotm_claim",
    });
    return true;
  }
  return false;
}

function auto_MayamClaimBelt(): boolean {
  if (!haveMayamCalendar()) {
    return false;
  }
  if (
    MayamIsUsed("yam1") ||
    MayamIsUsed("meat") ||
    MayamIsUsed("eyepatch") ||
    MayamIsUsed("yam4")
  ) {
    return false;
  }
  const it: Item = $item`yamtility belt`;
  const n_start: number = availableAmount(it);
  cliExecute("mayam rings yam meat eyepatch yam");
  if (availableAmount(it) > n_start) {
    handleTracker({
      what: "Mayam Calendar",
      detail: `Claimed ${it}`,
      property: "auto_iotm_claim",
    });
    return true;
  }
  return false;
}

function auto_MayamClaimWhatever(): boolean {
  if (!haveMayamCalendar()) {
    return false;
  }
  let ring1: string = "BAD_VALUE";
  let ring2: string = "BAD_VALUE";
  let ring3: string = "BAD_VALUE";
  let ring4: string = "BAD_VALUE";
  let failure: boolean = false;

  if (!MayamIsUsed("fur") && auto_wantFamXP(300)) {
    ring1 = "fur";
    switchToFamXP(300);
  } else if (!MayamIsUsed("chair") && Cincho.haveCincho()) {
    ring1 = "chair";
  } else if (!MayamIsUsed("eye")) {
    ring1 = "eye";
  } else if (!MayamIsUsed("vessel")) {
    ring1 = "vessel";
  } else {
    failure = true;
  }

  if (
    !MayamIsUsed("wood") &&
    (lumberCount() < bridgeGoal() || fastenerCount() < bridgeGoal())
  ) {
    ring2 = "wood";
  } else if (!MayamIsUsed("lightning")) {
    ring2 = "lightning";
  } else if (!MayamIsUsed("meat")) {
    ring2 = "meat";
  } else {
    failure = true;
  }

  const going_to_use_mouthwash: boolean =
    myLevel() < 13 && SeptEmberCenser.remainingEmbers() >= 2;
  // in LTA one more yam martini is more valuable than +2 res for levelling
  if (going_to_use_mouthwash && !in_lta() && !MayamIsUsed("wall")) {
    ring3 = "wall";
  } else if (!MayamIsUsed("yam3")) {
    ring3 = "yam";
  } else if (!MayamIsUsed("cheese")) {
    ring3 = "cheese";
  } else if (!MayamIsUsed("wall")) {
    ring3 = "wall";
  } else {
    failure = true;
  }

  if (!MayamIsUsed("yam4")) {
    ring4 = "yam";
  } else if (!MayamIsUsed("clock")) {
    ring4 = "clock";
  } else if (!MayamIsUsed("explosion")) {
    ring4 = "explosion";
  } else {
    failure = true;
  }
  if (failure) {
    return false;
  }

  cliExecute(`mayam rings ${ring1} ${ring2} ${ring3} ${ring4}`);
  return true;
}

export function MayamClaimAll(): boolean {
  if (!haveMayamCalendar()) {
    return false;
  }
  if (MayamAllUsed()) {
    return false;
  }
  auto_log_info("Claiming mayam calendar items");
  auto_MayamClaimStinkBomb();
  auto_MayamClaimBelt();

  if (!in_zootomist() || myLevel() >= 13) {
    auto_MayamClaimWhatever();
    auto_MayamClaimWhatever();
    auto_MayamClaimWhatever();
  }
  return true;
}
