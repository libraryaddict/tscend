import {
  abort,
  cliExecute,
  council,
  hiddenTempleUnlocked,
  itemAmount,
  myMeat,
} from "kolmafia";
import { $item, $location } from "libram";

import { autoAdv } from "../auto_adventure";
import { canBurnDelay } from "../auto_routing";
import {
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  internalQuestStatus,
} from "../auto_util";
import { QuestTask, registerQuestTask, runQuestTask } from "../engine/engine";
import { in_koe } from "../paths/kingdom_of_exploathing";

//Defined in autoscend/quests/level_02.ash
export function spookyForestChoiceHandler(choice: number): void {
  if (choice === 502) {
    // Arboreal Respite (The Spooky Forest)
    if (
      internalQuestStatus("questL02Larva") === 0 &&
      itemAmount($item`mosquito larva`) === 0
    ) {
      // need the mosquito larva
      auto_runChoice(2); // go to Consciousness of a Stream (#505)
    } else if (!hiddenTempleUnlocked()) {
      if (
        itemAmount($item`tree-holed coin`) === 0 &&
        itemAmount($item`Spooky Temple map`) === 0
      ) {
        // need the tree-holed coin
        auto_runChoice(2); // go to Consciousness of a Stream (#505)
      } else if (
        itemAmount($item`Spooky Temple map`) === 0 ||
        itemAmount($item`Spooky-Gro fertilizer`) === 0
      ) {
        // have the coin, need the spooky temple map and spooky-gro fertilizer
        auto_runChoice(3); // go to Through Thicket and Thinnet (#506)
      } else {
        // need the spooky sapling
        auto_runChoice(1); // go to The Road Less Traveled (#503)
      }
    } else {
      auto_log_warning(
        "In Arboreal Respite for some reason but we don't need a mosquito larva or to unlock the hidden temple!",
      );
      auto_runChoice(2); // go to Consciousness of a Stream (#505)
    }
  } else if (choice === 503) {
    // The Road Less Traveled (The Spooky Forest)
    auto_runChoice(3); // go to Tree's Last Stand (#504)
  } else if (choice === 504) {
    // Tree's Last Stand (The Spooky Forest)
    // when selling [bar skin] or buying [spooky sapling] we must immediately queue up the next action(s).
    // otherwise mafia will think our NC handling failed and fallback to the mafia handling.
    if (itemAmount($item`bar skin`) > 1) {
      auto_runChoice(2); // sell all bar skins (doesn't leave choice)
    } else if (itemAmount($item`bar skin`) === 1) {
      auto_runChoice(1); // sell bar skin (doesn't leave choice)
    }
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`spooky sapling`) === 0 &&
      myMeat() > 100
    ) {
      auto_runChoice(3); // get the spooky sapling (doesn't leave choice)
    }
    auto_runChoice(4); // leave the choice
  } else if (choice === 505) {
    // Consciousness of a Stream (The Spooky Forest)
    if (
      internalQuestStatus("questL02Larva") === 0 &&
      itemAmount($item`mosquito larva`) === 0
    ) {
      auto_runChoice(1); // Get the mosquito larva
    } else {
      auto_runChoice(2); // Get the tree-holed coin or skip
    }
  } else if (choice === 506) {
    // Through Thicket and Thinnet (The Spooky Forest)
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`Spooky-Gro fertilizer`) === 0
    ) {
      auto_runChoice(2); // get the spooky-gro fertilizer
    } else {
      auto_runChoice(3); // go to O Lith, Mon (#507)
    }
  } else if (choice === 507) {
    // O Lith, Mon (The Spooky Forest)
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`tree-holed coin`) > 0 &&
      itemAmount($item`Spooky Temple map`) === 0
    ) {
      auto_runChoice(1); // get the spooky temple map
    } else {
      auto_runChoice(3); // skip
    }
  } else {
    abort("unhandled choice in spookyForestChoiceHandler");
  }
}

function L2_mosquitoDo(): boolean {
  auto_log_info("Trying to find a mosquito.", "blue");
  if (autoAdv($location`The Spooky Forest`)) {
    if (
      internalQuestStatus("questL02Larva") > 0 ||
      itemAmount($item`mosquito larva`) > 0
    ) {
      council();
      if (in_koe()) {
        cliExecute("refresh quests");
      }
    }
    return true;
  }
  return false;
}

export const L2_mosquitoTask: QuestTask = registerQuestTask({
  name: "L2_mosquito",
  completed: () => internalQuestStatus("questL02Larva") > 1,
  ready: () =>
    internalQuestStatus("questL02Larva") >= 0 &&
    internalQuestStatus("questL02Larva") <= 1 &&
    !canBurnDelay($location`The Spooky Forest`),
  do: L2_mosquitoDo,
  locations: $location`The Spooky Forest`,
});

export function L2_mosquito(): boolean {
  return runQuestTask(L2_mosquitoTask);
}
