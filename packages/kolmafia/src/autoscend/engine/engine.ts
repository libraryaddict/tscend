import { Engine, Task } from "grimoire-kolmafia";
import {
  appearanceRates,
  Item,
  Location,
  max,
  Monster,
  Phylum,
  printHtml,
} from "kolmafia";
import { $modifier } from "libram";

import { autoAdv, CombatMacro } from "../auto_adventure";
import { getMonsterDrops, isItemDropControlled } from "../auto_util";
import { auto_combatHandler } from "../combat/auto_combat";
import { auto_edCombatHandler } from "../combat/paths/auto_combat_ed";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
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

export function taskDesiredEncounters(task: QuestTask): {
  drops: DesiredDrop[];
  fights: DesiredFights[];
} {
  if (task.desiredEncounters === undefined) return { drops: [], fights: [] };

  const encounters = task.desiredEncounters();

  return {
    drops: encounters.filter(
      (encounter): encounter is DesiredDrop => "item" in encounter,
    ),
    fights: encounters.filter(
      (encounter): encounter is DesiredFights => "monster" in encounter,
    ),
  };
}

export function taskLocations(task: QuestTask): Location[] {
  const locs = task.locations;
  if (locs === undefined) return [];
  if (typeof locs === "function") return locs();
  return Array.isArray(locs) ? locs : [locs];
}

export function isMonsterEncounter(
  encounter: DesiredDrop | DesiredFights,
): encounter is DesiredFights {
  return "monster" in encounter;
}
export function isItemEncounter(
  encounter: DesiredDrop | DesiredFights,
): encounter is DesiredDrop {
  return "monster" in encounter;
}

/**
 * If we're fighting against a monster that the current executing tasks do care about. Doesn't mean we don't care about the monster, eg, wanderer
 */
export function fightingDesiredTaskMonster(monster: Monster): boolean {
  if (monster.boss) return true;
  const drops = getMonsterDrops(monster).map((i) => i.item);

  return getExecutingQuestTasks().some(
    (t) =>
      t.desiredEncounters &&
      t.desiredEncounters().some((e) => {
        if (isMonsterEncounter(e)) {
          const arr = Array.isArray(e.monster) ? e.monster : [e.monster];

          if (arr[0] instanceof Phylum) {
            return arr.includes(monster.phylum);
          }

          return arr.includes(
            arr[0] instanceof Phylum ? monster.phylum : monster,
          );
        } else if (isItemEncounter(e)) {
          return drops.includes(e.item);
        }
      }),
  );
}

/**
 * Finds the item drop needed for a monster, if any incomplete task still wants one of its drops.
 */
export function getDesiredItemDrop(monster: Monster): number | undefined {
  const desiredItems = getIncompleteQuestTasks().flatMap(
    (task) => taskDesiredEncounters(task).drops,
  );
  if (desiredItems.length === 0) return undefined;

  let needed: number | undefined;

  for (const drop of getMonsterDrops(monster)) {
    if (
      drop.rate < 1 ||
      drop.rate >= 100 ||
      !isItemDropControlled(drop) ||
      !desiredItems.some((desired) => desired.item === drop.item)
    ) {
      continue;
    }
    needed = max(needed ?? 0, 10000 / drop.rate);
  }

  return needed;
}

export function getNeededItemDrop(): number | undefined {
  let needed: number | undefined;

  for (const task of getExecutingQuestTasks()) {
    const desiredItems = taskDesiredEncounters(task).drops.map(
      (drop) => drop.item,
    );
    if (desiredItems.length === 0) continue;

    for (const location of taskLocations(task)) {
      for (const [monsterName, encounterRate] of Object.entries(
        appearanceRates(location),
      )) {
        if (encounterRate <= 0) continue;
        const monster = Monster.get(monsterName);

        for (const drop of getMonsterDrops(monster)) {
          if (
            drop.rate < 1 ||
            drop.rate >= 100 ||
            !isItemDropControlled(drop) ||
            !desiredItems.includes(drop.item)
          ) {
            continue;
          }
          needed = max(needed ?? 0, 10000 / drop.rate);
        }
      }
    }
  }

  return needed;
}

// caps the maximizer's "item drop" so it doesn't chase gear beyond what's
// needed to cap the task's desired drop(s) at a 100% end-of-fight chance
// Although, this isn't in use due to concerns about unexpected fights (eg, wanderers)
export function applyItemDropCap(task: QuestTask): void {
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
      for (const drop of getMonsterDrops(monster)) {
        if (
          drop.rate < 1 ||
          drop.rate >= 100 ||
          !isItemDropControlled(drop) ||
          !desiredItems.includes(drop.item)
        ) {
          continue;
        }
        cap = max(cap, 10000 / drop.rate);
      }
    }
  }

  if (cap > 0 && cap > (maximizer.getMax($modifier`Item Drop`) ?? 0)) {
    maximizer
      // Add a lil extra weight on the drop
      .weight($modifier`Item Drop`, 5, true)
      .max($modifier`Item Drop`, cap);
  }
}

export class AutoscendEngine extends Engine<never, QuestTask> {
  lastActed = true;
  executing: QuestTask[] = [];

  // grimoire's initPropertiesManager() forces these to its own defaults on
  // every engine construction, which happens on every runTaskChain call now
  // that quests are migrated — that blanks out autoscend's real script hooks
  // (see auto_begin()'s backupSetting calls in autoscend.ts) and caused
  // choiceAdventureScript to go missing mid-run, breaking choice handling.
  static defaultSettings = {
    ...Engine.defaultSettings,
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
    try {
      // Adds the current task to the stack
      this.executing.push(task);
      const result =
        typeof task.do === "function"
          ? task.do(this.getContext(task))
          : task.do;
      if (result instanceof Location) {
        this.lastActed = autoAdv(result, this.defaultCombatHandler());
        return;
      }
      if (typeof result === "boolean") {
        this.lastActed = result;
        return;
      }
      this.lastActed = true;
    } finally {
      // Pops the stack
      this.executing.pop();
    }
  }
}

let questTasks: QuestTask[] | undefined;
let engineInstance: AutoscendEngine | undefined;

export function registerQuestTask<T extends QuestTask>(task: T): T;
export function registerQuestTask<T extends QuestTask>(
  parent: QuestTask,
  child: T,
): T;
export function registerQuestTask<T extends QuestTask>(a: QuestTask, b?: T): T {
  const task = b ?? (a as T);
  if (b) {
    const childReady = task.ready;
    const childCompleted = task.completed;
    task.ready = (ctx) =>
      a.ready?.(ctx) !== false && (childReady?.(ctx) ?? true);
    task.completed = (ctx) => a.completed(ctx) || childCompleted(ctx);
  }
  if (task.desiredEncounters) {
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

// Returns the tasks that are currently executing, this includes the parents in the stack, the stack may have conflicting information on locations
export function getExecutingQuestTasks(): QuestTask[] {
  return getEngine().executing;
}

export function printAllTaskQuests(filter: string = ""): void {
  const groups = {
    "Complete - Ready": [] as string[],
    "Complete - Not Ready": [] as string[],
    "Incomplete - Ready": [] as string[],
    "Incomplete - Not Ready": [] as string[],
  };

  for (const task of getAllQuestTasks()) {
    if (!task.name.toLowerCase().includes(filter)) continue;
    const context = getEngine().getContext(task);
    const isComplete = task.completed(context);
    const isReady = task.ready?.(context) ?? false;

    const key =
      `${isComplete ? "Complete" : "Incomplete"} - ${isReady ? "Ready" : "Not Ready"}` as keyof typeof groups;

    const color =
      isComplete && isReady
        ? "darkgreen"
        : isComplete || isReady
          ? "green"
          : "darkred";

    groups[key].push(`<font color=${color}>${task.name}</font>`);
  }

  for (const tasks of Object.values(groups)) {
    tasks.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  for (const [group, tasks] of Object.entries(groups)) {
    if (tasks.length === 0) continue;

    const [complete, ready] = group.split(" - ");

    printHtml(
      `<font color=${complete === "Complete" ? "green" : "red"}>${complete}</font> - ` +
        `<font color=${ready === "Ready" ? "green" : "red"}>${ready}</font>: ${tasks.join(
          ", ",
        )}`,
      false,
    );
  }
}

export function getIncompleteQuestTasks(): QuestTask[] {
  return getEngine().tasks.filter((task) => !task.completed());
}

export function runTaskChain(tasks: QuestTask[]): boolean {
  const engine = new AutoscendEngine(tasks);
  for (const task of engine.tasks) {
    if (!engine.available(task)) {
      if (task.completed(engine.getContext(task))) {
        continue;
      }

      // Task is blocking
      //      return false;
      continue;
    }
    engine.execute(task);
    if (engine.lastActed) {
      return true;
    }
  }
  return false;
}
