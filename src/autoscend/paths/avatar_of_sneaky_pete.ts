import { abort, getProperty, haveSkill, Item, itemAmount, lastChoice, myLevel, myPath, Path, runChoice, setProperty, Skill, toInt, use, visitUrl } from "kolmafia";
import { acquireHermitItem, pullXWhenHaveY } from "../auto_acquire";
import { equipBaseline } from "../auto_equipment";
import { auto_log_info, auto_log_info$1, ovenHandle } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_sneaky_pete.ash
export function is_pete(): boolean
{
	return myPath() === Path.get("Avatar of Sneaky Pete");
}

export function pete_initializeSettings(): void
{
	if (is_pete())
	{
		setProperty("auto_peteSkills", (-1).toString());
		setProperty("auto_wandOfNagamar", false.toString());
	}
}


export function pete_initializeDay(day: number): void
{
	if (!is_pete())
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

export function pete_buySkills(): void
{
	if (!is_pete())
	{
		return;
	}

	if (myLevel() <= toInt(getProperty("auto_peteSkills")))
	{
		return;
	}
	// if you have all the skills and the motorcycle is fully upgraded, we're done.
	if (haveSkill(Skill.get("Natural Dancer")) && haveSkill(Skill.get("Flash Headlight")) && haveSkill(Skill.get("Walk Away From Explosion")) && getProperty("peteMotorbikeCowling") !== "" && getProperty("peteMotorbikeTires") !== "" && getProperty("peteMotorbikeMuffler") !== "" && getProperty("peteMotorbikeGasTank") !== "" && getProperty("peteMotorbikeHeadlight") !== "" && getProperty("peteMotorbikeSeat") !== "")
	{
		return;
	}

	let page: string = visitUrl("da.php?place=gate3");
	const my_skillPoints: AshMatcher = new AshMatcher("<b>(\\d+)</b> skill point", page);
	if (my_skillPoints.find())
	{
		let skillPoints: number = toInt(my_skillPoints.group(1));
		auto_log_info$1(`Skill points found: ${skillPoints}`);

		while (skillPoints > 0)
		{
			//skills are listed in inverse order. The first listed skill is the last skill to buy.
			skillPoints = skillPoints - 1;
			let tree: number = 1;

			if (!haveSkill(Skill.get("Flash Headlight")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Biker Swagger")))
			{
				tree = 2;
			}

			if (!haveSkill(Skill.get("Walk Away From Explosion")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Brood")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Unrepentant Thief")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("[15025]Hard Drinker")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Smoke Break")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Animal Magnetism")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Jump Shark")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Incite Riot")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Live Fast")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Insult")))
			{
				tree = 3;
			}
			if (!haveSkill(Skill.get("Natural Dancer")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Make Friends")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Cocktail Magic")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Check Hair")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Shake It Off")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Snap Fingers")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Fix Jukebox")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Throw Party")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Mixologist")))
			{
				tree = 1;
			}
			if (!haveSkill(Skill.get("Catchphrase")))
			{
				tree = 1;
			}

			if (!haveSkill(Skill.get("Riding Tall")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Check Mirror")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Easy Riding")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Peel Out")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Rowdy Drinker")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Pop Wheelie")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Born Showman")))
			{
				tree = 2;
			}
			if (!haveSkill(Skill.get("Rev Engine")))
			{
				tree = 2;
			}
			visitUrl(`choice.php?option=${tree}&whichchoice=867&pwd=`);
		}
	}
	// Skip if the motorcycle is fully upgraded
	page = visitUrl("main.php?action=motorcycle");
	let my_cyclePoints: AshMatcher = new AshMatcher("Upping Your Grade", page);
	while (my_cyclePoints.find())
	{
		auto_log_info("Found Upping Your Grade", "blue");
		let firstChoice: number = -1;
		let secondChoice: number = -1;
		if (getProperty("peteMotorbikeCowling") === "")
		{
			firstChoice = 4;
			secondChoice = 3;
		}
		else if (getProperty("peteMotorbikeTires") === "")
		{
			firstChoice = 1;
			secondChoice = 1;
		}
		else if (getProperty("peteMotorbikeMuffler") === "")
		{
			firstChoice = 5;
			secondChoice = 2;
		}
		else if (getProperty("peteMotorbikeGasTank") === "")
		{
			firstChoice = 2;
			secondChoice = 2;
		}
		else if (getProperty("peteMotorbikeHeadlight") === "")
		{
			firstChoice = 3;
			secondChoice = 3;
		}
		else if (getProperty("peteMotorbikeSeat") === "")
		{
			firstChoice = 6;
			secondChoice = 1;
			runChoice(6);
		}

		if (firstChoice === -1)
		{
			break;
		}

		page = visitUrl(`choice.php?pwd=&whichchoice=859&option=${firstChoice}`);

		if (lastChoice() === 859)
		{
			abort("Mafia is not handling this correctly, sorry");
		}
		page = visitUrl(`choice.php?pwd=&whichchoice=${lastChoice()}&option=${secondChoice}`);

		page = visitUrl("main.php?action=motorcycle");
		my_cyclePoints = new AshMatcher("Upping Your Grade", page);
	}

	setProperty("auto_peteSkills", myLevel().toString());
}

export function pete_peelOutRemaining(): number
{
	if (getProperty("peteMotorbikeTires") === "Racing Slicks")
	{
		return 30 - toInt(getProperty("_petePeeledOut"));
	}

	return 10 - toInt(getProperty("_petePeeledOut"));
}

export function LM_pete(): boolean
{
	if (!is_pete())
	{
		return false;
	}

	pete_buySkills();

	return false;
}
