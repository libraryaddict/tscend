import {
  availableAmount,
  cliExecute,
  Familiar,
  haveEffect,
  Item,
  myFamiliar,
  myLevel,
  toBoolean,
} from "kolmafia";
import { $effect, $familiar, $item, AprilingBandHelmet, get } from "libram";

import { auto_is_valid, handleTracker, TrackerKey } from "../../auto_util";
import { in_zootomist } from "../../paths/2025/zootomist";

export function haveAprilingBandHelmet(): boolean {
  if (
    auto_is_valid($item`Apriling band helmet`) &&
    availableAmount($item`Apriling band helmet`) > 0
  ) {
    return true;
  }
  return false;
}

export function getAprilingBandItems(): boolean {
  if (!haveAprilingBandHelmet()) {
    return false;
  }
  const have_sax: boolean = availableAmount($item`Apriling band saxophone`) > 0;
  const have_tuba: boolean = availableAmount($item`Apriling band tuba`) > 0;
  const have_picc: boolean = availableAmount($item`Apriling band piccolo`) > 0;
  function instruments_so_far(): number {
    return get("_aprilBandInstruments");
  }
  function track(it: Item): void {
    if (availableAmount(it) > 0) {
      handleTracker({
        what: $item`Apriling band helmet`,
        detail: `Claimed ${it}`,
        property: "auto_iotm_claim",
      });
    }
  }
  if (in_zootomist() && myLevel() < 13) {
    if (!have_picc && instruments_so_far() < 2) {
      cliExecute("aprilband item piccolo");
      track($item`Apriling band piccolo`);
    }
  }
  if (!have_tuba && instruments_so_far() < 2) {
    cliExecute("aprilband item tuba");
    track($item`Apriling band tuba`);
  }
  if (!have_sax && instruments_so_far() < 2) {
    cliExecute("aprilband item saxophone");
    track($item`Apriling band saxophone`);
  }

  return instruments_so_far() === 2;
}

export function playAprilPiccolo(): boolean {
  const f: Familiar = myFamiliar();
  let success: boolean = false;
  if (f !== $familiar.none) {
    const startexp: number = f.experience;
    cliExecute("aprilband play piccolo");
    success = f.experience > startexp;
  }
  const tracker: TrackerKey = in_zootomist()
    ? "auto_tracker_path"
    : "auto_otherstuff";
  handleTracker({
    what: $item`Apriling band piccolo`,
    detail: `${success ? "Played" : "Failed to play"} to ${f}`,
    property: tracker,
  });
  return success;
}

export function playAprilSax(): boolean {
  cliExecute("aprilband play saxophone");
  return toBoolean(haveEffect($effect`Lucky!`));
}

export function playAprilTuba(): boolean {
  cliExecute("aprilband play tuba");
  return get("noncombatForcerActive");
}

export function setAprilBandNonCombat(): boolean {
  if (toBoolean(haveEffect($effect`Apriling Band Patrol Beat`))) {
    return true;
  }
  if (!haveAprilingBandHelmet()) {
    return false;
  }
  cliExecute("aprilband effect nc");
  return toBoolean(haveEffect($effect`Apriling Band Patrol Beat`));
}

export function setAprilBandCombat(): boolean {
  if (toBoolean(haveEffect($effect`Apriling Band Battle Cadence`))) {
    return true;
  }
  if (!haveAprilingBandHelmet() || !AprilingBandHelmet.canChangeSong()) {
    return false;
  }
  cliExecute("aprilband effect c");
  return toBoolean(haveEffect($effect`Apriling Band Battle Cadence`));
}

export function AprilSaxLuckyLeft(): number {
  if (!haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band saxophone`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandSaxophoneUses");
}

export function AprilTubaForcesLeft(): number {
  if (!haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band tuba`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandTubaUses");
}

export function AprilPiccoloBoostsLeft(): number {
  if (!haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band piccolo`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandPiccoloUses");
}
