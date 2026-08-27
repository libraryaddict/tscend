import {
  availableAmount,
  buy,
  canInteract,
  ceil,
  cliExecute,
  creatableAmount,
  Effect,
  Element,
  equip,
  equippedItem,
  Familiar,
  floor,
  haveEffect,
  haveEquipped,
  haveSkill,
  itemAmount,
  Location,
  min,
  Modifier,
  myBasestat,
  myBuffedstat,
  myFamiliar,
  myLevel,
  myLocation,
  myMeat,
  numericModifier,
  outfit,
  retrieveItem,
  Stat,
  toBoolean,
  toInt,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $element,
  $familiar,
  $familiars,
  $item,
  $modifier,
  $servant,
  $skill,
  $slot,
  $slots,
  get,
} from "libram";

import { auto_buyUpTo } from "./auto_acquire";
import { buffMaintain$2 } from "./auto_buff";
import {
  auto_autoConsumeOne,
  auto_canDrink,
  auto_canEat,
  autoChew,
  autoDrink,
  autoEat,
  fullness_left,
  inebriety_left,
  shouldUseSpleenForLowPriority,
  spleen_left,
  stomach_left,
} from "./auto_consume";
import {
  autoEquip,
  possessEquipment,
  simMaximize,
  simMaximize$1,
  simMaximizeWith,
  simValue,
} from "./auto_equipment";
import {
  auto_famModifiers,
  auto_famModifiers$2,
  auto_famWeight,
  auto_have_familiar,
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
  lookupFamiliarDatafile,
} from "./auto_familiar";
import { uneffect } from "./auto_restore";
import {
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$3,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_totalEffectWishesAvailable,
  auto_wishForEffect,
  autoCraft,
  candyEggDeviler,
  meatReserve,
  safeGet,
  shrugAT,
} from "./auto_util";
import { zone_needItemBooze, zone_needItemFood } from "./auto_zone";
import { Bjorn$$handleBjornify } from "./iotms/2010/mr2014";
import {
  RethinkingCandy$$rethinkingCandy,
  SourceTerminal$$auto_sourceTerminalEnhance,
  SourceTerminal$$auto_sourceTerminalEnhanceLeft,
} from "./iotms/2010/mr2016";
import {
  AsdonMartin$$asdonBuff,
  AsdonMartin$$canAsdonBuff,
  Horsery$$horseCost,
  Horsery$$horseDark,
  Horsery$$horseMaintain,
  Horsery$$horseNone,
  Horsery$$isHorseryAvailable,
} from "./iotms/2010/mr2017";
import {
  JanuaryTote$$januaryToteAcquire,
  LatteMug$$auto_latteRefill$4,
  Songboom$$songboomSetting,
} from "./iotms/2010/mr2018";
import {
  BeachComb$$auto_beachCombHead,
  BeachComb$$auto_beachCombHeadEffect,
  BeachComb$$auto_canBeachCombHead,
} from "./iotms/2010/mr2019";
import {
  BirdADay$$auto_birdModifier,
  BirdADay$$auto_favoriteBirdModifier,
  PowerfulGlove$$auto_hasPowerfulGlove,
} from "./iotms/2020/mr2020";
import { CandyCane$$auto_haveCCSC } from "./iotms/2020/mr2023";
import {
  AprilingBand$$auto_haveAprilingBandHelmet,
  AprilingBand$$auto_setAprilBandCombat,
  AprilingBand$$auto_setAprilBandNonCombat,
} from "./iotms/2020/mr2024";
import {
  CoolerYeti$$auto_haveCoolerYeti,
  CyberRealm$$auto_haveCyberRealm,
  PrismaticBeret$$beretBusk,
  PrismaticBeret$$canBusk,
} from "./iotms/2020/mr2025";
import { CupOfThirteen$$auto_getDrinkCupOfThirteenForEffect } from "./iotms/2020/mr2026";
import {
  AutoClan$$zataraAvailable,
  AutoClan$$zataraSeaside,
} from "./iotms/other/clan";
import {
  AlliedRadioBackpack$$ARBSupplyDrop,
  AlliedRadioBackpack$$auto_canARBSupplyDrop,
} from "./iotms/other/ttt";
import { in_heavyrains } from "./paths/2014/heavy_rains";
import { isActuallyEd } from "./paths/2015/actually_ed_the_undying";
import {
  bat_formBats,
  bat_formMist,
  bat_formWolf,
  bat_wantHowl,
} from "./paths/2019/dark_gyffte";
import { in_tcrs } from "./paths/2019/two_crazy_random_summer";
import { in_plumber } from "./paths/2020/path_of_the_plumber";
import { in_small } from "./paths/2023/small";
import { in_avantGuard } from "./paths/2024/avant_guard";
import { in_wereprof, is_professor } from "./paths/2024/wereprofessor";
import { in_zootomist } from "./paths/2025/zootomist";
import { amw_canAfford, in_amw } from "./paths/2026/adventurer_meats_world";
import { maximizer } from "./utils/maximizer";

//Defined in autoscend/auto_providers.ash
export function providePlusCombat(
  amt: number,
  loc: Location,
  doEquips: boolean = true,
  speculative: boolean = false,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} positive combat rate, ${doEquips ? "with" : "without"} equipment`,
    "blue",
  );
  //if the fam is important enough to add, it will be caught in preAdvUpdateFamiliar
  if (auto_famModifiers$2("Combat Rate") < 0) {
    useFamiliar($familiar.none);
  }

  const alreadyHave: number = numericModifier($modifier`Combat Rate`);
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough!");
  }

  let delta: number = 0;

  function result$4(): number {
    return numericModifier($modifier`Combat Rate`) + delta;
  }

  if (doEquips) {
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Combat Rate`, 200)
            .max($modifier`Combat Rate`, amt),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Combat Rate`, 200)
        .max($modifier`Combat Rate`, amt);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Combat Rate`) -
      numericModifier($modifier`Combat Rate`);
    auto_log_debug(`With gear we can get to ${result$4()}`);
  }

  function pass$4(): boolean {
    return result$4() >= amt;
  }

  if (pass$4()) {
    return result$4();
  }
  // first lets do stuff that is "free" (as in has no MP cost, item use or can be freely removed/toggled)

  if (haveEffect($effect`Become Superficially interested`) > 0) {
    visitUrl("charsheet.php?pwd=&action=newyouinterest");
    if (pass$4()) {
      return result$4();
    }
  }

  for (const eff of $effects`Driving Stealthily, The Sonata of Sneakiness, In The Darkness`) {
    uneffect(eff);
    if (pass$4()) {
      return result$4();
    }
  }

  if (get("_horsery") === "dark horse") {
    if (!speculative) {
      Horsery$$horseNone();
    }
    delta += -1.0 * numericModifier("Horsery:dark horse", "Combat Rate"); // horsery changes don't happen until pre-adventure so this needs to be manually added otherwise it won't count.
    auto_log_debug(
      `We ${speculative ? "can remove" : "will remove"} Dark Horse, we will have ${result$4()}`,
    );
  } else if (!speculative) {
    Horsery$$horseMaintain();
  }
  if (pass$4()) {
    return result$4();
  }

  function handleEffect$4(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Combat Rate");
      if (
        eff === $effect`Musk of the Moose` &&
        haveEffect($effect`Smooth Movements`) > 0
      ) {
        delta +=
          -1.0 * numericModifier($effect`Smooth Movements`, "Combat Rate"); // numeric_modifier doesn't take into account uneffecting the opposite skill so we have to add it manually.
      }
      if (
        eff === $effect`Carlweather's Cantata of Confrontation` &&
        haveEffect($effect`The Sonata of Sneakiness`) > 0
      ) {
        delta +=
          -1.0 *
          numericModifier($effect`The Sonata of Sneakiness`, "Combat Rate");
      }
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$4()}`,
    );
  }

  function tryEffects$5(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$4(eff);
      }
      if (pass$4()) {
        return true;
      }
    }
    return false;
  }
  // Now handle buffs that cost MP, items or other resources
  // Cheap effects
  if (!speculative) {
    shrugAT($effect`Carlweather's Cantata of Confrontation`);
  }
  if (
    tryEffects$5([
      $effect`Musk of the Moose`,
      $effect`Carlweather's Cantata of Confrontation`,
      $effect`Milk of Familiar Kindness`,
      $effect`Attracting Snakes`,
      $effect`Crunchy Steps`,
      $effect`Blinking Belly`,
      $effect`Song of Battle`,
      $effect`Frown`,
      $effect`Angry`,
      $effect`Screaming!  SCREAMING!  AAAAAAAH!`,
      $effect`Coffeesphere`,
      $effect`Unmuffled`,
    ])
  ) {
    return result$4();
  }

  if (in_amw() && amw_canAfford($skill`Act Jerky`)) {
    // meatpath only
    if (tryEffects$5($effects`Acting Jerky`)) {
      return result$4();
    }
  }
  // Do the April band
  if (AprilingBand$$auto_haveAprilingBandHelmet()) {
    if (!speculative) {
      AprilingBand$$auto_setAprilBandCombat();
    }
    handleEffect$4($effect`Apriling Band Battle Cadence`);
    if (pass$4()) {
      return result$4();
    }
  }
  // More limited effects
  if (
    tryEffects$5([
      $effect`Taunt of Horus`,
      $effect`Patent Aggression`,
      $effect`Lion in Ambush`,
      $effect`Everything Must Go!`,
      $effect`Hippy Stench`,
      $effect`High Colognic`,
      $effect`Celestial Saltiness`,
      $effect`Simply Irresistible`,
      $effect`Crunching Leaves`,
      $effect`Romantically Roused`,
    ])
  ) {
    return result$4();
  }

  if (AsdonMartin$$canAsdonBuff($effect`Driving Obnoxiously`)) {
    if (!speculative) {
      AsdonMartin$$asdonBuff($effect`Driving Obnoxiously`);
    }
    handleEffect$4($effect`Driving Obnoxiously`);
  }

  if (myMeat() > 100 + meatReserve()) {
    tryEffects$5($effects`Waking the Dead`);
  }

  if (pass$4()) {
    return result$4();
  }

  if (!speculative) {
    //Prep for if other +combat familiars are added
    for (const fam of $familiars`Jumpsuited Hound Dog`) {
      if (canChangeToFamiliar(fam)) {
        handleFamiliar$1(fam);
        if (pass$4()) {
          return result$4();
        }
      }
    }
  }

  return result$4();
}

export function providePlusNonCombat(
  amt: number,
  loc: Location = myLocation(),
  doEquips: boolean = true,
  speculative: boolean = false,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} negative combat rate, ${doEquips ? "with" : "without"} equipment`,
    "blue",
  );
  //if the fam is important enough to add, it will be caught in preAdvUpdateFamiliar
  if (auto_famModifiers$2("Combat Rate") > 0) {
    useFamiliar($familiar.none);
  }
  // numeric_modifier will return -combat as a negative value and +combat as a positive value
  // so we will need to invert the return values otherwise this will be wrong (since amt is supposed to be positive).
  const alreadyHave: number = -1.0 * numericModifier($modifier`Combat Rate`);
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough!");
  }

  let delta: number = 0;

  function result$5(): number {
    return -1.0 * numericModifier($modifier`Combat Rate`) + delta;
  }

  if (doEquips) {
    if (speculative) {
      simMaximizeWith((m) =>
        m.weight($modifier`Combat Rate`, -200).max($modifier`Combat Rate`, amt),
      );
    } else {
      maximizer
        .weight($modifier`Combat Rate`, -200)
        .max($modifier`Combat Rate`, amt);
      simMaximize();
    }
    delta =
      -1.0 * simValue($modifier`Combat Rate`) -
      -1.0 * numericModifier($modifier`Combat Rate`);
    auto_log_debug(`With gear we can get to ${result$5()}`);
  }

  function pass$5(): boolean {
    return result$5() >= amt;
  }

  if (pass$5()) {
    return result$5();
  }
  // First let's do the peace turkey, only if we haven't already picked a familiar
  if (!speculative && safeGet("auto_familiarChoice") === $familiar.none) {
    for (const fam of $familiars`Peace Turkey`) {
      if (canChangeToFamiliar(fam)) {
        useFamiliar(fam);
        handleFamiliar$1(fam);
        if (pass$5()) {
          return result$5();
        }
        break;
      }
    }
  }
  // first lets do stuff that is "free" (as in has no MP cost, item use or can be freely removed/toggled)

  if (haveEffect($effect`Become Intensely interested`) > 0) {
    visitUrl("charsheet.php?pwd=&action=newyouinterest");
    if (pass$5()) {
      return result$5();
    }
  }

  for (const eff of $effects`Carlweather's Cantata of Confrontation, Driving Obnoxiously`) {
    uneffect(eff);
    if (pass$5()) {
      return result$5();
    }
  }

  if (
    Horsery$$isHorseryAvailable() &&
    myMeat() > Horsery$$horseCost() &&
    get("_horsery") !== "dark horse"
  ) {
    if (!speculative) {
      Horsery$$horseDark();
    }
    delta += -1.0 * numericModifier("Horsery:dark horse", "Combat Rate"); // horsery changes don't happen until pre-adventure so this needs to be manually added otherwise it won't count.
    auto_log_debug(
      `We ${speculative ? "can gain" : "will gain"} Dark Horse, we will have ${result$5()}`,
    );
  } else if (!speculative) {
    Horsery$$horseMaintain();
  }
  if (pass$5()) {
    return result$5();
  }

  function handleEffect$5(eff: Effect): void {
    if (speculative) {
      delta += -1.0 * numericModifier(eff, "Combat Rate");
      if (
        eff === $effect`Smooth Movements` &&
        haveEffect($effect`Musk of the Moose`) > 0
      ) {
        delta += numericModifier($effect`Musk of the Moose`, "Combat Rate"); // numeric_modifier doesn't take into account uneffecting the opposite skill so we have to add it manually.
      }
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$5()}`,
    );
  }

  function tryEffects$6(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$5(eff);
      }
      if (pass$5()) {
        return true;
      }
    }
    return false;
  }
  // Now handle buffs that cost MP, items or other resources

  if (in_amw() && amw_canAfford($skill`Dark Meat`)) {
    if (tryEffects$6($effects`Darkened Meat`)) {
      return result$5();
    }
  }

  if (!speculative) {
    shrugAT($effect`The Sonata of Sneakiness`);
  }
  if (
    tryEffects$6([
      $effect`Shelter of Shed`,
      $effect`Brooding`,
      $effect`Muffled`,
      $effect`Smooth Movements`,
      $effect`The Sonata of Sneakiness`,
      $effect`Milk of Familiar Cruelty`,
      $effect`Hiding From Seekers`,
      $effect`Ultra-Soft Steps`,
      $effect`Song of Solitude`,
      $effect`Inked Well`,
      $effect`Bent Knees`,
      $effect`Extended Toes`,
      $effect`Ink Cloud`,
      $effect`Cloak of Shadows`,
      $effect`Chocolatesphere`,
      $effect`Disquiet Riot`,
    ])
  ) {
    return result$5();
  }

  if (-1.0 * BirdADay$$auto_birdModifier("Combat Rate") > 0) {
    if (tryEffects$6($effects`Blessing of the Bird`)) {
      return result$5();
    }
  }

  if (-1.0 * BirdADay$$auto_favoriteBirdModifier("Combat Rate") > 0) {
    if (tryEffects$6($effects`Blessing of your favorite Bird`)) {
      return result$5();
    }
  }
  // Do the April band
  if (AprilingBand$$auto_haveAprilingBandHelmet()) {
    if (!speculative) {
      AprilingBand$$auto_setAprilBandNonCombat();
    }
    handleEffect$5($effect`Apriling Band Patrol Beat`);
    if (pass$5()) {
      return result$5();
    }
  }

  if (
    tryEffects$6([
      $effect`Ashen`,
      $effect`Predjudicetidigitation`,
      $effect`Patent Invisibility`,
      $effect`Ministrations in the Dark`,
      $effect`Fresh Scent`,
      $effect`Become Superficially interested`,
      $effect`Gummed Shoes`,
      $effect`Simply Invisible`,
      $effect`Inky Camouflage`,
      $effect`Celestial Camouflage`,
      $effect`Feeling Lonely`,
      $effect`Feeling Sneaky`,
    ])
  ) {
    return result$5();
  }

  if (AsdonMartin$$canAsdonBuff($effect`Driving Stealthily`)) {
    if (!speculative) {
      AsdonMartin$$asdonBuff($effect`Driving Stealthily`);
    }
    handleEffect$5($effect`Driving Stealthily`);
  }
  if (pass$5()) {
    return result$5();
  }
  //blooper ink costs 15 coins without which it will error when trying to buy it, so that is the bare minimum we need to check for
  //However we don't want to waste our early coins on it as they are precious. So require at least 400 coins before buying it.
  if (
    in_plumber() &&
    0 === haveEffect($effect`Blooper Inked`) &&
    itemAmount($item`coin`) > 400
  ) {
    if (!speculative) {
      retrieveItem(1, $item`blooper ink`);
    }
    if (tryEffects$6($effects`Blooper Inked`)) {
      return result$5();
    }
  }
  // Glove charges are a limited per-day resource, lets do this last so we don't waste possible uses of Replace Enemy
  if (
    PowerfulGlove$$auto_hasPowerfulGlove() &&
    tryEffects$6($effects`Invisible Avatar`)
  ) {
    return result$5();
  }
  // If we haven't picked a familiar by now consider the disgeist
  if (!speculative && safeGet("auto_familiarChoice") === $familiar.none) {
    for (const fam of $familiars`Disgeist`) {
      if (canChangeToFamiliar(fam)) {
        useFamiliar(fam);
        handleFamiliar$1(fam);
        if (pass$5()) {
          return result$5();
        }
        break;
      }
    }
  }

  return result$5();
}

export function providePlusNonCombat$1(
  amt: number,
  doEquips: boolean = true,
  speculative: boolean = false,
): number {
  return providePlusNonCombat(amt, myLocation(), doEquips, speculative);
}

export function providePlusNonCombat$2(
  amt: number,
  loc: Location = myLocation(),
  doEquips: boolean = true,
): boolean {
  return providePlusNonCombat(amt, loc, doEquips, false) >= amt;
}

export function providePlusNonCombat$3(
  amt: number,
  doEquips: boolean,
): boolean {
  return providePlusNonCombat$2(amt, myLocation(), doEquips);
}

export function provideInitiative(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} initiative, ${doEquips ? "with" : "without"} equipment`,
    "blue",
  );

  const alreadyHave: number = numericModifier($modifier`Initiative`);
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough!");
  }

  let delta: number = 0;

  function result$1(): number {
    return numericModifier($modifier`Initiative`) + delta;
  }

  if (doEquips) {
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m.weight($modifier`Initiative`, 500).max($modifier`Initiative`, amt),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Initiative`, 500)
        .max($modifier`Initiative`, amt);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Initiative`) - numericModifier($modifier`Initiative`);
    auto_log_debug(`With gear we can get to ${result$1()}`);
  }

  function pass$1(): boolean {
    return result$1() >= amt;
  }

  if (pass$1()) {
    return result$1();
  }

  if (!speculative && doEquips) {
    handleFamiliar("init");
    if (pass$1()) {
      return result$1();
    }
  }

  function handleEffect$1(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Initiative");
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$1()}`,
    );
  }

  function tryEffects$2(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$1(eff);
      }
      if (pass$1()) {
        return true;
      }
    }
    return false;
  }

  if (
    tryEffects$2([
      //organized by %/mp and %. Skills
      $effect`Living Fast`, //100%, 5mp
      $effect`Stretched`, //75%, 10mp
      $effect`Slippery as a Seal`, //+50%, 5mp
      $effect`Cletus's Canticle of Celerity`, //20%, 4mp
      $effect`Springy Fusilli`, //40%, 10mp
      $effect`Soulerskates`, //30%, 25 soulsauce
      $effect`Bone Springs`, //20%, 10mp
      $effect`Walberg's Dim Bulb`, //10%, 5mp
      $effect`Suspicious Gaze`, //10%, 10mp
      $effect`Song of Slowness`, //50%, 100mp
      $effect`Nearly Silent Hunting`, //25%, 50mp
      $effect`Your Fifteen Minutes`, //15%, 50mp
    ])
  ) {
    return result$1();
  }

  if (AsdonMartin$$canAsdonBuff($effect`Driving Quickly`)) {
    if (!speculative) {
      AsdonMartin$$asdonBuff($effect`Driving Quickly`);
    }
    handleEffect$1($effect`Driving Quickly`);
  }
  if (pass$1()) {
    return result$1();
  }

  if (bat_formBats(speculative)) {
    handleEffect$1($effect`Bats Form`);
  }
  if (pass$1()) {
    return result$1();
  }

  if (BirdADay$$auto_birdModifier("Initiative") > 0) {
    if (tryEffects$2($effects`Blessing of the Bird`)) {
      return result$1();
    }
  }

  if (BirdADay$$auto_favoriteBirdModifier("Initiative") > 0) {
    if (tryEffects$2($effects`Blessing of your favorite Bird`)) {
      return result$1();
    }
  }

  if (
    doEquips &&
    auto_have_familiar($familiar`Grim Brother`) &&
    haveEffect($effect`Soles of Glass`) === 0 &&
    get("_grimBuff") === false
  ) {
    if (!speculative) {
      // We must visit the familiar's page before we can select the choice.
      auto_log_debug("Attempting to visit Grim brother");
      visitUrl("familiar.php?action=chatgrim&pwd", true);
      auto_log_debug("Attempting to select Soles of Glass");
      visitUrl("choice.php?pwd&whichchoice=835&option=1", true);
    }

    handleEffect$1($effect`Soles of Glass`);
    if (pass$1()) {
      return result$1();
    }
  }

  let ef_to_try: Effect[] = [
    //organized by %/turn and %. Items
    $effect`Clear Ears, Can't Lose`, //100%, 80 turns
    $effect`Poppy Performance`, //100%, 30 turns
    $effect`Patent Alacrity`, //100%, 20 turns
    $effect`Fishy, Oily`, //60%, 40 turns
    $effect`Alacri Tea`, //50%, 30 turns
    $effect`Adorable Lookout`, //30%, 10 turns
    $effect`All Fired Up`, //30%, 10 turns
    $effect`Ticking Clock`, //30%, 10 turns
    $effect`Well-Swabbed Ear`, //30%, 10 turns
    $effect`Human-Insect Hybrid`, //25%, 30 turns
    $effect`Sepia Tan`, //20%, 25 turns
    $effect`The Glistening`, //20%, 15 turns
    $effect`Sugar Rush`, //20%, 1-15 turns
  ]; // eff_to_try
  if (tryEffects$2(ef_to_try)) {
    return result$1();
  }

  if (canInteract()) {
    // Not worth making in HC
    ef_to_try = $effects`Provocative Perkiness`;
    if (tryEffects$2(ef_to_try)) {
      return result$1();
    }
  }

  if (
    SourceTerminal$$auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect($effect`init.enh`) === 0 &&
    auto_is_valid$3($effect`init.enh`)
  ) {
    if (!speculative) {
      SourceTerminal$$auto_sourceTerminalEnhance("init");
    }
    handleEffect$1($effect`init.enh`);
    if (pass$1()) {
      return result$1();
    }
  }

  if (doEquips && BeachComb$$auto_canBeachCombHead("init")) {
    if (!speculative) {
      BeachComb$$auto_beachCombHead("init");
    }
    handleEffect$1(BeachComb$$auto_beachCombHeadEffect("init"));
    if (pass$1()) {
      return result$1();
    }
  }

  if (
    doEquips &&
    CandyCane$$auto_haveCCSC() &&
    haveEffect($effect`Peppermint Rush`) === 0 &&
    !get("_candyCaneSwordLyle")
  ) {
    if (!speculative) {
      equip($item`candy cane sword cane`);
      visitUrl("place.php?whichplace=monorail&action=monorail_lyle");
    }
    handleEffect$1($effect`Peppermint Rush`);
    if (pass$1()) {
      return result$1();
    }
  }

  if (doEquips && amt >= 400) {
    if (
      !get("_bowleggedSwaggerUsed") &&
      buffMaintain$2($effect`Bow-Legged Swagger`, 0, 1, 1, speculative)
    ) {
      if (speculative) {
        delta += delta + numericModifier($modifier`Initiative`);
      }
      auto_log_debug(
        `With Bow-Legged Swagger we ${speculative ? "can get to" : "now have"} ${result$1()}`,
      );
    }
    if (pass$1()) {
      return result$1();
    }
  }

  return result$1();
}

export function provideInitiative$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return provideInitiative(amt, loc, doEquips, false) >= amt;
}

export function provideResistances(
  amt: Map<Element, number>,
  loc: Location,
  doEquips: boolean,
  doAll: boolean,
  speculative: boolean,
): Map<Element, number> {
  let debugprint_1: string = "Trying to provide ";
  for (const [ele, goal] of amt) {
    debugprint_1 += goal.toString();
    debugprint_1 += " ";
    debugprint_1 += ele.toString();
    debugprint_1 += " resistance, ";
  }
  debugprint_1 += doEquips ? "with equipment" : "without equipment";
  debugprint_1 += doAll ? " and everything else like spleen." : "";
  auto_log_info(debugprint_1, "blue");

  if ((amt.get($element`stench`) ?? 0) > 0) {
    uneffect($effect`Flared Nostrils`);
  }

  const gearLoss: Map<Element, number> = new Map();
  if (!doEquips) {
    //trying to provide without equipment also means trying to reach goal without value provided by current equipment
    //currently equipment is not being locked and may be changed in pre adv after the provider returns success
    //so may need to take into account removal of what is provided by current equipment to compensate
    //must reduce the result (not raise goal value) since other functions look at the result
    let unequipsString: string = "";
    for (const sl of $slots`hat, weapon, off-hand, back, shirt, pants, acc1, acc2, acc3, familiar`) {
      //simulate removing all gear regardless of individual res modifiers, must account for familiar weight or outfit bonus
      if (equippedItem(sl) !== $item.none) {
        unequipsString += `unequip ${sl}; `;
      }
    }
    if (unequipsString !== "") {
      cliExecute(`speculate quiet; ${unequipsString}`);
      for (const ele of amt.keys()) {
        //record the amount that would be lost to modify the result with
        gearLoss.set(
          ele,
          toInt(
            min(
              0,
              simValue(Modifier.get(`${ele} Resistance`)) -
                numericModifier(Modifier.get(`${ele} Resistance`)),
            ),
          ),
        );
      }
    }
  }

  const delta: Map<Element, number> = new Map();

  function result$6(ele: Element): number {
    return toInt(
      numericModifier(`${ele} Resistance`) +
        (delta.get(ele) ?? 0) +
        (gearLoss.get(ele) ?? 0),
    );
  }

  function result$7(): Map<Element, number> {
    const res: Map<Element, number> = new Map();
    for (const ele of amt.keys()) {
      res.set(ele, result$6(ele));
    }
    return res;
  }

  function resultstring(): string {
    let s: string = "";
    for (const ele of amt.keys()) {
      if (s !== "") {
        s += ", ";
      }
      s += `${result$6(ele)} ${ele.toString()} resistance`;
    }
    return s;
  }

  function handleEffect$6(eff: Effect): void {
    if (speculative) {
      for (const ele of amt.keys()) {
        delta.set(
          ele,
          (delta.get(ele) ?? 0) +
            toInt(numericModifier(eff, `${ele} Resistance`)),
        );
      }
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${resultstring()}`,
    );
  }

  function pass$6(ele: Element): boolean {
    return result$6(ele) >= (amt.get(ele) ?? 0);
  }

  function pass$7(): boolean {
    for (const ele of amt.keys()) {
      if (!pass$6(ele)) {
        return false;
      }
    }
    if (
      canChangeFamiliar() &&
      $familiars`Trick-or-Treating Tot, Mu, Exotic Parrot, Cooler Yeti`.includes(
        myFamiliar(),
      )
    ) {
      // if we pass while having a resist familiar equipped, make sure we keep it equipped
      // otherwise we may end up flip-flopping from the resist familiar and something else
      // which could cost us adventures if switching familiars affects our resistances enough
      handleFamiliar$1(myFamiliar());
    }
    return true;
  }

  if (doEquips) {
    if (speculative) {
      simMaximizeWith((m) => {
        for (const [ele, goal] of amt) {
          m.weight(Modifier.get(`${ele} resistance`), 2000).max(
            Modifier.get(`${ele} resistance`),
            goal,
          );
        }
      }, loc);
    } else {
      for (const [ele, goal] of amt) {
        maximizer
          .weight(Modifier.get(`${ele} resistance`), 2000)
          .max(Modifier.get(`${ele} resistance`), goal);
      }
      simMaximize$1(loc);
    }
    for (const ele of amt.keys()) {
      delta.set(
        ele,
        toInt(
          simValue(Modifier.get(`${ele} Resistance`)) -
            numericModifier(Modifier.get(`${ele} Resistance`)),
        ),
      );
    }
    auto_log_debug(`With gear we can get to ${resultstring()}`);
  }

  if (pass$7()) {
    return result$7();
  }

  function tryEffects$7(effects: Effect[]): boolean {
    for (const eff of effects) {
      let effectMatters: boolean = false;
      for (const ele of amt.keys()) {
        if (!pass$6(ele) && numericModifier(eff, `${ele} Resistance`) > 0) {
          effectMatters = true;
        }
      }
      if (!effectMatters) {
        continue;
      }
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$6(eff);
      }
      if (pass$7()) {
        return true;
      }
    }
    return false;
  }
  // effects from skills
  if (
    tryEffects$7([
      $effect`Elemental Saucesphere`,
      $effect`Astral Shell`,
      $effect`Hide of Sobek`,
      $effect`Spectral Awareness`,
      $effect`Scariersauce`,
      $effect`Scarysauce`,
      $effect`Blessing of the Bird`,
      $effect`Blessing of your favorite Bird`,
      $effect`Feeling Peaceful`,
      $effect`Shifted Reality`,
    ])
  ) {
    return result$7();
  }

  if (bat_formMist(speculative)) {
    handleEffect$6($effect`Mist Form`);
  }
  if (pass$7()) {
    return result$7();
  }

  if (doEquips && canChangeFamiliar()) {
    let resfam: Familiar = $familiar.none;
    for (const fam of $familiars`Trick-or-Treating Tot, Mu, Exotic Parrot`) {
      if (auto_have_familiar(fam)) {
        resfam = fam;
        break;
      }
    }
    if (resfam !== $familiar.none) {
      //Buff fam weight early
      buffMaintain$2($effect`Leash of Linguini`);
      buffMaintain$2($effect`Thoughtful Empathy`);
      buffMaintain$2($effect`Empathy`);
      buffMaintain$2($effect`Blood Bond`);
      buffMaintain$2($effect`Only Dogs Love a Drunken Sailor`);
      buffMaintain$2($effect`Best Pals`);
      //Manual override for the resfam to be the Cooler Yeti when we ONLY want Cold Resistance and it is better than what we already chose from one of the multi-res fams
      if (
        CoolerYeti$$auto_haveCoolerYeti() &&
        amt.size === 1 &&
        (amt.get($element`cold`) ?? 0) > 0
      ) {
        if (
          ((resfam === $familiar`Mu` || resfam === $familiar`Exotic Parrot`) &&
            floor((auto_famWeight(resfam) - 5) / 20 + 1) <
              floor(auto_famWeight($familiar`Cooler Yeti`) / 11)) ||
          5 < floor(auto_famWeight($familiar`Cooler Yeti`) / 11)
        ) {
          resfam = $familiar`Cooler Yeti`;
        }
      }
      // need to use now so maximizer will see it
      useFamiliar(resfam);
      if (resfam === $familiar`Trick-or-Treating Tot`) {
        cliExecute("acquire 1 li'l candy corn costume");
      }
      // update maximizer scores with familiar
      simMaximize$1(loc);
      for (const ele of amt.keys()) {
        delta.set(
          ele,
          toInt(
            simValue(Modifier.get(`${ele} Resistance`)) -
              numericModifier(Modifier.get(`${ele} Resistance`)),
          ),
        );
      }
    }
    if (pass$7()) {
      return result$7();
    }
  }

  if (doEquips) {
    // effects from items that we'd have to buy or have found, organized by cost per res/all res as of 8/2/25
    if (
      tryEffects$7([
        $effect`Minor Invulnerability`, //+3 all res, 5 meat/adv, 33 meat/res, 6.7 meat/all res
        $effect`Incredibly Healthy`, //+3 all res, 78.6 meat/adv, 131 meat/res, 26.2 meat/all res
        $effect`Oiled-Up`, //+2 all res, 14.6 meat/adv, 196 meat/res, 29.2 meat/all res
        $effect`Well-Oiled`, //+1 all res, 78.6 meat/adv, 393 meat/res, 78.6 meat/all res
        $effect`Red Door Syndrome`, //+2 all res, 100 meat/adv, 500 meat/res, 100 meat/all res
        $effect`Covered in the Rainbow`, //+2 all res, 15 meat/adv, 600 meat/res, 120 meat/all res
        $effect`Egged On`, //+3 all res, 625 meat/adv, 2083 meat/res, 417 meat/all res
        $effect`Flame-Retardant Trousers`, //+1 hot res, 20 meat/adv, 100 meat/res
        $effect`Fireproof Lips`, //+9 hot res, 1100 meat/adv, 1222 meat/res
        $effect`Insulated Trousers`, //+1 cold res, 20 meat/adv, 100 meat/res
        $effect`Fever From the Flavor`, //+9 cold res, 1774 meat/adv, 1971 meat/res
        $effect`Neutered Nostrils`, //+2 stench res, 10 meat/adv, 50 meat/res
        $effect`Smelly Pants`, //+1 stench res, 20 meat/adv, 100 meat/res
        $effect`Temporarily Filtered`, //+5 stench res, 91.25 meat/adv, 365 meat/res
        $effect`Twangy`, //+4 stench/sleaze res, 70 meat/adv, 525 meat/res, 263 meat/both res
        $effect`Can't Smell Nothin'`, //+9 stench res, 1000 meat/adv, 1111 meat/res
        $effect`Balls of Ectoplasm`, //+1 spooky res, 10 meat/adv, 100 meat/res
        $effect`Spookypants`, //+1 spooky res, 20 meat/adv, 100 meat/res
        $effect`Hyphemariffic`, //+9 spooky res, 1717 meat/adv, 1907 meat/res
        $effect`Gritty`, //+3 spooky res, 490 meat/adv, 3266 meat/res
        $effect`Sleaze-Resistant Trousers`, //+1 sleaze res, 20 meat/adv, 100 meat/res
        $effect`Hyperoffended`, //+9 sleaze res, 1391 meat/adv, 1545 meat/res
        $effect`Too Shamed`, //+3 sleaze res, 425 meat/adv, 2833 meat/res
      ])
    ) {
      return result$7();
    }
  }

  if (doAll) {
    if (shouldUseSpleenForLowPriority() && CyberRealm$$auto_haveCyberRealm()) {
      if (tryEffects$7($effects`Cyber Resist x2000`)) {
        return result$7();
      }
    }
    if (
      tryEffects$7([
        $effect`Wildsun Boon`, //+3 all res, 100 advs, 1/day
      ])
    ) {
      return result$7();
    }
  }

  return result$7();
}

function provideResistances$2(
  amt: Map<Element, number>,
  doEquips: boolean,
  doAll: boolean,
  speculative: boolean,
): Map<Element, number> {
  return provideResistances(amt, myLocation(), doEquips, doAll, speculative);
}

export function provideResistances$4(
  amt: Map<Element, number>,
  loc: Location,
  doEquips: boolean,
): boolean {
  const res: Map<Element, number> = provideResistances$2(
    amt,
    doEquips,
    false,
    false,
  );
  for (const [ele, i] of amt) {
    if ((res.get(ele) ?? 0) < i) {
      return false;
    }
  }
  return true;
}

function provideStats(
  amt: Map<Stat, number>,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): Map<Stat, number> {
  let debugprint_1: string = "Trying to provide ";
  for (const [st, goal] of amt) {
    debugprint_1 += goal.toString();
    debugprint_1 += " ";
    debugprint_1 += st.toString();
    debugprint_1 += ", ";
  }
  debugprint_1 += doEquips ? "with equipment" : "without equipment";
  auto_log_info(debugprint_1, "blue");

  const delta: Map<Stat, number> = new Map();

  function result$8(st: Stat): number {
    return myBuffedstat(st) + (delta.get(st) ?? 0.0);
  }

  function result$9(): Map<Stat, number> {
    const res: Map<Stat, number> = new Map();
    for (const st of amt.keys()) {
      res.set(st, result$8(st));
    }
    return res;
  }

  function resultstring$1(): string {
    let s: string = "";
    for (const st of amt.keys()) {
      if (s !== "") {
        s += ", ";
      }
      s += `${result$8(st)} ${st.toString()}`;
    }
    return s;
  }

  function handleEffect$7(eff: Effect): void {
    if (speculative) {
      for (const st of amt.keys()) {
        delta.set(
          st,
          (delta.get(st) ?? 0.0) +
            numericModifier(eff.toString(), st.toString()),
        );
        delta.set(
          st,
          (delta.get(st) ?? 0.0) +
            (numericModifier(eff, `${st} Percent`) * myBasestat(st)) / 100.0,
        );
      }
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${resultstring$1()}`,
    );
  }

  function pass$8(st: Stat): boolean {
    return result$8(st) >= (amt.get(st) ?? 0);
  }

  function pass$9(): boolean {
    for (const st of amt.keys()) {
      if (!pass$8(st)) {
        return false;
      }
    }
    return true;
  }

  if (doEquips) {
    if (speculative) {
      simMaximizeWith((m) => {
        for (const [st, goal] of amt) {
          m.weight(Modifier.get(st.toString()), 200).max(
            Modifier.get(st.toString()),
            goal,
          );
        }
      }, loc);
    } else {
      for (const [st, goal] of amt) {
        maximizer
          .weight(Modifier.get(st.toString()), 200)
          .max(Modifier.get(st.toString()), goal);
      }
      simMaximize$1(loc);
    }
    for (const st of amt.keys()) {
      delta.set(st, simValue(Modifier.get(`Buffed ${st}`)) - myBuffedstat(st));
    }
    auto_log_debug(`With gear we can get to ${resultstring$1()}`);
  }

  if (pass$9()) {
    return result$9();
  }

  function tryEffects$8(effects: Effect[]): boolean {
    for (const eff of effects) {
      let effectMatters: boolean = false;
      for (const st of amt.keys()) {
        if (
          !pass$8(st) &&
          (numericModifier(eff.toString(), st.toString()) > 0 ||
            numericModifier(eff, `${st} Percent`) > 0)
        ) {
          effectMatters = true;
        }
      }
      if (!effectMatters) {
        continue;
      }
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$7(eff);
      }
      if (pass$9()) {
        return true;
      }
    }
    return false;
  }

  if (
    tryEffects$8([
      // muscle effects
      $effect`Juiced and Loose`, //+50% mus. nuclear autumn only. 3 MP/adv
      $effect`Quiet Determination`, //+25% mus. facial expression. 1 MP/adv
      $effect`Rage of the Reindeer`, //+10% mus. +10 weapon dmg. 1 MP/adv
      $effect`Strength of the Tortoise`, //+10 mus. 0.2 MP/adv.
      $effect`Disco over Matter`, //+10 mus. 0.2 MP/adv.
      $effect`Power Ballad of the Arrowsmith`, //+10 mus. +20 maxHP. song. 5 MP (duration varies).
      $effect`Seal Clubbing Frenzy`, //+2 mus. 0.2 MP/adv
      $effect`Patience of the Tortoise`, //+1 mus. +3 maxHP. 0.2 MP/adv
      // myst effects
      $effect`Mind Vision`, //+50% mys. nuclear autumn only. 3 MP/adv
      $effect`Quiet Judgement`, //+25% mys. facial expression. 1 MP/adv
      $effect`Tubes of Universal Meat`, //+10 mys. 0.2 MP/adv.
      $effect`Mariachi Moisture`, //+10 mus. 0.2 MP/adv.
      $effect`The Magical Mojomuscular Melody`, //+10 mys. +20 maxMP. song. 3 MP (duration varies).
      $effect`Pasta Oneness`, //+2 mys. 0.2 MP/adv
      $effect`Saucemastery`, //+1 mys. +3 maxMP. 0.2 MP/adv
      // moxie effects
      $effect`Impeccable Coiffure`, //+50% mox. nuclear autumn only. 3 MP/adv
      $effect`Song of Bravado`, //+15% all. NOT a song. 10 MP/adv
      $effect`Slippery as a Seal`, //+10 mox. 0.2 MP/adv.
      $effect`Lubricating Sauce`, //+10 mox. 0.2 MP/adv.
      $effect`The Moxious Madrigal`, //+10 mox. song. 2 MP (duration varies).
      $effect`Disco State of Mind`, //+2 mox. 0.2 MP/adv
      $effect`Mariachi Mood`, //+1 mox. +3 maxHP. 0.2 MP/adv
      // all-stat effects
      $effect`Cheerled`, //+50% all. Class=Pig Skinner
      $effect`Big`, //+20% all. 1.5 MP/adv
      $effect`Song of Bravado`, //+15% all. NOT a song. 10 MP/adv
      $effect`Stevedave's Shanty of Superiority`, //+10% all. song. 30 MP (duration varies).
      $effect`Ultraheart`, //+50% all, heartstone, 5/day.
      // varying effects
      $effect`Blessing of the Bird`,
      $effect`Blessing of your favorite Bird`,
      $effect`Feeling Excited`,
    ])
  ) {
    return result$9();
  }

  if (auto_have_skill($skill`Quiet Desperation`)) {
    //+25% mox. facial expression. 1 MP/adv
    tryEffects$8($effects`Quiet Desperation`);
  } else {
    //+10 mox. facial expression. 1 MP/adv
    tryEffects$8($effects`Disco Smirk`);
  }

  if (pass$9()) {
    return result$9();
  }
  // buffs from items
  if (doEquips) {
    if (
      tryEffects$8([
        // muscle effects
        $effect`Browbeaten`,
        $effect`Extra Backbone`,
        $effect`Extreme Muscle Relaxation`,
        $effect`Faboooo`,
        $effect`Feroci Tea`,
        $effect`Fishy Fortification`,
        $effect`Football Eyes`,
        $effect`Go Get 'Em, Tiger!`,
        $effect`Lycanthropy, Eh?`,
        $effect`Marinated`,
        $effect`Phorcefullness`,
        $effect`Rainy Soul Miasma`,
        $effect`Savage Beast Inside`,
        $effect`Steroid Boost`,
        $effect`Spiky Hair`,
        $effect`Sugar Rush`,
        $effect`Superheroic`,
        $effect`Temporary Lycanthropy`,
        $effect`Truly Gritty`,
        $effect`Vital`,
        $effect`Woad Warrior`,
        // myst effects
        $effect`Up To 11`,
        $effect`Baconstoned`,
        $effect`Erudite`,
        $effect`Far Out`,
        $effect`Glittering Eyelashes`,
        $effect`Liquidy Smoky`,
        $effect`Marinated`,
        $effect`Mystically Oiled`,
        $effect`OMG WTF`,
        $effect`Paging Betty`,
        $effect`Rainy Soul Miasma`,
        $effect`Ready to Snap`,
        $effect`Rosewater Mark`,
        $effect`Seeing Colors`,
        $effect`Sweet, Nuts`,
        // moxie effects
        $effect`Almost Cool`,
        $effect`Bandersnatched`,
        $effect`Busy Bein' Delicious`,
        $effect`Butt-Rock Hair`,
        $effect`Funky Coal Patina`,
        $effect`Liquidy Smoky`,
        $effect`Locks Like the Raven`,
        $effect`Lycanthropy, Eh?`,
        $effect`Memories of Puppy Love`,
        $effect`Newt Gets In Your Eyes`,
        $effect`Notably Lovely`,
        $effect`Oiled Skin`,
        $effect`Radiating Black Body™`,
        $effect`Spiky Hair`,
        $effect`Sugar Rush`,
        $effect`Superhuman Sarcasm`,
        $effect`Unrunnable Face`,
        $effect`Gaffe Free`,
        $effect`Poppy Performance`,
        // all-stat effects
        $effect`Confidence of the Votive`,
        $effect`Pyrite Pride`,
        $effect`Human-Human Hybrid`,
        $effect`Industrial Strength Starch`,
        $effect`Mutated`,
        $effect`Seriously Mutated`,
        $effect`Pill Power`,
        $effect`Slightly Larger Than Usual`,
        $effect`Standard Issue Bravery`,
        $effect`Tomato Power`,
        $effect`Vital`,
        $effect`Triple-Sized`,
      ])
    ) {
      return result$9();
    }

    for (const st of amt.keys()) {
      if (!pass$8(st) && BeachComb$$auto_canBeachCombHead(st.toString())) {
        if (!speculative) {
          BeachComb$$auto_beachCombHead(st.toString());
        }
        handleEffect$7(BeachComb$$auto_beachCombHeadEffect(st.toString()));
      }
    }
    if (pass$9()) {
      return result$9();
    }
  }

  return result$9();
}

function provideStats$1(
  amt: Map<Stat, number>,
  doEquips: boolean,
  speculative: boolean,
): Map<Stat, number> {
  return provideStats(amt, myLocation(), doEquips, speculative);
}

export function provideStats$2(
  amt: Map<Stat, number>,
  loc: Location,
  doEquips: boolean,
): boolean {
  const res: Map<Stat, number> = provideStats$1(amt, doEquips, false);
  for (const [st, i] of amt) {
    if ((res.get(st) ?? 0.0) < i) {
      return false;
    }
  }
  return true;
}

function provideMeat(
  amt: number,
  loc: Location,
  doEverything: boolean,
  speculative: boolean,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} meat, ${doEverything ? "with" : "without"} equipment, familiar, and limited buffs`,
    "blue",
  );
  const alreadyHave: number = numericModifier($modifier`Meat Drop`);
  const need: number = amt - alreadyHave;
  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough +meat!");
    return alreadyHave;
  }
  let delta: number = 0;
  function result$3(): number {
    return numericModifier($modifier`Meat Drop`) + delta;
  }
  function pass$3(): boolean {
    return result$3() >= amt;
  }
  if (pass$3()) {
    return result$3();
  }
  // don't craft equipment here. See how much +meat we can get with gear on hand
  if (doEverything) {
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Meat Drop`, 500)
            .max($modifier`Meat Drop`, amt + 100),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Meat Drop`, 500)
        .max($modifier`Meat Drop`, amt + 100);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Meat Drop`) - numericModifier($modifier`Meat Drop`);
    auto_log_debug(`With existing gear we can get to ${result$3()}`);
    if (pass$3()) {
      return result$3();
    }
  }
  //see how much familiar will help
  if (doEverything && canChangeFamiliar()) {
    if (!speculative) {
      handleFamiliar("meat");
    }
    // fam isn't equipped immediatly even if we aren't speculating
    // so add bonus from fam regardless of speculation
    const target: Familiar = lookupFamiliarDatafile("meat");
    if (target !== $familiar.none && target !== myFamiliar()) {
      delta += auto_famModifiers(target, "Meat Drop", $item.none);
      auto_log_debug(
        `With using familiar: ${target} we can get to ${result$3()}`,
      );
    } else {
      auto_log_debug(`Already have desired familar, ${target}, active.`);
    }
    if (pass$3()) {
      return result$3();
    }
  }
  function handleEffect$3(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Meat Drop");
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$3()}`,
    );
  }
  function tryEffects$4(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$3(eff);
      }
      if (pass$3()) {
        return true;
      }
    }
    return false;
  }
  // unlimited skills
  if (
    tryEffects$4([
      $effect`Polka of Plenty`, //50% meat
      $effect`Disco Leer`, //10% meat
    ])
  ) {
    if (pass$3()) {
      return result$3();
    }
  }
  if (AsdonMartin$$canAsdonBuff($effect`Driving Observantly`)) {
    //50% meat, 50% item, 50% booze drops
    if (!speculative) {
      AsdonMartin$$asdonBuff($effect`Driving Observantly`);
    }
    handleEffect$3($effect`Driving Observantly`);
  }
  if (pass$3()) {
    return result$3();
  }
  if (PrismaticBeret$$canBusk()) {
    PrismaticBeret$$beretBusk("meat drop");
  }
  if (pass$3()) {
    return result$3();
  }
  if (bat_formWolf(speculative)) {
    //150% meat, 150% muscle
    handleEffect$3($effect`Wolf Form`);
  }
  if (pass$3()) {
    return result$3();
  }
  if (BirdADay$$auto_birdModifier("Meat Drop") > 0) {
    //Can be 20/40/60/80/100% meat drop
    if (tryEffects$4($effects`Blessing of the Bird`)) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (BirdADay$$auto_favoriteBirdModifier("Meat Drop") > 0) {
    //Can be 20/40/60/80/100% meat drop
    if (tryEffects$4($effects`Blessing of your favorite Bird`)) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (isActuallyEd()) {
    //50% meat drop
    if (
      !haveSkill($skill`Gift of the Maid`) &&
      $servant`Maid`.experience >= 441
    ) {
      visitUrl("charsheet.php");
      if (haveSkill($skill`Gift of the Maid`)) {
        auto_log_warning(
          "Gift of the Maid not properly detected until charsheet refresh.",
          "red",
        );
      }
    }
    if (
      tryEffects$4([
        $effect`Purr of the Feline`, //makes the maid 5 levels higher
      ])
    ) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  Songboom$$songboomSetting("meat"); //30% meat
  // items
  let ef_to_try: Effect[] = [
    $effect`Flapper Dancin'`, //100% meat
    $effect`Heightened Senses`, //50% meat, 25% item drop
    $effect`Big Meat Big Prizes`, //50% meat
    $effect`Human-Constellation Hybrid`, //50% meat
    $effect`Patent Avarice`, //50% meat
    $effect`Earning Interest`, //50% meat
    $effect`Bet Your Autumn Dollar`, //50% meat
    $effect`The Grass...  Is Blue...`, //40% meat, 20% item
    $effect`Sweat Equity`, //40% meat
    $effect`Greedy Resolve`, //30% meat
    $effect`Tubes of Universal Meat`, //30% meat
    $effect`Worth Your Salt`, //25% meat, max hp +25
    $effect`Human-Fish Hybrid`, //10 fam
    $effect`Human-Humanoid Hybrid`, //20% meat, 10% all stats
    $effect`Heart of Pink`, //20% meat, +3 all stats
    $effect`Kindly Resolve`, //5 fam weight
    $effect`Human-Machine Hybrid`, //5 fam weight, DA +50, DR 5
    $effect`Only Dogs Love a Drunken Sailor`, //5 fam weight, rivalrous with item drop
    $effect`Sweet Heart`, // Muscle +X, +2X% meat
    $effect`So You Can Work More...`, //10% meat
  ]; // ef_to_try

  if (tryEffects$4(ef_to_try)) {
    if (pass$3()) {
      return result$3();
    }
  }

  if (canInteract()) {
    // Not worth making in HC
    ef_to_try = $effects`Cranberry Cordiality`;
    if (tryEffects$4(ef_to_try)) {
      if (pass$3()) {
        return result$3();
      }
    }
  }

  if (haveEffect($effect`Synthesis: Greed`) === 0) {
    RethinkingCandy$$rethinkingCandy($effect`Synthesis: Greed`); //300% meat
    if (pass$3()) {
      return result$3();
    }
  }
  if (
    availableAmount($item`li'l pirate costume`) > 0 &&
    canChangeToFamiliar($familiar`Trick-or-Treating Tot`) &&
    !in_heavyrains()
  ) {
    useFamiliar($familiar`Trick-or-Treating Tot`);
    autoEquip($item`li'l pirate costume`); //300% meat
    handleFamiliar$1($familiar`Trick-or-Treating Tot`);
    if (pass$3()) {
      return result$3();
    }
  }
  if (!in_wereprof()) {
    //wereprof doesn't like +ML effects outside of Werewolf
    if (tryEffects$4($effects`Frosty`)) {
      //200% meat, 100% item, 100% init, 25 ML
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (
    SourceTerminal$$auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect($effect`meat.enh`) === 0 &&
    auto_is_valid$3($effect`meat.enh`)
  ) {
    if (!speculative) {
      SourceTerminal$$auto_sourceTerminalEnhance("meat");
    }
    handleEffect$3($effect`meat.enh`); //60% meat
    if (pass$3()) {
      return result$3();
    }
  }
  if (
    itemAmount($item`body spradium`) > 0 &&
    !in_tcrs() &&
    haveEffect($effect`Boxing Day Glow`) === 0
  ) {
    autoChew(1, $item`body spradium`); //50% meat, 5 fam weight
    if (pass$3()) {
      return result$3();
    }
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    Bjorn$$handleBjornify($familiar`Hobo Monkey`); //25% meat, hot damage, delevels
    //craft IOTM derivative that gives high item bonus
    if (
      equippedItem($slot`off-hand`) !== $item`Half a Purse` &&
      !possessEquipment($item`Half a Purse`) &&
      itemAmount($item`lump of Brituminous coal`) > 0
    ) {
      //+X% meat based on smithness (10% if only half a purse is equipped)
      auto_buyUpTo(1, $item`loose purse strings`);
      autoCraft(
        "smith",
        1,
        $item`lump of Brituminous coal`,
        $item`loose purse strings`,
      );
    }
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Meat Drop`, 500)
            .max($modifier`Meat Drop`, amt + 100),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Meat Drop`, 500)
        .max($modifier`Meat Drop`, amt + 100);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Meat Drop`) - numericModifier($modifier`Meat Drop`);
    auto_log_debug(
      `With existing and crafted gear we can get to ${result$3()}`,
    );
    if (pass$3()) {
      return result$3();
    }
  }
  // Use limited resources like Inhaler
  if (doEverything) {
    if (
      tryEffects$4([
        $effect`Shadow Waters`, //200% meat, 100% item, 100% init, -10% combat
        $effect`Sinuses For Miles`, //200% meat
        $effect`Car-Charged`, //100% meat, 100% item, 5-10MP, 50% init, 50% spell dmg, +3 stats per fight
        $effect`Incredibly Well Lit`, //100% meat, 50% item
      ])
    ) {
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      AutoClan$$zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect($effect`Meet the Meat`)) &
          toInt(auto_is_valid$3($effect`Meet the Meat`)),
      )
    ) {
      if (!speculative) {
        AutoClan$$zataraSeaside("meat");
      }
      handleEffect$3($effect`Meet the Meat`); //100% meat, 50% gear drops
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      get("sidequestArenaCompleted") === "fratboy" &&
      !get("concertVisited") &&
      haveEffect($effect`Winklered`) === 0
    ) {
      if (is_professor()) {
        //Need to manually equip because professor
        if (!haveEquipped($item`beer helmet`)) {
          equip($item`beer helmet`);
        }
        if (!haveEquipped($item`distressed denim pants`)) {
          equip($item`distressed denim pants`);
        }
        if (!haveEquipped($item`bejeweled pledge pin`)) {
          equip($item`bejeweled pledge pin`);
        }
      } else {
        outfit("Frat Warrior Fatigues");
      }
      if (!speculative) {
        cliExecute("concert 2"); //40% meat
      }
      handleEffect$3($effect`Winklered`); //40% meat
      if (pass$3()) {
        return result$3();
      }
    }
    if (pass$3()) {
      return result$3();
    }
    if (
      !in_tcrs() &&
      !in_small() &&
      !get("auto_limitConsume", false) &&
      haveEffect($effect`Tryptofan`) === 0 &&
      creatableAmount($item`prize turkey`) > 0 &&
      auto_canEat($item`prize turkey`) &&
      stomach_left() > $item`prize turkey`.fullness
    ) {
      if (!speculative) {
        buy($coinmaster`Skeleton of Crimbo Past`, 1, $item`prize turkey`);
        autoEat(1, $item`prize turkey`);
      }
      handleEffect$3($effect`Tryptofan`); //100% meat, 50 init
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      !in_tcrs() &&
      haveEffect($effect`Grueling Gravitas`) === 0 &&
      creatableAmount($item`medicinal gruel`) > 0 &&
      spleen_left() > $item`medicinal gruel`.spleen
    ) {
      if (!speculative) {
        buy($coinmaster`Skeleton of Crimbo Past`, 1, $item`medicinal gruel`);
        autoChew(1, $item`medicinal gruel`);
      }
      handleEffect$3($effect`Grueling Gravitas`); //5 fam weight
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      // If we're this far, we don't care about the "wait until we've drunk a bit" check.
      inebriety_left() > 0 &&
      // The checks for 'can we use this' is done as part of 'auto_getDrinkCupOfThirteenForEffect'

      !haveEffect($effect`Runneth On Empty`)
    ) {
      const cupConsume = CupOfThirteen$$auto_getDrinkCupOfThirteenForEffect(
        $effect`Runneth On Empty`,
      );

      if (cupConsume) {
        if (!speculative) {
          auto_autoConsumeOne(cupConsume);
        }

        handleEffect$3($effect`Runneth On Empty`); //100% meat drop
        if (pass$3()) {
          return result$3();
        }
      }
    }
    if (auto_totalEffectWishesAvailable() > 0) {
      let success: boolean = true;
      let specwishes: number = 0;
      const wish_to_try: Effect[] = in_avantGuard()
        ? Effect.get([
            // Avant guard only has 6 turns for nuns, so needs tonnes of buffs
            "Frosty", //200% meat, 100% item, 25 ML, 100% init
            "Braaaaaains", //200% meat, -50% item
            // no Sinuses for Miles here in AG, get it from an inhaler
            "Let's Go Shopping!", //150% meat, 75% item, -300% myst
            "Always be Collecting", //100% meat, 50% item
            "Incredibly Well Lit", //100% meat, 50% item
            "A View to Some Meat", //100% meat\
            "Cravin' for a Ravin'", //100% meat
            "Low on the Hog", //100% meat
            "Leisurely Amblin'", //100% meat
            "Trufflin'", //100% meat
            "Here's Some More Mud in Your Eye", //100% meat
            "Eau d' Clochard", //100% meat
            "Flapper Dancin'", //100% meat
            "Fishing for Meat", //100% meat
            "Preternatural Greed", //100% meat
          ])
        : Effect.get([
            // Regular probably doesn't need more than 600% from wishes
            "Frosty", //200% meat, 100% item, 25 ML, 100% init
            "Braaaaaains", //200% meat, -50% item
            "Sinuses For Miles", //200% meat
            //~ Let's Go Shopping!  //150% meat, 75% item, -300% myst
          ]);
      for (const eff of wish_to_try) {
        if (eff === $effect`Frosty` && in_wereprof()) {
          //skip frosty in wereprof
          continue;
        }
        if (haveEffect(eff) === 0) {
          if (!speculative) {
            success = auto_wishForEffect(eff);
          }
          specwishes += 1;
          if (specwishes <= auto_totalEffectWishesAvailable()) {
            handleEffect$3(eff);
            if (pass$3()) {
              return result$3();
            }
          } else {
            success = false;
          }
        }
        if (!success) {
          break;
        }
      }
    }
    auto_log_debug(`With limited buffs we can get to ${result$3()}`);
    if (pass$3()) {
      return result$3();
    }
  }

  return result$3();
}

export function provideMeat$1(
  amt: number,
  doEverything: boolean,
  speculative: boolean,
): number {
  return provideMeat(amt, myLocation(), doEverything, speculative);
}

export function provideMeat$2(
  amt: number,
  loc: Location,
  doEverything: boolean,
): boolean {
  return provideMeat(amt, loc, doEverything, false) >= amt;
}

function provideItem(
  amt: number,
  loc: Location,
  doEverything: boolean,
  speculative: boolean,
): number {
  //doEverything means use equipment, familiar slot, and limited buffs (ie steely eye squint)
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} item, ${doEverything ? "with" : "without"} equipment, familiar, and limited buffs`,
    "blue",
  );

  const alreadyHave: number = numericModifier($modifier`Item Drop`);
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough +item!");
    return alreadyHave;
  }

  let delta: number = 0;

  function result$2(): number {
    return numericModifier($modifier`Item Drop`) + delta;
  }

  function pass$2(): boolean {
    return result$2() >= amt;
  }

  if (pass$2()) {
    return result$2();
  }
  // don't craft equipment here. See how much +item we can get with gear on hand
  if (doEverything) {
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Item Drop`, 500)
            .max($modifier`Item Drop`, amt + 100),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Item Drop`, 500)
        .max($modifier`Item Drop`, amt + 100);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Item Drop`) - numericModifier($modifier`Item Drop`);
    auto_log_debug(`With existing gear we can get to ${result$2()}`);

    if (pass$2()) {
      return result$2();
    }
  }
  //see how much familiar will help
  if (doEverything && canChangeFamiliar()) {
    if (!speculative) {
      handleFamiliar("item");
    }
    // fam isn't equipped immediatly even if we aren't speculating
    // so add bonus from fam regardless of speculation
    const target: Familiar = lookupFamiliarDatafile("item");
    if (target !== $familiar.none && target !== myFamiliar()) {
      delta += auto_famModifiers(target, "Item Drop", $item.none);
      auto_log_debug(
        `With using familiar: ${target} we can get to ${result$2()}`,
      );
    } else {
      auto_log_debug(`Already have desired familar, ${target}, active.`);
    }

    if (pass$2()) {
      return result$2();
    }
  }

  function handleEffect$2(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Item Drop");
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$2()}`,
    );
  }

  function tryEffects$3(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
        handleEffect$2(eff);
      }
      if (pass$2()) {
        return true;
      }
    }
    return false;
  }

  if (in_heavyrains()) {
    buffMaintain$2($effect`Fishy Whiskers`); // HR only
  }

  if (in_amw() && amw_canAfford($skill`Beef Goggles`)) {
    if (tryEffects$3($effects`Beef Goggles`)) {
      // meatpath only
      return result$2();
    }
  }
  // unlimited skills
  if (
    tryEffects$3([
      $effect`Fat Leon's Phat Loot Lyric`, //20% item
      $effect`Singer's Faithful Ocelot`, //10% item
      $effect`Who's Going to Pay This Drunken Sailor?`, //25% item, rivalrous with +5 lb fam weight
    ])
  ) {
    return result$2();
  }

  if (AsdonMartin$$canAsdonBuff($effect`Driving Observantly`)) {
    //50% meat, 50% item, 50% booze drops
    if (!speculative) {
      AsdonMartin$$asdonBuff($effect`Driving Observantly`);
    }
    handleEffect$2($effect`Driving Observantly`);
  }
  if (pass$2()) {
    return result$2();
  }

  if (!bat_wantHowl(loc) && bat_formBats(speculative)) {
    //150% item, 150% init
    handleEffect$2($effect`Bats Form`);
  }
  if (pass$2()) {
    return result$2();
  }

  if (BirdADay$$auto_birdModifier("Item Drop") > 0) {
    //Can be 10/20/30/40/50% item drop
    if (tryEffects$3($effects`Blessing of the Bird`)) {
      return result$2();
    }
  }

  if (BirdADay$$auto_favoriteBirdModifier("Item Drop") > 0) {
    //Can be 10/20/30/40/50% item drop
    if (tryEffects$3($effects`Blessing of your favorite Bird`)) {
      return result$2();
    }
  }
  // items
  if (
    tryEffects$3([
      $effect`Unusual Perspective`, //50% item
      $effect`Five Sticky Fingers`, //50% item
      $effect`Spitting Rhymes`, //50% item
      $effect`Wet and Greedy`, //25% item
      $effect`Serendipi Tea`, //25% item
      $effect`Glowing Hands`, //25% item
      $effect`Eagle Eyes`, //20% item
      $effect`Juiced and Jacked`, //20% item
      $effect`The Grass...  Is Blue...`, //40% meat, 20% item
      $effect`Joyful Resolve`, //15% item
      $effect`Lubricating Sauce`, //15% item
      $effect`Fortunate Resolve`, //10% item
      $effect`Human-Human Hybrid`, //10% item
      $effect`Heart of Lavender`, //10% item
    ])
  ) {
    return result$2();
  }

  if (!in_wereprof()) {
    //wereprof doesn't like +ML effects outside of Werewolf
    if (tryEffects$3($effects`Frosty`)) {
      //200% meat, 100% item, 100% init, 25 ML
      return result$2();
    }
  }

  if (
    auto_is_valid($item`possessed sugar cube`) &&
    itemAmount($item`possessed sugar cube`) > 0 &&
    haveEffect($effect`Dance of the Sugar Fairy`) === 0
  ) {
    if (!speculative) {
      cliExecute("make sugar fairy");
    }
    handleEffect$2($effect`Dance of the Sugar Fairy`); //25% item
    if (pass$2()) {
      return result$2();
    }
  }

  if (
    SourceTerminal$$auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect($effect`items.enh`) === 0 &&
    auto_is_valid$3($effect`items.enh`)
  ) {
    if (!speculative) {
      //30% item
      SourceTerminal$$auto_sourceTerminalEnhance("items");
    }
    handleEffect$2($effect`items.enh`);
    if (pass$2()) {
      return result$2();
    }
  }
  //check specific item drop bonus
  const { needsItem: needsFoodItem, score: needFoodItemScore } =
    zone_needItemFood(loc);
  const { needsItem: needsBoozeItem, score: needBoozeScore } =
    zone_needItemBooze(loc);

  if (
    needsFoodItem &&
    result$2() + simValue($modifier`Food Drop`) < needFoodItemScore
  ) {
    auto_log_debug("Trying food drop supplements");
    //max at start of an expression with item and food drop is ineffective in combining them, have to let the maximizer try to add on top
    maximizer
      .weight($modifier`Food Drop`, 49)
      .max($modifier`Food Drop`, ceil(needFoodItemScore));
    simMaximize();
  }
  if (
    needsBoozeItem &&
    result$2() + simValue($modifier`Booze Drop`) < needBoozeScore
  ) {
    auto_log_debug("Trying booze drop supplements");
    maximizer
      .weight($modifier`Booze Drop`, 49)
      .max($modifier`Booze Drop`, ceil(needBoozeScore));
    simMaximize();
    //no zone item yet needs both food and booze, bottle of Chateau de Vinegar exception is a cooking ingredient but doesn't use food drop bonus
  }
  if (pass$2()) {
    return result$2();
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    //craft IOTM derivative that gives high item bonus
    if (
      !possessEquipment($item`A Light that Never Goes Out`) &&
      itemAmount($item`lump of Brituminous coal`) > 0 &&
      auto_is_valid($item`A Light that Never Goes Out`)
    ) {
      auto_buyUpTo(1, $item`third-hand lantern`);
      autoCraft(
        "smith",
        1,
        $item`lump of Brituminous coal`,
        $item`third-hand lantern`,
      );
    }

    if (
      auto_is_valid($item`broken champagne bottle`) &&
      get("garbageChampagneCharge") > 0
    ) {
      //fold and remove maximizer block on using IOTM with 9 charges a day that doubles item drop chance
      JanuaryTote$$januaryToteAcquire($item`broken champagne bottle`);
    }

    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Item Drop`, 500)
            .max($modifier`Item Drop`, amt + 100),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Item Drop`, 500)
        .max($modifier`Item Drop`, amt + 100);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Item Drop`) - numericModifier($modifier`Item Drop`);
    auto_log_debug(
      `With existing and crafted gear we can get to ${result$2()}`,
    );

    if (pass$2()) {
      return result$2();
    }
  }

  if (doEverything && amt >= 400) {
    if (
      !get("_steelyEyedSquintUsed") &&
      buffMaintain$2($effect`Steely-Eyed Squint`, 0, 1, 1, speculative)
    ) {
      if (speculative) {
        delta += delta + numericModifier($modifier`Item Drop`);
      }
      auto_log_debug(
        `With Steely Eyed Squint we ${speculative ? "can get to" : "now have"} ${result$2()}`,
      );
    }
    if (pass$2()) {
      return result$2();
    }
  }
  // Use limited resources
  if (doEverything) {
    if (
      tryEffects$3([
        $effect`Shadow Waters`, //200% meat, 100% item, 100% init, -10% combat
        $effect`One Very Clear Eye`, //100% item
        $effect`Car-Charged`, //100% meat, 100% item, 5-10MP, 50% init, 50% spell dmg, +3 stats per fight
        $effect`Incredibly Well Lit`, //100% meat, 50% item
        $effect`Crunching Leaves`, //25% item, +5 combat
      ])
    ) {
      if (pass$2()) {
        return result$2();
      }
    }
    //beret busk if possible
    if (PrismaticBeret$$canBusk()) {
      PrismaticBeret$$beretBusk("item drop");
    }
    if (pass$2()) {
      return result$2();
    }
    if (AlliedRadioBackpack$$auto_canARBSupplyDrop()) {
      AlliedRadioBackpack$$ARBSupplyDrop("item drop");
    }
    if (pass$2()) {
      return result$2();
    }
    if (
      AutoClan$$zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect($effect`There's No N in Love`)) &
          toInt(auto_is_valid$3($effect`There's No N in Love`)),
      )
    ) {
      if (!speculative) {
        AutoClan$$zataraSeaside("item");
      }
      handleEffect$2($effect`There's No N in Love`); //50% booze/food/item
      if (pass$2()) {
        return result$2();
      }
    }
    if (
      get("sidequestArenaCompleted") === "hippy" &&
      !get("concertVisited") &&
      haveEffect($effect`Dilated Pupils`) === 0
    ) {
      if (is_professor()) {
        //Need to manually equip because professor
        if (!haveEquipped($item`reinforced beaded headband`)) {
          equip($item`reinforced beaded headband`);
        }
        if (!haveEquipped($item`bullet-proof corduroys`)) {
          equip($item`bullet-proof corduroys`);
        }
        if (!haveEquipped($item`round purple sunglasses`)) {
          equip($item`round purple sunglasses`);
        }
      } else {
        outfit("War Hippy Fatigues");
      }
      if (!speculative) {
        cliExecute("concert 2"); //20% item
      }
      handleEffect$2($effect`Dilated Pupils`); //20% item
      if (pass$2()) {
        return result$2();
      }
    }
    if (pass$2()) {
      return result$2();
    }
    if (
      !in_tcrs() &&
      !in_small() &&
      !get("auto_limitConsume", false) &&
      haveEffect($effect`Ordained`) === 0 &&
      creatableAmount($item`Smoking Pope`) > 0 &&
      auto_canDrink($item`Smoking Pope`) &&
      inebriety_left() > $item`Smoking Pope`.inebriety
    ) {
      if (!speculative) {
        buy($coinmaster`Skeleton of Crimbo Past`, 1, $item`Smoking Pope`);
        autoDrink(1, $item`Smoking Pope`);
      }
      handleEffect$2($effect`Ordained`); //50% item, 50% skeleton damage
      if (pass$2()) {
        return result$2();
      }
    }
    if (
      !in_tcrs() &&
      haveEffect($effect`Grueling Gravitas`) === 0 &&
      creatableAmount($item`medicinal gruel`) > 0 &&
      spleen_left() > $item`medicinal gruel`.spleen
    ) {
      if (!speculative) {
        buy($coinmaster`Skeleton of Crimbo Past`, 1, $item`medicinal gruel`);
        autoChew(1, $item`medicinal gruel`);
      }
      handleEffect$2($effect`Grueling Gravitas`); //5 fam weight
      if (pass$2()) {
        return result$2();
      }
    }
    if (auto_totalEffectWishesAvailable() > 0) {
      let success: boolean = true;
      let specwishes: number = 0;
      for (const eff of Effect.get([
        "Frosty", //200% meat, 100% item, 25 ML, 100% init
        "One Very Clear Eye", //100% item
        "Let's Go Shopping!", //150% meat, 75% item, -300% myst
        "Always be Collecting", //100% meat, 50% item
        "Incredibly Well Lit", //100% meat, 50% item
      ])) {
        if (eff === $effect`Frosty` && in_wereprof()) {
          //skip frosty in wereprof
          continue;
        }
        if (haveEffect(eff) === 0) {
          if (!speculative) {
            success = auto_wishForEffect(eff);
          }
          specwishes += 1;
          if (specwishes <= auto_totalEffectWishesAvailable()) {
            handleEffect$2(eff);
            if (pass$2()) {
              return result$2();
            }
          } else {
            success = false;
          }
        }
        if (!success) {
          break;
        }
      }
    }
    auto_log_debug(`With limited buffs we can get to ${result$2()}`);
    if (pass$2()) {
      return result$2();
    }
  }
  return result$2();
}

export function provideItem$2(
  amt: number,
  loc: Location,
  doEverything: boolean,
): boolean {
  return provideItem(amt, loc, doEverything, false) >= amt;
}

export function provideFamExp(
  amt: number,
  loc: Location,
  doEquips: boolean,
  doEverything: boolean,
  speculative: boolean,
): number {
  //doEverything means use equipment, familiar slot, and limited buffs (like Feeling Fancy (2 Fullness))
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} familiar experience, ${doEverything ? "with" : "without"} equipment, familiar, and limited buffs`,
    "blue",
  );

  const alreadyHave: number =
    numericModifier($modifier`Familiar Experience`) + 1; //default of 1 fam exp per combat
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug("We already have enough +fam experience!");
    return alreadyHave;
  }

  let delta: number = 0;

  function result(): number {
    return numericModifier($modifier`Familiar Experience`) + 1 + delta;
  }

  function pass(): boolean {
    return result() >= amt;
  }

  if (pass()) {
    return result();
  }
  // don't craft equipment here. See how much +fam xp we can get with gear on hand
  if (doEquips || doEverything) {
    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Familiar Experience`, 1000)
            .max($modifier`Familiar Experience`, amt + 10),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Familiar Experience`, 1000)
        .max($modifier`Familiar Experience`, amt + 10);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Familiar Experience`) -
      numericModifier($modifier`Familiar Experience`);
    auto_log_debug(`With existing gear we can get to ${result()}`);

    if (pass()) {
      return result();
    }
  }

  function handleEffect(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Familiar Experience");
    }
    auto_log_debug(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result()}`,
    );
  }

  function tryEffects$1(effects: Effect[]): boolean {
    for (const eff of effects) {
      if (numericModifier(eff, $modifier`Familiar Experience`) > 0) {
        if (buffMaintain$2(eff, 0, 1, 1, speculative)) {
          handleEffect(eff);
        }
        if (pass()) {
          return true;
        }
      }
    }
    return false;
  }
  // If we're zootomist, need to level, and we have +xp on our milk, cast it.
  if (in_zootomist() && myLevel() < 13) {
    if (
      tryEffects$1([
        $effect`Milk of Familiar Kindness`,
        $effect`Milk of Familiar Cruelty`,
      ])
    ) {
      return result();
    }
  }
  // unlimited skills
  if (
    tryEffects$1([
      $effect`Curiosity of Br'er Tarrypin`, //+1
    ])
  ) {
    return result();
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    //craft IOTM derivative that gives high fam xp bonus
    LatteMug$$auto_latteRefill$4("famxp"); //+3

    if (speculative) {
      simMaximizeWith(
        (m) =>
          m
            .weight($modifier`Familiar Experience`, 1000)
            .max($modifier`Familiar Experience`, amt + 100),
        loc,
      );
    } else {
      maximizer
        .weight($modifier`Familiar Experience`, 1000)
        .max($modifier`Familiar Experience`, amt + 100);
      simMaximize$1(loc);
    }
    delta =
      simValue($modifier`Familiar Experience`) -
      numericModifier($modifier`Familiar Experience`);
    auto_log_debug(`With existing and crafted gear we can get to ${result()}`);

    if (pass()) {
      return result();
    }
  }
  // Use limited resources
  if (doEverything) {
    let gotSwayed = true;
    while (
      gotSwayed &&
      haveEffect($effect`Blue Swayed`) < 31 &&
      itemAmount($item`pulled blue taffy`) > 0
    ) {
      auto_log_info("Getting Blue Swayed");
      if ((gotSwayed = tryEffects$1($effects`Blue Swayed`))) {
        //+X/5, decreasing by 5 every 5 turns so keeping it separate
        if (pass()) {
          return result();
        }
      }
    }
    if (
      fullness_left() > 2 &&
      itemAmount($item`roasted vegetable focaccia`) > 0
    ) {
      if (tryEffects$1($effects`Feeling Fancy`)) {
        //+10
        if (pass()) {
          return result();
        }
      }
    }
    candyEggDeviler(); //try to get a deviled candy egg
    if (
      tryEffects$1([
        $effect`Best Pals`, //+1
        $effect`Warm Shoulders`, //+5
        $effect`Shortly Hydrated`, //+5
        $effect`Candied Devil`, //+5
        $effect`Black Tongue`, //+2
        $effect`Green Tongue`, //+2
        $effect`Heart of White`, //+1
      ])
    ) {
      if (pass()) {
        return result();
      }
    }
    if (
      AutoClan$$zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect($effect`A Girl Named Sue`)) &
          toInt(auto_is_valid$3($effect`A Girl Named Sue`)),
      )
    ) {
      if (!speculative) {
        AutoClan$$zataraSeaside("familiar");
      }
      handleEffect($effect`A Girl Named Sue`); //+5
      if (pass()) {
        return result();
      }
    }
    //2 separate statements because Warm Shoulders doesn't degrade, blue swayed does. If only 1 wish available Warm shoulders is better, otherwise, go for 2 wishs of Blue Swayed first
    if (auto_totalEffectWishesAvailable() === 1) {
      let success: boolean = true;
      let specwishes: number = 0;
      //not really any reason to hit blue swayed since we are only able to wish once, but might as well keep it here in case warm shoulders isn't wishable by whatever wish we are using, but blue swayed is
      for (const eff of Effect.get([
        "Warm Shoulders", //+5
        "Blue Swayed", //+X/5, decreasing by 5 every 5 turns
      ])) {
        while (
          haveEffect(eff) === 0 ||
          (eff === $effect`Blue Swayed` && haveEffect(eff) < 31)
        ) {
          if (!speculative) {
            success = auto_wishForEffect(eff);
          }
          specwishes += 1;
          if (specwishes <= auto_totalEffectWishesAvailable()) {
            handleEffect(eff);
            if (pass()) {
              return result();
            }
          } else {
            success = false;
          }
        }
        if (!success) {
          break;
        }
      }
    } else if (auto_totalEffectWishesAvailable() > 1) {
      let success: boolean = true;
      let specwishes: number = 0;
      for (const eff of Effect.get([
        "Blue Swayed", //+X/5, decreasing by 5 every 5 turns
        "Warm Shoulders", //+5
      ])) {
        while (
          haveEffect(eff) === 0 ||
          (eff === $effect`Blue Swayed` && haveEffect(eff) < 31)
        ) {
          if (!speculative) {
            success = auto_wishForEffect(eff);
          }
          specwishes += 1;
          if (specwishes <= auto_totalEffectWishesAvailable()) {
            handleEffect(eff);
            if (pass()) {
              return result();
            }
          } else {
            success = false;
          }
        }
        if (!success) {
          break;
        }
      }
    }
    auto_log_debug(`With limited buffs we can get to ${result()}`);
    if (pass()) {
      return result();
    }
  }
  return result();
}

export function provideFamExp$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
  doEverything: boolean,
): boolean {
  return provideFamExp(amt, loc, doEquips, doEverything, false) >= amt;
}

export function provideFamExp$3(
  amt: number,
  doEquips: boolean,
  doEverything: boolean,
): boolean {
  return provideFamExp$2(amt, myLocation(), doEquips, doEverything);
}
