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
  Skill,
  Slot,
  spleenLimit,
  splitString,
  stillsAvailable,
  storageAmount,
  stringModifier,
  toFloat,
  toInt,
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
  $modifier,
  $monster,
  $path,
  $servant,
  $skill,
  $slot,
  $slots,
  $stat,
  get,
  set,
} from "libram";

import { auto_unreservedAdvRemaining, dailyEvents } from "../autoscend";
import {
  acquireHermitItem,
  auto_buyUpTo,
  canPull,
  pullXWhenHaveY,
} from "./auto_acquire";
import { buffMaintain$2 } from "./auto_buff";
import {
  acquireMilkOfMagnesiumIfUnused,
  auto_canChew,
  auto_drinkNightcap,
  auto_printNightcap,
  autoChew,
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
  possessOutfit,
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
  auto_freeCrafts,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$3,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  autoCraft,
  canYellowRay,
  cloversAvailable,
  handleSealAncient,
  handleSealNormal,
  internalQuestStatus,
  isArmoryAvailable,
  isGeneralStoreAvailable,
  isHermitAvailable,
  meatReserve,
  meatReserveMessage,
  preferredLibram,
  safeGet,
  shrugAT,
  wrap_item,
} from "./auto_util";
import { auto_process_kmail } from "./auto_zlib";
import { dna_bedtime } from "./iotms/2010/mr2014";
import {
  auto_haveSourceTerminal,
  auto_haveWitchess,
  auto_sourceTerminalEnhance,
  auto_sourceTerminalEnhanceLeft,
  auto_sourceTerminalExtrude,
} from "./iotms/2010/mr2016";
import {
  canGenieCombat,
  getSpaceJelly,
  kgbWasteClicks,
  loveTunnelAcquire,
  makeGeniePocket,
  spacegateVaccine,
} from "./iotms/2010/mr2017";
import { januaryToteAcquire } from "./iotms/2010/mr2018";
import { auto_beachUseFreeCombs } from "./iotms/2010/mr2019";
import { auto_burnPowerfulGloveCharges } from "./iotms/2020/mr2020";
import {
  auto_haveAugustScepter,
  auto_haveMonkeyPaw,
  auto_makeMonkeyPawWish,
  auto_makeMonkeyPawWish$1,
  auto_monkeyPawWishesLeft,
  auto_scepterRollover,
} from "./iotms/2020/mr2023";
import { auto_setLeprecondo } from "./iotms/2020/mr2025";
import {
  auto_burnRemainingSpadeDigs,
  auto_chewLiquidAsset,
} from "./iotms/2020/mr2026";
import {
  doHottub,
  hotTubSoaksRemaining,
  zataraSeaside,
} from "./iotms/other/clan";
import {
  elementalPlanes_access,
  elementalPlanes_takeJob,
} from "./iotms/other/elementalPlanes";
import { is_boris } from "./paths/2012/avatar_of_boris";
import { is_jarlsberg } from "./paths/2013/avatar_of_jarlsberg";
import { is_pete } from "./paths/2014/avatar_of_sneaky_pete";
import { heavyrains_doBedtime, in_heavyrains } from "./paths/2014/heavy_rains";
import {
  ed_doResting,
  ed_terminateSession,
  handleServant,
  isActuallyEd,
} from "./paths/2015/actually_ed_the_undying";
import { in_nuclear } from "./paths/2016/nuclear_autumn";
import { in_gnoob } from "./paths/2017/gelatinous_noob";
import { in_glover } from "./paths/2018/g_lover";
import { in_pokefam } from "./paths/2018/pocket_familiars";
import { bat_terminateSession, in_darkGyffte } from "./paths/2019/dark_gyffte";
import { in_koe } from "./paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "./paths/2019/two_crazy_random_summer";
import { in_plumber } from "./paths/2020/path_of_the_plumber";
import { in_robot, robot_chronolith_cost } from "./paths/2021/you_robot";
import { in_lol } from "./paths/2023/legacy_of_loathing";
import { in_small } from "./paths/2023/small";
import { in_avantGuard } from "./paths/2024/avant_guard";
import { in_wereprof, is_werewolf } from "./paths/2024/wereprofessor";
import { amw_buyAdv, in_amw } from "./paths/2026/adventurer_meats_world";
import { inAftercore } from "./paths/casual";
import { L11_hiddenCityZonesCanUseMachete } from "./quests/level_11";
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
    let target: Item = $item.none;
    //first try to get at least 1 each of each of the imrpoved booze if possible
    for (const it of $items`bottle of Calcutta Emerald, bottle of Lieutenant Freeman, bottle of Jorge Sinsonte, bottle of Definit, bottle of Domesticated Turkey, boxed champagne`) {
      if (
        target === $item.none &&
        itemAmount(it) === 0 &&
        itemAmount(still_targetToOrigin(it)) > 0
      ) {
        target = it;
      }
    }
    //tonic water is an excellent MP restorer and also can be used to craft some drinks.
    if (
      target === $item.none &&
      myMeat() > meatReserve() + 100 &&
      isGeneralStoreAvailable()
    ) {
      if (auto_buyUpTo(1, $item`soda water`)) {
        target = $item`tonic water`;
      }
    }
    //if we can not afford tonic water use it on the improved item we have the least of.
    if (target === $item.none) {
      //below we will replace target with a better target. only do so if we reached this spot without a target
      //all possible still items except [tonic water] and [bottle of Ooze-O]
      for (const it of $items`bottle of Calcutta Emerald, bottle of Lieutenant Freeman, bottle of Jorge Sinsonte, bottle of Definit, bottle of Domesticated Turkey, boxed champagne, bottle of Pete's Sake, tangerine, kiwi, cocktail onion, kumquat, raspberry`) {
        if (target === $item.none && itemAmount(still_targetToOrigin(it)) > 0) {
          //do not have a target yet
          target = it;
        }
        if (
          target !== $item.none &&
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
    if (target !== $item.none) {
      if (!distill(target)) {
        //try to distill target. do something if it fails
        auto_log_warning(
          `bedtime_still() failed to distill [${target}] in Nash Crosby's Still and is giving up to avoid infinite loop`,
        );
        break;
      }
    } else {
      //avoid infinite loop if we did not find any valid targets to distill
      auto_log_warning(
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
        auto_canChew(it) &&
        availableAmount(it) > 0 &&
        it.spleen <= spleen_left()
      ) {
        autoChew(1, it);
        consumed_this_loop = true;
        break;
      }
    }
    if (!consumed_this_loop) {
      consumed_this_loop = auto_chewLiquidAsset(true);
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
        crowd3score = toInt(numericModifier($modifier`Cold Damage`) / 9);
        break;
      case $element`hot`:
        crowd3score = toInt(numericModifier($modifier`Hot Damage`) / 9);
        break;
      case $element`sleaze`:
        crowd3score = toInt(numericModifier($modifier`Sleaze Damage`) / 9);
        break;
      case $element`spooky`:
        crowd3score = toInt(numericModifier($modifier`Spooky Damage`) / 9);
        break;
      case $element`stench`:
        crowd3score = toInt(numericModifier($modifier`Stench Damage`) / 9);
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
      auto_log_warning(
        "Need a skeleton key or the ingredients (skeleton bone, loose teeth) for it.",
      );
    }
  }

  if (progress < 4) {
    adv = adv + 6;
    if (
      get("auto_wandOfNagamar", false) &&
      itemAmount($item`Wand of Nagamar`) === 0 &&
      cloversAvailable() === 0
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
  if (it === $item.none) {
    return 0.0;
  }
  let retval: number = numericModifier(it, "adventures");
  if (hippyStoneBroken() && myPath() !== $path`Oxygenarian`) {
    retval +=
      get("auto_bedtime_pulls_pvp_multi") * numericModifier(it, "PvP Fights");
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

function bedtime_pulls_rollover_equip(
  desirability_1: number = toFloat(get("auto_bedtime_pulls_min_desirability")),
): void {
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
    let best1hweapon: Item = $item.none;
    let very_best: Item = $item.none;
    let very_best_val: number = 0;
    let very_best_slot: Slot = $slot.none;
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
          if (equippedAmount(it) > 0 && (best.get(sl) ?? $item.none) !== it) {
            //we have it equipped but not in the worst slot. So exclude it from optimizing the worst slot.
            continue;
          }
        }

        if (is_watch(it)) {
          //watches conflict with each other. only one watch of any kind can be used
          if (equippedAmount(it) > 0 && !is_watch(best.get(sl) ?? $item.none)) {
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
          (best.get(sl) ?? $item.none) !== it &&
          !canPull(it, true)
        ) {
          continue;
        }

        if (rollover_value(it) > rollover_value(best.get(sl) ?? $item.none)) {
          best.set(sl, it);
        }
      } else if ($slot`weapon` === sl) {
        //weapon and off-hand slots might conflict and require special handling
        //two or more handed weapons just need to make sure they are better than best weapon and off-hand combined
        if (weaponHands(it) > 1) {
          if (weaponHands(best.get($slot`weapon`) ?? $item.none) > 1) {
            //if best weapon is already more than 1 handed, must not add off-hand to that weapon
            if (
              rollover_value(it) >
                rollover_value(best.get($slot`weapon`) ?? $item.none) &&
              rollover_value(it) >
                rollover_value(best.get($slot`off-hand`) ?? $item.none)
            ) {
              best.set(sl, it);
            }
          } else if (
            rollover_value(it) >
            rollover_value(best.get($slot`weapon`) ?? $item.none) +
              rollover_value(best.get($slot`off-hand`) ?? $item.none)
          ) {
            //for non conflicting slots. calculate normally
            //remember best 1h to compare again when better off-hand slots are found
            best1hweapon = best.get($slot`weapon`) ?? $item.none;
            //there is no need to change offhand target since we pull one item at a time. in fact we prefer offhand to retain an independent value
            best.set(sl, it);
          }
        } else if (weaponHands(it) === 1) {
          //single handed weapons for the weapon slot
          if (weaponHands(best.get(sl) ?? $item.none) > 1) {
            //the currently desired best weapon is 2 handed weapon. so we sum it value with best off-hand found thus far
            if (
              rollover_value(it) +
                rollover_value(best.get($slot`off-hand`) ?? $item.none) >
              rollover_value(best.get(sl) ?? $item.none)
            ) {
              best.set(sl, it);
            }
          } else if (
            rollover_value(it) > rollover_value(best.get(sl) ?? $item.none)
          ) {
            //the currently desired best weapon is 1 handed. So we just compare it to best weapon.
            best.set(sl, it);
            best1hweapon = best.get($slot`weapon`) ?? $item.none;
          } else if (rollover_value(it) > rollover_value(best1hweapon)) {
            //keep best1hweapon updated even if not best weapon
            best1hweapon = best.get($slot`weapon`) ?? $item.none;
          }
          //single handed weapons for the off-hand slot
          const weapon_offhand: boolean = haveSkill(
            $skill`Double-Fisted Skull Smashing`,
          );
          const conflict_mainhand: boolean =
            booleanModifier(it, "Single Equip") &&
            (best.get(sl) ?? $item.none) === it;
          const conflict_quantity: boolean =
            (best.get(sl) ?? $item.none) === it &&
            !canPull(it, true) &&
            itemAmount(it) + equippedAmount(it) < 2;
          if (weapon_offhand && !conflict_mainhand && !conflict_quantity) {
            if (
              rollover_value(it) >
              rollover_value(best.get($slot`off-hand`) ?? $item.none)
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
        rollover_value(it) > rollover_value(best.get(sl) ?? $item.none)
      ) {
        //for non conflicting slots. calculate normally.
        //off-hand might conflict but are resolved at the weapon slot in a way that still requires us to find the best offhand
        best.set(sl, it);
        //best off-hand slot can make best remembered 1h weapon better than current best 2h weapon
        if (
          $slot`off-hand` === sl &&
          weaponHands(best.get($slot`weapon`) ?? $item.none) > 1
        ) {
          if (
            rollover_value(it) + rollover_value(best1hweapon) >
            rollover_value(best.get($slot`weapon`) ?? $item.none)
          ) {
            best.set($slot`weapon`, best1hweapon);
          }
        }
      }
    }
    //time halo is special. cannot have any weapons or off-hand items equipped
    if (
      rollover_value($item`time halo`) >
      rollover_value(best.get(worst_acc_slot) ?? $item.none) +
        rollover_value(best.get($slot`weapon`) ?? $item.none) +
        rollover_value(best.get($slot`off-hand`) ?? $item.none)
    ) {
      if (
        (possessEquipment($item`time halo`) ||
          canPull($item`time halo`, true)) &&
        auto_can_equip($item`time halo`)
      ) {
        best.set(worst_acc_slot, $item`time halo`);
        //clearing weapon and off-hand here at least avoids pulling them after a time halo in the same rollover.
        //should technically decide based on improvement value instead, but if the best of 3 slots together are beaten by 5 their improvement value would be low
        best.set($slot`weapon`, $item.none);
        best.set($slot`off-hand`, $item.none);
      }
    }
    //find the very best item
    const extra_debug: boolean = get("_auto_extra_debug_bedtime_pulls", false);
    for (let sl of $slots`hat, weapon, off-hand, back, shirt, pants, acc1, familiar`) {
      if (sl === $slot`acc1`) {
        sl = worst_acc_slot;
      }

      if (extra_debug) {
        //prints out all the items we want. Too messy for normal runs even in debug mode.
        auto_log_debug(
          `[${sl}] wanted [${best.get(sl) ?? $item.none}] val = ${rollover_value(best.get(sl) ?? $item.none)}. currently [${equippedItem(sl)}] val = ${rollover_value(equippedItem(sl))}. improvement = ${rollover_improvement(best.get(sl) ?? $item.none, sl)}`,
        );
      }
      //if we already pulled the best item for a slot but maximizer failed to equip our best item into it for some reason then we want to exclude that slot from further attempts.
      const maximizer_fail: boolean =
        possessEquipment(best.get(sl) ?? $item.none) &&
        equippedItem(sl) !== (best.get(sl) ?? $item.none);
      if (maximizer_fail) {
        auto_log_debug(
          `Bedtime pulls: maximizer is not equipping [${best.get(sl) ?? $item.none}] into [${sl}] for some reason. Skipping this slot`,
        );
      } else if (
        rollover_improvement(best.get(sl) ?? $item.none, sl) > very_best_val
      ) {
        very_best = best.get(sl) ?? $item.none;
        very_best_val = rollover_improvement(best.get(sl) ?? $item.none, sl);
        very_best_slot = sl;
      }
    }

    const very_best_improvement: number = rollover_improvement(
      very_best,
      very_best_slot,
    );
    if (very_best_improvement < desirability_1) {
      break;
    }
    auto_log_info(
      `Pulling [${very_best}] which improves desireability score by ${very_best_improvement}`,
    );
    if (extra_debug) {
      break;
    }
    pullXWhenHaveY(very_best, 1, 0);
    equipRollover(true);
  }
}

function bedtime_pulls(): void {
  if (pullsRemaining() < 1) {
    //out of pulls or in hardcore or in casual.
    return;
  }
  if (get("auto_bedtime_pulls_skip", false)) {
    return;
  }

  if (myDaycount() === 1 && myLevel() <= 8) {
    //this run looks like it will take a couple more days, give priority to good rollover equipment before other pulls
    const desirability_1: number = max(
      5.0,
      get("auto_bedtime_pulls_min_desirability"),
    );
    bedtime_pulls_rollover_equip(desirability_1);
  }

  if (get("auto_bedtime_pulls_min_desirability") <= 5.0 && !in_lol()) {
    if (storageAmount($item`potato alarm clock`) > 0) {
      pullXWhenHaveY($item`potato alarm clock`, 1, 0);
    }
  }

  if (
    itemAmount($item`muculent machete`) === 0 &&
    L11_hiddenCityZonesCanUseMachete()
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
    const gnasirProgress: number = get("gnasirProgress");
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

  if (get("lastEncounter") === "Like a Bat Into Hell") {
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
    let oldSeals: number = get("_sealsSummoned");
    while (get("_sealsSummoned") < 5 && !inAftercore() && myMeat() > 4500) {
      let summoned: boolean;
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
      const newSeals: number = get("_sealsSummoned");
      if (newSeals === oldSeals && summoned) {
        abort("Unable to summon seals.");
      }
      oldSeals = newSeals;
    }
  }

  if (get("auto_priorCharpaneMode", 0) === 1) {
    auto_log_info("Resuming Compact Character Mode.");
    set("auto_priorCharpaneMode", 0);
    visitUrl(
      "account.php?am=1&pwd=&action=flag_compactchar&value=1&ajax=0",
      true,
    );
  }

  if (itemAmount($item`License to Chill`) > 0 && !get("_licenseToChillUsed")) {
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
        auto_log_info(`Copies left: ${5 - get("_raindohCopiesMade")}`, "olive");
      }
      if (!inHardcore()) {
        auto_log_info(`Pulls remaining: ${pullsRemaining()}`, "olive");
      }
      if (
        !possessOutfit("frat warrior fatigues") &&
        !get("auto_hippyInstead", false)
      ) {
        auto_log_info(
          "Please consider an orcish frat boy spy (You want Frat Warrior Fatigues).",
          "blue",
        );
        if (canYellowRay()) {
          auto_log_info("Make sure to Ball Lightning the spy!!", "red");
        }
      } else if (
        !possessOutfit("War Hippy Fatigues") &&
        get("auto_hippyInstead", false)
      ) {
        auto_log_info(
          "Please consider a Bailey's Beetle (You want War Hippy Fatigues).",
          "blue",
        );
        if (canYellowRay()) {
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
      get("_machineTunnelsAdv") < 5 &&
      inebriety_left() >= 0 &&
      myAdventures() > 0
    ) {
      auto_log_info(
        `You have ${5 - get("_machineTunnelsAdv")} fights in The Deep Machine Tunnels that you should use!`,
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
  loveTunnelAcquire(true, $stat.none, true, 3, true, 1);

  const bottle: Item = wrap_item($item`genie bottle`);
  if (itemAmount(bottle) > 0 && auto_is_valid(bottle)) {
    //we are in bedtime so any wishes we planned to use today were already used. thus even if we can not use pocket wishes in this path we should still make them to avoid waste
    for (let i: number = get("_genieWishesUsed"); i < 3; i++) {
      makeGeniePocket();
    }
  }
  if (
    canGenieCombat($monster`Orcish Frat Boy Spy`) &&
    !possessOutfit("frat warrior fatigues")
  ) {
    auto_log_info(
      "Please consider genie wishing for an orcish frat boy spy (You want Frat Warrior Fatigues).",
      "blue",
    );
  }

  if (
    itemAmount($item`infinite BACON machine`) > 0 &&
    !get("_internetViralVideoBought") &&
    !canInteract()
  ) {
    const hasDisintegrate: boolean =
      auto_have_skill($skill`Disintegrate`) &&
      myMaxmp() >= 1.5 * mpCost($skill`Disintegrate`); //will be limited by current mp, try to gauge if it will be available
    const notNeeded: boolean =
      haveEffect($effect`Everything Looks Yellow`) > 0 ||
      hasDisintegrate ||
      canYellowRay(); //have a common unlimited source of YR, no need to make viral video
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

  if (friarsAvailable() && !get("friarsBlessingReceived")) {
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
    !get("_mayoTankSoaked") &&
    auto_get_campground().has($item`portable Mayo Clinic`) &&
    isUnrestricted($item`portable Mayo Clinic`)
  ) {
    visitUrl("shop.php?action=bacta&whichshop=mayoclinic");
  }

  if (
    in_nuclear() &&
    get("falloutShelterLevel") >= 3 &&
    !get("_falloutShelterSpaUsed")
  ) {
    visitUrl("place.php?whichplace=falloutshelter&action=vault3");
  }
  //	Also use "nunsVisits", as long as they were won by the Frat (sidequestNunsCompleted="fratboy").
  ed_doResting();
  const libram: Skill = preferredLibram();
  if (libram !== $skill.none) {
    while (haveFreeRestAvailable() && mpCost(libram) <= myMaxmp()) {
      doFreeRest();
      while (myMp() > mpCost(libram)) {
        useSkill(1, libram);
      }
    }
  }

  if (
    isUnrestricted($item`Clan pool table`) &&
    get("_poolGames") < 3 &&
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
    !get("_ballpit") &&
    getClanId() !== -1
  ) {
    cliExecute("ballpit");
  }
  if (
    get("telescopeUpgrades") > 0 &&
    internalQuestStatus("questL13Final") < 0
  ) {
    if (!get("telescopeLookedHigh") && auto_is_valid$3($effect`Starry-Eyed`)) {
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
    (possessEquipment($item`Thor's Pliers`) || auto_freeCrafts() > 0) &&
    !possessEquipment($item`chrome sword`) &&
    auto_is_valid($item`chrome sword`) &&
    !inAftercore() &&
    !in_tcrs()
  ) {
    const oreGoal: Item = safeGet("trapperOre");
    let need: number = 1;
    const haveAdvSmithing: boolean = haveSkill(
      $skill`Super-Advanced Meatsmithing`,
    );
    if (oreGoal === $item`chrome ore`) {
      need = 4;
    }
    if (!haveAdvSmithing) {
      auto_log_info(
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
      auto_log_info("Did not make chrome sword");
    }
  }

  heavyrains_doBedtime();

  while (
    myDaycount() === 1 &&
    auto_is_valid($item`resolution: be more adventurous`) &&
    itemAmount($item`resolution: be more adventurous`) > 0 &&
    get("_resolutionAdv") < 10 &&
    !canInteract()
  ) {
    use(1, $item`resolution: be more adventurous`);
  }
  // If in TCRS skip using freecrafts but alert user of how many they can manually use.
  if (in_tcrs() && auto_freeCrafts() > 0) {
    auto_log_warning(
      "In TCRS: Items are variable, skipping End Of Day crafting",
      "red",
    );
    auto_log_warning(
      `Consider manually using your ${auto_freeCrafts()} free crafts`,
      "red",
    );
  } else if (myDaycount() <= 2 && auto_freeCrafts() > 0 && myAdventures() > 0) {
    // Check for rapid prototyping
    while (
      auto_freeCrafts() > 0 &&
      itemAmount($item`scrumptious reagent`) > 0 &&
      itemAmount($item`cranberries`) > 0 &&
      itemAmount($item`cranberry cordial`) < 2 &&
      haveSkill($skill`Advanced Saucecrafting`)
    ) {
      cliExecute(`make ${$item`cranberry cordial`}`);
    }
    putCloset(itemAmount($item`cranberries`), $item`cranberries`);
    while (
      auto_freeCrafts() > 0 &&
      itemAmount($item`scrumptious reagent`) > 0 &&
      itemAmount($item`glass of goat's milk`) > 0 &&
      itemAmount($item`milk of magnesium`) < 2 &&
      haveSkill($skill`Advanced Saucecrafting`)
    ) {
      cliExecute(`make ${$item`milk of magnesium`}`);
    }
  }

  dna_bedtime();

  if (!get("_grimBuff") && auto_have_familiar($familiar`Grim Brother`)) {
    visitUrl("choice.php?pwd=&whichchoice=835&option=1", true);
  }

  dailyEvents();
  if (get("auto_clanstuff", 0) < myDaycount() && getClanId() !== -1) {
    if (
      get("_klawSummons") === 0 &&
      'Mr. Klaw "Skill" Crane Game' in getClanRumpus()
    ) {
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
      cliExecute("clan_rumpus.php?action=click&spot=3&furni=3");
    }
    if (itemAmount($item`Clan VIP Lounge key`) > 0) {
      if (
        isUnrestricted($item`Olympic-sized Clan crate`) &&
        !get("_olympicSwimmingPool")
      ) {
        cliExecute("swim noncombat");
      }
      if (
        isUnrestricted($item`Olympic-sized Clan crate`) &&
        !get("_olympicSwimmingPoolItemFound")
      ) {
        cliExecute("swim item");
      }
      if (isUnrestricted($item`Clan looking glass`) && !get("_lookingGlass")) {
        visitUrl("clan_viplounge.php?action=lookingglass");
      }
      if (get("_deluxeKlawSummons") === 0) {
        cliExecute("clan_viplounge.php?action=klaw");
        cliExecute("clan_viplounge.php?action=klaw");
        cliExecute("clan_viplounge.php?action=klaw");
      }
      if (!get("_aprilShower")) {
        if (inAftercore()) {
          cliExecute("shower ice");
        } else if (in_glover()) {
          cliExecute("shower mp"); // can't use the effects or the ice
        } else {
          cliExecute(`shower ${myPrimestat()}`);
        }
      }
      if (isUnrestricted($item`Crimbough`) && !get("_crimboTree")) {
        cliExecute("crimbotree get");
      }
    }
    set("auto_clanstuff", myDaycount());
  }

  if (
    get("sidequestOrchardCompleted") !== "none" &&
    !get("_hippyMeatCollected")
  ) {
    visitUrl("shop.php?whichshop=hippy");
  }

  if (get("sidequestArenaCompleted") !== "none" && !get("concertVisited")) {
    cliExecute("concert 2");
  }
  if (inAftercore()) {
    if (itemAmount($item`The Legendary Beat`) > 0 && !get("_legendaryBeat")) {
      use(1, $item`The Legendary Beat`);
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      get("_clipartSummons") === 0
    ) {
      cliExecute("make unbearable light");
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      get("_clipartSummons") === 1
    ) {
      cliExecute("make cold-filtered water");
    }
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      get("_clipartSummons") === 2
    ) {
      cliExecute("make bucket of wine");
    }
    if (
      itemAmount($item`handmade hobby horse`) > 0 &&
      !get("_hobbyHorseUsed")
    ) {
      use(1, $item`handmade hobby horse`);
    }
    if (itemAmount($item`ball-in-a-cup`) > 0 && !get("_ballInACupUsed")) {
      use(1, $item`ball-in-a-cup`);
    }
    if (itemAmount($item`set of jacks`) > 0 && !get("_setOfJacksUsed")) {
      use(1, $item`set of jacks`);
    }
  }

  if (myDaycount() - 5 >= get("lastAnticheeseDay")) {
    visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse");
  }

  if (
    auto_haveWitchess() &&
    get("puzzleChampBonus") === 20 &&
    !get("_witchessBuff")
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
    if (!inAftercore() && get("auto_extrudeChoice") !== "none") {
      let count_1: number = 3 - get("_sourceTerminalExtrudes");

      const extrudeChoice: Map<number, string> = new Map();
      if (get("auto_extrudeChoice") !== "") {
        const extrudeDays: Map<number, string> = new Map(
          splitString(get("auto_extrudeChoice"), ":").map((_v, _i) => [_i, _v]),
        );
        const tempChoice: Map<number, string> = new Map(
          splitString(
            String(
              extrudeDays.get(min(extrudeDays.size, myDaycount()) - 1) ?? "",
            ).trim(),
            ";",
          ).map((_v, _i) => [_i, _v]),
        );
        for (let i: number = 0; i < tempChoice.size; i++) {
          extrudeChoice.set(i, tempChoice.get(i) ?? "");
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
        auto_sourceTerminalExtrude(extrudeChoice.get(3 - count_1) ?? "");
        count_1 -= 1;
      }
    }
    const extrudeLeft: number = 3 - get("_sourceTerminalExtrudes");
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
    auto_log_info(`Copies left: ${5 - get("_raindohCopiesMade")}`, "olive");
  }
  if (!inHardcore()) {
    auto_log_info(`Pulls remaining: ${pullsRemaining()}`, "olive");
  }

  if (haveSkill($skill`Inigo's Incantation of Inspiration`)) {
    const craftingLeft: number = 5 - get("_inigosCasts");
    auto_log_info(`Free Inigo's craftings left: ${craftingLeft}`, "blue");
  }
  if (itemAmount($item`Loathing Legion jackhammer`) > 0) {
    const craftingLeft: number = 3 - get("_legionJackhammerCrafting");
    auto_log_info(
      `Free Loathing Legion Jackhammer craftings left: ${craftingLeft}`,
      "blue",
    );
  }
  if (itemAmount($item`Thor's Pliers`) > 0) {
    const craftingLeft: number = 10 - get("_thorsPliersCrafting");
    auto_log_info(`Free Thor's Pliers craftings left: ${craftingLeft}`, "blue");
  }
  if (auto_freeCrafts() > 0) {
    auto_log_info(`Free craftings left: ${auto_freeCrafts()}`, "blue");
  }
  if (get("timesRested") < totalFreeRests()) {
    auto_log_info(
      `You have ${totalFreeRests() - get("timesRested")} free rests remaining.`,
      "blue",
    );
  }
  if (
    possessEquipment($item`Kremlin's Greatest Briefcase`) &&
    get("_kgbClicksUsed") < 24
  ) {
    kgbWasteClicks();
    const clicks: number = 22 - get("_kgbClicksUsed");
    if (clicks > 0) {
      auto_log_info(`You have some KGB clicks (${clicks}) left!`, "green");
    }
  }
  if (get("sidequestNunsCompleted") === "fratboy" && get("nunsVisits") < 3) {
    auto_log_info(
      `You have ${3 - get("nunsVisits")} nuns visits left.`,
      "blue",
    );
  }
  if (get("libramSummons") > 0) {
    auto_log_info(`Total Libram Summons: ${get("libramSummons")}`, "blue");
  }

  let smiles: number =
    5 *
      (itemAmount($item`Golden Mr. Accessory`) +
        storageAmount($item`Golden Mr. Accessory`) +
        closetAmount($item`Golden Mr. Accessory`)) -
    get("_smilesOfMrA");
  if (in_glover()) {
    smiles = 0;
  }
  if (smiles > 0) {
    if (get("auto_smileAt") !== "") {
      cliExecute(`/cast ${smiles} the smile @ ${get("auto_smileAt")}`);
    } else {
      auto_log_info(`You have ${smiles} smiles of Mr. A remaining.`, "blue");
    }
  }

  if (
    itemAmount($item`CSA fire-starting kit`) > 0 &&
    !get("_fireStartingKitUsed")
  ) {
    auto_log_info("Still have a CSA Fire-Starting Kit you can use!", "blue");
  }
  if (
    itemAmount($item`Glenn's golden dice`) > 0 &&
    !get("_glennGoldenDiceUsed")
  ) {
    auto_log_info(
      "Still have some of Glenn's Golden Dice that you can use!",
      "blue",
    );
  }
  if (itemAmount($item`License to Chill`) > 0 && !get("_licenseToChillUsed")) {
    auto_log_info("You are still licensed enough to be able to chill.", "blue");
  }

  if (
    itemAmount($item`School of Hard Knocks Diploma`) > 0 &&
    !get("_hardKnocksDiplomaUsed")
  ) {
    use(1, $item`School of Hard Knocks Diploma`);
  }

  if (!get("_lyleFavored") && auto_is_valid$3($effect`Favored by Lyle`)) {
    visitUrl("place.php?whichplace=monorail&action=monorail_lyle");
  }

  if (
    get("spookyAirportAlways") &&
    !isActuallyEd() &&
    !get("_controlPanelUsed")
  ) {
    visitUrl(
      "place.php?whichplace=airport_spooky_bunker&action=si_controlpanel",
    );
    visitUrl("choice.php?pwd=&whichchoice=986&option=8", true);
    if (get("controlPanelOmega") >= 99) {
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
  if (get("auto_MLSafetyLimit") !== "" || in_wereprof()) {
    // Professor hates ML
    if (toInt(get("auto_MLSafetyLimit")) < 25 || in_wereprof()) {
      // We're adding +25 ML that won't be shrugged. Professor hates ML
      effect_to_wish = $effect`One Very Clear Eye`;
    }
  }
  if (auto_haveMonkeyPaw() && auto_monkeyPawWishesLeft() > 0) {
    let success: boolean = true;
    // if we unlocked the guild and have a meatcar, unlock Whitey's Grove so we can get bird rib / lion oil
    if (
      get("lastGuildStoreOpen") === myAscensions() &&
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
        auto_runChoice(1);
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
      get("_machineTunnelsAdv") < 5
    ) {
      auto_log_info(
        `You have ${5 - get("_machineTunnelsAdv")} fights in The Deep Machine Tunnels that you should use!`,
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
      shrugAT($effect`Ode to Booze`);
      buffMaintain$2($effect`Ode to Booze`);
    }
    return false;
  } else {
    if (!inAftercore()) {
      const banish_str: string = getProperty(
        `auto_banishes_day${myDaycount()}`,
      );
      if (banish_str !== "") {
        auto_log_info(banish_str);
      }
      const yellowRay_str: string = getProperty(
        `auto_yellowRay_day${myDaycount()}`,
      );
      if (yellowRay_str !== "") {
        auto_log_info(yellowRay_str);
      }
      if (
        !get("_photocopyUsed") &&
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
      !get("_spinningWheel")
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
    auto_setLeprecondo(true);

    if (
      haveSkill($skill`Calculate the Universe`) &&
      auto_is_valid$2($skill`Calculate the Universe`) &&
      get("_universeCalculated") < min(3, get("skillLevel144"))
    ) {
      auto_log_info("You can still Calculate the Universe!", "blue");
    }

    const deck: Item = wrap_item($item`Deck of Every Card`);
    if (
      isUnrestricted(deck) &&
      itemAmount(deck) > 0 &&
      get("_deckCardsDrawn") < 15 &&
      auto_is_valid(deck)
    ) {
      auto_log_info(
        `You have a Deck of Every Card and ${15 - get("_deckCardsDrawn")} draws remaining!`,
        "blue",
      );
    }

    if (
      isUnrestricted($item`Time-Spinner`) &&
      itemAmount($item`Time-Spinner`) > 0 &&
      get("_timeSpinnerMinutesUsed") < 10 &&
      auto_is_valid($item`Time-Spinner`)
    ) {
      auto_log_info(
        `You have ${10 - get("_timeSpinnerMinutesUsed")} minutes left to Time-Spinner!`,
        "blue",
      );
    }

    if (
      isUnrestricted(wrap_item($item`Chateau Mantegna room key`)) &&
      !get("_chateauMonsterFought") &&
      get("chateauAvailable")
    ) {
      auto_log_info(
        "You can still fight a Chateau Mangtegna Painting today.",
        "blue",
      );
    }

    if (
      !get("_streamsCrossed") &&
      possessEquipment($item`protonic accelerator pack`) &&
      auto_is_valid$3($effect`Total Protonic Reversal`)
    ) {
      cliExecute("crossstreams");
    }

    if (
      isUnrestricted($item`shrine to the Barrel god`) &&
      !get("_barrelPrayer") &&
      get("barrelShrineUnlocked")
    ) {
      auto_log_info("You can still worship the barrel god today.", "blue");
    }
    if (
      isUnrestricted($item`airplane charter: Dinseylandfill`) &&
      !get("_dinseyGarbageDisposed") &&
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
      !get("_infernoDiscoVisited") &&
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
      !get("_pottedTeaTreeUsed") &&
      auto_get_campground().has($item`potted tea tree`)
    ) {
      auto_log_info("You have a tea tree to shake!", "blue");
    }

    if (auto_haveAugustScepter() && get("_augSkillsCast") < 5) {
      auto_log_info(
        `You still have ${5 - get("_augSkillsCast")} August Scepter casts remaining! Perhaps consider casting Aug 13th/30th for more rollover adventures, and/or 7th for a buff for tomorrow?`,
        "blue",
      );
    }

    meatReserveMessage();

    if (get("spadingData") !== "") {
      cliExecute("spade autoconfirm");
    }

    auto_log_info("You are probably done for today, beep.", "blue");
    return true;
  }
}
