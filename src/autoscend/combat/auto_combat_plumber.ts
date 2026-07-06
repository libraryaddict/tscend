import { Class, equippedAmount, Item, Location, Monster, myClass, myLocation, myPp, Skill } from "kolmafia";
import { canUse$1, useSkill$1, useSkill$2 } from "./auto_combat_util";

//Path specific combat handling for path of the plumber

//defined in /autoscend/combat/auto_combat_plumber.ash
export function auto_combatPlumberStage5(round_1: number, enemy: Monster, text: string): string
{
	//stage 5 killing the enemy. plumber specific

	if (myClass() !== Class.get("Plumber"))
	{
		return "";
	}
	// note: Juggle Fireballs CAN be used multiple times, but it is only
	// useful if you have level 3 fire and therefore get healed

	if (myPp() > 2 && canUse$1(Skill.get("[7332]Juggle Fireballs"), true))
	{
		return useSkill$2(Skill.get("[7332]Juggle Fireballs"));
	}

	if (enemy.physicalResistance >= 80 || myLocation() === Location.get("The Smut Orc Logging Camp") && 0 < equippedAmount(Item.get("frosty button")))
	{
		if (canUse$1(Skill.get("[7333]Fireball Barrage"), false))
		{
			return useSkill$2(Skill.get("[7333]Fireball Barrage"));
		}
		//this skill comes from the IOTM Beach Comb
		if (canUse$1(Skill.get("Beach Combo"), true))
		{
			return useSkill$2(Skill.get("Beach Combo"));
		}
		if (canUse$1(Skill.get("Fireball Toss"), false))
		{
			return useSkill$1(Skill.get("Fireball Toss"), false);
		}
	}

	if (canUse$1(Skill.get("[7336]Multi-Bounce"), false))
	{
		return useSkill$2(Skill.get("[7336]Multi-Bounce"));
	}
	//this skill comes from the IOTM Beach Comb
	if (canUse$1(Skill.get("Beach Combo"), true))
	{
		return useSkill$2(Skill.get("Beach Combo"));
	}
	if (canUse$1(Skill.get("Jump Attack"), false))
	{
		return useSkill$1(Skill.get("Jump Attack"), false);
	}
	// Fallback, since maybe we only have fire flower equipped.
	if (canUse$1(Skill.get("[7333]Fireball Barrage"), false))
	{
		 {
			return useSkill$2(Skill.get("[7333]Fireball Barrage"));
		}
	return useSkill$1(Skill.get("Fireball Toss"), false);
	}

	return "";
}
