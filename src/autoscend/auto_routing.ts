import { availableAmount, getProperty, getWorkshed, haveCampground, Item, itemAmount, Location, max, myDaycount, myLevel, outfit, setProperty, splitString, substring, toBoolean, toInt, totalTurnsPlayed, visitUrl } from "kolmafia";
import { auto_canForceNextNoncombat, auto_is_valid, auto_log_debug$1, auto_log_warning, auto_turbo, internalQuestStatus } from "./auto_util";
import { zone_delay, zone_delayable, zone_isAvailable$1 } from "./auto_zone";
import { auto_haveVotingBooth } from "./iotms/mr2018";
import { auto_haveKramcoSausageOMatic, auto_sausageFightsToday } from "./iotms/mr2019";
import { auto_backupUsesLeft, auto_CMCconsultsLeft, auto_haveBackupCamera, auto_haveColdMedCabinet } from "./iotms/mr2021";
import { auto_haveCursedMagnifyingGlass } from "./iotms/mr2022";
import { auto_haveArchaeologistSpade, auto_spadeDigsRemaining, spadeDelayZones } from "./iotms/mr2026";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { in_lowkeysummer, lowkey_nextAvailableKeyDelayLocation } from "./paths/low_key_summer";
import { L3_tavern } from "./quests/level_03";
import { L4_batCave } from "./quests/level_04";
import { L5_getEncryptionKey, L5_haremOutfit } from "./quests/level_05";
import { L6_friarsGetParts } from "./quests/level_06";
import { L7_crypt } from "./quests/level_07";
import { L8_trapperGroar } from "./quests/level_08";
import { L9_chasmBuild, L9_highLandlord } from "./quests/level_09";
import { L10_airship, L10_basement, L10_holeInTheSkyUnlock, L10_topFloor } from "./quests/level_10";
import { L11_defeatEd, L11_hiddenCityZones, L11_mauriceSpookyraven, L11_unlockEd, LX_unlockHiddenTemple } from "./quests/level_11";
import { L12_filthworms } from "./quests/level_12";
import { prepForMegaloCity } from "./quests/level_13";
import { LX_fatLootToken, LX_getDesiredWorkshed } from "./quests/level_any";

//Defined in autoscend/auto_routing.ash
export function solveDelayZone(skipOutdoorZones: boolean): Location
{
	const delayableZones: Map<Location, number> = zone_delayable();
	let burnZone: Location = Location.none;
	if (delayableZones.size > 0)
	{
		// find the delayable zone with the lowest delay left.
		for (const [loc, delay] of delayableZones)
		{
			if (skipOutdoorZones && loc.environment === "outdoor")
			{
				continue;
			}
			if (burnZone === Location.none || delay < (delayableZones.get(burnZone) ?? delayableZones.set(burnZone, 0).get(burnZone)))
			{
				burnZone = loc;
			}
			if (loc === Location.get("The Spooky Forest") && delay === (delayableZones.get(burnZone) ?? delayableZones.set(burnZone, 0).get(burnZone)))
			{
				// prioritise the Spooky Forest when its delay remaining equals the lowest delay zone
				burnZone = loc;
			}
		}
	}
	// If we're going to Megalo-city, do the prep work to acquire enough DA
	if (burnZone === Location.get("Megalo-City"))
	{
		prepForMegaloCity();
	}

	if (burnZone !== Location.none)
	{
		return burnZone;
	}
	// These are locations that aren't 1:1 turn savings, but can still be useful
	// Shorten the time before finding Gnasir, so that we can start acquiring desert pages sooner
	if (!skipOutdoorZones && zone_isAvailable$1(Location.get("The Arid, Extra-Dry Desert")) && (Location.get("The Arid, Extra-Dry Desert")).turnsSpent >= 1 && (Location.get("The Arid, Extra-Dry Desert")).turnsSpent < 10)
	{
		burnZone = Location.get("The Arid, Extra-Dry Desert");
	}
	// Shorten the time until the first "burn a food or drink" noncombat
	// There's some opportunity to be clever here, but this is probably good enough.
	// If we didn't check turns_spent we'd have to be careful to equip the war outfit,
	// just in case the noncombat shows up.
	if (in_koe() && (Location.get("The Exploaded Battlefield")).turnsSpent < 5)
	{
		burnZone = Location.get("The Exploaded Battlefield");
	}

	if (in_lowkeysummer())
	{
		burnZone = lowkey_nextAvailableKeyDelayLocation();
	}

	return burnZone;
}

export function solveDelayZone$1(): Location
{
	return solveDelayZone(false);
}

export function allowSoftblockDelay(): boolean
{
	return toInt(getProperty("auto_delayLastLevel")) < myLevel();
}

export function canBurnDelay(loc: Location): boolean
{
	// TODO: Add Digitize (Portscan?) & LOV Enamorang
	if (!zone_delay(loc)._boolean || !allowSoftblockDelay())
	{
		return false;
	}
	if (auto_haveBackupCamera() && auto_backupUsesLeft() > 0)
	{
		return true;
	}
	else if (auto_haveKramcoSausageOMatic() && auto_sausageFightsToday() < 9)
	{
		return true;
	}
	else if (auto_haveVotingBooth() && toInt(getProperty("_voteFreeFights")) < 3)
	{
		return true;
	}
	else if (auto_haveArchaeologistSpade() && auto_spadeDigsRemaining() === 0 && myDaycount() < toInt(
	// on all branches below, we don't return true because we can burn delay
	// Instead, we return true because we should save zones where we can burn delay until the next day when our resources have refreshed
	getProperty("auto_runDayCount")) && spadeDelayZones().has(loc)) {
		// the archaeologist's spade doesn't cleanly burn delay (because users without the PoP etc. might need to use an adv first--and even players using the PoP need to spend a free turn there) and is loc-specific
		// Its delayburn isn't implemented in LX_burnDelay() like the other sources here for that reason, instead implemented directly into the quest functions such that we don't want to consider if we can use arch spade to burn delay
		// so, as far as arch spade is concerned, we only want to save the zone and skip it if it's an early day and we're out of digs
		return true;
	}
	else if (myDaycount() < toInt(getProperty("auto_runDayCount")) && (auto_haveVotingBooth() || auto_haveKramcoSausageOMatic() || auto_haveBackupCamera() || auto_haveCursedMagnifyingGlass()))
	{
		return true;
	}
	return false;
}

function allowSoftblockUndergroundAdvs(): boolean
{
	return toInt(getProperty("auto_cmcConsultLastLevel")) < myLevel();
}

function allowSoftblockDay2Wait(): boolean
{
	return toInt(getProperty("auto_day2WaitLastLevel")) < myLevel();
}

function getLastCombatEnvironmentCounts(offset: number): Map<string, number>
{
	// mafia has no char type. string will have to do.
	const counts: Map<string, number> = new Map([["i", 0], ["o", 0], ["u", 0], ["x", 0], ["?", 0]]);
	const environments: Map<number, string> = new Map(splitString(substring(getProperty("lastCombatEnvironments"), max(offset, 0), 20), "").map((_v, _i) => [_i, _v]));
	// property is always 20 characters long. Uses a queue (FIFO).
	// lastCombatEnvironments = xxxxxxxxxxxxxxxxxxxx
	// i = indoor, o = outdoor, u = underground, x = underwater, ? = unknown/none
	for (const [_, env] of environments)
	{
		counts.set(env, (counts.get(env) ?? 0) + 1);
	}
	return counts;
}

export function auto_reserveUndergroundAdventures(): boolean
{
	// this function should return true when we *don't* want to spend adventures in underground zones.

	if (!allowSoftblockUndergroundAdvs() || auto_haveColdMedCabinet() && auto_CMCconsultsLeft() === 0 && myDaycount() > 1 || !auto_is_valid(Item.get("cold medicine cabinet")))
	{
		// softblock has been released or we have no more Breathitins to collect.
		return false;
	}
	if (getWorkshed() !== Item.get("cold medicine cabinet") && auto_is_valid(Item.get("cold medicine cabinet")) && itemAmount(Item.get("cold medicine cabinet")) > 0 && !toBoolean(getProperty("_workshedItemUsed")) && (LX_getDesiredWorkshed() === Item.get("cold medicine cabinet") || LX_getDesiredWorkshed() === Item.none) && haveCampground())
	{
		auto_log_debug$1("Reserving underground adventures as we will be switching to the CMC.");
		// Don't have the CMC installed yet but we can still switch today and want to switch to it so save underground zones until then.
		return true;
	}
	if (auto_haveColdMedCabinet() && auto_CMCconsultsLeft() > 0 && myDaycount() < 3)
	{
		const turns_until_next_consult: number = toInt(getProperty("_nextColdMedicineConsult")) - totalTurnsPlayed();
		const envs: Map<string, number> = getLastCombatEnvironmentCounts(turns_until_next_consult);
		if (turns_until_next_consult < 12 && (envs.get("u") ?? envs.set("u", 0).get("u")) > 10)
		{
			auto_log_debug$1("Reserving underground adventures as we can still get more Breathitins today.");
			// have the CMC installed & still have consults to use today.
			// we only need 11 underground adventures in the queue for Breathitin to show up.
			// auto_CMCconsult() will (should) grab a Breathitin as soon as it's available
			// so we only need to care about setting the conditions for it to do so
			return true;
		}
	}
	return false;
}

export function auto_waitForDay2(): boolean
{
	if (auto_turbo()) { return false; }
	if (myDaycount() > 1) { return false; }
	if (!allowSoftblockDay2Wait()) { return false; }
	auto_log_debug$1("Waiting for day 2 for this.");
	return true;
}

function allowSoftblockOutdoorAdvs(): boolean
{
	return toInt(getProperty("auto_breathitinLastLevel")) < myLevel();
}

function auto_reserveOutdoorAdventures(): boolean
{
	// this function should return true when we *don't* want to spend adventures in outdoor zones.
	if (!allowSoftblockOutdoorAdvs() || auto_haveColdMedCabinet() && auto_CMCconsultsLeft() === 0 && myDaycount() > 1 || !auto_is_valid(Item.get("cold medicine cabinet")) || toInt(getProperty("breathitinCharges")) > 0)
	{
		// softblock has been released or we have no more Breathitins to collect (or we have Breathitin charges to use).
		return false;
	}
	if (getWorkshed() !== Item.get("cold medicine cabinet") && auto_is_valid(Item.get("cold medicine cabinet")) && itemAmount(Item.get("cold medicine cabinet")) > 0 && !toBoolean(getProperty("_workshedItemUsed")) && (LX_getDesiredWorkshed() === Item.get("cold medicine cabinet") || LX_getDesiredWorkshed() === Item.none))
	{
		auto_log_debug$1("Reserving outdoor adventures as we will be switching to the CMC.");
		// Don't have the CMC installed yet but we can still switch today and want to switch to it so save outdoor zones until then.
		return true;
	}
	if (auto_haveColdMedCabinet() && auto_CMCconsultsLeft() > 0 && myDaycount() < 3) {
		auto_log_debug$1("Reserving outdoor adventures as we can still get more Breathitins today.");
		// have the CMC installed and still have consults left to grab on day 1
		return true;
	}
	return false;
}

export function auto_earlyRoutingHandling(): boolean
{
	// wrapper function for "early" adventure choices depending on state.
	// updating this will be less 'scary' than updating n task order files any time we make a change
	// this function should go very high in task orders, potentially the first thing that spends adventures.
	// ideally nothing called before this should spend an adventure, only update state or use turn free resources.
	// Check we have flyers if war frat and war started, first because takes no turns.
	if (!in_koe() && internalQuestStatus("questL12War") === 1 && !toBoolean(getProperty("auto_hippyInstead")) && getProperty("sidequestArenaCompleted") !== "fratboy" && availableAmount(Item.get("rock band flyers")) === 0)
	{
		outfit("frat warrior fatigues"); // don't use the equipOutfit func here since this is just temporary, we don't want to adventure like this.
		visitUrl("bigisland.php?place=concert&pwd");
		// Just make sure the other two quests are started too
		visitUrl("bigisland.php?place=lighthouse&action=pyro&pwd");
		visitUrl("bigisland.php?action=junkman&pwd");
	}
	// force forcing non-combats.
	if (auto_canForceNextNoncombat()) {
		auto_log_debug$1("Forcing a non-combat somewhere. Strap yourselves in, kids.");
		if (L6_friarsGetParts() || L10_basement() || L10_topFloor() || L10_holeInTheSkyUnlock())
		{
			// quests where we want to force non-combats
			return true;
		}
	}
	// CMC routing for Breathitins
	if (auto_haveColdMedCabinet() && auto_CMCconsultsLeft() > 0)
	{
		if (toInt(getProperty("_nextColdMedicineConsult")) - totalTurnsPlayed() < 12)
		{
			auto_log_debug$1("Have a CMC consult coming up in 11 or fewer adventures. Calling a quest function with underground zones.");
			// we have a CMC consult coming up in 11 turns or less
			if (L4_batCave() || L10_basement() || L12_filthworms() || L11_mauriceSpookyraven() || L11_unlockEd() || L7_crypt() || L5_haremOutfit())
			{
				// quests with adventures in underground zones in some sort of priority order here.
				return true;
			}
		}
		else {
			// 12 or more turns until the next CMC consult
			if ((getLastCombatEnvironmentCounts(9).get("u") ?? getLastCombatEnvironmentCounts(9).set("u", 0).get("u")) > 0)
			{
				auto_log_debug$1("Have a CMC consult coming up in 12 or more adventures. Calling a quest function with zoneless encounters.");
				// some of the last 11 adventures were underground, lets try to "push" the CMC counter & preserve our underground combats
				// while burning down the counter until the next consult by spending adventures in non-adventure.php locations.
				if (LX_fatLootToken() || L11_defeatEd() || L8_trapperGroar() || L3_tavern())
				{
					return true;
				}
			}
		}
	}
	// Using up Breathitin charges if we have them
	if (toInt(getProperty("breathitinCharges")) > 0)
	{
		auto_log_debug$1("Have Breathitin Charges to burn. Calling a quest function with outdoor zones.");
		if (LX_unlockHiddenTemple() || L11_hiddenCityZones() || L5_getEncryptionKey() || L10_airship() || L9_chasmBuild() || toInt(getProperty("_auto_lastABooCycleFix")) < 5 && L9_highLandlord() || L6_friarsGetParts())
		{
			// quests with adventures in outdoor zones in some sort of priority order here.
			// LX_unlockHiddenTemple unlocks the Hidden Temple by adventuring in the Spooky Forest. High priority as Hidden City has a lot of delay
			// L11_hiddenCityZones is where we adventure in the Hidden Park which is a needed step to unlock the Hidden City zones.
			// L5_getEncryptionKey unlocks Cobb's Knob (underground zones) by adventuring in Outskirts. It's a delay zone by it has 10 delay so we will adventure here at some point.
			// L10_airship unlocks Castle Basement (underground zone)
			// L9_chasmBuild builds the bridge over the Orc Chasm which unlocks the peaks (also outdoor zones)
			// the rest just finish quests so there's no urgency on getting them done.
			return true;
		}
	}
	else {
		if (L11_hiddenCityZones())
		{
			// Should do these ASAP when we don't have Breathitin to open up the rest of the Hidden City.
			return true;
		}
	}

	return false;
}

export function auto_softBlockHandler(): boolean
{
	// "catch all" function to release softblocks one by one.
	// updating this will be less 'scary' than updating n task order files any time we make a change
	// this function should go in task orders after the call to L13_towerAscent
	if (allowSoftblockDelay())
	{
		// Delay goes first as it applies to everyone and is our "OG" softblock
		auto_log_warning("I was trying to avoid delay zones, but I've run out of stuff to do. Releasing softblock.", "red");
		setProperty("auto_delayLastLevel", myLevel().toString());
		return true;
	}
	if (allowSoftblockDay2Wait())
	{
		auto_log_warning("I was trying to avoid quests that would benefit from day 2 dailies, but I've run out of stuff to do. Releasing softblock.", "red");
		setProperty("auto_day2WaitLastLevel", myLevel().toString());
		return true;
	}
	if (allowSoftblockUndergroundAdvs())
	{
		// Underground is next. Currently only applies to people who have and can use the CMC.
		auto_log_warning("I was trying to avoid underground zones, but I've run out of stuff to do. Releasing softblock.", "red");
		setProperty("auto_cmcConsultLastLevel", myLevel().toString());
		return true;
	}
	if (allowSoftblockOutdoorAdvs())
	{
		// Outdoor goes last. Not currently used but lets add it just in case we do implement it before CMC rotates out.
		auto_log_warning("I was trying to avoid outdoor zones, but I've run out of stuff to do. Releasing softblock.", "red");
		setProperty("auto_breathitinLastLevel", myLevel().toString());
		return true;
	}
	return false;
}

function auto_workshedStrategy(): Map<number, Item>
{
	// return the worksheds, in order, that we want to use today.
	const strat: Map<number, Item> = new Map();
	if (toBoolean(getProperty("_workshedItemUsed"))) {
		// we already changed workshed today. Just return whatever is in our workshed currently.
		strat.set(0, getWorkshed());
	}
	return strat;
}
