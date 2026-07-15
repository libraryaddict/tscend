import {
  abort,
  cliExecute,
  council,
  hiddenTempleUnlocked,
  itemAmount,
  myMeat,
  runChoice,
} from "kolmafia";
import { $item, $location } from "libram";

import { autoAdv } from "../auto_adventure";
import { canBurnDelay } from "../auto_routing";
import {
  auto_log_info,
  auto_log_warning$1,
  internalQuestStatus,
} from "../auto_util";
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
      runChoice(2); // go to Consciousness of a Stream (#505)
    } else if (!hiddenTempleUnlocked()) {
      if (
        itemAmount($item`tree-holed coin`) === 0 &&
        itemAmount($item`Spooky Temple map`) === 0
      ) {
        // need the tree-holed coin
        runChoice(2); // go to Consciousness of a Stream (#505)
      } else if (
        itemAmount($item`Spooky Temple map`) === 0 ||
        itemAmount($item`Spooky-Gro fertilizer`) === 0
      ) {
        // have the coin, need the spooky temple map and spooky-gro fertilizer
        runChoice(3); // go to Through Thicket and Thinnet (#506)
      } else {
        // need the spooky sapling
        runChoice(1); // go to The Road Less Traveled (#503)
      }
    } else {
      auto_log_warning$1(
        "In Arboreal Respite for some reason but we don't need a mosquito larva or to unlock the hidden temple!",
      );
      runChoice(2); // go to Consciousness of a Stream (#505)
    }
  } else if (choice === 503) {
    // The Road Less Traveled (The Spooky Forest)
    runChoice(3); // go to Tree's Last Stand (#504)
  } else if (choice === 504) {
    // Tree's Last Stand (The Spooky Forest)
    // when selling [bar skin] or buying [spooky sapling] we must immediately queue up the next action(s).
    // otherwise mafia will think our NC handling failed and fallback to the mafia handling.
    if (itemAmount($item`bar skin`) > 1) {
      runChoice(2); // sell all bar skins (doesn't leave choice)
    } else if (itemAmount($item`bar skin`) === 1) {
      runChoice(1); // sell bar skin (doesn't leave choice)
    }
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`spooky sapling`) === 0 &&
      myMeat() > 100
    ) {
      runChoice(3); // get the spooky sapling (doesn't leave choice)
    }
    runChoice(4); // leave the choice
  } else if (choice === 505) {
    // Consciousness of a Stream (The Spooky Forest)
    if (
      internalQuestStatus("questL02Larva") === 0 &&
      itemAmount($item`mosquito larva`) === 0
    ) {
      runChoice(1); // Get the mosquito larva
    } else {
      runChoice(2); // Get the tree-holed coin or skip
    }
  } else if (choice === 506) {
    // Through Thicket and Thinnet (The Spooky Forest)
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`Spooky-Gro fertilizer`) === 0
    ) {
      runChoice(2); // get the spooky-gro fertilizer
    } else {
      runChoice(3); // go to O Lith, Mon (#507)
    }
  } else if (choice === 507) {
    // O Lith, Mon (The Spooky Forest)
    if (
      !hiddenTempleUnlocked() &&
      itemAmount($item`tree-holed coin`) > 0 &&
      itemAmount($item`Spooky Temple map`) === 0
    ) {
      runChoice(1); // get the spooky temple map
    } else {
      runChoice(3); // skip
    }
  } else {
    abort("unhandled choice in spookyForestChoiceHandler");
  }
}

export function L2_mosquito(): boolean {
  if (
    internalQuestStatus("questL02Larva") < 0 ||
    internalQuestStatus("questL02Larva") > 1
  ) {
    return false;
  }
  if (canBurnDelay($location`The Spooky Forest`)) {
    // Arboreal Respite choice adventure has a delay of 5 adventures.
    return false;
  }
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
