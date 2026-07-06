import { abort, getProperty, Item, itemAmount, Monster, monsterLevelAdjustment, myMp, myThunder, setProperty, Skill, toInt } from "kolmafia";
import { auto_have_skill } from "../auto_util";
import { canUse$1, canUse$2, useSkill$1, useSkill$2 } from "./auto_combat_util";

//Path specific combat handling for Heavy Rains

//defined in /autoscend/combat/auto_combat_heavy_rains.ash
export function auto_combatHeavyRainsStage1(round_1: number, enemy: Monster, text: string): string
{
	// stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
	// Unique Heavy Rains Enemy that Reflects Spells.
	if (enemy.toString() === "Gurgle")
	{
		if (canUse$2(Skill.get("Summon Love Stinkbug")))
		{
			return useSkill$2(Skill.get("Summon Love Stinkbug"));
		}
		return "attack with weapon";
	}
	// Unique Heavy Rains Enemy that reduces Spells damage to 1 and caps non spell damage at 39 per source and type
	// Has low enough HP it can be defeated in 10 combat turns using simple melee attacks that deal only physical damage
	if (enemy.toString() === "Dr. Aquard")
	{
		if (canUse$2(Skill.get("Curse of Weaksauce")))
		{
			return useSkill$2(Skill.get("Curse of Weaksauce"));
		}
		if (canUse$2(Skill.get("Micrometeorite")))
		{
			return useSkill$2(Skill.get("Micrometeorite"));
		}
		if (canUse$2(Skill.get("Summon Love Stinkbug")))
		{
			return useSkill$2(Skill.get("Summon Love Stinkbug"));
		}
		return "attack with weapon";
	}

	return "";
}

export function auto_combatHeavyRainsStage3(round_1: number, enemy: Monster, text: string): string
{
	// stage 3 = debuff: delevel, stun, curse, damage over time
	//Heavy Rain bosses delevel & stun. we only do this to the tougher bosses
	if (Monster.get(["Big Wisnaqua", "The Aquaman", "The Rain King"]).includes(enemy))
	{
		//During round 1 against late bosses set how many [Thunder Bird] we plan to cast during this combat
		if (round_1 === 1 && toInt(getProperty("auto_combatHandlerThunderBird")) === 0)
		{
			let targetThunderBird: number = 3;
			if (monsterLevelAdjustment() > 80)
			{
				targetThunderBird++;
			}
			if (monsterLevelAdjustment() > 110)
			{
				targetThunderBird++;
			}
			if (monsterLevelAdjustment() > 150)
			{
				targetThunderBird++;
			}
			setProperty("auto_combatHandlerThunderBird", targetThunderBird.toString());
		}
		//These bosses are actually stunable. unless their ML is over 150
		if (monsterLevelAdjustment() > 150)
		{ //not stunable
			//30% delevel each crayon shavings, making each 1 superior to 2 casts of [Thunder Bird]
			if (itemAmount(Item.get("crayon shavings")) > 1 && auto_have_skill(Skill.get("Ambidextrous Funkslinging")))
			{
				setProperty("auto_combatHandlerThunderBird", (toInt(getProperty("auto_combatHandlerThunderBird")) - 4).toString());
				return `item ${Item.get("crayon shavings")}, ${Item.get("crayon shavings")}`;
			}
			if (itemAmount(Item.get("crayon shavings")) > 0)
			{
				setProperty("auto_combatHandlerThunderBird", (toInt(getProperty("auto_combatHandlerThunderBird")) - 2).toString());
				return `item ${Item.get("crayon shavings")}`;
			}
		}
		else {
		//stunable
			if (canUse$2(Skill.get("Micrometeorite")))
			{
				//stun and delevel 10% (or theoretically up to 25% if it was not used constantly)
				setProperty("auto_combatHandlerThunderBird", (toInt(getProperty("auto_combatHandlerThunderBird")) - 1).toString());
				return useSkill$2(Skill.get("Micrometeorite"));
			}
			if (canUse$2(Skill.get("Curse of Weaksauce")) && myMp() >= 50 && auto_have_skill(Skill.get("Itchy Curse Finger")))
			{
				//every round delevel 3% of original attack value
				return useSkill$2(Skill.get("Curse of Weaksauce"));
			}
			if (canUse$2(Skill.get("Thunderstrike")) && myThunder() >= 5)
			{
				//Once per combat multiround stun ability that does not delevel
				return useSkill$2(Skill.get("Thunderstrike"));
			}
			if (canUse$2(Skill.get("Curse of Weaksauce")) && myMp() >= 50)
			{
				//rely on thunderstrike stun if you do not have [Itchy Curse Finger]
				return useSkill$2(Skill.get("Curse of Weaksauce"));
			}
		}
		//once done with stunnning, use [Thunder Bird] which delevels but does not stun.
		if (myThunder() === 0 && toInt(getProperty("auto_combatHandlerThunderBird")) > 0)
		{
			setProperty("auto_combatHandlerThunderBird", (0).toString());
		}
		if (toInt(getProperty("auto_combatHandlerThunderBird")) > 0 && canUse$1(Skill.get("Thunder Bird"), false))
		{
			setProperty("auto_combatHandlerThunderBird", (toInt(getProperty("auto_combatHandlerThunderBird")) - 1).toString());
			return useSkill$1(Skill.get("Thunder Bird"), false);
		}
	}

	return "";
}

export function auto_combatHeavyRainsStage5(round_1: number, enemy: Monster, text: string): string
{
	// stage 5 = kill
	// Heavy Rains Final Boss. strips you of positive effects every time it hits you. Capped at 40 damage per source per element.
	if (enemy.toString() === "The Rain King")
	{
		if (getProperty("auto_rain_king_combat") === "attack")
		{
			if (canUse$1(Skill.get("Lunging Thrust-Smack"), false))
			{
				return useSkill$1(Skill.get("Lunging Thrust-Smack"), false);
			}
			if (canUse$1(Skill.get("Thrust-Smack"), false))
			{
				return useSkill$1(Skill.get("Thrust-Smack"), false);
			}
			if (canUse$1(Skill.get("Lunge Smack"), false))
			{
				return useSkill$1(Skill.get("Lunge Smack"), false);
			}
			return "attack with weapon";
		}
		if (getProperty("auto_rain_king_combat") === "saucestorm" && canUse$1(Skill.get("Saucestorm"), false))
		{
			return useSkill$1(Skill.get("Saucestorm"), false);
		}
		if (getProperty("auto_rain_king_combat") === "weapon_of_the_pastalord" && canUse$1(Skill.get("Weapon of the Pastalord"), false))
		{
			return useSkill$1(Skill.get("Weapon of the Pastalord"), false);
		}
		if (getProperty("auto_rain_king_combat") === "turtleini" && canUse$1(Skill.get("Turtleini"), false))
		{
			return useSkill$1(Skill.get("Turtleini"), false);
		}
		abort("I am not sure how to finish this battle");
	}
	//[Storm Cow] drops [lightning milk] which gives a heavy rains lightning skill
	if (enemy === Monster.get("storm cow") && auto_have_skill(Skill.get("Unleash the Greash")))
	{
		return useSkill$1(Skill.get("Unleash the Greash"), false);
	}

	return "";
}
