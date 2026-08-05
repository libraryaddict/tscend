import { Engine, Task } from "grimoire-kolmafia";
import {
  appearanceRates,
  Item,
  itemDropsArray,
  Location,
  max,
  Monster,
  Phylum,
  printHtml,
} from "kolmafia";
import { $modifier } from "libram";

import { autoAdv, CombatMacro } from "../auto_adventure";
import { auto_combatHandler } from "../combat/auto_combat";
import { auto_edCombatHandler } from "../combat/auto_combat_ed";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { maximizer } from "../utils/maximizer";

export type DesiredDrop = {
  item: Item;
  needAmount: number;
};

export type DesiredFights = {
  monster: Monster | Phylum | Phylum[] | Monster[];
  needAmount: number;
};

export type QuestTask = Task<never, void> & {
  // For planning/reporting purposes, and to compute the item drop cap
  // alongside desiredEncounters; does not replace `do`. Declares the
  // location(s) this task's `do` may end up visiting. `noob cave` is not
  // included.
  // Should not include any locations in which we don't actually plan to do anything but 'finish' out things. Eg, no fights.
  locations?: Location | Location[] | (() => Location[]);
  // The required adventures for this task, will automatically consume enough for this task to become available. Should return 0 if this task isn't ready
  reqAdventures?: () => number;
  // The below is not reliable, it currently does not capture every task, just the bigger things
  desiredEncounters?: () => (DesiredDrop | DesiredFights)[];
};

export function taskLocations(task: QuestTask): Location[] {
  const locs = task.locations;
  if (locs === undefined) return [];
  if (typeof locs === "function") return locs();
  return Array.isArray(locs) ? locs : [locs];
}

// caps the maximizer's "item drop" so it doesn't chase gear beyond what's
// needed to cap the task's desired drop(s) at a 100% end-of-fight chance
function applyItemDropCap(task: QuestTask): void {
  const desiredItems: Item[] = (task.desiredEncounters?.() ?? [])
    .filter(
      (encounter): encounter is DesiredDrop =>
        "item" in encounter && encounter.needAmount > 0,
    )
    .map((encounter) => encounter.item);
  if (desiredItems.length === 0) return;

  let cap = 0;
  for (const location of taskLocations(task)) {
    for (const [monsterName, encounterRate] of Object.entries(
      appearanceRates(location),
    )) {
      if (encounterRate <= 0) continue;
      const monster = Monster.get(monsterName);
      for (const drop of itemDropsArray(monster)) {
        if (
          drop.rate < 1 ||
          drop.type !== "" ||
          !desiredItems.includes(drop.drop)
        ) {
          continue;
        }
        cap = max(cap, 10000 / drop.rate - 100);
      }
    }
  }

  if (cap > 0) {
    maximizer.weight($modifier`Item Drop`, 5).max($modifier`Item Drop`, cap);
  }
}

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
      applyItemDropCap(task);
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

export function printAllTaskQuests(): void {
  for (const task of getAllQuestTasks()) {
    const context = getEngine().getContext(task);
    const isComplete = task.completed(context);
    const isReady = task.ready && task.ready(context);

    printHtml(
      `${task.name}: ` +
        `<font color=${isReady ? "green" : "red"}>${isReady ? "Ready" : "Not Ready"}</font> - ` +
        `<font color=${isComplete ? "green" : "red"}>${isComplete ? "Complete" : "Incomplete"}</font>`,
    );
  }
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
