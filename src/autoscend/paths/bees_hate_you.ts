import { Effect, Item, Location, Monster, Path, Slot, abort, cliExecute, containsText, getProperty, haveEffect, isUnrestricted, itemAmount, lastMonster, myPath, putCloset, setProperty, toBoolean, toSlot, visitUrl } from "kolmafia";
import { autoAdvBypass$1 } from "../auto_adventure";
import { internalQuestStatus } from "../auto_util";
import { inAftercore } from "./casual";

//Defined in autoscend/paths/bees_hate_you.ash
export function in_bhy(): boolean
{
	return myPath() === Path.get("Bees Hate You");
}

export function bhy_initializeSettings(): void
{
	if (in_bhy())
	{
		setProperty("auto_abooclover", false.toString());
		setProperty("auto_wandOfNagamar", false.toString());
		setProperty("auto_hippyInstead", true.toString());
		setProperty("auto_getBeehive", true.toString());
		setProperty("auto_getBoningKnife", true.toString());
		setProperty("auto_ignoreFlyer", true.toString());
	}
}

export function bhy_usable(str: string): boolean
{
	if (!in_bhy())
	{
		return true;
	}

	switch (str)
	{
	case "Cobb's Knob map":
	case "ball polish":
	case "black market map":
	case "boring binder clip":
	case "beehive":
	case "electric boning knife":
	case "ninja carabiner":
	case "Orcish baseball cap":
	case "reinforced beaded headband":
	case "bullet-proof corduroys":
	case "blackberry galoshes":
	case "titanium assault umbrella":
	case "Knob Goblin harem pants":
	case "Knob Goblin harem veil":
		return true;
	}

	if (containsText(str, "b"))
	{
		return false;
	}
	if (containsText(str, "B"))
	{
		return false;
	}
	return true;
}

export function bhy_is_item_valid(it: Item): boolean
{
	//returns whether an item is valid while you are in a bees hate you run. Do not call it outside BHY.
	if (!in_bhy())
	{ //returning true or false here would cause mistakes. so just abort if this ever happens. which it should not.
		abort("bhy_is_item_valid(item it) should never be called outside of bees hate you path.");
	}
	if (toSlot(it) !== Slot.none)
	{
		return isUnrestricted(it); //this is equipment. equipment can be worn. you take backlash damage from it
	}
	if (Item.get(["Cobb's Knob map", "enchanted bean", "ball polish", "black market map", "boring binder clip", "beehive", "electric boning knife"]).includes(it))
	{
		return true; //these items are explicit exceptions which are allowed in BHY
	}
	//familiar hatchlings are always allowed. testing is too complicated and it does not really matter
	//food, drink, combat items, and useable items are forbidden if contain the letter B in the name:
	return bhy_usable(it.toString()) && isUnrestricted(it);
}

export function LM_bhy(): boolean
{
	if (!in_bhy())
	{
		return false;
	}
	// pension check keeps trying to be used
	for (const it of Item.get(["black pension check"]))
	{
		if (itemAmount(it) > 0)
		{
			putCloset(itemAmount(it), it);
		}
	}

	return false;
}

export function L13_bhy_towerFinal(): boolean
{
	//Prepare for and defeat the final boss for a Bees hate You run. Which has special rules for engagement.
	if (internalQuestStatus("questL13Final") !== 11)
	{
		return false;
	}

	if (itemAmount(Item.get("antique hand mirror")) < 1)
	{
		abort("Need the [antique hand mirror] to defeat the guy made of bees. Please get one from the jewelry of the animated rustic nightstand and try again.");
	}

	cliExecute("scripts/autoscend/auto_pre_adv.js");
	setProperty("auto_disableAdventureHandling", true.toString());
	autoAdvBypass$1("place.php?whichplace=nstower&action=ns_10_sorcfight", Location.get("Noob Cave"));

	if (lastMonster() !== Monster.get("Guy Made Of Bees"))
	{
		abort("Failed to start the battle with Guy Made Of Bees");
	}
	if (haveEffect(Effect.get("Beaten Up")) > 0)
	{
		abort("The Guy Made Of Bees beat me up! Please finish him off manually");
	}
	if (toBoolean(getProperty("auto_stayInRun")))
	{
		abort("User wanted to stay in run (auto_stayInRun), we are done.");
	}
	else {
		visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
		if (inAftercore())
		{
			abort("All done. King Ralph has been freed");
		}
		abort("Tried to break prism but failed");
	}
	abort("How did I reach this line? I should have fought [Guy Made Of Bees]");
	return false;
}