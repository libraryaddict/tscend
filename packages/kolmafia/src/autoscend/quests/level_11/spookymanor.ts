import {
  canDrink,
  cliExecute,
  council,
  Element,
  equip,
  friarsAvailable,
  haveSkill,
  inebrietyLimit,
  inHardcore,
  isBanished,
  Item,
  itemAmount,
  monsterLevelAdjustment,
  myAscensions,
  myBuffedstat,
  myDaycount,
  myInebriety,
  myLevel,
  myMeat,
  myPrimestat,
  myTurncount,
  turnsUntilForcedNoncombat,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $element,
  $elements,
  $familiar,
  $item,
  $location,
  $modifier,
  $monster,
  $phylum,
  $skill,
  $slot,
  $stat,
  get,
  have,
  set,
} from "libram";

import { speculative_pool_skill } from "../../../autoscend";
import {
  ArchSpade,
  AugustScepter,
  AutoSourceTerminal,
  Cartography,
  Eagle,
} from "../../../types";
import {
  auto_autoConsumeOne,
  auto_findBestConsumeAction,
} from "../../auto_consume";
import {
  autoEquip,
  autoEquipToSlot,
  autoForceEquip,
  possessEquipment,
  resetMaximize,
} from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { provideResistances, provideResistances$4 } from "../../auto_providers";
import {
  auto_reserveUndergroundAdventures,
  auto_waitForDay2,
  canBurnDelay,
} from "../../auto_routing";
import { zone_delay } from "../../auto_zone";
import {
  NoncombatForcing,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../../engine/engine";
import { autoAdv } from "../../executors/auto_adventure";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import {
  auto_have_familiar,
  handleFamiliar$1,
  is100FamRun,
} from "../../helpers/auto_familiar";
import { acquireHP } from "../../helpers/auto_restore";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { in_picky } from "../../paths/2014/picky";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_nuclear } from "../../paths/2016/nuclear_autumn";
import { lar_repeat } from "../../paths/2017/live_ascend_repeat";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { bat_formBats, bat_wantHowl } from "../../paths/2019/dark_gyffte";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { in_lowkeysummer } from "../../paths/2020/low_key_summer";
import { in_wildfire } from "../../paths/2021/wildfire";
import { in_robot } from "../../paths/2021/you_robot";
import { in_aosol } from "../../paths/2023/avatar_of_shadows_over_loathing";
import { in_small } from "../../paths/2023/small";
import { is_professor } from "../../paths/2024/wereprofessor";
import { in_zootomist } from "../../paths/2025/zootomist";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import {
  auto_abort,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  auto_change_mcd,
  auto_combat_appearance_rates$1,
  auto_convertDesiredML,
  auto_forceNextNoncombatIfWorthIt,
  auto_inRonin,
  auto_is_valid,
  auto_is_valid$2,
  auto_MaxMLToCap,
  auto_runChoice,
  auto_shouldDelayForForcedNonCombat,
  autoCraft,
  backupSetting,
  canSniff,
  internalQuestStatus,
  meatReserve,
  ovenHandle,
} from "../../utils/auto_util";
import { ConsumeAction } from "../../utils/autoscend_record";
import { maximizer } from "../../utils/maximizer";

export function hasSpookyravenLibraryKey(): boolean {
  return (
    itemAmount($item`[1764]Spookyraven library key`) > 0 ||
    itemAmount($item`[7302]Spookyraven library key`) > 0
  );
}

export function LX_unlockHauntedBilliardsRoom(
  delayKitchen: boolean = true,
): boolean {
  // delayKitchen if true will force the check for 9 hot res & 9 stench res to be used
  if (internalQuestStatus("questM20Necklace") !== 0) {
    return false;
  }

  if (get("manorDrawerCount") >= 24) {
    cliExecute("refresh inv");
  }

  if (itemAmount($item`Spookyraven billiards room key`) > 0) {
    return false;
  }

  if (isAboutToPowerlevel()) {
    // if we're at the point where we need to level up to get more quests other than this, we might as well just do this instead
    delayKitchen = false;
  }
  if (delayKitchen) {
    const resGoals: Map<Element, number> = new Map();
    resGoals.set($element`hot`, 9);
    resGoals.set($element`stench`, 9);
    // check to see if we can acquire sufficient hot and stench res for the kitchen
    const resPossible: Map<Element, number> = provideResistances(
      resGoals,
      $location`The Haunted Kitchen`,
      true,
      false,
      true,
    );
    delayKitchen =
      (resPossible.get($element`hot`) ?? 0) < 9 ||
      (resPossible.get($element`stench`) ?? 0) < 9;
  }

  if (delayKitchen && isActuallyEd()) {
    // If we already have all the elemental wards as ed we're probably not going to get any better, so might as well get it over with
    delayKitchen = !haveSkill($skill`Even More Elemental Wards`);
  }

  if (!delayKitchen) {
    const resGoal: Map<Element, number> = new Map();
    resGoal.set($element`hot`, 9);
    resGoal.set($element`stench`, 9);
    const resPossible: Map<Element, number> = provideResistances(
      resGoal,
      $location`The Haunted Kitchen`,
      true,
      true,
      false,
    );
    auto_log_info(
      `Looking for the Billards Room key (Hot/Stench:${resPossible.get($element`hot`) ?? 0}/${resPossible.get($element`stench`) ?? 0}): Progress ${get("manorDrawerCount")}/24`,
      "blue",
    );

    if (
      ArchSpade.spadeDigsRemaining() > 0 &&
      get("lastAdventure") === $location`The Haunted Kitchen`
    ) {
      return ArchSpade.spadeDigSkeleton($location`The Haunted Kitchen`);
    }
    if (autoAdv($location`The Haunted Kitchen`)) {
      return true;
    }
  }
  return false;
}

function LX_unlockHauntedLibraryDo(): boolean {
  //Adventure in the haunted billiards room to get the key to the haunted library
  //equipment handling
  let expectPool: number = speculative_pool_skill();
  const staffOfFats: Item = $item`[2268]Staff of Fats`; //regular staff of fats. +5 pool +2 training
  const EdStaffOfFats: Item = $item`[7964]Staff of Fats`; //ed path version of staff of fats. +5 pool
  const EdStaffOfEd: Item = $item`[7961]Staff of Ed`; //ed path version of staff of ed. +5 pool

  if (is_boris()) {
    auto_log_info("Boris cannot equip a pool cue.", "blue");
  } else if (in_tcrs()) {
    auto_log_info(
      "During this Crazy Summer Pool Cues are used differently.",
      "blue",
    );
  } else if (expectPool > 17) {
    auto_log_info("I don't need to equip a cue to beat this ghostie.", "blue");
  } else {
    if (possessEquipment(staffOfFats)) {
      autoEquip(staffOfFats); //+5 pool skill & +2 training gains.
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfEd) && expectPool + 5 > 13) {
      autoEquip(EdStaffOfEd); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment(EdStaffOfFats) && expectPool + 5 > 13) {
      autoEquip(EdStaffOfFats); //+5 pool skill
      expectPool += 5;
    } else if (possessEquipment($item`pool cue`) && expectPool + 3 > 13) {
      autoEquip($item`pool cue`); //+3 pool skill
      expectPool += 3;
    }
  }

  if (in_small() && myInebriety() < inebrietyLimit() && myLevel() > 10) {
    // in small we should have astral pilsners assuming the user knows what they are doing
    // so just drink one if we can get the max adventures out of it
    const bestDrinkAction: ConsumeAction = auto_findBestConsumeAction("drink");
    if (bestDrinkAction.it === $item`astral pilsner`) {
      auto_autoConsumeOne(bestDrinkAction);
    } else {
      auto_log_info(
        "You didn't take astral pilsners or you're somehow on day 4 of Small. Make better life choices.",
      );
    }
  }
  //inebrity handling. do not care if: auto succeed or can't drink or ran out of things to do.
  const wildfire_check: boolean = !(in_wildfire() && inHardcore()); //hardcore wildfire ignore inebriety limits
  if (
    expectPool < 18 &&
    canDrink() &&
    !isAboutToPowerlevel() &&
    wildfire_check
  ) {
    //paths with inebrity limit under 11 should wait until they are at max to do this
    if (myInebriety() < inebrietyLimit() && inebrietyLimit() < 11) {
      auto_log_info("I will come back when I had more to drink.", "green");
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
    if (myInebriety() < inebrietyLimit() && myInebriety() < 8) {
      auto_log_info("I will come back when I had more to drink.", "green");
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
    if (myInebriety() > 11) {
      const penalty: number = 2 * (10 - myInebriety());
      auto_log_info(
        `I overshot my inebrity goal for the [Haunted Billiards Room] which gives me a penalty of ${penalty}pool skill. I will come back tomorrow or if I run out of things to do.`,
        "green",
      );
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
  }
  //+3 pool skill & +1 training gains. speculative_pool_skill() already assumed we would use it if we can.
  buffMaintain$2($effect`Chalky Hand`);

  if (internalQuestStatus("questM20Necklace") === 2) {
    // If we're forcing a NC and it's not ready yet
    if (
      auto_shouldDelayForForcedNonCombat($location`The Haunted Billiards Room`)
    ) {
      return false;
    }

    // only force after we get the pool cue NC.
    const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
      $location`The Haunted Billiards Room`,
    );
    // Bail if the NC forcer isn't armed yet
    if (
      !NCForced &&
      auto_shouldDelayForForcedNonCombat($location`The Haunted Billiards Room`)
    ) {
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel()
    ) {
      resetMaximize(); //cancel equipping pool cue
      return false;
    }
  }
  auto_log_info("It's billiards time!", "blue");
  return autoAdv($location`The Haunted Billiards Room`);
}

export const LX_unlockHauntedLibraryTask: QuestTask = registerQuestTask({
  name: "LX_unlockHauntedLibrary",
  completed: () =>
    internalQuestStatus("questM20Necklace") > 2 || hasSpookyravenLibraryKey(),
  ready: () =>
    internalQuestStatus("questM20Necklace") >= 1 &&
    itemAmount($item`Spookyraven billiards room key`) >= 1,
  do: LX_unlockHauntedLibraryDo,
  locations: $location`The Haunted Billiards Room`,
  forcedNonCombats: () => {
    if (internalQuestStatus("questM20Necklace") === 2) {
      return [{ turnsRequiredForSetup: 0 }];
    }
    // the next noncombat is the pool cue one, so a force only pays off on the one after it
    const turnsUntilCue: number = turnsUntilForcedNoncombat(
      $location`The Haunted Billiards Room`,
    );
    return [
      {
        turnsRequiredForSetup: turnsUntilCue,
        turnsSavedByForcedNC: 10,
      } as NoncombatForcing,
    ];
  },
});

export function LX_unlockHauntedLibrary(): boolean {
  return runQuestTask(LX_unlockHauntedLibraryTask);
}

function LX_unlockManorSecondFloorDo(): boolean {
  //No sense in trying to go to the library if constructs (writing desk) are banished and we already have a killing jar and haven't done the desert yet
  if (
    isBanished($phylum`construct`) &&
    get("screechCombats") > 0 &&
    itemAmount($item`killing jar`) > 0 &&
    (get("gnasirProgress") & 4) !== 4
  ) {
    set("_auto_screechDelay", "construct");
    return false;
  }

  if (!hasSpookyravenLibraryKey()) {
    return false;
  }
  //finish quest
  if (itemAmount($item`Lady Spookyraven's necklace`) > 0) {
    auto_log_info("Giving Lady Spookyraven her necklace.", "blue");
    visitUrl("place.php?whichplace=manor1&action=manor1_ladys");
    visitUrl("place.php?whichplace=manor2&action=manor2_ladys");
    return true;
  }

  if (myTurncount() === get("_LAR_skipNC163", 0)) {
    auto_log_info(
      "In LAR path NC163 is forced to reoccur if we skip it. Go do something else.",
    );
    return false;
  }

  auto_log_info("Well, we need writing desks", "blue");
  auto_log_info("Going to the library!", "blue");
  if (
    get("writingDesksDefeated") <= 3 ||
    get("nosyNoseMonster") === $monster`writing desk`
  ) {
    // nose sniff is weak so probably want fairy familiar first. this condition should change if banshee librarian is added as a YR target for killing jar
    if (
      (itemAmount($item`killing jar`) > 0 ||
        isBanished($monster`banshee librarian`)) &&
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1($location`The Haunted Library`).get(
        $monster`writing desk`,
      ) ?? 0.0) < 100
    ) {
      handleFamiliar$1($familiar`Nosy Nose`);
    }
  }
  if (get("writingDesksDefeated") <= 3) {
    if (
      canSniff($monster`writing desk`, $location`The Haunted Library`) &&
      Cartography.mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a writing desk.",
      );
    }
  }

  Eagle.getCitizenZone($location`The Haunted Library`, false); //since want to adventure in the Haunted Library anyway
  return autoAdv($location`The Haunted Library`);
}

export const LX_unlockManorSecondFloorTask: QuestTask = registerQuestTask({
  name: "LX_unlockManorSecondFloor",
  completed: () => internalQuestStatus("questM20Necklace") > 4,
  ready: () => internalQuestStatus("questM20Necklace") >= 3,
  do: LX_unlockManorSecondFloorDo,
  locations: $location`The Haunted Library`,
  desiredEncounters: () => [
    {
      monster: $monster`writing desk`,
      needAmount:
        internalQuestStatus("questM20Necklace") <= 4
          ? 5 - get("writingDesksDefeated")
          : 0,
    },
    {
      item: $item`killing jar`,
      needAmount:
        itemAmount($item`killing jar`) < 1 &&
        (get("gnasirProgress") & 4) === 0 &&
        get("desertExploration") < 100
          ? 1
          : 0,
    },
  ],
});

export function LX_unlockManorSecondFloor(): boolean {
  return runQuestTask(LX_unlockManorSecondFloorTask);
}

const LX_unlockHauntedBilliardsRoomFirstFloorTask: QuestTask =
  registerQuestTask({
    name: "LX_unlockHauntedBilliardsRoomFirstFloor",
    completed: () => itemAmount($item`Spookyraven billiards room key`) > 0,
    ready: () => true,
    do: () => LX_unlockHauntedBilliardsRoom(),
    locations: $location`The Haunted Kitchen`,
  });

function LX_spookyravenManorFirstFloorDo(): boolean {
  return runTaskChain([
    LX_unlockManorSecondFloorTask,
    LX_unlockHauntedLibraryTask,
    LX_unlockHauntedBilliardsRoomFirstFloorTask,
  ]);
}

export const LX_spookyravenManorFirstFloorTask: QuestTask = registerQuestTask({
  name: "LX_spookyravenManorFirstFloor",
  completed: () => get("lastSecondFloorUnlock") >= myAscensions(),
  ready: () => true,
  do: LX_spookyravenManorFirstFloorDo,
});

export function LX_spookyravenManorFirstFloor(): boolean {
  return runQuestTask(LX_spookyravenManorFirstFloorTask);
}

function LX_danceWithLadySpookyravenDo(): boolean {
  if (
    itemAmount($item`Lady Spookyraven's powder puff`) === 1 &&
    itemAmount($item`Lady Spookyraven's dancing shoes`) === 1 &&
    itemAmount($item`Lady Spookyraven's finest gown`) === 1
  ) {
    visitUrl("place.php?whichplace=manor2&action=manor2_ladys");
  }

  auto_log_info("Finished Spookyraven, just dancing with the lady.", "blue");
  if (autoAdv($location`The Haunted Ballroom`)) {
    if (in_lowkeysummer()) {
      // need to open the Haunted Nursery for the music box key.
      visitUrl("place.php?whichplace=manor3&action=manor3_ladys");
    }
    return true;
  }
  return false;
}

export const LX_danceWithLadySpookyravenTask: QuestTask = registerQuestTask({
  name: "LX_danceWithLadySpookyraven",
  completed: () => internalQuestStatus("questM21Dance") > 3,
  ready: () => internalQuestStatus("questM21Dance") >= 2,
  do: LX_danceWithLadySpookyravenDo,
  locations: $location`The Haunted Ballroom`,
});

export function hauntedBedroomChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  if (choice === 876) {
    // One Simple Nightstand (The Haunted Bedroom)
    if (
      (myMeat() < 1000 + meatReserve() &&
        auto_is_valid($item`old leather wallet`) &&
        !in_wotsf()) ||
      in_amw()
    ) {
      auto_runChoice(1); // get old leather wallet worth ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Muscle` &&
      myBuffedstat($stat`Muscle`) < 150
    ) {
      auto_runChoice(3); // spend 1 ghost key for primestat, get ~200 muscle XP
    } else {
      auto_runChoice(2); // get min(200,muscle) of muscle XP
    }
  } else if (choice === 877) {
    // One Mahogany Nightstand (The Haunted Bedroom)
    auto_runChoice(1); // get half of a memo or old coin purse
  } else if (choice === 878) {
    // One Ornate Nightstand (The Haunted Bedroom)
    let needSpectacles: boolean =
      !possessEquipment($item`Lord Spookyraven's spectacles`) &&
      internalQuestStatus("questL11Manor") < 2;
    if (is_boris() || in_wotsf() || (in_nuclear() && inHardcore())) {
      needSpectacles = false;
    }
    if (needSpectacles) {
      auto_runChoice(3); // get Lord Spookyraven's spectacles
    } else if (
      itemAmount($item`disposable instant camera`) === 0 &&
      internalQuestStatus("questL11Palindome") < 1
    ) {
      auto_runChoice(4); // get disposable instant camera
    } else if (
      myPrimestat() !== $stat`Mysticality` ||
      myMeat() < 1000 + meatReserve() ||
      in_amw()
    ) {
      auto_runChoice(1); // get ~500 meat
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Mysticality` &&
      myBuffedstat($stat`Mysticality`) < 150
    ) {
      auto_runChoice(5); // spend 1 ghost key for primestat, get ~200 mysticality XP
    } else {
      auto_runChoice(2); // get min(200,mys) of mys XP
    }
  } else if (choice === 879) {
    // One Rustic Nightstand (The Haunted Bedroom)
    if (options.has(4)) {
      auto_runChoice(4); // only shows up rarely. still worth ~1 mil in mall
    }
    if (in_bhy() && itemAmount($item`antique hand mirror`) < 1) {
      auto_runChoice(3); // fight the remains of a jilted mistress for the antique hand mirror
    } else if (
      itemAmount($item`ghost key`) > 0 &&
      myPrimestat() === $stat`Moxie` &&
      myBuffedstat($stat`Moxie`) < 150
    ) {
      auto_runChoice(5); // spend 1 ghost key for primestat, get ~200 moxie XP
    } else {
      auto_runChoice(1); // get moxie substats
    }
  } else if (choice === 880) {
    // One Elegant Nightstand (The Haunted Bedroom)
    if (
      internalQuestStatus("questM21Dance") < 2 &&
      itemAmount($item`Lady Spookyraven's finest gown`) === 0
    ) {
      auto_runChoice(1); // get Lady Spookyraven's Gown
    } else {
      auto_runChoice(2); // get elegant nightstick
    }
  } else {
    auto_abort("unhandled choice in hauntedBedroomChoiceHandler");
  }
}

function LX_getLadySpookyravensFinestGownDo(): boolean {
  // Elegant animated nightstand has a delay of 6(?) adventures.
  // TODO: add a check for delay burning?
  // Might not be worth it since we need to fight ornate nightstands for the spectacles and camera
  let needSpectacles: boolean =
    !possessEquipment($item`Lord Spookyraven's spectacles`) &&
    internalQuestStatus("questL11Manor") < 2;
  let needCamera: boolean =
    itemAmount($item`disposable instant camera`) === 0 &&
    internalQuestStatus("questL11Palindome") < 1;
  if (is_boris() || in_wotsf() || (in_nuclear() && inHardcore())) {
    needSpectacles = false;
  }
  if (in_pokefam()) {
    needCamera = false;
  }
  if (needCamera && needSpectacles) {
    // if in a path that needs both you want a two night stand with ornate, olfacting ornate nightstand is a problem
    // for the script because it will work against the elegant nightstand and most olfaction skills aren't cancelled
    // easily without changing locations, but Nosy Nose will be turned off once it's no longer the used familiar
    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      !is100FamRun()
    ) {
      let ornateRate: number =
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`).get(
          $monster`animated ornate nightstand`,
        ) ?? 0.0;
      const elegantRate: number =
        auto_combat_appearance_rates$1($location`The Haunted Bedroom`).get(
          $monster`elegant animated nightstand`,
        ) ?? 0.0;
      if ($location`The Haunted Bedroom`.turnsSpent < 6 && elegantRate !== 0) {
        //non 0 value for elegant before 7 is spurious
        ornateRate += elegantRate; //not a real rate but only correct for the purpose of checking if it is 100
      }
      if (ornateRate < 99.9) {
        handleFamiliar$1($familiar`Nosy Nose`);
      }
    }
  }

  if (itemAmount($item`Lady Spookyraven's finest gown`) > 0) {
    // got the Bedroom item but we might still need items for other parts
    // of the macguffin quest if we got unlucky
    if (!needSpectacles && !needCamera) {
      return false;
    }
  }

  auto_log_info(
    "Spookyraven: Bedroom, rummaging through nightstands looking for naughty meatbag trinkets.",
    "blue",
  );
  if (autoAdv($location`The Haunted Bedroom`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensFinestGownTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensFinestGown",
    completed: () => internalQuestStatus("questM21Dance") > 1,
    ready: () => internalQuestStatus("questM21Dance") === 1,
    do: LX_getLadySpookyravensFinestGownDo,
    locations: $location`The Haunted Bedroom`,
    desiredEncounters: () => [
      {
        monster: $monster`animated ornate nightstand`,
        needAmount:
          2 -
          ((!possessEquipment($item`Lord Spookyraven's spectacles`) ? 1 : 0) +
            Math.min(1, itemAmount($item`disposable instant camera`))),
      },
      {
        // Gown
        monster: $monster`elegant animated nightstand`,
        needAmount: 1,
      },
    ],
  });

function LX_getLadySpookyravensDancingShoesDo(): boolean {
  backupSetting("louvreDesiredGoal", "7"); // lets just let mafia automate this for us.
  auto_log_info("Spookyraven: Gallery", "blue");

  AutoSourceTerminal.sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (autoAdv($location`The Haunted Gallery`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensDancingShoesTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensDancingShoes",
    completed: () =>
      internalQuestStatus("questM21Dance") > 1 ||
      itemAmount($item`Lady Spookyraven's dancing shoes`) > 0,
    ready: () =>
      internalQuestStatus("questM21Dance") === 1 &&
      // Louvre It or Leave It choice adventure has a delay of 5 adventures.
      !canBurnDelay($location`The Haunted Gallery`),
    do: LX_getLadySpookyravensDancingShoesDo,
    locations: $location`The Haunted Gallery`,
  });

function LX_getLadySpookyravensPowderPuffDo(): boolean {
  // If we're forcing a NC and it's not ready yet
  if (
    !zone_delay($location`The Haunted Bathroom`).shouldDelay &&
    auto_shouldDelayForForcedNonCombat($location`The Haunted Bathroom`)
  ) {
    return false;
  }

  auto_log_info("Spookyraven: Bathroom", "blue");

  AutoSourceTerminal.sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (!zone_delay($location`The Haunted Bathroom`).shouldDelay) {
    const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
      $location`The Haunted Bathroom`,
    );
    // Bail if the NC forcer isn't armed yet
    if (
      !NCForced &&
      auto_shouldDelayForForcedNonCombat($location`The Haunted Bathroom`)
    ) {
      return false;
    }
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel()
    ) {
      return false;
    }
  }
  if (autoAdv($location`The Haunted Bathroom`)) {
    return true;
  }
  return false;
}

export const LX_getLadySpookyravensPowderPuffTask: QuestTask =
  registerQuestTask({
    name: "LX_getLadySpookyravensPowderPuff",
    completed: () =>
      internalQuestStatus("questM21Dance") > 1 ||
      itemAmount($item`Lady Spookyraven's powder puff`) > 0,
    ready: () =>
      internalQuestStatus("questM21Dance") === 1 &&
      // Never Gonna Make You Up choice adventure has a delay of 5 adventures.
      !canBurnDelay($location`The Haunted Bathroom`),
    do: LX_getLadySpookyravensPowderPuffDo,
    locations: $location`The Haunted Bathroom`,
    forcedNonCombats: () => [{ turnsRequiredForSetup: 0 }],
  });

export function LX_getLadySpookyravensPowderPuff(): boolean {
  return runQuestTask(LX_getLadySpookyravensPowderPuffTask);
}

function LX_spookyravenManorSecondFloorDo(): boolean {
  return runTaskChain([
    LX_danceWithLadySpookyravenTask,
    LX_getLadySpookyravensFinestGownTask,
    LX_getLadySpookyravensDancingShoesTask,
    LX_getLadySpookyravensPowderPuffTask,
  ]);
}

export const LX_spookyravenManorSecondFloorTask: QuestTask = registerQuestTask({
  name: "LX_spookyravenManorSecondFloor",
  completed: () => internalQuestStatus("questM21Dance") > 3,
  ready: () => get("lastSecondFloorUnlock") >= myAscensions(),
  do: LX_spookyravenManorSecondFloorDo,
});

export function LX_spookyravenManorSecondFloor(): boolean {
  return runQuestTask(LX_spookyravenManorSecondFloorTask);
}

function L11_mauriceSpookyravenAltPathwayActive(): boolean {
  return (
    !possessEquipment($item`Lord Spookyraven's spectacles`) ||
    is_boris() ||
    in_wotsf() ||
    in_bhy() ||
    in_robot() ||
    (in_nuclear() && !get("auto_haveoven", false))
  );
}

function L11_mauriceSpookyravenNormalPathwayReady(): boolean {
  const recipeUsed = get("spookyravenRecipeUsed");
  if (recipeUsed === "without_glasses") {
    auto_abort(
      "Did not read Mortar Recipe with the Spookyraven glasses. We can't proceed.",
    );
  }
  if (recipeUsed !== "with_glasses") {
    // Not read yet - let the Mortar task have its turn first.
    return false;
  }
  if (auto_reserveUndergroundAdventures()) {
    return false;
  }
  return true;
}

const L11_mauriceSpookyravenBallroomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBallroom",
  completed: () => internalQuestStatus("questL11Manor") >= 1,
  ready: () => internalQuestStatus("questL11Manor") < 1,
  do: () => {
    auto_log_info("Searching for the basement of Spookyraven", "blue");
    if (!lar_repeat($location`The Haunted Ballroom`)) {
      return false;
    }
    if (ArchSpade.wantToSpadeDigSkeleton($location`The Haunted Ballroom`)) {
      return ArchSpade.spadeDigSkeleton($location`The Haunted Ballroom`);
    }
    if (canBurnDelay($location`The Haunted Ballroom`)) {
      // We'll All Be Flat choice adventure has a delay of 5 adventures.
      return false;
    }
    return autoAdv($location`The Haunted Ballroom`);
  },
  locations: $location`The Haunted Ballroom`,
});

const L11_mauriceSpookyravenMortarTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenMortar",
  completed: () => get("spookyravenRecipeUsed") !== "none",
  ready: () => internalQuestStatus("questL11Manor") >= 1,
  do: () => {
    if (itemAmount($item`recipe: mortar-dissolving solution`) === 0) {
      if (possessEquipment($item`Lord Spookyraven's spectacles`)) {
        equip($slot`acc3`, $item`Lord Spookyraven's spectacles`);
      }
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
      if (itemAmount($item`recipe: mortar-dissolving solution`) === 0) {
        auto_abort(`Failed to acquire mortar-dissolving solution`);
      }
    }
    use(1, $item`recipe: mortar-dissolving solution`);
    return true;
  },
});

const L11_mauriceSpookyravenBossTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBoss",
  completed: () => internalQuestStatus("questL11Manor") > 3,
  ready: () => {
    if (internalQuestStatus("questL11Manor") <= 2) {
      return false;
    }
    if (is_professor()) {
      return false; //Can't beat Lord Spookyraven as the Professor
    }
    return true;
  },
  do: () => {
    auto_log_info("Down with the tyrant of Spookyraven!", "blue");
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    }
    acquireHP();
    const resGoal: Map<Element, number> = new Map();
    for (const ele of $elements`hot, cold, stench, sleaze, spooky`) {
      resGoal.set(ele, 3);
    }
    provideResistances$4(resGoal, $location`Summoning Chamber`, false);
    // The autoAdvBypass case is probably suitable for Ed but we'd need to verify it.
    if (isActuallyEd()) {
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberboss");
      if (internalQuestStatus("questL11MacGuffin") > 2) {
        // Actually Ed finishes this quest when all 3 parts of the staff are returned
        council();
      }
    } else {
      set("auto_nonAdvLoc", true);
      autoAdv($location`Summoning Chamber`);
    }
    return true;
  },
  locations: $location`Summoning Chamber`,
});

const L11_mauriceSpookyravenOvenTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenOven",
  completed: () => get("auto_haveoven", false),
  ready: () => !get("auto_haveoven", false),
  do: () => {
    ovenHandle();
    return true;
  },
});

const L11_mauriceSpookyravenWineBombTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenWineBomb",
  completed: () => internalQuestStatus("questL11Manor") >= 3,
  ready: () =>
    itemAmount($item`wine bomb`) === 1 &&
    internalQuestStatus("questL11Manor") < 3,
  do: () => {
    visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
    if (internalQuestStatus("questL11Manor") < 3) {
      auto_abort("Tried to use the wine bomb but it somehow failed?");
    }
    return true;
  },
});

const L11_mauriceSpookyravenAltPathwayTask: QuestTask = {
  name: "L11_mauriceSpookyravenAltPathway",
  completed: () =>
    get("spookyravenRecipeUsed") === "with_glasses" ||
    have($item`bottle of Chateau de Vinegar`) ||
    have($item`unstable fulminate`) ||
    have($item`wine bomb`) ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => L11_mauriceSpookyravenAltPathwayActive(),
  do: () => {},
};

const L11_mauriceSpookyravenKitchenTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenKitchen",
    completed: () => itemAmount($item`loosening powder`) > 0,
    ready: () => itemAmount($item`loosening powder`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      // I suppose we can let anyone in without the Spectacles.
      return autoAdv($location`The Haunted Kitchen`);
    },
    locations: $location`The Haunted Kitchen`,
  },
);

const L11_mauriceSpookyravenConservatoryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenConservatory",
    completed: () => itemAmount($item`powdered castoreum`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Conservatory`);
    },
    locations: $location`The Haunted Conservatory`,
  },
);

const L11_mauriceSpookyravenBathroomTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenBathroom",
    completed: () => itemAmount($item`drain dissolver`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Bathroom`);
    },
    locations: $location`The Haunted Bathroom`,
  },
);

const L11_mauriceSpookyravenGalleryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenGallery",
    completed: () => itemAmount($item`triple-distilled turpentine`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Gallery`);
    },
    locations: $location`The Haunted Gallery`,
  },
);

const L11_mauriceSpookyravenLaboratoryTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenLaboratory",
    completed: () => itemAmount($item`detartrated anhydrous sublicalc`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      //3rd floor unlock fix. can manually adv without starting quest. but autoAdv fails until quest is started. so start the quest
      if (internalQuestStatus("questM17Babies") === -1) {
        visitUrl("place.php?whichplace=manor3&action=manor3_ladys"); //talk to 3rd floor ghost to start quest
      }
      return autoAdv($location`The Haunted Laboratory`);
    },
    locations: $location`The Haunted Laboratory`,
  },
);

const L11_mauriceSpookyravenStorageRoomTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenStorageRoom",
    completed: () => itemAmount($item`triatomaceous dust`) > 0,
    ready: () =>
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) > 0 &&
      itemAmount($item`triatomaceous dust`) === 0,
    do: () => {
      auto_log_warning("Alternate fulminate pathway... how sad :(", "red");
      return autoAdv($location`The Haunted Storage Room`);
    },
    locations: $location`The Haunted Storage Room`,
  },
);

const L11_mauriceSpookyravenAltPathwayFinishTask: QuestTask = registerQuestTask(
  L11_mauriceSpookyravenAltPathwayTask,
  {
    name: "L11_mauriceSpookyravenAltPathwayFinish",
    completed: () =>
      possessEquipment($item`unstable fulminate`) ||
      internalQuestStatus("questL11Manor") >= 3,
    ready: () =>
      !possessEquipment($item`unstable fulminate`) &&
      internalQuestStatus("questL11Manor") < 3 &&
      itemAmount($item`loosening powder`) > 0 &&
      itemAmount($item`powdered castoreum`) > 0 &&
      itemAmount($item`drain dissolver`) > 0 &&
      itemAmount($item`triple-distilled turpentine`) > 0 &&
      itemAmount($item`detartrated anhydrous sublicalc`) > 0 &&
      itemAmount($item`triatomaceous dust`) > 0,
    do: () => {
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
      return true;
    },
  },
);

const L11_mauriceSpookyravenFulminateCraftTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenFulminateCraft",
  completed: () =>
    possessEquipment($item`unstable fulminate`) ||
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () =>
    itemAmount($item`blasting soda`) === 1 &&
    itemAmount($item`bottle of Chateau de Vinegar`) === 1,
  do: () => {
    auto_log_info(
      "Time to cook up something explosive! Science fair unstable fulminate time!",
      "green",
    );
    ovenHandle();
    autoCraft(
      "cook",
      1,
      $item`bottle of Chateau de Vinegar`,
      $item`blasting soda`,
    );
    if (itemAmount($item`unstable fulminate`) === 0) {
      auto_log_warning(
        "We could not make an Unstable Fulminate but we think we have an oven. Do this manually and resume?",
        "red",
      );
      auto_log_warning(
        "Speculating that get_campground() was incorrect at ascension start...",
        "red",
      );
      // This issue is valid as of mafia r16799
      set("auto_haveoven", false);
      ovenHandle();
      autoCraft(
        "cook",
        1,
        $item`bottle of Chateau de Vinegar`,
        $item`blasting soda`,
      );
      if (itemAmount($item`unstable fulminate`) === 0) {
        if (in_nuclear()) {
          auto_log_warning(
            "Could not make an Unstable Fulminate, assuming we have no oven for realz...",
            "red",
          );
          return true;
        } else {
          auto_abort(
            "Could not make an Unstable Fulminate, make it manually and resume",
          );
        }
      }
    }
    return true;
  },
});

const L11_mauriceSpookyravenWineCellarTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenWineCellar",
  completed: () =>
    itemAmount($item`bottle of Chateau de Vinegar`) > 0 ||
    have($item`unstable fulminate`) ||
    have($item`wine bomb`) ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (L11_mauriceSpookyravenAltPathwayActive()) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    if (isBanished($phylum`construct`) && get("screechCombats") > 0) {
      set("_auto_screechDelay", "construct");
      return false; //No sense in trying to go to the Wine Cellar if constructs (Wine Racks) are banished
    }
    return true;
  },
  do: () => {
    auto_log_info("Searching for vinegar", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats();
    }
    if (friarsAvailable() && !get("friarsBlessingReceived")) {
      cliExecute("friars booze");
    }
    if (
      canSniff(
        $monster`possessed wine rack`,
        $location`The Haunted Wine Cellar`,
      ) &&
      Cartography.mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Possessed Wine Rack.",
      );
    }
    return autoAdv($location`The Haunted Wine Cellar`);
  },
  locations: $location`The Haunted Wine Cellar`,
});

const L11_mauriceSpookyravenLaundryRoomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenLaundryRoom",
  completed: () =>
    itemAmount($item`blasting soda`) > 0 ||
    possessEquipment($item`unstable fulminate`) ||
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (
      L11_mauriceSpookyravenAltPathwayActive() ||
      itemAmount($item`blasting soda`) > 0 ||
      possessEquipment($item`unstable fulminate`) ||
      internalQuestStatus("questL11Manor") >= 3
    ) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    if (isBanished($phylum`undead`) && get("screechCombats") > 0) {
      set("_auto_screechDelay", "undead");
      return false; //No sense in trying to go to the Laundry Room if undead (Cabinet of Dr. Limpieza) are banished
    }
    return true;
  },
  do: () => {
    auto_log_info("Searching for baking soda, I mean, blasting pop.", "blue");
    if (!bat_wantHowl($location`The Haunted Wine Cellar`)) {
      bat_formBats();
    }
    AugustScepter.lostStomach(true);
    if (
      canSniff(
        $monster`cabinet of Dr. Limpieza`,
        $location`The Haunted Laundry Room`,
      ) &&
      Cartography.mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Cabinet of Dr. Limpieza.",
      );
    }
    return autoAdv($location`The Haunted Laundry Room`);
  },
  locations: $location`The Haunted Laundry Room`,
});

const L11_mauriceSpookyravenBoilerRoomTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyravenBoilerRoom",
  completed: () =>
    itemAmount($item`wine bomb`) > 0 ||
    internalQuestStatus("questL11Manor") >= 3,
  ready: () => {
    if (!possessEquipment($item`unstable fulminate`)) {
      return false;
    }
    if (!L11_mauriceSpookyravenNormalPathwayReady()) {
      return false;
    }
    // Zootomist probably wants to wait until D2 in SC for this.
    if (auto_inRonin() && in_zootomist()) {
      if (auto_waitForDay2()) {
        auto_log_debug("Delaying Monstrous Boiler waiting for day 2.");
        return false;
      }
    }
    return true;
  },
  do: () => {
    auto_MaxMLToCap(auto_convertDesiredML(82), true);
    maximizer
      .weight($modifier`Monster Level`, 500)
      .max($modifier`Monster Level`, auto_convertDesiredML(82));

    if (in_picky() && itemAmount($item`gumshoes`) > 0) {
      auto_change_mcd(0);
      autoEquipToSlot($slot`acc2`, $item`gumshoes`);
    }

    if (is_professor()) {
      // +ML is BAD for professor
      auto_change_mcd(0);
      maximizer
        .clearWeight($modifier`Monster Level`)
        .clearMax($modifier`Monster Level`);
    }

    if (monsterLevelAdjustment() < 57) {
      buffMaintain$2($effect`Sweetbreads Flambé`);
    }

    if (!autoForceEquip($slot`off-hand`, $item`unstable fulminate`)) {
      auto_abort(
        "Unstable Fulminate was not equipped. Please report this and include the following: Equipped items and if you have or don't have an Unstable Fulminate. For now, get the wine bomb manually, and run again.",
      );
    }

    auto_log_info("Now we mix and heat it up.", "blue");
    return autoAdv($location`The Haunted Boiler Room`);
  },
  locations: $location`The Haunted Boiler Room`,
});

function L11_mauriceSpookyravenDo(): boolean {
  if (
    (isActuallyEd() && itemAmount($item`[7962]Eye of Ed`) === 0) ||
    itemAmount($item`[2286]Eye of Ed`) > 0
  ) {
    return true;
  }
  if (in_robot() && myLevel() < 13) {
    return false; //delay fight so we can make sure we are strong enough to beat him
  }

  return runTaskChain([
    L11_mauriceSpookyravenBallroomTask,
    L11_mauriceSpookyravenMortarTask,
    L11_mauriceSpookyravenBossTask,
    L11_mauriceSpookyravenOvenTask,
    L11_mauriceSpookyravenWineBombTask,
    L11_mauriceSpookyravenKitchenTask,
    L11_mauriceSpookyravenConservatoryTask,
    L11_mauriceSpookyravenBathroomTask,
    L11_mauriceSpookyravenGalleryTask,
    L11_mauriceSpookyravenLaboratoryTask,
    L11_mauriceSpookyravenStorageRoomTask,
    L11_mauriceSpookyravenAltPathwayFinishTask,
    L11_mauriceSpookyravenFulminateCraftTask,
    L11_mauriceSpookyravenWineCellarTask,
    L11_mauriceSpookyravenLaundryRoomTask,
    L11_mauriceSpookyravenBoilerRoomTask,
  ]);
}

export const L11_mauriceSpookyravenTask: QuestTask = registerQuestTask({
  name: "L11_mauriceSpookyraven",
  completed: () => internalQuestStatus("questL11Manor") > 3,
  ready: () =>
    internalQuestStatus("questL11Manor") >= 0 &&
    internalQuestStatus("questM21Dance") >= 4,
  do: L11_mauriceSpookyravenDo,
  desiredEncounters: () => {
    const status: number = internalQuestStatus("questL11Manor");
    if (status > 3) {
      return [];
    }
    if (status > 2) {
      return [{ monster: $monster`Lord Spookyraven`, needAmount: 1 }];
    }
    const wantExplosives = !possessEquipment($item`unstable fulminate`);
    return [
      {
        item: $item`bottle of Chateau de Vinegar`,
        needAmount:
          wantExplosives &&
          itemAmount($item`bottle of Chateau de Vinegar`) === 0
            ? 1
            : 0,
      },
      {
        item: $item`blasting soda`,
        needAmount:
          wantExplosives && itemAmount($item`blasting soda`) === 0 ? 1 : 0,
      },
    ];
  },
});

export function L11_mauriceSpookyraven(): boolean {
  return runQuestTask(L11_mauriceSpookyravenTask);
}
