import {
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
  getDwelling,
  getRevision,
  getWorkshed,
  gitInfo,
  guildStoreAvailable,
  haveCampground,
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
  setAutoAttack,
  setLocation,
  spleenLimit,
  splitString,
  squareRoot,
  storageAmount,
  substring,
  todayToString,
  toInt,
  toItem,
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
  $phylum,
  $skill,
  $slot,
  $stat,
  AsdonMartin,
  BarrelShrine,
  DeckOfEveryCard,
  DNALab,
  get,
  have,
  haveInCampground,
  Latte,
  Leprecondo,
  set,
  SongBoom,
  Witchess,
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
import {
  auto_canRunBetweenBattleChecks,
  autoAdv,
  autoLuckyAdv,
} from "./autoscend/auto_adventure";
import { doBedtime } from "./autoscend/auto_bedtime";
import { buffMaintain$2 } from "./autoscend/auto_buff";
import {
  auto_canDrink,
  auto_canEat,
  autoCleanse,
  consumeStuff,
  consumptionProgress,
  getMinimumAdventuresToMaintain,
} from "./autoscend/auto_consume";
import {
  ensureSealClubs,
  equipBaseline,
  equipMaximizedGear,
  equipStatgainIncreasers$2,
  possessEquipment,
  possessOutfit,
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
import { setupSoftblockLocks, solveDelayZone } from "./autoscend/auto_routing";
import {
  auto_settings,
  auto_settingsApplyResets,
  auto_settingsFix,
} from "./autoscend/auto_settings";
import {
  adjustForYellowRayIfPossible,
  almostRollover,
  auto_abort,
  auto_amIRich,
  auto_autosell,
  auto_freeCrafts,
  auto_get_campground,
  auto_have_skill,
  auto_interruptCheck,
  auto_is_valid,
  auto_is_valid$1,
  auto_is_valid$2,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_meetsMinimumRequirements,
  auto_needAccordion,
  auto_predictAccordionTurns,
  auto_runChoice,
  auto_unusedPerishableLuckySources,
  autoCraft,
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
  prepareYellowRayNextCombat,
  restoreAllSettings,
  safeGet,
  sniffSources,
  yellowRaySources,
} from "./autoscend/auto_util";
import { zone_isAvailable } from "./autoscend/auto_zone";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "./autoscend/engine/engine";
import { runNextTask } from "./autoscend/engine/router";
import {
  auto_haveFlorist,
  makeStartingSmiths,
  oldPeoplePlantStuff,
} from "./autoscend/iotms/2010/mr2013";
import {
  dna_generic,
  dna_sorceressTest,
  dna_startAcquire,
  handleBjornify,
  icehouseUserErrorProtection,
} from "./autoscend/iotms/2010/mr2014";
import {
  auto_barrelPrayers,
  chateaumantegna_havePainting,
  chateaumantegna_useDesk,
  chateaumantegna_usePainting,
  deck_useScheme,
} from "./autoscend/iotms/2010/mr2015";
import {
  auto_chapeau,
  auto_doPrecinct,
  auto_sourceTerminalEducate,
  auto_sourceTerminalRequest,
  isOverdueDigitize,
  LX_ghostBusting,
  witchessFights,
} from "./autoscend/iotms/2010/mr2016";
import {
  asdonAutoFeed,
  horseDefault,
  kgb_getMartini,
  kgbSetup,
  loveTunnelAcquire,
  makeGeniePocket,
} from "./autoscend/iotms/2010/mr2017";
import {
  auto_haveVotingBooth,
  auto_latteRefill$4,
  auto_setSongboom,
  auto_voteMonster,
  auto_voteSetup,
  cheeseWarMachine,
  fightClubNap,
  fightClubStats,
  neverendingPartyAvailable,
} from "./autoscend/iotms/2010/mr2018";
import {
  auto_beachCombHead,
  auto_campawayGrabBuffs,
  auto_saberDailyUpgrade,
  auto_sausageGoblin,
  auto_spoonTuneConfirm,
  auto_spoonTuneMoon,
} from "./autoscend/iotms/2010/mr2019";
import {
  auto_birdOfTheDay,
  auto_buyCrimboCommerceMallItem,
  auto_getGuzzlrCocktailSet,
  auto_latheAppropriateWeapon,
} from "./autoscend/iotms/2020/mr2020";
import {
  auto_backupTarget,
  auto_backupToYourLastEnemy,
  auto_buyFireworksHat,
  auto_CMCconsult,
  auto_CMCconsultsLeft,
  auto_enableBackupCameraReverser,
  auto_harvestBatteries,
  auto_haveColdMedCabinet,
  have_fireworks_shop,
} from "./autoscend/iotms/2020/mr2021";
import {
  auto_autumnatonQuest,
  auto_canUseJuneCleaver,
  auto_checkTrainSet,
  auto_hasAutumnaton,
  auto_haveGreyGoose,
  auto_haveTrainSet,
  auto_juneCleaverAdventure,
  auto_voidMonster,
  prioritizeGoose,
} from "./autoscend/iotms/2020/mr2022";
import {
  auto_availableBrickRift,
  auto_buyFrom2002MrStore,
  auto_defaultBurnLeaves,
  auto_doPhoneQuest,
  auto_habitatMonster,
  auto_haveBurningLeaves,
  auto_havePayPhone,
  auto_initBurningLeaves,
  auto_lostStomach,
  auto_scepterSkills,
  auto_SITCourse,
  auto_useBlackMonolith,
  pickRocks,
  rockGardenEnd,
} from "./autoscend/iotms/2020/mr2023";
import {
  auto_buyFromSeptEmberStore,
  auto_getAprilingBandItems,
  auto_getClanPhotoBoothDefaultItems,
  auto_haveMayamCalendar,
  auto_MayamAllUsed,
  auto_MayamClaimAll,
} from "./autoscend/iotms/2020/mr2024";
import {
  auto_getBCZItems,
  auto_getGlobs,
  auto_haveBCZ,
  auto_haveMonodent,
  auto_openMcLargeHugeSkis,
  auto_setLeprecondo,
  auto_useLeprecondoDrops,
  auto_wantToBCZ,
  auto_waveTheZone,
} from "./autoscend/iotms/2020/mr2025";
import {
  auto_elfToiletReady,
  auto_useElfToilet,
  isOverdueClubIntoNextWeek,
} from "./autoscend/iotms/2020/mr2026";
import {
  auto_floundryAction,
  auto_get_clan_lounge,
  zataraClanmate,
} from "./autoscend/iotms/other/clan";
import { elementalPlanes_access } from "./autoscend/iotms/other/elementalPlanes";
import { eudora_initializeSettings } from "./autoscend/iotms/other/eudora";
import { auto_useWardrobe } from "./autoscend/iotms/other/ttt";
import {
  bhy_initializeSettings,
  in_bhy,
  LM_bhy,
} from "./autoscend/paths/2011/bees_hate_you";
import { in_wotsf } from "./autoscend/paths/2011/way_of_the_surprising_fist";
import {
  boris_buySkills,
  boris_initializeDay,
  boris_initializeSettings,
  is_boris,
  LM_boris,
} from "./autoscend/paths/2012/avatar_of_boris";
import { bugbear_initializeSettings } from "./autoscend/paths/2012/bugbear_invasion";
import {
  in_zombieSlayer,
  LM_zombieSlayerTask,
  zombieSlayer_buySkills,
  zombieSlayer_initializeSettings,
} from "./autoscend/paths/2012/zombie_slayer";
import {
  is_jarlsberg,
  jarlsberg_buySkills,
  jarlsberg_initializeDay,
  jarlsberg_initializeSettings,
  LM_jarlsbergTask,
} from "./autoscend/paths/2013/avatar_of_jarlsberg";
import {
  in_kolhs,
  kolhs_initializeSettings,
  LM_kolhs,
} from "./autoscend/paths/2013/kolhs";
import {
  is_pete,
  LM_pete,
  pete_buySkills,
  pete_initializeDay,
  pete_initializeSettings,
} from "./autoscend/paths/2014/avatar_of_sneaky_pete";
import {
  heavyrains_buySkills,
  heavyrains_initializeDay,
  heavyrains_initializeSettings,
  in_heavyrains,
} from "./autoscend/paths/2014/heavy_rains";
import { picky_pulls } from "./autoscend/paths/2014/picky";
import {
  ed_initializeDay,
  ed_initializeSession,
  ed_initializeSettings,
  isActuallyEd,
} from "./autoscend/paths/2015/actually_ed_the_undying";
import { in_community } from "./autoscend/paths/2015/community_service";
import {
  in_ocrs,
  ocrs_postCombatResolve,
} from "./autoscend/paths/2015/one_crazy_random_summer";
import {
  awol_buySkills,
  awol_initializeSettings,
  awol_useStuff,
  in_awol,
} from "./autoscend/paths/2016/avatar_of_west_of_loathing";
import {
  in_nuclear,
  LM_nuclear,
  nuclear_initializeDay,
  nuclear_initializeSettings,
} from "./autoscend/paths/2016/nuclear_autumn";
import {
  in_theSource,
  LX_theSource,
  theSource_buySkills,
  theSource_initializeSettings,
  theSource_oracle,
} from "./autoscend/paths/2016/the_source";
import { in_gnoob, LM_gnoob } from "./autoscend/paths/2017/gelatinous_noob";
import {
  bond_initializeSettings,
  in_lta,
  LM_bond,
} from "./autoscend/paths/2017/license_to_adventure";
import {
  in_lar,
  lar_safeguard,
  LM_lar,
} from "./autoscend/paths/2017/live_ascend_repeat";
import { disguises_initializeSettings } from "./autoscend/paths/2018/disguises_delimit";
import {
  glover_initializeDay,
  glover_initializeSettings,
  in_glover,
  LM_glover,
} from "./autoscend/paths/2018/g_lover";
import {
  in_pokefam,
  pokefam_getHats,
  pokefam_initializeSettings,
} from "./autoscend/paths/2018/pocket_familiars";
import {
  bat_formNone,
  bat_initializeDay,
  bat_initializeSession,
  bat_initializeSettings,
  in_darkGyffte,
  LM_batpath,
} from "./autoscend/paths/2019/dark_gyffte";
import {
  in_koe,
  koe_acquire_rmi,
  koe_initializeSettings,
  koe_rmi_count,
} from "./autoscend/paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "./autoscend/paths/2019/two_crazy_random_summer";
import { in_ggoo, LA_grey_goo_tasks } from "./autoscend/paths/2020/grey_goo";
import { lowkey_initializeSettings } from "./autoscend/paths/2020/low_key_summer";
import {
  in_plumber,
  LM_plumber,
  plumber_canDealScalingDamage,
  plumber_equipTool,
  plumber_initializeSettings,
} from "./autoscend/paths/2020/path_of_the_plumber";
import {
  auto_refreshQTFam,
  in_quantumTerrarium,
  qt_initializeSettings,
} from "./autoscend/paths/2021/quantum_terrarium";
import {
  in_wildfire,
  LA_wildfire,
  LX_wildfire_calculateTheUniverse,
  wildfire_initializeSettings,
} from "./autoscend/paths/2021/wildfire";
import {
  in_robot,
  LA_robot,
  LM_robot,
  robot_initializeSettings,
} from "./autoscend/paths/2021/you_robot";
import { fotd_initializeSettings } from "./autoscend/paths/2022/fall_of_the_dinosaurs";
import {
  aosol_buySkills,
  aosol_initializeSettings,
  aosol_unCurse,
} from "./autoscend/paths/2023/avatar_of_shadows_over_loathing";
import {
  auto_LegacyOfLoathingDailies,
  in_lol,
  lol_buyReplicas,
  lol_initializeSettings,
} from "./autoscend/paths/2023/legacy_of_loathing";
import {
  auto_smallCampgroundGear,
  in_small,
  small_initializeSettings,
} from "./autoscend/paths/2023/small";
import {
  ag_initializeSettings,
  in_avantGuard,
} from "./autoscend/paths/2024/avant_guard";
import { iluh_buyEquiq, in_iluh } from "./autoscend/paths/2024/i_love_u_hate";
import {
  in_wereprof,
  is_werewolf,
  wereprof_initializeSettings,
} from "./autoscend/paths/2024/wereprofessor";
import { ht_equip_hats, in_hattrick } from "./autoscend/paths/2025/hattrick";
import {
  in_zootomist,
  LX_zootoFight,
  zoo_graftFam,
} from "./autoscend/paths/2025/zootomist";
import {
  amw_initializeSettings,
  in_amw,
  LM_adventurerMeatsWorldTask,
} from "./autoscend/paths/2026/adventurer_meats_world";
import { bluevsred_initializeSettings } from "./autoscend/paths/2026/red_vs_blue";
import {
  auto_buySkills,
  pathDroppedCheck,
} from "./autoscend/paths/auto_path_util";
import {
  casualCheck,
  inAftercore,
  LM_canInteract,
} from "./autoscend/paths/casual";
import { tootGetMeat, tootOriole } from "./autoscend/quests/level_01";
import {
  L8_mineOreWorthBurningLuckOn,
  L8_mountainManSummonTask,
} from "./autoscend/quests/level_08";
import {
  finishBuildingSmutOrcBridgeTask,
  L9_aBooPeakWorthBurningLuckOn,
} from "./autoscend/quests/level_09";
import {
  auto_warSide,
  L12_castleTopFloorWorthBurningLuckOn,
} from "./autoscend/quests/level_12";
import {
  beehiveConsider,
  L13_wantsTheD,
  ns_crowd3,
} from "./autoscend/quests/level_13";
import {
  LX_dronesOutTask,
  LX_ForceNCTask,
  LX_handleIntroAdventures,
  useTonicDjinn,
} from "./autoscend/quests/level_any";
import { houseUpgrade } from "./autoscend/quests/optional";
import { maximizer } from "./autoscend/utils/maximizer";

// non-thrifty familiars are unusable in thrifty
/***
	autoscend_header.ash must be first import
	All non-accessory scripts must be imported here
	Accessory scripts can import autoscend.ash
***/
//this file contains its own header. so it needs to be imported early

//Defined in autoscend.ash
export function initializeSettings(calledFromRelay: boolean = false): void {
  if (inAftercore()) {
    return;
  }
  // called once per ascension on the first launch of the script.
  // should not handle anything other than intialising properties etc.
  // all paths that have extra settings should call their path specific
  // initialise function at the end of this function (may override properties set in here).
  //if we detected a path drop we need to reinitialize. either due to dropping a path or breaking ronin in some paths.
  const reinitialize: boolean = get("_auto_reinitialize", false);
  if (!reinitialize && myAscensions() === get("auto_doneInitialize", 0)) {
    return; //already initialized settings this ascension
  }
  setLocation($location.none);
  invalidateRestoreOptionCache();

  // Reset our day and 'ascend'
  auto_settingsApplyResets("day", "ascend");

  if (!reinitialize) {
    set("auto_100familiar", $familiar.none);
    if (myFamiliar() !== $familiar.none && pathAllowsChangingFamiliar()) {
      //If we can't control familiar changes, no point setting 100% familiar data
      const userAnswer: boolean =
        !calledFromRelay &&
        userConfirm(
          "Familiar already set, is this a 100% familiar run? Will default to 'No' in 15 seconds.",
          15000,
          false,
        );
      if (userAnswer) {
        set("auto_100familiar", myFamiliar());
      }
    }
    //check for a workshed
    if (getWorkshed() !== $item.none) {
      const userAnswer: boolean =
        !calledFromRelay &&
        userConfirm(
          "Workshed already set, do you want Autoscend to handle your workshed? Will default to 'Yes' in 15 seconds.",
          15000,
          true,
        );
      if (userAnswer) {
        set("auto_workshed", "auto");
      } else {
        set("auto_workshed", getWorkshed());
      }
    }
  }

  auto_spoonTuneConfirm();

  icehouseUserErrorProtection();

  set("auto_familiarChoice", "");
  set("auto_forceNonCombatLocation", "");
  set("auto_getSteelOrgan", get("auto_getSteelOrgan_initialize"));
  set("auto_doGalaktik", get("auto_doGalaktik_initialize"));
  set("auto_modernzmobiecount", "");
  beehiveConsider(false);

  if (auto_canRunBetweenBattleChecks()) {
    eudora_initializeSettings();
  }
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
  bluevsred_initializeSettings();
  wereprof_initializeSettings();
  ag_initializeSettings();
  amw_initializeSettings();

  set("auto_doneInitializePath", myPath().name); //which path we initialized as
  set("auto_doneInitialize", myAscensions());
}

function initializeSession(): void {
  // called once every time the script is started.
  // anything that needs to be set only for the duration the script is running
  // should be set in here.

  auto_enableBackupCameraReverser();
  set("_auto_organSpace", -1.0);
  ed_initializeSession();
  bat_initializeSession();
}

export function auto_advToReserve(): number {
  // Calculates how many adventures we should aim to keep in reserve
  // if auto_save_adv_override value is 0 or higher then use the override
  if (get("auto_save_adv_override", 0) > -1) {
    return get("auto_save_adv_override", 0);
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
  if (myAdventures() >= getMinimumAdventuresToMaintain()) {
    return true;
  }
  return false;
}

function LX_burnDelayDo(): boolean {
  let voteMonsterAvailable: boolean = auto_voteMonster(true);
  const digitizeMonsterNext: boolean = isOverdueDigitize();
  let sausageGoblinAvailable: boolean = auto_sausageGoblin();
  const backupTargetAvailable: boolean = auto_backupTarget();
  const voidMonsterAvailable: boolean = auto_voidMonster();
  const habitatingMonsters: boolean = auto_habitatMonster() !== $monster.none;
  const clubEmNextWeekNext: boolean = isOverdueClubIntoNextWeek();
  // if we're a plumber and we're still stuck doing a flat 15 damage per attack
  // then a scaling monster is probably going to be a bad time
  if (in_plumber() && !plumber_canDealScalingDamage()) {
    // unless we can still kill it in one hit, then it should probably be fine?
    const predictedScalerHP: number = toInt(
      0.75 * (myBuffedstat($stat`Muscle`) + monsterLevelAdjustment()),
    );
    if (predictedScalerHP > 15) {
      auto_log_info(
        "Want to burn delay with scaling wanderers, but we can't deal scaling damage yet and it would be too strong :(",
      );
      voteMonsterAvailable = false;
      sausageGoblinAvailable = false;
      maximizer.exclude($item`Kramco Sausage-o-Matic™`);
      maximizer.exclude($item`"I Voted!" sticker`);
    }
  }
  // See the encounter priority flowcharts available at https://i.imgur.com/sdVH4SPh.jpg
  // and https://github.com/loathers/encounter/blob/main/heirarchy.mermaid if adding handling for more stuff

  if (voteMonsterAvailable && !backupTargetAvailable) {
    // Voting monsters are inherently free (the ones we fight anyway).
    // don't fight them if we're going to backup because they will overwrite the monster we want to backup
    const voterZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (voterZone !== $location.none) {
      auto_log_info(
        `Fighting a free ${safeGet("_voteMonster")} in ${voterZone.toString()} to burn delay!`,
        "green",
      );
      set("auto_nextEncounter", safeGet("_voteMonster").toString());
      if (auto_voteMonster(true, voterZone)) {
        return true;
      }
      set("auto_nextEncounter", "");
    }
  }

  if (digitizeMonsterNext) {
    // Digitize Wanderers will happen regardless so prioritize handling them.
    // hopefully they don't overwrite something we want to backup.
    let digitizeZone: Location = solveDelayZone(
      isFreeMonster(safeGet("_sourceTerminalDigitizeMonster")) &&
        get("breathitinCharges") > 0,
    );
    if (digitizeZone === $location.none) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      digitizeZone = $location`Noob Cave`;
    }
    auto_log_info(
      `Fighting a ${safeGet("_sourceTerminalDigitizeMonster")} in ${digitizeZone.toString()} to burn delay!`,
      "green",
    );
    set(
      "auto_nextEncounter",
      safeGet("_sourceTerminalDigitizeMonster").toString(),
    );
    if (autoAdv(digitizeZone)) {
      return true;
    }
    set("auto_nextEncounter", "");
  }
  if (clubEmNextWeekNext) {
    // Digitize Wanderers will happen regardless so prioritize handling them.
    // hopefully they don't overwrite something we want to backup.
    let clubEmZone: Location = solveDelayZone(
      isFreeMonster(safeGet("clubEmNextWeekMonster")) &&
        get("breathitinCharges") > 0,
    );
    if (clubEmZone === $location.none) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      clubEmZone = $location`Noob Cave`;
    }
    auto_log_info(
      `Fighting a ${safeGet("clubEmNextWeekMonster")} in ${clubEmZone.toString()} to burn delay!`,
      "green",
    );
    set("auto_nextEncounter", safeGet("clubEmNextWeekMonster").toString());
    if (autoAdv(clubEmZone)) {
      return true;
    }
    set("auto_nextEncounter", "");
  }

  if (backupTargetAvailable) {
    const skipOutdoorZones: boolean =
      isFreeMonster(safeGet("lastCopyableMonster")) &&
      get("breathitinCharges") > 0;
    let backupZone: Location = solveDelayZone(skipOutdoorZones);
    if (backupZone === $location.none && skipOutdoorZones && !in_koe()) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      backupZone = $location`Noob Cave`;
    }

    auto_log_info(
      `Fighting a ${safeGet("lastCopyableMonster")} in ${backupZone.toString()} to burn delay!`,
      "green",
    );
    if (auto_backupToYourLastEnemy(backupZone)) {
      return true;
    }
  }

  if (sausageGoblinAvailable) {
    // Sausage Goblins are inherently free
    const goblinZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (goblinZone !== $location.none) {
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
    const voidZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (voidZone !== $location.none) {
      auto_log_info(
        `Fighting a Void monster in ${voidZone.toString()} to burn delay!`,
        "green",
      );
      if (auto_voidMonster(voidZone)) {
        return true;
      }
    }
  }

  if (habitatingMonsters) {
    const habitatZone: Location = solveDelayZone(
      isFreeMonster(auto_habitatMonster()) && get("breathitinCharges") > 0,
    );
    if (habitatZone !== $location.none) {
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

const LX_burnDelayTask: QuestTask = registerQuestTask({
  name: "LX_burnDelay",
  completed: () => false,
  ready: () => true,
  do: LX_burnDelayDo,
});

export function LX_burnDelay(): boolean {
  return runQuestTask(LX_burnDelayTask);
}

export function LX_needToBurnUnusedLuck(): boolean {
  const unusedLucky: number = auto_unusedPerishableLuckySources();
  if (unusedLucky === 0) {
    return false;
  }
  const spareAdv: number = myAdventures() - auto_advToReserve();
  return consumptionProgress() >= 0.999 || spareAdv <= unusedLucky + 1;
}

function LX_bestLuckyBurnLocation(): Location {
  const candidates: [Location, boolean][] = [
    [$location`Itznotyerzitz Mine`, L8_mineOreWorthBurningLuckOn()],
    [$location`A-Boo Peak`, L9_aBooPeakWorthBurningLuckOn()],
    [
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
      L12_castleTopFloorWorthBurningLuckOn(),
    ],
    [
      $location`The Castle in the Clouds in the Sky (Basement)`,
      L13_wantsTheD(),
    ],
    [$location`The Haunted Pantry`, auto_canEat($item`tasty tart`)],
    [
      $location`The Sleazy Back Alley`,
      auto_canDrink($item`distilled fortified wine`),
    ],
    [$location`The Castle in the Clouds in the Sky (Top Floor)`, true],
  ];
  for (const [loc, worthwhile] of candidates) {
    if (worthwhile && zone_isAvailable(loc, true)) {
      return loc;
    }
  }
  return $location.none;
}

function LX_burnUnusedLuckDo(): boolean {
  const luckyLoc: Location = LX_bestLuckyBurnLocation();
  if (luckyLoc === $location.none) {
    return false;
  }
  auto_log_info(
    `Have an unused Lucky! source, burning it in ${luckyLoc.toString()} before it goes to waste.`,
    "green",
  );
  return autoLuckyAdv(luckyLoc, true);
}

const LX_burnUnusedLuckTask: QuestTask = registerQuestTask({
  name: "LX_burnUnusedLuck",
  completed: () => auto_unusedPerishableLuckySources() <= 0,
  ready: () => LX_needToBurnUnusedLuck(),
  do: LX_burnUnusedLuckDo,
});

export function LX_burnUnusedLuck(): boolean {
  return runQuestTask(LX_burnUnusedLuckTask);
}

export function LX_calculateTheUniverse(speculative: boolean): boolean {
  if (in_wildfire()) {
    return LX_wildfire_calculateTheUniverse();
  }
  if (myMp() < mpCost($skill`Calculate the Universe`)) {
    return false;
  }
  if (get("_universeCalculated") >= min(3, get("skillLevel144"))) {
    return false;
  }
  //do we want to summon a [War Frat 151st Infantryman] for the frat warrior outfit?
  if (!possessOutfit("Frat Warrior Fatigues") && auto_warSide() === "fratboy") {
    if (
      doNumberology("battlefield", false) !== -1 &&
      (adjustForYellowRayIfPossible($monster`War Frat 151st Infantryman`) ||
        prepareYellowRayNextCombat(12, speculative))
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
  let reEquip: Item = $item.none;

  if (possessEquipment($item`Mark IV Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark IV Steam-Hat`) {
      reEquip = $item`Mark V Steam-Hat`;
      equip($slot`hat`, $item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark IV Steam-Hat`);
  } else if (possessEquipment($item`Mark III Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark III Steam-Hat`) {
      reEquip = $item`Mark IV Steam-Hat`;
      equip($slot`hat`, $item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark III Steam-Hat`);
  } else if (possessEquipment($item`Mark II Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark II Steam-Hat`) {
      reEquip = $item`Mark III Steam-Hat`;
      equip($slot`hat`, $item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark II Steam-Hat`);
  } else if (possessEquipment($item`Mark I Steam-Hat`)) {
    if (equippedItem($slot`hat`) === $item`Mark I Steam-Hat`) {
      reEquip = $item`Mark II Steam-Hat`;
      equip($slot`hat`, $item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`Mark I Steam-Hat`);
  } else if (possessEquipment($item`brown felt tophat`)) {
    if (equippedItem($slot`hat`) === $item`brown felt tophat`) {
      reEquip = $item`Mark I Steam-Hat`;
      equip($slot`hat`, $item.none);
    }
    autoCraft("combine", 1, $item`brass gear`, $item`brown felt tophat`);
  } else {
    return false;
  }

  auto_log_info("Mark Steam-Hat upgraded!", "blue");
  if (reEquip !== $item.none) {
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
    plumber_equipTool($stat`Moxie`);
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
  if (get("lastTempleAdventures") >= myAscensions()) {
    return false;
  }
  if (auto_haveMayamCalendar() && !auto_MayamAllUsed()) {
    auto_log_info(
      "Not getting temple summit adventures since our Mayam calendar isn't spent.",
    );
    return false;
  }
  buffMaintain$2($effect`Stone-Faced`);
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

  if (get("auto_pvpEnable", false) && !hippyStoneBroken()) {
    visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
    visitUrl("peevpee.php?place=fight");
  }

  if (get("auto_day_init", 0) < day) {
    auto_settingsApplyResets("day");
  }

  if (
    !possessEquipment($item`your cowboy boots`) &&
    get("telegraphOfficeAvailable") &&
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
    !get("_cursedMicrowaveUsed")
  ) {
    use(1, $item`cursed microwave`);
  }
  if (itemAmount($item`cursed pony keg`) >= 1 && !get("_cursedKegUsed")) {
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
    set("questM20Necklace", "started");
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
      set("questM20Necklace", "started");
    }
  }

  auto_barrelPrayers();

  if (
    !get("_pottedTeaTreeUsed") &&
    auto_get_campground().has($item`potted tea tree`) &&
    !inAftercore()
  ) {
    if (get("auto_teaChoice") !== "") {
      const teaChoice: Map<number, string> = new Map(
        splitString(get("auto_teaChoice"), ";").map((_v, _i) => [_i, _v]),
      );
      const myTea: string = String(
        teaChoice.get(min(teaChoice.size, myDaycount()) - 1) ?? "",
      ).trim();
      if (toItem(myTea) !== $item.none || myTea === "shake") {
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
      auto_runChoice(1);
    }
  }

  auto_floundryAction();

  auto_MayamClaimAll(); // Want Mayam before booth to decide if we want a feather boa given yamtility.
  auto_getClanPhotoBoothDefaultItems();

  auto_initBurningLeaves();

  if (
    itemAmount($item`GameInformPowerDailyPro magazine`) > 0 &&
    myDaycount() === 1
  ) {
    visitUrl("inv_use.php?pwd=&which=3&whichitem=6174", true);
    visitUrl("inv_use.php?pwd=&which=3&whichitem=6174&confirm=Yep.", true);
    set("auto_disableAdventureHandling", true);
    autoAdv($location`[DungeonFAQ - Level 1]`);
    set("auto_disableAdventureHandling", false);
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
  if (!inHardcore() && get("auto_day_init", 0) < day) {
    auto_log_info("Bulk caching mall prices for consumables");
    if (get("auto_last_mallcached") !== todayToString()) {
      mallPrices("food");
      mallPrices("booze");
      set("auto_last_mallcached", todayToString()); //should not cache food,booze again after starting a new ascension on the same day
    }
    //food,booze will explicitly request historical_price to avoid making individual mall searches, in case a new mafia session gets started
    //hprestore and mprestore types corresponding with mall_prices search categories are not available. but it's not as many searches as food,booze
    //so cache those again even in a new ascension in case it's getting started in a new session
    mallPrices("hprestore");
    mallPrices("mprestore");
  }

  if (day === 1) {
    if (get("auto_day_init", 0) < 1) {
      auto_sourceTerminalEducate($skill`Extract`, $skill`Digitize`);
      if (
        containsText(get("sourceTerminalEnquiryKnown"), "monsters.enq") &&
        in_pokefam()
      ) {
        auto_sourceTerminalRequest("enquiry monsters.enq");
      } else if (
        containsText(get("sourceTerminalEnquiryKnown"), "familiar.enq") &&
        pathHasFamiliar()
      ) {
        auto_sourceTerminalRequest("enquiry familiar.enq");
      } else if (containsText(get("sourceTerminalEnquiryKnown"), "stats.enq")) {
        auto_sourceTerminalRequest("enquiry stats.enq");
      } else if (
        containsText(get("sourceTerminalEnquiryKnown"), "protect.enq")
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
        get("darkGyfftePoints") < 21 &&
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

      handleBjornify($familiar.none);
      handleBjornify($familiar`El Vibrato Megadrone`);

      visitUrl("guild.php?place=challenge");

      auto_beachCombHead("exp");
    }

    if (get("lastCouncilVisit") < myLevel()) {
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

    if (get("auto_day_init", 0) < 2) {
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
    if (get("auto_day_init", 0) < 3) {
      while (acquireHermitItem($item`11-leaf clover`)) {}

      picky_pulls();
    }
  } else if (day === 4) {
    if (get("auto_day_init", 0) < 4) {
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

  set("auto_forceNonCombatSource", "");

  set("auto_day_init", day);
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
    get("auto_alienLanguage", false)
  ) {
    use(
      itemAmount($item`burned government manual fragment`),
      $item`burned government manual fragment`,
    );
  }

  if (itemAmount($item`glass gnoll eye`) > 0 && !get("_gnollEyeUsed")) {
    use(1, $item`glass gnoll eye`);
  }
  if (itemAmount($item`Chroner trigger`) > 0 && !get("_chronerTriggerUsed")) {
    use(1, $item`Chroner trigger`);
  }
  if (itemAmount($item`Chroner cross`) > 0 && !get("_chronerCrossUsed")) {
    use(1, $item`Chroner cross`);
  }
  if (
    itemAmount($item`Chester's bag of candy`) > 0 &&
    !get("_bagOfCandyUsed")
  ) {
    use(1, $item`Chester's bag of candy`);
  }
  if (itemAmount($item`cheap toaster`) > 0 && !get("_toastSummoned")) {
    use(1, $item`cheap toaster`);
  }
  if (
    itemAmount($item`warbear breakfast machine`) > 0 &&
    !get("_warbearBreakfastMachineUsed")
  ) {
    use(1, $item`warbear breakfast machine`);
  }
  if (
    itemAmount($item`warbear soda machine`) > 0 &&
    !get("_warbearSodaMachineUsed")
  ) {
    use(1, $item`warbear soda machine`);
  }
  if (
    itemAmount($item`The Cocktail Shaker`) > 0 &&
    !get("_cocktailShakerUsed")
  ) {
    use(1, $item`The Cocktail Shaker`);
  }
  if (
    itemAmount($item`Taco Dan's Taco Stand Flier`) > 0 &&
    !get("_tacoFlierUsed")
  ) {
    use(1, $item`Taco Dan's Taco Stand Flier`);
  }
  if (itemAmount($item`festive warbear bank`) > 0 && !get("_warbearBankUsed")) {
    use(1, $item`festive warbear bank`);
  }

  if (itemAmount($item`etched hourglass`) > 0 && !get("_etchedHourglassUsed")) {
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
      !get("_olympicSwimmingPoolItemFound") &&
      isUnrestricted($item`Olympic-sized Clan crate`)
    ) {
      cliExecute("swim item");
    }
    if (
      furn.has($item`Clan looking glass`) &&
      !get("_lookingGlass") &&
      isUnrestricted($item`Clan looking glass`)
    ) {
      visitUrl("clan_viplounge.php?action=lookingglass");
    }
    if (get("_deluxeKlawSummons") === 0) {
      cliExecute("clan_viplounge.php?action=klaw");
      cliExecute("clan_viplounge.php?action=klaw");
      cliExecute("clan_viplounge.php?action=klaw");
    }
    if (
      furn.has($item`Crimbough`) &&
      (furn.get($item`Crimbough`) ?? 0) === 5 &&
      !get("_crimboTree") &&
      isUnrestricted($item`Crimbough`)
    ) {
      cliExecute("crimbotree get");
    }
  }

  if (
    get("_klawSummons") === 0 &&
    'Mr. Klaw "Skill" Crane Game' in getClanRumpus()
  ) {
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
  }

  if (
    itemAmount($item`infinite BACON machine`) > 0 &&
    !get("_baconMachineUsed")
  ) {
    use(1, $item`infinite BACON machine`);
  }
  if (itemAmount($item`picky tweezers`) > 0 && !get("_pickyTweezersUsed")) {
    use(1, $item`picky tweezers`);
  }

  if (haveSkill($skill`That's Not a Knife`) && !get("_discoKnife")) {
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
    for (let i: number = get("_genieWishesUsed"); i < 3; i++) {
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

  return true;
}

function Lsc_flyerSealsDo(): boolean {
  if (get("_sealsSummoned") < maxSealSummons() && myMeat() > 500) {
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

const Lsc_flyerSealsTask: QuestTask = registerQuestTask({
  name: "Lsc_flyerSeals",
  completed: () => !in_lol(),
  ready: () =>
    myClass() === $class`Seal Clubber` &&
    !get("auto_ignoreFlyer", false) &&
    // although seals can be fought drunk, it complicates code without serving a purpose
    myInebriety() <= inebrietyLimit() &&
    internalQuestStatus("questL12War") === 1 &&
    get("flyeredML") < 10000 &&
    (itemAmount($item`rock band flyers`) > 0 ||
      itemAmount($item`jam band flyers`) > 0) &&
    get("choiceAdventure1003") < 3,
  do: Lsc_flyerSealsDo,
});

export function Lsc_flyerSeals(): boolean {
  return runQuestTask(Lsc_flyerSealsTask);
}

function councilMaintenance(): boolean {
  if (in_koe()) {
    return false;
  }
  if (myLevel() > get("lastCouncilVisit")) {
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
      get("auto_forceFatLootToken", false)
    ) {
      tooManyAdventures = false;
    }

    const can_powerlevel_stench: boolean =
      elementalPlanes_access($element`stench`) &&
      auto_have_skill($skill`Summon Smithsness`) &&
      get("auto_beatenUpCount", 0) === 0;
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

    if (mySessionAdv() < get("_auto_override_tooManyAdv", 0)) {
      tooManyAdventures = false; //currently in override for too many adv
    }

    if (tooManyAdventures) {
      if (get("auto_newbieOverride", false)) {
        set("auto_newbieOverride", false);
        set("_auto_override_tooManyAdv", mySessionAdv() + 5); //override 5 adv at a time
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
        auto_abort(
          `We have spent ${place.turnsSpent} turns at '${place}' and that is bad... aborting.`,
        );
      }
    }
  }

  if (
    lastMonster() === $monster`crate` &&
    safeGet("_auto_screechDelay") !== $phylum.none &&
    in_wereprof() &&
    !($location`Noob Cave`.turnsSpent < 8)
  ) {
    //want 7 turns of Noob Cave in Wereprof for Smashed Scientific Equipment
    if (get("auto_newbieOverride", false)) {
      set("auto_newbieOverride", false);
    } else {
      auto_abort("We went to the Noob Cave for reals... uh oh");
    }
  } else {
    set("auto_newbieOverride", false);
  }
  return false;
}

function beatenUpResolution(): void {
  if (haveEffect($effect`Beaten Up`) > 0) {
    if (
      get("auto_beatenUpCount", 0) > 10 &&
      get("lastEncounter") !== "Poetic Justice"
    ) {
      auto_abort(
        "We are getting beaten up too much, this is not good. Aborting.",
      );
    }
    acquireHP();
  }

  if (haveEffect($effect`Beaten Up`) > 0) {
    if (
      haveEffect($effect`Beaten Up`) === 2 &&
      get("lastEncounter") === "Dr. Awkward" &&
      internalQuestStatus("questL11Palindome") > 5
    ) {
      //beaten up by the quest item when unlocking Dr. Awkward, not by failing a fight
      set("_auto_AwkwardBeatenUp", myTurncount());
      auto_log_info(
        "We must have failed to remove beaten up before defeating Dr. Awkward and that hasn't stopped us so far...",
      );
    } else if (
      haveEffect($effect`Beaten Up`) === 1 &&
      get("_auto_AwkwardBeatenUp", 0) !== 0 &&
      myTurncount() - get("_auto_AwkwardBeatenUp", 0) <= 1
    ) {
      auto_log_info(
        "This should be the last turn of beaten up from Dr. Awkward",
      );
    } else {
      cliExecute("refresh all");
      if (haveEffect($effect`Beaten Up`) > 0) {
        auto_abort(
          "We failed to remove beaten up. Adventuring in the same place that we got beaten in with half stats will just result in us dying again",
        );
      }
    }
  }
}

export function speculative_pool_skill(): number {
  let expectPool: number = get("poolSkill");
  expectPool += min(10, toInt(2 * squareRoot(get("poolSharkCount"))));
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
    !get("_governmentPerDiemUsed") &&
    itemAmount($item`government per-diem`) > 0
  ) {
    use(1, $item`government per-diem`);
  }
  if (
    get("handfulOfTipsMeat") < 9600 &&
    itemAmount($item`handful of tips`) > 0
  ) {
    use(1, $item`handful of tips`);
  }
  if (itemAmount($item`Stock Certificate`) > 0) {
    const turns: string = get("stockCertificateTurns");
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
  function sell_except(n_to_keep: number, items_to_sell: Item[]): void {
    for (const it of items_to_sell) {
      if (itemAmount(it) > n_to_keep) {
        auto_autosell(min(10, itemAmount(it) - n_to_keep), it);
      }
    }
  }
  // keep none of these
  let items_considered: Item[] = [
    $item`dense meat stack`,
    $item`meat stack`, //quest rewards that are better off as meat. If we ever need it we can freely recreate them at no loss.
    $item`blue money bag`,
    $item`red money bag`,
    $item`white money bag`, //vampyre path boss rewards and major source of meat in run.
    $item`space blanket`, //can be inside MayDay package. Only purpose is to sell for meat
    $item`void stone`,
  ]; //dropped by Void Fights when Cursed Magnifying Glass is equiped. Only purpose is to sell for meat

  sell_except(0, items_considered);

  sell_except(2, $items`elegant nightstick`); //keeping 2 nightsticks in stock for double fisting
  // below this point are items we only want to sell if we are desperate for meat.
  if (auto_amIRich()) {
    return false;
  }
  // Keep none
  items_considered = [
    $item`anticheese`,
    $item`awful poetry journal`,
    $item`Azurite`,
    $item`beach glass bead`,
    $item`beer bomb`,
    $item`bit-o-cactus`,
    $item`clay peace-sign bead`,
    $item`clockwork key`,
    $item`cocoa eggshell fragment`,
    $item`datastick`,
    $item`decorative fountain`,
    $item`dense meat stack`,
    $item`empty Cloaca-Cola bottle`,
    $item`enchanted barbell`,
    $item`Eye Agate`,
    $item`fancy bath salts`,
    $item`frigid ninja stars`,
    $item`Feng Shui for Big Dumb Idiots`,
    $item`Frat Army FGF`,
    $item`giant moxie weed`,
    $item`half of a gold tooth`,
    $item`headless sparrow`,
    $item`keel-haulin' knife`,
    $item`Knob Goblin pants`,
    $item`Knob Goblin scimitar`,
    $item`Knob Goblin tongs`,
    $item`Kokomo Resort Pass`,
    $item`Lapis Lazuli`,
    $item`leftovers of indeterminate origin`,
    $item`Mad Train wine`,
    $item`mangled squirrel`,
    $item`margarita`,
    $item`meat paste`,
    $item`mineapple`,
    $item`moxie weed`,
    $item`PADL Phone`,
    $item`patchouli incense stick`,
    $item`phat turquoise bead`,
    $item`photoprotoneutron torpedo`,
    $item`plot hole`,
    $item`procrastination potion`,
    $item`rat carcass`,
    $item`sausage bomb`,
    $item`sea honeydew`,
    $item`sea lychee`,
    $item`sea persimmon`,
    $item`sea tangelo`,
    $item`shiny hood ornament`,
    $item`slingshot`,
    $item`smelted roe`,
    $item`spicy jumping bean burrito`,
    $item`spicy bean burrito`,
    $item`spooky stick`,
    $item`strongness elixir`,
    $item`sunken chest`,
    $item`tambourine bells`,
    $item`tequila sunrise`,
    $item`Uncle Jick's Brownie Mix`,
    $item`windchimes`,
  ];

  sell_except(0, items_considered);

  if (auto_amIRich()) {
    return false;
  }
  // Pixels, keep all in KoE, none otherwise (black and red saved for red pixel potions)
  if (!in_koe()) {
    items_considered = [
      $item`blue pixel`,
      $item`green pixel`,
      $item`white pixel`,
    ];
    sell_except(0, items_considered);
  }
  // Keep none
  items_considered = [
    $item`Imp Ale`,
    $item`shot of grapefruit schnapps`,
    $item`shot of orange schnapps`,
    $item`shot of tomato schnapps`,
  ];
  sell_except(0, items_considered);
  // Keep one
  items_considered = [$item`big hot pepper`, $item`chaos butterfly`];
  sell_except(1, items_considered);
  // Keep three
  items_considered = [$item`energized spores`, $item`hot wing`];
  sell_except(3, items_considered);

  return true;
}

function print_header(): void {
  if (myThunder() > get("auto_lastthunder", 0)) {
    set("auto_lastthunderturn", myTurncount());
    set("auto_lastthunder", myThunder());
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
    get("flyeredML") < 10000 &&
    !get("auto_ignoreFlyer", false)
  ) {
    auto_log_info(`Still flyering: ${get("flyeredML")}`, "blue");
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
    get("desertExploration") < 100
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
      `Snow suit usage: ${get("_snowSuitCount")} carrots: ${get("_carrotNoseDrops")}`,
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
      `Ka Coins: ${itemAmount($item`Ka coin`)} Lashes used: ${get("_edLashCount")}`,
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
  set("auto_doCombatCopy", "no");
  set("_auto_thisLoopHandleFamiliar", false); // have we called handleFamiliar this loop
  set("auto_disableAdventureHandling", false); // used to stop auto_pre_adv and auto_post_adv from doing anything.
  set("auto_disableFamiliarChanging", false); // disable autoscend making changes to familiar
  set("auto_familiarChoice", ""); // which familiar do we want to switch to during pre_adventure
  set("choiceAdventure1387", -1); // using the force non-combat
  set("_auto_tunedElement", ""); // Flavour of Magic elemental alignment
  set("auto_nextEncounter", ""); // monster that was expected last turn
  set("auto_habitatMonster", ""); // monster we want to cast Recall Facts: Monster Habitats
  set("auto_nonAdvLoc", false); // location is a non-adventure.php location

  if (doNotBuffFamiliar100Run()) {
    //some familiars are always bad
    set("_auto_bad100Familiar", true); //disable buffing familiar
  } else {
    //some familiars are only bad at certain locations
    set("_auto_bad100Familiar", false); //reset to not bad. target location might set them as bad again
  }

  set("auto_parkaSetting", ""); // jurassic parka setting
  set("auto_retrocapeSettings", ""); // retrocape config
  set("auto_januaryToteAcquireCalledThisTurn", false); // january tote item switching

  horseDefault(); // horsery tracking

  set("auto_snapperPhylum", ""); // internal Red-Nosed Snapper phylum tracking. Ensures we only change it maximum once per adventure (and don't lose charges)

  bat_formNone(); // Vampyre form tracking

  resetMaximize();

  if (
    canChangeToFamiliar($familiar`Left-Hand Man`) &&
    familiarEquippedEquipment($familiar`Left-Hand Man`) !== $item.none
  ) {
    // Leaving something equipped on the Left-Hand man like the Latte is currently bugged in mafia
    // as it will show any skills the equipment gives as available even when you have a completely different familiar
    // see https://kolmafia.us/showthread.php?24780-April-2020-IOTM-sinistral-homunculus&p=158453&viewfull=1#post158453
    auto_log_info(
      `Unequipping your ${familiarEquippedEquipment($familiar`Left-Hand Man`)} from the Left-Hand Man`,
      "blue",
    );
    useFamiliar($familiar`Left-Hand Man`);
    equip($slot`familiar`, $item.none);
  }

  for (const it of $items`staph of homophones, sword behind inappropriate prepositions`) {
    // these screw with text in the game which breaks mafia's parsing in a lot of places.
    if (haveEquipped(it)) {
      equip($item.none, toSlot(it));
    }
  }
  for (const eff of $effects`Dis Abled, Haiku State of Mind, Just the Best Anapests, O Hai!, Robocamo, Yes\, Can Haz`) {
    // as do these which can all be freely shrugged.
    if (haveEffect(eff) > 0) {
      cliExecute(`uneffect ${eff.toString()}`);
    }
  }
}

// The fixed lead-in sequence that used to be hardcoded straight-line code at
// the top of doTasks(): "always run" maintenance calls (never stop the
// chain) interspersed with the gated ||-chains that were previously separate
// runTaskChain(...) calls. Folded into one ordered list so it shares the
// same cached engine/state as the rest of runNextTask()'s dispatch.
const resetStateTask: QuestTask = registerQuestTask({
  name: "resetState",
  completed: () => false,
  ready: () => true,
  do: () => {
    resetState();
    return false;
  },
});

const basicAdjustMLTask: QuestTask = registerQuestTask({
  name: "basicAdjustML",
  completed: () => false,
  ready: () => true,
  do: () => {
    basicAdjustML();
    return false;
  },
});

const zoo_graftFamTask: QuestTask = registerQuestTask({
  name: "zoo_graftFam",
  completed: () => !in_zootomist(),
  ready: () => true,
  do: zoo_graftFam,
});

const councilMaintenanceTask: QuestTask = registerQuestTask({
  name: "councilMaintenance",
  completed: () => false,
  ready: () => true,
  do: () => {
    councilMaintenance();
    return false;
  },
});

// formerly picky_buyskills() now moved here
const auto_buySkillsTask: QuestTask = registerQuestTask({
  name: "auto_buySkills",
  completed: () => false,
  ready: () => true,
  do: () => {
    auto_buySkills();
    return false;
  },
});

const awol_buySkillsTask: QuestTask = registerQuestTask({
  name: "awol_buySkills",
  completed: () => !in_awol(),
  ready: () => true,
  do: () => {
    awol_buySkills();
    return false;
  },
});

const awol_useStuffTask: QuestTask = registerQuestTask({
  name: "awol_useStuff",
  completed: () => !in_awol(),
  ready: () => true,
  do: () => {
    awol_useStuff();
    return false;
  },
});

const aosol_unCurseTask: QuestTask = registerQuestTask({
  name: "aosol_unCurse",
  completed: () => !in_awol(),
  ready: () => true,
  do: () => {
    aosol_unCurse();
    return false;
  },
});

const aosol_buySkillsTask: QuestTask = registerQuestTask({
  name: "aosol_buySkills",
  completed: () => !in_awol(),
  ready: () => true,
  do: () => {
    aosol_buySkills();
    return false;
  },
});

const theSource_buySkillsTask: QuestTask = registerQuestTask({
  name: "theSource_buySkills",
  completed: () => !in_theSource(),
  ready: () => true,
  do: () => {
    theSource_buySkills();
    return false;
  },
});

const jarlsberg_buySkillsTask: QuestTask = registerQuestTask({
  name: "jarlsberg_buySkills",
  completed: () => !is_jarlsberg(),
  ready: () => true,
  do: () => {
    jarlsberg_buySkills();
    return false;
  },
});

const boris_buySkillsTask: QuestTask = registerQuestTask({
  name: "boris_buySkills",
  completed: () => !is_boris(),
  ready: () => true,
  do: () => {
    boris_buySkills();
    return false;
  },
});

const pete_buySkillsTask: QuestTask = registerQuestTask({
  name: "pete_buySkills",
  completed: () => !is_pete(),
  ready: () => true,
  do: () => {
    pete_buySkills();
    return false;
  },
});

const zombieSlayer_buySkillsTask: QuestTask = registerQuestTask({
  name: "zombieSlayer_buySkills",
  completed: () => !in_zombieSlayer(),
  ready: () => true,
  do: () => {
    zombieSlayer_buySkills();
    return false;
  },
});

const pokefam_getHatsTask: QuestTask = registerQuestTask({
  name: "pokefam_getHats",
  completed: () => !in_pokefam(),
  ready: () => true,
  do: () => {
    pokefam_getHats();
    return false;
  },
});

const auto_refreshQTFamTask: QuestTask = registerQuestTask({
  name: "auto_refreshQTFam",
  completed: () => !in_quantumTerrarium(),
  ready: () => true,
  do: () => {
    auto_refreshQTFam();
    return false;
  },
});

const lol_buyReplicasTask: QuestTask = registerQuestTask({
  name: "lol_buyReplicas",
  completed: () => !in_lol(),
  ready: () => true,
  do: () => {
    lol_buyReplicas();
    return false;
  },
});

const iluh_buyEquiqTask: QuestTask = registerQuestTask({
  name: "iluh_buyEquiq",
  completed: () => !in_iluh(),
  ready: () => true,
  do: () => {
    iluh_buyEquiq();
    return false;
  },
});

const ht_equip_hatsTask: QuestTask = registerQuestTask({
  name: "ht_equip_hats",
  completed: () => !in_hattrick(),
  ready: () => true,
  do: () => {
    ht_equip_hats();
    return false;
  },
});

const oldPeoplePlantStuffTask: QuestTask = registerQuestTask({
  name: "oldPeoplePlantStuff",
  completed: () => !auto_haveFlorist(),
  ready: () => true,
  do: () => {
    oldPeoplePlantStuff();
    return false;
  },
});

const use_barrelsTask: QuestTask = registerQuestTask({
  name: "use_barrels",
  completed: () =>
    inAftercore() ||
    in_bhy() ||
    !BarrelShrine.have() ||
    !isUnrestricted($item`shrine to the Barrel god`),
  ready: () =>
    $items`little firkin, normal barrel, big tun, weathered barrel, dusty barrel, disintegrating barrel, moist barrel, rotting barrel, mouldering barrel, barnacled barrel`.some(
      (i) => itemAmount(i) > 0 && itemAmount(i) < 10,
    ),
  do: () => {
    const barrels: Item[] = $items`little firkin, normal barrel, big tun, weathered barrel, dusty barrel, disintegrating barrel, moist barrel, rotting barrel, mouldering barrel, barnacled barrel`;

    for (const it of barrels) {
      if (itemAmount(it) === 0 || itemAmount(it) >= 10) continue;

      use(itemAmount(it), it);
    }

    return true;
  },
});

const auto_latteRefillTask: QuestTask = registerQuestTask({
  name: "auto_latteRefill",
  completed: () => !Latte.have(),
  ready: () => true,
  do: () => {
    auto_latteRefill$4();
    return false;
  },
});

const auto_buyCrimboCommerceMallItemTask: QuestTask = registerQuestTask({
  name: "auto_buyCrimboCommerceMallItem",
  completed: () => !auto_is_valid$1($familiar`Ghost of Crimbo Commerce`),
  ready: () => true,
  do: () => {
    auto_buyCrimboCommerceMallItem();
    return false;
  },
});

const houseUpgradeTask: QuestTask = registerQuestTask({
  name: "houseUpgrade",
  completed: () => !$items`big rock, Newbiesport™ tent`.includes(getDwelling()),
  ready: () => true,
  do: () => {
    houseUpgrade();
    return false;
  },
});

//This just closets stuff so G-Lover does not mess with us.
const LM_gloverTask: QuestTask = registerQuestTask({
  name: "LM_glover",
  completed: () => !in_glover(),
  ready: () => true,
  do: LM_glover,
});

//This just closets stuff that bees don't like
const LM_bhyTask: QuestTask = registerQuestTask({
  name: "LM_bhy",
  completed: () => !in_bhy(),
  ready: () => true,
  do: LM_bhy,
});

const tophatMakerTask: QuestTask = registerQuestTask({
  name: "tophatMaker",
  completed: () => possessEquipment($item`Mark V Steam-Hat`),
  ready: () => knollAvailable() && itemAmount($item`brass gear`) > 0,
  do: () => {
    tophatMaker();
    return false;
  },
});

const deck_useSchemeTask: QuestTask = registerQuestTask({
  name: "deck_useScheme",
  completed: () =>
    DeckOfEveryCard.getCardsDrawn() > 0 || !DeckOfEveryCard.have(),
  ready: () => true,
  do: () => {
    deck_useScheme("");
    return false;
  },
});

const autosellCrapTask: QuestTask = registerQuestTask({
  name: "autosellCrap",
  completed: () => false,
  ready: () => true,
  do: () => {
    autosellCrap();
    return false;
  },
});

const asdonAutoFeedTask: QuestTask = registerQuestTask({
  name: "asdonAutoFeed",
  completed: () => !AsdonMartin.installed(),
  ready: () => true,
  do: () => {
    asdonAutoFeed();
    return false;
  },
});

const LX_craftAcquireItemsTask: QuestTask = registerQuestTask({
  name: "LX_craftAcquireItems",
  completed: () => false,
  ready: () => true,
  do: () => {
    LX_craftAcquireItems();
    return false;
  },
});

const auto_spoonTuneMoonTask: QuestTask = registerQuestTask({
  name: "auto_spoonTuneMoon",
  completed: () =>
    !auto_is_valid($item`hewn moon-rune spoon`) ||
    !possessEquipment($item`hewn moon-rune spoon`) ||
    get("moonTuned"),
  ready: () => true,
  do: () => {
    auto_spoonTuneMoon();
    return false;
  },
});

const auto_chapeauTask: QuestTask = registerQuestTask({
  name: "auto_chapeau",
  completed: () =>
    !auto_is_valid$2($skill`Ceci N'Est Pas Un Chapeau`) ||
    possessEquipment($item`no hat`),
  ready: () => true,
  do: () => {
    auto_chapeau();
    return false;
  },
});

const auto_buyFireworksHatTask: QuestTask = registerQuestTask({
  name: "auto_buyFireworksHat",
  completed: () =>
    // equipment doesn't give buffs in these paths
    in_gnoob() ||
    in_tcrs() ||
    //the damage from all three hats one-shots the professor after a round of combat
    in_wereprof() ||
    !have_fireworks_shop() ||
    get("_fireworksShopHatBought"),
  ready: () => true,
  do: () => {
    auto_buyFireworksHat();
    return false;
  },
});

const auto_CMCconsultTask: QuestTask = registerQuestTask({
  name: "auto_CMCconsult",
  completed: () =>
    ((!canInteract() && pullsRemaining() === 0) ||
      $items`Fleshazole™, Homebodyl™, Breathitin™`.every(
        (i) => !auto_is_valid(i),
      )) &&
    (!auto_haveColdMedCabinet() || auto_CMCconsultsLeft() === 0),
  ready: () => true,
  do: () => {
    auto_CMCconsult();
    return false;
  },
});

const auto_checkTrainSetTask: QuestTask = registerQuestTask({
  name: "auto_checkTrainSet",
  completed: () => !auto_haveTrainSet(),
  ready: () => true,
  do: () => {
    auto_checkTrainSet();
    return false;
  },
});

const prioritizeGooseTask: QuestTask = registerQuestTask({
  name: "prioritizeGoose",
  completed: () =>
    !auto_is_valid$1($familiar`Grey Goose`) ||
    (!auto_haveGreyGoose() && !in_quantumTerrarium()),
  ready: () => true,
  do: () => {
    prioritizeGoose();
    return false;
  },
});

const auto_useWardrobeTask: QuestTask = registerQuestTask({
  name: "auto_useWardrobe",
  completed: () =>
    itemAmount($item`wardrobe-o-matic`) === 0 ||
    !auto_is_valid($item`wardrobe-o-matic`) ||
    get("_futuristicHatModifier") !== "",
  ready: () => true,
  do: () => {
    auto_useWardrobe();
    return false;
  },
});

const auto_MayamClaimAllTask: QuestTask = registerQuestTask({
  name: "auto_MayamClaimAll",
  completed: () => !auto_haveMayamCalendar() || auto_MayamAllUsed(),
  ready: () => true,
  do: () => {
    auto_MayamClaimAll();
    return false;
  },
});

const auto_defaultBurnLeavesTask: QuestTask = registerQuestTask({
  name: "auto_defaultBurnLeaves",
  completed: () => !auto_haveBurningLeaves(),
  ready: () => true,
  do: () => {
    auto_defaultBurnLeaves();
    return false;
  },
});

const auto_waveTheZoneTask: QuestTask = registerQuestTask({
  name: "auto_waveTheZone",
  completed: () => !auto_haveMonodent() || get("_seadentWaveUsed"),
  ready: () => true,
  do: () => {
    auto_waveTheZone();
    return false;
  },
});

const ocrs_postCombatResolveTask: QuestTask = registerQuestTask({
  name: "ocrs_postCombatResolve",
  completed: () => !in_ocrs(),
  ready: () => true,
  do: () => {
    ocrs_postCombatResolve();
    return false;
  },
});

const beatenUpResolutionTask: QuestTask = registerQuestTask({
  name: "beatenUpResolution",
  completed: () => false,
  ready: () => true,
  do: () => {
    beatenUpResolution();
    return false;
  },
});

const lar_safeguardTask: QuestTask = registerQuestTask({
  name: "lar_safeguard",
  completed: () => !in_lar(),
  ready: () => true,
  do: () => {
    lar_safeguard();
    return false;
  },
});

const auto_useLeprecondoDropsTask: QuestTask = registerQuestTask({
  name: "auto_useLeprecondoDrops",
  completed: () => false,
  ready: () => true,
  do: () => {
    auto_useLeprecondoDrops();
    return false;
  },
});

const auto_setLeprecondoTask: QuestTask = registerQuestTask({
  name: "auto_setLeprecondo",
  completed: () =>
    !Leprecondo.have() ||
    !auto_is_valid($item`Leprecondo`) ||
    Leprecondo.rearrangesRemaining() === 0,
  ready: () => true,
  do: () => {
    auto_setLeprecondo(false);
    return false;
  },
});

const auto_grabBCZItemsTask: QuestTask = registerQuestTask({
  name: "auto_grabBCZItems",
  completed: () => !auto_haveBCZ(),
  ready: () =>
    auto_wantToBCZ($skill`BCZ: Craft a Pheromone Cocktail`) ||
    auto_wantToBCZ($skill`BCZ: Prepare Spinal Tapas`),
  do: () => {
    auto_getBCZItems();
    return false;
  },
});

const LX_zootoFightTask: QuestTask = registerQuestTask({
  name: "LX_zootoFight",
  completed: () => !in_zootomist(),
  ready: () => true,
  do: LX_zootoFight,
});

//Early adventure options that we probably want
const dna_startAcquireTask: QuestTask = registerQuestTask({
  name: "dna_startAcquire",
  completed: () =>
    !isUnrestricted($item`Little Geneticist DNA-Splicing Lab`) ||
    get("auto_day1_dna") === "finished" ||
    myDaycount() !== 1,
  ready: () => true,
  do: dna_startAcquire,
});

const LM_borisTask: QuestTask = registerQuestTask({
  name: "LM_boris",
  completed: () => !is_boris(),
  ready: () => true,
  do: LM_boris,
});

const LM_peteTask: QuestTask = registerQuestTask({
  name: "LM_pete",
  completed: () => !is_pete(),
  ready: () => true,
  do: LM_pete,
});

const LM_gnoobTask: QuestTask = registerQuestTask({
  name: "LM_gnoob",
  completed: () => !in_gnoob(),
  ready: () => true,
  do: LM_gnoob,
});

const LM_nuclearTask: QuestTask = registerQuestTask({
  name: "LM_nuclear",
  completed: () => !in_nuclear(),
  ready: () => true,
  do: LM_nuclear,
});

const LM_larTask: QuestTask = registerQuestTask({
  name: "LM_lar",
  completed: () => !in_lar(),
  ready: () => true,
  do: LM_lar,
});

const LM_batpathTask: QuestTask = registerQuestTask({
  name: "LM_batpath",
  completed: () => !in_darkGyffte(),
  ready: () => true,
  do: LM_batpath,
});

const heavyrains_buySkillsTask: QuestTask = registerQuestTask({
  name: "heavyrains_buySkills",
  completed: () => !in_heavyrains(),
  ready: () => true,
  do: heavyrains_buySkills,
});

const LM_canInteractTask: QuestTask = registerQuestTask({
  name: "LM_canInteract",
  completed: () => false,
  ready: () => true,
  do: LM_canInteract,
});

const LM_kolhsTask: QuestTask = registerQuestTask({
  name: "LM_kolhs",
  completed: () => !in_kolhs(),
  ready: () => true,
  do: LM_kolhs,
});

const LM_robotTask: QuestTask = registerQuestTask({
  name: "LM_robot",
  completed: () => !in_robot(),
  ready: () => true,
  do: LM_robot,
});

const LM_plumberTask: QuestTask = registerQuestTask({
  name: "LM_plumber",
  completed: () => !in_plumber(),
  ready: () => true,
  do: LM_plumber,
});

const cheeseWarMachineAndLoveTunnelTask: QuestTask = registerQuestTask({
  name: "cheeseWarMachineAndLoveTunnel",
  completed: () =>
    (!auto_is_valid($item`Bastille Battalion control rig`) &&
      itemAmount($item`Bastille Battalion control rig`) === 0) ||
    get("_bastilleGames") !== 0,
  ready: () => true,
  do: () => {
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
          loveTunnelAcquire(true, $stat.none, true, 1, true, 3);
          break;
        case 2:
          loveTunnelAcquire(true, $stat.none, true, 3, true, 1);
          break;
        default:
          loveTunnelAcquire(true, $stat.none, true, 2, true, 1);
          break;
      }
    }
    return false;
  },
  locations: $location`The Tunnel of L.O.V.E.`,
});

const theSource_oracleTask: QuestTask = registerQuestTask({
  name: "theSource_oracle",
  completed: () => !in_theSource(),
  ready: () => true,
  do: theSource_oracle,
});

const LX_theSourceTask: QuestTask = registerQuestTask({
  name: "LX_theSource",
  completed: () => !in_theSource(),
  ready: () => true,
  do: LX_theSource,
});

const LX_ghostBustingTask: QuestTask = registerQuestTask({
  name: "LX_ghostBusting",
  completed: () =>
    !auto_is_valid($item`protonic accelerator pack`) &&
    !auto_is_valid($item`almost-dead walkie-talkie`),
  ready: () => true,
  do: LX_ghostBusting,
});

const witchessFightsTask: QuestTask = registerQuestTask({
  name: "witchessFights",
  completed: () => !Witchess.have() || Witchess.fightsDone() < 5,
  ready: () => true,
  do: witchessFights,
});

//
//Adventuring actually starts here.
//
const LA_grey_goo_tasksTask: QuestTask = registerQuestTask({
  name: "LA_grey_goo_tasks",
  completed: () => !in_ggoo(),
  ready: () => true,
  do: LA_grey_goo_tasks,
});

const ggooSanityCheckTask: QuestTask = registerQuestTask({
  name: "ggooSanityCheck",
  completed: () => !in_ggoo(),
  ready: () => true,
  do: () => {
    if (in_ggoo()) {
      auto_abort(
        "Should not have gotten here, aborted LA_grey_goo_tasks method allowed return to caller. Uh oh.",
      );
    }
    return false;
  },
});

const auto_voteSetupTask: QuestTask = registerQuestTask({
  name: "auto_voteSetup",
  completed: () => !auto_haveVotingBooth() || get("_voteModifier") !== "",
  ready: () => true,
  do: () => {
    auto_voteSetup(0, 0, 0);
    return false;
  },
});

const auto_setSongboomTask: QuestTask = registerQuestTask({
  name: "auto_setSongboom",
  completed: () => !SongBoom.have(),
  ready: () => true,
  do: () => {
    auto_setSongboom();
    return false;
  },
});

const auto_juneCleaverAdventureTask: QuestTask = registerQuestTask({
  name: "auto_juneCleaverAdventure",
  completed: () => !auto_canUseJuneCleaver(),
  ready: () => true,
  do: auto_juneCleaverAdventure,
});

const LM_bondTask: QuestTask = registerQuestTask({
  name: "LM_bond",
  completed: () => !in_lta(),
  ready: () => true,
  do: LM_bond,
  locations: $location`Super Villain's Lair`,
});

const LX_calculateTheUniverseTask: QuestTask = registerQuestTask({
  name: "LX_calculateTheUniverse",
  completed: () => get("_universeCalculated") >= min(3, get("skillLevel144")),
  ready: () => true,
  do: () => LX_calculateTheUniverse(false),
  desiredEncounters: () => [
    {
      monster: $monster`War Frat 151st Infantryman`,
      needAmount:
        !possessOutfit("Frat Warrior Fatigues") && auto_warSide() === "fratboy"
          ? 1
          : 0,
    },
  ],
});

const rockGardenEndTask: QuestTask = registerQuestTask({
  name: "rockGardenEnd",
  completed: () =>
    (get("_molehillMountainUsed") ||
      !auto_is_valid($item`molehill mountain`) ||
      itemAmount($item`molehill mountain`) === 0) &&
    (get("_strangeStalagmiteUsed") ||
      !auto_is_valid($item`strange stalagmite`) ||
      itemAmount($item`strange stalagmite`) === 0),
  ready: () => true,
  do: () => {
    rockGardenEnd();
    return false;
  },
});

const adventureFailureHandlerTask: QuestTask = registerQuestTask({
  name: "adventureFailureHandler",
  completed: () => false,
  ready: () => true,
  do: () => {
    adventureFailureHandler();
    return false;
  },
});

const dna_sorceressTestTask: QuestTask = registerQuestTask({
  name: "dna_sorceressTest",
  completed: () => !DNALab.installed(),
  ready: () => true,
  do: () => {
    dna_sorceressTest();
    return false;
  },
});

const dna_genericTask: QuestTask = registerQuestTask({
  name: "dna_generic",
  completed: () => !DNALab.installed(),
  ready: () => true,
  do: () => {
    dna_generic();
    return false;
  },
});

const LA_wildfireTask: QuestTask = registerQuestTask({
  name: "LA_wildfire",
  completed: () => !in_wildfire(),
  ready: () => true,
  do: LA_wildfire,
});

const LA_robotTask: QuestTask = registerQuestTask({
  name: "LA_robot",
  completed: () => !in_robot(),
  ready: () => true,
  do: LA_robot,
});

const auto_autumnatonQuestTask: QuestTask = registerQuestTask({
  name: "auto_autumnatonQuest",
  completed: () => !auto_hasAutumnaton(),
  ready: () => true,
  do: auto_autumnatonQuest,
});

const auto_smallCampgroundGearTask: QuestTask = registerQuestTask({
  name: "auto_smallCampgroundGear",
  completed: () => !in_small(),
  ready: () => true,
  do: auto_smallCampgroundGear,
  locations: $locations`Fight in the Dirt, Fight in the Tall Grass`,
  desiredEncounters: () =>
    $items`mesquito proboscis, ncle leg, rutabuga bag, senate fly thorax, birdybug antenna, daddy shortlegs leg, kilopede skull`.map(
      (i) => ({ item: i, needAmount: have(i) ? 0 : 1 }),
    ),
});

const elfToiletTask: QuestTask = registerQuestTask({
  name: "elfToilet",
  completed: () =>
    !haveCampground() ||
    !haveInCampground($item`Pork Elf toilet`) ||
    !auto_is_valid($item`Pork Elf toilet`) ||
    get("_porkElfToiletUsed"),
  ready: () => true,
  do: () => {
    if (auto_elfToiletReady(false)) {
      auto_useElfToilet();
    }
    return false;
  },
});

const auto_lostStomachTask: QuestTask = registerQuestTask({
  name: "auto_lostStomach",
  completed: () => false,
  ready: () => true,
  do: () => {
    auto_lostStomach(false);
    return false;
  },
});

// running turbo only
const autoCleanseTask: QuestTask = registerQuestTask({
  name: "autoCleanse",
  completed: () => false,
  ready: () => true,
  do: () => {
    autoCleanse();
    return false;
  },
});

const auto_doPhoneQuestTask: QuestTask = registerQuestTask({
  name: "auto_doPhoneQuest",
  completed: () => !auto_havePayPhone(),
  ready: () => true,
  do: auto_doPhoneQuest,
  locations: () => [auto_availableBrickRift()],
  desiredEncounters: () => [
    {
      monster: $monster`shadow slab`,
      needAmount: get("questRufus") === "unstarted" ? 1 : 0,
    },
  ],
});

const auto_doTempleSummitTask: QuestTask = registerQuestTask({
  name: "auto_doTempleSummit",
  completed: () => get("lastTempleAdventures") >= myAscensions(),
  ready: () => true,
  do: auto_doTempleSummit,
  locations: $location`The Hidden Temple`,
});

const doTasksPrelude: QuestTask[] = [
  resetStateTask,
  basicAdjustMLTask,
  zoo_graftFamTask,
  finishBuildingSmutOrcBridgeTask,
  councilMaintenanceTask,
  auto_buySkillsTask,
  awol_buySkillsTask,
  awol_useStuffTask,
  aosol_unCurseTask,
  aosol_buySkillsTask,
  theSource_buySkillsTask,
  jarlsberg_buySkillsTask,
  boris_buySkillsTask,
  pete_buySkillsTask,
  zombieSlayer_buySkillsTask,
  pokefam_getHatsTask,
  auto_refreshQTFamTask,
  lol_buyReplicasTask,
  iluh_buyEquiqTask,
  ht_equip_hatsTask,
  oldPeoplePlantStuffTask,
  use_barrelsTask,
  auto_latteRefillTask,
  auto_buyCrimboCommerceMallItemTask,
  houseUpgradeTask,
  LM_gloverTask,
  LM_bhyTask,
  tophatMakerTask,
  deck_useSchemeTask,
  autosellCrapTask,
  asdonAutoFeedTask,
  LX_craftAcquireItemsTask,
  auto_spoonTuneMoonTask,
  auto_chapeauTask,
  auto_buyFireworksHatTask,
  auto_CMCconsultTask,
  auto_checkTrainSetTask,
  prioritizeGooseTask,
  auto_useWardrobeTask,
  auto_MayamClaimAllTask,
  auto_defaultBurnLeavesTask,
  auto_waveTheZoneTask,
  ocrs_postCombatResolveTask,
  beatenUpResolutionTask,
  lar_safeguardTask,
  auto_useLeprecondoDropsTask,
  auto_setLeprecondoTask,
  LX_zootoFightTask,
  dna_startAcquireTask,
  LM_borisTask,
  LM_peteTask,
  LM_gnoobTask,
  LM_nuclearTask,
  LM_larTask,
  LM_batpathTask,
  heavyrains_buySkillsTask,
  LM_canInteractTask,
  LM_kolhsTask,
  LM_jarlsbergTask,
  LM_robotTask,
  LM_plumberTask,
  LM_zombieSlayerTask,
  LM_adventurerMeatsWorldTask,
  cheeseWarMachineAndLoveTunnelTask,
  theSource_oracleTask,
  LX_theSourceTask,
  LX_ghostBustingTask,
  witchessFightsTask,
  LA_grey_goo_tasksTask,
  ggooSanityCheckTask,
  auto_voteSetupTask,
  auto_setSongboomTask,
  auto_juneCleaverAdventureTask,
  LX_ForceNCTask,
  LX_dronesOutTask,
  LM_bondTask,
  LX_calculateTheUniverseTask,
  rockGardenEndTask,
  adventureFailureHandlerTask,
  dna_sorceressTestTask,
  dna_genericTask,
  LA_wildfireTask,
  LA_robotTask,
  auto_autumnatonQuestTask,
  auto_smallCampgroundGearTask,
  elfToiletTask,
  auto_lostStomachTask,
  autoCleanseTask,
  auto_doPhoneQuestTask,
  auto_doTempleSummitTask,
  L8_mountainManSummonTask,
  auto_grabBCZItemsTask,
];

function doTasks(): boolean {
  //this is the main loop for autoscend. returning true will restart from the begining. returning false will quit the loop and go on to do bedtime

  auto_settingsFix(); //check and correct invalid configuration inputs made by users
  if (!auto_unreservedAdvRemaining()) {
    auto_log_warning("No more unreserved adventures left", "red");
    return false; //we are out of adventures
  }
  if (get("_auto_doneToday", false)) {
    auto_log_warning(
      "According to property _auto_doneToday I am done for today",
      "red",
    );
    return false;
  }
  if (myFamiliar() === $familiar`Stooper` && pathAllowsChangingFamiliar()) {
    auto_log_info("Avoiding stooper stupor...", "blue");
    const fam: Familiar = is100FamRun()
      ? safeGet("auto_100familiar")
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
    const previous_space: number = get("_auto_organSpace");
    const organ_space_change: number = organ_space - previous_space;
    auto_log_debug(`${previous_space} previous space`, "blue");
    auto_log_debug(`${organ_space_change} organ space change`, "blue");
    set("_auto_organSpace", organ_space);
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

  const delay: number = get("auto_delayTimer", 0);
  if (delay > 0) {
    auto_log_info("Delay between adventures... beep boop... ", "blue");
    wait(delay);
  }

  const paranoia: number = get("auto_paranoia", 0);
  const is_april_fools: boolean = substring(todayToString(), 4) === "0401";
  if (is_april_fools) {
    auto_log_info("Salad april fools, so we paranoid salad.");
    cliExecute("refresh quests");
  } else if (paranoia !== -1) {
    const paranoia_counter: number = get("auto_paranoia_counter", 0);
    if (paranoia_counter >= paranoia) {
      auto_log_info("I think I'm paranoid and complicated", "blue");
      auto_log_info("I think I'm paranoid, manipulated", "blue");
      cliExecute("refresh quests");
      set("auto_paranoia_counter", 0);
    } else {
      set("auto_paranoia_counter", paranoia_counter + 1);
    }
  }
  if (get("auto_inv_paranoia", false)) {
    cliExecute("refresh inv");
  }
  if (in_wereprof()) {
    // wereprof doesn't update wereProfessorTransformTurns unless you hit the charpane
    visitUrl("charpane.php", false);
  }
  // actually doing stuff should start from here onwards.
  if (runNextTask(myPath().name, doTasksPrelude)) {
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
  // Setup settings before continuing
  auto_settings();
  setupSoftblockLocks();

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
    auto_abort("Community Service is no longer supported.");
  }

  if (inBadMoon()) {
    const nope: boolean = userConfirm(
      "Bad moon is not a thing we will ever support even if you can somehow meet the scripts minimum requirements. Do you understand?",
    );
    const failure: string = nope
      ? "Just no."
      : "Even if you don't understand, it's still no.";
    auto_abort(failure);
  }

  if (!auto_meetsMinimumRequirements()) {
    auto_log_warning(
      "Minimum skill requirements to run autoscend are not met.",
      "red",
    );
    if (get("_auto_im_cool_with_dying_a_lot", 0) === -1) {
      auto_log_warning("Don't come crying to us when you get beat up.", "red");
    } else {
      auto_log_warning(
        "Aborting to avoid dying a lot and making very little progress. To override:",
        "red",
      );
      auto_abort("set _auto_im_cool_with_dying_a_lot = -1");
    }
  }

  LX_handleIntroAdventures(); // handle early non-combats in challenge paths.
  cliExecute("refresh all");

  if (myClass().toString() === "Astral Spirit") {
    // my_class() can report Astral Spirit even though it is not a valid class....
    //workaround for this bug specifically https://kolmafia.us/showthread.php?25579
    auto_abort(
      'Mafia thinks you are an astral spirit. Type "logout" in gCLI and then log back in afterwards. as this is needed to fix this and identify what your class actually is',
    );
  }

  auto_log_info(`Hello ${myName()}, time to explode!`);
  auto_log_info(
    `This is version: ${gitInfo("autoscend").commit} Mafia: ${getRevision()}`,
  );
  auto_log_info(`This is day ${myDaycount()}.`);
  auto_log_info(
    `Turns played: ${myTurncount()} current adventures: ${myAdventures()}`,
  );
  auto_log_info(`Current Ascension: ${myPath().name}`);
  auto_log_info(
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
  backupSetting("recoveryScript", "");
  backupSetting("counterScript", "");
  if (!get("auto_disableExcavator", false)) {
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
    auto_log_info(
      "Switching off Compact Character Mode, will resume during bedtime",
    );
    set("auto_priorCharpaneMode", 1);
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
      ? safeGet("auto_100familiar")
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
    auto_log_info(`Done for today (${myDaycount()}), beep boop`);
  }
}

export function print_help_text(): void {
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

export function sad_times(): void {
  printHtml(
    'autoscend (formerly sl_ascend) is under new management. Soolar (the maintainer of sl_ascend) and Jeparo (the most active contributor) have decided to cease development of sl_ascend in response to Jick\'s behavior that has recently <a href="https://www.reddit.com/r/kol/comments/d0cq9s/allegations_of_misconduct_by_asymmetric_members/">come to light</a>. New developers have taken over maintenance and rebranded sl_ascend to autoscend as per Soolar\'s request. Please be patient with us during this transition period. Please see the readme on the <a href="https://github.com/loathers/autoscend">github</a> page for more information.',
  );
}

export function safe_preference_reset_wrapper(level: number): void {
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
