import {
  abort,
  availableAmount,
  bufferToFile,
  buy,
  cliExecute,
  containsText,
  creatableAmount,
  create,
  daycount,
  Effect,
  Element,
  equippedItem,
  Familiar,
  fileToBuffer,
  getClanId,
  getProperty,
  gitExists,
  handlingChoice,
  haveEffect,
  Item,
  itemAmount,
  lastChoice,
  min,
  Monster,
  myAscensions,
  myBasestat,
  myFamiliar,
  myHash,
  myLevel,
  myPrimestat,
  numericModifier,
  sessionStorage,
  Skill,
  splitString,
  substring,
  toBoolean,
  toInt,
  toLowerCase,
  toSkill,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $modifier,
  $skill,
  $slot,
  AprilingBandHelmet,
  ChestMimic,
  get,
  set,
} from "libram";

import { autoAdvBypass } from "../../auto_adventure";
import { fullness_left } from "../../auto_consume";
import { equipMaximizedGear, possessEquipment } from "../../auto_equipment";
import {
  auto_have_familiar,
  auto_wantFamXP,
  switchToFamXP,
} from "../../auto_familiar";
import { provideResistances } from "../../auto_providers";
import {
  auto_get_campground,
  auto_ignoreExperience,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_runChoice,
  auto_wishForEffectIfNeeded,
  handleTracker,
  internalQuestStatus,
  stat_exp_percent,
  stat_to_substat,
  substat_to_level,
  TrackerKey,
} from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { in_glover } from "../../paths/2018/g_lover";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { in_hattrick } from "../../paths/2025/hattrick";
import { in_zootomist } from "../../paths/2025/zootomist";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import { bridgeGoal, fastenerCount, lumberCount } from "../../quests/level_09";
import { c2t_apron } from "../../utils/c2t_apron";
import {
  auto_get_clan_lounge,
  canJumpToAwayClan,
  changeClan,
  getAwayClanName,
  isInAwayClan,
} from "../other/clan";
import { auto_getCitizenZone$1, auto_haveCincho } from "./mr2023";
import { auto_openMcLargeHugeSkis, beretBusk } from "./mr2025";

// This is meant for items that have a date of 2024
// used in consumeBlackAndWhiteApronKit()
// used in chest mimic

//Defined in autoscend/iotms/mr2024.ash
export function consumeBlackAndWhiteApronKit(): boolean {
  const apronKit: Item = $item`Black and White Apron Meal Kit`;
  if (fullness_left() < 3) {
    return false;
  }
  if (itemAmount(apronKit) < 1) {
    return false;
  }

  if (!gitExists("C2Talon-c2t_apron-master")) {
    abort(
      "script c2t_apron didn't install properly. Fix and run autoscend again.",
    );
  }
  // default ingredient allow list. Allow all but:
  // Potentially quest relevant: Blackberry, Bubblin' crude, enchanted bean
  // Extra cold damage: grapefruit
  // 20ml: dill
  let allowList: string =
    "3489,1356,1560,2525,3490,748,1562,1557,1561,3491,\n1122,1559,2094,183,182,2338,237,787,1004,238,328,1005,2583,1006,589,672,2524,304,6724,\n1462,161,158,358,2589,55,302,332,170,2532,187,357,245,242,4956,830,165,1003,8,786,1558,\n246,4,159,209";
  // allow quest items if no longer needed
  if (
    possessEquipment($item`blackberry galoshes`) ||
    itemAmount($item`blackberry`) > 3
  ) {
    allowList += ",2063";
  }
  const oilProgress: number = get("twinPeakProgress");
  if (
    (oilProgress & 4) === 1 ||
    itemAmount($item`jar of oil`) > 0 ||
    itemAmount($item`bubblin' crude`) > 12
  ) {
    allowList += ",5789";
  }
  if (
    itemAmount($item`enchanted bean`) > 1 ||
    internalQuestStatus("questL10Garbage") >= 1
  ) {
    allowList += ",186";
  }
  set("c2t_apron_allowlist", allowList);
  // consume the apron kit using c2t's script
  // this will default to consuming food for our current mainstat
  // https://github.com/C2Talon/c2t_apron
  return c2t_apron();
}

export function auto_haveSpringShoes(): boolean {
  if (
    auto_is_valid($item`spring shoes`) &&
    availableAmount($item`spring shoes`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_haveAprilingBandHelmet(): boolean {
  if (
    auto_is_valid($item`Apriling band helmet`) &&
    availableAmount($item`Apriling band helmet`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_getAprilingBandItems(): boolean {
  if (!auto_haveAprilingBandHelmet()) {
    return false;
  }
  const have_sax: boolean = availableAmount($item`Apriling band saxophone`) > 0;
  const have_tuba: boolean = availableAmount($item`Apriling band tuba`) > 0;
  const have_picc: boolean = availableAmount($item`Apriling band piccolo`) > 0;
  function instruments_so_far(): number {
    return get("_aprilBandInstruments");
  }
  function track(it: Item): void {
    if (availableAmount(it) > 0) {
      handleTracker({
        what: $item`Apriling band helmet`,
        detail: `Claimed ${it}`,
        property: "auto_iotm_claim",
      });
    }
  }
  if (in_zootomist() && myLevel() < 13) {
    if (!have_picc && instruments_so_far() < 2) {
      cliExecute("aprilband item piccolo");
      track($item`Apriling band piccolo`);
    }
  }
  if (!have_tuba && instruments_so_far() < 2) {
    cliExecute("aprilband item tuba");
    track($item`Apriling band tuba`);
  }
  if (!have_sax && instruments_so_far() < 2) {
    cliExecute("aprilband item saxophone");
    track($item`Apriling band saxophone`);
  }

  return instruments_so_far() === 2;
}

export function auto_playAprilPiccolo(): boolean {
  const f: Familiar = myFamiliar();
  let success: boolean = false;
  if (f !== $familiar.none) {
    const startexp: number = f.experience;
    cliExecute("aprilband play piccolo");
    success = f.experience > startexp;
  }
  const tracker: TrackerKey = in_zootomist()
    ? "auto_tracker_path"
    : "auto_otherstuff";
  handleTracker({
    what: $item`Apriling band piccolo`,
    detail: `${success ? "Played" : "Failed to play"} to ${f}`,
    property: tracker,
  });
  return success;
}

export function auto_playAprilSax(): boolean {
  cliExecute("aprilband play saxophone");
  return toBoolean(haveEffect($effect`Lucky!`));
}

export function auto_playAprilTuba(): boolean {
  cliExecute("aprilband play tuba");
  return get("noncombatForcerActive");
}

export function auto_setAprilBandNonCombat(): boolean {
  if (toBoolean(haveEffect($effect`Apriling Band Patrol Beat`))) {
    return true;
  }
  if (!auto_haveAprilingBandHelmet()) {
    return false;
  }
  cliExecute("aprilband effect nc");
  return toBoolean(haveEffect($effect`Apriling Band Patrol Beat`));
}

export function auto_setAprilBandCombat(): boolean {
  if (toBoolean(haveEffect($effect`Apriling Band Battle Cadence`))) {
    return true;
  }
  if (!auto_haveAprilingBandHelmet() || !AprilingBandHelmet.canChangeSong()) {
    return false;
  }
  cliExecute("aprilband effect c");
  return toBoolean(haveEffect($effect`Apriling Band Battle Cadence`));
}

export function auto_AprilSaxLuckyLeft(): number {
  if (!auto_haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band saxophone`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandSaxophoneUses");
}

export function auto_AprilTubaForcesLeft(): number {
  if (!auto_haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band tuba`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandTubaUses");
}

export function auto_AprilPiccoloBoostsLeft(): number {
  if (!auto_haveAprilingBandHelmet()) {
    return 0;
  }
  if (availableAmount($item`Apriling band piccolo`) === 0) {
    return 0;
  }
  return 3 - get("_aprilBandPiccoloUses");
}

export function auto_haveDarts(): boolean {
  if (
    auto_is_valid($item`Everfull Dart Holster`) &&
    possessEquipment($item`Everfull Dart Holster`)
  ) {
    return true;
  }
  return false;
}

export function dartChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  auto_log_info(`dartChoiceHandler Running choice ${choice}`, "blue");

  let dcchoice: number = 0;
  for (const [idx, str] of options) {
    auto_log_info(`choice ${idx} is ${str}`, "blue");
  }
  for (const perk of ["impress", "better", "targeting", "butt"]) {
    //Ranked as 1. Shorter ELR CD, 2. bullseye chance, 3. Butt Awareness, 4. Everything else
    for (const [idx, str] of options) {
      if (containsText(toLowerCase(str), perk)) {
        dcchoice = idx;
        break;
      }
    }
    if (dcchoice !== 0) {
      break;
    }
  }
  if (dcchoice === 0) {
    //if choice is not set, just choose the 1st option
    dcchoice = 1;
  }
  auto_runChoice(dcchoice);
}

export function dartELRcd(): number {
  let cd: number = 50; // base cd is 50 turns
  const perks: Map<number, string> = new Map(
    splitString(toLowerCase(getProperty("everfullDartPerks")), ",").map(
      (_v, _i) => [_i, _v],
    ),
  );
  for (const perk of perks.keys()) {
    if (containsText(perks.get(perk) ?? "", "impress")) {
      cd -= 10;
    }
  }
  return cd;
}

export function dartSkill(): Skill {
  const curDartboard: Map<number, string> = new Map(
    splitString(toLowerCase(getProperty("_currentDartboard")), ",").map(
      (_v, _i) => [_i, _v],
    ),
  );
  for (const sk of curDartboard.keys()) {
    if (containsText(curDartboard.get(sk) ?? "", "butt")) {
      // get more items
      auto_log_info("Going for the butt", "blue");
      return toSkill(toInt(substring(curDartboard.get(sk) ?? "", 0, 4)));
    } else if (
      containsText(curDartboard.get(sk) ?? "", "torso") ||
      containsText(sk.toString(), "pseudopod")
    ) {
      //get more meat
      auto_log_info("Going for the chest", "blue");
      return toSkill(toInt(substring(curDartboard.get(sk) ?? "", 0, 4)));
    }
  }
  return toSkill(7513); // If there aren't any darts available return the Darts: Throw at %PART1
}

export function dartEleDmg(): boolean {
  const perks: string = toLowerCase(getProperty("everfullDartPerks"));
  if (containsText(perks, "add ")) {
    // Only ele dmg perks have "add " in their perk description so as long as we have 1, we are good
    return true;
  }
  return false;
}

export function auto_haveMayamCalendar(): boolean {
  if (
    !in_lol() &&
    auto_is_valid($item`Mayam Calendar`) &&
    availableAmount($item`Mayam Calendar`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_MayamIsUsed(glyph: string): boolean {
  const used: Map<number, string> = new Map(
    splitString(getProperty("_mayamSymbolsUsed"), ",").map((_v, _i) => [
      _i,
      _v,
    ]),
  );
  for (const [, str] of used) {
    if (glyph === str) {
      return true;
    }
  }
  return false;
}

export function auto_MayamAllUsed(): boolean {
  // mayam is currently fully used if all 3 ring1 symbols have been used
  return (
    auto_MayamIsUsed("yam4") &&
    auto_MayamIsUsed("clock") &&
    auto_MayamIsUsed("explosion")
  );
}

export function auto_MayamClaim(str: string): boolean {
  if (!auto_haveMayamCalendar()) {
    return false;
  }
  const rings: Map<number, string> = new Map(
    splitString(str, " ").map((_v, _i) => [_i, _v]),
  );
  for (const [, s] of rings) {
    if (auto_MayamIsUsed(s)) {
      return false;
    }
  }
  cliExecute(`mayam rings ${str}`);
  handleTracker({
    what: "Mayam Calendar",
    detail: `Claimed ${str}`,
    property: "auto_iotm_claim",
  });
  return true;
}

function auto_MayamClaimStinkBomb(): boolean {
  if (!auto_haveMayamCalendar()) {
    return false;
  }
  if (
    auto_MayamIsUsed("vessel") ||
    auto_MayamIsUsed("yam2") ||
    auto_MayamIsUsed("cheese") ||
    auto_MayamIsUsed("explosion")
  ) {
    return false;
  }
  const it: Item = $item`stuffed yam stinkbomb`;
  const n_start: number = availableAmount(it);
  cliExecute("mayam rings vessel yam cheese explosion");
  if (availableAmount(it) > n_start) {
    handleTracker({
      what: "Mayam Calendar",
      detail: `Claimed ${it}`,
      property: "auto_iotm_claim",
    });
    return true;
  }
  return false;
}

function auto_MayamClaimBelt(): boolean {
  if (!auto_haveMayamCalendar()) {
    return false;
  }
  if (
    auto_MayamIsUsed("yam1") ||
    auto_MayamIsUsed("meat") ||
    auto_MayamIsUsed("eyepatch") ||
    auto_MayamIsUsed("yam4")
  ) {
    return false;
  }
  const it: Item = $item`yamtility belt`;
  const n_start: number = availableAmount(it);
  cliExecute("mayam rings yam meat eyepatch yam");
  if (availableAmount(it) > n_start) {
    handleTracker({
      what: "Mayam Calendar",
      detail: `Claimed ${it}`,
      property: "auto_iotm_claim",
    });
    return true;
  }
  return false;
}

function auto_MayamClaimWhatever(): boolean {
  if (!auto_haveMayamCalendar()) {
    return false;
  }
  let ring1: string = "BAD_VALUE";
  let ring2: string = "BAD_VALUE";
  let ring3: string = "BAD_VALUE";
  let ring4: string = "BAD_VALUE";
  let failure: boolean = false;

  if (!auto_MayamIsUsed("fur") && auto_wantFamXP(300)) {
    ring1 = "fur";
    switchToFamXP(300);
  } else if (!auto_MayamIsUsed("chair") && auto_haveCincho()) {
    ring1 = "chair";
  } else if (!auto_MayamIsUsed("eye")) {
    ring1 = "eye";
  } else if (!auto_MayamIsUsed("vessel")) {
    ring1 = "vessel";
  } else {
    failure = true;
  }

  if (
    !auto_MayamIsUsed("wood") &&
    (lumberCount() < bridgeGoal() || fastenerCount() < bridgeGoal())
  ) {
    ring2 = "wood";
  } else if (!auto_MayamIsUsed("lightning")) {
    ring2 = "lightning";
  } else if (!auto_MayamIsUsed("meat")) {
    ring2 = "meat";
  } else {
    failure = true;
  }

  const going_to_use_mouthwash: boolean =
    myLevel() < 13 && remainingEmbers() >= 2;
  // in LTA one more yam martini is more valuable than +2 res for levelling
  if (going_to_use_mouthwash && !in_lta() && !auto_MayamIsUsed("wall")) {
    ring3 = "wall";
  } else if (!auto_MayamIsUsed("yam3")) {
    ring3 = "yam";
  } else if (!auto_MayamIsUsed("cheese")) {
    ring3 = "cheese";
  } else if (!auto_MayamIsUsed("wall")) {
    ring3 = "wall";
  } else {
    failure = true;
  }

  if (!auto_MayamIsUsed("yam4")) {
    ring4 = "yam";
  } else if (!auto_MayamIsUsed("clock")) {
    ring4 = "clock";
  } else if (!auto_MayamIsUsed("explosion")) {
    ring4 = "explosion";
  } else {
    failure = true;
  }
  if (failure) {
    return false;
  }

  cliExecute(`mayam rings ${ring1} ${ring2} ${ring3} ${ring4}`);
  return true;
}

export function auto_MayamClaimAll(): boolean {
  if (!auto_haveMayamCalendar()) {
    return false;
  }
  if (auto_MayamAllUsed()) {
    return false;
  }
  auto_log_info("Claiming mayam calendar items");
  auto_MayamClaimStinkBomb();
  auto_MayamClaimBelt();

  if (!in_zootomist() || myLevel() >= 13) {
    auto_MayamClaimWhatever();
    auto_MayamClaimWhatever();
    auto_MayamClaimWhatever();
  }
  return true;
}

export function auto_haveRoman(): boolean {
  if (
    auto_is_valid($item`Roman Candelabra`) &&
    possessEquipment($item`Roman Candelabra`)
  ) {
    return true;
  }
  return false;
}

export function auto_haveBatWings(): boolean {
  if (auto_is_valid($item`bat wings`) && possessEquipment($item`bat wings`)) {
    return true;
  }
  return false;
}

export function auto_canLeapBridge(): boolean {
  // bat wings allow for us to leap bridge at 5/6 progress (25 of 30)
  if (!auto_haveBatWings()) {
    return false;
  }
  if (fastenerCount() < 25 || lumberCount() < 25) {
    return false;
  }
  return true;
}

export function auto_swoopsRemaining(): number {
  if (!auto_haveBatWings()) {
    return 0;
  }
  return 11 - get("_batWingsSwoopUsed");
}

export function auto_haveSeptEmberCenser(): boolean {
  if (in_koe()) {
    return false; // shop is inaccessible in Kingdom of Exploathing
  }
  if (
    auto_is_valid($item`Sept-Ember Censer`) &&
    availableAmount($item`Sept-Ember Censer`) > 0
  ) {
    return true;
  }
  return false;
}

function remainingEmbers(): number {
  if (!auto_haveSeptEmberCenser()) {
    return 0;
  }
  if (!get("_septEmberBalanceChecked")) {
    // go to ember shop to check our balance
    use($item`Sept-Ember Censer`);
  }
  return get("availableSeptEmbers");
}

export function auto_goingToMouthwashLevel(): boolean {
  if (!auto_haveSeptEmberCenser()) {
    return false;
  }
  if (auto_ignoreExperience()) {
    return false;
  }
  if (in_glover() || in_bhy() || in_plumber() || in_amw()) {
    return false;
  }
  const disregard_karma: boolean = get("auto_disregardInstantKarma", false);
  // If we have at least 4 embers remaining, don't overlevel, they can be used for something else
  const happy_to_overlevel: boolean = disregard_karma && remainingEmbers() < 4;
  let want_to_mouthwash_level: boolean = myLevel() < 13 || happy_to_overlevel;
  // Even disregarding karma, never level above 15 using mouthwash as a sanity limit
  want_to_mouthwash_level = want_to_mouthwash_level && myLevel() < 15;
  return remainingEmbers() >= 2 && want_to_mouthwash_level;
}

export function auto_buyFromSeptEmberStore(): void {
  if (!auto_haveSeptEmberCenser()) {
    return;
  }
  if (remainingEmbers() === 0) {
    return;
  }
  // mouthwash for leveling
  const mouthwash: Item = $item`Mmm-brr! brand mouthwash`;
  auto_openMcLargeHugeSkis(); // make sure our skis are open for cold res
  for (let imw: number = 0; imw < 3; imw++) {
    // We can use up to 3 mouthwash
    if (auto_goingToMouthwashLevel()) {
      // get as much cold res as possible
      const resGoal: Map<Element, number> = new Map();
      resGoal.set($element`cold`, 100);
      // get cold res. Use noob cave as generic place holder
      // get 1 bembershoot to support mouthwash leveling or general quest help
      const bember: Item = $item`bembershoot`;
      if (
        remainingEmbers() % 2 === 1 &&
        !possessEquipment(bember) &&
        auto_is_valid(bember)
      ) {
        buy($coinmaster`Sept-Ember Censer`, 1, bember);
      }

      provideResistances(resGoal, $location`Noob Cave`, true, true, false);
      equipMaximizedGear();
      // We could have left-hand if our off-hand is strong enough
      const cold_res_from_oh: number = numericModifier(
        equippedItem($slot`off-hand`),
        $modifier`Cold Resistance`,
      );
      // McHugeLarge outfit off-hand is +3 cold res when whole outfit equipped, but not reported by Mafia with above check
      const using_mchugelarge_oh: boolean =
        equippedItem($slot`off-hand`) === $item`McHugeLarge left pole`;
      if (using_mchugelarge_oh || cold_res_from_oh > 2.9) {
        const lefty: Skill = Skill.get("Aug. 13th: Left/Off Hander's Day!");
        if (auto_canUse(lefty) && !get("_aug13Cast")) {
          useSkill(lefty);
        }
      }

      if (expected_level_after_mouthwash() < 13) {
        // use a wish if really need it
        auto_wishForEffectIfNeeded($effect`Fever From the Flavor`);
      }
      if (expected_level_after_mouthwash() < 13) {
        // get Citizen of Outskirts of Cobb's Knob (+4 prismatic res) if we really need it
        auto_getCitizenZone$1("spec");
      }
      if (expected_level_after_mouthwash() < 13) {
        // Beret busk if possible for more cold res
        beretBusk("cold resistance");
      }
      // buy mouthwash and use it
      buy($coinmaster`Sept-Ember Censer`, 1, mouthwash);
      auto_log_debug(
        `Using mouthwash with ${numericModifier($modifier`Cold Resistance`)} cold resistance`,
      );
      use(mouthwash);
    }
  }

  auto_log_debug(
    `Have ${remainingEmbers()} embers(s) to buy from Sept-Ember Censer. Let's spend them!`,
  );
  // get structural ember if can't cross bridge
  let itemConsidering: Item = $item`structural ember`;
  if (
    remainingEmbers() >= 4 &&
    get("chasmBridgeProgress") < bridgeGoal() &&
    !get("_structuralEmberUsed") &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Sept-Ember Censer`, 1, itemConsidering);
    use(itemConsidering);
  }
  // Spend any remaining pairs on Septapus summoning charms
  while (remainingEmbers() >= 2) {
    buy($coinmaster`Sept-Ember Censer`, 1, $item`Septapus summoning charm`);
  }
  // if still have embers, get hat for mp regen
  itemConsidering = $item`hat of remembering`;
  if (
    remainingEmbers() >= 1 &&
    !possessEquipment(itemConsidering) &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Sept-Ember Censer`, 1, itemConsidering);
  }

  return;
}

function expected_mouthwash_main_substat(cold_res: number): number {
  const boost_factor: number = 1 + stat_exp_percent(myPrimestat()) / 100;
  return (boost_factor * 14 * cold_res ** 1.7) / 2;
}

export function expected_level_after_mouthwash(): number {
  return expected_level_after_mouthwash$2(
    1,
    numericModifier($modifier`Cold Resistance`),
  );
}

function expected_level_after_mouthwash$2(
  n_mouthwash: number,
  cold_res: number,
): number {
  const gained_main_substats: number =
    n_mouthwash * expected_mouthwash_main_substat(cold_res);
  const old_main_substats: number = myBasestat(stat_to_substat(myPrimestat()));
  const new_main_substats: number = old_main_substats + gained_main_substats;
  const level: number = substat_to_level(toInt(new_main_substats));
  return level;
}

export function auto_haveTearawayPants(): boolean {
  if (
    auto_is_valid($item`tearaway pants`) &&
    availableAmount($item`tearaway pants`) > 0
  ) {
    return true;
  }
  return false;
}

function auto_haveTakerSpace(): boolean {
  return (
    auto_get_campground().has($item`TakerSpace letter of Marque`) &&
    auto_is_valid($item`TakerSpace letter of Marque`)
  );
}

let $_auto_checkTakerSpace_ts_letter: Item | undefined;

export function auto_checkTakerSpace(): void {
  if (!auto_haveTakerSpace()) {
    return;
  }
  $_auto_checkTakerSpace_ts_letter ??= $item`TakerSpace letter of Marque`;
  if (!get("_takerSpaceSuppliesDelivered")) {
    // visit the workshed to get the supplies
    visitUrl("campground.php?action=workshed");
  }
  // unlock the island if we can (6 turn save)
  if (
    get("lastIslandUnlock") < myAscensions() &&
    itemAmount($item`pirate dinghy`) === 0 &&
    creatableAmount($item`pirate dinghy`) > 0
  ) {
    if (create(1, $item`pirate dinghy`)) {
      handleTracker({
        what: $_auto_checkTakerSpace_ts_letter,
        detail: $item`pirate dinghy`.toString(),
        property: "auto_iotm_claim",
      });
    }
  }
  // deft pirate hook would be worth it but hard for autoscend to use
  // anchor bomb is a free banish but only for 30 turns, if we have Spring Kick we won't use it
  if (
    !(auto_haveSpringShoes() && auto_is_valid$2($skill`Spring Kick`)) &&
    creatableAmount($item`anchor bomb`) > 0
  ) {
    if (create(1, $item`anchor bomb`)) {
      handleTracker({
        what: $_auto_checkTakerSpace_ts_letter,
        detail: $item`anchor bomb`.toString(),
        property: "auto_iotm_claim",
      });
    }
  }
  // goldschlepper is EPIC booze
  let createable: number = creatableAmount(
    $item`tankard of spiced Goldschlepper`,
  );
  if (createable > 0) {
    if (create(1, $item`tankard of spiced Goldschlepper`)) {
      handleTracker({
        what: $_auto_checkTakerSpace_ts_letter,
        detail: $item`tankard of spiced Goldschlepper`.toString(),
        property: "auto_iotm_claim",
      });
    }
  }
  // tankard of spiced rum is awesome booze
  createable = creatableAmount($item`tankard of spiced rum`);
  if (createable > 0) {
    if (create(1, $item`tankard of spiced rum`)) {
      handleTracker({
        what: $_auto_checkTakerSpace_ts_letter,
        detail: $item`tankard of spiced rum`.toString(),
        property: "auto_iotm_claim",
      });
    }
  }
  // cursed Aztec tamale is awesome food, and only uses spices
  createable = creatableAmount($item`cursed Aztec tamale`);
  if (createable > 0) {
    if (create(1, $item`cursed Aztec tamale`)) {
      handleTracker({
        what: $_auto_checkTakerSpace_ts_letter,
        detail: $item`cursed Aztec tamale`.toString(),
        property: "auto_iotm_claim",
      });
    }
  }
}

function auto_haveClanPhotoBoothHere(): boolean {
  return auto_get_clan_lounge().has($item`photo booth sized crate`);
}

function auto_haveClanPhotoBooth(): boolean {
  if (availableAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (!auto_is_valid($item`photo booth sized crate`)) {
    return false;
  }
  if (auto_haveClanPhotoBoothHere()) {
    return true;
  }
  return canJumpToAwayClan(); // away clan has it fully stocked
}

function auto_isClanPhotoBoothItem(it: Item): boolean {
  switch (it) {
    case $item`photo booth supply list`:
    case $item`fake arrow-through-the-head`:
    case $item`fake huge beard`:
    case $item`astronaut helmet`:
    case $item`cheap plastic pipe`:
    case $item`oversized monocle on a stick`:
    case $item`giant bow tie`:
    case $item`feather boa`:
    case $item`Sheriff badge`:
    case $item`Sheriff pistol`:
    case $item`Sheriff moustache`:
      return true;
  }
  return false;
}

function auto_thisClanPhotoBoothHasItem(it: Item): boolean {
  // This should work but it's not implemented by Mafia, sounds like it won't be
  //~ return (auto_get_clan_lounge() contains it)
  // Instead just assume our away clan has everything, everyone else has nothing that needs unlocking
  if (isInAwayClan()) {
    return auto_isClanPhotoBoothItem(it);
  }
  switch (it) {
    case $item`photo booth supply list`:
    case $item`fake arrow-through-the-head`:
    case $item`fake huge beard`:
    case $item`astronaut helmet`:
      return true;
  }
  return false;
}

function auto_thisClanPhotoBoothHasItems(its: Item[]): boolean {
  let success: boolean = true;
  for (const it of its) {
    success = success && auto_thisClanPhotoBoothHasItem(it);
  }
  return false;
}

function auto_clanPhotoboothClaimedEverything(): boolean {
  return (
    get("_photoBoothEquipment") >= 3 &&
    auto_remainingClanPhotoBoothEffects() === 0
  );
}

// Claims a single item, assuming we're already wherever we need to be.
function auto_claimClanPhotoBoothItem(it: Item): boolean {
  if (!auto_isClanPhotoBoothItem(it)) {
    return false;
  }
  if (availableAmount(it) > 0) {
    return true;
  }
  if (auto_clanPhotoboothClaimedEverything()) {
    return false;
  }
  cliExecute(`photobooth item ${it.toString()}`);
  handleTracker({
    what: "Clan Photo Booth",
    detail: `Claimed ${it}`,
    property: "auto_iotm_claim",
  });
  return availableAmount(it) > 0;
}

function auto_remainingClanPhotoBoothEffects(): number {
  if (!auto_haveClanPhotoBooth()) {
    return 0;
  }
  return 3 - get("_photoBoothEffects");
}

// Claims an effect, assuming we're already wherever we need to be.
function auto_claimClanPhotoBoothEffect(
  ef_string: string,
  n_times: number,
): boolean {
  n_times = min(n_times, auto_remainingClanPhotoBoothEffects());
  if (n_times < 1) {
    return false;
  }

  const west_ef: Effect = $effect`Wild and Westy!`;
  const tower_ef: Effect = $effect`Towering Muscles`;
  const space_ef: Effect = $effect`Spaced Out`;
  const west_string: string = toLowerCase(west_ef.toString());
  const tower_string: string = toLowerCase(tower_ef.toString());
  const space_string: string = toLowerCase(space_ef.toString());

  switch (toLowerCase(ef_string)) {
    case "wild":
    case west_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect wild");
        handleTracker({
          what: "Clan Photo Booth",
          detail: `Claimed ${west_ef}`,
          property: "auto_iotm_claim",
        });
      }
      return toBoolean(haveEffect(west_ef));
    case "tower":
    case tower_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect tower");
        handleTracker({
          what: "Clan Photo Booth",
          detail: `Claimed ${tower_ef}`,
          property: "auto_iotm_claim",
        });
      }
      return toBoolean(haveEffect(tower_ef));
    case "space":
    case space_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect space");
        handleTracker({
          what: "Clan Photo Booth",
          detail: `Claimed ${space_ef}`,
          property: "auto_iotm_claim",
        });
      }
      return toBoolean(haveEffect(space_ef));
  }
  auto_log_error(`Invalid effect string for photo booth ${ef_string}`);
  return false;
}

// Claims the default items and the daily "space" effect together
export function auto_getClanPhotoBoothDefaultItems(): boolean {
  if (!auto_haveClanPhotoBooth()) {
    return false;
  }
  let items_to_claim: Item[];
  if (!in_hattrick()) {
    items_to_claim = $items`fake arrow-through-the-head, astronaut helmet, oversized monocle on a stick`;
  } else {
    items_to_claim = $items`feather boa, astronaut helmet, oversized monocle on a stick`;
  }

  if (auto_clanPhotoboothClaimedEverything()) {
    return items_to_claim.every((i) => possessEquipment(i));
  }

  const needAway =
    !auto_haveClanPhotoBoothHere() ||
    !auto_thisClanPhotoBoothHasItems(items_to_claim);

  const origClanId: number = getClanId();

  try {
    if (needAway && !isInAwayClan() && canJumpToAwayClan()) {
      changeClan(getAwayClanName());
    }

    let success: boolean = true;
    for (const it of items_to_claim) {
      success = success && auto_claimClanPhotoBoothItem(it);
    }
    auto_claimClanPhotoBoothEffect("space", 3);
    return success;
  } finally {
    if (getClanId() !== origClanId) {
      changeClan(origClanId);
    }
  }
}

export function auto_haveChestMimic(): boolean {
  if (auto_have_familiar($familiar`Chest Mimic`)) {
    return true;
  }
  return false;
}

function auto_haveMeggEgg(mon: Monster): boolean {
  return ChestMimic.differentiableQuantity(mon) > 0;
}

const mimicFile = `c2t_megg_maxlist.txt`;

function auto_couldMakeMeggEgg(mon: Monster): boolean {
  if (!mon.copyable || mon.boss) return false;

  const buffer = fileToBuffer(mimicFile)
    .split("\n")
    .map((s) => parseInt(s));

  if (buffer.includes(mon.id)) return true;
  if (
    buffer.length > 100 &&
    sessionStorage.getItem(`mimic_checked_${daycount()}`) === "true"
  ) {
    return false;
  }

  for (const newMon of ChestMimic.getReceivableMonsters()) {
    if (buffer.includes(newMon.id)) continue;
    buffer.push(newMon.id);
  }

  bufferToFile(buffer.join("\n"), mimicFile);
  sessionStorage.setItem(`mimic_checked_${daycount()}`, "true");
  return buffer.includes(mon.id);
}

export function auto_meggFight(mon: Monster, speculative: boolean): boolean {
  if (!auto_haveChestMimic()) {
    return false;
  }

  if (speculative) {
    if (
      auto_haveMeggEgg(mon) ||
      ($familiar`Chest Mimic`.experience >= 100 && auto_couldMakeMeggEgg(mon))
    ) {
      return true;
    } else {
      return false;
    }
  }
  if (!auto_haveMeggEgg(mon)) {
    if ($familiar`Chest Mimic`.experience >= 100) {
      ChestMimic.receive(mon);
    } else {
      return false;
    }
  }
  if (!auto_haveMeggEgg(mon)) {
    return false;
  }

  if (speculative) {
    return true;
  }
  // From here adapted from c2t_megg_fight
  const egg: Item = $item`mimic egg`;
  //go
  const page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`,
    false,
    true,
  );
  //choice check
  if (!handlingChoice() || lastChoice() !== 1516) {
    auto_log_error("Couldn't enter choice adventure to fight eggs.");
    return false;
  }
  //check if available
  const monstring: string = mon.id.toString();
  if (!containsText(page, `<option value="${monstring}">`)) {
    visitUrl("main.php", false, true); //don't get stuck in choice
    auto_log_error(`${mon} not found to fight`);
    return false;
  }

  if (
    autoAdvBypass(
      0,
      new Map([
        [0, `inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`],
        [1, `choice.php?pwd&whichchoice=1516&option=1&mid=${monstring}`],
      ]),
    )
  ) {
    handleTracker({
      what: mon,
      detail: $familiar`Chest Mimic`.toString(),
      property: "auto_copies",
    });
    return true;
  }
  return false;
}
