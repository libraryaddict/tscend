import {
  cliExecute,
  containsText,
  haveEffect,
  hiddenTempleUnlocked,
  itemAmount,
  myAscensions,
  myMeat,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $modifier,
  $monster,
  get,
  have,
} from "libram";

import { GreyGoose } from "../../../types";
import { canBurnDelay } from "../../auto_routing";
import { QuestTask, runQuestTask } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv, autoLuckyAdv } from "../../executors/auto_adventure";
import { pullXWhenHaveY } from "../../helpers/auto_acquire";
import { handleFamiliar, handleFamiliar$1 } from "../../helpers/auto_familiar";
import { in_glover } from "../../paths/2018/g_lover";
import { auto_abort, auto_log_info } from "../../utils/auto_log";
import {
  auto_runChoice,
  canSummonMonster,
  cloversAvailable,
  internalQuestStatus,
  summonMonster,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";

function LX_unlockHiddenTempleDo(): boolean {
  // replaces L2_treeCoin(),  L2_spookyMap(),  L2_spookyFertilizer() & L2_spookySapling()

  auto_log_info("Attempting to make the Hidden Temple less hidden.", "blue");
  pullXWhenHaveY($item`Spooky-Gro fertilizer`, 1, 0);
  if (autoAdv($location`The Spooky Forest`)) {
    if (
      itemAmount($item`Spooky Temple map`) > 0 &&
      itemAmount($item`Spooky-Gro fertilizer`) > 0 &&
      itemAmount($item`spooky sapling`) > 0
    ) {
      use(1, $item`Spooky Temple map`);
    }
    return true;
  }
  return false;
}

export const LX_unlockHiddenTempleTask: QuestTask = registerQuestTask({
  name: "LX_unlockHiddenTemple",
  // Spooky Temple map ain't nuthin' but a 'G' Thang.
  completed: () => hiddenTempleUnlocked(),
  ready: () =>
    !in_glover() &&
    !(itemAmount($item`spooky sapling`) === 0 && myMeat() < 100) &&
    // Arboreal Respite choice adventure has a delay of 5 adventures.
    !canBurnDelay($location`The Spooky Forest`),
  do: LX_unlockHiddenTempleDo,
  locations: $location`The Spooky Forest`,
});

export function LX_unlockHiddenTemple(): boolean {
  return runQuestTask(LX_unlockHiddenTempleTask);
}

function LX_killBaaBaaBuranDo(): boolean {
  if (
    itemAmount($item`stone wool`) === 0 &&
    haveEffect($effect`Stone-Faced`) === 0
  ) {
    // try to clover/summon baa baa first
    if (GreyGoose.haveGreyGoose()) {
      auto_log_info(
        "Bringing the Grey Goose to emit some drones at a Sheep carving.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    } else {
      handleFamiliar("item");
    }
    maximizer.weight($modifier`Item Drop`, 20).max($modifier`Item Drop`, 400);
    // Right now clovers are "cheaper" than summons, so use clover first, but not our last.
    if (cloversAvailable() > 1) {
      return autoLuckyAdv($location`The Hidden Temple`);
    }

    if (canSummonMonster($monster`Baa'baa'bu'ran`)) {
      return summonMonster($monster`Baa'baa'bu'ran`);
    }
  }
  return false;
}

const LX_killBaaBaaBuranTask: QuestTask = registerQuestTask({
  name: "LX_killBaaBaaBuran",
  completed: () =>
    itemAmount($item`stone wool`) > 0 || haveEffect($effect`Stone-Faced`) > 0,
  ready: () => hiddenTempleUnlocked(),
  do: LX_killBaaBaaBuranDo,
  locations: $location`The Hidden Temple`,
  desiredEncounters: () => [
    {
      monster: $monster`Baa'baa'bu'ran`,
      needAmount:
        itemAmount($item`stone wool`) > 0 ||
        haveEffect($effect`Stone-Faced`) > 0
          ? 0
          : 1,
    },
  ],
});

export function LX_killBaaBaaBuran(): boolean {
  return runQuestTask(LX_killBaaBaaBuranTask);
}

export function hiddenTempleChoiceHandler(choice: number, page: string): void {
  if (choice === 123) {
    // At Least It's Not Full Of Trash
    auto_runChoice(2); // Go to Beginning at the Beginning of Beginning
    visitUrl("choice.php");
    cliExecute("dvorak"); // Solve puzzle and go to No Visible Means of Support (#125)
  } else if (choice === 125) {
    // No Visible Means of Support
    auto_runChoice(3); // Unlock the Hidden City!
  } else if (choice === 579) {
    // Such Great Heights
    if (
      itemAmount($item`stone wool`) >= 2 &&
      get("lastTempleAdventures") < myAscensions()
    ) {
      auto_runChoice(3); // if we have plenty of stone wool, take the adventures first (and reset Mayam)
    } else if (
      get("lastTempleButtonsUnlock") < myAscensions() &&
      !have($item`the Nostril of the Serpent`) &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      auto_runChoice(2); // Get The Nostril of the Serpent
    } else {
      auto_runChoice(3); // +3 adventures and extend 10 effects (first time) or skip
    }
  } else if (choice === 580) {
    // The Hidden Heart of the Hidden Temple
    if (
      !containsText(
        page,
        "The door is decorated with that little lightning-tailed guy from your father's diary.",
      )
    ) {
      auto_runChoice(2); // Go to Unconfusing Buttons (#584) or Confusing Buttons (#583)
    } else {
      auto_runChoice(1); // Go to At Least It's Not Full Of Trash (#123)
    }
  } else if (choice === 581) {
    // Such Great Depths
    auto_runChoice(3); // Fight the Clan of cave bars
  } else if (choice === 582) {
    // Fitting In
    if (
      (get("lastTempleButtonsUnlock") === myAscensions() ||
        have($item`the Nostril of the Serpent`)) &&
      internalQuestStatus("questL11Worship") < 3
    ) {
      auto_runChoice(2); // Go to The Hidden Heart of the Hidden Temple (#580)
    } else {
      auto_runChoice(1); // Go to Such Great Heights (#579)
    }
  } else if (choice === 583) {
    // Confusing Buttons
    auto_runChoice(1); // Randomly changes The Hidden Heart of the Hidden Temple
  } else if (choice === 584) {
    // Unconfusing Buttons
    auto_runChoice(4); // Go to The Hidden Heart of the Hidden Temple (Pikachutlotal) (#580)
  } else {
    auto_abort("unhandled choice in hiddenTempleChoiceHandler");
  }
}
