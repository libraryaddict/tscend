import { ContextualEngine, Task } from "grimoire-kolmafia";
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
import { $location, $modifier } from "libram";

import { BaseballDiamond, SwordOfSwords } from "../../types";
import { zone_available } from "../auto_zone";
import { autoAdv } from "../executors/auto_adventure";
import { auto_abort, auto_log_debug } from "../utils/auto_log";
import {
  auto_getMonstersAt,
  auto_shouldDelayForForcedNonCombat,
  getMonsterDrops,
  isItemDropControlled,
  remainingNCForcesAvailable,
} from "../utils/auto_util";
import { abortIfRepeating } from "../utils/infiniteAdvDetector";
import { invalidatePath } from "../utils/kolmafiaUtils";
import { maximizer } from "../utils/maximizer";
import {
  isMonsterEncounter,
  markEngineBuilt,
  questTasks,
  untimed,
} from "./registry";

export type DesiredDrop = {
  item: Item;
  needAmount: number;
};

export type DesiredFights = {
  monster: Monster | Phylum | Phylum[] | Monster[];
  needAmount: number;
};

export type NoncombatForcing = {
  // The noncombat we're after, only for logging
  name?: string;
  /**
   * If the location represented, still needs to set things up. Returns -1 if unknown, 0 if no setup, otherwise the estimated turns to set things up. This is used against the turns saved, so 3 would mean that if 5 turns until forced NC, we estimate only 2 turns saved. If it returns 0, then it means that the turns until forced NC as provided by kolmafia, is accurate for the turns saved.
   */
  turnsRequiredForSetup: number;
  // If absent, is derieved from the Location by the task
  // This is used for when mafia either doesn't expose this, or it's inaccurate, or when we'd encounter another choice first
  turnsSavedByForcedNC?: number;
  combatRateControlled?: boolean;
};

// reading any of these sweeps every task's completed(), so they're functions
export type QuestContext = {
  // this is undefined while the sweep that builds it is still running
  incompleteTasks(): QuestTask[] | undefined;
  incompleteZoneMonsters(): Set<Monster>;
  // these only tell us which tasks to ask, the amounts get read live
  tasksWantingDrop(): Map<Item, QuestTask[]>;
  tasksWantingFight(): Map<Monster, QuestTask[]>;
  // keyed by the monsters in the task's own zones that match its phylum want
  tasksWantingPhylumFight(): Map<Monster, QuestTask[]>;
  baseballAssignments(): BaseballDiamond.BaseballAssignment[];
  // $location.none once nothing left in the run wants into the baseball diamond
  baseballFillOutZone(): Location;
  // every zone an unfinished task may visit that we can reach right now
  availableTaskZones(): Location[];
  zoneMonsters(location: Location): [Monster, number][];
  categoryMonsters(category: string, location: Location): Monster[];
};

export type QuestTask = Task<never, QuestContext> & {
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

function indexTask<T>(
  index: Map<T, QuestTask[]>,
  key: T,
  task: QuestTask,
): void {
  const tasks = index.get(key);
  if (tasks) {
    tasks.push(task);
  } else {
    index.set(key, [task]);
  }
}

export function desiredDropsFor(item: Item): DesiredDrop[] {
  const tasks = getEngine().getContext().tasksWantingDrop().get(item) ?? [];

  return tasks.flatMap((task) =>
    taskDesiredEncounters(task).drops.filter((drop) => drop.item === item),
  );
}

export function desiredFightsFor(
  monster: Monster,
): { fight: DesiredFights; fightsInTask: number }[] {
  const tasks = getEngine().getContext().tasksWantingFight().get(monster) ?? [];

  return tasks.flatMap((task) => {
    const { fights } = taskDesiredEncounters(task);
    const fight = fights.find((f) => {
      const arr = Array.isArray(f.monster) ? f.monster : [f.monster];
      return !(arr[0] instanceof Phylum) && arr.includes(monster);
    });
    return fight ? [{ fight, fightsInTask: fights.length }] : [];
  });
}

// a phylum want only covers the phylum as it shows up in the task's own zones
function taskZoneHasMonster(task: QuestTask, monster: Monster): boolean {
  const context = getEngine().getContext();

  return taskLocations(task).some((location) =>
    context
      .zoneMonsters(location)
      .some(([mon, rate]) => mon === monster && rate > 0),
  );
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

  if (
    forcing.combatRateControlled !== false &&
    location.combatPercent > 0 &&
    location.combatPercent < 100
  ) {
    // a random noncombat may beat us to it
    const noncombatChance =
      100 - (location.combatPercent - numericModifier("Combat Rate"));
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
 * If spending a forcer on a saving this size is one of the most turn saving ways to spend one, counting as many wants as we have forcers left today.
 */
function isTopUseOfAForcer(turnsSaved: number): boolean {
  if (turnsSaved === 0) return false;

  let betterUses = 0;

  for (const task of getAllQuestTasks()) {
    if (!task.forcedNonCombats || !isAvailable(task)) continue;

    const taskLocation = taskLocations(task)[0];
    if (taskLocation === undefined) continue;

    // a task can want several forcers, each entry is one of them
    betterUses += task
      .forcedNonCombats()
      .filter(
        (forcing) => turnsSavedByForcing(taskLocation, forcing) > turnsSaved,
      ).length;
  }

  return betterUses < remainingNCForcesAvailable();
}

/**
 * If forcing a noncombat here is one of the most turn saving ways to spend a forcer.
 */
export function isTopLocationToForceNoncombat(location: Location): boolean {
  return isTopUseOfAForcer(turnsSavedByForcingNoncombatHere(location));
}

/**
 * Prints every location a task wants a noncombat forced at, and what forcing there would save us.
 */
export function printForcedNoncombatLocations(): void {
  printHtml(
    `Noncombat forcers available: ${remainingNCForcesAvailable()}`,
    false,
  );

  const rows: { saved: number; lines: string[] }[] = [];

  for (const task of getAllQuestTasks()) {
    if (!task.forcedNonCombats) continue;

    const location = taskLocations(task)[0];
    if (location === undefined) continue;

    const where = `${task.name} @ ${location.toString()}`;

    if (isComplete(task)) {
      rows.push({
        saved: -2,
        lines: [
          `<font color=gray>${where}: done, will not want a forcer</font>`,
        ],
      });
      continue;
    }

    const available = isAvailable(task);
    const wants = task.forcedNonCombats().map((forcing, index) => {
      const saved = turnsSavedByForcing(location, forcing);
      const claimed =
        forcing.turnsSavedByForcedNC === undefined
          ? ""
          : `, claims ${forcing.turnsSavedByForcedNC}`;
      const top =
        available && isTopUseOfAForcer(saved)
          ? " <b>[best use of a forcer]</b>"
          : "";

      return (
        `&nbsp;&nbsp;- <font color=${index % 2 === 0 ? "blue" : "purple"}>` +
        `#${index + 1}${forcing.name ? ` ${forcing.name}` : ""} saves ${saved} ` +
        `(setup ${forcing.turnsRequiredForSetup}, until NC ${turnsUntilForcedNoncombat(location)}${claimed})` +
        `</font>${top}`
      );
    });

    rows.push({
      saved: available ? turnsSavedByForcingNoncombatHere(location) : -1,
      lines: [
        `<font color=${available ? "green" : "darkred"}>${where}</font>:` +
          `${wants.length > 0 ? "" : " wants no forcers right now"}`,
        ...wants,
      ],
    });
  }

  rows.sort((a, b) => b.saved - a.saved);

  for (const line of rows.flatMap((row) => row.lines)) {
    printHtml(line, false);
  }
}

function isItemEncounter(
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
            return (
              arr.includes(monster.phylum) && taskZoneHasMonster(t, monster)
            );
          }

          return arr.includes(monster);
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

export function getDesiredMonsterFights(
  monster: Monster,
  freeKills = false,
): number | undefined {
  const context = getEngine().getContext();
  const tasks = new Set([
    ...(context.tasksWantingFight().get(monster) ?? []),
    ...(context.tasksWantingPhylumFight().get(monster) ?? []),
  ]);

  let needed: number | undefined;

  for (const task of tasks) {
    let byPhylum: number | undefined;
    let byMonster: number | undefined;

    for (const fight of taskDesiredEncounters(task).fights) {
      const arr = Array.isArray(fight.monster)
        ? fight.monster
        : [fight.monster];

      if (arr[0] instanceof Phylum) {
        if (arr.includes(monster.phylum) && taskZoneHasMonster(task, monster)) {
          byPhylum = (byPhylum ?? 0) + fight.needAmount;
        }
      } else if (arr.includes(monster)) {
        byMonster = (byMonster ?? 0) + fight.needAmount;
      }
    }

    // a phylum want is filled by any of its monsters, so it can't raise how many of this
    // one we need to copy, but a free kill of this one still advances it
    const taskNeed =
      freeKills && byPhylum !== undefined
        ? Math.max(byMonster ?? 0, byPhylum)
        : (byMonster ?? byPhylum);

    if (taskNeed !== undefined) {
      needed = (needed ?? 0) + taskNeed;
    }
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

function emptyContext(): QuestContext {
  const monstersByZone = new Map<Location, [Monster, number][]>();
  const monstersByCategory = new Map<string, Monster[]>();
  const incompleteZoneMonsters = new Set<Monster>();
  const tasksWantingDrop = new Map<Item, QuestTask[]>();
  const tasksWantingFight = new Map<Monster, QuestTask[]>();
  const tasksWantingPhylumFight = new Map<Monster, QuestTask[]>();
  let incompleteTasks: QuestTask[] | undefined;
  let baseballAssignments: BaseballDiamond.BaseballAssignment[] | undefined;
  let baseballFillOutZone: Location | undefined;
  let availableTaskZones: Location[] | undefined;
  let swept = false;

  function sweep(): void {
    if (swept) return;
    // flag it before we sweep, because completed() can read back through here
    swept = true;

    untimed(() => {
      incompleteTasks = getEngine().tasks.filter(
        (task) => !task.completed(context),
      );

      for (const task of incompleteTasks) {
        const { drops, fights } = taskDesiredEncounters(task);
        const phylums = fights.flatMap((fight) => {
          const arr = Array.isArray(fight.monster)
            ? fight.monster
            : [fight.monster];
          return arr[0] instanceof Phylum ? (arr as Phylum[]) : [];
        });
        const phylumMonsters = new Set<Monster>();

        for (const location of taskLocations(task)) {
          for (const [monster, rate] of context.zoneMonsters(location)) {
            if (rate <= 0) continue;
            incompleteZoneMonsters.add(monster);
            if (phylums.includes(monster.phylum)) phylumMonsters.add(monster);
          }
        }

        for (const monster of phylumMonsters) {
          indexTask(tasksWantingPhylumFight, monster, task);
        }
        for (const drop of drops) {
          indexTask(tasksWantingDrop, drop.item, task);
        }
        for (const fight of fights) {
          const monsters = Array.isArray(fight.monster)
            ? fight.monster
            : [fight.monster];
          for (const monster of monsters) {
            if (monster instanceof Monster) {
              indexTask(tasksWantingFight, monster, task);
            }
          }
        }
      }
    });
  }

  const context: QuestContext = {
    incompleteTasks: () => {
      sweep();
      return incompleteTasks;
    },
    incompleteZoneMonsters: () => {
      sweep();
      return incompleteZoneMonsters;
    },
    tasksWantingDrop: () => {
      sweep();
      return tasksWantingDrop;
    },
    tasksWantingFight: () => {
      sweep();
      return tasksWantingFight;
    },
    tasksWantingPhylumFight: () => {
      sweep();
      return tasksWantingPhylumFight;
    },
    // the search reads context we might still be building, so it waits until asked
    baseballAssignments: () => {
      baseballAssignments ??= BaseballDiamond.baseballBuildAssignments(
        BaseballDiamond.baseballRecruits(),
      );
      return baseballAssignments;
    },
    baseballFillOutZone: () => {
      baseballFillOutZone ??= BaseballDiamond.baseballFillOutZone(
        context.baseballAssignments(),
      );
      return baseballFillOutZone;
    },
    availableTaskZones: () => {
      availableTaskZones ??= [
        ...new Set(getIncompleteQuestTasks().flatMap(taskLocations)),
      ].filter((loc) => loc !== $location.none && zone_available(loc));
      return availableTaskZones;
    },
    zoneMonsters: (location) => {
      let monsters = monstersByZone.get(location);
      if (!monsters) {
        monsters = Object.entries(appearanceRates(location)).map(
          ([monster, rate]): [Monster, number] => [Monster.get(monster), rate],
        );
        monstersByZone.set(location, monsters);
      }
      return monsters;
    },
    // each miss re-checks every row in the category's .dat, js: conditions included
    categoryMonsters: (category, location) => {
      const key = `${category}:${location}`;
      let monsters = monstersByCategory.get(key);
      if (!monsters) {
        monsters = auto_getMonstersAt(category, location);
        monstersByCategory.set(key, monsters);
      }
      return monsters;
    },
  };

  return context;
}

export class AutoscendEngine extends ContextualEngine<
  never,
  QuestContext,
  QuestTask
> {
  lastSuccessfulTask?: QuestTask;
  executing: QuestTask[] = [];
  private context?: QuestContext;

  // grimoire's initPropertiesManager() forces these to its own defaults on
  // every engine construction, which happens on every runTaskChain call now
  // that quests are migrated — that blanks out autoscend's real script hooks
  // (see auto_begin()'s backupSetting calls in autoscend.ts) and caused
  // choiceAdventureScript to go missing mid-run, breaking choice handling.
  static defaultSettings = {
    ...ContextualEngine.defaultSettings,
    hpAutoRecoveryTarget: "-0.05",
    mpAutoRecoveryTarget: "-0.05",
  };

  constructor(tasks: QuestTask[]) {
    super(tasks, { ccs: "" });
  }

  // Grimoire calls this on every task method call, so build it once.
  getContext(): QuestContext {
    this.context ??= emptyContext();
    return this.context;
  }

  invalidateContext(): void {
    this.context = undefined;
  }

  // Quest tasks manage their own combat/logging via autoAdv, not grimoire's
  // combat/outfit/acquire machinery, so grimoire's per-execute "Executing X"
  // print and autoattack/CCS churn are just noise here.
  printExecutingMessage(): void {}

  setCombat(): void {}

  available(task: QuestTask): boolean {
    if (!super.available(task)) return false;

    if (task.forcedNonCombats) {
      const location = taskLocations(task)[0];
      if (
        location !== undefined &&
        task.forcedNonCombats()[0]?.turnsRequiredForSetup === 0 &&
        auto_shouldDelayForForcedNonCombat(location)
      ) {
        return false;
      }
    }

    const locations = taskLocations(task);
    if (
      locations.length > 0 &&
      SwordOfSwords.copierShouldDelayZone(locations)
    ) {
      return false;
    }

    return true;
  }

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
      this.invalidateContext();
      const result =
        typeof task.do === "function" ? task.do(this.getContext()) : task.do;

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
      invalidatePath();
      this.invalidateContext();
    }

    if (task === this.lastSuccessfulTask) {
      auto_log_debug(`> Executed ${task.name}`);
      abortIfRepeating();
    }
  }
}

let engineInstance: AutoscendEngine | undefined;

export function getEngine(): AutoscendEngine {
  if (!engineInstance) {
    engineInstance = new AutoscendEngine(questTasks);
    markEngineBuilt();
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

function getAllQuestTasks(): QuestTask[] {
  return questTasks;
}

// Returns the tasks that are currently executing, this includes the parents in the stack, the stack may have conflicting information on locations
function getExecutingQuestTasks(): QuestTask[] {
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
    const context = getEngine().getContext();
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
  const context = getEngine().getContext();
  return (
    context.incompleteTasks() ??
    getEngine().tasks.filter((task) => !task.completed(context))
  );
}

export function isComplete(tasks: QuestTask | QuestTask[]): boolean {
  return (Array.isArray(tasks) ? tasks : [tasks]).every((t) =>
    t.completed(getEngine().getContext()),
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
