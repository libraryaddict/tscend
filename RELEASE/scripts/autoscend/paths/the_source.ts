import { Effect, Item, Location, Path, Skill, getProperty, haveEffect, haveSkill, itemAmount, myAscensions, myDaycount, myLevel, myPath, setProperty, toInt, toLocation, visitUrl } from "kolmafia";
import { autoAdv$2 } from "../auto_adventure";
import { auto_log_debug$1, auto_log_info, internalQuestStatus } from "../auto_util";
import { auto_sourceTerminalEnhance } from "../iotms/mr2016";
import { L8_trapperQuest } from "../quests/level_08";
import { L10_holeInTheSkyUnlock, L10_topFloor } from "../quests/level_10";
import { shenShouldDelayZone } from "../quests/level_11";
import { startArmorySubQuest, startGalaktikSubQuest, startMeatsmithSubQuest } from "../quests/optional";

//Defined in autoscend/paths/the_source.ash
export function in_theSource(): boolean
{
	return myPath() === Path.get("The Source");
}

export function theSource_initializeSettings(): boolean
{
	if (in_theSource())
	{
//		set_property("auto_lastSpoon", 0);
		setProperty("auto_getBeehive", true.toString());
		setProperty("auto_wandOfNagamar", false.toString());
	}
	return false;
}

export function theSource_buySkills(): boolean
{
	if (toInt(getProperty("sourceEnlightenment")) === 0)
	{
		return false;
	}

	let temp: string = visitUrl("place.php?whichplace=manor1&action=manor1_sourcephone_ring");
	let enlightenment: number = toInt(getProperty("sourceEnlightenment"));
	while (enlightenment > 0)
	{
		let option: number = 0;
		if (!haveSkill(Skill.get("Restore")))
		{
			option = 10;
		}
		if (!haveSkill(Skill.get("Overclocked")))
		{
			option = 1;
		}
		if (!haveSkill(Skill.get("Reboot")))
		{
			option = 9;
		}
		if (!haveSkill(Skill.get("Bullet Time")))
		{
			option = 2;
		}
		if (!haveSkill(Skill.get("True Disbeliever")))
		{
			option = 3;
		}
		if (!haveSkill(Skill.get("Code Block")))
		{
			option = 4;
		}
		if (!haveSkill(Skill.get("Disarmament")))
		{
			option = 5;
		}
		if (!haveSkill(Skill.get("Humiliating Hack")))
		{
			option = 7;
		}
		if (!haveSkill(Skill.get("Big Guns")))
		{
			option = 6;
		}
		if (!haveSkill(Skill.get("Data Siphon")))
		{
			option = 11;
		}
		if (!haveSkill(Skill.get("Source Kick")))
		{
			option = 8;
		}

		if (option !== 0)
		{
			temp = visitUrl(`choice.php?pwd=&whichchoice=1188&option=1&skid=${option}`);
		}
		enlightenment -= 1;
	}
	return false;
}

export function L8_theSourceNinjaOracle(): boolean
{
	//handles the scenario where we want do the oracle quest and the target is the ninja snowmen lair
	//in this case we do not mind if we can not beat the assassins. but if we can we would rather not waste adventures.
	if (internalQuestStatus("questL08Trapper") === -1)
	{ //quest not even started. zone not accessible
		return false;
	}
	if (internalQuestStatus("questL08Trapper") > 2)
	{ //done with the slope this ascension so just adventure in the lair
		return autoAdv$2(Location.get("Lair of the Ninja Snowmen"));
	}
	if (internalQuestStatus("questL08Trapper") < 2)
	{ //try to advance quest to step2 to unlock the ninja snowman lair
		return L8_trapperQuest(); //if we fail to advance quest we want to go do something else. we are probably delaying
	}

	if (haveEffect(Effect.get("Thrice-Cursed")) > 0 || haveEffect(Effect.get("Twice-Cursed")) > 0 || haveEffect(Effect.get("Once-Cursed")) > 0)
	{
		return false; //delaying to not disrupt hidden city
	}
	if (shenShouldDelayZone(Location.get("Lair of the Ninja Snowmen")))
	{
		auto_log_debug$1("Delaying Lair of the Ninja Snowmen in case of Shen.");
		return false;
	}

	return autoAdv$2(Location.get("Lair of the Ninja Snowmen"));
}

export function LX_theSource(): boolean
{
	if (!in_theSource())
	{
		return false;
	}

	if (myDaycount() <= 2 && haveEffect(Effect.get("substats.enh")) === 0 && myLevel() < 13)
	{
		auto_sourceTerminalEnhance("substats");
	}

	let goal: Location = toLocation(getProperty("sourceOracleTarget"));
	if (goal !== Location.none && itemAmount(Item.get("no spoon")) === 0)
	{
		if (goal === Location.get("The Batrat and Ratbat Burrow") && internalQuestStatus("questL04Bat") < 1)
		{
			return false;
		}
		if (goal === Location.get("Cobb's Knob Laboratory") && itemAmount(Item.get("Cobb's Knob lab key")) === 0)
		{
			return false;
		}

		if (goal === Location.get("Lair of the Ninja Snowmen") && internalQuestStatus("questL08Trapper") < 2)
		{
			return false;
		}
		if (goal === Location.get("The VERY Unquiet Garves") && getProperty("questL07Cyrptic") !== "finished")
		{
			return false;
		}
		if (goal === Location.get("The Castle in the Clouds in the Sky (Top Floor)"))
		{
			if (internalQuestStatus("questL10Garbage") < 9)
			{
				return false;
			}
			if (L10_topFloor() || L10_holeInTheSkyUnlock())
			{
				return true;
			}
		}
		if (goal === Location.get("Lair of the Ninja Snowmen"))
		{
			return L8_theSourceNinjaOracle();
		}

		if (goal === Location.get("The Red Zeppelin") && internalQuestStatus("questL11Ron") < 3)
		{
			return false;
		}
		if (goal === Location.get("The Hidden Park") && internalQuestStatus("questL11Worship") > 2)
		{
			return false;
		}

		auto_log_info("Not searching for a spoon, not at all...", "green");
		return autoAdv$2(goal);
	}
	return false;
}

export function theSource_oracle(): boolean
{
	if (!in_theSource())
	{
		return false;
	}

	if (haveSkill(Skill.get("Restore")))
	{
		return false;
	}

	if (toLocation(getProperty("sourceOracleTarget")) === Location.none)
	{
		let temp: string = visitUrl("place.php?whichplace=town_wrong&action=townwrong_oracle");
		temp = visitUrl("choice.php?pwd=&whichchoice=1190&option=1");

		switch (toLocation(getProperty("sourceOracleTarget")))
		{
		case Location.get("The Skeleton Store"):		startMeatsmithSubQuest();		break;
		case Location.get("Madness Bakery"):		startArmorySubQuest();		break;
		case Location.get("The Overgrown Lot"):		startGalaktikSubQuest();		break;
		}

	}
	else if (itemAmount(Item.get("no spoon")) > 0)
	{
		let temp: string = visitUrl("place.php?whichplace=town_wrong&action=townwrong_oracle");
		temp = visitUrl("choice.php?pwd=&whichchoice=1190&option=2");
		return true;
	}

	return false;
}

export function LX_attemptPowerLevelTheSource(): boolean
{
	if (!in_theSource())
	{
		return false;
	}
	if (toInt(getProperty("lastSecondFloorUnlock")) !== myAscensions())
	{
		return false;
	}
	//Banish mahogant, elegant after gown only. (Harold\'s Bell?)
	return autoAdv$2(Location.get("The Haunted Bedroom"));
}