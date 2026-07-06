import { abort, Class, Element, haveEquipped, haveSkill, Item, Monster, mpCost, myClass, Skill } from "kolmafia";
import { currentFlavour } from "../auto_util";
import { canUse$1, canUse$2, useSkill$1, useSkill$2 } from "./auto_combat_util";
import { in_wildfire } from "../paths/wildfire";

//Path specific combat handling for wildfire

//defined in /autoscend/combat/auto_combat_wildfire.ash
export function auto_combatWildfireStage1(round_1: number, enemy: Monster, text: string): string
{
	// stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
	if (!in_wildfire())
	{
		return "";
	}
	//always 5 fire bosses. can not be reduced.
	if (Monster.get(["Groar, Except Hot", "The Man on Fire", "The Big Ignatowicz"]).includes(enemy))
	{
		if (haveEquipped(Item.get("industrial fire extinguisher")) && canUse$2(Skill.get("Curse of Weaksauce")) && haveSkill(Skill.get("Itchy Curse Finger")) && myClass() === Class.get("Sauceror"))
		{
			//weaksauce will recover 50 MP. Only use it if you have industrial fire extinguisher equipped to prevent passive damage
			return useSkill$2(Skill.get("Curse of Weaksauce"));
		}
		if (canUse$2(Skill.get("Stuffed Mortar Shell")))
		{ //very cheap for massive damage. tuneable too for extra dmg.
			return useSkill$2(Skill.get("Stuffed Mortar Shell"));
		}
		if (Element.get(["sleaze", "stench"]).includes(currentFlavour()) && canUse$2(Skill.get("Weapon of the Pastalord")))
		{ //extra dmg dealt
			return useSkill$1(Skill.get("Weapon of the Pastalord"), false);
		}
		if (canUse$1(Skill.get("Saucegeyser"), false))
		{
			return useSkill$1(Skill.get("Saucegeyser"), false);
		}
		abort(`We do not know what to do next against [${enemy}].`);
	}
	//always 5 fire. can not be reduced. Does not become hot aligned so there is no elemental dmg boost.
	if (Monster.get("wall of meat") === enemy)
	{
		if (canUse$2(Skill.get("Stuffed Mortar Shell")))
		{
			return useSkill$2(Skill.get("Stuffed Mortar Shell"));
		}
		if (canUse$2(Skill.get("Weapon of the Pastalord")) && mpCost(Skill.get("Weapon of the Pastalord")) < mpCost(Skill.get("Saucegeyser")))
		{
			return useSkill$1(Skill.get("Weapon of the Pastalord"), false); //pastamancers can make it cheaper than saucegeyser
		}
		if (canUse$1(Skill.get("Saucegeyser"), false))
		{
			return useSkill$1(Skill.get("Saucegeyser"), false);
		}
		abort(`We do not know what to do next against [${enemy}].`);
	}

	return "";
}
