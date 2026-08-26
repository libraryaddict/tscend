import {
  cliExecute,
  council,
  equippedItem,
  haveSkill,
  hiddenTempleUnlocked,
  inHardcore,
  itemAmount,
  Location,
  myBasestat,
  myDaycount,
  myMp,
  myPrimestat,
  turnsUntilForcedNoncombat,
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
  auto_abort,
  auto_forceNextNoncombatIfWorthIt,
  auto_log_debug,
  auto_log_info,
  auto_roughExpectedTurnsLeftToday,
  auto_shouldDelayForForcedNonCombat,
  baseNCForcesToday,
  internalQuestStatus,
  isGuildClass,
  safeGet,
  turnsUsedByRemainingNCForcesToday,
} from "../auto_util";
import {
  NoncombatForcing,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/2010/mr2014";
import { fantasyRealmToken } from "../iotms/2010/mr2018";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_gnoob } from "../paths/2017/gelatinous_noob";
import { LX_doingPirates } from "./optional";

//Defined in autoscend/quests/level_06.ash
export function L6_friarsGetParts_condition_hardcore(): boolean {
  return inHardcore() && isGuildClass();
}

export const L6_friarsTask: QuestTask = registerQuestTask({
  name: "L6_friarsGetParts",
  completed: () => internalQuestStatus("questL06Friar") > 2,
  ready: () => internalQuestStatus("questL06Friar") >= 0,
  do: () =>
    runTaskChain([
      L6_friarsGetNeckTask,
      L6_friarsGetElbowTask,
      L6_friarsGetHeartTask,
      L6_friarsFinishTask,
    ]),
});

const L6_friarsGetNeckTask: QuestTask = registerQuestTask(L6_friarsTask, {
  name: "L6_friarsGetNeck",
  completed: () => itemAmount($item`dodecagram`) > 0,
  ready: () => true,
  do: L6_friarsGetNeckDo,
  locations: $location`The Dark Neck of the Woods`,
  desiredEncounters: () => [
    {
      item: $item`hot wing`,
      needAmount:
        LX_doingPirates() && internalQuestStatus("questM12Pirate") <= 2
          ? 3 - itemAmount($item`hot wing`)
          : 0,
    },
  ],
  forcedNonCombats: () => {
    const location = $location`The Dark Neck of the Woods`;
    const queued = location.noncombatQueue.split("; ");
    const turnsUntil = turnsUntilForcedNoncombat(location);

    return [
      "How Do We Do It? Quaint and Curious Volume!",
      "Strike One!",
      "Olive My Love To You, Oh.",
      "Dodecahedrariffic!",
    ]
      .filter((name) => !queued.includes(name))
      .map(
        (name, index) =>
          ({
            name,
            turnsRequiredForSetup: 0,
            turnsSavedByForcedNC: index === 0 ? turnsUntil : 5,
          }) as NoncombatForcing,
      );
  },
});

const L6_friarsGetElbowTask: QuestTask = registerQuestTask(L6_friarsTask, {
  name: "L6_friarsGetElbow",
  completed: () => itemAmount($item`eldritch butterknife`) > 0,
  ready: () => true,
  do: L6_friarsGetElbowDo,
  locations: $location`The Dark Elbow of the Woods`,
  desiredEncounters: () => [
    {
      item: $item`hot wing`,
      needAmount:
        LX_doingPirates() && internalQuestStatus("questM12Pirate") <= 2
          ? 3 - itemAmount($item`hot wing`)
          : 0,
    },
  ],
  forcedNonCombats: () => {
    const location = $location`The Dark Elbow of the Woods`;
    const queued = location.noncombatQueue.split("; ");
    const turnsUntil = turnsUntilForcedNoncombat(location);

    return [
      "Moon Over the Dark Heart",
      "Running the Lode",
      "I, Martin",
      "Imp Be Nimble, Imp Be Quick",
    ]
      .filter((name) => !queued.includes(name))
      .map(
        (name, index) =>
          ({
            name,
            turnsRequiredForSetup: 0,
            turnsSavedByForcedNC: index === 0 ? turnsUntil : 5,
          }) as NoncombatForcing,
      );
  },
});

const L6_friarsGetHeartTask: QuestTask = registerQuestTask(L6_friarsTask, {
  name: "L6_friarsGetHeart",
  completed: () => itemAmount($item`box of birthday candles`) > 0,
  ready: () =>
    // if we have to do the "Dakota" Fanning quest to unlock the Hidden Temple,
    // delay adventuring in The Dark Heart of the Woods until the quest is started.
    !get("auto_dakotaFanning", false) ||
    internalQuestStatus("questM16Temple") >= 0,
  do: L6_friarsGetHeartDo,
  locations: $location`The Dark Heart of the Woods`,
  desiredEncounters: () => [
    {
      item: $item`hot wing`,
      needAmount:
        LX_doingPirates() && internalQuestStatus("questM12Pirate") <= 2
          ? 3 - itemAmount($item`hot wing`)
          : 0,
    },
  ],
  forcedNonCombats: () => {
    const location = $location`The Dark Heart of the Woods`;
    const queued = location.noncombatQueue.split("; ");
    const turnsUntil = turnsUntilForcedNoncombat(location);

    return [
      "Deep Imp Act",
      "Imp Art, Some Wisdom",
      "A Secret, But Not the Secret You're Looking For",
      "Butter Knife?  I'll Take the Knife",
    ]
      .filter((name) => !queued.includes(name))
      .map(
        (name, index) =>
          ({
            name,
            turnsRequiredForSetup: 0,
            turnsSavedByForcedNC: index === 0 ? turnsUntil : 5,
          }) as NoncombatForcing,
      );
  },
});

const L6_friarsFinishTask: QuestTask = registerQuestTask(L6_friarsTask, {
  name: "L6_friarsFinish",
  completed: () => false,
  ready: () =>
    $items`dodecagram, eldritch butterknife, box of birthday candles`.every(
      (i) => itemAmount(i) > 0,
    ),
  do: () => {
    auto_log_info("Finishing friars", "blue");
    visitUrl("friars.php?action=ritual&pwd");
    council();
    return internalQuestStatus("questL06Friar") > 2;
  },
});

function L6_friarsGetPartsSetup(): boolean {
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
    autoEquipToSlot($slot`shirt`, $item.none);
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
  const forced_loc: Location = safeGet("auto_forceNonCombatLocation");
  const forced_here: boolean =
    $locations`The Dark Neck of the Woods, The Dark Elbow of the Woods, The Dark Heart of the Woods`.includes(
      forced_loc,
    );
  // If we're about to force a non-combat, but it's not ready yet
  if (forced_here && auto_shouldDelayForForcedNonCombat(forced_loc)) {
    return false;
  }
  // Don't burn all our NC forces early on d1 unless we are running low on turns.
  if (
    !forced_here &&
    myDaycount() === 1 &&
    !isAboutToPowerlevel() &&
    !get("auto_getSteelOrgan", false)
  ) {
    const running_low_on_turns: boolean =
      auto_roughExpectedTurnsLeftToday() <
      10 + turnsUsedByRemainingNCForcesToday();
    // Probably need to make sure we still have other stuff to do? Softblock?
    // Could probably then make this run every day.
    const total_daily_forces: number = baseNCForcesToday();
    if (total_daily_forces > 0 && !running_low_on_turns) {
      auto_log_debug(
        "Friars: delaying to save NC forces for later today.",
        "blue",
      );
      return false;
    }
  }

  return true;
}

function L6_friarsGetNeckDo(): boolean {
  if (!L6_friarsGetPartsSetup()) {
    return false;
  }

  auto_log_info("Getting Dodecagram", "blue");

  const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
    $location`The Dark Neck of the Woods`,
  );

  // delay if we're out of NC forcers and haven't run out of things to do
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

function L6_friarsGetElbowDo(): boolean {
  if (!L6_friarsGetPartsSetup()) {
    return false;
  }

  auto_log_info("Getting Eldritch Butterknife", "blue");

  const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
    $location`The Dark Elbow of the Woods`,
  );

  // delay if we're out of NC forcers and haven't run out of things to do
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
function L6_friarsGetHeartDo(): boolean {
  if (!L6_friarsGetPartsSetup()) {
    return false;
  }

  auto_log_info("Getting Box of Birthday Candles", "blue");

  const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
    $location`The Dark Heart of the Woods`,
  );

  // delay if we're out of NC forcers and haven't run out of things to do
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

export function L6_friarsGetParts(): boolean {
  return runQuestTask(L6_friarsTask);
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
    if (get("questL06Friar") !== "finished") {
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
  if (get("questM16Temple") !== "finished") {
    auto_abort("Could not finish Dakota Fanning quest, aborting.");
  }
  return true;
}

const L6_dakotaFanningTask: QuestTask = registerQuestTask({
  name: "L6_dakotaFanning",
  completed: () => hiddenTempleUnlocked() || !get("auto_dakotaFanning", false),
  ready: () => get("auto_dakotaFanning", false) && !hiddenTempleUnlocked(),
  do: L6_dakotaFanningDo,
  locations: $locations`The Haunted Conservatory, The Dark Heart of the Woods, Pandamonium Slums`,
  desiredEncounters: () => [
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
  ],
});

export function L6_dakotaFanning(): boolean {
  return runQuestTask(L6_dakotaFanningTask);
}
