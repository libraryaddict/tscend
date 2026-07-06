import { abort, getProperty, Item, itemAmount, Location, max, meatCost, min, myAdventures, myBasestat, myBuffedstat, myDaycount, myLevel, myMeat, myPath, Path, pullsRemaining, runChoice, setProperty, Skill, Stat, toBoolean, toInt, turnsPlayed, visitUrl } from "kolmafia";
import { pull_meat } from "../auto_acquire";
import { autoAdv$2, autoLuckyAdv$1 } from "../auto_adventure";
import { addToMaximize, simValue } from "../auto_equipment";
import { handleFamiliar$1, lookupFamiliarDatafile } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { auto_have_skill, auto_log_debug$1, auto_log_info$1, auto_log_warning, autoMaximize, cloversAvailable$1, meatReserve } from "../auto_util";
import { zone_isAvailable } from "../auto_zone";
import { auto_haveMobiusRing } from "../iotms/mr2025";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/adventurer_meats_world.ash
export function in_amw(): boolean
{
	return myPath() === Path.get("Adventurer Meats World");
}

export function amw_initializeSettings(): void
{
	if (!in_amw())
	{
		return;
	}
	setProperty("auto_wandOfNagamar", false.toString());
	setProperty("auto_shouldMeatLevel", false.toString());
}
// Functions used in bits outside the amw universe

export function amw_canAfford(sk: Skill): boolean
{
	return myMeat() >= 10 + meatCost(sk);
}
// if false, socp will not be preferred (e.g. won't be more preferred than a fairychaun when item is wanted)
// additionally, a meat familiar will be selected if not necessary for anything else
export function amw_wantMeat(): boolean
{
	if (!in_amw() || amw_calculateReserve() + 100 < myMeat())
	{
		return false;
	}
	return true;
}
//#######################################################################################################
// Adventure-Buying Functions
// Calculates how many adventures we get in the smallest bundle/package/whatever
function amw_advPerTrade(): number
{
	let advs_per_trade: number = 10;
	if (auto_have_skill(Skill.get("Pork Belly")))
	{
		advs_per_trade += 1;
	}
	if (auto_have_skill(Skill.get("Umami")))
	{
		advs_per_trade += 1;
	}
	if (auto_have_skill(Skill.get("Grass-Fed")))
	{
		advs_per_trade += 1;
	}
	return advs_per_trade;
}
// Parses the cost of the (adv_bundles)-th bundle
// if non-cumulative, subtracts the cost of the previous bundles to calculate the cost of the "last" trade of 10-13 advs in the bundle
// function is currently unused (calculateReserve is sometimes called from pre_adventure and visiting url can cause issues with that)
function amw_advBundleCost(adv_bundles: number, cumulative: boolean): number {
	if (adv_bundles > 5 || adv_bundles < 1)
	{
		abort(`I can't calculate the cost of the ${adv_bundles.toString()}-th bundle!`);
	}
	const adventure_count: number = adv_bundles * amw_advPerTrade();
	const amino_sac: string = visitUrl("place.php?whichplace=meatground&action=meatground_turns");
   	const adv_meat_matcher: AshMatcher = new AshMatcher(`"Get ${adventure_count.toString()} Adventures">[^>]*>[^>]*>s*([0-9]+) meat`, amino_sac);
	let meat_cost: number = 0;
	if (adv_meat_matcher.find()) {
		meat_cost = toInt(adv_meat_matcher.group(1));
	}
	if (adv_bundles !== 1 && !cumulative)
	{
		meat_cost = meat_cost - amw_advBundleCost(adv_bundles - 1, true);
	}
	return meat_cost;
}
function amw_advBundleCost$1(adv_bundles: number): number {
	return amw_advBundleCost(adv_bundles, true);
}
// attempt to buy the cheapest bundle of advs
export function amw_buyAdv(): boolean
{
	const starting_meat: number = myMeat();
	if (starting_meat + 50 < amw_advBundleCost$1(1) || isAboutToPowerlevel() && amw_advBundleCost$1(
		// if true, can't afford adventures
		1) > 2000 && myLevel() < 13)
	{ // don't want to be spending more on adventures
		// if it's greater than our mpa and we are powerleveling. note the big jump between the 11th and 12th trade; ~1200 --> ~7000
		return false;
	}

	auto_log_debug$1(`Buying ${amw_advPerTrade().toString()} adventures`);
	visitUrl("place.php?whichplace=meatground&action=meatground_turns");
	const url: string = "choice.php?whichchoice=1593&pwd&option=1";
	visitUrl(url, true);
	// successful if meat was spent
	if (myMeat() < starting_meat) { return true; }
	return false;
}
//#######################################################################################################
// Skill & Stat Buying functions

function amw_buySubstat(st: Stat, numberToBuy: number): boolean
{
// buys in terms of substats, whether st is a stat or a substat
	auto_log_info$1(`Buying ${numberToBuy.toString()} ${st.toString()}`);
	if (numberToBuy > myMeat()) { return false; }
	// setting which substat to buy
	let option: number = 0;
	if (st === Stat.get("Muscle") || st === Stat.get("SubMuscle")) {
		option = 1;
	}
	if (st === Stat.get("Mysticality") || st === Stat.get("SubMysticality")) {
		option = 2;
	}
	if (st === Stat.get("Moxie") || st === Stat.get("SubMoxie")) {
		option = 3;
	}

	if (option !== 0) {
		visitUrl("place.php?whichplace=meatground&action=meatground_stats");
		const url: string = `choice.php?whichchoice=1592&pwd&option=${option.toString()}&num=${numberToBuy.toString()}`;
		visitUrl(url, true);
		return true;
	}
	return false;
}
// reserves meat from being spent on stats
function amw_calculateReserve(): number {
	const current_level: number = myLevel();
	let reserve: number = 0;
	if (current_level <= 6)
	{
		reserve = 500;
	}
	else if (current_level <= 8)
	{
		reserve = 1250;
	}
	else if (current_level <= 9)
	{
		reserve = 2100;
	}
	else if (current_level <= 10)
	{
		reserve = 4500;
	}
	else {
		reserve = 6500; // enough to ensure that travel documents + shore won't bankrupt us
	}
	// meatReserve is more conservative (counts all quests) than this function at a high level.
	// If it's lower than our reserve, we're done with quest obligations and can save less
	if (myLevel() > 10)
	{
		reserve = min(reserve, meatReserve());
		// but in no cases reserve less than 1500 meat at levels >10
		// (for a high chance of the 11th trade at 1210. the cost of the 12th trade is 7200)
		reserve = max(reserve, 1500);
	}
	return reserve;
}

class amw_statAmount {
	constructor(
		public st: Stat = Stat.none,
		public amount: number = 0
	) {}
}
// returns a record of the substat and how much of that substat we want for our next skill(s)
// prioritizing getting most of the skills currently. Maintains 50mus/70mys/Lvl13mox after reaching 100/110/lvl13.
// also, some thresholds are skill-based to allow for deleveling (esp. BCZ)
// (i.e. we don't need 110 mys anymore after we get the skill, so ok to not re-level)
function amw_nextSkillSubstats(): amw_statAmount {
	const goal: amw_statAmount = new amw_statAmount();
	// getting elemental res for kitchen
	if (myBasestat(Stat.get("Muscle")) < 10)
	{
		goal.st = Stat.get("SubMuscle");
		goal.amount = 100;
		return goal;
	}
	else if (myBasestat(
	// survivability
	Stat.get("Moxie")) < 17)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 289;
		return goal;
	}
	else if (myBasestat(
	// getting some HP
	Stat.get("Muscle")) < 30)
	{
		goal.st = Stat.get("SubMuscle");
		goal.amount = 900;
		return goal;
	}
	else if (myBasestat(
	// survivability
	Stat.get("Moxie")) < 30)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 900;
		return goal;
	}
	else if (myBasestat(
	// more elemental res/item drop/famwt/in-combat heal/elem dmg
	Stat.get("Mysticality")) < 50)
	{
		goal.st = Stat.get("SubMysticality");
		goal.amount = 2500;
		return goal;
	}
	else if (myBasestat(
	// +1 adv per bundle
	Stat.get("Mysticality")) < 70)
	{
		goal.st = Stat.get("SubMysticality");
		goal.amount = 4900;
		return goal;
	}
	else if (myBasestat(
	// +20 adv per day/survivability
	Stat.get("Moxie")) < 50)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 2500;
		return goal;
	}
	else if (myBasestat(
	// item/meat cute and lvl 11. lvl 11 not necessary if moxie is already our "mainstat"
	Stat.get("Mysticality")) < 104 && myBasestat(Stat.get("Moxie")) < 104 || !auto_have_skill(Skill.get("Meat Cute")))
	{
		goal.st = Stat.get("SubMysticality");
		goal.amount = 10816;
		return goal;
	}
	else if (myBasestat(
	// -combat, elemental res
	Stat.get("Moxie")) < 90)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 8100;
		return goal;
	}
	else if (myBasestat(
	// tad more hp. necessary??
	Stat.get("Muscle")) < 50)
	{
		goal.st = Stat.get("SubMuscle");
		goal.amount = 2500;
		return goal;
	}
	else if (myBasestat(
	// +1 adv per bundle/lvl 12
	Stat.get("Moxie")) < 125)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 15625;
		return goal;
	}
	else if (!auto_have_skill(
	// +1 adv per bundle
	Skill.get("Pork Belly")))
	{
		goal.st = Stat.get("SubMuscle");
		goal.amount = 10000;
		return goal;
	}
	else if (!auto_have_skill(
	// initiative
	Skill.get("Tender Loins")))
	{
		goal.st = Stat.get("SubMysticality");
		goal.amount = 12100;
		return goal;
	}
	else if (myDaycount() > 1 && myBasestat(
	// level 13 if not d1
	Stat.get("Moxie")) < 148)
	{
		goal.st = Stat.get("SubMoxie");
		goal.amount = 21904;
		return goal;
	}

	goal.amount = 0; //represents no more stats wanted
	return goal;
}
// returns substats needed to get to next level
function amw_nextLevelSubstats(): amw_statAmount {
	let next_level: number = 0;
	const goal: amw_statAmount = new amw_statAmount();
	next_level = myLevel() + 1;
	let mainstat: Stat = Stat.get("SubMysticality");
	// which stat is our mainstat should be mostly consistent with the priority of amw_nextSkillSubstats()
	// the difference between that function and this one is that this focuses on leveling priority if we have to meatlevel,
	// while the other one focuses on acquiring skills
	if (next_level === 12 || next_level === 13) {
		mainstat = Stat.get("SubMoxie");
	}
	goal.st = mainstat;
	goal.amount = ((next_level - 1) ** 2 + 4) ** 2;
	return goal;
}
// returns how many substats we can afford of the goal after considering whether we're meatleveling, our goal amount, and our current meat
function amw_substatsBuyable(goal: amw_statAmount, meatleveling: boolean): number {
	let meat_reserve: number = 0;
	// make sure to save some meat. but at lvl 10 no point in going to lvl 11 if we can't shore anyway, so no point in lowering our reserve to meatlevel then
	if (!meatleveling || myLevel() === 10) { meat_reserve = amw_calculateReserve(); }
	else { // possibly ok to spend down if we can level up and are meatleveling. except lvl 11 bc we need to shore anyway.
	meat_reserve = 50; }

	if (meat_reserve >= myMeat()) { // no meat unreserved to spend on stats
	return 0; }
	const substats_to_goal: number = goal.amount - myBasestat(goal.st);
	auto_log_debug$1(`Substats to next goal: ${substats_to_goal.toString()}`);

	if (!meatleveling)
	{
		// return either the meat within budget or the substats we need to reach the goal
		return min(myMeat() - meat_reserve, substats_to_goal);
	}
	else if (myMeat() - meat_reserve >= substats_to_goal)
	{
	// only dip into our reserves to meatlevel if we can reach the next level
		return substats_to_goal;
	}
	else { return 0; }
}
// by default we aren't meatleveling
function amw_substatsBuyable$1(goal: amw_statAmount): number {
	return amw_substatsBuyable(goal, false);
}
// decides whether or not to buy stats, and how much. Acts differently if we're meatleveling. amw_buySubstats does the actual purchasing
function amw_buyStats(meatleveling: boolean): boolean {
	let next: amw_statAmount = new amw_statAmount();
	if (meatleveling)
	{
		// fetch substats to get to next level
		next = amw_nextLevelSubstats();
	}
	else {
	// fetch substats to get to next desired skill
	next = amw_nextSkillSubstats(); }

	if (next.amount !== 0)
	{
		const amountToBuy: number = amw_substatsBuyable(next, meatleveling);
		if (amountToBuy > 0)
		{
			return amw_buySubstat(next.st, amountToBuy);
		}
	}
	return false;
}
function amw_buyStats$1(): boolean {
	return amw_buyStats(false); // do not meatlevel by default
}
//#######################################################################################################
// Powerleveling Functions
// will go to next skill goal if skills = true
// will go to next level goal if skills = false
function LX_attemptPowerLevelMeat$1(skills: boolean): boolean {
	if (!isAboutToPowerlevel())
	{ //determined that the softblock on quests waiting for optimal conditions is still on
		auto_log_warning("Hmmm, we need to stop being so feisty about quests...", "red");
		setProperty("auto_powerLevelLastLevel", myLevel().toString()); //release softblock until you level up
		setProperty("auto_powerLevelAdvCount", (0).toString());
		return true; //restart the main loop to give those quests a chance to run now that the softblock is released.
	}
	// tells other parts of the script to get more meat in the future (quest ordering, clovering for KGE, pulling meat)
	if (!toBoolean(getProperty("auto_shouldMeatLevel"))) { setProperty("auto_shouldMeatLevel", "true"); }
	// setting the parameter of buyStats to true drastically lowers meat reserve requirements. If it returns true, we were able to reach the next level
	if (amw_buyStats(!skills)) { return true; }
	// make sure we prioritize getting meat appropriately
	addToMaximize("200meat");
	autoMaximize("meat drop", false);
	handleFamiliar$1(lookupFamiliarDatafile("meat"));

	const meatDrop_1: number = toInt(simValue("Meat Drop"));
	// "best" meatleveling zone at top
	if (meatDrop_1 >= 300 && zone_isAvailable(Location.get("The Hidden Hospital"), true))
	{
		// could lower meatDrop a bit when janitor is banished
		return autoAdv$2(Location.get("The Hidden Hospital"));
	}
	else if (zone_isAvailable(Location.get("The Haunted Bedroom"), true))
	{
		return autoAdv$2(Location.get("The Haunted Bedroom"));
	}
	else if (zone_isAvailable(Location.get("The Icy Peak"), false))
	{
		return autoAdv$2(Location.get("The Icy Peak"));
	}
	else if (zone_isAvailable(Location.get("Cobb's Knob Treasury"), true))
	{
		return autoAdv$2(Location.get("Cobb's Knob Treasury"));
	}
	else if (myAdventures() > 3)
	{
		visitUrl("place.php?whichplace=town&action=town_oddjobs");
		runChoice(1);
		return true;
		// 93? MPA, odd jobs board :p
	}
	return false;
}
// as it's in the function name, assume we're meat*leveling* not meat*skilling* by default
export function LX_attemptPowerLevelMeat(): boolean {
	return LX_attemptPowerLevelMeat$1(false);
}
// stricter than amw_wantMeat() because this changes the quest order. If true, levels 4, 5, 7 quests may be done early.
export function LX_needMeatSkills(): boolean {
	if (toBoolean(getProperty("auto_shouldMeatLevel")) && myLevel() < 12) { return true; }
	return false;

}
//#######################################################################################################
// The core AMW function that gets called every loop of doTasks()!
//if something in this function returns true then it will restart the loop and get called again.

export function LM_adventurerMeatsWorld(): boolean {
	if (!in_amw())
	{
		return false;
	}
	// if we've meatleveled before, we might want to clover for meat or pull it if available
	if (toBoolean(getProperty("auto_shouldMeatLevel")) && myLevel() < 12 && pullsRemaining() > 5) {
		let inf_loop_cap: number = 0; //prevents infinite loop if there's a problem with pull_meat (i.e. user does not have enough meat in Hangks)
		while (pullsRemaining() > 5 && inf_loop_cap < 16)
		{
			pull_meat(myMeat() + 1000);
			inf_loop_cap = inf_loop_cap + 1;
		}
	}
	if (toBoolean(getProperty("auto_shouldMeatLevel")) && cloversAvailable$1() > 1 && myBuffedstat(Stat.get("Moxie")) > 25 && myLevel() < 12 && zone_isAvailable(Location.get("Cobb's Knob Treasury"), true))
	{
		if (amw_buyStats$1()) { // before we lucky adventure, we want to make sure we wouldn't buy our way to lvl 12
		return true; }
		// we also need to make sure we have the key, might need to burn an adventure to catch the superlikely
		// otherwise autoscend gets confused and aborts when it enounters the superlikely for the key instead of the lucky! nc
		if (itemAmount(Item.get("Cobb's Knob lab key")) < 1) {
			return autoAdv$2(Location.get("Cobb's Knob Treasury"));
		}
		return autoLuckyAdv$1(Location.get("Cobb's Knob Treasury"));
	}

	if (amw_buyStats$1()) { // want to run again to put meat towards the next goal if applicable
	return true; }
	// if user hasn't gotten meat to get skills/stats after turn 8 we want to make sure we get some
	// to avoid beaten up and to progress properly. we unlock in-combat heal at mys = 30.
	// mobius ring and/or pulling meat avoid this
	if (turnsPlayed() > 8 && myBasestat(Stat.get("Mysticality")) < 30 && !auto_haveMobiusRing())
	{
		auto_log_info$1("Low skills after 8 turns, going to meatfarm");
		return LX_attemptPowerLevelMeat$1(true);
	}
	return false;
}
