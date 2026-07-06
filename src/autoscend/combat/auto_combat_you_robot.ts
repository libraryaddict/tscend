import { Element, Item, Monster, Skill, Slot, Stat, abort, equippedItem, monsterElement, monsterHp, myBuffedstat } from "kolmafia";
import { canSurvive$1, canUse$1, turns_to_kill, useSkill$1 } from "./auto_combat_util";
import { in_robot } from "../paths/you_robot";

//defined in /autoscend/combat/auto_combat_you_robot.ash
export function auto_combat_robot_stage5(round_1: number, enemy: Monster, text: string): string
{
	// stage 5 = kill
	if (!in_robot())
	{
		return "";
	}

	const enemy_physical_immune: boolean = enemy.physicalResistance > 99;
	const enemy_hot_immune: boolean = monsterElement(enemy) === Element.get("hot") || enemy === Monster.get("Protector S. P. E. C. T. R. E.");
	const enemy_physical_res: number = 1 - enemy.physicalResistance * 0.01; //convert % into float
	let dmg: number = 0;
	//scrap using attacks. reserved for beefier monsters with at least 40 HP
	if (canUse$1(Skill.get("Snipe"), false) && !enemy_physical_immune)
	{
		//Spend 1 Scrap to deal 100% of your Mysticality in damage
		const better_than_crotch_burn: boolean = monsterHp() > 40 || enemy_hot_immune;
		dmg = myBuffedstat(Stat.get("Mysticality")) * enemy_physical_res;
		if (canSurvive$1(turns_to_kill(dmg)) && better_than_crotch_burn)
		{
			return useSkill$1(Skill.get("Snipe"), false);
		}
	}
	//blow snow is an energy using attack. normally we do not want to use it. But it is important in the blech house
	if (canUse$1(Skill.get("Blow Snow"), false) && Monster.get(["smut orc jacker", "smut orc nailer", "smut orc pipelayer", "smut orc screwer"]).includes(enemy))
	{
		if (canSurvive$1(turns_to_kill(myBuffedstat(Stat.get("Muscle")))))
		{
			return useSkill$1(Skill.get("Blow Snow"), false);
		}
	}
	//basic attacks as a robot which are free.
	if (canUse$1(Skill.get("Swing Pound-O-Tron"), false) && !enemy_physical_immune)
	{
		//20 + 0.1*mus damage
		dmg = (20 + 0.1 * myBuffedstat(Stat.get("Muscle"))) * enemy_physical_res;
		if (canSurvive$1(turns_to_kill(dmg)))
		{
			return useSkill$1(Skill.get("Swing Pound-O-Tron"), false);
		}
	}
	if (canUse$1(Skill.get("Crotch Burn"), false) && !enemy_hot_immune)
	{
		//20 + 0.1*mys fire damage
		dmg = 20 + 0.1 * myBuffedstat(Stat.get("Mysticality"));
		if (canSurvive$1(turns_to_kill(dmg)))
		{
			return useSkill$1(Skill.get("Crotch Burn"), false);
		}
	}
	if (canUse$1(Skill.get("Shoot Pea"), false) && !enemy_physical_immune)
	{
		//20 + 0.1*mox damage
		dmg = (20 + 0.1 * myBuffedstat(Stat.get("Moxie"))) * enemy_physical_res;
		if (canSurvive$1(turns_to_kill(dmg)))
		{
			return useSkill$1(Skill.get("Shoot Pea"), false);
		}
	}

	if (equippedItem(Slot.get("weapon")) === Item.none)
	{
		abort("Robot does not know how to fight this enemy. Beep Boop.");
	}
	return "";
}