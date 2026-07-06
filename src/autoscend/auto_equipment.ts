import {
  abort,
  appearanceRates,
  booleanModifier,
  canEquip,
  cliExecute,
  containsText,
  endsWith,
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
  length,
  Location,
  max,
  maximize,
  min,
  Modifier,
  Monster,
  myAdventures,
  myBasestat,
  myClass,
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
  npcPrice,
  numericModifier,
  outfitPieces,
  replaceString,
  retrieveItem,
  setLocation,
  setProperty,
  Skill,
  Slot,
  splitString,
  startsWith,
  Stat,
  substring,
  toBoolean,
  toFloat,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  toMonster,
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
  $locations,
  $monsters,
  $path,
  $skill,
  $slot,
  $slots,
  $stat,
} from "libram";

import { consumptionProgress } from "./auto_consume";
import {
  auto_have_familiar,
  findNonRockFamiliarInTerrarium,
  pathHasFamiliar,
} from "./auto_familiar";
import { disregardInstantKarma } from "./auto_powerlevel";
import { solveDelayZone$1 } from "./auto_routing";
import {
  auto_burnMP,
  auto_can_equip,
  auto_can_equip$1,
  auto_have_skill,
  auto_ignoreExperience,
  auto_is_valid,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  autoMaximize,
  instakillable,
  isArmoryAndLeggeryStoreAvailable,
  isFreeMonster,
  meatReserve,
  wrap_item,
} from "./auto_util";
import { zone_delay } from "./auto_zone";
import { auto_jokesterGunFreeKillAvailable } from "./iotms/mr2016";
import { isjanuaryToteAvailable, januaryToteTurnsLeft } from "./iotms/mr2018";
import {
  auto_chestXraysRemaining,
  auto_haveKramcoSausageOMatic,
  auto_sausageFightsToday,
} from "./iotms/mr2019";
import { auto_hasPowerfulGlove } from "./iotms/mr2020";
import {
  auto_backupTarget,
  auto_haveCrystalBall,
  simulatePreAdvForCrystalBall,
} from "./iotms/mr2021";
import {
  auto_canUseJuneCleaver,
  auto_expectedStillsuitAdvs,
  auto_hasStillSuit,
  auto_haveCursedMagnifyingGlass,
  canUseSweatpants,
  getSweat,
} from "./iotms/mr2022";
import { auto_haveBurningLeaves } from "./iotms/mr2023";
import {
  auto_haveBatWings,
  auto_haveDarts,
  auto_haveSpringShoes,
} from "./iotms/mr2024";
import {
  auto_getItemToEquipBCZ,
  auto_haveCupidBow,
  auto_haveMobiusRing,
  auto_timeCopFights,
  auto_timeIsAStripPossible,
  auto_wantToBCZ,
} from "./iotms/mr2025";
import { auto_clubEmBackInTimesRemaining } from "./iotms/mr2026";
import { isActuallyEd } from "./paths/actually_ed_the_undying";
import { in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import { borisTrusty, is_boris } from "./paths/avatar_of_boris";
import { in_bhy } from "./paths/bees_hate_you";
import { in_darkGyffte } from "./paths/dark_gyffte";
import { in_glover } from "./paths/g_lover";
import { in_gnoob } from "./paths/gelatinous_noob";
import { in_hattrick } from "./paths/hattrick";
import { in_heavyrains } from "./paths/heavy_rains";
import { in_koe, koe_NeedWhitePixels } from "./paths/kingdom_of_exploathing";
import { in_kolhs } from "./paths/kolhs";
import { in_plumber } from "./paths/path_of_the_plumber";
import {
  in_pokefam,
  pokefam_defaultMaximizeStatement,
} from "./paths/pocket_familiars";
import { in_small } from "./paths/small";
import { in_wereprof, is_professor, is_werewolf } from "./paths/wereprofessor";
import { in_wildfire } from "./paths/wildfire";
import { in_robot, robot_defaultMaximizeStatement } from "./paths/you_robot";
import { getZooBestPunch, in_zootomist } from "./paths/zootomist";

//Defined in autoscend/auto_equipment.ash
export function getMaximizeSlotPref(s: Slot): string {
  return `_auto_maximize_equip_${s.toString()}`;
}

function getTentativeMaximizeEquip(s: Slot): Item {
  return toItem(getProperty(getMaximizeSlotPref(s)));
}

export function autoEquip(s: Slot, it: Item): boolean {
  if (!possessEquipment(it) || !auto_can_equip(it)) {
    return false;
  }

  if (
    (s === $slot`acc3` &&
      it.toString() === getProperty("_auto_maximize_equip_acc1")) ||
    it.toString() === getProperty("_auto_maximize_equip_acc2") ||
    it.toString() === getProperty("_auto_maximize_equip_acc3")
  ) {
    auto_log_warning$1(`Ignoring duplicate equip of accessory ${it}`);
    return true;
  }
  // This logic lets us force the equipping of multiple accessories with minimal conflict
  const acc1_empty: boolean =
    "" === getProperty("_auto_maximize_equip_acc1") &&
    !containsText(getProperty("auto_maximize_current"), "acc1");
  const acc2_empty: boolean =
    "" === getProperty("_auto_maximize_equip_acc2") &&
    !containsText(getProperty("auto_maximize_current"), "acc2");
  const acc3_empty: boolean =
    "" === getProperty("_auto_maximize_equip_acc3") &&
    !containsText(getProperty("auto_maximize_current"), "acc3");
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

  return tryAddItemToMaximize(s, it);
}

export function autoEquip$1(it: Item): boolean {
  return autoEquip(toSlot(it), it);
}
// specifically intended for forcing something in to a specific slot,
// instead of just forcing it to be equipped in general
// mostly for the Antique Machete and unstable fulminate
export function autoForceEquip(
  s: Slot,
  it: Item,
  noMaximize: boolean,
): boolean {
  if (it === Item.none) {
    return equip(s, it);
  }
  if (!possessEquipment(it) || !auto_can_equip(it)) {
    return false;
  }
  if ($slot`off-hand` === s) {
    if (weaponHands(equippedItem($slot`weapon`)) > 1) {
      if (!noMaximize) {
        removeFromMaximize(`+equip ${equippedItem($slot`weapon`)}`);
      }
      equip($slot`weapon`, Item.none);
    }
    if (!noMaximize) {
      removeFromMaximize(`-equip ${it}`);
      addToMaximize("-off-hand, 1hand");
    }
    return equip($slot`off-hand`, it);
  }
  if (equip(s, it)) {
    if (!noMaximize) {
      removeFromMaximize(`-equip ${it}`);
      addToMaximize(`-${s}`);
    }
    return true;
  }
  return false;
}

export function autoForceEquip$1(s: Slot, it: Item): boolean {
  return autoForceEquip(s, it, false);
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
    return autoForceEquip$1($slot`acc3`, it);
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
  for (const [i, it] of outfitPieces(toWear).entries()) {
    // Keep required accessories in acc3 slot to preserve our format
    if (CommonOutfitAccessories.includes(it)) {
      pass_1 = pass_1 && autoEquip($slot`acc3`, it);
    } else {
      pass_1 = pass_1 && autoEquip$1(it);
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
  for (const [_, piece] of outfit_pieces) {
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

function tryAddItemToMaximize(s: Slot, it: Item): boolean {
  if (
    !$slots`hat, back, shirt, weapon, off-hand, pants, acc1, acc2, acc3, familiar`.includes(
      s,
    )
  ) {
    auto_log_error(`But ${s} is an invalid equip slot... What?`);
    return false;
  }
  switch (s) {
    case $slot`weapon`:
      if (weaponHands(it) > 1) {
        setProperty(getMaximizeSlotPref($slot`off-hand`), "");
      }
      break;
    case $slot`off-hand`:
      if (weaponHands(getTentativeMaximizeEquip($slot`weapon`)) > 1) {
        setProperty(getMaximizeSlotPref($slot`weapon`), "");
      }

      // TODO: Ranged/melee mismatch handling
      break;
  }

  let itString: string = it.toString();
  // maximizer uses commas, so can't have a comma in an item name
  // fortunately fuzzy matching means just stripping out the comma is fine
  itString = replaceString(itString, ",", "");
  setProperty(getMaximizeSlotPref(s), itString);
  return true;
}

function speculatedMaximizerEquipment(statement: string): Map<Slot, Item> {
  //make maximizer simulate with the given statement then return the list of equipment it has chosen
  const res: Map<Slot, Item> = new Map();
  let weaponPicked: boolean = false;
  let offhandPicked: boolean = false;
  for (const [i, entry] of maximize(statement, 0, 0, true, true).entries()) {
    //can't use autoMaximize "Aggregate reference expected"
    if (i > 15) {
      //there should not be more than 9 or 10 equipment slots and equipment entries come first. so equipment list is done
      break;
    }
    const maximizerText: string = entry.display;
    if (containsText(maximizerText, "unequip ")) {
      continue;
    }
    if (!containsText(maximizerText, "equip ")) {
      const keeping: boolean =
        entry.command === "" && containsText(maximizerText, "keep "); //already equipped item can be recorded
      if (!keeping) {
        //will not know how to handle other special actions like "fold ", "umbrella ", ...
        continue;
      }
    }
    const maximizerItem: Item = entry.item;
    if (maximizerItem === Item.none) {
      continue;
    }
    let maximizerItemSlot: Slot = toSlot(maximizerItem);
    if (maximizerItemSlot === Slot.none) {
      continue;
    }
    let overrideSlot: Slot = Slot.none;
    if (maximizerItemSlot === $slot`weapon`) {
      if (weaponPicked) {
        if (
          !offhandPicked &&
          auto_have_skill($skill`Double-Fisted Skull Smashing`) &&
          weaponType(maximizerItem) ===
            weaponType(
              res.get($slot`weapon`) ??
                res.set($slot`weapon`, Item.none).get($slot`weapon`),
            ) &&
          itemType(maximizerItem) !== "chefstaff"
        ) {
          //this must be offhand weapon
          overrideSlot = $slot`off-hand`;
          offhandPicked = true;
        } else if (
          myFamiliar() === $familiar`Disembodied Hand` &&
          weaponHands(maximizerItem) === 1 &&
          itemType(maximizerItem) !== "chefstaff" &&
          itemType(maximizerItem) !== "accordion"
        ) {
          //this must be familiar weapon
          overrideSlot = $slot`familiar`;
        } else {
          auto_log_debug(
            "There are more weapons than we can wear in speculatedMaximizerEquipment, something must be wrong",
            "gold",
          );
          continue;
        }
      } else {
        weaponPicked = true;
        if (weaponHands(maximizerItem) > 1) {
          offhandPicked = true;
        }
      }
    } else if (maximizerItemSlot === $slot`off-hand`) {
      if (offhandPicked) {
        //this must be familiar offhand
        if (myFamiliar() === $familiar`Left-Hand Man`) {
          overrideSlot = $slot`familiar`;
        } else {
          auto_log_debug(
            "Off-hand slot is getting more than one use in speculatedMaximizerEquipment but familiar is not Left-Hand Man, something must be wrong",
            "gold",
          );
          continue;
        }
      } else {
        offhandPicked = true;
      }
    } else if (
      maximizerItemSlot === $slot`acc1` &&
      (res.get($slot`acc1`) ??
        res.set($slot`acc1`, Item.none).get($slot`acc1`)) !== Item.none
    ) {
      //accessory to slot always returns acc1 and has to be switched if more than one, go from 1 to 3 because that is the equip order the maximizer will use
      if (
        (res.get($slot`acc2`) ??
          res.set($slot`acc2`, Item.none).get($slot`acc2`)) !== Item.none
      ) {
        overrideSlot = $slot`acc3`;
      } else {
        overrideSlot = $slot`acc2`;
      }
    }
    if (overrideSlot !== Slot.none) {
      maximizerItemSlot = overrideSlot;
    }
    if (
      (res.get(maximizerItemSlot) ??
        res.set(maximizerItemSlot, Item.none).get(maximizerItemSlot)) !==
      Item.none
    ) {
      auto_log_debug(
        `Duplicate entry skipped for slot ${maximizerItemSlot.toString()} in speculatedMaximizerEquipment, something must be wrong`,
        "gold",
      );
      continue;
    }
    res.set(maximizerItemSlot, maximizerItem);
  }
  return res;
}

export function equipStatgainIncreasers(
  increaseThisStat: Map<Stat, boolean>,
  alwaysEquip: boolean,
): void {
  if (auto_ignoreExperience()) {
    return;
  }
  //want to equip best equipment that increases specified stat gains including out of combat
  //should be frequently called by consume actions so try not to lose HP or MP, but will equip anyway if argument alwaysEquip is true
  let maximizerStatement: string = "";
  for (const st of increaseThisStat.keys()) {
    if (!(
      increaseThisStat.get(st) ?? increaseThisStat.set(st, false).get(st)
    )) {
      continue;
    }
    let statWeight: string = "";
    if (st === myPrimestat()) {
      if (disregardInstantKarma()) {
        statWeight = "2";
      }
    } else if (myBasestat(myPrimestat()) > 122 && myBasestat(st) < 70) {
      //>= level 12 or almost there, more offstat experience may be needed for the war outfit (requires 70 mox and 70 mys)
      if (st === $stat`Mysticality` || st === $stat`Moxie`) {
        statWeight = "3";
      }
    }
    maximizerStatement += `${statWeight}${st.toString()} experience percent,`;
  }
  let simulatedEquipment: Map<Slot, Item> =
    speculatedMaximizerEquipment(maximizerStatement); //simulate and get list of relevant equipment
  let canIncreaseStatgains: boolean = false;
  for (const st of increaseThisStat.keys()) {
    if (!(
      increaseThisStat.get(st) ?? increaseThisStat.set(st, false).get(st)
    )) {
      continue;
    }
    const modifierString: string = `${st.toString()} experience percent`;
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
    for (const st of increaseThisStat.keys()) {
      if (!(
        increaseThisStat.get(st) ?? increaseThisStat.set(st, false).get(st)
      )) {
        continue;
      }
      if (
        numericModifier(
          simulatedEquipment.get(sl) ??
            simulatedEquipment.set(sl, Item.none).get(sl),
          `${st.toString()} experience percent`,
        ) !== 0
      ) {
        statgainIncreasers.set(
          sl,
          simulatedEquipment.get(sl) ??
            simulatedEquipment.set(sl, Item.none).get(sl),
        );
        break;
      }
    }
  }
  //solve incompatible hand slots, since only statgain equipment is taken from simulation which leaves potentially incompatible hand equipment remaining
  if (
    (statgainIncreasers.get($slot`off-hand`) ??
      statgainIncreasers
        .set($slot`off-hand`, Item.none)
        .get($slot`off-hand`)) !== Item.none &&
    (statgainIncreasers.get($slot`weapon`) ??
      statgainIncreasers.set($slot`weapon`, Item.none).get($slot`weapon`)) ===
      Item.none
  ) {
    const currentWeaponIncompatibleWithSimulatedOffHand: boolean =
      weaponHands(equippedItem($slot`weapon`)) > 1 ||
      (toSlot(
        statgainIncreasers.get($slot`off-hand`) ??
          statgainIncreasers
            .set($slot`off-hand`, Item.none)
            .get($slot`off-hand`),
      ) === $slot`weapon` &&
        weaponType(
          statgainIncreasers.get($slot`off-hand`) ??
            statgainIncreasers
              .set($slot`off-hand`, Item.none)
              .get($slot`off-hand`),
        ) !== weaponType(equippedItem($slot`weapon`)));
    if (currentWeaponIncompatibleWithSimulatedOffHand) {
      //add maximizer simulated compatible weapon
      statgainIncreasers.set(
        $slot`weapon`,
        simulatedEquipment.get($slot`weapon`) ??
          simulatedEquipment.set($slot`weapon`, Item.none).get($slot`weapon`),
      );
    }
  } else if (
    (statgainIncreasers.get($slot`weapon`) ??
      statgainIncreasers.set($slot`weapon`, Item.none).get($slot`weapon`)) !==
      Item.none &&
    (statgainIncreasers.get($slot`off-hand`) ??
      statgainIncreasers
        .set($slot`off-hand`, Item.none)
        .get($slot`off-hand`)) === Item.none &&
    toSlot(equippedItem($slot`off-hand`)) === $slot`weapon`
  ) {
    const currentOffHandIncompatibleWithSimulatedWeapon: boolean =
      weaponType(
        statgainIncreasers.get($slot`weapon`) ??
          statgainIncreasers.set($slot`weapon`, Item.none).get($slot`weapon`),
      ) !== weaponType(equippedItem($slot`off-hand`));
    if (currentOffHandIncompatibleWithSimulatedWeapon) {
      //add maximizer simulated compatible off-hand
      statgainIncreasers.set(
        $slot`off-hand`,
        simulatedEquipment.get($slot`off-hand`) ??
          simulatedEquipment
            .set($slot`off-hand`, Item.none)
            .get($slot`off-hand`),
      );
    }
  }
  //equipment would be equipped in the order it was listed. check if HP or MP would be lost by equipping
  let HPlost: number = 0;
  let mostHPlost: number = 0;
  let MPlost: number = 0;
  let mostMPlost: number = 0;
  let speculateOneItem: string = "";
  let speculateAllItems: string = "";
  for (const sl of statgainIncreasers.keys()) {
    speculateOneItem = `equip ${sl.toString()} ${(statgainIncreasers.get(sl) ?? statgainIncreasers.set(sl, Item.none).get(sl)).toString()}; `;
    cliExecute(`speculate quiet; ${speculateOneItem}`);
    HPlost = toInt(myHp() - simValue("Buffed HP Maximum"));
    MPlost = toInt(myMp() - simValue("Buffed MP Maximum"));
    if (HPlost <= 0 && MPlost <= 0) {
      //causes no loss so it can be equipped right now
      equip(
        statgainIncreasers.get(sl) ??
          statgainIncreasers.set(sl, Item.none).get(sl),
        sl,
      );
      continue;
    }
    speculateAllItems += speculateOneItem; //otherwise speculate with all items that have been left out
    if (speculateAllItems !== speculateOneItem) {
      cliExecute(`speculate quiet; ${speculateAllItems}`);
      HPlost = toInt(myHp() - simValue("Buffed HP Maximum"));
      MPlost = toInt(myMp() - simValue("Buffed MP Maximum"));
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
  maximizerStatement = `HP ${targetedHP}min ${targetedHP}max, MP ${targetedMP}min ${targetedMP}max,`;
  for (const sl of statgainIncreasers.keys()) {
    maximizerStatement += `-${sl.toString()},`; //ignore slots where statgain increasers should be equipped
    if (
      toSlot(
        statgainIncreasers.get(sl) ??
          statgainIncreasers.set(sl, Item.none).get(sl),
      ) === $slot`weapon`
    ) {
      //ignore slots that will be incompatible
      if (
        weaponHands(
          statgainIncreasers.get(sl) ??
            statgainIncreasers.set(sl, Item.none).get(sl),
        ) > 1
      ) {
        maximizerStatement += "-off-hand,";
      }
      if (
        weaponType(
          statgainIncreasers.get(sl) ??
            statgainIncreasers.set(sl, Item.none).get(sl),
        ) === $stat`Moxie`
      ) {
        maximizerStatement += "-melee,";
      } else {
        maximizerStatement += "+melee,";
      }
    }
    if (
      sl === $slot`off-hand` &&
      (statgainIncreasers.get($slot`weapon`) ??
        statgainIncreasers.set($slot`weapon`, Item.none).get($slot`weapon`)) ===
        Item.none
    ) {
      maximizerStatement += "1handed,"; //ignore incompatible weapons
    }
  }
  if (!maximize(maximizerStatement, true)) {
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
  simulatedEquipment = speculatedMaximizerEquipment(maximizerStatement);
  for (const sl of simulatedEquipment.keys()) {
    speculateOneItem = `equip ${sl.toString()} ${(simulatedEquipment.get(sl) ?? simulatedEquipment.set(sl, Item.none).get(sl)).toString()}; `;
    cliExecute(`speculate quiet; ${speculateOneItem}`);
    if (simValue("Buffed HP Maximum") < myHp()) {
      //skip on collateral loss
      continue;
    }
    if (simValue("Buffed MP Maximum") < myMp()) {
      continue;
    }
    equip(
      simulatedEquipment.get(sl) ??
        simulatedEquipment.set(sl, Item.none).get(sl),
      sl,
    );
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
      equip(
        statgainIncreasers.get(sl) ??
          statgainIncreasers.set(sl, Item.none).get(sl),
        sl,
      );
    }
  }
}

export function equipStatgainIncreasers$1(
  increaseThisStat: Stat,
  alwaysEquip: boolean,
): void {
  const increaseThisStatAggregate: Map<Stat, boolean> = new Map();
  increaseThisStatAggregate.set(increaseThisStat, true);
  equipStatgainIncreasers(increaseThisStatAggregate, alwaysEquip);
}

export function equipStatgainIncreasers$2(): void {
  if (!disregardInstantKarma()) {
    //exclude primestat if level 13
    if (myPrimestat() === $stat`Muscle`) {
      equipStatgainIncreasers(
        new Map([
          [$stat`Mysticality`, true],
          [$stat`Moxie`, true],
        ]),
        false,
      );
      return;
    } else if (myPrimestat() === $stat`Mysticality`) {
      equipStatgainIncreasers(
        new Map([
          [$stat`Muscle`, true],
          [$stat`Moxie`, true],
        ]),
        false,
      );
      return;
    } else if (myPrimestat() === $stat`Moxie`) {
      equipStatgainIncreasers(
        new Map([
          [$stat`Muscle`, true],
          [$stat`Mysticality`, true],
        ]),
        false,
      );
      return;
    }
  }
  equipStatgainIncreasers(
    new Map([
      [$stat`Muscle`, true],
      [$stat`Mysticality`, true],
      [$stat`Moxie`, true],
    ]),
    false,
  );
}

export function equipStatgainIncreasersFor(it: Item): void {
  //check what stats a consumable will give and equip increasers for it
  const increaseThisStat: Map<Stat, boolean> = new Map();
  const excludedStat: Stat = disregardInstantKarma()
    ? Stat.none
    : myPrimestat(); //exclude primestat if level 13
  if (it.muscle !== "" && excludedStat !== $stat`Muscle`) {
    increaseThisStat.set($stat`Muscle`, true);
  }
  if (it.mysticality !== "" && excludedStat !== $stat`Mysticality`) {
    increaseThisStat.set($stat`Mysticality`, true);
  }
  if (it.moxie !== "" && excludedStat !== $stat`Moxie`) {
    increaseThisStat.set($stat`Moxie`, true);
  }

  if (increaseThisStat.size !== 0) {
    equipStatgainIncreasers(increaseThisStat, false);
  }
}

function defaultMaximizeStatement(): string {
  if (in_pokefam()) {
    return pokefam_defaultMaximizeStatement();
  }
  if (in_robot()) {
    return robot_defaultMaximizeStatement();
  }

  let res: string =
    "5item,meat,0.5initiative,0.1da 1000max,dr,0.5all res,1.5mainstat,-fumble";
  if (myPrimestat() !== $stat`Moxie`) {
    res += ",mox";
  }

  if (in_darkGyffte()) {
    res += ",0.8hp,4hp regen";
  } else {
    res += ",0.4hp,0.2mp 1000max";
    res += isActuallyEd() ? ",6mp regen" : ",3mp regen";
  }
  if (in_bhy()) {
    res += ", 1 beeosity";
  }
  //weapon handling
  if (is_boris()) {
    borisTrusty(); //forceequip trusty. the modification it makes to the maximizer string will be lost so also do next line
    res += ",-weapon,-offhand"; //we do not want maximizer trying to touch weapon or offhand slot in boris
  } else if (!(in_plumber() || in_zootomist())) {
    if (myPrimestat() === $stat`Mysticality`) {
      res += ",0.25spell damage,1.75spell damage percent";
    } else {
      res += ",1.5weapon damage,0.75weapon damage percent,1.5elemental damage";
    }
  }

  if (pathHasFamiliar()) {
    if (!(in_zootomist() && myLevel() < 13)) {
      res += ",2familiar weight";
    }
    if (familiarWeight(myFamiliar()) < 20) {
      res += ",5familiar exp";
    }
  }
  if (in_wildfire()) {
    res += ",water,hot res";
  }

  const primeStat: Stat = myPrimestat();
  if (in_plumber()) {
    res += ",plumber,-ml";
  } else if (auto_ignoreExperience()) {
    // Nothing to do here
  } else if (
    myLevel() < 13 ||
    toBoolean(getProperty("auto_disregardInstantKarma"))
  ) {
    //experience scores for the default maximizer statement

    if (getProperty("auto_MLSafetyLimit") === "") {
      //"exp" includes bonus from "ml" sources and values mainstat experience with a variable? score comparable to 0.25ML?
      //in general "10exp" gives a score equivalent to "15(primeStat) experience"
      //"exp" does not value "+(offstat) experience"
      res += ",10exp";
    } else {
      //a value is given for ML safety limit
      //use "(primeStat) experience" instead of "exp" in the hope that it will not include ML however this is not consistently true
      //the conditions under which it still adds value to ML are unclear (level? not ronin? volleyball familiar??)
      //the maximizer score for limited ML is added later by pre_adv
      //pre_adv will tell the maximizer to not value ML over the safety limit (though enforcing that limit is not possible with the maximizer syntax and scoring system)
      res += `,15${primeStat} experience`;
    }
    //TODO the score to give to experience VS percent depends on how much experience is expected from fights
    res += `,5${primeStat} experience percent`;
  }
  if (myBasestat(primeStat) > 122) {
    //>= level 12 or almost there, more offstat experience may be needed for the war outfit (requires 70 mox and 70 mys)
    if (
      myBasestat($stat`Moxie`) < 70 &&
      getProperty("warProgress") !== "finished"
    ) {
      res += ",10moxie experience,3moxie experience percent";
    }
    if (
      myBasestat($stat`Mysticality`) < 70 &&
      getProperty("warProgress") !== "finished"
    ) {
      res += ",10mysticality experience,3mysticality experience percent";
    }
  }

  return res;
}

export function resetMaximize(): void {
  let res: string = getProperty("auto_maximize_baseline"); //user configured override baseline statement.
  if (
    res === "" ||
    toLowerCase(res) === "default" ||
    toLowerCase(res) === "disabled"
  ) {
    res = defaultMaximizeStatement(); //automatically generated baseline statement
  }

  function exclude(it: Item): void {
    if (res !== "") {
      res += ",";
    }
    res += `-equip ${it}`;
  }
  // don't want to equip these items automatically
  // snow suit bonus drops every 5 combats so is best saved for important things
  // sword, and staph are text scramblers which cause errors in mafia tracking
  // bathysphere gives -20 lbs familiar weight. under certain circumstances maximizer decides to equip it
  for (const it of $items`sword behind inappropriate prepositions, staph of homophones, Snow Suit, little bitty bathysphere`) {
    if (possessEquipment(it)) {
      exclude(it);
    }
  }
  //IOTM [january's garbage tote] specific handling.
  if (isjanuaryToteAvailable()) {
    //preserve leftover charges, prevent mafia halting automation for confirmation.
    if (!toBoolean(getProperty("_garbageItemChanged"))) {
      //did not change tote item today
      for (const it of $items`deceased crimbo tree, broken champagne bottle, tinsel tights, wad of used tape, makeshift garbage shirt`) {
        exclude(it);
      }
    } else {
      //preserve current charges
      for (const it of $items`deceased crimbo tree, broken champagne bottle, makeshift garbage shirt`) {
        if (januaryToteTurnsLeft(it) > 0) {
          exclude(it);
        }
      }
    }
  } else if (
    itemAmount(wrap_item($item`January's Garbage Tote`)) > 0 &&
    in_bhy()
  ) {
    // workaround mafia bug with the maximizer where it tries to equip tote items even though the tote is unusable
    for (const it of $items`deceased crimbo tree, broken champagne bottle, tinsel tights, wad of used tape, makeshift garbage shirt`) {
      exclude(it);
    }
  }

  setProperty("auto_maximize_current", res);
  auto_log_debug(`Resetting auto_maximize_current to ${res}`, "gold");

  for (const s of $slots`hat, back, shirt, weapon, off-hand, pants, acc1, acc2, acc3, familiar`) {
    setProperty(getMaximizeSlotPref(s), "");
  }
}

export function addBonusToMaximize(it: Item, amt: number): void {
  if (possessEquipment(it) && auto_can_equip(it)) {
    addToMaximize(`+${amt}bonus ${it}`);
  }
}

function finalizeMaximize(speculative: boolean): void {
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

  const nextMonster: Monster = toMonster(getProperty("auto_nextEncounter"));
  const nextMonsterIsFree: boolean =
    (nextMonster !== Monster.none && isFreeMonster(nextMonster)) ||
    (toInt(getProperty("breathitinCharges")) > 0 &&
      myLocation().environment === "outdoor");

  if (auto_haveKramcoSausageOMatic()) {
    // Save the first 8 sausage goblins for delay burning, if current location isn't itself a delay zone after SoftblockDelay released
    const saveGoblinForDelay: boolean =
      auto_sausageFightsToday() < 8 &&
      !zone_delay(myLocation())._boolean &&
      solveDelayZone$1() !== Location.none;
    // don't interfere with backups unless they're equivalent or worse
    const dontSausageBackups: boolean =
      auto_backupTarget() &&
      !$monsters`sausage goblin, Eldritch Tentacle`.includes(
        toMonster(getProperty("lastCopyableMonster")),
      );
    // also don't equip Kramco when using Map the Monsters as sausage goblins override the NC
    if (
      saveGoblinForDelay ||
      dontSausageBackups ||
      toBoolean(getProperty("mappingMonsters"))
    ) {
      addToMaximize(
        `-equip ${wrap_item($item`Kramco Sausage-o-Matic™`).toString()}`,
      );
    }
  }
  if (auto_haveMobiusRing()) {
    if (auto_timeCopFights() >= 11) {
      if (
        toBoolean(getProperty("mappingMonsters")) ||
        auto_backupTarget() ||
        !inHardcore()
      ) {
        // don't equip for non free fights in softcore? (pending allowed conditions like delay zone && none of the monsters in the zone is a sniff/YR target?)
        // don't interfere with backups or Map the Monsters
        addToMaximize(`-equip ${$item`Möbius ring`.toString()}`);
      }
    } else {
      // we want to make sure we equip mobius ring in meatpath when it's important,
      // so we increse the bonus we give to the ring in meatpath for the priming and the NC
      let mobius_bonus: number = 200;
      if (in_amw()) {
        mobius_bonus = 1000;
      }
      // if the ring hasn't been primed today, we want to prime it to kick the whole thing off
      if (!toBoolean(getProperty("_mobiusRingPrimed"))) {
        addBonusToMaximize($item`Möbius ring`, mobius_bonus);
      } else if (
        !nextMonsterIsFree &&
        zone_delay(
          // If the current zone has any delay, equip the ring for a chance at a free time cop or +paradoxicity
          // time cop chance is conjectured to be a flat chance, doubling every 5 paradoxicity, starting at 2%
          // we probably want to target 15 for 16% chance
          myLocation(),
        )._boolean
      ) {
        addBonusToMaximize($item`Möbius ring`, 200);
      } else if (auto_timeIsAStripPossible()) {
        // otherwise, equip the ring if we can get the NC
        addBonusToMaximize($item`Möbius ring`, mobius_bonus);
      }
    }
  }
  if (auto_haveCursedMagnifyingGlass()) {
    if (toInt(getProperty("cursedMagnifyingGlassCount")) === 13) {
      if (
        toBoolean(getProperty("mappingMonsters")) ||
        auto_backupTarget() ||
        (toInt(getProperty("_voidFreeFights")) >= 5 &&
          toInt(getProperty("cursedMagnifyingGlassCount")) >= 13 &&
          !inHardcore())
      ) {
        // don't equip for non free fights in softcore? (pending allowed conditions like delay zone && none of the monsters in the zone is a sniff/YR target?)
        // don't interfere with backups or Map the Monsters
        addToMaximize(`-equip ${$item`cursed magnifying glass`.toString()}`);
      }
    } else if (
      !nextMonsterIsFree &&
      toInt(getProperty("cursedMagnifyingGlassCount")) < 13 &&
      solveDelayZone$1() !== Location.none
    ) {
      // add bonus to charge free fights. charge is added when completing nonfree fights only
      // also we can pre-charge it for the next day once we have used our 5 free fights.
      addBonusToMaximize($item`cursed magnifying glass`, 200);
    }
  }
  for (const s of $slots`hat, back, shirt, weapon, off-hand, pants, acc1, acc2, acc3, familiar`) {
    const pref: string = getMaximizeSlotPref(s);
    const toEquip: string = getProperty(pref);
    if (toEquip !== "") {
      removeFromMaximize(`-equip ${toEquip}`);
      addToMaximize(`+equip ${toEquip}`);
    }
  }

  if (in_wereprof() && auto_haveDarts()) {
    //Absolutely need darts for Professor. Should level up darts while Werewolf too
    if (is_werewolf()) {
      addBonusToMaximize($item`Everfull Dart Holster`, 1000);
    } else {
      addToMaximize(`+equip ${$item`Everfull Dart Holster`}`);
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
        addToMaximize(`+equip ${$item`biphasic molecular oculus`}`);
      } else {
        addToMaximize(`+equip ${$item`triphasic molecular oculus`}`);
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
        addToMaximize(`+equip ${$item`high-tension exoskeleton`}`);
      } else if (possessEquipment($item`ultra-high-tension exoskeleton`)) {
        addToMaximize(`+equip ${$item`ultra-high-tension exoskeleton`}`);
      } else {
        addToMaximize(`+equip ${$item`irresponsible-tension exoskeleton`}`);
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

  if (auto_haveBatWings() && toInt(getProperty("_batWingsFreeFights")) < 5) {
    addBonusToMaximize($item`bat wings`, 200); // get the 5 free fights
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
    if (toBoolean(getProperty("mappingMonsters")) || auto_backupTarget()) {
      // don't interfere with backups or Map the Monsters
      // should also block equipping if support is added for Feel Nostalgic, Lecture on relativity, or fax for YR or other special combat actions
      addToMaximize(`-equip ${$item`carnivorous potted plant`.toString()}`);
    } else if (
      ((nextMonster === Monster.none || instakillable(nextMonster)) &&
        !in_pokefam() &&
        getProperty("auto_MLSafetyLimit") === "") ||
      toInt(getProperty("auto_MLSafetyLimit")) >= 25
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
      toInt(getProperty("_juneCleaverFightsLeft")) < myAdventures() * 1.1 ||
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
    addToMaximize(`+equip ${$item`Monodent of the Sea`}`); //Don't want to spend an extra turn if we don't have to
  }

  if (
    !in_plumber() &&
    getProperty(getMaximizeSlotPref($slot`weapon`)) === "" &&
    !maximizeContains("-weapon") &&
    myPrimestat() !== $stat`Mysticality`
  ) {
    if (myClass() === $class`Seal Clubber` && in_glover()) {
      addToMaximize("club");
    } else if (in_zootomist() && getZooBestPunch() !== Skill.none) {
      // Nothing to do here. Should be a more general case of "classes that never attack with weapon"?
    } else {
      addToMaximize("effective");
    }
  }

  if (
    auto_haveCupidBow() &&
    !maximizeContains(`bonus ${$item`toy Cupid bow`}`)
  ) {
    // Small bonus here, we have a big bonus in pre_adv if we need a drop we can't cap.
    addBonusToMaximize($item`toy Cupid bow`, 100);
  }

  if (auto_haveBurningLeaves() && itemAmount($item`inflammable leaf`) < 111) {
    let bonus: number = 20;
    if (in_zootomist() && myLevel() < 13) {
      bonus = 100;
    }
    for (const it of $items`rake, tiny rake`) {
      if (!maximizeContains(`bonus ${it}`)) {
        addBonusToMaximize(it, bonus);
      }
    }
  }
  // We could have added LED Candle to maximizer earlier when Jill was our familiar, but it's been replaced.
  if (myFamiliar() !== $familiar`Jill-of-All-Trades`) {
    const candle_force: string = `+equip ${$item`LED candle`}`;
    if (maximizeContains(candle_force)) {
      removeFromMaximize(candle_force);
    }
  }
}

function finalizeMaximize$1(): void {
  finalizeMaximize(false);
}

export function addToMaximize(add_1: string): void {
  if (maximizeContains(add_1)) {
    //skip if trying to add duplicate
    auto_log_debug(
      `Tried to add a duplicate of "${add_1}" to current maximizer statement... skipping`,
      "gold",
    );
    return;
  }
  auto_log_debug(`Adding "${add_1}" to current maximizer statement`, "gold");
  let res: string = getProperty("auto_maximize_current");
  const addHasComma: boolean = startsWith(add_1, ",");
  if (res !== "" && !addHasComma) {
    res += ",";
  } else if (res === "" && addHasComma) {
    // maximizer fails on a leading comma
    add_1 = substring(add_1, 1);
  }
  res += add_1;
  setProperty("auto_maximize_current", res);
}

export function removeFromMaximize(rem: string): void {
  auto_log_debug(`Removing "${rem}" from current maximizer statement`, "gold");
  let res: string = getProperty("auto_maximize_current");
  res = replaceString(res, rem, "");
  // let's be safe here
  res = replaceString(res, " ,", ",");
  res = replaceString(res, ", ", ",");
  res = replaceString(res, ",,", ",");
  if (endsWith(res, ",")) {
    res = substring(res, 0, length(res) - 1);
  }
  if (startsWith(res, ",")) {
    res = substring(res, 1);
  }
  setProperty("auto_maximize_current", res);
}

function maximizeContains(check_1: string): boolean {
  return containsText(getProperty("auto_maximize_current"), check_1);
}

export function simMaximize(): boolean {
  const backup: string = getProperty("auto_maximize_current");
  const backupNextMonster: string = getProperty("auto_nextEncounter");
  finalizeMaximize(true);
  const res: boolean = autoMaximize(getProperty("auto_maximize_current"), true);
  setProperty("auto_maximize_current", backup);
  setProperty("auto_nextEncounter", backupNextMonster);
  return res;
}

export function simMaximize$1(loc: Location): boolean {
  let res: boolean = false;
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

export function simMaximizeWith(loc: Location, add_1: string): boolean {
  const backup: string = getProperty("auto_maximize_current");
  addToMaximize(add_1);
  auto_log_debug(`Simulating: ${getProperty("auto_maximize_current")}`, "gold");
  const res: boolean = simMaximize$1(loc);
  setProperty("auto_maximize_current", backup);
  return res;
}

export function simMaximizeWith$1(add_1: string): boolean {
  return simMaximizeWith(myLocation(), add_1);
}

export function simValue(mod: string): number {
  return numericModifier("Generated:_spec", mod);
}

export function simValue$1(mod: Modifier): number {
  return numericModifier("Generated:_spec", mod);
}

export function equipMaximizedGear(): void {
  finalizeMaximize$1();
  maximize(getProperty("auto_maximize_current"), 2500, 0, false);
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
      addToMaximize("2 dump"); // maximizer will dump a bunch of stuff to the session log with this
      maximize(getProperty("auto_maximize_current"), 2500, 0, false);
      removeFromMaximize("2 dump");
      if (toBoolean(getProperty("auto_debug_maximizer"))) {
        abort(
          "NO WEAPON WAS EQUIPPED BY THE MAXIMIZER. REPORT THIS IN DISCORD AND INCLUDE YOUR SESSION LOG! YOU CAN RE-RUN AUTOSCEND AND IT SHOULD RUN OK (possibly).",
        );
      }
      if (equippedItem($slot`weapon`) === Item.none) {
        // workaround. equip a weapon & re-running maximizer appears to fix the issue.
        equip(equippableWeapon);
        maximize(getProperty("auto_maximize_current"), 2500, 0, false);
        auto_log_error(
          "No weapon was equipped by the maximizer. If you want to report this to the mafia devs at kolmafia.us include your session log. We have attempted a work around.",
        );
      }
    }
  }
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

    let s: Slot = Slot.none;
    if (slot_str === "acc") {
      s = $slot`acc3`;
    } else {
      s = toSlot(slot_str);
    }

    const overrides_split: Map<number, string> = new Map(
      splitString(overrides, ";").map((_v, _i) => [_i, _v]),
    );
    for (const [i, item_str] of overrides_split) {
      const it: Item = toItem(item_str);
      if (it === Item.none) {
        auto_log_warning(
          `"${item_str}" does not properly convert to an item (found in auto_equipment_override_${slot_str})`,
          "red",
        );
        continue;
      }
      if (autoEquip(s, it)) {
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
  return equipmentAmount(equipment) > 0;
}

export function possessUnrestricted(it: Item): boolean {
  return possessEquipment(it) && isUnrestricted(it);
}

export function possessOutfit(
  outfitToCheck: string,
  checkCanEquip: boolean,
): boolean {
  // have_outfit will report false if you're wearing some of the items
  // it will only report true if you have all in inventory or are wearing the whole thing
  // hence this now exists.
  if (outfitPieces(outfitToCheck).length === 0) {
    auto_log_warning$1(`${outfitToCheck} is not a valid outfit!`);
    return false;
  }

  for (const [key, piece] of outfitPieces(outfitToCheck).entries()) {
    if (!possessEquipment(piece)) {
      return false;
    }
    if (checkCanEquip && !canEquip(piece)) {
      return false;
    }
  }
  return true;
}

export function possessOutfit$1(outfitToCheck: string): boolean {
  return possessOutfit(outfitToCheck, false);
}

export function equipBaseline(): void {
  equipMaximizedGear();
}

export function ensureSealClubs(): void {
  cliExecute("acquire 1 seal-clubbing club");
  for (const club of $items`legendary seal-clubbing club, Meat Tenderizer is Murder, lead pipe, porcelain police baton, stainless steel shillelagh, frozen seal spine, ghast iron cleaver, oversized pipe, curmudgel, elegant nightstick, Maxwell's Silver Hammer, red-hot poker, giant foam finger, hilarious comedy prop, infernal toilet brush, mannequin leg, gnawed-up dog bone, severed flipper, spiked femur, corrupt club of corrupt corruption, kneecapping stick, Orcish frat-paddle, flaming crutch, corrupt club of corruption, skeleton bone, remaindered axe, club of corruption, Gnollish flyswatter, seal-clubbing club`) {
    if (possessEquipment(club)) {
      autoForceEquip$1($slot`weapon`, club);
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

export function auto_forceEquipSword(speculative: boolean): boolean {
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
    toItem(getProperty("auto_equipment_override_weapon")) !== Item.none &&
    auto_can_equip$1(
      toItem(getProperty("auto_equipment_override_weapon")),
      $slot`weapon`,
    )
  ) {
    if (
      itemType(toItem(getProperty("auto_equipment_override_weapon"))) ===
      "sword"
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
    return auto_can_equip$1(swordToEquip, $slot`weapon`);
  }
  return autoForceEquip$1($slot`weapon`, swordToEquip);
}

export function auto_forceEquipSword$1(): boolean {
  return auto_forceEquipSword(false);
}

export function is_watch(it: Item): boolean {
  //watches are accessories that conflict with each other. you can only equip one watch total.
  return booleanModifier(it, Modifier.get("Nonstackable Watch"));
}

function auto_getAllEquipabble(): Map<Item, number> {
  return auto_getAllEquipabble$1(Slot.none);
}

export function auto_getAllEquipabble$1(s: Slot): Map<Item, number> {
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
  let my_slots: Map<Slot, boolean> = new Map();
  if (ignore_slot) {
    my_slots = new Map([
      [$slot`hat`, true],
      [$slot`weapon`, true],
      [$slot`off-hand`, true],
      [$slot`back`, true],
      [$slot`shirt`, true],
      [$slot`pants`, true],
      [$slot`acc1`, true],
      [$slot`acc2`, true],
      [$slot`acc3`, true],
      [$slot`familiar`, true],
    ]);
  } else {
    my_slots.set(s, true);
    if (s === $slot`acc1`) {
      my_slots.set($slot`acc2`, true);
      my_slots.set($slot`acc3`, true);
    }
  }
  for (const my_slot of my_slots.keys()) {
    const it: Item = equippedItem(my_slot);
    valid_and_equippable.set(it, (valid_and_equippable.get(it) ?? 0) + 1);
  }
  return valid_and_equippable;
}

export function auto_saveEquipped(): Map<number, Item> {
  let my_slots: Map<Slot, boolean> = new Map();
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
  const i: number = 0;
  const equipped: Map<number, Item> = new Map();
  for (const sl of my_slots.keys()) {
    equipped.set(equipped.size, equippedItem(sl));
  }
  return equipped;
}

export function auto_loadEquipped(loadEquip: Map<number, Item>): boolean {
  let loadAccCount: number = 0;
  let accCount: number = 0;
  for (const [i, it] of loadEquip) {
    if (toSlot(it) === $slot`acc1`) {
      loadAccCount += 1;
    }
  }
  for (const [i, it] of loadEquip) {
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
/**
	Handles selecting and equiping an equipment that would allow a free kill skill to be cast, if able.
	Only selects one free kill at a time.
	Doesn't allow freekill equips in Advant guard or PocketFamiliars paths
*/
export function auto_equipFreekill(): void {
  // Pocket familiars combat doesn't permit skills, and bodyguards in Advant Guard make freekills un-free, so we're not doing that.
  if (in_avantGuard() || in_pokefam()) {
    return;
  }

  auto_log_info$1("Looking for an equipment with free kills available...");
  const dartHolster: Item = $item`Everfull Dart Holster`;
  const doctorBag: Item = $item`Lil' Doctor™ bag`;
  const joksterGun: Item = $item`The Jokester's gun`;
  const bcz: Item = auto_getItemToEquipBCZ();
  const legendClub: Item = $item`legendary seal-clubbing club`;

  const redDartAvailable: boolean =
    auto_haveDarts() && haveEffect($effect`Everything Looks Red`) === 0;
  const chestXrayAvailable: boolean = auto_chestXraysRemaining() > 0;
  const fireGunAvailable: boolean = auto_jokesterGunFreeKillAvailable();
  const sweatBulletsAvailable: boolean = auto_wantToBCZ(
    $skill`BCZ: Sweat Bullets`,
  );
  const clubBackAvailable: boolean = auto_clubEmBackInTimesRemaining() > 0;

  if (redDartAvailable) {
    auto_log_info$1(
      "We don't have ELR so let's hit a bullseye. Equipping Everful Dart holster.",
    );
    autoEquip($slot`acc3`, dartHolster);
  } else if (chestXrayAvailable) {
    auto_log_info$1(
      "We still have Chest X-Rays available. Equipping Lil' Doctor bag.",
    );
    autoEquip($slot`acc3`, doctorBag);
  } else if (fireGunAvailable) {
    auto_log_info$1("Let's be a jokester. Equipping The Jokester's gun.");
    autoEquip($slot`weapon`, joksterGun);
  } else if (sweatBulletsAvailable) {
    auto_log_info$1(
      "Man, we about to sweat bullets up in here. Equipping BCZ.",
    );
    autoEquip($slot`acc3`, bcz);
  } else if (clubBackAvailable) {
    // club back is last because it destroys drops, so we may choose to not use it
    auto_log_info$1(
      "They may not be seals, but we're gonna kill them last week. Equipping Legendary Seal Clubbing Club.",
    );
    autoEquip($slot`weapon`, legendClub);
  } else {
    auto_log_info$1(
      "No free kill sources found to equip, maybe you have some others, but we'll let combat figure that out.",
    );
  }
}
