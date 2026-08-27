import {
  appearanceRates,
  canEat,
  ceil,
  changeMcd,
  cliExecute,
  combatRateModifier,
  creatableAmount,
  create,
  currentMcd,
  equip,
  equippedAmount,
  equippedItem,
  experienceBonus,
  getMonsters,
  haveEffect,
  haveEquipped,
  inebrietyLimit,
  inHardcore,
  initiativeModifier,
  isUnrestricted,
  isWearingOutfit,
  Item,
  itemAmount,
  itemDropModifier,
  Location,
  meatDropModifier,
  Monster,
  monsterAttack,
  monsterElement,
  monsterLevelAdjustment,
  monsterPhylum,
  mpCost,
  myBasestat,
  myBuffedstat,
  myClass,
  myCompanion,
  myFamiliar,
  myFury,
  myHp,
  myInebriety,
  myLevel,
  myLocation,
  myMaxfury,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myServant,
  mySign,
  mySoulsauce,
  myThrall,
  myTurncount,
  npcPrice,
  numericModifier,
  putCloset,
  retrieveItem,
  Skill,
  splitString,
  toInt,
  use,
  useFamiliar,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $monster,
  $skills,
  $slot,
  $slots,
  $stat,
  get,
  have,
  set,
} from "libram";
import { periledToday } from "libram/dist/resources/2025/PeridotOfPeril";

import { speculative_pool_skill } from "../autoscend";
import { auto_buyUpTo } from "./auto_acquire";
import { auto_canRunBetweenBattleChecks } from "./auto_adventure";
import { buffMaintain$2 } from "./auto_buff";
import {
  addBonusToMaximize,
  auto_equipFreekill,
  autoEquip,
  autoEquipToSlot,
  autoForceEquip,
  autoForceEquip$3,
  autoOutfit,
  equipMaximizedGear,
  equipOverrides,
  equipStatgainIncreasers$1,
  equipStatgainIncreasers$2,
  possessEquipment,
  possessOutfit,
  simMaximizeWith,
  simValue,
} from "./auto_equipment";
import {
  auto_famWeight,
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar$1,
  is100FamRun,
  pathHasFamiliar,
  preAdvUpdateFamiliar,
} from "./auto_familiar";
import {
  provideFamExp$3,
  provideInitiative$2,
  provideItem$2,
  provideMeat$2,
} from "./auto_providers";
import { acquireHP, acquireMP, mp_regen, uneffect } from "./auto_restore";
import { solveDelayZone } from "./auto_routing";
import {
  acquireCombatMods,
  adjustForBanishIfPossible,
  adjustForBanishIfPossible$1,
  adjustForCopyIfPossible,
  adjustForFreeRunIfPossible,
  adjustForReplaceIfPossible,
  adjustForSniffingIfPossible,
  adjustForWandererCreatorIfPossible,
  adjustForYellowRayIfPossible,
  auto_abort,
  auto_burningDelay,
  auto_burnMP,
  auto_change_mcd,
  auto_combat_appearance_rates,
  auto_convertDesiredML,
  auto_forceFreeRun,
  auto_gettingLucky,
  auto_have_skill,
  auto_haveQueuedForcedCombat,
  auto_haveQueuedForcedNonCombat,
  auto_interruptCheck,
  auto_is_valid,
  auto_locationMonsters,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_MaxMLToCap,
  auto_predictAccordionTurns,
  auto_queueIgnore,
  auto_setMCDToCap,
  auto_wantedDropMonsters,
  auto_wantToBanish,
  auto_wantToBanish$1,
  auto_wantToCopy,
  auto_wantToCreateWanderer,
  auto_wantToFreeRun,
  auto_wantToReplace,
  auto_wantToSniff,
  auto_wantToYellowRay,
  executeFlavour,
  highest_available_mcd,
  internalQuestStatus,
  meatReserve,
  pm_updateThrall,
  safeGet,
  wrap_item,
} from "./auto_util";
import {
  auto_swoopLocations,
  is_ghost_in_zone,
  zone_combatMod,
  zone_needItem,
} from "./auto_zone";
import { auto_canUse } from "./combat/auto_combat_util";
import { getDesiredItemDrop, getNeededItemDrop } from "./engine/engine";
import { horsePreAdventure } from "./iotms/2010/mr2017";
import {
  auto_latteDropName,
  auto_latteDropWanted,
  isFantasyRealm,
  januaryToteAcquire,
} from "./iotms/2010/mr2018";
import {
  auto_sausageGoblin,
  auto_snapperPreAdventure,
} from "./iotms/2010/mr2019";
import { auto_handleRetrocape } from "./iotms/2020/mr2020";
import {
  auto_backupTarget,
  auto_fireExtinguisherCharges,
  auto_FireExtinguisherCombatSkill,
  auto_forceHandleCrystalBall,
  auto_haveCrystalBall,
  auto_haveFireExtinguisher,
  have_fireworks_shop,
} from "./iotms/2020/mr2021";
import {
  auto_handleParka,
  auto_hasParka,
  auto_haveCombatLoversLocket,
  auto_monsterInLocket,
  sweatpantsPreAdventure,
  utilizeStillsuit,
} from "./iotms/2020/mr2022";
import {
  auto_allRifts,
  auto_availableBrickRift,
  auto_dousesRemaining,
  auto_handleCCSC,
} from "./iotms/2020/mr2023";
import {
  auto_haveBatWings,
  auto_haveDarts,
  auto_swoopsRemaining,
  dartEleDmg,
} from "./iotms/2020/mr2024";
import {
  auto_bankChestMimicExpForBandit,
  auto_bczRefractedGaze,
  auto_haveCupidBow,
  auto_haveMcHugeLargeSkis,
  auto_haveMonodent,
  auto_havePeridot,
  auto_peridotSetZone,
  auto_wantSoCP,
  auto_wantToShrunkenHead$1,
  haveUsedPeridot,
  peridotManuallyDesiredMonsters,
} from "./iotms/2020/mr2025";
import {
  auto_baseballDiamondMaximizerBonus,
  auto_baseballFreefightMonster,
  auto_codpieceFillEmptySlots,
  auto_codpieceReconcileGem,
  auto_heartstoneShouldEquipForStealHeart,
  auto_preferSwordFamiliar,
  auto_swordNeedsMonodentHere,
  auto_swordOfSwordsTracking,
  auto_wantToEquipClubAcrossBattlefield,
} from "./iotms/2020/mr2026";
import { get_floundry_locations } from "./iotms/other/clan";
import {
  borisTrusty,
  borisWastedMP,
  is_boris,
} from "./paths/2012/avatar_of_boris";
import { kolhs_preadv } from "./paths/2013/kolhs";
import {
  ed_handleAdventureServant,
  edAcquireHP,
  edAcquireHP$1,
  isActuallyEd,
} from "./paths/2015/actually_ed_the_undying";
import { lar_abort } from "./paths/2017/live_ascend_repeat";
import { in_pokefam, pokefam_makeTeam } from "./paths/2018/pocket_familiars";
import { bat_formPreAdventure, in_darkGyffte } from "./paths/2019/dark_gyffte";
import { in_koe } from "./paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "./paths/2019/two_crazy_random_summer";
import {
  in_plumber,
  plumber_equipTool,
  plumber_forceEquipTool,
} from "./paths/2020/path_of_the_plumber";
import { in_wildfire } from "./paths/2021/wildfire";
import { in_aosol } from "./paths/2023/avatar_of_shadows_over_loathing";
import { ag_bgChat } from "./paths/2024/avant_guard";
import { in_wereprof, is_professor } from "./paths/2024/wereprofessor";
import { in_zootomist } from "./paths/2025/zootomist";
import { in_amw } from "./paths/2026/adventurer_meats_world";
import { bluevsred_willEncounterFight } from "./paths/2026/blue_vs_red";
import { inAftercore } from "./paths/casual";
import { prepareForSmutOrcs, prepareForTwinPeak } from "./quests/level_09";
import { L11_wantsPygmyBowlerWandererHunt } from "./quests/level_11";
import { auto_8BitCheckCappingScore } from "./quests/level_13";
import { abortIfRepeating } from "./utils/infiniteAdvDetector";
import { Maximizer, maximizer } from "./utils/maximizer";

//Calculates MP to acquire at low max mp levels
//At low max MP, important to keep MP near max, since every saucestorm (etc.) counts
function low_mp_handler(): void {
  auto_log_debug("Low max MP detected.", "red");
  const MIN_USEFUL_MP: number = 6; //Saucestorm
  const TARGET_MP: number = myMaxmp() - (myMaxmp() % MIN_USEFUL_MP);
  acquireMP(TARGET_MP, 0);
}

function print_footer(): void {
  auto_log_info(`[${myClass()}] @ path of [${myPath().name}]`, "blue");

  let next_line: string = `HP: ${myHp()}/${myMaxhp()}, MP: ${myMp()}/${myMaxmp()}, Meat: ${myMeat()}`;
  switch (myClass()) {
    case $class`Seal Clubber`:
      next_line += `, Fury: ${myFury()}/${myMaxfury()}`;
      break;
    case $class`Turtle Tamer`:
      for (const ttbless of $effects`Blessing of the War Snapper, Grand Blessing of the War Snapper, Glorious Blessing of the War Snapper, Blessing of She-Who-Was, Grand Blessing of She-Who-Was, Glorious Blessing of She-Who-Was, Blessing of the Storm Tortoise, Grand Blessing of the Storm Tortoise, Glorious Blessing of the Storm Tortoise`) {
        if (haveEffect(ttbless) > 0) {
          next_line += `, Blessing: ${ttbless}`;
        }
      }
      break;
    case $class`Sauceror`:
      next_line += `, Soulsauce: ${mySoulsauce()}`;
      break;
  }
  auto_log_info(next_line, "blue");

  function stat_sign(s: number): string {
    if (s >= 0) {
      return `+${s}`;
    } else {
      return s.toString();
    }
  }

  const bonus_mus: number =
    myBuffedstat($stat`Muscle`) - myBasestat($stat`Muscle`);
  const bonus_mys: number =
    myBuffedstat($stat`Mysticality`) - myBasestat($stat`Mysticality`);
  const bonus_mox: number =
    myBuffedstat($stat`Moxie`) - myBasestat($stat`Moxie`);
  auto_log_info(
    `mus: ${myBasestat($stat`Muscle`)}${stat_sign(bonus_mus)}. mys: ${myBasestat($stat`Mysticality`)}${stat_sign(bonus_mys)}. mox: ${myBasestat($stat`Moxie`)}${stat_sign(bonus_mox)}`,
    "blue",
  );

  next_line = "";
  if (pathHasFamiliar()) {
    next_line += `Familiar: ${myFamiliar()} @ ${auto_famWeight()}lbs. `;
  }
  if (myClass() === $class`Pastamancer`) {
    next_line += `Thrall: [${myThrall()}] @ level ${myThrall().level}`;
  }
  if (isActuallyEd()) {
    next_line += `Servant: [${myServant()}] @ level ${myServant().level}`;
  }
  if (myClass() === $class`Avatar of Jarlsberg`) {
    next_line += `Companion: [${myCompanion()}`;
  }
  auto_log_info(next_line, "blue");

  auto_log_info(
    `ML: ${monsterLevelAdjustment()} Encounter: ${combatRateModifier()} Init: ${initiativeModifier()}`,
    "blue",
  );
  auto_log_info(
    `Exp Bonus: ${experienceBonus()} Meat Drop: ${meatDropModifier()} Item Drop: ${itemDropModifier()}`,
    "blue",
  );
  auto_log_info(
    `Resists: ${numericModifier($modifier`Hot Resistance`)}/${numericModifier($modifier`Cold Resistance`)}/${numericModifier($modifier`Stench Resistance`)}/${numericModifier($modifier`Spooky Resistance`)}/${numericModifier($modifier`Sleaze Resistance`)}`,
    "blue",
  );
  //current equipment
  next_line = "equipment: ";
  for (const sl of $slots.all()) {
    if (
      $slots`hat, weapon, off-hand, back, shirt, pants, acc1, acc2, acc3, familiar`.includes(
        sl,
      )
    ) {
      //we always want to print the core slots
      next_line += `${sl}=[${equippedItem(sl)}]. `;
    } else if (equippedItem(sl) !== $item.none) {
      //other slots should only be printed if they contain something
      next_line += `${sl}=[${equippedItem(sl)}]. `;
    }
  }
  auto_log_info(next_line, "blue");
}

function auto_ghost_prep(place: Location): void {
  //if place contains physically immune enemies then we need to be prepared to deal non physical damage.
  if (!is_ghost_in_zone(place)) {
    return; //no ghosts no problem
  }
  if (in_plumber()) {
    return; //these paths either have their own ghost handling. or can always kill ghosts
  }
  if (get("youRobotBottom") === 2) {
    return; //you robot with a rocket crotch. deals fire damage to kill ghosts.
  }
  //a few iconic spells per avatar is ok. no need to be too exhaustive
  for (const sk of Skill.get([
    "Saucestorm",
    "Saucegeyser", //base classes
    "Fist of the Mummy", //actually ed the undying
    "Boil", //avatar of jarlsberg
    "Bilious Burst", //zombie slayer
    "Heroic Belch", //avatar of boris
    "Smoke Break", //avatar of sneaky pete
    "Fireball Toss", //path of the plumber
    "Chill of the Tomb", //dark gyffte
    "Lavafava",
    "Pungent Mung",
    "Beanstorm", //avatar of west of loathing
    "Hot Foot",
    "Emmental Elemental",
    "Sax of Violence", //avatar of shadow over loathing
    "Bacon Ray",
    "Spicy Meatball", //adventurer meats world
  ])) {
    if (auto_have_skill(sk)) {
      if (myMaxmp() >= 32) {
        //make sure we actually have the MP to cast spells
        acquireMP(32, 0);
      } else {
        low_mp_handler();
      }
    }
    if (auto_canUse(sk)) {
      //we can kill them with a spell
      return;
    }
  }
  if (auto_haveDarts() && dartEleDmg()) {
    maximizer.equip($item`Everfull Dart Holster`); //If we have darts and an elemental damage buff, might as well use that
    return;
  }

  let m_hot: number = 1;
  let m_cold: number = 1;
  let m_spooky: number = 1;
  let m_sleaze: number = 1;
  let m_stench: number = 1;
  const apprates: Map<Monster, number> = auto_combat_appearance_rates(
    place,
    true,
  );
  for (const [, mob] of getMonsters(place).entries()) {
    if ((apprates.get(mob) ?? 0.0) <= 0) {
      //won't show up because banished or req's not fulfilled
      continue;
    }
    if (mob.physicalResistance >= 80) {
      switch (monsterElement(mob)) {
        case $element`hot`:
          m_hot = 0;
          m_sleaze = 2;
          m_stench = 2;
          break;
        case $element`cold`:
          m_cold = 0;
          m_hot = 2;
          m_spooky = 2;
          break;
        case $element`spooky`:
          m_spooky = 0;
          m_hot = 2;
          m_stench = 2;
          break;
        case $element`sleaze`:
          m_sleaze = 0;
          m_cold = 2;
          m_spooky = 2;
          break;
        case $element`stench`:
          m_stench = 0;
          m_sleaze = 2;
          m_cold = 2;
          break;
      }
    }
  }

  const applyElementalDamageWeights = (m: Maximizer): void => {
    if (m_hot !== 0) {
      m.weight($modifier`Hot Damage`, 10 * m_hot);
    }
    if (m_cold !== 0) {
      m.weight($modifier`Cold Damage`, 10 * m_cold);
    }
    if (m_spooky !== 0) {
      m.weight($modifier`Spooky Damage`, 10 * m_spooky);
    }
    if (m_sleaze !== 0) {
      m.weight($modifier`Sleaze Damage`, 10 * m_sleaze);
    }
    if (m_stench !== 0) {
      m.weight($modifier`Stench Damage`, 10 * m_stench);
    }
  };
  let bonus: number = 0;

  simMaximizeWith(applyElementalDamageWeights);
  if (m_hot !== 0) {
    bonus += toInt(simValue($modifier`Hot Damage`));
  }
  if (m_cold !== 0) {
    bonus += toInt(simValue($modifier`Cold Damage`));
  }
  if (m_spooky !== 0) {
    bonus += toInt(simValue($modifier`Spooky Damage`));
  }
  if (m_sleaze !== 0) {
    bonus += toInt(simValue($modifier`Sleaze Damage`));
  }
  if (m_stench !== 0) {
    bonus += toInt(simValue($modifier`Stench Damage`));
  }

  if (bonus > 9) {
    applyElementalDamageWeights(maximizer);
    return;
  }

  auto_abort(
    `I was about to head into [${place}] which contains ghosts. I can not damage those`,
  );
}

function auto_pre_adventure(): boolean {
  const place: Location = myLocation();
  if (get("auto_disableAdventureHandling", false)) {
    auto_log_info(
      "Preadventure skipped by standard adventure handler.",
      "green",
    );
    return true;
  }
  auto_log_info("Starting preadventure script...", "green");
  auto_log_debug(`Adventuring at ${place}`, "green");

  if (
    itemAmount($item`handful of split pea soup`) === 0 &&
    creatableAmount($item`handful of split pea soup`) > 0
  ) {
    return create(1, $item`handful of split pea soup`);
  }

  if (get_floundry_locations().has(place)) {
    buffMaintain$2($effect`Baited Hook`);
  }
  // be ready to use red rocket if we don't have one
  if (
    have_fireworks_shop() &&
    itemAmount(
      // in a clan that has the Underground Fireworks Shop
      $item`red rocket`,
    ) === 0 &&
    auto_is_valid(
      // Don't buy if we already have one
      $item`red rocket`,
    ) &&
    canEat() &&
    myClass() !== $class`Pig Skinner` &&
    !in_wereprof() &&
    !auto_haveDarts() &&
    myMeat() >
      npcPrice(
        // or if it's not valid
        // be in a path that can eat
        // don't want to use a red rocket in Pig Skinner
        // don't use if we are in WereProf
        // don't want to use a red rocket if we have darts
        $item`red rocket`,
      ) +
        meatReserve()
  ) {
    retrieveItem(1, $item`red rocket`);
  }

  if (get("_bittycar") === "" && itemAmount($item`BittyCar MeatCar`) > 0) {
    use(1, $item`BittyCar MeatCar`);
  }

  if (
    place === $location`The Broodling Grounds` &&
    myClass() === $class`Seal Clubber`
  ) {
    uneffect($effect`Spiky Shell`);
    uneffect($effect`Scarysauce`);
    if (!uneffect($effect`Scariersauce`)) {
      auto_abort("Could not uneffect [Scariersauce]");
    }
  }

  if (myClass() === $class`Pastamancer`) {
    pm_updateThrall(place, false); //maybe dismiss Vampieroghi, maybe bind Spice Ghost or Vermincelli
  }
  //save some MP while buffing
  maximizer.weight($modifier`Mana Cost`, -1000).require("Tie", false);
  equipMaximizedGear();

  if (place === $location`The Smut Orc Logging Camp`) {
    prepareForSmutOrcs();
  }

  if (place === $location`Twin Peak`) {
    prepareForTwinPeak(false);
  }

  if (place === $location`Vanya's Castle`) {
    provideInitiative$2(600, $location`Vanya's Castle`, true);
    maximizer.weight($modifier`Initiative`, 200);
    maximizer.max($modifier`Initiative`, 600);
  }
  if (place === $location`The Fungus Plains`) {
    provideMeat$2(450, $location`The Fungus Plains`, true);
    maximizer.weight($modifier`Meat Drop`, 200);
    maximizer.max($modifier`Meat Drop`, 450);
  }
  if (place === $location`Megalo-City`) {
    buffMaintain$2($effect`Ghostly Shell`, 30, 1, 1); //+80 DA. 6 MP
    buffMaintain$2($effect`Astral Shell`, 30, 1, 1); //+80 DA, 10 MP
    buffMaintain$2($effect`Feeling Peaceful`, 0, 1, 1);
    maximizer
      .weight($modifier`Damage Absorption`, 200)
      .max($modifier`Damage Absorption`, 600);
  }
  if (place === $location`Hero's Field`) {
    provideItem$2(400, $location`Hero's Field`, true);
    maximizer.weight($modifier`Item Drop`, 200);
    // We don't cap our item drop, we sometimes drag wanderers in here
    // maximizer.max($modifier`Item Drop`, 400);
  }

  let junkyardML: boolean = false;
  if (
    $locations`Next to that Barrel with Something Burning in it, Near an Abandoned Refrigerator, Over Where the Old Tires Are, Out by that Rusted-Out Car`.includes(
      place,
    )
  ) {
    junkyardML = true;
    uneffect($effect`Spiky Shell`);
    uneffect($effect`Scarysauce`);
    if (in_aosol()) {
      uneffect($effect`Queso Fustulento`);
    }
    if (!uneffect($effect`Scariersauce`)) {
      auto_abort("Could not uneffect [Scariersauce]");
    }
  }

  if (is_boris()) {
    if (
      haveEffect($effect`Song of Solitude`) === 0 &&
      haveEffect($effect`Song of Battle`) === 0
    ) {
      //When do we consider Song of Cockiness?
      buffMaintain$2($effect`Song of Fortune`, 10, 1, 1);
      if (haveEffect($effect`Song of Fortune`) === 0) {
        buffMaintain$2($effect`Song of Accompaniment`, 10, 1, 1);
      }
    } else if (
      place.turnsSpent > 1 &&
      place !== safeGet("auto_priorLocation")
    ) {
      //When do we consider Song of Cockiness?
      buffMaintain$2($effect`Song of Fortune`, 10, 1, 1);
      if (haveEffect($effect`Song of Fortune`) === 0) {
        buffMaintain$2($effect`Song of Accompaniment`, 10, 1, 1);
      }
    }
  }

  if (isActuallyEd()) {
    // make sure we have enough MP to cast our most expensive spells
    // Wrath of Ra (yellow ray) is 40 MP, Curse of Stench (sniff) is 35 MP & Curse of Vacation (banish) is 30 MP.
    if (place !== $location`The Shore, Inc. Travel Agency`) {
      acquireMP(40, 1000);
      // ensure we can cast at least Fist of the Mummy or Storm of the Scarab.
      // so we don't waste adventures when we can't actually kill a monster.
      acquireMP(8, 0);
    }

    if (myHp() === 0) {
      // the game doesn't let you adventure if you have no HP even though Ed
      // gets a full heal when he goes to the underworld
      // only necessary if a non-combat puts you on 0 HP.
      edAcquireHP();
    }
  }

  if (in_tcrs()) {
    if (myClass() === $class`Sauceror` && mySign() === "Blender") {
      if (0 === haveEffect($effect`Uncucumbered`)) {
        auto_buyUpTo(1, $item`hair spray`);
        use(1, $item`hair spray`);
      }
      // below no longer applicable due to current seed, will find new source
      //	if (0===have_effect($effect[Minerva\'s Zen]))
      //	{
      //		auto_buyUpTo(1, $item[glittery mascara]);
      //		use(1, $item[glittery mascara]);
      //	}
    }
  }
  // If we're zootomist, need to level, and we have +xp on our milk, cast it.
  if (in_zootomist() && myLevel() < 13) {
    for (const ef of $effects`Milk of Familiar Kindness, Milk of Familiar Cruelty`) {
      if (numericModifier(ef, $modifier`Familiar Experience`) > 0) {
        buffMaintain$2(ef);
      }
    }
  }

  if (place === $location`Cobb's Knob Treasury`) {
    provideMeat$2(1800, $location`Cobb's Knob Treasury`, true);
    maximizer.weight($modifier`Meat Drop`, 200);
  }
  // need more meat than usual for skills + level in meatpath
  // as of 2026-03-30 this values meat drop double item drop in the default maximizer statement
  if (in_amw() && myLevel() < 13) {
    maximizer.weight($modifier`Meat Drop`, 10);
  }
  // this calls the appropriate provider for +combat or -combat depending on the zone we are about to adventure in..
  const burningDelay: boolean = auto_burningDelay();
  const gettingLucky: boolean = auto_gettingLucky();
  const forcedNonCombat: boolean = auto_haveQueuedForcedNonCombat();
  const { doCombatModifiers, desiredModifier } = zone_combatMod(place);
  if (
    doCombatModifiers &&
    !auto_queueIgnore() &&
    !auto_haveQueuedForcedCombat()
  ) {
    //forced nc is included in queue ignore
    acquireCombatMods(desiredModifier, true);
  }
  //evaluate a boolean prop for the familiar files
  auto_wantSoCP();
  auto_preferSwordFamiliar(place);
  auto_bankChestMimicExpForBandit();
  // Update our familiar after combat modifiers (which can set the familiar), but before Crystal Ball (familiar equip)
  preAdvUpdateFamiliar(place);
  if (
    myFamiliar() === $familiar`Sword of S Words` &&
    myFamiliar().experience < 200
  ) {
    provideFamExp$3(50, false, false);
  }
  ed_handleAdventureServant(place);

  let considerCrystalBallBonus: boolean = false;
  if (auto_haveCrystalBall()) {
    if (auto_queueIgnore() || safeGet("auto_nextEncounter") !== $monster.none) {
      //if already forced by something else, no need to handle your ball
    } else if (!auto_forceHandleCrystalBall(place)) {
      //equipping the crystal ball can't hurt but it is neither forced nor forbidden
      //will consider giving it a maximizer bonus after checking if monster queue control is wanted
      considerCrystalBallBonus = true;
    }
  }

  const possible_monsters: Map<number, Monster> = new Map();
  if (safeGet("auto_nextEncounter") !== $monster.none) {
    //next monster is forced by zone mechanics or by now locked-in miniature crystal ball
    possible_monsters.set(
      possible_monsters.size,
      safeGet("auto_nextEncounter"),
    );
  } else {
    for (const [, mon] of getMonsters(place).entries()) {
      //consider all possible monsters, with queue effects argument false
      //	queue argument true would return only crystal ball prediction if there is one and equipped,
      //	but here keeping ball equipped will be either not guaranteed if monsters don't matter, or forbidden
      if ((appearanceRates(place)[mon.toString()] ??= 0.0) > 0) {
        possible_monsters.set(possible_monsters.size, mon);
      }
    }
  }

  let zoneHasUnwantedMonsters: boolean = false;
  let zoneHasWantedMonsters: boolean = false;
  if (!auto_queueIgnore()) {
    //next encounter is a monster from the zone
    for (const [, mon] of possible_monsters) {
      if (auto_wantToYellowRay(mon, place)) {
        adjustForYellowRayIfPossible(mon);
        zoneHasWantedMonsters = true;
      }
      if (auto_wantToBanish$1(monsterPhylum(mon), place)) {
        // attempt to prepare for banishing, but if we can not try free running
        adjustForBanishIfPossible$1(monsterPhylum(mon), place);
        zoneHasUnwantedMonsters = true;
      }
      const wantToBanish: boolean = auto_wantToBanish(mon, place);
      const wantToFreeRun_1: boolean =
        auto_wantToFreeRun(mon, place) || auto_forceFreeRun(false);
      if (wantToBanish || wantToFreeRun_1) {
        // attempt to prepare for banishing, but if we can not try free running
        let willBanish: boolean = false;
        if (wantToBanish) {
          willBanish = adjustForBanishIfPossible(mon, place);
        }
        if (!willBanish) {
          adjustForFreeRunIfPossible(mon, place);
        }
        zoneHasUnwantedMonsters = true;
      }
      if (auto_wantToReplace(mon, place)) {
        adjustForReplaceIfPossible(mon);
        zoneHasUnwantedMonsters = true;
      }
      if (auto_wantToCopy(mon, place)) {
        adjustForCopyIfPossible(mon);
        zoneHasWantedMonsters = true;
      }
      if (auto_wantToSniff(mon, place)) {
        adjustForSniffingIfPossible(mon);
        zoneHasWantedMonsters = true;
      }
      if (
        auto_havePeridot() &&
        peridotManuallyDesiredMonsters().includes(mon) &&
        !haveUsedPeridot(place)
      ) {
        zoneHasWantedMonsters = true;
      }
    }
  }
  // We process this differently, we don't care if the monster is unnatural
  for (const [, mon] of possible_monsters) {
    if (auto_wantToCreateWanderer(place, mon)) {
      adjustForWandererCreatorIfPossible(mon);
    }
  }
  if (
    place === $location`The Hidden Bowling Alley` &&
    safeGet("clubEmNextWeekMonster") !== $monster.none &&
    bluevsred_willEncounterFight(safeGet("clubEmNextWeekMonster")) &&
    safeGet("clubEmNextWeekMonster") === safeGet("auto_nextEncounter") &&
    L11_wantsPygmyBowlerWandererHunt()
  ) {
    auto_log_info(
      "Preparing to replace-hunt for a pygmy bowler via the forced wanderer fight.",
      "blue",
    );
    for (const [monster] of auto_locationMonsters(place)) {
      if (
        monster === $monster`pygmy bowler` ||
        bluevsred_willEncounterFight(monster)
      ) {
        continue;
      }

      adjustForReplaceIfPossible(monster);
      adjustForBanishIfPossible(monster, place);
    }
  }
  if (considerCrystalBallBonus) {
    //give miniature crystal ball a maximizer bonus only if the location has monsters to avoid or target
    //TODO give 0 if tally of available banishes and no sniff makes trying to avoid unwanted monsters with ball not worthwhile?
    const crystalBallMaximizerBonus: number =
      0 +
      (zoneHasUnwantedMonsters ? 300 : 0) +
      (zoneHasWantedMonsters ? 300 : 0);
    if (crystalBallMaximizerBonus !== 0) {
      maximizer.bonus(
        wrap_item($item`miniature crystal ball`),
        crystalBallMaximizerBonus,
      );
    }
  }
  // Equip the combat lover's locket if we're missing a monster in the zone
  if (auto_haveCombatLoversLocket()) {
    for (const [mon, rate] of Object.entries(appearanceRates(place)).map(
      ([_k, _v]) => [Monster.get(_k), _v] as [Monster, number],
    )) {
      if (
        rate > 0 &&
        mon.id > 0 &&
        mon.copyable &&
        !mon.boss &&
        !auto_monsterInLocket(mon) &&
        place !== $location`Noob Cave`
      ) {
        // We use Noob Cave as the placeholder location for zoneless encounters so lets not equip it when we're not actually going there.
        auto_log_info(
          `We want to get the "${mon}" monster into the combat lover's locket from ${place}, so we're bringing it along.`,
          "blue",
        );
        autoEquip($item`combat lover's locket`);
        break;
      }
    }
  }
  // Equip the legendary seal-clubbing club if there are enough monster drops to be worth clubbing across the battlefield for
  if (auto_wantToEquipClubAcrossBattlefield(place)) {
    addBonusToMaximize($item`legendary seal-clubbing club`, 400);
  }

  const baseballDiamondBonus = auto_baseballDiamondMaximizerBonus(place);
  if (baseballDiamondBonus > 0) {
    addBonusToMaximize($item`Baseball Diamond`, baseballDiamondBonus);
  }

  if (place && auto_heartstoneShouldEquipForStealHeart(place)) {
    addBonusToMaximize($item`Heartstone`, 30);
  }

  if (in_koe() && possessEquipment($item`low-pressure oxygen tank`)) {
    autoEquip($item`low-pressure oxygen tank`);
  }
  // Latte may conflict with certain quests. Ignore latte drops for the greater good.
  const IgnoreLatteDrop: Location[] = $locations`The Haunted Boiler Room`;
  if (
    auto_latteDropWanted(place) &&
    !IgnoreLatteDrop.includes(place) &&
    !is_boris()
  ) {
    // boris has no way to equip latte mug or Kramco (no offhand or familiar)
    if (auto_sausageGoblin() && place === solveDelayZone()) {
      // Burning delay using a Sausage Goblin. Can't hold both the Kramco and the Latte, we only have one off-hand!
      if (canChangeToFamiliar($familiar`Left-Hand Man`)) {
        // If we can use the Left-Hand man, we can get a two-fer with both the Kramco and Latte
        // Hurrah! We found an actual use for it, it's not useless after all!
        auto_log_info(
          `We want to get the "${auto_latteDropName(place)}" ingredient for our Latte from ${place}, and we're buring delay using the Kramco so your Left-Hand Man will be bringing your Latte along!`,
          "blue",
        );
        handleFamiliar$1($familiar`Left-Hand Man`);
        handleFamiliar$1($familiar`Left-Hand Man`);
        useFamiliar($familiar`Left-Hand Man`); // update familiar already called so have to force.
        autoEquipToSlot($slot`familiar`, $item`latte lovers member's mug`);
      }
    } else {
      auto_log_info(
        `We want to get the "${auto_latteDropName(place)}" ingredient for our Latte from ${place}, so we're bringing it along.`,
        "blue",
      );
      autoEquip($item`latte lovers member's mug`);
    }
  }

  if (
    auto_haveMcHugeLargeSkis() &&
    get("auto_forceNonCombatSource") === "McHugeLarge left ski" &&
    !get("auto_avalancheDeployed", false)
  ) {
    autoForceEquip($slot`acc2`, wrap_item($item`McHugeLarge left ski`));
    // We put it in acc2 so it can't clash with the war accessory in acc3
  }

  if (
    auto_hasParka() &&
    get("auto_forceNonCombatSource") === "jurassic parka" &&
    !get("auto_parkaSpikesDeployed", false)
  ) {
    autoForceEquip$3(wrap_item($item`Jurassic Parka`)); //equips parka and forbids maximizer tampering with shirt slot
    //not using auto_configureParka("spikes") so maximizer stays aware of ML from shirt, instead of maximizing with another shirt or no shirt before changing to parka
    set("auto_parkaSetting", "spikes");
    if (get("parkaMode") !== "spikolodon") {
      cliExecute("parka spikolodon");
    }
  }

  const fluda: Item = $item`Flash Liquidizer Ultra Dousing Accessory`;
  const douse_locs: Location[] = $locations`The Hatching Chamber, The Feeding Chamber, The Royal Guard Chamber`;
  if (
    have(fluda) &&
    (douse_locs.includes(place) || auto_allRifts().includes(place)) &&
    auto_dousesRemaining() > 0
  ) {
    autoEquip(fluda);
  }

  const bat_wings: Item = $item`bat wings`;
  const swoop_locs: Location[] = auto_swoopLocations();
  if (
    auto_haveBatWings() &&
    (swoop_locs.includes(place) || auto_allRifts().includes(place)) &&
    auto_swoopsRemaining() > 0
  ) {
    autoEquip(bat_wings);
  }

  if (auto_haveFireExtinguisher()) {
    const exting: Item = wrap_item($item`industrial fire extinguisher`);
    if (
      auto_FireExtinguisherCombatSkill(place) !== undefined ||
      $locations`The Goatlet, Twin Peak, The Hidden Bowling Alley, The Hatching Chamber, The Feeding Chamber, The Royal Guard Chamber`.includes(
        place,
      )
    ) {
      autoEquip(exting);
    } else if (
      auto_availableBrickRift() === place &&
      auto_fireExtinguisherCharges() >= 30
    ) {
      autoEquip(exting); // Can do at least 1 polar vortex for shadow bricks while keeping 20 for a zone specific skill
    } else if (
      in_wildfire() &&
      auto_haveFireExtinguisher() &&
      place.fireLevel > 3
    ) {
      addBonusToMaximize(exting, 200); // extinguisher prevents per-round hot damage in wildfire path
    }
  }

  if (auto_wantToShrunkenHead$1(place)) {
    addBonusToMaximize($item`shrunken head`, 300);
  }

  const planToPeridot =
    auto_havePeridot() &&
    !haveUsedPeridot(place) &&
    (zoneHasWantedMonsters || auto_peridotSetZone(place)) &&
    !L11_wantsPygmyBowlerWandererHunt(true);
  const wantBCZRefractedGaze: boolean =
    safeGet("auto_familiarChoice") !== $familiar`Sword of S Words` &&
    auto_bczRefractedGaze(planToPeridot, place);

  if (planToPeridot && !wantBCZRefractedGaze) {
    //add a large bonus to Peridot of Peril if the zone has wanted monsters (or we want to set the zone without using an adventure) and we haven't visited there yet
    addBonusToMaximize($item`Peridot of Peril`, 1000);
  } else if (wantBCZRefractedGaze) {
    // Peridot doesn't work with refracted gaze, so keep Peridot of Peril off and bring BCZ instead.
    if (auto_havePeridot()) {
      maximizer.exclude($item`Peridot of Peril`);
    }

    autoEquip($item`blood cubic zirconia`);

    if (auto_haveMonodent()) {
      if (auto_wantedDropMonsters(place).length > 1) {
        autoEquip($item`Monodent of the Sea`);
      } else {
        addBonusToMaximize($item`Monodent of the Sea`, 1700);
      }
    }
  } else if (
    auto_haveMonodent() &&
    auto_baseballFreefightMonster() === $monster`some fish` &&
    zoneHasUnwantedMonsters &&
    !planToPeridot
  ) {
    // Add the monodent for killing some fish, for free, if possible
    addBonusToMaximize($item`Monodent of the Sea`, 200);
  }

  if (
    safeGet("auto_familiarChoice") === $familiar`Sword of S Words` &&
    auto_swordNeedsMonodentHere(place)
  ) {
    // If we're going to replace non-copyables with some fish
    addBonusToMaximize($item`Monodent of the Sea`, 400);
  }

  // If we have the peridot, are not considering it, would have an encounter that would be overwritten if we wore the peridot
  // Which is currently only forced non-combats
  // https://github.com/loathers/encounter/blob/main/hierarchy.mermaid
  if (
    auto_havePeridot() &&
    !planToPeridot &&
    !maximizer.has($item`Peridot of Peril`) &&
    !get("mappingMonsters") &&
    auto_haveQueuedForcedNonCombat() &&
    safeGet("auto_forceNonCombatLocation") === place &&
    !periledToday(place)
  ) {
    maximizer.exclude($item`Peridot of Peril`);
  }

  if (
    auto_haveBatWings() &&
    place === $location`The Penultimate Fantasy Airship`
  ) {
    // only here to get immateria. Get it faster with bat wings
    autoEquip($item`bat wings`);
  }

  if (in_plumber()) {
    let pool_skill: number = speculative_pool_skill();
    if (possessEquipment($item`pool cue`)) {
      pool_skill += 3;
    }
    // Even though there are ghosts in the Billiards Room, we want to equip
    // the pool cue to finish up the quest.
    let skip_equipping_flower: boolean =
      place === $location`The Haunted Billiards Room` && 18 <= pool_skill;
    // Ziggurat has a ghost BUT when clearing out lianas, we want to equip
    // machete in mainhand and use boots.
    if (place === $location`A Massive Ziggurat`) {
      let lianaFought: number = 0;
      for (const [, s] of splitString(place.combatQueue, "; ").entries()) {
        if (s === "dense liana") {
          ++lianaFought;
        }
      }
      if (lianaFought < 3) {
        skip_equipping_flower = true;
      }
    }
    if (
      (is_ghost_in_zone(place) && !skip_equipping_flower) ||
      (place === $location`The Smut Orc Logging Camp` &&
        possessEquipment($item`frosty button`))
    ) {
      if (!plumber_equipTool($stat`Mysticality`)) {
        auto_abort(
          "I'm scared to adventure in a zone with ghosts without a fire flower. Please fight a bit and buy me a fire flower.",
        );
      }
    } else {
      plumber_equipTool($stat`Moxie`);
    }
    // It is dangerous out there! Take this!
    const flyeredML: number = get("flyeredML");
    const have_pill_keeper: boolean =
      possessEquipment($item`Eight Days a Week Pill Keeper`) &&
      isUnrestricted($item`Unopened Eight Days a Week Pill Keeper`);

    if (
      0 < flyeredML &&
      flyeredML < 10000 &&
      in_plumber() &&
      have_pill_keeper
    ) {
      auto_log_debug(
        "I expect to be flyering, equipping Pill Keeper to skip the first hit.",
      );
      autoEquipToSlot($slot`acc3`, $item`Eight Days a Week Pill Keeper`);
    }
  }

  auto_equipFreekill();
  equipOverrides();
  kolhs_preadv(place);
  ag_bgChat();

  if (is100FamRun() && myFamiliar() === $familiar.none) {
    // re-equip a familiar if it's a 100% run just in case something unequipped it
    // looking at you auto_maximizedConsumeStuff()...
    // and L12_themtharHills()...
    useFamiliar(safeGet("auto_100familiar"));
    auto_log_debug(
      `Re-equipped your ${safeGet("auto_100familiar")} as something had unequipped it. This is bad and should be investigated.`,
    );
  }

  if (
    $locations`Vanya's Castle, The Fungus Plains, Megalo-City, Hero's Field`.includes(
      place,
    ) &&
    myTurncount() !== 0
  ) {
    if (!possessEquipment($item`continuum transfunctioner`)) {
      auto_abort(
        "Tried to be retro but lacking the Continuum Transfunctioner.",
      );
    }
    autoEquipToSlot($slot`acc3`, $item`continuum transfunctioner`);
  }

  if (place === $location`Inside the Palindome` && myTurncount() !== 0) {
    if (!possessEquipment($item`Talisman o' Namsilat`)) {
      auto_abort("Tried to go to The Palindome but don't have the Namsilat");
    }
    autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
  }

  if (
    place === $location`The Haunted Boiler Room` &&
    myTurncount() !== 0 &&
    internalQuestStatus("questL11Manor") < 3
  ) {
    if (!possessEquipment($item`unstable fulminate`)) {
      auto_abort("Tried to charge a WineBomb but don't have one.");
    }
    if (equippedAmount($item`unstable fulminate`) === 0) {
      auto_log_warning(
        "Tried to adventure in [The Haunted Boiler Room] without an [Unstable Fulminate]... correcting",
        "red",
      );
      autoForceEquip($slot`off-hand`, $item`unstable fulminate`);
      if (equippedAmount($item`unstable fulminate`) === 0) {
        auto_abort(
          "Correction failed, please report this. Manually get the [wine bomb] then run me again",
        );
      }
    }
  }

  if (place === $location`The Black Forest`) {
    autoEquipToSlot($slot`acc3`, $item`blackberry galoshes`);
  }

  if (
    $locations`Barrrney's Barrr, The F'c'le, The Poop Deck, Belowdecks`.includes(
      place,
    )
  ) {
    if (possessEquipment($item`pirate fledges`)) {
      autoEquipToSlot($slot`acc3`, $item`pirate fledges`);
    } else if (possessOutfit("Swashbuckling Getup")) {
      autoOutfit("Swashbuckling Getup");
    } else {
      auto_abort(
        "Trying to be a pirate without being able to dress like a pirate.",
      );
    }
  }

  bat_formPreAdventure();
  horsePreAdventure();
  auto_snapperPreAdventure(place);
  sweatpantsPreAdventure();

  let mayNeedItem: boolean = true;
  if (burningDelay || forcedNonCombat) {
    //when delay burning if the monster wants item drop it would not be the zone based value that follows
    //none of the uses of auto_forceNextNoncombat() will need item drop
    mayNeedItem = false;
  } else if (
    gettingLucky &&
    !$locations`The Hidden Temple, The Red Zeppelin, A Maze of Sewer Tunnels`.includes(
      place,
    )
  ) {
    //Baa'baa'bu'ran is probably the only Lucky adventure that will need item drop
    mayNeedItem = false;
  }
  let { needItem, needScore } = zone_needItem(place);

  let taskItemDrop = getNeededItemDrop();

  const otherTargetsToCheck: Monster[] = [];

  if (myFamiliar() === $familiar`Sword of S Words`) {
    otherTargetsToCheck.push(auto_swordOfSwordsTracking());
  }
  otherTargetsToCheck.push(safeGet("auto_nextEncounter"));

  for (const monster of otherTargetsToCheck) {
    if (!monster || monster === $monster.none) continue;

    const drop = getDesiredItemDrop(monster);
    if (!drop) continue;
    taskItemDrop = Math.max(taskItemDrop ?? 0, drop);
  }

  if (taskItemDrop) {
    if (taskItemDrop > needScore || !needItem) {
      needItem = true;
      needScore = taskItemDrop;
    }

    const itemWeight = Math.ceil(Math.max(taskItemDrop, needScore) / 40);

    // Start weighting the item drop when we really want it
    if (itemWeight > maximizer.getWeight($modifier`Item Drop`)) {
      maximizer.weight($modifier`Item Drop`, itemWeight);
    }
  }

  if (mayNeedItem && needItem) {
    const capped: boolean = provideItem$2(ceil(needScore), place, false);
    if (!capped && auto_haveCupidBow()) {
      addBonusToMaximize($item`toy Cupid bow`, 400);
    }
  }
  // Only cast Paul's pop song if we expect it to more than pay for its own casting.
  // Casting before ML variation ensures that this, the more important buff, is cast before ML.
  // Also check we're not regenning loads of MP already
  if (
    auto_predictAccordionTurns() >= 8 &&
    numericModifier($modifier`MP Regen Min`) < 5
  ) {
    buffMaintain$2($effect`Paul's Passionate Pop Song`);
  }
  // ML adjustment zone section
  let doML: boolean = true;
  let removeML: boolean = false;
  // removeML MUST be true for purgeML to be used. This is only used for -ML locations like Smut Orc, and you must have 5+ SGEAs to use.
  let purgeML: boolean = false;

  const highMLZones: Location[] = $locations`Oil Peak, The Typical Tavern Cellar, The Haunted Boiler Room, The Defiled Cranny`;
  const lowMLZones: Location[] = $locations`The Smut Orc Logging Camp, Fight in the Dirt, Fight in the Tall Grass, Fight in the Very Tall Grass, Tower Level 1, Tower Level 2, Tower Level 3`;
  // Generic Conditions
  if (inAftercore()) {
    doML = false;
    removeML = false;
    purgeML = false;
  }
  // NOTE: If we aren't quits before we pass L13, let us gain stats.
  if (
    (get("flyeredML") > 9999 ||
      internalQuestStatus("questL12War") > 1 ||
      get("sidequestArenaCompleted") !== "none") &&
    myLevel() > 12
  ) {
    doML = false;
    removeML = true;
    purgeML = false;
  }
  // Allow user settable option to override the above settings to not slack off ML
  if (myLevel() > 12 && get("auto_disregardInstantKarma", false)) {
    doML = true;
    removeML = false;
    purgeML = false;
  }
  if (
    myLevel() >= 13 &&
    internalQuestStatus("questL13Final") >= 7 &&
    internalQuestStatus("questL13Final") < 14
  ) {
    // When we're at the tower
    doML = false;
  }
  // Backup Camera copies have double ML applied. Reduce ML to avoid getting beaten up
  if (auto_backupTarget()) {
    doML = false;
    removeML = true;
    purgeML = false;
  }
  // Gremlins specific. need to let them hit so avoid ML unless defense is very high
  if (
    junkyardML &&
    myBuffedstat($stat`Moxie`) < 2 * monsterAttack($monster`erudite gremlin`)
  ) {
    doML = false;
    removeML = true;
    purgeML = false;
  }
  // monster level increases zone damage. don't re apply ML buff shrugged by level_11.ash
  if (place === $location`The Copperhead Club`) {
    doML = false;
    removeML = true;
    purgeML = false;
  }
  // Location Specific Conditions
  if (lowMLZones.includes(place)) {
    doML = false;
    removeML = true;
    purgeML = true;
  }
  if (highMLZones.includes(place)) {
    doML = true;
    removeML = false;
    purgeML = false;
  }
  // Path Specific Conditions
  if (is_professor() || in_plumber()) {
    //Path of the Plumber doesn't need ML and WereProfessor professor doesn't like ML
    doML = false;
    removeML = true;
    purgeML = true;
  }
  // Act on ML settings
  if (doML) {
    // Catch when we leave lowMLZone, allow for being "side tracked" by delay burning
    if (
      haveEffect($effect`Driving Intimidatingly`) > 0 &&
      get("auto_debuffAsdonDelay", 0) >= 2
    ) {
      auto_log_debug("No Reason to delay Asdon Usage");
      uneffect($effect`Driving Intimidatingly`);
      set("auto_debuffAsdonDelay", 0);
    } else if (
      toInt(haveEffect($effect`Driving Intimidatingly`)) === 0 &&
      get("auto_debuffAsdonDelay", 0) >= 0
    ) {
      set("auto_debuffAsdonDelay", 0);
    } else {
      set("auto_debuffAsdonDelay", get("auto_debuffAsdonDelay", 0) + 1);
      auto_log_debug(
        `Delaying debuffing Asdon: ${get("auto_debuffAsdonDelay")}`,
      );
    }

    auto_MaxMLToCap(auto_convertDesiredML(150), false);
  }
  // If we are in some state where we do not want +ML (Level 13 or Smut Orc) make sure ML is removed
  if (removeML) {
    auto_change_mcd(0);
    maximizer.weight($modifier`Monster Level`, -10);
    uneffect($effect`Driving Recklessly`);
    uneffect($effect`Ur-Kel's Aria of Annoyance`);

    if (purgeML && itemAmount($item`soft green echo eyedrop antidote`) > 5) {
      uneffect($effect`Drescher's Annoying Noise`);
      uneffect($effect`Pride of the Puffin`);
      uneffect($effect`Ceaseless Snarling`);
      uneffect($effect`Blessing of Serqet`);
    } else if (
      purgeML &&
      isActuallyEd() &&
      (itemAmount($item`ancient cure-all`) > 0 ||
        itemAmount($item`soft green echo eyedrop antidote`) > 0)
    ) {
      uneffect($effect`Blessing of Serqet`);
    }
  }
  // Here we give a limited value to ML if +/-ML is not specifically called in the current maximizer string. This does not enforce the limit.
  // if the limit setting has no value then ML has already been given a value indirectly by "exp" in the default maximizer statement
  if (
    get("auto_MLSafetyLimit") !== "" &&
    !maximizer.has($modifier`Monster Level`)
  ) {
    if (toInt(get("auto_MLSafetyLimit")) === -1) {
      // prevent all ML being equiped if limit is -1 and equip lowest possible ML including going negative
      maximizer.weight($modifier`Monster Level`, -1000);
    } else if (toInt(get("auto_MLSafetyLimit")) <= highest_available_mcd()) {
      //mcd can already fill all allowed ML without using equipment slots
      //if the value is 0 adding ML with 0max is useless, it does not stop the maximizer from picking equipment with ML,
      //0max would just tell the maximizer to add +0 value to ML over 0 which is the same as not giving any value for ML
    } else {
      // note: maximizer will allow to go above the max value, ML just won't contribute to the total score after the max value
      maximizer
        .weight($modifier`Monster Level`)
        .max($modifier`Monster Level`, toInt(get("auto_MLSafetyLimit")));
    }
  }
  // Last minute switching for garbage tote. But only if nothing called on januaryToteAcquire this turn.
  if (
    !get("auto_januaryToteAcquireCalledThisTurn", false) &&
    auto_is_valid($item`wad of used tape`)
  ) {
    januaryToteAcquire($item`wad of used tape`);
  }

  maximizer.clearWeight($modifier`Mana Cost`);
  // EQUIP MAXIMIZED GEAR
  auto_ghost_prep(place);
  equipMaximizedGear();
  auto_8BitCheckCappingScore(place);

  auto_handleRetrocape(); // has to be done after equipMaximizedGear otherwise the maximizer reconfigures it
  auto_handleParka(); //same as retrocape above

  auto_codpieceReconcileGem($item`blood cubic zirconia`);
  auto_codpieceReconcileGem($item`Baseball Diamond`);
  auto_codpieceReconcileGem($item`Heartstone`);
  auto_codpieceReconcileGem($item`Peridot of Peril`);
  auto_codpieceFillEmptySlots();

  cliExecute("checkpoint clear");
  //before guaranteed non combats that give stats, overrule maximized equipment to increase stat gains
  if (
    place === $location`The Hidden Bowling Alley` &&
    itemAmount($item`bowling ball`) > 0 &&
    get("hiddenBowlingAlleyProgress") < 5
  ) {
    equipStatgainIncreasers$2();
    plumber_forceEquipTool();
  } else if (
    place === $location`The Haunted Ballroom` &&
    internalQuestStatus("questM21Dance") === 3
  ) {
    equipStatgainIncreasers$2();
    plumber_forceEquipTool();
  } else if (
    place === $location`The Shore, Inc. Travel Agency` &&
    itemAmount($item`forged identification documents`) === 0
  ) {
    equipStatgainIncreasers$1(myPrimestat(), true); //The Shore, Inc. Travel Agency choice 793 is configured to pick main stat or all stats
    plumber_forceEquipTool();
  }
  if (auto_handleCCSC() && !haveEquipped($item`candy cane sword cane`)) {
    autoForceEquip$3($item`candy cane sword cane`); // Force the candy cane sword cane if June cleaver has been buffed beyond the 1000 bonus boost
  }

  if (
    isActuallyEd() &&
    isWearingOutfit("Filthy Hippy Disguise") &&
    place === $location`The Hippy Camp`
  ) {
    equip($slot`pants`, $item.none);
    putCloset(itemAmount($item`filthy corduroys`), $item`filthy corduroys`);
    if (isWearingOutfit("Filthy Hippy Disguise")) {
      auto_abort(
        "Tried to adventure in the Hippy Camp as Actually Ed the Undying wearing the Filthy Hippy Disguise (this is bad).",
      );
    } else {
      auto_log_info(
        "Took off the Filthy Hippy Disguise before adventuring in the Hippy Camp so we don't waste adventures on non-combats.",
      );
    }
  }
  // Last minute debug logging and a final MCD tweak just in case Maximizer did silly stuff
  if (lowMLZones.includes(place)) {
    auto_log_debug(
      `Going into a LOW ML ZONE with ML: ${monsterLevelAdjustment()}`,
    );
  } else {
    // Last minute MCD alterations if Limit set, otherwise trust maximizer
    if (get("auto_MLSafetyLimit") !== "" && !removeML) {
      auto_setMCDToCap();
    }

    auto_log_debug(
      `Going into High or Standard ML Zone with ML: ${monsterLevelAdjustment()}`,
    );
  }

  executeFlavour();
  // After maximizing equipment, we might not be at full HP
  if ($locations`Tower Level 1, The Invader`.includes(place)) {
    acquireHP();
  }

  if (myHp() <= myMaxhp() * 0.75) {
    acquireHP();
  }
  // always heal to full HP for Boo Clues
  if (
    $locations`A-Boo Peak`.includes(place) &&
    get("auto_aboopending", 0) !== 0
  ) {
    acquireHP();
    if (isActuallyEd()) {
      //force Ed to heal
      edAcquireHP$1(myMaxhp());
    }
  }
  //my_mp is broken in Dark Gyffte
  if (!in_darkGyffte()) {
    const wasted_mp: number = toInt(myMp() + mp_regen() - myMaxmp());
    if (wasted_mp > 0 && myMp() > 400) {
      auto_log_info(`Burning ${wasted_mp} MP...`);
      auto_burnMP(wasted_mp);
    }
  }
  borisWastedMP();
  borisTrusty();

  let mpNeeded: number = 32; // enough for 5 casts of Saucestorm. Usually this should be fine for most combats
  switch (myClass()) {
    case $class`Disco Bandit`:
      // expand this for other cases where we need more MP for combat.
      // ideally we could ask the combat function to tell us how much MP it will need for an example encounter in the zone we are going to.
      if (
        $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary)`.includes(
          place,
        )
      ) {
        // DB aborts in the Shadow Rifts because it runs out of MP trying to use Saucestorm against physically immune monsters when it has Extingo equipped.
        for (const sk of $skills`Disco Dance of Doom, Disco Dance II: Electric Boogaloo, Disco Dance 3: Back in the Habit`) {
          // yes it casts all 3 of those first then tries to repeat Saucestorm. On 32 or so MP.
          if (auto_have_skill(sk)) {
            mpNeeded += mpCost(sk);
          }
        }
      }
      break;
    default:
      break;
  }
  acquireMP(mpNeeded, 0);
  //acquireMP won't do anything if the maxMP isn't big enough,
  //so we'll use this to ensure we have MP in low max scenarios
  if (myMaxmp() < mpNeeded) {
    low_mp_handler();
  }

  if (inHardcore() && myClass() === $class`Sauceror` && myMp() < 32) {
    auto_log_warning(
      "We don't have a lot of MP but we are chugging along anyway",
      "red",
    );
  }
  lar_abort(place);
  if (myInebriety() > inebrietyLimit()) {
    if ($locations`The Tunnel of L.O.V.E.`.includes(place)) {
      auto_log_info(
        `Trying to adv in [${place}] while overdrunk... is actually permitted`,
        "blue",
      );
    } else {
      auto_abort(`Trying to adv in [${place}] while overdrunk... Stop it.`);
    }
  }

  if (in_pokefam()) {
    // Build the team at the beginning of each adventure.
    pokefam_makeTeam();
  }

  utilizeStillsuit();

  set("auto_priorLocation", place);
  auto_log_info(`Pre Adventure at ${place} done, beep.`, "blue");
  abortIfRepeating();
  //to avoid constant flipping on the MCD. change it right before adventuring
  const mcd_target: number = get("auto_mcd_target", 0);
  if (currentMcd() !== mcd_target) {
    changeMcd(mcd_target);
  }

  print_footer();
  return true;
}

export function auto_runPreAdventure(): boolean {
  if (!auto_canRunBetweenBattleChecks()) return false;
  const ret: boolean = auto_pre_adventure();

  if (
    pathHasFamiliar() &&
    canChangeFamiliar() &&
    myFamiliar() === $familiar.none &&
    !isFantasyRealm(myLocation())
  ) {
    auto_abort("Trying to adventure with no familiar.");
  }

  if (!ret) {
    auto_log_error("Error running auto_pre_adv, setting auto_interrupt=true");
    set("auto_interrupt", true);
  }
  auto_interruptCheck("pre/post script");

  return ret;
}

export function main(): void {
  auto_runPreAdventure();
}
