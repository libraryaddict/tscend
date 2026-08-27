import { $familiar, $location } from "libram";

import { autoAdv } from "../../auto_adventure";
import { canChangeToFamiliar, handleFamiliar$1 } from "../../auto_familiar";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";

function resolveSixthDMTDo(): boolean {
  handleFamiliar$1($familiar`Machine Elf`);
  return autoAdv($location`The Deep Machine Tunnels`);
}

const resolveSixthDMTTask: QuestTask = registerQuestTask({
  name: "resolveSixthDMT",
  completed: () =>
    in_koe() ||
    (!canChangeToFamiliar($familiar`Machine Elf`) && !in_quantumTerrarium()) ||
    $location`The Deep Machine Tunnels`.turnsSpent > 5,
  // In the Deep Machine Tunnels the sixth and every 50th visit after that in a single ascension will be a noncombat. This prepares for it and executes it.
  ready: () =>
    !in_koe() &&
    canChangeToFamiliar($familiar`Machine Elf`) &&
    // need to figure out the exact schedule for 2nd and later occurences then add it here.
    $location`The Deep Machine Tunnels`.turnsSpent === 5,
  do: resolveSixthDMTDo,
  locations: $location`The Deep Machine Tunnels`,
});

export function resolveSixthDMT(): boolean {
  return runQuestTask(resolveSixthDMTTask);
}
