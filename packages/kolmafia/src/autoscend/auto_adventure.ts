import {
  canWalkFromChoice,
  choiceFollowsFight,
  currentRound,
  handlingChoice,
  inMultiFight,
  Item,
  limitMode,
  Location,
  Monster,
  myTurncount,
  removeProperty,
  Skill,
  visitUrl,
} from "kolmafia";
import { $location, get, Macro, set } from "libram";

import { auto_runPostAdventure } from "./auto_post_adv";
import { auto_runPreAdventure } from "./auto_pre_adv";
import {
  auto_adv1,
  auto_interruptCheck,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_resolveEncounters,
  cloversAvailable,
  cloverUsageFinish,
  cloverUsageInit,
  cloverUsageRestart,
} from "./auto_util";
import { zone_isAvailable } from "./auto_zone";
import { auto_combatHandler } from "./combat/auto_combat";
import { auto_edCombatHandler } from "./combat/paths/auto_combat_ed";
import {
  ed_handleAdventureServant,
  isActuallyEd,
} from "./paths/2015/actually_ed_the_undying";

export type CombatMacroReturns =
  | "attack"
  | "pickpocket"
  | "runaway"
  | Item
  | Item[]
  | Skill
  | Macro
  | { macro: CombatMacroReturns; detail: string }
  | undefined;

export type CombatMacro = (
  round: number,
  monster: Monster,
  text: string,
) => CombatMacroReturns;

// Mirrors RecoveryManager.isRecoveryPossible()
export function auto_canRunBetweenBattleChecks(): boolean {
  return (
    currentRound() === 0 &&
    !inMultiFight() &&
    !choiceFollowsFight() &&
    (!handlingChoice() || canWalkFromChoice()) &&
    limitMode() !== "spelunky"
  );
}

// Runs pre-adv inline; auto_pre_adv.ts's main() stays wired up as a fallback
// for any call site that misses this.
export function auto_triggerPreAdventure(): void {
  if (!auto_canRunBetweenBattleChecks()) return;
  auto_runPreAdventure();
}

// Same fallback pattern for post-adv (auto_post_adv.ts's main()).
export function auto_triggerPostAdventure(): void {
  if (!auto_canRunBetweenBattleChecks()) return;
  auto_runPostAdventure();
}

// autoAdv is used to automate adventuring *once* in adventure.php zones
// it will (should?) handle the complete adventure from start to finish regardless of
// how many choices or combats it encounters (this is mafia's adv1 behaviour)
// TODO: seems to return false even if it adventures successfully but doesn't cost an adventure (mafia issue?)
//Defined in autoscend/auto_adventure.ash
export function autoAdv(
  loc: Location = $location.none,
  option?: CombatMacro,
  // Runs after pre-adventure prep; true skips this adventure, same as _autoSkipNextAdventure.
  shouldSkipAdventure?: () => boolean,
): boolean {
  //num is ignored
  if (!zone_isAvailable(loc, true)) {
    auto_log_warning(`Can't get to ${loc} right now.`, "red");
    return false;
  }

  removeProperty("_auto_combatState");
  set("auto_diag_round", 0);
  set("nextAdventure", loc);
  if (!option) {
    if (isActuallyEd()) {
      option = auto_edCombatHandler;
    } else {
      option = auto_combatHandler;
    }
  }
  // adv1 can erroneously return false for "choiceless" non-combats
  // see https://kolmafia.us/showthread.php?25370-adv1-returns-false-for-quot-choiceless-quot-choice-adventures
  // undo all this when (if?) that ever gets fixed
  const previousEncounter: string = get("lastEncounter");
  const turncount: number = myTurncount();
  auto_interruptCheck("main", false);
  auto_triggerPreAdventure();
  let advReturn: boolean =
    get("_autoSkipNextAdventure", false) ||
    (shouldSkipAdventure?.() ?? false) ||
    auto_adv1(loc, option);
  removeProperty("_autoSkipNextAdventure");
  auto_triggerPostAdventure();
  if (!advReturn) {
    auto_interruptCheck("main", false);
    auto_log_debug(
      "adv1 returned false for some reason. Did we actually adventure though?",
      "blue",
    );
    if (get("lastEncounter") !== previousEncounter) {
      auto_log_debug(
        `Looks like we may have adventured, lastEncounter was ${previousEncounter}, now ${get("lastEncounter")}`,
        "blue",
      );
      advReturn = true;
    }
    if (myTurncount() > turncount) {
      auto_log_debug(
        `Looks like we may have adventured, turncount was ${turncount}, now ${myTurncount()}`,
        "blue",
      );
      advReturn = true;
    }
  }
  return advReturn;
}

export function autoLuckyAdv(
  loc: Location,
  // overload to not override clover usage by default as this is the general case
  override: boolean = false,
): boolean {
  let gotLucky: boolean = false;
  if (cloversAvailable(override) > 0) {
    cloverUsageInit(override);
    gotLucky = autoAdv(loc);
    if (cloverUsageRestart()) {
      gotLucky = autoAdv(loc);
    }
    cloverUsageFinish();
  }
  return gotLucky;
}

// autoAdvBypass is used to automate adventuring *once* in non-adventure.php zones
// it will (should?) handle the complete adventure from start to finish regardless of
// how many choices or combats it encounters
export function autoAdvBypass(
  urlGetFlags: number,
  url: Map<number, string>,
  loc: Location = $location`Noob Cave`,
  option?: CombatMacro,
): boolean {
  if (!zone_isAvailable(loc, true)) {
    // reinstate this check for now. Didn't fix the War boss fight outside of Ed & KoE,
    // will work around that by passing Noob Cave as location until this is refactored.
    auto_log_warning(`Can't get to ${loc} right now.`, "red");
    return false;
  }

  set("nextAdventure", loc);
  auto_triggerPreAdventure();
  removeProperty("_auto_combatState");
  set("auto_diag_round", 0);

  if (isActuallyEd()) {
    ed_handleAdventureServant(loc);
  }

  auto_log_info(
    `About to start a combat indirectly at ${loc}... (${url.size}) accesses required.`,
    "blue",
  );
  let page: string = "";
  for (const [, it] of url) {
    if ((urlGetFlags & 1) === 1) {
      page = visitUrl(it, false);
    } else {
      page = visitUrl(it);
    }
    urlGetFlags /= 2;
  }
  // this should handle stuff like Ed's resurrect/fight loop
  // and anything else that chains combats & choices in any order
  auto_resolveEncounters(page, option);

  auto_triggerPostAdventure();
  // Encounters that need to generate a false so we handle them manually should go here.
  if (get("lastEncounter") === "Travel to a Recent Fight") {
    return false;
  }
  if (get("lastEncounter") === "Rationing out Destruction") {
    return false;
  }
  if (get("lastEncounter") === "Rainy Fax Dreams on your Wedding Day") {
    return false;
  }
  return true;
}

export function autoAdvBypass$1(
  url: string,
  loc: Location = $location`Noob Cave`,
  option?: CombatMacro,
): boolean {
  const urlConvert: Map<number, string> = new Map();
  urlConvert.set(0, url);
  return autoAdvBypass(0, urlConvert, loc, option);
}
