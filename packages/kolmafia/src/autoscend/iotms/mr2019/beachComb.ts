import {
  cliExecute,
  Effect,
  isUnrestricted,
  myAdventures,
  splitString,
  toLowerCase,
} from "kolmafia";
import { $effect, $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_log_error, handleTracker } from "../../auto_util";

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
  return $effect.none;
}

export function beachCombHeadEffect(name: string): Effect {
  return auto_beachCombHeadEffectFromNum(auto_beachCombHeadNumFrom(name));
}

export function canBeachCombHead(name: string): boolean {
  if (!auto_beachCombAvailable()) {
    return false;
  }
  const head: number = auto_beachCombHeadNumFrom(name);
  for (const [, usedHead] of splitString(
    get("_beachHeadsUsed"),
    ",",
  ).entries()) {
    if (head.toString() === usedHead) {
      return false;
    }
  }
  return get("_freeBeachWalksUsed") < 11;
}

export function beachCombHead(name: string): boolean {
  if (!auto_beachCombAvailable()) {
    return false;
  }
  if (!canBeachCombHead(name)) {
    return false;
  }

  const ret: boolean = cliExecute(
    `beach head ${auto_beachCombHeadNumFrom(name)}`,
  );

  if (ret) {
    handleTracker({
      what: $item`Beach Comb`,
      detail: name,
      property: "auto_otherstuff",
    });
  }
  return ret;
}

function auto_beachCombFreeUsesLeft(): number {
  if (!auto_beachCombAvailable() || get("_freeBeachWalksUsed") >= 11) {
    return 0;
  }
  return 11 - get("_freeBeachWalksUsed");
}

export function beachUseFreeCombs(): boolean {
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
