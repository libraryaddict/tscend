import { ceil, containsText, Effect, equippedAmount, Familiar, getProperty, haveEffect, haveEquipped, indexOf, Item, itemAmount, Location, min, Monster, monsterPhylum, myAdventures, myBasestat, myDaycount, myFamiliar, myLightning, myLocation, myMp, myPrimestat, myTurncount, Phylum, setProperty, Skill, substring, toBoolean, toFamiliar, toInt, toItem, toMonster, toSkill } from "kolmafia";
import { auto_forceFreeRun, auto_have_skill, auto_is_valid, auto_log_debug$1, auto_log_info, auto_log_warning, auto_turbo, auto_wantToBanish, auto_wantToBanish$1, auto_wantToFreeRun, auto_wantToReplace, auto_wantToSniff, auto_wantToYellowRay, careAboutDrops, freeRunCombatString, freeRunCombatStringPreBanish, handleTracker, handleTracker$1, handleTracker$2, instakillable, internalQuestStatus, isFreeMonster$1, loopHandlerDelayAll, wrap_item } from "../auto_util";
import { auto_swoopLocations } from "../auto_zone";
import { auto_combatDarkGyffteStage2 } from "./auto_combat_dark_gyffte";
import { banisherCombatString, banisherCombatString$1, canUse$1, canUse$2, canUse$3, canUse$4, combat_status_add, combat_status_check, getSniffer$1, haveUsed, maxRoundsToDouse, replaceMonsterCombatString, useItem$1, useItems$1, useSkill$1, useSkill$2, wantToDouse, wantToForceDrop, yellowRayCombatString } from "./auto_combat_util";
import { auto_jokesterGunFreeKillAvailable } from "../iotms/mr2016";
import { auto_chestXraysRemaining } from "../iotms/mr2019";
import { auto_FireExtinguisherCombatString } from "../iotms/mr2021";
import { auto_dousesRemaining, auto_habitatMonster, wantToThrowGravel } from "../iotms/mr2023";
import { dartELRcd } from "../iotms/mr2024";
import { auto_bczRefractedGaze, auto_wantToBCZ, auto_wantToShrunkenHead } from "../iotms/mr2025";
import { wantToClubEmBackInTime } from "../iotms/mr2026";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { ag_is_bodyguard, in_avantGuard } from "../paths/avant_guard";
import { in_bugbear } from "../paths/bugbear_invasion";
import { inAftercore } from "../paths/casual";
import { getZooKickInstaKill } from "../paths/zootomist";
import { cyrptEvilBonus } from "../quests/level_07";
import { bridgeGoal } from "../quests/level_09";
import { towerKeyCount$1 } from "../quests/level_13";

//defined in /autoscend/combat/auto_combat_default_stage2.ash
export function auto_combatDefaultStage2(round_1: number, enemy: Monster, text: string): string
{
	// stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
	let retval: string = "";
	// Skip if have auto_skipStage2 is set
	if (toBoolean(getProperty("auto_skipStage2"))) { return ""; }
	//If in Avant Guard, want to make sure the enemy is set correctly to the bodyguard
	let guardee: Monster = Monster.none;
	if (in_avantGuard() && ag_is_bodyguard())
	{
		guardee = toMonster(substring(getProperty("lastEncounter"), indexOf(getProperty("lastEncounter"), " acting as the bodyguard to a ") + 30));
	}
	//if we want to olfact in stage 4 then we should delay stage 2 until we olfact.
	//we do not want to olfact now because we should do stage 3 first to stun and/or debuff the enemy first before olfacting.
	if (auto_wantToSniff(enemy, myLocation()) && getSniffer$1(enemy) !== Skill.none && !ag_is_bodyguard())
	{
		auto_log_debug$1(`Skipping stage 2 of combat for now as we intend to olfact [${enemy}]`);
		return "";
	}
	if (myLocation() === Location.get("The Daily Dungeon") && itemAmount(Item.get("daily dungeon malware")) > 0 && auto_is_valid(Item.get("daily dungeon malware")) && towerKeyCount$1(false) < 2 && !toBoolean(getProperty("_dailyDungeonMalwareUsed")))
	{
		auto_log_debug$1("Skipping stage 2 of combat for now as we intend to use Daily Dungeon Malware");
		return "";
	}
	// Path = dark gyffte
	retval = auto_combatDarkGyffteStage2(round_1, enemy, text);
	if (retval !== "") { return retval; }
	//Refracted Gaze sets drop table of monster to EVERYTHING else in zone so YRs are great
	//Monsters might be banished/freeran from/replaced because they are now useful so need to handle that too
	if (auto_bczRefractedGaze() && !combat_status_check("droptablereplaced") && auto_have_skill(Skill.get("BCZ: Refracted Gaze")))
	{
		handleTracker$1(enemy.toString(), Skill.get("BCZ: Refracted Gaze").toString(), "auto_otherstuff");
		combat_status_add("droptablereplaced");
		return useSkill$2(Skill.get("BCZ: Refracted Gaze"));
	}
	//use industrial fire extinguisher zone specific skills
	const extinguisherSkill: string = auto_FireExtinguisherCombatString(myLocation());
	if (extinguisherSkill !== "" && haveEquipped(wrap_item(Item.get("industrial fire extinguisher"))) && enemy !== Monster.get("screambat"))
	{
	//below is temp workaround for https://github.com/loathers/autoscend/issues/1011
		handleTracker$1(enemy.toString(), toSkill(substring(extinguisherSkill, 6)).toString(), "auto_otherstuff");
		return extinguisherSkill;
	}
	//instakill enemies in [The Red Zeppelin]
	if (canUse$3(Item.get("glark cable"), true) && myLocation() === Location.get("The Red Zeppelin") && getProperty("questL11Ron") === "step3" && toInt(getProperty("_glarkCableUses")) < 5)
	{
		if (Monster.get(["man with the red buttons", "red butler", "Red Fox", "red skeleton"]).includes(enemy))
		{
			handleTracker$1(enemy.toString(), Item.get("glark cable").toString(), "auto_instakill");
			return useItem$1(Item.get("glark cable"));
		}
	}
	//instakill enemies in [A Mob Of Zeppelin Protesters]
	if (canUse$4(Item.get("cigarette lighter")) && myLocation() === Location.get("A Mob of Zeppelin Protesters") && getProperty("questL11Ron") === "step1")
	{
		handleTracker$1(enemy.toString(), Item.get("cigarette lighter").toString(), "auto_instakill");
		return useItems$1(Item.get("cigarette lighter"), Item.none);
	}
	//instakill using [Power Pill] which is iotm familiar derivative
	if (toBoolean(getProperty("auto_usePowerPill")) && toInt(getProperty("_powerPillUses")) < 20 && instakillable(enemy))
	{
		if (itemAmount(Item.get("power pill")) > 0)
		{
			handleTracker$1(enemy.toString(), Item.get("power pill").toString(), "auto_instakill");
			return `item ${Item.get("power pill")}`;
		}
	}
	//instakill using [Pair of Stomping Boots] iotm familiar which will produce spleen consumables
	if (myFamiliar() === Familiar.get("Pair of Stomping Boots") && toInt(getProperty("_bootStomps")) < 7 && instakillable(enemy) && toBoolean(getProperty("bootsCharged")))
	{
		//neither the below checks nor careAboutDrops are complete enough
		if (!(Monster.get(["dairy goat", "lobsterfrogman"]).includes(enemy)) && !careAboutDrops(enemy) && !(Location.get(["The Laugh Floor", "Infernal Rackets Backstage"]).includes(myLocation())) && canUse$2(Skill.get("Release the Boots")))
		{
			return useSkill$2(Skill.get("Release the Boots"));
		}
	}
	// Dupe Tomb Rat King drops with pro skateboard
	if (enemy === Monster.get("tomb rat king") && itemAmount(Item.get("crumbling wooden wheel")) + itemAmount(Item.get("tomb ratchet")) < 10 && canUse$2(Skill.get("Do an epic McTwist!")) && !toBoolean(getProperty("_epicMcTwistUsed")))
	{
		handleTracker$1(enemy.toString(), Skill.get("Do an epic McTwist!").toString(), "auto_otherstuff");
		return useSkill$2(Skill.get("Do an epic McTwist!"));
	}
	// Dupe Mountain Man drops with pro skateboard on day 1, not in turbo
	if (enemy === Monster.get("mountain man") && myDaycount() === 1 && !auto_turbo() && canUse$2(Skill.get("Do an epic McTwist!")) && !toBoolean(getProperty("_epicMcTwistUsed")))
	{
		handleTracker$1(enemy.toString(), Skill.get("Do an epic McTwist!").toString(), "auto_otherstuff");
		return useSkill$2(Skill.get("Do an epic McTwist!"));
	}

	if (auto_wantToShrunkenHead(enemy))
	{
		handleTracker$1(enemy.toString(), Skill.get("Prepare to reanimate your Foe").toString(), "auto_otherstuff");
		return useSkill$2(Skill.get("Prepare to reanimate your Foe"));
	}
	// yellowray instantly kills the enemy and makes them drop all items they can drop.
	// don't yellow ray if we'll be dousing
	const douse: Skill = Skill.get("Douse Foe");
	const isDouseTarget: boolean = wantToDouse(enemy) && round_1 < maxRoundsToDouse(enemy) - 1; // dousing can have a low chance of success, so only do it for a while then yellow
	const douseAvailable: boolean = canUse$1(douse, false) && auto_dousesRemaining() > 0;
	const willDouse: boolean = isDouseTarget && douseAvailable;
	// And don't yellow ray if we'll be swooping
	const swoopAvailable: boolean = canUse$1(Skill.get("Swoop like a Bat"), true) && toInt(getProperty("_batWingsSwoopUsed")) < 11;
	const willSwoop: boolean = auto_swoopLocations().has(myLocation()) && swoopAvailable;

	if ((!combat_status_check("yellowray") && auto_wantToYellowRay(enemy, myLocation()) || combat_status_check("droptablereplaced")) && !willDouse && !willSwoop)
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
	//convert enemy into a helpless frog/newt/lizard
	if (toBoolean(getProperty("auto_useCleesh")))
	{
		if (canUse$2(Skill.get("CLEESH")))
		{
			setProperty("auto_useCleesh", false.toString());
			return useSkill$2(Skill.get("CLEESH"));
		}
	}
	//club em back in time to free kill the enemy but don't get any items
	if (wantToClubEmBackInTime(myLocation(), enemy))
	{
		if (canUse$2(Skill.get("Club 'Em Back in Time")))
		{
			handleTracker$1(enemy.toString(), Skill.get("Club 'Em Back in Time").toString(), "auto_instakill");
			return useSkill$2(Skill.get("Club 'Em Back in Time"));
		}
	}
	//throw gravel to free kill the enemy but don't get any items
	if (wantToThrowGravel(myLocation(), enemy))
	{
		handleTracker$1(enemy.toString(), Item.get("groveling gravel").toString(), "auto_instakill");
		return useItem$1(Item.get("groveling gravel"));
	}
	// Free run before banishing for a few monsters
	if (!combat_status_check("banishercheck") && !combat_status_check("droptablereplaced") && auto_wantToBanish(enemy, myLocation()))
	{
		const freeRunAction: string = freeRunCombatStringPreBanish(enemy, myLocation(), true);
		if (freeRunAction !== "")
		{
			if (indexOf(freeRunAction, "skill") === 0)
			{
				handleTracker$1(enemy.toString(), toSkill(substring(freeRunAction, 6)).toString(), "auto_freeruns");
			}
			else if (indexOf(freeRunAction, "item") === 0)
			{
				handleTracker$1(enemy.toString(), toItem(substring(freeRunAction, 5)).toString(), "auto_freeruns");
			}
			else {
				auto_log_warning(`Unable to track runaway behavior: ${freeRunAction}`, "red");
			}
			return freeRunAction;
		}
	}

	if (!combat_status_check("banishercheck") && !combat_status_check("phylumbanishercheck") && !combat_status_check("droptablereplaced") && auto_wantToBanish$1(monsterPhylum(enemy), myLocation()) && auto_habitatMonster() !== enemy)
	{
		const banishAction: string = banisherCombatString(monsterPhylum(enemy), myLocation(), true);
		if (banishAction !== "")
		{
			auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
			combat_status_add("banisher");
			if (indexOf(banishAction, "skill") === 0)
			{
				handleTracker$2(monsterPhylum(enemy).toString(), myLocation().toString(), toSkill(substring(banishAction, 6)).toString(), "auto_banishes");
			}
			else if (indexOf(banishAction, "item") === 0)
			{
				handleTracker$2(monsterPhylum(enemy).toString(), myLocation().toString(), toItem(substring(banishAction, 5)).toString(), "auto_banishes");
			}
			else {
				auto_log_warning(`Unable to track banisher behavior: ${banishAction}`, "red");
			}
			return banishAction;
		}
		//we wanted to banish an enemy and failed. set a property so we do not bother trying in subsequent rounds
		combat_status_add("phylumbanishercheck");
	}
	// Free run in Avant Guard from Bodyguard before banishing for a few monsters
	if (!combat_status_check("banishercheck") && !combat_status_check("droptablereplaced") && auto_wantToBanish(guardee, myLocation()))
	{
		const freeRunAction: string = freeRunCombatStringPreBanish(enemy, myLocation(), true);
		if (freeRunAction !== "")
		{
			if (indexOf(freeRunAction, "skill") === 0)
			{
				handleTracker$1(enemy.toString(), toSkill(substring(freeRunAction, 6)).toString(), "auto_freeruns");
			}
			else if (indexOf(freeRunAction, "item") === 0)
			{
				handleTracker$1(enemy.toString(), toItem(substring(freeRunAction, 5)).toString(), "auto_freeruns");
			}
			else {
				auto_log_warning(`Unable to track runaway behavior: ${freeRunAction}`, "red");
			}
			return freeRunAction;
		}
	}

	if (!combat_status_check("banishercheck") && !combat_status_check("phylumbanishercheck") && !combat_status_check("droptablereplaced") && auto_wantToBanish(enemy, myLocation()) && !ag_is_bodyguard())
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
		//we wanted to banish an enemy and failed or banisher did not end combat.
		//set a property so we do not bother trying in subsequent rounds
		combat_status_add("banishercheck");
	}
	// Free run from monsters we want to banish/phylumbanish but are unable to, or monsters on the free run list
	if (!combat_status_check("freeruncheck") && !combat_status_check("droptablereplaced") && (auto_wantToFreeRun(enemy, myLocation()) || auto_forceFreeRun(true) || auto_wantToBanish(enemy, myLocation()) || auto_wantToBanish$1(monsterPhylum(enemy), myLocation()) && auto_habitatMonster() !== enemy || (auto_wantToFreeRun(guardee, myLocation()) || auto_wantToBanish(guardee, myLocation()))))
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

	if (!combat_status_check("replacercheck") && !combat_status_check("droptablereplaced") && auto_wantToReplace(enemy, myLocation()))
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
				if (containsText(combatAction, ", none"))
				{
					const commapos: number = indexOf(combatAction, ", none");
					handleTracker$1(enemy.toString(), toItem(substring(combatAction, 5, commapos)).toString(), "auto_replaces");
				}
				else {
					handleTracker$1(enemy.toString(), toItem(substring(combatAction, 5)).toString(), "auto_replaces");
				}
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
	//convert enemy [Tomb rat] into [Tomb rat king]
	if (enemy === Monster.get("tomb rat") && itemAmount(Item.get("tangle of rat tails")) > 0 && itemAmount(Item.get("tomb ratchet")) + itemAmount(Item.get("crumbling wooden wheel")) < 10 && (Location.get("The Middle Chamber")).fireLevel < 3)
	{ //wildfire path. ratchets do not burn. king ratchets burn. fire == 0 in other paths
	//actually need ratchets
		let res: string = `item ${Item.get("tangle of rat tails")}`;
		if (auto_have_skill(Skill.get("Ambidextrous Funkslinging")))
		{
			res += ", none";
		}
		return res;
	}
	// Bugbear Invasion
	if (in_bugbear())
	{
		if (enemy === Monster.get("bugbear scientist") && itemAmount(Item.get("quantum nanopolymer spider web")) > 0)
		{
			return `item ${Item.get("quantum nanopolymer spider web")}`;
		}
		if (enemy === Monster.get("liquid metal bugbear") && itemAmount(Item.get("drone self-destruct chip")) > 0)
		{
			return `item ${Item.get("drone self-destruct chip")}`;
		}
	}
	// Instakill handler
	let couldInstaKill: boolean = true;
	if (Monster.get(["smut orc pipelayer", "smut orc jacker", "smut orc screwer", "smut orc nailer"]).includes(enemy) && toInt(getProperty("chasmBridgeProgress")) < bridgeGoal())
	{
		//want to do cold damage in stage3
		if (myAdventures() > 6)
		{
			couldInstaKill = false;
		}
	}
	else if (Monster.get(["lobsterfrogman"]).includes(enemy))
	{
		if (auto_have_skill(Skill.get("Digitize")) && getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString())
		{
			couldInstaKill = false;
		}
	}
	else if (Monster.get(["Racecar Bob", "Bob Racecar"]).includes(enemy) && itemAmount(Item.get("photograph of a dog")) === 0 && internalQuestStatus("questL11Palindome") < 2)
	{
		//don't want to instakill if we haven't used the disposable camera yet
		couldInstaKill = false;
	}
	else if (wantToForceDrop(enemy))
	{
		//want drops from this enemy
		couldInstaKill = false;
	}
	else if (Monster.get(["dirty thieving brigand"]).includes(enemy))
	{
		//want meat drops. Free fights cap meat drop to 1k
		couldInstaKill = false;
	}

	if (instakillable(enemy) && !isFreeMonster$1(enemy, myLocation()) && couldInstaKill)
	{
		let wantFreeKillNowEspecially: boolean = false;

		let waitForDesert: boolean = false; //free kills can save turns of Ultrahydrated
		if (toInt(getProperty("desertExploration")) < 100 && !isActuallyEd())
		{ //need to explore desert
			const currentDesertProgressPerTurn: number = 1 + ((toBoolean(getProperty("bondDesert")) ? 2 : 0)) + ((getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb" ? 2 : 0)) + ((myFamiliar() === Familiar.get("Melodramedary") ? 1 : 0)) + 2 * min(1, equippedAmount(Item.get("survival knife"))) + equippedAmount(Item.get("UV-resistant compass")) + 2 * equippedAmount(Item.get("ornate dowsing rod"));
			const fightsLeftToExplore: number = ceil((100 - toInt(getProperty("desertExploration"))) / currentDesertProgressPerTurn);
			if (haveEffect(Effect.get("Ultrahydrated")) > 0 && haveEffect(Effect.get("Ultrahydrated")) < fightsLeftToExplore)
			{
				wantFreeKillNowEspecially = true;
			}
			else {
			//near level 11
				waitForDesert = myBasestat(myPrimestat()) >= 95;
			}
		}

		let waitForCyrpt: boolean = false; //free kills can get more modern zmobies from 1 turn of a double initiative effect in The Defiled Alcove
		if (toInt(getProperty("cyrptAlcoveEvilness")) >= 18 + cyrptEvilBonus(true))
		{ //need to do Alcove
			if (myLocation() === Location.get("The Defiled Alcove") && haveEffect(Effect.get("Bow-Legged Swagger")) === 1)
			{
				wantFreeKillNowEspecially = true;
			}
			else if (auto_have_skill(Skill.get("Bow-Legged Swagger")) && myBasestat(myPrimestat()) >= 35 && !toBoolean(getProperty("_bowleggedSwaggerUsed")))
			{
				waitForCyrpt = true; //near level 7
			}
		}
		//free kills can get more benefit from 1 turn of a double item bonus effect in zones that need high item
		if (haveEffect(Effect.get("Steely-Eyed Squint")) === 1 && Location.get(["The Haunted Wine Cellar", "The Haunted Laundry Room", "The Hatching Chamber", "The Feeding Chamber", "The Royal Guard Chamber"]).includes(myLocation()))
		{
			wantFreeKillNowEspecially = true;
		}

		const reserveFreekills: boolean = myAdventures() >= 9 && !wantFreeKillNowEspecially && (waitForDesert || waitForCyrpt);

		if (canUse$2(Skill.get("Darts: Aim for the Bullseye")) && haveEffect(Effect.get("Everything Looks Red")) === 0 && dartELRcd() <= 40)
		{
			setProperty("auto_instakillSource", "darts bullseye");
			setProperty("auto_instakillSuccess", true.toString());
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("Darts: Aim for the Bullseye"));
		}

		if (canUse$2(Skill.get("Free-For-All")) && haveEffect(Effect.get("Everything Looks Red")) === 0 && (wantFreeKillNowEspecially || !reserveFreekills) && myMp() > 80)
		{ //Only want to cast this when you have mp to spare because it is 50mp
			handleTracker$1(enemy.toString(), Skill.get("Free-For-All").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("Free-For-All"));
		}

		if (canUse$2(Skill.get("Lightning Strike")) && (wantFreeKillNowEspecially || !reserveFreekills || myLightning() >= 60))
		{
			handleTracker$1(enemy.toString(), Skill.get("Lightning Strike").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("Lightning Strike"));
		}
		//Depending on the fam used for instakill, it could be a turn free YR, or it could be turn taking and not a YR, but still give ELY.
		const z_kick: Skill = getZooKickInstaKill();
		if (canUse$2(z_kick))
		{
			setProperty("auto_instakillSource", "zootomist kick");
			setProperty("auto_instakillSuccess", true.toString());
			loopHandlerDelayAll();
			return useSkill$2(z_kick);
		}

		if (canUse$2(Skill.get("Chest X-Ray")) && auto_chestXraysRemaining() > 0)
		{
			if (wantFreeKillNowEspecially || !reserveFreekills || inAftercore() || myDaycount() >= 3)
			{
				handleTracker$1(enemy.toString(), Skill.get("Chest X-Ray").toString(), "auto_instakill");
				loopHandlerDelayAll();
				return useSkill$2(Skill.get("Chest X-Ray"));
			}
		}

		if (canUse$2(Skill.get("Fire the Jokester's Gun")) && auto_jokesterGunFreeKillAvailable() && (wantFreeKillNowEspecially || !reserveFreekills))
		{
			handleTracker$1(enemy.toString(), Skill.get("Fire the Jokester's Gun").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("Fire the Jokester's Gun"));
		}

		if (auto_wantToBCZ(Skill.get("BCZ: Sweat Bullets")) && (wantFreeKillNowEspecially || !reserveFreekills))
		{
			handleTracker$1(enemy.toString(), Skill.get("BCZ: Sweat Bullets").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("BCZ: Sweat Bullets"));
		}

		if (canUse$2(Skill.get("Shattering Punch")) && toInt(getProperty("_shatteringPunchUsed")) < 3 && !reserveFreekills)
		{
			if (!wantFreeKillNowEspecially && myDaycount() === 1 && myTurncount() < 100 && myMp() < 80)
			{
				//avoid sudden drain of 3x30 MP just 20 turns after the run starts, there is no mp regen or sauceror mp when using this
			}
			else {
				handleTracker$1(enemy.toString(), Skill.get("Shattering Punch").toString(), "auto_instakill");
				loopHandlerDelayAll();
				return useSkill$2(Skill.get("Shattering Punch"));
			}
		}
		if (canUse$2(Skill.get("Gingerbread Mob Hit")) && !toBoolean(getProperty("_gingerbreadMobHitUsed")) && !reserveFreekills && myMp() > 50)
		{
			handleTracker$1(enemy.toString(), Skill.get("Gingerbread Mob Hit").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useSkill$2(Skill.get("Gingerbread Mob Hit"));
		}
		//		Can not use _usedReplicaBatoomerang if we have more than 1 because of the double item use issue...
		//		Sure, we can try to use a second item (if we have it or are forced to buy it... ugh).
		//		if(!combat_status_check("batoomerang") && (item_amount($item[Replica Bat-oomerang]) > 0) && (get_property("_usedReplicaBatoomerang").to_int() < 3))
		//		THIS IS COPIED TO THE ED SECTION, IF IT IS FIXED, FIX IT THERE TOO!
		if (canUse$4(Item.get("replica bat-oomerang")) && !reserveFreekills)
		{
			if (toInt(getProperty("auto_batoomerangDay")) !== myDaycount())
			{
				setProperty("auto_batoomerangDay", myDaycount().toString());
				setProperty("auto_batoomerangUse", (0).toString());
			}
			if (toInt(getProperty("auto_batoomerangUse")) < 3)
			{
				setProperty("auto_batoomerangUse", (toInt(getProperty("auto_batoomerangUse")) + 1).toString());
				handleTracker$1(enemy.toString(), Item.get("replica bat-oomerang").toString(), "auto_instakill");
				loopHandlerDelayAll();
				return useItem$1(Item.get("replica bat-oomerang"));
			}
		}

		if (canUse$4(Item.get("shadow brick")) && toInt(getProperty("_shadowBricksUsed")) < 13 && !reserveFreekills)
		{
			handleTracker$1(enemy.toString(), Item.get("shadow brick").toString(), "auto_instakill");
			loopHandlerDelayAll();
			return useItems$1(Item.get("shadow brick"), Item.none);
		}

	} // instakills
	//wearing [retro superhero cape] iotm set to vampire slicer mode instakills Undead and reduces evilness in Cyrpt zones.
	if (canUse$2(Skill.get("Slay the Dead")) && enemy.phylum === Phylum.get("undead"))
	{
		return useSkill$2(Skill.get("Slay the Dead"));
	}
	//autokill duplicated enemies. this still costs a turn
	if (canUse$4(Item.get("exploding cigar")) && haveUsed(Skill.get("Duplicate")))
	{
		return useItem$1(Item.get("exploding cigar"));
	}
	// Slaughter is an instakill, but not free; only use if you have no other options and never when we want free kill
	if (canUse$2(Skill.get("Slaughter")) && haveEffect(Effect.get("Everything Looks Red")) === 0)
	{
		setProperty("auto_instakillSource", "slaughter");
		setProperty("auto_instakillSuccess", true.toString());
		loopHandlerDelayAll();
		return useSkill$2(Skill.get("Slaughter"));
	}

	return "";
}
