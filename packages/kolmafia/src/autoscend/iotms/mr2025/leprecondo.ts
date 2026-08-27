import {
  availableAmount,
  canDrink,
  canEat,
  closetAmount,
  Effect,
  freeCrafts,
  freeSmiths,
  fullnessLimit,
  inebrietyLimit,
  inHardcore,
  Item,
  itemAmount,
  lastMonster,
  max,
  min,
  Monster,
  myFullness,
  myInebriety,
  myPrimestat,
  mySpleenUse,
  removeProperty,
  spleenLimit,
  use,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $monster,
  $stat,
  get,
  getAverageAdventures,
  Leprecondo,
  set,
} from "libram";

import { AutoChestMimic, FantasyRealm } from "../../../types";
import {
  auto_canChew,
  autoChew,
  getCachedConsumables,
  spleen_left,
} from "../../auto_consume";
import { pathHasFamiliar } from "../../auto_familiar";
import {
  auto_is_valid,
  auto_log_info,
  canSummonMonster,
  handleTracker,
  internalQuestStatus,
  knapsack,
  safeGet,
  summonMonsterCount,
} from "../../auto_util";
import { in_zombieSlayer } from "../../paths/2012/zombie_slayer";
import { in_kolhs } from "../../paths/2013/kolhs";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_small } from "../../paths/2023/small";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import { towerKeyCount } from "../../quests/level_13";

function auto_haveLeprecondo(): boolean {
  return auto_is_valid($item`Leprecondo`) && Leprecondo.have();
}

type LeprecondoPiece = Leprecondo.FurniturePiece;

type LeprecondoValues = Partial<
  Record<LeprecondoPiece, Partial<Record<Leprecondo.Need, number>>>
>;

// Map of Leprecondo result (Effect or Item) to its score.
const LEPRECONDO_RESULTS_SCORE = new Map<Effect | Item, number>([
  [
    $effect`Your Days Are Numbed`,
    !pathHasFamiliar() || in_avantGuard() ? 0 : 100,
  ], // +5 fam weight & exp effect
  [$effect`Vicarious Sweat`, 90], // +30hp, 15% item drop effect
  [$effect`Counter Intelligence`, 80], // +30% meat effect
  [$item`crafting plans`, 70], // crafting plans
  [$effect`Spacious Night's Sleep`, 50], // 100% init, all stats +10% effect
  [$effect`Sur La Table`, 50], // mp/hp regen effect
  [$effect`Wasting Time`, 40], // Moxie effect
  [
    $effect`Alone with Your Thoughts`,
    myPrimestat() === $stat`Mysticality` ? 40 : 11,
  ], // 20 myst & spell dmg, 50% max mp effect
  [$effect`Work Out Smarter, Not Harder`, 40], // 20 mus & weapon dmg, 50% max hp effect
  [$effect`Well Stimulated`, 40], // Myst effect
  [$effect`Gym Bros`, 40], // Muscles effect
  [
    $effect`You Might Have Gotten Wet`,
    myPrimestat() === $stat`Moxie` ? 40 : 10,
  ], // 20 mox & ranged dmg, 10 dr effect
  [$item`phosphor traces`, 10], // phosphor traces
  [$effect`Moist Night's Sleep`, 10], // 50% init, 2 hot res, 10 cold dmg effect
  [$effect`Quiet Night's Sleep`, 10], // 50% init, mp regen effect
  [$effect`Good Night's Sleep`, 10], // +25 init
  [$item`table tennis ball`, 10], // table tennis ball
  [$item`bar dart`, 0], // bar dart
  [$item`scoop of pre-workout powder`, 0], // scoop of pre-workout powder
  [$item`leprechaun antidepressant pill`, 0], // leprechaun antidepressant pill
  [$effect`Tired Muscles`, -10], // -combat effect
]);

// Transformer for the above values
function auto_leprecondoBaseValues(): LeprecondoValues {
  const baseValues: LeprecondoValues = {};

  for (const piece of Leprecondo.FURNITURE_PIECES) {
    if (piece === "empty") continue;

    const stats = Leprecondo.getStats(piece);

    for (const need of Leprecondo.NEEDS) {
      const result = stats[need];
      if (!result) continue;

      let score: number;

      if (need === "food" || need === "booze") {
        if (in_amw()) {
          score =
            piece === "Omnipot" || piece === "fully-stocked wet bar" ? 1 : 0;
        } else {
          score = countItemAverageAdvs(need, piece);
        }
      } else {
        const key: Effect | Item =
          "effect" in result ? result.effect : (result as Item);
        score = LEPRECONDO_RESULTS_SCORE.get(key) ?? 0;
      }

      baseValues[piece] ??= {};
      baseValues[piece][need] = score;
    }
  }

  return baseValues;
}

// Situational bonuses added on top of the baseline
function auto_leprecondoExtras(doingBedtime: boolean): {
  condition: boolean;
  values: LeprecondoValues;
}[] {
  // Here, we're just doing some basic logic to try group rearranges together
  const doneOrgans = get("_auto_leprecondoDoneWith").split(",").filter(Boolean);

  function markDone(key: string) {
    if (doneOrgans.includes(key)) return;

    doneOrgans.push(key);
    set("_auto_leprecondoDoneWith", doneOrgans.join(","));
  }

  const canConsume =
    !in_small() && !in_amw() && !in_darkGyffte() && !in_kolhs();

  const organs = {
    food: {
      active:
        canEat() &&
        canConsume &&
        !in_zombieSlayer() &&
        countItemAverageAdvs("food", "Omnipot") >=
          get("auto_consumeMinAdvPerFill", 0.0) &&
        (doingBedtime || !doneOrgans.includes("food")),
      surplus:
        doingBedtime || !doneOrgans.includes("food")
          ? leprecondoFoodSurplus(doingBedtime)
          : 0,
    },
    booze: {
      active:
        canDrink() &&
        canConsume &&
        countItemAverageAdvs("booze", "fully-stocked wet bar") >=
          get("auto_consumeMinAdvPerFill", 0.0) &&
        (doingBedtime || !doneOrgans.includes("booze")),
      surplus:
        doingBedtime || !doneOrgans.includes("booze")
          ? leprecondoBoozeSurplus(doingBedtime)
          : 0,
    },
    traces: {
      active:
        spleenLimit() > 0 &&
        !isActuallyEd() &&
        canConsume &&
        (doingBedtime || !doneOrgans.includes("traces")),
      surplus: leprecondoTracesSurplus(doingBedtime),
    },
    plans: {
      active:
        auto_is_valid($item`crafting plans`) && !doneOrgans.includes("plans"),
      surplus:
        Math.min(freeCrafts(), freeSmiths()) +
        itemAmount($item`crafting plans`) -
        6,
    },
  };

  const extraFill = 3;

  // Is any active organ currently behind, but within the extraFill threshold?
  const isSomeoneCatchingUp = Object.values(organs).some(
    (o) => o.active && o.surplus < 0 && o.surplus >= -extraFill,
  );

  for (const [id, organ] of Object.entries(organs)) {
    // Skip if we don't want it, or if it hasn't reached surplus yet
    if (!organ.active || organ.surplus < 0) continue;

    // We wait if we are <= extraFill and someone is actively catching up
    const shouldWait = organ.surplus <= extraFill && isSomeoneCatchingUp;

    if (!shouldWait) {
      organ.active = false;
      markDone(id);
    }
  }

  // This should be a total of 1 to 3 rearrangements in a day
  return [
    {
      // Still want today's food
      condition: organs.food.active,
      values: { Omnipot: { food: 500 } },
    },
    {
      // Still want today's booze
      condition: organs.booze.active,
      values: { "fully-stocked wet bar": { booze: 500 } },
    },
    {
      // Still want today's phosphor traces
      condition: organs.traces.active,
      values: {
        "ultimate retro game console": { "dumb entertainment": 500 },
      },
    },
    {
      // +5 fam weight & exp effect
      condition: pathHasFamiliar() && !in_avantGuard(),
      values: {
        "cupcake treadmill": { exercise: 200 },
        "couch and flatscreen": { "dumb entertainment": 200 },
        "UltraDance karaoke machine": { "dumb entertainment": 200 },
      },
    },
    {
      // Prioritize crafting plans while we're short on free crafts/smiths
      condition: organs.plans.active,
      values: {
        "internet-connected laptop": { "mental stimulation": 120 },
      },
    },
  ];
}

function getLeprecondoItems(
  need: Leprecondo.Need,
  piece: LeprecondoPiece,
): Item[] {
  // Add a safety check in case getLeprecondoItems handles a missed need
  const result = Leprecondo.getStats(piece)[need];
  if (!result) return [];

  const items = Array.isArray(result) ? result : [result];

  return items.filter((i) => i instanceof Item) as Item[];
}

// Counts the amount of organ this piece's items fills up
function leprecondoPieceOrgansSize(
  need: Leprecondo.Need,
  piece: LeprecondoPiece,
): number {
  return getLeprecondoItems(need, piece)
    .map(
      (i) =>
        (itemAmount(i) + closetAmount(i)) *
        (i.fullness + i.inebriety + i.spleen),
    )
    .reduce((l, r) => l + r, 0);
}

// Get's the average avgs from this item's piece, used for food/booze
function countItemAverageAdvs(
  need: Leprecondo.Need,
  piece: LeprecondoPiece,
): number {
  const items = getLeprecondoItems(need, piece);

  return (
    items
      .map(
        (i) => getAverageAdventures(i) / (i.fullness + i.inebriety + i.spleen),
      )
      .reduce((l, r) => l + r, 0) / items.length
  );
}

// Space the normal diet loop would fill with non-leprecondo stuff that's at least as good as what we have installed
function leprecondoReservedSpace(
  need: "food" | "booze",
  piece: LeprecondoPiece,
  requiredSpace: number,
): number {
  if (requiredSpace <= 0) return 0;

  const actions = getCachedConsumables(need === "food" ? "eat" : "drink");
  if (!actions) return 0;

  const ownItems = new Set(getLeprecondoItems(need, piece));
  const ownAdvsPerFill = countItemAverageAdvs(need, piece);

  const weight = new Map<number, number>();
  const desirability = new Map<number, number>();
  let idx = 0;
  for (const action of actions.values()) {
    if (
      action.size <= 0 ||
      ownItems.has(action.it) ||
      getAverageAdventures(action.it) / action.size < ownAdvsPerFill
    ) {
      continue;
    }
    weight.set(idx, action.size);
    desirability.set(idx, action.desirability);
    idx++;
  }

  const packed = knapsack(requiredSpace, weight.size, weight, desirability);
  let filled = 0;
  for (const i of packed) {
    filled += weight.get(i) ?? 0;
  }
  return filled;
}

function leprecondoFoodSurplus(doingBedtime: boolean): number {
  const cap =
    max(fullnessLimit(), isActuallyEd() ? 5 : 15) * (doingBedtime ? 2 : 1);
  const reserved = leprecondoReservedSpace("food", "Omnipot", cap);
  return (
    leprecondoPieceOrgansSize("food", "Omnipot") -
    (cap - reserved) -
    myFullness()
  );
}

function leprecondoBoozeSurplus(doingBedtime: boolean): number {
  const inebCap = max(inebrietyLimit(), isActuallyEd() ? 5 : 14);
  const cap = inebCap * (doingBedtime ? 2 : 1);
  const reserved = leprecondoReservedSpace(
    "booze",
    "fully-stocked wet bar",
    cap,
  );
  return (
    leprecondoPieceOrgansSize("booze", "fully-stocked wet bar") -
    (cap - reserved) -
    min(inebCap, myInebriety())
  );
}

function leprecondoTracesSurplus(doingBedtime: boolean): number {
  const spleenCap = min(15, spleenLimit());
  const spleenUsable = Math.floor((spleenCap - mySpleenUse()) / 3) * 3;
  const totalSpleenAvailable = spleenUsable + (doingBedtime ? spleenCap : 0);

  return availableAmount($item`phosphor traces`) * 3 - totalSpleenAvailable;
}

// Declares how much each need is worth per furniture piece
function auto_leprecondoValues(doingBedtime: boolean): LeprecondoValues {
  const values: LeprecondoValues = {};

  const addAll = (table: LeprecondoValues) => {
    for (const [piece, needs] of Object.entries(table) as [
      LeprecondoPiece,
      Partial<Record<Leprecondo.Need, number>>,
    ][]) {
      values[piece] ??= {};
      for (const [need, score] of Object.entries(needs!) as [
        Leprecondo.Need,
        number,
      ][]) {
        values[piece]![need] ??= 0;
        values[piece]![need]! += score;
      }
    }
  };

  addAll(auto_leprecondoBaseValues());
  for (const extra of auto_leprecondoExtras(doingBedtime)) {
    if (!extra.condition) {
      continue;
    }

    addAll(extra.values);
  }

  return values;
}

// Greedy picks the piece with the highest remaining value until 4 slots are filled or nothing left.
function auto_leprecondoTarget(doingBedtime: boolean): LeprecondoPiece[] {
  const values = auto_leprecondoValues(doingBedtime);
  const discovered = new Set(Leprecondo.discoveredFurniture());
  let candidates = Leprecondo.FURNITURE_PIECES.filter(
    (p) => p !== "empty" && discovered.has(p) && values[p] !== undefined,
  );

  const claimedNeeds = new Map<Leprecondo.Need, number>();
  const target: LeprecondoPiece[] = [];

  // Pick up to 4 pieces that provide the highest marginal value for unfulfilled needs.
  // This doesn't do the optimal, just a quick pass
  while (target.length < 4) {
    let best: LeprecondoPiece | undefined;
    let maxScore = 0;

    for (const piece of candidates) {
      let score = 0;
      const stats = Object.entries(values[piece] ?? {}) as [
        Leprecondo.Need,
        number,
      ][];

      for (const [need, val] of stats) {
        const claimed = claimedNeeds.get(need) ?? 0;
        score += Math.max(0, val - claimed);
      }

      if (score > maxScore) {
        maxScore = score;
        best = piece;
      }
    }

    if (!best) break; // No remaining pieces provide any value
    target.push(best);

    // Update claimed needs with the newly selected piece
    const bestStats = Object.entries(values[best]!) as [
      Leprecondo.Need,
      number,
    ][];
    for (const [need, val] of bestStats) {
      const claimed = claimedNeeds.get(need) ?? 0;
      claimedNeeds.set(need, Math.max(claimed, val));
    }

    candidates = candidates.filter((p) => p !== best);
  }

  // Pad any remaining empty slots
  while (target.length < 4) {
    target.push("empty");
  }

  // Brute-force all 24 combos of the 4 chosen pieces.
  // If pieces share a need, only the first piece grants its value.
  let bestOrder = target;
  let highestRealValue = -1;

  // Iterate through 3 indices; the 4th is deterministic since 0 + 1 + 2 + 3 = 6.
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      if (a === b) continue;
      for (let c = 0; c < 4; c++) {
        if (a === c || b === c) continue;

        const d = 6 - a - b - c; // The remaining unique index
        const order = [target[a], target[b], target[c], target[d]];

        let currentScore = 0;
        const seenNeeds = new Set<Leprecondo.Need>();

        // Calculate the actual value realized by this specific ordering
        for (const piece of order) {
          if (piece === "empty") continue;

          const stats = Object.entries(values[piece] ?? {}) as [
            Leprecondo.Need,
            number,
          ][];
          // Give score to first piece to claim the need
          for (const [need, val] of stats) {
            if (seenNeeds.has(need)) {
              continue;
            }

            seenNeeds.add(need);
            currentScore += val;
          }
        }

        // Save the permutation if it outperforms previous ones
        if (currentScore > highestRealValue) {
          highestRealValue = currentScore;
          bestOrder = order;
        }
      }
    }
  }

  return bestOrder;
}

function leprecondoAlreadyInstalled(
  target: LeprecondoPiece[],
  installed: readonly LeprecondoPiece[],
): boolean {
  for (let i = 0; i < target.length; i++) {
    if (target[i] !== installed[i]) {
      return false;
    }
  }
  return true;
}

export function auto_setLeprecondo(doingBedtime: boolean): boolean {
  if (!auto_haveLeprecondo() || Leprecondo.rearrangesRemaining() <= 0) {
    return false;
  }
  const installed = Leprecondo.installedFurniture();
  const target = auto_leprecondoTarget(doingBedtime);
  if (leprecondoAlreadyInstalled(target, installed)) {
    return true;
  }

  auto_log_info(
    `Rearranging Leprecondo: [${installed.join(", ")}] -> [${target.join(", ")}] (${Leprecondo.rearrangesRemaining() - (get("leprecondoInstalled") !== "" ? 1 : 0)} rearranges left)`,
    "blue",
  );

  const success = Leprecondo.setFurniture(
    target[0],
    target[1],
    target[2],
    target[3],
  );
  if (success) {
    handleTracker({
      what: $item`Leprecondo`,
      detail: target.join(", "),
      property: "auto_iotm_claim",
    });
  } else {
    auto_log_info("Leprecondo.setFurniture() reported failure", "red");
  }
  return success;
}

export function auto_useLeprecondoDrops(): boolean {
  while (availableAmount($item`crafting plans`) > 0 && freeCrafts() < 2) {
    use($item`crafting plans`);
  }
  auto_stockTracesBandit(false);
  return true;
}

// Whether we're actually committed to chaining fantasy bandit fights with Create an Afterimage right now.
export function auto_canTracesBandit(): boolean {
  return (
    !FantasyRealm.acquiredFantasyRealmToken() &&
    towerKeyCount(false) < 3 &&
    (lastMonster() === $monster`fantasy bandit` ||
      internalQuestStatus("questL13Final") === 5)
  );
}

/**
 * We reserve 4 traces for fantasy bandit, unless we don't need them. We assume we're always doing daily dungeon
 * This function isn't feature complete, it doesn't cover other situations where we don't need traces, like backup camera. This is intended for a quick hack for using traces in standard runs
 * @returns Amount of traces reserved for bandits
 */
export function auto_getReservedTraces(): number {
  if (
    FantasyRealm.fantasyRealmAvailable() ||
    !inHardcore() ||
    internalQuestStatus("questL13Final") > 5
  ) {
    return 0;
  }

  let keys = towerKeyCount();
  if (get("_lastDailyDungeonRoom") < 15) {
    keys++;
  }
  if (
    get("_lastDailyDungeonRoom") < 10 &&
    !get("candyCaneSwordDailyDungeon") &&
    auto_is_valid($item`candy cane`)
  ) {
    keys++;
  }
  if (keys >= 3) return 0;

  return 4;
}

export function auto_tracesUsesLeft(): number {
  return get("phosphorTracesUses");
}

// Bank Chest Mimic experience toward the 100 needed to extract a fantasy bandit egg.
export function auto_bankChestMimicExpForBandit(): void {
  if (
    FantasyRealm.acquiredFantasyRealmToken() ||
    !AutoChestMimic.auto_haveChestMimic() ||
    FantasyRealm.fantasyRealmAvailable() ||
    summonMonsterCount($monster`fantasy bandit`) >= 1 ||
    safeGet("auto_familiarChoice") !== $familiar.none
  ) {
    removeProperty("_auto_preferChestMimic");
    return;
  }

  set("_auto_preferChestMimic", true);
}

// Chew banked phosphor traces up to 4 charges
// Gated on auto_canTracesBandit (not just auto_wantTracesBandit) so this doesn't compete with other spleen items until we're actually about to use it.
// Any earlier banking happens for free via leftover end of day spleen instead (see bedtime_spleen).
function auto_stockTracesBandit(canPreferSummons: boolean): void {
  const summons = summonMonsterCount($monster`fantasy bandit`, true);
  const tracesNeeded = canPreferSummons ? 5 - summons : 4;
  if (
    !auto_canTracesBandit() ||
    auto_tracesUsesLeft() >= tracesNeeded ||
    !canSummonMonster($monster`fantasy bandit`)
  ) {
    return;
  }
  while (
    auto_tracesUsesLeft() < tracesNeeded &&
    auto_canChew($item`phosphor traces`) &&
    availableAmount($item`phosphor traces`) > 0 &&
    spleen_left() >= $item`phosphor traces`.spleen
  ) {
    if (autoChew(1, $item`phosphor traces`)) continue;
    break;
  }
}

export function auto_tracesTarget(target: Monster): boolean {
  return (
    auto_canTracesBandit() &&
    target === $monster`fantasy bandit` &&
    auto_tracesUsesLeft() > 0 &&
    // Fought count only ticks up after each kill, so this is still 4 during the 5th (final) fight - don't chain a 6th.
    FantasyRealm.fantasyBanditsFought() < 4
  );
}

export function auto_punchOutsLeft(): number {
  return get("preworkoutPowderUses");
}
