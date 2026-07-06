import { Monster, Skill, abort, cliExecute, containsText, getProperty, gitExists, indexOf, lastMonster, monsterAttack, monsterDefense, monsterHp, monsterLevelAdjustment, myHp, myLocation, removeProperty, setProperty, splitString, stopCounter, substring, toInt, toMonster } from "kolmafia";
import { auto_log_info } from "../auto_util";
import { awol_combat_helper } from "./auto_combat_awol";
import { auto_combatDefaultStage1 } from "./auto_combat_default_stage1";
import { auto_combatDefaultStage2 } from "./auto_combat_default_stage2";
import { auto_combatDefaultStage3 } from "./auto_combat_default_stage3";
import { auto_combatDefaultStage4 } from "./auto_combat_default_stage4";
import { auto_combatDefaultStage5 } from "./auto_combat_default_stage5";
import { disguises_combat_helper } from "./auto_combat_disguises_delimit";
import { fotd_combat_helper } from "./auto_combat_fall_of_the_dinosaurs";
import { ocrs_combat_helper } from "./auto_combat_ocrs";
import { canUse$2, combat_status_add, defaultRoundLimit, useSkill$1 } from "./auto_combat_util";
import { ag_is_bodyguard, in_avantGuard } from "../paths/avant_guard";
import { in_awol } from "../paths/avatar_of_west_of_loathing";
import { in_ocrs } from "../paths/one_crazy_random_summer";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_wildfire } from "../paths/wildfire";

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
function auto_combatInitialize(round_1: number, enemy: Monster, text: string): void
{
	//reset settings for combat at the start of every combat
	if (round_1 !== 0)
	{ //Yes round 0, really.
		return;
	}

	switch (enemy)
	{
		case Monster.get("Government agent"):
			setProperty("_portscanPending", false.toString());
			stopCounter("portscan.edu");
			break;
		case Monster.get("possessed wine rack"):
			setProperty("auto_wineracksencountered", (toInt(getProperty("auto_wineracksencountered")) + 1).toString());
			break;
		case Monster.get("cabinet of Dr. Limpieza"):
			setProperty("auto_cabinetsencountered", (toInt(getProperty("auto_cabinetsencountered")) + 1).toString());
			break;
		case Monster.get("junksprite bender"):
		case Monster.get("junksprite melter"):
		case Monster.get("junksprite sharpener"):
			setProperty("auto_junkspritesencountered", (toInt(getProperty("auto_junkspritesencountered")) + 1).toString());
			break;
	}

	removeProperty("_auto_combatState");
	removeProperty("auto_funCombatHandler"); //ocrs specific tracker
	removeProperty("auto_funPrefix"); //ocrs specific tracker
	setProperty("auto_combatHandlerThunderBird", "0");
	setProperty("_auto_combatTracker_MortarRound", (-1).toString()); //tracks which round we used Stuffed Mortar Shell in.
	//log some important info.
	//some stuff is redundant to the pre_adventure function print_footer() so it will not be logged here
	let tolog: string = `auto_combat initialized fighting [${enemy}]: atk = ${monsterAttack()}. def = ${monsterDefense()}. HP = ${monsterHp()}. LA = ${monsterLevelAdjustment()}`;
	if (in_wildfire())
	{
		tolog += `. fire = ${myLocation().fireLevel}`;
	}
	auto_log_info(tolog, "blue");
}

export function auto_combatHandler(round_1: number, enemy: Monster, text: string): string
{
	if (round_1 > defaultRoundLimit() && !(Monster.get(["The Man", "The Big Wisniewski"]).includes(enemy)))
	{ //war bosses can go to round 50
		if (canUse$2(Skill.get("Implode Universe")))
		{
			return useSkill$1(Skill.get("Implode Universe"), true);
		}
		abort(`Some sort of problem occurred, it is past round ${defaultRoundLimit()} but we are still in non-gremlin combat...`);
	}

	if (round_1 > 45)
	{
		abort("Some sort of problem occurred, it is past round 45 but we are still in a combat with a war boss...");
	}

	auto_combatInitialize(round_1, enemy, text); //reset properties on round 0 of a new combat
	let retval: string = "";
	let blocked: boolean = containsText(text, "(STUN RESISTED)");
	setProperty("auto_combatHP", myHp().toString());
	setProperty("auto_diag_round", round_1.toString());

	if (in_ocrs())
	{
		enemy = ocrs_combat_helper(text);
		enemy = lastMonster();
	}

	if (in_awol())
	{
		awol_combat_helper(text);
	}

	if (in_pokefam())
	{
		if (gitExists("Ezandora-Helix-Fossil"))
		{
		auto_log_info("Combat via Ezandora:", "green");
		let ignore: boolean = cliExecute("Pocket Familiars");
		return ""; //does not matter what it returns here. the cli_execute above does the entire combat
		}
	}
	//If in Avant Guard, want to make sure the enemy is set correctly to the bodyguard
	//If waffle has been used ignore and just use enemy as set in combat handler
	if (in_avantGuard() && ag_is_bodyguard() && getProperty("_auto_combatState") !== "(it11311)")
	{
		enemy = toMonster(substring(getProperty("lastEncounter"), 0, indexOf(getProperty("lastEncounter"), " acting as")));
	}

	disguises_combat_helper(round_1, enemy, text); //disguise delimit mask identification
	fotd_combat_helper(); //fall of the dinosaurs dino identification

	if (getProperty("auto_combatDirective") !== "")
	{
		let actions: Map<number, string> = new Map(splitString(getProperty("auto_combatDirective"), ";").map((_v, _i) => [_i, _v]));
		let idx: number = 0;
		if (round_1 === 0)
		{
			if ((actions.get(0) ?? actions.set(0, "").get(0)) !== "start")
			{
				setProperty("auto_combatDirective", "");
				idx = -1;
			}
			else {
				idx = 1;
			}
		}
		if (idx >= 0)
		{
			let doThis: string = (actions.get(idx) ?? actions.set(idx, "").get(idx));
			while (containsText(doThis, "(") && containsText(doThis, ")") && idx < actions.size)
			{
				combat_status_add(doThis);
				idx++;
				if (idx >= actions.size)
				{
					break;
				}
				doThis = (actions.get(idx) ?? actions.set(idx, "").get(idx));
			}
			let restore: string = "";
			for (let i: number = idx + 1; i < actions.size; i++)
			{
				restore += (actions.get(i) ?? actions.set(i, "").get(i));
				if (i + 1 < actions.size)
				{
					restore += ";";
				}
			}
			setProperty("auto_combatDirective", restore);
			if (idx < actions.size)
			{
				return doThis;
			}
		}
	}
	// stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
	retval = auto_combatDefaultStage1(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
	retval = auto_combatDefaultStage2(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// stage 3 = debuff: delevel, stun, curse, damage over time
	retval = auto_combatDefaultStage3(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
	retval = auto_combatDefaultStage4(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// stage 5 = kill
	retval = auto_combatDefaultStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }

	abort("We reached the end of combat script without finding anything to do");
	return "";
}