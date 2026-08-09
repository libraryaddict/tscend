import {
  abort,
  appearanceRates,
  booleanModifier,
  canEquip,
  ceil,
  cliExecute,
  containsText,
  equip,
  equippedAmount,
  equippedItem,
  Familiar,
  familiarWeight,
  fullnessLimit,
  getInventory,
  getProperty,
  getRelated,
  haveEffect,
  haveSkill,
  hippyStoneBroken,
  inebrietyLimit,
  inHardcore,
  isUnrestricted,
  isWearingOutfit,
  Item,
  itemAmount,
  itemType,
  Location,
  max,
  maximize,
  min,
  Modifier,
  Monster,
  myAdventures,
  myBasestat,
  myClass,
  myDaycount,
  myFamiliar,
  myHp,
  myLevel,
  myLocation,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myThrall,
  npcPrice,
  numericModifier,
  outfitPieces,
  retrieveItem,
  setLocation,
  Skill,
  Slot,
  splitString,
  Stat,
  toFloat,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  toSlot,
  weaponHands,
  weaponType,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monsters,
  $path,
  $skill,
  $slot,
  $slots,
  $stat,
  $thrall,
  get,
  have,
  set,
} from "libram";

import { consumptionProgress } from "./auto_consume";
import {
  auto_have_familiar,
  findNonRockFamiliarInTerrarium,
  pathHasFamiliar,
} from "./auto_familiar";
import { disregardInstantKarma } from "./auto_powerlevel";
import { solveDelayZone } from "./auto_routing";
import {
  auto_burnMP,
  auto_can_equip,
  auto_have_skill,
  auto_ignoreExperience,
  auto_is_valid,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  instakillable,
  isArmoryAndLeggeryStoreAvailable,
  isFreeMonster,
  isMeatPoor,
  meatReserve,
  safeGet,
  wrap_item,
} from "./auto_util";
import { zone_delay } from "./auto_zone";
import { auto_jokesterGunFreeKillAvailable } from "./iotms/2010/mr2016";
import {
  isjanuaryToteAvailable,
  januaryToteTurnsLeft,
} from "./iotms/2010/mr2018";
import {
  auto_chestXraysRemaining,
  auto_haveKramcoSausageOMatic,
  auto_sausageFightsToday,
} from "./iotms/2010/mr2019";
import { auto_hasPowerfulGlove } from "./iotms/2020/mr2020";
import {
  auto_backupTarget,
  auto_haveCrystalBall,
  simulatePreAdvForCrystalBall,
} from "./iotms/2020/mr2021";
import {
  auto_canUseJuneCleaver,
  auto_expectedStillsuitAdvs,
  auto_hasStillSuit,
  auto_haveCursedMagnifyingGlass,
  canUseSweatpants,
  getSweat,
} from "./iotms/2020/mr2022";
import { auto_haveBurningLeaves } from "./iotms/2020/mr2023";
import {
  auto_haveBatWings,
  auto_haveDarts,
  auto_haveSpringShoes,
} from "./iotms/2020/mr2024";
import {
  auto_getItemToEquipBCZ,
  auto_haveCupidBow,
  auto_haveMobiusRing,
  auto_timeCopFights,
  auto_timeIsAStripPossible,
  auto_wantToBCZ,
} from "./iotms/2020/mr2025";
import {
  auto_clubEmBackInTimesRemaining,
  auto_codpieceFoldGemScores,
  auto_havePastaWand,
  auto_isInEternityCodpiece,
} from "./iotms/2020/mr2026";
import { applyMaximizePreference } from "./maximizer_parser";
import { in_bhy } from "./paths/2011/bees_hate_you";
import { borisTrusty, is_boris } from "./paths/2012/avatar_of_boris";
import { in_kolhs } from "./paths/2013/kolhs";
import { in_heavyrains } from "./paths/2014/heavy_rains";
import { isActuallyEd } from "./paths/2015/actually_ed_the_undying";
import { in_gnoob } from "./paths/2017/gelatinous_noob";
import { in_glover } from "./paths/2018/g_lover";
import {
  in_pokefam,
  pokefam_buildDefaultMaximize,
} from "./paths/2018/pocket_familiars";
import { in_darkGyffte } from "./paths/2019/dark_gyffte";
import {
  in_koe,
  koe_NeedWhitePixels,
} from "./paths/2019/kingdom_of_exploathing";
import { in_plumber } from "./paths/2020/path_of_the_plumber";
import { in_wildfire } from "./paths/2021/wildfire";
import { in_robot, robot_buildDefaultMaximize } from "./paths/2021/you_robot";
import { in_small } from "./paths/2023/small";
import { in_avantGuard } from "./paths/2024/avant_guard";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
} from "./paths/2024/wereprofessor";
import { in_hattrick } from "./paths/2025/hattrick";
import { getZooBestPunch, in_zootomist } from "./paths/2025/zootomist";
import { in_amw } from "./paths/2026/adventurer_meats_world";
import { inAftercore } from "./paths/casual";
import { cyrptEvilBonus } from "./quests/level_07";
import { Maximizer, maximizer } from "./utils/maximizer";

export function autoEquipToSlot(s: Slot, it: Item): boolean {
  if (!possessEquipment(it) || !auto_can_equip(it)) {
    return false;
  }

  if (maximizer.willEquip(it)) {
    auto_log_warning(`Ignoring duplicate equip of accessory ${it}`);
    return true;
  }
  // This logic lets us force the equipping of multiple accessories with minimal conflict
  const acc1_empty: boolean =
    maximizer.pending($slot`acc1`) === Item.none && !maximizer.has($slot`acc1`);
  const acc2_empty: boolean =
    maximizer.pending($slot`acc2`) === Item.none && !maximizer.has($slot`acc2`);
  const acc3_empty: boolean =
    maximizer.pending($slot`acc3`) === Item.none && !maximizer.has($slot`acc3`);
  if (itemType(it) === "accessory" && s === $slot`acc3` && !acc3_empty) {
    if (acc2_empty) {
      s = $slot`acc2`;
    } else if (acc1_empty) {
      s = $slot`acc1`;
    } else {
      auto_log_warning(
        `We can not equip ${it} because our slots are all full.`,
        "red",
      );
      return false;
    }
  }

  auto_log_info(`Equipping ${it} to slot ${s}`, "gold");

  return maximizer.equip(it, s);
}

export function autoEquip(it: Item): boolean {
  return autoEquipToSlot(toSlot(it), it);
}
// specifically intended for forcing something in to a specific slot,
// instead of just forcing it to be equipped in general
// mostly for the Antique Machete and unstable fulminate
export function autoForceEquip(
  s: Slot,
  it: Item,
  noMaximize: boolean = false,
): boolean {
  if (it === Item.none) {
    return equip(s, it);
  }
  if (!possessEquipment(it) || !auto_can_equip(it)) {
    return false;
  }
  return maximizer.forceEquip(it, s, !noMaximize);
}

export function autoForceEquip$2(it: Item, noMaximize: boolean): boolean {
  // Maximizer will put its preferred accessories in order acc1,acc2,acc3
  // So for accessories, use acc3 for a force as that will get the best remaining maximizer score.
  if (toSlot(it) === $slot`acc1`) {
    return autoForceEquip($slot`acc3`, it, noMaximize);
  }
  return autoForceEquip(toSlot(it), it, noMaximize);
}

export function autoForceEquip$3(it: Item): boolean {
  // Maximizer will put its preferred accessories in order acc1,acc2,acc3
  // So for accessories, use acc3 for a force as that will get the best remaining maximizer score.
  if (toSlot(it) === $slot`acc1`) {
    return autoForceEquip($slot`acc3`, it);
  }
  return autoForceEquip$2(it, false);
}

export function autoOutfit(toWear: string): boolean {
  if (!possessOutfit(toWear, true)) {
    return false;
  }
  // yes I could use +outfit instead here but this makes it simpler to avoid failed maximize calls
  auto_log_debug(`Adding outfit "${toWear}" to maximizer statement`, "gold");
  // Accessory items from outfits we commonly wear
  const CommonOutfitAccessories: Item[] = $items`eXtreme mittens, bejeweled pledge pin, round purple sunglasses, Oscus's pelt, stuffed shoulder parrot`;

  let pass_1: boolean = true;
  for (const [, it] of outfitPieces(toWear).entries()) {
    // Keep required accessories in acc3 slot to preserve our format
    if (CommonOutfitAccessories.includes(it)) {
      pass_1 = pass_1 && autoEquipToSlot($slot`acc3`, it);
    } else {
      pass_1 = pass_1 && autoEquip(it);
    }
  }
  return pass_1;
}

export function autoStripOutfit(toRemove: string): boolean {
  // removes an outfit if you have it equipped

  const outfit_pieces: Map<number, Item> = new Map(
    outfitPieces(toRemove).map((_v, _i) => [_i, _v]),
  );
  if (outfit_pieces.size === 0 || !isWearingOutfit(toRemove)) {
    return false;
  }
  auto_log_info(`Removing your ${toRemove} outfit as requested.`, "blue");
  for (const [, piece] of outfit_pieces) {
    if (toSlot(piece) !== $slot`acc1`) {
      equip(toSlot(piece), Item.none);
    } else {
      for (const accSlot of $slots`acc1, acc2, acc3`) {
        if (equippedItem(accSlot) === piece) {
          equip(accSlot, Item.none);
          break;
        }
      }
    }
  }
  return isWearingOutfit(toRemove);
}

export function equipStatgainIncreasers(
  increaseThisStat: Stat[],
  alwaysEquip: boolean,
): void {
  if (auto_ignoreExperience()) {
    return;
  }
  //want to equip best equipment that increases specified stat gains including out of combat
  //should be frequently called by consume actions so try not to lose HP or MP, but will equip anyway if argument alwaysEquip is true
  const statMaximizer: Maximizer = new Maximizer();
  for (const st of increaseThisStat) {
    let statWeight: number = 1;
    if (st === myPrimestat()) {
      if (disregardInstantKarma()) {
        statWeight = 2;
      }
    } else if (myBasestat(myPrimestat()) > 122 && myBasestat(st) < 70) {
      //>= level 12 or almost there, more offstat experience may be needed for the war outfit (requires 70 mox and 70 mys)
      if (st === $stat`Mysticality` || st === $stat`Moxie`) {
        statWeight = 3;
      }
    }
    statMaximizer.weight(Modifier.get(`${st} Experience Percent`), statWeight);
  }
  let simulatedEquipment: Map<Slot, Item> = statMaximizer.simulate();
  let canIncreaseStatgains: boolean = false;
  for (const st of increaseThisStat) {
    const modifierString: Modifier = Modifier.get(
      `${st.toString()} Experience Percent`,
    );
    if (simValue(modifierString) > numericModifier(modifierString)) {
      canIncreaseStatgains = true;
      break;
    }
  }
  if (!canIncreaseStatgains) {
    return;
  }
  //list only the maximized equipment that increases statgain
  const statgainIncreasers: Map<Slot, Item> = new Map();
  for (const sl of simulatedEquipment.keys()) {
    for (const st of increaseThisStat) {
      if (
        numericModifier(
          simulatedEquipment.get(sl) ?? Item.none,
          `${st.toString()} experience percent`,
        ) !== 0
      ) {
        statgainIncreasers.set(sl, simulatedEquipment.get(sl) ?? Item.none);
        break;
      }
    }
  }
  //solve incompatible hand slots, since only statgain equipment is taken from simulation which leaves potentially incompatible hand equipment remaining
  if (
    (statgainIncreasers.get($slot`off-hand`) ?? Item.none) !== Item.none &&
    (statgainIncreasers.get($slot`weapon`) ?? Item.none) === Item.none
  ) {
    const currentWeaponIncompatibleWithSimulatedOffHand: boolean =
      weaponHands(equippedItem($slot`weapon`)) > 1 ||
      (toSlot(statgainIncreasers.get($slot`off-hand`) ?? Item.none) ===
        $slot`weapon` &&
        weaponType(statgainIncreasers.get($slot`off-hand`) ?? Item.none) !==
          weaponType(equippedItem($slot`weapon`)));
    if (currentWeaponIncompatibleWithSimulatedOffHand) {
      //add maximizer simulated compatible weapon
      statgainIncreasers.set(
        $slot`weapon`,
        simulatedEquipment.get($slot`weapon`) ?? Item.none,
      );
    }
  } else if (
    (statgainIncreasers.get($slot`weapon`) ?? Item.none) !== Item.none &&
    (statgainIncreasers.get($slot`off-hand`) ?? Item.none) === Item.none &&
    toSlot(equippedItem($slot`off-hand`)) === $slot`weapon`
  ) {
    const currentOffHandIncompatibleWithSimulatedWeapon: boolean =
      weaponType(statgainIncreasers.get($slot`weapon`) ?? Item.none) !==
      weaponType(equippedItem($slot`off-hand`));
    if (currentOffHandIncompatibleWithSimulatedWeapon) {
      //add maximizer simulated compatible off-hand
      statgainIncreasers.set(
        $slot`off-hand`,
        simulatedEquipment.get($slot`off-hand`) ?? Item.none,
      );
    }
  }
  //equipment would be equipped in the order it was listed. check if HP or MP would be lost by equipping
  let HPlost: number;
  let mostHPlost: number = 0;
  let MPlost: number;
  let mostMPlost: number = 0;
  let speculateOneItem: string;
  let speculateAllItems: string = "";
  for (const sl of statgainIncreasers.keys()) {
    speculateOneItem = `"equip ${sl.toString()} ${(statgainIncreasers.get(sl) ?? Item.none).toString()};" `;
    cliExecute(`speculate quiet; ${speculateOneItem}`);
    HPlost = toInt(myHp() - simValue($modifier`Buffed HP Maximum`));
    MPlost = toInt(myMp() - simValue($modifier`Buffed MP Maximum`));
    if (HPlost <= 0 && MPlost <= 0) {
      //causes no loss so it can be equipped right now
      equip(statgainIncreasers.get(sl) ?? Item.none, sl);
      continue;
    }
    speculateAllItems += speculateOneItem; //otherwise speculate with all items that have been left out
    if (speculateAllItems !== speculateOneItem) {
      cliExecute(`speculate quiet; ${speculateAllItems}`);
      HPlost = toInt(myHp() - simValue($modifier`Buffed HP Maximum`));
      MPlost = toInt(myMp() - simValue($modifier`Buffed MP Maximum`));
    }
    if (HPlost > mostHPlost) {
      mostHPlost = HPlost;
    }
    if (MPlost > mostMPlost) {
      mostMPlost = MPlost;
    }
  }
  if (mostHPlost === 0 && mostMPlost === 0) {
    auto_log_debug(
      "Done increasing incoming stat gains using equipment",
      "gold",
    );
    return;
  }
  //else try to prevent the HP or MP loss by increasing max HP and MP first using remaining slots
  const targetedHP: number = myHp() + mostHPlost;
  const targetedMP: number = myMp() + mostMPlost;
  const hpMpMaximizer: Maximizer = new Maximizer()
    .weight($modifier`Maximum HP`)
    .min($modifier`Maximum HP`, targetedHP)
    .max($modifier`Maximum HP`, targetedHP)
    .weight($modifier`Maximum MP`)
    .min($modifier`Maximum MP`, targetedMP)
    .max($modifier`Maximum MP`, targetedMP);
  for (const sl of statgainIncreasers.keys()) {
    hpMpMaximizer.excludeSlot(sl); //ignore slots where statgain increasers should be equipped
    const statgainItem: Item = statgainIncreasers.get(sl) ?? Item.none;
    if (toSlot(statgainItem) === $slot`weapon`) {
      //ignore slots that will be incompatible
      if (weaponHands(statgainItem) > 1) {
        hpMpMaximizer.excludeSlot($slot`off-hand`);
      }
      hpMpMaximizer.require("Melee", weaponType(statgainItem) !== $stat`Moxie`);
    }
    if (
      sl === $slot`off-hand` &&
      (statgainIncreasers.get($slot`weapon`) ?? Item.none) === Item.none
    ) {
      hpMpMaximizer.require("1 Handed"); //ignore incompatible weapons
    }
  }
  if (!maximize(hpMpMaximizer.toString(), true)) {
    if (!alwaysEquip) {
      //can't do it, give up
      return;
    }
  }
  auto_log_info(
    "Trying to put on some more equipment first to avoid losing HP or MP before equipping to increase incoming statgains",
    "blue",
  );
  simulatedEquipment.clear();
  simulatedEquipment = hpMpMaximizer.simulate();
  for (const sl of simulatedEquipment.keys()) {
    speculateOneItem = `"equip ${sl.toString()} ${(simulatedEquipment.get(sl) ?? Item.none).toString()};" `;
    cliExecute(`speculate quiet; ${speculateOneItem}`);
    if (simValue($modifier`Buffed HP Maximum`) < myHp()) {
      //skip on collateral loss
      continue;
    }
    if (simValue($modifier`Buffed MP Maximum`) < myMp()) {
      continue;
    }
    equip(simulatedEquipment.get(sl) ?? Item.none, sl);
  }
  let doEquips: boolean = false;
  if (myMaxhp() >= targetedHP && myMaxmp() >= targetedMP) {
    //finished raising max HP and MP so can now equip all statgain equipment hopefully with no HP or MP loss
    doEquips = true;
  } else if (alwaysEquip) {
    auto_burnMP(targetedMP - myMaxmp());
    doEquips = true;
  }

  if (doEquips) {
    for (const sl of statgainIncreasers.keys()) {
      equip(statgainIncreasers.get(sl) ?? Item.none, sl);
    }
  }
}

export function equipStatgainIncreasers$1(
  increaseThisStat: Stat,
  alwaysEquip: boolean,
): void {
  equipStatgainIncreasers([increaseThisStat], alwaysEquip);
}

export function equipStatgainIncreasers$2(): void {
  if (!disregardInstantKarma()) {
    //exclude primestat if level 13
    if (myPrimestat() === $stat`Muscle`) {
      equipStatgainIncreasers([$stat`Mysticality`, $stat`Moxie`], false);
      return;
    } else if (myPrimestat() === $stat`Mysticality`) {
      equipStatgainIncreasers([$stat`Muscle`, $stat`Moxie`], false);
      return;
    } else if (myPrimestat() === $stat`Moxie`) {
      equipStatgainIncreasers([$stat`Muscle`, $stat`Mysticality`], false);
      return;
    }
  }
  equipStatgainIncreasers(
    [$stat`Muscle`, $stat`Mysticality`, $stat`Moxie`],
    false,
  );
}

export function equipStatgainIncreasersFor(it: Item): void {
  //check what stats a consumable will give and equip increasers for it
  const increaseThisStat: Stat[] = [];
  const excludedStat: Stat = disregardInstantKarma()
    ? Stat.none
    : myPrimestat(); //exclude primestat if level 13
  if (it.muscle !== "" && excludedStat !== $stat`Muscle`) {
    increaseThisStat.push($stat`Muscle`);
  }
  if (it.mysticality !== "" && excludedStat !== $stat`Mysticality`) {
    increaseThisStat.push($stat`Mysticality`);
  }
  if (it.moxie !== "" && excludedStat !== $stat`Moxie`) {
    increaseThisStat.push($stat`Moxie`);
  }

  if (increaseThisStat.length !== 0) {
    equipStatgainIncreasers(increaseThisStat, false);
  }
}

function buildDefaultMaximizeStatement(target: Maximizer): void {
  if (in_pokefam()) {
    pokefam_buildDefaultMaximize(target);
    return;
  }
  if (in_robot()) {
    robot_buildDefaultMaximize(target);
    return;
  }

  target
    .weight($modifier`Item Drop`, 5)
    .weight($modifier`Meat Drop`, isMeatPoor() ? 1 : 0.05)
    .weight($modifier`Initiative`, 0.5)
    .weight($modifier`Damage Absorption`, 0.1)
    .max($modifier`Damage Absorption`, 1000)
    .weight($modifier`Damage Reduction`)
    .weight("All Resistance", 0.5)
    .weight("Mainstat", 1.5)
    .require("Fumble", false);

  if (myPrimestat() !== $stat`Moxie`) {
    target.weight($modifier`Moxie`);
  }

  if (in_darkGyffte()) {
    target.weight($modifier`Maximum HP`, 0.8).weight(`HP Regen`, 4);
  } else {
    target
      .weight($modifier`Maximum HP`, 0.4)
      .weight($modifier`Maximum MP`, 0.2)
      .max($modifier`Maximum MP`, 1000);

    target.weight("HP Regen", isActuallyEd() ? 6 : 3);
  }
  if (in_bhy()) {
    target.weight("Beeosity");
  }
  //weapon handling
  if (is_boris()) {
    borisTrusty(); //forceequip trusty. the modification it makes to the maximizer string will be lost so also do next line
    target.excludeSlot($slot`weapon`).excludeSlot($slot`off-hand`); //we do not want maximizer trying to touch weapon or offhand slot in boris
  } else if (!(in_plumber() || in_zootomist())) {
    if (myPrimestat() === $stat`Mysticality`) {
      target
        .weight($modifier`Spell Damage`, 0.25)
        .weight($modifier`Spell Damage Percent`, 1.75);
    } else {
      target
        .weight($modifier`Weapon Damage`, 1.5)
        .weight($modifier`Weapon Damage Percent`, 0.75)
        .weight("Elemental Damage", 1.5);
    }
  }

  if (pathHasFamiliar()) {
    if (!(in_zootomist() && myLevel() < 13)) {
      target.weight($modifier`Familiar Weight`, 2);
    }
    if (familiarWeight(myFamiliar()) < 20) {
      target.weight($modifier`Familiar Experience`, 5);
    }
  }
  if (in_wildfire()) {
    target.weight($modifier`Water`).weight($modifier`Hot Resistance`);
  }

  const primeStat: Stat = myPrimestat();
  if (in_plumber()) {
    target.weight("Plumber").weight($modifier`Monster Level`, -1);
  } else if (auto_ignoreExperience()) {
    // Nothing to do here
  } else if (myLevel() < 13 || get("auto_disregardInstantKarma", false)) {
    //experience scores for the default maximizer statement

    if (getProperty("auto_MLSafetyLimit") === "") {
      //"exp" includes bonus from "ml" sources and values mainstat experience with a variable? score comparable to 0.25ML?
      //in general "10exp" gives a score equivalent to "15(primeStat) experience"
      //"exp" does not value "+(offstat) experience"
      target.weight($modifier`Experience`, 10);
    } else {
      //a value is given for ML safety limit
      //use "(primeStat) experience" instead of "exp" in the hope that it will not include ML however this is not consistently true
      //the conditions under which it still adds value to ML are unclear (level? not ronin? volleyball familiar??)
      //the maximizer score for limited ML is added later by pre_adv
      //pre_adv will tell the maximizer to not value ML over the safety limit (though enforcing that limit is not possible with the maximizer syntax and scoring system)
      target.weight(Modifier.get(`${primeStat} Experience`), 15);
    }
    //TODO the score to give to experience VS percent depends on how much experience is expected from fights
    target.weight(Modifier.get(`${primeStat} Experience Percent`), 5);
  }
  if (myBasestat(primeStat) > 122) {
    //>= level 12 or almost there, more offstat experience may be needed for the war outfit (requires 70 mox and 70 mys)
    if (
      myBasestat($stat`Moxie`) < 70 &&
      getProperty("warProgress") !== "finished"
    ) {
      target
        .weight($modifier`Moxie Experience`, 10)
        .weight($modifier`Moxie Experience Percent`, 3);
    }
    if (
      myBasestat($stat`Mysticality`) < 70 &&
      getProperty("warProgress") !== "finished"
    ) {
      target
        .weight($modifier`Mysticality Experience`, 10)
        .weight($modifier`Mysticality Experience Percent`, 3);
    }
  }
}

export function resetMaximize(): void {
  maximizer.dispose();

  const pref: string = getProperty("auto_maximize_baseline"); //user configured override baseline statement.
  if (
    pref === "" ||
    toLowerCase(pref) === "default" ||
    toLowerCase(pref) === "disabled"
  ) {
    buildDefaultMaximizeStatement(maximizer); //automatically generated baseline statement
  } else {
    const parts: string[] = pref.split("{default}");
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i].trim()) continue;

      applyMaximizePreference(maximizer, parts[i]);
      if (i < parts.length - 1) {
        buildDefaultMaximizeStatement(maximizer);
      }
    }
  }

  // don't want to equip these items automatically
  // snow suit bonus drops every 5 combats so is best saved for important things
  // sword, and staph are text scramblers which cause errors in mafia tracking
  // bathysphere gives -20 lbs familiar weight. under certain circumstances maximizer decides to equip it
  for (const it of $items`sword behind inappropriate prepositions, staph of homophones, Snow Suit, little bitty bathysphere`) {
    if (possessEquipment(it)) {
      maximizer.exclude(it);
    }
  }
  //IOTM [january's garbage tote] specific handling.
  if (isjanuaryToteAvailable()) {
    //preserve leftover charges, prevent mafia halting automation for confirmation.
    if (!get("_garbageItemChanged")) {
      //did not change tote item today
      for (const it of $items`deceased crimbo tree, broken champagne bottle, tinsel tights, wad of used tape, makeshift garbage shirt`) {
        maximizer.exclude(it);
      }
    } else {
      //preserve current charges
      for (const it of $items`deceased crimbo tree, broken champagne bottle, makeshift garbage shirt`) {
        if (januaryToteTurnsLeft(it) > 0) {
          maximizer.exclude(it);
        }
      }
    }
  } else if (
    itemAmount(wrap_item($item`January's Garbage Tote`)) > 0 &&
    in_bhy()
  ) {
    // workaround mafia bug with the maximizer where it tries to equip tote items even though the tote is unusable
    for (const it of $items`deceased crimbo tree, broken champagne bottle, tinsel tights, wad of used tape, makeshift garbage shirt`) {
      maximizer.exclude(it);
    }
  }

  auto_log_debug(`Resetting maximizer to ${maximizer.toString()}`, "gold");
}

export function addBonusToMaximize(
  it: Item,
  amt: number,
  add: boolean = false,
): void {
  if (possessEquipment(it) && auto_can_equip(it)) {
    maximizer.bonus(it, amt, add);
  }
}

function finalizeMaximize(speculative: boolean = false): void {
  if (
    auto_hasStillSuit() &&
    pathHasFamiliar() &&
    inebrietyLimit() > 0 &&
    !in_kolhs() &&
    !in_small()
  ) {
    //always enough bonus to beat the 25 default maximizer score of miniature crystal ball's +initiative enchantment
    //100 to 200 bonus for diminishing returns when drams already high
    addBonusToMaximize(
      $item`tiny stillsuit`,
      100 + toInt(100 * min(1, 10.0 / max(1, auto_expectedStillsuitAdvs()))),
    );
  }
  if (speculative && auto_haveCrystalBall()) {
    //when doing simMaximize, in order to know if miniature crystal ball will be allowed in the simulated location,
    //location queue checks that would normally be done by pre_adv before maximizing equipment need to be simulated here too
    //		TODO consider if simulating all pre_adv equipment changes needs to done in general instead of only the queue part for crystal ball,
    //		crystal ball directly needs this because it has an initiative bonus relevant in a zone where it can be forbidden (twin peak)
    //		but other equipment could be wanted by simulation then replaced by something forced in pre_adv?
    simulatePreAdvForCrystalBall(myLocation());
  }
  //otherwise miniature crystal ball is handled along with monster goals in pre_adv

  const nextMonster: Monster = safeGet("auto_nextEncounter", Monster.none);
  const nextMonsterIsFree: boolean =
    (nextMonster !== Monster.none && isFreeMonster(nextMonster)) ||
    (get("breathitinCharges") > 0 && myLocation().environment === "outdoor");

  if (auto_haveKramcoSausageOMatic()) {
    // Save the first 8 sausage goblins for delay burning, if current location isn't itself a delay zone after SoftblockDelay released
    const saveGoblinForDelay: boolean =
      auto_sausageFightsToday() < 8 &&
      !zone_delay(myLocation()).shouldDelay &&
      solveDelayZone() !== Location.none;
    // don't interfere with backups unless they're equivalent or worse
    const dontSausageBackups: boolean =
      auto_backupTarget() &&
      !$monsters`sausage goblin, Eldritch Tentacle`.includes(
        safeGet("lastCopyableMonster", Monster.none),
      );
    // also don't equip Kramco when using Map the Monsters as sausage goblins override the NC
    if (saveGoblinForDelay || dontSausageBackups || get("mappingMonsters")) {
      maximizer.exclude(wrap_item($item`Kramco Sausage-o-Matic™`));
    }
  }
  if (auto_haveMobiusRing()) {
    if (auto_timeCopFights() >= 11) {
      if (get("mappingMonsters") || auto_backupTarget() || !inHardcore()) {
        // don't equip for non free fights in softcore? (pending allowed conditions like delay zone && none of the monsters in the zone is a sniff/YR target?)
        // don't interfere with backups or Map the Monsters
        maximizer.exclude($item`Möbius ring`);
      }
    } else {
      // we want to make sure we equip mobius ring in meatpath when it's important,
      // so we increse the bonus we give to the ring in meatpath for the priming and the NC
      let mobius_bonus: number = 200;
      if (in_amw()) {
        mobius_bonus = 1000;
      }
      // if the ring hasn't been primed today, we want to prime it to kick the whole thing off
      if (!get("_mobiusRingPrimed")) {
        addBonusToMaximize($item`Möbius ring`, mobius_bonus);
      } else if (
        !nextMonsterIsFree &&
        zone_delay(
          // If the current zone has any delay, equip the ring for a chance at a free time cop or +paradoxicity
          // time cop chance is conjectured to be a flat chance, doubling every 5 paradoxicity, starting at 2%
          // we probably want to target 15 for 16% chance
          myLocation(),
        ).shouldDelay
      ) {
        addBonusToMaximize($item`Möbius ring`, 200);
      } else if (auto_timeIsAStripPossible()) {
        // otherwise, equip the ring if we can get the NC
        addBonusToMaximize($item`Möbius ring`, mobius_bonus);
      }
    }
  }
  if (auto_haveCursedMagnifyingGlass()) {
    if (get("cursedMagnifyingGlassCount") === 13) {
      if (
        get("mappingMonsters") ||
        auto_backupTarget() ||
        (get("_voidFreeFights") >= 5 &&
          get("cursedMagnifyingGlassCount") >= 13 &&
          !inHardcore())
      ) {
        // don't equip for non free fights in softcore? (pending allowed conditions like delay zone && none of the monsters in the zone is a sniff/YR target?)
        // don't interfere with backups or Map the Monsters
        maximizer.exclude($item`cursed magnifying glass`);
      }
    } else if (
      !nextMonsterIsFree &&
      get("cursedMagnifyingGlassCount") < 13 &&
      solveDelayZone() !== Location.none
    ) {
      // add bonus to charge free fights. charge is added when completing nonfree fights only
      // also we can pre-charge it for the next day once we have used our 5 free fights.
      addBonusToMaximize($item`cursed magnifying glass`, 200);
    }
  }

  if (inebrietyLimit() > 6 && !in_small() && !in_plumber()) {
    if (have($item`Cup of 13s`)) {
      // It gives some booze drops, scale up the bonus by our max liver
      addBonusToMaximize($item`Cup of 13s`, Math.min(40, inebrietyLimit() * 7));
    }
    if (have($item`Portable Laughing Stock`)) {
      const score = Math.ceil(
        // eslint-disable-next-line local/verify-properties
        40 * (1 - Math.pow(get("_laughingStockFruitDropped", 0) / 7, 3)),
      );
      if (score > 1) {
        addBonusToMaximize($item`Portable Laughing Stock`, Math.min(40, score));
      }
    }
  }

  if (in_wereprof() && auto_haveDarts()) {
    //Absolutely need darts for Professor. Should level up darts while Werewolf too
    if (is_werewolf()) {
      addBonusToMaximize($item`Everfull Dart Holster`, 1000);
    } else {
      maximizer.equip($item`Everfull Dart Holster`);
    }
  }

  if (
    is_professor() &&
    (possessEquipment($item`biphasic molecular oculus`) ||
      possessEquipment($item`triphasic molecular oculus`))
  ) {
    //Want that Advanced Research as a professor
    const monster_list: Map<Monster, number> = new Map(
      Object.entries(appearanceRates(myLocation())).map(([_k, _v]) => [
        Monster.get(_k),
        _v,
      ]),
    );
    const advresearch: string = getProperty("wereProfessorAdvancedResearch");
    let nooculus: boolean = false;
    let monseen: number = 0;
    let totalmob: number = 0;
    //calculate total non-boss and non-UR mobs
    for (const [mob, freq] of monster_list) {
      if (freq > 0 && mob.id > 0 && mob.copyable && !mob.boss) {
        totalmob += 1;
      }
    }
    //find how many mobs we've already researched and if the count matches total non-boss/non-UR mobs, don't equip the oculus
    for (const [mob, freq] of monster_list) {
      if (freq > 0 && mob.id > 0 && mob.copyable && !mob.boss) {
        if (containsText(advresearch, mob.id.toString())) {
          monseen += 1;
        }
      }
      if (monseen === totalmob) {
        nooculus = true;
      }
    }
    //exclude certain locations as professor that require specific outfits (the War, the Goblin King)
    //as we go through the hidden hospital we equip surgeon gear on the pants slot, so we can end up dying if we cast advanced research
    if (
      $locations`The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform), The Orcish Frat House, The Hippy Camp, The Orcish Frat House (In Disguise), The Hippy Camp (In Disguise), Next to that Barrel with Something Burning in it, Out by that Rusted-Out Car, Over Where the Old Tires Are, Near an Abandoned Refrigerator, Sonofa Beach, The Themthar Hills, McMillicancuddy's Barn, McMillicancuddy's Pond, McMillicancuddy's Back 40, McMillicancuddy's Other Back 40, Cobb's Knob Barracks, Cobb's Knob Harem, Throne Room, The Hidden Hospital`.includes(
        myLocation(),
      )
    ) {
      nooculus = true;
    }
    if (!nooculus) {
      if (possessEquipment($item`biphasic molecular oculus`)) {
        maximizer.equip($item`biphasic molecular oculus`);
      } else {
        maximizer.equip($item`triphasic molecular oculus`);
      }
    }
  }

  if (
    is_professor() &&
    (possessEquipment($item`high-tension exoskeleton`) ||
      possessEquipment($item`ultra-high-tension exoskeleton`) ||
      possessEquipment($item`irresponsible-tension exoskeleton`))
  ) {
    //Want that damage avoidance
    //exclude certain locations as professor that require specific outfits (the War, the Goblin King)
    if (
      !$locations`The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform), The Orcish Frat House, The Hippy Camp, The Orcish Frat House (In Disguise), The Hippy Camp (In Disguise), Next to that Barrel with Something Burning in it, Out by that Rusted-Out Car, Over Where the Old Tires Are, Near an Abandoned Refrigerator, Sonofa Beach, The Themthar Hills, McMillicancuddy's Barn, McMillicancuddy's Pond, McMillicancuddy's Back 40, McMillicancuddy's Other Back 40, Cobb's Knob Barracks, Cobb's Knob Harem, Throne Room`.includes(
        myLocation(),
      )
    ) {
      if (possessEquipment($item`high-tension exoskeleton`)) {
        maximizer.equip($item`high-tension exoskeleton`);
      } else if (possessEquipment($item`ultra-high-tension exoskeleton`)) {
        maximizer.equip($item`ultra-high-tension exoskeleton`);
      } else {
        maximizer.equip($item`irresponsible-tension exoskeleton`);
      }
    }
  }

  if (auto_haveSpringShoes()) {
    if (
      itemAmount($item`ultra-soft ferns`) < 4 ||
      itemAmount($item`crunchy brush`) < 4
    ) {
      // collect the spring shoes potions
      addBonusToMaximize($item`spring shoes`, 200);
    } else if (myMeat() < meatReserve()) {
      // those fruit drops can autosell for a lot
      addBonusToMaximize($item`spring shoes`, 200);
    } else if (myHp() < 0.5 * myMaxhp() && myHp() > 0) {
      addBonusToMaximize($item`spring shoes`, 200); // bonus to heal in wereprof as the werewolf after transition from Professor
    } else {
      // just add a little bonus for the MP generation
      addBonusToMaximize($item`spring shoes`, 50);
    }
  }

  if (auto_haveBatWings() && get("_batWingsFreeFights") < 5) {
    addBonusToMaximize($item`bat wings`, 200); // get the 5 free fights
  }
  if (
    myClass() === $class`Pastamancer` &&
    auto_havePastaWand() &&
    myThrall().level < 11 &&
    (myThrall() === $thrall`Vermincelli` ||
      myThrall() === $thrall`Spice Ghost`) &&
    maximizer.getWeight($modifier`Pasta Thrall Experience`) < 40
  ) {
    // bonus for the thrallxp, if we have a thrall we wanna lvl up
    maximizer.weight($modifier`Pasta Thrall Experience`, 40, false);
  }
  // We still need pixels in KoE, badly.
  if (in_koe() && auto_hasPowerfulGlove()) {
    if (koe_NeedWhitePixels()) {
      addBonusToMaximize($item`Powerful Glove`, 250);
    }
  }
  if (pathHasFamiliar()) {
    addBonusToMaximize($item`familiar scrapbook`, 200); // scrap generation for banish/exp
  }
  if (!nextMonsterIsFree) {
    //does not trigger on free fights
    addBonusToMaximize($item`mafia thumb ring`, 200); // 4% chance +1 adventure
  }
  if (possessEquipment($item`carnivorous potted plant`)) {
    if (get("mappingMonsters") || auto_backupTarget()) {
      // don't interfere with backups or Map the Monsters
      // should also block equipping if support is added for Feel Nostalgic, Lecture on relativity, or fax for YR or other special combat actions
      maximizer.exclude($item`carnivorous potted plant`);
    } else if (
      ((nextMonster === Monster.none || instakillable(nextMonster)) &&
        !in_pokefam() &&
        getProperty("auto_MLSafetyLimit") === "") ||
      get("auto_MLSafetyLimit", 0) >= 25
    ) {
      addBonusToMaximize($item`carnivorous potted plant`, 200); // 4% chance free kill but also 25 ML
    }
  }
  addBonusToMaximize($item`Mr. Screege's spectacles`, 100); // meat stuff
  addBonusToMaximize($item`can of mixed everything`, 100); // random stuff
  if (haveEffect($effect`Blood Bubble`) === 0) {
    // blocks first hit, but doesn't stack with blood bubble
    addBonusToMaximize($item`Eight Days a Week Pill Keeper`, 100);
  }

  if (in_heavyrains()) {
    if (possessEquipment($item`Thor's Pliers`)) {
      addBonusToMaximize($item`Thor's Pliers`, 400); // regenerate lightning
    }
  }

  if (auto_canUseJuneCleaver()) {
    if (
      get("_juneCleaverFightsLeft") < myAdventures() * 1.1 ||
      (fullnessLimit() === 0 && inebrietyLimit() === 0) ||
      consumptionProgress() < 1
    ) {
      addBonusToMaximize($item`June cleaver`, 200); // We want to ramp this up and the NCs are nice as well
    }
  }

  if (canUseSweatpants()) {
    if (getSweat() < 90) {
      addBonusToMaximize($item`designer sweatpants`, 200);
    }
  }

  if (myLocation() === toLocation(getProperty("_seadentWaveZone"))) {
    //Don't want to spend an extra turn if we don't have to
    maximizer.equip($item`Monodent of the Sea`);
  }

  if (
    !in_plumber() &&
    maximizer.pending($slot`weapon`) === Item.none &&
    !maximizer.has($slot`weapon`) &&
    myPrimestat() !== $stat`Mysticality`
  ) {
    if (myClass() === $class`Seal Clubber` && in_glover()) {
      maximizer.weight("Club");
    } else if (in_zootomist() && getZooBestPunch() !== Skill.none) {
      // Nothing to do here. Should be a more general case of "classes that never attack with weapon"?
    } else {
      maximizer.weight("Effective");
    }
  }

  if (auto_haveCupidBow() && !maximizer.hasBonus($item`toy Cupid bow`)) {
    // Small bonus here, we have a big bonus in pre_adv if we need a drop we can't cap.
    addBonusToMaximize($item`toy Cupid bow`, 100);
  }

  if (auto_haveBurningLeaves() && itemAmount($item`inflammable leaf`) < 111) {
    let bonus: number = 20;
    if (in_zootomist() && myLevel() < 13) {
      bonus = 100;
    }
    for (const it of $items`rake, tiny rake`) {
      if (!maximizer.hasBonus(it)) {
        addBonusToMaximize(it, bonus);
      }
    }
  }
  // We could have added LED Candle to maximizer earlier when Jill was our familiar, but it's been replaced.
  if (myFamiliar() !== $familiar`Jill-of-All-Trades`) {
    maximizer.cancelEquip($item`LED candle`);
  }

  auto_codpieceFoldGemScores();
}

export function simMaximize(): boolean {
  const backup: Maximizer = maximizer.clone();
  const backupNextMonster: string = getProperty("auto_nextEncounter");
  finalizeMaximize(true);
  const res: boolean = maximize(maximizer.toString(), true);
  maximizer.restore(backup);
  set("auto_nextEncounter", backupNextMonster);
  return res;
}

export function simMaximize$1(loc: Location): boolean {
  let res: boolean;
  if (myLocation() !== loc) {
    //set the simulated location while maximizing
    const locCache: Location = myLocation();
    setLocation(loc);
    res = simMaximize();
    setLocation(locCache);
  } else {
    res = simMaximize();
  }
  return res;
}

export function simMaximizeWith(
  build: (m: Maximizer) => void,
  loc: Location = myLocation(),
): boolean {
  const backup: Maximizer = maximizer.clone();
  build(maximizer);
  auto_log_debug(`Simulating: ${maximizer.toString()}`, "gold");
  const res: boolean = simMaximize$1(loc);
  maximizer.restore(backup);
  return res;
}

export function simValue(mod: Modifier): number {
  return numericModifier("Generated:_spec", mod);
}

export function equipMaximizedGear(canError: boolean = false): boolean {
  finalizeMaximize();
  let maximizeResult: boolean = maximizer.maximize();
  // below code is to help diagnose, debug and workaround the intermittent issue where the maximizer fails to equip anything in hand slots
  // if this is confirmed as fixed by mafia devs, remove the below code.
  if (
    equippedItem($slot`weapon`) === Item.none &&
    myPath() !== $path`Way of the Surprising Fist`
  ) {
    // do we actually have a weapon we can equip?
    let equippableWeapon: Item = Item.none;
    for (const it of Item.get(Object.keys(getInventory()))) {
      if (toSlot(it) === $slot`weapon` && canEquip(it)) {
        // found a weapon and we should be able to equip it.
        equippableWeapon = it;
        break;
      }
    }
    if (equippableWeapon !== Item.none) {
      auto_log_error(
        "It looks like the maximizer didn't equip any weapons for you. Lets dump some debugging info to help the KolMafia devs look into this.",
      );
      // maximizer will dump a bunch of stuff to the session log with this
      maximizer.debugDump();
      maximizeResult = maximizeResult || maximizer.maximize();
      maximizer.clearWeight("Dump");
      if (get("auto_debug_maximizer", false)) {
        abort(
          "NO WEAPON WAS EQUIPPED BY THE MAXIMIZER. REPORT THIS IN DISCORD AND INCLUDE YOUR SESSION LOG! YOU CAN RE-RUN AUTOSCEND AND IT SHOULD RUN OK (possibly).",
        );
      }
      if (equippedItem($slot`weapon`) === Item.none) {
        // workaround. equip a weapon & re-running maximizer appears to fix the issue.
        equip(equippableWeapon);
        maximizeResult = maximizeResult || maximizer.maximize();
        auto_log_error(
          "No weapon was equipped by the maximizer. If you want to report this to the mafia devs at kolmafia.us include your session log. We have attempted a work around.",
        );
      }
    }
  }

  if (!maximizeResult && !canError) {
    auto_log_error("Error trying to maximize, setting auto_interrupt=true");
    set("auto_interrupt", true);
  }
  return maximizeResult;
}

export function equipOverrides(): void {
  for (const slot_str of [
    "hat",
    "back",
    "shirt",
    "weapon",
    "off-hand",
    "pants",
    "acc",
    "familiar",
  ]) {
    const overrides: string = getProperty(
      `auto_equipment_override_${slot_str}`,
    );
    if (overrides === "") {
      continue;
    }

    let s: Slot;
    if (slot_str === "acc") {
      s = $slot`acc3`;
    } else {
      s = toSlot(slot_str);
    }

    const overrides_split: Map<number, string> = new Map(
      splitString(overrides, ";").map((_v, _i) => [_i, _v]),
    );
    for (const [, item_str] of overrides_split) {
      const it: Item = toItem(item_str);
      if (it === Item.none) {
        auto_log_warning(
          `"${item_str}" does not properly convert to an item (found in auto_equipment_override_${slot_str})`,
          "red",
        );
        continue;
      }
      if (autoEquipToSlot(s, it)) {
        // if equipping to accessories, now move on to the next slot
        // otherwise, stop equipping, since items are listed from highest
        // to lowest priority
        // Run from acc3 to acc1, since maximizer prioritises the other way.
        if (s === $slot`acc3`) {
          s = $slot`acc2`;
        } else if (s === $slot`acc2`) {
          s = $slot`acc1`;
        } else {
          break;
        }
      }
    }
  }
}

export function equipmentAmount(equipment: Item): number {
  if (equipment === Item.none) {
    return 0;
  }

  let amount: number = itemAmount(equipment) + equippedAmount(equipment, true);

  if (
    equipment.toString() in getRelated($item`broken champagne bottle`, "fold")
  ) {
    amount = itemAmount(wrap_item($item`January's Garbage Tote`));
  }

  return amount;
}

export function possessEquipment(equipment: Item): boolean {
  // itemAmount/equippedAmount don't see gems socketed into the Eternity Codpiece.
  return equipmentAmount(equipment) > 0 || auto_isInEternityCodpiece(equipment);
}

export function possessUnrestricted(it: Item): boolean {
  return possessEquipment(it) && isUnrestricted(it);
}

export function possessOutfit(
  outfitToCheck: string,
  checkCanEquip: boolean = false,
): boolean {
  // have_outfit will report false if you're wearing some of the items
  // it will only report true if you have all in inventory or are wearing the whole thing
  // hence this now exists.
  if (outfitPieces(outfitToCheck).length === 0) {
    auto_log_warning(`${outfitToCheck} is not a valid outfit!`);
    return false;
  }

  for (const [, piece] of outfitPieces(outfitToCheck).entries()) {
    if (!possessEquipment(piece)) {
      return false;
    }
    if (checkCanEquip && !canEquip(piece)) {
      return false;
    }
  }
  return true;
}

export function equipBaseline(): void {
  equipMaximizedGear();
}

export function ensureSealClubs(): void {
  cliExecute("acquire 1 seal-clubbing club");
  for (const club of $items`legendary seal-clubbing club, Meat Tenderizer is Murder, lead pipe, porcelain police baton, stainless steel shillelagh, frozen seal spine, ghast iron cleaver, oversized pipe, curmudgel, elegant nightstick, Maxwell's Silver Hammer, red-hot poker, giant foam finger, hilarious comedy prop, infernal toilet brush, mannequin leg, gnawed-up dog bone, severed flipper, spiked femur, corrupt club of corrupt corruption, kneecapping stick, Orcish frat-paddle, flaming crutch, corrupt club of corruption, skeleton bone, remaindered axe, club of corruption, Gnollish flyswatter, seal-clubbing club`) {
    if (possessEquipment(club)) {
      autoForceEquip($slot`weapon`, club);
      return;
    }
  }
}

export function equipRollover(silent: boolean): void {
  if (in_gnoob()) {
    return;
  }

  if (
    auto_have_familiar($familiar`Trick-or-Treating Tot`) &&
    !possessEquipment($item`li'l unicorn costume`) &&
    myMeat() > 3000 + npcPrice($item`li'l unicorn costume`) &&
    auto_is_valid($item`li'l unicorn costume`) &&
    !in_pokefam()
  ) {
    cliExecute("buy Li'l Unicorn Costume");
  }

  if (!silent) {
    auto_log_info("Putting on pajamas...", "blue");
  }

  let to_max: string = "-tie,adv";
  if (
    hippyStoneBroken() &&
    myPath() !== $path`Oxygenarian` &&
    toFloat(getProperty("auto_bedtime_pulls_pvp_multi")) > 0
  ) {
    to_max += `,${getProperty("auto_bedtime_pulls_pvp_multi")}fites`;
  }
  if (auto_have_familiar($familiar`Trick-or-Treating Tot`)) {
    to_max += ",switch Trick-or-Treating Tot";
  }
  if (auto_have_familiar($familiar`Left-Hand Man`)) {
    to_max += ",switch Left-Hand Man";
  }
  if (myFamiliar() === Familiar.none) {
    const anyFam: Familiar = findNonRockFamiliarInTerrarium();
    if (anyFam !== Familiar.none) {
      to_max += `,switch ${anyFam.toString()}`;
    }
  }

  maximize(to_max, false);

  if (!inHardcore() && !silent) {
    auto_log_info(
      "Done putting on jammies, if you pulled anything with a rollover effect you might want to make sure it's equipped before you log out.",
      "red",
    );
  }
}

export function auto_forceEquipSword(speculative: boolean = false): boolean {
  let swordToEquip: Item = Item.none;
  // use the ebony epee if we have it
  if (possessEquipment($item`ebony epee`)) {
    swordToEquip = $item`ebony epee`;
  }

  if (swordToEquip === Item.none) {
    // check for some swords that we might have acquired in run already. Yes machetes are actually swords.
    for (const it of $items`antique machete, black sword, broken sword, cardboard katana, cardboard wakizashi, Knob Goblin deluxe scimitar, Knob Goblin scimitar, lupine sword, muculent machete, serpentine sword, vorpal blade, white sword, sweet ninja sword, Drowsy Sword, ridiculously huge sword`) {
      if (possessEquipment(it) && auto_can_equip(it)) {
        swordToEquip = it;
        break;
      }
    }
  }

  if (
    swordToEquip === Item.none &&
    isArmoryAndLeggeryStoreAvailable() &&
    myMeat() > 49
  ) {
    // if we still don't have a sword available, buy one for a trivial amount of meat.
    // we must check availability first. retrieve_item does not return false on failure. it aborts on failure.
    if (retrieveItem(1, $item`sweet ninja sword`)) {
      // costs 50 meat from the armorer and leggerer
      swordToEquip = $item`sweet ninja sword`;
    }
  }

  if (swordToEquip === Item.none) {
    //we do not want to force equip none and then report success.
    return false;
  }

  if (
    safeGet("auto_equipment_override_weapon", Item.none) !== Item.none &&
    auto_can_equip(
      safeGet("auto_equipment_override_weapon", Item.none),
      $slot`weapon`,
    )
  ) {
    if (
      itemType(safeGet("auto_equipment_override_weapon", Item.none)) === "sword"
    ) {
      return true;
    } else {
      auto_log_debug(
        "Can not successfully force equip a sword because user defined override weapon will replace it before combat",
        "gold",
      );
      return false;
    }
  }

  if (speculative) {
    return auto_can_equip(swordToEquip, $slot`weapon`);
  }
  return autoForceEquip($slot`weapon`, swordToEquip);
}

export function is_watch(it: Item): boolean {
  //watches are accessories that conflict with each other. you can only equip one watch total.
  return booleanModifier(it, $modifier`Nonstackable Watch`);
}

export function auto_getAllEquipabble(s: Slot): Map<Item, number> {
  const ignore_slot: boolean = s === Slot.none;
  s = s === $slot`acc2` || s === $slot`acc3` ? $slot`acc1` : s; // all accessories checked against slot 1
  const valid_and_equippable: Map<Item, number> = new Map();
  for (const [it, n] of Object.entries(getInventory()).map(
    ([_k, _v]) => [Item.get(_k), _v] as [Item, number],
  )) {
    const it_s: Slot = toSlot(it);
    if (canEquip(it) && auto_is_valid(it) && (s === it_s || ignore_slot)) {
      valid_and_equippable.set(it, n);
    }
  }
  // Add equipped
  let my_slots: Slot[] = [];
  if (ignore_slot) {
    my_slots = [
      $slot`hat`,
      $slot`weapon`,
      $slot`off-hand`,
      $slot`back`,
      $slot`shirt`,
      $slot`pants`,
      $slot`acc1`,
      $slot`acc2`,
      $slot`acc3`,
      $slot`familiar`,
    ];
  } else {
    my_slots.push(s);
    if (s === $slot`acc1`) {
      my_slots.push($slot`acc2`, $slot`acc3`);
    }
  }
  for (const my_slot of my_slots) {
    const it: Item = equippedItem(my_slot);
    valid_and_equippable.set(it, (valid_and_equippable.get(it) ?? 0) + 1);
  }
  return valid_and_equippable;
}

export function auto_saveEquipped(): Map<number, Item> {
  let my_slots: Map<Slot, boolean>;
  if (in_hattrick()) {
    my_slots = new Map([
      [$slot`off-hand`, true],
      [$slot`weapon`, true],
      [$slot`back`, true],
      [$slot`shirt`, true],
      [$slot`pants`, true],
      [$slot`acc1`, true],
      [$slot`acc2`, true],
      [$slot`acc3`, true],
      [$slot`familiar`, true],
    ]);
  } else {
    my_slots = new Map([
      [$slot`hat`, true],
      [$slot`off-hand`, true],
      [$slot`weapon`, true],
      [$slot`back`, true],
      [$slot`shirt`, true],
      [$slot`pants`, true],
      [$slot`acc1`, true],
      [$slot`acc2`, true],
      [$slot`acc3`, true],
      [$slot`familiar`, true],
    ]);
  }
  const equipped: Map<number, Item> = new Map();
  for (const sl of my_slots.keys()) {
    equipped.set(equipped.size, equippedItem(sl));
  }
  return equipped;
}

export function auto_loadEquipped(loadEquip: Map<number, Item>): boolean {
  let loadAccCount: number = 0;
  let accCount: number = 0;
  for (const [, it] of loadEquip) {
    if (toSlot(it) === $slot`acc1`) {
      loadAccCount += 1;
    }
  }
  for (const [, it] of loadEquip) {
    //remove off-hand if we need to equip a 2 handed weapon from our saved load out
    if (it === Item.none) {
      continue;
    }
    if (
      loadAccCount > 0 &&
      toSlot(it) === $slot`acc1` &&
      (it !== equippedItem($slot`acc1`) ||
        it !== equippedItem($slot`acc2`) ||
        it !== equippedItem($slot`acc3`))
    ) {
      accCount += 1;
      switch (accCount) {
        case 1:
          autoForceEquip($slot`acc1`, it, true);
          break;
        case 2:
          autoForceEquip($slot`acc2`, it, true);
          break;
        default:
          autoForceEquip($slot`acc3`, it, true);
          break;
      }
    } else {
      autoForceEquip$2(it, true);
    }
  }
  return true;
}

export function powerMultipliers(): Map<Slot, number> {
  const multiplier: Map<Slot, number> = new Map();
  multiplier.set($slot`hat`, 1);
  multiplier.set($slot`pants`, 1);
  if (haveSkill($skill`Tao of the Terrapin`)) {
    multiplier.set($slot`hat`, (multiplier.get($slot`hat`) ?? 0) + 1);
    multiplier.set($slot`pants`, (multiplier.get($slot`pants`) ?? 0) + 1);
  }
  if (haveEffect($effect`Hammertime`) > 0) {
    multiplier.set($slot`pants`, (multiplier.get($slot`pants`) ?? 0) + 3);
  }

  return multiplier;
}

export function auto_wantToReserveFreekills(inCombat: boolean = false): {
  reserveFreekills: boolean;
  wantFreeKillNowEspecially: boolean;
} {
  let wantFreeKillNowEspecially: boolean = false;

  let waitForDesert: boolean = false; //free kills can save turns of Ultrahydrated
  if (get("desertExploration") < 100 && !isActuallyEd()) {
    //need to explore desert
    const currentDesertProgressPerTurn: number =
      1 +
      (get("bondDesert") ? 2 : 0) +
      (getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb" ? 2 : 0) +
      (myFamiliar() === $familiar`Melodramedary` ? 1 : 0) +
      2 * min(1, equippedAmount($item`survival knife`)) +
      equippedAmount($item`UV-resistant compass`) +
      2 * equippedAmount($item`ornate dowsing rod`);
    const fightsLeftToExplore: number = ceil(
      (100 - get("desertExploration")) / currentDesertProgressPerTurn,
    );
    if (
      haveEffect($effect`Ultrahydrated`) > 0 &&
      haveEffect($effect`Ultrahydrated`) < fightsLeftToExplore
    ) {
      wantFreeKillNowEspecially = true;
    } else {
      //near level 11
      waitForDesert = myBasestat(myPrimestat()) >= 95;
    }
  }

  let waitForCyrpt: boolean = false; //free kills can get more modern zmobies from 1 turn of a double initiative effect in The Defiled Alcove
  if (get("cyrptAlcoveEvilness") >= 18 + cyrptEvilBonus(inCombat)) {
    //need to do Alcove
    if (
      myLocation() === $location`The Defiled Alcove` &&
      haveEffect($effect`Bow-Legged Swagger`) === 1
    ) {
      wantFreeKillNowEspecially = true;
    } else if (
      auto_have_skill($skill`Bow-Legged Swagger`) &&
      myBasestat(myPrimestat()) >= 35 &&
      !get("_bowleggedSwaggerUsed")
    ) {
      waitForCyrpt = true; //near level 7
    }
  }
  //free kills can get more benefit from 1 turn of a double item bonus effect in zones that need high item
  if (
    haveEffect($effect`Steely-Eyed Squint`) === 1 &&
    $locations`The Haunted Wine Cellar, The Haunted Laundry Room, The Hatching Chamber, The Feeding Chamber, The Royal Guard Chamber`.includes(
      myLocation(),
    )
  ) {
    wantFreeKillNowEspecially = true;
  }

  const reserveFreekills: boolean =
    myAdventures() >= 9 &&
    !wantFreeKillNowEspecially &&
    (waitForDesert || waitForCyrpt);

  return { reserveFreekills, wantFreeKillNowEspecially };
}

/**
	Handles selecting and equiping an equipment that would allow a free kill skill to be cast, if able.
	Only selects one free kill at a time.
	Doesn't allow freekill equips in Advant guard or PocketFamiliars paths
*/
export function auto_equipFreekill(): void {
  // Pocket familiars combat doesn't permit skills, and bodyguards in Advant Guard make freekills un-free, so we're not doing that.
  // We're also not going to override a Lucky!, just incase
  if (in_avantGuard() || in_pokefam() || haveEffect($effect`Lucky!`)) {
    return;
  }

  auto_log_info("Looking for an equipment with free kills available...");
  const dartHolster: Item = $item`Everfull Dart Holster`;
  const doctorBag: Item = $item`Lil' Doctor™ bag`;
  const joksterGun: Item = $item`The Jokester's gun`;
  const bcz: Item = auto_getItemToEquipBCZ();
  const legendClub: Item = $item`legendary seal-clubbing club`;

  const { reserveFreekills, wantFreeKillNowEspecially } =
    auto_wantToReserveFreekills();
  const okToUseReservedFreekill: boolean =
    wantFreeKillNowEspecially || !reserveFreekills;

  const redDartAvailable: boolean =
    auto_haveDarts() && haveEffect($effect`Everything Looks Red`) === 0;
  const chestXrayAvailable: boolean =
    auto_chestXraysRemaining() > 0 &&
    (okToUseReservedFreekill || inAftercore() || myDaycount() >= 3);
  const fireGunAvailable: boolean =
    auto_jokesterGunFreeKillAvailable() && okToUseReservedFreekill;
  const sweatBulletsAvailable: boolean =
    auto_wantToBCZ($skill`BCZ: Sweat Bullets`) && okToUseReservedFreekill;
  const clubBackAvailable: boolean = auto_clubEmBackInTimesRemaining() > 0;

  if (redDartAvailable && !maximizer.has($slot`acc3`)) {
    auto_log_info(
      "We don't have ELR so let's hit a bullseye. Equipping Everful Dart holster.",
    );
    autoEquipToSlot($slot`acc3`, dartHolster);
  } else if (chestXrayAvailable && !maximizer.has($slot`acc3`)) {
    auto_log_info(
      "We still have Chest X-Rays available. Equipping Lil' Doctor bag.",
    );
    autoEquipToSlot($slot`acc3`, doctorBag);
  } else if (fireGunAvailable && !maximizer.has($slot`weapon`)) {
    auto_log_info("Let's be a jokester. Equipping The Jokester's gun.");
    autoEquipToSlot($slot`weapon`, joksterGun);
  } else if (sweatBulletsAvailable && !maximizer.has($slot`acc3`)) {
    auto_log_info("Man, we about to sweat bullets up in here. Equipping BCZ.");
    autoEquipToSlot($slot`acc3`, bcz);
  } else if (clubBackAvailable && !maximizer.has($slot`weapon`)) {
    // club back is last because it destroys drops, so we may choose to not use it
    auto_log_info(
      "They may not be seals, but we're gonna kill them last week. Equipping Legendary Seal Clubbing Club.",
    );
    autoEquipToSlot($slot`weapon`, legendClub);
  } else {
    auto_log_info(
      "No free kill sources found to equip, maybe you have some others, but we'll let combat figure that out.",
    );
  }
}
