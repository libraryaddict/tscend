import {
  availableAmount,
  cliExecute,
  Familiar,
  Item,
  myFamiliar,
  myHash,
  myLevel,
  myLocation,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  AprilingBandHelmet,
  get,
  have,
} from "libram";

import { autoAdvBypass } from "../../executors/auto_adventure";
import { in_zootomist } from "../../paths/2025/zootomist";
import {
  auto_is_valid,
  handleTracker,
  isHermitAvailable,
} from "../../utils/auto_util";

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
  const have_toms: boolean = availableAmount($item`Apriling band quad tom`) > 0;
  function instruments_so_far(): number {
    return get("_aprilBandInstruments");
  }
  function track(it: Item): void {
    if (availableAmount(it) > 0) {
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $item`Apriling band helmet`,
        detail: `Claimed ${it}`,
      });
    }
  }
  if (in_zootomist() && myLevel() < 13) {
    if (!have_picc && instruments_so_far() < 2) {
      cliExecute("aprilband item piccolo");
      track($item`Apriling band piccolo`);
    }
  }
  // Sandworm spices stand in for the hermit's seal tooth on the gremlins
  if (!isHermitAvailable()) {
    //can hopefully get spices for the gremlins and food and also not have to use a drum machine
    if (!have_toms && instruments_so_far() < 2) {
      cliExecute("aprilband item tom");
      track($item`Apriling band quad tom`);
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
  const detail = `${success ? "Played" : "Failed to play"} to ${f}`;
  handleTracker(
    in_zootomist()
      ? { tracker: "path", subject: $item`Apriling band piccolo`, detail }
      : { tracker: "otherStuff", event: $item`Apriling band piccolo`, detail },
  );
  return success;
}

export function playAprilSax(): boolean {
  cliExecute("aprilband play saxophone");
  return have($effect`Lucky!`);
}

export function playAprilTuba(): boolean {
  cliExecute("aprilband play tuba");
  return get("noncombatForcerActive");
}

export function playAprilTom(): boolean {
  const initialTomCount: number = get("_aprilBandTomUses");
  const pages: Map<number, string> = new Map([
    [
      0,
      `inventory.php?pwd=${myHash()}&iid=${$item`Apriling band quad tom`.id}&action=aprilplay`,
    ],
    [1, "main.php"],
  ]);

  if (autoAdvBypass(1, pages, $location`Noob Cave`)) {
    if (get("_aprilBandTomUses") > initialTomCount) {
      handleTracker({
        tracker: "copies",
        monster: $monster`giant sandworm`,
        source: $item`Apriling band quad tom`.toString(),
        location: myLocation(),
      });
      return true;
    }
  }
  return false;
}

export function setAprilBandNonCombat(): boolean {
  if (have($effect`Apriling Band Patrol Beat`)) {
    return true;
  }
  if (!haveAprilingBandHelmet() || !AprilingBandHelmet.canChangeSong()) {
    return false;
  }
  cliExecute("aprilband effect nc");
  return have($effect`Apriling Band Patrol Beat`);
}

export function setAprilBandCombat(): boolean {
  if (have($effect`Apriling Band Battle Cadence`)) {
    return true;
  }
  if (!haveAprilingBandHelmet() || !AprilingBandHelmet.canChangeSong()) {
    return false;
  }
  cliExecute("aprilband effect c");
  return have($effect`Apriling Band Battle Cadence`);
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

export function AprilSandwormsLeft(): number {
  if (!haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band quad tom`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandTomUses");
}
