import { combatSkillAvailable, Element, getProperty, haveEquipped, Item, Monster, monsterHp, myBuffedstat, myHp, myMaxhp, Skill, Stat, toInt } from "kolmafia";
import { auto_have_skill } from "../auto_util";
import { canSurvive$1, canUse, canUse$1, useSkill$1, useSkill$2 } from "./auto_combat_util";
import { dartSkill } from "../iotms/mr2024";
import { in_amw } from "../paths/adventurer_meats_world";

//defined in /autoscend/combat/auto_combat_adventurer_meats_world.ash
export function amw_wanttoPP(enemy: Monster): boolean
{
	if (!in_amw() || !auto_have_skill(Skill.get("Chicken Fingers")))
	{
		return false;
	}
	// cannot autosell for meat so pickpocketing is less profitable,
	// so higher survive requirement than default. maybe exempt certain monsters from higher req?
	if (!canSurvive$1(8.0))
	{
		return false;
	}
	return true;
}

export function auto_combatMeatGolemStage3(round_1: number, enemy: Monster, text: string): string
{
	if (!in_amw()) {
		return "";
	}
	// this delevel also might deal lots of damage
	// Skip if monster would die quickly, before stage 4 might finish
	if ((monsterHp() - myBuffedstat(Stat.get("Muscle"))) / monsterHp() < 0.55) { return ""; }
	// since meat = adv, don't want to delevel if not necessary
	// also skipping if we might die after delevel, because we may be able to stun instead
	if (canUse(Skill.get("Meat Cleaver"), true, true) && ((!canSurvive$1(8.0) || monsterHp() >= 500) && canSurvive$1(0.7) || enemy === Monster.get("The Manwich") || enemy === Monster.get("The Big Mac Wisniewski") || enemy === Monster.get("Naughty Sorceress, all sausage")))
	{
		// hardcoded bosses to trigger
		return useSkill$2(Skill.get("Meat Cleaver"));
	}

	return "";
}

export function auto_combatMeatGolemStage5(round_1: number, enemy: Monster, text: string): string
{
	if (!in_amw())
	{
		return "";
	}
	// make sure to heal if possible and necessary
	if ((!canSurvive$1(1.4) || myHp() < 0.5 * myMaxhp()) && canUse$1(Skill.get("Chew the Fat"), false) && myHp() < myMaxhp() * 0.95) {
		return useSkill$1(Skill.get("Chew the Fat"), false);
	}
	// make sure high HP combats conclude in a timely fashion
	// only if needed; these skills cost 4-10x more than a regular combat skill
	if (canUse$1(Skill.get("Steak Through the Heart"), true) && combatSkillAvailable(Skill.get("Steak Through the Heart")) && round_1 > 12)
	{
		return useSkill$1(Skill.get("Steak Through the Heart"), true);
	}
	if (canUse$1(Skill.get("Wet Rub"), true) && (monsterHp() >= 400 || enemy === Monster.get("The Manwich") || enemy === Monster.get("The Big Mac Wisniewski") || enemy === Monster.get("Naughty Sorceress, all sausage")))
	{
		return useSkill$1(Skill.get("Wet Rub"), true);
	}
	if (canUse(Skill.get("Meat Cleaver"), true, true) && (monsterHp() >= 400 || enemy === Monster.get("The Manwich") || enemy === Monster.get("The Big Mac Wisniewski") || enemy === Monster.get("Naughty Sorceress, all sausage")))
	{
		return useSkill$1(Skill.get("Meat Cleaver"), true);
	}
	// Darts always welcome
	if (haveEquipped(Item.get("Everfull Dart Holster")) && toInt(getProperty("_dartsLeft")) > 0)
	{
		return useSkill$2(dartSkill());
	}
	// Step 1: get base values for each spell
	let beef_shank_value: number = myBuffedstat(Stat.get("Muscle"));
	let spicy_meatball_value: number = myBuffedstat(Stat.get("Mysticality"));
	let bacon_ray_value: number = toInt(0.55 * myBuffedstat(Stat.get("Moxie"))); // deals base dmg equal to half moxie, but it's a little cheaper
	// Step 2: apply disqualifications
	// the physical resistance bit is entirely arbitrary, maybe should be tweaked
	if (!canUse$1(Skill.get("Beef Shank"), false) || enemy.physicalResistance > 70)
	{
		beef_shank_value = 0;
	}
	if (!canUse$1(Skill.get("Spicy Meatball"), false) || enemy.defenseElement === Element.get("hot"))
	{
		spicy_meatball_value = 0;
	}
	if (!canUse$1(Skill.get("Bacon Ray"), false) || enemy.defenseElement === Element.get("sleaze"))
	{
		bacon_ray_value = 0;
	}
	// Step 3: apply vulnerability multipliers
	if (enemy.defenseElement === Element.get("cold") || enemy.defenseElement === Element.get("spooky"))
	{
		spicy_meatball_value = 2 * spicy_meatball_value;
	}
	else if (enemy.defenseElement === Element.get("stench") || enemy.defenseElement === Element.get("hot"))
	{
		bacon_ray_value = 2 * bacon_ray_value;
	}
	// Step 4: return the spell with the highest value, or none if none qualified
	if (spicy_meatball_value > bacon_ray_value && spicy_meatball_value > beef_shank_value)
	{
		return useSkill$1(Skill.get("Spicy Meatball"), false);
	}
	else if (bacon_ray_value > beef_shank_value)
	{
		return useSkill$1(Skill.get("Bacon Ray"), false);
	}
	else if (beef_shank_value !== 0)
	{
		return useSkill$1(Skill.get("Beef Shank"), false);
	}
	return "";
}