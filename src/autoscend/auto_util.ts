import {
  abort,
  advCost,
  appearanceRates,
  append,
  autosell,
  availableAmount,
  availableChoiceOptions,
  buy,
  buyPrice,
  canadiaAvailable,
  canAdventure,
  canEquip,
  canInteract,
  changeMcd,
  chew,
  Class,
  cliExecute,
  cliExecuteOutput,
  containsText,
  craft,
  create,
  currentMcd,
  Effect,
  Element,
  equip,
  equippedAmount,
  equippedItem,
  Familiar,
  floor,
  fullnessLimit,
  getCampground,
  getIngredients,
  getMonsters,
  getPlayerId,
  getProperty,
  gnomadsAvailable,
  guildStoreAvailable,
  haveCampground,
  haveEffect,
  haveEquipped,
  haveOutfit,
  haveSkill,
  inBadMoon,
  indexOf,
  inebrietyLimit,
  inHardcore,
  isTrendy,
  isUnrestricted,
  Item,
  itemAmount,
  itemDropModifier,
  itemType,
  knollAvailable,
  lastIndexOf,
  length,
  lightningCost,
  Location,
  max,
  maximize,
  min,
  Modifier,
  Monster,
  monsterElement,
  monsterLevelAdjustment,
  mpCost,
  myAdventures,
  myAscensions,
  myBasestat,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myId,
  myInebriety,
  myLevel,
  myLightning,
  myLocation,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myRain,
  mySign,
  mySoulsauce,
  mySpleenUse,
  myThunder,
  myTurncount,
  nowToInt,
  npcPrice,
  numericModifier,
  Path,
  Phylum,
  print,
  printHtml,
  pullsRemaining,
  rainCost,
  removeProperty,
  replaceString,
  retrieveItem,
  reverseNumberology,
  rollover,
  round,
  setLocation,
  setProperty,
  Skill,
  Slot,
  soulsauceCost,
  spleenLimit,
  splitString,
  squareRoot,
  Stat,
  storageAmount,
  substring,
  thunderCost,
  timeToString,
  toBoolean,
  toBuffer,
  toClass,
  todayToString,
  toEffect,
  toElement,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  toMonster,
  toPhylum,
  toSkill,
  toSlot,
  toStat,
  turnsPerCast,
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
  $effects,
  $element,
  $elements,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $monsters,
  $path,
  $servant,
  $skill,
  $skills,
  $slot,
  $slots,
  $stat,
  $stats,
} from "libram";

import { LX_calculateTheUniverse } from "../autoscend";
import {
  acquireHermitItem,
  auto_buyUpTo,
  auto_mall_price,
  npcStoreDiscountMulti,
  pullXWhenHaveY,
} from "./auto_acquire";
import { autoAdvBypass, autoAdvBypass$2, CombatMacro } from "./auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "./auto_buff";
import {
  autoChew,
  autoDrink,
  fullness_left,
  inebriety_left,
  spleen_left,
  stomach_left,
} from "./auto_consume";
import {
  addToMaximize,
  auto_loadEquipped,
  auto_saveEquipped,
  autoEquip,
  autoEquip$1,
  ensureSealClubs,
  equipMaximizedGear,
  equipmentAmount,
  possessEquipment,
  possessOutfit$1,
  removeFromMaximize,
} from "./auto_equipment";
import {
  auto_famWeight$1,
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
  haveSpleenFamiliar,
  is100FamRun,
} from "./auto_familiar";
import { auto_sortedByModifier$3, List$8 } from "./auto_list";
import { providePlusCombat$3, providePlusNonCombat$3 } from "./auto_providers";
import { acquireMP, uneffect } from "./auto_restore";
import { solveDelayZone$1 } from "./auto_routing";
import { zone_hasLuckyAdventure } from "./auto_zone";
import { kmailObject } from "./autoscend_record";
import {
  banisherCombatString$2,
  banisherCombatString$3,
  canUse,
  canUse$3,
  getCopier,
  getSniffer,
  replaceMonsterCombatString$1,
  useItem$1,
  yellowRayCombatString,
} from "./combat/auto_combat_util";
import { auto_get_clan_lounge, handleFaxMonster } from "./iotms/clan";
import { auto_hasNavelRing, auto_navelFreeRunChance } from "./iotms/mr2007";
import {
  expectGhostReport,
  haveGhostReport,
  isOverdueDigitize,
  timeSpinnerCombat$1,
} from "./iotms/mr2016";
import {
  asdonBuff,
  auto_breatheOutsLeft,
  auto_haveGenieBottleOrPocketWishes,
  auto_wishesAvailable,
  canGenieCombat,
  makeGenieCombat,
  makeGenieWish$1,
} from "./iotms/mr2017";
import { auto_latteDropAvailable, auto_voteMonster$1 } from "./iotms/mr2018";
import {
  auto_havePillKeeper,
  auto_pillKeeper$1,
  auto_pillKeeperAvailable,
  auto_pillKeeperFreeUseAvailable,
  auto_pillKeeperUses,
  auto_sausageGoblin,
} from "./iotms/mr2019";
import {
  auto_cargoShortsOpenPocket$2,
  auto_configureRetrocape,
  auto_forceEquipPowerfulGlove,
  auto_hasRetrocape,
} from "./iotms/mr2020";
import {
  auto_backupTarget,
  auto_backupUsesLeft,
  auto_getBattery,
} from "./iotms/mr2021";
import {
  auto_configureParka,
  auto_fightLocketMonster,
  auto_hasAutumnaton,
  auto_hasParka,
  auto_haveCombatLoversLocket,
  auto_haveGreyGoose,
  auto_haveTrainSet,
  auto_monsterInLocket,
  auto_ParkaSpikeForcesLeft,
  auto_voidMonster,
} from "./iotms/mr2022";
import {
  auto_canHabitat,
  auto_cinchForcesLeft,
  auto_getCinch,
  auto_habitatMonster,
  auto_haveAugustScepter,
  auto_haveCincho,
  auto_haveMonkeyPaw,
  auto_makeMonkeyPawWish,
  auto_monkeyPawWishesLeft,
} from "./iotms/mr2023";
import {
  auto_AprilSaxLuckyLeft,
  auto_AprilTubaForcesLeft,
  auto_haveAprilingBandHelmet,
  auto_haveRoman,
  auto_haveSpringShoes,
  auto_meggFight,
  auto_playAprilSax,
  auto_playAprilTuba,
} from "./iotms/mr2024";
import {
  auto_equipAprilShieldBuff,
  auto_haveAprilShowerShield,
  auto_haveMcHugeLargeSkis,
  auto_McLargeHugeForcesLeft,
  auto_punchOutsLeft,
  auto_wantToBCZ,
} from "./iotms/mr2025";
import { auto_heartstoneLuckRemaining } from "./iotms/mr2026";
import {
  ARBSupplyDrop,
  auto_ARBSupplyDropsLeft,
  auto_canARBSupplyDrop,
  auto_haveARB,
} from "./iotms/ttt";
import { handleServant, isActuallyEd } from "./paths/actually_ed_the_undying";
import { in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import { borisAdjustML, is_boris } from "./paths/avatar_of_boris";
import { is_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { in_aosol } from "./paths/avatar_of_shadows_over_loathing";
import { is_pete, pete_peelOutRemaining } from "./paths/avatar_of_sneaky_pete";
import { bhy_is_item_valid, bhy_usable, in_bhy } from "./paths/bees_hate_you";
import { inAftercore } from "./paths/casual";
import { in_class_act } from "./paths/class_act";
import { in_class_act_two } from "./paths/class_act_two";
import { bat_skillValid, in_darkGyffte } from "./paths/dark_gyffte";
import { glover_usable, in_glover } from "./paths/g_lover";
import { in_heavyrains, rainManSummon } from "./paths/heavy_rains";
import {
  iluh_famAllowed,
  iluh_foodConsumable,
  in_iluh,
} from "./paths/i_love_u_hate";
import { in_journeyman } from "./paths/journeyman";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { in_kolhs } from "./paths/kolhs";
import { auto_ItemToReplica, in_lol } from "./paths/legacy_of_loathing";
import { in_lar } from "./paths/live_ascend_repeat";
import { in_nuclear } from "./paths/nuclear_autumn";
import { in_ocrs } from "./paths/one_crazy_random_summer";
import { in_plumber, plumber_skillValid } from "./paths/path_of_the_plumber";
import { in_picky } from "./paths/picky";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_small } from "./paths/small";
import { tcrs_maximize_with_items } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
  wereprof_usable,
} from "./paths/wereprofessor";
import { in_wildfire } from "./paths/wildfire";
import { in_robot, robot_cpu } from "./paths/you_robot";
import { in_zombieSlayer, zombieSlayer_usable } from "./paths/zombie_slayer";
import {
  getZooKickBanish,
  getZooKickInstaKill,
  getZooKickSniff,
  getZooKickYR,
  in_zootomist,
} from "./paths/zootomist";
import { fastenerCount, lumberCount } from "./quests/level_09";
import { auto_warSide } from "./quests/level_12";
import { needStarKey } from "./quests/level_13";
import { candyBlock } from "./quests/level_any";
import { AshMatcher } from "./utils/kolmafiaUtils";
import { fileAsMap } from "./utils/kolmafiaUtils";

//A file full of utility functions which we import into autoscend.ash

export function auto_combatModCap(): number {
  return 32;
}

export function almostRollover(): boolean {
  const warning_time: number =
    toInt(getProperty("auto_stopMinutesToRollover")) * 60;
  const remaining_time: number = rollover() - nowToInt() / 1000;
  if (remaining_time - 300 < warning_time) {
    // Only print debug messages less than 5 minutes before emergency bedtime
    auto_log_debug(
      `Less than ${remaining_time / 60 + 1} min until rollover, bedtime at ${warning_time / 60} min`,
      "blue",
    );
  }
  return remaining_time <= warning_time;
}

export function needToConsumeForEmergencyRollover(): boolean {
  let max_bonus_adv: number = round(numericModifier("adventures"));
  for (const [, rec] of maximize("adventures", 0, 0, true, true).entries()) {
    if (rec.item !== Item.none) {
      max_bonus_adv += toInt(rec.score);
    }
  }
  const target_adv: number = 130 - max_bonus_adv;
  auto_log_debug(
    `Max bonus rollover adv: ${max_bonus_adv}, target adv: ${target_adv}`,
    "blue",
  );
  return myAdventures() < target_adv;
}

export function autoMaximize(req: string, simulate: boolean): boolean {
  if (!simulate) {
    debugMaximize(req, 0);
    tcrs_maximize_with_items(req);
  }
  return maximize(req, simulate);
}

export function autoMaximize$1(
  req: string,
  maxPrice: number,
  priceLevel: number,
  simulate: boolean,
): boolean {
  if (!simulate) {
    debugMaximize(req, maxPrice);
    tcrs_maximize_with_items(req);
  }
  return maximize(req, maxPrice, priceLevel, simulate);
}

function debugMaximize(req: string, meat: number): void {
  //This function will be removed.
  if (indexOf(req, "-tie") === -1) {
    req = `${req} -tie`;
    auto_log_debug("Added -tie to maximize", "red");
  }
  auto_log_info(`Desired maximize: ${req}`, "blue");
  let situation: string = ` ${myClass()} ${myPath().name} ${mySign()}`;
  if (inHardcore()) {
    situation = `Hardcore${situation}`;
  } else {
    situation = `Softcore${situation}`;
  }
  situation += ` ${todayToString()} ${timeToString()}`;
  const acquired: Map<Effect, boolean> = new Map();
  acquired.set(Effect.none, true);
  let tableDo: string = `<table border=1><tr><td colspan=3>Accepted: Maximizing: ${req}</td><td colspan=3>${situation}</td></tr>`;
  let tableDont: string = `<table border=1><tr><td colspan=3>Rejected: Maximizing: ${req}</td><td colspan=3>${situation}</td></tr>`;
  tableDo +=
    "<tr><td>Score</td><td>Effect</td><td>Command</td><td>Skill</td><td>Item</td><td>Display</td></tr>";
  tableDont +=
    "<tr><td>Score</td><td>Effect</td><td>Command</td><td>Skill</td><td>Item</td><td>Display</td></tr>";

  for (const [, entry] of maximize(req, 0, 0, true, true).entries()) {
    let output: string = "";

    entry.display = replaceString(entry.display, "<html>", "");
    entry.display = replaceString(entry.display, "</html>", "");

    if (entry.skill !== Skill.none) {
      output += `Skill(${entry.skill}) `;
    }
    if (entry.command !== "") {
      output += `Command(${entry.command}) `;
    }
    const display: string = `Display(${entry.display}) `;
    if (entry.item !== Item.none) {
      output += `Item(${entry.item}) `;
    }
    if (entry.effect !== Effect.none) {
      output += `Effect(${entry.effect}) `;
    }
    output += `Score(${entry.score})`;

    let doThis: boolean = true;
    if (entry.score <= 0) {
      doThis = false;
    }
    if (indexOf(entry.command, "uneffect ") === 0) {
      doThis = false;
    }
    if (indexOf(entry.display, "uneffect ") === 0) {
      doThis = false;
    }
    if (indexOf(entry.display, "<font color=gray>") !== -1) {
      doThis = false;
    }
    if (entry.skill !== Skill.none) {
      if (turnsPerCast(entry.skill) <= 0) {
        doThis = false;
      }
      if (advCost(entry.skill) > 0) {
        doThis = false;
      }
      if (lightningCost(entry.skill) > myLightning()) {
        doThis = false;
      }
      if (mpCost(entry.skill) > myMp()) {
        doThis = false;
      }
      if (rainCost(entry.skill) > myRain()) {
        doThis = false;
      }
      if (soulsauceCost(entry.skill) > mySoulsauce()) {
        doThis = false;
      }
      if (thunderCost(entry.skill) > myThunder()) {
        doThis = false;
      }
    } else {
      //If not a skill, is it an item?
      if (entry.item !== Item.none) {
        if (indexOf(entry.display, "drink ") === 0) {
          doThis = false;
        }
        if (indexOf(entry.display, "eat ") === 0) {
          doThis = false;
        }
        if (indexOf(entry.display, "play ") === 0) {
          doThis = false;
        }
        if (indexOf(entry.display, "bind ") === 0) {
          doThis = false;
        }
        if (indexOf(entry.display, "cast 1 Bind ") === 0) {
          doThis = false;
        }
        if (indexOf(entry.display, "chew ") === 0) {
          doThis = false;
        }
        //				if(entry.display.index_of("...or ")===0)
        //				{
        //					doThis = false;
        //				}
        //Mafia likes to recommend pirate Ephemera that we can not buy.
        if (
          $items`pirate tract, pirate pamphlet, pirate brochure`.includes(
            entry.item,
          ) &&
          (myAscensions() !== toInt(getProperty("lastPirateEphemeraReset")) ||
            entry.item !== toItem(getProperty("lastPirateEphemera")))
        ) {
          doThis = false;
        }

        if (indexOf(entry.display, "make ") === 0) {
          //We can this make item.
          doThis = false;
        }
        if (indexOf(entry.display, "use ") === 0) {
          //We have this item
        }
        if (indexOf(entry.display, "buy ") === 0) {
          //We can buy this item
          if (npcPrice(entry.item) > meat) {
            doThis = false;
          }
        }
      } else {
        //Not a skill or item, what is it?
        if (indexOf(entry.display, "telescope ") === 0) {
        } else if (indexOf(entry.display, "grim init ") === 0) {
        } else if (indexOf(entry.display, "unequip ") === 0) {
        } else if (indexOf(entry.display, "familiar ") === 0) {
        } else if (indexOf(entry.display, "bjorn ") === 0) {
        } else {
          doThis = false;
        }
      }
    }

    if (acquired.has(entry.effect) && entry.effect !== Effect.none) {
      doThis = false;
    }
    if (entry.effect !== Effect.none && haveEffect(entry.effect) > 0) {
      doThis = false;
    }

    let curTable: string = `<td>${entry.score}</td>`;
    curTable += `<td>${entry.effect}</td>`;
    curTable += `<td>&nbsp;${entry.command}</td>`;
    curTable += `<td>${entry.skill}</td>`;
    curTable += `<td>${entry.item}</td>`;
    curTable += `<td>&nbsp;${entry.display}</td>`;

    if (doThis) {
      //use_skill(1, entry.skill);
      acquired.set(entry.effect, true);
      output = `USE: ${output}`;
      tableDo += `<tr>${curTable}</tr>`;
    } else {
      output = `REJECT: ${output}`;
      tableDont += `<tr>${curTable}</tr>`;
    }
    auto_log_info(output, "blue");
    auto_log_info(display, "green");
  }

  tableDo += "</table>";
  tableDont += "</table>";
  printHtml(tableDo);
  printHtml(tableDont);
  //	A successive print will help make the table readable in cases where it is not rendered properly
  //cli_execute("ashref get_inventory");
}

export function trim(input: string): string {
  return input.trim();
}

function safeString(input: string): string {
  return input.replaceAll(/[,:]/g, ".");
}

export function handleTracker(used: string, tracker: string): void {
  let cur: string = getProperty(tracker);
  if (cur !== "") {
    cur = `${cur}, `;
  }
  cur = `${cur}(${myDaycount()}:${safeString(used)}:${myTurncount()})`;
  setProperty(tracker, cur);
}

export function handleTracker$1(
  used: string,
  detail: string,
  tracker: string,
): void {
  let cur: string = getProperty(tracker);
  if (cur !== "") {
    cur = `${cur}, `;
  }
  cur = `${cur}(${myDaycount()}:${safeString(used)}:${safeString(detail)}:${myTurncount()})`;
  setProperty(tracker, cur);
}

export function handleTracker$2(
  used: string,
  loc: string,
  detail: string,
  tracker: string,
): void {
  let cur: string = getProperty(tracker);
  if (cur !== "") {
    cur = `${cur}, `;
  }
  if (loc === "none") {
    handleTracker$1(used, detail, tracker);
    return;
  }
  cur = `${cur}(${myDaycount()}:${safeString(used)}:${safeString(loc)}:${safeString(detail)}:${myTurncount()})`;
  setProperty(tracker, cur);
}

export function organsFull(): boolean {
  if (myFullness() < fullnessLimit()) {
    return false;
  }
  if (myInebriety() < inebrietyLimit()) {
    return false;
  }
  if (mySpleenUse() < spleenLimit()) {
    return false;
  }
  return true;
}

export function backupSetting(setting: string, newValue: string): boolean {
  const defaults: Map<string, Map<string, string>> = fileAsMap(
    "data/defaults.txt",
    [String, String, String],
  );

  let found: number = 0;
  let oldValue: string = "";
  for (const [, _v0] of defaults) {
    for (const [name] of _v0) {
      if (name === setting) {
        found = 1;
        oldValue = getProperty(name);
      }
    }
  }

  if (oldValue === "") {
    oldValue = "__BLANK__";
  }

  if (found === 1) {
    if (getProperty(setting) === newValue) {
      return false;
    }

    if (getProperty(`auto_backup_${setting}`) === "") {
      setProperty(`auto_backup_${setting}`, oldValue);
    }
    setProperty(setting, newValue);
    return true;
  }
  setProperty(setting, newValue);
  return false;
}

export function restoreAllSettings(): boolean {
  const defaults: Map<string, Map<string, string>> = fileAsMap(
    "data/defaults.txt",
    [String, String, String],
  );

  let retval: boolean = false;
  for (const [, _v0] of defaults) {
    for (const [name] of _v0) {
      retval = toBoolean(toInt(retval) | toInt(restoreSetting(name)));
    }
  }

  return retval;
}

export function restoreSetting(setting: string): boolean {
  if (getProperty(`auto_backup_${setting}`) !== "") {
    if (getProperty(`auto_backup_${setting}`) === "__BLANK__") {
      setProperty(setting, "");
    } else {
      setProperty(setting, getProperty(`auto_backup_${setting}`));
    }
    removeProperty(`auto_backup_${setting}`);
    return true;
  }

  return false;
}

export function loopHandler(
  turnSetting: string,
  counterSetting: string,
  abortMessage: string,
  threshold: number,
): boolean {
  if (myTurncount() === toInt(getProperty(turnSetting))) {
    setProperty(
      counterSetting,
      (toInt(getProperty(counterSetting)) + 1).toString(),
    );
    if (toInt(getProperty(counterSetting)) > threshold) {
      abort(abortMessage);
    }
    return true;
  } else {
    setProperty(turnSetting, myTurncount().toString());
    setProperty(counterSetting, (0).toString());
  }
  return false;
}

function loopHandlerDelay(counterSetting: string): boolean {
  return loopHandlerDelay$1(counterSetting, 3);
}

function loopHandlerDelay$1(
  counterSetting: string,
  threshold: number,
): boolean {
  if (toInt(getProperty(counterSetting)) >= threshold) {
    setProperty(
      counterSetting,
      (toInt(getProperty(counterSetting)) - 1).toString(),
    );
    return true;
  }
  return false;
}

export function loopHandlerDelayAll(): boolean {
  const boo: boolean = loopHandlerDelay("_auto_lastABooCycleFix");
  const digitize: boolean = loopHandlerDelay("_auto_digitizeAssassinCounter");
  return boo || digitize;
}

export function banishedMonsters(): Map<Monster, number> {
  const retval: Map<Monster, number> = new Map();
  const data: Map<number, string> = new Map(
    splitString(getProperty("banishedMonsters"), ":").map((_v, _i) => [_i, _v]),
  );

  if (getProperty("banishedMonsters") === "") {
    return retval;
  }

  let i: number = 0;
  while (i < data.size) {
    retval.set(
      toMonster(data.get(i) ?? data.set(i, "").get(i)),
      toInt(data.get(i + 2) ?? data.set(i + 2, "").get(i + 2)),
    );
    i += 3;
  }

  return retval;
}

export function autoCraft(
  mode: string,
  count_1: number,
  item1: Item,
  item2: Item,
): number {
  if (mode === "combine" && !knollAvailable()) {
    if (myMeat() < 10 * count_1) {
      auto_log_warning(
        `Count not combine ${item1} and ${item2} due to lack of meat paste.`,
        "red",
      );
      return 0;
    }
    const need: number = max(0, count_1 - itemAmount($item`meat paste`));
    if (need > 0) {
      cliExecute(`make ${need} meat paste`);
    }
  }
  return craft(mode, count_1, item1, item2);
}

export function internalQuestStatus(prop: string): number {
  const status: string = getProperty(prop);
  if (status === "unstarted") {
    return -1;
  }
  if (status === "started") {
    return 0;
  }
  if (status === "finished") {
    //Does not handle quests with over 9998 steps. That\'s the Gnome letter quest, yes?
    return 9999;
  }
  const my_element: AshMatcher = new AshMatcher("step(\\d+)", status);
  if (my_element.find()) {
    return toInt(my_element.group(1));
  }
  return -1;
}

export function canYellowRay(target: Monster): boolean {
  // Use this to determine if it is safe to enter a yellow ray combat.

  if (in_pokefam()) {
    return false;
  }

  if (haveEffect($effect`Everything Looks Yellow`) <= 0) {
    // parka has 100 turn cooldown, but is a free-kill and has 0 meat cost, so prioritised over yellow rocket
    if (
      auto_hasParka() &&
      auto_is_valid$2($skill`Spit jurassic acid`) &&
      hasTorso()
    ) {
      return (
        yellowRayCombatString(
          target,
          false,
          $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
            target,
          ),
        ) !== ""
      );
    }
    // Get a yellow rocket if we don't have a parka
    if (
      itemAmount($item`Clan VIP Lounge key`) > 0 &&
      toBoolean(
        // Need VIP access
        getProperty("_fireworksShop"),
      ) &&
      itemAmount(
        // in a clan that has the Underground Fireworks Shop
        $item`yellow rocket`,
      ) === 0 &&
      auto_is_valid(
        // Don't buy if we already have one
        $item`yellow rocket`,
      ) &&
      myMeat() >
        npcPrice(
          // or if it's not valid
          $item`yellow rocket`,
        ) +
          meatReserve()
    ) {
      cliExecute(`acquire ${$item`yellow rocket`}`);
    }
    // Yellow rocket has the lowest cooldown, and is unlimited, so prioritize over other sources
    if (
      itemAmount($item`yellow rocket`) > 0 &&
      auto_is_valid($item`yellow rocket`) &&
      yellowRayCombatString(
        target,
        false,
        $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
          target,
        ),
      ) !== ""
    ) {
      return true;
    }
    // acquire a spitball if we haven't gotten any of the above
    if (
      auto_haveAprilShowerShield() &&
      itemAmount(
        //need April Shower Thoughts Shield
        $item`spitball`,
      ) === 0 &&
      auto_is_valid(
        //don't buy if we already have one
        $item`spitball`,
      ) &&
      itemAmount(
        //or if it's not valid
        $item`glob of wet paper`,
      ) > 0
    ) {
      //need at least 1 glob of wet paper to buy one
      if (buy($coinmaster`Using your Shower Thoughts`, 1, $item`spitball`)) {
        handleTracker$1(
          $item`April Shower Thoughts shield`.toString(),
          $item`spitball`.toString(),
          "auto_iotm_claim",
        );
      }
    }
    // Spitball from April Shower Thoughts Shiled has a 100 turn cd, but is a free-kill but is not unlimited
    if (auto_is_valid($item`spitball`) && itemAmount($item`spitball`) > 0) {
      return (
        yellowRayCombatString(
          target,
          false,
          $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
            target,
          ),
        ) !== ""
      );
    }
    // roman candelabra, also a 75 turn cooldown
    if (
      auto_haveRoman() &&
      auto_can_equip($item`Roman Candelabra`) &&
      auto_is_valid$2($skill`Blow the Yellow Candle!`)
    ) {
      return (
        yellowRayCombatString(
          target,
          false,
          $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
            target,
          ),
        ) !== ""
      );
    }

    if (auto_hasRetrocape()) {
      return (
        yellowRayCombatString(
          target,
          false,
          $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
            target,
          ),
        ) !== ""
      );
    }

    if (canChangeToFamiliar($familiar`Crimbo Shrub`)) {
      if (itemAmount($item`box of old Crimbo decorations`) === 0) {
        const curr: Familiar = myFamiliar();
        useFamiliar($familiar`Crimbo Shrub`);
        useFamiliar(curr);
      }
      if (
        getProperty("shrubGifts") !== "yellow" &&
        !toBoolean(getProperty("_shrubDecorated"))
      ) {
        visitUrl("inv_use.php?pwd=&which=3&whichitem=7958");
        visitUrl(
          "choice.php?pwd=&whichchoice=999&option=1&topper=1&lights=1&garland=1&gift=1",
        );
      }
    }

    if (
      !toBoolean(getProperty("_internetViralVideoBought")) &&
      itemAmount(
        //can only buy 1 per day
        $item`BACON`,
      ) >= 20 &&
      auto_is_valid(
        //it costs 20 bacon
        $item`viral video`,
      ) &&
      !in_koe()
    ) {
      //bacon store is unreachable in kingdom of exploathing
      //do not bother buying it if it is not valid
      create(1, $item`viral video`);
    }
  }
  // Pulled Yellow Taffy	- How do we handle the underwater check?
  // He-Boulder?			- How do we do this?
  return (
    yellowRayCombatString(
      target,
      false,
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
        target,
      ),
    ) !== ""
  );
}

export function canYellowRay$1(): boolean {
  return canYellowRay(Monster.none);
}

export function auto_combat_appearance_rates(
  place: Location,
  queue: boolean,
): Map<Monster, number> {
  //return probability of fighting each monster if the encounter is not a noncombat
  //appearance_rates includes noncombat chance for $monster[none]
  const res_including_noncombat: Map<Monster, number> = new Map(
    Object.entries(appearanceRates(place, queue)).map(([_k, _v]) => [
      Monster.get(_k),
      _v,
    ]),
  );
  const res_excluding_noncombat: Map<Monster, number> = new Map();

  const noncombat_frequency: number =
    res_including_noncombat.get(Monster.none) ??
    res_including_noncombat.set(Monster.none, 0.0).get(Monster.none);
  if (noncombat_frequency === 0 || noncombat_frequency >= 100) {
    return res_including_noncombat;
  }

  for (const [mob, freq] of res_including_noncombat) {
    if (mob !== Monster.none) {
      res_excluding_noncombat.set(
        mob,
        (freq / (100 - noncombat_frequency)) * 100,
      );
    }
  }
  return res_excluding_noncombat;
}

export function auto_combat_appearance_rates$1(
  place: Location,
): Map<Monster, number> {
  return auto_combat_appearance_rates(place, false);
}

export function auto_zonePhylumPercent(loc: Location, phyl: Phylum): number {
  //Looks at potential monsters in a zone and returns the % of them that match the phylum
  let count_1: number = 0;
  let total: number = 0;
  for (const [mon, freq] of auto_combat_appearance_rates$1(loc)) {
    if (freq <= 0) {
      continue;
    }
    if (mon.phylum === phyl) {
      count_1 += 1;
    }
    total += 1;
  }
  if (total === 0) {
    return 0;
  }
  return count_1 / total;
}

export function auto_banishesUsedAt(loc: Location): Map<string, boolean> {
  function auto_reallyBanishesUsedAt(loc: Location): Map<string, boolean> {
    const banished: string = getProperty("banishedMonsters");
    const banishList: Map<number, string> = new Map(
      splitString(banished, ":").map((_v, _i) => [_i, _v]),
    );
    const atLoc: Map<number, Monster> = new Map(
      getMonsters(loc).map((_v, _i) => [_i, _v]),
    );
    const used: Map<string, boolean> = new Map();

    for (let i: number = 0; i + 1 < banishList.size; i = i + 3) {
      const curMon: Monster = toMonster(
        banishList.get(i) ?? banishList.set(i, "").get(i),
      );
      const curUsed: string =
        banishList.get(i + 1) ?? banishList.set(i + 1, "").get(i + 1);

      for (let j: number = 0; j < atLoc.size; j++) {
        if ((atLoc.get(j) ?? atLoc.set(j, Monster.none).get(j)) === curMon) {
          used.set(curUsed, true);
        }
      }
    }
    return used;
  }

  if (
    $locations`Next to that Barrel with Something Burning in it, Out by that Rusted-Out Car, Over Where the Old Tires Are, Near an Abandoned Refrigerator`.includes(
      loc,
    )
  ) {
    const gremlinBanishes: Map<string, boolean> = new Map();
    for (const l of $locations`Next to that Barrel with Something Burning in it, Out by that Rusted-Out Car, Over Where the Old Tires Are, Near an Abandoned Refrigerator`) {
      const used: Map<string, boolean> = auto_reallyBanishesUsedAt(l);
      for (const s of used.keys()) {
        gremlinBanishes.set(s, true);
      }
    }
    return gremlinBanishes;
  }
  return auto_reallyBanishesUsedAt(loc);
}

export function auto_wantToBanish(enemy: Monster, loc: Location): boolean {
  if ((appearanceRates(loc)[enemy.toString()] ??= 0.0) <= 0) {
    return false;
  }
  const locCache: Location = myLocation();
  setLocation(loc);
  const monstersToBanish: Map<Monster, boolean> = auto_getMonsters("banish");
  setLocation(locCache);
  return (
    monstersToBanish.get(enemy) ?? monstersToBanish.set(enemy, false).get(enemy)
  );
}

export function auto_wantToBanish$1(
  enemyphylum: Phylum,
  loc: Location,
): boolean {
  if (toBoolean(getProperty("auto_dontPhylumBanish"))) {
    return false;
  }
  const locCache: Location = myLocation();
  setLocation(loc);
  const phylumToBanish: Map<Phylum, boolean> = auto_getPhylum("banish");
  setLocation(locCache);
  return (
    phylumToBanish.get(enemyphylum) ??
    phylumToBanish.set(enemyphylum, false).get(enemyphylum)
  );
}

function canBanish(enemy: Monster, loc: Location): boolean {
  return banisherCombatString$3(enemy, loc) !== "";
}

function canBanish$1(enemyphylum: Phylum, loc: Location): boolean {
  return banisherCombatString$2(enemyphylum, loc) !== "";
}

function adjustForBanish(combat_string: string): boolean {
  if (combat_string === `skill${$skill`%fn, Release the Patriotic Screech!`}`) {
    return useFamiliar($familiar`Patriotic Eagle`);
  }
  if (combat_string === `skill${$skill`Mark Your Territory`}`) {
    return autoDrink(1, $item`pheromone cocktail`);
  }
  if (combat_string === `skill ${$skill`Throw Latte on Opponent`}`) {
    return autoEquip$1($item`latte lovers member's mug`);
  }
  if (combat_string === `skill ${$skill`Give Your Opponent the Stinkeye`}`) {
    return autoEquip$1($item`stinky cheese eye`);
  }
  if (combat_string === `skill ${$skill`Creepy Grin`}`) {
    return autoEquip$1($item`V for Vivala mask`);
  }
  if (combat_string === `skill ${$skill`Show them your ring`}`) {
    return autoEquip$1($item`mafia middle finger ring`);
  }
  if (combat_string === `skill ${$skill`Batter Up!`}`) {
    cliExecute("acquire 1 seal-clubbing club");
    ensureSealClubs();
    return true;
  }
  if (combat_string === `skill ${$skill`Talk About Politics`}`) {
    return autoEquip$1($item`Pantsgiving`);
  }
  if (combat_string === `skill ${$skill`Reflex Hammer`}`) {
    return autoEquip$1($item`Lil' Doctor™ bag`);
  }
  if (combat_string === `skill ${$skill`Show your boring familiar pictures`}`) {
    return autoEquip$1($item`familiar scrapbook`);
  }
  if (combat_string === `skill ${$skill`Spring Kick`}`) {
    return autoEquip$1($item`spring shoes`);
  }
  if (combat_string === `skill ${$skill`Use the Force`}`) {
    return autoEquip(
      $slot`weapon`,
      wrap_item($item`Fourth of May Cosplay Saber`),
    );
  }
  if (combat_string === `skill ${$skill`KGB tranquilizer dart`}`) {
    return autoEquip$1($item`Kremlin's Greatest Briefcase`);
  }
  if (combat_string === `skill ${$skill`Beancannon`}`) {
    for (const beancan of $items`Frigid Northern Beans, Heimz Fortified Kidney Beans, Hellfire Spicy Beans, Mixed Garbanzos and Chickpeas, Pork 'n' Pork 'n' Pork 'n' Beans, Shrub's Premium Baked Beans, Tesla's Electroplated Beans, Trader Olaf's Exotic Stinkbeans, World's Blackest-Eyed Peas`) {
      if (autoEquip$1(beancan)) {
        return true;
      }
    }
    return false;
  }
  if (combat_string === `skill ${$skill`Monkey Slap`}`) {
    return autoEquip$1($item`cursed monkey's paw`);
  }
  if (combat_string === `skill ${$skill`Sea *dent: Throw a Lightning Bolt`}`) {
    return autoEquip$1($item`Monodent of the Sea`);
  }
  if (
    combat_string === `item ${$item`handful of split pea soup`}` &&
    itemAmount($item`handful of split pea soup`) === 0
  ) {
    return create(1, $item`handful of split pea soup`);
  }
  if (
    combat_string === `skill ${$skill`Breathe Out`}` &&
    auto_breatheOutsLeft() === 0 &&
    availableAmount($item`hot jelly`) > 0 &&
    spleen_left() > 1
  ) {
    return autoChew(1, $item`hot jelly`);
  }
  if (
    combat_string === `skill ${$skill`Punch Out your Foe`}` &&
    auto_punchOutsLeft() === 0 &&
    availableAmount($item`scoop of pre-workout powder`) > 0 &&
    spleen_left() > 3
  ) {
    return autoChew(1, $item`scoop of pre-workout powder`);
  }
  return true;
}

export function adjustForBanishIfPossible(
  enemy: Monster,
  loc: Location,
): boolean {
  if (canBanish(enemy, loc)) {
    const banish_string: string = banisherCombatString$3(enemy, loc);
    auto_log_info(
      `Adjusting to have banisher available for ${enemy}: ${banish_string}`,
      "blue",
    );
    return adjustForBanish(banish_string);
  }
  return false;
}

export function adjustForBanishIfPossible$1(
  enemyphylum: Phylum,
  loc: Location,
): boolean {
  if (canBanish$1(enemyphylum, loc)) {
    const banish_string: string = banisherCombatString$2(enemyphylum, loc);
    auto_log_info(
      `Adjusting to have phylum banisher available for ${enemyphylum}: ${banish_string}`,
      "blue",
    );
    return adjustForBanish(banish_string);
  }
  return false;
}
export function auto_forceFreeRun(combat: boolean): boolean {
  if (toBoolean(getProperty("auto_forceFreeRun")) && combat) {
    setProperty("auto_forceFreeRun", false.toString()); //want to reset as soon as we see it as true while in combat
    return true;
  }
  if (toBoolean(getProperty("auto_forceFreeRun"))) {
    //don't need to reset it because we haven't taken a turn to freeRun yet
    return true;
  }
  return false;
}

export function auto_wantToFreeRun(enemy: Monster, loc: Location): boolean {
  if ((appearanceRates(loc)[enemy.toString()] ??= 0.0) <= 0) {
    return false;
  }
  const locCache: Location = myLocation();
  setLocation(loc);
  const monstersToFreeRun: Map<Monster, boolean> = auto_getMonsters("freerun");
  setLocation(locCache);
  return (
    monstersToFreeRun.get(enemy) ??
    monstersToFreeRun.set(enemy, false).get(enemy)
  );
}

function canFreeRun(enemy: Monster, loc: Location): boolean {
  // pokefam cannot use skills or items
  if (in_pokefam()) {
    return false;
  }
  return true;
}
// monsters that we want to run away from before banishing
export function freeRunCombatStringPreBanish(
  enemy: Monster,
  loc: Location,
  inCombat: boolean,
): string {
  if (isFreeMonster$1(enemy, loc)) {
    return "";
  }
  if (is_werewolf()) {
    //can't freerun as a Werewolf in WereProfessor
    return "";
  }
  // Prefer some specalized free run items before other sources
  if (!inAftercore() && haveEffect($effect`Everything Looks Green`) === 0) {
    // todo: other ghosts
    if (
      isGhost(enemy) &&
      canUse$3($item`T.U.R.D.S. Key`) &&
      itemAmount($item`T.U.R.D.S. Key`) > 0
    ) {
      return useItem$1($item`T.U.R.D.S. Key`);
    }
    //free runaway against pygmies. accelerates hidden city quest
    if (
      canUse$3($item`short writ of habeas corpus`) &&
      itemAmount($item`short writ of habeas corpus`) > 0 &&
      $monsters`pygmy orderlies, pygmy witch lawyer, pygmy witch nurse`.includes(
        enemy,
      )
    ) {
      return useItem$1($item`short writ of habeas corpus`);
    }
  }

  return "";
}

export function freeRunCombatString(
  enemy: Monster,
  loc: Location,
  inCombat: boolean,
): string {
  if (isFreeMonster$1(enemy, myLocation())) {
    return "";
  }
  if (is_werewolf()) {
    //can't freerun as a Werewolf in WereProfessor
    return "";
  }
  const pre_banish: string = freeRunCombatStringPreBanish(enemy, loc, inCombat);
  if (pre_banish !== "") {
    return pre_banish;
  }
  //Standard free-runs
  if (!inAftercore() && haveEffect($effect`Everything Looks Green`) === 0) {
    if (auto_haveSpringShoes() && auto_is_valid$2($skill`Spring Away`)) {
      if (!inCombat) {
        autoEquip$1($item`spring shoes`);
        return `skill ${$skill`Spring Away`}`;
      } else {
        if (canUse($skill`Spring Away`)) {
          return `skill ${$skill`Spring Away`}`;
        }
      }
    }

    if (auto_haveRoman() && auto_is_valid$2($skill`Blow the Green Candle!`)) {
      if (!inCombat) {
        autoEquip$1($item`Roman Candelabra`);
        return `skill ${$skill`Blow the Green Candle!`}`;
      } else {
        if (canUse($skill`Blow the Green Candle!`)) {
          return `skill ${$skill`Blow the Green Candle!`}`;
        }
      }
    }

    for (const it of $items`green smoke bomb, tattered scrap of paper, GOTO`) {
      if (canUse$3(it) && itemAmount(it) > 0) {
        return useItem$1(it);
      }
    }
  }

  if (canChangeToFamiliar($familiar`Frumious Bandersnatch`)) {
    // TODO add fam weight buffing
    const banderRunsLeft: number =
      floor(auto_famWeight$1($familiar`Frumious Bandersnatch`) / 5) -
      toInt(getProperty("_banderRunaways"));
    if (is_professor()) {
      return "";
    }
    if (!inCombat) {
      if (
        auto_have_skill($skill`The Ode to Booze`) &&
        banderRunsLeft > 0 &&
        (haveEffect($effect`Ode to Booze`) > 0 ||
          buffMaintain$4($effect`Ode to Booze`)) &&
        handleFamiliar$1($familiar`Frumious Bandersnatch`)
      ) {
        // update familiar already called in pre-adv so have to force.
        useFamiliar($familiar`Frumious Bandersnatch`);
        return `runaway familiar ${$familiar`Frumious Bandersnatch`}`;
      }
    } else {
      if (
        myFamiliar() === $familiar`Frumious Bandersnatch` &&
        haveEffect($effect`Ode to Booze`) > 0 &&
        banderRunsLeft > 0
      ) {
        return `runaway familiar ${$familiar`Frumious Bandersnatch`}`;
      }
    }
  }

  if (canChangeToFamiliar($familiar`Pair of Stomping Boots`)) {
    // TODO add fam weight buffing
    // boots and bander share same counter
    const banderRunsLeft: number =
      floor(auto_famWeight$1($familiar`Pair of Stomping Boots`) / 5) -
      toInt(getProperty("_banderRunaways"));
    if (is_professor()) {
      return "";
    }
    if (!inCombat) {
      if (
        banderRunsLeft > 0 &&
        handleFamiliar$1($familiar`Pair of Stomping Boots`)
      ) {
        // update familiar already called in pre-adv so have to force.
        useFamiliar($familiar`Pair of Stomping Boots`);
        return `runaway familiar ${$familiar`Pair of Stomping Boots`}`;
      }
    } else {
      if (
        myFamiliar() === $familiar`Pair of Stomping Boots` &&
        banderRunsLeft > 0
      ) {
        return `runaway familiar ${$familiar`Pair of Stomping Boots`}`;
      }
    }
  }

  if (auto_hasNavelRing()) {
    // currently only prioritize equipping if at least 80% chance of free run away
    if (!inCombat && auto_navelFreeRunChance() >= 80) {
      if (in_lol()) {
        autoEquip$1($item`replica navel ring of navel gazing`);
      } else {
        autoEquip$1($item`navel ring of navel gazing`);
      }
      return `runaway item ${$item`navel ring of navel gazing`}`;
    } else {
      // use in combat if have high chance of a free run away or at least level 13
      if (
        haveEquipped($item`navel ring of navel gazing`) ||
        (haveEquipped($item`replica navel ring of navel gazing`) &&
          (auto_navelFreeRunChance() >= 80 || myLevel() >= 13))
      ) {
        return `runaway item ${$item`navel ring of navel gazing`}`;
      }
    }
  }

  if (canUse($skill`Peel Out`) && pete_peelOutRemaining() > 0) {
    return `skill ${$skill`Peel Out`}`;
  }
  // Bowling ball is a banish as well, but is available enough that we want to use it as a free run source too
  // bowling ball is only in inventory if it is available to use in combat. While on cooldown, it is not in inventory
  if (
    (inCombat
      ? auto_have_skill($skill`Bowl a Curveball`)
      : itemAmount($item`cosmic bowling ball`) > 0) &&
    auto_is_valid$2($skill`Bowl a Curveball`)
  ) {
    return `skill ${$skill`Bowl a Curveball`}`;
  }
  // We have a lot of banishes - we can use handful of split pea soup as runaway, but not our last
  const potential_split_pea_soup: number =
    availableAmount($item`whirled peas`) / 2 +
    availableAmount($item`handful of split pea soup`);
  if (
    potential_split_pea_soup > 1 &&
    auto_is_valid($item`handful of split pea soup`)
  ) {
    return `item ${$item`handful of split pea soup`}`;
  }
  //Non-standard free-runs
  if (!inAftercore()) {
    for (const it of $items`giant eraser`) {
      //assuming additional ones will be added, eventually
      if (canUse$3(it) && itemAmount(it) > 0) {
        return useItem$1(it);
      }
    }
  }

  return "";
}

export function adjustForFreeRunIfPossible(
  enemy: Monster,
  loc: Location,
): boolean {
  if (canFreeRun(enemy, loc)) {
    const free_run_string: string = freeRunCombatString(enemy, loc, false);
    if (free_run_string !== "") {
      auto_log_info(
        `Adjusted to have free run available for ${enemy}: ${free_run_string}`,
        "blue",
      );
      return true;
    }
  }
  return false;
}

function adjustForYellowRay(combat_string: string): boolean {
  //Adjust equipment/familiars to have access to the desired Yellow Ray
  if (combat_string === `skill ${$skill`Open a Big Yellow Present`}`) {
    handleFamiliar("yellowray");
    return true;
  }
  if (combat_string === `skill ${$skill`Use the Force`}`) {
    return autoEquip(
      $slot`weapon`,
      wrap_item($item`Fourth of May Cosplay Saber`),
    );
  }
  if (combat_string === `skill ${$skill`Spit jurassic acid`}`) {
    auto_configureParka("acid");
  }
  if (combat_string === `skill ${$skill`Unleash the Devil's Kiss`}`) {
    auto_configureRetrocape("heck", "kiss");
  }
  if (combat_string === `skill ${$skill`Blow the Yellow Candle!`}`) {
    return autoEquip($slot`off-hand`, wrap_item($item`Roman Candelabra`));
  }
  // craft and consume 9-volt battery if we are using shocking lick and don't have any charges already
  if (
    combat_string === `skill ${$skill`Shocking Lick`}` &&
    toInt(getProperty("shockingLickCharges")) < 1
  ) {
    if (auto_getBattery($item`battery (9-Volt)`)) {
      use(1, $item`battery (9-Volt)`);
    } else {
      auto_log_error(
        "Failed to prepare a yellow ray. yellowRayCombatString thinks we can craft a 9-volt battery but we actually could not",
      );
    }
  }
  if (combat_string === `skill ${$skill`Northern Explosion`}`) {
    return autoEquip$1($item`April Shower Thoughts shield`);
  }
  return true;
}

export function adjustForYellowRayIfPossible(target: Monster): boolean {
  if (canYellowRay(target)) {
    const yr_string: string = yellowRayCombatString(
      target,
      false,
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
        target,
      ),
    );
    auto_log_info(
      `Adjusting to have YR available for ${target}: ${yr_string}`,
      "blue",
    );
    return adjustForYellowRay(yr_string);
  }
  return false;
}

export function adjustForYellowRayIfPossible$1(): boolean {
  return adjustForYellowRayIfPossible(Monster.none);
}

function canReplace(target: Monster): boolean {
  //Use this to determine if it is safe to enter a replace monster combat.
  return replaceMonsterCombatString$1(target) !== "";
}

function adjustForReplace(combat_string: string): boolean {
  //Adjust equipment/familiars to have access to the desired replace monster
  if (combat_string === `skill ${$skill`Macrometeorite`}`) {
    return true;
  }
  if (combat_string === `skill ${$skill`CHEAT CODE: Replace Enemy`}`) {
    return auto_forceEquipPowerfulGlove();
  }
  return false;
}

export function adjustForReplaceIfPossible(target: Monster): boolean {
  if (canReplace(target)) {
    const rep_string: string = replaceMonsterCombatString$1(target);
    auto_log_info(
      `Adjusting to have replace available for ${target}: ${rep_string}`,
      "blue",
    );
    return adjustForReplace(rep_string);
  }
  return false;
}

export function adjustForReplaceIfPossible$1(): boolean {
  return adjustForReplaceIfPossible(Monster.none);
}

export function canSniff(enemy: Monster, loc: Location): boolean {
  if (!auto_wantToSniff(enemy, loc)) {
    return false;
  }
  return getSniffer(enemy, false) !== Skill.none;
}

export function adjustForSniffingIfPossible(target: Monster): boolean {
  const sniffer: Skill = getSniffer(target, false);
  if (sniffer === $skill`McHugeLarge Slash`) {
    return autoEquip$1($item`McHugeLarge left pole`);
  }
  if (sniffer === $skill`Monkey Point`) {
    return autoEquip$1($item`cursed monkey's paw`);
  }
  if (sniffer !== Skill.none) {
    return acquireMP(mpCost(sniffer));
  }
  return false;
}

export function adjustForCopyIfPossible(target: Monster): boolean {
  const copier: Skill = getCopier(target, false);
  if (copier === $skill`Blow the Purple Candle!`) {
    return autoEquip$1($item`Roman Candelabra`);
  }
  if (copier === $skill`%fn, fire a Red, White and Blue Blast`) {
    handleFamiliar$1($familiar`Patriotic Eagle`);
  }
  return false;
}

export function banishSources(): number {
  //This should only look at banishes we have programmed
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_util.ash
  // Monster Banishes
  // Spring Kick: Equipment
  // Peel Out: Skill
  // Howl of the Alpha: Skill
  // Throw Latte on Opponent: Equipment
  // Give Your Opponent The Stinkeye: Equipment
  // Creepy Grin: Equipment
  // Baleful Howl: Skill
  // Thunder Clap: Skill
  // Asdon Martin: Campground
  // Curse of Vacation: Skill
  // Show Them Your Ring: Equipment
  // Breathe Out: Skill, from hot jelly
  // Batter Up!: Skill
  // Zootomist Kick Banish: Skill
  // Banishing Shout: Skill
  // Walk Away From Explosion: Skill
  // Talk About Politics: Equipment
  // Reflex Hammer: Equipment
  // Show Your Boring Familiar Pictures: Equipment
  // Bowl a Curveball: Item
  // Feel Hatred: Skill
  // [7510]Punt: Skill
  // Snokebomb: Skill
  // stuffed yam stinkbomb: Item
  // handful of split pea soup: Item
  // Punch Out Your Foe: Skill, from pre-workout powder, which is automatically consumed if necessary
  // [28021]Punt: Skill
  // Saber Force Banish: Equipment
  // KGB Tranquilizer Dart: Equipment
  // Monkey Slap: Equipment
  // Sea *dent Lightning Bolt: Equipment
  // Unleash Nanites: Familiar
  // Beancannon: Skill
  // human musk: Item
  // Louder Than Bomb: Item
  // tennis ball: Item
  // deathchucks: Item
  // divine champagne popper: Item
  // anchor bomb: Item
  // Mark Your Territory: Skill, from pheromone cocktail
  //
  // Phylum Banishes
  // Patriotic Screech: Familiar

  let count_1: number = 0;
  for (const sk of Skill.get([
    "Peel Out",
    "Howl of the Alpha",
    "Baleful Howl",
    "Thunder Clap",
    "Curse of Vacation",
    "Breathe Out",
    "Batter Up!",
    "Banishing Shout",
    "Walk Away From Explosion",
    "Feel Hatred",
    "[7510]Punt",
    "Snokebomb",
    "Punch Out your Foe",
    "[28021]Punt",
    "Beancannon",
    "Mark Your Territory",
  ])) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  if (canUse(getZooKickBanish())) {
    count_1 += 1;
  }
  //equipment
  for (const eq of $items`spring shoes, latte lovers member's mug, stinky cheese eye, V for Vivala mask, mafia middle finger ring, Pantsgiving, Lil' Doctor™ bag, familiar scrapbook, Fourth of May Cosplay Saber, Kremlin's Greatest Briefcase, cursed monkey's paw, Monodent of the Sea`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`cosmic bowling ball, stuffed yam stinkbomb, handful of split pea soup, human musk, Louder Than Bomb, tennis ball, deathchucks, divine champagne popper, anchor bomb, hot jelly, scoop of pre-workout powder, pheromone cocktail`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  //campground equipment
  for (const it of $items`Asdon Martin keyfob (on ring)`) {
    if (have_workshed() && auto_get_campground().has(it)) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Nanorhino, Patriotic Eagle`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function freeRunSources(): number {
  //This should only look at free runs we have programmed, not specialized free runs like the short writ of habeas corpus
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_util.ash
  // Spring Away: Equipment
  // Blow the Green Candle!: Equipment
  // green smoke bomb: Item
  // tattered scrap of paper: Item
  // GOTO: Item
  // Bandersnatch: Familiar
  // Boots: Familiar
  // (replica) navel ring: Equipment
  // Peel Out: Skill
  // Bowl a Curveball: Item
  // handful of split pea soup: Item
  // giant eraser: Item

  let count_1: number = 0;
  for (const sk of $skills`Peel Out`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  //equipment
  for (const eq of $items`spring shoes, Roman Candelabra, navel ring of navel gazing, replica navel ring of navel gazing`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`green smoke bomb, tattered scrap of paper, GOTO, cosmic bowling ball, handful of split pea soup, giant eraser`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Frumious Bandersnatch, Pair of Stomping Boots`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function freeKillSources(): number {
  //This should only look at free kills we have programmed
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_default_stage2.ash
  // Kill without Items
  // Club 'Em Back in Time: Equipment
  // groveling gravel: Item
  // Kill with Items
  // power pill: Item
  // Lightning Strike: Skill
  // Dart Bullseye: Equipment
  // Zootomist Kick Kill: Skill
  // Chest X-Ray: Equipment
  // Shattering Punch: Skill
  // Gingerbread Mob Hit: Skill
  // Free-For-All: Skill
  // replica bat-oomerang: Item
  // shadow brick: Item
  // Fire the Jokester's Gun: Equipment
  // Breathitin outdoor fights: Campground
  // Sweat Bullets: Equipment
  let count_1: number = 0;
  for (const sk of $skills`Lightning Strike, Shattering Punch, Gingerbread Mob Hit, Free-For-All`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  if (canUse(getZooKickInstaKill())) {
    count_1 += 1;
  }
  //equipment
  for (const eq of $items`blood cubic zirconia, legendary seal-clubbing club, Everfull Dart Holster, Lil' Doctor™ bag, The Jokester's gun`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //campground equipment
  for (const it of $items`cold medicine cabinet`) {
    if (have_workshed() && auto_get_campground().has(it)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`power pill, groveling gravel, replica bat-oomerang, shadow brick`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function instaKillSources(): number {
  //This should only look at instakills we have programmed
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_default_stage2.ash
  // Slaughter: Skill
  // exploding cigar: Item
  // Release the Boots: Familiar
  let count_1: number = 0;
  for (const sk of $skills`Slaughter`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`exploding cigar`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Pair of Stomping Boots`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function yellowRaySources(): number {
  //This should only look at YRs we have programmed
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_util.ash
  // Zootomist Kick YR: Skill
  // Fondeluge: Skill
  // yellowcake bomb: Item
  // yellow rocket: Item (we don't buy it if we have a parka, but having the key doesn't prove we can buy it)
  // Spit Jurassic Acid: Equipment
  // spitball: Item
  // Blow the Yellow Candle!: Equipment
  // Unleash the Devil's Kiss: Equipment
  // Disintegrate: Skill
  // Ball Lightning: Skill
  // Wrath of Ra: Skill
  // mayo lance: Campground
  // Flash Headlight: Skill (only if Ultrabright, but overcounting is ok)
  // Golden Light: Item
  // pumpkin bomb: Item
  // Unbearable Light: Item
  // viral video: Item
  // micronova: Item
  // Unleash Cowrruption: Skill, from effect from corrupted marrow
  // Open a Big Yellow Present: Familiar
  // Asdon Martin: Campground
  // Northern Explosion w/ April Shower Thoughts Shield: Equipment
  // Feel Envy: Skill
  // Saber Force: Equipment
  // Shocking Lick: Skill, from 9-Volt battery

  let count_1: number = 0;
  for (const sk of $skills`Fondeluge, Disintegrate, Ball Lightning, Wrath of Ra, Flash Headlight, Unleash Cowrruption, Feel Envy, Shocking Lick`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  if (canUse(getZooKickYR())) {
    count_1 += 1;
  }
  //equipment
  for (const eq of $items`Jurassic Parka, Roman Candelabra, unwrapped knock-off retro superhero cape, April Shower Thoughts shield, Fourth of May Cosplay Saber`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`yellowcake bomb, yellow rocket, spitball, Golden Light, pumpkin bomb, unbearable light, viral video, micronova`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  //campground equipment
  for (const it of $items`portable Mayo Clinic, Asdon Martin keyfob (on ring)`) {
    if (have_workshed() && auto_get_campground().has(it)) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Crimbo Shrub`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function copySources(): number {
  //This should only look at copiers/replacers/summons we have programmed, and not specialised summons like Calculate the Universe
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_util.ash: replaceMonsterCombatString
  // Replaces
  // Macrometeorite: Skill
  // Replace Enemy: Equipment
  // waffle: Item
  // Look at auto_combat_default_stage1.ash
  // and auto_combat_default_stage4.ash
  // and then at auto_util: handleCopiedMonster for the items
  // EXCEPT actually only the rain-doh black box is implemented
  // Copies
  // Recall Facts Monster Habitats: Skill
  // Fire a Red, White and Blue Blast: Familiar
  // Back-Up to your Last Enemy: Equipment
  // Rain-Doh black box: Item
  // Digitize: Skill
  // Blow the Purple Candle!: Equipment
  // Look at auto_util.ash: summonMonster
  // Summons (Calculate the Universe, Cargo Shorts and Burly Bodyguard in AG are all overly specialised)
  // Rain Man: Skill
  // Time-Spinner: Item
  // Chest Mimic: Familiar
  // combat lover's locket: Item (does not need to be equipped to reminisce)
  // deluxe fax machine: Clan
  // Wishing: Item

  let count_1: number = 0;
  for (const sk of $skills`Macrometeorite, Recall Facts: Monster Habitats, Digitize, Rain Man`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  //equipment
  for (const eq of $items`Powerful Glove, backup camera, Roman Candelabra`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //combat items/IOTMs/IOTM-Derived items that aren't equipment
  for (const it of $items`waffle, Rain-Doh black box, Time-Spinner, combat lover's locket`) {
    if (auto_is_valid(it) && itemAmount(it) > 0) {
      count_1 += 1;
      continue;
    }
  }
  //clan equipment
  for (const it of $items`deluxe fax machine`) {
    if (auto_get_clan_lounge().has(it)) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Patriotic Eagle, Chest Mimic`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  if (auto_wishesAvailable() > 0) {
    count_1 += 1;
  }
  return count_1;
}

export function sniffSources(): number {
  //This should only look at sniffs we have programmed
  //IOTM-derived skills should be checked against the IOTM, not the skill/item if the skill/IOTM is not tradeable
  //
  // Look at auto_combat_util.ash: getSniffer
  // Transcendent Olfaction: Skill
  // Make Friends: Skill
  // Hunt: Skill
  // Long Con: Skill
  // Perceive Soul: Skill
  // Motif: Skill
  // Monkey Point: Equipment
  // McHugeLarge Slash: Equipment
  // Gallapagosian Mating Call: Skill
  // Get a Good Whiff of This Guy: Familiar
  // Offer Latte to Opponent: Equipment
  // Zootomist Kick Sniff: Skill
  // Meat Cute: Skill
  let count_1: number = 0;
  for (const sk of $skills`Transcendent Olfaction, Make Friends, Hunt, Long Con, Perceive Soul, Motif, Gallapagosian Mating Call, Meat Cute`) {
    if (auto_have_skill(sk)) {
      count_1 += 1;
      continue;
    }
  }
  if (canUse(getZooKickSniff())) {
    count_1 += 1;
  }
  //equipment
  for (const eq of $items`cursed monkey's paw, McHugeLarge left pole, latte lovers member's mug`) {
    if (possessEquipment(eq) && auto_can_equip(eq)) {
      count_1 += 1;
      continue;
    }
  }
  //familiars
  for (const fam of $familiars`Nosy Nose`) {
    if (auto_have_familiar(fam) && canChangeToFamiliar(fam)) {
      count_1 += 1;
      continue;
    }
  }
  return count_1;
}

export function hasTorso(): boolean {
  return (
    haveSkill($skill`Torso Awareness`) ||
    haveSkill($skill`Best Dressed`) ||
    robot_cpu(9, false)
  );
}

export function isGuildClass(): boolean {
  return $classes`Seal Clubber, Turtle Tamer, Sauceror, Pastamancer, Disco Bandit, Accordion Thief`.includes(
    myClass(),
  );
}

export function elemental_resist_value(resistance: number): number {
  let bonus: number = 0;
  if (
    myClass() === $class`Pastamancer` ||
    myClass() === $class`Sauceror` ||
    isActuallyEd()
  ) {
    bonus = 5;
  }
  if (resistance <= 3) {
    return 10.0 * resistance + bonus;
  }
  let scale: number = 1.0;
  resistance = resistance - 4;
  while (resistance > 0) {
    scale = (scale * 5.0) / 6.0;
    resistance = resistance - 1;
  }
  return 90.0 - 50.0 * scale + bonus;
}

export function elemental_resist(goal: Element): number {
  return toInt(numericModifier(`${goal} resistance`));
}

export function preferredLibram(): Skill {
  if (
    auto_have_skill($skill`Summon BRICKOs`) &&
    toInt(getProperty("_brickoEyeSummons")) < 3
  ) {
    return $skill`Summon BRICKOs`;
  }
  if (
    auto_have_skill($skill`Summon Party Favor`) &&
    toInt(getProperty("_favorRareSummons")) < 3
  ) {
    return $skill`Summon Party Favor`;
  }
  if (auto_have_skill($skill`Summon Resolutions`)) {
    return $skill`Summon Resolutions`;
  }
  if (auto_have_skill($skill`Summon Taffy`)) {
    return $skill`Summon Taffy`;
  }
  return Skill.none;
}

export function lastAdventureSpecialNC(): boolean {
  if (myClass() === $class`Turtle Tamer`) {
    if (
      [
        "Nantucket Snapper",
        "Blue Monday",
        "Capital!",
        "Training Day",
        "Boxed In",
        "Duel Nature",
        "Slow Food",
        "A Rolling Turtle Gathers No Moss",
        "The Horror...",
        "Slow Road to Hell",
        "C'mere, Little Fella",
        "The Real Victims",
        "Like That Time in Tortuga",
        "Cleansing your Palette",
        "Harem Scarum",
        "Turtle in peril",
        "No Man, No Hole",
        "Slow and Steady Wins the Brawl",
        "Stormy Weather",
        "Turtles of the Universe",
        "O Turtle Were Art Thou",
        "Allow 6-8 Weeks For Delivery",
        "Kick the Can",
        "Turtles All The Way Around",
        "More eXtreme Than Usual",
        "Jewel in the Rough",
        "The worst kind of drowning",
        "Even Tamer Than Usual",
        "Never Break the Chain",
        "Close, but Yes Cigar",
        "Armchair Quarterback",
        "This Turtle Rocks!",
        "Really Sticking Her Neck Out",
        "It Came from Beneath the Sewer? Great!",
        "Don't Be Alarmed, Now",
        "Puttin' it on Wax",
        "More Like... Hurtle",
        "Musk! Musk! Musk!",
        "Silent Strolling",
      ].includes(getProperty("lastEncounter"))
    ) {
      return true;
    }
  }
  //I suppose we really do not need to validate that we have a Haunted Doghouse actually.
  if (
    [
      "Wooof! Wooooooof!",
      "Playing Fetch*",
      "Your Dog Found Something Again",
      "Dog Diner Afternoon",
      "Labrador Conspirator",
      "Doggy Heaven",
      "Lava Dogs",
      "Fruuuuuuuit",
      "Boooooze Hound",
      "Baker's Dogzen",
      "Dog Needs Food Badly",
      "Ratchet-catcher",
      "Something About Hot Wings",
      "Seeing-Eyes Dog",
      "Carpenter Dog",
      "Are They Made of Real Dogs?",
      "Gunbowwowder",
      "It Isn't a Poodle",
    ].includes(getProperty("lastEncounter"))
  ) {
    return true;
  }

  return false;
}

export function whatStatSmile(): Effect {
  switch (myClass()) {
    case $class`Seal Clubber`:
    case $class`Turtle Tamer`:
      return $effect`Patient Smile`;
    case $class`Sauceror`:
    case $class`Pastamancer`:
      if (haveSkill($skill`Inscrutable Gaze`)) {
        return $effect`Inscrutable Gaze`;
      }
      return $effect`Wry Smile`;
    case $class`Disco Bandit`:
    case $class`Accordion Thief`:
      return $effect`Knowing Smile`;
  }
  return Effect.none;
}

export function ovenHandle(): boolean {
  if (
    auto_get_campground().has($item`Dramatic™ range`) &&
    !toBoolean(getProperty("auto_haveoven"))
  ) {
    if (
      auto_get_campground().has($item`Certificate of Participation`) &&
      isActuallyEd()
    ) {
      auto_log_error(
        "Mafia reports we have an oven but we do not. Logging back in will resolve this.",
      );
    } else {
      auto_log_info("Oven found! We can cook!", "blue");
      setProperty("auto_haveoven", true.toString());
    }
  }

  if (
    !toBoolean(getProperty("auto_haveoven")) &&
    myMeat() >= npcPrice($item`Dramatic™ range`) + 1000 &&
    isGeneralStoreAvailable()
  ) {
    auto_buyUpTo(1, $item`Dramatic™ range`);
    use(1, $item`Dramatic™ range`);
    setProperty("auto_haveoven", true.toString());
  }
  return toBoolean(getProperty("auto_haveoven"));
}

export function isGhost(mon: Monster): boolean {
  const ghosts: Monster[] = $monsters`ancient ghost, angry ghost, banshee librarian, Battlie Knight Ghost, Bettie Barulio, chalkdust wraith, Claybender Sorcerer Ghost, coaltergeist, cold ghost, contemplative ghost, Dusken Raider Ghost, ghost, ghost actor, ghost miner, ghost of Elizabeth Spookyraven, hot ghost, hustled spectre, lovesick ghost, Marcus Macurgeon, Marvin J. Sunny, Mayor Ghost, Mer-kin specter, model skeleton, Mortimer Strauss, plaid ghost, Protector Spectre, restless ghost, sexy sorority ghost, sheet ghost, sleaze ghost, Space Tourist Explorer Ghost, spooky ghost, stench ghost, the ghost of Phil Bunion, The Unknown Accordion Thief, The Unknown Disco Bandit, The Unknown Pastamancer, The Unknown Sauceror, The Unknown Seal Clubber, The Unknown Turtle Tamer, Whatsian Commando Ghost, Wonderful Winifred Wongle`;
  if (ghosts.includes(mon) && !mon.boss) {
    return true;
  }
  return isProtonGhost(mon);
}

function isProtonGhost(mon: Monster): boolean {
  const ghosts: Monster[] = $monsters`boneless blobghost, Emily Koops\, a spooky lime, The ghost of Ebenoozer Screege, The ghost of Jim Unfortunato, The ghost of Lord Montague Spookyraven, the ghost of Monsieur Baguelle, the ghost of Oily McBindle, The ghost of Richard Cockingham, The ghost of Sam McGee, The ghost of Vanillica "Trashblossom" Gorton, The ghost of Waldo the Carpathian, The Headless Horseman, The Icewoman`;
  if (ghosts.includes(mon)) {
    return true;
  }
  return false;
}

export function cloversAvailable(override: boolean): number {
  // set override to true to not reserve a clover for the wand of nagamar.
  //count 11-leaf clovers
  let numClovers: number = 0;

  if (!in_glover()) {
    numClovers += availableAmount($item`11-leaf clover`);
    //if none on hand, try to buy from hermit
    if (numClovers === 0) {
      acquireHermitItem($item`11-leaf clover`);
      numClovers += itemAmount($item`11-leaf clover`);
    }
    //if none at hermit, try to pull one
    if (numClovers === 0) {
      pullXWhenHaveY(
        $item`11-leaf clover`,
        1,
        itemAmount($item`11-leaf clover`),
      );
      numClovers += itemAmount($item`11-leaf clover`);
    }
    //Get from August Scepter
    if (
      auto_haveAugustScepter() &&
      toInt(getProperty("_augSkillsCast")) < 5 &&
      !toBoolean(getProperty("_aug2Cast"))
    ) {
      numClovers += 1;
    }
    //Get from April band
    numClovers += auto_AprilSaxLuckyLeft();
    //heartstone
    numClovers += auto_heartstoneLuckRemaining();
  }
  //count Astral Energy Drinks which we have room to chew. Must specify ID since there are now 2 items with this name
  numClovers += min(
    availableAmount($item`[10883]astral energy drink`),
    floor(spleen_left() / 5),
  );
  //other known sources which aren't counted here:
  // Lucky Lindy, Optimal Dog, Pillkeeper

  if (
    toBoolean(getProperty("auto_wandOfNagamar")) &&
    !override &&
    myDaycount() > 1 &&
    inHardcore()
  ) {
    // in Normal we will just pull the missing pieces. Which is always an N because no one goes to the Valley of Rof L'm Fao
    numClovers--;
  }

  return numClovers;
}

export function cloversAvailable$1(): number {
  // overload to not override clover usage by default as this is the general case
  return cloversAvailable(false);
}

export function cloverUsageInit(override: boolean): boolean {
  if (cloversAvailable(override) === 0) {
    abort("Called cloverUsageInit but have no clovers");
  }
  //do we already have Lucky!?
  if (haveEffect($effect`Lucky!`) > 0) {
    return true;
  }

  setProperty("auto_luckySource", "none");

  if (auto_heartstoneLuckRemaining() > 0) {
    useSkill($skill`Heartstone: %luck`);
    if (haveEffect($effect`Lucky!`) > 0) {
      auto_log_info$1("Clover usage initialized, using Heartstone LUCK.");
      setProperty("auto_luckySource", $item`Heartstone`.toString());
      return true;
    } else {
      auto_log_warning$1("Did not acquire Lucky! after using heartstone LUCK.");
    }
  }

  if (auto_AprilSaxLuckyLeft() > 0) {
    if (auto_playAprilSax()) {
      auto_log_info$1("Clover usage initialized, using Apriling sax.");
      setProperty(
        "auto_luckySource",
        $item`Apriling band saxophone`.toString(),
      );
      return true;
    } else {
      auto_log_warning$1(
        "Did not acquire Lucky! after playing the Apriling sax.",
      );
    }
  }
  //Use August Scepter skill if we can
  if (
    auto_haveAugustScepter() &&
    toInt(getProperty("_augSkillsCast")) < 5 &&
    !toBoolean(getProperty("_aug2Cast"))
  ) {
    useSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`);
    if (haveEffect($effect`Lucky!`) > 0) {
      auto_log_info$1("Clover usage initialized using August Scepter.");
      setProperty("auto_luckySource", $item`august scepter`.toString());
      return true;
    } else {
      auto_log_warning$1(
        "Did not acquire Lucky! after casting Aug. 2nd: Find an Eleven-Leaf Clover Day!",
      );
    }
  }
  //use a clover if we have one in inventory or closet
  if (itemAmount($item`11-leaf clover`) < 1) {
    //try to get one out of closet, catch to avoid an error being thrown
    try {
      retrieveItem(1, $item`11-leaf clover`);
    } catch {}
  }
  if (itemAmount($item`11-leaf clover`) > 0) {
    use(1, $item`11-leaf clover`);
    if (haveEffect($effect`Lucky!`) > 0) {
      auto_log_info$1("Clover usage initialized using clover.");
      setProperty("auto_luckySource", $item`11-leaf clover`.toString());
      return true;
    } else {
      auto_log_warning$1(
        "Did not acquire Lucky! after using an 11-Leaf Clover",
      );
    }
  }
  //use Astral Energy Drinks if we have room
  if (spleen_left() >= 5) {
    if (itemAmount($item`[10883]astral energy drink`) < 1) {
      //try to get one out of closet
      retrieveItem(1, $item`[10883]astral energy drink`);
    }
    if (itemAmount($item`[10883]astral energy drink`) > 0) {
      chew(1, $item`[10883]astral energy drink`);
      if (haveEffect($effect`Lucky!`) > 0) {
        auto_log_info$1("Clover usage initialized using Astral Energy Drink");
        setProperty(
          "auto_luckySource",
          $item`[10883]astral energy drink`.toString(),
        );
        return true;
      } else {
        auto_log_warning$1(
          "Did not acquire Lucky! after drinking an Astral Energy Drink",
        );
      }
    }
  }

  abort("We tried to initialize clover usage but was unable to get Lucky!");
  return false;
}

export function cloverUsageInit$1(): boolean {
  // overload to not override clover usage by default as this is the general case
  return cloverUsageInit(false);
}

export function cloverUsageRestart(): boolean {
  if (haveEffect($effect`Lucky!`) === 0) {
    return false;
  }
  if (
    equippedAmount($item`June cleaver`) > 0 &&
    [
      "Poetic Justice",
      "Aunts not Ants",
      "Beware of Aligator",
      "Beware of Alligator",
      "Teacher's Pet",
      "Lost and Found",
      "Summer Days",
      "Bath Time",
      "Delicious Sprouts",
      "Hypnotic Master",
    ].includes(getProperty("lastEncounter"))
  ) {
    //got interrupted and should adventure again in same location
    return true;
  }
  return false;
}

export function cloverUsageFinish(): boolean {
  if (haveEffect($effect`Lucky!`) > 0) {
    abort(
      `Wandering adventure interrupted our clover adventure (${myLocation()}).`,
    );
  } else {
    handleTracker$2(
      getProperty("auto_luckySource"),
      myLocation().toString(),
      getProperty("lastEncounter"),
      "auto_lucky",
    );
    setProperty("auto_luckySource", "none");
  }
  return true;
}

export function isHermitAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (in_zombieSlayer()) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  return true;
}

export function isGalaktikAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (in_zombieSlayer()) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  return true;
}

export function isGeneralStoreAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (is_werewolf()) {
    return false;
  }
  return true;
}

export function isArmoryAndLeggeryStoreAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (in_zombieSlayer()) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  return true;
}

export function isMusGuildStoreAvailable(): boolean {
  if (
    $classes`Seal Clubber, Turtle Tamer`.includes(myClass()) &&
    guildStoreAvailable()
  ) {
    return true;
  }
  if (
    myClass() === $class`Accordion Thief` &&
    myLevel() >= 9 &&
    guildStoreAvailable()
  ) {
    return true;
  }
  return false;
}

export function isMystGuildStoreAvailable(): boolean {
  if (
    $classes`Pastamancer, Sauceror`.includes(myClass()) &&
    guildStoreAvailable()
  ) {
    return true;
  }
  if (
    myClass() === $class`Accordion Thief` &&
    myLevel() >= 9 &&
    guildStoreAvailable()
  ) {
    return true;
  }
  return false;
}

export function isArmoryAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (in_zombieSlayer()) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  return true;
}

export function isUnclePAvailable(): boolean {
  if (in_nuclear()) {
    return false;
  }
  if (in_zombieSlayer()) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  const page_text: string = visitUrl("place.php?whichplace=desertbeach");
  return !containsText(page_text, "You don't know where a desert beach is");
}

export function isDesertAvailable(): boolean {
  //Is this workaround still needed or is mafia correctly recognizing desert is available in koe?
  if (in_koe()) {
    auto_log_info$1("The desert exploded so no need to build a meatcar...");
    setProperty("lastDesertUnlock", myAscensions().toString());
  }

  return toInt(getProperty("lastDesertUnlock")) === myAscensions();
}

export function inKnollSign(): boolean {
  return ["Mongoose", "Vole", "Wallaby"].includes(mySign());
}

export function inCanadiaSign(): boolean {
  return ["Marmot", "Opossum", "Platypus"].includes(mySign());
}

export function inGnomeSign(): boolean {
  return ["Blender", "Packrat", "Wombat"].includes(mySign());
}

let $_instakillable_not_instakillable: Monster[] | undefined;

export function instakillable(mon: Monster): boolean {
  if (mon.boss) {
    return false;
  }

  $_instakillable_not_instakillable ??= Monster.get([
    // Cyrpt bosses
    "conjoined zmombie",
    "gargantulihc",
    "giant skeelton",
    "huge ghuol",
    // crowd of adventurers bosses at the tower tests
    "Tasmanian Dervish",
    "Mr. Loathing",
    "The Mastermind",
    "Seannery the Conman",
    "The Lavalier",
    "Leonard",
    "Arthur Frankenstein",
    "Mrs. Freeze",
    "Odorous Humongous",
    // time-spinner
    "Ancient Skeleton with Skin still on it",
    "Apathetic Tyrannosaurus",
    "Assembly Elemental",
    "Cro-Magnon Gnoll",
    "Krakrox the Barbarian",
    "Wooly Duck",
    // Love Tunnel
    "LOV Enforcer",
    "LOV Engineer",
    "LOV Equivocator",
    // ancient protector spirits
    "Protector Spectre",
    "ancient protector spirit",
    "ancient protector spirit (The Hidden Apartment Building)",
    "ancient protector spirit (The Hidden Hospital)",
    "ancient protector spirit (The Hidden Office Building)",
    "ancient protector spirit (The Hidden Bowling Alley)",
    // Macguffin snakes
    "Batsnake",
    "Frozen Solid Snake",
    "Burning Snake of Fire",
    "The Snake With Like Ten Heads",
    "The Frattlesnake",
    "Snakeleton",
    // Voting monsters
    "slime blob",
    "terrible mutant",
    "government bureaucrat",
    "angry ghost",
    "annoyed snake",
    // Tentacles
    "Sssshhsssblllrrggghsssssggggrrgglsssshhssslblgl",
    "Eldritch Tentacle",
    // Other Monsters that Mafia returns as instakillable (or not a boss), that really aren't
    "cosmetics wraith",
    "drunken rat king",
    "booty crab",
  ]);

  if ($_instakillable_not_instakillable.includes(mon)) {
    return false;
  }

  return true;
}

export function stunnable(mon: Monster): boolean {
  if (mon.randomModifiers.includes("unstoppable")) {
    return false;
  }
  if (mon.randomModifiers.includes("rabbit mask")) {
    return false;
  }
  // Incomplete, because challenge paths are a thing
  const unstunnable_monsters: Monster[] = Monster.get([
    // Standard
    "wall of skin",
    "wall of bones",
    "Eldritch Tentacle",
    // Cargo Cultist Shorts
    "Astrologer of Shub-Jigguwatt",
    "Burning Daughter",
    "Chosen of Yog-Urt",
    "Herald of Fridgr",
    "Tentacle of Sssshhsssblllrrggghsssssggggrrgglsssshhssslblgl",
    // Vampyre
    "Your Lack of Reflection",
    "%alucard%",
    // Heavy Rains
    "storm cow",
    // Witchess Monsters
    "Witchess Witch",
    "Witchess Queen",
    "Witchess King",
    // Other
    "Cyrus the Virus",
    "broctopus",
    "cocktail shrimp",
  ]);

  if (
    $monsters`Naughty Sorceress, Naughty Sorceress (2)`.includes(mon) &&
    !toBoolean(getProperty("auto_confidence"))
  ) {
    return false;
  }

  return !unstunnable_monsters.includes(mon);
}

export function combatItemDamageMultiplier(): number {
  let retval: number = 1;
  if (auto_have_skill($skill`Deft Hands`)) {
    retval += 0.25;
  }
  if (haveEffect($effect`Mathematically Precise`) > 0) {
    retval += 0.5;
  }
  if (haveEquipped($item`V for Vivala mask`)) {
    retval += 0.5;
  }
  return retval;
}

export function MLDamageToMonsterMultiplier(): number {
  //Positive ML gives monsters damage resistance
  //Negative ML increases the damage inflicted on monsters
  let retval: number = 1 - 0.004 * monsterLevelAdjustment();
  if (retval < 0.5) {
    //damage resistance is capped at 50%
    retval = 0.5;
  }
  return retval;
}

export function auto_freeCrafts(): number {
  let retval: number = 0;
  if (
    haveSkill($skill`Rapid Prototyping`) &&
    isUnrestricted($item`Crimbot ROM: Rapid Prototyping`)
  ) {
    retval += 5 - toInt(getProperty("_rapidPrototypingUsed"));
  }
  if (
    haveSkill($skill`Expert Corner-Cutter`) &&
    isUnrestricted($item`LyleCo Contractor's Manual`)
  ) {
    retval += 5 - toInt(getProperty("_expertCornerCutterUsed"));
  }
  retval += haveEffect($effect`Inigo's Incantation of Inspiration`) / 5;
  retval += toInt(getProperty("homebodylCharges"));
  //	if(have_skill($skill[Inigo\'s Incantation Of Inspiration]))
  //	{
  //		if(my_mp() > mp_cost($skill[Inigo\'s Incantation Of Inspiration]))
  //		{
  //			retval += 2;
  //		}
  //		else if(have_effect($effect[Inigo\'s Incantation Of Inspiration]) >= 5)
  //		{
  //			retval += 1;
  //		}
  //	}

  return retval;
}

export function isFreeMonster(mon: Monster): boolean {
  return isFreeMonster$1(mon, Location.none);
}

export function isFreeMonster$1(mon: Monster, loc: Location): boolean {
  //No free fights in Avant Guard. Well, there are, but they now have non-free bodyguards so anything that is free now costs a turn
  if (in_avantGuard()) {
    return false;
  }

  if (
    $monsters`angry ghost, annoyed snake, government bureaucrat, slime blob, terrible mutant`.includes(
      mon,
    ) &&
    toInt(getProperty("_voteFreeFights")) < 3
  ) {
    return true;
  }

  if (
    $monsters`biker, burnout, jock, party girl, "plain" girl`.includes(mon) &&
    toInt(getProperty("_neverendingPartyFreeTurns")) < 10
  ) {
    return true;
  }

  if (
    $monsters`Perceiver of Sensations, Performer of Actions, Thinker of Thoughts`.includes(
      mon,
    )
  ) {
    if (
      myFamiliar() === $familiar`Machine Elf` &&
      toInt(getProperty("_machineTunnelsAdv")) < 5 &&
      myLocation() === $location`The Deep Machine Tunnels`
    ) {
      return true;
    }
  }

  if (
    $monster`X-32-F Combat Training Snowman` === mon &&
    toInt(getProperty("_snojoFreeFights")) < 10
  ) {
    return true;
  }

  if (
    $monsters`void guy, void slab, void spider`.includes(mon) &&
    toInt(getProperty("_voidFreeFights")) < 5
  ) {
    return true;
  }

  if (
    $monster`drunk pygmy` === mon &&
    itemAmount($item`Bowl of Scorpions`) > 0
  ) {
    return true;
  }

  if (
    toInt(getProperty("breathitinCharges")) > 0 &&
    loc.environment === "outdoor"
  ) {
    return true;
  }

  if (
    $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary)`.includes(
      loc,
    ) &&
    haveEffect($effect`Shadow Affinity`) > 0 &&
    !in_avantGuard()
  ) {
    return true;
  }

  if (mon.randomModifiers.includes("optimal")) {
    return true;
  }

  if (containsText(toLowerCase(mon.attributes), "free")) {
    return true;
  }

  return false;
}

export function auto_burningDelay(): boolean {
  if (
    (auto_voteMonster$1(true) ||
      isOverdueDigitize() ||
      auto_sausageGoblin() ||
      auto_backupTarget() ||
      auto_voidMonster()) &&
    myLocation() === solveDelayZone$1()
  ) {
    return true;
  }
  return false;
}

export function auto_gettingLucky(): boolean {
  if (haveEffect($effect`Lucky!`) > 0 && zone_hasLuckyAdventure(myLocation())) {
    return true;
  }
  return false;
}

export function auto_queueIgnore(): boolean {
  if (
    auto_burningDelay() ||
    auto_gettingLucky() ||
    auto_haveQueuedForcedNonCombat()
  ) {
    return true;
  }
  return false;
}

export function auto_deleteMail(msg: kmailObject): boolean {
  if (
    msg.fromid === 0 &&
    containsText(
      msg.message,
      "We found this telegram at the bottom of an old bin of mail.",
    )
  ) {
    return true;
  }
  if (
    msg.fromid === 0 &&
    containsText(
      msg.message,
      "One of my agents found a copy of a telegram in the Council's fileroom",
    )
  ) {
    return true;
  }
  if (getProperty("auto_consultChoice") !== "") {
    const id: number = toInt(getPlayerId(getProperty("auto_consultChoice")));
    if (
      msg.fromid === id &&
      containsText(msg.message, "completed your relationship fortune test") &&
      toBoolean(getProperty("auto_hideAdultery"))
    ) {
      return true;
    }
  }
  if (
    msg.fromid === 3690803 &&
    containsText(msg.message, "completed your relationship fortune test") &&
    toBoolean(getProperty("auto_hideAdultery"))
  ) {
    return true;
  }

  if (
    msg.fromid === -1 &&
    containsText(
      msg.message,
      "Your dedication to helping me fight crime in Gotpork city almost makes me forget about the fact that crime in Gotpork city cost me my parents.",
    )
  ) {
    return true;
  }

  if (msg.fromname === "Lady Spookyraven\\'s Ghost") {
    return true;
  }
  if (msg.fromname === "Lady Spookyraven's Ghost") {
    return true;
  }
  return false;
}

export function LX_summonMonster(): boolean {
  // summon screambat if we are at last wall to knock down and don't have a sonar-in-a-biscuit
  if (
    internalQuestStatus("questL04Bat") === 2 &&
    (!auto_is_valid($item`sonar-in-a-biscuit`) ||
      itemAmount($item`sonar-in-a-biscuit`) === 0) &&
    canSummonMonster($monster`screambat`)
  ) {
    if (summonMonster($monster`screambat`)) {
      return true;
    }
  }
  // summon mountain man if we know the ore we need and still need 2 or more
  // don't summon if we have model train set as it is an easy source of ore
  const oreGoal: Item = toItem(getProperty("trapperOre"));
  if (
    internalQuestStatus("questL08Trapper") < 2 &&
    auto_haveTrainSet() &&
    oreGoal !== Item.none &&
    itemAmount(oreGoal) < 2 &&
    canYellowRay$1() &&
    canSummonMonster($monster`mountain man`)
  ) {
    adjustForYellowRayIfPossible$1();
    const need_dupe: boolean = itemAmount(oreGoal) < 1;
    const can_mctwist: boolean =
      auto_can_equip($item`pro skateboard`) &&
      !toBoolean(getProperty("_epicMcTwistUsed"));
    const will_mctwist: boolean = can_mctwist && need_dupe;
    auto_log_info$1(
      `Trying to summon a mountain man${will_mctwist ? " which we will McTwist." : "."}`,
    );
    if (will_mctwist) {
      autoEquip$1($item`pro skateboard`);
    }
    if (summonMonster($monster`mountain man`)) {
      return true;
    }
  }

  if (
    auto_is_valid($item`smut orc keepsake box`) &&
    itemAmount($item`smut orc keepsake box`) === 0 &&
    myLevel() >= 9 &&
    (lumberCount() < 30 || fastenerCount() < 30) &&
    canSummonMonster($monster`smut orc pervert`)
  ) {
    // summon pervert here but handling of L9 quest will open box
    if (auto_haveGreyGoose()) {
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (summonMonster($monster`smut orc pervert`)) {
      return true;
    }
  }
  // summon LFM if don't have autumnaton since that guarantees 1 turn to get 5 barrels
  const gunpowder_left: number = 5 - itemAmount($item`barrel of gunpowder`);
  function canCopyLFM(): boolean {
    return (
      auto_canHabitat() || auto_backupUsesLeft() >= max(gunpowder_left - 1, 0)
    );
  }
  if (
    getProperty("sidequestLighthouseCompleted") === "none" &&
    gunpowder_left > 0 &&
    myLevel() >= 12 &&
    canSummonMonster($monster`lobsterfrogman`) &&
    (canCopyLFM() || gunpowder_left === 1) &&
    !(auto_habitatMonster() === $monster`lobsterfrogman`) &&
    getProperty("lastEncounter") !== $monster`lobsterfrogman`.toString() &&
    !auto_hasAutumnaton()
  ) {
    if (summonMonster($monster`lobsterfrogman`)) {
      return true;
    }
  }
  // get war outfit if have yr available.
  // check for lvl 9 as that is when "L12_preOutfit" will try to get the prewar outfit. Better to summon and skip to war outfit
  if (
    !possessOutfit$1("Frat Warrior Fatigues") &&
    auto_warSide() === "fratboy" &&
    canYellowRay$1() &&
    myLevel() >= 9 &&
    (canSummonMonster($monster`War Frat 151st Infantryman`) ||
      canSummonMonster($monster`War Frat Mobile Grill Unit`) ||
      canSummonMonster($monster`Orcish Frat Boy Spy`))
  ) {
    adjustForYellowRayIfPossible$1();
    // attempt to use calculate the universe
    if (summonMonster($monster`War Frat 151st Infantryman`)) {
      return true;
    }
    // attempt to summon other sources of outfit
    if (summonMonster($monster`War Frat Mobile Grill Unit`)) {
      return true;
    }
    if (summonMonster($monster`Orcish Frat Boy Spy`)) {
      return true;
    }
  }
  if (
    !possessOutfit$1("War Hippy Fatigues") &&
    auto_warSide() === "hippy" &&
    canYellowRay$1() &&
    myLevel() >= 12 &&
    (canSummonMonster($monster`War Hippy Airborne Commander`) ||
      canSummonMonster($monster`War Hippy Spy`))
  ) {
    adjustForYellowRayIfPossible$1();
    if (summonMonster($monster`War Hippy Airborne Commander`)) {
      return true;
    }
    if (summonMonster($monster`War Hippy Spy`)) {
      return true;
    }
  }
  // summon astronomer if only missing star chart for star key
  // only in Hardcore or if we have no pulls remaining as we can just pull a star chart in Normal
  if (
    needStarKey() &&
    itemAmount($item`star`) >= 8 &&
    itemAmount($item`line`) >= 7 &&
    canSummonMonster($monster`Astronomer`) &&
    (inHardcore() || pullsRemaining() < 1)
  ) {
    if (summonMonster($monster`Astronomer`)) {
      return true;
    }
  }
  // summon additional monsters in heavy rains with rain man when available
  if (haveSkill($skill`Rain Man`) && myRain() >= 50) {
    // summon Family Jewels or Bush to get only stars
    if (
      needStarKey() &&
      itemAmount($item`star`) < 8 &&
      itemAmount($item`line`) >= 7
    ) {
      if (
        canSummonMonster($monster`Family Jewels`) &&
        summonMonster($monster`Family Jewels`)
      ) {
        return true;
      }
      if (canSummonMonster($monster`Bush`) && summonMonster($monster`Bush`)) {
        return true;
      }
    }
    // summon Trouser Snake or Box to get only lines
    if (
      needStarKey() &&
      itemAmount($item`star`) >= 8 &&
      itemAmount($item`line`) < 7
    ) {
      if (
        canSummonMonster($monster`Trouser Snake`) &&
        summonMonster($monster`Trouser Snake`)
      ) {
        return true;
      }
      if (canSummonMonster($monster`Box`) && summonMonster($monster`Box`)) {
        return true;
      }
    }
    // summon Skinflute or Camel's Toe to get both stars and lines
    if (
      needStarKey() &&
      itemAmount($item`star`) < 8 &&
      itemAmount($item`line`) < 7
    ) {
      if (
        canSummonMonster($monster`Skinflute`) &&
        summonMonster($monster`Skinflute`)
      ) {
        return true;
      }
      if (
        canSummonMonster($monster`Camel's Toe`) &&
        summonMonster($monster`Camel's Toe`)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function canSummonMonster(mon: Monster): boolean {
  return summonMonster$1(mon, true);
}

export function summonMonster(mon: Monster): boolean {
  return summonMonster$1(mon, false);
}

function summonMonster$1(mon: Monster, speculative: boolean): boolean {
  if (!speculative) {
    auto_log_debug(`Trying to summon ${mon}`, "blue");
    setProperty("auto_nonAdvLoc", true.toString());
  }

  if (!speculative) {
    // Equip the combat lover's locket if we're missing a monster about to be summoned
    if (
      auto_haveCombatLoversLocket() &&
      mon.id > 0 &&
      mon.copyable &&
      !mon.boss &&
      !auto_monsterInLocket(mon)
    ) {
      auto_log_info(
        `We want to get the "${mon}" monster into the combat lover's locket from summoning, so we're bringing it along.`,
        "blue",
      );
      autoEquip$1($item`combat lover's locket`);
    }
    // Equip a copier if we want to copy it
    if (auto_wantToCopy$1(mon)) {
      auto_log_info$1(
        `We want to copy the ${mon} so adjusting for our equipment if possible.`,
      );
      adjustForCopyIfPossible(mon);
    }
  }
  // methods which require specific circumstances
  if (mon === $monster`War Frat 151st Infantryman`) {
    // calculate the universe's only summon we want, so prioritize using it
    if (LX_calculateTheUniverse(speculative)) {
      auto_log_debug(
        `${speculative ? "Can" : "Did"} summon ${mon} via calculate the universe`,
        "blue",
      );
      return true;
    }
  }
  if (rainManSummon(mon, speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via rain man`,
      "blue",
    );
    return true;
  }
  // todo add support for Baa'baa'bu'ran with deck of every card sheep card
  if (timeSpinnerCombat$1(mon, speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via time spinner`,
      "blue",
    );
    return true;
  }
  // methods which can only summon monsters should be attempted first
  if (auto_meggFight(mon, speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via chest mimics`,
      "blue",
    );
    return true;
  }

  if (auto_fightLocketMonster(mon, speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via combat lover's locket`,
      "blue",
    );
    return true;
  }
  if (handleFaxMonster(mon, !speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via fax`,
      "blue",
    );
    return true;
  }
  // methods which can do more than summon monsters
  if (auto_cargoShortsOpenPocket$2(mon, speculative)) {
    auto_log_debug(
      `${speculative ? "Can" : "Did"} summon ${mon} via cargo shorts`,
      "blue",
    );
    return true;
  }
  if (speculative && canGenieCombat(mon)) {
    auto_log_debug(`Can summon ${mon} via wishing`, "blue");
    return true;
  } else if (!speculative && makeGenieCombat(mon)) {
    auto_log_debug(`Did summon ${mon} via wishing`, "blue");
    return true;
  }

  return false;
}

export function summonedMonsterToday(mon: Monster): boolean {
  const copiedMonsters: string = getProperty("auto_copies");
  const searchString: string = `(${myDaycount()}:${mon.toString()}`;
  return containsText(copiedMonsters, searchString);
}

export function handleCopiedMonster(itm: Item): boolean {
  return handleCopiedMonster$1(itm, null);
}

function handleCopiedMonster$1(itm: Item, option: CombatMacro): boolean {
  let id: number = 0;
  switch (itm) {
    case $item`Rain-Doh black box`:
      return handleCopiedMonster$1($item`Rain-Doh box full of monster`, option);
    case $item`Spooky Putty sheet`:
      return handleCopiedMonster$1($item`Spooky Putty monster`, option);
    case $item`4-d camera`:
      return handleCopiedMonster$1($item`shaking 4-d camera`, option);
    case $item`unfinished ice sculpture`:
      return handleCopiedMonster$1($item`ice sculpture`, option);
    case $item`print screen button`:
      return handleCopiedMonster$1($item`screencapped monster`, option);
    case $item`Rain-Doh box full of monster`:
      if (getProperty("rainDohMonster") === "") {
        abort(`${itm} has no monster so we can't use it`);
      }
      id = toInt(itm);
      break;
    case $item`Spooky Putty monster`:
      if (getProperty("spookyPuttyMonster") === "") {
        abort(`${itm} has no monster so we can't use it`);
      }
      id = toInt(itm);
      break;
    case $item`shaking 4-d camera`:
      if (getProperty("cameraMonster") === "") {
        abort(`${itm} has no monster so we can't use it`);
      }
      if (toBoolean(getProperty("_cameraUsed"))) {
        abort(`${itm} already used today. We can not continue`);
      }
      id = toInt(itm);
      break;
    case $item`ice sculpture`:
      if (itemAmount(itm) === 0) {
        abort(`We do not have any ${itm}`);
      }
      if (getProperty("iceSculptureMonster") === "") {
        abort(`${itm} has no monster so we can't use it`);
      }
      if (toBoolean(getProperty("_iceSculptureUsed"))) {
        abort(`${itm} already used today. We can not continue`);
      }
      id = toInt(itm);
      break;
    case $item`screencapped monster`:
      if (getProperty("screencappedMonster") === "") {
        abort(`${itm} has no monster so we can't use it`);
      }
      id = toInt(itm);
      break;
  }
  if (id !== 0) {
    return autoAdvBypass$2(
      `inv_use.php?pwd&which=3&whichitem=${id}`,
      $location`Noob Cave`,
      option,
    );
  }
  return false;
}

export function maxSealSummons(): number {
  if (itemAmount($item`Claw of the Infernal Seal`) > 0) {
    return 10;
  }
  return 5;
}

export function acquireCombatMods(amt: number, doEquips: boolean): boolean {
  if (amt < 0) {
    return providePlusNonCombat$3(min(auto_combatModCap(), -1 * amt), doEquips);
  } else if (amt > 0) {
    return providePlusCombat$3(min(auto_combatModCap(), amt), doEquips);
  }
  return true;
}

export function basicAdjustML(): boolean {
  if (is_boris()) {
    return borisAdjustML();
  }
  if (in_plumber()) {
    // We don't get many stats from combat - no point running ML.
    auto_change_mcd(0);
    return false;
  }
  if (monsterLevelAdjustment() > 150 && monsterLevelAdjustment() <= 160) {
    const base: number = monsterLevelAdjustment() - currentMcd();
    if (base <= 150) {
      const canhave: number = 150 - base;
      auto_change_mcd(canhave);
    }
  } else {
    if (
      (toInt(getProperty("flyeredML")) >= 10000 ||
        toBoolean(getProperty("auto_ignoreFlyer"))) &&
      myLevel() >= 13 &&
      !toBoolean(getProperty("auto_disregardInstantKarma"))
    ) {
      auto_change_mcd(0);
    } else if (monsterLevelAdjustment() + (10 - currentMcd()) <= 150) {
      auto_change_mcd(11);
    }
  }
  return false;
}

export function highest_available_mcd(): number {
  if (in_koe()) {
    return 0;
  }

  if (knollAvailable() && itemAmount($item`detuned radio`) > 0) {
    if (in_glover()) {
      return 0;
    } else {
      return 10;
    }
  } else if (inGnomeSign() && gnomadsAvailable()) {
    return 10;
  } else if (canadiaAvailable()) {
    return 11;
  }
  //in_bad_moon() availability is special since it costs a turn and highest is 8 to 11 by RNG

  return currentMcd();
}

export function auto_change_mcd(mcd: number): boolean {
  return auto_change_mcd$1(mcd, false);
}

function auto_change_mcd$1(mcd: number, immediately: boolean): boolean {
  let best: number = highest_available_mcd();
  if (inBadMoon()) {
    best = 11;
  }
  //under level 13 we want to level up. level 14+ we already missed the instant karma, no point in holding back anymore.
  if (
    myLevel() === 13 &&
    !toBoolean(getProperty("auto_disregardInstantKarma"))
  ) {
    if (
      getProperty("questL12War") === "finished" ||
      getProperty("sidequestArenaCompleted") !== "none" ||
      toInt(getProperty("flyeredML")) >= 10000 ||
      toBoolean(getProperty("auto_ignoreFlyer"))
    ) {
      mcd = 0;
    }
  }
  mcd = min(mcd, best);
  const next: number = max(0, mcd);

  setProperty("auto_mcd_target", next.toString()); // if we return without setting this, we will flip-flop the mcd every adventure...

  if (next === currentMcd()) {
    return true;
  }

  if (immediately) {
    return changeMcd(next);
  }
  //for non immediate changes we still return true because the mafia setting was changed and MCD will be changed later.
  return true;
}

export function evokeEldritchHorror(option?: CombatMacro): boolean {
  if (!haveSkill($skill`Evoke Eldritch Horror`)) {
    return false;
  }
  if (toBoolean(getProperty("_eldritchHorrorEvoked"))) {
    return false;
  }
  if (myMp() < mpCost($skill`Evoke Eldritch Horror`)) {
    return false;
  }

  const pages: Map<number, string> = new Map();
  pages.set(
    0,
    `runskillz.php?pwd=&targetplayer${myId()}&quantity=1&whichskill=168`,
  );
  return autoAdvBypass(0, pages, $location`Noob Cave`, option);
}

export function fightScienceTentacle(): boolean {
  if (in_koe() || in_avantGuard()) {
    return false;
  }
  if (toBoolean(getProperty("_eldritchTentacleFought"))) {
    return false;
  }

  if (!handleServant($servant`Scribe`)) {
    handleServant($servant`Cat`);
  }

  visitUrl("place.php?whichplace=forestvillage&action=fv_scientist");

  const choices: Map<number, string> = new Map(
    Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]),
  );
  let abortChoice: number = 0;
  for (const [idx, text] of choices) {
    if (text === "Great!") {
      abortChoice = idx;
      break;
    }
  }

  if (
    (choices.get(1) ?? choices.set(1, "").get(1)) !==
      "Can I fight that tentacle you saved for science?" ||
    abortChoice === 0
  ) {
    setProperty("_eldritchTentacleFought", true.toString());
    visitUrl(`choice.php?whichchoice=1201&pwd=&option=${abortChoice}`);
    return false;
  }

  setProperty("auto_nonAdvLoc", true.toString());
  visitUrl(`choice.php?whichchoice=1201&pwd=&option=${abortChoice}`);
  setProperty("auto_nextEncounter", "Eldritch Tentacle");
  const pages: Map<number, string> = new Map();
  pages.set(0, "place.php?whichplace=forestvillage&action=fv_scientist");
  pages.set(1, "choice.php?whichchoice=1201&pwd=&option=1");
  return autoAdvBypass(0, pages, $location`Noob Cave`, null);
}

export function handleSealNormal(it: Item, option?: CombatMacro): boolean {
  let candles: number = 0;
  let level: number = 0;
  switch (it) {
    case $item`figurine of an armored seal`:
      candles = 10;
      level = 9;
      break;
    case $item`figurine of a cute baby seal`:
      candles = 5;
      level = 5;
      break;
    case $item`figurine of a wretched-looking seal`:
      candles = 1;
      level = 1;
      break;
  }

  if (candles === 0) {
    return false;
  }

  if (
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount(it) > 0 &&
    itemAmount($item`seal-blubber candle`) >= candles &&
    myLevel() >= level
  ) {
    ensureSealClubs();
    return autoAdvBypass$2(
      `inv_use.php?pwd=&whichitem=${toInt(it)}&checked=1`,
      $location`Noob Cave`,
      option,
    );
  } else {
    abort(`Can't use ${it} for some raisin`);
  }
  return false;
}
export function handleSealAncient(option?: CombatMacro): boolean {
  if (
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of an ancient seal`) > 0 &&
    itemAmount($item`seal-blubber candle`) >= 3
  ) {
    return autoAdvBypass$2(
      "inv_use.php?pwd=&whichitem=3905&checked=1",
      $location`Noob Cave`,
      option,
    );
  } else {
    abort("Can't use an Ancient Seal for some raisin");
  }
  return false;
}
export function handleSealElement(
  flavor: Element,
  option?: CombatMacro,
): boolean {
  let page: string = "";
  if (
    flavor === $element`hot` &&
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of a charred seal`) > 0 &&
    itemAmount($item`imbued seal-blubber candle`) > 0
  ) {
    page = "inv_use.php?pwd=&whichitem=3909&checked=1";
  }
  if (
    flavor === $element`cold` &&
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of a cold seal`) > 0 &&
    itemAmount($item`imbued seal-blubber candle`) > 0
  ) {
    page = "inv_use.php?pwd=&whichitem=3910&checked=1";
  }
  if (
    flavor === $element`sleaze` &&
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of a slippery seal`) > 0 &&
    itemAmount($item`imbued seal-blubber candle`) > 0
  ) {
    page = "inv_use.php?pwd=&whichitem=3911&checked=1";
  }
  if (
    flavor === $element`spooky` &&
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of a shadowy seal`) > 0 &&
    itemAmount($item`imbued seal-blubber candle`) > 0
  ) {
    page = "inv_use.php?pwd=&whichitem=3907&checked=1";
  }
  if (
    flavor === $element`stench` &&
    toInt(getProperty("_sealsSummoned")) < maxSealSummons() &&
    itemAmount($item`figurine of a stinking seal`) > 0 &&
    itemAmount($item`imbued seal-blubber candle`) > 0
  ) {
    page = "inv_use.php?pwd=&whichitem=3908&checked=1";
  }
  return autoAdvBypass$2(page, $location`Noob Cave`, option);
}

export function handleBarrelFullOfBarrels(daily: boolean): boolean {
  if (!toBoolean(getProperty("barrelShrineUnlocked"))) {
    return false;
  }
  if (daily && toBoolean(getProperty("_didBarrelBustToday"))) {
    return false;
  }
  if (!isUnrestricted($item`shrine to the Barrel god`)) {
    return false;
  }

  const page: string = visitUrl("barrel.php");

  if (!containsText(page, "The Barrel Full of Barrels")) {
    return false;
  }

  let smashed: number = 0;
  const mimic_matcher: AshMatcher = new AshMatcher(
    '<div class="ex">((?:<div class="mimic">!</div>)|)<a class="spot" href="choice.php[?]whichchoice=1099[&]pwd=(?:.*?)[&]option=1[&]slot=(\\d\\d)"><img title="(.*?)"',
    page,
  );
  while (mimic_matcher.find()) {
    const mimic: string = mimic_matcher.group(1);
    const slotID: string = mimic_matcher.group(2);
    const label: string = mimic_matcher.group(3);

    if (mimic !== "") {
      auto_log_warning(`Found mimic in slot: ${slotID}`, "red");
    } else if (label === "A barrel") {
      smashed = smashed + 1;
      visitUrl(`choice.php?whichchoice=1099&pwd&option=1&slot=${slotID}`);
    }
  }
  setProperty("_didBarrelBustToday", true.toString());
  return smashed > 0;
}

export function use_barrels(): boolean {
  if (!toBoolean(getProperty("barrelShrineUnlocked"))) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }
  if (in_bhy()) {
    return false;
  }

  const barrels: Item[] = $items`little firkin, normal barrel, big tun, weathered barrel, dusty barrel, disintegrating barrel, moist barrel, rotting barrel, mouldering barrel, barnacled barrel`;

  let retval: boolean = false;
  for (const it of barrels) {
    if (itemAmount(it) < 10) {
      retval = toBoolean(toInt(retval) | toInt(itemAmount(it) > 0));
      use(itemAmount(it), it);
    }
  }
  return retval;
}

export function auto_autosell(quantity: number, toSell: Item): boolean {
  if (myMeat() > 100000) {
    return false;
  }

  if (itemAmount(toSell) < quantity) {
    return false;
  }

  if (!in_wotsf() && !in_amw()) {
    return autosell(quantity, toSell);
  }
  if (toInt(getProperty("totalCharitableDonations")) < 1000000) {
    return autosell(quantity, toSell);
  }
  return false;
}

export function auto_runChoice(page_text: string): string {
  while (containsText(page_text, "choice.php")) {
    //# Get choice adventure number
    const begin_choice_adv_num: number =
      indexOf(page_text, "whichchoice value=") + 18;
    const end_choice_adv_num: number = indexOf(
      page_text,
      "><input",
      begin_choice_adv_num,
    );
    const choice_adv_num: string = substring(
      page_text,
      begin_choice_adv_num,
      end_choice_adv_num,
    );

    const choice_adv_prop: string = `choiceAdventure${choice_adv_num}`;
    const choice_num: string = getProperty(choice_adv_prop);
    if (choice_num === "") {
      abort("Unsupported Choice Adventure!");
    }

    const url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
    page_text = visitUrl(url);
  }
  return page_text;
}

export function doNumberology(goal: string): number {
  return doNumberology$3(goal, true, null);
}

export function doNumberology$2(goal: string, doIt: boolean): number {
  return doNumberology$3(goal, doIt, null);
}

function doNumberology$3(
  goal: string,
  doIt: boolean,
  option: CombatMacro,
): number {
  if (!auto_have_skill($skill`Calculate the Universe`)) {
    return -1;
  }
  if (
    toInt(getProperty("_universeCalculated")) >=
    min(3, toInt(getProperty("skillLevel144")))
  ) {
    return -1;
  }
  if (myMp() < 2) {
    return -1;
  }

  let numberwang: number = 69; // default to adventures3
  if (goal === "battlefield") {
    numberwang = 51;
  }

  const numberology: Map<number, number> = new Map(
    Object.entries(reverseNumberology()).map(([_k, _v]) => [toInt(_k), _v]),
  );

  if (numberology.has(numberwang)) {
    auto_log_info(
      `Found option for Numberology: ${numberwang} (${goal})`,
      "blue",
    );
    if (!doIt) {
      return (
        numberology.get(numberwang) ??
        numberology.set(numberwang, 0).get(numberwang)
      );
    }

    if (goal === "battlefield") {
      setProperty("auto_nonAdvLoc", true.toString());
      const pages: Map<number, string> = new Map();
      pages.set(0, "runskillz.php?pwd&action=Skillz&whichskill=144&quantity=1");
      pages.set(
        1,
        `choice.php?whichchoice=1103&pwd=&option=1&num=${numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang)}`,
      );
      autoAdvBypass(0, pages, $location`Noob Cave`, option);
      handleTracker$1(
        $monster`War Frat 151st Infantryman`.toString(),
        $skill`Calculate the Universe`.toString(),
        "auto_copies",
      );
    } else {
      visitUrl(
        "runskillz.php?pwd&action=Skillz&whichskill=144&quantity=1",
        true,
      );
      visitUrl(
        `choice.php?whichchoice=1103&pwd=&option=1&num=${numberology.get(numberwang) ?? numberology.set(numberwang, 0).get(numberwang)}`,
      );
    }
    return (
      numberology.get(numberwang) ??
      numberology.set(numberwang, 0).get(numberwang)
    );
  }
  return -1;
}

export function candyEggDeviler(): boolean {
  if (!(
    itemAmount($item`candy egg deviler`) > 0 ||
    storageAmount($item`candy egg deviler`) > 0
  )) {
    //do we have a Candy Egg Deviler?
    return false;
  }
  if (!(toInt(getProperty("_candyEggsDeviled")) < 3)) {
    //already generated our 3 deviled candy eggs today
    return false;
  }

  if (storageAmount($item`candy egg deviler`) > 0) {
    pullXWhenHaveY($item`candy egg deviler`, 1, 0);
  }
  //Below is modified from the synthesis code
  let maxprice: number = 2500;
  if (toInt(getProperty("auto_maxCandyPrice")) !== 0) {
    maxprice = toInt(getProperty("auto_maxCandyPrice"));
  }

  let candyList: Map<number, Item> = new Map();
  for (const it of $items.all()) {
    for (const ut of $items`Comet Pop, black candy heart, explosion-flavored chewing gum`) {
      if (it === ut && itemAmount(it) > 0) {
        candyList.set(candyList.size, it);
      }
    }
    if (
      it.candy &&
      itemAmount(it) > 0 &&
      auto_mall_price(it) <= maxprice &&
      it.tradeable
    ) {
      candyList.set(candyList.size, it);
    }
  }
  if (candyList.size === 0) {
    getCandy();
    for (const it of $items.all()) {
      for (const ut of $items`Comet Pop, black candy heart, explosion-flavored chewing gum`) {
        if (it === ut && itemAmount(it) > 0) {
          candyList.set(candyList.size, it);
        }
      }
      if (
        it.candy &&
        itemAmount(it) > 0 &&
        auto_mall_price(it) <= maxprice &&
        it.tradeable
      ) {
        candyList.set(candyList.size, it);
      }
    }
    if (candyList.size === 0) {
      auto_log_info$1("No candy for a devilled candy egg");
      return false;
    }
  }
  candyList = new Map(
    [...candyList.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: auto_mall_price(value) };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  const candyL: Map<number, Item> = List$8(candyList);
  return cliExecute(
    `devilcandyegg ${candyL.get(0) ?? candyL.set(0, Item.none).get(0)}`,
  );
}

function getCandy(): void {
  for (const sk of $skills`Summon Crimbo Candy, Summon Candy Heart, Chubby and Plump, Summon Hilarious Objects`) {
    //use a skill if we can
    if (auto_have_skill(sk)) {
      useSkill(1, sk);
      return;
    }
  }
  if (
    ["wombat", "blender", "packrat"].includes(toLowerCase(mySign())) &&
    canAdventure($location`South of the Border`)
  ) {
    //buy some candy from gno-mart if we have gnomes
    if (auto_buyUpTo(1, $item`lime-and-chile-flavored chewing gum`)) {
      return;
    }
  }
  if (candyBlock()) {
    return;
  }
  auto_log_info$1("Can't get any candy");
  return;
}

export function auto_have_skill(sk: Skill): boolean {
  return auto_is_valid$2(sk) && haveSkill(sk);
}

//From Bale\'s woods.ash relay script.
export function woods_questStart(): boolean {
  if (myLevel() < 2) {
    return false;
  }
  if (
    internalQuestStatus("questL02Larva") < 0 &&
    internalQuestStatus("questG02Whitecastle") < 0
  ) {
    // distant woods access is gated behind level 2 quest & whitey's grove quest.
    // for some reason mafia doesn't track this any other way
    return false;
  }
  if (in_koe()) {
    // no access to woods or forest village in KoE
    return false;
  }
  if (availableAmount($item`continuum transfunctioner`) > 0) {
    return false;
  }
  visitUrl("place.php?whichplace=woods");
  visitUrl("place.php?whichplace=forestvillage&action=fv_mystic");
  if (!in_zombieSlayer()) {
    visitUrl(
      "choice.php?pwd=&whichchoice=664&option=1&choiceform1=Sure%2C+old+man.++Tell+me+all+about+it.",
    );
    visitUrl(
      "choice.php?pwd=&whichchoice=664&option=1&choiceform1=Against+my+better+judgment%2C+yes.",
    );
    visitUrl(
      "choice.php?pwd=&whichchoice=664&option=1&choiceform1=Er,+sure,+I+guess+so...",
    );
  }
  if (knollAvailable()) {
    visitUrl("place.php?whichplace=knoll_friendly&action=dk_innabox");
    visitUrl("place.php?whichplace=forestvillage&action=fv_untinker");
  } else {
    visitUrl(
      "place.php?whichplace=forestvillage&preaction=screwquest&action=fv_untinker_quest",
    );
  }
  return true;
}

export function hasShieldEquipped(): boolean {
  return itemType(equippedItem($slot`off-hand`)) === "shield";
}

export function careAboutDrops(mon: Monster): boolean {
  if (
    $monsters`Astronomer, Axe Wound, Beaver, Box, Burrowing Bishop, Bush, Camel's Toe, Family Jewels, Flange, Honey Pot, Hooded Warrior, Junk, Little Man in the Canoe, Muff, One-Eyed Willie, Pork Sword, Skinflute, Trouser Snake, Twig and Berries`.includes(
      mon,
    )
  ) {
    if (!needStarKey()) {
      return false;
    }
    if ($monster`Astronomer` === mon && itemAmount($item`star chart`) > 0) {
      return false;
    }
    //We could refine this to get rid of all the all stars / lines mobs but meh.
    if (
      $monster`Astronomer` !== mon &&
      (itemAmount($item`star`) < 8 || itemAmount($item`line`) < 7)
    ) {
      return true;
    }
    return false;
  }
  /*
pygmy bowler
pygmy witch accountant
white lion
white snake
baseball bat
briefcase bat
doughbat
perpendicular bat
skullbat
vampire bat
batrat
ratbat
beanbat
banshee librarian
knob Goblin Harem Girl
spiny skelelton
toothy sklelton
sassy pirate
smarmy pirate
swarthy pirate
tetchy pirate
toothy pirate
tipsy pirate
chatty pirate
cleanly pirate
clingy pirate
creamy pirate
crusty pirate
curmudgeonly pirate
dairy goat
ninja snowman assassin
smut orc jacker
smut orc nailer
smut orc pervert
smut orc pipelayer
smut orc screwer
Whatsian Commando Ghost
Space Tourist Explorer Ghost
Dusken Raider Ghost
Claybender Sorcerer Ghost
Battlie Knight Ghost
bearpig topiary animal
elephant (meatcar?) topiary animal
spider (duck?) topiary animal
oil cartel
oil baron
oil tycoon
Burly Sidekick
Quiet Healer
lobsterfrogman
possessed wine rack
cabinet of Dr. Limpieza
*/
  return false;
}

export function effectiveDropChance(it: Item, baseDropRate: number): number {
  //0 to 100 chance to drop at end of fight
  let item_modifier: number = itemDropModifier();

  if (baseDropRate > 0) {
    if (itemType(it) === "food") {
      //todo? cooking ingredients
      item_modifier += numericModifier("Food Drop");
    }
    if (itemType(it) === "booze") {
      //todo? cocktailcrafting ingredients
      item_modifier += numericModifier("Booze Drop");
    }
    if (it.candy) {
      item_modifier += numericModifier("Candy Drop");
    }
    if (
      toSlot(it) !== Slot.none &&
      $slots`hat, shirt, weapon, off-hand, pants, acc1, acc2, acc3, back`.includes(
        toSlot(it),
      )
    ) {
      item_modifier += numericModifier("Gear Drop");

      if (toSlot(it) === $slot`hat`) {
        item_modifier += numericModifier("Hat Drop");
      }
      if (toSlot(it) === $slot`shirt`) {
        item_modifier += numericModifier("Shirt Drop");
      }
      if (toSlot(it) === $slot`weapon`) {
        item_modifier += numericModifier("Weapon Drop");
      }
      if (toSlot(it) === $slot`off-hand`) {
        item_modifier += numericModifier("Offhand Drop");
      }
      if (toSlot(it) === $slot`pants`) {
        item_modifier += numericModifier("Pants Drop");
      }
      if ($slots`acc1, acc2, acc3`.includes(toSlot(it))) {
        item_modifier += numericModifier("Accessory Drop");
      }
    }
  }

  let retval: number = (baseDropRate * (100 + item_modifier)) / 100.0;
  retval = min(100, retval); //final drop chance % before special modifiers

  if (retval > 0) {
    if (in_lar()) {
      if (retval * 2 >= 100) {
        retval = 100;
      } else {
        retval = 0;
      }
    }

    if (in_heavyrains()) {
      let depth: number = toInt(
        myLocation().waterLevel + numericModifier("Water Level"),
      );
      depth = max(1, depth);
      depth = min(6, depth);
      let heavyrainsWashChance: number = (5.0 * depth) / 100;
      if (haveEffect($effect`Fishy Whiskers`) > 0) {
        heavyrainsWashChance -= 0.1;
      }
      if (equippedAmount($item`fishbone catcher's mitt`) > 0) {
        //todo exact rate?
        heavyrainsWashChance -= 0.1;
      }
      retval = retval * (1 - max(0, heavyrainsWashChance));
    }

    if (in_wildfire()) {
      let wildfireBurnChance: number;
      switch (myLocation().fireLevel) {
        case 5:
          wildfireBurnChance = 1;
          break;
        case 4:
          wildfireBurnChance = 0.768;
          break;
        case 3:
          wildfireBurnChance = 0.361;
          break;
        case 2:
          wildfireBurnChance = 0.109;
          break;
        default:
          wildfireBurnChance = 0;
          break;
      }
      retval = retval * (1 - wildfireBurnChance);
    }

    if (myFamiliar() === $familiar`Black Cat`) {
      //todo actual chance to lose drop?
      retval = retval * 0.75;
    } else if (myFamiliar() === $familiar`O.A.F.`) {
      //todo actual chance to lose drop?
      retval = retval * 0.75;
    }
  }

  return max(0, retval);
}

export function ATSongList(): Map<Effect, boolean> {
  // This List contains ALL AT songs in order from Most to Least Important as to determine what effect to shrug off.
  const songs: Map<Effect, boolean> = new Map([
    [$effect`Inigo's Incantation of Inspiration`, true],
    [$effect`The Ballad of Richie Thingfinder`, true],
    [$effect`Chorale of Companionship`, true],
    // under normal circumstances we should never get this, but if we do we want to keep it
    [$effect`Dirge of Dreadfulness (Remastered)`, true],
    [$effect`Ode to Booze`, true],
    [$effect`Ur-Kel's Aria of Annoyance`, true],
    [$effect`Carlweather's Cantata of Confrontation`, true],
    [$effect`The Sonata of Sneakiness`, true],
    [$effect`Fat Leon's Phat Loot Lyric`, true],
    [$effect`Polka of Plenty`, true],
    [$effect`Psalm of Pointiness`, true],
    [$effect`Aloysius' Antiphon of Aptitude`, true],
    [$effect`Paul's Passionate Pop Song`, true],
    [$effect`Donho's Bubbly Ballad`, true],
    [$effect`Prelude of Precision`, true],
    [$effect`Elron's Explosive Etude`, true],
    [$effect`Benetton's Medley of Diversity`, true],
    [$effect`Dirge of Dreadfulness`, true],
    [$effect`Stevedave's Shanty of Superiority`, true],
    [$effect`Brawnee's Anthem of Absorption`, true],
    [$effect`Jackasses' Symphony of Destruction`, true],
    [$effect`Power Ballad of the Arrowsmith`, true],
    [$effect`Cletus's Canticle of Celerity`, true],
    [$effect`Cringle's Curative Carol`, true],
    [$effect`The Magical Mojomuscular Melody`, true],
    [$effect`The Moxious Madrigal`, true],
  ]);

  return songs;
}

export function shrugAT(anticipated: Effect): void {
  if (
    is_boris() ||
    is_jarlsberg() ||
    is_pete() ||
    isActuallyEd() ||
    in_darkGyffte() ||
    in_plumber()
  ) {
    return;
  }
  //If you think we are handling song overages, you are cray cray....
  if (haveEffect(anticipated) > 0) {
    //We have the effect, we do not need to shrug it, just let it propagate.
    return;
  }

  if (!auto_have_skill(toSkill(anticipated))) {
    //We don't know that song anyway
    return;
  }

  let maxSongs: number = 3;
  if (
    haveEquipped($item`Brimstone Beret`) ||
    haveEquipped(wrap_item($item`Operation Patriot Shield`)) ||
    haveEquipped($item`plexiglass pendant`) ||
    haveEquipped($item`Scandalously Skimpy Bikini`) ||
    haveEquipped($item`Sombrero De Vida`) ||
    haveEquipped($item`super-sweet boom box`)
  ) {
    maxSongs = 4;
  }

  if (haveEquipped($item`La Hebilla del Cinturón de Lopez`)) {
    maxSongs += 1;
  }
  if (haveEquipped($item`zombie accordion`)) {
    maxSongs += 1;
  }
  if (auto_have_skill($skill`Mariachi Memory`)) {
    maxSongs += 1;
  }

  let count_1: number = 1;

  for (const ATsong of ATSongList().keys()) {
    if (haveEffect(ATsong) > 0) {
      count_1 += 1;
      if (count_1 > maxSongs) {
        auto_log_info(`Shrugging song: ${ATsong}`, "blue");
        uneffect(ATsong);
      }
    }
  }
  auto_log_info(`I think we're good to go to apply ${anticipated}`, "blue");
}

let $_auto_get_campground_didCheck: boolean | undefined;

export function auto_get_campground(): Map<Item, number> {
  //Wrapper for get_campground(), primarily deals with the oven issue in Ed.
  //Also uses Garden item as identifier for the garden in addition to what get_campground() does

  if (isActuallyEd()) {
    const empty: Map<Item, number> = new Map();
    return empty;
  }
  const campItems: Map<Item, number> = new Map(
    Object.entries(getCampground()).map(([_k, _v]) => [Item.get(_k), _v]),
  );

  if (campItems.has($item`ice harvest`)) {
    campItems.set($item`packet of winter seeds`, 1);
  }
  if (campItems.has($item`frost flower`)) {
    campItems.set($item`packet of winter seeds`, 1);
  }
  if (campItems.has($item`handful of barley`)) {
    campItems.set($item`packet of beer seeds`, 1);
  }
  if (campItems.has($item`fancy beer label`)) {
    campItems.set($item`packet of beer seeds`, 1);
  }
  if (campItems.has($item`skeleton`)) {
    campItems.set($item`packet of dragon's teeth`, 1);
  }
  if (campItems.has($item`giant candy cane`)) {
    campItems.set($item`Peppermint Pip Packet`, 1);
  }
  if (campItems.has($item`peppermint sprout`)) {
    campItems.set($item`Peppermint Pip Packet`, 1);
  }
  if (campItems.has($item`ginormous pumpkin`)) {
    campItems.set($item`packet of pumpkin seeds`, 1);
  }
  if (campItems.has($item`huge pumpkin`)) {
    campItems.set($item`packet of pumpkin seeds`, 1);
  }
  if (campItems.has($item`pumpkin`)) {
    campItems.set($item`packet of pumpkin seeds`, 1);
  }
  if (campItems.has($item`cornucopia`)) {
    campItems.set($item`packet of thanksgarden seeds`, 1);
  }
  if (campItems.has($item`megacopia`)) {
    campItems.set($item`packet of thanksgarden seeds`, 1);
  }
  if (campItems.has($item`Poké-Gro fertilizer`)) {
    campItems.set($item`packet of tall grass seeds`, 1);
  }

  if (
    campItems.has($item`Source terminal`) &&
    !toBoolean(getProperty("auto_haveSourceTerminal"))
  ) {
    setProperty("auto_haveSourceTerminal", true.toString());
  }

  $_auto_get_campground_didCheck ??= false;
  if (in_nuclear() && !$_auto_get_campground_didCheck) {
    $_auto_get_campground_didCheck = true;
    const temp: string = visitUrl(
      "place.php?whichplace=falloutshelter&action=vault_term",
    );
    if (containsText(temp, "Source Terminal")) {
      setProperty("auto_haveSourceTerminal", true.toString());
    }
  }

  if (
    !campItems.has($item`Dramatic™ range`) &&
    toBoolean(getProperty("auto_haveoven"))
  ) {
    campItems.set($item`Dramatic™ range`, 1);
  }
  if (
    !campItems.has($item`Source terminal`) &&
    toBoolean(getProperty("auto_haveSourceTerminal"))
  ) {
    campItems.set($item`Source terminal`, 1);
  }

  return campItems;
}

export function haveCampgroundMaid(): boolean {
  const campItems: Map<Item, number> = auto_get_campground();
  if (campItems.has($item`Meat maid`)) {
    return true;
  }
  if (campItems.has($item`clockwork maid`)) {
    return true;
  }
  if (campItems.has($item`Meat Butler`)) {
    return true;
  }
  return false;
}

export function auto_is_valid(it: Item): boolean {
  if (!glover_usable(it.toString())) {
    if (it !== $item`protonic accelerator pack`) {
      return false;
    } else if (!expectGhostReport() && !haveGhostReport()) {
      return false;
    }
  }
  if (it === $item`grimstone mask`) {
    if (!isGuildClass()) {
      //it seems like all non core classes are disallowed. need to spade this to verify if any class is exempt
      return false;
    }
  }
  if (in_bhy()) {
    return bhy_is_item_valid(it);
  }
  if (in_iluh() && it.fullness > 0) {
    // only care about foods being consumable in iluh
    return iluh_foodConsumable(it.toString());
  }
  if (myPath() === $path`Trendy`) {
    return isTrendy(it);
  }

  return isUnrestricted(it);
}

export function auto_is_valid$1(fam: Familiar): boolean {
  if (is100FamRun()) {
    return toFamiliar(getProperty("auto_100familiar")) === fam;
  }
  if (myPath() === $path`Trendy`) {
    return isTrendy(fam);
  }
  return (
    bhy_usable(fam.toString()) &&
    glover_usable(fam.toString()) &&
    zombieSlayer_usable(fam) &&
    wereprof_usable(fam.toString()) &&
    iluh_famAllowed(fam.toString()) &&
    isUnrestricted(fam)
  );
}

export function auto_is_valid$2(sk: Skill): boolean {
  // trendy restricts which skills are valid
  if (myPath() === $path`Trendy`) {
    return isTrendy(sk);
  }
  // Hack for Legacy of Loathing as is_unrestricted returns false for Source Terminal skills
  if (
    in_lol() &&
    $skills`Extract, Turbo, Digitize, Duplicate, Portscan, Compress`.includes(
      sk,
    )
  ) {
    return true;
  }
  // No skills for the Professor except Advanced Research in WereProf
  if (is_professor() && sk !== toSkill(7512)) {
    return false;
  }
  //do not check check for B in bees hate you path. it only restricts items and not skills.
  return (
    (glover_usable(sk.toString()) ||
      (sk.passive && sk !== $skill`Disco Nap`)) &&
    bat_skillValid(sk) &&
    plumber_skillValid(sk) &&
    isUnrestricted(sk)
  );
}

export function auto_is_valid$3(eff: Effect): boolean {
  return glover_usable(eff.toString());
}

export function auto_is_valid$4(str: string): boolean {
  // unknown entries, presumably Bookshelf skills
  if (myPath() === $path`Trendy`) {
    return isTrendy(str);
  }

  return isUnrestricted(str);
}

function auto_log(s: string, color: string, log_level: number): void {
  if (log_level > toInt(getProperty("auto_log_level"))) {
    return;
  }
  switch (log_level) {
    case 1:
      print(`[WARNING] ${s}`, color);
      break;
    case 2:
      print(`[INFO] ${s}`, color);
      break;
    case 3:
      print(`[DEBUG] ${s}`, color);
      break;
  }
}

export function auto_log_error(s: string): void {
  print(`[ERROR] ${s}`, "red");
}

export function auto_log_warning(s: string, color: string): void {
  auto_log(s, color, 1);
}

export function auto_log_warning$1(s: string): void {
  auto_log(s, "orange", 1);
}

export function auto_log_info(s: string, color: string): void {
  auto_log(s, color, 2);
}

export function auto_log_info$1(s: string): void {
  auto_log(s, "blue", 2);
}

export function auto_log_debug(s: string, color: string): void {
  auto_log(s, color, 3);
}

export function auto_log_debug$1(s: string): void {
  auto_log(s, "black", 3);
}

export function auto_turbo(): boolean {
  return toBoolean(getProperty("auto_turbo"));
}

export function auto_can_equip(it: Item): boolean {
  return auto_can_equip$1(it, toSlot(it));
}

export function auto_can_equip$1(it: Item, s: Slot): boolean {
  if (s === $slot`shirt` && !hasTorso()) {
    return false;
  }

  if (
    s === $slot`off-hand` &&
    toSlot(it) === $slot`weapon` &&
    !auto_have_skill($skill`Double-Fisted Skull Smashing`)
  ) {
    return false;
  }

  if (
    (s === $slot`weapon` || s === $slot`off-hand`) &&
    (in_wotsf() || (is_boris() && it !== $item`Trusty`))
  ) {
    return false;
  }

  if (
    itemType(it) === "chefstaff" &&
    (!(
      auto_have_skill($skill`Spirit of Rigatoni`) ||
      (myClass() === $class`Sauceror` &&
        equippedAmount($item`special sauce glove`) > 0) ||
      myClass() === $class`Avatar of Jarlsberg`
    ) ||
      s !== $slot`weapon`)
  ) {
    return false;
  }

  return auto_is_valid(it) && canEquip(it);
}
// Conditionals are formatted as "<condition type>:<data>"
// Multiple conditionals can be added separated by a semicolon (;) with NO SPACES
// Conditionals can be prepended with a ! to indicate that they must be FALSE
// See the switch statement for valid condition types and a description of their data
export function auto_check_conditions(conds: string): boolean {
  if (conds === "") {
    return true;
  }

  const conditions: Map<number, string> = new Map(
    splitString(conds, ";").map((_v, _i) => [_i, _v]),
  );

  function compare_numbers(
    num1: number,
    num2: number,
    comparison: string,
  ): boolean {
    switch (comparison) {
      case "=":
      case "==":
        return num1 === num2;
      case ">":
        return num1 > num2;
      case "<":
        return num1 < num2;
      case ">=":
        return num1 >= num2;
      case "<=":
        return num1 <= num2;
      default:
        abort(`"${comparison}" is not a valid comparison operator!`);
    }
    return false;
  }
  // does not account for !, the loop does that
  function check_condition(cond: string): boolean {
    const m: AshMatcher = new AshMatcher("^(\\w+):(.+)$", cond);
    if (!m.find()) {
      abort(`"${cond}" is not proper condition formatting!`);
    }
    const condition_type: string = m.group(1);
    const condition_data: string = m.group(2);
    {
      switch (condition_type) {
        case "class": {
          // data: The text name of the class, as used by to_class()
          // You must be the given class
          // As a precaution, autoscend aborts if to_class returns $class[none]
          const req_class: Class = toClass(condition_data);
          if (req_class === Class.none) {
            abort(`"${condition_data}" does not properly convert to a class!`);
          }
          return req_class === myClass();
        }
        case "mainstat": {
          // data: The text name of the mainstat, as used by to_stat()
          // Your mainstat must be the given stat
          // As a precaution, autoscend aborts if to_stat returns $stat[none]
          const req_mainstat: Stat = toStat(condition_data);
          if (req_mainstat === Stat.none) {
            abort(`"${condition_data}" does not properly convert to a stat!`);
          }
          return req_mainstat === myPrimestat();
        }
        case "path": {
          // data: The text name of the path, as returned by my_path().name
          // You must be currently on that path
          // No safety checking possible here, so hopefully you don't misspell anything
          return condition_data === myPath().name;
        }
        case "pathid": {
          // data: The int id name of the path, as returned by my_path().id
          // You must be currently on that path
          // As a precaution, autoscend aborts if to_int returns 0
          const req_pathid: number = toInt(condition_data);
          if (req_pathid === 0) {
            abort(
              `"${condition_data}" does not properly convert to a path id!`,
            );
          }
          return req_pathid === myPath().id;
        }
        case "skill": {
          // data: Text name of the skill, as used by to_skill()
          // You must have the given skill
          // As a precaution, autoscend aborts if to_skill returns $skill[none]
          const req_skill: Skill = toSkill(condition_data);
          if (req_skill === Skill.none) {
            abort(`"${condition_data}" does not properly convert to a skill!`);
          }
          return auto_have_skill(req_skill);
        }
        case "effect": {
          // data: Text name of the effect, as used by to_effect()
          // You must have at least one turn of the given effect
          // As a precaution, autoscend aborts if to_effect returns $effect[none]
          const req_effect: Effect = toEffect(condition_data);
          if (req_effect === Effect.none) {
            abort(
              `"${condition_data}" does not properly convert to an effect!`,
            );
          }
          return haveEffect(req_effect) > 0;
        }
        case "item": {
          // data: <item name><comparison operator><value>
          // The number of that item you have must compare properly
          // As a precaution, autoscend aborts if to_item returns $item[none]
          const m5: AshMatcher = new AshMatcher(
            "([^=<>]+)([=<>]+)(.+)",
            condition_data,
          );
          if (!m5.find()) {
            abort(`"${condition_data}" is not a proper item condition format!`);
          }
          const req_item: Item = toItem(m5.group(1));
          if (req_item === Item.none) {
            abort(`"${m5.group(1)}" does not properly convert to an item!`);
          }
          return compare_numbers(
            itemAmount(req_item) + equippedAmount(req_item),
            toInt(m5.group(3)),
            m5.group(2),
          );
        }
        case "itemdropcapped": {
          // data: <value><equal sign separator><item name>
          // The chance of getting the item at the end of the fight from that base drop rate value must be 100
          // As a precaution, autoscend aborts if to_item returns $item[none]
          const m7: AshMatcher = new AshMatcher(
            "([^=<>]+)=(.+)",
            condition_data,
          );
          if (!m7.find()) {
            abort(`"${condition_data}" is not a proper item condition format!`);
          }
          const todrop_item: Item = toItem(m7.group(2));
          const base_drop_chance: number = toFloat(m7.group(1));
          if (todrop_item === Item.none) {
            abort(`"${m7.group(1)}" does not properly convert to an item!`);
          }
          return effectiveDropChance(todrop_item, base_drop_chance) >= 100;
        }
        case "outfit":
          // data: The outfit name as used by have_outfit
          // You must have the given outfit
          // No safety checking here possible, at least not conveniently
          return haveOutfit(condition_data);
        case "familiar": {
          // data: Text name of the familiar, as used by to_familiar()
          // You must be currently using this familiar
          // As a precaution, autoscend aborts if to_familiar returns $familiar[none]
          // Unless the text is literall "none" (case sensitive)
          const req_familiar: Familiar = toFamiliar(condition_data);
          if (req_familiar === Familiar.none && condition_data !== "none") {
            abort(
              `"${condition_data}" does not properly convert to a familiar!`,
            );
          }
          return myFamiliar() === req_familiar;
        }
        case "havefamiliar": {
          // data: Text name of the familiar, as used by to_familiar()
          // You must own this familiar, and it must be legal
          // As a precaution, autoscend aborts if to_familiar returns $familiar[none]
          const havefamiliar: Familiar = toFamiliar(condition_data);
          if (havefamiliar === Familiar.none) {
            abort(
              `"${condition_data}" does not properly convert to a familiar!`,
            );
          }
          return auto_have_familiar(havefamiliar);
        }
        case "loc": {
          // data: Text name of the location, as used by to_location()
          // You must be in this location (if you want to check for elsewhere, temporarily set_location)
          // As a precaution, autoscend aborts if to_location returns $location[none]
          const req_loc: Location = toLocation(condition_data);
          if (req_loc === Location.none) {
            abort(
              `"${condition_data}" does not properly convert to a location!`,
            );
          }
          return myLocation() === req_loc;
        }
        case "turnsspent": {
          // data: <location><comparison operator><integer value>
          // As a precaution, autoscend aborts if to_location returns $location[none]
          const m6: AshMatcher = new AshMatcher(
            "([^=<>]+)([=<>]+)(.+)",
            condition_data,
          );
          if (!m6.find()) {
            abort(
              `"${condition_data}" is not a proper turnsspent condition format!`,
            );
          }
          const loc: Location = toLocation(m6.group(1));
          if (loc === Location.none) {
            abort(
              `"${condition_data}" does not properly convert to a location!`,
            );
          }
          if (!["=", "=="].includes(m6.group(2))) {
            return compare_numbers(
              loc.turnsSpent,
              toInt(m6.group(3)),
              m6.group(2),
            );
          }
          return loc.turnsSpent === toInt(m6.group(3));
        }
        case "prop": {
          // data: <propname><comparison operator><value>
          // >/</>=/<= only supported for integer properties!
          const m2: AshMatcher = new AshMatcher(
            "([^=<>]+)([=<>]+)(.+)",
            condition_data,
          );
          if (!m2.find()) {
            abort(`"${condition_data}" is not a proper prop condition format!`);
          }
          const prop: string = getProperty(m2.group(1));
          if (!["=", "=="].includes(m2.group(2))) {
            return compare_numbers(
              toInt(prop),
              toInt(m2.group(3)),
              m2.group(2),
            );
          }
          return prop === m2.group(3);
        }
        case "prop_boolean":
          // data: <propname>
          // gets propname and converts to a boolean
          return toBoolean(getProperty(condition_data));
        case "quest": {
          // data: <questpropname><comparison operator><value>
          // like prop, but with > and < and >= and <= and uses internalQuestStatus
          // the value to compare to should always be an integer
          const m3: AshMatcher = new AshMatcher(
            "([^=<>]+)([=<>]+)(.+)",
            condition_data,
          );
          if (!m3.find()) {
            abort(
              `"${condition_data}" is not a proper quest condition format!`,
            );
          }
          const quest_state: number = internalQuestStatus(m3.group(1));
          const compare_to: number = toInt(m3.group(3));
          return compare_numbers(quest_state, compare_to, m3.group(2));
        }
        case "sniffed": {
          // data: Text name of the monster, as used by to_monster()
          // True if that monster has been sniffed by any olfaction-like
          // As a precaution, autoscend will abort if to_monster returns $monster[none]
          const check_sniffed: Monster = toMonster(condition_data);
          if (check_sniffed === Monster.none) {
            abort(
              `"${condition_data}" does not properly convert to a monster!`,
            );
          }
          if (
            haveEffect($effect`On the Trail`) > 0 &&
            toMonster(getProperty("olfactedMonster")) === check_sniffed
          ) {
            return true;
          }
          if (
            isActuallyEd() &&
            toMonster(getProperty("stenchCursedMonster")) === check_sniffed
          ) {
            return true;
          }
          if (
            is_pete() &&
            toMonster(getProperty("makeFriendsMonster")) === check_sniffed
          ) {
            return true;
          }
          if (
            $classes`Cow Puncher, Beanslinger, Snake Oiler`.includes(
              myClass(),
            ) &&
            toMonster(getProperty("longConMonster")) === check_sniffed
          ) {
            return true;
          }
          if (
            in_darkGyffte() &&
            toMonster(getProperty("auto_bat_soulmonster")) === check_sniffed
          ) {
            return true;
          }
          if (toMonster(getProperty("_gallapagosMonster")) === check_sniffed) {
            return true;
          }
          if (toMonster(getProperty("monkeyPointMonster")) === check_sniffed) {
            return true;
          }
          if (toMonster(getProperty("_latteMonster")) === check_sniffed) {
            return true;
          }
          if (toMonster(getProperty("motifMonster")) === check_sniffed) {
            return true;
          }
          return false;
        }
        case "expectghostreport":
          // data: Doesn't matter, but put something so I don't have to support dataless conditions
          // True when you expect a protonic ghost report
          // Pretty much just for the protonic accelerator pack
          return expectGhostReport();
        case "latte":
          // data: Doesn't matter, but put something so I don't have to support dataless conditions
          // True when there is a latte unlock available in the area (that you don't have, of course)
          // Pretty much just for the latte
          return auto_latteDropAvailable(myLocation());
        case "tavern":
          // data: Doesn't matter, but put something so I don't have to support dataless conditions
          // True if the hidden tavern has been unlocked this ascension
          return toInt(getProperty("hiddenTavernUnlock")) >= myAscensions();
        case "sgeea": {
          // data: The number of sgeeas you want to have
          // True if you have at least that many sgeeas at your disposal
          const sgeeas: number = toInt(condition_data);
          return itemAmount($item`soft green echo eyedrop antidote`) >= sgeeas;
        }
        case "day": {
          // data: The day to check for
          // True if we are currently on that day
          const day: number = toInt(condition_data);
          return myDaycount() === day;
        }
        case "ML": {
          const m4: AshMatcher = new AshMatcher("([=<>]+)(.+)", condition_data);
          if (!m4.find()) {
            abort(`"${condition_data}" is not a proper ML condition format!`);
          }
          return compare_numbers(
            monsterLevelAdjustment(),
            toInt(m4.group(2)),
            m4.group(1),
          );
        }
        case "consume": {
          // data: eat\drink\chew
          // True if we can eat\drink\chew anything today
          switch (condition_data) {
            case "eat":
              return fullness_left() > 0;
            case "drink":
              return inebriety_left() > 0;
            case "chew":
              return spleen_left() > 0;
            default: {
              abort(`Invalid consume type "${condition_type}" found!`);
            }
          }
          break;
        }
        default:
          abort(`Invalid condition type "${condition_type}" found!`);
      }
    }
  }

  for (const [, cond] of conditions) {
    const m: AshMatcher = new AshMatcher("^(!?)(.+)$", cond);
    if (!m.find()) {
      abort(`"${cond}" is not a proper condition!`);
    }
    const invert: boolean = m.group(1) === "!";
    const success: boolean = check_condition(m.group(2));

    if (success === invert) {
      return false;
    }
  }

  return true;
}

function auto_getMonsters(category: string): Map<Monster, boolean> {
  const res: Map<Monster, boolean> = new Map();
  const monsters_text: Map<
    string,
    Map<number, Map<string, string>>
  > = fileAsMap("autoscend_monsters.txt", [String, Number, String, String]);
  if (!monsters_text.size) {
    auto_log_error("Could not load autoscend_monsters.txt. This is bad!");
  }
  for (const [, _v0] of monsters_text.get(category) ??
    monsters_text.set(category, new Map()).get(category)) {
    for (const [name, _v1] of _v0) {
      const conds = _v1;
      const thisMonster: Monster = toMonster(name);
      if (thisMonster === Monster.none) {
        auto_log_warning(
          `"${name}" does not convert to a monster properly!`,
          "red",
        );
        continue;
      }
      if (!auto_check_conditions(conds)) {
        continue;
      }
      res.set(thisMonster, true);
    }
  }
  return res;
}

function auto_getPhylum(category: string): Map<Phylum, boolean> {
  const res: Map<Phylum, boolean> = new Map();
  const phylum_text: Map<string, Map<number, Map<string, string>>> = fileAsMap(
    "autoscend_phylums.txt",
    [String, Number, String, String],
  );
  if (!phylum_text.size) {
    auto_log_error("Could not load autoscend_phylums.txt. This is bad!");
  }
  for (const [, _v0] of phylum_text.get(category) ??
    phylum_text.set(category, new Map()).get(category)) {
    for (const [name, _v1] of _v0) {
      const conds = _v1;
      const thisPhylum: Phylum = toPhylum(name);
      if (thisPhylum === Phylum.none) {
        auto_log_warning(
          `"${name}" does not convert to a phylum properly!`,
          "red",
        );
        continue;
      }
      if (!auto_check_conditions(conds)) {
        continue;
      }
      res.set(thisPhylum, true);
    }
  }
  return res;
}

export function auto_wantToSniff(enemy: Monster, loc: Location): boolean {
  const locCache: Location = myLocation();
  setLocation(loc);
  const toSniff: Map<Monster, boolean> = auto_getMonsters("sniff");
  if (
    (toSniff.get(enemy) ?? toSniff.set(enemy, false).get(enemy)) &&
    (auto_combat_appearance_rates$1(loc).get(enemy) ??
      auto_combat_appearance_rates$1(loc).set(enemy, 0.0).get(enemy)) < 100
  ) {
    setLocation(locCache);
    return true;
  }
  setLocation(locCache);
  return false;
}

export function auto_wantToYellowRay(enemy: Monster, loc: Location): boolean {
  const locCache: Location = myLocation();
  setLocation(loc);
  const toSniff: Map<Monster, boolean> = auto_getMonsters("yellowray");
  setLocation(locCache);
  return toSniff.get(enemy) ?? toSniff.set(enemy, false).get(enemy);
}

export function auto_wantToReplace(enemy: Monster, loc: Location): boolean {
  const locCache: Location = myLocation();
  setLocation(loc);
  const toReplace: Map<Monster, boolean> = auto_getMonsters("replace");
  setLocation(locCache);
  return toReplace.get(enemy) ?? toReplace.set(enemy, false).get(enemy);
}

export function auto_wantToCopy(enemy: Monster, loc: Location): boolean {
  const locCache: Location = myLocation();
  setLocation(loc);
  const toCopy: Map<Monster, boolean> = auto_getMonsters("copy");
  setLocation(locCache);
  return toCopy.get(enemy) ?? toCopy.set(enemy, false).get(enemy);
}

function auto_wantToCopy$1(enemy: Monster): boolean {
  const toCopy: Map<Monster, boolean> = auto_getMonsters("copy");
  return toCopy.get(enemy) ?? toCopy.set(enemy, false).get(enemy);
}

export function zoneRank(mon: Monster, loc: Location): number {
  if (auto_wantToYellowRay(mon, loc)) {
    return 1;
  }
  if (auto_wantToCopy$1(mon)) {
    return 2;
  }
  if (auto_wantToSniff(mon, loc)) {
    return 3;
  }
  if (
    auto_wantToBanish(mon, loc) ||
    auto_wantToFreeRun(mon, loc) ||
    auto_wantToReplace(mon, loc)
  ) {
    return 999;
  }
  return 4;
}

export function total_items(items: Map<Item, boolean>): number {
  let total: number = 0;
  for (const it of items.keys()) {
    total += itemAmount(it);
  }
  return total;
}

export function auto_badassBelt(): boolean {
  if (
    (itemAmount($item`batskin belt`) > 0 ||
      equippedAmount($item`batskin belt`) > 0) &&
    (itemAmount($item`skull of the Bonerdagon`) > 0 ||
      equippedAmount($item`skull of the Bonerdagon`) > 0)
  ) {
    if (haveEquipped($item`skull of the Bonerdagon`)) {
      equip($slot`off-hand`, Item.none);
    }
    if (haveEquipped($item`batskin belt`)) {
      if (equippedItem($slot`acc1`) === $item`batskin belt`) {
        equip($slot`acc1`, Item.none);
      } else if (equippedItem($slot`acc2`) === $item`batskin belt`) {
        equip($slot`acc2`, Item.none);
      } else if (equippedItem($slot`acc3`) === $item`batskin belt`) {
        equip($slot`acc3`, Item.none);
      }
    }
    return create(1, $item`badass belt`);
  } else {
    return false;
  }
}

export function meatReserveMessage(): void {
  const reserve: number = meatReserve();
  if (reserve > 0) {
    auto_log_info$1(
      `Autoscend thinks that you need ${reserve} meat for remaining quest requirements this ascension.`,
    );
  }
  return;
}

function auto_interruptZoneCheck(): boolean {
  const currentZone: string = myLocation().toString();
  const interruptZones: string = getProperty("auto_interruptZones");
  const interruptedZones: string = toBuffer(
    getProperty("auto_interruptedZones"),
  );
  if (interruptZones === "" || containsText(interruptedZones, currentZone)) {
    return false;
  }

  for (const [, zone] of splitString(interruptZones, ";").entries()) {
    if (toLocation(zone) === myLocation()) {
      append(interruptedZones, `${currentZone};`);
      setProperty("auto_interruptedZones", interruptedZones);
      return true;
    }
  }

  return false;
}

export function auto_interruptCheck(debug: boolean): void {
  if (toBoolean(getProperty("auto_interrupt"))) {
    setProperty("auto_interrupt", false.toString());
    restoreAllSettings();
    meatReserveMessage();
    abort("auto_interrupt detected and aborting, auto_interrupt disabled.");
  } else if (auto_interruptZoneCheck()) {
    abort(
      `auto_interruptZones detected, aborting at ${myLocation().toString()}`,
    );
  } else if (toBoolean(getProperty("auto_debugging")) && debug) {
    setProperty("auto_interrupt", true.toString());
    auto_log_info$1("auto_debugging detected, auto_interrupt enabled.");
  }
}

export function auto_interruptCheck$1(): void {
  //we check for interrupt at multiple locations. but we only want to set it once per loop in debug mode.
  auto_interruptCheck(true);
}

export function currentFlavour(): Element {
  if (haveEffect($effect`Spirit of Peppermint`) !== 0) {
    return $element`cold`;
  }
  if (haveEffect($effect`Spirit of Bacon Grease`) !== 0) {
    return $element`sleaze`;
  }
  if (haveEffect($effect`Spirit of Garlic`) !== 0) {
    return $element`stench`;
  }
  if (haveEffect($effect`Spirit of Cayenne`) !== 0) {
    return $element`hot`;
  }
  if (haveEffect($effect`Spirit of Wormwood`) !== 0) {
    return $element`spooky`;
  }

  return Element.none;
}

export function setFlavour(ele: Element): boolean {
  if (!auto_have_skill($skill`Flavour of Magic`)) {
    return false;
  }
  setProperty("_auto_tunedElement", ele.toString());
  return true;
}

export function executeFlavour(): boolean {
  if (!auto_have_skill($skill`Flavour of Magic`)) {
    return false;
  }

  if (getProperty("_auto_tunedElement") === "") {
    autoFlavour(myLocation());
  }
  if (getProperty("_auto_tunedElement") === "") {
    return false;
  }
  const ele: Element = toElement(getProperty("_auto_tunedElement"));
  if (ele !== currentFlavour()) {
    switch (ele) {
      case Element.none:
        return useSkill(1, $skill`Spirit of Nothing`);
      case $element`hot`:
        return useSkill(1, $skill`Spirit of Cayenne`);
      case $element`cold`:
        return useSkill(1, $skill`Spirit of Peppermint`);
      case $element`stench`:
        return useSkill(1, $skill`Spirit of Garlic`);
      case $element`spooky`:
        return useSkill(1, $skill`Spirit of Wormwood`);
      case $element`sleaze`:
        return useSkill(1, $skill`Spirit of Bacon Grease`);
    }
  }

  return true;
}

function autoFlavour(place: Location): boolean {
  if (!auto_have_skill($skill`Flavour of Magic`)) {
    return false;
  }

  switch (place) {
    case $location`Hobopolis Town Square`:
      // don't mess with scare hobos
      return false;
    case $location`Dreadsylvanian Woods`:
    case $location`Dreadsylvanian Castle`:
    case $location`Dreadsylvanian Village`:
      // dread is complicated
      return setFlavour(Element.none);
  }

  if (in_ocrs()) {
    // monsters can randomly be any element in OCRS
    setFlavour(Element.none);
    return true;
  }

  switch (place) {
    case $location`The Ancient Hobo Burial Ground`: // Everything here is immune to elemental damage
      setFlavour(Element.none);
      return true;
    case $location`The Ice Hotel`:
      if (
        getProperty("walfordBucketItem") === "rain" &&
        equippedItem($slot`off-hand`) === $item`Walford's bucket`
      ) {
        setFlavour($element`hot`); // doing 100 hot damage in a fight will fill bucket faster
        return true;
      }
    // INTENTIONAL LACK OF BREAK
    case $location`VYKEA`:
      // INTENTIONAL LACK OF BREAK
      if (
        getProperty("walfordBucketItem") === "ice" &&
        equippedItem($slot`off-hand`) === $item`Walford's bucket`
      ) {
        setFlavour($element`cold`);
        return true;
      }
      break;
  }

  const superEffective: Map<Element, number> = new Map();
  const perfect: Map<Element, boolean> = new Map();
  const ineffective: Map<Element, number> = new Map();

  for (const ele of $elements`cold, hot, sleaze, spooky, stench, none`) {
    superEffective.set(ele, 0);
    ineffective.set(ele, 0);
    perfect.set(ele, true);
  }

  function weaknesses(ele: Element): Map<Element, boolean> {
    switch (ele) {
      case $element`cold`:
        return new Map([
          [$element`hot`, true],
          [$element`spooky`, true],
        ]);
      case $element`spooky`:
        return new Map([
          [$element`hot`, true],
          [$element`stench`, true],
        ]);
      case $element`hot`:
        return new Map([
          [$element`stench`, true],
          [$element`sleaze`, true],
        ]);
      case $element`stench`:
        return new Map([
          [$element`sleaze`, true],
          [$element`cold`, true],
        ]);
      case $element`sleaze`:
        return new Map([
          [$element`cold`, true],
          [$element`spooky`, true],
        ]);
      default:
        return new Map([[Element.none, true]]);
    }
  }

  function handle_monster(mon: Monster, chance: number): void {
    if (chance === 0 || mon === Monster.none) {
      return;
    }

    for (const ele of $elements`cold, hot, sleaze, spooky, stench`) {
      if (ele === monsterElement(mon)) {
        ineffective.set(ele, (ineffective.get(ele) ?? 0.0) + chance);
      }

      if (weaknesses(monsterElement(mon)).has(ele)) {
        superEffective.set(ele, (superEffective.get(ele) ?? 0.0) + chance);
      } else {
        perfect.set(ele, false);
      }
    }
  }

  for (const [mon, chance] of Object.entries(appearanceRates(place)).map(
    ([_k, _v]) => [Monster.get(_k), _v] as [Monster, number],
  )) {
    handle_monster(mon, chance);
  }

  if (equippedAmount(wrap_item($item`Kramco Sausage-o-Matic™`)) > 0) {
    handle_monster($monster`sausage goblin`, 0.5);
  }

  let flavour: Element = Element.none;
  let bestScore: number = -1;
  let bestSpellDamage: number = -99999;

  for (const ele of $elements`cold, hot, sleaze, spooky, stench`) {
    const spellDamage: number = numericModifier(
      `${ele.toString()} Spell Damage`,
    );
    let scoreDiff: number =
      (superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele)) -
      bestScore;
    scoreDiff = scoreDiff < 0 ? -scoreDiff : scoreDiff;
    if (
      (ineffective.get(ele) ?? ineffective.set(ele, 0.0).get(ele)) === 0 &&
      ((superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele)) >
        bestScore ||
        (scoreDiff < 0.00001 && spellDamage > bestSpellDamage))
    ) {
      flavour = ele;
      bestScore =
        superEffective.get(ele) ?? superEffective.set(ele, 0.0).get(ele);
      bestSpellDamage = spellDamage;
    }
  }

  return setFlavour(flavour);
}

export function canSimultaneouslyAcquire(needed: Map<Item, number>): boolean {
  // The Knapsack solver can provide invalid solutions - for example, if we
  // have 2 perfect ice cubes and 6 organ space, it might suggest two distinct
  // perfect drinks.
  // Checks that a set of items isn't impossible to acquire because of
  // conflicting crafting dependencies.

  const alreadyUsed: Map<Item, number> = new Map();
  let meatUsed: number = 0;

  let failed: boolean = false;
  function addToAlreadyUsed(amount: number, toAdd: Item): void {
    const needToCraft: number =
      (alreadyUsed.get(toAdd) ?? alreadyUsed.set(toAdd, 0).get(toAdd)) +
      amount -
      itemAmount(toAdd);
    alreadyUsed.set(toAdd, (alreadyUsed.get(toAdd) ?? 0) + amount);
    if (needToCraft > 0) {
      if (
        toBoolean(getProperty("autoSatisfyWithStorage")) &&
        pullsRemaining() === -1
      ) {
        return;
      }
      if (
        getIngredients(toAdd).size === 0 &&
        npcPrice(toAdd) === 0 &&
        buyPrice($coinmaster`Hermit`, toAdd) === 0
      ) {
        // not craftable
        auto_log_warning(`canSimultaneouslyAcquire failing on ${toAdd}`, "red");
        failed = true;
      } else if (npcPrice(toAdd) > 0) {
        meatUsed += npcPrice(toAdd);
      }

      for (const [ing, ingAmount] of Object.entries(getIngredients(toAdd)).map(
        ([_k, _v]) => [Item.get(_k), _v] as [Item, number],
      )) {
        addToAlreadyUsed(ingAmount * needToCraft, ing);
      }
    }
  }

  for (const [it, amt] of needed) {
    addToAlreadyUsed(amt, it);
  }

  return !failed && meatUsed <= myMeat();
}

export function knapsack(
  maxw: number,
  n: number,
  weight: Map<number, number>,
  val: Map<number, number>,
): Map<number, boolean> {
  /*
   * standard implementation of 0-1 Knapsack problem with dynamic programming
   * Time complexity: O(maxw * n)
   * For 16k items on a 2017 laptop, took about 5 seconds and 60Mb of RAM
   *
   * Parameters:
   *   maxw is the desired sum-of-weights (e.g. fullness_left())
   *   n is the number of elements
   *   weight is the (e.g. a map from i=1..n => fullness of i-th food)
   *   val is the value to maximize (e.g. a map from i=1..n => adventures of i-th food)
   * Returns: a set of indices that were taken
   */

  const empty: Map<number, boolean> = new Map();

  if (n * maxw >= 100000) {
    auto_log_warning$1(
      `Solving a Knapsack instance with ${n} elements and ${maxw} total weight, this might be slow and memory-intensive.`,
    );
  }
  /* V[i][w] is "with only the first i items, what is the maximum
   * sum-of-vals we can generate with total weight w?
   */
  const V: Map<number, Map<number, number>> = new Map();

  for (let i_1: number = 0; i_1 <= n; i_1++) {
    for (let w_1: number = 0; w_1 <= maxw; w_1++) {
      if (i_1 === 0 || w_1 === 0) {
        (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(w_1, 0);
      } else if (
        (weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1)) <= w_1
      ) {
        (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(
          w_1,
          max(
            (val.get(i_1 - 1) ?? val.set(i_1 - 1, 0.0).get(i_1 - 1)) +
              ((V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(
                w_1 -
                  (weight.get(i_1 - 1) ?? weight.set(i_1 - 1, 0).get(i_1 - 1)),
              ) ??
                (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1))
                  .set(
                    w_1 -
                      (weight.get(i_1 - 1) ??
                        weight.set(i_1 - 1, 0).get(i_1 - 1)),
                    0.0,
                  )
                  .get(
                    w_1 -
                      (weight.get(i_1 - 1) ??
                        weight.set(i_1 - 1, 0).get(i_1 - 1)),
                  )),
            (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(
              w_1,
            ) ??
              (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1))
                .set(w_1, 0.0)
                .get(w_1),
          ),
        );
      } else {
        (V.get(i_1) ?? V.set(i_1, new Map()).get(i_1)).set(
          w_1,
          (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1)).get(w_1) ??
            (V.get(i_1 - 1) ?? V.set(i_1 - 1, new Map()).get(i_1 - 1))
              .set(w_1, 0.0)
              .get(w_1),
        );
      }
    }
  }
  // Catch unreachable case (e.g. only 2-fullness foods, targeting 15 stomach)
  if (
    ((V.get(n) ?? V.set(n, new Map()).get(n)).get(maxw) ??
      (V.get(n) ?? V.set(n, new Map()).get(n)).set(maxw, 0.0).get(maxw)) === 0.0
  ) {
    return empty;
  }

  const ret: Map<number, boolean> = new Map();
  // backtrack
  let i: number = n;
  let w: number = maxw;
  while (i > 0 || w > 0) {
    if (i < 0) {
      return empty;
    }
    // Did this item change our mind about how many adventures we could generate?
    // If so, we took this item.
    if (
      ((V.get(i) ?? V.set(i, new Map()).get(i)).get(w) ??
        (V.get(i) ?? V.set(i, new Map()).get(i)).set(w, 0.0).get(w)) !==
      ((V.get(i - 1) ?? V.set(i - 1, new Map()).get(i - 1)).get(w) ??
        (V.get(i - 1) ?? V.set(i - 1, new Map()).get(i - 1)).set(w, 0.0).get(w))
    ) {
      ret.set(i - 1, true);
      w -= weight.get(i - 1) ?? weight.set(i - 1, 0).get(i - 1);
      i -= 1;
    } else {
      // do not take element
      i -= 1;
    }
  }
  // This can be somewhat memory-intensive.
  // I'm not sure if this actually does anything, but it makes me feel better.
  cliExecute("gc");
  return ret;
}

export function auto_reserveAmount(it: Item): number {
  const itemdata: Map<string, Map<number, Map<string, string>>> = fileAsMap(
    "autoscend_items.txt",
    [String, Number, String, String],
  );
  if (!itemdata.size) {
    auto_log_error("Could not load autoscend_items.txt! This is bad!");
  }
  for (const [, _v0] of itemdata.get("reserve") ??
    itemdata.set("reserve", new Map()).get("reserve")) {
    for (const [counteditem, _v1] of _v0) {
      const conds = _v1;
      const m: AshMatcher = new AshMatcher("(\\-?\\d+) (.+)", counteditem);
      if (!m.find()) {
        auto_log_warning(
          `"${counteditem}" is not in the format "# itemname"!`,
          "red",
        );
        continue;
      }
      const curr: Item = toItem(m.group(2));
      if (curr === Item.none) {
        auto_log_warning(
          `"${m.group(2)}" does not convert to an item properly!`,
          "red",
        );
        continue;
      }
      if (curr !== it) {
        continue;
      }
      if (!auto_check_conditions(conds)) {
        continue;
      }
      return toInt(m.group(1));
    }
  }
  return 0;
}

export function auto_reserveCraftAmount(orig_it: Item): number {
  // Detect infinite loops
  const its: Map<Item, boolean> = new Map();

  function inner(it: Item): number {
    if (its.has(it)) {
      auto_log_warning(
        `Found dependency loop involving ${it} when trying to craft ${orig_it}, consider adding to reserve list.`,
        "red",
      );
      auto_log_warning("Dependencies (in no particular order):", "red");
      for (const iit of its.keys()) {
        auto_log_warning(`> ${iit}`, "red");
      }
      return 9999999;
    }
    its.set(it, true);
    let reserve: number = 0;
    for (const [ing, amt] of Object.entries(getIngredients(it)).map(
      ([_k, _v]) => [Item.get(_k), _v] as [Item, number],
    )) {
      let ingReserve: number = auto_reserveAmount(ing);
      if (ingReserve === -1) {
        return 0;
      } else if (ingReserve === 0) {
        ingReserve = inner(ing);
      }
      if (ingReserve * amt > reserve) {
        reserve = ingReserve * amt;
      }
    }
    its.delete(it);
    return reserve;
  }
  return inner(orig_it);
}
// ML MANAGEMENT FUNCTIONS
// Gives us the number we need when comparing to a desired ML or entering a value into a maximizer string.
export function auto_convertDesiredML(DML: number): number {
  let DesiredML: number = toInt(getProperty("auto_MLSafetyLimit"));

  if (getProperty("auto_MLSafetyLimit") === "") {
    DesiredML = DML;
  }

  return DesiredML;
}
// Uses MCD in the constraints of a Cap
export function auto_setMCDToCap(): boolean {
  let targetMcd: number;

  if (getProperty("auto_MLSafetyLimit") === "") {
    // No ML limit was given, so use the max MCD value
    targetMcd = 11;
  } else {
    // monster_level_adjustment includes the current MCD value, so it must be removed before calculating the new MCD
    const currentMlWithoutMcd: number = monsterLevelAdjustment() - currentMcd();
    const mlSafetyLimit: number = toInt(getProperty("auto_MLSafetyLimit"));

    if (currentMlWithoutMcd < mlSafetyLimit) {
      // ML is below the cap. Add as much ML with the MCD as possible without exceeding the cap.
      targetMcd = mlSafetyLimit - currentMlWithoutMcd;
    } else {
      // ML is already at the cap or exceeded it. Don't add any more ML with the MCD.
      targetMcd = 0;
    }
  }

  return auto_change_mcd(targetMcd);
}
// We use this function to determine the suitability of using Ur-Kel's
function UrKelCheck(
  UrKelToML: number,
  UrKelUpperLimit: number,
  UrKelLowerLimit: number,
): boolean {
  if (!auto_have_skill($skill`Ur-Kel's Aria of Annoyance`)) {
    return false;
  }

  if (
    haveEffect($effect`Ur-Kel's Aria of Annoyance`) === 0 &&
    monsterLevelAdjustment() + 2 * myLevel() <= auto_convertDesiredML(UrKelToML)
  ) {
    if (
      getProperty("auto_MLSafetyLimit") === "" ||
      (2 * myLevel() <= UrKelUpperLimit && 2 * myLevel() >= UrKelLowerLimit)
    ) {
      shrugAT($effect`Ur-Kel's Aria of Annoyance`);
      buffMaintain$3($effect`Ur-Kel's Aria of Annoyance`, 0, 1, 10);
    }
  }

  return true;
}
// We use this function to determine the suitability of using angry agates
function angryAgateCheck(
  angryAgateToML: number,
  angryAgateUpperLimit: number,
  angryAgateLowerLimit: number,
): boolean {
  if (
    itemAmount($item`angry agate`) === 0 ||
    !auto_is_valid($item`angry agate`)
  ) {
    return false;
  }

  if (
    haveEffect($effect`Misplaced Rage`) === 0 &&
    monsterLevelAdjustment() + 3 * myLevel() <=
      auto_convertDesiredML(angryAgateToML)
  ) {
    if (
      getProperty("auto_MLSafetyLimit") === "" ||
      (3 * myLevel() <= angryAgateUpperLimit &&
        3 * myLevel() >= angryAgateLowerLimit)
    ) {
      uneffect($effect`Misplaced Rage`);
      buffMaintain$4($effect`Misplaced Rage`);
    }
  }

  return true;
}
// Handle intelligently increasing ML for both pre-adv and in Quests
//	doAltML is a variable that will be referenced when increasing ML via alternative methods such as Asdon Martin, they should be entered in their respective order
//		Ur-kel's may need new entries in this case due to its variance
export function auto_MaxMLToCap(ToML: number, doAltML: boolean): boolean {
  function tryEffects(effects: Map<Effect, boolean>): void {
    for (const eff of effects.keys()) {
      if (
        monsterLevelAdjustment() + numericModifier(eff, "Monster Level") <=
        auto_convertDesiredML(ToML)
      ) {
        buffMaintain$4(eff);
      }
    }
  }
  // 5 * level ML up to + 75
  if (auto_wantToBCZ($skill`BCZ: Blood Bath`)) {
    tryEffects(new Map([[$effect`Bloodbathed`, true]]));
  }
  // ToML >= U >= 30
  UrKelCheck(ToML, auto_convertDesiredML(ToML), 30);
  angryAgateCheck(ToML, auto_convertDesiredML(ToML), 30);
  // 30
  // Start with the biggest and drill down for max ML
  tryEffects(
    new Map([
      [$effect`Ceaseless Snarling`, true],
      [$effect`Punchable Face`, true],
      [$effect`Zomg WTF`, true],
    ]),
  );
  // 29 >= U >= 25
  UrKelCheck(ToML, 29, 25);
  angryAgateCheck(ToML, 29, 25);
  // 25
  if (doAltML && monsterLevelAdjustment() + 25 <= auto_convertDesiredML(ToML)) {
    asdonBuff($effect`Driving Recklessly`);
  }
  if (doAltML) {
    tryEffects(
      new Map([
        [$effect`Litterbug`, true],
        [$effect`Sweetbreads Flambé`, true],
      ]),
    );
  }
  if (in_amw()) {
    tryEffects(new Map([[$effect`Hamming It Up`, true]]));
  }
  // 24 >= U >= 10
  UrKelCheck(ToML, 24, 10);
  angryAgateCheck(ToML, 24, 10);
  // 20
  if (isActuallyEd() && !toBoolean(getProperty("auto_needLegs"))) {
    tryEffects(new Map([[$effect`Blessing of Serqet`, true]]));
  }
  // 10
  tryEffects(
    new Map([
      [$effect`Pride of the Puffin`, true],
      [$effect`Drescher's Annoying Noise`, true],
    ]),
  );
  if (doAltML) {
    tryEffects(new Map([[$effect`Tortious`, true]]));
  }

  if (in_amw()) {
    tryEffects(new Map([[$effect`Acting Jerky`, true]]));
  }
  // <10
  //If we can't get 10 turns of Ur-Kel's, and we aren't being forced to pile on the ML, it probably isn't worth it.
  if (doAltML || auto_predictAccordionTurns() >= 10) {
    UrKelCheck(ToML, 9, 2);
  }
  angryAgateCheck(ToML, 9, 3);
  // Customizable - For variable effects that we can use to fill in the corners
  // Fill in the remainder with MCD
  if (
    !$locations`The Boss Bat's Lair, Haert of the Cyrpt, Throne Room`.includes(
      myLocation(),
    )
  ) {
    auto_setMCDToCap();
  }

  return true;
}
// ADVENTURE FORCING FUNCTIONS
function _auto_forceNextNoncombat(
  loc: Location,
  speculative: boolean,
): boolean {
  // return true if already have a forcer acitve
  if (auto_haveQueuedForcedNonCombat()) {
    return true;
  }
  // Use stench jelly or other item to set the combat rate to zero until the next noncombat.
  if (auto_pillKeeperFreeUseAvailable()) {
    if (speculative) {
      return true;
    }
    auto_pillKeeper$1("noncombat");
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [free pillkeeper] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "pillkeeper");
    return true;
  } else if (
    !toBoolean(getProperty("_claraBellUsed")) &&
    itemAmount($item`Clara's bell`) > 0 &&
    auto_is_valid($item`Clara's bell`)
  ) {
    if (speculative) {
      return true;
    }
    use(1, $item`Clara's bell`);
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [Clara's Bell] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "clara's bell");
    return true;
  } else if (auto_haveCincho() && auto_getCinch(60)) {
    if (speculative) {
      return true;
    }
    useSkill(1, $skill`Cincho: Fiesta Exit`);
    if (!auto_haveQueuedForcedNonCombat()) {
      abort("Attempted to force a noncombat with [Cincho] but was unable to.");
    }
    setProperty("auto_forceNonCombatSource", "cincho");
    return true;
  } else if (auto_AprilTubaForcesLeft() > 0) {
    if (speculative) {
      return true;
    }
    auto_playAprilTuba();
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [Apriling tuba] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "Apriling tuba");
    return true;
  } else if (
    auto_haveMcHugeLargeSkis() &&
    toInt(getProperty("_mcHugeLargeAvalancheUses")) < 3 &&
    (!in_wereprof() || !is_professor())
  ) {
    // if we're a professor, we can't use the skis
    if (speculative) {
      return true;
    }
    // avalanche require a combat to active
    // this property will cause the left ski to be eqipped and avalanche deployed next combat
    setProperty("auto_forceNonCombatSource", "McHugeLarge left ski");
    // track desired NC location so we know where to go when avalanche is ready
    setProperty("auto_forceNonCombatLocation", loc.toString());
    return true;
  } else if (
    auto_hasParka() &&
    toInt(getProperty("_spikolodonSpikeUses")) < 5 &&
    hasTorso() &&
    (!in_wereprof() || !is_professor())
  ) {
    // if we're a professor, we can't use the spikes
    if (speculative) {
      return true;
    }
    // parka spikes require a combat to active
    // this property will cause the parka to be eqipped and spikes deployed next combat
    setProperty("auto_forceNonCombatSource", "jurassic parka");
    // track desired NC location so we know where to go when parka spikes are preped
    setProperty("auto_forceNonCombatLocation", loc.toString());
    return true;
  } else if (auto_canARBSupplyDrop()) {
    if (speculative) {
      return true;
    }
    ARBSupplyDrop("sniper support");
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [Allied Radio Backpack] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "Allied Radio Backpack");
    return true;
  } else if (
    itemAmount($item`stench jelly`) > 0 &&
    auto_is_valid($item`stench jelly`) &&
    !isActuallyEd() &&
    spleen_left() >= $item`stench jelly`.spleen
  ) {
    if (speculative) {
      return true;
    }
    autoChew(1, $item`stench jelly`);
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [Stench Jelly] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "stench jelly");
    return true;
  } else if (
    auto_pillKeeperAvailable() &&
    !isActuallyEd() &&
    spleen_left() >= 3
  ) {
    // don't use Spleen as Ed, it's his main source of adventures.
    if (speculative) {
      return true;
    }
    auto_pillKeeper$1("noncombat");
    if (!auto_haveQueuedForcedNonCombat()) {
      abort(
        "Attempted to force a noncombat with [not free pillkeeper] but was unable to.",
      );
    }
    setProperty("auto_forceNonCombatSource", "pillkeeper");
    return true;
  }

  return false;
}

export function auto_canForceNextNoncombat(): boolean {
  return _auto_forceNextNoncombat(Location.none, true);
}

function _auto_forceNextNoncombat$1(loc: Location): boolean {
  return _auto_forceNextNoncombat(loc, false);
}

export function auto_forceNextNoncombat(loc: Location): boolean {
  if (auto_haveQueuedForcedNonCombat()) {
    auto_log_warning(
      "Trying to force a noncombat adventure, but I think we've already forced one...",
      "red",
    );
    return true;
  }
  if (_auto_forceNextNoncombat$1(loc)) {
    const forceNCMethod: string = getProperty("auto_forceNonCombatSource");
    if (forceNCMethod === "jurassic parka") {
      auto_log_info(
        `Next noncombat adventure will be forced with ${forceNCMethod}`,
        "blue",
      );
    } else {
      auto_log_info(
        `Next noncombat adventure has been forced with ${forceNCMethod}`,
        "blue",
      );
    }
    return true;
  }
  return false;
}

export function auto_haveQueuedForcedNonCombat(): boolean {
  return toBoolean(getProperty("noncombatForcerActive"));
}
// Function to Predict how many turns we will get from an AT buff
export function auto_predictAccordionTurns(): number {
  // List of all Accordions for AT usage
  const All_Accordions: Map<Item, boolean> = new Map([
    [$item`accord ion`, true],
    [$item`accordion file`, true],
    [$item`Accordion of Jordion`, true],
    [$item`aerogel accordion`, true],
    [$item`antique accordion`, true],
    [$item`accordionoid rocca`, true],
    [$item`alarm accordion`, true],
    [$item`autocalliope`, true],
    [$item`Bal-musette accordion`, true],
    [$item`baritone accordion`, true],
    [$item`beer-battered accordion`, true],
    [$item`bone bandoneon`, true],
    [$item`Cajun accordion`, true],
    [$item`calavera concertina`, true],
    [$item`ghost accordion`, true],
    [$item`guancertina`, true],
    [$item`mama's squeezebox`, true],
    [$item`non-Euclidean non-accordion`, true],
    [$item`peace accordion`, true],
    [$item`pentatonic accordion`, true],
    [$item`pygmy concertinette`, true],
    [$item`quirky accordion`, true],
    [$item`Rock and Roll Legend`, true],
    [$item`Shakespeare's Sister's Accordion`, true],
    [$item`Skipper's accordion`, true],
    [$item`Squeezebox of the Ages`, true],
    [$item`stolen accordion`, true],
    [$item`The Trickster's Trikitixa`, true],
    [$item`toy accordion`, true],
    [$item`warbear exhaust manifold`, true],
    [$item`zombie accordion`, true],
  ]);
  // List of Accordions that Non-AT classes can use
  const NonAT_Accordions: Map<Item, boolean> = new Map([
    [$item`aerogel accordion`, true],
    [$item`antique accordion`, true],
    [$item`toy accordion`, true],
  ]);
  // Choose list to use based on Class
  const accordions: Map<Item, boolean> =
    myClass() === $class`Accordion Thief` ? All_Accordions : NonAT_Accordions;

  let CurrentBestTurns: number = 0;

  for (const squeezebox of accordions.keys()) {
    // Verify that we have the accordion and that it is allowed to be use in path
    if (equipmentAmount(squeezebox) > 0 && auto_is_valid(squeezebox)) {
      const expTurns: number = toInt(
        numericModifier(squeezebox, "Song Duration"),
      );

      if (expTurns > CurrentBestTurns) {
        CurrentBestTurns = expTurns;
      }
    }
  }

  return CurrentBestTurns;
}

function hasTTBlessing(): boolean {
  //do you currently have a turtle blessing active? or if not turtle tamer then the buff?

  for (const eff of $effects`Blessing of the War Snapper, Grand Blessing of the War Snapper, Glorious Blessing of the War Snapper, Blessing of She-Who-Was, Grand Blessing of She-Who-Was, Glorious Blessing of She-Who-Was, Blessing of the Storm Tortoise, Grand Blessing of the Storm Tortoise, Glorious Blessing of the Storm Tortoise, Disdain of the War Snapper, Disdain of She-Who-Was, Disdain of the Storm Tortoise`) {
    if (haveEffect(eff) > 0) {
      return true;
    }
  }

  return false;
}

export function effectAblativeArmor(passive_dmg_allowed: boolean): void {
  //when facing a boss that has a buff stripping mechanic that is limited on how many can be stripped per round.
  //then load up on as many reasonable buffs as you can taking cost into account.
  //avoid potentially undesireable effects such as +ML.
  //I am pretty sure non combat skills that give an effect count.
  //but I am labeling them seperate from buffs in case we ever need to split this function.
  //if you have something that reduces the cost of casting buffs, wear it now.
  addToMaximize("-1000mana cost, -tie");
  equipMaximizedGear();
  //Passive damage
  if (passive_dmg_allowed) {
    buffMaintain$4($effect`Spiky Shell`); //8 MP
    buffMaintain$4($effect`Jalapeño Saucesphere`); //5 MP
    buffMaintain$4($effect`Scariersauce`); //10 MP
    buffMaintain$4($effect`Scarysauce`); //10 MP
    if (in_aosol()) {
      buffMaintain$4($effect`Queso Fustulento`); //10 MP
      buffMaintain$4($effect`Tricky Timpani`); //30 MP
    }
  }
  //1MP Non-Combat skills from each class
  buffMaintain$4($effect`Seal Clubbing Frenzy`);
  buffMaintain$4($effect`Patience of the Tortoise`);
  buffMaintain$4($effect`Pasta Oneness`);
  buffMaintain$4($effect`Saucemastery`);
  buffMaintain$4($effect`Disco State of Mind`);
  buffMaintain$4($effect`Mariachi Mood`);
  //Seal clubber Non-Combat skills
  buffMaintain$4($effect`Blubbered Up`); //7 MP
  buffMaintain$4($effect`Rage of the Reindeer`); //10 MP
  buffMaintain$4($effect`A Few Extra Pounds`); //10 MP
  //Turtle Tamer Non-Combat skills
  if (!hasTTBlessing()) {
    buffMaintain$4($effect`Blessing of the War Snapper`); //15 MP. other blessings too expensive.
  }
  //Pastamancer Non-Combat skills
  buffMaintain$4($effect`Springy Fusilli`); //10 MP
  buffMaintain$4($effect`Shield of the Pastalord`); //20 MP
  buffMaintain$4($effect`Leash of Linguini`); //12 MP
  //Sauceror Non-Combat skills
  buffMaintain$4($effect`Sauce Monocle`); //20 MP
  //Disco Bandit Non-Combat skills
  buffMaintain$4($effect`Disco Fever`); //10 MP
  //Turtle Tamer Buffs
  buffMaintain$4($effect`Ghostly Shell`); //6 MP
  buffMaintain$4($effect`Tenacity of the Snapper`); //8 MP
  buffMaintain$4($effect`Empathy`); //15 MP
  buffMaintain$4($effect`Thoughtful Empathy`); //15 MP
  buffMaintain$4($effect`Reptilian Fortitude`); //8 MP
  buffMaintain$4($effect`Astral Shell`); //10 MP
  buffMaintain$4($effect`Jingle Jangle Jingle`); //5 MP
  buffMaintain$4($effect`Curiosity of Br'er Tarrypin`); //5 MP
  //Sauceror Buffs
  buffMaintain$4($effect`Elemental Saucesphere`); //10 MP
  buffMaintain$4($effect`Antibiotic Saucesphere`); //15 MP
  //Accordion Thief Buffs. We are not shrugging so it will only apply new ones if we have space for them
  buffMaintain$4($effect`The Moxious Madrigal`); //2 MP
  buffMaintain$4($effect`The Magical Mojomuscular Melody`); //3 MP
  buffMaintain$4($effect`Cletus's Canticle of Celerity`); //4 MP
  buffMaintain$4($effect`Power Ballad of the Arrowsmith`); //5 MP
  buffMaintain$4($effect`Polka of Plenty`); //7 MP
  //Mutually exclusive effects
  if (
    haveEffect($effect`Musk of the Moose`) === 0 &&
    haveEffect($effect`Hippy Stench`) === 0
  ) {
    buffMaintain$4($effect`Smooth Movements`); //10 MP
  }
  if (
    haveEffect($effect`Smooth Movements`) === 0 &&
    haveEffect($effect`Fresh Scent`) === 0
  ) {
    buffMaintain$4($effect`Musk of the Moose`); //10 MP
  }
  //TODO facial expressions, need to check you are not wearing one first and which ones you have
  //Maybe just not do facial expressions? too much complexity for a singular effect.
}

export function currentPoolSkill(): number {
  // format of the cli 'poolskill' command return value is:
  // Pool Skill is estimated at : 12.
  // 0 from equipment, 0 from having 15 inebriety, 2 hustling training and 10 learning from 25 sharks.
  const poolskill_command: Map<number, string> = new Map(
    splitString(cliExecuteOutput("poolskill")).map((_v, _i) => [_i, _v]),
  );
  return toInt(
    substring(
      poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0),
      lastIndexOf(
        poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0),
        ":",
      ) + 2,
      length(poolskill_command.get(0) ?? poolskill_command.set(0, "").get(0)) -
        1,
    ),
  );
}

export function poolSkillPracticeGains(): number {
  //predict gains from choosing to practice your pool skill (choice 2) in noncombat adv 875 "Welcome To Our ool Table"
  let count_1: number = 1;
  if (haveEffect($effect`Chalky Hand`) > 0) {
    count_1 += 1;
  }
  if (equippedAmount($item`[2268]Staff of Fats`) > 0) {
    //note that $item[[7964]Staff of Fats] does not help here.
    count_1 += 2;
  }
  return count_1;
}

export function hasUsefulShirt(): boolean {
  let amtUsefulShirts: number = 0;
  for (const it of $items`January's Garbage Tote, astral shirt, shoe ad T-shirt, fresh coat of paint, tunac, Jurassic Parka, hairshirt, futuristic shirt`) {
    const w_it: Item = wrap_item(it);
    if (itemAmount(w_it) !== 0 && isUnrestricted(w_it)) {
      amtUsefulShirts += 1;
    }
  }
  if (amtUsefulShirts > 0) {
    return true;
  } else {
    return false;
  }
}

export function meatReserve(): number {
  //the amount of meat we want to reserve for quest usage when performing a restore
  //note that Adventurer Meats World has its own reserve for buying skills, but uses this function if it is smaller at Lvl 11+
  let reserve_extra: number = 0; //extra reserved for various reasons
  if (in_kolhs()) {
    reserve_extra += 100;
  }
  if (
    in_wildfire() &&
    !toBoolean(getProperty("wildfirePumpGreased")) &&
    itemAmount($item`pump grease`) === 0
  ) {
    reserve_extra += npcPrice($item`pump grease`);
  }
  if (!hasTorso() && hasUsefulShirt() && !gnomadsAvailable() && inGnomeSign()) {
    reserve_extra += toInt(5000 * npcStoreDiscountMulti()); //Going to need 5k anyway if we need torso so might as well start saving early. Worst case scenario we make a meatcar
  }
  if (!hasTorso() && gnomadsAvailable() && hasUsefulShirt()) {
    reserve_extra += 5000; //we want Torso ASAP if we have a useful shirt
  }

  if (myLevel() < 10) {
    //meat income is pretty low and the quests that need the reserve far away. Use restores freely
    if (
      !isDesertAvailable() &&
      inKnollSign() &&
      myLevel() > 5 &&
      myTurncount() > 50
    ) {
      //reason for both level and turncount being checked is that many iotms could level us on turn 1.
      return 500 + reserve_extra; //reserve some meat for the bitchin' meatcar.
    }
    return reserve_extra;
  }

  let reserve_gnasir: number = 0; //used to track how much we need to reserve for black paint for gnasir
  let reserve_diary: number = 0; //used to track how much we need to reserve to acquire [your father's MacGuffin diary] at L11 quest
  let reserve_zeppelin: number = 0; //used to track how much we need to reserve for a zeppelin ticket
  let reserve_palindome: number = 0; //used to track how much we need to reserve for palindome photographs
  let reserve_island: number = 0; //used to track how much we need to reserve to unlock the mysterious island
  //how much do we reserve for gnasir?
  if (
    internalQuestStatus("questL11Desert") < 1 &&
    (toInt(
      //bitwise. desert exploration not yet finished
      getProperty("gnasirProgress"),
    ) &
      2) !==
      2
  ) {
    //gnasir has not been given black paint yet
    reserve_gnasir += 1000;
  }
  //how much do we reserve for [your father's MacGuffin diary]?
  if (
    itemAmount($item`your father's MacGuffin diary`) === 0 &&
    !in_koe() &&
    !in_wotsf()
  ) {
    //costs 5 meat total in way of the surprising fist. no need to track that
    //you do not yet have diary
    //diary is given by council for free in kingdom of exploathing
    reserve_diary += 500; //1 vacation. no need to count script. we don't pull it or get it prematurely.
    //cannot just use npc_price() for [forged identification documents] because they are not always available. it would return 0.
    if (itemAmount($item`forged identification documents`) === 0) {
      reserve_diary += toInt(5000 * npcStoreDiscountMulti());
    }
  }
  //how much do we reserve for a zeppelin ticket?
  if (
    myLevel() >= 11 &&
    internalQuestStatus("questL11Ron") < 5 &&
    itemAmount($item`Red Zeppelin ticket`) < 1
  ) {
    //the copperhead part tries for a priceless diamond, but if it's over without getting one
    if (
      (getProperty("questL11Shen") === "finished" ||
        $location`The Copperhead Club`.turnsSpent >= 15) &&
      itemAmount($item`priceless diamond`) < 1
    ) {
      reserve_zeppelin += toInt(5000 * npcStoreDiscountMulti());
    }
  }
  //how much do we reserve for palindome photographs?
  if (myLevel() >= 11 && internalQuestStatus("questL11Palindome") < 1) {
    if (itemAmount($item`photograph of a red nugget`) < 1) {
      reserve_palindome += 500;
    }
    if (itemAmount($item`photograph of God`) < 1) {
      reserve_palindome += 500;
    }
  }
  //how much do we reserve for unlocking mysterious island?
  if (toInt(getProperty("lastIslandUnlock")) < myAscensions()) {
    //need to unlock island
    let price_vacation: number = 500;
    if (in_wotsf()) {
      price_vacation = 5; //yes really. just 5 meat each
    }
    //TODO: scrips. they may have been pulled manually, and one optional property does pull them
    reserve_island += price_vacation * 3; //3 vacations

    if (itemAmount($item`dingy planks`) === 0) {
      reserve_island += toInt(400 * npcStoreDiscountMulti());
    }
  }

  return (
    reserve_gnasir +
    reserve_diary +
    reserve_zeppelin +
    reserve_palindome +
    reserve_island +
    reserve_extra
  );
}

export function auto_wishForEffectIfNeeded(wish: Effect): boolean {
  if (haveEffect(wish) > 0) {
    return true;
  }
  return auto_wishForEffect(wish);
}

export function auto_wishForEffect(wish: Effect): boolean {
  // First try to use the monkey paw
  if (auto_haveMonkeyPaw()) {
    if (auto_makeMonkeyPawWish(wish)) {
      return true;
    }
  }
  // If we're allowed to use the genie bottle, do that.
  if (auto_haveGenieBottleOrPocketWishes()) {
    if (makeGenieWish$1(wish)) {
      return true;
    }
  }
  return false;
}

export function auto_totalEffectWishesAvailable(): number {
  return auto_monkeyPawWishesLeft() + auto_wishesAvailable();
}

export function wrap_item(it: Item): Item {
  // convert an item into another item, used for replicas in LoL
  if (in_lol()) {
    return auto_ItemToReplica(it);
  }
  return it;
}

export function auto_burnMP(mpToBurn: number): boolean {
  // burn command only extends existing buffs
  // set default skill to cast so MP is burned if we don't have any active buffs
  // only consider the default stating buffs for the 6 standard classes
  let defaultSkill: Skill = Skill.none;
  for (const sk of $skills`Sauce Contemplation, Seal Clubbing Frenzy, Patience of the Tortoise, Manicotti Meditation, Disco Aerobics, Moxie of the Mariachi`) {
    if (haveSkill(sk)) {
      defaultSkill = sk;
      break;
    }
  }

  if (defaultSkill !== Skill.none) {
    // only set a default skill if we have one
    setProperty("lastChanceBurn", `cast # ${defaultSkill}`);
  }

  const equipped: Map<number, Item> = auto_saveEquipped();

  addToMaximize("-1000mana cost, -tie");
  equipMaximizedGear();
  auto_equipAprilShieldBuff(); //useful additional buffs when equipped
  // record starting MP
  const startingMP: number = myMp();
  cliExecute(`burn ${mpToBurn}`);
  auto_loadEquipped(equipped);
  removeFromMaximize("-1000mana cost");
  return startingMP !== myMp();
}

export function can_read_skillbook(it: Item): boolean {
  // can't read in Nuclear Autumn, Picky, Pokefam, Class Act or Journeyman
  if (
    in_nuclear() ||
    in_picky() ||
    in_pokefam() ||
    in_class_act() ||
    in_class_act_two() ||
    in_journeyman()
  ) {
    return false;
  }
  // robots can read the emotion chip and nothing else
  if (in_robot()) {
    return it === $item`spinal-fluid-covered emotion chip`;
  }
  // all the normal classes and AoSOL classes are literate
  if (
    $classes`Seal Clubber, Turtle Tamer, Sauceror, Pastamancer, Disco Bandit, Accordion Thief, Pig Skinner, Cheese Wizard, Jazz Agent`.includes(
      myClass(),
    )
  ) {
    return true;
  }
  return false;
}

export function have_workshed(): boolean {
  if (in_small()) {
    return true;
  }
  return haveCampground();
}

export function baseNCForcesToday(): number {
  let forces: number = 0;
  if (auto_havePillKeeper()) {
    forces = forces + 6;
  }
  if (
    auto_haveAprilingBandHelmet() &&
    availableAmount($item`Apriling band tuba`) > 0
  ) {
    forces = forces + 3;
  }
  if (auto_haveMcHugeLargeSkis()) {
    forces = forces + 3;
  }
  if (auto_hasParka()) {
    forces = forces + 5;
  }
  if (auto_haveCincho()) {
    // Not important to calculate this properly here.
    forces = forces + 3;
  }
  if (auto_haveARB()) {
    forces = forces + 3;
  }
  return forces;
}

export function remainingNCForcesToday(): number {
  let forces: number = 0;
  forces = forces + auto_pillKeeperUses();
  forces = forces + auto_AprilTubaForcesLeft();
  forces = forces + auto_McLargeHugeForcesLeft();
  forces = forces + auto_ParkaSpikeForcesLeft();
  forces = forces + auto_cinchForcesLeft();
  forces = forces + auto_ARBSupplyDropsLeft();

  return forces;
}

export function turnsUsedByRemainingNCForcesToday(): number {
  let forces: number = 0;
  forces = forces + auto_pillKeeperUses();
  forces = forces + auto_AprilTubaForcesLeft();
  forces = forces + 2 * auto_McLargeHugeForcesLeft();
  forces = forces + 2 * auto_ParkaSpikeForcesLeft();
  forces = forces + auto_cinchForcesLeft();
  forces = forces + auto_ARBSupplyDropsLeft();

  return forces;
}

export function substat_to_level(n: number): number {
  if (n <= 16) {
    return 1; // All substats less than 16 are level 1, before the formula takes effect
  }
  return squareRoot(squareRoot(n) - 4) + 1;
}

export function level_to_min_substat(n: number): number {
  return ((n - 1) ** 2 + 4) ** 2;
}

export function stat_to_substat(s: Stat): Stat {
  switch (s) {
    case $stat`Muscle`:
      return $stat`SubMuscle`;
    case $stat`Mysticality`:
      return $stat`SubMysticality`;
    case $stat`Moxie`:
      return $stat`SubMoxie`;
  }
  return s;
}

export function stat_exp_percent(s: Stat): number {
  switch (s) {
    case $stat`Muscle`:
    case $stat`SubMuscle`:
      return numericModifier(Modifier.get("Muscle Experience Percent"));
    case $stat`Mysticality`:
    case $stat`SubMysticality`:
      return numericModifier(Modifier.get("Mysticality Experience Percent"));
    case $stat`Moxie`:
    case $stat`SubMoxie`:
      return numericModifier(Modifier.get("Moxie Experience Percent"));
  }
  return 0;
}

export function auto_equalizeStats(): boolean {
  let highest_basestat: Stat = myPrimestat();
  let highest_basestat_val: number = myBasestat(highest_basestat);
  for (const s of $stats`Muscle, Mysticality, Moxie`) {
    const val: number = myBasestat(s);
    if (val > highest_basestat_val) {
      highest_basestat_val = val;
      highest_basestat = s;
    }
  }
  switch (highest_basestat) {
    case $stat`Muscle`:
      return buffMaintain$4($effect`Stabilizing Oiliness`);
    case $stat`Mysticality`:
      return buffMaintain$4($effect`Expert Oiliness`);
    case $stat`Moxie`:
      return buffMaintain$4($effect`Slippery Oiliness`);
  }
  return false;
}

export function auto_getListOfNonDamagingFamiliarEquipment(): Map<
  number,
  Item
> {
  // Returns items of generic familiar equipment that do not cause damage when equipped to a non-damage familiar
  // Sorted by familiar weight boost, highest to lowest
  const base_list: Item[] = $items`astral pet sweater, tiny stillsuit, tiny gold medal, lead necklace, futuristic collar, miniature crystal ball, tiny rake, toy Cupid bow`;
  const valid_and_available: Map<Item, boolean> = new Map();
  for (const it of base_list) {
    if (auto_is_valid(it) && availableAmount(it) > 0) {
      valid_and_available.set(it, true);
    }
  }
  // Have to sort each time because futuristic collar changes
  return auto_sortedByModifier$3(
    valid_and_available,
    Modifier.get("Familiar Weight"),
    true,
  );
}

export function auto_amIRich(): boolean {
  return myMeat() > meatReserve() + 5000;
}

export function auto_roughExpectedTurnsLeftToday(): number {
  // Not designed to be accurate, just simple.
  // Designed to be relatively stable, and more likely to come in low than high.
  // If you want to improve the accuracy, please keep the above two principles in mind.
  if (myInebriety() > inebrietyLimit()) {
    return 0;
  }
  const min_adv: number = toFloat(getProperty("auto_consumeMinAdvPerFill"));
  const use_min_adv: boolean = min_adv > 0.0;
  const p: Path = myPath();
  const eat_val: number = use_min_adv ? min_adv : 3.0;
  let drink_val: number = use_min_adv ? min_adv : 3.5;
  let spl_val: number = haveSpleenFamiliar() ? 2 : 0;
  const curr: number = myAdventures();
  const stom: number = stomach_left();
  const liv: number = inebriety_left();
  const spl: number = spleen_left();
  if (p === $path`Dark Gyffte`) {
    return curr + floor(7 * availableAmount($item`blood bag`));
  } else if (p === $path`Slow and Steady`) {
    return curr;
  } else if (p === $path`A Shrunken Adventurer am I`) {
    return (
      curr + floor(10 * stom * eat_val + 10 * liv * drink_val + spl * spl_val)
    );
  } else if (p === $path`Actually Ed the Undying`) {
    spl_val = 5.0;
  } else if (p === $path`Avatar of Jarlsberg`) {
    drink_val = 1.0;
  } else if (p === $path`KOLHS`) {
    drink_val = 2.5;
  }
  return curr + floor(stom * eat_val + liv * drink_val + spl * spl_val);
}

let $_auto_wantToFreeKillWithNoDrops_targets: Monster[] | undefined;

export function auto_wantToFreeKillWithNoDrops(
  loc: Location,
  enemy: Monster,
): boolean {
  // only want certain enemies to free-kill in Avant Guard
  if (in_avantGuard()) {
    if (enemy.physicalResistance >= 100 && enemy.elementalResistance >= 100) {
      return true;
    }
    //This is called in stage2 and auto_purple_candled is set in stage 4 so this should only ever show up on the purple candled enemy
    if (toMonster(getProperty("auto_purple_candled")) === enemy) {
      return true;
    }
    return false;
  }
  // many monsters in these zones with similar names
  if (
    (loc === $location`The Battlefield (Frat Uniform)` &&
      containsText(enemy.toString(), "War Hippy")) ||
    ["Bailey's Beetle", "Mobile Armored Sweat Lodge"].includes(enemy.toString())
  ) {
    return true;
  }
  if (
    loc === $location`The Battlefield (Hippy Uniform)` &&
    containsText(enemy.toString(), "War Frat")
  ) {
    return true;
  }
  if (enemy.physicalResistance >= 100 && enemy.elementalResistance >= 100) {
    return true;
  }
  // look for specific monsters in zones where some monsters we do care about
  $_auto_wantToFreeKillWithNoDrops_targets ??= Monster.get([
    // The Haunted Bathroom
    "claw-foot bathtub",
    "malevolent hair clog",
    "toilet papergeist",
    // The Haunted Gallery
    "cubist bull",
    "empty suit of armor",
    "guy with a pitchfork, and his wife",
    // The Haunted Bedroom
    "animated mahogany nightstand",
    "animated ornate nightstand",
    "animated rustic nightstand",
    "elegant animated nightstand",
    "Wardr&ouml;b nightstand",
    // The Haunted Wine Cellar
    "skeletal sommelier",
    // The Haunted Laundry Room
    "plaid ghost",
    "possessed laundry press",
    // The Haunted Boiler Room
    "coaltergeist",
    "steam elemental",
    // The 8-bit realm
    "Octorok",
    "Keese",
    "Tektite",
    "Zol",
    "Blader",
    "Met",
    "Tackle Fire",
    "Blooper",
    "Bullet Bill",
    "Buzzy Beetle",
    "Goomba",
    "Koopa Troopa",
    "fleaman",
    "ghost",
    "medusa",
  ]);
  return $_auto_wantToFreeKillWithNoDrops_targets.includes(enemy);
}

export function auto_ignoreExperience(): boolean {
  return in_zootomist();
}

export function auto_needAccordion(): boolean {
  if (
    is_boris() ||
    is_jarlsberg() ||
    is_pete() ||
    isActuallyEd() ||
    in_darkGyffte() ||
    in_plumber() ||
    in_wereprof() ||
    in_zootomist()
  ) {
    return false;
  }
  return true;
}

export function auto_inRonin(): boolean {
  return !(canInteract() || inHardcore());
}

export function damageModifier(el: Element): Modifier {
  switch (el) {
    case $element`hot`:
      return Modifier.get("Hot Damage");
    case $element`cold`:
      return Modifier.get("Cold Damage");
    case $element`stench`:
      return Modifier.get("Stench Damage");
    case $element`spooky`:
      return Modifier.get("Spooky Damage");
    case $element`sleaze`:
      return Modifier.get("Sleaze Damage");
  }
  return Modifier.none;
}

export function auto_remainingShantyTurns(): number {
  let turns: number = 0;
  for (const ef of $effects`Who's Going to Pay This Drunken Sailor?, Only Dogs Love a Drunken Sailor, I'm Smarter Than a Drunken Sailor, Look At That Drunken Sailor Dance, Let's Beat Up This Drunken Sailor`) {
    turns = max(turns, haveEffect(ef));
  }
  return turns;
}

export function auto_meetsMinimumRequirements(): boolean {
  // If we're not a base class, we don't need perms
  if (myClass().id > 6) {
    return true;
  }
  // If we're in bad moon we have other checks for that
  if (inBadMoon()) {
    return true;
  }
  // If we're in Nuclear Autumn, You, Robot, Journeyman, Pokefam, or
  // either of the Class Acts, we can't meet these requirements by default.
  // So we're not going to block for this reason. We may well yet block for other reasons.
  if (
    in_nuclear() ||
    in_robot() ||
    in_journeyman() ||
    in_pokefam() ||
    in_class_act() ||
    in_class_act_two()
  ) {
    return true;
  }
  // Otherwise, we just need Saucestorm and Cocoon.
  return haveSkill($skill`Saucestorm`) && haveSkill($skill`Cannelloni Cocoon`);
}
