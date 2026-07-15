import {
  abort,
  buy,
  ceil,
  cliExecute,
  council,
  create,
  getProperty,
  haveEffect,
  haveSkill,
  inHardcore,
  Item,
  itemAmount,
  Location,
  myDaycount,
  myMeat,
  myPath,
  myPrimestat,
  pullsRemaining,
  retrieveItem,
  runChoice,
  setProperty,
  splitString,
  toBoolean,
  toInt,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $elements,
  $item,
  $items,
  $location,
  $path,
  $skill,
  $slot,
  $stat,
} from "libram";

import {
  acquireOrPull,
  canPull$1,
  npcStoreDiscountMulti,
  pullXWhenHaveY,
} from "../auto_acquire";
import { autoAdv } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import {
  addToMaximize,
  autoEquip,
  possessEquipment,
  resetMaximize,
  simMaximizeWith,
  simValue,
} from "../auto_equipment";
import { acquireHP, acquireMP, uneffect } from "../auto_restore";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_log_info,
  auto_log_warning,
  elemental_resist_value,
  internalQuestStatus,
  setFlavour,
} from "../auto_util";
import { doHottub } from "../iotms/clan";
import { auto_beachCombHead, auto_canBeachCombHead } from "../iotms/mr2019";
import { auto_canUseJuneCleaver } from "../iotms/mr2022";
import { equipWarOutfit, haveWarOutfit } from "../quests/level_12";
import { needDigitalKey } from "../quests/level_13";

//Defined in autoscend/paths/kingdom_of_exploathing.ash
export function in_koe(): boolean {
  return myPath() === $path`Kingdom of Exploathing`;
}

export function koe_initializeSettings(): boolean {
  if (in_koe()) {
    setProperty("auto_bruteForcePalindome", inHardcore().toString());
    setProperty("auto_holeinthesky", false.toString());
    setProperty("auto_paranoia", (3).toString());
    setProperty("auto_skipL12Farm", "true");
    setProperty("auto_grimstoneOrnateDowsingRod", false.toString()); //location not reachable in koe
    setProperty("auto_grimstoneFancyOilPainting", false.toString()); //location not reachable in koe
    return true;
  }
  return false;
}

export function koe_rmi_count(): number {
  //counts how much [rare meat isotopes] you effectively have. since you can convert meat to rmi with no limit at a 1000 to 1 ratio
  return toInt(
    itemAmount($item`rare Meat isotope`) +
      myMeat() / (1000 * npcStoreDiscountMulti()),
  );
}

export function koe_acquire_rmi(target: number): boolean {
  //acquires target amount of rare meat isotopes by converting meat into rmi
  const it: Item = $item`rare Meat isotope`;
  if (itemAmount(it) >= target) {
    return true; //we already have the desired amount
  }
  if (koe_rmi_count() < target) {
    auto_log_warning(
      `We wanted to acquire ${target} [rare Meat Isotope] but were unable to convert enough meat to get them`,
      "red",
    );
    return false;
  }
  const need: number = target - itemAmount(it);
  auto_log_info(
    `Attempting to purchase ${need} [rare Meat Isotope] from [Cosmic Ray's Bazaar]`,
    "blue",
  );
  buy($coinmaster`Cosmic Ray's Bazaar`, need, it);
  return itemAmount(it) >= target;
}

export function LX_koeInvaderHandler(): boolean {
  if (!in_koe()) {
    return false;
  }
  if (toBoolean(getProperty("spaceInvaderDefeated"))) {
    // invader drops 10 white pixels so fight it before we do the hedge maze
    // as we need elemental resists for both and we may be able to get enough
    // pixels for the digital key if we still require them.
    return false;
  }

  if (haveEffect($effect`Flared Nostrils`) > 0) {
    doHottub();
  }
  uneffect($effect`Flared Nostrils`);
  if (haveEffect($effect`Flared Nostrils`) > 0) {
    // Delay until after the rest of the tower, I suppose
    return false;
  }

  buffMaintain$3($effect`Astral Shell`, 10, 1, 1);
  buffMaintain$3($effect`Elemental Saucesphere`, 10, 1, 1);
  buffMaintain$3($effect`Scariersauce`, 10, 1, 1);
  buffMaintain$3($effect`Scarysauce`, 10, 1, 1);
  buffMaintain$4($effect`Oiled-Up`);

  buffMaintain$4($effect`Minor Invulnerability`);
  buffMaintain$4($effect`Feeling Peaceful`);
  buffMaintain$4($effect`Covered in the Rainbow`);

  resetMaximize();

  if (acquireOrPull($item`meteorb`)) {
    autoEquip($slot`off-hand`, $item`meteorb`);
  }

  simMaximizeWith(Location.none, "200 all res");

  let damagePerRound: number = 0.0;
  const baseDamage: number = 1.0 - 0.1 * myDaycount();
  for (const el of $elements`cold, hot, sleaze, spooky, stench`) {
    const offset: number = auto_canBeachCombHead(el.toString()) ? 3.0 : 0.0;
    damagePerRound +=
      (baseDamage *
        (100.0 -
          elemental_resist_value(
            toInt(offset + simValue(`${el} Resistance`)),
          ))) /
      100.0;
  }
  auto_log_info(
    `The Invader: Expecting to take ${damagePerRound} damage per round`,
    "blue",
  );
  const turns: number = ceil(0.95 / damagePerRound);

  const damageCap: number = 100 * myDaycount();
  // It's easiest to kill the invader in two hits with the June cleaver and Lunging Thrust Smack
  if (
    haveSkill($skill`Lunging Thrust-Smack`) &&
    auto_is_valid$2($skill`Lunging Thrust-Smack`) &&
    auto_canUseJuneCleaver()
  ) {
    // To kill in 3 rounds, need 19 of each element, or 10 plus bend hell. Check we have it.
    let have_19_each: boolean = true;
    let have_10_each: boolean = true;
    for (const el of splitString("Cold;Hot;Sleaze;Spooky;Stench", ";")) {
      const damage_bonus: number = toInt(getProperty(`_juneCleaver${el}`));
      if (damage_bonus < 19) {
        have_19_each = false;
      }
      if (damage_bonus < 10) {
        have_10_each = false;
      }
    }
    // Cast bend hell if needed
    if (have_10_each) {
      if (
        haveSkill($skill`Bend Hell`) &&
        auto_is_valid$2($skill`Bend Hell`) &&
        !have_19_each
      ) {
        buffMaintain$4($effect`Bendin' Hell`);
      }
      if (haveEffect($effect`Bendin' Hell`) > 0) {
        have_19_each = true;
      }
    }
    // Actually go in for the kill
    if (have_19_each) {
      acquireMP(24, 0);
      auto_log_info(
        "Attacking the Invader, using June Cleaver and LTS.",
        "blue",
      );
      addToMaximize("200 all res, +equip june cleaver");
      const ret: boolean = autoAdv($location`The Invader`);
      if (haveEffect($effect`Beaten Up`) > 0) {
        abort("We died to the invader. Do it manually please?");
      }
      return ret;
    }
  }
  // End of the June cleaver logic. Try a spell instead?
  // How many damage sources do we need?
  if (
    haveSkill($skill`Weapon of the Pastalord`) &&
    auto_is_valid$2($skill`Weapon of the Pastalord`)
  ) {
    let sources: number = 2;
    let hot_source: Item = Item.none;
    if (
      itemAmount($item`big hot pepper`) > 0 &&
      auto_is_valid($item`big hot pepper`)
    ) {
      hot_source = $item`big hot pepper`;
      sources++;
    } else if (acquireOrPull($item`meteorb`)) {
      hot_source = $item`meteorb`;
      sources++;
    }

    if (sources * turns * damageCap >= 1000) {
      for (const el of $elements`cold, hot, sleaze, spooky, stench`) {
        auto_beachCombHead(el.toString());
      }
      // Meteorb/pepper is going to add +hot, so remove that
      setFlavour($element`cold`);
      buffMaintain$3($effect`Carol of the Hells`, 50, 1, 1);
      buffMaintain$3($effect`Song of Sauce`, 150, 1, 1);
      buffMaintain$4($effect`Glittering Eyelashes`);
      acquireMP(100, 0);

      auto_log_info(
        "Attacking the Invader, using Weapon of the Pastalord.",
        "blue",
      );
      // Use maximizer now that we are for sure fighting the Invader
      addToMaximize("200 all res");
      if (hot_source !== Item.none) {
        addToMaximize(`+equip ${hot_source.toString()}`);
      }

      const ret: boolean = autoAdv($location`The Invader`);
      if (haveEffect($effect`Beaten Up`) > 0) {
        abort("We died to the invader. Do it manually please?");
      }
      return ret;
    }
  }
  auto_log_warning(
    "I don't think we're ready to kill the invader yet.",
    "blue",
  );
  return false;
}

function koe_L12FoodSelect(): Item {
  //selects a desireable food item to toss at enemies during L12 war quest battlefield in koe
  let food_item: Item = Item.none;
  for (const it of $items`pie man was not meant to eat, spaghetti with Skullheads, gnocchetti di Nietzsche, spaghetti con calaveras, space chowder, spaghetti with ghost balls, crudles, agnolotti arboli, shells a la shellfish, linguini immondizia bianco, fettucini Inconnu, ghuol guolash, suggestive strozzapreti, fusilli marrownarrow`) {
    if (itemAmount(it) > 0) {
      food_item = it;
      break;
    }
  }
  return food_item;
}

export function koe_RationingOutDestruction(): void {
  //this function handles choiceAdventure1391 Rationing out Destruction.
  //a koe specific event where you sacrifice food items to score battlefield kills during the L12 quest.
  const food_item: Item = koe_L12FoodSelect();
  if (food_item === Item.none) {
    abort(
      "I am at the choice adventure and do not know what food I should kill my enemies with during L12 war quest",
    );
  }
  runChoice(1, `tossid=${toInt(food_item)}`);
}

export function L12_koe_clearBattlefield(): boolean {
  //kingdom of exploathing specific handling for clearing the battlefield.
  if (!in_koe()) {
    return false;
  }
  if (internalQuestStatus("questL12HippyFrat") !== 0) {
    //questL12War is used in most paths. but not used in koe except to set it to finished after you turn in the quest.
    //questL12HippyFrat is used exclusively in koe. it only has the values of: unstarted, started, finished.
    return false;
  }
  if (
    toInt(getProperty("hippiesDefeated")) >= 333 ||
    toInt(getProperty("fratboysDefeated")) >= 333
  ) {
    return false;
  }
  if (!haveWarOutfit(true)) {
    return false;
  }
  //turn in the quest if done
  if (itemAmount($item`solid gold bowling ball`) > 0) {
    council();
    if (internalQuestStatus("questL12HippyFrat") > 1) {
      return true;
    } else {
      cliExecute("refresh quests");
    }
    if (internalQuestStatus("questL12HippyFrat") < 2) {
      abort("Could not finish the L12 war quest for some reason");
    }
  }
  //prepare food to kill enemies with in the war. always keep a space chowder on hand if possible before going further. just in case.
  if (itemAmount($item`space chowder`) === 0 && koe_rmi_count() > 4) {
    retrieveItem(1, $item`space chowder`);
  }
  if (koe_L12FoodSelect() === Item.none) {
    abort(
      "I was unable to acquire a good food item to kill my enemies with in the L12 war quest",
    );
  }
  //equip yourself for the war
  equipWarOutfit();
  const warKillDoubler: Item =
    myPrimestat() === $stat`Mysticality`
      ? $item`Jacob's rung`
      : $item`haunted paddle-ball`;
  pullXWhenHaveY(warKillDoubler, 1, 0);
  if (possessEquipment(warKillDoubler)) {
    autoEquip($slot`weapon`, warKillDoubler);
  }

  return autoAdv($location`The Exploaded Battlefield`);
}

export function L12_koe_finalizeWar(): boolean {
  if (!in_koe()) {
    return false;
  }
  if (internalQuestStatus("questL12HippyFrat") !== 0) {
    //questL12War is used in most paths. but not used in koe except to set it to finished after you turn in the quest.
    //questL12HippyFrat is used exclusively in koe. it only has the values of: unstarted, started, finished.
    return false;
  }
  if (
    toInt(getProperty("hippiesDefeated")) < 333 &&
    toInt(getProperty("fratboysDefeated")) < 333
  ) {
    return false; //there are 333 of each enemy in koe. if either side had all 333 defeated then this will not return false here.
  }
  //koe does not have coin masters. there is nothing to sell here.
  equipWarOutfit();
  acquireHP();
  acquireMP(60);
  auto_log_info("Let's fight the final boss of the frat-hippy war!", "blue");
  const retval: boolean = autoAdv($location`The Exploaded Battlefield`);
  council(); //need to visit to grab 10 rare meat isotopes and get next quests
  cliExecute("refresh quests"); //needed to recognize that war is over
  if (!retval) {
    abort("failed to fight the final boss of the frat-hippy war");
  }
  if (getProperty("questL12War") !== "finished") {
    //only place this property is used in koe is when you turn in the quest to council.
    //which results in Preference questL12War changed from unstarted to finished
    abort(
      "I fought the final boss of L12 frat hippy war. I visited the council. and somehow the quest is still incomplete. something is wrong",
    );
  }
  return retval;
}

export function L13_koe_towerNSNagamar(): boolean {
  //acquire wand of nagamar for kingdom of exploathing path. bear verb orgy is unavailable in koe and some of the letters can not drop in run.
  if (!in_koe()) {
    return false;
  }
  if (!toBoolean(getProperty("auto_wandOfNagamar"))) {
    return false; //internal tracking says we do not want wand
  }
  if (itemAmount($item`Wand of Nagamar`) > 0) {
    //if we already have wand we should adjust our internal tracking to say so
    setProperty("auto_wandOfNagamar", false.toString());
    return false;
  }
  if (internalQuestStatus("questL13Final") < 11) {
    //step11 means ready to fight the sorceress. 12 means we lost once and unlocked bear verb orgy. except BVO is unavailable in koe
    return false;
  }
  //softcore it is cheaper to pull then craft the wand components. if we do not have enough pulls then buy it from ray's bazaar
  if (!inHardcore()) {
    if (canPull$1($item`WA`) && canPull$1($item`ND`) && pullsRemaining() > 1) {
      //need 2 pulls to get both
      acquireOrPull($item`WA`);
      acquireOrPull($item`ND`);
      if (create(1, $item`Wand of Nagamar`)) {
        return true;
      } else {
        abort(
          "I should be able to pull and assemble a wand of nagamar but mysteriously failed. Manually do so and run me again",
        );
      }
    } else {
      auto_log_warning(
        "I am unable to pull the components of the [wand of nagamar]. will try to buy it instead",
        "red",
      );
    }
  }

  if (koe_acquire_rmi(30)) {
    //it costs 30 rmi to get wand.
    auto_log_info(
      "attempting to buy [wand of nagamar] from [Cosmic Ray's Bazaar]",
      "blue",
    );
    buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`Wand of Nagamar`);
  } else {
    auto_log_info(
      "I was unable to acquire 30 [rare Meat isotope] needed for the [wand of nagamar]",
      "blue",
    );
  }

  if (itemAmount($item`Wand of Nagamar`) > 0) {
    return true;
  }
  abort("I failed to acquire [Wand of Nagamar]");
  return false; //must have return value even after an abort
}

export function koe_NeedWhitePixels(): boolean {
  if (!needDigitalKey()) {
    return false;
  }
  const pixels_needed: number = toBoolean(getProperty("spaceInvaderDefeated"))
    ? 30
    : 20;
  return itemAmount($item`white pixel`) < pixels_needed;
}
