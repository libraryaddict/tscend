import { Engine, Task } from "grimoire-kolmafia";
import { Location } from "kolmafia";

import { autoAdv, CombatMacro } from "../auto_adventure";
import { auto_combatHandler } from "../combat/auto_combat";
import { auto_edCombatHandler } from "../combat/auto_combat_ed";
import { isActuallyEd } from "../paths/actually_ed_the_undying";

export type QuestTask = Task<never, void> & {
  // Informational only, for future planning/reporting purposes; not read by
  // the engine and does not replace `do`. Declares the location(s) this
  // task's `do` may end up visiting. `noob cave` is not included.
  // Should not include any locations in which we don't actually plan to do anything but 'finish' out things. Eg, no fights.
  locations?: Location | Location[] | (() => Location[]);
};

export class AutoscendEngine extends Engine<never, QuestTask> {
  lastActed = true;

  // grimoire's initPropertiesManager() forces these to its own defaults on
  // every engine construction, which happens on every runTaskChain call now
  // that quests are migrated — that blanks out autoscend's real script hooks
  // (see auto_begin()'s backupSetting calls in autoscend.ts) and caused
  // choiceAdventureScript to go missing mid-run, breaking choice handling.
  static defaultSettings = {
    ...Engine.defaultSettings,
    afterAdventureScript: "js abort('Uh oh')",
    betweenBattleScript: "js abort('Uh oh')",
    choiceAdventureScript: "js abort('Uh oh')",
    hpAutoRecoveryTarget: "-0.05",
    mpAutoRecoveryTarget: "-0.05",
  };

  constructor(tasks: QuestTask[]) {
    super(tasks, { ccs: "" });
  }

  defaultCombatHandler(): CombatMacro {
    return isActuallyEd() ? auto_edCombatHandler : auto_combatHandler;
  }

  // Quest tasks manage their own combat/logging via autoAdv, not grimoire's
  // combat/outfit/acquire machinery, so grimoire's per-execute "Executing X"
  // print and autoattack/CCS churn are just noise here.
  printExecutingMessage(): void {}

  setCombat(): void {}

  do(task: QuestTask): void {
    const result =
      typeof task.do === "function" ? task.do(this.getContext(task)) : task.do;
    if (result instanceof Location) {
      this.lastActed = autoAdv(result, this.defaultCombatHandler());
      return;
    }
    if (typeof result === "boolean") {
      this.lastActed = result;
      return;
    }
    this.lastActed = true;
  }
}

let questTasks: QuestTask[] | undefined;
let engineInstance: AutoscendEngine | undefined;

export function registerQuestTask<T extends QuestTask>(task: T): T {
  questTasks ??= [];
  questTasks.push(task);
  return task;
}

function getEngine(): AutoscendEngine {
  if (!engineInstance) {
    engineInstance = new AutoscendEngine(questTasks ?? []);
  }
  return engineInstance;
}

export function runQuestTask(task: QuestTask): boolean {
  const engine = getEngine();
  const registered = engine.tasks_by_name.get(task.name) ?? task;
  if (!engine.available(registered)) {
    return false;
  }
  engine.execute(registered);
  return engine.lastActed;
}

export function findRegisteredQuestTask(name: string): QuestTask | undefined {
  return getEngine().tasks_by_name.get(name);
}

export function getAllQuestTasks(): QuestTask[] {
  return getEngine().tasks;
}

export function getIncompleteQuestTasks(): QuestTask[] {
  return getEngine().tasks.filter((task) => !task.completed());
}

export function fnTask(name: string, fn: () => boolean): QuestTask {
  return {
    name,
    completed: () => false,
    ready: () => true,
    do: fn,
  };
}

export function alwaysTask(name: string, fn: () => void): QuestTask {
  return {
    name,
    completed: () => false,
    ready: () => true,
    do: () => {
      fn();
      return false;
    },
  };
}

export function runTaskChain(tasks: QuestTask[]): boolean {
  const engine = new AutoscendEngine(tasks);
  for (const task of engine.tasks) {
    if (!engine.available(task)) {
      continue;
    }
    engine.execute(task);
    if (engine.lastActed) {
      return true;
    }
  }
  return false;
}
