import { Class, Effect, Element, Familiar, Item, Location, Monster, Skill, ceil, getProperty, haveEffect, haveEquipped, itemAmount, monsterElement, monsterHp, monsterLevelAdjustment, monsterPhylum, myAdventures, myClass, myFamiliar, myLocation, myMaxmp, myMp, setProperty, toBoolean, toInt, toPhylum } from "kolmafia";
import { fullness_left } from "../auto_consume";
import { is100FamRun } from "../auto_familiar";
import { MLDamageToMonsterMultiplier, auto_have_skill, auto_log_warning, auto_wantToCopy, auto_wantToSniff, combatItemDamageMultiplier, handleTracker$1, internalQuestStatus, isGhost, stunnable } from "../auto_util";
import { auto_combatLicenseToAdventureStage4 } from "./auto_combat_license_to_adventure";
import { auto_combatTheSourceStage4 } from "./auto_combat_the_source";
import { canSurvive$1, canUse$2, canUse$4, combat_status_add, combat_status_check, getCopier$1, getSniffer$1, getStunner, haveUsed, haveUsed$1, isSniffed, markAsUsed$1, useItem$1, useItems$1, useSkill$2 } from "./auto_combat_util";
import { auto_combatWereProfessorStage4 } from "./auto_combat_wereprofessor";
import { auto_combatZombieSlayerStage4 } from "./auto_combat_zombie_slayer";
import { auto_bowlingBallCombatString } from "../iotms/mr2022";
import { shouldCinchoConfetti } from "../iotms/mr2023";
import { ag_is_bodyguard } from "../paths/avant_guard";
import { inAftercore } from "../paths/casual";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { auto_warSide } from "../quests/level_12";
import { towerKeyCount$1 } from "../quests/level_13";
import { numPirateInsults } from "../quests/optional";

//defined in /autoscend/combat/auto_combat_default_stage4.ash
export function auto_combatDefaultStage4(round_1: number, enemy: Monster, text: string): string
{
	// stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
	let retval: string = "";
	//Unskip stage 3
	if (toBoolean(getProperty("auto_skipStage3"))) { setProperty("auto_skipStage3", false.toString()); }
	// Path = The Source
	retval = auto_combatTheSourceStage4(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = license to adventure
	retval = auto_combatLicenseToAdventureStage4(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = The Source
	retval = auto_combatZombieSlayerStage4(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = WereProfessor
	retval = auto_combatWereProfessorStage4(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Skip if have drones out
	if (toBoolean(getProperty("auto_skipStage4"))) { return ""; }
	//sniffers are skills that increase the odds of encountering this same monster again in the current zone.
	if (auto_wantToSniff(enemy, myLocation()) && !ag_is_bodyguard())
	{
		const sniffer: Skill = getSniffer$1(enemy);
		if (sniffer !== Skill.none)
		{
			if (sniffer === Skill.get("Perceive Soul"))
			{ //mafia does not track the target of this skill so we must do so.
				setProperty("auto_bat_soulmonster", enemy.toString());
			}
			handleTracker$1(enemy.toString(), sniffer.toString(), "auto_sniffs");
			combat_status_add("sniffed");
			return useSkill$2(sniffer);
		}
	}

	if (enemy === Monster.get("animated ornate nightstand") && myFamiliar() === Familiar.get("Nosy Nose") && !is100FamRun() && canUse$2(Skill.get("Get a Good Whiff of This Guy")) && !isSniffed(enemy, Skill.get("Get a Good Whiff of This Guy")))
	{
		//this is a special case, if Nosy Nose is used in the bedroom in a non 100 fam run it is to whiff this monster
		//and use only this sniffer because the elegant monster must be found next and this one gets turned off easily by using a different familiar
		handleTracker$1(enemy.toString(), Skill.get("Get a Good Whiff of This Guy").toString(), "auto_sniffs");
		return useSkill$2(Skill.get("Get a Good Whiff of This Guy"));
	}
	//TODO auto_doCombatCopy property is silly. get rid of it
	if (!haveUsed$1(Item.get("Rain-Doh black box")) && !in_heavyrains() && toInt(getProperty("_raindohCopiesMade")) < 5 && !ag_is_bodyguard())
	{
		if (enemy === Monster.get("modern zmobie") && toInt(getProperty("auto_modernzmobiecount")) < 3)
		{
			setProperty("auto_doCombatCopy", "yes");
		}
	}
	if (canUse$4(Item.get("Rain-Doh black box")) && getProperty("auto_doCombatCopy") === "yes" && enemy !== Monster.get("gourmet gourami") && !ag_is_bodyguard())
	{
		setProperty("auto_doCombatCopy", "no");
		markAsUsed$1(Item.get("Rain-Doh black box")); // mark even if not used so we don't spam the error message
		if (toInt(getProperty("_raindohCopiesMade")) < 5)
		{
			handleTracker$1(enemy.toString(), Item.get("Rain-Doh black box").toString(), "auto_copies");
			return `item ${Item.get("Rain-Doh black box")}`;
		}
		auto_log_warning("Can not issue copy directive because we have no copies left", "red");
	}
	if (getProperty("auto_doCombatCopy") === "yes")
	{
		setProperty("auto_doCombatCopy", "no");
	}
	//get 1 additional [fat loot token] per day
	if (myLocation() === Location.get("The Daily Dungeon"))
	{
		// If we are in The Daily Dungeon, assume we get 1 token, so only if we need more than 1.
		if (towerKeyCount$1(false) < 2 && !toBoolean(getProperty("_dailyDungeonMalwareUsed")) && itemAmount(Item.get("daily dungeon malware")) > 0)
		{
			if (Monster.get(["apathetic lizardman", "dairy ooze", "dodecapede", "giant giant moth", "mayonnaise wasp", "pencil golem", "sabre-toothed lime", "tonic water elemental", "vampire clam"]).includes(enemy))
			{
				return `item ${Item.get("daily dungeon malware")}`;
			}
		}
	}
	//iotm monster copier that works by creating wandering copies of the targetted monster
	if (canUse$2(Skill.get("Digitize")) && toInt(getProperty("_sourceTerminalDigitizeUses")) === 0 && !inAftercore())
	{
		if (Monster.get(["lobsterfrogman"]).includes(enemy))
		{
			if (getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString())
			{
				handleTracker$1(enemy.toString(), Skill.get("Digitize").toString(), "auto_copies");
				return useSkill$2(Skill.get("Digitize"));
			}
		}
	}
	if (canUse$2(Skill.get("Digitize")) && toInt(getProperty("_sourceTerminalDigitizeUses")) < 3 && !inAftercore())
	{
		if (getProperty("auto_digitizeDirective") === enemy.toString())
		{
			if (getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString())
			{
				handleTracker$1(enemy.toString(), Skill.get("Digitize").toString(), "auto_copies");
				return useSkill$2(Skill.get("Digitize"));
			}
		}
	}
	//iotm monster duplicator that creates a chained fight of the current monster
	if (auto_wantToCopy(enemy, myLocation()) && !ag_is_bodyguard())
	{
		const copier: Skill = getCopier$1(enemy);
		if (copier !== Skill.none && canUse$2(copier))
		{
			if (copier === Skill.get("Blow the Purple Candle!"))
			{ //mafia does not track the target of this skill so we must do so.
				setProperty("auto_purple_candled", enemy.toString());
			}
			handleTracker$1(enemy.toString(), copier.toString(), "auto_copies");
			combat_status_add("copied");
			return useSkill$2(copier);
		}
	}
	//accordion thief mechanic. unlike pickpocket it can be done at any round
	if (canUse$2(Skill.get("Steal Accordion")) && myClass() === Class.get("Accordion Thief") && canSurvive$1(2.0))
	{
		return useSkill$2(Skill.get("Steal Accordion"));
	}
	//in [The Deep Machine Tunnels] will stagger enemy and grants another abstraction
	if (canUse$4(Item.get("abstraction: sensation")) && enemy === Monster.get("Performer of Actions"))
	{
		//	Change +100% Moxie to +100% Init
		return useItem$1(Item.get("abstraction: sensation"));
	}
	if (canUse$4(Item.get("abstraction: thought")) && enemy === Monster.get("Perceiver of Sensations"))
	{
		// Change +100% Myst to +100% Items
		return useItem$1(Item.get("abstraction: thought"));
	}
	if (canUse$4(Item.get("abstraction: action")) && enemy === Monster.get("Thinker of Thoughts"))
	{
		// Change +100% Muscle to +10 Familiar Weight
		return useItem$1(Item.get("abstraction: action"));
	}
	//these loofah skills stagger and provide MP, meat, or XP
	if (monsterLevelAdjustment() <= 150) {
		if (canUse$2(Skill.get("Loofah Leglifts")))
		{
			return useSkill$2(Skill.get("Loofah Leglifts"));
		}
		if (canUse$2(Skill.get("Loofah Hosenzittern")))
		{
			return useSkill$2(Skill.get("Loofah Hosenzittern"));
		}
		if (canUse$2(Skill.get("Loofah Head-Scratch")))
		{
			return useSkill$2(Skill.get("Loofah Head-Scratch"));
		}
	}
	//stocking mimic can produce meat until round 10.
	if (myFamiliar() === Familiar.get("Stocking Mimic") && round_1 < 12 && canSurvive$1(1.5))
	{
		if (itemAmount(Item.get("seal tooth")) > 0)
		{
			return `item ${Item.get("seal tooth")}`;
		}
	}
	//winking is a monster copier familiar skill. they share a daily counter
	let wink_skill: Skill = Skill.none;
	if (canUse$2(Skill.get("Wink at")))
	{
		wink_skill = Skill.get("Wink at");
	}
	if (canUse$2(Skill.get("Fire a badly romantic arrow")))
	{
		wink_skill = Skill.get("Fire a badly romantic arrow");
	}
	if (wink_skill !== Skill.none)
	{ //we can wink / romatic arrow
		if (Monster.get(["lobsterfrogman", "modern zmobie"]).includes(enemy))
		{
			return useSkill$2(wink_skill);
		}
	}
	//insults are used as part of the pirates quest
	if (canUse$4(Item.get("The Big Book of Pirate Insults")) && numPirateInsults() < 8 && internalQuestStatus("questM12Pirate") < 5)
	{
		// this should only be applicable in Low-Key Summer (for now)
		if (Location.get(["Barrrney's Barrr", "The Obligatory Pirate's Cove"]).includes(myLocation()))
		{
			return useItem$1(Item.get("The Big Book of Pirate Insults"));
		}
	}
	//cocktail napkin can banish clingy pirates (only them and no other monster). this accelerates the pirates quest
	if (itemAmount(Item.get("cocktail napkin")) > 0)
	{
		if (Monster.get(["clingy pirate (female)", "clingy pirate (male)"]).includes(enemy))
		{
			return `item ${Item.get("cocktail napkin")}`;
		}
	}
	//this completes the quest Advertise for the Mysterious Island Arena which is a sidequest which accelerates the L12 frat-hippy war quest
	//kol tracks each band flyering separately. mafia tracks them in a singular property as it assumes the player will not flyer for the wrong band. make sure to only flyer for the side we want to flyer for
	let flyer: Item = Item.get("rock band flyers");
	if (auto_warSide() === "hippy")
	{
		flyer = Item.get("jam band flyers");
	}
	if (canUse$4(flyer) && toInt(getProperty("flyeredML")) < 10000 && myLocation() !== Location.get("The Battlefield (Frat Uniform)") && myLocation() !== Location.get("The Battlefield (Hippy Uniform)") && !toBoolean(getProperty("auto_ignoreFlyer")))
	{
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
				if (myClass() === Class.get("Sauceror") && haveUsed(Skill.get("Curse of Weaksauce")))
				{
					//don't miss MP by killing weak monsters with beehive
					const beehiveDamage: number = ceil(30 * combatItemDamageMultiplier() * MLDamageToMonsterMultiplier());
					if (monsterHp() > beehiveDamage)
					{
						flyerWith = Item.get("beehive");
						staggeringFlyer = true;
					}
				}
				else {
					flyerWith = Item.get("beehive");
					staggeringFlyer = true;
				}
			}
		}
		if (staggeringFlyer && (!stunnable(enemy) || monsterLevelAdjustment() > 150))
		{
			staggeringFlyer = false;
		}
		let stunned: boolean = false;
		if (!staggeringFlyer && stunnable(enemy))
		{
			const stunner: Skill = getStunner(enemy);
			stunned = combat_status_check("stunned");
			if (stunner !== Skill.none && !stunned)
			{
				combat_status_add("stunned");
				return useSkill$2(stunner);
			}
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
	//chaos butterfly if thrown in combat once per ascension will accelerate the dooks farm sidequest for the frat-hippy war.
	if (canUse$4(Item.get("chaos butterfly")) && !toBoolean(getProperty("chaosButterflyThrown")) && !toBoolean(getProperty("auto_skipL12Farm")))
	{
		if (canUse$4(Item.get("Time-Spinner")) && auto_have_skill(Skill.get("Ambidextrous Funkslinging")))
		{
			return useItems$1(Item.get("chaos butterfly"), Item.get("Time-Spinner"));
		}
		return useItem$1(Item.get("chaos butterfly"));
	}
	//accelerate palindrome quest
	if (canUse$4(Item.get("disposable instant camera")))
	{
		if (Monster.get(["Bob Racecar", "Racecar Bob"]).includes(enemy))
		{
			return useItem$1(Item.get("disposable instant camera"));
		}
	}
	//accelerate oil peak in highlands quest
	if (itemAmount(Item.get("Duskwalker syringe")) > 0)
	{
		if (Monster.get(["oil baron", "oil cartel", "oil slick", "oil tycoon"]).includes(enemy))
		{
			return `item ${Item.get("Duskwalker syringe")}`;
		}
	}
	//used by [Little Geneticist DNA-Splicing Lab] iotm
	if (canUse$4(Item.get("DNA extraction syringe")) && monsterLevelAdjustment() < 150)
	{
		if (monsterPhylum(enemy) !== toPhylum(getProperty("dnaSyringe")))
		{
			return useItem$1(Item.get("DNA extraction syringe"));
		}
	}
	//use latte iotm to restore 50% of max MP
	if (!in_plumber() && !in_darkGyffte() && !in_zombieSlayer() && canUse$2(
	//paths that do not use MP
	Skill.get("Gulp Latte")) && myMp() * 2 < myMaxmp())
	{ //gulp latte restores 50% of your MP. do not waste it.
		return useSkill$2(Skill.get("Gulp Latte"));
	}
	//use haiku katana's HP and MP restore skill
	if (!in_plumber() && !in_darkGyffte() && !in_zombieSlayer() && canUse$2(
	//paths that do not use MP
	Skill.get("Spring Raindrop Attack")) && myMp() < 0.9 * myMaxmp())
	{
		return useSkill$2(Skill.get("Spring Raindrop Attack"));
	}
	//stinkbug physically resistant monsters
	if (!(haveEquipped(Item.get("protonic accelerator pack")) && isGhost(enemy)))
	{
		if (canUse$2(Skill.get("Summon Love Stinkbug")) && enemy.physicalResistance >= 100 && monsterElement(enemy) !== Element.get("stench"))
		{
			return useSkill$2(Skill.get("Summon Love Stinkbug"));
		}
	}
	// use red rocket from Clan VIP Lounge to get 5x stats from next food item consumed. Does not stagger on use
	if (fullness_left() > 0 && canUse$4(Item.get("red rocket")) && haveEffect(Effect.get("Everything Looks Red")) <= 0 && haveEffect(Effect.get("Ready to Eat")) <= 0 && canSurvive$1(5.0) && myAdventures() < 100)
	{
		if (in_plumber())
		{
			return useItem$1(Item.get("red rocket"));
		}
		//use if next food is large in size. Currently autoConsume doesn't analyze stat gain, which would be better
		//disabled until fix: https://github.com/loathers/autoscend/issues/1053
		//item simulationOutput = auto_autoConsumeOneSimulation("eat");
		//if (simulationOutput != $item[none] && simulationOutput.fullness > 3)
		//{
			return useItem$1(Item.get("red rocket"));
		//}
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
	// get extra combat stats
	if (shouldCinchoConfetti() && canSurvive$1(5.0))
	{
		return useSkill$2(Skill.get("Cincho: Confetti Extravaganza"));
	}

	return "";
}