import { Class, cliExecute, Effect, getProperty, haveEffect, haveSkill, Item, itemAmount, Location, myClass, myLevel, myLocation, myPath, Path, setProperty, Skill, toInt, use, visitUrl } from "kolmafia";
import { auto_log_info$1, autoCraft } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_west_of_loathing.ash
export function in_awol(): boolean
{
	return myPath() === Path.get("Avatar of West of Loathing");
}

export function awol_initializeSettings(): boolean
{
	if (in_awol())
	{
		setProperty("auto_awolLastSkill", (0).toString());
		setProperty("auto_getBeehive", true.toString());
	}
	return false;
}

export function awol_useStuff(): void
{
	if (!in_awol())
	{
		return;
	}

	if (haveSkill(Skill.get("Patent Medicine")))
	{
		if (itemAmount(Item.get("patent invisibility tonic")) < 3)
		{
			if (itemAmount(Item.get("eldritch oil")) > 0 && itemAmount(Item.get("snake oil")) > 0)
			{
				autoCraft("cook", 1, Item.get("eldritch oil"), Item.get("snake oil"));
			}
		}
		if (itemAmount(Item.get("patent avarice tonic")) === 0)
		{
			if (itemAmount(Item.get("unusual oil")) > 0 && itemAmount(Item.get("skin oil")) > 0)
			{
				autoCraft("cook", 1, Item.get("unusual oil"), Item.get("skin oil"));
			}
		}
		if (itemAmount(Item.get("patent aggression tonic")) === 0)
		{
			if (itemAmount(Item.get("unusual oil")) > 0 && itemAmount(Item.get("snake oil")) > 0)
			{
				autoCraft("cook", 1, Item.get("unusual oil"), Item.get("snake oil"));
			}
		}
		if (itemAmount(Item.get("patent preventative tonic")) === 0)
		{
			if (itemAmount(Item.get("skin oil")) > 0 && itemAmount(Item.get("snake oil")) > 0)
			{
				autoCraft("cook", 1, Item.get("skin oil"), Item.get("snake oil"));
			}
		}
	}

	if (itemAmount(Item.get("snake oil")) > 0 && toInt(getProperty("awolMedicine")) < 30 && toInt(getProperty("awolVenom")) < 30)
	{
		use(1, Item.get("snake oil"));
	}

	if (myClass() === Class.get("Cow Puncher") && haveEffect(Effect.get("Cowrruption")) < 20)
	{
		if (itemAmount(Item.get("corrupted marrow")) > 0)
		{
			use(1, Item.get("corrupted marrow"));
		}
	}
}

export function awol_walkBuff(): Effect
{
	//We have none Walk Buffs
	if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && !haveSkill(Skill.get("Walk: Prideful Strut")) && !haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		return Effect.none;
	}
	//If we only have one skill, might as well use that one
	if (haveSkill(Skill.get("Walk: Leisurely Amble")) && !haveSkill(Skill.get("Walk: Prideful Strut")) && !haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		return Effect.get("Leisurely Amblin'");
	}
	if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && haveSkill(Skill.get("Walk: Prideful Strut")) && !haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		return Effect.get("Prideful Strut");
	}
	if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && !haveSkill(Skill.get("Walk: Prideful Strut")) && haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		return Effect.get("Cautious Prowl");
	}

	if (haveSkill(Skill.get("Walk: Leisurely Amble")) && haveSkill(Skill.get("Walk: Prideful Strut")) && !haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		if (Location.get(["The Boss Bat's Lair", "The Hidden Temple", "The Themthar Hills"]).includes(myLocation()))
		{
			return Effect.get("Leisurely Amblin'");
		}
		if (myLevel() < 13)
		{
			return Effect.get("Prideful Strut");
		}
		return Effect.get("Leisurely Amblin'");
	}

	if (haveSkill(Skill.get("Walk: Leisurely Amble")) && !haveSkill(Skill.get("Walk: Prideful Strut")) && haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		if (Location.get(["The Boss Bat's Lair", "The Hidden Temple", "The Themthar Hills"]).includes(myLocation()))
		{
			return Effect.get("Leisurely Amblin'");
		}
		return Effect.get("Cautious Prowl");
	}

	if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && haveSkill(Skill.get("Walk: Prideful Strut")) && haveSkill(Skill.get("Walk: Cautious Prowl")))
	{
		if (myLevel() <= 6)
		{
			return Effect.get("Prideful Strut");
		}
		return Effect.get("Cautious Prowl");
	}
	//We have all three skills

	if (Location.get(["The Boss Bat's Lair", "The Hidden Temple", "The Themthar Hills"]).includes(myLocation()))
	{
		return Effect.get("Leisurely Amblin'");
	}
	if (myLevel() <= 6)
	{
		return Effect.get("Prideful Strut");
	}
	return Effect.get("Cautious Prowl");
}

export function awol_buySkills(): boolean
{
	if (!in_awol())
	{
		return false;
	}

	if (toInt(getProperty("auto_awolLastSkill")) === 0)
	{
		//Catch that Mafia does not see our second/third skillbook at ascension start
		cliExecute("refresh inv");
	}

	if (toInt(getProperty("auto_awolLastSkill")) < myLevel())
	{
		setProperty("auto_awolLastSkill", myLevel().toString());
	}
	else {
		return false;
	}

	if (itemAmount(Item.get("Tales of the West: Cow Punching")) > 0)
	{
		let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8955");
		//The rest of the book is too filled<br>with jargon for you to be able<br>to understand it.
		const slang: AshMatcher = new AshMatcher("The rest of the book is too filled", page);
		const cowSlang: boolean = !slang.find();

		const my_skillPoints: AshMatcher = new AshMatcher("You can learn (\\d+) more skill", page);
		if (my_skillPoints.find())
		{
			let skillPoints: number = toInt(my_skillPoints.group(1));
			auto_log_info$1(`Cow points found: ${skillPoints}`);
			while (skillPoints > 0)
			{
				if (myClass() === Class.get("Cow Puncher"))
				{
					if (!haveSkill(Skill.get("Rugged Survivalist")))
					{ //restore some HP/MP after combat
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Larger Than Life")))
					{ //+100% maxHP/maxMP
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Cowcall")))
					{ //10MP deal spooky damage
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=1", true);
					}
					else if (!haveSkill(Skill.get("[18008]Hard Drinker")) && cowSlang)
					{ //+5 max liver
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("One-Two Punch")))
					{ //3MP two unarmed attacks
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Pistolwhip")))
					{ //3MP damage and stun enemy 1/fight
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Walk: Cautious Prowl")) && cowSlang)
					{ //40MP/20adv +50% item drop
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Hogtie")))
					{ //10MP stun for several rounds
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("True Outdoorsperson")))
					{ //+3 all res
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Unleash Cowrruption")) && cowSlang)
					{ //yellow ray
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=7", true);
					}
				}
				else {
					if (!haveSkill(Skill.get("[18008]Hard Drinker")) && cowSlang)
					{ //+5 max liver
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("Rugged Survivalist")))
					{ //restore some HP/MP after combat
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Walk: Cautious Prowl")) && cowSlang)
					{ //40MP/20adv +50% item drop
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Larger Than Life")))
					{ //+100% maxHP/maxMP
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Cowcall")))
					{ //10MP deal spooky damage
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=1", true);
					}
					else if (!haveSkill(Skill.get("One-Two Punch")))
					{ //3MP two unarmed attacks
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Pistolwhip")))
					{ //3MP damage and stun enemy 1/fight
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Hogtie")))
					{ //10MP stun for several rounds
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("True Outdoorsperson")))
					{ //+3 all res
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Unleash Cowrruption")) && cowSlang)
					{ //yellow ray
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1177&whichskill=7", true);
					}
				}
				skillPoints -= 1;
			}
		}
	}
	if (itemAmount(Item.get("Tales of the West: Beanslinging")) > 0)
	{
		let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8956");

		const slang: AshMatcher = new AshMatcher("The rest of the book is too filled", page);
		const beanSlang: boolean = !slang.find();

		const my_skillPoints: AshMatcher = new AshMatcher("You can learn (\\d+) more skill", page);
		if (my_skillPoints.find())
		{
			let skillPoints: number = toInt(my_skillPoints.group(1));
			auto_log_info$1(`Bean points found: ${skillPoints}`);
			while (skillPoints > 0)
			{
				if (myClass() === Class.get("Beanslinger"))
				{
					if (!haveSkill(Skill.get("Lavafava")))
					{ //3MP deal minor hot dmg twice
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Walk: Prideful Strut")) && beanSlang)
					{ //40MP/20adv +10 stats per fight
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Bean Runner")))
					{ //+75% init
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Canhandle")))
					{ //0MP shake offhand beans for heal or dmg and stagger
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Prodigious Appetite")) && beanSlang)
					{ //+5 max stomach
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("Beanstorm")))
					{ //15MP AoE 2 hits high dmg.
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Beanscreen")))
					{ //10MP block 3 next attacks
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("Beancannon")) && beanSlang)
					{ //banish
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=7", true);
					}
					else if (!haveSkill(Skill.get("Beanweaver")))
					{ //2x bean enchantment, +2adv +substats bean plates
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Pungent Mung")))
					{ //5MP moderate stench dmg
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=1", true);
					}
				}
				else {
					if (!haveSkill(Skill.get("Prodigious Appetite")) && beanSlang)
					{ //+5 max stomach
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("Walk: Prideful Strut")) && beanSlang)
					{ //40MP/20adv +10 stats per fight
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Bean Runner")))
					{ //+75% init
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Beanscreen")))
					{ //10MP block 3 next attacks
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("Canhandle")))
					{ //0MP shake offhand beans for heal or dmg and stagger
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Lavafava")))
					{ //3MP deal minor hot dmg twice
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Beanstorm")))
					{ //15MP AoE 2 hits high dmg.
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Beancannon")) && beanSlang)
					{ //banish
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=7", true);
					}
					else if (!haveSkill(Skill.get("Beanweaver")))
					{ //2x bean enchantment, +2adv +substats bean plates
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Pungent Mung")))
					{ //5MP moderate stench dmg
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1178&whichskill=1", true);
					}
				}
				skillPoints -= 1;
			}
		}
	}
	if (itemAmount(Item.get("Tales of the West: Snake Oiling")) > 0)
	{
		let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8957");

		const slang: AshMatcher = new AshMatcher("The rest of the book is too filled", page);
		const snakeSlang: boolean = !slang.find();

		const my_skillPoints: AshMatcher = new AshMatcher("You can learn (\\d+) more skill", page);
		if (my_skillPoints.find())
		{
			let skillPoints: number = toInt(my_skillPoints.group(1));
			auto_log_info$1(`Snake points found: ${skillPoints}`);
			while (skillPoints > 0)
			{
				if (myClass() === Class.get("Snake Oiler"))
				{
					if (!haveSkill(Skill.get("Good Medicine")))
					{ //5MP heal and stagger
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Bad Medicine")))
					{ //5MP big debuff
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("Extract Oil")))
					{ //10MP extract oil. 15/day max
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Tolerant Constitution")) && snakeSlang)
					{ //+5 spleen
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("Snakewhip")))
					{ //3MP physical dmg + poison
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Patent Medicine")))
					{ //craft oils and tonics.
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Long Con")) && snakeSlang)
					{ //sniff monster 5/day
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=7", true);
					}
					else if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && snakeSlang)
					{ //40MP/20adv +100% meat drop
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Well-Oiled Guns")))
					{ //all sixgun skills more effective
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Fan Hammer")))
					{ //3 attacks with gun
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=1", true);
					}
				}
				else {
					if (!haveSkill(Skill.get("Tolerant Constitution")) && snakeSlang)
					{ //+5 spleen
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=8", true);
					}
					else if (!haveSkill(Skill.get("Long Con")) && snakeSlang)
					{ //sniff monster 5/day
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=7", true);
					}
					else if (!haveSkill(Skill.get("Good Medicine")))
					{ //5MP heal and stagger
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=6", true);
					}
					else if (!haveSkill(Skill.get("Snakewhip")))
					{ //3MP physical dmg + poison
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=0", true);
					}
					else if (!haveSkill(Skill.get("Bad Medicine")))
					{ //5MP big debuff
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=3", true);
					}
					else if (!haveSkill(Skill.get("Extract Oil")))
					{ //10MP extract oil. 15/day max
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=2", true);
					}
					else if (!haveSkill(Skill.get("Patent Medicine")))
					{ //craft oils and tonics.
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=4", true);
					}
					else if (!haveSkill(Skill.get("Walk: Leisurely Amble")) && snakeSlang)
					{ //40MP/20adv +100% meat drop
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=9", true);
					}
					else if (!haveSkill(Skill.get("Well-Oiled Guns")))
					{ //all sixgun skills more effective
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=5", true);
					}
					else if (!haveSkill(Skill.get("Fan Hammer")))
					{ //3 attacks with gun
						page = visitUrl("choice.php?pwd=&option=1&whichchoice=1179&whichskill=1", true);
					}
				}
				skillPoints -= 1;
			}
		}
	}

	return false;
}
