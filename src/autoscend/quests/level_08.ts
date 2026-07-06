import { Effect, Element, Familiar, Item, Location, Monster, Skill, Slot, abort, availableAmount, canInteract, cliExecute, containsText, council, equip, expectedDamage, fullnessLimit, getProperty, haveEffect, haveEquipped, haveSkill, isWearingOutfit, itemAmount, jumpChance, myAdventures, myDaycount, myLevel, myMaxhp, myPath, mySessionAdv, numericModifier, outfit, print, random, runChoice, setProperty, splitString, substring, toBoolean, toInt, toItem, toMonster, visitUrl } from "kolmafia";
import { canPull$1, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$2, autoLuckyAdv$1 } from "../auto_adventure";
import { buffMaintain$3 } from "../auto_buff";
import { autoEquip$1, autoForceEquip$1, autoOutfit, equipMaximizedGear, possessEquipment, possessOutfit, possessOutfit$1 } from "../auto_equipment";
import { handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { provideFamExp$2, providePlusCombat, provideResistances$4 } from "../auto_providers";
import { acquireHP$1 } from "../auto_restore";
import { auto_waitForDay2 } from "../auto_routing";
import { adjustForYellowRayIfPossible$1, auto_can_equip, auto_combatModCap, auto_forceNextNoncombat$1, auto_inRonin, auto_log_debug, auto_log_debug$1, auto_log_info, auto_log_info$1, auto_log_warning, auto_log_warning$1, canSniff, canSummonMonster, canYellowRay$1, internalQuestStatus, summonMonster } from "../auto_util";
import { isSniffed$1 } from "../combat/auto_combat_util";
import { elementalPlanes_access } from "../iotms/elementalPlanes";
import { adjustEdHat } from "../iotms/mr2015";
import { auto_sourceTerminalEducate } from "../iotms/mr2016";
import { catBurglarHeistsLeft } from "../iotms/mr2018";
import { auto_mapTheMonsters } from "../iotms/mr2020";
import { auto_haveGreyGoose, auto_haveTrainSet } from "../iotms/mr2022";
import { auto_getCitizenZone, auto_lostStomach$1 } from "../iotms/mr2023";
import { auto_haveChestMimic, auto_haveMayamCalendar } from "../iotms/mr2024";
import { auto_canEquipAllMcHugeLarge, auto_equipAllMcHugeLarge, auto_haveMcHugeLargeSkis } from "../iotms/mr2025";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { L8_slopeCasual } from "../paths/casual";
import { in_plumber } from "../paths/path_of_the_plumber";
import { is_professor } from "../paths/wereprofessor";
import { wildfire_groar_check } from "../paths/wildfire";
import { robot_delay } from "../paths/you_robot";
import { L7_override } from "./level_07";
import { shenShouldDelayZone } from "./level_11";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/quests/level_08.ash
export function needOre(): boolean
{
	// Determines if we need ore for the trapper or not.

	if (internalQuestStatus("questL08Trapper") > 2)
	{
		return false;
	}
	const oreGoal: Item = toItem(getProperty("trapperOre"));
	if (itemAmount(oreGoal) >= 3)
	{
		return false;
	}
	if (itemAmount(Item.get("asbestos ore")) >= 3 && itemAmount(Item.get("linoleum ore")) >= 3 && itemAmount(Item.get("chrome ore")) >= 3)
	{
		return false;
	}
	return true;
}

function getCellToMine(oreGoal: Item): number
{
	// the mine is an 8*7 grid starting at 0,0 in the top left and each cell has an incrementing identifier starting at 0.
	// however all of row 0, column 0 and column 7 cannot be mined (so it's really a 6*6 grid with really confusing cell ids).
	// hence to translate from the grid to the cell we multiply the row by 8 and add the column
	// e.g. 4,6 becomes 4 + (6 * 8) = 52
	// trapper ores are predominantly found in the top 3 rows (1-3) and occasionally the 4th row.
	// See https://kol.coldfront.net/thekolwiki/index.php/Inside_of_Itznotyerzitz_Mine
	// the information we need is spread between the page (unmined sparkling cells) and the mineLayout1 property (what we got when mined the cell).

	if (!isWearingOutfit("Mining Gear"))
	{
		return 0;
	}

	function parseMineLayout(): Map<number, Item>
	{
		const minedCells: Map<number, Item> = new Map();
		const mineLayout: string = getProperty("mineLayout1");
		if (mineLayout !== "")
		{
			for (const [iter, str] of splitString(substring(mineLayout, 1), "#").entries())
			{
				if (containsText(str, "asbestos ore"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("asbestos ore"));
				}
				else if (containsText(str, "chrome ore"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("chrome ore"));
				}
				else if (containsText(str, "linoleum ore"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("linoleum ore"));
				}
				else if (containsText(str, "loadstone"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("loadstone"));
				}
				else if (containsText(str, "lump of diamond"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("lump of diamond"));
				}
				else if (containsText(str, "meat stack"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("meat stack"));
				}
				else if (containsText(str, "stone of eXtreme power"))
				{
					minedCells.set(toInt(substring(str, 0, 2)), Item.get("stone of eXtreme power"));
				}
			}
		}
		return minedCells;
	}

	function findSparklingCells(minePage: string): Map<number, number>
	{
		const sparkles: Map<number, number> = new Map();
		const mrSparkle: AshMatcher = new AshMatcher("title='Promising Chunk of Wall \\((\\d),(\\d)\\)", minePage);
		while (mrSparkle.find())
		{
			const sparkleCell: number = toInt(mrSparkle.group(1)) + toInt(mrSparkle.group(2)) * 8;
			sparkles.set(sparkleCell, 1); // don't actually care about the value. Just want the cells as keys so we can use contains
		}
		return sparkles;
	}

	function getOrthogonals(cell: number): number[]
	{
		// starting at the cell above, going clockwise
		const orthogonals: number[] = [];
		orthogonals[0] = cell - 8;
		orthogonals[1] = cell + 1;
		orthogonals[2] = cell + 8;
		orthogonals[3] = cell - 1;
		return orthogonals;
	}

	function canMine(cellToCheck: number, rowLimit: number): boolean
	{
		// this is basically bounds checking for cells
		// set rowLimit = 6 to not care about rows (there is no row 7)
		const column: number = cellToCheck % 8;
		if (column < 1 || column > 6)
		{
			return false;
		}
		const row: number = cellToCheck / 8;
		if (row < 1 || row > 6 || row > rowLimit)
		{
			return false;
		}
		return true;
	}

	function isInSideColumn(cellToCheck: number): boolean
	{
		const column: number = cellToCheck % 8;
		if (column === 1 || column === 6)
		{
			return true;
		}
		return false;
	}
	// - Simplest case, a fresh mine cavern
	const mineLayout: string = visitUrl("mining.php?mine=1");
	if (getProperty("auto_minedCells") === "")
	{
		// pick a random column to start between 2-5
		return 50 + random(4); // using 50 as we're in row 6 to start and random returns from 0 to range-1. Hence 6 * 8 + 2
	}
	// - If we have started mining a cavern, lets continue mining the same column upwards until row 3
	const previously_mined: Map<number, string> = new Map(splitString(getProperty("auto_minedCells"), ",").map((_v, _i) => [_i, _v]));
	const num_prev_mined: number = previously_mined.size;
	const lastCell: number = toInt((previously_mined.get(num_prev_mined - 1) ?? previously_mined.set(num_prev_mined - 1, "").get(num_prev_mined - 1)));
	if (num_prev_mined < 4 && (lastCell > 32 && lastCell < 55))
	{
		// mine the square directly above it
		return lastCell - 8;
	}
	// - If we've got to row 3 or above, start searching for ores.
	const minedCells: Map<number, Item> = parseMineLayout();
	const oreSeen: Map<number, number> = new Map();
	for (const [oreCell, oreType] of minedCells)
	{
		if (oreType === oreGoal)
		{
			oreSeen.set(oreCell, 1); // value doesn't matter, just want to count and iterate the keys
		}
	}
	const sparklingCells: Map<number, number> = findSparklingCells(mineLayout);
	const potentialCells: Map<number, number> = new Map();
	let potentialCount: number = 0;
	if (oreSeen.size === 0)
	{
		// - Not found any ore that we're looking for yet
		if (lastCell > 24 && lastCell < 31)
		{
			// get to row 2 as our probability of hitting ore we're looking for is higher.
			return lastCell - 8;
		}
		// find all the sparkling tiles in the top n rows
		// start from the top 2, if we haven't found any there,
		// increase the search space by 1 row and check again until we max out at the 4th row
		// avoid columns 1 and 6 as they limit the search space since we can't mine column 0 or 7.
		// unless we run into a situation where we've mined all the other sparkling cells.
		let rowLimit: number = 2;
		let avoidSides: boolean = true;
		while (potentialCells.size === 0 && rowLimit < 5)
		{
			for (const sparkleCell of sparklingCells.keys())
			{
				if (canMine(sparkleCell, rowLimit))
				{
					if (!isInSideColumn(sparkleCell) || !avoidSides)
					{
						potentialCells.set(potentialCount, sparkleCell);
						potentialCount++;
					}
				}
			}
			rowLimit++;
			if (avoidSides && rowLimit === 5 && potentialCells.size === 0)
			{
				avoidSides = false;
				rowLimit = 2;
			}
		}
	}
	else {
		// - Found at least one ore that we're looking for!
		// search orthogonally from the cells we found our required ore in as ore is always contiguous
		// limit our search to the top 3 rows to begin, if we don't find any cells that meet the criteria
		// increase the limit to the top 4 rows and check again.
		let rowLimit: number = 3;
		while (potentialCells.size === 0 && rowLimit < 5)
		{
			for (const oreCell of oreSeen.keys())
			{
				const orthogonals: number[] = getOrthogonals(oreCell);
				for (const [_, orthoCell] of orthogonals.entries())
				{
					if (canMine(orthoCell, rowLimit) && sparklingCells.has(orthoCell))
					{
						potentialCells.set(potentialCount, orthoCell);
						potentialCount++;
					}
				}
			}
			rowLimit++;
		}
		if (potentialCells.size === 0)
		{
			// we could be in a situation where the loadstone replaced one of our ores and we still need 1 or 2 ores
			// but have exhausted all the twinkling cells adjacent to the ores we've found
			// first lets find the loadstone cell
			let loadstoneCell: number = 0;
			for (const [oreCell, oreType] of minedCells)
			{
				if (oreType === Item.get("loadstone"))
				{
					loadstoneCell = oreCell;
				}
			}
			// now add all twinkling cells adjacent to the loadstone in the top 4 rows to the potential cells
			const orthogonals: number[] = getOrthogonals(loadstoneCell);
			for (const [_, orthoCell] of orthogonals.entries())
			{
				if (canMine(orthoCell, 4) && sparklingCells.has(orthoCell))
				{
					potentialCells.set(potentialCount, orthoCell);
					potentialCount++;
				}
			}
		}
	}
	const numPotentials: number = potentialCells.size;
	// only found one potential, just return it
	if (numPotentials === 1)
	{
		return (potentialCells.get(0) ?? potentialCells.set(0, 0).get(0));
	}
	else if (numPotentials === 0)
	{
		abort("Glitch in the matrix. Please report this to the dev team (preferably with a log and screenshot of your mine");
	}
	// found 2 or more potentials, return a random one of them
	return (potentialCells.get(random(numPotentials)) ?? potentialCells.set(random(numPotentials), 0).get(random(numPotentials)));
}

function L8_getGoatCheese(): boolean
{
	if (internalQuestStatus("questL08Trapper") !== 1)
	{ // step1 = we spoke to trapper to unlock goatlet
		return false;
	}

	if (itemAmount(Item.get("goat cheese")) >= 3)
	{
		return false;
	}
	// If we only need one and goats aren't already sniffed, just pull it.
	if (auto_inRonin() && itemAmount(Item.get("goat cheese")) === 2 && !isSniffed$1(Monster.get("dairy goat")))
	{
		pullXWhenHaveY(Item.get("goat cheese"), 1, itemAmount(Item.get("goat cheese")));
	}
	else if (auto_inRonin() && myDaycount() > 1)
	{
	// or on day 2+ just pull anyway, we have loads of pulls
		pullXWhenHaveY(Item.get("goat cheese"), 1, itemAmount(Item.get("goat cheese")));
	}
	// If we have enough now, just stop here.
	if (itemAmount(Item.get("goat cheese")) >= 3)
	{
		return false;
	}
	// Condider softblocking until day 2 for Mayam
	if (auto_haveMayamCalendar() && itemAmount(Item.get("goat cheese")) === 2)
	{
		if (auto_waitForDay2())
		{
			auto_log_debug$1("Delaying Goatlet waiting for day 2.");
			return false;
		}
	}
	// Actually adventure for cheese
	auto_log_info("Yay for goat cheese!", "blue");
	if (toInt(getProperty("_sourceTerminalDuplicateUses")) === 0)
	{
		auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Duplicate"));
	}
	if (auto_haveGreyGoose() && itemAmount(Item.get("goat cheese")) <= 1)
	{
		auto_log_info$1("Bringing the Grey Goose to emit some drones at a Dairy Goat for cheese, Gromit.");
		handleFamiliar$1(Familiar.get("Grey Goose"));
	}
	if (canSniff(Monster.get("dairy goat"), Location.get("The Goatlet")) && auto_mapTheMonsters())
	{
		auto_log_info$1("Attemping to use Map the Monsters to olfact a Dairy Goat.");
	}
	auto_lostStomach$1(true);

	const retval: boolean = autoAdv$2(Location.get("The Goatlet"));
	auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Portscan"));
	return retval;
}

export function L8_mountainManSummon(): boolean
{
	if (internalQuestStatus("questL08Trapper") < 1 && myLevel() >= 8)
	{
		L8_trapperTalk();
	}
	if (internalQuestStatus("questL08Trapper") !== 1)
	{ // step1 = we spoke to trapper to learn what ores he wants
		return false;
	}
	const oreGoal: Item = toItem(getProperty("trapperOre"));
	const current_ore: number = itemAmount(oreGoal);
	if (current_ore >= 3)
	{
		return false;
	}
	// use a summon if we can guarantee it will be enough via cat burglar
	if (canSummonMonster(Monster.get("mountain man")) && catBurglarHeistsLeft() > 1)
	{
		auto_log_info$1("Trying to summon a mountain man, which the cat will then burgle, hopefully.");
		handleFamiliar$1(Familiar.get("Cat Burglar"));
		return summonMonster(Monster.get("mountain man"));
	}
	// use a summon if we can guarantee it will be enough via pro skateboard and YR
	if (canSummonMonster(Monster.get("mountain man")) && canYellowRay$1())
	{
		const need_dupe: boolean = current_ore < 1;
		const can_mctwist: boolean = auto_can_equip(Item.get("pro skateboard")) && !toBoolean(getProperty("_epicMcTwistUsed"));
		const will_mctwist: boolean = can_mctwist && need_dupe;
		auto_log_info$1(`Trying to summon a mountain man, which we will YR${(will_mctwist ? " and McTwist." : ".")}`);
		adjustForYellowRayIfPossible$1();
		if (will_mctwist)
		{
			autoEquip$1(Item.get("pro skateboard"));
			return summonMonster(Monster.get("mountain man"));
		}
		else if (!need_dupe)
		{
			return summonMonster(Monster.get("mountain man"));
		}
		else {
			return false; // if we need to dupe drops but can't, don't summon.
		}
	}
	return false;
}

function L8_getMineOres(): boolean
{
	if (internalQuestStatus("questL08Trapper") !== 1)
	{ // step1 = we spoke to trapper to learn what ores he wants
		return false;
	}

	const oreGoal: Item = toItem(getProperty("trapperOre"));

	if (itemAmount(oreGoal) >= 3)
	{
		return false;
	}

	if (toMonster(getProperty("chateauMonster")) === Monster.get("mountain man"))
	{
		// apparently this is a thing some people do. Lets add the most basic of support.
		return false;
	}

	L8_mountainManSummon();
	// in softcore we want to pull an ore
	if (canPull$1(oreGoal))
	{
		pullXWhenHaveY(oreGoal, 1, itemAmount(oreGoal));
		if (itemAmount(oreGoal) === 3)
		{
			return true; // pulled successfully the last ore
		}
	}

	if (auto_haveTrainSet() && itemAmount(oreGoal) < 3)
	{
		return false; //will get ore organically through the train set so no need to adventure for it
	}
	// try to clover for the ore
	if (autoLuckyAdv$1(Location.get("Itznotyerzitz Mine")))
	{
		return true;
	}

	if (isAboutToPowerlevel())
	{
		if (!possessOutfit$1("Mining Gear"))
		{
			auto_log_info("Getting Mining Gear.", "blue");
			return autoAdv$2(Location.get("Itznotyerzitz Mine"));
		}
		else if (possessOutfit("Mining Gear", true))
		{
			equipMaximizedGear();
			outfit("Mining Gear");
			acquireHP$1(1);
			auto_log_info("Mining in Itznotyerzitz Mine for Trapper ore", "blue");
			const cell: number = getCellToMine(oreGoal);
			if (cell !== 0)
			{
				setProperty("auto_minedCells", `${getProperty("auto_minedCells")}${cell.toString()},`);
				visitUrl(`mining.php?mine=1&which=${cell.toString()}&pwd`);
				return true;
			}
		}
	}

	return false;
}

export function itznotyerzitzMineChoiceHandler(choice: number): void
{
	auto_log_info(`itznotyerzitzMineChoiceHandler Running choice ${choice}`, "blue");
	if (choice === 18)
	{ // A Flat Miner
		if (possessEquipment(Item.get("miner's pants")))
		{
			if (possessEquipment(Item.get("7-Foot Dwarven mattock")))
			{
				runChoice(3); // get 100 Meat.
			}
			else {
				runChoice(2); // get 7-Foot Dwarven mattock
			}
		}
		else {
			runChoice(1); // get miner's pants
		}
	}
	else if (choice === 19)
	{ // 100% Legal
		if (possessEquipment(Item.get("miner's helmet")))
		{
			if (possessEquipment(Item.get("miner's pants")))
			{
				runChoice(3); // get 100 Meat.
			}
			else {
				runChoice(2); // get miner's pants
			}
		}
		else {
			runChoice(1); // get miner's helmet
		}
	}
	else if (choice === 20)
	{ // See You Next Fall
		if (possessEquipment(Item.get("miner's helmet")))
		{
			if (possessEquipment(Item.get("7-Foot Dwarven mattock")))
			{
				runChoice(3); // get 100 Meat.
			}
			else {
				runChoice(2); // get 7-Foot Dwarven mattock
			}
		}
		else {
			runChoice(1); // get miner's helmet
		}
	}
	else if (choice === 556)
	{ // More Locker Than Morlock
		if (!possessOutfit$1("Mining Gear"))
		{
			runChoice(1); // get an outfit piece
		}
		else {
			runChoice(2); // skip
		}
	}
	else {
		abort("unhandled choice in itznotyerzitzMineChoiceHandler");
	}
}

function L8_trapperExtreme(): boolean
{
	if (internalQuestStatus("questL08Trapper") !== 2)
	{
		return false;
	}
	if (L8_trapperPeak())
	{ // try to unlock peak
		return true; //successfully finished this part of the quest
	}
	// First choice is the MtLargeHuge IOTM equipment
	if (auto_haveMcHugeLargeSkis())
	{
		auto_equipAllMcHugeLarge();
		// plumber literally wont let you adventure if you have no way to fight in plumber.
			if (in_plumber())
			{
				autoForceEquip$1(Slot.get("acc3"), Item.get("work boots"));
			}
	}
	else if (possessOutfit(
	// we should equip the extreme outfit if we have it
	"eXtreme Cold-Weather Gear", true))
	{ // own and can equip
		autoOutfit("eXtreme Cold-Weather Gear");
	}
	else if (possessOutfit$1("eXtreme Cold-Weather Gear"))
	{ // just own. thanks to else can not equip
		auto_log_warning("I can not wear the eXtreme Gear, I'm just not awesome enough :(", "red");
		return false;
	}
	// We don't need to force the first NC, it''s superlikely. The other two we can.
	const currentExtremity: number = toInt(getProperty("currentExtremity"));
	if (currentExtremity === 1 || currentExtremity === 2)
	{
		const NCForced: boolean = auto_forceNextNoncombat$1(Location.get("The eXtreme Slope"));
		auto_log_info(`Trying to force NC at extreme slope: ${NCForced.toString()}`, "blue");
	}
	// try to get extreme points
	auto_log_info("Penguin Tony Hawk time. Extreme!! SSX Tricky!!", "blue");
	return autoAdv$2(Location.get("The eXtreme Slope"));
}

export function theeXtremeSlopeChoiceHandler(choice: number): void
{
	auto_log_info(`theeXtremeSlopeChoiceHandler Running choice ${choice}`, "blue");
	if (choice === 15)
	{ // Yeti Nother Hippy
		if (possessEquipment(Item.get("eXtreme mittens")))
		{
			if (possessEquipment(Item.get("eXtreme scarf")))
			{
				runChoice(3); // get 200 Meat.
			}
			else {
				runChoice(2); // get eXtreme scarf
			}
		}
		else {
			runChoice(1); // get eXtreme mittens
		}
	}
	else if (choice === 16)
	{ // Saint Beernard
		if (possessEquipment(Item.get("snowboarder pants")))
		{
			if (possessEquipment(Item.get("eXtreme scarf")))
			{
				runChoice(3); // get 200 Meat.
			}
			else {
				runChoice(2); // get eXtreme scarf
			}
		}
		else {
			runChoice(1); // get snowboarder pants
		}
	}
	else if (choice === 17)
	{ // Generic Teen Comedy Snowboarding Adventure
		if (possessEquipment(Item.get("eXtreme mittens")))
		{
			if (possessEquipment(Item.get("snowboarder pants")))
			{
				runChoice(3); // get 200 Meat.
			}
			else {
				runChoice(2); // get snowboarder pants
			}
		}
		else {
			runChoice(1); // get eXtreme mittens
		}
	}
	else if (choice === 575)
	{ // Duffel on the Double
		if (haveEquipped(Item.get("candy cane sword cane")))
		{
			runChoice(5); // get mittens and pants and lucky pill
		}
		else if (!possessOutfit$1("eXtreme Cold-Weather Gear"))
		{
			runChoice(1); // get an outfit piece
		}
		else {
			if (isActuallyEd())
			{ // add other paths which don't want to waste spleen (if any) here.
				runChoice(3); // skip
			}
			else {
				runChoice(4); // Lucky Pill. (Clover for 1 spleen, worth?)
			}
		}
	}
	else {
		abort("unhandled choice in theeXtremeSlopeChoiceHandler");
	}
}

function L8_trapperNinjaLair(): boolean
{
	// adventure in the lair of the ninja snowmen to find and fight ninja snowman assassins.
	// usually this would only occur in hardcore
	if (internalQuestStatus("questL08Trapper") !== 2)
	{
		return false;
	}
	if (L8_trapperPeak())
	{ // try to unlock peak
		return true; // successfully finished this part of the quest
	}
	if (toBoolean(getProperty("auto_L8_extremeInstead")))
	{ // we want to do extreme path instead
		return false;
	}
	if (toBoolean(getProperty("auto_L8_ninjaAssassinFail")))
	{ // we cannot survive against assassins
		setProperty("auto_L8_extremeInstead", true.toString());
		return false;
	}
	// we must use two variables because there are too many special cases. maybe we can survive assassins but not encounter them due to +combat being too low. Copiers and pulls complicate matters. We could copy an assassin even if we cannot encounter it in the lair
	//check if we can survive a hit or get the jump on NSA
	if (myMaxhp() <= expectedDamage(Monster.get("ninja snowman assassin")) * 1.2 && jumpChance(Monster.get("ninja snowman assassin")) < 100)
	{
		if (isAboutToPowerlevel())
		{
			//if we can't survive and we are powerleveling, do extreme path
			setProperty("auto_L8_ninjaAssassinFail", true.toString());
			return true;
		}
		else {
			auto_log_warning("Can't survive against ninja snowman assassin. Will delay and try again later", "red");
			return false;
		}
	}

	if (haveEffect(Effect.get("Thrice-Cursed")) > 0 || haveEffect(Effect.get("Twice-Cursed")) > 0 || haveEffect(Effect.get("Once-Cursed")) > 0)
	{
		return false;
	}

	if (shenShouldDelayZone(Location.get("Lair of the Ninja Snowmen")))
	{
		auto_log_debug$1("Delaying Lair of the Ninja Snowmen in case of Shen.");
		return false;
	}
	// can we provide enough combat bonus to encounter snowman assassins?
	if (providePlusCombat(auto_combatModCap(), Location.get("Lair of the Ninja Snowmen"), true, true) <= 0.0)
	{ // ninja snowman does not show up if +combat is not greater than 0
		if (isAboutToPowerlevel())
		{
			auto_log_info(`Something is keeping us from getting a suitable combat rate for ninja snowman assassin. we can only reach: ${numericModifier("Combat Rate")}. Switching to extreme slope route`, "red");
			setProperty("auto_L8_extremeInstead", true.toString());
			return true;
		}
		else {
			auto_log_warning(`Something is keeping us from getting a suitable combat rate for ninja snowman assassin. we can only reach: ${numericModifier("Combat Rate")}. Will delay and try again later`, "red");
		}
		return false;
	}
	// buff
	if (isActuallyEd() && !elementalPlanes_access(Element.get("spooky")))
	{
		adjustEdHat("myst");
	}

	auto_getCitizenZone(Location.get("Lair of the Ninja Snowmen"), false); //since we want to adventure in the Lair anyway

	if (autoAdv$2(Location.get("Lair of the Ninja Snowmen")))
	{
		return true;
	}
	auto_log_warning("Mysteriously failed to adventure in [Lair of the Ninja Snowmen]", "red");
	return false;
}

export function L8_trapperGroar(): boolean
{
	// do the peak portion of L8 trapper quest.
	if (internalQuestStatus("questL08Trapper") < 3 || internalQuestStatus("questL08Trapper") > 4)
	{
		return false; // peak not yet unlocked or we are done with groar
	}
	if (toBoolean(getProperty("_auto_skip_L8_trapperGroar")))
	{
		auto_log_warning$1("Skipping L8_trapperGroar() today as per _auto_skip_L8_trapperGroar");
		return false;
	}
	// error catching for if we are actually on step5 and mafia did not notice.
	if (itemAmount(Item.get("Groar's fur")) > 0 || itemAmount(Item.get("winged yeti fur")) > 0 || itemAmount(Item.get("cursed blanket")) > 0)
	{
		auto_log_info(`Quest tracking error detected. Mafia thinks we are in step4 of questL08Trapper but we are in fact in step5. Correcting. Current Path = ${myPath().name}`, "red");
		setProperty("questL08Trapper", "step5");
		return true;
	}

	if (wildfire_groar_check())
	{
		return false;
	}
	if (is_professor())
	{
		return false; //don't try for Groar as Professor
	}
	// we need 5 cold res to be allowed to adventure in [Mist-shrouded Peak]
	const resGoal: Map<Element, number> = new Map();
	resGoal.set(Element.get("cold"), 5);
	// try getting resistance without equipment before bothering to change gear

	let retval: boolean = false;
	const initial_adv: number = mySessionAdv();
	if (provideResistances$4(resGoal, Location.get("Mist-Shrouded Peak"), false) || provideResistances$4(resGoal, Location.get("Mist-Shrouded Peak"), true))
	{
		auto_log_info("Time to take out Gargle, sure, Gargle (Groar)", "blue");
		equipMaximizedGear();
		//AoSOL buffs
		if (in_aosol())
		{
			buffMaintain$3(Effect.get("Queso Fustulento"), 10, 1, 10);
			buffMaintain$3(Effect.get("Tricky Timpani"), 30, 1, 10);
		}
		if ((Location.get("Mist-Shrouded Peak")).turnsSpent >= 3)
		{ //does not account for possible defeats
			setProperty("auto_nextEncounter", "Groar");
		}
		else {
			setProperty("auto_nextEncounter", "panicking Knott Yeti");
		}
		setProperty("auto_nonAdvLoc", true.toString());
		// Let's whack some free XP on our Chest Mimic (it's a chaun)
		if (auto_haveChestMimic())
		{
			handleFamiliar$1(Familiar.get("Chest Mimic"));
			provideFamExp$2(50, Location.get("Mist-Shrouded Peak"), true, false);
		}

		retval = autoAdv$2(Location.get("Mist-Shrouded Peak"));
	}
	if (retval && initial_adv === mySessionAdv())
	{
		//several inf loops can occur here
		auto_log_debug("Adventured without spending an adv in [Mist-shrouded Peak]. Checking for problems", "blue");

		const initial_step: number = internalQuestStatus("questL08Trapper");
		const initial_s: string = getProperty("questL08Trapper");
		cliExecute("refresh quests");
		const current_step: number = internalQuestStatus("questL08Trapper");
		const current_s: string = getProperty("questL08Trapper");
		const track_error: boolean = initial_step !== current_step;

		if (track_error)
		{ //quest tracking was wrong and fixed.
			if (current_step > 4)
			{ //boss is actually dead now
				// if boss is dead [Mist-shrouded Peak] becomes [The Icy Peak].
				// common tracking issue which casue inf loop. already fixed by the quest refresh.
				auto_log_warning("questL08Trapper value was incorrect. Boss is already dead. This has been fixed to prevent inf loop", "blue");
			}
			else { auto_log_warning("questL08Trapper value was incorrect. This has been fixed", "blue"); }
		}
		else { auto_log_debug$1("questL08Trapper value was correct despite oddity with adv spent"); }

		if (current_step === 3 || current_step === 4)
		{
			// boss is still alive yet no adv was spent. most likely scenario is that our cold res was too low. maybe free combat?
			if (toInt(getProperty("_auto_inf_counter")) > 5)
			{
				print("We are stuck trying to adventure in [Mist-shrouded Peak] and failing repeatedly", "red");
				print("Probably a problem with cold res. Please report this issue.", "red");
				print("Finish the peak yourself then run autoscend again", "red");
				print("If you wish to have autoscend ignore this and go do other stuff then enter in gCLI:", "red");
				print("set _auto_skip_L8_trapperGroar = true", "red");
				abort();
			}
		}
	}
	return retval;
}

export function L8_trapperPeak(): boolean
{
	// unlock the peak in the trapper quest
	if (internalQuestStatus("questL08Trapper") !== 2)
	{
		return false;
	}
	// unlock peak using ninja climbing gear
	if (itemAmount(Item.get("ninja rope")) > 0 && itemAmount(Item.get("ninja carabiner")) > 0 && itemAmount(Item.get("ninja crampons")) > 0)
	{
		const resGoal: Map<Element, number> = new Map();
		resGoal.set(Element.get("cold"), 5);
		if (provideResistances$4(resGoal, Location.get("Mist-Shrouded Peak"), true))
		{
			equipMaximizedGear();
			visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak"); // unlock peak. advancing to step 4.
			setProperty("auto_ninjasnowmanassassin", true.toString()); // heavy rains. are we done copying them
		}
		else {
			// TODO get outfit
			// TODO does TCRS have a problem with the outfit still not being enough? look into it
			return false; // we are unable to provide 5 cold res
		}

		if (internalQuestStatus("questL08Trapper") === 3)
		{
			return true; // successfully unlocked peak
		}
		else {
			abort("Mysteriously failed to climb the slope using ninja climbing gear");
		}
	}
	// unlock peak using extremeness
	if (toInt(getProperty("currentExtremity")) >= 3)
	{
		if (auto_haveMcHugeLargeSkis())
		{
			equip(Slot.get("back"), Item.get("McHugeLarge duffel bag"));
			equip(Slot.get("weapon"), Item.get("McHugeLarge right pole"));
			equip(Slot.get("off-hand"), Item.get("McHugeLarge left pole"));
			equip(Slot.get("acc1"), Item.get("McHugeLarge left ski"));
			equip(Slot.get("acc2"), Item.get("McHugeLarge right ski"));
			visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak");
			return true;
		}
		// TODO: There are some reports of this breaking in TCRS, when cold-weather
		// gear is not sufficient to have 5 cold resistance. Use a maximizer statement?
		if (outfit("eXtreme Cold-Weather Gear"))
		{
			visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak");
			return true;
		}
	}

	return false;
}

export function L8_forceExtremeInstead(): boolean
{
	// If for some reason we've already got 2 ninja items, no need to get forcey
	if (availableAmount(Item.get("ninja crampons")) > 0) { return false; }
	// Set the variable if we're doing McHugeLarge items
	if (auto_canEquipAllMcHugeLarge()) { setProperty("auto_L8_extremeInstead", true.toString()); }
	return toBoolean(getProperty("auto_L8_extremeInstead"));
}

export function L8_trapperSlope(): boolean
{
	// climb the slope and reach the peak in L8 trapper quest. either via ninja snowmen lair or via the extreme slope

	if (internalQuestStatus("questL08Trapper") !== 2)
	{
		return false; // climbing the slope is step2 of the quest. when you unlock the peak it advances to step3
	}
	if (canInteract())
	{ // casual and postronin special handling
		return L8_slopeCasual(); // mallbuy everything. or go do something else if too poor to do so
	}
	if (L8_trapperPeak())
	{ // try to finish step2 of the quest.
		return true;
	}
	// hardcore handling
	if (robot_delay("outfit"))
	{
		return false; // delay for You, Robot path
	}
	// Checks for McHugeLarge skis
	if (L8_forceExtremeInstead())
	{
		if (L8_trapperExtreme()) { // try to climb slope via extreme path
		return true; }
	}
	if (toBoolean(getProperty("auto_L8_extremeInstead")))
	{ // we decided we do not want to adventure in the ninja lair
		if (L8_trapperExtreme()) { // try to climb slope via extreme path
		return true; }
	}
	if (L8_trapperNinjaLair()) { // try to climb slope via ninja path
	return true; }

	return false;
}

export function L8_trapperTalk(): boolean
{
	// talk to the trapper to advance the L8 quest.
	const initial_step: number = internalQuestStatus("questL08Trapper");
	if (initial_step !== 0 && initial_step !== 1 && initial_step !== 5)
	{
		return false; // only need to talk to trapper at steps 0, 1, and 5
	}

	if (initial_step === 0)
	{ // step0 == quest started. we do not know what ores we need yet.
		auto_log_info("Talkint to the trapper to find out what kind of Ore he wants", "blue");
		visitUrl("place.php?whichplace=mclargehuge&action=trappercabin"); // talk to the trapper to advance quest
	}
	if (initial_step === 1)
	{ // step1 == we know what ore to get. so go get ore and cheese
		if (itemAmount(toItem(getProperty("trapperOre"))) >= 3 && itemAmount(Item.get("goat cheese")) >= 3)
		{
			// turn in ore and cheese to advance from step1 to step2
			auto_log_info(`Giving Trapper goat cheese and ${toItem(getProperty("trapperOre"))}`, "blue");
			visitUrl("place.php?whichplace=mclargehuge&action=trappercabin"); // talk to the trapper to advance quest
		}
		else {
			return false; // not enough cheese or ore yet. go get them
		}
	}
	if (initial_step === 5)
	{
		// finish the quest
		visitUrl("place.php?whichplace=mclargehuge&action=trappercabin");
		council();
	}
	// error checking
	if (initial_step === internalQuestStatus("questL08Trapper"))
	{ // we failed to advance. try refreshing quests
		auto_log_info(`we visited trapper but failed to advance the quest from step${initial_step}. Refreshing quests`, "red");
		cliExecute("refresh quests");
	}
	if (initial_step === internalQuestStatus("questL08Trapper"))
	{ // refreshing quests did not solve the problem
		abort("We were unable to advance the quest when talking to the trapper for some reason");
	}
	return true;
}

export function L8_trapperQuest(): boolean
{
	// do the entire L8 trapper quest
	if (internalQuestStatus("questL08Trapper") < 0 || internalQuestStatus("questL08Trapper") > 5)
	{
		return false;
	}

	if (L8_trapperTalk())
	{
		return true;
	}
	//at end of day last chance to get milk could be more valuable for characters with a stomach than not cancelling banishes used in L7
	if (myAdventures() < 7 && !toBoolean(getProperty("_milkOfMagnesiumUsed")) && fullnessLimit() !== 0 && haveSkill(Skill.get("Advanced Saucecrafting")) && L8_getGoatCheese())
	{
		return true;
	}
	else if (L7_override())
	{ //if any olfaction or banishes used in an earlier area finish there first
		return true;
	}

	if (L8_getGoatCheese() || L8_getMineOres() || L8_trapperSlope() || L8_trapperGroar())
	{
		return true;
	}
	return false;
}
