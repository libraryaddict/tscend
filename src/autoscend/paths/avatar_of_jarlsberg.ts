import { create, getProperty, haveSkill, Item, itemAmount, mpCost, myCompanion, myLevel, myMp, myPath, Path, setProperty, Skill, toBoolean, toInt, use, useSkill, visitUrl } from "kolmafia";
import { acquireHermitItem, pullXWhenHaveY } from "../auto_acquire";
import { equipBaseline } from "../auto_equipment";
import { auto_have_skill, auto_log_info, auto_log_info$1, ovenHandle } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_jarlsberg.ash
export function is_jarlsberg(): boolean
{
	return myPath() === Path.get("Avatar of Jarlsberg");
}

export function jarlsberg_initializeSettings(): void
{
    	if (is_jarlsberg())
	{
		auto_log_info("Initializing Avatar of Jarlsberg settings", "blue");
		setProperty("auto_wandOfNagamar", false.toString());
	}
}

export function jarlsberg_initializeDay(day: number): void
{
	if (!is_jarlsberg())
	{
		return;
	}
	if (day === 2)
	{
		equipBaseline();
		ovenHandle();

		if (toInt(getProperty("auto_day_init")) < 2)
		{
			if (itemAmount(Item.get("gym membership card")) > 0)
			{
				use(1, Item.get("gym membership card"));
			}

			if (itemAmount(Item.get("seal tooth")) === 0)
			{
				acquireHermitItem(Item.get("seal tooth"));
			}
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}
			pullXWhenHaveY(Item.get("Hand in Glove"), 1, 0);
			pullXWhenHaveY(Item.get("blackberry galoshes"), 1, 0);
		}
	}
	else if (day === 3)
	{
		if (toInt(getProperty("auto_day_init")) < 3)
		{
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}
			setProperty("auto_day_init", (3).toString());
		}
	}
	else if (day === 4)
	{
		if (toInt(getProperty("auto_day_init")) < 4)
		{
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}
			setProperty("auto_day_init", (4).toString());
		}
	}
}

export function jarlsberg_buySkills(): void
{ //Not certain of Skill Priority Order. Current is a good start, will see how it goes.
	if (!is_jarlsberg())
	{
		return;
	}
	if (myLevel() <= toInt(getProperty("_auto_jarlsbergSkills")))
	{
		return;

	}
	if (toBoolean(getProperty("_auto_completedJarlsbergSkillTree")))
	{ //Prevent us from running through the full list of skills checks more than once per day if we already have all skills
		return;
	}

	const page: string = visitUrl("da.php?place=gate2");
	const my_skillPoints: AshMatcher = new AshMatcher("(\\d+) skill point", page);
	if (my_skillPoints.find())
	{
		let skillPoints: number = toInt(my_skillPoints.group(1));
		auto_log_info$1(`Skill points found: ${skillPoints}`);

		while (skillPoints > 0)
		{
			skillPoints = skillPoints - 1;
			let skillid: number = 0;
			//skills are listed in reverse order. from last to first to buy..

			for (const sk of Skill.get(["Radish Horse", "Working Lunch", "Gristlesphere", "Oilsphere", "Coffeesphere", "Chocolatesphere", "Cream Puff", "Blend",
			"Nightcap", "Conjure Cream", "Early Riser", "Fry", "Conjure Dough", "Lunch Like a King", "Slice", "Conjure Cheese",
			"Egg Man", "Conjure Eggs", "Food Coma", "Chop", "Grill", "Best Served Cold", "Never Late for Dinner", "Conjure Meat Product",
			"Conjure Vegetables", "Hippotatomous", "Conjure Potato", "Bake", "Freeze", "Conjure Fruit", "The Most Important Meal", "Boil"]))
			{
				if (!haveSkill(sk))
				{
					skillid = toInt(sk);
				}
			}

			if (skillid !== 0)
			{
				visitUrl(`jarlskills.php?action=getskill&getskid=${skillid}`);
			}
			else {
				setProperty("_auto_completedJarlsbergSkillTree", true.toString());
				return;
			}

		}
	}

	setProperty("_auto_jarlsbergSkills", myLevel().toString());
}

export function LM_jarlsberg(): boolean
{
	//this function is called early once every loop of doTasks() in autoscend.ash
	//if something in this function returns true then it will restart the loop and get called again.

	if (!is_jarlsberg())
	{
		return false;
	}


	jarlsberg_buySkills();
	// Use egg man for drops
	if (auto_have_skill(Skill.get("Egg Man")) && mpCost(Skill.get("Egg Man")) <= myMp() && itemAmount(Item.get("cosmic egg")) > 0 && myCompanion() === "")
	{
		useSkill(1, Skill.get("Egg Man"));
	}

	if (!toBoolean(getProperty("_cosmicSixPackConjured")))
	{
		create(1, Item.get("cosmic six-pack"));
	}

	return false;
}
