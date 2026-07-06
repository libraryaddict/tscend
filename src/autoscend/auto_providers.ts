import {
  availableAmount,
  buy,
  canInteract,
  ceil,
  cliExecute,
  Coinmaster,
  creatableAmount,
  Effect,
  Element,
  equip,
  equippedItem,
  Familiar,
  floor,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
  Item,
  itemAmount,
  length,
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
  Servant,
  Skill,
  Slot,
  Stat,
  toBoolean,
  toFamiliar,
  toInt,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import { auto_buyUpTo } from "./auto_acquire";
import { buffMaintain$2, buffMaintain$4 } from "./auto_buff";
import {
  autoChew,
  autoDrink,
  autoEat,
  canDrink$1,
  canEat$1,
  fullness_left,
  inebriety_left,
  shouldUseSpleenForLowPriority,
  spleen_left,
  stomach_left,
} from "./auto_consume";
import {
  addToMaximize,
  autoEquip$1,
  possessEquipment,
  simMaximize,
  simMaximize$1,
  simMaximizeWith,
  simMaximizeWith$1,
  simValue,
} from "./auto_equipment";
import {
  auto_famModifiers,
  auto_famModifiers$2,
  auto_famWeight$1,
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
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_totalEffectWishesAvailable,
  auto_wishForEffect,
  autoCraft,
  candyEggDeviler,
  meatReserve,
  shrugAT$1,
} from "./auto_util";
import { zone_needItemBooze, zone_needItemFood } from "./auto_zone";
import { generic_t } from "./autoscend_record";
import { zataraAvailable, zataraSeaside } from "./iotms/clan";
import { handleBjornify } from "./iotms/mr2014";
import {
  auto_sourceTerminalEnhance,
  auto_sourceTerminalEnhanceLeft,
  rethinkingCandy,
} from "./iotms/mr2016";
import {
  asdonBuff$1,
  canAsdonBuff,
  horseCost,
  horseDark,
  horseMaintain,
  horseNone,
  isHorseryAvailable,
} from "./iotms/mr2017";
import {
  auto_latteRefill$5,
  januaryToteAcquire,
  songboomSetting,
} from "./iotms/mr2018";
import {
  auto_beachCombHead,
  auto_beachCombHeadEffect,
  auto_canBeachCombHead,
} from "./iotms/mr2019";
import {
  auto_birdModifier,
  auto_favoriteBirdModifier,
  auto_hasPowerfulGlove,
} from "./iotms/mr2020";
import { auto_haveCCSC } from "./iotms/mr2023";
import {
  auto_haveAprilingBandHelmet,
  auto_setAprilBandCombat,
  auto_setAprilBandNonCombat,
} from "./iotms/mr2024";
import {
  auto_haveCoolerYeti,
  auto_haveCyberRealm,
  beretBusk,
  canBusk,
} from "./iotms/mr2025";
import { ARBSupplyDrop, auto_canARBSupplyDrop } from "./iotms/ttt";
import { isActuallyEd } from "./paths/actually_ed_the_undying";
import { amw_canAfford, in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import {
  bat_formBats,
  bat_formMist,
  bat_formWolf,
  bat_wantHowl,
} from "./paths/dark_gyffte";
import { in_heavyrains } from "./paths/heavy_rains";
import { in_plumber } from "./paths/path_of_the_plumber";
import { in_small } from "./paths/small";
import { in_tcrs } from "./paths/two_crazy_random_summer";
import { in_wereprof, is_professor } from "./paths/wereprofessor";
import { in_zootomist } from "./paths/zootomist";

//Defined in autoscend/auto_providers.ash
export function providePlusCombat(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} positive combat rate, ${doEquips ? "with" : "without"} equipment`,
    "blue",
  );
  //if the fam is important enough to add, it will be caught in preAdvUpdateFamiliar
  if (auto_famModifiers$2("Combat Rate") < 0) {
    useFamiliar(Familiar.none);
  }

  const alreadyHave: number = numericModifier("Combat Rate");
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough!");
  }

  let delta: number = 0;

  function result$4(): number {
    return numericModifier("Combat Rate") + delta;
  }

  if (doEquips) {
    const max_1: string = `200combat ${amt}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Combat Rate") - numericModifier("Combat Rate");
    auto_log_debug$1(`With gear we can get to ${result$4()}`);
  }

  function pass$4(): boolean {
    return result$4() >= amt;
  }

  if (pass$4()) {
    return result$4();
  }
  // first lets do stuff that is "free" (as in has no MP cost, item use or can be freely removed/toggled)

  if (haveEffect(Effect.get("Become Superficially interested")) > 0) {
    visitUrl("charsheet.php?pwd=&action=newyouinterest");
    if (pass$4()) {
      return result$4();
    }
  }

  for (const eff of Effect.get([
    "Driving Stealthily",
    "The Sonata of Sneakiness",
    "In The Darkness",
  ])) {
    uneffect(eff);
    if (pass$4()) {
      return result$4();
    }
  }

  if (getProperty("_horsery") === "dark horse") {
    if (!speculative) {
      horseNone();
    }
    delta += -1.0 * numericModifier("Horsery:dark horse", "Combat Rate"); // horsery changes don't happen until pre-adventure so this needs to be manually added otherwise it won't count.
    auto_log_debug$1(
      `We ${speculative ? "can remove" : "will remove"} Dark Horse, we will have ${result$4()}`,
    );
  } else if (!speculative) {
    horseMaintain();
  }
  if (pass$4()) {
    return result$4();
  }

  function handleEffect$4(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Combat Rate");
      if (
        eff === Effect.get("Musk of the Moose") &&
        haveEffect(Effect.get("Smooth Movements")) > 0
      ) {
        delta +=
          -1.0 * numericModifier(Effect.get("Smooth Movements"), "Combat Rate"); // numeric_modifier doesn't take into account uneffecting the opposite skill so we have to add it manually.
      }
      if (
        eff === Effect.get("Carlweather's Cantata of Confrontation") &&
        haveEffect(Effect.get("The Sonata of Sneakiness")) > 0
      ) {
        delta +=
          -1.0 *
          numericModifier(
            Effect.get("The Sonata of Sneakiness"),
            "Combat Rate",
          );
      }
    }
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$4()}`,
    );
  }

  function tryEffects$5(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    shrugAT$1(Effect.get("Carlweather's Cantata of Confrontation"));
  }
  if (
    tryEffects$5(
      new Map([
        [Effect.get("Musk of the Moose"), true],
        [Effect.get("Carlweather's Cantata of Confrontation"), true],
        [Effect.get("Milk of Familiar Kindness"), true],
        [Effect.get("Attracting Snakes"), true],
        [Effect.get("Crunchy Steps"), true],
        [Effect.get("Blinking Belly"), true],
        [Effect.get("Song of Battle"), true],
        [Effect.get("Frown"), true],
        [Effect.get("Angry"), true],
        [Effect.get("Screaming!  SCREAMING!  AAAAAAAH!"), true],
        [Effect.get("Coffeesphere"), true],
        [Effect.get("Unmuffled"), true],
      ]),
    )
  ) {
    return result$4();
  }

  if (in_amw() && amw_canAfford(Skill.get("Act Jerky"))) {
    // meatpath only
    if (tryEffects$5(new Map([[Effect.get("Acting Jerky"), true]]))) {
      return result$4();
    }
  }
  // Do the April band
  if (auto_haveAprilingBandHelmet()) {
    if (!speculative) {
      auto_setAprilBandCombat();
    }
    handleEffect$4(Effect.get("Apriling Band Battle Cadence"));
    if (pass$4()) {
      return result$4();
    }
  }
  // More limited effects
  if (
    tryEffects$5(
      new Map([
        [Effect.get("Taunt of Horus"), true],
        [Effect.get("Patent Aggression"), true],
        [Effect.get("Lion in Ambush"), true],
        [Effect.get("Everything Must Go!"), true],
        [Effect.get("Hippy Stench"), true],
        [Effect.get("High Colognic"), true],
        [Effect.get("Celestial Saltiness"), true],
        [Effect.get("Simply Irresistible"), true],
        [Effect.get("Crunching Leaves"), true],
        [Effect.get("Romantically Roused"), true],
      ]),
    )
  ) {
    return result$4();
  }

  if (canAsdonBuff(Effect.get("Driving Obnoxiously"))) {
    if (!speculative) {
      asdonBuff$1(Effect.get("Driving Obnoxiously"));
    }
    handleEffect$4(Effect.get("Driving Obnoxiously"));
  }

  if (myMeat() > 100 + meatReserve()) {
    tryEffects$5(new Map([[Effect.get("Waking the Dead"), true]]));
  }

  if (pass$4()) {
    return result$4();
  }

  if (!speculative) {
    //Prep for if other +combat familiars are added
    for (const fam of Familiar.get(["Jumpsuited Hound Dog"])) {
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

function providePlusCombat$1(
  amt: number,
  doEquips: boolean,
  speculative: boolean,
): number {
  return providePlusCombat(amt, myLocation(), doEquips, speculative);
}

export function providePlusCombat$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return providePlusCombat(amt, loc, doEquips, false) >= amt;
}

export function providePlusCombat$3(amt: number, doEquips: boolean): boolean {
  return providePlusCombat$2(amt, myLocation(), doEquips);
}

export function providePlusCombat$4(amt: number, loc: Location): boolean {
  return providePlusCombat$2(amt, loc, true);
}

function providePlusCombat$5(amt: number): boolean {
  return providePlusCombat$4(amt, myLocation());
}

export function providePlusNonCombat(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  auto_log_info(
    `${speculative ? "Checking if we can" : "Trying to"} provide ${amt} negative combat rate, ${doEquips ? "with" : "without"} equipment`,
    "blue",
  );
  //if the fam is important enough to add, it will be caught in preAdvUpdateFamiliar
  if (auto_famModifiers$2("Combat Rate") > 0) {
    useFamiliar(Familiar.none);
  }
  // numeric_modifier will return -combat as a negative value and +combat as a positive value
  // so we will need to invert the return values otherwise this will be wrong (since amt is supposed to be positive).
  const alreadyHave: number = -1.0 * numericModifier("Combat Rate");
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough!");
  }

  let delta: number = 0;

  function result$5(): number {
    return -1.0 * numericModifier("Combat Rate") + delta;
  }

  if (doEquips) {
    const max_1: string = `-200combat ${amt}max`;
    if (speculative) {
      simMaximizeWith$1(max_1);
    } else {
      addToMaximize(max_1);
      simMaximize();
    }
    delta =
      -1.0 * simValue("Combat Rate") - -1.0 * numericModifier("Combat Rate");
    auto_log_debug$1(`With gear we can get to ${result$5()}`);
  }

  function pass$5(): boolean {
    return result$5() >= amt;
  }

  if (pass$5()) {
    return result$5();
  }
  // First let's do the peace turkey, only if we haven't already picked a familiar
  if (
    !speculative &&
    toFamiliar(getProperty("auto_familiarChoice")) === Familiar.none
  ) {
    for (const fam of Familiar.get(["Peace Turkey"])) {
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

  if (haveEffect(Effect.get("Become Intensely interested")) > 0) {
    visitUrl("charsheet.php?pwd=&action=newyouinterest");
    if (pass$5()) {
      return result$5();
    }
  }

  for (const eff of Effect.get([
    "Carlweather's Cantata of Confrontation",
    "Driving Obnoxiously",
  ])) {
    uneffect(eff);
    if (pass$5()) {
      return result$5();
    }
  }

  if (
    isHorseryAvailable() &&
    myMeat() > horseCost() &&
    getProperty("_horsery") !== "dark horse"
  ) {
    if (!speculative) {
      horseDark();
    }
    delta += -1.0 * numericModifier("Horsery:dark horse", "Combat Rate"); // horsery changes don't happen until pre-adventure so this needs to be manually added otherwise it won't count.
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "will gain"} Dark Horse, we will have ${result$5()}`,
    );
  } else if (!speculative) {
    horseMaintain();
  }
  if (pass$5()) {
    return result$5();
  }

  function handleEffect$5(eff: Effect): void {
    if (speculative) {
      delta += -1.0 * numericModifier(eff, "Combat Rate");
      if (
        eff === Effect.get("Smooth Movements") &&
        haveEffect(Effect.get("Musk of the Moose")) > 0
      ) {
        delta += numericModifier(
          Effect.get("Musk of the Moose"),
          "Combat Rate",
        ); // numeric_modifier doesn't take into account uneffecting the opposite skill so we have to add it manually.
      }
    }
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$5()}`,
    );
  }

  function tryEffects$6(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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

  if (in_amw() && amw_canAfford(Skill.get("Dark Meat"))) {
    if (tryEffects$6(new Map([[Effect.get("Darkened Meat"), true]]))) {
      return result$5();
    }
  }

  if (!speculative) {
    shrugAT$1(Effect.get("The Sonata of Sneakiness"));
  }
  if (
    tryEffects$6(
      new Map([
        [Effect.get("Shelter of Shed"), true],
        [Effect.get("Brooding"), true],
        [Effect.get("Muffled"), true],
        [Effect.get("Smooth Movements"), true],
        [Effect.get("The Sonata of Sneakiness"), true],
        [Effect.get("Milk of Familiar Cruelty"), true],
        [Effect.get("Hiding From Seekers"), true],
        [Effect.get("Ultra-Soft Steps"), true],
        [Effect.get("Song of Solitude"), true],
        [Effect.get("Inked Well"), true],
        [Effect.get("Bent Knees"), true],
        [Effect.get("Extended Toes"), true],
        [Effect.get("Ink Cloud"), true],
        [Effect.get("Cloak of Shadows"), true],
        [Effect.get("Chocolatesphere"), true],
        [Effect.get("Disquiet Riot"), true],
      ]),
    )
  ) {
    return result$5();
  }

  if (-1.0 * auto_birdModifier("Combat Rate") > 0) {
    if (tryEffects$6(new Map([[Effect.get("Blessing of the Bird"), true]]))) {
      return result$5();
    }
  }

  if (-1.0 * auto_favoriteBirdModifier("Combat Rate") > 0) {
    if (
      tryEffects$6(
        new Map([[Effect.get("Blessing of your favorite Bird"), true]]),
      )
    ) {
      return result$5();
    }
  }
  // Do the April band
  if (auto_haveAprilingBandHelmet()) {
    if (!speculative) {
      auto_setAprilBandNonCombat();
    }
    handleEffect$5(Effect.get("Apriling Band Patrol Beat"));
    if (pass$5()) {
      return result$5();
    }
  }

  if (
    tryEffects$6(
      new Map([
        [Effect.get("Ashen"), true],
        [Effect.get("Predjudicetidigitation"), true],
        [Effect.get("Patent Invisibility"), true],
        [Effect.get("Ministrations in the Dark"), true],
        [Effect.get("Fresh Scent"), true],
        [Effect.get("Become Superficially interested"), true],
        [Effect.get("Gummed Shoes"), true],
        [Effect.get("Simply Invisible"), true],
        [Effect.get("Inky Camouflage"), true],
        [Effect.get("Celestial Camouflage"), true],
        [Effect.get("Feeling Lonely"), true],
        [Effect.get("Feeling Sneaky"), true],
      ]),
    )
  ) {
    return result$5();
  }

  if (canAsdonBuff(Effect.get("Driving Stealthily"))) {
    if (!speculative) {
      asdonBuff$1(Effect.get("Driving Stealthily"));
    }
    handleEffect$5(Effect.get("Driving Stealthily"));
  }
  if (pass$5()) {
    return result$5();
  }
  //blooper ink costs 15 coins without which it will error when trying to buy it, so that is the bare minimum we need to check for
  //However we don't want to waste our early coins on it as they are precious. So require at least 400 coins before buying it.
  if (
    in_plumber() &&
    0 === haveEffect(Effect.get("Blooper Inked")) &&
    itemAmount(Item.get("coin")) > 400
  ) {
    if (!speculative) {
      retrieveItem(1, Item.get("blooper ink"));
    }
    if (tryEffects$6(new Map([[Effect.get("Blooper Inked"), true]]))) {
      return result$5();
    }
  }
  // Glove charges are a limited per-day resource, lets do this last so we don't waste possible uses of Replace Enemy
  if (
    auto_hasPowerfulGlove() &&
    tryEffects$6(new Map([[Effect.get("Invisible Avatar"), true]]))
  ) {
    return result$5();
  }
  // If we haven't picked a familiar by now consider the disgeist
  if (
    !speculative &&
    toFamiliar(getProperty("auto_familiarChoice")) === Familiar.none
  ) {
    for (const fam of Familiar.get(["Disgeist"])) {
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
  doEquips: boolean,
  speculative: boolean,
): number {
  return providePlusNonCombat(amt, myLocation(), doEquips, speculative);
}

function providePlusNonCombat$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return providePlusNonCombat(amt, loc, doEquips, false) >= amt;
}

export function providePlusNonCombat$3(
  amt: number,
  doEquips: boolean,
): boolean {
  return providePlusNonCombat$2(amt, myLocation(), doEquips);
}

export function providePlusNonCombat$4(amt: number, loc: Location): boolean {
  return providePlusNonCombat$2(amt, loc, true);
}

function providePlusNonCombat$5(amt: number): boolean {
  return providePlusNonCombat$4(amt, myLocation());
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

  const alreadyHave: number = numericModifier("Initiative");
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough!");
  }

  let delta: number = 0;

  function result$1(): number {
    return numericModifier("Initiative") + delta;
  }

  if (doEquips) {
    const max_1: string = `500initiative ${amt}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Initiative") - numericModifier("Initiative");
    auto_log_debug$1(`With gear we can get to ${result$1()}`);
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
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$1()}`,
    );
  }

  function tryEffects$2(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    tryEffects$2(
      new Map([
        //organized by %/mp and %. Skills
        [Effect.get("Living Fast"), true], //100%, 5mp
        [Effect.get("Stretched"), true], //75%, 10mp
        [Effect.get("Slippery as a Seal"), true], //+50%, 5mp
        [Effect.get("Cletus's Canticle of Celerity"), true], //20%, 4mp
        [Effect.get("Springy Fusilli"), true], //40%, 10mp
        [Effect.get("Soulerskates"), true], //30%, 25 soulsauce
        [Effect.get("Bone Springs"), true], //20%, 10mp
        [Effect.get("Walberg's Dim Bulb"), true], //10%, 5mp
        [Effect.get("Suspicious Gaze"), true], //10%, 10mp
        [Effect.get("Song of Slowness"), true], //50%, 100mp
        [Effect.get("Nearly Silent Hunting"), true], //25%, 50mp
        [Effect.get("Your Fifteen Minutes"), true], //15%, 50mp
      ]),
    )
  ) {
    return result$1();
  }

  if (canAsdonBuff(Effect.get("Driving Quickly"))) {
    if (!speculative) {
      asdonBuff$1(Effect.get("Driving Quickly"));
    }
    handleEffect$1(Effect.get("Driving Quickly"));
  }
  if (pass$1()) {
    return result$1();
  }

  if (bat_formBats(speculative)) {
    handleEffect$1(Effect.get("Bats Form"));
  }
  if (pass$1()) {
    return result$1();
  }

  if (auto_birdModifier("Initiative") > 0) {
    if (tryEffects$2(new Map([[Effect.get("Blessing of the Bird"), true]]))) {
      return result$1();
    }
  }

  if (auto_favoriteBirdModifier("Initiative") > 0) {
    if (
      tryEffects$2(
        new Map([[Effect.get("Blessing of your favorite Bird"), true]]),
      )
    ) {
      return result$1();
    }
  }

  if (
    doEquips &&
    auto_have_familiar(Familiar.get("Grim Brother")) &&
    haveEffect(Effect.get("Soles of Glass")) === 0 &&
    toBoolean(getProperty("_grimBuff")) === false
  ) {
    if (!speculative) {
      // We must visit the familiar's page before we can select the choice.
      auto_log_debug$1("Attempting to visit Grim brother");
      visitUrl("familiar.php?action=chatgrim&pwd", true);
      auto_log_debug$1("Attempting to select Soles of Glass");
      visitUrl("choice.php?pwd&whichchoice=835&option=1", true);
    }

    handleEffect$1(Effect.get("Soles of Glass"));
    if (pass$1()) {
      return result$1();
    }
  }

  let ef_to_try: Map<Effect, boolean> = new Map([
    //organized by %/turn and %. Items
    [Effect.get("Clear Ears, Can't Lose"), true], //100%, 80 turns
    [Effect.get("Poppy Performance"), true], //100%, 30 turns
    [Effect.get("Patent Alacrity"), true], //100%, 20 turns
    [Effect.get("Fishy, Oily"), true], //60%, 40 turns
    [Effect.get("Alacri Tea"), true], //50%, 30 turns
    [Effect.get("Adorable Lookout"), true], //30%, 10 turns
    [Effect.get("All Fired Up"), true], //30%, 10 turns
    [Effect.get("Ticking Clock"), true], //30%, 10 turns
    [Effect.get("Well-Swabbed Ear"), true], //30%, 10 turns
    [Effect.get("Human-Insect Hybrid"), true], //25%, 30 turns
    [Effect.get("Sepia Tan"), true], //20%, 25 turns
    [Effect.get("The Glistening"), true], //20%, 15 turns
    [Effect.get("Sugar Rush"), true], //20%, 1-15 turns
  ]); // eff_to_try
  if (tryEffects$2(ef_to_try)) {
    return result$1();
  }

  if (canInteract()) {
    // Not worth making in HC
    ef_to_try = new Map([[Effect.get("Provocative Perkiness"), true]]);
    if (tryEffects$2(ef_to_try)) {
      return result$1();
    }
  }

  if (
    auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect(Effect.get("init.enh")) === 0 &&
    auto_is_valid$3(Effect.get("init.enh"))
  ) {
    if (!speculative) {
      auto_sourceTerminalEnhance("init");
    }
    handleEffect$1(Effect.get("init.enh"));
    if (pass$1()) {
      return result$1();
    }
  }

  if (doEquips && auto_canBeachCombHead("init")) {
    if (!speculative) {
      auto_beachCombHead("init");
    }
    handleEffect$1(auto_beachCombHeadEffect("init"));
    if (pass$1()) {
      return result$1();
    }
  }

  if (
    doEquips &&
    auto_haveCCSC() &&
    haveEffect(Effect.get("Peppermint Rush")) === 0 &&
    !toBoolean(getProperty("_candyCaneSwordLyle"))
  ) {
    if (!speculative) {
      equip(Item.get("candy cane sword cane"));
      const temp: string = visitUrl(
        "place.php?whichplace=monorail&action=monorail_lyle",
      );
    }
    handleEffect$1(Effect.get("Peppermint Rush"));
    if (pass$1()) {
      return result$1();
    }
  }

  if (doEquips && amt >= 400) {
    if (
      !toBoolean(getProperty("_bowleggedSwaggerUsed")) &&
      buffMaintain$2(Effect.get("Bow-Legged Swagger"), 0, 1, 1, speculative)
    ) {
      if (speculative) {
        delta += delta + numericModifier("Initiative");
      }
      auto_log_debug$1(
        `With Bow-Legged Swagger we ${speculative ? "can get to" : "now have"} ${result$1()}`,
      );
    }
    if (pass$1()) {
      return result$1();
    }
  }

  return result$1();
}

function provideInitiative$1(
  amt: number,
  doEquips: boolean,
  speculative: boolean,
): number {
  return provideInitiative(amt, myLocation(), doEquips, speculative);
}

export function provideInitiative$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return provideInitiative(amt, loc, doEquips, false) >= amt;
}

function provideInitiative$3(amt: number, doEquips: boolean): boolean {
  return provideInitiative$2(amt, myLocation(), doEquips);
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

  if (
    (amt.get(Element.get("stench")) ??
      amt.set(Element.get("stench"), 0).get(Element.get("stench"))) > 0
  ) {
    uneffect(Effect.get("Flared Nostrils"));
  }

  const gearLoss: Map<Element, number> = new Map();
  if (!doEquips) {
    //trying to provide without equipment also means trying to reach goal without value provided by current equipment
    //currently equipment is not being locked and may be changed in pre adv after the provider returns success
    //so may need to take into account removal of what is provided by current equipment to compensate
    //must reduce the result (not raise goal value) since other functions look at the result
    let unequipsString: string = "";
    for (const sl of Slot.get([
      "hat",
      "weapon",
      "off-hand",
      "back",
      "shirt",
      "pants",
      "acc1",
      "acc2",
      "acc3",
      "familiar",
    ])) {
      //simulate removing all gear regardless of individual res modifiers, must account for familiar weight or outfit bonus
      if (equippedItem(sl) !== Item.none) {
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
              simValue(`${ele} resistance`) -
                numericModifier(`${ele} resistance`),
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
        (delta.get(ele) ?? delta.set(ele, 0).get(ele)) +
        (gearLoss.get(ele) ?? gearLoss.set(ele, 0).get(ele)),
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
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${resultstring()}`,
    );
  }

  function pass$6(ele: Element): boolean {
    return result$6(ele) >= (amt.get(ele) ?? amt.set(ele, 0).get(ele));
  }

  function pass$7(): boolean {
    for (const ele of amt.keys()) {
      if (!pass$6(ele)) {
        return false;
      }
    }
    if (
      canChangeFamiliar() &&
      Familiar.get([
        "Trick-or-Treating Tot",
        "Mu",
        "Exotic Parrot",
        "Cooler Yeti",
      ]).includes(myFamiliar())
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
      let max_1: string = "";
      for (const [ele, goal] of amt) {
        if (length(max_1) > 0) {
          max_1 += ",";
        }
        max_1 += `2000${ele} resistance ${goal}max`;
      }
      simMaximizeWith(loc, max_1);
    } else {
      for (const [ele, goal] of amt) {
        addToMaximize(`2000${ele} resistance ${goal}max`);
      }
      simMaximize$1(loc);
    }
    for (const ele of amt.keys()) {
      delta.set(
        ele,
        toInt(
          simValue(`${ele} Resistance`) - numericModifier(`${ele} Resistance`),
        ),
      );
    }
    auto_log_debug$1(`With gear we can get to ${resultstring()}`);
  }

  if (pass$7()) {
    return result$7();
  }

  function tryEffects$7(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    tryEffects$7(
      new Map([
        [Effect.get("Elemental Saucesphere"), true],
        [Effect.get("Astral Shell"), true],
        [Effect.get("Hide of Sobek"), true],
        [Effect.get("Spectral Awareness"), true],
        [Effect.get("Scariersauce"), true],
        [Effect.get("Scarysauce"), true],
        [Effect.get("Blessing of the Bird"), true],
        [Effect.get("Blessing of your favorite Bird"), true],
        [Effect.get("Feeling Peaceful"), true],
        [Effect.get("Shifted Reality"), true],
      ]),
    )
  ) {
    return result$7();
  }

  if (bat_formMist(speculative)) {
    handleEffect$6(Effect.get("Mist Form"));
  }
  if (pass$7()) {
    return result$7();
  }

  if (doEquips && canChangeFamiliar()) {
    let resfam: Familiar = Familiar.none;
    for (const fam of Familiar.get([
      "Trick-or-Treating Tot",
      "Mu",
      "Exotic Parrot",
    ])) {
      if (auto_have_familiar(fam)) {
        resfam = fam;
        break;
      }
    }
    if (resfam !== Familiar.none) {
      //Buff fam weight early
      buffMaintain$4(Effect.get("Leash of Linguini"));
      buffMaintain$4(Effect.get("Thoughtful Empathy"));
      buffMaintain$4(Effect.get("Empathy"));
      buffMaintain$4(Effect.get("Blood Bond"));
      buffMaintain$4(Effect.get("Only Dogs Love a Drunken Sailor"));
      buffMaintain$4(Effect.get("Best Pals"));
      //Manual override for the resfam to be the Cooler Yeti when we ONLY want Cold Resistance and it is better than what we already chose from one of the multi-res fams
      if (
        auto_haveCoolerYeti() &&
        amt.size === 1 &&
        (amt.get(Element.get("cold")) ??
          amt.set(Element.get("cold"), 0).get(Element.get("cold"))) > 0
      ) {
        if (
          ((resfam === Familiar.get("Mu") ||
            resfam === Familiar.get("Exotic Parrot")) &&
            floor((auto_famWeight$1(resfam) - 5) / 20 + 1) <
              floor(auto_famWeight$1(Familiar.get("Cooler Yeti")) / 11)) ||
          5 < floor(auto_famWeight$1(Familiar.get("Cooler Yeti")) / 11)
        ) {
          resfam = Familiar.get("Cooler Yeti");
        }
      }
      // need to use now so maximizer will see it
      useFamiliar(resfam);
      if (resfam === Familiar.get("Trick-or-Treating Tot")) {
        cliExecute("acquire 1 li'l candy corn costume");
      }
      // update maximizer scores with familiar
      simMaximize$1(loc);
      for (const ele of amt.keys()) {
        delta.set(
          ele,
          toInt(
            simValue(`${ele} Resistance`) -
              numericModifier(`${ele} Resistance`),
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
      tryEffects$7(
        new Map([
          [Effect.get("Minor Invulnerability"), true], //+3 all res, 5 meat/adv, 33 meat/res, 6.7 meat/all res
          [Effect.get("Incredibly Healthy"), true], //+3 all res, 78.6 meat/adv, 131 meat/res, 26.2 meat/all res
          [Effect.get("Oiled-Up"), true], //+2 all res, 14.6 meat/adv, 196 meat/res, 29.2 meat/all res
          [Effect.get("Well-Oiled"), true], //+1 all res, 78.6 meat/adv, 393 meat/res, 78.6 meat/all res
          [Effect.get("Red Door Syndrome"), true], //+2 all res, 100 meat/adv, 500 meat/res, 100 meat/all res
          [Effect.get("Covered in the Rainbow"), true], //+2 all res, 15 meat/adv, 600 meat/res, 120 meat/all res
          [Effect.get("Egged On"), true], //+3 all res, 625 meat/adv, 2083 meat/res, 417 meat/all res
          [Effect.get("Flame-Retardant Trousers"), true], //+1 hot res, 20 meat/adv, 100 meat/res
          [Effect.get("Fireproof Lips"), true], //+9 hot res, 1100 meat/adv, 1222 meat/res
          [Effect.get("Insulated Trousers"), true], //+1 cold res, 20 meat/adv, 100 meat/res
          [Effect.get("Fever From the Flavor"), true], //+9 cold res, 1774 meat/adv, 1971 meat/res
          [Effect.get("Neutered Nostrils"), true], //+2 stench res, 10 meat/adv, 50 meat/res
          [Effect.get("Smelly Pants"), true], //+1 stench res, 20 meat/adv, 100 meat/res
          [Effect.get("Temporarily Filtered"), true], //+5 stench res, 91.25 meat/adv, 365 meat/res
          [Effect.get("Twangy"), true], //+4 stench/sleaze res, 70 meat/adv, 525 meat/res, 263 meat/both res
          [Effect.get("Can't Smell Nothin'"), true], //+9 stench res, 1000 meat/adv, 1111 meat/res
          [Effect.get("Balls of Ectoplasm"), true], //+1 spooky res, 10 meat/adv, 100 meat/res
          [Effect.get("Spookypants"), true], //+1 spooky res, 20 meat/adv, 100 meat/res
          [Effect.get("Hyphemariffic"), true], //+9 spooky res, 1717 meat/adv, 1907 meat/res
          [Effect.get("Gritty"), true], //+3 spooky res, 490 meat/adv, 3266 meat/res
          [Effect.get("Sleaze-Resistant Trousers"), true], //+1 sleaze res, 20 meat/adv, 100 meat/res
          [Effect.get("Hyperoffended"), true], //+9 sleaze res, 1391 meat/adv, 1545 meat/res
          [Effect.get("Too Shamed"), true], //+3 sleaze res, 425 meat/adv, 2833 meat/res
        ]),
      )
    ) {
      return result$7();
    }
  }

  if (doAll) {
    if (shouldUseSpleenForLowPriority() && auto_haveCyberRealm()) {
      if (tryEffects$7(new Map([[Effect.get("Cyber Resist x2000"), true]]))) {
        return result$7();
      }
    }
    if (
      tryEffects$7(
        new Map([
          [Effect.get("Wildsun Boon"), true], //+3 all res, 100 advs, 1/day
        ]),
      )
    ) {
      return result$7();
    }
  }

  return result$7();
}

function provideResistances$1(
  amt: Map<Element, number>,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): Map<Element, number> {
  return provideResistances(amt, loc, doEquips, false, speculative);
}

function provideResistances$2(
  amt: Map<Element, number>,
  doEquips: boolean,
  doAll: boolean,
  speculative: boolean,
): Map<Element, number> {
  return provideResistances(amt, myLocation(), doEquips, doAll, speculative);
}

function provideResistances$3(
  amt: Map<Element, number>,
  doEquips: boolean,
  speculative: boolean,
): Map<Element, number> {
  return provideResistances(amt, myLocation(), doEquips, false, speculative);
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
    if ((res.get(ele) ?? res.set(ele, 0).get(ele)) < i) {
      return false;
    }
  }
  return true;
}

function provideResistances$5(
  amt: Map<Element, number>,
  doEquips: boolean,
): boolean {
  return provideResistances$4(amt, myLocation(), doEquips);
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
    return myBuffedstat(st) + (delta.get(st) ?? delta.set(st, 0.0).get(st));
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
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${resultstring$1()}`,
    );
  }

  function pass$8(st: Stat): boolean {
    return result$8(st) >= (amt.get(st) ?? amt.set(st, 0).get(st));
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
      let max_1: string = "";
      for (const [st, goal] of amt) {
        if (length(max_1) > 0) {
          max_1 += ",";
        }
        max_1 += `200${st} ${goal}max`;
      }
      simMaximizeWith(loc, max_1);
    } else {
      for (const [st, goal] of amt) {
        addToMaximize(`200${st} ${goal}max`);
      }
      simMaximize$1(loc);
    }
    for (const st of amt.keys()) {
      delta.set(st, simValue(`Buffed ${st}`) - myBuffedstat(st));
    }
    auto_log_debug$1(`With gear we can get to ${resultstring$1()}`);
  }

  if (pass$9()) {
    return result$9();
  }

  function tryEffects$8(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    tryEffects$8(
      new Map([
        // muscle effects
        [Effect.get("Juiced and Loose"), true], //+50% mus. nuclear autumn only. 3 MP/adv
        [Effect.get("Quiet Determination"), true], //+25% mus. facial expression. 1 MP/adv
        [Effect.get("Rage of the Reindeer"), true], //+10% mus. +10 weapon dmg. 1 MP/adv
        [Effect.get("Strength of the Tortoise"), true], //+10 mus. 0.2 MP/adv.
        [Effect.get("Disco over Matter"), true], //+10 mus. 0.2 MP/adv.
        [Effect.get("Power Ballad of the Arrowsmith"), true], //+10 mus. +20 maxHP. song. 5 MP (duration varies).
        [Effect.get("Seal Clubbing Frenzy"), true], //+2 mus. 0.2 MP/adv
        [Effect.get("Patience of the Tortoise"), true], //+1 mus. +3 maxHP. 0.2 MP/adv
        // myst effects
        [Effect.get("Mind Vision"), true], //+50% mys. nuclear autumn only. 3 MP/adv
        [Effect.get("Quiet Judgement"), true], //+25% mys. facial expression. 1 MP/adv
        [Effect.get("Tubes of Universal Meat"), true], //+10 mys. 0.2 MP/adv.
        [Effect.get("Mariachi Moisture"), true], //+10 mus. 0.2 MP/adv.
        [Effect.get("The Magical Mojomuscular Melody"), true], //+10 mys. +20 maxMP. song. 3 MP (duration varies).
        [Effect.get("Pasta Oneness"), true], //+2 mys. 0.2 MP/adv
        [Effect.get("Saucemastery"), true], //+1 mys. +3 maxMP. 0.2 MP/adv
        // moxie effects
        [Effect.get("Impeccable Coiffure"), true], //+50% mox. nuclear autumn only. 3 MP/adv
        [Effect.get("Song of Bravado"), true], //+15% all. NOT a song. 10 MP/adv
        [Effect.get("Slippery as a Seal"), true], //+10 mox. 0.2 MP/adv.
        [Effect.get("Lubricating Sauce"), true], //+10 mox. 0.2 MP/adv.
        [Effect.get("The Moxious Madrigal"), true], //+10 mox. song. 2 MP (duration varies).
        [Effect.get("Disco State of Mind"), true], //+2 mox. 0.2 MP/adv
        [Effect.get("Mariachi Mood"), true], //+1 mox. +3 maxHP. 0.2 MP/adv
        // all-stat effects
        [Effect.get("Cheerled"), true], //+50% all. Class=Pig Skinner
        [Effect.get("Big"), true], //+20% all. 1.5 MP/adv
        [Effect.get("Song of Bravado"), true], //+15% all. NOT a song. 10 MP/adv
        [Effect.get("Stevedave's Shanty of Superiority"), true], //+10% all. song. 30 MP (duration varies).
        [Effect.get("Ultraheart"), true], //+50% all, heartstone, 5/day.
        // varying effects
        [Effect.get("Blessing of the Bird"), true],
        [Effect.get("Blessing of your favorite Bird"), true],
        [Effect.get("Feeling Excited"), true],
      ]),
    )
  ) {
    return result$9();
  }

  if (auto_have_skill(Skill.get("Quiet Desperation"))) {
    //+25% mox. facial expression. 1 MP/adv
    tryEffects$8(new Map([[Effect.get("Quiet Desperation"), true]]));
  } else {
    //+10 mox. facial expression. 1 MP/adv
    tryEffects$8(new Map([[Effect.get("Disco Smirk"), true]]));
  }

  if (pass$9()) {
    return result$9();
  }
  // buffs from items
  if (doEquips) {
    if (
      tryEffects$8(
        new Map([
          // muscle effects
          [Effect.get("Browbeaten"), true],
          [Effect.get("Extra Backbone"), true],
          [Effect.get("Extreme Muscle Relaxation"), true],
          [Effect.get("Faboooo"), true],
          [Effect.get("Feroci Tea"), true],
          [Effect.get("Fishy Fortification"), true],
          [Effect.get("Football Eyes"), true],
          [Effect.get("Go Get 'Em, Tiger!"), true],
          [Effect.get("Lycanthropy, Eh?"), true],
          [Effect.get("Marinated"), true],
          [Effect.get("Phorcefullness"), true],
          [Effect.get("Rainy Soul Miasma"), true],
          [Effect.get("Savage Beast Inside"), true],
          [Effect.get("Steroid Boost"), true],
          [Effect.get("Spiky Hair"), true],
          [Effect.get("Sugar Rush"), true],
          [Effect.get("Superheroic"), true],
          [Effect.get("Temporary Lycanthropy"), true],
          [Effect.get("Truly Gritty"), true],
          [Effect.get("Vital"), true],
          [Effect.get("Woad Warrior"), true],
          // myst effects
          [Effect.get("Up To 11"), true],
          [Effect.get("Baconstoned"), true],
          [Effect.get("Erudite"), true],
          [Effect.get("Far Out"), true],
          [Effect.get("Glittering Eyelashes"), true],
          [Effect.get("Liquidy Smoky"), true],
          [Effect.get("Marinated"), true],
          [Effect.get("Mystically Oiled"), true],
          [Effect.get("OMG WTF"), true],
          [Effect.get("Paging Betty"), true],
          [Effect.get("Rainy Soul Miasma"), true],
          [Effect.get("Ready to Snap"), true],
          [Effect.get("Rosewater Mark"), true],
          [Effect.get("Seeing Colors"), true],
          [Effect.get("Sweet, Nuts"), true],
          // moxie effects
          [Effect.get("Almost Cool"), true],
          [Effect.get("Bandersnatched"), true],
          [Effect.get("Busy Bein' Delicious"), true],
          [Effect.get("Butt-Rock Hair"), true],
          [Effect.get("Funky Coal Patina"), true],
          [Effect.get("Liquidy Smoky"), true],
          [Effect.get("Locks Like the Raven"), true],
          [Effect.get("Lycanthropy, Eh?"), true],
          [Effect.get("Memories of Puppy Love"), true],
          [Effect.get("Newt Gets In Your Eyes"), true],
          [Effect.get("Notably Lovely"), true],
          [Effect.get("Oiled Skin"), true],
          [Effect.get("Radiating Black Body&trade;"), true],
          [Effect.get("Spiky Hair"), true],
          [Effect.get("Sugar Rush"), true],
          [Effect.get("Superhuman Sarcasm"), true],
          [Effect.get("Unrunnable Face"), true],
          [Effect.get("Gaffe Free"), true],
          [Effect.get("Poppy Performance"), true],
          // all-stat effects
          [Effect.get("Confidence of the Votive"), true],
          [Effect.get("Pyrite Pride"), true],
          [Effect.get("Human-Human Hybrid"), true],
          [Effect.get("Industrial Strength Starch"), true],
          [Effect.get("Mutated"), true],
          [Effect.get("Seriously Mutated"), true],
          [Effect.get("Pill Power"), true],
          [Effect.get("Slightly Larger Than Usual"), true],
          [Effect.get("Standard Issue Bravery"), true],
          [Effect.get("Tomato Power"), true],
          [Effect.get("Vital"), true],
          [Effect.get("Triple-Sized"), true],
        ]),
      )
    ) {
      return result$9();
    }

    for (const st of amt.keys()) {
      if (!pass$8(st) && auto_canBeachCombHead(st.toString())) {
        if (!speculative) {
          auto_beachCombHead(st.toString());
        }
        handleEffect$7(auto_beachCombHeadEffect(st.toString()));
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
    if ((res.get(st) ?? res.set(st, 0.0).get(st)) < i) {
      return false;
    }
  }
  return true;
}

function provideStats$3(amt: Map<Stat, number>, doEquips: boolean): boolean {
  return provideStats$2(amt, myLocation(), doEquips);
}

function provideMuscle(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  const statsNeeded: Map<Stat, number> = new Map();
  statsNeeded.set(Stat.get("Muscle"), amt);
  const res: Map<Stat, number> = provideStats(
    statsNeeded,
    loc,
    doEquips,
    speculative,
  );
  return (
    res.get(Stat.get("Muscle")) ??
    res.set(Stat.get("Muscle"), 0.0).get(Stat.get("Muscle"))
  );
}

function provideMuscle$1(
  amt: number,
  doEquips: boolean,
  speculative: boolean,
): number {
  return provideMuscle(amt, myLocation(), doEquips, speculative);
}

function provideMuscle$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return provideMuscle(amt, loc, doEquips, false) >= amt;
}

function provideMuscle$3(amt: number, doEquips: boolean): boolean {
  return provideMuscle$2(amt, myLocation(), doEquips);
}

function provideMysticality(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  const statsNeeded: Map<Stat, number> = new Map();
  statsNeeded.set(Stat.get("Mysticality"), amt);
  const res: Map<Stat, number> = provideStats(
    statsNeeded,
    loc,
    doEquips,
    speculative,
  );
  return (
    res.get(Stat.get("Mysticality")) ??
    res.set(Stat.get("Mysticality"), 0.0).get(Stat.get("Mysticality"))
  );
}

function provideMysticality$1(
  amt: number,
  doEquips: boolean,
  speculative: boolean,
): number {
  return provideMysticality(amt, myLocation(), doEquips, speculative);
}

function provideMysticality$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return provideMysticality(amt, loc, doEquips, false) >= amt;
}

function provideMysticality$3(amt: number, doEquips: boolean): boolean {
  return provideMysticality$2(amt, myLocation(), doEquips);
}

function provideMoxie(
  amt: number,
  loc: Location,
  doEquips: boolean,
  speculative: boolean,
): number {
  const statsNeeded: Map<Stat, number> = new Map();
  statsNeeded.set(Stat.get("Moxie"), amt);
  const res: Map<Stat, number> = provideStats(
    statsNeeded,
    loc,
    doEquips,
    speculative,
  );
  return (
    res.get(Stat.get("Moxie")) ??
    res.set(Stat.get("Moxie"), 0.0).get(Stat.get("Moxie"))
  );
}

function provideMoxie$1(
  amt: number,
  doEquips: boolean,
  speculative: boolean,
): number {
  return provideMoxie(amt, myLocation(), doEquips, speculative);
}

function provideMoxie$2(
  amt: number,
  loc: Location,
  doEquips: boolean,
): boolean {
  return provideMoxie(amt, loc, doEquips, false) >= amt;
}

function provideMoxie$3(amt: number, doEquips: boolean): boolean {
  return provideMoxie$2(amt, myLocation(), doEquips);
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
  const alreadyHave: number = numericModifier("Meat Drop");
  const need: number = amt - alreadyHave;
  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough +meat!");
    return alreadyHave;
  }
  let delta: number = 0;
  function result$3(): number {
    return numericModifier("Meat Drop") + delta;
  }
  function pass$3(): boolean {
    return result$3() >= amt;
  }
  if (pass$3()) {
    return result$3();
  }
  // don't craft equipment here. See how much +meat we can get with gear on hand
  if (doEverything) {
    const max_1: string = `500meat ${amt + 100}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Meat Drop") - numericModifier("Meat Drop");
    auto_log_debug$1(`With existing gear we can get to ${result$3()}`);
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
    if (target !== Familiar.none && target !== myFamiliar()) {
      delta += auto_famModifiers(target, "Meat Drop", Item.none);
      auto_log_debug$1(
        `With using familiar: ${target} we can get to ${result$3()}`,
      );
    } else {
      auto_log_debug$1(`Already have desired familar, ${target}, active.`);
    }
    if (pass$3()) {
      return result$3();
    }
  }
  function handleEffect$3(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Meat Drop");
    }
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$3()}`,
    );
  }
  function tryEffects$4(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    tryEffects$4(
      new Map([
        [Effect.get("Polka of Plenty"), true], //50% meat
        [Effect.get("Disco Leer"), true], //10% meat
      ]),
    )
  ) {
    if (pass$3()) {
      return result$3();
    }
  }
  if (canAsdonBuff(Effect.get("Driving Observantly"))) {
    //50% meat, 50% item, 50% booze drops
    if (!speculative) {
      asdonBuff$1(Effect.get("Driving Observantly"));
    }
    handleEffect$3(Effect.get("Driving Observantly"));
  }
  if (pass$3()) {
    return result$3();
  }
  if (canBusk()) {
    beretBusk("meat drop");
  }
  if (pass$3()) {
    return result$3();
  }
  if (bat_formWolf(speculative)) {
    //150% meat, 150% muscle
    handleEffect$3(Effect.get("Wolf Form"));
  }
  if (pass$3()) {
    return result$3();
  }
  if (auto_birdModifier("Meat Drop") > 0) {
    //Can be 20/40/60/80/100% meat drop
    if (tryEffects$4(new Map([[Effect.get("Blessing of the Bird"), true]]))) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (auto_favoriteBirdModifier("Meat Drop") > 0) {
    //Can be 20/40/60/80/100% meat drop
    if (
      tryEffects$4(
        new Map([[Effect.get("Blessing of your favorite Bird"), true]]),
      )
    ) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (isActuallyEd()) {
    //50% meat drop
    if (
      !haveSkill(Skill.get("Gift of the Maid")) &&
      Servant.get("Maid").experience >= 441
    ) {
      visitUrl("charsheet.php");
      if (haveSkill(Skill.get("Gift of the Maid"))) {
        auto_log_warning(
          "Gift of the Maid not properly detected until charsheet refresh.",
          "red",
        );
      }
    }
    if (
      tryEffects$4(
        new Map([
          [Effect.get("Purr of the Feline"), true], //makes the maid 5 levels higher
        ]),
      )
    ) {
      if (pass$3()) {
        return result$3();
      }
    }
  }
  songboomSetting("meat"); //30% meat
  // items
  let ef_to_try: Map<Effect, boolean> = new Map([
    [Effect.get("Flapper Dancin'"), true], //100% meat
    [Effect.get("Heightened Senses"), true], //50% meat, 25% item drop
    [Effect.get("Big Meat Big Prizes"), true], //50% meat
    [Effect.get("Human-Constellation Hybrid"), true], //50% meat
    [Effect.get("Patent Avarice"), true], //50% meat
    [Effect.get("Earning Interest"), true], //50% meat
    [Effect.get("Bet Your Autumn Dollar"), true], //50% meat
    [Effect.get("The Grass...  Is Blue..."), true], //40% meat, 20% item
    [Effect.get("Sweat Equity"), true], //40% meat
    [Effect.get("Greedy Resolve"), true], //30% meat
    [Effect.get("Tubes of Universal Meat"), true], //30% meat
    [Effect.get("Worth Your Salt"), true], //25% meat, max hp +25
    [Effect.get("Human-Fish Hybrid"), true], //10 fam
    [Effect.get("Human-Humanoid Hybrid"), true], //20% meat, 10% all stats
    [Effect.get("Heart of Pink"), true], //20% meat, +3 all stats
    [Effect.get("Kindly Resolve"), true], //5 fam weight
    [Effect.get("Human-Machine Hybrid"), true], //5 fam weight, DA +50, DR 5
    [Effect.get("Only Dogs Love a Drunken Sailor"), true], //5 fam weight, rivalrous with item drop
    [Effect.get("Sweet Heart"), true], // Muscle +X, +2X% meat
    [Effect.get("So You Can Work More..."), true], //10% meat
  ]); // ef_to_try

  if (tryEffects$4(ef_to_try)) {
    if (pass$3()) {
      return result$3();
    }
  }

  if (canInteract()) {
    // Not worth making in HC
    ef_to_try = new Map([[Effect.get("Cranberry Cordiality"), true]]);
    if (tryEffects$4(ef_to_try)) {
      if (pass$3()) {
        return result$3();
      }
    }
  }

  if (haveEffect(Effect.get("Synthesis: Greed")) === 0) {
    rethinkingCandy(Effect.get("Synthesis: Greed")); //300% meat
    if (pass$3()) {
      return result$3();
    }
  }
  if (
    availableAmount(Item.get("li'l pirate costume")) > 0 &&
    canChangeToFamiliar(Familiar.get("Trick-or-Treating Tot")) &&
    !in_heavyrains()
  ) {
    useFamiliar(Familiar.get("Trick-or-Treating Tot"));
    autoEquip$1(Item.get("li'l pirate costume")); //300% meat
    handleFamiliar$1(Familiar.get("Trick-or-Treating Tot"));
    if (pass$3()) {
      return result$3();
    }
  }
  if (!in_wereprof()) {
    //wereprof doesn't like +ML effects outside of Werewolf
    if (tryEffects$4(new Map([[Effect.get("Frosty"), true]]))) {
      //200% meat, 100% item, 100% init, 25 ML
      if (pass$3()) {
        return result$3();
      }
    }
  }
  if (
    auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect(Effect.get("meat.enh")) === 0 &&
    auto_is_valid$3(Effect.get("meat.enh"))
  ) {
    if (!speculative) {
      auto_sourceTerminalEnhance("meat");
    }
    handleEffect$3(Effect.get("meat.enh")); //60% meat
    if (pass$3()) {
      return result$3();
    }
  }
  if (
    itemAmount(Item.get("body spradium")) > 0 &&
    !in_tcrs() &&
    haveEffect(Effect.get("Boxing Day Glow")) === 0
  ) {
    autoChew(1, Item.get("body spradium")); //50% meat, 5 fam weight
    if (pass$3()) {
      return result$3();
    }
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    handleBjornify(Familiar.get("Hobo Monkey")); //25% meat, hot damage, delevels
    //craft IOTM derivative that gives high item bonus
    if (
      equippedItem(Slot.get("off-hand")) !== Item.get("Half a Purse") &&
      !possessEquipment(Item.get("Half a Purse")) &&
      itemAmount(Item.get("lump of Brituminous coal")) > 0
    ) {
      //+X% meat based on smithness (10% if only half a purse is equipped)
      auto_buyUpTo(1, Item.get("loose purse strings"));
      autoCraft(
        "smith",
        1,
        Item.get("lump of Brituminous coal"),
        Item.get("loose purse strings"),
      );
    }
    const max_1: string = `500meat ${amt + 100}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Meat Drop") - numericModifier("Meat Drop");
    auto_log_debug$1(
      `With existing and crafted gear we can get to ${result$3()}`,
    );
    if (pass$3()) {
      return result$3();
    }
  }
  // Use limited resources like Inhaler
  if (doEverything) {
    if (
      tryEffects$4(
        new Map([
          [Effect.get("Shadow Waters"), true], //200% meat, 100% item, 100% init, -10% combat
          [Effect.get("Sinuses For Miles"), true], //200% meat
          [Effect.get("Car-Charged"), true], //100% meat, 100% item, 5-10MP, 50% init, 50% spell dmg, +3 stats per fight
          [Effect.get("Incredibly Well Lit"), true], //100% meat, 50% item
        ]),
      )
    ) {
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect(Effect.get("Meet the Meat"))) &
          toInt(auto_is_valid$3(Effect.get("Meet the Meat"))),
      )
    ) {
      if (!speculative) {
        zataraSeaside("meat");
      }
      handleEffect$3(Effect.get("Meet the Meat")); //100% meat, 50% gear drops
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      getProperty("sidequestArenaCompleted") === "fratboy" &&
      !toBoolean(getProperty("concertVisited")) &&
      haveEffect(Effect.get("Winklered")) === 0
    ) {
      if (is_professor()) {
        //Need to manually equip because professor
        if (!haveEquipped(Item.get("beer helmet"))) {
          equip(Item.get("beer helmet"));
        }
        if (!haveEquipped(Item.get("distressed denim pants"))) {
          equip(Item.get("distressed denim pants"));
        }
        if (!haveEquipped(Item.get("bejeweled pledge pin"))) {
          equip(Item.get("bejeweled pledge pin"));
        }
      } else {
        outfit("Frat Warrior Fatigues");
      }
      if (!speculative) {
        cliExecute("concert 2"); //40% meat
      }
      handleEffect$3(Effect.get("Winklered")); //40% meat
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
      !toBoolean(getProperty("auto_limitConsume")) &&
      haveEffect(Effect.get("Tryptofan")) === 0 &&
      creatableAmount(Item.get("prize turkey")) > 0 &&
      canEat$1(Item.get("prize turkey")) &&
      stomach_left() > Item.get("prize turkey").fullness
    ) {
      if (!speculative) {
        buy(
          Coinmaster.get("Skeleton of Crimbo Past"),
          1,
          Item.get("prize turkey"),
        );
        autoEat(1, Item.get("prize turkey"));
      }
      handleEffect$3(Effect.get("Tryptofan")); //100% meat, 50 init
      if (pass$3()) {
        return result$3();
      }
    }
    if (
      !in_tcrs() &&
      haveEffect(Effect.get("Grueling Gravitas")) === 0 &&
      creatableAmount(Item.get("medicinal gruel")) > 0 &&
      spleen_left() > Item.get("medicinal gruel").spleen
    ) {
      if (!speculative) {
        buy(
          Coinmaster.get("Skeleton of Crimbo Past"),
          1,
          Item.get("medicinal gruel"),
        );
        autoChew(1, Item.get("medicinal gruel"));
      }
      handleEffect$3(Effect.get("Grueling Gravitas")); //5 fam weight
      if (pass$3()) {
        return result$3();
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
        if (eff === Effect.get("Frosty") && in_wereprof()) {
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
    auto_log_debug$1(`With limited buffs we can get to ${result$3()}`);
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

function provideMeat$3(amt: number, doEverything: boolean): boolean {
  return provideMeat$2(amt, myLocation(), doEverything);
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

  const alreadyHave: number = numericModifier("Item Drop");
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough +item!");
    return alreadyHave;
  }

  let delta: number = 0;

  function result$2(): number {
    return numericModifier("Item Drop") + delta;
  }

  function pass$2(): boolean {
    return result$2() >= amt;
  }

  if (pass$2()) {
    return result$2();
  }
  // don't craft equipment here. See how much +item we can get with gear on hand
  if (doEverything) {
    const max_1: string = `500item ${amt + 100}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Item Drop") - numericModifier("Item Drop");
    auto_log_debug$1(`With existing gear we can get to ${result$2()}`);

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
    if (target !== Familiar.none && target !== myFamiliar()) {
      delta += auto_famModifiers(target, "Item Drop", Item.none);
      auto_log_debug$1(
        `With using familiar: ${target} we can get to ${result$2()}`,
      );
    } else {
      auto_log_debug$1(`Already have desired familar, ${target}, active.`);
    }

    if (pass$2()) {
      return result$2();
    }
  }

  function handleEffect$2(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Item Drop");
    }
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result$2()}`,
    );
  }

  function tryEffects$3(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
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
    buffMaintain$4(Effect.get("Fishy Whiskers")); // HR only
  }

  if (in_amw() && amw_canAfford(Skill.get("Beef Goggles"))) {
    if (tryEffects$3(new Map([[Effect.get("Beef Goggles"), true]]))) {
      // meatpath only
      return result$2();
    }
  }
  // unlimited skills
  if (
    tryEffects$3(
      new Map([
        [Effect.get("Fat Leon's Phat Loot Lyric"), true], //20% item
        [Effect.get("Singer's Faithful Ocelot"), true], //10% item
        [Effect.get("Who's Going to Pay This Drunken Sailor?"), true], //25% item, rivalrous with +5 lb fam weight
      ]),
    )
  ) {
    return result$2();
  }

  if (canAsdonBuff(Effect.get("Driving Observantly"))) {
    //50% meat, 50% item, 50% booze drops
    if (!speculative) {
      asdonBuff$1(Effect.get("Driving Observantly"));
    }
    handleEffect$2(Effect.get("Driving Observantly"));
  }
  if (pass$2()) {
    return result$2();
  }

  if (!bat_wantHowl(loc) && bat_formBats(speculative)) {
    //150% item, 150% init
    handleEffect$2(Effect.get("Bats Form"));
  }
  if (pass$2()) {
    return result$2();
  }

  if (auto_birdModifier("Item Drop") > 0) {
    //Can be 10/20/30/40/50% item drop
    if (tryEffects$3(new Map([[Effect.get("Blessing of the Bird"), true]]))) {
      return result$2();
    }
  }

  if (auto_favoriteBirdModifier("Item Drop") > 0) {
    //Can be 10/20/30/40/50% item drop
    if (
      tryEffects$3(
        new Map([[Effect.get("Blessing of your favorite Bird"), true]]),
      )
    ) {
      return result$2();
    }
  }
  // items
  if (
    tryEffects$3(
      new Map([
        [Effect.get("Unusual Perspective"), true], //50% item
        [Effect.get("Five Sticky Fingers"), true], //50% item
        [Effect.get("Spitting Rhymes"), true], //50% item
        [Effect.get("Wet and Greedy"), true], //25% item
        [Effect.get("Serendipi Tea"), true], //25% item
        [Effect.get("Glowing Hands"), true], //25% item
        [Effect.get("Eagle Eyes"), true], //20% item
        [Effect.get("Juiced and Jacked"), true], //20% item
        [Effect.get("The Grass...  Is Blue..."), true], //40% meat, 20% item
        [Effect.get("Joyful Resolve"), true], //15% item
        [Effect.get("Lubricating Sauce"), true], //15% item
        [Effect.get("Fortunate Resolve"), true], //10% item
        [Effect.get("Human-Human Hybrid"), true], //10% item
        [Effect.get("Heart of Lavender"), true], //10% item
      ]),
    )
  ) {
    return result$2();
  }

  if (!in_wereprof()) {
    //wereprof doesn't like +ML effects outside of Werewolf
    if (tryEffects$3(new Map([[Effect.get("Frosty"), true]]))) {
      //200% meat, 100% item, 100% init, 25 ML
      return result$2();
    }
  }

  if (
    auto_is_valid(Item.get("possessed sugar cube")) &&
    itemAmount(Item.get("possessed sugar cube")) > 0 &&
    haveEffect(Effect.get("Dance of the Sugar Fairy")) === 0
  ) {
    if (!speculative) {
      cliExecute("make sugar fairy");
    }
    handleEffect$2(Effect.get("Dance of the Sugar Fairy")); //25% item
    if (pass$2()) {
      return result$2();
    }
  }

  if (
    auto_sourceTerminalEnhanceLeft() > 0 &&
    haveEffect(Effect.get("items.enh")) === 0 &&
    auto_is_valid$3(Effect.get("items.enh"))
  ) {
    if (!speculative) {
      //30% item
      auto_sourceTerminalEnhance("items");
    }
    handleEffect$2(Effect.get("items.enh"));
    if (pass$2()) {
      return result$2();
    }
  }
  //check specific item drop bonus
  const itemFoodNeed: generic_t = zone_needItemFood(loc);
  const itemBoozeNeed: generic_t = zone_needItemBooze(loc);
  let itemDropFood: number = result$2() + simValue("Food Drop");
  let itemDropBooze: number = result$2() + simValue("Booze Drop");
  if (itemFoodNeed._boolean && itemDropFood < itemFoodNeed._float) {
    auto_log_debug$1("Trying food drop supplements");
    //max at start of an expression with item and food drop is ineffective in combining them, have to let the maximizer try to add on top
    addToMaximize(`49food drop ${ceil(itemFoodNeed._float)}max`);
    simMaximize();
    itemDropFood = simValue("Item Drop") + simValue("Food Drop");
  }
  if (itemBoozeNeed._boolean && itemDropBooze < itemBoozeNeed._float) {
    auto_log_debug$1("Trying booze drop supplements");
    addToMaximize(`49booze drop ${ceil(itemBoozeNeed._float)}max`);
    simMaximize();
    itemDropBooze = simValue("Item Drop") + simValue("Booze Drop");
    //no zone item yet needs both food and booze, bottle of Chateau de Vinegar exception is a cooking ingredient but doesn't use food drop bonus
  }
  if (pass$2()) {
    return result$2();
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    //craft IOTM derivative that gives high item bonus
    if (
      !possessEquipment(Item.get("A Light that Never Goes Out")) &&
      itemAmount(Item.get("lump of Brituminous coal")) > 0 &&
      auto_is_valid(Item.get("A Light that Never Goes Out"))
    ) {
      auto_buyUpTo(1, Item.get("third-hand lantern"));
      autoCraft(
        "smith",
        1,
        Item.get("lump of Brituminous coal"),
        Item.get("third-hand lantern"),
      );
    }

    if (
      auto_is_valid(Item.get("broken champagne bottle")) &&
      toInt(getProperty("garbageChampagneCharge")) > 0
    ) {
      //fold and remove maximizer block on using IOTM with 9 charges a day that doubles item drop chance
      januaryToteAcquire(Item.get("broken champagne bottle"));
    }

    const max_1: string = `500item ${amt + 100}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta = simValue("Item Drop") - numericModifier("Item Drop");
    auto_log_debug$1(
      `With existing and crafted gear we can get to ${result$2()}`,
    );

    if (pass$2()) {
      return result$2();
    }
  }

  if (doEverything && amt >= 400) {
    if (
      !toBoolean(getProperty("_steelyEyedSquintUsed")) &&
      buffMaintain$2(Effect.get("Steely-Eyed Squint"), 0, 1, 1, speculative)
    ) {
      if (speculative) {
        delta += delta + numericModifier("Item Drop");
      }
      auto_log_debug$1(
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
      tryEffects$3(
        new Map([
          [Effect.get("Shadow Waters"), true], //200% meat, 100% item, 100% init, -10% combat
          [Effect.get("One Very Clear Eye"), true], //100% item
          [Effect.get("Car-Charged"), true], //100% meat, 100% item, 5-10MP, 50% init, 50% spell dmg, +3 stats per fight
          [Effect.get("Incredibly Well Lit"), true], //100% meat, 50% item
          [Effect.get("Crunching Leaves"), true], //25% item, +5 combat
        ]),
      )
    ) {
      if (pass$2()) {
        return result$2();
      }
    }
    //beret busk if possible
    if (canBusk()) {
      beretBusk("item drop");
    }
    if (pass$2()) {
      return result$2();
    }
    if (auto_canARBSupplyDrop()) {
      ARBSupplyDrop("item drop");
    }
    if (pass$2()) {
      return result$2();
    }
    if (
      zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect(Effect.get("There's No N in Love"))) &
          toInt(auto_is_valid$3(Effect.get("There's No N in Love"))),
      )
    ) {
      if (!speculative) {
        zataraSeaside("item");
      }
      handleEffect$2(Effect.get("There's No N in Love")); //50% booze/food/item
      if (pass$2()) {
        return result$2();
      }
    }
    if (
      getProperty("sidequestArenaCompleted") === "hippy" &&
      !toBoolean(getProperty("concertVisited")) &&
      haveEffect(Effect.get("Dilated Pupils")) === 0
    ) {
      if (is_professor()) {
        //Need to manually equip because professor
        if (!haveEquipped(Item.get("reinforced beaded headband"))) {
          equip(Item.get("reinforced beaded headband"));
        }
        if (!haveEquipped(Item.get("bullet-proof corduroys"))) {
          equip(Item.get("bullet-proof corduroys"));
        }
        if (!haveEquipped(Item.get("round purple sunglasses"))) {
          equip(Item.get("round purple sunglasses"));
        }
      } else {
        outfit("War Hippy Fatigues");
      }
      if (!speculative) {
        cliExecute("concert 2"); //20% item
      }
      handleEffect$2(Effect.get("Dilated Pupils")); //20% item
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
      !toBoolean(getProperty("auto_limitConsume")) &&
      haveEffect(Effect.get("Ordained")) === 0 &&
      creatableAmount(Item.get("Smoking Pope")) > 0 &&
      canDrink$1(Item.get("Smoking Pope")) &&
      inebriety_left() > Item.get("Smoking Pope").inebriety
    ) {
      if (!speculative) {
        buy(
          Coinmaster.get("Skeleton of Crimbo Past"),
          1,
          Item.get("Smoking Pope"),
        );
        autoDrink(1, Item.get("Smoking Pope"));
      }
      handleEffect$2(Effect.get("Ordained")); //50% item, 50% skeleton damage
      if (pass$2()) {
        return result$2();
      }
    }
    if (
      !in_tcrs() &&
      haveEffect(Effect.get("Grueling Gravitas")) === 0 &&
      creatableAmount(Item.get("medicinal gruel")) > 0 &&
      spleen_left() > Item.get("medicinal gruel").spleen
    ) {
      if (!speculative) {
        buy(
          Coinmaster.get("Skeleton of Crimbo Past"),
          1,
          Item.get("medicinal gruel"),
        );
        autoChew(1, Item.get("medicinal gruel"));
      }
      handleEffect$2(Effect.get("Grueling Gravitas")); //5 fam weight
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
        if (eff === Effect.get("Frosty") && in_wereprof()) {
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
    auto_log_debug$1(`With limited buffs we can get to ${result$2()}`);
    if (pass$2()) {
      return result$2();
    }
  }
  return result$2();
}

function provideItem$1(
  amt: number,
  doEverything: boolean,
  speculative: boolean,
): number {
  return provideItem(amt, myLocation(), doEverything, speculative);
}

export function provideItem$2(
  amt: number,
  loc: Location,
  doEverything: boolean,
): boolean {
  return provideItem(amt, loc, doEverything, false) >= amt;
}

function provideItem$3(amt: number, doEverything: boolean): boolean {
  return provideItem$2(amt, myLocation(), doEverything);
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

  const alreadyHave: number = numericModifier("Familiar Experience") + 1; //default of 1 fam exp per combat
  const need: number = amt - alreadyHave;

  if (need > 0) {
    auto_log_debug$1(
      `We currently have ${alreadyHave}, so we need an extra ${need}`,
    );
  } else {
    auto_log_debug$1("We already have enough +fam experience!");
    return alreadyHave;
  }

  let delta: number = 0;

  function result(): number {
    return numericModifier("Familiar Experience") + 1 + delta;
  }

  function pass(): boolean {
    return result() >= amt;
  }

  if (pass()) {
    return result();
  }
  // don't craft equipment here. See how much +fam xp we can get with gear on hand
  if (doEquips || doEverything) {
    const max_1: string = `1000familiar experience ${amt + 10}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta =
      simValue("Familiar Experience") - numericModifier("Familiar Experience");
    auto_log_debug$1(`With existing gear we can get to ${result()}`);

    if (pass()) {
      return result();
    }
  }

  function handleEffect(eff: Effect): void {
    if (speculative) {
      delta += numericModifier(eff, "Familiar Experience");
    }
    auto_log_debug$1(
      `We ${speculative ? "can gain" : "just gained"} ${eff.toString()}, now we have ${result()}`,
    );
  }

  function tryEffects$1(effects: Map<Effect, boolean>): boolean {
    for (const eff of effects.keys()) {
      if (numericModifier(eff, Modifier.get("Familiar Experience")) > 0) {
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
      tryEffects$1(
        new Map([
          [Effect.get("Milk of Familiar Kindness"), true],
          [Effect.get("Milk of Familiar Cruelty"), true],
        ]),
      )
    ) {
      return result();
    }
  }
  // unlimited skills
  if (
    tryEffects$1(
      new Map([
        [Effect.get("Curiosity of Br'er Tarrypin"), true], //+1
      ]),
    )
  ) {
    return result();
  }
  // craft equipment, even limited use, here
  if (doEverything) {
    //craft IOTM derivative that gives high fam xp bonus
    auto_latteRefill$5("famxp"); //+3

    const max_1: string = `1000familiar experience ${amt + 100}max`;
    if (speculative) {
      simMaximizeWith(loc, max_1);
    } else {
      addToMaximize(max_1);
      simMaximize$1(loc);
    }
    delta =
      simValue("familiar experience") - numericModifier("familiar experience");
    auto_log_debug$1(
      `With existing and crafted gear we can get to ${result()}`,
    );

    if (pass()) {
      return result();
    }
  }
  // Use limited resources
  if (doEverything) {
    while (
      haveEffect(Effect.get("Blue Swayed")) < 31 &&
      itemAmount(Item.get("pulled blue taffy")) > 0
    ) {
      auto_log_info$1("Getting Blue Swayed");
      if (tryEffects$1(new Map([[Effect.get("Blue Swayed"), true]]))) {
        //+X/5, decreasing by 5 every 5 turns so keeping it separate
        if (pass()) {
          return result();
        }
      }
    }
    if (
      fullness_left() > 2 &&
      itemAmount(Item.get("roasted vegetable focaccia")) > 0
    ) {
      if (tryEffects$1(new Map([[Effect.get("Feeling Fancy"), true]]))) {
        //+10
        if (pass()) {
          return result();
        }
      }
    }
    candyEggDeviler(); //try to get a deviled candy egg
    if (
      tryEffects$1(
        new Map([
          [Effect.get("Best Pals"), true], //+1
          [Effect.get("Warm Shoulders"), true], //+5
          [Effect.get("Shortly Hydrated"), true], //+5
          [Effect.get("Candied Devil"), true], //+5
          [Effect.get("Black Tongue"), true], //+2
          [Effect.get("Green Tongue"), true], //+2
          [Effect.get("Heart of White"), true], //+1
        ]),
      )
    ) {
      if (pass()) {
        return result();
      }
    }
    if (
      zataraAvailable() &&
      toBoolean(
        toInt(0 === haveEffect(Effect.get("A Girl Named Sue"))) &
          toInt(auto_is_valid$3(Effect.get("A Girl Named Sue"))),
      )
    ) {
      if (!speculative) {
        zataraSeaside("familiar");
      }
      handleEffect(Effect.get("A Girl Named Sue")); //+5
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
          (eff === Effect.get("Blue Swayed") && haveEffect(eff) < 31)
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
          (eff === Effect.get("Blue Swayed") && haveEffect(eff) < 31)
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
    auto_log_debug$1(`With limited buffs we can get to ${result()}`);
    if (pass()) {
      return result();
    }
  }
  return result();
}

function provideFamExp$1(
  amt: number,
  doEquips: boolean,
  doEverything: boolean,
  speculative: boolean,
): number {
  return provideFamExp(amt, myLocation(), doEquips, doEverything, speculative);
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

function provideFamExp$4(amt: number, doEquips: boolean): boolean {
  return provideFamExp$3(amt, doEquips, false);
}
