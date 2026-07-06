import { Class, getProperty, gnomadsAvailable, guildStoreAvailable, haveSkill, Item, itemAmount, myClass, myLevel, myMeat, myPath, print, setProperty, Skill, toBoolean, visitUrl } from "kolmafia";
import { initializeSettings } from "../../autoscend";
import { stomach_left } from "../auto_consume";
import { hasTorso$1, hasUsefulShirt, meatReserve } from "../auto_util";
import { in_aosol } from "./avatar_of_shadows_over_loathing";
import { in_tcrs } from "./two_crazy_random_summer";
import { auto_bestWarPlan } from "../quests/level_12";

// Functions designed for general utility in any path

//Defined in autoscend/auto_path_util.ash
export function auto_buySkills(): boolean
{ // This handles skill acquisition for general paths
	//we need 5000 meat for the skill. and want to save an additional 1000 meat above meat reserve since torso awareness is somewhat low priority
	if (myMeat() >= meatReserve() + 6000 && gnomadsAvailable() && !hasTorso$1() && hasUsefulShirt() && !in_aosol())
	{
		visitUrl("gnomes.php?action=trainskill&whichskill=12");
	}
	else if (myMeat() >= meatReserve() && gnomadsAvailable() && !hasTorso$1() && hasUsefulShirt() && in_aosol())
	{
	//we want Torso ASAP if we have a Parka and we're in AoSOL so we reserve meat in the meatReserve function only in AoSOL
		visitUrl("gnomes.php?action=trainskill&whichskill=12");
	}
	if (!guildStoreAvailable())
	{
		return false;
	}
	switch (myClass())
	{
	case Class.get("Seal Clubber"):
		if (myLevel() >= 1 && myMeat() >= 800 && !haveSkill(Skill.get("Lunge Smack")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 1 && myMeat() >= 1500 && !haveSkill(Skill.get("Fortitude of the Muskox")))
		{
			visitUrl("guild.php?action=buyskill&skillid=8", true);
		}
		if (myLevel() >= 3 && myMeat() >= 2500 && !haveSkill(Skill.get("Cold Shoulder")))
		{
			visitUrl("guild.php?action=buyskill&skillid=28", true);
		}
		if (myLevel() >= 4 && !haveSkill(Skill.get("Wrath of the Wolverine")) && (myMeat() >= 5500 || myMeat() >= 3500 && haveSkill(Skill.get("Club Foot")) || myMeat() >= 2500 && haveSkill(Skill.get("Batter Up!")) && haveSkill(Skill.get("Ire of the Orca"))))
		{
			visitUrl("guild.php?action=buyskill&skillid=29", true);
		}
		if (myLevel() >= 8 && myMeat() >= 8000 && !haveSkill(Skill.get("Club Foot")))
		{
			visitUrl("guild.php?action=buyskill&skillid=33", true);
		}
		if (myLevel() >= 10 && myMeat() >= 12000 && !haveSkill(Skill.get("Ire of the Orca")))
		{
			visitUrl("guild.php?action=buyskill&skillid=35", true);
		}
		if (myLevel() >= 11 && myMeat() >= 12000 && !haveSkill(Skill.get("Batter Up!")))
		{
			visitUrl("guild.php?action=buyskill&skillid=14", true);
		}
		break;
	case Class.get("Turtle Tamer"):
		if (myLevel() >= 3 && myMeat() >= 1000 && !haveSkill(Skill.get("Amphibian Sympathy")))
		{
			visitUrl("guild.php?action=buyskill&skillid=14", true);
		}
		if (myLevel() >= 2 && myMeat() >= 5000 && !haveSkill(Skill.get("Skin of the Leatherback")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 2 && myMeat() >= 1250 && !haveSkill(Skill.get("Headbutt")))
		{
			visitUrl("guild.php?action=buyskill&skillid=3", true);
		}
		if (myLevel() >= 2 && myMeat() >= 800 && !haveSkill(Skill.get("Blessing of the War Snapper")))
		{
			visitUrl("guild.php?action=buyskill&skillid=30", true);
		}
		if (myLevel() >= 8 && myMeat() >= 3500 && !haveSkill(Skill.get("Empathy of the Newt")))
		{
			visitUrl("guild.php?action=buyskill&skillid=9", true);
		}
		if (myLevel() >= 9 && myMeat() >= 12000 && !haveSkill(Skill.get("Spiky Shell")))
		{
			visitUrl("guild.php?action=buyskill&skillid=31", true);
		}
		if (myLevel() >= 11 && myMeat() >= 9000 && !haveSkill(Skill.get("Shieldbutt")))
		{
			visitUrl("guild.php?action=buyskill&skillid=5", true);
		}
		if (myLevel() >= 11 && myMeat() >= 9000 && !haveSkill(Skill.get("Butts of Steel")))
		{
			visitUrl("guild.php?action=buyskill&skillid=34", true);
		}
		if (myLevel() >= 7 && myMeat() >= 13000 && !haveSkill(Skill.get("Kneebutt")))
		{
			visitUrl("guild.php?action=buyskill&skillid=15", true);
		}
		if (myLevel() >= 5 && myMeat() >= 11000 && !haveSkill(Skill.get("Shell Up")))
		{
			visitUrl("guild.php?action=buyskill&skillid=28", true);
		}
		if (myLevel() >= 11 && myMeat() >= 17000 && !haveSkill(Skill.get("Blessing of the Storm Tortoise")))
		{
			visitUrl("guild.php?action=buyskill&skillid=37", true);
		}
		if (myLevel() >= 6 && myMeat() >= 17400 && !haveSkill(Skill.get("Spirit Snap")))
		{
			visitUrl("guild.php?action=buyskill&skillid=32", true);
		}
		break;
	case Class.get("Pastamancer"):
		if (myLevel() >= 1 && myMeat() >= 500 && !haveSkill(Skill.get("Utensil Twist")))
		{
			visitUrl("guild.php?action=buyskill&skillid=25", true);
		}
		if (myLevel() >= 2 && myMeat() >= 1000 && !haveSkill(Skill.get("Entangling Noodles")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 5 && myMeat() >= 4000 && !haveSkill(Skill.get("Pastamastery")))
		{
			visitUrl("guild.php?action=buyskill&skillid=6", true);
		}
		if (myLevel() >= 5 && myMeat() >= 4000 && !haveSkill(Skill.get("Bind Vermincelli")))
		{
			visitUrl("guild.php?action=buyskill&skillid=29", true);
		}
		if (myLevel() >= 9 && myMeat() >= 12500 && !haveSkill(Skill.get("Spirit of Ravioli")))
		{
			visitUrl("guild.php?action=buyskill&skillid=14", true);
		}
		if (myLevel() >= 11 && myMeat() >= 15000 && !haveSkill(Skill.get("Leash of Linguini")))
		{
			visitUrl("guild.php?action=buyskill&skillid=10", true);
		}
		if (myLevel() >= 12 && myMeat() >= 25000 && !haveSkill(Skill.get("Cannelloni Cocoon")))
		{
			visitUrl("guild.php?action=buyskill&skillid=12", true);
		}
		if (myLevel() >= 15 && myMeat() >= 32500 && !haveSkill(Skill.get("Bind Spice Ghost")))
		{
			visitUrl("guild.php?action=buyskill&skillid=39", true);
		}
		break;
	case Class.get("Sauceror"):
		if (myLevel() >= 3 && myMeat() >= 1000 && !haveSkill(Skill.get("Expert Panhandling")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 4 && myMeat() >= 3000 && !haveSkill(Skill.get("Elemental Saucesphere")))
		{
			visitUrl("guild.php?action=buyskill&skillid=7", true);
		}
		if (myLevel() >= 4 && myMeat() >= 1000 && !haveSkill(Skill.get("Inner Sauce")))
		{
			visitUrl("guild.php?action=buyskill&skillid=28", true);
		}
		if (myLevel() >= 5 && myMeat() >= 5000 && !haveSkill(Skill.get("Advanced Saucecrafting")))
		{
			visitUrl("guild.php?action=buyskill&skillid=6", true);
		}
		if (myLevel() >= 5 && myMeat() >= 4000 && !haveSkill(Skill.get("Saucestorm")))
		{
			visitUrl("guild.php?action=buyskill&skillid=5", true);
		}
		if (myLevel() >= 6 && myMeat() >= 2500 && !haveSkill(Skill.get("Soul Saucery")))
		{
			visitUrl("guild.php?action=buyskill&skillid=27", true);
		}
		if (myLevel() >= 11 && myMeat() >= 20000 && !haveSkill(Skill.get("Saucemaven")) && (stomach_left() >= 4 || in_tcrs()))
		{
			visitUrl("guild.php?action=buyskill&skillid=39", true);
		}
		if (myLevel() >= 12 && myMeat() >= 20000 && !haveSkill(Skill.get("Curse of Weaksauce")))
		{
			visitUrl("guild.php?action=buyskill&skillid=34", true);
		}
		if (myLevel() >= 8 && myMeat() >= 12000 && !haveSkill(Skill.get("Itchy Curse Finger")) && haveSkill(Skill.get("Curse of Weaksauce")))
		{
			visitUrl("guild.php?action=buyskill&skillid=30", true);
		}
		break;
	case Class.get("Disco Bandit"):
		if (myLevel() >= 2 && myMeat() >= 2100 && !haveSkill(Skill.get("Overdeveloped Sense of Self Preservation")))
		{
			visitUrl("guild.php?action=buyskill&skillid=10", true);
		}
		if (myLevel() >= 5 && myMeat() >= 2500 && !haveSkill(Skill.get("Advanced Cocktailcrafting")))
		{
			visitUrl("guild.php?action=buyskill&skillid=14", true);
		}
		if (myLevel() >= 6 && myMeat() >= 2500 && !haveSkill(Skill.get("Nimble Fingers")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 8 && myMeat() >= 7500 && !haveSkill(Skill.get("Mad Looting Skillz")))
		{
			visitUrl("guild.php?action=buyskill&skillid=6", true);
		}
		if (myLevel() >= 12 && myMeat() >= 500 && !haveSkill(Skill.get("Deft Hands")) && getProperty("sidequestArenaCompleted") === "none")
		{
			//safe flyering
			const noStaggerItem: boolean = itemAmount(Item.get("beehive")) === 0 && itemAmount(Item.get("Time-Spinner")) === 0;
			const cantStagger: boolean = noStaggerItem || !haveSkill(Skill.get("Ambidextrous Funkslinging"));
			if (cantStagger && !toBoolean(getProperty("auto_ignoreFlyer")) && auto_bestWarPlan().doArena)
			{
				//buy Deft hands = first item throw in the fight staggers
				visitUrl("guild.php?action=buyskill&skillid=25", true);
			}
		}
		break;
	case Class.get("Accordion Thief"):
		if (myLevel() >= 1 && myMeat() >= 400 && !haveSkill(Skill.get("The Moxious Madrigal")))
		{
			visitUrl("guild.php?action=buyskill&skillid=4", true);
		}
		if (myLevel() >= 2 && myMeat() >= 1250 && !haveSkill(Skill.get("The Magical Mojomuscular Melody")))
		{
			visitUrl("guild.php?action=buyskill&skillid=7", true);
		}
		if (myLevel() >= 4 && myMeat() >= 3500 && !haveSkill(Skill.get("The Power Ballad of the Arrowsmith")))
		{
			visitUrl("guild.php?action=buyskill&skillid=8", true);
		}
		if (myLevel() >= 5 && myMeat() >= 2000 && !haveSkill(Skill.get("The Polka of Plenty")))
		{
			visitUrl("guild.php?action=buyskill&skillid=6", true);
		}
		if (myLevel() >= 7 && myMeat() >= 7500 && !haveSkill(Skill.get("Fat Leon's Phat Loot Lyric")))
		{
			visitUrl("guild.php?action=buyskill&skillid=10", true);
		}
		if (myLevel() >= 10 && myMeat() >= 12500 && !haveSkill(Skill.get("Thief Among the Honorable")))
		{
			visitUrl("guild.php?action=buyskill&skillid=38", true);
		}
		if (myLevel() >= 11 && myMeat() >= 20000 && !haveSkill(Skill.get("Sticky Fingers")))
		{
			visitUrl("guild.php?action=buyskill&skillid=39", true);
		}
		if (myLevel() >= 12 && myMeat() >= 25000 && !haveSkill(Skill.get("The Ode to Booze")))
		{
			visitUrl("guild.php?action=buyskill&skillid=14", true);
		}
		if (myLevel() >= 13 && myMeat() >= 30000 && !haveSkill(Skill.get("The Sonata of Sneakiness")))
		{
			visitUrl("guild.php?action=buyskill&skillid=15", true);
		}
		if (myLevel() >= 13 && myMeat() >= 30000 && !haveSkill(Skill.get("Master Accordion Master Thief")))
		{
			visitUrl("guild.php?action=buyskill&skillid=41", true);
		}
		break;
	}
	return false;
}

export function pathDroppedCheck(): void
{
	//detect path drops and reinitialize with settings appropriate for the new path
	//this will also trigger when some paths break ronin
	if (myPath().name === getProperty("auto_doneInitializePath"))
	{
		return; //our current path is the same one we last initialized as
	}
	if (getProperty("auto_doneInitializePath") === "")
	{
		//this setting has not been set. this means the run started with an older version of autoscend that did not have this setting
		//a path of none would have returned "None" not "". This is only backwards support and can be deleted in the future.
		return;
	}
	print(`Path change detected. You were previously ${getProperty("auto_doneInitializePath")} and are now a ${myPath().name}`, "red");
	setProperty("_auto_reinitialize", true.toString());
	initializeSettings();
}
