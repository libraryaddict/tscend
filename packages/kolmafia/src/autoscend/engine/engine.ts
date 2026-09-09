import { ContextualEngine, Task } from "grimoire-kolmafia";
import {
  appearanceRates,
  availableAmount,
  Item,
  Location,
  max,
  min,
  Monster,
  numericModifier,
  Path,
  Phylum,
  printHtml,
  turnsUntilForcedNoncombat,
} from "kolmafia";
import { $location } from "libram";

import { BaseballDiamond, SwordOfSwords } from "../../types";
import { zone_available } from "../auto_zone";
import { autoAdv } from "../executors/auto_adventure";
import { auto_abort, auto_log_debug } from "../utils/auto_log";
import {
  auto_getMonstersAt,
  auto_shouldDelayForForcedNonCombat,
  auto_waitingOnQueuedWanderers,
  ensuredDropsPerFight,
  getMonsterDrops,
  isItemDropControlled,
  remainingNCForcesAvailable,
} from "../utils/auto_util";
import { abortIfRepeating } from "../utils/infiniteAdvDetector";
import { invalidatePath } from "../utils/kolmafiaUtils";
import {
  markEngineBuilt,
  pruneOffPathTasks,
  questTasks,
  registerQuestTask,
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
  // The path(s) this task is only ever done on, on any other path it is pruned before the
  // engine is built. Children of a task inherit it.
  path?: Path | Path[];
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

/**
 * A task that exists purely to group other tasks: running it runs its children in
 * order. It does no adventuring of its own, so it declares no locations, encounters
 * or noncombat forcings.
 */
export type QuestContainer = Omit<
  QuestTask,
  | "do"
  | "locations"
  | "reqAdventures"
  | "desiredEncounters"
  | "forcedNonCombats"
> & {
  children: QuestTask[];
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
      const saved = Math.round(100 / noncombatChance);
      if (turnsSaved < 0) {
        turnsSaved = saved;
      }
      turnsSaved = min(turnsSaved, saved);
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

/**
 * If we're fighting against a monster that the current executing tasks do care about. Doesn't mean we don't care about the monster, eg, wanderer
 */
export function fightingDesiredTaskMonster(monster: Monster): boolean {
  if (monster.boss) return true;
  const drops = getMonsterDrops(monster).map((drop) => drop.item);

  return getExecutingQuestTasks().some((task) => {
    const { drops: wantedItems, fights } = taskDesiredEncounters(task);

    return (
      wantedItems.some((want) => drops.includes(want.item)) ||
      fights.some((fight) => matchesDesiredFight(task, fight, monster))
    );
  });
}

function matchesDesiredFight(
  task: QuestTask,
  fight: DesiredFights,
  monster: Monster,
): boolean {
  const monsters = Array.isArray(fight.monster)
    ? fight.monster
    : [fight.monster];

  return monsters[0] instanceof Phylum
    ? monsters.includes(monster.phylum) && taskZoneHasMonster(task, monster)
    : monsters.includes(monster);
}

// Why one incomplete task still wants to see a monster. The three reasons are kept apart
// because they aggregate differently: fights are consumed per task, a drop is shared
// inventory, and a phylum want is filled by any monster of that phylum.
export type MonsterWant = {
  task: QuestTask;
  // fights the task asked for by naming this monster
  byMonster: number | undefined;
  // fights the task's phylum want would accept from this monster
  byPhylum: number | undefined;
  // fights this monster's drops still owe the task
  byDrop: number | undefined;
  // how many separate things the task wants, for callers judging "is this all it needs"
  wantsInTask: number;
};

// Every reason the incomplete tasks still want this monster, one row per task that wants it.
export function monsterWants(monster: Monster): MonsterWant[] {
  const context = getEngine().getContext();
  const monsterDrops = getMonsterDrops(monster);
  const tasks = new Set([
    ...(context.tasksWantingFight().get(monster) ?? []),
    ...(context.tasksWantingPhylumFight().get(monster) ?? []),
    ...monsterDrops.flatMap(
      (drop) => context.tasksWantingDrop().get(drop.item) ?? [],
    ),
  ]);

  const wants: MonsterWant[] = [];

  for (const task of tasks) {
    const { drops, fights } = taskDesiredEncounters(task);
    const want: MonsterWant = {
      task,
      byMonster: undefined,
      byPhylum: undefined,
      byDrop: undefined,
      wantsInTask: drops.length + fights.length,
    };

    for (const fight of fights) {
      if (!matchesDesiredFight(task, fight, monster)) continue;

      const isPhylum =
        (Array.isArray(fight.monster)
          ? fight.monster
          : [fight.monster])[0] instanceof Phylum;

      if (isPhylum) {
        want.byPhylum = (want.byPhylum ?? 0) + fight.needAmount;
      } else {
        want.byMonster = (want.byMonster ?? 0) + fight.needAmount;
      }
    }

    for (const drop of drops) {
      if (!monsterDrops.some((d) => d.item === drop.item)) continue;

      // a rare drop still needs the fights, it just takes more of them
      const perFight = max(1, ensuredDropsPerFight(monster, drop.item));

      want.byDrop = Math.max(
        want.byDrop ?? 0,
        Math.ceil(drop.needAmount / perFight),
      );
    }

    if (
      want.byMonster !== undefined ||
      want.byPhylum !== undefined ||
      want.byDrop !== undefined
    ) {
      wants.push(want);
    }
  }

  return wants;
}

export function getDesiredMonsterFights(
  monster: Monster,
  freeKills = false,
): number | undefined {
  let needed: number | undefined;

  for (const { byMonster, byPhylum } of monsterWants(monster)) {
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

// A drop want caps copies the same way a fight want does: enough fights to cover what this
// monster's drops still owe us. Shared inventory, so the hungriest task sets the count.
export function getDesiredMonsterDropFights(
  monster: Monster,
): number | undefined {
  let needed: number | undefined;

  for (const { byDrop } of monsterWants(monster)) {
    if (byDrop !== undefined) needed = Math.max(needed ?? 0, byDrop);
  }

  return needed;
}

// The item drop % that would put every wanted drop of this monster at a guaranteed 100%
function itemDropNeededFrom(
  monster: Monster,
  wanted: Item[],
): number | undefined {
  let needed: number | undefined;

  for (const drop of getMonsterDrops(monster)) {
    if (!isItemDropControlled(drop) || !wanted.includes(drop.item)) continue;
    needed = max(needed ?? 0, 10000 / drop.rate);
  }

  return needed;
}

function taskZoneMonsters(task: QuestTask): Monster[] {
  return taskLocations(task).flatMap((location) =>
    Object.entries(appearanceRates(location))
      .filter(([, rate]) => rate > 0)
      .map(([name]) => Monster.get(name)),
  );
}

/**
 * Finds the item drop needed for a monster, if any incomplete task still wants one of its drops.
 */
export function getDesiredItemDrop(monster: Monster): number | undefined {
  const wanted = getIncompleteQuestTasks().flatMap((task) =>
    taskDesiredEncounters(task).drops.map((drop) => drop.item),
  );

  return itemDropNeededFrom(monster, wanted);
}

export function getNeededItemDrop(): number | undefined {
  let needed: number | undefined;

  for (const task of getExecutingQuestTasks()) {
    const wanted = taskDesiredEncounters(task).drops.map((drop) => drop.item);
    if (wanted.length === 0) continue;

    for (const monster of taskZoneMonsters(task)) {
      const drop = itemDropNeededFrom(monster, wanted);
      if (drop !== undefined) needed = max(needed ?? 0, drop);
    }
  }

  return needed;
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

    if (auto_waitingOnQueuedWanderers(task)) {
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
    pruneOffPathTasks();
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

function describeDesiredFight(fight: DesiredFights): string {
  const monsters = Array.isArray(fight.monster)
    ? fight.monster
    : [fight.monster];
  const names = monsters.map((monster) => monster.toString()).join(" / ");
  return monsters[0] instanceof Phylum ? `phylum ${names}` : names;
}

export function printAllDesiredEncounters(): void {
  const rows: { rank: number; lines: string[] }[] = [];
  const wantedBy = new Map<string, { total: number; tasks: string[] }>();

  for (const task of getAllQuestTasks()) {
    if (!task.desiredEncounters || isComplete(task)) continue;

    const available = isAvailable(task);
    const { drops, fights } = taskDesiredEncounters(task);
    if (drops.length === 0 && fights.length === 0) continue;

    for (const { key, needAmount } of [
      ...drops.map((drop) => ({
        key: drop.item.name,
        needAmount: drop.needAmount,
      })),
      ...fights.map((fight) => ({
        key: describeDesiredFight(fight),
        needAmount: fight.needAmount,
      })),
    ]) {
      const entry = wantedBy.get(key) ?? { total: 0, tasks: [] };
      entry.total += needAmount;
      entry.tasks.push(`${task.name} x${needAmount}`);
      wantedBy.set(key, entry);
    }

    const wants = [
      ...drops.map(
        (drop) =>
          `&nbsp;&nbsp;- <font color=blue>${drop.item.name} x${drop.needAmount}</font> ` +
          `(have ${availableAmount(drop.item)})`,
      ),
      ...fights.map(
        (fight) =>
          `&nbsp;&nbsp;- <font color=purple>${describeDesiredFight(fight)} ` +
          `x${fight.needAmount}</font>`,
      ),
    ];

    rows.push({
      rank: available ? 0 : 1,
      lines: [
        `<font color=${available ? "green" : "darkred"}>${task.name}</font>` +
          `${available ? "" : " (not ready)"}:`,
        ...wants,
      ],
    });
  }

  rows.sort((a, b) => a.rank - b.rank);

  for (const line of rows.flatMap((row) => row.lines)) {
    printHtml(line, false);
  }

  if (wantedBy.size === 0) return;

  printHtml("Wanted by incomplete tasks:", false);

  for (const [key, entry] of [...wantedBy].sort(([a], [b]) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )) {
    printHtml(
      `&nbsp;&nbsp;- ${key} x${entry.total} (${entry.tasks.join(", ")})`,
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

export function registerQuestContainer(container: QuestContainer): QuestTask {
  const { children, ...rest } = container;
  const task = registerQuestTask<QuestTask>({
    ...rest,
    do: () => runTaskChain(children),
  });

  for (const child of children) {
    // a child registered elsewhere is shared, gating it here would leak this container's
    // completion onto everyone else using it
    if (!questTasks.includes(child)) {
      registerQuestTask(task, child);
    }
  }

  return task;
}
