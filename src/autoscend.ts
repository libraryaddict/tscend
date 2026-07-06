import { Class, Coinmaster, Effect, Element, Familiar, Item, Location, Monster, Skill, Slot, Stat, abort, availableAmount, buy, canDrink, canEat, canInteract, ceil, cliExecute, combatRateModifier, containsText, council, currentMcd, equip, equippedItem, experienceBonus, familiarEquippedEquipment, fullnessLimit, getAutoAttack, getClanRumpus, getProperty, getRevision, getWorkshed, gitInfo, guildStoreAvailable, haveEffect, haveEquipped, haveFamiliar, haveSkill, hiddenTempleUnlocked, hippyStoneBroken, inBadMoon, inHardcore, inebrietyLimit, isUnrestricted, itemAmount, itemDropModifier, knollAvailable, lastMonster, mallPrices, max, meatDropModifier, min, minstrelInstrument, monsterLevelAdjustment, mpCost, myAdventures, myAscensions, myBuffedstat, myClass, myDaycount, myFamiliar, myFullness, myHp, myInebriety, myLevel, myLightning, myLocation, myMaxhp, myMaxmp, myMeat, myMp, myName, myPath, myRain, mySessionAdv, mySoulsauce, mySpleenUse, myThunder, myTurncount, npcPrice, print, printHtml, pullsRemaining, putCloset, removeProperty, runChoice, setAutoAttack, setLocation, setProperty, spleenLimit, splitString, squareRoot, storageAmount, substring, toBoolean, toFamiliar, toFloat, toInt, toItem, toMonster, toSlot, todayToString, totalTurnsPlayed, use, useFamiliar, useSkill, userConfirm, visitUrl, wait } from "kolmafia";
import { LX_craftAcquireItems, acquireGumItem, acquireHermitItem, acquireTotem, auto_buyUpTo, handlePulls, pullXWhenHaveY, pulverizeThing } from "./autoscend/auto_acquire";
import { autoAdv$1, autoAdv$2 } from "./autoscend/auto_adventure";
import { doBedtime } from "./autoscend/auto_bedtime";
import { buffMaintain$4 } from "./autoscend/auto_buff";
import { autoCleanse, consumeStuff, consumptionProgress } from "./autoscend/auto_consume";
import { addToMaximize, ensureSealClubs, equipBaseline, equipMaximizedGear, equipStatgainIncreasers$2, possessEquipment, possessOutfit$1, resetMaximize } from "./autoscend/auto_equipment";
import { auto_have_familiar, canChangeToFamiliar, doNotBuffFamiliar100Run, findNonRockFamiliarInTerrarium, handleFamiliar$1, is100FamRun, pathAllowsChangingFamiliar, pathHasFamiliar } from "./autoscend/auto_familiar";
import { auto_freeCombatsRemaining } from "./autoscend/auto_powerlevel";
import { acquireHP, invalidateRestoreOptionCache } from "./autoscend/auto_restore";
import { solveDelayZone } from "./autoscend/auto_routing";
import { auto_settings, auto_settingsFix } from "./autoscend/auto_settings";
import { printSim } from "./autoscend/auto_sim";
import { adjustForYellowRayIfPossible, almostRollover, autoCraft, auto_amIRich, auto_autosell, auto_get_campground, auto_have_skill, auto_interruptCheck, auto_is_valid, auto_log_debug, auto_log_debug$1, auto_log_info, auto_log_info$1, auto_log_warning, auto_meetsMinimumRequirements, auto_needAccordion, auto_predictAccordionTurns, backupSetting, banishSources, basicAdjustML, can_read_skillbook, copySources, doNumberology, doNumberology$2, freeCrafts$1, freeKillSources, freeRunSources, handleBarrelFullOfBarrels, handleSealElement, handleSealNormal, instaKillSources, internalQuestStatus, isArmoryAvailable, isFreeMonster, isHermitAvailable, isUnclePAvailable, maxSealSummons, meatReserveMessage, needToConsumeForEmergencyRollover, ovenHandle, restoreAllSettings, sniffSources, trim, use_barrels, yellowRaySources } from "./autoscend/auto_util";
import { fileAsMap } from "./autoscend/utils/kolmafiaUtils";
import { autoscend_migrate } from "./autoscend/autoscend_migration";
import { auto_floundryAction, auto_get_clan_lounge, zataraClanmate } from "./autoscend/iotms/clan";
import { elementalPlanes_access } from "./autoscend/iotms/elementalPlanes";
import { eudora_initializeSettings } from "./autoscend/iotms/eudora";
import { makeStartingSmiths, oldPeoplePlantStuff } from "./autoscend/iotms/mr2013";
import { dna_generic, dna_sorceressTest, dna_startAcquire, handleBjornify, icehouseUserErrorProtection } from "./autoscend/iotms/mr2014";
import { auto_barrelPrayers, chateaumantegna_havePainting, chateaumantegna_useDesk, chateaumantegna_usePainting, deck_useScheme } from "./autoscend/iotms/mr2015";
import { LX_ghostBusting, auto_chapeau, auto_doPrecinct, auto_sourceTerminalEducate, auto_sourceTerminalRequest, isOverdueDigitize, witchessFights } from "./autoscend/iotms/mr2016";
import { asdonAutoFeed, horseDefault, kgbSetup, kgb_getMartini, loveTunnelAcquire, makeGeniePocket } from "./autoscend/iotms/mr2017";
import { auto_latteRefill$6, auto_setSongboom, auto_voteMonster$1, auto_voteMonster$2, auto_voteSetup$2, cheeseWarMachine, fightClubNap, fightClubStats, neverendingPartyAvailable } from "./autoscend/iotms/mr2018";
import { auto_beachCombHead, auto_campawayGrabBuffs, auto_saberDailyUpgrade, auto_sausageGoblin, auto_sausageGoblin$2, auto_spoonTuneConfirm, auto_spoonTuneMoon } from "./autoscend/iotms/mr2019";
import { auto_birdOfTheDay, auto_buyCrimboCommerceMallItem, auto_getGuzzlrCocktailSet, auto_latheAppropriateWeapon } from "./autoscend/iotms/mr2020";
import { auto_CMCconsult, auto_backupTarget, auto_backupToYourLastEnemy, auto_buyFireworksHat, auto_enableBackupCameraReverser, auto_harvestBatteries } from "./autoscend/iotms/mr2021";
import { auto_autumnatonQuest, auto_checkTrainSet, auto_juneCleaverAdventure, auto_voidMonster, auto_voidMonster$1, prioritizeGoose } from "./autoscend/iotms/mr2022";
import { auto_SITCourse, auto_buyFrom2002MrStore, auto_defaultBurnLeaves, auto_doPhoneQuest, auto_habitatMonster, auto_initBurningLeaves, auto_lostStomach$1, auto_scepterSkills, auto_useBlackMonolith, pickRocks, rockGardenEnd } from "./autoscend/iotms/mr2023";
import { auto_MayamAllUsed, auto_MayamClaimAll, auto_buyFromSeptEmberStore, auto_getAprilingBandItems, auto_getClanPhotoBoothDefaultItems, auto_getClanPhotoBoothEffect$3, auto_haveMayamCalendar } from "./autoscend/iotms/mr2024";
import { auto_getBCZItems, auto_getGlobs, auto_openMcLargeHugeSkis, auto_setLeprecondo, auto_useLeprecondoDrops, auto_waveTheZone } from "./autoscend/iotms/mr2025";
import { auto_useWardrobe } from "./autoscend/iotms/ttt";
import { ed_initializeDay, ed_initializeSession, ed_initializeSettings, isActuallyEd } from "./autoscend/paths/actually_ed_the_undying";
import { LM_adventurerMeatsWorld, amw_initializeSettings, in_amw } from "./autoscend/paths/adventurer_meats_world";
import { auto_buySkills, pathDroppedCheck } from "./autoscend/paths/auto_path_util";
import { ag_initializeSettings, in_avantGuard } from "./autoscend/paths/avant_guard";
import { LM_boris, boris_buySkills, boris_initializeDay, boris_initializeSettings, is_boris } from "./autoscend/paths/avatar_of_boris";
import { LM_jarlsberg, is_jarlsberg, jarlsberg_buySkills, jarlsberg_initializeDay, jarlsberg_initializeSettings } from "./autoscend/paths/avatar_of_jarlsberg";
import { aosol_buySkills, aosol_initializeSettings, aosol_unCurse } from "./autoscend/paths/avatar_of_shadows_over_loathing";
import { LM_pete, is_pete, pete_buySkills, pete_initializeDay, pete_initializeSettings } from "./autoscend/paths/avatar_of_sneaky_pete";
import { awol_buySkills, awol_initializeSettings, awol_useStuff } from "./autoscend/paths/avatar_of_west_of_loathing";
import { LM_bhy, bhy_initializeSettings, in_bhy } from "./autoscend/paths/bees_hate_you";
import { bugbear_initializeSettings } from "./autoscend/paths/bugbear_invasion";
import { LM_canInteract, casualCheck, inAftercore } from "./autoscend/paths/casual";
import { in_community } from "./autoscend/paths/community_service";
import { LM_batpath, bat_formNone, bat_initializeDay, bat_initializeSession, bat_initializeSettings, in_darkGyffte } from "./autoscend/paths/dark_gyffte";
import { disguises_initializeSettings } from "./autoscend/paths/disguises_delimit";
import { fotd_initializeSettings } from "./autoscend/paths/fall_of_the_dinosaurs";
import { LM_glover, glover_initializeDay, glover_initializeSettings, in_glover } from "./autoscend/paths/g_lover";
import { LM_gnoob } from "./autoscend/paths/gelatinous_noob";
import { LA_grey_goo_tasks, in_ggoo } from "./autoscend/paths/grey_goo";
import { ht_equip_hats } from "./autoscend/paths/hattrick";
import { heavyrains_buySkills, heavyrains_initializeDay, heavyrains_initializeSettings, in_heavyrains } from "./autoscend/paths/heavy_rains";
import { iluh_buyEquiq } from "./autoscend/paths/i_love_u_hate";
import { in_koe, koe_acquire_rmi$1, koe_initializeSettings, koe_rmi_count } from "./autoscend/paths/kingdom_of_exploathing";
import { LM_kolhs, kolhs_initializeSettings } from "./autoscend/paths/kolhs";
import { auto_LegacyOfLoathingDailies, lol_buyReplicas, lol_initializeSettings } from "./autoscend/paths/legacy_of_loathing";
import { LM_bond, bond_initializeSettings } from "./autoscend/paths/license_to_adventure";
import { LM_lar, in_lar, lar_safeguard } from "./autoscend/paths/live_ascend_repeat";
import { lowkey_initializeSettings } from "./autoscend/paths/low_key_summer";
import { LM_nuclear, nuclear_initializeDay, nuclear_initializeSettings } from "./autoscend/paths/nuclear_autumn";
import { ocrs_postCombatResolve } from "./autoscend/paths/one_crazy_random_summer";
import { LM_plumber, in_plumber, plumber_canDealScalingDamage, plumber_equipTool$1, plumber_initializeSettings } from "./autoscend/paths/path_of_the_plumber";
import { picky_pulls } from "./autoscend/paths/picky";
import { in_pokefam, pokefam_getHats, pokefam_initializeSettings } from "./autoscend/paths/pocket_familiars";
import { auto_refreshQTFam, qt_initializeSettings } from "./autoscend/paths/quantum_terrarium";
import { auto_smallCampgroundGear, small_initializeSettings } from "./autoscend/paths/small";
import { LX_theSource, in_theSource, theSource_buySkills, theSource_initializeSettings, theSource_oracle } from "./autoscend/paths/the_source";
import { in_wotsf } from "./autoscend/paths/way_of_the_surprising_fist";
import { in_wereprof, is_werewolf, wereprof_initializeSettings } from "./autoscend/paths/wereprofessor";
import { LA_wildfire, LX_wildfire_calculateTheUniverse, in_wildfire, wildfire_initializeSettings } from "./autoscend/paths/wildfire";
import { LA_robot, LM_robot, in_robot, robot_initializeSettings } from "./autoscend/paths/you_robot";
import { LM_zombieSlayer, zombieSlayer_buySkills, zombieSlayer_initializeSettings } from "./autoscend/paths/zombie_slayer";
import { LX_zootoFight, zoo_graftFam } from "./autoscend/paths/zootomist";
import { tootGetMeat, tootOriole } from "./autoscend/quests/level_01";
import { L8_mountainManSummon } from "./autoscend/quests/level_08";
import { finishBuildingSmutOrcBridge } from "./autoscend/quests/level_09";
import { auto_warSide } from "./autoscend/quests/level_12";
import { beehiveConsider, ns_crowd3 } from "./autoscend/quests/level_13";
import { LX_ForceNC, LX_dronesOut, LX_handleIntroAdventures, useTonicDjinn } from "./autoscend/quests/level_any";
import { houseUpgrade } from "./autoscend/quests/optional";
import { callRegisteredTaskFunction } from "./autoscend/task_registry";
import { AshMatcher } from "./autoscend/utils/kolmafiaUtils";

// non-thrifty familiars are unusable in thrifty
/***
	autoscend_header.ash must be first import
	All non-accessory scripts must be imported here
	Accessory scripts can import autoscend.ash
***/
//this file contains its own header. so it needs to be imported early

//Defined in autoscend.ash
export function initializeSettings(): void {

	if (inAftercore()) {
		return;
	}
	// called once per ascension on the first launch of the script.
	// should not handle anything other than intialising properties etc.
	// all paths that have extra settings should call their path specific
	// initialise function at the end of this function (may override properties set in here).
	//if we detected a path drop we need to reinitialize. either due to dropping a path or breaking ronin in some paths.
	const reinitialize: boolean = toBoolean(getProperty("_auto_reinitialize"));
	if (!reinitialize && myAscensions() === toInt(getProperty("auto_doneInitialize")))
	{
		return; //already initialized settings this ascension
	}
	setLocation(Location.none);
	invalidateRestoreOptionCache();

	if (!reinitialize)
	{
		setProperty("auto_100familiar", Familiar.none.toString());
		if (myFamiliar() !== Familiar.none && pathAllowsChangingFamiliar())
		{ //If we can't control familiar changes, no point setting 100% familiar data
			const userAnswer: boolean = userConfirm("Familiar already set, is this a 100% familiar run? Will default to 'No' in 15 seconds.", 15000, false);
			if (userAnswer)
			{
				setProperty("auto_100familiar", myFamiliar().toString());
			}
		}
		//check for a workshed
		if (getWorkshed() !== Item.none)
		{
			const userAnswer: boolean = userConfirm("Workshed already set, do you want Autoscend to handle your workshed? Will default to 'Yes' in 15 seconds.", 15000, true);
			if (userAnswer)
			{
				setProperty("auto_workshed", "auto");
			}
			else {
				setProperty("auto_workshed", getWorkshed().toString());
			}
		}
	}

	auto_spoonTuneConfirm();

	icehouseUserErrorProtection();

	setProperty("auto_abooclover", true.toString());
	setProperty("auto_aboopending", (0).toString());
	setProperty("auto_avalancheDeployed", false.toString());
	setProperty("auto_banishes", "");
	setProperty("auto_batoomerangDay", (0).toString());
	setProperty("auto_beatenUpCount", (0).toString());
	setProperty("auto_beatenUpLastAdv", false.toString());
	removeProperty("auto_beatenUpLocations");
	setProperty("auto_getBeehive", false.toString());
	setProperty("auto_bruteForcePalindome", false.toString());
	setProperty("auto_doWhiteys", false.toString());
	setProperty("auto_cabinetsencountered", (0).toString());
	setProperty("auto_chasmBusted", true.toString());
	setProperty("auto_chewed", "");
	setProperty("auto_clanstuff", "0");
	setProperty("auto_considerCCSCShore", true.toString());
	setProperty("auto_copies", "");
	setProperty("auto_dakotaFanning", false.toString());
	setProperty("auto_day_init", (0).toString());
	setProperty("auto_day1_dna", "");
	setProperty("auto_day2WaitLastLevel", "0");
	setProperty("auto_debuffAsdonDelay", (0).toString());
	setProperty("auto_disableAdventureHandling", false.toString());
	setProperty("auto_doCombatCopy", "no");
	setProperty("auto_dontPhylumBanish", false.toString());
	setProperty("auto_runDayCount", (2).toString());
	setProperty("auto_drunken", "");
	setProperty("auto_eaten", "");
	setProperty("auto_familiarChoice", "");
	removeProperty("auto_forcedNC");
	setProperty("auto_forceNonCombatLocation", "");
	setProperty("auto_forceNonCombatSource", "");
	setProperty("auto_forceNonCombatTurn", (-1).toString());
	setProperty("auto_forceTavern", false.toString());
	setProperty("auto_freeruns", "");
	setProperty("auto_funTracker", "");
	setProperty("auto_getBoningKnife", false.toString());
	setProperty("auto_getStarKey", true.toString());
	setProperty("auto_getSteelOrgan", getProperty("auto_getSteelOrgan_initialize"));
	setProperty("auto_gnasirUnlocked", false.toString());
	setProperty("auto_grimstoneFancyOilPainting", true.toString());
	setProperty("auto_grimstoneOrnateDowsingRod", true.toString());
	setProperty("auto_haveoven", false.toString());
	setProperty("auto_doGalaktik", getProperty("auto_doGalaktik_initialize"));
	setProperty("auto_L8_ninjaAssassinFail", false.toString());
	setProperty("auto_L8_extremeInstead", false.toString());
	setProperty("auto_L9_smutOrcPervert", false.toString());
	setProperty("auto_haveSourceTerminal", false.toString());
	setProperty("auto_hedge", "fast");
	setProperty("auto_hippyInstead", false.toString());
	setProperty("auto_holeinthesky", true.toString());
	setProperty("auto_ignoreCombat", "");
	setProperty("auto_ignoreFlyer", false.toString());
	setProperty("auto_instakill", "");
	setProperty("auto_instakillSource", "");
	setProperty("auto_instakillSuccess", false.toString());
	setProperty("auto_interruptedZones", "");
	setProperty("auto_iotm_claim", "");
	setProperty("auto_leaflet_done", false.toString());
	setProperty("auto_lucky", "");
	setProperty("auto_luckySource", "none");
	setProperty("auto_mapperidot", "");
	setProperty("auto_modernzmobiecount", "");
	setProperty("auto_powerfulglove", "");
	setProperty("auto_otherstuff", "");
	setProperty("auto_paranoia", (-1).toString());
	setProperty("auto_paranoia_counter", (0).toString());
	setProperty("auto_parkaSpikesDeployed", false.toString());
	setProperty("auto_priorCharpaneMode", "0");
	setProperty("auto_powerLevelAdvCount", "0");
	setProperty("auto_powerLevelLastAttempted", "0");
	setProperty("auto_pulls", "");
	removeProperty("auto_shenZonesTurnsSpent");
	removeProperty("auto_lastShenTurn");
	setProperty("auto_sniffs", "");
	setProperty("auto_stopMinutesToRollover", "5");
	setProperty("auto_tracker_path", "");
	setProperty("auto_wandOfNagamar", true.toString());
	setProperty("auto_wineracksencountered", (0).toString());
	setProperty("auto_wishes", "");
	setProperty("auto_writingDeskSummon", false.toString());
	setProperty("auto_yellowRays", "");
	setProperty("auto_replaces", "");
	setProperty("auto_skipNuns", "false");
	setProperty("auto_skipL12Farm", "false");
	setProperty("auto_L12FarmStage", "0");
	setProperty("choiceAdventure1003", (0).toString());
	setProperty("auto_junkspritesencountered", (0).toString());
	setProperty("auto_openedziggurat", false.toString());
	removeProperty("auto_minedCells");
	removeProperty("auto_shinningStarted");
	removeProperty("auto_boughtCommerceGhostItem");
	removeProperty("auto_saveMargarita");
	removeProperty("auto_csDoWheel");
	removeProperty("auto_hccsTurnSave");
	removeProperty("auto_hccsNoConcludeDay");
	removeProperty("auto_saveSausage");
	removeProperty("auto_saveVintage");
	setProperty("auto_dontUseCookBookBat", false.toString());
	setProperty("auto_dietpills", (0).toString());
	setProperty("_auto_candyMapCompleted", false.toString());
	beehiveConsider(false);

	eudora_initializeSettings();
	heavyrains_initializeSettings();
	awol_initializeSettings();
	aosol_initializeSettings();
	theSource_initializeSettings();
	ed_initializeSettings();
	boris_initializeSettings();
	bond_initializeSettings();
	bugbear_initializeSettings();
	nuclear_initializeSettings();
	pete_initializeSettings();
	pokefam_initializeSettings();
	disguises_initializeSettings();
	glover_initializeSettings();
	bat_initializeSettings();
	koe_initializeSettings();
	kolhs_initializeSettings();
	plumber_initializeSettings();
	lowkey_initializeSettings();
	bhy_initializeSettings();
	qt_initializeSettings();
	jarlsberg_initializeSettings();
	robot_initializeSettings();
	wildfire_initializeSettings();
	zombieSlayer_initializeSettings();
	fotd_initializeSettings();
	lol_initializeSettings();
	small_initializeSettings();
	wereprof_initializeSettings();
	ag_initializeSettings();
	amw_initializeSettings();

	setProperty("auto_doneInitializePath", myPath().name); //which path we initialized as
	setProperty("auto_doneInitialize", myAscensions().toString());
	removeProperty("_auto_reinitialize");
}

function initializeSession(): void {
	// called once every time the script is started.
	// anything that needs to be set only for the duration the script is running
	// should be set in here.

	auto_enableBackupCameraReverser();
	setProperty("_auto_organSpace", (-1.0).toString());
	ed_initializeSession();
	bat_initializeSession();
}

export function auto_advToReserve(): number
{
	// Calculates how many adventures we should aim to keep in reserve
	// if auto_save_adv_override value is 0 or higher then use the override
	if (toInt(getProperty("auto_save_adv_override")) > -1)
	{
		return toInt(getProperty("auto_save_adv_override"));
	}
	// automatically calculate how many adv to reserve at end of day
	// free crafting require at least 1 adventure to do.
	// To enter free fights we need at least 1 adventure remaining. Dying costs an adventure, so we reserve 2 adventures so the user can manually complete the remaining fights even if we lose.
	// cocktailcrafting and pasta cooking require 2 adventures.

	let reserveadv: number = 1;

	if (auto_freeCombatsRemaining() > 0)
	{
		reserveadv = max(2, reserveadv);
	}

	if (freeCrafts$1() < 2)
	{
		//smallest Pasta dish that takes 2 adv to craft is 3 fullness.
		//Pastamastery is required for all pasta and having it alone is enough to craft foods that take 2 adv to craft
		if (canEat() && myFullness() + 3 <= fullnessLimit() && auto_have_skill(Skill.get("Pastamastery")))
		{
			reserveadv = max(2, reserveadv);
		}
		//Advanced Cocktailcrafting skill is enough to make drinks that cost 2 adv to craft
		//because of nightcap, there is no point in checking your inebrity limits.
		if (canDrink() && auto_have_skill(Skill.get("Advanced Cocktailcrafting")))
		{
			reserveadv = max(2, reserveadv);
		}
		//sneaky pete specific check. Mixologist lets you spend 2 adv on crafting. cocktail magic makes crafting free.
		if (auto_have_skill(Skill.get("Mixologist")) && !auto_have_skill(Skill.get("Cocktail Magic")))
		{
			reserveadv = max(2, reserveadv);
		}
	}

	return reserveadv;
}

export function auto_unreservedAdvRemaining(): boolean
{
	// should the main loop continue to run or not, based on how many adv we wish to reserve.
	if (myAdventures() > auto_advToReserve())
	{
		return true;
	}
	return false;
}

export function LX_burnDelay(): boolean
{
	let voteMonsterAvailable: boolean = auto_voteMonster$1(true);
	const digitizeMonsterNext: boolean = isOverdueDigitize();
	let sausageGoblinAvailable: boolean = auto_sausageGoblin();
	const backupTargetAvailable: boolean = auto_backupTarget();
	const voidMonsterAvailable: boolean = auto_voidMonster();
	const habitatingMonsters: boolean = auto_habitatMonster() !== Monster.none;
	// if we're a plumber and we're still stuck doing a flat 15 damage per attack
	// then a scaling monster is probably going to be a bad time
	if (in_plumber() && !plumber_canDealScalingDamage())
	{
		// unless we can still kill it in one hit, then it should probably be fine?
		const predictedScalerHP: number = toInt(0.75 * (myBuffedstat(Stat.get("Muscle")) + monsterLevelAdjustment()));
		if (predictedScalerHP > 15)
		{
			auto_log_info$1("Want to burn delay with scaling wanderers, but we can't deal scaling damage yet and it would be too strong :(");
			voteMonsterAvailable = false;
			sausageGoblinAvailable = false;
			addToMaximize("-equip Kramco Sausage O-Matic");
			addToMaximize("-equip &quot;I Voted!&quot; sticker");
		}
	}
	// See the encounter priority flowcharts available at https://i.imgur.com/sdVH4SPh.jpg
	// and https://github.com/loathers/encounter/blob/main/heirarchy.mermaid if adding handling for more stuff

	if (voteMonsterAvailable && !backupTargetAvailable)
	{
		// Voting monsters are inherently free (the ones we fight anyway).
		// don't fight them if we're going to backup because they will overwrite the monster we want to backup
		const voterZone: Location = solveDelayZone(toInt(getProperty("breathitinCharges")) > 0);
		if (voterZone !== Location.none)
		{
			auto_log_info(`Fighting a free ${getProperty("_voteMonster")} in ${voterZone.toString()} to burn delay!`, "green");
			setProperty("auto_nextEncounter", getProperty("_voteMonster"));
			if (auto_voteMonster$2(true, voterZone))
			{
				return true;
			}
			setProperty("auto_nextEncounter", "");
		}
	}

	if (digitizeMonsterNext)
	{
		// Digitize Wanderers will happen regardless so prioritize handling them.
		// hopefully they don't overwrite something we want to backup.
		let digitizeZone: Location = solveDelayZone(isFreeMonster(toMonster(getProperty("_sourceTerminalDigitizeMonster"))) && toInt(getProperty("breathitinCharges")) > 0);
		if (digitizeZone === Location.none)
		{
			// if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
			// and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
			digitizeZone = Location.get("Noob Cave");
		}
		auto_log_info(`Fighting a ${getProperty("_sourceTerminalDigitizeMonster")} in ${digitizeZone.toString()} to burn delay!`, "green");
		setProperty("auto_nextEncounter", getProperty("_sourceTerminalDigitizeMonster"));
		if (autoAdv$2(digitizeZone))
		{
			return true;
		}
		setProperty("auto_nextEncounter", "");
	}

	if (backupTargetAvailable)
	{
		const skipOutdoorZones: boolean = isFreeMonster(toMonster(getProperty("lastCopyableMonster"))) && toInt(getProperty("breathitinCharges")) > 0;
		let backupZone: Location = solveDelayZone(skipOutdoorZones);
		if (backupZone === Location.none && skipOutdoorZones && !in_koe())
		{
			// if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
			// and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
			backupZone = Location.get("Noob Cave");
		}

		auto_log_info(`Fighting a ${getProperty("lastCopyableMonster")} in ${backupZone.toString()} to burn delay!`, "green");
		if (auto_backupToYourLastEnemy(backupZone))
		{
			return true;
		}
	}

	if (sausageGoblinAvailable)
	{
		// Sausage Goblins are inherently free
		const goblinZone: Location = solveDelayZone(toInt(getProperty("breathitinCharges")) > 0);
		if (goblinZone !== Location.none)
		{
			auto_log_info(`Fighting a Sausage Goblin in ${goblinZone.toString()} to burn delay!`, "green");
			if (auto_sausageGoblin$2(goblinZone, null))
			{
				return true;
			}
		}
	}

	if (voidMonsterAvailable)
	{
		// Void monsters are inherently free (the ones we fight anyway).
		const voidZone: Location = solveDelayZone(toInt(getProperty("breathitinCharges")) > 0);
		if (voidZone !== Location.none)
		{
			auto_log_info(`Fighting a Void monster in ${voidZone.toString()} to burn delay!`, "green");
			if (auto_voidMonster$1(voidZone))
			{
				return true;
			}
		}
	}

	if (habitatingMonsters)
	{
		const habitatZone: Location = solveDelayZone(isFreeMonster(auto_habitatMonster()) && toInt(getProperty("breathitinCharges")) > 0);
		if (habitatZone !== Location.none)
		{
			auto_log_info(`Might be fighting a ${auto_habitatMonster()} in ${habitatZone.toString()} to burn delay!`, "green");
			if (autoAdv$2(habitatZone))
			{
				return true;
			}
		}
	}

	if (voteMonsterAvailable)
	{
		auto_log_warning("Had overdue voting monster but couldn't find a zone to burn delay", "red");
	}
	if (digitizeMonsterNext)
	{
		auto_log_warning("Had overdue digitize but couldn't find a zone to burn delay", "red");
	}
	if (sausageGoblinAvailable)
	{
		auto_log_warning("Had overdue sausage but couldn't find a zone to burn delay", "red");
	}
	if (voidMonsterAvailable)
	{
		auto_log_warning("Cursed Magnifying Glass's void monster is next but couldn't find a zone to burn delay", "red");
	}
	if (habitatingMonsters)
	{
		auto_log_warning("Habitating a monster but couldn't find a zone to burn delay", "red");
	}
	return false;
}

export function LX_calculateTheUniverse(speculative: boolean): boolean
{
	if (in_wildfire())
	{
		return LX_wildfire_calculateTheUniverse();
	}
	if (myMp() < mpCost(Skill.get("Calculate the Universe")))
	{
		return false;
	}
	if (toInt(getProperty("_universeCalculated")) >= min(3, toInt(getProperty("skillLevel144"))))
	{
		return false;
	}
	//do we want to summon a [War Frat 151st Infantryman] for the frat warrior outfit?
	if (!possessOutfit$1("Frat Warrior Fatigues") && auto_warSide() === "fratboy")
	{
		if (doNumberology$2("battlefield", false) !== -1 && adjustForYellowRayIfPossible(Monster.get("War Frat 151st Infantryman")))
		{
			if (speculative)
			{
				return true;
			}
			else {
				return doNumberology("battlefield") !== -1;
			}
		}
		return false; //we want 151 and can get it in general. but not right now. so save it for later
	}

	doNumberology("adventures3");
	return false; //we do not want to restart the loop as all we're doing is generating 3 adventures
}

function tophatMaker(): boolean
{
	if (!knollAvailable() || itemAmount(Item.get("brass gear")) === 0 || possessEquipment(Item.get("Mark V Steam-Hat")))
	{
		return false;
	}
	let reEquip: Item = Item.none;

	if (possessEquipment(Item.get("Mark IV Steam-Hat")))
	{
		if (equippedItem(Slot.get("hat")) === Item.get("Mark IV Steam-Hat"))
		{
			reEquip = Item.get("Mark V Steam-Hat");
			equip(Slot.get("hat"), Item.none);
		}
		autoCraft("combine", 1, Item.get("brass gear"), Item.get("Mark IV Steam-Hat"));
	}
	else if (possessEquipment(Item.get("Mark III Steam-Hat")))
	{
		if (equippedItem(Slot.get("hat")) === Item.get("Mark III Steam-Hat"))
		{
			reEquip = Item.get("Mark IV Steam-Hat");
			equip(Slot.get("hat"), Item.none);
		}
		autoCraft("combine", 1, Item.get("brass gear"), Item.get("Mark III Steam-Hat"));
	}
	else if (possessEquipment(Item.get("Mark II Steam-Hat")))
	{
		if (equippedItem(Slot.get("hat")) === Item.get("Mark II Steam-Hat"))
		{
			reEquip = Item.get("Mark III Steam-Hat");
			equip(Slot.get("hat"), Item.none);
		}
		autoCraft("combine", 1, Item.get("brass gear"), Item.get("Mark II Steam-Hat"));
	}
	else if (possessEquipment(Item.get("Mark I Steam-Hat")))
	{
		if (equippedItem(Slot.get("hat")) === Item.get("Mark I Steam-Hat"))
		{
			reEquip = Item.get("Mark II Steam-Hat");
			equip(Slot.get("hat"), Item.none);
		}
		autoCraft("combine", 1, Item.get("brass gear"), Item.get("Mark I Steam-Hat"));
	}
	else if (possessEquipment(Item.get("brown felt tophat")))
	{
		if (equippedItem(Slot.get("hat")) === Item.get("brown felt tophat"))
		{
			reEquip = Item.get("Mark I Steam-Hat");
			equip(Slot.get("hat"), Item.none);
		}
		autoCraft("combine", 1, Item.get("brass gear"), Item.get("brown felt tophat"));
	}
	else {
		return false;
	}

	auto_log_info("Mark Steam-Hat upgraded!", "blue");
	if (reEquip !== Item.none)
	{
		equip(Slot.get("hat"), reEquip);
	}
	return true;
}

export function LX_doVacation(): boolean
{
	if (in_koe() || is_werewolf())
	{
		return false; //cannot vacation in kingdom of exploathing path or are a werewolf in wereprofessor
	}

	let meat_needed: number = 500;
	let adv_needed: number = 3;
	const adv_budget: number = myAdventures() - auto_advToReserve();
	if (in_wotsf())
	{
		meat_needed = 5;
		adv_needed = 5;
	}
	if (adv_needed > adv_budget)
	{
		auto_log_info("I want to vacation but I do not have enough adventures left", "red");
		return false;
	}
	if (meat_needed > myMeat())
	{
		auto_log_info("I want to vacation but I do not have enough meat", "red");
		return false;
	}
	if (in_plumber())
	{ //avoid error for not having plumber gear equipped.
		plumber_equipTool$1(Stat.get("Moxie"));
		equipMaximizedGear();
	}

	return autoAdv$1(1, Location.get("The Shore, Inc. Travel Agency"));
}

export function auto_doTempleSummit(): boolean
{
	if (!hiddenTempleUnlocked())
	{
		return false;
	}
	if (availableAmount(Item.get("stone wool")) === 0)
	{
		return false;
	}
	if (toInt(getProperty("lastTempleAdventures")) >= myAscensions())
	{
		return false;
	}
	if (auto_haveMayamCalendar() && !auto_MayamAllUsed())
	{
		auto_log_info$1("Not getting temple summit adventures since our Mayam calendar isn't spent.");
		return false;
	}
	buffMaintain$4(Effect.get("Stone-Faced"));
	if (haveEffect(Effect.get("Stone-Faced")) === 0)
	{
		return false;
	}
	return autoAdv$2(Location.get("The Hidden Temple"));
}

function initializeDay(day: number): void
{
	if (inAftercore())
	{
		return;
	}

	invalidateRestoreOptionCache();

	if (toBoolean(getProperty("auto_pvpEnable")) && !hippyStoneBroken())
	{
		visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
		visitUrl("peevpee.php?place=fight");
	}

	if (toInt(getProperty("auto_day_init")) < day)
	{
		setProperty("auto_powerLevelLastLevel", "0");
		setProperty("auto_delayLastLevel", "0");
		setProperty("auto_cmcConsultLastLevel", "0");
		setProperty("auto_breathitinLastLevel", "0");
		setProperty("_auto_candyMapCompleted", false.toString());
	}

	if (!possessEquipment(Item.get("your cowboy boots")) && toBoolean(getProperty("telegraphOfficeAvailable")) && isUnrestricted(Item.get("LT&T telegraph office deed")))
	{
		//string temp = visit_url("desc_item.php?whichitem=529185925");
		//if(equipped_item($slot[bootspur]) == $item[Nicksilver spurs])
		//if(contains_text(temp, "Item Drops from Monsters"))
		//{
			const temp: string = visitUrl("place.php?whichplace=town_right&action=townright_ltt");
		//}
	}

	if (auto_is_valid(Item.get("Fourth of May Cosplay Saber")))
	{
		auto_saberDailyUpgrade(day);
	}

	if (itemAmount(Item.get("cursed microwave")) >= 1 && !toBoolean(getProperty("_cursedMicrowaveUsed")))
	{
		use(1, Item.get("cursed microwave"));
	}
	if (itemAmount(Item.get("cursed pony keg")) >= 1 && !toBoolean(getProperty("_cursedKegUsed")))
	{
		use(1, Item.get("cursed pony keg"));
	}
	if (storageAmount(Item.get("talking spade")) > 0)
	{
		pullXWhenHaveY(Item.get("talking spade"), 1, 0);
	}

	if (itemAmount(Item.get("telegram from Lady Spookyraven")) > 0)
	{
		auto_log_warning("Lady Spookyraven quest not detected as started should have been auto-started. Starting it. If you are not in an Ed run, report this. Otherwise, it is expected.", "red");
		use(1, Item.get("telegram from Lady Spookyraven"));
		setProperty("questM20Necklace", "started");
	}

	if (internalQuestStatus("questM20Necklace") === -1)
	{
		if (itemAmount(Item.get("telegram from Lady Spookyraven")) > 0)
		{
			auto_log_warning("Lady Spookyraven quest not started and we have a Telegram so let us use it.", "red");
			const temp: boolean = use(1, Item.get("telegram from Lady Spookyraven"));
		}
		else {
			auto_log_warning("Lady Spookyraven quest not detected as started but we don't have the telegram, assuming it is... If you are not in an Ed run, report this. Otherwise, it is expected.", "red");
			setProperty("questM20Necklace", "started");
		}
	}

	auto_barrelPrayers();

	if (!toBoolean(getProperty("_pottedTeaTreeUsed")) && auto_get_campground().has(Item.get("potted tea tree")) && !inAftercore())
	{
		if (getProperty("auto_teaChoice") !== "")
		{
			const teaChoice: Map<number, string> = new Map(splitString(getProperty("auto_teaChoice"), ";").map((_v, _i) => [_i, _v]));
			const myTea: string = trim((teaChoice.get(min(teaChoice.size, myDaycount()) - 1) ?? teaChoice.set(min(teaChoice.size, myDaycount()) - 1, "").get(min(teaChoice.size, myDaycount()) - 1)));
			if (toItem(myTea) !== Item.none || myTea === "shake")
			{
				const buff: boolean = cliExecute(`teatree ${myTea}`);
			}
		}
		else if (day === 1 && auto_is_valid(Item.get("potted tea tree")))
		{
			if (fullnessLimit() > 0)
			{
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Voraci tea")}`);
			}
			else if (inebrietyLimit() > 0)
			{
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Sobrie tea")}`);
			}
			else {
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Royal tea")}`);
			}
		}
		else if (day === 2 && auto_is_valid(Item.get("potted tea tree")))
		{
			if (inebrietyLimit() > 0)
			{
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Sobrie tea")}`);
			}
			else if (fullnessLimit() > 0)
			{
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Voraci tea")}`);
			}
			else {
				const buff: boolean = cliExecute(`teatree ${Item.get("cuppa Royal tea")}`);
			}
		}
		else {
			visitUrl("campground.php?action=teatree");
			runChoice(1);
		}
	}

	auto_floundryAction();

	auto_MayamClaimAll(); // Want Mayam before booth to decide if we want a feather boa given yamtility.
	auto_getClanPhotoBoothDefaultItems();
	auto_getClanPhotoBoothEffect$3("space", 3);

	auto_initBurningLeaves();

	if (itemAmount(Item.get("GameInformPowerDailyPro magazine")) > 0 && myDaycount() === 1)
	{
		visitUrl("inv_use.php?pwd=&which=3&whichitem=6174", true);
		visitUrl("inv_use.php?pwd=&which=3&whichitem=6174&confirm=Yep.", true);
		setProperty("auto_disableAdventureHandling", true.toString());
		autoAdv$1(1, Location.get("[DungeonFAQ - Level 1]"));
		setProperty("auto_disableAdventureHandling", false.toString());
		if (itemAmount(Item.get("dungeoneering kit")) > 0)
		{
			use(1, Item.get("dungeoneering kit"));
		}
	}

	auto_doPrecinct();
	if (!(in_koe() || in_lar()) && itemAmount(Item.get("cop dollar")) >= 10 && itemAmount(Item.get("shoe gum")) === 0)
	{
		const temp: boolean = cliExecute("make shoe gum");
	}
	//a free to cast intrinsic that makes swords count as clubs. there is no reason to ever have it on if not a seal clubber?
	//regardless of class there is a reason not to if auto_configureRetrocape("vampire", "kill") can be used. it needs the sword to count as a sword and not as a club
	if (myClass() === Class.get("Seal Clubber") && auto_have_skill(Skill.get("Iron Palm Technique")) && haveEffect(Effect.get("Iron Palms")) === 0)
	{
		useSkill(1, Skill.get("Iron Palm Technique"));
	}
	// Get emotionally chipped if you have the item.  boris\jarlsberg\sneaky pete\zombie slayer\ed cannot use this skill so excluding.
	if (!haveSkill(Skill.get("Emotionally Chipped")) && itemAmount(Item.get("spinal-fluid-covered emotion chip")) > 0 && can_read_skillbook(Item.get("spinal-fluid-covered emotion chip")))
	{
		use(1, Item.get("spinal-fluid-covered emotion chip"));
	}
	// Open our duffel bag
	auto_openMcLargeHugeSkis();
	//you must finish the Toot Oriole quest to unlock council quests.
	tootOriole();

	ed_initializeDay(day);
	boris_initializeDay(day);
	nuclear_initializeDay(day);
	pete_initializeDay(day);
	glover_initializeDay(day);
	bat_initializeDay(day);
	jarlsberg_initializeDay(day);
	ht_equip_hats(); //equip hats in Hat Trick
	// Bulk cache mall prices
	if (!inHardcore() && toInt(getProperty("auto_day_init")) < day)
	{
		auto_log_info$1("Bulk caching mall prices for consumables");
		if (getProperty("auto_last_mallcached") !== todayToString())
		{
			mallPrices("food");
			mallPrices("booze");
			setProperty("auto_last_mallcached", todayToString()); //should not cache food,booze again after starting a new ascension on the same day
		}
		//food,booze will explicitly request historical_price to avoid making individual mall searches, in case a new mafia session gets started
		//hprestore and mprestore types corresponding with mall_prices search categories are not available. but it's not as many searches as food,booze
		//so cache those again even in a new ascension in case it's getting started in a new session
		mallPrices("hprestore");
		mallPrices("mprestore");
	}

	if (day === 1)
	{
		if (toInt(getProperty("auto_day_init")) < 1)
		{
			auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Digitize"));
			if (containsText(getProperty("sourceTerminalEnquiryKnown"), "monsters.enq") && in_pokefam())
			{
				auto_sourceTerminalRequest("enquiry monsters.enq");
			}
			else if (containsText(getProperty("sourceTerminalEnquiryKnown"), "familiar.enq") && pathHasFamiliar())
			{
				auto_sourceTerminalRequest("enquiry familiar.enq");
			}
			else if (containsText(getProperty("sourceTerminalEnquiryKnown"), "stats.enq"))
			{
				auto_sourceTerminalRequest("enquiry stats.enq");
			}
			else if (containsText(getProperty("sourceTerminalEnquiryKnown"), "protect.enq"))
			{
				auto_sourceTerminalRequest("enquiry protect.enq");
			}

			kgbSetup();
			if (itemAmount(Item.get("transmission from planet Xi")) > 0)
			{
				use(1, Item.get("transmission from planet Xi"));
			}
			if (itemAmount(Item.get("Xiblaxian holo-wrist-puter simcode")) > 0)
			{
				use(1, Item.get("Xiblaxian holo-wrist-puter simcode"));
			}
			if (itemAmount(Item.get("baby bodyguard")) > 0 && !haveFamiliar(Familiar.get("Burly Bodyguard")))
			{ //will only happen in Avant Guard
				use(1, Item.get("baby bodyguard"));
			}

			if (auto_get_clan_lounge().has(Item.get("Clan Floundry")) && itemAmount(Item.get("fishin' pole")) === 0)
			{
				visitUrl("clan_viplounge.php?action=floundry");
			}

			tootGetMeat();

			heavyrains_initializeDay(day);
			// It's nice to have a moxie weapon for Flock of Bats form
			if (in_darkGyffte() && toInt(getProperty("darkGyfftePoints")) < 21 && !possessEquipment(Item.get("disco ball")))
			{
				acquireGumItem(Item.get("disco ball"));
			}
			if (auto_needAccordion())
			{
				if (itemAmount(Item.get("antique accordion")) === 0 && itemAmount(Item.get("aerogel accordion")) === 0 && auto_predictAccordionTurns() < 5 && (myMeat() > npcPrice(Item.get("toy accordion")) && npcPrice(Item.get("toy accordion")) !== 0))
				{
					//Try to get Antique Accordion early if we possibly can.
					if (isUnclePAvailable() && (myMeat() > npcPrice(Item.get("antique accordion")) && npcPrice(Item.get("antique accordion")) !== 0) && !in_glover())
					{
						auto_buyUpTo(1, Item.get("antique accordion"));
					}
					// Removed "else". In some situations when mafia or supporting scripts are behaving wonky we may completely fail to get an accordion
					if (isArmoryAvailable() && itemAmount(Item.get("antique accordion")) === 0)
					{
						auto_buyUpTo(1, Item.get("toy accordion"));
					}
				}
				if (in_koe() && itemAmount(Item.get("antique accordion")) === 0 && koe_rmi_count() >= 10)
				{
					koe_acquire_rmi$1(10);
					buy(Coinmaster.get("Cosmic Ray's Bazaar"), 1, Item.get("antique accordion"));
				}
				acquireTotem();
				if (!possessEquipment(Item.get("saucepan")))
				{
					acquireGumItem(Item.get("saucepan"));
				}
			}

			makeStartingSmiths();

			equipBaseline();

			handleBjornify(Familiar.none);
			handleBjornify(Familiar.get("El Vibrato Megadrone"));

			const temp: string = visitUrl("guild.php?place=challenge");

			auto_beachCombHead("exp");
		}

		if (toInt(getProperty("lastCouncilVisit")) < myLevel())
		{
			cliExecute("counters");
			council();
		}
		// If we have the shortest order cook, loop familiars that will benefit from that.
		if (pathHasFamiliar() && pathAllowsChangingFamiliar())
		{
			const init_fam: Familiar = myFamiliar();
			if (haveFamiliar(Familiar.get("Shorter-Order Cook")))
			{
				for (const fam of Familiar.get(["Ghost of Crimbo Carols", "Ghost of Crimbo Commerce", "Ghost of Crimbo Cheer"]))
				{
					if (haveFamiliar(fam) && !in_bhy())
					{
						useFamiliar(fam);
					}
				}
				for (const fam of Familiar.get(["Chest Mimic", "Cooler Yeti"]))
				{
					if (haveFamiliar(fam))
					{
						useFamiliar(fam);
					}
				}
			}
			useFamiliar(init_fam);
		}
	}
	else if (day === 2)
	{
	//day1
		equipBaseline();

		if (toInt(getProperty("auto_day_init")) < 2)
		{
			useTonicDjinn();

			if (itemAmount(Item.get("gym membership card")) > 0)
			{
				equipStatgainIncreasers$2();
				use(1, Item.get("gym membership card"));
			}

			heavyrains_initializeDay(day);

			if (!inHardcore() && itemAmount(Item.get("handful of Smithereens")) <= 5)
			{
				pulverizeThing(Item.get("Hairpiece On Fire"));
				pulverizeThing(Item.get("Vicar's Tutu"));
			}
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}
			if (itemAmount(Item.get("antique accordion")) === 0 && itemAmount(Item.get("aerogel accordion")) === 0 && isUnclePAvailable() && (myMeat() > npcPrice(Item.get("antique accordion")) && npcPrice(Item.get("antique accordion")) !== 0) && auto_predictAccordionTurns() < 10 && !(is_boris() || is_jarlsberg() || is_pete() || isActuallyEd() || in_darkGyffte() || in_plumber() || !in_glover()))
			{
				auto_buyUpTo(1, Item.get("antique accordion"));
			}
			if (is_boris())
			{
				if (itemAmount(Item.get("Clancy's crumhorn")) === 0 && minstrelInstrument() !== Item.get("Clancy's crumhorn"))
				{
					auto_buyUpTo(1, Item.get("Clancy's crumhorn"));
				}
			}
			if (auto_have_skill(Skill.get("Summon Smithsness")) && myMp() > 3 * mpCost(Skill.get("Summon Smithsness")))
			{
				useSkill(3, Skill.get("Summon Smithsness"));
			}

			if (itemAmount(Item.get("handful of Smithereens")) >= 2)
			{
				auto_buyUpTo(2, Item.get("Ben-Gal&trade; Balm"));
				cliExecute("make 2 louder than bomb");
			}
		}
		if (chateaumantegna_havePainting() && !isActuallyEd())
		{
			if (auto_have_familiar(Familiar.get("Reanimated Reanimator")))
			{
				handleFamiliar$1(Familiar.get("Reanimated Reanimator"));
			}
			chateaumantegna_usePainting();
			handleFamiliar$1(Familiar.get("Angry Jung Man"));
		}
	}
	else if (day === 3)
	{
		if (toInt(getProperty("auto_day_init")) < 3)
		{
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}

			picky_pulls();
		}
	}
	else if (day === 4)
	{
		if (toInt(getProperty("auto_day_init")) < 4)
		{
			while (acquireHermitItem(Item.get("11-leaf clover"))) {}
		}
	}
	if (day >= 2)
	{
		ovenHandle();
	}

	const campground: string = visitUrl("campground.php");
	if (containsText(campground, "beergarden7.gif") && isUnrestricted(Item.get("packet of beer seeds")))
	{
		cliExecute("garden pick");
	}
	if (containsText(campground, "wintergarden3.gif") && isUnrestricted(Item.get("packet of winter seeds")))
	{
		cliExecute("garden pick");
	}
	if (containsText(campground, "thanksgardenmega.gif") && isUnrestricted(Item.get("packet of thanksgarden seeds")))
	{
		cliExecute("garden pick");
	}

	setProperty("auto_forceNonCombatSource", "");

	setProperty("auto_day_init", day.toString());
}

export function dailyEvents(): boolean
{
	//Daily Events that should happen at start and not end.

	auto_birdOfTheDay();
	while (auto_doPrecinct()) {}
	handleBarrelFullOfBarrels(true);
	// Hit bastille, then council in case we levelled up (and unlocked getaway camp)
	cheeseWarMachine(0, 0, 0, 0);
	council();

	auto_campawayGrabBuffs();
	kgb_getMartini();
	fightClubNap();
	fightClubStats();

	chateaumantegna_useDesk();

	if (itemAmount(Item.get("burned government manual fragment")) > 0 && isUnrestricted(Item.get("burned government manual fragment")) && toBoolean(getProperty("auto_alienLanguage")))
	{
		use(itemAmount(Item.get("burned government manual fragment")), Item.get("burned government manual fragment"));
	}

	if (itemAmount(Item.get("glass gnoll eye")) > 0 && !toBoolean(getProperty("_gnollEyeUsed")))
	{
		use(1, Item.get("glass gnoll eye"));
	}
	if (itemAmount(Item.get("Chroner trigger")) > 0 && !toBoolean(getProperty("_chronerTriggerUsed")))
	{
		use(1, Item.get("Chroner trigger"));
	}
	if (itemAmount(Item.get("Chroner cross")) > 0 && !toBoolean(getProperty("_chronerCrossUsed")))
	{
		use(1, Item.get("Chroner cross"));
	}
	if (itemAmount(Item.get("Chester's bag of candy")) > 0 && !toBoolean(getProperty("_bagOfCandyUsed")))
	{
		use(1, Item.get("Chester's bag of candy"));
	}
	if (itemAmount(Item.get("cheap toaster")) > 0 && !toBoolean(getProperty("_toastSummoned")))
	{
		use(1, Item.get("cheap toaster"));
	}
	if (itemAmount(Item.get("warbear breakfast machine")) > 0 && !toBoolean(getProperty("_warbearBreakfastMachineUsed")))
	{
		use(1, Item.get("warbear breakfast machine"));
	}
	if (itemAmount(Item.get("warbear soda machine")) > 0 && !toBoolean(getProperty("_warbearSodaMachineUsed")))
	{
		use(1, Item.get("warbear soda machine"));
	}
	if (itemAmount(Item.get("The Cocktail Shaker")) > 0 && !toBoolean(getProperty("_cocktailShakerUsed")))
	{
		use(1, Item.get("The Cocktail Shaker"));
	}
	if (itemAmount(Item.get("Taco Dan's Taco Stand Flier")) > 0 && !toBoolean(getProperty("_tacoFlierUsed")))
	{
		use(1, Item.get("Taco Dan's Taco Stand Flier"));
	}
	if (itemAmount(Item.get("festive warbear bank")) > 0 && !toBoolean(getProperty("_warbearBankUsed")))
	{
		use(1, Item.get("festive warbear bank"));
	}

	if (itemAmount(Item.get("etched hourglass")) > 0 && !toBoolean(getProperty("_etchedHourglassUsed")))
	{
		use(1, Item.get("etched hourglass"));
	}

	if (itemAmount(Item.get("can of Rain-Doh")) > 0 && itemAmount(Item.get("Rain-Doh red wings")) === 0)
	{
		use(1, Item.get("can of Rain-Doh"));
		putCloset(1, Item.get("empty Rain-Doh can"));
	}

	if (itemAmount(Item.get("Clan VIP Lounge key")) > 0)
	{
		const furn: Map<Item, number> = auto_get_clan_lounge();
		if (furn.has(Item.get("Olympic-sized Clan crate")) && !toBoolean(getProperty("_olympicSwimmingPoolItemFound")) && isUnrestricted(Item.get("Olympic-sized Clan crate")))
		{
			cliExecute("swim item");
		}
		if (furn.has(Item.get("Clan looking glass")) && !toBoolean(getProperty("_lookingGlass")) && isUnrestricted(Item.get("Clan looking glass")))
		{
			const temp: string = visitUrl("clan_viplounge.php?action=lookingglass");
		}
		if (toInt(getProperty("_deluxeKlawSummons")) === 0)
		{
			cliExecute("clan_viplounge.php?action=klaw");
			cliExecute("clan_viplounge.php?action=klaw");
			cliExecute("clan_viplounge.php?action=klaw");
		}
		if (furn.has(Item.get("Crimbough")) && (furn.get(Item.get("Crimbough")) ?? furn.set(Item.get("Crimbough"), 0).get(Item.get("Crimbough"))) === 5 && !toBoolean(getProperty("_crimboTree")) && isUnrestricted(Item.get("Crimbough")))
		{
			cliExecute("crimbotree get");
		}
	}

	if (toInt(getProperty("_klawSummons")) === 0 && ("Mr. Klaw \"Skill\" Crane Game") in getClanRumpus()) {
		cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
		cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
		cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
	}

	if (itemAmount(Item.get("infinite BACON machine")) > 0 && !toBoolean(getProperty("_baconMachineUsed")))
	{
		use(1, Item.get("infinite BACON machine"));
	}
	if (itemAmount(Item.get("picky tweezers")) > 0 && !toBoolean(getProperty("_pickyTweezersUsed")))
	{
		use(1, Item.get("picky tweezers"));
	}

	if (haveSkill(Skill.get("That's Not a Knife")) && !toBoolean(getProperty("_discoKnife")))
	{
		for (const it of Item.get(["boot knife", "broken beer bottle", "candy knife", "sharpened spoon", "soap knife"]))
		{
			if (itemAmount(it) === 1)
			{
				putCloset(1, it);
			}
		}
		useSkill(1, Skill.get("That's Not a Knife"));
	}

	while (zataraClanmate()) {}

	if (itemAmount(Item.get("genie bottle")) > 0 && auto_is_valid(Item.get("genie bottle")) && auto_is_valid(Item.get("pocket wish")) && !in_glover())
	{
	//if bottle is valid and pocket wishes are not (such as in glover) then we should save the wishes for use and only convert leftovers into pocket wishes at bedtime
		for (let i: number = toInt(getProperty("_genieWishesUsed")); i < 3; i++)
		{
			makeGeniePocket();
		}
	}

	auto_getGuzzlrCocktailSet();
	auto_latheAppropriateWeapon();
	auto_harvestBatteries();
	pickRocks();
	auto_SITCourse();
	auto_LegacyOfLoathingDailies();
	auto_buyFrom2002MrStore();
	auto_useBlackMonolith();
	auto_scepterSkills();
	auto_getAprilingBandItems();
	auto_MayamClaimAll();
	auto_buyFromSeptEmberStore();
	auto_getGlobs();
	auto_setLeprecondo();
	auto_getBCZItems();

	return true;
}

export function Lsc_flyerSeals(): boolean
{
	if (myClass() !== Class.get("Seal Clubber"))
	{
		return false;
	}
	if (toBoolean(getProperty("auto_ignoreFlyer")))
	{
		return false;
	}
	// although seals can be fought drunk, it complicates code without serving a purpose
	if (myInebriety() > inebrietyLimit())
	{
		return false;
	}
	if (internalQuestStatus("questL12War") !== 1)
	{
		return false;
	}
	if (toInt(getProperty("flyeredML")) >= 10000)
	{
		return false;
	}
	if (itemAmount(Item.get("rock band flyers")) === 0 && itemAmount(Item.get("jam band flyers")) === 0)
	{
		return false;
	}
	if (toInt(getProperty("choiceAdventure1003")) >= 3)
	{
		return false;
	}

	if (toInt(getProperty("_sealsSummoned")) < maxSealSummons() && myMeat() > 500)
	{
		const towerTest: Element = ns_crowd3();
		let doElement: boolean = false;
		if (itemAmount(Item.get("powdered sealbone")) > 0)
		{
			if (towerTest === Element.get("cold") && itemAmount(Item.get("frost-rimed seal hide")) < 2 && itemAmount(Item.get("figurine of a cold seal")) > 0)
			{
				doElement = true;
			}
			if (towerTest === Element.get("hot") && itemAmount(Item.get("sizzling seal fat")) < 2 && itemAmount(Item.get("figurine of a charred seal")) > 0)
			{
				doElement = true;
			}
			if (towerTest === Element.get("sleaze") && itemAmount(Item.get("seal lube")) < 2 && itemAmount(Item.get("figurine of a slippery seal")) > 0)
			{
				doElement = true;
			}
			if (towerTest === Element.get("spooky") && itemAmount(Item.get("scrap of shadow")) < 2 && itemAmount(Item.get("figurine of a shadowy seal")) > 0)
			{
				doElement = true;
			}
			if (towerTest === Element.get("stench") && itemAmount(Item.get("fustulent seal grulch")) < 2 && itemAmount(Item.get("figurine of a stinking seal")) > 0)
			{
				doElement = true;
			}
		}

		let clubbedSeal: boolean = false;
		if (doElement)
		{
			if (itemAmount(Item.get("imbued seal-blubber candle")) === 0 && guildStoreAvailable())
			{
				auto_buyUpTo(1, Item.get("seal-blubber candle"));
				cliExecute("make imbued seal-blubber candle");
			}
			if (itemAmount(Item.get("imbued seal-blubber candle")) > 0)
			{
				ensureSealClubs();
				handleSealElement(towerTest);
				clubbedSeal = true;
			}
		}
		else if (guildStoreAvailable() && isHermitAvailable())
		{
			auto_buyUpTo(1, Item.get("figurine of an armored seal"));
			auto_buyUpTo(10, Item.get("seal-blubber candle"));
			if (itemAmount(Item.get("figurine of an armored seal")) > 0 && itemAmount(Item.get("seal-blubber candle")) >= 10)
			{
				handleSealNormal(Item.get("figurine of an armored seal"));
				clubbedSeal = true;
			}
		}
		if (itemAmount(Item.get("bad-ass club")) === 0 && itemAmount(Item.get("ingot of seal-iron")) > 0 && haveSkill(Skill.get("Super-Advanced Meatsmithing")))
		{
			if (itemAmount(Item.get("tenderizing hammer")) === 0 && (myMeat() >= npcPrice(Item.get("tenderizing hammer")) * 2 && npcPrice(Item.get("tenderizing hammer")) !== 0))
			{
				auto_buyUpTo(1, Item.get("tenderizing hammer"));
			}
			if (itemAmount(Item.get("tenderizing hammer")) > 0)
			{
				use(1, Item.get("ingot of seal-iron"));
			}
		}
		return clubbedSeal;
	}
	return false;
}

function councilMaintenance(): boolean
{
	if (in_koe())
	{
		return false;
	}
	if (myLevel() > toInt(getProperty("lastCouncilVisit")))
	{
		council();
		if (isActuallyEd() && myLevel() === 11 && itemAmount(Item.get("[7961]Staff of Ed")) > 0)
		{
			cliExecute("refresh inv");
		}
		return true;
	}
	return false;
}

function adventureFailureHandler(): boolean
{
	const place: Location = myLocation();
	const limit: number = (in_avantGuard() ? 100 : 50);
	if (place.turnsSpent > limit)
	{
		let tooManyAdventures: boolean = true;
		//general override function
		if (Location.get([
		//Many places do not have a proper ID which makes them indistinguishable from noob cave
		"Noob Cave",
		//quest locations where you spend lots of adventures and can not over adventure either
		"The Battlefield (Frat Uniform)", "The Battlefield (Hippy Uniform)",
		//kingdom of exploathing specific location for the hippy-frat war
		"The Exploaded Battlefield",
		//IOTM zones only used to powerlevel
		"The Deep Dark Jungle", "The Neverending Party", "Pirates of the Garbage Barges", "The Secret Government Laboratory", "Sloppy Seconds Diner", "The SMOOCH Army HQ", "Super Villain's Lair", "Uncle Gator's Country Fun-Time Liquid Waste Sluice", "VYKEA", "The X-32-F Combat Training Snowman",
		//in KOLHS path you must spend 40 adv per day split between those locations. zones only exist in kolhs
		"The Hallowed Halls", "Art Class", "Chemistry Class", "Shop Class",
		//holiday events
		"The Arrrboretum", "The Spectral Pickle Factory"]).includes(place))
		{
			tooManyAdventures = false;
		}

		if (tooManyAdventures && in_theSource())
		{
			if (Location.get(["The Haunted Ballroom", "The Haunted Bathroom", "The Haunted Bedroom", "The Haunted Gallery"]).includes(place))
			{
				tooManyAdventures = false;
			}
		}

		if (tooManyAdventures && isActuallyEd())
		{
			if (Location.get("The Hippy Camp") === place)
			{
				tooManyAdventures = false;
			}
		}

		if (tooManyAdventures && in_bhy())
		{
			if (Location.get(["A-Boo Peak", "Twin Peak"]).includes(place))
			{
				//bees prevent doing these quickly
				tooManyAdventures = false;
			}
		}

		if (tooManyAdventures && in_glover())
		{
			if (Location.get(["The Penultimate Fantasy Airship", "The Smut Orc Logging Camp", "The Hidden Temple"]).includes(place))
			{
				tooManyAdventures = false;
			}
		}

		if (tooManyAdventures && in_robot())
		{
			if (Location.get(["The Penultimate Fantasy Airship", "The Smut Orc Logging Camp", "The Haunted Bedroom", "The Haunted Billiards Room"]).includes(place))
			{
				tooManyAdventures = false;
			}
		}

		if (Location.get(["The Haunted Gallery"]).includes(place) && place.turnsSpent < 100)
		{
			tooManyAdventures = false;
		}

		if (Location.get(["The Daily Dungeon"]).includes(place) && toBoolean(getProperty("auto_forceFatLootToken")))
		{
			tooManyAdventures = false;
		}

		const can_powerlevel_stench: boolean = elementalPlanes_access(Element.get("stench")) && auto_have_skill(Skill.get("Summon Smithsness")) && toInt(getProperty("auto_beatenUpCount")) === 0;
		const has_powerlevel_iotm: boolean = can_powerlevel_stench || elementalPlanes_access(Element.get("spooky")) || elementalPlanes_access(Element.get("cold")) || elementalPlanes_access(Element.get("sleaze")) || elementalPlanes_access(Element.get("hot")) || neverendingPartyAvailable();
		if (!has_powerlevel_iotm && Location.get(["The Haunted Gallery", "The Haunted Bedroom"]).includes(place))
		{
			tooManyAdventures = false; //if we do not have iotm powerlevel zones then we are forced to use haunted gallery or bedroom
		}

		if (mySessionAdv() < toInt(getProperty("_auto_override_tooManyAdv")))
		{
			tooManyAdventures = false; //currently in override for too many adv
		}

		if (tooManyAdventures)
		{
			if (toBoolean(getProperty("auto_newbieOverride")))
			{
				setProperty("auto_newbieOverride", false.toString());
				setProperty("_auto_override_tooManyAdv", (mySessionAdv() + 5).toString()); //override 5 adv at a time
				auto_log_warning(`We have spent ${place.turnsSpent} turns at '${place}' and that is bad... override accepted.`, "red");
			}
			else {
				print("You can bypass this once by executing the gCLI command:", "blue");
				print("set auto_newbieOverride = true", "blue");
				abort(`We have spent ${place.turnsSpent} turns at '${place}' and that is bad... aborting.`);
			}
		}
	}

	if (lastMonster() === Monster.get("crate") && getProperty("screechDelay") !== "" && (in_wereprof() && !((Location.get("Noob Cave")).turnsSpent < 8)))
	{ //want 7 turns of Noob Cave in Wereprof for Smashed Scientific Equipment
		if (toBoolean(getProperty("auto_newbieOverride")))
		{
			setProperty("auto_newbieOverride", false.toString());
		}
		else {
			abort("We went to the Noob Cave for reals... uh oh");
		}
	}
	else {
		setProperty("auto_newbieOverride", false.toString());
	}
	return false;
}

function beatenUpResolution(): void
{
	if (haveEffect(Effect.get("Beaten Up")) > 0)
	{
		if (toInt(getProperty("auto_beatenUpCount")) > 10 && getProperty("lastEncounter") !== "Poetic Justice")
		{
			abort("We are getting beaten up too much, this is not good. Aborting.");
		}
		acquireHP();
	}

	if (haveEffect(Effect.get("Beaten Up")) > 0)
	{
		if (haveEffect(Effect.get("Beaten Up")) === 2 && getProperty("lastEncounter") === "Dr. Awkward" && internalQuestStatus("questL11Palindome") > 5)
		{
			//beaten up by the quest item when unlocking Dr. Awkward, not by failing a fight
			setProperty("_auto_AwkwardBeatenUp", myTurncount().toString());
			auto_log_info$1("We must have failed to remove beaten up before defeating Dr. Awkward and that hasn't stopped us so far...");
		}
		else if (haveEffect(Effect.get("Beaten Up")) === 1 && toInt(getProperty("_auto_AwkwardBeatenUp")) !== 0 && myTurncount() - toInt(getProperty("_auto_AwkwardBeatenUp")) <= 1)
		{
			auto_log_info$1("This should be the last turn of beaten up from Dr. Awkward");
		}
		else {
			cliExecute("refresh all");
			if (haveEffect(Effect.get("Beaten Up")) > 0)
			{
				abort("We failed to remove beaten up. Adventuring in the same place that we got beaten in with half stats will just result in us dying again");
			}
		}
	}
}

export function speculative_pool_skill(): number
{
	let expectPool: number = toInt(getProperty("poolSkill"));
	expectPool += min(10, toInt(2 * squareRoot(toInt(getProperty("poolSharkCount")))));
	if (myInebriety() >= 10)
	{
		expectPool += 30 - 2 * myInebriety();
	}
	else {
		expectPool += myInebriety();
	}
	if (auto_is_valid(Item.get("handful of hand chalk")) && (haveEffect(Effect.get("Chalky Hand")) > 0 || itemAmount(Item.get("handful of hand chalk")) > 0))
	{
		expectPool += 3;
	}
	if (haveEffect(Effect.get("Chalked Weapon")) > 0)
	{
		expectPool += 5;
	}
	if (haveEffect(Effect.get("Influence of Sphere")) > 0)
	{
		expectPool += 5;
	}
	if (haveEffect(Effect.get("Video... Games?")) > 0)
	{
		expectPool += 5;
	}
	if (haveEffect(Effect.get("Swimming with Sharks")) > 0)
	{
		expectPool += 3;
	}
	return expectPool;
}

function autosellCrap(): boolean
{
	if (canInteract() && myMeat() > 20000)
	{
		return false; //do not autosell stuff in casual or postronin unless you are very poor
	}
	if (in_wotsf())
	{
		return false; //selling things in the way of the surprising fist only donates the money to charity, so we should not autosell anything automatically
	}

	for (const it of Item.get(["ancient vinyl coin purse", "black pension check", "CSA discount card", "fat wallet", "Gathered Meat-Clip", "loose Meats", "old leather wallet", "Penultimate Fantasy chest", "pixellated moneybag", "old coin purse", "shiny stones", "Warm Subject gift certificate"]))
	{
		if (itemAmount(it) > 0 && auto_is_valid(it))
		{
			use(min(10, itemAmount(it)), it);
		}
	}
	//keeping 1 garbage in stock to avoid possible harmful loop with dinseylandfill_garbageMoney()
	//keeping 1 briefcase in stock for the Infiltrationist choice 2
	for (const it of Item.get(["bag of park garbage", "briefcase"]))
	{
		if (itemAmount(it) > 1 && auto_is_valid(it))
		{ //for these items we want to keep 1 in stock. use the rest
			use(min(10, itemAmount(it) - 1), it);
		}
	}
	if (!toBoolean(getProperty("_governmentPerDiemUsed")) && itemAmount(Item.get("government per-diem")) > 0) {
		use(1, Item.get("government per-diem"));
	}
	if (toInt(getProperty("handfulOfTipsMeat")) < 9600 && itemAmount(Item.get("handful of tips")) > 0) {
		use(1, Item.get("handful of tips"));
	}
	if (itemAmount(Item.get("Stock Certificate")) > 0) {
		const turns: string = getProperty("stockCertificateTurns");
		if (turns !== "") {
			const earliestTurns: number = toInt((splitString(turns, ",")[0] ??= ""));
			if (totalTurnsPlayed() - earliestTurns >= 500) {
				use(1, Item.get("Stock Certificate"));
			}
		}
	}

	if (in_amw())
	{
		return false; // don't bother trying to autosell in Adventurer Meats World
	}
	// Function to sell all of our items, optionally keeping some.
	function sell_except(n_to_keep: number, items_to_sell: Map<Item, boolean>): void
	{
		for (const it of items_to_sell.keys())
		{
			if (itemAmount(it) > n_to_keep)
			{
				auto_autosell(min(10, itemAmount(it) - n_to_keep), it);
			}
		}
	}
	// keep none of these
	let items_considered: Map<Item, boolean> = new Map([[Item.get("dense meat stack"), true], [Item.get("meat stack"), true], //quest rewards that are better off as meat. If we ever need it we can freely recreate them at no loss.
	  [Item.get("blue money bag"), true], [Item.get("red money bag"), true], [Item.get("white money bag"), true], //vampyre path boss rewards and major source of meat in run.
	  [Item.get("space blanket"), true], //can be inside MayDay package. Only purpose is to sell for meat
	  [Item.get("void stone"), true]]); //dropped by Void Fights when Cursed Magnifying Glass is equiped. Only purpose is to sell for meat

	sell_except(0, items_considered);

	sell_except(2, new Map([[Item.get("elegant nightstick"), true]])); //keeping 2 nightsticks in stock for double fisting
	// below this point are items we only want to sell if we are desperate for meat.
	if (auto_amIRich())
	{
		return false;
	}
	// Keep none
	items_considered = new Map([[Item.get("anticheese"), true], [Item.get("awful poetry journal"), true], [Item.get("Azurite"), true], [Item.get("beach glass bead"), true], [Item.get("beer bomb"), true], [Item.get("bit-o-cactus"), true],
	  [Item.get("clay peace-sign bead"), true], [Item.get("clockwork key"), true], [Item.get("cocoa eggshell fragment"), true], [Item.get("datastick"), true], [Item.get("decorative fountain"), true], [Item.get("dense meat stack"), true],
	  [Item.get("empty Cloaca-Cola bottle"), true], [Item.get("enchanted barbell"), true], [Item.get("Eye Agate"), true], [Item.get("fancy bath salts"), true], [Item.get("frigid ninja stars"), true],
	  [Item.get("Feng Shui for Big Dumb Idiots"), true], [Item.get("Frat Army FGF"), true], [Item.get("giant moxie weed"), true], [Item.get("half of a gold tooth"), true],
	  [Item.get("headless sparrow"), true], [Item.get("keel-haulin' knife"), true], [Item.get("Knob Goblin pants"), true], [Item.get("Knob Goblin scimitar"), true], [Item.get("Knob Goblin tongs"), true],
	  [Item.get("Kokomo Resort Pass"), true], [Item.get("Lapis Lazuli"), true], [Item.get("leftovers of indeterminate origin"), true], [Item.get("Mad Train wine"), true], [Item.get("mangled squirrel"), true], [Item.get("margarita"), true],
	  [Item.get("meat paste"), true], [Item.get("mineapple"), true], [Item.get("moxie weed"), true], [Item.get("PADL Phone"), true], [Item.get("patchouli incense stick"), true], [Item.get("phat turquoise bead"), true],
	  [Item.get("photoprotoneutron torpedo"), true], [Item.get("plot hole"), true], [Item.get("procrastination potion"), true], [Item.get("rat carcass"), true], [Item.get("sausage bomb"), true],
	  [Item.get("sea honeydew"), true], [Item.get("sea lychee"), true], [Item.get("sea persimmon"), true], [Item.get("sea tangelo"), true],
	  [Item.get("shiny hood ornament"), true], [Item.get("slingshot"), true], [Item.get("smelted roe"), true], [Item.get("spicy jumping bean burrito"), true], [Item.get("spicy bean burrito"), true], [Item.get("spooky stick"), true],
	  [Item.get("strongness elixir"), true], [Item.get("sunken chest"), true], [Item.get("tambourine bells"), true], [Item.get("tequila sunrise"), true], [Item.get("Uncle Jick's Brownie Mix"), true], [Item.get("windchimes"), true]]);

	sell_except(0, items_considered);

	if (auto_amIRich())
	{
		return false;
	}
	// Pixels, keep all in KoE, none otherwise (black and red saved for red pixel potions)
	if (!in_koe())
	{
		items_considered = new Map([[Item.get("blue pixel"), true], [Item.get("green pixel"), true], [Item.get("white pixel"), true]]);
		sell_except(0, items_considered);
	}
	// Keep none
	items_considered = new Map([[Item.get("Imp Ale"), true], [Item.get("shot of grapefruit schnapps"), true], [Item.get("shot of orange schnapps"), true], [Item.get("shot of tomato schnapps"), true]]);
	sell_except(0, items_considered);
	// Keep one
	items_considered = new Map([[Item.get("big hot pepper"), true], [Item.get("chaos butterfly"), true]]);
	sell_except(1, items_considered);
	// Keep three
	items_considered = new Map([[Item.get("energized spores"), true], [Item.get("hot wing"), true]]);
	sell_except(3, items_considered);

	return true;
}

function print_header(): void
{
	if (myThunder() > toInt(getProperty("auto_lastthunder")))
	{
		setProperty("auto_lastthunderturn", `${myTurncount()}`);
		setProperty("auto_lastthunder", `${myThunder()}`);
	}
	if (inHardcore())
	{
		auto_log_info(`Turn(${myTurncount()}): Starting with ${myAdventures()} left at Level: ${myLevel()}`, "cyan");
	}
	else {
		auto_log_info(`Turn(${myTurncount()}): Starting with ${myAdventures()} left and ${pullsRemaining()} pulls left at Level: ${myLevel()}`, "cyan");
	}
	if ((itemAmount(Item.get("rock band flyers")) === 1 || itemAmount(Item.get("jam band flyers")) === 1) && toInt(getProperty("flyeredML")) < 10000 && !toBoolean(getProperty("auto_ignoreFlyer")))
	{
		auto_log_info(`Still flyering: ${getProperty("flyeredML")}`, "blue");
	}
	auto_log_info(`Encounter: ${combatRateModifier()}   Exp Bonus: ${experienceBonus()}`, "blue");
	auto_log_info(`Meat Drop: ${meatDropModifier()}\t Item Drop: ${itemDropModifier()}`, "blue");
	auto_log_info(`HP: ${myHp()}/${myMaxhp()}, MP: ${myMp()}/${myMaxmp()}, Meat: ${myMeat()}`, "blue");
	auto_log_info(`Tummy: ${myFullness()}/${fullnessLimit()} Liver: ${myInebriety()}/${inebrietyLimit()} Spleen: ${mySpleenUse()}/${spleenLimit()}`, "blue");
	auto_log_info(`ML: ${monsterLevelAdjustment()} control: ${currentMcd()}`, "blue");
	if (myClass() === Class.get("Sauceror"))
	{
		auto_log_info(`Soulsauce: ${mySoulsauce()}`, "blue");
	}
	if (haveEffect(Effect.get("Ultrahydrated")) > 0 && toInt(getProperty("desertExploration")) < 100)
	{
		auto_log_info(`Ultrahydrated: ${haveEffect(Effect.get("Ultrahydrated"))}`, "violet");
	}
	if (haveEffect(Effect.get("Everything Looks Yellow")) > 0)
	{
		auto_log_info(`Everything Looks Yellow: ${haveEffect(Effect.get("Everything Looks Yellow"))}`, "blue");
	}
	if (equippedItem(Slot.get("familiar")) === Item.get("Snow Suit"))
	{
		auto_log_info(`Snow suit usage: ${getProperty("_snowSuitCount")} carrots: ${getProperty("_carrotNoseDrops")}`, "blue");
	}
	if (in_heavyrains())
	{
		auto_log_info(`Thunder: ${myThunder()} Rain: ${myRain()} Lightning: ${myLightning()}`, "green");
	}
	if (isActuallyEd())
	{
		auto_log_info(`Ka Coins: ${itemAmount(Item.get("Ka coin"))} Lashes used: ${getProperty("_edLashCount")}`, "green");
	}
	if (in_plumber())
	{
		auto_log_info(`Coins: ${itemAmount(Item.get("coin"))}`, "green");
	}
}

export function resetState(): void {
	//These settings should never persist into another turn, ever. They only track something for a single instance of the main loop.
	//We use boolean instead of adventure count because of free combats.

	removeProperty("auto_combatDirective"); //An action to execute at the start of next combat. resets every loop.
	removeProperty("auto_digitizeDirective"); //digitize a specified monster on the next combat.
	setProperty("auto_doCombatCopy", "no");
	setProperty("_auto_thisLoopHandleFamiliar", false.toString()); // have we called handleFamiliar this loop
	setProperty("auto_disableAdventureHandling", false.toString()); // used to stop auto_pre_adv and auto_post_adv from doing anything.
	setProperty("auto_disableFamiliarChanging", false.toString()); // disable autoscend making changes to familiar
	setProperty("auto_familiarChoice", ""); // which familiar do we want to switch to during pre_adventure
	setProperty("choiceAdventure1387", (-1).toString()); // using the force non-combat
	setProperty("_auto_tunedElement", ""); // Flavour of Magic elemental alignment
	setProperty("auto_nextEncounter", ""); // monster that was expected last turn
	setProperty("auto_habitatMonster", ""); // monster we want to cast Recall Facts: Monster Habitats
	setProperty("auto_purple_candled", ""); //monster we want to cast Blow the Purple Candle
	setProperty("auto_nonAdvLoc", false.toString()); // location is a non-adventure.php location

	if (doNotBuffFamiliar100Run())
	{ //some familiars are always bad
		setProperty("_auto_bad100Familiar", true.toString()); //disable buffing familiar
	}
	else {
	//some familiars are only bad at certain locations
		setProperty("_auto_bad100Familiar", false.toString()); //reset to not bad. target location might set them as bad again
	}

	setProperty("auto_parkaSetting", ""); // jurassic parka setting
	setProperty("auto_retrocapeSettings", ""); // retrocape config
	setProperty("auto_januaryToteAcquireCalledThisTurn", false.toString()); // january tote item switching

	horseDefault(); // horsery tracking

	setProperty("auto_snapperPhylum", ""); // internal Red-Nosed Snapper phylum tracking. Ensures we only change it maximum once per adventure (and don't lose charges)

	bat_formNone(); // Vampyre form tracking

	resetMaximize();

	if (canChangeToFamiliar(Familiar.get("Left-Hand Man")) && familiarEquippedEquipment(Familiar.get("Left-Hand Man")) !== Item.none)
	{
		// Leaving something equipped on the Left-Hand man like the Latte is currently bugged in mafia
		// as it will show any skills the equipment gives as available even when you have a completely different familiar
		// see https://kolmafia.us/showthread.php?24780-April-2020-IOTM-sinistral-homunculus&p=158453&viewfull=1#post158453
		auto_log_info(`Unequipping your ${familiarEquippedEquipment(Familiar.get("Left-Hand Man"))} from the Left-Hand Man`, "blue");
		useFamiliar(Familiar.get("Left-Hand Man"));
		equip(Slot.get("familiar"), Item.none);
	}

	for (const it of Item.get(["staph of homophones", "sword behind inappropriate prepositions"]))
	{
		// these screw with text in the game which breaks mafia's parsing in a lot of places.
		if (haveEquipped(it))
		{
			equip(Item.none, toSlot(it));
		}
	}
	for (const eff of Effect.get(["Dis Abled", "Haiku State of Mind", "Just the Best Anapests", "O Hai!", "Robocamo", "Yes, Can Haz"]))
	{
		// as do these which can all be freely shrugged.
		if (haveEffect(eff) > 0)
		{
			cliExecute(`uneffect ${eff.toString()}`);
		}
	}
}

function process_tasks(): boolean
{
	const task_order: Map<string, Map<number, Map<string, string>>> = fileAsMap("autoscend_task_order.txt", [String, Number, String, String]);
	if (!task_order.size)
	{
		abort("Could not load /data/autoscend_task_order.txt");
	}

	let task_path: string = myPath().name;
	if (!(task_order.has(task_path)))
	{
		task_path = "default";
	}

	for (const [i, _v0] of (task_order.get(task_path) ?? task_order.set(task_path, new Map()).get(task_path))) {
		for (const [task_function, _v1] of _v0) {
			const condition_function = _v1;
		auto_log_debug$1(`Attempting to execute task ${i} ${task_function}`);
		if (condition_function === "" || callRegisteredTaskFunction(condition_function))
		{
			const result_1: boolean = callRegisteredTaskFunction(task_function);
			if (result_1)
			{
				return true;
			}
		}
		}
	}

	return false;
}

function doTasks(): boolean
{
	//this is the main loop for autoscend. returning true will restart from the begining. returning false will quit the loop and go on to do bedtime

	auto_settingsFix(); //check and correct invalid configuration inputs made by users
	if (!auto_unreservedAdvRemaining())
	{
		auto_log_warning("No more unreserved adventures left", "red");
		return false; //we are out of adventures
	}
	if (toBoolean(getProperty("_auto_doneToday")))
	{
		auto_log_warning("According to property _auto_doneToday I am done for today", "red");
		return false;
	}
	if (myFamiliar() === Familiar.get("Stooper") && pathAllowsChangingFamiliar())
	{
		auto_log_info("Avoiding stooper stupor...", "blue");
		const fam: Familiar = (is100FamRun() ? toFamiliar(getProperty("auto_100familiar")) : findNonRockFamiliarInTerrarium());
		useFamiliar(fam);
	}
	if (myInebriety() > inebrietyLimit())
	{
		auto_log_warning("I am overdrunk", "red");
		return false;
	}
	if (inAftercore())
	{
		auto_log_warning("I am in aftercore", "red");
		return false;
	}
	// Check if rollover's coming up soon
	if (almostRollover())
	{
		print("Rollover's coming!  Gotta consume what we can and go to bed!", "red");
		// How much organ space left?  If none, go to bed
		const organ_space: number = consumptionProgress();
		auto_log_debug(`${organ_space} organ space`, "blue");
		if (organ_space >= 0.999)
		{
		  return false;
		}
		// How much organ space was available the last time we were here?
		const previous_space: number = toFloat(getProperty("_auto_organSpace"));
		const organ_space_change: number = organ_space - previous_space;
		auto_log_debug(`${previous_space} previous space`, "blue");
		auto_log_debug(`${organ_space_change} organ space change`, "blue");
		setProperty("_auto_organSpace", organ_space.toString());
		// If no space used the last time consumption was done, don't bother trying again
		if (organ_space_change < 0.001)
		{
		  return false;
		}
		// There's space left to fill, but let's continue only if we don't have enough adventures
		return needToConsumeForEmergencyRollover();
	}

	casualCheck();

	print_header();

	auto_interruptCheck(false);

	const delay: number = toInt(getProperty("auto_delayTimer"));
	if (delay > 0)
	{
		auto_log_info("Delay between adventures... beep boop... ", "blue");
		wait(delay);
	}

	const paranoia: number = toInt(getProperty("auto_paranoia"));
	const is_april_fools: boolean = substring(todayToString(), 4) === "0401";
	if (is_april_fools)
	{
		auto_log_info$1("Salad april fools, so we paranoid salad.");
		cliExecute("refresh quests");
	}
	else if (paranoia !== -1)
	{
		const paranoia_counter: number = toInt(getProperty("auto_paranoia_counter"));
		if (paranoia_counter >= paranoia)
		{
			auto_log_info("I think I'm paranoid and complicated", "blue");
			auto_log_info("I think I'm paranoid, manipulated", "blue");
			cliExecute("refresh quests");
			setProperty("auto_paranoia_counter", (0).toString());
		}
		else {
			setProperty("auto_paranoia_counter", (paranoia_counter + 1).toString());
		}
	}
	if (toBoolean(getProperty("auto_inv_paranoia")))
	{
		cliExecute("refresh inv");
	}
	if (in_wereprof()) {
		// wereprof doesn't update wereProfessorTransformTurns unless you hit the charpane
		visitUrl("charpane.php", false);
	}
	// actually doing stuff should start from here onwards.
	resetState();

	basicAdjustML();

	if (zoo_graftFam()) { return true; }

	finishBuildingSmutOrcBridge();
	councilMaintenance();
	auto_buySkills(); // formerly picky_buyskills() now moved here
	awol_buySkills();
	awol_useStuff();
	aosol_unCurse();
	aosol_buySkills();
	theSource_buySkills();
	jarlsberg_buySkills();
	boris_buySkills();
	pete_buySkills();
	zombieSlayer_buySkills();
	pokefam_getHats();
	auto_refreshQTFam();
	lol_buyReplicas();
	iluh_buyEquiq();
	ht_equip_hats(); //equip hats in Hat Trick

	oldPeoplePlantStuff();
	use_barrels();
	auto_latteRefill$6();
	auto_buyCrimboCommerceMallItem();
	houseUpgrade();
	//This just closets stuff so G-Lover does not mess with us.
	if (LM_glover()) { return true; }
	//This just closets stuff that bees don't like
	if (LM_bhy()) { return true; }

	tophatMaker();
	deck_useScheme("");
	autosellCrap();
	asdonAutoFeed();
	LX_craftAcquireItems();
	auto_spoonTuneMoon();
	auto_chapeau();
	auto_buyFireworksHat();
	auto_CMCconsult();
	auto_checkTrainSet();
	prioritizeGoose();
	auto_useWardrobe();
	auto_MayamClaimAll();
	auto_defaultBurnLeaves();
	auto_waveTheZone();

	ocrs_postCombatResolve();
	beatenUpResolution();
	lar_safeguard();

	auto_useLeprecondoDrops();

	if (LX_zootoFight()) { return true; }
	//Early adventure options that we probably want
	if (dna_startAcquire()) { return true; }
	if (LM_boris()) { return true; }
	if (LM_pete()) { return true; }
	if (LM_gnoob()) { return true; }
	if (LM_nuclear()) { return true; }
	if (LM_lar()) { return true; }
	if (LM_batpath()) { return true; }
	if (heavyrains_buySkills()) { return true; }
	if (LM_canInteract()) { return true; }
	if (LM_kolhs()) { return true; }
	if (LM_jarlsberg()) { return true; }
	if (LM_robot()) { return true; }
	if (LM_plumber()) { return true; }
	if (LM_zombieSlayer()) { return true; }
	if (LM_adventurerMeatsWorld()) { return true; }

	 {
		cheeseWarMachine(0, 0, 0, 0);

		let turnGoal: number = 0;
		if (isActuallyEd() && !possessEquipment(Item.get("The Crown of Ed the Undying")))
		{
			turnGoal = 15;
		}

		if (myTurncount() >= turnGoal)
		{
			switch (myDaycount())
			{
			case 1:			loveTunnelAcquire(true, Stat.none, true, 1, true, 3);			break;
			case 2:			loveTunnelAcquire(true, Stat.none, true, 3, true, 1);			break;
			default:			loveTunnelAcquire(true, Stat.none, true, 2, true, 1);			break;
			}
		}
	}

	if (theSource_oracle()) { return true; }
	if (LX_theSource()) { return true; }
	if (LX_ghostBusting()) { return true; }
	if (witchessFights()) { return true; }
	//
	//Adventuring actually starts here.
	//

	if (LA_grey_goo_tasks())
	{
		return true;
	}
	if (in_ggoo())
	{
		abort("Should not have gotten here, aborted LA_grey_goo_tasks method allowed return to caller. Uh oh.");
	}

	auto_voteSetup$2(0, 0, 0);
	auto_setSongboom();
	if (auto_juneCleaverAdventure()) { return true; }
	if (LX_ForceNC()) { return true; }
	if (LX_dronesOut()) { return true; }
	if (LM_bond()) { return true; }
	if (LX_calculateTheUniverse(false)) { return true; }
	rockGardenEnd();
	adventureFailureHandler();
	dna_sorceressTest();
	dna_generic();
	if (LA_wildfire()) { return true; }
	if (LA_robot()) { return true; }
	if (auto_autumnatonQuest()) { return true; }
	if (auto_smallCampgroundGear()) { return true; }
	auto_lostStomach$1(false);
	autoCleanse(); //running turbo only
	if (auto_doPhoneQuest()) { return true; }

	if (auto_doTempleSummit()) { return true; }
	if (L8_mountainManSummon()) { return true; }

	if (process_tasks()) { return true; }

	meatReserveMessage();
	auto_log_info("I should not get here more than once because I pretty much just finished all my in-run stuff. Beep", "blue");
	return false;
}

function auto_begin(): void
{
	if (getAutoAttack() !== 0)
	{
		const shouldUnset: boolean = userConfirm("You have an auto attack enabled. This can cause issues. Would you like us to disable it? Will default to 'No' in 30 seconds.", 30000, false);
		if (shouldUnset)
		{
			setAutoAttack(0);
		}
		else {
			auto_log_warning("Okay, but the warranty is off.", "red");
		}
	}

	if (in_community())
	{
		abort("Community Service is no longer supported.");
	}

	if (inBadMoon())
	{
		const nope: boolean = userConfirm("Bad moon is not a thing we will ever support even if you can somehow meet the scripts minimum requirements. Do you understand?");
		const failure: string = (nope ? "Just no." : "Even if you don't understand, it's still no.");
		abort(failure);
	}

	if (!auto_meetsMinimumRequirements())
	{
		auto_log_warning("Minimum skill requirements to run autoscend are not met.", "red");
		if (toInt(getProperty("_auto_im_cool_with_dying_a_lot")) === -1)
		{
			auto_log_warning("Don't come crying to us when you get beat up.", "red");
		}
		else {
			auto_log_warning("Aborting to avoid dying a lot and making very little progress. To override:", "red");
			auto_log_warning("set _auto_im_cool_with_dying_a_lot = -1", "red");
			abort();
		}
	}

	LX_handleIntroAdventures(); // handle early non-combats in challenge paths.
	cliExecute("refresh all");

	if (myClass().toString() === "Astral Spirit")
	{
		// my_class() can report Astral Spirit even though it is not a valid class....
		//workaround for this bug specifically https://kolmafia.us/showthread.php?25579
		abort("Mafia thinks you are an astral spirit. Type \"logout\" in gCLI and then log back in afterwards. as this is needed to fix this and identify what your class actually is");
	}

	auto_log_info$1(`Hello ${myName()}, time to explode!`);
	auto_log_info$1(`This is version: ${gitInfo("autoscend").commit} Mafia: ${getRevision()}`);
	auto_log_info$1(`This is day ${myDaycount()}.`);
	auto_log_info$1(`Turns played: ${myTurncount()} current adventures: ${myAdventures()}`);
	auto_log_info$1(`Current Ascension: ${myPath().name}`);
	auto_log_info$1(`You have: ${banishSources()} banish sources, ${freeRunSources()} free-run sources, ${freeKillSources()} free kill sources, ${instaKillSources()} insta-kill sources, ${yellowRaySources()} yellow ray sources, ${copySources()} copy sources, and ${sniffSources()} sniff sources.`);

	auto_settings();

	backupSetting("promptAboutCrafting", (0).toString());
	backupSetting("requireBoxServants", false.toString());
	backupSetting("breakableHandling", (4).toString());
	backupSetting("trackLightsOut", false.toString());
	backupSetting("autoSatisfyWithCloset", false.toString());
	backupSetting("autoSatisfyWithCoinmasters", true.toString());
	backupSetting("autoSatisfyWithNPCs", true.toString());
	backupSetting("removeMalignantEffects", false.toString());
	backupSetting("autoAntidote", (0).toString());
	backupSetting("dontStopForCounters", true.toString());
	backupSetting("maximizerCombinationLimit", "100000");
	backupSetting("afterAdventureScript", "scripts/autoscend/auto_post_adv.js");
	backupSetting("choiceAdventureScript", "scripts/autoscend/auto_choice_adv.js");
	backupSetting("betweenBattleScript", "scripts/autoscend/auto_pre_adv.js");
	backupSetting("recoveryScript", "");
	backupSetting("counterScript", "");
	if (!toBoolean(getProperty("auto_disableExcavator")))
	{
		backupSetting("spadingScript", "excavator.js");
	}
	backupSetting("hpAutoRecovery", (-0.05).toString());
	backupSetting("hpAutoRecoveryTarget", (-0.05).toString());
	backupSetting("mpAutoRecovery", (-0.05).toString());
	backupSetting("mpAutoRecoveryTarget", (-0.05).toString());
	backupSetting("manaBurningTrigger", (-0.05).toString());
	backupSetting("manaBurningThreshold", (-0.05).toString());
	backupSetting("autoAbortThreshold", (-0.05).toString());
	backupSetting("currentMood", "apathetic");
	backupSetting("logPreferenceChange", "true");
	backupSetting("logPreferenceChangeFilter", "maximizerMRUList,testudinalTeachings,auto_maximize_current");
	backupSetting("maximizerMRUSize", (0).toString()); // shuts the maximizer spam up!
	backupSetting("allowNonMoodBurning", true.toString()); // required to be true for burn cli cmd to work properly
	backupSetting("lastChanceThreshold", (1).toString()); // burn command will always use last chance skill, if we have no active buffs
	backupSetting("lastChanceBurn", ""); // clear default mana burn skill so mafia doesn't attempt to cast a skill we don't currently have

	const charpane: string = visitUrl("charpane.php");
	if (containsText(charpane, "<hr width=50%><table"))
	{
		auto_log_info$1("Switching off Compact Character Mode, will resume during bedtime");
		setProperty("auto_priorCharpaneMode", (1).toString());
		visitUrl("account.php?am=1&pwd=&action=flag_compactchar&value=0&ajax=0", true);
	}

	initializeSettings(); // sets properties (once) for the entire run (all paths).
	pathDroppedCheck(); //detects path changing. such as due to being dropped. and reinitialize appropriate settings

	initializeSession(); // sets properties for the current session (should all be reset when we're done)

	if (myFamiliar() === Familiar.get("Stooper") && pathAllowsChangingFamiliar())
	{
		auto_log_info("Avoiding stooper stupor...", "blue");
		const fam: Familiar = (is100FamRun() ? toFamiliar(getProperty("auto_100familiar")) : findNonRockFamiliarInTerrarium());
		useFamiliar(fam);
	}
	// =================================================
	// Actually doing stuff should start from here down.
	// =================================================

	resetMaximize(); // initializeDay calls equipBaseline for some reason so this is needed until it is refactored.
	initializeDay(myDaycount());
	handlePulls(myDaycount());

	dailyEvents(); // All once-per-day stuff (which doesn't spend adventures) should go in here
	// Try to consume something if not enough adventures to get going
	if (!auto_unreservedAdvRemaining())
	{
		consumeStuff();
	}
	// the main loop of autoscend is doTasks() which is actually called as part of the while.
	while (doTasks())
	{
		consumeStuff();
	}

	if (doBedtime())
	{
		auto_log_info$1(`Done for today (${myDaycount()}), beep boop`);
	}
}

function print_help_text(): void
{
	printHtml("Thank you for using autoscend!");
	printHtml("If you need to configure or interrupt the script, choose <b>autoscend</b> from the drop-down \"run script\" menu in your browser.");
	printHtml("If you want to contribute, please open an issue <a href=\"https://github.com/loathers/autoscend/issues\">on Github</a>");
	printHtml("A FAQ with common issues (and tips for a great bug report) <a href=\"https://docs.google.com/document/d/1AfyKDHSDl-fogGSeNXTwbC6A06BG-gTkXUAdUta9_Ns\">can be found here</a>");
	printHtml("The developers also hang around <a href=\"https://discord.gg/96xZxv3\">on the Ascension Speed Society discord server</a>");
	printHtml("");
}

function sad_times(): void
{
	printHtml("autoscend (formerly sl_ascend) is under new management. Soolar (the maintainer of sl_ascend) and Jeparo (the most active contributor) have decided to cease development of sl_ascend in response to Jick's behavior that has recently <a href=\"https://www.reddit.com/r/kol/comments/d0cq9s/allegations_of_misconduct_by_asymmetric_members/\">come to light</a>. New developers have taken over maintenance and rebranded sl_ascend to autoscend as per Soolar's request. Please be patient with us during this transition period. Please see the readme on the <a href=\"https://github.com/loathers/autoscend\">github</a> page for more information.");
}

function safe_preference_reset_wrapper(level: number): void
{
	if (level <= 0)
	{
		auto_begin();
	}
	else {
		let succeeded: boolean = false;
		try {
			safe_preference_reset_wrapper(level - 1);
			succeeded = true;
		} finally
		{
			restoreAllSettings();
			if (level === 1)
			{
				sad_times();
			}
		}
	}
}

export function main(...input: string[]): void
{
	if (getRevision() < 29094) {
		throw `Requires KoLMafia 29094 or newer, please update your KoLMafia`;
	}

	backupSetting("printStackOnAbort", true.toString());
	// parse input
	if (input.length > 0)
	{
		switch ((input[0] ??= ""))
		{
			case "sim":

				// display useful items/skills/perms/etc and if the user has them
printSim();
				return;
			case "turbo":

			// gotta go faaaaaast. Doing a double confirm because of the nature of this parameter.
if (userConfirm("This will get expensive for you. This should only be used if you are trying to go for a 1-day and don't care about expenses. Do you really want to do this? Will default to 'No' in 15 seconds.", 15000, false))
				{
					if (userConfirm("This will use UMSBs and Spice Melanges if you have them. If you are ok with this, you have 15 seconds to hit 'Yes'", 15000, false))
					{
						setProperty("auto_turbo", "true");
						auto_log_info$1("Ka-chow! Gotta go fast.");
						break;
					}
				}
			default:
				auto_log_info$1("Running normal autoscend because you didn't enter in a valid parameter");
		}
	}

	print_help_text();
	sad_times();
	if (!autoscend_migrate() && !userConfirm("autoscend might not have upgraded from a previous version correctly, do you want to continue? Will default to true in 10 seconds.", 10000, true)) {
		abort("User aborted script after failed migration.");
	}
	safe_preference_reset_wrapper(3);
}
