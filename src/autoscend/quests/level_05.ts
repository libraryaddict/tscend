import { Class, Effect, Familiar, Item, Location, Monster, Skill, Stat, abort, council, getProperty, haveEffect, haveSkill, itemAmount, myAdventures, myClass, myDaycount, myPrimestat, setProperty, use, visitUrl } from "kolmafia";
import { auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$2 } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import { autoOutfit, possessOutfit$1 } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { canBurnDelay } from "../auto_routing";
import { adjustForYellowRayIfPossible, auto_change_mcd, auto_log_info, internalQuestStatus } from "../auto_util";
import { canSurvive$1 } from "../combat/auto_combat_util";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { bat_formBats$1 } from "../paths/dark_gyffte";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_plumber } from "../paths/path_of_the_plumber";
import { robot_delay } from "../paths/you_robot";
import { in_zootomist } from "../paths/zootomist";

// L5 quest progress notes:
// unstarted
// started == acquired [Cobb's Knob map] from council
// step1 == used [Cobb's Knob map] with [Knob Goblin encryption key] to unlock internal zones.
// finished == killed the king. you still need to visit council afterwards to get rewarded.

//Defined in autoscend/quests/level_05.ash
export function L5_getEncryptionKey(): boolean
{
	if (internalQuestStatus("questL05Goblin") > 0 || itemAmount(Item.get("Knob Goblin Encryption Key")) > 0)
	{
		return false;
	}

	if (itemAmount(Item.get("11-inch knob sausage")) === 1)
	{
		visitUrl("guild.php?place=challenge");
		return true;
	}
	// want to fight goblin king quickly in legacy of loathing to get another replica mr a
	// In LKS, important keys are gated behind here, and we have tonnes of delay
	// in Zootomist it's a valuable levelling zone that drops wishes
	if (!(in_lol() || in_lowkeysummer() || in_zootomist()) && canBurnDelay(Location.get("The Outskirts of Cobb's Knob")))
	{
		return false;
	}

	if (in_gnoob() && auto_have_familiar(Familiar.get("Robortender")))
	{
		if (!haveSkill(Skill.get("Retractable Toes")) && itemAmount(Item.get("cocktail mushroom")) === 0)
		{
			handleFamiliar$1(Familiar.get("Robortender"));
		}
	}

	auto_log_info("Looking for the knob.", "blue");
	return autoAdv$2(Location.get("The Outskirts of Cobb's Knob"));
}

export function L5_findKnob(): boolean
{
	if (internalQuestStatus("questL05Goblin") !== 0)
	{
		return false;
	}
	if (itemAmount(Item.get("Knob Goblin Encryption Key")) === 1)
	{
		if (itemAmount(Item.get("Cobb's Knob map")) === 0)
		{
			council();
		}
		use(1, Item.get("Cobb's Knob map"));
		return true;
	}
	return false;
}

export function L5_haremOutfit(): boolean
{
	if (internalQuestStatus("questL05Goblin") !== 1)
	{
		return false;
	}
	if (possessOutfit$1("Knob Goblin Harem Girl Disguise"))
	{
		return false;
	}
	// Just pull it if d2
	if (myDaycount() > 1)
	{
		pullXWhenHaveY(Item.get("Knob Goblin harem veil"), 1, 0);
		pullXWhenHaveY(Item.get("Knob Goblin harem pants"), 1, 0);
	}
	// want to fight goblin king quickly in legacy of loathing to get another replica mr a
	// want to fight quickly in amw for meat
	// check for LoL path so we actually prep for yellow raying
	if (!adjustForYellowRayIfPossible(Monster.get("Knob Goblin Harem Girl")) && !in_lol() && !in_amw())
	{
		if (!isAboutToPowerlevel())
		{
			return false;
		}
	}

	if (in_heavyrains())
	{
		buffMaintain$4(Effect.get("Fishy Whiskers"));
	}
	bat_formBats$1();

	auto_log_info("Looking for some sexy lingerie!", "blue");
	if (autoAdv$2(Location.get("Cobb's Knob Harem")))
	{
		return true;
	}
	return false;
}

export function L5_goblinKing(): boolean
{
	if (internalQuestStatus("questL05Goblin") !== 1)
	{
		return false;
	}
	if (!canSurvive$1(3.0))
	{
		return false;
	}
	if (myAdventures() <= 2)
	{
		return false;
	}

	if (!possessOutfit$1("Knob Goblin Harem Girl Disguise"))
	{
		return false;
	}
	if (robot_delay("outfit"))
	{
		return false; // delay for You, Robot path
	}

	auto_log_info("Death to the gobbo!!", "blue");
	if (!autoOutfit("Knob Goblin Harem Girl Disguise"))
	{
		abort("Could not put on Knob Goblin Harem Girl Disguise, aborting");
	}
	buffMaintain$4(Effect.get("Knob Goblin Perfume"));
	if (haveEffect(Effect.get("Knob Goblin Perfume")) === 0)
	{
		let advSpent_1: boolean = autoAdv$2(Location.get("Cobb's Knob Harem"));
		if (haveEffect(Effect.get("Knob Goblin Perfume")) === 0)
		{
			advSpent_1 = autoAdv$2(Location.get("Cobb's Knob Harem"));
		}
		return advSpent_1;
	}

	if (myPrimestat() === Stat.get("Muscle"))
	{
		auto_buyUpTo(1, Item.get("Ben-Gal&trade; Balm"));
		buffMaintain$4(Effect.get("Go Get 'Em, Tiger!"));
	}
	auto_buyUpTo(1, Item.get("hair spray"));
	buffMaintain$4(Effect.get("Butt-Rock Hair"));

	if (myClass() === Class.get("Seal Clubber") || myClass() === Class.get("Turtle Tamer"))
	{
		auto_buyUpTo(1, Item.get("blood of the Wereseal"));
		buffMaintain$4(Effect.get("Temporary Lycanthropy"));
	}
	//AoSOL buffs
	if (in_aosol())
	{
		buffMaintain$3(Effect.get("Queso Fustulento"), 10, 1, 10);
		buffMaintain$3(Effect.get("Tricky Timpani"), 30, 1, 10);
	}
	// TODO: I died here, maybe we should heal a bit?
	if (!in_plumber())
	{
		auto_change_mcd(10); // get the Crown from the Goblin King.
	}
	setProperty("auto_nextEncounter", "Knob Goblin King");
	setProperty("auto_nonAdvLoc", true.toString());
	let advSpent: boolean = autoAdv$2(Location.get("Throne Room"));

	if (itemAmount(Item.get("Crown of the Goblin King")) > 0 || itemAmount(Item.get("Glass Balls of the Goblin King")) > 0 || itemAmount(Item.get("Codpiece of the Goblin King")) > 0 || getProperty("questL05Goblin") === "finished" || in_plumber() || itemAmount(Item.get("cursed goblin cape")) > 0)
	{
		council();
	}
	return advSpent;
}

export function L5_slayTheGoblinKing(): boolean
{
	if (L5_getEncryptionKey() || L5_findKnob() || L5_haremOutfit() || L5_goblinKing())
	{
		return true;
	}
	return false;
}