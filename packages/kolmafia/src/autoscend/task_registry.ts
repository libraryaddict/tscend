import { inHardcore } from "kolmafia";

import { LX_needMeatSkills } from "./paths/adventurer_meats_world";
import { L6_friarsGetParts_condition_hardcore } from "./quests/level_06";
import { L11_hasUltrahydrated } from "./quests/level_11";
import { LX_steelOrgan_condition_slow } from "./quests/optional";

// Only the condition_function predicates from data/task_order/*.dat live
// here now — every task_function entry in those files resolves to a
// registered QuestTask (see engine/router.ts's buildTaskOrder), so this
// registry no longer needs to carry the task functions themselves.
const taskFunctionRegistry: Record<string, () => boolean> = {
  in_hardcore: inHardcore,
  L11_hasUltrahydrated,
  L6_friarsGetParts_condition_hardcore,
  LX_needMeatSkills,
  LX_steelOrgan_condition_slow,
};

export function callRegisteredTaskFunction(name: string): boolean {
  const fn = taskFunctionRegistry[name];
  if (!fn) {
    throw `Task "${name}" is not registered in task registry.`;
  }
  return fn();
}
