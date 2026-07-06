import {
  abort,
  availableAmount,
  blackMarketAvailable,
  booleanModifier,
  canDrink,
  canEat,
  canInteract,
  cliExecute,
  closetAmount,
  create,
  Effect,
  equippedAmount,
  equippedItem,
  friarsAvailable,
  getCampground,
  getClanId,
  getClanRumpus,
  getProperty,
  getWorkshed,
  guildStoreAvailable,
  haveEffect,
  haveFamiliar,
  haveSkill,
  hippyStoneBroken,
  inebrietyLimit,
  inHardcore,
  initiativeModifier,
  isUnrestricted,
  Item,
  itemAmount,
  knollAvailable,
  max,
  min,
  mpCost,
  myAdventures,
  myAscensions,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myRain,
  myRobotEnergy,
  mySpleenUse,
  numericModifier,
  print,
  pullsRemaining,
  putCloset,
  runChoice,
  setProperty,
  Skill,
  Slot,
  spleenLimit,
  splitString,
  Stat,
  stillsAvailable,
  storageAmount,
  stringModifier,
  toBoolean,
  toFloat,
  toInt,
  toItem,
  toSlot,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  weaponHands,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $monster,
  $path,
  $servant,
  $skill,
  $slot,
  $slots,
  $stat,
} from "libram";

import { auto_unreservedAdvRemaining, dailyEvents } from "../autoscend";
import {
  acquireHermitItem,
  auto_buyUpTo,
  canPull,
  pullXWhenHaveY,
} from "./auto_acquire";
import { buffMaintain$4 } from "./auto_buff";
import {
  acquireMilkOfMagnesiumIfUnused,
  auto_drinkNightcap,
  auto_printNightcap,
  autoChew,
  canChew,
  consumeMilkOfMagnesiumIfUnused,
  distill,
  fullness_left,
  inebriety_left,
  spleen_left,
  still_targetToOrigin,
  stillReachable,
} from "./auto_consume";
import {
  ensureSealClubs,
  equipRollover,
  is_watch,
  possessEquipment,
  possessOutfit$1,
} from "./auto_equipment";
import {
  auto_have_familiar,
  canChangeFamiliar,
  handleFamiliar,
  haveSpleenFamiliar,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "./auto_familiar";
import { LX_freeCombats } from "./auto_powerlevel";
import { doFreeRest, haveFreeRestAvailable } from "./auto_restore";
import {
  almostRollover,
  auto_can_equip,
  auto_deleteMail,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$3,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  autoCraft,
  canYellowRay$1,
  cloversAvailable$1,
  freeCrafts$1,
  handleSealAncient,
  handleSealNormal,
  internalQuestStatus,
  isArmoryAvailable,
  isGeneralStoreAvailable,
  isHermitAvailable,
  meatReserve,
  meatReserveMessage,
  preferredLibram,
  shrugAT$1,
  trim,
  wrap_item,
} from "./auto_util";
import { auto_process_kmail } from "./auto_zlib";
import { doHottub, hotTubSoaksRemaining, zataraSeaside } from "./iotms/clan";
import {
  elementalPlanes_access,
  elementalPlanes_takeJob,
} from "./iotms/elementalPlanes";
import { dna_bedtime } from "./iotms/mr2014";
import {
  auto_haveSourceTerminal,
  auto_haveWitchess,
  auto_sourceTerminalEnhance,
  auto_sourceTerminalEnhanceLeft,
  auto_sourceTerminalExtrude,
} from "./iotms/mr2016";
import {
  canGenieCombat,
  getSpaceJelly,
  kgbWasteClicks,
  loveTunnelAcquire,
  makeGeniePocket,
  spacegateVaccine,
} from "./iotms/mr2017";
import { januaryToteAcquire } from "./iotms/mr2018";
import { auto_beachUseFreeCombs } from "./iotms/mr2019";
import { auto_burnPowerfulGloveCharges } from "./iotms/mr2020";
import {
  auto_haveAugustScepter,
  auto_haveMonkeyPaw,
  auto_makeMonkeyPawWish,
  auto_makeMonkeyPawWish$1,
  auto_monkeyPawWishesLeft,
  auto_scepterRollover,
} from "./iotms/mr2023";
import { auto_burnRemainingSpadeDigs } from "./iotms/mr2026";
import {
  ed_doResting,
  ed_terminateSession,
  handleServant,
  isActuallyEd,
} from "./paths/actually_ed_the_undying";
import { amw_buyAdv, in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import { is_boris } from "./paths/avatar_of_boris";
import { is_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { is_pete } from "./paths/avatar_of_sneaky_pete";
import { inAftercore } from "./paths/casual";
import { bat_terminateSession, in_darkGyffte } from "./paths/dark_gyffte";
import { in_glover } from "./paths/g_lover";
import { in_gnoob } from "./paths/gelatinous_noob";
import { heavyrains_doBedtime, in_heavyrains } from "./paths/heavy_rains";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { in_lol } from "./paths/legacy_of_loathing";
import { in_nuclear } from "./paths/nuclear_autumn";
import { in_plumber } from "./paths/path_of_the_plumber";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_small } from "./paths/small";
import { in_tcrs } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";
import { in_wereprof, is_werewolf } from "./paths/wereprofessor";
import { in_robot, robot_chronolith_cost } from "./paths/you_robot";
import {
  ns_crowd1,
  ns_crowd2,
  ns_crowd3,
  ns_hedge1,
  ns_hedge2,
  ns_hedge3,
} from "./quests/level_13";

//Defined in autoscend/auto_bedtime.ash
function bedtime_still(): void {
  //quickly use up all remaining uses of Nash Crosby's Still during bedtime
  if (!stillReachable()) {
    return; //we can not reach the still
  }
  while (stillsAvailable() > 0) {
    //spend remaining still uses
    let target: Item = Item.none;
    //first try to get at least 1 each of each of the imrpoved booze if possible
    for (const it of $items`bottle of Calcutta Emerald, bottle of Lieutenant Freeman, bottle of Jorge Sinsonte, bottle of Definit, bottle of Domesticated Turkey, boxed champagne`) {
      if (
        target === Item.none &&
        itemAmount(it) === 0 &&
        itemAmount(still_targetToOrigin(it)) > 0
      ) {
        target = it;
      }
    }
    //tonic water is an excellent MP restorer and also can be used to craft some drinks.
    if (
      target === Item.none &&
      myMeat() > meatReserve() + 100 &&
      isGeneralStoreAvailable()
    ) {
      if (auto_buyUpTo(1, $item`soda water`)) {
        target = $item`tonic water`;
      }
    }
    //if we can not afford tonic water use it on the improved item we have the least of.
    if (target === Item.none) {
      //below we will replace target with a better target. only do so if we reached this spot without a target
      //all possible still items except [tonic water] and [bottle of Ooze-O]
      for (const it of $items`bottle of Calcutta Emerald, bottle of Lieutenant Freeman, bottle of Jorge Sinsonte, bottle of Definit, bottle of Domesticated Turkey, boxed champagne, bottle of Pete's Sake, tangerine, kiwi, cocktail onion, kumquat, raspberry`) {
        if (target === Item.none && itemAmount(still_targetToOrigin(it)) > 0) {
          //do not have a target yet
          target = it;
        }
        if (
          target !== Item.none &&
          itemAmount(
            //have a target and seek a better one
            it,
          ) < itemAmount(target) &&
          itemAmount(
            //we want the target we have the least of
            still_targetToOrigin(it),
          ) > 0
        ) {
          //we need to actually be able to make it
          target = it;
        }
      }
    }
    //finally distill the target
    if (target !== Item.none) {
      if (!distill(target)) {
        //try to distill target. do something if it fails
        auto_log_warning$1(
          `bedtime_still() failed to distill [${target}] in Nash Crosby's Still and is giving up to avoid infinite loop`,
        );
        break;
      }
    } else {
      //avoid infinite loop if we did not find any valid targets to distill
      auto_log_warning$1(
        "bedtime_still() could not find any valid targets to distill",
      );
      break;
    }
  }

  if (stillsAvailable() > 0) {
    auto_log_info(
      `You have ${stillsAvailable()} uses of Nash Crosby's Still left.`,
      "red",
    );
  }
}

function bedtime_spleen(): boolean {
  const to_try: Item[] = $items`Breathitin™, Extrovermectin™, hot jelly, scoop of pre-workout powder, Homebodyl™, phosphor traces, energized spores`;

  let done: boolean = false;
  while (spleen_left() > 0 && !done) {
    let consumed_this_loop: boolean = false;
    for (const it of to_try) {
      if (
        canChew(it) &&
        availableAmount(it) > 0 &&
        it.spleen <= spleen_left()
      ) {
        autoChew(1, it);
        consumed_this_loop = true;
        break;
      }
    }
    if (!consumed_this_loop) {
      done = true;
    }
  }
  return spleen_left() === 0;
}

function pullsNeeded(data: string): number {
  if (inAftercore()) {
    return 0;
  }
  if (isActuallyEd()) {
    return 0;
  }

  let count_1: number = 0;
  let adv: number = 0;

  let progress: number = 0;
  if (internalQuestStatus("questL13Final") === 4) {
    progress = 1;
  }
  if (internalQuestStatus("questL13Final") === 5) {
    progress = 2;
  }
  if (internalQuestStatus("questL13Final") === 6) {
    progress = 3;
  }
  if (internalQuestStatus("questL13Final") === 11) {
    progress = 4;
  }
  visitUrl("campground.php?action=telescopelow");

  if (progress < 1) {
    let crowd1score: number = 0;
    let crowd2score: number = 0;
    let crowd3score: number = 0;
    //		Note: Maximizer gives concert White-boy angst, instead of concert 3 (consequently, it doesn\'t work).

    switch (ns_crowd1()) {
      case 1:
        crowd1score = toInt(initiativeModifier() / 40);
        break;
    }

    switch (ns_crowd2()) {
      case $stat`Moxie`:
        crowd2score = (myBuffedstat($stat`Moxie`) - 150) / 40;
        break;
      case $stat`Muscle`:
        crowd2score = (myBuffedstat($stat`Muscle`) - 150) / 40;
        break;
      case $stat`Mysticality`:
        crowd2score = (myBuffedstat($stat`Mysticality`) - 150) / 40;
        break;
    }

    switch (ns_crowd3()) {
      case $element`cold`:
        crowd3score = toInt(numericModifier("cold damage") / 9);
        break;
      case $element`hot`:
        crowd3score = toInt(numericModifier("hot damage") / 9);
        break;
      case $element`sleaze`:
        crowd3score = toInt(numericModifier("sleaze damage") / 9);
        break;
      case $element`spooky`:
        crowd3score = toInt(numericModifier("spooky damage") / 9);
        break;
      case $element`stench`:
        crowd3score = toInt(numericModifier("stench damage") / 9);
        break;
    }

    crowd1score = min(max(0, crowd1score), 9);
    crowd2score = min(max(0, crowd2score), 9);
    crowd3score = min(max(0, crowd3score), 9);
    adv = adv + (10 - crowd1score) + (10 - crowd2score) + (10 - crowd3score);
  }

  if (progress < 2) {
    ns_hedge1();
    ns_hedge2();
    ns_hedge3();

    auto_log_warning(
      "Hedge time of 4 adventures. (Up to 10 without Elemental Resistances)",
      "red",
    );
    adv = adv + 4;
  }

  if (progress < 3) {
    if (
      itemAmount($item`Richard's star key`) === 0 &&
      itemAmount($item`star chart`) === 0
    ) {
      auto_log_warning("Need star chart", "red");
      if (in_heavyrains() && myRain() >= 50) {
        auto_log_info("You should rain man a star chart", "blue");
      } else {
        count_1 = count_1 + 1;
      }
    }

    if (itemAmount($item`Richard's star key`) === 0) {
      const stars: number = itemAmount($item`star`);
      const lines: number = itemAmount($item`line`);

      if (stars < 8) {
        auto_log_warning(`Need ${8 - stars} stars.`, "red");
        count_1 = count_1 + (8 - stars);
      }
      if (lines < 7) {
        auto_log_warning(`Need ${7 - lines} lines.`, "red");
        count_1 = count_1 + (7 - lines);
      }
    }

    if (itemAmount($item`skeleton key`) === 0) {
      if (
        itemAmount($item`skeleton bone`) > 0 &&
        itemAmount($item`loose teeth`) > 0
      ) {
        cliExecute("make skeleton key");
      }
    }
    if (itemAmount($item`skeleton key`) === 0) {
      auto_log_warning$1(
        "Need a skeleton key or the ingredients (skeleton bone, loose teeth) for it.",
      );
    }
  }

  if (progress < 4) {
    adv = adv + 6;
    if (
      toBoolean(getProperty("auto_wandOfNagamar")) &&
      itemAmount($item`Wand of Nagamar`) === 0 &&
      cloversAvailable$1() === 0
    ) {
      auto_log_warning("Need a wand of nagamar (can be clovered).", "red");
      count_1 = count_1 + 1;
    }
  }

  if (adv > 0) {
    auto_log_info(`Estimated adventure need (tower) is: ${adv}.`, "orange");
    if (!inHardcore()) {
      auto_log_info(`You need ${count_1} pulls.`, "orange");
    }
  }
  if (pullsRemaining() > 0) {
    auto_log_info(`You have ${pullsRemaining()} pulls.`, "orange");
  }
  return count_1;
}

function rollover_value(it: Item): number {
  if (it === Item.none) {
    return 0.0;
  }
  let retval: number = numericModifier(it, "adventures");
  if (hippyStoneBroken() && myPath() !== $path`Oxygenarian`) {
    retval +=
      toFloat(getProperty("auto_bedtime_pulls_pvp_multi")) *
      numericModifier(it, "PvP Fights");
  }
  if (it === $item`your cowboy boots`) {
    //your cowboy boot's add-ons are considered seperate items in their own slots
    retval += rollover_value(equippedItem($slot`bootspur`));
    retval += rollover_value(equippedItem($slot`bootskin`));
  }
  return retval;
}

function rollover_improvement(it: Item, sl: Slot): number {
  //some items can go in multiple slots so we need to specify which slot we want to compare it to.
  //we can then compare such items to multiple slots and find the best slot for it
  if (
    sl === $slot`weapon` &&
    weaponHands(it) > 1 &&
    weaponHands(equippedItem(sl)) <= 1
  ) {
    //2h weapon must compare to value of both hands
    return (
      rollover_value(it) -
      rollover_value(equippedItem(sl)) -
      rollover_value(equippedItem($slot`off-hand`))
    );
  }
  if (sl === $slot`off-hand` && weaponHands(equippedItem($slot`weapon`)) > 1) {
    //offhand slot must compare to 2h weapon and not empty offhand. TODO ?would need averaged values with best owned or pullable 1h
    return rollover_value(it) - rollover_value(equippedItem($slot`weapon`));
  }
  if (it === $item`time halo`) {
    //time halo is special. cannot have any weapons or off-hand items equipped. TODO ?compare hand slots and replacement accessory against time halo
    return (
      rollover_value(it) -
      rollover_value(equippedItem(sl)) -
      rollover_value(equippedItem($slot`weapon`)) -
      rollover_value(equippedItem($slot`off-hand`))
    );
  }
  return rollover_value(it) - rollover_value(equippedItem(sl));
}

function bedtime_pulls_rollover_equip$1(desirability_1: number): void {
  //scan through all pullable items for items that have a better rollover adv gain than currently best equipped item.
  // can't pull gear in Legacy of Loathing
  if (in_lol()) {
    return;
  }

  equipRollover(true);
  for (let i: number = 0; i < 10; i++) {
    if (pullsRemaining() === 0) {
      break; //we are out of pulls
    }

    const best: Map<Slot, Item> = new Map();
    let best1hweapon: Item = Item.none;
    let very_best: Item = Item.none;
    let very_best_val: number = 0;
    let very_best_improvement: number = 0;
    let very_best_slot: Slot = Slot.none;
    const a1: Slot = $slot`acc1`;
    const a2: Slot = $slot`acc2`;
    const a3: Slot = $slot`acc3`;
    //we will need to know which accessory slot is the worst
    let worst_acc_slot: Slot = a1;
    if (
      rollover_value(equippedItem(worst_acc_slot)) >
      rollover_value(equippedItem(a2))
    ) {
      worst_acc_slot = $slot`acc2`;
    }
    if (
      rollover_value(equippedItem(worst_acc_slot)) >
      rollover_value(equippedItem(a3))
    ) {
      worst_acc_slot = $slot`acc3`;
    }
    //populate best with current equipment as a baseline
    for (let sl of $slots`hat, back, shirt, pants, acc1, familiar`) {
      //populating with current item as baseline is necessary for accessories. harmful for weapon/off-hand. and harmless elsewhere.
      if (sl === $slot`acc1`) {
        sl = worst_acc_slot;
      }
      best.set(sl, equippedItem(sl));
    }
    //find the best item for each slot
    for (const it of $items.all()) {
      let sl: Slot = toSlot(it);
      if (
        !$slots`hat, weapon, off-hand, back, shirt, pants, acc1, familiar`.includes(
          sl,
        )
      ) {
        //exotic slot or not equip
        continue;
      }
      if (!possessEquipment(it) && !canPull(it, true)) {
        //do not have it and can not pull it.
        continue;
      }
      if (!auto_can_equip(it)) {
        //we can not equip it
        continue;
      }
      const bonusOnlyForClass: string = stringModifier(it, "Class");
      if (
        bonusOnlyForClass !== "" &&
        bonusOnlyForClass !== myClass().toString()
      ) {
        //can't get benefit of it
        continue;
      }

      if ($slot`familiar` === sl && !pathHasFamiliar()) {
        //in paths without familiar do not pull familiar equip.
        if (!in_robot()) {
          continue;
        }
      }
      if ($slot`acc1` === sl) {
        //all accessories always return acc1 from to_slot() function.
        //since we are pulling one item at a time we only want to look at the worst slot each time
        //we just need to make sure that equip conflicts do not arise.
        sl = worst_acc_slot;

        if (booleanModifier(it, "Single Equip")) {
          if (
            equippedAmount(it) > 0 &&
            (best.get(sl) ?? best.set(sl, Item.none).get(sl)) !== it
          ) {
            //we have it equipped but not in the worst slot. So exclude it from optimizing the worst slot.
            continue;
          }
        }

        if (is_watch(it)) {
          //watches conflict with each other. only one watch of any kind can be used
          if (
            equippedAmount(it) > 0 &&
            !is_watch(best.get(sl) ?? best.set(sl, Item.none).get(sl))
          ) {
            //we have a watch equipped but not in the worst slot. So exclude it from optimizing the worst slot.
            continue;
          }
        }

        if (it === $item`time halo`) {
          //needs special check later
          continue;
        }
        //can we even pull another copy of this accessory?
        if (
          equippedAmount(it) > 0 &&
          (best.get(sl) ?? best.set(sl, Item.none).get(sl)) !== it &&
          !canPull(it, true)
        ) {
          continue;
        }

        if (
          rollover_value(it) >
          rollover_value(best.get(sl) ?? best.set(sl, Item.none).get(sl))
        ) {
          best.set(sl, it);
        }
      } else if ($slot`weapon` === sl) {
        //weapon and off-hand slots might conflict and require special handling
        //two or more handed weapons just need to make sure they are better than best weapon and off-hand combined
        if (weaponHands(it) > 1) {
          if (
            weaponHands(
              best.get($slot`weapon`) ??
                best.set($slot`weapon`, Item.none).get($slot`weapon`),
            ) > 1
          ) {
            //if best weapon is already more than 1 handed, must not add off-hand to that weapon
            if (
              rollover_value(it) >
                rollover_value(
                  best.get($slot`weapon`) ??
                    best.set($slot`weapon`, Item.none).get($slot`weapon`),
                ) &&
              rollover_value(it) >
                rollover_value(
                  best.get($slot`off-hand`) ??
                    best.set($slot`off-hand`, Item.none).get($slot`off-hand`),
                )
            ) {
              best.set(sl, it);
            }
          } else if (
            rollover_value(it) >
            rollover_value(
              best.get($slot`weapon`) ??
                best.set($slot`weapon`, Item.none).get($slot`weapon`),
            ) +
              rollover_value(
                best.get($slot`off-hand`) ??
                  best.set($slot`off-hand`, Item.none).get($slot`off-hand`),
              )
          ) {
            //for non conflicting slots. calculate normally
            //remember best 1h to compare again when better off-hand slots are found
            best1hweapon =
              best.get($slot`weapon`) ??
              best.set($slot`weapon`, Item.none).get($slot`weapon`);
            //there is no need to change offhand target since we pull one item at a time. in fact we prefer offhand to retain an independent value
            best.set(sl, it);
          }
        } else if (weaponHands(it) === 1) {
          //single handed weapons for the weapon slot
          if (
            weaponHands(best.get(sl) ?? best.set(sl, Item.none).get(sl)) > 1
          ) {
            //the currently desired best weapon is 2 handed weapon. so we sum it value with best off-hand found thus far
            if (
              rollover_value(it) +
                rollover_value(
                  best.get($slot`off-hand`) ??
                    best.set($slot`off-hand`, Item.none).get($slot`off-hand`),
                ) >
              rollover_value(best.get(sl) ?? best.set(sl, Item.none).get(sl))
            ) {
              best.set(sl, it);
            }
          } else if (
            rollover_value(it) >
            rollover_value(best.get(sl) ?? best.set(sl, Item.none).get(sl))
          ) {
            //the currently desired best weapon is 1 handed. So we just compare it to best weapon.
            best.set(sl, it);
            best1hweapon =
              best.get($slot`weapon`) ??
              best.set($slot`weapon`, Item.none).get($slot`weapon`);
          } else if (rollover_value(it) > rollover_value(best1hweapon)) {
            //keep best1hweapon updated even if not best weapon
            best1hweapon =
              best.get($slot`weapon`) ??
              best.set($slot`weapon`, Item.none).get($slot`weapon`);
          }
          //single handed weapons for the off-hand slot
          const weapon_offhand: boolean = haveSkill(
            $skill`Double-Fisted Skull Smashing`,
          );
          const conflict_mainhand: boolean =
            booleanModifier(it, "Single Equip") &&
            (best.get(sl) ?? best.set(sl, Item.none).get(sl)) === it;
          const conflict_quantity: boolean =
            (best.get(sl) ?? best.set(sl, Item.none).get(sl)) === it &&
            !canPull(it, true) &&
            itemAmount(it) + equippedAmount(it) < 2;
          if (weapon_offhand && !conflict_mainhand && !conflict_quantity) {
            if (
              rollover_value(it) >
              rollover_value(
                best.get($slot`off-hand`) ??
                  best.set($slot`off-hand`, Item.none).get($slot`off-hand`),
              )
            ) {
              best.set($slot`off-hand`, it);
            }
          }
        } else {
          abort(
            `[${it}] listed as having ${weaponHands(it)} hands while being a weapon`,
          );
        }
      } else if (
        rollover_value(it) >
        rollover_value(best.get(sl) ?? best.set(sl, Item.none).get(sl))
      ) {
        //for non conflicting slots. calculate normally.
        //off-hand might conflict but are resolved at the weapon slot in a way that still requires us to find the best offhand
        best.set(sl, it);
        //best off-hand slot can make best remembered 1h weapon better than current best 2h weapon
        if (
          $slot`off-hand` === sl &&
          weaponHands(
            best.get($slot`weapon`) ??
              best.set($slot`weapon`, Item.none).get($slot`weapon`),
          ) > 1
        ) {
          if (
            rollover_value(it) + rollover_value(best1hweapon) >
            rollover_value(
              best.get($slot`weapon`) ??
                best.set($slot`weapon`, Item.none).get($slot`weapon`),
            )
          ) {
            best.set($slot`weapon`, best1hweapon);
          }
        }
      }
    }
    //time halo is special. cannot have any weapons or off-hand items equipped
    if (
      rollover_value($item`time halo`) >
      rollover_value(
        best.get(worst_acc_slot) ??
          best.set(worst_acc_slot, Item.none).get(worst_acc_slot),
      ) +
        rollover_value(
          best.get($slot`weapon`) ??
            best.set($slot`weapon`, Item.none).get($slot`weapon`),
        ) +
        rollover_value(
          best.get($slot`off-hand`) ??
            best.set($slot`off-hand`, Item.none).get($slot`off-hand`),
        )
    ) {
      if (
        (possessEquipment($item`time halo`) ||
          canPull($item`time halo`, true)) &&
        auto_can_equip($item`time halo`)
      ) {
        best.set(worst_acc_slot, $item`time halo`);
        //clearing weapon and off-hand here at least avoids pulling them after a time halo in the same rollover.
        //should technically decide based on improvement value instead, but if the best of 3 slots together are beaten by 5 their improvement value would be low
        best.set($slot`weapon`, Item.none);
        best.set($slot`off-hand`, Item.none);
      }
    }
    //find the very best item
    const extra_debug: boolean = toBoolean(
      getProperty("_auto_extra_debug_bedtime_pulls"),
    );
    for (let sl of $slots`hat, weapon, off-hand, back, shirt, pants, acc1, familiar`) {
      if (sl === $slot`acc1`) {
        sl = worst_acc_slot;
      }

      if (extra_debug) {
        //prints out all the items we want. Too messy for normal runs even in debug mode.
        auto_log_debug$1(
          `[${sl}] wanted [${best.get(sl) ?? best.set(sl, Item.none).get(sl)}] val = ${rollover_value(best.get(sl) ?? best.set(sl, Item.none).get(sl))}. currently [${equippedItem(sl)}] val = ${rollover_value(equippedItem(sl))}. improvement = ${rollover_improvement(best.get(sl) ?? best.set(sl, Item.none).get(sl), sl)}`,
        );
      }
      //if we already pulled the best item for a slot but maximizer failed to equip our best item into it for some reason then we want to exclude that slot from further attempts.
      const maximizer_fail: boolean =
        possessEquipment(best.get(sl) ?? best.set(sl, Item.none).get(sl)) &&
        equippedItem(sl) !== (best.get(sl) ?? best.set(sl, Item.none).get(sl));
      if (maximizer_fail) {
        auto_log_debug$1(
          `Bedtime pulls: maximizer is not equipping [${best.get(sl) ?? best.set(sl, Item.none).get(sl)}] into [${sl}] for some reason. Skipping this slot`,
        );
      } else if (
        rollover_improvement(
          best.get(sl) ?? best.set(sl, Item.none).get(sl),
          sl,
        ) > very_best_val
      ) {
        very_best = best.get(sl) ?? best.set(sl, Item.none).get(sl);
        very_best_val = rollover_improvement(
          best.get(sl) ?? best.set(sl, Item.none).get(sl),
          sl,
        );
        very_best_slot = sl;
      }
    }

    very_best_improvement = rollover_improvement(very_best, very_best_slot);
    if (very_best_improvement < desirability_1) {
      break;
    }
    auto_log_info$1(
      `Pulling [${very_best}] which improves desireability score by ${very_best_improvement}`,
    );
    if (extra_debug) {
      break;
    }
    pullXWhenHaveY(very_best, 1, 0);
    equipRollover(true);
  }
}

function bedtime_pulls_rollover_equip(): void {
  bedtime_pulls_rollover_equip$1(
    toFloat(getProperty("auto_bedtime_pulls_min_desirability")),
  );
}

function bedtime_pulls(): void {
  if (pullsRemaining() < 1) {
    //out of pulls or in hardcore or in casual.
    return;
  }
  if (toBoolean(getProperty("auto_bedtime_pulls_skip"))) {
    return;
  }

  if (myDaycount() === 1 && myLevel() <= 8) {
    //this run looks like it will take a couple more days, give priority to good rollover equipment before other pulls
    const desirability_1: number = max(
      5.0,
      toFloat(getProperty("auto_bedtime_pulls_min_desirability")),
    );
    bedtime_pulls_rollover_equip$1(desirability_1);
  }

  if (
    toFloat(getProperty("auto_bedtime_pulls_min_desirability")) <= 5.0 &&
    !in_lol()
  ) {
    if (storageAmount($item`potato alarm clock`) > 0) {
      pullXWhenHaveY($item`potato alarm clock`, 1, 0);
    }
  }

  if (
    itemAmount($item`muculent machete`) === 0 &&
    !(is_boris() || in_wotsf() || in_pokefam() || in_lol())
  ) {
    // no need in paths where can't use machete
    pullXWhenHaveY($item`antique machete`, 1, 0);
  }
  if (
    itemAmount($item`wet stunt nut stew`) === 0 &&
    !possessEquipment($item`Mega Gem`) &&
    !isActuallyEd()
  ) {
    pullXWhenHaveY($item`wet stew`, 1, 0);
  }
  if (!blackMarketAvailable() && !in_lol()) {
    pullXWhenHaveY($item`blackberry galoshes`, 1, 0);
  }
  if (internalQuestStatus("questL11Desert") < 1) {
    const gnasirProgress: number = toInt(getProperty("gnasirProgress"));
    if ((gnasirProgress & 16) === 0 && auto_is_valid($item`drum machine`)) {
      pullXWhenHaveY($item`drum machine`, 1, 0);
    }
    if ((gnasirProgress & 4) === 0) {
      pullXWhenHaveY($item`killing jar`, 1, 0);
    }
  }
  //scan through all pullable items for items that have a better rollover adv gain than currently best equipped item.
  bedtime_pulls_rollover_equip();
  //pull 11-leaf clover if we can use it
  if (auto_is_valid($item`11-leaf clover`)) {
    pullXWhenHaveY($item`11-leaf clover`, 1, itemAmount($item`11-leaf clover`));
  }
}

export function doBedtime(): boolean {
  auto_log_info(`Starting bedtime: Pulls Left: ${pullsRemaining()}`, "blue");

  if (getProperty("lastEncounter") === "Like a Bat Into Hell") {
    abort(
      "Our last encounter was UNDYING and we ended up trying to bedtime and failed.",
    );
  }

  auto_process_kmail(auto_deleteMail);
  // If rollover isn't approaching, check for reasons to stop bedtime
  let out_of_blood: boolean = false;
  if (!almostRollover()) {
    if (myAdventures() > 4) {
      if (myInebriety() <= inebrietyLimit()) {
        if (!in_gnoob() && myFamiliar() !== $familiar`Stooper`) {
          auto_log_warning("Still adventurous! Stopping bedtime.", "red");
          return false;
        }
      }
    }
    out_of_blood = in_darkGyffte() && itemAmount($item`blood bag`) === 0;
    if (fullness_left() > 0 && canEat() && !out_of_blood) {
      auto_log_warning("Still hungry! Stopping bedtime.", "red");
      return false;
    }
    if (inebriety_left() > 0 && canDrink() && !out_of_blood) {
      auto_log_warning("Still sober! Stopping bedtime.", "red");
      return false;
    }
    if (in_amw() && amw_buyAdv()) {
      auto_log_warning(
        "Still grinding meat into adventures! Stopping bedtime.",
        "red",
      );
      return false;
    }
    let spleenlimit: number = spleenLimit();
    if (!canChangeFamiliar()) {
      spleenlimit -= 3;
    }
    if (!haveSpleenFamiliar()) {
      spleenlimit = 0;
    }
    if (mySpleenUse() < spleenlimit && !inHardcore() && inebriety_left() > 0) {
      auto_log_warning("Still spleeny! Stopping bedtime.", "red");
      return false;
    }
  }

  ed_terminateSession();
  bat_terminateSession();

  while (LX_freeCombats()) {}
  // although seals can be fought drunk, it complicates code without a meaningful benefit
  if (
    myClass() === $class`Seal Clubber` &&
    guildStoreAvailable() &&
    myInebriety() <= inebrietyLimit() &&
    !in_avantGuard()
  ) {
    handleFamiliar("stat");
    let oldSeals: number = toInt(getProperty("_sealsSummoned"));
    while (
      toInt(getProperty("_sealsSummoned")) < 5 &&
      !inAftercore() &&
      myMeat() > 4500
    ) {
      let summoned: boolean = false;
      if (myDaycount() === 1 && myLevel() >= 6 && isHermitAvailable()) {
        cliExecute("make figurine of an ancient seal");
        auto_buyUpTo(3, $item`seal-blubber candle`);
        ensureSealClubs();
        handleSealAncient();
        summoned = true;
      } else if (myLevel() >= 9) {
        auto_buyUpTo(1, $item`figurine of an armored seal`);
        auto_buyUpTo(10, $item`seal-blubber candle`);
        ensureSealClubs();
        handleSealNormal($item`figurine of an armored seal`);
        summoned = true;
      } else if (myLevel() >= 5) {
        auto_buyUpTo(1, $item`figurine of a cute baby seal`);
        auto_buyUpTo(5, $item`seal-blubber candle`);
        ensureSealClubs();
        handleSealNormal($item`figurine of a cute baby seal`);
        summoned = true;
      } else {
        auto_buyUpTo(1, $item`figurine of a wretched-looking seal`);
        auto_buyUpTo(1, $item`seal-blubber candle`);
        ensureSealClubs();
        handleSealNormal($item`figurine of a wretched-looking seal`);
        summoned = true;
      }
      const newSeals: number = toInt(getProperty("_sealsSummoned"));
      if (newSeals === oldSeals && summoned) {
        abort("Unable to summon seals.");
      }
      oldSeals = newSeals;
    }
  }

  if (toInt(getProperty("auto_priorCharpaneMode")) === 1) {
    auto_log_info$1("Resuming Compact Character Mode.");
    setProperty("auto_priorCharpaneMode", (0).toString());
    visitUrl(
      "account.php?am=1&pwd=&action=flag_compactchar&value=1&ajax=0",
      true,
    );
  }

  if (
    itemAmount($item`License to Chill`) > 0 &&
    !toBoolean(getProperty("_licenseToChillUsed"))
  ) {
    use(1, $item`License to Chill`);
  }

  if (
    myInebriety() <= inebrietyLimit() &&
    canDrink() &&
    myRain() >= 50 &&
    myAdventures() >= 1
  ) {
    if (myDaycount() === 1) {
      if (itemAmount($item`Rain-Doh indigo cup`) > 0) {
        auto_log_info(
          `Copies left: ${5 - toInt(getProperty("_raindohCopiesMade"))}`,
          "olive",
        );
      }
      if (!inHardcore()) {
        auto_log_info(`Pulls remaining: ${pullsRemaining()}`, "olive");
      }
      if (
        !possessOutfit$1("frat warrior fatigues") &&
        !toBoolean(getProperty("auto_hippyInstead"))
      ) {
        auto_log_info(
          "Please consider an orcish frat boy spy (You want Frat Warrior Fatigues).",
          "blue",
        );
        if (canYellowRay$1()) {
          auto_log_info("Make sure to Ball Lightning the spy!!", "red");
        }
      } else if (
        !possessOutfit$1("War Hippy Fatigues") &&
        toBoolean(getProperty("auto_hippyInstead"))
      ) {
        auto_log_info(
          "Please consider a Bailey's Beetle (You want War Hippy Fatigues).",
          "blue",
        );
        if (canYellowRay$1()) {
          auto_log_info("Make sure to Ball Lightning the hippy!!", "red");
        }
      } else {
        auto_log_info(
          "If you have the Frat Warrior Fatigues, rain man an Astronomer? Skinflute?",
          "blue",
        );
      }
    }
    if (
      auto_have_familiar($familiar`Machine Elf`) &&
      toInt(getProperty("_machineTunnelsAdv")) < 5 &&
      inebriety_left() >= 0 &&
      myAdventures() > 0
    ) {
      auto_log_info(
        `You have ${5 - toInt(getProperty("_machineTunnelsAdv"))} fights in The Deep Machine Tunnels that you should use!`,
        "blue",
      );
    }
    auto_log_info(
      "You have a rain man to cast, please do so before overdrinking and run me again.",
      "red",
    );
    return false;
  }
  //We are committing to end of day now...
  getSpaceJelly();
  while (acquireHermitItem($item`11-leaf clover`)) {}

  auto_burnRemainingSpadeDigs(); // use archaeologist spade

  januaryToteAcquire($item`makeshift garbage shirt`); //doubles stat gains in the LOV tunnel. also keep leftover charges for tomorrow.
  loveTunnelAcquire(true, Stat.none, true, 3, true, 1);

  const bottle: Item = wrap_item($item`genie bottle`);
  if (itemAmount(bottle) > 0 && auto_is_valid(bottle)) {
    //we are in bedtime so any wishes we planned to use today were already used. thus even if we can not use pocket wishes in this path we should still make them to avoid waste
    for (let i: number = toInt(getProperty("_genieWishesUsed")); i < 3; i++) {
      makeGeniePocket();
    }
  }
  if (
    canGenieCombat($monster`Orcish Frat Boy Spy`) &&
    !possessOutfit$1("frat warrior fatigues")
  ) {
    auto_log_info(
      "Please consider genie wishing for an orcish frat boy spy (You want Frat Warrior Fatigues).",
      "blue",
    );
  }

  if (
    itemAmount($item`infinite BACON machine`) > 0 &&
    !toBoolean(getProperty("_internetViralVideoBought")) &&
    !canInteract()
  ) {
    const hasDisintegrate: boolean =
      auto_have_skill($skill`Disintegrate`) &&
      myMaxmp() >= 1.5 * mpCost($skill`Disintegrate`); //will be limited by current mp, try to gauge if it will be available
    const notNeeded: boolean =
      haveEffect($effect`Everything Looks Yellow`) > 0 ||
      hasDisintegrate ||
      canYellowRay$1(); //have a common unlimited source of YR, no need to make viral video
    const baconUnused: boolean =
      itemAmount($item`BACON`) >= 100 * myDaycount() - 20 * (myDaycount() - 1); //BACON hasn't been used for something else this ascension
    if (
      auto_is_valid($item`viral video`) &&
      !notNeeded &&
      baconUnused &&
      !in_koe() &&
      !is_werewolf()
    ) {
      //bacon store is unreachable in kingdom of exploathing or as werewolf
      //can only buy 1 per day and more than one a day might be wanted later so buy today's viral video
      create(1, $item`viral video`);
    }
  }

  if (friarsAvailable() && !toBoolean(getProperty("friarsBlessingReceived"))) {
    if (pathHasFamiliar()) {
      cliExecute("friars familiar");
    } else {
      cliExecute("friars food");
    }
  }

  if (myHp() < 0.9 * myMaxhp() && hotTubSoaksRemaining() > 0) {
    doHottub();
  }

  if (
    !toBoolean(getProperty("_mayoTankSoaked")) &&
    auto_get_campground().has($item`portable Mayo Clinic`) &&
    isUnrestricted($item`portable Mayo Clinic`)
  ) {
    const temp: string = visitUrl("shop.php?action=bacta&whichshop=mayoclinic");
  }

  if (
    in_nuclear() &&
    toInt(getProperty("falloutShelterLevel")) >= 3 &&
    !toBoolean(getProperty("_falloutShelterSpaUsed"))
  ) {
    const temp: string = visitUrl(
      "place.php?whichplace=falloutshelter&action=vault3",
    );
  }
  //	Also use "nunsVisits", as long as they were won by the Frat (sidequestNunsCompleted="fratboy").
  ed_doResting();
  const libram: Skill = preferredLibram();
  if (libram !== Skill.none) {
    while (haveFreeRestAvailable() && mpCost(libram) <= myMaxmp()) {
      doFreeRest();
      while (myMp() > mpCost(libram)) {
        useSkill(1, libram);
      }
    }
  }

  if (
    isUnrestricted($item`Clan pool table`) &&
    toInt(getProperty("_poolGames")) < 3 &&
    itemAmount($item`Clan VIP Lounge key`) > 0
  ) {
    visitUrl("clan_viplounge.php?preaction=poolgame&stance=1");
    visitUrl("clan_viplounge.php?preaction=poolgame&stance=1");
    if (auto_is_valid$3($effect`Hustlin'`)) {
      visitUrl("clan_viplounge.php?preaction=poolgame&stance=3");
    }
    visitUrl("clan_viplounge.php?preaction=poolgame&stance=1");
  }
  if (
    isUnrestricted($item`colorful plastic ball`) &&
    !toBoolean(getProperty("_ballpit")) &&
    getClanId() !== -1
  ) {
    cliExecute("ballpit");
  }
  if (
    toInt(getProperty("telescopeUpgrades")) > 0 &&
    internalQuestStatus("questL13Final") < 0
  ) {
    if (
      getProperty("telescopeLookedHigh") === "false" &&
      auto_is_valid$3($effect`Starry-Eyed`)
    ) {
      cliExecute("telescope high");
    }
  }

  if (
    !possessEquipment($item`Vicar's Tutu`) &&
    myDaycount() === 1 &&
    itemAmount($item`lump of Brituminous coal`) > 0
  ) {
    if (itemAmount($item`frilly skirt`) < 1 && knollAvailable()) {
      auto_buyUpTo(1, $item`frilly skirt`);
    }
    if (itemAmount($item`frilly skirt`) > 0) {
      autoCraft(
        "smith",
        1,
        $item`lump of Brituminous coal`,
        $item`frilly skirt`,
      );
    }
  }

  if (
    myDaycount() === 1 &&
    (possessEquipment($item`Thor's Pliers`) || freeCrafts$1() > 0) &&
    !possessEquipment($item`chrome sword`) &&
    auto_is_valid($item`chrome sword`) &&
    !inAftercore() &&
    !in_tcrs()
  ) {
    const oreGoal: Item = toItem(getProperty("trapperOre"));
    let need: number = 1;
    const haveAdvSmithing: boolean = haveSkill(
      $skill`Super-Advanced Meatsmithing`,
    );
    if (oreGoal === $item`chrome ore`) {
      need = 4;
    }
    if (!haveAdvSmithing) {
      auto_log_info$1(
        "No Super-Advanced Meatsmithing for chrome sword crafting!",
      );
    }
    if (
      itemAmount($item`chrome ore`) >= need &&
      !possessEquipment($item`chrome sword`) &&
      isArmoryAvailable() &&
      haveAdvSmithing
    ) {
      cliExecute(`make ${$item`chrome sword`}`);
    } else {
      auto_log_info$1("Did not make chrome sword");
    }
  }

  heavyrains_doBedtime();

  while (
    myDaycount() === 1 &&
    auto_is_valid($item`resolution: be more adventurous`) &&
    itemAmount($item`resolution: be more adventurous`) > 0 &&
    toInt(getProperty("_resolutionAdv")) < 10 &&
    !canInteract()
  ) {
    use(1, $item`resolution: be more adventurous`);
  }
  // If in TCRS skip using freecrafts but alert user of how many they can manually use.
  if (in_tcrs() && freeCrafts$1() > 0) {
    auto_log_warning(
      "In TCRS: Items are variable, skipping End Of Day crafting",
      "red",
    );
    auto_log_warning(
      `Consider manually using your ${freeCrafts$1()} free crafts`,
      "red",
    );
  } else if (myDaycount() <= 2 && freeCrafts$1() > 0 && myAdventures() > 0) {
    // Check for rapid prototyping
    while (
      freeCrafts$1() > 0 &&
      itemAmount($item`scrumptious reagent`) > 0 &&
      itemAmount($item`cranberries`) > 0 &&
      itemAmount($item`cranberry cordial`) < 2 &&
      haveSkill($skill`Advanced Saucecrafting`)
    ) {
      cliExecute(`make ${$item`cranberry cordial`}`);
    }
    putCloset(itemAmount($item`cranberries`), $item`cranberries`);
    while (
      freeCrafts$1() > 0 &&
      itemAmount($item`scrumptious reagent`) > 0 &&
      itemAmount($item`glass of goat's milk`) > 0 &&
      itemAmount($item`milk of magnesium`) < 2 &&
      haveSkill($skill`Advanced Saucecrafting`)
    ) {
      cliExecute(`make ${$item`milk of magnesium`}`);
    }
  }

  dna_bedtime();

  if (
    getProperty("_grimBuff") === "false" &&
    auto_have_familiar($familiar`Grim Brother`)
  ) {
    const temp: string = visitUrl(
      "choice.php?pwd=&whichchoice=835&option=1",
      true,
    );
  }

  dailyEvents();
  if (
    toInt(getProperty("auto_clanstuff")) < myDaycount() &&
    getClanId() !== -1
  ) {
    if (
      toInt(getProperty("_klawSummons")) === 0 &&
      'Mr. Klaw "Skill" Crane Game' in getClanRumpus()
    ) {
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    }
    if (itemAmount($item`Clan VIP Lounge key`) > 0) {
      if (
        isUnrestricted($item`Olympic-sized Clan crate`) &&
        !toBoolean(getProperty("_olympicSwimmingPool"))
      ) {
        cliExecute("swim noncombat");
      }
      if (
        isUnrestricted($item`Olympic-sized Clan crate`) &&
        !toBoolean(getProperty("_olympicSwimmingPoolItemFound"))
      ) {
        cliExecute("swim item");
      }
      if (
        isUnrestricted($item`Clan looking glass`) &&
        !toBoolean(getProperty("_lookingGlass"))
      ) {
        const temp: string = visitUrl("clan_viplounge.php?action=lookingglass");
      }
      if (toInt(getProperty("_deluxeKlawSummons")) === 0) {
        cliExecute("clan_viplounge.php?action=klaw");
        cliExecute("clan_viplounge.php?action=klaw");
        cliExecute("clan_viplounge.php?action=klaw");
      }
      if (!toBoolean(getProperty("_aprilShower"))) {
        if (inAftercore()) {
          cliExecute("shower ice");
        } else if (in_glover()) {
          cliExecute("shower mp"); // can't use the effects or the ice
        } else {
          cliExecute(`shower ${myPrimestat()}`);
        }
      }
      if (
        isUnrestricted($item`Crimbough`) &&
        !toBoolean(getProperty("_crimboTree"))
      ) {
        cliExecute("crimbotree get");
      }
    }
    setProperty("auto_clanstuff", `${myDaycount()}`);
  }

  if (
    getProperty("sidequestOrchardCompleted") !== "none" &&
    !toBoolean(getProperty("_hippyMeatCollected"))
  ) {
    visitUrl("shop.php?whichshop=hippy");
  }

  if (
    getProperty("sidequestArenaCompleted") !== "none" &&
    !toBoolean(getProperty("concertVisited"))
  ) {
    cliExecute("concert 2");
  }
  if (inAftercore()) {
    if (
      itemAmount($item`The Legendary Beat`) > 0 &&
      !toBoolean(getProperty("_legendaryBeat"))
    ) {
      use(1, $item`The Legendary Beat`);
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      toInt(getProperty("_clipartSummons")) === 0
    ) {
      cliExecute("make unbearable light");
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      toInt(getProperty("_clipartSummons")) === 1
    ) {
      cliExecute("make cold-filtered water");
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      toInt(getProperty("_clipartSummons")) === 2
    ) {
      cliExecute("make bucket of wine");
    }
    if (
      itemAmount($item`handmade hobby horse`) > 0 &&
      !toBoolean(getProperty("_hobbyHorseUsed"))
    ) {
      use(1, $item`handmade hobby horse`);
    }
    if (
      itemAmount($item`ball-in-a-cup`) > 0 &&
      !toBoolean(getProperty("_ballInACupUsed"))
    ) {
      use(1, $item`ball-in-a-cup`);
    }
    if (
      itemAmount($item`set of jacks`) > 0 &&
      !toBoolean(getProperty("_setOfJacksUsed"))
    ) {
      use(1, $item`set of jacks`);
    }
  }

  if (myDaycount() - 5 >= toInt(getProperty("lastAnticheeseDay"))) {
    visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse");
  }

  if (
    auto_haveWitchess() &&
    toInt(getProperty("puzzleChampBonus")) === 20 &&
    !toBoolean(getProperty("_witchessBuff"))
  ) {
    visitUrl("campground.php?action=witchess");
    visitUrl("choice.php?whichchoice=1181&pwd=&option=3");
    visitUrl("choice.php?whichchoice=1183&pwd=&option=2");
  }

  if (auto_haveSourceTerminal()) {
    let enhances: number = auto_sourceTerminalEnhanceLeft();
    while (enhances > 0) {
      if (in_glover()) {
        auto_sourceTerminalEnhance("damage");
        enhances -= 1;
      } else {
        auto_sourceTerminalEnhance("items");
        auto_sourceTerminalEnhance("meat");
        enhances -= 2;
      }
    }
  }
  // Is +50% to all stats the best choice here? I don't know!
  if (auto_is_valid$3($effect`Broad-Spectrum Vaccine`)) {
    spacegateVaccine($effect`Broad-Spectrum Vaccine`);
  }

  if (!auto_is_valid$3($effect`There's No N in Love`)) {
    zataraSeaside("familiar");
  } else {
    zataraSeaside("item");
  }

  if (
    isUnrestricted($item`Source terminal`) &&
    $item`Source terminal`.toString() in getCampground()
  ) {
    if (!inAftercore() && getProperty("auto_extrudeChoice") !== "none") {
      let count_1: number = 3 - toInt(getProperty("_sourceTerminalExtrudes"));

      const extrudeChoice: Map<number, string> = new Map();
      if (getProperty("auto_extrudeChoice") !== "") {
        const extrudeDays: Map<number, string> = new Map(
          splitString(getProperty("auto_extrudeChoice"), ":").map((_v, _i) => [
            _i,
            _v,
          ]),
        );
        const tempChoice: Map<number, string> = new Map(
          splitString(
            trim(
              extrudeDays.get(min(extrudeDays.size, myDaycount()) - 1) ??
                extrudeDays
                  .set(min(extrudeDays.size, myDaycount()) - 1, "")
                  .get(min(extrudeDays.size, myDaycount()) - 1),
            ),
            ";",
          ).map((_v, _i) => [_i, _v]),
        );
        for (let i: number = 0; i < tempChoice.size; i++) {
          extrudeChoice.set(
            i,
            tempChoice.get(i) ?? tempChoice.set(i, "").get(i),
          );
        }
      }
      let amt: number = extrudeChoice.size;
      let acquire: string = "booze";
      if (myPath() === $path`Teetotaler`) {
        acquire = "food";
      }
      while (amt < 3) {
        extrudeChoice.set(extrudeChoice.size, acquire);
        amt++;
      }

      while (count_1 > 0 && itemAmount($item`Source essence`) >= 10) {
        auto_sourceTerminalExtrude(
          extrudeChoice.get(3 - count_1) ??
            extrudeChoice.set(3 - count_1, "").get(3 - count_1),
        );
        count_1 -= 1;
      }
    }
    const extrudeLeft: number =
      3 - toInt(getProperty("_sourceTerminalExtrudes"));
    if (
      extrudeLeft > 0 &&
      !in_pokefam() &&
      itemAmount($item`Source essence`) >= 10
    ) {
      auto_log_info(
        `You still have ${extrudeLeft} Source Extrusions left`,
        "blue",
      );
    }
  }

  auto_burnPowerfulGloveCharges();

  if (itemAmount($item`Rain-Doh indigo cup`) > 0) {
    auto_log_info(
      `Copies left: ${5 - toInt(getProperty("_raindohCopiesMade"))}`,
      "olive",
    );
  }
  if (!inHardcore()) {
    auto_log_info(`Pulls remaining: ${pullsRemaining()}`, "olive");
  }

  if (haveSkill($skill`Inigo's Incantation of Inspiration`)) {
    const craftingLeft: number = 5 - toInt(getProperty("_inigosCasts"));
    auto_log_info(`Free Inigo's craftings left: ${craftingLeft}`, "blue");
  }
  if (itemAmount($item`Loathing Legion jackhammer`) > 0) {
    const craftingLeft: number =
      3 - toInt(getProperty("_legionJackhammerCrafting"));
    auto_log_info(
      `Free Loathing Legion Jackhammer craftings left: ${craftingLeft}`,
      "blue",
    );
  }
  if (itemAmount($item`Thor's Pliers`) > 0) {
    const craftingLeft: number =
      10 - toInt(getProperty("_thorsPliersCrafting"));
    auto_log_info(`Free Thor's Pliers craftings left: ${craftingLeft}`, "blue");
  }
  if (freeCrafts$1() > 0) {
    auto_log_info(`Free craftings left: ${freeCrafts$1()}`, "blue");
  }
  if (toInt(getProperty("timesRested")) < totalFreeRests()) {
    auto_log_info(
      `You have ${totalFreeRests() - toInt(getProperty("timesRested"))} free rests remaining.`,
      "blue",
    );
  }
  if (
    possessEquipment($item`Kremlin's Greatest Briefcase`) &&
    toInt(getProperty("_kgbClicksUsed")) < 24
  ) {
    kgbWasteClicks();
    const clicks: number = 22 - toInt(getProperty("_kgbClicksUsed"));
    if (clicks > 0) {
      auto_log_info(`You have some KGB clicks (${clicks}) left!`, "green");
    }
  }
  if (
    getProperty("sidequestNunsCompleted") === "fratboy" &&
    toInt(getProperty("nunsVisits")) < 3
  ) {
    auto_log_info(
      `You have ${3 - toInt(getProperty("nunsVisits"))} nuns visits left.`,
      "blue",
    );
  }
  if (toInt(getProperty("libramSummons")) > 0) {
    auto_log_info(
      `Total Libram Summons: ${getProperty("libramSummons")}`,
      "blue",
    );
  }

  let smiles: number =
    5 *
      (itemAmount($item`Golden Mr. Accessory`) +
        storageAmount($item`Golden Mr. Accessory`) +
        closetAmount($item`Golden Mr. Accessory`)) -
    toInt(getProperty("_smilesOfMrA"));
  if (in_glover()) {
    smiles = 0;
  }
  if (smiles > 0) {
    if (getProperty("auto_smileAt") !== "") {
      cliExecute(`/cast ${smiles} the smile @ ${getProperty("auto_smileAt")}`);
    } else {
      auto_log_info(`You have ${smiles} smiles of Mr. A remaining.`, "blue");
    }
  }

  if (
    itemAmount($item`CSA fire-starting kit`) > 0 &&
    !toBoolean(getProperty("_fireStartingKitUsed"))
  ) {
    auto_log_info("Still have a CSA Fire-Starting Kit you can use!", "blue");
  }
  if (
    itemAmount($item`Glenn's golden dice`) > 0 &&
    !toBoolean(getProperty("_glennGoldenDiceUsed"))
  ) {
    auto_log_info(
      "Still have some of Glenn's Golden Dice that you can use!",
      "blue",
    );
  }
  if (
    itemAmount($item`License to Chill`) > 0 &&
    !toBoolean(getProperty("_licenseToChillUsed"))
  ) {
    auto_log_info("You are still licensed enough to be able to chill.", "blue");
  }

  if (
    itemAmount($item`School of Hard Knocks Diploma`) > 0 &&
    !toBoolean(getProperty("_hardKnocksDiplomaUsed"))
  ) {
    use(1, $item`School of Hard Knocks Diploma`);
  }

  if (
    !toBoolean(getProperty("_lyleFavored")) &&
    auto_is_valid$3($effect`Favored by Lyle`)
  ) {
    const temp: string = visitUrl(
      "place.php?whichplace=monorail&action=monorail_lyle",
    );
  }

  if (
    toBoolean(getProperty("spookyAirportAlways")) &&
    !isActuallyEd() &&
    !toBoolean(getProperty("_controlPanelUsed"))
  ) {
    visitUrl(
      "place.php?whichplace=airport_spooky_bunker&action=si_controlpanel",
    );
    visitUrl("choice.php?pwd=&whichchoice=986&option=8", true);
    if (toInt(getProperty("controlPanelOmega")) >= 99) {
      visitUrl("choice.php?pwd=&whichchoice=986&option=10", true);
    }
  }

  elementalPlanes_takeJob($element`spooky`);
  elementalPlanes_takeJob($element`stench`);
  elementalPlanes_takeJob($element`cold`);

  auto_beachUseFreeCombs();
  auto_drinkNightcap();
  while (in_amw() && myAdventures() <= 125) {
    if (!amw_buyAdv()) {
      break;
    }
  }
  equipRollover(false);
  // Use up any cursed monkey paw wishes on Frosty (+100% item, +100% meat, +25 ML)
  // Unless we're limiting ML, then do One Very Clear Eye
  let effect_to_wish: Effect = $effect`Frosty`;
  if (getProperty("auto_MLSafetyLimit") !== "" || in_wereprof()) {
    // Professor hates ML
    if (toInt(getProperty("auto_MLSafetyLimit")) < 25 || in_wereprof()) {
      // We're adding +25 ML that won't be shrugged. Professor hates ML
      effect_to_wish = $effect`One Very Clear Eye`;
    }
  }
  if (auto_haveMonkeyPaw() && auto_monkeyPawWishesLeft() > 0) {
    let success: boolean = true;
    // if we unlocked the guild and have a meatcar, unlock Whitey's Grove so we can get bird rib / lion oil
    if (
      toInt(getProperty("lastGuildStoreOpen")) === myAscensions() &&
      itemAmount($item`bitchin' meatcar`) > 0
    ) {
      // start, then finish the meatcar quest
      if (internalQuestStatus("questG01Meatcar") < 1) {
        visitUrl("guild.php?place=paco");
      }
      if (internalQuestStatus("questG01Meatcar") < 1) {
        visitUrl("guild.php?place=paco");
      }
      // open Whitey's Grove
      if (internalQuestStatus("questG02Whitecastle") < 0) {
        visitUrl("guild.php?place=paco");
        runChoice(1);
      }
      for (const it of $items`lion oil, bird rib`) {
        if (itemAmount(it) > 0) {
          continue;
        }
        auto_makeMonkeyPawWish$1(it);
      }
    }
    while (auto_monkeyPawWishesLeft() > 0 && success) {
      success = auto_makeMonkeyPawWish(effect_to_wish);
    }
    if (!success) {
      print("Something went wrong using up monkey paw wishes.", "red");
    }
  }

  if (in_plumber() && fullness_left() > 0) {
    print(
      "Plumber consumption is complicated. Please manually consume stuff then run me again.",
      "red",
    );
    return false;
  }
  //There is a bug where Ed servant's can't be switched due to an issue in KoL itself
  //Per Discord, work around is to never log out with a level 7 or greater Scribe
  //Priest is always unlocked prior to Scribe. Just always attempt to switch to Priest at bedtime
  handleServant($servant`Priest`);

  function canChangeToStooper(): boolean {
    if (in_small() || in_wereprof()) {
      // In smol and wereprofessor, the stooper can be equipped, but does not modify the liver size
      return false;
    }
    if (
      haveFamiliar($familiar`Stooper`) &&
      pathAllowsChangingFamiliar() &&
      myFamiliar() !== $familiar`Stooper`
    ) {
      //do not use auto_ that returns false in 100run, which stooper drinking does not interrupt.
      //some paths forbid familiar or dont allow changing it but mafia still indicates you have the familiar
      return true;
    }
    return false;
  }

  let done: boolean =
    (myInebriety() > inebrietyLimit() && !canChangeToStooper()) ||
    myInebriety() > inebrietyLimit() + 1;
  if (in_gnoob() || !canDrink() || out_of_blood) {
    if (myAdventures() <= 2 || internalQuestStatus("questL13Final") >= 14) {
      done = true;
    }
  }
  if (in_robot()) {
    //robots eat energy not food nor booze.
    const chronolith_done: boolean =
      myRobotEnergy() < robot_chronolith_cost() || robot_chronolith_cost() > 47;
    done = chronolith_done && !auto_unreservedAdvRemaining();
  }
  // Meat Golems do not consume food or booze, adventure top-ups should be handled by the looped call to amw_buyAdv ~100 lines above.
  if (in_amw()) {
    done = true;
  }
  if (!done) {
    auto_log_info(
      "Goodnight done, please make sure to handle your overdrinking, then you can run me again.",
      "blue",
    );
    if (canChangeToStooper() && inebriety_left() === 0) {
      //stooper drinking is only useful when liver is exactly at max without a stooper equipped.
      auto_log_info("You have a Stooper, you can increase liver by 1!", "blue");
      useFamiliar($familiar`Stooper`);
    }
    if (
      auto_have_familiar($familiar`Machine Elf`) &&
      toInt(getProperty("_machineTunnelsAdv")) < 5
    ) {
      auto_log_info(
        `You have ${5 - toInt(getProperty("_machineTunnelsAdv"))} fights in The Deep Machine Tunnels that you should use!`,
        "blue",
      );
    }
    if (
      myInebriety() <= inebrietyLimit() &&
      myRain() >= 50 &&
      myAdventures() >= 1
    ) {
      auto_log_info(
        "You have a rain man to cast, please do so before overdrinking and then run me again.",
        "red",
      );
      return false;
    }
    auto_printNightcap();
    auto_log_warning(
      "You need to overdrink and then run me again. Beep.",
      "red",
    );
    if (haveSkill($skill`The Ode to Booze`)) {
      shrugAT$1($effect`Ode to Booze`);
      buffMaintain$4($effect`Ode to Booze`);
    }
    return false;
  } else {
    if (!inAftercore()) {
      const banish_str: string = getProperty(
        `auto_banishes_day${myDaycount()}`,
      );
      if (banish_str !== "") {
        auto_log_info$1(banish_str);
      }
      const yellowRay_str: string = getProperty(
        `auto_yellowRay_day${myDaycount()}`,
      );
      if (yellowRay_str !== "") {
        auto_log_info$1(yellowRay_str);
      }
      if (
        !toBoolean(getProperty("_photocopyUsed")) &&
        isUnrestricted($item`deluxe fax machine`) &&
        myAdventures() > 0 &&
        !(is_boris() || is_jarlsberg() || is_pete()) &&
        itemAmount($item`Clan VIP Lounge key`) > 0
      ) {
        auto_log_info(
          "You may have a fax that you can use. Check it out!",
          "blue",
        );
      }
    }

    bedtime_still(); //quickly use up all remaining uses of Nash Crosby's Still during bedtime

    if (
      getWorkshed() === $item`spinning wheel` &&
      isUnrestricted($item`spinning wheel`) &&
      !toBoolean(getProperty("_spinningWheel"))
    ) {
      auto_log_info("Using the spinning wheel in your workshed", "blue");
      visitUrl("campground.php?action=spinningwheel");
    }

    bedtime_spleen();
    // spleen use may have equipped +stat gain items
    equipRollover(true);

    bedtime_pulls();
    pullsNeeded("evaluate");

    acquireMilkOfMagnesiumIfUnused(true);
    consumeMilkOfMagnesiumIfUnused();
    auto_scepterRollover();

    if (
      haveSkill($skill`Calculate the Universe`) &&
      auto_is_valid$2($skill`Calculate the Universe`) &&
      toInt(getProperty("_universeCalculated")) <
        min(3, toInt(getProperty("skillLevel144")))
    ) {
      auto_log_info("You can still Calculate the Universe!", "blue");
    }

    const deck: Item = wrap_item($item`Deck of Every Card`);
    if (
      isUnrestricted(deck) &&
      itemAmount(deck) > 0 &&
      toInt(getProperty("_deckCardsDrawn")) < 15 &&
      auto_is_valid(deck)
    ) {
      auto_log_info(
        `You have a Deck of Every Card and ${15 - toInt(getProperty("_deckCardsDrawn"))} draws remaining!`,
        "blue",
      );
    }

    if (
      isUnrestricted($item`Time-Spinner`) &&
      itemAmount($item`Time-Spinner`) > 0 &&
      toInt(getProperty("_timeSpinnerMinutesUsed")) < 10 &&
      auto_is_valid($item`Time-Spinner`)
    ) {
      auto_log_info(
        `You have ${10 - toInt(getProperty("_timeSpinnerMinutesUsed"))} minutes left to Time-Spinner!`,
        "blue",
      );
    }

    if (
      isUnrestricted(wrap_item($item`Chateau Mantegna room key`)) &&
      !toBoolean(getProperty("_chateauMonsterFought")) &&
      toBoolean(getProperty("chateauAvailable"))
    ) {
      auto_log_info(
        "You can still fight a Chateau Mangtegna Painting today.",
        "blue",
      );
    }

    if (
      !toBoolean(getProperty("_streamsCrossed")) &&
      possessEquipment($item`protonic accelerator pack`) &&
      auto_is_valid$3($effect`Total Protonic Reversal`)
    ) {
      cliExecute("crossstreams");
    }

    if (
      isUnrestricted($item`shrine to the Barrel god`) &&
      !toBoolean(getProperty("_barrelPrayer")) &&
      toBoolean(getProperty("barrelShrineUnlocked"))
    ) {
      auto_log_info("You can still worship the barrel god today.", "blue");
    }
    if (
      isUnrestricted($item`airplane charter: Dinseylandfill`) &&
      !toBoolean(getProperty("_dinseyGarbageDisposed")) &&
      elementalPlanes_access($element`stench`)
    ) {
      if (itemAmount($item`bag of park garbage`) > 0 || pullsRemaining() > 0) {
        auto_log_info(
          "You can still dispose of Garbage in Dinseyland.",
          "blue",
        );
      }
    }
    if (
      isUnrestricted($item`airplane charter: That 70s Volcano`) &&
      !toBoolean(getProperty("_infernoDiscoVisited")) &&
      elementalPlanes_access($element`hot`)
    ) {
      if (
        itemAmount($item`smooth velvet hat`) > 0 ||
        itemAmount($item`smooth velvet shirt`) > 0 ||
        itemAmount($item`smooth velvet pants`) > 0 ||
        itemAmount($item`smooth velvet hanky`) > 0 ||
        itemAmount($item`smooth velvet pocket square`) > 0 ||
        itemAmount($item`smooth velvet socks`) > 0
      ) {
        auto_log_info(
          "You can still disco inferno at the Inferno Disco.",
          "blue",
        );
      }
    }
    if (
      isUnrestricted($item`potted tea tree`) &&
      !toBoolean(getProperty("_pottedTeaTreeUsed")) &&
      auto_get_campground().has($item`potted tea tree`)
    ) {
      auto_log_info("You have a tea tree to shake!", "blue");
    }

    if (auto_haveAugustScepter() && toInt(getProperty("_augSkillsCast")) < 5) {
      auto_log_info(
        `You still have ${5 - toInt(getProperty("_augSkillsCast"))} August Scepter casts remaining! Perhaps consider casting Aug 13th/30th for more rollover adventures, and/or 7th for a buff for tomorrow?`,
        "blue",
      );
    }

    meatReserveMessage();

    if (getProperty("spadingData") !== "") {
      cliExecute("spade autoconfirm");
    }

    auto_log_info("You are probably done for today, beep.", "blue");
    return true;
  }
}
