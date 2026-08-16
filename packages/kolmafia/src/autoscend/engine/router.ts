import { abort, myPath } from "kolmafia";

import { setupSoftblockLocks } from "../auto_routing";
import { callRegisteredTaskFunction } from "../task_registry";
import { fileAsMap } from "../utils/kolmafiaUtils";
import { AutoscendEngine, findRegisteredQuestTask, QuestTask } from "./engine";

function legacyTask(name: string): QuestTask {
  return {
    name,
    completed: () => false,
    ready: () => true,
    do: () => callRegisteredTaskFunction(name),
  };
}

function withCondition(task: QuestTask, conditionFunction: string): QuestTask {
  if (conditionFunction === "") {
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
  const taskOrder: Map<string, Map<number, Map<string, string>>> = fileAsMap(
    "autoscend_task_order.txt",
    [String, Number, String, String],
  );
  if (!taskOrder.size) {
    abort("Could not load /data/autoscend_task_order.txt");
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

// Cached per path so grimoire's per-task state (e.g. attempt counts backing `limit`) persists across ticks instead of resetting each call.
const engineCache = new Map<string, AutoscendEngine>();

function getPathEngine(
  path: string,
  prefixTasks: QuestTask[],
): AutoscendEngine {
  let engine = engineCache.get(path);
  if (!engine) {
    engine = new AutoscendEngine([...prefixTasks, ...buildTaskOrder(path)]);
    engineCache.set(path, engine);
  }
  return engine;
}

// Drop-in replacement for autoscend.ts's process_tasks(): if a task doesn't actually act, moves on rather than stopping. prefixTasks run ahead of the file-driven order.
export function runNextTask(
  path: string = myPath().name,
  prefixTasks: QuestTask[] = [],
): boolean {
  const engine = getPathEngine(path, prefixTasks);
  for (const [, task] of engine.tasks.entries()) {
    //auto_log_debug(`Attempting to execute task ${i} ${task.name}`);
    if (!engine.available(task)) {
      continue;
    }
    engine.execute(task);
    if (engine.lastSuccessfulTask) {
      if (task.completed()) {
        // Real progress happened, not just a last-resort softblock release: give every
        // softblock (sword tracking, baseball diamond, ...) another chance to hold.
        setupSoftblockLocks();
      }
      return true;
    }
  }
  return false;
}
