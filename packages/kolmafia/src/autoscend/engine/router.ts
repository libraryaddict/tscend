import { myPath } from "kolmafia";

import {
  advanceSoftblockCheckPass,
  setupSoftblockLocks,
} from "../auto_routing";
import { auto_abort } from "../auto_util";
import { callRegisteredTaskFunction } from "../task_registry";
import { abortIfRepeating } from "../utils/infiniteAdvDetector";
import { fileAsMap } from "../utils/kolmafiaUtils";
import { findRegisteredQuestTask, getEngine, QuestTask } from "./engine";

function legacyTask(name: string): QuestTask {
  return {
    name,
    completed: () => false,
    ready: () => true,
    do: () => callRegisteredTaskFunction([name]),
  };
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
export function buildTaskOrder(path: string = myPath().name): QuestTask[] {
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
      const existing = findRegisteredQuestTask(taskFunction);
      const task = existing ?? legacyTask(taskFunction);
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
  const ordered: QuestTask[] = [...prefixTasks, ...buildTaskOrder(path)];
  advanceSoftblockCheckPass();
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
        if (task.completed()) {
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
