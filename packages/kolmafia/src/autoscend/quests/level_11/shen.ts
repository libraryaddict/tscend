import {
  cliExecute,
  containsText,
  haveEffect,
  haveEquipped,
  indexOf,
  isBanished,
  Item,
  itemAmount,
  Location,
  myDaycount,
  myLevel,
  myMeat,
  myTurncount,
  splitString,
  substring,
  toInt,
  toLocation,
  use,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $phylum,
  get,
  set,
} from "libram";

import { ArchSpade, Snapper, SwordOfSwords } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { handleFamiliar$1 } from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { uneffect } from "../../auto_restore";
import { canBurnDelay } from "../../auto_routing";
import {
  auto_abort,
  auto_canForceNextCombat,
  auto_haveCombatForceSource,
  auto_haveQueuedForcedCombat,
  auto_log_info,
  internalQuestStatus,
} from "../../auto_util";
import { zone_isAvailable } from "../../auto_zone";
import {
  isAvailable,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../../engine/engine";
import {
  isActuallyEd,
  L9_ed_chasmStart,
} from "../../paths/2015/actually_ed_the_undying";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
} from "../../paths/2024/wereprofessor";
import { maximizer } from "../../utils/maximizer";
import { L8_trapperNinjaLair } from "../level_08";
import { L9_chasmBuild } from "../level_09";
import { L10_holeInTheSkyUnlockTask, L10_topFloorTask } from "../level_10";

//Defined in autoscend/quests/level_11.ash
function shenItemsReturnedOrInProgress(): number {
  const progress: number = internalQuestStatus("questL11Shen");
  if (progress < 1) {
    return 0;
  }
  if (progress < 3) {
    return 1;
  } else if (progress < 5) {
    return 2;
  } else {
    return 3;
  }
}

export function shenSnakeLocations(
  day: number,
  n_items_returned: number,
): Location[] {
  // Returns the locations in which we will find snakes for Shen, on a particular day.
  // From https://kol.coldfront.net/thekolwiki/index.php/Shen_Copperhead,_Nightclub_Owner
  const batsnake = $locations`The Batrat and Ratbat Burrow`;
  const frozen = $locations`Lair of the Ninja Snowmen`;
  const burning = $locations`The Castle in the Clouds in the Sky (Top Floor)`;
  const ten_heads = $locations`The Hole in the Sky`;
  const frattle = $locations`The Smut Orc Logging Camp`;
  const snakleton = $locations`The Unquiet Garves, The VERY Unquiet Garves`;

  // The three snakes for the current day, in the order Shen assigns them.
  let snakes: Location[][] = [];

  if (in_koe()) {
    snakes = [ten_heads, frattle, frozen];
  } else {
    switch (day) {
      case 1:
        snakes = [batsnake, frozen, burning];
        break;
      case 2:
        snakes = [frattle, snakleton, ten_heads];
        break;
      case 3:
        snakes = [frozen, batsnake, snakleton];
        break;
      case 4:
        snakes = [frattle, batsnake, snakleton];
        break;
      case 5:
        snakes = [burning, frattle, ten_heads];
        break;
      case 6:
        snakes = [burning, batsnake, ten_heads];
        break;
      case 7:
        snakes = [frattle, snakleton, ten_heads];
        break;
      case 8:
        snakes = [snakleton, burning, frattle];
        break;
      case 9:
        snakes = [snakleton, frattle, ten_heads];
        break;
      case 10:
        snakes = [ten_heads, batsnake, burning];
        break;
      case 11:
        snakes = [frozen, batsnake, burning];
        break;
    }
  }

  return snakes.flatMap((l) => l).slice(n_items_returned);
}

function shenZonesToAvoidBecauseMaybeSnake(): Location[] {
  if (get("shenInitiationDay") > 0) {
    const day: number = get("shenInitiationDay");
    const items_returned: number = shenItemsReturnedOrInProgress();
    return shenSnakeLocations(day, items_returned);
  } else {
    // Assume we're going to start Shen today, tomorrow, or two days from now.
    const zones_to_avoid: Set<Location> = new Set();
    if (myLevel() < 11) {
      //if level 10, assume shen today or tomorrow, otherwise up to two days from now
      const beforeThatDay: number = myLevel() >= 10 ? 2 : 3;
      for (let day: number = 0; day < beforeThatDay; day++) {
        for (const z of shenSnakeLocations(day + myDaycount(), 0)) {
          zones_to_avoid.add(z);
        }
      }
    } else {
      // if we're already level 11, well either be starting ASAP
      for (const z of shenSnakeLocations(myDaycount(), 0)) {
        zones_to_avoid.add(z);
      }
    }
    // if ran out of stuff to do and need to get enchanted bean for L10 quest, don't delay for bat snake
    if (
      internalQuestStatus("questL10Garbage") === 0 &&
      get("auto_delayLastLevel", 0) === 10 &&
      itemAmount($item`enchanted bean`) === 0
    ) {
      zones_to_avoid.delete($location`The Batrat and Ratbat Burrow`);
    }
    // don't delay Hole in the Sky in WereProf if ran out of stuff to do
    if (
      get("auto_powerLevelLastAttempted", 0) === myTurncount() &&
      in_wereprof()
    ) {
      zones_to_avoid.delete($location`The Hole in the Sky`);
    }

    return [...zones_to_avoid];
  }
}

export function shenShouldDelayZone(loc: Location): boolean {
  return (
    shenZonesToAvoidBecauseMaybeSnake().includes(loc) && !isAboutToPowerlevel()
  ); // don't bother with delaying a Shen zone if we've run out of stuff to do
}

export function getShenZonesTurnsSpent(): Map<Location, number> {
  const delayValues: Map<Location, number> = new Map();
  if (get("auto_shenZonesTurnsSpent") !== "") {
    const zones: Map<number, string> = new Map(
      splitString(get("auto_shenZonesTurnsSpent"), ";").map((_v, _i) => [
        _i,
        _v,
      ]),
    );
    for (const [, zone] of zones) {
      const loc: Location = toLocation(substring(zone, 0, indexOf(zone, ":")));
      const turns_spent: number = toInt(
        substring(zone, indexOf(zone, ":") + 1),
      );
      delayValues.set(loc, turns_spent);
    }
  }
  return delayValues;
}

function L11_shenStartQuestDo(): boolean {
  // as the first adventure in the Copperhead Club is always the first Shen NC
  // we can adventure there once as soon as it's open to start the quest and lock in
  // our zones
  auto_log_info(
    "Going to see the World's Biggest Jerk about some snakes and stones and stuff.",
    "blue",
  );
  if (autoAdv($location`The Copperhead Club`)) {
    if (internalQuestStatus("questL11Shen") === 1) {
      auto_log_info("It seems Shen has given us a quest.", "blue");
      auto_log_info(
        "I am going to avoid the following zones until Shen tells me to go there or until I run out of other things to do:",
      );
      let linec: number = 1;
      for (const z of shenZonesToAvoidBecauseMaybeSnake()) {
        auto_log_info(`${linec++}. ${z}`);
        set(
          "auto_shenZonesTurnsSpent",
          `${get("auto_shenZonesTurnsSpent")}${z}:${z.turnsSpent};`,
        );
      }
      set("auto_lastShenTurn", $location`The Copperhead Club`.turnsSpent);
    }
    return true;
  }
  return false;
}

const L11_shenStartQuestTask: QuestTask = registerQuestTask({
  name: "L11_shenStartQuest",
  completed: () => internalQuestStatus("questL11Shen") > 0,
  ready: () =>
    internalQuestStatus("questL11Shen") === 0 &&
    (!in_wereprof() || is_werewolf()),
  do: L11_shenStartQuestDo,
  locations: $location`The Copperhead Club`,
  desiredEncounters: () => [
    {
      item: $item`crappy waiter disguise`,
      needAmount: !in_tcrs()
        ? // terrible check
          5 - itemAmount($item`crappy waiter disguise`)
        : 0,
    },
  ],
});

function L11_shenWaiterNC():
  "lantern" | "cocktails" | "ice bucket" | "diamond" {
  // default to getting unnamed cocktails to turn into Flamin' Whatsisnames.
  if (
    itemAmount($item`priceless diamond`) > 0 ||
    itemAmount($item`Red Zeppelin ticket`) > 0 ||
    myMeat() > 10000 ||
    (internalQuestStatus("questL11Shen") === 6 &&
      itemAmount($item`unnamed cocktail`) > 0)
  ) {
    if (get("copperheadClubHazard") !== "lantern") {
      // got priceless diamond or zeppelin ticket (or we are rich) so lets burn the place down (and make Flamin' Whatsisnames)
      return "lantern";
    }
  } else if (
    haveEquipped($item`candy cane sword cane`) &&
    itemAmount($item`priceless diamond`) === 0 &&
    itemAmount($item`Red Zeppelin ticket`) === 0
  ) {
    return "diamond";
  } else {
    if (get("copperheadClubHazard") !== "ice") {
      // knock over the ice bucket & try for the priceless diamond.
      return "ice bucket";
    }
  }

  return "cocktails";
}

export function L11_shenStartQuest(): boolean {
  return runQuestTask(L11_shenStartQuestTask);
}

function L11_shenCopperheadDo(): boolean {
  if (L11_shenStartQuest()) {
    return true;
  }

  if (internalQuestStatus("questL11Shen") < 1) {
    // if we haven't spoke to Shen for the first time yet, don't try to handle the quest.
    return false;
  }

  if (isBanished($phylum`dude`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "dude");
    return false; //Probably should delay the Copperhead Club because dudes are important here
  }

  let zoneUnavailable = false;

  if (
    internalQuestStatus("questL11Shen") === 1 ||
    internalQuestStatus("questL11Shen") === 3 ||
    internalQuestStatus("questL11Shen") === 5
  ) {
    let it: Item = get("shenQuestItem");
    if (it === $item.none && isActuallyEd()) {
      // temp workaround until mafia bug is fixed - https://kolmafia.us/showthread.php?23742
      cliExecute("refresh quests");
      it = get("shenQuestItem");
    }
    let goal: Location = $location.none;
    switch (it) {
      case $item`The Stankara Stone`:
        goal = $location`The Batrat and Ratbat Burrow`;
        break;
      case $item`The First Pizza`:
        goal = $location`Lair of the Ninja Snowmen`;
        break;
      case $item`Murphy's Rancid Black Flag`:
        goal = $location`The Castle in the Clouds in the Sky (Top Floor)`;
        break;
      case $item`The Eye of the Stars`:
        goal = $location`The Hole in the Sky`;
        break;
      case $item`The Lacrosse Stick of Lacoronado`:
        goal = $location`The Smut Orc Logging Camp`;
        break;
      case $item`The Shield of Brook`:
        goal = $location`The Unquiet Garves`;
        break;
    }
    if (goal === $location.none) {
      auto_abort("Could not parse Shen event");
    }

    if (!zone_isAvailable(goal)) {
      // handle paths which don't need Tower keys but the World's Biggest Jerk asks for The Eye of the Stars
      if (
        goal === $location`The Hole in the Sky` &&
        (isAvailable(L10_topFloorTask) ||
          isAvailable(L10_holeInTheSkyUnlockTask))
      ) {
        if (!get("auto_holeinthesky", false)) {
          set("auto_holeinthesky", true);
        }
        return runTaskChain([L10_topFloorTask, L10_holeInTheSkyUnlockTask]);
      }
      zoneUnavailable = true;
    } else {
      // If we haven't completed the top floor, try to complete it.
      if (
        goal === $location`The Castle in the Clouds in the Sky (Top Floor)` &&
        runTaskChain([L10_topFloorTask, L10_holeInTheSkyUnlockTask])
      ) {
        return true;
      } else if (
        goal === $location`The Smut Orc Logging Camp` &&
        (L9_ed_chasmStart() || L9_chasmBuild())
      ) {
        return true;
      } else if (ArchSpade.wantToSpadeDigSkeleton(goal)) {
        return ArchSpade.spadeDigSkeleton(goal);
      }
      // similar if statements exist in the L8 quest file (see comments over there)
      // before delayburn because we *want* to fight NSAs if we're going ninja lair, not avoid them by burning delay
      if (goal === $location`Lair of the Ninja Snowmen`) {
        if (auto_canForceNextCombat() || auto_haveQueuedForcedCombat()) {
          if (L8_trapperNinjaLair()) {
            return true;
          }
        }
        if (
          Math.trunc(internalQuestStatus("questL08Trapper")) === 2 &&
          auto_haveCombatForceSource() &&
          !isAboutToPowerlevel() &&
          !get("auto_L8_extremeInstead", false)
        ) {
          zoneUnavailable = true;
        }
      }
      if (canBurnDelay(goal)) {
        // Snakes have variable delay of 3-5 adventures but we can burn at least 3 of that.
        zoneUnavailable = true;
      }

      if (!zoneUnavailable) {
        return autoAdv(goal);
      }
    }
  }

  const meetings = Math.floor(internalQuestStatus("questL11Ron") / 2);
  const turnsUntilMeeting =
    (meetings + 1) * 5 - $location`The Copperhead Club`.turnsSpent;

  if (
    internalQuestStatus("questL11Shen") === 2 ||
    internalQuestStatus("questL11Shen") === 4 ||
    internalQuestStatus("questL11Shen") === 6 ||
    (internalQuestStatus("questL11Shen") < 6 && turnsUntilMeeting > 1)
  ) {
    if (SwordOfSwords.copierShouldDelayZone($locations`The Copperhead Club`)) {
      return false;
    }
    if (is_professor()) {
      return false; //can't do Copperhead Club as a Professor but can do other parts of Shen quest
    }
    if (
      itemAmount($item`crappy waiter disguise`) > 0 &&
      haveEffect($effect`Crappily Disguised as a Waiter`) === 0 &&
      !in_tcrs()
    ) {
      use(1, $item`crappy waiter disguise`);
      const behindtheStacheOption =
        ["gong", "ice bucket", "lantern", "cocktails", "diamond"].indexOf(
          L11_shenWaiterNC(),
        ) + 1;
      set("choiceAdventure855", behindtheStacheOption);
    }

    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      Snapper.changeSnapperPhylum($phylum`dude`);
    }
    // monster level increases zone damage
    maximizer.weight($modifier`Monster Level`, -10);
    uneffect($effect`Ur-Kel's Aria of Annoyance`);
    if (autoAdv($location`The Copperhead Club`)) {
      if (containsText(get("lastEncounter"), "Shen Copperhead, ")) {
        set("auto_lastShenTurn", $location`The Copperhead Club`.turnsSpent);
      }
      return true;
    }
    return false;
  }

  if (zoneUnavailable) return false;

  if (internalQuestStatus("questL11Shen") < 8) {
    auto_abort(
      `Shen should be done with but tracking is not complete! Status: ${get("questL11Shen")}`,
    );
  }
  //Now have a Copperhead Charm
  return false;
}

export const L11_shenCopperheadTask: QuestTask = registerQuestTask({
  name: "L11_shenCopperhead",
  completed: () => internalQuestStatus("questL11Shen") > 7,
  ready: () => internalQuestStatus("questL11Shen") >= 0 && !is_professor(),
  do: L11_shenCopperheadDo,
  desiredEncounters: () => {
    const it: Item = get("shenQuestItem");
    return [
      {
        item: it,
        needAmount: it !== $item.none && itemAmount(it) === 0 ? 1 : 0,
      },
    ];
  },
});

export function L11_shenCopperhead(): boolean {
  return runQuestTask(L11_shenCopperheadTask);
}
