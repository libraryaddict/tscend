import {
  abort,
  availableAmount,
  buyPrice,
  canadiaAvailable,
  canDrink,
  canEat,
  canEquip,
  canInteract,
  ceil,
  chew,
  cliExecute,
  containsText,
  creatableAmount,
  creatableTurns,
  create,
  dailySpecial,
  drink,
  drinksilent,
  eat,
  eatsilent,
  equip,
  equippedItem,
  Familiar,
  fullnessLimit,
  getProperty,
  gnomadsAvailable,
  guildStoreAvailable,
  haveEffect,
  haveSkill,
  historicalPrice,
  holiday,
  indexOf,
  inebrietyLimit,
  inHardcore,
  Item,
  itemAmount,
  mallPrice,
  max,
  min,
  mpCost,
  myAdventures,
  myBasestat,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myHash,
  myInebriety,
  myLevel,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  mySign,
  mySpleenUse,
  npcPrice,
  pullsRemaining,
  replaceString,
  retrieveItem,
  runChoice,
  sellCost,
  setProperty,
  spleenLimit,
  splitString,
  stillsAvailable,
  substring,
  toBoolean,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $path,
  $skill,
  $slot,
  $stat,
  get,
} from "libram";

import { auto_advToReserve } from "../autoscend";
import { auto_buyUpTo, canPull$1, pullXWhenHaveY } from "./auto_acquire";
import { buffMaintain$3 } from "./auto_buff";
import {
  equipStatgainIncreasers,
  equipStatgainIncreasersFor,
  possessEquipment,
} from "./auto_equipment";
import {
  auto_have_familiar,
  auto_wantFamXP,
  canChangeFamiliar,
  findNonRockFamiliarInTerrarium,
  haveSpleenFamiliar,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
  switchToFamXP,
} from "./auto_familiar";
import {
  auto_freeCombatsRemaining,
  isAboutToPowerlevel,
} from "./auto_powerlevel";
import { acquireMP } from "./auto_restore";
import {
  almostRollover,
  auto_freeCrafts,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  auto_reserveAmount,
  auto_reserveCraftAmount,
  auto_turbo,
  banishSources,
  handleTracker,
  handleTracker$1,
  internalQuestStatus,
  knapsack,
  meatReserve,
  needToConsumeForEmergencyRollover,
  ovenHandle,
  pm_updateThrall,
  shrugAT,
} from "./auto_util";
import { ConsumeAction } from "./autoscend_record";
import {
  canDrinkSpeakeasyDrink,
  drinkSpeakeasyDrink,
  isSpeakeasyDrink,
} from "./iotms/clan";
import { isClipartItem } from "./iotms/mr2011";
import { fantasyRealmAvailable } from "./iotms/mr2018";
import {
  auto_haveKramcoSausageOMatic,
  auto_sausageWanted,
} from "./iotms/mr2019";
import { auto_CMCconsultsLeft, have_fireworks_shop } from "./iotms/mr2021";
import { auto_expectedStillsuitAdvs, auto_hasStillSuit } from "./iotms/mr2022";
import {
  auto_haveSeptEmberCenser,
  consumeBlackAndWhiteApronKit,
} from "./iotms/mr2024";
import {
  auto_cupOfThirteenBestConsumeAction,
  auto_havePastaWand,
  auto_willEatLegendaryNoodles,
  legendaryNoodleDishes,
  numBaseLegendaryNoodleDishes,
  numPreparedLegendaryNoodleDishes,
} from "./iotms/mr2026";
import { ed_eatStuff, isActuallyEd } from "./paths/actually_ed_the_undying";
import { amw_buyAdv, in_amw } from "./paths/adventurer_meats_world";
import { borisDemandSandwich, is_boris } from "./paths/avatar_of_boris";
import { is_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { inAftercore } from "./paths/casual";
import { bat_consumption, in_darkGyffte } from "./paths/dark_gyffte";
import { in_kolhs, kolhs_consume } from "./paths/kolhs";
import { bondDrinks, in_lta } from "./paths/license_to_adventure";
import { in_nuclear } from "./paths/nuclear_autumn";
import { in_plumber } from "./paths/path_of_the_plumber";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_quantumTerrarium } from "./paths/quantum_terrarium";
import { in_small } from "./paths/small";
import {
  in_tcrs,
  tcrs_expectedAdvPerFill,
} from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";
import { in_wereprof, is_professor, is_werewolf } from "./paths/wereprofessor";
import { in_robot, robot_get_adv } from "./paths/you_robot";
import { in_zombieSlayer } from "./paths/zombie_slayer";
import { hasSpookyravenLibraryKey } from "./quests/level_11";
import { towerKeyCount } from "./quests/level_13";
import { estimateDailyDungeonAdvNeeded } from "./quests/level_any";
import { LX_doingPirates } from "./quests/optional";
import { ctor, fileAsMap } from "./utils/kolmafiaUtils";

//
//	Handler for in-run consumption
//

//Defined in autoscend/auto_consume.ash
export function spleen_left(): number {
  return spleenLimit() - mySpleenUse();
}

export function stomach_left(): number {
  return fullnessLimit() - myFullness();
}

export function fullness_left(): number {
  return stomach_left();
}

export function inebriety_left(): number {
  return inebrietyLimit() - myInebriety();
}

const $_saucemavenApplies_saucy_foods: Item[] = $items`cold hi mein, devil hair pasta, Fettris, fettucini Inconnu, fleetwood mac 'n' cheese, fusillocybin, gnocchetti di Nietzsche, haunted Hell ramen, Hell ramen, hot hi mein, libertagliatelle, linguini immondizia bianco, linguini of the sea, prescription noodles, shells a la shellfish, sleazy hi mein, spagecialetti, spaghetti con calaveras, spaghetti with Skullheads, spooky hi mein, stinky hi mein, turkish mostaccioli`;

function saucemavenApplies(it: Item): boolean {
  return $_saucemavenApplies_saucy_foods.includes(it);
}

function parseRawAdventures(it: Item): number {
  // Split array, filter to non-empty then map to number
  const advs: number[] = it.adventures.split("-").filter(Boolean).map(Number);

  // If empty array
  if (!advs.length) return 0;

  // Reduce it, if only 1 item, will not be halved
  const avgAdvs: number = advs.reduce((l, r) => (l + r) / 2);

  // Safeguard for invalid number
  return isNaN(avgAdvs) ? 0 : avgAdvs;
}

export function expectedAdventuresFrom(it: Item): number {
  let expected: number = parseRawAdventures(it);
  if (auto_have_skill($skill`Saucemaven`) && saucemavenApplies(it)) {
    if ($classes`Sauceror, Pastamancer`.includes(myClass())) {
      expected += 5;
    } else {
      expected += 3;
    }
  }
  //if (item_amount($item[black label]) > 0 && $items[bottle of gin, bottle of rum, bottle of tequila, bottle of vodka or bottle of whiskey] contains it)
  //	expected += 3.5;
  return expected;
}

function canOde(toDrink: Item, action?: ConsumeAction): boolean {
  // If we've explicitly defined if this item gets ode, even if it's not a drink!
  if (action && action.data && action.data.castOde !== undefined) {
    return action.data.castOde;
  }
  if (in_tcrs()) {
    return true;
  }
  if (
    $items`steel margarita, 5-hour acrimony, beery blood, slap and slap again, used beer, shot of flower schnapps`.includes(
      toDrink,
    )
  ) {
    return false;
  }
  return true;
}

export function autoCleanse(): boolean {
  if (!auto_turbo()) {
    return false;
  }

  let wantToCleanseStomach: boolean = false;
  let wantToCleanseLiver: boolean = false;

  if (myFullness() > 3 && fullness_left() < 4) {
    wantToCleanseStomach = true;
  }
  if (myInebriety() > 3 && inebriety_left() < 4) {
    wantToCleanseLiver = true;
  }

  const wantToCleanse: boolean = wantToCleanseLiver && wantToCleanseStomach; //want to cleanse both

  if (
    wantToCleanse &&
    itemAmount($item`spice melange`) > 0 &&
    !toBoolean(getProperty("spiceMelangeUsed"))
  ) {
    handleTracker(`Cleansed with ${$item`spice melange`}`, "auto_otherstuff");
    return use(1, $item`spice melange`);
  }

  if (
    wantToCleanse &&
    itemAmount($item`Ultra Mega Sour Ball`) > 0 &&
    !toBoolean(getProperty("_ultraMegaSourBallUsed"))
  ) {
    handleTracker(
      `Cleansed with ${$item`Ultra Mega Sour Ball`}`,
      "auto_otherstuff",
    );
    return use(1, $item`Ultra Mega Sour Ball`);
  }

  if (
    wantToCleanseLiver &&
    itemAmount($item`alien plant pod`) > 0 &&
    !toBoolean(getProperty("_alienPlantPodUsed"))
  ) {
    handleTracker(`Cleansed with ${$item`alien plant pod`}`, "auto_otherstuff");
    return use(1, $item`alien plant pod`);
  }

  if (
    wantToCleanseStomach &&
    itemAmount($item`alien animal milk`) > 0 &&
    !toBoolean(getProperty("_alienAnimalMilkUsed"))
  ) {
    handleTracker(
      `Cleansed with ${$item`alien animal milk`}`,
      "auto_otherstuff",
    );
    return use(1, $item`alien animal milk`);
  }

  return false;
}

export function autoDrink(
  howMany: number,
  toDrink: Item,
  silent: boolean = false,
  action?: ConsumeAction,
): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }

  if (toDrink === Item.none || howMany <= 0) {
    return false;
  }
  const isSpeakeasy: boolean = isSpeakeasyDrink(toDrink);
  if (isSpeakeasy && !canDrinkSpeakeasyDrink(toDrink)) {
    return false;
  }
  if (action?.data?.consume === undefined) {
    if (itemAmount(toDrink) < howMany && !isSpeakeasy) {
      return false;
    }
    if (!auto_canDrink(toDrink)) {
      return false;
    }
  }

  // These only take effect when ode is active
  if (canOde(toDrink, action)) {
    if (itemAmount($item`hard rock`) > 0) {
      //only want to hard rock if the booze is also Ode-able
      use(1, $item`hard rock`);
    }

    if (
      minAdvPerDrunk(toDrink) >= 5.0 &&
      $familiar`Cooler Yeti`.experience >= 400 &&
      ((auto_haveSeptEmberCenser() && myLevel() >= 15) ||
        $familiar`Cooler Yeti`.experience > 800 ||
        !auto_haveSeptEmberCenser())
    ) {
      //only want to yeti chat if the booze is also Ode-able and we don't need to level via sept-ember censer or using it won't affect our fam weight
      useFamiliar($familiar`Cooler Yeti`);
      if (containsText(visitUrl("main.php?talktoyeti=1"), "choiceform2")) {
        handleTracker$1(
          $familiar`Cooler Yeti`.toString(),
          `Double adv of ${toDrink.toString()}`,
          "auto_otherstuff",
        );
        visitUrl("choice.php?pwd=&whichchoice=1560&option=2");
      }
    }

    const expectedInebriety: number = toDrink.inebriety * howMany;

    if (possessEquipment($item`Wrist-Boy`) && myMeat() > 6500) {
      if (
        haveEffect($effect`Drunk and Avuncular`) < expectedInebriety &&
        itemAmount($item`Drunk Uncles holo-record`) === 0
      ) {
        auto_buyUpTo(1, $item`Drunk Uncles holo-record`);
      }
      buffMaintain$3($effect`Drunk and Avuncular`, 0, 1, expectedInebriety);
    }

    if (auto_have_skill($skill`The Ode to Booze`)) {
      shrugAT($effect`Ode to Booze`);
      // get enough turns of ode
      while (
        acquireMP(mpCost($skill`The Ode to Booze`), 0) &&
        buffMaintain$3(
          $effect`Ode to Booze`,
          mpCost($skill`The Ode to Booze`),
          1,
          expectedInebriety,
        )
      ) {
        /*do nothing, the loop condition is doing the work*/
      }
    }
  }

  equipStatgainIncreasersFor(toDrink);

  const it: Item = equippedItem($slot`acc3`);

  if (
    it !== $item`mafia pinky ring` &&
    itemAmount($item`mafia pinky ring`) > 0 &&
    $items`bucket of wine, Psychotic Train wine, Sacramento wine, stale cheer wine`.includes(
      toDrink,
    ) &&
    canEquip($item`mafia pinky ring`)
  ) {
    equip($slot`acc3`, $item`mafia pinky ring`);
  }

  let retval: boolean = false;
  while (howMany > 0) {
    // If this item has a special consume action, call that instead
    if (action?.data?.consume) {
      retval = action.data.consume();
    } else if (!isSpeakeasy) {
      if (silent) {
        retval = drinksilent(1, toDrink);
      } else {
        retval = drink(1, toDrink);
      }
    } else {
      retval = drinkSpeakeasyDrink(toDrink);
    }

    // If success and item is not doing it's own tracking
    if (retval && action?.data?.hasOwnTracking !== true) {
      handleTracker(toDrink.toString(), "auto_drunken");
    }
    howMany = howMany - 1;
  }

  if (equippedItem($slot`acc3`) !== it) {
    equip($slot`acc3`, it);
  }

  return retval;
}

function minAdvPerDrunk(toDrink: Item): number {
  let minAdv: number;
  if (indexOf(toDrink.adventures, "-") < 0) {
    minAdv = toInt(toDrink.adventures);
  } else {
    minAdv = toInt(
      substring(toDrink.adventures, 0, indexOf(toDrink.adventures, "-")),
    );
  }
  const size: number = toDrink.inebriety;
  return minAdv / size;
}

function cafeFoodName(id: number): string {
  if (id === toInt(dailySpecial())) {
    return dailySpecial().toString();
  }
  switch (id) {
    case -1:
      return "Peche a la Frog";
    case -2:
      return "As Jus Gezund Heit";
    case -3:
      return "Bouillabaise Coucher Avec Moi";
    default:
      abort(`autoDrinkCafe does not recognize item id: ${id}`);
  }
  return "";
}

function cafeDrinkName(id: number): string {
  if (id === toInt(dailySpecial())) {
    return dailySpecial().toString();
  }
  switch (id) {
    case -1:
      return "Petite Porter";
    case -2:
      return "Scrawny Stout";
    case -3:
      return "Infinitesimal IPA";
    default:
      abort(`autoDrinkCafe does not recognize item id: ${id}`);
  }
  return "";
}

function autoDrinkCafe(howmany: number, id: number): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }
  // Note that caller is responsible for calling Ode to Booze,
  // since we might be in TCRS and not know how many adventures
  // we'll get from the drink.
  if (!gnomadsAvailable()) {
    return false;
  }

  equipStatgainIncreasersFor(toItem(id));

  const name: string = cafeDrinkName(id);
  for (let i: number = 0; i < howmany; i++) {
    // TODO: What if we run out of meat?
    visitUrl("cafe.php?cafeid=2");
    visitUrl(
      `cafe.php?pwd=${myHash()}&phash=${myHash()}&cafeid=2&whichitem=${id}&action=CONSUME!`,
    );
    handleTracker(name, "auto_drunken");
  }
  return true;
}

function autoEatCafe(howmany: number, id: number): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }

  if (!canadiaAvailable()) {
    return false;
  }

  equipStatgainIncreasersFor(toItem(id));

  const name: string = cafeFoodName(id);
  for (let i: number = 0; i < howmany; i++) {
    // TODO: What if we run out of meat?
    visitUrl("cafe.php?cafeid=1");
    visitUrl(
      `cafe.php?pwd=${myHash()}&phash=${myHash()}&cafeid=1&whichitem=${id}&action=CONSUME!`,
    );
    handleTracker(name, "auto_eaten");
  }
  return true;
}

export function autoChew(howMany: number, toChew: Item): boolean {
  if (!canChew(toChew)) {
    return false;
  }
  if (spleen_left() < toChew.spleen * howMany) {
    return false;
  }
  if (itemAmount(toChew) < howMany) {
    return false;
  }

  equipStatgainIncreasersFor(toChew);

  const retval: boolean = chew(howMany, toChew);

  if (retval) {
    for (let i: number = 0; i < howMany; ++i) {
      handleTracker(toChew.toString(), "auto_chewed");
    }
  }

  return retval;
}

export function autoEat(
  howMany: number,
  toEat: Item,
  silent: boolean = true,
  action?: ConsumeAction,
): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }

  if (toEat === Item.none || howMany <= 0) {
    return false;
  }
  if (toEat === $item`Black and White Apron Meal Kit`) {
    if (consumeBlackAndWhiteApronKit()) {
      handleTracker("Black and White Apron Kit", "auto_eaten");
      return true;
    } else {
      abort(
        "Attempted to eat food from Black and White Apron Kit, but failed.",
      );
    }
  }
  if (
    legendaryNoodleDishes().has(toEat) &&
    !toBoolean(
      // This stuff relates to the Legendary Digestion choice adv from eating legendary noods
      getProperty("auto_forceCombatWithLegendaryNoodles"),
    ) &&
    (toBoolean(
      // check that we aren't forcing combat via amygdala option
      getProperty("_legendaryNoodlesSpleen"),
    ) ||
      spleen_left() < 1)
  ) {
    // check that we aren't gonna take the spleen option
    switchToFamXP(400); // we're getting famxp by process of elimination; trying to switch to a fam we want famxp on
  }
  if (action?.data?.consume === undefined) {
    if (itemAmount(toEat) < howMany) {
      return false;
    }
    if (!auto_canEat(toEat)) {
      return false;
    }
  }

  equipStatgainIncreasersFor(toEat);

  const expectedFullness: number = toEat.fullness * howMany;
  acquireMilkOfMagnesiumIfUnused(true);
  consumeMilkOfMagnesiumIfUnused();
  wantDietPill(toEat);
  if (myClass() === $class`Pastamancer`) {
    // might switch to spice ghost for advs
    pm_updateThrall($location`Noob Cave`, true);
  }

  if (possessEquipment($item`Wrist-Boy`) && myMeat() > 6500) {
    if (
      haveEffect($effect`Record Hunger`) < expectedFullness &&
      itemAmount($item`The Pigs holo-record`) === 0
    ) {
      auto_buyUpTo(1, $item`The Pigs holo-record`);
    }
    buffMaintain$3($effect`Record Hunger`, 0, 1, expectedFullness);
  }

  let retval: boolean = false;
  let wasReadyToEat: boolean = false;
  while (howMany > 0) {
    buffMaintain$3($effect`Song of the Glorious Lunch`, 10, 1, toEat.fullness);
    if (
      auto_get_campground().has($item`portable Mayo Clinic`) &&
      myMeat() - meatReserve() > npcPrice($item`Mayoflex`) &&
      getProperty("mayoInMouth") === "" &&
      auto_is_valid($item`portable Mayo Clinic`)
    ) {
      auto_buyUpTo(1, $item`Mayoflex`);
      use(1, $item`Mayoflex`);
    }
    if (itemAmount($item`whet stone`) > 0) {
      //use whet stone if we got one from the rock garden
      use(1, $item`whet stone`);
      handleTracker(`Used ${$item`whet stone`}`, "auto_otherstuff");
    }
    if (
      itemAmount($item`mini kiwi aioli`) > 0 ||
      (itemAmount($item`mini kiwi`) >= 5 &&
        itemAmount($item`mini kiwi aioli`) === 0)
    ) {
      //use mini kiwi aioli if we got one from the mini kiwi
      // Kiwi aioli is per-fullness, only eat it on foods size 4+
      if (toEat.fullness > 3) {
        if (itemAmount($item`mini kiwi aioli`) === 0) {
          create(1, $item`mini kiwi aioli`); //create the aioli to actually use it
        }
        use(1, $item`mini kiwi aioli`);
        handleTracker(
          `Used ${$item`mini kiwi aioli`} for ${toEat}`,
          "auto_otherstuff",
        );
      }
    }
    if (haveEffect($effect`Ready to Eat`) > 0) {
      wasReadyToEat = true;
    }
    if (action?.data?.consume) {
      retval = action.data.consume();
    } else if (silent) {
      retval = eatsilent(1, toEat);
    } else {
      retval = eat(1, toEat);
    }
    if (retval && action?.data?.hasOwnTracking !== true) {
      let detail: string = "";
      if (wasReadyToEat && haveEffect($effect`Ready to Eat`) <= 0) {
        detail = detail !== "" ? `${detail}, Red Rocketed!` : "Red Rocketed!";
        wasReadyToEat = false;
      }
      if (toInt(getProperty("auto_dietpills")) > 0) {
        detail =
          detail !== "" ? `${detail}, Dieting Pilled!` : "Dieting Pilled!";
        setProperty(
          "auto_dietpills",
          (toInt(getProperty("auto_dietpills")) - 1).toString(),
        );
      }
      if (detail !== "") {
        handleTracker$1(toEat.toString(), detail, "auto_eaten");
      } else {
        handleTracker(toEat.toString(), "auto_eaten");
      }
    }
    howMany = howMany - 1;
  }
  return retval;
}

export function acquireMilkOfMagnesiumIfUnused(useAdv: boolean): boolean {
  if (in_tcrs()) {
    return true;
  }

  if (itemAmount($item`milk of magnesium`) > 0) {
    return true;
  }
  if (
    toBoolean(getProperty("_milkOfMagnesiumUsed")) ||
    toBoolean(getProperty("milkOfMagnesiumActive"))
  ) {
    return true;
  }
  if (fullnessLimit() === 0) {
    return false;
  }

  ovenHandle();
  if (
    itemAmount($item`glass of goat's milk`) > 0 &&
    haveSkill($skill`Advanced Saucecrafting`)
  ) {
    if (
      itemAmount($item`scrumptious reagent`) === 0 &&
      myMp() >= mpCost($skill`Advanced Saucecrafting`)
    ) {
      if (toInt(getProperty("reagentSummons")) === 0) {
        useSkill(1, $skill`Advanced Saucecrafting`);
      }
    }

    if (itemAmount($item`scrumptious reagent`) > 0) {
      if (useAdv) {
        cliExecute(`make ${$item`milk of magnesium`}`);
      } else if (auto_freeCrafts() > 0) {
        cliExecute(`make ${$item`milk of magnesium`}`);
      }
    }
  }
  pullXWhenHaveY($item`milk of magnesium`, 1, 0);
  return true;
}

export function consumeMilkOfMagnesiumIfUnused(): boolean {
  if (
    toBoolean(getProperty("_milkOfMagnesiumUsed")) ||
    toBoolean(getProperty("milkOfMagnesiumActive")) ||
    itemAmount($item`milk of magnesium`) < 1
  ) {
    return false;
  }
  return use(1, $item`milk of magnesium`);
}

function minAdvPerFull(toEat: Item): number {
  let minAdv: number;
  if (indexOf(toEat.adventures, "-") < 0) {
    minAdv = toInt(toEat.adventures);
  } else {
    minAdv = toInt(
      substring(toEat.adventures, 0, indexOf(toEat.adventures, "-")),
    );
  }
  const size: number = toEat.fullness;
  if (size === 0) {
    //Fullness data isn't in Mafia yet for the item in question
    return 0;
  }
  return minAdv / size;
}

function minAdvPerFullForDietPill(): number {
  if (is_jarlsberg()) {
    return minAdvPerFull($item`Ultimate Breakfast Sandwich`) - 0.01;
  }
  if (in_zombieSlayer()) {
    return minAdvPerFull($item`boss brain`) - 0.01;
  }
  return 8.5;
}

function wantDietPill(toEat: Item): boolean {
  const pill: Item = $item`dieting pill`;
  if (!auto_is_valid(pill) || !auto_is_valid(toEat)) {
    return false;
  }
  //Use a dieting pill on only high adv/full foods
  if (minAdvPerFull(toEat) > minAdvPerFullForDietPill()) {
    //Only want a dieting pill if we can use it successfully
    if (fullness_left() >= 2 * toEat.fullness && spleen_left() >= 3) {
      pullXWhenHaveY(pill, 1, 0);
      if (itemAmount(pill) > 0) {
        handleTracker(pill.toString(), "auto_chewed");
        setProperty(
          "auto_dietpills",
          (toInt(getProperty("auto_dietpills")) + 1).toString(),
        ); //Track how many dieting pills we have consumed this ascension
        return chew(1, pill);
      }
    }
    return false;
  }
  return false;
}

export function auto_canDrink(
  toDrink: Item,
  checkValidity: boolean = true,
): boolean {
  if (!canDrink()) {
    return false;
  }
  if (!auto_is_valid(toDrink) && checkValidity) {
    return false;
  }
  if (is_jarlsberg() && toDrink !== $item`steel margarita`) {
    return sellCost($coinmaster`Jarlsberg's Cosmic Kitchen`, toDrink).size > 0;
  }
  if (in_nuclear() && toDrink.inebriety > 1) {
    return false;
  }
  if (
    in_darkGyffte() !==
    $items`vampagne, dusty bottle of blood, Red Russian, mulled blood, bottle of Sanguiovese`.includes(
      toDrink,
    )
  ) {
    return false;
  }
  if (in_kolhs()) {
    if (
      !$items`can of the cheapest beer, bottle of fruity "wine", single swig of vodka, fountain 'soda', stepmom's booze, steel margarita`.includes(
        toDrink,
      )
    ) {
      return false;
    }
  }
  if (in_lta()) {
    const martinis: Map<number, Item> = bondDrinks();
    let found: boolean = false;
    for (const [, it] of martinis) {
      if (it === toDrink) {
        found = true;
      }
    }
    if (!found) {
      return false;
    }
  }
  if (in_small() && toDrink.inebriety > 1) {
    // liver size of 1 in small path
    return false;
  }
  if (is_werewolf()) {
    //Can't access Fancy Dan as Werewolf
    if (
      $items`Champagne Shimmy, Charleston Choo-Choo, Marltini, Mysterious Stranger, Strong\, Silent Type, Velvet Veil`.includes(
        toDrink,
      )
    ) {
      return false;
    }
  }
  // small path ignores consumable level requirements
  if (myLevel() < toDrink.levelreq && !in_small()) {
    return false;
  }

  if (toDrink.levelreq >= 13 && !canInteract()) {
    return false;
  }

  return meetsMinAdvPerFillReq(toDrink);
}

export function meetsMinAdvPerFillReq(it: Item): boolean {
  if (it.fullness + it.inebriety <= 0) return true;
  const advs = expectedAdventuresFrom(it) / (it.fullness + it.inebriety);

  // Allow foods that are consumed despite no adv gain, eg, steel organs
  return advs === 0 || advs >= get("auto_consumeMinAdvPerFill", 0.0);
}

export function auto_canEat(
  toEat: Item,
  checkValidity: boolean = true,
): boolean {
  if (!canEat()) {
    return false;
  }
  if (!auto_is_valid(toEat) && checkValidity) {
    return false;
  }
  if (is_jarlsberg()) {
    return sellCost($coinmaster`Jarlsberg's Cosmic Kitchen`, toEat).size > 0;
  }
  if (in_nuclear() && toEat.fullness > 1) {
    return false;
  }
  if (in_darkGyffte() && toEat === $item`magical sausage`) {
    // the one thing you can eat as Vampyre AND other classes
    return true;
  }
  if (
    in_darkGyffte() !==
    $items`blood-soaked sponge cake, blood roll-up, blood snowcone, actual blood sausage, bloodstick`.includes(
      toEat,
    )
  ) {
    return false;
  }
  if (in_zombieSlayer()) {
    return $items`crappy brain, decent brain, good brain, boss brain, hunter brain, brains casserole, fricasseed brains, steel lasagna`.includes(
      toEat,
    );
  }
  if (in_small() && toEat.fullness > 2) {
    // stomach size of 2 in small path
    return false;
  }
  // small path ignores consumable level requirements
  if (myLevel() < toEat.levelreq && !in_small()) {
    return false;
  }

  if (toEat.levelreq >= 13 && !canInteract()) {
    return false;
  }

  return meetsMinAdvPerFillReq(toEat);
}

export function canChew(toChew: Item): boolean {
  if (!auto_is_valid(toChew)) {
    return false;
  }
  if (in_nuclear() && toChew.spleen > 1) {
    return false;
  }
  if (myLevel() < toChew.levelreq && !in_small()) {
    return false;
  }

  return true;
}

export function consumptionProgress(): number {
  // returns indicative ratio of adventure organs used
  // if not allowed to consume then consider maximum progress is already reached
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return 1;
  }

  let organs_used: number = 0;
  let organs_max: number = 0;

  if (canEat()) {
    organs_used += myFullness();
    organs_max += fullnessLimit();
  }
  if (canDrink()) {
    organs_used += myInebriety();
    organs_max += inebrietyLimit();
  }
  // don't consider spleen as a significant adventure organ in most paths
  if (isActuallyEd() || myPath() === $path`Oxygenarian`) {
    organs_used += mySpleenUse();
    organs_max += spleenLimit();
  }
  // if(my_path()===$path[Avatar of Sneaky Pete]), autoscend doesn't try to use molotov soda or create Hate to produce them

  if (organs_max === 0) {
    return 1;
  } else {
    const used_organ_ratio: number = min(
      toFloat(organs_used) / toFloat(organs_max),
      1,
    );
    return used_organ_ratio;
  }
}

export const AUTO_ORGAN_STOMACH: number = 1;
export const AUTO_ORGAN_LIVER: number = 2;

export const AUTO_OBTAIN_NULL: number = 100;
export const AUTO_OBTAIN_CRAFT: number = 101;
export const AUTO_OBTAIN_PULL: number = 102;
export const AUTO_OBTAIN_BUY: number = 103;

function consumable_name(action: ConsumeAction): string {
  let name: string = "<name not found>";
  if (action.it !== Item.none) {
    name = action.it.toString();
  } else if (action.organ === AUTO_ORGAN_LIVER) {
    name = cafeDrinkName(action.cafeid);
  } else if (action.organ === AUTO_ORGAN_STOMACH) {
    name = cafeFoodName(action.cafeid);
  }
  return name;
}

function to_pretty_string(action: ConsumeAction): string {
  const organ_name: string =
    action.organ === AUTO_ORGAN_STOMACH ? "fullness" : "inebriety";
  let logline: string = `${consumable_name(action)} for ${action.adventures} base adv (${action.size} ${organ_name})`;
  if (action.howtoget === AUTO_OBTAIN_PULL) {
    logline += " [PULL]";
  }
  if (action.howtoget === AUTO_OBTAIN_CRAFT) {
    logline += " [CRAFT]";
  }
  if (action.howtoget === AUTO_OBTAIN_BUY) {
    logline += " [BUY]";
  }
  return logline;
}

function to_debug_string(action: ConsumeAction): string {
  let ret: string = "";
  ret += `ConsumeAction(it=${action.it}`;
  ret += `,cafeId=${action.cafeid}`;
  ret += `,size=${action.size}`;
  ret += `,adventures=${action.adventures}`;
  ret += `,desirability=${action.desirability}`;
  ret += `,organ=${action.organ}`;
  ret += `,howToGet=${action.howtoget}`;
  ret += ")";
  return ret;
}

// note that the ConsumeAction record is defined in autoscend_record.ash
function MakeConsumeAction(it: Item): ConsumeAction {
  const organ: number =
    it.inebriety > 0 ? AUTO_ORGAN_LIVER : AUTO_ORGAN_STOMACH;
  const size: number = max(it.inebriety, it.fullness);
  const adv: number = expectedAdventuresFrom(it);
  return new ConsumeAction(it, 0, size, adv, adv, organ, AUTO_OBTAIN_NULL);
}

function autoPrepConsume(action: ConsumeAction): boolean {
  auto_log_info$1(to_debug_string(action));
  if (action.howtoget === AUTO_OBTAIN_PULL) {
    auto_log_info(`autoPrepConsume: Pulling a ${action.it}`, "blue");
    action.howtoget = AUTO_OBTAIN_NULL;
    return pullXWhenHaveY(action.it, 1, itemAmount(action.it));
  } else if (action.howtoget === AUTO_OBTAIN_CRAFT) {
    auto_log_info(`autoPrepConsume: Crafting a ${action.it}`, "blue");
    action.howtoget = AUTO_OBTAIN_NULL;
    return create(1, action.it);
  } else if (action.howtoget === AUTO_OBTAIN_BUY) {
    auto_log_info(`autoPrepConsume: Buying a ${action.it}`, "blue");
    action.howtoget = AUTO_OBTAIN_NULL;
    return auto_buyUpTo(1, action.it);
  } else if (action.data?.prep) {
    action.howtoget = AUTO_OBTAIN_NULL;
    return action.data.prep();
  } else if (action.howtoget === AUTO_OBTAIN_NULL) {
    auto_log_info(
      `autoPrepConsume: Doing nothing to get a ${action.it}`,
      "blue",
    );
  }
  return true;
}

function autoConsume(action: ConsumeAction): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }

  if (action.howtoget !== AUTO_OBTAIN_NULL) {
    abort(`ConsumeAction not prepped: ${to_debug_string(action)}`);
  }
  // If not defined, then fall back to checking if this is a drink.
  // Otherwise, use the defined 'castOde' value
  if (action.data?.castOde ?? action.organ === AUTO_ORGAN_LIVER) {
    buffMaintain$3($effect`Ode to Booze`, 20, 1, action.size);
  }
  if (action.cafeid !== 0) {
    if (action.organ === AUTO_ORGAN_LIVER) {
      return autoDrinkCafe(1, action.cafeid);
    } else if (action.organ === AUTO_ORGAN_STOMACH) {
      return autoEatCafe(1, action.cafeid);
    }
  } else if (action.it !== Item.none) {
    if (action.organ === AUTO_ORGAN_LIVER) {
      return autoDrink(1, action.it, false, action);
    } else if (action.organ === AUTO_ORGAN_STOMACH) {
      return autoEat(1, action.it, true, action);
    } else {
      abort(`autoConsume: Unrecognized organ ${action.organ}`);
    }
  }
  abort("autoConsume: exited with nothing");
  return false;
}

function loadConsumables(
  _type: string,
  actions: Map<number, ConsumeAction>,
): boolean {
  // Step 0: Definitions
  // Just in case!
  if (in_darkGyffte()) {
    abort(
      "We shouldn't be calling loadConsumables() in Dark Gyffte. Please report this.",
    );
  }

  cliExecute("refresh inv");

  for (const it of $items`unremarkable duffel bag, van key, Knob Goblin lunchbox, gold Boozehounds Anonymous token, booze bindle`) {
    if (itemAmount(it) > 0 && pullsRemaining() !== -1) {
      use(itemAmount(it), it);
    }
  }
  // type is "eat" or "drink"
  let type_1: number = 0;
  if (_type === "eat") {
    type_1 = AUTO_ORGAN_STOMACH;
  } else if (_type === "drink") {
    type_1 = AUTO_ORGAN_LIVER;
  } else {
    return false;
  }

  if (type_1 === AUTO_ORGAN_LIVER) {
    // Cup of 13's adventures depend on which 3 ingredients we mix in, which the loop below has no way to know - inject its best current pick as a candidate directly.
    const cupOfThirteenAction: ConsumeAction | undefined =
      auto_cupOfThirteenBestConsumeAction();

    if (cupOfThirteenAction) {
      actions.set(actions.size, cupOfThirteenAction);
    }
  }

  function canConsume(it: Item, checkValidity: boolean): boolean {
    if (
      checkValidity &&
      isClipartItem(it) &&
      !auto_is_valid$2($skill`Summon Clip Art`) &&
      !canInteract()
    ) {
      //workaround for this mafia bug https://kolmafia.us/threads/g-lovers-clip-art-create-function-failure.26007/
      return false;
    }
    return type_1 === AUTO_ORGAN_STOMACH
      ? auto_canEat(it, checkValidity)
      : auto_canDrink(it, checkValidity);
  }

  function canConsume$1(it: Item): boolean {
    return canConsume(it, true);
  }

  function organLeft$2(): number {
    return type_1 === AUTO_ORGAN_STOMACH ? fullness_left() : inebriety_left();
  }

  function organCost(it: Item): number {
    return type_1 === AUTO_ORGAN_STOMACH ? it.fullness : it.inebriety;
  }

  const pullables: Map<Item, number> = new Map();
  const small_owned: Map<Item, number> = new Map();
  const buyables: Map<Item, number> = new Map();
  const large_owned: Map<Item, number> = new Map();
  const craftables: Map<Item, number> = new Map();

  const blacklist: Map<Item, boolean> = new Map();
  const craftable_blacklist: Map<Item, boolean> = new Map();

  // Step 1: Blacklist items we don't want to consume
  for (const it of $items`Cursed Punch, unidentified drink, bag of QWOP, FantasyRealm turkey leg, FantasyRealm mead, waffle`) {
    blacklist.set(it, true);
  }
  if (
    (toBoolean(getProperty("auto_dontConsumeLegendPizzas")) && !in_small()) ||
    (auto_turbo() && toInt(getProperty("cyrptCrannyEvilness")) > 0)
  ) {
    for (const it of $items`Pizza of Legend, Calzone of Legend, Deep Dish of Legend`) {
      blacklist.set(it, true);
    }
  }
  if (in_small()) {
    // these items don't get 10x advs and stats in small like most consumables
    for (const it of $items`blueberry muffin, bran muffin, chocolate chip muffin, spaghetti breakfast`) {
      blacklist.set(it, true);
    }
  }
  if (
    is_professor() ||
    (is_werewolf() && toInt(getProperty("wereProfessorTransformTurns")) < 50)
  ) {
    blacklist.set($item`plain calzone`, true); //because 50 turn buff and can only handle +ML as a werewolf, either blacklist altogether or get lucky and eat ASAP as a werewolf
  }
  if (
    itemAmount($item`wet stunt nut stew`) === 0 &&
    !possessEquipment($item`Mega Gem`) &&
    !isActuallyEd()
  ) {
    blacklist.set($item`wet stew`, true);
  }
  if (internalQuestStatus("questL07Cyrptic") < 1) {
    //don't consume gravy boat
    craftable_blacklist.set($item`warm gravy`, true);
  }
  if (
    LX_doingPirates() &&
    internalQuestStatus("questM12Pirate") <= 2 &&
    itemAmount($item`hot wing`) < 4
  ) {
    blacklist.set($item`hot wing`, true);
    if (itemAmount($item`Devil's Elbow Hot Sauce`) === 0) {
      //don't use hot wings if pirates quest still needs them
      craftable_blacklist.set($item`devil hair pasta`, true);
    }
  }

  if (internalQuestStatus("questL08Trapper") < 3 && auto_havePastaWand()) {
    const legendary_noodle_dishes: Map<Item, Item> = legendaryNoodleDishes();
    // consider blacklisting legendary noodles so we have some available for combat forcing if we still need to climb slope and have the wand
    if (numPreparedLegendaryNoodleDishes() === 1) {
      for (const dish of legendary_noodle_dishes.keys()) {
        blacklist.set(dish, true);
      }
    } else if (
      numPreparedLegendaryNoodleDishes() < 1 &&
      min(
        numBaseLegendaryNoodleDishes(),
        itemAmount($item`legendary noodles`),
      ) < 2
    ) {
      for (const dish of legendary_noodle_dishes.keys()) {
        blacklist.set(dish, true);
        blacklist.set(
          legendary_noodle_dishes.get(dish) ??
            legendary_noodle_dishes.set(dish, Item.none).get(dish),
          true,
        );
      }
    }
  }

  if (myClass() !== $class`Cow Puncher`) {
    //these consumables give $effect[Cowrruption] which limits base moxie and muscle to 30
    //low moxie can get beaten up, low muscle makes muscle class unable to hit
    if (
      myBasestat($stat`Moxie`) > 30 ||
      (myPrimestat() === $stat`Muscle` && myBasestat($stat`Muscle`) > 30)
    ) {
      for (const it of $items`tainted milk, rotting beefsteak, firemilk`) {
        blacklist.set(it, true);
      }
    }
  }
  // If we have 2 sticks of firewood, the current knapsack-solver
  // tries to get one of everything. So we blacklist everything other
  // than the 'campfire hot dog'
  for (const it of $items`campfire hot dog, campfire beans, campfire coffee, campfire stew, campfire s'more`) {
    craftable_blacklist.set(it, true);
  }
  // Blacklist all but the item we can make the most of.
  // This is mostly a workaround for limitations in the knapsack solver.
  // NB: This is obviously incorrect: what if you have 2 perfect ice
  // cubes, but can only make 1 of each type of perfect drink? This
  // optimizer will make 1 of exactly 1 drink type. Oh no. Suboptimal.
  // I declare that bug Not My Problem.
  function add_mutex_craftables(items: Map<Item, boolean>): void {
    let best_it: Item = Item.none;
    let best_amount: number = 0;
    for (const it of items.keys()) {
      if (creatableAmount(it) > best_amount) {
        best_it = it;
        best_amount = max(0, creatableAmount(it) - auto_reserveCraftAmount(it));
      }
    }
    for (const it of items.keys()) {
      if (it !== best_it) {
        craftable_blacklist.set(it, true);
      }
    }
  }

  add_mutex_craftables(
    new Map([
      [$item`perfect cosmopolitan`, true],
      [$item`perfect old-fashioned`, true],
      [$item`perfect mimosa`, true],
      [$item`perfect dark and stormy`, true],
      [$item`perfect paloma`, true],
      [$item`perfect negroni`, true],
    ]),
  );
  // Step 2: move items to categorized source maps, and add turnsave

  const potentialTurnGain: Map<Item, number> = new Map(); // for anything the charges up a banish, YR, sniff, etc.

  for (const it of $items.all()) {
    // If one of the organs is not 0, or the organ cost is 0 or less (original autoscend behavior)
    if ((it.fullness !== 0 && it.inebriety !== 0) || organCost(it) <= 0)
      continue;

    if (blacklist.has(it) || !auto_is_valid(it)) continue;

    if (!canConsume$1(it)) continue;

    const value_allowed: boolean =
      historicalPrice(it) < auto_getConsumablePriceLimit() ||
      ($items`blueberry muffin, bran muffin, chocolate chip muffin`.includes(
        it,
      ) &&
        itemAmount(it) > 0 &&
        myPath() !== $path`Grey You`); //Grey You should not even get to here if ever supported but it consumes the tin so blocked just in case
    //muffins are expensive but renewable

    if (!value_allowed) {
      continue;
    }
    if (
      (it === $item`astral pilsner` ||
        it === $item`Cold One` ||
        it === $item`astral hot dog`) &&
      myLevel() < 11
    ) {
      continue;
    }
    if (
      it === $item`spaghetti breakfast` &&
      (myLevel() < 11 ||
        myFullness() > 0 ||
        toBoolean(getProperty("_spaghettiBreakfastEaten")))
    ) {
      continue;
    }
    if (
      it === $item`Pizza of Legend` &&
      toBoolean(getProperty("pizzaOfLegendEaten"))
    ) {
      continue;
    }
    if (
      it === $item`Calzone of Legend` &&
      toBoolean(getProperty("calzoneOfLegendEaten"))
    ) {
      continue;
    }
    if (
      it === $item`Deep Dish of Legend` &&
      toBoolean(getProperty("deepDishOfLegendEaten"))
    ) {
      continue;
    }

    let howmany: number = it.inebriety > 0 ? 1 : 0; //can consider a drink action past inebriety limit. but not food past fullness limit
    howmany += organLeft$2() / organCost(it);
    if (howmany < 1) {
      continue;
    }
    // Only one Spaghetti Breakfast can be eaten
    if (it === $item`spaghetti breakfast`) {
      howmany = 1;
    }
    if (itemAmount(it) > 0 && organCost(it) <= 5) {
      small_owned.set(
        it,
        min(max(itemAmount(it) - auto_reserveAmount(it), 0), howmany),
      );
    }
    // don't add speakeasy drinks, because they can't actually be bought as items
    if (npcPrice(it) > 0 && !isSpeakeasyDrink(it)) {
      buyables.set(it, min(howmany, myMeat() / npcPrice(it)));
    } else if (buyPrice($coinmaster`Hermit`, it) > 0) {
      buyables.set(it, (buyables.get(it) ?? 0) + min(howmany, myMeat() / 500));
    }
    if (itemAmount(it) > 0 && organCost(it) > 5) {
      large_owned.set(
        it,
        min(max(itemAmount(it) - auto_reserveAmount(it), 0), howmany),
      );
    }
    if (!craftable_blacklist.has(it) && creatableAmount(it) > 0) {
      craftables.set(
        it,
        min(howmany, max(0, creatableAmount(it) - auto_reserveCraftAmount(it))),
      );
    }
    if (
      it === $item`pheromone cocktail` &&
      itemAmount(it) > 0 &&
      banishSources() - itemAmount(it) < 3
    ) {
      potentialTurnGain.set(it, 2.0);
    } else if (legendaryNoodleDishes().has(it)) {
      // which is quite good for minimizing daycount. We want that if it's available (except Ed, who has better spleen).
      if (
        !toBoolean(getProperty("_legendaryNoodlesSpleen")) &&
        spleen_left() > 0 &&
        auto_willEatLegendaryNoodles() &&
        !isActuallyEd()
      ) {
        potentialTurnGain.set(it, 20.0); // not actually 20, but we almost certainly want to consume it
        // doing the auto_willEatLegendaryNoodles() to exclude paths that might be too weird to assume this
      } else if (auto_wantFamXP(400)) {
        potentialTurnGain.set(it, 0.75); // arbitrary, but probably good enough
      }
    }
    // speakeasy drinks are not available as items and will cause a crash here if not excluded.
    if (!isSpeakeasyDrink(it) && canPull$1(it)) {
      if (!canInteract()) {
        pullables.set(it, 1);
      } else {
        //pullable amount here was coded before the change to daily limit of 1 pull each
        //now pulling more than 1 is only possible out of ronin. is storage ever not completely pulled already in this case?
        pullables.set(it, min(howmany, pullsRemaining()));
      }
    }
  }

  // Step 3: Handle Key Lime Pie Desireability (turnsave)

  let keyLimePieDesirabilityBonus: number = 0;
  let keyLimePieDesirabilityBonusType: string = "";
  let wantBorisPie: boolean = false;
  let wantJarlsbergPie: boolean = false;
  let wantPetePie: boolean = false;
  const missingHeroKeys: number = 3 - towerKeyCount();

  let dailyDungeonTurnEstimate: number = 0;
  let keyObtainableFromFR: number = 0;
  let fantasyRealmTurnEstimate: number = 0;

  if (
    missingHeroKeys > 0 &&
    !toBoolean(getProperty("auto_dontConsumeKeyLimePies"))
  ) {
    //will add desirability to consumption and pulling of key lime pies
    function considerNextPie(): void {
      //missing at least 1 key/token, in case it will be only one first consider mainstat pie if possible
      if (
        !wantBorisPie &&
        myPrimestat() === $stat`Muscle` &&
        itemAmount($item`Boris's key`) === 0 &&
        auto_is_valid($item`Boris's key lime pie`)
      ) {
        wantBorisPie = true;
      } else if (
        !wantJarlsbergPie &&
        myPrimestat() === $stat`Mysticality` &&
        itemAmount($item`Jarlsberg's key`) === 0 &&
        auto_is_valid($item`Jarlsberg's key lime pie`)
      ) {
        wantJarlsbergPie = true;
      } else if (
        !wantPetePie &&
        itemAmount($item`Sneaky Pete's key`) === 0 &&
        auto_is_valid($item`Sneaky Pete's key lime pie`)
      ) {
        wantPetePie = true;
      } else if (
        !wantJarlsbergPie &&
        itemAmount($item`Jarlsberg's key`) === 0 &&
        auto_is_valid($item`Jarlsberg's key lime pie`)
      ) {
        wantJarlsbergPie = true;
      } else if (
        !wantBorisPie &&
        itemAmount($item`Boris's key`) === 0 &&
        auto_is_valid($item`Boris's key lime pie`)
      ) {
        wantBorisPie = true;
      }
    }
    for (let i: number = 0; i < missingHeroKeys; i++) {
      considerNextPie();
    }
    //estimate cost of obtaining keys
    let keysObtainableFromDailyDungeon: number = toBoolean(
      getProperty("dailyDungeonDone"),
    )
      ? 0
      : 1;
    if (keysObtainableFromDailyDungeon > 0) {
      if (
        itemAmount($item`daily dungeon malware`) > 0 &&
        !toBoolean(getProperty("_dailyDungeonMalwareUsed")) &&
        toInt(getProperty("_lastDailyDungeonRoom")) < 14 &&
        !in_pokefam()
      ) {
        keysObtainableFromDailyDungeon += 1;
      }
      dailyDungeonTurnEstimate = toInt(estimateDailyDungeonAdvNeeded());
    }
    if (fantasyRealmAvailable()) {
      keyObtainableFromFR = 1;
      fantasyRealmTurnEstimate = 5;
      if (containsText(getProperty("_frMonstersKilled"), "fantasy bandit")) {
        for (const [, it] of splitString(
          getProperty("_frMonstersKilled"),
          ",",
        ).entries()) {
          if (containsText(it, "fantasy bandit")) {
            const count_1: number = toInt((splitString(it, ":")[1] ??= ""));
            if (count_1 >= 5) {
              keyObtainableFromFR = 0;
            } else {
              fantasyRealmTurnEstimate -= count_1;
            }
          }
        }
      }
    }
    const keysObtainableWithoutPie: number =
      keysObtainableFromDailyDungeon + keyObtainableFromFR;
    //bonus desirability to give to key lime pie
    if (myDaycount() > 1 && missingHeroKeys > keysObtainableWithoutPie) {
      keyLimePieDesirabilityBonusType = "full";
    } else if (missingHeroKeys === keysObtainableWithoutPie) {
      //all keys can be obtained today without pies so bonus value of pie is the turn cost it would otherwise take to get a key
      if (missingHeroKeys === 1) {
        //for only 1 key missing the bonus value of pie is the smallest turn cost to obtain a key
        keyLimePieDesirabilityBonusType = "min";
      } else {
        //missing 2 or 3 keys
        if (keysObtainableFromDailyDungeon === 2) {
          dailyDungeonTurnEstimate = toInt(dailyDungeonTurnEstimate / 2.0);
          keyLimePieDesirabilityBonus = dailyDungeonTurnEstimate;
          if (missingHeroKeys === 3) {
            //only source for 3 keys is both DailyDungeon and FR so bonus value of pie is whichever source costs more turns
            keyLimePieDesirabilityBonusType = "max";
          }
        } else {
          //only source for 2 keys is both DailyDungeon and FR so bonus value of pie is whichever source costs more turns
          keyLimePieDesirabilityBonusType = "max";
        }
      }
    } else if (myDaycount() === 1) {
      //first day and not all pies can be obtained
      if (missingHeroKeys - keysObtainableWithoutPie >= 2) {
        //can only obtain one key a day without pie. use full desirability bonus for the first pie
        keyLimePieDesirabilityBonusType = "full";
      } else {
        //remaining keys can be obtained by tomorrow without pie so bonus value of pie is whichever source costs more turns
        keyLimePieDesirabilityBonusType = "max";
      }
    }

    if (keyLimePieDesirabilityBonusType === "full") {
      keyLimePieDesirabilityBonus = 25; //keep existing arbitrary large bonus value
    } else {
      if (keysObtainableFromDailyDungeon > 0) {
        if (keyObtainableFromFR > 0) {
          if (keyLimePieDesirabilityBonusType === "min") {
            keyLimePieDesirabilityBonus = min(
              dailyDungeonTurnEstimate,
              fantasyRealmTurnEstimate,
            );
          }
          if (keyLimePieDesirabilityBonusType === "max") {
            keyLimePieDesirabilityBonus = max(
              dailyDungeonTurnEstimate,
              fantasyRealmTurnEstimate,
            );
          }
        } else {
          keyLimePieDesirabilityBonus = dailyDungeonTurnEstimate;
        }
      } else if (keyObtainableFromFR > 0) {
        keyLimePieDesirabilityBonus = fantasyRealmTurnEstimate;
      }
    }
  }

  // Step 4: Add the items to actions[n], incorporating incentives and penalties

  function add(it: Item, obtain_mode: number, howmany: number): void {
    for (let i: number = 0; i < howmany; i++) {
      const n: number = actions.size;
      actions.set(n, MakeConsumeAction(it));
      if (obtain_mode === AUTO_OBTAIN_PULL && !in_small()) {
        // don't penalize pulls in small as want best options to utilize limited organs
        (
          actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
        ).desirability -= 5.0;
        const user_desirability: number = toFloat(
          getProperty("auto_consumePullDesirability"),
        );
        if (user_desirability > 0.0) {
          (
            actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
          ).desirability = -user_desirability;
        }
      }
      if (
        type_1 === AUTO_ORGAN_STOMACH &&
        auto_is_valid($item`Special Seasoning`)
      ) {
        (
          actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
        ).desirability += min(
          1.0,
          (toFloat(itemAmount($item`Special Seasoning`)) * it.fullness) /
            fullness_left(),
        );
      }
      if (obtain_mode === AUTO_OBTAIN_NULL) {
        if (it === $item`spaghetti breakfast`) {
          if (
            toBoolean(getProperty("_spaghettiBreakfastEaten")) ||
            myFullness() > 0
          ) {
            (
              actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
            ).desirability -= 50;
          } else {
            auto_log_info$1(
              "Spaghetti Breakfast available, we should eat that first.",
            );
            (
              actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
            ).desirability += 50;
          }
        } else if (
          $items`blueberry muffin, bran muffin, chocolate chip muffin`.includes(
            it,
          )
        ) {
          if (
            myFullness() === 0 &&
            myLevel() < 13 &&
            toFloat(getProperty("auto_consumeMinAdvPerFill")) <=
              (actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n))
                .adventures /
                (actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n))
                  .size
          ) {
            if (
              !inHardcore() &&
              myLevel() >= 12 &&
              auto_have_skill($skill`Saucemaven`)
            ) {
              //eating it at 12 would probably mean having to pull something smaller than a hi mein and missing out on Saucemaven?
            } else {
              auto_log_info$1(
                `${it.toString()} available, we should eat that first.`,
              );
              (
                actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
              ).desirability += 50;
            }
          }
        }
      }
      if (obtain_mode === AUTO_OBTAIN_CRAFT) {
        const turns_to_craft: number =
          creatableTurns(it, i + 1, false) - creatableTurns(it, i, false);
        (
          actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
        ).desirability -= turns_to_craft;
      } else {
        if (
          i === 0 &&
          ((it === $item`Boris's key lime pie` && wantBorisPie) ||
            (it === $item`Jarlsberg's key lime pie` && wantJarlsbergPie) ||
            (it === $item`Sneaky Pete's key lime pie` && wantPetePie))
        ) {
          auto_log_info$1(
            `If we ate a ${it} we could skip getting a fat loot token...`,
          );
          (
            actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
          ).desirability += keyLimePieDesirabilityBonus;
        }
      }
      // below code not included next to the KLPs because sometime legendary noodles want crafting
      if (
        i === 0 &&
        (it === $item`pheromone cocktail` || legendaryNoodleDishes().has(it)) &&
        (potentialTurnGain.get(it) ?? potentialTurnGain.set(it, 0.0).get(it)) >
          0
      ) {
        (
          actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)
        ).desirability +=
          potentialTurnGain.get(it) ?? potentialTurnGain.set(it, 0.0).get(it);
      }
      (actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)).howtoget =
        obtain_mode;
    }
  }

  for (const [it, howmany] of pullables) {
    add(it, AUTO_OBTAIN_PULL, howmany);
  }
  for (const [it, howmany] of small_owned) {
    add(it, AUTO_OBTAIN_NULL, howmany);
  }
  for (const [it, howmany] of buyables) {
    add(it, AUTO_OBTAIN_BUY, howmany);
  }
  for (const [it, howmany] of large_owned) {
    add(it, AUTO_OBTAIN_NULL, howmany);
  }
  for (const [it, howmany] of craftables) {
    add(it, AUTO_OBTAIN_CRAFT, howmany);
  }
  // Step 5: Special adds
  // Add still suit if we are looking to drink
  if (
    type_1 === AUTO_ORGAN_LIVER &&
    auto_hasStillSuit() &&
    !in_kolhs() &&
    !in_small()
  ) {
    const size: number = 1;
    const adv: number = toFloat(auto_expectedStillsuitAdvs());
    actions.set(
      actions.size,
      new ConsumeAction(
        $item`tiny stillsuit`,
        0,
        size,
        adv,
        adv,
        AUTO_ORGAN_LIVER,
        AUTO_OBTAIN_NULL,
        {
          castOde: false,
          hasOwnTracking: true,
          consume: () => {
            // record adv gain for more detailed reporting to user
            const stillsuitAdvs: number = auto_expectedStillsuitAdvs();
            visitUrl("inventory.php?action=distill&pwd");
            visitUrl("choice.php?pwd&whichchoice=1476&option=1");
            handleTracker$1(
              $item`tiny stillsuit`.toString(),
              `${stillsuitAdvs}Advs`,
              "auto_drunken",
            );

            return true;
          },
        },
      ),
    );
  }
  // Add black and white apron if we are looking to eat
  const apronKit: Item = $item`Black and White Apron Meal Kit`;
  if (
    type_1 === AUTO_ORGAN_STOMACH &&
    (itemAmount(apronKit) > 0 || canPull$1(apronKit)) &&
    auto_is_valid(apronKit)
  ) {
    const size: number = 3;
    const adv: number = 12.0;
    const obtainMethod: number =
      itemAmount(apronKit) > 0 ? AUTO_OBTAIN_NULL : AUTO_OBTAIN_PULL;
    actions.set(
      actions.size,
      new ConsumeAction(
        apronKit,
        0,
        size,
        adv,
        adv,
        AUTO_ORGAN_STOMACH,
        obtainMethod,
      ),
    );
  }
  // Step 6: Now, to load cafe consumables. This has some TCRS-specific code.

  if (type_1 === AUTO_ORGAN_LIVER && !gnomadsAvailable()) {
    return false;
  }
  if (type_1 === AUTO_ORGAN_STOMACH && !canadiaAvailable()) {
    return false;
  }
  // Add daily special
  if (dailySpecial() !== Item.none && canConsume(dailySpecial(), false)) {
    // specials are always consumable even if they would be restricted as regular consumables.
    const daily_special_limit: number =
      1 +
      min(
        myMeat() / toInt(getProperty("_dailySpecialPrice")),
        organLeft$2() / organCost(dailySpecial()),
      );
    for (let i: number = 0; i < daily_special_limit; i++) {
      const n: number = actions.size;
      actions.set(n, MakeConsumeAction(dailySpecial()));
      (actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)).cafeid =
        toInt(dailySpecial());
      (actions.get(n) ?? actions.set(n, new ConsumeAction()).get(n)).it =
        Item.none;
    }
  }

  if (!in_tcrs()) {
    // write in hard-coded adventure values for IPA, the best one
    if (type_1 === AUTO_ORGAN_LIVER) {
      // Gnomish Microbrewery has a single best drink
      const limit: number = 1 + min(myMeat() / 100, inebriety_left() / 3);
      for (let i: number = 0; i < limit; i++) {
        const size: number = 3;
        const adv: number = 11.0 / 3.0;
        actions.set(
          actions.size,
          new ConsumeAction(
            Item.none,
            -3,
            size,
            adv,
            adv,
            AUTO_ORGAN_LIVER,
            AUTO_OBTAIN_NULL,
          ),
        );
      }
    }
    if (type_1 === AUTO_ORGAN_STOMACH) {
      // Chez Snootee does not have a single best food
      // Peche a la Frog
      let limit: number = 1 + min(myMeat() / 50, fullness_left() / 3);
      for (let i: number = 0; i < limit; i++) {
        const size: number = 3;
        const adv: number = 3.5;
        actions.set(
          actions.size,
          new ConsumeAction(
            Item.none,
            -1,
            size,
            adv,
            adv,
            AUTO_ORGAN_LIVER,
            AUTO_OBTAIN_NULL,
          ),
        );
      }
      // As Jus Gezund Heit
      limit = 1 + min(myMeat() / 75, fullness_left() / 4);
      for (let i: number = 0; i < limit; i++) {
        const size: number = 4;
        const adv: number = 5.0;
        actions.set(
          actions.size,
          new ConsumeAction(
            Item.none,
            -2,
            size,
            adv,
            adv,
            AUTO_ORGAN_LIVER,
            AUTO_OBTAIN_NULL,
          ),
        );
      }
      // As Jus Gezund Heit
      limit = 1 + min(myMeat() / 100, fullness_left() / 4);
      for (let i: number = 0; i < limit; i++) {
        const size: number = 5;
        const adv: number = 7.0;
        actions.set(
          actions.size,
          new ConsumeAction(
            Item.none,
            -3,
            size,
            adv,
            adv,
            AUTO_ORGAN_LIVER,
            AUTO_OBTAIN_NULL,
          ),
        );
      }
    }
    return true;
  }

  class _CAFE_CONSUMABLE_TYPE {
    public readonly space: number;

    constructor(
      public name: string = "",
      space: string | number = 0,
      public quality: string = "",
    ) {
      this.space = Number(space);
    }
  }

  let filename: string = "";
  if (type_1 === AUTO_ORGAN_LIVER) {
    filename = `TCRS_${replaceString(myClass().toString(), " ", "_")}_${mySign()}_cafe_booze.txt`;
  } else if (type_1 === AUTO_ORGAN_STOMACH) {
    filename = `TCRS_${replaceString(myClass().toString(), " ", "_")}_${mySign()}_cafe_food.txt`;
  }

  auto_log_info(`Loading ${filename}`, "blue");
  const cafe_stuff: Map<number, _CAFE_CONSUMABLE_TYPE> = fileAsMap(filename, [
    Number,
    ctor(_CAFE_CONSUMABLE_TYPE),
  ]);
  if (!cafe_stuff.size) {
    abort(
      `Something went wrong while trying to load ${filename}. Maybe run 'tcrs load'?`,
    );
  }
  for (const [i, r] of cafe_stuff) {
    // Always-available cafe items have item ids -1, -2, -3
    if (i >= -3 && r.space > 0) {
      const limit: number = 1 + min(myMeat() / 100, organLeft$2() / r.space);
      for (let j: number = 0; j < limit; j++) {
        const size: number = r.space;
        const adv: number = r.space * tcrs_expectedAdvPerFill(r.quality);
        actions.set(
          actions.size,
          new ConsumeAction(
            Item.none,
            -3,
            size,
            adv,
            adv,
            AUTO_ORGAN_LIVER,
            AUTO_OBTAIN_NULL,
          ),
        );
      }
    }
  }

  return true;
}

function auto_bestNightcap(): ConsumeAction {
  const actions: Map<number, ConsumeAction> = new Map();
  loadConsumables("drink", actions);

  const have_ode: boolean = auto_have_skill($skill`The Ode to Booze`);
  let greenBeersDrinkable: number = 0;
  let greenBeerAdv: number = 0;
  if (
    containsText(holiday(), "St. Sneaky Pete's Day") &&
    gnomadsAvailable() &&
    dailySpecial() === $item`green beer`
  ) {
    const disposableBeerMeat: number = max(0, myMeat() - meatReserve());
    greenBeersDrinkable = min(
      ceil(10.0 / $item`green beer`.inebriety),
      disposableBeerMeat / toInt(getProperty("_dailySpecialPrice")),
    );
    if (greenBeersDrinkable > 0) {
      auto_log_info(
        `May pick a smaller nightcap tonight since we could balance up to ${greenBeersDrinkable} green beers on top of it`,
        "blue",
      );
      greenBeerAdv = toInt(
        expectedAdventuresFrom($item`green beer`) +
          (have_ode ? $item`green beer`.inebriety : 0),
      );
    }
  }

  function desirability(i: number): number {
    let ret: number = (
      actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i)
    ).desirability;
    if (have_ode) {
      ret += (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i))
        .size;
    }
    if (greenBeersDrinkable > 0) {
      //on Sneaky Pete's Day smaller drink action leaves more space for green beers
      const greenBeerabilityBonus: number =
        greenBeerAdv *
        min(
          greenBeersDrinkable,
          max(
            0,
            10 -
              (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i))
                .size,
          ),
        );
      ret += greenBeerabilityBonus;
      if (
        (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i)).it ===
        $item`astral pilsner`
      ) {
        //astral pilsner's extra advs could make it barely beat larger pulls today due to beers but would still have as much value tomorrow
        ret -= min(5, greenBeerabilityBonus);
      }
    }
    return ret;
  }

  let best: number = 0;
  let current_best_desirability: number = 0;
  for (let i: number = 1; i < actions.size; i++) {
    if (desirability(i) < current_best_desirability) {
      // This consumable is less desirable than the best consumable found so far
      continue;
    }

    if (
      desirability(i) === current_best_desirability &&
      historicalPrice(
        (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i)).it,
      ) >=
        historicalPrice(
          (
            actions.get(best) ??
            actions.set(best, new ConsumeAction()).get(best)
          ).it,
        )
    ) {
      // This consumable is just as desirable as the best consumable, but it is more expensive
      continue;
    }
    // This consumable is either more desirable or equally desirable and cheaper
    best = i;
    current_best_desirability = desirability(best);
  }

  return actions.get(best) ?? actions.set(best, new ConsumeAction()).get(best);
}

export function auto_printNightcap(): void {
  if (in_darkGyffte()) {
    return; //disable it for now. TODO make a custom function for vampyre nightcap drinking specifically
  }
  auto_log_info(
    `Nightcap is: ${to_pretty_string(auto_bestNightcap())}`,
    "blue",
  );
}

function auto_overdrinkGreenBeers(): void {
  //called after nightcap, auto_drinkNightcap() needs to have already made the necessary checks
  if (
    !containsText(holiday(), "St. Sneaky Pete's Day") ||
    !auto_canDrink($item`green beer`, false)
  ) {
    return;
  }
  const start_fam: Familiar = myFamiliar();
  if (
    auto_have_familiar($familiar`Stooper`) &&
    start_fam !== $familiar`Stooper` &&
    pathAllowsChangingFamiliar()
  ) {
    //check if path allows changing familiar
    //drinking does not break 100fam runs so do not use canChangeToFamiliar
    useFamiliar($familiar`Stooper`);
  }

  const negativeLiver: number = inebriety_left();
  if (negativeLiver >= -10 && negativeLiver < 0) {
    auto_log_info(
      "It's St. Sneaky Pete's Day, can we sneak in any green beers?",
      "blue",
    );

    if (gnomadsAvailable()) {
      if (dailySpecial() === $item`green beer`) {
        const greenBeerAction: ConsumeAction =
          MakeConsumeAction(dailySpecial());
        greenBeerAction.cafeid = toInt(dailySpecial());
        greenBeerAction.it = Item.none;
        const beerMeat: number = myMeat() - (in_wotsf() ? meatReserve() : 0); //extra advs are almost always worth more, but meat is hard to get in wotsf
        const daily_special_limit: number = min(
          beerMeat / toInt(getProperty("_dailySpecialPrice")),
          (inebriety_left() + 11) / dailySpecial().inebriety,
        );
        for (let i: number = 0; i < daily_special_limit; i++) {
          autoConsume(greenBeerAction);
        }
      }
    }
    //TODO craft green beer?

    const greenbeer_limit: number = min(
      itemAmount($item`green beer`),
      (inebriety_left() + 11) / $item`green beer`.inebriety,
    );
    if (greenbeer_limit > 0) {
      autoDrink(greenbeer_limit, $item`green beer`);
    }

    if (inebriety_left() === negativeLiver) {
      auto_log_info("Could not overdrink any green beer", "blue");
    } else if (inebriety_left() >= -10) {
      auto_log_info(
        `Still have ${11 + inebriety_left()} green beer liver space that could not be filled`,
        "blue",
      );
    }
  }
  if (start_fam !== myFamiliar() && pathAllowsChangingFamiliar()) {
    useFamiliar(start_fam);
  }
}

export function auto_drinkNightcap(): void {
  //function to overdrink a nightcap at the end of day
  if (
    toBoolean(getProperty("auto_skipNightcap")) ||
    toBoolean(getProperty("auto_limitConsume"))
  ) {
    return;
  }
  if (in_darkGyffte()) {
    return; //disable it for now. TODO make a custom function for vampyre nightcap drinking specifically
  }
  if (!canDrink()) {
    return; //current path cannot drink booze at all
  }
  if (auto_freeCombatsRemaining() > 0) {
    auto_log_info(
      `Not drinking a nightcap because of ${auto_freeCombatsRemaining()} remaining free fights`,
      "blue",
    );
    return; //do not overdrink if we still have free fights we want to do. undesireable free fights are not counted by that function
  }
  function overdrunk(): boolean {
    if (auto_have_familiar($familiar`Stooper`)) {
      if ($familiar`Stooper` === myFamiliar() && inebriety_left() < 0) {
        //stooper is current familiar and overdrunk
        return true;
      } else if (inebriety_left() < -1) {
        //stooper not current familiar. but will be overdrunk even if switching to it
        return true;
      }
    } else if (inebriety_left() < 0) {
      //we can not use stooper and are overdrunk
      return true;
    }
    return false;
  }
  if (overdrunk()) {
    //you can't overdrink if already overdrunk. except for green beer on cinco de mayo
    auto_overdrinkGreenBeers();
    return;
  }

  const start_fam: Familiar = myFamiliar();
  if (
    auto_have_familiar($familiar`Stooper`) &&
    start_fam !== $familiar`Stooper` &&
    pathAllowsChangingFamiliar()
  ) {
    //check if path allows changing familiar
    //drinking does not break 100fam runs so do not use canChangeToFamiliar
    useFamiliar($familiar`Stooper`);
  }

  if (itemAmount($item`steel margarita`) > 0) {
    //LX_steelOrgan may wait to drink the Steel Margarita for Billiards, if drunkenness never went over 12 it could have been skipped
    //this should only be possible in Avatar of West of Loathing?
    const wontBeOverdrunk: boolean =
      inebriety_left() >= $item`steel margarita`.inebriety - 5;
    if (wontBeOverdrunk) {
      autoDrink(1, $item`steel margarita`);
    }
  }
  //fill up remaining liver first. such as stooper space.
  while (inebriety_left() > 0 && auto_autoConsumeOne$1("drink")) {}
  //drink your nightcap to become overdrunk
  const target: ConsumeAction = auto_bestNightcap();
  if (!autoPrepConsume(target)) {
    abort(`Unexpectedly couldn't prep ${to_pretty_string(target)}`);
  }
  autoDrink(1, target.it, true, target); // added a silent flag to autoDrink to avoid the overdrink confirmation popup

  if (overdrunk()) {
    //another round? (green beers)
    auto_overdrinkGreenBeers();
  }

  if (start_fam !== myFamiliar() && pathAllowsChangingFamiliar()) {
    //familiar can change when crafting the drink in QT
    useFamiliar(start_fam);
  }
}

export function auto_findBestConsumeAction(type_1: string): ConsumeAction {
  function organLeft(): number {
    if (type_1 === "eat") {
      return fullness_left();
    }
    if (type_1 === "drink") {
      if (in_quantumTerrarium() && myFamiliar() === $familiar`Stooper`) {
        // we can't change familiars so don't drink to full liver as we'll be overdrunk when it changes familiar.
        return myInebriety() < inebrietyLimit() ? inebriety_left() - 1 : 0;
      } else {
        return inebriety_left();
      }
    }
    abort(`Unrecognized organ type: should be 'eat' or 'drink', was ${type_1}`);
    return 0;
  }
  if (organLeft() === 0) {
    return MakeConsumeAction(Item.none);
  }

  const actions: Map<number, ConsumeAction> = new Map();
  loadConsumables(type_1, actions);

  const remaining_space: number = organLeft();

  const desirability_1: Map<number, number> = new Map();
  const space: Map<number, number> = new Map();
  for (let i: number = 0; i < actions.size; i++) {
    desirability_1.set(
      i,
      (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i))
        .desirability,
    );
    space.set(
      i,
      (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i)).size,
    );
  }

  const result_1: Map<number, boolean> = knapsack(
    remaining_space,
    space.size,
    space,
    desirability_1,
  );

  let best_desirability_per_fill: number = 0.0;
  let best: number = -1;
  for (const i of result_1.keys()) {
    const tentative_desirability_per_fill: number =
      (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i))
        .desirability /
      (actions.get(i) ?? actions.set(i, new ConsumeAction()).get(i)).size;
    if (tentative_desirability_per_fill > best_desirability_per_fill) {
      best_desirability_per_fill = tentative_desirability_per_fill;
      best = i;
    }
  }

  if (best === -1) {
    return MakeConsumeAction(Item.none);
  } else {
    return (
      actions.get(best) ?? actions.set(best, new ConsumeAction()).get(best)
    );
  }
}

function auto_findBestConsumeAction$1(): ConsumeAction {
  if (stomach_left() === 0 && inebriety_left() === 0) {
    return MakeConsumeAction(Item.none);
  }
  // if one organ is full and the other isn't, return the not full one
  if (stomach_left() === 0 && inebriety_left() > 0) {
    return auto_findBestConsumeAction("drink");
  }
  if (stomach_left() > 0 && inebriety_left() === 0) {
    return auto_findBestConsumeAction("eat");
  }
  // deterimine if we want to avoid drinking
  let considerDrink: boolean = true;
  if (!hasSpookyravenLibraryKey() && myInebriety() >= 10) {
    auto_log_info$1(
      "Will not drink to maintain pool skill for Haunted Billiards room.",
    );
    considerDrink = false;
    if (fullness_left() === 0) {
      auto_log_warning$1(
        "Need to drink as no fullness is available, pool skill will suffer.",
      );
      considerDrink = true;
    }
  }

  const bestFoodAction: ConsumeAction = auto_findBestConsumeAction("eat");
  // if we are avoiding drinking, simply return the best food
  if (!considerDrink) {
    return bestFoodAction;
  }
  // since we are considering drinking, determine if we should eat or drink
  const bestDrinkAction: ConsumeAction = auto_findBestConsumeAction("drink");
  let drink_desirability_per_fill: number = 0.0;
  let food_desirability_per_fill: number = 0.0;
  // leave desirability at 0 if an action wasn't found
  if (bestDrinkAction.it !== Item.none || bestDrinkAction.cafeid !== 0) {
    drink_desirability_per_fill =
      bestDrinkAction.desirability / bestDrinkAction.size;
  }
  if (bestFoodAction.it !== Item.none || bestFoodAction.cafeid !== 0) {
    food_desirability_per_fill =
      bestFoodAction.desirability / bestFoodAction.size;
  }
  // decsion time
  if (drink_desirability_per_fill > food_desirability_per_fill) {
    return bestDrinkAction;
  } else {
    return bestFoodAction;
  }
}

export function auto_autoConsumeOne(action: ConsumeAction): boolean {
  if (toBoolean(getProperty("auto_limitConsume"))) {
    return false;
  }

  if (action.it === Item.none && action.cafeid === 0) {
    auto_log_info("auto_autoConsumeOne: Nothing found to consume", "blue");
    return false;
  }

  let best_adv_per_fill: number = toInt(action.adventures / action.size);
  if (
    $items`Boris's key lime pie, Jarlsberg's key lime pie, Sneaky Pete's key lime pie`.includes(
      action.it,
    )
  ) {
    //the turn value of key lime pie is an exception so use its desirability instead of base adventures, after cancelling any effects of obtention method
    if (action.howtoget === AUTO_OBTAIN_PULL) {
      best_adv_per_fill = toInt((action.desirability + 5) / action.size);
    } else if (action.howtoget === AUTO_OBTAIN_CRAFT) {
      best_adv_per_fill = toInt((action.desirability + 1) / action.size);
    } else {
      best_adv_per_fill = toInt(action.desirability / action.size);
    }
  }
  // todo - put back in ` + type + " "` after execute================================================
  auto_log_info(
    `auto_autoConsumeOne: Planning to execute ${to_pretty_string(action)}`,
    "blue",
  );
  if (best_adv_per_fill < toFloat(getProperty("auto_consumeMinAdvPerFill"))) {
    auto_log_warning$1(
      `auto_autoConsumeOne: Will not consume, min adventures per full ${best_adv_per_fill} is less than auto_consumeMinAdvPerFill ${getProperty("auto_consumeMinAdvPerFill")}`,
    );
    return false;
  }

  if (!autoPrepConsume(action)) {
    return false;
  }
  return autoConsume(action);
}
//this should be definded second to avoid risking it calling itself.
export function auto_autoConsumeOne$1(type_1: string): boolean {
  const bestAction: ConsumeAction = auto_findBestConsumeAction(type_1);
  return auto_autoConsumeOne(bestAction);
}
// Need separate function to simulate since return type is different
// For simulation, want to know what would be consumes instead of actually consuming it

export function auto_spleenFamiliarAdvItemsPossessed(): number {
  //returns how many size 4 items from spleen familiars in possession

  let spleenFamiliarAdvItemsCount: number = 0;

  for (const it of $items`Unconscious Collective Dream Jar, grim fairy tale, powdered gold, groose grease, beastly paste, bug paste, cosmic paste, oily paste, demonic paste, gooey paste, elemental paste, Crimbo paste, fishy paste, goblin paste, hippy paste, hobo paste, indescribably horrible paste, greasy paste, Mer-kin paste, orc paste, penguin paste, pirate paste, chlorophyll paste, slimy paste, ectoplasmic paste, strange paste, agua de vida`) {
    if (
      itemAmount(it) > 0 &&
      auto_is_valid(it) &&
      mallPrice(it) < toInt(getProperty("autoBuyPriceLimit"))
    ) {
      //even when not mallbuying them we do not want to use exceptionally expensive items
      spleenFamiliarAdvItemsCount += itemAmount(it);
    }
  }

  return spleenFamiliarAdvItemsCount;
}

export function auto_chewAdventures(): boolean {
  //tries to chew a size 4 familiar spleen item that gives adventures. All are IOTM derivatives with 1.875 adv/size
  const liver_check: boolean = myInebriety() < inebrietyLimit() && !in_kolhs(); //kolhs has special drinking. liver often unfilled
  if (
    liver_check ||
    myFullness() < fullnessLimit() ||
    (myAdventures() > max(10, 1 + auto_advToReserve()) && !almostRollover())
  ) {
    return false; //1.875 A/S is bad. only chew if 1 adv remains
  }
  if (isActuallyEd()) {
    return false; //these consumables are very bad for ed, who has a path specific spleen consumable shop.
  }
  if (spleen_left() < 4) {
    return false; //they are all size 4
  }

  let target: Item = Item.none;
  let target_value: number = 0;

  function chooseCheapestTarget(it: Item): void {
    if (
      itemAmount(it) > 0 &&
      auto_is_valid(it) &&
      mallPrice(it) < toInt(getProperty("autoBuyPriceLimit"))
    ) {
      //do not chew very expensive items even if already in inv
      if (target === Item.none || mallPrice(it) < target_value) {
        target = it;
        target_value = mallPrice(it);
      }
    }
  }
  //first the ones without the level 4 requirement because they give more stats
  for (const it of $items`Unconscious Collective Dream Jar, grim fairy tale, powdered gold, groose grease`) {
    chooseCheapestTarget(it);
  }
  if (myLevel() >= 4 && target === Item.none) {
    for (const it of $items`beastly paste, bug paste, cosmic paste, oily paste, demonic paste, gooey paste, elemental paste, Crimbo paste, fishy paste, goblin paste, hippy paste, hobo paste, indescribably horrible paste, greasy paste, Mer-kin paste, orc paste, penguin paste, pirate paste, chlorophyll paste, slimy paste, ectoplasmic paste, strange paste, agua de vida`) {
      chooseCheapestTarget(it);
    }
  }

  const oldSpleenUse: number = mySpleenUse();
  if (target !== Item.none) {
    if (!autoChew(1, target)) {
      //the actual chewing attempt
      auto_log_warning(`Mysteriously failed to chew [${target}]`, "red");
    }
  }
  return oldSpleenUse !== mySpleenUse();
}

export function auto_breakfastCounterVisit(): boolean {
  if (
    itemAmount($item`earthenware muffin tin`) > 0 ||
    (!toBoolean(getProperty("_muffinOrderedToday")) &&
      $items`blueberry muffin, bran muffin, chocolate chip muffin, earthenware muffin tin`.includes(
        toItem(getProperty("muffinOnOrder")),
      ))
  ) {
    auto_log_info$1(
      "Going to the breakfast counter to grab/order a breakfast muffin.",
    );
    visitUrl("place.php?whichplace=monorail&action=monorail_downtown");
    runChoice(7); // Visit the Breakfast Counter
    if (getProperty("muffinOnOrder") !== "") {
      cliExecute("refresh inv");
      if (itemAmount(toItem(getProperty("muffinOnOrder"))) > 0) {
        // workaround mafia not clearing the property occasionally
        // see https://kolmafia.us/threads/ordering-a-muffin-at-the-breakfast-counter-doesnt-always-set-the-muffinonorder-property.26072/
        setProperty("muffinOnOrder", "");
      }
    }
    if (
      !toBoolean(getProperty("_muffinOrderedToday")) &&
      itemAmount($item`earthenware muffin tin`) > 0
    ) {
      auto_log_info$1(
        "Ordering a bran muffin for tomorrow to keep you regular.",
      );
      runChoice(2); // Order a bran muffin
    }
    runChoice(1); // Back to the Platform!
    runChoice(8); // Nevermind
  }
  return false; // not adventuring, no need to restart doTasks loop.
}

let $_still_targetToOrigin_originNeeded: Map<Item, Item> | undefined;

export function still_targetToOrigin(target: Item): Item {
  //Nash Crosby's Still can convert Origin item into Target item. This function takes a target and tells us which origin it needs.
  $_still_targetToOrigin_originNeeded ??= new Map([
    [$item`bottle of Calcutta Emerald`, $item`bottle of gin`],
    [$item`bottle of Lieutenant Freeman`, $item`bottle of rum`],
    [$item`bottle of Jorge Sinsonte`, $item`bottle of tequila`],
    [$item`bottle of Definit`, $item`bottle of vodka`],
    [$item`bottle of Domesticated Turkey`, $item`bottle of whiskey`],
    [$item`boxed champagne`, $item`boxed wine`],
    [$item`bottle of Pete's Sake`, $item`bottle of sake`],
    [$item`bottle of Ooze-O`, $item`bottle of sewage schnapps`],
    [$item`tangerine`, $item`grapefruit`],
    [$item`kiwi`, $item`lemon`],
    [$item`cocktail onion`, $item`olive`],
    [$item`kumquat`, $item`orange`],
    [$item`raspberry`, $item`strawberry`],
    [$item`tonic water`, $item`soda water`],
  ]);
  if ($_still_targetToOrigin_originNeeded.has(target)) {
    return (
      $_still_targetToOrigin_originNeeded.get(target) ??
      $_still_targetToOrigin_originNeeded.set(target, Item.none).get(target)
    );
  } else {
    auto_log_debug$1(
      `still_targetToOrigin failed to lookup the item [${target}]`,
    );
  }
  return Item.none;
}

export function stillReachable(): boolean {
  //can we reach Nash Crosby's Still.
  //stills_available() insufficient. it returns 0 if your class can not unlock still and 10 if your class can unlock it but did not.
  if (myClass() === $class`Avatar of Sneaky Pete`) {
    return true;
  }
  return (
    guildStoreAvailable() &&
    $classes`Accordion Thief, Disco Bandit`.includes(myClass())
  );
}

export function distill(target: Item): boolean {
  //use Nash Crosby's Still to create target
  auto_log_debug$1(`distill(item target) called to create [${target}]`);
  if (!stillReachable()) {
    auto_log_warning$1(
      `distill(item target) tried to create [${target}] but Nash Crosby's Still is not reachable`,
    );
    return false;
  }
  if (stillsAvailable() === 0) {
    auto_log_warning$1(
      `distill(item target) tried to create [${target}] but Nash Crosby's Still is out of uses`,
    );
    return false;
  }
  const start_amount: number = itemAmount(target);
  create(1, target); //use the still to create target
  if (start_amount + 1 === itemAmount(target)) {
    return true;
  }
  auto_log_warning$1(
    `distill(item target) mysteriously failed to create [${target}]`,
  );
  return false;
}

export function prepare_food_xp_multi(): boolean {
  //prepare as big an XP multi as possible for the next food item eaten
  if (fullness_left() < 1 || !canEat()) {
    return false;
  }
  //[Ready to Eat] is gotten by using a red rocket from fireworks shop in VIP clan. it gives +400% XP on next food item
  if (
    have_fireworks_shop() &&
    !in_wereprof() &&
    haveEffect(
      // don't want to use in WereProfessor
      $effect`Ready to Eat`,
    ) <= 0 &&
    auto_is_valid($item`red rocket`)
  ) {
    if (
      itemAmount($item`red rocket`) === 0 &&
      myMeat() > npcPrice($item`red rocket`)
    ) {
      //this is a more aggressive buying function than the one in pre_adv
      retrieveItem(1, $item`red rocket`);
    }
    if (itemAmount($item`red rocket`) > 0) {
      return false; //go use [red rocket] in combat before eating for XP
    }
  }
  //get [That's Just Cloud-Talk, Man] +25% all stats experience is already done by dailyEvents()

  equipStatgainIncreasers(
    new Map([
      [$stat`Muscle`, true],
      [$stat`Mysticality`, true],
      [$stat`Moxie`, true],
    ]),
    true,
  );

  if (haveEffect($effect`Ready to Eat`) > 0 || in_plumber()) {
    pullXWhenHaveY($item`Special Seasoning`, 1, 0); //automatically consumed with food and gives extra XP
  }

  return true;
}

export function consumeStuff(): void {
  if (auto_haveKramcoSausageOMatic()) {
    auto_sausageWanted();
  }

  if (toBoolean(getProperty("auto_limitConsume"))) {
    return;
  }

  if (bat_consumption()) {
    return;
  }
  if (inAftercore()) {
    return;
  }
  if (in_kolhs()) {
    kolhs_consume();
    return;
  }
  if (in_robot()) {
    robot_get_adv();
    return;
  }
  if (in_amw()) {
    if (
      (almostRollover() && needToConsumeForEmergencyRollover()) ||
      myAdventures() < max(10, 1 + auto_advToReserve())
    ) {
      amw_buyAdv();
    }
    return;
  }
  // fills up spleen for Ed.
  if (ed_eatStuff()) {
    return;
  }

  const edSpleenCheck: boolean =
    isActuallyEd() && myLevel() < 11 && spleen_left() > 0; // Ed should fill spleen first

  if (
    myAdventures() < max(10, 1 + auto_advToReserve()) &&
    fullness_left() > 0 &&
    is_boris()
  ) {
    borisDemandSandwich(true);
  }
  // guilty sprouts provide big stats. Eat if powerleveling
  if (
    isAboutToPowerlevel() &&
    auto_is_valid($item`guilty sprout`) &&
    auto_canEat($item`guilty sprout`) &&
    myLevel() < 13 &&
    !in_tcrs()
  ) {
    // attempt to eat spaghetti breakfast as can only be eaten as the first food of the day
    if (
      myLevel() >= 11 &&
      myFullness() === 0 &&
      !toBoolean(getProperty("_spaghettiBreakfastEaten"))
    ) {
      autoEat(1, $item`spaghetti breakfast`);
    }
    // use food to level if ready for it
    if (prepare_food_xp_multi()) {
      // important for leveling. Attempt to pull if we don't have one
      pullXWhenHaveY($item`guilty sprout`, 1, 0);
      autoEat(1, $item`guilty sprout`);
    }
  }
  // If adventures at our reserve amount, or it's almost Rollover, we need to consume
  if (
    (myAdventures() < max(10, 1 + auto_advToReserve()) && !edSpleenCheck) ||
    (almostRollover() && needToConsumeForEmergencyRollover())
  ) {
    // always unequip stooper as only useful for roll over
    if (
      myFamiliar() === $familiar`Stooper` &&
      toFamiliar(getProperty("auto_100familiar")) !== $familiar`Stooper` &&
      pathAllowsChangingFamiliar()
    ) {
      //check path allows changing of familiars
      useFamiliar(findNonRockFamiliarInTerrarium());
    }

    const bestAction: ConsumeAction = auto_findBestConsumeAction$1();

    if (auto_autoConsumeOne(bestAction)) {
      return;
    }
  }
  //if stomach and liver are full and out of adv then chew size 4 iotm derivative spleen items that give 1.875 adv/size.
  if (auto_chewAdventures()) {
    return;
  }
}
// In standard or with few IOTMs we might not be able to fill spleen with adventures or worksheds
// So in that case we can use them for the low priority various drops
export function shouldUseSpleenForLowPriority(): boolean {
  if (spleen_left() === 1) {
    return true;
  }
  if (spleen_left() === 0) {
    return false;
  }
  if (isActuallyEd()) {
    return false;
  }
  if (haveSpleenFamiliar() && pathHasFamiliar() && canChangeFamiliar()) {
    return false;
  }

  let spleen_likely_to_use: number = 0;
  spleen_likely_to_use += 2 * auto_CMCconsultsLeft();
  spleen_likely_to_use +=
    $item`dieting pill`.spleen * availableAmount($item`dieting pill`);
  if (
    auto_havePastaWand() &&
    !toBoolean(getProperty("_legendaryNoodlesSpleen")) &&
    fullness_left() > 0
  ) {
    spleen_likely_to_use += 1;
  }

  return spleen_left() > spleen_likely_to_use;
}

export function isSpleenConsumable(it: Item): boolean {
  return it.spleen !== 0;
}

function auto_getConsumablePriceLimit(): number {
  const mafia_max: number = toInt(getProperty("autoBuyPriceLimit"));
  const autoscend_max: number = toInt(getProperty("auto_consumablePriceLimit"));
  if (autoscend_max < 1) {
    return mafia_max;
  }
  return min(autoscend_max, mafia_max);
}
