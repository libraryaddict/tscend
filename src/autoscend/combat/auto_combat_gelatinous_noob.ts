import { Monster, Skill } from "kolmafia";
import { canUse$1, haveUsed, useSkill$1 } from "./auto_combat_util";
import { in_gnoob } from "../paths/gelatinous_noob";

//defined in /autoscend/combat/auto_combat_gelatinous_noob.ash
export function auto_combatGelatinousNoobStage5(round_1: number, enemy: Monster, text: string): string
{
	// stage 5 = kill
	if (!in_gnoob())
	{
		return "";
	}
	//3x elemental damage bonuses attack against duplicated [goat]. duplicated means double stats and double drops
	if (canUse$1(Skill.get("Gelatinous Kick"), false) && haveUsed(Skill.get("Duplicate")))
	{
		if (Monster.get(["dairy goat"]).includes(enemy))
		{
			return useSkill$1(Skill.get("Gelatinous Kick"), false);
		}
	}

	return "";
}
