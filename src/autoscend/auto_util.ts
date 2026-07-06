import { Class, Coinmaster, Effect, Element, Familiar, Item, Location, Modifier, Monster, Path, Phylum, Servant, Skill, Slot, Stat, abort, advCost, appearanceRates, append, autosell, availableAmount, availableChoiceOptions, bufferToFile, buy, buyPrice, canAdventure, canEquip, canInteract, canadiaAvailable, changeMcd, charAt, chew, cliExecute, cliExecuteOutput, containsText, craft, create, currentMcd, equip, equippedAmount, equippedItem, floor, fullnessLimit, getCampground, getIngredients, getMonsters, getPlayerId, getProperty, gnomadsAvailable, guildStoreAvailable, haveCampground, haveEffect, haveEquipped, haveOutfit, haveSkill, inBadMoon, inHardcore, indexOf, inebrietyLimit, isTrendy, isUnrestricted, itemAmount, itemDropModifier, itemType, knollAvailable, lastIndexOf, length, lightningCost, max, maximize, min, monsterElement, monsterLevelAdjustment, mpCost, myAdventures, myAscensions, myBasestat, myClass, myDaycount, myFamiliar, myFullness, myId, myInebriety, myLevel, myLightning, myLocation, myMeat, myMp, myPath, myPrimestat, myRain, mySign, mySoulsauce, mySpleenUse, myThunder, myTurncount, nowToInt, npcPrice, numericModifier, print, printHtml, pullsRemaining, rainCost, removeProperty, replaceString, retrieveItem, reverseNumberology, rollover, round, setLocation, setProperty, soulsauceCost, spleenLimit, splitString, squareRoot, storageAmount, substring, thunderCost, timeToString, toBoolean, toBuffer, toClass, toEffect, toElement, toFamiliar, toFloat, toInt, toItem, toLocation, toLowerCase, toMonster, toPhylum, toSkill, toSlot, toStat, todayToString, turnsPerCast, use, useFamiliar, useSkill, visitUrl } from "kolmafia";
import { LX_calculateTheUniverse } from "../autoscend";
import { acquireHermitItem, auto_buyUpTo, auto_mall_price, npcStoreDiscountMulti, pullXWhenHaveY } from "./auto_acquire";
import { autoAdvBypass, autoAdvBypass$2, CombatMacro } from "./auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "./auto_buff";
import { autoChew, autoDrink, fullness_left, inebriety_left, spleen_left, stomach_left } from "./auto_consume";
import { addToMaximize, autoEquip, autoEquip$1, auto_loadEquipped, auto_saveEquipped, ensureSealClubs, equipMaximizedGear, equipmentAmount, possessEquipment, possessOutfit$1, removeFromMaximize } from "./auto_equipment";
import { auto_famWeight$1, auto_have_familiar, canChangeToFamiliar, handleFamiliar, handleFamiliar$1, haveSpleenFamiliar, is100FamRun } from "./auto_familiar";
import { List$8, auto_sortedByModifier$3 } from "./auto_list";
import { providePlusCombat$3, providePlusNonCombat$3 } from "./auto_providers";
import { acquireMP$1, uneffect } from "./auto_restore";
import { solveDelayZone$1 } from "./auto_routing";
import { zone_hasLuckyAdventure } from "./auto_zone";
import { kmailObject } from "./autoscend_record";
import { banisherCombatString$2, banisherCombatString$3, canUse$2, canUse$4, getCopier, getSniffer, replaceMonsterCombatString$1, useItem$1, yellowRayCombatString } from "./combat/auto_combat_util";
import { auto_get_clan_lounge, handleFaxMonster$2 } from "./iotms/clan";
import { auto_hasNavelRing, auto_navelFreeRunChance } from "./iotms/mr2007";
import { expectGhostReport, haveGhostReport, isOverdueDigitize, timeSpinnerCombat$1 } from "./iotms/mr2016";
import { asdonBuff$1, auto_breatheOutsLeft, auto_haveGenieBottleOrPocketWishes, auto_wishesAvailable, canGenieCombat, makeGenieCombat, makeGenieWish$1 } from "./iotms/mr2017";
import { auto_latteDropAvailable, auto_voteMonster$1 } from "./iotms/mr2018";
import { auto_havePillKeeper, auto_pillKeeper$1, auto_pillKeeperAvailable, auto_pillKeeperFreeUseAvailable, auto_pillKeeperUses, auto_sausageGoblin } from "./iotms/mr2019";
import { auto_cargoShortsOpenPocket$2, auto_configureRetrocape, auto_forceEquipPowerfulGlove, auto_hasRetrocape } from "./iotms/mr2020";
import { auto_backupTarget, auto_backupUsesLeft, auto_getBattery } from "./iotms/mr2021";
import { auto_ParkaSpikeForcesLeft, auto_configureParka, auto_fightLocketMonster, auto_hasAutumnaton, auto_hasParka, auto_haveCombatLoversLocket, auto_haveGreyGoose, auto_haveTrainSet, auto_monsterInLocket, auto_voidMonster } from "./iotms/mr2022";
import { auto_canHabitat, auto_cinchForcesLeft, auto_getCinch, auto_habitatMonster, auto_haveAugustScepter, auto_haveCincho, auto_haveMonkeyPaw, auto_makeMonkeyPawWish, auto_monkeyPawWishesLeft } from "./iotms/mr2023";
import { auto_AprilSaxLuckyLeft, auto_AprilTubaForcesLeft, auto_haveAprilingBandHelmet, auto_haveRoman, auto_haveSpringShoes, auto_meggFight, auto_playAprilSax, auto_playAprilTuba } from "./iotms/mr2024";
import { auto_McLargeHugeForcesLeft, auto_equipAprilShieldBuff, auto_haveAprilShowerShield, auto_haveMcHugeLargeSkis, auto_punchOutsLeft, auto_wantToBCZ } from "./iotms/mr2025";
import { auto_heartstoneLuckRemaining } from "./iotms/mr2026";
import { ARBSupplyDrop, auto_ARBSupplyDropsLeft, auto_canARBSupplyDrop, auto_haveARB } from "./iotms/ttt";
import { handleServant, isActuallyEd } from "./paths/actually_ed_the_undying";
import { in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import { borisAdjustML, is_boris } from "./paths/avatar_of_boris";
import { is_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { in_aosol } from "./paths/avatar_of_shadows_over_loathing";
import { is_pete, pete_peelOutRemaining } from "./paths/avatar_of_sneaky_pete";
import { bhy_is_item_valid, bhy_usable, in_bhy } from "./paths/bees_hate_you";
import { inAftercore } from "./paths/casual";
import { in_class_act } from "./paths/class_act";
import { in_class_act_two } from "./paths/class_act_two";
import { bat_skillValid, in_darkGyffte } from "./paths/dark_gyffte";
import { glover_usable, in_glover } from "./paths/g_lover";
import { in_heavyrains, rainManSummon } from "./paths/heavy_rains";
import { iluh_famAllowed, iluh_foodConsumable, in_iluh } from "./paths/i_love_u_hate";
import { in_journeyman } from "./paths/journeyman";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { in_kolhs } from "./paths/kolhs";
import { auto_ItemToReplica, in_lol } from "./paths/legacy_of_loathing";
import { in_lar } from "./paths/live_ascend_repeat";
import { in_nuclear } from "./paths/nuclear_autumn";
import { in_ocrs } from "./paths/one_crazy_random_summer";
import { in_plumber, plumber_skillValid } from "./paths/path_of_the_plumber";
import { in_picky } from "./paths/picky";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_small } from "./paths/small";
import { tcrs_maximize_with_items } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";
import { in_wereprof, is_professor, is_werewolf, wereprof_usable } from "./paths/wereprofessor";
import { in_wildfire } from "./paths/wildfire";
import { in_robot, robot_cpu } from "./paths/you_robot";
import { in_zombieSlayer, zombieSlayer_usable } from "./paths/zombie_slayer";
import { getZooKickBanish, getZooKickInstaKill, getZooKickSniff, getZooKickYR, in_zootomist } from "./paths/zootomist";
import { fastenerCount, lumberCount } from "./quests/level_09";
import { auto_warSide } from "./quests/level_12";
import { needStarKey } from "./quests/level_13";
import { candyBlock } from "./quests/level_any";
import { AshMatcher } from "./utils/kolmafiaUtils";
import { fileAsMap } from "./utils/kolmafiaUtils";

//A file full of utility functions which we import into autoscend.ash

export function auto_combatModCap(): number
{
	return 32;
}

export function almostRollover(): boolean
{
	let warning_time: number = toInt(getProperty("auto_stopMinutesToRollover")) * 60;
	let remaining_time: number = rollover() - nowToInt() / 1000;
	if (remaining_time - 300 < warning_time)
	{
		// Only print debug messages less than 5 minutes before emergency bedtime
		auto_log_debug(`Less than ${remaining_time / 60 + 1} min until rollover, bedtime at ${warning_time / 60} min`, "blue");
	}
	return remaining_time <= warning_time;
}

export function needToConsumeForEmergencyRollover(): boolean
{
	let max_bonus_adv: number = round(numericModifier("adventures"));
	for (let [n, rec] of maximize("adventures", 0, 0, true, true).entries())
	{
		if (rec.item !== Item.none)
		{
			max_bonus_adv += toInt(rec.score);
		}
	}
	let target_adv: number = 130 - max_bonus_adv;
	auto_log_debug(`Max bonus rollover adv: ${max_bonus_adv}, target adv: ${target_adv}`, "blue");
	return myAdventures() < target_adv;
}

export function autoMaximize(req: string, simulate: boolean): boolean
{
	if (!simulate)
	{
		debugMaximize(req, 0);
		tcrs_maximize_with_items(req);
	}
	return maximize(req, simulate);
}

export function autoMaximize$1(req: string, maxPrice: number, priceLevel: number, simulate: boolean): boolean
{
	if (!simulate)
	{
		debugMaximize(req, maxPrice);
		tcrs_maximize_with_items(req);
	}
	return maximize(req, maxPrice, priceLevel, simulate);
}

export function autoMaximize$2(req: string, maxPrice: number, priceLevel: number, simulate: boolean, includeEquip: boolean): any
{
	if (!simulate)
	{
		debugMaximize(req, maxPrice);
		tcrs_maximize_with_items(req);
	}
	return maximize(req, maxPrice, priceLevel, simulate, includeEquip);
}

export function debugMaximize(req: string, meat: number): void
{ //This function will be removed.
	if (indexOf(req, "-tie") === -1)
	{
		req = `${req} -tie`;
		auto_log_debug("Added -tie to maximize", "red");
	}
	auto_log_info(`Desired maximize: ${req}`, "blue");
	let situation: string = ` ${myClass()} ${myPath().name} ${mySign()}`;
	if (inHardcore())
	{
		situation = `Hardcore${situation}`;
	}
	else {
		situation = `Softcore${situation}`;
	}
	situation += ` ${todayToString()} ${timeToString()}`;
	let acquired: Map<Effect, boolean> = new Map();
	acquired.set(Effect.none, true);
	let tableDo: string = `<table border=1><tr><td colspan=3>Accepted: Maximizing: ${req}</td><td colspan=3>${situation}</td></tr>`;
	let tableDont: string = `<table border=1><tr><td colspan=3>Rejected: Maximizing: ${req}</td><td colspan=3>${situation}</td></tr>`;
	tableDo += "<tr><td>Score</td><td>Effect</td><td>Command</td><td>Skill</td><td>Item</td><td>Display</td></tr>";
	tableDont += "<tr><td>Score</td><td>Effect</td><td>Command</td><td>Skill</td><td>Item</td><td>Display</td></tr>";

	for (let [it, entry] of maximize(req, 0, 0, true, true).entries())
	{
		let output: string = "";

		entry.display = replaceString(entry.display, "<html>", "");
		entry.display = replaceString(entry.display, "</html>", "");

		if (entry.skill !== Skill.none)
		{
			output += `Skill(${entry.skill}) `;
		}
		if (entry.command !== "")
		{
			output += `Command(${entry.command}) `;
		}
		let display: string = `Display(${entry.display}) `;
		if (entry.item !== Item.none)
		{
			output += `Item(${entry.item}) `;
		}
		if (entry.effect !== Effect.none)
		{
			output += `Effect(${entry.effect}) `;
		}
		output += `Score(${entry.score})`;

		let doThis: boolean = true;
		if (entry.score <= 0)
		{
			doThis = false;
		}
		if (indexOf(entry.command, "uneffect ") === 0)
		{
			doThis = false;
		}
		if (indexOf(entry.display, "uneffect ") === 0)
		{
			doThis = false;
		}
		if (indexOf(entry.display, "<font color=gray>") !== -1)
		{
			doThis = false;
		}
		if (entry.skill !== Skill.none)
		{
			if (turnsPerCast(entry.skill) <= 0)
			{
				doThis = false;
			}
			if (advCost(entry.skill) > 0)
			{
				doThis = false;
			}
			if (lightningCost(entry.skill) > myLightning())
			{
				doThis = false;
			}
			if (mpCost(entry.skill) > myMp())
			{
				doThis = false;
			}
			if (rainCost(entry.skill) > myRain())
			{
				doThis = false;
			}
			if (soulsauceCost(entry.skill) > mySoulsauce())
			{
				doThis = false;
			}
			if (thunderCost(entry.skill) > myThunder())
			{
				doThis = false;
			}
		}
		else {
			//If not a skill, is it an item?
			if (entry.item !== Item.none)
			{
				if (indexOf(entry.display, "drink ") === 0)
				{
					doThis = false;
				}
				if (indexOf(entry.display, "eat ") === 0)
				{
					doThis = false;
				}
				if (indexOf(entry.display, "play ") === 0)
				{
					doThis = false;
				}
				if (indexOf(entry.display, "bind ") === 0)
				{
					doThis = false;
				}
				if (indexOf(entry.display, "cast 1 Bind ") === 0)
				{
					doThis = false;
				}
				if (indexOf(entry.display, "chew ") === 0)
				{
					doThis = false;
				}
//				if(entry.display.index_of("...or ") == 0)
//				{
//					doThis = false;
//				}
				//Mafia likes to recommend pirate Ephemera that we can not buy.
				if (Item.get(["pirate tract", "pirate pamphlet", "pirate brochure"]).includes(entry.item) && (myAscensions() !== toInt(getProperty("lastPirateEphemeraReset")) || entry.item !== toItem(getProperty("lastPirateEphemera"))))
				{
					doThis = false;
				}

				if (indexOf(entry.display, "make ") === 0)
				{
					//We can this make item.
					doThis = false;
				}
				if (indexOf(entry.display, "use ") === 0)
				{
					//We have this item
				}
				if (indexOf(entry.display, "buy ") === 0)
				{
					//We can buy this item
					if (npcPrice(entry.item) > meat)
					{
						doThis = false;
					}
				}
			}
			else {
				//Not a skill or item, what is it?
				if (indexOf(entry.display, "telescope ") === 0)
				{}
				else if (indexOf(entry.display, "grim init ") === 0)
				{}
				else if (indexOf(entry.display, "unequip ") === 0)
				{}
				else if (indexOf(entry.display, "familiar ") === 0)
				{}
				else if (indexOf(entry.display, "bjorn ") === 0)
				{}
				else {
					doThis = false;
				}
			}
		}

		if (acquired.has(entry.effect) && entry.effect !== Effect.none)
		{
			doThis = false;
		}
		if (entry.effect !== Effect.none && haveEffect(entry.effect) > 0)
		{
			doThis = false;
		}

		let curTable: string = `<td>${entry.score}</td>`;
		curTable += `<td>${entry.effect}</td>`;
		curTable += `<td>&nbsp;${entry.command}</td>`;
		curTable += `<td>${entry.skill}</td>`;
		curTable += `<td>${entry.item}</td>`;
		curTable += `<td>&nbsp;${entry.display}</td>`;

		if (doThis)
		{
			//use_skill(1, entry.skill);
			acquired.set(entry.effect, true);
			output = `USE: ${output}`;
			tableDo += `<tr>${curTable}</tr>`;
		}
		else {
			output = `REJECT: ${output}`;
			tableDont += `<tr>${curTable}</tr>`;
		}
		auto_log_info(output, "blue");
		auto_log_info(display, "green");
	}

	tableDo += "</table>";
	tableDont += "</table>";
	printHtml(tableDo);
	printHtml(tableDont);
	//	A successive print will help make the table readable in cases where it is not rendered properly
	//cli_execute("ashref get_inventory");
}

export function trim(input: string): string
{
	let whitespace: AshMatcher = new AshMatcher("(\\A\\s+)|(\\s+\\z)", input);
	return whitespace.replaceAll("");
}


export function safeString(input: string): string
{
	let comma: AshMatcher = new AshMatcher("[,]", input);
	input = comma.replaceAll(".");
	let colon: AshMatcher = new AshMatcher("[:]", input);
	input = colon.replaceAll(".");
	return input;
}

export function safeString$1(input: Skill): string
{
	return safeString(`${input}`);
}

export function safeString$2(input: Item): string
{
	return safeString(`${input}`);
}
export function safeString$3(input: Monster): string
{
	return safeString(`${input}`);
}

export function handleTracker(used: string, tracker: string): void
{
	let cur: string = getProperty(tracker);
	if (cur !== "")
	{
		cur = `${cur}, `;
	}
	cur = `${cur}(${myDaycount()}:${safeString(used)}:${myTurncount()})`;
	setProperty(tracker, cur);
}

export function handleTracker$1(used: string, detail: string, tracker: string): void
{
	let cur: string = getProperty(tracker);
	if (cur !== "")
	{
		cur = `${cur}, `;
	}
	cur = `${cur}(${myDaycount()}:${safeString(used)}:${safeString(detail)}:${myTurncount()})`;
	setProperty(tracker, cur);
}

export function handleTracker$2(used: string, loc: string, detail: string, tracker: string): void
{
	let cur: string = getProperty(tracker);
	if (cur !== "")
	{
		cur = `${cur}, `;
	}
	if (loc === "none")
	{
		handleTracker$1(used, detail, tracker);
		return;
	}
	cur = `${cur}(${myDaycount()}:${safeString(used)}:${safeString(loc)}:${safeString(detail)}:${myTurncount()})`;
	setProperty(tracker, cur);
}

export function organsFull(): boolean
{
	if (myFullness() < fullnessLimit())
	{
		return false;
	}
	if (myInebriety() < inebrietyLimit())
	{
		return false;
	}
	if (mySpleenUse() < spleenLimit())
	{
		return false;
	}
	return true;
}
 

export function backupSetting(setting: string, newValue: string): boolean
{
	let defaults: Map<string, Map<string, string>> = fileAsMap("data/defaults.txt", [String, String, String]);

	let found: number = 0;
	let oldValue: string = "";
	for (let [domain, _v0] of defaults) {
		for (let [name, _v1] of _v0) {
			let value = _v1;
		if (name === setting)
		{
			found = 1;
			oldValue = getProperty(name);
		}
		}
	}

	if (oldValue === "")
	{
		oldValue = "__BLANK__";
	}

	if (found === 1)
	{
		if (getProperty(setting) === newValue)
		{
			return false;
		}

		if (getProperty(`auto_backup_${setting}`) === "")
		{
			setProperty(`auto_backup_${setting}`, oldValue);
		}
		setProperty(setting, newValue);
		return true;
	}
	setProperty(setting, newValue);
	return false;
}

export function restoreAllSettings(): boolean
{
	let defaults: Map<string, Map<string, string>> = fileAsMap("data/defaults.txt", [String, String, String]);

	let retval: boolean = false;
	for (let [domain, _v0] of defaults) {
		for (let [name, _v1] of _v0) {
			let value = _v1;
		retval = toBoolean(toInt(retval) | toInt(restoreSetting(name)));
		}
	}

	return retval;
}

export function restoreSetting(setting: string): boolean
{
	if (getProperty(`auto_backup_${setting}`) !== "")
	{
		if (getProperty(`auto_backup_${setting}`) === "__BLANK__")
		{
			setProperty(setting, "");
		}
		else {
			setProperty(setting, getProperty(`auto_backup_${setting}`));
		}
		removeProperty(`auto_backup_${setting}`);
		return true;
	}

	return false;
}

export function loopHandler(turnSetting: string, counterSetting: string, abortMessage: string, threshold: number): boolean
{
	if (myTurncount() === toInt(getProperty(turnSetting)))
	{
		setProperty(counterSetting, (toInt(getProperty(counterSetting)) + 1).toString());
		if (toInt(getProperty(counterSetting)) > threshold)
		{
			abort(abortMessage);
		}
		return true;
	}
	else {
		setProperty(turnSetting, myTurncount().toString());
		setProperty(counterSetting, (0).toString());
	}
	return false;
}

export function loopHandler$1(turnSetting: string, counterSetting: string, threshold: number): boolean
{
	let abortMessage: string = `Infinite loop possibly detected for setting: ${counterSetting}. Use up a turn to get us to consider this loop broken. This may be a more severe issue.`;
	return loopHandler(turnSetting, counterSetting, abortMessage, threshold);
}

export function loopHandlerDelay(counterSetting: string): boolean
{
	return loopHandlerDelay$1(counterSetting, 3);
}

export function loopHandlerDelay$1(counterSetting: string, threshold: number): boolean
{
	if (toInt(getProperty(counterSetting)) >= threshold)
	{
		setProperty(counterSetting, (toInt(getProperty(counterSetting)) - 1).toString());
		return true;
	}
	return false;
}

export function loopHandlerDelayAll(): boolean
{
	let boo: boolean = loopHandlerDelay("_auto_lastABooCycleFix");
	let digitize: boolean = loopHandlerDelay("_auto_digitizeAssassinCounter");
	return boo || digitize;
}

export function reverse(s: string): string
{
	let ret: string = "";
	for (let i: number = length(s) - 1; i >= 0; i--)
	{
		ret += charAt(s, i);
	}
	return ret;
}

export function banishedMonsters(): Map<Monster, number>
{
	let retval: Map<Monster, number> = new Map();
	let data: Map<number, string> = new Map(splitString(getProperty("banishedMonsters"), ":").map((_v, _i) => [_i, _v]));

	if (getProperty("banishedMonsters") === "")
	{
		return retval;
	}

	let i: number = 0;
	while (i < data.size)
	{
		retval.set(toMonster((data.get(i) ?? data.set(i, "").get(i))), toInt((data.get(i + 2) ?? data.set(i + 2, "").get(i + 2))));
		i += 3;
	}

	return retval;
}

export function isBanished$1(enemy: Monster): boolean
{
	return banishedMonsters().has(enemy);
}

export function banishedPhyla(): Map<Phylum, number>
{
	let retval: Map<Phylum, number> = new Map();
	let data: Map<number, string> = new Map(splitString(getProperty("banishedPhyla"), ":").map((_v, _i) => [_i, _v]));

	if (getProperty("banishedPhyla") === "")
	{
		return retval;
	}

	let i: number = 0;
	while (i < data.size)
	{
		retval.set(toPhylum((data.get(i) ?? data.set(i, "").get(i))), toInt((data.get(i + 2) ?? data.set(i + 2, "").get(i + 2))));
		i += 3;
	}

	return retval;
}

export function phylumBanishTurnsRemaining(): number
{
	let banishedPhy: Map<Phylum, number> = banishedPhyla();

	for (let [banPhy, i] of banishedPhy)
	{
		if (banPhy.toString() as string !== "")
		{
			return 99 - (myTurncount() - (banishedPhy.get(banPhy) ?? banishedPhy.set(banPhy, 0).get(banPhy)));
		}
	}

	return 0;
}

export function autoCraft(mode: string, count_1: number, item1: Item, item2: Item): number
{
	if (mode === "combine" && !knollAvailable())
	{
		if (myMeat() < 10 * count_1)
		{
			auto_log_warning(`Count not combine ${item1} and ${item2} due to lack of meat paste.`, "red");
			return 0;
		}
		let need: number = max(0, count_1 - itemAmount(Item.get("meat paste")));
		if (need > 0)
		{
			cliExecute(`make ${need} meat paste`);
		}
	}
	return craft(mode, count_1, item1, item2);
}

export function internalQuestStatus(prop: string): number
{
	let status: string = getProperty(prop);
	if (status === "unstarted")
	{
		return -1;
	}
	if (status === "started")
	{
		return 0;
	}
	if (status === "finished")
	{
		//Does not handle quests with over 9998 steps. That\'s the Gnome letter quest, yes?
		return 9999;
	}
	let my_element: AshMatcher = new AshMatcher("step(\\d+)", status);
	if (my_element.find())
	{
		return toInt(my_element.group(1));
	}
	return -1;
}

export function canYellowRay(target: Monster): boolean
{
	// Use this to determine if it is safe to enter a yellow ray combat.

	if (in_pokefam())
	{
		return false;
	}

	if (haveEffect(Effect.get("Everything Looks Yellow")) <= 0)
	{
		// parka has 100 turn cooldown, but is a free-kill and has 0 meat cost, so prioritised over yellow rocket
		if (auto_hasParka() && auto_is_valid$2(Skill.get("Spit jurassic acid")) && hasTorso$1())
		{
			return yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "";
		}
		// Get a yellow rocket if we don't have a parka
		if (itemAmount(Item.get("Clan VIP Lounge key")) > 0 && toBoolean(
		// Need VIP access
			getProperty("_fireworksShop")) && itemAmount(
			// in a clan that has the Underground Fireworks Shop
			Item.get("yellow rocket")) === 0 && auto_is_valid(
			// Don't buy if we already have one
			Item.get("yellow rocket")) && myMeat() > npcPrice(
			// or if it's not valid
			Item.get("yellow rocket")) + meatReserve())
		{
			cliExecute(`acquire ${Item.get("yellow rocket")}`);
		}
		// Yellow rocket has the lowest cooldown, and is unlimited, so prioritize over other sources
		if (itemAmount(Item.get("yellow rocket")) > 0 && auto_is_valid(Item.get("yellow rocket")) && yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "")
		{
			return true;
		}
		// acquire a spitball if we haven't gotten any of the above
		if (auto_haveAprilShowerShield() && itemAmount(
		//need April Shower Thoughts Shield
		Item.get("spitball")) === 0 && auto_is_valid(
		//don't buy if we already have one
		Item.get("spitball")) && itemAmount(
		//or if it's not valid
		Item.get("glob of wet paper")) > 0)
		{ //need at least 1 glob of wet paper to buy one
			if (buy(Coinmaster.get("Using your Shower Thoughts"), 1, Item.get("spitball")))
			{
				handleTracker$1(Item.get("April Shower Thoughts shield").toString(), Item.get("spitball").toString(), "auto_iotm_claim");
			}
		}
		// Spitball from April Shower Thoughts Shiled has a 100 turn cd, but is a free-kill but is not unlimited
		if (auto_is_valid(Item.get("spitball")) && itemAmount(Item.get("spitball")) > 0)
		{
			return yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "";
		}
		// roman candelabra, also a 75 turn cooldown
		if (auto_haveRoman() && auto_can_equip(Item.get("Roman Candelabra")) && auto_is_valid$2(Skill.get("Blow the Yellow Candle!")))
		{
			return yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "";
		}

		if (auto_hasRetrocape())
		{
			return yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "";
		}

		if (canChangeToFamiliar(Familiar.get("Crimbo Shrub")))
		{
			if (itemAmount(Item.get("box of old Crimbo decorations")) === 0)
			{
				let curr: Familiar = myFamiliar();
				useFamiliar(Familiar.get("Crimbo Shrub"));
				useFamiliar(curr);
			}
			if (getProperty("shrubGifts") !== "yellow" && !toBoolean(getProperty("_shrubDecorated")))
			{
				let temp: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=7958");
				temp = visitUrl("choice.php?pwd=&whichchoice=999&option=1&topper=1&lights=1&garland=1&gift=1");
			}
		}

		if (!toBoolean(getProperty("_internetViralVideoBought")) && itemAmount(
		//can only buy 1 per day
			Item.get("BACON")) >= 20 && auto_is_valid(
			//it costs 20 bacon
			Item.get("viral video")) && !in_koe())
		{ //bacon store is unreachable in kingdom of exploathing
			//do not bother buying it if it is not valid
			create(1, Item.get("viral video"));
		}
	}
	// Pulled Yellow Taffy	- How do we handle the underwater check?
	// He-Boulder?			- How do we do this?
	return yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target)) !== "";
}

export function canYellowRay$1(): boolean
{
	return canYellowRay(Monster.none);
}

export function auto_combat_appearance_rates(place: Location, queue: boolean): Map<Monster, number>
{ //return probability of fighting each monster if the encounter is not a noncombat
	//appearance_rates includes noncombat chance for $monster[none]
	let res_including_noncombat: Map<Monster, number> = new Map(Object.entries(appearanceRates(place, queue)).map(([_k, _v]) => [Monster.get(_k), _v]));
	let res_excluding_noncombat: Map<Monster, number> = new Map();

	let noncombat_frequency: number = (res_including_noncombat.get(Monster.none) ?? res_including_noncombat.set(Monster.none, 0.0).get(Monster.none));
	if (noncombat_frequency === 0 || noncombat_frequency >= 100) { return res_including_noncombat; }

	for (let [mob, freq] of res_including_noncombat)
	{
		if (mob !== Monster.none)
		{
			res_excluding_noncombat.set(mob, freq / (100 - noncombat_frequency) * 100);
		}
	}
	return res_excluding_noncombat;
}

export function auto_combat_appearance_rates$1(place: Location): Map<Monster, number>
{ return auto_combat_appearance_rates(place, false);
}

export function auto_zonePhylumPercent(loc: Location, phyl: Phylum): number
{
	//Looks at potential monsters in a zone and returns the % of them that match the phylum
	let count_1: number = 0;
	let total: number = 0;
	for (let [mon, freq] of auto_combat_appearance_rates$1(loc))
	{
		if (freq <= 0) { continue; }
		if (mon.phylum === phyl)
		{
			count_1 += 1;
		}
		total += 1;
	}
	if (total === 0)
	{
		return 0;
	}
	return count_1 / total;
}

export function auto_banishesUsedAt(loc: Location): Map<string, boolean>
{
	function auto_reallyBanishesUsedAt(loc: Location): Map<string, boolean>
	{
		let banished: string = getProperty("banishedMonsters");
		let banishList: Map<number, string> = new Map(splitString(banished, ":").map((_v, _i) => [_i, _v]));
		let atLoc: Map<number, Monster> = new Map(getMonsters(loc).map((_v, _i) => [_i, _v]));
		let used: Map<string, boolean> = new Map();

		for (let i: number = 0; i + 1 < banishList.size; (i = i + 3))
		{
			let curMon: Monster = toMonster((banishList.get(i) ?? banishList.set(i, "").get(i)));
			let curUsed: string = (banishList.get(i + 1) ?? banishList.set(i + 1, "").get(i + 1));

			for (let j: number = 0; j < atLoc.size; j++)
			{
				if ((atLoc.get(j) ?? atLoc.set(j, Monster.none).get(j)) === curMon)
				{
					used.set(curUsed, true);
				}
			}
		}
		return used;
	}

	if (Location.get(["Next to that Barrel with Something Burning in it", "Out by that Rusted-Out Car", "Over Where the Old Tires Are", "Near an Abandoned Refrigerator"]).includes(loc))
	{
		let gremlinBanishes: Map<string, boolean> = new Map();
		for (let l of Location.get(["Next to that Barrel with Something Burning in it", "Out by that Rusted-Out Car", "Over Where the Old Tires Are", "Near an Abandoned Refrigerator"]))
		{
			let used: Map<string, boolean> = auto_reallyBanishesUsedAt(l);
			for (let s of used.keys())
			{
				gremlinBanishes.set(s, true);
			}
		}
		return gremlinBanishes;
	}
	return auto_reallyBanishesUsedAt(loc);
}

export function auto_wantToBanish(enemy: Monster, loc: Location): boolean
{
	if ((appearanceRates(loc)[enemy.toString()] ??= 0.0) <= 0)
	{
		return false;
	}
	let locCache: Location = myLocation();
	setLocation(loc);
	let monstersToBanish: Map<Monster, boolean> = auto_getMonsters("banish");
	setLocation(locCache);
	return (monstersToBanish.get(enemy) ?? monstersToBanish.set(enemy, false).get(enemy));
}

export function auto_wantToBanish$1(enemyphylum: Phylum, loc: Location): boolean
{
	if (toBoolean(getProperty("auto_dontPhylumBanish"))) {
		return false;
	}
	let locCache: Location = myLocation();
	setLocation(loc);
	let phylumToBanish: Map<Phylum, boolean> = auto_getPhylum("banish");
	setLocation(locCache);
	return (phylumToBanish.get(enemyphylum) ?? phylumToBanish.set(enemyphylum, false).get(enemyphylum));
}

export function canBanish(enemy: Monster, loc: Location): boolean
{
	return banisherCombatString$3(enemy, loc) !== "";
}

export function canBanish$1(enemyphylum: Phylum, loc: Location): boolean
{
	return banisherCombatString$2(enemyphylum, loc) !== "";
}

export function adjustForBanish(combat_string: string): boolean
{
	if (combat_string === `skill${Skill.get("%fn, Release the Patriotic Screech!")}`)
	{
		return useFamiliar(Familiar.get("Patriotic Eagle"));
	}
	if (combat_string === `skill${Skill.get("Mark Your Territory")}`)
	{
		return autoDrink(1, Item.get("pheromone cocktail"));
	}
	if (combat_string === `skill ${Skill.get("Throw Latte on Opponent")}`)
	{
		return autoEquip$1(Item.get("latte lovers member's mug"));
	}
	if (combat_string === `skill ${Skill.get("Give Your Opponent the Stinkeye")}`)
	{
		return autoEquip$1(Item.get("stinky cheese eye"));
	}
	if (combat_string === `skill ${Skill.get("Creepy Grin")}`)
	{
		return autoEquip$1(Item.get("V for Vivala mask"));
	}
	if (combat_string === `skill ${Skill.get("Show them your ring")}`)
	{
		return autoEquip$1(Item.get("mafia middle finger ring"));
	}
	if (combat_string === `skill ${Skill.get("Batter Up!")}`)
	{
		cliExecute("acquire 1 seal-clubbing club");
		ensureSealClubs();
		return true;
	}
	if (combat_string === `skill ${Skill.get("Talk About Politics")}`)
	{
		return autoEquip$1(Item.get("Pantsgiving"));
	}
	if (combat_string === `skill ${Skill.get("Reflex Hammer")}`)
	{
		return autoEquip$1(Item.get("Lil' Doctor&trade; bag"));
	}
	if (combat_string === `skill ${Skill.get("Show your boring familiar pictures")}`)
	{
		return autoEquip$1(Item.get("familiar scrapbook"));
	}
	if (combat_string === `skill ${Skill.get("Spring Kick")}`)
	{
		return autoEquip$1(Item.get("spring shoes"));
	}
	if (combat_string === `skill ${Skill.get("Use the Force")}`)
	{
		return autoEquip(Slot.get("weapon"), wrap_item(Item.get("Fourth of May Cosplay Saber")));
	}
	if (combat_string === `skill ${Skill.get("KGB tranquilizer dart")}`)
	{
		return autoEquip$1(Item.get("Kremlin's Greatest Briefcase"));
	}
	if (combat_string === `skill ${Skill.get("Beancannon")}`)
	{
		for (let beancan of Item.get(["Frigid Northern Beans", "Heimz Fortified Kidney Beans", "Hellfire Spicy Beans", "Mixed Garbanzos and Chickpeas", "Pork 'n' Pork 'n' Pork 'n' Beans", "Shrub's Premium Baked Beans", "Tesla's Electroplated Beans", "Trader Olaf's Exotic Stinkbeans", "World's Blackest-Eyed Peas"]))
		{
			if (autoEquip$1(beancan))
			{
				return true;
			}
		}
		return false;
	}
	if (combat_string === `skill ${Skill.get("Monkey Slap")}`)
	{
		return autoEquip$1(Item.get("cursed monkey's paw"));
	}
	if (combat_string === `skill ${Skill.get("Sea *dent: Throw a Lightning Bolt")}`)
	{
		return autoEquip$1(Item.get("Monodent of the Sea"));
	}
	if (combat_string === `item ${Item.get("handful of split pea soup")}` && itemAmount(Item.get("handful of split pea soup")) === 0)
	{
		return create(1, Item.get("handful of split pea soup"));
	}
	if (combat_string === `skill ${Skill.get("Breathe Out")}` && auto_breatheOutsLeft() === 0 && availableAmount(Item.get("hot jelly")) > 0 && spleen_left() > 1)
	{
		return autoChew(1, Item.get("hot jelly"));
	}
	if (combat_string === `skill ${Skill.get("Punch Out your Foe")}` && auto_punchOutsLeft() === 0 && availableAmount(Item.get("scoop of pre-workout powder")) > 0 && spleen_left() > 3)
	{
		return autoChew(1, Item.get("scoop of pre-workout powder"));
	}
	return true;
}

export function adjustForBanishIfPossible(enemy: Monster, loc: Location): boolean
{
	if (canBanish(enemy, loc))
	{
		let banish_string: string = banisherCombatString$3(enemy, loc);
		auto_log_info(`Adjusting to have banisher available for ${enemy}: ${banish_string}`, "blue");
		return adjustForBanish(banish_string);
	}
	return false;
}

export function adjustForBanishIfPossible$1(enemyphylum: Phylum, loc: Location): boolean
{
	if (canBanish$1(enemyphylum, loc))
	{
		let banish_string: string = banisherCombatString$2(enemyphylum, loc);
		auto_log_info(`Adjusting to have phylum banisher available for ${enemyphylum}: ${banish_string}`, "blue");
		return adjustForBanish(banish_string);
	}
	return false;
}
export function auto_forceFreeRun(combat: boolean): boolean
{
	if (toBoolean(getProperty("auto_forceFreeRun")) && combat)
	{
		setProperty("auto_forceFreeRun", false.toString()); //want to reset as soon as we see it as true while in combat
		return true;
	}
	if (toBoolean(getProperty("auto_forceFreeRun")))
	{
		//don't need to reset it because we haven't taken a turn to freeRun yet
		return true;
	}
	return false;
}

export function auto_wantToFreeRun(enemy: Monster, loc: Location): boolean
{
	if ((appearanceRates(loc)[enemy.toString()] ??= 0.0) <= 0)
	{
		return false;
	}
	let locCache: Location = myLocation();
	setLocation(loc);
	let monstersToFreeRun: Map<Monster, boolean> = auto_getMonsters("freerun");
	setLocation(locCache);
	return (monstersToFreeRun.get(enemy) ?? monstersToFreeRun.set(enemy, false).get(enemy));
}

export function canFreeRun(enemy: Monster, loc: Location): boolean
{
	// pokefam cannot use skills or items
	if (in_pokefam()) {
		return false;
	}
	return true;
}
// monsters that we want to run away from before banishing
export function freeRunCombatStringPreBanish(enemy: Monster, loc: Location, inCombat: boolean): string
{
	if (isFreeMonster$1(enemy, loc)) { return ""; }
	if (is_werewolf()) { //can't freerun as a Werewolf in WereProfessor
	return ""; }
	// Prefer some specalized free run items before other sources
	if (!inAftercore() && haveEffect(Effect.get("Everything Looks Green")) === 0)
	{
		// todo: other ghosts
		if (isGhost(enemy) && canUse$4(Item.get("T.U.R.D.S. Key")) && itemAmount(Item.get("T.U.R.D.S. Key")) > 0)
		{
			return useItem$1(Item.get("T.U.R.D.S. Key"));
		}
		//free runaway against pygmies. accelerates hidden city quest
		if (canUse$4(Item.get("short writ of habeas corpus")) && itemAmount(Item.get("short writ of habeas corpus")) > 0 && Monster.get(["pygmy orderlies", "pygmy witch lawyer", "pygmy witch nurse"]).includes(enemy))
		{
			return useItem$1(Item.get("short writ of habeas corpus"));
		}
	}

	return "";
}

export function freeRunCombatString(enemy: Monster, loc: Location, inCombat: boolean): string
{
	if (isFreeMonster$1(enemy, myLocation())) { return ""; }
	if (is_werewolf()) { //can't freerun as a Werewolf in WereProfessor
	return ""; }
	let pre_banish: string = freeRunCombatStringPreBanish(enemy, loc, inCombat);
	if (pre_banish !== "") { return pre_banish; }
	//Standard free-runs
	if (!inAftercore() && haveEffect(Effect.get("Everything Looks Green")) === 0)
	{
		if (auto_haveSpringShoes() && auto_is_valid$2(Skill.get("Spring Away")))
		{
			if (!inCombat)
			{
				autoEquip$1(Item.get("spring shoes"));
				return `skill ${Skill.get("Spring Away")}`;
			}
			else {
				if (canUse$2(Skill.get("Spring Away")))
				{
					return `skill ${Skill.get("Spring Away")}`;
				}
			}
		}

		if (auto_haveRoman() && auto_is_valid$2(Skill.get("Blow the Green Candle!")))
		{
			if (!inCombat)
			{
				autoEquip$1(Item.get("Roman Candelabra"));
				return `skill ${Skill.get("Blow the Green Candle!")}`;
			}
			else {
				if (canUse$2(Skill.get("Blow the Green Candle!")))
				{
					return `skill ${Skill.get("Blow the Green Candle!")}`;
				}
			}
		}

		for (let it of Item.get(["green smoke bomb", "tattered scrap of paper", "GOTO"]))
		{
			if (canUse$4(it) && itemAmount(it) > 0)
			{
				return useItem$1(it);
			}
		}
	}

	if (canChangeToFamiliar(Familiar.get("Frumious Bandersnatch")))
	{
		// TODO add fam weight buffing
		let banderRunsLeft: number = floor(auto_famWeight$1(Familiar.get("Frumious Bandersnatch")) / 5) - toInt(getProperty("_banderRunaways"));
		if (is_professor()) { return ""; }
		if (!inCombat)
		{
			if (auto_have_skill(Skill.get("The Ode to Booze")) && banderRunsLeft > 0 && (haveEffect(Effect.get("Ode to Booze")) > 0 || buffMaintain$4(Effect.get("Ode to Booze"))) && handleFamiliar$1(Familiar.get("Frumious Bandersnatch")))
			{
				// update familiar already called in pre-adv so have to force.
				useFamiliar(Familiar.get("Frumious Bandersnatch"));
				return `runaway familiar ${Familiar.get("Frumious Bandersnatch")}`;
			}
		}
		else {
			if (myFamiliar() === Familiar.get("Frumious Bandersnatch") && haveEffect(Effect.get("Ode to Booze")) > 0 && banderRunsLeft > 0)
			{
				return `runaway familiar ${Familiar.get("Frumious Bandersnatch")}`;
			}
		}
	}

	if (canChangeToFamiliar(Familiar.get("Pair of Stomping Boots")))
	{
		// TODO add fam weight buffing
		// boots and bander share same counter
		let banderRunsLeft: number = floor(auto_famWeight$1(Familiar.get("Pair of Stomping Boots")) / 5) - toInt(getProperty("_banderRunaways"));
		if (is_professor()) { return ""; }
		if (!inCombat)
		{
			if (banderRunsLeft > 0 && handleFamiliar$1(Familiar.get("Pair of Stomping Boots")))
			{
				// update familiar already called in pre-adv so have to force.
				useFamiliar(Familiar.get("Pair of Stomping Boots"));
				return `runaway familiar ${Familiar.get("Pair of Stomping Boots")}`;
			}
		}
		else {
			if (myFamiliar() === Familiar.get("Pair of Stomping Boots") && banderRunsLeft > 0)
			{
				return `runaway familiar ${Familiar.get("Pair of Stomping Boots")}`;
			}
		}
	}

	if (auto_hasNavelRing())
	{
		// currently only prioritize equipping if at least 80% chance of free run away
		if (!inCombat && auto_navelFreeRunChance() >= 80)
		{
			if (in_lol())
			{
				autoEquip$1(Item.get("replica navel ring of navel gazing"));
			}
			else {
				autoEquip$1(Item.get("navel ring of navel gazing"));
			}
			return `runaway item ${Item.get("navel ring of navel gazing")}`;
		}
		else {
			// use in combat if have high chance of a free run away or at least level 13
			if (haveEquipped(Item.get("navel ring of navel gazing")) || haveEquipped(Item.get("replica navel ring of navel gazing")) && (auto_navelFreeRunChance() >= 80 || myLevel() >= 13))
			{
				return `runaway item ${Item.get("navel ring of navel gazing")}`;
			}
		}
	}

	if (canUse$2(Skill.get("Peel Out")) && pete_peelOutRemaining() > 0)
	{
		return `skill ${Skill.get("Peel Out")}`;
	}
	// Bowling ball is a banish as well, but is available enough that we want to use it as a free run source too
	// bowling ball is only in inventory if it is available to use in combat. While on cooldown, it is not in inventory
	if (((inCombat ? auto_have_skill(Skill.get("Bowl a Curveball")) : itemAmount(Item.get("cosmic bowling ball")) > 0)) && auto_is_valid$2(Skill.get("Bowl a Curveball")))
	{
		return `skill ${Skill.get("Bowl a Curveball")}`;
	}
	// We have a lot of banishes - we can use handful of split pea soup as runaway, but not our last
	let potential_split_pea_soup: number = availableAmount(Item.get("whirled peas")) / 2 + availableAmount(Item.get("handful of split pea soup"));
	if (potential_split_pea_soup > 1 && auto_is_valid(Item.get("handful of split pea soup")))
	{
		return `item ${Item.get("handful of split pea soup")}`;
	}
	//Non-standard free-runs
	if (!inAftercore())
	{
		for (let it of Item.get(["giant eraser"]))
		{ //assuming additional ones will be added, eventually
			if (canUse$4(it) && itemAmount(it) > 0)
			{
				return useItem$1(it);
			}
		}
	}

	return "";
}

export function adjustForFreeRunIfPossible(enemy: Monster, loc: Location): boolean
{
	if (canFreeRun(enemy, loc))
	{
		let free_run_string: string = freeRunCombatString(enemy, loc, false);
		if (free_run_string !== "")
		{
			auto_log_info(`Adjusted to have free run available for ${enemy}: ${free_run_string}`, "blue");
			return true;
		}
	}
	return false;
}

export function adjustForYellowRay(combat_string: string): boolean
{
	//Adjust equipment/familiars to have access to the desired Yellow Ray
	if (combat_string === `skill ${Skill.get("Open a Big Yellow Present")}`)
	{
		handleFamiliar("yellowray");
		return true;
	}
	if (combat_string === `skill ${Skill.get("Use the Force")}`)
	{
		return autoEquip(Slot.get("weapon"), wrap_item(Item.get("Fourth of May Cosplay Saber")));
	}
	if (combat_string === `skill ${Skill.get("Spit jurassic acid")}`)
	{
		auto_configureParka("acid");
	}
	if (combat_string === `skill ${Skill.get("Unleash the Devil's Kiss")}`)
	{
		auto_configureRetrocape("heck", "kiss");
	}
	if (combat_string === `skill ${Skill.get("Blow the Yellow Candle!")}`)
	{
		return autoEquip(Slot.get("off-hand"), wrap_item(Item.get("Roman Candelabra")));
	}
	// craft and consume 9-volt battery if we are using shocking lick and don't have any charges already
	if (combat_string === `skill ${Skill.get("Shocking Lick")}` && toInt(getProperty("shockingLickCharges")) < 1)
	{
		if (auto_getBattery(Item.get("battery (9-Volt)")))
		{
			use(1, Item.get("battery (9-Volt)"));
		}
		else {
			auto_log_error("Failed to prepare a yellow ray. yellowRayCombatString thinks we can craft a 9-volt battery but we actually could not");
		}
	}
	if (combat_string === `skill ${Skill.get("Northern Explosion")}`)
	{
		return autoEquip$1(Item.get("April Shower Thoughts shield"));
	}
	return true;
}

export function adjustForYellowRayIfPossible(target: Monster): boolean
{
	if (canYellowRay(target))
	{
		let yr_string: string = yellowRayCombatString(target, false, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(target));
		auto_log_info(`Adjusting to have YR available for ${target}: ${yr_string}`, "blue");
		return adjustForYellowRay(yr_string);
	}
	return false;
}

export function adjustForYellowRayIfPossible$1(): boolean
{
	return adjustForYellowRayIfPossible(Monster.none);
}

export function canReplace(target: Monster): boolean
{
	//Use this to determine if it is safe to enter a replace monster combat.
	return replaceMonsterCombatString$1(target) !== "";
}

export function canReplace$1(): boolean
{
	return canReplace(Monster.none);
}

export function adjustForReplace(combat_string: string): boolean
{
	//Adjust equipment/familiars to have access to the desired replace monster
	if (combat_string === `skill ${Skill.get("Macrometeorite")}`)
	{
		return true;
	}
	if (combat_string === `skill ${Skill.get("CHEAT CODE: Replace Enemy")}`)
	{
		return auto_forceEquipPowerfulGlove();
	}
	return false;
}

export function adjustForReplaceIfPossible(target: Monster): boolean
{
	if (canReplace(target))
	{
		let rep_string: string = replaceMonsterCombatString$1(target);
		auto_log_info(`Adjusting to have replace available for ${target}: ${rep_string}`, "blue");
		return adjustForReplace(rep_string);
	}
	return false;
}

export function adjustForReplaceIfPossible$1(): boolean
{
	return adjustForReplaceIfPossible(Monster.none);
}

export function canSniff(enemy: Monster, loc: Location): boolean
{
	if (!auto_wantToSniff(enemy, loc))
	{
		return false;
	}
	return getSniffer(enemy, false) !== Skill.none;
}

export function adjustForSniffingIfPossible(target: Monster): boolean
{
	let sniffer: Skill = getSniffer(target, false);
	if (sniffer === Skill.get("McHugeLarge Slash"))
	{
		return autoEquip$1(Item.get("McHugeLarge left pole"));
	}
	if (sniffer === Skill.get("Monkey Point"))
	{
		return autoEquip$1(Item.get("cursed monkey's paw"));
	}
	if (sniffer !== Skill.none)
	{
		return acquireMP$1(mpCost(sniffer));
	}
	return false;
}

export function adjustForSniffingIfPossible$1(): boolean
{
	return adjustForSniffingIfPossible(Monster.none);
}

export function canCopy(enemy: Monster, loc: Location): boolean
{
	if (!auto_wantToCopy(enemy, loc))
	{
		return false;
	}
	return getCopier(enemy, false) !== Skill.none;
}

export function adjustForCopyIfPossible(target: Monster): boolean
{
	let copier: Skill = getCopier(target, false);
	if (copier === Skill.get("Blow the Purple Candle!"))
	{
		return autoEquip$1(Item.get("Roman Candelabra"));
	}
	if (copier === Skill.get("%fn, fire a Red, White and Blue Blast"))
	{
		handleFamiliar$1(Familiar.get("Patriotic Eagle"));
	}
	return false;
}

export function adjustForCopyIfPossible$1(): boolean
{
	return adjustForCopyIfPossible(Monster.none);
}

export function banishSources(): number
{
	//This should only look at banishes we have programmed
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_util.ash
	// Monster Banishes
	// Spring Kick: Equipment
	// Peel Out: Skill
	// Howl of the Alpha: Skill
	// Throw Latte on Opponent: Equipment
	// Give Your Opponent The Stinkeye: Equipment
	// Creepy Grin: Equipment
	// Baleful Howl: Skill
	// Thunder Clap: Skill
	// Asdon Martin: Campground
	// Curse of Vacation: Skill
	// Show Them Your Ring: Equipment
	// Breathe Out: Skill, from hot jelly
	// Batter Up!: Skill
	// Zootomist Kick Banish: Skill
	// Banishing Shout: Skill
	// Walk Away From Explosion: Skill
	// Talk About Politics: Equipment
	// Reflex Hammer: Equipment
	// Show Your Boring Familiar Pictures: Equipment
	// Bowl a Curveball: Item
	// Feel Hatred: Skill
	// [7510]Punt: Skill
	// Snokebomb: Skill
	// stuffed yam stinkbomb: Item
	// handful of split pea soup: Item
	// Punch Out Your Foe: Skill, from pre-workout powder, which is automatically consumed if necessary
	// [28021]Punt: Skill
	// Saber Force Banish: Equipment
	// KGB Tranquilizer Dart: Equipment
	// Monkey Slap: Equipment
	// Sea *dent Lightning Bolt: Equipment
	// Unleash Nanites: Familiar
	// Beancannon: Skill
	// human musk: Item
	// Louder Than Bomb: Item
	// tennis ball: Item
	// deathchucks: Item
	// divine champagne popper: Item
	// anchor bomb: Item
	// Mark Your Territory: Skill, from pheromone cocktail
	//
	// Phylum Banishes
	// Patriotic Screech: Familiar

	let count_1: number = 0;
	for (let sk of Skill.get(["Peel Out", "Howl of the Alpha", "Baleful Howl", "Thunder Clap", "Curse of Vacation", "Breathe Out", "Batter Up!",
	"Banishing Shout", "Walk Away From Explosion", "Feel Hatred", "[7510]Punt", "Snokebomb", "Punch Out your Foe", "[28021]Punt", "Beancannon", "Mark Your Territory"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	if (canUse$2(getZooKickBanish())) {
		count_1 += 1;
	}
	//equipment
	for (let eq of Item.get(["spring shoes", "latte lovers member's mug", "stinky cheese eye", "V for Vivala mask", "mafia middle finger ring", "Pantsgiving",
	"Lil' Doctor&trade; bag", "familiar scrapbook", "Fourth of May Cosplay Saber", "Kremlin's Greatest Briefcase", "cursed monkey's paw", "Monodent of the Sea"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["cosmic bowling ball", "stuffed yam stinkbomb", "handful of split pea soup", "human musk",
	"Louder Than Bomb", "tennis ball", "deathchucks", "divine champagne popper", "anchor bomb",
	"hot jelly", "scoop of pre-workout powder", "pheromone cocktail"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	//campground equipment
	for (let it of Item.get(["Asdon Martin keyfob (on ring)"]))
	{
		if (have_workshed() && auto_get_campground().has(it))
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Nanorhino", "Patriotic Eagle"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function freeRunSources(): number
{
	//This should only look at free runs we have programmed, not specialized free runs like the short writ of habeas corpus
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_util.ash
	// Spring Away: Equipment
	// Blow the Green Candle!: Equipment
	// green smoke bomb: Item
	// tattered scrap of paper: Item
	// GOTO: Item
	// Bandersnatch: Familiar
	// Boots: Familiar
	// (replica) navel ring: Equipment
	// Peel Out: Skill
	// Bowl a Curveball: Item
	// handful of split pea soup: Item
	// giant eraser: Item

	let count_1: number = 0;
	for (let sk of Skill.get(["Peel Out"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	//equipment
	for (let eq of Item.get(["spring shoes", "Roman Candelabra", "navel ring of navel gazing", "replica navel ring of navel gazing"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["green smoke bomb", "tattered scrap of paper", "GOTO", "cosmic bowling ball", "handful of split pea soup", "giant eraser"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Frumious Bandersnatch", "Pair of Stomping Boots"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function freeKillSources(): number
{
	//This should only look at free kills we have programmed
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_default_stage2.ash
	// Kill without Items
	// Club 'Em Back in Time: Equipment
	// groveling gravel: Item
	// Kill with Items
	// power pill: Item
	// Lightning Strike: Skill
	// Dart Bullseye: Equipment
	// Zootomist Kick Kill: Skill
	// Chest X-Ray: Equipment
	// Shattering Punch: Skill
	// Gingerbread Mob Hit: Skill
	// Free-For-All: Skill
	// replica bat-oomerang: Item
	// shadow brick: Item
	// Fire the Jokester's Gun: Equipment
	// Breathitin outdoor fights: Campground
	// Sweat Bullets: Equipment
	let count_1: number = 0;
	for (let sk of Skill.get(["Lightning Strike", "Shattering Punch", "Gingerbread Mob Hit", "Free-For-All"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	if (canUse$2(getZooKickInstaKill())) {
		count_1 += 1;
	}
	//equipment
	for (let eq of Item.get(["blood cubic zirconia", "legendary seal-clubbing club", "Everfull Dart Holster", "Lil' Doctor&trade; bag", "The Jokester's gun"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//campground equipment
	for (let it of Item.get(["cold medicine cabinet"]))
	{
		if (have_workshed() && auto_get_campground().has(it))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["power pill", "groveling gravel", "replica bat-oomerang", "shadow brick"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function instaKillSources(): number
{
	//This should only look at instakills we have programmed
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_default_stage2.ash
	// Slaughter: Skill
	// exploding cigar: Item
	// Release the Boots: Familiar
	let count_1: number = 0;
	for (let sk of Skill.get(["Slaughter"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["exploding cigar"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Pair of Stomping Boots"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function yellowRaySources(): number
{
	//This should only look at YRs we have programmed
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_util.ash
	// Zootomist Kick YR: Skill
	// Fondeluge: Skill
	// yellowcake bomb: Item
	// yellow rocket: Item (we don't buy it if we have a parka, but having the key doesn't prove we can buy it)
	// Spit Jurassic Acid: Equipment
	// spitball: Item
	// Blow the Yellow Candle!: Equipment
	// Unleash the Devil's Kiss: Equipment
	// Disintegrate: Skill
	// Ball Lightning: Skill
	// Wrath of Ra: Skill
	// mayo lance: Campground
	// Flash Headlight: Skill (only if Ultrabright, but overcounting is ok)
	// Golden Light: Item
	// pumpkin bomb: Item
	// Unbearable Light: Item
	// viral video: Item
	// micronova: Item
	// Unleash Cowrruption: Skill, from effect from corrupted marrow
	// Open a Big Yellow Present: Familiar
	// Asdon Martin: Campground
	// Northern Explosion w/ April Shower Thoughts Shield: Equipment
	// Feel Envy: Skill
	// Saber Force: Equipment
	// Shocking Lick: Skill, from 9-Volt battery

	let count_1: number = 0;
	for (let sk of Skill.get(["Fondeluge", "Disintegrate", "Ball Lightning", "Wrath of Ra", "Flash Headlight", "Unleash Cowrruption", "Feel Envy",
	"Shocking Lick"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	if (canUse$2(getZooKickYR())) {
		count_1 += 1;
	}
	//equipment
	for (let eq of Item.get(["Jurassic Parka", "Roman Candelabra", "unwrapped knock-off retro superhero cape",
	"April Shower Thoughts shield", "Fourth of May Cosplay Saber"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["yellowcake bomb", "yellow rocket", "spitball", "Golden Light", "pumpkin bomb", "unbearable light",
	"viral video", "micronova"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	//campground equipment
	for (let it of Item.get(["portable Mayo Clinic", "Asdon Martin keyfob (on ring)"]))
	{
		if (have_workshed() && auto_get_campground().has(it))
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Crimbo Shrub"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function copySources(): number
{
	//This should only look at copiers/replacers/summons we have programmed, and not specialised summons like Calculate the Universe
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_util.ash: replaceMonsterCombatString
	// Replaces
	// Macrometeorite: Skill
	// Replace Enemy: Equipment
	// waffle: Item
	// Look at auto_combat_default_stage1.ash
	// and auto_combat_default_stage4.ash
	// and then at auto_util: handleCopiedMonster for the items
	// EXCEPT actually only the rain-doh black box is implemented
	// Copies
	// Recall Facts Monster Habitats: Skill
	// Fire a Red, White and Blue Blast: Familiar
	// Back-Up to your Last Enemy: Equipment
	// Rain-Doh black box: Item
	// Digitize: Skill
	// Blow the Purple Candle!: Equipment
	// Look at auto_util.ash: summonMonster
	// Summons (Calculate the Universe, Cargo Shorts and Burly Bodyguard in AG are all overly specialised)
	// Rain Man: Skill
	// Time-Spinner: Item
	// Chest Mimic: Familiar
	// combat lover's locket: Item (does not need to be equipped to reminisce)
	// deluxe fax machine: Clan
	// Wishing: Item

	let count_1: number = 0;
	for (let sk of Skill.get(["Macrometeorite", "Recall Facts: Monster Habitats", "Digitize", "Rain Man"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	//equipment
	for (let eq of Item.get(["Powerful Glove", "backup camera", "Roman Candelabra"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//combat items/IOTMs/IOTM-Derived items that aren't equipment
	for (let it of Item.get(["waffle", "Rain-Doh black box", "Time-Spinner", "combat lover's locket"]))
	{
		if (auto_is_valid(it) && itemAmount(it) > 0)
		{
			count_1 += 1;
			continue;
		}
	}
	//clan equipment
	for (let it of Item.get(["deluxe fax machine"]))
	{
		if (auto_get_clan_lounge().has(it))
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Patriotic Eagle", "Chest Mimic"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	if (auto_wishesAvailable() > 0) {
		count_1 += 1;
	}
	return count_1;
}

export function sniffSources(): number
{
	//This should only look at sniffs we have programmed
	//IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
	//
	// Look at auto_combat_util.ash: getSniffer
	// Transcendent Olfaction: Skill
	// Make Friends: Skill
	// Hunt: Skill
	// Long Con: Skill
	// Perceive Soul: Skill
	// Motif: Skill
	// Monkey Point: Equipment
	// McHugeLarge Slash: Equipment
	// Gallapagosian Mating Call: Skill
	// Get a Good Whiff of This Guy: Familiar
	// Offer Latte to Opponent: Equipment
	// Zootomist Kick Sniff: Skill
	// Meat Cute: Skill
	let count_1: number = 0;
	for (let sk of Skill.get(["Transcendent Olfaction", "Make Friends", "Hunt", "Long Con", "Perceive Soul", "Motif",
	"Gallapagosian Mating Call", "Meat Cute"]))
	{
		if (auto_have_skill(sk))
		{
			count_1 += 1;
			continue;
		}
	}
	if (canUse$2(getZooKickSniff())) {
		count_1 += 1;
	}
	//equipment
	for (let eq of Item.get(["cursed monkey's paw", "McHugeLarge left pole", "latte lovers member's mug"]))
	{
		if (possessEquipment(eq) && auto_can_equip(eq))
		{
			count_1 += 1;
			continue;
		}
	}
	//familiars
	for (let fam of Familiar.get(["Nosy Nose"]))
	{
		if (auto_have_familiar(fam) && canChangeToFamiliar(fam))
		{
			count_1 += 1;
			continue;
		}
	}
	return count_1;
}

export function hasTorso$1(): boolean
{
	return haveSkill(Skill.get("Torso Awareness")) || haveSkill(Skill.get("Best Dressed")) || robot_cpu(9, false);
}

export function isGuildClass(): boolean
{
	return Class.get(["Seal Clubber", "Turtle Tamer", "Sauceror", "Pastamancer", "Disco Bandit", "Accordion Thief"]).includes(myClass());
}

export function elemental_resist_value(resistance: number): number
{
	let bonus: number = 0;
	if (myClass() === Class.get("Pastamancer") || myClass() === Class.get("Sauceror") || isActuallyEd())
	{
		bonus = 5;
	}
	if (resistance <= 3)
	{
		return 10.0 * resistance + bonus;
	}
	let scale: number = 1.0;
	resistance = resistance - 4;
	while (resistance > 0)
	{
		scale = scale * 5.0 / 6.0;
		resistance = resistance - 1;
	}
	return 90.0 - 50.0 * scale + bonus;
}

export function elemental_resist(goal: Element): number
{
	return toInt(numericModifier(`${goal} resistance`));
}

export function preferredLibram(): Skill
{
	if (auto_have_skill(Skill.get("Summon BRICKOs")) && toInt(getProperty("_brickoEyeSummons")) < 3)
	{
		return Skill.get("Summon BRICKOs");
	}
	if (auto_have_skill(Skill.get("Summon Party Favor")) && toInt(getProperty("_favorRareSummons")) < 3)
	{
		return Skill.get("Summon Party Favor");
	}
	if (auto_have_skill(Skill.get("Summon Resolutions")))
	{
		return Skill.get("Summon Resolutions");
	}
	if (auto_have_skill(Skill.get("Summon Taffy")))
	{
		return Skill.get("Summon Taffy");
	}
	return Skill.none;
}


export function lastAdventureSpecialNC(): boolean
{
	if (myClass() === Class.get("Turtle Tamer"))
	{
		if (["Nantucket Snapper", "Blue Monday", "Capital!", "Training Day", "Boxed In", "Duel Nature", "Slow Food", "A Rolling Turtle Gathers No Moss", "The Horror...", "Slow Road to Hell", "C'mere, Little Fella", "The Real Victims", "Like That Time in Tortuga", "Cleansing your Palette", "Harem Scarum", "Turtle in peril", "No Man, No Hole", "Slow and Steady Wins the Brawl", "Stormy Weather", "Turtles of the Universe", "O Turtle Were Art Thou", "Allow 6-8 Weeks For Delivery", "Kick the Can", "Turtles All The Way Around", "More eXtreme Than Usual", "Jewel in the Rough", "The worst kind of drowning", "Even Tamer Than Usual", "Never Break the Chain", "Close, but Yes Cigar", "Armchair Quarterback", "This Turtle Rocks!", "Really Sticking Her Neck Out", "It Came from Beneath the Sewer? Great!", "Don't Be Alarmed, Now", "Puttin' it on Wax", "More Like... Hurtle", "Musk! Musk! Musk!", "Silent Strolling"].includes(getProperty("lastEncounter")))
		{
			return true;
		}
	}
	//I suppose we really do not need to validate that we have a Haunted Doghouse actually.
	if (["Wooof! Wooooooof!", "Playing Fetch*", "Your Dog Found Something Again", "Dog Diner Afternoon", "Labrador Conspirator", "Doggy Heaven", "Lava Dogs", "Fruuuuuuuit", "Boooooze Hound", "Baker's Dogzen", "Dog Needs Food Badly", "Ratchet-catcher", "Something About Hot Wings", "Seeing-Eyes Dog", "Carpenter Dog", "Are They Made of Real Dogs?", "Gunbowwowder", "It Isn't a Poodle"].includes(getProperty("lastEncounter")))
	{
		return true;
	}

	return false;
}

export function whatStatSmile(): Effect
{
	switch (myClass())
	{
	case Class.get("Seal Clubber"):
	case Class.get("Turtle Tamer"):
		return Effect.get("Patient Smile");
	case Class.get("Sauceror"):
	case Class.get("Pastamancer"):
		if (haveSkill(Skill.get("Inscrutable Gaze")))
		{
			return Effect.get("Inscrutable Gaze");
		}
		return Effect.get("Wry Smile");
	case Class.get("Disco Bandit"):
	case Class.get("Accordion Thief"):
		return Effect.get("Knowing Smile");
	}
	return Effect.none;
}

export function ovenHandle(): boolean
{
	if (auto_get_campground().has(Item.get("Dramatic&trade; range")) && !toBoolean(getProperty("auto_haveoven")))
	{
		if (auto_get_campground().has(Item.get("Certificate of Participation")) && isActuallyEd())
		{
			auto_log_error("Mafia reports we have an oven but we do not. Logging back in will resolve this.");
		}
		else {
			auto_log_info("Oven found! We can cook!", "blue");
			setProperty("auto_haveoven", true.toString());
		}
	}

	if (!toBoolean(getProperty("auto_haveoven")) && myMeat() >= npcPrice(Item.get("Dramatic&trade; range")) + 1000 && isGeneralStoreAvailable())
	{
		auto_buyUpTo(1, Item.get("Dramatic&trade; range"));
		use(1, Item.get("Dramatic&trade; range"));
		setProperty("auto_haveoven", true.toString());
	}
	return toBoolean(getProperty("auto_haveoven"));
}

export function isGhost(mon: Monster): boolean
{
	let ghosts: Monster[] = Monster.get(["ancient ghost", "angry ghost", "banshee librarian", "Battlie Knight Ghost", "Bettie Barulio", "chalkdust wraith", "Claybender Sorcerer Ghost", "coaltergeist", "cold ghost", "contemplative ghost", "Dusken Raider Ghost", "ghost", "ghost actor", "ghost miner", "ghost of Elizabeth Spookyraven", "hot ghost", "hustled spectre", "lovesick ghost", "Marcus Macurgeon", "Marvin J. Sunny", "Mayor Ghost", "Mer-kin specter", "model skeleton", "Mortimer Strauss", "plaid ghost", "Protector Spectre", "restless ghost", "sexy sorority ghost", "sheet ghost", "sleaze ghost", "Space Tourist Explorer Ghost", "spooky ghost", "stench ghost", "the ghost of Phil Bunion", "The Unknown Accordion Thief", "The Unknown Disco Bandit", "The Unknown Pastamancer", "The Unknown Sauceror", "The Unknown Seal Clubber", "The Unknown Turtle Tamer", "Whatsian Commando Ghost", "Wonderful Winifred Wongle"]);
	if (ghosts.includes(mon) && !mon.boss)
	{
		return true;
	}
	return isProtonGhost(mon);
}

export function isProtonGhost(mon: Monster): boolean
{
	let ghosts: Monster[] = Monster.get(["boneless blobghost", "Emily Koops, a spooky lime", "The ghost of Ebenoozer Screege", "The ghost of Jim Unfortunato", "The ghost of Lord Montague Spookyraven", "the ghost of Monsieur Baguelle", "the ghost of Oily McBindle", "The ghost of Richard Cockingham", "The ghost of Sam McGee", "The ghost of Vanillica \"Trashblossom\" Gorton", "The ghost of Waldo the Carpathian", "The Headless Horseman", "The Icewoman"]);
	if (ghosts.includes(mon))
	{
		return true;
	}
	return false;
}

export function cloversAvailable(override: boolean): number
{
	// set override to true to not reserve a clover for the wand of nagamar.
	//count 11-leaf clovers
	let numClovers: number = 0;

	if (!in_glover())
	{
		numClovers += availableAmount(Item.get("11-leaf clover"));
		//if none on hand, try to buy from hermit
		if (numClovers === 0)
		{
			acquireHermitItem(Item.get("11-leaf clover"));
			numClovers += itemAmount(Item.get("11-leaf clover"));
		}
		//if none at hermit, try to pull one
		if (numClovers === 0)
		{
			pullXWhenHaveY(Item.get("11-leaf clover"), 1, itemAmount(Item.get("11-leaf clover")));
			numClovers += itemAmount(Item.get("11-leaf clover"));
		}
		//Get from August Scepter
		if (auto_haveAugustScepter() && toInt(getProperty("_augSkillsCast")) < 5 && !toBoolean(getProperty("_aug2Cast")))
		{
			numClovers += 1;
		}
		//Get from April band
		numClovers += auto_AprilSaxLuckyLeft();
		//heartstone
		numClovers += auto_heartstoneLuckRemaining();
	}
	//count Astral Energy Drinks which we have room to chew. Must specify ID since there are now 2 items with this name
	numClovers += min(availableAmount(Item.get("[10883]astral energy drink")), floor(spleen_left() / 5));
	//other known sources which aren't counted here:
	// Lucky Lindy, Optimal Dog, Pillkeeper

	if (toBoolean(getProperty("auto_wandOfNagamar")) && !override && myDaycount() > 1 && inHardcore())
	{
		// in Normal we will just pull the missing pieces. Which is always an N because no one goes to the Valley of Rof L'm Fao
		numClovers--;
	}

	return numClovers;
}

export function cloversAvailable$1(): number
{
	// overload to not override clover usage by default as this is the general case
	return cloversAvailable(false);
}

export function cloverUsageInit(override: boolean): boolean
{
	if (cloversAvailable(override) === 0)
	{
		abort("Called cloverUsageInit but have no clovers");
	}
	//do we already have Lucky!?
	if (haveEffect(Effect.get("Lucky!")) > 0)
	{
		return true;
	}

	setProperty("auto_luckySource", "none");

	if (auto_heartstoneLuckRemaining() > 0)
	{
		useSkill(Skill.get("Heartstone: %luck"));
		if (haveEffect(Effect.get("Lucky!")) > 0)
		{
			auto_log_info$1("Clover usage initialized, using Heartstone LUCK.");
			setProperty("auto_luckySource", Item.get("Heartstone").toString());
			return true;
		}
		else {
			auto_log_warning$1("Did not acquire Lucky! after using heartstone LUCK.");
		}
	}

	if (auto_AprilSaxLuckyLeft() > 0)
	{
		if (auto_playAprilSax()) {
			auto_log_info$1("Clover usage initialized, using Apriling sax.");
			setProperty("auto_luckySource", Item.get("Apriling band saxophone").toString());
			return true;
		}
		else {
			auto_log_warning$1("Did not acquire Lucky! after playing the Apriling sax.");
		}
	}
	//Use August Scepter skill if we can
	if (auto_haveAugustScepter() && toInt(getProperty("_augSkillsCast")) < 5 && !toBoolean(getProperty("_aug2Cast")))
	{
		useSkill(Skill.get("Aug. 2nd: Find an Eleven-Leaf Clover Day"));
		if (haveEffect(Effect.get("Lucky!")) > 0)
		{
			auto_log_info$1("Clover usage initialized using August Scepter.");
			setProperty("auto_luckySource", Item.get("august scepter").toString());
			return true;
		}
		else {
			auto_log_warning$1("Did not acquire Lucky! after casting Aug. 2nd: Find an Eleven-Leaf Clover Day!");
		}
	}
	//use a clover if we have one in inventory or closet
	if (itemAmount(Item.get("11-leaf clover")) < 1)
	{
		//try to get one out of closet, catch to avoid an error being thrown
		try {
		retrieveItem(1, Item.get("11-leaf clover")); 		} catch (e: any) {}
	}
	if (itemAmount(Item.get("11-leaf clover")) > 0)
	{
		use(1, Item.get("11-leaf clover"));
		if (haveEffect(Effect.get("Lucky!")) > 0)
		{
			auto_log_info$1("Clover usage initialized using clover.");
			setProperty("auto_luckySource", Item.get("11-leaf clover").toString());
			return true;
		}
		else {
			auto_log_warning$1("Did not acquire Lucky! after using an 11-Leaf Clover");
		}
	}
	//use Astral Energy Drinks if we have room
	if (spleen_left() >= 5)
	{
		if (itemAmount(Item.get("[10883]astral energy drink")) < 1)
		{
			//try to get one out of closet
			retrieveItem(1, Item.get("[10883]astral energy drink"));
		}
		if (itemAmount(Item.get("[10883]astral energy drink")) > 0)
		{
			chew(1, Item.get("[10883]astral energy drink"));
			if (haveEffect(Effect.get("Lucky!")) > 0)
			{
				auto_log_info$1("Clover usage initialized using Astral Energy Drink");
				setProperty("auto_luckySource", Item.get("[10883]astral energy drink").toString());
				return true;
			}
			else {
				auto_log_warning$1("Did not acquire Lucky! after drinking an Astral Energy Drink");
			}
		}
	}

	abort("We tried to initialize clover usage but was unable to get Lucky!");
	return false;
}

export function cloverUsageInit$1(): boolean
{
	// overload to not override clover usage by default as this is the general case
	return cloverUsageInit(false);
}

export function cloverUsageRestart(): boolean
{
	if (haveEffect(Effect.get("Lucky!")) === 0)
	{
		return false;
	}
	if (equippedAmount(Item.get("June cleaver")) > 0 && ["Poetic Justice", "Aunts not Ants", "Beware of Aligator", "Beware of Alligator", "Teacher's Pet", "Lost and Found", "Summer Days", "Bath Time", "Delicious Sprouts", "Hypnotic Master"].includes(getProperty("lastEncounter")))
	{
		//got interrupted and should adventure again in same location
		return true;
	}
	return false;
}

export function cloverUsageFinish(): boolean
{
	if (haveEffect(Effect.get("Lucky!")) > 0)
	{
		abort(`Wandering adventure interrupted our clover adventure (${myLocation()}).`);
	}
	else {
		handleTracker$2(getProperty("auto_luckySource"), myLocation().toString(), getProperty("lastEncounter"), "auto_lucky");
		setProperty("auto_luckySource", "none");
	}
	return true;
}

export function isHermitAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (in_zombieSlayer())
	{
		return false;
	}
	if (in_koe())
	{
		return false;
	}
	return true;
}

export function isGalaktikAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (in_zombieSlayer())
	{
		return false;
	}
	if (in_koe())
	{
		return false;
	}
	return true;
}

export function isGeneralStoreAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (is_werewolf())
	{
		return false;
	}
	return true;
}

export function isArmoryAndLeggeryStoreAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (in_zombieSlayer())
	{
		return false;
	}
	if (in_koe())
	{
		return false;
	}
	return true;
}

export function isMusGuildStoreAvailable(): boolean
{
	if (Class.get(["Seal Clubber", "Turtle Tamer"]).includes(myClass()) && guildStoreAvailable())
	{
		return true;
	}
	if (myClass() === Class.get("Accordion Thief") && myLevel() >= 9 && guildStoreAvailable())
	{
		return true;
	}
	return false;
}

export function isMystGuildStoreAvailable(): boolean {
	if (Class.get(["Pastamancer", "Sauceror"]).includes(myClass()) && guildStoreAvailable()) {
		return true;
	}
	if (myClass() === Class.get("Accordion Thief") && myLevel() >= 9 && guildStoreAvailable()) {
		return true;
	}
	return false;
}

export function isArmoryAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (in_zombieSlayer())
	{
		return false;
	}
	if (in_koe())
	{
		return false;
	}
	return true;
}

export function isUnclePAvailable(): boolean
{
	if (in_nuclear())
	{
		return false;
	}
	if (in_zombieSlayer())
	{
		return false;
	}
	if (in_koe())
	{
		return false;
	}
	let page_text: string = visitUrl("place.php?whichplace=desertbeach");
	return !containsText(page_text, "You don't know where a desert beach is");
}

export function isDesertAvailable(): boolean
{
	//Is this workaround still needed or is mafia correctly recognizing desert is available in koe?
	if (in_koe())
	{
		auto_log_info$1("The desert exploded so no need to build a meatcar...");
		setProperty("lastDesertUnlock", myAscensions().toString());
	}

	return toInt(getProperty("lastDesertUnlock")) === myAscensions();
}

export function inKnollSign(): boolean
{
	return ["Mongoose", "Vole", "Wallaby"].includes(mySign());
}

export function inCanadiaSign(): boolean
{
	return ["Marmot", "Opossum", "Platypus"].includes(mySign());
}

export function inGnomeSign(): boolean
{
	return ["Blender", "Packrat", "Wombat"].includes(mySign());
}

let $_instakillable_not_instakillable: Monster[] | undefined;

export function instakillable(mon: Monster): boolean
{
	if (mon.boss)
	{
		return false;
	}

	$_instakillable_not_instakillable ??= Monster.get([
		// Cyrpt bosses
		"conjoined zmombie", "gargantulihc", "giant skeelton", "huge ghuol",
		// crowd of adventurers bosses at the tower tests
		"Tasmanian Dervish", "Mr. Loathing", "The Mastermind", "Seannery the Conman", "The Lavalier", "Leonard", "Arthur Frankenstein", "Mrs. Freeze", "Odorous Humongous",
		// time-spinner
		"Ancient Skeleton with Skin still on it", "Apathetic Tyrannosaurus", "Assembly Elemental", "Cro-Magnon Gnoll", "Krakrox the Barbarian", "Wooly Duck",
		// Love Tunnel
		"LOV Enforcer", "LOV Engineer", "LOV Equivocator",
		// ancient protector spirits
		"Protector Spectre", "ancient protector spirit", "ancient protector spirit (The Hidden Apartment Building)", "ancient protector spirit (The Hidden Hospital)", "ancient protector spirit (The Hidden Office Building)", "ancient protector spirit (The Hidden Bowling Alley)",
		// Macguffin snakes
		"Batsnake", "Frozen Solid Snake", "Burning Snake of Fire", "The Snake With Like Ten Heads", "The Frattlesnake", "Snakeleton",
		// Voting monsters
		"slime blob", "terrible mutant", "government bureaucrat", "angry ghost", "annoyed snake",
		// Tentacles
		"Sssshhsssblllrrggghsssssggggrrgglsssshhssslblgl", "Eldritch Tentacle",
		// Other Monsters that Mafia returns as instakillable (or not a boss), that really aren't
		"cosmetics wraith", "drunken rat king", "booty crab"]);

	if ($_instakillable_not_instakillable.includes(mon))
	{
		return false;
	}

	return true;
}


export function stunnable(mon: Monster): boolean
{
	if (mon.randomModifiers.includes("unstoppable"))
	{
		return false;
	}
	if (mon.randomModifiers.includes("rabbit mask"))
	{
		return false;
	}
	// Incomplete, because challenge paths are a thing
	let unstunnable_monsters: Monster[] = Monster.get([
		// Standard
			"wall of skin",
			"wall of bones",
			"Eldritch Tentacle",
		// Cargo Cultist Shorts
			"Astrologer of Shub-Jigguwatt",
			"Burning Daughter",
			"Chosen of Yog-Urt",
			"Herald of Fridgr",
			"Tentacle of Sssshhsssblllrrggghsssssggggrrgglsssshhssslblgl",
		// Vampyre
			"Your Lack of Reflection",
			"%alucard%",
		// Heavy Rains
			"storm cow",
		// Witchess Monsters
			"Witchess Witch",
			"Witchess Queen",
			"Witchess King",
		// Other
			"Cyrus the Virus",
			"broctopus",
			"cocktail shrimp"
			]);

	if (Monster.get(["Naughty Sorceress", "Naughty Sorceress (2)"]).includes(mon) && !toBoolean(getProperty("auto_confidence")))
	{
		return false;
	}

	return !(unstunnable_monsters.includes(mon));
}

export function combatItemDamageMultiplier(): number
{
	let retval: number = 1;
	if (auto_have_skill(Skill.get("Deft Hands")))
	{
		retval += 0.25;
	}
	if (haveEffect(Effect.get("Mathematically Precise")) > 0)
	{
		retval += 0.5;
	}
	if (haveEquipped(Item.get("V for Vivala mask")))
	{
		retval += 0.5;
	}
	return retval;
}

export function MLDamageToMonsterMultiplier(): number
{
	//Positive ML gives monsters damage resistance
	//Negative ML increases the damage inflicted on monsters
	let retval: number = 1 - 0.004 * monsterLevelAdjustment();
	if (retval < 0.5)
	{
		//damage resistance is capped at 50%
		retval = 0.5;
	}
	return retval;
}

export function freeCrafts$1(): number
{
	let retval: number = 0;
	if (haveSkill(Skill.get("Rapid Prototyping")) && isUnrestricted(Item.get("Crimbot ROM: Rapid Prototyping")))
	{
		retval += 5 - toInt(getProperty("_rapidPrototypingUsed"));
	}
	if (haveSkill(Skill.get("Expert Corner-Cutter")) && isUnrestricted(Item.get("LyleCo Contractor's Manual")))
	{
		retval += 5 - toInt(getProperty("_expertCornerCutterUsed"));
	}
	retval += haveEffect(Effect.get("Inigo's Incantation of Inspiration")) / 5;
	retval += toInt(getProperty("homebodylCharges"));
//	if(have_skill($skill[Inigo\'s Incantation Of Inspiration]))
//	{
//		if(my_mp() > mp_cost($skill[Inigo\'s Incantation Of Inspiration]))
//		{
//			retval += 2;
//		}
//		else if(have_effect($effect[Inigo\'s Incantation Of Inspiration]) >= 5)
//		{
//			retval += 1;
//		}
//	}

	return retval;
}

export function isFreeMonster(mon: Monster): boolean
{
	return isFreeMonster$1(mon, Location.none);
}

export function isFreeMonster$1(mon: Monster, loc: Location): boolean
{
	//No free fights in Avant Guard. Well, there are, but they now have non-free bodyguards so anything that is free now costs a turn
	if (in_avantGuard())
	{
		return false;
	}

	if (Monster.get(["angry ghost", "annoyed snake", "government bureaucrat", "slime blob", "terrible mutant"]).includes(mon) && toInt(getProperty("_voteFreeFights")) < 3)
	{
		return true;
	}

	if (Monster.get(["biker", "burnout", "jock", "party girl", "\"plain\" girl"]).includes(mon) && toInt(getProperty("_neverendingPartyFreeTurns")) < 10)
	{
		return true;
	}

	if (Monster.get(["Perceiver of Sensations", "Performer of Actions", "Thinker of Thoughts"]).includes(mon))
	{
		if (myFamiliar() === Familiar.get("Machine Elf") && toInt(getProperty("_machineTunnelsAdv")) < 5 && myLocation() === Location.get("The Deep Machine Tunnels"))
		{
			return true;
		}
	}

	if (Monster.get("X-32-F Combat Training Snowman") === mon && toInt(getProperty("_snojoFreeFights")) < 10)
	{
		return true;
	}

	if (Monster.get(["void guy", "void slab", "void spider"]).includes(mon) && toInt(getProperty("_voidFreeFights")) < 5)
	{
		return true;
	}

	if (Monster.get("drunk pygmy") === mon && itemAmount(Item.get("Bowl of Scorpions")) > 0)
	{
		return true;
	}

	if (toInt(getProperty("breathitinCharges")) > 0 && loc.environment === "outdoor")
	{
		return true;
	}

	if (Location.get(["Shadow Rift (The Ancient Buried Pyramid)", "Shadow Rift (The Hidden City)", "Shadow Rift (The Misspelled Cemetary)"]).includes(loc) && haveEffect(Effect.get("Shadow Affinity")) > 0 && !in_avantGuard())
	{
		return true;
	}

	if (mon.randomModifiers.includes("optimal"))
	{
		return true;
	}

	if (containsText(toLowerCase(mon.attributes), "free"))
	{
		return true;
	}

	return false;
}

export function auto_burningDelay(): boolean
{
	if ((auto_voteMonster$1(true) || isOverdueDigitize() || auto_sausageGoblin() || auto_backupTarget() || auto_voidMonster()) && myLocation() === solveDelayZone$1())
	{
		return true;
	}
	return false;
}

export function auto_gettingLucky(): boolean
{
	if (haveEffect(Effect.get("Lucky!")) > 0 && zone_hasLuckyAdventure(myLocation()))
	{
		return true;
	}
	return false;
}

export function auto_queueIgnore(): boolean
{
	if (auto_burningDelay() || auto_gettingLucky() || auto_haveQueuedForcedNonCombat())
	{
		return true;
	}
	return false;
}

export function auto_deleteMail(msg: kmailObject): boolean
{
	if (msg.fromid === 0 && containsText(msg.message, "We found this telegram at the bottom of an old bin of mail."))
	{
		return true;
	}
	if (msg.fromid === 0 && containsText(msg.message, "One of my agents found a copy of a telegram in the Council's fileroom"))
	{
		return true;
	}
	if (getProperty("auto_consultChoice") !== "") {
		let id: number = toInt(getPlayerId(getProperty("auto_consultChoice")));
		if (msg.fromid === id && containsText(msg.message, "completed your relationship fortune test") && toBoolean(getProperty("auto_hideAdultery")))
		{
			return true;
		}
	}
	if (msg.fromid === 3690803 && containsText(msg.message, "completed your relationship fortune test") && toBoolean(getProperty("auto_hideAdultery")))
	{
		return true;
	}

	if (msg.fromid === -1 && containsText(msg.message, "Your dedication to helping me fight crime in Gotpork city almost makes me forget about the fact that crime in Gotpork city cost me my parents."))
	{
		return true;
	}

	if (msg.fromname === "Lady Spookyraven\\'s Ghost")
	{
		return true;
	}
	if (msg.fromname === "Lady Spookyraven's Ghost")
	{
		return true;
	}
	return false;
}

export function LX_summonMonster(): boolean
{
	// summon screambat if we are at last wall to knock down and don't have a sonar-in-a-biscuit
	if (internalQuestStatus("questL04Bat") === 2 && (!auto_is_valid(Item.get("sonar-in-a-biscuit")) || itemAmount(Item.get("sonar-in-a-biscuit")) === 0) && canSummonMonster(Monster.get("screambat")))
	{
		if (summonMonster(Monster.get("screambat"))) { return true; }
	}
	// summon mountain man if we know the ore we need and still need 2 or more
	// don't summon if we have model train set as it is an easy source of ore
	let oreGoal: Item = toItem(getProperty("trapperOre"));
	if (internalQuestStatus("questL08Trapper") < 2 && auto_haveTrainSet() && oreGoal !== Item.none && itemAmount(oreGoal) < 2 && canYellowRay$1() && canSummonMonster(Monster.get("mountain man")))
	{
		adjustForYellowRayIfPossible$1();
		let need_dupe: boolean = itemAmount(oreGoal) < 1;
		let can_mctwist: boolean = auto_can_equip(Item.get("pro skateboard")) && !toBoolean(getProperty("_epicMcTwistUsed"));
		let will_mctwist: boolean = can_mctwist && need_dupe;
		auto_log_info$1(`Trying to summon a mountain man${(will_mctwist ? " which we will McTwist." : ".")}`);
		if (will_mctwist)
		{
			autoEquip$1(Item.get("pro skateboard"));
		}
		if (summonMonster(Monster.get("mountain man"))) { return true; }
	}

	if (auto_is_valid(Item.get("smut orc keepsake box")) && itemAmount(Item.get("smut orc keepsake box")) === 0 && myLevel() >= 9 && (lumberCount() < 30 || fastenerCount() < 30) && canSummonMonster(Monster.get("smut orc pervert")))
	{
		// summon pervert here but handling of L9 quest will open box
		if (auto_haveGreyGoose()) {
			handleFamiliar$1(Familiar.get("Grey Goose"));
		}
		if (summonMonster(Monster.get("smut orc pervert"))) { return true; }
	}
	// summon LFM if don't have autumnaton since that guarantees 1 turn to get 5 barrels
	let gunpowder_left: number = 5 - itemAmount(Item.get("barrel of gunpowder"));
	function canCopyLFM(): boolean
	{
		return auto_canHabitat() || auto_backupUsesLeft() >= max(gunpowder_left - 1, 0);
	}
	if (getProperty("sidequestLighthouseCompleted") === "none" && gunpowder_left > 0 && myLevel() >= 12 && canSummonMonster(Monster.get("lobsterfrogman")) && (canCopyLFM() || gunpowder_left === 1) && !(auto_habitatMonster() === Monster.get("lobsterfrogman")) && getProperty("lastEncounter") !== Monster.get("lobsterfrogman").toString() && !auto_hasAutumnaton())
	{
		if (summonMonster(Monster.get("lobsterfrogman"))) { return true; }
	}
	// get war outfit if have yr available.
	// check for lvl 9 as that is when "L12_preOutfit" will try to get the prewar outfit. Better to summon and skip to war outfit
	if (!possessOutfit$1("Frat Warrior Fatigues") && auto_warSide() === "fratboy" && canYellowRay$1() && myLevel() >= 9 && (canSummonMonster(Monster.get("War Frat 151st Infantryman")) || canSummonMonster(Monster.get("War Frat Mobile Grill Unit")) || canSummonMonster(Monster.get("Orcish Frat Boy Spy"))))
	{
		adjustForYellowRayIfPossible$1();
		// attempt to use calculate the universe
		if (summonMonster(Monster.get("War Frat 151st Infantryman"))) { return true; }
		// attempt to summon other sources of outfit
		if (summonMonster(Monster.get("War Frat Mobile Grill Unit"))) { return true; }
		if (summonMonster(Monster.get("Orcish Frat Boy Spy"))) { return true; }
	}
	if (!possessOutfit$1("War Hippy Fatigues") && auto_warSide() === "hippy" && canYellowRay$1() && myLevel() >= 12 && (canSummonMonster(Monster.get("War Hippy Airborne Commander")) || canSummonMonster(Monster.get("War Hippy Spy"))))
	{
		adjustForYellowRayIfPossible$1();
		if (summonMonster(Monster.get("War Hippy Airborne Commander"))) { return true; }
		if (summonMonster(Monster.get("War Hippy Spy"))) { return true; }
	}
	// summon astronomer if only missing star chart for star key
	// only in Hardcore or if we have no pulls remaining as we can just pull a star chart in Normal
	if (needStarKey() && itemAmount(Item.get("star")) >= 8 && itemAmount(Item.get("line")) >= 7 && canSummonMonster(Monster.get("Astronomer")) && (inHardcore() || pullsRemaining() < 1))
	{
		if (summonMonster(Monster.get("Astronomer"))) { return true; }
	}
	// summon additional monsters in heavy rains with rain man when available
	if (haveSkill(Skill.get("Rain Man")) && myRain() >= 50)
	{
		// summon Family Jewels or Bush to get only stars
		if (needStarKey() && itemAmount(Item.get("star")) < 8 && itemAmount(Item.get("line")) >= 7)
		{
			if (canSummonMonster(Monster.get("Family Jewels")) && summonMonster(Monster.get("Family Jewels"))) { return true; }
			if (canSummonMonster(Monster.get("Bush")) && summonMonster(Monster.get("Bush"))) { return true; }
		}
		// summon Trouser Snake or Box to get only lines
		if (needStarKey() && itemAmount(Item.get("star")) >= 8 && itemAmount(Item.get("line")) < 7)
		{
			if (canSummonMonster(Monster.get("Trouser Snake")) && summonMonster(Monster.get("Trouser Snake"))) { return true; }
			if (canSummonMonster(Monster.get("Box")) && summonMonster(Monster.get("Box"))) { return true; }
		}
		// summon Skinflute or Camel's Toe to get both stars and lines
		if (needStarKey() && itemAmount(Item.get("star")) < 8 && itemAmount(Item.get("line")) < 7)
		{
			if (canSummonMonster(Monster.get("Skinflute")) && summonMonster(Monster.get("Skinflute"))) { return true; }
			if (canSummonMonster(Monster.get("Camel's Toe")) && summonMonster(Monster.get("Camel's Toe"))) { return true; }
		}
	}

	return false;
}

export function canSummonMonster(mon: Monster): boolean
{
	return summonMonster$1(mon, true);
}

export function summonMonster(mon: Monster): boolean
{
	return summonMonster$1(mon, false);
}

export function summonMonster$1(mon: Monster, speculative: boolean): boolean
{
	if (!speculative)
	{
		auto_log_debug(`Trying to summon ${mon}`, "blue");
		setProperty("auto_nonAdvLoc", true.toString());
	}

	if (!speculative)
	{
		// Equip the combat lover's locket if we're missing a monster about to be summoned
		if (auto_haveCombatLoversLocket() && mon.id > 0 && mon.copyable && !mon.boss && !auto_monsterInLocket(mon))
		{
			auto_log_info(`We want to get the "${mon}" monster into the combat lover's locket from summoning, so we're bringing it along.`, "blue");
			autoEquip$1(Item.get("combat lover's locket"));
		}
		// Equip a copier if we want to copy it
		if (auto_wantToCopy$1(mon))
		{
			auto_log_info$1(`We want to copy the ${mon} so adjusting for our equipment if possible.`);
			adjustForCopyIfPossible(mon);
		}
	}
	// methods which require specific circumstances
	if (mon === Monster.get("War Frat 151st Infantryman"))
	{
		// calculate the universe's only summon we want, so prioritize using it
		if (LX_calculateTheUniverse(speculative))
		{
			auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via calculate the universe`, "blue");
			return true;
		}
	}
	if (rainManSummon(mon, speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via rain man`, "blue");
		return true;
	}
	// todo add support for Baa'baa'bu'ran with deck of every card sheep card
	if (timeSpinnerCombat$1(mon, speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via time spinner`, "blue");
		return true;
	}
	// methods which can only summon monsters should be attempted first
	if (auto_meggFight(mon, speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via chest mimics`, "blue");
		return true;
	}

	if (auto_fightLocketMonster(mon, speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via combat lover's locket`, "blue");
		return true;
	}
	if (handleFaxMonster$2(mon, !speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via fax`, "blue");
		return true;
	}
	// methods which can do more than summon monsters
	if (auto_cargoShortsOpenPocket$2(mon, speculative))
	{
		auto_log_debug(`${(speculative ? "Can" : "Did")} summon ${mon} via cargo shorts`, "blue");
		return true;
	}
	if (speculative && canGenieCombat(mon))
	{
		auto_log_debug(`Can summon ${mon} via wishing`, "blue");
		return true;
	}
	else if (!speculative && makeGenieCombat(mon))
	{
		auto_log_debug(`Did summon ${mon} via wishing`, "blue");
		return true;
	}

	return false;
}

export function summonedMonsterToday(mon: Monster): boolean
{
	let copiedMonsters: string = getProperty("auto_copies");
	let searchString: string = `(${myDaycount()}:${mon.toString()}`;
	return containsText(copiedMonsters, searchString);
}

export function handleCopiedMonster(itm: Item): boolean
{
	return handleCopiedMonster$1(itm, null);
}

export function handleCopiedMonster$1(itm: Item, option: CombatMacro): boolean
{
	let id: number = 0;
	switch (itm)
	{
	case Item.get("Rain-Doh black box"):
		return handleCopiedMonster$1(Item.get("Rain-Doh box full of monster"), option);
	case Item.get("Spooky Putty sheet"):
		return handleCopiedMonster$1(Item.get("Spooky Putty monster"), option);
	case Item.get("4-d camera"):
		return handleCopiedMonster$1(Item.get("shaking 4-d camera"), option);
	case Item.get("unfinished ice sculpture"):
		return handleCopiedMonster$1(Item.get("ice sculpture"), option);
	case Item.get("print screen button"):
		return handleCopiedMonster$1(Item.get("screencapped monster"), option);
	case Item.get("Rain-Doh box full of monster"):
		if (getProperty("rainDohMonster") === "")
		{
			abort(`${itm} has no monster so we can't use it`);
		}
		id = toInt(itm);
		break;
	case Item.get("Spooky Putty monster"):
		if (getProperty("spookyPuttyMonster") === "")
		{
			abort(`${itm} has no monster so we can't use it`);
		}
		id = toInt(itm);
		break;
	case Item.get("shaking 4-d camera"):
		if (getProperty("cameraMonster") === "")
		{
			abort(`${itm} has no monster so we can't use it`);
		}
		if (toBoolean(getProperty("_cameraUsed")))
		{
			abort(`${itm} already used today. We can not continue`);
		}
		id = toInt(itm);
		break;
	case Item.get("ice sculpture"):
		if (itemAmount(itm) === 0)
		{
			abort(`We do not have any ${itm}`);
		}
		if (getProperty("iceSculptureMonster") === "")
		{
			abort(`${itm} has no monster so we can't use it`);
		}
		if (toBoolean(getProperty("_iceSculptureUsed")))
		{
			abort(`${itm} already used today. We can not continue`);
		}
		id = toInt(itm);
		break;
	case Item.get("screencapped monster"):
		if (getProperty("screencappedMonster") === "")
		{
			abort(`${itm} has no monster so we can't use it`);
		}
		id = toInt(itm);
		break;
	}
	if (id !== 0)
	{
		return autoAdvBypass$2(`inv_use.php?pwd&which=3&whichitem=${id}`, Location.get("Noob Cave"), option);
	}
	return false;
}

export function maxSealSummons(): number
{
	if (itemAmount(Item.get("Claw of the Infernal Seal")) > 0)
	{
		return 10;
	}
	return 5;
}


export function acquireCombatMods(amt: number): boolean
{
	return acquireCombatMods$1(amt, true);
}

export function acquireCombatMods$1(amt: number, doEquips: boolean): boolean
{
	if (amt < 0)
	{
		return providePlusNonCombat$3(min(auto_combatModCap(), -1 * amt), doEquips);
	}
	else if (amt > 0)
	{
		return providePlusCombat$3(min(auto_combatModCap(), amt), doEquips);
	}
	return true;
}

export function basicAdjustML(): boolean
{
	if (is_boris()) { return borisAdjustML(); }
	if (in_plumber())
	{
		// We don't get many stats from combat - no point running ML.
		auto_change_mcd(0);
		return false;
	}
	if (monsterLevelAdjustment() > 150 && monsterLevelAdjustment() <= 160)
	{
		let base: number = monsterLevelAdjustment() - currentMcd();
		if (base <= 150)
		{
			let canhave: number = 150 - base;
			auto_change_mcd(canhave);
		}
	}
	else {
		if ((toInt(getProperty("flyeredML")) >= 10000 || toBoolean(getProperty("auto_ignoreFlyer"))) && myLevel() >= 13 && !toBoolean(getProperty("auto_disregardInstantKarma")))
		{
			auto_change_mcd(0);
		}
		else if (monsterLevelAdjustment() + (10 - currentMcd()) <= 150)
		{
			auto_change_mcd(11);
		}
	}
	return false;
}

export function highest_available_mcd(): number
{
	if (in_koe()) { return 0; }

	if (knollAvailable() && itemAmount(Item.get("detuned radio")) > 0)
	{
		if (in_glover())
		{
			return 0;
		}
		else {
			return 10;
		}
	}
	else if (inGnomeSign() && gnomadsAvailable())
	{
		return 10;
	}
	else if (canadiaAvailable())
	{
		return 11;
	}
	//in_bad_moon() availability is special since it costs a turn and highest is 8 to 11 by RNG

	return currentMcd();
}

export function auto_change_mcd(mcd: number): boolean
{
	return auto_change_mcd$1(mcd, false);
}

export function auto_change_mcd$1(mcd: number, immediately: boolean): boolean
{
	let best: number = highest_available_mcd();
	if (inBadMoon())
	{
		best = 11;
	}
	//under level 13 we want to level up. level 14+ we already missed the instant karma, no point in holding back anymore.
	if (myLevel() === 13 && !toBoolean(getProperty("auto_disregardInstantKarma")))
	{
		if (getProperty("questL12War") === "finished" || getProperty("sidequestArenaCompleted") !== "none" || toInt(getProperty("flyeredML")) >= 10000 || toBoolean(getProperty("auto_ignoreFlyer")))
		{
			mcd = 0;
		}
	}
	mcd = min(mcd, best);
	let next: number = max(0, mcd);

	setProperty("auto_mcd_target", next.toString()); // if we return without setting this, we will flip-flop the mcd every adventure...

	if (next === currentMcd())
	{
		return true;
	}

	if (immediately)
	{
		return changeMcd(next);
	}
	//for non immediate changes we still return true because the mafia setting was changed and MCD will be changed later.
	return true;
}

export function evokeEldritchHorror(option?: CombatMacro): boolean
{
	if (!haveSkill(Skill.get("Evoke Eldritch Horror")))
	{
		return false;
	}
	if (toBoolean(getProperty("_eldritchHorrorEvoked")))
	{
		return false;
	}
	if (myMp() < mpCost(Skill.get("Evoke Eldritch Horror")))
	{
		return false;
	}

	let pages: Map<number, string> = new Map();
	pages.set(0, `runskillz.php?pwd=&targetplayer${myId()}&quantity=1&whichskill=168`);
	return autoAdvBypass(0, pages, Location.get("Noob Cave"), option);
}

export function fightScienceTentacle(): boolean
{
	if (in_koe() || in_avantGuard())
	{
		return false;
	}
	if (toBoolean(getProperty("_eldritchTentacleFought")))
	{
		return false;
	}

	if (!handleServant(Servant.get("Scribe")))
	{
		handleServant(Servant.get("Cat"));
	}

	let temp: string = visitUrl("place.php?whichplace=forestvillage&action=fv_scientist");

	let choices: Map<number, string> = new Map(Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]));
	let abortChoice: number = 0;
	for (let [idx, text] of choices)
	{
		if (text === "Great!")
		{
			abortChoice = idx;
			break;
		}
	}

	if ((choices.get(1) ?? choices.set(1, "").get(1)) !== "Can I fight that tentacle you saved for science?" || abortChoice === 0)
	{
		setProperty("_eldritchTentacleFought", true.toString());
		temp = visitUrl(`choice.php?whichchoice=1201&pwd=&option=${abortChoice}`);
		return false;
	}

	setProperty("auto_nonAdvLoc", true.toString());
	temp = visitUrl(`choice.php?whichchoice=1201&pwd=&option=${abortChoice}`);
	setProperty("auto_nextEncounter", "Eldritch Tentacle");
	let pages: Map<number, string> = new Map();
	pages.set(0, "place.php?whichplace=forestvillage&action=fv_scientist");
	pages.set(1, "choice.php?whichchoice=1201&pwd=&option=1");
	return autoAdvBypass(0, pages, Location.get("Noob Cave"), null);
}

export function handleSealNormal(it: Item, option?: CombatMacro): boolean
{
	let candles: number = 0;
	let level: number = 0;
	switch (it)
	{
	case Item.get("figurine of an armored seal"):	candles = 10;	level = 9;	break;
	case Item.get("figurine of a cute baby seal"):	candles = 5;	level = 5;	break;
	case Item.get("figurine of a wretched-looking seal"):	candles = 1;	level = 1;	break;
	}

	if (candles === 0)
	{
		return false;
	}

	if (toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(it) > 0 && itemAmount(Item.get("seal-blubber candle")) >= candles && myLevel() >= level)
	{
		ensureSealClubs();
		return autoAdvBypass$2(`inv_use.php?pwd=&whichitem=${toInt(it)}&checked=1`, Location.get("Noob Cave"), option);
	}
	else {
		abort(`Can't use ${it} for some raisin`);
	}
	return false;
}
export function handleSealAncient(option?: CombatMacro): boolean
{
	if (toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of an ancient seal")) > 0 && itemAmount(Item.get("seal-blubber candle")) >= 3)
	{
		return autoAdvBypass$2("inv_use.php?pwd=&whichitem=3905&checked=1", Location.get("Noob Cave"), option);
	}
	else {
		abort("Can't use an Ancient Seal for some raisin");
	}
	return false;
}
export function handleSealElement(flavor: Element, option?: CombatMacro): boolean
{
	let page: string = "";
	if (flavor === Element.get("hot") && toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of a charred seal")) > 0 && itemAmount(Item.get("imbued seal-blubber candle")) > 0)
	{
		page = "inv_use.php?pwd=&whichitem=3909&checked=1";
	}
	if (flavor === Element.get("cold") && toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of a cold seal")) > 0 && itemAmount(Item.get("imbued seal-blubber candle")) > 0)
	{
		page = "inv_use.php?pwd=&whichitem=3910&checked=1";
	}
	if (flavor === Element.get("sleaze") && toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of a slippery seal")) > 0 && itemAmount(Item.get("imbued seal-blubber candle")) > 0)
	{
		page = "inv_use.php?pwd=&whichitem=3911&checked=1";
	}
	if (flavor === Element.get("spooky") && toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of a shadowy seal")) > 0 && itemAmount(Item.get("imbued seal-blubber candle")) > 0)
	{
		page = "inv_use.php?pwd=&whichitem=3907&checked=1";
	}
	if (flavor === Element.get("stench") && toInt(getProperty("_sealsSummoned")) < maxSealSummons() && itemAmount(Item.get("figurine of a stinking seal")) > 0 && itemAmount(Item.get("imbued seal-blubber candle")) > 0)
	{
		page = "inv_use.php?pwd=&whichitem=3908&checked=1";
	}
	return autoAdvBypass$2(page, Location.get("Noob Cave"), option);
}

export function handleBarrelFullOfBarrels(daily: boolean): boolean
{
	if (!toBoolean(getProperty("barrelShrineUnlocked")))
	{
		return false;
	}
	if (daily && toBoolean(getProperty("_didBarrelBustToday")))
	{
		return false;
	}
	if (!isUnrestricted(Item.get("shrine to the Barrel god")))
	{
		return false;
	}

	let page: string = visitUrl("barrel.php");

	if (!containsText(page, "The Barrel Full of Barrels"))
	{
		return false;
	}

	let locations: Map<string, boolean> = new Map();
	let smashed: number = 0;
	let mimic_matcher: AshMatcher = new AshMatcher("<div class=\"ex\">((?:<div class=\"mimic\">!</div>)|)<a class=\"spot\" href=\"choice.php[?]whichchoice=1099[&]pwd=(?:.*?)[&]option=1[&]slot=(\\d\\d)\"><img title=\"(.*?)\"", page);
	while (mimic_matcher.find())
	{
		let mimic: string = mimic_matcher.group(1);
		let slotID: string = mimic_matcher.group(2);
		let label: string = mimic_matcher.group(3);

		if (mimic !== "")
		{
			auto_log_warning(`Found mimic in slot: ${slotID}`, "red");
		}
		else if (label === "A barrel")
		{
			smashed = smashed + 1;
			visitUrl(`choice.php?whichchoice=1099&pwd&option=1&slot=${slotID}`);
		}
	}
	setProperty("_didBarrelBustToday", true.toString());
	return smashed > 0;
}

export function use_barrels(): boolean
{
	if (!toBoolean(getProperty("barrelShrineUnlocked")))
	{
		return false;
	}
	if (inAftercore())
	{
		return false;
	}
	if (in_bhy())
	{
		return false;
	}

	let barrels: Item[] = Item.get(["little firkin", "normal barrel", "big tun", "weathered barrel", "dusty barrel", "disintegrating barrel", "moist barrel", "rotting barrel", "mouldering barrel", "barnacled barrel"]);

	let retval: boolean = false;
	for (let it of barrels)
	{
		if (itemAmount(it) < 10)
		{
			retval = toBoolean(toInt(retval) | toInt(itemAmount(it) > 0));
			use(itemAmount(it), it);
		}
	}
	return retval;
}

export function auto_autosell(quantity: number, toSell: Item): boolean
{
	if (myMeat() > 100000)
	{
		return false;
	}

	if (itemAmount(toSell) < quantity)
	{
		return false;
	}

	if (!in_wotsf() && !in_amw())
	{
		return autosell(quantity, toSell);
	}
	if (toInt(getProperty("totalCharitableDonations")) < 1000000)
	{
		return autosell(quantity, toSell);
	}
	return false;
}

export function runChoice$1(page_text: string): string
{
	while (containsText(page_text, "choice.php"))
	{
		//# Get choice adventure number
		let begin_choice_adv_num: number = indexOf(page_text, "whichchoice value=") + 18;
		let end_choice_adv_num: number = indexOf(page_text, "><input", begin_choice_adv_num);
		let choice_adv_num: string = substring(page_text, begin_choice_adv_num, end_choice_adv_num);

		let choice_adv_prop: string = `choiceAdventure${choice_adv_num}`;
		let choice_num: string = getProperty(choice_adv_prop);
		if (choice_num === "")
		{
			abort("Unsupported Choice Adventure!");
		}

		let url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
		page_text = visitUrl(url);
	}
	return page_text;
}

export function doNumberology(goal: string): number
{
	return doNumberology$3(goal, true, null);
}

export function doNumberology$1(goal: string, option: CombatMacro): number
{
	return doNumberology$3(goal, true, option);
}

export function doNumberology$2(goal: string, doIt: boolean): number
{
	return doNumberology$3(goal, doIt, null);
}

export function doNumberology$3(goal: string, doIt: boolean, option: CombatMacro): number
{
	if (!auto_have_skill(Skill.get("Calculate the Universe")))
	{
		return -1;
	}
	if (toInt(getProperty("_universeCalculated")) >= min(3, toInt(getProperty("skillLevel144"))))
	{
		return -1;
	}
	if (myMp() < 2)
	{
		return -1;
	}

	let numberwang: number = 69; // default to adventures3
	if (goal === "battlefield") {
		numberwang = 51;
	}

	let numberology: Map<number, number> = new Map(Object.entries(reverseNumberology()).map(([_k, _v]) => [toInt(_k), _v]));

	if (numberology.has(numberwang)) {
		auto_log_info(`Found option for Numberology: ${numberwang} (${goal})`, "blue");
		if (!doIt)
		{
			return (numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang));
		}

		if (goal === "battlefield")
		{
			setProperty("auto_nonAdvLoc", true.toString());
			let pages: Map<number, string> = new Map();
			pages.set(0, "runskillz.php?pwd&action=Skillz&whichskill=144&quantity=1");
			pages.set(1, `choice.php?whichchoice=1103&pwd=&option=1&num=${(numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang))}`);
			autoAdvBypass(0, pages, Location.get("Noob Cave"), option);
			handleTracker$1(Monster.get("War Frat 151st Infantryman").toString(), Skill.get("Calculate the Universe").toString(), "auto_copies");
		}
		else {
			visitUrl("runskillz.php?pwd&action=Skillz&whichskill=144&quantity=1", true);
			visitUrl(`choice.php?whichchoice=1103&pwd=&option=1&num=${(numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang))}`);
		}
		return (numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang));
	}
	return -1;
}

export function candyEggDeviler(): boolean
{
	if (!(itemAmount(Item.get("candy egg deviler")) > 0 || storageAmount(Item.get("candy egg deviler")) > 0))
	{
		//do we have a Candy Egg Deviler?
		return false;
	}
	if (!(toInt(getProperty("_candyEggsDeviled")) < 3))
	{
		//already generated our 3 deviled candy eggs today
		return false;
	}

	if (storageAmount(Item.get("candy egg deviler")) > 0)
	{
		pullXWhenHaveY(Item.get("candy egg deviler"), 1, 0);
	}
	//Below is modified from the synthesis code
	let maxprice: number = 2500;
	if (toInt(getProperty("auto_maxCandyPrice")) !== 0)
	{
		maxprice = toInt(getProperty("auto_maxCandyPrice"));
	}

	let candyList: Map<number, Item> = new Map();
	for (let it of Item.get(["seal-clubbing club", "seal tooth", "helmet turtle", "turtle totem", "pasta spoon", "ravioli hat", "saucepan", "spices", "disco mask", "disco ball", "stolen accordion", "mariachi pants", "moxie weed", "strongness elixir", "magicalness-in-a-can", "spicy noodles", "tortoise's blessing", "asparagus knife", "Kentucky-style derby", "sweet ninja sword", "studded leather boxer shorts", "chewing gum on a string", "ten-leaf clover", "meat paste", "Dolphin King's map", "spider web", "really sticky spider web", "really really sticky spider web", "big rock", "seal-toothed rock", "Bjorn's Hammer", "snorkel", "Dolphin King's crown", "Knob Goblin scimitar", "Knob Goblin tongs", "viking helmet", "Knob Goblin pants", "pretty flower", "casino pass", "ice-cold Sir Schlitz", "hermit permit", "worthless trinket", "worthless gewgaw", "worthless knick-knack", "wooden figurine", "hot buttered roll", "heart of rock and roll", "bowl of cottage cheese", "Rock and Roll Legend", "Knob Goblin Uberpants", "banjo strings", "stone banjo", "Disco Banjo", "jaba&ntilde;ero pepper", "heavy hot sauce", "5-Alarm Saucepan", "stone turtle", "slingshot", "Mace of the Tortoise", "fortune cookie", "oriole-feather headdress", "action figure body", "action figure head", "Mighty Bjorn action figure", "golden twig", "spaghetti with rock-balls", "Pasta Spoon of Peril", "Newbiesport&trade; tent", "bar skin", "wooden stakes", "barskin hat", "barskin tent", "Spooky Temple map", "spooky sapling", "Spooky-Gro fertilizer", "spooky stick", "pretty bouquet", "bugbear bungguard", "fairy gravy boat", "ice-cold Willer", "rusty metal ring", "rusty metal shaft", "Orcish meat locker", "unlocked meat locker", "rusty metal key", "meat from yesterday", "meat stack", "sword hilt", "helmet recipe", "pants kit", "meatsmithing guide", "basic meat sword", "basic meat pants", "basic meat helmet", "dope gangsta bling-bling", "pimpin' meat hat", "dried face", "meat face", "lifeless meat doll", "meat golem", "spooky shrunken head", "spooky staff", "spooky scarecrow", "bowl of lucky charms", "ketchup", "catsup", "big stick", "crossbow string", "basic meat staff", "basic meat crossbow", "meatloaf helmet", "dripping meat sword", "dripping meat staff", "dripping meat crossbow", "Bugfinder Blade", "Gnollish plunger", "spring", "sprocket", "cog", "sprocket assembly", "cog and sprocket assembly", "Gnollish flyswatter", "empty meat tank", "full meat tank", "meat engine", "Gnollish autoplunger", "sticky meat pants", "third-hand nunchaku", "enchanted eyepatch", "frilly skirt", "Meat maid body", "Certificate of Participation", "bitchin' meatcar", "sweet rims", "tires", "dope wheels", "ice-cold six-pack", "valuable trinket", "dingy planks", "dingy dinghy", "anticheese", "cottage", "stone of eXtreme power", "barbed-wire fence", "dinghy plans", "eXtreme meat sword", "eXtreme meat staff", "eXtreme meat crossbow", "Scalp of Gorgolok", "Elder Turtle Shell", "Colander of Em-er'il", "Ancient Saucehelm", "Disco 'Fro Pick", "El Sombrero De Lopez", "guild application", "Dramatic&trade; range", "Gnollish pie tin", "wad of dough", "pie crust", "ghuol egg", "ghuol egg quiche", "skeleton bone", "smart skull", "skewer", "ghuol ears", "ghuol-ear kabob", "bone rattle", "bugbear beanie", "lihc eye", "lihc eye pie", "gnoll lips", "taco shell", "Gnollish casserole dish", "uncooked chorizo", "disembodied brain", "brainy skull", "detective skull", "chorizo taco", "ice-cold fotie", "baseball", "batgut", "bat wing", "briefcase", "fat stacks of cash", "enchanted bean", "loose teeth", "bat guano", "guano coffee cup", "batskin belt", "old batskin belt", "birthday candle", "Mr. Accessory", "eXtreme nose ring", "disassembled clover", "rat whisker", "rat appendix", "shiny ring", "rat appendix kabob", "bat wing kabob", "carob chunks", "herbs", "carob chunk cookies", "secret blend of herbs and spices", "piercing post", "hippy herbal tea", "patchouli incense stick", "wad of tofu", "Feng Shui for Big Dumb Idiots", "decorative fountain", "windchimes", "filthy corduroys", "filthy knitted dread sack", "Uncle Jick's Brownie Mix", "carob brownies", "herb brownies", "hemp string", "necklace chain", "gnoll teeth", "gnoll-tooth necklace", "phat turquoise bead", "phat turquoise bracelet", "eyepatch", "tofu casserole", "can of Red Minotaur", "Kentucky-fried meat sword", "Kentucky-fried meat staff", "Kentucky-fried meat crossbow", "dead guy's watch", "Doc Galaktik's Pungent Unguent", "Doc Galaktik's Ailment Ointment", "Doc Galaktik's Restorative Balm", "Doc Galaktik's Homeopathic Elixir", "Bigger Bugfinder Blade", "Queue Du Coq cocktailcrafting kit", "bottle of gin", "bottle of vodka", "Orcish baseball cap", "Orcish cargo shorts", "Orcish frat-paddle", "orange", "grapefruit", "grapes", "olive", "tomato", "fermenting powder", "salty dog", "bloody mary", "screwdriver", "martini", "bloody beer", "shot of orange schnapps", "shot of grapefruit schnapps", "fine wine", "shot of tomato schnapps", "extra-spicy bloody mary", "dense meat stack", "white snake skin", "White Citadel fries", "White Citadel burger", "piece of wedding cake", "white chocolate chips", "white chocolate chip cookies", "white satin pants", "white lightning", "mullet wig", "meat cowboy hat", "white sword", "white picket fence", "enchanted barbell", "concentrated magicalness pill", "giant moxie weed", "Familiar-Gro&trade; Terrarium", "mosquito larva", "leprechaun hatchling", "extra-strength strongness elixir", "jug-o-magicalness", "suntan lotion of moxiousness", "Pick-O-Matic lockpicks", "gasmask", "Boris's key", "Jarlsberg's key", "Sneaky Pete's key", "walrus-tusk earring", "ring of half-assed regeneration", "Boris's ring", "potato sprout", "Jarlsberg's earring", "Sneaky Pete's breath spray", "can of maces", "rubber axe", "chef's hat", "pail", "demonskin trousers", "dungeoneer's dungarees", "tamarind-flavored chewing gum", "lime-and-chile-flavored chewing gum", "pickle-flavored chewing gum", "jaba&ntilde;ero-flavored chewing gum", "flat dough", "Knob sausage", "Knob mushroom", "dry noodles", "Knob Goblin harem pants", "Knob Goblin harem veil", "Knob Goblin perfume", "Knob Goblin elite helm", "Knob Goblin elite pants", "Knob Goblin elite polearm", "hill of beans", "Knob Goblin visor", "Crown of the Goblin King", "bean burrito", "spicy bean burrito", "insanely spicy bean burrito", "enchanted bean burrito", "spicy enchanted bean burrito", "insanely spicy enchanted bean burrito", "bat haggis", "menudo", "goat cheese", "plain pizza", "sausage pizza", "goat cheese pizza", "mushroom pizza", "goat", "bottle of whiskey", "goat beard", "glass of goat's milk", "white Canadian", "lemon", "lime", "sabre teeth", "sabre-toothed lime cub", "consolation ribbon", "big ol' trophy", "tenderizing hammer", "Cobb's Knob lab key", "Knob Goblin steroids", "Knob Goblin love potion", "Knob Goblin stink bomb", "Knob Goblin sharpening spray", "Knob Goblin seltzer", "Knob Goblin superseltzer", "scrumptious reagent", "Dyspepsi-Cola", "cold ninja mask", "icy katana hilt", "hot katana blade", "icy-hot katana", "ninja hot pants", "frigid ninja stars", "frozen nunchaku", "eXtreme scarf", "snowboarder pants", "Mountain Stream soda", "gr8ps", "t8r tots", "miner's helmet", "miner's pants", "7-Foot Dwarven mattock", "linoleum ore", "asbestos ore", "chrome ore", "linoleum sword hilt", "linoleum stick", "linoleum crossbow string", "asbestos sword hilt", "asbestos stick", "asbestos crossbow string", "chrome sword hilt", "chrome stick", "chrome crossbow string", "linoleum meat stack", "asbestos meat stack", "chrome meat stack", "linoleum sword", "linoleum staff", "linoleum crossbow", "asbestos sword", "asbestos staff", "asbestos crossbow", "chrome sword", "chrome staff", "chrome crossbow", "fuzzy dice", "yeti fur", "meaty helmet turtle", "asbestos helmet turtle", "linoleum helmet turtle", "chrome helmet turtle", "penguin skin", "yak skin", "hippopotamus skin", "penguin shorts", "yakskin pants", "hippopotamus pants", "eXtreme mittens", "handful of drink tickets", "Knob Kitchen grab-bag", "swashbuckling pants", "stuffed shoulder parrot", "acoustic guitarrr", "sunken chest", "pirate pelvis", "pirate skull", "spooky pirate skeleton", "vial of patchouli oil", "sk8board", "Jolly Roger charrrm", "barrrnacle", "Jolly Roger charrrm bracelet", "crowbarrr", "leotarrrd", "safarrri hat", "henna tattoo", "Ferrigno's Elixir of Power", "serum of sarcasm", "tomato juice of powerful power", "philter of phorce", "potion of potency", "cordial of concentration", "ointment of the occult", "oil of expertise", "potion of temporary gr8ness", "box", "nothing-in-the-box", "beanbag chair", "acid-squirting flower", "clown shoes", "bloody clown pants", "long skinny balloon", "balloon helmet", "balloon sword", "balloon monkey", "chef skull", "chef-in-the-box", "bartender skull", "bartender-in-the-box", "chef-skull-in-the-box", "bartender-skull-in-the-box", "beer lens", "beer goggles", "box-in-the-box", "nothing-in-the-box-in-the-box", "box-in-the-box-in-the-box", "foolscap fool's cap", "big red clown nose", "pretentious paintbrush", "pretentious palette", "disease", "sober pill", "rusty screwdriver", "jumbo olive", "dry martini", "ye olde golde frontes", "continuum transfunctioner", "white pixel", "black pixel", "red pixel", "green pixel", "blue pixel", "red pixel potion", "blue pixel potion", "green pixel potion", "purple pixel pie", "ruby W", "wussiness potion", "Imp Ale", "hot wing", "diamond-studded cane", "flaming crutch", "cast", "leather mask", "hellion cube", "infernal insoles", "evil golden arch", "dodecagram", "box of birthday candles", "eldritch butterknife", "Mr. Container", "Newbiesport&trade; backpack", "hemp backpack", "snakehead charrrm", "Talisman o' Namsilat", "arrrgyle socks", "guitar pick", "drab sonata", "mesh cap", "enormous belt buckle", "leather chaps", "ketchup hound", "batblade", "catgut", "cat appendix", "gnatwing", "papaya", "denim axe", "Elf Farm Raffle ticket", "Elfin shortbread", "pagoda plans", "skewered cat appendix", "evil golden arches", "gnatwing earring", "Hell broth", "heavy metal thunderrr guitarrr", "heavy metal sonata", "Hey Deze nuts", "Boris's key lime", "Jarlsberg's key lime", "Sneaky Pete's key lime", "Boris's key lime pie", "Jarlsberg's key lime pie", "Sneaky Pete's key lime pie", "Hey Deze map", "bejeweled accordion strap", "magical mystery juice", "moxie magnet", "strange leaflet", "kickback cookbook", "one-winged stab bat", "rewinged stab bat", "papaya sling", "grue egg", "Frobozz Real-Estate Company Instant House (TM)", "volleyball", "blood-faced volleyball", "fertilized ghuol egg", "spray paint", "special sauce glove", "ladle of mystery", "Gnollish toolbox", "abridged dictionary", "bridge", "dictionary", "pr0n legs", "f3d0r4", "lowercase N", "Tasty Fun Good rice candy", "draggin' ball hat", "1337 7r0uZ0RZ", "Trollhouse cookies", "flaming talons", "Spam Witch sammich", "meat vortex", "334 scroll", "668 scroll", "30669 scroll", "33398 scroll", "64067 scroll", "64735 scroll", "31337 scroll", "pr0n cocktail", "drywall axe", "Pine-Fresh air freshener", "whiskey and cola", "papaya taco", "razor-sharp can lid", "stalk of asparagus", "pregnant mushroom", "ratgut", "sonar-in-a-biscuit", "Mad Train wine", "dirty hobo gloves", "bum cheek", "hermit script", "Double Bacon Beelzeburger", "Lord of the Flies-sized fries", "Brimstone Chicken Sandwich", "Jumbo Dr. Lucifer", "Children's Meal of the Damned", "delicious noodles", "delicious spicy noodles", "painful penne pasta", "ravioli della hippy", "pr0n m4nic0tti", "Hell ramen", "boring spaghetti", "sauce of the ages", "fancy schmancy cheese sauce", "Himalayan Hidalgo sauce", "fettucini Inconnu", "spaghetti with Skullheads", "gnocchetti di Nietzsche", "ridiculously huge sword", "super-spiky hair gel", "soft green echo eyedrop antidote", "cocoa eggshell fragment", "large cocoa eggshell fragment", "cocoa egg", "tiny house", "phonics down", "amulet of extreme plot significance", "scroll of drastic healing", "titanium assault umbrella", "Mohawk wig", "the Slug Lord's map", "pants of the Slug Lord", "Dr. Hobo's scalpel", "Dr. Hobo's map", "Degrassi Knoll shopping list", "Item #13", "Penultimate Fantasy chest", "Tissue Paper Immateria", "Tin Foil Immateria", "Gauze Immateria", "Plastic Wrap Immateria", "S.O.C.K.", "procrastination potion", "heavy D", "original G", "plot hole", "probability potion", "chaos butterfly", "furry fur", "Angry Farmer candy", "Mick's IcyVapoHotness Rub", "giant needle", "thin black candle", "Warm Subject gift certificate", "awful poetry journal", "WA", "NG", "wang", "Wand of Nagamar", "ND", "metallic A", "glowing red eye", "photoprotoneutron torpedo", "furry pants", "disturbing fanfic", "wolf mask", "cool whip", "little paper umbrella", "meat globe", "cheap toaster", "asshat", "abominable snowcone", "Ent cider", "toast", "skeleton key", "skeleton key ring", "Crimbo pressie", "wrapping paper", "fruitcake", "present", "Crimbo sword", "Crimbo hat", "Crimbo pants", "exclusive ultra-rare item", "quantum egg", "intragalactic rowboat", "star", "line", "star chart", "star sword", "star crossbow", "star staff", "star pants", "star hat", "star buckler", "star throwing star", "star starfish", "Richard's star key", "steaming evil", "giant castle map", "spiked femur", "ghuol guolash", "lihc face", "rusty grave robbing shovel", "cranberries", "vodka and cranberry", "whiskey sour", "skull of the Bonerdagon", "dragonbone belt buckle", "badass belt", "chest of the Bonerdagon", "roll in the hay", "slap and tickle", "slip 'n' slide", "a little sump'm sump'm", "horizontal tango", "pink pony", "Mr. Shirt", "enchanted brass knuckles", "blood of the Wereseal", "pixel hat", "pixel pants", "pixel sword", "digital key", "Ascension Souvenir T-Shirt", "harem girl t-shirt", "Knob Goblin elite shirt", "frilly shirt", "soggy wofl t-shirt", "loathing eagle baby-doll shirt", "pirate shirt", "filthy hippy poncho", "floral print shirt", "coconut bikini top", "goth kid t-shirt", "hamethyst", "baconstone", "porquoise", "pork elf goodies sack", "ring setting", "jewelry-making pliers", "hamethyst earring", "hamethyst necklace", "hamethyst bracelet", "hamethyst ring", "baconstone earring", "baconstone pendant", "baconstone bracelet", "baconstone ring", "porquoise eyebrow ring", "porquoise necklace", "porquoise bracelet", "porquoise ring", "Knoll mushroom", "spooky mushroom", "one million meat pancakes", "huge mirror shard", "hedge maze puzzle", "hedge maze key", "fishbowl", "fishtank", "fish hose", "hosed tank", "hosed fishbowl", "makeshift SCUBA gear", "easter egg balloon", "stone tablet (Sinister Strumming)", "stone tablet (Squeezings of Woe)", "stone tablet (Really Evil Rhythm)", "tambourine bells", "tambourine", "broken skull", "Knoll shroomkabob", "stuffed spooky mushroom", "hair spray", "serrated proboscis extension", "stat script", "Knob Goblin firecracker", "gourd potion", "warm mushroom", "spicy mushroom quesadilla", "cool mushroom", "cool mushroom casserole", "pointy mushroom", "cream of pointy mushroom soup", "flaming mushroom", "frozen mushroom", "stinky mushroom", "ghost cucumber", "dill", "vinegar", "brine", "especially salty dog", "ghostly pickling solution", "spectral pickle", "briny vinegar", "ghost pickle on a stick", "cologne of contempt", "spork", "voodoo doll", "basic meat fez", "tassel", "foon", "basic meat spork", "basic meat foon", "Yeti Protest Sign", "kneecapping stick", "iron pasta spoon", "support cummerbund", "Mob Penguin cellular phone", "scroll of pasta summoning", "mafia aria", "Mr. Exploiter", "'Villa' document", "Acqua Del Piatto Merlot", "raffle ticket", "strawberry", "bottle of rum", "strawberry daiquiri", "rum and cola", "grog", "Mafia bow tie", "Golden Mr. Accessory", "oil of stability", "oil of slipperiness", "Acque Luride Grezze Cabernet", "cement shoes", "rockin' wagon", "ocean motion", "fuzzbump", "poutine", "Knob stir-fry", "Knoll stir-fry", "spooky stir-fry", "asparagus stir-fry", "olive stir-fry", "Knob sausage stir-fry", "bat wing stir-fry", "rat appendix stir-fry", "tofu stir-fry", "pr0n stir-fry", "Knob stuffed shells", "b&auml;tzle", "ratini", "Knob stroganoff", "menudo ravioli", "plus sign", "milky potion", "swirly potion", "bubbly potion", "smoky potion", "cloudy potion", "effervescent potion", "fizzy potion", "dark potion", "murky potion", "baby killer bee", "anti-anti-antidote", "royal jelly", "small box", "large box", "vorpal blade", "cornuthaum", "ring of aggravate monster", "mind flayer corpse", "Uovo Marcio Shiraz", "Mafia stogie", "Maiali Sifilitici Pinot Noir", "Mafia violin case", "tomato daiquiri", "beertini", "salty slug", "papaya slung", "MAHI fez", "heteroerotic frat-paddle", "hypodermic needle", "Meat detector", "many-eyed glasses", "prosthetic forehead", "tiny shaker of salt", "blundarrrbus", "sucky decal", "tiny balloon knife", "shock collar", "moonglasses", "palm-frond toupee", "tiny knife and fork", "eye-pod", "chocolate spurs", "magnifying glass", "skewer-mounted razor blade", "brass stinger", "lead necklace", "shaving cream", "pine tar", "forest tears", "fetus-smashing club", "meatcar model", "Time Juice", "rolling pin", "unrolling pin", "crazy bastard sword", "incredibly dense meat gem", "Talisman of Baio", "hypnodisk", "bottle of goofballs", "disbelief suspenders", "supportive bra", "Blatantly Canadian", "maple syrup", "los chinos", "wooden axe", "leaflet", "leaf", "maple leaf", "balaclava", "balaclava baklava", "Warehouse 23 bling", "bugbear-smiting sword", "lumbering jack", "Dark Jill-O-Lantern", "Ms. Accessory", "Mr. Accessory Jr.", "coffee sprite", "Cheshire Bitten", "custom avatar form", "smile-sharpening stone", "miniature espresso maker", "100-Watt bulb", "Spasmi Dolorosi Del Rene Champagne", "old school Mafia knickerbockers", "Yummy Tummy bean", "Rock Pops", "Mr. Mediocrebar", "Cold Hots candy", "Wint-O-Fresh mint", "dwarf bread", "Senior Mints", "pixellated candy heart", "candied kobold", "hand turkey outline", "candied yam pinky ring", "intergalactic pom poms", "Mob Penguin protection contract", "Radio Free Baseball Cap", "Radio Free Pants", "Radio Free Foil", "radio button candy", "severed rocking horse head", "broken cellular phone", "crimbo elfling", "dental pliers", "Hawking's Elixir of Brilliance", "Ferita Del Petto Zinfandel", "fuzzy bracelets", "arse-shooting crossbow", "spiced rum", "eggnog", "candy cane", "gingerbread bugbear", "imitation nice watch", "Hanukkimbo dreidl", "menorette", "tiny plastic sword", "small Crimbo Pressie", "bow", "Crimbo stocking", "bowler", "bow staff", "bowlegged pants", "skewered jumbo olive", "skewered lime", "skewered cherry", "dirty martini", "grogtini", "cherry bomb", "extra special Crimbo stocking", "spooky hockey mask", "penguin-smacking club", "orphan baby yeti", "fez of etymology", "carob chunk noodles", "chorizo brownies", "white chocolate and tomato pizza", "flange", "clockwork key", "silk garter snake", "velvet choker", "tiny plastic seal clubber", "tiny plastic turtle tamer", "tiny plastic pastamancer", "tiny plastic sauceror", "tiny plastic disco bandit", "tiny plastic accordion thief", "tiny plastic mosquito", "tiny plastic leprechaun", "tiny plastic levitating potato", "tiny plastic angry goat", "tiny plastic sabre-toothed lime", "tiny plastic fuzzy dice", "tiny plastic spooky pirate skeleton", "tiny plastic barrrnacle", "tiny plastic howling balloon monkey", "tiny plastic stab bat", "tiny plastic grue", "tiny plastic blood-faced volleyball", "tiny plastic ghuol whelp", "tiny plastic baby gravy fairy", "tiny plastic cocoabo", "tiny plastic star starfish", "tiny plastic ghost pickle on a stick", "tiny plastic killer bee", "tiny plastic Cheshire bat", "tiny plastic coffee pixie", "tiny plastic bitchin' meatcar", "tiny plastic hermit", "tiny plastic Boris", "tiny plastic Jarlsberg", "tiny plastic Sneaky Pete", "tiny plastic Susie", "Lucky Surprise Egg", "maiden wig", "maid head", "Meat maid", "Xlyinia's notebook", "soda water", "bottle of tequila", "boxed wine", "cherry", "coconut shell", "magical ice cubes", "vodka martini", "whiskey and soda", "monkey wrench", "tequila sunrise", "margarita", "strawberry wine", "wine spritzer", "perpendicular hula", "ducha de oro", "calle de miel", "dry vodka martini", "old-fashioned", "tequila with training wheels", "sangria", "vesper", "bodyslam", "sangria del diablo", "Valentine", "whip kit", "buckler buckle", "hippo whip", "penguin whip", "yak whip", "gnauga hide whip", "gnauga hide", "hippo skin buckler", "penguin skin buckler", "yakskin buckler", "gnauga hide buckler", "Connery's Elixir of Audacity", "lucky Tam O'Shanter", "green beer", "string of red beads", "string of blue beads", "string of green beads", "cheap plastic bottle opener", "orange traffic cone", "N. O. Beer", "red striped oyster egg", "red polka-dot oyster egg", "red paisley oyster egg", "red plastic oyster egg", "blue striped oyster egg", "blue polka-dot oyster egg", "blue paisley oyster egg", "blue plastic oyster egg", "puce striped oyster egg", "puce polka-dot oyster egg", "puce paisley oyster egg", "puce plastic oyster egg", "mauve striped oyster egg", "mauve polka-dot oyster egg", "mauve paisley oyster egg", "mauve plastic oyster egg", "lavender striped oyster egg", "lavender polka-dot oyster egg", "lavender paisley oyster egg", "lavender plastic oyster egg", "black striped oyster egg", "black polka-dot oyster egg", "black paisley oyster egg", "black plastic oyster egg", "off-white striped oyster egg", "off-white polka-dot oyster egg", "off-white paisley oyster egg", "off-white plastic oyster egg", "yellow striped oyster egg", "yellow polka-dot oyster egg", "yellow paisley oyster egg", "yellow plastic oyster egg", "oyster basket", "emo roe", "gazing shoes", "personal raindrop", "rainbow tie", "clockwork widget", "clockwork thingamajig", "clockwork doohickey", "clockwork clockwise dome", "clockwork spine", "clockwork rings", "clockwork claws", "clockwork sheet", "clockwork counterclockwise dome", "clockwork sphere", "deactivated MicroMechaMech", "clockwork endoskeleton", "clockwork hat", "clockwork trench coat", "clockwork pants", "gnauga hide chaps", "false eyelashes", "targeting chip", "unwound clockwork grapefruit", "tiny Mountie hat", "clockwork bartender head", "clockwork chef head", "clockwork maid head", "clockwork detective skull", "clockwork bartender-head-in-the-box", "clockwork chef-head-in-the-box", "clockwork bartender-in-the-box", "clockwork chef-in-the-box", "clockwork maid", "tisket", "tasket", "annoying pitchfork", "Stupid University Diploma", "pregnant flaming mushroom", "pregnant frozen mushroom", "pregnant stinky mushroom", "inexplicably glowing rock", "spooky fairy gravy", "halfberd", "small leather glove", "spooky glove", "enchanted toothpick", "tiny ninja sword", "teeny-tiny ninja stars", "sequined fez", "blank white card", "beet", "Totally Gay Claymore", "star shirt", "spooky cosmetics bag", "spooky eyeliner", "spooky lipstick", "spooky bicycle chain", "mushroom fermenting solution", "flaming mushroom wine", "icy mushroom wine", "stinky mushroom wine", "pointy mushroom wine", "flat mushroom wine", "cool mushroom wine", "knob mushroom wine", "knoll mushroom wine", "spooky mushroom wine", "shot of flower schnapps", "flower petal pie", "bottle of single-barrel whiskey", "giant discarded plastic fork", "miniature gravy-covered maypole", "Retenez L'Herbe Pat&eacute;", "Breathetastic&trade; Premium Canned Air", "letter from King Ralph XI", "wholeberd", "Meleegra&trade; pills", "mariachi G-string", "irate sombrero", "pile of candy", "handsomeness potion", "marzipan skull", "poultrygeist", "hovering sombrero", "tiny maracas", "plain brown wrapper", "less-than-three-shaped box", "exactly-three-shaped box", "chocolate box", "miniature coffin", "solid asbestos box", "solid linoleum box", "solid chrome box", "cryptic puzzle box", "refrigerated biohazard container", "magnetic field", "potted cactus", "daisy", "potted fern", "tulip", "Venus flytrap", "all-purpose flower", "exotic orchid", "long-stemmed rose", "gilded lily", "deadly nightshade", "black lotus", "stuffed can of asparagus", "stuffed dodecapede", "stuffed ghuol whelp", "stuffed zmobie", "Raggedy Hippy doll", "stuffed stab bat", "apathetic lizardman doll", "stuffed yeti", "stuffed Mob Penguin", "stuffed sabre-toothed lime", "giant stuffed bugbear", "mugcake", "urinal cake", "Happy Birthday, Claude! cake", "personalized birthday cake", "three-tiered wedding cake", "babycakes", "blue velvet cake", "congratulatory cake", "angel-food cake", "devil's-food cake", "birthday party jellybean cheesecake", "white balloon", "green balloon", "heart-shaped balloon", "anniversary balloon", "Mylar balloon", "Kevlar balloon", "thought balloon", "rat head balloon", "mini-zeppelin", "Mr. Balloon", "red balloon", "Mr. Eh?", "pimonkey item", "stainless steel shillelagh", "stainless steel skullcap", "stainless steel solitaire", "stainless steel scarf", "stainless steel slacks", "stainless steel suspenders", "plexiglass pikestaff", "plexiglass pith helmet", "plexiglass pocketwatch", "plexiglass pinky ring", "plexiglass pants", "plexiglass pendant", "hockey stick of furious angry rage", "tapped black lotus", "flaming glowsticks", "iced-out bling", "limburger biker boots", "miniature carton of clove cigarettes", "deflated inflatable dodecapede", "toy six-seater hovercraft", "Glass Balls of the Goblin King", "Codpiece of the Goblin King", "rib of the Bonerdagon", "vertebra of the Bonerdagon", "Bonerdagon necklace", "Boss Bat britches", "Boss Bat bling", "Knob shroomkabob", "spooky shroomkabob", "pile of jumping beans", "jumping bean burrito", "spicy jumping bean burrito", "insanely spicy jumping bean burrito", "rat scrapple", "pail of pretentious paint", "yellow traffic cone", "wax lips", "Hatorade", "off-hand balloon", "pygmy bugbear shaman", "tiny nose-bone fetish", "box of sunshine", "gloomy black mushroom", "dead mimic", "pine wand", "ebony wand", "hexagonal wand", "aluminum wand", "marble wand", "magic lamp", "Medicinal Herb's medicinal herbs", "basic meat skirt", "Otorian Battle Scar", "basic meat kilt", "sticky meat skirt", "sticky meat kilt", "penguinskin mini-skirt", "penguinskin mini-kilt", "yakskin skirt", "yakskin kilt", "hippopotamus skirt", "hippopotamus kilt", "furry skirt", "furry kilt", "gnauga hide skirt", "gnauga hide kilt", "cheap wind-up clock", "Jekyllin hide belt", "skirt / kilt kit", "ring of adornment", "ring of increase damage", "ring of gain strength", "ring of cold resistance", "ring of fire resistance", "ring of conflict", "pirate hook", "monster bait", "deodorant", "reodorant", "Mjolnir Jr.", "doppelshifter egg", "tiny makeup kit", "red traffic cone", "calm attention-deficit demon", "unwound cymbal-playing monkey", "attention spanner", "funky brass fez", "comfy blanket", "Baron von Ratsworth's monocle", "Baron von Ratsworth's money clip", "Baron von Ratsworth's tophat", "rose-colored glasses", "facsimile dictionary", "blood flower", "lovecat tail", "plastic passion fruit", "questionable taco", "Doc's Miracle Cure", "petrified time", "time helmet", "time trousers", "time sword", "Dyspepsi-Cola helmet", "Cloaca-Cola shield", "Cloaca-Cola fatigues", "Dyspepsi-Cola shield", "Dyspepsi-Cola fatigues", "Cloaca-Cola helmet", "Cloaca-Cola knapsack", "Dyspepsi-Cola knapsack", "Cloaca-Cola", "Dyspepsi grenade", "Cloaca grenade", "Dyspepsi-Cola d-rations", "Cloaca-Cola c-rations", "Cloaca-Cola-issue combat knife", "Dyspepsi-Cola-issue canteen", "picture of a dead guy's girlfriend", "zombie pineal gland", "Gummi-Gnauga", "Now and Earlier", "Sugar Cog", "loaded serum blowgun", "empty blowgun", "miniscule temporal rip", "1.21 jigawatts", "giant pinky ring", "redrum", "ninja pirate zombie robot", "pile of shiny pebbles", "bowl of oriole's nest soup", "bunny liver", "Mt. Noob Pale Ale", "pirate zombie head", "ninja pirate zombie robot head", "pirate zombie robot head", "disembodied smile", "golden sausage", "clockwork pirate skull", "rhesus monkey", "tofurkey leg", "tofurkey gravy", "herbal stuffing", "can-shaped gelatinous cranberry sauce", "candied yams", "rhinestone cowboy shirt", "gingham blouse", "souvenir ski t-shirt", "sweet nutcracker", "metal mandible", "tiny plastic Crimbo wreath", "tiny plastic Uncle Crimbo", "tiny plastic Crimbo elf", "tiny plastic sweet nutcracker", "tiny plastic Crimbo reindeer", "aspirin", "fancy chocolate", "length of string", "googly eye", "stuffing", "felt", "wooden block", "toy wheel", "yo-yo", "top", "ball", "kite", "pet rock", "stuffed doppelshifter", "teddy bear", "duck-on-a-string", "toy soldier", "doll house", "toy train", "marionette", "sock monkey", "rag doll", "can of fake snow", "colored-light &quot;necklace&quot;", "tree skirt", "wreath-shaped Crimbo cookie", "bell-shaped Crimbo cookie", "tree-shaped Crimbo cookie", "Unionize The Elves sign", "sleeping snowy owl", "Tome of Snowcone Summoning", "purple snowcone", "green snowcone", "orange snowcone", "red snowcone", "blue snowcone", "black snowcone", "Pretty Predator Clawicure Kit", "teddy bear sewing kit", "green traffic cone", "Scandalously Skimpy Bikini", "Sombrero De Vida", "iceberglet", "ice sickle", "ice baby", "ice pick", "ice skates", "grue egg omelette", "roll of drink tickets", "pregnant gloomy black mushroom", "pregnant oily golden mushroom", "oily golden mushroom", "fruit bowl", "fruit basket", "hot pink lipstick", "hot stuffing", "useless powder", "twinkly powder", "hot powder", "cold powder", "spooky powder", "stench powder", "sleaze powder", "twinkly nuggets", "hot nuggets", "cold nuggets", "spooky nuggets", "stench nuggets", "sleaze nuggets", "twinkly wad", "hot wad", "cold wad", "spooky wad", "stench wad", "sleaze wad", "double daisy", "miniature stuffed Goth Giant", "Valentine's Day cake", "arrow'd heart balloon", "black velvet box", "squashed frog", "eye of newt", "salamander spleen", "sleazy fairy gravy", "suede shortsword", "bamboo bokuto", "25-meat staff", "two-handed depthsword", "bill bec-de-bardiche glaive-guisarme", "lead yo-yo", "slightly peevedbow", "sack of doorknobs", "lucky ball-and-chain", "automatic catapult", "pentacorn hat", "goofily-plumed helmet", "yellow plastic hard hat", "wooden salad bowl", "football helmet", "chain-mail monokini", "union scalemail pants", "paper-plate-mail pants", "troutpiece", "alpha-mail pants", "lucky rabbit's foot", "massive bag of catnip", "hang glider", "March hat", "miniature dormouse", "chopsticks", "rice bowl", "ninja mop", "ridiculously overelaborate ninja weapon", "sugar-coated pine cone", "blue traffic cone", "gloomy mushroom wine", "oily mushroom wine", "McPhee's Grimoire of Hilarious Object Summoning", "whoopie cushion", "fake fake vomit", "explosion-flavored chewing gum", "clown hammer", "rubber emo roe", "yellow snowcone", "magical ice cube with a fly in it", "calle de miel with a fly in it", "rockin' wagon with a fly in it", "perpendicular hula with a fly in it", "slap and tickle with a fly in it", "bag of airline peanuts", "fake hand", "Knob Goblin pet-buffing spray", "Knob Goblin learning pill", "Knob Goblin eyedrops", "Knob Goblin nasal spray", "KWE-brand transistor radio", "vampire heart", "Talisman of Bakula", "Radio KoL Coffee Mug", "Frank Gorshin trophy", "Radio Free Jersey", "bottle of used blood", "wind-up chattering teeth", "joybuzzer", "pet rock &quot;Snooty&quot; disguise", "diamond-studded fronts", "portable corkscrew", "St. Sneaky Pete's Day goodies basket", "fake plastic grass", "grass skirt", "grass hat", "grass blade", "raffle prize box", "homeless hobo spirit", "weegee sqouija", "sparkly engagement ring", "lucky Tam O'Shatner", "Grimacite goggles", "Grimacite glaive", "Grimacite greaves", "Grimacite garter", "Grimacite galoshes", "Grimacite gorget", "Grimacite guayabera", "Codex of Capsaicin Conjuration", "Gazpacho's Glacial Grimoire", "MSG", "second-hand knockoff engagement ring", "bottle of Domesticated Turkey", "bottle of Definit", "bottle of Calcutta Emerald", "bottle of Lieutenant Freeman", "bottle of Jorge Sinsonte", "boxed champagne", "kumquat", "tangerine", "tonic water", "cocktail onion", "raspberry", "kiwi", "whiskey bittersweet", "mimosette", "tequila sunset", "zmobie", "gin and tonic", "vodka and tonic", "vodka gibson", "gibson", "parisian cathouse", "rabbit punch", "caipifruta", "teqiwila", "Divine", "Gordon Bennett", "tangarita", "mandarina colada", "gimlet", "yellow brick road", "vodka stratocaster", "Neuromancer", "prussian cathouse", "Mae West", "Mon Tiki", "teqiwila slammer", "Knob lo mein", "asparagus lo mein", "Knoll lo mein", "spooky lo mein", "olive lo mein", "hot hi mein", "cold hi mein", "spooky hi mein", "stinky hi mein", "sleazy hi mein", "Junior LAAAAME merit badge", "Senior LAAAAME merit badge", "jazz soap", "tangarita with a fly in it", "mandarina colada with a fly in it", "prussian cathouse with a fly in it", "Mae West with a fly in it", "astronaut ice-cream", "delectable catalyst", "ultimate wad", "libation of liveliness", "eyedrops of the ermine", "perfume of prejudice", "eyedrops of the ocelot", "potent potion of potency", "concentrated cordial of concentration", "coffin lid", "white satin shield", "Cerebral Cloche", "Cerebral Culottes", "Cerebral Crossbow", "ice stein", "munchies pill", "homeopathic healing powder", "astral badger", "astral mushroom", "badger badge", "blue-frosted astral cupcake", "green-frosted astral cupcake", "orange-frosted astral cupcake", "purple-frosted astral cupcake", "pink-frosted astral cupcake", "raspberry beret", "pixel shield", "beer cartilage", "Spanish fly trap", "Spanish fly", "around the world", "scrumdiddlyumptious solution", "Toddler-sized Dragon Costume", "lotion of hotness", "lotion of coldness", "lotion of spookiness", "lotion of stench", "lotion of sleaziness", "Grimacite Bock", "wedge of gray cheese", "hot and sour sauce", "cold and sour sauce", "spooky and sour sauce", "stench and sour sauce", "sleazy and sour sauce", "brick", "milk of magnesium", "foie gras", "candy brain", "jewel-eyed wizard hat", "wad of Crovacite", "white collar", "White Citadel Satisfaction Satchel", "onion shurikens", "Cherry Cloaca Cola", "Diet Cloaca Cola", "Regular Cloaca Cola", "Radio KoL Keychain", "Radio KoL Antenna Ball", "Radio KoL Flashlight", "Radio KoL Maracas", "Radio KoL Bottle Opener", "Radio KoL Patch", "Cat-Herding Prod", "star boomerang", "star stiletto", "fraudwort", "shysterweed", "swindleblossom", "grave robbing shovel", "superhero mask", "cardboard ore", "styrofoam ore", "bubblewrap ore", "pet rock &quot;Groucho&quot; disguise", "cardboard sword", "cardboard staff", "bubblewrap sword", "bubblewrap staff", "bubblewrap crossbow", "styrofoam sword", "styrofoam staff", "styrofoam crossbow", "Platinum Yendorian Express Card", "cardboard crossbow", "blue ribbon", "giant discarded bottlecap", "giant discarded torn-up glove", "salamander slurry", "eyedrops of newt", "Frogade", "papotion of papower", "royal jelly taco", "tofu taco", "jumping bean taco", "catgut taco", "goat cheese taco", "pr0n taco", "alphabet gum", "Comma Chameleon egg", "shingle", "flaregun", "flaming cardboard sword", "flypaper staff", "grease gun", "sword of static", "wiffle-flail", "bubble bauble bow", "Frost&trade; brand sword", "squeaky staff", "can cannon", "starchy sword", "starchy staff", "starchy crossbow", "pestoblade", "poutine pole", "curdflinger", "muculent machete", "glistening staff", "repeating crossbow", "bigger stick", "sinewy crossbow string", "sturdy sword hilt", "dense meat sword", "dense meat staff", "dense meat crossbow", "Spirit Precipice", "smoldering staff", "hot cross bow", "sword behind inappropriate prepositions", "meatspout staff", "carob cannon", "shuddersword", "hairy staff", "projectile icemaker", "buffalo blade", "giant cheesestick", "potato pistol", "savory sword", "savory staff", "savory crossbow", "Super Magic Power Sword X", "soylent staff", "goulauncher", "defective skull", "Gnollish pie server", "Gnollish slotted spoon", "Knob Goblin spatula", "jack flapper", "filthy pestle", "Knob Goblin melon baller", "huge spoon", "oversized pizza cutter", "star spatula", "foon of fulmination", "foon of frigidity", "foon of foulness", "foon of fearfulness", "foon of fleshiness", "[1764]Spookyraven library key", "Spookyraven gallery key", "Spookyraven ballroom key", "pack of chewing gum", "Gnomish toolbox", "fricasseed brains", "brains casserole", "shiny butcherknife", "corn holder", "eggbeater", "bottle of popskull", "dishrag", "stale baguette", "leftovers of indeterminate origin", "ancient frozen dinner", "cardboard katana", "ram stick", "enchantlers", "ram-battering staff", "crazy little Turkish delight", "Snow Queen Crown", "ga-ga radio", "six pack of Mountain Stream", "bag of Cheat-Os", "unrefined Mountain Stream syrup", "frozen Mob Penguin", "Ram's Face Lager", "ram horns", "Travoltan trousers", "pool cue", "handful of hand chalk", "Counterclockwise Watch", "bone collar", "misshapen animal skeleton", "pile of dusty animal bones", "dusty animal skull", "dusty animal cranium", "dusty animal jawbone", "dusty first cervical vertebra", "dusty second cervical vertebra", "dusty third cervical vertebra", "dusty fourth cervical vertebra", "dusty fifth cervical vertebra", "dusty sixth cervical vertebra", "dusty seventh cervical vertebra", "dusty first thoracic vertebra", "dusty second thoracic vertebra", "dusty third thoracic vertebra", "dusty fourth thoracic vertebra", "dusty fifth thoracic vertebra", "dusty sixth thoracic vertebra", "dusty seventh thoracic vertebra", "dusty eighth thoracic vertebra", "dusty ninth thoracic vertebra", "dusty tenth thoracic vertebra", "dusty eleventh thoracic vertebra", "dusty twelfth thoracic vertebra", "dusty first lumbar vertebra", "dusty second lumbar vertebra", "dusty third lumbar vertebra", "dusty fourth lumbar vertebra", "dusty fifth lumbar vertebra", "dusty sixth lumbar vertebra", "dusty seventh lumbar vertebra", "dusty sacral vertebrae", "dusty first caudal vertebra", "dusty second caudal vertebra", "dusty third caudal vertebra", "dusty fourth caudal vertebra", "dusty fifth caudal vertebra", "dusty sixth caudal vertebra", "dusty seventh caudal vertebra", "dusty eighth caudal vertebra", "dusty ninth caudal vertebra", "dusty tenth caudal vertebra", "dusty left first rib", "dusty left second rib", "dusty left third rib", "dusty left fourth rib", "dusty left fifth rib", "dusty left sixth rib", "dusty left seventh rib", "dusty left eighth rib", "dusty left ninth rib", "dusty left tenth rib", "dusty left eleventh rib", "dusty left twelfth rib", "dusty right first rib", "dusty right second rib", "dusty right third rib", "dusty right fourth rib", "dusty right fifth rib", "dusty right sixth rib", "dusty right seventh rib", "dusty right eighth rib", "dusty right ninth rib", "dusty right tenth rib", "dusty right eleventh rib", "dusty right twelfth rib", "dusty animal pelvis", "dusty left scapula", "dusty right scapula", "dusty left clavicle", "dusty right clavicle", "dusty left humerus", "dusty right humerus", "dusty left radius", "dusty right radius", "dusty left ulna", "dusty right ulna", "dusty left femur", "dusty right femur", "dusty left tibia", "dusty right tibia", "dusty left fibula", "dusty right fibula", "dusty left kneecap", "dusty right kneecap", "dusty left first front claw", "dusty left second front claw", "dusty left third front claw", "dusty left fourth front claw", "dusty right first front claw", "dusty right second front claw", "dusty right third front claw", "dusty right fourth front claw", "dusty left thumb", "dusty right thumb", "dusty left first rear claw", "dusty left second rear claw", "dusty left third rear claw", "dusty left fourth rear claw", "dusty right first rear claw", "dusty right second rear claw", "dusty right third rear claw", "dusty right fourth rear claw", "1-ball", "2-ball", "3-ball", "4-ball", "5-ball", "6-ball", "7-ball", "8-ball", "clockwork sword", "clockwork staff", "clockwork crossbow", "clockwork handle", "clockwork rod", "clockwork shank", "Lord Spookyraven's spectacles", "old leather wallet", "old coin purse", "English to A. F. U. E. Dictionary", "bizarre illegible sheet music", "cardboard wakizashi", "gob of wet hair", "roll of toilet paper", "tattered wolf standard", "tattered snake standard", "KoL Con 3-D Glasses", "scary death orb", "tuning fork", "antique greaves", "antique helmet", "antique spear", "antique shield", "pitchfork", "broken sword", "snarling wolf shield", "lupine sword", "snake shield", "serpentine sword", "grouchy restless spirit", "9-ball", "chintzy seal pendant", "chintzy turtle brooch", "chintzy noodle ring", "chintzy saucepan earring", "chintzy disco ball pendant", "chintzy accordion pin", "worn tophat", "tap shoes", "Manetwich", "bottle of Vangoghbitussin", "bottle of Pinot Renoir", "desiccated apricot", "flute of flat champagne", "dehydrated caviar", "styrofoam peanuts", "snifter of thoroughly aged brandy", "disintegrating quill pen", "inkwell", "tattered scrap of paper", "scroll of ancient forbidden unspeakable evil", "can of Binarrrca", "Bit O' Ectoplasm", "dance card", "opera mask", "bottle of Monsieur Bubble", "Amulet of Yendor", "jitterbug larva", "bottle of perfume", "spoon!", "nervous tick egg", "plastic pumpkin bucket", "silver shrimp fork", "half of a memo", "stuffed cocoabo", "stuffed baby gravy fairy", "stuffed flaming gravy fairy", "stuffed frozen gravy fairy", "stuffed stinky gravy fairy", "stuffed spooky gravy fairy", "stuffed sleazy gravy fairy", "stuffed astral badger", "stuffed MagiMechTech MicroMechaMech", "stuffed hand turkey", "stuffed snowy owl", "stuffed scary death orb", "stuffed mind flayer", "stuffed undead elbow macaroni", "stuffed angry cow", "stuffed Cheshire bitten", "stuffed yo-yo", "rubber WWJD? bracelet", "rubber WWBD? bracelet", "rubber WWSPD? bracelet", "rubber WWtNSD? bracelet", "heart necklace", "right half of a heart necklace", "left half of a heart necklace", "pack of KWE trading card", "stick of &quot;gum&quot;", "Das &Uuml;berk&uuml;hlraum trading card", "Vaso De Agua trading card", "The Grand Poo-Bah trading card", "Thorny Toad trading card", "Chori Zo trading card", "Morbidda trading card", "Poison Oak trading card", "Princess Rutabaga trading card", "Roo trading card", "Woldo trading card", "The Snake trading card", "Nayztameetjoo trading card", "Arrrmetia trading card", "Serenity trading card", "Inndya trading card", "Kitty the Zmobie Basher trading card", "diamond necklace", "spade necklace", "club necklace", "cream pie", "cherry pie", "strawberry pie", "lemon meringue pie", "Genalen&trade; Bottle", "mixed wildflower greens", "handful of walnuts", "nutty organic salad", "super salad", "tofu wonton", "hippy protest button", "Lockenstock&trade; sandals", "didgeridooka", "bullet-proof corduroys", "round purple sunglasses", "wicker shield", "Marquis de Poivre soda", "radium-flavored potato chips", "wintergreen-flavored potato chips", "ennui-flavored potato chips", "x-ray specs", "patchouli oil bomb", "ferret bait", "exploding hacky-sack", "hemp net", "your father's MacGuffin diary", "brain-meltingly-hot chicken wings", "frat brats", "knob ka-bobs", "can of Swiller", "broken wings", "sunken eyes", "reassembled blackbird", "tiny bust of Pallas", "black market map", "black snake skin", "adder bladder", "black pension check", "black picnic basket", "Black No. 2", "black sword", "black helmet", "black shield", "blackberry", "forged identification documents", "PADL Phone", "kick-ass kicks", "sake bomb", "tequila grenade", "beer helmet", "distressed denim pants", "perforated battle paddle", "flashing novelty button", "orange glowstick", "anniversary chutney sculpture", "spandex anniversary shorts", "jar of anniversary jam", "bucket of anniversary lard", "anniversary concrete fedora", "makeshift turban", "makeshift cape", "makeshift skirt", "toothbrush", "makeshift crane", "can of starch", "bottle of ultravitamins", "antique bottle of cough syrup", "tube of hair oil", "Daffy Taffy", "Crimboween memo", "pilgrim shield", "fancy bath salts", "antique hand mirror", "hors d'oeuvre tray", "ballroom blintz", "towel", "guy made of bee pollen", "17-ball", "filthy lucre", "hobo gristle", "shredded can label", "bloodstained briquette", "greasy dreadlock", "vial of pirate sweat", "empty aftershave bottle", "coal button", "burned-out arcanodiode", "non-Euclidean hoof", "[2108]rock", "stringy sinew", "stick", "tooth", "big leaf", "wheel", "yo", "prehistoric spear", "stick-on-a-string", "fire", "leaf tube", "lit cigar", "Grateful Undead T-shirt", "ASCII shirt", "safety vest", "eXtreme Bi-Polar Fleece Vest", "Ye Olde Navy Fleece", "bronze breastplate", "white hat hacker T-shirt", "vampire collar", "possessed top", "killer rag doll", "tree-eating kite", "incredibly creepy marionette", "fancy dress ball", "mad scientist's sock monkey", "stuffed alien blob", "vampire duck-on-a-string", "toy crazy train", "razor-tipped yo-yo", "toy mercenary", "spooky length of string", "spooky toy wheel", "spooky wooden block", "spooky felt", "evil googly eye", "spooky stuffing", "evil teddy bear", "evil teddy bear sewing kit", "toothsome rock", "spooky frank", "plate of franks and beans", "shot of blackberry schnapps", "capacitor relay", "carbon nanotube frame", "ion grid", "Feynman gate", "logic synthesizer", "high-resistance ultrapolymer plating", "servomechanical torsion facilitator", "quantum polarity inducer", "bi-lateral logic compressor", "computronic processing unit", "reverse-oscillating klystron", "sub-molecular interocitor", "recursive spline reticulator", "atomic vector plotter", "ion-pulse modulation stabilizer", "hyperbolic plasma focuser", "toy ray gun", "toy space helmet", "MagiMechTech NanoMechaMech", "astronaut pants", "toy jet pack", "triangular stone", "mossy stone sphere", "smooth stone sphere", "cracked stone sphere", "rough stone sphere", "obsidian dagger", "archaeologist's notebook", "[2180]ancient amulet", "chocolate lump", "Harold's hammer head", "Harold's hammer handle", "Harold's hammer", "Kiss the Knob apron", "unlit birthday cake", "lit birthday cake", "flask of peppermint oil", "flask of peppermint schnapps", "yuletide troll chrysalis", "giant book of ancient carols", "disintegrating sheet music", "candy stake", "spooky eggnog", "ancient unspeakable fruitcake", "gingerbread horror", "fancy but probably evil chocolate", "bat-shaped Crimboween cookie", "skull-shaped Crimboween cookie", "tombstone-shaped Crimboween cookie", "tiny plastic gift-wrapping vampire", "tiny plastic ancient yuletide troll", "tiny plastic skeletal reindeer", "tiny plastic Crimboween pentagram", "tiny plastic Scream Queen", "time sleigh", "lucky Crimbo tiki necklace", "bobble-hip hula elf doll", "Crimbo ukulele", "Tiki lighter", "deck of tropical cards", "tropical paperweight", "tropical Crimbo pressie", "tropical wrapping paper", "Tropical Crimbo Hat", "Tropical Crimbo Shorts", "super ka-bob", "beer basted brat", "Tropical Crimbo Sword", "orange and black Crimboween candy", "Great Ball of Frozen Fire", "liar's pants", "flaming juggler's balls", "flaming pink shirt", "flaming familiar doppelg&auml;nger", "evil flaming eyeball pendant", "arse-a'fire elixir", "cosmic lemonade", "powdered toad horn", "icicle katana", "frigid mote", "smudged alchemical recipe", "polka-dot bow tie", "calavera concertina", "ratarang", "turtle pheromones", "pygmy blowgun", "pygmy nose-bone", "big bad voodoo mask", "bottle of alcohol", "pygmy spear", "pygmy pygment", "headhunter necktie", "pointed stick", "knobby helmet turtle", "knobby kneepads", "sewer turtle", "sebaceous shield", "skeletortoise", "box turtle", "cardboard box turtle", "bottlecap turtle", "bubblewrap bottlecap turtleban", "furry green turtle", "furry green earmuffs", "reinforced furry underpants", "[2258]&quot;I Love Me, Vol. I&quot;", "photograph of God", "hard rock candy", "hard-boiled ostrich egg", "bird rib", "lion oil", "stunt nuts", "wet stew", "wet stunt nut stew", "Mega Gem", "[2268]Staff of Fats", "sausage wonton", "black belt", "dusty bottle of Merlot", "dusty bottle of Port", "dusty bottle of Pinot Noir", "dusty bottle of Zinfandel", "dusty bottle of Marsala", "dusty bottle of Muscat", "Fernswarthy's key", "Fernswarthy's letter", "dusty old book", "Manual of Labor", "Manual of Transmission", "Manual of Dexterity", "seal-skull helmet", "petrified noodles", "chisel", "[2286]Eye of Ed", "green glowstick", "encoder ring", "red paperclip", "really big tiny house", "Non-Essential Amulet", "white wine vinaigrette", "cup of strong herbal tea", "Curiously Shiny Ancient Evil-Bashing Axe", "marinated stakes", "knob butter", "vial of ectoplasm", "boock of darck magicks", "EZ-Play Harmonica Book", "fingerless hobo gloves", "Chomsky's comic books", "worm-riding hooks", "Libram of Candy Heart Summoning", "white candy heart", "pink candy heart", "orange candy heart", "lavender candy heart", "yellow candy heart", "green candy heart", "white candygram", "pink candygram", "orange candygram", "lavender candygram", "yellow candygram", "green candygram", "broken carburetor", "ancient bronze token", "ancient bomb", "carved wooden wheel", "worm-riding manual page", "worm-riding manual page 2", "worm-riding manual pages 3-15", "headpiece of the Staff of Ed", "Staff of Ed, almost", "[2325]Staff of Ed", "stone rose", "can of black paint", "drum machine", "handful of confetti", "chocolate-covered diamond-studded roses", "bouquet of circular saw blades", "Better Than Cuddling Cake", "stuffed ninja snowman", "[2334]Holy MacGuffin", "rubber WWBBDD? bracelet", "oversized pipe", "reinforced beaded headband", "black pudding", "Blackfly Chardonnay", "black & tan", "black pepper", "black forest cake", "black forest ham", "filthworm hatchling scent gland", "filthworm drone scent gland", "filthworm royal guard scent gland", "heart of the filthworm queen", "water pipe bomb", "gas balloon", "beer bomb", "superamplified boom box", "fire poi", "bejeweled pledge pin", "communications windchimes", "henna face paint", "tube of dread wax", "Gaia beads", "pink clay bead", "purple clay bead", "green clay bead", "hippy medical kit", "Slow Talkin' Elliot's dogtags", "longhaired hippy wig", "Zim Merman's guitar", "C.A.R.N.I.V.O.R.E. button", "orange peel hat", "carbonated soy milk", "flowing hippy skirt", "filthy poultice", "natural fennel soda", "green smoke bomb", "bunch of bananas", "banana", "banana peel", "banana cream pie", "banana daiquiri", "bungle in the jungle", "banana spritzer", "banana smoothie", "dandy lion cub", "woolen cravat", "red class ring", "blue class ring", "white class ring", "bottle opener belt buckle", "keg shield", "giant foam finger", "war tongs", "Monstar energy beverage", "asbestos apron", "beaten-up Chucks", "natty blue ascot", "wreath of laurels", "Danglin' Chad's loincloth", "tube sock", "chloroform rag", "depantsing bomb", "energy drink IV", "Elmley shades", "molotov cocktail cocktail", "beer bong", "gauze garter", "barrel of gunpowder", "jam band flyers", "rock band flyers", "Panda outfit", "pink bat eye", "worthless piece of yellow glass", "billy idol", "oily rag", "broken petri dish", "sammich crust", "triffid bark", "white lint", "discarded pacifier", "bounty-hunting helmet", "bounty-hunting rifle", "bounty-hunting pants", "bottle of rhinoceros hormones", "teeny-tiny magic scroll", "bottle of pirate juice", "irradiated pet snacks", "Mick's IcyVapoHotness Inhaler", "cyclops eyedrops", "can of spinach", "[2426]fire flower", "freezerburned ice cube", "fake blood", "Eau de Guaneau", "bag of lard", "bottle of Mystic Shell", "SPF 451 lip balm", "bottle of antifreeze", "black eyedrops", "Dogsgotnonoz pills", "donkey flipbook", "New Cloaca-Cola", "scented massage oil", "poltergeist-in-the-jar-o", "unnatural gas", "Knob Goblin Encryption Key", "Cobb's Knob map", "pink glowstick", "Supernova Champagne", "Deactivated O. A. F.", "hardware upgrade", "bad penguin egg", "tasteful black bow tie", "six-pack of New Cloaca-Cola", "empty Cloaca-Cola bottle", "goatskin umbrella", "wool hat", "Goodfella contract", "white belt", "bar whip", "barskin buckler", "white whip", "barskin loincloth", "tighty whiteys", "yak toupee", "odor extractor", "Manual of Transcendent Olfaction", "bowl of Bounty-Os", "Oreille Divis&eacute;e brandy", "pompadour'd puppy", "blue suede shoes", "callused fingerbone", "bundle of receipts", "disintegrating cork", "sticky stardust", "wilted lettuce", "empty greasepaint tube", "clown skin", "clown wig", "clownskin belt", "clownskin buckler", "clown whip", "demon skin", "demon-horned hat", "demon buckler", "demon whip", "barskin cloak", "white snakeskin duster", "clownskin harness", "demonskin jacket", "hipposkin poncho", "yak anorak", "tuxedo shirt", "gnauga hide vest", "shirt kit", "tropical orchid", "stick of dynamite", "Necrotelicomnicon", "Cookbook of the Damned", "Sinful Desires", "molybdenum magnet", "molybdenum hammer", "molybdenum screwdriver", "molybdenum pliers", "molybdenum crescent wrench", "Really Expensive Jewelry and You", "extra-fancy ring setting", "precious piercing post", "heavy necklace chain", "beach glass bead", "clay peace-sign bead", "beach glass necklace", "peace-sign necklace", "round green sunglasses", "Frat Army FGF", "Hippy Army MPE", "spark plug earring", "woven baling wire bracelets", "gearbox necklace", "wrench bracelet", "rusty chain necklace", "sawblade shield", "McMillicancuddy's Special Lager", "melted Jell-o shot", "cruelty-free wine", "thistle wine", "megatofu", "displaced fish", "fishy fish", "fishy fish casserole", "fishy fish lasagna", "filet of tangy gnat (&quot;fotelif&quot;)", "gnatloaf", "gnatloaf casserole", "gnat lasagna", "long pork", "long pork chop sandwiches", "long pork casserole", "long pork lasagna", "canopic jar", "ancient spice", "powdered organs", "Ankh of Badahnkadh", "tomb ratchet", "Mayflower bouquet", "lesser grodulated violet", "tin magnolia", "begpwnia", "upsy daisy", "half-orchid", "tin star", "outrageous sombrero", "&quot;Humorous&quot; T-shirt", "Peppercorns of Power", "vial of mojo", "golden reeds", "turtle chain", "distilled seal blood", "high-octane olive oil", "Shagadelic Disco Banjo", "Squeezebox of the Ages", "Chelonian Morningstar", "Hammer of Smiting", "17-alarm Saucepan", "Greek Pasta Spoon of Peril", "half-rotten brain", "rusty bonesaw", "plus-sized phylactery", "can of Ghuol-B-Gone&trade;", "Azazel's unicorn", "Azazel's lollipop", "Azazel's tutu", "ant agonist", "ant hoe", "ant rake", "ant pitchfork", "ant sickle", "ant pick", "bronzed locust", "honey-dipped locust", "giant cactus quill", "Staff of the Short Order Cook", "cactus fruit", "scorpion whip", "handful of sand", "brick of sand", "centipede eggs", "wonderwall shield", "Colonel Mustard's Lonely Spades Club Jacket", "General Sage's Lonely Diamonds Club Jacket", "Corporal Fennel's Lonely Clubs Club Jacket", "Private Pepper's Lonely Hearts Club Jacket", "hot date", "distilled fortified wine", "tasty tart", "Knob Goblin lunchbox", "Knob pasty", "thermos full of Knob coffee", "Ben-Gal&trade; Balm", "leathery cat skin", "leathery bat skin", "leathery rat skin", "Discount Telescope Warehouse gift certificate", "carbonated water lily", "Staff of the Midnight Snack", "Staff of Blood and Pudding", "smoldering box", "Tuesday's ruby", "palm frond", "palm-frond fan", "palm-frond whip", "palm-frond net", "palm-frond capris", "extra-large palm-frond toupee", "palm-frond cloak", "ancient vinyl coin purse", "rocky raccoon", "mojo filter", "savoy truffle", "ancient Magi-Wipes", "big boom", "Iiti Kitty phone charm", "jar of swamp gas", "unidentified jerky", "nasty rat mask", "ratskin belt", "rattail whip", "bat hat", "bat whip", "bat-ass leather jacket", "catskin cap", "catskin buckler", "tail o' nine cats", "Hugo's Weaving Manual", "gremlin juice", "mother's little helper", "pat-a-cake pendant", "mummy wrapping", "really thick bandage", "mummy mask", "gauze shorts", "gauze hammock", "black cherry soda", "black greaves", "black cowboy hat", "Maxwell's Silver Hammer", "happiness", "flaming feather", "frozen feather", "frightful feather", "fetid feather", "flirtatious feather", "Lord Spookyraven's ear trumpet", "bottled green pixie", "green pixie spog", "S.T.L.T.", "honey-dew", "white Xanadian", "tiny bottle of absinthe", "Drowsy Sword", "escargotsicle", "bottle of realpagne", "albatross necklace", "not-a-pipe", "flask of Amontillado", "fancy ball mask", "Can-Can skirt", "sensitive poetry journal", "bottled inspiration", "bellhop bell", "disintegrating spiky collar", "can-can-in-a-can", "patent antipsychotics", "Mariner's Friend cough drops", "shot of nepenthe schnapps", "library card", "Bohemian rhapsody", "bottle of black cat tonic", "handful of moss", "bit-o-cactus", "ancient protein powder", "spectre scepter", "sparkler", "snake", "M-242", "detuned radio", "Warehouse 23 crate", "armgun", "fancy seashell necklace", "commemorative war stein", "stone frisbee", "dreadlock whip", "beer-a-pult", "cast-iron legacy paddle", "handful of nuts and berries", "giant driftwood sculpture", "massive sitar", "stone baseball cap", "cup of primitive beer", "ovoid leather thing", "duct tape", "duct tape wallet", "duct tape shirt", "duct tape fedora", "duct tape sword", "duct tape dockers", "duct tape buckler", "shrinking powder", "blackberry slippers", "blackberry moccasins", "blackberry combat boots", "funky dried mushroom", "exotic parrot egg", "cracker", "black facepaint", "black sheepskin diploma", "Black Body&trade; spray", "floorboard cruft", "sausage bomb", "battered hubcap", "shiny hood ornament", "spare kidney", "hand-carved bokken", "hand-carved bow", "hand-carved staff", "Staff of the Greasefire", "Staff of the Grand Flamb&eacute;", "bowl of rye sprouts", "cob of corn", "juniper berries", "plum", "pear", "peach", "plum wine", "shot of pear schnapps", "shot of peach schnapps", "bunch of square grapes", "brown sugar cane", "sandwich of the gods", "Pan-Dimensional Gargle Blaster", "enchanted leopard-print barbell", "pile of smoking rags", "panty raider camouflage", "Staff of the Walk-In Freezer", "boilermaker", "steel lasagna", "steel margarita", "steel-scented air freshener", "gremlin mutagen", "extra-potent gremlin mutagen", "chunk of depleted Grimacite", "furniture dolly", "Staff of the Grease Trap", "Uranium Omega of Temperance", "Lead Zeta of Chastity", "Aluminum Epsilon of Humility", "Zinc Delta of Tranquility", "Nickel Gamma of Frugality", "Iron Beta of Industry", "Copper Alpha of Sincerity", "Red Balloon of Valor", "Purple Horseshoe of Honor", "Blue Diamond of Honesty", "Green Clover of Justice", "Yellow Moon of Compassion", "Orange Star of Sacrifice", "Pink Heart of Spirit", "Order of the Silver Wossname", "Harold's bell", "solid gold bowling ball", "Crimbo pie", "pear tart", "peach pie", "chunk of rock salt", "handful of pine needles", "steamy ruby", "glacial sapphire", "unearthly onyx", "effluvious emerald", "tawdry amethyst", "filigreed hamethyst earring", "filigreed hamethyst necklace", "filigreed hamethyst ring", "solid baconstone earring", "solid baconstone necklace", "solid baconstone ring", "pulled porquoise earring", "pulled porquoise pendant", "pulled porquoise ring", "Earring of Fire", "Pendant of Fire", "Ring of Fire", "Ice-Cold Beerring", "Ice-Cold Aluminum Necklace", "Ice-Cold Beer Ring", "Unspeakable Earring", "Choker of the Ultragoth", "The Ring", "Nose Ring of Putrescence", "Putrid Pendant", "Ring of the Sewer Snake", "Mudflap-Girl Earring", "Mudflap-Girl Necklace", "Mudflap-Girl Ring", "vial of Gnomochloric acid", "flask of Gnomochloric acid", "jug of Gnomochloric acid", "vial of hamethyst juice", "vial of baconstone juice", "vial of porquoise juice", "flask of hamethyst juice", "flask of baconstone juice", "flask of porquoise juice", "jug of hamethyst juice", "jug of baconstone juice", "jug of porquoise juice", "Brimstone Beret", "Brimstone Bludgeon", "Brimstone Bunker", "Brimstone Boxers", "Brimstone Brooch", "Brimstone Bracelet", "Grimacite gasmask", "Grimacite gat", "Grimacite gaiters", "Grimacite gauntlets", "Grimacite go-go boots", "Grimacite girdle", "Grimacite gown", "Staff of the Kitchen Floor", "anniversary gift box", "loaded dice", "really dense meat stack", "digital key lime", "star key lime", "digital key lime pie", "star key lime pie", "bottle-rocket crossbow", "indie comic hipster glasses", "wizard action figure", "mint-condition magic wand", "yellow glowstick", "Periodical Paintbrush", "bottle of cooking sherry", "antique packet of ketchup", "accidental cider", "dire fudgesicle", "navel ring of navel gazing", "class five ecto-larva", "plastic bib", "Dallas Dynasty Falcon Crest shield", "Gnomitronic Hyperspatial Demodulizer", "shrunken navigator head", "moonberry wine cooler", "fine aged cheddarwurst", "branch from the Great Tree", "Phil Bunion's axe", "bouquet of swamp roses", "huge mosquito proboscis", "swamp lolly", "seegar butt", "bottled swamp gas", "witch wart", "delicious swamp muck", "leechknife", "decomposed boot", "big dribbly candle", "stolen meatpouch", "beaver spear", "shamanic beads", "dilapidated wizard hat", "pirate pamphlet", "pirate brochure", "pirate tract", "burnt flower", "tiny plastic Naughty Sorceress", "tiny plastic Ed the Undying", "tiny plastic Lord Spookyraven", "tiny plastic Dr. Awkward", "tiny plastic protector spectre", "tiny plastic Baron von Ratsworth", "tiny plastic Boss Bat", "tiny plastic Knob Goblin King", "tiny plastic Bonerdagon", "tiny plastic The Man", "tiny plastic The Big Wisniewski", "tiny plastic Felonia", "tiny plastic Beelzebozo", "tiny plastic conservationist hippy", "tiny plastic 7-foot dwarf", "tiny plastic angry bugbear", "tiny plastic anime smiley", "tiny plastic apathetic lizardman", "tiny plastic astronomer", "tiny plastic beanbat", "tiny plastic blooper", "tiny plastic brainsweeper", "tiny plastic briefcase bat", "tiny plastic demoninja", "tiny plastic filthy hippy jewelry maker", "tiny plastic drunk goat", "tiny plastic fiendish can of asparagus", "tiny plastic Gnollish crossdresser", "tiny plastic handsome mariachi", "tiny plastic Knob Goblin bean counter", "tiny plastic Knob Goblin harem girl", "tiny plastic Knob Goblin mad scientist", "tiny plastic Knott Yeti", "tiny plastic lemon-in-the-box", "tiny plastic lobsterfrogman", "tiny plastic ninja snowman", "tiny plastic Orcish Frat Boy", "tiny plastic G Imp", "tiny plastic goth giant", "tiny plastic cubist bull", "tiny plastic scary clown", "tiny plastic smarmy pirate", "tiny plastic spiny skelelton", "tiny plastic Spam Witch", "tiny plastic spooky vampire", "tiny plastic taco cat", "tiny plastic undead elbow macaroni", "tiny plastic warwelf", "tiny plastic whitesnake", "tiny plastic XXX pr0n", "tiny plastic zmobie", "tiny plastic Protagonist", "tiny plastic Spunky Princess", "tiny plastic topiary golem", "tiny plastic senile lihc", "tiny plastic Iiti Kitty", "tiny plastic Gnomester Blomester", "tiny plastic Trouser Snake", "tiny plastic Axe Wound", "tiny plastic Hellion", "tiny plastic Black Knight", "tiny plastic giant pair of tweezers", "tiny plastic fruit golem", "tiny plastic fluffy bunny", "miniature castagnets", "siesta-ing Casagnova gnome", "miniature Jacob's ladder", "unemployed hunchbacked minion", "Spooky Surprise Egg", "Steal This Candy", "chocolate filthy lucre", "Angry Farmer's Wife Candy", "the Jickinator", "party hat", "V for Vivala mask", "The Big Book of Pirate Insults", "shot of rotgut", "jar of &quot;Creole Lady&quot; marrrmalade", "Cap'm Caronch's Map", "Orcish Frat House blueprints", "blue glowstick", "charrrm bracelet", "tip jar", "yam candy", "cocktail napkin", "rum barrel charrrm", "tube of cranberry Go-Goo", "rum barrel charrrm bracelet", "single-serving herbal stuffing", "packet of tofurkey gravy", "tofurkey nugget", "rigging shampoo", "ball polish", "mizzenmast mop", "Tom's of the Spanish Main Toothpaste", "Swabbie&trade; swab", "Oil of Parrrlay", "creamsicle", "cream stout", "curmudgel", "grumpy old man charrrm", "grumpy old man charrrm bracelet", "tarrrnish charrrm", "tarrrnished charrrm bracelet", "bilge wine", "witty rapier", "yohohoyo", "fish-liver oil", "booty chest charrrm", "booty chest charrrm bracelet", "cannonball charrrm", "cannonball charrrm bracelet", "copper ha'penny charrrm", "copper ha'penny charrrm bracelet", "silver tongue charrrm", "silver tongue charrrm bracelet", "bit of clingfilm", "clingfilm trousers", "clingfilm cap", "clingfilm slippers", "clingfilm tangle", "vinegar-soaked lemon slice", "true grit", "buoybottoms", "grungy flannel shirt", "grungy bandana", "grassy cutlass", "Cap'm Caronch's nasty booty", "Cap'm Caronch's dentures", "solid gold pegleg", "gold lam&eacute; pants", "enormous hoop earring", "costume sword", "rainbow pearl", "rainbow pearl earring", "rainbow pearl necklace", "rainbow pearl ring", "Idol of Ak'gyxoth", "Emblem of Ak'gyxoth", "sinister altar fragment", "shimmering rainbow sand", "simple ancient cursed key", "ornate ancient cursed key", "gilded ancient cursed key", "ancient cursed foot locker", "ornate ancient cursed chest", "gilded ancient cursed chest", "all-purpose cleaner", "handful of sawdust", "large stone triangle", "medium stone triangle", "small stone triangle", "strange stone pyramid", "corpse on the beach", "corpsetini", "corpsedriver", "Corpse Island iced tea", "red-headed corpse", "kamicorpse-ee", "purple corpsel", "corpsebite", "pirate fledges", "cursed piece of thirteen", "cursed black pearl onion", "cursed sea biscuit", "cursed bottle of rum", "cursed bottle of black-label rum", "cursed cannonball", "cursed voodoo skull", "cursed dirty joke scroll", "Crimbo P. R. E. S. S. I. E.", "metallic foil bow", "metallic foil radar dish", "nanite-infested gingerbread bugbear", "nanite-infested candy cane", "nanite-infested fruitcake", "nanite-infested eggnog", "El Vibrato power sphere", "cursed eyepatch", "cursed cutlass", "cursed breeches", "mood ring", "black candy heart", "cymbal syrup", "metallic foil cat ears", "nanofiber cloth", "iGoogly", "theoretical string", "synthetic stuffing", "toy hoverpad", "LED block", "gyroscope", "cyborg doll", "buckyball", "toy maglev monorail", "dollhive", "toy deathbot", "laser cannon", "plexifoam chin strap", "silicon-infused gluteal shield", "carbonite visor", "set of Unobtainium straps", "polymorphic fastening apparatus", "General Assembly Module", "laser targeting chip", "hi-density nylocite leg armor", "kevlateflocite helmet", "Bulky Buddy Box", "teddy borg", "marionette collective", "monomolecular yo-yo", "stuffed gray blob", "borg sock monkey", "roboduck-on-a-string", "mylar scout drone", "teddy borg sewing kit", "biomechanical crimborg helmet", "C.B.F.G.", "biomechanical crimborg leg armor", "vitachoconutriment capsule", "handmade hobby horse", "ball-in-a-cup", "set of jacks", "laser-broiled pear", "polyalloy shield", "oversized fish scaler", "killing feather", "golden ring", "robotronic egg", "rogue swarmer", "sawblade fragment", "unstable laser battery", "vibrating cyborg knife", "immense cyborg hand", "cyborg stompin' boot", "deactivated RoboGoose", "overclocked avian microprocessor", "Miniborg stomper", "Miniborg strangler", "Miniborg laser", "Miniborg beeper", "Miniborg hiveminder", "Miniborg Destroy-O-Bot", "old-fashioned Crimbo Pressie", "stuffed Hodgman", "Libram of Divine Favors", "divine noisemaker", "divine can of silly string", "divine blowout", "divine champagne popper", "divine cracker", "divine champagne flute", "fruitfilm", "piece of after eight", "hobo nickel", "sandcastle", "marshmallow", "roasted marshmallow", "strange shiny disc", "tin cup of mulligan stew", "flamin' bindle", "freezin' bindle", "stinkin' bindle", "spooky bindle", "sleazy bindle", "'WILL WORK FOR BOOZE' sign", "Hodgman's whackin' stick", "Hodgman's imaginary hamster", "old soft shoes", "panhandle panhandling hat", "cup of infinite pencils", "Hodgman's disgusting technicolor overcoat", "a torn paper strip", "El Vibrato translator", "El Vibrato punchcard (115 holes)", "El Vibrato punchcard (97 holes)", "El Vibrato punchcard (129 holes)", "El Vibrato punchcard (213 holes)", "El Vibrato punchcard (165 holes)", "El Vibrato punchcard (142 holes)", "El Vibrato punchcard (216 holes)", "El Vibrato punchcard (88 holes)", "El Vibrato punchcard (182 holes)", "El Vibrato punchcard (176 holes)", "El Vibrato punchcard (104 holes)", "El Vibrato drone", "sparking El Vibrato drone", "warm El Vibrato drone", "humming El Vibrato drone", "glowing El Vibrato drone", "El Vibrato helmet", "El Vibrato energy spear", "El Vibrato leg guards", "broken El Vibrato drone", "repaired El Vibrato drone", "augmented El Vibrato drone", "seal eyeball", "turtle soup", "evil noodles", "nauseating reagent", "evil paper umbrella", "evil vihuela", "evil boring spaghetti", "evil delicious noodles", "evil delicious spicy noodles", "evil painful penne pasta", "3vi1 pr0n m4nic0tti", "evil ravioli della hippy", "evil spicy noodles", "evil potion of potency", "evil libation of liveliness", "evil tomato juice of powerful power", "evil eyedrops of the ermine", "evil ointment of the occult", "evil serum of sarcasm", "evil philter of phorce", "an evil little sump'm sump'm", "evil ducha de oro", "evil horizontal tango", "evil roll in the hay", "naughty origami kit", "naughty fortune teller", "origami &quot;gentlemen's&quot; magazine", "naughty paper shuriken", "origami pasties", "origami riding crop", "El Vibrato trapezoid", "lump of coal", "lump of diamond", "thick padded envelope", "KoL Con IV Pole", "dwarvish magazine", "dwarvish war helmet", "dwarvish war mattock", "dwarvish war kilt", "dwarvish punchcard", "small laminated card", "little laminated card", "notbig laminated card", "unlarge laminated card", "dwarvish document", "dwarvish paper", "dwarvish parchment", "overcharged El Vibrato power sphere", "Fly-By-Knight Heraldry form", "El Vibrato Megadrone", "purple glowstick", "sane hatrack", "hobo code binder", "gator skin", "gatorskin umbrella", "sewer nuggets", "sewer wad", "bottle of sewage schnapps", "bottle of Ooze-O", "C.H.U.M. chum", "unfortunate dumplings", "decaying goldfish liver", "oil of oiliness", "tattered paper crown", "vanilla-frosted king cake", "inflatable duck", "water wings", "foam noodle", "Kissin' Cousins", "Tales from the Fireside", "Blizzards I Have Died In", "Maxing, Relaxing", "Biddy Cracker's Old-Fashioned Cookbook", "Travels with Jerry", "Let Me Be!", "Asleep in the Cemetery", "Summer Nights", "Sensual Massage for Creeps", "Ol' Scratch's ol' britches", "Ol' Scratch's stovepipe hat", "Ol' Scratch's ash can", "pink plastic baby", "silver sausage", "Frosty's old silk hat", "Frosty's carrot", "Frosty's nailbat", "Oscus's pelt", "Wand of Oscus", "Oscus's dumpster waders", "Zombo's skullcap", "Zombo's shield", "Zombo's grievous greaves", "Chester's moustache", "Chester's bag of candy", "Chester's cutoffs", "Sp'n-Zor's Grimoire of &quot;Tasteful&quot; Gifts", "black candygram", "bag of Crotchety Pine saplings", "bag of Saccharine Maple saplings", "bag of Laughing Willow saplings", "handful of Crotchety Pine needles", "lump of Saccharine Maple sap", "handful of Laughing Willow bark", "crotchety pants", "Saccharine Maple pendant", "willowy bonnet", "flavored foot massage oil", "foam dart", "black-and-blue light", "Loudmouth Larry Lamprey", "cheap studded belt", "personal massager", "personalized coffee mug", "blue plasma ball", "stick-on eyebrow piercing", "delicious salad", "C.H.U.M. lantern", "C.H.U.M. knife", "Frosty's snowball sack", "quasi-ethereal macaroni fragments", "shimmering tendrils", "scintillating powder", "abandoned candy", "secret tropical island volcano lair map", "adorable seal larva", "untamable turtle", "macaroni duck", "friendly cheez blob", "unusual disco ball", "stray chihuahua", "pretty pink bow", "smiley-face sticker", "farfalle bow tie", "jalape&ntilde;o slices", "stick-on mini solar panels", "tiny sombrero", "Argarggagarg's fang", "Safari Jack's moustache", "Yakisoba's hat", "Heimandatz's heart", "Jocko Homo's head", "The Mariachi's guitar case", "sealskin drum", "washboard shield", "spaghetti-box banjo", "marinara jug", "makeshift castanets", "left-handed melodica", "epic wad", "lucky bottlecap", "corncob pipe", "Mr. Joe's bangles", "frayed rope belt", "packet of mayfly bait", "mayfly bait necklace", "Ol' Scratch's salad fork", "Frosty's frosty mug", "jar of fermented pickle juice", "voodoo snuff", "extra-greasy slider", "crumpled felt fedora", "battered old top-hat", "shapeless wide-brimmed hat", "mostly rat-hide leggings", "hobo dungarees", "old patched suit-pants", "hobo stogie", "rope with some soap on it", "dead guy's piece of double-sided tape", "dead guy's memento", "frozen banquet", "sharpened hubcap", "very large caltrop", "The Six-Pack of Pain", "hobo monkey", "tiny bindle", "bed of coals", "frigid air mattress", "filth-encrusted futon", "comfy coffin", "stained mattress", "dinged-up triangle", "Ralph IX cognac", "llama lama cria", "zen motorcycle", "llama lama gong", "banana-frosted king cake", "brown plastic baby", "plump juicy grub", "delicious shimmering moth", "delectable fire ant", "scrumptious ice ant", "delicious stinkbug", "yummy death watch beetle", "tasty louse", "mole mol&eacute;", "Morlock's Mark Bourbon", "Climate Colada", "digital underground potion", "interesting-looking twig", "glimmering roc feather", "glimmering phoenix feather", "glimmering penguin feather", "glimmering buzzard feather", "glimmering raven feather", "glimmering great tit feather", "house of twigs and spit", "The Ballad of Richie Thingfinder", "Benetton's Medley of Diversity", "Elron's Explosive Etude", "Chorale of Companionship", "Prelude of Precision", "Ol' Scratch's infernal pitchfork", "Ol' Scratch's stove door", "Ol' Scratch's manacles", "Chester's sunglasses", "Chester's muscle shirt", "Chester's Aquarius medallion", "Zombo's shoulder blade", "Zombo's skull ring", "Zombo's empty eye", "Frosty's arm", "Staff of the Deepest Freeze", "Frosty's iceball", "Oscus's garbage can lid", "Oscus's neverending soda", "Oscus's flypaper pants", "Hodgman's porkpie hat", "Hodgman's lobsterskin pants", "Hodgman's bow tie", "Hodgman's blanket", "jar of squeeze", "bowl of fishysoisse", "deadly lampshade", "concentrated garbage juice", "lewd playing card", "deck of lewd playing cards", "Hodgman's lucky sock", "Hodgman's varcolac paw", "Hodgman's almanac", "Hodgman's harmonica", "Hodgman's garbage sticker", "Hodgman's metal detector", "Hodgman's cane", "Hodgman's journal #1: The Lean Times", "Hodgman's journal #2: Entrepreneurythmics", "Hodgman's journal #3: Pumping Tin", "Hodgman's journal #4: View From The Big Top", "hobo fortress blueprints", "little box of fireworks", "sterno-flavored Hob-O", "frostbite-flavored Hob-O", "fry-oil-flavored Hob-O", "garbage-juice-flavored Hob-O", "strawberry-flavored Hob-O", "roll of Hob-Os", "Everlasting Deckswabber", "bindle of joy", "cotton candy cocoon", "cotton candy cordial", "spice melange", "spooky rattling cigar box", "big stirring stick", "Staff of the Teapot Tempest", "Staff of the Black Kettle", "Staff of the Well-Tempered Cauldron", "Rainbow's Gravity", "prismatic wad", "club of the five seasons", "rainbow crossbow", "black kitten", "webbed comic mask", "Junior Adventurer's kit", "groovy prism necklace", "six-rainbow shield", "rainbow bomb", "cotton candy cone", "cotton candy pinch", "cotton candy smidgen", "cotton candy skoshe", "cotton candy plug", "cotton candy pillow", "cotton candy bale", "trusty torch", "Junior Adventurer's merit badge", "STYX deodorant body spray", "white-label gin", "tin rations", "haiku challenge map", "terrible poem", "bottle of sake", "little round pebble", "Bash-&#332;s cereal", "haiku katana", "bargain flash powder", "blue plastic baby", "blueberry-frosted king cake", "little bitty bathysphere", "damp old boot", "Seasonal Beret", "Bash-&#332;s boxtop", "cranberry cordial", "blackberry polite", "plum lozenge", "pear lozenge", "peach lozenge", "balloon shield", "black spot", "uniclops egg", "passed-out psychedelic bear", "psychedelic bubble wand", "eye 'n' horn shampoo", "glittery mascara", "dull fish scale", "rough fish scale", "pristine fish scale", "beefy fish meat", "glistening fish meat", "slick fish meat", "fish scimitar", "fish stick", "fish bazooka", "sea salt crystal", "bazookafish bubble gum", "bottle of Pete's Sake", "invisible bag", "witch hat", "beholed bedsheet", "fancy canap&eacute;s", "thermos of brew", "giant glass of brandy", "French slippers", "LWA ring", "LARP membership card", "Scratch 'n' Sniff Sticker Tome", "scratch 'n' sniff sword", "scratch 'n' sniff unicorn sticker", "scratch 'n' sniff apple sticker", "scratch 'n' sniff UPC sticker", "scratch 'n' sniff wrestler sticker", "scratch 'n' sniff dragon sticker", "scratch 'n' sniff rock band sticker", "ganger bandana", "eel skin", "eelskin hat", "eelskin pants", "eelskin shield", "shark tooth", "shark tooth necklace", "shark jumper", "shark cartilage", "eel battery", "temporary teardrop tattoo", "scratch 'n' sniff crossbow", "mutant rattlesnake egg", "mutant fire ant egg", "mutant cactus bud", "mutant gila monster egg", "rattlesnake enrager", "ant antidepressant", "cactus monocle", "Jawmaster 2000&trade;", "plans for depleted Grimacite hammer", "plans for depleted Grimacite gravy boat", "plans for depleted Grimacite weightlifting belt", "plans for depleted Grimacite grappling hook", "plans for depleted Grimacite ninja mask", "plans for depleted Grimacite shinguards", "plans for depleted Grimacite astrolabe", "depleted Grimacite hammer", "depleted Grimacite gravy boat", "depleted Grimacite weightlifting belt", "depleted Grimacite grappling hook", "depleted Grimacite ninja mask", "depleted Grimacite shinguards", "depleted Grimacite astrolabe", "KoL Con Cinco Pi&ntilde;ata Bat", "propeller beanie", "straw hat", "octopus's spade", "soggy seed packet", "glob of green slime", "sea carrot", "sea cucumber", "sea avocado", "sea lychee", "sea tangelo", "sea honeydew", "pressurized potion of puissance", "pressurized potion of perspicacity", "pressurized potion of pulchritude", "berry-infused sake", "citrus-infused sake", "melon-infused sake", "slab of sponge", "sponge helmet", "spongy shield", "square sponge pants", "flytrap pellet", "baby cuddlefish", "six-armed sweater", "slimy chest", "sand dollar", "flytrap bezoar", "bezoar ring", "candy cornucopia", "tiny ballet slippers", "wriggling flytrap pellet", "sushi-rolling mat", "white rice", "irradiated candy cane", "gingerbread mutant bugbear", "oozenog", "sugar plum", "sugar banana", "sugar lime", "sugar cherry", "Mer-kin hookspear", "Mer-kin takebag", "Mer-kin thingpouch", "Mer-kin killscroll", "Mer-kin fastjuice", "imitation crab crate", "imitation crab meat", "imitation crab zoea", "moist sailor's cap", "rusty speargun", "rusty compass", "rusty broken diving helmet", "rusty porthole", "rusty rivet", "bubblin' stone", "rusty diving helmet", "aerated diving helmet", "live nautical mine", "das boot", "imitation whetstone", "sea grease", "sturdy Crimbo crate", "battered Crimbo Crate", "twitching claw", "rigid carapace", "pulsing flesh", "unstable DNA", "The Spirit of Crimbo", "wriggling tentacle", "mass of wriggling tentacles", "pair of twitching claws", "gnashing teeth", "chitinous pod", "parasitic claw", "parasitic tentacles", "parasitic headgnawer", "parasitic strangleworm", "pair of ragged claws", "burrowgrub hive", "dusty Crimbo crate", "Gummi-DNA", "radioactive chew toy", "elven socks", "cheap elven gloves", "festive holiday hat", "patent leather shoes", "gray bow tie", "penguin thesaurus", "blob-shaped Crimbo cookie", "seaweed", "jamfish jam", "dragonfish caviar", "pufferfish spine", "depleted Grimacite kneecapping stick", "canteen of wine", "elven <i>limbos</i> gingerbread", "elven whittling knife", "magic dragonfish fry", "map to Madness Reef", "toast with jam", "miniature antlers", "elven moonshine", "knuckle sandwich", "psycho sweater", "fin-bit wax", "tiny plastic Mob Penguin", "tiny plastic mutant elf", "tiny plastic fat stack of cash", "tiny plastic strand of DNA", "tiny plastic chunk of depleted Grimacite", "container of Spooky Putty", "Spooky Putty mitre", "Spooky Putty leotard", "Spooky Putty ball", "Spooky Putty sheet", "Spooky Putty snake", "Spooky Putty monster", "glow-in-the-dark wristwatch", "glow-in-the-dark dart gun", "glow-in-the-dark stuffed burrowgrub", "Uncle Crimbo's Rations", "can of franks 'n' beans", "bottle of peppermint schnapps", "throbbing rage gland", "Mer-kin pressureglobe", "Mer-kin foodbucket", "diving muff", "salinated mint julep", "ink bladder", "glowing esca", "bubbling tempura batter", "globe of Deep Sauce", "map to the Marinara Trench", "tempura carrot", "tempura cucumber", "tempura avocado", "sea broccoli", "sea cauliflower", "tempura broccoli", "tempura cauliflower", "sea blueberry", "sea persimmon", "pressurized potion of perception", "pressurized potion of proficiency", "Mer-kin digpick", "anemone nematocyst", "high-pressure seltzer bottle", "velcro ore", "teflon ore", "vinyl ore", "map to Anemone Mine", "marine aquamarine", "rusty valve wheel", "waterlogged bootstraps", "velcro broadsword", "velcro paddle ball", "velcro shield", "velcro boots", "non-stick pugil stick", "teflon spatula", "teflon shield", "teflon swim fins", "7-inch discus", "PVC staff", "vinyl shield", "vinyl boots", "decaying wooden oar", "giant fishhook", "rusty old lantern", "decaying wooden pole", "decaying wooden paddle", "tarnished metal ring", "tarnished metal rod", "brittle plastic handle", "foggy glass globe", "possessed tomato", "Nardz energy beverage", "pile of gold coins", "hand grenegg", "caret", "glass gnoll eye", "cheap cigar butt", "manly bloomers", "Colon Annihilation Hot Sauce", "fat wallet", "enchanted handwarmer", "lucky lighter", "packet of beer nuts", "Boozehounds Anonymous token", "handful of bees", "spectral jelly", "jellyfish gel", "unstable quark", "software glitch", "fumble formula", "vampire pearl", "mother's secret recipe", "concoction of clumsiness", "vampire pearl earring", "white chocolate chip brownies", "Libram of Love Songs", "love song of vague ambiguity", "love song of smoldering passion", "love song of icy revenge", "love song of sugary cuteness", "love song of disturbing obsession", "love song of naughty innuendo", "breath mint", "vampire pearl ring", "vampire pearl necklace", "slug of vodka", "slug of rum", "slug of shochu", "screwdiver", "dew yoana lei", "lychee chuhai", "salacious screwdiver", "dew yoana salacious lei", "salacious lychee chuhai", "Alewife&trade; Ale", "seaode", "map to the Dive Bar", "Mer-kin pinkslip", "pink pinkslip slip", "sea salt scrubs", "amber aviator shades", "hair of the fish", "nurse's hat", "blank prescription sheet", "bottle of melodramamine", "bottle of extra-strength melodramamine", "paranormal ricotta", "smoking talon", "vampire glitter", "wine-soaked bone chips", "crumbling rat skull", "twitching trigger finger", "Apathargic Bandersnatch", "aquaviolet jub-jub bird", "crimsilion jub-jub bird", "charpuce jub-jub bird", "Mer-kin roundshield", "Mer-kin breastplate", "Mer-kin sneakmask", "Mer-kin prayerbeads", "Mer-kin hidepaint", "Mer-kin trailmap", "Mer-kin healscroll", "Mer-kin lockkey", "Mer-kin stashbox", "chocolate-frosted king cake", "red plastic baby", "midget clownfish", "half-height unicycle", "sea radish", "halibut", "eel sauce", "water-polo mitt", "glowing syringe", "fishy wand", "wad of cotton", "Grandma's Note", "Grandma's Fuchsia Yarn", "Grandma's Chartreuse Yarn", "golden plastic oyster egg", "Grandma's Map", "tempura radish", "water-polo cap", "Typical Tavern swill", "tropical swill", "fruity girl swill", "blended frozen swill", "tiny costume wardrobe", "Elvish sunglasses", "anniversary safety glass vest", "anniversary burlap belt", "anniversary balsa wood socks", "anniversary tiny latex mask", "anniversary pewter cape", "out-of-tune biwa", "dented harmonica", "magic whistle", "cheap plastic blowgun", "jungle drum", "hippy bongo", "knob bugle", "4-dimensional guitar", "boxing glove", "boxing glove on a spring", "half-sized guitar", "big bass drum", "pixel boomerang", "world's smallest violin", "ocarina of space", "a butt tuba", "bone flute", "infernal fife", "charming flute", "leaf of grass", "grass whistle", "plastic guitar", "finger cymbals", "black kettle drum", "double-barreled sling", "magilaser blastercannon", "frigid hanky&#363;", "ultimate ultimate frisbee", "stolen office supplies", "office-supply crossbow", "pocket theremin", "rave whistle", "hellseal hide", "shredded hellseal hide", "hellseal brain", "burst hellseal brain", "hellseal sinew", "torn hellseal sinew", "hellseal disguise", "fouet de tortue-dressage", "encoded cult documents", "cult memo", "decoded cult documents", "vial of red slime", "vial of yellow slime", "vial of blue slime", "vial of orange slime", "vial of green slime", "vial of violet slime", "vial of vermilion slime", "vial of amber slime", "vial of chartreuse slime", "vial of teal slime", "vial of indigo slime", "vial of purple slime", "vial of brown slime", "bottle of G&uuml;-Gone", "seal-blubber candle", "figurine of a wretched-looking seal", "figurine of a cute baby seal", "figurine of an armored seal", "figurine of an ancient seal", "figurine of a sleek seal", "figurine of a shadowy seal", "figurine of a stinking seal", "figurine of a charred seal", "figurine of a cold seal", "figurine of a slippery seal", "imbued seal-blubber candle", "blended frozen swill with a fly in it", "turtle wax", "turtle wax shield", "turtle wax helmet", "turtle wax greaves", "meat shield", "turtlemail bits", "turtlemail coif", "turtlemail breeches", "turtlemail hauberk", "hedgeturtle", "spiky turtle helmet", "spiky turtle shoulderpads", "spiky turtle shield", "turtling rod", "syncopated turtle", "grinning turtle", "tainted seal's blood", "severed flipper", "ingot of seal-iron", "bad-ass club", "powdered sealbone", "hyperinflated seal lung", "scrap of shadow", "fustulent seal grulch", "club of corruption", "corrupt club of corruption", "corrupt club of corrupt corruption", "evil-ass club", "nasty-ass club", "infernal toilet brush", "shadowy seal eye", "oyster egg balloon", "Clan VIP Lounge invitation", "Clan VIP Lounge key", "stuffed Meat", "stuffed treasure chest", "stuffed key", "stuffed Baron von Ratsworth", "stuffed monocle", "stuffed mink", "stuffed teddy butler", "stuffed martini", "stuffed crazy bastard sword", "stuffed tin of caviar", "bejeweled cufflinks", "garish pinky ring", "giant designer sunglasses", "fancy opera glasses", "designer handbag", "Clan pool table", "tiny cell phone", "cube of billiard chalk", "hot-ass club", "frigid-ass club", "creepy-ass club", "sizzling seal fat", "Abyssal ember", "frost-rimed seal hide", "frozen seal spine", "seal lube", "mannequin leg", "padded tortoise", "tortoboggan", "painted turtle", "painted shield", "sleeping wereturtle", "blue shell", "torquoise", "torquoise ring", "dueling turtle", "dueling banjo", "soup turtle", "samurai turtle", "samurai turtle helmet", "ancient turtle shell", "ancient turtle shell powder", "ancient turtle shell helmet", "slime-soaked hypophysis", "slime-soaked brain", "slime-soaked sweat gland", "security blankie", "big bundle of chamoix", "boxcar turtle", "dolphin whistle", "metrognome", "infant sandworm", "string of dingle balls", "agua de vida", "tortoboggan shield", "bottle of moontan lotion", "soup-chucks", "ballast turtle", "memory of some delicious amino acids", "memory of a C", "memory of an A", "memory of a G", "memory of a T", "memory of a CA base pair", "memory of a CG base pair", "memory of a CT base pair", "memory of an AG base pair", "memory of an AT base pair", "memory of a GT base pair", "squirming Slime larva", "rusty metal greaves", "undissolvable contact lenses", "rusty piece of rebar", "slime-covered shovel", "slime-covered necklace", "slime-covered speargun", "slime-covered compass", "slime-covered helmet", "slime-covered lantern", "slime-covered greaves", "slime-covered club", "memory of a grappling hook", "memory of a small stone block", "memory of a little stone block", "memory of half a stone circle", "memory of a stone half-circle", "memory of an iron key", "memory of a glowing crystal", "caustic slime nodule", "slimy sweetbreads", "slimy fermented bile bladder", "slimy alveolus", "memory of a cultist's robe", "pig-iron helm", "pig-iron shinguards", "pig-iron bracers", "wumpus hair", "wumpus-hair bolo", "wumpus-hair net", "wumpus-hair whip", "wumpus-hair wig", "wumpus-hair loincloth", "wumpus-hair sweater", "ring of teleportation", "glass of baboon milk", "banana milkshake", "White Hyborian", "goblin hunting spear", "goblin autoblowgun", "shiny tribal beads", "ancient stone fist", "ancient stone head", "Indigo Party Invitation", "Violet Hunt Invitation", "Blue Milk Club Card", "Mecha Mayhem Club Card", "'Smuggler Shot First' Button", "Spacefleet Communicator Badge", "Ruby Rod", "essence of heat", "essence of kink", "essence of cold", "essence of stench", "essence of fright", "essence of cute", "Supreme Being Glossary", "multi-pass", "villainous scythe", "baneful bandolier", "diabolical crossbow", "malevolent medallion", "corrosive cowl", "grisly shield", "corroded breeches", "pernicious cudgel", "cupcake-in-a-cup", "pool of liquid metal", "protein paste", "cyber-mattock", "facehugging alien", "X-37 gun", "neurostim pill", "physiostim pill", "tiny slimy cyst", "small slimy cyst", "medium slimy cyst", "big slimy cyst", "green peawee marble", "brown crock marble", "red China marble", "lemonade marble", "bumblebee marble", "jet bennie marble", "beige clambroth marble", "steely marble", "beach ball marble", "black catseye marble", "big bumboozer marble", "chamoisole", "bitter pill", "monstrous monocle", "musty moccasins", "molten medallion", "brazen bracelet", "bitter bowtie", "bewitching boots", "secret from the future", "moist sack", "rickety old unicycle", "crusty hula hoop", "Coily&trade;", "old school flying disc", "lawn dart", "red wagon", "wad of slimy rags", "crown-shaped beanie", "hopping socks", "poodle skirt", "letterman's jacket", "hardened slime hat", "hardened slime pants", "hardened slime belt", "empty agua de vida bottle", "boot plant", "sham champagne", "tempura air", "pressurized potion of pneumaticity", "moveable feast", "Bag o' Tricks", "slime stack", "a rumpled paper strip", "a creased paper strip", "a folded paper strip", "a crinkled paper strip", "a crumpled paper strip", "a ragged paper strip", "a ripped paper strip", "funny paper hat", "floaty sand", "charged magnet", "floaty stone sphere", "quadroculars", "lint", "dubious peppermint", "Elvish delight", "rockfish stomach", "live lobster", "wok lobster", "floaty pebbles", "floaty gravel", "floaty rock", "rock lobster", "pebblebr&auml;u", "rocky road ice cream", "extra-strength rubber bands", "children of the candy corn", "Good 'n' Slimy", "Staff of the Soupbone", "Voluminous Radio Pants", "Voluminous Radio Hat", "Voluminous Radio Sneakers", "4-d camera", "shaking 4-d camera", "crystallized memory", "floaty rock helmet", "floaty rock pants", "floaty rock necklace", "spaghetti cult robe", "sugar sheet", "Tome of Sugar Shummoning", "sugar shotgun", "sugar shillelagh", "sugar shank", "sugar chapeau", "sugar shorts", "sugar shield", "slime convention swag bag", "slime convention flyers", "slime convention coupons", "slime convention pin", "slime convention t-shirt", "floaty inverse geode", "control crystal", "sugar shirt", "sugar shard", "rave visor", "baggy rave pants", "pacifier necklace", "sea cowbell", "sea leather", "sea lasso", "sea cowboy hat", "grouper fangirl", "gill rings", "urchin roe", "pet anemone", "Mer-kin cheatsheet", "Mer-kin wordquiz", "brand new key", "brass dorsal fin", "skate skates", "skate skin", "roller skate decoy", "mermaid's purse", "underwater slingshot", "skate blade", "spangly unitard", "collapsible baton", "groupie lipstick", "groupie bra", "groupie spangles", "skate board", "S.A.V.E. flyer", "yield shield", "map to the Skate Park", "squamous polyp", "unspeakable lozenges", "roller skate doll", "Star of Bravery", "hungover chauvinist pig", "perfectly ordinary frog", "amphibious tophat", "bottle of Cochon Noir", "ice skate decoy", "ice skate doll", "hacienda key", "silver pat&eacute; knife", "silver salt-shaker", "can of sterno", "silver cheese-slicer", "fancy beef jerky", "pipe wrench", "gun cleaning kit", "sleep mask", "sock garters", "mariachi toothpaste", "heavy leather-bound tome", "leather bookmark", "ivory cue ball", "decanter of fine Scotch", "expensive cigar", "miniature tophat", "fisherman's sack", "fish-oil smoke bomb", "vial of squid ink", "potion of fishy speed", "spooky bark", "Wolfman Nardz", "spooky sap", "petrified wood", "chocolate-covered scarab beetle", "mulled cider", "wolfman mask", "pumpkinhead mask", "mummy costume", "Ax of L'rose", "bark boxers", "bark beret", "bark bracelet", "Krakrox's Loincloth", "Galapagosian Cuisses", "Angelhair Culottes", "Newman's Own Trousers", "Volartta's bellbottoms", "Lederhosen of the Night", "ribbon candy", "Underworld acorn", "Underworld trunk", "Underworld truncheon", "Staff of the Woodfire", "Underworld flail", "Mer-kin cancerstick", "Mer-kin sawdust", "Mer-kin bunwig", "crappy Mer-kin mask", "crappy Mer-kin tailpiece", "Mer-kin gladiator mask", "Mer-kin scholar mask", "Mer-kin gladiator tailpiece", "Mer-kin scholar tailpiece", "Mer-kin headguard", "Mer-kin waistrope", "Mer-kin facecowl", "Mer-kin thighguard", "Mer-kin dodgeball", "Mer-kin dragnet", "Mer-kin switchblade", "crystal orb of spirit wrangling", "depleted uranium seal figurine", "Ass-Stompers of Violence", "Brand of Violence", "Novelty Belt Buckle of Violence", "Lens of Violence", "Pigsticker of Violence", "Jodhpurs of Violence", "Cold Stone of Hatred", "Girdle of Hatred", "Staff of Simmering Hatred", "Pantaloons of Hatred", "Fuzzy Slippers of Hatred", "Lens of Hatred", "Treads of Loathing", "Scepter of Loathing", "Belt of Loathing", "Goggles of Loathing", "Stick-Knife of Loathing", "Jeans of Loathing", "Annual Ascot", "Sledgehammer of the V&aelig;lkyr", "Flail of the Seven Aspects", "Wrath of the Capsaician Pastalords", "Windsor Pan of the Source", "Seeger's Unstoppable Banjo", "The Trickster's Trikitixa", "Claw of the Infernal Seal", "Garter of the Turtle Poacher", "Bandolier of the Spaghetti Elemental", "Gravyskin Belt of the Sauceblob", "Bling of the New Wave", "La Hebilla del Cintur&oacute;n de Lopez", "suspicious stocking", "bag of many confections", "candy kneecapping stick", "licorice garrote", "candy knuckles", "jawbruiser", "fancy chocolate car", "tiny plastic 11 Dealer", "tiny plastic Crimbo Casino", "tiny plastic stocking mimic", "tiny plastic Don Crimbo", "tiny plastic Crimbomination", "Piddles", "BitterSweetTarts", "Polka Pop", "Crimbuck", "Crimbo wreath", "string of Crimbo lights", "plastic Crimbo reindeer", "gingerbread house", "leftover Crimbo rations", "snow hat", "snow pants", "snow belly", "pile of loose snow", "Crimbough", "A Crimbo Carol, Ch. 1", "A Crimbo Carol, Ch. 2", "A Crimbo Carol, Ch. 3", "A Crimbo Carol, Ch. 4", "A Crimbo Carol, Ch. 5", "A Crimbo Carol, Ch. 6", "expired can of franks 'n' beans", "expired bottle of peppermint schnapps", "snow halo", "elf resistance button", "elven suicide capsule", "penguin focaccia bread", "herringcello", "elven cellocello", "wrench handle", "handful of headless bolts", "bottle of agitprop ink", "handful of wires", "chunk of cement", "grappling hook", "cardboard elf ear", "spiraling shape", "Crimbomination Contraption", "throwing wrench", "pair of bolt cutters", "poison pen", "speed limit shield", "live wire", "misfit dolly", "misfit hobby horse", "misfit teddy bear", "pocketwatch on a chain", "cement sandals", "night-vision goggles", "passable elf mask", "peanut brittle shield", "Red Rover BB gun", "red-and-green sweater", "Crimbo Candy Cookbook", "Crimbo peppermint bark", "Crimbo fudge", "Crimbo candied pecan", "Jack-in-the-box", "brass crank handle", "stinky cheese ball", "stinky cheese sword", "stinky cheese diaper", "stinky cheese wheel", "stinky cheese eye", "Staff of Queso Escusado", "foreign box", "The Art of Slapfighting", "Uncle Romulus", "A Beginner's Guide to Charming Snakes", "Zu Mannk&auml;se Dienen", "The Autobiography Of Dynamite Superman Jones", "Inigo's Incantation of Inspiration", "quantum taco", "Schr&ouml;dinger's thermos", "colorful plastic ball", "sealhide hood", "sealhide leggings", "sealhide cloak", "sealhide buckler", "sealhide whip", "sealhide moccasins", "sealhide gloves", "sealhide belt", "sealhide snare", "puzzling trophy", "sealhide seal doll", "black hymnal", "glowstick on a string", "candy necklace", "teddybear backpack", "NPZR chemistry set", "invisibility potion", "irresistibility potion", "irritability potion", "strange cube", "hellseal whisker", "hellseal claw", "guard turtle shell", "crowbar", "spaghetti cult rosary", "spaghetti cult mask", "guard turtle collar", "spangly mariachi pants", "spangly mariachi vest", "spangly sombrero", "Instant Karma", "antique painting of a landscape", "map to The Landscaper's Lair", "pointy red hat", "machetito", "lawnmower blade", "grass clippings", "The Landscaper's leafblower", "snowball", "snailmail bits", "snailmail coif", "snailmail breeches", "snailmail hauberk", "seal-brain elixir", "chocolate seal-clubbing club", "chocolate turtle totem", "chocolate pasta spoon", "chocolate saucepan", "chocolate disco ball", "chocolate stolen accordion", "Libram of BRICKOs", "BRICKO brick", "BRICKO eye brick", "BRICKO hat", "BRICKO pants", "BRICKO sword", "BRICKO ooze", "BRICKO bat", "BRICKO oyster", "BRICKO turtle", "BRICKO elephant", "BRICKO octopus", "BRICKO python", "BRICKO vacuum cleaner", "BRICKO airship", "BRICKO cathedral", "BRICKO gargantuchicken", "BRICKO pyramid", "BRICKO pearl", "BRICKO bulwark", "BRICKO trunk", "gilded BRICKO brick", "gilded BRICKO chalice", "black BRICKO brick", "green BRICKO brick", "broken BRICKO brick", "BRICKO reactor", "BRICKO egg", "extra-heavy BRICKO brick", "recording of The Ballad of Richie Thingfinder", "recording of Benetton's Medley of Diversity", "recording of Elron's Explosive Etude", "recording of Chorale of Companionship", "recording of Prelude of Precision", "recording of Donho's Bubbly Ballad", "recording of Inigo's Incantation of Inspiration", "heart of the volcano", "Northern pemmican", "puzzling ribbon", "Clan looking glass", "&quot;DRINK ME&quot; potion", "reflection of a map", "walrus ice cream", "beautiful soup", "eggman noodles", "Vial of <i>jus de larmes</i>", "Humpty Dumplings", "Lobster <i>qua</i> Grill", "missing wine", "yellow matter custard", "delicious comfit?", "ittah bittah hookah", "flamingo mallet", "croquet hedgehog", "Tiger-lily's milk", "eye of the Tiger-lily", "powdered wig", "powdered donut", "bucket of honey", "elephant stinger", "dragon snaps", "snapdragon pistil", "puff of smoke", "rook cookie", "bishop cookie", "knight cookie", "king cookie", "queen cookie", "fairy-worn boots", "insane tophat", "helm of the white knight", "wristwatch of the white knight", "trousers of the white knight", "fancy tophat", "fancy black tie", "fancy tuxedo pants", "stuffed porpoise", "stuffed pocketwatch", "stuffed bandersnatch", "stuffed caterpillar", "stuffed walrus", "stuffed carpenter", "stuffed dodo", "detour shield", "left parenthesis", "lowercase a", "percent sign", "left bracket", "right parenthesis", "dollar sign", "equal sign", "antique record album", "map to Professor Jacking's laboratory", "can of depilatory cream", "hair of the calf", "world's most unappetizing beverage", "slippery when wet shield", "raisin", "tiny fly glasses", "flyest of shirts", "a dance upon the palate", "tiny frozen prehistoric meteorite jawbreaker", "Crazyleg's razor", "squirmy violent party snack", "can-you-dig-it?", "The Legendary Beat", "panicked kernel", "bugged beanie", "bugged balaclava", "bugged b&Atilde;&para;n&plusmn;&Atilde;&copy;t", "meat st&permil;&iquest;bing club", "Knob G&Atilde;&para;blin l&Atilde;&sup2;ve potion", "old school Mafi<i>a kni</i>cke&frac12;&aelig;", "T&Icirc;&curren;&loz;lisman of Bai&oslash;&Dagger;", "fat bottom quark", "big glob of skin", "six tiny wedges of goat cheese", "collection of tiny spooky objects", "boulder", "tiny goth giant", "brown pixel", "pixel whip", "pixel chain whip", "pixel morning star", "pixel orb", "pixellated moneybag", "pixel cross", "pixel holy water", "map to Vanya's Castle", "antique 8-Bit Power magazine", "pixel stopwatch", "antique bottle opener", "map to the Kegger in the Woods", "plastic cup of beer", "orquette's phone number", "bronze handcuffs", "silver keg", "bottle of Goldschn&ouml;ckered", "sun-dried tofu", "soyburger juice", "respected companion biscuit", "essential tofu", "essential soy", "essential cameraderie", "antique souvenir drawing", "map to the Magic Commune", "Crown of Thrones", "Cinco Mayo Lager", "Underworld sapling", "miniature pruning shears", "plastic cup of flat beer", "glowing frisbee", "portable motorcycle", "Game Grid token", "Game Grid ticket", "chocolate-covered caviar", "pawn cookie", "coffee pixie stick", "superduperball", "finger cuffs", "little parachute guy", "plastic spider ring", "cheap plastic kazoo", "inflatable baseball bat", "googly-star hat", "googly-ball hat", "googly-heart hat", "super-sweet boom box", "Game Grid valued membership card", "sinister demon mask", "streetfighting champion's belt", "Space Trip safety headphones", "LARP carp", "KoL Con Six Pack", "Gregarious Gregorian Smock", "rxr shield", "Juju Mojo Mask", "space trooper helmet", "Meteoid ice beam", "Dungeon Fist gauntlet", "Schmalz's First Prize Beer", "chiptune guitar", "fixed-gear bicycle", "ironic moustache", "ironic knit cap", "ironic oversized sunglasses", "ironic battle spoon", "ironic jogging shorts", "mole skin notebook", "antique pair of blue jeans", "map to Ellsbury's Claim", "blackberry galoshes", "trout fang", "poisonous caviar", "wet venom duct", "Ellsbury's journal", "Ellsbury's skull", "hot plate", "imp unity ring", "Victor, the Insult Comic Hellhound Puppet", "observational glasses", "hilarious comedy prop", "beer-scented teddy bear", "booze-soaked cherry", "comfy pillow", "giant marshmallow", "sponge cake", "gin-soaked blotter paper", "tree-holed coin", "unearthed volcanic meteoroid", "unearthed potsherd", "volcanic ash", "smoked potsherd", "pottery shield", "pottery hat", "pottery training pants", "pottery club", "pottery yo-yo", "pottery barn owl figurine", "fossilized bat skull", "fossilized serpent skull", "fossilized baboon skull", "fossilized wyrm skull", "fossilized wing", "fossilized limb", "fossilized torso", "fossilized spine", "affordable teak perch", "Greatest American Pants", "fossilized necklace", "imp air", "bus pass", "fossilized spike", "waterlogged crate", "archaeologing shovel", "red-hot medallion", "fossilized demon skull", "fossilized spider skull", "sinister ancient tablet", "E-Z Cook&trade; oven", "My First Shaker&trade;", "hippo tutu", "immense ballet shoes", "old sweatpants", "GameInformPowerDailyPro subscription card", "popsicle stick", "lemon popsicle", "orange popsicle", "strawberry popsicle", "liver popsicle", "mariachi hat", "Hollandaise helmet", "organ grinder", "microwave stogie", "liver and let pie", "badass pie", "shoo-fish pie", "piping organ pie", "igloo pie", "stomach turnover", "dead lights pie", "throbbing organ pie", "stop shield", "nest egg", "sleeping piano cat", "kitty sheet music", "rehearsing dramatic hedgehog", "tiny prop sword", "tangle of rat tails", "beer-soaked mop", "day-old beer", "plain old beer", "overpriced &quot;imported&quot; beer", "smiling rat", "rat tooth polish", "bone chips", "PlexiPips", "Wax Flask", "Pain Dip", "bone meal", "bone aperitif", "bonerang", "bone and arrows", "boning knife", "bone crusher", "bone spurs", "bonedanna", "boneana hammock", "bag of bones", "Stabonic scroll", "candy skeleton", "Grumpy Bumpkin's Pumpkin Seed Catalog", "packet of pumpkin seeds", "pumpkin", "huge pumpkin", "pumpkin pie", "pumpkin beer", "pumpkin juice", "pumpkin bomb", "shin gourds", "Staff of the November Jack-O-Lantern", "pumpkin carriage", "Desert Bus pass", "ginormous pumpkin", "Essence of Annoyance", "Unmotivator: Crashed Orca", "Unmotivator: Success Warrior", "Unmotivator: Crashed Meat Car", "Holiday Hal's Happy-Time Fun Book!", "Holiday Fun!", "Antagonistic Snowman Kit", "CRIMBCOIDS mints", "can of CRIMBCOLA", "CRIMBCOLOAF", "circular CRIMBCOOKIE", "tiny plastic CRIMBCO HQ", "tiny plastic fax machine", "tiny plastic hobo elf", "tiny plastic Mr. Mination", "tiny plastic Best Game Ever", "hibernating robot reindeer", "S.L.E.I.G.H.B.E.L.L.S.", "robot reindeer protocol P.R.A.N.C.E.R.", "robot reindeer protocol D.A.S.H.E.R.", "robot reindeer protocol D.O.N.N.E.R.", "robot reindeer protocol V.I.X.E.N.", "robot reindeer protocol C.U.P.I.D.", "robot reindeer protocol D.A.N.C.E.R.", "robot reindeer protocol C.O.M.E.T.", "robot reindeer protocol B.L.I.T.Z.E.N.", "robot reindeer protocol R.U.D.O.L.P.H.", "robot reindeer protocol O.L.I.V.E.", "triangular CRIMBCOOKIE", "square CRIMBCOOKIE", "bindlestocking", "sleeping stocking", "Tales of a Kansas Toymaker", "The Joy of Wassailing", "Uncle Hobo's stocking cap", "Uncle Hobo's epic beard", "Uncle Hobo's gift baggy pants", "Uncle Hobo's fingerless tinsel gloves", "Uncle Hobo's highest bough", "Uncle Hobo's belt", "chocolate cigar", "gift-a-pult", "holly-flavored Hob-O", "CRIMBCO scrip", "Toot Oriole care package", "paperclip", "bottle of Blank-Out", "CRIMBCO lanyard", "CRIMBCO Employee Handbook (chapter 1)", "CRIMBCO Employee Handbook (chapter 2)", "CRIMBCO Employee Handbook (chapter 3)", "CRIMBCO Employee Handbook (chapter 4)", "CRIMBCO Employee Handbook (chapter 5)", "portable photocopier", "deluxe fax machine", "Workytime Tea", "paperclip sproinger", "paperclip-on tie", "paperclip pants", "paperclip turban", "paperclip cape", "glob of Blank-Out", "photocopied monster", "gaudy key", "BGE merchandise order form", "chocolate bath ball", "bacon bath ball", "incense bath ball", "myrrh-soaked, chocolate-covered bacon bath ball", "CRIMBCO mug", "CRIMBCO wine", "Dickory Farms Gift Basket", "toe jam", "toe jam toast", "traffic jam", "traffic jam toast", "space jam", "space jam toast", "motivational poster", "sack lunch", "bath ball gift set", "slow jam collection", "BGE shotglass", "festive sausage", "holiday cheese log", "holiday log", "BGE 'ferocious fruit' shirt", "BGE 'cuddly critter' shirt", "BGE pocket calendar", "BGE temporary tattoo", "BGE tiny plastic toy", "stapler bear", "adhesive tape dolly", "scissor duck", "coal paperweight", "jingle bell", "Seven Loco", "Loathing Legion knife", "Loathing Legion many-purpose hook", "Loathing Legion moondial", "Loathing Legion necktie", "Loathing Legion electric knife", "Loathing Legion corkscrew", "Loathing Legion can opener", "Loathing Legion chainsaw", "Loathing Legion rollerblades", "Loathing Legion flamethrower", "Loathing Legion tattoo needle", "Loathing Legion defibrillator", "Loathing Legion double prism", "Loathing Legion tape measure", "Loathing Legion kitchen sink", "Loathing Legion abacus", "Loathing Legion helicopter", "Loathing Legion pizza stone", "Loathing Legion universal screwdriver", "Loathing Legion jackhammer", "Loathing Legion hammer", "Uncle Crimbo's Sack", "Folder Holder", "a cute angel", "quake of arrows", "time's arrow", "arrowgram", "Knob jelly donut", "Knob cake", "Knob cake pan", "Knob batter", "Knob frosting", "unfrosted Knob cake", "Cobb's Knob Menagerie key", "GOTO", "weremoose spit", "abominable blubber", "flimsy clipboard", "baggie of powdered sugar", "whalebone corset", "oven mitts", "overcookie", "philosopher's scone", "half-baked potion", "Knob Goblin deluxe scimitar", "Knob nuts", "Cobb's Knob Wurstbrau", "Subject 37 file", "mysterious silver lapel pin", "solid state loom", "Evilometer", "Sorcerers of the Shore Grimoire", "Pack of Alice's Army Cards", "Alice's Army Swordsman", "Alice's Army Spearsman", "Alice's Army Halberder", "Alice's Army Guard", "Alice's Army Wallman", "Alice's Army Ninja", "Alice's Army Alchemist", "Alice's Army Page", "Alice's Army Shieldmaiden", "Alice's Army Mad Bomber", "Alice's Army Nurse", "Alice's Army Hammerman", "Alice's Army Bowman", "Alice's Army Lanceman", "Alice's Army Horseman", "Alice's Army Coward", "Alice's Army Cleric", "Alice's Army Sniper", "Alice's Army Dervish", "Alice's Army Martyr", "Pack of Alice's Army Foil Cards", "Alice's Army Foil Swordsman", "Alice's Army Foil Spearsman", "Alice's Army Foil Halberder", "Alice's Army Foil Guard", "Alice's Army Foil Wallman", "Alice's Army Foil Ninja", "Alice's Army Foil Alchemist", "Alice's Army Foil Page", "Alice's Army Foil Shieldmaiden", "Alice's Army Foil Mad Bomber", "Alice's Army Foil Nurse", "Alice's Army Foil Hammerman", "Alice's Army Foil Bowman", "Alice's Army Foil Lanceman", "Alice's Army Foil Horseman", "Alice's Army Foil Coward", "Alice's Army Foil Cleric", "Alice's Army Foil Sniper", "Alice's Army Foil Dervish", "Alice's Army Foil Martyr", "Single Alice's Army Foil", "card sleeve", "evil eye", "Alice's Army Foil tattoo", "Ye Wizard's Shack snack voucher", "wasabi pocky", "tobiko pocky", "natto pocky", "wasabi-infused sake", "tobiko-infused sake", "natto-infused sake", "wasabi marble soda", "tobiko marble soda", "natto marble soda", "Alice's Army booster box", "elderly jawbreaker", "marshmallow flamb&eacute;", "cranberry schnapps", "breaded beer", "soy cordial", "astral bludgeon", "astral shield", "astral chapeau", "astral bracer", "astral longbow", "astral shorts", "astral mace", "astral trousers", "astral ring", "astral statuette", "astral pistol", "astral mask", "astral pet sweater", "astral shirt", "astral belt", "astral hot dog", "astral pilsner", "astral hot dog dinner", "astral six-pack", "Clan shower", "shard of double-ice", "double-ice cap", "double-ice box", "double-ice britches", "handful of numbers", "Lars the Cyberian", "intriguing puzzle box", "obnoxious riddle", "best joke ever", "Atomic Comic", "Red Pill", "Skullhead's Screw", "mysterious present", "boxing-glove-in-a-box", "creepy voodoo doll", "the finger", "Salsa de las Epocas", "spaghetti con calaveras", "s'more gun", "popcorn", "chaos popcorn", "tiny black hole", "innuendo", "s'more", "giant diamond ring", "Russian Ice", "giant clay ashtray", "orange leather lanyard", "monster pants", "box of Pok&euml;mann band-aids", "Pok&euml;mann band-aid", "Van der Graaf helmet", "electric crutch", "shock belt", "Okee-Dokee soda", "rubber band gun", "pin-stripe slacks", "sticky gloves", "correction fluid", "Pok&euml;mann figurine: Porkachu", "Pok&euml;mann figurine: Magikrap", "Pok&euml;mann figurine: Vegemite", "Pok&euml;mann figurine: Vermouth", "Pok&euml;mann figurine: Smugleaf", "Pok&euml;mann figurine: Twitter", "Pok&euml;mann figurine: Bloodkip", "Pok&euml;mann figurine: Hoboking", "Pok&euml;mann figurine: Duck", "Pok&euml;mann figurine: Nothing", "Pok&euml;mann figurine: Kagosan", "Pok&euml;mann figurine: Galumpagump", "Pok&euml;mann figurine: Shoggoth", "Pok&euml;mann figurine: Frank", "Pok&euml;mann figurine: Moog", "willyweed", "Nuclear Blastball", "fish juice box", "paint bomb", "hideous egg", "Jeppson's Malort", "fistful of ashes", "stress ball", "Li'l Businessman Kit", "Ultracolor&trade; shirt", "My Own Pen Pal kit", "packet of orchid seeds", "stomp box", "rusty hedge trimmers", "A. W. O. L. commendation", "reconstituted crow", "bird brain", "busted wings", "Massive Manual of Marauder Mockery", "Admiral's hat", "leather aviator's cap", "mirrored aviator shades", "Field Guide to Skeletal Anatomy", "Notes from the Elfpocalypse, Chapter I", "Notes from the Elfpocalypse, Chapter II", "Notes from the Elfpocalypse, Chapter III", "Notes from the Elfpocalypse, Chapter IV", "Notes from the Elfpocalypse, Chapter V", "Notes from the Elfpocalypse, Chapter VI", "Ultrasoldier Serum", "elven hardtack", "elven squeeze", "lunar isotope", "E.M.U. joystick", "E.M.U. rocket thrusters", "E.M.U. helmet", "E.M.U. harness", "[5139]carton of astral energy drinks", "[5140]astral energy drink", "Thwaitgold bee statuette", "moon unit", "E.M.U. Unit", "handful of honey", "honeypot", "wild honey pie", "honey mead", "honey dipper", "honeybritches", "honeycap", "Moonthril Circlet", "Moonthril Greaves", "Moonthril Flamberge", "Moonthril Longbow", "Moonthril Cuirass", "plush alielf", "Comet Drop", "plush dogcat", "plush hamsterpus", "plush ferrelf", "plush alien hamsterpus", "plush mutated alielf", "plush mutated alielephant", "mysterious chest", "spooky little girl", "tiny top hat and cane", "synthetic dog hair pill", "distention pill", "elven medi-pack", "transporter transponder", "Map to Safety Shelter Ronald Prime", "Map to Safety Shelter Grimace Prime", "elven magi-pack", "Saison du Lune", "Moonthril Schnapps", "Wrecked Generator", "Spaghetti with Moonballs", "Crepes a la Lune", "Moon Pie", "Comet Pop", "Flan in the Moon", "1/6th Pound Cake", "Mint-in-box Moonthril Circlet", "Mint-in-box Moonthril Greaves", "Mint-in-box Moonthril Cuirass", "Mint-in-box Moonthril Flamberge", "Mint-in-box Moonthril Longbow", "honey stick", "double-ice gum", "Operation Patriot Shield", "squirming egg sac", "corrupted data", "11-inch knob sausage", "exorcised sandwich", "Banfoy's Boutique Order Form", "Great S-Cape", "Marvelous Unitard", "gooey paste", "beastly paste", "oily paste", "ectoplasmic paste", "greasy paste", "bug paste", "hippy paste", "orc paste", "demonic paste", "indescribably horrible paste", "fishy paste", "goblin paste", "pirate paste", "chlorophyll paste", "strange paste", "Mer-kin paste", "slimy paste", "penguin paste", "elemental paste", "cosmic paste", "hobo paste", "Crimbo paste", "Teachings of the Fist", "fat loot token", "Thwaitgold grasshopper statuette", "Tome of Clip Art", "Ur-Donut", "The Bomb", "box of Familiar Jacks", "bucket of wine", "ultrafondue", "unbearable light", "oversized snowflake", "crystal skull", "borrowed time", "box of hammers", "shining halo", "furry halo", "frosty halo", "time halo", "Lumineux Limnio", "Morto Moreto", "Temps Tempranillo", "Bordeaux Marteaux", "Fromage Pinotage", "Beignet Milgranet", "Muschat", "cool jelly donut", "shrapnel jelly donut", "occult jelly donut", "thyme jelly donut", "frozen danish", "smashed danish", "forbidden danish", "cool cat claw", "blunt cat claw", "shadowy cat claw", "cheezburger", "toasted brie", "potion of the field gar", "too legit potion", "Bright Water", "cold-filtered water", "graveyard snowglobe", "cool cat elixir", "potion of the captain's hammer", "potion of X-ray vision", "potion of the litterbox", "potion of animal rage", "potion of punctual companionship", "holy bomb, batman", "bobcat grenade", "chocolate frosted sugar bomb", "broken glass grenade", "noxious gas grenade", "skull with a fuse in it", "boozebomb", "hammerus", "blunt icepick", "fluorescent lightbulb", "blammer", "clock-cleaning hammer", "4:20 bomb", "broken clock", "dethklok", "glacial clock", "Gygaxian Libram", "d4", "d6", "d8", "d10", "d12", "d20", "generic healing potion", "generic mana potion", "generic restorative potion", "kobold treasure hoard", "newborn kobold", "slightly thicker filthy rags", "dungeon dragon chest", "phish stick", "plastic vampire fangs", "Interview With You (a Vampire)", "Make-Your-Own-Vampire-Fangs kit", "your own black heart", "Sword of the Brouhaha Prince", "Chalice of the Malkovich Prince", "Sceptre of the Torremolinos Prince", "Medallion of the Ventrilo Prince", "Haunted Sorority House staff guide", "ghost trap", "chainsaw chain", "silver shotgun shell", "funhouse mirror", "ghostly body paint", "necrotizing body spray", "bite-me-red lipstick", "whisker pencil", "press-on ribs", "Rattlin' Chains", "Gummy Brains", "Blood 'n' Plenty", "Lobos Mints", "Sweet Sword", "Ecto-Cooler", "Bartles and BRAAAINS wine cooler", "Blood Light", "Silver Bullet beer", "Bone's Farm &quot;wine&quot;", "ghost protocol", "sorority brain", "Nightstalker perfume", "drum of pomade", "throwing bone", "extra-see-thru nightie", "BRAINS shorts", "Mesmereyes&trade; contact lenses", "cursed scrunchie", "extremely skinny jeans", "The Necbromancer's Hat", "The Necbromancer's Stein", "The Necbromancer's Shorts", "The Necbromancer's Wizard Staff", "The Necbronomicon", "The Cooler Out of Space", "The Necbronomicon (used)", "sorority girl's box", "Necbro wafers", "death blossom", "A Crimbo Carol, Ch. 1 (used)", "A Crimbo Carol, Ch. 2 (used)", "A Crimbo Carol, Ch. 3 (used)", "A Crimbo Carol, Ch. 4 (used)", "A Crimbo Carol, Ch. 5 (used)", "A Crimbo Carol, Ch. 6 (used)", "jar of oil", "The Art of Slapfighting (used)", "Uncle Romulus (used)", "A Beginner's Guide to Charming Snakes (used)", "Zu Mannk&auml;se Dienen (used)", "Autobiography Of Dynamite Superman Jones (used)", "Inigo's Incantation of Inspiration (crumpled)", "Tales of a Kansas Toymaker (used)", "The Joy of Wassailing (used)", "CRIMBCO Employee Handbook (chapter 1) (used)", "CRIMBCO Employee Handbook (chapter 2) (used)", "CRIMBCO Employee Handbook (chapter 3) (used)", "CRIMBCO Employee Handbook (chapter 4) (used)", "CRIMBCO Employee Handbook (chapter 5) (used)", "Field Guide to Skeletal Anatomy (shredded)", "Ellsbury's journal (used)", "KoL Con 8-Bit power bracelet", "miniature boiler", "stuffed-shirt scarecrow", "tiny plastic trollipop", "tiny plastic Fudge Wizard", "tiny plastic abominable fudgeman", "tiny plastic colollilossus", "tiny plastic Big Candy", "The Groose in the Hoose", "spruce juice", "groose grease", "lollipop stick", "bananagate", "pearidot", "tourmalime", "kumquartz", "strawberyl", "ridiculous belt", "ridiculous earring", "ridiculous sunglasses", "ridiculous sandwich", "ridiculous cocktail", "zombie monkey necklace", "Thwaitgold butterfly statuette", "scrap of sticky paper", "sandpaper", "peppermint sprout", "peppermint twist", "peppermint patty", "peppermint crook", "peppermint rhino baby", "candy cane candygram", "peppermint parasol", "giant candy cane", "Mint Salton Pepper's Peppermint Seed Catalog", "Peppermint Pip Packet", "cane-mail shirt", "cane-mail pants", "Vodka Matryoshka", "Gin Mint", "Tequiz Navidad", "Mint Yulep", "Crimbojito", "Sangria de Menthe", "candycaine powder", "licorice boa", "licorice root", "banana supersucker", "pear supersucker", "lime supersucker", "kumquat supersucker", "strawberry supersucker", "bananarama bangle", "pair of pearidot earrings", "tourmalime tourniquet", "kumquartz ring", "strawberyl necklace", "sucker bucket", "sucker hakama", "sucker kabuto", "sucker tachi", "sucker scaffold", "cinnamon troll doll", "grape troll doll", "blue raspberry troll doll", "DNOTC Box", "fudgecule", "fudge lily", "superheated fudge", "fluid of fudge-finding", "frigid fudgepuck", "fudgesicle", "wand of fudge control", "The Kloop in the Coop", "miniscule beatbox", "devilish folio", "clumsiness bark", "jar full of wind", "dangerous jerkcicle", "furious stone", "vanity stone", "lecherous stone", "jealousy stone", "avarice stone", "gluttonous stone", "red gummi ingot", "green gummi ingot", "yellow gummi ingot", "Fudgie Roll", "fudge bunny", "fudge spork", "fudgecycle", "fudge cube", "blank fudge mold", "Libram of Resolutions", "resolution: be wealthier", "resolution: be happier", "resolution: be stronger", "resolution: be smarter", "resolution: be sexier", "resolution: be feistier", "resolution: be kinder", "resolution: be more adventurous", "resolution: be luckier", "giant red gummi ingot", "giant green gummi ingot", "giant yellow gummi ingot", "gummi salamander", "gummi snake", "gummi canary", "giant red gummi bear", "giant green gummi bear", "giant yellow gummi bear", "red drunki-bear", "green drunki-bear", "yellow drunki-bear", "gummi bowtie", "fudge pocket square", "lollipop cufflinks", "trilobite fossil", "ammonite fossil", "belemnite fossil", "trilobite candy mold", "ammonite candy mold", "belemnite candy mold", "gummi trilobite", "gummi ammonite", "gummi belemnite", "all-year sucker", "heart of dark chocolate", "Big Candy's tophat", "Fuzzby", "Jackass Plumber home game", "Trivial Avocations board game", "Tickle-Me Emilio", "blessed large box", "pack of pogs", "jerky coins", "Go-Wassail", "Uncle Greenspan's Bathroom Finance Guide", "bottle of bubbles", "wind-up meatcar", "Trivial Avocations Card: What?", "Trivial Avocations Card: When?", "Trivial Avocations Card: Who?", "Trivial Avocations Card: Where?", "pog #01 (spider)", "pog #02 (Knob goblin)", "pog #03 (warwelf)", "pog #04 (skleleton)", "pog #05 (ninja snowman)", "pog #06 (filthy hippy)", "pog #07 (orcish frat boy)", "pog #08 (hellion)", "pog #09 (pirate)", "pog #10 (hobo)", "pog #11 (Naughty Sorceress)", "Atomic Pop", "tiny do-rag", "whimpering willow bark", "berries of suffering", "baobab sap", "cup of hickory chicory", "magnolia blossom", "Mortimer's nostrum", "Barulio's bottle", "Marvin's marvelous pill", "Winifred's whistle", "purple prose pen", "half-empty carton of milk", "glass of warm water", "desktop zen garden", "Vivian's Vitamin", "pink-belly slapper", "Leapin' Trousers", "green eggnog", "green hamhock", "The Thorax's Codex of Tormenting Plants", "Clancy's sackbut", "Ghost Pinching Quarterly", "Clancy's crumhorn", "The Snitch's Manifesto", "Clancy's lute", "Trusty", "can of Rain-Doh", "empty Rain-Doh can", "fireclutch", "Rain-Doh red wings", "Rain-Doh orange agent", "Rain-Doh yellow laser gun", "Rain-Doh green lantern", "Rain-Doh blue balls", "Rain-Doh indigo cup", "Rain-Doh violet bo", "Rain-Doh black box", "Rain-Doh box full of monster", "PB&BP", "club sandwich", "corned-beef Reuben", "frayed ninja rope", "dull ninja crampons", "loose ninja carabiner", "Groar's fur", "Thwaitgold stag beetle statuette", "Drac & Tan", "Transylvania Sling", "Shot of the Living Dead", "Buttery Knob", "Slippery Knob", "Flaming Knob", "Grasshopper", "Locust", "Plague of Locusts", "Red Dwarf", "Golden Mean", "Green Giant", "Aye Aye", "Aye Aye, Captain", "Aye Aye, Tooth Tooth", "Humanitini", "More Humanitini than Humanitini", "Oh, the Humanitini", "Great Older Fashioned", "Fuzzy Tentacle", "Crazymaker", "Zoodriver", "Sloe Comfortable Zoo", "Sloe Comfortable Zoo on Fire", "Suffering Sinner", "Suppurating Sinner", "Sizzling Sinner", "Firewater", "Earth and Firewater", "Earth, Wind and Firewater", "Slimosa", "Extra-slimy Slimosa", "Slimebite", "Cement Mixer", "Jackhammer", "Dump Truck", "Fauna Libre", "Chakra Libre", "Aura Libre", "Sazerorc", "Sazuruk-hai", "Flaming Sazerorc", "Green Velvet", "Green Muslin", "Green Burlap", "Mohobo", "Moonshine Mohobo", "Flaming Mohobo", "Drunken Philosopher", "Drunken Neurologist", "Drunken Astrophysicist", "Dark & Starry", "Black Hole", "Event Horizon", "Herring Daiquiri", "Herring Wallbanger", "Herringtini", "Lollipop Drop", "Candy Alexander", "Candicaine", "Caipiranha", "Flying Caipiranha", "Flaming Caipiranha", "Punchplanter", "Doublepunchplanter", "Haymaker", "Small Medium", "crystal decanter", "glowing fungus", "ancient poisoned dart", "stone wool", "shiny stones", "the Nostril of the Serpent", "ancient calendar fragment", "ancient calendar", "Boris's Helm", "staph of homophones", "Boris's Helm (askew)", "mime soul fragment", "Monster Manuel", "key-o-tron", "nailswurst", "used beer", "Huggler Radio", "fettucini &eacute;pines Inconnu recipe", "slap and slap again recipe", "insulting hat", "offensive moustache", "hairshirt", "Olympic-sized Clan crate", "cursed microwave", "cursed pony keg", "How to Tolerate Jerks", "How to Hold a Grudge", "puppet strings", "bagged stuffed &quot;L&quot;", "stuffed club", "fettucini &eacute;pines Inconnu", "slap and slap again", "gunpowder burrito", "beery blood", "stuffed &quot;L&quot;", "watered-down Red Minotaur", "pool torpedo", "Ze&trade; goggles", "soggy used band-aid", "stylish swimsuit", "lost key", "P.B.L.T.", "note from Clancy", "BURT", "handful of juicy garbage", "bugbear communicator badge", "quantum nanopolymer spider web", "bugbear autopsy tweezers", "UV monocular", "drone self-destruct chip", "Jeff Goldblum larva", "pacification grenade", "quantum disintegrator pistol", "phase-tuned shield generator belt", "Thwaitgold woollybear statuette", "bugbear detector", "bugbear purification pill", "1 Meat", "The Lost Glasses", "The Lost Pill Bottle", "The Lost Comb", "Moping Artistic Goth Kid", "little wooden mannequin", "crayon shavings", "wax bugbear", "wax hat", "wax pants", "FDKOL commendation", "drop of water-37", "fireman's helmet", "fire axe", "enchanted fire extinguisher", "FDKOL tattoo", "Hjodor's Guide to Arctic Dalmatians", "Hjodor's Guide to Arctic Dalmatians (used)", "FDKOL hotcakes", "hot egg", "smoking grass", "fiery wing", "wings of fire", "FDKOL fire hose", "bottle of fire", "molten brick", "hot daub", "hot daub bun", "hot daub stand", "foot-long hot daub", "ballpark hot daub", "angst burger", "5-hour acrimony", "blank note", "eerily silent box", "forbidden sausage", "Lord Flameface's cloak", "Drizzlers&trade; Black Licorice", "daub-breaker", "Camp Scout backpack", "CSA fire-starting kit", "bag of GORP", "water purification pills", "Camp Scout pup tent", "CSA scoutmaster's &quot;water&quot;", "bag of GORF", "CSA discount card", "bag of QWOP", "CSA bravery badge", "CSA all-purpose soap", "CSA cheerfulness ration", "CSA obedience grenade", "Tales of the Word Realms", "crappy brain", "decent brain", "good brain", "boss brain", "hunter brain", "Staff of Holiday Sensations", "rusty staff", "slime-covered staff", "Staff of the Scummy Sink", "flaming nose", "Superhero Reboots", "fuzzy busby", "fuzzy earmuffs", "fuzzy montera", "Unagnimated Gnome", "gnomish swimmer's ears", "gnomish coal miner's lung", "gnomish tennis elbow", "gnomish housemaid's kgnee", "gnomish athlete's foot", "Thwaitgold maggot statuette", "talkative skull", "shiny gold fronts", "Barney's rake", "idiot brain", "keel-haulin' knife", "ancient ice cream scoop", "soft green echo eyedrop antidote martini", "morningwood plank", "raging hardwood plank", "weirdwood plank", "thick caulk", "long hard screw", "messy butt joint", "smut orc keepsake box", "bubblin' crude", "box of bear arms", "right bear arm", "left bear arm", "Hat O' Nine Tails", "Enchanted Plunger", "Enchanted Flyswatter", "Gearhead Goo", "Missing Eye Simulation Device", "Gnollish Crossdress", "eldritch dough", "Charity's choker", "Smart Bone Dust", "perpendicular guano", "White Chocolate Golem Seeds", "Shivering Ch&egrave;vre", "giant breath mint", "enchanted muesli", "glass of warm milk", "glass of gnat milk", "Knob Goblin Mutagen", "Tears of the Quiet Healer", "giant tube of black lipstick", "skelelton spine", "smut orc sunglasses", "blob of acid", "flayed mind", "kobold kibble", "forest spirit rattle", "Stone Golem pebbles", "spooky gravy fairy warlock hat", "bull blubber", "frog lip-print", "gazely stare", "tiny canopic jar", "clove-flavored lip balm", "Skullery Maid's Knee", "zombie hollandaise", "skeletal banana", "gilt perfume bottle", "janglin' bones", "pygmy papers", "pygmy dart", "secret mummy herbs and spices", "brigand brittle", "holistic headache remedy", "scrunchie tourniquet", "embezzler's oil", "Fu Manchu Wax", "Iiti Kitty Gumdrop", "ravenous eye", "Rogue Windmill Rouge", "A muse-bouche", "gold toothbrush", "pirate cream pie", "una poca de gracia", "compressed air canister", "salt water taffy", "unholy water", "Bangyomaman battle juice", "handyman &quot;hand soap&quot;", "space marine flash grenade", "temporary tribal tattoo", "oil-filled donut", "stick-on gnome beard", "BRICKO stud", "Osk'r Chow", "Scuba Snack", "grey cube", "votive candle", "booby trap", "Agent Corrigan's cigarette", "good ash", "Tome of Rad Libs", "Rad Lib", "papier-m&acirc;ch&eacute; glob", "papier-mochi", "papier-m&acirc;chaeranthera", "papier-m&acirc;ch&eacute; toothpicks", "papier-m&acirc;ch&eacute;te", "papier-m&acirc;chine gun", "papier-masque", "papier-mitre", "papier-m&acirc;churidars", "papier-m&acirc;ch&eacute; plaque", "papier-m&acirc;ch&eacute; handle", "papier-m&acirc;ch&eacute; base", "papier-m&acirc;ch&eacute; bowl", "papier-m&acirc;ch&eacute; trophy pi&ntilde;ata", "Rainbow Jello Mould", "Pete & Jackie's Dragon Tooth Emporium Catalog", "packet of dragon's teeth", "skeleton", "skeleton skis", "skeleton quiche", "skeletal scabbard", "skeletal skiff", "Bonestabber", "crystal skeleton vodka", "Lazybones&trade; recliner", "auxiliary backbone", "skulldozer egg", "ribcage rollcage", "that gum you like", "dreaming Jung man", "Little Crimson Book", "avatar of the Unconscious Collective", "blue canary nightlight", "Unconscious Collective Dream Jar", "jar of psychoses (The Suspicious-Looking Guy)", "jar of psychoses (The Captain of the Gourd)", "jar of psychoses (The Crackpot Mystic)", "jar of psychoses (The Old Man)", "jar of psychoses (The Pretentious Artist)", "jar of psychoses (The Meatsmith)", "[Jar of psychoses (Trader)]", "jar of psychoses (Jick)", "pixel pill", "pixel energy tank", "ChibiBuddy&trade; (on)", "gold wedding ring", "deactivated nanobots", "nanorhino credit card", "Solstice Shield", "powdered candy sushi set", "sweet mochi ball", "beet-flavored Mr. Mediocrebar", "sweet-corn-flavored Mr. Mediocrebar", "cabbage-flavored Mr. Mediocrebar", "tiny plastic animelf", "tiny plastic ChibiBuddy&trade;", "tiny plastic taco-clad Crimbo elf", "tiny plastic Uncle Crimboku", "tiny plastic MechaElf", "plastic ingot", "electrical thingamabob", "ChibiBuddy&trade; (off)", "BittyCar MeatCar", "BittyCar HotCar", "brainwave-controlled unicorn horn", "bubble-wrap simulator", "blind-packed capsule toy", "tiny plastic four-shadowed mime", "tiny plastic Bugbear Captain", "tiny plastic Rene C. Corman", "tiny plastic Lord Flameface", "tiny plastic Beebee King", "tiny plastic Queen Bee", "tiny plastic Wu Tang the Betrayer", "tiny plastic Clancy the Minstrel", "tiny plastic Battlesuit Bugbear Type", "tiny plastic spiderbugbear", "tiny plastic peacannon", "tiny plastic the Free Man", "tiny plastic fire servant", "tiny plastic mumblebee", "tiny plastic moneybee", "tiny plastic beebee gunners", "tiny plastic beebee queue", "tiny plastic buzzerker", "tiny plastic bee swarm", "tiny plastic batbugbear", "tiny plastic bugaboo", "tiny plastic Ancient Unspeakable Bugbear", "tiny plastic black ops bugbear", "tiny plastic hypodermic bugbear", "tiny plastic cavebugbear", "tiny plastic Norville Rogers", "tiny plastic Scott the Miner", "tiny plastic angry space marine", "tiny plastic Charity the Zombie Hunter", "tiny plastic Father McGruber", "tiny plastic Hank North, Photojournalist", "tiny plastic blazing bat", "electronic dulcimer pants", "A-Boo clue", "Frown Exerciser", "soul monocle", "soul doorbell", "soul coin", "soul knife", "soul mask", "record of infuriating silence", "record of infuriating silence (used)", "record of tranquil silence", "record of tranquil silence (used)", "record of menacing silence", "record of menacing silence (used)", "silent beret", "slice of pizza", "huge gold coin", "cartoon heart", "gold star", "tankard of ale", "vial of holy water", "green cloth cap", "iron dagger", "hamburger", "dollar-sign bag", "red potion", "blue potion", "bottle of wine", "round blue bomb", "iron helmet", "steel sword", "whole roasted chicken", "massive gemstone", "extra-strength red potion", "fancy blue potion", "shining goblet", "fireball", "gold crown", "flaming sword", "Helm of the Scream Emperor", "Cloak of Dire Shadows", "Sword of Dark Omens", "Shield of Icy Fate", "Greaves of the Murk Lord", "Gauntlets of the Blood Moon", "Boots of Twilight Whispers", "Belt of Howling Anger", "logging hatchet", "orc wrist", "freshwater pearl necklace", "orcish stud-finder", "screwing pooch", "orcish hand lotion", "orcish rubber", "orcish nailing lube", "backwoods screwdriver", "loadstone", "Claybender glasses", "Duskwalker fangs", "Space Tourist Phaser", "Whoompa Fur Pants", "Whatsian Ionic Pliers", "Polysniff Perfume", "Duskwalker syringe", "Space Tours Tripple", "Battlie Light Saver", "T.U.R.D.S. Key", "dress pants", "badge of authority", "giant motorcycle boots", "stolen necklace", "troll britches", "vial of The Glistening", "artisanal limoncello", "creepy ginger ale", "incredible pizza", "oil cap", "oil lamp", "oil slacks", "oil pan", "oily boid", "woim", "Thwaitgold praying mantis statuette", "BittyCar SoulCar", "Misty Cloak", "Misty Robe", "Misty Cape", "woimbook", "Taco Dan's Taco Stand Flier", "Taco Dan's Taco Stand Taco", "Taco Dan's Taco Stand Chimichangarita", "Taco Dan's Taco Stand Chillacious Churro", "psychoanalytic jar", "The Sword in the Steak", "Meatcleaver", "Crimbo Elf creepy bobble-head", "Crimbo stogie-scented room odorizer", "Crimbo bottomless hot cocoa mug", "Crimbo tree flocker", "Crimbo light-up Rudolph doll", "Super Crimboman Ultra Mega Hypersword", "sharp tin strip", "wad of spider silk", "goblin collarbone", "Truthsayer", "loose blade", "goblin bone hilt", "sticky sword blade", "Thinknerd's Grimoire of Geeky Gifts", "confusing LED clock", "haggis-infused soap", "magicberry tablets", "37x37x37 puzzle cube", "McLeod's Hard Haggis-Ade", "haggis-wrapped haggis-stuffed haggis", "home robotics kit", "old school calculator watch", "haggis socks", "airblaster gun", "Thinknerd T-shirt grab bag", "actual reality goggles", "Mr. Haggis", "magnetic sculpture kit", "Microplushie: Otakulone", "Microplushie: Hippylase", "Microplushie: Bropane", "Microplushie: Sororitrate", "Microplushie: Gothochondria", "Microplushie: Raverdrine", "Microplushie: Hobomosome", "Microplushie: Ermahgerdic Acid", "Microplushie: Dorkonide", "Microplushie: Fauxnerditide", "Microplushie: Hipsterine", "classy monkey", "fancy gourd potion", "Thinknerd T-Shirt", "pile of useless robot parts", "homemade robot", "homemade robot gear", "Artist's Whisk of Misery", "Artist's Butterknife of Regret", "Artist's Spatula of Despair", "Artist's Cookie Cutter of Loneliness", "Artist's Cr&egrave;me Brul&eacute;e Torch of Fury", "Ginsu&trade;", "bubble-wrap simulator (one broken button)", "bubble-wrap simulator (half broken)", "bubble-wrap simulator (one button left)", "zaibatsu lobby card", "zaibatsu level 1 card", "zaibatsu level 2 card", "zaibatsu level 3 card", "CEO office card", "test site key", "strange goggles", "brass abacus", "bonsai tree", "cheap Chinese beer", "lucky cat statue", "rhinoceros horn", "furry pink pillow", "bottle of limeade", "novelty tattoo sleeves", "pair of rhinoceros horns", "furry brown pillow", "makeshift yakuza mask", "gold piece", "toy taijijian", "magical battery", "White Dragon Fang", "butterfly knife", "tube of herbal ointment", "pencil kunai", "weighted paperclip chain", "great big capacitor", "rubber gloves", "Chinese curse words", "triad summoning scroll", "roasted duck", "dead meat bun", "lucky cat collar", "suspicious-looking fedora", "Sword of Procedural Generation", "Bodacious MechaElf Hunter Saga:Relay Wolf", "Deactivated MiniMechaElf", "MiniMechaElf Laser Punch Missile Launcher", "Snow Suit", "carrot nose", "carrot cake", "carrot claret", "carrot juice", "pixel power cell", "flickering pixel", "Byte", "anger blaster", "doubt cannon", "fear condenser", "regret hose", "Young Man's Crew Sequester", "Young Man's Cargo Load", "foam commodore's hat", "foam naval trousers", "miniature deck cannon", "ornamental sextant", "Bloodbath", "Hundred Headed IPA", "old chum", "crude crudit&eacute;s", "candy crayons", "pixel grappling hook", "GameInformPowerDailyPro magazine", "GameInformPowerDailyPro walkthru", "cosmic egg", "cosmic dough", "cosmic vegetable", "cosmic cheese", "cosmic potted meat product", "cosmic potato", "cosmic cream", "cosmic fruit", "Jarlsberg's hat", "consummate hard-boiled egg", "consummate fried egg", "consummate egg salad", "consummate bagel", "consummate sliced bread", "consummate hot dog bun", "consummate brownie", "consummate toast", "passable stout", "consummate soup", "consummate corn chips", "consummate salad", "consummate salsa", "consummate sauerkraut", "consummate cheese slice", "consummate melted cheese", "consummate bacon", "consummate meatloaf", "consummate steak", "consummate cold cuts", "consummate frankfurter", "consummate french fries", "consummate baked potato", "acceptable vodka", "consummate ice cream", "consummate whipped cream", "consummate sour cream", "consummate strawberries", "consummate sorbet", "adequate rum", "mediocre lager", "immaculate grilled cheese", "immaculate ice cream sandwich", "immaculate hot dog", "immaculate egg salad sandwich", "perfect sandwich", "perfect chef salad", "perfect breakfast", "sublime deluxe hot dog", "sublime stew", "sublime nachos", "Ultimate Breakfast Sandwich", "Loaded Baked Potato", "Omega Sundae", "Das Sauerlager", "Bologna Lambic", "Vodka Dog", "Disappointed Russian", "Chunky Mary", "Nachojito", "Le Roi", "Over Easy Rider", "cosmic six-pack", "the Jick-o-loser", "cube of ectoplasm", "Illuminati earpiece", "censored can label", "ectoplasm <i>au jus</i>", "the kindest cold cut", "lucky cat's paw", "ASCII fu manchu", "demonic surgical gloves", "cheap clip-on ninja tie", "gamer slurry", "dungeoneering kit", "numberwang", "scroll of Protection from Bad Stuff", "scroll of Puddingskin", "Spellbook: Walberg's Dim Bulb", "Spellbook: Singer's Faithful Ocelot", "Spellbook: Drescher's Annoying Noise", "dried gelatinous cube", "pile of dungeon junk", "Staff of the Healthy Breakfast", "Staff of the Staff of Life", "Staff of the Light Lunch", "Staff of the Standalone Cheese", "Staff of the Hearty Dinner", "Staff of the All-Steak", "Staff of Fruit Salad", "Staff of the Cream of the Cream", "giant jar of protein powder", "giant grain of protein powder", "pec oil", "giant gym membership card", "Squat-Thrust Magazine", "massive dumbbell", "giant penguin keychain", "O'RLY manual", "open sauce", "giant turkey leg", "Ye Olde Meade", "Ye Olde Bawdy Limerick", "Ye Olde Medieval Insult", "pewter claymore", "giant artisanal rice peeler", "giant heirloom grape tomato", "chipotle wasabi cilantro aioli", "brown felt tophat", "brass gear", "Mark I Steam-Hat", "Mark II Steam-Hat", "Mark III Steam-Hat", "Mark IV Steam-Hat", "Mark V Steam-Hat", "steam-powered model rocketship", "punk rock jacket", "giant safety pin", "stolen sushi", "very overdue library book", "drum 'n' bass 'n' drum 'n' bass record", "cosmic bucket", "fragment of Jarlsberg's soul", "Thwaitgold firefly statuette", "model airship", "Super Weight-Gain 9000", "possibility potion", "eleven-foot pole", "ring of Detect Boring Doors", "Jarlsberg's pan (Cosmic portal mode)", "Jarlsberg's pan", "Cosmic Calorie", "celestial olive oil", "celestial carrot juice", "celestial au jus", "celestial squid ink", "Uncle Buck", "crate of fish meat", "damp old wallet", "fishy pipe", "old SCUBA tank", "deep six-shooter", "sea chaps", "sea holster", "shavin' razor", "long-forgotten necklace", "giant pearl", "sea lace", "jam band", "aquamariner's ring", "aquamariner's necklace", "pearl diver's ring", "pearl diver's necklace", "sushi doily", "scimitar cozy", "fish stick cozy", "bazooka cozy", "cozy scimitar", "Staff of the Cozy Fish", "cozy bazooka", "sea mantle", "sea shawl", "sea cape", "saltwaterbed", "muddy pirate hat", "floral-print skirt", "spectral axe", "super-strong air freshener", "Mer-kin lipstick", "Mer-kin mouthsoap", "Mer-kin strongjuice", "Mer-kin fitbrine", "Mer-kin ragejuice", "Mer-kin dragbelt", "Mer-kin eyeglasses", "Mer-kin gutgirdle", "Mer-kin finpaddle", "Mer-kin stopwatch", "Mer-kin dreadscroll", "Mer-kin smartjuice", "Mer-kin cooljuice", "Mer-kin worktea", "Mer-kin knucklebone", "Mer-kin darkbook", "Mer-kin begsign", "Libram of Pulled Taffy", "pulled yellow taffy", "pulled indigo taffy", "pulled green taffy", "pulled blue taffy", "pulled orange taffy", "pulled violet taffy", "pulled red taffy", "Mer-kin hallpass", "lump of clay", "twisted piece of wire", "can of the cheapest beer", "bottle of fruity &quot;wine&quot;", "single swig of vodka", "angry inch", "testy toolbox", "Jick-o-User", "eraser nubbin", "chlorine crystal", "ph balancer", "mysterious chemical residue", "nugget of sodium", "root beer", "jigsaw blade", "wood screw", "balsa plank", "blob of wood glue", "envyfish egg", "Mer-kin rocksalt", "Mer-kin saltmint", "Mer-kin saltsquid", "scale-mail underwear", "comb jelly", "anemone sauce", "inky squid sauce", "Mer-kin weaksauce", "peanut sauce", "black glass", "Boss Drops", "Mer-kin lunchbox", "black tear", "jagged tooth", "grisly shell fragment", "violent pastilles", "worst candy", "fudge-shaped hole in space-time", "Pocket Square of Loathing", "corrupted stardust", "Star Spawn", "cute bow from beyond the stars", "KoLHS Pep Squad Box", "shaking skull", "Order of the Green Thumb Order Form", "clutch of dodecapede eggs", "flavorless gruel", "mana curds", "twist of lime", "pencil stub", "giant giant moth dust", "glob of spoiled mayo", "tonic djinn", "vampire chowder", "Tales of Dread", "Dreadsylvanian skeleton key", "Official Seal of Dreadsylvania", "Dreadsylvanian stew", "white Dreadsylvanian", "brass Dreadsylvanian flask", "silver Dreadsylvanian flask", "dreadful fedora", "dreadful sweater", "dreadful glove", "Freddy Kruegerand", "Mark of the Bugbear", "Mark of the Werewolf", "Mark of the Zombie", "Mark of the Ghost", "Mark of the Vampire", "Mark of the Skeleton", "Covers-Your-Head", "Drapes-You-Regally", "Warms-Your-Tush", "Helps-You-Sleep", "Quiets-Your-Steps", "Protects-Your-Junk", "Gets-You-Drunk", "Great Wolf's headband", "Great Wolf's left paw", "Great Wolf's right paw", "Great Wolf's rocket launcher", "Great Wolf's beastly trousers", "Great Wolf's lice", "Hunger&trade; Sauce", "zombie mariachi hat", "zombie accordion", "zombie mariachi pants", "HOA regulation book", "HOA zombie eyes", "HOA citation pad", "wriggling severed nose", "nosy nose ringy ring", "Mayor Ghost's toupee", "Mayor Ghost's cloak", "Mayor Ghost's khakis", "Mayor Ghost's gavel", "Mayor Ghost's sash", "Mayor Ghost's scissors", "ghost pepper", "Thunkula's drinking cap", "Drunkula's cape", "Drunkula's silky pants", "Drunkula's bell", "Drunkula's ring of haze", "Drunkula's wineglass", "bottle of Bloodweiser", "Unkillable Skeleton's skullcap", "Unkillable Skeleton's breastplate", "Unkillable Skeleton's shinguards", "Unkillable Skeleton's sawsword", "Unkillable Skeleton's shield", "Unkillable Skeleton's restless leg", "Staff of the Roaring Hearth", "electric Kool-Aid", "dread tarragon", "bone flour", "dreadful roast", "stinking agaricus", "Dreadsylvanian shepherd's pie", "intricate music box parts", "unwound mechanical songbird", "shiny brass tailfeathers", "wax banana", "complicated lock impression", "replica key", "Dreadsylvania Auditor's badge", "blood kiwi", "eau de mort", "bloody kiwitini", "moon-amber", "polished moon-amber", "moon-amber necklace", "Dreadsylvanian seed pod", "ghost pencil", "hangman's hood", "cursed ring finger ring", "Dreadsylvanian clockwork key", "cool iron ingot", "cool iron helmet", "cool iron breastplate", "cool iron greaves", "ghost shawl", "skull capacitor", "warm fur", "snowstick", "eerie fetish", "stinkwater", "dubious loincloth", "accidental mutton", "drafty drawers", "wolfskull mask", "guts necklace", "groping claw", "vengeful spirit", "BOOtonniere", "ghost thread", "bag of unfinished business", "transparent pants", "hothammer", "Thriller Ice", "grandfather watch", "muddy skirt", "antique spyglass", "vial of hot blood", "remorseless knife", "intimidating coiffure", "cod cape", "blood sausage", "frying brainpan", "old ball and chain", "old dry bone", "tailbone shield", "tonguebone", "pogo stick", "weedy skirt", "big pants", "Thwaitgold Goliath beetle statuette", "cooling iron helmet", "cooling iron breastplate", "cooling iron greaves", "hot cluster", "cold cluster", "spooky cluster", "stench cluster", "sleaze cluster", "phial of hotness", "phial of coldness", "phial of spookiness", "phial of stench", "phial of sleaziness", "adventurer clone egg", "mini-Mr. Accessory", "hand of Mr. Cards", "Dreadsylvanian hot pocket", "Dreadsylvanian cold pocket", "Dreadsylvanian spooky pocket", "Dreadsylvanian stink pocket", "Dreadsylvanian sleaze pocket", "Dreadsylvanian hot toddy", "Dreadsylvanian cold-fashioned", "Dreadsylvanian grimlet", "Dreadsylvanian dank and stormy", "Dreadsylvanian slithery nipple", "hot clusterbomb", "cold clusterbomb", "spooky clusterbomb", "stench clusterbomb", "sleaze clusterbomb", "Dreadsylvanian Almanac page", "length of old fuse", "dreadful box", "Clan hot dog stand", "vicious spiked collar", "ancient hot dog wrapper", "debonair deboner", "chicle de salchicha", "jar of frostigkraut", "gnawed-up dog bone", "Grey Guanon", "Engorged Sausages and You", "dream of a dog", "optimal spreadsheet", "defective Game Grid token", "hot Dreadsylvanian cocoa", "epic cluster", "intricate clockwork egg", "intricate clockwork birdhouse", "intricate clockwork disc", "intricate clockwork big hand", "intricate clockwork little hand", "intricate clockwork numeral I", "intricate clockwork numeral II", "intricate clockwork numeral III", "intricate clockwork numeral IV", "intricate clockwork numeral V", "intricate clockwork numeral VI", "intricate clockwork numeral VII", "intricate clockwork numeral VIII", "intricate clockwork numeral IX", "intricate clockwork numeral X", "intricate clockwork numeral XI", "intricate clockwork numeral XII", "intricate clockwork cuckoo", "cuckoo clock", "Cold One", "spaghetti breakfast", "over-the-shoulder Folder Holder", "folder (red)", "folder (blue)", "folder (green)", "folder (magenta)", "folder (cyan)", "folder (yellow)", "folder (smiley face)", "folder (wizard)", "folder (space skeleton)", "folder (D-Team)", "folder (Ex-Files)", "folder (skull and crossbones)", "folder (Knight Writer)", "folder (Jackass Plumber)", "folder (holographic fractal)", "folder (barbarian)", "folder (rainbow unicorn)", "folder (Seawolf)", "folder (dancing dolphins)", "folder (catfish)", "folder (tranquil landscape)", "folder (owl)", "folder (Stinky Trash Kid)", "folder (sports car)", "folder (sportsballs)", "folder (heavy metal)", "folder (Yedi)", "folder (KOLHS)", "slide rule", "Ogres and Oubliettes&trade; module", "Mountain Stream Code Black Alert", "twisted-up wet towel", "stepmom's booze", "surgical tape", "metal band T-shirt", "fountain 'soda'", "illegal firecracker", "pickelhaube", "hair oil", "scrap metal", "school spirit socket set", "miniature suspension bridge", "Staff of the Lunch Lady", "universal key", "world's most dangerous birdhouse", "deathchucks", "giant eraser", "quasireligious sculpture", "giant Faraday cage", "modeling claymore", "sticky clay homunculus", "sodium pentasomething", "grains of salt", "yellowcake bomb", "dirty stinkbomb", "superwater", "Thwaitgold bookworm statuette", "crude monster sculpture", "Yearbook Club Camera", "antique machete", "Cursed Punch", "Bowl of Scorpions", "Fog Murderer", "book of matches", "surgical mask", "head mirror", "half-size scalpel", "surgical apron", "bloodied surgical dungarees", "McClusky file (page 1)", "McClusky file (page 2)", "McClusky file (page 3)", "McClusky file (page 4)", "McClusky file (page 5)", "boring binder clip", "McClusky file (complete)", "bowling ball", "moss-covered stone sphere", "dripping stone sphere", "crackling stone sphere", "scorched stone sphere", "stone triangle", "tiny bowler", "imitation White Russian", "short-handled mop", "jungle floor wax", "smirking shrunken head", "colorful toad", "crude voodoo doll", "attorney's badge", "pygmy briefs", "short writ of habeas corpus", "bone abacus", "adder", "short calculator", "sphygmomanometer", "bag of pygmy blood", "tongue depressor", "compression stocking", "midriff scrubs", "pill cup", "cold water bottle", "pygmy phone number", "gold Boozehounds Anonymous token", "exotic jungle fruit", "Shore Inc. Ship Trip Scrip", "dude ranch souvenir crate", "tropical island souvenir crate", "ski resort souvenir crate", "UV-resistant compass", "funky junk key", "Worse Homes and Gardens", "old claw-foot bathtub", "old clothesline pole", "antique cigar sign", "junk junk", "Junk-Bond", "tangle of copper wire", "jagged scrap metal", "bent scrap metal", "molten scrap metal", "eternal car battery", "junk band", "junk trunks", "junk-mail shirt", "junk food", "junk yard", "swordzall", "arm buzzer", "boilgun", "Gordon Beer's Beer Garden Catalog", "packet of beer seeds", "handful of barley", "cluster of hops", "fancy beer bottle", "fancy beer label", "artisanal homebrew sampler", "can of Br&uuml;talbr&auml;u", "can of Drooling Monk", "can of Impetuous Scofflaw", "bottle of Old Pugilist", "bottle of Professor Beer", "bottle of Rapier Witbier", "bottle of Race Car Red", "bottle of Greedy Dog", "bottle of Lambada Lambic", "fancy tin beer can", "artisanal homebrew gift package", "liquid bread", "tin tam", "tin cup", "tin foil", "tin drum", "tin roof (rusted)", "tin snips", "tin lizzie", "foetid seal tear", "cold seal sweat", "boiling seal blood", "crystalline seal eye", "studded sealhide shield", "scabrous seal epaulets", "abyssal battle plans", "seal medal", "deanimated reanimator's coffin", "flask of embalming fluid", "blank diary", "boot knife", "broken beer bottle", "sharpened spoon", "candy knife", "soap knife", "disco horoscope (Aquarius)", "disco horoscope (Pisces)", "disco horoscope (Aries)", "disco horoscope (Taurus)", "disco horoscope (Gemini)", "disco horoscope (Cancer)", "disco horoscope (Leo)", "disco horoscope (Virgo)", "disco horoscope (Libra)", "disco horoscope (Scorpio)", "disco horoscope (Sagittarius)", "disco horoscope (Capricorn)", "The Sagittarian's leisure pants", "toy accordion", "antique accordion", "beer-battered accordion", "baritone accordion", "mama's squeezebox", "guancertina", "accordion file", "accord ion", "bone bandoneon", "pentatonic accordion", "non-Euclidean non-accordion", "Accordion of Jordion", "autocalliope", "accordionoid rocca", "pygmy concertinette", "ghost accordion", "peace accordion", "alarm accordion", "All-Hallow's Steve's fright wig", "KoL Con X Treasure Map", "discocktail", "KoL Con X Bingo Card", "Temporal Tempera Tube", "Tallowcreme Halloween Pumpkin", "Way More Tears&trade; pepper spray", "Milk Studs", "box of Dweebs", "bag of W&Ws", "PEEZ dispenser", "Swizzler", "Bugbearclaw Donut", "little red jam", "Whenchamacallit bar", "8-bit banana", "vial of blood simple syrup", "bone bons", "ironic mint", "unused walkie-talkie", "walkie-talkie", "killing jar", "security flashlight", "Effermint&trade; tablets", "sturdy cane", "huge bowl of candy", "Ultra Mega Sour Ball", "carton of rotten eggs", "desert sightseeing pamphlet", "a suspicious address", "Bal-musette accordion", "Cajun accordion", "quirky accordion", "Skipper's accordion", "Pantsgiving", "can of sardines", "high-calorie sugar substitute", "pat of butter", "dinner roll", "cold mashed potatoes", "whole turkey leg", "deviled egg", "finger exerciser", "dented spoon", "old love note", "old school beer pull tab", "nail file", "old candy wrapper", "gym membership card", "post-holiday sale coupon", "dry cleaning receipt", "pocket lint (blue)", "pocket lint (green)", "pocket lint (white)", "pocket lint (orange)", "bowl of petunias", "power sock", "wool sock", "moustache sock", "spirit gum", "spirit pillow", "spirit sheet", "spirit mattress", "spirit blanket", "spirit bed", "spirit bell", "spoonful of Linguine-Os", "freezer-burned frost-bitten tortellini", "blob of Alphredo&trade;", "handful of crafty noodles", "tangled mass of creepy pasta", "Can of Spaghetto", "Chef Boy, R&D's business card", "Thwaitgold ant statuette", "experimental carbon fiber pasta additive", "hazardous sauce dosimeter", "flask flops", "candied nuts", "candied bolts", "gingerbread robot", "petit 4.1", "nut-shaped Crimbo cookie", "tiny plastic GORM-8", "tiny plastic warbear", "tiny plastic Toybot", "tiny plastic warbear fortress", "tiny plastic K.R.A.M.P.U.S.", "warbear whosit", "warbear hoverbelt piecepart", "warbear hoverbelt", "warbear battery", "warbear badge", "warbear wardance potion", "warbear bearserker potion", "warbear liquid overcoat", "warbear feasting bread", "warbear warrior bread", "warbear thermoregulator bread", "warbear feasting mead", "warbear bearserker mead", "warbear blizzard mead", "warbear helm fragment", "warbear plain fedora", "warbear feathered fedora", "warbear fancy fedora", "warbear plain helm", "warbear spiked helm", "warbear electro-spiked helm", "warbear plain ushanka", "warbear lined ushanka", "warbear heated ushanka", "warbear trouser fragment", "warbear party pants", "warbear ceremonial party pants", "warbear high festival pants", "warbear battle greaves", "warbear officer greaves", "warbear bearserker greaves", "warbear long johns", "warbear fleece-lined long johns", "warbear electric long johns", "warbear accoutrements chunk", "warbear goggles", "warbear snowblindness goggles", "warbear polarized goggles", "warbear laser bowtie", "warbear plasma bowtie", "warbear nuclear bowtie", "warbear warscarf", "warbear fleece-lined warscarf", "warbear electric warscarf", "warbear requisition box", "warbear exo-arm", "warbear foil hat", "warbear energy bracers", "warbear oil pan", "warbear laser beacon", "warbear exhaust manifold", "warbear jackhammer drill press", "warbear auto-anvil", "warbear induction oven", "warbear chemistry lab", "warbear officer requisition box", "warbear empathy chip", "warbear drone assembler", "warbear breakfast machine assembler", "blind-packed die-cast metal toy", "tiny die-cast Bashful the Reindeer", "tiny die-cast Doc the Reindeer", "tiny die-cast Dopey the Reindeer", "tiny die-cast Grumpy the Reindeer", "tiny die-cast Happy the Reindeer", "tiny die-cast Sleepy the Reindeer", "tiny die-cast Sneezy the Reindeer", "tiny die-cast Zeppo the Reindeer", "tiny die-cast factory worker elf", "tiny die-cast gift-wrapping elf", "tiny die-cast middle-management elf", "tiny die-cast pencil-pusher elf", "tiny die-cast stocking-stuffer elf", "tiny die-cast Unionize the Elves Sign", "tiny die-cast CrimboTown Toy Factory", "tiny die-cast death ray in a pear tree", "tiny die-cast turtle mech", "tiny die-cast Swiss hen", "tiny die-cast killing bird", "tiny die-cast golden ring", "tiny die-cast goose a-laying", "tiny die-cast swarm a-swarming", "tiny die-cast blade a-spinning", "tiny die-cast arc-welding Elfborg", "tiny die-cast ribbon-cutting Elfborg", "tiny die-cast Rudolphus of Crimborg", "tiny die-cast Father Crimborg", "tiny die-cast Don Crimbo", "tiny die-cast Uncle Hobo", "tiny die-cast Father Crimbo", "The Smith's Tome", "Flaskfull of Hollow", "lump of Brituminous coal", "handful of Smithereens", "Every Day is Like This Sundae", "Miserable Pie", "This Charming Flan", "Irish Coffee, English Heart", "Strikes Again Bigmouth", "Paint A Vulgar Pitcher", "Golden Light", "Louder Than Bomb", "Handsome Devil", "Work is a Four Letter Sword", "Staff of the Headmaster's Victuals", "Sheila Take a Crossbow", "A Light that Never Goes Out", "Half a Purse", "Hairpiece On Fire", "Vicar's Tutu", "Hand in Glove", "Meat Tenderizer is Murder", "Ouija Board, Ouija Board", "Hand that Rocks the Ladle", "Saucepanic", "Frankly Mr. Shank", "Shakespeare's Sister's Accordion", "third-hand lantern", "loose purse strings", "pickled egg", "cup of lukewarm tea", "warbear soda machine assembler", "warbear black box", "warbear high-efficiency still", "warbear LP-ROM burner", "warbear gyrocopter", "warbear robo-camouflage unit", "warbear beeping telegram", "warbear procedural hilarity drone", "warbear metalworking primer", "warbear sequential gaiety distribution system", "glass slipper", "antimatter wad", "warbear superpotion", "warbear liquid lasers", "warbear rejuvenation potion", "broken warbear gyrocopter", "warbear gyro", "recording of Rolando's Rondo of Resisto", "warbear metalworking primer (used)", "warbear empathy chip (used)", "warbear drone codes", "breakfast mess", "warbear breakfast machine", "breakfast miracle", "Cloaca Cola Polar", "warbear soda machine", "festive warbear bank", "grimstone mask", "praying Grim Brother", "Grim Brothers' story book", "hibernating Grimstone Golem", "grim fairy tale", "grimstone galoshes", "single of Inigo's Incantation of Inspiration", "single of Donho's Bubbly Ballad", "Discontent&trade; Winter Garden Catalog", "packet of winter seeds", "snow berries", "ice harvest", "frost flower", "snow cleats", "liquid ice pack", "snow boards", "snow crab", "Ice Island Long Tea", "unfinished ice sculpture", "ice sculpture", "ice house", "snow machine", "snow mobile", "ice bucket", "snow shovel", "bod-ice", "snow belt", "ice nine", "snow fort", "En Una Fila Tequila", "Skully's hot chocolate", "warbear dress helmet", "warbear dress bracers", "warbear dress greaves", "sweatband", "gym shorts", "ankleweights", "sweat socks", "pint of sweat", "Jerks' Health&trade; Magazine", "Five Second Energy&trade;", "pixie axie", "sour powder", "licorice whip", "anise-flavored venom", "snakebite", "candy stick", "candied pecan", "pecan pie", "chocolate-stained collar", "candy mountain oyster", "chocotini", "chocolate rabbit's foot", "candy carrot", "candy carrot cake", "carrot-on-a-stick", "weasel stomping pants", "mulberry", "mulled berry wine", "lemony scales", "lemon party hat", "lemon shirt", "lemon drop trousers", "lemonhead caviar", "gummi sword", "small gummi fin", "chocolate cow bone", "gummi fang", "leftover canap&eacute;s", "magnum of fancy champagne", "silver cow creamer", "Outer Wolf&trade; cologne", "lupine appetite hormones", "wolf whistle", "witch's bread", "witch's brew", "witch's bra", "mid-level medieval mead", "R&uuml;mpelstiltz", "spinning wheel", "hi-octane carrot juice", "hare brush", "hare pin", "odd silver coin", "cinnamon cannoli", "expensive champagne", "polo trophy", "fancy oil painting", "solid gold rosary", "ornate dowsing rod", "straw", "leather", "clay", "filling", "parchment", "glass", "fire hose", "fireman's lunch", "plain paper hat", "ice cream sandwich", "&quot;honey&quot; dipper", "plumber's lunch", "skull gearshift knob", "nachos of the night", "Sketcherz&trade;", "can of Adultwitch&trade;", "smudge stick", "portable wall", "large tankard of ale", "scroll case", "jug of &quot;wine&quot;", "juggling ball", "crappy camera", "humble pie", "small golem", "shaking crappy camera", "crappy waiter disguise", "Copperhead Charm", "The First Pizza", "The Lacrosse Stick of Lacoronado", "The Eye of the Stars", "The Stankara Stone", "Murphy's Rancid Black Flag", "The Shield of Brook", "Red Zeppelin ticket", "Copperhead Charm (rampant)", "unnamed cocktail", "handful of tips", "unrequired jacket", "tommy gun", "drum of tommy ammo", "throwing knife", "throwing spoon", "throwing fork", "breadchucks", "shuriken salad", "combat fan", "red silk skirt", "blowdart", "Buddy Bjorn", "The Nuge's favorite crossbow", "sweet roll Alabama", "Saturday Night Special", "lynyrd snare", "fleetwood chain", "Green Manalishi", "black blade", "fire of unknown origin", "eagle's milk", "eagle feather", "one pill", "Jefferson wings", "fleetwood macaroni", "cheesy eagle sauce", "fleetwood mac 'n' cheese", "lynyrd skin", "lynyrdskin cap", "lynyrdskin tunic", "lynyrdskin breeches", "cigarette lighter", "priceless diamond", "Flamin' Whatshisname", "lynyrd musk", "Kashmir sweater", "custard pie", "tea for one", "bottle of Evermore", "red box", "red red wine", "red rum", "Murderer's Punch", "red velvet cake", "red letter", "red book", "red masque", "red-hot poker", "Red X Shield", "red badge", "red shirt", "red coat", "red shoe", "big red button", "red button", "red blood cells", "red eye", "glark cable", "Red Fox glove", "red foxglove", "Thwaitgold dragonfly statuette", "Sneaky Pete's leather jacket", "jug of Sneaky Pete's Mojo", "shot of Sneaky Pete's Mojo", "Anniversary Miniature Sword & Martini Guy", "really tiny cocktail shaker", "mini-martini", "smoke grenade", "molotov soda", "pile of ashes", "crate of firebombs", "firebomb", "Sneaky Pete's basket", "[7262]&quot;I Love Me, Vol. I&quot;", "photograph of a dog", "photograph of a red nugget", "photograph of an ostrich egg", "disposable instant camera", "Sneaky Pete's leather jacket (collar popped)", "Letter for Melvign the Gnome", "Professor What garment", "&quot;2 Love Me, Vol. 2&quot;", "Thinknerd Blind-Packed Toy", "tiny plastic Professor What", "tiny plastic Jared the Duskwalker", "tiny plastic Duke Starkiller", "tiny plastic Gary Claybender", "tiny plastic Captain Kerkard", "robot grease", "returned Thinknerd package", "wind-up Whatsian robot", "wind-up vampire teeth", "wind-up navigation droid", "wind-up owl", "wind-up ensign", "crying statue earrings", "plastic Duskwalker necklace", "plastic replica blaster pistol", "Gary Claybender's Time Screwer", "Space Tourist palmdoctor", "amok putter", "amok pudding", "deactivated putty buddy", "putty coat", "can of V-11", "elevennis shoes", "elevent", "elevenderizing hammer", "Professor What T-Shirt", "heavy-duty bendy straw", "pellet of plant food", "sewing kit", "Spookyraven billiards room key", "[7302]Spookyraven library key", "Lady Spookyraven's necklace", "telegram from Lady Spookyraven", "Lady Spookyraven's powder puff", "Lady Spookyraven's finest gown", "Lady Spookyraven's dancing shoes", "old eyebrow pencil", "old rosewater cream", "old bronzer", "elegant nightstick", "still grill", "box of hickory chips", "dusty poppet", "rickety rocking horse", "antique jack-in-the-box", "jar of baby ghosts", "ghost of a necklace", "Elizabeth's Dollie", "Elizabeth's paintbrush", "Stephen's lab coat", "Stephen's secret formula", "Jacob's rung", "haunted battery", "electric snakebite", "rubber ribcage", "synthetic marrow", "funny bone", "half-melted spoon", "the funk", "gunky chicken", "creepy doll head", "droopy doll eye", "creepy voice box", "haunted paddle-ball", "spooky sound effects record", "spooky alphabet block", "tiny dancer", "spooky music box mechanism", "moose antlers", "moose thought", "moose chocolate", "painting of a glass of wine", "ancient oil painting of yourself", "ornate picture frame", "doll-eye amulet", "ghost toga", "sheet cake", "ghost key", "picture of you", "Staff of the Electric Range", "deluxe layer cake", "chunk of hot iron", "red-hot boilermaker", "coal shovel", "hot coal", "coal dust", "Bram's choker", "plaid swatch", "plaid bandage", "plaid pocket square", "plaid skirt", "bloodstain stick", "fabric softener", "fabric hardener", "bottle of laundry sherry", "industrial strength starch", "extra-flat panini", "mangled finger", "Psychotic Train wine", "crazy hobo notebook", "pie man was not meant to eat", "sommelier's towel", "tarnished tastevin", "actual tapas", "ghast iron ingot", "ghast iron cleaver", "ghast iron Garibaldi", "ghast iron heater shield", "ghast iron codpiece", "Pendant of Gargalesis", "Little Geneticist DNA-Splicing Lab", "DNA extraction syringe", "Gene Tonic: Dude", "Gene Tonic: Beast", "Gene Tonic: Construct", "Gene Tonic: Undead", "Gene Tonic: Humanoid", "Gene Tonic: Insect", "Gene Tonic: Hippy", "Gene Tonic: Orc", "Gene Tonic: Demon", "Gene Tonic: Horror", "Gene Tonic: Fish", "Gene Tonic: Goblin", "Gene Tonic: Pirate", "Gene Tonic: Plant", "Gene Tonic: Weird", "Gene Tonic: Elf", "Gene Tonic: Mer-kin", "Gene Tonic: Slime", "Gene Tonic: Penguin", "Gene Tonic: Elemental", "Gene Tonic: Constellation", "Gene Tonic: Hobo", "Steam Card: Dungeon Fist (#1)", "Steam Card: Dungeon Fist (#2)", "Steam Card: Dungeon Fist (#3)", "Steam Card: Space Trip (#1)", "Steam Card: Space Trip (#2)", "Steam Card: Space Trip (#3)", "Steam Card: Meteoid (#1)", "Steam Card: Meteoid (#2)", "Steam Card: Meteoid (#3)", "Steam Card: DemonStar (#1)", "Steam Card: DemonStar (#2)", "Steam Card: DemonStar (#3)", "Steam Card: Jackass Plumber (#1)", "Steam Card: Jackass Plumber (#2)", "Steam Card: Jackass Plumber (#3)", "pencil thin mushroom", "Paradaisical Cheeseburger recipe", "salty sailor salt", "bike rental broupon", "Taco Dan's Taco Stand Cocktail Sauce Bottle", "sprinkle shaker", "sleight-of-hand mushroom", "Taco Dan's Taco Stand's Taco Receipt", "Beach Buck", "Fun-Guy spore", "Boletus Broletus mushroom", "Omphalotus Omphaloskepsis mushroom", "Gyromitra Dynomita mushroom", "Helvella Haemophilia mushroom", "Stemonitis Staticus mushroom", "Tremella Tarantella mushroom", "Pastaco shell", "Beefy Crunch Pastaco", "Brain Food Pastaco", "Cool Brunch Pastaco", "Medical Pastaco", "Energy Buzz Pastaco", "Ludovico Pastaco", "overpowering mushroom wine", "complex mushroom wine", "smooth mushroom wine", "blood-red mushroom wine", "buzzing mushroom wine", "swirling mushroom wine", "Taco Dan's Basic Taco Dan Taco", "Taco Dan's Taco Fish Fish Taco", "Taco Dan's Super Taco-Riffic Taco Sauce!", "regular-size brogurt", "super-size brogurt", "broberry brogurt", "brocolate brogurt", "French bronilla brogurt", "History's Most Offensive Jokes, Vol. IX", "Now You're Cooking With Grease", "Sloppy Seconds Diner Employee Handbook", "industrial strength anti-fungal spray", "Brogre brorts", "Brogre brolo shirt", "Brogre bucket hat", "Spring Break Beach tattoo coupon", "airplane charter: Spring Break Beach", "one-day ticket to Spring Break Beach", "8-billed baseball cap", "extremely wet T-shirt", "giant shrimp fork", "BROS Energy Drink", "go-go potion", "shrimp cocktail", "Yolo&trade; chocolates", "string of moist beads", "Ultimate Mind Destroyer", "Meat-inflating powder", "possessed sugar cube", "sugar fairy", "sugar bunny", "sweet tooth", "Rompedores de Fantasmas", "La Fantasma y La Oscuridad", "Fantasma en la M&aacute;quina", "loosening powder", "powdered castoreum", "drain dissolver", "triple-distilled turpentine", "detartrated anhydrous sublicalc", "triatomaceous dust", "bottle of Chateau de Vinegar", "blasting soda", "unstable fulminate", "wine bomb", "recipe: mortar-dissolving solution", "bottled day", "ghost formula", "Thwaitgold wheel bug statuette", "Hot 'n' Scarys", "black map", "black gold", "Texas tea", "dark hamethyst ring", "dark baconstone ring", "dark porquoise ring", "little black book", "black cloak", "black label", "Mornington crescent roll", "black eye shadow", "crumbling wooden wheel", "poppy", "opium grenade", "duonoculars", "plastic rock", "witch's spare house key", "giant spider leg", "wand of pigification", "glass of bourbon", "burned government manual fragment", "government cheese", "pair of government shades", "space junk", "government", "alien drugs", "weird space book", "alien force field disruptor bean", "government-issued night-vision goggles", "loaf of alien bread", "grilled cheese sandwich", "alien protein powder", "rocket fuel", "alien source code printout", "alien source code printout (used)", "stealth bomber", "space beast fur", "twitching space egg", "ramekin of space nuts", "space beast fur hat", "space beast fur pants", "space beast fur whip", "space invader", "space heater", "space bar", "space port", "space needle", "buffed alien drugs", "hot ashes", "ash soda", "liquid smoke", "dollop of barbecue sauce", "bowl of marinade", "shaker of dry rub", "bottle of lighter fluid", "white page", "white elephant gift", "white blood cells", "white wine", "gummi turtle", "turtle-shaped rock", "giraffe-necked turtle", "musk turtle", "programmable turtle", "mocking turtle", "ham steak", "time-twitching toolbelt", "Chroner", "Time Lord Badge of Honor", "Time Bandit Badge of Courage", "Friendliness Beverage", "silent pea shooter", "D roll", "kiwi beak", "New Zealand iced tea", "droll monocle", "future drug: Muscularactum", "future drug: Smartinex", "future drug: Coolscaline", "twitching time capsule", "liquid shifting time weirdness", "solid shifting time weirdness", "rack of dinosaur ribs", "scotch on the rocks", "yabba dabba doo rag", "wooly loincloth", "strange helix fossil", "S.S. Ticket", "Clan speakeasy", "glass of &quot;milk&quot;", "cup of &quot;tea&quot;", "thermos of &quot;whiskey&quot;", "Lucky Lindy", "Bee's Knees", "Sockdollager", "Ish Kabibble", "Hot Socks", "Phonus Balonus", "Flivver", "Sloppy Jalopy", "haunted flame", "temporary yak tattoo", "Fitspiration&trade; poster", "giant neckbeard", "artisanal hand-squeezed wheatgrass juice", "punk patch", "steampunk potion", "vial of swamp vapors", "turtle mud", "Redeye&trade; Eyedrops", "Dweebisol&trade; inhaler", "Lewd Lemmy Hair Oil", "tomato soup poster", "bubblin' chemistry solution", "voodoo glowskull", "pygmy adder oil", "pygmy witchhazel", "short deposition", "straw pole", "electric copperhead potion", "ninja fear powder", "ninja eyeblack", "button rouge", "Red Army camouflage kit", "lynyrd skinner toothblack", "flask of rainwater", "blue oyster badge", "plastic Jefferson wings", "dancing fan", "page of the Necrohobocon", "black magic powder", "black friar's tonsure", "government-issue identification badge", "alien hologram projector", "irradiated turtle", "cigar box turtle", "shellacked shell", "pillow shell", "whatsit-covered turtle shell", "oil shell", "frozen turtle shell", "shocked shell", "ingot turtle", "heavy duty umbrella", "pool skimmer", "miniature life preserver", "lightning milk", "aquaconda brain", "thunder thigh", "gourmet gourami oil", "catfish whiskers", "freshwater fishbone", "fishbone catcher's mitt", "fishbone kneepads", "fishbone corset", "fishbone fins", "fishbone facemask", "fishbone belt", "fishbone bracers", "neoprene skullcap", "goblin water", "dumb mud", "Sogg-Os", "Lord Soggyraven's Slippers", "Ancient Protector Soda", "liquid ice", "Wet Russian", "filet of The Fish", "Thwaitgold spider statuette", "thunder down underwear", "famous blue raincoat", "lightning rod", "law-abiding citizen cane", "legitimate business on the beach", "hep waders", "jive turkey leg", "birdbone corset", "candy cigarette", "4-dimensional fez", "throwing candy", "super-absorbent tarp", "unquiet spirits", "banjo kazoo mount", "blue grass", "Time Lord Participation Mug", "Time Bandit Time Towel", "Caveman Dan's favorite rock", "dog ointment", "gumshoes", "flapper floppers", "sneakeasies", "plastic nunchaku", "sticky hand whip", "glow-in-the-dark necklace", "Groll doll", "cap gun", "portable cassette player", "chewable paper", "rubber spider", "&quot;KICK ME&quot; sign", "confiscated comic book", "confiscated cell phone", "confiscated love note", "LCD game: Food Eater", "LCD game: Garbage River", "LCD game: Burger Belt", "The Confiscator's Grimoire", "rubber nubbin", "rubber cape", "Thor's Pliers", "candy UFOs", "water wings for babies", "beautiful rainbow", "Strix stix", "vampire pellet", "non-aged vinegar", "unsanitized scalpel", "gladiator tunica", "Roman sadnals", "madius", "radiator heater shield", "salt wages", "centurion helmet", "Chroner cross", "pteruges", "Bruno's blessing of Mars", "Dennis's blessing of Minerva", "Burt's blessing of Bacchus", "Freddie's blessing of Mercury", "Chroner trigger", "Xi Receiver Unit", "transmission from planet Xi", "Black Bart's Booty", "Xiblaxian circuitry", "Xiblaxian polymer", "Xiblaxian alloy", "Xiblaxian crystal", "Xiblaxian holo-wrist-puter simcode", "Xiblaxian cache locator simcode", "Xiblaxian holo-training simcode", "Xiblaxian direct marketing simcode", "Xiblaxian holo-buddy simcode", "Xiblaxian encrypted political prisoner", "Xiblaxian holo-schematic: stealth cowl", "Xiblaxian holo-schematic: stealth trousers", "Xiblaxian holo-schematic: stealth vest", "Xiblaxian holo-schematic: ultraburrito", "Xiblaxian holo-schematic: space whiskey", "Xiblaxian holo-schematic: residence cube", "Xiblaxian holo-schematic: xeno-goggles", "Xiblaxian 5D printer", "Xiblaxian holo-bowtie", "Xiblaxian xeno-detection goggles", "Xiblaxian stealth cowl", "Xiblaxian stealth trousers", "Xiblaxian stealth vest", "Xiblaxian ultraburrito", "Xiblaxian space-whiskey", "Xiblaxian residence-cube", "They liver", "They liver popsicle", "holo-tank", "holo-bomber", "holo-platoon", "residual zeal", "Xiblaxian holo-wrist-puter", "defective Golden Mr. Accessory", "airplane charter: Conspiracy Island", "one-day ticket to Conspiracy Island", "Coinspiracy", "Personal Ventilation Unit", "the most dangerous bait", "&quot;meat&quot; stick", "transdermal smoke patch", "specialty ammo bandolier", "pair of plants", "Sasq&trade; watch", "smoker's cloak", "camouflage T-shirt", "experimental serum G-9", "heavy-duty clipboard", "battery-powered drill", "limp broccoli", "giant yellow hat", "monkey barf", "delicious candy", "jangly bracelet", "cuddly teddy bear", "ice-cold Cloaca Zero", "first-aid pouch", "khaki duffel bag", "airborne mutagen", "SHAWARMA Initiative Keycard", "bottle-opener keycard", "Armory keycard", "initiative shawarma", "warm war shawarma", "karma shawarma", "Jungle Juice", "Amnesiac Ale", "Highest Bitter", "mercenary pistol", "mercenary rifle", "Merc Core Field Manual: Sanity Maintenance", "Merc Core Field Manual: Intimidation Techniques", "Merc Core challenge coin", "Merc Core deployment orders", "TI-9000 calculator", "unused soap", "impure gasoline", "Z-Bone steak", "viral DNA", "tarnished bottlecap", "seared dino steak", "bottle of drinkin' gas", "handful of napalm", "dove DNA", "gelatinous meat mass", "99.44% pure math", "simple AI", "corrupted bird DNA", "sentient meat mass", "zombie dinosaur egg", "french-fry grabber", "iShield", "white earbuds", "iFlail", "unidentifiable dried fruit", "flat cider", "trench lighter", "experimental serum P-00", "military-grade fingernail clippers", "encrypted micro-cassette recorder", "gore bucket", "pack of smokes", "ESP suppression collar", "GPS-tracking wristwatch", "Project T. L. B.", "Agent Mauve", "special clip: tracers", "special clip: wailers", "special clip: squelchers", "special clip: splatterers", "special clip: boneburners", "special clip: graveburpers", "perl necklace", "Fudge Fiber Armor Plating", "ruby on canes", "petit fortran", "java cookie", "cookie cookie", "tiny plastic exo-suited miner", "tiny plastic semi-autonomous drill unit", "tiny plastic ambulatory robo-minecart", "tiny plastic Crimbot", "tiny plastic Crimbomega", "flask of mining oil", "radiation-resistant helmet", "servo-assisted exo-pants", "high-energy mining laser", "peppermint tailings", "nugget of Crimbonium", "cylindrical mold", "Crimbonium fuel rod", "Petite Paintbrush", "Crimbot schematic: Gun Face", "Crimbot schematic: Big Head", "Crimbot schematic: Security Chassis", "Crimbot schematic: Military Chassis", "Crimbot schematic: Crab Core", "Crimbot schematic: Dynamo Head", "Crimbot schematic: Cyclopean Torso", "Crimbot schematic: Really Big Head", "Crimbot schematic: Nerding Module", "Crimbot schematic: Refrigerator Chassis", "Crimbot schematic: Bug Zapper", "Crimbot schematic: Rodent Gun", "Crimbot schematic: Rivet Shocker", "Crimbot schematic: Mega Vise", "Crimbot schematic: Mobile Girder", "Crimbot schematic: Swiss Arm", "Crimbot schematic: Data Analyzer", "Crimbot schematic: Maxi-Mag Lite", "Crimbot schematic: Bit Masher", "Crimbot schematic: Camera Claw", "Crimbot schematic: Power Arm", "Crimbot schematic: Wrecking Ball", "Crimbot schematic: Ribbon Manipulator", "Crimbot schematic: Power Stapler", "Crimbot schematic: Grease Gun", "Crimbot schematic: Grease / Regular Gun", "Crimbot schematic: Snow Blower", "Crimbot schematic: Cold Shoulder", "Crimbot schematic: Candle Lighter", "Crimbot schematic: Lamp Filler", "Crimbot schematic: Heavy-Duty Legs", "Crimbot schematic: Tripod Legs", "Crimbot schematic: Rollerfeet", "Crimbot schematic: Sim-Simian Feet", "Crimbot schematic: High-Speed Fan", "Crimbot schematic: Big Wheel", "Crimbot schematic: Hoverjack", "Crimbot schematic: Gun Legs", "Crimbot schematic: Heavy Treads", "Crimbot schematic: Rocket Skirt", "recovered elf magazine", "recovered elf toothbrush", "recovered elf sleeping pills", "recovered elf underpants", "recovered elf wallet", "recovered elf pocketwatch", "recovered elf photo album", "recovered elf smartphone", "Size XI Wizard's Robe", "Bit O' Quail Spleen", "Take Eleven Bar", "mimeplasm", "BOOterfinger", "Moonds", "Big Punk", "fist turkey outline", "brass turkey knuckles", "Friendly Turkey", "Agitated Turkey", "Ambitious Turkey", "neutron lollipop", "gamma nog", "sneaky wrapping paper", "Thwaitgold nit statuette", "picky tweezers", "Crimbo Credit", "single atom", "Time Cape", "Time Cloak", "sleeve deuce", "pocket ace", "nastygeist", "gold tooth", "portable table", "outlaw bandana", "whiskey in a broken glass", "shot of mescal", "glass of herbal tequila", "minin' dynamite", "plaid cowboy hat", "spooky lasso", "rusted-out shootin' iron", "rattler rattle", "big bag of money", "Crimbo sapling", "even more tinsel", "box of old Crimbo decorations", "letter to Ed the Undying", "copy of a jerk adventurer's father's diary", "[7961]Staff of Ed", "[7962]Eye of Ed", "[7963]ancient amulet", "[7964]Staff of Fats", "[7965]Holy MacGuffin", "Ka coin", "World's Best Adventurer sash", "topiary nugglet", "beehive", "electric boning knife", "Aggressive Carrot", "mummified fig", "mummified loaf of bread", "mummified beef haunch", "linen bandages", "cotton bandages", "silk bandages", "holy spring water", "spirit beer", "sacramental wine", "talisman of Thoth", "ancient cure-all", "Sister Accessory", "Boosty Juice", "polyester parachute", "polyester pad", "polyester peeler", "polyester pettipants", "polyester panama hat", "polyester pulsera", "porcelain police baton", "porcelain plus-fours", "porcelain porkpie", "porcelain pepper mill", "porcelain pelerine", "porcelain phantom mask", "polyesterene powder", "porcelain powder", "choco-Crimbot", "smart watch", "augmented-reality shades", "toy Crimbot mega face", "toy Crimbot power glove", "toy Crimbot super fist", "toy Crimbot rocket legs", "Crimbot battery", "Crimbot ROM: Rapid Prototyping", "Crimbot ROM: Mathematical Precision", "Crimbot ROM: Ruthless Efficiency", "Mini-Crimbot crate", "heavy-duty Crimbot aerial", "Crimbomega drive chain", "Crimbot ROM: Rapid Prototyping (dirty)", "Crimbot ROM: Mathematical Precision (dirty)", "Crimbot ROM: Ruthless Efficiency (dirty)", "fitness wristband", "flask of tainted mining oil", "red and green rain stick", "Chateau Mantegna room key", "Choco-Mint patty", "hot mint schnocolate", "homeopathic mint tea", "electric muscle stimulator", "foreign language tapes", "bowl of potpourri", "ceiling fan", "antler chandelier", "artificial skylight", "Swiss piggy bank", "continental juice bar", "fancy stationery set", "fancy calligraphy pen", "alpine watercolor set", "tope&eacute;", "topiary tights", "topiary necktie", "bowl of topioca", "topiary skunk", "topiary noseplugs", "trusty whip", "crumbling skull", "[8042]rock", "pot", "spelunking fedora", "sturdy machete", "shotgun", "boomerang", "mining helmet", "X-ray goggles", "yellow cape", "jetpack", "spring boots", "spiked boots", "heavy pickaxe", "torch", "[spelunking test kit]", "plasma rifle", "Bananubis's Staff", "The Joke Book of the Dead", "The Clown Crown", "cursed coffee cup", "Tales of Spelunking", "golden monkey statuette", "golden banana", "powdered gold", "gold nuggets", "Professor of Spelunkology", "Stembridge sidearm", "warehouse map page", "warehouse inventory page", "janitor sponge", "Spelunker of Fortune", "Spelunker's fedora", "Spelunker's whip", "Spelunker's khakis", "Spelunker's Guild prize sack", "LOLmec statuette", "Spelunker of Fortune (used)", "still-beating spleen", "Thwaitgold scarab beetle statuette", "solid gold jewel", "headless sparrow", "mangled squirrel", "rat carcass", "wicker kickers", "wicker slicker", "wicker knickers", "wicker ticker", "wicker sticker", "wicker clicker", "wickerbits", "bakelite belt", "bakelite badge", "bakelite bowl", "bakelite brooch", "bakelite breeches", "bakelite backpack", "bakelite bits", "aerogel anvil", "aerogel akubra", "aerogel apron", "aerogel ascot", "aerogel attache case", "aerogel accordion", "aerosolized aerogel", "wrought-iron wig", "wrought-iron winch crank", "wrought-iron widget", "wrought-iron whisk", "wrought-iron walker", "wrought-iron waders", "wrought-iron flakes", "gabardine gaiters", "gabardine garland", "gabardine gunnysack", "gabardine garibaldi", "gabardine girdle", "gabardine gloves", "gabardine smithereens", "fiberglass fetish", "fiberglass foil", "fiberglass fannypack", "fiberglass frock", "fiberglass fingerguard", "fiberglass fedora", "fiberglass fibers", "bottle of lovebug pheromones", "winged yeti fur", "talisman of Renenutet", "rubber spatula", "wooden spoon", "crystalline reamer", "macroplane grater", "bastard baster", "obsidian nutcracker", "talisman of Seshat", "glass eye", "invisible potion", "time shuriken", "ninjammies", "Glo-Pop", "sugar sphere", "Shrubble Bubble", "polyeaster egg", "porcelain candy dish", "Spechunky bar", "talisman of Horus", "check to the Meatsmith", "Skeleton Store office key", "bone with a price tag on it", "half of a gold tooth", "mouse skull", "really thick spine", "oversized skullcap", "three-legged pants", "remaindered axe", "low-budget shield", "cr&ecirc;epy mask", "magical baguette", "glob of enchanted icing", "ginger snaps", "mostly-broken sunglasses", "unflavored wine cooler", "carton of snake milk", "sewer snake", "pigeon egg", "jaunty feather", "premium malt liquor", "brown paper pants", "brown paper bag mask", "ring of telling skeletons what to do", "breadwand", "loafers", "Map to Kokomo", "bread basket", "Ed the Undying exhibit crate", "The Crown of Ed the Undying", "Doc Galaktik's Invigorating Tonic", "map to a hidden booze cache", "Cherrytastrophe wine cooler", "Radberry Rip wine cooler", "Orangemageddon wine cooler", "Breakfast Blast wine cooler", "Citrus Crush wine cooler", "plain bagel", "glob of cream cheese", "loaf of soda bread", "acceptable bagel", "standard-issue cupcake", "ultra-deluxe cupcake", "hypnotic breadcrumbs", "popular tart", "no-handed pie", "Doc Galaktik's Vitality Serum", "airplane charter: Dinseylandfill", "one-day ticket to Dinseylandfill", "FunFunds&trade;", "expensive camera", "cheap sunglasses", "How to Avoid Scams", "filthy child leash", "bag of gross foreign snacks", "bag of park garbage", "grogpagne", "dirty rigging rope", "nasty snuff", "sewage-clogged pistol", "beard incense", "perfume-soaked bandana", "toxic globule", "toxo", "Lemonade-235", "isotophat", "Three Mile Island shorts", "toxic mop", "inert sludgepuppy", "lead collar", "jar of swamp honey", "backwoods banjo", "grody jug", "ratskin pajama pants", "turtle voicebox", "fake washboard", "Dinsey's oculus", "Dinsey's radar dish", "Dinsey's pizza cutter", "Dinsey's brain", "Dinsey's glove", "Dinsey's pants", "brain preservation fluid", "keycard &alpha;", "keycard &beta;", "keycard &gamma;", "keycard &delta;", "complimentary Dinsey refreshments", "lube-shoes", "trash net", "Dinsey mascot mask", "Dinsey food-cone", "Dinsey Whinskey", "Dinsey face paint", "stinky fannypack", "garbage sticker", "hazmat helmet", "Scratch-and-Sniff Guide to Dinseylandfill", "Trash, a Memoir", "Dinsey Maintenance Manual", "Dinsey tattoo kit", "nasty gum", "Wart Dinsey: An Afterlife", "The Lot's engagement ring", "portable Mayo Clinic", "Mayonex", "Mayodiol", "Mayostat", "Mayozapine", "Mayoflex", "miracle whip", "sphygmayomanometer", "tomayohawk-style reflex hammer", "mayo lance", "unappetizing mayolus", "uninteresting mayolus", "acceptable mayolus", "enticing mayolus", "mouth-watering mayolus", "newly-hatched mayonnaise wasp", "mayo pump", "Essence of Bear", "Afternoon Delight", "Kokomo Resort Chip", "Golden Kokomo Resort Chip", "Kokomo Resort Brand Suntan Oil", "Kokomo Resort Order Pad", "The Cocktail Shaker", "Kokomo Resort Pass", "Mayo Minder&trade;", "Mayo de Mayo&trade; mayo", "yellow puck", "kill screen", "orange boxing gloves", "dice ring", "dice belt buckle", "dice-print pajama pants", "dice-shaped backpack", "dice-print do-rag", "dice sunglasses", "Thwaitgold caterpillar statuette", "powdered dice", "yellow pixel", "pixel coin", "power pill", "pixel star", "pixel banana", "pixel beer", "yellow puck with a bow on it", "blue pumps", "sludgesicle", "&Uuml;berraschthexengebr&auml;u", "piggy tattoo", "baggie of regular-sized tardigrades", "little red .epub file", "BUBBLE GUM", "hustler shades", "spicy jerky stick", "costume rental shop", "muscle oil", "bottle of Red-Out", "pickpocket protector", "sinister-looking cat", "jazzy cigarette holder", "one glove", "leather glove", "handful of fire", "Cracklin' Oat Bran", "disposable lighter", "coal contact lenses", "conjured ice cream", "Iceberglar scarf", "icy hairspray", "smellbook", "assassin's cheese knife", "filthy armor", "plague pie", "batarang", "spare neck bolts", "grease trap", "shamanic ham", "porkpocket", "Leonard's glasses", "warehouse walkie-talkie", "janitor's mop", "warehouse clerk's glasses", "baloney rotgut", "carton of gaspers", "bronze polish", "crident", "totally sweet mohawk helmet", "spray chrome", "filthy monkey head", "hand of cards", "damp bar rag", "lump of goofball ore", "skeleton beans", "grimy lab coat", "creepy nursery rhyme", "iron torso box", "mercenary headband", "radioactive spider venom", "x-ray mirror", "wrestling mask", "hawkface potion", "child-sized dracula cloak", "devil-summoning hat", "shopkeeper beard", "alien autoautopsy kit", "novelty fruit hat", "invisibility cream", "handful of stubble", "garbage juice slurpee", "plunge-leg", "funky eyepatch", "bucket of fish juice", "flashy pirate dreadlocks", "captured boozles", "drinks tray", "eyebrow lifter", "yellow submarine", "pixel lemon", "pixel daiquiri", "miniature power pill", "yellow pixel potion", "Pack of Every Card", "Deck of Every Card", "popular part", "bubblegum heart", "cubic zirconia", "valuable coin", "white mana", "black mana", "red mana", "green mana", "blue mana", "gift card", "hermit factoid", "The Emperor's dry cleaning", "The Emperor's new hat", "The Emperor's new shirt", "The Emperor's new pants", "lead pipe", "rope", "wrench", "candlestick", "knife", "revolver", "1952 Mickey Mantle card", "talking spade", "savory dry noodles", "pestopiary", "ectoplasmic orbs", "crudles", "agnolotti arboli", "spaghetti with ghost balls", "succulent marrow", "salacious crumbs", "fusilli marrownarrow", "suggestive strozzapreti", "Mountain Stream gastrique", "Mt. McLargeHuge oyster", "oyster sauce", "linguini immondizia bianco", "shells a la shellfish", "Jick's autograph", "high-temperature mining drill", "unsmoothed velvet", "1,970 carat gold", "New Age healing crystal", "Volcoino", "fizzing spore pod", "paisley spore pod", "veiny spore pod", "hard spore pod", "glowing spore pod", "hot spore pod", "cool spore pod", "jingling spore pod", "red LavaCo Lamp&trade;", "blue LavaCo Lamp&trade;", "green LavaCo Lamp&trade;", "thin gold wire", "insulated gold wire", "empty lava bottle", "full lava bottle", "viscous lava globs", "red lava globs", "blue lava globs", "green lava globs", "SMOOCH bottlecap", "uncapped red lava bottle", "uncapped blue lava bottle", "uncapped green lava bottle", "capped red lava bottle", "capped blue lava bottle", "capped green lava bottle", "heat-resistant sheet metal", "LavaCo&trade; Lamp housing", "glowing New Age crystal", "crystalline light bulb", "broken high-temperature mining drill", "high-temperature mining mask", "fireproof megaphone", "mineapple", "Gold Velvet&trade; whiskey", "SMOOCH soda", "smelted roe", "lavawater", "basaltamander tongue", "lavalarva", "lava balaclava", "basaltamander buckler", "sticky lava globs", "gooey lava globs", "lava-proof pants", "heat-resistant necktie", "heat-resistant gloves", "very hot lunch", "asbestos thermos", "liquid rhinestones", "disco biscuit", "Quaatorade&trade;", "biker's hat", "feathered headdress", "electrician's hardhat", "Lava Miner's Daughter", "Psycho From The Heat", "The Firegate Tapes", "&quot;DEBBIE&quot; tattoo kit", "one-day ticket to That 70s Volcano", "airplane charter: That 70s Volcano", "Manual of Numberology", "New Age hurting crystal", "smooth velvet pants", "smooth velvet shirt", "smooth velvet hat", "smooth velvet pocket square", "smooth velvet socks", "smooth velvet hanky", "The One Mood Ring", "Mr. Choch's bone", "Mr. Cheeng's 'stache", "Saturday Night thermometer", "the tongue of Smimmons", "Raul's guitar pick", "Pener's crisps", "signed deuce", "Lavalos core", "half-melted hula girl", "glass ceiling fragments", "SMOOCH coffee cup", "labrador cookie", "Mr. Cheeng's spectacles", "grease cannon", "demon makeup kit", "love", "Pener's drumstick", "little deuce cape", "Lavalos's shell", "smooth velvet bra", "SMOOCH bracers", "SMOOCH kneepads", "SMOOCH spaulders", "SMOOCH codpiece", "SMOOCH breastplate", "superduperheated metal", "fused fuse", "superheated metal", "lava cake", "pink slime", "Devil's Elbow Hot Sauce", "Special&trade; Sauce", "devil hair pasta", "spagecialetti", "Salsa Libre", "good gravy", "illicit fish sauce", "libertagliatelle", "turkish mostaccioli", "linguini of the sea", "Hersey&trade; SMOOCH", "Alexy sauce", "rainbow sauce", "drug cocktail sauce", "Fettris", "fusillocybin", "prescription noodles", "blood-drive sticker", "bag of grain", "pocket maze", "shady shades", "squeaky toy rose", "weird gazelle steak", "sausage without a cause", "silver face paint", "emergency margarita", "vintage smart drink", "a ten-percent bonus", "Thwaitgold termite statuette", "The Emperor's new cookie", "Wickers bar", "bakelite-covered bacon", "Aerheads", "Wrotz", "Gabarbar", "fiberglass insulation", "shrine to the Barrel god", "barrel lid", "barrel hoop earring", "bankruptcy barrel", "little firkin", "normal barrel", "big tun", "weathered barrel", "dusty barrel", "disintegrating barrel", "moist barrel", "rotting barrel", "mouldering barrel", "barnacled barrel", "bottle of Amontillado", "barrel-aged martini", "barrel pickle", "barrel cracker", "vibrating mushroom", "cute mushroom", "KoL Con 12-gauge", "Golden Mr. Eh?", "barrel gun", "tiny barrel", "barrel beryl", "water log", "barrelhead", "bottoms of the barrel", "chest barrel", "brass bung spigot", "double barreled barrel gun", "triple barreled barrel gun", "barrel beryl choker", "barrel beryl nose ring", "barrel beryl ring", "map to the Biggest Barrel", "potted tea tree", "cuppa Flamibili tea", "cuppa Yet tea", "cuppa Boo tea", "cuppa Nas tea", "cuppa Improprie tea", "cuppa Frost tea", "cuppa Toast tea", "cuppa Net tea", "cuppa Proprie tea", "cuppa Morbidi tea", "cuppa Chari tea", "cuppa Serendipi tea", "cuppa Feroci tea", "cuppa Physicali tea", "cuppa Wit tea", "cuppa Neuroplastici tea", "cuppa Dexteri tea", "cuppa Flexibili tea", "cuppa Impregnabili tea", "cuppa Obscuri tea", "cuppa Irritabili tea", "cuppa Mediocri tea", "cuppa Loyal tea", "cuppa Activi tea", "cuppa Cruel tea", "cuppa Alacri tea", "cuppa Vitali tea", "cuppa Mana tea", "cuppa Monstrosi tea", "cuppa Twen tea", "cuppa Gill tea", "cuppa Uncertain tea", "cuppa Voraci tea", "cuppa Sobrie tea", "cuppa Royal tea", "cuppa Craft tea", "cuppa Insani tea", "Royal scepter", "haunted doghouse", "Ghost Dog Chow", "bowl of eyeballs", "bowl of mummy guts", "bowl of maggots", "blood and blood", "Jack-O-Lantern beer", "zombie", "Telltale&trade; rubber heart", "wind-up spider", "plastic nightmare troll", "tennis ball", "heavy crown", "ear poison", "stink-penny", "hawk", "hamlet sandwich", "Othello's military jacket", "Othello's dagger", "Othello's handkerchief", "bowl of Jeal-O", "grip key", "How to Play Othello", "ghostly dagger", "ghost beer", "portable Othello set", "rotten tomato", "Twelve Night Energy", "Yorick", "rose", "white tulip", "red tulip", "blue tulip", "Walford's bucket", "Wal-Mart gift certificate", "airplane charter: The Glaciest", "one-day ticket to The Glaciest", "shoulder-warming lotion", "iceberg lettuce", "ice wine", "Wal-Mart snowglobe", "Wal-Mart nametag", "Wal-Mart overalls", "To Build an Igloo", "The Chill of the Wild", "Cold Fang", "Wal-Mart tattoo kit", "perfect ice cube", "The Fun-Guy Cold Weather Bartender's Guide", "bellhop's hat", "ice porter", "exotic travel brochure", "bag of foreign bribes", "frozen shampoo-conditioner", "hotel minibar key", "ice hotel bell", "Martialest Arts trophy", "ancient medicinal herbs", "ice rice", "iced plum wine", "training belt", "training legwarmers", "training helmet", "training scroll:  Shattering Punch", "training scroll:  Snokebomb", "training scroll:  Shivering Monkey Technique", "X-32-F snowman crate", "machine elf capsule", "self-dribbling basketball", "abstraction: action", "abstraction: thought", "abstraction: sensation", "abstraction: purpose", "abstraction: category", "abstraction: perception", "abstraction: motion", "abstraction: joy", "abstraction: certainty", "abstraction: comprehension", "modern picture frame", "VYKEA meatballs", "VYKEA mead", "VYKEA woadpaint", "VYKEA frenzy rune", "VYKEA blood rune", "VYKEA lightning rune", "VYKEA plank", "VYKEA rail", "VYKEA bracket", "VYKEA dowel", "VYKEA hex key", "VYKEA instructions", "tin of submardines", "bottle of norwhiskey", "octolus oculus", "sardine can key", "norwhal helmet", "octolus-skin cloak", "perfect cosmopolitan", "perfect negroni", "perfect dark and stormy", "perfect mimosa", "perfect old-fashioned", "perfect paloma", "That 70s Cologne", "Wal-Mart &quot;diamond&quot; ring", "Puffstone cigar", "Conspiracy&trade; mascara", "Spring Break Beach &quot;swimsuit&quot;", "airplane tattoo", "Deep Machine Tunnels snowglobe", "hemp candy necklace", "communal gobstopper", "Crimbo salad", "bread line", "bark rootbeer", "red ale", "tiny plastic Tammy the Tambourine Elf", "tiny plastic Rudolph the Red", "tiny plastic Gaia'ajh-dsli Ak'lwej", "tiny plastic Crimborgatron", "tiny plastic Crimbodhisattva", "bouquet of all-natural free-range flowers", "stack of communist leaflets", "BACON", "box of Gratitude chocolates", "Gratitude chocolate (thyme-filled)", "Gratitude chocolate (bourbon-filled)", "Gratitude chocolate (Meat-filled)", "Gratitude chocolate (octopus-filled)", "chocolate bowtie", "pitted sheet metal", "sparking robo-battery", "overloaded micro-reactor", "reusable shopping bag", "coarse hemp socks", "red armband", "bundle of &quot;fragrant&quot; herbs", "nuclear stockpile", "pine cone", "iron chain", "pine cone necklace", "reindeer hammer", "elf ploughshare", "circle drum", "The Big Book of Communism", "faded green protest sign", "faded red protest sign", "nasty-smelling moss", "little red book", "elven tambourine", "reindeer sickle", "green face paint", "red face paint", "The Big Book of Communism (used)", "Batfellow comic", "tiny plastic spoiler", "bat-oomerang", "bat-jute", "bat-o-mite", "ROM of Optimality", "incriminating evidence", "dangerous chemicals", "kidnapped orphan", "high-grade metal", "high-tensile-strength fibers", "high-grade explosives", "experimental gene therapy", "ultracoagulator", "self-defense training", "fingerprint dusting kit", "confidence-building hug", "exploding kickball", "glob of Bat-Glue", "Bat-Aid&trade; bandage", "bat-bearing", "Kudzu salad", "Mansquito Serum", "Miss Graves' vermouth", "The Plumber's mushroom stew", "The Author's ink", "The Mad Liquor", "Doc Clock's thyme cocktail", "Mr. Burnsger", "The Inquisitor's unidentifiable object", "The Jokester's gun", "The Jokester's wig", "The Jokester's pants", "Jokester makeup", "replica bat-oomerang", "battoo kit", "basking robin", "tiny domino mask", "robin's egg", "robin flan", "robin nog", "LT&T telegraph office deed", "plaintive telegram", "exploding gum", "root beer barrel", "Kudzu slaw", "Mansquito's blood", "infrablack lipstick", "can of drain cleaner", "The Author's inkwell", "bag of random words", "tube of pendulum lube", "red-hot jawbreaker", "question juice", "tube of villain white", "your cowboy boots", "inflatable LT&T telegraph office", "nugget of quicksilver", "nugget of thicksilver", "nugget of wicksilver", "nugget of slicksilver", "nugget of sicksilver", "nugget of nicksilver", "nugget of ticksilver", "quicksilver ring", "thicksilver ring", "wicksilver ring", "slicksilver ring", "sicksilver ring", "nicksilver ring", "ticksilver ring", "Heimz Fortified Kidney Beans", "Tesla's Electroplated Beans", "Mixed Garbanzos and Chickpeas", "Hellfire Spicy Beans", "Frigid Northern Beans", "World's Blackest-Eyed Peas", "Trader Olaf's Exotic Stinkbeans", "Pork 'n' Pork 'n' Pork 'n' Beans", "Val-U Brand Every Bean Salad", "Shrub's Premium Baked Beans", "plate of Heimz Fortified Kidney Beans", "plate of Tesla's Electroplated Beans", "plate of Mixed Garbanzos and Chickpeas", "plate of Hellfire Spicy Beans", "plate of Frigid Northern Beans", "plate of World's Blackest-Eyed Peas", "plate of Trader Olaf's Exotic Stinkbeans", "plate of Pork 'n' Pork 'n' Pork 'n' Beans", "plate of Val-U Brand Every Bean Salad", "plate of Shrub's Premium Baked Beans", "Fancy Jeff's fancy pocket square", "Daisy's unclean bloomers", "Pecos Dave's sixgun", "Amoon-Ra Cowtep's nemes", "Glenn's golden dice", "Former Sheriff Dan's tin star", "El Vibrato restraints", "Clara's bell", "Granny Hackleton's Gatling gun", "buffalo dime", "cow poker", "poker face paint", "realistic cap gun", "tainted milk", "gun parts", "triggerfingerbone", "ghost bit", "buzzard feather", "lion musk", "bear claw", "rattler gland", "half-digested coal", "tightly-wound spine", "rotting beefsteak", "firemilk", "spidercow eye-cluster", "moomy dust", "western-style skinning knife", "reliable sixgun", "steel knuckles", "Tales of Western Braggadoccio", "Hell and How I Bent It", "The Western Look", "LT&T tattoo kit", "Western Slang Vol. 1: Violence", "Western Slang Vol. 2: Cooking", "Western Slang Vol. 3: Fraud", "strange disc (white)", "strange disc (black)", "strange disc (red)", "strange disc (green)", "strange disc (blue)", "strange disc (yellow)", "red-hot knucklebone", "demonic cow's blood", "rinky-dink sixgun", "makeshift sixgun", "custom sixgun", "baconstone-handled sixgun", "porquoise-handled sixgun", "hamethyst-handled sixgun", "mountain lion skin", "grizzled bearskin", "diamondback skin", "coal snakeskin", "frontwinder skin", "rotting cowskin", "shuddering cow skull", "rhinestone cowhorn", "silver cow skull", "jangly spurs", "quicksilver spurs", "thicksilver spurs", "wicksilver spurs", "slicksilver spurs", "sicksilver spurs", "nicksilver spurs", "ticksilver spurs", "special edition Batfellow comic", "Tales of the West: Cow Punching", "Tales of the West: Beanslinging", "Tales of the West: Snake Oiling", "briefcase full of snakes", "one-gallon hat", "two-gallon hat", "three-gallon hat", "four-gallon hat", "five-gallon hat", "six-gallon hat", "seven-gallon hat", "eight-gallon hat", "nine-gallon hat", "ten-gallon hat", "eleven-gallon hat", "toy sixgun", "snake oil", "skin oil", "unusual oil", "eldritch oil", "exclusive club", "patent preventative tonic", "patent invisibility tonic", "patent aggression tonic", "patent sallowness tonic", "patent avarice tonic", "patent alacrity tonic", "corrupted marrow", "rodeo whiskey", "Thwaitgold scorpion statuette", "real cowboy hat", "Memories of Cow Punching", "Memories of Beanslinging", "Memories of Snake Oiling", "Witchess Set", "electronic Brain Trainer game", "do-it-yourself laser eye surgery kit", "armored prawn", "jumping horseradish", "Sacramento wine", "Greek fire", "ox-head shield", "dented scepter", "very pointy crown", "battle broom", "Clan Floundry", "carpe", "codpiece", "troutsers", "bass clarinet", "fish hatchet", "tunac", "fishin' pole", "wriggling worm", "bottle of Fishhead 900-Day IPA", "high-test fishing line", "fishin' hat", "Trout Fishing in Loathing", "sonar fishfinder", "luxury fly-tying workbench", "antique tacklebox", "disconnected intergnat", "viral video", "internet point", "meme generator", "plus one", "gallon of milk", "print screen button", "screencapped monster", "daily dungeon malware", "infinite BACON machine", "First Post shirt package", "First Post shirt - Cir Senam", "high-speed upgrade", "no spoon", "delicious star salad", "Thwaitgold moth statuette", "bowl of Tastee-Wheet&trade;", "Source terminal", "Source essence", "browser cookie", "hacked gibson", "Source shades", "software bug", "missing semicolon", "Source terminal PRAM chip", "Source terminal GRAM chip", "Source terminal SPAM chip", "Source terminal CRAM chip", "Source terminal DRAM chip", "Source terminal TRAM chip", "Source terminal INGRAM chip", "Source terminal DIAGRAM chip", "Source terminal ASHRAM chip", "Source terminal SCRAM chip", "Source terminal TRIGRAM chip", "Source terminal file: substats.enh", "Source terminal file: damage.enh", "Source terminal file: critical.enh", "Source terminal file: protect.enq", "Source terminal file: stats.enq", "Source terminal file: compress.edu", "Source terminal file: duplicate.edu", "Source terminal file: portscan.edu", "Source terminal file: turbo.edu", "Source terminal file: familiar.ext", "Source terminal file: pram.ext", "Source terminal file: gram.ext", "Source terminal file: spam.ext", "Source terminal file: cram.ext", "Source terminal file: dram.ext", "Source terminal file: tram.ext", "green pill", "plastic detective badge", "bronze detective badge", "silver detective badge", "gold detective badge", "cop dollar", "detective school application", "detective roscoe", "shoe gum", "noir fedora", "trench coat", "Falcon&trade; Maltese Liquor", "hardboiled egg", "detective tattoo", "DIY protonic accelerator kit", "protonic accelerator pack", "almost-dead walkie-talkie", "Adventurer bobblehead", "psychokinetic energy blob", "haunted bindle", "fleshy lump", "smoldering bagel punch", "ghostly reins", "frigid derringer", "Mr. Screege's spectacles", "Spookyraven signet", "tie-dyed fannypack", "burnt snowpants", "standards and practices guide", "Carpathian longsword", "Liam's mail", "Unfortunato's foolscap", "Thwaitgold cockroach statuette", "rad", "purification tablet", "Wrist-Boy", "Dear Past Self Package", "Time-Spinner", "compounded experience", "Rad-B-Gone (1 lb.)", "Rad-Pro (1 oz.)", "lead umbrella", "Shrieking Weasel holo-record", "Power-Guy 2000 holo-record", "Lucky Strikes holo-record", "EMD holo-record", "Superdrifter holo-record", "The Pigs holo-record", "Drunk Uncles holo-record", "time residue", "repaid diaper", "Riker's Search History", "Shot of Kardashian Gin", "Unstable Pointy Ears", "Memory Disk, Alpha", "Tea, Earl Grey, Hot", "School of Hard Knocks Diploma", "baby bark scorpion", "droppable microphone", "unidentified drink", "KoL Con 13 T-shirt", "discarded swimming trunks", "diluted makeup", "charisma potion", "extremely confusing manual", "foam pistol", "KoL Con 13 snowglobe", "leftover pasty", "very fancy whiskey", "li'l orphan tot", "li'l knight costume", "li'l unicorn costume", "li'l candy corn costume", "li'l ninja costume", "li'l pirate costume", "li'l clown costume", "li'l robot costume", "li'l eyeball costume", "li'l liberty costume", "hoarded candy wad", "Prunets", "Twitching Television Tattoo", "tiny baby scorpion", "invisible string", "invisible seam ripper", "li'l ghost costume", "raw sweet potato", "raw green beans", "raw stuffing", "raw cranberry sauce", "raw turkey", "raw mincemeat", "raw potato", "raw gravy", "raw bread", "mini-marshmallow dispenser", "glass casserole dish", "stuffing fluffer", "can opener", "turkey blaster", "glass pie plate", "potato masher", "gravy boat", "bread mold", "candied sweet potatoes", "green bean casserole", "baked stuffing", "cranberry cylinder", "thanksgiving turkey", "mince pie", "mashed potatoes", "warm gravy", "bread roll", "leftovers", "leftovers sandwich", "Eldritch Intellect: Journey into a Mind of Horror", "cornucopia", "megacopia", "giant pilgrim hat", "packet of thanksgarden seeds", "cashew", "bomb of unknown origin", "Granny Tood's Thanksgarden Catalog", "eldritch effluvium", "eldritch concentrate", "eldritch extract", "Official Council Aide Pin", "eldritch distillate", "eldritch essence", "Science Notebook", "eldritch hat", "eldritch pants", "eldritch elixir", "Quartet of Flare Masters Jacket", "lump of not really wriggling eldritch matter", "Adventurer's Kit", "Build-a-City Gingerbread kit", "counterfeit city", "sprinkles", "The Gingerbread Vigilante's Handbook", "sour ball and chain", "candy dog collar", "gingerbread tophat", "gingerbread waistcoat", "gingerbread trousers", "candy dress shoes", "candy necktie", "chocolate pocketwatch", "broken chocolate pocketwatch", "interesting clod of dirt", "gingerbread restraining order", "sprinkle-begging cup", "animal part cracker", "gingerbread wine", "gingerbread mug", "gingerbread mask", "gingerservo", "tainted icing", "gingerbeard", "gingerbread smartphone", "gingerbread hoodie", "gingerbread pistol", "fancy marzipan briefcase", "creme brulee torch", "candy crowbar", "candy screwdriver", "gingerbread dog treat", "pumpkin spice candle", "gingerbread spice latte", "gingerbread gavel", "gingerbread cigarette", "gingerbread moneybag", "ginger beer", "spare chocolate parts", "industrial frosting", "fake cocktail", "high-end ginger wine", "tiny plastic bad vibe", "tiny plastic angry vikings", "tiny plastic Knows About Chakras", "tiny plastic Your Brain", "tiny plastic Krampus", "Inner Wisdom", "Inner Strength", "Inner Truth", "spiritual candy cane", "spiritual eggnog", "spiritual fruitcake", "spiritual gingerbread", "chocolate puppy", "chocolate leash", "My Life of Crime, a Memoir", "Pop Art: a Guide", "No Hats as Art", "Rethinking Candy", "fruit-leather negatives", "gingerbread blackmail photos", "briefcase full of sprinkles", "teethpick", "green rock candy", "green-iced sweet roll", "sugar raygun", "fancy chocolate sculpture", "no hat", "chakra sludge", "negative lump", "Third Eye", "Krampus Horn", "hambrosier", "chakra-mental wine", "chakra malt", "Black Angus blackburger", "black brandy", "potion of spiritual gunkifying", "bad vibroknife", "crystal belt buckle", "saffron antaravasaka", "saffron uttarasanga", "Lump-Stacking for Beginners", "eternal knot tattoo", "pet bad vibe", "black gallstone", "Uncle Crimbo's hat", "Eldritch snap", "hot jelly", "cold jelly", "spooky jelly", "sleaze jelly", "stench jelly", "space planula", "toast with hot jelly", "toast with cold jelly", "toast with spooky jelly", "toast with sleaze jelly", "toast with stench jelly", "space jellybicycle", "hopeful candle", "pewter candlestick", "wax hand", "miniature candle", "wax pancake", "wax face", "wax booze", "glob of melted wax", "sea jelly", "sea truffle", "tarnished luggage key", "crushed steamer trunk", "recovered cufflinks", "heart-shaped crate", "LOV Elixir #3", "LOV Elixir #6", "LOV Elixir #9", "LOV Eardigan", "LOV Epaulettes", "LOV Earrings", "LOV Enamorang", "LOV Emotionizer", "LOV Extraterrestrial Chocolate", "LOV Echinacea Bouquet", "LOV Elephant", "eldritch scanner", "eldritch alignment spray", "LOV Entrance Pass", "eldritch hammer", "eldritch mushroom", "eldritch ichor", "eldritch mushroom pizza", "eldritch tincture", "eldritch tincture (depleted)", "eldritch rub", "HP-35 Calculator", "Silver HP-35 Calculator", "Golden HP-35 Calculator", "Platinum HP-35 Calculator", "Diamond HP-35 Calculator", "dirty bottlecap", "discarded button", "Gummi-Memory", "Thwaitgold amoeba statuette", "pickled grasshopper", "bottle of an&iacute;s", "bottle of novelty hot sauce", "elemental sugarcube", "peppermint sprig", "bottle of clam juice", "cocktail mushroom", "shot of granola liqueur", "can of cherry-flavored sterno", "lump of black ichor", "bottle of gregnadigne", "bottle of Cr&egrave;me de Fugu", "baby oil shooter", "fish head", "limepatch", "pile of dirt", "slime shooter", "imaginary lemon", "literal grasshopper", "double entendre", "Phlegethon", "Siberian sunrise", "mentholated wine", "low tide martini", "shroomtini", "morning dew", "whiskey squeeze", "great old fashioned", "Gnomish sagngria", "vodka stinger", "extremely slippery nipple", "piscatini", "Churchill", "soilzerac", "London frog", "nothingtini", "eighth plague", "single entendre", "reverse Tantalus", "elemental caipiroska", "Feliz Navidad", "Bloody Nora", "moreltini", "hell in a bucket", "Newark", "R'lyeh", "Gnollish sangria", "vodka barracuda", "Mysterious Island iced tea", "drive-by shooting", "gunner's daughter", "dirt julep", "Simepore slime", "Phil Collins", "unpowered Robortender", "toggle switch (Bartend)", "toggle switch (Bounce)", "Spacegate access badge", "filter helmet", "exo-servo leg braces", "rad cloak", "gate transceiver", "high-friction boots", "Spacegate Research", "alien rock sample", "alien gemstone", "geological sample kit", "botanical sample kit", "edible alien plant bit", "alien plant fibers", "alien plant sample", "complex alien plant sample", "fascinating alien plant sample", "alien plant goo", "alien plant pod", "zoological sample kit", "alien meat", "alien toenails", "alien zoological sample", "complex alien zoological sample", "fascinating alien zoological sample", "alien animal goo", "alien animal milk", "spant egg casing", "murderbot data core", "primitive alien medicine", "primitive alien salad", "primitive alien booze", "primitive alien mask", "primitive alien spear", "primitive alien blowgun", "primitive alien loincloth", "primitive alien totem", "primitive alien necklace", "spant chitin", "spant tendon", "spants", "spant shield", "spant shoulderpads", "spant backplate", "spant spear", "murderbot power cell", "murderbot component casing", "murderbot monofilament", "murderbot shield unit", "murderbot live wire", "murderbot mask", "murderbot spring injector", "murderbot whip", "murderbot plasma rifle", "murderbot memory chip", "space pirate treasure map", "Space Pirate Astrogation Handbook", "Non-Euclidean Finance", "Peek-a-Boo!", "Procrastinator locker key", "Space Baby children's book", "Space Baby bawbaw", "portable Spacegate", "Aldebaran sardines", "Centauri fish wine", "powdered oxygen", "Spacegate scientist's insignia", "Spacegate military insignia", "Spacegate diplomat's insignia", "Spacegate emergency disintegrator", "Spacegate Initiative tattoo unit", "alien sandwich", "glitched malware", "Spant eggs", "portable Spacegate (open)", "New-You Club Membership Form", "Daily Affirmation: Always be Collecting", "Daily Affirmation: Think Win-Lose", "Daily Affirmation: Be Superficially interested", "Daily Affirmation: Adapt to Change Eventually", "Daily Affirmation: Be a Mind Master", "Daily Affirmation: Work For Hours a Week", "Daily Affirmation: Keep Free Hate in your Heart", "Affirmation Cookie", "License To Kill", "Thwaitgold bug statuette", "Victor's Spoils", "Threatening Missive", "Targeted Plague Vector", "suspicious package", "Kremlin's Greatest Briefcase", "basic martini", "improved martini", "splendid martini", "exploding cigar", "can of Minions-Be-Gone", "golden tattoo gun", "golden gun", "golden gum", "tiny plastic golden gundam", "License to Chill", "Celsius 233", "Celsius 233 (singed)", "Lazenby's Life Lesson", "LI-11 Motor Pool voucher", "Asdon Martin keyfob (on ring)", "L.I.M.P. Stock Certificate", "Dust bunny", "Pocket Meteor Guide", "Pocket Meteor Guide (well-thumbed)", "Meteorite-Ade", "meteoreo", "meadeorite", "metal meteoroid", "meteortarboard", "meteorite guard", "meteorb", "asteroid belt", "meteorthopedic shoes", "shooting morning star", "cute meteoroid", "meteor shower cap", "Thwaitgold time fly statuette", "perfectly fair coin", "Horsery contract", "corked genie bottle", "genie bottle", "blessed rustproof +2 gray dragon scale mail", "magical pony: Dusk Shiny", "magical pony: Shutterfly", "magical pony: Pearjack", "magical pony: Uniquity", "magical pony: Rosey Cake", "magical pony: Spectrum Dash", "pocket wish", "dropped scrap of paper", "hunk of granite", "shovelful of dirt", "xo-skeleton-in-a-box", "exo-xo-skeleton-skeleton", "X", "O", "DUFRESNE Suds", "mafia pinky ring", "flask of port", "contract enforcement stick", "Hide-rox&trade; cookie", "jug of booze", "pair of candy glasses", "temporary X tattoos", "glyph of athleticism", "pair of scissors", "new habit", "bridge truss", "pearl necklace", "amorphous blob", "giant X", "giant O", "giant amorphous blob", "protection stick", "roll of meat", "mafia thumb ring", "cocoa chondrule", "mafia middle finger ring", "steel drivin' hammer", "little piece of steel", "mafia pointer finger ring", "worksite credentials", "negotiatin' hammer", "pantogram", "portable pantogram", "pantogram pants", "mafia wedding ring", "mafia organizer badge", "mafia filofax", "transparent nog", "unfinished fruitcake", "black and white cracker", "neg grog", "half double fruitcake", "hushed puppy", "muffled muffuletta", "shushed potatoes", "tiny plastic mime functionary", "tiny plastic mime scientist", "tiny plastic mime soldier", "tiny plastic mime executive", "tiny plastic The Silent Nightmare", "locked mumming trunk", "mumming trunk", "temperance whiskey", "cursed wishbone", "Racisto Ruidoso", "earthenware muffin tin", "bran muffin", "blueberry muffin", "silent A", "silent B", "silent C", "silent D", "silent E", "silent F", "silent G", "silent H", "silent I", "silent J", "silent K", "silent L", "silent M", "silent N", "silent O", "silent P", "silent Q", "silent R", "silent S", "silent T", "silent U", "silent V", "silent W", "silent X", "silent Y", "silent Z", "crystalline cheer", "anti-earplugs", "warehouse key", "mime pocket probe", "stale cheer wine", "stale Cheer-E-Os", "cheer-o-gram", "cheerful antler hat", "cheerful Crimbo sweater", "cheerful pajama pants", "The Journal of Mime Science Vol. 1", "The Journal of Mime Science Vol. 1 (used)", "The Journal of Mime Science Vol. 2", "The Journal of Mime Science Vol. 2 (used)", "The Journal of Mime Science Vol. 3", "The Journal of Mime Science Vol. 3 (used)", "The Journal of Mime Science Vol. 4", "The Journal of Mime Science Vol. 4 (used)", "The Journal of Mime Science Vol. 5", "The Journal of Mime Science Vol. 5 (used)", "The Journal of Mime Science Vol. 6", "The Journal of Mime Science Vol. 6 (used)", "mime eraser", "executive mime flask", "nega-mushroom", "nega-mushroom wine", "Cheer-Up soda", "mime army rations", "mime army wine", "mime army superserum", "mime army camouflage kit", "miming beret", "miming shirt", "miming corduroys", "miming boots", "miming gloves", "God Lobster Egg", "donated booze", "donated food", "donated candy", "digital honeypot", "mime-proof sunglasses", "mime army insignia (infantry)", "mime army insignia (intelligence)", "mime army insignia (espionage)", "mime army insignia (pyrotechnics)", "mime army insignia (cryonics)", "mime army insignia (psychological warfare)", "mime army insignia (sanitation)", "mime army insignia (morale)", "mime army infiltration glove", "mime army shotglass", "mime army challenge coin", "cheer extractor", "kerosene-soaked skip", "fireproof skip lid", "extra-toasted half sandwich", "mulled hobo wine", "burning newspaper", "burning paper hat", "burning cape", "burning paper slippers", "burning paper jorts", "burning paper crane", "January's Garbage Tote (unopened)", "January's Garbage Tote", "deceased crimbo tree", "broken champagne bottle", "tinsel tights", "wad of used tape", "silent nightlight", "sweetened reindeer fat", "Good 'n' Quiet", "hot button candy", "makeshift garbage shirt", "novelty monorail ticket", "ancient pills", "furry pill", "beefy pill", "excitement pill", "vitamin G pill", "lucky-ish pill", "dieting pill", "Clan Carnival Game", "How To Get Bigger Without Really Trying", "Illustrated Mating Rituals of the Gallapagos", "Convincing People You Can See The Future", "Love Potions and the Wizards who Mix Them", "They'll Love You In Rhinestones", "Silly Little Love Song", "genie's turbane", "genie's scimitar", "genie's pants", "genie's bracers", "psychic's circlet", "psychic's crystal ball", "psychic's pslacks", "psychic's amulet", "heart-shaped candy whetstone", "Swedish massage fish", "Third Base", "Bustle Hustler", "Fabiotion", "Bettie page", "tonic o' Banderas", "heather graham cracker", "Lolsipop", "heart cozy", "eaves droppers", "personal graffiti kit", "Mysterious Red Box", "Mysterious Green Box", "Mysterious Blue Box", "Mysterious Black Box", "rainbow jellybean", "mystery lollipop", "Love Potion #XYZ", "rhinestone", "1,960 pok&eacute;dollar bill", "metandienone", "riboflavin", "bronze", "piracetam", "ultracalcium", "ginseng", "Team Avarice cap", "Team Sloth cap", "Team Wrath cap", "Mu cap", "Thwaitgold metabug statuette", "Pok&eacute;fam Guide to Capturing All of Them", "packet of tall grass seeds", "Pok&eacute;-Gro fertilizer", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "Glum berry", "Egnaro berry", "Sitrep berry", "Nadsat berry", "Jamocha berry", "Tapioc berry", "Snarf berry", "Keese berry", "luck incense", "shell bell", "muscle band", "amulet coin", "razor fang", "smoke ball", "green rocket", "magnificent oyster egg", "brilliant oyster egg", "glistening oyster egg", "scintillating oyster egg", "pearlescent oyster egg", "lustrous oyster egg", "gleaming oyster egg", "FantasyRealm membership packet", "FantasyRealm guest pass", "FantasyRealm G. E. M.", "Rubee&trade;", "FantasyRealm Warrior's Helm", "FantasyRealm Mage's Hat", "FantasyRealm Rogue's Mask", "lump of bauxite", "&quot;Remember the Trees&quot; Shirt", "FantasyRealm key", "plump purple mushroom", "tainted marshmallow", "Chewsick Copperbottom's notes", "LyleCo premium pickaxe", "LyleCo premium rope", "My First Art of War", "dragon aluminum ore", "faerie dust", "poisoned druidic s'more", "druidic orb", "to-go brew", "flask of holy water", "universal antivenin", "LyleCo premium monocle", "LyleCo premium magnifying glass", "FantasyRealm tattoo kit", "LyleCo Contractor's Manual", "FantasyRealm turkey leg", "FantasyRealm mead", "nasty haunch", "Cheswick Copperbottom's compass", "arrest warrant", "hero's skull", "grolblin rum", "druidic s'more", "sachet of strange powder", "mourning wine", "sanctified cola", "map to the Towering Mountains", "map to the Mystic Wood", "map to the Putrid Swamp", "map to the Cursed Village", "map to the Sprawling Cemetery", "denastified haunch", "bad rum and good cola", "Potion of Heroism", "leggings of the Spider Queen", "Master Thief's utility belt", "Duke Vampire's regal cloak", "Dragonscale breastplate", "belt of Ogrekind", "The Ghoul King's ghoulottes", "nozzle of the Phoenix", "the Archwizard's briefs", "the Ley Incursion's waist", "shield of the Skeleton Lord", "ring of the Skeleton Lord", "scepter of the Skeleton Lord", "deadfall branch", "Staff of Kitchen Royalty", "charged druidic orb", "dragon slaying sword", "notarized arrest warrant", "two meat muck", "chocolate Ogre Chieftain", "chocolate &quot;Phoenix&quot;", "chocolate Spider Queen", "hipster cocktail", "God Lobster's Scepter", "God Lobster's Ring", "God Lobster's Rod", "God Lobster's Robe", "God Lobster's Crown", "Dish of Clarified Butter", "G", "Garland of Greatness", "gattoo", "A-Boo glue", "glued A-Boo clue", "crude oil congealer", "good guava", "gin and ginger", "Thwaitgold chigger statuette", "gaseous gravy", "SongBoom&trade; BoomBox", "SongBoom&trade; BoomBox Box", "A Guide to Safari", "Shielding Potion", "Punching Potion", "Special Seasoning", "Nightmare Fuel", "Gathered Meat-Clip", "Bastille Battalion control rig crate", "Bastille Battalion control rig", "Brutal brogues", "Draftsman's driving gloves", "Nouveau nosering", "sharkfin gumbo", "boiling broth", "interrogative elixir", "Bastille Battalion Fondue Trophy", "Bastille Battalion tattoo kit", "Bastille Battalion cheese wheel", "Bastille Battalion control rig loaner voucher", "kitten burglar", "burglar/sleep mask", "Thwaitgold masked hunter statuette", "Neverending Party invitation envelope", "Neverending Party guest pass", "PARTY HARD T-shirt", "Neverending Party favor", "deluxe Neverending Party favor", "gas can", "Middle of the Road&trade; brand whiskey", "neverending wallet chain", "pentagram bandana", "gold skull ring", "electronics kit", "PB&J with the crusts cut off", "dorky glasses", "ponytail clip", "paint palette", "unremarkable duffel bag", "Purple Beast energy drink", "cosmetic football", "shoe ad T-shirt", "pump-up high-tops", "runproof mascara", "very small red dress", "noticeable pumps", "surprisingly capacious handbag", "everfull glass", "van key", "jam band bootleg", "denim jacket", "ratty knitted cap", "intimidating chainsaw", "party beer bomb", "sweet party mix", "party balloon", "fancy party pants", "party whip", "Party Planning on a Budget", "TRIO cup of beer", "party platter for one", "Party-in-a-Can&trade;", "party pup", "party crasher", "Living to Drink, Drinking to Live", "Party Tattoo&trade; gift certificate", "party mouse hat", "latte lovers member's mug", "latte lovers club card", "voter registration form", "&quot;I Voted!&quot; sticker", "absentee voter ballot", "snake skin", "snakeskin thighboots", "snakeskin cowboy hat", "snakeskin jacket", "black slime glob", "green slime glob", "orange slime glob", "slime waders", "slime fedora", "slime knuckles", "government requisition form", "government-issued slacks", "government-issued eyeshade", "government-issued necktie", "mutant arm", "mutant legs", "mutant crown", "ghostly ectoplasm", "haunted orange", "haunted bottle of vodka", "haunted pizza", "haunted martini", "haunted cherry pie", "haunted eggnog", "glob of undifferentiated tissue", "haunted Hell ramen", "haunted gimlet", "twice-haunted screwdriver", "primitive candy cane", "runny fermented egg", "oldcake", "traditional Crimbo cookie", "tiny plastic wild beaver", "tiny plastic reindeer", "tiny plastic Caf&eacute; Elf", "tiny plastic orphan", "tiny plastic Abuela Crimbo", "yule pup", "Braindeer", "Crimbo dog sweater", "pristine walrus tusk", "thick walrus blubber", "Staff of Frozen Lard", "tiny bomb", "plastic bazooka", "mooseflank", "grilled mooseflank", "moosemeat pie", "balanced antler", "portable dam", "beavermouth", "beaver punch (papaya)", "beaver punch (peach)", "beaver punch (cherry)", "antique Canadian lantern", "muskox-skin cap", "Boxing Day care package", "glass of raw eggs", "punch-drunk punch", "body spradium", "bauxite beret", "bauxite boxers", "bauxite bow-tie", "Boxing Day Pass", "Kramco Industries packing carton", "Kramco Sausage-o-Matic&trade;", "magical sausage casing", "magical sausage", "red-hot sausage fork", "bag of sausage links", "sausage golem", "jar of magical relish", "Toyleporter", "antique beer", "yule gruel", "hot watered rum", "bottle of Crimbognac", "Crimboysters Rockefeller", "Crimbeau de toilette", "Crimbo candle", "Carol of the Bulls", "Carol of the Bulls (used)", "Carol of the Hells", "Carol of the Hells (used)", "Carol of the Thrills", "Carol of the Thrills (used)", "Crimbolex watch", "Crimbo tattoo kit", "hand-knitted Crimbo socks", "chalk chlamys", "chalk chain", "chalk chalice", "chalk chinos", "chalk chapeau", "chalk choker", "chalk chunks", "candy chalk", "marble maebari", "marble mantle", "marble magnet", "marble mignonette bowl", "marble medallion", "marble mariachi hat", "marble molecules", "Mallomarbles", "paraffin punching bag", "paraffin pith helmet", "paraffin poncho", "paraffin pendant", "paraffin palazzos", "paraffin pseudoaccordion", "paraffin pieces", "Para-Pop", "terra cotta truss", "terra cotta trousers", "terra cotta tongs", "terra cotta train", "terra cotta tie tack", "terra cotta tambourine", "terra cotta tidbits", "terra panna cotta", "velour voulge", "velour vambraces", "velour veil", "velour viscometer", "velour valise", "velour vaqueros", "velour veneer", "Velougats&trade;", "stained glass suspenders", "stained glass shield", "stained glass stetson", "stained glass spectacles", "stained glass shiv", "stained glass serape", "stained glass shards", "stained hard candy", "loofah lumberjack's hat", "loofah lei", "loofah lederhosen", "loofah ladle", "loofah legwarmers", "loofah lavalier", "loofah lumps", "chocolate-covered loofah", "flagstone flag", "flagstone flail", "flagstone flip-flops", "flagstone fez", "flagstone fleece", "flagstone fringe", "flagstone flagments", "Flag by the Foot&trade;", "elf sleeper agent", "red-and-green microcamera", "cobbled-together Meat detector", "tin thermos of chai", "prototype stimulant", "tailored vest", "sew-on bandage", "really nice net", "elf army poncho", "elf army field rations", "gingernade", "discarded bowtie", "martiny", "tryptophan dart", "licorice snake", "virgin jello shot", "mutated candy lump", "government-issued candy", "Pneumo bar", "mint condition Lil' Doctor&trade; bag", "Lil' Doctor&trade; bag", "blood bag", "bloodstick", "bottle of Sanguiovese", "actual blood sausage", "mulled blood", "blood snowcone", "Red Russian", "blood roll-up", "dusty bottle of blood", "blood-soaked sponge cake", "vampagne", "plain snowcone", "Booke of Vampyric Knowledge", "white money bag", "red money bag", "blue money bag", "Thwaitgold mosquito statuette", "bucket of ancient Vampyre blood", "blood knife", "PirateRealm membership packet", "PirateRealm guest pass", "PirateRealm eyepatch", "bloody harpoon", "cursed compass", "ancient skull key", "curious anemometer", "Red Roger's flag", "Glass Jack's spyglass", "recursed compass", "tomb-opener", "Red Roger's map", "crabsicle", "melty plastic grenade", "bottle of dark rhum", "bottle of extra-dark rhum", "bottle of super-extra-dark rhum", "pirate shaving cream", "conquistador's breastplate", "pirate pantaloons", "[glitch season reward name]", "signal fragment", "windicle", "pirate radio ring", "Island Drinkin', a Tiki Mixology Odyssey", "pineapple slab", "hibiscus petal", "huge mint leaf", "cocoa of youth", "oversized ice molecule", "Red Roger's reliquary", "Red Roger's red right hand", "Red Roger's red left hand", "Red Roger's red right foot", "Red Roger's red left foot", "Red Roger's skull", "pewter shavings", "Red Roger tattoo kit", "PirateRealm fun-a-log", "plush sea serpent", "pirate fork", "Scurvy and Sobriety Prevention", "lucky gold ring", "piratical blunderbuss", "PirateRealm party hat", "Island Landslide", "Island Thunderstorm", "Island Hurricane", "Skull Punch", "Electric Punch", "Smuggler's Punch", "Scorpion Bowl", "Turtle Bowl", "Cobra Bowl", "vampyric cloake pattern", "vampyric cloake", "plastic pirate hat", "one piece of bubble gum", "arcanoferric housing", "intact medium-wave antenna", "18-picohertz resonator crystal", "blown-out speaker cone", "overloaded short-pulse transistor", "Fourth of May Cosplay Saber kit", "Fourth of May Cosplay Saber", "ring", "Thwaitgold nymph statuette", "hewn moon-rune spoon", "cartoon harpoon", "rune-strewn spoon cocoon", "Beach Comb Box", "Beach Comb", "grain of sand", "small pile of sand", "pile of sand", "large pile of sand", "empty hourglass", "hourglass", "etched hourglass", "magenta seashell", "cyan seashell", "gray seashell", "green seashell", "yellow seashell", "bunch of sea grapes", "bottle of sea wine", "kelp", "driftwood hat", "driftwood pants", "driftwood bracelet", "waders", "spearfish fishing spear", "lucky rabbitfish fin", "piece of coral", "piece of driftwood", "cursed pirate cutlass", "cursed tricorn hat", "cursed swash buckle", "meteorite fragment", "meteorite earring", "meteorite necklace", "meteorite ring", "Finnish Fish", "cursed chocolate doubloon", "driftwood beach comb", "Distant Woods Getaway Brochure", "stick of firewood", "whittled tiara", "whittled shorts", "whittled flail", "whittled wand", "whittled flute", "whittled bear figurine", "whittled owl figurine", "whittled fox figurine", "whittled walking stick", "campfire hot dog", "campfire baked potato", "campfire s'more", "campfire beans", "campfire stew", "campfire coffee", "leftover chocolate bar", "rare Meat isotope", "burnt stick", "bundle of firewood", "campfire smoke", "Murgatroyd diode", "signal receiver", "space shield", "signal jammer", "low-pressure oxygen tank", "Thwaitgold bombardier beetle statuette", "space chowder", "space wine", "The Imploded World", "packaged Pocket Professor", "Pocket Professor memory chip", "Law of Averages", "Unopened Eight Days a Week Pill Keeper", "Eight Days a Week Pill Keeper", "unopened diabolic pizza cube box", "diabolic pizza cube", "diabolic pizza", "bu&ntilde;uelos Jaliscos", "flan del mar", "Baja sopapilla", "tiny plastic Mer-kin baker", "tiny plastic sea elf", "tiny plastic yuleviathan", "tiny plastic dolphin &quot;orphan&quot;", "tiny plastic Dolph Bossin", "red-spotted snapper roe", "mana-coated yams", "mana-basted tofurkey leg", "mana-fortified cranberry sauce", "mana-stuffed herbal stuffing", "human musk", "patch of extra-warm fur", "industrial lubricant", "unfinished pleasure", "vial of humanoid growth hormone", "a bug's lymph", "organic potpourri", "boot flask", "infernal snowball", "powdered madness", "fish sauce", "guffin", "Shantix&trade;", "goodberry", "non-Euclidean angle", "peppermint syrup", "Mer-kin eyedrops", "extra-strength goo", "envelope full of Meat", "livid energy", "micronova", "beggin' cologne", "oxygenated eggnog helmet", "hand-knitted diving booties", "peppermint harpoon gun", "concentrated fish broth", "liquid SONAR", "map to Dolph Bossin's hideout", "Dolph Bossin's charity note", "Dolph Bossin's Crimbo hat", "The Spirit of Giving", "The Spirit of Giving (used)", "Crimbo Factory surprise box", "soggy gingerbread chunk", "salty gumdrop", "ribbon candy ascot", "moist Crimbo spices", "intact anemone spike", "anemoney clip", "runny icing", "super-sweet fish goo (spoiled)", "icing poncho", "Mer-kin cookiestove", "glob of salty molasses", "Mer-kin rollpin", "personalizable gingerbread cookie", "tinsel fin", "bowl of mernudo", "fishelada", "ojo de pez burrito", "waterlogged wood", "waterlogged cloth", "waterlogged stuffing", "waterlogged leather", "waterlogged metal", "antique nutcracker hat", "antique nutcracker waistcoat", "antique nutcracker pants", "antique nutcracker boots", "antique nutcracker sword", "antique nutcracker drumstick", "antique nutcracker beard", "antique nutcracker cape", "antique nutcracker epaulets", "antique nutcracker figurine", "salt plum", "peppermint eel sauce", "green and red bean", "kelp-holly gun", "Yuleviathan necklace", "peppermint spine", "soggy elf shoes", "Crimbylow-rise jeans", "kelp-holly drape", "Staff of the Peppermint Twist", "tempura green and red bean", "salt plum sake", "pressurized potion of possessiveness", "candied almond", "tiny handful of mixed nuts", "nutcracking pliers", "Retrospecs try-at-home kit", "Retrospecs", "unopened Bird-a-Day calendar", "Bird-a-Day calendar", "mint-in-box Powerful Glove", "Powerful Glove", "enhanced signal receiver", "status cymbal", "Drip harness", "drippy truncheon", "Driplet", "drippy snail shell", "drippy nugget", "glass of drippy wine", "drippy caviar", "drippy plum(?)", "drippy stake", "The Eye of the Thing in the Basement", "drippy khakis", "drippy shield", "The Fingernail of the Thing in the Basement", "coin", "mushroom", "deluxe mushroom", "super deluxe mushroom", "fizzy soda", "healthy juice", "hammer", "heavy hammer", "[10462]fire flower", "bonfire flower", "work boots", "fancy boots", "cape", "back shell", "spiky back shell", "power pants", "Thwaitgold buzzy beetle statuette", "Plumber's Union Handbook", "bony back shell", "frosty button", "blooper ink", "red coin", "rubber doll head", "rubber doll body", "plastic doll arms", "plastic doll legs", "rubber baby doll", "Better Shrooms and Gardens catalog", "packet of mushroom spores", "free-range mushroom", "plump free-range mushroom", "bulky free-range mushroom", "giant free-range mushroom", "immense free-range mushroom", "colossal free-range mushroom", "mushroom filet", "mushroom slab", "mushroom tea", "mushroom whiskey", "mushroom cap", "mushroom shield", "mushroom pants", "mushroom badge", "house-sized mushroom", "pristine piranha seed", "plastic piranha pot", "piranha pollen", "red plumber's boots", "sinistral homunculus", "rusty kettle bell", "glued-together crystal ball", "martini dregs", "flickering flashlight", "crumbling rabbit's foot", "outmoded fidget toy", "flimsy ski pole", "discarded finger painting", "old pizza box", "chipped coffee mug", "Left-Hand Man action figure", "drippy seed", "drippy grub", "drippy bezoar", "Drip Institute petri dish", "drippy ichor", "drippy enzyme", "drippy salt", "drippy pigment", "drippy bromide", "drippy flux", "drippy stein", "drippy pilsner", "drippy staff", "drippy orb", "lustrous drippy orb", "gory drippy orb", "annealed drippy orb", "Guzzlr application", "Guzzlr tablet", "Guzzlr cocktail set", "Guzzlrbuck", "Guzzlr hat", "Guzzlr shoes", "Guzzlr pants", "Guzzlr souvenir stein", "Guzzlr tattoo kit", "Ghiaccio Colada", "Sourfinger", "Nog-on-the-Cob", "Steamboat", "Buttery Boy", "Never Don't Stop Not Striving", "clown car key", "batting cage key", "aqu&iacute;", "knob labinet key", "weremoose key", "peg key", "kekekey", "rabbit's foot key", "knob shaft skate key", "ice key", "anchovy can key", "cactus key", "f'c'le sh'c'le k'y", "treasure chest key", "demonic key", "key sausage", "knob treasury key", "scrap metal key", "black rose key", "music box key", "actual skeleton key", "deep-fried key", "discarded bike lock key", "Thwaitgold keyhole spider statuette", "Manual of Lock Picking", "marshroom", "bag of Iunion stones", "Iunion Crown", "drippy candy bar", "salty drippy candy bar", "writhing drippy candy bar", "gooey drippy candy bar", "baby camelCalf", "dromedary drinking helmet", "packaged SpinMaster&trade; lathe", "SpinMaster&trade; lathe", "flimsy hardwood scraps", "birch battery", "ebony epee", "weeping willow wand", "beechwood blowgun", "maple magnet", "Dreadsylvanian hemlock", "hemlock helm", "sweaty balsam", "balsam barrel", "ancient redwood", "redwood rain stick", "purpleheart logs", "purpleheart &quot;pants&quot;", "wormwood stick", "wormwood wedding ring", "Dripwood slab", "drippy diadem", "Thwaitgold slug statuette", "ert grey goo ring", "fistful of wood shavings", "Yeg's Motel ashtray", "Yeg's Motel alarm clock", "Yeg's Motel toothbrush", "Yeg's Motel hand soap", "Yeg's Motel sewing kit", "Yeg's Motel pillow mint", "Yeg's Motel disposable razor", "Yeg's Motel mouthwash", "Yeg's Motel shower cap", "Yeg's Motel bathrobe", "Yeg's Motel slippers", "Yeg's Motel stationery", "Yeg's Motel minibar key", "sizzling desk bell", "frost-rimed desk bell", "uncanny desk bell", "nasty desk bell", "greasy desk bell", "fancy chess set", "onyx king", "onyx queen", "onyx rook", "onyx bishop", "onyx knight", "onyx pawn", "alabaster king", "alabaster queen", "alabaster rook", "alabaster bishop", "alabaster knight", "alabaster pawn", "bagged Cargo Cultist Shorts", "Cargo Cultist Shorts", "complicated device", "flask of moonshine", "sea-worn candlestick", "Universal Seasoning", "null-day exploit", "flame orb", "chocolate chip muffin", "Comprehensive Cartographic Compendium", "Comprehensive Cartographic Compendium (well-read)", "packaged knock-off retro superhero cape", "unwrapped knock-off retro superhero cape", "box o' ghosts", "gregarious ghostling", "grinning ghostling", "greedy ghostling", "subscription cocoa dispenser", "fortifying hot cocoa", "boiling hot cocoa", "cool hot cocoa", "overly-fancy hot cocoa", "hot cocoa au beurre", "hot cocoa with rainbow marshmallows", "Book of Old-Timey Carols", "Crimbo smile", "SalesCo sample kit", "candy harmonica", "powdered powdered sugar", "multi-level marzipan", "tiny plastic Crimbo caroler", "tiny plastic multi-level marketer", "tiny plastic Crimbo cheer", "tiny plastic Mirth", "tiny plastic Penny", "overflowing gift basket", "personalized wassail stein", "tabletop candy dispenser", "neck wreath", "shining star cap", "nativity shorts", "myrrh pouch", "frankincenser", "gilded trumpet", "&quot;reusable&quot; grocery bag", "cardboard wine carrier", "antique candy bucket", "prescription teeth whitener", "imported lemon lozenge", "hermedisiac cologne", "government food shipment", "government booze shipment", "government candy shipment", "Crimbo Cheer tattoo kit", "Crimbo Carol tattoo kit", "Crimbo Commerce tattoo kit", "food drive button", "booze drive button", "candy drive button", "food mailing list", "booze mailing list", "candy mailing list", "fruit bat", "tinsel orb", "snowpack", "Satan hat", "Crimbo stockings", "poncho de azucar", "The Night Before Crimbo, Ch. 1", "The Night Before Crimbo, Ch. 1 (used)", "The Night Before Crimbo, Ch. 2", "The Night Before Crimbo, Ch. 2 (used)", "The Night Before Crimbo, Ch. 3", "The Night Before Crimbo, Ch. 3 (used)", "The Night Before Crimbo, Ch. 4", "The Night Before Crimbo, Ch. 4 (used)", "The Night Before Crimbo, Ch. 5", "The Night Before Crimbo, Ch. 5 (used)", "The Night Before Crimbo, Ch. 6", "The Night Before Crimbo, Ch. 6 (used)", "stuffed red and green pepper (stale)", "cranberry margarita (brackish)", "fuzzy polar bear ears", "tiny glowing red nose", "miniature goose mask", "barrel-aged eggnog", "hand-crafted candy cane", "drive-thru burger", "Boulevardier cocktail", "Hotwire&trade; brand candy rope", "bowl full of jelly", "Eye and a Twist", "Chubby and Plump bar", "digibritches", "packaged miniature crystal ball", "miniature crystal ball", "fresh can of paint", "fresh coat of paint", "emotion chip", "spinal-fluid-covered emotion chip", "robo-battery", "Thwaitgold listening bug statuette", "power seed", "potted power plant", "battery (AAA)", "battery (AA)", "battery (D)", "battery (9-Volt)", "battery (lantern)", "battery (car)", "cryptocloak", "green marshmallow", "marshmallow bomb", "packaged backup camera", "backup camera", "shortest-order cook", "blue plate", "short beer", "short stack of pancakes", "short stick of butter", "short glass of water", "short white", "Thwaitgold quantum bug statuette", "quantum of familiar", "familiar scrapbook", "packaged familiar scrapbook", "clan underground fireworks shop", "fedora-mounted fountain", "sombrero-mounted sparkler", "porkpie-mounted popper", "yellow rocket", "blue rocket", "red rocket", "fire crackers", "Arr, M80", "Catherine Wheel", "rocket boots", "oversized sparkler", "Our Daily Candles&trade; order form", "Scent of a Human&trade; candle", "The Beast Within&trade; candle", "Salsa Caliente&trade; candle", "Smoldering Clover&trade; candle", "Napalm In The Morning&trade; candle", "extra-large utility candle", "runed taper candle", "novelty sparkling candle", "Abracandalabra", "extra-wide head candle", "natural magick candle", "rainbow glitter candle", "banana candle", "ear candle", "votive of confidence", "water candle", "B. L. A. R. T.", "Thwaitgold fire beetle statuette", "rusty empty nacho cheese can", "literal bucket hat", "rainproof barrel caulk", "pump grease", "packaged industrial fire extinguisher", "industrial fire extinguisher", "The Nose Knows, A Guide to Smells", "The Nose Knows, A Guide to Smells (read)", "1950 Vampire Vintner wine", "bottled Vampire Vintner", "French-Transylvanian Dictionary", "packaged Daylight Shavings Helmet", "Daylight Shavings Helmet", "eggwater", "bread man", "plain candy cane", "flour cookie", "tiny plastic food lab", "tiny plastic nog lab", "tiny plastic chem lab", "tiny plastic primary lab", "tiny plastic Cheer Core", "packaged cold medicine cabinet", "cold medicine cabinet", "ice crown", "frozen jeans", "ice wrap", "frozen tofu pop", "bowl of prescription candy", "fishcake", "bone broth", "star pop", "Doc's Fortifying Wine", "Doc's Smartifying Wine", "Doc's Limbering Wine", "Doc's Medical-Grade Wine", "Homebodyl&trade;", "Extrovermectin&trade;", "Breathitin&trade;", "Fleshazole&trade;", "anti-burn cream", "anti-freeze cream", "anti-goosebump cream", "anti-odor cream", "anti-creep cream", "anti-pain cream", "Doc's Special Reserve Wine", "bread pie", "clear Russian", "zero-trust tanktop", "white Crimbo ball", "black Crimbo ball", "gooified animal matter", "gooified vegetable matter", "gooified mineral matter", "[experimental crimbo food]", "[experimental crimbo booze]", "[experimental crimbo spleen]", "goo magnet", "cozy scarf", "huge Crimbo cookie", "fleshy putty", "third ear", "festive egg sac", "poisonsettia", "peppermint-scented socks", "the Crymbich Manuscript", "projectile chemistry set", "depleted Crimbonium football helmet", "synthetic rock", "&quot;caramel&quot; orange", "self-repairing earmuffs", "carnivorous potted plant", "universal biscuit", "yule hatchet", "potato alarm clock", "lab-grown meat", "golden fleece", "boxed gumball machine", "cloning kit", "electric pants", "can of mixed everything", "Site Alpha ID badge", "the Crymbich Manuscript (used)", "meatball", "cloned monster", "meatball machine", "refurbished air fryer", "fried air", "11-leaf clover", "[10882]carton of astral energy drinks", "[10883]astral energy drink", "mint condition magnifying glass", "cursed magnifying glass", "void lager", "void burger", "void stone", "void shard", "undrilled cosmic bowling ball", "cosmic bowling ball", "combat lover's locket lockbox", "combat lover's locket", "Thwaitgold protozoa statuette", "grey gosling", "grey down vest", "trojan horseshoe", "undamaged Unbreakable Umbrella", "unbreakable umbrella", "MayDay&trade; contract", "MayDay&trade; supply package", "emergency glowstick", "survival knife", "crank-powered radio on a lanyard", "headlamp", "thermal blanket", "atlas of local maps", "spare battery", "space blanket", "single-use dust mask", "gaffer's tape", "20-lb can of rice and beans", "bar of freeze-dried water", "expired MRE", "cool mint precipice bar", "carrot cake precipice bar", "The Big Book of Every Skill", "Thwaitgold harvestman statuette", "packaged June cleaver", "June cleaver", "Dad's brandy", "teacher's pen", "fire-roasted lake trout", "guilty sprout", "mother's necklace", "trampled ticket stub", "savings bond", "designer sweatpants (new old stock)", "designer sweatpants", "sweat-ade", "unopened tiny stillsuit", "tiny stillsuit", "thick dinosaur leather", "shiny dinosaur scale", "pristine dinosaur feather", "nasty dinosaur spike", "pterodactyl rifle", "birdseed hat", "flatusaur gasmask", "dinosaur dart", "Dino DNAde&trade;", "dinosaur repellent", "camouflage vest", "Dinodollar", "valuable dinosaur droppings", "dinosaur pheromone kit", "awkward dinosaur research harness", "reflective vest", "stuffed dinosaur", "Thwaitgold mosquito-in-amber statuette", "packaged Jurassic Parka", "Jurassic Parka", "boxed autumn-aton", "autumn-aton", "autumn leaf", "AutumnFest ale", "autumn sweater-weather sweater", "autumn debris shield", "autumn-spice donut", "autumn dollar", "autumn leaf pendant", "autumn breeze", "autumn years wisdom", "familiar-in-the-middle wrapper", "Oopsie IPA", "mummified entombed cookbookbat", "Yeast of Boris", "St. Sneaky Pete's Whey", "Vegetable of Jarlsberg", "ratatouille de Jarlsberg", "Jarlsberg's vegetable soup", "roasted vegetable of Jarlsberg", "St. Pete's sneaky smoothie", "Pete's wiley whey bar", "Pete's rich ricotta", "Boris's beer", "honey bun of Boris", "Boris's bread", "Recipe of Before Yore: ratatouille de Jarlsberg", "Recipe of Before Yore: Jarlsberg's vegetable soup", "Recipe of Before Yore: roasted vegetable of J.", "Recipe of Before Yore: St. Pete's sneaky smoothie", "Recipe of Before Yore: Pete's wily whey bar", "Recipe of Before Yore: Pete's rich ricotta", "Recipe of Before Yore: Boris's beer", "Recipe of Before Yore: honey bun of Boris", "Recipe of Before Yore: Boris's bread", "baked veggie ricotta casserole", "plain calzone", "roasted vegetable focaccia", "Pizza of Legend", "Calzone of Legend", "Recipe of Before Yore: Calzone of Legend", "Recipe of Before Yore: Pizza of Legend", "Recipe of Before Yore: roasted vegetable focaccia", "Recipe of Before Yore: plain calzone", "Recipe of Before Yore: baked veggie ricotta", "cookbookbat book", "Recipe of Before Yore: Deep Dish of Legend", "Deep Dish of Legend", "deed to Oliver's Place", "drink chit", "government per-diem", "prohie's hat", "imported taffy", "Charleston shoes", "booze bindle", "rare oboe", "bullet necklace", "swamp haunch", "gator shades", "milk cap", "Charleston Choo-Choo", "Velvet Veil", "Marltini", "Strong, Silent Type", "Mysterious Stranger", "Champagne Shimmy", "the Sot's parcel", "ceramic cestus", "ceramic centurion shield", "ceramic celery grater", "ceramic celsiturometer", "ceramic cerecloth belt", "ceramic cenobite's robe", "ceramic scree", "extra-hard jawbreaker", "chiffon chevrons", "chiffon chapeau", "chiffon chamberpot", "chiffon chemise", "chiffon chakram", "chiffon chaps", "chiffon carbage", "chiffon lemon", "chocomotive", "freightcake", "cabooze", "tiny plastic caboose", "tiny plastic passenger car", "tiny plastic dining car", "tiny plastic coal car", "tiny plastic locomotive", "packaged model train set", "model train set", "Crimbo training manual", "Abuela Crimbo's special magnet", "Trainbot radar monocle", "pile of Trainbot parts", "Trainbot circuitry", "Trainbot tubing", "Trainbot plating", "Trainbot optics", "Trainbot servomotors", "Trainbot linkages", "ping-pong paddle", "ping-pong ball", "Trainbot harness", "portable ping-pong table", "Crimbo train emergency brake", "Trainbot autoassembly module", "head-mounted Trainbot", "leg-mounted Trainbots", "shoulder-mounted Trainbot", "cinnamon machine oil", "Crimbo crystal shards", "dregs of a Crimbo cocktail", "lost elf luggage", "Trainbot luggage hook", "honey-drenched ham slice", "mostly-empty bottle of cookie wine", "Crimbo food scraps", "white arm towel", "automatic wine thief", "silver table-scraper", "Trainbot slag", "industrially-crushed ice", "steamed oyster", "really nice lump of coal", "deactivated mini-Trainbot", "portable steam unit", "crystal Crimbo goblet", "crystal Crimbo platter", "Crimbosmopolitan", "Crimbo dinner", "overloaded Yule battery", "train whistle", "The Superconductor's CPU", "unoccupied sheep suit", "half-height cigar", "grubby wool", "grubby wool hat", "grubby wool scarf", "grubby wool trousers", "grubby wool gloves", "grubby wool beerwarmer", "nice warm beer", "grubby woolball", "Rock Garden Guide", "packet of rock seeds", "groveling gravel", "fruity pebble", "lodestone", "milestone", "bolder boulder", "molehill mountain", "whet stone", "hard rock", "strange stalagmite", "chocolate covered ping-pong ball", "pixel bread", "pixel whiskey", "pixel rock", "S.I.T. Course Voucher", "S.I.T. Course Completion Certificate", "glob of extra-green chlorophyll", "electric mushroom", "five-fingered fern resin", "super good fruit", "energized spores", "big hot pepper", "out-of-work circus flea", "extra-grubby grub", "fire ant pheromones", "flapper fly", "shot of wasp venom", "filled mosquito", "shim of shame shale", "pebble of proud pyrite", "pile of gritty sand", "hollow rock", "angry agate", "lump of loyal latite", "shadow sausage", "shadow skin", "shadow flame", "shadow bread", "shadow ice", "shadow fluid", "shadow glass", "shadow brick", "shadow sinew", "shadow venom", "shadow nectar", "shadow stick", "cursed bat paw", "uncursed bat paw", "cursed goblin cape", "uncursed goblin cape", "cursed dragon wishbone", "uncursed dragon wishbone", "cursed stats", "uncursed stats", "cursed arcane orb", "uncursed arcane orb", "cursed machete", "uncursed machete", "cursed blanket", "uncursed blanket", "cursed medallion", "uncursed medallion", "Advanced Pig Skinning", "The Cheese Wizard's Companion", "Jazz Agent sheet music", "Thwaitgold anti-moth statuette", "shadowy cheat sheet", "closed-circuit phone system", "closed-circuit pay phone", "shadow lighter", "shadow heptahedron", "shadow snowflake", "shadow heart", "shadow bucket", "shadow wave", "Rufus's shadow lodestone", "shadow chef's hat", "shadow trousers", "shadow hammer", "shadow monocle", "shadow candle", "shadow hot dog", "shadow martini", "shadow pill", "shadow needle", "cursed monkey's paw", "cursed monkey glove", "shadow candy", "replica Mr. Accessory", "replica Dark Jill-O-Lantern", "replica hand turkey outline", "replica crimbo elfling", "replica pygmy bugbear shaman", "dedigitizer schematic: cyburger", "replica miniature gravy-covered maypole", "replica wax lips", "replica Tome of Snowcone Summoning", "dedigitizer schematic: cybeer", "replica jewel-eyed wizard hat", "replica bottle-rocket crossbow", "replica navel ring of navel gazing", "replica V for Vivala mask", "replica haiku katana", "replica little box of fireworks", "replica cotton candy cocoon", "replica Elvish sunglasses", "replica squamous polyp", "replica floaty stone sphere", "replica Greatest American Pants", "replica organ grinder", "replica Juju Mojo Mask", "replica Operation Patriot Shield", "replica Libram of Resolutions", "replica plastic vampire fangs", "replica cute angel", "replica Camp Scout backpack", "replica deactivated nanobots", "replica Apathargic Bandersnatch", "replica Smith's Tome", "replica over-the-shoulder Folder Holder", "replica Order of the Green Thumb Order Form", "shrink-wrapped Cincho de Mayo", "Cincho de Mayo", "dedigitizer schematic: psilocyber mushroom", "replica Little Geneticist DNA-Splicing Lab", "replica still grill", "replica Crimbo sapling", "replica yellow puck", "replica Chateau Mantegna room key", "replica Deck of Every Card", "replica Source terminal", "replica disconnected intergnat", "replica Witchess Set", "replica genie bottle", "replica space planula", "replica unpowered Robortender", "replica Neverending Party invitation envelope", "replica January's Garbage Tote", "replica God Lobster Egg", "replica Fourth of May Cosplay Saber", "replica Kramco Sausage-o-Matic&trade;", "replica hewn moon-rune spoon", "replica baby camelCalf", "replica Powerful Glove", "replica Cargo Cultist Shorts", "replica industrial fire extinguisher", "replica miniature crystal ball", "replica emotion chip", "replica Jurassic Parka", "replica grey gosling", "replica designer sweatpants", "replica plastic pumpkin bucket", "replica Ten Dollars", "replica Cincho de Mayo", "Thwaitgold splendor beetle statuette", "shrink-wrapped 2002 Mr. Store Catalog", "2002 Mr. Store Catalog", "&quot;I survived Y2K&quot; T-Shirt", "Letter from Carrie Bradshaw", "pro skateboard", "Mr. Accessaturday", "Meat Butler", "Loathing Idol Microphone", "Charter: Nellyville", "Manual of Secret Door Detection", "Flash Liquidizer Ultra Dousing Accessory", "Amulet of Perpetual Darkness", "Giant black monolith", "Crimbo cookie sheet", "Spooky VHS Tape", "scroll of minor invulnerability", "Lapis Lazuli", "Eye Agate", "Azurite", "Arrow (+1)", "scroll of protection from lycanthropes", "Loathing Idol Microphone (75% charged)", "Loathing Idol Microphone (50% charged)", "Loathing Idol Microphone (25% charged)", "Replica 2002 Mr. Store Catalog", "Mr. Big's Wallet", "Sexy Cosmo", "Souvenir Chopsticks", "red-soled high heels", "cyburger", "ncle leg", "rutabuga bag", "mesquito proboscis", "senate fly thorax", "bug juice", "spider leg", "beetle antenna", "mantis skull", "chitin powder", "daddy shortlegs leg", "birdybug antenna", "kilopede skull", "haemolymphnode", "chitin powder paste", "sleeping patriotic eagle", "claw-held flag", "souvenir flag", "name change form", "replica sleeping patriotic eagle", "boxed august scepter", "august scepter", "watermelon", "watermelon seed", "water balloon", "thriftshop coupon", "waffle", "fixodent", "cat o' nine teeth", "tooth cap", "toothy trousers", "banana split", "handful of toilet paper", "Mrs. Rush", "tiny gold medal", "bottle of Cabernet Sauvignon", "baywatch", "Pocket Guide to Mild Evil", "Pocket Guide to Mild Evil (used)", "tiny consolation ribbon", "replica august scepter", "Thwaitgold fairyfly statue", "residual chitin paste", "concentrated cooking", "ancient meat", "sparkling orb", "hardening cream", "pool shark hair oil", "book of facts", "book of facts (dog-eared)", "Dark Jill-of-All-Trades", "LED candle", "map to a candy-rich block", "sampler size toothpaste", "Franken Stein", "A Guide to Burning Leaves", "inflammable leaf", "tiny rake", "rake", "autumnic bomb", "forest canopy bed", "day shortener", "extra time", "autumnal aegis", "distilled resin", "super-heated leaf", "lit leaf lasso", "tied-up flaming leaflet", "tied-up flaming monstera", "tied-up leaviathan", "impromptu torch", "flaming fig leaf", "smoldering drape", "smoldering leafcutter ant egg", "flaming leaf crown", "leafy browns", "autumnic balm", "coping juice", "candy cane sword cane", "wrapped candy cane sword cane", "Elf Guard patrol cap", "Elf Guard hotpants", "Crimbuccaneer tricorn", "Crimbuccaneer breeches", "automa-bot parts", "security automa-core", "clerical automa-core", "handful of Boltsmann bearings", "Spring Bros. solenoid", "Spring Bros. ID badge", "Boltsmann ID badge", "housekeeping automa-core", "portable housekeeping robot", "pickled bread", "salted mutton", "corned beet", "tiny plastic Armory", "tiny plastic Bar", "tiny plastic Cafe", "tiny plastic Factory", "tiny plastic Abuela's cottage", "pirate encryption key alpha", "pirate encryption key bravo", "pirate encryption key charlie", "pirate encryption key delta", "wardrobe-o-matic", "futuristic shirt", "futuristic hat", "futuristic collar", "crated wardrobe-o-matic", "peppermint donut", "Elf Guard insignia (private)", "Crimbuccaneer fledges (mint)", "military-grade peppermint oil", "Crimbuccaneer whale oil", "Elf Guard tinsel grenade", "Crimbuccaneer mologrog cocktail", "Elf Army machine parts", "Crimbuccaneer rigging lasso", "Crimbuccaneer lantern", "Crimbuccaneer flotsam", "Crimbuccaneer invasion map", "Crimbuccaneer shirt", "Elf Guard MPC", "Crimbuccaneer piece of 12", "Elf Guard commandeering gloves", "Elf Guard eyedrops", "Crimbuccaneer premium booty sack", "Elf Guard honor present", "Elf Guard officer's sidearm", "Elf Guard insignia (general)", "Crimbow Rainbo", "Elf Guard strategic map", "Crimbuccaneer captain's purse", "Elf Guard broom", "Crimbuccaneer tavern swab", "Elf Guard hangover cure", "old-school pirate grog", "grog nuts", "sawed-off blunderbuss", "officer's nog", "peppermint bomb", "sundae ration", "peppermint tack", "Elf Guard Field Manual: Culinary Arts", "whalesteak", "whalegun", "Cocktails of the Age of Sail", "Elf Guard payroll bag", "Elf Guard clipboard", "pegfinger", "red and white claret", "Elf Guard red and white beret", "shipwright's hammer", "gunwale", "Kelflar vest", "whale cerebrospinal fluid", "Crimbuccaneer runebone", "cannonbomb", "Elf Guard mouthknife", "Crimbuccaneer fledges (disintegrating)", "Elf Guard fuel tank", "massive wrench", "brown pirate pants", "Elf Guard Field Manual: Extortion", "The Encyclopedia of Fruit", "punching mirror", "ancient Elf dessert spoon", "Elf Guard SCUBA tank", "Elf Guard Field Manual: Wilderness Sleeping", "free boots", "baby rigging snake", "Elvish underarmor", "Crimbuccaneer bombjacket", "sugarplum ration", "gingerbread nylons", "rum-soaked fruitcake", "candied lime", "gingerbread pirate", "fruit-stuffed rumcake", "mulled wine", "Swedish coffee", "canteen of eggnog", "hot wine", "Jamaican coffee", "flask of egggrog", "Black and White Apron Enrollment Form", "Black and White Apron Meal Kit", "pirate encryption key (complete)", "yule grog", "wet tack", "whalecake", "gunwale whalegun", "red white and blue claret", "rigging knot", "trick coin", "Elf Guard squirtgun", "chest of &quot;pirate gold&quot;", "sequin-encrusted sweater", "replica Elf Guard medal", "Lil' Snowball Factory", "Elf Guard temporary (permanent) tattoo", "prank Crimbo card", "Crimbuccaneer squirtblunderbuss", "My First Paycheck envelope", "barnacle-encrusted sweater", "Crimbuccaneer nose ring", "pet anchor", "Crimbuccaneer tattoo gift certificate", "Elf Guard safety bear", "stuffed kraken", "precision snowball", "Elf Guard Field Manual: Culinary Arts (used)", "Cocktails of the Age of Sail (used)", "Elf Guard Field Manual: Extortion (used)", "The Encyclopedia of Fruit (used)", "Elf Guard Field Manual: Wilderness Sleeping (used)", "military candy cane", "groggipop", "moss mace", "moss megaphone", "moss medal", "moss mitre", "moss mantle", "moss marlinspike", "moss mulch", "moss floss", "adobe arsecover", "adobe adze", "adobe abacus", "adobe ayam", "adobe ascot", "adobe abaya", "adobe assortment", "adobe brittle", "crepe paper phrygian cap", "crepe paper parachute cape", "crepe paper pie clip", "crepe paper puzzle cube", "crepe paper plunge camisole", "crepe paper polka charm", "crepe paper pared cuttings", "crepe paper peanut candy", "petrified wood war pike", "petrified wood waist protector", "petrified wood wizard's pouch", "petrified wood water purifier", "petrified wood whoopie panama", "petrified wood walking pants", "petrified wood waste parts", "petrified wood wafer praline", "cybeer", "ICEbox", "wired underwear", "encrypted shuriken", "baby chest mimic", "googly chest eyes", "mimic egg", "Crimbuccaneer war standard", "Elf Guard war standard", "in-the-box spring shoes", "spring shoes", "ultra-soft ferns", "crunchy brush", "smashed scientific equipment", "biphasic molecular oculus", "triphasic molecular oculus", "high-tension exoskeleton", "ultra-high-tension exoskeleton", "irresponsible-tension exoskeleton", "quick-release belt pouch", "quick-release fannypack", "quick-release utility belt", "motion sensor", "focused magnetron pistol", "packaged Everfull Dart Holster", "Everfull Dart Holster", "research fragment", "Thwaitgold wolf spider statuette", "boxed Apriling band helmet", "Apriling band helmet", "Apriling band saxophone", "Apriling band quad tom", "Apriling band tuba", "Apriling band staff", "Apriling band piccolo", "boxed Mayam Calendar", "Mayam Calendar", "yam", "yam martini", "sweet potato o' mine", "Southern yam", "sweet potato punch", "Mayam spinach", "yam and swiss", "yam cannon", "tiny yam cannon", "yam battery", "stuffed yam stinkbomb", "furry yam buckler", "thanksgiving bomb", "yamtility belt", "yam slider", "yam mayo", "yam burrito", "visual packet sniffer", "mini kiwi egg", "aviator goggles", "Thwaitgold Illinigina illinoiensis model", "mini kiwi", "mini kiwi bikini", "mini kiwitini", "mini kiwi invisible dirigible", "mini kiwi aioli", "mini kiwi silicon tiepin", "mini kiwi tipi", "mini kiwi digitized cookies", "mini kiwi intoxicating spirits", "mini kiwi antimilitaristic hippy petition", "mini kiwi illicit antibiotic", "mini kiwi whipping stick", "mini kiwi icepick", "mini kiwi-flavored aspirin-injecting lipstick", "packaged Roman Candelabra", "Roman Candelabra", "protogenetic chunklet (synapse)", "protogenetic chunklet (muscle)", "protogenetic chunklet (flagellum)", "protogenetic chunklet (elbow)", "protogenetic chunklet (lips)", "messenger bag RNA", "flagellate flagon", "proto-proto-protozoa", "bacteria bisque", "ciliophora chowder", "cream of chloroplasts", "synaptic soup", "muscular soup", "flagellate soup", "elbow soup", "lip soup", "unevolved organism", "extra ooze", "extra DNA", "untorn tearaway pants package", "tearaway pants", "baby bodyguard", "Doll Moll violin case", "tiny Tina gun", "tattoo gun", "Colera Peste Nebbiolo", "longbox of Batfellow comics", "Thwaitgold shield bug statuette", "bodyguard badge", "Too Cold to Hold: How to Be Cool - A Memoir", "Too Cold to Hold: How to Be Cool - A Memoir (read)", "boxed Sept-Ember Censer", "Sept-Ember Censer", "blade of dismemberment", "miniature Embering Hulk", "Mmm-brr! brand mouthwash", "Septapus summoning charm", "structural ember", "embers-only jacket", "bembershoot", "wheel of camembert", "hat of remembering", "throwin' ember", "head of emberg lettuce", "embering hunk", "soft cap of diminishing returns", "photo booth sized crate", "boxed bat wings", "bat wings", "ember egg", "tiny ember", "oversized monocle on a stick", "cheap plastic pipe", "fake arrow-through-the-head", "giant bow tie", "fake huge beard", "astronaut helmet", "feather boa", "Sheriff badge", "Sheriff pistol", "Sheriff moustache", "photo booth supply list", "peace turkey outline", "tie-dye headband", "whirled peas", "peaza", "peace shooter", "drenchrome 2.0", "Synapse Blaster", "quantized familiar", "quantum watch", "quantized familiar experience", "pea brittle", "peasco sour", "piece of cake", "handful of split pea soup", "Sealed TakerSpace letter of Marque", "TakerSpace letter of Marque", "deft pirate hook", "iron tricorn hat", "jolly roger flag", "sleeping profane parrot", "pirrrate's currrse", "tankard of spiced rum", "tankard of spiced Goldschlepper", "packaged luxury garment", "governor's daughter's lace collar", "governor's daughter's petticoats", "governor's daughter's pearl hairpin", "harpoon", "chili powder cutlass", "cursed Aztec tamale", "jolly roger tattoo kit", "golden pet rock", "groggles", "pirate dinghy", "anchor bomb", "silky pirate drawers", "profane eye patch", "peppermint pegleg", "hard cocoa", "salmagumdi", "tiny plastic Easter Island Bunny", "tiny plastic St. Patrick", "tiny plastic Colonel Brando", "tiny plastic Jedediah and Boiling Cloud", "tiny plastic &quot;Santa Claus&quot;", "Spirit of Easter", "Spirit of St. Patrick's Day", "Spirit of Veteran's Day", "Spirit of Thanksgiving", "Spirit of Christmas", "coney haunch", "dark chocolate egg", "moai toai", "moaiball", "half-digested rat", "four-leaf potato sprout", "potato jacket", "traumatic holiday memory", "Brandonian footlocker key", "military orb", "rum ball", "gravy skin", "gravyskin hat", "gravyskin buckler", "gravyskin skirt", "gravyskin pants", "crystallized pumpkin spice", "room scale green bean casserole", "fragile Christmas ornament", "ragged wool yarn", "perfect Christmas scarf", "snowman-enchanting tophat", "LIDAR candle", "Congressional Medal of Insanity", "pumpkin spice whorl", "Easter grasshopper", "Irish eggnog", "canteen of jungle juice", "turchucken", "mechanically-mulled cider", "holiday trip around the world", "chocolate ostrich egg", "candied beef and cabbage", "candy rations", "double-candied yams", "Christmas ham", "holiday smorgasbord", "Bowl of Infinite Jelly", "bejazzled eyepatch", "Secrets of the Master Egg Hunters", "Secrets of the Master Egg Hunters (used)", "How to Lose Friends and Attract Snakes", "How to Lose Friends and Attract Snakes (used)", "Covert Ops for Kids", "Covert Ops for Kids (used)", "Holiday Multitasking", "Holiday Multitasking (used)", "Hoyle's Guide to Reindeer Games", "Hoyle's Guide to Reindeer Games (used)", "lucky moai statuette", "egg gun", "lucky army helmet", "candy egg deviler", "lucky napkin", "Thanksgiving ration", "Easter eggnog", "clovermint", "nylon Christmas stockings", "tattoo of two turkeys", "deviled candy egg", "McHugeLarge deluxe ski set", "McHugeLarge duffel bag", "McHugeLarge left pole", "McHugeLarge right pole", "McHugeLarge left ski", "McHugeLarge right ski", "1", "0", "eXpand", "brute force hammer", "datastick", "dedigitizer schematic: brute force hammer", "dedigitizer schematic: malware injector", "dedigitizer schematic: cybervisor", "dedigitizer schematic: digibritches", "dedigitizer schematic: cryptocloak", "dedigitizer schematic: zero-trust tanktop", "dedigitizer schematic: retro floppy disk", "dedigitizer schematic: pocket GPU", "dedigitizer schematic: trojan horseshoe", "dedigitizer schematic: familiar-in-the-middle", "cybervisor", "retro floppy disk", "pocket GPU", "malware injector", "CyberRealm keycode", "server room key", "3d printed server room key", "dedigitizer schematic: 3d printed server room key", "logic grenade", "psilocyber mushroom", "dedigitizer schematic: SLEEP(5) rom chip", "dedigitizer schematic: OVERCLOCK(10) rom chip", "dedigitizer schematic: STATS+++ rom chip", "dedigitizer schematic: insignificant bit", "dedigitizer schematic: hashing vise", "dedigitizer schematic: geofencing rapier", "dedigitizer schematic: geofencing shield", "dedigitizer schematic: virtual cybertattoo", "SLEEP(5) rom chip", "OVERCLOCK(10) rom chip", "STATS+++ rom chip", "insignificant bit", "parity bit", "hashing vise", "geofencing rapier", "geofencing shield", "virtual cybertattoo", "ninja rope", "ninja crampons", "ninja carabiner", "synthetic coffee", "iDrops", "shame coil", "new-in-box toy Cupid bow", "toy Cupid bow", "heat arc", "cold scrape", "phantom digit", "foul line", "dark manioc", "Observer source code", "chill gherkin", "childrens' stapler", "plover's egg", "electric flyswatter", "Thwaitgold cordyceps ant statuette", "heat particle", "cold sore", "stomach churner", "phantom brace", "foul cozy", "grim cellophane", "rift oculus", "sweaty egg", "carton of extra-sharp, rusty staples", "glover liners", "mosquito speakers", "assemble-it-yourself Leprecondo", "Leprecondo", "scoop of pre-workout powder", "table tennis ball", "pint of Leprechaun Stout", "phosphor traces", "crafting plans", "Book of Irony", "spoon", "unironic knife", "bar dart", "leprechaun antidepressant pill", "Heck ramen", "tiny burrito", "small beer brat", "tiny peach pie", "incredible mini-pizza", "Divine sidecar", "tangarita sidecar", "gimlet sidecar", "vodka stratocaster sidecar", "prussian cathouse sidecar", "Mon Tiki sidecar", "Packaged April Shower Thoughts Calendar", "April Shower Thoughts shield", "glob of wet paper", "spitball", "wet paper weights", "Three Sheets to the Wind", "pile of wet dates", "papier Mach 1 airplane", "wet blanket", "wet shower cap", "wet shower shoes", "wet shower shorts", "wet paper tiger", "wet paper eye", "wet shower curtain", "wet paper cup", "wet paperback", "wet shower radio", "wet shower stamp", "big birthday bloon", "jawwetter", "Unpeeled Peridot of Peril", "Peridot of Peril", "terrycloth turban", "jockey's hat", "sharpshooter's hat", "extra-tight skullcap", "sturdy pith helmet", "bishop's mitre", "tin foil hat", "construction hardhat", "imposing pilgrim's hat", "crown of thorns", "stylish bycocket", "Thwaitgold mad hatterpillar statuette", "packaged prismatic beret", "prismatic beret", "flak shield", "Axis HQ Code", "yeti in a travel cooler", "cold exchanger", "Axis helmet", "Axis fatigues", "Axis suspenders", "stolen artifact", "really expensive stolen artifact", "priceless stolen artifact", "chocolate rations", "nice nylon stockings", "Allied Radio Backpack Pack", "Allied Radio Backpack", "orphaned baby skeleton", "ordnance magnet", "confetti grenade", "Skeleton Wars rations", "skeleton war fuel can", "skeleton war grenade", "chocolate and nylons detector", "M&ouml;bius ring box", "M&ouml;bius ring", "bone pacifier", "Allied Forces insignia", "Allied Tattoo Kit", "handheld Allied radio", "Axis codebook", "Life Goals Pamphlet", "bully badge", "time cop top hat", "Stock Certificate", "mixed berry jelly", "toast with mixed berry jelly", "cup of sugar", "Susie's cupcake", "clock", "the gun", "fancy old wine", "really, really nice swimming trunks", "sand penny", "undersea surveying goggles", "Ocean-Touched Rum", "water-logged pill", "kelp puck", "scroll of sea strength", "scroll of sea smarts", "scroll of sea smarm", "waterlogged scroll of healing", "sea gel", "octopus ink bladder", "durable dolphin whistle", "Thwaitgold lobster statuette", "packaged Monodent of the Sea", "Monodent of the Sea", "unblemished pearl", "dentadent", "lab-grown blood cubic zirconia", "blood cubic zirconia", "blood thinner", "pheromone cocktail", "spinal tapas", "shrunken head in a duffel bag", "shrunken head", "stocking full of bones", "small peppermint-flavored sugar walking crook", "knucklebone", "Smoking Pope", "prize turkey", "medicinal gruel", "full-sized pumpkin pie", "vodka cranberry sauce", "yammed candy", "treasure chestnut", "mulled butter rum", "cinnamon doubloon", "tiny plastic left skeleton arm", "tiny plastic left skeleton leg", "tiny plastic right skeleton arm", "tiny plastic right skeleton leg", "tiny plastic skeleton pelvis", "discreetly-wrapped Eternity Codpiece", "The Eternity Codpiece", "angelbone kilt", "angelbone totem", "angelbone chopsticks", "angelbone mantle", "angelbone dice", "angelbone halo", "angelbone fragments", "biblically accurate gumdrops", "devilbone helmet", "devilbone greaves", "devilbone shinguards", "devilbone corset", "devilbone flute", "devilbone rosary", "devilbone chunks", "Gehenna tattoo", "burnt incisor", "burnt phalange", "burnt radius", "burnt rib", "burnt skull", "Crymbocurrency", "extra-thick Crimbo sweater", "The Encyclopedia of Holiday Funerary Rites", "Steve Abrams' Holiday Sampler Beer", "crate of prize-winning rum", "bottle of prize-winning rum", "Santa-Slayer medal", "Skull of Claus", "boiling bone marrow", "boiling cerebrospinal fluid", "boiling synovial fluid", "smoldering vertebra", "seal-clubbing club loot box", "legendary seal-clubbing club", "smoldering bone dust", "volatile bone bomb", "hot boning knife", "flaming fistbone", "burnt bone belt", "scorched skull trophy", "wing bone", "weak skeleton venom", "baked bone meal", "tiny plastic skeleton rib cage", "tiny plastic skeleton skull", "tiny plastic skeleton Crimbo hat", "assembled tiny plastic Santa skeleton", "miniature sleigh", "undertakers' forceps", "bone-polishing rag", "scorched skeleton mask", "scorched skeleton shirt", "scorched skeleton pants", "messenger parrot egg", "buryable chest", "Shanty: Let's Beat Up This Drunken Sailor", "Shanty: Let's Beat Up This Drunken Sailor (used)", "Shanty: I'm Smarter Than a Drunken Sailor", "Shanty: I'm Smarter Than a Drunken Sailor (used)", "Shanty: Look At That Drunken Sailor Dance", "Shanty: Look At That Drunken Sailor Dance (used)", "Shanty: Who's Going to Pay This Drunken Sailor?", "Shanty: Who's Going to Pay This Drunken Sailor? (used)", "Shanty: Only Dogs Love a Drunken Sailor", "Shanty: Only Dogs Love a Drunken Sailor (used)", "Crymbocurrency tattoo", "fireproof bonesaw", "vermiculite shield", "cursed ship's lantern", "heat-resistant harpoon pistol", "traditional gingerloaf", "Scotch and eggnog", "counterskeleton elixir", "&quot;salvaged&quot; wine", "The Encyclopedia of Holiday Funerary Rites (used)", "crate of prize-winning cheese", "wedge of prize-winning cheese", "gummi fingerbone", "glimmering golden crystal", "boxed Heartstone", "Heartstone", "Thwaitgold meat bee statuette", "loose Meats", "Archaeologist's Spade", "boxed Archaeologist's Spade", "dinosaur bone fragment", "ancient Pork Elf pottery shard", "2015 landfill detritus", "intact dinosaur egg", "fossilized cow femur", "unopened Pork Elf toiletries kit", "Pork Elf toiletries kit", "Pork Elf mouthwash", "Pork Elf deodorant", "Pork Elf toothpaste", "bolt of striped fabric", "white and gold dress", "blue and black dress", "dinosaur bone broth", "giant gnawing bone", "dinosaur bone club", "dinosaur skull helmet", "dinosaur bone corset", "Pork Elf cough syrup", "Pork Elf neti pot", "Pork Elf medicine cabinet", "Pork Elf sink", "Pork Elf toilet", "rat pizza", "Fleek&trade; mascara", "hoverboard", "left shark fin", "fitness tracking bracelet", "candy bone", "wrapped Baseball Diamond", "Baseball Diamond", "discarded hot dog", "most of a beer", "pasta wand loot box", "legendary pasta wand", "legendary noodles", "can of tuna", "alien salad", "ratbatatouille", "spicy onigiri", "haunted crudit&eacute;s", "sauced mutton", "hot honey ant", "tomb aspic", "later tots", "Frutti di Scatoletta", "Pesto alla Marziano", "Arrattabbattabiata", "Orzo di Riso", "Pasta Grimavera", "Linguini Ubriacapa", "Formica e Pepe", "Tubetto Gelatto", "Gnocci Domani", "Thwaitgold wallet moth statuette", "scabbarded Sword of S Words", "second-hand synthetic sloth skin scabbard", "mega helmet", "shrink-wrapped Cup of 13s", "Cup of 13s"]))
	{
		for (let ut of Item.get(["Comet Pop", "black candy heart", "explosion-flavored chewing gum"]))
		{
			if (it === ut && itemAmount(it) > 0)
			{
				candyList.set(candyList.size, it);
			}
		}
		if (it.candy && itemAmount(it) > 0 && auto_mall_price(it) <= maxprice && it.tradeable)
		{
			candyList.set(candyList.size, it);
		}
	}
	if (candyList.size === 0)
	{
		getCandy();
		for (let it of Item.get(["seal-clubbing club", "seal tooth", "helmet turtle", "turtle totem", "pasta spoon", "ravioli hat", "saucepan", "spices", "disco mask", "disco ball", "stolen accordion", "mariachi pants", "moxie weed", "strongness elixir", "magicalness-in-a-can", "spicy noodles", "tortoise's blessing", "asparagus knife", "Kentucky-style derby", "sweet ninja sword", "studded leather boxer shorts", "chewing gum on a string", "ten-leaf clover", "meat paste", "Dolphin King's map", "spider web", "really sticky spider web", "really really sticky spider web", "big rock", "seal-toothed rock", "Bjorn's Hammer", "snorkel", "Dolphin King's crown", "Knob Goblin scimitar", "Knob Goblin tongs", "viking helmet", "Knob Goblin pants", "pretty flower", "casino pass", "ice-cold Sir Schlitz", "hermit permit", "worthless trinket", "worthless gewgaw", "worthless knick-knack", "wooden figurine", "hot buttered roll", "heart of rock and roll", "bowl of cottage cheese", "Rock and Roll Legend", "Knob Goblin Uberpants", "banjo strings", "stone banjo", "Disco Banjo", "jaba&ntilde;ero pepper", "heavy hot sauce", "5-Alarm Saucepan", "stone turtle", "slingshot", "Mace of the Tortoise", "fortune cookie", "oriole-feather headdress", "action figure body", "action figure head", "Mighty Bjorn action figure", "golden twig", "spaghetti with rock-balls", "Pasta Spoon of Peril", "Newbiesport&trade; tent", "bar skin", "wooden stakes", "barskin hat", "barskin tent", "Spooky Temple map", "spooky sapling", "Spooky-Gro fertilizer", "spooky stick", "pretty bouquet", "bugbear bungguard", "fairy gravy boat", "ice-cold Willer", "rusty metal ring", "rusty metal shaft", "Orcish meat locker", "unlocked meat locker", "rusty metal key", "meat from yesterday", "meat stack", "sword hilt", "helmet recipe", "pants kit", "meatsmithing guide", "basic meat sword", "basic meat pants", "basic meat helmet", "dope gangsta bling-bling", "pimpin' meat hat", "dried face", "meat face", "lifeless meat doll", "meat golem", "spooky shrunken head", "spooky staff", "spooky scarecrow", "bowl of lucky charms", "ketchup", "catsup", "big stick", "crossbow string", "basic meat staff", "basic meat crossbow", "meatloaf helmet", "dripping meat sword", "dripping meat staff", "dripping meat crossbow", "Bugfinder Blade", "Gnollish plunger", "spring", "sprocket", "cog", "sprocket assembly", "cog and sprocket assembly", "Gnollish flyswatter", "empty meat tank", "full meat tank", "meat engine", "Gnollish autoplunger", "sticky meat pants", "third-hand nunchaku", "enchanted eyepatch", "frilly skirt", "Meat maid body", "Certificate of Participation", "bitchin' meatcar", "sweet rims", "tires", "dope wheels", "ice-cold six-pack", "valuable trinket", "dingy planks", "dingy dinghy", "anticheese", "cottage", "stone of eXtreme power", "barbed-wire fence", "dinghy plans", "eXtreme meat sword", "eXtreme meat staff", "eXtreme meat crossbow", "Scalp of Gorgolok", "Elder Turtle Shell", "Colander of Em-er'il", "Ancient Saucehelm", "Disco 'Fro Pick", "El Sombrero De Lopez", "guild application", "Dramatic&trade; range", "Gnollish pie tin", "wad of dough", "pie crust", "ghuol egg", "ghuol egg quiche", "skeleton bone", "smart skull", "skewer", "ghuol ears", "ghuol-ear kabob", "bone rattle", "bugbear beanie", "lihc eye", "lihc eye pie", "gnoll lips", "taco shell", "Gnollish casserole dish", "uncooked chorizo", "disembodied brain", "brainy skull", "detective skull", "chorizo taco", "ice-cold fotie", "baseball", "batgut", "bat wing", "briefcase", "fat stacks of cash", "enchanted bean", "loose teeth", "bat guano", "guano coffee cup", "batskin belt", "old batskin belt", "birthday candle", "Mr. Accessory", "eXtreme nose ring", "disassembled clover", "rat whisker", "rat appendix", "shiny ring", "rat appendix kabob", "bat wing kabob", "carob chunks", "herbs", "carob chunk cookies", "secret blend of herbs and spices", "piercing post", "hippy herbal tea", "patchouli incense stick", "wad of tofu", "Feng Shui for Big Dumb Idiots", "decorative fountain", "windchimes", "filthy corduroys", "filthy knitted dread sack", "Uncle Jick's Brownie Mix", "carob brownies", "herb brownies", "hemp string", "necklace chain", "gnoll teeth", "gnoll-tooth necklace", "phat turquoise bead", "phat turquoise bracelet", "eyepatch", "tofu casserole", "can of Red Minotaur", "Kentucky-fried meat sword", "Kentucky-fried meat staff", "Kentucky-fried meat crossbow", "dead guy's watch", "Doc Galaktik's Pungent Unguent", "Doc Galaktik's Ailment Ointment", "Doc Galaktik's Restorative Balm", "Doc Galaktik's Homeopathic Elixir", "Bigger Bugfinder Blade", "Queue Du Coq cocktailcrafting kit", "bottle of gin", "bottle of vodka", "Orcish baseball cap", "Orcish cargo shorts", "Orcish frat-paddle", "orange", "grapefruit", "grapes", "olive", "tomato", "fermenting powder", "salty dog", "bloody mary", "screwdriver", "martini", "bloody beer", "shot of orange schnapps", "shot of grapefruit schnapps", "fine wine", "shot of tomato schnapps", "extra-spicy bloody mary", "dense meat stack", "white snake skin", "White Citadel fries", "White Citadel burger", "piece of wedding cake", "white chocolate chips", "white chocolate chip cookies", "white satin pants", "white lightning", "mullet wig", "meat cowboy hat", "white sword", "white picket fence", "enchanted barbell", "concentrated magicalness pill", "giant moxie weed", "Familiar-Gro&trade; Terrarium", "mosquito larva", "leprechaun hatchling", "extra-strength strongness elixir", "jug-o-magicalness", "suntan lotion of moxiousness", "Pick-O-Matic lockpicks", "gasmask", "Boris's key", "Jarlsberg's key", "Sneaky Pete's key", "walrus-tusk earring", "ring of half-assed regeneration", "Boris's ring", "potato sprout", "Jarlsberg's earring", "Sneaky Pete's breath spray", "can of maces", "rubber axe", "chef's hat", "pail", "demonskin trousers", "dungeoneer's dungarees", "tamarind-flavored chewing gum", "lime-and-chile-flavored chewing gum", "pickle-flavored chewing gum", "jaba&ntilde;ero-flavored chewing gum", "flat dough", "Knob sausage", "Knob mushroom", "dry noodles", "Knob Goblin harem pants", "Knob Goblin harem veil", "Knob Goblin perfume", "Knob Goblin elite helm", "Knob Goblin elite pants", "Knob Goblin elite polearm", "hill of beans", "Knob Goblin visor", "Crown of the Goblin King", "bean burrito", "spicy bean burrito", "insanely spicy bean burrito", "enchanted bean burrito", "spicy enchanted bean burrito", "insanely spicy enchanted bean burrito", "bat haggis", "menudo", "goat cheese", "plain pizza", "sausage pizza", "goat cheese pizza", "mushroom pizza", "goat", "bottle of whiskey", "goat beard", "glass of goat's milk", "white Canadian", "lemon", "lime", "sabre teeth", "sabre-toothed lime cub", "consolation ribbon", "big ol' trophy", "tenderizing hammer", "Cobb's Knob lab key", "Knob Goblin steroids", "Knob Goblin love potion", "Knob Goblin stink bomb", "Knob Goblin sharpening spray", "Knob Goblin seltzer", "Knob Goblin superseltzer", "scrumptious reagent", "Dyspepsi-Cola", "cold ninja mask", "icy katana hilt", "hot katana blade", "icy-hot katana", "ninja hot pants", "frigid ninja stars", "frozen nunchaku", "eXtreme scarf", "snowboarder pants", "Mountain Stream soda", "gr8ps", "t8r tots", "miner's helmet", "miner's pants", "7-Foot Dwarven mattock", "linoleum ore", "asbestos ore", "chrome ore", "linoleum sword hilt", "linoleum stick", "linoleum crossbow string", "asbestos sword hilt", "asbestos stick", "asbestos crossbow string", "chrome sword hilt", "chrome stick", "chrome crossbow string", "linoleum meat stack", "asbestos meat stack", "chrome meat stack", "linoleum sword", "linoleum staff", "linoleum crossbow", "asbestos sword", "asbestos staff", "asbestos crossbow", "chrome sword", "chrome staff", "chrome crossbow", "fuzzy dice", "yeti fur", "meaty helmet turtle", "asbestos helmet turtle", "linoleum helmet turtle", "chrome helmet turtle", "penguin skin", "yak skin", "hippopotamus skin", "penguin shorts", "yakskin pants", "hippopotamus pants", "eXtreme mittens", "handful of drink tickets", "Knob Kitchen grab-bag", "swashbuckling pants", "stuffed shoulder parrot", "acoustic guitarrr", "sunken chest", "pirate pelvis", "pirate skull", "spooky pirate skeleton", "vial of patchouli oil", "sk8board", "Jolly Roger charrrm", "barrrnacle", "Jolly Roger charrrm bracelet", "crowbarrr", "leotarrrd", "safarrri hat", "henna tattoo", "Ferrigno's Elixir of Power", "serum of sarcasm", "tomato juice of powerful power", "philter of phorce", "potion of potency", "cordial of concentration", "ointment of the occult", "oil of expertise", "potion of temporary gr8ness", "box", "nothing-in-the-box", "beanbag chair", "acid-squirting flower", "clown shoes", "bloody clown pants", "long skinny balloon", "balloon helmet", "balloon sword", "balloon monkey", "chef skull", "chef-in-the-box", "bartender skull", "bartender-in-the-box", "chef-skull-in-the-box", "bartender-skull-in-the-box", "beer lens", "beer goggles", "box-in-the-box", "nothing-in-the-box-in-the-box", "box-in-the-box-in-the-box", "foolscap fool's cap", "big red clown nose", "pretentious paintbrush", "pretentious palette", "disease", "sober pill", "rusty screwdriver", "jumbo olive", "dry martini", "ye olde golde frontes", "continuum transfunctioner", "white pixel", "black pixel", "red pixel", "green pixel", "blue pixel", "red pixel potion", "blue pixel potion", "green pixel potion", "purple pixel pie", "ruby W", "wussiness potion", "Imp Ale", "hot wing", "diamond-studded cane", "flaming crutch", "cast", "leather mask", "hellion cube", "infernal insoles", "evil golden arch", "dodecagram", "box of birthday candles", "eldritch butterknife", "Mr. Container", "Newbiesport&trade; backpack", "hemp backpack", "snakehead charrrm", "Talisman o' Namsilat", "arrrgyle socks", "guitar pick", "drab sonata", "mesh cap", "enormous belt buckle", "leather chaps", "ketchup hound", "batblade", "catgut", "cat appendix", "gnatwing", "papaya", "denim axe", "Elf Farm Raffle ticket", "Elfin shortbread", "pagoda plans", "skewered cat appendix", "evil golden arches", "gnatwing earring", "Hell broth", "heavy metal thunderrr guitarrr", "heavy metal sonata", "Hey Deze nuts", "Boris's key lime", "Jarlsberg's key lime", "Sneaky Pete's key lime", "Boris's key lime pie", "Jarlsberg's key lime pie", "Sneaky Pete's key lime pie", "Hey Deze map", "bejeweled accordion strap", "magical mystery juice", "moxie magnet", "strange leaflet", "kickback cookbook", "one-winged stab bat", "rewinged stab bat", "papaya sling", "grue egg", "Frobozz Real-Estate Company Instant House (TM)", "volleyball", "blood-faced volleyball", "fertilized ghuol egg", "spray paint", "special sauce glove", "ladle of mystery", "Gnollish toolbox", "abridged dictionary", "bridge", "dictionary", "pr0n legs", "f3d0r4", "lowercase N", "Tasty Fun Good rice candy", "draggin' ball hat", "1337 7r0uZ0RZ", "Trollhouse cookies", "flaming talons", "Spam Witch sammich", "meat vortex", "334 scroll", "668 scroll", "30669 scroll", "33398 scroll", "64067 scroll", "64735 scroll", "31337 scroll", "pr0n cocktail", "drywall axe", "Pine-Fresh air freshener", "whiskey and cola", "papaya taco", "razor-sharp can lid", "stalk of asparagus", "pregnant mushroom", "ratgut", "sonar-in-a-biscuit", "Mad Train wine", "dirty hobo gloves", "bum cheek", "hermit script", "Double Bacon Beelzeburger", "Lord of the Flies-sized fries", "Brimstone Chicken Sandwich", "Jumbo Dr. Lucifer", "Children's Meal of the Damned", "delicious noodles", "delicious spicy noodles", "painful penne pasta", "ravioli della hippy", "pr0n m4nic0tti", "Hell ramen", "boring spaghetti", "sauce of the ages", "fancy schmancy cheese sauce", "Himalayan Hidalgo sauce", "fettucini Inconnu", "spaghetti with Skullheads", "gnocchetti di Nietzsche", "ridiculously huge sword", "super-spiky hair gel", "soft green echo eyedrop antidote", "cocoa eggshell fragment", "large cocoa eggshell fragment", "cocoa egg", "tiny house", "phonics down", "amulet of extreme plot significance", "scroll of drastic healing", "titanium assault umbrella", "Mohawk wig", "the Slug Lord's map", "pants of the Slug Lord", "Dr. Hobo's scalpel", "Dr. Hobo's map", "Degrassi Knoll shopping list", "Item #13", "Penultimate Fantasy chest", "Tissue Paper Immateria", "Tin Foil Immateria", "Gauze Immateria", "Plastic Wrap Immateria", "S.O.C.K.", "procrastination potion", "heavy D", "original G", "plot hole", "probability potion", "chaos butterfly", "furry fur", "Angry Farmer candy", "Mick's IcyVapoHotness Rub", "giant needle", "thin black candle", "Warm Subject gift certificate", "awful poetry journal", "WA", "NG", "wang", "Wand of Nagamar", "ND", "metallic A", "glowing red eye", "photoprotoneutron torpedo", "furry pants", "disturbing fanfic", "wolf mask", "cool whip", "little paper umbrella", "meat globe", "cheap toaster", "asshat", "abominable snowcone", "Ent cider", "toast", "skeleton key", "skeleton key ring", "Crimbo pressie", "wrapping paper", "fruitcake", "present", "Crimbo sword", "Crimbo hat", "Crimbo pants", "exclusive ultra-rare item", "quantum egg", "intragalactic rowboat", "star", "line", "star chart", "star sword", "star crossbow", "star staff", "star pants", "star hat", "star buckler", "star throwing star", "star starfish", "Richard's star key", "steaming evil", "giant castle map", "spiked femur", "ghuol guolash", "lihc face", "rusty grave robbing shovel", "cranberries", "vodka and cranberry", "whiskey sour", "skull of the Bonerdagon", "dragonbone belt buckle", "badass belt", "chest of the Bonerdagon", "roll in the hay", "slap and tickle", "slip 'n' slide", "a little sump'm sump'm", "horizontal tango", "pink pony", "Mr. Shirt", "enchanted brass knuckles", "blood of the Wereseal", "pixel hat", "pixel pants", "pixel sword", "digital key", "Ascension Souvenir T-Shirt", "harem girl t-shirt", "Knob Goblin elite shirt", "frilly shirt", "soggy wofl t-shirt", "loathing eagle baby-doll shirt", "pirate shirt", "filthy hippy poncho", "floral print shirt", "coconut bikini top", "goth kid t-shirt", "hamethyst", "baconstone", "porquoise", "pork elf goodies sack", "ring setting", "jewelry-making pliers", "hamethyst earring", "hamethyst necklace", "hamethyst bracelet", "hamethyst ring", "baconstone earring", "baconstone pendant", "baconstone bracelet", "baconstone ring", "porquoise eyebrow ring", "porquoise necklace", "porquoise bracelet", "porquoise ring", "Knoll mushroom", "spooky mushroom", "one million meat pancakes", "huge mirror shard", "hedge maze puzzle", "hedge maze key", "fishbowl", "fishtank", "fish hose", "hosed tank", "hosed fishbowl", "makeshift SCUBA gear", "easter egg balloon", "stone tablet (Sinister Strumming)", "stone tablet (Squeezings of Woe)", "stone tablet (Really Evil Rhythm)", "tambourine bells", "tambourine", "broken skull", "Knoll shroomkabob", "stuffed spooky mushroom", "hair spray", "serrated proboscis extension", "stat script", "Knob Goblin firecracker", "gourd potion", "warm mushroom", "spicy mushroom quesadilla", "cool mushroom", "cool mushroom casserole", "pointy mushroom", "cream of pointy mushroom soup", "flaming mushroom", "frozen mushroom", "stinky mushroom", "ghost cucumber", "dill", "vinegar", "brine", "especially salty dog", "ghostly pickling solution", "spectral pickle", "briny vinegar", "ghost pickle on a stick", "cologne of contempt", "spork", "voodoo doll", "basic meat fez", "tassel", "foon", "basic meat spork", "basic meat foon", "Yeti Protest Sign", "kneecapping stick", "iron pasta spoon", "support cummerbund", "Mob Penguin cellular phone", "scroll of pasta summoning", "mafia aria", "Mr. Exploiter", "'Villa' document", "Acqua Del Piatto Merlot", "raffle ticket", "strawberry", "bottle of rum", "strawberry daiquiri", "rum and cola", "grog", "Mafia bow tie", "Golden Mr. Accessory", "oil of stability", "oil of slipperiness", "Acque Luride Grezze Cabernet", "cement shoes", "rockin' wagon", "ocean motion", "fuzzbump", "poutine", "Knob stir-fry", "Knoll stir-fry", "spooky stir-fry", "asparagus stir-fry", "olive stir-fry", "Knob sausage stir-fry", "bat wing stir-fry", "rat appendix stir-fry", "tofu stir-fry", "pr0n stir-fry", "Knob stuffed shells", "b&auml;tzle", "ratini", "Knob stroganoff", "menudo ravioli", "plus sign", "milky potion", "swirly potion", "bubbly potion", "smoky potion", "cloudy potion", "effervescent potion", "fizzy potion", "dark potion", "murky potion", "baby killer bee", "anti-anti-antidote", "royal jelly", "small box", "large box", "vorpal blade", "cornuthaum", "ring of aggravate monster", "mind flayer corpse", "Uovo Marcio Shiraz", "Mafia stogie", "Maiali Sifilitici Pinot Noir", "Mafia violin case", "tomato daiquiri", "beertini", "salty slug", "papaya slung", "MAHI fez", "heteroerotic frat-paddle", "hypodermic needle", "Meat detector", "many-eyed glasses", "prosthetic forehead", "tiny shaker of salt", "blundarrrbus", "sucky decal", "tiny balloon knife", "shock collar", "moonglasses", "palm-frond toupee", "tiny knife and fork", "eye-pod", "chocolate spurs", "magnifying glass", "skewer-mounted razor blade", "brass stinger", "lead necklace", "shaving cream", "pine tar", "forest tears", "fetus-smashing club", "meatcar model", "Time Juice", "rolling pin", "unrolling pin", "crazy bastard sword", "incredibly dense meat gem", "Talisman of Baio", "hypnodisk", "bottle of goofballs", "disbelief suspenders", "supportive bra", "Blatantly Canadian", "maple syrup", "los chinos", "wooden axe", "leaflet", "leaf", "maple leaf", "balaclava", "balaclava baklava", "Warehouse 23 bling", "bugbear-smiting sword", "lumbering jack", "Dark Jill-O-Lantern", "Ms. Accessory", "Mr. Accessory Jr.", "coffee sprite", "Cheshire Bitten", "custom avatar form", "smile-sharpening stone", "miniature espresso maker", "100-Watt bulb", "Spasmi Dolorosi Del Rene Champagne", "old school Mafia knickerbockers", "Yummy Tummy bean", "Rock Pops", "Mr. Mediocrebar", "Cold Hots candy", "Wint-O-Fresh mint", "dwarf bread", "Senior Mints", "pixellated candy heart", "candied kobold", "hand turkey outline", "candied yam pinky ring", "intergalactic pom poms", "Mob Penguin protection contract", "Radio Free Baseball Cap", "Radio Free Pants", "Radio Free Foil", "radio button candy", "severed rocking horse head", "broken cellular phone", "crimbo elfling", "dental pliers", "Hawking's Elixir of Brilliance", "Ferita Del Petto Zinfandel", "fuzzy bracelets", "arse-shooting crossbow", "spiced rum", "eggnog", "candy cane", "gingerbread bugbear", "imitation nice watch", "Hanukkimbo dreidl", "menorette", "tiny plastic sword", "small Crimbo Pressie", "bow", "Crimbo stocking", "bowler", "bow staff", "bowlegged pants", "skewered jumbo olive", "skewered lime", "skewered cherry", "dirty martini", "grogtini", "cherry bomb", "extra special Crimbo stocking", "spooky hockey mask", "penguin-smacking club", "orphan baby yeti", "fez of etymology", "carob chunk noodles", "chorizo brownies", "white chocolate and tomato pizza", "flange", "clockwork key", "silk garter snake", "velvet choker", "tiny plastic seal clubber", "tiny plastic turtle tamer", "tiny plastic pastamancer", "tiny plastic sauceror", "tiny plastic disco bandit", "tiny plastic accordion thief", "tiny plastic mosquito", "tiny plastic leprechaun", "tiny plastic levitating potato", "tiny plastic angry goat", "tiny plastic sabre-toothed lime", "tiny plastic fuzzy dice", "tiny plastic spooky pirate skeleton", "tiny plastic barrrnacle", "tiny plastic howling balloon monkey", "tiny plastic stab bat", "tiny plastic grue", "tiny plastic blood-faced volleyball", "tiny plastic ghuol whelp", "tiny plastic baby gravy fairy", "tiny plastic cocoabo", "tiny plastic star starfish", "tiny plastic ghost pickle on a stick", "tiny plastic killer bee", "tiny plastic Cheshire bat", "tiny plastic coffee pixie", "tiny plastic bitchin' meatcar", "tiny plastic hermit", "tiny plastic Boris", "tiny plastic Jarlsberg", "tiny plastic Sneaky Pete", "tiny plastic Susie", "Lucky Surprise Egg", "maiden wig", "maid head", "Meat maid", "Xlyinia's notebook", "soda water", "bottle of tequila", "boxed wine", "cherry", "coconut shell", "magical ice cubes", "vodka martini", "whiskey and soda", "monkey wrench", "tequila sunrise", "margarita", "strawberry wine", "wine spritzer", "perpendicular hula", "ducha de oro", "calle de miel", "dry vodka martini", "old-fashioned", "tequila with training wheels", "sangria", "vesper", "bodyslam", "sangria del diablo", "Valentine", "whip kit", "buckler buckle", "hippo whip", "penguin whip", "yak whip", "gnauga hide whip", "gnauga hide", "hippo skin buckler", "penguin skin buckler", "yakskin buckler", "gnauga hide buckler", "Connery's Elixir of Audacity", "lucky Tam O'Shanter", "green beer", "string of red beads", "string of blue beads", "string of green beads", "cheap plastic bottle opener", "orange traffic cone", "N. O. Beer", "red striped oyster egg", "red polka-dot oyster egg", "red paisley oyster egg", "red plastic oyster egg", "blue striped oyster egg", "blue polka-dot oyster egg", "blue paisley oyster egg", "blue plastic oyster egg", "puce striped oyster egg", "puce polka-dot oyster egg", "puce paisley oyster egg", "puce plastic oyster egg", "mauve striped oyster egg", "mauve polka-dot oyster egg", "mauve paisley oyster egg", "mauve plastic oyster egg", "lavender striped oyster egg", "lavender polka-dot oyster egg", "lavender paisley oyster egg", "lavender plastic oyster egg", "black striped oyster egg", "black polka-dot oyster egg", "black paisley oyster egg", "black plastic oyster egg", "off-white striped oyster egg", "off-white polka-dot oyster egg", "off-white paisley oyster egg", "off-white plastic oyster egg", "yellow striped oyster egg", "yellow polka-dot oyster egg", "yellow paisley oyster egg", "yellow plastic oyster egg", "oyster basket", "emo roe", "gazing shoes", "personal raindrop", "rainbow tie", "clockwork widget", "clockwork thingamajig", "clockwork doohickey", "clockwork clockwise dome", "clockwork spine", "clockwork rings", "clockwork claws", "clockwork sheet", "clockwork counterclockwise dome", "clockwork sphere", "deactivated MicroMechaMech", "clockwork endoskeleton", "clockwork hat", "clockwork trench coat", "clockwork pants", "gnauga hide chaps", "false eyelashes", "targeting chip", "unwound clockwork grapefruit", "tiny Mountie hat", "clockwork bartender head", "clockwork chef head", "clockwork maid head", "clockwork detective skull", "clockwork bartender-head-in-the-box", "clockwork chef-head-in-the-box", "clockwork bartender-in-the-box", "clockwork chef-in-the-box", "clockwork maid", "tisket", "tasket", "annoying pitchfork", "Stupid University Diploma", "pregnant flaming mushroom", "pregnant frozen mushroom", "pregnant stinky mushroom", "inexplicably glowing rock", "spooky fairy gravy", "halfberd", "small leather glove", "spooky glove", "enchanted toothpick", "tiny ninja sword", "teeny-tiny ninja stars", "sequined fez", "blank white card", "beet", "Totally Gay Claymore", "star shirt", "spooky cosmetics bag", "spooky eyeliner", "spooky lipstick", "spooky bicycle chain", "mushroom fermenting solution", "flaming mushroom wine", "icy mushroom wine", "stinky mushroom wine", "pointy mushroom wine", "flat mushroom wine", "cool mushroom wine", "knob mushroom wine", "knoll mushroom wine", "spooky mushroom wine", "shot of flower schnapps", "flower petal pie", "bottle of single-barrel whiskey", "giant discarded plastic fork", "miniature gravy-covered maypole", "Retenez L'Herbe Pat&eacute;", "Breathetastic&trade; Premium Canned Air", "letter from King Ralph XI", "wholeberd", "Meleegra&trade; pills", "mariachi G-string", "irate sombrero", "pile of candy", "handsomeness potion", "marzipan skull", "poultrygeist", "hovering sombrero", "tiny maracas", "plain brown wrapper", "less-than-three-shaped box", "exactly-three-shaped box", "chocolate box", "miniature coffin", "solid asbestos box", "solid linoleum box", "solid chrome box", "cryptic puzzle box", "refrigerated biohazard container", "magnetic field", "potted cactus", "daisy", "potted fern", "tulip", "Venus flytrap", "all-purpose flower", "exotic orchid", "long-stemmed rose", "gilded lily", "deadly nightshade", "black lotus", "stuffed can of asparagus", "stuffed dodecapede", "stuffed ghuol whelp", "stuffed zmobie", "Raggedy Hippy doll", "stuffed stab bat", "apathetic lizardman doll", "stuffed yeti", "stuffed Mob Penguin", "stuffed sabre-toothed lime", "giant stuffed bugbear", "mugcake", "urinal cake", "Happy Birthday, Claude! cake", "personalized birthday cake", "three-tiered wedding cake", "babycakes", "blue velvet cake", "congratulatory cake", "angel-food cake", "devil's-food cake", "birthday party jellybean cheesecake", "white balloon", "green balloon", "heart-shaped balloon", "anniversary balloon", "Mylar balloon", "Kevlar balloon", "thought balloon", "rat head balloon", "mini-zeppelin", "Mr. Balloon", "red balloon", "Mr. Eh?", "pimonkey item", "stainless steel shillelagh", "stainless steel skullcap", "stainless steel solitaire", "stainless steel scarf", "stainless steel slacks", "stainless steel suspenders", "plexiglass pikestaff", "plexiglass pith helmet", "plexiglass pocketwatch", "plexiglass pinky ring", "plexiglass pants", "plexiglass pendant", "hockey stick of furious angry rage", "tapped black lotus", "flaming glowsticks", "iced-out bling", "limburger biker boots", "miniature carton of clove cigarettes", "deflated inflatable dodecapede", "toy six-seater hovercraft", "Glass Balls of the Goblin King", "Codpiece of the Goblin King", "rib of the Bonerdagon", "vertebra of the Bonerdagon", "Bonerdagon necklace", "Boss Bat britches", "Boss Bat bling", "Knob shroomkabob", "spooky shroomkabob", "pile of jumping beans", "jumping bean burrito", "spicy jumping bean burrito", "insanely spicy jumping bean burrito", "rat scrapple", "pail of pretentious paint", "yellow traffic cone", "wax lips", "Hatorade", "off-hand balloon", "pygmy bugbear shaman", "tiny nose-bone fetish", "box of sunshine", "gloomy black mushroom", "dead mimic", "pine wand", "ebony wand", "hexagonal wand", "aluminum wand", "marble wand", "magic lamp", "Medicinal Herb's medicinal herbs", "basic meat skirt", "Otorian Battle Scar", "basic meat kilt", "sticky meat skirt", "sticky meat kilt", "penguinskin mini-skirt", "penguinskin mini-kilt", "yakskin skirt", "yakskin kilt", "hippopotamus skirt", "hippopotamus kilt", "furry skirt", "furry kilt", "gnauga hide skirt", "gnauga hide kilt", "cheap wind-up clock", "Jekyllin hide belt", "skirt / kilt kit", "ring of adornment", "ring of increase damage", "ring of gain strength", "ring of cold resistance", "ring of fire resistance", "ring of conflict", "pirate hook", "monster bait", "deodorant", "reodorant", "Mjolnir Jr.", "doppelshifter egg", "tiny makeup kit", "red traffic cone", "calm attention-deficit demon", "unwound cymbal-playing monkey", "attention spanner", "funky brass fez", "comfy blanket", "Baron von Ratsworth's monocle", "Baron von Ratsworth's money clip", "Baron von Ratsworth's tophat", "rose-colored glasses", "facsimile dictionary", "blood flower", "lovecat tail", "plastic passion fruit", "questionable taco", "Doc's Miracle Cure", "petrified time", "time helmet", "time trousers", "time sword", "Dyspepsi-Cola helmet", "Cloaca-Cola shield", "Cloaca-Cola fatigues", "Dyspepsi-Cola shield", "Dyspepsi-Cola fatigues", "Cloaca-Cola helmet", "Cloaca-Cola knapsack", "Dyspepsi-Cola knapsack", "Cloaca-Cola", "Dyspepsi grenade", "Cloaca grenade", "Dyspepsi-Cola d-rations", "Cloaca-Cola c-rations", "Cloaca-Cola-issue combat knife", "Dyspepsi-Cola-issue canteen", "picture of a dead guy's girlfriend", "zombie pineal gland", "Gummi-Gnauga", "Now and Earlier", "Sugar Cog", "loaded serum blowgun", "empty blowgun", "miniscule temporal rip", "1.21 jigawatts", "giant pinky ring", "redrum", "ninja pirate zombie robot", "pile of shiny pebbles", "bowl of oriole's nest soup", "bunny liver", "Mt. Noob Pale Ale", "pirate zombie head", "ninja pirate zombie robot head", "pirate zombie robot head", "disembodied smile", "golden sausage", "clockwork pirate skull", "rhesus monkey", "tofurkey leg", "tofurkey gravy", "herbal stuffing", "can-shaped gelatinous cranberry sauce", "candied yams", "rhinestone cowboy shirt", "gingham blouse", "souvenir ski t-shirt", "sweet nutcracker", "metal mandible", "tiny plastic Crimbo wreath", "tiny plastic Uncle Crimbo", "tiny plastic Crimbo elf", "tiny plastic sweet nutcracker", "tiny plastic Crimbo reindeer", "aspirin", "fancy chocolate", "length of string", "googly eye", "stuffing", "felt", "wooden block", "toy wheel", "yo-yo", "top", "ball", "kite", "pet rock", "stuffed doppelshifter", "teddy bear", "duck-on-a-string", "toy soldier", "doll house", "toy train", "marionette", "sock monkey", "rag doll", "can of fake snow", "colored-light &quot;necklace&quot;", "tree skirt", "wreath-shaped Crimbo cookie", "bell-shaped Crimbo cookie", "tree-shaped Crimbo cookie", "Unionize The Elves sign", "sleeping snowy owl", "Tome of Snowcone Summoning", "purple snowcone", "green snowcone", "orange snowcone", "red snowcone", "blue snowcone", "black snowcone", "Pretty Predator Clawicure Kit", "teddy bear sewing kit", "green traffic cone", "Scandalously Skimpy Bikini", "Sombrero De Vida", "iceberglet", "ice sickle", "ice baby", "ice pick", "ice skates", "grue egg omelette", "roll of drink tickets", "pregnant gloomy black mushroom", "pregnant oily golden mushroom", "oily golden mushroom", "fruit bowl", "fruit basket", "hot pink lipstick", "hot stuffing", "useless powder", "twinkly powder", "hot powder", "cold powder", "spooky powder", "stench powder", "sleaze powder", "twinkly nuggets", "hot nuggets", "cold nuggets", "spooky nuggets", "stench nuggets", "sleaze nuggets", "twinkly wad", "hot wad", "cold wad", "spooky wad", "stench wad", "sleaze wad", "double daisy", "miniature stuffed Goth Giant", "Valentine's Day cake", "arrow'd heart balloon", "black velvet box", "squashed frog", "eye of newt", "salamander spleen", "sleazy fairy gravy", "suede shortsword", "bamboo bokuto", "25-meat staff", "two-handed depthsword", "bill bec-de-bardiche glaive-guisarme", "lead yo-yo", "slightly peevedbow", "sack of doorknobs", "lucky ball-and-chain", "automatic catapult", "pentacorn hat", "goofily-plumed helmet", "yellow plastic hard hat", "wooden salad bowl", "football helmet", "chain-mail monokini", "union scalemail pants", "paper-plate-mail pants", "troutpiece", "alpha-mail pants", "lucky rabbit's foot", "massive bag of catnip", "hang glider", "March hat", "miniature dormouse", "chopsticks", "rice bowl", "ninja mop", "ridiculously overelaborate ninja weapon", "sugar-coated pine cone", "blue traffic cone", "gloomy mushroom wine", "oily mushroom wine", "McPhee's Grimoire of Hilarious Object Summoning", "whoopie cushion", "fake fake vomit", "explosion-flavored chewing gum", "clown hammer", "rubber emo roe", "yellow snowcone", "magical ice cube with a fly in it", "calle de miel with a fly in it", "rockin' wagon with a fly in it", "perpendicular hula with a fly in it", "slap and tickle with a fly in it", "bag of airline peanuts", "fake hand", "Knob Goblin pet-buffing spray", "Knob Goblin learning pill", "Knob Goblin eyedrops", "Knob Goblin nasal spray", "KWE-brand transistor radio", "vampire heart", "Talisman of Bakula", "Radio KoL Coffee Mug", "Frank Gorshin trophy", "Radio Free Jersey", "bottle of used blood", "wind-up chattering teeth", "joybuzzer", "pet rock &quot;Snooty&quot; disguise", "diamond-studded fronts", "portable corkscrew", "St. Sneaky Pete's Day goodies basket", "fake plastic grass", "grass skirt", "grass hat", "grass blade", "raffle prize box", "homeless hobo spirit", "weegee sqouija", "sparkly engagement ring", "lucky Tam O'Shatner", "Grimacite goggles", "Grimacite glaive", "Grimacite greaves", "Grimacite garter", "Grimacite galoshes", "Grimacite gorget", "Grimacite guayabera", "Codex of Capsaicin Conjuration", "Gazpacho's Glacial Grimoire", "MSG", "second-hand knockoff engagement ring", "bottle of Domesticated Turkey", "bottle of Definit", "bottle of Calcutta Emerald", "bottle of Lieutenant Freeman", "bottle of Jorge Sinsonte", "boxed champagne", "kumquat", "tangerine", "tonic water", "cocktail onion", "raspberry", "kiwi", "whiskey bittersweet", "mimosette", "tequila sunset", "zmobie", "gin and tonic", "vodka and tonic", "vodka gibson", "gibson", "parisian cathouse", "rabbit punch", "caipifruta", "teqiwila", "Divine", "Gordon Bennett", "tangarita", "mandarina colada", "gimlet", "yellow brick road", "vodka stratocaster", "Neuromancer", "prussian cathouse", "Mae West", "Mon Tiki", "teqiwila slammer", "Knob lo mein", "asparagus lo mein", "Knoll lo mein", "spooky lo mein", "olive lo mein", "hot hi mein", "cold hi mein", "spooky hi mein", "stinky hi mein", "sleazy hi mein", "Junior LAAAAME merit badge", "Senior LAAAAME merit badge", "jazz soap", "tangarita with a fly in it", "mandarina colada with a fly in it", "prussian cathouse with a fly in it", "Mae West with a fly in it", "astronaut ice-cream", "delectable catalyst", "ultimate wad", "libation of liveliness", "eyedrops of the ermine", "perfume of prejudice", "eyedrops of the ocelot", "potent potion of potency", "concentrated cordial of concentration", "coffin lid", "white satin shield", "Cerebral Cloche", "Cerebral Culottes", "Cerebral Crossbow", "ice stein", "munchies pill", "homeopathic healing powder", "astral badger", "astral mushroom", "badger badge", "blue-frosted astral cupcake", "green-frosted astral cupcake", "orange-frosted astral cupcake", "purple-frosted astral cupcake", "pink-frosted astral cupcake", "raspberry beret", "pixel shield", "beer cartilage", "Spanish fly trap", "Spanish fly", "around the world", "scrumdiddlyumptious solution", "Toddler-sized Dragon Costume", "lotion of hotness", "lotion of coldness", "lotion of spookiness", "lotion of stench", "lotion of sleaziness", "Grimacite Bock", "wedge of gray cheese", "hot and sour sauce", "cold and sour sauce", "spooky and sour sauce", "stench and sour sauce", "sleazy and sour sauce", "brick", "milk of magnesium", "foie gras", "candy brain", "jewel-eyed wizard hat", "wad of Crovacite", "white collar", "White Citadel Satisfaction Satchel", "onion shurikens", "Cherry Cloaca Cola", "Diet Cloaca Cola", "Regular Cloaca Cola", "Radio KoL Keychain", "Radio KoL Antenna Ball", "Radio KoL Flashlight", "Radio KoL Maracas", "Radio KoL Bottle Opener", "Radio KoL Patch", "Cat-Herding Prod", "star boomerang", "star stiletto", "fraudwort", "shysterweed", "swindleblossom", "grave robbing shovel", "superhero mask", "cardboard ore", "styrofoam ore", "bubblewrap ore", "pet rock &quot;Groucho&quot; disguise", "cardboard sword", "cardboard staff", "bubblewrap sword", "bubblewrap staff", "bubblewrap crossbow", "styrofoam sword", "styrofoam staff", "styrofoam crossbow", "Platinum Yendorian Express Card", "cardboard crossbow", "blue ribbon", "giant discarded bottlecap", "giant discarded torn-up glove", "salamander slurry", "eyedrops of newt", "Frogade", "papotion of papower", "royal jelly taco", "tofu taco", "jumping bean taco", "catgut taco", "goat cheese taco", "pr0n taco", "alphabet gum", "Comma Chameleon egg", "shingle", "flaregun", "flaming cardboard sword", "flypaper staff", "grease gun", "sword of static", "wiffle-flail", "bubble bauble bow", "Frost&trade; brand sword", "squeaky staff", "can cannon", "starchy sword", "starchy staff", "starchy crossbow", "pestoblade", "poutine pole", "curdflinger", "muculent machete", "glistening staff", "repeating crossbow", "bigger stick", "sinewy crossbow string", "sturdy sword hilt", "dense meat sword", "dense meat staff", "dense meat crossbow", "Spirit Precipice", "smoldering staff", "hot cross bow", "sword behind inappropriate prepositions", "meatspout staff", "carob cannon", "shuddersword", "hairy staff", "projectile icemaker", "buffalo blade", "giant cheesestick", "potato pistol", "savory sword", "savory staff", "savory crossbow", "Super Magic Power Sword X", "soylent staff", "goulauncher", "defective skull", "Gnollish pie server", "Gnollish slotted spoon", "Knob Goblin spatula", "jack flapper", "filthy pestle", "Knob Goblin melon baller", "huge spoon", "oversized pizza cutter", "star spatula", "foon of fulmination", "foon of frigidity", "foon of foulness", "foon of fearfulness", "foon of fleshiness", "[1764]Spookyraven library key", "Spookyraven gallery key", "Spookyraven ballroom key", "pack of chewing gum", "Gnomish toolbox", "fricasseed brains", "brains casserole", "shiny butcherknife", "corn holder", "eggbeater", "bottle of popskull", "dishrag", "stale baguette", "leftovers of indeterminate origin", "ancient frozen dinner", "cardboard katana", "ram stick", "enchantlers", "ram-battering staff", "crazy little Turkish delight", "Snow Queen Crown", "ga-ga radio", "six pack of Mountain Stream", "bag of Cheat-Os", "unrefined Mountain Stream syrup", "frozen Mob Penguin", "Ram's Face Lager", "ram horns", "Travoltan trousers", "pool cue", "handful of hand chalk", "Counterclockwise Watch", "bone collar", "misshapen animal skeleton", "pile of dusty animal bones", "dusty animal skull", "dusty animal cranium", "dusty animal jawbone", "dusty first cervical vertebra", "dusty second cervical vertebra", "dusty third cervical vertebra", "dusty fourth cervical vertebra", "dusty fifth cervical vertebra", "dusty sixth cervical vertebra", "dusty seventh cervical vertebra", "dusty first thoracic vertebra", "dusty second thoracic vertebra", "dusty third thoracic vertebra", "dusty fourth thoracic vertebra", "dusty fifth thoracic vertebra", "dusty sixth thoracic vertebra", "dusty seventh thoracic vertebra", "dusty eighth thoracic vertebra", "dusty ninth thoracic vertebra", "dusty tenth thoracic vertebra", "dusty eleventh thoracic vertebra", "dusty twelfth thoracic vertebra", "dusty first lumbar vertebra", "dusty second lumbar vertebra", "dusty third lumbar vertebra", "dusty fourth lumbar vertebra", "dusty fifth lumbar vertebra", "dusty sixth lumbar vertebra", "dusty seventh lumbar vertebra", "dusty sacral vertebrae", "dusty first caudal vertebra", "dusty second caudal vertebra", "dusty third caudal vertebra", "dusty fourth caudal vertebra", "dusty fifth caudal vertebra", "dusty sixth caudal vertebra", "dusty seventh caudal vertebra", "dusty eighth caudal vertebra", "dusty ninth caudal vertebra", "dusty tenth caudal vertebra", "dusty left first rib", "dusty left second rib", "dusty left third rib", "dusty left fourth rib", "dusty left fifth rib", "dusty left sixth rib", "dusty left seventh rib", "dusty left eighth rib", "dusty left ninth rib", "dusty left tenth rib", "dusty left eleventh rib", "dusty left twelfth rib", "dusty right first rib", "dusty right second rib", "dusty right third rib", "dusty right fourth rib", "dusty right fifth rib", "dusty right sixth rib", "dusty right seventh rib", "dusty right eighth rib", "dusty right ninth rib", "dusty right tenth rib", "dusty right eleventh rib", "dusty right twelfth rib", "dusty animal pelvis", "dusty left scapula", "dusty right scapula", "dusty left clavicle", "dusty right clavicle", "dusty left humerus", "dusty right humerus", "dusty left radius", "dusty right radius", "dusty left ulna", "dusty right ulna", "dusty left femur", "dusty right femur", "dusty left tibia", "dusty right tibia", "dusty left fibula", "dusty right fibula", "dusty left kneecap", "dusty right kneecap", "dusty left first front claw", "dusty left second front claw", "dusty left third front claw", "dusty left fourth front claw", "dusty right first front claw", "dusty right second front claw", "dusty right third front claw", "dusty right fourth front claw", "dusty left thumb", "dusty right thumb", "dusty left first rear claw", "dusty left second rear claw", "dusty left third rear claw", "dusty left fourth rear claw", "dusty right first rear claw", "dusty right second rear claw", "dusty right third rear claw", "dusty right fourth rear claw", "1-ball", "2-ball", "3-ball", "4-ball", "5-ball", "6-ball", "7-ball", "8-ball", "clockwork sword", "clockwork staff", "clockwork crossbow", "clockwork handle", "clockwork rod", "clockwork shank", "Lord Spookyraven's spectacles", "old leather wallet", "old coin purse", "English to A. F. U. E. Dictionary", "bizarre illegible sheet music", "cardboard wakizashi", "gob of wet hair", "roll of toilet paper", "tattered wolf standard", "tattered snake standard", "KoL Con 3-D Glasses", "scary death orb", "tuning fork", "antique greaves", "antique helmet", "antique spear", "antique shield", "pitchfork", "broken sword", "snarling wolf shield", "lupine sword", "snake shield", "serpentine sword", "grouchy restless spirit", "9-ball", "chintzy seal pendant", "chintzy turtle brooch", "chintzy noodle ring", "chintzy saucepan earring", "chintzy disco ball pendant", "chintzy accordion pin", "worn tophat", "tap shoes", "Manetwich", "bottle of Vangoghbitussin", "bottle of Pinot Renoir", "desiccated apricot", "flute of flat champagne", "dehydrated caviar", "styrofoam peanuts", "snifter of thoroughly aged brandy", "disintegrating quill pen", "inkwell", "tattered scrap of paper", "scroll of ancient forbidden unspeakable evil", "can of Binarrrca", "Bit O' Ectoplasm", "dance card", "opera mask", "bottle of Monsieur Bubble", "Amulet of Yendor", "jitterbug larva", "bottle of perfume", "spoon!", "nervous tick egg", "plastic pumpkin bucket", "silver shrimp fork", "half of a memo", "stuffed cocoabo", "stuffed baby gravy fairy", "stuffed flaming gravy fairy", "stuffed frozen gravy fairy", "stuffed stinky gravy fairy", "stuffed spooky gravy fairy", "stuffed sleazy gravy fairy", "stuffed astral badger", "stuffed MagiMechTech MicroMechaMech", "stuffed hand turkey", "stuffed snowy owl", "stuffed scary death orb", "stuffed mind flayer", "stuffed undead elbow macaroni", "stuffed angry cow", "stuffed Cheshire bitten", "stuffed yo-yo", "rubber WWJD? bracelet", "rubber WWBD? bracelet", "rubber WWSPD? bracelet", "rubber WWtNSD? bracelet", "heart necklace", "right half of a heart necklace", "left half of a heart necklace", "pack of KWE trading card", "stick of &quot;gum&quot;", "Das &Uuml;berk&uuml;hlraum trading card", "Vaso De Agua trading card", "The Grand Poo-Bah trading card", "Thorny Toad trading card", "Chori Zo trading card", "Morbidda trading card", "Poison Oak trading card", "Princess Rutabaga trading card", "Roo trading card", "Woldo trading card", "The Snake trading card", "Nayztameetjoo trading card", "Arrrmetia trading card", "Serenity trading card", "Inndya trading card", "Kitty the Zmobie Basher trading card", "diamond necklace", "spade necklace", "club necklace", "cream pie", "cherry pie", "strawberry pie", "lemon meringue pie", "Genalen&trade; Bottle", "mixed wildflower greens", "handful of walnuts", "nutty organic salad", "super salad", "tofu wonton", "hippy protest button", "Lockenstock&trade; sandals", "didgeridooka", "bullet-proof corduroys", "round purple sunglasses", "wicker shield", "Marquis de Poivre soda", "radium-flavored potato chips", "wintergreen-flavored potato chips", "ennui-flavored potato chips", "x-ray specs", "patchouli oil bomb", "ferret bait", "exploding hacky-sack", "hemp net", "your father's MacGuffin diary", "brain-meltingly-hot chicken wings", "frat brats", "knob ka-bobs", "can of Swiller", "broken wings", "sunken eyes", "reassembled blackbird", "tiny bust of Pallas", "black market map", "black snake skin", "adder bladder", "black pension check", "black picnic basket", "Black No. 2", "black sword", "black helmet", "black shield", "blackberry", "forged identification documents", "PADL Phone", "kick-ass kicks", "sake bomb", "tequila grenade", "beer helmet", "distressed denim pants", "perforated battle paddle", "flashing novelty button", "orange glowstick", "anniversary chutney sculpture", "spandex anniversary shorts", "jar of anniversary jam", "bucket of anniversary lard", "anniversary concrete fedora", "makeshift turban", "makeshift cape", "makeshift skirt", "toothbrush", "makeshift crane", "can of starch", "bottle of ultravitamins", "antique bottle of cough syrup", "tube of hair oil", "Daffy Taffy", "Crimboween memo", "pilgrim shield", "fancy bath salts", "antique hand mirror", "hors d'oeuvre tray", "ballroom blintz", "towel", "guy made of bee pollen", "17-ball", "filthy lucre", "hobo gristle", "shredded can label", "bloodstained briquette", "greasy dreadlock", "vial of pirate sweat", "empty aftershave bottle", "coal button", "burned-out arcanodiode", "non-Euclidean hoof", "[2108]rock", "stringy sinew", "stick", "tooth", "big leaf", "wheel", "yo", "prehistoric spear", "stick-on-a-string", "fire", "leaf tube", "lit cigar", "Grateful Undead T-shirt", "ASCII shirt", "safety vest", "eXtreme Bi-Polar Fleece Vest", "Ye Olde Navy Fleece", "bronze breastplate", "white hat hacker T-shirt", "vampire collar", "possessed top", "killer rag doll", "tree-eating kite", "incredibly creepy marionette", "fancy dress ball", "mad scientist's sock monkey", "stuffed alien blob", "vampire duck-on-a-string", "toy crazy train", "razor-tipped yo-yo", "toy mercenary", "spooky length of string", "spooky toy wheel", "spooky wooden block", "spooky felt", "evil googly eye", "spooky stuffing", "evil teddy bear", "evil teddy bear sewing kit", "toothsome rock", "spooky frank", "plate of franks and beans", "shot of blackberry schnapps", "capacitor relay", "carbon nanotube frame", "ion grid", "Feynman gate", "logic synthesizer", "high-resistance ultrapolymer plating", "servomechanical torsion facilitator", "quantum polarity inducer", "bi-lateral logic compressor", "computronic processing unit", "reverse-oscillating klystron", "sub-molecular interocitor", "recursive spline reticulator", "atomic vector plotter", "ion-pulse modulation stabilizer", "hyperbolic plasma focuser", "toy ray gun", "toy space helmet", "MagiMechTech NanoMechaMech", "astronaut pants", "toy jet pack", "triangular stone", "mossy stone sphere", "smooth stone sphere", "cracked stone sphere", "rough stone sphere", "obsidian dagger", "archaeologist's notebook", "[2180]ancient amulet", "chocolate lump", "Harold's hammer head", "Harold's hammer handle", "Harold's hammer", "Kiss the Knob apron", "unlit birthday cake", "lit birthday cake", "flask of peppermint oil", "flask of peppermint schnapps", "yuletide troll chrysalis", "giant book of ancient carols", "disintegrating sheet music", "candy stake", "spooky eggnog", "ancient unspeakable fruitcake", "gingerbread horror", "fancy but probably evil chocolate", "bat-shaped Crimboween cookie", "skull-shaped Crimboween cookie", "tombstone-shaped Crimboween cookie", "tiny plastic gift-wrapping vampire", "tiny plastic ancient yuletide troll", "tiny plastic skeletal reindeer", "tiny plastic Crimboween pentagram", "tiny plastic Scream Queen", "time sleigh", "lucky Crimbo tiki necklace", "bobble-hip hula elf doll", "Crimbo ukulele", "Tiki lighter", "deck of tropical cards", "tropical paperweight", "tropical Crimbo pressie", "tropical wrapping paper", "Tropical Crimbo Hat", "Tropical Crimbo Shorts", "super ka-bob", "beer basted brat", "Tropical Crimbo Sword", "orange and black Crimboween candy", "Great Ball of Frozen Fire", "liar's pants", "flaming juggler's balls", "flaming pink shirt", "flaming familiar doppelg&auml;nger", "evil flaming eyeball pendant", "arse-a'fire elixir", "cosmic lemonade", "powdered toad horn", "icicle katana", "frigid mote", "smudged alchemical recipe", "polka-dot bow tie", "calavera concertina", "ratarang", "turtle pheromones", "pygmy blowgun", "pygmy nose-bone", "big bad voodoo mask", "bottle of alcohol", "pygmy spear", "pygmy pygment", "headhunter necktie", "pointed stick", "knobby helmet turtle", "knobby kneepads", "sewer turtle", "sebaceous shield", "skeletortoise", "box turtle", "cardboard box turtle", "bottlecap turtle", "bubblewrap bottlecap turtleban", "furry green turtle", "furry green earmuffs", "reinforced furry underpants", "[2258]&quot;I Love Me, Vol. I&quot;", "photograph of God", "hard rock candy", "hard-boiled ostrich egg", "bird rib", "lion oil", "stunt nuts", "wet stew", "wet stunt nut stew", "Mega Gem", "[2268]Staff of Fats", "sausage wonton", "black belt", "dusty bottle of Merlot", "dusty bottle of Port", "dusty bottle of Pinot Noir", "dusty bottle of Zinfandel", "dusty bottle of Marsala", "dusty bottle of Muscat", "Fernswarthy's key", "Fernswarthy's letter", "dusty old book", "Manual of Labor", "Manual of Transmission", "Manual of Dexterity", "seal-skull helmet", "petrified noodles", "chisel", "[2286]Eye of Ed", "green glowstick", "encoder ring", "red paperclip", "really big tiny house", "Non-Essential Amulet", "white wine vinaigrette", "cup of strong herbal tea", "Curiously Shiny Ancient Evil-Bashing Axe", "marinated stakes", "knob butter", "vial of ectoplasm", "boock of darck magicks", "EZ-Play Harmonica Book", "fingerless hobo gloves", "Chomsky's comic books", "worm-riding hooks", "Libram of Candy Heart Summoning", "white candy heart", "pink candy heart", "orange candy heart", "lavender candy heart", "yellow candy heart", "green candy heart", "white candygram", "pink candygram", "orange candygram", "lavender candygram", "yellow candygram", "green candygram", "broken carburetor", "ancient bronze token", "ancient bomb", "carved wooden wheel", "worm-riding manual page", "worm-riding manual page 2", "worm-riding manual pages 3-15", "headpiece of the Staff of Ed", "Staff of Ed, almost", "[2325]Staff of Ed", "stone rose", "can of black paint", "drum machine", "handful of confetti", "chocolate-covered diamond-studded roses", "bouquet of circular saw blades", "Better Than Cuddling Cake", "stuffed ninja snowman", "[2334]Holy MacGuffin", "rubber WWBBDD? bracelet", "oversized pipe", "reinforced beaded headband", "black pudding", "Blackfly Chardonnay", "black & tan", "black pepper", "black forest cake", "black forest ham", "filthworm hatchling scent gland", "filthworm drone scent gland", "filthworm royal guard scent gland", "heart of the filthworm queen", "water pipe bomb", "gas balloon", "beer bomb", "superamplified boom box", "fire poi", "bejeweled pledge pin", "communications windchimes", "henna face paint", "tube of dread wax", "Gaia beads", "pink clay bead", "purple clay bead", "green clay bead", "hippy medical kit", "Slow Talkin' Elliot's dogtags", "longhaired hippy wig", "Zim Merman's guitar", "C.A.R.N.I.V.O.R.E. button", "orange peel hat", "carbonated soy milk", "flowing hippy skirt", "filthy poultice", "natural fennel soda", "green smoke bomb", "bunch of bananas", "banana", "banana peel", "banana cream pie", "banana daiquiri", "bungle in the jungle", "banana spritzer", "banana smoothie", "dandy lion cub", "woolen cravat", "red class ring", "blue class ring", "white class ring", "bottle opener belt buckle", "keg shield", "giant foam finger", "war tongs", "Monstar energy beverage", "asbestos apron", "beaten-up Chucks", "natty blue ascot", "wreath of laurels", "Danglin' Chad's loincloth", "tube sock", "chloroform rag", "depantsing bomb", "energy drink IV", "Elmley shades", "molotov cocktail cocktail", "beer bong", "gauze garter", "barrel of gunpowder", "jam band flyers", "rock band flyers", "Panda outfit", "pink bat eye", "worthless piece of yellow glass", "billy idol", "oily rag", "broken petri dish", "sammich crust", "triffid bark", "white lint", "discarded pacifier", "bounty-hunting helmet", "bounty-hunting rifle", "bounty-hunting pants", "bottle of rhinoceros hormones", "teeny-tiny magic scroll", "bottle of pirate juice", "irradiated pet snacks", "Mick's IcyVapoHotness Inhaler", "cyclops eyedrops", "can of spinach", "[2426]fire flower", "freezerburned ice cube", "fake blood", "Eau de Guaneau", "bag of lard", "bottle of Mystic Shell", "SPF 451 lip balm", "bottle of antifreeze", "black eyedrops", "Dogsgotnonoz pills", "donkey flipbook", "New Cloaca-Cola", "scented massage oil", "poltergeist-in-the-jar-o", "unnatural gas", "Knob Goblin Encryption Key", "Cobb's Knob map", "pink glowstick", "Supernova Champagne", "Deactivated O. A. F.", "hardware upgrade", "bad penguin egg", "tasteful black bow tie", "six-pack of New Cloaca-Cola", "empty Cloaca-Cola bottle", "goatskin umbrella", "wool hat", "Goodfella contract", "white belt", "bar whip", "barskin buckler", "white whip", "barskin loincloth", "tighty whiteys", "yak toupee", "odor extractor", "Manual of Transcendent Olfaction", "bowl of Bounty-Os", "Oreille Divis&eacute;e brandy", "pompadour'd puppy", "blue suede shoes", "callused fingerbone", "bundle of receipts", "disintegrating cork", "sticky stardust", "wilted lettuce", "empty greasepaint tube", "clown skin", "clown wig", "clownskin belt", "clownskin buckler", "clown whip", "demon skin", "demon-horned hat", "demon buckler", "demon whip", "barskin cloak", "white snakeskin duster", "clownskin harness", "demonskin jacket", "hipposkin poncho", "yak anorak", "tuxedo shirt", "gnauga hide vest", "shirt kit", "tropical orchid", "stick of dynamite", "Necrotelicomnicon", "Cookbook of the Damned", "Sinful Desires", "molybdenum magnet", "molybdenum hammer", "molybdenum screwdriver", "molybdenum pliers", "molybdenum crescent wrench", "Really Expensive Jewelry and You", "extra-fancy ring setting", "precious piercing post", "heavy necklace chain", "beach glass bead", "clay peace-sign bead", "beach glass necklace", "peace-sign necklace", "round green sunglasses", "Frat Army FGF", "Hippy Army MPE", "spark plug earring", "woven baling wire bracelets", "gearbox necklace", "wrench bracelet", "rusty chain necklace", "sawblade shield", "McMillicancuddy's Special Lager", "melted Jell-o shot", "cruelty-free wine", "thistle wine", "megatofu", "displaced fish", "fishy fish", "fishy fish casserole", "fishy fish lasagna", "filet of tangy gnat (&quot;fotelif&quot;)", "gnatloaf", "gnatloaf casserole", "gnat lasagna", "long pork", "long pork chop sandwiches", "long pork casserole", "long pork lasagna", "canopic jar", "ancient spice", "powdered organs", "Ankh of Badahnkadh", "tomb ratchet", "Mayflower bouquet", "lesser grodulated violet", "tin magnolia", "begpwnia", "upsy daisy", "half-orchid", "tin star", "outrageous sombrero", "&quot;Humorous&quot; T-shirt", "Peppercorns of Power", "vial of mojo", "golden reeds", "turtle chain", "distilled seal blood", "high-octane olive oil", "Shagadelic Disco Banjo", "Squeezebox of the Ages", "Chelonian Morningstar", "Hammer of Smiting", "17-alarm Saucepan", "Greek Pasta Spoon of Peril", "half-rotten brain", "rusty bonesaw", "plus-sized phylactery", "can of Ghuol-B-Gone&trade;", "Azazel's unicorn", "Azazel's lollipop", "Azazel's tutu", "ant agonist", "ant hoe", "ant rake", "ant pitchfork", "ant sickle", "ant pick", "bronzed locust", "honey-dipped locust", "giant cactus quill", "Staff of the Short Order Cook", "cactus fruit", "scorpion whip", "handful of sand", "brick of sand", "centipede eggs", "wonderwall shield", "Colonel Mustard's Lonely Spades Club Jacket", "General Sage's Lonely Diamonds Club Jacket", "Corporal Fennel's Lonely Clubs Club Jacket", "Private Pepper's Lonely Hearts Club Jacket", "hot date", "distilled fortified wine", "tasty tart", "Knob Goblin lunchbox", "Knob pasty", "thermos full of Knob coffee", "Ben-Gal&trade; Balm", "leathery cat skin", "leathery bat skin", "leathery rat skin", "Discount Telescope Warehouse gift certificate", "carbonated water lily", "Staff of the Midnight Snack", "Staff of Blood and Pudding", "smoldering box", "Tuesday's ruby", "palm frond", "palm-frond fan", "palm-frond whip", "palm-frond net", "palm-frond capris", "extra-large palm-frond toupee", "palm-frond cloak", "ancient vinyl coin purse", "rocky raccoon", "mojo filter", "savoy truffle", "ancient Magi-Wipes", "big boom", "Iiti Kitty phone charm", "jar of swamp gas", "unidentified jerky", "nasty rat mask", "ratskin belt", "rattail whip", "bat hat", "bat whip", "bat-ass leather jacket", "catskin cap", "catskin buckler", "tail o' nine cats", "Hugo's Weaving Manual", "gremlin juice", "mother's little helper", "pat-a-cake pendant", "mummy wrapping", "really thick bandage", "mummy mask", "gauze shorts", "gauze hammock", "black cherry soda", "black greaves", "black cowboy hat", "Maxwell's Silver Hammer", "happiness", "flaming feather", "frozen feather", "frightful feather", "fetid feather", "flirtatious feather", "Lord Spookyraven's ear trumpet", "bottled green pixie", "green pixie spog", "S.T.L.T.", "honey-dew", "white Xanadian", "tiny bottle of absinthe", "Drowsy Sword", "escargotsicle", "bottle of realpagne", "albatross necklace", "not-a-pipe", "flask of Amontillado", "fancy ball mask", "Can-Can skirt", "sensitive poetry journal", "bottled inspiration", "bellhop bell", "disintegrating spiky collar", "can-can-in-a-can", "patent antipsychotics", "Mariner's Friend cough drops", "shot of nepenthe schnapps", "library card", "Bohemian rhapsody", "bottle of black cat tonic", "handful of moss", "bit-o-cactus", "ancient protein powder", "spectre scepter", "sparkler", "snake", "M-242", "detuned radio", "Warehouse 23 crate", "armgun", "fancy seashell necklace", "commemorative war stein", "stone frisbee", "dreadlock whip", "beer-a-pult", "cast-iron legacy paddle", "handful of nuts and berries", "giant driftwood sculpture", "massive sitar", "stone baseball cap", "cup of primitive beer", "ovoid leather thing", "duct tape", "duct tape wallet", "duct tape shirt", "duct tape fedora", "duct tape sword", "duct tape dockers", "duct tape buckler", "shrinking powder", "blackberry slippers", "blackberry moccasins", "blackberry combat boots", "funky dried mushroom", "exotic parrot egg", "cracker", "black facepaint", "black sheepskin diploma", "Black Body&trade; spray", "floorboard cruft", "sausage bomb", "battered hubcap", "shiny hood ornament", "spare kidney", "hand-carved bokken", "hand-carved bow", "hand-carved staff", "Staff of the Greasefire", "Staff of the Grand Flamb&eacute;", "bowl of rye sprouts", "cob of corn", "juniper berries", "plum", "pear", "peach", "plum wine", "shot of pear schnapps", "shot of peach schnapps", "bunch of square grapes", "brown sugar cane", "sandwich of the gods", "Pan-Dimensional Gargle Blaster", "enchanted leopard-print barbell", "pile of smoking rags", "panty raider camouflage", "Staff of the Walk-In Freezer", "boilermaker", "steel lasagna", "steel margarita", "steel-scented air freshener", "gremlin mutagen", "extra-potent gremlin mutagen", "chunk of depleted Grimacite", "furniture dolly", "Staff of the Grease Trap", "Uranium Omega of Temperance", "Lead Zeta of Chastity", "Aluminum Epsilon of Humility", "Zinc Delta of Tranquility", "Nickel Gamma of Frugality", "Iron Beta of Industry", "Copper Alpha of Sincerity", "Red Balloon of Valor", "Purple Horseshoe of Honor", "Blue Diamond of Honesty", "Green Clover of Justice", "Yellow Moon of Compassion", "Orange Star of Sacrifice", "Pink Heart of Spirit", "Order of the Silver Wossname", "Harold's bell", "solid gold bowling ball", "Crimbo pie", "pear tart", "peach pie", "chunk of rock salt", "handful of pine needles", "steamy ruby", "glacial sapphire", "unearthly onyx", "effluvious emerald", "tawdry amethyst", "filigreed hamethyst earring", "filigreed hamethyst necklace", "filigreed hamethyst ring", "solid baconstone earring", "solid baconstone necklace", "solid baconstone ring", "pulled porquoise earring", "pulled porquoise pendant", "pulled porquoise ring", "Earring of Fire", "Pendant of Fire", "Ring of Fire", "Ice-Cold Beerring", "Ice-Cold Aluminum Necklace", "Ice-Cold Beer Ring", "Unspeakable Earring", "Choker of the Ultragoth", "The Ring", "Nose Ring of Putrescence", "Putrid Pendant", "Ring of the Sewer Snake", "Mudflap-Girl Earring", "Mudflap-Girl Necklace", "Mudflap-Girl Ring", "vial of Gnomochloric acid", "flask of Gnomochloric acid", "jug of Gnomochloric acid", "vial of hamethyst juice", "vial of baconstone juice", "vial of porquoise juice", "flask of hamethyst juice", "flask of baconstone juice", "flask of porquoise juice", "jug of hamethyst juice", "jug of baconstone juice", "jug of porquoise juice", "Brimstone Beret", "Brimstone Bludgeon", "Brimstone Bunker", "Brimstone Boxers", "Brimstone Brooch", "Brimstone Bracelet", "Grimacite gasmask", "Grimacite gat", "Grimacite gaiters", "Grimacite gauntlets", "Grimacite go-go boots", "Grimacite girdle", "Grimacite gown", "Staff of the Kitchen Floor", "anniversary gift box", "loaded dice", "really dense meat stack", "digital key lime", "star key lime", "digital key lime pie", "star key lime pie", "bottle-rocket crossbow", "indie comic hipster glasses", "wizard action figure", "mint-condition magic wand", "yellow glowstick", "Periodical Paintbrush", "bottle of cooking sherry", "antique packet of ketchup", "accidental cider", "dire fudgesicle", "navel ring of navel gazing", "class five ecto-larva", "plastic bib", "Dallas Dynasty Falcon Crest shield", "Gnomitronic Hyperspatial Demodulizer", "shrunken navigator head", "moonberry wine cooler", "fine aged cheddarwurst", "branch from the Great Tree", "Phil Bunion's axe", "bouquet of swamp roses", "huge mosquito proboscis", "swamp lolly", "seegar butt", "bottled swamp gas", "witch wart", "delicious swamp muck", "leechknife", "decomposed boot", "big dribbly candle", "stolen meatpouch", "beaver spear", "shamanic beads", "dilapidated wizard hat", "pirate pamphlet", "pirate brochure", "pirate tract", "burnt flower", "tiny plastic Naughty Sorceress", "tiny plastic Ed the Undying", "tiny plastic Lord Spookyraven", "tiny plastic Dr. Awkward", "tiny plastic protector spectre", "tiny plastic Baron von Ratsworth", "tiny plastic Boss Bat", "tiny plastic Knob Goblin King", "tiny plastic Bonerdagon", "tiny plastic The Man", "tiny plastic The Big Wisniewski", "tiny plastic Felonia", "tiny plastic Beelzebozo", "tiny plastic conservationist hippy", "tiny plastic 7-foot dwarf", "tiny plastic angry bugbear", "tiny plastic anime smiley", "tiny plastic apathetic lizardman", "tiny plastic astronomer", "tiny plastic beanbat", "tiny plastic blooper", "tiny plastic brainsweeper", "tiny plastic briefcase bat", "tiny plastic demoninja", "tiny plastic filthy hippy jewelry maker", "tiny plastic drunk goat", "tiny plastic fiendish can of asparagus", "tiny plastic Gnollish crossdresser", "tiny plastic handsome mariachi", "tiny plastic Knob Goblin bean counter", "tiny plastic Knob Goblin harem girl", "tiny plastic Knob Goblin mad scientist", "tiny plastic Knott Yeti", "tiny plastic lemon-in-the-box", "tiny plastic lobsterfrogman", "tiny plastic ninja snowman", "tiny plastic Orcish Frat Boy", "tiny plastic G Imp", "tiny plastic goth giant", "tiny plastic cubist bull", "tiny plastic scary clown", "tiny plastic smarmy pirate", "tiny plastic spiny skelelton", "tiny plastic Spam Witch", "tiny plastic spooky vampire", "tiny plastic taco cat", "tiny plastic undead elbow macaroni", "tiny plastic warwelf", "tiny plastic whitesnake", "tiny plastic XXX pr0n", "tiny plastic zmobie", "tiny plastic Protagonist", "tiny plastic Spunky Princess", "tiny plastic topiary golem", "tiny plastic senile lihc", "tiny plastic Iiti Kitty", "tiny plastic Gnomester Blomester", "tiny plastic Trouser Snake", "tiny plastic Axe Wound", "tiny plastic Hellion", "tiny plastic Black Knight", "tiny plastic giant pair of tweezers", "tiny plastic fruit golem", "tiny plastic fluffy bunny", "miniature castagnets", "siesta-ing Casagnova gnome", "miniature Jacob's ladder", "unemployed hunchbacked minion", "Spooky Surprise Egg", "Steal This Candy", "chocolate filthy lucre", "Angry Farmer's Wife Candy", "the Jickinator", "party hat", "V for Vivala mask", "The Big Book of Pirate Insults", "shot of rotgut", "jar of &quot;Creole Lady&quot; marrrmalade", "Cap'm Caronch's Map", "Orcish Frat House blueprints", "blue glowstick", "charrrm bracelet", "tip jar", "yam candy", "cocktail napkin", "rum barrel charrrm", "tube of cranberry Go-Goo", "rum barrel charrrm bracelet", "single-serving herbal stuffing", "packet of tofurkey gravy", "tofurkey nugget", "rigging shampoo", "ball polish", "mizzenmast mop", "Tom's of the Spanish Main Toothpaste", "Swabbie&trade; swab", "Oil of Parrrlay", "creamsicle", "cream stout", "curmudgel", "grumpy old man charrrm", "grumpy old man charrrm bracelet", "tarrrnish charrrm", "tarrrnished charrrm bracelet", "bilge wine", "witty rapier", "yohohoyo", "fish-liver oil", "booty chest charrrm", "booty chest charrrm bracelet", "cannonball charrrm", "cannonball charrrm bracelet", "copper ha'penny charrrm", "copper ha'penny charrrm bracelet", "silver tongue charrrm", "silver tongue charrrm bracelet", "bit of clingfilm", "clingfilm trousers", "clingfilm cap", "clingfilm slippers", "clingfilm tangle", "vinegar-soaked lemon slice", "true grit", "buoybottoms", "grungy flannel shirt", "grungy bandana", "grassy cutlass", "Cap'm Caronch's nasty booty", "Cap'm Caronch's dentures", "solid gold pegleg", "gold lam&eacute; pants", "enormous hoop earring", "costume sword", "rainbow pearl", "rainbow pearl earring", "rainbow pearl necklace", "rainbow pearl ring", "Idol of Ak'gyxoth", "Emblem of Ak'gyxoth", "sinister altar fragment", "shimmering rainbow sand", "simple ancient cursed key", "ornate ancient cursed key", "gilded ancient cursed key", "ancient cursed foot locker", "ornate ancient cursed chest", "gilded ancient cursed chest", "all-purpose cleaner", "handful of sawdust", "large stone triangle", "medium stone triangle", "small stone triangle", "strange stone pyramid", "corpse on the beach", "corpsetini", "corpsedriver", "Corpse Island iced tea", "red-headed corpse", "kamicorpse-ee", "purple corpsel", "corpsebite", "pirate fledges", "cursed piece of thirteen", "cursed black pearl onion", "cursed sea biscuit", "cursed bottle of rum", "cursed bottle of black-label rum", "cursed cannonball", "cursed voodoo skull", "cursed dirty joke scroll", "Crimbo P. R. E. S. S. I. E.", "metallic foil bow", "metallic foil radar dish", "nanite-infested gingerbread bugbear", "nanite-infested candy cane", "nanite-infested fruitcake", "nanite-infested eggnog", "El Vibrato power sphere", "cursed eyepatch", "cursed cutlass", "cursed breeches", "mood ring", "black candy heart", "cymbal syrup", "metallic foil cat ears", "nanofiber cloth", "iGoogly", "theoretical string", "synthetic stuffing", "toy hoverpad", "LED block", "gyroscope", "cyborg doll", "buckyball", "toy maglev monorail", "dollhive", "toy deathbot", "laser cannon", "plexifoam chin strap", "silicon-infused gluteal shield", "carbonite visor", "set of Unobtainium straps", "polymorphic fastening apparatus", "General Assembly Module", "laser targeting chip", "hi-density nylocite leg armor", "kevlateflocite helmet", "Bulky Buddy Box", "teddy borg", "marionette collective", "monomolecular yo-yo", "stuffed gray blob", "borg sock monkey", "roboduck-on-a-string", "mylar scout drone", "teddy borg sewing kit", "biomechanical crimborg helmet", "C.B.F.G.", "biomechanical crimborg leg armor", "vitachoconutriment capsule", "handmade hobby horse", "ball-in-a-cup", "set of jacks", "laser-broiled pear", "polyalloy shield", "oversized fish scaler", "killing feather", "golden ring", "robotronic egg", "rogue swarmer", "sawblade fragment", "unstable laser battery", "vibrating cyborg knife", "immense cyborg hand", "cyborg stompin' boot", "deactivated RoboGoose", "overclocked avian microprocessor", "Miniborg stomper", "Miniborg strangler", "Miniborg laser", "Miniborg beeper", "Miniborg hiveminder", "Miniborg Destroy-O-Bot", "old-fashioned Crimbo Pressie", "stuffed Hodgman", "Libram of Divine Favors", "divine noisemaker", "divine can of silly string", "divine blowout", "divine champagne popper", "divine cracker", "divine champagne flute", "fruitfilm", "piece of after eight", "hobo nickel", "sandcastle", "marshmallow", "roasted marshmallow", "strange shiny disc", "tin cup of mulligan stew", "flamin' bindle", "freezin' bindle", "stinkin' bindle", "spooky bindle", "sleazy bindle", "'WILL WORK FOR BOOZE' sign", "Hodgman's whackin' stick", "Hodgman's imaginary hamster", "old soft shoes", "panhandle panhandling hat", "cup of infinite pencils", "Hodgman's disgusting technicolor overcoat", "a torn paper strip", "El Vibrato translator", "El Vibrato punchcard (115 holes)", "El Vibrato punchcard (97 holes)", "El Vibrato punchcard (129 holes)", "El Vibrato punchcard (213 holes)", "El Vibrato punchcard (165 holes)", "El Vibrato punchcard (142 holes)", "El Vibrato punchcard (216 holes)", "El Vibrato punchcard (88 holes)", "El Vibrato punchcard (182 holes)", "El Vibrato punchcard (176 holes)", "El Vibrato punchcard (104 holes)", "El Vibrato drone", "sparking El Vibrato drone", "warm El Vibrato drone", "humming El Vibrato drone", "glowing El Vibrato drone", "El Vibrato helmet", "El Vibrato energy spear", "El Vibrato leg guards", "broken El Vibrato drone", "repaired El Vibrato drone", "augmented El Vibrato drone", "seal eyeball", "turtle soup", "evil noodles", "nauseating reagent", "evil paper umbrella", "evil vihuela", "evil boring spaghetti", "evil delicious noodles", "evil delicious spicy noodles", "evil painful penne pasta", "3vi1 pr0n m4nic0tti", "evil ravioli della hippy", "evil spicy noodles", "evil potion of potency", "evil libation of liveliness", "evil tomato juice of powerful power", "evil eyedrops of the ermine", "evil ointment of the occult", "evil serum of sarcasm", "evil philter of phorce", "an evil little sump'm sump'm", "evil ducha de oro", "evil horizontal tango", "evil roll in the hay", "naughty origami kit", "naughty fortune teller", "origami &quot;gentlemen's&quot; magazine", "naughty paper shuriken", "origami pasties", "origami riding crop", "El Vibrato trapezoid", "lump of coal", "lump of diamond", "thick padded envelope", "KoL Con IV Pole", "dwarvish magazine", "dwarvish war helmet", "dwarvish war mattock", "dwarvish war kilt", "dwarvish punchcard", "small laminated card", "little laminated card", "notbig laminated card", "unlarge laminated card", "dwarvish document", "dwarvish paper", "dwarvish parchment", "overcharged El Vibrato power sphere", "Fly-By-Knight Heraldry form", "El Vibrato Megadrone", "purple glowstick", "sane hatrack", "hobo code binder", "gator skin", "gatorskin umbrella", "sewer nuggets", "sewer wad", "bottle of sewage schnapps", "bottle of Ooze-O", "C.H.U.M. chum", "unfortunate dumplings", "decaying goldfish liver", "oil of oiliness", "tattered paper crown", "vanilla-frosted king cake", "inflatable duck", "water wings", "foam noodle", "Kissin' Cousins", "Tales from the Fireside", "Blizzards I Have Died In", "Maxing, Relaxing", "Biddy Cracker's Old-Fashioned Cookbook", "Travels with Jerry", "Let Me Be!", "Asleep in the Cemetery", "Summer Nights", "Sensual Massage for Creeps", "Ol' Scratch's ol' britches", "Ol' Scratch's stovepipe hat", "Ol' Scratch's ash can", "pink plastic baby", "silver sausage", "Frosty's old silk hat", "Frosty's carrot", "Frosty's nailbat", "Oscus's pelt", "Wand of Oscus", "Oscus's dumpster waders", "Zombo's skullcap", "Zombo's shield", "Zombo's grievous greaves", "Chester's moustache", "Chester's bag of candy", "Chester's cutoffs", "Sp'n-Zor's Grimoire of &quot;Tasteful&quot; Gifts", "black candygram", "bag of Crotchety Pine saplings", "bag of Saccharine Maple saplings", "bag of Laughing Willow saplings", "handful of Crotchety Pine needles", "lump of Saccharine Maple sap", "handful of Laughing Willow bark", "crotchety pants", "Saccharine Maple pendant", "willowy bonnet", "flavored foot massage oil", "foam dart", "black-and-blue light", "Loudmouth Larry Lamprey", "cheap studded belt", "personal massager", "personalized coffee mug", "blue plasma ball", "stick-on eyebrow piercing", "delicious salad", "C.H.U.M. lantern", "C.H.U.M. knife", "Frosty's snowball sack", "quasi-ethereal macaroni fragments", "shimmering tendrils", "scintillating powder", "abandoned candy", "secret tropical island volcano lair map", "adorable seal larva", "untamable turtle", "macaroni duck", "friendly cheez blob", "unusual disco ball", "stray chihuahua", "pretty pink bow", "smiley-face sticker", "farfalle bow tie", "jalape&ntilde;o slices", "stick-on mini solar panels", "tiny sombrero", "Argarggagarg's fang", "Safari Jack's moustache", "Yakisoba's hat", "Heimandatz's heart", "Jocko Homo's head", "The Mariachi's guitar case", "sealskin drum", "washboard shield", "spaghetti-box banjo", "marinara jug", "makeshift castanets", "left-handed melodica", "epic wad", "lucky bottlecap", "corncob pipe", "Mr. Joe's bangles", "frayed rope belt", "packet of mayfly bait", "mayfly bait necklace", "Ol' Scratch's salad fork", "Frosty's frosty mug", "jar of fermented pickle juice", "voodoo snuff", "extra-greasy slider", "crumpled felt fedora", "battered old top-hat", "shapeless wide-brimmed hat", "mostly rat-hide leggings", "hobo dungarees", "old patched suit-pants", "hobo stogie", "rope with some soap on it", "dead guy's piece of double-sided tape", "dead guy's memento", "frozen banquet", "sharpened hubcap", "very large caltrop", "The Six-Pack of Pain", "hobo monkey", "tiny bindle", "bed of coals", "frigid air mattress", "filth-encrusted futon", "comfy coffin", "stained mattress", "dinged-up triangle", "Ralph IX cognac", "llama lama cria", "zen motorcycle", "llama lama gong", "banana-frosted king cake", "brown plastic baby", "plump juicy grub", "delicious shimmering moth", "delectable fire ant", "scrumptious ice ant", "delicious stinkbug", "yummy death watch beetle", "tasty louse", "mole mol&eacute;", "Morlock's Mark Bourbon", "Climate Colada", "digital underground potion", "interesting-looking twig", "glimmering roc feather", "glimmering phoenix feather", "glimmering penguin feather", "glimmering buzzard feather", "glimmering raven feather", "glimmering great tit feather", "house of twigs and spit", "The Ballad of Richie Thingfinder", "Benetton's Medley of Diversity", "Elron's Explosive Etude", "Chorale of Companionship", "Prelude of Precision", "Ol' Scratch's infernal pitchfork", "Ol' Scratch's stove door", "Ol' Scratch's manacles", "Chester's sunglasses", "Chester's muscle shirt", "Chester's Aquarius medallion", "Zombo's shoulder blade", "Zombo's skull ring", "Zombo's empty eye", "Frosty's arm", "Staff of the Deepest Freeze", "Frosty's iceball", "Oscus's garbage can lid", "Oscus's neverending soda", "Oscus's flypaper pants", "Hodgman's porkpie hat", "Hodgman's lobsterskin pants", "Hodgman's bow tie", "Hodgman's blanket", "jar of squeeze", "bowl of fishysoisse", "deadly lampshade", "concentrated garbage juice", "lewd playing card", "deck of lewd playing cards", "Hodgman's lucky sock", "Hodgman's varcolac paw", "Hodgman's almanac", "Hodgman's harmonica", "Hodgman's garbage sticker", "Hodgman's metal detector", "Hodgman's cane", "Hodgman's journal #1: The Lean Times", "Hodgman's journal #2: Entrepreneurythmics", "Hodgman's journal #3: Pumping Tin", "Hodgman's journal #4: View From The Big Top", "hobo fortress blueprints", "little box of fireworks", "sterno-flavored Hob-O", "frostbite-flavored Hob-O", "fry-oil-flavored Hob-O", "garbage-juice-flavored Hob-O", "strawberry-flavored Hob-O", "roll of Hob-Os", "Everlasting Deckswabber", "bindle of joy", "cotton candy cocoon", "cotton candy cordial", "spice melange", "spooky rattling cigar box", "big stirring stick", "Staff of the Teapot Tempest", "Staff of the Black Kettle", "Staff of the Well-Tempered Cauldron", "Rainbow's Gravity", "prismatic wad", "club of the five seasons", "rainbow crossbow", "black kitten", "webbed comic mask", "Junior Adventurer's kit", "groovy prism necklace", "six-rainbow shield", "rainbow bomb", "cotton candy cone", "cotton candy pinch", "cotton candy smidgen", "cotton candy skoshe", "cotton candy plug", "cotton candy pillow", "cotton candy bale", "trusty torch", "Junior Adventurer's merit badge", "STYX deodorant body spray", "white-label gin", "tin rations", "haiku challenge map", "terrible poem", "bottle of sake", "little round pebble", "Bash-&#332;s cereal", "haiku katana", "bargain flash powder", "blue plastic baby", "blueberry-frosted king cake", "little bitty bathysphere", "damp old boot", "Seasonal Beret", "Bash-&#332;s boxtop", "cranberry cordial", "blackberry polite", "plum lozenge", "pear lozenge", "peach lozenge", "balloon shield", "black spot", "uniclops egg", "passed-out psychedelic bear", "psychedelic bubble wand", "eye 'n' horn shampoo", "glittery mascara", "dull fish scale", "rough fish scale", "pristine fish scale", "beefy fish meat", "glistening fish meat", "slick fish meat", "fish scimitar", "fish stick", "fish bazooka", "sea salt crystal", "bazookafish bubble gum", "bottle of Pete's Sake", "invisible bag", "witch hat", "beholed bedsheet", "fancy canap&eacute;s", "thermos of brew", "giant glass of brandy", "French slippers", "LWA ring", "LARP membership card", "Scratch 'n' Sniff Sticker Tome", "scratch 'n' sniff sword", "scratch 'n' sniff unicorn sticker", "scratch 'n' sniff apple sticker", "scratch 'n' sniff UPC sticker", "scratch 'n' sniff wrestler sticker", "scratch 'n' sniff dragon sticker", "scratch 'n' sniff rock band sticker", "ganger bandana", "eel skin", "eelskin hat", "eelskin pants", "eelskin shield", "shark tooth", "shark tooth necklace", "shark jumper", "shark cartilage", "eel battery", "temporary teardrop tattoo", "scratch 'n' sniff crossbow", "mutant rattlesnake egg", "mutant fire ant egg", "mutant cactus bud", "mutant gila monster egg", "rattlesnake enrager", "ant antidepressant", "cactus monocle", "Jawmaster 2000&trade;", "plans for depleted Grimacite hammer", "plans for depleted Grimacite gravy boat", "plans for depleted Grimacite weightlifting belt", "plans for depleted Grimacite grappling hook", "plans for depleted Grimacite ninja mask", "plans for depleted Grimacite shinguards", "plans for depleted Grimacite astrolabe", "depleted Grimacite hammer", "depleted Grimacite gravy boat", "depleted Grimacite weightlifting belt", "depleted Grimacite grappling hook", "depleted Grimacite ninja mask", "depleted Grimacite shinguards", "depleted Grimacite astrolabe", "KoL Con Cinco Pi&ntilde;ata Bat", "propeller beanie", "straw hat", "octopus's spade", "soggy seed packet", "glob of green slime", "sea carrot", "sea cucumber", "sea avocado", "sea lychee", "sea tangelo", "sea honeydew", "pressurized potion of puissance", "pressurized potion of perspicacity", "pressurized potion of pulchritude", "berry-infused sake", "citrus-infused sake", "melon-infused sake", "slab of sponge", "sponge helmet", "spongy shield", "square sponge pants", "flytrap pellet", "baby cuddlefish", "six-armed sweater", "slimy chest", "sand dollar", "flytrap bezoar", "bezoar ring", "candy cornucopia", "tiny ballet slippers", "wriggling flytrap pellet", "sushi-rolling mat", "white rice", "irradiated candy cane", "gingerbread mutant bugbear", "oozenog", "sugar plum", "sugar banana", "sugar lime", "sugar cherry", "Mer-kin hookspear", "Mer-kin takebag", "Mer-kin thingpouch", "Mer-kin killscroll", "Mer-kin fastjuice", "imitation crab crate", "imitation crab meat", "imitation crab zoea", "moist sailor's cap", "rusty speargun", "rusty compass", "rusty broken diving helmet", "rusty porthole", "rusty rivet", "bubblin' stone", "rusty diving helmet", "aerated diving helmet", "live nautical mine", "das boot", "imitation whetstone", "sea grease", "sturdy Crimbo crate", "battered Crimbo Crate", "twitching claw", "rigid carapace", "pulsing flesh", "unstable DNA", "The Spirit of Crimbo", "wriggling tentacle", "mass of wriggling tentacles", "pair of twitching claws", "gnashing teeth", "chitinous pod", "parasitic claw", "parasitic tentacles", "parasitic headgnawer", "parasitic strangleworm", "pair of ragged claws", "burrowgrub hive", "dusty Crimbo crate", "Gummi-DNA", "radioactive chew toy", "elven socks", "cheap elven gloves", "festive holiday hat", "patent leather shoes", "gray bow tie", "penguin thesaurus", "blob-shaped Crimbo cookie", "seaweed", "jamfish jam", "dragonfish caviar", "pufferfish spine", "depleted Grimacite kneecapping stick", "canteen of wine", "elven <i>limbos</i> gingerbread", "elven whittling knife", "magic dragonfish fry", "map to Madness Reef", "toast with jam", "miniature antlers", "elven moonshine", "knuckle sandwich", "psycho sweater", "fin-bit wax", "tiny plastic Mob Penguin", "tiny plastic mutant elf", "tiny plastic fat stack of cash", "tiny plastic strand of DNA", "tiny plastic chunk of depleted Grimacite", "container of Spooky Putty", "Spooky Putty mitre", "Spooky Putty leotard", "Spooky Putty ball", "Spooky Putty sheet", "Spooky Putty snake", "Spooky Putty monster", "glow-in-the-dark wristwatch", "glow-in-the-dark dart gun", "glow-in-the-dark stuffed burrowgrub", "Uncle Crimbo's Rations", "can of franks 'n' beans", "bottle of peppermint schnapps", "throbbing rage gland", "Mer-kin pressureglobe", "Mer-kin foodbucket", "diving muff", "salinated mint julep", "ink bladder", "glowing esca", "bubbling tempura batter", "globe of Deep Sauce", "map to the Marinara Trench", "tempura carrot", "tempura cucumber", "tempura avocado", "sea broccoli", "sea cauliflower", "tempura broccoli", "tempura cauliflower", "sea blueberry", "sea persimmon", "pressurized potion of perception", "pressurized potion of proficiency", "Mer-kin digpick", "anemone nematocyst", "high-pressure seltzer bottle", "velcro ore", "teflon ore", "vinyl ore", "map to Anemone Mine", "marine aquamarine", "rusty valve wheel", "waterlogged bootstraps", "velcro broadsword", "velcro paddle ball", "velcro shield", "velcro boots", "non-stick pugil stick", "teflon spatula", "teflon shield", "teflon swim fins", "7-inch discus", "PVC staff", "vinyl shield", "vinyl boots", "decaying wooden oar", "giant fishhook", "rusty old lantern", "decaying wooden pole", "decaying wooden paddle", "tarnished metal ring", "tarnished metal rod", "brittle plastic handle", "foggy glass globe", "possessed tomato", "Nardz energy beverage", "pile of gold coins", "hand grenegg", "caret", "glass gnoll eye", "cheap cigar butt", "manly bloomers", "Colon Annihilation Hot Sauce", "fat wallet", "enchanted handwarmer", "lucky lighter", "packet of beer nuts", "Boozehounds Anonymous token", "handful of bees", "spectral jelly", "jellyfish gel", "unstable quark", "software glitch", "fumble formula", "vampire pearl", "mother's secret recipe", "concoction of clumsiness", "vampire pearl earring", "white chocolate chip brownies", "Libram of Love Songs", "love song of vague ambiguity", "love song of smoldering passion", "love song of icy revenge", "love song of sugary cuteness", "love song of disturbing obsession", "love song of naughty innuendo", "breath mint", "vampire pearl ring", "vampire pearl necklace", "slug of vodka", "slug of rum", "slug of shochu", "screwdiver", "dew yoana lei", "lychee chuhai", "salacious screwdiver", "dew yoana salacious lei", "salacious lychee chuhai", "Alewife&trade; Ale", "seaode", "map to the Dive Bar", "Mer-kin pinkslip", "pink pinkslip slip", "sea salt scrubs", "amber aviator shades", "hair of the fish", "nurse's hat", "blank prescription sheet", "bottle of melodramamine", "bottle of extra-strength melodramamine", "paranormal ricotta", "smoking talon", "vampire glitter", "wine-soaked bone chips", "crumbling rat skull", "twitching trigger finger", "Apathargic Bandersnatch", "aquaviolet jub-jub bird", "crimsilion jub-jub bird", "charpuce jub-jub bird", "Mer-kin roundshield", "Mer-kin breastplate", "Mer-kin sneakmask", "Mer-kin prayerbeads", "Mer-kin hidepaint", "Mer-kin trailmap", "Mer-kin healscroll", "Mer-kin lockkey", "Mer-kin stashbox", "chocolate-frosted king cake", "red plastic baby", "midget clownfish", "half-height unicycle", "sea radish", "halibut", "eel sauce", "water-polo mitt", "glowing syringe", "fishy wand", "wad of cotton", "Grandma's Note", "Grandma's Fuchsia Yarn", "Grandma's Chartreuse Yarn", "golden plastic oyster egg", "Grandma's Map", "tempura radish", "water-polo cap", "Typical Tavern swill", "tropical swill", "fruity girl swill", "blended frozen swill", "tiny costume wardrobe", "Elvish sunglasses", "anniversary safety glass vest", "anniversary burlap belt", "anniversary balsa wood socks", "anniversary tiny latex mask", "anniversary pewter cape", "out-of-tune biwa", "dented harmonica", "magic whistle", "cheap plastic blowgun", "jungle drum", "hippy bongo", "knob bugle", "4-dimensional guitar", "boxing glove", "boxing glove on a spring", "half-sized guitar", "big bass drum", "pixel boomerang", "world's smallest violin", "ocarina of space", "a butt tuba", "bone flute", "infernal fife", "charming flute", "leaf of grass", "grass whistle", "plastic guitar", "finger cymbals", "black kettle drum", "double-barreled sling", "magilaser blastercannon", "frigid hanky&#363;", "ultimate ultimate frisbee", "stolen office supplies", "office-supply crossbow", "pocket theremin", "rave whistle", "hellseal hide", "shredded hellseal hide", "hellseal brain", "burst hellseal brain", "hellseal sinew", "torn hellseal sinew", "hellseal disguise", "fouet de tortue-dressage", "encoded cult documents", "cult memo", "decoded cult documents", "vial of red slime", "vial of yellow slime", "vial of blue slime", "vial of orange slime", "vial of green slime", "vial of violet slime", "vial of vermilion slime", "vial of amber slime", "vial of chartreuse slime", "vial of teal slime", "vial of indigo slime", "vial of purple slime", "vial of brown slime", "bottle of G&uuml;-Gone", "seal-blubber candle", "figurine of a wretched-looking seal", "figurine of a cute baby seal", "figurine of an armored seal", "figurine of an ancient seal", "figurine of a sleek seal", "figurine of a shadowy seal", "figurine of a stinking seal", "figurine of a charred seal", "figurine of a cold seal", "figurine of a slippery seal", "imbued seal-blubber candle", "blended frozen swill with a fly in it", "turtle wax", "turtle wax shield", "turtle wax helmet", "turtle wax greaves", "meat shield", "turtlemail bits", "turtlemail coif", "turtlemail breeches", "turtlemail hauberk", "hedgeturtle", "spiky turtle helmet", "spiky turtle shoulderpads", "spiky turtle shield", "turtling rod", "syncopated turtle", "grinning turtle", "tainted seal's blood", "severed flipper", "ingot of seal-iron", "bad-ass club", "powdered sealbone", "hyperinflated seal lung", "scrap of shadow", "fustulent seal grulch", "club of corruption", "corrupt club of corruption", "corrupt club of corrupt corruption", "evil-ass club", "nasty-ass club", "infernal toilet brush", "shadowy seal eye", "oyster egg balloon", "Clan VIP Lounge invitation", "Clan VIP Lounge key", "stuffed Meat", "stuffed treasure chest", "stuffed key", "stuffed Baron von Ratsworth", "stuffed monocle", "stuffed mink", "stuffed teddy butler", "stuffed martini", "stuffed crazy bastard sword", "stuffed tin of caviar", "bejeweled cufflinks", "garish pinky ring", "giant designer sunglasses", "fancy opera glasses", "designer handbag", "Clan pool table", "tiny cell phone", "cube of billiard chalk", "hot-ass club", "frigid-ass club", "creepy-ass club", "sizzling seal fat", "Abyssal ember", "frost-rimed seal hide", "frozen seal spine", "seal lube", "mannequin leg", "padded tortoise", "tortoboggan", "painted turtle", "painted shield", "sleeping wereturtle", "blue shell", "torquoise", "torquoise ring", "dueling turtle", "dueling banjo", "soup turtle", "samurai turtle", "samurai turtle helmet", "ancient turtle shell", "ancient turtle shell powder", "ancient turtle shell helmet", "slime-soaked hypophysis", "slime-soaked brain", "slime-soaked sweat gland", "security blankie", "big bundle of chamoix", "boxcar turtle", "dolphin whistle", "metrognome", "infant sandworm", "string of dingle balls", "agua de vida", "tortoboggan shield", "bottle of moontan lotion", "soup-chucks", "ballast turtle", "memory of some delicious amino acids", "memory of a C", "memory of an A", "memory of a G", "memory of a T", "memory of a CA base pair", "memory of a CG base pair", "memory of a CT base pair", "memory of an AG base pair", "memory of an AT base pair", "memory of a GT base pair", "squirming Slime larva", "rusty metal greaves", "undissolvable contact lenses", "rusty piece of rebar", "slime-covered shovel", "slime-covered necklace", "slime-covered speargun", "slime-covered compass", "slime-covered helmet", "slime-covered lantern", "slime-covered greaves", "slime-covered club", "memory of a grappling hook", "memory of a small stone block", "memory of a little stone block", "memory of half a stone circle", "memory of a stone half-circle", "memory of an iron key", "memory of a glowing crystal", "caustic slime nodule", "slimy sweetbreads", "slimy fermented bile bladder", "slimy alveolus", "memory of a cultist's robe", "pig-iron helm", "pig-iron shinguards", "pig-iron bracers", "wumpus hair", "wumpus-hair bolo", "wumpus-hair net", "wumpus-hair whip", "wumpus-hair wig", "wumpus-hair loincloth", "wumpus-hair sweater", "ring of teleportation", "glass of baboon milk", "banana milkshake", "White Hyborian", "goblin hunting spear", "goblin autoblowgun", "shiny tribal beads", "ancient stone fist", "ancient stone head", "Indigo Party Invitation", "Violet Hunt Invitation", "Blue Milk Club Card", "Mecha Mayhem Club Card", "'Smuggler Shot First' Button", "Spacefleet Communicator Badge", "Ruby Rod", "essence of heat", "essence of kink", "essence of cold", "essence of stench", "essence of fright", "essence of cute", "Supreme Being Glossary", "multi-pass", "villainous scythe", "baneful bandolier", "diabolical crossbow", "malevolent medallion", "corrosive cowl", "grisly shield", "corroded breeches", "pernicious cudgel", "cupcake-in-a-cup", "pool of liquid metal", "protein paste", "cyber-mattock", "facehugging alien", "X-37 gun", "neurostim pill", "physiostim pill", "tiny slimy cyst", "small slimy cyst", "medium slimy cyst", "big slimy cyst", "green peawee marble", "brown crock marble", "red China marble", "lemonade marble", "bumblebee marble", "jet bennie marble", "beige clambroth marble", "steely marble", "beach ball marble", "black catseye marble", "big bumboozer marble", "chamoisole", "bitter pill", "monstrous monocle", "musty moccasins", "molten medallion", "brazen bracelet", "bitter bowtie", "bewitching boots", "secret from the future", "moist sack", "rickety old unicycle", "crusty hula hoop", "Coily&trade;", "old school flying disc", "lawn dart", "red wagon", "wad of slimy rags", "crown-shaped beanie", "hopping socks", "poodle skirt", "letterman's jacket", "hardened slime hat", "hardened slime pants", "hardened slime belt", "empty agua de vida bottle", "boot plant", "sham champagne", "tempura air", "pressurized potion of pneumaticity", "moveable feast", "Bag o' Tricks", "slime stack", "a rumpled paper strip", "a creased paper strip", "a folded paper strip", "a crinkled paper strip", "a crumpled paper strip", "a ragged paper strip", "a ripped paper strip", "funny paper hat", "floaty sand", "charged magnet", "floaty stone sphere", "quadroculars", "lint", "dubious peppermint", "Elvish delight", "rockfish stomach", "live lobster", "wok lobster", "floaty pebbles", "floaty gravel", "floaty rock", "rock lobster", "pebblebr&auml;u", "rocky road ice cream", "extra-strength rubber bands", "children of the candy corn", "Good 'n' Slimy", "Staff of the Soupbone", "Voluminous Radio Pants", "Voluminous Radio Hat", "Voluminous Radio Sneakers", "4-d camera", "shaking 4-d camera", "crystallized memory", "floaty rock helmet", "floaty rock pants", "floaty rock necklace", "spaghetti cult robe", "sugar sheet", "Tome of Sugar Shummoning", "sugar shotgun", "sugar shillelagh", "sugar shank", "sugar chapeau", "sugar shorts", "sugar shield", "slime convention swag bag", "slime convention flyers", "slime convention coupons", "slime convention pin", "slime convention t-shirt", "floaty inverse geode", "control crystal", "sugar shirt", "sugar shard", "rave visor", "baggy rave pants", "pacifier necklace", "sea cowbell", "sea leather", "sea lasso", "sea cowboy hat", "grouper fangirl", "gill rings", "urchin roe", "pet anemone", "Mer-kin cheatsheet", "Mer-kin wordquiz", "brand new key", "brass dorsal fin", "skate skates", "skate skin", "roller skate decoy", "mermaid's purse", "underwater slingshot", "skate blade", "spangly unitard", "collapsible baton", "groupie lipstick", "groupie bra", "groupie spangles", "skate board", "S.A.V.E. flyer", "yield shield", "map to the Skate Park", "squamous polyp", "unspeakable lozenges", "roller skate doll", "Star of Bravery", "hungover chauvinist pig", "perfectly ordinary frog", "amphibious tophat", "bottle of Cochon Noir", "ice skate decoy", "ice skate doll", "hacienda key", "silver pat&eacute; knife", "silver salt-shaker", "can of sterno", "silver cheese-slicer", "fancy beef jerky", "pipe wrench", "gun cleaning kit", "sleep mask", "sock garters", "mariachi toothpaste", "heavy leather-bound tome", "leather bookmark", "ivory cue ball", "decanter of fine Scotch", "expensive cigar", "miniature tophat", "fisherman's sack", "fish-oil smoke bomb", "vial of squid ink", "potion of fishy speed", "spooky bark", "Wolfman Nardz", "spooky sap", "petrified wood", "chocolate-covered scarab beetle", "mulled cider", "wolfman mask", "pumpkinhead mask", "mummy costume", "Ax of L'rose", "bark boxers", "bark beret", "bark bracelet", "Krakrox's Loincloth", "Galapagosian Cuisses", "Angelhair Culottes", "Newman's Own Trousers", "Volartta's bellbottoms", "Lederhosen of the Night", "ribbon candy", "Underworld acorn", "Underworld trunk", "Underworld truncheon", "Staff of the Woodfire", "Underworld flail", "Mer-kin cancerstick", "Mer-kin sawdust", "Mer-kin bunwig", "crappy Mer-kin mask", "crappy Mer-kin tailpiece", "Mer-kin gladiator mask", "Mer-kin scholar mask", "Mer-kin gladiator tailpiece", "Mer-kin scholar tailpiece", "Mer-kin headguard", "Mer-kin waistrope", "Mer-kin facecowl", "Mer-kin thighguard", "Mer-kin dodgeball", "Mer-kin dragnet", "Mer-kin switchblade", "crystal orb of spirit wrangling", "depleted uranium seal figurine", "Ass-Stompers of Violence", "Brand of Violence", "Novelty Belt Buckle of Violence", "Lens of Violence", "Pigsticker of Violence", "Jodhpurs of Violence", "Cold Stone of Hatred", "Girdle of Hatred", "Staff of Simmering Hatred", "Pantaloons of Hatred", "Fuzzy Slippers of Hatred", "Lens of Hatred", "Treads of Loathing", "Scepter of Loathing", "Belt of Loathing", "Goggles of Loathing", "Stick-Knife of Loathing", "Jeans of Loathing", "Annual Ascot", "Sledgehammer of the V&aelig;lkyr", "Flail of the Seven Aspects", "Wrath of the Capsaician Pastalords", "Windsor Pan of the Source", "Seeger's Unstoppable Banjo", "The Trickster's Trikitixa", "Claw of the Infernal Seal", "Garter of the Turtle Poacher", "Bandolier of the Spaghetti Elemental", "Gravyskin Belt of the Sauceblob", "Bling of the New Wave", "La Hebilla del Cintur&oacute;n de Lopez", "suspicious stocking", "bag of many confections", "candy kneecapping stick", "licorice garrote", "candy knuckles", "jawbruiser", "fancy chocolate car", "tiny plastic 11 Dealer", "tiny plastic Crimbo Casino", "tiny plastic stocking mimic", "tiny plastic Don Crimbo", "tiny plastic Crimbomination", "Piddles", "BitterSweetTarts", "Polka Pop", "Crimbuck", "Crimbo wreath", "string of Crimbo lights", "plastic Crimbo reindeer", "gingerbread house", "leftover Crimbo rations", "snow hat", "snow pants", "snow belly", "pile of loose snow", "Crimbough", "A Crimbo Carol, Ch. 1", "A Crimbo Carol, Ch. 2", "A Crimbo Carol, Ch. 3", "A Crimbo Carol, Ch. 4", "A Crimbo Carol, Ch. 5", "A Crimbo Carol, Ch. 6", "expired can of franks 'n' beans", "expired bottle of peppermint schnapps", "snow halo", "elf resistance button", "elven suicide capsule", "penguin focaccia bread", "herringcello", "elven cellocello", "wrench handle", "handful of headless bolts", "bottle of agitprop ink", "handful of wires", "chunk of cement", "grappling hook", "cardboard elf ear", "spiraling shape", "Crimbomination Contraption", "throwing wrench", "pair of bolt cutters", "poison pen", "speed limit shield", "live wire", "misfit dolly", "misfit hobby horse", "misfit teddy bear", "pocketwatch on a chain", "cement sandals", "night-vision goggles", "passable elf mask", "peanut brittle shield", "Red Rover BB gun", "red-and-green sweater", "Crimbo Candy Cookbook", "Crimbo peppermint bark", "Crimbo fudge", "Crimbo candied pecan", "Jack-in-the-box", "brass crank handle", "stinky cheese ball", "stinky cheese sword", "stinky cheese diaper", "stinky cheese wheel", "stinky cheese eye", "Staff of Queso Escusado", "foreign box", "The Art of Slapfighting", "Uncle Romulus", "A Beginner's Guide to Charming Snakes", "Zu Mannk&auml;se Dienen", "The Autobiography Of Dynamite Superman Jones", "Inigo's Incantation of Inspiration", "quantum taco", "Schr&ouml;dinger's thermos", "colorful plastic ball", "sealhide hood", "sealhide leggings", "sealhide cloak", "sealhide buckler", "sealhide whip", "sealhide moccasins", "sealhide gloves", "sealhide belt", "sealhide snare", "puzzling trophy", "sealhide seal doll", "black hymnal", "glowstick on a string", "candy necklace", "teddybear backpack", "NPZR chemistry set", "invisibility potion", "irresistibility potion", "irritability potion", "strange cube", "hellseal whisker", "hellseal claw", "guard turtle shell", "crowbar", "spaghetti cult rosary", "spaghetti cult mask", "guard turtle collar", "spangly mariachi pants", "spangly mariachi vest", "spangly sombrero", "Instant Karma", "antique painting of a landscape", "map to The Landscaper's Lair", "pointy red hat", "machetito", "lawnmower blade", "grass clippings", "The Landscaper's leafblower", "snowball", "snailmail bits", "snailmail coif", "snailmail breeches", "snailmail hauberk", "seal-brain elixir", "chocolate seal-clubbing club", "chocolate turtle totem", "chocolate pasta spoon", "chocolate saucepan", "chocolate disco ball", "chocolate stolen accordion", "Libram of BRICKOs", "BRICKO brick", "BRICKO eye brick", "BRICKO hat", "BRICKO pants", "BRICKO sword", "BRICKO ooze", "BRICKO bat", "BRICKO oyster", "BRICKO turtle", "BRICKO elephant", "BRICKO octopus", "BRICKO python", "BRICKO vacuum cleaner", "BRICKO airship", "BRICKO cathedral", "BRICKO gargantuchicken", "BRICKO pyramid", "BRICKO pearl", "BRICKO bulwark", "BRICKO trunk", "gilded BRICKO brick", "gilded BRICKO chalice", "black BRICKO brick", "green BRICKO brick", "broken BRICKO brick", "BRICKO reactor", "BRICKO egg", "extra-heavy BRICKO brick", "recording of The Ballad of Richie Thingfinder", "recording of Benetton's Medley of Diversity", "recording of Elron's Explosive Etude", "recording of Chorale of Companionship", "recording of Prelude of Precision", "recording of Donho's Bubbly Ballad", "recording of Inigo's Incantation of Inspiration", "heart of the volcano", "Northern pemmican", "puzzling ribbon", "Clan looking glass", "&quot;DRINK ME&quot; potion", "reflection of a map", "walrus ice cream", "beautiful soup", "eggman noodles", "Vial of <i>jus de larmes</i>", "Humpty Dumplings", "Lobster <i>qua</i> Grill", "missing wine", "yellow matter custard", "delicious comfit?", "ittah bittah hookah", "flamingo mallet", "croquet hedgehog", "Tiger-lily's milk", "eye of the Tiger-lily", "powdered wig", "powdered donut", "bucket of honey", "elephant stinger", "dragon snaps", "snapdragon pistil", "puff of smoke", "rook cookie", "bishop cookie", "knight cookie", "king cookie", "queen cookie", "fairy-worn boots", "insane tophat", "helm of the white knight", "wristwatch of the white knight", "trousers of the white knight", "fancy tophat", "fancy black tie", "fancy tuxedo pants", "stuffed porpoise", "stuffed pocketwatch", "stuffed bandersnatch", "stuffed caterpillar", "stuffed walrus", "stuffed carpenter", "stuffed dodo", "detour shield", "left parenthesis", "lowercase a", "percent sign", "left bracket", "right parenthesis", "dollar sign", "equal sign", "antique record album", "map to Professor Jacking's laboratory", "can of depilatory cream", "hair of the calf", "world's most unappetizing beverage", "slippery when wet shield", "raisin", "tiny fly glasses", "flyest of shirts", "a dance upon the palate", "tiny frozen prehistoric meteorite jawbreaker", "Crazyleg's razor", "squirmy violent party snack", "can-you-dig-it?", "The Legendary Beat", "panicked kernel", "bugged beanie", "bugged balaclava", "bugged b&Atilde;&para;n&plusmn;&Atilde;&copy;t", "meat st&permil;&iquest;bing club", "Knob G&Atilde;&para;blin l&Atilde;&sup2;ve potion", "old school Mafi<i>a kni</i>cke&frac12;&aelig;", "T&Icirc;&curren;&loz;lisman of Bai&oslash;&Dagger;", "fat bottom quark", "big glob of skin", "six tiny wedges of goat cheese", "collection of tiny spooky objects", "boulder", "tiny goth giant", "brown pixel", "pixel whip", "pixel chain whip", "pixel morning star", "pixel orb", "pixellated moneybag", "pixel cross", "pixel holy water", "map to Vanya's Castle", "antique 8-Bit Power magazine", "pixel stopwatch", "antique bottle opener", "map to the Kegger in the Woods", "plastic cup of beer", "orquette's phone number", "bronze handcuffs", "silver keg", "bottle of Goldschn&ouml;ckered", "sun-dried tofu", "soyburger juice", "respected companion biscuit", "essential tofu", "essential soy", "essential cameraderie", "antique souvenir drawing", "map to the Magic Commune", "Crown of Thrones", "Cinco Mayo Lager", "Underworld sapling", "miniature pruning shears", "plastic cup of flat beer", "glowing frisbee", "portable motorcycle", "Game Grid token", "Game Grid ticket", "chocolate-covered caviar", "pawn cookie", "coffee pixie stick", "superduperball", "finger cuffs", "little parachute guy", "plastic spider ring", "cheap plastic kazoo", "inflatable baseball bat", "googly-star hat", "googly-ball hat", "googly-heart hat", "super-sweet boom box", "Game Grid valued membership card", "sinister demon mask", "streetfighting champion's belt", "Space Trip safety headphones", "LARP carp", "KoL Con Six Pack", "Gregarious Gregorian Smock", "rxr shield", "Juju Mojo Mask", "space trooper helmet", "Meteoid ice beam", "Dungeon Fist gauntlet", "Schmalz's First Prize Beer", "chiptune guitar", "fixed-gear bicycle", "ironic moustache", "ironic knit cap", "ironic oversized sunglasses", "ironic battle spoon", "ironic jogging shorts", "mole skin notebook", "antique pair of blue jeans", "map to Ellsbury's Claim", "blackberry galoshes", "trout fang", "poisonous caviar", "wet venom duct", "Ellsbury's journal", "Ellsbury's skull", "hot plate", "imp unity ring", "Victor, the Insult Comic Hellhound Puppet", "observational glasses", "hilarious comedy prop", "beer-scented teddy bear", "booze-soaked cherry", "comfy pillow", "giant marshmallow", "sponge cake", "gin-soaked blotter paper", "tree-holed coin", "unearthed volcanic meteoroid", "unearthed potsherd", "volcanic ash", "smoked potsherd", "pottery shield", "pottery hat", "pottery training pants", "pottery club", "pottery yo-yo", "pottery barn owl figurine", "fossilized bat skull", "fossilized serpent skull", "fossilized baboon skull", "fossilized wyrm skull", "fossilized wing", "fossilized limb", "fossilized torso", "fossilized spine", "affordable teak perch", "Greatest American Pants", "fossilized necklace", "imp air", "bus pass", "fossilized spike", "waterlogged crate", "archaeologing shovel", "red-hot medallion", "fossilized demon skull", "fossilized spider skull", "sinister ancient tablet", "E-Z Cook&trade; oven", "My First Shaker&trade;", "hippo tutu", "immense ballet shoes", "old sweatpants", "GameInformPowerDailyPro subscription card", "popsicle stick", "lemon popsicle", "orange popsicle", "strawberry popsicle", "liver popsicle", "mariachi hat", "Hollandaise helmet", "organ grinder", "microwave stogie", "liver and let pie", "badass pie", "shoo-fish pie", "piping organ pie", "igloo pie", "stomach turnover", "dead lights pie", "throbbing organ pie", "stop shield", "nest egg", "sleeping piano cat", "kitty sheet music", "rehearsing dramatic hedgehog", "tiny prop sword", "tangle of rat tails", "beer-soaked mop", "day-old beer", "plain old beer", "overpriced &quot;imported&quot; beer", "smiling rat", "rat tooth polish", "bone chips", "PlexiPips", "Wax Flask", "Pain Dip", "bone meal", "bone aperitif", "bonerang", "bone and arrows", "boning knife", "bone crusher", "bone spurs", "bonedanna", "boneana hammock", "bag of bones", "Stabonic scroll", "candy skeleton", "Grumpy Bumpkin's Pumpkin Seed Catalog", "packet of pumpkin seeds", "pumpkin", "huge pumpkin", "pumpkin pie", "pumpkin beer", "pumpkin juice", "pumpkin bomb", "shin gourds", "Staff of the November Jack-O-Lantern", "pumpkin carriage", "Desert Bus pass", "ginormous pumpkin", "Essence of Annoyance", "Unmotivator: Crashed Orca", "Unmotivator: Success Warrior", "Unmotivator: Crashed Meat Car", "Holiday Hal's Happy-Time Fun Book!", "Holiday Fun!", "Antagonistic Snowman Kit", "CRIMBCOIDS mints", "can of CRIMBCOLA", "CRIMBCOLOAF", "circular CRIMBCOOKIE", "tiny plastic CRIMBCO HQ", "tiny plastic fax machine", "tiny plastic hobo elf", "tiny plastic Mr. Mination", "tiny plastic Best Game Ever", "hibernating robot reindeer", "S.L.E.I.G.H.B.E.L.L.S.", "robot reindeer protocol P.R.A.N.C.E.R.", "robot reindeer protocol D.A.S.H.E.R.", "robot reindeer protocol D.O.N.N.E.R.", "robot reindeer protocol V.I.X.E.N.", "robot reindeer protocol C.U.P.I.D.", "robot reindeer protocol D.A.N.C.E.R.", "robot reindeer protocol C.O.M.E.T.", "robot reindeer protocol B.L.I.T.Z.E.N.", "robot reindeer protocol R.U.D.O.L.P.H.", "robot reindeer protocol O.L.I.V.E.", "triangular CRIMBCOOKIE", "square CRIMBCOOKIE", "bindlestocking", "sleeping stocking", "Tales of a Kansas Toymaker", "The Joy of Wassailing", "Uncle Hobo's stocking cap", "Uncle Hobo's epic beard", "Uncle Hobo's gift baggy pants", "Uncle Hobo's fingerless tinsel gloves", "Uncle Hobo's highest bough", "Uncle Hobo's belt", "chocolate cigar", "gift-a-pult", "holly-flavored Hob-O", "CRIMBCO scrip", "Toot Oriole care package", "paperclip", "bottle of Blank-Out", "CRIMBCO lanyard", "CRIMBCO Employee Handbook (chapter 1)", "CRIMBCO Employee Handbook (chapter 2)", "CRIMBCO Employee Handbook (chapter 3)", "CRIMBCO Employee Handbook (chapter 4)", "CRIMBCO Employee Handbook (chapter 5)", "portable photocopier", "deluxe fax machine", "Workytime Tea", "paperclip sproinger", "paperclip-on tie", "paperclip pants", "paperclip turban", "paperclip cape", "glob of Blank-Out", "photocopied monster", "gaudy key", "BGE merchandise order form", "chocolate bath ball", "bacon bath ball", "incense bath ball", "myrrh-soaked, chocolate-covered bacon bath ball", "CRIMBCO mug", "CRIMBCO wine", "Dickory Farms Gift Basket", "toe jam", "toe jam toast", "traffic jam", "traffic jam toast", "space jam", "space jam toast", "motivational poster", "sack lunch", "bath ball gift set", "slow jam collection", "BGE shotglass", "festive sausage", "holiday cheese log", "holiday log", "BGE 'ferocious fruit' shirt", "BGE 'cuddly critter' shirt", "BGE pocket calendar", "BGE temporary tattoo", "BGE tiny plastic toy", "stapler bear", "adhesive tape dolly", "scissor duck", "coal paperweight", "jingle bell", "Seven Loco", "Loathing Legion knife", "Loathing Legion many-purpose hook", "Loathing Legion moondial", "Loathing Legion necktie", "Loathing Legion electric knife", "Loathing Legion corkscrew", "Loathing Legion can opener", "Loathing Legion chainsaw", "Loathing Legion rollerblades", "Loathing Legion flamethrower", "Loathing Legion tattoo needle", "Loathing Legion defibrillator", "Loathing Legion double prism", "Loathing Legion tape measure", "Loathing Legion kitchen sink", "Loathing Legion abacus", "Loathing Legion helicopter", "Loathing Legion pizza stone", "Loathing Legion universal screwdriver", "Loathing Legion jackhammer", "Loathing Legion hammer", "Uncle Crimbo's Sack", "Folder Holder", "a cute angel", "quake of arrows", "time's arrow", "arrowgram", "Knob jelly donut", "Knob cake", "Knob cake pan", "Knob batter", "Knob frosting", "unfrosted Knob cake", "Cobb's Knob Menagerie key", "GOTO", "weremoose spit", "abominable blubber", "flimsy clipboard", "baggie of powdered sugar", "whalebone corset", "oven mitts", "overcookie", "philosopher's scone", "half-baked potion", "Knob Goblin deluxe scimitar", "Knob nuts", "Cobb's Knob Wurstbrau", "Subject 37 file", "mysterious silver lapel pin", "solid state loom", "Evilometer", "Sorcerers of the Shore Grimoire", "Pack of Alice's Army Cards", "Alice's Army Swordsman", "Alice's Army Spearsman", "Alice's Army Halberder", "Alice's Army Guard", "Alice's Army Wallman", "Alice's Army Ninja", "Alice's Army Alchemist", "Alice's Army Page", "Alice's Army Shieldmaiden", "Alice's Army Mad Bomber", "Alice's Army Nurse", "Alice's Army Hammerman", "Alice's Army Bowman", "Alice's Army Lanceman", "Alice's Army Horseman", "Alice's Army Coward", "Alice's Army Cleric", "Alice's Army Sniper", "Alice's Army Dervish", "Alice's Army Martyr", "Pack of Alice's Army Foil Cards", "Alice's Army Foil Swordsman", "Alice's Army Foil Spearsman", "Alice's Army Foil Halberder", "Alice's Army Foil Guard", "Alice's Army Foil Wallman", "Alice's Army Foil Ninja", "Alice's Army Foil Alchemist", "Alice's Army Foil Page", "Alice's Army Foil Shieldmaiden", "Alice's Army Foil Mad Bomber", "Alice's Army Foil Nurse", "Alice's Army Foil Hammerman", "Alice's Army Foil Bowman", "Alice's Army Foil Lanceman", "Alice's Army Foil Horseman", "Alice's Army Foil Coward", "Alice's Army Foil Cleric", "Alice's Army Foil Sniper", "Alice's Army Foil Dervish", "Alice's Army Foil Martyr", "Single Alice's Army Foil", "card sleeve", "evil eye", "Alice's Army Foil tattoo", "Ye Wizard's Shack snack voucher", "wasabi pocky", "tobiko pocky", "natto pocky", "wasabi-infused sake", "tobiko-infused sake", "natto-infused sake", "wasabi marble soda", "tobiko marble soda", "natto marble soda", "Alice's Army booster box", "elderly jawbreaker", "marshmallow flamb&eacute;", "cranberry schnapps", "breaded beer", "soy cordial", "astral bludgeon", "astral shield", "astral chapeau", "astral bracer", "astral longbow", "astral shorts", "astral mace", "astral trousers", "astral ring", "astral statuette", "astral pistol", "astral mask", "astral pet sweater", "astral shirt", "astral belt", "astral hot dog", "astral pilsner", "astral hot dog dinner", "astral six-pack", "Clan shower", "shard of double-ice", "double-ice cap", "double-ice box", "double-ice britches", "handful of numbers", "Lars the Cyberian", "intriguing puzzle box", "obnoxious riddle", "best joke ever", "Atomic Comic", "Red Pill", "Skullhead's Screw", "mysterious present", "boxing-glove-in-a-box", "creepy voodoo doll", "the finger", "Salsa de las Epocas", "spaghetti con calaveras", "s'more gun", "popcorn", "chaos popcorn", "tiny black hole", "innuendo", "s'more", "giant diamond ring", "Russian Ice", "giant clay ashtray", "orange leather lanyard", "monster pants", "box of Pok&euml;mann band-aids", "Pok&euml;mann band-aid", "Van der Graaf helmet", "electric crutch", "shock belt", "Okee-Dokee soda", "rubber band gun", "pin-stripe slacks", "sticky gloves", "correction fluid", "Pok&euml;mann figurine: Porkachu", "Pok&euml;mann figurine: Magikrap", "Pok&euml;mann figurine: Vegemite", "Pok&euml;mann figurine: Vermouth", "Pok&euml;mann figurine: Smugleaf", "Pok&euml;mann figurine: Twitter", "Pok&euml;mann figurine: Bloodkip", "Pok&euml;mann figurine: Hoboking", "Pok&euml;mann figurine: Duck", "Pok&euml;mann figurine: Nothing", "Pok&euml;mann figurine: Kagosan", "Pok&euml;mann figurine: Galumpagump", "Pok&euml;mann figurine: Shoggoth", "Pok&euml;mann figurine: Frank", "Pok&euml;mann figurine: Moog", "willyweed", "Nuclear Blastball", "fish juice box", "paint bomb", "hideous egg", "Jeppson's Malort", "fistful of ashes", "stress ball", "Li'l Businessman Kit", "Ultracolor&trade; shirt", "My Own Pen Pal kit", "packet of orchid seeds", "stomp box", "rusty hedge trimmers", "A. W. O. L. commendation", "reconstituted crow", "bird brain", "busted wings", "Massive Manual of Marauder Mockery", "Admiral's hat", "leather aviator's cap", "mirrored aviator shades", "Field Guide to Skeletal Anatomy", "Notes from the Elfpocalypse, Chapter I", "Notes from the Elfpocalypse, Chapter II", "Notes from the Elfpocalypse, Chapter III", "Notes from the Elfpocalypse, Chapter IV", "Notes from the Elfpocalypse, Chapter V", "Notes from the Elfpocalypse, Chapter VI", "Ultrasoldier Serum", "elven hardtack", "elven squeeze", "lunar isotope", "E.M.U. joystick", "E.M.U. rocket thrusters", "E.M.U. helmet", "E.M.U. harness", "[5139]carton of astral energy drinks", "[5140]astral energy drink", "Thwaitgold bee statuette", "moon unit", "E.M.U. Unit", "handful of honey", "honeypot", "wild honey pie", "honey mead", "honey dipper", "honeybritches", "honeycap", "Moonthril Circlet", "Moonthril Greaves", "Moonthril Flamberge", "Moonthril Longbow", "Moonthril Cuirass", "plush alielf", "Comet Drop", "plush dogcat", "plush hamsterpus", "plush ferrelf", "plush alien hamsterpus", "plush mutated alielf", "plush mutated alielephant", "mysterious chest", "spooky little girl", "tiny top hat and cane", "synthetic dog hair pill", "distention pill", "elven medi-pack", "transporter transponder", "Map to Safety Shelter Ronald Prime", "Map to Safety Shelter Grimace Prime", "elven magi-pack", "Saison du Lune", "Moonthril Schnapps", "Wrecked Generator", "Spaghetti with Moonballs", "Crepes a la Lune", "Moon Pie", "Comet Pop", "Flan in the Moon", "1/6th Pound Cake", "Mint-in-box Moonthril Circlet", "Mint-in-box Moonthril Greaves", "Mint-in-box Moonthril Cuirass", "Mint-in-box Moonthril Flamberge", "Mint-in-box Moonthril Longbow", "honey stick", "double-ice gum", "Operation Patriot Shield", "squirming egg sac", "corrupted data", "11-inch knob sausage", "exorcised sandwich", "Banfoy's Boutique Order Form", "Great S-Cape", "Marvelous Unitard", "gooey paste", "beastly paste", "oily paste", "ectoplasmic paste", "greasy paste", "bug paste", "hippy paste", "orc paste", "demonic paste", "indescribably horrible paste", "fishy paste", "goblin paste", "pirate paste", "chlorophyll paste", "strange paste", "Mer-kin paste", "slimy paste", "penguin paste", "elemental paste", "cosmic paste", "hobo paste", "Crimbo paste", "Teachings of the Fist", "fat loot token", "Thwaitgold grasshopper statuette", "Tome of Clip Art", "Ur-Donut", "The Bomb", "box of Familiar Jacks", "bucket of wine", "ultrafondue", "unbearable light", "oversized snowflake", "crystal skull", "borrowed time", "box of hammers", "shining halo", "furry halo", "frosty halo", "time halo", "Lumineux Limnio", "Morto Moreto", "Temps Tempranillo", "Bordeaux Marteaux", "Fromage Pinotage", "Beignet Milgranet", "Muschat", "cool jelly donut", "shrapnel jelly donut", "occult jelly donut", "thyme jelly donut", "frozen danish", "smashed danish", "forbidden danish", "cool cat claw", "blunt cat claw", "shadowy cat claw", "cheezburger", "toasted brie", "potion of the field gar", "too legit potion", "Bright Water", "cold-filtered water", "graveyard snowglobe", "cool cat elixir", "potion of the captain's hammer", "potion of X-ray vision", "potion of the litterbox", "potion of animal rage", "potion of punctual companionship", "holy bomb, batman", "bobcat grenade", "chocolate frosted sugar bomb", "broken glass grenade", "noxious gas grenade", "skull with a fuse in it", "boozebomb", "hammerus", "blunt icepick", "fluorescent lightbulb", "blammer", "clock-cleaning hammer", "4:20 bomb", "broken clock", "dethklok", "glacial clock", "Gygaxian Libram", "d4", "d6", "d8", "d10", "d12", "d20", "generic healing potion", "generic mana potion", "generic restorative potion", "kobold treasure hoard", "newborn kobold", "slightly thicker filthy rags", "dungeon dragon chest", "phish stick", "plastic vampire fangs", "Interview With You (a Vampire)", "Make-Your-Own-Vampire-Fangs kit", "your own black heart", "Sword of the Brouhaha Prince", "Chalice of the Malkovich Prince", "Sceptre of the Torremolinos Prince", "Medallion of the Ventrilo Prince", "Haunted Sorority House staff guide", "ghost trap", "chainsaw chain", "silver shotgun shell", "funhouse mirror", "ghostly body paint", "necrotizing body spray", "bite-me-red lipstick", "whisker pencil", "press-on ribs", "Rattlin' Chains", "Gummy Brains", "Blood 'n' Plenty", "Lobos Mints", "Sweet Sword", "Ecto-Cooler", "Bartles and BRAAAINS wine cooler", "Blood Light", "Silver Bullet beer", "Bone's Farm &quot;wine&quot;", "ghost protocol", "sorority brain", "Nightstalker perfume", "drum of pomade", "throwing bone", "extra-see-thru nightie", "BRAINS shorts", "Mesmereyes&trade; contact lenses", "cursed scrunchie", "extremely skinny jeans", "The Necbromancer's Hat", "The Necbromancer's Stein", "The Necbromancer's Shorts", "The Necbromancer's Wizard Staff", "The Necbronomicon", "The Cooler Out of Space", "The Necbronomicon (used)", "sorority girl's box", "Necbro wafers", "death blossom", "A Crimbo Carol, Ch. 1 (used)", "A Crimbo Carol, Ch. 2 (used)", "A Crimbo Carol, Ch. 3 (used)", "A Crimbo Carol, Ch. 4 (used)", "A Crimbo Carol, Ch. 5 (used)", "A Crimbo Carol, Ch. 6 (used)", "jar of oil", "The Art of Slapfighting (used)", "Uncle Romulus (used)", "A Beginner's Guide to Charming Snakes (used)", "Zu Mannk&auml;se Dienen (used)", "Autobiography Of Dynamite Superman Jones (used)", "Inigo's Incantation of Inspiration (crumpled)", "Tales of a Kansas Toymaker (used)", "The Joy of Wassailing (used)", "CRIMBCO Employee Handbook (chapter 1) (used)", "CRIMBCO Employee Handbook (chapter 2) (used)", "CRIMBCO Employee Handbook (chapter 3) (used)", "CRIMBCO Employee Handbook (chapter 4) (used)", "CRIMBCO Employee Handbook (chapter 5) (used)", "Field Guide to Skeletal Anatomy (shredded)", "Ellsbury's journal (used)", "KoL Con 8-Bit power bracelet", "miniature boiler", "stuffed-shirt scarecrow", "tiny plastic trollipop", "tiny plastic Fudge Wizard", "tiny plastic abominable fudgeman", "tiny plastic colollilossus", "tiny plastic Big Candy", "The Groose in the Hoose", "spruce juice", "groose grease", "lollipop stick", "bananagate", "pearidot", "tourmalime", "kumquartz", "strawberyl", "ridiculous belt", "ridiculous earring", "ridiculous sunglasses", "ridiculous sandwich", "ridiculous cocktail", "zombie monkey necklace", "Thwaitgold butterfly statuette", "scrap of sticky paper", "sandpaper", "peppermint sprout", "peppermint twist", "peppermint patty", "peppermint crook", "peppermint rhino baby", "candy cane candygram", "peppermint parasol", "giant candy cane", "Mint Salton Pepper's Peppermint Seed Catalog", "Peppermint Pip Packet", "cane-mail shirt", "cane-mail pants", "Vodka Matryoshka", "Gin Mint", "Tequiz Navidad", "Mint Yulep", "Crimbojito", "Sangria de Menthe", "candycaine powder", "licorice boa", "licorice root", "banana supersucker", "pear supersucker", "lime supersucker", "kumquat supersucker", "strawberry supersucker", "bananarama bangle", "pair of pearidot earrings", "tourmalime tourniquet", "kumquartz ring", "strawberyl necklace", "sucker bucket", "sucker hakama", "sucker kabuto", "sucker tachi", "sucker scaffold", "cinnamon troll doll", "grape troll doll", "blue raspberry troll doll", "DNOTC Box", "fudgecule", "fudge lily", "superheated fudge", "fluid of fudge-finding", "frigid fudgepuck", "fudgesicle", "wand of fudge control", "The Kloop in the Coop", "miniscule beatbox", "devilish folio", "clumsiness bark", "jar full of wind", "dangerous jerkcicle", "furious stone", "vanity stone", "lecherous stone", "jealousy stone", "avarice stone", "gluttonous stone", "red gummi ingot", "green gummi ingot", "yellow gummi ingot", "Fudgie Roll", "fudge bunny", "fudge spork", "fudgecycle", "fudge cube", "blank fudge mold", "Libram of Resolutions", "resolution: be wealthier", "resolution: be happier", "resolution: be stronger", "resolution: be smarter", "resolution: be sexier", "resolution: be feistier", "resolution: be kinder", "resolution: be more adventurous", "resolution: be luckier", "giant red gummi ingot", "giant green gummi ingot", "giant yellow gummi ingot", "gummi salamander", "gummi snake", "gummi canary", "giant red gummi bear", "giant green gummi bear", "giant yellow gummi bear", "red drunki-bear", "green drunki-bear", "yellow drunki-bear", "gummi bowtie", "fudge pocket square", "lollipop cufflinks", "trilobite fossil", "ammonite fossil", "belemnite fossil", "trilobite candy mold", "ammonite candy mold", "belemnite candy mold", "gummi trilobite", "gummi ammonite", "gummi belemnite", "all-year sucker", "heart of dark chocolate", "Big Candy's tophat", "Fuzzby", "Jackass Plumber home game", "Trivial Avocations board game", "Tickle-Me Emilio", "blessed large box", "pack of pogs", "jerky coins", "Go-Wassail", "Uncle Greenspan's Bathroom Finance Guide", "bottle of bubbles", "wind-up meatcar", "Trivial Avocations Card: What?", "Trivial Avocations Card: When?", "Trivial Avocations Card: Who?", "Trivial Avocations Card: Where?", "pog #01 (spider)", "pog #02 (Knob goblin)", "pog #03 (warwelf)", "pog #04 (skleleton)", "pog #05 (ninja snowman)", "pog #06 (filthy hippy)", "pog #07 (orcish frat boy)", "pog #08 (hellion)", "pog #09 (pirate)", "pog #10 (hobo)", "pog #11 (Naughty Sorceress)", "Atomic Pop", "tiny do-rag", "whimpering willow bark", "berries of suffering", "baobab sap", "cup of hickory chicory", "magnolia blossom", "Mortimer's nostrum", "Barulio's bottle", "Marvin's marvelous pill", "Winifred's whistle", "purple prose pen", "half-empty carton of milk", "glass of warm water", "desktop zen garden", "Vivian's Vitamin", "pink-belly slapper", "Leapin' Trousers", "green eggnog", "green hamhock", "The Thorax's Codex of Tormenting Plants", "Clancy's sackbut", "Ghost Pinching Quarterly", "Clancy's crumhorn", "The Snitch's Manifesto", "Clancy's lute", "Trusty", "can of Rain-Doh", "empty Rain-Doh can", "fireclutch", "Rain-Doh red wings", "Rain-Doh orange agent", "Rain-Doh yellow laser gun", "Rain-Doh green lantern", "Rain-Doh blue balls", "Rain-Doh indigo cup", "Rain-Doh violet bo", "Rain-Doh black box", "Rain-Doh box full of monster", "PB&BP", "club sandwich", "corned-beef Reuben", "frayed ninja rope", "dull ninja crampons", "loose ninja carabiner", "Groar's fur", "Thwaitgold stag beetle statuette", "Drac & Tan", "Transylvania Sling", "Shot of the Living Dead", "Buttery Knob", "Slippery Knob", "Flaming Knob", "Grasshopper", "Locust", "Plague of Locusts", "Red Dwarf", "Golden Mean", "Green Giant", "Aye Aye", "Aye Aye, Captain", "Aye Aye, Tooth Tooth", "Humanitini", "More Humanitini than Humanitini", "Oh, the Humanitini", "Great Older Fashioned", "Fuzzy Tentacle", "Crazymaker", "Zoodriver", "Sloe Comfortable Zoo", "Sloe Comfortable Zoo on Fire", "Suffering Sinner", "Suppurating Sinner", "Sizzling Sinner", "Firewater", "Earth and Firewater", "Earth, Wind and Firewater", "Slimosa", "Extra-slimy Slimosa", "Slimebite", "Cement Mixer", "Jackhammer", "Dump Truck", "Fauna Libre", "Chakra Libre", "Aura Libre", "Sazerorc", "Sazuruk-hai", "Flaming Sazerorc", "Green Velvet", "Green Muslin", "Green Burlap", "Mohobo", "Moonshine Mohobo", "Flaming Mohobo", "Drunken Philosopher", "Drunken Neurologist", "Drunken Astrophysicist", "Dark & Starry", "Black Hole", "Event Horizon", "Herring Daiquiri", "Herring Wallbanger", "Herringtini", "Lollipop Drop", "Candy Alexander", "Candicaine", "Caipiranha", "Flying Caipiranha", "Flaming Caipiranha", "Punchplanter", "Doublepunchplanter", "Haymaker", "Small Medium", "crystal decanter", "glowing fungus", "ancient poisoned dart", "stone wool", "shiny stones", "the Nostril of the Serpent", "ancient calendar fragment", "ancient calendar", "Boris's Helm", "staph of homophones", "Boris's Helm (askew)", "mime soul fragment", "Monster Manuel", "key-o-tron", "nailswurst", "used beer", "Huggler Radio", "fettucini &eacute;pines Inconnu recipe", "slap and slap again recipe", "insulting hat", "offensive moustache", "hairshirt", "Olympic-sized Clan crate", "cursed microwave", "cursed pony keg", "How to Tolerate Jerks", "How to Hold a Grudge", "puppet strings", "bagged stuffed &quot;L&quot;", "stuffed club", "fettucini &eacute;pines Inconnu", "slap and slap again", "gunpowder burrito", "beery blood", "stuffed &quot;L&quot;", "watered-down Red Minotaur", "pool torpedo", "Ze&trade; goggles", "soggy used band-aid", "stylish swimsuit", "lost key", "P.B.L.T.", "note from Clancy", "BURT", "handful of juicy garbage", "bugbear communicator badge", "quantum nanopolymer spider web", "bugbear autopsy tweezers", "UV monocular", "drone self-destruct chip", "Jeff Goldblum larva", "pacification grenade", "quantum disintegrator pistol", "phase-tuned shield generator belt", "Thwaitgold woollybear statuette", "bugbear detector", "bugbear purification pill", "1 Meat", "The Lost Glasses", "The Lost Pill Bottle", "The Lost Comb", "Moping Artistic Goth Kid", "little wooden mannequin", "crayon shavings", "wax bugbear", "wax hat", "wax pants", "FDKOL commendation", "drop of water-37", "fireman's helmet", "fire axe", "enchanted fire extinguisher", "FDKOL tattoo", "Hjodor's Guide to Arctic Dalmatians", "Hjodor's Guide to Arctic Dalmatians (used)", "FDKOL hotcakes", "hot egg", "smoking grass", "fiery wing", "wings of fire", "FDKOL fire hose", "bottle of fire", "molten brick", "hot daub", "hot daub bun", "hot daub stand", "foot-long hot daub", "ballpark hot daub", "angst burger", "5-hour acrimony", "blank note", "eerily silent box", "forbidden sausage", "Lord Flameface's cloak", "Drizzlers&trade; Black Licorice", "daub-breaker", "Camp Scout backpack", "CSA fire-starting kit", "bag of GORP", "water purification pills", "Camp Scout pup tent", "CSA scoutmaster's &quot;water&quot;", "bag of GORF", "CSA discount card", "bag of QWOP", "CSA bravery badge", "CSA all-purpose soap", "CSA cheerfulness ration", "CSA obedience grenade", "Tales of the Word Realms", "crappy brain", "decent brain", "good brain", "boss brain", "hunter brain", "Staff of Holiday Sensations", "rusty staff", "slime-covered staff", "Staff of the Scummy Sink", "flaming nose", "Superhero Reboots", "fuzzy busby", "fuzzy earmuffs", "fuzzy montera", "Unagnimated Gnome", "gnomish swimmer's ears", "gnomish coal miner's lung", "gnomish tennis elbow", "gnomish housemaid's kgnee", "gnomish athlete's foot", "Thwaitgold maggot statuette", "talkative skull", "shiny gold fronts", "Barney's rake", "idiot brain", "keel-haulin' knife", "ancient ice cream scoop", "soft green echo eyedrop antidote martini", "morningwood plank", "raging hardwood plank", "weirdwood plank", "thick caulk", "long hard screw", "messy butt joint", "smut orc keepsake box", "bubblin' crude", "box of bear arms", "right bear arm", "left bear arm", "Hat O' Nine Tails", "Enchanted Plunger", "Enchanted Flyswatter", "Gearhead Goo", "Missing Eye Simulation Device", "Gnollish Crossdress", "eldritch dough", "Charity's choker", "Smart Bone Dust", "perpendicular guano", "White Chocolate Golem Seeds", "Shivering Ch&egrave;vre", "giant breath mint", "enchanted muesli", "glass of warm milk", "glass of gnat milk", "Knob Goblin Mutagen", "Tears of the Quiet Healer", "giant tube of black lipstick", "skelelton spine", "smut orc sunglasses", "blob of acid", "flayed mind", "kobold kibble", "forest spirit rattle", "Stone Golem pebbles", "spooky gravy fairy warlock hat", "bull blubber", "frog lip-print", "gazely stare", "tiny canopic jar", "clove-flavored lip balm", "Skullery Maid's Knee", "zombie hollandaise", "skeletal banana", "gilt perfume bottle", "janglin' bones", "pygmy papers", "pygmy dart", "secret mummy herbs and spices", "brigand brittle", "holistic headache remedy", "scrunchie tourniquet", "embezzler's oil", "Fu Manchu Wax", "Iiti Kitty Gumdrop", "ravenous eye", "Rogue Windmill Rouge", "A muse-bouche", "gold toothbrush", "pirate cream pie", "una poca de gracia", "compressed air canister", "salt water taffy", "unholy water", "Bangyomaman battle juice", "handyman &quot;hand soap&quot;", "space marine flash grenade", "temporary tribal tattoo", "oil-filled donut", "stick-on gnome beard", "BRICKO stud", "Osk'r Chow", "Scuba Snack", "grey cube", "votive candle", "booby trap", "Agent Corrigan's cigarette", "good ash", "Tome of Rad Libs", "Rad Lib", "papier-m&acirc;ch&eacute; glob", "papier-mochi", "papier-m&acirc;chaeranthera", "papier-m&acirc;ch&eacute; toothpicks", "papier-m&acirc;ch&eacute;te", "papier-m&acirc;chine gun", "papier-masque", "papier-mitre", "papier-m&acirc;churidars", "papier-m&acirc;ch&eacute; plaque", "papier-m&acirc;ch&eacute; handle", "papier-m&acirc;ch&eacute; base", "papier-m&acirc;ch&eacute; bowl", "papier-m&acirc;ch&eacute; trophy pi&ntilde;ata", "Rainbow Jello Mould", "Pete & Jackie's Dragon Tooth Emporium Catalog", "packet of dragon's teeth", "skeleton", "skeleton skis", "skeleton quiche", "skeletal scabbard", "skeletal skiff", "Bonestabber", "crystal skeleton vodka", "Lazybones&trade; recliner", "auxiliary backbone", "skulldozer egg", "ribcage rollcage", "that gum you like", "dreaming Jung man", "Little Crimson Book", "avatar of the Unconscious Collective", "blue canary nightlight", "Unconscious Collective Dream Jar", "jar of psychoses (The Suspicious-Looking Guy)", "jar of psychoses (The Captain of the Gourd)", "jar of psychoses (The Crackpot Mystic)", "jar of psychoses (The Old Man)", "jar of psychoses (The Pretentious Artist)", "jar of psychoses (The Meatsmith)", "[Jar of psychoses (Trader)]", "jar of psychoses (Jick)", "pixel pill", "pixel energy tank", "ChibiBuddy&trade; (on)", "gold wedding ring", "deactivated nanobots", "nanorhino credit card", "Solstice Shield", "powdered candy sushi set", "sweet mochi ball", "beet-flavored Mr. Mediocrebar", "sweet-corn-flavored Mr. Mediocrebar", "cabbage-flavored Mr. Mediocrebar", "tiny plastic animelf", "tiny plastic ChibiBuddy&trade;", "tiny plastic taco-clad Crimbo elf", "tiny plastic Uncle Crimboku", "tiny plastic MechaElf", "plastic ingot", "electrical thingamabob", "ChibiBuddy&trade; (off)", "BittyCar MeatCar", "BittyCar HotCar", "brainwave-controlled unicorn horn", "bubble-wrap simulator", "blind-packed capsule toy", "tiny plastic four-shadowed mime", "tiny plastic Bugbear Captain", "tiny plastic Rene C. Corman", "tiny plastic Lord Flameface", "tiny plastic Beebee King", "tiny plastic Queen Bee", "tiny plastic Wu Tang the Betrayer", "tiny plastic Clancy the Minstrel", "tiny plastic Battlesuit Bugbear Type", "tiny plastic spiderbugbear", "tiny plastic peacannon", "tiny plastic the Free Man", "tiny plastic fire servant", "tiny plastic mumblebee", "tiny plastic moneybee", "tiny plastic beebee gunners", "tiny plastic beebee queue", "tiny plastic buzzerker", "tiny plastic bee swarm", "tiny plastic batbugbear", "tiny plastic bugaboo", "tiny plastic Ancient Unspeakable Bugbear", "tiny plastic black ops bugbear", "tiny plastic hypodermic bugbear", "tiny plastic cavebugbear", "tiny plastic Norville Rogers", "tiny plastic Scott the Miner", "tiny plastic angry space marine", "tiny plastic Charity the Zombie Hunter", "tiny plastic Father McGruber", "tiny plastic Hank North, Photojournalist", "tiny plastic blazing bat", "electronic dulcimer pants", "A-Boo clue", "Frown Exerciser", "soul monocle", "soul doorbell", "soul coin", "soul knife", "soul mask", "record of infuriating silence", "record of infuriating silence (used)", "record of tranquil silence", "record of tranquil silence (used)", "record of menacing silence", "record of menacing silence (used)", "silent beret", "slice of pizza", "huge gold coin", "cartoon heart", "gold star", "tankard of ale", "vial of holy water", "green cloth cap", "iron dagger", "hamburger", "dollar-sign bag", "red potion", "blue potion", "bottle of wine", "round blue bomb", "iron helmet", "steel sword", "whole roasted chicken", "massive gemstone", "extra-strength red potion", "fancy blue potion", "shining goblet", "fireball", "gold crown", "flaming sword", "Helm of the Scream Emperor", "Cloak of Dire Shadows", "Sword of Dark Omens", "Shield of Icy Fate", "Greaves of the Murk Lord", "Gauntlets of the Blood Moon", "Boots of Twilight Whispers", "Belt of Howling Anger", "logging hatchet", "orc wrist", "freshwater pearl necklace", "orcish stud-finder", "screwing pooch", "orcish hand lotion", "orcish rubber", "orcish nailing lube", "backwoods screwdriver", "loadstone", "Claybender glasses", "Duskwalker fangs", "Space Tourist Phaser", "Whoompa Fur Pants", "Whatsian Ionic Pliers", "Polysniff Perfume", "Duskwalker syringe", "Space Tours Tripple", "Battlie Light Saver", "T.U.R.D.S. Key", "dress pants", "badge of authority", "giant motorcycle boots", "stolen necklace", "troll britches", "vial of The Glistening", "artisanal limoncello", "creepy ginger ale", "incredible pizza", "oil cap", "oil lamp", "oil slacks", "oil pan", "oily boid", "woim", "Thwaitgold praying mantis statuette", "BittyCar SoulCar", "Misty Cloak", "Misty Robe", "Misty Cape", "woimbook", "Taco Dan's Taco Stand Flier", "Taco Dan's Taco Stand Taco", "Taco Dan's Taco Stand Chimichangarita", "Taco Dan's Taco Stand Chillacious Churro", "psychoanalytic jar", "The Sword in the Steak", "Meatcleaver", "Crimbo Elf creepy bobble-head", "Crimbo stogie-scented room odorizer", "Crimbo bottomless hot cocoa mug", "Crimbo tree flocker", "Crimbo light-up Rudolph doll", "Super Crimboman Ultra Mega Hypersword", "sharp tin strip", "wad of spider silk", "goblin collarbone", "Truthsayer", "loose blade", "goblin bone hilt", "sticky sword blade", "Thinknerd's Grimoire of Geeky Gifts", "confusing LED clock", "haggis-infused soap", "magicberry tablets", "37x37x37 puzzle cube", "McLeod's Hard Haggis-Ade", "haggis-wrapped haggis-stuffed haggis", "home robotics kit", "old school calculator watch", "haggis socks", "airblaster gun", "Thinknerd T-shirt grab bag", "actual reality goggles", "Mr. Haggis", "magnetic sculpture kit", "Microplushie: Otakulone", "Microplushie: Hippylase", "Microplushie: Bropane", "Microplushie: Sororitrate", "Microplushie: Gothochondria", "Microplushie: Raverdrine", "Microplushie: Hobomosome", "Microplushie: Ermahgerdic Acid", "Microplushie: Dorkonide", "Microplushie: Fauxnerditide", "Microplushie: Hipsterine", "classy monkey", "fancy gourd potion", "Thinknerd T-Shirt", "pile of useless robot parts", "homemade robot", "homemade robot gear", "Artist's Whisk of Misery", "Artist's Butterknife of Regret", "Artist's Spatula of Despair", "Artist's Cookie Cutter of Loneliness", "Artist's Cr&egrave;me Brul&eacute;e Torch of Fury", "Ginsu&trade;", "bubble-wrap simulator (one broken button)", "bubble-wrap simulator (half broken)", "bubble-wrap simulator (one button left)", "zaibatsu lobby card", "zaibatsu level 1 card", "zaibatsu level 2 card", "zaibatsu level 3 card", "CEO office card", "test site key", "strange goggles", "brass abacus", "bonsai tree", "cheap Chinese beer", "lucky cat statue", "rhinoceros horn", "furry pink pillow", "bottle of limeade", "novelty tattoo sleeves", "pair of rhinoceros horns", "furry brown pillow", "makeshift yakuza mask", "gold piece", "toy taijijian", "magical battery", "White Dragon Fang", "butterfly knife", "tube of herbal ointment", "pencil kunai", "weighted paperclip chain", "great big capacitor", "rubber gloves", "Chinese curse words", "triad summoning scroll", "roasted duck", "dead meat bun", "lucky cat collar", "suspicious-looking fedora", "Sword of Procedural Generation", "Bodacious MechaElf Hunter Saga:Relay Wolf", "Deactivated MiniMechaElf", "MiniMechaElf Laser Punch Missile Launcher", "Snow Suit", "carrot nose", "carrot cake", "carrot claret", "carrot juice", "pixel power cell", "flickering pixel", "Byte", "anger blaster", "doubt cannon", "fear condenser", "regret hose", "Young Man's Crew Sequester", "Young Man's Cargo Load", "foam commodore's hat", "foam naval trousers", "miniature deck cannon", "ornamental sextant", "Bloodbath", "Hundred Headed IPA", "old chum", "crude crudit&eacute;s", "candy crayons", "pixel grappling hook", "GameInformPowerDailyPro magazine", "GameInformPowerDailyPro walkthru", "cosmic egg", "cosmic dough", "cosmic vegetable", "cosmic cheese", "cosmic potted meat product", "cosmic potato", "cosmic cream", "cosmic fruit", "Jarlsberg's hat", "consummate hard-boiled egg", "consummate fried egg", "consummate egg salad", "consummate bagel", "consummate sliced bread", "consummate hot dog bun", "consummate brownie", "consummate toast", "passable stout", "consummate soup", "consummate corn chips", "consummate salad", "consummate salsa", "consummate sauerkraut", "consummate cheese slice", "consummate melted cheese", "consummate bacon", "consummate meatloaf", "consummate steak", "consummate cold cuts", "consummate frankfurter", "consummate french fries", "consummate baked potato", "acceptable vodka", "consummate ice cream", "consummate whipped cream", "consummate sour cream", "consummate strawberries", "consummate sorbet", "adequate rum", "mediocre lager", "immaculate grilled cheese", "immaculate ice cream sandwich", "immaculate hot dog", "immaculate egg salad sandwich", "perfect sandwich", "perfect chef salad", "perfect breakfast", "sublime deluxe hot dog", "sublime stew", "sublime nachos", "Ultimate Breakfast Sandwich", "Loaded Baked Potato", "Omega Sundae", "Das Sauerlager", "Bologna Lambic", "Vodka Dog", "Disappointed Russian", "Chunky Mary", "Nachojito", "Le Roi", "Over Easy Rider", "cosmic six-pack", "the Jick-o-loser", "cube of ectoplasm", "Illuminati earpiece", "censored can label", "ectoplasm <i>au jus</i>", "the kindest cold cut", "lucky cat's paw", "ASCII fu manchu", "demonic surgical gloves", "cheap clip-on ninja tie", "gamer slurry", "dungeoneering kit", "numberwang", "scroll of Protection from Bad Stuff", "scroll of Puddingskin", "Spellbook: Walberg's Dim Bulb", "Spellbook: Singer's Faithful Ocelot", "Spellbook: Drescher's Annoying Noise", "dried gelatinous cube", "pile of dungeon junk", "Staff of the Healthy Breakfast", "Staff of the Staff of Life", "Staff of the Light Lunch", "Staff of the Standalone Cheese", "Staff of the Hearty Dinner", "Staff of the All-Steak", "Staff of Fruit Salad", "Staff of the Cream of the Cream", "giant jar of protein powder", "giant grain of protein powder", "pec oil", "giant gym membership card", "Squat-Thrust Magazine", "massive dumbbell", "giant penguin keychain", "O'RLY manual", "open sauce", "giant turkey leg", "Ye Olde Meade", "Ye Olde Bawdy Limerick", "Ye Olde Medieval Insult", "pewter claymore", "giant artisanal rice peeler", "giant heirloom grape tomato", "chipotle wasabi cilantro aioli", "brown felt tophat", "brass gear", "Mark I Steam-Hat", "Mark II Steam-Hat", "Mark III Steam-Hat", "Mark IV Steam-Hat", "Mark V Steam-Hat", "steam-powered model rocketship", "punk rock jacket", "giant safety pin", "stolen sushi", "very overdue library book", "drum 'n' bass 'n' drum 'n' bass record", "cosmic bucket", "fragment of Jarlsberg's soul", "Thwaitgold firefly statuette", "model airship", "Super Weight-Gain 9000", "possibility potion", "eleven-foot pole", "ring of Detect Boring Doors", "Jarlsberg's pan (Cosmic portal mode)", "Jarlsberg's pan", "Cosmic Calorie", "celestial olive oil", "celestial carrot juice", "celestial au jus", "celestial squid ink", "Uncle Buck", "crate of fish meat", "damp old wallet", "fishy pipe", "old SCUBA tank", "deep six-shooter", "sea chaps", "sea holster", "shavin' razor", "long-forgotten necklace", "giant pearl", "sea lace", "jam band", "aquamariner's ring", "aquamariner's necklace", "pearl diver's ring", "pearl diver's necklace", "sushi doily", "scimitar cozy", "fish stick cozy", "bazooka cozy", "cozy scimitar", "Staff of the Cozy Fish", "cozy bazooka", "sea mantle", "sea shawl", "sea cape", "saltwaterbed", "muddy pirate hat", "floral-print skirt", "spectral axe", "super-strong air freshener", "Mer-kin lipstick", "Mer-kin mouthsoap", "Mer-kin strongjuice", "Mer-kin fitbrine", "Mer-kin ragejuice", "Mer-kin dragbelt", "Mer-kin eyeglasses", "Mer-kin gutgirdle", "Mer-kin finpaddle", "Mer-kin stopwatch", "Mer-kin dreadscroll", "Mer-kin smartjuice", "Mer-kin cooljuice", "Mer-kin worktea", "Mer-kin knucklebone", "Mer-kin darkbook", "Mer-kin begsign", "Libram of Pulled Taffy", "pulled yellow taffy", "pulled indigo taffy", "pulled green taffy", "pulled blue taffy", "pulled orange taffy", "pulled violet taffy", "pulled red taffy", "Mer-kin hallpass", "lump of clay", "twisted piece of wire", "can of the cheapest beer", "bottle of fruity &quot;wine&quot;", "single swig of vodka", "angry inch", "testy toolbox", "Jick-o-User", "eraser nubbin", "chlorine crystal", "ph balancer", "mysterious chemical residue", "nugget of sodium", "root beer", "jigsaw blade", "wood screw", "balsa plank", "blob of wood glue", "envyfish egg", "Mer-kin rocksalt", "Mer-kin saltmint", "Mer-kin saltsquid", "scale-mail underwear", "comb jelly", "anemone sauce", "inky squid sauce", "Mer-kin weaksauce", "peanut sauce", "black glass", "Boss Drops", "Mer-kin lunchbox", "black tear", "jagged tooth", "grisly shell fragment", "violent pastilles", "worst candy", "fudge-shaped hole in space-time", "Pocket Square of Loathing", "corrupted stardust", "Star Spawn", "cute bow from beyond the stars", "KoLHS Pep Squad Box", "shaking skull", "Order of the Green Thumb Order Form", "clutch of dodecapede eggs", "flavorless gruel", "mana curds", "twist of lime", "pencil stub", "giant giant moth dust", "glob of spoiled mayo", "tonic djinn", "vampire chowder", "Tales of Dread", "Dreadsylvanian skeleton key", "Official Seal of Dreadsylvania", "Dreadsylvanian stew", "white Dreadsylvanian", "brass Dreadsylvanian flask", "silver Dreadsylvanian flask", "dreadful fedora", "dreadful sweater", "dreadful glove", "Freddy Kruegerand", "Mark of the Bugbear", "Mark of the Werewolf", "Mark of the Zombie", "Mark of the Ghost", "Mark of the Vampire", "Mark of the Skeleton", "Covers-Your-Head", "Drapes-You-Regally", "Warms-Your-Tush", "Helps-You-Sleep", "Quiets-Your-Steps", "Protects-Your-Junk", "Gets-You-Drunk", "Great Wolf's headband", "Great Wolf's left paw", "Great Wolf's right paw", "Great Wolf's rocket launcher", "Great Wolf's beastly trousers", "Great Wolf's lice", "Hunger&trade; Sauce", "zombie mariachi hat", "zombie accordion", "zombie mariachi pants", "HOA regulation book", "HOA zombie eyes", "HOA citation pad", "wriggling severed nose", "nosy nose ringy ring", "Mayor Ghost's toupee", "Mayor Ghost's cloak", "Mayor Ghost's khakis", "Mayor Ghost's gavel", "Mayor Ghost's sash", "Mayor Ghost's scissors", "ghost pepper", "Thunkula's drinking cap", "Drunkula's cape", "Drunkula's silky pants", "Drunkula's bell", "Drunkula's ring of haze", "Drunkula's wineglass", "bottle of Bloodweiser", "Unkillable Skeleton's skullcap", "Unkillable Skeleton's breastplate", "Unkillable Skeleton's shinguards", "Unkillable Skeleton's sawsword", "Unkillable Skeleton's shield", "Unkillable Skeleton's restless leg", "Staff of the Roaring Hearth", "electric Kool-Aid", "dread tarragon", "bone flour", "dreadful roast", "stinking agaricus", "Dreadsylvanian shepherd's pie", "intricate music box parts", "unwound mechanical songbird", "shiny brass tailfeathers", "wax banana", "complicated lock impression", "replica key", "Dreadsylvania Auditor's badge", "blood kiwi", "eau de mort", "bloody kiwitini", "moon-amber", "polished moon-amber", "moon-amber necklace", "Dreadsylvanian seed pod", "ghost pencil", "hangman's hood", "cursed ring finger ring", "Dreadsylvanian clockwork key", "cool iron ingot", "cool iron helmet", "cool iron breastplate", "cool iron greaves", "ghost shawl", "skull capacitor", "warm fur", "snowstick", "eerie fetish", "stinkwater", "dubious loincloth", "accidental mutton", "drafty drawers", "wolfskull mask", "guts necklace", "groping claw", "vengeful spirit", "BOOtonniere", "ghost thread", "bag of unfinished business", "transparent pants", "hothammer", "Thriller Ice", "grandfather watch", "muddy skirt", "antique spyglass", "vial of hot blood", "remorseless knife", "intimidating coiffure", "cod cape", "blood sausage", "frying brainpan", "old ball and chain", "old dry bone", "tailbone shield", "tonguebone", "pogo stick", "weedy skirt", "big pants", "Thwaitgold Goliath beetle statuette", "cooling iron helmet", "cooling iron breastplate", "cooling iron greaves", "hot cluster", "cold cluster", "spooky cluster", "stench cluster", "sleaze cluster", "phial of hotness", "phial of coldness", "phial of spookiness", "phial of stench", "phial of sleaziness", "adventurer clone egg", "mini-Mr. Accessory", "hand of Mr. Cards", "Dreadsylvanian hot pocket", "Dreadsylvanian cold pocket", "Dreadsylvanian spooky pocket", "Dreadsylvanian stink pocket", "Dreadsylvanian sleaze pocket", "Dreadsylvanian hot toddy", "Dreadsylvanian cold-fashioned", "Dreadsylvanian grimlet", "Dreadsylvanian dank and stormy", "Dreadsylvanian slithery nipple", "hot clusterbomb", "cold clusterbomb", "spooky clusterbomb", "stench clusterbomb", "sleaze clusterbomb", "Dreadsylvanian Almanac page", "length of old fuse", "dreadful box", "Clan hot dog stand", "vicious spiked collar", "ancient hot dog wrapper", "debonair deboner", "chicle de salchicha", "jar of frostigkraut", "gnawed-up dog bone", "Grey Guanon", "Engorged Sausages and You", "dream of a dog", "optimal spreadsheet", "defective Game Grid token", "hot Dreadsylvanian cocoa", "epic cluster", "intricate clockwork egg", "intricate clockwork birdhouse", "intricate clockwork disc", "intricate clockwork big hand", "intricate clockwork little hand", "intricate clockwork numeral I", "intricate clockwork numeral II", "intricate clockwork numeral III", "intricate clockwork numeral IV", "intricate clockwork numeral V", "intricate clockwork numeral VI", "intricate clockwork numeral VII", "intricate clockwork numeral VIII", "intricate clockwork numeral IX", "intricate clockwork numeral X", "intricate clockwork numeral XI", "intricate clockwork numeral XII", "intricate clockwork cuckoo", "cuckoo clock", "Cold One", "spaghetti breakfast", "over-the-shoulder Folder Holder", "folder (red)", "folder (blue)", "folder (green)", "folder (magenta)", "folder (cyan)", "folder (yellow)", "folder (smiley face)", "folder (wizard)", "folder (space skeleton)", "folder (D-Team)", "folder (Ex-Files)", "folder (skull and crossbones)", "folder (Knight Writer)", "folder (Jackass Plumber)", "folder (holographic fractal)", "folder (barbarian)", "folder (rainbow unicorn)", "folder (Seawolf)", "folder (dancing dolphins)", "folder (catfish)", "folder (tranquil landscape)", "folder (owl)", "folder (Stinky Trash Kid)", "folder (sports car)", "folder (sportsballs)", "folder (heavy metal)", "folder (Yedi)", "folder (KOLHS)", "slide rule", "Ogres and Oubliettes&trade; module", "Mountain Stream Code Black Alert", "twisted-up wet towel", "stepmom's booze", "surgical tape", "metal band T-shirt", "fountain 'soda'", "illegal firecracker", "pickelhaube", "hair oil", "scrap metal", "school spirit socket set", "miniature suspension bridge", "Staff of the Lunch Lady", "universal key", "world's most dangerous birdhouse", "deathchucks", "giant eraser", "quasireligious sculpture", "giant Faraday cage", "modeling claymore", "sticky clay homunculus", "sodium pentasomething", "grains of salt", "yellowcake bomb", "dirty stinkbomb", "superwater", "Thwaitgold bookworm statuette", "crude monster sculpture", "Yearbook Club Camera", "antique machete", "Cursed Punch", "Bowl of Scorpions", "Fog Murderer", "book of matches", "surgical mask", "head mirror", "half-size scalpel", "surgical apron", "bloodied surgical dungarees", "McClusky file (page 1)", "McClusky file (page 2)", "McClusky file (page 3)", "McClusky file (page 4)", "McClusky file (page 5)", "boring binder clip", "McClusky file (complete)", "bowling ball", "moss-covered stone sphere", "dripping stone sphere", "crackling stone sphere", "scorched stone sphere", "stone triangle", "tiny bowler", "imitation White Russian", "short-handled mop", "jungle floor wax", "smirking shrunken head", "colorful toad", "crude voodoo doll", "attorney's badge", "pygmy briefs", "short writ of habeas corpus", "bone abacus", "adder", "short calculator", "sphygmomanometer", "bag of pygmy blood", "tongue depressor", "compression stocking", "midriff scrubs", "pill cup", "cold water bottle", "pygmy phone number", "gold Boozehounds Anonymous token", "exotic jungle fruit", "Shore Inc. Ship Trip Scrip", "dude ranch souvenir crate", "tropical island souvenir crate", "ski resort souvenir crate", "UV-resistant compass", "funky junk key", "Worse Homes and Gardens", "old claw-foot bathtub", "old clothesline pole", "antique cigar sign", "junk junk", "Junk-Bond", "tangle of copper wire", "jagged scrap metal", "bent scrap metal", "molten scrap metal", "eternal car battery", "junk band", "junk trunks", "junk-mail shirt", "junk food", "junk yard", "swordzall", "arm buzzer", "boilgun", "Gordon Beer's Beer Garden Catalog", "packet of beer seeds", "handful of barley", "cluster of hops", "fancy beer bottle", "fancy beer label", "artisanal homebrew sampler", "can of Br&uuml;talbr&auml;u", "can of Drooling Monk", "can of Impetuous Scofflaw", "bottle of Old Pugilist", "bottle of Professor Beer", "bottle of Rapier Witbier", "bottle of Race Car Red", "bottle of Greedy Dog", "bottle of Lambada Lambic", "fancy tin beer can", "artisanal homebrew gift package", "liquid bread", "tin tam", "tin cup", "tin foil", "tin drum", "tin roof (rusted)", "tin snips", "tin lizzie", "foetid seal tear", "cold seal sweat", "boiling seal blood", "crystalline seal eye", "studded sealhide shield", "scabrous seal epaulets", "abyssal battle plans", "seal medal", "deanimated reanimator's coffin", "flask of embalming fluid", "blank diary", "boot knife", "broken beer bottle", "sharpened spoon", "candy knife", "soap knife", "disco horoscope (Aquarius)", "disco horoscope (Pisces)", "disco horoscope (Aries)", "disco horoscope (Taurus)", "disco horoscope (Gemini)", "disco horoscope (Cancer)", "disco horoscope (Leo)", "disco horoscope (Virgo)", "disco horoscope (Libra)", "disco horoscope (Scorpio)", "disco horoscope (Sagittarius)", "disco horoscope (Capricorn)", "The Sagittarian's leisure pants", "toy accordion", "antique accordion", "beer-battered accordion", "baritone accordion", "mama's squeezebox", "guancertina", "accordion file", "accord ion", "bone bandoneon", "pentatonic accordion", "non-Euclidean non-accordion", "Accordion of Jordion", "autocalliope", "accordionoid rocca", "pygmy concertinette", "ghost accordion", "peace accordion", "alarm accordion", "All-Hallow's Steve's fright wig", "KoL Con X Treasure Map", "discocktail", "KoL Con X Bingo Card", "Temporal Tempera Tube", "Tallowcreme Halloween Pumpkin", "Way More Tears&trade; pepper spray", "Milk Studs", "box of Dweebs", "bag of W&Ws", "PEEZ dispenser", "Swizzler", "Bugbearclaw Donut", "little red jam", "Whenchamacallit bar", "8-bit banana", "vial of blood simple syrup", "bone bons", "ironic mint", "unused walkie-talkie", "walkie-talkie", "killing jar", "security flashlight", "Effermint&trade; tablets", "sturdy cane", "huge bowl of candy", "Ultra Mega Sour Ball", "carton of rotten eggs", "desert sightseeing pamphlet", "a suspicious address", "Bal-musette accordion", "Cajun accordion", "quirky accordion", "Skipper's accordion", "Pantsgiving", "can of sardines", "high-calorie sugar substitute", "pat of butter", "dinner roll", "cold mashed potatoes", "whole turkey leg", "deviled egg", "finger exerciser", "dented spoon", "old love note", "old school beer pull tab", "nail file", "old candy wrapper", "gym membership card", "post-holiday sale coupon", "dry cleaning receipt", "pocket lint (blue)", "pocket lint (green)", "pocket lint (white)", "pocket lint (orange)", "bowl of petunias", "power sock", "wool sock", "moustache sock", "spirit gum", "spirit pillow", "spirit sheet", "spirit mattress", "spirit blanket", "spirit bed", "spirit bell", "spoonful of Linguine-Os", "freezer-burned frost-bitten tortellini", "blob of Alphredo&trade;", "handful of crafty noodles", "tangled mass of creepy pasta", "Can of Spaghetto", "Chef Boy, R&D's business card", "Thwaitgold ant statuette", "experimental carbon fiber pasta additive", "hazardous sauce dosimeter", "flask flops", "candied nuts", "candied bolts", "gingerbread robot", "petit 4.1", "nut-shaped Crimbo cookie", "tiny plastic GORM-8", "tiny plastic warbear", "tiny plastic Toybot", "tiny plastic warbear fortress", "tiny plastic K.R.A.M.P.U.S.", "warbear whosit", "warbear hoverbelt piecepart", "warbear hoverbelt", "warbear battery", "warbear badge", "warbear wardance potion", "warbear bearserker potion", "warbear liquid overcoat", "warbear feasting bread", "warbear warrior bread", "warbear thermoregulator bread", "warbear feasting mead", "warbear bearserker mead", "warbear blizzard mead", "warbear helm fragment", "warbear plain fedora", "warbear feathered fedora", "warbear fancy fedora", "warbear plain helm", "warbear spiked helm", "warbear electro-spiked helm", "warbear plain ushanka", "warbear lined ushanka", "warbear heated ushanka", "warbear trouser fragment", "warbear party pants", "warbear ceremonial party pants", "warbear high festival pants", "warbear battle greaves", "warbear officer greaves", "warbear bearserker greaves", "warbear long johns", "warbear fleece-lined long johns", "warbear electric long johns", "warbear accoutrements chunk", "warbear goggles", "warbear snowblindness goggles", "warbear polarized goggles", "warbear laser bowtie", "warbear plasma bowtie", "warbear nuclear bowtie", "warbear warscarf", "warbear fleece-lined warscarf", "warbear electric warscarf", "warbear requisition box", "warbear exo-arm", "warbear foil hat", "warbear energy bracers", "warbear oil pan", "warbear laser beacon", "warbear exhaust manifold", "warbear jackhammer drill press", "warbear auto-anvil", "warbear induction oven", "warbear chemistry lab", "warbear officer requisition box", "warbear empathy chip", "warbear drone assembler", "warbear breakfast machine assembler", "blind-packed die-cast metal toy", "tiny die-cast Bashful the Reindeer", "tiny die-cast Doc the Reindeer", "tiny die-cast Dopey the Reindeer", "tiny die-cast Grumpy the Reindeer", "tiny die-cast Happy the Reindeer", "tiny die-cast Sleepy the Reindeer", "tiny die-cast Sneezy the Reindeer", "tiny die-cast Zeppo the Reindeer", "tiny die-cast factory worker elf", "tiny die-cast gift-wrapping elf", "tiny die-cast middle-management elf", "tiny die-cast pencil-pusher elf", "tiny die-cast stocking-stuffer elf", "tiny die-cast Unionize the Elves Sign", "tiny die-cast CrimboTown Toy Factory", "tiny die-cast death ray in a pear tree", "tiny die-cast turtle mech", "tiny die-cast Swiss hen", "tiny die-cast killing bird", "tiny die-cast golden ring", "tiny die-cast goose a-laying", "tiny die-cast swarm a-swarming", "tiny die-cast blade a-spinning", "tiny die-cast arc-welding Elfborg", "tiny die-cast ribbon-cutting Elfborg", "tiny die-cast Rudolphus of Crimborg", "tiny die-cast Father Crimborg", "tiny die-cast Don Crimbo", "tiny die-cast Uncle Hobo", "tiny die-cast Father Crimbo", "The Smith's Tome", "Flaskfull of Hollow", "lump of Brituminous coal", "handful of Smithereens", "Every Day is Like This Sundae", "Miserable Pie", "This Charming Flan", "Irish Coffee, English Heart", "Strikes Again Bigmouth", "Paint A Vulgar Pitcher", "Golden Light", "Louder Than Bomb", "Handsome Devil", "Work is a Four Letter Sword", "Staff of the Headmaster's Victuals", "Sheila Take a Crossbow", "A Light that Never Goes Out", "Half a Purse", "Hairpiece On Fire", "Vicar's Tutu", "Hand in Glove", "Meat Tenderizer is Murder", "Ouija Board, Ouija Board", "Hand that Rocks the Ladle", "Saucepanic", "Frankly Mr. Shank", "Shakespeare's Sister's Accordion", "third-hand lantern", "loose purse strings", "pickled egg", "cup of lukewarm tea", "warbear soda machine assembler", "warbear black box", "warbear high-efficiency still", "warbear LP-ROM burner", "warbear gyrocopter", "warbear robo-camouflage unit", "warbear beeping telegram", "warbear procedural hilarity drone", "warbear metalworking primer", "warbear sequential gaiety distribution system", "glass slipper", "antimatter wad", "warbear superpotion", "warbear liquid lasers", "warbear rejuvenation potion", "broken warbear gyrocopter", "warbear gyro", "recording of Rolando's Rondo of Resisto", "warbear metalworking primer (used)", "warbear empathy chip (used)", "warbear drone codes", "breakfast mess", "warbear breakfast machine", "breakfast miracle", "Cloaca Cola Polar", "warbear soda machine", "festive warbear bank", "grimstone mask", "praying Grim Brother", "Grim Brothers' story book", "hibernating Grimstone Golem", "grim fairy tale", "grimstone galoshes", "single of Inigo's Incantation of Inspiration", "single of Donho's Bubbly Ballad", "Discontent&trade; Winter Garden Catalog", "packet of winter seeds", "snow berries", "ice harvest", "frost flower", "snow cleats", "liquid ice pack", "snow boards", "snow crab", "Ice Island Long Tea", "unfinished ice sculpture", "ice sculpture", "ice house", "snow machine", "snow mobile", "ice bucket", "snow shovel", "bod-ice", "snow belt", "ice nine", "snow fort", "En Una Fila Tequila", "Skully's hot chocolate", "warbear dress helmet", "warbear dress bracers", "warbear dress greaves", "sweatband", "gym shorts", "ankleweights", "sweat socks", "pint of sweat", "Jerks' Health&trade; Magazine", "Five Second Energy&trade;", "pixie axie", "sour powder", "licorice whip", "anise-flavored venom", "snakebite", "candy stick", "candied pecan", "pecan pie", "chocolate-stained collar", "candy mountain oyster", "chocotini", "chocolate rabbit's foot", "candy carrot", "candy carrot cake", "carrot-on-a-stick", "weasel stomping pants", "mulberry", "mulled berry wine", "lemony scales", "lemon party hat", "lemon shirt", "lemon drop trousers", "lemonhead caviar", "gummi sword", "small gummi fin", "chocolate cow bone", "gummi fang", "leftover canap&eacute;s", "magnum of fancy champagne", "silver cow creamer", "Outer Wolf&trade; cologne", "lupine appetite hormones", "wolf whistle", "witch's bread", "witch's brew", "witch's bra", "mid-level medieval mead", "R&uuml;mpelstiltz", "spinning wheel", "hi-octane carrot juice", "hare brush", "hare pin", "odd silver coin", "cinnamon cannoli", "expensive champagne", "polo trophy", "fancy oil painting", "solid gold rosary", "ornate dowsing rod", "straw", "leather", "clay", "filling", "parchment", "glass", "fire hose", "fireman's lunch", "plain paper hat", "ice cream sandwich", "&quot;honey&quot; dipper", "plumber's lunch", "skull gearshift knob", "nachos of the night", "Sketcherz&trade;", "can of Adultwitch&trade;", "smudge stick", "portable wall", "large tankard of ale", "scroll case", "jug of &quot;wine&quot;", "juggling ball", "crappy camera", "humble pie", "small golem", "shaking crappy camera", "crappy waiter disguise", "Copperhead Charm", "The First Pizza", "The Lacrosse Stick of Lacoronado", "The Eye of the Stars", "The Stankara Stone", "Murphy's Rancid Black Flag", "The Shield of Brook", "Red Zeppelin ticket", "Copperhead Charm (rampant)", "unnamed cocktail", "handful of tips", "unrequired jacket", "tommy gun", "drum of tommy ammo", "throwing knife", "throwing spoon", "throwing fork", "breadchucks", "shuriken salad", "combat fan", "red silk skirt", "blowdart", "Buddy Bjorn", "The Nuge's favorite crossbow", "sweet roll Alabama", "Saturday Night Special", "lynyrd snare", "fleetwood chain", "Green Manalishi", "black blade", "fire of unknown origin", "eagle's milk", "eagle feather", "one pill", "Jefferson wings", "fleetwood macaroni", "cheesy eagle sauce", "fleetwood mac 'n' cheese", "lynyrd skin", "lynyrdskin cap", "lynyrdskin tunic", "lynyrdskin breeches", "cigarette lighter", "priceless diamond", "Flamin' Whatshisname", "lynyrd musk", "Kashmir sweater", "custard pie", "tea for one", "bottle of Evermore", "red box", "red red wine", "red rum", "Murderer's Punch", "red velvet cake", "red letter", "red book", "red masque", "red-hot poker", "Red X Shield", "red badge", "red shirt", "red coat", "red shoe", "big red button", "red button", "red blood cells", "red eye", "glark cable", "Red Fox glove", "red foxglove", "Thwaitgold dragonfly statuette", "Sneaky Pete's leather jacket", "jug of Sneaky Pete's Mojo", "shot of Sneaky Pete's Mojo", "Anniversary Miniature Sword & Martini Guy", "really tiny cocktail shaker", "mini-martini", "smoke grenade", "molotov soda", "pile of ashes", "crate of firebombs", "firebomb", "Sneaky Pete's basket", "[7262]&quot;I Love Me, Vol. I&quot;", "photograph of a dog", "photograph of a red nugget", "photograph of an ostrich egg", "disposable instant camera", "Sneaky Pete's leather jacket (collar popped)", "Letter for Melvign the Gnome", "Professor What garment", "&quot;2 Love Me, Vol. 2&quot;", "Thinknerd Blind-Packed Toy", "tiny plastic Professor What", "tiny plastic Jared the Duskwalker", "tiny plastic Duke Starkiller", "tiny plastic Gary Claybender", "tiny plastic Captain Kerkard", "robot grease", "returned Thinknerd package", "wind-up Whatsian robot", "wind-up vampire teeth", "wind-up navigation droid", "wind-up owl", "wind-up ensign", "crying statue earrings", "plastic Duskwalker necklace", "plastic replica blaster pistol", "Gary Claybender's Time Screwer", "Space Tourist palmdoctor", "amok putter", "amok pudding", "deactivated putty buddy", "putty coat", "can of V-11", "elevennis shoes", "elevent", "elevenderizing hammer", "Professor What T-Shirt", "heavy-duty bendy straw", "pellet of plant food", "sewing kit", "Spookyraven billiards room key", "[7302]Spookyraven library key", "Lady Spookyraven's necklace", "telegram from Lady Spookyraven", "Lady Spookyraven's powder puff", "Lady Spookyraven's finest gown", "Lady Spookyraven's dancing shoes", "old eyebrow pencil", "old rosewater cream", "old bronzer", "elegant nightstick", "still grill", "box of hickory chips", "dusty poppet", "rickety rocking horse", "antique jack-in-the-box", "jar of baby ghosts", "ghost of a necklace", "Elizabeth's Dollie", "Elizabeth's paintbrush", "Stephen's lab coat", "Stephen's secret formula", "Jacob's rung", "haunted battery", "electric snakebite", "rubber ribcage", "synthetic marrow", "funny bone", "half-melted spoon", "the funk", "gunky chicken", "creepy doll head", "droopy doll eye", "creepy voice box", "haunted paddle-ball", "spooky sound effects record", "spooky alphabet block", "tiny dancer", "spooky music box mechanism", "moose antlers", "moose thought", "moose chocolate", "painting of a glass of wine", "ancient oil painting of yourself", "ornate picture frame", "doll-eye amulet", "ghost toga", "sheet cake", "ghost key", "picture of you", "Staff of the Electric Range", "deluxe layer cake", "chunk of hot iron", "red-hot boilermaker", "coal shovel", "hot coal", "coal dust", "Bram's choker", "plaid swatch", "plaid bandage", "plaid pocket square", "plaid skirt", "bloodstain stick", "fabric softener", "fabric hardener", "bottle of laundry sherry", "industrial strength starch", "extra-flat panini", "mangled finger", "Psychotic Train wine", "crazy hobo notebook", "pie man was not meant to eat", "sommelier's towel", "tarnished tastevin", "actual tapas", "ghast iron ingot", "ghast iron cleaver", "ghast iron Garibaldi", "ghast iron heater shield", "ghast iron codpiece", "Pendant of Gargalesis", "Little Geneticist DNA-Splicing Lab", "DNA extraction syringe", "Gene Tonic: Dude", "Gene Tonic: Beast", "Gene Tonic: Construct", "Gene Tonic: Undead", "Gene Tonic: Humanoid", "Gene Tonic: Insect", "Gene Tonic: Hippy", "Gene Tonic: Orc", "Gene Tonic: Demon", "Gene Tonic: Horror", "Gene Tonic: Fish", "Gene Tonic: Goblin", "Gene Tonic: Pirate", "Gene Tonic: Plant", "Gene Tonic: Weird", "Gene Tonic: Elf", "Gene Tonic: Mer-kin", "Gene Tonic: Slime", "Gene Tonic: Penguin", "Gene Tonic: Elemental", "Gene Tonic: Constellation", "Gene Tonic: Hobo", "Steam Card: Dungeon Fist (#1)", "Steam Card: Dungeon Fist (#2)", "Steam Card: Dungeon Fist (#3)", "Steam Card: Space Trip (#1)", "Steam Card: Space Trip (#2)", "Steam Card: Space Trip (#3)", "Steam Card: Meteoid (#1)", "Steam Card: Meteoid (#2)", "Steam Card: Meteoid (#3)", "Steam Card: DemonStar (#1)", "Steam Card: DemonStar (#2)", "Steam Card: DemonStar (#3)", "Steam Card: Jackass Plumber (#1)", "Steam Card: Jackass Plumber (#2)", "Steam Card: Jackass Plumber (#3)", "pencil thin mushroom", "Paradaisical Cheeseburger recipe", "salty sailor salt", "bike rental broupon", "Taco Dan's Taco Stand Cocktail Sauce Bottle", "sprinkle shaker", "sleight-of-hand mushroom", "Taco Dan's Taco Stand's Taco Receipt", "Beach Buck", "Fun-Guy spore", "Boletus Broletus mushroom", "Omphalotus Omphaloskepsis mushroom", "Gyromitra Dynomita mushroom", "Helvella Haemophilia mushroom", "Stemonitis Staticus mushroom", "Tremella Tarantella mushroom", "Pastaco shell", "Beefy Crunch Pastaco", "Brain Food Pastaco", "Cool Brunch Pastaco", "Medical Pastaco", "Energy Buzz Pastaco", "Ludovico Pastaco", "overpowering mushroom wine", "complex mushroom wine", "smooth mushroom wine", "blood-red mushroom wine", "buzzing mushroom wine", "swirling mushroom wine", "Taco Dan's Basic Taco Dan Taco", "Taco Dan's Taco Fish Fish Taco", "Taco Dan's Super Taco-Riffic Taco Sauce!", "regular-size brogurt", "super-size brogurt", "broberry brogurt", "brocolate brogurt", "French bronilla brogurt", "History's Most Offensive Jokes, Vol. IX", "Now You're Cooking With Grease", "Sloppy Seconds Diner Employee Handbook", "industrial strength anti-fungal spray", "Brogre brorts", "Brogre brolo shirt", "Brogre bucket hat", "Spring Break Beach tattoo coupon", "airplane charter: Spring Break Beach", "one-day ticket to Spring Break Beach", "8-billed baseball cap", "extremely wet T-shirt", "giant shrimp fork", "BROS Energy Drink", "go-go potion", "shrimp cocktail", "Yolo&trade; chocolates", "string of moist beads", "Ultimate Mind Destroyer", "Meat-inflating powder", "possessed sugar cube", "sugar fairy", "sugar bunny", "sweet tooth", "Rompedores de Fantasmas", "La Fantasma y La Oscuridad", "Fantasma en la M&aacute;quina", "loosening powder", "powdered castoreum", "drain dissolver", "triple-distilled turpentine", "detartrated anhydrous sublicalc", "triatomaceous dust", "bottle of Chateau de Vinegar", "blasting soda", "unstable fulminate", "wine bomb", "recipe: mortar-dissolving solution", "bottled day", "ghost formula", "Thwaitgold wheel bug statuette", "Hot 'n' Scarys", "black map", "black gold", "Texas tea", "dark hamethyst ring", "dark baconstone ring", "dark porquoise ring", "little black book", "black cloak", "black label", "Mornington crescent roll", "black eye shadow", "crumbling wooden wheel", "poppy", "opium grenade", "duonoculars", "plastic rock", "witch's spare house key", "giant spider leg", "wand of pigification", "glass of bourbon", "burned government manual fragment", "government cheese", "pair of government shades", "space junk", "government", "alien drugs", "weird space book", "alien force field disruptor bean", "government-issued night-vision goggles", "loaf of alien bread", "grilled cheese sandwich", "alien protein powder", "rocket fuel", "alien source code printout", "alien source code printout (used)", "stealth bomber", "space beast fur", "twitching space egg", "ramekin of space nuts", "space beast fur hat", "space beast fur pants", "space beast fur whip", "space invader", "space heater", "space bar", "space port", "space needle", "buffed alien drugs", "hot ashes", "ash soda", "liquid smoke", "dollop of barbecue sauce", "bowl of marinade", "shaker of dry rub", "bottle of lighter fluid", "white page", "white elephant gift", "white blood cells", "white wine", "gummi turtle", "turtle-shaped rock", "giraffe-necked turtle", "musk turtle", "programmable turtle", "mocking turtle", "ham steak", "time-twitching toolbelt", "Chroner", "Time Lord Badge of Honor", "Time Bandit Badge of Courage", "Friendliness Beverage", "silent pea shooter", "D roll", "kiwi beak", "New Zealand iced tea", "droll monocle", "future drug: Muscularactum", "future drug: Smartinex", "future drug: Coolscaline", "twitching time capsule", "liquid shifting time weirdness", "solid shifting time weirdness", "rack of dinosaur ribs", "scotch on the rocks", "yabba dabba doo rag", "wooly loincloth", "strange helix fossil", "S.S. Ticket", "Clan speakeasy", "glass of &quot;milk&quot;", "cup of &quot;tea&quot;", "thermos of &quot;whiskey&quot;", "Lucky Lindy", "Bee's Knees", "Sockdollager", "Ish Kabibble", "Hot Socks", "Phonus Balonus", "Flivver", "Sloppy Jalopy", "haunted flame", "temporary yak tattoo", "Fitspiration&trade; poster", "giant neckbeard", "artisanal hand-squeezed wheatgrass juice", "punk patch", "steampunk potion", "vial of swamp vapors", "turtle mud", "Redeye&trade; Eyedrops", "Dweebisol&trade; inhaler", "Lewd Lemmy Hair Oil", "tomato soup poster", "bubblin' chemistry solution", "voodoo glowskull", "pygmy adder oil", "pygmy witchhazel", "short deposition", "straw pole", "electric copperhead potion", "ninja fear powder", "ninja eyeblack", "button rouge", "Red Army camouflage kit", "lynyrd skinner toothblack", "flask of rainwater", "blue oyster badge", "plastic Jefferson wings", "dancing fan", "page of the Necrohobocon", "black magic powder", "black friar's tonsure", "government-issue identification badge", "alien hologram projector", "irradiated turtle", "cigar box turtle", "shellacked shell", "pillow shell", "whatsit-covered turtle shell", "oil shell", "frozen turtle shell", "shocked shell", "ingot turtle", "heavy duty umbrella", "pool skimmer", "miniature life preserver", "lightning milk", "aquaconda brain", "thunder thigh", "gourmet gourami oil", "catfish whiskers", "freshwater fishbone", "fishbone catcher's mitt", "fishbone kneepads", "fishbone corset", "fishbone fins", "fishbone facemask", "fishbone belt", "fishbone bracers", "neoprene skullcap", "goblin water", "dumb mud", "Sogg-Os", "Lord Soggyraven's Slippers", "Ancient Protector Soda", "liquid ice", "Wet Russian", "filet of The Fish", "Thwaitgold spider statuette", "thunder down underwear", "famous blue raincoat", "lightning rod", "law-abiding citizen cane", "legitimate business on the beach", "hep waders", "jive turkey leg", "birdbone corset", "candy cigarette", "4-dimensional fez", "throwing candy", "super-absorbent tarp", "unquiet spirits", "banjo kazoo mount", "blue grass", "Time Lord Participation Mug", "Time Bandit Time Towel", "Caveman Dan's favorite rock", "dog ointment", "gumshoes", "flapper floppers", "sneakeasies", "plastic nunchaku", "sticky hand whip", "glow-in-the-dark necklace", "Groll doll", "cap gun", "portable cassette player", "chewable paper", "rubber spider", "&quot;KICK ME&quot; sign", "confiscated comic book", "confiscated cell phone", "confiscated love note", "LCD game: Food Eater", "LCD game: Garbage River", "LCD game: Burger Belt", "The Confiscator's Grimoire", "rubber nubbin", "rubber cape", "Thor's Pliers", "candy UFOs", "water wings for babies", "beautiful rainbow", "Strix stix", "vampire pellet", "non-aged vinegar", "unsanitized scalpel", "gladiator tunica", "Roman sadnals", "madius", "radiator heater shield", "salt wages", "centurion helmet", "Chroner cross", "pteruges", "Bruno's blessing of Mars", "Dennis's blessing of Minerva", "Burt's blessing of Bacchus", "Freddie's blessing of Mercury", "Chroner trigger", "Xi Receiver Unit", "transmission from planet Xi", "Black Bart's Booty", "Xiblaxian circuitry", "Xiblaxian polymer", "Xiblaxian alloy", "Xiblaxian crystal", "Xiblaxian holo-wrist-puter simcode", "Xiblaxian cache locator simcode", "Xiblaxian holo-training simcode", "Xiblaxian direct marketing simcode", "Xiblaxian holo-buddy simcode", "Xiblaxian encrypted political prisoner", "Xiblaxian holo-schematic: stealth cowl", "Xiblaxian holo-schematic: stealth trousers", "Xiblaxian holo-schematic: stealth vest", "Xiblaxian holo-schematic: ultraburrito", "Xiblaxian holo-schematic: space whiskey", "Xiblaxian holo-schematic: residence cube", "Xiblaxian holo-schematic: xeno-goggles", "Xiblaxian 5D printer", "Xiblaxian holo-bowtie", "Xiblaxian xeno-detection goggles", "Xiblaxian stealth cowl", "Xiblaxian stealth trousers", "Xiblaxian stealth vest", "Xiblaxian ultraburrito", "Xiblaxian space-whiskey", "Xiblaxian residence-cube", "They liver", "They liver popsicle", "holo-tank", "holo-bomber", "holo-platoon", "residual zeal", "Xiblaxian holo-wrist-puter", "defective Golden Mr. Accessory", "airplane charter: Conspiracy Island", "one-day ticket to Conspiracy Island", "Coinspiracy", "Personal Ventilation Unit", "the most dangerous bait", "&quot;meat&quot; stick", "transdermal smoke patch", "specialty ammo bandolier", "pair of plants", "Sasq&trade; watch", "smoker's cloak", "camouflage T-shirt", "experimental serum G-9", "heavy-duty clipboard", "battery-powered drill", "limp broccoli", "giant yellow hat", "monkey barf", "delicious candy", "jangly bracelet", "cuddly teddy bear", "ice-cold Cloaca Zero", "first-aid pouch", "khaki duffel bag", "airborne mutagen", "SHAWARMA Initiative Keycard", "bottle-opener keycard", "Armory keycard", "initiative shawarma", "warm war shawarma", "karma shawarma", "Jungle Juice", "Amnesiac Ale", "Highest Bitter", "mercenary pistol", "mercenary rifle", "Merc Core Field Manual: Sanity Maintenance", "Merc Core Field Manual: Intimidation Techniques", "Merc Core challenge coin", "Merc Core deployment orders", "TI-9000 calculator", "unused soap", "impure gasoline", "Z-Bone steak", "viral DNA", "tarnished bottlecap", "seared dino steak", "bottle of drinkin' gas", "handful of napalm", "dove DNA", "gelatinous meat mass", "99.44% pure math", "simple AI", "corrupted bird DNA", "sentient meat mass", "zombie dinosaur egg", "french-fry grabber", "iShield", "white earbuds", "iFlail", "unidentifiable dried fruit", "flat cider", "trench lighter", "experimental serum P-00", "military-grade fingernail clippers", "encrypted micro-cassette recorder", "gore bucket", "pack of smokes", "ESP suppression collar", "GPS-tracking wristwatch", "Project T. L. B.", "Agent Mauve", "special clip: tracers", "special clip: wailers", "special clip: squelchers", "special clip: splatterers", "special clip: boneburners", "special clip: graveburpers", "perl necklace", "Fudge Fiber Armor Plating", "ruby on canes", "petit fortran", "java cookie", "cookie cookie", "tiny plastic exo-suited miner", "tiny plastic semi-autonomous drill unit", "tiny plastic ambulatory robo-minecart", "tiny plastic Crimbot", "tiny plastic Crimbomega", "flask of mining oil", "radiation-resistant helmet", "servo-assisted exo-pants", "high-energy mining laser", "peppermint tailings", "nugget of Crimbonium", "cylindrical mold", "Crimbonium fuel rod", "Petite Paintbrush", "Crimbot schematic: Gun Face", "Crimbot schematic: Big Head", "Crimbot schematic: Security Chassis", "Crimbot schematic: Military Chassis", "Crimbot schematic: Crab Core", "Crimbot schematic: Dynamo Head", "Crimbot schematic: Cyclopean Torso", "Crimbot schematic: Really Big Head", "Crimbot schematic: Nerding Module", "Crimbot schematic: Refrigerator Chassis", "Crimbot schematic: Bug Zapper", "Crimbot schematic: Rodent Gun", "Crimbot schematic: Rivet Shocker", "Crimbot schematic: Mega Vise", "Crimbot schematic: Mobile Girder", "Crimbot schematic: Swiss Arm", "Crimbot schematic: Data Analyzer", "Crimbot schematic: Maxi-Mag Lite", "Crimbot schematic: Bit Masher", "Crimbot schematic: Camera Claw", "Crimbot schematic: Power Arm", "Crimbot schematic: Wrecking Ball", "Crimbot schematic: Ribbon Manipulator", "Crimbot schematic: Power Stapler", "Crimbot schematic: Grease Gun", "Crimbot schematic: Grease / Regular Gun", "Crimbot schematic: Snow Blower", "Crimbot schematic: Cold Shoulder", "Crimbot schematic: Candle Lighter", "Crimbot schematic: Lamp Filler", "Crimbot schematic: Heavy-Duty Legs", "Crimbot schematic: Tripod Legs", "Crimbot schematic: Rollerfeet", "Crimbot schematic: Sim-Simian Feet", "Crimbot schematic: High-Speed Fan", "Crimbot schematic: Big Wheel", "Crimbot schematic: Hoverjack", "Crimbot schematic: Gun Legs", "Crimbot schematic: Heavy Treads", "Crimbot schematic: Rocket Skirt", "recovered elf magazine", "recovered elf toothbrush", "recovered elf sleeping pills", "recovered elf underpants", "recovered elf wallet", "recovered elf pocketwatch", "recovered elf photo album", "recovered elf smartphone", "Size XI Wizard's Robe", "Bit O' Quail Spleen", "Take Eleven Bar", "mimeplasm", "BOOterfinger", "Moonds", "Big Punk", "fist turkey outline", "brass turkey knuckles", "Friendly Turkey", "Agitated Turkey", "Ambitious Turkey", "neutron lollipop", "gamma nog", "sneaky wrapping paper", "Thwaitgold nit statuette", "picky tweezers", "Crimbo Credit", "single atom", "Time Cape", "Time Cloak", "sleeve deuce", "pocket ace", "nastygeist", "gold tooth", "portable table", "outlaw bandana", "whiskey in a broken glass", "shot of mescal", "glass of herbal tequila", "minin' dynamite", "plaid cowboy hat", "spooky lasso", "rusted-out shootin' iron", "rattler rattle", "big bag of money", "Crimbo sapling", "even more tinsel", "box of old Crimbo decorations", "letter to Ed the Undying", "copy of a jerk adventurer's father's diary", "[7961]Staff of Ed", "[7962]Eye of Ed", "[7963]ancient amulet", "[7964]Staff of Fats", "[7965]Holy MacGuffin", "Ka coin", "World's Best Adventurer sash", "topiary nugglet", "beehive", "electric boning knife", "Aggressive Carrot", "mummified fig", "mummified loaf of bread", "mummified beef haunch", "linen bandages", "cotton bandages", "silk bandages", "holy spring water", "spirit beer", "sacramental wine", "talisman of Thoth", "ancient cure-all", "Sister Accessory", "Boosty Juice", "polyester parachute", "polyester pad", "polyester peeler", "polyester pettipants", "polyester panama hat", "polyester pulsera", "porcelain police baton", "porcelain plus-fours", "porcelain porkpie", "porcelain pepper mill", "porcelain pelerine", "porcelain phantom mask", "polyesterene powder", "porcelain powder", "choco-Crimbot", "smart watch", "augmented-reality shades", "toy Crimbot mega face", "toy Crimbot power glove", "toy Crimbot super fist", "toy Crimbot rocket legs", "Crimbot battery", "Crimbot ROM: Rapid Prototyping", "Crimbot ROM: Mathematical Precision", "Crimbot ROM: Ruthless Efficiency", "Mini-Crimbot crate", "heavy-duty Crimbot aerial", "Crimbomega drive chain", "Crimbot ROM: Rapid Prototyping (dirty)", "Crimbot ROM: Mathematical Precision (dirty)", "Crimbot ROM: Ruthless Efficiency (dirty)", "fitness wristband", "flask of tainted mining oil", "red and green rain stick", "Chateau Mantegna room key", "Choco-Mint patty", "hot mint schnocolate", "homeopathic mint tea", "electric muscle stimulator", "foreign language tapes", "bowl of potpourri", "ceiling fan", "antler chandelier", "artificial skylight", "Swiss piggy bank", "continental juice bar", "fancy stationery set", "fancy calligraphy pen", "alpine watercolor set", "tope&eacute;", "topiary tights", "topiary necktie", "bowl of topioca", "topiary skunk", "topiary noseplugs", "trusty whip", "crumbling skull", "[8042]rock", "pot", "spelunking fedora", "sturdy machete", "shotgun", "boomerang", "mining helmet", "X-ray goggles", "yellow cape", "jetpack", "spring boots", "spiked boots", "heavy pickaxe", "torch", "[spelunking test kit]", "plasma rifle", "Bananubis's Staff", "The Joke Book of the Dead", "The Clown Crown", "cursed coffee cup", "Tales of Spelunking", "golden monkey statuette", "golden banana", "powdered gold", "gold nuggets", "Professor of Spelunkology", "Stembridge sidearm", "warehouse map page", "warehouse inventory page", "janitor sponge", "Spelunker of Fortune", "Spelunker's fedora", "Spelunker's whip", "Spelunker's khakis", "Spelunker's Guild prize sack", "LOLmec statuette", "Spelunker of Fortune (used)", "still-beating spleen", "Thwaitgold scarab beetle statuette", "solid gold jewel", "headless sparrow", "mangled squirrel", "rat carcass", "wicker kickers", "wicker slicker", "wicker knickers", "wicker ticker", "wicker sticker", "wicker clicker", "wickerbits", "bakelite belt", "bakelite badge", "bakelite bowl", "bakelite brooch", "bakelite breeches", "bakelite backpack", "bakelite bits", "aerogel anvil", "aerogel akubra", "aerogel apron", "aerogel ascot", "aerogel attache case", "aerogel accordion", "aerosolized aerogel", "wrought-iron wig", "wrought-iron winch crank", "wrought-iron widget", "wrought-iron whisk", "wrought-iron walker", "wrought-iron waders", "wrought-iron flakes", "gabardine gaiters", "gabardine garland", "gabardine gunnysack", "gabardine garibaldi", "gabardine girdle", "gabardine gloves", "gabardine smithereens", "fiberglass fetish", "fiberglass foil", "fiberglass fannypack", "fiberglass frock", "fiberglass fingerguard", "fiberglass fedora", "fiberglass fibers", "bottle of lovebug pheromones", "winged yeti fur", "talisman of Renenutet", "rubber spatula", "wooden spoon", "crystalline reamer", "macroplane grater", "bastard baster", "obsidian nutcracker", "talisman of Seshat", "glass eye", "invisible potion", "time shuriken", "ninjammies", "Glo-Pop", "sugar sphere", "Shrubble Bubble", "polyeaster egg", "porcelain candy dish", "Spechunky bar", "talisman of Horus", "check to the Meatsmith", "Skeleton Store office key", "bone with a price tag on it", "half of a gold tooth", "mouse skull", "really thick spine", "oversized skullcap", "three-legged pants", "remaindered axe", "low-budget shield", "cr&ecirc;epy mask", "magical baguette", "glob of enchanted icing", "ginger snaps", "mostly-broken sunglasses", "unflavored wine cooler", "carton of snake milk", "sewer snake", "pigeon egg", "jaunty feather", "premium malt liquor", "brown paper pants", "brown paper bag mask", "ring of telling skeletons what to do", "breadwand", "loafers", "Map to Kokomo", "bread basket", "Ed the Undying exhibit crate", "The Crown of Ed the Undying", "Doc Galaktik's Invigorating Tonic", "map to a hidden booze cache", "Cherrytastrophe wine cooler", "Radberry Rip wine cooler", "Orangemageddon wine cooler", "Breakfast Blast wine cooler", "Citrus Crush wine cooler", "plain bagel", "glob of cream cheese", "loaf of soda bread", "acceptable bagel", "standard-issue cupcake", "ultra-deluxe cupcake", "hypnotic breadcrumbs", "popular tart", "no-handed pie", "Doc Galaktik's Vitality Serum", "airplane charter: Dinseylandfill", "one-day ticket to Dinseylandfill", "FunFunds&trade;", "expensive camera", "cheap sunglasses", "How to Avoid Scams", "filthy child leash", "bag of gross foreign snacks", "bag of park garbage", "grogpagne", "dirty rigging rope", "nasty snuff", "sewage-clogged pistol", "beard incense", "perfume-soaked bandana", "toxic globule", "toxo", "Lemonade-235", "isotophat", "Three Mile Island shorts", "toxic mop", "inert sludgepuppy", "lead collar", "jar of swamp honey", "backwoods banjo", "grody jug", "ratskin pajama pants", "turtle voicebox", "fake washboard", "Dinsey's oculus", "Dinsey's radar dish", "Dinsey's pizza cutter", "Dinsey's brain", "Dinsey's glove", "Dinsey's pants", "brain preservation fluid", "keycard &alpha;", "keycard &beta;", "keycard &gamma;", "keycard &delta;", "complimentary Dinsey refreshments", "lube-shoes", "trash net", "Dinsey mascot mask", "Dinsey food-cone", "Dinsey Whinskey", "Dinsey face paint", "stinky fannypack", "garbage sticker", "hazmat helmet", "Scratch-and-Sniff Guide to Dinseylandfill", "Trash, a Memoir", "Dinsey Maintenance Manual", "Dinsey tattoo kit", "nasty gum", "Wart Dinsey: An Afterlife", "The Lot's engagement ring", "portable Mayo Clinic", "Mayonex", "Mayodiol", "Mayostat", "Mayozapine", "Mayoflex", "miracle whip", "sphygmayomanometer", "tomayohawk-style reflex hammer", "mayo lance", "unappetizing mayolus", "uninteresting mayolus", "acceptable mayolus", "enticing mayolus", "mouth-watering mayolus", "newly-hatched mayonnaise wasp", "mayo pump", "Essence of Bear", "Afternoon Delight", "Kokomo Resort Chip", "Golden Kokomo Resort Chip", "Kokomo Resort Brand Suntan Oil", "Kokomo Resort Order Pad", "The Cocktail Shaker", "Kokomo Resort Pass", "Mayo Minder&trade;", "Mayo de Mayo&trade; mayo", "yellow puck", "kill screen", "orange boxing gloves", "dice ring", "dice belt buckle", "dice-print pajama pants", "dice-shaped backpack", "dice-print do-rag", "dice sunglasses", "Thwaitgold caterpillar statuette", "powdered dice", "yellow pixel", "pixel coin", "power pill", "pixel star", "pixel banana", "pixel beer", "yellow puck with a bow on it", "blue pumps", "sludgesicle", "&Uuml;berraschthexengebr&auml;u", "piggy tattoo", "baggie of regular-sized tardigrades", "little red .epub file", "BUBBLE GUM", "hustler shades", "spicy jerky stick", "costume rental shop", "muscle oil", "bottle of Red-Out", "pickpocket protector", "sinister-looking cat", "jazzy cigarette holder", "one glove", "leather glove", "handful of fire", "Cracklin' Oat Bran", "disposable lighter", "coal contact lenses", "conjured ice cream", "Iceberglar scarf", "icy hairspray", "smellbook", "assassin's cheese knife", "filthy armor", "plague pie", "batarang", "spare neck bolts", "grease trap", "shamanic ham", "porkpocket", "Leonard's glasses", "warehouse walkie-talkie", "janitor's mop", "warehouse clerk's glasses", "baloney rotgut", "carton of gaspers", "bronze polish", "crident", "totally sweet mohawk helmet", "spray chrome", "filthy monkey head", "hand of cards", "damp bar rag", "lump of goofball ore", "skeleton beans", "grimy lab coat", "creepy nursery rhyme", "iron torso box", "mercenary headband", "radioactive spider venom", "x-ray mirror", "wrestling mask", "hawkface potion", "child-sized dracula cloak", "devil-summoning hat", "shopkeeper beard", "alien autoautopsy kit", "novelty fruit hat", "invisibility cream", "handful of stubble", "garbage juice slurpee", "plunge-leg", "funky eyepatch", "bucket of fish juice", "flashy pirate dreadlocks", "captured boozles", "drinks tray", "eyebrow lifter", "yellow submarine", "pixel lemon", "pixel daiquiri", "miniature power pill", "yellow pixel potion", "Pack of Every Card", "Deck of Every Card", "popular part", "bubblegum heart", "cubic zirconia", "valuable coin", "white mana", "black mana", "red mana", "green mana", "blue mana", "gift card", "hermit factoid", "The Emperor's dry cleaning", "The Emperor's new hat", "The Emperor's new shirt", "The Emperor's new pants", "lead pipe", "rope", "wrench", "candlestick", "knife", "revolver", "1952 Mickey Mantle card", "talking spade", "savory dry noodles", "pestopiary", "ectoplasmic orbs", "crudles", "agnolotti arboli", "spaghetti with ghost balls", "succulent marrow", "salacious crumbs", "fusilli marrownarrow", "suggestive strozzapreti", "Mountain Stream gastrique", "Mt. McLargeHuge oyster", "oyster sauce", "linguini immondizia bianco", "shells a la shellfish", "Jick's autograph", "high-temperature mining drill", "unsmoothed velvet", "1,970 carat gold", "New Age healing crystal", "Volcoino", "fizzing spore pod", "paisley spore pod", "veiny spore pod", "hard spore pod", "glowing spore pod", "hot spore pod", "cool spore pod", "jingling spore pod", "red LavaCo Lamp&trade;", "blue LavaCo Lamp&trade;", "green LavaCo Lamp&trade;", "thin gold wire", "insulated gold wire", "empty lava bottle", "full lava bottle", "viscous lava globs", "red lava globs", "blue lava globs", "green lava globs", "SMOOCH bottlecap", "uncapped red lava bottle", "uncapped blue lava bottle", "uncapped green lava bottle", "capped red lava bottle", "capped blue lava bottle", "capped green lava bottle", "heat-resistant sheet metal", "LavaCo&trade; Lamp housing", "glowing New Age crystal", "crystalline light bulb", "broken high-temperature mining drill", "high-temperature mining mask", "fireproof megaphone", "mineapple", "Gold Velvet&trade; whiskey", "SMOOCH soda", "smelted roe", "lavawater", "basaltamander tongue", "lavalarva", "lava balaclava", "basaltamander buckler", "sticky lava globs", "gooey lava globs", "lava-proof pants", "heat-resistant necktie", "heat-resistant gloves", "very hot lunch", "asbestos thermos", "liquid rhinestones", "disco biscuit", "Quaatorade&trade;", "biker's hat", "feathered headdress", "electrician's hardhat", "Lava Miner's Daughter", "Psycho From The Heat", "The Firegate Tapes", "&quot;DEBBIE&quot; tattoo kit", "one-day ticket to That 70s Volcano", "airplane charter: That 70s Volcano", "Manual of Numberology", "New Age hurting crystal", "smooth velvet pants", "smooth velvet shirt", "smooth velvet hat", "smooth velvet pocket square", "smooth velvet socks", "smooth velvet hanky", "The One Mood Ring", "Mr. Choch's bone", "Mr. Cheeng's 'stache", "Saturday Night thermometer", "the tongue of Smimmons", "Raul's guitar pick", "Pener's crisps", "signed deuce", "Lavalos core", "half-melted hula girl", "glass ceiling fragments", "SMOOCH coffee cup", "labrador cookie", "Mr. Cheeng's spectacles", "grease cannon", "demon makeup kit", "love", "Pener's drumstick", "little deuce cape", "Lavalos's shell", "smooth velvet bra", "SMOOCH bracers", "SMOOCH kneepads", "SMOOCH spaulders", "SMOOCH codpiece", "SMOOCH breastplate", "superduperheated metal", "fused fuse", "superheated metal", "lava cake", "pink slime", "Devil's Elbow Hot Sauce", "Special&trade; Sauce", "devil hair pasta", "spagecialetti", "Salsa Libre", "good gravy", "illicit fish sauce", "libertagliatelle", "turkish mostaccioli", "linguini of the sea", "Hersey&trade; SMOOCH", "Alexy sauce", "rainbow sauce", "drug cocktail sauce", "Fettris", "fusillocybin", "prescription noodles", "blood-drive sticker", "bag of grain", "pocket maze", "shady shades", "squeaky toy rose", "weird gazelle steak", "sausage without a cause", "silver face paint", "emergency margarita", "vintage smart drink", "a ten-percent bonus", "Thwaitgold termite statuette", "The Emperor's new cookie", "Wickers bar", "bakelite-covered bacon", "Aerheads", "Wrotz", "Gabarbar", "fiberglass insulation", "shrine to the Barrel god", "barrel lid", "barrel hoop earring", "bankruptcy barrel", "little firkin", "normal barrel", "big tun", "weathered barrel", "dusty barrel", "disintegrating barrel", "moist barrel", "rotting barrel", "mouldering barrel", "barnacled barrel", "bottle of Amontillado", "barrel-aged martini", "barrel pickle", "barrel cracker", "vibrating mushroom", "cute mushroom", "KoL Con 12-gauge", "Golden Mr. Eh?", "barrel gun", "tiny barrel", "barrel beryl", "water log", "barrelhead", "bottoms of the barrel", "chest barrel", "brass bung spigot", "double barreled barrel gun", "triple barreled barrel gun", "barrel beryl choker", "barrel beryl nose ring", "barrel beryl ring", "map to the Biggest Barrel", "potted tea tree", "cuppa Flamibili tea", "cuppa Yet tea", "cuppa Boo tea", "cuppa Nas tea", "cuppa Improprie tea", "cuppa Frost tea", "cuppa Toast tea", "cuppa Net tea", "cuppa Proprie tea", "cuppa Morbidi tea", "cuppa Chari tea", "cuppa Serendipi tea", "cuppa Feroci tea", "cuppa Physicali tea", "cuppa Wit tea", "cuppa Neuroplastici tea", "cuppa Dexteri tea", "cuppa Flexibili tea", "cuppa Impregnabili tea", "cuppa Obscuri tea", "cuppa Irritabili tea", "cuppa Mediocri tea", "cuppa Loyal tea", "cuppa Activi tea", "cuppa Cruel tea", "cuppa Alacri tea", "cuppa Vitali tea", "cuppa Mana tea", "cuppa Monstrosi tea", "cuppa Twen tea", "cuppa Gill tea", "cuppa Uncertain tea", "cuppa Voraci tea", "cuppa Sobrie tea", "cuppa Royal tea", "cuppa Craft tea", "cuppa Insani tea", "Royal scepter", "haunted doghouse", "Ghost Dog Chow", "bowl of eyeballs", "bowl of mummy guts", "bowl of maggots", "blood and blood", "Jack-O-Lantern beer", "zombie", "Telltale&trade; rubber heart", "wind-up spider", "plastic nightmare troll", "tennis ball", "heavy crown", "ear poison", "stink-penny", "hawk", "hamlet sandwich", "Othello's military jacket", "Othello's dagger", "Othello's handkerchief", "bowl of Jeal-O", "grip key", "How to Play Othello", "ghostly dagger", "ghost beer", "portable Othello set", "rotten tomato", "Twelve Night Energy", "Yorick", "rose", "white tulip", "red tulip", "blue tulip", "Walford's bucket", "Wal-Mart gift certificate", "airplane charter: The Glaciest", "one-day ticket to The Glaciest", "shoulder-warming lotion", "iceberg lettuce", "ice wine", "Wal-Mart snowglobe", "Wal-Mart nametag", "Wal-Mart overalls", "To Build an Igloo", "The Chill of the Wild", "Cold Fang", "Wal-Mart tattoo kit", "perfect ice cube", "The Fun-Guy Cold Weather Bartender's Guide", "bellhop's hat", "ice porter", "exotic travel brochure", "bag of foreign bribes", "frozen shampoo-conditioner", "hotel minibar key", "ice hotel bell", "Martialest Arts trophy", "ancient medicinal herbs", "ice rice", "iced plum wine", "training belt", "training legwarmers", "training helmet", "training scroll:  Shattering Punch", "training scroll:  Snokebomb", "training scroll:  Shivering Monkey Technique", "X-32-F snowman crate", "machine elf capsule", "self-dribbling basketball", "abstraction: action", "abstraction: thought", "abstraction: sensation", "abstraction: purpose", "abstraction: category", "abstraction: perception", "abstraction: motion", "abstraction: joy", "abstraction: certainty", "abstraction: comprehension", "modern picture frame", "VYKEA meatballs", "VYKEA mead", "VYKEA woadpaint", "VYKEA frenzy rune", "VYKEA blood rune", "VYKEA lightning rune", "VYKEA plank", "VYKEA rail", "VYKEA bracket", "VYKEA dowel", "VYKEA hex key", "VYKEA instructions", "tin of submardines", "bottle of norwhiskey", "octolus oculus", "sardine can key", "norwhal helmet", "octolus-skin cloak", "perfect cosmopolitan", "perfect negroni", "perfect dark and stormy", "perfect mimosa", "perfect old-fashioned", "perfect paloma", "That 70s Cologne", "Wal-Mart &quot;diamond&quot; ring", "Puffstone cigar", "Conspiracy&trade; mascara", "Spring Break Beach &quot;swimsuit&quot;", "airplane tattoo", "Deep Machine Tunnels snowglobe", "hemp candy necklace", "communal gobstopper", "Crimbo salad", "bread line", "bark rootbeer", "red ale", "tiny plastic Tammy the Tambourine Elf", "tiny plastic Rudolph the Red", "tiny plastic Gaia'ajh-dsli Ak'lwej", "tiny plastic Crimborgatron", "tiny plastic Crimbodhisattva", "bouquet of all-natural free-range flowers", "stack of communist leaflets", "BACON", "box of Gratitude chocolates", "Gratitude chocolate (thyme-filled)", "Gratitude chocolate (bourbon-filled)", "Gratitude chocolate (Meat-filled)", "Gratitude chocolate (octopus-filled)", "chocolate bowtie", "pitted sheet metal", "sparking robo-battery", "overloaded micro-reactor", "reusable shopping bag", "coarse hemp socks", "red armband", "bundle of &quot;fragrant&quot; herbs", "nuclear stockpile", "pine cone", "iron chain", "pine cone necklace", "reindeer hammer", "elf ploughshare", "circle drum", "The Big Book of Communism", "faded green protest sign", "faded red protest sign", "nasty-smelling moss", "little red book", "elven tambourine", "reindeer sickle", "green face paint", "red face paint", "The Big Book of Communism (used)", "Batfellow comic", "tiny plastic spoiler", "bat-oomerang", "bat-jute", "bat-o-mite", "ROM of Optimality", "incriminating evidence", "dangerous chemicals", "kidnapped orphan", "high-grade metal", "high-tensile-strength fibers", "high-grade explosives", "experimental gene therapy", "ultracoagulator", "self-defense training", "fingerprint dusting kit", "confidence-building hug", "exploding kickball", "glob of Bat-Glue", "Bat-Aid&trade; bandage", "bat-bearing", "Kudzu salad", "Mansquito Serum", "Miss Graves' vermouth", "The Plumber's mushroom stew", "The Author's ink", "The Mad Liquor", "Doc Clock's thyme cocktail", "Mr. Burnsger", "The Inquisitor's unidentifiable object", "The Jokester's gun", "The Jokester's wig", "The Jokester's pants", "Jokester makeup", "replica bat-oomerang", "battoo kit", "basking robin", "tiny domino mask", "robin's egg", "robin flan", "robin nog", "LT&T telegraph office deed", "plaintive telegram", "exploding gum", "root beer barrel", "Kudzu slaw", "Mansquito's blood", "infrablack lipstick", "can of drain cleaner", "The Author's inkwell", "bag of random words", "tube of pendulum lube", "red-hot jawbreaker", "question juice", "tube of villain white", "your cowboy boots", "inflatable LT&T telegraph office", "nugget of quicksilver", "nugget of thicksilver", "nugget of wicksilver", "nugget of slicksilver", "nugget of sicksilver", "nugget of nicksilver", "nugget of ticksilver", "quicksilver ring", "thicksilver ring", "wicksilver ring", "slicksilver ring", "sicksilver ring", "nicksilver ring", "ticksilver ring", "Heimz Fortified Kidney Beans", "Tesla's Electroplated Beans", "Mixed Garbanzos and Chickpeas", "Hellfire Spicy Beans", "Frigid Northern Beans", "World's Blackest-Eyed Peas", "Trader Olaf's Exotic Stinkbeans", "Pork 'n' Pork 'n' Pork 'n' Beans", "Val-U Brand Every Bean Salad", "Shrub's Premium Baked Beans", "plate of Heimz Fortified Kidney Beans", "plate of Tesla's Electroplated Beans", "plate of Mixed Garbanzos and Chickpeas", "plate of Hellfire Spicy Beans", "plate of Frigid Northern Beans", "plate of World's Blackest-Eyed Peas", "plate of Trader Olaf's Exotic Stinkbeans", "plate of Pork 'n' Pork 'n' Pork 'n' Beans", "plate of Val-U Brand Every Bean Salad", "plate of Shrub's Premium Baked Beans", "Fancy Jeff's fancy pocket square", "Daisy's unclean bloomers", "Pecos Dave's sixgun", "Amoon-Ra Cowtep's nemes", "Glenn's golden dice", "Former Sheriff Dan's tin star", "El Vibrato restraints", "Clara's bell", "Granny Hackleton's Gatling gun", "buffalo dime", "cow poker", "poker face paint", "realistic cap gun", "tainted milk", "gun parts", "triggerfingerbone", "ghost bit", "buzzard feather", "lion musk", "bear claw", "rattler gland", "half-digested coal", "tightly-wound spine", "rotting beefsteak", "firemilk", "spidercow eye-cluster", "moomy dust", "western-style skinning knife", "reliable sixgun", "steel knuckles", "Tales of Western Braggadoccio", "Hell and How I Bent It", "The Western Look", "LT&T tattoo kit", "Western Slang Vol. 1: Violence", "Western Slang Vol. 2: Cooking", "Western Slang Vol. 3: Fraud", "strange disc (white)", "strange disc (black)", "strange disc (red)", "strange disc (green)", "strange disc (blue)", "strange disc (yellow)", "red-hot knucklebone", "demonic cow's blood", "rinky-dink sixgun", "makeshift sixgun", "custom sixgun", "baconstone-handled sixgun", "porquoise-handled sixgun", "hamethyst-handled sixgun", "mountain lion skin", "grizzled bearskin", "diamondback skin", "coal snakeskin", "frontwinder skin", "rotting cowskin", "shuddering cow skull", "rhinestone cowhorn", "silver cow skull", "jangly spurs", "quicksilver spurs", "thicksilver spurs", "wicksilver spurs", "slicksilver spurs", "sicksilver spurs", "nicksilver spurs", "ticksilver spurs", "special edition Batfellow comic", "Tales of the West: Cow Punching", "Tales of the West: Beanslinging", "Tales of the West: Snake Oiling", "briefcase full of snakes", "one-gallon hat", "two-gallon hat", "three-gallon hat", "four-gallon hat", "five-gallon hat", "six-gallon hat", "seven-gallon hat", "eight-gallon hat", "nine-gallon hat", "ten-gallon hat", "eleven-gallon hat", "toy sixgun", "snake oil", "skin oil", "unusual oil", "eldritch oil", "exclusive club", "patent preventative tonic", "patent invisibility tonic", "patent aggression tonic", "patent sallowness tonic", "patent avarice tonic", "patent alacrity tonic", "corrupted marrow", "rodeo whiskey", "Thwaitgold scorpion statuette", "real cowboy hat", "Memories of Cow Punching", "Memories of Beanslinging", "Memories of Snake Oiling", "Witchess Set", "electronic Brain Trainer game", "do-it-yourself laser eye surgery kit", "armored prawn", "jumping horseradish", "Sacramento wine", "Greek fire", "ox-head shield", "dented scepter", "very pointy crown", "battle broom", "Clan Floundry", "carpe", "codpiece", "troutsers", "bass clarinet", "fish hatchet", "tunac", "fishin' pole", "wriggling worm", "bottle of Fishhead 900-Day IPA", "high-test fishing line", "fishin' hat", "Trout Fishing in Loathing", "sonar fishfinder", "luxury fly-tying workbench", "antique tacklebox", "disconnected intergnat", "viral video", "internet point", "meme generator", "plus one", "gallon of milk", "print screen button", "screencapped monster", "daily dungeon malware", "infinite BACON machine", "First Post shirt package", "First Post shirt - Cir Senam", "high-speed upgrade", "no spoon", "delicious star salad", "Thwaitgold moth statuette", "bowl of Tastee-Wheet&trade;", "Source terminal", "Source essence", "browser cookie", "hacked gibson", "Source shades", "software bug", "missing semicolon", "Source terminal PRAM chip", "Source terminal GRAM chip", "Source terminal SPAM chip", "Source terminal CRAM chip", "Source terminal DRAM chip", "Source terminal TRAM chip", "Source terminal INGRAM chip", "Source terminal DIAGRAM chip", "Source terminal ASHRAM chip", "Source terminal SCRAM chip", "Source terminal TRIGRAM chip", "Source terminal file: substats.enh", "Source terminal file: damage.enh", "Source terminal file: critical.enh", "Source terminal file: protect.enq", "Source terminal file: stats.enq", "Source terminal file: compress.edu", "Source terminal file: duplicate.edu", "Source terminal file: portscan.edu", "Source terminal file: turbo.edu", "Source terminal file: familiar.ext", "Source terminal file: pram.ext", "Source terminal file: gram.ext", "Source terminal file: spam.ext", "Source terminal file: cram.ext", "Source terminal file: dram.ext", "Source terminal file: tram.ext", "green pill", "plastic detective badge", "bronze detective badge", "silver detective badge", "gold detective badge", "cop dollar", "detective school application", "detective roscoe", "shoe gum", "noir fedora", "trench coat", "Falcon&trade; Maltese Liquor", "hardboiled egg", "detective tattoo", "DIY protonic accelerator kit", "protonic accelerator pack", "almost-dead walkie-talkie", "Adventurer bobblehead", "psychokinetic energy blob", "haunted bindle", "fleshy lump", "smoldering bagel punch", "ghostly reins", "frigid derringer", "Mr. Screege's spectacles", "Spookyraven signet", "tie-dyed fannypack", "burnt snowpants", "standards and practices guide", "Carpathian longsword", "Liam's mail", "Unfortunato's foolscap", "Thwaitgold cockroach statuette", "rad", "purification tablet", "Wrist-Boy", "Dear Past Self Package", "Time-Spinner", "compounded experience", "Rad-B-Gone (1 lb.)", "Rad-Pro (1 oz.)", "lead umbrella", "Shrieking Weasel holo-record", "Power-Guy 2000 holo-record", "Lucky Strikes holo-record", "EMD holo-record", "Superdrifter holo-record", "The Pigs holo-record", "Drunk Uncles holo-record", "time residue", "repaid diaper", "Riker's Search History", "Shot of Kardashian Gin", "Unstable Pointy Ears", "Memory Disk, Alpha", "Tea, Earl Grey, Hot", "School of Hard Knocks Diploma", "baby bark scorpion", "droppable microphone", "unidentified drink", "KoL Con 13 T-shirt", "discarded swimming trunks", "diluted makeup", "charisma potion", "extremely confusing manual", "foam pistol", "KoL Con 13 snowglobe", "leftover pasty", "very fancy whiskey", "li'l orphan tot", "li'l knight costume", "li'l unicorn costume", "li'l candy corn costume", "li'l ninja costume", "li'l pirate costume", "li'l clown costume", "li'l robot costume", "li'l eyeball costume", "li'l liberty costume", "hoarded candy wad", "Prunets", "Twitching Television Tattoo", "tiny baby scorpion", "invisible string", "invisible seam ripper", "li'l ghost costume", "raw sweet potato", "raw green beans", "raw stuffing", "raw cranberry sauce", "raw turkey", "raw mincemeat", "raw potato", "raw gravy", "raw bread", "mini-marshmallow dispenser", "glass casserole dish", "stuffing fluffer", "can opener", "turkey blaster", "glass pie plate", "potato masher", "gravy boat", "bread mold", "candied sweet potatoes", "green bean casserole", "baked stuffing", "cranberry cylinder", "thanksgiving turkey", "mince pie", "mashed potatoes", "warm gravy", "bread roll", "leftovers", "leftovers sandwich", "Eldritch Intellect: Journey into a Mind of Horror", "cornucopia", "megacopia", "giant pilgrim hat", "packet of thanksgarden seeds", "cashew", "bomb of unknown origin", "Granny Tood's Thanksgarden Catalog", "eldritch effluvium", "eldritch concentrate", "eldritch extract", "Official Council Aide Pin", "eldritch distillate", "eldritch essence", "Science Notebook", "eldritch hat", "eldritch pants", "eldritch elixir", "Quartet of Flare Masters Jacket", "lump of not really wriggling eldritch matter", "Adventurer's Kit", "Build-a-City Gingerbread kit", "counterfeit city", "sprinkles", "The Gingerbread Vigilante's Handbook", "sour ball and chain", "candy dog collar", "gingerbread tophat", "gingerbread waistcoat", "gingerbread trousers", "candy dress shoes", "candy necktie", "chocolate pocketwatch", "broken chocolate pocketwatch", "interesting clod of dirt", "gingerbread restraining order", "sprinkle-begging cup", "animal part cracker", "gingerbread wine", "gingerbread mug", "gingerbread mask", "gingerservo", "tainted icing", "gingerbeard", "gingerbread smartphone", "gingerbread hoodie", "gingerbread pistol", "fancy marzipan briefcase", "creme brulee torch", "candy crowbar", "candy screwdriver", "gingerbread dog treat", "pumpkin spice candle", "gingerbread spice latte", "gingerbread gavel", "gingerbread cigarette", "gingerbread moneybag", "ginger beer", "spare chocolate parts", "industrial frosting", "fake cocktail", "high-end ginger wine", "tiny plastic bad vibe", "tiny plastic angry vikings", "tiny plastic Knows About Chakras", "tiny plastic Your Brain", "tiny plastic Krampus", "Inner Wisdom", "Inner Strength", "Inner Truth", "spiritual candy cane", "spiritual eggnog", "spiritual fruitcake", "spiritual gingerbread", "chocolate puppy", "chocolate leash", "My Life of Crime, a Memoir", "Pop Art: a Guide", "No Hats as Art", "Rethinking Candy", "fruit-leather negatives", "gingerbread blackmail photos", "briefcase full of sprinkles", "teethpick", "green rock candy", "green-iced sweet roll", "sugar raygun", "fancy chocolate sculpture", "no hat", "chakra sludge", "negative lump", "Third Eye", "Krampus Horn", "hambrosier", "chakra-mental wine", "chakra malt", "Black Angus blackburger", "black brandy", "potion of spiritual gunkifying", "bad vibroknife", "crystal belt buckle", "saffron antaravasaka", "saffron uttarasanga", "Lump-Stacking for Beginners", "eternal knot tattoo", "pet bad vibe", "black gallstone", "Uncle Crimbo's hat", "Eldritch snap", "hot jelly", "cold jelly", "spooky jelly", "sleaze jelly", "stench jelly", "space planula", "toast with hot jelly", "toast with cold jelly", "toast with spooky jelly", "toast with sleaze jelly", "toast with stench jelly", "space jellybicycle", "hopeful candle", "pewter candlestick", "wax hand", "miniature candle", "wax pancake", "wax face", "wax booze", "glob of melted wax", "sea jelly", "sea truffle", "tarnished luggage key", "crushed steamer trunk", "recovered cufflinks", "heart-shaped crate", "LOV Elixir #3", "LOV Elixir #6", "LOV Elixir #9", "LOV Eardigan", "LOV Epaulettes", "LOV Earrings", "LOV Enamorang", "LOV Emotionizer", "LOV Extraterrestrial Chocolate", "LOV Echinacea Bouquet", "LOV Elephant", "eldritch scanner", "eldritch alignment spray", "LOV Entrance Pass", "eldritch hammer", "eldritch mushroom", "eldritch ichor", "eldritch mushroom pizza", "eldritch tincture", "eldritch tincture (depleted)", "eldritch rub", "HP-35 Calculator", "Silver HP-35 Calculator", "Golden HP-35 Calculator", "Platinum HP-35 Calculator", "Diamond HP-35 Calculator", "dirty bottlecap", "discarded button", "Gummi-Memory", "Thwaitgold amoeba statuette", "pickled grasshopper", "bottle of an&iacute;s", "bottle of novelty hot sauce", "elemental sugarcube", "peppermint sprig", "bottle of clam juice", "cocktail mushroom", "shot of granola liqueur", "can of cherry-flavored sterno", "lump of black ichor", "bottle of gregnadigne", "bottle of Cr&egrave;me de Fugu", "baby oil shooter", "fish head", "limepatch", "pile of dirt", "slime shooter", "imaginary lemon", "literal grasshopper", "double entendre", "Phlegethon", "Siberian sunrise", "mentholated wine", "low tide martini", "shroomtini", "morning dew", "whiskey squeeze", "great old fashioned", "Gnomish sagngria", "vodka stinger", "extremely slippery nipple", "piscatini", "Churchill", "soilzerac", "London frog", "nothingtini", "eighth plague", "single entendre", "reverse Tantalus", "elemental caipiroska", "Feliz Navidad", "Bloody Nora", "moreltini", "hell in a bucket", "Newark", "R'lyeh", "Gnollish sangria", "vodka barracuda", "Mysterious Island iced tea", "drive-by shooting", "gunner's daughter", "dirt julep", "Simepore slime", "Phil Collins", "unpowered Robortender", "toggle switch (Bartend)", "toggle switch (Bounce)", "Spacegate access badge", "filter helmet", "exo-servo leg braces", "rad cloak", "gate transceiver", "high-friction boots", "Spacegate Research", "alien rock sample", "alien gemstone", "geological sample kit", "botanical sample kit", "edible alien plant bit", "alien plant fibers", "alien plant sample", "complex alien plant sample", "fascinating alien plant sample", "alien plant goo", "alien plant pod", "zoological sample kit", "alien meat", "alien toenails", "alien zoological sample", "complex alien zoological sample", "fascinating alien zoological sample", "alien animal goo", "alien animal milk", "spant egg casing", "murderbot data core", "primitive alien medicine", "primitive alien salad", "primitive alien booze", "primitive alien mask", "primitive alien spear", "primitive alien blowgun", "primitive alien loincloth", "primitive alien totem", "primitive alien necklace", "spant chitin", "spant tendon", "spants", "spant shield", "spant shoulderpads", "spant backplate", "spant spear", "murderbot power cell", "murderbot component casing", "murderbot monofilament", "murderbot shield unit", "murderbot live wire", "murderbot mask", "murderbot spring injector", "murderbot whip", "murderbot plasma rifle", "murderbot memory chip", "space pirate treasure map", "Space Pirate Astrogation Handbook", "Non-Euclidean Finance", "Peek-a-Boo!", "Procrastinator locker key", "Space Baby children's book", "Space Baby bawbaw", "portable Spacegate", "Aldebaran sardines", "Centauri fish wine", "powdered oxygen", "Spacegate scientist's insignia", "Spacegate military insignia", "Spacegate diplomat's insignia", "Spacegate emergency disintegrator", "Spacegate Initiative tattoo unit", "alien sandwich", "glitched malware", "Spant eggs", "portable Spacegate (open)", "New-You Club Membership Form", "Daily Affirmation: Always be Collecting", "Daily Affirmation: Think Win-Lose", "Daily Affirmation: Be Superficially interested", "Daily Affirmation: Adapt to Change Eventually", "Daily Affirmation: Be a Mind Master", "Daily Affirmation: Work For Hours a Week", "Daily Affirmation: Keep Free Hate in your Heart", "Affirmation Cookie", "License To Kill", "Thwaitgold bug statuette", "Victor's Spoils", "Threatening Missive", "Targeted Plague Vector", "suspicious package", "Kremlin's Greatest Briefcase", "basic martini", "improved martini", "splendid martini", "exploding cigar", "can of Minions-Be-Gone", "golden tattoo gun", "golden gun", "golden gum", "tiny plastic golden gundam", "License to Chill", "Celsius 233", "Celsius 233 (singed)", "Lazenby's Life Lesson", "LI-11 Motor Pool voucher", "Asdon Martin keyfob (on ring)", "L.I.M.P. Stock Certificate", "Dust bunny", "Pocket Meteor Guide", "Pocket Meteor Guide (well-thumbed)", "Meteorite-Ade", "meteoreo", "meadeorite", "metal meteoroid", "meteortarboard", "meteorite guard", "meteorb", "asteroid belt", "meteorthopedic shoes", "shooting morning star", "cute meteoroid", "meteor shower cap", "Thwaitgold time fly statuette", "perfectly fair coin", "Horsery contract", "corked genie bottle", "genie bottle", "blessed rustproof +2 gray dragon scale mail", "magical pony: Dusk Shiny", "magical pony: Shutterfly", "magical pony: Pearjack", "magical pony: Uniquity", "magical pony: Rosey Cake", "magical pony: Spectrum Dash", "pocket wish", "dropped scrap of paper", "hunk of granite", "shovelful of dirt", "xo-skeleton-in-a-box", "exo-xo-skeleton-skeleton", "X", "O", "DUFRESNE Suds", "mafia pinky ring", "flask of port", "contract enforcement stick", "Hide-rox&trade; cookie", "jug of booze", "pair of candy glasses", "temporary X tattoos", "glyph of athleticism", "pair of scissors", "new habit", "bridge truss", "pearl necklace", "amorphous blob", "giant X", "giant O", "giant amorphous blob", "protection stick", "roll of meat", "mafia thumb ring", "cocoa chondrule", "mafia middle finger ring", "steel drivin' hammer", "little piece of steel", "mafia pointer finger ring", "worksite credentials", "negotiatin' hammer", "pantogram", "portable pantogram", "pantogram pants", "mafia wedding ring", "mafia organizer badge", "mafia filofax", "transparent nog", "unfinished fruitcake", "black and white cracker", "neg grog", "half double fruitcake", "hushed puppy", "muffled muffuletta", "shushed potatoes", "tiny plastic mime functionary", "tiny plastic mime scientist", "tiny plastic mime soldier", "tiny plastic mime executive", "tiny plastic The Silent Nightmare", "locked mumming trunk", "mumming trunk", "temperance whiskey", "cursed wishbone", "Racisto Ruidoso", "earthenware muffin tin", "bran muffin", "blueberry muffin", "silent A", "silent B", "silent C", "silent D", "silent E", "silent F", "silent G", "silent H", "silent I", "silent J", "silent K", "silent L", "silent M", "silent N", "silent O", "silent P", "silent Q", "silent R", "silent S", "silent T", "silent U", "silent V", "silent W", "silent X", "silent Y", "silent Z", "crystalline cheer", "anti-earplugs", "warehouse key", "mime pocket probe", "stale cheer wine", "stale Cheer-E-Os", "cheer-o-gram", "cheerful antler hat", "cheerful Crimbo sweater", "cheerful pajama pants", "The Journal of Mime Science Vol. 1", "The Journal of Mime Science Vol. 1 (used)", "The Journal of Mime Science Vol. 2", "The Journal of Mime Science Vol. 2 (used)", "The Journal of Mime Science Vol. 3", "The Journal of Mime Science Vol. 3 (used)", "The Journal of Mime Science Vol. 4", "The Journal of Mime Science Vol. 4 (used)", "The Journal of Mime Science Vol. 5", "The Journal of Mime Science Vol. 5 (used)", "The Journal of Mime Science Vol. 6", "The Journal of Mime Science Vol. 6 (used)", "mime eraser", "executive mime flask", "nega-mushroom", "nega-mushroom wine", "Cheer-Up soda", "mime army rations", "mime army wine", "mime army superserum", "mime army camouflage kit", "miming beret", "miming shirt", "miming corduroys", "miming boots", "miming gloves", "God Lobster Egg", "donated booze", "donated food", "donated candy", "digital honeypot", "mime-proof sunglasses", "mime army insignia (infantry)", "mime army insignia (intelligence)", "mime army insignia (espionage)", "mime army insignia (pyrotechnics)", "mime army insignia (cryonics)", "mime army insignia (psychological warfare)", "mime army insignia (sanitation)", "mime army insignia (morale)", "mime army infiltration glove", "mime army shotglass", "mime army challenge coin", "cheer extractor", "kerosene-soaked skip", "fireproof skip lid", "extra-toasted half sandwich", "mulled hobo wine", "burning newspaper", "burning paper hat", "burning cape", "burning paper slippers", "burning paper jorts", "burning paper crane", "January's Garbage Tote (unopened)", "January's Garbage Tote", "deceased crimbo tree", "broken champagne bottle", "tinsel tights", "wad of used tape", "silent nightlight", "sweetened reindeer fat", "Good 'n' Quiet", "hot button candy", "makeshift garbage shirt", "novelty monorail ticket", "ancient pills", "furry pill", "beefy pill", "excitement pill", "vitamin G pill", "lucky-ish pill", "dieting pill", "Clan Carnival Game", "How To Get Bigger Without Really Trying", "Illustrated Mating Rituals of the Gallapagos", "Convincing People You Can See The Future", "Love Potions and the Wizards who Mix Them", "They'll Love You In Rhinestones", "Silly Little Love Song", "genie's turbane", "genie's scimitar", "genie's pants", "genie's bracers", "psychic's circlet", "psychic's crystal ball", "psychic's pslacks", "psychic's amulet", "heart-shaped candy whetstone", "Swedish massage fish", "Third Base", "Bustle Hustler", "Fabiotion", "Bettie page", "tonic o' Banderas", "heather graham cracker", "Lolsipop", "heart cozy", "eaves droppers", "personal graffiti kit", "Mysterious Red Box", "Mysterious Green Box", "Mysterious Blue Box", "Mysterious Black Box", "rainbow jellybean", "mystery lollipop", "Love Potion #XYZ", "rhinestone", "1,960 pok&eacute;dollar bill", "metandienone", "riboflavin", "bronze", "piracetam", "ultracalcium", "ginseng", "Team Avarice cap", "Team Sloth cap", "Team Wrath cap", "Mu cap", "Thwaitgold metabug statuette", "Pok&eacute;fam Guide to Capturing All of Them", "packet of tall grass seeds", "Pok&eacute;-Gro fertilizer", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "Glum berry", "Egnaro berry", "Sitrep berry", "Nadsat berry", "Jamocha berry", "Tapioc berry", "Snarf berry", "Keese berry", "luck incense", "shell bell", "muscle band", "amulet coin", "razor fang", "smoke ball", "green rocket", "magnificent oyster egg", "brilliant oyster egg", "glistening oyster egg", "scintillating oyster egg", "pearlescent oyster egg", "lustrous oyster egg", "gleaming oyster egg", "FantasyRealm membership packet", "FantasyRealm guest pass", "FantasyRealm G. E. M.", "Rubee&trade;", "FantasyRealm Warrior's Helm", "FantasyRealm Mage's Hat", "FantasyRealm Rogue's Mask", "lump of bauxite", "&quot;Remember the Trees&quot; Shirt", "FantasyRealm key", "plump purple mushroom", "tainted marshmallow", "Chewsick Copperbottom's notes", "LyleCo premium pickaxe", "LyleCo premium rope", "My First Art of War", "dragon aluminum ore", "faerie dust", "poisoned druidic s'more", "druidic orb", "to-go brew", "flask of holy water", "universal antivenin", "LyleCo premium monocle", "LyleCo premium magnifying glass", "FantasyRealm tattoo kit", "LyleCo Contractor's Manual", "FantasyRealm turkey leg", "FantasyRealm mead", "nasty haunch", "Cheswick Copperbottom's compass", "arrest warrant", "hero's skull", "grolblin rum", "druidic s'more", "sachet of strange powder", "mourning wine", "sanctified cola", "map to the Towering Mountains", "map to the Mystic Wood", "map to the Putrid Swamp", "map to the Cursed Village", "map to the Sprawling Cemetery", "denastified haunch", "bad rum and good cola", "Potion of Heroism", "leggings of the Spider Queen", "Master Thief's utility belt", "Duke Vampire's regal cloak", "Dragonscale breastplate", "belt of Ogrekind", "The Ghoul King's ghoulottes", "nozzle of the Phoenix", "the Archwizard's briefs", "the Ley Incursion's waist", "shield of the Skeleton Lord", "ring of the Skeleton Lord", "scepter of the Skeleton Lord", "deadfall branch", "Staff of Kitchen Royalty", "charged druidic orb", "dragon slaying sword", "notarized arrest warrant", "two meat muck", "chocolate Ogre Chieftain", "chocolate &quot;Phoenix&quot;", "chocolate Spider Queen", "hipster cocktail", "God Lobster's Scepter", "God Lobster's Ring", "God Lobster's Rod", "God Lobster's Robe", "God Lobster's Crown", "Dish of Clarified Butter", "G", "Garland of Greatness", "gattoo", "A-Boo glue", "glued A-Boo clue", "crude oil congealer", "good guava", "gin and ginger", "Thwaitgold chigger statuette", "gaseous gravy", "SongBoom&trade; BoomBox", "SongBoom&trade; BoomBox Box", "A Guide to Safari", "Shielding Potion", "Punching Potion", "Special Seasoning", "Nightmare Fuel", "Gathered Meat-Clip", "Bastille Battalion control rig crate", "Bastille Battalion control rig", "Brutal brogues", "Draftsman's driving gloves", "Nouveau nosering", "sharkfin gumbo", "boiling broth", "interrogative elixir", "Bastille Battalion Fondue Trophy", "Bastille Battalion tattoo kit", "Bastille Battalion cheese wheel", "Bastille Battalion control rig loaner voucher", "kitten burglar", "burglar/sleep mask", "Thwaitgold masked hunter statuette", "Neverending Party invitation envelope", "Neverending Party guest pass", "PARTY HARD T-shirt", "Neverending Party favor", "deluxe Neverending Party favor", "gas can", "Middle of the Road&trade; brand whiskey", "neverending wallet chain", "pentagram bandana", "gold skull ring", "electronics kit", "PB&J with the crusts cut off", "dorky glasses", "ponytail clip", "paint palette", "unremarkable duffel bag", "Purple Beast energy drink", "cosmetic football", "shoe ad T-shirt", "pump-up high-tops", "runproof mascara", "very small red dress", "noticeable pumps", "surprisingly capacious handbag", "everfull glass", "van key", "jam band bootleg", "denim jacket", "ratty knitted cap", "intimidating chainsaw", "party beer bomb", "sweet party mix", "party balloon", "fancy party pants", "party whip", "Party Planning on a Budget", "TRIO cup of beer", "party platter for one", "Party-in-a-Can&trade;", "party pup", "party crasher", "Living to Drink, Drinking to Live", "Party Tattoo&trade; gift certificate", "party mouse hat", "latte lovers member's mug", "latte lovers club card", "voter registration form", "&quot;I Voted!&quot; sticker", "absentee voter ballot", "snake skin", "snakeskin thighboots", "snakeskin cowboy hat", "snakeskin jacket", "black slime glob", "green slime glob", "orange slime glob", "slime waders", "slime fedora", "slime knuckles", "government requisition form", "government-issued slacks", "government-issued eyeshade", "government-issued necktie", "mutant arm", "mutant legs", "mutant crown", "ghostly ectoplasm", "haunted orange", "haunted bottle of vodka", "haunted pizza", "haunted martini", "haunted cherry pie", "haunted eggnog", "glob of undifferentiated tissue", "haunted Hell ramen", "haunted gimlet", "twice-haunted screwdriver", "primitive candy cane", "runny fermented egg", "oldcake", "traditional Crimbo cookie", "tiny plastic wild beaver", "tiny plastic reindeer", "tiny plastic Caf&eacute; Elf", "tiny plastic orphan", "tiny plastic Abuela Crimbo", "yule pup", "Braindeer", "Crimbo dog sweater", "pristine walrus tusk", "thick walrus blubber", "Staff of Frozen Lard", "tiny bomb", "plastic bazooka", "mooseflank", "grilled mooseflank", "moosemeat pie", "balanced antler", "portable dam", "beavermouth", "beaver punch (papaya)", "beaver punch (peach)", "beaver punch (cherry)", "antique Canadian lantern", "muskox-skin cap", "Boxing Day care package", "glass of raw eggs", "punch-drunk punch", "body spradium", "bauxite beret", "bauxite boxers", "bauxite bow-tie", "Boxing Day Pass", "Kramco Industries packing carton", "Kramco Sausage-o-Matic&trade;", "magical sausage casing", "magical sausage", "red-hot sausage fork", "bag of sausage links", "sausage golem", "jar of magical relish", "Toyleporter", "antique beer", "yule gruel", "hot watered rum", "bottle of Crimbognac", "Crimboysters Rockefeller", "Crimbeau de toilette", "Crimbo candle", "Carol of the Bulls", "Carol of the Bulls (used)", "Carol of the Hells", "Carol of the Hells (used)", "Carol of the Thrills", "Carol of the Thrills (used)", "Crimbolex watch", "Crimbo tattoo kit", "hand-knitted Crimbo socks", "chalk chlamys", "chalk chain", "chalk chalice", "chalk chinos", "chalk chapeau", "chalk choker", "chalk chunks", "candy chalk", "marble maebari", "marble mantle", "marble magnet", "marble mignonette bowl", "marble medallion", "marble mariachi hat", "marble molecules", "Mallomarbles", "paraffin punching bag", "paraffin pith helmet", "paraffin poncho", "paraffin pendant", "paraffin palazzos", "paraffin pseudoaccordion", "paraffin pieces", "Para-Pop", "terra cotta truss", "terra cotta trousers", "terra cotta tongs", "terra cotta train", "terra cotta tie tack", "terra cotta tambourine", "terra cotta tidbits", "terra panna cotta", "velour voulge", "velour vambraces", "velour veil", "velour viscometer", "velour valise", "velour vaqueros", "velour veneer", "Velougats&trade;", "stained glass suspenders", "stained glass shield", "stained glass stetson", "stained glass spectacles", "stained glass shiv", "stained glass serape", "stained glass shards", "stained hard candy", "loofah lumberjack's hat", "loofah lei", "loofah lederhosen", "loofah ladle", "loofah legwarmers", "loofah lavalier", "loofah lumps", "chocolate-covered loofah", "flagstone flag", "flagstone flail", "flagstone flip-flops", "flagstone fez", "flagstone fleece", "flagstone fringe", "flagstone flagments", "Flag by the Foot&trade;", "elf sleeper agent", "red-and-green microcamera", "cobbled-together Meat detector", "tin thermos of chai", "prototype stimulant", "tailored vest", "sew-on bandage", "really nice net", "elf army poncho", "elf army field rations", "gingernade", "discarded bowtie", "martiny", "tryptophan dart", "licorice snake", "virgin jello shot", "mutated candy lump", "government-issued candy", "Pneumo bar", "mint condition Lil' Doctor&trade; bag", "Lil' Doctor&trade; bag", "blood bag", "bloodstick", "bottle of Sanguiovese", "actual blood sausage", "mulled blood", "blood snowcone", "Red Russian", "blood roll-up", "dusty bottle of blood", "blood-soaked sponge cake", "vampagne", "plain snowcone", "Booke of Vampyric Knowledge", "white money bag", "red money bag", "blue money bag", "Thwaitgold mosquito statuette", "bucket of ancient Vampyre blood", "blood knife", "PirateRealm membership packet", "PirateRealm guest pass", "PirateRealm eyepatch", "bloody harpoon", "cursed compass", "ancient skull key", "curious anemometer", "Red Roger's flag", "Glass Jack's spyglass", "recursed compass", "tomb-opener", "Red Roger's map", "crabsicle", "melty plastic grenade", "bottle of dark rhum", "bottle of extra-dark rhum", "bottle of super-extra-dark rhum", "pirate shaving cream", "conquistador's breastplate", "pirate pantaloons", "[glitch season reward name]", "signal fragment", "windicle", "pirate radio ring", "Island Drinkin', a Tiki Mixology Odyssey", "pineapple slab", "hibiscus petal", "huge mint leaf", "cocoa of youth", "oversized ice molecule", "Red Roger's reliquary", "Red Roger's red right hand", "Red Roger's red left hand", "Red Roger's red right foot", "Red Roger's red left foot", "Red Roger's skull", "pewter shavings", "Red Roger tattoo kit", "PirateRealm fun-a-log", "plush sea serpent", "pirate fork", "Scurvy and Sobriety Prevention", "lucky gold ring", "piratical blunderbuss", "PirateRealm party hat", "Island Landslide", "Island Thunderstorm", "Island Hurricane", "Skull Punch", "Electric Punch", "Smuggler's Punch", "Scorpion Bowl", "Turtle Bowl", "Cobra Bowl", "vampyric cloake pattern", "vampyric cloake", "plastic pirate hat", "one piece of bubble gum", "arcanoferric housing", "intact medium-wave antenna", "18-picohertz resonator crystal", "blown-out speaker cone", "overloaded short-pulse transistor", "Fourth of May Cosplay Saber kit", "Fourth of May Cosplay Saber", "ring", "Thwaitgold nymph statuette", "hewn moon-rune spoon", "cartoon harpoon", "rune-strewn spoon cocoon", "Beach Comb Box", "Beach Comb", "grain of sand", "small pile of sand", "pile of sand", "large pile of sand", "empty hourglass", "hourglass", "etched hourglass", "magenta seashell", "cyan seashell", "gray seashell", "green seashell", "yellow seashell", "bunch of sea grapes", "bottle of sea wine", "kelp", "driftwood hat", "driftwood pants", "driftwood bracelet", "waders", "spearfish fishing spear", "lucky rabbitfish fin", "piece of coral", "piece of driftwood", "cursed pirate cutlass", "cursed tricorn hat", "cursed swash buckle", "meteorite fragment", "meteorite earring", "meteorite necklace", "meteorite ring", "Finnish Fish", "cursed chocolate doubloon", "driftwood beach comb", "Distant Woods Getaway Brochure", "stick of firewood", "whittled tiara", "whittled shorts", "whittled flail", "whittled wand", "whittled flute", "whittled bear figurine", "whittled owl figurine", "whittled fox figurine", "whittled walking stick", "campfire hot dog", "campfire baked potato", "campfire s'more", "campfire beans", "campfire stew", "campfire coffee", "leftover chocolate bar", "rare Meat isotope", "burnt stick", "bundle of firewood", "campfire smoke", "Murgatroyd diode", "signal receiver", "space shield", "signal jammer", "low-pressure oxygen tank", "Thwaitgold bombardier beetle statuette", "space chowder", "space wine", "The Imploded World", "packaged Pocket Professor", "Pocket Professor memory chip", "Law of Averages", "Unopened Eight Days a Week Pill Keeper", "Eight Days a Week Pill Keeper", "unopened diabolic pizza cube box", "diabolic pizza cube", "diabolic pizza", "bu&ntilde;uelos Jaliscos", "flan del mar", "Baja sopapilla", "tiny plastic Mer-kin baker", "tiny plastic sea elf", "tiny plastic yuleviathan", "tiny plastic dolphin &quot;orphan&quot;", "tiny plastic Dolph Bossin", "red-spotted snapper roe", "mana-coated yams", "mana-basted tofurkey leg", "mana-fortified cranberry sauce", "mana-stuffed herbal stuffing", "human musk", "patch of extra-warm fur", "industrial lubricant", "unfinished pleasure", "vial of humanoid growth hormone", "a bug's lymph", "organic potpourri", "boot flask", "infernal snowball", "powdered madness", "fish sauce", "guffin", "Shantix&trade;", "goodberry", "non-Euclidean angle", "peppermint syrup", "Mer-kin eyedrops", "extra-strength goo", "envelope full of Meat", "livid energy", "micronova", "beggin' cologne", "oxygenated eggnog helmet", "hand-knitted diving booties", "peppermint harpoon gun", "concentrated fish broth", "liquid SONAR", "map to Dolph Bossin's hideout", "Dolph Bossin's charity note", "Dolph Bossin's Crimbo hat", "The Spirit of Giving", "The Spirit of Giving (used)", "Crimbo Factory surprise box", "soggy gingerbread chunk", "salty gumdrop", "ribbon candy ascot", "moist Crimbo spices", "intact anemone spike", "anemoney clip", "runny icing", "super-sweet fish goo (spoiled)", "icing poncho", "Mer-kin cookiestove", "glob of salty molasses", "Mer-kin rollpin", "personalizable gingerbread cookie", "tinsel fin", "bowl of mernudo", "fishelada", "ojo de pez burrito", "waterlogged wood", "waterlogged cloth", "waterlogged stuffing", "waterlogged leather", "waterlogged metal", "antique nutcracker hat", "antique nutcracker waistcoat", "antique nutcracker pants", "antique nutcracker boots", "antique nutcracker sword", "antique nutcracker drumstick", "antique nutcracker beard", "antique nutcracker cape", "antique nutcracker epaulets", "antique nutcracker figurine", "salt plum", "peppermint eel sauce", "green and red bean", "kelp-holly gun", "Yuleviathan necklace", "peppermint spine", "soggy elf shoes", "Crimbylow-rise jeans", "kelp-holly drape", "Staff of the Peppermint Twist", "tempura green and red bean", "salt plum sake", "pressurized potion of possessiveness", "candied almond", "tiny handful of mixed nuts", "nutcracking pliers", "Retrospecs try-at-home kit", "Retrospecs", "unopened Bird-a-Day calendar", "Bird-a-Day calendar", "mint-in-box Powerful Glove", "Powerful Glove", "enhanced signal receiver", "status cymbal", "Drip harness", "drippy truncheon", "Driplet", "drippy snail shell", "drippy nugget", "glass of drippy wine", "drippy caviar", "drippy plum(?)", "drippy stake", "The Eye of the Thing in the Basement", "drippy khakis", "drippy shield", "The Fingernail of the Thing in the Basement", "coin", "mushroom", "deluxe mushroom", "super deluxe mushroom", "fizzy soda", "healthy juice", "hammer", "heavy hammer", "[10462]fire flower", "bonfire flower", "work boots", "fancy boots", "cape", "back shell", "spiky back shell", "power pants", "Thwaitgold buzzy beetle statuette", "Plumber's Union Handbook", "bony back shell", "frosty button", "blooper ink", "red coin", "rubber doll head", "rubber doll body", "plastic doll arms", "plastic doll legs", "rubber baby doll", "Better Shrooms and Gardens catalog", "packet of mushroom spores", "free-range mushroom", "plump free-range mushroom", "bulky free-range mushroom", "giant free-range mushroom", "immense free-range mushroom", "colossal free-range mushroom", "mushroom filet", "mushroom slab", "mushroom tea", "mushroom whiskey", "mushroom cap", "mushroom shield", "mushroom pants", "mushroom badge", "house-sized mushroom", "pristine piranha seed", "plastic piranha pot", "piranha pollen", "red plumber's boots", "sinistral homunculus", "rusty kettle bell", "glued-together crystal ball", "martini dregs", "flickering flashlight", "crumbling rabbit's foot", "outmoded fidget toy", "flimsy ski pole", "discarded finger painting", "old pizza box", "chipped coffee mug", "Left-Hand Man action figure", "drippy seed", "drippy grub", "drippy bezoar", "Drip Institute petri dish", "drippy ichor", "drippy enzyme", "drippy salt", "drippy pigment", "drippy bromide", "drippy flux", "drippy stein", "drippy pilsner", "drippy staff", "drippy orb", "lustrous drippy orb", "gory drippy orb", "annealed drippy orb", "Guzzlr application", "Guzzlr tablet", "Guzzlr cocktail set", "Guzzlrbuck", "Guzzlr hat", "Guzzlr shoes", "Guzzlr pants", "Guzzlr souvenir stein", "Guzzlr tattoo kit", "Ghiaccio Colada", "Sourfinger", "Nog-on-the-Cob", "Steamboat", "Buttery Boy", "Never Don't Stop Not Striving", "clown car key", "batting cage key", "aqu&iacute;", "knob labinet key", "weremoose key", "peg key", "kekekey", "rabbit's foot key", "knob shaft skate key", "ice key", "anchovy can key", "cactus key", "f'c'le sh'c'le k'y", "treasure chest key", "demonic key", "key sausage", "knob treasury key", "scrap metal key", "black rose key", "music box key", "actual skeleton key", "deep-fried key", "discarded bike lock key", "Thwaitgold keyhole spider statuette", "Manual of Lock Picking", "marshroom", "bag of Iunion stones", "Iunion Crown", "drippy candy bar", "salty drippy candy bar", "writhing drippy candy bar", "gooey drippy candy bar", "baby camelCalf", "dromedary drinking helmet", "packaged SpinMaster&trade; lathe", "SpinMaster&trade; lathe", "flimsy hardwood scraps", "birch battery", "ebony epee", "weeping willow wand", "beechwood blowgun", "maple magnet", "Dreadsylvanian hemlock", "hemlock helm", "sweaty balsam", "balsam barrel", "ancient redwood", "redwood rain stick", "purpleheart logs", "purpleheart &quot;pants&quot;", "wormwood stick", "wormwood wedding ring", "Dripwood slab", "drippy diadem", "Thwaitgold slug statuette", "ert grey goo ring", "fistful of wood shavings", "Yeg's Motel ashtray", "Yeg's Motel alarm clock", "Yeg's Motel toothbrush", "Yeg's Motel hand soap", "Yeg's Motel sewing kit", "Yeg's Motel pillow mint", "Yeg's Motel disposable razor", "Yeg's Motel mouthwash", "Yeg's Motel shower cap", "Yeg's Motel bathrobe", "Yeg's Motel slippers", "Yeg's Motel stationery", "Yeg's Motel minibar key", "sizzling desk bell", "frost-rimed desk bell", "uncanny desk bell", "nasty desk bell", "greasy desk bell", "fancy chess set", "onyx king", "onyx queen", "onyx rook", "onyx bishop", "onyx knight", "onyx pawn", "alabaster king", "alabaster queen", "alabaster rook", "alabaster bishop", "alabaster knight", "alabaster pawn", "bagged Cargo Cultist Shorts", "Cargo Cultist Shorts", "complicated device", "flask of moonshine", "sea-worn candlestick", "Universal Seasoning", "null-day exploit", "flame orb", "chocolate chip muffin", "Comprehensive Cartographic Compendium", "Comprehensive Cartographic Compendium (well-read)", "packaged knock-off retro superhero cape", "unwrapped knock-off retro superhero cape", "box o' ghosts", "gregarious ghostling", "grinning ghostling", "greedy ghostling", "subscription cocoa dispenser", "fortifying hot cocoa", "boiling hot cocoa", "cool hot cocoa", "overly-fancy hot cocoa", "hot cocoa au beurre", "hot cocoa with rainbow marshmallows", "Book of Old-Timey Carols", "Crimbo smile", "SalesCo sample kit", "candy harmonica", "powdered powdered sugar", "multi-level marzipan", "tiny plastic Crimbo caroler", "tiny plastic multi-level marketer", "tiny plastic Crimbo cheer", "tiny plastic Mirth", "tiny plastic Penny", "overflowing gift basket", "personalized wassail stein", "tabletop candy dispenser", "neck wreath", "shining star cap", "nativity shorts", "myrrh pouch", "frankincenser", "gilded trumpet", "&quot;reusable&quot; grocery bag", "cardboard wine carrier", "antique candy bucket", "prescription teeth whitener", "imported lemon lozenge", "hermedisiac cologne", "government food shipment", "government booze shipment", "government candy shipment", "Crimbo Cheer tattoo kit", "Crimbo Carol tattoo kit", "Crimbo Commerce tattoo kit", "food drive button", "booze drive button", "candy drive button", "food mailing list", "booze mailing list", "candy mailing list", "fruit bat", "tinsel orb", "snowpack", "Satan hat", "Crimbo stockings", "poncho de azucar", "The Night Before Crimbo, Ch. 1", "The Night Before Crimbo, Ch. 1 (used)", "The Night Before Crimbo, Ch. 2", "The Night Before Crimbo, Ch. 2 (used)", "The Night Before Crimbo, Ch. 3", "The Night Before Crimbo, Ch. 3 (used)", "The Night Before Crimbo, Ch. 4", "The Night Before Crimbo, Ch. 4 (used)", "The Night Before Crimbo, Ch. 5", "The Night Before Crimbo, Ch. 5 (used)", "The Night Before Crimbo, Ch. 6", "The Night Before Crimbo, Ch. 6 (used)", "stuffed red and green pepper (stale)", "cranberry margarita (brackish)", "fuzzy polar bear ears", "tiny glowing red nose", "miniature goose mask", "barrel-aged eggnog", "hand-crafted candy cane", "drive-thru burger", "Boulevardier cocktail", "Hotwire&trade; brand candy rope", "bowl full of jelly", "Eye and a Twist", "Chubby and Plump bar", "digibritches", "packaged miniature crystal ball", "miniature crystal ball", "fresh can of paint", "fresh coat of paint", "emotion chip", "spinal-fluid-covered emotion chip", "robo-battery", "Thwaitgold listening bug statuette", "power seed", "potted power plant", "battery (AAA)", "battery (AA)", "battery (D)", "battery (9-Volt)", "battery (lantern)", "battery (car)", "cryptocloak", "green marshmallow", "marshmallow bomb", "packaged backup camera", "backup camera", "shortest-order cook", "blue plate", "short beer", "short stack of pancakes", "short stick of butter", "short glass of water", "short white", "Thwaitgold quantum bug statuette", "quantum of familiar", "familiar scrapbook", "packaged familiar scrapbook", "clan underground fireworks shop", "fedora-mounted fountain", "sombrero-mounted sparkler", "porkpie-mounted popper", "yellow rocket", "blue rocket", "red rocket", "fire crackers", "Arr, M80", "Catherine Wheel", "rocket boots", "oversized sparkler", "Our Daily Candles&trade; order form", "Scent of a Human&trade; candle", "The Beast Within&trade; candle", "Salsa Caliente&trade; candle", "Smoldering Clover&trade; candle", "Napalm In The Morning&trade; candle", "extra-large utility candle", "runed taper candle", "novelty sparkling candle", "Abracandalabra", "extra-wide head candle", "natural magick candle", "rainbow glitter candle", "banana candle", "ear candle", "votive of confidence", "water candle", "B. L. A. R. T.", "Thwaitgold fire beetle statuette", "rusty empty nacho cheese can", "literal bucket hat", "rainproof barrel caulk", "pump grease", "packaged industrial fire extinguisher", "industrial fire extinguisher", "The Nose Knows, A Guide to Smells", "The Nose Knows, A Guide to Smells (read)", "1950 Vampire Vintner wine", "bottled Vampire Vintner", "French-Transylvanian Dictionary", "packaged Daylight Shavings Helmet", "Daylight Shavings Helmet", "eggwater", "bread man", "plain candy cane", "flour cookie", "tiny plastic food lab", "tiny plastic nog lab", "tiny plastic chem lab", "tiny plastic primary lab", "tiny plastic Cheer Core", "packaged cold medicine cabinet", "cold medicine cabinet", "ice crown", "frozen jeans", "ice wrap", "frozen tofu pop", "bowl of prescription candy", "fishcake", "bone broth", "star pop", "Doc's Fortifying Wine", "Doc's Smartifying Wine", "Doc's Limbering Wine", "Doc's Medical-Grade Wine", "Homebodyl&trade;", "Extrovermectin&trade;", "Breathitin&trade;", "Fleshazole&trade;", "anti-burn cream", "anti-freeze cream", "anti-goosebump cream", "anti-odor cream", "anti-creep cream", "anti-pain cream", "Doc's Special Reserve Wine", "bread pie", "clear Russian", "zero-trust tanktop", "white Crimbo ball", "black Crimbo ball", "gooified animal matter", "gooified vegetable matter", "gooified mineral matter", "[experimental crimbo food]", "[experimental crimbo booze]", "[experimental crimbo spleen]", "goo magnet", "cozy scarf", "huge Crimbo cookie", "fleshy putty", "third ear", "festive egg sac", "poisonsettia", "peppermint-scented socks", "the Crymbich Manuscript", "projectile chemistry set", "depleted Crimbonium football helmet", "synthetic rock", "&quot;caramel&quot; orange", "self-repairing earmuffs", "carnivorous potted plant", "universal biscuit", "yule hatchet", "potato alarm clock", "lab-grown meat", "golden fleece", "boxed gumball machine", "cloning kit", "electric pants", "can of mixed everything", "Site Alpha ID badge", "the Crymbich Manuscript (used)", "meatball", "cloned monster", "meatball machine", "refurbished air fryer", "fried air", "11-leaf clover", "[10882]carton of astral energy drinks", "[10883]astral energy drink", "mint condition magnifying glass", "cursed magnifying glass", "void lager", "void burger", "void stone", "void shard", "undrilled cosmic bowling ball", "cosmic bowling ball", "combat lover's locket lockbox", "combat lover's locket", "Thwaitgold protozoa statuette", "grey gosling", "grey down vest", "trojan horseshoe", "undamaged Unbreakable Umbrella", "unbreakable umbrella", "MayDay&trade; contract", "MayDay&trade; supply package", "emergency glowstick", "survival knife", "crank-powered radio on a lanyard", "headlamp", "thermal blanket", "atlas of local maps", "spare battery", "space blanket", "single-use dust mask", "gaffer's tape", "20-lb can of rice and beans", "bar of freeze-dried water", "expired MRE", "cool mint precipice bar", "carrot cake precipice bar", "The Big Book of Every Skill", "Thwaitgold harvestman statuette", "packaged June cleaver", "June cleaver", "Dad's brandy", "teacher's pen", "fire-roasted lake trout", "guilty sprout", "mother's necklace", "trampled ticket stub", "savings bond", "designer sweatpants (new old stock)", "designer sweatpants", "sweat-ade", "unopened tiny stillsuit", "tiny stillsuit", "thick dinosaur leather", "shiny dinosaur scale", "pristine dinosaur feather", "nasty dinosaur spike", "pterodactyl rifle", "birdseed hat", "flatusaur gasmask", "dinosaur dart", "Dino DNAde&trade;", "dinosaur repellent", "camouflage vest", "Dinodollar", "valuable dinosaur droppings", "dinosaur pheromone kit", "awkward dinosaur research harness", "reflective vest", "stuffed dinosaur", "Thwaitgold mosquito-in-amber statuette", "packaged Jurassic Parka", "Jurassic Parka", "boxed autumn-aton", "autumn-aton", "autumn leaf", "AutumnFest ale", "autumn sweater-weather sweater", "autumn debris shield", "autumn-spice donut", "autumn dollar", "autumn leaf pendant", "autumn breeze", "autumn years wisdom", "familiar-in-the-middle wrapper", "Oopsie IPA", "mummified entombed cookbookbat", "Yeast of Boris", "St. Sneaky Pete's Whey", "Vegetable of Jarlsberg", "ratatouille de Jarlsberg", "Jarlsberg's vegetable soup", "roasted vegetable of Jarlsberg", "St. Pete's sneaky smoothie", "Pete's wiley whey bar", "Pete's rich ricotta", "Boris's beer", "honey bun of Boris", "Boris's bread", "Recipe of Before Yore: ratatouille de Jarlsberg", "Recipe of Before Yore: Jarlsberg's vegetable soup", "Recipe of Before Yore: roasted vegetable of J.", "Recipe of Before Yore: St. Pete's sneaky smoothie", "Recipe of Before Yore: Pete's wily whey bar", "Recipe of Before Yore: Pete's rich ricotta", "Recipe of Before Yore: Boris's beer", "Recipe of Before Yore: honey bun of Boris", "Recipe of Before Yore: Boris's bread", "baked veggie ricotta casserole", "plain calzone", "roasted vegetable focaccia", "Pizza of Legend", "Calzone of Legend", "Recipe of Before Yore: Calzone of Legend", "Recipe of Before Yore: Pizza of Legend", "Recipe of Before Yore: roasted vegetable focaccia", "Recipe of Before Yore: plain calzone", "Recipe of Before Yore: baked veggie ricotta", "cookbookbat book", "Recipe of Before Yore: Deep Dish of Legend", "Deep Dish of Legend", "deed to Oliver's Place", "drink chit", "government per-diem", "prohie's hat", "imported taffy", "Charleston shoes", "booze bindle", "rare oboe", "bullet necklace", "swamp haunch", "gator shades", "milk cap", "Charleston Choo-Choo", "Velvet Veil", "Marltini", "Strong, Silent Type", "Mysterious Stranger", "Champagne Shimmy", "the Sot's parcel", "ceramic cestus", "ceramic centurion shield", "ceramic celery grater", "ceramic celsiturometer", "ceramic cerecloth belt", "ceramic cenobite's robe", "ceramic scree", "extra-hard jawbreaker", "chiffon chevrons", "chiffon chapeau", "chiffon chamberpot", "chiffon chemise", "chiffon chakram", "chiffon chaps", "chiffon carbage", "chiffon lemon", "chocomotive", "freightcake", "cabooze", "tiny plastic caboose", "tiny plastic passenger car", "tiny plastic dining car", "tiny plastic coal car", "tiny plastic locomotive", "packaged model train set", "model train set", "Crimbo training manual", "Abuela Crimbo's special magnet", "Trainbot radar monocle", "pile of Trainbot parts", "Trainbot circuitry", "Trainbot tubing", "Trainbot plating", "Trainbot optics", "Trainbot servomotors", "Trainbot linkages", "ping-pong paddle", "ping-pong ball", "Trainbot harness", "portable ping-pong table", "Crimbo train emergency brake", "Trainbot autoassembly module", "head-mounted Trainbot", "leg-mounted Trainbots", "shoulder-mounted Trainbot", "cinnamon machine oil", "Crimbo crystal shards", "dregs of a Crimbo cocktail", "lost elf luggage", "Trainbot luggage hook", "honey-drenched ham slice", "mostly-empty bottle of cookie wine", "Crimbo food scraps", "white arm towel", "automatic wine thief", "silver table-scraper", "Trainbot slag", "industrially-crushed ice", "steamed oyster", "really nice lump of coal", "deactivated mini-Trainbot", "portable steam unit", "crystal Crimbo goblet", "crystal Crimbo platter", "Crimbosmopolitan", "Crimbo dinner", "overloaded Yule battery", "train whistle", "The Superconductor's CPU", "unoccupied sheep suit", "half-height cigar", "grubby wool", "grubby wool hat", "grubby wool scarf", "grubby wool trousers", "grubby wool gloves", "grubby wool beerwarmer", "nice warm beer", "grubby woolball", "Rock Garden Guide", "packet of rock seeds", "groveling gravel", "fruity pebble", "lodestone", "milestone", "bolder boulder", "molehill mountain", "whet stone", "hard rock", "strange stalagmite", "chocolate covered ping-pong ball", "pixel bread", "pixel whiskey", "pixel rock", "S.I.T. Course Voucher", "S.I.T. Course Completion Certificate", "glob of extra-green chlorophyll", "electric mushroom", "five-fingered fern resin", "super good fruit", "energized spores", "big hot pepper", "out-of-work circus flea", "extra-grubby grub", "fire ant pheromones", "flapper fly", "shot of wasp venom", "filled mosquito", "shim of shame shale", "pebble of proud pyrite", "pile of gritty sand", "hollow rock", "angry agate", "lump of loyal latite", "shadow sausage", "shadow skin", "shadow flame", "shadow bread", "shadow ice", "shadow fluid", "shadow glass", "shadow brick", "shadow sinew", "shadow venom", "shadow nectar", "shadow stick", "cursed bat paw", "uncursed bat paw", "cursed goblin cape", "uncursed goblin cape", "cursed dragon wishbone", "uncursed dragon wishbone", "cursed stats", "uncursed stats", "cursed arcane orb", "uncursed arcane orb", "cursed machete", "uncursed machete", "cursed blanket", "uncursed blanket", "cursed medallion", "uncursed medallion", "Advanced Pig Skinning", "The Cheese Wizard's Companion", "Jazz Agent sheet music", "Thwaitgold anti-moth statuette", "shadowy cheat sheet", "closed-circuit phone system", "closed-circuit pay phone", "shadow lighter", "shadow heptahedron", "shadow snowflake", "shadow heart", "shadow bucket", "shadow wave", "Rufus's shadow lodestone", "shadow chef's hat", "shadow trousers", "shadow hammer", "shadow monocle", "shadow candle", "shadow hot dog", "shadow martini", "shadow pill", "shadow needle", "cursed monkey's paw", "cursed monkey glove", "shadow candy", "replica Mr. Accessory", "replica Dark Jill-O-Lantern", "replica hand turkey outline", "replica crimbo elfling", "replica pygmy bugbear shaman", "dedigitizer schematic: cyburger", "replica miniature gravy-covered maypole", "replica wax lips", "replica Tome of Snowcone Summoning", "dedigitizer schematic: cybeer", "replica jewel-eyed wizard hat", "replica bottle-rocket crossbow", "replica navel ring of navel gazing", "replica V for Vivala mask", "replica haiku katana", "replica little box of fireworks", "replica cotton candy cocoon", "replica Elvish sunglasses", "replica squamous polyp", "replica floaty stone sphere", "replica Greatest American Pants", "replica organ grinder", "replica Juju Mojo Mask", "replica Operation Patriot Shield", "replica Libram of Resolutions", "replica plastic vampire fangs", "replica cute angel", "replica Camp Scout backpack", "replica deactivated nanobots", "replica Apathargic Bandersnatch", "replica Smith's Tome", "replica over-the-shoulder Folder Holder", "replica Order of the Green Thumb Order Form", "shrink-wrapped Cincho de Mayo", "Cincho de Mayo", "dedigitizer schematic: psilocyber mushroom", "replica Little Geneticist DNA-Splicing Lab", "replica still grill", "replica Crimbo sapling", "replica yellow puck", "replica Chateau Mantegna room key", "replica Deck of Every Card", "replica Source terminal", "replica disconnected intergnat", "replica Witchess Set", "replica genie bottle", "replica space planula", "replica unpowered Robortender", "replica Neverending Party invitation envelope", "replica January's Garbage Tote", "replica God Lobster Egg", "replica Fourth of May Cosplay Saber", "replica Kramco Sausage-o-Matic&trade;", "replica hewn moon-rune spoon", "replica baby camelCalf", "replica Powerful Glove", "replica Cargo Cultist Shorts", "replica industrial fire extinguisher", "replica miniature crystal ball", "replica emotion chip", "replica Jurassic Parka", "replica grey gosling", "replica designer sweatpants", "replica plastic pumpkin bucket", "replica Ten Dollars", "replica Cincho de Mayo", "Thwaitgold splendor beetle statuette", "shrink-wrapped 2002 Mr. Store Catalog", "2002 Mr. Store Catalog", "&quot;I survived Y2K&quot; T-Shirt", "Letter from Carrie Bradshaw", "pro skateboard", "Mr. Accessaturday", "Meat Butler", "Loathing Idol Microphone", "Charter: Nellyville", "Manual of Secret Door Detection", "Flash Liquidizer Ultra Dousing Accessory", "Amulet of Perpetual Darkness", "Giant black monolith", "Crimbo cookie sheet", "Spooky VHS Tape", "scroll of minor invulnerability", "Lapis Lazuli", "Eye Agate", "Azurite", "Arrow (+1)", "scroll of protection from lycanthropes", "Loathing Idol Microphone (75% charged)", "Loathing Idol Microphone (50% charged)", "Loathing Idol Microphone (25% charged)", "Replica 2002 Mr. Store Catalog", "Mr. Big's Wallet", "Sexy Cosmo", "Souvenir Chopsticks", "red-soled high heels", "cyburger", "ncle leg", "rutabuga bag", "mesquito proboscis", "senate fly thorax", "bug juice", "spider leg", "beetle antenna", "mantis skull", "chitin powder", "daddy shortlegs leg", "birdybug antenna", "kilopede skull", "haemolymphnode", "chitin powder paste", "sleeping patriotic eagle", "claw-held flag", "souvenir flag", "name change form", "replica sleeping patriotic eagle", "boxed august scepter", "august scepter", "watermelon", "watermelon seed", "water balloon", "thriftshop coupon", "waffle", "fixodent", "cat o' nine teeth", "tooth cap", "toothy trousers", "banana split", "handful of toilet paper", "Mrs. Rush", "tiny gold medal", "bottle of Cabernet Sauvignon", "baywatch", "Pocket Guide to Mild Evil", "Pocket Guide to Mild Evil (used)", "tiny consolation ribbon", "replica august scepter", "Thwaitgold fairyfly statue", "residual chitin paste", "concentrated cooking", "ancient meat", "sparkling orb", "hardening cream", "pool shark hair oil", "book of facts", "book of facts (dog-eared)", "Dark Jill-of-All-Trades", "LED candle", "map to a candy-rich block", "sampler size toothpaste", "Franken Stein", "A Guide to Burning Leaves", "inflammable leaf", "tiny rake", "rake", "autumnic bomb", "forest canopy bed", "day shortener", "extra time", "autumnal aegis", "distilled resin", "super-heated leaf", "lit leaf lasso", "tied-up flaming leaflet", "tied-up flaming monstera", "tied-up leaviathan", "impromptu torch", "flaming fig leaf", "smoldering drape", "smoldering leafcutter ant egg", "flaming leaf crown", "leafy browns", "autumnic balm", "coping juice", "candy cane sword cane", "wrapped candy cane sword cane", "Elf Guard patrol cap", "Elf Guard hotpants", "Crimbuccaneer tricorn", "Crimbuccaneer breeches", "automa-bot parts", "security automa-core", "clerical automa-core", "handful of Boltsmann bearings", "Spring Bros. solenoid", "Spring Bros. ID badge", "Boltsmann ID badge", "housekeeping automa-core", "portable housekeeping robot", "pickled bread", "salted mutton", "corned beet", "tiny plastic Armory", "tiny plastic Bar", "tiny plastic Cafe", "tiny plastic Factory", "tiny plastic Abuela's cottage", "pirate encryption key alpha", "pirate encryption key bravo", "pirate encryption key charlie", "pirate encryption key delta", "wardrobe-o-matic", "futuristic shirt", "futuristic hat", "futuristic collar", "crated wardrobe-o-matic", "peppermint donut", "Elf Guard insignia (private)", "Crimbuccaneer fledges (mint)", "military-grade peppermint oil", "Crimbuccaneer whale oil", "Elf Guard tinsel grenade", "Crimbuccaneer mologrog cocktail", "Elf Army machine parts", "Crimbuccaneer rigging lasso", "Crimbuccaneer lantern", "Crimbuccaneer flotsam", "Crimbuccaneer invasion map", "Crimbuccaneer shirt", "Elf Guard MPC", "Crimbuccaneer piece of 12", "Elf Guard commandeering gloves", "Elf Guard eyedrops", "Crimbuccaneer premium booty sack", "Elf Guard honor present", "Elf Guard officer's sidearm", "Elf Guard insignia (general)", "Crimbow Rainbo", "Elf Guard strategic map", "Crimbuccaneer captain's purse", "Elf Guard broom", "Crimbuccaneer tavern swab", "Elf Guard hangover cure", "old-school pirate grog", "grog nuts", "sawed-off blunderbuss", "officer's nog", "peppermint bomb", "sundae ration", "peppermint tack", "Elf Guard Field Manual: Culinary Arts", "whalesteak", "whalegun", "Cocktails of the Age of Sail", "Elf Guard payroll bag", "Elf Guard clipboard", "pegfinger", "red and white claret", "Elf Guard red and white beret", "shipwright's hammer", "gunwale", "Kelflar vest", "whale cerebrospinal fluid", "Crimbuccaneer runebone", "cannonbomb", "Elf Guard mouthknife", "Crimbuccaneer fledges (disintegrating)", "Elf Guard fuel tank", "massive wrench", "brown pirate pants", "Elf Guard Field Manual: Extortion", "The Encyclopedia of Fruit", "punching mirror", "ancient Elf dessert spoon", "Elf Guard SCUBA tank", "Elf Guard Field Manual: Wilderness Sleeping", "free boots", "baby rigging snake", "Elvish underarmor", "Crimbuccaneer bombjacket", "sugarplum ration", "gingerbread nylons", "rum-soaked fruitcake", "candied lime", "gingerbread pirate", "fruit-stuffed rumcake", "mulled wine", "Swedish coffee", "canteen of eggnog", "hot wine", "Jamaican coffee", "flask of egggrog", "Black and White Apron Enrollment Form", "Black and White Apron Meal Kit", "pirate encryption key (complete)", "yule grog", "wet tack", "whalecake", "gunwale whalegun", "red white and blue claret", "rigging knot", "trick coin", "Elf Guard squirtgun", "chest of &quot;pirate gold&quot;", "sequin-encrusted sweater", "replica Elf Guard medal", "Lil' Snowball Factory", "Elf Guard temporary (permanent) tattoo", "prank Crimbo card", "Crimbuccaneer squirtblunderbuss", "My First Paycheck envelope", "barnacle-encrusted sweater", "Crimbuccaneer nose ring", "pet anchor", "Crimbuccaneer tattoo gift certificate", "Elf Guard safety bear", "stuffed kraken", "precision snowball", "Elf Guard Field Manual: Culinary Arts (used)", "Cocktails of the Age of Sail (used)", "Elf Guard Field Manual: Extortion (used)", "The Encyclopedia of Fruit (used)", "Elf Guard Field Manual: Wilderness Sleeping (used)", "military candy cane", "groggipop", "moss mace", "moss megaphone", "moss medal", "moss mitre", "moss mantle", "moss marlinspike", "moss mulch", "moss floss", "adobe arsecover", "adobe adze", "adobe abacus", "adobe ayam", "adobe ascot", "adobe abaya", "adobe assortment", "adobe brittle", "crepe paper phrygian cap", "crepe paper parachute cape", "crepe paper pie clip", "crepe paper puzzle cube", "crepe paper plunge camisole", "crepe paper polka charm", "crepe paper pared cuttings", "crepe paper peanut candy", "petrified wood war pike", "petrified wood waist protector", "petrified wood wizard's pouch", "petrified wood water purifier", "petrified wood whoopie panama", "petrified wood walking pants", "petrified wood waste parts", "petrified wood wafer praline", "cybeer", "ICEbox", "wired underwear", "encrypted shuriken", "baby chest mimic", "googly chest eyes", "mimic egg", "Crimbuccaneer war standard", "Elf Guard war standard", "in-the-box spring shoes", "spring shoes", "ultra-soft ferns", "crunchy brush", "smashed scientific equipment", "biphasic molecular oculus", "triphasic molecular oculus", "high-tension exoskeleton", "ultra-high-tension exoskeleton", "irresponsible-tension exoskeleton", "quick-release belt pouch", "quick-release fannypack", "quick-release utility belt", "motion sensor", "focused magnetron pistol", "packaged Everfull Dart Holster", "Everfull Dart Holster", "research fragment", "Thwaitgold wolf spider statuette", "boxed Apriling band helmet", "Apriling band helmet", "Apriling band saxophone", "Apriling band quad tom", "Apriling band tuba", "Apriling band staff", "Apriling band piccolo", "boxed Mayam Calendar", "Mayam Calendar", "yam", "yam martini", "sweet potato o' mine", "Southern yam", "sweet potato punch", "Mayam spinach", "yam and swiss", "yam cannon", "tiny yam cannon", "yam battery", "stuffed yam stinkbomb", "furry yam buckler", "thanksgiving bomb", "yamtility belt", "yam slider", "yam mayo", "yam burrito", "visual packet sniffer", "mini kiwi egg", "aviator goggles", "Thwaitgold Illinigina illinoiensis model", "mini kiwi", "mini kiwi bikini", "mini kiwitini", "mini kiwi invisible dirigible", "mini kiwi aioli", "mini kiwi silicon tiepin", "mini kiwi tipi", "mini kiwi digitized cookies", "mini kiwi intoxicating spirits", "mini kiwi antimilitaristic hippy petition", "mini kiwi illicit antibiotic", "mini kiwi whipping stick", "mini kiwi icepick", "mini kiwi-flavored aspirin-injecting lipstick", "packaged Roman Candelabra", "Roman Candelabra", "protogenetic chunklet (synapse)", "protogenetic chunklet (muscle)", "protogenetic chunklet (flagellum)", "protogenetic chunklet (elbow)", "protogenetic chunklet (lips)", "messenger bag RNA", "flagellate flagon", "proto-proto-protozoa", "bacteria bisque", "ciliophora chowder", "cream of chloroplasts", "synaptic soup", "muscular soup", "flagellate soup", "elbow soup", "lip soup", "unevolved organism", "extra ooze", "extra DNA", "untorn tearaway pants package", "tearaway pants", "baby bodyguard", "Doll Moll violin case", "tiny Tina gun", "tattoo gun", "Colera Peste Nebbiolo", "longbox of Batfellow comics", "Thwaitgold shield bug statuette", "bodyguard badge", "Too Cold to Hold: How to Be Cool - A Memoir", "Too Cold to Hold: How to Be Cool - A Memoir (read)", "boxed Sept-Ember Censer", "Sept-Ember Censer", "blade of dismemberment", "miniature Embering Hulk", "Mmm-brr! brand mouthwash", "Septapus summoning charm", "structural ember", "embers-only jacket", "bembershoot", "wheel of camembert", "hat of remembering", "throwin' ember", "head of emberg lettuce", "embering hunk", "soft cap of diminishing returns", "photo booth sized crate", "boxed bat wings", "bat wings", "ember egg", "tiny ember", "oversized monocle on a stick", "cheap plastic pipe", "fake arrow-through-the-head", "giant bow tie", "fake huge beard", "astronaut helmet", "feather boa", "Sheriff badge", "Sheriff pistol", "Sheriff moustache", "photo booth supply list", "peace turkey outline", "tie-dye headband", "whirled peas", "peaza", "peace shooter", "drenchrome 2.0", "Synapse Blaster", "quantized familiar", "quantum watch", "quantized familiar experience", "pea brittle", "peasco sour", "piece of cake", "handful of split pea soup", "Sealed TakerSpace letter of Marque", "TakerSpace letter of Marque", "deft pirate hook", "iron tricorn hat", "jolly roger flag", "sleeping profane parrot", "pirrrate's currrse", "tankard of spiced rum", "tankard of spiced Goldschlepper", "packaged luxury garment", "governor's daughter's lace collar", "governor's daughter's petticoats", "governor's daughter's pearl hairpin", "harpoon", "chili powder cutlass", "cursed Aztec tamale", "jolly roger tattoo kit", "golden pet rock", "groggles", "pirate dinghy", "anchor bomb", "silky pirate drawers", "profane eye patch", "peppermint pegleg", "hard cocoa", "salmagumdi", "tiny plastic Easter Island Bunny", "tiny plastic St. Patrick", "tiny plastic Colonel Brando", "tiny plastic Jedediah and Boiling Cloud", "tiny plastic &quot;Santa Claus&quot;", "Spirit of Easter", "Spirit of St. Patrick's Day", "Spirit of Veteran's Day", "Spirit of Thanksgiving", "Spirit of Christmas", "coney haunch", "dark chocolate egg", "moai toai", "moaiball", "half-digested rat", "four-leaf potato sprout", "potato jacket", "traumatic holiday memory", "Brandonian footlocker key", "military orb", "rum ball", "gravy skin", "gravyskin hat", "gravyskin buckler", "gravyskin skirt", "gravyskin pants", "crystallized pumpkin spice", "room scale green bean casserole", "fragile Christmas ornament", "ragged wool yarn", "perfect Christmas scarf", "snowman-enchanting tophat", "LIDAR candle", "Congressional Medal of Insanity", "pumpkin spice whorl", "Easter grasshopper", "Irish eggnog", "canteen of jungle juice", "turchucken", "mechanically-mulled cider", "holiday trip around the world", "chocolate ostrich egg", "candied beef and cabbage", "candy rations", "double-candied yams", "Christmas ham", "holiday smorgasbord", "Bowl of Infinite Jelly", "bejazzled eyepatch", "Secrets of the Master Egg Hunters", "Secrets of the Master Egg Hunters (used)", "How to Lose Friends and Attract Snakes", "How to Lose Friends and Attract Snakes (used)", "Covert Ops for Kids", "Covert Ops for Kids (used)", "Holiday Multitasking", "Holiday Multitasking (used)", "Hoyle's Guide to Reindeer Games", "Hoyle's Guide to Reindeer Games (used)", "lucky moai statuette", "egg gun", "lucky army helmet", "candy egg deviler", "lucky napkin", "Thanksgiving ration", "Easter eggnog", "clovermint", "nylon Christmas stockings", "tattoo of two turkeys", "deviled candy egg", "McHugeLarge deluxe ski set", "McHugeLarge duffel bag", "McHugeLarge left pole", "McHugeLarge right pole", "McHugeLarge left ski", "McHugeLarge right ski", "1", "0", "eXpand", "brute force hammer", "datastick", "dedigitizer schematic: brute force hammer", "dedigitizer schematic: malware injector", "dedigitizer schematic: cybervisor", "dedigitizer schematic: digibritches", "dedigitizer schematic: cryptocloak", "dedigitizer schematic: zero-trust tanktop", "dedigitizer schematic: retro floppy disk", "dedigitizer schematic: pocket GPU", "dedigitizer schematic: trojan horseshoe", "dedigitizer schematic: familiar-in-the-middle", "cybervisor", "retro floppy disk", "pocket GPU", "malware injector", "CyberRealm keycode", "server room key", "3d printed server room key", "dedigitizer schematic: 3d printed server room key", "logic grenade", "psilocyber mushroom", "dedigitizer schematic: SLEEP(5) rom chip", "dedigitizer schematic: OVERCLOCK(10) rom chip", "dedigitizer schematic: STATS+++ rom chip", "dedigitizer schematic: insignificant bit", "dedigitizer schematic: hashing vise", "dedigitizer schematic: geofencing rapier", "dedigitizer schematic: geofencing shield", "dedigitizer schematic: virtual cybertattoo", "SLEEP(5) rom chip", "OVERCLOCK(10) rom chip", "STATS+++ rom chip", "insignificant bit", "parity bit", "hashing vise", "geofencing rapier", "geofencing shield", "virtual cybertattoo", "ninja rope", "ninja crampons", "ninja carabiner", "synthetic coffee", "iDrops", "shame coil", "new-in-box toy Cupid bow", "toy Cupid bow", "heat arc", "cold scrape", "phantom digit", "foul line", "dark manioc", "Observer source code", "chill gherkin", "childrens' stapler", "plover's egg", "electric flyswatter", "Thwaitgold cordyceps ant statuette", "heat particle", "cold sore", "stomach churner", "phantom brace", "foul cozy", "grim cellophane", "rift oculus", "sweaty egg", "carton of extra-sharp, rusty staples", "glover liners", "mosquito speakers", "assemble-it-yourself Leprecondo", "Leprecondo", "scoop of pre-workout powder", "table tennis ball", "pint of Leprechaun Stout", "phosphor traces", "crafting plans", "Book of Irony", "spoon", "unironic knife", "bar dart", "leprechaun antidepressant pill", "Heck ramen", "tiny burrito", "small beer brat", "tiny peach pie", "incredible mini-pizza", "Divine sidecar", "tangarita sidecar", "gimlet sidecar", "vodka stratocaster sidecar", "prussian cathouse sidecar", "Mon Tiki sidecar", "Packaged April Shower Thoughts Calendar", "April Shower Thoughts shield", "glob of wet paper", "spitball", "wet paper weights", "Three Sheets to the Wind", "pile of wet dates", "papier Mach 1 airplane", "wet blanket", "wet shower cap", "wet shower shoes", "wet shower shorts", "wet paper tiger", "wet paper eye", "wet shower curtain", "wet paper cup", "wet paperback", "wet shower radio", "wet shower stamp", "big birthday bloon", "jawwetter", "Unpeeled Peridot of Peril", "Peridot of Peril", "terrycloth turban", "jockey's hat", "sharpshooter's hat", "extra-tight skullcap", "sturdy pith helmet", "bishop's mitre", "tin foil hat", "construction hardhat", "imposing pilgrim's hat", "crown of thorns", "stylish bycocket", "Thwaitgold mad hatterpillar statuette", "packaged prismatic beret", "prismatic beret", "flak shield", "Axis HQ Code", "yeti in a travel cooler", "cold exchanger", "Axis helmet", "Axis fatigues", "Axis suspenders", "stolen artifact", "really expensive stolen artifact", "priceless stolen artifact", "chocolate rations", "nice nylon stockings", "Allied Radio Backpack Pack", "Allied Radio Backpack", "orphaned baby skeleton", "ordnance magnet", "confetti grenade", "Skeleton Wars rations", "skeleton war fuel can", "skeleton war grenade", "chocolate and nylons detector", "M&ouml;bius ring box", "M&ouml;bius ring", "bone pacifier", "Allied Forces insignia", "Allied Tattoo Kit", "handheld Allied radio", "Axis codebook", "Life Goals Pamphlet", "bully badge", "time cop top hat", "Stock Certificate", "mixed berry jelly", "toast with mixed berry jelly", "cup of sugar", "Susie's cupcake", "clock", "the gun", "fancy old wine", "really, really nice swimming trunks", "sand penny", "undersea surveying goggles", "Ocean-Touched Rum", "water-logged pill", "kelp puck", "scroll of sea strength", "scroll of sea smarts", "scroll of sea smarm", "waterlogged scroll of healing", "sea gel", "octopus ink bladder", "durable dolphin whistle", "Thwaitgold lobster statuette", "packaged Monodent of the Sea", "Monodent of the Sea", "unblemished pearl", "dentadent", "lab-grown blood cubic zirconia", "blood cubic zirconia", "blood thinner", "pheromone cocktail", "spinal tapas", "shrunken head in a duffel bag", "shrunken head", "stocking full of bones", "small peppermint-flavored sugar walking crook", "knucklebone", "Smoking Pope", "prize turkey", "medicinal gruel", "full-sized pumpkin pie", "vodka cranberry sauce", "yammed candy", "treasure chestnut", "mulled butter rum", "cinnamon doubloon", "tiny plastic left skeleton arm", "tiny plastic left skeleton leg", "tiny plastic right skeleton arm", "tiny plastic right skeleton leg", "tiny plastic skeleton pelvis", "discreetly-wrapped Eternity Codpiece", "The Eternity Codpiece", "angelbone kilt", "angelbone totem", "angelbone chopsticks", "angelbone mantle", "angelbone dice", "angelbone halo", "angelbone fragments", "biblically accurate gumdrops", "devilbone helmet", "devilbone greaves", "devilbone shinguards", "devilbone corset", "devilbone flute", "devilbone rosary", "devilbone chunks", "Gehenna tattoo", "burnt incisor", "burnt phalange", "burnt radius", "burnt rib", "burnt skull", "Crymbocurrency", "extra-thick Crimbo sweater", "The Encyclopedia of Holiday Funerary Rites", "Steve Abrams' Holiday Sampler Beer", "crate of prize-winning rum", "bottle of prize-winning rum", "Santa-Slayer medal", "Skull of Claus", "boiling bone marrow", "boiling cerebrospinal fluid", "boiling synovial fluid", "smoldering vertebra", "seal-clubbing club loot box", "legendary seal-clubbing club", "smoldering bone dust", "volatile bone bomb", "hot boning knife", "flaming fistbone", "burnt bone belt", "scorched skull trophy", "wing bone", "weak skeleton venom", "baked bone meal", "tiny plastic skeleton rib cage", "tiny plastic skeleton skull", "tiny plastic skeleton Crimbo hat", "assembled tiny plastic Santa skeleton", "miniature sleigh", "undertakers' forceps", "bone-polishing rag", "scorched skeleton mask", "scorched skeleton shirt", "scorched skeleton pants", "messenger parrot egg", "buryable chest", "Shanty: Let's Beat Up This Drunken Sailor", "Shanty: Let's Beat Up This Drunken Sailor (used)", "Shanty: I'm Smarter Than a Drunken Sailor", "Shanty: I'm Smarter Than a Drunken Sailor (used)", "Shanty: Look At That Drunken Sailor Dance", "Shanty: Look At That Drunken Sailor Dance (used)", "Shanty: Who's Going to Pay This Drunken Sailor?", "Shanty: Who's Going to Pay This Drunken Sailor? (used)", "Shanty: Only Dogs Love a Drunken Sailor", "Shanty: Only Dogs Love a Drunken Sailor (used)", "Crymbocurrency tattoo", "fireproof bonesaw", "vermiculite shield", "cursed ship's lantern", "heat-resistant harpoon pistol", "traditional gingerloaf", "Scotch and eggnog", "counterskeleton elixir", "&quot;salvaged&quot; wine", "The Encyclopedia of Holiday Funerary Rites (used)", "crate of prize-winning cheese", "wedge of prize-winning cheese", "gummi fingerbone", "glimmering golden crystal", "boxed Heartstone", "Heartstone", "Thwaitgold meat bee statuette", "loose Meats", "Archaeologist's Spade", "boxed Archaeologist's Spade", "dinosaur bone fragment", "ancient Pork Elf pottery shard", "2015 landfill detritus", "intact dinosaur egg", "fossilized cow femur", "unopened Pork Elf toiletries kit", "Pork Elf toiletries kit", "Pork Elf mouthwash", "Pork Elf deodorant", "Pork Elf toothpaste", "bolt of striped fabric", "white and gold dress", "blue and black dress", "dinosaur bone broth", "giant gnawing bone", "dinosaur bone club", "dinosaur skull helmet", "dinosaur bone corset", "Pork Elf cough syrup", "Pork Elf neti pot", "Pork Elf medicine cabinet", "Pork Elf sink", "Pork Elf toilet", "rat pizza", "Fleek&trade; mascara", "hoverboard", "left shark fin", "fitness tracking bracelet", "candy bone", "wrapped Baseball Diamond", "Baseball Diamond", "discarded hot dog", "most of a beer", "pasta wand loot box", "legendary pasta wand", "legendary noodles", "can of tuna", "alien salad", "ratbatatouille", "spicy onigiri", "haunted crudit&eacute;s", "sauced mutton", "hot honey ant", "tomb aspic", "later tots", "Frutti di Scatoletta", "Pesto alla Marziano", "Arrattabbattabiata", "Orzo di Riso", "Pasta Grimavera", "Linguini Ubriacapa", "Formica e Pepe", "Tubetto Gelatto", "Gnocci Domani", "Thwaitgold wallet moth statuette", "scabbarded Sword of S Words", "second-hand synthetic sloth skin scabbard", "mega helmet", "shrink-wrapped Cup of 13s", "Cup of 13s"]))
		{
			for (let ut of Item.get(["Comet Pop", "black candy heart", "explosion-flavored chewing gum"]))
			{
				if (it === ut && itemAmount(it) > 0)
				{
					candyList.set(candyList.size, it);
				}
			}
			if (it.candy && itemAmount(it) > 0 && auto_mall_price(it) <= maxprice && it.tradeable)
			{
				candyList.set(candyList.size, it);
			}
		}
		if (candyList.size === 0)
		{
			auto_log_info$1("No candy for a devilled candy egg");
			return false;
		}
	}
	candyList = new Map(
		[...candyList.entries()]
			.map(([index, value]) => {
				return { _k: index, _v: value, _expr: auto_mall_price(value) };
			})
			.sort((_a, _b) => _a._expr < _b._expr ? -1 : (_a._expr > _b._expr ? 1 : 0))
			.map(e => [e._k, e._v])
	);
	let candyL: Map<number, Item> = List$8(candyList);
	return cliExecute(`devilcandyegg ${(candyL.get(0) ?? candyL.set(0, Item.none).get(0))}`);
}

export function getCandy(): void
{
	for (let sk of Skill.get(["Summon Crimbo Candy", "Summon Candy Heart", "Chubby and Plump", "Summon Hilarious Objects"]))
	{
		//use a skill if we can
		if (auto_have_skill(sk))
		{
			useSkill(1, sk);
			return;
		}
	}
	if (["wombat", "blender", "packrat"].includes(toLowerCase(mySign())) && canAdventure(Location.get("South of the Border")))
	{
		//buy some candy from gno-mart if we have gnomes
		if (auto_buyUpTo(1, Item.get("lime-and-chile-flavored chewing gum"))) { return; }
	}
	if (candyBlock()) { return; }
	auto_log_info$1("Can't get any candy");
	return;
}

export function auto_have_skill(sk: Skill): boolean
{
	return auto_is_valid$2(sk) && haveSkill(sk);
}

export function have_skills(array: Map<Skill, boolean>): boolean
{
	for (let sk of array.keys())
	{
		if (!auto_have_skill(sk))
		{
			return false;
		}
	}
	return true;
}
//From Bale\'s woods.ash relay script.
export function woods_questStart(): boolean
{
	if (myLevel() < 2)
	{
		return false;
	}
	if (internalQuestStatus("questL02Larva") < 0 && internalQuestStatus("questG02Whitecastle") < 0)
	{
		// distant woods access is gated behind level 2 quest & whitey's grove quest.
		// for some reason mafia doesn't track this any other way
		return false;
	}
	if (in_koe())
	{ // no access to woods or forest village in KoE
		return false;
	}
	if (availableAmount(Item.get("continuum transfunctioner")) > 0)
	{
		return false;
	}
	visitUrl("place.php?whichplace=woods");
	visitUrl("place.php?whichplace=forestvillage&action=fv_mystic");
	if (!in_zombieSlayer())
	{
		visitUrl("choice.php?pwd=&whichchoice=664&option=1&choiceform1=Sure%2C+old+man.++Tell+me+all+about+it.");
		visitUrl("choice.php?pwd=&whichchoice=664&option=1&choiceform1=Against+my+better+judgment%2C+yes.");
		visitUrl("choice.php?pwd=&whichchoice=664&option=1&choiceform1=Er,+sure,+I+guess+so...");
	}
	if (knollAvailable())
	{
		visitUrl("place.php?whichplace=knoll_friendly&action=dk_innabox");
		visitUrl("place.php?whichplace=forestvillage&action=fv_untinker");
	}
	else {
		visitUrl("place.php?whichplace=forestvillage&preaction=screwquest&action=fv_untinker_quest");
	}
	return true;
}

export function hasShieldEquipped(): boolean
{
	return itemType(equippedItem(Slot.get("off-hand"))) === "shield";
}

export function careAboutDrops(mon: Monster): boolean
{
	if (Monster.get(["Astronomer", "Axe Wound", "Beaver", "Box", "Burrowing Bishop", "Bush", "Camel's Toe", "Family Jewels", "Flange", "Honey Pot", "Hooded Warrior", "Junk", "Little Man in the Canoe", "Muff", "One-Eyed Willie", "Pork Sword", "Skinflute", "Trouser Snake", "Twig and Berries"]).includes(mon))
	{
		if (!needStarKey())
		{
			return false;
		}
		if (Monster.get("Astronomer") === mon && itemAmount(Item.get("star chart")) > 0)
		{
			return false;
		}
		//We could refine this to get rid of all the all stars / lines mobs but meh.
		if (Monster.get("Astronomer") !== mon && (itemAmount(Item.get("star")) < 8 || itemAmount(Item.get("line")) < 7))
		{
			return true;
		}
		return false;
	}
/*
pygmy bowler
pygmy witch accountant
white lion
white snake
baseball bat
briefcase bat
doughbat
perpendicular bat
skullbat
vampire bat
batrat
ratbat
beanbat
banshee librarian
knob Goblin Harem Girl
spiny skelelton
toothy sklelton
sassy pirate
smarmy pirate
swarthy pirate
tetchy pirate
toothy pirate
tipsy pirate
chatty pirate
cleanly pirate
clingy pirate
creamy pirate
crusty pirate
curmudgeonly pirate
dairy goat
ninja snowman assassin
smut orc jacker
smut orc nailer
smut orc pervert
smut orc pipelayer
smut orc screwer
Whatsian Commando Ghost
Space Tourist Explorer Ghost
Dusken Raider Ghost
Claybender Sorcerer Ghost
Battlie Knight Ghost
bearpig topiary animal
elephant (meatcar?) topiary animal
spider (duck?) topiary animal
oil cartel
oil baron
oil tycoon
Burly Sidekick
Quiet Healer
lobsterfrogman
possessed wine rack
cabinet of Dr. Limpieza
*/
	return false;
}

export function effectiveDropChance(it: Item, baseDropRate: number): number
{
	//0 to 100 chance to drop at end of fight
	let retval: number = 0;
	let item_modifier: number = itemDropModifier();

	if (baseDropRate > 0)
	{
		if (itemType(it) === "food")
		{
			//todo? cooking ingredients
			item_modifier += numericModifier("Food Drop");
		}
		if (itemType(it) === "booze")
		{
			//todo? cocktailcrafting ingredients
			item_modifier += numericModifier("Booze Drop");
		}
		if (it.candy)
		{
			item_modifier += numericModifier("Candy Drop");
		}
		if (toSlot(it) !== Slot.none && Slot.get(["hat", "shirt", "weapon", "off-hand", "pants", "acc1", "acc2", "acc3", "back"]).includes(toSlot(it)))
		{
			item_modifier += numericModifier("Gear Drop");

			if (toSlot(it) === Slot.get("hat"))
			{
				item_modifier += numericModifier("Hat Drop");
			}
			if (toSlot(it) === Slot.get("shirt"))
			{
				item_modifier += numericModifier("Shirt Drop");
			}
			if (toSlot(it) === Slot.get("weapon"))
			{
				item_modifier += numericModifier("Weapon Drop");
			}
			if (toSlot(it) === Slot.get("off-hand"))
			{
				item_modifier += numericModifier("Offhand Drop");
			}
			if (toSlot(it) === Slot.get("pants"))
			{
				item_modifier += numericModifier("Pants Drop");
			}
			if (Slot.get(["acc1", "acc2", "acc3"]).includes(toSlot(it)))
			{
				item_modifier += numericModifier("Accessory Drop");
			}
		}
	}

	retval = baseDropRate * (100 + item_modifier) / 100.0;
	retval = min(100, retval); //final drop chance % before special modifiers

	if (retval > 0)
	{
		if (in_lar())
		{
			if (retval * 2 >= 100)
			{
				retval = 100;
			}
			else {
				retval = 0;
			}
		}

		if (in_heavyrains())
		{
			let depth: number = toInt(myLocation().waterLevel + numericModifier("Water Level"));
			depth = max(1, depth);
			depth = min(6, depth);
			let heavyrainsWashChance: number = 5.0 * depth / 100;
			if (haveEffect(Effect.get("Fishy Whiskers")) > 0)
			{
				heavyrainsWashChance -= 0.1;
			}
			if (equippedAmount(Item.get("fishbone catcher's mitt")) > 0)
			{
				//todo exact rate?
				heavyrainsWashChance -= 0.1;
			}
			retval = retval * (1 - max(0, heavyrainsWashChance));
		}

		if (in_wildfire())
		{
			let wildfireBurnChance: number = 0;
			switch (myLocation().fireLevel)
			{
				case 5:
					wildfireBurnChance = 1;
				case 4:
					wildfireBurnChance = 0.768;
				case 3:
					wildfireBurnChance = 0.361;
				case 2:
					wildfireBurnChance = 0.109;
				default:
					wildfireBurnChance = 0;
			}
			retval = retval * (1 - wildfireBurnChance);
		}

		if (myFamiliar() === Familiar.get("Black Cat"))
		{
			//todo actual chance to lose drop?
			retval = retval * 0.75;
		}
		else if (myFamiliar() === Familiar.get("O.A.F."))
		{
			//todo actual chance to lose drop?
			retval = retval * 0.75;
		}
	}

	return max(0, retval);
}

export function ATSongList(): Map<Effect, boolean>
{
	// This List contains ALL AT songs in order from Most to Least Important as to determine what effect to shrug off.
	let songs: Map<Effect, boolean> = new Map([
		[Effect.get("Inigo's Incantation of Inspiration"), true],
		[Effect.get("The Ballad of Richie Thingfinder"), true],
		[Effect.get("Chorale of Companionship"), true],
		// under normal circumstances we should never get this, but if we do we want to keep it
		[Effect.get("Dirge of Dreadfulness (Remastered)"), true],
		[Effect.get("Ode to Booze"), true],
		[Effect.get("Ur-Kel's Aria of Annoyance"), true],
		[Effect.get("Carlweather's Cantata of Confrontation"), true],
		[Effect.get("The Sonata of Sneakiness"), true],
		[Effect.get("Fat Leon's Phat Loot Lyric"), true],
		[Effect.get("Polka of Plenty"), true],
		[Effect.get("Psalm of Pointiness"), true],
		[Effect.get("Aloysius' Antiphon of Aptitude"), true],
		[Effect.get("Paul's Passionate Pop Song"), true],
		[Effect.get("Donho's Bubbly Ballad"), true],
		[Effect.get("Prelude of Precision"), true],
		[Effect.get("Elron's Explosive Etude"), true],
		[Effect.get("Benetton's Medley of Diversity"), true],
		[Effect.get("Dirge of Dreadfulness"), true],
		[Effect.get("Stevedave's Shanty of Superiority"), true],
		[Effect.get("Brawnee's Anthem of Absorption"), true],
		[Effect.get("Jackasses' Symphony of Destruction"), true],
		[Effect.get("Power Ballad of the Arrowsmith"), true],
		[Effect.get("Cletus's Canticle of Celerity"), true],
		[Effect.get("Cringle's Curative Carol"), true],
		[Effect.get("The Magical Mojomuscular Melody"), true],
		[Effect.get("The Moxious Madrigal"), true]
		]);

	return songs;
}

export function shrugAT(): void
{
	shrugAT$1(Effect.none);
}

export function shrugAT$1(anticipated: Effect): void
{
	if (is_boris() || is_jarlsberg() || is_pete() || isActuallyEd() || in_darkGyffte() || in_plumber())
	{
		return;
	}
	//If you think we are handling song overages, you are cray cray....
	if (haveEffect(anticipated) > 0)
	{
		//We have the effect, we do not need to shrug it, just let it propagate.
		return;
	}

	if (!auto_have_skill(toSkill(anticipated)))
	{ //We don't know that song anyway
		return;
	}

	let maxSongs: number = 3;
	if (haveEquipped(Item.get("Brimstone Beret")) || haveEquipped(wrap_item(Item.get("Operation Patriot Shield"))) || haveEquipped(Item.get("plexiglass pendant")) || haveEquipped(Item.get("Scandalously Skimpy Bikini")) || haveEquipped(Item.get("Sombrero De Vida")) || haveEquipped(Item.get("super-sweet boom box")))
	{
		maxSongs = 4;
	}

	if (haveEquipped(Item.get("La Hebilla del Cintur&oacute;n de Lopez")))
	{
		maxSongs += 1;
	}
	if (haveEquipped(Item.get("zombie accordion")))
	{
		maxSongs += 1;
	}
	if (auto_have_skill(Skill.get("Mariachi Memory")))
	{
		maxSongs += 1;
	}

	let count_1: number = 1;

	let last: Effect = Effect.none;
	for (let ATsong of ATSongList().keys())
	{
		if (haveEffect(ATsong) > 0)
		{
			count_1 += 1;
			if (count_1 > maxSongs)
			{
				auto_log_info(`Shrugging song: ${ATsong}`, "blue");
				uneffect(ATsong);
			}
		}
	}
	auto_log_info(`I think we're good to go to apply ${anticipated}`, "blue");
}

let $_auto_get_campground_didCheck: boolean | undefined;

export function auto_get_campground(): Map<Item, number>
{
	//Wrapper for get_campground(), primarily deals with the oven issue in Ed.
	//Also uses Garden item as identifier for the garden in addition to what get_campground() does

	if (isActuallyEd())
	{
		let empty: Map<Item, number> = new Map();
		return empty;
	}
	let campItems: Map<Item, number> = new Map(Object.entries(getCampground()).map(([_k, _v]) => [Item.get(_k), _v]));

	if (campItems.has(Item.get("ice harvest")))
	{
		campItems.set(Item.get("packet of winter seeds"), 1);
	}
	if (campItems.has(Item.get("frost flower")))
	{
		campItems.set(Item.get("packet of winter seeds"), 1);
	}
	if (campItems.has(Item.get("handful of barley")))
	{
		campItems.set(Item.get("packet of beer seeds"), 1);
	}
	if (campItems.has(Item.get("fancy beer label")))
	{
		campItems.set(Item.get("packet of beer seeds"), 1);
	}
	if (campItems.has(Item.get("skeleton")))
	{
		campItems.set(Item.get("packet of dragon's teeth"), 1);
	}
	if (campItems.has(Item.get("giant candy cane")))
	{
		campItems.set(Item.get("Peppermint Pip Packet"), 1);
	}
	if (campItems.has(Item.get("peppermint sprout")))
	{
		campItems.set(Item.get("Peppermint Pip Packet"), 1);
	}
	if (campItems.has(Item.get("ginormous pumpkin")))
	{
		campItems.set(Item.get("packet of pumpkin seeds"), 1);
	}
	if (campItems.has(Item.get("huge pumpkin")))
	{
		campItems.set(Item.get("packet of pumpkin seeds"), 1);
	}
	if (campItems.has(Item.get("pumpkin")))
	{
		campItems.set(Item.get("packet of pumpkin seeds"), 1);
	}
	if (campItems.has(Item.get("cornucopia")))
	{
		campItems.set(Item.get("packet of thanksgarden seeds"), 1);
	}
	if (campItems.has(Item.get("megacopia")))
	{
		campItems.set(Item.get("packet of thanksgarden seeds"), 1);
	}
	if (campItems.has(Item.get("Pok&eacute;-Gro fertilizer")))
	{
		campItems.set(Item.get("packet of tall grass seeds"), 1);
	}

	if (campItems.has(Item.get("Source terminal")) && !toBoolean(getProperty("auto_haveSourceTerminal")))
	{
		setProperty("auto_haveSourceTerminal", true.toString());
	}

	$_auto_get_campground_didCheck ??= false;
	if (in_nuclear() && !$_auto_get_campground_didCheck)
	{
		$_auto_get_campground_didCheck = true;
		let temp: string = visitUrl("place.php?whichplace=falloutshelter&action=vault_term");
		if (containsText(temp, "Source Terminal"))
		{
			setProperty("auto_haveSourceTerminal", true.toString());
		}
	}

	if (!(campItems.has(Item.get("Dramatic&trade; range"))) && toBoolean(getProperty("auto_haveoven")))
	{
		campItems.set(Item.get("Dramatic&trade; range"), 1);
	}
	if (!(campItems.has(Item.get("Source terminal"))) && toBoolean(getProperty("auto_haveSourceTerminal")))
	{
		campItems.set(Item.get("Source terminal"), 1);
	}

	return campItems;
}

export function haveCampgroundMaid(): boolean
{
	let campItems: Map<Item, number> = auto_get_campground();
	if (campItems.has(Item.get("Meat maid")))
	{
		return true;
	}
	if (campItems.has(Item.get("clockwork maid")))
	{
		return true;
	}
	if (campItems.has(Item.get("Meat Butler")))
	{
		return true;
	}
	return false;
}

export function auto_is_valid(it: Item): boolean
{
	if (!glover_usable(it.toString()))
	{
		if (it !== Item.get("protonic accelerator pack"))
			{ return false; }
		else if (!expectGhostReport() && !haveGhostReport())
			{ return false; }
	}
	if (it === Item.get("grimstone mask"))
	{
		if (!isGuildClass())
			{ //it seems like all non core classes are disallowed. need to spade this to verify if any class is exempt
			return false; }
	}
	if (in_bhy())
	{
		return bhy_is_item_valid(it);
	}
	if (in_iluh() && it.fullness > 0)
	{ // only care about foods being consumable in iluh
		return iluh_foodConsumable(it.toString());
	}
	if (myPath() === Path.get("Trendy"))
	{
		return isTrendy(it);
	}

	return isUnrestricted(it);
}

export function auto_is_valid$1(fam: Familiar): boolean
{
	if (is100FamRun())
	{
		return toFamiliar(getProperty("auto_100familiar")) === fam;
	}
	if (myPath() === Path.get("Trendy"))
	{
		return isTrendy(fam);
	}
	return bhy_usable(fam.toString()) && glover_usable(fam.toString()) && zombieSlayer_usable(fam) && wereprof_usable(fam.toString()) && iluh_famAllowed(fam.toString()) && isUnrestricted(fam);
}

export function auto_is_valid$2(sk: Skill): boolean
{
	// trendy restricts which skills are valid
	if (myPath() === Path.get("Trendy")) { return isTrendy(sk); }
	// Hack for Legacy of Loathing as is_unrestricted returns false for Source Terminal skills
	if (in_lol() && Skill.get(["Extract", "Turbo", "Digitize", "Duplicate", "Portscan", "Compress"]).includes(sk)) { return true; }
	// No skills for the Professor except Advanced Research in WereProf
	if (is_professor() && sk !== toSkill(7512)) { return false; }
	//do not check check for B in bees hate you path. it only restricts items and not skills.
	return (glover_usable(sk.toString()) || sk.passive && sk !== Skill.get("Disco Nap")) && bat_skillValid(sk) && plumber_skillValid(sk) && isUnrestricted(sk);
}

export function auto_is_valid$3(eff: Effect): boolean
{
	return glover_usable(eff.toString());
}

export function auto_is_valid$4(str: string): boolean
{
	// unknown entries, presumably Bookshelf skills
	if (myPath() === Path.get("Trendy"))
	{
		return isTrendy(str);
	}

	return isUnrestricted(str);
}

export function auto_log(s: string, color: string, log_level: number): void
{
	if (log_level > toInt(getProperty("auto_log_level")))
	{
		return;
	}
	switch (log_level)
	{
		case 1:
			print(`[WARNING] ${s}`, color);
			break;
		case 2:
			print(`[INFO] ${s}`, color);
			break;
		case 3:
			print(`[DEBUG] ${s}`, color);
			break;
	}
}

export function auto_log_error(s: string): void
{
	print(`[ERROR] ${s}`, "red");
}

export function auto_log_warning(s: string, color: string): void
{
	auto_log(s, color, 1);
}

export function auto_log_warning$1(s: string): void
{
	auto_log(s, "orange", 1);
}

export function auto_log_info(s: string, color: string): void
{
	auto_log(s, color, 2);
}

export function auto_log_info$1(s: string): void
{
	auto_log(s, "blue", 2);
}

export function auto_log_debug(s: string, color: string): void
{
	auto_log(s, color, 3);
}

export function auto_log_debug$1(s: string): void
{
	auto_log(s, "black", 3);
}

export function auto_turbo(): boolean
{
	return toBoolean(getProperty("auto_turbo"));
}

export function auto_can_equip(it: Item): boolean
{
	return auto_can_equip$1(it, toSlot(it));
}

export function auto_can_equip$1(it: Item, s: Slot): boolean
{
	if (s === Slot.get("shirt") && !hasTorso$1())
		{ return false; }

	if (s === Slot.get("off-hand") && toSlot(it) === Slot.get("weapon") && !auto_have_skill(Skill.get("Double-Fisted Skull Smashing")))
		{ return false; }

	if ((s === Slot.get("weapon") || s === Slot.get("off-hand")) && (in_wotsf() || is_boris() && it !== Item.get("Trusty")))
		{ return false; }

	if (itemType(it) === "chefstaff" && (!(auto_have_skill(Skill.get("Spirit of Rigatoni")) || myClass() === Class.get("Sauceror") && equippedAmount(Item.get("special sauce glove")) > 0 || myClass() === Class.get("Avatar of Jarlsberg")) || s !== Slot.get("weapon")))
		{ return false; }

	return auto_is_valid(it) && canEquip(it);
}
// Conditionals are formatted as "<condition type>:<data>"
// Multiple conditionals can be added separated by a semicolon (;) with NO SPACES
// Conditionals can be prepended with a ! to indicate that they must be FALSE
// See the switch statement for valid condition types and a description of their data
export function auto_check_conditions(conds: string): boolean
{
	if (conds === "")
		{ return true; }

	let conditions: Map<number, string> = new Map(splitString(conds, ";").map((_v, _i) => [_i, _v]));
	let failure: boolean = false;

	function compare_numbers(num1: number, num2: number, comparison: string): boolean
	{
		switch (comparison)
		{
			case "=":
			case "==":
				return num1 === num2;
			case ">":
				return num1 > num2;
			case "<":
				return num1 < num2;
			case ">=":
				return num1 >= num2;
			case "<=":
				return num1 <= num2;
			default:
				abort(`"${comparison}" is not a valid comparison operator!`);
		}
		return false;
	}
	// does not account for !, the loop does that
	function check_condition(cond: string): boolean
	{
		let m: AshMatcher = new AshMatcher("^(\\w+):(.+)$", cond);
		if (!m.find())
			{ abort(`"${cond}" is not proper condition formatting!`); }
		let condition_type: string = m.group(1);
		let condition_data: string = m.group(2);
		{ 
			// data: The text name of the class, as used by to_class()
			// You must be the given class
			// As a precaution, autoscend aborts if to_class returns $class[none]

				let req_class: Class = Class.none;
			// data: The text name of the mainstat, as used by to_stat()
			// Your mainstat must be the given stat
			// As a precaution, autoscend aborts if to_stat returns $stat[none]

				let req_mainstat: Stat = Stat.none;
			// data: The text name of the path, as returned by my_path().name
			// You must be currently on that path
			// No safety checking possible here, so hopefully you don't misspell anything
			// data: The int id name of the path, as returned by my_path().id
			// You must be currently on that path
			// As a precaution, autoscend aborts if to_int returns 0

				let req_pathid: number = 0;
			// data: Text name of the skill, as used by to_skill()
			// You must have the given skill
			// As a precaution, autoscend aborts if to_skill returns $skill[none]

				let req_skill: Skill = Skill.none;
			// data: Text name of the effect, as used by to_effect()
			// You must have at least one turn of the given effect
			// As a precaution, autoscend aborts if to_effect returns $effect[none]

				let req_effect: Effect = Effect.none;
			// data: <item name><comparison operator><value>
			// The number of that item you have must compare properly
			// As a precaution, autoscend aborts if to_item returns $item[none]

				let m5: AshMatcher = undefined;
				let req_item: Item = Item.none;
			// data: <value><equal sign separator><item name>
			// The chance of getting the item at the end of the fight from that base drop rate value must be 100
			// As a precaution, autoscend aborts if to_item returns $item[none]

				let m7: AshMatcher = undefined;
				let todrop_item: Item = Item.none;
				let base_drop_chance: number = 0.0;
			// data: The outfit name as used by have_outfit
			// You must have the given outfit
			// No safety checking here possible, at least not conveniently
			// data: Text name of the familiar, as used by to_familiar()
			// You must be currently using this familiar
			// As a precaution, autoscend aborts if to_familiar returns $familiar[none]
			// Unless the text is literall "none" (case sensitive)

				let req_familiar: Familiar = Familiar.none;
			// data: Text name of the familiar, as used by to_familiar()
			// You must own this familiar, and it must be legal
			// As a precaution, autoscend aborts if to_familiar returns $familiar[none]

				let havefamiliar: Familiar = Familiar.none;
			// data: Text name of the location, as used by to_location()
			// You must be in this location (if you want to check for elsewhere, temporarily set_location)
			// As a precaution, autoscend aborts if to_location returns $location[none]

				let req_loc: Location = Location.none;
			// data: <location><comparison operator><integer value>
			// As a precaution, autoscend aborts if to_location returns $location[none]

				let m6: AshMatcher = undefined;
				let loc: Location = Location.none;
			// data: <propname><comparison operator><value>
			// >/</>=/<= only supported for integer properties!

				let m2: AshMatcher = undefined;
				let prop: string = "";
			// data: <propname>
			// gets propname and converts to a boolean
			// data: <questpropname><comparison operator><value>
			// like prop, but with > and < and >= and <= and uses internalQuestStatus
			// the value to compare to should always be an integer

				let m3: AshMatcher = undefined;
				let quest_state: number = 0;
				let compare_to: number = 0;
			// data: Text name of the monster, as used by to_monster()
			// True if that monster has been sniffed by any olfaction-like
			// As a precaution, autoscend will abort if to_monster returns $monster[none]

				let check_sniffed: Monster = Monster.none;
			// data: Doesn't matter, but put something so I don't have to support dataless conditions
			// True when you expect a protonic ghost report
			// Pretty much just for the protonic accelerator pack
			// data: Doesn't matter, but put something so I don't have to support dataless conditions
			// True when there is a latte unlock available in the area (that you don't have, of course)
			// Pretty much just for the latte
			// data: Doesn't matter, but put something so I don't have to support dataless conditions
			// True if the hidden tavern has been unlocked this ascension
			// data: The number of sgeeas you want to have
			// True if you have at least that many sgeeas at your disposal

				let sgeeas: number = 0;
			// data: The day to check for
			// True if we are currently on that day

				let day: number = 0;
				let m4: AshMatcher = undefined;
				switch (condition_type)
		{
			case "class":				req_class = toClass(condition_data);
				if (req_class === Class.none)
					{ abort(`"${condition_data}" does not properly convert to a class!`); }
				return req_class === myClass();
			case "mainstat":				req_mainstat = toStat(condition_data);
				if (req_mainstat === Stat.none)
					{ abort(`"${condition_data}" does not properly convert to a stat!`); }
				return req_mainstat === myPrimestat();
			case "path":
				return condition_data === myPath().name;
			case "pathid":				req_pathid = toInt(condition_data);
				if (req_pathid === 0)
					{ abort(`"${condition_data}" does not properly convert to a path id!`); }
				return req_pathid === myPath().id;
			case "skill":				req_skill = toSkill(condition_data);
				if (req_skill === Skill.none)
					{ abort(`"${condition_data}" does not properly convert to a skill!`); }
				return auto_have_skill(req_skill);
			case "effect":				req_effect = toEffect(condition_data);
				if (req_effect === Effect.none)
					{ abort(`"${condition_data}" does not properly convert to an effect!`); }
				return haveEffect(req_effect) > 0;
			case "item":				m5 = new AshMatcher("([^=<>]+)([=<>]+)(.+)", condition_data);
				if (!m5.find())
					{ abort(`"${condition_data}" is not a proper item condition format!`); }				req_item = toItem(m5.group(1));
				if (req_item === Item.none)
					{ abort(`"${m5.group(1)}" does not properly convert to an item!`); }
				return compare_numbers(itemAmount(req_item) + equippedAmount(req_item), toInt(m5.group(3)), m5.group(2));
			case "itemdropcapped":				m7 = new AshMatcher("([^=<>]+)=(.+)", condition_data);
				if (!m7.find())
					{ abort(`"${condition_data}" is not a proper item condition format!`); }				todrop_item = toItem(m7.group(2));				base_drop_chance = toFloat(m7.group(1));
				if (todrop_item === Item.none)
					{ abort(`"${m7.group(1)}" does not properly convert to an item!`); }
				return effectiveDropChance(todrop_item, base_drop_chance) >= 100;
			case "outfit":
				return haveOutfit(condition_data);
			case "familiar":				req_familiar = toFamiliar(condition_data);
				if (req_familiar === Familiar.none && condition_data !== "none")
					{ abort(`"${condition_data}" does not properly convert to a familiar!`); }
				return myFamiliar() === req_familiar;
			case "havefamiliar":				havefamiliar = toFamiliar(condition_data);
				if (havefamiliar === Familiar.none)
					{ abort(`"${condition_data}" does not properly convert to a familiar!`); }
				return auto_have_familiar(havefamiliar);
			case "loc":				req_loc = toLocation(condition_data);
				if (req_loc === Location.none)
					{ abort(`"${condition_data}" does not properly convert to a location!`); }
				return myLocation() === req_loc;
			case "turnsspent":				m6 = new AshMatcher("([^=<>]+)([=<>]+)(.+)", condition_data);
				if (!m6.find())
					{ abort(`"${condition_data}" is not a proper turnsspent condition format!`); }				loc = toLocation(m6.group(1));
				if (loc === Location.none)
					{ abort(`"${condition_data}" does not properly convert to a location!`); }
				if (!(["=", "=="].includes(m6.group(2))))
					{ return compare_numbers(loc.turnsSpent, toInt(m6.group(3)), m6.group(2)); }
				return loc.turnsSpent === toInt(m6.group(3));
			case "prop":				m2 = new AshMatcher("([^=<>]+)([=<>]+)(.+)", condition_data);
				if (!m2.find())
					{ abort(`"${condition_data}" is not a proper prop condition format!`); }				prop = getProperty(m2.group(1));
				if (!(["=", "=="].includes(m2.group(2))))
					{ return compare_numbers(toInt(prop), toInt(m2.group(3)), m2.group(2)); }
				return prop === m2.group(3);
			case "prop_boolean":
				return toBoolean(getProperty(condition_data));
			case "quest":				m3 = new AshMatcher("([^=<>]+)([=<>]+)(.+)", condition_data);
				if (!m3.find())
					{ abort(`"${condition_data}" is not a proper quest condition format!`); }				quest_state = internalQuestStatus(m3.group(1));				compare_to = toInt(m3.group(3));
				return compare_numbers(quest_state, compare_to, m3.group(2));
			case "sniffed":				check_sniffed = toMonster(condition_data);
				if (check_sniffed === Monster.none)
					{ abort(`"${condition_data}" does not properly convert to a monster!`); }
				if (haveEffect(Effect.get("On the Trail")) > 0 && toMonster(getProperty("olfactedMonster")) === check_sniffed)
					{ return true; }
				if (isActuallyEd() && toMonster(getProperty("stenchCursedMonster")) === check_sniffed)
					{ return true; }
				if (is_pete() && toMonster(getProperty("makeFriendsMonster")) === check_sniffed)
					{ return true; }
				if (Class.get(["Cow Puncher", "Beanslinger", "Snake Oiler"]).includes(myClass()) && toMonster(getProperty("longConMonster")) === check_sniffed)
					{ return true; }
				if (in_darkGyffte() && toMonster(getProperty("auto_bat_soulmonster")) === check_sniffed)
					{ return true; }
				if (toMonster(getProperty("_gallapagosMonster")) === check_sniffed)
					{ return true; }
				if (toMonster(getProperty("monkeyPointMonster")) === check_sniffed)
					{ return true; }
				if (toMonster(getProperty("_latteMonster")) === check_sniffed)
					{ return true; }
				if (toMonster(getProperty("motifMonster")) === check_sniffed)
					{ return true; }
				return false;
			case "expectghostreport":
				return expectGhostReport();
			case "latte":
				return auto_latteDropAvailable(myLocation());
			case "tavern":
				return toInt(getProperty("hiddenTavernUnlock")) >= myAscensions();
			case "sgeea":				sgeeas = toInt(condition_data);
				return itemAmount(Item.get("soft green echo eyedrop antidote")) >= sgeeas;
			case "day":				day = toInt(condition_data);
				return myDaycount() === day;
			case "ML":				m4 = new AshMatcher("([=<>]+)(.+)", condition_data);
				if (!m4.find())
					{ abort(`"${condition_data}" is not a proper ML condition format!`); }
				return compare_numbers(monsterLevelAdjustment(), toInt(m4.group(2)), m4.group(1));
			case "consume":
				
			// data: eat\drink\chew
			// True if we can eat\drink\chew anything today
switch (condition_data)
				{
					case "eat":					return fullness_left() > 0;
					case "drink":					return inebriety_left() > 0;
					case "chew":					return spleen_left() > 0;
					default:
						abort(`Invalid consume type "${condition_type}" found!`);
				}
			default:
				abort(`Invalid condition type "${condition_type}" found!`);
		} }
		return false;
	}

	for (let [i, cond] of conditions)
	{
		let m: AshMatcher = new AshMatcher("^(!?)(.+)$", cond);
		if (!m.find())
			{ abort(`"${cond}" is not a proper condition!`); }
		let invert: boolean = m.group(1) === "!";
		let success: boolean = check_condition(m.group(2));

		if (success === invert)
			{ return false; }
	}

	return true;
}

export function auto_getMonsters(category: string): Map<Monster, boolean>
{
	let res: Map<Monster, boolean> = new Map();
	let monsters_text: Map<string, Map<number, Map<string, string>>> = fileAsMap("autoscend_monsters.txt", [String, Number, String, String]);
	if (!monsters_text.size)
		{ auto_log_error("Could not load autoscend_monsters.txt. This is bad!"); }
	for (let [i, _v0] of (monsters_text.get(category) ?? monsters_text.set(category, new Map()).get(category))) {
		for (let [name, _v1] of _v0) {
			let conds = _v1;
		let thisMonster: Monster = toMonster(name);
		if (thisMonster === Monster.none)
		{
			auto_log_warning(`"${name}" does not convert to a monster properly!`, "red");
			continue;
		}
		if (!auto_check_conditions(conds))
			{ continue; }
		res.set(thisMonster, true);
		}
	}
	return res;
}

export function auto_getPhylum(category: string): Map<Phylum, boolean>
{
	let res: Map<Phylum, boolean> = new Map();
	let phylum_text: Map<string, Map<number, Map<string, string>>> = fileAsMap("autoscend_phylums.txt", [String, Number, String, String]);
	if (!phylum_text.size)
		{ auto_log_error("Could not load autoscend_phylums.txt. This is bad!"); }
	for (let [i, _v0] of (phylum_text.get(category) ?? phylum_text.set(category, new Map()).get(category))) {
		for (let [name, _v1] of _v0) {
			let conds = _v1;
		let thisPhylum: Phylum = toPhylum(name);
		if (thisPhylum === Phylum.none)
		{
			auto_log_warning(`"${name}" does not convert to a phylum properly!`, "red");
			continue;
		}
		if (!auto_check_conditions(conds))
			{ continue; }
		res.set(thisPhylum, true);
		}
	}
	return res;
}

export function auto_wantToSniff(enemy: Monster, loc: Location): boolean
{
	let locCache: Location = myLocation();
	setLocation(loc);
	let toSniff: Map<Monster, boolean> = auto_getMonsters("sniff");
	if ((toSniff.get(enemy) ?? toSniff.set(enemy, false).get(enemy)) && (auto_combat_appearance_rates$1(loc).get(enemy) ?? auto_combat_appearance_rates$1(loc).set(enemy, 0.0).get(enemy)) < 100)
	{
		setLocation(locCache);
		return true;
	}
	setLocation(locCache);
	return false;
}

export function auto_wantToYellowRay(enemy: Monster, loc: Location): boolean
{
	let locCache: Location = myLocation();
	setLocation(loc);
	let toSniff: Map<Monster, boolean> = auto_getMonsters("yellowray");
	setLocation(locCache);
	return (toSniff.get(enemy) ?? toSniff.set(enemy, false).get(enemy));
}

export function auto_wantToReplace(enemy: Monster, loc: Location): boolean
{
	let locCache: Location = myLocation();
	setLocation(loc);
	let toReplace: Map<Monster, boolean> = auto_getMonsters("replace");
	setLocation(locCache);
	return (toReplace.get(enemy) ?? toReplace.set(enemy, false).get(enemy));
}

export function auto_wantToCopy(enemy: Monster, loc: Location): boolean
{
	let locCache: Location = myLocation();
	setLocation(loc);
	let toCopy: Map<Monster, boolean> = auto_getMonsters("copy");
	setLocation(locCache);
	return (toCopy.get(enemy) ?? toCopy.set(enemy, false).get(enemy));
}

export function auto_wantToCopy$1(enemy: Monster): boolean
{
	let toCopy: Map<Monster, boolean> = auto_getMonsters("copy");
	return (toCopy.get(enemy) ?? toCopy.set(enemy, false).get(enemy));
}

export function zoneRank$1(mon: Monster, loc: Location): number
{
	if (auto_wantToYellowRay(mon, loc))
	{
		return 1;
	}
	if (auto_wantToCopy$1(mon))
	{
		return 2;
	}
	if (auto_wantToSniff(mon, loc))
	{
		return 3;
	}
	if (auto_wantToBanish(mon, loc) || auto_wantToFreeRun(mon, loc) || auto_wantToReplace(mon, loc))
	{
		return 999;
	}
	return 4;
}

export function total_items(items: Map<Item, boolean>): number
{
	let total: number = 0;
	for (let it of items.keys())
	{
		total += itemAmount(it);
	}
	return total;
}

export function auto_badassBelt(): boolean
{
	if ((itemAmount(Item.get("batskin belt")) > 0 || equippedAmount(Item.get("batskin belt")) > 0) && (itemAmount(Item.get("skull of the Bonerdagon")) > 0 || equippedAmount(Item.get("skull of the Bonerdagon")) > 0))
	{
		if (haveEquipped(Item.get("skull of the Bonerdagon")))
		{
			equip(Slot.get("off-hand"), Item.none);
		}
		if (haveEquipped(Item.get("batskin belt")))
		{
			if (equippedItem(Slot.get("acc1")) === Item.get("batskin belt"))
			{
				equip(Slot.get("acc1"), Item.none);
			}
			else if (equippedItem(Slot.get("acc2")) === Item.get("batskin belt"))
			{
				equip(Slot.get("acc2"), Item.none);
			}
			else if (equippedItem(Slot.get("acc3")) === Item.get("batskin belt"))
			{
				equip(Slot.get("acc3"), Item.none);
			}
		}
		return create(1, Item.get("badass belt"));
	}
	else {
		return false;
	}
}

export function meatReserveMessage(): void
{
	let reserve: number = meatReserve();
	if (reserve > 0)
	{
		auto_log_info$1(`Autoscend thinks that you need ${reserve} meat for remaining quest requirements this ascension.`);
	}
	return;
}

export function auto_interruptZoneCheck(): boolean
{
	let currentZone: string = myLocation().toString();
	let interruptZones: string = getProperty("auto_interruptZones");
	let interruptedZones: string = toBuffer(getProperty("auto_interruptedZones"));
	if (interruptZones === "" || containsText(interruptedZones, currentZone)) {
		return false;
	}

	for (let [i, zone] of splitString(interruptZones, ";").entries()) {
		if (toLocation(zone) === myLocation()) {
			append(interruptedZones, `${currentZone};`);
			setProperty("auto_interruptedZones", interruptedZones);
			return true;
		}
	}

	return false;
}

export function auto_interruptCheck(debug: boolean): void
{
	if (toBoolean(getProperty("auto_interrupt")))
	{
		setProperty("auto_interrupt", false.toString());
		restoreAllSettings();
		meatReserveMessage();
		abort("auto_interrupt detected and aborting, auto_interrupt disabled.");
	}
	else if (auto_interruptZoneCheck()) {
		abort(`auto_interruptZones detected, aborting at ${myLocation().toString()}`);
	}
	else if (toBoolean(getProperty("auto_debugging")) && debug)
	{
		setProperty("auto_interrupt", true.toString());
		auto_log_info$1("auto_debugging detected, auto_interrupt enabled.");
	}
}

export function auto_interruptCheck$1(): void
{
	//we check for interrupt at multiple locations. but we only want to set it once per loop in debug mode.
	auto_interruptCheck(true);
}

export function currentFlavour(): Element
{
	if (haveEffect(Effect.get("Spirit of Peppermint")) !== 0)
	{
		return Element.get("cold");
	}
	if (haveEffect(Effect.get("Spirit of Bacon Grease")) !== 0)
	{
		return Element.get("sleaze");
	}
	if (haveEffect(Effect.get("Spirit of Garlic")) !== 0)
	{
		return Element.get("stench");
	}
	if (haveEffect(Effect.get("Spirit of Cayenne")) !== 0)
	{
		return Element.get("hot");
	}
	if (haveEffect(Effect.get("Spirit of Wormwood")) !== 0)
	{
		return Element.get("spooky");
	}

	return Element.none;
}

export function setFlavour(ele: Element): boolean
{
	if (!auto_have_skill(Skill.get("Flavour of Magic")))
	{
		return false;
	}
	setProperty("_auto_tunedElement", ele.toString());
	return true;
}

export function executeFlavour(): boolean
{
	if (!auto_have_skill(Skill.get("Flavour of Magic")))
	{
		return false;
	}

	if (getProperty("_auto_tunedElement") === "")
	{
		autoFlavour(myLocation());
	}
	if (getProperty("_auto_tunedElement") === "")
	{
		return false;
	}
	let ele: Element = toElement(getProperty("_auto_tunedElement"));
	if (ele !== currentFlavour())
	{
		switch (ele)
		{
			case Element.none:
				return useSkill(1, Skill.get("Spirit of Nothing"));
			case Element.get("hot"):
				return useSkill(1, Skill.get("Spirit of Cayenne"));
			case Element.get("cold"):
				return useSkill(1, Skill.get("Spirit of Peppermint"));
			case Element.get("stench"):
				return useSkill(1, Skill.get("Spirit of Garlic"));
			case Element.get("spooky"):
				return useSkill(1, Skill.get("Spirit of Wormwood"));
			case Element.get("sleaze"):
				return useSkill(1, Skill.get("Spirit of Bacon Grease"));
		}
	}

	return true;
}

export function autoFlavour(place: Location): boolean
{
	if (!auto_have_skill(Skill.get("Flavour of Magic")))
	{
		return false;
	}

	switch (place)
	{
		case Location.get("Hobopolis Town Square"):
			
			// don't mess with scare hobos
return false;
		case Location.get("Dreadsylvanian Woods"):
		case Location.get("Dreadsylvanian Castle"):
		case Location.get("Dreadsylvanian Village"):
			
			// dread is complicated
return setFlavour(Element.none);
	}

	if (in_ocrs())
	{
		// monsters can randomly be any element in OCRS
		setFlavour(Element.none);
		return true;
	}

	switch (place)
	{
		case Location.get("The Ancient Hobo Burial Ground"): // Everything here is immune to elemental damage
			setFlavour(Element.none);
			return true;
		case Location.get("The Ice Hotel"):
			if (getProperty("walfordBucketItem") === "rain" && equippedItem(Slot.get("off-hand")) === Item.get("Walford's bucket"))
			{
				setFlavour(Element.get("hot")); // doing 100 hot damage in a fight will fill bucket faster
				return true;
			}
		case Location.get("VYKEA"):
			
			// INTENTIONAL LACK OF BREAK
if (getProperty("walfordBucketItem") === "ice" && equippedItem(Slot.get("off-hand")) === Item.get("Walford's bucket"))
			{
				setFlavour(Element.get("cold"));
				return true;
			}
			break;
	}

	let superEffective: Map<Element, number> = new Map();
	let perfect: Map<Element, boolean> = new Map();
	let ineffective: Map<Element, number> = new Map();

	for (let ele of Element.get(["cold", "hot", "sleaze", "spooky", "stench", "none"]))
	{
		superEffective.set(ele, 0);
		ineffective.set(ele, 0);
		perfect.set(ele, true);
	}

	function weaknesses(ele: Element): Map<Element, boolean>
	{
		switch (ele)
		{
			case Element.get("cold"):			return new Map([[Element.get("hot"), true], [Element.get("spooky"), true]]);
			case Element.get("spooky"):			return new Map([[Element.get("hot"), true], [Element.get("stench"), true]]);
			case Element.get("hot"):			return new Map([[Element.get("stench"), true], [Element.get("sleaze"), true]]);
			case Element.get("stench"):			return new Map([[Element.get("sleaze"), true], [Element.get("cold"), true]]);
			case Element.get("sleaze"):			return new Map([[Element.get("cold"), true], [Element.get("spooky"), true]]);
			default:			return new Map([[Element.none, true]]);
		}
	}

	function handle_monster(mon: Monster, chance: number): void
	{
		if (chance === 0 || mon === Monster.none)
			{ return; }

		for (let ele of Element.get(["cold", "hot", "sleaze", "spooky", "stench"]))
		{
			if (ele === monsterElement(mon))
				{ ineffective.set(ele, (ineffective.get(ele) ?? 0.0) + chance); }

			if (weaknesses(monsterElement(mon)).has(ele))
			{
				superEffective.set(ele, (superEffective.get(ele) ?? 0.0) + chance);
			}
			else {
				perfect.set(ele, false);
			}
		}
	}

	for (let [mon, chance] of Object.entries(appearanceRates(place)).map(([_k, _v]) => [Monster.get(_k), _v] as [Monster, number]))
	{
		handle_monster(mon, chance);
	}

	if (equippedAmount(wrap_item(Item.get("Kramco Sausage-o-Matic&trade;"))) > 0)
	{
		handle_monster(Monster.get("sausage goblin"), 0.5);
	}

	let flavour: Element = Element.none;
	let bestScore: number = -1;
	let bestSpellDamage: number = -99999;

	for (let ele of Element.get(["cold", "hot", "sleaze", "spooky", "stench"]))
	{
		let spellDamage: number = numericModifier(`${ele.toString()} Spell Damage`);
		let scoreDiff: number = (superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele)) - bestScore;
		scoreDiff = (scoreDiff < 0 ? -scoreDiff : scoreDiff);
		if ((ineffective.get(ele) ?? ineffective.set(ele, 0.0).get(ele)) === 0 && ((superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele)) > bestScore || scoreDiff < 0.00001 && spellDamage > bestSpellDamage))
		{
			flavour = ele;
			bestScore = (superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele));
			bestSpellDamage = spellDamage;
		}
	}

	return setFlavour(flavour);
}

export function canSimultaneouslyAcquire(needed: Map<Item, number>): boolean
{
	// The Knapsack solver can provide invalid solutions - for example, if we
	// have 2 perfect ice cubes and 6 organ space, it might suggest two distinct
	// perfect drinks.
	// Checks that a set of items isn't impossible to acquire because of
	// conflicting crafting dependencies.

	let alreadyUsed: Map<Item, number> = new Map();
	let meatUsed: number = 0;

	let failed: boolean = false;
	function addToAlreadyUsed(amount: number, toAdd: Item): void
	{
		let needToCraft: number = (alreadyUsed.get(toAdd) ?? alreadyUsed.set(toAdd, 0).get(toAdd)) + amount - itemAmount(toAdd);
		alreadyUsed.set(toAdd, (alreadyUsed.get(toAdd) ?? 0) + amount);
		if (needToCraft > 0)
		{
			if (toBoolean(getProperty("autoSatisfyWithStorage")) && pullsRemaining() === -1)
			{
				return;
			}
			if (getIngredients(toAdd).size === 0 && npcPrice(toAdd) === 0 && buyPrice(Coinmaster.get("Hermit"), toAdd) === 0)
			{
				// not craftable
				auto_log_warning(`canSimultaneouslyAcquire failing on ${toAdd}`, "red");
				failed = true;
			}
			else if (npcPrice(toAdd) > 0)
			{
				meatUsed += npcPrice(toAdd);
			}

			for (let [ing, ingAmount] of Object.entries(getIngredients(toAdd)).map(([_k, _v]) => [Item.get(_k), _v] as [Item, number]))
			{
				addToAlreadyUsed(ingAmount * needToCraft, ing);
			}
		}
	}

	for (let [it, amt] of needed)
	{
		addToAlreadyUsed(amt, it);
	}

	return !failed && meatUsed <= myMeat();
}

export function knapsack(maxw: number, n: number, weight: Map<number, number>, val: Map<number, number>): Map<number, boolean>
{
	/*
	 * standard implementation of 0-1 Knapsack problem with dynamic programming
	 * Time complexity: O(maxw * n)
	 * For 16k items on a 2017 laptop, took about 5 seconds and 60Mb of RAM
	 *
	 * Parameters:
	 *   maxw is the desired sum-of-weights (e.g. fullness_left())
	 *   n is the number of elements
	 *   weight is the (e.g. a map from i=1..n => fullness of i-th food)
	 *   val is the value to maximize (e.g. a map from i=1..n => adventures of i-th food)
	 * Returns: a set of indices that were taken
	 */

	let empty: Map<number, boolean> = new Map();

	if (n * maxw >= 100000)
	{
		auto_log_warning$1(`Solving a Knapsack instance with ${n} elements and ${maxw} total weight, this might be slow and memory-intensive.`);
	}
	/* V[i][w] is "with only the first i items, what is the maximum
	 * sum-of-vals we can generate with total weight w?
	 */
	let V: Map<number, Map<number, number>> = new Map();

	for (let i_1: number = 0; i_1 <= n; i_1++)
	{
		for (let w_1: number = 0; w_1 <= maxw; w_1++)
		{
			if (i_1 === 0 || w_1 === 0)
				{ (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(w_1, 0); }
			else if ((weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1)) <= w_1)
				{ (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(w_1, max((val.get(i_1 - 1) ?? val.set(i_1 - 1, 0.0).get(i_1 - 1)) + ((V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(w_1 - (weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1))) ?? (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).set(w_1 - (weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1)), 0.0).get(w_1 - (weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1)))), ((V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(w_1) ?? (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).set(w_1, 0.0).get(w_1)))); }
			else { (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(w_1, ((V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(w_1) ?? (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).set(w_1, 0.0).get(w_1))); }
		}
	}
	// Catch unreachable case (e.g. only 2-fullness foods, targeting 15 stomach)
	if (((V.get(n) ?? V.set(n, new Map()).get(n)).get(maxw) ?? (V.get(n) ?? V.set(n, new Map()).get(n)).set(maxw, 0.0).get(maxw)) === 0.0)
	{
		return empty;
	}

	let ret: Map<number, boolean> = new Map();
	// backtrack
	let i: number = n;
	let w: number = maxw;
	while (i > 0 || w > 0)
	{
		if (i < 0) { return empty; }
		// Did this item change our mind about how many adventures we could generate?
		// If so, we took this item.
		if (((V.get(i) ?? V.set(i, new Map()).get(i)).get(w) ?? (V.get(i) ?? V.set(i, new Map()).get(i)).set(w, 0.0).get(w)) !== ((V.get(i - 1) ?? V.set(i - 1, new Map()).get(i - 1)).get(w) ?? (V.get(i - 1) ?? V.set(i - 1, new Map()).get(i - 1)).set(w, 0.0).get(w)))
		{
			ret.set(i - 1, true);
			w -= (weight.get(i - 1) ?? weight.set(i - 1, 0).get(i - 1));
			i -= 1;
		}
		else {
			// do not take element
			i -= 1;
		}
	}
	// This can be somewhat memory-intensive.
	// I'm not sure if this actually does anything, but it makes me feel better.
	cliExecute("gc");
	return ret;
}

export function auto_reserveAmount(it: Item): number
{
	let itemdata: Map<string, Map<number, Map<string, string>>> = fileAsMap("autoscend_items.txt", [String, Number, String, String]);
	if (!itemdata.size)
		{ auto_log_error("Could not load autoscend_items.txt! This is bad!"); }
	for (let [i, _v0] of (itemdata.get("reserve") ?? itemdata.set("reserve", new Map()).get("reserve"))) {
		for (let [counteditem, _v1] of _v0) {
			let conds = _v1;
		let m: AshMatcher = new AshMatcher("(\\-?\\d+) (.+)", counteditem);
		if (!m.find())
		{
			auto_log_warning(`"${counteditem}" is not in the format "# itemname"!`, "red");
			continue;
		}
		let curr: Item = toItem(m.group(2));
		if (curr === Item.none)
		{
			auto_log_warning(`"${m.group(2)}" does not convert to an item properly!`, "red");
			continue;
		}
		if (curr !== it)
			{ continue; }
		if (!auto_check_conditions(conds))
			{ continue; }
		return toInt(m.group(1));
		}
	}
	return 0;
}

export function auto_reserveCraftAmount(orig_it: Item): number
{
	// Detect infinite loops
	let its: Map<Item, boolean> = new Map();

	function inner(it: Item): number
	{
		if (its.has(it))
		{
			auto_log_warning(`Found dependency loop involving ${it} when trying to craft ${orig_it}, consider adding to reserve list.`, "red");
			auto_log_warning("Dependencies (in no particular order):", "red");
			for (let iit of its.keys())
			{
				auto_log_warning(`> ${iit}`, "red");
			}
			return 9999999;
		}
		its.set(it, true);
		let reserve: number = 0;
		for (let [ing, amt] of Object.entries(getIngredients(it)).map(([_k, _v]) => [Item.get(_k), _v] as [Item, number]))
		{
			let ingReserve: number = auto_reserveAmount(ing);
			if (ingReserve === -1)
			{
				return 0;
			}
			else if (ingReserve === 0)
			{
				ingReserve = inner(ing);
			}
			if (ingReserve * amt > reserve)
			{
				reserve = ingReserve * amt;
			}
		}
		its.delete(it);
		return reserve;
	}
	return inner(orig_it);
}
// ML MANAGEMENT FUNCTIONS
// Gives us the number we need when comparing to a desired ML or entering a value into a maximizer string.
export function auto_convertDesiredML(DML: number): number
{
	let DesiredML: number = toInt(getProperty("auto_MLSafetyLimit"));

	if (getProperty("auto_MLSafetyLimit") === "")
	{
		DesiredML = DML;
	}

	return DesiredML;
}
// Uses MCD in the constraints of a Cap
export function auto_setMCDToCap(): boolean
{
	let targetMcd: number = 0;

	if (getProperty("auto_MLSafetyLimit") === "")
	{
		// No ML limit was given, so use the max MCD value
		targetMcd = 11;
	}
	else {
		// monster_level_adjustment includes the current MCD value, so it must be removed before calculating the new MCD
		let currentMlWithoutMcd: number = monsterLevelAdjustment() - currentMcd();
		let mlSafetyLimit: number = toInt(getProperty("auto_MLSafetyLimit"));

		if (currentMlWithoutMcd < mlSafetyLimit)
		{
			// ML is below the cap. Add as much ML with the MCD as possible without exceeding the cap.
			targetMcd = mlSafetyLimit - currentMlWithoutMcd;
		}
		else {
			// ML is already at the cap or exceeded it. Don't add any more ML with the MCD.
			targetMcd = 0;
		}
	}

	return auto_change_mcd(targetMcd);
}
// We use this function to determine the suitability of using Ur-Kel's
export function UrKelCheck(UrKelToML: number, UrKelUpperLimit: number, UrKelLowerLimit: number): boolean
{
	if (!auto_have_skill(Skill.get("Ur-Kel's Aria of Annoyance")))
	{
		return false;
	}

	if (haveEffect(Effect.get("Ur-Kel's Aria of Annoyance")) === 0 && monsterLevelAdjustment() + 2 * myLevel() <= auto_convertDesiredML(UrKelToML))
	{
		if (getProperty("auto_MLSafetyLimit") === "" || 2 * myLevel() <= UrKelUpperLimit && 2 * myLevel() >= UrKelLowerLimit)
		{
			shrugAT$1(Effect.get("Ur-Kel's Aria of Annoyance"));
			buffMaintain$3(Effect.get("Ur-Kel's Aria of Annoyance"), 0, 1, 10);
		}
	}

	return true;
}
// We use this function to determine the suitability of using angry agates
export function angryAgateCheck(angryAgateToML: number, angryAgateUpperLimit: number, angryAgateLowerLimit: number): boolean
{
	if (itemAmount(Item.get("angry agate")) === 0 || !auto_is_valid(Item.get("angry agate")))
	{
		return false;
	}

	if (haveEffect(Effect.get("Misplaced Rage")) === 0 && monsterLevelAdjustment() + 3 * myLevel() <= auto_convertDesiredML(angryAgateToML))
	{
		if (getProperty("auto_MLSafetyLimit") === "" || 3 * myLevel() <= angryAgateUpperLimit && 3 * myLevel() >= angryAgateLowerLimit)
		{
			uneffect(Effect.get("Misplaced Rage"));
			buffMaintain$4(Effect.get("Misplaced Rage"));
		}
	}

	return true;
}
// Handle intelligently increasing ML for both pre-adv and in Quests
//	doAltML is a variable that will be referenced when increasing ML via alternative methods such as Asdon Martin, they should be entered in their respective order
//		Ur-kel's may need new entries in this case due to its variance
export function auto_MaxMLToCap(ToML: number, doAltML: boolean): boolean
{
	function tryEffects(effects: Map<Effect, boolean>): void
	{
		for (let eff of effects.keys())
		{
			if (monsterLevelAdjustment() + numericModifier(eff, "Monster Level") <= auto_convertDesiredML(ToML))
			{
				buffMaintain$4(eff);
			}
		}
	}
// 5 * level ML up to + 75
	if (auto_wantToBCZ(Skill.get("BCZ: Blood Bath")))
	{
		tryEffects(new Map([[Effect.get("Bloodbathed"), true]]));
	}
// ToML >= U >= 30
	UrKelCheck(ToML, auto_convertDesiredML(ToML), 30);
	angryAgateCheck(ToML, auto_convertDesiredML(ToML), 30);
// 30
	// Start with the biggest and drill down for max ML
	tryEffects(new Map([[Effect.get("Ceaseless Snarling"), true], [Effect.get("Punchable Face"), true], [Effect.get("Zomg WTF"), true]]));
// 29 >= U >= 25
	UrKelCheck(ToML, 29, 25);
	angryAgateCheck(ToML, 29, 25);
// 25
	if (doAltML && monsterLevelAdjustment() + 25 <= auto_convertDesiredML(ToML))
	{
		asdonBuff$1(Effect.get("Driving Recklessly"));
	}
	if (doAltML)
	{
		tryEffects(new Map([[Effect.get("Litterbug"), true], [Effect.get("Sweetbreads Flamb&eacute;"), true]]));
	}
	if (in_amw())
	{
		tryEffects(new Map([[Effect.get("Hamming It Up"), true]]));
	}
// 24 >= U >= 10
	UrKelCheck(ToML, 24, 10);
	angryAgateCheck(ToML, 24, 10);
// 20
	if (isActuallyEd() && !toBoolean(getProperty("auto_needLegs")))
	{
		tryEffects(new Map([[Effect.get("Blessing of Serqet"), true]]));
	}
// 10
	tryEffects(new Map([[Effect.get("Pride of the Puffin"), true], [Effect.get("Drescher's Annoying Noise"), true]]));
	if (doAltML)
	{
		tryEffects(new Map([[Effect.get("Tortious"), true]]));
	}

	if (in_amw())
	{
		tryEffects(new Map([[Effect.get("Acting Jerky"), true]]));
	}
// <10
	//If we can't get 10 turns of Ur-Kel's, and we aren't being forced to pile on the ML, it probably isn't worth it.
	if (doAltML || auto_predictAccordionTurns() >= 10)
	{
		UrKelCheck(ToML, 9, 2);
	}
	angryAgateCheck(ToML, 9, 3);
// Customizable - For variable effects that we can use to fill in the corners
	// Fill in the remainder with MCD
	if (!(Location.get(["The Boss Bat's Lair", "Haert of the Cyrpt", "Throne Room"]).includes(myLocation())))
	{
	  auto_setMCDToCap();
	}

	return true;
}
// ADVENTURE FORCING FUNCTIONS
export function _auto_forceNextNoncombat(loc: Location, speculative: boolean): boolean
{
	// return true if already have a forcer acitve
	if (auto_haveQueuedForcedNonCombat())
	{
		return true;
	}
	// Use stench jelly or other item to set the combat rate to zero until the next noncombat.
	if (auto_pillKeeperFreeUseAvailable())
	{
		if (speculative) { return true; }
		auto_pillKeeper$1("noncombat");
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [free pillkeeper] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "pillkeeper");
		return true;
	}
	else if (!toBoolean(getProperty("_claraBellUsed")) && itemAmount(Item.get("Clara's bell")) > 0 && auto_is_valid(Item.get("Clara's bell")))
	{
		if (speculative) { return true; }
		use(1, Item.get("Clara's bell"));
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [Clara's Bell] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "clara's bell");
		return true;
	}
	else if (auto_haveCincho() && auto_getCinch(60))
	{
		if (speculative) { return true; }
		useSkill(1, Skill.get("Cincho: Fiesta Exit"));
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [Cincho] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "cincho");
		return true;
	}
	else if (auto_AprilTubaForcesLeft() > 0)
	{
		if (speculative) { return true; }
		auto_playAprilTuba();
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [Apriling tuba] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "Apriling tuba");
		return true;
	}
	else if (auto_haveMcHugeLargeSkis() && toInt(getProperty("_mcHugeLargeAvalancheUses")) < 3 && (!in_wereprof() || !is_professor()))
	{ // if we're a professor, we can't use the skis
		if (speculative) { return true; }
		// avalanche require a combat to active
		// this property will cause the left ski to be eqipped and avalanche deployed next combat
		setProperty("auto_forceNonCombatSource", "McHugeLarge left ski");
		// track desired NC location so we know where to go when avalanche is ready
		setProperty("auto_forceNonCombatLocation", loc.toString());
		return true;
	}
	else if (auto_hasParka() && toInt(getProperty("_spikolodonSpikeUses")) < 5 && hasTorso$1() && (!in_wereprof() || !is_professor()))
	{ // if we're a professor, we can't use the spikes
		if (speculative) { return true; }
		// parka spikes require a combat to active
		// this property will cause the parka to be eqipped and spikes deployed next combat
		setProperty("auto_forceNonCombatSource", "jurassic parka");
		// track desired NC location so we know where to go when parka spikes are preped
		setProperty("auto_forceNonCombatLocation", loc.toString());
		return true;
	}
	else if (auto_canARBSupplyDrop())
	{
		if (speculative) { return true; }
		ARBSupplyDrop("sniper support");
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [Allied Radio Backpack] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "Allied Radio Backpack");
		return true;
	}
	else if (itemAmount(Item.get("stench jelly")) > 0 && auto_is_valid(Item.get("stench jelly")) && !isActuallyEd() && spleen_left() >= (Item.get("stench jelly")).spleen)
	{
		if (speculative) { return true; }
		autoChew(1, Item.get("stench jelly"));
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [Stench Jelly] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "stench jelly");
		return true;
	}
	else if (auto_pillKeeperAvailable() && !isActuallyEd() && spleen_left() >= 3)
	{ // don't use Spleen as Ed, it's his main source of adventures.
		if (speculative) { return true; }
		auto_pillKeeper$1("noncombat");
		if (!auto_haveQueuedForcedNonCombat())
		{
			abort("Attempted to force a noncombat with [not free pillkeeper] but was unable to.");
		}
		setProperty("auto_forceNonCombatSource", "pillkeeper");
		return true;
	}

	return false;
}

export function auto_canForceNextNoncombat(): boolean
{
	return _auto_forceNextNoncombat(Location.none, true);
}

export function _auto_forceNextNoncombat$1(loc: Location): boolean
{
	return _auto_forceNextNoncombat(loc, false);
}

export function auto_forceNextNoncombat$1(loc: Location): boolean
{
	if (auto_haveQueuedForcedNonCombat())
	{
		auto_log_warning("Trying to force a noncombat adventure, but I think we've already forced one...", "red");
		return true;
	}
	if (_auto_forceNextNoncombat$1(loc))
	{
		let forceNCMethod: string = getProperty("auto_forceNonCombatSource");
		if (forceNCMethod === "jurassic parka")
		{
			auto_log_info(`Next noncombat adventure will be forced with ${forceNCMethod}`, "blue");
		}
		else {
			auto_log_info(`Next noncombat adventure has been forced with ${forceNCMethod}`, "blue");
		}
		return true;
	}
	return false;
}

export function auto_haveQueuedForcedNonCombat(): boolean
{
	return toBoolean(getProperty("noncombatForcerActive"));
}
// Function to Predict how many turns we will get from an AT buff
export function auto_predictAccordionTurns(): number
{
	// List of all Accordions for AT usage
	let All_Accordions: Map<Item, boolean> = new Map([[Item.get("accord ion"), true], [Item.get("accordion file"), true], [Item.get("Accordion of Jordion"), true], [Item.get("aerogel accordion"), true], [Item.get("antique accordion"), true], [Item.get("accordionoid rocca"), true], [Item.get("alarm accordion"), true], [Item.get("autocalliope"), true], [Item.get("Bal-musette accordion"), true], [Item.get("baritone accordion"), true], [Item.get("beer-battered accordion"), true], [Item.get("bone bandoneon"), true], [Item.get("Cajun accordion"), true], [Item.get("calavera concertina"), true], [Item.get("ghost accordion"), true], [Item.get("guancertina"), true], [Item.get("mama's squeezebox"), true], [Item.get("non-Euclidean non-accordion"), true], [Item.get("peace accordion"), true], [Item.get("pentatonic accordion"), true], [Item.get("pygmy concertinette"), true], [Item.get("quirky accordion"), true], [Item.get("Rock and Roll Legend"), true], [Item.get("Shakespeare's Sister's Accordion"), true], [Item.get("Skipper's accordion"), true], [Item.get("Squeezebox of the Ages"), true], [Item.get("stolen accordion"), true], [Item.get("The Trickster's Trikitixa"), true], [Item.get("toy accordion"), true], [Item.get("warbear exhaust manifold"), true], [Item.get("zombie accordion"), true]]);
	// List of Accordions that Non-AT classes can use
	let NonAT_Accordions: Map<Item, boolean> = new Map([[Item.get("aerogel accordion"), true], [Item.get("antique accordion"), true], [Item.get("toy accordion"), true]]);
	// Choose list to use based on Class
	let accordions: Map<Item, boolean> = (myClass() === Class.get("Accordion Thief") ? All_Accordions : NonAT_Accordions);

	let expTurns: number = 0;
	let CurrentBestTurns: number = 0;

	for (let squeezebox of accordions.keys())
	{
		// Verify that we have the accordion and that it is allowed to be use in path
		if (equipmentAmount(squeezebox) > 0 && auto_is_valid(squeezebox))
		{
			expTurns = toInt(numericModifier(squeezebox, "Song Duration"));

			if (expTurns > CurrentBestTurns)
			{
				CurrentBestTurns = expTurns;
			}
		}
	}

	return CurrentBestTurns;
}

export function hasTTBlessing(): boolean
{
	//do you currently have a turtle blessing active? or if not turtle tamer then the buff?

	for (let eff of Effect.get([
	"Blessing of the War Snapper",
	"Grand Blessing of the War Snapper",
	"Glorious Blessing of the War Snapper",
	"Blessing of She-Who-Was",
	"Grand Blessing of She-Who-Was",
	"Glorious Blessing of She-Who-Was",
	"Blessing of the Storm Tortoise",
	"Grand Blessing of the Storm Tortoise",
	"Glorious Blessing of the Storm Tortoise",
	"Disdain of the War Snapper",
	"Disdain of She-Who-Was",
	"Disdain of the Storm Tortoise"]))
	{
		if (haveEffect(eff) > 0)
		{
			return true;
		}
	}

	return false;
}

export function effectAblativeArmor(passive_dmg_allowed: boolean): void
{
	//when facing a boss that has a buff stripping mechanic that is limited on how many can be stripped per round.
	//then load up on as many reasonable buffs as you can taking cost into account.
	//avoid potentially undesireable effects such as +ML.
	//I am pretty sure non combat skills that give an effect count.
	//but I am labeling them seperate from buffs in case we ever need to split this function.
	//if you have something that reduces the cost of casting buffs, wear it now.
	addToMaximize("-1000mana cost, -tie");
	equipMaximizedGear();
	//Passive damage
	if (passive_dmg_allowed)
	{
		buffMaintain$4(Effect.get("Spiky Shell")); //8 MP
		buffMaintain$4(Effect.get("Jalape&ntilde;o Saucesphere")); //5 MP
		buffMaintain$4(Effect.get("Scariersauce")); //10 MP
		buffMaintain$4(Effect.get("Scarysauce")); //10 MP
		if (in_aosol()) {
			buffMaintain$4(Effect.get("Queso Fustulento")); //10 MP
			buffMaintain$4(Effect.get("Tricky Timpani")); //30 MP
		}
	}
	//1MP Non-Combat skills from each class
	buffMaintain$4(Effect.get("Seal Clubbing Frenzy"));
	buffMaintain$4(Effect.get("Patience of the Tortoise"));
	buffMaintain$4(Effect.get("Pasta Oneness"));
	buffMaintain$4(Effect.get("Saucemastery"));
	buffMaintain$4(Effect.get("Disco State of Mind"));
	buffMaintain$4(Effect.get("Mariachi Mood"));
	//Seal clubber Non-Combat skills
	buffMaintain$4(Effect.get("Blubbered Up")); //7 MP
	buffMaintain$4(Effect.get("Rage of the Reindeer")); //10 MP
	buffMaintain$4(Effect.get("A Few Extra Pounds")); //10 MP
	//Turtle Tamer Non-Combat skills
	if (!hasTTBlessing())
	{
		buffMaintain$4(Effect.get("Blessing of the War Snapper")); //15 MP. other blessings too expensive.
	}
	//Pastamancer Non-Combat skills
	buffMaintain$4(Effect.get("Springy Fusilli")); //10 MP
	buffMaintain$4(Effect.get("Shield of the Pastalord")); //20 MP
	buffMaintain$4(Effect.get("Leash of Linguini")); //12 MP
	//Sauceror Non-Combat skills
	buffMaintain$4(Effect.get("Sauce Monocle")); //20 MP
	//Disco Bandit Non-Combat skills
	buffMaintain$4(Effect.get("Disco Fever")); //10 MP
	//Turtle Tamer Buffs
	buffMaintain$4(Effect.get("Ghostly Shell")); //6 MP
	buffMaintain$4(Effect.get("Tenacity of the Snapper")); //8 MP
	buffMaintain$4(Effect.get("Empathy")); //15 MP
	buffMaintain$4(Effect.get("Thoughtful Empathy")); //15 MP
	buffMaintain$4(Effect.get("Reptilian Fortitude")); //8 MP
	buffMaintain$4(Effect.get("Astral Shell")); //10 MP
	buffMaintain$4(Effect.get("Jingle Jangle Jingle")); //5 MP
	buffMaintain$4(Effect.get("Curiosity of Br'er Tarrypin")); //5 MP
	//Sauceror Buffs
	buffMaintain$4(Effect.get("Elemental Saucesphere")); //10 MP
	buffMaintain$4(Effect.get("Antibiotic Saucesphere")); //15 MP
	//Accordion Thief Buffs. We are not shrugging so it will only apply new ones if we have space for them
	buffMaintain$4(Effect.get("The Moxious Madrigal")); //2 MP
	buffMaintain$4(Effect.get("The Magical Mojomuscular Melody")); //3 MP
	buffMaintain$4(Effect.get("Cletus's Canticle of Celerity")); //4 MP
	buffMaintain$4(Effect.get("Power Ballad of the Arrowsmith")); //5 MP
	buffMaintain$4(Effect.get("Polka of Plenty")); //7 MP
	//Mutually exclusive effects
	if (haveEffect(Effect.get("Musk of the Moose")) === 0 && haveEffect(Effect.get("Hippy Stench")) === 0)
	{
		buffMaintain$4(Effect.get("Smooth Movements")); //10 MP
	}
	if (haveEffect(Effect.get("Smooth Movements")) === 0 && haveEffect(Effect.get("Fresh Scent")) === 0)
	{
		buffMaintain$4(Effect.get("Musk of the Moose")); //10 MP
	}
	//TODO facial expressions, need to check you are not wearing one first and which ones you have
	//Maybe just not do facial expressions? too much complexity for a singular effect.
}

export function currentPoolSkill(): number {
	// format of the cli 'poolskill' command return value is:
	// Pool Skill is estimated at : 12.
	// 0 from equipment, 0 from having 15 inebriety, 2 hustling training and 10 learning from 25 sharks.
	let poolskill_command: Map<number, string> = new Map(splitString(cliExecuteOutput("poolskill")).map((_v, _i) => [_i, _v]));
	return toInt(substring((poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0)), lastIndexOf((poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0)), ":") + 2, length((poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0))) - 1));
}

export function poolSkillPracticeGains(): number
{
	//predict gains from choosing to practice your pool skill (choice 2) in noncombat adv 875 "Welcome To Our ool Table"
	let count_1: number = 1;
	if (haveEffect(Effect.get("Chalky Hand")) > 0) { count_1 += 1; }
	if (equippedAmount(Item.get("[2268]Staff of Fats")) > 0) { //note that $item[[7964]Staff of Fats] does not help here.
	count_1 += 2; }
	return count_1;
}

export function hasUsefulShirt(): boolean
{
	let amtUsefulShirts: number = 0;
	for (let it of Item.get(["January's Garbage Tote", "astral shirt", "shoe ad T-shirt", "fresh coat of paint", "tunac", "Jurassic Parka", "hairshirt", "futuristic shirt"]))
	{
		let w_it: Item = wrap_item(it);
		if (itemAmount(w_it) !== 0 && isUnrestricted(w_it)) { amtUsefulShirts += 1; }
	}
	if (amtUsefulShirts > 0)
	{
		return true;
	}
	else {
		return false;
	}
}

export function meatReserve(): number
{
	//the amount of meat we want to reserve for quest usage when performing a restore
	//note that Adventurer Meats World has its own reserve for buying skills, but uses this function if it is smaller at Lvl 11+
	let reserve_extra: number = 0; //extra reserved for various reasons
	if (in_kolhs())
	{
		reserve_extra += 100;
	}
	if (in_wildfire() && !toBoolean(getProperty("wildfirePumpGreased")) && itemAmount(Item.get("pump grease")) === 0)
	{
		reserve_extra += npcPrice(Item.get("pump grease"));
	}
	if (!hasTorso$1() && hasUsefulShirt() && !gnomadsAvailable() && inGnomeSign())
	{
		reserve_extra += toInt(5000 * npcStoreDiscountMulti()); //Going to need 5k anyway if we need torso so might as well start saving early. Worst case scenario we make a meatcar
	}
	if (!hasTorso$1() && gnomadsAvailable() && hasUsefulShirt())
	{
		reserve_extra += 5000; //we want Torso ASAP if we have a useful shirt
	}

	if (myLevel() < 10)
	{ //meat income is pretty low and the quests that need the reserve far away. Use restores freely
		if (!isDesertAvailable() && inKnollSign() && myLevel() > 5 && myTurncount() > 50)
		{ //reason for both level and turncount being checked is that many iotms could level us on turn 1.
			return 500 + reserve_extra; //reserve some meat for the bitchin' meatcar.
		}
		return reserve_extra;
	}

	let reserve_gnasir: number = 0; //used to track how much we need to reserve for black paint for gnasir
	let reserve_diary: number = 0; //used to track how much we need to reserve to acquire [your father's MacGuffin diary] at L11 quest
	let reserve_zeppelin: number = 0; //used to track how much we need to reserve for a zeppelin ticket
	let reserve_palindome: number = 0; //used to track how much we need to reserve for palindome photographs
	let reserve_island: number = 0; //used to track how much we need to reserve to unlock the mysterious island
	//how much do we reserve for gnasir?
	if (internalQuestStatus("questL11Desert") < 1 && (toInt(
	//bitwise. desert exploration not yet finished
	getProperty("gnasirProgress")) & 2) !== 2)
	{ //gnasir has not been given black paint yet
		reserve_gnasir += 1000;
	}
	//how much do we reserve for [your father's MacGuffin diary]?
	if (itemAmount(Item.get("your father's MacGuffin diary")) === 0 && !in_koe() && !in_wotsf())
	{ //costs 5 meat total in way of the surprising fist. no need to track that
	//you do not yet have diary
	//diary is given by council for free in kingdom of exploathing
		reserve_diary += 500; //1 vacation. no need to count script. we don't pull it or get it prematurely.
		//cannot just use npc_price() for [forged identification documents] because they are not always available. it would return 0.
		if (itemAmount(Item.get("forged identification documents")) === 0)
		{
			reserve_diary += toInt(5000 * npcStoreDiscountMulti());
		}
	}
	//how much do we reserve for a zeppelin ticket?
	if (myLevel() >= 11 && internalQuestStatus("questL11Ron") < 5 && itemAmount(Item.get("Red Zeppelin ticket")) < 1)
	{ //the copperhead part tries for a priceless diamond, but if it's over without getting one
		if ((getProperty("questL11Shen") === "finished" || (Location.get("The Copperhead Club")).turnsSpent >= 15) && itemAmount(Item.get("priceless diamond")) < 1)
			{ reserve_zeppelin += toInt(5000 * npcStoreDiscountMulti()); }
	}
	//how much do we reserve for palindome photographs?
	if (myLevel() >= 11 && internalQuestStatus("questL11Palindome") < 1)
	{
		if (itemAmount(Item.get("photograph of a red nugget")) < 1)
			{ reserve_palindome += 500; }
		if (itemAmount(Item.get("photograph of God")) < 1)
			{ reserve_palindome += 500; }
	}
	//how much do we reserve for unlocking mysterious island?
	if (toInt(getProperty("lastIslandUnlock")) < myAscensions())
	{ //need to unlock island
		let price_vacation: number = 500;
		if (in_wotsf())
		{
		price_vacation = 5; //yes really. just 5 meat each
		}
		//TODO: scrips. they may have been pulled manually, and one optional property does pull them
		reserve_island += price_vacation * 3; //3 vacations

		if (itemAmount(Item.get("dingy planks")) === 0)
		{
			reserve_island += toInt(400 * npcStoreDiscountMulti());
		}
	}

	return reserve_gnasir + reserve_diary + reserve_zeppelin + reserve_palindome + reserve_island + reserve_extra;
}

export function auto_wishForEffectIfNeeded(wish: Effect): boolean
{
	if (haveEffect(wish) > 0)
	{
		return true;
	}
	return auto_wishForEffect(wish);
}

export function auto_wishForEffect(wish: Effect): boolean
{
	// First try to use the monkey paw
	if (auto_haveMonkeyPaw()) {
		if (auto_makeMonkeyPawWish(wish)) { return true; }
	}
	// If we're allowed to use the genie bottle, do that.
	if (auto_haveGenieBottleOrPocketWishes())
	{
		if (makeGenieWish$1(wish)) { return true; }
	}
	return false;
}

export function auto_totalEffectWishesAvailable(): number
{
	return auto_monkeyPawWishesLeft() + auto_wishesAvailable();
}

export function wrap_item(it: Item): Item
{ // convert an item into another item, used for replicas in LoL
	if (in_lol())
	{
		return auto_ItemToReplica(it);
	}
	return it;
}

export function auto_burnMP(mpToBurn: number): boolean
{
	// burn command only extends existing buffs
	// set default skill to cast so MP is burned if we don't have any active buffs
	// only consider the default stating buffs for the 6 standard classes
	let defaultSkill: Skill = Skill.none;
	for (let sk of Skill.get(["Sauce Contemplation", "Seal Clubbing Frenzy", "Patience of the Tortoise", "Manicotti Meditation", "Disco Aerobics", "Moxie of the Mariachi"]))
	{
		if (haveSkill(sk))
		{
			defaultSkill = sk;
			break;
		}
	}

	if (defaultSkill !== Skill.none)
	{
		// only set a default skill if we have one
		setProperty("lastChanceBurn", `cast # ${defaultSkill}`);
	}

	let equipped: Map<number, Item> = auto_saveEquipped();

	addToMaximize("-1000mana cost, -tie");
	equipMaximizedGear();
	auto_equipAprilShieldBuff(); //useful additional buffs when equipped
	// record starting MP
	let startingMP: number = myMp();
	cliExecute(`burn ${mpToBurn}`);
	auto_loadEquipped(equipped);
	removeFromMaximize("-1000mana cost");
	return startingMP !== myMp();
}

export function can_read_skillbook(it: Item): boolean {
	// can't read in Nuclear Autumn, Picky, Pokefam, Class Act or Journeyman
	if (in_nuclear() || in_picky() || in_pokefam() || in_class_act() || in_class_act_two() || in_journeyman()) {
		return false;
	}
	// robots can read the emotion chip and nothing else
	if (in_robot()) {
		return it === Item.get("spinal-fluid-covered emotion chip");
	}
	// all the normal classes and AoSOL classes are literate
	if (Class.get(["Seal Clubber", "Turtle Tamer", "Sauceror", "Pastamancer", "Disco Bandit", "Accordion Thief", "Pig Skinner", "Cheese Wizard", "Jazz Agent"]).includes(myClass())) {
		return true;
	}
	return false;
}

export function have_workshed(): boolean {
	if (in_small()) {
		return true;
	}
	return haveCampground();
}

export function baseNCForcesToday(): number
{
	let forces: number = 0;
	if (auto_havePillKeeper()) { forces = forces + 6; }
	if (auto_haveAprilingBandHelmet() && availableAmount(Item.get("Apriling band tuba")) > 0) { forces = forces + 3; }
	if (auto_haveMcHugeLargeSkis()) { forces = forces + 3; }
	if (auto_hasParka()) { forces = forces + 5; }
	if (auto_haveCincho()) { // Not important to calculate this properly here.
	forces = forces + 3; }
	if (auto_haveARB()) { forces = forces + 3; }
	return forces;
}

export function remainingNCForcesToday(): number
{
	let forces: number = 0;
	forces = forces + auto_pillKeeperUses();
	forces = forces + auto_AprilTubaForcesLeft();
	forces = forces + auto_McLargeHugeForcesLeft();
	forces = forces + auto_ParkaSpikeForcesLeft();
	forces = forces + auto_cinchForcesLeft();
	forces = forces + auto_ARBSupplyDropsLeft();

	return forces;
}

export function turnsUsedByRemainingNCForcesToday(): number
{
	let forces: number = 0;
	forces = forces + auto_pillKeeperUses();
	forces = forces + auto_AprilTubaForcesLeft();
	forces = forces + 2 * auto_McLargeHugeForcesLeft();
	forces = forces + 2 * auto_ParkaSpikeForcesLeft();
	forces = forces + auto_cinchForcesLeft();
	forces = forces + auto_ARBSupplyDropsLeft();

	return forces;
}

export function substat_to_level(): number
{
	return substat_to_level$1(myBasestat(stat_to_substat(myPrimestat())));
}

export function substat_to_level$1(n: number): number
{
	if (n <= 16)
	{
		return 1; // All substats less than 16 are level 1, before the formula takes effect
	}
	return squareRoot(squareRoot(n) - 4) + 1;
}

export function level_to_min_substat(n: number): number
{
	return ((n - 1) ** 2 + 4) ** 2;
}

export function level_to_min_substat$1(): number
{
	return level_to_min_substat(myLevel());
}

export function stat_to_substat(s: Stat): Stat
{
	switch (s)
	{
		case Stat.get("Muscle"):
			return Stat.get("SubMuscle");
		case Stat.get("Mysticality"):
			return Stat.get("SubMysticality");
		case Stat.get("Moxie"):
			return Stat.get("SubMoxie");
	}
	return s;
}

export function stat_exp_percent(s: Stat): number
{
	switch (s)
	{
		case Stat.get("Muscle"):
		case Stat.get("SubMuscle"):
			return numericModifier(Modifier.get("Muscle Experience Percent"));
		case Stat.get("Mysticality"):
		case Stat.get("SubMysticality"):
			return numericModifier(Modifier.get("Mysticality Experience Percent"));
		case Stat.get("Moxie"):
		case Stat.get("SubMoxie"):
			return numericModifier(Modifier.get("Moxie Experience Percent"));
	}
	return 0;
}

export function auto_equalizeStats(): boolean
{
	let highest_basestat: Stat = myPrimestat();
	let highest_basestat_val: number = myBasestat(highest_basestat);
	for (let s of Stat.get(["Muscle", "Mysticality", "Moxie"]))
	{
		let val: number = myBasestat(s);
		if (val > highest_basestat_val)
		{
			highest_basestat_val = val;
			highest_basestat = s;
		}
	}
	switch (highest_basestat)
	{
		case Stat.get("Muscle"):
			return buffMaintain$4(Effect.get("Stabilizing Oiliness"));
		case Stat.get("Mysticality"):
			return buffMaintain$4(Effect.get("Expert Oiliness"));
		case Stat.get("Moxie"):
			return buffMaintain$4(Effect.get("Slippery Oiliness"));
	}
	return false;
}

export function auto_getListOfNonDamagingFamiliarEquipment(): Map<number, Item>
{
	// Returns items of generic familiar equipment that do not cause damage when equipped to a non-damage familiar
	// Sorted by familiar weight boost, highest to lowest
	let base_list: Item[] = Item.get(["astral pet sweater", "tiny stillsuit", "tiny gold medal", "lead necklace",
	  "futuristic collar", "miniature crystal ball", "tiny rake", "toy Cupid bow"]);
	let valid_and_available: Map<Item, boolean> = new Map();
	for (let it of base_list)
	{
		if (auto_is_valid(it) && availableAmount(it) > 0)
		{
			valid_and_available.set(it, true);
		}
	}
	// Have to sort each time because futuristic collar changes
	return auto_sortedByModifier$3(valid_and_available, Modifier.get("Familiar Weight"), true);
}

export function auto_getOffStatChallengeFromTelescope(): Stat
{
	let musc: string = "standing around flexing";
	let myst: string = "sitting around playing chess";
	let moxie: string = "all wearing sunglasses and dancing";
	let scope: string = getProperty("telescope1");

	if (containsText(scope, musc))
	{
		return Stat.get("Muscle");
	}
	else if (containsText(scope, myst))
	{
		return Stat.get("Mysticality");
	}
	else if (containsText(scope, moxie))
	{
		return Stat.get("Moxie");
	}
	return Stat.none;
}

export function auto_getElementChallengeFromTelescope(): Element
{
	let hot: string = "fire";
	let cold: string = "igloos";
	let spooky: string = "eldritch";
	let sleaze: string = "greasy";
	let stench: string = "garbage";
	let scope: string = getProperty("telescope2");

	if (containsText(scope, hot))
	{
		return Element.get("hot");
	}
	else if (containsText(scope, cold))
	{
		return Element.get("cold");
	}
	else if (containsText(scope, spooky))
	{
		return Element.get("spooky");
	}
	else if (containsText(scope, sleaze))
	{
		return Element.get("sleaze");
	}
	else if (containsText(scope, stench))
	{
		return Element.get("stench");
	}
	return Element.none;
}

export function auto_amIRich(): boolean
{
	return myMeat() > meatReserve() + 5000;
}

export function auto_roughExpectedTurnsLeftToday(): number
{
	// Not designed to be accurate, just simple.
	// Designed to be relatively stable, and more likely to come in low than high.
	// If you want to improve the accuracy, please keep the above two principles in mind.
	if (myInebriety() > inebrietyLimit()) { return 0; }
	let min_adv: number = toFloat(getProperty("auto_consumeMinAdvPerFill"));
	let use_min_adv: boolean = min_adv > 0.0;
	let p: Path = myPath();
	let eat_val: number = (use_min_adv ? min_adv : 3.0);
	let drink_val: number = (use_min_adv ? min_adv : 3.5);
	let spl_val: number = (haveSpleenFamiliar() ? 2 : 0);
	let curr: number = myAdventures();
	let stom: number = stomach_left();
	let liv: number = inebriety_left();
	let spl: number = spleen_left();
	if (p === Path.get("Dark Gyffte"))
	{
		return curr + floor(7 * availableAmount(Item.get("blood bag")));
	}
	else if (p === Path.get("Slow and Steady"))
	{
		return curr;
	}
	else if (p === Path.get("A Shrunken Adventurer am I"))
	{
		return curr + floor(10 * stom * eat_val + 10 * liv * drink_val + spl * spl_val);
	}
	else if (p === Path.get("Actually Ed the Undying"))
	{
		spl_val = 5.0;
	}
	else if (p === Path.get("Avatar of Jarlsberg"))
	{
		drink_val = 1.0;
	}
	else if (p === Path.get("KOLHS"))
	{
		drink_val = 2.5;
	}
	return curr + floor(stom * eat_val + liv * drink_val + spl * spl_val);
}

let $_auto_wantToFreeKillWithNoDrops_targets: Monster[] | undefined;

export function auto_wantToFreeKillWithNoDrops(loc: Location, enemy: Monster): boolean
{
	// only want certain enemies to free-kill in Avant Guard
	if (in_avantGuard())
	{
		if (enemy.physicalResistance >= 100 && enemy.elementalResistance >= 100)
		{
			return true;
		}
		//This is called in stage2 and auto_purple_candled is set in stage 4 so this should only ever show up on the purple candled enemy
		if (toMonster(getProperty("auto_purple_candled")) === enemy)
		{
			return true;
		}
		return false;
	}
	// many monsters in these zones with similar names
	if (loc === Location.get("The Battlefield (Frat Uniform)") && containsText(enemy.toString(), "War Hippy") || ["Bailey's Beetle", "Mobile Armored Sweat Lodge"].includes(enemy.toString()))
	{
		return true;
	}
	if (loc === Location.get("The Battlefield (Hippy Uniform)") && containsText(enemy.toString(), "War Frat"))
	{
		return true;
	}
	if (enemy.physicalResistance >= 100 && enemy.elementalResistance >= 100)
	{
		return true;
	}
	// look for specific monsters in zones where some monsters we do care about
	$_auto_wantToFreeKillWithNoDrops_targets ??= Monster.get([
		// The Haunted Bathroom
		"claw-foot bathtub",
		"malevolent hair clog",
		"toilet papergeist",
		// The Haunted Gallery
		"cubist bull",
		"empty suit of armor",
		"guy with a pitchfork, and his wife",
		// The Haunted Bedroom
		"animated mahogany nightstand",
		"animated ornate nightstand",
		"animated rustic nightstand",
		"elegant animated nightstand",
		"Wardr&ouml;b nightstand",
		// The Haunted Wine Cellar
		"skeletal sommelier",
		// The Haunted Laundry Room
		"plaid ghost",
		"possessed laundry press",
		// The Haunted Boiler Room
		"coaltergeist",
		"steam elemental",
		// The 8-bit realm
		"Octorok",
		"Keese",
		"Tektite",
		"Zol",
		"Blader",
		"Met",
		"Tackle Fire",
		"Blooper",
		"Bullet Bill",
		"Buzzy Beetle",
		"Goomba",
		"Koopa Troopa",
		"fleaman",
		"ghost",
		"medusa"]);
	return $_auto_wantToFreeKillWithNoDrops_targets.includes(enemy);
}

export function auto_ignoreExperience(): boolean
{
	return in_zootomist();
}

export function auto_needAccordion(): boolean
{
	if (is_boris() || is_jarlsberg() || is_pete() || isActuallyEd() || in_darkGyffte() || in_plumber() || in_wereprof() || in_zootomist())
	{
		return false;
	}
	return true;
}

export function auto_inRonin(): boolean
{
	return !(canInteract() || inHardcore());
}

export function resistanceModifier(el: Element): Modifier
{
	switch (el)
	{
		case Element.get("hot"):		return Modifier.get("Hot Resistance");
		case Element.get("cold"):		return Modifier.get("Cold Resistance");
		case Element.get("stench"):		return Modifier.get("Stench Resistance");
		case Element.get("spooky"):		return Modifier.get("Spooky Resistance");
		case Element.get("sleaze"):		return Modifier.get("Sleaze Resistance");
	}
	return Modifier.none;
}

export function damageModifier(el: Element): Modifier
{
	switch (el)
	{
		case Element.get("hot"):		return Modifier.get("Hot Damage");
		case Element.get("cold"):		return Modifier.get("Cold Damage");
		case Element.get("stench"):		return Modifier.get("Stench Damage");
		case Element.get("spooky"):		return Modifier.get("Spooky Damage");
		case Element.get("sleaze"):		return Modifier.get("Sleaze Damage");
	}
	return Modifier.none;
}

export function spellDamageModifier(el: Element): Modifier
{
	switch (el)
	{
		case Element.get("hot"):		return Modifier.get("Hot Spell Damage");
		case Element.get("cold"):		return Modifier.get("Cold Spell Damage");
		case Element.get("stench"):		return Modifier.get("Stench Spell Damage");
		case Element.get("spooky"):		return Modifier.get("Spooky Spell Damage");
		case Element.get("sleaze"):		return Modifier.get("Sleaze Spell Damage");
	}
	return Modifier.none;
}

export function auto_getElementalDamageMultiplier(source: Element, target: Element): number
{
	if (source === target) { return 0.0; }
	if (source === Element.get("cold") && Element.get(["sleaze", "stench"]).includes(target)) { return 2.0; }
	if (source === Element.get("hot") && Element.get(["cold", "spooky"]).includes(target)) { return 2.0; }
	if (source === Element.get("sleaze") && Element.get(["hot", "stench"]).includes(target)) { return 2.0; }
	if (source === Element.get("spooky") && Element.get(["cold", "sleaze"]).includes(target)) { return 2.0; }
	if (source === Element.get("stench") && Element.get(["hot", "spooky"]).includes(target)) { return 2.0; }
	return 1.0;
}


export function auto_remainingShantyTurns(): number
{
	let turns: number = 0;
	for (let ef of Effect.get(["Who's Going to Pay This Drunken Sailor?", "Only Dogs Love a Drunken Sailor",
	  "I'm Smarter Than a Drunken Sailor", "Look At That Drunken Sailor Dance", "Let's Beat Up This Drunken Sailor"]))
	{
		turns = max(turns, haveEffect(ef));
	}
	return turns;
}

export function auto_meetsMinimumRequirements(): boolean
{
	// If we're not a base class, we don't need perms
	if (myClass().id > 6)
	{
		return true;
	}
	// If we're in bad moon we have other checks for that
	if (inBadMoon())
	{
		return true;
	}
	// If we're in Nuclear Autumn, You, Robot, Journeyman, Pokefam, or
	// either of the Class Acts, we can't meet these requirements by default.
	// So we're not going to block for this reason. We may well yet block for other reasons.
	if (in_nuclear() || in_robot() || in_journeyman() || in_pokefam() || in_class_act() || in_class_act_two())
	{
		return true;
	}
	// Otherwise, we just need Saucestorm and Cocoon.
	return haveSkill(Skill.get("Saucestorm")) && haveSkill(Skill.get("Cannelloni Cocoon"));
}
