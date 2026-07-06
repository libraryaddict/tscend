import { Effect, Location, Monster, Skill, getProperty, haveEffect, mpCost, myHp, myLocation, myMaxhp, myMp, setProperty, toBoolean, toInt } from "kolmafia";
import { auto_have_skill } from "../auto_util";
import { canUse$1, canUse$2, useSkill$1, useSkill$2 } from "./auto_combat_util";

//Path specific combat handling for The Source

//defined in /autoscend/combat/auto_combat_the_source.ash
export function auto_combatTheSourceStage1(round_1: number, enemy: Monster, text: string): string
{
	//#stage1 = 1st round actions: puzzle boss, banish, escape, pickpocket, etc. things that need to be done before debuff

	if (Monster.get(["One Thousand Source Agents", "Source Agent"]).includes(enemy))
	{
		if (auto_have_skill(Skill.get("Data Siphon")))
		{
			if (myMp() < 50)
			{
				if (auto_have_skill(Skill.get("Source Punch")) && myMp() >= mpCost(Skill.get("Source Punch")))
				{
					return useSkill$1(Skill.get("Source Punch"), false);
				}
			}
			else if (myMp() > 125)
			{
				if (canUse$2(Skill.get("Reboot")) && (haveEffect(Effect.get("Latency")) > 0 || myHp() * 2 < myMaxhp()))
				{
					return useSkill$2(Skill.get("Reboot"));
				}
				if (canUse$2(Skill.get("Humiliating Hack")))
				{
					return useSkill$2(Skill.get("Humiliating Hack"));
				}
				if (canUse$2(Skill.get("Disarmament")))
				{
					return useSkill$2(Skill.get("Disarmament"));
				}
				if (canUse$2(Skill.get("Big Guns")) && myHp() < 100)
				{
					return useSkill$2(Skill.get("Big Guns"));
				}

			}
			else if (myMp() > 100)
			{
				if (canUse$2(Skill.get("Humiliating Hack")))
				{
					return useSkill$2(Skill.get("Humiliating Hack"));
				}
				if (canUse$2(Skill.get("Disarmament")))
				{
					return useSkill$2(Skill.get("Disarmament"));
				}
			}

			if (canUse$1(Skill.get("Source Kick"), false))
			{
				return useSkill$1(Skill.get("Source Kick"), false);
			}
		}

		if (canUse$2(Skill.get("Big Guns")))
		{
			return useSkill$2(Skill.get("Big Guns"));
		}
		if (canUse$1(Skill.get("Source Punch"), false))
		{
			return useSkill$1(Skill.get("Source Punch"), false);
		}
		return "runaway";
	}

	return "";
}

export function auto_combatTheSourceStage4(round_1: number, enemy: Monster, text: string): string
{
	// stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
	//source terminal iotm source path specific action. provokes an agent into attacking you next turn 3/day
	//is turn referring to combat round or next adv? this is placed in stage 4 on the assumption it means next adv. if it means next combat round then it should be moved to stage 2
	if (canUse$2(Skill.get("Portscan")) && myLocation().turnsSpent < 8 && toInt(getProperty("_sourceTerminalPortscanUses")) < 3 && !toBoolean(getProperty("_portscanPending")))
	{
		if (Location.get(["The Castle in the Clouds in the Sky (Ground Floor)", "The Haunted Bathroom", "The Haunted Gallery"]).includes(myLocation()))
		{
			setProperty("_portscanPending", true.toString());
			return useSkill$2(Skill.get("Portscan"));
		}
	}

	return "";
}