import { appearanceRates, availableAmount, canInteract, ceil, cliExecute, containsText, craft, Effect, Familiar, getMonsters, getProperty, haveEffect, haveFamiliar, haveSkill, inHardcore, isBanished, Item, itemAmount, knollAvailable, Location, max, min, Monster, monsterLevelAdjustment, monsterPhylum, myAdventures, myLevel, myLocation, myMeat, npcPrice, retrieveItem, runChoice, setProperty, Skill, Slot, splitString, toBoolean, toInt, toLocation, toMonster, totalTurnsPlayed, visitUrl } from "kolmafia";
import { auto_advToReserve } from "../../autoscend";
import { pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$2 } from "../auto_adventure";
import { autoChew, fullness_left, inebriety_left, stomach_left } from "../auto_consume";
import { canUntinker, untinker } from "../auto_craft";
import { addToMaximize, autoEquip, possessEquipment, possessOutfit$1 } from "../auto_equipment";
import { haveSpleenFamiliar, pathHasFamiliar } from "../auto_familiar";
import { providePlusCombat, providePlusNonCombat } from "../auto_providers";
import { auto_can_equip, auto_combat_appearance_rates, auto_combatModCap, auto_get_campground, auto_is_valid, auto_is_valid$1, auto_is_valid$2, auto_log_info, auto_log_info$1, auto_log_warning, auto_queueIgnore, auto_wantToBanish, auto_wantToBanish$1, auto_wantToReplace, auto_wantToSniff, auto_wantToYellowRay, freeCrafts$1, internalQuestStatus, meatReserve, wrap_item } from "../auto_util";
import { isSniffed$1 } from "../combat/auto_combat_util";
import { acquiredFantasyRealmToken, fantasyBanditsFought } from "./mr2018";
import { auto_hasAutumnaton } from "./mr2022";
import { auto_habitatFightsLeft, auto_habitatMonster, auto_haveBofa } from "./mr2023";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_hattrick } from "../paths/hattrick";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_kolhs } from "../paths/kolhs";
import { in_lar } from "../paths/live_ascend_repeat";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { in_wereprof, is_werewolf } from "../paths/wereprofessor";
import { in_wildfire } from "../paths/wildfire";
import { in_robot } from "../paths/you_robot";
import { cyrptEvilBonus$1 } from "../quests/level_07";
import { bridgeGoal } from "../quests/level_09";
import { auto_bestWarPlan, auto_warKillsPerBattle } from "../quests/level_12";
import { needStarKey } from "../quests/level_13";

// This is meant for items that have a date of 2021

//Defined in autoscend/iotms/mr2021.ash
export function auto_haveCrystalBall(): boolean
{
	const crystal_ball: Item = wrap_item(Item.get("miniature crystal ball"));
	return possessEquipment(crystal_ball) && auto_is_valid(crystal_ball) && pathHasFamiliar();
}

function crystalBallMonster(loc: Location): Monster
{
	// returns a monster if the crystal ball predicts one in the location

	const crystalBallPredictions: Map<number, string> = new Map(splitString(getProperty("crystalBallPredictions"), "[|]").map((_v, _i) => [_i, _v]));
	if ((crystalBallPredictions.get(0) ?? crystalBallPredictions.set(0, "").get(0)) === "")
	{
		return Monster.none; // no prediction
	}
	for (const i of crystalBallPredictions.keys())
	{
        const thisPrediction: Map<number, string> = new Map(splitString((crystalBallPredictions.get(i) ?? crystalBallPredictions.set(i, "").get(i)), ":").map((_v, _i) => [_i, _v])); // turn:location:monster
		// turn: thisPrediction[0].to_int() is useless unless mafia fails to update the property
		if (toLocation((thisPrediction.get(1) ?? thisPrediction.set(1, "").get(1))) !== loc)
		{
			continue;
		}
		return toMonster((thisPrediction.get(2) ?? thisPrediction.set(2, "").get(2)));
	}
	return Monster.none; // no prediction in the location
}

function auto_allowCrystalBall(predicted_monster: Monster, loc: Location): boolean
{
	// blacklisted locations
	if (Location.get(["Next to that Barrel with Something Burning in it", "Out by that Rusted-Out Car", "Over Where the Old Tires Are", "Near an Abandoned Refrigerator"]).includes(loc))
	{
		//predictions can't tell tool gremlins apart from non tool gremlins
		return false;
	}
	// allowed elsewhere if no prediction
	if (predicted_monster === Monster.none)
	{
		return true;
	}
	// next monster forced by mapping overrides any prediction so no need to forbid equipping crystal ball
	if (toBoolean(getProperty("mappingMonsters")))
	{
		return true;
	}
	// next monster forced by clover so no need to forbid equipping crystal ball
	if (haveEffect(Effect.get("Lucky!")) > 0)
	{
		if (loc === Location.get("The Hidden Temple"))
		{
			// the only lucky adventure with a fight that could use the chance of item drop bonus
			return true;
		}
	}
	//if already forced by something else, no need to handle your ball
	//pre_adv, or simulatePreAdvForCrystalBall, handles this as it already tracks burningDelay and forced encounters

	if (isBanished(predicted_monster) || auto_wantToReplace(predicted_monster, loc) || auto_wantToBanish(predicted_monster, loc) || auto_wantToBanish$1(monsterPhylum(predicted_monster), loc))
	{
		// next prediction is unwanted, do not allow
		return false;
	}

	return true;
}

export function auto_forceHandleCrystalBall(loc: Location): boolean
{
	//full support would need changing how autoscend chooses tasks to move between zones and reset predictions
	//instead just allow it to make unwanted monsters less likely and confirm wanted monsters

	const predicted_monster: Monster = crystalBallMonster(loc);

	let shouldForceEquip: boolean = false;
	if (predicted_monster !== Monster.none)
	{
		if ((auto_wantToSniff(predicted_monster, loc) || isSniffed$1(
		//sniff targets are wanted monsters TODO it's not exhaustive, neither is careAboutDrops()
		predicted_monster) || Monster.get([
		//ball will likely be forbidden before getting to last monster, but last wanted one isn't sniff target
		"monstrous boiler", "beanbat"]).includes(predicted_monster)) && (auto_combat_appearance_rates(
		//some wanted monsters are not sniff targets
		loc, false).get(predicted_monster) ?? auto_combat_appearance_rates(
		//some wanted monsters are not sniff targets
		loc, false).set(predicted_monster, 0.0).get(predicted_monster)) < 100)
		{ //other monsters possible
			shouldForceEquip = true; // should not waste the prediction entered in queue
		}
	}

	const crystal_ball: Item = wrap_item(Item.get("miniature crystal ball"));
	if (shouldForceEquip)
	{
		addToMaximize(`+equip ${crystal_ball.toString()}`);
		setProperty("auto_nextEncounter", predicted_monster.toString());
		return true; //handled
	}
	else if (!auto_allowCrystalBall(predicted_monster, loc))
	{
		addToMaximize(`-equip ${crystal_ball.toString()}`);
		return true; //handled
	}
	//equipping the crystal ball can't hurt but it is neither forced nor forbidden
	//pre_adv will consider giving it a maximizer bonus after checking if monster queue control is wanted
	//removeFromMaximize(`-equip {crystal_ball.to_string()}`);	//this should already get reset after every loop or maximizer simulation
	return false;
}

export function simulatePreAdvForCrystalBall(place: Location): void
{
	// used only when simulating maximizer equipment
	// replicates most of pre_adv monster queue checks in order to know if miniature crystal ball will be allowed

	let considerCrystalBallBonus: boolean = false;
	if (!auto_queueIgnore() && toMonster(getProperty("auto_nextEncounter")) === Monster.none && !auto_forceHandleCrystalBall(place))
	{
		//equipping the crystal ball can't hurt but it is neither forced nor forbidden
		//will consider giving it a maximizer bonus after checking if monster queue control is wanted
		considerCrystalBallBonus = true;
	}

	const possible_monsters: Map<number, Monster> = new Map();
	if (toMonster(getProperty("auto_nextEncounter")) !== Monster.none)
	{
		//next monster is forced by zone mechanics or by now locked-in miniature crystal ball
		possible_monsters.set(possible_monsters.size, toMonster(getProperty("auto_nextEncounter")));
	}
	else {
		for (const [i, mon] of getMonsters(place).entries())
		{
			if ((appearanceRates(place)[mon.toString()] ??= 0.0) > 0)
			{
				possible_monsters.set(possible_monsters.size, mon);
			}
		}
	}

	let zoneHasUnwantedMonsters: boolean = false;
	let zoneHasWantedMonsters: boolean = false;
	if (!auto_queueIgnore())
	{ //next encounter is a monster from the zone
		for (const [i, mon] of possible_monsters)
		{
			if (auto_wantToYellowRay(mon, place))
			{
				zoneHasWantedMonsters = true;
			}
			if (auto_wantToBanish(mon, place))
			{
				zoneHasUnwantedMonsters = true;
			}
			if (auto_wantToReplace(mon, place))
			{
				zoneHasUnwantedMonsters = true;
			}
			if (auto_wantToSniff(mon, place))
			{
				zoneHasWantedMonsters = true;
			}
		}
	}
	if (considerCrystalBallBonus)
	{
		//give miniature crystal ball a maximizer bonus only if the location has monsters to avoid or target
		const crystalBallMaximizerBonus: number = 0 + ((zoneHasUnwantedMonsters ? 300 : 0)) + ((zoneHasWantedMonsters ? 300 : 0));
		if (crystalBallMaximizerBonus !== 0)
		{
			const crystal_ball: Item = wrap_item(Item.get("miniature crystal ball"));
			addToMaximize(`+${crystalBallMaximizerBonus}bonus ${crystal_ball.toString()}`);
		}
	}
}

export function auto_haveEmotionChipSkills(): boolean
{
	return auto_is_valid$2(Skill.get("Emotionally Chipped")) && haveSkill(Skill.get("Emotionally Chipped")) || auto_is_valid$2(Skill.get("Replica Emotionally Chipped")) && haveSkill(Skill.get("Replica Emotionally Chipped"));
}

export function auto_canFeelEnvy(): boolean
{
	// Combat Skill - Forces drops like Spooky Jelly (doesn't insta-kill though, still need to win combat)
	if (!auto_is_valid$2(Skill.get("Feel Envy")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelEnvyUsed")) < 3;
}

export function auto_canFeelHatred(): boolean
{
	// Combat Skill - 50 turn banish (doesn't cost a turn)
	if (!auto_is_valid$2(Skill.get("Feel Hatred")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelHatredUsed")) < 3;
}

function auto_canFeelNostalgic(): boolean
{
	// Combat Skill - adds drop table from last copyable monster to the current (see lastCopyableMonster property)
	if (!auto_is_valid$2(Skill.get("Feel Nostalgic")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelNostalgicUsed")) < 3;
}

function auto_canFeelPride(): boolean
{
	// Combat Skill - Triples stat gain from the current fight.
	if (!auto_is_valid$2(Skill.get("Feel Pride")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelPrideUsed")) < 3;
}

function auto_canFeelSuperior(): boolean
{
	// Combat Skill - Does 20% of monsters max HP as damage and gives +1 PvP fight if it kills the monster.
	if (!auto_is_valid$2(Skill.get("Feel Superior")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelSuperiorUsed")) < 3;
}

function auto_canFeelLonely(): boolean
{
	// Non-Combat Skill - -5% combat rate (20 adventures)
	if (!auto_is_valid$2(Skill.get("Feel Lonely")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelLonelyUsed")) < 3;
}

function auto_canFeelExcitement(): boolean
{
	// Non-Combat Skill - +25 to all stats (20 adventures)
	if (!auto_is_valid$2(Skill.get("Feel Excitement")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelExcitementUsed")) < 3;
}

function auto_canFeelNervous(): boolean
{
	// Non-Combat Skill - deals passive damage on hit starting at 20 decrementing by 1 every proc (20 adventures)
	if (!auto_is_valid$2(Skill.get("Feel Nervous")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelNervousUsed")) < 3;
}

function auto_canFeelPeaceful(): boolean
{
	// Non-Combat Skill - +2 all res, +10 DR, +100 DA (20 adventures)
	if (!auto_is_valid$2(Skill.get("Feel Peaceful")))
	{
		return false;
	}
	return auto_haveEmotionChipSkills() && toInt(getProperty("_feelPeacefulUsed")) < 3;
}

export function auto_haveBackupCamera(): boolean
{
	return possessEquipment(Item.get("backup camera")) && auto_is_valid(Item.get("backup camera"));
}

export function auto_enableBackupCameraReverser(): void
{
	if (auto_haveBackupCamera() && !toBoolean(getProperty("backupCameraReverserEnabled")))
	{
		cliExecute("backupcamera reverser on");
	}
}

export function auto_backupUsesLeft(): number
{
	if (auto_haveBackupCamera())
	{
		return 11 + ((in_robot() ? 5 : 0)) - toInt(getProperty("_backUpUses"));
	}
	return 0;
}

export function auto_backupTarget(): boolean
{
	// can't backup if we don't have camera or it isn't available
    if (!auto_haveBackupCamera())
	{
        return false;
    }
	// can't backup if no more charges left
	if (auto_backupUsesLeft() < 1)
	{
        return false;
    }
	// don't backup into a fight we just lost. Prevent continuously getting beaten up
	if (toBoolean(getProperty("auto_beatenUpLastAdv")))
	{
		return false;
	}
	// don't backup if nextAdventure is None as a combat was somewhere that is not a zone
	if (toLocation(getProperty("nextAdventure")) === Location.none)
	{
		return false;
	}
	// don't backup into oliver's (it won't be free and will waste a free fight and currently also mess up tracking)
	if (toLocation(getProperty("nextAdventure")) === Location.get("An Unusually Quiet Barroom Brawl"))
	{
		return false;
	}
	// determine if we want to backup
	const wantBackupLFM: boolean = itemAmount(Item.get("barrel of gunpowder")) < 5 && getProperty("sidequestLighthouseCompleted") === "none" && internalQuestStatus("questL12War") === 1 && !auto_hasAutumnaton() && !in_koe();
	const habitatZombieEvil: number = (auto_habitatMonster() === Monster.get("modern zmobie") ? auto_habitatFightsLeft() * (5 + cyrptEvilBonus$1()) : 0);
	const wantBackupZmobie: boolean = toInt(getProperty("cyrptAlcoveEvilness")) > 14 + cyrptEvilBonus$1() + habitatZombieEvil && internalQuestStatus("questL07Cyrptic") === 0;

	switch (toMonster(getProperty("lastCopyableMonster"))) {
		case Monster.get("lobsterfrogman"):
			if (wantBackupLFM)
				{ return true; }
			break;
		case Monster.get("modern zmobie"):
			if (wantBackupZmobie)
				{ return true; }
			break;
		case Monster.get("sausage goblin"):
			if (!wantBackupLFM && !wantBackupZmobie && auto_backupUsesLeft() > 5)
				{ return true; }
			break;
		case Monster.get("Eldritch Tentacle"):

			//backup tentacles if lots of backups remaining or use all remaining charges if at end of day
if (auto_backupUsesLeft() > 6)
				{ return true; }
			if (myAdventures() <= 1 + auto_advToReserve() && inebriety_left() === 0 && stomach_left() < 1)
				{ return true; }
			break;
		case Monster.get("fantasy bandit"):
			if (!acquiredFantasyRealmToken() && auto_backupUsesLeft() >= 5 - fantasyBanditsFought() && auto_habitatMonster() !== Monster.get("fantasy bandit"))
				{ return true; }
			break;
		case Monster.get("Green Ops Soldier"):
			if (toInt(getProperty("hippiesDefeated")) > 399 && toInt(getProperty("hippiesDefeated")) < 1000 && !in_koe())
				{ return true; }
			break;
		case Monster.get("Skinflute"):
		case Monster.get("Camel's Toe"):
			if (needStarKey() && itemAmount(Item.get("star")) < 8 && itemAmount(Item.get("line")) < 7)
				{ return true; }
			break;
		default:		break;
    }

	return false;
}

export function auto_backupToYourLastEnemy(loc: Location): boolean
{
	// can't backup if we don't have the camera or no charges left or no valid target/location
	if (!auto_haveBackupCamera() || auto_backupUsesLeft() === 0 || !auto_backupTarget() || loc === Location.none)
	{
		return false;
	}

	if (autoEquip(Slot.get("acc3"), Item.get("backup camera")))
	{
		setProperty("auto_nextEncounter", getProperty("lastCopyableMonster"));
		return autoAdv$2(loc);
	}
	setProperty("auto_nextEncounter", "");
	return false;
}

function auto_havePowerPlant(): boolean
{
	return itemAmount(Item.get("potted power plant")) > 0 && auto_is_valid(Item.get("potted power plant"));
}

export function auto_harvestBatteries(): boolean
{
	if (!auto_havePowerPlant() || getProperty("_pottedPowerPlant") === "0,0,0,0,0,0,0")
	{
  		return false;
	}
	// Stolen straight from mafia's breakfast handling.
	cliExecute(`inv_use.php?pwd&whichitem=${toInt((Item.get("potted power plant")))}`);

	const status: Map<number, string> = new Map(splitString(getProperty("_pottedPowerPlant"), ",").map((_v, _i) => [_i, _v]));

	for (let pp: number = 0; pp < status.size; pp++)
	{
		if (toInt((status.get(pp) ?? status.set(pp, "").get(pp))) > 0)
		{
			cliExecute(`choice.php?pwd&whichchoice=1448&option=1&pp=${pp + 1}`);
		}
	}
	return true;
}
// These points the value of a battery represented in AAAs.
let $_batteryPoints_points: Map<Item, number> | undefined;

function batteryPoints(battery: Item): number
{
	$_batteryPoints_points ??= new Map([
		[Item.get("battery (AAA)"), 1],
		[Item.get("battery (AA)"), 2],
		[Item.get("battery (D)"), 3],
		[Item.get("battery (9-Volt)"), 4],
		[Item.get("battery (lantern)"), 5],
		[Item.get("battery (car)"), 6]
	]);
	return ($_batteryPoints_points.get(battery) ?? $_batteryPoints_points.set(battery, 0).get(battery));
}
// These points represent a quantity of AAAs if all batteries were untinkered.
function totalBatteryPoints(): number
{
	let totalPoints: number = 0;

	for (const it of Item.get(["battery (AAA)", "battery (AA)", "battery (D)", "battery (9-Volt)", "battery (lantern)", "battery (car)"]))
	{
		totalPoints += availableAmount(it) * batteryPoints(it);
	}

	return totalPoints;
}

function batteryCombine(battery: Item): boolean
{
	return batteryCombine$1(battery, false);
}

function batteryCombine$1(battery: Item, simulate: boolean): boolean
{
	// Mafia's create() function only allows one single recipe for crafting batteries. This can result in situations where you can in fact craft a battery but it fails due to it not being the singular recipe supported by it.
	// Mafia's can_create() has the same issue. use simulate in this function to determine if we can actually create a battery (or already have it).
	// To get batteries use can_get_battery() and auto_getBattery(), which will be calling this function and untinker as necessary
	// This is very dense, apologies.
	if (batteryPoints(battery) === 0)
	{ //0 means it is not a battery
  		return false;
	}
	// We already have this battery, no need to make more yet.
	if (availableAmount(battery) >= 1)
	{
		return true;
	}
	// We're targetting a AA.
	if (battery === Item.get("battery (AA)"))
	{
		// There's only one way to craft a AA.
		if (availableAmount(Item.get("battery (AAA)")) >= 2)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (AAA)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (AA)")) >= 1;
		}
		return false;
	}
	else if (battery === Item.get("battery (D)"))
	{
		// From here on out, we try to resolve the crafting in a single step if possible, starting with largest battery + smallest battery.
		if (availableAmount(Item.get("battery (AA)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (AA)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (D)")) >= 1;
		}
		else if (availableAmount(
		// If crafting requires multiple steps, we rely on recursion.
		Item.get("battery (AAA)")) >= 3)
		{
			if (simulate) { return true; }
			batteryCombine(Item.get("battery (AA)"));
			craft("combine", 1, Item.get("battery (AA)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (D)")) >= 1;
		}
		return false;
	}
	else if (battery === Item.get("battery (9-Volt)"))
	{
		// Single step.
		if (availableAmount(Item.get("battery (D)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (D)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (9-Volt)")) >= 1;
		}
		else if (availableAmount(
		// Single step.
		Item.get("battery (AA)")) >= 2)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (AA)"), Item.get("battery (AA)"));
			return availableAmount(Item.get("battery (9-Volt)")) >= 1;
		}
		else if (availableAmount(
		// Every multi step case with recursion.
		Item.get("battery (AAA)")) >= 4 || availableAmount(Item.get("battery (AA)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 2)
		{
			if (simulate) { return true; }
			batteryCombine(Item.get("battery (D)"));
			craft("combine", 1, Item.get("battery (D)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (9-Volt)")) >= 1;
		}
		return false;
	}
	else if (battery === Item.get("battery (lantern)"))
	{
		// Single step.
		if (availableAmount(Item.get("battery (9-Volt)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (9-Volt)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (lantern)")) >= 1;
		}
		else if (availableAmount(
		// Single step.
		Item.get("battery (D)")) >= 1 && availableAmount(Item.get("battery (AA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (D)"), Item.get("battery (AA)"));
			return availableAmount(Item.get("battery (lantern)")) >= 1;
		}
		else if (availableAmount(
		// Every multi step case with recursion.
		Item.get("battery (AAA)")) >= 5 || availableAmount(Item.get("battery (AA)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 3 || availableAmount(Item.get("battery (D)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 2 || availableAmount(Item.get("battery (AA)")) >= 2 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			batteryCombine(Item.get("battery (9-Volt)"));
			craft("combine", 1, Item.get("battery (9-Volt)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (lantern)")) >= 1;
		}
		return false;
	}
	else if (battery === Item.get("battery (car)"))
	{
		// Single step.
		if (availableAmount(Item.get("battery (lantern)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (lantern)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (car)")) >= 1;
		}
		else if (availableAmount(
		// Single step.
		Item.get("battery (9-Volt)")) >= 1 && availableAmount(Item.get("battery (AA)")) >= 1)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (9-Volt)"), Item.get("battery (AA)"));
			return availableAmount(Item.get("battery (car)")) >= 1;
		}
		else if (availableAmount(
		// Single step.
		Item.get("battery (D)")) >= 2)
		{
			if (simulate) { return true; }
			craft("combine", 1, Item.get("battery (D)"), Item.get("battery (D)"));
			return availableAmount(Item.get("battery (car)")) >= 1;
		}
		else if (availableAmount(
		// The only multi-step case that can't be resolved by the same function (can't turn AAs into a lantern without a AA or D)
		Item.get("battery (AA)")) >= 3)
		{
			if (simulate) { return true; }
			batteryCombine(Item.get("battery (9-Volt)"));
			craft("combine", 1, Item.get("battery (9-Volt)"), Item.get("battery (AA)"));
			return availableAmount(Item.get("battery (car)")) >= 1;
		}
		else if (availableAmount(
		// Every other multi step case with recursion.
		Item.get("battery (AAA)")) >= 6 || availableAmount(Item.get("battery (AA)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 4 || availableAmount(Item.get("battery (D)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 3 || availableAmount(Item.get("battery (9-Volt)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 2 || availableAmount(Item.get("battery (AA)")) >= 2 && availableAmount(Item.get("battery (AAA)")) >= 2 || availableAmount(Item.get("battery (D)")) >= 1 && availableAmount(Item.get("battery (AA)")) >= 1 && availableAmount(Item.get("battery (AAA)")) >= 1)
		{
			if (simulate) { return true; }
			batteryCombine(Item.get("battery (lantern)"));
			craft("combine", 1, Item.get("battery (lantern)"), Item.get("battery (AAA)"));
			return availableAmount(Item.get("battery (car)")) >= 1;
		}
	}
	return false;
}

export function can_get_battery(target: Item): boolean
{
	if (batteryPoints(target) === 0)
	{ //0 means target is not a battery
  		return false;
	}
	if (availableAmount(target) > 0)
	{ //already have it
		return true;
	}
	if (canUntinker())
	{
		return totalBatteryPoints() >= batteryPoints(target); //we can untinker. so just count battery points
	}
	return batteryCombine$1(target, true); //can not untinker. only check meatpasting by simulating batteryCombine
}

export function auto_getBattery(target: Item): boolean
{
	// This function will ensure target battery is available before use, if possible.
	if (batteryPoints(target) === 0)
	{ //0 means target is not a battery
  		return false;
	}
	if (availableAmount(target) >= 1)
	{
		return true; //we already have the target. we are done here
	}
	//try to create target
	if (batteryCombine(target))
	{
		return true;
	}
	//try to use untinkering to get target or enough AAA to make target
	if (totalBatteryPoints() >= batteryPoints(target) && canUntinker())
	{
		for (const it of Item.get(["battery (car)", "battery (lantern)", "battery (9-Volt)", "battery (D)", "battery (AA)"]))
		{
			if (myMeat() < 10)
			{
				break; //we ran out of meat and can no longer meatpaste
			}
			//Batteries always untinker into an [AAA] and an [X-1] battery. where X was previous battery value.
			//so if we have a higher value battery just walk it down to the target.
			if (batteryPoints(it) > batteryPoints(target))
			{ //we have a higher tier battery we can untinker down to target
				untinker(it);
				if (batteryCombine(target))
				{ //either we untinkered down to target. or we got enough AAA to make target now.
					return true;
				}
			}
			else {
			//all the batteries we had to begin with were smaller than target. They were just the wrong values to merge.
			//so just break them apart until you are able to make target
			for (let i = 1, _last_4 = min(6, itemAmount(it)), _step_4 = 1, _up_4 = i <= _last_4, _inc_4 = _up_4 ? Math.abs(_step_4) : -Math.abs(_step_4); _up_4 ? i <= _last_4 : i >= _last_4; i += _inc_4) {
				untinker(it);
				if (batteryCombine(target))
				{
					return true;
				}
			} }
		}
	}
	return false;
}

export function have_fireworks_shop(): boolean
{
	if (is_werewolf())
	{
		return false; //can't access fireworks shop as a werewolf
	}
	if (itemAmount(Item.get("Clan VIP Lounge key")) === 0)
	{
		return false;
	}
	if (!auto_is_valid(Item.get("clan underground fireworks shop")))
	{
		return false;
	}
	return toBoolean(getProperty("_fireworksShop"));
}

export function auto_buyFireworksHat(): boolean
{
	// equipment doesn't give buffs in these paths
	if (in_gnoob() || in_tcrs())
	{
		return false;
	}
	//the damage from all three hats one-shots the professor after a round of combat
	if (in_wereprof())
	{
		return false;
	}

	if (!have_fireworks_shop())
	{
		return false;
	}

	if (toBoolean(getProperty("_fireworksShopHatBought")))
	{
		return false;
	}

	if (myMeat() < npcPrice(Item.get("porkpie-mounted popper")) + meatReserve() && auto_is_valid(Item.get("porkpie-mounted popper")))
	{
		auto_log_info$1("Want to buy a hat from the fireworks shop, but don't have enough meat. Will try again later.");
		return false;
	}
	// noncombat is most valuable hat but has no effect in LAR and can't be removed in Hat Trick
	if (auto_can_equip(Item.get("porkpie-mounted popper")) && !(in_lar() || in_hattrick()))
	{
		const simNonCombat: number = providePlusNonCombat(auto_combatModCap(), Location.get("Noob Cave"), true, true);
		if (simNonCombat < auto_combatModCap())
		{
			retrieveItem(1, Item.get("porkpie-mounted popper"));
			return true;
		}
	}
	// +combat hat is second most useful but has no effect in LAR and can't be removed in Hat Trick
	if (auto_can_equip(Item.get("sombrero-mounted sparkler")) && !(in_lar() || in_hattrick()))
	{
		const simCombat: number = providePlusCombat(auto_combatModCap(), Location.get("Noob Cave"), true, true);
		if (simCombat < auto_combatModCap())
		{
			retrieveItem(1, Item.get("sombrero-mounted sparkler"));
			return true;
		}
	}
	// ML hat is least useful
	// todo: add functionality to simulate acquiring ML instead of just looking at current ML
	if (auto_can_equip(Item.get("fedora-mounted fountain")))
	{
		if (monsterLevelAdjustment() < toInt(getProperty("auto_MLSafetyLimit")))
		{
			retrieveItem(1, Item.get("fedora-mounted fountain"));
			return true;
		}
	}

	return false;
}

export function auto_haveFireExtinguisher(): boolean
{
	const exting: Item = wrap_item(Item.get("industrial fire extinguisher"));
	return possessEquipment(exting) && auto_is_valid(exting);
}

export function auto_fireExtinguisherCharges(): number
{
	if (!auto_haveFireExtinguisher()) { return 0; }
	return toInt(getProperty("_fireExtinguisherCharge"));
}
// returns zone specific skill if in usable zone and hasn't been used yet there this ascension. Otherwise returns empty string
export function auto_FireExtinguisherCombatString(place: Location): string
{
	if (auto_fireExtinguisherCharges() < 20 || !auto_is_valid$2(Skill.get("Fire Extinguisher: Zone Specific")))
	{
		return "";
	}

	if (in_wereprof())
	{
		return "";
	}
	// once per ascension uses
	if (Location.get(["Guano Junction", "The Batrat and Ratbat Burrow", "The Beanbat Chamber"]).includes(place) && !toBoolean(getProperty("fireExtinguisherBatHoleUsed")))
	{
		//sonar-in-a-biscuits are used before combat, if available. Knock a wall down if any are still standing
		if (internalQuestStatus("questL04Bat") < 3)
		{
			return `skill ${Skill.get("Fire Extinguisher: Zone Specific")}`;
		}

	}

	if (place === Location.get("Cobb's Knob Harem") && !toBoolean(getProperty("fireExtinguisherHaremUsed")) && !possessOutfit$1("Knob Goblin Harem Girl Disguise"))
	{
		return `skill ${Skill.get("Fire Extinguisher: Zone Specific")}`;
	}

	if (place === Location.get("The Defiled Niche") && !toBoolean(getProperty("fireExtinguisherCyrptUsed")))
	{
		return `skill ${Skill.get("Fire Extinguisher: Zone Specific")}`;
	}

	if (place === Location.get("The Smut Orc Logging Camp") && !toBoolean(getProperty("fireExtinguisherChasmUsed")) && toInt(getProperty("chasmBridgeProgress")) < bridgeGoal() && !auto_hasAutumnaton())
	{
		return `skill ${Skill.get("Fire Extinguisher: Zone Specific")}`;
	}

	if (place === Location.get("The Arid, Extra-Dry Desert") && (Location.get("The Arid, Extra-Dry Desert")).turnsSpent > 0 && !toBoolean(getProperty("fireExtinguisherDesertUsed")) && !auto_haveBofa())
	{
		return `skill ${Skill.get("Fire Extinguisher: Zone Specific")}`;
	}


	return "";

}

export function auto_canExtinguisherBeRefilled(): boolean
{
	return auto_haveFireExtinguisher() && in_wildfire() && !toBoolean(getProperty("_fireExtinguisherRefilled"));
}

export function auto_haveColdMedCabinet(): boolean
{
	return auto_get_campground().has(Item.get("cold medicine cabinet")) && auto_is_valid(Item.get("cold medicine cabinet"));
}

export function auto_CMCconsultsLeft(): number
{
	if (!auto_haveColdMedCabinet())
	{
		return 0;
	}
	let consultsUsed: number = toInt(getProperty("_coldMedicineConsults"));
	if (consultsUsed > 5)
	{
		auto_log_warning("Mafia's tracking of Cold Medicine Cabinet consults today errored (reported > 5 uses today). Reseting to 5.", "red");
		consultsUsed = 5;
	}
	return 5 - consultsUsed;
}

function auto_CMCconsultAvailable(): boolean
{
	if (auto_CMCconsultsLeft() === 0)
	{
		return false;
	}

	const nextConsult: number = toInt(getProperty("_nextColdMedicineConsult"));
	//prior to first use each day, prop value is 0
	if (nextConsult === 0)
	{
		return true;
	}
	return totalTurnsPlayed() >= nextConsult;
}

export function auto_CMCconsult(): void
{
	//consume previously bought items if conditions are right
	//perhaps pill was bought yesterday with full spleen
	function notAboutToDoNuns(): boolean
	{
		//should avoid getting more free kill charges when about to do nuns because the fights would be capped to 1000 meat
		if (myLevel() >= 12)
		{
			if (myLocation() === Location.get("The Themthar Hills"))
			{
				return false;
			}
			if (myLocation() === Location.get("The Battlefield (Frat Uniform)") && getProperty("sidequestNunsCompleted") === "none")
			{
				const hippiesDefeated: number = toInt(getProperty("hippiesDefeated"));
				if (hippiesDefeated <= 208 && auto_bestWarPlan().doNuns)
				{
					const turnsUntilNuns: number = min(16, ceil(max(0, 191.0 - hippiesDefeated) / auto_warKillsPerBattle()));
					if (toInt(getProperty("breathitinCharges")) + 5 >= turnsUntilNuns)
					{
						return false; //may do nuns before breathitin charges get used up
					}
				}
			}
			if (toBoolean(getProperty("auto_hippyInstead")) && internalQuestStatus("questL12War") === 1 && getProperty("sidequestNunsCompleted") === "none")
			{
				if (auto_bestWarPlan().doNuns && (getProperty("sidequestOrchardCompleted") !== "none" || !auto_bestWarPlan().doOrchard))
				{
					return false; //war started and about to start nuns as hippy anytime?
				}
			}
		}
		return true;
	}
	function shouldChewBreathitin(): boolean
	{
		if (myLocation() === Location.get("The Hidden Park"))
		{
			//already free [dense liana] should come right after and would waste charges
			//can't know how many combats will remain in the park which is ideally noncombats
			return false;
		}
		return notAboutToDoNuns();
	}
	if (shouldChewBreathitin() && !isActuallyEd() && !haveSpleenFamiliar() && !canInteract())
	{
		pullXWhenHaveY(Item.get("Breathitin&trade;"), 1, 0);
	}
	if (itemAmount(Item.get("Breathitin&trade;")) > 0 && shouldChewBreathitin() && !canInteract())
	{
		autoChew(1, Item.get("Breathitin&trade;"));
	}
	if (itemAmount(Item.get("Homebodyl&trade;")) > 0 && freeCrafts$1() < 5)
	{
		autoChew(1, Item.get("Homebodyl&trade;"));
	}
	//use fleshazole if we don't have much meat
	if (itemAmount(Item.get("Fleshazole&trade;")) > 0 && myMeat() + 2000 < meatReserve() && myLevel() >= 5)
	{
		autoChew(1, Item.get("Fleshazole&trade;"));
	}

	if (!auto_CMCconsultAvailable())
	{
		return;
	}

	if (toBoolean(getProperty("_auto_coldMedicineLocked")))
	{
		//haven't visited yet since it was last locked so always visit to update available consults
		setProperty("_auto_coldMedicineLocked", "false");
	}
	else if (auto_CMCconsultsLeft() <= 2 && freeCrafts$1() >= 5 && possessEquipment(Item.get("ice crown")) && myMeat() >= meatReserve())
	{
		//only looking for Breathitin from at least 11 fights spent underground
		if (myLocation().environment !== "underground")
		{
			//if Breathitin was not available last turn and last location was not underground it will still not be available now so no visit needed
			return;
		}
	}

	let bestOption: number = -1;
	let consumableBought: Item = Item.none;
	const page: string = visitUrl("campground.php?action=workshed");
	if (containsText(page, "Breathitin"))
	{
		auto_log_info("Buying Breathitin pill from CMC", "blue");
		bestOption = 5;
		consumableBought = Item.get("Breathitin&trade;");
	}
	else if (!(auto_is_valid$1(Familiar.get("Cookbookbat")) && haveFamiliar(Familiar.get("Cookbookbat")) && knollAvailable()) && containsText(page, "Homebodyl") && freeCrafts$1() < 5)
	{
		// don't need free crafts if we have the Cookbookbat in knoll signs.
		// Cookbookbat gives us 5 free cooks every day & we only use free crafting on cooking in knoll signs
		auto_log_info("Buying Homebodyl pill from CMC", "blue");
		bestOption = 5;
		consumableBought = Item.get("Homebodyl&trade;");
	}
	else if ((!in_small() || inHardcore()) && containsText(page, "ice crown"))
	{
		// don't need the ice crown in Normal Small as we pull hats.
		auto_log_info("Buying ice crown from CMC", "blue");
		bestOption = 1;
	}
	else if (containsText(page, "Fleshazole") && myMeat() + 2000 < meatReserve())
	{
		auto_log_info("Buying Fleshazole pill from CMC", "blue");
		bestOption = 5;
		consumableBought = Item.get("Fleshazole&trade;");
	}
	else if (auto_CMCconsultsLeft() > 2 && !canInteract() && !in_small() && !in_kolhs())
	{
		//reserve the last 2 consults for something more valuable than booze/food
		//consume logic will drink/eat later
		if (inebriety_left() > 0)
		{
			auto_log_info("Buying booze from CMC", "blue");
			bestOption = 3;
		}
		else if (fullness_left() > 0)
		{
			auto_log_info("Buying food from CMC", "blue");
			bestOption = 2;
		}
	}

	if (bestOption !== -1)
	{
		setProperty("_auto_coldMedicineLocked", "true"); //when taking a consultation, set property as a reminder to always check again next time consultations are unlocked
		runChoice(bestOption);
	}

	if (consumableBought === Item.get("Homebodyl&trade;") || consumableBought === Item.get("Breathitin&trade;") && shouldChewBreathitin())
	{
		autoChew(1, consumableBought);
	}

	if (consumableBought === Item.get("Fleshazole&trade;") && myMeat() < meatReserve() && myLevel() >= 5)
	{
		autoChew(1, consumableBought);
	}
}