import { abort, canInteract, cliExecute, getProperty, inCasual, Item, mallPrice, myAscensions, myMeat, setProperty, toBoolean, toInt } from "kolmafia";
import { auto_buyUpTo } from "../auto_acquire";
import { auto_log_info, auto_log_warning } from "../auto_util";
import { L8_trapperPeak } from "../quests/level_08";

//Defined in autoscend/paths/casual.ash
export function inAftercore(): boolean
{
	return toBoolean(getProperty("kingLiberated"));
}

function inPostRonin(): boolean
{
	//can interact means you are not in ronin and not in hardcore. It returns true in casual, aftercore, and postronin
	if (canInteract() && !inCasual() && !inAftercore())
	{
		return true;
	}
	return false;
}

export function casualCheck(): void
{
	if (!inCasual())
	{
		return;
	}
	if (toInt(getProperty("_casualAscension")) !== -1)
	{
		setProperty("_casualAscension", myAscensions().toString());
		auto_log_warning("I think I'm in a casual ascension and should not run. To override:", "red");
		auto_log_warning("set _casualAscension = -1", "red");
		abort();
	}
}

export function L8_slopeCasual(): boolean
{
	//casual and postronin should mallbuy everything needed to skip this zone
	if (!canInteract())
	{
		return false; //does not have unrestricted mall access. we are not in casual or postronin
	}
	for (const it of Item.get(["eXtreme scarf", "eXtreme mittens", "snowboarder pants"]))
	{ //outfit ensures you can reach 5 cold res needed
		if (!auto_buyUpTo(1, it))
		{ //try to buy it or verify we already own it. if fails then do as below
			if (myMeat() < mallPrice(it))
			{
				auto_log_info(`Can not afford to buy [${it}] to climb the slope. Go do something else`, "red");
				return false;
			}
			abort(`Mysteriously failed to buy [${it}]. Buy it manually and run me again`);
		}
	}
	if (L8_trapperPeak())
	{ //try to unlock peak
		return true; //successfully finished this part of the quest
	}
	abort("Mysteriously failed to unlock the mountain peak in trapper quest in casual or postronin. please unlock it and run me again");
	return false;
}

export function LM_canInteract(): boolean
{
	//this function is called early once every loop of doTasks() in autoscend.ash to do things when we have unlimited mall access
	//which indicates postronin or casual or aftercore. currently won't get called in aftercore
	if (!canInteract())
	{
		return false;
	}

	if (toInt(getProperty("lastEmptiedStorage")) !== myAscensions())
	{
		cliExecute("pull all");
	}
	return false;
}