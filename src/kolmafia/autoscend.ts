import {
  abort,
  availableAmount,
  buy,
  canDrink,
  canEat,
  canInteract,
  cliExecute,
  combatRateModifier,
  containsText,
  council,
  currentMcd,
  Element,
  equip,
  equippedItem,
  experienceBonus,
  Familiar,
  familiarEquippedEquipment,
  fullnessLimit,
  getAutoAttack,
  getClanRumpus,
  getProperty,
  getRevision,
  getWorkshed,
  gitInfo,
  guildStoreAvailable,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  haveSkill,
  hiddenTempleUnlocked,
  hippyStoneBroken,
  inBadMoon,
  inebrietyLimit,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  itemDropModifier,
  knollAvailable,
  lastMonster,
  Location,
  mallPrices,
  max,
  meatDropModifier,
  min,
  minstrelInstrument,
  Monster,
  monsterLevelAdjustment,
  mpCost,
  myAdventures,
  myAscensions,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myHp,
  myInebriety,
  myLevel,
  myLightning,
  myLocation,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myName,
  myPath,
  myRain,
  mySessionAdv,
  mySoulsauce,
  mySpleenUse,
  myThunder,
  myTurncount,
  npcPrice,
  print,
  printHtml,
  pullsRemaining,
  putCloset,
  removeProperty,
  runChoice,
  setAutoAttack,
  setLocation,
  setProperty,
  spleenLimit,
  splitString,
  squareRoot,
  Stat,
  storageAmount,
  substring,
  toBoolean,
  todayToString,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  toMonster,
  toSlot,
  totalTurnsPlayed,
  use,
  useFamiliar,
  userConfirm,
  useSkill,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $element,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $skill,
  $slot,
  $stat,
  get,
  set,
  sinceKolmafiaRevision,
} from "libram";

import {
  acquireGumItem,
  acquireHermitItem,
  acquireTotem,
  auto_buyUpTo,
  handlePulls,
  LX_craftAcquireItems,
  pullXWhenHaveY,
  pulverizeThing,
} from "./autoscend/auto_acquire";
import { autoAdv } from "./autoscend/auto_adventure";
import { doBedtime } from "./autoscend/auto_bedtime";
import { buffMaintain$4 } from "./autoscend/auto_buff";
import {
  autoCleanse,
  consumeStuff,
  consumptionProgress,
} from "./autoscend/auto_consume";
import {
  addToMaximize,
  ensureSealClubs,
  equipBaseline,
  equipMaximizedGear,
  equipStatgainIncreasers$2,
  possessEquipment,
  possessOutfit$1,
  resetMaximize,
} from "./autoscend/auto_equipment";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  doNotBuffFamiliar100Run,
  findNonRockFamiliarInTerrarium,
  handleFamiliar$1,
  is100FamRun,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "./autoscend/auto_familiar";
import { auto_freeCombatsRemaining } from "./autoscend/auto_powerlevel";
import {
  acquireHP,
  invalidateRestoreOptionCache,
} from "./autoscend/auto_restore";
import { solveDelayZone } from "./autoscend/auto_routing";
import { auto_settings, auto_settingsFix } from "./autoscend/auto_settings";
import { printSim } from "./autoscend/auto_sim";
import {
  adjustForYellowRayIfPossible,
  almostRollover,
  auto_amIRich,
  auto_autosell,
  auto_freeCrafts,
  auto_get_campground,
  auto_have_skill,
  auto_interruptCheck,
  auto_is_valid,
  auto_log_debug,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_meetsMinimumRequirements,
  auto_needAccordion,
  auto_predictAccordionTurns,
  autoCraft,
  AutoStopError,
  backupSetting,
  banishSources,
  basicAdjustML,
  can_read_skillbook,
  copySources,
  doNumberology,
  freeKillSources,
  freeRunSources,
  handleBarrelFullOfBarrels,
  handleSealElement,
  handleSealNormal,
  instaKillSources,
  internalQuestStatus,
  isArmoryAvailable,
  isFreeMonster,
  isHermitAvailable,
  isUnclePAvailable,
  maxSealSummons,
  meatReserveMessage,
  needToConsumeForEmergencyRollover,
  ovenHandle,
  restoreAllSettings,
  sniffSources,
  trim,
  use_barrels,
  yellowRaySources,
} from "./autoscend/auto_util";
import { autoscend_migrate } from "./autoscend/autoscend_migration";
import {
  auto_floundryAction,
  auto_get_clan_lounge,
  zataraClanmate,
} from "./autoscend/iotms/clan";
import { elementalPlanes_access } from "./autoscend/iotms/elementalPlanes";
import { eudora_initializeSettings } from "./autoscend/iotms/eudora";
import {
  makeStartingSmiths,
  oldPeoplePlantStuff,
} from "./autoscend/iotms/mr2013";
import {
  dna_generic,
  dna_sorceressTest,
  dna_startAcquire,
  handleBjornify,
  icehouseUserErrorProtection,
} from "./autoscend/iotms/mr2014";
import {
  auto_barrelPrayers,
  chateaumantegna_havePainting,
  chateaumantegna_useDesk,
  chateaumantegna_usePainting,
  deck_useScheme,
} from "./autoscend/iotms/mr2015";
import {
  auto_chapeau,
  auto_doPrecinct,
  auto_sourceTerminalEducate,
  auto_sourceTerminalRequest,
  isOverdueDigitize,
  LX_ghostBusting,
  witchessFights,
} from "./autoscend/iotms/mr2016";
import {
  asdonAutoFeed,
  horseDefault,
  kgb_getMartini,
  kgbSetup,
  loveTunnelAcquire,
  makeGeniePocket,
} from "./autoscend/iotms/mr2017";
import {
  auto_latteRefill$6,
  auto_setSongboom,
  auto_voteMonster$1,
  auto_voteMonster$2,
  auto_voteSetup,
  cheeseWarMachine,
  fightClubNap,
  fightClubStats,
  neverendingPartyAvailable,
} from "./autoscend/iotms/mr2018";
import {
  auto_beachCombHead,
  auto_campawayGrabBuffs,
  auto_saberDailyUpgrade,
  auto_sausageGoblin,
  auto_spoonTuneConfirm,
  auto_spoonTuneMoon,
} from "./autoscend/iotms/mr2019";
import {
  auto_birdOfTheDay,
  auto_buyCrimboCommerceMallItem,
  auto_getGuzzlrCocktailSet,
  auto_latheAppropriateWeapon,
} from "./autoscend/iotms/mr2020";
import {
  auto_backupTarget,
  auto_backupToYourLastEnemy,
  auto_buyFireworksHat,
  auto_CMCconsult,
  auto_enableBackupCameraReverser,
  auto_harvestBatteries,
} from "./autoscend/iotms/mr2021";
import {
  auto_autumnatonQuest,
  auto_checkTrainSet,
  auto_juneCleaverAdventure,
  auto_voidMonster,
  auto_voidMonster$1,
  prioritizeGoose,
} from "./autoscend/iotms/mr2022";
import {
  auto_buyFrom2002MrStore,
  auto_defaultBurnLeaves,
  auto_doPhoneQuest,
  auto_habitatMonster,
  auto_initBurningLeaves,
  auto_lostStomach,
  auto_scepterSkills,
  auto_SITCourse,
  auto_useBlackMonolith,
  pickRocks,
  rockGardenEnd,
} from "./autoscend/iotms/mr2023";
import {
  auto_buyFromSeptEmberStore,
  auto_getAprilingBandItems,
  auto_getClanPhotoBoothDefaultItems,
  auto_getClanPhotoBoothEffect,
  auto_haveMayamCalendar,
  auto_MayamAllUsed,
  auto_MayamClaimAll,
} from "./autoscend/iotms/mr2024";
import {
  auto_getBCZItems,
  auto_getGlobs,
  auto_openMcLargeHugeSkis,
  auto_setLeprecondo,
  auto_useLeprecondoDrops,
  auto_waveTheZone,
} from "./autoscend/iotms/mr2025";
import {
  auto_elfToiletReady,
  auto_useElfToilet,
} from "./autoscend/iotms/mr2026";
import { auto_useWardrobe } from "./autoscend/iotms/ttt";
import {
  ed_initializeDay,
  ed_initializeSession,
  ed_initializeSettings,
  isActuallyEd,
} from "./autoscend/paths/actually_ed_the_undying";
import {
  amw_initializeSettings,
  in_amw,
  LM_adventurerMeatsWorld,
} from "./autoscend/paths/adventurer_meats_world";
import {
  auto_buySkills,
  pathDroppedCheck,
} from "./autoscend/paths/auto_path_util";
import {
  ag_initializeSettings,
  in_avantGuard,
} from "./autoscend/paths/avant_guard";
import {
  boris_buySkills,
  boris_initializeDay,
  boris_initializeSettings,
  is_boris,
  LM_boris,
} from "./autoscend/paths/avatar_of_boris";
import {
  is_jarlsberg,
  jarlsberg_buySkills,
  jarlsberg_initializeDay,
  jarlsberg_initializeSettings,
  LM_jarlsberg,
} from "./autoscend/paths/avatar_of_jarlsberg";
import {
  aosol_buySkills,
  aosol_initializeSettings,
  aosol_unCurse,
} from "./autoscend/paths/avatar_of_shadows_over_loathing";
import {
  is_pete,
  LM_pete,
  pete_buySkills,
  pete_initializeDay,
  pete_initializeSettings,
} from "./autoscend/paths/avatar_of_sneaky_pete";
import {
  awol_buySkills,
  awol_initializeSettings,
  awol_useStuff,
} from "./autoscend/paths/avatar_of_west_of_loathing";
import {
  bhy_initializeSettings,
  in_bhy,
  LM_bhy,
} from "./autoscend/paths/bees_hate_you";
import { bugbear_initializeSettings } from "./autoscend/paths/bugbear_invasion";
import {
  casualCheck,
  inAftercore,
  LM_canInteract,
} from "./autoscend/paths/casual";
import { in_community } from "./autoscend/paths/community_service";
import {
  bat_formNone,
  bat_initializeDay,
  bat_initializeSession,
  bat_initializeSettings,
  in_darkGyffte,
  LM_batpath,
} from "./autoscend/paths/dark_gyffte";
import { disguises_initializeSettings } from "./autoscend/paths/disguises_delimit";
import { fotd_initializeSettings } from "./autoscend/paths/fall_of_the_dinosaurs";
import {
  glover_initializeDay,
  glover_initializeSettings,
  in_glover,
  LM_glover,
} from "./autoscend/paths/g_lover";
import { LM_gnoob } from "./autoscend/paths/gelatinous_noob";
import { in_ggoo, LA_grey_goo_tasks } from "./autoscend/paths/grey_goo";
import { ht_equip_hats } from "./autoscend/paths/hattrick";
import {
  heavyrains_buySkills,
  heavyrains_initializeDay,
  heavyrains_initializeSettings,
  in_heavyrains,
} from "./autoscend/paths/heavy_rains";
import { iluh_buyEquiq } from "./autoscend/paths/i_love_u_hate";
import {
  in_koe,
  koe_acquire_rmi,
  koe_initializeSettings,
  koe_rmi_count,
} from "./autoscend/paths/kingdom_of_exploathing";
import { kolhs_initializeSettings, LM_kolhs } from "./autoscend/paths/kolhs";
import {
  auto_LegacyOfLoathingDailies,
  lol_buyReplicas,
  lol_initializeSettings,
} from "./autoscend/paths/legacy_of_loathing";
import {
  bond_initializeSettings,
  LM_bond,
} from "./autoscend/paths/license_to_adventure";
import {
  in_lar,
  lar_safeguard,
  LM_lar,
} from "./autoscend/paths/live_ascend_repeat";
import { lowkey_initializeSettings } from "./autoscend/paths/low_key_summer";
import {
  LM_nuclear,
  nuclear_initializeDay,
  nuclear_initializeSettings,
} from "./autoscend/paths/nuclear_autumn";
import { ocrs_postCombatResolve } from "./autoscend/paths/one_crazy_random_summer";
import {
  in_plumber,
  LM_plumber,
  plumber_canDealScalingDamage,
  plumber_equipTool$1,
  plumber_initializeSettings,
} from "./autoscend/paths/path_of_the_plumber";
import { picky_pulls } from "./autoscend/paths/picky";
import {
  in_pokefam,
  pokefam_getHats,
  pokefam_initializeSettings,
} from "./autoscend/paths/pocket_familiars";
import {
  auto_refreshQTFam,
  qt_initializeSettings,
} from "./autoscend/paths/quantum_terrarium";
import {
  auto_smallCampgroundGear,
  small_initializeSettings,
} from "./autoscend/paths/small";
import {
  in_theSource,
  LX_theSource,
  theSource_buySkills,
  theSource_initializeSettings,
  theSource_oracle,
} from "./autoscend/paths/the_source";
import { in_wotsf } from "./autoscend/paths/way_of_the_surprising_fist";
import {
  in_wereprof,
  is_werewolf,
  wereprof_initializeSettings,
} from "./autoscend/paths/wereprofessor";
import {
  in_wildfire,
  LA_wildfire,
  LX_wildfire_calculateTheUniverse,
  wildfire_initializeSettings,
} from "./autoscend/paths/wildfire";
import {
  in_robot,
  LA_robot,
  LM_robot,
  robot_initializeSettings,
} from "./autoscend/paths/you_robot";
import {
  LM_zombieSlayer,
  zombieSlayer_buySkills,
  zombieSlayer_initializeSettings,
} from "./autoscend/paths/zombie_slayer";
import { LX_zootoFight, zoo_graftFam } from "./autoscend/paths/zootomist";
import { tootGetMeat, tootOriole } from "./autoscend/quests/level_01";
import { L8_mountainManSummon } from "./autoscend/quests/level_08";
import { finishBuildingSmutOrcBridge } from "./autoscend/quests/level_09";
import { auto_warSide } from "./autoscend/quests/level_12";
import { beehiveConsider, ns_crowd3 } from "./autoscend/quests/level_13";
import {
  LX_dronesOut,
  LX_ForceNC,
  LX_handleIntroAdventures,
  useTonicDjinn,
} from "./autoscend/quests/level_any";
import { houseUpgrade } from "./autoscend/quests/optional";
import { callRegisteredTaskFunction } from "./autoscend/task_registry";
import { fileAsMap } from "./autoscend/utils/kolmafiaUtils";

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
  if (
    !reinitialize &&
    myAscensions() === toInt(getProperty("auto_doneInitialize"))
  ) {
    return; //already initialized settings this ascension
  }
  setLocation(Location.none);
  invalidateRestoreOptionCache();

  if (!reinitialize) {
    setProperty("auto_100familiar", Familiar.none.toString());
    if (myFamiliar() !== Familiar.none && pathAllowsChangingFamiliar()) {
      //If we can't control familiar changes, no point setting 100% familiar data
      const userAnswer: boolean = userConfirm(
        "Familiar already set, is this a 100% familiar run? Will default to 'No' in 15 seconds.",
        15000,
        false,
      );
      if (userAnswer) {
        setProperty("auto_100familiar", myFamiliar().toString());
      }
    }
    //check for a workshed
    if (getWorkshed() !== Item.none) {
      const userAnswer: boolean = userConfirm(
        "Workshed already set, do you want Autoscend to handle your workshed? Will default to 'Yes' in 15 seconds.",
        15000,
        true,
      );
      if (userAnswer) {
        setProperty("auto_workshed", "auto");
      } else {
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
  setProperty(
    "auto_getSteelOrgan",
    getProperty("auto_getSteelOrgan_initialize"),
  );
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

export function auto_advToReserve(): number {
  // Calculates how many adventures we should aim to keep in reserve
  // if auto_save_adv_override value is 0 or higher then use the override
  if (toInt(getProperty("auto_save_adv_override")) > -1) {
    return toInt(getProperty("auto_save_adv_override"));
  }
  // automatically calculate how many adv to reserve at end of day
  // free crafting require at least 1 adventure to do.
  // To enter free fights we need at least 1 adventure remaining. Dying costs an adventure, so we reserve 2 adventures so the user can manually complete the remaining fights even if we lose.
  // cocktailcrafting and pasta cooking require 2 adventures.

  let reserveadv: number = 1;

  if (auto_freeCombatsRemaining() > 0) {
    reserveadv = max(2, reserveadv);
  }

  if (auto_freeCrafts() < 2) {
    //smallest Pasta dish that takes 2 adv to craft is 3 fullness.
    //Pastamastery is required for all pasta and having it alone is enough to craft foods that take 2 adv to craft
    if (
      canEat() &&
      myFullness() + 3 <= fullnessLimit() &&
      auto_have_skill($skill`Pastamastery`)
    ) {
      reserveadv = max(2, reserveadv);
    }
    //Advanced Cocktailcrafting skill is enough to make drinks that cost 2 adv to craft
    //because of nightcap, there is no point in checking your inebrity limits.
    if (canDrink() && auto_have_skill($skill`Advanced Cocktailcrafting`)) {
      reserveadv = max(2, reserveadv);
    }
    //sneaky pete specific check. Mixologist lets you spend 2 adv on crafting. cocktail magic makes crafting free.
    if (
      auto_have_skill($skill`Mixologist`) &&
      !auto_have_skill($skill`Cocktail Magic`)
    ) {
      reserveadv = max(2, reserveadv);
    }
  }

  return reserveadv;
}

export function auto_unreservedAdvRemaining(): boolean {
  // should the main loop continue to run or not, based on how many adv we wish to reserve.
  if (myAdventures() > auto_advToReserve()) {
    return true;
  }
  return false;
}

export function LX_burnDelay(): boolean {
  let voteMonsterAvailable: boolean = auto_voteMonster$1(true);
  const digitizeMonsterNext: boolean = isOverdueDigitize();
  let sausageGoblinAvailable: boolean = auto_sausageGoblin();
  const backupTargetAvailable: boolean = auto_backupTarget();
  const voidMonsterAvailable: boolean = auto_voidMonster();
  const habitatingMonsters: boolean = auto_habitatMonster() !== Monster.none;
  // if we're a plumber and we're still stuck doing a flat 15 damage per attack
  // then a scaling monster is probably going to be a bad time
  if (in_plumber() && !plumber_canDealScalingDamage()) {
    // unless we can still kill it in one hit, then it should probably be fine?
    const predictedScalerHP: number = toInt(
      0.75 * (myBuffedstat($stat`Muscle`) + monsterLevelAdjustment()),
    );
    if (predictedScalerHP > 15) {
      auto_log_info$1(
        "Want to burn delay with scaling wanderers, but we can't deal scaling damage yet and it would be too strong :(",
      );
      voteMonsterAvailable = false;
      sausageGoblinAvailable = false;
      addToMaximize("-equip Kramco Sausage O-Matic");
      addToMaximize("-equip &quot;I Voted!&quot; sticker");
    }
  }
  // See the encounter priority flowcharts available at https://i.imgur.com/sdVH4SPh.jpg
  // and https://github.com/loathers/encounter/blob/main/heirarchy.mermaid if adding handling for more stuff

  if (voteMonsterAvailable && !backupTargetAvailable) {
    // Voting monsters are inherently free (the ones we fight anyway).
    // don't fight them if we're going to backup because they will overwrite the monster we want to backup
    const voterZone: Location = solveDelayZone(
      toInt(getProperty("breathitinCharges")) > 0,
    );
    if (voterZone !== Location.none) {
      auto_log_info(
        `Fighting a free ${getProperty("_voteMonster")} in ${voterZone.toString()} to burn delay!`,
        "green",
      );
      setProperty("auto_nextEncounter", getProperty("_voteMonster"));
      if (auto_voteMonster$2(true, voterZone)) {
        return true;
      }
      setProperty("auto_nextEncounter", "");
    }
  }

  if (digitizeMonsterNext) {
    // Digitize Wanderers will happen regardless so prioritize handling them.
    // hopefully they don't overwrite something we want to backup.
    let digitizeZone: Location = solveDelayZone(
      isFreeMonster(toMonster(getProperty("_sourceTerminalDigitizeMonster"))) &&
        toInt(getProperty("breathitinCharges")) > 0,
    );
    if (digitizeZone === Location.none) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      digitizeZone = $location`Noob Cave`;
    }
    auto_log_info(
      `Fighting a ${getProperty("_sourceTerminalDigitizeMonster")} in ${digitizeZone.toString()} to burn delay!`,
      "green",
    );
    setProperty(
      "auto_nextEncounter",
      getProperty("_sourceTerminalDigitizeMonster"),
    );
    if (autoAdv(digitizeZone)) {
      return true;
    }
    setProperty("auto_nextEncounter", "");
  }

  if (backupTargetAvailable) {
    const skipOutdoorZones: boolean =
      isFreeMonster(toMonster(getProperty("lastCopyableMonster"))) &&
      toInt(getProperty("breathitinCharges")) > 0;
    let backupZone: Location = solveDelayZone(skipOutdoorZones);
    if (backupZone === Location.none && skipOutdoorZones && !in_koe()) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      backupZone = $location`Noob Cave`;
    }

    auto_log_info(
      `Fighting a ${getProperty("lastCopyableMonster")} in ${backupZone.toString()} to burn delay!`,
      "green",
    );
    if (auto_backupToYourLastEnemy(backupZone)) {
      return true;
    }
  }

  if (sausageGoblinAvailable) {
    // Sausage Goblins are inherently free
    const goblinZone: Location = solveDelayZone(
      toInt(getProperty("breathitinCharges")) > 0,
    );
    if (goblinZone !== Location.none) {
      auto_log_info(
        `Fighting a Sausage Goblin in ${goblinZone.toString()} to burn delay!`,
        "green",
      );
      if (auto_sausageGoblin(goblinZone)) {
        return true;
      }
    }
  }

  if (voidMonsterAvailable) {
    // Void monsters are inherently free (the ones we fight anyway).
    const voidZone: Location = solveDelayZone(
      toInt(getProperty("breathitinCharges")) > 0,
    );
    if (voidZone !== Location.none) {
      auto_log_info(
        `Fighting a Void monster in ${voidZone.toString()} to burn delay!`,
        "green",
      );
      if (auto_voidMonster$1(voidZone)) {
        return true;
      }
    }
  }

  if (habitatingMonsters) {
    const habitatZone: Location = solveDelayZone(
      isFreeMonster(auto_habitatMonster()) &&
        toInt(getProperty("breathitinCharges")) > 0,
    );
    if (habitatZone !== Location.none) {
      auto_log_info(
        `Might be fighting a ${auto_habitatMonster()} in ${habitatZone.toString()} to burn delay!`,
        "green",
      );
      if (autoAdv(habitatZone)) {
        return true;
      }
    }
  }

  if (voteMonsterAvailable) {
    auto_log_warning(
      "Had overdue voting monster but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (digitizeMonsterNext) {
    auto_log_warning(
      "Had overdue digitize but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (sausageGoblinAvailable) {
    auto_log_warning(
      "Had overdue sausage but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (voidMonsterAvailable) {
    auto_log_warning(
      "Cursed Magnifying Glass's void monster is next but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (habitatingMonsters) {
    auto_log_warning(
      "Habitating a monster but couldn't find a zone to burn delay",
      "red",
    );
  }
  return false;
}

export function LX_calculateTheUniverse(speculative: boolean): boolean {
  if (in_wildfire()) {
    return LX_wildfire_calculateTheUniverse();
  }
  if (myMp() < mpCost($skill`Calculate the Universe`)) {
    return false;
  }
  if (
    toInt(getProperty("_universeCalculated")) >=
    min(3, toInt(getProperty("skillLevel144")))
  ) {
    return false;
  }
  //do we want to summon a [War Frat 151st Infantryman] for the frat warrior outfit?
  if (
    !possessOutfit$1("Frat Warrior Fatigues") &&
    auto_warSide() === "fratboy"
  ) {
    if (
      doNumberology("battlefield", false) !== -1 &&
      adjustForYellowRayIfPossible($monster`War Frat 151st Infantryman`)
    ) {
      if (speculative) {
        return true;
      } else {
        return doNumberology("battlefield") !== -1;
      }
    }
    return false; //we want 151 and can get it in general. but not right now. so save it for later
  }

  doNumberology("adventures3");
  return false; //we do not want to restart the loop as all we're doing is generating 3 adventures
}

function tophatMaker(): boolean {
  if (
    !knollAvailable() ||
    itemAmount($item`brass gear`) === 0 ||
    possessEquipment($item`Mark V Steam-Hat`)
  ) {
    return false;
  }
  let reEquip: Item = Item.none;

  if (possessEquipment($item`Mark IV Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark IV Steam-Hat`) {
      reEquip = $item`Mark V Steam-Hat`;
      equip($slot`hat`, Item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark IV Steam-Hat`);
  } else if (possessEquipment($item`Mark III Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark III Steam-Hat`) {
      reEquip = $item`Mark IV Steam-Hat`;
      equip($slot`hat`, Item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark III Steam-Hat`);
  } else if (possessEquipment($item`Mark II Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark II Steam-Hat`) {
      reEquip = $item`Mark III Steam-Hat`;
      equip($slot`hat`, Item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark II Steam-Hat`);
  } else if (possessEquipment($item`Mark I Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark I Steam-Hat`) {
      reEquip = $item`Mark II Steam-Hat`;
      equip($slot`hat`, Item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark I Steam-Hat`);
  } else if (possessEquipment($item`brown felt tophat`)) {
    if (equippedItem($slot`hat`) === $item`brown felt tophat`) {
      reEquip = $item`Mark I Steam-Hat`;
      equip($slot`hat`, Item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`brown felt tophat`);
  } else {
    return false;
  }

  auto_log_info("Mark Steam-Hat upgraded!", "blue");
  if (reEquip !== Item.none) {
    equip($slot`hat`, reEquip);
  }
  return true;
}

export function LX_doVacation(): boolean {
  if (in_koe() || is_werewolf()) {
    return false; //cannot vacation in kingdom of exploathing path or are a werewolf in wereprofessor
  }

  let meat_needed: number = 500;
  let adv_needed: number = 3;
  const adv_budget: number = myAdventures() - auto_advToReserve();
  if (in_wotsf()) {
    meat_needed = 5;
    adv_needed = 5;
  }
  if (adv_needed > adv_budget) {
    auto_log_info(
      "I want to vacation but I do not have enough adventures left",
      "red",
    );
    return false;
  }
  if (meat_needed > myMeat()) {
    auto_log_info("I want to vacation but I do not have enough meat", "red");
    return false;
  }
  if (in_plumber()) {
    //avoid error for not having plumber gear equipped.
    plumber_equipTool$1($stat`Moxie`);
    equipMaximizedGear();
  }

  return autoAdv($location`The Shore, Inc. Travel Agency`);
}

export function auto_doTempleSummit(): boolean {
  if (!hiddenTempleUnlocked()) {
    return false;
  }
  if (availableAmount($item`stone wool`) === 0) {
    return false;
  }
  if (toInt(getProperty("lastTempleAdventures")) >= myAscensions()) {
    return false;
  }
  if (auto_haveMayamCalendar() && !auto_MayamAllUsed()) {
    auto_log_info$1(
      "Not getting temple summit adventures since our Mayam calendar isn't spent.",
    );
    return false;
  }
  buffMaintain$4($effect`Stone-Faced`);
  if (haveEffect($effect`Stone-Faced`) === 0) {
    return false;
  }
  return autoAdv($location`The Hidden Temple`);
}

function initializeDay(day: number): void {
  if (inAftercore()) {
    return;
  }

  invalidateRestoreOptionCache();

  if (toBoolean(getProperty("auto_pvpEnable")) && !hippyStoneBroken()) {
    visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
    visitUrl("peevpee.php?place=fight");
  }

  if (toInt(getProperty("auto_day_init")) < day) {
    setProperty("auto_powerLevelLastLevel", "0");
    setProperty("auto_delayLastLevel", "0");
    setProperty("auto_cmcConsultLastLevel", "0");
    setProperty("auto_breathitinLastLevel", "0");
    setProperty("_auto_candyMapCompleted", false.toString());
  }

  if (
    !possessEquipment($item`your cowboy boots`) &&
    toBoolean(getProperty("telegraphOfficeAvailable")) &&
    isUnrestricted($item`LT&T telegraph office deed`)
  ) {
    //string temp = visit_url("desc_item.php?whichitem=529185925");
    //if(equipped_item($slot[bootspur])===$item[Nicksilver spurs])
    //if(contains_text(temp, "Item Drops from Monsters"))
    //{
    visitUrl("place.php?whichplace=town_right&action=townright_ltt");
    //}
  }

  if (auto_is_valid($item`Fourth of May Cosplay Saber`)) {
    auto_saberDailyUpgrade(day);
  }

  if (
    itemAmount($item`cursed microwave`) >= 1 &&
    !toBoolean(getProperty("_cursedMicrowaveUsed"))
  ) {
    use(1, $item`cursed microwave`);
  }
  if (
    itemAmount($item`cursed pony keg`) >= 1 &&
    !toBoolean(getProperty("_cursedKegUsed"))
  ) {
    use(1, $item`cursed pony keg`);
  }
  if (storageAmount($item`talking spade`) > 0) {
    pullXWhenHaveY($item`talking spade`, 1, 0);
  }

  if (itemAmount($item`telegram from Lady Spookyraven`) > 0) {
    auto_log_warning(
      "Lady Spookyraven quest not detected as started should have been auto-started. Starting it. If you are not in an Ed run, report this. Otherwise, it is expected.",
      "red",
    );
    use(1, $item`telegram from Lady Spookyraven`);
    setProperty("questM20Necklace", "started");
  }

  if (internalQuestStatus("questM20Necklace") === -1) {
    if (itemAmount($item`telegram from Lady Spookyraven`) > 0) {
      auto_log_warning(
        "Lady Spookyraven quest not started and we have a Telegram so let us use it.",
        "red",
      );
      use(1, $item`telegram from Lady Spookyraven`);
    } else {
      auto_log_warning(
        "Lady Spookyraven quest not detected as started but we don't have the telegram, assuming it is... If you are not in an Ed run, report this. Otherwise, it is expected.",
        "red",
      );
      setProperty("questM20Necklace", "started");
    }
  }

  auto_barrelPrayers();

  if (
    !toBoolean(getProperty("_pottedTeaTreeUsed")) &&
    auto_get_campground().has($item`potted tea tree`) &&
    !inAftercore()
  ) {
    if (getProperty("auto_teaChoice") !== "") {
      const teaChoice: Map<number, string> = new Map(
        splitString(getProperty("auto_teaChoice"), ";").map((_v, _i) => [
          _i,
          _v,
        ]),
      );
      const myTea: string = trim(
        teaChoice.get(min(teaChoice.size, myDaycount()) - 1) ??
          teaChoice
            .set(min(teaChoice.size, myDaycount()) - 1, "")
            .get(min(teaChoice.size, myDaycount()) - 1),
      );
      if (toItem(myTea) !== Item.none || myTea === "shake") {
        cliExecute(`teatree ${myTea}`);
      }
    } else if (day === 1 && auto_is_valid($item`potted tea tree`)) {
      if (fullnessLimit() > 0) {
        cliExecute(`teatree ${$item`cuppa Voraci tea`}`);
      } else if (inebrietyLimit() > 0) {
        cliExecute(`teatree ${$item`cuppa Sobrie tea`}`);
      } else {
        cliExecute(`teatree ${$item`cuppa Royal tea`}`);
      }
    } else if (day === 2 && auto_is_valid($item`potted tea tree`)) {
      if (inebrietyLimit() > 0) {
        cliExecute(`teatree ${$item`cuppa Sobrie tea`}`);
      } else if (fullnessLimit() > 0) {
        cliExecute(`teatree ${$item`cuppa Voraci tea`}`);
      } else {
        cliExecute(`teatree ${$item`cuppa Royal tea`}`);
      }
    } else {
      visitUrl("campground.php?action=teatree");
      runChoice(1);
    }
  }

  auto_floundryAction();

  auto_MayamClaimAll(); // Want Mayam before booth to decide if we want a feather boa given yamtility.
  auto_getClanPhotoBoothDefaultItems();
  auto_getClanPhotoBoothEffect("space", 3);

  auto_initBurningLeaves();

  if (
    itemAmount($item`GameInformPowerDailyPro magazine`) > 0 &&
    myDaycount() === 1
  ) {
    visitUrl("inv_use.php?pwd=&which=3&whichitem=6174", true);
    visitUrl("inv_use.php?pwd=&which=3&whichitem=6174&confirm=Yep.", true);
    setProperty("auto_disableAdventureHandling", true.toString());
    autoAdv($location`[DungeonFAQ - Level 1]`);
    setProperty("auto_disableAdventureHandling", false.toString());
    if (itemAmount($item`dungeoneering kit`) > 0) {
      use(1, $item`dungeoneering kit`);
    }
  }

  auto_doPrecinct();
  if (
    !(in_koe() || in_lar()) &&
    itemAmount($item`cop dollar`) >= 10 &&
    itemAmount($item`shoe gum`) === 0
  ) {
    cliExecute("make shoe gum");
  }
  //a free to cast intrinsic that makes swords count as clubs. there is no reason to ever have it on if not a seal clubber?
  //regardless of class there is a reason not to if auto_configureRetrocape("vampire", "kill") can be used. it needs the sword to count as a sword and not as a club
  if (
    myClass() === $class`Seal Clubber` &&
    auto_have_skill($skill`Iron Palm Technique`) &&
    haveEffect($effect`Iron Palms`) === 0
  ) {
    useSkill(1, $skill`Iron Palm Technique`);
  }
  // Get emotionally chipped if you have the item.  boris\jarlsberg\sneaky pete\zombie slayer\ed cannot use this skill so excluding.
  if (
    !haveSkill($skill`Emotionally Chipped`) &&
    itemAmount($item`spinal-fluid-covered emotion chip`) > 0 &&
    can_read_skillbook($item`spinal-fluid-covered emotion chip`)
  ) {
    use(1, $item`spinal-fluid-covered emotion chip`);
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
  if (!inHardcore() && toInt(getProperty("auto_day_init")) < day) {
    auto_log_info$1("Bulk caching mall prices for consumables");
    if (getProperty("auto_last_mallcached") !== todayToString()) {
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

  if (day === 1) {
    if (toInt(getProperty("auto_day_init")) < 1) {
      auto_sourceTerminalEducate($skill`Extract`, $skill`Digitize`);
      if (
        containsText(
          getProperty("sourceTerminalEnquiryKnown"),
          "monsters.enq",
        ) &&
        in_pokefam()
      ) {
        auto_sourceTerminalRequest("enquiry monsters.enq");
      } else if (
        containsText(
          getProperty("sourceTerminalEnquiryKnown"),
          "familiar.enq",
        ) &&
        pathHasFamiliar()
      ) {
        auto_sourceTerminalRequest("enquiry familiar.enq");
      } else if (
        containsText(getProperty("sourceTerminalEnquiryKnown"), "stats.enq")
      ) {
        auto_sourceTerminalRequest("enquiry stats.enq");
      } else if (
        containsText(getProperty("sourceTerminalEnquiryKnown"), "protect.enq")
      ) {
        auto_sourceTerminalRequest("enquiry protect.enq");
      }

      kgbSetup();
      if (itemAmount($item`transmission from planet Xi`) > 0) {
        use(1, $item`transmission from planet Xi`);
      }
      if (itemAmount($item`Xiblaxian holo-wrist-puter simcode`) > 0) {
        use(1, $item`Xiblaxian holo-wrist-puter simcode`);
      }
      if (
        itemAmount($item`baby bodyguard`) > 0 &&
        !haveFamiliar($familiar`Burly Bodyguard`)
      ) {
        //will only happen in Avant Guard
        use(1, $item`baby bodyguard`);
      }

      if (
        auto_get_clan_lounge().has($item`Clan Floundry`) &&
        itemAmount($item`fishin' pole`) === 0
      ) {
        visitUrl("clan_viplounge.php?action=floundry");
      }

      tootGetMeat();

      heavyrains_initializeDay(day);
      // It's nice to have a moxie weapon for Flock of Bats form
      if (
        in_darkGyffte() &&
        toInt(getProperty("darkGyfftePoints")) < 21 &&
        !possessEquipment($item`disco ball`)
      ) {
        acquireGumItem($item`disco ball`);
      }
      if (auto_needAccordion()) {
        if (
          itemAmount($item`antique accordion`) === 0 &&
          itemAmount($item`aerogel accordion`) === 0 &&
          auto_predictAccordionTurns() < 5 &&
          myMeat() > npcPrice($item`toy accordion`) &&
          npcPrice($item`toy accordion`) !== 0
        ) {
          //Try to get Antique Accordion early if we possibly can.
          if (
            isUnclePAvailable() &&
            myMeat() > npcPrice($item`antique accordion`) &&
            npcPrice($item`antique accordion`) !== 0 &&
            !in_glover()
          ) {
            auto_buyUpTo(1, $item`antique accordion`);
          }
          // Removed "else". In some situations when mafia or supporting scripts are behaving wonky we may completely fail to get an accordion
          if (
            isArmoryAvailable() &&
            itemAmount($item`antique accordion`) === 0
          ) {
            auto_buyUpTo(1, $item`toy accordion`);
          }
        }
        if (
          in_koe() &&
          itemAmount($item`antique accordion`) === 0 &&
          koe_rmi_count() >= 10
        ) {
          koe_acquire_rmi(10);
          buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`antique accordion`);
        }
        acquireTotem();
        if (!possessEquipment($item`saucepan`)) {
          acquireGumItem($item`saucepan`);
        }
      }

      makeStartingSmiths();

      equipBaseline();

      handleBjornify(Familiar.none);
      handleBjornify($familiar`El Vibrato Megadrone`);

      visitUrl("guild.php?place=challenge");

      auto_beachCombHead("exp");
    }

    if (toInt(getProperty("lastCouncilVisit")) < myLevel()) {
      cliExecute("counters");
      council();
    }
    // If we have the shortest order cook, loop familiars that will benefit from that.
    if (pathHasFamiliar() && pathAllowsChangingFamiliar()) {
      const init_fam: Familiar = myFamiliar();
      if (haveFamiliar($familiar`Shorter-Order Cook`)) {
        for (const fam of $familiars`Ghost of Crimbo Carols, Ghost of Crimbo Commerce, Ghost of Crimbo Cheer`) {
          if (haveFamiliar(fam) && !in_bhy()) {
            useFamiliar(fam);
          }
        }
        for (const fam of $familiars`Chest Mimic, Cooler Yeti`) {
          if (haveFamiliar(fam)) {
            useFamiliar(fam);
          }
        }
      }
      useFamiliar(init_fam);
    }
  } else if (day === 2) {
    //day1
    equipBaseline();

    if (toInt(getProperty("auto_day_init")) < 2) {
      useTonicDjinn();

      if (itemAmount($item`gym membership card`) > 0) {
        equipStatgainIncreasers$2();
        use(1, $item`gym membership card`);
      }

      heavyrains_initializeDay(day);

      if (!inHardcore() && itemAmount($item`handful of Smithereens`) <= 5) {
        pulverizeThing($item`Hairpiece On Fire`);
        pulverizeThing($item`Vicar's Tutu`);
      }
      while (acquireHermitItem($item`11-leaf clover`)) {}
      if (
        itemAmount($item`antique accordion`) === 0 &&
        itemAmount($item`aerogel accordion`) === 0 &&
        isUnclePAvailable() &&
        myMeat() > npcPrice($item`antique accordion`) &&
        npcPrice($item`antique accordion`) !== 0 &&
        auto_predictAccordionTurns() < 10 &&
        !(
          is_boris() ||
          is_jarlsberg() ||
          is_pete() ||
          isActuallyEd() ||
          in_darkGyffte() ||
          in_plumber() ||
          !in_glover()
        )
      ) {
        auto_buyUpTo(1, $item`antique accordion`);
      }
      if (is_boris()) {
        if (
          itemAmount($item`Clancy's crumhorn`) === 0 &&
          minstrelInstrument() !== $item`Clancy's crumhorn`
        ) {
          auto_buyUpTo(1, $item`Clancy's crumhorn`);
        }
      }
      if (
        auto_have_skill($skill`Summon Smithsness`) &&
        myMp() > 3 * mpCost($skill`Summon Smithsness`)
      ) {
        useSkill(3, $skill`Summon Smithsness`);
      }

      if (itemAmount($item`handful of Smithereens`) >= 2) {
        auto_buyUpTo(2, $item`Ben-Gal™ Balm`);
        cliExecute("make 2 louder than bomb");
      }
    }
    if (chateaumantegna_havePainting() && !isActuallyEd()) {
      if (auto_have_familiar($familiar`Reanimated Reanimator`)) {
        handleFamiliar$1($familiar`Reanimated Reanimator`);
      }
      chateaumantegna_usePainting();
      handleFamiliar$1($familiar`Angry Jung Man`);
    }
  } else if (day === 3) {
    if (toInt(getProperty("auto_day_init")) < 3) {
      while (acquireHermitItem($item`11-leaf clover`)) {}

      picky_pulls();
    }
  } else if (day === 4) {
    if (toInt(getProperty("auto_day_init")) < 4) {
      while (acquireHermitItem($item`11-leaf clover`)) {}
    }
  }
  if (day >= 2) {
    ovenHandle();
  }

  const campground: string = visitUrl("campground.php");
  if (
    containsText(campground, "beergarden7.gif") &&
    isUnrestricted($item`packet of beer seeds`)
  ) {
    cliExecute("garden pick");
  }
  if (
    containsText(campground, "wintergarden3.gif") &&
    isUnrestricted($item`packet of winter seeds`)
  ) {
    cliExecute("garden pick");
  }
  if (
    containsText(campground, "thanksgardenmega.gif") &&
    isUnrestricted($item`packet of thanksgarden seeds`)
  ) {
    cliExecute("garden pick");
  }

  setProperty("auto_forceNonCombatSource", "");

  setProperty("auto_day_init", day.toString());
}

export function dailyEvents(): boolean {
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

  if (
    itemAmount($item`burned government manual fragment`) > 0 &&
    isUnrestricted($item`burned government manual fragment`) &&
    toBoolean(getProperty("auto_alienLanguage"))
  ) {
    use(
      itemAmount($item`burned government manual fragment`),
      $item`burned government manual fragment`,
    );
  }

  if (
    itemAmount($item`glass gnoll eye`) > 0 &&
    !toBoolean(getProperty("_gnollEyeUsed"))
  ) {
    use(1, $item`glass gnoll eye`);
  }
  if (
    itemAmount($item`Chroner trigger`) > 0 &&
    !toBoolean(getProperty("_chronerTriggerUsed"))
  ) {
    use(1, $item`Chroner trigger`);
  }
  if (
    itemAmount($item`Chroner cross`) > 0 &&
    !toBoolean(getProperty("_chronerCrossUsed"))
  ) {
    use(1, $item`Chroner cross`);
  }
  if (
    itemAmount($item`Chester's bag of candy`) > 0 &&
    !toBoolean(getProperty("_bagOfCandyUsed"))
  ) {
    use(1, $item`Chester's bag of candy`);
  }
  if (
    itemAmount($item`cheap toaster`) > 0 &&
    !toBoolean(getProperty("_toastSummoned"))
  ) {
    use(1, $item`cheap toaster`);
  }
  if (
    itemAmount($item`warbear breakfast machine`) > 0 &&
    !toBoolean(getProperty("_warbearBreakfastMachineUsed"))
  ) {
    use(1, $item`warbear breakfast machine`);
  }
  if (
    itemAmount($item`warbear soda machine`) > 0 &&
    !toBoolean(getProperty("_warbearSodaMachineUsed"))
  ) {
    use(1, $item`warbear soda machine`);
  }
  if (
    itemAmount($item`The Cocktail Shaker`) > 0 &&
    !toBoolean(getProperty("_cocktailShakerUsed"))
  ) {
    use(1, $item`The Cocktail Shaker`);
  }
  if (
    itemAmount($item`Taco Dan's Taco Stand Flier`) > 0 &&
    !toBoolean(getProperty("_tacoFlierUsed"))
  ) {
    use(1, $item`Taco Dan's Taco Stand Flier`);
  }
  if (
    itemAmount($item`festive warbear bank`) > 0 &&
    !toBoolean(getProperty("_warbearBankUsed"))
  ) {
    use(1, $item`festive warbear bank`);
  }

  if (
    itemAmount($item`etched hourglass`) > 0 &&
    !toBoolean(getProperty("_etchedHourglassUsed"))
  ) {
    use(1, $item`etched hourglass`);
  }

  if (
    itemAmount($item`can of Rain-Doh`) > 0 &&
    itemAmount($item`Rain-Doh red wings`) === 0
  ) {
    use(1, $item`can of Rain-Doh`);
    putCloset(1, $item`empty Rain-Doh can`);
  }

  if (itemAmount($item`Clan VIP Lounge key`) > 0) {
    const furn: Map<Item, number> = auto_get_clan_lounge();
    if (
      furn.has($item`Olympic-sized Clan crate`) &&
      !toBoolean(getProperty("_olympicSwimmingPoolItemFound")) &&
      isUnrestricted($item`Olympic-sized Clan crate`)
    ) {
      cliExecute("swim item");
    }
    if (
      furn.has($item`Clan looking glass`) &&
      !toBoolean(getProperty("_lookingGlass")) &&
      isUnrestricted($item`Clan looking glass`)
    ) {
      visitUrl("clan_viplounge.php?action=lookingglass");
    }
    if (toInt(getProperty("_deluxeKlawSummons")) === 0) {
      cliExecute("clan_viplounge.php?action=klaw");
      cliExecute("clan_viplounge.php?action=klaw");
      cliExecute("clan_viplounge.php?action=klaw");
    }
    if (
      furn.has($item`Crimbough`) &&
      (furn.get($item`Crimbough`) ??
        furn.set($item`Crimbough`, 0).get($item`Crimbough`)) === 5 &&
      !toBoolean(getProperty("_crimboTree")) &&
      isUnrestricted($item`Crimbough`)
    ) {
      cliExecute("crimbotree get");
    }
  }

  if (
    toInt(getProperty("_klawSummons")) === 0 &&
    'Mr. Klaw "Skill" Crane Game' in getClanRumpus()
  ) {
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
  }

  if (
    itemAmount($item`infinite BACON machine`) > 0 &&
    !toBoolean(getProperty("_baconMachineUsed"))
  ) {
    use(1, $item`infinite BACON machine`);
  }
  if (
    itemAmount($item`picky tweezers`) > 0 &&
    !toBoolean(getProperty("_pickyTweezersUsed"))
  ) {
    use(1, $item`picky tweezers`);
  }

  if (
    haveSkill($skill`That's Not a Knife`) &&
    !toBoolean(getProperty("_discoKnife"))
  ) {
    for (const it of $items`boot knife, broken beer bottle, candy knife, sharpened spoon, soap knife`) {
      if (itemAmount(it) === 1) {
        putCloset(1, it);
      }
    }
    useSkill(1, $skill`That's Not a Knife`);
  }

  while (zataraClanmate()) {}

  if (
    itemAmount($item`genie bottle`) > 0 &&
    auto_is_valid($item`genie bottle`) &&
    auto_is_valid($item`pocket wish`) &&
    !in_glover()
  ) {
    //if bottle is valid and pocket wishes are not (such as in glover) then we should save the wishes for use and only convert leftovers into pocket wishes at bedtime
    for (let i: number = toInt(getProperty("_genieWishesUsed")); i < 3; i++) {
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

export function Lsc_flyerSeals(): boolean {
  if (myClass() !== $class`Seal Clubber`) {
    return false;
  }
  if (toBoolean(getProperty("auto_ignoreFlyer"))) {
    return false;
  }
  // although seals can be fought drunk, it complicates code without serving a purpose
  if (myInebriety() > inebrietyLimit()) {
    return false;
  }
  if (internalQuestStatus("questL12War") !== 1) {
    return false;
  }
  if (toInt(getProperty("flyeredML")) >= 10000) {
    return false;
  }
  if (
    itemAmount($item`rock band flyers`) === 0 &&
    itemAmount($item`jam band flyers`) === 0
  ) {
    return false;
  }
  if (toInt(getProperty("choiceAdventure1003")) >= 3) {
    return false;
  }

  if (
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    myMeat() > 500
  ) {
    const towerTest: Element = ns_crowd3();
    let doElement: boolean = false;
    if (itemAmount($item`powdered sealbone`) > 0) {
      if (
        towerTest === $element`cold` &&
        itemAmount($item`frost-rimed seal hide`) < 2 &&
        itemAmount($item`figurine of a cold seal`) > 0
      ) {
        doElement = true;
      }
      if (
        towerTest === $element`hot` &&
        itemAmount($item`sizzling seal fat`) < 2 &&
        itemAmount($item`figurine of a charred seal`) > 0
      ) {
        doElement = true;
      }
      if (
        towerTest === $element`sleaze` &&
        itemAmount($item`seal lube`) < 2 &&
        itemAmount($item`figurine of a slippery seal`) > 0
      ) {
        doElement = true;
      }
      if (
        towerTest === $element`spooky` &&
        itemAmount($item`scrap of shadow`) < 2 &&
        itemAmount($item`figurine of a shadowy seal`) > 0
      ) {
        doElement = true;
      }
      if (
        towerTest === $element`stench` &&
        itemAmount($item`fustulent seal grulch`) < 2 &&
        itemAmount($item`figurine of a stinking seal`) > 0
      ) {
        doElement = true;
      }
    }

    let clubbedSeal: boolean = false;
    if (doElement) {
      if (
        itemAmount($item`imbued seal-blubber candle`) === 0 &&
        guildStoreAvailable()
      ) {
        auto_buyUpTo(1, $item`seal-blubber candle`);
        cliExecute("make imbued seal-blubber candle");
      }
      if (itemAmount($item`imbued seal-blubber candle`) > 0) {
        ensureSealClubs();
        handleSealElement(towerTest);
        clubbedSeal = true;
      }
    } else if (guildStoreAvailable() && isHermitAvailable()) {
      auto_buyUpTo(1, $item`figurine of an armored seal`);
      auto_buyUpTo(10, $item`seal-blubber candle`);
      if (
        itemAmount($item`figurine of an armored seal`) > 0 &&
        itemAmount($item`seal-blubber candle`) >= 10
      ) {
        handleSealNormal($item`figurine of an armored seal`);
        clubbedSeal = true;
      }
    }
    if (
      itemAmount($item`bad-ass club`) === 0 &&
      itemAmount($item`ingot of seal-iron`) > 0 &&
      haveSkill($skill`Super-Advanced Meatsmithing`)
    ) {
      if (
        itemAmount($item`tenderizing hammer`) === 0 &&
        myMeat() >= npcPrice($item`tenderizing hammer`) * 2 &&
        npcPrice($item`tenderizing hammer`) !== 0
      ) {
        auto_buyUpTo(1, $item`tenderizing hammer`);
      }
      if (itemAmount($item`tenderizing hammer`) > 0) {
        use(1, $item`ingot of seal-iron`);
      }
    }
    return clubbedSeal;
  }
  return false;
}

function councilMaintenance(): boolean {
  if (in_koe()) {
    return false;
  }
  if (myLevel() > toInt(getProperty("lastCouncilVisit"))) {
    council();
    if (
      isActuallyEd() &&
      myLevel() === 11 &&
      itemAmount($item`[7961]Staff of Ed`) > 0
    ) {
      cliExecute("refresh inv");
    }
    return true;
  }
  return false;
}

function adventureFailureHandler(): boolean {
  const place: Location = myLocation();
  const limit: number = in_avantGuard() ? 100 : 50;
  if (place.turnsSpent > limit) {
    let tooManyAdventures: boolean = true;
    //general override function
    if (
      Location.get([
        //Many places do not have a proper ID which makes them indistinguishable from noob cave
        "Noob Cave",
        //quest locations where you spend lots of adventures and can not over adventure either
        "The Battlefield (Frat Uniform)",
        "The Battlefield (Hippy Uniform)",
        //kingdom of exploathing specific location for the hippy-frat war
        "The Exploaded Battlefield",
        //IOTM zones only used to powerlevel
        "The Deep Dark Jungle",
        "The Neverending Party",
        "Pirates of the Garbage Barges",
        "The Secret Government Laboratory",
        "Sloppy Seconds Diner",
        "The SMOOCH Army HQ",
        "Super Villain's Lair",
        "Uncle Gator's Country Fun-Time Liquid Waste Sluice",
        "VYKEA",
        "The X-32-F Combat Training Snowman",
        //in KOLHS path you must spend 40 adv per day split between those locations. zones only exist in kolhs
        "The Hallowed Halls",
        "Art Class",
        "Chemistry Class",
        "Shop Class",
        //holiday events
        "The Arrrboretum",
        "The Spectral Pickle Factory",
      ]).includes(place)
    ) {
      tooManyAdventures = false;
    }

    if (tooManyAdventures && in_theSource()) {
      if (
        $locations`The Haunted Ballroom, The Haunted Bathroom, The Haunted Bedroom, The Haunted Gallery`.includes(
          place,
        )
      ) {
        tooManyAdventures = false;
      }
    }

    if (tooManyAdventures && isActuallyEd()) {
      if ($location`The Hippy Camp` === place) {
        tooManyAdventures = false;
      }
    }

    if (tooManyAdventures && in_bhy()) {
      if ($locations`A-Boo Peak, Twin Peak`.includes(place)) {
        //bees prevent doing these quickly
        tooManyAdventures = false;
      }
    }

    if (tooManyAdventures && in_glover()) {
      if (
        $locations`The Penultimate Fantasy Airship, The Smut Orc Logging Camp, The Hidden Temple`.includes(
          place,
        )
      ) {
        tooManyAdventures = false;
      }
    }

    if (tooManyAdventures && in_robot()) {
      if (
        $locations`The Penultimate Fantasy Airship, The Smut Orc Logging Camp, The Haunted Bedroom, The Haunted Billiards Room`.includes(
          place,
        )
      ) {
        tooManyAdventures = false;
      }
    }

    if (
      $locations`The Haunted Gallery`.includes(place) &&
      place.turnsSpent < 100
    ) {
      tooManyAdventures = false;
    }

    if (
      $locations`The Daily Dungeon`.includes(place) &&
      toBoolean(getProperty("auto_forceFatLootToken"))
    ) {
      tooManyAdventures = false;
    }

    const can_powerlevel_stench: boolean =
      elementalPlanes_access($element`stench`) &&
      auto_have_skill($skill`Summon Smithsness`) &&
      toInt(getProperty("auto_beatenUpCount")) === 0;
    const has_powerlevel_iotm: boolean =
      can_powerlevel_stench ||
      elementalPlanes_access($element`spooky`) ||
      elementalPlanes_access($element`cold`) ||
      elementalPlanes_access($element`sleaze`) ||
      elementalPlanes_access($element`hot`) ||
      neverendingPartyAvailable();
    if (
      !has_powerlevel_iotm &&
      $locations`The Haunted Gallery, The Haunted Bedroom`.includes(place)
    ) {
      tooManyAdventures = false; //if we do not have iotm powerlevel zones then we are forced to use haunted gallery or bedroom
    }

    if (mySessionAdv() < toInt(getProperty("_auto_override_tooManyAdv"))) {
      tooManyAdventures = false; //currently in override for too many adv
    }

    if (tooManyAdventures) {
      if (toBoolean(getProperty("auto_newbieOverride"))) {
        setProperty("auto_newbieOverride", false.toString());
        setProperty(
          "_auto_override_tooManyAdv",
          (mySessionAdv() + 5).toString(),
        ); //override 5 adv at a time
        auto_log_warning(
          `We have spent ${place.turnsSpent} turns at '${place}' and that is bad... override accepted.`,
          "red",
        );
      } else {
        print(
          "You can bypass this once by executing the gCLI command:",
          "blue",
        );
        print("set auto_newbieOverride = true", "blue");
        abort(
          `We have spent ${place.turnsSpent} turns at '${place}' and that is bad... aborting.`,
        );
      }
    }
  }

  if (
    lastMonster() === $monster`crate` &&
    getProperty("screechDelay") !== "" &&
    in_wereprof() &&
    !($location`Noob Cave`.turnsSpent < 8)
  ) {
    //want 7 turns of Noob Cave in Wereprof for Smashed Scientific Equipment
    if (toBoolean(getProperty("auto_newbieOverride"))) {
      setProperty("auto_newbieOverride", false.toString());
    } else {
      abort("We went to the Noob Cave for reals... uh oh");
    }
  } else {
    setProperty("auto_newbieOverride", false.toString());
  }
  return false;
}

function beatenUpResolution(): void {
  if (haveEffect($effect`Beaten Up`) > 0) {
    if (
      toInt(getProperty("auto_beatenUpCount")) > 10 &&
      getProperty("lastEncounter") !== "Poetic Justice"
    ) {
      abort("We are getting beaten up too much, this is not good. Aborting.");
    }
    acquireHP();
  }

  if (haveEffect($effect`Beaten Up`) > 0) {
    if (
      haveEffect($effect`Beaten Up`) === 2 &&
      getProperty("lastEncounter") === "Dr. Awkward" &&
      internalQuestStatus("questL11Palindome") > 5
    ) {
      //beaten up by the quest item when unlocking Dr. Awkward, not by failing a fight
      setProperty("_auto_AwkwardBeatenUp", myTurncount().toString());
      auto_log_info$1(
        "We must have failed to remove beaten up before defeating Dr. Awkward and that hasn't stopped us so far...",
      );
    } else if (
      haveEffect($effect`Beaten Up`) === 1 &&
      toInt(getProperty("_auto_AwkwardBeatenUp")) !== 0 &&
      myTurncount() - toInt(getProperty("_auto_AwkwardBeatenUp")) <= 1
    ) {
      auto_log_info$1(
        "This should be the last turn of beaten up from Dr. Awkward",
      );
    } else {
      cliExecute("refresh all");
      if (haveEffect($effect`Beaten Up`) > 0) {
        abort(
          "We failed to remove beaten up. Adventuring in the same place that we got beaten in with half stats will just result in us dying again",
        );
      }
    }
  }
}

export function speculative_pool_skill(): number {
  let expectPool: number = toInt(getProperty("poolSkill"));
  expectPool += min(
    10,
    toInt(2 * squareRoot(toInt(getProperty("poolSharkCount")))),
  );
  if (myInebriety() >= 10) {
    expectPool += 30 - 2 * myInebriety();
  } else {
    expectPool += myInebriety();
  }
  if (
    auto_is_valid($item`handful of hand chalk`) &&
    (haveEffect($effect`Chalky Hand`) > 0 ||
      itemAmount($item`handful of hand chalk`) > 0)
  ) {
    expectPool += 3;
  }
  if (haveEffect($effect`Chalked Weapon`) > 0) {
    expectPool += 5;
  }
  if (haveEffect($effect`Influence of Sphere`) > 0) {
    expectPool += 5;
  }
  if (haveEffect($effect`Video... Games?`) > 0) {
    expectPool += 5;
  }
  if (haveEffect($effect`Swimming with Sharks`) > 0) {
    expectPool += 3;
  }
  return expectPool;
}

function autosellCrap(): boolean {
  if (canInteract() && myMeat() > 20000) {
    return false; //do not autosell stuff in casual or postronin unless you are very poor
  }
  if (in_wotsf()) {
    return false; //selling things in the way of the surprising fist only donates the money to charity, so we should not autosell anything automatically
  }

  for (const it of $items`ancient vinyl coin purse, black pension check, CSA discount card, fat wallet, Gathered Meat-Clip, loose Meats, old leather wallet, Penultimate Fantasy chest, pixellated moneybag, old coin purse, shiny stones, Warm Subject gift certificate`) {
    if (itemAmount(it) > 0 && auto_is_valid(it)) {
      use(min(10, itemAmount(it)), it);
    }
  }
  //keeping 1 garbage in stock to avoid possible harmful loop with dinseylandfill_garbageMoney()
  //keeping 1 briefcase in stock for the Infiltrationist choice 2
  for (const it of $items`bag of park garbage, briefcase`) {
    if (itemAmount(it) > 1 && auto_is_valid(it)) {
      //for these items we want to keep 1 in stock. use the rest
      use(min(10, itemAmount(it) - 1), it);
    }
  }
  if (
    !toBoolean(getProperty("_governmentPerDiemUsed")) &&
    itemAmount($item`government per-diem`) > 0
  ) {
    use(1, $item`government per-diem`);
  }
  if (
    toInt(getProperty("handfulOfTipsMeat")) < 9600 &&
    itemAmount($item`handful of tips`) > 0
  ) {
    use(1, $item`handful of tips`);
  }
  if (itemAmount($item`Stock Certificate`) > 0) {
    const turns: string = getProperty("stockCertificateTurns");
    if (turns !== "") {
      const earliestTurns: number = toInt((splitString(turns, ",")[0] ??= ""));
      if (totalTurnsPlayed() - earliestTurns >= 500) {
        use(1, $item`Stock Certificate`);
      }
    }
  }

  if (in_amw()) {
    return false; // don't bother trying to autosell in Adventurer Meats World
  }
  // Function to sell all of our items, optionally keeping some.
  function sell_except(
    n_to_keep: number,
    items_to_sell: Map<Item, boolean>,
  ): void {
    for (const it of items_to_sell.keys()) {
      if (itemAmount(it) > n_to_keep) {
        auto_autosell(min(10, itemAmount(it) - n_to_keep), it);
      }
    }
  }
  // keep none of these
  let items_considered: Map<Item, boolean> = new Map([
    [$item`dense meat stack`, true],
    [$item`meat stack`, true], //quest rewards that are better off as meat. If we ever need it we can freely recreate them at no loss.
    [$item`blue money bag`, true],
    [$item`red money bag`, true],
    [$item`white money bag`, true], //vampyre path boss rewards and major source of meat in run.
    [$item`space blanket`, true], //can be inside MayDay package. Only purpose is to sell for meat
    [$item`void stone`, true],
  ]); //dropped by Void Fights when Cursed Magnifying Glass is equiped. Only purpose is to sell for meat

  sell_except(0, items_considered);

  sell_except(2, new Map([[$item`elegant nightstick`, true]])); //keeping 2 nightsticks in stock for double fisting
  // below this point are items we only want to sell if we are desperate for meat.
  if (auto_amIRich()) {
    return false;
  }
  // Keep none
  items_considered = new Map([
    [$item`anticheese`, true],
    [$item`awful poetry journal`, true],
    [$item`Azurite`, true],
    [$item`beach glass bead`, true],
    [$item`beer bomb`, true],
    [$item`bit-o-cactus`, true],
    [$item`clay peace-sign bead`, true],
    [$item`clockwork key`, true],
    [$item`cocoa eggshell fragment`, true],
    [$item`datastick`, true],
    [$item`decorative fountain`, true],
    [$item`dense meat stack`, true],
    [$item`empty Cloaca-Cola bottle`, true],
    [$item`enchanted barbell`, true],
    [$item`Eye Agate`, true],
    [$item`fancy bath salts`, true],
    [$item`frigid ninja stars`, true],
    [$item`Feng Shui for Big Dumb Idiots`, true],
    [$item`Frat Army FGF`, true],
    [$item`giant moxie weed`, true],
    [$item`half of a gold tooth`, true],
    [$item`headless sparrow`, true],
    [$item`keel-haulin' knife`, true],
    [$item`Knob Goblin pants`, true],
    [$item`Knob Goblin scimitar`, true],
    [$item`Knob Goblin tongs`, true],
    [$item`Kokomo Resort Pass`, true],
    [$item`Lapis Lazuli`, true],
    [$item`leftovers of indeterminate origin`, true],
    [$item`Mad Train wine`, true],
    [$item`mangled squirrel`, true],
    [$item`margarita`, true],
    [$item`meat paste`, true],
    [$item`mineapple`, true],
    [$item`moxie weed`, true],
    [$item`PADL Phone`, true],
    [$item`patchouli incense stick`, true],
    [$item`phat turquoise bead`, true],
    [$item`photoprotoneutron torpedo`, true],
    [$item`plot hole`, true],
    [$item`procrastination potion`, true],
    [$item`rat carcass`, true],
    [$item`sausage bomb`, true],
    [$item`sea honeydew`, true],
    [$item`sea lychee`, true],
    [$item`sea persimmon`, true],
    [$item`sea tangelo`, true],
    [$item`shiny hood ornament`, true],
    [$item`slingshot`, true],
    [$item`smelted roe`, true],
    [$item`spicy jumping bean burrito`, true],
    [$item`spicy bean burrito`, true],
    [$item`spooky stick`, true],
    [$item`strongness elixir`, true],
    [$item`sunken chest`, true],
    [$item`tambourine bells`, true],
    [$item`tequila sunrise`, true],
    [$item`Uncle Jick's Brownie Mix`, true],
    [$item`windchimes`, true],
  ]);

  sell_except(0, items_considered);

  if (auto_amIRich()) {
    return false;
  }
  // Pixels, keep all in KoE, none otherwise (black and red saved for red pixel potions)
  if (!in_koe()) {
    items_considered = new Map([
      [$item`blue pixel`, true],
      [$item`green pixel`, true],
      [$item`white pixel`, true],
    ]);
    sell_except(0, items_considered);
  }
  // Keep none
  items_considered = new Map([
    [$item`Imp Ale`, true],
    [$item`shot of grapefruit schnapps`, true],
    [$item`shot of orange schnapps`, true],
    [$item`shot of tomato schnapps`, true],
  ]);
  sell_except(0, items_considered);
  // Keep one
  items_considered = new Map([
    [$item`big hot pepper`, true],
    [$item`chaos butterfly`, true],
  ]);
  sell_except(1, items_considered);
  // Keep three
  items_considered = new Map([
    [$item`energized spores`, true],
    [$item`hot wing`, true],
  ]);
  sell_except(3, items_considered);

  return true;
}

function print_header(): void {
  if (myThunder() > toInt(getProperty("auto_lastthunder"))) {
    setProperty("auto_lastthunderturn", `${myTurncount()}`);
    setProperty("auto_lastthunder", `${myThunder()}`);
  }
  if (inHardcore()) {
    auto_log_info(
      `Turn(${myTurncount()}): Starting with ${myAdventures()} left at Level: ${myLevel()}`,
      "cyan",
    );
  } else {
    auto_log_info(
      `Turn(${myTurncount()}): Starting with ${myAdventures()} left and ${pullsRemaining()} pulls left at Level: ${myLevel()}`,
      "cyan",
    );
  }
  if (
    (itemAmount($item`rock band flyers`) === 1 ||
      itemAmount($item`jam band flyers`) === 1) &&
    toInt(getProperty("flyeredML")) < 10000 &&
    !toBoolean(getProperty("auto_ignoreFlyer"))
  ) {
    auto_log_info(`Still flyering: ${getProperty("flyeredML")}`, "blue");
  }
  auto_log_info(
    `Encounter: ${combatRateModifier()}   Exp Bonus: ${experienceBonus()}`,
    "blue",
  );
  auto_log_info(
    `Meat Drop: ${meatDropModifier()}\t Item Drop: ${itemDropModifier()}`,
    "blue",
  );
  auto_log_info(
    `HP: ${myHp()}/${myMaxhp()}, MP: ${myMp()}/${myMaxmp()}, Meat: ${myMeat()}`,
    "blue",
  );
  auto_log_info(
    `Tummy: ${myFullness()}/${fullnessLimit()} Liver: ${myInebriety()}/${inebrietyLimit()} Spleen: ${mySpleenUse()}/${spleenLimit()}`,
    "blue",
  );
  auto_log_info(
    `ML: ${monsterLevelAdjustment()} control: ${currentMcd()}`,
    "blue",
  );
  if (myClass() === $class`Sauceror`) {
    auto_log_info(`Soulsauce: ${mySoulsauce()}`, "blue");
  }
  if (
    haveEffect($effect`Ultrahydrated`) > 0 &&
    toInt(getProperty("desertExploration")) < 100
  ) {
    auto_log_info(
      `Ultrahydrated: ${haveEffect($effect`Ultrahydrated`)}`,
      "violet",
    );
  }
  if (haveEffect($effect`Everything Looks Yellow`) > 0) {
    auto_log_info(
      `Everything Looks Yellow: ${haveEffect($effect`Everything Looks Yellow`)}`,
      "blue",
    );
  }
  if (equippedItem($slot`familiar`) === $item`Snow Suit`) {
    auto_log_info(
      `Snow suit usage: ${getProperty("_snowSuitCount")} carrots: ${getProperty("_carrotNoseDrops")}`,
      "blue",
    );
  }
  if (in_heavyrains()) {
    auto_log_info(
      `Thunder: ${myThunder()} Rain: ${myRain()} Lightning: ${myLightning()}`,
      "green",
    );
  }
  if (isActuallyEd()) {
    auto_log_info(
      `Ka Coins: ${itemAmount($item`Ka coin`)} Lashes used: ${getProperty("_edLashCount")}`,
      "green",
    );
  }
  if (in_plumber()) {
    auto_log_info(`Coins: ${itemAmount($item`coin`)}`, "green");
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

  if (doNotBuffFamiliar100Run()) {
    //some familiars are always bad
    setProperty("_auto_bad100Familiar", true.toString()); //disable buffing familiar
  } else {
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

  if (
    canChangeToFamiliar($familiar`Left-Hand Man`) &&
    familiarEquippedEquipment($familiar`Left-Hand Man`) !== Item.none
  ) {
    // Leaving something equipped on the Left-Hand man like the Latte is currently bugged in mafia
    // as it will show any skills the equipment gives as available even when you have a completely different familiar
    // see https://kolmafia.us/showthread.php?24780-April-2020-IOTM-sinistral-homunculus&p=158453&viewfull=1#post158453
    auto_log_info(
      `Unequipping your ${familiarEquippedEquipment($familiar`Left-Hand Man`)} from the Left-Hand Man`,
      "blue",
    );
    useFamiliar($familiar`Left-Hand Man`);
    equip($slot`familiar`, Item.none);
  }

  for (const it of $items`staph of homophones, sword behind inappropriate prepositions`) {
    // these screw with text in the game which breaks mafia's parsing in a lot of places.
    if (haveEquipped(it)) {
      equip(Item.none, toSlot(it));
    }
  }
  for (const eff of $effects`Dis Abled, Haiku State of Mind, Just the Best Anapests, O Hai!, Robocamo, Yes\, Can Haz`) {
    // as do these which can all be freely shrugged.
    if (haveEffect(eff) > 0) {
      cliExecute(`uneffect ${eff.toString()}`);
    }
  }
}

function process_tasks(): boolean {
  const task_order: Map<string, Map<number, Map<string, string>>> = fileAsMap(
    "autoscend_task_order.txt",
    [String, Number, String, String],
  );
  if (!task_order.size) {
    abort("Could not load /data/autoscend_task_order.txt");
  }

  let task_path: string = myPath().name;
  if (!task_order.has(task_path)) {
    task_path = "default";
  }

  for (const [i, _v0] of task_order.get(task_path) ??
    task_order.set(task_path, new Map()).get(task_path)) {
    for (const [task_function, _v1] of _v0) {
      const condition_function = _v1;
      auto_log_debug$1(`Attempting to execute task ${i} ${task_function}`);
      if (
        condition_function === "" ||
        callRegisteredTaskFunction(condition_function)
      ) {
        const result_1: boolean = callRegisteredTaskFunction(task_function);
        if (result_1) {
          return true;
        }
      }
    }
  }

  return false;
}

function doTasks(): boolean {
  //this is the main loop for autoscend. returning true will restart from the begining. returning false will quit the loop and go on to do bedtime

  auto_settingsFix(); //check and correct invalid configuration inputs made by users
  if (!auto_unreservedAdvRemaining()) {
    auto_log_warning("No more unreserved adventures left", "red");
    return false; //we are out of adventures
  }
  if (toBoolean(getProperty("_auto_doneToday"))) {
    auto_log_warning(
      "According to property _auto_doneToday I am done for today",
      "red",
    );
    return false;
  }
  if (myFamiliar() === $familiar`Stooper` && pathAllowsChangingFamiliar()) {
    auto_log_info("Avoiding stooper stupor...", "blue");
    const fam: Familiar = is100FamRun()
      ? toFamiliar(getProperty("auto_100familiar"))
      : findNonRockFamiliarInTerrarium();
    useFamiliar(fam);
  }
  if (myInebriety() > inebrietyLimit()) {
    auto_log_warning("I am overdrunk", "red");
    return false;
  }
  if (inAftercore()) {
    auto_log_warning("I am in aftercore", "red");
    return false;
  }
  // Check if rollover's coming up soon
  if (almostRollover()) {
    print(
      "Rollover's coming!  Gotta consume what we can and go to bed!",
      "red",
    );
    // How much organ space left?  If none, go to bed
    const organ_space: number = consumptionProgress();
    auto_log_debug(`${organ_space} organ space`, "blue");
    if (organ_space >= 0.999) {
      return false;
    }
    // How much organ space was available the last time we were here?
    const previous_space: number = toFloat(getProperty("_auto_organSpace"));
    const organ_space_change: number = organ_space - previous_space;
    auto_log_debug(`${previous_space} previous space`, "blue");
    auto_log_debug(`${organ_space_change} organ space change`, "blue");
    setProperty("_auto_organSpace", organ_space.toString());
    // If no space used the last time consumption was done, don't bother trying again
    if (organ_space_change < 0.001) {
      return false;
    }
    // There's space left to fill, but let's continue only if we don't have enough adventures
    return needToConsumeForEmergencyRollover();
  }

  casualCheck();

  print_header();

  auto_interruptCheck("main", false);

  const delay: number = toInt(getProperty("auto_delayTimer"));
  if (delay > 0) {
    auto_log_info("Delay between adventures... beep boop... ", "blue");
    wait(delay);
  }

  const paranoia: number = toInt(getProperty("auto_paranoia"));
  const is_april_fools: boolean = substring(todayToString(), 4) === "0401";
  if (is_april_fools) {
    auto_log_info$1("Salad april fools, so we paranoid salad.");
    cliExecute("refresh quests");
  } else if (paranoia !== -1) {
    const paranoia_counter: number = toInt(
      getProperty("auto_paranoia_counter"),
    );
    if (paranoia_counter >= paranoia) {
      auto_log_info("I think I'm paranoid and complicated", "blue");
      auto_log_info("I think I'm paranoid, manipulated", "blue");
      cliExecute("refresh quests");
      setProperty("auto_paranoia_counter", (0).toString());
    } else {
      setProperty("auto_paranoia_counter", (paranoia_counter + 1).toString());
    }
  }
  if (toBoolean(getProperty("auto_inv_paranoia"))) {
    cliExecute("refresh inv");
  }
  if (in_wereprof()) {
    // wereprof doesn't update wereProfessorTransformTurns unless you hit the charpane
    visitUrl("charpane.php", false);
  }
  // actually doing stuff should start from here onwards.
  resetState();

  basicAdjustML();

  if (zoo_graftFam()) {
    return true;
  }

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
  if (LM_glover()) {
    return true;
  }
  //This just closets stuff that bees don't like
  if (LM_bhy()) {
    return true;
  }

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

  if (LX_zootoFight()) {
    return true;
  }
  //Early adventure options that we probably want
  if (dna_startAcquire()) {
    return true;
  }
  if (LM_boris()) {
    return true;
  }
  if (LM_pete()) {
    return true;
  }
  if (LM_gnoob()) {
    return true;
  }
  if (LM_nuclear()) {
    return true;
  }
  if (LM_lar()) {
    return true;
  }
  if (LM_batpath()) {
    return true;
  }
  if (heavyrains_buySkills()) {
    return true;
  }
  if (LM_canInteract()) {
    return true;
  }
  if (LM_kolhs()) {
    return true;
  }
  if (LM_jarlsberg()) {
    return true;
  }
  if (LM_robot()) {
    return true;
  }
  if (LM_plumber()) {
    return true;
  }
  if (LM_zombieSlayer()) {
    return true;
  }
  if (LM_adventurerMeatsWorld()) {
    return true;
  }

  {
    cheeseWarMachine(0, 0, 0, 0);

    let turnGoal: number = 0;
    if (
      isActuallyEd() &&
      !possessEquipment($item`The Crown of Ed the Undying`)
    ) {
      turnGoal = 15;
    }

    if (myTurncount() >= turnGoal) {
      switch (myDaycount()) {
        case 1:
          loveTunnelAcquire(true, Stat.none, true, 1, true, 3);
          break;
        case 2:
          loveTunnelAcquire(true, Stat.none, true, 3, true, 1);
          break;
        default:
          loveTunnelAcquire(true, Stat.none, true, 2, true, 1);
          break;
      }
    }
  }

  if (theSource_oracle()) {
    return true;
  }
  if (LX_theSource()) {
    return true;
  }
  if (LX_ghostBusting()) {
    return true;
  }
  if (witchessFights()) {
    return true;
  }
  //
  //Adventuring actually starts here.
  //

  if (LA_grey_goo_tasks()) {
    return true;
  }
  if (in_ggoo()) {
    abort(
      "Should not have gotten here, aborted LA_grey_goo_tasks method allowed return to caller. Uh oh.",
    );
  }

  auto_voteSetup(0, 0, 0);
  auto_setSongboom();
  if (auto_juneCleaverAdventure()) {
    return true;
  }
  if (LX_ForceNC()) {
    return true;
  }
  if (LX_dronesOut()) {
    return true;
  }
  if (LM_bond()) {
    return true;
  }
  if (LX_calculateTheUniverse(false)) {
    return true;
  }
  rockGardenEnd();
  adventureFailureHandler();
  dna_sorceressTest();
  dna_generic();
  if (LA_wildfire()) {
    return true;
  }
  if (LA_robot()) {
    return true;
  }
  if (auto_autumnatonQuest()) {
    return true;
  }
  if (auto_smallCampgroundGear()) {
    return true;
  }
  if (auto_elfToiletReady(false)) {
    auto_useElfToilet();
  }
  auto_lostStomach(false);
  autoCleanse(); //running turbo only
  if (auto_doPhoneQuest()) {
    return true;
  }

  if (auto_doTempleSummit()) {
    return true;
  }
  if (L8_mountainManSummon()) {
    return true;
  }

  if (process_tasks()) {
    return true;
  }

  meatReserveMessage();
  auto_log_info(
    "I should not get here more than once because I pretty much just finished all my in-run stuff. Beep",
    "blue",
  );
  return false;
}

function auto_begin(): void {
  if (getAutoAttack() !== 0) {
    const shouldUnset: boolean = userConfirm(
      "You have an auto attack enabled. This can cause issues. Would you like us to disable it? Will default to 'No' in 30 seconds.",
      30000,
      false,
    );
    if (shouldUnset) {
      setAutoAttack(0);
    } else {
      auto_log_warning("Okay, but the warranty is off.", "red");
    }
  }

  if (in_community()) {
    abort("Community Service is no longer supported.");
  }

  if (inBadMoon()) {
    const nope: boolean = userConfirm(
      "Bad moon is not a thing we will ever support even if you can somehow meet the scripts minimum requirements. Do you understand?",
    );
    const failure: string = nope
      ? "Just no."
      : "Even if you don't understand, it's still no.";
    abort(failure);
  }

  if (!auto_meetsMinimumRequirements()) {
    auto_log_warning(
      "Minimum skill requirements to run autoscend are not met.",
      "red",
    );
    if (toInt(getProperty("_auto_im_cool_with_dying_a_lot")) === -1) {
      auto_log_warning("Don't come crying to us when you get beat up.", "red");
    } else {
      auto_log_warning(
        "Aborting to avoid dying a lot and making very little progress. To override:",
        "red",
      );
      auto_log_warning("set _auto_im_cool_with_dying_a_lot = -1", "red");
      abort();
    }
  }

  LX_handleIntroAdventures(); // handle early non-combats in challenge paths.
  cliExecute("refresh all");

  if (myClass().toString() === "Astral Spirit") {
    // my_class() can report Astral Spirit even though it is not a valid class....
    //workaround for this bug specifically https://kolmafia.us/showthread.php?25579
    abort(
      'Mafia thinks you are an astral spirit. Type "logout" in gCLI and then log back in afterwards. as this is needed to fix this and identify what your class actually is',
    );
  }

  auto_log_info$1(`Hello ${myName()}, time to explode!`);
  auto_log_info$1(
    `This is version: ${gitInfo("autoscend").commit} Mafia: ${getRevision()}`,
  );
  auto_log_info$1(`This is day ${myDaycount()}.`);
  auto_log_info$1(
    `Turns played: ${myTurncount()} current adventures: ${myAdventures()}`,
  );
  auto_log_info$1(`Current Ascension: ${myPath().name}`);
  auto_log_info$1(
    `You have: ${banishSources()} banish sources, ${freeRunSources()} free-run sources, ${freeKillSources()} free kill sources, ${instaKillSources()} insta-kill sources, ${yellowRaySources()} yellow ray sources, ${copySources()} copy sources, and ${sniffSources()} sniff sources.`,
  );

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
  backupSetting(
    "choiceAdventureScript",
    "scripts/autoscend/auto_choice_adv.js",
  );
  backupSetting("betweenBattleScript", "scripts/autoscend/auto_pre_adv.js");
  backupSetting("recoveryScript", "");
  backupSetting("counterScript", "");
  if (!toBoolean(getProperty("auto_disableExcavator"))) {
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
  backupSetting(
    "logPreferenceChangeFilter",
    "maximizerMRUList,testudinalTeachings,auto_maximize_current",
  );
  backupSetting("maximizerMRUSize", (0).toString()); // shuts the maximizer spam up!
  backupSetting("allowNonMoodBurning", true.toString()); // required to be true for burn cli cmd to work properly
  backupSetting("lastChanceThreshold", (1).toString()); // burn command will always use last chance skill, if we have no active buffs
  backupSetting("lastChanceBurn", ""); // clear default mana burn skill so mafia doesn't attempt to cast a skill we don't currently have

  const charpane: string = visitUrl("charpane.php");
  if (containsText(charpane, "<hr width=50%><table")) {
    auto_log_info$1(
      "Switching off Compact Character Mode, will resume during bedtime",
    );
    setProperty("auto_priorCharpaneMode", (1).toString());
    visitUrl(
      "account.php?am=1&pwd=&action=flag_compactchar&value=0&ajax=0",
      true,
    );
  }

  initializeSettings(); // sets properties (once) for the entire run (all paths).
  pathDroppedCheck(); //detects path changing. such as due to being dropped. and reinitialize appropriate settings

  initializeSession(); // sets properties for the current session (should all be reset when we're done)

  if (myFamiliar() === $familiar`Stooper` && pathAllowsChangingFamiliar()) {
    auto_log_info("Avoiding stooper stupor...", "blue");
    const fam: Familiar = is100FamRun()
      ? toFamiliar(getProperty("auto_100familiar"))
      : findNonRockFamiliarInTerrarium();
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
  if (!auto_unreservedAdvRemaining()) {
    consumeStuff();
  }
  // the main loop of autoscend is doTasks() which is actually called as part of the while.
  while (doTasks()) {
    consumeStuff();
  }

  if (doBedtime()) {
    auto_log_info$1(`Done for today (${myDaycount()}), beep boop`);
  }
}

function print_help_text(): void {
  printHtml("Thank you for using autoscend!");
  printHtml(
    'If you need to configure or interrupt the script, choose <b>autoscend</b> from the drop-down "run script" menu in your browser.',
  );
  printHtml(
    'If you want to contribute, please open an issue <a href="https://github.com/loathers/autoscend/issues">on Github</a>',
  );
  printHtml(
    'A FAQ with common issues (and tips for a great bug report) <a href="https://docs.google.com/document/d/1AfyKDHSDl-fogGSeNXTwbC6A06BG-gTkXUAdUta9_Ns">can be found here</a>',
  );
  printHtml(
    'The developers also hang around <a href="https://discord.gg/96xZxv3">on the Ascension Speed Society discord server</a>',
  );
  printHtml("");
}

function sad_times(): void {
  printHtml(
    'autoscend (formerly sl_ascend) is under new management. Soolar (the maintainer of sl_ascend) and Jeparo (the most active contributor) have decided to cease development of sl_ascend in response to Jick\'s behavior that has recently <a href="https://www.reddit.com/r/kol/comments/d0cq9s/allegations_of_misconduct_by_asymmetric_members/">come to light</a>. New developers have taken over maintenance and rebranded sl_ascend to autoscend as per Soolar\'s request. Please be patient with us during this transition period. Please see the readme on the <a href="https://github.com/loathers/autoscend">github</a> page for more information.',
  );
}

function safe_preference_reset_wrapper(level: number): void {
  if (level <= 0) {
    auto_begin();
  } else {
    try {
      safe_preference_reset_wrapper(level - 1);
    } finally {
      restoreAllSettings();
      if (level === 1) {
        sad_times();
      }
    }
  }
}

export function main(...input: string[]): void {
  sinceKolmafiaRevision(29104);

  backupSetting("printStackOnAbort", true.toString());
  // parse input
  if (input.length > 0) {
    switch ((input[0] ??= "")) {
      case "sim":
        // display useful items/skills/perms/etc and if the user has them
        printSim();
        return;
      case "turbo":
        // gotta go faaaaaast. Doing a double confirm because of the nature of this parameter.
        if (
          userConfirm(
            "This will get expensive for you. This should only be used if you are trying to go for a 1-day and don't care about expenses. Do you really want to do this? Will default to 'No' in 15 seconds.",
            15000,
            false,
          )
        ) {
          if (
            userConfirm(
              "This will use UMSBs and Spice Melanges if you have them. If you are ok with this, you have 15 seconds to hit 'Yes'",
              15000,
              false,
            )
          ) {
            setProperty("auto_turbo", "true");
            auto_log_info$1("Ka-chow! Gotta go fast.");
            break;
          }
        }
      // INTENTIONAL LACK OF BREAK
      default:
        auto_log_info$1(
          "Running normal autoscend because you didn't enter in a valid parameter",
        );
        break;
    }
  }

  print_help_text();
  sad_times();
  if (
    !autoscend_migrate() &&
    !userConfirm(
      "autoscend might not have upgraded from a previous version correctly, do you want to continue? Will default to true in 10 seconds.",
      10000,
      true,
    )
  ) {
    abort("User aborted script after failed migration.");
  }
  try {
    safe_preference_reset_wrapper(3);
  } catch (e) {
    if (!(e instanceof AutoStopError)) {
      throw e;
    }
  } finally {
    if (get("auto_stop", false)) {
      set("auto_stop", false);
      meatReserveMessage();
      auto_log_info$1(
        "auto_stop detected and quietly exiting, auto_stop disabled.",
      );
    }
  }
}
