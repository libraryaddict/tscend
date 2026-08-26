import { Engine, Task } from "grimoire-kolmafia";
import {
  appearanceRates,
  Item,
  Location,
  max,
  min,
  Monster,
  numericModifier,
  Phylum,
  printHtml,
  turnsUntilForcedNoncombat,
} from "kolmafia";
import { $modifier } from "libram";

import { autoAdv } from "../auto_adventure";
import {
  auto_abort,
  auto_log_debug,
  getMonsterDrops,
  isItemDropControlled,
  remainingNCForcesAvailable,
} from "../auto_util";
import { abortIfRepeating } from "../utils/infiniteAdvDetector";
import { maximizer } from "../utils/maximizer";

export type DesiredDrop = {
  item: Item;
  needAmount: number;
};

export type DesiredFights = {
  monster: Monster | Phylum | Phylum[] | Monster[];
  needAmount: number;
};

export type NoncombatForcing = {
  /**
   * If the location represented, still needs to set things up. Returns -1 if unknown, 0 if no setup, otherwise the estimated turns to set things up. This is used against the turns saved, so 3 would mean that if 5 turns until forced NC, we estimate only 2 turns saved. If it returns 0, then it means that the turns until forced NC as provided by kolmafia, is accurate for the turns saved.
   */
  turnsRequiredForSetup: number;
  // If absent, is derieved from the Location by the task
  // This is used for when mafia either doesn't expose this, or it's inaccurate, or when we'd encounter another choice first
  turnsSavedByForcedNC?: number;
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
  // A task implementing this must not have more or less locations than 1
  forcedNonCombats?: () => NoncombatForcing[];
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

function turnsSavedByForcing(
  location: Location,
  forcing: NoncombatForcing,
): number {
  // we can't claim a saving we can't measure
  if (forcing.turnsRequiredForSetup < 0) return 0;

  let turnsSaved =
    forcing.turnsSavedByForcedNC ?? turnsUntilForcedNoncombat(location);

  if (location.combatPercent !== 0 && location.combatPercent !== 100) {
    // a random noncombat may beat us to it
    const noncombatChance =
      100 - (location.combatPercent + numericModifier("Combat Rate"));
    if (noncombatChance > 0) {
      turnsSaved = min(turnsSaved, Math.round(100 / noncombatChance));
    }
  }

  return max(0, turnsSaved - forcing.turnsRequiredForSetup);
}

/**
 * The turns we'd save by spending our next forcer at this location.
 */
export function turnsSavedByForcingNoncombatHere(location: Location): number {
  let saved = 0;

  for (const task of getAllQuestTasks()) {
    if (!task.forcedNonCombats || !isAvailable(task)) continue;
    if (taskLocations(task)[0] !== location) continue;

    // a task can want several forcers, but only the first is on offer right now
    const forcing = task.forcedNonCombats()[0];
    if (forcing === undefined) continue;

    saved = max(saved, turnsSavedByForcing(location, forcing));
  }

  return saved;
}

/**
 * If forcing a noncombat here is one of the most turn saving ways to spend a forcer, counting as many wants as we have forcers left today.
 */
export function isTopLocationToForceNoncombat(location: Location): boolean {
  const here = turnsSavedByForcingNoncombatHere(location);
  if (here === 0) return false;

  let betterUses = 0;

  for (const task of getAllQuestTasks()) {
    if (!task.forcedNonCombats || !isAvailable(task)) continue;

    const taskLocation = taskLocations(task)[0];
    if (taskLocation === undefined) continue;

    // a task can want several forcers, each entry is one of them
    const turnsSaved = task
      .forcedNonCombats()
      .map((forcing) => turnsSavedByForcing(taskLocation, forcing));

    betterUses += turnsSaved.filter((saved) => saved > here).length;
  }

  return betterUses < remainingNCForcesAvailable();
}

/**
 * Prints every location a task wants a noncombat forced at, and what forcing there would save us.
 */
export function printForcedNoncombatLocations(): void {
  printHtml(
    `Noncombat forcers available: ${remainingNCForcesAvailable()}`,
    false,
  );

  const rows: { saved: number; line: string }[] = [];

  for (const task of getAllQuestTasks()) {
    if (!task.forcedNonCombats) continue;

    const location = taskLocations(task)[0];
    if (location === undefined) continue;

    const available = isAvailable(task);
    const wants = task
      .forcedNonCombats()
      .map(
        (forcing, index) =>
          `#${index + 1} saves ${turnsSavedByForcing(location, forcing)} ` +
          `(setup ${forcing.turnsRequiredForSetup}, until NC ${forcing.turnsSavedByForcedNC ?? turnsUntilForcedNoncombat(location)})`,
      );
    const top =
      available && isTopLocationToForceNoncombat(location)
        ? " <font color=blue>[best use of a forcer]</font>"
        : "";

    rows.push({
      saved: available ? turnsSavedByForcingNoncombatHere(location) : -1,
      line:
        `<font color=${available ? "green" : "darkred"}>${task.name}</font> @ ${location.toString()}: ` +
        `${wants.length > 0 ? wants.join(", ") : "wants no forcers right now"}${top}`,
    });
  }

  rows.sort((a, b) => b.saved - a.saved);

  for (const row of rows) {
    printHtml(row.line, false);
  }
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
  lastSuccessfulTask?: QuestTask;
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

  // Quest tasks manage their own combat/logging via autoAdv, not grimoire's
  // combat/outfit/acquire machinery, so grimoire's per-execute "Executing X"
  // print and autoattack/CCS churn are just noise here.
  printExecutingMessage(): void {}

  setCombat(): void {}

  do(task: QuestTask): void {
    try {
      if (this.executing.length === 0) {
        // As we're going deeper into the stack, unset any success stories
        this.lastSuccessfulTask = undefined;
      }
      if (!this.available(task)) {
        auto_abort(
          `We were trying to execute a task that is not available: ${task.name}, our current task stack is ${this.executing.map((t) => t.name).join(" > ")}`,
        );
      }
      // Adds the current task to the stack
      this.executing.push(task);
      const result =
        typeof task.do === "function"
          ? task.do(this.getContext(task))
          : task.do;

      if (result instanceof Location) {
        if (autoAdv(result)) {
          this.lastSuccessfulTask = task;
        }
      } else if (typeof result === "boolean") {
        if (result && !this.lastSuccessfulTask) {
          this.lastSuccessfulTask = task;
        }
      } else if (!this.lastSuccessfulTask) {
        this.lastSuccessfulTask = task;
      }
    } finally {
      // Pops the stack
      this.executing.pop();
    }

    if (task === this.lastSuccessfulTask) {
      auto_log_debug(`> Executed ${task.name}`);
      abortIfRepeating();
    }
  }
}

const questTasks: QuestTask[] = [];
let engineInstance: AutoscendEngine | undefined;

export function registerQuestTask<T extends QuestTask>(task: T): T;
export function registerQuestTask<T extends QuestTask>(
  parent: QuestTask,
  child: T,
): T;
export function registerQuestTask<T extends QuestTask>(a: QuestTask, b?: T): T {
  if (engineInstance) {
    auto_abort(
      `Attempted to register task ${a.name} after engine was constructed.`,
    );
  }

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
  questTasks.push(task);
  return task;
}

export function getEngine(): AutoscendEngine {
  if (!engineInstance) {
    engineInstance = new AutoscendEngine(questTasks);
  }
  return engineInstance;
}

export function runQuestTask(task: QuestTask): boolean {
  const engine = getEngine();
  const registered = findRegisteredQuestTask(task.name);
  if (!registered) {
    auto_abort(
      `Attempted to run quest task ${task.name} which was not registered.`,
    );
  }
  if (!engine.available(registered)) {
    return false;
  }
  engine.execute(registered);
  return engine.lastSuccessfulTask !== undefined;
}

export function findRegisteredQuestTask(name: string): QuestTask | undefined {
  return getEngine().tasks_by_name.get(name);
}

export function getAllQuestTasks(): QuestTask[] {
  return questTasks;
}

// Returns the tasks that are currently executing, this includes the parents in the stack, the stack may have conflicting information on locations
export function getExecutingQuestTasks(): QuestTask[] {
  return getEngine().executing;
}

export function printAllTaskQuests(filter: string = ""): void {
  filter = filter.toLowerCase();

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

export function isComplete(tasks: QuestTask | QuestTask[]): boolean {
  return (Array.isArray(tasks) ? tasks : [tasks]).every((t) =>
    t.completed(getEngine().getContext(t)),
  );
}

export function isAvailable(task: QuestTask): boolean {
  return getEngine().available(task);
}

export function runTaskChain(tasks: QuestTask[]): boolean {
  for (const task of tasks) {
    if (!getEngine().available(task)) {
      continue;
    }
    getEngine().execute(task);
    if (getEngine().lastSuccessfulTask) {
      return true;
    }
  }
  return false;
}
