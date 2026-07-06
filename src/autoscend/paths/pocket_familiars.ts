import { Item, Path, cliExecute, getProperty, gitExists, itemAmount, myLevel, myPath, myPrimestat, retrieveItem, setProperty, toBoolean, toInt, visitUrl } from "kolmafia";
import { possessEquipment } from "../auto_equipment";
import { auto_log_info, internalQuestStatus } from "../auto_util";
import { equipWarOutfit, warAdventure } from "../quests/level_12";

// This uses Ezandora's wonderful Helix Fossil script to handle building a team and combat.
//Defined in autoscend/paths/pocket_familiars.ash
export function in_pokefam(): boolean
{
	return myPath() === Path.get("Pocket Familiars");
}

export function pokefam_initializeSettings(): void
{
	if (in_pokefam())
	{
		// No need to restore HP or MP in Pocket Familiars.
		setProperty("auto_ignoreRestoreFailure", true.toString());
		// No need for a beehive as combat is different.
		setProperty("auto_getBeehive", false.toString());
		// We can't flyer, but all the sidequests are unlocked, so we can still war as frat
		setProperty("auto_ignoreFlyer", true.toString());
		// No Naughty Sorceress so no need for a wand.
		setProperty("auto_wandOfNagamar", false.toString());
		// runs are probably going to take at least 3 days, maybe 4 in hardcore
		setProperty("auto_runDayCount", (3).toString());
	}
}

export function pokefam_defaultMaximizeStatement(): string
{
	// Combat is completely different in pokefam, so most stuff doesn't matter there
	let res: string = "5item,meat";
	if (myLevel() < 13 || toBoolean(getProperty("auto_disregardInstantKarma")))
	{
		res += `,10exp,5${myPrimestat()} experience percent`;
	}
	return res;
}

export function pokefam_getHats(): void
{
	if (!in_pokefam()) {
		return;
	}
	visitUrl("shop.php?whichshop=pokefam");
	if (itemAmount(Item.get("1,960 pok&eacute;dollar bill")) < 50) {
		return;
	}
	for (const it of Item.get(["Team Avarice cap", "Team Sloth cap", "Team Wrath cap", "Mu cap"]))
	{
		if (!possessEquipment(it) && itemAmount(Item.get("1,960 pok&eacute;dollar bill")) >= 50)
		{
			retrieveItem(1, it);
		}
	}
}

export function pokefam_makeTeam(): boolean
{
	if (in_pokefam())
	{
		// Choose "strongest 2" in order to allow a middle spot for a pocket familiar to level up and earn pokebucks.
		if (gitExists("Ezandora-Helix-Fossil"))
		{
		auto_log_info("Setting our team via Ezandora:", "green");
		const ignore: boolean = cliExecute("PocketFamiliarsAutoSelect Strongest 2;");
		return true;
		}
	}
	return true;
}

export function L12_pokefam_clearBattlefield(): boolean
{
	// Pocket Familiars specific handling for clearing the battlefield.
	if (!in_pokefam())
	{
		return false;
	}

	if (internalQuestStatus("questL12War") !== 1)
	{
		return false;
	}

	if (toInt(getProperty("hippiesDefeated")) < 1000 && toInt(getProperty("fratboysDefeated")) < 1000)
	{
		auto_log_info("Doing the wars.", "blue");
		equipWarOutfit();
		return warAdventure();
	}
	return false;
}