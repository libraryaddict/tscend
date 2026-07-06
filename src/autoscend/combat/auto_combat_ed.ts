import { abort, containsText, Effect, Element, equippedItem, expectedDamage, getProperty, haveEffect, haveEquipped, indexOf, Item, itemAmount, Location, Monster, monsterAttack, monsterDefense, monsterHp, monsterLevelAdjustment, mpCost, myAscensions, myBuffedstat, myDaycount, myHp, myLevel, myLocation, myMaxhp, myMaxmp, myMp, Phylum, removeProperty, setProperty, Skill, Slot, Stat, substring, toBoolean, toFamiliar, toFloat, toInt, toItem, toLowerCase, toMonster, toSkill, weaponType } from "kolmafia";
import { possessEquipment } from "../auto_equipment";
import { auto_have_skill, auto_log_error, auto_log_info, auto_log_warning, auto_wantToBanish, auto_wantToFreeRun, auto_wantToReplace, auto_wantToSniff, auto_wantToYellowRay, freeRunCombatString, handleTracker, handleTracker$1, instakillable, internalQuestStatus, isFreeMonster$1, isGhost, loopHandlerDelayAll } from "../auto_util";
import { banisherCombatString$1, canSurvive$1, canUse$1, canUse$2, canUse$3, canUse$4, combat_status_add, combat_status_check, getStunner, markAsUsed, replaceMonsterCombatString, usedCount, useItem, useItem$1, useItems$1, useSkill$1, useSkill$2, wantToForceDrop, yellowRayCombatString } from "./auto_combat_util";
import { elementalPlanes_access } from "../iotms/elementalPlanes";
import { auto_spoonCombatSkill } from "../iotms/mr2019";
import { auto_backupTarget, auto_fireExtinguisherCharges, auto_FireExtinguisherCombatString } from "../iotms/mr2021";
import { auto_bowlingBallCombatString } from "../iotms/mr2022";
import { dartELRcd, dartSkill } from "../iotms/mr2024";
import { ed_needShop, isActuallyEd } from "../paths/actually_ed_the_undying";
import { cyrptEvilBonus } from "../quests/level_07";
import { fastenerCount, lumberCount } from "../quests/level_09";

//Path specific combat handling for Actually Ed the Undying

//defined in /autoscend/combat/auto_combat_ed.ash
export function auto_edCombatHandler(round_1: number, enemy: Monster, text: string): string
{
	const blocked: boolean = containsText(text, "(STUN RESISTED)");
	let damageReceived: number = 0;
	if (!isActuallyEd())
	{
		abort("Not in Actually Ed the Undying, this combat filter will result in massive suckage.");
	}

	if (round_1 === 0)
	{
		removeProperty("_auto_combatState");
		if (toInt(getProperty("_edDefeats")) === 0)
		{
			setProperty("auto_edCombatCount", (1 + toInt(getProperty("auto_edCombatCount"))).toString());
		}
		if (!ed_needShop())
		{
			setProperty("auto_edStatus", "dying"); // dying means kill the monster
		}
		else {
			setProperty("auto_edStatus", "UNDYING!"); //  Undying means ressurect until it's not free any more
		}
		//log some important info.
		//some stuff is redundant to the pre_adventure function print_footer() so it will not be logged here
		auto_log_info(`auto_combat initialized fighting [${enemy}]: atk = ${monsterAttack()}. def = ${monsterDefense()}. HP = ${monsterHp()}. LA = ${monsterLevelAdjustment()}`, "blue");
	}
	else {
		damageReceived = toInt(getProperty("auto_combatHP")) - myHp();
		setProperty("auto_combatHP", myHp().toString());
	}

	setProperty("auto_edCombatRoundCount", (1 + toInt(getProperty("auto_edCombatRoundCount"))).toString());

	if (Location.get(["The Hippy Camp", "The Outskirts of Cobb's Knob", "The Spooky Forest"]).includes(myLocation()))
	{
		if (myMp() < mpCost(Skill.get("Fist of the Mummy")) && toInt(getProperty("_edDefeats")) < 2)
		{
			for (const it of Item.get(["holy spring water", "spirit beer", "sacramental wine"]))
			{
				if (canUse$4(it))
				{
					return useItem(it, false);
				}
			}
		}
	}

	if (toInt(getProperty("_edDefeats")) >= 2)
	{
		setProperty("auto_edStatus", "dying");
	}

	if (round_1 > 60)
	{
		abort("Somehow got to 60 rounds.... aborting");
	}

	if (Monster.get(["LOV Enforcer", "LOV Engineer", "LOV Equivocator"]).includes(enemy))
	{
		setProperty("auto_edStatus", "dying");
	}

	if (auto_backupTarget() && enemy !== toMonster(getProperty("lastCopyableMonster")) && canUse$2(Skill.get("Back-Up to your Last Enemy")))
	{
		handleTracker$1(enemy.toString(), Skill.get("Back-Up to your Last Enemy").toString(), "auto_replaces");
		handleTracker$1(toMonster(getProperty("lastCopyableMonster")).toString(), Skill.get("Back-Up to your Last Enemy").toString(), "auto_copies");
		return useSkill$2(Skill.get("Back-Up to your Last Enemy"));
	}

	if (haveEffect(Effect.get("Temporary Amnesia")) > 0)
	{
		return "attack with weapon";
	}

	if (canUse$2(Skill.get("Pocket Crumbs")))
	{
		return useSkill$2(Skill.get("Pocket Crumbs"));
	}

	if (canUse$2(Skill.get("Micrometeorite")))
	{
		return useSkill$2(Skill.get("Micrometeorite"));
	}

	if (canUse$2(Skill.get("Air Dirty Laundry")))
	{
		return useSkill$2(Skill.get("Air Dirty Laundry"));
	}

	if (canUse$2(Skill.get("Summon Love Scarabs")))
	{
		return useSkill$2(Skill.get("Summon Love Scarabs"));
	}

	if (canUse$4(Item.get("Time-Spinner")))
	{
		return useItem$1(Item.get("Time-Spinner"));
	}

	if (canUse$2(Skill.get("Sing Along")))
	{
		//ed can easily survive singing along thanks to undying. and healing him is essentially free.
		if (getProperty("boomBoxSong") === "Remainin' Alive" || getProperty("boomBoxSong") === "Total Eclipse of Your Meat" && canSurvive$1(2.0))
		{
			return useSkill$2(Skill.get("Sing Along"));
		}
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
			const survive_needed: number = 3.05 - toFloat(shots_takens);
			if (canSurvive$1(survive_needed))
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
	//use industrial fire extinguisher zone specific skills
	const extinguisherSkill: string = auto_FireExtinguisherCombatString(myLocation());
	if (extinguisherSkill !== "" && haveEquipped(Item.get("industrial fire extinguisher")))
	{
		handleTracker$1(enemy.toString(), toSkill(substring(extinguisherSkill, 6)).toString(), "auto_otherstuff");
		return extinguisherSkill;
	}
	// Instakill handler
	let doInstaKill: boolean = true;
	if (Monster.get(["lobsterfrogman"]).includes(enemy))
	{
		if (auto_have_skill(Skill.get("Digitize")) && getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString())
		{
			doInstaKill = false;
		}
	}

	if (getProperty("auto_edStatus") === "UNDYING!")
	{
		if (canUse$2(Skill.get("Summon Love Gnats")))
		{
			return useSkill$2(Skill.get("Summon Love Gnats"));
		}
	}
	else if (getProperty("auto_edStatus") === "dying")
	{
		let doStunner: boolean = true;

		if (monsterLevelAdjustment() > 50 && canSurvive$1(1.15))
		{
			doStunner = false;
		}

		if (doStunner)
		{
			if (canUse$2(Skill.get("Summon Love Gnats")))
			{
				return useSkill$2(Skill.get("Summon Love Gnats"));
			}
		}
	}
	else {
		auto_log_warning("Ed combat state does not exist, winging it....", "red");
	}

	if (canUse$2(Skill.get("Fire Sewage Pistol")))
	{
		return useSkill$2(Skill.get("Fire Sewage Pistol"));
	}

	if (enemy === Monster.get("Protagonist"))
	{
		setProperty("auto_edStatus", "dying");
	}

	if (myLocation() !== Location.get("The Battlefield (Frat Uniform)") && myLocation() !== Location.get("The Battlefield (Hippy Uniform)") && !toBoolean(getProperty("auto_ignoreFlyer")))
	{
		if (canUse$4(Item.get("rock band flyers")) && toInt(getProperty("flyeredML")) < 10000)
		{
			if (toInt(getProperty("_edDefeats")) < 2 && getProperty("auto_edStatus") === "dying")
			{
				setProperty("auto_edStatus", "UNDYING!");
				// abuse the ability to flyer the same monster multiple times (optimal!)
			}
			return useItem$1(Item.get("rock band flyers"));
		}
		if (canUse$4(Item.get("jam band flyers")) && toInt(getProperty("flyeredML")) < 10000)
		{
			if (toInt(getProperty("_edDefeats")) < 2 && getProperty("auto_edStatus") === "dying")
			{
				setProperty("auto_edStatus", "UNDYING!");
				// abuse the ability to flyer the same monster multiple times (optimal!)
			}
			return useItem$1(Item.get("jam band flyers"));
		}
	}

	if (canUse$4(Item.get("chaos butterfly")) && !toBoolean(getProperty("chaosButterflyThrown")) && !toBoolean(getProperty("auto_skipL12Farm")))
	{
		return useItem$1(Item.get("chaos butterfly"));
	}

	if (enemy === Monster.get("dirty thieving brigand") && canUse$2(Skill.get("Curse of Fortune")))
	{
		if (itemAmount(Item.get("Ka coin")) > 0 && myHp() > expectedDamage() + 15)
		{
			// need to kill the monster without resurrecting to get the bonus meat drop so only use it if we have enough HP to survive a hit
			setProperty("auto_edStatus", "dying");
			return useSkill$2(Skill.get("Curse of Fortune"));
		}
		else if (toInt(getProperty("_edDefeats")) === 0 && myMaxhp() > expectedDamage() + 15)
		{
			// suicide to get a full heal, maybe we can Curse and kill after resurrection
			setProperty("auto_edStatus", "UNDYING!");
		}
	}

	if (canUse$2(Skill.get("Curse of Stench")) && toMonster(getProperty("stenchCursedMonster")) !== enemy && toInt(getProperty("_edDefeats")) < 3)
	{
		if (auto_wantToSniff(enemy, myLocation()))
		{
			handleTracker$1(enemy.toString(), Skill.get("Curse of Stench").toString(), "auto_sniffs");
			return useSkill$2(Skill.get("Curse of Stench"));
		}
	}

	if (myLocation() === Location.get("The Secret Council Warehouse"))
	{
		if (canUse$2(Skill.get("Curse of Stench")) && toMonster(getProperty("stenchCursedMonster")) !== enemy && toInt(getProperty("_edDefeats")) < 3)
		{
			let doStench: boolean = false;
			//	Rememeber, we are looking to see if we have enough of the opposite item here.
			if (enemy === Monster.get("warehouse guard"))
			{
				let progress: number = toInt(getProperty("warehouseProgress"));
				progress = progress + 8 * itemAmount(Item.get("warehouse inventory page"));
				if (progress >= 50)
				{
					doStench = true;
				}
			}

			if (enemy === Monster.get("warehouse clerk"))
			{
				let progress: number = toInt(getProperty("warehouseProgress"));
				progress = progress + 8 * itemAmount(Item.get("warehouse map page"));
				if (progress >= 50)
				{
					doStench = true;
				}
			}
			if (doStench)
			{
				handleTracker$1(enemy.toString(), Skill.get("Curse of Stench").toString(), "auto_sniffs");
				return useSkill$2(Skill.get("Curse of Stench"));
			}
		}
	}

	if (myLocation() === Location.get("The Smut Orc Logging Camp"))
	{
		if (canUse$2(Skill.get("Curse of Stench")) && toMonster(getProperty("stenchCursedMonster")) !== enemy && toInt(getProperty("_edDefeats")) < 3)
		{
			let doStench: boolean = false;
			const stenched: string = toLowerCase(getProperty("stenchCursedMonster"));

			if (fastenerCount() >= 30 && stenched !== "smut orc pipelayer" && stenched !== "smut orc jacker")
			{
				//	Sniff 100% lumber
				if (enemy === Monster.get("smut orc pipelayer") || enemy === Monster.get("smut orc jacker"))
				{
					doStench = true;
				}
			}
			if (lumberCount() >= 30 && stenched !== "smut orc screwer" && stenched !== "smut orc nailer")
			{
				//	Sniff 100% fastener
				if (enemy === Monster.get("smut orc screwer") || enemy === Monster.get("smut orc nailer"))
				{
					doStench = true;
				}
			}

			if (doStench)
			{
				handleTracker$1(enemy.toString(), Skill.get("Curse of Stench").toString(), "auto_sniffs");
				return useSkill$2(Skill.get("Curse of Stench"));
			}
		}
	}
	//yellowray instantly kills the enemy and makes them drop all items they can drop.
	if (!combat_status_check("yellowray") && auto_wantToYellowRay(enemy, myLocation()))
	{
		const combatAction: string = yellowRayCombatString(enemy, true, Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal", "knight (Snake)"]).includes(enemy));
		if (combatAction !== "")
		{
			combat_status_add("yellowray");
			if (indexOf(combatAction, "skill") === 0)
			{
				handleTracker$1(enemy.toString(), toSkill(substring(combatAction, 6)).toString(), "auto_yellowRays");
			}
			else if (indexOf(combatAction, "item") === 0)
			{
				handleTracker$1(enemy.toString(), toItem(substring(combatAction, 5)).toString(), "auto_yellowRays");
			}
			else {
				auto_log_warning(`Unable to track yellow ray behavior: ${combatAction}`, "red");
			}
			if (combatAction === useSkill$1(Skill.get("Asdon Martin: Missile Launcher"), false))
			{
				setProperty("_missileLauncherUsed", true.toString());
			}
			return combatAction;
		}
		else {
			auto_log_warning("Wanted a yellow ray but we can not find one.", "red");
		}
	}

	if (!combat_status_check("banishercheck") && auto_wantToBanish(enemy, myLocation()))
	{
		const banishAction: string = banisherCombatString$1(enemy, myLocation(), true);
		if (banishAction !== "")
		{
			auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
			combat_status_add("banisher");
			if (indexOf(banishAction, "skill") === 0)
			{
				handleTracker$1(enemy.toString(), toSkill(substring(banishAction, 6)).toString(), "auto_banishes");
			}
			else if (indexOf(banishAction, "item") === 0)
			{
				if (containsText(banishAction, ", none"))
				{
					const commapos: number = indexOf(banishAction, ", none");
					handleTracker$1(enemy.toString(), toItem(substring(banishAction, 5, commapos)).toString(), "auto_banishes");
				}
				else {
					handleTracker$1(enemy.toString(), toItem(substring(banishAction, 5)).toString(), "auto_banishes");
				}
			}
			else {
				auto_log_warning(`Unable to track banisher behavior: ${banishAction}`, "red");
			}
			return banishAction;
		}
		//we wanted to banish an enemy and failed. set a property so we do not bother trying in subsequent rounds
		combat_status_add("banishercheck");
	}
	// Free run from monsters we want to banish but are unable to, or monsters on the free run list
	if (!combat_status_check("freeruncheck") && (auto_wantToFreeRun(enemy, myLocation()) || auto_wantToBanish(enemy, myLocation())))
	{
		let freeRunAction: string = freeRunCombatString(enemy, myLocation(), true);
		if (freeRunAction !== "")
		{
			if (indexOf(freeRunAction, "runaway familiar") === 0)
			{
				handleTracker$1(enemy.toString(), toFamiliar(substring(freeRunAction, 17)).toString(), "auto_freeruns");
				freeRunAction = "runaway";
			}
			else if (indexOf(freeRunAction, "runaway item") === 0)
			{
				handleTracker$1(enemy.toString(), toItem(substring(freeRunAction, 13)).toString(), "auto_freeruns");
				freeRunAction = "runaway";
			}
			else if (indexOf(freeRunAction, "skill") === 0)
			{
				handleTracker$1(enemy.toString(), toSkill(substring(freeRunAction, 6)).toString(), "auto_freeruns");
			}
			else if (indexOf(freeRunAction, "item") === 0)
			{
				if (containsText(freeRunAction, ", none"))
				{
					const commapos: number = indexOf(freeRunAction, ", none");
					handleTracker$1(enemy.toString(), toItem(substring(freeRunAction, 5, commapos)).toString(), "auto_freeruns");
				}
				else {
					handleTracker$1(enemy.toString(), toItem(substring(freeRunAction, 5)).toString(), "auto_freeruns");
				}
			}
			else {
				auto_log_warning(`Unable to track runaway behavior: ${freeRunAction}`, "red");
			}
			return freeRunAction;
		}
		//we wanted to free run an enemy and failed. set a property so we do not bother trying in subsequent rounds
		combat_status_add("freeruncheck");
	}

	if (!combat_status_check("replacercheck") && auto_wantToReplace(enemy, myLocation()))
	{
		const combatAction: string = replaceMonsterCombatString(enemy, true);
		if (combatAction !== "")
		{
			combat_status_add("replacer");
			if (indexOf(combatAction, "skill") === 0)
			{
				if (toSkill(substring(combatAction, 6)) === Skill.get("CHEAT CODE: Replace Enemy"))
				{
					handleTracker(Skill.get("CHEAT CODE: Replace Enemy").toString(), "auto_powerfulglove");
				}
				handleTracker$1(enemy.toString(), toSkill(substring(combatAction, 6)).toString(), "auto_replaces");
			}
			else if (indexOf(combatAction, "item") === 0)
			{
				handleTracker$1(enemy.toString(), toItem(substring(combatAction, 5)).toString(), "auto_replaces");
			}
			else {
				auto_log_warning(`Unable to track replacer behavior: ${combatAction}`, "red");
			}
			return combatAction;
		}
		else {
			auto_log_warning("Wanted a replacer but we can not find one.", "red");
		}
		combat_status_add("replacercheck");
	}

	if (canUse$4(Item.get("disposable instant camera")) && Monster.get(["Bob Racecar", "Racecar Bob"]).includes(enemy))
	{
		return useItem$1(Item.get("disposable instant camera"));
	}

	if (myLocation() === Location.get("Oil Peak") && canUse$4(Item.get("Duskwalker syringe")))
	{
		const oilProgress: number = toInt(getProperty("twinPeakProgress"));
		let wantCrude: boolean = (oilProgress & 4) === 0;
		if (itemAmount(Item.get("bubblin' crude")) > 11 || itemAmount(Item.get("jar of oil")) > 0)
		{
			wantCrude = false;
		}

		if (wantCrude)
		{
			return useItem$1(Item.get("Duskwalker syringe"));
		}
	}

	if (canUse$4(Item.get("glark cable")) && myLocation() === Location.get("The Red Zeppelin") && internalQuestStatus("questL11Ron") === 3 && toInt(getProperty("_glarkCableUses")) < 5 && getProperty("auto_edStatus") === "dying")
	{
		if (Monster.get(["man with the red buttons", "red butler", "Red Fox", "red skeleton"]).includes(enemy))
		{
			return useItem$1(Item.get("glark cable"));
			// free insta-kill (optimal!)
		}
	}

	if (!toBoolean(getProperty("edUsedLash")) && canUse$2(Skill.get("Lash of the Cobra")) && toInt(getProperty("_edLashCount")) < 30)
	{
		let doLash: boolean = false;
		if (enemy === Monster.get("shadow slab"))
		{
			doLash = true;
		}
		if (enemy === Monster.get("Big Wheelin' Twins") && !possessEquipment(Item.get("badge of authority")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("fishy pirate") && !possessEquipment(Item.get("perfume-soaked bandana")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("funky pirate") && !possessEquipment(Item.get("sewage-clogged pistol")) && elementalPlanes_access(Element.get("spooky")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("garbage tourist") && itemAmount(Item.get("bag of park garbage")) === 0)
		{
			doLash = true;
		}
		if (enemy === Monster.get("dairy goat") && itemAmount(Item.get("goat cheese")) < 3)
		{
			doLash = true;
		}
		if (enemy === Monster.get("monstrous boiler") && itemAmount(Item.get("red-hot boilermaker")) < 1 && toInt(getProperty("booPeakProgress")) > 0)
		{
			doLash = true;
		}
		if (enemy === Monster.get("Fitness Giant") && itemAmount(Item.get("pec oil")) < 1 && toInt(getProperty("booPeakProgress")) > 0)
		{
			doLash = true;
		}
		if (enemy === Monster.get("Renaissance Giant") && itemAmount(Item.get("Ye Olde Meade")) < 1)
		{
			doLash = true;
		}
		if (Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy))
		{
			doLash = true;
		}
		if (Monster.get(["beanbat", "bookbat"]).includes(enemy))
		{
			doLash = true;
		}
		if ((enemy === Monster.get("toothy sklelton") || enemy === Monster.get("spiny skelelton")) && toInt(getProperty("cyrptNookEvilness")) > 14 + cyrptEvilBonus(true))
		{
			doLash = true;
		}
		if (enemy === Monster.get("oil baron") && itemAmount(Item.get("bubblin' crude")) < 12 && itemAmount(Item.get("jar of oil")) === 0)
		{
			doLash = true;
		}
		if (enemy === Monster.get("blackberry bush") && itemAmount(Item.get("blackberry")) < 3 && !possessEquipment(Item.get("blackberry galoshes")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("pygmy bowler") && toInt(getProperty("_edLashCount")) < 26)
		{
			doLash = true;
		}
		if (Monster.get(["filthworm drone", "filthworm royal guard", "larval filthworm"]).includes(enemy))
		{
			doLash = true;
		}
		if (enemy === Monster.get("Knob Goblin Madam"))
		{
			if (itemAmount(Item.get("Knob Goblin perfume")) === 0)
			{
				doLash = true;
			}
		}
		if (enemy === Monster.get("Knob Goblin Harem Girl"))
		{
			if (!possessEquipment(Item.get("Knob Goblin harem veil")) || !possessEquipment(Item.get("Knob Goblin harem pants")))
			{
				doLash = true;
			}
		}
		if ((myLocation() === Location.get("The Hippy Camp") || myLocation() === Location.get("Wartime Hippy Camp")) && containsText(enemy.toString(), "hippy") && myLevel() >= 12)
		{
			if (!possessEquipment(Item.get("filthy knitted dread sack")) || !possessEquipment(Item.get("filthy corduroys")))
			{
				if (getProperty("auto_edStatus") !== "dying")
				{
					doLash = true;
				}
			}
		}
		if (myLocation() === Location.get("Wartime Frat House"))
		{
			if (!possessEquipment(Item.get("beer helmet")) || !possessEquipment(Item.get("bejeweled pledge pin")) || !possessEquipment(Item.get("distressed denim pants")))
			{
				doLash = true;
			}
		}
		if (enemy === Monster.get("dopey 7-Foot Dwarf") && !possessEquipment(Item.get("miner's helmet")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("grumpy 7-Foot Dwarf") && !possessEquipment(Item.get("7-Foot Dwarven mattock")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("sleepy 7-Foot Dwarf") && !possessEquipment(Item.get("miner's pants")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("Burly Sidekick") && !possessEquipment(Item.get("Mohawk wig")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("Spunky Princess") && !possessEquipment(Item.get("titanium assault umbrella")) && !possessEquipment(Item.get("unbreakable umbrella")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("Quiet Healer") && !possessEquipment(Item.get("amulet of extreme plot significance")))
		{
			doLash = true;
		}
		if (enemy === Monster.get("warehouse clerk"))
		{
			let progress: number = toInt(getProperty("warehouseProgress"));
			progress = progress + 8 * itemAmount(Item.get("warehouse inventory page"));
			if (progress < 50)
			{
				doLash = true;
			}
		}
		if (enemy === Monster.get("warehouse guard"))
		{
			let progress: number = toInt(getProperty("warehouseProgress"));
			progress = progress + 8 * itemAmount(Item.get("warehouse map page"));
			if (progress < 50)
			{
				doLash = true;
			}
		}
		if (enemy === Monster.get("Copperhead Club bartender") && internalQuestStatus("questL11Ron") < 2)
		{
			doLash = true;
		}

		if (doLash)
		{
			handleTracker(enemy.toString(), "auto_lashes");
			return useSkill$2(Skill.get("Lash of the Cobra"));
		}
	}

	if (!combat_status_check("talismanofrenenutet") && canUse$4(Item.get("talisman of Renenutet")))
	{
		let doRenenutet: boolean = false;
		if (enemy === Monster.get("cabinet of Dr. Limpieza") && (Location.get("The Haunted Laundry Room")).turnsSpent > 2)
		{
			doRenenutet = true;
		}
		if (enemy === Monster.get("possessed wine rack") && (Location.get("The Haunted Wine Cellar")).turnsSpent > 2)
		{
			doRenenutet = true;
		}
		if (enemy === Monster.get("Baa'baa'bu'ran") && itemAmount(Item.get("stone wool")) < 2)
		{
			doRenenutet = true;
		}
		if (Monster.get(["mountain man", "warehouse clerk", "warehouse guard", "waiter dressed as a ninja", "ninja dressed as a waiter"]).includes(enemy))
		{
			doRenenutet = true;
		}
		if (enemy === Monster.get("Quiet Healer") && !possessEquipment(Item.get("amulet of extreme plot significance")))
		{
			doRenenutet = true;
		}
		if (enemy === Monster.get("pygmy janitor") && itemAmount(Item.get("book of matches")) === 0 && toInt(getProperty("hiddenTavernUnlock")) !== myAscensions())
		{
			doRenenutet = true;
		}
		if (enemy === Monster.get("blackberry bush"))
		{
			if (!possessEquipment(Item.get("blackberry galoshes")) && itemAmount(Item.get("blackberry")) < 3)
			{
				doRenenutet = true;
			}
		}
		if (myLocation() === Location.get("Wartime Frat House"))
		{
			if (!possessEquipment(Item.get("beer helmet")) || !possessEquipment(Item.get("bejeweled pledge pin")) || !possessEquipment(Item.get("distressed denim pants")))
			{
				doRenenutet = true;
			}
		}
		if (Monster.get(["Battlie Knight Ghost", "Claybender Sorcerer Ghost", "Dusken Raider Ghost", "Space Tourist Explorer Ghost", "Whatsian Commando Ghost"]).includes(enemy))
		{
			if (itemAmount(Item.get("A-Boo clue")) < toInt(getProperty("booPeakProgress")) / 30)
			{
				doRenenutet = true;
			}
		}
		if (Monster.get(["toothy sklelton", "spiny skelelton"]).includes(enemy))
		{
			if (myLocation() === Location.get("The Defiled Nook") && itemAmount(Item.get("evil eye")) === 0)
			{ // lash didn't get it)
				doRenenutet = true;
			}
		}
		if (Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy))
		{
			if (itemAmount(Item.get("rusty hedge trimmers")) === 0)
			{ // lash didn't get it
				doRenenutet = true;
			}
		}
		if (Monster.get(["Blue Oyster cultist"]).includes(enemy))
		{
			doRenenutet = true;
		}
		if (doRenenutet)
		{
			if (!combat_status_check("curseofindecision") && canUse$2(Skill.get("Curse of Indecision")))
			{
				combat_status_add("curseofindecision");
				return useSkill$2(Skill.get("Curse of Indecision"));
			}
			combat_status_add("talismanofrenenutet");
			handleTracker(enemy.toString(), "auto_renenutet");
			setProperty("auto_edStatus", "dying");
			return useItem$1(Item.get("talisman of Renenutet"));
		}
	}

	if (canUse$4(Item.get("cigarette lighter")) && myLocation() === Location.get("A Mob of Zeppelin Protesters") && internalQuestStatus("questL11Ron") === 1 && getProperty("auto_edStatus") === "dying")
	{
		return useItem$1(Item.get("cigarette lighter"));
		// insta-kills protestors and removes an additional 5-7 (optimal!)
	}

	if (enemy === Monster.get("pygmy orderlies") && canUse$3(Item.get("short writ of habeas corpus"), false) && haveEffect(Effect.get("Everything Looks Green")) === 0)
	{
		return useItem$1(Item.get("short writ of habeas corpus"));
	}

	if (canUse$2(Skill.get("Darts: Aim for the Bullseye")) && haveEffect(Effect.get("Everything Looks Red")) === 0 && dartELRcd() <= 40)
	{
		setProperty("auto_instakillSource", "darts bullseye");
		setProperty("auto_instakillSuccess", true.toString());
		loopHandlerDelayAll();
		return useSkill$2(Skill.get("Darts: Aim for the Bullseye"));
	}
	// use cosmic bowling ball iotm
	if (auto_bowlingBallCombatString(myLocation(), true) !== "" && !enemy.boss)
	{
		return auto_bowlingBallCombatString(myLocation(), false);
	}
	// prep avalanche if requested
	if (canUse$2(Skill.get("McHugeLarge Avalanche")) && getProperty("auto_forceNonCombatSource") === "McHugeLarge left ski" && !toBoolean(getProperty("auto_avalancheDeployed")))
	{
		setProperty("auto_avalancheDeployed", true.toString());
		return useSkill$2(Skill.get("McHugeLarge Avalanche"));
	}
	// prep parka NC forcing if requested
	if (canUse$2(Skill.get("Launch spikolodon spikes")) && getProperty("auto_forceNonCombatSource") === "jurassic parka" && !toBoolean(getProperty("auto_parkaSpikesDeployed")))
	{
		setProperty("auto_parkaSpikesDeployed", true.toString());
		return useSkill$2(Skill.get("Launch spikolodon spikes"));
	}

	if (instakillable(enemy) && !isFreeMonster$1(enemy, myLocation()) && doInstaKill)
	{
		if (!combat_status_check("batoomerang") && itemAmount(Item.get("replica bat-oomerang")) > 0)
		{
			if (toInt(getProperty("auto_batoomerangDay")) !== myDaycount())
			{
				setProperty("auto_batoomerangDay", myDaycount().toString());
				setProperty("auto_batoomerangUse", (0).toString());
			}
			if (toInt(getProperty("auto_batoomerangUse")) < 3)
			{
				setProperty("auto_batoomerangUse", (toInt(getProperty("auto_batoomerangUse")) + 1).toString());
				combat_status_add("batoomerang");
				handleTracker$1(enemy.toString(), Item.get("replica bat-oomerang").toString(), "auto_instakill");
				loopHandlerDelayAll();
				return `item ${Item.get("replica bat-oomerang")}`;
			}
		}

		if (canUse$4(Item.get("shadow brick")) && toInt(getProperty("_shadowBricksUsed")) < 13)
		{
			handleTracker$1(enemy.toString(), Item.get("shadow brick").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useItems$1(Item.get("shadow brick"), Item.none);
		}

		if (!combat_status_check("jokesterGun") && equippedItem(Slot.get("weapon")) === Item.get("The Jokester's gun") && !toBoolean(getProperty("_firedJokestersGun")) && auto_have_skill(Skill.get("Fire the Jokester's Gun")))
		{
			combat_status_add("jokesterGun");
			handleTracker$1(enemy.toString(), Skill.get("Fire the Jokester's Gun").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return `skill${Skill.get("Fire the Jokester's Gun")}`;
		}

		if (canUse$2(Skill.get("Slay the Dead")) && enemy.phylum === Phylum.get("undead"))
		{
			// instakills Undead and reduces evilness in Cyrpt zones.
			return useSkill$2(Skill.get("Slay the Dead"));
		}
	}

	if (getProperty("auto_edStatus") === "UNDYING!")
	{
		// We're taking a trip to the underworld. Either we want to abuse resurrection or we want to go shopping
		if (myLocation() === Location.get("The Secret Government Laboratory"))
		{
			if (itemAmount(Item.get("rock band flyers")) === 0 && itemAmount(Item.get("jam band flyers")) === 0)
			{
				if (!combat_status_check("love stinkbug") && toBoolean(getProperty("lovebugsUnlocked")))
				{
					combat_status_add("love stinkbug2");
					return `skill ${Skill.get("Summon Love Stinkbug")}`;
				}
			}
		}

		if (canUse$3(Item.get("seal tooth"), false))
		{
			return "use Seal Tooth; repeat; ";
		}

		return "skill Mild Curse; repeat; ";
	}
	//Everfull Dart Holder
	if (haveEquipped(Item.get("Everfull Dart Holster")) && toInt(getProperty("_dartsLeft")) > 0)
	{
		return useSkill$1(dartSkill(), false);
	}
	// Don't risk drop forcing if we've already been beaten up twice
	if (toInt(getProperty("_edDefeats")) < 2)
	{
		if (wantToForceDrop(enemy))
		{
			const polarVortexAvailable: boolean = canUse$1(Skill.get("Fire Extinguisher: Polar Vortex"), false) && auto_fireExtinguisherCharges() > 10;
			const mildEvilAvailable: boolean = canUse$1(Skill.get("Perpetrate Mild Evil"), false) && toInt(getProperty("_mildEvilPerpetrated")) < 3;
			// mild evil only can pick pocket. Use it before fire extinguisher
			if (mildEvilAvailable)
			{
				handleTracker$1(enemy.toString(), Skill.get("Perpetrate Mild Evil").toString(), "auto_otherstuff");
				return useSkill$2(Skill.get("Perpetrate Mild Evil"));
			}
			if (polarVortexAvailable)
			{
				handleTracker$1(enemy.toString(), Skill.get("Fire Extinguisher: Polar Vortex").toString(), "auto_otherstuff");
				return useSkill$2(Skill.get("Fire Extinguisher: Polar Vortex"));
			}
		}
	}
	// Actually killing stuff starts here
	if (canUse$2(auto_spoonCombatSkill()))
	{
		return useSkill$2(auto_spoonCombatSkill());
	}

	if (myLocation() === Location.get("The Secret Government Laboratory") && canUse$1(Skill.get("Roar of the Lion"), false))
	{
		if (canUse$1(Skill.get("Storm of the Scarab"), false) && myBuffedstat(Stat.get("Mysticality")) >= 60)
		{
			return useSkill$1(Skill.get("Storm of the Scarab"), false);
		}
		return useSkill$1(Skill.get("Roar of the Lion"), false);
	}

	if (Location.get(["Pirates of the Garbage Barges", "The SMOOCH Army HQ", "VYKEA"]).includes(myLocation()) && canUse$1(Skill.get("Storm of the Scarab"), false))
	{
		return useSkill$1(Skill.get("Storm of the Scarab"), false);
	}

	if (Location.get(["The Hippy Camp", "The Outskirts of Cobb's Knob", "The Spooky Forest", "The Batrat and Ratbat Burrow", "The Boss Bat's Lair", "Cobb's Knob Harem"]).includes(myLocation()) && canUse$1(Skill.get("Fist of the Mummy"), false))
	{
		return useSkill$1(Skill.get("Fist of the Mummy"), false);
	}

	const fightStat: number = myBuffedstat(weaponType(equippedItem(Slot.get("weapon")))) - 20;
	if (fightStat > monsterDefense() && round_1 < 20 && canSurvive$1(1.1) && getProperty("auto_edStatus") === "UNDYING!")
	{
		return "attack with weapon";
	}

	if (canUse$2(Skill.get("Cowboy Kick")))
	{
		return useSkill$2(Skill.get("Cowboy Kick"));
	}

	if (canUse$4(Item.get("ice-cold Cloaca Zero")) && myMp() < 15 && myMaxmp() > 200)
	{
		return useItem$1(Item.get("ice-cold Cloaca Zero"));
	}

	if (canUse$1(Skill.get("Storm of the Scarab"), false) && myBuffedstat(Stat.get("Mysticality")) > 35)
	{
		return useSkill$1(Skill.get("Storm of the Scarab"), false);
	}

	if (enemy.physicalResistance >= 100 || round_1 >= 25 || canSurvive$1(1.25))
	{
		if (canUse$1(Skill.get("Fist of the Mummy"), false))
		{
			return useSkill$1(Skill.get("Fist of the Mummy"), false);
		}
	}

	if (myMp() < mpCost(Skill.get("Storm of the Scarab")))
	{
		for (const it of Item.get(["holy spring water", "spirit beer", "sacramental wine"]))
		{
			if (canUse$4(it))
			{
				return useItem(it, false);
			}
		}
	}

	if (round_1 >= 29)
	{
		auto_log_error("About to UNDYING too much but have no other combat resolution. Please report this.");
	}

	if (fightStat > monsterDefense() && round_1 < 20 && canSurvive$1(1.1) && getProperty("auto_edStatus") === "dying")
	{
		auto_log_warning(`Attacking with weapon because we don't have enough MP. Expected damage: ${expectedDamage()}, current hp: ${myHp()}`, "red");
		return "attack with weapon";
	}

	return useSkill$1(Skill.get("Mild Curse"), false);
}