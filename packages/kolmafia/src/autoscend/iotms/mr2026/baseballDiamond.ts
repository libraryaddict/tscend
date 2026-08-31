import {
  availableChoiceOptions,
  canDrink,
  canEat,
  currentRound,
  Element,
  handlingChoice,
  isBanished,
  Location,
  Monster,
  monsterLevelAdjustment,
  myAdventures,
  myHash,
  myLocation,
  printHtml,
  visitUrl,
} from "kolmafia";
import { $element, $item, $location, $monster, $monsters, get } from "libram";

import { Monodent, SwordOfSwords } from "../../../types";
import {
  fullness_left,
  getMinimumAdventuresToMaintain,
  inebriety_left,
} from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { isSoftBlockInPlace, setupSoftblockLocks } from "../../auto_routing";
import {
  auto_abort,
  auto_is_valid,
  auto_isInIncompleteZone,
  auto_isWorthSniffing,
  auto_isWorthYellowRaying,
  auto_locationMonsters,
  auto_log_info,
  auto_wantToBanish,
  auto_wantToFreeRun,
  auto_wantToSniff,
  auto_wantToYellowRay,
  freeRunCombatAction,
  getMonsterDrops,
  handleTracker,
  internalQuestStatus,
  isFreeMonster,
  TrackerCategory,
} from "../../auto_util";
import { isSniffed } from "../../combat/auto_combat_util";
import { auto_zoneCopyableMonsters } from "../../combat/wanderers/copier";
import {
  desiredDropsFor,
  desiredFightsFor,
  getEngine,
} from "../../engine/engine";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";

export function haveBaseballDiamond(): boolean {
  if (!auto_is_valid($item`Baseball Diamond`)) {
    return false;
  }

  return possessEquipment($item`Baseball Diamond`);
}

export function baseballInningsRemaining(): number {
  return 3 - get("_baseballInnings");
}

export function baseballFreefightMonster(): Monster {
  return baseballFreefightsRemaining() > 0
    ? get("_curveballMonster")
    : $monster.none;
}

export function baseballFreefightsRemaining(): number {
  return get("_curveballFightsLeft", 0);
}

export function baseballRecruits(): Monster[] {
  // Fills to 9; once full, recruiting a new monster bumps slot 0 out.
  return get("baseballTeam")
    .split(",")
    .filter(Boolean)
    .map((s) => Monster.get(s));
}

// The categories a baseball finisher can additionally log to - all share the same
// { monster, source } shape, so one handleTracker() call site below covers all of them.
// Extracted from the real TrackerCategory so a future rename/removal of one of these
// categories fails to compile here instead of silently drifting out of sync.
type BaseballTrackerCategory = Extract<
  TrackerCategory,
  "yellowRays" | "banishes" | "instakills" | "copies"
>;

interface BaseballFinisher {
  element: Element;
  gain: string;
  trackerCategory: BaseballTrackerCategory | undefined;
}

function finisher(
  element: Element,
  gain: string,
  trackerCategory?: BaseballTrackerCategory,
): BaseballFinisher {
  return { element, gain, trackerCategory };
}

// A finisher we actually played this game, ready to log once the game is over.
interface TrackedFinisherHit {
  monster: Monster;
  gain: string;
  trackerCategory: BaseballTrackerCategory | undefined;
}

// The order here matters
const baseballFinishers: BaseballFinisher[] = [
  finisher($element`hot`, "Yellow Ray", "yellowRays"),
  finisher($element`cold`, "Banish", "banishes"),
  finisher($element`spooky`, "Free Fights", "instakills"),
  finisher($element`stench`, "Extra Zone Copies", "copies"),
  finisher($element`sleaze`, "High ML"),
];

function auto_playBaseballGame(assignments: BaseballAssignment[]): boolean {
  visitUrl(`inventory.php?pwd=${myHash()}&action=pball`, false);

  if (!handlingChoice()) return false;

  const fillerPriority = new Map<string, [number, string]>([
    [
      "Throw a Garbageball",
      [
        (auto_is_valid($item`discarded hot dog`) && canEat()) ||
        (auto_is_valid($item`most of a beer`) && canDrink())
          ? 100
          : -1,
        "Food/Drink",
      ],
    ],
    ["Throw Some Smoke", [99, "+5 All Stats"]], // +5 stats
    ["Throw One in the Deep Freeze", [98, "3 DR"]], // +3 DR
    ["Throw a Bacon-Wrapped Slider", [5, "+Init"]], // Combat init
    ["Throw a Snow Ball", [4, "2-4 MP Regen"]], // +2-4 MP Regen
    ["Throw a Ghost Pitch", [3, "3-5 HP Regen"]], // 3-5 HP Regen
    ["Throw a Slurve", [-2, "Sleaze Res"]], // Sleaze res
    ["Bring the Heat", [-3, "Hot Dmg"]], // +5 hot dmg
    ["Draw a Skull on the Ball", [-4, "Reduce Enemy Attack/Def"]], // Reduced att+def
    ["Throw a Beanball", [-5, "Passive Stench Dmg"]], // Passive stench damage
  ]);

  const playedCounts = new Map<Element, number>();
  const track: TrackedFinisherHit[] = [];

  function isSafeToPlay(element: Element, currentSlot: number): boolean {
    const finisherHere = assignments.find(
      (a) => a.finisherSlot === currentSlot,
    );

    // If this slot is a finisher, we must play its element.
    if (finisherHere) {
      return element === finisherHere.element;
    }

    // We cannot premature a 3rd element in a normal slot.
    if ((playedCounts.get(element) ?? 0) === 2) {
      return false;
    }

    // Do we have enough slots left for our mandatory setups?
    let totalNeeded = 0;
    let availableSlots = 0;

    // Look at all remaining slots after this one
    for (let k = currentSlot + 1; k < 9; k++) {
      const futureFinisher = assignments.find((a) => a.finisherSlot === k);

      if (!futureFinisher) {
        // It's a free slot we can use for setups
        availableSlots++;
        continue;
      }

      // Calculate how many setups this finisher still needs
      let needed = 2 - (playedCounts.get(futureFinisher.element) ?? 0);

      // If we are playing its setup right now, it needs 1 less!
      if (element === futureFinisher.element) {
        needed--;
      }

      totalNeeded += Math.max(0, needed);

      // If the setups we need are greater than the free slots available before
      // this finisher, then playing this element would starve us
      if (totalNeeded > availableSlots) {
        return false;
      }
    }

    return true;
  }

  const team = baseballRecruits();
  let lastRetry = -1;

  // Play the game
  for (let i = 0; i < 9; i++) {
    const options = availableChoiceOptions();

    let bestElement = $element.none;
    let bestChoice = 0;
    let highestPriority = -9999;
    let gain: string = "???";
    let trackerCategory: BaseballTrackerCategory | undefined = undefined;

    for (const {
      element,
      gain: eleGain,
      trackerCategory: category,
    } of baseballFinishers) {
      // If our math says it ruins a finisher, skip it
      if (!isSafeToPlay(element, i)) continue;

      const choiceNum =
        baseballFinishers.findIndex((f) => f.element === element) + 1;

      // Check our priorities, we default to -1000, which is still better than nothing
      const priority: [number, string] = fillerPriority.get(
        options[choiceNum],
      ) ?? [-1000, eleGain];

      // Pick the safe choice with the highest score
      if (priority[0] > highestPriority) {
        highestPriority = priority[0];
        bestElement = element;
        bestChoice = choiceNum;
        gain = priority[1];
        trackerCategory = category;
      }
    }

    if (bestChoice === 0) {
      if (lastRetry !== i) {
        lastRetry = i;
        visitUrl("choice.php");
        i--;
        continue;
      }
      auto_abort(
        `Failed to find a valid pitch for baseball slot ${i}. Available options are ${JSON.stringify(options)}, our finisher plan was ${JSON.stringify(assignments)}`,
      );
    }
    // This was a finisher
    if (highestPriority === -1000) {
      track.push({ monster: team[i], gain, trackerCategory });
    }

    // Track the pitch
    playedCounts.set(bestElement, (playedCounts.get(bestElement) ?? 0) + 1);

    auto_log_info(
      `Baseball round ${i + 1}, throwing ${bestElement} ball #${playedCounts.get(bestElement)} at ${team[i]} for ${gain}`,
    );
    visitUrl(`choice.php?pwd&whichchoice=1598&option=${bestChoice}`);
  }

  for (const { monster, gain, trackerCategory } of track) {
    handleTracker({
      tracker: "otherStuff",
      event: $item`Baseball Diamond`,
      detail: `${monster} - ${gain}`,
    });

    if (trackerCategory) {
      handleTracker({
        tracker: trackerCategory,
        monster,
        source: $item`Baseball Diamond`.toString(),
      });
    }
  }
  visitUrl(`choice.php?pwd&whichchoice=1598&option=6`);

  if (baseballRecruits().length > 0) {
    auto_abort(`Expected to have played baseball, did not.`);
  }

  return true;
}

export interface BaseballAssignment {
  element: Element;
  finisherMonster: Monster;
  finisherSlot: number;
}

function auto_baseballGetDesiredElements(
  mon: Monster,
  loc: Location = myLocation(),
): Element[] {
  const elements: Element[] = [];
  if (
    auto_isWorthYellowRaying(mon, loc) &&
    (SwordOfSwords.swordOfSwordsTracking() !== mon ||
      SwordOfSwords.swordOfSwordsKillsLeft() <= 0)
  ) {
    elements.push($element`hot`);
  }

  if (
    auto_isWorthSniffing(mon, loc) &&
    (SwordOfSwords.swordOfSwordsTracking() !== mon ||
      SwordOfSwords.swordOfSwordsKillsLeft() <= 0)
  ) {
    elements.push($element`stench`);
    elements.push($element`spooky`);
  } else if (Monodent.haveMonodent() && mon === $monster`some fish`) {
    elements.push($element`spooky`);
  }
  // They're not free on blue team
  if (
    mon === $monster`dense liana` &&
    !bluevsred_willEncounterFight($monster`dense liana`) &&
    // If we're not done with dense lianas
    ([
      "questL11Curses",
      "questL11Business",
      "questL11Doctor",
      "questL11Spare",
    ].some((s) => internalQuestStatus(s) < 0) ||
      internalQuestStatus("questL11Worship") < 3)
  ) {
    elements.push($element`spooky`);
  }
  if (
    !isBanished(mon) &&
    auto_wantToBanish(mon, loc) &&
    auto_isInIncompleteZone(mon)
  ) {
    elements.push($element`cold`);
  }
  return elements;
}

// Extra copies scale with how many more we want, free fights stop paying out after 3.
function baseballElementValue(element: Element, need: number): number {
  if (element === $element`stench`) return need;
  if (element === $element`spooky`) return Math.min(need, 3);
  if (element === $element`cold`) return 0.5;
  return 100;
}

export function baseballBuildAssignments(
  team: Monster[],
): BaseballAssignment[] {
  const desired = new Map<Monster, [Element, number][]>();
  const possible: [[Element, number][], number][] = [];

  for (let slot = 2; slot < team.length; slot++) {
    const mon = team[slot];
    let elements = desired.get(mon);
    if (elements === undefined) {
      const need = Math.max(
        1,
        auto_baseballDesiredEncounters(mon, myLocation()),
      );
      elements = auto_baseballGetDesiredElements(mon).map(
        (element): [Element, number] => [
          element,
          baseballElementValue(element, need),
        ],
      );
      desired.set(mon, elements);
    }
    if (elements.length > 0) {
      possible.push([elements, slot]);
    }
  }

  function compareAssignments(
    a: [Element, number][],
    aValue: number,
    b: [Element, number][],
    bValue: number,
  ): boolean {
    if (a.length !== b.length) {
      return a.length > b.length;
    }

    if (aValue !== bValue) {
      return aValue > bValue;
    }

    // Same number of finishers. Prefer earlier finish slots if its the same monster, otherwise later
    for (let i = 0; i < a.length; i++) {
      const aSlot = a[i][1];
      const bSlot = b[i][1];

      if (aSlot !== bSlot) {
        return team[aSlot] === team[bSlot] ? aSlot < bSlot : aSlot > bSlot;
      }
    }

    return false;
  }

  let best: [Element, number][] = [];
  let bestValue = 0;
  const chosen: [Element, number][] = [];
  let chosenValue = 0;
  const claimed: Element[] = [];

  // every finisher needs 2 throws of its element first, so the nth can't start before slot 3n + 2
  function search(index: number): void {
    if (compareAssignments(chosen, chosenValue, best, bestValue)) {
      best = [...chosen];
      bestValue = chosenValue;
    }

    for (let i = index; i < possible.length; i++) {
      const [elements, slot] = possible[i];
      if (slot < 3 * chosen.length + 2) continue;

      for (const [element, value] of elements) {
        if (claimed.includes(element)) continue;

        chosen.push([element, slot]);
        claimed.push(element);
        chosenValue += value;
        search(i + 1);
        chosenValue -= value;
        chosen.pop();
        claimed.pop();
      }
    }
  }

  search(0);

  return best.map(([element, finisherSlot]) => ({
    element,
    finisherSlot,
    finisherMonster: team[finisherSlot],
  }));
}

function baseballOversized(monster: Monster): boolean {
  // Short list of non-100x100 sized monsters that are likely to appear and are copyable
  // This list likely contains unrelvant monsters
  if (monster.name.startsWith("Black Crayon ")) return true;
  return $monsters`beetle, Big Wheelin' Twins, Blader, caugr, cockroach, dilophosaur, Eldritch Tentacle, Hellion, Mer-kin baker, Mismatched Twins, moomy, oil cartel, reanimated demon skeleton, reanimated giant spider skeleton, reanimated wyrm skeleton, shadow bat, signal, spectre of war, tiki idol, translucent monkey, ungulith, vape ghost, wild beaver, wild moose, wild reindeer, wild walrus, Yuleviathan`.includes(
    monster,
  );
}

// How many more real encounters of mon we still want, across drops and fights.
function auto_baseballDesiredEncounters(mon: Monster, loc: Location): number {
  let need = 0;

  for (const { fight, fightsInTask } of desiredFightsFor(mon)) {
    if (fightsInTask === 1) need = Math.max(need, fight.needAmount);
  }

  for (const drop of getMonsterDrops(mon)) {
    for (const desired of desiredDropsFor(drop.item)) {
      need = Math.max(need, desired.needAmount);
    }
  }

  // auto_wantToYellowRay/auto_wantToSniff only signal want, no count.
  if (
    need === 0 &&
    (auto_wantToYellowRay(mon, loc) ||
      (auto_isInIncompleteZone(mon) && auto_wantToSniff(mon, loc)))
  ) {
    need = 1;
  }

  return need;
}

// How many valid assignments come from this zone, and whether it's loaded.
function baseballZoneLoad(
  assignments: BaseballAssignment[],
  zoneMonsters: [Monster, number][],
): {
  validAssignments: BaseballAssignment[];
  inZone: BaseballAssignment[];
  loaded: boolean;
} {
  const freeFightsMonster = baseballFreefightMonster();
  const validAssignments = assignments.filter(
    (a) =>
      a.finisherMonster !== freeFightsMonster &&
      !isSniffed(a.finisherMonster, $item`Baseball Diamond`),
  );
  const inZone = validAssignments.filter((a) =>
    zoneMonsters.some(([mon]) => mon === a.finisherMonster),
  );

  return {
    validAssignments,
    inZone,
    loaded: inZone.length >= 2 && !auto_baseballIsLoadBearing(validAssignments),
  };
}

// Monsters at loc (with their encounter rate) that a copier (sword, baseball diamond, ...)
// could actually track/target.

// Score bonus rather than forcing the item on, so it only wins its equip slot when worth it.
export function baseballDiamondMaximizerBonus(loc: Location): number {
  if (!haveBaseballDiamond()) return 0;

  if (
    baseballInningsRemaining() === 0 &&
    (!canEat() ||
      !canDrink() ||
      (fullness_left() > 0 && inebriety_left() > 0) ||
      getMinimumAdventuresToMaintain() + 10 > myAdventures())
  ) {
    return 0;
  }

  // Hardcoded areas where we know the monsters cannot be recruited
  if (
    loc === $location`Oil Peak` &&
    monsterLevelAdjustment() >= 100 &&
    baseballOversized($monster`oil cartel`)
  ) {
    return 0;
  }

  const team = baseballRecruits();
  const assignments = baseballBuildAssignments(team);

  const assignedElements = assignments.map((a) => a.element);

  const assignedCounts = new Map<Monster, number>();
  for (const a of assignments) {
    assignedCounts.set(
      a.finisherMonster,
      (assignedCounts.get(a.finisherMonster) ?? 0) + 1,
    );
  }

  const zoneMonsters = auto_zoneCopyableMonsters(loc);
  const { loaded } = baseballZoneLoad(assignments, zoneMonsters);

  // Only skip a loaded zone when we're actually free to leave it.
  const skipLoadedZone = loaded && !baseballShouldDelayZone(zoneMonsters);

  // Only chase a monster past what we've already assigned it.
  const hasWorthyTarget =
    !skipLoadedZone &&
    zoneMonsters.some(
      ([mon]) =>
        !baseballOversized(mon) &&
        auto_baseballDesiredEncounters(mon, loc) >
          (assignedCounts.get(mon) ?? 0) &&
        auto_baseballGetDesiredElements(mon, loc).some(
          (e) => !assignedElements.includes(e),
        ),
    );

  // Below a full roster we still need bodies to unlock playing at all.
  if (team.length < 9) {
    // 51 so that 10% item drop massive gemstones don't keep the baseball out
    return hasWorthyTarget ? 250 : 51;
  }

  return hasWorthyTarget ? 250 : 0;
}

export function baseballShouldReplaceWithFish(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!haveBaseballDiamond() || !Monodent.haveMonodent()) {
    return false;
  }
  if (enemy === $monster`some fish`) {
    return false;
  }
  if (!Monodent.isPotentialTalkToSomeFishTarget(loc, enemy)) {
    return false;
  }
  if (
    auto_isWorthYellowRaying(enemy, loc) ||
    auto_isWorthSniffing(enemy, loc)
  ) {
    // Already a good target, no need to replace it.
    return false;
  }
  // If we can free run on this monster, don't switch to some fish
  if (
    !isFreeMonster($monster`some fish`) &&
    auto_wantToFreeRun(enemy, loc) &&
    freeRunCombatAction(enemy, loc, currentRound() > 0) !== undefined
  ) {
    return false;
  }

  return true;
}

function auto_baseballIsLoadBearing(
  assignments: BaseballAssignment[],
): boolean {
  let start = 0;
  for (const assignment of assignments) {
    // We start at slot 1, check if the finisher slot allows 2 slots before it
    if (start + 2 >= assignment.finisherSlot) {
      // We don't have enough slots
      return true;
    }

    // Add the 3 slots, 2 for the prep, 1 for the finisher
    start += 3;
  }

  // Didn't hit true, not load bearing
  return false;
}

function auto_baseballShouldPlay(
  team: Monster[],
  assignments: BaseballAssignment[],
): boolean {
  if (team.length !== 9) {
    return false;
  }

  // Exclude the sniffed monster
  const validAssignments = assignments.filter(
    (a) =>
      !isSniffed(a.finisherMonster, $item`Baseball Diamond`) &&
      a.finisherMonster !== baseballFreefightMonster(),
  );

  // Play it when we have 3 assignments
  if (validAssignments.length === 3) {
    return true;
  }

  // Or 2 if load-bearing, or we've given up waiting for a 3rd.
  if (
    validAssignments.length === 2 &&
    (auto_baseballIsLoadBearing(validAssignments) ||
      !isSoftBlockInPlace("baseballDiamond"))
  ) {
    return true;
  }

  return false;
}

export function tryPlayBaseball(): boolean {
  const team = baseballRecruits();
  if (team.length !== 9) {
    return false;
  }

  const assignments = baseballBuildAssignments(team);

  if (!auto_baseballShouldPlay(team, assignments)) {
    return false;
  }

  auto_log_info("Baseball gameplan:");
  for (const a of assignments) {
    const gain =
      baseballFinishers.find((f) => f.element === a.element)?.gain ??
      a.element.toString();

    auto_log_info(
      `- Slot ${a.finisherSlot}: finish ${a.element} on ${a.finisherMonster} for ${gain}`,
    );
  }

  if (!auto_playBaseballGame(assignments)) {
    return false;
  }

  return true;
}

export function printBaseballDiamondDebug(): void {
  printHtml(`Have Baseball Diamond: ${haveBaseballDiamond()}`, false);
  if (!haveBaseballDiamond()) return;

  setupSoftblockLocks();
  printHtml(`Innings remaining: ${baseballInningsRemaining()}`, false);
  printHtml(
    `Would delay ${myLocation()}? ${baseballShouldDelayZone(auto_locationMonsters(myLocation()))}. Maximizer score? ${baseballDiamondMaximizerBonus(myLocation())}`,
  );

  const freefightMonster = baseballFreefightMonster();
  printHtml(
    `Freefight monster: ${freefightMonster === $monster.none ? "none" : freefightMonster} (${baseballFreefightsRemaining()} fights left)`,
    false,
  );

  const team = baseballRecruits();
  printHtml(
    `Team (${team.length}/9): ${team.length > 0 ? team.join(", ") : "none"}`,
    false,
  );

  if (team.length !== 9) {
    printHtml(`Team is not full, will not play.`, false);
    return;
  }

  const assignments = baseballBuildAssignments(team);
  printHtml(`Assignments (${assignments.length}):`, false);
  for (const a of assignments) {
    const gain =
      baseballFinishers.find((f) => f.element === a.element)?.gain ??
      a.element.toString();
    printHtml(
      `&nbsp;&nbsp;- Slot ${a.finisherSlot}: finish ${a.element} on ${a.finisherMonster} for ${gain}`,
      false,
    );
  }

  const validAssignments = assignments.filter((a) => {
    const sniffedOut = isSniffed(a.finisherMonster, $item`Baseball Diamond`);
    const isFreefight = a.finisherMonster === freefightMonster;
    if (sniffedOut || isFreefight) {
      printHtml(
        `&nbsp;&nbsp;- Excluding slot ${a.finisherSlot} (${a.finisherMonster}): ${sniffedOut ? "already sniffed" : "is the freefight monster"}`,
        false,
      );
      return false;
    }
    return true;
  });

  printHtml(`Valid assignments: ${validAssignments.length}`, false);

  if (validAssignments.length === 3) {
    printHtml(`Would play: have all 3 valid finishers.`, false);
    return;
  }

  if (validAssignments.length === 2) {
    const loadBearing = auto_baseballIsLoadBearing(validAssignments);
    const givenUp = !isSoftBlockInPlace("baseballDiamond");
    printHtml(
      `Have 2 valid finishers, load bearing: ${loadBearing}, given up waiting: ${givenUp} -> would ${loadBearing || givenUp ? "" : "NOT "}play.`,
      false,
    );
    return;
  }

  printHtml(
    `Only ${validAssignments.length} valid finisher(s), will not play yet.`,
    false,
  );
}

// Soft-delay a level's quest-turn-in while a recruited teammate here hasn't been played yet.
export function baseballShouldDelayZone(
  zoneMonsters: [Monster, number][],
): boolean {
  if (baseballInningsRemaining() <= 0) {
    return false;
  }

  const team = baseballRecruits();
  if (team.length === 0) {
    return false;
  }

  const { inZone, loaded } = baseballZoneLoad(
    getEngine().getContext().baseballAssignments(),
    zoneMonsters,
  );

  if (inZone.length === 0) {
    return false;
  }

  // Once full, more recruiting only evicts and reshuffles, so keep protecting here.
  if (loaded && team.length < 9) {
    return false;
  }

  return isSoftBlockInPlace("baseballDiamond");
}
