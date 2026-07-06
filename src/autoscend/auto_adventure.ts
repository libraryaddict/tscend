import { adv1, choiceFollowsFight, cliExecute, containsText, fightFollowsChoice, getProperty, handlingChoice, inMultiFight, lastChoice, Location, Monster, myTurncount, print, removeProperty, runChoice, runCombat, setProperty, visitUrl } from "kolmafia";
import { auto_log_debug, auto_log_info, auto_log_warning, cloversAvailable, cloverUsageFinish, cloverUsageInit, cloverUsageRestart } from "./auto_util";
import { zone_isAvailable } from "./auto_zone";
import { ed_handleAdventureServant, isActuallyEd } from "./paths/actually_ed_the_undying";
import { in_pokefam } from "./paths/pocket_familiars";
import { auto_edCombatHandler } from "./combat/auto_combat_ed";
import { auto_combatHandler } from "./combat/auto_combat";

export type CombatMacro = (round:number, monster:Monster, text:string) => string;

// autoAdv is used to automate adventuring *once* in adventure.php zones
// it will (should?) handle the complete adventure from start to finish regardless of
// how many choices or combats it encounters (this is mafia's adv1 behaviour)
// TODO: seems to return false even if it adventures successfully but doesn't cost an adventure (mafia issue?)
//Defined in autoscend/auto_adventure.ash
export function autoAdv(num: number, loc: Location, option: CombatMacro): boolean
{ //num is ignored
	if (!zone_isAvailable(loc, true)) {
		auto_log_warning(`Can't get to ${loc} right now.`, "red");
		return false;
	}

	removeProperty("_auto_combatState");
	setProperty("auto_diag_round", (0).toString());
	setProperty("nextAdventure", loc.toString());
	if (!option)
	{
		if (isActuallyEd())
		{
			option = auto_edCombatHandler;
		} else {
			option = auto_combatHandler;
		}
	}
	// adv1 can erroneously return false for "choiceless" non-combats
	// see https://kolmafia.us/showthread.php?25370-adv1-returns-false-for-quot-choiceless-quot-choice-adventures
	// undo all this when (if?) that ever gets fixed
	const previousEncounter: string = getProperty("lastEncounter");
	const turncount: number = myTurncount();
	print(`Doing option ${  option}`);
	let advReturn: boolean = adv1(loc, -1, option);
	if (!advReturn)
	{throw "aborts";
		auto_log_debug("adv1 returned false for some reason. Did we actually adventure though?", "blue");
		if (getProperty("lastEncounter") !== previousEncounter)
		{
			auto_log_debug(`Looks like we may have adventured, lastEncounter was ${previousEncounter}, now ${getProperty("lastEncounter")}`, "blue");
			advReturn = true;
		}
		if (myTurncount() > turncount)
		{
			auto_log_debug(`Looks like we may have adventured, turncount was ${turncount}, now ${myTurncount()}`, "blue");
			advReturn = true;
		}
	}
	return advReturn;
}

export function autoAdv$1(num: number, loc: Location): boolean
{ //num is ignored
	return autoAdv(num, loc, null);
}

export function autoAdv$2(loc: Location): boolean
{
	return autoAdv(1, loc, null);
}

function autoAdv$3(loc: Location, option: CombatMacro): boolean
{
	return autoAdv(1, loc, option);
}

export function autoLuckyAdv(loc: Location, override: boolean): boolean
{
	let gotLucky: boolean = false;
	if (cloversAvailable(override) > 0)
	{
		cloverUsageInit(override);
		gotLucky = autoAdv$2(loc);
		if (cloverUsageRestart())
		{
			gotLucky = autoAdv$2(loc);
		}
		cloverUsageFinish();
	}
	return gotLucky;
}

export function autoLuckyAdv$1(loc: Location): boolean
{
	// overload to not override clover usage by default as this is the general case
	return autoLuckyAdv(loc, false);
}
// autoAdvBypass is used to automate adventuring *once* in non-adventure.php zones
// it will (should?) handle the complete adventure from start to finish regardless of
// how many choices or combats it encounters
export function autoAdvBypass(urlGetFlags: number, url: Map<number, string>, loc: Location, option: CombatMacro): boolean
{
	if (!zone_isAvailable(loc, true))
	{
		// reinstate this check for now. Didn't fix the War boss fight outside of Ed & KoE,
		// will work around that by passing Noob Cave as location until this is refactored.
		auto_log_warning(`Can't get to ${loc} right now.`, "red");
		return false;
	}

	setProperty("nextAdventure", loc.toString());
	cliExecute("auto_pre_adv.js");
	removeProperty("_auto_combatState");
	setProperty("auto_diag_round", (0).toString());

	if (!option)
	{
		if (isActuallyEd())
		{
			option = auto_edCombatHandler;
		} else {
			option = auto_combatHandler;
		}
	}

	if (isActuallyEd())
	{
		ed_handleAdventureServant(loc);
	}

	auto_log_info(`About to start a combat indirectly at ${loc}... (${url.size}) accesses required.`, "blue");
	let page: string = "";
	for (const [idx, it] of url)
	{
		if ((urlGetFlags & 1) === 1)
		{
			page = visitUrl(it, false);
		}
		else {
			page = visitUrl(it);
		}
		urlGetFlags /= 2;
	}
	// handle the initial combat or choice the easy way.
	let combatPage: string = ">Combat";
	if (in_pokefam()) {
		combatPage = ">Fight!";
	}
	if (containsText(page, combatPage)) {
		auto_log_info(`autoAdvBypass has encountered a combat!`, "green");
		runCombat(option);
	} else {
		const choice_id: number = lastChoice();
		auto_log_info(`autoAdvBypass has encountered a choice: ${choice_id}`, "green");
		runChoice(-1);
	}
	// this should handle stuff like Ed's resurrect/fight loop
	// and anything else that chains combats & choices in any order
	while (fightFollowsChoice() || choiceFollowsFight() || inMultiFight() || handlingChoice()) {
		if ((fightFollowsChoice() || inMultiFight()) && (!choiceFollowsFight() && !handlingChoice())) {
			auto_log_info(`autoAdvBypass has encountered a combat!`, "green");
			runCombat(option);
		}
		if (choiceFollowsFight() || handlingChoice()) {
			const choice_id: number = lastChoice();
			auto_log_info(`autoAdvBypass has encountered a choice: ${choice_id}`, "green");
			runChoice(-1);
		}
	}

	cliExecute("auto_post_adv.js");
	// Encounters that need to generate a false so we handle them manually should go here.
	if (getProperty("lastEncounter") === "Travel to a Recent Fight")
	{
		return false;
	}
	if (getProperty("lastEncounter") === "Rationing out Destruction")
	{
		return false;
	}
	if (getProperty("lastEncounter") === "Rainy Fax Dreams on your Wedding Day")
	{
		return false;
	}
	return true;
}

export function autoAdvBypass$1(url: string, loc: Location): boolean
{
	return autoAdvBypass$2(url, loc, null);
}

export function autoAdvBypass$2(url: string, loc: Location, option: CombatMacro): boolean
{
	const urlConvert: Map<number, string> = new Map();
	urlConvert.set(0, url);
	return autoAdvBypass(0, urlConvert, loc, option);
}

function autoAdvBypass$3(snarfblat: number, loc: Location): boolean
{
	const page: string = `adventure.php?snarfblat=${snarfblat}`;
	return autoAdvBypass$1(page, loc);
}

function autoAdvBypass$4(snarfblat: number, loc: Location, option: CombatMacro): boolean
{
	const page: string = `adventure.php?snarfblat=${snarfblat}`;
	return autoAdvBypass$2(page, loc, option);
}

function autoAdvBypass$5(snarfblat: number): boolean
{
	return autoAdvBypass$3(snarfblat, Location.get("Noob Cave"));
}

export function autoAdvBypass$6(url: string): boolean
{
	return autoAdvBypass$1(url, Location.get("Noob Cave"));
}

function autoAdvBypass$7(snarfblat: number, option: CombatMacro): boolean
{
	return autoAdvBypass$4(snarfblat, Location.get("Noob Cave"), option);
}

export function autoAdvBypass$8(url: string, option: CombatMacro): boolean
{
	return autoAdvBypass$2(url, Location.get("Noob Cave"), option);
}
