import { Coinmaster, Effect, Element, Familiar, Item, Location, Modifier, Monster, Skill, Slot, abort, availableAmount, buy, cliExecute, containsText, creatableAmount, create, equippedItem, getClanId, getProperty, gitExists, handlingChoice, haveEffect, itemAmount, lastChoice, min, myAscensions, myBasestat, myFamiliar, myHash, myLevel, myPrimestat, numericModifier, runChoice, setProperty, splitString, substring, toBoolean, toInt, toLowerCase, toSkill, use, useFamiliar, useSkill, visitUrl } from "kolmafia";
import { autoAdvBypass$6 } from "../auto_adventure";
import { fullness_left } from "../auto_consume";
import { equipMaximizedGear, possessEquipment } from "../auto_equipment";
import { auto_have_familiar } from "../auto_familiar";
import { provideResistances } from "../auto_providers";
import { auto_get_campground, auto_ignoreExperience, auto_is_valid, auto_is_valid$2, auto_log_debug$1, auto_log_error, auto_log_info, auto_log_info$1, auto_wishForEffectIfNeeded, handleTracker$1, internalQuestStatus, stat_exp_percent, stat_to_substat, substat_to_level$1 } from "../auto_util";
import { canUse$2 } from "../combat/auto_combat_util";
import { auto_get_clan_lounge, canReturnToCurrentClan, changeClan$1, changeClan$2, getBAFHID, isWhitelistedToBAFH } from "./clan";
import { auto_getCitizenZone$1, auto_haveCincho } from "./mr2023";
import { auto_openMcLargeHugeSkis, beretBusk } from "./mr2025";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_bhy } from "../paths/bees_hate_you";
import { in_glover } from "../paths/g_lover";
import { in_hattrick } from "../paths/hattrick";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lta } from "../paths/license_to_adventure";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_zootomist } from "../paths/zootomist";
import { bridgeGoal, fastenerCount, lumberCount } from "../quests/level_09";
import { c2t_apron$1 } from "../../c2t_apron";
import { c2t_megg_eggs, c2t_megg_extract, c2t_megg_maxed, c2t_megg_preAdv } from "../../c2t_megg";

// This is meant for items that have a date of 2024
// used in consumeBlackAndWhiteApronKit()
// used in chest mimic

//Defined in autoscend/iotms/mr2024.ash
export function consumeBlackAndWhiteApronKit(): boolean
{
	const apronKit: Item = Item.get("Black and White Apron Meal Kit");
	if (fullness_left() < 3)
	{
		return false;
	}
	if (itemAmount(apronKit) < 1)
	{
		return false;
	}

	if (!gitExists("C2Talon-c2t_apron-master"))
	{
		abort("script c2t_apron didn't install properly. Fix and run autoscend again.");
	}
	// default ingredient allow list. Allow all but:
	// Potentially quest relevant: Blackberry, Bubblin' crude, enchanted bean
	// Extra cold damage: grapefruit
	// 20ml: dill
	let allowList: string = "3489,1356,1560,2525,3490,748,1562,1557,1561,3491,\n1122,1559,2094,183,182,2338,237,787,1004,238,328,1005,2583,1006,589,672,2524,304,6724,\n1462,161,158,358,2589,55,302,332,170,2532,187,357,245,242,4956,830,165,1003,8,786,1558,\n246,4,159,209";
	// allow quest items if no longer needed
	if (possessEquipment(Item.get("blackberry galoshes")) || itemAmount(Item.get("blackberry")) > 3)
	{
		allowList += ",2063";
	}
	const oilProgress: number = toInt(getProperty("twinPeakProgress"));
	if ((oilProgress & 4) === 1 || itemAmount(Item.get("jar of oil")) > 0 || itemAmount(Item.get("bubblin' crude")) > 12)
	{
		allowList += ",5789";
	}
	if (itemAmount(Item.get("enchanted bean")) > 1 || internalQuestStatus("questL10Garbage") >= 1)
	{
		allowList += ",186";
	}
	setProperty("c2t_apron_allowlist", allowList);
	// consume the apron kit using c2t's script
	// this will default to consuming food for our current mainstat
	// https://github.com/C2Talon/c2t_apron
	return c2t_apron$1();
}

export function auto_haveSpringShoes(): boolean
{
	if (auto_is_valid(Item.get("spring shoes")) && availableAmount(Item.get("spring shoes")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_haveAprilingBandHelmet(): boolean
{
	if (auto_is_valid(Item.get("Apriling band helmet")) && availableAmount(Item.get("Apriling band helmet")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_getAprilingBandItems(): boolean
{
	if (!auto_haveAprilingBandHelmet()) { return false; }
	const have_sax: boolean = availableAmount(Item.get("Apriling band saxophone")) > 0;
	const have_tuba: boolean = availableAmount(Item.get("Apriling band tuba")) > 0;
	const have_picc: boolean = availableAmount(Item.get("Apriling band piccolo")) > 0;
	function instruments_so_far(): number
	{
		return toInt(getProperty("_aprilBandInstruments"));
	}
	function track(it: Item): void
	{
		if (availableAmount(it) > 0) { handleTracker$1(Item.get("Apriling band helmet").toString(), `Claimed ${it}`, "auto_iotm_claim"); }
	}
	if (in_zootomist() && myLevel() < 13)
	{
		if (!have_picc && instruments_so_far() < 2) {
			cliExecute("aprilband item piccolo");
			track(Item.get("Apriling band piccolo"));
		}
	}
	if (!have_tuba && instruments_so_far() < 2) {
		cliExecute("aprilband item tuba");
		track(Item.get("Apriling band tuba"));
	}
	if (!have_sax && instruments_so_far() < 2) {
		cliExecute("aprilband item saxophone");
		track(Item.get("Apriling band saxophone"));
	}

	return instruments_so_far() === 2;
}

export function auto_playAprilPiccolo(): boolean
{
	const f: Familiar = myFamiliar();
	let success: boolean = false;
	if (f !== Familiar.none)
	{
		const startexp: number = f.experience;
		cliExecute("aprilband play piccolo");
		success = f.experience > startexp;
	}
	const tracker: string = (in_zootomist() ? "auto_tracker_path" : "auto_otherstuff");
	handleTracker$1(Item.get("Apriling band piccolo").toString(), `${(success ? "Played" : "Failed to play")} to ${f}`, tracker);
	return success;
}

export function auto_playAprilSax(): boolean
{
	cliExecute("aprilband play saxophone");
	return toBoolean(haveEffect(Effect.get("Lucky!")));
}

export function auto_playAprilTuba(): boolean
{
	cliExecute("aprilband play tuba");
	return toBoolean(getProperty("noncombatForcerActive"));
}

export function auto_setAprilBandNonCombat(): boolean
{
	if (toBoolean(haveEffect(Effect.get("Apriling Band Patrol Beat")))) { return true; }
	if (!auto_haveAprilingBandHelmet()) { return false; }
	cliExecute("aprilband effect nc");
	return toBoolean(haveEffect(Effect.get("Apriling Band Patrol Beat")));
}

export function auto_setAprilBandCombat(): boolean
{
	if (toBoolean(haveEffect(Effect.get("Apriling Band Battle Cadence")))) { return true; }
	if (!auto_haveAprilingBandHelmet()) { return false; }
	cliExecute("aprilband effect c");
	return toBoolean(haveEffect(Effect.get("Apriling Band Battle Cadence")));
}

function auto_setAprilBandDrops(): boolean
{
	if (toBoolean(haveEffect(Effect.get("Apriling Band Celebration Bop")))) { return true; }
	if (!auto_haveAprilingBandHelmet()) { return false; }
	cliExecute("aprilband effect drop");
	return toBoolean(haveEffect(Effect.get("Apriling Band Celebration Bop")));
}

export function auto_AprilSaxLuckyLeft(): number
{
	if (!auto_haveAprilingBandHelmet()) { return 0; }
	if (availableAmount(Item.get("Apriling band saxophone")) === 0) { return 0; }
	return 3 - toInt(getProperty("_aprilBandSaxophoneUses"));
}

export function auto_AprilTubaForcesLeft(): number
{
	if (!auto_haveAprilingBandHelmet()) { return 0; }
	if (availableAmount(Item.get("Apriling band tuba")) === 0) { return 0; }
	return 3 - toInt(getProperty("_aprilBandTubaUses"));
}

export function auto_AprilPiccoloBoostsLeft(): number
{
	if (!auto_haveAprilingBandHelmet()) { return 0; }
	if (availableAmount(Item.get("Apriling band piccolo")) === 0) { return 0; }
	return 3 - toInt(getProperty("_aprilBandPiccoloUses"));
}

export function auto_haveDarts(): boolean
{
	if (auto_is_valid(Item.get("Everfull Dart Holster")) && possessEquipment(Item.get("Everfull Dart Holster")))
	{
		return true;
	}
	return false;
}

export function dartChoiceHandler(choice: number, options: Map<number, string>): void
{
	auto_log_info(`dartChoiceHandler Running choice ${choice}`, "blue");

	let dcchoice: number = 0;
	for (const [idx, str] of options)
	{
		auto_log_info(`choice ${idx} is ${str}`, "blue");
	}
	for (const perk of ["impress", "better", "targeting", "butt"])
	{ //Ranked as 1. Shorter ELR CD, 2. bullseye chance, 3. Butt Awareness, 4. Everything else
		for (const [idx, str] of options)
		{
			if (containsText(toLowerCase(str), perk))
			{
				dcchoice = idx;
				break;
			}
		}
		if (dcchoice !== 0) { break; }
	}
	if (dcchoice === 0) { //if choice is not set, just choose the 1st option
	dcchoice = 1; }
	runChoice(dcchoice);
}

function dartBullseyeChance(): number
{
	let perks: Map<number, string> = new Map();
	let chance: number = 25; // base bullseye chance is 25%
	perks = new Map(splitString(toLowerCase(getProperty("everfullDartPerks")), ",").map((_v, _i) => [_i, _v]));
	for (const perk of perks.keys())
	{
		if (containsText((perks.get(perk) ?? perks.set(perk, "").get(perk)), "better") || containsText((perks.get(perk) ?? perks.set(perk, "").get(perk)), "targeting"))
		{
			chance += 25;
		}
	}
	return chance;
}

export function dartELRcd(): number
{
	let perks: Map<number, string> = new Map();
	let cd: number = 50; // base cd is 50 turns
	perks = new Map(splitString(toLowerCase(getProperty("everfullDartPerks")), ",").map((_v, _i) => [_i, _v]));
	for (const perk of perks.keys())
	{
		if (containsText((perks.get(perk) ?? perks.set(perk, "").get(perk)), "impress"))
		{
			cd -= 10;
		}
	}
	return cd;
}

export function dartSkill(): Skill
{
	let curDartboard: Map<number, string> = new Map();
	curDartboard = new Map(splitString(toLowerCase(getProperty("_currentDartboard")), ",").map((_v, _i) => [_i, _v]));
	for (const sk of curDartboard.keys())
	{
		if (containsText((curDartboard.get(sk) ?? curDartboard.set(sk, "").get(sk)), "butt"))
		{ // get more items
			auto_log_info("Going for the butt", "blue");
			return toSkill(toInt(substring((curDartboard.get(sk) ?? curDartboard.set(sk, "").get(sk)), 0, 4)));
		}
		else if (containsText((curDartboard.get(sk) ?? curDartboard.set(sk, "").get(sk)), "torso") || containsText(sk.toString(), "pseudopod"))
		{ //get more meat
			auto_log_info("Going for the chest", "blue");
			return toSkill(toInt(substring((curDartboard.get(sk) ?? curDartboard.set(sk, "").get(sk)), 0, 4)));
		}
	}
	return toSkill(7513); // If there aren't any darts available return the Darts: Throw at %PART1
}

export function dartEleDmg(): boolean
{
	const perks: string = toLowerCase(getProperty("everfullDartPerks"));
	if (containsText(perks, "add "))
	{ // Only ele dmg perks have "add " in their perk description so as long as we have 1, we are good
		return true;
	}
	return false;
}

export function auto_haveMayamCalendar(): boolean
{
	if (!in_lol() && auto_is_valid(Item.get("Mayam Calendar")) && availableAmount(Item.get("Mayam Calendar")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_MayamIsUsed(glyph: string): boolean
{
	const used: Map<number, string> = new Map(splitString(getProperty("_mayamSymbolsUsed"), ",").map((_v, _i) => [_i, _v]));
	for (const [idx, str] of used)
	{
		if (glyph === str)
		{
			return true;
		}
	}
	return false;
}

export function auto_MayamAllUsed(): boolean
{
	// mayam is currently fully used if all 3 ring1 symbols have been used
	return auto_MayamIsUsed("yam4") && auto_MayamIsUsed("clock") && auto_MayamIsUsed("explosion");
}

export function auto_MayamClaim(str: string): boolean
{
	if (!auto_haveMayamCalendar())
	{
		return false;
	}
	const rings: Map<number, string> = new Map(splitString(str, " ").map((_v, _i) => [_i, _v]));
	for (const [i, s] of rings)
	{
		if (auto_MayamIsUsed(s)) { return false; }
	}
	cliExecute(`mayam rings ${str}`);
	handleTracker$1("Mayam Calendar", `Claimed ${str}`, "auto_iotm_claim");
	return true;
}

function auto_MayamClaimStinkBomb(): boolean
{
	if (!auto_haveMayamCalendar())
	{
		return false;
	}
	if (auto_MayamIsUsed("vessel") || auto_MayamIsUsed("yam2") || auto_MayamIsUsed("cheese") || auto_MayamIsUsed("explosion"))
	{
		return false;
	}
	const it: Item = Item.get("stuffed yam stinkbomb");
	const n_start: number = availableAmount(it);
	cliExecute("mayam rings vessel yam cheese explosion");
	if (availableAmount(it) > n_start)
	{
		handleTracker$1("Mayam Calendar", `Claimed ${it}`, "auto_iotm_claim");
		return true;
	}
	return false;
}

function auto_MayamClaimBelt(): boolean
{
	if (!auto_haveMayamCalendar())
	{
		return false;
	}
	if (auto_MayamIsUsed("yam1") || auto_MayamIsUsed("meat") || auto_MayamIsUsed("eyepatch") || auto_MayamIsUsed("yam4"))
	{
		return false;
	}
	const it: Item = Item.get("yamtility belt");
	const n_start: number = availableAmount(it);
	cliExecute("mayam rings yam meat eyepatch yam");
	if (availableAmount(it) > n_start)
	{
		handleTracker$1("Mayam Calendar", `Claimed ${it}`, "auto_iotm_claim");
		return true;
	}
	return false;
}

function auto_MayamClaimWhatever(): boolean
{
	if (!auto_haveMayamCalendar())
	{
		return false;
	}
	let ring1: string = "BAD_VALUE";
	let ring2: string = "BAD_VALUE";
	let ring3: string = "BAD_VALUE";
	let ring4: string = "BAD_VALUE";
	let failure: boolean = false;

	if (!auto_MayamIsUsed("fur") && auto_haveChestMimic() && (Familiar.get("Chest Mimic")).experience <= 300) { ring1 = "fur"; useFamiliar(Familiar.get("Chest Mimic")); }
	else if (!auto_MayamIsUsed("chair") && auto_haveCincho()) { ring1 = "chair"; }
	else if (!auto_MayamIsUsed("eye")) { ring1 = "eye"; }
	else if (!auto_MayamIsUsed("vessel")) { ring1 = "vessel"; }
	else { failure = true; }

	if (!auto_MayamIsUsed("wood") && (lumberCount() < 30 || fastenerCount() < 30)) { ring2 = "wood"; }
	else if (!auto_MayamIsUsed("lightning")) { ring2 = "lightning"; }
	else if (!auto_MayamIsUsed("meat")) { ring2 = "meat"; }
	else { failure = true; }

	const going_to_use_mouthwash: boolean = myLevel() < 13 && remainingEmbers() >= 2;
	// in LTA one more yam martini is more valuable than +2 res for levelling
	if (going_to_use_mouthwash && !in_lta() && !auto_MayamIsUsed("wall")) { ring3 = "wall"; }
	else if (!auto_MayamIsUsed("yam3")) { ring3 = "yam"; }
	else if (!auto_MayamIsUsed("cheese")) { ring3 = "cheese"; }
	else if (!auto_MayamIsUsed("wall")) { ring3 = "wall"; }
	else { failure = true; }

	if (!auto_MayamIsUsed("yam4")) { ring4 = "yam"; }
	else if (!auto_MayamIsUsed("clock")) { ring4 = "clock"; }
	else if (!auto_MayamIsUsed("explosion")) { ring4 = "explosion"; }
	else { failure = true; }
	if (failure)
	{
		return false;
	}

	cliExecute(`mayam rings ${ring1} ${ring2} ${ring3} ${ring4}`);
	return true;
}

export function auto_MayamClaimAll(): boolean
{
	if (!auto_haveMayamCalendar())
	{
		return false;
	}
	if (auto_MayamAllUsed())
	{
		return false;
	}
	auto_log_info$1("Claiming mayam calendar items");
	auto_MayamClaimStinkBomb();
	auto_MayamClaimBelt();

	if (!in_zootomist() || myLevel() >= 13)
	{
		auto_MayamClaimWhatever();
		auto_MayamClaimWhatever();
		auto_MayamClaimWhatever();
	}
	return true;
}

export function auto_haveRoman(): boolean
{
	if (auto_is_valid(Item.get("Roman Candelabra")) && possessEquipment(Item.get("Roman Candelabra")))
	{
		return true;
	}
	return false;
}

export function auto_haveBatWings(): boolean
{
	if (auto_is_valid(Item.get("bat wings")) && possessEquipment(Item.get("bat wings")))
	{
		return true;
	}
	return false;
}

export function auto_canLeapBridge(): boolean
{
	// bat wings allow for us to leap bridge at 5/6 progress (25 of 30)
	if (!auto_haveBatWings())
	{
		return false;
	}
	if (fastenerCount() < 25 || lumberCount() < 25)
	{
		return false;
	}
	return true;
}

export function auto_swoopsRemaining(): number
{
	if (!auto_haveBatWings())
	{
		return 0;
	}
	return 11 - toInt(getProperty("_batWingsSwoopUsed"));
}

export function auto_haveSeptEmberCenser(): boolean
{
	if (in_koe()) {
		return false; // shop is inaccessible in Kingdom of Exploathing
	}
	if (auto_is_valid(Item.get("Sept-Ember Censer")) && availableAmount(Item.get("Sept-Ember Censer")) > 0)
	{
		return true;
	}
	return false;
}

function remainingEmbers(): number
{
	if (!auto_haveSeptEmberCenser())
	{
		return 0;
	}
	if (!toBoolean(getProperty("_septEmberBalanceChecked")))
	{
		// go to ember shop to check our balance
		use(Item.get("Sept-Ember Censer"));
	}
	return toInt(getProperty("availableSeptEmbers"));
}

export function auto_goingToMouthwashLevel(): boolean
{
	if (!auto_haveSeptEmberCenser())
	{
		return false;
	}
	if (auto_ignoreExperience())
	{
		return false;
	}
	if (in_glover() || in_bhy() || in_plumber() || in_amw())
	{
		return false;
	}
	const disregard_karma: boolean = toBoolean(getProperty("auto_disregardInstantKarma"));
	// If we have at least 4 embers remaining, don't overlevel, they can be used for something else
	const happy_to_overlevel: boolean = disregard_karma && remainingEmbers() < 4;
	let want_to_mouthwash_level: boolean = myLevel() < 13 || happy_to_overlevel;
	// Even disregarding karma, never level above 15 using mouthwash as a sanity limit
	want_to_mouthwash_level = want_to_mouthwash_level && myLevel() < 15;
	return remainingEmbers() >= 2 && want_to_mouthwash_level;
}

export function auto_buyFromSeptEmberStore(): void
{
	if (!auto_haveSeptEmberCenser())
	{
		return;
	}
	if (remainingEmbers() === 0)
	{
		return;
	}
	// mouthwash for leveling
	const mouthwash: Item = Item.get("Mmm-brr! brand mouthwash");
	auto_openMcLargeHugeSkis(); // make sure our skis are open for cold res
	for (let imw: number = 0; imw < 3; imw++)
	{ // We can use up to 3 mouthwash
		const last_res: number = 0;
		if (auto_goingToMouthwashLevel())
		{
			// get as much cold res as possible
			const resGoal: Map<Element, number> = new Map();
			resGoal.set(Element.get("cold"), 100);
			// get cold res. Use noob cave as generic place holder
			// get 1 bembershoot to support mouthwash leveling or general quest help
			const bember: Item = Item.get("bembershoot");
			if (remainingEmbers() % 2 === 1 && !possessEquipment(bember) && auto_is_valid(bember))
			{
				buy(Coinmaster.get("Sept-Ember Censer"), 1, bember);
			}

			provideResistances(resGoal, Location.get("Noob Cave"), true, true, false);
			equipMaximizedGear();
			// We could have left-hand if our off-hand is strong enough
			const cold_res_from_oh: number = numericModifier(equippedItem(Slot.get("off-hand")), Modifier.get("Cold Resistance"));
			// McHugeLarge outfit off-hand is +3 cold res when whole outfit equipped, but not reported by Mafia with above check
			const using_mchugelarge_oh: boolean = equippedItem(Slot.get("off-hand")) === Item.get("McHugeLarge left pole");
			if (using_mchugelarge_oh || cold_res_from_oh > 2.9)
			{
				const lefty: Skill = Skill.get("Aug. 13th: Left/Off Hander's Day!");
				if (canUse$2(lefty) && !toBoolean(getProperty("_aug13Cast")))
				{
					useSkill(lefty);
				}
			}

			if (expected_level_after_mouthwash() < 13)
			{ // use a wish if really need it
				auto_wishForEffectIfNeeded(Effect.get("Fever From the Flavor"));
			}
			if (expected_level_after_mouthwash() < 13)
			{ // get Citizen of Outskirts of Cobb's Knob (+4 prismatic res) if we really need it
				auto_getCitizenZone$1("spec");
			}
			if (expected_level_after_mouthwash() < 13)
			{ // Beret busk if possible for more cold res
				beretBusk("cold resistance");
			}
			// buy mouthwash and use it
			buy(Coinmaster.get("Sept-Ember Censer"), 1, mouthwash);
			auto_log_debug$1(`Using mouthwash with ${numericModifier(Modifier.get("Cold Resistance"))} cold resistance`);
			use(mouthwash);
		}
	}

	auto_log_debug$1(`Have ${remainingEmbers()} embers(s) to buy from Sept-Ember Censer. Let's spend them!`);
	// get structural ember if can't cross bridge
	let itemConsidering: Item = Item.get("structural ember");
	if (remainingEmbers() >= 4 && toInt(getProperty("chasmBridgeProgress")) < bridgeGoal() && !toBoolean(getProperty("_structuralEmberUsed")) && auto_is_valid(itemConsidering))
	{
		buy(Coinmaster.get("Sept-Ember Censer"), 1, itemConsidering);
		use(itemConsidering);
	}
	// Spend any remaining pairs on Septapus summoning charms
	while (remainingEmbers() >= 2)
	{
		buy(Coinmaster.get("Sept-Ember Censer"), 1, Item.get("Septapus summoning charm"));
	}
	// if still have embers, get hat for mp regen
	itemConsidering = Item.get("hat of remembering");
	if (remainingEmbers() >= 1 && !possessEquipment(itemConsidering) && auto_is_valid(itemConsidering))
	{
		buy(Coinmaster.get("Sept-Ember Censer"), 1, itemConsidering);
	}

	return;
}

function expected_mouthwash_main_substat(): number
{
	return expected_mouthwash_main_substat$1(numericModifier(Modifier.get("Cold Resistance")));
}

function expected_mouthwash_main_substat$1(cold_res: number): number
{
	const boost_factor: number = 1 + stat_exp_percent(myPrimestat()) / 100;
	return boost_factor * 14 * cold_res ** 1.7 / 2;
}

export function expected_level_after_mouthwash(): number
{
	return expected_level_after_mouthwash$2(1, numericModifier(Modifier.get("Cold Resistance")));
}

function expected_level_after_mouthwash$1(n_mouthwash: number): number
{
	return expected_level_after_mouthwash$2(n_mouthwash, numericModifier(Modifier.get("Cold Resistance")));
}

function expected_level_after_mouthwash$2(n_mouthwash: number, cold_res: number): number
{
	const gained_main_substats: number = n_mouthwash * expected_mouthwash_main_substat$1(cold_res);
	const old_main_substats: number = myBasestat(stat_to_substat(myPrimestat()));
	const new_main_substats: number = old_main_substats + gained_main_substats;
	const level: number = substat_to_level$1(toInt(new_main_substats));
	return level;
}


export function auto_haveTearawayPants(): boolean
{
	if (auto_is_valid(Item.get("tearaway pants")) && availableAmount(Item.get("tearaway pants")) > 0)
	{
		return true;
	}
	return false;
}

function auto_haveTakerSpace(): boolean
{
	return auto_get_campground().has(Item.get("TakerSpace letter of Marque")) && auto_is_valid(Item.get("TakerSpace letter of Marque"));
}

let $_auto_checkTakerSpace_ts_letter: Item | undefined;

export function auto_checkTakerSpace(): void
{
	if (!auto_haveTakerSpace()) { return; }
	$_auto_checkTakerSpace_ts_letter ??= Item.get("TakerSpace letter of Marque");
	if (!toBoolean(getProperty("_takerSpaceSuppliesDelivered"))) {
		// visit the workshed to get the supplies
		visitUrl("campground.php?action=workshed");
	}
	// unlock the island if we can (6 turn save)
	if (toInt(getProperty("lastIslandUnlock")) < myAscensions() && itemAmount(Item.get("pirate dinghy")) === 0 && creatableAmount(Item.get("pirate dinghy")) > 0) {
		if (create(1, Item.get("pirate dinghy"))) {
			handleTracker$1($_auto_checkTakerSpace_ts_letter.toString(), Item.get("pirate dinghy").toString(), "auto_iotm_claim");
		}
	}
	// deft pirate hook would be worth it but hard for autoscend to use
	// anchor bomb is a free banish but only for 30 turns, if we have Spring Kick we won't use it
	if (!(auto_haveSpringShoes() && auto_is_valid$2(Skill.get("Spring Kick"))) && creatableAmount(Item.get("anchor bomb")) > 0) {
		if (create(1, Item.get("anchor bomb"))) {
			handleTracker$1($_auto_checkTakerSpace_ts_letter.toString(), Item.get("anchor bomb").toString(), "auto_iotm_claim");
		}
	}
	// goldschlepper is EPIC booze
	let createable: number = creatableAmount(Item.get("tankard of spiced Goldschlepper"));
	if (createable > 0) {
		if (create(1, Item.get("tankard of spiced Goldschlepper"))) {
			handleTracker$1($_auto_checkTakerSpace_ts_letter.toString(), Item.get("tankard of spiced Goldschlepper").toString(), "auto_iotm_claim");
		}
	}
	// tankard of spiced rum is awesome booze
	createable = creatableAmount(Item.get("tankard of spiced rum"));
	if (createable > 0) {
		if (create(1, Item.get("tankard of spiced rum"))) {
			handleTracker$1($_auto_checkTakerSpace_ts_letter.toString(), Item.get("tankard of spiced rum").toString(), "auto_iotm_claim");
		}
	}
	// cursed Aztec tamale is awesome food, and only uses spices
	createable = creatableAmount(Item.get("cursed Aztec tamale"));
	if (createable > 0) {
		if (create(1, Item.get("cursed Aztec tamale"))) {
			handleTracker$1($_auto_checkTakerSpace_ts_letter.toString(), Item.get("cursed Aztec tamale").toString(), "auto_iotm_claim");
		}
	}
}

function auto_haveClanPhotoBoothHere(): boolean
{
	if (availableAmount(Item.get("Clan VIP Lounge key")) === 0)
	{
		return false;
	}
	if (!auto_is_valid(Item.get("photo booth sized crate")))
	{
		return false;
	}
	return auto_get_clan_lounge().has(Item.get("photo booth sized crate"));
}

function auto_haveClanPhotoBooth(): boolean
{
	if (availableAmount(Item.get("Clan VIP Lounge key")) === 0)
	{
		return false;
	}
	if (!auto_is_valid(Item.get("photo booth sized crate")))
	{
		return false;
	}
	const bafh_available: boolean = isWhitelistedToBAFH() && canReturnToCurrentClan(); // bafh has it fully stocked
	return bafh_available || auto_haveClanPhotoBoothHere();
}

function auto_isClanPhotoBoothItem(it: Item): boolean
{
	switch (it)
	{
		case Item.get("photo booth supply list"):
		case Item.get("fake arrow-through-the-head"):
		case Item.get("fake huge beard"):
		case Item.get("astronaut helmet"):
		case Item.get("cheap plastic pipe"):
		case Item.get("oversized monocle on a stick"):
		case Item.get("giant bow tie"):
		case Item.get("feather boa"):
		case Item.get("Sheriff badge"):
		case Item.get("Sheriff pistol"):
		case Item.get("Sheriff moustache"):
			return true;
	}
	return false;
}

function auto_thisClanPhotoBoothHasItem(it: Item): boolean
{
	// This should work but it's not implemented by Mafia, sounds like it won't be
	//~ return (auto_get_clan_lounge() contains it)
	// Instead just assume BAFH has everything, everyone else has nothing that needs unlocking
	if (getClanId() === getBAFHID())
	{
		return auto_isClanPhotoBoothItem(it);
	}
	switch (it)
	{
		case Item.get("photo booth supply list"):
		case Item.get("fake arrow-through-the-head"):
		case Item.get("fake huge beard"):
		case Item.get("astronaut helmet"):
			return true;
	}
	return false;
}

function auto_thisClanPhotoBoothHasItems(its: Map<Item, boolean>): boolean
{
	let success: boolean = true;
	for (const [it, b] of its)
	{
		success = success && auto_thisClanPhotoBoothHasItem(it);
	}
	return false;
}

export function auto_getClanPhotoBoothDefaultItems(): boolean
{
	if (!auto_haveClanPhotoBooth())
	{
		return false;
	}
	let items_to_claim: Map<Item, boolean> = new Map();
	if (!in_hattrick())
	{
		items_to_claim = new Map([[Item.get("fake arrow-through-the-head"), true], [Item.get("astronaut helmet"), true], [Item.get("oversized monocle on a stick"), true]]);
	}
	else {
		items_to_claim = new Map([[Item.get("feather boa"), true], [Item.get("astronaut helmet"), true], [Item.get("oversized monocle on a stick"), true]]);
	}

	const orig_clan_id: number = getClanId();
	const in_bafh: boolean = orig_clan_id === getBAFHID();
	const bafh_available: boolean = isWhitelistedToBAFH() && canReturnToCurrentClan(); // bafh has it fully stocked
	if (bafh_available && !in_bafh && !auto_thisClanPhotoBoothHasItems(items_to_claim))
	{
		changeClan$2();
	}
	let success: boolean = true;
	for (const [it, b] of items_to_claim)
	{
		success = success && auto_getClanPhotoBoothItem(it);
	}
	if (orig_clan_id !== getClanId())
	{
		changeClan$1(orig_clan_id);
	}
	return success;
}

function auto_getClanPhotoBoothItem(it: Item): boolean
{
	if (!auto_haveClanPhotoBooth())
	{
		return false;
	}
	if (!auto_isClanPhotoBoothItem(it))
	{
		return false;
	}
	if (availableAmount(it) > 0)
	{
		return true;
	}
	// Handle whether we want to jump to BAFH for the item
	const orig_clan_id: number = getClanId();
	const in_bafh: boolean = orig_clan_id === getBAFHID();
	const bafh_available: boolean = isWhitelistedToBAFH() && canReturnToCurrentClan(); // bafh has it fully stocked
	if (bafh_available && !in_bafh && !auto_thisClanPhotoBoothHasItem(it))
	{
		changeClan$2();
	}
	// Actually claim the item
	cliExecute(`photobooth item ${it.toString()}`);
	handleTracker$1("Clan Photo Booth", `Claimed ${it}`, "auto_iotm_claim");
	// Go home if we BAFH'd it
	if (orig_clan_id !== getClanId())
	{
		changeClan$1(orig_clan_id);
	}

	if (availableAmount(it) > 0)
	{
		return true;
	}
	return false;
}

function auto_remainingClanPhotoBoothEffects(): number
{
	if (!auto_haveClanPhotoBooth())
	{
		return 0;
	}
	return 3 - toInt(getProperty("_photoBoothEffects"));
}

function auto_getClanPhotoBoothEffectString(ef: Effect): string
{
	switch (ef)
	{
		case Effect.get("Wild and Westy!"):
			return "wild";
		case Effect.get("Towering Muscles"):
			return "tower";
		case Effect.get("Spaced Out"):
			return "space";
	}
	return "none";
}

function auto_getClanPhotoBoothEffect(ef: Effect): boolean
{
	return auto_getClanPhotoBoothEffect$1(ef, 1);
}

function auto_getClanPhotoBoothEffect$1(ef: Effect, n_times: number): boolean
{
	const effect_string: string = auto_getClanPhotoBoothEffectString(ef);
	if (effect_string === "none")
	{
		auto_log_error(`Invalid effect for photo booth ${ef.toString()}`);
		return false;
	}
	return auto_getClanPhotoBoothEffect$2(effect_string);
}

function auto_getClanPhotoBoothEffect$2(ef_string: string): boolean
{
	return auto_getClanPhotoBoothEffect$3(ef_string, 1);
}

export function auto_getClanPhotoBoothEffect$3(ef_string: string, n_times: number): boolean
{
	if (availableAmount(Item.get("Clan VIP Lounge key")) === 0)
	{
		return false;
	}
	if (!auto_is_valid(Item.get("photo booth sized crate")))
	{
		return false;
	}

	n_times = min(n_times, auto_remainingClanPhotoBoothEffects());
	if (n_times < 1)
	{
		return false;
	}
	// Handle whether we want to jump to BAFH
	const orig_clan_id: number = getClanId();
	const in_bafh: boolean = orig_clan_id === getBAFHID();
	const bafh_available: boolean = isWhitelistedToBAFH() && canReturnToCurrentClan(); // bafh has it fully stocked

	if (!auto_haveClanPhotoBoothHere() && bafh_available)
	{
		changeClan$2(); // Jump to BAFH
	}

	let success: boolean = false;
	const west_ef: Effect = Effect.get("Wild and Westy!");
	const tower_ef: Effect = Effect.get("Towering Muscles");
	const space_ef: Effect = Effect.get("Spaced Out");
	const west_string: string = toLowerCase(west_ef.toString());
	const tower_string: string = toLowerCase(tower_ef.toString());
	const space_string: string = toLowerCase(space_ef.toString());
	switch (toLowerCase(ef_string))
	{
		case "wild":
		case west_string:
			for (let i: number = 0; i < n_times; i++)
			{
				cliExecute("photobooth effect wild");
				handleTracker$1("Clan Photo Booth", `Claimed ${west_ef}`, "auto_iotm_claim");
			}
			success = toBoolean(haveEffect(west_ef));
			break;
		case "tower":
		case tower_string:
			for (let i: number = 0; i < n_times; i++)
			{
				cliExecute("photobooth effect tower");
				handleTracker$1("Clan Photo Booth", `Claimed ${tower_ef}`, "auto_iotm_claim");
			}
			success = toBoolean(haveEffect(tower_ef));
			break;
		case "space":
		case space_string:
			for (let i: number = 0; i < n_times; i++)
			{
				cliExecute("photobooth effect space");
				handleTracker$1("Clan Photo Booth", `Claimed ${space_ef}`, "auto_iotm_claim");
			}
			success = toBoolean(haveEffect(space_ef));
			break;
	}
	// Go home if we BAFH'd it
	if (orig_clan_id !== getClanId())
	{
		changeClan$1(orig_clan_id);
	}

	if (success)
	{
		return true;
	}
	auto_log_error(`Invalid effect string for photo booth ${ef_string}`);
	return false;
}

export function auto_haveChestMimic(): boolean
{
	if (auto_have_familiar(Familiar.get("Chest Mimic")))
	{
		return true;
	}
	return false;
}

function auto_haveMeggEgg(mon: Monster): boolean
{
	for (const [megg_mon, i] of c2t_megg_eggs())
		{
			if (megg_mon === mon)
			{
				return true;
			}
		}
	return false;
}


export function auto_meggFight(mon: Monster, speculative: boolean): boolean
{
	if (!auto_haveChestMimic())
	{
		return false;
	}

	if (speculative)
	{
		c2t_megg_preAdv();
		if (auto_haveMeggEgg(mon) || c2t_megg_maxed().has(mon) && (Familiar.get("Chest Mimic")).experience >= 100)
		{
			return true;
		}
		else {
			return false;
		}
	}
	if (!auto_haveMeggEgg(mon))
	{
		c2t_megg_preAdv();
		if ((Familiar.get("Chest Mimic")).experience >= 100)
		{
			c2t_megg_extract(mon);
		}
		else {
			return false;
		}
	}
	if (!auto_haveMeggEgg(mon))
	{
		return false;
	}

	if (speculative)
	{
		return true;
	}
	// From here adapted from c2t_megg_fight
	const egg: Item = Item.get("mimic egg");
	let page: string = null;
	let monstring: string = "";
	//go
	page = visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`, false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1516)
	{
		auto_log_error("Couldn't enter choice adventure to fight eggs.");
		return false;
	}
	//check if available
	monstring = mon.id.toString();
	if (!containsText(page, `<option value="${monstring}">`)) {
		visitUrl("main.php", false, true); //don't get stuck in choice
		auto_log_error(`${mon} not found to fight`);
		return false;
	}

	if (autoAdvBypass$6(`choice.php?pwd&whichchoice=1516&option=1&mid=${monstring}`))
	{
		handleTracker$1(mon.toString(), Familiar.get("Chest Mimic").toString(), "auto_copies");
		return true;
	}
	return false;
}