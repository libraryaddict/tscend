import { Item, Location, Monster, Skill, containsText, getProperty, itemAmount, myLevel, myLocation, toInt, toItem } from "kolmafia";
import { possessEquipment } from "../auto_equipment";
import { auto_have_skill, handleTracker$1, internalQuestStatus } from "../auto_util";
import { canSurvive$1, canUse$2, useSkill$2 } from "./auto_combat_util";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { cyrptEvilBonus } from "../quests/level_07";

//Path specific combat handling for Zombie Slayer

export function wantBearHug(enemy: Monster): boolean
{
	return canUse$2(Skill.get("Bear Hug")) && toInt(getProperty("_bearHugs")) < 10 && !enemy.boss && !containsText(enemy.attributes, "FREE") && enemy.group > 1;
}

export function wantKodiakMoment(enemy: Monster): boolean
{
	return canUse$2(Skill.get("Kodiak Moment")) && enemy.physicalResistance >= 80;
}

export function auto_combatZombieSlayerStage1(round_1: number, enemy: Monster, text: string): string
{
	// stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
	if (!in_zombieSlayer())
	{
		return "";
	}

	return "";
}

export function auto_combatZombieSlayerStage2(round_1: number, enemy: Monster, text: string): string
{
	// stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
	if (!in_zombieSlayer())
	{
		return "";
	}

	return "";
}

//defined in /autoscend/combat/auto_combat_zombie_slayer.ash
export function auto_combatZombieSlayerStage3(round_1: number, enemy: Monster, text: string): string
{
	// stage 3 = debuff: delevel, stun, curse, damage over time
	if (!in_zombieSlayer())
	{
		return "";
	}

	if (canUse$2(Skill.get("Infectious Bite")) && canSurvive$1(4.0))
	{
		return useSkill$2(Skill.get("Infectious Bite"));
	}

	if (canUse$2(Skill.get("Meat Shields")) && enemy.boss && canSurvive$1(4.0))
	{
		return useSkill$2(Skill.get("Meat Shields"));
	}
	// Just always use Bear-ly Legal for the delevel + meat, unless we want to Bear Hug or Kodiak Moment
	if (canUse$2(Skill.get("Bear-ly Legal")) && !wantBearHug(enemy) && !wantKodiakMoment(enemy))
	{
		return useSkill$2(Skill.get("Bear-ly Legal"));
	}

	return "";
}

export function auto_combatZombieSlayerStage4(round_1: number, enemy: Monster, text: string): string
{
	// stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
	if (!in_zombieSlayer())
	{
		return "";
	}
	// Basically stolen from Ed's Lash targets
	if (canUse$2(Skill.get("Smash & Graaagh")) && toInt(getProperty("_zombieSmashPocketsUsed")) < 30 && canSurvive$1(2.0))
	{
		let doSmash: boolean = false;

		if (enemy === Monster.get("Big Wheelin' Twins") && !possessEquipment(Item.get("badge of authority")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("mountain man") && itemAmount(toItem(getProperty("trapperOre"))) < 3)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("fishy pirate") && !possessEquipment(Item.get("perfume-soaked bandana")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("garbage tourist") && itemAmount(Item.get("bag of park garbage")) === 0)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("dairy goat") && itemAmount(Item.get("goat cheese")) < 3)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("monstrous boiler") && itemAmount(Item.get("red-hot boilermaker")) < 1 && toInt(getProperty("booPeakProgress")) > 0)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Fitness Giant") && itemAmount(Item.get("pec oil")) < 1 && toInt(getProperty("booPeakProgress")) > 0)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Renaissance Giant") && itemAmount(Item.get("Ye Olde Meade")) < 1)
		{
			doSmash = true;
		}
		if (Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy))
		{
			doSmash = true;
		}
		if (Monster.get(["beanbat", "bookbat"]).includes(enemy))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("banshee librarian") && itemAmount(Item.get("killing jar")) < 1 && toInt(getProperty("desertExploration")) < 100 && (toInt(getProperty("gnasirProgress")) & 4) === 0)
		{
			doSmash = true;
		}
		if ((enemy === Monster.get("toothy sklelton") || enemy === Monster.get("spiny skelelton")) && toInt(getProperty("cyrptNookEvilness")) > 14 + cyrptEvilBonus(true))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("oil baron") && itemAmount(Item.get("bubblin' crude")) < 12 && itemAmount(Item.get("jar of oil")) === 0)
		{
			doSmash = true;
		}
		if (enemy === Monster.get("blackberry bush") && itemAmount(Item.get("blackberry")) < 3 && !possessEquipment(Item.get("blackberry galoshes")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("pygmy bowler") && toInt(getProperty("_zombieSmashPocketsUsed")) < 26)
		{
			doSmash = true;
		}
		if (Monster.get(["filthworm drone", "filthworm royal guard", "larval filthworm"]).includes(enemy))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Knob Goblin Madam"))
		{
			if (itemAmount(Item.get("Knob Goblin perfume")) === 0)
			{
				doSmash = true;
			}
		}
		if (enemy === Monster.get("Knob Goblin Harem Girl"))
		{
			if (!possessEquipment(Item.get("Knob Goblin harem veil")) || !possessEquipment(Item.get("Knob Goblin harem pants")))
			{
				doSmash = true;
			}
		}
		if ((myLocation() === Location.get("The Hippy Camp") || myLocation() === Location.get("Wartime Hippy Camp")) && containsText(enemy.toString(), "hippy") && myLevel() >= 12)
		{
			if (!possessEquipment(Item.get("filthy knitted dread sack")) || !possessEquipment(Item.get("filthy corduroys")))
			{

				doSmash = true;

			}
		}
		if (myLocation() === Location.get("Wartime Frat House"))
		{
			if (!possessEquipment(Item.get("beer helmet")) || !possessEquipment(Item.get("bejeweled pledge pin")) || !possessEquipment(Item.get("distressed denim pants")))
			{
				doSmash = true;
			}
		}
		if (enemy === Monster.get("dopey 7-Foot Dwarf") && !possessEquipment(Item.get("miner's helmet")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("grumpy 7-Foot Dwarf") && !possessEquipment(Item.get("7-Foot Dwarven mattock")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("sleepy 7-Foot Dwarf") && !possessEquipment(Item.get("miner's pants")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Burly Sidekick") && !possessEquipment(Item.get("Mohawk wig")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Spunky Princess") && !possessEquipment(Item.get("titanium assault umbrella")) && !possessEquipment(Item.get("unbreakable umbrella")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Quiet Healer") && !possessEquipment(Item.get("amulet of extreme plot significance")))
		{
			doSmash = true;
		}
		if (enemy === Monster.get("Copperhead Club bartender") && internalQuestStatus("questL11Ron") < 2)
		{
			doSmash = true;
		}

		if (doSmash)
		{
			handleTracker$1(enemy.toString(), Skill.get("Smash & Graaagh").toString(), "auto_otherstuff");
			return useSkill$2(Skill.get("Smash & Graaagh"));
		}

	}


	return "";
}

export function auto_combatZombieSlayerStage5(round_1: number, enemy: Monster, text: string): string
{
	if (!in_zombieSlayer())
	{
		return "";
	}

	if (wantBearHug(enemy))
	{
		return useSkill$2(Skill.get("Bear Hug"));
	}
	// Spam plague claws if we won't die
	if (round_1 < 20 && canSurvive$1(5.0) && auto_have_skill(Skill.get("Plague Claws")) && enemy.physicalResistance < 80)
	{
		return useSkill$2(Skill.get("Plague Claws"));
	}

	if (wantKodiakMoment(enemy))
	{
		return useSkill$2(Skill.get("Kodiak Moment"));
	}

	if (canUse$2(Skill.get("Bilious Burst")) && enemy.physicalResistance >= 80)
	{
		return useSkill$2(Skill.get("Bilious Burst"));
	}

	return "";
}