import {
  abort,
  availableAmount,
  containsText,
  council,
  getProperty,
  haveOutfit,
  Item,
  itemAmount,
  Location,
  max,
  monsterAttack,
  myBuffedstat,
  myLevel,
  myPath,
  myPrimestat,
  numericModifier,
  towerDoor,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $locations,
  $modifier,
  $monster,
  $path,
  $slot,
  $stat,
  get,
  set,
} from "libram";

import { autoAdv } from "../../auto_adventure";
import { buffMaintain$2 } from "../../auto_buff";
import {
  auto_getAllEquipabble,
  autoEquip,
  possessEquipment,
} from "../../auto_equipment";
import { LX_attemptPowerLevel } from "../../auto_powerlevel";
import { auto_log_warning, internalQuestStatus } from "../../auto_util";
import { zone_isAvailable } from "../../auto_zone";
import {
  QuestTask,
  registerQuestTask,
  runTaskChain,
} from "../../engine/engine";
import { canDrinkSpeakeasyDrink } from "../../iotms/other/clan";
import { L2_mosquitoTask } from "../../quests/level_02";
import { L3_tavern, L3_tavernTask } from "../../quests/level_03";
import { L4_batCaveTask } from "../../quests/level_04";
import {
  L5_slayTheGoblinKing,
  L5_slayTheGoblinKingTask,
} from "../../quests/level_05";
import {
  L6_friarsGetParts,
  L6_friarsGetPartsTask,
} from "../../quests/level_06";
import { L7_cryptTask } from "../../quests/level_07";
import { L8_trapperQuest, L8_trapperQuestTask } from "../../quests/level_08";
import {
  bridgeGoal,
  L9_chasmBuild,
  L9_chasmBuildTask,
  L9_highLandlord,
  L9_highLandlordTask,
} from "../../quests/level_09";
import {
  L10_airshipTask,
  L10_basementTask,
  L10_groundTask,
  L10_holeInTheSkyUnlockTask,
  L10_plantThatBean,
  L10_topFloorTask,
} from "../../quests/level_10";
import {
  L11_aridDesert,
  L11_blackMarketTask,
  L11_defeatEdTask,
  L11_forgedDocumentsTask,
  L11_getBeehiveTask,
  L11_hiddenCityTask,
  L11_hiddenCityZonesTask,
  L11_mauriceSpookyravenTask,
  L11_mcmuffinDiaryTask,
  L11_palindomeTask,
  L11_shenCopperhead,
  L11_shenStartQuest,
  L11_talismanOfNamTask,
  L11_unlockHiddenCityTask,
  L11_unlockMiddleChamberTask,
  L11_unlockPyramidTask,
  L11_unlockUpperChamberTask,
  LX_danceWithLadySpookyravenTask,
  LX_getLadySpookyravensDancingShoesTask,
  LX_getLadySpookyravensFinestGownTask,
  LX_getLadySpookyravensPowderPuffTask,
  LX_spookyravenManorFirstFloorTask,
  LX_spookyravenManorSecondFloorTask,
  LX_unlockHauntedBilliardsRoom,
  LX_unlockHauntedLibraryTask,
  LX_unlockHiddenTemple,
  LX_unlockHiddenTempleTask,
  LX_unlockManorSecondFloorTask,
  shenShouldDelayZone,
} from "../../quests/level_11";
import {
  L12_clearBattlefieldTask,
  L12_farmTask,
  L12_filthwormsTask,
  L12_finalizeWarTask,
  L12_flyerFinish,
  L12_getOutfitTask,
  L12_gremlinsTask,
  L12_lastDitchFlyerTask,
  L12_orchardFinalizeTask,
  L12_preOutfitTask,
  L12_sonofaBeachTask,
  L12_sonofaFinishTask,
  L12_startWarTask,
  L12_themtharHills,
} from "../../quests/level_12";
import {
  L13_sorceressDoorTask,
  L13_towerNSFinalTask,
  L13_towerNSNagamarTask,
  L13_towerNSTowerTask,
} from "../../quests/level_13";
import {
  LX_hippyBoatman,
  startHippyBoatmanSubQuestTask,
} from "../../quests/level_any";
import {
  finishMeatsmithSubQuestTask,
  LX_acquireEpicWeapon,
  LX_acquireEpicWeaponTask,
  LX_joinPirateCrew,
  LX_pirateOutfit,
  LX_pirateQuest,
  LX_pirateQuestTask,
  LX_unlockKnobMenagerieTask,
  numPirateInsults,
  startArmorySubQuestTask,
  startMeatsmithSubQuestTask,
} from "../../quests/optional";

// These are listed in the order they will be iterated (item id ascending) to make debugging easier.
const lowKeys: Map<Item, Location> = new Map();
lowKeys.set($item`clown car key`, $location`The "Fun" House`);
lowKeys.set($item`batting cage key`, $location`The Bat Hole Entrance`);
lowKeys.set($item`aquí`, $location`South of the Border`);
lowKeys.set($item`knob labinet key`, $location`Cobb's Knob Laboratory`);
lowKeys.set($item`weremoose key`, $location`Cobb's Knob Menagerie, Level 2`);
lowKeys.set($item`peg key`, $location`The Obligatory Pirate's Cove`);
lowKeys.set($item`kekekey`, $location`The Valley of Rof L'm Fao`);
lowKeys.set($item`rabbit's foot key`, $location`The Dire Warren`);
lowKeys.set($item`knob shaft skate key`, $location`The Knob Shaft`);
lowKeys.set($item`ice key`, $location`The Icy Peak`);
lowKeys.set($item`anchovy can key`, $location`The Haunted Pantry`);
lowKeys.set($item`cactus key`, $location`The Arid, Extra-Dry Desert`);
lowKeys.set($item`f'c'le sh'c'le k'y`, $location`The F'c'le`);
lowKeys.set($item`treasure chest key`, $location`Belowdecks`);
lowKeys.set($item`demonic key`, $location`Pandamonium Slums`);
lowKeys.set($item`key sausage`, $location`Cobb's Knob Kitchens`);
lowKeys.set($item`knob treasury key`, $location`Cobb's Knob Treasury`);
lowKeys.set($item`scrap metal key`, $location`The Old Landfill`);
lowKeys.set($item`black rose key`, $location`The Haunted Conservatory`);
lowKeys.set($item`actual skeleton key`, $location`The Skeleton Store`);
lowKeys.set($item`music box key`, $location`The Haunted Nursery`);
lowKeys.set($item`deep-fried key`, $location`Madness Bakery`);
lowKeys.set($item`discarded bike lock key`, $location`The Overgrown Lot`);

//Defined in autoscend/paths/low_key_summer.ash
export function in_lowkeysummer(): boolean {
  return myPath() === $path`Low Key Summer`;
}

export function lowkey_initializeSettings(): void {
  if (!in_lowkeysummer()) {
    return;
  }
  // TODO?
}

function lowkey_needKey(key: Item): boolean {
  if (internalQuestStatus("questL13Final") !== 5) {
    return false;
  }

  return (
    availableAmount(key) === 0 &&
    !containsText(getProperty("nsTowerDoorKeysUsed"), key.toString())
  );
}

function lowkey_keyDelayRemaining(loc: Location): number {
  if (!in_lowkeysummer()) {
    return 0;
  }

  return max(11 - loc.turnsSpent, 0);
}

function lowkey_keysRemaining(): number {
  if (!in_lowkeysummer()) {
    return 0;
  }

  let found: number = 0;
  for (const key of lowKeys.keys()) {
    if (!lowkey_needKey(key)) {
      found++;
    }
  }

  return 23 - found;
}

function lowkey_levelNeededToUnlockZone(loc: Location): number {
  // returns level under which it is normal for the key zones not to be accessible in the path
  switch (loc) {
    case $location`The Arid, Extra-Dry Desert`:
      return 11;
    case $location`Belowdecks`:
      return 11;
    case $location`The Valley of Rof L'm Fao`:
      return 9;
    case $location`The Icy Peak`:
      return 8;
    case $location`The Old Landfill`:
      return 6;
    case $location`Cobb's Knob Laboratory`:
      return 5;
    case $location`Cobb's Knob Menagerie, Level 2`:
      return 5;
    case $location`The Knob Shaft`:
      return 5;
    case $location`Cobb's Knob Kitchens`:
      return 5;
    case $location`Cobb's Knob Treasury`:
      return 5;
    case $location`The Bat Hole Entrance`:
      return 4;
    default:
      return 1;
  }
}
// order is subjective
function lowkey_nextKeyLocation(checkAvailable: boolean): Location {
  if (!in_lowkeysummer()) {
    return $location.none;
  }

  for (const key of lowKeys.keys()) {
    const loc: Location = lowKeys.get(key) ?? $location.none;
    if (lowkey_needKey(key)) {
      if (!checkAvailable || zone_isAvailable(loc)) {
        return lowKeys.get(key) ?? $location.none;
      }
    }
  }

  return $location.none;
}

function lowkey_nextAvailableKeyLocation(): Location {
  return lowkey_nextKeyLocation(true);
}

export function lowkey_nextAvailableKeyDelayLocation(): Location {
  if (!in_lowkeysummer()) {
    return $location.none;
  }

  for (const key of lowKeys.keys()) {
    const loc: Location = lowKeys.get(key) ?? $location.none;
    if (
      lowkey_needKey(key) &&
      zone_isAvailable(loc) &&
      lowkey_keyDelayRemaining(loc) > 0 &&
      loc.wanderers
    ) {
      return loc;
    }
  }

  return $location.none;
}

function lowkey_keyAdv(key: Item): boolean {
  if (!lowkey_needKey(key)) {
    return false;
  }

  const loc: Location = lowKeys.get(key) ?? $location.none;
  if (!zone_isAvailable(loc)) {
    return false;
  }
  // Pirate equipment
  if ($locations`The F'c'le, Belowdecks`.includes(loc)) {
    if (possessEquipment($item`pirate fledges`)) {
      autoEquip($item`pirate fledges`);
    } else if (haveOutfit("swashbuckling getup")) {
      autoEquip($item`eyepatch`);
      autoEquip($item`swashbuckling pants`);
      autoEquip($item`stuffed shoulder parrot`);
    } else {
      // Shouldn't get here due to zone_isAvailable check
      return false;
    }
  }

  return autoAdv(loc);
}

function lowkey_zoneUnlocks(): boolean {
  return runTaskChain([
    // opens The Old Landfill for scrap metal key (+20% to all Moxie Gains)
    startHippyBoatmanSubQuestTask,
    // opens Madness Bakery for deep-fried key (+3 sleaze res, +15 sleaze dmg, +30 sleaze spell dmg)
    startArmorySubQuestTask,
    // opens The Skeleton Store for actual skeleton key (100 DA, 10 DR)
    startMeatsmithSubQuestTask,
    finishMeatsmithSubQuestTask,
  ]);
}

function LX_findHelpfulLowKey(): boolean {
  if (!in_lowkeysummer()) {
    return false;
  }

  if (internalQuestStatus("questL13Final") !== 5) {
    return false;
  }

  if (lowkey_zoneUnlocks()) {
    return true;
  }
  // mainstat
  if (myLevel() < 13) {
    // needs knob lab access
    if (
      myPrimestat() === $stat`Muscle` &&
      lowkey_keyAdv($item`knob labinet key`)
    ) {
      return true;
    }
    // needs accept landfil quest
    if (
      myPrimestat() === $stat`Moxie` &&
      (LX_hippyBoatman() || lowkey_keyAdv($item`scrap metal key`))
    ) {
      return true;
    }
    // Needs Pandamonium access
    if (
      myPrimestat() === $stat`Mysticality` &&
      lowkey_keyAdv($item`demonic key`)
    ) {
      return true;
    }
  }
  // familiar weight
  if (!possessEquipment($item`black rose key`)) {
    if (myBuffedstat($stat`Moxie`) < monsterAttack($monster`skeletal cat`)) {
      //conservatory is available when very underleveled so going there this early can be dangerous
      buffMaintain$2($effect`Vital`);
    }
    if (lowkey_keyAdv($item`black rose key`)) {
      return true;
    }
  }
  // -combat. Key sausage needs Cobb's Knob Access
  if (lowkey_keyAdv($item`key sausage`)) {
    return true;
  }
  // +item
  // Treasure chest key needs Belowdecks access
  if (lowkey_keyAdv($item`treasure chest key`)) {
    return true;
  }
  // +meat. Knob treasury key needs Cobb's Knob Access. Kekekey needs The Valley of Rof L'm Fao access.
  if (lowkey_keyAdv($item`kekekey`)) {
    return true;
  }
  if (
    myPrimestat() !== $stat`Mysticality` ||
    possessEquipment($item`demonic key`)
  ) {
    // all these locations unlock at the same time but for a myst class we should only get
    //  the -combat key from Cobb's Knob (above) to speed up the friars before we have the +20% myst xp key
    // +adv. Knob shaft skate key needs Cobb's Knob lab key for access to Knob Shaft
    if (lowkey_keyAdv($item`knob shaft skate key`)) {
      return true;
    }
    //will probably get Cobb's Knob lab key here if still missing it
    if (lowkey_keyAdv($item`knob treasury key`)) {
      return true;
    }
    // Knob labinet key to unlock Menagerie. needs Cobb's Knob lab key for access to the lab
    if (
      itemAmount($item`Cobb's Knob Menagerie key`) < 1 &&
      lowkey_keyAdv($item`knob labinet key`)
    ) {
      return true;
    }
  }

  if (
    internalQuestStatus("questL08Trapper") === 1 &&
    itemAmount($item`goat cheese`) < 3
  ) {
    // food drop key for Goatlet
    if (lowkey_keyAdv($item`anchovy can key`)) {
      return true;
    }
  }

  if (
    internalQuestStatus("questL09Topping") > 0 &&
    internalQuestStatus("questL09Topping") < 3
  ) {
    // +ml (before oil peak)
    // F'c'le sh'c'le k'y needs F'c'le access
    if (lowkey_keyAdv($item`f'c'le sh'c'le k'y`)) {
      return true;
    }
    // Clown car key needs "Fun" house access, may be delayed for shen
    if (lowkey_keyAdv($item`clown car key`)) {
      return true;
    }
    // cold res before aboo. Needs Icy Peak Access
    if (lowkey_keyAdv($item`ice key`)) {
      return true;
    }
    // spooky res before aboo. Needs Menagerie access.
    if (lowkey_keyAdv($item`weremoose key`)) {
      return true;
    }
  }
  // sleaze damage before red zeppelin
  if (
    internalQuestStatus("questL11Ron") > -1 &&
    internalQuestStatus("questL11Ron") < 2
  ) {
    if (lowkey_keyAdv($item`deep-fried key`)) {
      return true;
    }
    // Clown car key needs "Fun" house access, may be delayed for shen
    if (lowkey_keyAdv($item`clown car key`)) {
      return true;
    }
  }
  // cold spell damage before orcs. Ice Key needs The Icy Peak access
  if (
    internalQuestStatus("questL09Topping") === 0 &&
    get("chasmBridgeProgress") < bridgeGoal()
  ) {
    if (lowkey_keyAdv($item`ice key`)) {
      return true;
    }
  }
  // +combat before sonofa or pirate insults. Music Box Key needs Spookyraven Manor third floor access
  if (internalQuestStatus("questM12Pirate") === 4 && numPirateInsults() < 6) {
    if (lowkey_keyAdv($item`music box key`)) {
      return true;
    }
  }
  //unlocking third floor access and Music Box Key will both be called directly when about to do sonofa

  return false;
}

export function L13_sorceressDoorLowKey(): boolean {
  if (!in_lowkeysummer()) {
    return false;
  }

  if (internalQuestStatus("questL13Final") !== 5) {
    return false;
  }

  const loc: Location = lowkey_nextAvailableKeyLocation();

  if (loc === $location.none) {
    const remaining: number = lowkey_keysRemaining();
    if (remaining > 0) {
      auto_log_warning("Unable to adventure for remaining low keys");
      let needHigherLevelForKey: boolean = true;
      for (const key of lowKeys.keys()) {
        if (lowkey_needKey(key)) {
          auto_log_warning(`${lowKeys.get(key) ?? $location.none}: ${key}`);
          if (
            myLevel() >=
            lowkey_levelNeededToUnlockZone(lowKeys.get(key) ?? $location.none)
          ) {
            needHigherLevelForKey = false;
          }
        }
      }
      if (myLevel() < 11 && needHigherLevelForKey) {
        return false;
      } else {
        abort("Please unlock zones manually and try again.");
      }
    }
    // Unlock door
    council(); // make sure all quests have been handed in or turning the door knob will be blocked.
    if (
      getProperty("questL11MacGuffin") !== "finished" ||
      getProperty("questL12War") !== "finished"
    ) {
      // should not start consuming the keys if any quests got held up somehow
      return false;
    }
    if (towerDoor()) {
      return true;
    }
    return false;
  }

  return autoAdv(loc);
}

export const LX_findHelpfulLowKeyTask: QuestTask = registerQuestTask({
  name: "LX_findHelpfulLowKey",
  completed: () => !in_lowkeysummer(),
  ready: () => true,
  do: LX_findHelpfulLowKey,
  locations: () => Array.from(lowKeys.values()),
});

// Myst classes want access to Pandamonium Slums to find the demonic key (+20% to all Mysticality Gains).
// Mus classes want access to the laboratory to find the Knob labinet key (+20% to all Muscle Gains).
function lowkeySummer_mainstatQuestPriority(): boolean {
  if (myLevel() < 12) {
    if (
      myPrimestat() === $stat`Mysticality` &&
      possessEquipment($item`key sausage`)
    ) {
      // Get the -combat key first.
      if (
        !possessEquipment($item`demonic key`) &&
        myBuffedstat($stat`Moxie`) < monsterAttack($monster`Hellion`)
      ) {
        //starting the level 6 quest as early as possible can be dangerous?
        buffMaintain$2($effect`Vital`);
      }
      if (L6_friarsGetParts()) {
        return true;
      }
    } else if (
      myPrimestat() === $stat`Muscle` &&
      itemAmount($item`Cobb's Knob lab key`) === 0
    ) {
      // Have already gone after Key sausage and Knob treasury key by now, if still missing lab key give priority to the Knob
      if (L5_slayTheGoblinKing()) {
        return true;
      }
    }
  }
  return false;
}

export const lowkeySummer_mainstatQuestPriorityTask: QuestTask =
  registerQuestTask({
    name: "lowkeySummer_mainstatQuestPriority",
    completed: () => !in_lowkeysummer(),
    ready: () => true,
    do: lowkeySummer_mainstatQuestPriority,
  });

const lowkeySummer_hiddenTempleIfLuckyLindyTask: QuestTask = registerQuestTask({
  name: "lowkeySummer_hiddenTempleIfLuckyLindy",
  completed: () => !in_lowkeysummer(),
  ready: () => true,
  do: () =>
    canDrinkSpeakeasyDrink($item`Lucky Lindy`) && LX_unlockHiddenTemple(),
});

// Get the -combat key before attempting the Friars or the Spooky Forest. Unlocking hidden temple is only a priority for possible rollover lucky lindy since SemiRare no longer exist
function lowkeySummer_keySausageZones(): boolean {
  if (possessEquipment($item`key sausage`)) {
    if (
      runTaskChain([
        L6_friarsGetPartsTask,
        L2_mosquitoTask,
        LX_unlockHauntedLibraryTask,
        lowkeySummer_hiddenTempleIfLuckyLindyTask,
        LX_getLadySpookyravensDancingShoesTask,
        LX_getLadySpookyravensPowderPuffTask,
      ])
    ) {
      return true;
    }
  }
  return false;
}

export const lowkeySummer_keySausageZonesTask: QuestTask = registerQuestTask({
  name: "lowkeySummer_keySausageZones",
  completed: () => !in_lowkeysummer(),
  ready: () => true,
  do: lowkeySummer_keySausageZones,
});

// Not split into task-order entries yet: the questM20Necklace check below exits
// this whole block unconditionally once its guard matches, buggy but unresolved,
// so splitting further needs that fixed first.
function LX_lowkeySummerRemainderDo(): boolean {
  // If we have the resources to do the Haunted Kitchen in the minimum adventures, we should do it sooner
  // TODO this is bugged because it can exit the path file, but fixing directly can result in resistance provider constantly switching familiars and wasting a ton of time
  if (internalQuestStatus("questM20Necklace") === 0) {
    return LX_unlockHauntedBilliardsRoom(true);
  }

  if (internalQuestStatus("questL12War") > -1) {
    // Don't start the war unless we've acquired the key from Belowdecks first as it gives +item.
    // TODO these aren't the full L12 tasks, could filthworms earlier here if Yellow Ray available
    if (possessEquipment($item`treasure chest key`)) {
      if (
        runTaskChain([L12_preOutfitTask, L12_getOutfitTask, L12_startWarTask])
      ) {
        return true;
      }
    } else {
      // Make sure Belowdecks is open so we can get the key.
      if (LX_pirateQuest()) {
        return true;
      }
    }

    L12_flyerFinish(); // Finish flyers whenever possible.
    // Get the +combat key before attempting Sonofa Beach.
    if (possessEquipment($item`music box key`)) {
      if (runTaskChain([L12_sonofaBeachTask, L12_sonofaFinishTask])) {
        return true;
      }
    } else {
      // Make sure Spookyraven Third Floor is open so we can get the key.
      if (
        runTaskChain([
          LX_spookyravenManorFirstFloorTask,
          LX_spookyravenManorSecondFloorTask,
        ])
      ) {
        return true;
      }
      if (
        internalQuestStatus("questL12War") === 1 &&
        getProperty("sidequestLighthouseCompleted") === "none"
      ) {
        if (lowkey_keyAdv($item`music box key`)) {
          return true;
        }
      }
    }
    // Check our meat accessories, grab +meat keys before attempting Themthar Hills if they'll help.
    let n_meat_drop_acc_50plus: number = 0;
    for (const [it, n] of auto_getAllEquipabble($slot`acc1`)) {
      if (
        numericModifier(it, $modifier`Meat Drop`) >= 45 ||
        it === $item`backup camera`
      ) {
        // backup camera isn't always meat
        n_meat_drop_acc_50plus += n;
      }
    }
    if (n_meat_drop_acc_50plus >= 2) {
      if (L12_themtharHills()) {
        return true;
      }
    } else if (
      !get("auto_skipNuns", false) &&
      (get("hippiesDefeated") >= 192 || get("auto_hippyInstead", false))
    ) {
      // about to do nuns. Make sure The Valley is open so we can get the Kekekey.
      // opening Cobb's Knob so we can get the treasury key is already done at higher priority
      if (runTaskChain([L9_chasmBuildTask, L9_highLandlordTask])) {
        return true;
      }
    }
    // Do the rest of the war. Should have the +item key already before we start the war.
    if (
      runTaskChain([
        L12_gremlinsTask,
        L12_filthwormsTask,
        L12_orchardFinalizeTask,
        L12_farmTask,
        L12_clearBattlefieldTask,
        L12_finalizeWarTask,
      ])
    ) {
      return true;
    }
  }
  // Start the macguffin quest as we need it to unlock Belowdecks.
  if (
    runTaskChain([
      L11_blackMarketTask,
      L11_forgedDocumentsTask,
      L11_mcmuffinDiaryTask,
      L11_getBeehiveTask,
    ])
  ) {
    return true;
  }
  // Lock in the Shen zones as soon as we can.
  if (L11_shenStartQuest()) {
    return true;
  }
  // Shen can still block Clown car key after zones are locked in if we don't chase the Snakeleton here
  if (
    internalQuestStatus("questG04Nemesis") < 5 &&
    shenShouldDelayZone($location`The Unquiet Garves`) &&
    L11_shenCopperhead()
  ) {
    return true;
  }
  // If the +item key is within reach before the Peaks open Belowdecks for it
  if (internalQuestStatus("questL11MacGuffin") >= 2 && LX_pirateQuest()) {
    return true;
  }

  if (internalQuestStatus("questL09Topping") > -1) {
    // Get the Sleaze res key before doing the Orcs for better Blech
    if (lowkey_keyAdv($item`deep-fried key`)) {
      return true;
    }
    // Get the Cold Damage key before doing the Orcs
    // This gets blocked by the Shen softlock so do it as soon as we feasibly can as one of the +meat keys requires the L9 quest finished.
    if (possessEquipment($item`ice key`)) {
      if (L9_chasmBuild()) {
        return true;
      }
    } else {
      // Make sure the Icy Peak is available so we can get the key
      if (L8_trapperQuest()) {
        return true;
      }
    }
    // Get the ML keys before doing Oil peak and Spooky Res key before doing Aboo Peak (should have Cold Res key already for the Orc Chasm).
    // Get +item key before the Peaks if questL11MacGuffin already allows it
    if (
      possessEquipment($item`f'c'le sh'c'le k'y`) &&
      possessEquipment($item`clown car key`) &&
      possessEquipment($item`weremoose key`)
    ) {
      if (L9_highLandlord()) {
        return true;
      }
    } else {
      // Make sure the F'c'le is open so we can get the key. Once gathering insults do it on the way to the Peg key before doing it in the barrr
      if (
        LX_pirateOutfit() ||
        (itemAmount($item`The Big Book of Pirate Insults`) > 0 &&
          lowkey_keyAdv($item`peg key`)) ||
        LX_joinPirateCrew()
      ) {
        return true;
      }
      // Make sure the "Fun" House is open so we can get the key
      if (LX_acquireEpicWeapon()) {
        return true;
      }
    }
  }

  if (internalQuestStatus("questL11MacGuffin") > -1) {
    // +item helps with getting fulminate ingredients, Hidden City drops and Copperhead/Zeppelin.
    if (!possessEquipment($item`treasure chest key`)) {
      // Make sure Belowdecks is open so we can get the key.
      if (LX_pirateQuest()) {
        return true;
      }
    }
    if (
      runTaskChain([
        // open the hidden temple if it hasn't been done yet
        LX_unlockHiddenTempleTask,
        // open the hidden city up.
        L11_unlockHiddenCityTask,
      ])
    ) {
      return true;
    }
    // Dance with lady spookyraven so we can go murder her undead husband and take the Eye of Ed
    if (
      runTaskChain([
        LX_spookyravenManorFirstFloorTask,
        LX_spookyravenManorSecondFloorTask,
      ])
    ) {
      return true;
    }
    // food drop key before Eye of Ed for the blasting soda
    if (lowkey_keyAdv($item`anchovy can key`)) {
      return true;
    }
    // Murder pygmies for the ancient amulet.
    if (runTaskChain([L11_hiddenCityZonesTask, L11_hiddenCityTask])) {
      return true;
    }
    // Finish the other Macguffin zones so we can beat Ed to death repeatedly and waste all his Ka coins.
    if (L11_aridDesert()) {
      return true;
    }
    if (possessEquipment($item`treasure chest key`)) {
      if (
        runTaskChain([
          L11_talismanOfNamTask,
          L11_mauriceSpookyravenTask,
          L11_palindomeTask,
          L11_unlockPyramidTask,
        ])
      ) {
        return true;
      }
    }
    // should do the tavern before trying to do the pyramid so we can use any tangles we get lucky with.
    // Clown car key for tavern noncombats. needs "Fun" house access
    if (lowkey_keyAdv($item`clown car key`)) {
      return true;
    }
    if (internalQuestStatus("questL03Rat") > 2) {
      if (
        runTaskChain([
          L11_unlockUpperChamberTask,
          L11_unlockMiddleChamberTask,
          L11_defeatEdTask,
        ])
      ) {
        return true;
      }
    } else {
      set("auto_forceTavern", true);
      if (L3_tavern()) {
        return true;
      }
    }
  }
  // Open up the top of the beanstalk.
  if (L10_plantThatBean()) {
    //tries L4_batCave() itself if it needs to
    return true;
  }
  // Should have the -combat key long before level 10 but lets just make sure.
  if (possessEquipment($item`key sausage`)) {
    if (
      runTaskChain([
        L10_airshipTask,
        L10_basementTask,
        L10_groundTask,
        L10_topFloorTask,
        L10_holeInTheSkyUnlockTask,
      ])
    ) {
      return true;
    }
  } // Make sure Cobb's Knob is open so we can get the key is already done at higher priority
  if (
    runTaskChain([
      // Ascend the peak.
      L8_trapperQuestTask,
      // -combat and ML keys help with 2 of these zones but this quest is a monolithic function.
      // TODO: split it up into zones then guard with possession of keys.
      L7_cryptTask,
      // Finish off the Goblin King.
      L5_slayTheGoblinKingTask,
      // Show the Boss bat who's boss.
      L4_batCaveTask,
    ])
  ) {
    return true;
  }
  // Fix that dripping tap.
  // Clown car key for tavern noncombats. needs "Fun" house access, may be delayed for shen
  if (lowkey_keyAdv($item`clown car key`)) {
    return true;
  }
  if (runTaskChain([LX_acquireEpicWeaponTask, L3_tavernTask])) {
    return true;
  }
  // this quest and these zones are open either from the start or level 4.
  // so lets do this if we have nothing better to do yet.
  if (
    possessEquipment($item`aquí`) &&
    possessEquipment($item`batting cage key`)
  ) {
    if (LX_unlockHauntedBilliardsRoom()) {
      return true;
    }
  } else {
    if (internalQuestStatus("questM20Necklace") === 0) {
      // hot res for the Haunted Kitchen. aquí needs Desert Beach Access
      if (lowkey_keyAdv($item`aquí`)) {
        return true;
      }
      // stench res for the Haunted Kitchen
      if (lowkey_keyAdv($item`batting cage key`)) {
        return true;
      }
    }
  }
  // open the hidden temple if not already done at higher priority and not still waiting for the -combat key
  if (possessEquipment($item`key sausage`) && LX_unlockHiddenTemple()) {
    return true;
  }
  // Spookyraven quest steps that don't need -combat or resists, just monster killin' (or dancing with a ghost for stats).
  if (
    runTaskChain([
      LX_danceWithLadySpookyravenTask,
      LX_getLadySpookyravensFinestGownTask,
      LX_unlockManorSecondFloorTask,
    ])
  ) {
    return true;
  }

  if (
    runTaskChain([
      // This is a mess and if it's not last, it screws up the war massively.
      L12_clearBattlefieldTask,
      // Stuff we need to do in this path to unlock key zones.
      LX_pirateQuestTask,
      LX_acquireEpicWeaponTask,
    ])
  ) {
    return true;
  }
  // If literally nothing better to do, go find some of the keys we don't actually care about but have to find anyway.
  const loc: Location = lowkey_nextAvailableKeyLocation();
  if (loc !== $location.none && autoAdv(loc)) {
    return true;
  }
  if (
    runTaskChain([
      // Make sure to unlock Menagerie if it wasn't done while getting Knob labinet key
      LX_unlockKnobMenagerieTask,
      // Make sure to go to war
      L12_lastDitchFlyerTask,
    ])
  ) {
    return true;
  }
  // unlock the door, climb the tower, commit sorceresscide.
  if (
    runTaskChain([
      L13_sorceressDoorTask,
      L13_towerNSTowerTask,
      L13_towerNSNagamarTask,
      L13_towerNSFinalTask,
    ])
  ) {
    return true;
  }

  if (myLevel() < 12) {
    //level 13 not needed for sorceress access
    if (LX_attemptPowerLevel()) {
      return true;
    }
  }

  auto_log_warning(
    "Reached the end of LX_lowkeySummer task without managing to do anything. This should probably never happen.",
    "red",
  );
  return false;
}

export const LX_lowkeySummerRemainderTask: QuestTask = registerQuestTask({
  name: "LX_lowkeySummerRemainder",
  completed: () => !in_lowkeysummer(),
  ready: () => true,
  do: LX_lowkeySummerRemainderDo,
});
