import { Class, Item, Path, containsText, myClass, myDaycount, myPath, visitUrl } from "kolmafia";
import { pullXWhenHaveY } from "../auto_acquire";
import { auto_log_info } from "../auto_util";

// Code here is supplementary handlers and specialized handlers

//Defined in autoscend/paths/picky.ash
export function in_picky(): boolean
{
	return myPath() === Path.get("Picky");
}

export function picky_pulls(): void
{
	if (in_picky())
	{
		if (myDaycount() === 3)
		{
			//pullXWhenHaveY($item[Wand of Nagamar], 1, 0);		//Pull made obsolete by Questificaton
			//pullXWhenHaveY($item[Star Key Lime Pie], 3, 0);
			pullXWhenHaveY(Item.get("cold hi mein"), 3, 0);
		}

	}
}

export function picky_startAscension(): void
{
	auto_log_info("In Being Picky Adventure", "blue");
	if (myClass() === Class.get("Turtle Tamer") || myClass() === Class.get("Seal Clubber"))
	{
		auto_log_info("Selecting skills", "blue");
		let page: string = visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=1&familiar=188", true);
		if (containsText(page, "<option value=\"165\""))
		{
			visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=1&familiar=165", true);
		}
		else {
			visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=1&familiar=140", true);
		}
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=1&familiar=178", true);
		// Olfaction, Torso
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=19", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=12", true);
		// Pulverize, Astral Shell, Hero of the Half Shell, Cannelloni Cocoon
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=1016", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=2012", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=2020", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=3012", true);
		// Elemental Saucesphere, Mad Looting Skillz, Smooth Movement
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=4007", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=5006", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=5017", true);
		// Fat Leon's Phat Loot Lyric, The Sonata of Sneakiness
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=6010", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=2&skill=6015", true);
		visitUrl("choice.php?pwd&whichchoice=995&pwd=&option=3&submit=I Am Done Picking", true);
	}
}