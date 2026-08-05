import {
  abort,
  cliExecute,
  council,
  equippedItem,
  getProperty,
  haveSkill,
  hiddenTempleUnlocked,
  inHardcore,
  Item,
  itemAmount,
  Location,
  myBasestat,
  myDaycount,
  myMp,
  myPrimestat,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $skill,
  $slot,
  get,
} from "libram";

import { autoAdv } from "../auto_adventure";
import { autoEquipToSlot } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_forceNextNoncombat,
  auto_log_debug,
  auto_log_info,
  auto_roughExpectedTurnsLeftToday,
  baseNCForcesToday,
  internalQuestStatus,
  isGuildClass,
  turnsUsedByRemainingNCForcesToday,
} from "../auto_util";
import { QuestTask, registerQuestTask, runQuestTask } from "../engine/engine";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { fantasyRealmToken } from "../iotms/mr2018";
import { auto_copierShouldDelayZone } from "../iotms/mr2026";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_gnoob } from "../paths/gelatinous_noob";
import { LX_doingPirates } from "./optional";

//Defined in autoscend/quests/level_06.ash
export function L6_friarsGetParts_condition_hardcore(): boolean {
  return inHardcore() && isGuildClass();
}

function L6_friarsGetPartsDo(): boolean {
  if (myMp() > 50 || considerGrimstoneGolem(true)) {
    handleBjornify($familiar`Grimstone Golem`);
  }

  if ($location`The Dark Heart of the Woods`.turnsSpent === 0) {
    visitUrl("friars.php?action=friars&pwd");
    if (isActuallyEd()) {
      // mafia bug doesn't update the quest property when visiting the Friars as Ed
      // see https://kolmafia.us/showthread.php?24912-minor-questL06Friar-isn-t-changed-to-step1-when-talking-to-the-Friars-as-Ed
      // not that it matters at all, the items we need and locations they're in are the same regardless.
      // but we can force it to update from the quest log
      cliExecute("refresh quests");
    }
  }

  if (equippedItem($slot`shirt`) === $item`tunac`) {
    autoEquipToSlot($slot`shirt`, Item.none);
  }

  if (
    auto_have_familiar($familiar`Space Jellyfish`) &&
    get("_spaceJellyfishDrops") < 2
  ) {
    handleFamiliar$1($familiar`Space Jellyfish`);
  }

  if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
    if (
      !haveSkill($skill`Frown Muscles`) &&
      itemAmount($item`bottle of novelty hot sauce`) === 0
    ) {
      handleFamiliar$1($familiar`Robortender`);
    }
  }
  // Don't burn all our NC forces early on d1 unless we are running low on turns.
  if (
    myDaycount() === 1 &&
    !isAboutToPowerlevel() &&
    !get("auto_getSteelOrgan", false)
  ) {
    const forced_loc: Location = get(
      "auto_forceNonCombatLocation",
      Location.none,
    );
    const forced_here: boolean =
      $locations`The Dark Neck of the Woods, The Dark Elbow of the Woods, The Dark Heart of the Woods`.includes(
        forced_loc,
      );
    const running_low_on_turns: boolean =
      auto_roughExpectedTurnsLeftToday() <
      10 + turnsUsedByRemainingNCForcesToday();
    // Probably need to make sure we still have other stuff to do? Softblock?
    // Could probably then make this run every day.
    const total_daily_forces: number = baseNCForcesToday();
    if (!forced_here && total_daily_forces > 0 && !running_low_on_turns) {
      auto_log_debug(
        "Friars: delaying to save NC forces for later today.",
        "blue",
      );
      return false;
    }
  }

  if (itemAmount($item`dodecagram`) === 0) {
    auto_log_info("Getting Dodecagram", "blue");
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The Dark Neck of the Woods`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel() &&
      !get("auto_getSteelOrgan", false)
    ) {
      return false;
    }
    return autoAdv($location`The Dark Neck of the Woods`);
  }
  if (itemAmount($item`eldritch butterknife`) === 0) {
    auto_log_info("Getting Eldritch Butterknife", "blue");
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The Dark Elbow of the Woods`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel() &&
      !get("auto_getSteelOrgan", false)
    ) {
      return false;
    }
    return autoAdv($location`The Dark Elbow of the Woods`);
  }
  if (itemAmount($item`box of birthday candles`) === 0) {
    if (
      get("auto_dakotaFanning", false) &&
      internalQuestStatus("questM16Temple") < 0
    ) {
      // if we have to do the "Dakota" Fanning quest to unlock the Hidden Temple,
      // delay adventuring in The Dark Heart of the Woods until the quest is started.
      return false;
    }
    auto_log_info("Getting Box of Birthday Candles", "blue");
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The Dark Heart of the Woods`,
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel() &&
      !get("auto_getSteelOrgan", false)
    ) {
      return false;
    }
    return autoAdv($location`The Dark Heart of the Woods`);
  }

  return runQuestTask(L6_friarsFinishTask);
}

export const L6_friarsGetPartsTask: QuestTask = registerQuestTask({
  name: "L6_friarsGetParts",
  completed: () => internalQuestStatus("questL06Friar") > 2,
  ready: () => internalQuestStatus("questL06Friar") >= 0,
  do: L6_friarsGetPartsDo,
  locations: $locations`The Dark Heart of the Woods, The Dark Elbow of the Woods, The Dark Neck of the Woods`,
  desiredEncounters: () =>
    [
      {
        item: $item`hot wing`,
        needAmount:
          LX_doingPirates() && internalQuestStatus("questM12Pirate") <= 2
            ? 3 - itemAmount($item`hot wing`)
            : 0,
      },
    ].filter((a) => a.needAmount > 0),
});

const L6_friarsFinishTask: QuestTask = registerQuestTask({
  name: "L6_friarsFinish",
  completed: () => internalQuestStatus("questL06Friar") > 2,
  ready: () => {
    if (
      itemAmount($item`dodecagram`) === 0 ||
      itemAmount($item`eldritch butterknife`) === 0 ||
      itemAmount($item`box of birthday candles`) === 0
    ) {
      return false;
    }
    if (
      auto_copierShouldDelayZone(
        $locations`The Dark Heart of the Woods, The Dark Elbow of the Woods, The Dark Neck of the Woods`,
      )
    ) {
      auto_log_debug(
        "Delaying L6 turn-in - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: () => {
    auto_log_info("Finishing friars", "blue");
    visitUrl("friars.php?action=ritual&pwd");
    council();
    return internalQuestStatus("questL06Friar") > 2;
  },
});

export function L6_friarsGetParts(): boolean {
  return runQuestTask(L6_friarsGetPartsTask);
}

function L6_dakotaFanningDo(): boolean {
  if (internalQuestStatus("questM16Temple") < 0) {
    if (myBasestat(myPrimestat()) < 35) {
      return false;
    }
    visitUrl("place.php?whichplace=woods&action=woods_dakota_anim");
    return true;
  }

  if (itemAmount($item`pellet of plant food`) === 0) {
    autoAdv($location`The Haunted Conservatory`);
    return true;
  }

  if (itemAmount($item`heavy-duty bendy straw`) === 0) {
    if (getProperty("questL06Friar") !== "finished") {
      autoAdv($location`The Dark Heart of the Woods`);
    } else {
      autoAdv($location`Pandamonium Slums`);
    }
    return true;
  }

  if (itemAmount($item`sewing kit`) === 0) {
    if (itemAmount($item`fat loot token`) > 0) {
      cliExecute(`make ${$item`sewing kit`}`);
    } else {
      return fantasyRealmToken();
    }
    return true;
  }

  visitUrl("place.php?whichplace=woods&action=woods_dakota");
  if (getProperty("questM16Temple") !== "finished") {
    abort("Could not finish Dakota Fanning quest, aborting.");
  }
  return true;
}

const L6_dakotaFanningTask: QuestTask = registerQuestTask({
  name: "L6_dakotaFanning",
  completed: () => hiddenTempleUnlocked() || !get("auto_dakotaFanning", false),
  ready: () => get("auto_dakotaFanning", false) && !hiddenTempleUnlocked(),
  do: L6_dakotaFanningDo,
  locations: $locations`The Haunted Conservatory, The Dark Heart of the Woods, Pandamonium Slums`,
  desiredEncounters: () =>
    [
      ...$items`pellet of plant food, heavy-duty bendy straw`.map((i) => ({
        item: i,
        needAmount: 1 - itemAmount(i),
      })),
      {
        item: $item`hot wing`,
        needAmount:
          LX_doingPirates() && internalQuestStatus("questM12Pirate") <= 2
            ? 3 - itemAmount($item`hot wing`)
            : 0,
      },
    ].filter((i) => i.needAmount > 0),
});

export function L6_dakotaFanning(): boolean {
  return runQuestTask(L6_dakotaFanningTask);
}
