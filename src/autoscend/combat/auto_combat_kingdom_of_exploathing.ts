import { buffedHitStat, Element, haveEquipped, Item, min, Monster, monsterLevelAdjustment, myDaycount, numericModifier, Skill, toInt } from "kolmafia";
import { canUse$1, canUse$3, useItem$1, useSkill$1 } from "./auto_combat_util";

//Path specific combat handling for Kingdom of Exploathing

//defined in /autoscend/combat/auto_combat_kingdom_of_exploathing.ash
export function auto_combatExploathingStage1(round_1: number, enemy: Monster, text: string): string
{
	//#stage1 = 1st round actions: puzzle boss, banish, escape, pickpocket, etc. things that need to be done before debuff

	if (enemy === Monster.get("the invader") && canUse$1(Skill.get("Lunging Thrust-Smack"), false) && haveEquipped(Item.get("June cleaver")))
	{
		return useSkill$1(Skill.get("Lunging Thrust-Smack"), false);
	}

	if (enemy === Monster.get("the invader") && canUse$1(Skill.get("Weapon of the Pastalord"), false))
	{
		return useSkill$1(Skill.get("Weapon of the Pastalord"), false);
	}

	if (enemy === Monster.get("skeleton astronaut"))
	{
		if (myDaycount() === 1 && canUse$3(Item.get("exploding cigar"), false))
		{
			return useItem$1(Item.get("exploding cigar"));
		}
		let dmg: number = 0;
		for (const el of Element.get(["hot", "cold", "sleaze", "spooky", "stench"]))
		{
			dmg += toInt(min(10, numericModifier(`${el.toString()} Damage`)));
		}
		// 10 physical + 10 prismatic is enough to be better than Saucestorm.
		// Otherwise, saucestorm deals 20 damage/round.
		if (dmg >= 10 && buffedHitStat() >= 120 + monsterLevelAdjustment())
		{
			return "attack with weapon";
		}
		else if (canUse$1(Skill.get("Saucestorm"), false))
		{
			return useSkill$1(Skill.get("Saucestorm"), false);
		}
	}

	return "";
}
