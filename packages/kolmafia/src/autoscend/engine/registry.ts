import { auto_abort, auto_log_debug } from "../utils/auto_log";
import type { DesiredDrop, DesiredFights, QuestTask } from "./engine";

// Task files import from here, not engine.ts: a module body runs after its imports, and
// engine.ts's imports register tasks, so its questTasks would not exist yet.
export const questTasks: QuestTask[] = [];

let engineBuilt = false;

export function markEngineBuilt(): void {
  engineBuilt = true;
}

let nestedTimed = 0;

// Engine bookkeeping, so whichever task happened to trigger it isn't charged.
export function untimed(callback: () => void): void {
  const start = Date.now();
  const outerNested = nestedTimed;
  callback();
  nestedTimed = outerNested + (Date.now() - start);
}

const consecutiveSlow = new Map<string, number>();

function timed<T>(task: QuestTask, label: string, callback: () => T): T {
  const start = Date.now();
  const outerNested = nestedTimed;
  nestedTimed = 0;
  const result = callback();
  const total = Date.now() - start;
  const elapsed = total - nestedTimed;
  nestedTimed = outerNested + total;

  const key = `${task.name} ${label}`;
  if (elapsed <= 10) {
    consecutiveSlow.set(key, 0);
    return result;
  }

  // one slow reading is usually a gc pause landing on us, so wait for it to repeat
  const slow = (consecutiveSlow.get(key) ?? 0) + 1;
  consecutiveSlow.set(key, slow);
  auto_log_debug(`Task ${task.name} took ${elapsed}ms to evaluate ${label}`);

  if (slow >= 3) {
    auto_abort(
      `Task ${task.name} took ${elapsed}ms to evaluate ${label}, ${slow} times in a row`,
    );
  }
  return result;
}

export function isMonsterEncounter(
  encounter: DesiredDrop | DesiredFights,
): encounter is DesiredFights {
  return "monster" in encounter;
}

export function registerQuestTask<T extends QuestTask>(task: T): T;
export function registerQuestTask<T extends QuestTask>(
  parent: QuestTask,
  child: T,
): T;
export function registerQuestTask<T extends QuestTask>(a: QuestTask, b?: T): T {
  if (engineBuilt) {
    auto_abort(
      `Attempted to register task ${a.name} after engine was constructed.`,
    );
  }

  auto_log_debug(`Registering quest task ${a.name}`);

  const task = b ?? (a as T);
  if (b) {
    const childReady = task.ready;
    const childCompleted = task.completed;
    task.ready = (ctx) =>
      a.ready?.(ctx) !== false && (childReady?.(ctx) ?? true);
    task.completed = (ctx) => a.completed(ctx) || childCompleted(ctx);
  }
  if (task.desiredEncounters !== undefined) {
    const desiredEncounters = task.desiredEncounters;
    task.desiredEncounters = () =>
      desiredEncounters().filter(
        (t) =>
          t.needAmount > 0 &&
          (!isMonsterEncounter(t) ||
            !Array.isArray(t.monster) ||
            t.monster.length > 0),
      );
  }
  const ready = task.ready;
  if (ready) {
    task.ready = (ctx) => timed(task, "ready", () => ready(ctx));
  }
  const completed = task.completed;
  task.completed = (ctx) => timed(task, "completed", () => completed(ctx));

  questTasks.push(task);
  return task;
}
