import { abort, buffedHitStat, Class, containsText, Effect, Element, equippedItem, getProperty, haveEffect, haveEquipped, haveSkill, hpCost, Item, itemAmount, itemType, Location, Monster, monsterDefense, monsterElement, monsterHp, monsterLevelAdjustment, monsterPhylum, mpCost, myClass, myFullness, myHp, myLocation, myMaxhp, myMp, numericModifier, Phylum, setProperty, Skill, Slot, Stat, toBoolean, toInt, weaponType } from "kolmafia";
import { auto_have_skill, auto_log_info, auto_log_warning, currentFlavour, isGhost, stunnable } from "../auto_util";
import { zone_combatMod } from "../auto_zone";
import { auto_combatMeatGolemStage5 } from "./auto_combat_adventurer_meats_world";
import { auto_combatDisguisesStage5 } from "./auto_combat_disguises_delimit";
import { auto_combatFallOfTheDinosaursStage5 } from "./auto_combat_fall_of_the_dinosaurs";
import { auto_combatGelatinousNoobStage5 } from "./auto_combat_gelatinous_noob";
import { auto_combatHeavyRainsStage5 } from "./auto_combat_heavy_rains";
import { auto_combatPlumberStage5 } from "./auto_combat_plumber";
import { canSurvive$1, canSurviveShootGhost, canUse, canUse$1, canUse$2, canUse$3, canUse$4, combat_status_add, combat_status_check, enemyCanBlocksSkills, getStunner, hasClubEquipped, markAsUsed, usedCount, useItem, useItem$1, useSkill$1, useSkill$2 } from "./auto_combat_util";
import { auto_combatWereProfessorStage5 } from "./auto_combat_wereprofessor";
import { auto_combat_robot_stage5 } from "./auto_combat_you_robot";
import { auto_combatZombieSlayerStage5 } from "./auto_combat_zombie_slayer";
import { auto_spoonCombatSkill } from "../iotms/mr2019";
import { auto_haveCosmicBowlingBall } from "../iotms/mr2022";
import { auto_haveDarts, dartSkill } from "../iotms/mr2024";
import { auto_canNorthernExplosionFE } from "../iotms/mr2025";
import { inAftercore } from "../paths/casual";
import { in_glover } from "../paths/g_lover";
import { getZooBestPunch$1 } from "../paths/zootomist";

//defined in /autoscend/combat/auto_combat_default_stage5.ash
export function auto_combatDefaultStage5(round_1: number, enemy: Monster, text: string): string
{
	// stage 5 = kill
	let retval: string = "";
	//Unskip stage 4
	if (toBoolean(getProperty("auto_skipStage4"))) { setProperty("auto_skipStage4", false.toString()); }
	// Path = Heavy Rains
	retval = auto_combatHeavyRainsStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = path of the plumber
	retval = auto_combatPlumberStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = disguises delimit
	retval = auto_combatDisguisesStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = gelatinous noob
	retval = auto_combatGelatinousNoobStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = you, robot
	retval = auto_combat_robot_stage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = zombie slayer
	retval = auto_combatZombieSlayerStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = fall of the dinosaurs
	retval = auto_combatFallOfTheDinosaursStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = Wereprofessor
	retval = auto_combatWereProfessorStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = adventurer meats world
	retval = auto_combatMeatGolemStage5(round_1, enemy, text);
	if (retval !== "") { return retval; }
	//with loofah, you can stagger and deal cold or hot damage
	if (canUse$2(Skill.get("Loofah Stew")) && monsterElement(enemy) !== Element.get("cold"))
	{
		return useSkill$1(Skill.get("Loofah Stew"), false);
	}
	if (canUse$2(Skill.get("Loofah Lava")) && monsterElement(enemy) !== Element.get("hot"))
	{
		return useSkill$1(Skill.get("Loofah Lava"), false);
	}

	const type_1: Phylum = monsterPhylum(enemy);
	let attackMinor: string = "attack with weapon";
	let attackMajor: string = "attack with weapon";
	let costMinor: number = 0;
	let costMajor: number = 0;
	let damageReceived: number = 0;
	if (round_1 !== 0)
	{
		damageReceived = toInt(getProperty("auto_combatHP")) - myHp();
	}

	if (enemy === Monster.get("LOV Enforcer") && canUse$1(Skill.get("Saucestorm"), false))
	{
		return useSkill$1(Skill.get("Saucestorm"), false);
	}
	//nemesis quest specific kill methods
	if (myClass() === Class.get("Seal Clubber"))
	{
		if (enemy === Monster.get("hellseal pup"))
		{
			return useSkill$1(Skill.get("Clobber"), false);
		}
		if (enemy === Monster.get("mother hellseal"))
		{
			if (canUse$4(Item.get("Rain-Doh indigo cup")))
			{
				return useItem$1(Item.get("Rain-Doh indigo cup"));
			}
			return useSkill$1(Skill.get("Lunging Thrust-Smack"), false);
		}
	}
	//nemesis quest tame guard turtle. takes multiple rounds and buffs enemy by 40%. so it should go after stun and delevel
	if (enemy === Monster.get("french guard turtle") && haveEquipped(Item.get("fouet de tortue-dressage")) && myMp() >= mpCost(Skill.get("Apprivoisez la tortue")))
	{
		return useSkill$1(Skill.get("Apprivoisez la tortue"), false);
	}
	//iotm back item and the enemies it spawns (free fights) can be killed using special skills to get extra XP and item drops
	if (haveEquipped(Item.get("protonic accelerator pack")) && isGhost(enemy) && !combat_status_check("skipGhostbusting"))
	{
		//shoot ghost 3 times provoking retaliation, then trap ghost skill unlocks which instawins combat.
		const stunner: Skill = getStunner(enemy);
		if (stunner !== Skill.none)
		{
			combat_status_add("stunned");
			return useSkill$2(stunner);
		}
		//shots_takens tracks how many times we used [shoot ghost] skill this combat. it is reset in combat initialize
		const shots_takens: number = usedCount(Skill.get("Shoot Ghost"));
		if (canUse$1(Skill.get("Shoot Ghost"), false) && shots_takens < 3)
		{
			const shotsLeft: number = 3 - shots_takens;
			if (canSurviveShootGhost(enemy, shotsLeft))
			{
				markAsUsed(Skill.get("Shoot Ghost")); //needs to be manually done for skills with a use limit that is not 1
				return useSkill$1(Skill.get("Shoot Ghost"), false);
			}
			else {
				combat_status_add("skipGhostbusting");
			}
		}

		if (canUse$2(Skill.get("Trap Ghost")) && shots_takens === 3)
		{
			auto_log_info("Busting makes me feel good!!", "green");
			return useSkill$2(Skill.get("Trap Ghost"));
		}
	}
	//turtle tamer specific skill
	if (myClass() === Class.get("Turtle Tamer") && canUse$2(Skill.get("Spirit Snap")) && myMp() > 80)
	{
		if (haveEffect(Effect.get("Glorious Blessing of the War Snapper")) > 0)
		{
			return useSkill$2(Skill.get("Spirit Snap")); //50% buffed muscle physical damage once
		}
		if (haveEffect(Effect.get("Glorious Blessing of She-Who-Was")) > 0 && monsterElement(enemy) !== Element.get("spooky"))
		{
			return useSkill$2(Skill.get("Spirit Snap")); //35% buffed muscle spooky damage once
		}
	}
	//8-16 + 0.25*mys damage. hardcap 50. costs 8MP. does NOT benefit from bringing up the rear ability to double damage cap
	//each time used has a 33% chance of dropping a candy. one candy per battle max. TODO track this
	//Cannelloni Cannon is better as it has 16-32 + 0.25*mys damage, is tuneable, and its cap can be boosted with bringing up the rear.
	//TODO write up a function to determine if we want to use this for the free candy. consider sauceror regeneration and candy mixing
	if (canUse$2(Skill.get("Candyblast")) && myMp() > 60 && inAftercore())
	{
		// We can get only one candy and we can detect it, if so desired:
		// "Hey, some of it is even intact afterwards!"
		return useSkill$2(Skill.get("Candyblast"));
	}

	if (myClass() !== Class.get("Sauceror") && canUse$2(auto_spoonCombatSkill()))
	{
		return useSkill$2(auto_spoonCombatSkill());
	}

	if (auto_haveCosmicBowlingBall() && canUse$4(Item.get("cosmic bowling ball")) && monsterHp() < 100)
	{
		return useItem$1(Item.get("cosmic bowling ball"));
	}

	if (canUse$2(Skill.get("Surprisingly Sweet Stab")))
	{
		return useSkill$2(Skill.get("Surprisingly Sweet Stab"));
	}
	//Everfull Dart Holder- use darts if you have them, unless we are against the naughty sorceress (to avoid dart skill bug)
	if (haveEquipped(Item.get("Everfull Dart Holster")) && toInt(getProperty("_dartsLeft")) > 0 && !(Monster.get(["Naughty Sorceress", "Naughty Sorceress (2)"]).includes(enemy)))
	{
		return useSkill$1(dartSkill(), false);
	}
	//mortar shell is amazing. it really should not be limited to sauceror only.
	if (canUse$2(Skill.get("Stuffed Mortar Shell")) && myClass() === Class.get("Sauceror") && canSurvive$1(2.0) && (currentFlavour() !== monsterElement(enemy) || currentFlavour() === Element.none))
	{
		setProperty("_auto_combatTracker_MortarRound", round_1.toString());
		return useSkill$2(Skill.get("Stuffed Mortar Shell"));
	}
	//Roman Candelabra red candle
	if (haveEquipped(Item.get("Roman Candelabra")) && haveEffect(Effect.get("Everything Looks Red")) === 0 && !auto_haveDarts())
	{
		return useSkill$2(Skill.get("Blow the Red Candle!"));
	}
	//general killing code
	{
		//let mortar deal the killing blow so we get more MP from the exploding curse of weaksauce

		let mortar_round: number = 0;
		//mortar was used this combat
		//mortar will hit this round
		//TODO make sure mortar will actually kill it
		//monster is not too scary.
			//avoid killing blow with seal tooth or else 0 MP will be given
			//avoid killing blow with salsaball or else ~2MP will be given
		// If we're fighting a ghost, of course we want to use elemental damage!
		// Mighty axing is better than attacking as it will never fumble and has no mp cost
		// Avoid apathy and cunctatitis by using a ranged attack
		//AoJ spells have a hard DMG cap of 10*(MP Cost) before percentage modifiers are applied.
		//Things that change the MP costs will change said dmg cap.
		//AoJ can **only** attack via spells / items / jiggling
		// Default to curdle if the monster is physically resistant
		// Prefer double damage
			// If physically resistant, fallback to an elemental spell that will do normal damage
		// Prefer double damage
			// If physically resistant, fallback to an elemental spell that will do normal damage
		// Hack for Logging Camp: deprioritize Dark Feast, use Chill of the Tomb aggressively
		// intentionally not setting costMinor or costMajor since they don't cost mp...
		// If we're in a form or something, a beehive is probably better than just attacking

		let punch: Skill = Skill.none;
		switch (myClass())
	{
	case Class.get("Seal Clubber"):
		attackMinor = "attack with weapon";
		if (canUse$1(Skill.get("Lunge Smack"), false) && weaponType(equippedItem(Slot.get("weapon"))) === Stat.get("Muscle"))
		{
			attackMinor = useSkill$1(Skill.get("Lunge Smack"), false);
			costMinor = mpCost(Skill.get("Lunge Smack"));
		}
		if (canUse$1(Skill.get("Lunging Thrust-Smack"), false) && weaponType(equippedItem(Slot.get("weapon"))) === Stat.get("Muscle"))
		{
			attackMajor = useSkill$1(Skill.get("Lunging Thrust-Smack"), false);
			costMajor = mpCost(Skill.get("Lunging Thrust-Smack"));
		}
		if (buffedHitStat() - 20 < monsterDefense() && canUse$1(Skill.get("Saucestorm"), false) && !hasClubEquipped())
		{
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		if (enemy.physicalResistance > 80)
		{
			for (const sk of Skill.get(["Saucestorm", "Saucegeyser"]))
			{
				if (canUse$1(sk, false))
				{
					attackMinor = useSkill$1(sk, false);
					attackMajor = useSkill$1(sk, false);
					costMinor = mpCost(sk);
					costMajor = mpCost(sk);
					break;
				}
			}
			if (canUse$1(Skill.get("Northern Explosion"), false) && !auto_canNorthernExplosionFE())
			{
				attackMinor = useSkill$1(Skill.get("Northern Explosion"), false);
				attackMajor = useSkill$1(Skill.get("Northern Explosion"), false);
				costMinor = mpCost(Skill.get("Northern Explosion"));
				costMajor = mpCost(Skill.get("Northern Explosion"));
			}
		}
		break;
	case Class.get("Turtle Tamer"):
		attackMinor = "attack with weapon";
		if (myMp() > 150 && canUse$1(Skill.get("Shieldbutt"), false))
		{
			attackMinor = useSkill$1(Skill.get("Shieldbutt"), false);
			costMinor = mpCost(Skill.get("Shieldbutt"));
		}
		else if (myMp() > 80 && myHp() * 2 < myMaxhp() && canUse$1(Skill.get("Kneebutt"), false))
		{
			attackMinor = useSkill$1(Skill.get("Kneebutt"), false);
			costMinor = mpCost(Skill.get("Kneebutt"));
		}
		if ((round_1 > 15 || myHp() * 2 < myMaxhp()) && canUse$1(Skill.get("Kneebutt"), false))
		{
			attackMajor = useSkill$1(Skill.get("Kneebutt"), false);
			costMajor = mpCost(Skill.get("Kneebutt"));
		}
		if (canUse$1(Skill.get("Shieldbutt"), false))
		{
			attackMajor = useSkill$1(Skill.get("Shieldbutt"), false);
			costMajor = mpCost(Skill.get("Shieldbutt"));
		}
		if (buffedHitStat() - 20 < monsterDefense() && canUse$1(Skill.get("Saucestorm"), false))
		{
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		if (enemy.physicalResistance > 80)
		{
			for (const sk of Skill.get(["Saucestorm", "Saucegeyser"]))
			{
				if (canUse$1(sk, false))
				{
					attackMinor = useSkill$1(sk, false);
					attackMajor = useSkill$1(sk, false);
					costMinor = mpCost(sk);
					costMajor = mpCost(sk);
					break;
				}
			}
		}
		break;
	case Class.get("Pastamancer"):
		if (canUse$1(Skill.get("Cannelloni Cannon"), false))
		{
			attackMinor = useSkill$1(Skill.get("Cannelloni Cannon"), false);
			costMinor = mpCost(Skill.get("Cannelloni Cannon"));
		}
		if (canUse$1(Skill.get("Weapon of the Pastalord"), false))
		{
			attackMajor = useSkill$2(Skill.get("Weapon of the Pastalord"));
			costMajor = mpCost(Skill.get("Weapon of the Pastalord"));
		}
		if (canUse$1(Skill.get("Saucestorm"), false))
		{
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			attackMinor = useSkill$1(Skill.get("Saucestorm"), false);
			costMinor = mpCost(Skill.get("Saucestorm"));
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		if (canUse$1(Skill.get("Utensil Twist"), false) && itemType(equippedItem(Slot.get("weapon"))) === "utensil")
		{
			if (equippedItem(Slot.get("weapon")) === Item.get("Hand that Rocks the Ladle"))
			{
				attackMajor = useSkill$1(Skill.get("Utensil Twist"), false);
				attackMinor = useSkill$1(Skill.get("Utensil Twist"), false);
				costMinor = mpCost(Skill.get("Utensil Twist"));
				costMajor = mpCost(Skill.get("Utensil Twist"));
			}
			else if (enemy.physicalResistance <= 80 && attackMinor !== useSkill$1(Skill.get("Saucestorm"), false))
			{
				attackMinor = useSkill$1(Skill.get("Utensil Twist"), false);
				costMinor = mpCost(Skill.get("Utensil Twist"));
			}
		}
		if ((in_glover() || attackMinor === "attack with weapon") && canUse$1(Skill.get("Saucegeyser"), false))
        	{
            		attackMinor = useSkill$1(Skill.get("Saucegeyser"), false);
            		costMinor = mpCost(Skill.get("Saucegeyser"));
        	}
		break;
	case Class.get("Sauceror"):
		if (canUse$1(Skill.get("Saucegeyser"), false))
		{
			attackMinor = useSkill$1(Skill.get("Saucegeyser"), false);
			attackMajor = useSkill$1(Skill.get("Saucegeyser"), false);
			costMinor = mpCost(Skill.get("Saucegeyser"));
			costMajor = mpCost(Skill.get("Saucegeyser"));
		}
		else if (canUse$1(Skill.get("Saucecicle"), false) && monsterElement(enemy) !== Element.get("cold"))
		{
			attackMinor = useSkill$1(Skill.get("Saucecicle"), false);
			attackMajor = useSkill$1(Skill.get("Saucecicle"), false);
			costMinor = mpCost(Skill.get("Saucecicle"));
			costMajor = mpCost(Skill.get("Saucecicle"));
		}
		else if (canUse$1(Skill.get("Saucestorm"), false))
		{
			attackMinor = useSkill$1(Skill.get("Saucestorm"), false);
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			costMinor = mpCost(Skill.get("Saucestorm"));
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		else if (canUse$1(Skill.get("Wave of Sauce"), false) && monsterElement(enemy) !== Element.get("hot"))
		{
			attackMinor = useSkill$1(Skill.get("Wave of Sauce"), false);
			attackMajor = useSkill$1(Skill.get("Wave of Sauce"), false);
			costMinor = mpCost(Skill.get("Wave of Sauce"));
			costMajor = mpCost(Skill.get("Wave of Sauce"));
		}
		else if (canUse$1(Skill.get("Stream of Sauce"), false) && monsterElement(enemy) !== Element.get("hot"))
		{
			attackMinor = useSkill$1(Skill.get("Stream of Sauce"), false);
			attackMajor = useSkill$1(Skill.get("Stream of Sauce"), false);
			costMinor = mpCost(Skill.get("Stream of Sauce"));
			costMajor = mpCost(Skill.get("Stream of Sauce"));
		}		mortar_round = toInt(getProperty("_auto_combatTracker_MortarRound"));
		if (mortar_round > -1 && mortar_round === round_1 - 1 && canSurvive$1(2.0))
		{
			if (monsterHp() > 1 && canUse$3(Item.get("seal tooth"), false))
			{
				return useItem(Item.get("seal tooth"), false);
			}
			if (monsterHp() > 15 && canUse$1(Skill.get("Salsaball"), false))
			{
				return useSkill$1(Skill.get("Salsaball"), false);
			}
		}
		break;
	case Class.get("Avatar of Boris"):
		if (canUse$1(Skill.get("Heroic Belch"), false) && enemy.physicalResistance >= 80 && Element.get("stench") !== monsterElement(enemy))
		{
			attackMinor = useSkill$2(Skill.get("Heroic Belch"));
			attackMajor = useSkill$2(Skill.get("Heroic Belch"));
			costMinor = mpCost(Skill.get("Heroic Belch"));
			costMajor = mpCost(Skill.get("Heroic Belch"));
		}
		if (canUse$1(Skill.get("Mighty Axing"), false))
		{
			attackMinor = useSkill$1(Skill.get("Mighty Axing"), false);
			attackMajor = useSkill$1(Skill.get("Mighty Axing"), false);
			costMinor = mpCost(Skill.get("Mighty Axing"));
			costMajor = mpCost(Skill.get("Mighty Axing"));
		}
		if (canUse$1(Skill.get("Cleave"), false))
		{
			attackMajor = useSkill$1(Skill.get("Cleave"), false);
			costMajor = mpCost(Skill.get("Cleave"));
		}
		if (equippedItem(Slot.get("weapon")) === Item.get("Trusty") && canUse$1(Skill.get("Throw Trusty"), false) && Monster.get(["apathetic lizardman", "Procrastination Giant"]).includes(enemy))
		{
			attackMinor = useSkill$1(Skill.get("Throw Trusty"), false);
			attackMajor = useSkill$1(Skill.get("Throw Trusty"), false);
			costMinor = mpCost(Skill.get("Throw Trusty"));
			costMajor = mpCost(Skill.get("Throw Trusty"));
		}
		if (canUse$1(Skill.get("Heroic Belch"), false) && enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("stench") && myFullness() >= 5)
		{
			attackMinor = useSkill$1(Skill.get("Heroic Belch"), false);
			attackMajor = useSkill$1(Skill.get("Heroic Belch"), false);
			costMinor = mpCost(Skill.get("Heroic Belch"));
			costMajor = mpCost(Skill.get("Heroic Belch"));
		}
		break;
	case Class.get("Avatar of Jarlsberg"):
		attackMinor = useSkill$1(Skill.get("Curdle"), false);
		attackMajor = useSkill$1(Skill.get("Curdle"), false);
		costMinor = mpCost(Skill.get("Curdle"));
		costMajor = mpCost(Skill.get("Curdle"));
		if (enemy.physicalResistance < 50)
		{
			if (canUse$1(Skill.get("Chop"), false))
			{
				attackMinor = useSkill$1(Skill.get("Chop"), false);
				attackMajor = useSkill$1(Skill.get("Chop"), false);
				costMinor = mpCost(Skill.get("Chop"));
				costMajor = mpCost(Skill.get("Chop"));
			}

			if (canUse$1(Skill.get("Slice"), false))
			{
				attackMajor = useSkill$1(Skill.get("Slice"), false);
				costMajor = mpCost(Skill.get("Slice"));
			}
		}
		if (Element.get(["cold", "spooky"]).includes(monsterElement(enemy)) && canUse$2(Skill.get("Bake")))
		{
			attackMinor = useSkill$2(Skill.get("Bake"));
			attackMajor = useSkill$2(Skill.get("Bake"));
			costMinor = mpCost(Skill.get("Bake"));
			costMajor = mpCost(Skill.get("Bake"));
		}
		else if (Element.get(["cold", "spooky"]).includes(monsterElement(enemy)) && canUse$1(Skill.get("Boil"), false))
		{
			attackMinor = useSkill$1(Skill.get("Boil"), false);
			attackMajor = useSkill$1(Skill.get("Boil"), false);
			costMinor = mpCost(Skill.get("Boil"));
			costMajor = mpCost(Skill.get("Boil"));
		}
		else if (Element.get(["stench", "sleaze"]).includes(monsterElement(enemy)) && canUse$1(Skill.get("Freeze"), false))
		{
			attackMinor = useSkill$1(Skill.get("Freeze"), false);
			attackMajor = useSkill$1(Skill.get("Freeze"), false);
			costMinor = mpCost(Skill.get("Freeze"));
			costMajor = mpCost(Skill.get("Freeze"));
		}
		else if (enemy.physicalResistance >= 50)
		{

			if (monsterElement(enemy) !== Element.get("hot") && canUse$2(Skill.get("Bake")))
			{
				attackMinor = useSkill$2(Skill.get("Bake"));
				attackMajor = useSkill$2(Skill.get("Bake"));
				costMinor = mpCost(Skill.get("Bake"));
				costMajor = mpCost(Skill.get("Bake"));
			}
			else if (monsterElement(enemy) !== Element.get("hot") && canUse$1(Skill.get("Boil"), false))
			{
				attackMinor = useSkill$1(Skill.get("Boil"), false);
				attackMajor = useSkill$1(Skill.get("Boil"), false);
				costMinor = mpCost(Skill.get("Boil"));
				costMajor = mpCost(Skill.get("Boil"));
			}
			else if (monsterElement(enemy) !== Element.get("cold") && canUse$1(Skill.get("Freeze"), false))
			{
				attackMinor = useSkill$1(Skill.get("Freeze"), false);
				attackMajor = useSkill$1(Skill.get("Freeze"), false);
				costMinor = mpCost(Skill.get("Freeze"));
				costMajor = mpCost(Skill.get("Freeze"));
			}
		}
		if (Element.get(["hot", "stench"]).includes(monsterElement(enemy)) && canUse$1(Skill.get("Fry"), false))
		{
			attackMajor = useSkill$1(Skill.get("Fry"), false);
			costMajor = mpCost(Skill.get("Fry"));
		}
		else if (monsterElement(enemy) !== Element.none && canUse$1(Skill.get("Grill"), false))
		{
			attackMajor = useSkill$1(Skill.get("Grill"), false);
			costMajor = mpCost(Skill.get("Grill"));
		}
		else if (enemy.physicalResistance >= 50)
		{

			if (monsterElement(enemy) !== Element.get("sleaze") && canUse$1(Skill.get("Fry"), false))
			{
				attackMajor = useSkill$1(Skill.get("Fry"), false);
				costMajor = mpCost(Skill.get("Fry"));
			}
			else if (canUse$1(Skill.get("Grill"), false))
			{
				attackMajor = useSkill$1(Skill.get("Grill"), false);
				costMajor = mpCost(Skill.get("Grill"));
			}
		}
		break;
	case Class.get("Avatar of Sneaky Pete"):
		if (canUse$1(Skill.get("Pop Wheelie"), false))
		{
			attackMajor = useSkill$1(Skill.get("Pop Wheelie"), false);
			costMajor = mpCost(Skill.get("Pop Wheelie"));
		}
		if (canUse$2(Skill.get("Smoke Break")) && enemy.physicalResistance >= 80)
		{
			attackMinor = useSkill$2(Skill.get("Smoke Break"));
			attackMajor = useSkill$2(Skill.get("Smoke Break"));
			costMinor = mpCost(Skill.get("Smoke Break"));
			costMajor = mpCost(Skill.get("Smoke Break"));
		}
		else if (canUse$2(Skill.get("Flash Headlight")) && enemy.physicalResistance >= 80 && (getProperty("peteMotorbikeHeadlight") === "Party Bulb" || getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb" && monsterElement(enemy) !== Element.get("sleaze")))
		{
			attackMinor = useSkill$2(Skill.get("Flash Headlight"));
			attackMajor = useSkill$2(Skill.get("Flash Headlight"));
			costMinor = mpCost(Skill.get("Flash Headlight"));
			costMajor = mpCost(Skill.get("Flash Headlight"));
		}
		else if (canUse$3(Item.get("firebomb"), false) && enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("hot"))
		{
			attackMinor = useItem(Item.get("firebomb"), false);
			attackMajor = useItem(Item.get("firebomb"), false);
			costMinor = 0;
			costMajor = 0;
		}
		break;
	case Class.get("Accordion Thief"):
		if (canUse$2(Skill.get("Cadenza")) && itemType(equippedItem(Slot.get("weapon"))) === "accordion" && canSurvive$1(2.0))
		{
			if (Item.get(["accordion file", "alarm accordion", "autocalliope", "Bal-musette accordion", "baritone accordion", "Cajun accordion", "ghost accordion", "peace accordion", "pentatonic accordion", "pygmy concertinette", "Skipper's accordion", "Squeezebox of the Ages", "The Trickster's Trikitixa"]).includes(equippedItem(Slot.get("weapon"))))
			{
				return useSkill$2(Skill.get("Cadenza"));
			}
		}
		if (buffedHitStat() - 20 < monsterDefense() && canUse$1(Skill.get("Saucestorm"), false))
		{
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		if (enemy.physicalResistance > 80)
		{
			for (const sk of Skill.get(["Saucestorm", "Saucegeyser"]))
			{
				if (canUse$1(sk, false))
				{
					attackMinor = useSkill$1(sk, false);
					attackMajor = useSkill$1(sk, false);
					costMinor = mpCost(sk);
					costMajor = mpCost(sk);
					break;
				}
			}
		}
		break;
	case Class.get("Disco Bandit"):
		if (auto_have_skill(Skill.get("Disco State of Mind")) && auto_have_skill(Skill.get("Flashy Dancer")) && auto_have_skill(Skill.get("Disco Greed")) && auto_have_skill(Skill.get("Disco Bravado")) && stunnable(enemy) && monsterLevelAdjustment() < 150)
		{
			const mpRegen: number = (numericModifier("MP Regen Min") + numericModifier("MP Regen Max")) / 2;
			let netCost: number = 0;

			for (const dance of Skill.get(["Disco Dance of Doom", "Disco Dance II: Electric Boogaloo", "Disco Dance 3: Back in the Habit"]))
			{
				netCost += mpCost(dance);
				if (canUse$2(dance) && mpRegen > netCost * 2)
				{
					return useSkill$2(dance);
				}
			}
		}
		if (buffedHitStat() - 20 < monsterDefense() && canUse$1(Skill.get("Saucestorm"), false))
		{
			attackMajor = useSkill$1(Skill.get("Saucestorm"), false);
			costMajor = mpCost(Skill.get("Saucestorm"));
		}
		if (enemy.physicalResistance > 80)
		{
			for (const sk of Skill.get(["Saucestorm", "Saucegeyser"]))
			{
				if (canUse$1(sk, false))
				{
					attackMinor = useSkill$1(sk, false);
					attackMajor = useSkill$1(sk, false);
					costMinor = mpCost(sk);
					costMajor = mpCost(sk);
					break;
				}
			}
		}
		break;
	case Class.get("Cow Puncher"):
	case Class.get("Beanslinger"):
	case Class.get("Snake Oiler"):
		if (canUse$2(Skill.get("Extract Oil")) && myHp() > 80 && myMp() >= 3 * mpCost(Skill.get("Extract Oil")))
		{
			if (Monster.get(["aggressive grass snake", "bacon snake", "Batsnake", "black adder", "Burning Snake of Fire", "coal snake", "diamondback rattler", "frontwinder", "Frozen Solid Snake", "king snake", "licorice snake", "mutant rattlesnake", "prince snake", "sewer snake with a sewer snake in it", "Snakeleton", "The Snake With Like Ten Heads", "tomb asp", "Trouser Snake", "whitesnake"]).includes(enemy) && itemAmount(Item.get("snake oil")) < 4)
			{
				return useSkill$2(Skill.get("Extract Oil"));
			}
			else if (Phylum.get(["beast", "dude", "hippy", "humanoid", "orc", "pirate"]).includes(type_1) && itemAmount(Item.get("skin oil")) < 3)
			{
				return useSkill$2(Skill.get("Extract Oil"));
			}
			else if (Phylum.get(["bug", "construct", "constellation", "demon", "elemental", "elf", "fish", "goblin", "hobo", "horror", "mer-kin", "penguin", "plant", "slime", "weird"]).includes(type_1) && itemAmount(Item.get("unusual oil")) < 4)
			{
				return useSkill$2(Skill.get("Extract Oil"));
			}
			else if (Phylum.get(["undead"]).includes(type_1) && itemAmount(Item.get("eldritch oil")) < 5)
			{
				return useSkill$2(Skill.get("Extract Oil"));
			}
		}
		if (canUse$2(Skill.get("Good Medicine")) && myMp() >= 3 * mpCost(Skill.get("Good Medicine")))
		{
			return useSkill$2(Skill.get("Good Medicine"));
		}
		if (canUse$1(Skill.get("Lavafava"), false) && enemy.defenseElement !== Element.get("hot"))
		{
			attackMajor = useSkill$1(Skill.get("Lavafava"), false);
			attackMinor = useSkill$1(Skill.get("Lavafava"), false);
			costMajor = mpCost(Skill.get("Lavafava"));
			costMinor = mpCost(Skill.get("Lavafava"));
		}
		if (canUse$1(Skill.get("Beanstorm"), false))
		{
			attackMajor = useSkill$1(Skill.get("Beanstorm"), false);
			attackMinor = useSkill$1(Skill.get("Beanstorm"), false);
			costMajor = mpCost(Skill.get("Beanstorm"));
			costMinor = mpCost(Skill.get("Beanstorm"));
		}
		if (canUse$1(Skill.get("Fan Hammer"), false) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Fan Hammer"), false);
			attackMinor = useSkill$1(Skill.get("Fan Hammer"), false);
			costMajor = mpCost(Skill.get("Fan Hammer"));
			costMinor = mpCost(Skill.get("Fan Hammer"));
		}
		if (canUse$1(Skill.get("Snakewhip"), false) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Snakewhip"), false);
			attackMinor = useSkill$1(Skill.get("Snakewhip"), false);
			costMajor = mpCost(Skill.get("Snakewhip"));
			costMinor = mpCost(Skill.get("Snakewhip"));
		}
		if (canUse$1(Skill.get("Pungent Mung"), false) && enemy.defenseElement !== Element.get("stench"))
		{
			attackMajor = useSkill$1(Skill.get("Pungent Mung"), false);
			attackMinor = useSkill$1(Skill.get("Pungent Mung"), false);
			costMajor = mpCost(Skill.get("Pungent Mung"));
			costMinor = mpCost(Skill.get("Pungent Mung"));
		}
		if (canUse$1(Skill.get("Cowcall"), false) && type_1 !== Phylum.get("undead") && enemy.defenseElement !== Element.get("spooky") && (haveEffect(Effect.get("Cowrruption")) >= 60 || myClass() === Class.get("Cow Puncher")))
		{
			attackMajor = useSkill$1(Skill.get("Cowcall"), false);
			attackMinor = useSkill$1(Skill.get("Cowcall"), false);
			costMajor = mpCost(Skill.get("Cowcall"));
			costMinor = mpCost(Skill.get("Cowcall"));
		}
		break;
	case Class.get("Vampyre"):
		for (const sk of Skill.get(["Chill of the Tomb", "Blood Spike", "Piercing Gaze", "Savage Bite"]))
		{
			if (sk === Skill.get("Chill of the Tomb") && monsterElement(enemy) === Element.get("cold"))
				{ continue; }
			if (canUse$1(sk, false) && myHp() > hpCost(sk))
			{
				attackMajor = useSkill$1(sk, false);
				attackMinor = useSkill$1(sk, false);
				break;
			}
		}
		if (myHp() > 0.5 * myMaxhp() && attackMajor === useSkill$1(Skill.get("Chill of the Tomb"), false) && myLocation() === Location.get("The Smut Orc Logging Camp"))
		{
			break;
		}
		if (myHp() < myMaxhp() && (monsterHp() <= 30 || monsterHp() <= 100 && auto_have_skill(Skill.get("Hypnotic Eyes"))) && canUse$2(Skill.get("Dark Feast")))
		{
			return useSkill$2(Skill.get("Dark Feast"));
		}
		if (attackMinor === "attack with weapon" && !haveSkill(Skill.get("Preternatural Strength")) && canUse$4(Item.get("beehive")) && Stat.get("Moxie") !== weaponType(equippedItem(Slot.get("weapon"))))
		{
			attackMinor = useItem(Item.get("beehive"), false);
		}
		break;
	case Class.get("Pig Skinner"):
		attackMinor = "attack with weapon";
		if (canUse$1(Skill.get("Ball Throw"), true) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Ball Throw"), true);
			attackMinor = useSkill$1(Skill.get("Ball Throw"), true);
			costMajor = mpCost(Skill.get("Ball Throw"));
			costMinor = mpCost(Skill.get("Ball Throw"));
		}
		if (canUse$1(Skill.get("Hot Foot"), true) && enemy.defenseElement !== Element.get("hot") && !enemyCanBlocksSkills())
		{
			attackMajor = useSkill$1(Skill.get("Hot Foot"), true);
			attackMinor = useSkill$1(Skill.get("Hot Foot"), true);
			costMajor = mpCost(Skill.get("Hot Foot"));
			costMinor = mpCost(Skill.get("Hot Foot"));
		}
		if (canUse$1(Skill.get("Stop Hitting Yourself"), true) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Stop Hitting Yourself"), true);
			attackMinor = useSkill$1(Skill.get("Stop Hitting Yourself"), true);
			costMajor = mpCost(Skill.get("Stop Hitting Yourself"));
			costMinor = mpCost(Skill.get("Stop Hitting Yourself"));
		}
		if (myHp() / 0.5 < myMaxhp() && canUse$1(Skill.get("Second Wind"), true))
		{
			attackMajor = useSkill$1(Skill.get("Second Wind"), true);
			attackMinor = useSkill$1(Skill.get("Second Wind"), true);
			costMajor = mpCost(Skill.get("Second Wind"));
			costMinor = mpCost(Skill.get("Second Wind"));
		}
		break;
	case Class.get("Cheese Wizard"):
		attackMinor = "attack with weapon";
		if (canUse$2(Skill.get("Parmesan Missile")))
		{
			attackMajor = useSkill$1(Skill.get("Parmesan Missile"), false);
			attackMinor = useSkill$1(Skill.get("Parmesan Missile"), false);
			costMajor = mpCost(Skill.get("Parmesan Missile"));
			costMinor = mpCost(Skill.get("Parmesan Missile"));
		}
		if (canUse$2(Skill.get("Crack Knuckles")) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Crack Knuckles"), true);
			attackMinor = useSkill$1(Skill.get("Crack Knuckles"), true);
			costMajor = mpCost(Skill.get("Crack Knuckles"));
			costMinor = mpCost(Skill.get("Crack Knuckles"));
		}
		if (canUse$1(Skill.get("Mind Melt"), true))
		{
			attackMajor = useSkill$1(Skill.get("Mind Melt"), true);
			attackMinor = useSkill$1(Skill.get("Mind Melt"), true);
			costMajor = mpCost(Skill.get("Mind Melt"));
			costMinor = mpCost(Skill.get("Mind Melt"));
		}
		if (canUse$1(Skill.get("Stilton Splatter"), true) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Stilton Splatter"), true);
			attackMinor = useSkill$1(Skill.get("Stilton Splatter"), true);
			costMajor = mpCost(Skill.get("Stilton Splatter"));
			costMinor = mpCost(Skill.get("Stilton Splatter"));
		}
		if (canUse$1(Skill.get("Emmental Elemental"), true) && myHp() / 0.7 < myMaxhp())
		{
			attackMajor = useSkill$1(Skill.get("Emmental Elemental"), true);
			attackMinor = useSkill$1(Skill.get("Emmental Elemental"), true);
			costMajor = mpCost(Skill.get("Emmental Elemental"));
			costMinor = mpCost(Skill.get("Emmental Elemental"));
		}
		break;
	case Class.get("Jazz Agent"):
		attackMinor = "attack with weapon";
		if (canUse$1(Skill.get("Orchestra Strike"), false) && enemy.physicalResistance < 80)
		{
			attackMajor = useSkill$1(Skill.get("Orchestra Strike"), false);
			attackMinor = useSkill$1(Skill.get("Orchestra Strike"), false);
			costMajor = mpCost(Skill.get("Orchestra Strike"));
			costMinor = mpCost(Skill.get("Orchestra Strike"));
		}
		if (canUse$1(Skill.get("Sax of Violence"), false) && enemy.defenseElement !== Element.get("sleaze"))
		{
			attackMajor = useSkill$1(Skill.get("Sax of Violence"), false);
			attackMinor = useSkill$1(Skill.get("Sax of Violence"), false);
			costMajor = mpCost(Skill.get("Sax of Violence"));
			costMinor = mpCost(Skill.get("Sax of Violence"));
		}
		if (canUse$1(Skill.get("Venomous Riff"), true))
		{
			attackMajor = useSkill$1(Skill.get("Venomous Riff"), true);
			attackMinor = useSkill$1(Skill.get("Venomous Riff"), true);
			costMajor = mpCost(Skill.get("Venomous Riff"));
			costMinor = mpCost(Skill.get("Venomous Riff"));
		}
		if (canUse$1(Skill.get("Knife In The Darkness"), true) && zone_combatMod(myLocation())._int < 0)
		{
			attackMajor = useSkill$1(Skill.get("Knife In The Darkness"), true);
			attackMinor = useSkill$1(Skill.get("Knife In The Darkness"), true);
			costMajor = mpCost(Skill.get("Knife In The Darkness"));
			costMinor = mpCost(Skill.get("Knife In The Darkness"));
		}
		if (canUse(Skill.get("Grit Teeth"), false, true) && myHp() < myMaxhp() && combat_status_check("stunned") && round_1 < 5)
		{
			attackMajor = useSkill$1(Skill.get("Grit Teeth"), true);
			attackMinor = useSkill$1(Skill.get("Grit Teeth"), true);
			costMajor = mpCost(Skill.get("Grit Teeth"));
			costMinor = mpCost(Skill.get("Grit Teeth"));
		}
		break;
	case Class.get("Zootomist"):		punch = getZooBestPunch$1(enemy);
		if (punch === Skill.none)
		{
			return "attack with weapon";
		}
		attackMajor = useSkill$1(punch, false);
		attackMinor = useSkill$1(punch, false);
		costMajor = mpCost(punch);
		costMinor = mpCost(punch);
		break;
	} } // class attack selection

	if (myHp() * 10 / 3 < myMaxhp())
	{
		if (canUse$2(Skill.get("Thunderstrike")) && monsterLevelAdjustment() <= 150)
		{
			return useSkill$2(Skill.get("Thunderstrike"));
		}

		if (canUse$2(Skill.get("Unleash the Greash")) && monsterElement(enemy) !== Element.get("sleaze") && haveEffect(Effect.get("Takin' It Greasy")) > 100)
		{
			return useSkill$2(Skill.get("Unleash the Greash"));
		}
		if (canUse$2(Skill.get("Thousand-Yard Stare")) && monsterElement(enemy) !== Element.get("spooky") && haveEffect(Effect.get("Intimidating Mien")) > 100)
		{
			return useSkill$2(Skill.get("Thousand-Yard Stare"));
		}
		if (Monster.get(["Aquagoblin", "Lord Soggyraven", "Groar", "The Big Wisniewski", "The Man"]).includes(enemy) && myMp() >= costMajor)
		{
			return attackMajor;
		}
		if (myClass() === Class.get("Turtle Tamer") && canUse$2(Skill.get("Spirit Snap")))
		{
			if (haveEffect(Effect.get("Blessing of the Storm Tortoise")) > 0 || haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) > 0 || haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) > 0 || haveEffect(Effect.get("Glorious Blessing of the War Snapper")) > 0 || haveEffect(Effect.get("Glorious Blessing of She-Who-Was")) > 0)
			{
				return useSkill$2(Skill.get("Spirit Snap"));
			}
		}
		if (canUse$2(Skill.get("Northern Explosion")) && !auto_canNorthernExplosionFE() && myClass() === Class.get("Seal Clubber") && monsterElement(enemy) !== Element.get("cold") && (hasClubEquipped() || buffedHitStat() - 20 > monsterDefense()))
		{
			return useSkill$2(Skill.get("Northern Explosion"));
		}
		if (!combat_status_check("last attempt") && myMp() >= costMajor)
		{
			if (canSurvive$1(1.4))
			{
				combat_status_add("last attempt");
				auto_log_warning("Uh oh, I'm having trouble in combat.", "red");
			}
			return attackMajor;
		}
		if (canSurvive$1(2.5))
		{
			auto_log_warning("Hmmm, I don't really know what to do in this combat but it looks like I'll live.", "red");
			if (myMp() >= costMajor)
			{
				return attackMajor;
			}
			else if (myMp() >= costMinor)
			{
				return attackMinor;
			}
			return "attack with weapon";
		}
		if (myLocation() !== Location.get("The Slime Tube"))
		{
			abort("Could not handle monster, sorry");
		}
	}
	if (monsterLevelAdjustment() > 150 && myMp() >= 45 && canUse$2(Skill.get("Shell Up")) && myClass() === Class.get("Turtle Tamer"))
	{
		return useSkill$2(Skill.get("Shell Up"));
	}

	if (enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("cold") && canUse$1(Skill.get("Throat Refrigerant"), false))
	{
		return useSkill$1(Skill.get("Throat Refrigerant"), false);
	}

	if (enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("hot") && canUse$1(Skill.get("Boiling Tear Ducts"), false))
	{
		return useSkill$1(Skill.get("Boiling Tear Ducts"), false);
	}

	if (enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("sleaze") && canUse$2(Skill.get("Projectile Salivary Glands")))
	{
		return useSkill$2(Skill.get("Projectile Salivary Glands"));
	}

	if (enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("spooky") && canUse$1(Skill.get("Translucent Skin"), false))
	{
		return useSkill$1(Skill.get("Translucent Skin"), false);
	}

	if (enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("stench") && canUse$1(Skill.get("Skunk Glands"), false))
	{
		return useSkill$1(Skill.get("Skunk Glands"), false);
	}
	// final check for physically immune monsters we are planning on simply attacking
	// determine if attacking will deal reasonable damage
	// note preadv *should* ensure we can damage physically immune monsters via a spell or attack
	// this check could be redundant. If preadv worked as intended and we haven't picked a spell yet, attack should deal damage
	if (enemy.physicalResistance >= 80 && attackMinor === "attack with weapon")
	{
		const success: boolean = false;
		let m_hot: number = 1;
		let m_cold: number = 1;
		let m_spooky: number = 1;
		let m_sleaze: number = 1;
		let m_stench: number = 1;
		switch (monsterElement(enemy))
		{
			case Element.get("hot"):
				m_hot = 0;
				m_sleaze = 2;
				m_stench = 2;
				break;
			case Element.get("cold"):
				m_cold = 0;
				m_hot = 2;
				m_spooky = 2;
				break;
			case Element.get("spooky"):
				m_spooky = 0;
				m_hot = 2;
				m_stench = 2;
				break;
			case Element.get("sleaze"):
				m_sleaze = 0;
				m_cold = 2;
				m_spooky = 2;
				break;
			case Element.get("stench"):
				m_stench = 0;
				m_sleaze = 2;
				m_cold = 2;
				break;
		}

		const elementalDamage: number = toInt(m_hot * numericModifier("hot damage") + m_cold * numericModifier("cold damage") + m_spooky * numericModifier("spooky damage") + m_sleaze * numericModifier("sleaze damage") + m_stench * numericModifier("stench damage"));
		// try to kill within 5 turns
		if (elementalDamage * 5 < monsterHp())
		{
			abort("I am fighting a physically immune monster and I do not know how to kill it");
		}
	}
	// Wu Tang the Betrayer is immune to spells and normal attacks, but not Fist skills or Spectral Snapper
	if (enemy === Monster.get("Wu Tang the Betrayer")) {
		for (const sk of Skill.get(["Spectral Snapper", "Stinkpalm", "Drunken Baby Style", "Zendo Kobushi Kancho", "Chilled Monkey Brain Technique", "Knuckle Sandwich", "Seven-Finger Strike", "Flying Fire Fist"])) {
			if (canUse$1(sk, false))
			{
				return useSkill$1(sk, false);
			}
		}
		abort("Wu Tang the Betrayer is immune to spells and normal attacks, and I do not know how to kill him");
	}

	if (myLocation() === Location.get("The X-32-F Combat Training Snowman") && containsText(text, "Cattle Prod") && myMp() >= costMajor)
	{
		return attackMajor;
	}

	if (monsterLevelAdjustment() > 150 && myMp() >= costMajor && attackMajor !== "attack with weapon")
	{
		return attackMajor;
	}

	if (Monster.get(["Aquagoblin", "Lord Soggyraven", "Groar", "The Big Wisniewski", "The Man"]).includes(enemy) && myMp() >= costMajor)
	{
		return attackMajor;
	}

	if (canUse$1(Skill.get("Lunge Smack"), false) && attackMinor !== "attack with weapon" && weaponType(equippedItem(Slot.get("weapon"))) === Stat.get("Muscle"))
	{
		return attackMinor;
	}
	if (myMp() >= costMinor && attackMinor !== "attack with weapon")
	{
		return attackMinor;
	}

	if (round_1 > 20 && canUse$1(Skill.get("Saucestorm"), false))
	{
		return useSkill$1(Skill.get("Saucestorm"), false);
	}

	if (attackMinor === "attack with weapon" && monsterDefense() > 20 && buffedHitStat() - 20 < monsterDefense() && canUse$1(Skill.get("Saucestorm"), false))
	{
		return useSkill$1(Skill.get("Saucestorm"), false);
	}

	return attackMinor;
}