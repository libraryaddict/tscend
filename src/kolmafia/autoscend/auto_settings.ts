import {
  Familiar,
  getProperty,
  myAscensions,
  myFamiliar,
  propertyExists,
  removeProperty,
  renameProperty,
  setProperty,
  splitString,
  toBoolean,
  toInt,
  toLowerCase,
} from "kolmafia";

import { auto_log_debug, auto_log_info$1 } from "./auto_util";
import { AshMatcher } from "./utils/kolmafiaUtils";

//# These functions are used to either upgrade format on properties. delete obsolete properties. or set default values for new properties

//Defined in autoscend/auto_settings.ash
function trackingSplitterFixer(
  oldSetting: string,
  day: number,
  newSetting: string,
): boolean {
  let setting: string = getProperty(oldSetting);
  if (setting === "") {
    return false;
  }

  const cleanSpaces: AshMatcher = new AshMatcher(", ", setting);
  setting = cleanSpaces.replaceAll(",");
  const retval: Map<number, string> = new Map(
    splitString(setting, ",").map((_v, _i) => [_i, _v]),
  );
  for (const x of retval.keys()) {
    if ((retval.get(x) ?? retval.set(x, "").get(x)) === "") {
      continue;
    }
    const dayAdder: AshMatcher = new AshMatcher(
      "[(]",
      retval.get(x) ?? retval.set(x, "").get(x),
    );
    retval.set(x, dayAdder.replaceAll(`(${day}:`));
    if (getProperty(newSetting) !== "") {
      setProperty(
        newSetting,
        `${getProperty(newSetting)},${retval.get(x) ?? retval.set(x, "").get(x)}`,
      );
    } else {
      setProperty(newSetting, retval.get(x) ?? retval.set(x, "").get(x));
    }
  }
  setProperty(oldSetting, "");
  return true;
}

function cleanup_property(target: string): void {
  //we need to clear out empty property that exist with an empty value.
  //aside from being messy they also cause problems such as rename_property refusing to work.
  if (getProperty(target) === "" && propertyExists(target)) {
    removeProperty(target);
  }
}

function auto_rename_property(oldprop: string, newprop: string): void {
  cleanup_property(oldprop);
  cleanup_property(newprop);
  if (!propertyExists(oldprop) || propertyExists(newprop)) {
    return;
  }
  renameProperty(oldprop, newprop);
}

function boolFix(p: string): void {
  const p_val: string = getProperty(p);
  if (p_val === "need" || p_val === "yes") {
    setProperty(p, true.toString());
  }
  if (p_val === "no") {
    setProperty(p, false.toString());
  }
}

function auto_settingsUpgrade(): void {
  //upgrade settings from old format to new format.
  //do not forget to add each old setting to auto_settingsDelete() so it can be deleted after the upgrade is done.

  trackingSplitterFixer("auto_banishes_day1", 1, "auto_banishes");
  trackingSplitterFixer("auto_banishes_day2", 2, "auto_banishes");
  trackingSplitterFixer("auto_banishes_day3", 3, "auto_banishes");
  trackingSplitterFixer("auto_banishes_day4", 4, "auto_banishes");
  trackingSplitterFixer("auto_yellowRay_day1", 1, "auto_yellowRays");
  trackingSplitterFixer("auto_yellowRay_day2", 2, "auto_yellowRays");
  trackingSplitterFixer("auto_yellowRay_day3", 3, "auto_yellowRays");
  trackingSplitterFixer("auto_yellowRay_day4", 4, "auto_yellowRays");
  trackingSplitterFixer("auto_lashes_day1", 1, "auto_lashes");
  trackingSplitterFixer("auto_lashes_day2", 2, "auto_lashes");
  trackingSplitterFixer("auto_lashes_day3", 3, "auto_lashes");
  trackingSplitterFixer("auto_lashes_day4", 4, "auto_lashes");
  trackingSplitterFixer("auto_renenutet_day1", 1, "auto_renenutet");
  trackingSplitterFixer("auto_renenutet_day2", 2, "auto_renenutet");
  trackingSplitterFixer("auto_renenutet_day3", 3, "auto_renenutet");
  trackingSplitterFixer("auto_renenutet_day4", 4, "auto_renenutet");

  if (getProperty("auto_100familiar") === "yes") {
    setProperty("auto_100familiar", myFamiliar().toString());
  }
  if (getProperty("auto_100familiar") === "no") {
    setProperty("auto_100familiar", Familiar.none.toString());
  }
  if (getProperty("auto_100familiar") === "false") {
    setProperty("auto_100familiar", Familiar.none.toString());
  }
  if (getProperty("auto_killingjar") === "done") {
    setProperty("auto_killingjar", "finished");
  }

  boolFix("auto_wandOfNagamar");
  boolFix("auto_chasmBusted");
  auto_rename_property("auto_edDelayTimer", "auto_delayTimer");
  boolFix("auto_grimstoneFancyOilPainting");
  boolFix("auto_grimstoneOrnateDowsingRod");

  if (getProperty("auto_abooclover") === "used") {
    setProperty("auto_abooclover", false.toString());
  }
  if (getProperty("lastPlusSignUnlock") === "true") {
    auto_log_debug(
      "lastPlusSignUnlock was changed to a boolean, fixing...",
      "red",
    );
    setProperty("lastPlusSignUnlock", myAscensions().toString());
  }
  if (getProperty("lastTempleUnlock") === "true") {
    auto_log_debug(
      "lastTempleUnlock was changed to a boolean, fixing...",
      "red",
    );
    setProperty("lastTempleUnlock", myAscensions().toString());
  }
  if (propertyExists("auto_consumeKeyLimePies")) {
    setProperty(
      "auto_dontConsumeKeyLimePies",
      (!toBoolean(getProperty("auto_consumeKeyLimePies"))).toString(),
    );
  }
  if (propertyExists("auto_alwaysGetSteelOrgan")) {
    setProperty(
      "auto_getSteelOrgan_initialize",
      getProperty("auto_alwaysGetSteelOrgan"),
    );
  }

  if (getProperty("auto_debug") === "true") {
    setProperty("auto_log_level", (3).toString());
  }
  //migrate log level from the string property auto_logLevel to the int property auto_log_level
  if (propertyExists("auto_logLevel")) {
    switch (toLowerCase(getProperty("auto_logLevel"))) {
      case "critical":
      case "crit":
      case "error":
      case "err":
        setProperty("auto_log_level", (0).toString());
        break;
      case "warning":
      case "warn":
        setProperty("auto_log_level", (1).toString());
        break;
      case "info":
        setProperty("auto_log_level", (2).toString());
        break;
      case "debug":
        setProperty("auto_log_level", (3).toString());
        break;
    }
  }
  //this supports the default logging level change from info(2) to debug(3)
  //default only effects new users, this migrates current users to the new default level of logging
  if (!propertyExists("logLevelDefaultChangedToDebug")) {
    setProperty("auto_log_level", (3).toString());
    setProperty("logLevelDefaultChangedToDebug", true.toString());
  }
}

export function auto_settingsFix(): void {
  //fix settings where user inputted an invalid value
  if (toInt(getProperty("auto_save_adv_override")) < -1) {
    setProperty("auto_save_adv_override", (-1).toString()); //values lower than -1 are not valid
  }
  if (toInt(getProperty("auto_log_level")) < 0) {
    setProperty("auto_log_level", (0).toString()); //values lower than 0 are not valid
  }
  if (toInt(getProperty("auto_log_level")) > 3) {
    setProperty("auto_log_level", (3).toString()); //values higher than 3 are not valid
  }
  if (toInt(getProperty("auto_log_level_restore")) < 0) {
    setProperty("auto_log_level_restore", (0).toString()); //values lower than 0 are not valid
  }
  if (toInt(getProperty("auto_log_level_restore")) > 2) {
    setProperty("auto_log_level_restore", (2).toString()); //values higher than 2 are not valid
  }
}

function auto_settingsDelete(): void {
  //delete obsolete settings
  removeProperty("auto_debug");
  removeProperty("auto_sonata");
  removeProperty("auto_edDelayTimer"); //replaced with auto_delayTimer that works in all paths
  removeProperty("auto_cubeItems");
  removeProperty("auto_useCubeling");
  removeProperty("auto_pullPVPJunk");
  removeProperty("auto_day1_init"); //old day initialization trackers
  removeProperty("auto_day2_init"); //old day initialization trackers
  removeProperty("auto_day3_init"); //old day initialization trackers
  removeProperty("auto_day4_init"); //old day initialization trackers
  removeProperty("auto_gaudy"); //Some lingering stuff from when gaudy pirates mattered is still here
  removeProperty("auto_beta_test"); //Beta testing features should be guarded behind their own individual properties
  removeProperty("auto_invaderKilled"); //No longer need to track the invaders status ourselves as mafia does it now
  removeProperty("auto_airship");
  removeProperty("auto_ballroom");
  removeProperty("auto_ballroomflat");
  removeProperty("auto_ballroomopen");
  removeProperty("auto_ballroomsong");
  removeProperty("auto_bat");
  removeProperty("auto_bean");
  removeProperty("auto_blackfam");
  removeProperty("auto_blackmap");
  removeProperty("auto_boopeak");
  removeProperty("auto_castlebasement");
  removeProperty("auto_castleground");
  removeProperty("auto_castletop");
  removeProperty("auto_consumption");
  removeProperty("auto_crypt");
  removeProperty("auto_day1_cobb");
  removeProperty("auto_fcle");
  removeProperty("auto_friars");
  removeProperty("auto_goblinking");
  removeProperty("auto_gremlins");
  removeProperty("auto_gremlinBanishes");
  removeProperty("auto_gunpowder");
  removeProperty("auto_hiddenapartment");
  removeProperty("auto_hiddenbowling");
  removeProperty("auto_hiddencity");
  removeProperty("auto_hiddenhospital");
  removeProperty("auto_hiddenoffice");
  removeProperty("auto_hiddenunlock");
  removeProperty("auto_hiddenzones");
  removeProperty("auto_highlandlord");
  removeProperty("auto_masonryWall");
  removeProperty("auto_mcmuffin");
  removeProperty("auto_mistypeak");
  removeProperty("auto_mosquito");
  removeProperty("auto_nuns");
  removeProperty("auto_oilpeak");
  removeProperty("auto_orchard");
  removeProperty("auto_palindome");
  removeProperty("auto_phatloot");
  removeProperty("auto_forcePhatLootToken");
  removeProperty("auto_prewar");
  removeProperty("auto_prehippy");
  removeProperty("auto_pirateoutfit");
  removeProperty("auto_trytower");
  removeProperty("auto_shenCopperhead");
  removeProperty("auto_spookyfertilizer");
  removeProperty("auto_spookymap");
  removeProperty("auto_spookyravensecond");
  removeProperty("auto_spookysapling");
  removeProperty("auto_sonofa");
  removeProperty("auto_sorceress");
  removeProperty("auto_swordfish");
  removeProperty("auto_tavern");
  removeProperty("auto_trapper");
  removeProperty("auto_treecoin");
  removeProperty("auto_twinpeak");
  removeProperty("auto_twinpeakprogress");
  removeProperty("auto_war");
  removeProperty("auto_winebomb");
  removeProperty("auto_clearCombatScripts");
  removeProperty("auto_legacyConsumeStuff"); //Knapsack consumption algorithm is now for everyone
  removeProperty("betweenAdventureScript"); //might be an old mafia property that was renamed but it does nothing now
  removeProperty("auto_copperhead"); //Mafia added tracking for the Copperhead Club non-combat so this is no longer necesssary
  removeProperty("auto_mineForOres"); //Automated Ore mining in hardcore is now for everyone!
  removeProperty("auto_hpAutoRecoveryItems");
  removeProperty("auto_hpAutoRecovery");
  removeProperty("auto_hpAutoRecoveryTarget");
  removeProperty("auto_skipDesert");
  removeProperty("auto_shenStarted");
  removeProperty("auto_breakstone");
  removeProperty("auto_aftercore");
  removeProperty("auto_aboocount");
  removeProperty("auto_dinseyGarbageMoney");
  removeProperty("auto_lastABooConsider");
  removeProperty("auto_lastABooCycleFix");
  removeProperty("auto_longConMonster");
  removeProperty("auto_voidWarranty");
  removeProperty("auto_kingLiberation");
  removeProperty("auto_borrowedTimeOnLiberation");
  removeProperty("auto_xiblaxianChoice");
  removeProperty("auto_extrudeChoice");
  removeProperty("auto_consumeKeyLimePies");
  removeProperty("auto_shareMaximizer");
  removeProperty("auto_allowSharingData");
  removeProperty("auto_mummeryChoice");
  removeProperty("auto_choice1119");
  removeProperty("auto_useTatter"); //obsolete combat directive to use [Tattered Scrap Of Paper] to escape combat
  removeProperty("auto_alwaysGetSteelOrgan"); //renamed to auto_getSteelOrgan_initialize
  removeProperty("auto_logLevel"); //replaced string auto_logLevel with int auto_log_level
  removeProperty("auto_bedtime_pulls_skip_clover"); //replaced option of pulling multiple ten-leaf clovers with always pulling an 11-leaf clover
  removeProperty("cloverProtectActive"); //obsolete with change to Lucky! adventures
  removeProperty("auto_edCombatHandler"); //ed can use the same tracking preference as all other paths
  removeProperty("auto_combatHandler"); //replaced with _auto_combatState
  removeProperty("auto_skipNEPOverride"); // unnecessary. Resources on hand should be used to progress quests.
  removeProperty("auto_dickstab"); // Just no.
  removeProperty("auto_getDinseyGarbageMoney"); // irrelevant in-run.
  removeProperty("auto_hatchRagamuffinImp"); // remnant which should've been removed along with the code.
  removeProperty("auto_saveMagicalSausage"); // unnecessary. Resources on hand should be used to progress quests.
  removeProperty("auto_useWishes"); // unnecessary. Resources on hand should be used to progress quests.
  removeProperty("auto_doNotUseCMC"); // unnecessary. Predates 2023 ascension workshed changes & as above resources on hand should be used to progress quests.
  removeProperty("auto_doArtistQuest"); // irrelevant in-run.
  removeProperty("auto_noSleepingDog"); // old & unused since consumption was rewritten 3-4 years ago.
  removeProperty("auto_cookie"); // old & unused since the semirare & clover revamp.
  removeProperty("auto_doArmory"); // irrelevant in-run.
  removeProperty("auto_doMeatsmith"); // irrelevant in-run.
  removeProperty("auto_waitingArrowAlcove"); // easier methods of handling this. Mafia has tracking properties for 10+ year old IotMs.
  removeProperty("auto_combatHandlerFingernailClippers"); // irrelevant in-run.
  removeProperty("auto_delayHauntedKitchen"); // We shouldn't need to rely on the user to tell us how to play because users are often terrible at the game.
}

function defaultConfig(prop: string, val: string): void {
  //this function is used to configure default values. it only makes a change if the current value is nothing
  if (!propertyExists(prop)) {
    auto_log_info$1(
      `${prop} has no value set. setting it to the default value of ${val}`,
    );
    setProperty(prop, val);
  }
}

function auto_settingsDefaults(): void {
  //set default values for settings which have not yet been configured
  defaultConfig("auto_delayTimer", "1");
  defaultConfig("auto_abooclover", "true"); //Are we considering using a clover at A-Boo Peak?
  defaultConfig("auto_consumablePriceLimit", "12000"); // Max mall price for consumables to eat/drink (also won't exceed mafia's autobuy limit).
  defaultConfig("auto_paranoia", "-1");
  defaultConfig("auto_inv_paranoia", "false");
  defaultConfig("auto_save_adv_override", "-1");
  defaultConfig("auto_log_level", "3");
  defaultConfig("auto_log_level_restore", "0");
  defaultConfig("auto_bedtime_pulls_skip", "false");
  defaultConfig("auto_bedtime_pulls_pvp_multi", "0.3");
  defaultConfig("auto_bedtime_pulls_min_desirability", "1.0");
}

export function auto_settings(): void {
  auto_settingsUpgrade(); //upgrade settings from old format to new format
  auto_settingsFix(); //fix settings where user inputted an invalid value
  auto_settingsDelete(); //delete obsolete settings
  auto_settingsDefaults(); //set default values for settings which have not yet been configured
}
