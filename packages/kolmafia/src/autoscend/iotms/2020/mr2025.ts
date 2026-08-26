import {
  appearanceRates,
  availableAmount,
  availableChoiceOptions,
  beretBuskingEffects,
  blackMarketAvailable,
  canDrink,
  canEat,
  canEquip,
  closetAmount,
  containsText,
  currentRound,
  Effect,
  equip,
  equippedAmount,
  equippedItem,
  floor,
  freeCrafts,
  freeSmiths,
  fullnessLimit,
  getMonsters,
  getPower,
  handlingChoice,
  haveEffect,
  haveEquipped,
  inebrietyLimit,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  lastChoice,
  lastMonster,
  Location,
  max,
  min,
  Monster,
  myBasestat,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myId,
  myInebriety,
  myLevel,
  myLocation,
  myParadoxicity,
  myPath,
  myPrimestat,
  mySpleenUse,
  myThrall,
  numericModifier,
  removeProperty,
  shrunkenHeadZombie,
  Skill,
  Slot,
  spleenLimit,
  splitString,
  Stat,
  toFloat,
  toInt,
  toSlot,
  turnsUntilMobiusNoncombatAvailable,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  weaponHands,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $monsters,
  $path,
  $phyla,
  $skill,
  $slot,
  $stat,
  $thrall,
  get,
  getAverageAdventures,
  Leprecondo,
  PeridotOfPeril,
  set,
} from "libram";

import { main as handleChoiceAdv } from "../../auto_choice_adv";
import {
  auto_canChew,
  auto_canDrink,
  auto_canEat,
  autoChew,
  getCachedConsumables,
  inebriety_left,
  spleen_left,
  stomach_left,
} from "../../auto_consume";
import {
  autoForceEquip,
  autoForceEquip$2,
  possessEquipment,
  powerMultipliers,
} from "../../auto_equipment";
import { auto_have_familiar, pathHasFamiliar } from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_info,
  auto_runChoice,
  auto_wantToBanish,
  auto_wantToFreeRun,
  auto_zonePhylumPercent,
  canSummonMonster,
  freeRunCombatAction,
  getMonsterDrops,
  handleTracker,
  internalQuestStatus,
  isFreeMonster,
  knapsack,
  level_to_min_substat,
  safeGet,
  stat_to_substat,
  summonMonsterCount,
  zoneRank,
} from "../../auto_util";
import {
  auto_canUse,
  banisherCombatAction$1,
  combat_status_add,
  combat_status_check,
} from "../../combat/auto_combat_util";
import { fightingDesiredTaskMonster } from "../../engine/engine";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_zombieSlayer } from "../../paths/2012/zombie_slayer";
import { in_kolhs } from "../../paths/2013/kolhs";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_small } from "../../paths/2023/small";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { in_hattrick } from "../../paths/2025/hattrick";
import { in_zootomist } from "../../paths/2025/zootomist";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import { inAftercore } from "../../paths/casual";
import { bridgeGoal, fastenerCount, lumberCount } from "../../quests/level_09";
import { L11_needWetStew } from "../../quests/level_11";
import { needStarKey, towerKeyCount } from "../../quests/level_13";
import {
  acquiredFantasyRealmToken,
  fantasyBanditsFought,
  fantasyRealmAvailable,
} from "../2010/mr2018";
import { auto_haveChestMimic } from "./mr2024";
import {
  auto_haveEternityCodpiece,
  auto_isInEternityCodpiece,
  auto_spadeDigsRemaining,
  auto_swordFamiliarLikesCurrentTarget,
  auto_swordFamiliarWantsMonsterDrops,
  auto_swordIsWillingToSwitchTargets,
  auto_swordOfSwordsTracking,
} from "./mr2026";

// This is meant for items that have a date of 2025

//Defined in autoscend/iotms/mr2025.ash
export function auto_haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  if (get("crAlways") || get("_crToday")) {
    return true;
  }
  return false;
}

export function auto_haveMcHugeLargeSkis(): boolean {
  if (
    auto_is_valid($item`McHugeLarge duffel bag`) &&
    availableAmount($item`McHugeLarge duffel bag`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_canEquipAllMcHugeLarge(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  let success: boolean = true;
  for (const it of $items`McHugeLarge duffel bag, McHugeLarge right pole, McHugeLarge left pole, McHugeLarge right ski, McHugeLarge left ski`) {
    success = canEquip(it) && success;
  }
  return success;
}

export function auto_equipAllMcHugeLarge(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  if (!possessEquipment($item`McHugeLarge right pole`)) {
    auto_openMcLargeHugeSkis();
  }
  autoForceEquip($slot`back`, $item`McHugeLarge duffel bag`);
  autoForceEquip($slot`weapon`, $item`McHugeLarge right pole`);
  autoForceEquip($slot`off-hand`, $item`McHugeLarge left pole`);
  autoForceEquip($slot`acc1`, $item`McHugeLarge left ski`);
  autoForceEquip($slot`acc2`, $item`McHugeLarge right ski`);
  return true;
}

export function auto_openMcLargeHugeSkis(): boolean {
  if (!auto_haveMcHugeLargeSkis()) {
    return false;
  }
  if (possessEquipment($item`McHugeLarge right pole`)) {
    return true;
  }
  //~ use($item[McHugeLarge duffel bag]); // does not work - need Mafia CLI tool?
  visitUrl("inventory.php?action=skiduffel");
  return possessEquipment($item`McHugeLarge right pole`);
}

export function auto_McLargeHugeForcesLeft(): number {
  if (!auto_haveMcHugeLargeSkis()) {
    return 0;
  }
  const used: number = get("_mcHugeLargeAvalancheUses");
  return 3 - used;
}

export function auto_McLargeHugeSniffsLeft(): number {
  if (!auto_haveMcHugeLargeSkis()) {
    return 0;
  }
  const used: number = get("_mcHugeLargeSlashUses");
  return 3 - used;
}

export function auto_haveCupidBow(): boolean {
  const bow: Item = $item`toy Cupid bow`;
  return auto_is_valid(bow) && possessEquipment(bow);
}

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
    !acquiredFantasyRealmToken() &&
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
    fantasyRealmAvailable() ||
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
    acquiredFantasyRealmToken() ||
    !auto_haveChestMimic() ||
    fantasyRealmAvailable() ||
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
    fantasyBanditsFought() < 4
  );
}

export function auto_punchOutsLeft(): number {
  return get("preworkoutPowderUses");
}

export function auto_haveAprilShowerShield(): boolean {
  const shield: Item = $item`April Shower Thoughts shield`;
  return auto_is_valid(shield) && possessEquipment(shield);
}

export function auto_getGlobs(): boolean {
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  //if breakfast hasn't run yet or they haven't been manually collected
  if (!get("_aprilShowerGlobsCollected")) {
    visitUrl("inventory.php?action=shower");
    return true;
  }
  return false;
}

export function auto_equipAprilShieldBuff(): boolean {
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  //force equip the shield if this is called
  if (weaponHands(equippedItem($slot`weapon`)) > 1) {
    //if a 2 handed weapon is equipped, unequip it
    equip($item.none, $slot`weapon`);
  }
  return autoForceEquip$2($item`April Shower Thoughts shield`, true);
}

export function auto_unequipAprilShieldBuff(): boolean {
  //Because Empathy gets replaced by Thoughtful Empathy when cast with the Shield equipped,
  //we need to make sure this is unequipped if we want to have both Empathy and Thoughtful Empathy
  if (haveEquipped($item`April Shower Thoughts shield`)) {
    return autoForceEquip($slot`off-hand`, $item.none, true);
  }
  return true;
}

export function auto_canNorthernExplosionFE(): boolean {
  //Northern Explosion becomes Feel Envy-adjacent once per day
  if (!auto_haveAprilShowerShield()) {
    return false;
  }
  if (!auto_have_skill($skill`Northern Explosion`)) {
    return false;
  }
  if (get("_aprilShowerNorthernExplosion")) {
    return false;
  }
  if (
    currentRound() > 0 &&
    equippedAmount($item`April Shower Thoughts shield`) === 0
  ) {
    return false;
  }
  return true;
}

export function auto_havePeridot(): boolean {
  const pop: Item = $item`Peridot of Peril`;
  return auto_is_valid(pop) && possessEquipment(pop);
}

export function peridotManuallyDesiredMonsters(): Monster[] {
  // manually specify some favoured monsters
  const desired_monsters: Monster[] = [
    $monster`lobsterfrogman`,
    $monster`black panther`,
    $monster`white lion`,
    $monster`monstrous boiler`,
    $monster`modern zmobie`,
    $monster`dairy goat`,
    $monster`writing desk`,
    $monster`pygmy bowler`,
  ];
  // we sniff the two-star, two-line monster, but we want exactly one star chart
  if (itemAmount($item`star chart`) === 0) {
    desired_monsters.push($monster`Astronomer`);
  }
  // Quest gremlins need IDs because there's multiple
  desired_monsters.push(
    $monster`erudite gremlin (tool)`, // erudite gremlin (tool)
    $monster`batwinged gremlin (tool)`, // batwinged gremlin (tool)
    $monster`vegetable gremlin (tool)`, // vegetable gremlin (tool)
    $monster`spider gremlin (tool)`, // spider gremlin (tool)
  );

  if (
    safeGet("auto_familiarChoice") === $familiar`Sword of S Words` &&
    auto_swordIsWillingToSwitchTargets()
  ) {
    const swordMonsters: Monster[] = [];
    const smutMonsters = $monsters`smut orc pipelayer, smut orc jacker, smut orc screwer, smut orc nailer`;

    // If we do not want every smut orc
    if (
      !smutMonsters.every((m) => auto_swordFamiliarWantsMonsterDrops(m, 100))
    ) {
      // Then we will consider peridot'ing a smut orc
      swordMonsters.push(...smutMonsters);
    }

    swordMonsters.push(...$monsters`spiny skelelton, toothy sklelton`);
    swordMonsters.push(
      ...$monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`,
    );
    swordMonsters.push($monster`shadow slab`);

    desired_monsters.push(
      ...swordMonsters.filter((m) => auto_swordFamiliarWantsMonsterDrops(m)),
    );
  }

  return desired_monsters;
}

export function auto_peridotSetZone(loc: Location): boolean {
  // if true, auto_pre_adv may add a large bonus to maximizer for peridot
  // and peridotChoiceHandler exits the choice (overrides desired monsters)
  // check that setting zone without using an adventure might be useful
  if (!(auto_spadeDigsRemaining() > 0)) {
    return false;
  }
  // we don't have enough digs to make it through the beach, so we don't merely want to set the zone
  if (loc === $location`Sonofa Beach` && auto_spadeDigsRemaining() < 5) {
    return false;
  }

  const desired_locations: Location[] = [
    $location`Sonofa Beach`,
    $location`The Hatching Chamber`,
    $location`The Feeding Chamber`,
    $location`The Royal Guard Chamber`,
    $location`The Haunted Kitchen`,
    $location`The Unquiet Garves`,
    $location`The Haunted Ballroom`,
  ];

  if (desired_locations.includes(loc)) {
    return true;
  }
  return false;
}

export function peridotChoiceHandler(choice: number, page: string): void {
  if (!auto_havePeridot()) {
    auto_runChoice(2); //should never get here but might as well mitigate
  }

  const loc: Location = myLocation();
  let bestmon: Monster = $monster.none;

  for (const [, mons] of page.matchAll(/bandersnatch" value="(\d+)/g)) {
    // identify the best possible monster to target
    const mon: Monster = Monster.get(toInt(mons));

    // Manual monster specifications
    if (peridotManuallyDesiredMonsters().includes(mon)) {
      bestmon = mon;
      break; // if we've got a force desired monster, don't bother with the rankings any more
    }

    if (
      // Pick first valid monster
      bestmon === $monster.none ||
      zoneRank(mon, loc) < zoneRank(bestmon, loc)
    ) {
      bestmon = mon;
    }
  }

  const popChoice: Monster = bestmon;
  if (bestmon === $monster.none || auto_peridotSetZone(loc)) {
    // still nothing found so just peace out. Or we want to set the zone without using an adventure.
    handleTracker({
      what: $item`Peridot of Peril`,
      location: loc,
      detail: "Peace out",
      property: "auto_mapperidot",
    });
    auto_runChoice(2); // if no match is found, hit the exit choice
    return;
  }

  handleTracker({
    what: $item`Peridot of Peril`,
    location: loc,
    detail: popChoice.toString(),
    property: "auto_mapperidot",
  });
  combat_status_add("choiceMonster");
  auto_runChoice(1, `bandersnatch=${toInt(popChoice)}`);
  return;
}

export function haveUsedPeridot(loc: Location): boolean {
  return PeridotOfPeril.periledToday(loc);
}

function auto_havePrismaticBeret(): boolean {
  const pb: Item = $item`prismatic beret`;
  return auto_is_valid(pb) && possessEquipment(pb);
}

export function canBusk(): boolean {
  if (get("_beretBuskingUses") < 5) {
    return true;
  }
  return false;
}

function beretPower(
  allHats: Map<number, Item>,
  allShirts: Map<number, Item>,
  allPants: Map<number, Item>,
): Map<string, number> {
  const multipliers: Map<Slot, number> = powerMultipliers();
  const hatPowers: Map<number, number> = new Map();
  hatPowers.set(0, 0);
  const pantPowers: Map<number, number> = new Map();
  pantPowers.set(0, 0);
  const shirtPowers: Map<number, number> = new Map();
  shirtPowers.set(0, 0);
  const powers: Map<string, number> = new Map();
  //possible power calculations
  if (!in_hattrick()) {
    if (auto_have_familiar($familiar`Mad Hatrack`)) {
      //prismatic beret on the hatrack and another hat on you
      for (const [, h] of allHats) {
        hatPowers.set(
          hatPowers.size,
          getPower(h) * (multipliers.get($slot`hat`) ?? 0),
        );
      }
    } else {
      hatPowers.set(
        0,
        getPower($item`prismatic beret`) * (multipliers.get($slot`hat`) ?? 0),
      );
    }
  } else {
    for (const [, h] of allHats) {
      if (equippedAmount(h) >= 1) {
        hatPowers.set(
          0,
          (hatPowers.get(0) ?? 0) +
            getPower(h) * (multipliers.get($slot`hat`) ?? 0),
        );
      }
    }
  }
  for (const [, p] of allPants) {
    pantPowers.set(
      pantPowers.size,
      getPower(p) * (multipliers.get($slot`pants`) ?? 0),
    );
  }
  for (const [, s] of allShirts) {
    shirtPowers.set(shirtPowers.size, getPower(s));
  }
  for (const [, hp] of hatPowers) {
    for (const [, pp] of pantPowers) {
      for (const [, sp] of shirtPowers) {
        const concat: string = `${auto_have_familiar($familiar`Mad Hatrack`) ? `${(hp / (multipliers.get($slot`hat`) ?? 0)).toString()},` : ""}${(pp / (multipliers.get($slot`pants`) ?? 0)).toString()},${sp.toString()}`;
        powers.set(concat, hp + pp + sp);
      }
    }
  }
  return powers;
}

function bestBusk(
  powers: Map<string, number>,
  effectMultiplier: string,
): string {
  //effectMultiplier string should be in format of "modifier1:float;modifier2:float;..." if multiple modifiers
  //if single modifier, does not need a multiplier
  //Do not use an ending ; for effectMultiplier
  if (!auto_havePrismaticBeret()) {
    return (0).toString();
  }
  const busksUsed: number = get("_beretBuskingUses");
  let highScore: number = 0.0;
  let highScoreString: string = "";
  let effMulti: Map<string, number> = new Map();
  let numMod: Map<number, string>;
  if (effectMultiplier === "") {
    //based on default maximizer string
    effMulti = new Map([
      ["item drop", 5],
      ["meat drop", 1],
      ["initiative", 0.5],
      ["damage absorption", 0.1],
      ["damage resistance", 1],
      ["Cold Resistance", 0.5],
      ["Hot Resistance", 0.5],
      ["Sleaze Resistance", 0.5],
      ["Stench Resistance", 0.5],
      ["Spooky Resistance", 0.5],
      [myPrimestat().toString(), 1.5],
      ["-fumble", 0],
      ["hp", 0.4],
      ["mp", 0.2],
      ["mp regen", 3],
      ["familiar weight", 2],
      ["familiar experience", 5],
    ]);
  } else {
    if (containsText(effectMultiplier, ";")) {
      //split effectMultiplier into multiple effects if needed
      for (const [, str] of splitString(effectMultiplier, ";").entries()) {
        numMod = new Map(splitString(str, ":").map((_v, _i) => [_i, _v]));
        effMulti.set(numMod.get(1) ?? "", toFloat(numMod.get(0) ?? ""));
      }
    } else if (containsText(effectMultiplier, ":")) {
      numMod = new Map(
        splitString(effectMultiplier, ":").map((_v, _i) => [_i, _v]),
      );
      effMulti.set(numMod.get(1) ?? "", toFloat(numMod.get(0) ?? ""));
    } else {
      effMulti.set(effectMultiplier, 5.0);
    }
  }
  for (const [powerstring, power] of powers) {
    //Evaluate all power combinations calculated in beretPower to find the highest scoring one after multiplier is applied
    let score: number = 0.0;
    const buskingEffects: Map<Effect, number> = new Map(
      Object.entries(beretBuskingEffects(toInt(power), busksUsed)).map(
        ([_k, _v]) => [Effect.get(_k), _v],
      ),
    );
    for (const [eff] of buskingEffects) {
      if (eff !== $effect.none) {
        for (const [mod, multi] of effMulti) {
          score += numericModifier(eff, mod) * multi;
        }
      }
    }
    if (score > highScore) {
      highScore = score;
      highScoreString = powerstring;
    }
  }
  if (highScore > 0) {
    return highScoreString;
  }
  return "";
}

export function beretBusk(effectMultiplier: string): boolean {
  if (!auto_havePrismaticBeret() || !canBusk()) {
    return false;
  }
  const multipliers: Map<Slot, number> = powerMultipliers();
  const allHats: Map<number, Item> = new Map();
  const allShirts: Map<number, Item> = new Map();
  const allPants: Map<number, Item> = new Map();
  const bestBuskHROffset: number = auto_have_familiar($familiar`Mad Hatrack`)
    ? 0
    : 1;
  let buskPower: number = 0;
  for (const it of $items.all()) {
    //only record items we have
    if (possessEquipment(it)) {
      switch (toSlot(it)) {
        case $slot`hat`:
          allHats.set(allHats.size, it);
          break;
        case $slot`shirt`:
          allShirts.set(allShirts.size, it);
          break;
        case $slot`pants`:
          allPants.set(allPants.size, it);
          break;
        default:
          continue;
      }
    }
  }
  const powers: Map<string, number> = beretPower(allHats, allShirts, allPants);
  const bestBuskPowers: string = bestBusk(powers, effectMultiplier);
  if (bestBuskPowers === "") {
    return false;
  }
  const bestBuskPowersSplit: Map<number, string> = new Map(
    splitString(bestBuskPowers, ",").map((_v, _i) => [_i, _v]),
  );
  if (!in_hattrick()) {
    if (auto_have_familiar($familiar`Mad Hatrack`)) {
      for (const [, hat] of allHats) {
        if (
          getPower(hat) === toInt(bestBuskPowersSplit.get(0) ?? "") &&
          hat !== $item`prismatic beret`
        ) {
          //equip the hat and put the beret on the Hatrack to be able to busk
          autoForceEquip$2(hat, true);
          buskPower += getPower(hat) * (multipliers.get($slot`hat`) ?? 0);
          if (useFamiliar($familiar`Mad Hatrack`)) {
            //Force the beret to the Hatrack if we were able to use the Hatrack.
            autoForceEquip($slot`familiar`, $item`prismatic beret`, true);
          }
          break;
        } else if (hat === $item`prismatic beret`) {
          //don't equip the beret yet, in case there is another 10 power hat to wear
          continue;
        }
      }
    }
    if (!haveEquipped($item`prismatic beret`)) {
      //equip the beret if it is not equipped anywhere else
      autoForceEquip($slot`hat`, $item`prismatic beret`, true);
      buskPower +=
        getPower($item`prismatic beret`) * (multipliers.get($slot`hat`) ?? 0);
    }
  } else {
    //get the power of all hats equipped in Hat Trick
    for (const [, h] of allHats) {
      if (equippedAmount(h) > 0) {
        buskPower += getPower(h) * (multipliers.get($slot`hat`) ?? 0);
      }
    }
  }
  if (allPants.size > 0) {
    //only check if we have pants available
    if (toInt(bestBuskPowersSplit.get(1 - bestBuskHROffset) ?? "") === 0) {
      autoForceEquip($slot`pants`, $item.none, true);
    } else {
      for (const [, pant] of allPants) {
        if (
          getPower(pant) ===
          toInt(bestBuskPowersSplit.get(1 - bestBuskHROffset) ?? "")
        ) {
          autoForceEquip$2(pant, true);
          buskPower += getPower(pant) * (multipliers.get($slot`pants`) ?? 0);
          break;
        }
      }
    }
  }
  if (allShirts.size > 0) {
    //only check if we have shirts available
    if (toInt(bestBuskPowersSplit.get(2 - bestBuskHROffset) ?? "") === 0) {
      autoForceEquip($slot`shirt`, $item.none, true);
    } else {
      for (const [, shirt] of allShirts) {
        if (
          getPower(shirt) ===
          toInt(bestBuskPowersSplit.get(2 - bestBuskHROffset) ?? "")
        ) {
          autoForceEquip$2(shirt, true);
          buskPower += getPower(shirt);
          break;
        }
      }
    }
  }

  if (useSkill(1, $skill`Beret Busking`)) {
    handleTracker({
      what: $item`prismatic beret`,
      location: myLocation(),
      detail: `Beret busk ${get("_beretBuskingUses")} at ${buskPower} power`,
      property: "auto_otherstuff",
    });
    return true;
  }

  return false;
}

export function auto_haveCoolerYeti(): boolean {
  if (auto_have_familiar($familiar`Cooler Yeti`)) {
    return true;
  }
  return false;
}

export function auto_haveMobiusRing(): boolean {
  const ring: Item = $item`Möbius ring`;
  return auto_is_valid(ring) && possessEquipment(ring);
}

function auto_paradoxicity(): number {
  // we either need to visit the charpane or status.php to update this
  visitUrl("charpane.php", false);
  return myParadoxicity();
}

export function auto_timeIsAStripPossible(): boolean {
  if (!auto_haveMobiusRing()) {
    return false;
  }

  return turnsUntilMobiusNoncombatAvailable() === 0;
}

export function mobiusChoiceHandler(choice: number, page: string): void {
  if (!auto_haveMobiusRing()) {
    auto_runChoice(1); //should never get here but might as well mitigate
  }

  const choices: Map<number, string> = new Map(
    Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]),
  );
  const choiceMap: Map<string, number> = new Map();
  for (const [idx, text] of choices) {
    choiceMap.set(text, idx);
  }

  function mobiusChoice(opt: string): void {
    const num: number = choiceMap.get(opt) ?? 0;
    handleTracker({
      what: $item`Möbius ring`,
      detail: opt,
      property: "auto_otherstuff",
    });
    auto_runChoice(num);
  }

  let pos: string;
  // must... get... meat... (probably temporary)
  if (in_amw()) {
    pos = "Give your past self investment tips";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
    if (myDaycount() > 1) {
      pos = "Hey, free gun!";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
    }
    pos = "Take the long odds on the trifecta";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    } else {
      pos = "Fix the race and also fix the race";
      mobiusChoice(pos);
      return;
    }
  }
  // we want to get +15 paradoxicity for more time cops and the 13-paradoxicity +item effect
  // in a single day, we'll hit the NC maybe 9 times
  // we can't guarantee we'll be able to use the effects, but the items are good
  // taking the long odds would be good if we can definitely remove the effect / handle the HP loss

  if (isAboutToPowerlevel()) {
    // if we're going to powerlevel, we want the +stat%, +stat and direct stat options
    pos = "Bake Susie a cupcake";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
    pos = "Draw a goatee on yourself";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
    switch (myPrimestat()) {
      case $stat`Muscle`:
        pos = "Lift yourself up by your bootstraps";
        if (choiceMap.has(pos)) {
          mobiusChoice(pos);
          return;
        }
        break;
      case $stat`Mysticality`:
        pos = "Mind your own business";
        if (choiceMap.has(pos)) {
          mobiusChoice(pos);
          return;
        }
        break;
      case $stat`Moxie`:
        pos = "Shoot yourself in the foot";
        if (choiceMap.has(pos)) {
          mobiusChoice(pos);
          return;
        }
        break;
    }
  }
  // cupcake is 5-7 adv for 1 full, +1 paradox
  if (auto_canEat($item`Susie's cupcake`)) {
    pos = "Steal a cupcake from young Susie";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
  }
  // first clock per day gives 3 adventures, second gives 2
  if (get("_clocksUsed") < 2) {
    pos = "Go back and set an alarm";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      if (itemAmount($item`clock`) > 0) {
        use(1, $item`clock`);
      }
      return;
    }
    // gives +15 myst, +30 MP: rarely useful but sets up the clock
    pos = "Go back and take a 20-year-long nap";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
  }
  // 100 turns of +5 fam xp is worth refreshing
  if (haveEffect($effect`Lifted by your Bootstraps`) === 0) {
    pos = "Let yourself get lifted up by your bootstraps";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
  }

  if (auto_paradoxicity() < 15) {
    // We prioritize our mainstat a bit more, but otherwise we try to raise our lowest stat
    const statChoices: [string, number][] = (
      [
        ["Mind your own business", $stat`Mysticality`],
        ["Lift yourself by your bootstraps", $stat`Muscle`],
        ["Shoot yourself in the foot", $stat`Moxie`],
      ] as [string, Stat][]
    ).map(([choice, stat]) => [
      choice,
      myBasestat(stat_to_substat(stat)) *
        (stat === myClass().primestat ? 0.7 : 1),
    ]);
    statChoices.sort(([, s1], [, s2]) => s1 - s2);
    // take paradox-increasing options without negative effects in approximate utility order
    // some would have been taken earlier, so taking them here implies they're less useful
    for (const str of [
      "Stop your arch-nemesis as a baby",
      "Borrow meat from your future",
      "Hey, free gun!",
      ...statChoices.map(([s]) => s),
      "Draw a goatee on yourself",
      "Go for a nature walk",
      "Steal a cupcake from young Susie",
      "Plant some trees and harvest them in the future",
      "Borrow a cup of sugar from yourself",
      "Steal a club from the past",
      "Go back and take a 20-year-long nap",
      "Plant some seeds in the distant past",
      "Go back and write a best-seller.",
      "Defend yourself",
      "Play Schroedinger's Prank on yourself",
      "Peek in on your future",
      "Give your past self investment tips",
    ]) {
      if (choiceMap.has(str)) {
        mobiusChoice(str);
        return;
      }
    }
  }
  // we've done everything we care about, find a loop
  if (auto_canEat($item`Susie's cupcake`)) {
    pos = "Steal a cupcake from young Susie";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
    pos = "Bake Susie a cupcake";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
  }
  // meat is normally useful
  pos = "Borrow meat from your future";
  if (choiceMap.has(pos)) {
    mobiusChoice(pos);
    return;
  }
  pos = "Repay yourself in the past";
  if (choiceMap.has(pos)) {
    mobiusChoice(pos);
    return;
  }

  auto_runChoice(1);
  return;
}

export function auto_timeCopFights(): number {
  return get("_timeCopsFoughtToday");
}

export function auto_haveMonodent(): boolean {
  const dent: Item = $item`Monodent of the Sea`;
  return auto_is_valid(dent) && possessEquipment(dent);
}

export function auto_waveTheZone(): boolean {
  if (!auto_haveMonodent()) {
    return false;
  }
  //Already Summoned a Wave today
  if (get("_seadentWaveUsed")) {
    return false;
  }

  let waveTheZone: boolean = false;
  //Force the Monodent of the Sea when adventuring in a zone that we might want to Summon a Wave in
  //Get Fishy turns from free fights
  if (
    $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary), Cyberzone 1, Cyberzone 2, Cyberzone 3`.includes(
      myLocation(),
    ) &&
    myPath() === $path`11,037 Leagues Under the Sea`
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  //Get 30% more meat drop. Only useful if weapon slot has < 30% meat drop
  if (
    myLocation() === $location`The Themthar Hills` &&
    numericModifier(equippedItem($slot`weapon`), $modifier`Meat Drop`) < 30.0
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  if (
    !inAftercore() &&
    myLocation() === $location`The Penultimate Fantasy Airship` &&
    itemAmount($item`ink bladder`) >= 16 &&
    $location`The Penultimate Fantasy Airship`.turnsSpent < 3
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  if (waveTheZone) {
    // visitUrl, not useSkill: useSkill aborts on the choice.php redirect (#1566)
    const waveText = visitUrl(
      `runskillz.php?action=Skillz&whichskill=${toInt($skill`Sea *dent: Summon a Wave`)}&quantity=1&targetplayer=${myId()}&pwd`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), waveText);
    }
    handleTracker({
      what: $item`Monodent of the Sea`,
      location: myLocation(),
      detail: "Summon a Wave",
      property: "auto_otherstuff",
    });
    return true;
  }
  return false;
}

export function auto_talkToSomeFish(loc: Location, enemy: Monster): boolean {
  if (!auto_isPotentialTalkToSomeFishTarget(loc, enemy)) {
    return false;
  }

  // If we're going to gaze, always talk
  if (auto_bczRefractedGaze(false, loc)) {
    return true;
  }

  if (auto_wantToBanish(enemy, loc)) {
    // If we have a banish available, don't replace
    return banisherCombatAction$1(enemy, loc, currentRound() > 0) === undefined;
  }

  // If we're not free running, then don't replace
  if (!auto_wantToFreeRun(enemy, loc)) {
    return false;
  }

  // If we have a free run available, don't replace
  if (freeRunCombatAction(enemy, loc, currentRound() > 0) === undefined) {
    return false;
  }

  return true;
}
// If this target can be considered for 'talk to some fish'
export function auto_isPotentialTalkToSomeFishTarget(
  loc: Location,
  enemy: Monster,
): boolean {
  // returns true if we want to cast Talk to Some Fish. Not intended to exhaustivly list all valid targets
  // also, this is not actually a free fight, but this is a safe listing of targets
  if (!auto_haveMonodent()) {
    return false;
  }
  if (!auto_is_valid$2($skill`Sea *dent: Talk to Some Fish`)) {
    return false;
  }
  // don't try and use the skill if we have already turned them into some fish
  if (enemy === $monster`some fish`) {
    return false;
  }
  // some fish has no meat drop, so this doesn't take familiar meat modifiers into account
  if (loc === $location`The Fungus Plains`) {
    return false;
  }

  // need hippy / frat kills
  if (
    $locations`The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
      myLocation(),
    )
  ) {
    return false;
  }
  // need the choices
  if (loc === $location`The Haunted Bedroom`) {
    return false;
  }

  // don't avoid inherently free fights
  if (isFreeMonster(enemy, loc)) {
    return false;
  }

  // We progress faster if we fight the black monsters
  if (
    loc === $location`The Black Forest` &&
    $monsters`black adder, black friar, black magic woman, black panther, black widow`.includes(
      enemy,
    )
  ) {
    return false;
  }

  // If we're trying to get those blackberries
  if (
    enemy === $monster`blackberry bush` &&
    itemAmount($item`blackberry`) < 3 &&
    !possessEquipment($item`blackberry galoshes`) &&
    auto_is_valid($item`blackberry galoshes`)
  ) {
    return false;
  }

  // Avoid when we're trying to kill rats for free
  if (
    myThrall() === $thrall`Vermincelli` &&
    myThrall().level >= 11 &&
    enemy.attributes.split(" ").includes("RAT") &&
    get("_legendaryVermincelliFreeRats") < 11
  ) {
    return false;
  }

  // If a task explicitly registered this monster as a desired target
  if (fightingDesiredTaskMonster(enemy)) {
    return false;
  }
  //This is called in stage2 and _chainedPurpleCandleMonster is set in stage 4 so this should only ever show up on the purple candled enemy
  if (safeGet("_chainedPurpleCandleMonster") === enemy) {
    return false;
  }

  // If we did something to the monster and we don't want to undo it
  if (
    combat_status_check("refractedgazed") ||
    (combat_status_check("droptablereplaced") &&
      !combat_status_check("droptablereplacedbysword"))
  ) {
    return false;
  }

  //bcz has great synergy with talk to some fish to get all the drops in a zone
  if (auto_bczRefractedGaze() && auto_BCZEquipped()) {
    return true;
  }

  return true;
}

export function auto_throwLightningRemaining(): number {
  if (
    !auto_haveMonodent() ||
    !auto_is_valid$2($skill`Sea *dent: Throw a Lightning Bolt`)
  ) {
    return 0;
  }

  return 11 - get("_seadentLightningUsed");
}

export function auto_haveBCZ(): boolean {
  if (
    auto_is_valid($item`blood cubic zirconia`) &&
    possessEquipment($item`blood cubic zirconia`)
  ) {
    return true;
  }
  if (
    auto_haveEternityCodpiece() &&
    auto_isInEternityCodpiece($item`blood cubic zirconia`)
  ) {
    return true;
  }
  return false;
}

export function auto_getItemToEquipBCZ(): Item {
  if (
    auto_haveEternityCodpiece() &&
    auto_isInEternityCodpiece($item`blood cubic zirconia`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (auto_haveBCZ()) {
    return $item`blood cubic zirconia`;
  }
  return $item.none;
}

function auto_BCZEquipped(): boolean {
  if (
    auto_isInEternityCodpiece($item`blood cubic zirconia`) &&
    haveEquipped($item`The Eternity Codpiece`)
  ) {
    return true;
  }
  if (haveEquipped($item`blood cubic zirconia`)) {
    return true;
  }
  return false;
}

function auto_bczCastMath(cast: number): number {
  if (cast === 12) {
    return 420000;
  }
  let castMath: number = cast;
  if (cast > 12) {
    castMath -= 1;
  }
  let castMathFloor: number = floor(castMath / 3);
  if (cast > 12) {
    castMathFloor += 1;
  }
  const castMathModulo: number = castMath % 3;
  let substatBase: number = 0;

  switch (castMathModulo) {
    case 0:
      substatBase = 11;
      break;
    case 1:
      substatBase = 23;
      break;
    case 2:
      substatBase = 37;
      break;
  }
  return substatBase * 10 ** castMathFloor;
  //11, 23, 37, 110, 230, 370, etc. 13th cast follows a different pattern but we will never get there but better to be safe than sorry
}

function bcz_allowStatChange(st: Stat, casts: number): boolean {
  // Level is capped at 13 - beyond that we no longer need to protect it for levelling purposes.
  const effectiveLevel: number = Math.min(myLevel(), 13);

  // disallow casts until level is above a certain threshold
  if (effectiveLevel < 10 && casts >= 3) {
    return false;
  }
  if (effectiveLevel < 11 && casts >= 5) {
    return false;
  }
  if (in_amw() && casts >= 5) {
    return false;
  }

  // Cost, in substats, of the next cast (i.e. the (casts + 1)th cast of this skill today).
  const castCost: number = auto_bczCastMath(casts);
  const primestat: Stat =
    myClass().primestat === $stat.none ? myPrimestat() : myClass().primestat;

  if (st === primestat) {
    //Don't want to use so many substats we go down too many levels or we have cast more than we really need to/should
    //Don't go beneath our current level or level 13 if we cast the skill
    const currentSubstats: number = myBasestat(stat_to_substat(st));
    const minSubstatsForLevel: number = level_to_min_substat(effectiveLevel);
    const surplusSubstats: number = currentSubstats - minSubstatsForLevel;
    return surplusSubstats > castCost;
  }

  const currentStat: number = myBasestat(st);

  if (currentStat < 70 && casts < 3) {
    //For an offstat that is not yet to 70, allow if the cost is less than 1 full stat in cost. don't cast more than 3 times per day
    const currentSubstats: number = myBasestat(stat_to_substat(st));
    const substatsAtCurrentStat: number = Math.pow(currentStat, 2);
    const surplusSubstats: number = currentSubstats - substatsAtCurrentStat;
    return surplusSubstats > castCost;
  }

  //don't let an offstat fall more than 70 behind primestat, capping primestat's influence at what level 13 needs
  const primestatCap: number = Math.floor(Math.sqrt(level_to_min_substat(13)));
  const cappedPrimestatValue: number = Math.min(
    myBasestat(primestat),
    primestatCap,
  );
  const maxDiff = auto_getMinOffstatDelevel(cappedPrimestatValue);
  const offstatFloor: number = Math.max(cappedPrimestatValue - maxDiff, 0);
  const substatsAtCurrentStat: number = Math.pow(currentStat, 2);
  const substatsAtOffstatFloor: number = Math.pow(offstatFloor, 2);
  const surplusSubstats: number =
    substatsAtCurrentStat - substatsAtOffstatFloor;
  return surplusSubstats > castCost;
}

function auto_getMinOffstatDelevel(statComparedAgainst: number): number {
  const diff = get("auto_burndownStatsProgressionDiff", "75%");

  const match = diff.match(/^([\d.]+)(%?)$/);
  const amount: number = match !== null ? parseFloat(match[1]) : 0.75;
  const perc = match !== null ? match[1] === "%" : true;

  const newLimit = perc
    ? statComparedAgainst - statComparedAgainst * amount
    : statComparedAgainst - amount;

  return Math.max(1, Math.ceil(newLimit));
}

type BCZSkill = {
  skill: Skill;
  stat: Stat;
  limit: (burningForProgression: boolean) => number;
  pref: string;
  gives?: Item;
};

const BCZ: BCZSkill[] = [
  {
    skill: $skill`BCZ: Blood Geyser`,
    stat: $stat`Muscle`,
    limit: () => 6,
    pref: "_bczBloodGeyserCasts",
  },
  {
    skill: $skill`BCZ: Blood Bath`,
    stat: $stat`Muscle`,
    limit: () => 6,
    pref: "_bczBloodBathCasts",
  },
  {
    skill: $skill`BCZ: Create Blood Thinner`,
    stat: $stat`Muscle`,
    limit: () => 1,
    pref: "_bczBloodThinnerCasts",
    gives: $item`blood thinner`,
  },

  {
    skill: $skill`BCZ: Refracted Gaze`,
    stat: $stat`Mysticality`,
    limit: (burningForProgression) => (burningForProgression ? 20 : 6),
    pref: "_bczRefractedGazeCasts",
  },
  {
    skill: $skill`BCZ: Dial it up to 11`,
    stat: $stat`Mysticality`,
    limit: () => 3,
    pref: "_bczDialitupCasts",
  },
  {
    skill: $skill`BCZ: Prepare Spinal Tapas`,
    stat: $stat`Mysticality`,
    limit: (burningForProgression) =>
      // We always cast at least 3 times, then we will cast it everytime we run out and it doesn't exceed our limit
      Math.min(
        Math.max(3, get("_bczSpinalTapasCasts")) +
          (itemAmount($item`spinal tapas`) > 0 ? 0 : 1),
        burningForProgression ? 20 : 6,
      ),
    pref: "_bczSpinalTapasCasts",
    gives: $item`spinal tapas`,
  },

  {
    skill: $skill`BCZ: Sweat Bullets`,
    stat: $stat`Moxie`,
    limit: (burningForProgression) => (burningForProgression ? 20 : 6),
    pref: "_bczSweatBulletsCasts",
  },
  {
    skill: $skill`BCZ: Craft a Pheromone Cocktail`,
    stat: $stat`Moxie`,
    limit: (burningForProgression) =>
      // We always cast at least 3 times, then we will cast it everytime we run out and it doesn't exceed our limit
      Math.min(
        Math.max(3, get("_bczPheromoneCocktailCasts")) +
          (itemAmount($item`pheromone cocktail`) > 0 ? 0 : 1),
        burningForProgression ? 20 : 6,
      ),
    pref: "_bczPheromoneCocktailCasts",
    gives: $item`pheromone cocktail`,
  },
  {
    skill: $skill`BCZ: Sweat Equity`,
    stat: $stat`Moxie`,
    limit: (burningForProgression) => (burningForProgression ? 5 : 2),
    pref: "_bczSweatEquityCasts",
  },
] as const;

export function auto_wantToBCZ(sk: Skill): boolean {
  if (!auto_haveBCZ() || !auto_is_valid$2(sk) || in_zootomist()) return false;
  if (currentRound() !== 0 && !auto_canUse(sk)) return false;

  const info = BCZ.find((x) => x.skill === sk);

  if (info === undefined) {
    return false;
  }

  if (info.gives !== undefined) {
    if (info.gives.spleen > 0 && !auto_canChew(info.gives)) {
      return false;
    } else if (info.gives.inebriety > 0 && !auto_canDrink(info.gives)) {
      return false;
    } else if (info.gives.fullness > 0 && !auto_canEat(info.gives)) {
      return false;
    }
  }

  return (
    bcz_allowStatChange(info.stat, get(info.pref, 0)) &&
    get(info.pref, 0) < info.limit(get("auto_burndownStatsProgression", false))
  );
}

export function auto_bczRefractedGaze(
  planToPeridot: boolean = false,
  location: Location = myLocation(),
): boolean {
  if (!auto_wantToBCZ($skill`BCZ: Refracted Gaze`)) {
    // we don't want to refract if we don't have the stats.
    return false;
  }
  if (
    combat_status_check("choiceMonster") ||
    safeGet("auto_familiarChoice") === $familiar`Sword of S Words`
  ) {
    return false;
  }
  if (
    currentRound() > 0 &&
    myFamiliar() === $familiar`Sword of S Words` &&
    (auto_swordFamiliarLikesCurrentTarget() ||
      auto_swordOfSwordsTracking() !== $monster.none)
  ) {
    // the sword already overwrites this fight's drop table, so gazing here would be wasted.
    return false;
  }
  planToPeridot =
    auto_havePeridot() && !haveUsedPeridot(location) && planToPeridot;

  const onFinalDay: boolean = myDaycount() >= get("auto_runDayCount", 0);
  const refractedGazeCastsUsed: number = get("_bczRefractedGazeCasts");
  // Would we still want to gaze again after this cast? If not, this is the last one we're
  // stat-willing to make today, so reserve it for the star key instead of spending it here.
  const isLastWillingGaze: boolean =
    !bcz_allowStatChange($stat`Mysticality`, refractedGazeCastsUsed + 1) ||
    refractedGazeCastsUsed + 1 >=
      BCZ.find((s) => s.skill === $skill`BCZ: Refracted Gaze`)!.limit(
        get("auto_burndownStatsProgression", false),
      );
  if (
    onFinalDay &&
    needStarKey() &&
    location !== $location`The Hole in the Sky` &&
    isLastWillingGaze
  ) {
    return false;
  }
  const isSpeculating: boolean = currentRound() === 0;
  // The current monster we could be fighting
  const canMonodent = isSpeculating
    ? auto_haveMonodent()
    : auto_canUse($skill`Sea *dent: Talk to Some Fish`);

  // If we plan to peridot, then we should avoid gazing if we'd get the outcome we want regardless
  // If we want drops from multiple monsters, then if we can use monodent, we can ignore the peridot
  // As we can't drop anything from the monster we do a gaze on, we must return false if we can't monodent and we're fighting the one we want drops from

  switch (location) {
    case $location`The Smut Orc Logging Camp`: {
      // If we're going to peridot, we have a good reason!
      if (planToPeridot) {
        return false;
      }

      const needsScrews = fastenerCount() < bridgeGoal();
      const needsPlanks = lumberCount() < bridgeGoal();

      if (!needsScrews && !needsPlanks) return false;

      if (isSpeculating) return true;

      const fasten = $monsters`smut orc screwer, smut orc nailer`;
      const plans = $monsters`smut orc pipelayer, smut orc jacker`;

      // If unexpected
      if (
        !fasten.includes(lastMonster()) &&
        !plans.includes(lastMonster()) &&
        lastMonster() !== $monster`some fish`
      ) {
        return false;
      }

      // If it's pointless to monodent away or gaze, we'd finish on this one
      if (
        fasten.includes(lastMonster()) &&
        needsScrews &&
        fastenerCount() + 1 >= bridgeGoal() &&
        !needsPlanks
      ) {
        return false;
      }
      if (
        plans.includes(lastMonster()) &&
        needsPlanks &&
        lumberCount() + 1 >= bridgeGoal() &&
        !needsScrews
      ) {
        return false;
      }

      // If we can't monodent away, and we don't need the other monsters but do need this
      if (
        !canMonodent &&
        ((!needsPlanks && fasten.includes(lastMonster())) ||
          (!needsScrews && plans.includes(lastMonster())))
      ) {
        return false;
      }

      return true;
    }
    case $location`The Penultimate Fantasy Airship`: {
      // We're only doing fallthrough here, as a target of chance
      if (planToPeridot) {
        return false;
      }
      if (internalQuestStatus("questL10Garbage") < 4) return false;
      // If we do have at least one, don't gaze
      if (
        $items`Mohawk wig, amulet of extreme plot significance`.some((i) =>
          possessEquipment(i),
        )
      ) {
        return false;
      }

      if (isSpeculating) return true;

      // Only if we're fighting these
      return $monsters`some fish, Irritating Series of Random Encounters, MagiMechTech MechaMech, Protagonist, Spunky Princess`.includes(
        lastMonster(),
      );
    }
    case $location`The Battlefield (Frat Uniform)`: {
      // We can't monodent here, we'd gain no progress
      if (planToPeridot) {
        return false;
      }
      // Try to limit by tracking
      if (
        get("auto_otherstuff")
          .split(", ")
          .filter(
            (s) =>
              s.includes($skill`BCZ: Refracted Gaze`.toString()) &&
              s.includes(location.toString()),
          ).length < get("auto_bcz_battlefieldGaze", 2)
      ) {
        // Only use refracted gaze on the battlefield X times
        return true;
      }
      return false;
    }
    case $location`A-Boo Peak`: {
      if (
        itemAmount($item`A-Boo clue`) * 30 >=
        // We would take 2 advs regardless, we don't want to waste our time on a clue we didn't need!
        get("booPeakProgress") - 4
      ) {
        return false;
      }

      return (
        isSpeculating ||
        $monsters`some fish, Battlie Knight Ghost, Claybender Sorcerer Ghost, Dusken Raider Ghost, Space Tourist Explorer Ghost, Whatsian Commando Ghost`.includes(
          lastMonster(),
        )
      );
    }
    case $location`Cobb's Knob Harem`: {
      // We don't want to be wasteful with the gazes, we can avoid it
      if (planToPeridot) {
        return false;
      }
      // If we're not hunting for the outfit
      if (
        $items`Knob Goblin harem veil, Knob Goblin harem pants`.every((i) =>
          possessEquipment(i),
        )
      ) {
        return false;
      }

      // Ensure we're not fighting the monster we are trying to drop
      return (
        isSpeculating ||
        $monsters`Knob Goblin Harem Guard, Knob Goblin Madam, some fish`.includes(
          lastMonster(),
        )
      );
    }
    case $location`Twin Peak`: {
      // If we're not going to monodent, though, this is sub-optimal
      if (planToPeridot && !canMonodent) {
        return false;
      }
      const twinStatus = get("twinPeakProgress");
      const trimmersNeeded =
        4 - [1, 2, 4, 8].filter((bit) => (twinStatus & bit) !== 0).length;

      if (itemAmount($item`rusty hedge trimmers`) >= trimmersNeeded) {
        return false;
      }

      if (isSpeculating) {
        return true;
      }

      const others = $monsters`some fish, Big Wheelin' Twins, Bubblemint Twins, Creepy Ginger Twin, Troll Twins, Mismatched Twins`;
      const drops = $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`;

      if (!others.includes(lastMonster()) && !drops.includes(lastMonster())) {
        return false;
      }

      return canMonodent || others.includes(lastMonster());
    }
    case $location`The Black Forest`: {
      if (blackMarketAvailable()) return false;

      if (
        itemAmount(
          in_bhy() ? $item`reconstituted crow` : $item`reassembled blackbird`,
        ) > 0
      ) {
        return false;
      }

      const want = (
        !in_bhy()
          ? $items`sunken eyes, broken wings`
          : $items`bird brain, busted wings`
      ).filter((i) => itemAmount(i) === 0);

      if (want.length === 0) return false;

      if (planToPeridot) return false;

      if (isSpeculating) return true;

      if (
        !$monsters`some fish, black adder, black friar, black magic woman, black panther, black widow`.includes(
          lastMonster(),
        )
      ) {
        return false;
      }

      // If the monster doesn't give something we want (We don't monodent here)
      return getMonsterDrops(lastMonster()).every(
        (i) => !want.includes(i.item),
      );
    }
    case $location`Whitey's Grove`: {
      if (!L11_needWetStew()) return false;

      const need = $items`bird rib, lion oil`.filter(
        (i) => itemAmount(i) === 0,
      );
      // we're going to be fighting it or we don't need it
      if (need.length <= (planToPeridot ? 1 : 0)) {
        return false;
      }
      // If we're speculating
      if (isSpeculating) return true;

      // If its an unexpected encounter
      if (
        !$monsters`Knight in White Satin, white chocolate golem, white lion, whitesnake, some fish`.includes(
          lastMonster(),
        )
      ) {
        return false;
      }

      const gives = getMonsterDrops(lastMonster()).filter((d) =>
        need.includes(d.item),
      ).length;

      // If we'd get what we want regardless
      if (gives === need.length) {
        return false;
      }

      // Only return true if we can monodent, or it's not what we want
      return canMonodent || gives === 0;
    }
    case $location`The Defiled Nook`: {
      // Only if its not a waste
      if (itemAmount($item`evil eye`) * -3 + get("cyrptNookEvilness") <= 14) {
        return false;
      }
      if (isSpeculating) {
        return true;
      }

      const evilEyes = $monsters`spiny skelelton, toothy sklelton`;

      if (!canMonodent && evilEyes.includes(lastMonster())) return false;

      // If its an expected monster
      return (
        evilEyes.includes(lastMonster()) ||
        $monsters`party skelteon, some fish`.includes(lastMonster())
      );
    }
    case $location`The Hole in the Sky`: {
      if (!needStarKey()) {
        return false;
      }

      if (isSpeculating) {
        return true;
      }

      if (
        !$monsters`some fish, Astronomer, Axe Wound, Beaver, Box, Burrowing Bishop, Bush, Camel's Toe, Family Jewels, Flange, Honey Pot, Hooded Warrior, Junk, Little Man in the Canoe, Muff, One-Eyed Willie, Pork Sword, Skinflute, Trouser Snake, Twig and Berries`.includes(
          lastMonster(),
        )
      ) {
        return false;
      }

      if (lastMonster() === $monster`Astronomer`) {
        return canMonodent || itemAmount($item`star chart`) > 0;
      }

      return true;
    }
    case $location`Guano Junction`: {
      if (internalQuestStatus("questL04Bat") >= 4) return false;

      // We're fishing for sonars
      return (
        isSpeculating ||
        $monsters`some fish, screambat, batbugbear, vampire bat, skullbat, baseball bat, briefcase bat, perpendicular bat, doughbat`.includes(
          lastMonster(),
        )
      );
    }
  }

  return false;
}

export function auto_getBCZItems(): void {
  if (!auto_haveBCZ()) {
    return;
  }

  while (auto_wantToBCZ($skill`BCZ: Craft a Pheromone Cocktail`)) {
    handleTracker({
      what: $item`blood cubic zirconia`,
      detail: $item`pheromone cocktail`.toString(),
      property: "auto_iotm_claim",
    });
    useSkill(1, $skill`BCZ: Craft a Pheromone Cocktail`);
  }
  while (auto_wantToBCZ($skill`BCZ: Prepare Spinal Tapas`)) {
    handleTracker({
      what: $item`blood cubic zirconia`,
      detail: $item`spinal tapas`.toString(),
      property: "auto_iotm_claim",
    });
    useSkill(1, $skill`BCZ: Prepare Spinal Tapas`);
  }

  return;
}

/**
 * Creates an array of skill casts required to drop to the desired level.
 * Tries to minimize substats lost, returns null if it's impossible to
 * reach the desired level without overshooting.
 */
export function auto_bczDelevelPlan(
  desiredLevel: number,
  primeStat: Stat = myClass().primestat,
): (() => void)[] | undefined {
  const currentSubstats: number = myBasestat(stat_to_substat(primeStat));
  const minTargetSubstats: number = level_to_min_substat(desiredLevel);
  const maxTargetSubstats: number = level_to_min_substat(desiredLevel + 1) - 1;

  const minSpend = currentSubstats - maxTargetSubstats;
  const maxSpend = currentSubstats - minTargetSubstats;

  const [skill1, skill2] = BCZ.filter(
    (s) => s.stat === primeStat && !s.skill.combat,
  );
  const casted1 = get(skill1.pref, 0);
  const casted2 = get(skill2.pref, 0);

  const skill1Costs: number[] = [0];
  for (let i = 0; i < 22; i++) {
    skill1Costs.push(skill1Costs[i] + auto_bczCastMath(casted1 + i));
  }
  const skill2Costs: number[] = [0];
  for (let i = 0; i < 22; i++) {
    skill2Costs.push(skill2Costs[i] + auto_bczCastMath(casted2 + i));
  }

  let bestCost: number = Infinity;
  let bestX: number = -1;
  let bestY: number = -1;

  for (let x = 0; x <= 22; x++) {
    const costSkill1 = skill1Costs[x];

    if (costSkill1 > maxSpend) {
      break;
    }

    for (let y = 0; y <= 22; y++) {
      const totalCost = costSkill1 + skill2Costs[y];

      if (totalCost > maxSpend) {
        break; // We've overshot the max budget
      }

      if (totalCost < minSpend) {
        continue;
      }

      // Valid plan found! But this one is worse.
      if (totalCost >= bestCost) {
        continue;
      }

      bestCost = totalCost;
      bestX = x;
      bestY = y;
    }
  }

  // If we never found a combination
  if (bestX === -1 || bestY === -1) {
    return undefined;
  }

  const skills: Skill[] = [];

  for (let i = 0; i < bestX; i++) {
    skills.push(skill1.skill);
  }
  for (let i = 0; i < bestY; i++) {
    skills.push(skill2.skill);
  }

  const plan: (() => void)[] = [];

  for (const skill of skills) {
    const bcz = BCZ.find((b) => b.skill === skill)!;

    plan.push(() => {
      if (bcz.gives !== undefined) {
        handleTracker({
          what: $item`blood cubic zirconia`,
          detail: bcz.gives.toString(),
          property: "auto_iotm_claim",
        });
      }
      useSkill(1, skill);
    });
  }

  return plan;
}

function auto_haveShrunkenHead(): boolean {
  if (get("hasShrunkenHead") && auto_is_valid($item`shrunken head`)) {
    return true;
  }
  return false;
}

export function auto_wantToShrunkenHead(enemy: Monster): boolean {
  if (!auto_haveShrunkenHead()) {
    return false;
  }

  if (!auto_canUse($skill`Prepare to reanimate your Foe`)) {
    return false;
  }

  if (!enemy.copyable) {
    return false;
  }
  // as the created zombie doesn't die, get one that gives +item and no passive damage
  let hasItem: boolean = false;
  for (const [, bonus] of shrunkenHeadZombie(enemy).entries()) {
    if (containsText(bonus, "Attack")) {
      return false;
    }
    if (containsText(bonus, "Item Drop")) {
      hasItem = true;
    }
  }

  return hasItem;
}

export function auto_wantToShrunkenHead$1(place: Location): boolean {
  if (!auto_haveShrunkenHead()) {
    return false;
  }

  const next: Monster = safeGet("auto_nextEncounter");
  if (next !== $monster.none) {
    //next monster is forced by zone mechanics or some other mechanism
    return auto_wantToShrunkenHead(next);
  } else {
    for (const [, mon] of getMonsters(place).entries()) {
      if ((appearanceRates(place)[mon.toString()] ??= 0.0) > 0) {
        if (auto_wantToShrunkenHead(mon)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function auto_haveCrimboSkeleton(): boolean {
  if (auto_have_familiar($familiar`Skeleton of Crimbo Past`)) {
    return true;
  }
  return false;
}

export function auto_wantSoCP(): void {
  if (!auto_haveCrimboSkeleton()) {
    return;
  }
  let availableKnuckles: number = itemAmount($item`knucklebone`);

  // Only farm for gruel if we don't have enough knuckles to pick it if we wanted gruel
  if (
    auto_is_valid($item`medicinal gruel`) &&
    !isActuallyEd() &&
    spleen_left() > 0 &&
    !get("_crimboPastMedicalGruel") &&
    availableKnuckles < 5
  ) {
    availableKnuckles -= 5;
  }
  if (
    auto_is_valid($item`Smoking Pope`) &&
    inebriety_left() > 0 &&
    !get("_crimboPastSmokingPope")
  ) {
    availableKnuckles -= 5;
  }
  if (
    auto_is_valid($item`prize turkey`) &&
    stomach_left() > 0 &&
    !get("_crimboPastPrizeTurkey")
  ) {
    availableKnuckles -= 5;
  }
  if (
    availableKnuckles >= 0 &&
    (!get("auto_farmSoCP", false) || get("_knuckleboneDrops") >= 100)
  ) {
    set("auto_preferSoCP", false);
    return;
  }

  let amt: number = 0;
  for (const phyl of $phyla`constellation, elemental, hippy, horror, mer-kin, plant, slime, bug`) {
    amt += auto_zonePhylumPercent(myLocation(), phyl);
  }

  //want 10% or fewer of the available mobs to be knucklebone eligible, otherwise why bother with this guy vs fairychauns/fairyballs/fairyeverythings?
  set("auto_preferSoCP", amt <= 0.1);
}
