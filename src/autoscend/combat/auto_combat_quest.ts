import { Class, Item, Monster, Skill, abort, ceil, containsText, getProperty, monsterHp, monsterLevelAdjustment, myClass, myFamiliar, removeProperty, setProperty, toBoolean, toInt } from "kolmafia";
import { isAttackFamiliar } from "../auto_familiar";
import { MLDamageToMonsterMultiplier, auto_have_skill, auto_log_info, combatItemDamageMultiplier } from "../auto_util";
import { auto_combatHandler } from "./auto_combat";
import { auto_edCombatHandler } from "./auto_combat_ed";
import { canSurvive$1, canUse$1, canUse$2, canUse$3, canUse$4, combat_status_add, combat_status_check, findBanisher, getStunner, haveUsed, useItem, useItem$1, useItems$1, useSkill$1, useSkill$2 } from "./auto_combat_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_fotd } from "../paths/fall_of_the_dinosaurs";
import { glover_usable } from "../paths/g_lover";
import { auto_warSide } from "../quests/level_12";

// This file is for quest specific combat handling.
// the junkyard gremlin quest
//defined in /autoscend/combat/auto_combat_quest.ash
export function auto_JunkyardCombatHandler(round_1: number, enemy: Monster, text: string): string
{
	if (!(Monster.get(["A.M.C. gremlin", "batwinged gremlin", "batwinged gremlin (tool)", "erudite gremlin", "erudite gremlin (tool)",
	"spider gremlin", "spider gremlin (tool)", "vegetable gremlin", "vegetable gremlin (tool)"]).includes(enemy)))
	{
		if (isActuallyEd())
		{
			return auto_edCombatHandler(round_1, enemy, text);
		}
		return auto_combatHandler(round_1, enemy, text);
	}

	auto_log_info(`auto_JunkyardCombatHandler: ${round_1}`, "brown");
	if (round_1 === 0)
	{
		setProperty("auto_gremlinMoly", false.toString());
		removeProperty("_auto_combatState");
	}

	if (Monster.get(["batwinged gremlin (tool)", "erudite gremlin (tool)", "spider gremlin (tool)", "vegetable gremlin (tool)"]).includes(enemy)) {
		setProperty("auto_gremlinMoly", true.toString());
	}

	if (!combat_status_check("gremlinNeedBanish") && !toBoolean(getProperty("auto_gremlinMoly")) && isActuallyEd())
	{
		combat_status_add("gremlinNeedBanish");
	}

	if (in_fotd())
	{
		// In Fall of the Dinosaurs just use the magnet without waiting for a message
		if (canUse$4(Item.get("molybdenum magnet")) && Monster.get(["batwinged gremlin (tool)", "erudite gremlin (tool)", "spider gremlin (tool)", "vegetable gremlin (tool)"]).includes(enemy))
		{
			return useItem$1(Item.get("molybdenum magnet"));
		}
		return auto_combatHandler(round_1, enemy, text);
	}

	if (round_1 >= 28)
	{
		if (canUse$1(Skill.get("Storm of the Scarab"), false))
		{
			return useSkill$1(Skill.get("Storm of the Scarab"), false);
		}
		else if (canUse$1(Skill.get("Lunging Thrust-Smack"), false))
		{
			return useSkill$1(Skill.get("Lunging Thrust-Smack"), false);
		}
		return "attack with weapon";
	}

	if (containsText(text, "<!--moly1-->") || containsText(text, "<!--moly2-->") || containsText(text, "<!--moly3-->") || containsText(text, "<!--moly4-->"))
	{
		return useItem$1(Item.get("molybdenum magnet"));
	}

	if (canUse$2(Skill.get("Summon Love Scarabs")))
	{
		return useSkill$2(Skill.get("Summon Love Scarabs"));
	}

	if (canUse$2(Skill.get("Good Medicine")) && canSurvive$1(2.1))
	{
		return useSkill$2(Skill.get("Good Medicine"));
	}

	let flyer: Item = Item.get("rock band flyers");
	if (auto_warSide() === "hippy")
	{
		flyer = Item.get("jam band flyers");
	}
	let stunner: Skill = getStunner(enemy);
	let stunned: boolean = combat_status_check("stunned");
	let gremlinTakesDamage: boolean = isAttackFamiliar(myFamiliar()) || monsterHp() < 0.8 * monsterHp(enemy);
	let shouldFlyer: boolean = false;
	let staggeringFlyer: boolean = false;
	let flyerWith: Item = Item.none;

	if (myClass() === Class.get("Disco Bandit") && auto_have_skill(Skill.get("Deft Hands")) && !combat_status_check("(it"))
	{
		//first item throw in the fight staggers
		staggeringFlyer = true;
	}
	if (auto_have_skill(Skill.get("Ambidextrous Funkslinging")))
	{
		if (canUse$4(Item.get("Time-Spinner")))
		{
			flyerWith = Item.get("Time-Spinner");
			staggeringFlyer = true;
		}
		else if (canUse$4(Item.get("beehive")))
		{
			let canBeehiveGremlin: boolean = false;
			let beehiveDamage: number = ceil(30 * combatItemDamageMultiplier() * MLDamageToMonsterMultiplier());
			if (toBoolean(getProperty("auto_gremlinMoly")))
			{
				//don't kill tool gremlin with beehive
				canBeehiveGremlin = !gremlinTakesDamage && monsterHp() > beehiveDamage + 30 - round_1 && canUse$3(Item.get("seal tooth"), false);
			}
			else {
				//don't miss MP by killing weak monsters with beehive
				canBeehiveGremlin = !(monsterHp() <= beehiveDamage && myClass() === Class.get("Sauceror") && haveUsed(Skill.get("Curse of Weaksauce")));
			}
			if (canBeehiveGremlin)
			{
				flyerWith = Item.get("beehive");
				staggeringFlyer = true;
			}
		}
		if (staggeringFlyer && monsterLevelAdjustment() > 150)
		{ //gremlins only, no need to check stunnable
			staggeringFlyer = false;
		}
	}

	if (toBoolean(getProperty("auto_gremlinMoly")))
	{ //don't ever stun tool gremlins
		stunner = Skill.none;
	}
	if (canUse$4(flyer) && toInt(getProperty("flyeredML")) < 10000 && !toBoolean(getProperty("auto_ignoreFlyer")))
	{
		if (!staggeringFlyer && stunner !== Skill.none && !stunned)
		{
			combat_status_add("stunned");
			return useSkill$2(stunner);
		}
		if (isActuallyEd())
		{
			setProperty("auto_edStatus", "UNDYING!");
		}
		if (canSurvive$1(3.0) || stunned || staggeringFlyer)
		{
			shouldFlyer = true;
		}
		if (shouldFlyer)
		{
			if (flyerWith !== Item.none)
			{
				return useItems$1(flyer, flyerWith);
			}
			else {
				return useItem$1(flyer);
			}
		}
	}

	if (!toBoolean(getProperty("auto_gremlinMoly")))
	{
		if (isActuallyEd())
		{
			if (toInt(getProperty("_edDefeats")) >= 2)
			{
				return findBanisher(round_1, enemy, text);
			}
			else if (canUse$3(Item.get("seal tooth"), false) && getProperty("auto_edStatus") === "UNDYING!")
			{
				return useItem(Item.get("seal tooth"), false);
			}
		}
		else {
			return findBanisher(round_1, enemy, text);
		}
	}

	if (!canSurvive$1(1.5))
	{
		if (!isActuallyEd() || toInt(getProperty("_edDefeats")) >= 2)
		{
			abort("I am too weak to safely stasis this gremlin");
		}
	}

	for (let it of Item.get(["seal tooth", "spectre scepter", "Doc Galaktik's Pungent Unguent"]))
	{
		if (canUse$3(it, false) && glover_usable(it.toString()))
		{
			return useItem(it, false);
		}
	}

	if (canUse$1(Skill.get("Toss"), false))
	{
		return useSkill$1(Skill.get("Toss"), false);
	}

	if (canUse$1(Skill.get("Plague Claws"), false))
	{
		return useSkill$1(Skill.get("Plague Claws"), false);
	}

	return "attack with weapon";
}