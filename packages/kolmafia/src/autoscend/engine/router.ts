import { inHardcore, myPath } from "kolmafia";

import { L11_Pyramid } from "../../types";
import {
  advanceSoftblockCheckPass,
  setupSoftblockLocks,
} from "../auto_routing";
import { LX_needMeatSkills } from "../paths/2026/adventurer_meats_world";
import { L6_friarsGetParts_condition_hardcore } from "../quests/level_06";
import { LX_steelOrgan_condition_slow } from "../quests/optional";
import { auto_check_conditions } from "../utils/auto_conditions";
import { auto_abort } from "../utils/auto_log";
import { abortIfRepeating } from "../utils/infiniteAdvDetector";
import { fileAsMap } from "../utils/kolmafiaUtils";
import { findRegisteredQuestTask, getEngine, QuestTask } from "./engine";

// Only the condition_function predicates from data/task_order/*.dat live
// here now — every task_function entry in those files resolves to a
// registered QuestTask (see engine/router.ts's buildTaskOrder), so this
// registry no longer needs to carry the task functions themselves.
const taskFunctionRegistry: Record<string, () => boolean> = {
  in_hardcore: inHardcore,
  L11_hasUltrahydrated: L11_Pyramid.L11_hasUltrahydrated,
  L6_friarsGetParts_condition_hardcore,
  LX_needMeatSkills,
  LX_steelOrgan_condition_slow,
};

function callRegisteredTaskFunction(conds: string[]): boolean {
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

function withCondition(
  task: QuestTask,
  conditionFunction: string[],
): QuestTask {
  if (conditionFunction.length === 0) {
    return task;
  }
  const originalReady = task.ready;
  return {
    ...task,
    ready: (ctx) =>
      callRegisteredTaskFunction(conditionFunction) &&
      (!originalReady || originalReady(ctx)),
  };
}

// Mirrors autoscend.ts's process_tasks() traversal of data/autoscend_task_order.txt.
// Converted tasks are reused as-is; unconverted ones fall back to task_registry
// so the list has full dispatch coverage without requiring a full conversion first.
function buildTaskOrder(path: string = myPath().name): QuestTask[] {
  const taskOrder: Map<string, Map<number, Map<string, string[]>>> = fileAsMap(
    "autoscend_task_order.txt",
    [String, Number, String, "string[]"],
  );
  if (!taskOrder.size) {
    auto_abort("Could not load /data/autoscend_task_order.txt");
  }

  const taskPath = taskOrder.has(path) ? path : "default";
  const indexed = taskOrder.get(taskPath);
  if (!indexed) {
    return [];
  }

  const ordered: QuestTask[] = [];
  for (const [, entries] of [...indexed.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    for (const [taskFunction, conditionFunction] of entries) {
      // an off-path task is pruned, so the entries naming it no longer resolve
      const task = findRegisteredQuestTask(taskFunction);
      if (!task) continue;

      ordered.push(withCondition(task, conditionFunction));
    }
  }
  return ordered;
}

// Drop-in replacement for autoscend.ts's process_tasks(): if a task doesn't actually act, moves on rather than stopping. prefixTasks run ahead of the file-driven order.
export function runNextTask(
  path: string = myPath().name,
  prefixTasks: QuestTask[] = [],
): boolean {
  const ordered: QuestTask[] = [
    ...prefixTasks.filter(
      (t) =>
        t.path === undefined ||
        (Array.isArray(t.path)
          ? t.path?.includes(myPath())
          : t.path === myPath()),
    ),
    ...buildTaskOrder(path),
  ];
  advanceSoftblockCheckPass();
  getEngine().invalidateContext();
  try {
    for (const task of ordered) {
      if (!getEngine().tasks_by_name.get(task.name)) {
        auto_abort(`Attempted to run unregistered task ${task.name}`);
      }

      //auto_log_debug(`Attempting to execute task ${i} ${task.name}`);
      if (!getEngine().available(task)) {
        continue;
      }
      getEngine().execute(task);
      if (getEngine().lastSuccessfulTask) {
        if (getEngine().completed(task)) {
          // Real progress happened, not just a last-resort softblock release: give every
          // softblock (sword tracking, baseball diamond, ...) another chance to hold.
          setupSoftblockLocks();
        }
        return true;
      }
    }
    return false;
  } finally {
    abortIfRepeating();
  }
}
