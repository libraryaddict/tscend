import {
  cliExecute,
  containsText,
  gitExists,
  indexOf,
  lastMonster,
  Monster,
  monsterAttack,
  monsterDefense,
  monsterHp,
  monsterLevelAdjustment,
  myHp,
  myLocation,
  removeProperty,
  splitString,
  stopCounter,
  substring,
  toItem,
  toMonster,
  toSkill,
} from "kolmafia";
import { $monster, $monsters, $skill, get, set } from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import { auto_abort, auto_log_info } from "../auto_util";
import { in_ocrs } from "../paths/2015/one_crazy_random_summer";
import { in_awol } from "../paths/2016/avatar_of_west_of_loathing";
import { in_pokefam } from "../paths/2018/pocket_familiars";
import { in_wildfire } from "../paths/2021/wildfire";
import { ag_is_bodyguard, in_avantGuard } from "../paths/2024/avant_guard";
import { auto_combatDefaultStage1 } from "./auto_combat_default_stage1";
import { auto_combatDefaultStage2 } from "./auto_combat_default_stage2";
import { auto_combatDefaultStage3 } from "./auto_combat_default_stage3";
import { auto_combatDefaultStage4 } from "./auto_combat_default_stage4";
import { auto_combatDefaultStage5 } from "./auto_combat_default_stage5";
import {
  auto_canUse,
  auto_useSkill,
  combat_status_add,
  combat_status_reset,
  CombatStatusType,
  defaultRoundLimit,
} from "./auto_combat_util";
import { awol_combat_helper } from "./paths/auto_combat_awol";
import { disguises_combat_helper } from "./paths/auto_combat_disguises_delimit";
import { fotd_combat_helper } from "./paths/auto_combat_fall_of_the_dinosaurs";
import { ocrs_combat_helper } from "./paths/auto_combat_ocrs";

//header file for combat
//combat utilities
//default stage 1 = 1st round actions
//default stage 2 = enders
//default stage 3 = debuff
//default stage 4 = prekill actions
//default stage 5 = kill
//path = adventurer_meats_world
//path = avatar of west of loathing
//path = bees hate you
//path = fall of the dinosaurs
//path = heavy rains
//path = dark gyffte
//path = disguises delimit
//path = actually ed the undying
//path = gelatinous noob
//path = kingdom of exploathing
//path = license to adventure
//path = one crazy random summer
//path = avatar of sneaky pete
//path = path of the plumber
//path = the source
//path = wereprofessor
//path = wildfire
//path = you, robot
//path = zombie slayer
//quest specific handling
//2012 iotm and ioty handling
//	Advance combat round, nothing happens.
//	/goto fight.php?action=useitem&whichitem=1

//defined in /autoscend/combat/auto_combat.ash
function auto_combatInitialize(
  round_1: number,
  enemy: Monster,
  text: string,
): void {
  //reset settings for combat at the start of every combat
  if (round_1 !== 0) {
    //Yes round 0, really.
    return;
  }

  switch (enemy) {
    case $monster`Government agent`:
      set("_portscanPending", false);
      stopCounter("portscan.edu");
      break;
    case $monster`possessed wine rack`:
      set("auto_wineracksencountered", get("auto_wineracksencountered", 0) + 1);
      break;
    case $monster`cabinet of Dr. Limpieza`:
      set("auto_cabinetsencountered", get("auto_cabinetsencountered", 0) + 1);
      break;
    case $monster`junksprite bender`:
    case $monster`junksprite melter`:
    case $monster`junksprite sharpener`:
      set(
        "auto_junkspritesencountered",
        get("auto_junkspritesencountered", 0) + 1,
      );
      break;
  }

  combat_status_reset();
  removeProperty("auto_funCombatHandler"); //ocrs specific tracker
  removeProperty("auto_funPrefix"); //ocrs specific tracker
  set("auto_combatHandlerThunderBird", 0);
  set("_auto_combatTracker_MortarRound", -1); //tracks which round we used Stuffed Mortar Shell in.
  //log some important info.
  //some stuff is redundant to the pre_adventure function print_footer() so it will not be logged here
  let tolog: string = `auto_combat initialized fighting [${enemy}]: atk = ${monsterAttack()}. def = ${monsterDefense()}. HP = ${monsterHp()}. LA = ${monsterLevelAdjustment()}`;
  if (in_wildfire()) {
    tolog += `. fire = ${myLocation().fireLevel}`;
  }
  auto_log_info(tolog, "blue");
}

// parses one auto_combatDirective token ("skill X", "item X[, Y]", attack/pickpocket/runaway)
function auto_combatDirectiveAction(doThis: string): CombatMacroReturns {
  if (doThis === "attack" || doThis === "pickpocket" || doThis === "runaway") {
    return doThis;
  }
  if (doThis.startsWith("skill ")) {
    return toSkill(doThis.slice("skill ".length));
  }
  if (doThis.startsWith("item ")) {
    const items = doThis
      .slice("item ".length)
      .split(",")
      .map((name) => toItem(name.trim()));
    return items.length > 1 ? items : items[0];
  }
  auto_abort(`Unknown auto_combatDirective action: ${doThis}`);
}

export function auto_combatHandler(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  if (
    round_1 > defaultRoundLimit() &&
    !$monsters`The Man, The Big Wisniewski`.includes(enemy)
  ) {
    //war bosses can go to round 50
    if (auto_canUse($skill`Implode Universe`)) {
      return auto_useSkill($skill`Implode Universe`, true);
    }
    auto_abort(
      `Some sort of problem occurred, it is past round ${defaultRoundLimit()} but we are still in non-gremlin combat...`,
    );
  }

  if (round_1 > 45) {
    auto_abort(
      "Some sort of problem occurred, it is past round 45 but we are still in a combat with a war boss...",
    );
  }

  auto_combatInitialize(round_1, enemy, text); //reset properties on round 0 of a new combat

  set("auto_combatHP", myHp());
  set("auto_diag_round", round_1);

  if (in_ocrs()) {
    ocrs_combat_helper(text);
    enemy = lastMonster();
  }

  if (in_awol()) {
    awol_combat_helper(text);
  }

  if (in_pokefam()) {
    if (gitExists("Ezandora-Helix-Fossil")) {
      auto_log_info("Combat via Ezandora:", "green");
      cliExecute("Pocket Familiars");
      return undefined; //does not matter what it returns here. the cli_execute above does the entire combat
    }
  }
  //If in Avant Guard, want to make sure the enemy is set correctly to the bodyguard
  //If waffle has been used ignore and just use enemy as set in combat handler
  if (
    in_avantGuard() &&
    ag_is_bodyguard() &&
    get("_auto_combatState") !== "(it11311)"
  ) {
    enemy = toMonster(
      substring(
        get("lastEncounter"),
        0,
        indexOf(get("lastEncounter"), " acting as"),
      ),
    );
  }

  disguises_combat_helper(round_1, enemy, text); //disguise delimit mask identification
  fotd_combat_helper(); //fall of the dinosaurs dino identification

  if (get("auto_combatDirective") !== "") {
    const actions: Map<number, string> = new Map(
      splitString(get("auto_combatDirective"), ";").map((_v, _i) => [_i, _v]),
    );
    let idx: number = 0;
    if (round_1 === 0) {
      if ((actions.get(0) ?? "") !== "start") {
        set("auto_combatDirective", "");
        idx = -1;
      } else {
        idx = 1;
      }
    }
    if (idx >= 0) {
      let doThis: string = actions.get(idx) ?? "";
      while (
        containsText(doThis, "(") &&
        containsText(doThis, ")") &&
        idx < actions.size
      ) {
        combat_status_add(doThis as CombatStatusType);
        idx++;
        if (idx >= actions.size) {
          break;
        }
        doThis = actions.get(idx) ?? "";
      }
      let restore: string = "";
      for (let i: number = idx + 1; i < actions.size; i++) {
        restore += actions.get(i) ?? "";
        if (i + 1 < actions.size) {
          restore += ";";
        }
      }
      set("auto_combatDirective", restore);
      if (idx < actions.size) {
        return auto_combatDirectiveAction(doThis);
      }
    }
  }
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  let retval: CombatMacroReturns = auto_combatDefaultStage1(
    round_1,
    enemy,
    text,
  );
  if (retval !== undefined) {
    return retval;
  }
  // stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
  retval = auto_combatDefaultStage2(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // stage 3 = debuff: delevel, stun, curse, damage over time
  retval = auto_combatDefaultStage3(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
  retval = auto_combatDefaultStage4(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // stage 5 = kill
  retval = auto_combatDefaultStage5(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }

  auto_abort(
    "We reached the end of combat script without finding anything to do",
  );
  return undefined;
}
