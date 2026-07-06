import { Class, Effect, Element, Familiar, Item, Location, Monster, Phylum, Skill, Slot, Stat, buffedHitStat, containsText, equippedAmount, equippedItem, expectedDamage, getProperty, haveEffect, haveEquipped, haveSkill, hippyStoneBroken, itemAmount, itemDrops, itemType, max, monsterDefense, monsterElement, monsterHp, monsterLevelAdjustment, monsterPhylum, mpCost, myBuffedstat, myClass, myFamiliar, myHp, myLocation, myMaxhp, myMp, numericModifier, setProperty, toBoolean, toInt } from "kolmafia";
import { possessEquipment } from "../auto_equipment";
import { auto_log_warning, auto_wantToSniff, handleTracker$1, internalQuestStatus, isGhost, stunnable } from "../auto_util";
import { auto_combatMeatGolemStage3 } from "./auto_combat_adventurer_meats_world";
import { auto_combatHeavyRainsStage3 } from "./auto_combat_heavy_rains";
import { canSurvive$1, canUse$1, canUse$2, canUse$4, combat_status_add, enemyCanBlocksSkills, getSniffer$1, getStunner, haveUsed, isSniffed$1, maxRoundsToDouse, useItem$1, useSkill$1, useSkill$2, wantToDouse, wantToForceDrop } from "./auto_combat_util";
import { auto_combatZombieSlayerStage3 } from "./auto_combat_zombie_slayer";
import { auto_fireExtinguisherCharges } from "../iotms/mr2021";
import { auto_autumnatonQuestingIn, dronesOut, gooseExpectedDrones } from "../iotms/mr2022";
import { auto_dousesRemaining, auto_remainingCandyCaneSlashes } from "../iotms/mr2023";
import { auto_canNorthernExplosionFE, auto_wantToBCZ } from "../iotms/mr2025";
import { in_avantGuard } from "../paths/avant_guard";
import { inAftercore } from "../paths/casual";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { in_robot } from "../paths/you_robot";
import { bridgeGoal, fastenerCount, hedgeTrimmersNeeded, lumberCount } from "../quests/level_09";
import { needStarKey } from "../quests/level_13";

//defined in /autoscend/combat/auto_combat_default_stage3.ash
export function auto_combatDefaultStage3(round_1: number, enemy: Monster, text: string): string
{
	// stage 3 = debuff: delevel, stun, curse, damage over time
	let retval: string = "";
	// Set to false because instakills are in stage 2 and if we get here, it was not successful
	setProperty("auto_instakillSuccess", false.toString());
	//Unskip stage 2
	if (toBoolean(getProperty("auto_skipStage2"))) { setProperty("auto_skipStage2", false.toString()); }
	//Skip stage 3 if set
	if (toBoolean(getProperty("auto_skipStage3"))) { return ""; }
	// Path = Heavy Rains
	retval = auto_combatHeavyRainsStage3(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = zombie slayer
	retval = auto_combatZombieSlayerStage3(round_1, enemy, text);
	if (retval !== "") { return retval; }
	// Path = Adventurer Meats World
	retval = auto_combatMeatGolemStage3(round_1, enemy, text);
	if (retval !== "") { return retval; }
	//delevel (10 + medicine_level)% in avatar of west of loathing path
	if (canUse$2(Skill.get("Bad Medicine")) && myMp() >= 3 * mpCost(Skill.get("Bad Medicine")))
	{
		return useSkill$2(Skill.get("Bad Medicine"));
	}
	//boris specific 3MP skill that delevels by 15%, with an upgrade it delevels 30% and stuns.
	//even without the upgrade it it is worth it. actually without upgrade you need it more due to low skill.
	if (canUse$2(Skill.get("Intimidating Bellow")) && expectedDamage() > 0 && !enemyCanBlocksSkills())
	{
		return useSkill$2(Skill.get("Intimidating Bellow"));
	}
	//if monster level adjustment is over 150 then they are immune to staggers. many deleveling skills also stagger.
	let enemy_la: number = monsterLevelAdjustment();
	//shape of a mole when using Llama lama gong. delevel by 5
	if (canUse$2(Skill.get("Tunnel Downwards")) && haveEffect(Effect.get("Shape of...Mole!")) > 0 && myLocation() === Location.get("Mt. Molehill"))
	{
		return useSkill$2(Skill.get("Tunnel Downwards"));
	}
	//iotm skill that duplicates dropped items
	//prioritize grey goose over xo and extinguisher because the drones last multiple fights until they are consumed
	if (canUse$2(Skill.get("Emit Matter Duplicating Drones")) && myFamiliar() === Familiar.get("Grey Goose"))
	{
		let emitDrones: boolean = false;
		let canExtingo: boolean = true;
		if (auto_fireExtinguisherCharges() <= 30 || !canUse$1(Skill.get("Fire Extinguisher: Polar Vortex"), false))
		{
			canExtingo = false;
		}
		let drones: boolean = gooseExpectedDrones() >= 1; //only want to try if we expect any number of drones.
		//dupe a sonar-in-a-biscuit if we're lucky, only want to try it if we need more than 1 biscuit
		if ((Item.get("sonar-in-a-biscuit").toString()) in itemDrops(enemy) && itemDrops(enemy).size <= 2 && internalQuestStatus("questL04Bat") <= 1 && drones)
		{
			emitDrones = true;
		}
		//dupe stone wool
		if ((Item.get("stone wool").toString()) in itemDrops(enemy) && itemAmount(Item.get("stone wool")) < 2 && drones)
		{
			emitDrones = true;
		}
		//dupe goat cheese
		if (enemy === Monster.get("dairy goat") && (canExtingo = false && itemAmount(Item.get("goat cheese")) < 3 && drones))
		{
			emitDrones = true;
		}
		//dupe Smut Orc Keepsake
		if (enemy === Monster.get("smut orc pervert") && auto_autumnatonQuestingIn() !== Location.get("The Smut Orc Logging Camp") && myLocation() === Location.get("The Smut Orc Logging Camp") && drones)
		{
			emitDrones = true;
		}
		//dupe some hedge trimmers if we're lucky
		if ((canExtingo = false && Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy) && auto_autumnatonQuestingIn() !== Location.get("Twin Peak") && hedgeTrimmersNeeded() > 1 && drones))
		{
			emitDrones = true;
		}
		//dupe some stars/lines
		if (myLocation() === Location.get("The Hole in the Sky") && (Item.get("star").toString()) in itemDrops(enemy) && (Item.get("line").toString()) in itemDrops(enemy) && needStarKey() && (itemAmount(Item.get("star")) < 8 && itemAmount(Item.get("line")) < 7) && drones)
		{
			emitDrones = true;
		}
		//dupe some blackberries
		if (enemy === Monster.get("blackberry bush") && drones)
		{
			emitDrones = true;
		}
		//dupe some glark cables
		if (enemy === Monster.get("red butler") && drones)
		{
			emitDrones = true;
		}
		//dupe some bowling balls if we can't use an Industrial Fire Extinguisher
		if ((canExtingo = false && (enemy === Monster.get("pygmy bowler") && toInt(getProperty("hiddenBowlingAlleyProgress")) + itemAmount(Item.get("bowling ball")) < 6) && drones))
		{
			emitDrones = true;
		}
		//dupe tomb ratchets if we're lucky
		if (enemy === Monster.get("tomb rat king") && itemAmount(Item.get("crumbling wooden wheel")) + itemAmount(Item.get("tomb ratchet")) < 10 && drones)
		{
			emitDrones = true;
		}
		//dupe Cursed Dragon Wishbone and Cursed Bat Paw if in AoSOL
		if (Monster.get(["two-headed shadow bat", "shadowboner shadowdagon"]).includes(enemy) && drones)
		{
			emitDrones = true;
		}
		//dupe GROPs
		if (enemy === Monster.get("Green Ops Soldier") && drones) {
			emitDrones = true;
		}

		if (dronesOut())
		{ //If we have drones out, let's not use the skill again
			emitDrones = false;
		}

		if (emitDrones)
		{
			handleTracker$1(enemy.toString(), Skill.get("Emit Matter Duplicating Drones").toString(), "auto_otherstuff");
			return useSkill$2(Skill.get("Emit Matter Duplicating Drones"));
		}
	}
	//iotm skill that can be used on any combat round, repeatedly until an item is stolen
	if (canUse$2(Skill.get("Hugs and Kisses!")) && myFamiliar() === Familiar.get("XO Skeleton") && toInt(getProperty("_xoHugsUsed")) < 11)
	{
		let forceDrop: boolean = false;
		if (Monster.get(["filthworm drone", "filthworm royal guard", "larval filthworm"]).includes(enemy))
		{
			forceDrop = true;
		}
		// reserve enough resources to force filthworm drops
		if (toInt(getProperty("_xoHugsUsed")) < 8)
		{
			// snatch a wig if we're lucky
			if (enemy === Monster.get("Burly Sidekick") && !possessEquipment(Item.get("Mohawk wig")))
				{ forceDrop = true; }
			// snatch a hedge trimmer if we're lucky
			if (Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy))
				{ forceDrop = true; }
			// snatch a killing jar if we're lucky
			if (enemy === Monster.get("banshee librarian") && 0 === itemAmount(Item.get("killing jar")))
				{ forceDrop = true; }
			// snatch a sonar-in-a-biscuit if we're lucky
			if ((Item.get("sonar-in-a-biscuit").toString()) in itemDrops(enemy) && itemDrops(enemy).size <= 2 && getProperty("questL04Bat") !== "finished")
				{ forceDrop = true; }
		}

		if (forceDrop)
		{
			handleTracker$1(enemy.toString(), Skill.get("Hugs and Kisses!").toString(), "auto_otherstuff");
			return useSkill$2(Skill.get("Hugs and Kisses!"));
		}
	}

	if (wantToDouse(enemy) && round_1 <= maxRoundsToDouse(enemy) && !toBoolean(getProperty("_douseFoeSuccess")))
	{ // dousing can have a low chance of success, so only do it for a while
		let douse: Skill = Skill.get("Douse Foe");
		let douseAvailable: boolean = canUse$1(douse, false) && auto_dousesRemaining() > 0;
		if (douseAvailable)
		{
			handleTracker$1(enemy.toString(), douse.toString(), "auto_otherstuff");
			return useSkill$2(douse);
		}
	}

	if (wantToForceDrop(enemy))
	{
		let polarVortexAvailable: boolean = canUse$1(Skill.get("Fire Extinguisher: Polar Vortex"), false) && auto_fireExtinguisherCharges() > 10;
		let mildEvilAvailable: boolean = canUse$1(Skill.get("Perpetrate Mild Evil"), false) && toInt(getProperty("_mildEvilPerpetrated")) < 3;
		let swoopAvailable: boolean = canUse$1(Skill.get("Swoop like a Bat"), true) && toInt(getProperty("_batWingsSwoopUsed")) < 11;
		// mild evil and swoop can only pick pocket. Use them before fire extinguisher
		if (swoopAvailable)
		{
			handleTracker$1(enemy.toString(), Skill.get("Swoop like a Bat").toString(), "auto_otherstuff");
			return useSkill$2(Skill.get("Swoop like a Bat"));
		}
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
	//delevel ~3% per combat round for rest of combat.
	//if sauceror and you kill enemy with a spell you regain up to 50MP. this is the primary source of MP for a sauceror.
	//with itchy curse finger skill it will also stagger on the turn it is cast
	let doWeaksauce: boolean = true;
	if (buffedHitStat() - 20 > monsterDefense())
	{
		doWeaksauce = false;
	}
	if (myClass() === Class.get("Sauceror"))
	{
		doWeaksauce = true;
	}
	if (enemy === Monster.get("invader bullet"))
	{
		doWeaksauce = false;
	}
	if (canUse$2(Skill.get("Curse of Weaksauce")) && haveSkill(Skill.get("Itchy Curse Finger")) && myMp() >= 60 && doWeaksauce)
	{
		return useSkill$2(Skill.get("Curse of Weaksauce"));
	}
	//[Eldritch Tentacle] is Immune to Stuns, Staggers, automatic kills and has a 50% resistance to Deleveling
	if (enemy === Monster.get("Eldritch Tentacle"))
	{
		enemy_la = 151;
	}

	if (enemy === Monster.get("invader bullet"))
	{
		enemy_la = 151;
	}

	if (Monster.get(["Naughty Sorceress", "Naughty Sorceress (2)"]).includes(enemy) && !toBoolean(getProperty("auto_confidence")))
	{
		enemy_la = 151;
	}
	// some dark gyffte boss's are stagger immune
	if (Monster.get(["%alucard%", "Jake Norris", "Ricardo Belmont", "Jayden Belmont", "Sharona", "Greg Dagreasy", "Travis Belmont", "Chad Alacarte"]).includes(enemy))
	{
		enemy_la = 151;
	}
	//Default behaviors:
	if (enemy_la <= 150)
	{ //enemy has not been rendered immune to staggering from monster level
		if (canUse$2(Skill.get("Curse of Weaksauce")) && haveSkill(Skill.get("Itchy Curse Finger")) && myMp() >= 60 && doWeaksauce)
		{
			return useSkill$2(Skill.get("Curse of Weaksauce"));
		}
		//HP reduction if the monster has high HP
		if (monsterHp() > 1500 || enemy.physicalResistance > 90)
		{
			if (canUse$2(Skill.get("Surprisingly Sweet Slash")) && auto_remainingCandyCaneSlashes() > 1)
			{ // reserve a slash for wall of bones
				return useSkill$2(Skill.get("Surprisingly Sweet Slash")); // 75% less HP
			}
			if (canUse$4(Item.get("autumnic bomb")))
			{ //50% less hp && prismatic damage on hit
				return useItem$1(Item.get("autumnic bomb"));
			}
		}
		// delevel and 75% less HP if you have a candy cane sword cane
		// Need this separate because want to reserve the Slash in Avant Guard for high HP bodyguards
		if (canUse$2(Skill.get("Surprisingly Sweet Slash")) && !in_avantGuard() && auto_remainingCandyCaneSlashes() > 1)
		{ // reserve a slash for wall of bones
			return useSkill$2(Skill.get("Surprisingly Sweet Slash"));
		}
		//delevel if you have a loofah lei
		if (canUse$2(Skill.get("Loofah Lei Lasso")))
		{
			return useSkill$2(Skill.get("Loofah Lei Lasso"));
		}

		if ((Item.get("Daily Affirmation: Keep Free Hate in your Heart")).combat)
		{
			if (canUse$4(Item.get("Daily Affirmation: Keep Free Hate in your Heart")) && inAftercore() && hippyStoneBroken() && !toBoolean(getProperty("_affirmationHateUsed")))
			{
				return useItem$1(Item.get("Daily Affirmation: Keep Free Hate in your Heart"));
			}
		}

		if (canUse$2(Skill.get("Canhandle")))
		{
			if (Item.get(["Frigid Northern Beans", "Heimz Fortified Kidney Beans", "Hellfire Spicy Beans", "Mixed Garbanzos and Chickpeas", "Pork 'n' Pork 'n' Pork 'n' Beans", "Shrub's Premium Baked Beans", "Tesla's Electroplated Beans", "Trader Olaf's Exotic Stinkbeans", "World's Blackest-Eyed Peas"]).includes(equippedItem(Slot.get("off-hand"))))
			{
				return useSkill$2(Skill.get("Canhandle"));
			}
		}

		if (canUse$2(Skill.get("Curse of Weaksauce")) && myClass() === Class.get("Sauceror") && doWeaksauce)
		{
			//Saucerors use Weaksauce to get MP, but no more MP will be coming if there isn't enough MP left to cast a spell, mortar can not have been launched yet at this point
			//if mp >= 60 Weaksauce has probably been cast above already
			let MPafterWeaksauce: number = myMp() - mpCost(Skill.get("Curse of Weaksauce"));
			let canCastAfterWeaksauce: boolean = false;
			for (let sp of Skill.get(["Saucestorm", "Stuffed Mortar Shell", "Saucegeyser"]))
			{
				if (canUse$1(sp, false) && MPafterWeaksauce >= mpCost(sp))
				{
					canCastAfterWeaksauce = true;
					break;
				}
			}
			if (!canCastAfterWeaksauce)
			{ if (canUse$1(Skill.get("Wave of Sauce"), false) && monsterElement(enemy) !== Element.get("hot") && MPafterWeaksauce >= mpCost(Skill.get("Wave of Sauce")))
				{
					canCastAfterWeaksauce = true;
				}
				else if (canUse$1(Skill.get("Saucecicle"), false) && monsterElement(enemy) !== Element.get("cold") && MPafterWeaksauce >= mpCost(Skill.get("Saucecicle")))
				{
					canCastAfterWeaksauce = true;
				}
			}
			if (canCastAfterWeaksauce)
			{
				return useSkill$2(Skill.get("Curse of Weaksauce"));
			}
		}

		if (canUse$2(Skill.get("Detect Weakness")))
		{
			return useSkill$2(Skill.get("Detect Weakness"));
		}

		if (canUse$2(Skill.get("Deploy Robo-Handcuffs")))
		{
			return useSkill$2(Skill.get("Deploy Robo-Handcuffs"));
		}

		if (canUse$2(Skill.get("Pocket Crumbs")))
		{
			return useSkill$2(Skill.get("Pocket Crumbs"));
		}

		if (canUse$2(Skill.get("Micrometeorite")))
		{
			return useSkill$2(Skill.get("Micrometeorite"));
		}

		if (canUse$4(Item.get("cow poker")))
		{
			if (Monster.get(["caugr", "moomy", "Pharaoh Amoon-Ra Cowtep", "pyrobove", "spidercow"]).includes(enemy))
			{
				return useItem$1(Item.get("cow poker"));
			}
		}

		if (canUse$4(Item.get("western-style skinning knife")))
		{
			if (Monster.get(["caugr", "coal snake", "diamondback rattler", "frontwinder", "grizzled bear", "mountain lion"]).includes(enemy))
			{
				return useItem$1(Item.get("western-style skinning knife"));
			}
		}

		if (myLocation() === Location.get("The Smut Orc Logging Camp") && canSurvive$1(1.0) && toInt(getProperty("chasmBridgeProgress")) < bridgeGoal())
		{
			let coldMortarShell: boolean = canUse$2(Skill.get("Stuffed Mortar Shell")) && haveEffect(Effect.get("Spirit of Peppermint")) !== 0;
			let coldSkillToUse: Skill = Skill.none;
			let coldAttackDamageMultiplier: number = 1;
			if (myClass() === Class.get("Seal Clubber"))
			{
				if (canUse$1(Skill.get("Lunging Thrust-Smack"), false))
				{
					coldAttackDamageMultiplier = 3; //triple elemental bonus
				}
				else if (canUse$1(Skill.get("Thrust-Smack"), false))
				{
					coldAttackDamageMultiplier = 2; //double elemental bonus
				}
			}
			let coldAttackDamage: number = toInt(numericModifier("cold damage") * coldAttackDamageMultiplier); //todo add ML damage multiplier
			// Listed from Most to Least Damaging to hopefully cause Death on the turn when the Shell hits.
			if (canUse$1(Skill.get("Saucegeyser"), false) && numericModifier("Cold Spell Damage") > numericModifier("Hot Spell Damage"))
			{
				//100% chance of cold Saucegeyser
				coldSkillToUse = Skill.get("Saucegeyser");
			}
			else if (canUse$1(Skill.get("Saucecicle"), false))
			{
				coldSkillToUse = Skill.get("Saucecicle");
			}
			else if (canUse$1(Skill.get("Cannelloni Cannon"), false) && haveEffect(Effect.get("Spirit of Peppermint")) !== 0)
			{
				coldSkillToUse = Skill.get("Cannelloni Cannon");
			}
			else if (canUse$1(Skill.get("Northern Explosion"), false) && !auto_canNorthernExplosionFE())
			{
				coldSkillToUse = Skill.get("Northern Explosion");
			}
			else if (monsterLevelAdjustment() < -65 && canUse$1(Skill.get("Saucestorm"), false))
			{
				//in extreme case where orcs are reduced to few HP by -ML Saucestorm is better than 50% chance of cold Saucegeyser
				//todo compare actual damage predictions instead
				coldSkillToUse = Skill.get("Saucestorm");
			}
			else if (coldAttackDamage > 3 * max(1, 69 + monsterLevelAdjustment()))
			{
				//cold bonus weapon attack can also be better than 50% chance of cold Saucegeyser
				//todo compare actual damage predictions instead
				if (myClass() === Class.get("Seal Clubber"))
				{
					if (canUse$1(Skill.get("Lunging Thrust-Smack"), false))
					{
						coldSkillToUse = Skill.get("Lunging Thrust-Smack"); //triple elemental bonus
					}
					else if (canUse$1(Skill.get("Thrust-Smack"), false))
					{
						coldSkillToUse = Skill.get("Thrust-Smack"); //double elemental bonus
					}
					else if (canUse$1(Skill.get("Lunge Smack"), false))
					{
						coldSkillToUse = Skill.get("Lunge Smack");
					}
				}
				//other classes default to regular attack later
			}
			else if (canUse$1(Skill.get("Saucegeyser"), false) && numericModifier("Cold Spell Damage") === numericModifier("Hot Spell Damage"))
			{
				//equal is 50% chance of cold Saucegeyser. "cold > hot" is used higher in priority. "cold < hot" is 100% hot Saucegeyser and not worth using
				coldSkillToUse = Skill.get("Saucegeyser");
			}
			else if (in_nuclear() && canUse$1(Skill.get("Throat Refrigerant"), false)) {
				coldSkillToUse = Skill.get("Throat Refrigerant");
			}

			let MPreservedForColdSpells: number = (coldMortarShell ? mpCost(Skill.get("Stuffed Mortar Shell")) : 0);
			if (coldSkillToUse !== Skill.none) { MPreservedForColdSpells += mpCost(coldSkillToUse); }
			// Mating Call has unlimited uses and a small effect so unlike other sniff skills there is no reason not to use it here to balance bridge parts except MP cost
			if (canUse$1(Skill.get("Gallapagosian Mating Call"), false) && myMp() >= MPreservedForColdSpells + mpCost(Skill.get("Gallapagosian Mating Call")))
			{
				let useMiniSniff: boolean = false;
				let sniffedLumber: boolean = isSniffed$1(Monster.get("smut orc pipelayer")) || isSniffed$1(Monster.get("smut orc jacker"));
				let sniffedFastener: boolean = isSniffed$1(Monster.get("smut orc screwer")) || isSniffed$1(Monster.get("smut orc nailer"));
				let haveLumberBias: boolean = equippedAmount(Item.get("logging hatchet")) > 0 && equippedAmount(Item.get("loadstone")) === 0;
				let haveFastenerBias: boolean = equippedAmount(Item.get("loadstone")) > 0 && equippedAmount(Item.get("logging hatchet")) === 0;

				if (enemy === Monster.get("smut orc pipelayer") || enemy === Monster.get("smut orc jacker"))
				{
					if (!sniffedLumber)
					{
						if (fastenerCount() >= 30 && lumberCount() < 29)
						{ useMiniSniff = true;
						}
						else if (haveFastenerBias && fastenerCount() >= lumberCount())
						{ //will get more fastener from Loadstone
						useMiniSniff = true;
						}
						else if (fastenerCount() > lumberCount() + 2)
						{ //have more fastener, try to make up for it
						useMiniSniff = true;
						}
						else if (sniffedFastener && !haveLumberBias && fastenerCount() > lumberCount())
						{ //may have sniffed fastener too hard
						useMiniSniff = true;
						}
					}
				}
				else if (enemy === Monster.get("smut orc screwer") || enemy === Monster.get("smut orc nailer"))
				{
					if (!sniffedFastener)
					{
						if (lumberCount() >= 30 && fastenerCount() < 29)
						{ useMiniSniff = true;
						}
						else if (haveLumberBias && lumberCount() >= fastenerCount())
						{ //will get more lumber from Logging Hatchet
						useMiniSniff = true;
						}
						else if (lumberCount() > fastenerCount() + 2)
						{ //have more lumber, try to make up for it
						useMiniSniff = true;
						}
						else if (sniffedLumber && !haveFastenerBias && lumberCount() > fastenerCount())
						{ //may have sniffed lumber too hard
						useMiniSniff = true;
						}
					}
				}
				if (useMiniSniff)
				{
					handleTracker$1(enemy.toString(), Skill.get("Gallapagosian Mating Call").toString(), "auto_sniffs");
					return useSkill$1(Skill.get("Gallapagosian Mating Call"), false);
				}
			}

			if (coldMortarShell)
			{
				return useSkill$2(Skill.get("Stuffed Mortar Shell"));
			}
			else if (coldSkillToUse !== Skill.none)
			{
				return useSkill$1(coldSkillToUse, false);
			}
			else if (!in_robot() && Class.get(["Seal Clubber", "Turtle Tamer", "Pastamancer", "Sauceror", "Disco Bandit", "Accordion Thief"]).includes(myClass()))
			{
				if (coldAttackDamage > 69 + monsterLevelAdjustment() && coldAttackDamage > 0)
				{
					//if cold damage bonus > their health make sure an attack that uses elemental bonus gets to be used
					if (myClass() === Class.get("Seal Clubber"))
					{
						if (canUse$1(Skill.get("Lunging Thrust-Smack"), false))
						{
							return useSkill$1(Skill.get("Lunging Thrust-Smack"), false); //triple elemental bonus
						}
						else if (canUse$1(Skill.get("Thrust-Smack"), false))
						{
							return useSkill$1(Skill.get("Thrust-Smack"), false); //double elemental bonus
						}
						else if (canUse$1(Skill.get("Lunge Smack"), false))
						{
							return useSkill$1(Skill.get("Lunge Smack"), false);
						}
						else {
							return "attack with weapon";
						}
					}
					else {
						return "attack with weapon";
					}
				}
				else if (monsterLevelAdjustment() <= -25 && canUse$1(Skill.get("Saucestorm"), false))
				{ //todo check predicted damage instead of arbitrary values
					auto_log_warning("None of the best [cold] skills available against smut orcs but trying weaker alternative in view of the negative monster level.", "red");
					return useSkill$1(Skill.get("Saucestorm"), false);
				}
				else {
					auto_log_warning("None of our preferred [cold] skills available against smut orcs. Engaging in Fisticuffs.", "red");
				}
			}
		}

		if (myLocation() === Location.get("The Haunted Kitchen") && canUse$2(Skill.get("Become a Cloud of Mist")) && toInt(getProperty("_vampyreCloakeFormUses")) < 10)
		{
			let hot: number = toInt(numericModifier("Hot Resistance"));
			let stench: number = toInt(numericModifier("Stench Resistance"));

			if ((hot < 9 && hot % 3 !== 0 || stench < 9 && stench % 3 !== 0) && canUse$2(Skill.get("Become a Cloud of Mist")))
			{
				return useSkill$2(Skill.get("Become a Cloud of Mist"));
			}
		}

		if (enemy === Monster.get("dirty thieving brigand") && canUse$2(Skill.get("Become a Wolf")) && toInt(getProperty("_vampyreCloakeFormUses")) < 10)
		{
			return useSkill$2(Skill.get("Become a Wolf"));
		}

		if (canUse$2(Skill.get("Air Dirty Laundry")))
		{
			return useSkill$2(Skill.get("Air Dirty Laundry"));
		}

		if (canUse$2(Skill.get("Cowboy Kick")))
		{
			return useSkill$2(Skill.get("Cowboy Kick"));
		}

		if (canUse$2(Skill.get("Fire Death Ray")))
		{
			return useSkill$2(Skill.get("Fire Death Ray"));
		}

		if (canUse$2(Skill.get("Ply Reality")))
		{
			return useSkill$2(Skill.get("Ply Reality"));
		}

		if (canUse$4(Item.get("Rain-Doh indigo cup")))
		{
			return useItem$1(Item.get("Rain-Doh indigo cup"));
		}

		if (canUse$2(Skill.get("Summon Love Mosquito")))
		{
			return useSkill$2(Skill.get("Summon Love Mosquito"));
		}

		if (canUse$4(Item.get("tomayohawk-style reflex hammer")))
		{
			return useItem$1(Item.get("tomayohawk-style reflex hammer"));
		}
		//If you have tearaway pants equipped, use its skill
		if (canUse$2(Skill.get("Tear Away your Pants!")) && (getProperty("auto_forceNonCombatSource") === "" && !(auto_wantToSniff(enemy, myLocation()) && getSniffer$1(enemy) !== Skill.none) || monsterPhylum() === Phylum.get("plant")))
		{
			return useSkill$2(Skill.get("Tear Away your Pants!"));
		}
		// skills from Lathe weapons
		// Ebony Epee
		if (canUse$2(Skill.get("Disarming Thrust")))
		{
			return useSkill$2(Skill.get("Disarming Thrust"));
		}
		// Weeping Willow Wand
		if (canUse$2(Skill.get("Barrage of Tears")))
		{
			return useSkill$2(Skill.get("Barrage of Tears"));
		}
		// Poison Dart (from beechwood blowgun) is not used here
		// because it does not stagger the enemy like the others

		if (canUse$2(Skill.get("Cadenza")) && itemType(equippedItem(Slot.get("weapon"))) === "accordion")
		{
			if (Item.get(["Accordion of Jordion", "accordionoid rocca", "non-Euclidean non-accordion", "Shakespeare's Sister's Accordion", "zombie accordion"]).includes(equippedItem(Slot.get("weapon"))))
			{
				return useSkill$2(Skill.get("Cadenza"));
			}
		}
		//source terminal iotm specific skill to acquire source essence from enemies
		if (canUse$2(Skill.get("Extract")) && myMp() > mpCost(Skill.get("Extract")) * 3 && itemAmount(Item.get("Source essence")) <= 60 && canSurvive$1(2.0))
		{
			return useSkill$2(Skill.get("Extract"));
		}

		if (canUse$2(Skill.get("Extract Jelly")) && myMp() > mpCost(Skill.get("Extract Jelly")) * 3 && canSurvive$1(2.0) && myFamiliar() === Familiar.get("Space Jellyfish") && toInt(getProperty("_spaceJellyfishDrops")) < 3 && Element.get(["hot", "spooky", "stench"]).includes(monsterElement(enemy)))
		{
			return useSkill$2(Skill.get("Extract Jelly"));
		}

		if (canUse$2(Skill.get("Science! Fight with Medicine")) && myHp() * 2 < myMaxhp())
		{
			return useSkill$2(Skill.get("Science! Fight with Medicine"));
		}
		if (canUse$2(Skill.get("Science! Fight with Rational Thought")) && haveEffect(Effect.get("Rational Thought")) < 10)
		{
			return useSkill$2(Skill.get("Science! Fight with Rational Thought"));
		}

		if (canUse$4(Item.get("Time-Spinner")))
		{
			return useItem$1(Item.get("Time-Spinner"));
		}

		if (canUse$2(Skill.get("Sing Along")))
		{
			//15% devel, but no stun.

			if (canSurvive$1(2.0) && getProperty("boomBoxSong") === "Remainin' Alive")
			{
				return useSkill$2(Skill.get("Sing Along"));
			}
			//this is for increasing meat income. gain +25 meat per monster, at the cost of letting it act once. If healing is too costly this can be a net loss of meat. until a full cost calculator is made, limit to under 10 HP damage and no more than 20% of your remaining HP.

			if (canSurvive$1(5.0) && getProperty("boomBoxSong") === "Total Eclipse of Your Meat" && expectedDamage() < 10 && !in_wotsf())
			{
				return useSkill$2(Skill.get("Sing Along"));
			}
			//if doing nuns quest or wall of meat, disregard profit and only check if you can survive using sing along.

			if (canSurvive$1(3.0) && getProperty("boomBoxSong") === "Total Eclipse of Your Meat" && Monster.get(["dirty thieving brigand", "wall of meat"]).includes(enemy))
			{
				return useSkill$2(Skill.get("Sing Along"));
			}
		}
	}
	//Default behaviors, multi-staggers when chance is 50% or greater
	if (enemy_la < 100 && stunnable(enemy))
	{
		if (canUse$4(Item.get("Rain-Doh blue balls")))
		{
			return useItem$1(Item.get("Rain-Doh blue balls"));
		}

		if (canUse$2(Skill.get("Summon Love Gnats")))
		{
			return useSkill$2(Skill.get("Summon Love Gnats"));
		}

		if (!(haveEquipped(Item.get("protonic accelerator pack")) && isGhost(enemy)))
		{
			if (canUse$2(Skill.get("Summon Love Stinkbug")) && haveUsed(Skill.get("Summon Love Gnats")) && !containsText(text, "STUN RESIST"))
			{
				return useSkill$2(Skill.get("Summon Love Stinkbug"));
			}
		}
	}
	//weaksauce has probably already been cast in one of several checks above, except when above 150 ML, or without itchy curse finger or mp < 60
	if (canUse$2(Skill.get("Curse of Weaksauce")) && myClass() === Class.get("Sauceror") && (myMp() >= 32 || haveUsed(Skill.get("Stuffed Mortar Shell"))) && doWeaksauce)
	{
		return useSkill$2(Skill.get("Curse of Weaksauce"));
	}
	//turtle tamer specific damage over time
	if (myClass() === Class.get("Turtle Tamer") && canUse$2(Skill.get("Spirit Snap")) && myMp() > 80)
	{
		//storm turtle blessings makes spirit snap cause 15/20/25% buffed muscle as DoT for rest of combat
		//must not block stage4 so should not use if it will kill the monster
		if (haveEffect(Effect.get("Blessing of the Storm Tortoise")) > 0 && monsterHp() > 0.15 * myBuffedstat(Stat.get("Muscle")) || haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) > 0 && monsterHp() > 0.2 * myBuffedstat(Stat.get("Muscle")) || haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) > 0 && monsterHp() > 0.25 * myBuffedstat(Stat.get("Muscle")))
		{
			return useSkill$2(Skill.get("Spirit Snap"));
		}
	}
	// Multi-round stuns
	if (canUse$2(Skill.get("Thunderstrike")) && enemy_la <= 150 && !canSurvive$1(5.0))
	{
		combat_status_add("stunned");
		return useSkill$2(Skill.get("Thunderstrike"));
	}

	if (enemy_la <= 100 && stunnable(enemy) && (!canSurvive$1(5.0) || Monster.get(["Groar"]).includes(enemy)))
	{
		let stunner: Skill = getStunner(enemy);
		if (stunner !== Skill.none)
		{
			combat_status_add("stunned");
			return useSkill$2(stunner);
		}
	}
	if (auto_wantToBCZ(Skill.get("BCZ: Blood Geyser")) && canUse$2(Skill.get("BCZ: Blood Geyser")) && enemy_la <= 150 && !canSurvive$1(5.0))
	{
		combat_status_add("stunned");
		return useSkill$2(Skill.get("BCZ: Blood Geyser"));
	}

	return "";
}