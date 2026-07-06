import {
  abort,
  autosell,
  availableChoiceOptions,
  buy,
  buyUsingStorage,
  canInteract,
  ceil,
  cliExecute,
  closetAmount,
  containsText,
  creatableAmount,
  equippedAmount,
  equippedItem,
  getPower,
  getProperty,
  haveSkill,
  hermit,
  historicalPrice,
  inHardcore,
  isTradeable,
  isUnrestricted,
  Item,
  itemAmount,
  itemType,
  knollAvailable,
  mallPrice,
  max,
  min,
  myAdventures,
  myAscensions,
  myClass,
  myDaycount,
  myLevel,
  myMeat,
  myPrimestat,
  myStorageMeat,
  myTurncount,
  npcPrice,
  pullsRemaining,
  putCloset,
  retrieveItem,
  runChoice,
  setProperty,
  shopAmount,
  splitString,
  storageAmount,
  takeCloset,
  takeShop,
  takeStorage,
  toBoolean,
  toInt,
  toSkill,
  use,
  userConfirm,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $element,
  $item,
  $items,
  $skill,
  $skills,
  $slot,
  $stat,
} from "libram";

import { canEat$1, fullness_left } from "./auto_consume";
import { auto_fold } from "./auto_craft";
import { possessEquipment } from "./auto_equipment";
import { canChangeFamiliar, pathHasFamiliar } from "./auto_familiar";
import {
  ATSongList,
  auto_have_skill,
  auto_is_valid,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  auto_predictAccordionTurns,
  auto_setMCDToCap,
  auto_turbo,
  autoCraft,
  handleTracker,
  hasTorso$1,
  internalQuestStatus,
  isGeneralStoreAvailable,
  isGuildClass,
  isHermitAvailable,
  isMusGuildStoreAvailable,
  isUnclePAvailable,
  wrap_item,
} from "./auto_util";
import { canUse$2 } from "./combat/auto_combat_util";
import { auto_floundryUse, isSpeakeasyDrink } from "./iotms/clan";
import { pullLegionKnife } from "./iotms/mr2011";
import { auto_mayoItems } from "./iotms/mr2015";
import { pantogramPants$1 } from "./iotms/mr2017";
import { auto_checkTakerSpace } from "./iotms/mr2024";
import { in_amw } from "./paths/adventurer_meats_world";
import { ag_pulls } from "./paths/avant_guard";
import { inAftercore } from "./paths/casual";
import { in_darkGyffte } from "./paths/dark_gyffte";
import { in_glover } from "./paths/g_lover";
import { in_heavyrains } from "./paths/heavy_rains";
import { iluh_pulls } from "./paths/i_love_u_hate";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { in_lol } from "./paths/legacy_of_loathing";
import { in_picky } from "./paths/picky";
import { in_pokefam } from "./paths/pocket_familiars";
import { auto_SmallPulls } from "./paths/small";
import { in_tcrs } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";
import { is_werewolf } from "./paths/wereprofessor";
import { zoo_d2Pulls, zoo_startPulls } from "./paths/zootomist";
import { bridgeGoal, fastenerCount, lumberCount } from "./quests/level_09";
import { LX_dolphinKingMap, LX_meatMaid } from "./quests/level_any";

// functions that deal with acquiring items. via buying or pulling

//Defined in autoscend/auto_acquire.ash

export function acquireOrPull(it: Item): boolean {
  //this function is for when you want to make sure you have 1 of an item
  //if you have one it returns true. if you don't it will craft one. if it can't it will pull it.

  if (possessEquipment(it)) {
    return true;
  }
  if (itemAmount(it) > 0) {
    return true;
  }
  if (retrieveItem(1, it)) {
    return true;
  }
  if (canPull$1(it)) {
    if (pullXWhenHaveY(it, 1, 0)) {
      return true;
    }
  }
  //special handling via pulling 1 ingredient to craft the item desired
  if (
    $items`asteroid belt, meteorb, shooting morning star, meteorite guard, meteortarboard, meteorthopedic shoes`.includes(
      it,
    )
  ) {
    if (canPull$1($item`metal meteoroid`)) {
      if (pullXWhenHaveY($item`metal meteoroid`, 1, 0)) {
        if (retrieveItem(1, it)) {
          return true;
        }
      }
    }
  }

  return false;
}

export function canPull(it: Item, historical: boolean): boolean {
  if (inHardcore()) {
    return false;
  }
  if (in_lol()) {
    // kol states "Only food, booze, potions, combat and usable items may be pulled on this path."
    if (
      it.fullness === 0 &&
      it.inebriety === 0 &&
      !it.potion &&
      !it.combat &&
      !it.usable
    ) {
      return false;
    }
  }
  if (it === Item.none) {
    return false;
  }
  if (!isUnrestricted(it)) {
    return false;
  }
  if (pullsRemaining() === 0) {
    return false;
  }
  if (pulledToday(it)) {
    return false;
  }

  if (storageAmount(it) > 0) {
    return true; //we have it in storage so we can pull it
  } else if (!isTradeable(it)) {
    return false; //we do not have it in storage and we can not trade for it. gifts currently not handled
  }

  if (!auto_is_valid(it)) {
    return false;
  }

  let meat: number = myStorageMeat();
  if (canInteract()) {
    meat = max(meat, myMeat() - 5000);
  }
  let curPrice: number = historicalPrice(it);
  if (!historical) {
    curPrice = auto_mall_price(it);
  }
  if (curPrice < 1) {
    return false; //a 0 or a -1 indicates the item is not available.
  }
  if (curPrice > toInt(getProperty("autoBuyPriceLimit"))) {
    return false;
  } else if (curPrice < meat) {
    return true;
  }

  return false;
}

export function canPull$1(it: Item): boolean {
  return canPull(it, false);
}

function pulledToday(it: Item): boolean {
  //autoscend property "auto_pulls" tracks pulls made by the script as "(" + my_daycount() + ":" + it
  //kolmafia property "_roninStoragePulls" tracks all pulls made with kolmafia today since 2022 changed to daily limit of one pull for each item
  const allPulls: Map<number, string> = new Map(
    splitString(getProperty("_roninStoragePulls"), ",").map((_v, _i) => [
      _i,
      _v,
    ]),
  );
  for (const i of allPulls.keys()) {
    if (toInt(allPulls.get(i) ?? allPulls.set(i, "").get(i)) === toInt(it)) {
      return true;
    }
  }
  return false;
}

export function auto_mall_price(it: Item): number {
  if (isSpeakeasyDrink(it)) {
    return -1; //speakeasy drinks are marked as tradeable but cannot be acquired as a physical item to trade.
  }
  if (0 in availableChoiceOptions() || 1 in availableChoiceOptions()) {
    //we are in a choice adventure.
    //mafia returns -1 if we check mall_price() while in a choice adv. better to use historical price even if it is outdated
    return historicalPrice(it);
  }
  if (isTradeable(it)) {
    let retval: number;
    const it_type: string = itemType(it);
    if (it_type === "food" || it_type === "booze") {
      //autoscend does Bulk cache mall prices for food,booze,hprestore,mprestore so that when asking for mall_price it gets a cached mafia session price
      //directly ask for historical_price here if it exists because if mafia session has to be restarted mafia will do another search despite recent price
      //hprestore and mprestore types corresponding with mall_prices search categories are not available
      retval = historicalPrice(it);
      if (retval === 0) {
        retval = mallPrice(it);
      }
    } else {
      retval = mallPrice(it);
    }
    if (retval === -1) {
      //0 could be due to item not being tradeable.
      //-1 could be due to tradeable item not found in the mall. Or due to an IO error during lookup
      //-1 is non trivial to fix due to mafia anti abuse code
      //historical price can never be -1. only 0 or a positive number
      //just use the historical price. It will be good enough. it never returns -1. and if it returns 0 it is because this mafia install never happened to look up that item before. which suggests an extreme edge case or that the item is really unavailable
      return historicalPrice(it);
    }
    return retval;
  }
  return -1;
}

function pullXWhenHaveYCasual(
  it: Item,
  howMany: number,
  whenHave: number,
): boolean {
  //we are either in a casual run. or in postronin. either way pull becomes mallbuy
  if (!canInteract()) {
    return false;
  }
  if (it === Item.none) {
    return false;
  }
  if (!auto_is_valid(it)) {
    return false;
  }
  if (itemAmount(it) + equippedAmount(it) !== whenHave) {
    return false;
  }
  if (inAftercore()) {
    takeStorage(storageAmount(it), it);
  }
  const maxprice: number = toInt(getProperty("autoBuyPriceLimit"));
  while (itemAmount(it) < howMany && auto_mall_price(it) < maxprice) {
    if (auto_mall_price(it) > myMeat()) {
      abort("Don't have enough meat to restock, big sad");
    }
    if (buy(1, it, maxprice) === 0) {
      auto_log_info(
        `Price of ${it} exceeded expected mall price of ${maxprice}.`,
        "blue",
      );
      return false;
    }
  }
  if (itemAmount(it) < howMany) {
    if (auto_mall_price(it) >= maxprice) {
      auto_log_info(
        `Price of ${it} exceeded expected mall price of ${maxprice}.`,
        "blue",
      );
    }
    return false;
  }
  return true;
}

export function pullXWhenHaveY(
  it: Item,
  howMany: number,
  whenHave: number,
): boolean {
  if (canInteract()) {
    return pullXWhenHaveYCasual(it, howMany, whenHave);
  }
  if (!canPull$1(it)) {
    return false;
  }
  if (itemAmount(it) + equippedAmount(it) === whenHave) {
    let lastStorage: number = storageAmount(it);
    while (storageAmount(it) < howMany) {
      const oldPrice: number = toInt(historicalPrice(it) * 1.2);
      const curPrice: number = auto_mall_price(it);
      let meat: number = myStorageMeat();
      const priceLimit: number = toInt(getProperty("autoBuyPriceLimit"));
      let getFromStorage: boolean = true;
      if (canInteract() && meat < curPrice) {
        meat = myMeat() - 5000;
        getFromStorage = false;
      }
      if (curPrice >= priceLimit) {
        auto_log_warning(
          `${it} is too expensive at ${curPrice} meat, we're gonna skip buying one in the mall.`,
          "red",
        );
        break;
      }
      if (curPrice <= oldPrice && curPrice < priceLimit && meat >= curPrice) {
        if (getFromStorage) {
          buyUsingStorage(howMany - storageAmount(it), it, curPrice);
        } else {
          howMany -= buy(howMany - storageAmount(it), it, curPrice);
        }
      } else {
        if (curPrice > oldPrice) {
          auto_log_warning(
            `Price of ${it} may have been mall manipulated. Expected to pay at most: ${oldPrice}`,
            "red",
          );
        }
        if (myStorageMeat() < curPrice) {
          auto_log_warning(
            `Do not have enough meat in Hagnk's to buy ${it}. Need ${curPrice} have ${myStorageMeat()}.`,
            "blue",
          );
        }
      }
      if (lastStorage === storageAmount(it)) {
        break;
      }
      lastStorage = storageAmount(it);
    }

    if (storageAmount(it) < howMany) {
      auto_log_warning$1("Can not pull what we don't have. Sorry");
      return false;
    }

    auto_log_info(`Trying to pull ${howMany} of ${it}`, "blue");
    const retval: boolean = takeStorage(howMany, it);
    if (itemAmount(it) !== howMany + whenHave) {
      auto_log_warning(`Failed pulling ${howMany} of ${it}`, "red");
    } else {
      for (let i: number = 0; i < howMany; ++i) {
        handleTracker(it.toString(), "auto_pulls");
      }
    }
    return retval;
  }
  return false;
}

export function pulverizeThing(it: Item): boolean {
  if (!haveSkill($skill`Pulverize`)) {
    return false;
  }
  if (itemAmount($item`tenderizing hammer`) === 0) {
    if (myMeat() < npcPrice($item`tenderizing hammer`)) {
      return false;
    }
  }

  if (itemAmount(it) === 0) {
    if (closetAmount(it) === 0) {
      return false;
    }
    takeCloset(1, it);
  }
  if (itemAmount(it) === 0) {
    return false;
  }
  cliExecute(`pulverize 1 ${it}`);
  return true;
}

export function buyableMaintain$1(
  toMaintain: Item,
  howMany: number,
  meatMin: number,
): boolean {
  return buyableMaintain$2(toMaintain, howMany, meatMin, true);
}

export function buyableMaintain$2(
  toMaintain: Item,
  howMany: number,
  meatMin: number,
  condition: boolean,
): boolean {
  if (!condition || myMeat() < meatMin || in_wotsf()) {
    return false;
  }

  return auto_buyUpTo(howMany, toMaintain);
}

export function auto_buyUpTo(num: number, it: Item): boolean {
  if (is_werewolf()) {
    return false; //can't buy anything as a werewolf
  }
  if (itemAmount(it) >= num) {
    return true; //we already have the target amount
  }
  if (
    $items`Ben-Gal™ Balm, hair spray`.includes(it) &&
    !isGeneralStoreAvailable()
  ) {
    return false;
  }
  if (
    $items`blood of the Wereseal, cheap wind-up clock, turtle pheromones`.includes(
      it,
    ) &&
    !isMusGuildStoreAvailable()
  ) {
    return false;
  }

  let missing: number = num - itemAmount(it);
  const maxprice: number = toInt(getProperty("autoBuyPriceLimit"));
  if (canInteract() && shopAmount(it) > 0 && mallPrice(it) < maxprice) {
    //prefer to buy from yourself
    takeShop(min(missing, shopAmount(it)), it);
    missing = num - itemAmount(it);
  }
  if (missing > 0) {
    buy(missing, it, maxprice);
    if (itemAmount(it) < num) {
      auto_log_warning(
        `Could not auto_buyUpTo(${num}) of ${it}. Maxprice: ${maxprice}`,
        "red",
      );
    }
  }
  return itemAmount(it) >= num;
}

export function npcStoreDiscountMulti(): number {
  //calculates a multiplier to be applied to store prices for our current discount for NPC stores.
  //does not bother with sleaze jelly or Post-holiday sale coupon

  let retval: number = 1.0;

  if (auto_have_skill($skill`Five Finger Discount`)) {
    retval -= 0.05;
  }
  if (
    possessEquipment($item`Travoltan trousers`) &&
    auto_is_valid($item`Travoltan trousers`)
  ) {
    retval -= 0.05;
  }

  return retval;
}

export function acquireGumItem(it: Item): boolean {
  if (!isGeneralStoreAvailable()) {
    return false;
  }

  if (
    !$items`disco ball, disco mask, helmet turtle, Hollandaise helmet, mariachi hat, old sweatpants, pasta spoon, ravioli hat, saucepan, seal-clubbing club, seal-skull helmet, stolen accordion, turtle totem, worthless gewgaw, worthless knick-knack, worthless trinket`.includes(
      it,
    )
  ) {
    return false;
  }

  const have: number = itemAmount(it);
  auto_log_info(`Gum acquisition of: ${it}`, "green");
  while (
    have === itemAmount(it) &&
    myMeat() >= npcPrice($item`chewing gum on a string`)
  ) {
    auto_buyUpTo(1, $item`chewing gum on a string`);
    use(1, $item`chewing gum on a string`);
  }

  return have + 1 === itemAmount(it);
}

export function acquireTotem(): boolean {
  //this function checks if you have a valid totem for casting turtle tamer buffs with. Returning true if you do. If you don't, it will attempt to acquire one in a reasonable manner.
  //check if there is a valid totem in inventory or equipped, return true if there is.
  //check the closet from best to worst. If found in closet, uncloset 1 and return true

  for (const totem of $items`primitive alien totem, Flail of the Seven Aspects, Chelonian Morningstar, Mace of the Tortoise, Ouija Board\, Ouija Board, turtle totem`) {
    if (possessEquipment(totem)) {
      return true;
    }
    if (0 < closetAmount(totem)) {
      takeCloset(1, totem);
      return true;
    }
  }

  let want_totem: boolean = false;
  for (const sk of $skills`Empathy of the Newt, Astral Shell, Ghostly Shell, Tenacity of the Snapper, Spiky Shell, Reptilian Fortitude, Jingle Bells, Curiosity of Br'er Tarrypin`) {
    if (auto_have_skill(sk)) {
      want_totem = true;
    }
  }
  if (want_totem) {
    //try fishing in the sewer for a turtle totem
    if (acquireGumItem($item`turtle totem`)) {
      return true;
    }
  }
  //did not get a totem. Give up
  return false;
}

function auto_hermit(amt: number, it: Item): boolean {
  //workaround for this bug https://kolmafia.us/threads/27105/
  if (it !== $item`11-leaf clover`) {
    return hermit(amt, it);
  }
  const initial: number = itemAmount(it);
  try {
    hermit(amt, it);
  } catch (e: any) {}
  return itemAmount(it) === initial + amt;
}

export function acquireHermitItem(it: Item): boolean {
  if (!isHermitAvailable()) {
    return false;
  }

  if (
    itemAmount($item`hermit permit`) === 0 &&
    myMeat() >= npcPrice($item`hermit permit`)
  ) {
    auto_buyUpTo(1, $item`hermit permit`);
  }
  if (itemAmount($item`hermit permit`) === 0) {
    return false;
  }
  if (
    !$items`banjo strings, catsup, chisel, figurine of an ancient seal, hot buttered roll, jabañero pepper, ketchup, petrified noodles, seal tooth, 11-leaf clover, volleyball, wooden figurine`.includes(
      it,
    )
  ) {
    return false;
  }
  if (
    it === $item`figurine of an ancient seal` &&
    myClass() !== $class`Seal Clubber`
  ) {
    return false;
  }
  if (
    it === $item`11-leaf clover` &&
    toInt(getProperty("_cloversPurchased")) >= 3
  ) {
    return false;
  }
  if (!isGeneralStoreAvailable()) {
    return false;
  }
  const have: number = itemAmount(it);
  auto_log_info(`Hermit acquisition of: ${it}`, "green");
  while (
    have === itemAmount(it) &&
    (myMeat() >= npcPrice($item`chewing gum on a string`) ||
      itemAmount($item`worthless trinket`) +
        itemAmount($item`worthless gewgaw`) +
        itemAmount($item`worthless knick-knack`) >
        0)
  ) {
    if (
      itemAmount($item`worthless trinket`) +
        itemAmount($item`worthless gewgaw`) +
        itemAmount($item`worthless knick-knack`) >
      0
    ) {
      if (!auto_hermit(1, it)) {
        return false;
      }
    } else {
      if (is_werewolf()) {
        return false; //can access the hermit, but can't buy chewing gum as a Werewolf
      }
      auto_buyUpTo(1, $item`chewing gum on a string`);
      use(1, $item`chewing gum on a string`);
    }
  }

  return have + 1 === itemAmount(it);
}

export function pull_meat(target: number): boolean {
  //pulls meat to reach the desired target amount. preferentially will pull items and autosell them.
  if (myMeat() >= target) {
    return true; //already have target meat
  }
  if (pullsRemaining() < 1) {
    //hardcore returns 0. casual returns -1. both are < 1
    return false; //can not pull
  }
  if (in_wotsf()) {
    return false; //can not pull meat & autoselling items just donates them
  }
  //pull and autosell items, except in adventurer meats world
  while (myMeat() < target && pullsRemaining() > 0 && !in_amw()) {
    let fail: boolean = true; //if true an item was not pulled and sold this loop
    for (const it of $items`1\,970 carat gold`) {
      if (fail && storageAmount(it) > 0 && isUnrestricted(it)) {
        if (pullXWhenHaveY(it, 1, 0) && autosell(1, it)) {
          //pull and sell
          fail = false;
        }
      }
    }
    if (fail) {
      break;
    }
  }
  //pull meat directly
  if (myMeat() < target && myStorageMeat() >= target) {
    let meat_pulls: number = target - myMeat(); //how much meat we need to pull. converted to float
    meat_pulls = ceil(meat_pulls / 1000.0); //how many pulls it will require to get.
    meat_pulls = min(pullsRemaining(), meat_pulls); //limit by remaining pulls
    const meat_pull_int: number = toInt(meat_pulls * 1000); //we want to round it up to nearest 1000
    if (meat_pulls > 0) {
      cliExecute(`pull ${meat_pull_int} meat`);
    }
  }

  return myMeat() >= target;
}

export function handlePulls(day: number): number {
  if (itemAmount($item`astral six-pack`) > 0) {
    use(1, $item`astral six-pack`);
  }
  if (itemAmount($item`astral hot dog dinner`) > 0) {
    use(1, $item`astral hot dog dinner`);
  }
  if (itemAmount($item`[10882]carton of astral energy drinks`) > 0) {
    use(1, $item`[10882]carton of astral energy drinks`);
  }

  if (inHardcore()) {
    return 0;
  }

  if (day === 1) {
    setProperty("lightsOutAutomation", "1");
    // Do starting pulls:
    if (pullsRemaining() !== 20 && !inHardcore() && myTurncount() > 0) {
      auto_log_info$1(
        "I assume you've handled your pulls yourself... who knows.",
      );
      return 0;
    }
    if (auto_turbo()) {
      //Pull expensive organ cleansers first if you are running turbo and you own them
      for (const it of $items`spice melange, Ultra Mega Sour Ball, alien plant pod, alien animal milk`) {
        if (storageAmount(it) > 0 && auto_is_valid(it) && !pulledToday(it)) {
          if (
            userConfirm(
              `Pulling a ${it}. If you are ok with this, you have 15 seconds to hit 'Yes'`,
              15000,
              false,
            )
          ) {
            pullXWhenHaveY(it, 1, 0);
          }
        }
      }
      //Make sure we have the legendary pizzas if we want to/can consume them so we take full advantage of the dieting pills
      if (!toBoolean(getProperty("auto_dontConsumeLegendPizzas"))) {
        for (const it of $items`Pizza of Legend, Calzone of Legend, Deep Dish of Legend`) {
          if (canEat$1(it) && !pulledToday(it)) {
            pullXWhenHaveY(it, 1, 0);
          }
          // Pull at least one early dieting pill if we've acquired a legendary pizza
          if (itemAmount(it) > 0 && !pulledToday($item`dieting pill`)) {
            pullXWhenHaveY($item`dieting pill`, 1, 0);
          }
        }
      }
      // get a wet stew
      for (const it of $items`wet stew`) {
        if (!pulledToday(it)) {
          pullXWhenHaveY(it, 1, 0);
        }
      }
    }
    // pulls for small path
    auto_SmallPulls();
    // pulls for 11THIAU path
    iluh_pulls();
    // pulls for Avant Guard path
    ag_pulls();
    // pulls for Z is for Zootomist path
    zoo_startPulls();
    // generic pulls for any path are below
    if (auto_is_valid($item`etched hourglass`)) {
      pullXWhenHaveY($item`etched hourglass`, 1, 0);
    }
    // generic pull for any path, but unusable in KoE
    if (!in_koe() && auto_is_valid($item`infinite BACON machine`)) {
      pullXWhenHaveY($item`infinite BACON machine`, 1, 0);
    }
    // things we would always pull but cannot pull due to LoL usage restrictions
    if (!in_lol()) {
      if (
        storageAmount($item`mafia thumb ring`) > 0 &&
        auto_is_valid($item`mafia thumb ring`)
      ) {
        pullXWhenHaveY($item`mafia thumb ring`, 1, 0);
      }
      if (
        storageAmount($item`can of Rain-Doh`) > 0 &&
        auto_is_valid($item`can of Rain-Doh`) &&
        pullXWhenHaveY($item`can of Rain-Doh`, 1, 0)
      ) {
        if (itemAmount($item`can of Rain-Doh`) > 0) {
          use(1, $item`can of Rain-Doh`);
          putCloset(1, $item`empty Rain-Doh can`);
        }
      }
      if (
        storageAmount($item`Buddy Bjorn`) > 0 &&
        auto_is_valid($item`Buddy Bjorn`) &&
        pathHasFamiliar()
      ) {
        pullXWhenHaveY($item`Buddy Bjorn`, 1, 0);
      }
      if (
        storageAmount($item`Camp Scout backpack`) > 0 &&
        !possessEquipment($item`Buddy Bjorn`) &&
        auto_is_valid($item`Camp Scout backpack`)
      ) {
        pullXWhenHaveY($item`Camp Scout backpack`, 1, 0);
      }
      if (!possessEquipment($item`astral shirt`)) {
        let getPeteShirt: boolean = true;
        if (!hasTorso$1()) {
          getPeteShirt = false;
        }
        if (
          myPrimestat() === $stat`Muscle` &&
          toBoolean(getProperty("loveTunnelAvailable"))
        ) {
          getPeteShirt = false;
        }
        if (in_glover()) {
          getPeteShirt = false;
        }
        if (
          storageAmount($item`Sneaky Pete's leather jacket`) === 0 &&
          storageAmount($item`Sneaky Pete's leather jacket (collar popped)`) ===
            0
        ) {
          getPeteShirt = false;
        }
        if (getPeteShirt) {
          pullXWhenHaveY($item`Sneaky Pete's leather jacket`, 1, 0);
          if (itemAmount($item`Sneaky Pete's leather jacket`) === 0) {
            pullXWhenHaveY(
              $item`Sneaky Pete's leather jacket (collar popped)`,
              1,
              0,
            );
          } else {
            auto_fold($item`Sneaky Pete's leather jacket (collar popped)`);
          }
        }
      }
      if (
        equippedItem($slot`folder1`) === $item`folder (tranquil landscape)` &&
        equippedItem($slot`folder2`) === $item`folder (skull and crossbones)` &&
        equippedItem($slot`folder3`) === $item`folder (Jackass Plumber)` &&
        auto_is_valid(wrap_item($item`over-the-shoulder Folder Holder`))
      ) {
        pullXWhenHaveY($item`over-the-shoulder Folder Holder`, 1, 0);
      }
      if (auto_have_skill($skill`Summon Smithsness`)) {
        pullXWhenHaveY($item`Hand in Glove`, 1, 0);
      }
      pullLegionKnife();
    }
    // pulls excluding a handful of paths are below
    if (!in_heavyrains() && pathHasFamiliar()) {
      // heavy rains familiars largely need miniature life preserver
      if (
        !possessEquipment($item`Snow Suit`) &&
        !possessEquipment($item`astral pet sweater`) &&
        auto_is_valid($item`Snow Suit`)
      ) {
        pullXWhenHaveY($item`Snow Suit`, 1, 0);
      }
      const famStatEq: boolean =
        possessEquipment($item`fuzzy polar bear ears`) ||
        possessEquipment($item`miniature goose mask`) ||
        possessEquipment($item`tiny glowing red nose`);

      if (
        !possessEquipment($item`Snow Suit`) &&
        !possessEquipment($item`filthy child leash`) &&
        !possessEquipment($item`astral pet sweater`) &&
        !famStatEq &&
        auto_is_valid($item`filthy child leash`)
      ) {
        pullXWhenHaveY($item`filthy child leash`, 1, 0);
      }
    }
    if (!in_pokefam() && auto_is_valid($item`replica bat-oomerang`)) {
      // cannot use combat items in pokefam
      pullXWhenHaveY($item`replica bat-oomerang`, 1, 0);
    }
    if (
      myPrimestat() === $stat`Muscle` &&
      !in_wotsf() &&
      !in_heavyrains() &&
      !in_lol()
    ) {
      // no need for shields in WotSF; cannot pull them in LoL
      if (
        possessEquipment($item`familiar scrapbook`) &&
        auto_is_valid($item`familiar scrapbook`) &&
        myClass() !== $class`Turtle Tamer`
      ) {
        // familiar scrapbook will probably be equipped in preference to Fake Washboard
      } else if (
        closetAmount($item`fake washboard`) === 0 &&
        auto_is_valid($item`fake washboard`)
      ) {
        pullXWhenHaveY($item`fake washboard`, 1, 0);
      }
      if (
        itemAmount($item`fake washboard`) === 0 &&
        closetAmount($item`fake washboard`) === 0
      ) {
        if (!auto_turbo()) {
          pullXWhenHaveY($item`numberwang`, 1, 0);
        }
      } else {
        if (toBoolean(getProperty("barrelShrineUnlocked"))) {
          putCloset(itemAmount($item`fake washboard`), $item`fake washboard`);
        }
      }
    } else {
      pullXWhenHaveY($item`numberwang`, 1, 0);
    }
    if (
      (myClass() === $class`Sauceror` || myClass() === $class`Pastamancer`) &&
      !in_wotsf() &&
      !in_lol()
    ) {
      // no need for offhands in WotSF; cannot pull items in LoL
      if (
        itemAmount(wrap_item($item`Deck of Every Card`)) === 0 &&
        !auto_have_skill($skill`Summon Smithsness`)
      ) {
        pullXWhenHaveY($item`Thor's Pliers`, 1, 0);
      }
      if (auto_is_valid($item`basaltamander buckler`)) {
        pullXWhenHaveY($item`basaltamander buckler`, 1, 0);
      }
    }
    // path specific pulls are below
    if (in_wotsf()) {
      pullXWhenHaveY($item`BittyCar MeatCar`, 1, 0);
    }
    if (
      (in_picky() || !canChangeFamiliar()) &&
      itemAmount(wrap_item($item`Deck of Every Card`)) === 0 &&
      fullness_left() >= 4
    ) {
      if (
        itemAmount($item`Boris's key`) === 0 &&
        canEat$1($item`Boris's key lime pie`) &&
        !containsText(
          getProperty("nsTowerDoorKeysUsed"),
          $item`Boris's key`.toString(),
        )
      ) {
        pullXWhenHaveY($item`Boris's key lime pie`, 1, 0);
      }
      if (
        itemAmount($item`Sneaky Pete's key`) === 0 &&
        canEat$1($item`Sneaky Pete's key lime pie`) &&
        !containsText(
          getProperty("nsTowerDoorKeysUsed"),
          $item`Sneaky Pete's key`.toString(),
        )
      ) {
        pullXWhenHaveY($item`Sneaky Pete's key lime pie`, 1, 0);
      }
      if (
        itemAmount($item`Jarlsberg's key`) === 0 &&
        canEat$1($item`Jarlsberg's key lime pie`) &&
        !containsText(
          getProperty("nsTowerDoorKeysUsed"),
          $item`Jarlsberg's key`.toString(),
        )
      ) {
        pullXWhenHaveY($item`Jarlsberg's key lime pie`, 1, 0);
      }
    }
    if (in_picky()) {
      pullXWhenHaveY($item`gumshoes`, 1, 0);
    }
    if (in_pokefam()) {
      pullXWhenHaveY($item`ring of Detect Boring Doors`, 1, 0);
      pullXWhenHaveY($item`Pick-O-Matic lockpicks`, 1, 0);
      pullXWhenHaveY($item`eleven-foot pole`, 1, 0);
    }
    if (in_darkGyffte()) {
      auto_log_info(
        "You are a powerful vampire who is doing a softcore run. Turngen is busted in this path, so let's see how much we can get.",
        "blue",
      );
      pullXWhenHaveY($item`mime army shotglass`, 1, 0);
    }
    if (in_lol()) {
      // some items that can be pulled to help accelerate runs
      pullXWhenHaveY($item`portable pantogram`, 1, 0);
      pullXWhenHaveY($item`SpinMaster™ lathe`, 1, 0);
      pullXWhenHaveY($item`Asdon Martin keyfob (on ring)`, 1, 0);
    }
  } else if (day === 2) {
    if (
      closetAmount($item`fake washboard`) === 1 &&
      toBoolean(getProperty("barrelShrineUnlocked"))
    ) {
      takeCloset(1, $item`fake washboard`);
    }
    // pulls for Avant Guard path
    ag_pulls();
    zoo_d2Pulls();
  }
  // do this regardless of day if we still need to complete the bridge.
  if (
    canPull$1($item`smut orc keepsake box`) &&
    toInt(getProperty("chasmBridgeProgress")) +
      min(lumberCount(), fastenerCount()) <
      bridgeGoal()
  ) {
    if (pullXWhenHaveY($item`smut orc keepsake box`, 1, 0)) {
      use(1, $item`smut orc keepsake box`);
    }
  }

  return pullsRemaining();
}

export function LX_craftAcquireItems(): boolean {
  if (
    toInt(getProperty("lastGoofballBuy")) !== myAscensions() &&
    internalQuestStatus("questL03Rat") >= 0
  ) {
    visitUrl("place.php?whichplace=woods");
    auto_log_info("Gotginb Goofballs", "blue");
    visitUrl("tavern.php?place=susguy&action=buygoofballs", true);
    putCloset(
      itemAmount($item`bottle of goofballs`),
      $item`bottle of goofballs`,
    );
  }

  auto_floundryUse();
  // Snow Berries can be acquired out of standard by using Van Keys from NEP. We need to check to make sure they are usable.
  if (auto_is_valid($item`snow berries`)) {
    if (
      itemAmount($item`snow berries`) === 3 &&
      myDaycount() === 1 &&
      toBoolean(getProperty("auto_grimstoneFancyOilPainting"))
    ) {
      cliExecute("make 1 snow cleats");
    }

    if (
      itemAmount($item`snow berries`) > 0 &&
      myDaycount() > 1 &&
      toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal() &&
      myLevel() >= 9
    ) {
      visitUrl("place.php?whichplace=orc_chasm");
      if (toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal()) {
        //if(in_hardcore() && isGuildClass())
        if (isGuildClass()) {
          if (
            itemAmount($item`snow berries`) >= 3 &&
            itemAmount($item`ice harvest`) >= 3 &&
            itemAmount($item`unfinished ice sculpture`) === 0
          ) {
            cliExecute("make 1 Unfinished Ice Sculpture");
          }
          if (
            itemAmount($item`snow berries`) >= 2 &&
            itemAmount($item`snow crab`) === 0
          ) {
            cliExecute("make 1 Snow Crab");
          }
        }
        //cli_execute("make " + item_amount($item[snow berries]) + " snow cleats");
      } else {
        abort(
          "Bridge progress came up as >= 30 but is no longer after viewing the page.",
        );
      }
    }
  }

  if (
    knollAvailable() &&
    itemAmount($item`detuned radio`) === 0 &&
    myMeat() >= npcPrice($item`detuned radio`) &&
    auto_is_valid($item`detuned radio`) &&
    (!in_amw() || myLevel() >= 7)
  ) {
    auto_buyUpTo(1, $item`detuned radio`);
    auto_setMCDToCap();
  }

  if (myAdventures() <= 3 && myDaycount() === 1 && inHardcore()) {
    if (LX_meatMaid()) {
      return true;
    }
  }
  //Can we have some other way to check that we have AT skills? Checking all skills just to be sure.
  if (
    itemAmount($item`antique accordion`) === 0 &&
    itemAmount($item`aerogel accordion`) === 0 &&
    isUnclePAvailable() &&
    myMeat() >= npcPrice($item`antique accordion`) &&
    auto_predictAccordionTurns() < 10 &&
    !in_glover()
  ) {
    let buyAntiqueAccordion: boolean = false;

    for (const SongCheck of ATSongList().keys()) {
      if (haveSkill(toSkill(SongCheck))) {
        buyAntiqueAccordion = true;
      }
    }

    if (buyAntiqueAccordion) {
      auto_buyUpTo(1, $item`antique accordion`);
    }
  }

  if (itemAmount($item`seal tooth`) === 0 && auto_is_valid($item`seal tooth`)) {
    //saucerors want to use sealtooth to delay so that mortar shell delivers final blow for weaksauce MP explosion
    //TODO: add delaying for mortar for other classes in combat and then remove the sauceror requirement here.
    if (
      myMeat() > 7500 ||
      (myClass() === $class`Sauceror` && canUse$2($skill`Stuffed Mortar Shell`))
    ) {
      acquireHermitItem($item`seal tooth`);
    }
  }

  if (myClass() === $class`Turtle Tamer` && !in_wotsf()) {
    // no need for shields in way of the surprising fist
    if (
      !possessEquipment($item`turtle wax shield`) &&
      itemAmount($item`turtle wax`) > 0
    ) {
      use(1, $item`turtle wax`);
    }
    if (
      haveSkill($skill`Armorcraftiness`) &&
      !possessEquipment($item`painted shield`) &&
      myMeat() > 3500 &&
      itemAmount($item`painted turtle`) > 0 &&
      itemAmount($item`tenderizing hammer`) > 0
    ) {
      // Make Painted Shield - Requires an Adventure
    }
    if (
      haveSkill($skill`Armorcraftiness`) &&
      !possessEquipment($item`spiky turtle shield`) &&
      myMeat() > 3500 &&
      itemAmount($item`hedgeturtle`) > 1 &&
      itemAmount($item`tenderizing hammer`) > 0
    ) {
      // Make Spiky Turtle Shield - Requires an Adventure
    }
  }
  if (
    getPower(equippedItem($slot`pants`)) < 70 &&
    !possessEquipment($item`demonskin trousers`) &&
    myMeat() >= npcPrice($item`pants kit`) &&
    itemAmount($item`demon skin`) > 0 &&
    itemAmount($item`tenderizing hammer`) > 0 &&
    knollAvailable()
  ) {
    auto_buyUpTo(1, $item`pants kit`);
    autoCraft("smith", 1, $item`pants kit`, $item`demon skin`);
  }
  if (
    !possessEquipment($item`tighty whiteys`) &&
    myMeat() >= npcPrice($item`pants kit`) &&
    itemAmount($item`white snake skin`) > 0 &&
    itemAmount($item`tenderizing hammer`) > 0 &&
    knollAvailable()
  ) {
    auto_buyUpTo(1, $item`pants kit`);
    autoCraft("smith", 1, $item`pants kit`, $item`white snake skin`);
  }

  if (
    !possessEquipment($item`grumpy old man charrrm bracelet`) &&
    itemAmount($item`Jolly Roger charrrm bracelet`) > 0 &&
    itemAmount($item`grumpy old man charrrm`) > 0
  ) {
    use(1, $item`Jolly Roger charrrm bracelet`);
    use(1, $item`grumpy old man charrrm`);
  }

  if (
    !possessEquipment($item`booty chest charrrm bracelet`) &&
    itemAmount($item`Jolly Roger charrrm bracelet`) > 0 &&
    itemAmount($item`booty chest charrrm`) > 0
  ) {
    use(1, $item`Jolly Roger charrrm bracelet`);
    use(1, $item`booty chest charrrm`);
  }

  if (
    itemAmount($item`magical baguette`) > 0 &&
    !possessEquipment($item`loafers`)
  ) {
    visitUrl("inv_use.php?pwd=&which=1&whichitem=8167");
    runChoice(2);
  }
  if (
    itemAmount($item`magical baguette`) > 0 &&
    !possessEquipment($item`bread basket`)
  ) {
    visitUrl("inv_use.php?pwd=&which=1&whichitem=8167");
    runChoice(3);
  }
  if (
    itemAmount($item`magical baguette`) > 0 &&
    !possessEquipment($item`breadwand`)
  ) {
    visitUrl("inv_use.php?pwd=&which=1&whichitem=8167");
    runChoice(1);
  }

  if (
    knollAvailable() &&
    (haveSkill($skill`Torso Awareness`) || haveSkill($skill`Best Dressed`)) &&
    itemAmount($item`demon skin`) > 0 &&
    !possessEquipment($item`demonskin jacket`)
  ) {
    //Demonskin Jacket, requires an adventure, knoll available doesn\'t matter here...
  }

  if (in_koe()) {
    if (
      creatableAmount($item`antique accordion`) > 0 &&
      !possessEquipment($item`antique accordion`) &&
      auto_predictAccordionTurns() < 10
    ) {
      retrieveItem(1, $item`antique accordion`);
    }
    if (
      creatableAmount($item`low-pressure oxygen tank`) > 0 &&
      !possessEquipment($item`low-pressure oxygen tank`)
    ) {
      retrieveItem(1, $item`low-pressure oxygen tank`);
    }
  }

  LX_dolphinKingMap();
  auto_mayoItems();
  auto_checkTakerSpace();

  if (itemAmount($item`metal meteoroid`) > 0 && !in_tcrs()) {
    let it: Item = $item`meteorthopedic shoes`;
    if (!possessEquipment(it)) {
      const choice: number = 1 + toInt(it) - toInt($item`meteortarboard`);
      visitUrl("inv_use.php?pwd=&which=3&whichitem=9516");
      visitUrl(`choice.php?pwd=&whichchoice=1264&option=${choice}`);
    }

    it = $item`meteortarboard`;
    if (
      !possessEquipment(it) &&
      getPower(equippedItem($slot`hat`)) < 140 &&
      toInt(getProperty("auto_beatenUpCount")) >= 5
    ) {
      const choice: number = 1 + toInt(it) - toInt($item`meteortarboard`);
      visitUrl("inv_use.php?pwd=&which=3&whichitem=9516");
      visitUrl(`choice.php?pwd=&whichchoice=1264&option=${choice}`);
    }

    it = $item`meteorite guard`;
    if (
      !possessEquipment(it) &&
      !possessEquipment($item`KoL Con 13 snowglobe`) &&
      toInt(getProperty("auto_beatenUpCount")) >= 5
    ) {
      const choice: number = 1 + toInt(it) - toInt($item`meteortarboard`);
      visitUrl("inv_use.php?pwd=&which=3&whichitem=9516");
      visitUrl(`choice.php?pwd=&whichchoice=1264&option=${choice}`);
    }
  }

  {
    if (itemAmount($item`portable pantogram`) > 0) {
      switch (myDaycount()) {
        case 1:
          pantogramPants$1(myPrimestat(), $element`hot`, 1, 1, 1);
          break;
        default:
          pantogramPants$1(myPrimestat(), $element`cold`, 1, 2, 1);
          break;
      }
    }
    //set_property("_dailyCreates", true);
  }

  return false;
}
