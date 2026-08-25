import { inHardcore } from "kolmafia";

import { auto_abort } from "./auto_util";
import { LX_needMeatSkills } from "./paths/2026/adventurer_meats_world";
import { L6_friarsGetParts_condition_hardcore } from "./quests/level_06";
import { L11_hasUltrahydrated } from "./quests/level_11";
import { LX_steelOrgan_condition_slow } from "./quests/optional";
import { auto_check_conditions } from "./utils/auto_conditions";

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

export function callRegisteredTaskFunction(conds: string[]): boolean {
  const actualConds = conds.filter((c) => c.includes(":"));

  if (actualConds.length > 0 && !auto_check_conditions(actualConds)) {
    return false;
  }

  for (const name of conds) {
    if (name.includes(":")) continue;

    const fn = taskFunctionRegistry[name];
    if (!fn) {
      auto_abort(`Task "${name}" is not registered in task registry.`);
    }
    if (!fn()) {
      return false;
    }
  }

  return true;
}
