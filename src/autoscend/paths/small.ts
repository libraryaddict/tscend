import { Class, expectedDamage, Familiar, getProperty, haveEquipped, inHardcore, Item, itemAmount, Location, Monster, myClass, myMaxhp, myPath, Path, setProperty, toInt } from "kolmafia";
import { canPull$1, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$2 } from "../auto_adventure";
import { auto_have_familiar } from "../auto_familiar";
import { hasTorso$1 } from "../auto_util";

//Defined in autoscend/paths/the_source.ash
export function in_small(): boolean
{
	return myPath() === Path.get("A Shrunken Adventurer am I");
}

export function small_initializeSettings(): void
{
	if (!in_small())
	{
		return;
	}
	setProperty("auto_wandOfNagamar", true.toString()); //wand  used in this path
	setProperty("auto_getBeehive", true.toString()); //wall is too difficult without it
	setProperty("auto_getBoningKnife", true.toString()); //wall is too difficult without it
	setProperty("auto_getSteelOrgan", false.toString()); //can only consume size 1 drinks
	if (inHardcore())
	{
		//having vastly lower stats and no easy solutions in hardcore means you always die from flyering
		//should be replaced with a more elegant solution where detailed estimation / calculation is done.
		//set_property("auto_ignoreFlyer", true);
		//cap ML to 50 to help avoid getting beaten up
		const MLCap: number = 50;
		const MLSafetyLimit: string = getProperty("auto_MLSafetyLimit");
		if (MLSafetyLimit === "")
		{
			setProperty("auto_MLSafetyLimitBackup", "empty");
			setProperty("auto_MLSafetyLimit", MLCap.toString());
		}
		if (toInt(MLSafetyLimit) > MLCap)
		{
			// record existing MLSafetyLimit so it can be restored at end of run
			setProperty("auto_MLSafetyLimitBackup", MLSafetyLimit);
			setProperty("auto_MLSafetyLimit", MLCap.toString());
		}
		// don't disregard instant karma either. Helps keep ML low
		const disregardKarma: string = getProperty("auto_disregardInstantKarma");
		if (disregardKarma === "true")
		{
			setProperty("auto_disregardInstantKarmaBackup", "true");
			setProperty("auto_disregardInstantKarma", "false");
		}
	}
	else {
		if (auto_have_familiar(Familiar.get("Cookbookbat")) && (canPull$1(Item.get("Calzone of Legend")) || canPull$1(Item.get("Deep Dish of Legend")) || canPull$1(Item.get("Pizza of Legend"))))
		{
			setProperty("auto_dontUseCookBookBat", true.toString()); // don't need the CBB in Normal if we can pull a legend food.
		}
	}
}

export function auto_SmallPulls(): void
{
	if (!in_small())
	{
		return;
	}
	// small path ignores stat requirements for gear so can pull high end stuff
	// attempt to pull seal clubber dread hat
	if (myClass() === Class.get("Seal Clubber"))
	{
		pullXWhenHaveY(Item.get("Great Wolf's headband"), 1, 0);
	}
	// if can't get clubber dread hat (not SC or don't have it), then get nurse's hat
	if (itemAmount(Item.get("Great Wolf's headband")) === 0)
	{
		pullXWhenHaveY(Item.get("nurse's hat"), 1, 0);
	}
	// pull sea salt scrubs in small path if aware of torso
	if (hasTorso$1())
	{
		pullXWhenHaveY(Item.get("sea salt scrubs"), 1, 0);
	}

}

export function auto_smallCampgroundGear(): boolean
{
	if (!in_small())
	{
		return false;
	}
	// don't get campground gear in in Normal and haven't gotten beaten up
	const beatenUpCount: number = toInt(getProperty("auto_beatenUpCount"));
	if (!inHardcore() && beatenUpCount === 0)
	{
		return false;
	}

	const dirtGear: Map<Item, boolean> = new Map([[Item.get("mesquito proboscis"), true], [Item.get("ncle leg"), true], [Item.get("rutabuga bag"), true], [Item.get("senate fly thorax"), true]]);
	const tallGrassGear: Map<Item, boolean> = new Map([[Item.get("birdybug antenna"), true], [Item.get("daddy shortlegs leg"), true], [Item.get("kilopede skull"), true]]);
	const veryTallGrassGear: Item[] = Item.get(["beetle antenna", "mantis skull", "spider leg"]);
	function haveGear(gear: Map<Item, boolean>): boolean
	{
		for (const it of gear.keys())
		{
			if (itemAmount(it) === 0 && !haveEquipped(it))
			{
				return false;
			}
		}
		return true;
	}
	// get drops from dirt if we can survive at least 2 rounds of getting hit
	// always get dirt drops in HC small
	if (!haveGear(dirtGear))
	{
		return autoAdv$2(Location.get("Fight in the Dirt"));
	}
	else if (beatenUpCount > 0 && !haveGear(
	// get tall grass drops if we have gotten beaten up and can survive at least 2 rounds of getting hit
	tallGrassGear) && myMaxhp() > expectedDamage(Monster.get("kilopede")) * 2)
	{
		return autoAdv$2(Location.get("Fight in the Tall Grass"));
	}
/*
	// monsters here need spading. Don't know details of how they scale. Uncomment when mafia gets this info
	// get tall grass drops if we have gotten beaten up twice and can survive at least 2 rounds of getting hit
	else if(beatenUpCount > 0 && !haveGear(veryTallGrassGear) && (my_maxhp() > expected_damage($monster[flagellating mantis]) * 2))
	{
		return autoAdv($location[Fight in the Very Tall Grass]);
	}
*/
	return false;
}