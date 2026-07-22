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
  Effect,
  equip,
  equippedAmount,
  equippedItem,
  floor,
  freeCrafts,
  fullnessLimit,
  getMonsters,
  getPower,
  getProperty,
  haveEffect,
  haveEquipped,
  inebrietyLimit,
  isUnrestricted,
  Item,
  itemAmount,
  lastMonster,
  Location,
  max,
  min,
  Modifier,
  Monster,
  monsterPhylum,
  myBasestat,
  myDaycount,
  myFullness,
  myInebriety,
  myLevel,
  myLocation,
  myParadoxicity,
  myPath,
  myPrimestat,
  mySpleenUse,
  numericModifier,
  runChoice,
  setProperty,
  shrunkenHeadZombie,
  Skill,
  Slot,
  spleenLimit,
  splitString,
  Stat,
  toBoolean,
  toFloat,
  toInt,
  toMonster,
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
  $monster,
  $path,
  $phyla,
  $phylum,
  $skill,
  $slot,
  $stat,
  get,
  getAverageAdventures,
  Leprecondo,
  set,
} from "libram";

import {
  auto_canDrink,
  auto_canEat,
  autoChew,
  canChew,
  spleen_left,
} from "../auto_consume";
import {
  autoForceEquip,
  autoForceEquip$2,
  possessEquipment,
  powerMultipliers,
} from "../auto_equipment";
import {
  auto_have_familiar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_info,
  auto_wantToFreeKillWithNoDrops,
  auto_zonePhylumPercent,
  canSummonMonster,
  handleTracker$1,
  handleTracker$2,
  internalQuestStatus,
  isFreeMonster,
  level_to_min_substat,
  stat_to_substat,
  zoneRank,
} from "../auto_util";
import { canUse } from "../combat/auto_combat_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { amw_wantMeat, in_amw } from "../paths/adventurer_meats_world";
import { in_avantGuard } from "../paths/avant_guard";
import { in_hattrick } from "../paths/hattrick";
import { in_small } from "../paths/small";
import { in_zootomist } from "../paths/zootomist";
import { bridgeGoal, fastenerCount, lumberCount } from "../quests/level_09";
import { needStarKey, towerKeyCount } from "../quests/level_13";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { acquiredFantasyRealmToken, fantasyBanditsFought } from "./mr2018";
import { auto_haveChestMimic } from "./mr2024";
import {
  auto_haveEternityCodpiece,
  auto_isInEternityCodpiece,
  auto_spadeDigsRemaining,
} from "./mr2026";

// This is meant for items that have a date of 2025

//Defined in autoscend/iotms/mr2025.ash
export function auto_haveCyberRealm(): boolean {
  if (!isUnrestricted($item`server room key`)) {
    return false;
  }
  if (
    toBoolean(getProperty("crAlways")) ||
    toBoolean(getProperty("_crToday"))
  ) {
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
  const used: number = toInt(getProperty("_mcHugeLargeAvalancheUses"));
  return 3 - used;
}

export function auto_McLargeHugeSniffsLeft(): number {
  if (!auto_haveMcHugeLargeSkis()) {
    return 0;
  }
  const used: number = toInt(getProperty("_mcHugeLargeSlashUses"));
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
export function auto_leprecondoBaseValues(): LeprecondoValues {
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
        score = LEPRECONDO_RESULTS_SCORE.get(key);
      }

      baseValues[piece] ??= {};
      baseValues[piece][need] = score;
    }
  }

  return baseValues;
}

// Situational bonuses added on top of the baseline
function auto_leprecondoExtras(): {
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

  const canConsume = !in_small() && !in_amw();

  const organs = {
    food: {
      active: canEat() && canConsume && !doneOrgans.includes("food"),
      surplus: leprecondoFoodSurplus(),
    },
    booze: {
      active: canDrink() && canConsume && !doneOrgans.includes("booze"),
      surplus: leprecondoBoozeSurplus(),
    },
    traces: {
      active:
        spleenLimit() > 0 &&
        !isActuallyEd() &&
        canConsume &&
        !doneOrgans.includes("traces"),
      surplus: leprecondoTracesSurplus(),
    },
  };

  const extraFill = 6;

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
  return getLeprecondoItems(need, piece)
    .map((i) => getAverageAdventures(i) / (i.fullness + i.inebriety + i.spleen))
    .reduce((l, r) => l + r, 0);
}

function leprecondoFoodSurplus(): number {
  return (
    leprecondoPieceOrgansSize("food", "Omnipot") -
    max(fullnessLimit(), isActuallyEd() ? 5 : 15) -
    myFullness()
  );
}

function leprecondoBoozeSurplus(): number {
  return (
    leprecondoPieceOrgansSize("booze", "fully-stocked wet bar") -
    max(inebrietyLimit(), isActuallyEd() ? 5 : 15) -
    myInebriety()
  );
}

function leprecondoTracesSurplus(): number {
  return (
    leprecondoPieceOrgansSize(
      "dumb entertainment",
      "ultimate retro game console",
    ) -
    min(15, spleenLimit()) -
    mySpleenUse()
  );
}

// Declares how much each need is worth per furniture piece
function auto_leprecondoValues(): LeprecondoValues {
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
  for (const extra of auto_leprecondoExtras()) {
    if (!extra.condition) {
      continue;
    }

    addAll(extra.values);
  }

  return values;
}

// Greedy picks the piece with the highest remaining value until 4 slots are filled or nothing left.
function auto_leprecondoTarget(): LeprecondoPiece[] {
  const values = auto_leprecondoValues();
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
      const stats = Object.entries(values[piece]) as [
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

          const stats = Object.entries(values[piece]) as [
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

export function auto_setLeprecondo(): boolean {
  if (!auto_haveLeprecondo() || Leprecondo.rearrangesRemaining() <= 0) {
    return false;
  }
  const installed = Leprecondo.installedFurniture();
  const target = auto_leprecondoTarget();
  let alreadyInstalled = true;
  for (let i = 0; i < target.length && alreadyInstalled; i++) {
    if (target[i] === installed[i]) {
      continue;
    }
    alreadyInstalled = false;
  }
  if (alreadyInstalled) {
    return true;
  }
  auto_log_info(
    `Rearranging Leprecondo: [${installed.join(", ")}] -> [${target.join(", ")}] (${Leprecondo.rearrangesRemaining() - 1} rearranges left)`,
    "blue",
  );

  const success = Leprecondo.setFurniture(
    target[0],
    target[1],
    target[2],
    target[3],
  );
  if (success) {
    handleTracker$1(
      $item`Leprecondo`.toString(),
      target.join(", "),
      "auto_iotm_claim",
    );
  } else {
    auto_log_info("Leprecondo.setFurniture() reported failure", "red");
  }
  return success;
}

export function auto_useLeprecondoDrops(): boolean {
  while (availableAmount($item`crafting plans`) > 0 && freeCrafts() < 2) {
    use($item`crafting plans`);
  }
  auto_stockTracesBandit();
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

export function auto_tracesUsesLeft(): number {
  return get("phosphorTracesUses");
}

// Bank Chest Mimic experience toward the 100 needed to extract a fantasy bandit egg.
export function auto_bankChestMimicExpForBandit(): boolean {
  if (
    acquiredFantasyRealmToken() ||
    !auto_haveChestMimic() ||
    $familiar`Chest Mimic`.experience >= 100 ||
    canSummonMonster($monster`fantasy bandit`)
  ) {
    return false;
  }
  return handleFamiliar$1($familiar`Chest Mimic`);
}

// Chew banked phosphor traces up to 4 charges
// Gated on auto_canTracesBandit (not just auto_wantTracesBandit) so this doesn't compete with other spleen items until we're actually about to use it.
// Any earlier banking happens for free via leftover end of day spleen instead (see bedtime_spleen).
function auto_stockTracesBandit(): void {
  if (
    !auto_canTracesBandit() ||
    auto_tracesUsesLeft() >= 4 ||
    !canSummonMonster($monster`fantasy bandit`)
  ) {
    return;
  }
  while (
    auto_tracesUsesLeft() < 4 &&
    canChew($item`phosphor traces`) &&
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
  return toInt(getProperty("preworkoutPowderUses"));
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
  if (!toBoolean(getProperty("_aprilShowerGlobsCollected"))) {
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
    equip(Item.none, $slot`weapon`);
  }
  return autoForceEquip$2($item`April Shower Thoughts shield`, true);
}

export function auto_unequipAprilShieldBuff(): boolean {
  //Because Empathy gets replaced by Thoughtful Empathy when cast with the Shield equipped,
  //we need to make sure this is unequipped if we want to have both Empathy and Thoughtful Empathy
  if (haveEquipped($item`April Shower Thoughts shield`)) {
    return autoForceEquip($slot`off-hand`, Item.none, true);
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
  if (toBoolean(getProperty("_aprilShowerNorthernExplosion"))) {
    return false;
  }
  return true;
}

export function auto_havePeridot(): boolean {
  const pop: Item = $item`Peridot of Peril`;
  return auto_is_valid(pop) && possessEquipment(pop);
}

export function peridotManuallyDesiredMonsters(): Map<Monster, boolean> {
  // manually specify some favoured monsters
  const desired_monsters: Map<Monster, boolean> = new Map();
  desired_monsters.set($monster`lobsterfrogman`, true);
  desired_monsters.set($monster`black panther`, true);
  desired_monsters.set($monster`white lion`, true);
  desired_monsters.set($monster`monstrous boiler`, true);
  desired_monsters.set($monster`modern zmobie`, true);
  desired_monsters.set($monster`dairy goat`, true);
  desired_monsters.set($monster`writing desk`, true);
  // we sniff the two-star, two-line monster, but we want exactly one star chart
  if (itemAmount($item`star chart`) === 0) {
    desired_monsters.set($monster`Astronomer`, true);
  }
  // Quest gremlins need IDs because there's multiple
  desired_monsters.set($monster`erudite gremlin (tool)`, true); // erudite gremlin (tool)
  desired_monsters.set($monster`batwinged gremlin (tool)`, true); // batwinged gremlin (tool)
  desired_monsters.set($monster`vegetable gremlin (tool)`, true); // vegetable gremlin (tool)
  desired_monsters.set($monster`spider gremlin (tool)`, true); // spider gremlin (tool)

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

  const desired_locations: Map<Location, boolean> = new Map();
  desired_locations.set($location`Sonofa Beach`, true);
  desired_locations.set($location`The Hatching Chamber`, true);
  desired_locations.set($location`The Feeding Chamber`, true);
  desired_locations.set($location`The Royal Guard Chamber`, true);
  desired_locations.set($location`The Haunted Kitchen`, true);
  desired_locations.set($location`The Unquiet Garves`, true);
  desired_locations.set($location`The Haunted Ballroom`, true);

  if (desired_locations.has(loc)) {
    return true;
  }
  return false;
}

export function peridotChoiceHandler(choice: number, page: string): void {
  if (!auto_havePeridot()) {
    runChoice(2); //should never get here but might as well mitigate
  }

  const loc: Location = myLocation();
  const mons: AshMatcher = new AshMatcher('bandersnatch" value="(\\d+)', page);
  const monOpts: Map<number, Monster> = new Map();
  let i: number = 0;
  let bestmon: number = 0;
  while (mons.find()) {
    //record the possible monsters and identify the best one to target
    monOpts.set(i, toMonster(toInt(mons.group(1))));
    // Manual monster specifications
    if (
      peridotManuallyDesiredMonsters().has(
        monOpts.get(i) ?? monOpts.set(i, Monster.none).get(i),
      )
    ) {
      bestmon = i;
      break; // if we've got a force desired monster, don't bother with the rankings any more
    }
    if (
      zoneRank(monOpts.get(i) ?? monOpts.set(i, Monster.none).get(i), loc) <=
      zoneRank(
        monOpts.get(bestmon) ?? monOpts.set(bestmon, Monster.none).get(bestmon),
        loc,
      )
    ) {
      bestmon = i;
    }
    i += 1;
  }
  const popChoice: Monster =
    monOpts.get(bestmon) ?? monOpts.set(bestmon, Monster.none).get(bestmon);
  if (toInt(popChoice) === 0 || auto_peridotSetZone(loc)) {
    //still nothing found so just peace out. Or we want to set the zone without using an adventure.
    handleTracker$2(
      $item`Peridot of Peril`.toString(),
      loc.toString(),
      "Peace out",
      "auto_mapperidot",
    );
    runChoice(2); //if no match is found, hit the exit choice
    return;
  }
  handleTracker$2(
    $item`Peridot of Peril`.toString(),
    loc.toString(),
    popChoice.toString(),
    "auto_mapperidot",
  );
  runChoice(1, `bandersnatch=${toInt(popChoice)}`);
  return;
}

export function haveUsedPeridot(loc: Location): boolean {
  const perilLocs: Map<number, string> = new Map(
    splitString(getProperty("_perilLocations"), ",").map((_v, _i) => [_i, _v]),
  );
  for (const [, str] of perilLocs) {
    if (toInt(loc) === toInt(str)) {
      return true;
    }
  }
  return false;
}

function auto_havePrismaticBeret(): boolean {
  const pb: Item = $item`prismatic beret`;
  return auto_is_valid(pb) && possessEquipment(pb);
}

export function canBusk(): boolean {
  if (toInt(getProperty("_beretBuskingUses")) < 5) {
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
          getPower(h) *
            (multipliers.get($slot`hat`) ??
              multipliers.set($slot`hat`, 0).get($slot`hat`)),
        );
      }
    } else {
      hatPowers.set(
        0,
        getPower($item`prismatic beret`) *
          (multipliers.get($slot`hat`) ??
            multipliers.set($slot`hat`, 0).get($slot`hat`)),
      );
    }
  } else {
    for (const [, h] of allHats) {
      if (equippedAmount(h) >= 1) {
        hatPowers.set(
          0,
          (hatPowers.get(0) ?? 0) +
            getPower(h) *
              (multipliers.get($slot`hat`) ??
                multipliers.set($slot`hat`, 0).get($slot`hat`)),
        );
      }
    }
  }
  for (const [, p] of allPants) {
    pantPowers.set(
      pantPowers.size,
      getPower(p) *
        (multipliers.get($slot`pants`) ??
          multipliers.set($slot`pants`, 0).get($slot`pants`)),
    );
  }
  for (const [, s] of allShirts) {
    shirtPowers.set(shirtPowers.size, getPower(s));
  }
  for (const [, hp] of hatPowers) {
    for (const [, pp] of pantPowers) {
      for (const [, sp] of shirtPowers) {
        const concat: string = `${auto_have_familiar($familiar`Mad Hatrack`) ? `${(hp / (multipliers.get($slot`hat`) ?? multipliers.set($slot`hat`, 0).get($slot`hat`))).toString()},` : ""}${(pp / (multipliers.get($slot`pants`) ?? multipliers.set($slot`pants`, 0).get($slot`pants`))).toString()},${sp.toString()}`;
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
  const busksUsed: number = toInt(getProperty("_beretBuskingUses"));
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
      ["fumble", -1],
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
        effMulti.set(
          numMod.get(1) ?? numMod.set(1, "").get(1),
          toFloat(numMod.get(0) ?? numMod.set(0, "").get(0)),
        );
      }
    } else if (containsText(effectMultiplier, ":")) {
      numMod = new Map(
        splitString(effectMultiplier, ":").map((_v, _i) => [_i, _v]),
      );
      effMulti.set(
        numMod.get(1) ?? numMod.set(1, "").get(1),
        toFloat(numMod.get(0) ?? numMod.set(0, "").get(0)),
      );
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
      if (eff !== Effect.none) {
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
          getPower(hat) ===
            toInt(
              bestBuskPowersSplit.get(0) ??
                bestBuskPowersSplit.set(0, "").get(0),
            ) &&
          hat !== $item`prismatic beret`
        ) {
          //equip the hat and put the beret on the Hatrack to be able to busk
          autoForceEquip$2(hat, true);
          buskPower +=
            getPower(hat) *
            (multipliers.get($slot`hat`) ??
              multipliers.set($slot`hat`, 0).get($slot`hat`));
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
        getPower($item`prismatic beret`) *
        (multipliers.get($slot`hat`) ??
          multipliers.set($slot`hat`, 0).get($slot`hat`));
    }
  } else {
    //get the power of all hats equipped in Hat Trick
    for (const [, h] of allHats) {
      if (equippedAmount(h) > 0) {
        buskPower +=
          getPower(h) *
          (multipliers.get($slot`hat`) ??
            multipliers.set($slot`hat`, 0).get($slot`hat`));
      }
    }
  }
  if (allPants.size > 0) {
    //only check if we have pants available
    if (
      toInt(
        bestBuskPowersSplit.get(1 - bestBuskHROffset) ??
          bestBuskPowersSplit
            .set(1 - bestBuskHROffset, "")
            .get(1 - bestBuskHROffset),
      ) === 0
    ) {
      autoForceEquip($slot`pants`, Item.none, true);
    } else {
      for (const [, pant] of allPants) {
        if (
          getPower(pant) ===
          toInt(
            bestBuskPowersSplit.get(1 - bestBuskHROffset) ??
              bestBuskPowersSplit
                .set(1 - bestBuskHROffset, "")
                .get(1 - bestBuskHROffset),
          )
        ) {
          autoForceEquip$2(pant, true);
          buskPower +=
            getPower(pant) *
            (multipliers.get($slot`pants`) ??
              multipliers.set($slot`pants`, 0).get($slot`pants`));
          break;
        }
      }
    }
  }
  if (allShirts.size > 0) {
    //only check if we have shirts available
    if (
      toInt(
        bestBuskPowersSplit.get(2 - bestBuskHROffset) ??
          bestBuskPowersSplit
            .set(2 - bestBuskHROffset, "")
            .get(2 - bestBuskHROffset),
      ) === 0
    ) {
      autoForceEquip($slot`shirt`, Item.none, true);
    } else {
      for (const [, shirt] of allShirts) {
        if (
          getPower(shirt) ===
          toInt(
            bestBuskPowersSplit.get(2 - bestBuskHROffset) ??
              bestBuskPowersSplit
                .set(2 - bestBuskHROffset, "")
                .get(2 - bestBuskHROffset),
          )
        ) {
          autoForceEquip$2(shirt, true);
          buskPower += getPower(shirt);
          break;
        }
      }
    }
  }

  if (useSkill(1, $skill`Beret Busking`)) {
    handleTracker$2(
      $item`prismatic beret`.toString(),
      myLocation().toString(),
      `Beret busk ${getProperty("_beretBuskingUses")} at ${buskPower} power`,
      "auto_otherstuff",
    );
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
    runChoice(1); //should never get here but might as well mitigate
  }

  const choices: Map<number, string> = new Map(
    Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]),
  );
  const choiceMap: Map<string, number> = new Map();
  for (const [idx, text] of choices) {
    choiceMap.set(text, idx);
  }

  function mobiusChoice(opt: string): void {
    const num: number = choiceMap.get(opt) ?? choiceMap.set(opt, 0).get(opt);
    handleTracker$1($item`Möbius ring`.toString(), opt, "auto_otherstuff");
    runChoice(num);
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
  if (toInt(getProperty("_clocksUsed")) < 2) {
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
    // take paradox-increasing options without negative effects in approximate utility order
    // some would have been taken earlier, so taking them here implies they're less useful
    for (const str of [
      "Stop your arch-nemesis as a baby",
      "Borrow meat from your future",
      "Hey, free gun!",
      "Shoot yourself in the foot",
      "Mind your own business",
      "Lift yourself up by your bootstraps",
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

  runChoice(1);
  return;
}

export function auto_timeCopFights(): number {
  return toInt(getProperty("_timeCopsFoughtToday"));
}

function auto_haveMonodent(): boolean {
  const dent: Item = $item`Monodent of the Sea`;
  return auto_is_valid(dent) && possessEquipment(dent);
}

export function auto_waveTheZone(): boolean {
  if (!auto_haveMonodent()) {
    return false;
  }
  //Already Summoned a Wave today
  if (toBoolean(getProperty("_seadentWaveUsed"))) {
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
    numericModifier(equippedItem($slot`weapon`), Modifier.get("Meat Drop")) <
      30.0
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  if (waveTheZone) {
    if (useSkill(1, $skill`Sea *dent: Summon a Wave`)) {
      handleTracker$2(
        $item`Monodent of the Sea`.toString(),
        myLocation().toString(),
        "Summon a Wave",
        "auto_otherstuff",
      );
      return true;
    }
  }
  return false;
}

export function auto_talkToSomeFish(loc: Location, enemy: Monster): boolean {
  // returns true if we want to cast Talk to Some Fish. Not intended to exhaustivly list all valid targets
  // also, this is not actually a free fight, but this is a safe listing of targets

  if (!auto_haveMonodent()) {
    return false;
  }
  if (!auto_is_valid$2($skill`Sea *dent: Talk to Some Fish`)) {
    return false;
  }
  // don't use Talk to Some Fish against inherently free fights
  if (isFreeMonster(enemy, loc)) {
    return false;
  }
  // don't try and use the skill if we have already turned them into some fish
  if (enemy === $monster`some fish`) {
    return false;
  }
  // need hippy / frat kills
  if (
    loc === $location`The Battlefield (Frat Uniform)` ||
    loc === $location`The Battlefield (Hippy Uniform)`
  ) {
    return false;
  }
  // need chained fights
  if (loc === $location`The Haunted Bedroom`) {
    return false;
  }
  // some fish has no meat drop, so this doesn't take familiar meat modifiers into account
  if (loc === $location`The Fungus Plains`) {
    return false;
  }
  //bcz has great synergy with talk to some fish to get all the drops in a zone
  if (auto_bczRefractedGaze() && auto_BCZEquipped()) {
    return true;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

export function auto_throwLightningRemaining(): number {
  if (
    !auto_haveMonodent() ||
    !auto_is_valid$2($skill`Sea *dent: Throw a Lightning Bolt`)
  ) {
    return 0;
  }

  return 11 - toInt(getProperty("_seadentLightningUsed"));
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
  return Item.none;
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

export function auto_wantToBCZ(sk: Skill): boolean {
  // zootomist doesn't have substats
  if (!auto_haveBCZ() || !canUse(sk) || in_zootomist()) {
    return false;
  }
  const bloodBathCasts: number = toInt(getProperty("_bczBloodBathCasts"));
  const bloodGeyserCasts: number = toInt(getProperty("_bczBloodGeyserCasts"));
  const bloodThinnerCasts: number = toInt(getProperty("_bczBloodThinnerCasts"));
  const dialItUpCasts: number = toInt(getProperty("_bczDialitupCasts"));
  const pheromoneCocktailCasts: number = toInt(
    getProperty("_bczPheromoneCocktailCasts"),
  );
  const refractedGazeCasts: number = toInt(
    getProperty("_bczRefractedGazeCasts"),
  );
  const spinalTapasCasts: number = toInt(getProperty("_bczSpinalTapasCasts"));
  const sweatBulletsCasts: number = toInt(getProperty("_bczSweatBulletsCasts"));
  const sweatEquityCasts: number = toInt(getProperty("_bczSweatEquityCasts"));

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

  function statChange(st: Stat, casts: number): boolean {
    let level: number = myLevel();
    if (myLevel() >= 13) {
      level = 13;
    }
    // disallow casts until level is above a certain threshold
    switch (true) {
      case level < 10 && casts >= 3:
        return false;
      case level < 11 && casts >= 5:
        return false;
      case in_amw() && casts >= 5:
        return false;
      case st === myPrimestat():
        //Don't want to use so many substats we go down too many levels or we have cast more than we really need to/should
        //Don't go beneath our current level or level 13 if we cast the skill
        return (
          myBasestat(stat_to_substat(st)) - level_to_min_substat(level) >
          auto_bczCastMath(casts)
        );
      case myBasestat(st) < 70 && casts < 3:
        //For an offstat that is not yet to 70, allow if the cost is less than 1 full stat in cost. don't cast more than 3 times per day
        return (
          myBasestat(stat_to_substat(st)) - myBasestat(st) ** 2 >
          auto_bczCastMath(casts)
        );
      default:
        //don't go below 70 of the other stats
        return myBasestat(st) ** 2 - 70 ** 2 > auto_bczCastMath(casts);
    }
  }

  switch (sk) {
    case $skill`BCZ: Blood Geyser`:
      //Muscle Casts
      return (
        statChange($stat`Muscle`, bloodGeyserCasts) && bloodGeyserCasts < 6
      );
    case $skill`BCZ: Blood Bath`:
      return statChange($stat`Muscle`, bloodBathCasts) && bloodBathCasts < 6;
    case $skill`BCZ: Create Blood Thinner`: //should never be cast, but if we want to support in the future, we can
      if (!canChew($item`blood thinner`)) {
        return false;
      }
      return (
        statChange($stat`Muscle`, bloodThinnerCasts) && bloodThinnerCasts === 0
      );
    case $skill`BCZ: Dial it up to 11`:
      //Mysticality Casts
      return statChange($stat`Mysticality`, dialItUpCasts) && dialItUpCasts < 3;
    case $skill`BCZ: Refracted Gaze`:
      return (
        statChange($stat`Mysticality`, refractedGazeCasts) &&
        refractedGazeCasts < 6
      );
    case $skill`BCZ: Prepare Spinal Tapas`:
      if (!auto_canEat($item`spinal tapas`)) {
        return false;
      }
      return (
        statChange($stat`Mysticality`, spinalTapasCasts) && spinalTapasCasts < 3
      );
    case $skill`BCZ: Sweat Bullets`:
      //Moxie Casts
      return (
        statChange($stat`Moxie`, sweatBulletsCasts) && sweatBulletsCasts < 6
      );
    case $skill`BCZ: Sweat Equity`:
      return statChange($stat`Moxie`, sweatEquityCasts) && sweatEquityCasts < 2;
    case $skill`BCZ: Craft a Pheromone Cocktail`:
      if (!auto_canDrink($item`pheromone cocktail`)) {
        return false;
      }
      return (
        statChange($stat`Moxie`, pheromoneCocktailCasts) &&
        pheromoneCocktailCasts < 6
      );
    default:
      return false;
  }
}

export function auto_bczRefractedGaze(): boolean {
  if (!auto_wantToBCZ($skill`BCZ: Refracted Gaze`)) {
    // we don't want to refreact if we don't have the stats.
    return false;
  }
  if (auto_havePeridot() && !haveUsedPeridot(myLocation())) {
    //Will undoubtedly want Peridot in these locations
    //Other sources of issue (pocket wishes/mimic eggs) are fought in Noob Cave
    //Don't have support for the Crepe Paper Parachute Cape but that also causes issues
    return false;
  }
  if (
    (myLocation() === $location`The Smut Orc Logging Camp` &&
      lumberCount() < bridgeGoal() &&
      fastenerCount() < bridgeGoal()) ||
    (myLocation() === $location`The Penultimate Fantasy Airship` &&
      itemAmount($item`Mohawk wig`) < 1 &&
      itemAmount($item`amulet of extreme plot significance`) < 1) ||
    myLocation() === $location`The Battlefield (Frat Uniform)` ||
    (myLocation() === $location`A-Boo Peak` &&
      itemAmount($item`A-Boo clue`) * 30 <
        toInt(getProperty("booPeakProgress"))) ||
    (myLocation() === $location`Cobb's Knob Harem` &&
      (lastMonster() === $monster`Knob Goblin Harem Guard` ||
        lastMonster() === $monster`some fish`)) ||
    (myLocation() === $location`Twin Peak` &&
      itemAmount($item`rusty hedge trimmers`) < 4) ||
    (myLocation() === $location`The Black Forest` &&
      !blackMarketAvailable() &&
      itemAmount($item`reassembled blackbird`) === 0 &&
      monsterPhylum() !== $phylum`beast`) ||
    (myLocation() === $location`Whitey's Grove` &&
      itemAmount($item`lion oil`) === 0 &&
      itemAmount($item`bird rib`) === 0 &&
      itemAmount($item`wet stew`) === 0 &&
      itemAmount($item`wet stunt nut stew`) === 0 &&
      monsterPhylum() !== $phylum`beast`) ||
    (myLocation() === $location`The Hidden Apartment Building` &&
      (lastMonster() === $monster`pygmy shaman` ||
        lastMonster() === $monster`some fish`)) ||
    (myLocation() === $location`The Defiled Nook` &&
      (lastMonster() === $monster`party skelteon` ||
        lastMonster() === $monster`some fish`)) ||
    (myLocation() === $location`The Hole in the Sky` &&
      needStarKey() &&
      ((monsterPhylum() === $phylum`constellation` &&
        lastMonster() !== $monster`Astronomer`) ||
        lastMonster() === $monster`some fish`)) ||
    (myLocation() === $location`Guano Junction` &&
      internalQuestStatus("questL04Bat") < 3)
  ) {
    return true;
  }
  return false;
}

export function auto_getBCZItems(): void {
  if (!auto_haveBCZ()) {
    return;
  }

  if (auto_wantToBCZ($skill`BCZ: Craft a Pheromone Cocktail`)) {
    handleTracker$1(
      $item`blood cubic zirconia`.toString(),
      $item`pheromone cocktail`.toString(),
      "auto_iotm_claim",
    );
    useSkill(1, $skill`BCZ: Craft a Pheromone Cocktail`);
  }
  if (auto_wantToBCZ($skill`BCZ: Prepare Spinal Tapas`)) {
    handleTracker$1(
      $item`blood cubic zirconia`.toString(),
      $item`spinal tapas`.toString(),
      "auto_iotm_claim",
    );
    useSkill(1, $skill`BCZ: Prepare Spinal Tapas`);
  }

  return;
}

function auto_haveShrunkenHead(): boolean {
  if (
    toBoolean(getProperty("hasShrunkenHead")) &&
    auto_is_valid($item`shrunken head`)
  ) {
    return true;
  }
  return false;
}

export function auto_wantToShrunkenHead(enemy: Monster): boolean {
  if (!auto_haveShrunkenHead()) {
    return false;
  }

  if (!canUse($skill`Prepare to reanimate your Foe`)) {
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

  const next: Monster = toMonster(getProperty("auto_nextEncounter"));
  if (next !== Monster.none) {
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
  setProperty("auto_preferSoCP", true.toString());
  // if amw_wantMeat is true, in meatpath we will (probably) select meat-dropping familiars instead of SoCP
  if (toInt(getProperty("_knuckleboneDrops")) === 100 || amw_wantMeat()) {
    setProperty("auto_preferSoCP", false.toString());
    return;
  }
  let amt: number = 0;
  for (const phyl of $phyla`constellation, elemental, hippy, horror, mer-kin, plant, slime, bug`) {
    amt += auto_zonePhylumPercent(myLocation(), phyl);
  }
  if (amt > 0.1) {
    //want 10% or fewer of the available mobs to be knucklebone eligible, otherwise why bother with this guy vs fairychauns/fairyballs/fairyeverythings?
    setProperty("auto_preferSoCP", false.toString());
    return;
  }

  return;
}
