import {
  floor,
  getDwelling,
  haveEquipped,
  Item,
  itemAmount,
  numericModifier,
} from "kolmafia";
import { $item, $modifier, $skill, get } from "libram";

import { disregardInstantKarma } from "../../auto_powerlevel";
import {
  auto_potentialMaxFreeRests,
  doFreeRest,
  haveAnyIotmAlternativeRestSiteAvailable,
  haveFreeRestAvailable,
} from "../../auto_restore";
import { auto_is_valid, auto_log_debug, wrap_item } from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";
import { in_small } from "../../paths/2023/small";
import { in_wereprof, is_werewolf } from "../../paths/2024/wereprofessor";

let $_auto_haveCincho_cincho: Item | undefined;

export function auto_haveCincho(): boolean {
  $_auto_haveCincho_cincho ??= wrap_item($item`Cincho de Mayo`);
  if (
    auto_is_valid($_auto_haveCincho_cincho) &&
    (itemAmount($_auto_haveCincho_cincho) > 0 ||
      haveEquipped($_auto_haveCincho_cincho))
  ) {
    return true;
  }

  return false;
}

function auto_currentCinch(): number {
  if (!auto_haveCincho()) {
    return 0;
  }
  return 100 - get("_cinchUsed");
}

function auto_cinchFromNextRest(): number {
  let cinchoRestsAlready: number = get("_cinchoRests");
  // calculating for how much cinch NEXT rest will give
  cinchoRestsAlready++;
  return auto_cinchFromRestN(cinchoRestsAlready);
}

function auto_cinchFromRestN(n: number): number {
  let cinchGainedFromRest: number = 5;
  if (n <= 5) {
    cinchGainedFromRest = 30;
  } else if (n === 6) {
    cinchGainedFromRest = 25;
  } else if (n === 7) {
    cinchGainedFromRest = 20;
  } else if (n === 8) {
    cinchGainedFromRest = 15;
  } else if (n === 9) {
    cinchGainedFromRest = 10;
  }

  return cinchGainedFromRest;
}

function auto_cinchAfterNextRest(): number {
  return auto_currentCinch() + auto_cinchFromNextRest();
}

export function auto_nextRestOverCinch(): boolean {
  return auto_cinchAfterNextRest() > 100;
}

export function auto_getCinch(goal: number): boolean {
  if (is_werewolf()) {
    return false; //can't rest as werewolf
  }
  if (auto_currentCinch() >= goal) {
    return true;
  }
  if (!haveFreeRestAvailable()) {
    // don't have enough cinch and don't have any free rests left
    return false;
  }
  if (
    !haveAnyIotmAlternativeRestSiteAvailable() &&
    getDwelling() === $item`big rock` &&
    !in_small()
  ) {
    // don't have anywhere to rest
    // get dwelling returns big rock when no place to rest in campsite
    // exception for Small path as you can't use housing in-run so you will always have a big rock.
    return false;
  }
  // use free rests until have enough cinch or out of rests
  while (
    auto_currentCinch() < goal &&
    haveFreeRestAvailable() &&
    !in_wereprof()
  ) {
    if (!doFreeRest()) {
      auto_log_debug("Failed to rest to charge cincho. Will try again later.");
      return false;
    }
  }
  // go for cinch as a professor. commented out for now because mafia tracking of free rests as a prof MAY not be working as expected
  /*while(auto_currentCinch() < goal && haveFreeRestAvailable() && is_professor())
	{
		visit_url("place.php?whichplace=wereprof_cottage&action=wereprof_sleep"); //just visit the cottage to sleep as professor
	}*/
  // see if we got enough cinch after using free rests
  if (auto_currentCinch() >= goal) {
    return true;
  }
  return false;
}

export function shouldCinchoConfetti(): boolean {
  // Cincho: Confetti Extravaganza doubles stat gains of current combat
  // costs 5 cinch and flips out the monster
  // cast this skill when we can't cast any more fiesta exists
  // can't cast it if we don't have it
  if (!auto_canUse($skill`Cincho: Confetti Extravaganza`)) {
    return false;
  }
  // don't over level
  if (!disregardInstantKarma()) {
    return false;
  }
  // save cinch for fiest exit
  if (auto_currentCinch() > 60) {
    return false;
  }
  // use all free rests before using confetti. May get enough cinch to fiesta exit
  if (
    haveFreeRestAvailable() ||
    numericModifier($modifier`Free Rests`) < auto_potentialMaxFreeRests()
  ) {
    return false;
  }
  // canSurvive checked in calling location. This function is only available to combat files
  return true;
}

function auto_potentialMaxCinchLeft(): number {
  const max_rests: number = auto_potentialMaxFreeRests();
  const curr_free_rests_used: number = get("_cinchoRests");
  let cinch: number = auto_currentCinch();
  for (
    let irest: number = curr_free_rests_used + 1;
    irest < max_rests;
    irest++
  ) {
    cinch = cinch + auto_cinchFromRestN(irest);
  }
  return cinch;
}

export function auto_cinchForcesLeft(): number {
  return floor(auto_potentialMaxCinchLeft() / 60);
}
