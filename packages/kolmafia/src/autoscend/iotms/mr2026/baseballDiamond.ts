import {
  availableAmount,
  availableChoiceOptions,
  canDrink,
  canEat,
  currentRound,
  Element,
  handlingChoice,
  isBanished,
  Item,
  Location,
  Monster,
  monsterLevelAdjustment,
  myAdventures,
  myHash,
  myLocation,
  visitUrl,
} from "kolmafia";
import { $element, $item, $location, $monster, $monsters, get } from "libram";

import { AutoEternityCodpiece, Monodent, SwordOfSwords } from "../../../types";
import {
  fullness_left,
  getMinimumAdventuresToMaintain,
  inebriety_left,
} from "../../auto_consume";
import { isSoftBlockInPlace } from "../../auto_routing";
import {
  auto_abort,
  auto_is_valid,
  auto_isInIncompleteZone,
  auto_isWorthSniffing,
  auto_isWorthYellowRaying,
  auto_log_info,
  auto_wantToBanish,
  auto_wantToFreeRun,
  auto_zoneCopyableMonsters,
  freeRunCombatAction,
  handleTracker,
  internalQuestStatus,
  isFreeMonster,
  safeGet,
  TrackerKey,
} from "../../auto_util";
import { isSniffed } from "../../combat/auto_combat_util";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";

export function auto_haveBaseballDiamond(): boolean {
  if (!auto_is_valid($item`Baseball Diamond`)) {
    return false;
  }
  if (availableAmount($item`Baseball Diamond`) > 0) {
    return true;
  }
  if (AutoEternityCodpiece.auto_isInEternityCodpiece($item`Baseball Diamond`)) {
    return true;
  }
  return false;
}

export function auto_getItemToEquipBaseballDiamond(): Item {
  if (
    AutoEternityCodpiece.auto_haveEternityCodpiece() &&
    AutoEternityCodpiece.auto_isInEternityCodpiece($item`Baseball Diamond`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (auto_haveBaseballDiamond()) {
    return $item`Baseball Diamond`;
  }
  return $item.none;
}

export function auto_baseballInningsRemaining(): number {
  return 3 - get("_baseballInnings");
}

export function auto_baseballFreefightMonster(): Monster {
  return auto_baseballFreefightsRemaining() > 0
    ? safeGet("_curveballMonster")
    : $monster.none;
}

export function auto_baseballFreefightsRemaining(): number {
  return get("_curveballFightsLeft", 0);
}

export function auto_baseballRecruits(): Monster[] {
  // Fills to 9; once full, recruiting a new monster bumps slot 0 out.
  return get("baseballTeam")
    .split(",")
    .filter(Boolean)
    .map((s) => Monster.get(s));
}

interface TrackerEntry {
  element: Element;
  gain: string;
  trackerKey: TrackerKey | undefined;
}

function finisher(
  element: Element,
  gain: string,
  trackerKey?: TrackerKey,
): TrackerEntry {
  return { element, gain, trackerKey };
}

// The order here matters
const baseballFinishers: TrackerEntry[] = [
  finisher($element`hot`, "Yellow Ray", "auto_yellowRays"),
  finisher($element`cold`, "Banish", "auto_banishes"),
  finisher($element`spooky`, "Free Fights", "auto_instakill"),
  finisher($element`stench`, "Extra Zone Copies", "auto_copies"),
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
  const track: {
    monster: Monster;
    gain: string;
    trackerKey: TrackerKey | undefined;
  }[] = [];

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

  const team = auto_baseballRecruits();
  let lastRetry = -1;

  // Play the game
  for (let i = 0; i < 9; i++) {
    const options = availableChoiceOptions();

    let bestElement = $element.none;
    let bestChoice = 0;
    let highestPriority = -9999;
    let gain: string = "???";
    let trackerKey: TrackerKey | undefined = undefined;

    for (const {
      element,
      gain: eleGain,
      trackerKey: key,
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
        trackerKey = key;
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
      track.push({ monster: team[i], gain, trackerKey });
    }

    // Track the pitch
    playedCounts.set(bestElement, (playedCounts.get(bestElement) ?? 0) + 1);

    auto_log_info(
      `Baseball round ${i + 1}, throwing ${bestElement} ball #${playedCounts.get(bestElement)} at ${team[i]} for ${gain}`,
    );
    visitUrl(`choice.php?pwd&whichchoice=1598&option=${bestChoice}`);
  }

  for (const { monster, gain, trackerKey } of track) {
    handleTracker({
      what: $item`Baseball Diamond`,
      detail: `${monster} - ${gain}`,
      property: "auto_otherstuff",
    });

    if (trackerKey) {
      handleTracker({
        what: monster,
        detail: $item`Baseball Diamond`.toString(),
        property: trackerKey,
      });
    }
  }
  visitUrl(`choice.php?pwd&whichchoice=1598&option=6`);

  if (auto_baseballRecruits().length > 0) {
    auto_abort(`Expected to have played baseball, did not.`);
  }

  return true;
}

interface BaseballAssignment {
  element: Element;
  finisherMonster: Monster;
  finisherSlot: number;
  normalSlots: number[];
}

function auto_baseballGetDesiredElements(
  mon: Monster,
  loc: Location = myLocation(),
): Element[] {
  const elements: Element[] = [];
  if (
    auto_isWorthYellowRaying(mon, loc) &&
    (SwordOfSwords.auto_swordOfSwordsTracking() !== mon ||
      SwordOfSwords.auto_swordOfSwordsKillsLeft() <= 0)
  ) {
    elements.push($element`hot`);
  }

  if (
    auto_isWorthSniffing(mon, loc) &&
    (SwordOfSwords.auto_swordOfSwordsTracking() !== mon ||
      SwordOfSwords.auto_swordOfSwordsKillsLeft() <= 0)
  ) {
    elements.push($element`stench`);
    elements.push($element`spooky`);
  } else if (Monodent.auto_haveMonodent() && mon === $monster`some fish`) {
    elements.push($element`spooky`);
  }
  // They're not free on blue team
  if (
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

export function auto_baseballBuildAssignments(
  team: Monster[],
): BaseballAssignment[] {
  const possible: [Element[], number][] = team
    .map(
      (mon, slot) =>
        [slot < 2 ? [] : auto_baseballGetDesiredElements(mon), slot] as [
          Element[],
          number,
        ],
    )
    .filter(([eles]) => eles.length > 0);

  possible.sort((a, b) => a[1] - b[1]);

  function compareAssignments(
    a: [Element, number][],
    b: [Element, number][],
  ): boolean {
    if (a.length !== b.length) {
      return a.length > b.length;
    }

    // Same number of finishers. Prefer earlier finish slots if its the same monster, otherwise later
    const aSlots = a.map(([, slot]) => slot);
    const bSlots = b.map(([, slot]) => slot);

    for (let i = 0; i < aSlots.length; i++) {
      if (aSlots[i] !== bSlots[i]) {
        // If its the same monster, prefer earlier slots
        if (team[aSlots[i]] === team[bSlots[i]]) {
          return aSlots[i] < bSlots[i];
        }
        // If its not the same, prefer latter (we'd get better targets perhaps)
        return aSlots[i] > bSlots[i];
      }
    }

    return false;
  }

  // Each finisher needs 2 prior throws of its own element; sorted by slot,
  // the ith finisher must have slot >= 3*i - 1 to leave room for those.
  function isFeasibleAssignment(candidate: [Element, number][]): boolean {
    const slots = candidate.map(([, slot]) => slot).sort((a, b) => a - b);
    return slots.every((slot, index) => slot >= 3 * (index + 1) - 1);
  }

  function getLargestGroup(
    claimed: Element[],
    startSlot: number,
  ): [Element, number][] {
    const candidates = possible.filter((p) => p[1] <= startSlot);

    let best: [Element, number][] = [];

    for (const [eles, slot] of candidates) {
      for (const ele of eles) {
        if (claimed.includes(ele)) continue;

        const result = getLargestGroup([...claimed, ele], slot - 1);
        const candidate = [...result, [ele, slot]] as [Element, number][];

        if (
          isFeasibleAssignment(candidate) &&
          compareAssignments(candidate, best)
        ) {
          best = candidate;
        }

        // If this branch already hit the theoretical maximum,
        // we don't need to explore weaker branches.
        const maxPossible = Math.floor((startSlot - 1) / 3);
        if (best.length === maxPossible) {
          return best;
        }
      }
    }

    return best;
  }

  const largest = getLargestGroup([], 9);

  const assignments: BaseballAssignment[] = largest.map(
    ([element, finisherSlot]) => ({
      element,
      finisherSlot,
      finisherMonster: team[finisherSlot],
      normalSlots: [],
    }),
  );

  // Fill unused slots into normal positions.
  for (let i = 0; i < 9; i++) {
    if (assignments.some((a) => a.finisherSlot === i)) {
      continue;
    }

    assignments.find((a) => a.normalSlots.length < 2)?.normalSlots.push(i);
  }

  return assignments;
}

function baseballOversized(monster: Monster): boolean {
  // Short list of non-100x100 sized monsters that are likely to appear and are copyable
  // This list likely contains unrelvant monsters
  if (monster.name.startsWith("Black Crayon ")) return true;
  return $monsters`beetle, Big Wheelin' Twins, Blader, caugr, cockroach, dilophosaur, Eldritch Tentacle, Hellion, Mer-kin baker, Mismatched Twins, moomy, oil cartel, reanimated demon skeleton, reanimated giant spider skeleton, reanimated wyrm skeleton, shadow bat, signal, spectre of war, tiki idol, translucent monkey, ungulith, vape ghost, wild beaver, wild moose, wild reindeer, wild walrus, Yuleviathan`.includes(
    monster,
  );
}

// Monsters at loc (with their encounter rate) that a copier (sword, baseball diamond, ...)
// could actually track/target.

// Score bonus rather than forcing the item on, so it only wins its equip slot when worth it.
export function auto_baseballDiamondMaximizerBonus(loc: Location): number {
  if (!auto_haveBaseballDiamond()) return 0;

  if (
    auto_baseballInningsRemaining() === 0 &&
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

  const team = auto_baseballRecruits();
  const assignments = auto_baseballBuildAssignments(team);

  const assignedElements = assignments.map((a) => a.element);

  // Is this monster one we want to sniff or YR, and we do not have assignments for already
  const hasWorthyTarget = auto_zoneCopyableMonsters(loc).some(
    ([mon]) =>
      !baseballOversized(mon) &&
      (auto_isWorthYellowRaying(mon, loc) || auto_isWorthSniffing(mon, loc)) &&
      auto_baseballGetDesiredElements(mon, loc).some(
        (e) => !assignedElements.includes(e),
      ),
  );

  const hasWorthyTargetsInTeam = assignments.length > 0;

  if (hasWorthyTargetsInTeam) {
    // When our baseball has worthy targets, then we don't wear the baseball if we're adventuring in a zone without a worthy target
    return hasWorthyTarget ? 250 : 0;
  }

  // When our baseball has no worthy targets in it
  if (team.length < 6) {
    // we are filling the baseballs first 6 slots and we avoid the worthy zones
    // But that's handled elsewhere, if we're wearing this in a good location then we are somewhat at the end of our rope
    return 50;
  } else {
    // we'll try to fill the last 3 when we've recruited enough (fillers).
    return hasWorthyTarget ? 250 : 0;
  }
}

export function auto_baseballShouldReplaceWithFish(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!auto_haveBaseballDiamond() || !Monodent.auto_haveMonodent()) {
    return false;
  }
  if (enemy === $monster`some fish`) {
    return false;
  }
  if (!Monodent.auto_isPotentialTalkToSomeFishTarget(loc, enemy)) {
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
  // normalSlots are unchecked padding; only the finisher is an actual target.
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
      a.finisherMonster !== auto_baseballFreefightMonster(),
  );

  // Play it when we have 3 assignments
  if (validAssignments.length === 3) {
    return true;
  }

  // Or 2 assignments and we'd lose an assignment if we don't play a game
  if (
    validAssignments.length === 2 &&
    auto_baseballIsLoadBearing(validAssignments)
  ) {
    return true;
  }

  return false;
}

export function auto_tryPlayBaseball(): boolean {
  const team = auto_baseballRecruits();
  if (team.length !== 9) {
    return false;
  }

  const assignments = auto_baseballBuildAssignments(team);

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

// Soft-delay a level's quest-turn-in while a recruited teammate here hasn't been played yet.
export function auto_baseballShouldDelayZone(
  zoneMonsters: [Monster, number][],
): boolean {
  if (auto_baseballInningsRemaining() <= 0) {
    return false;
  }

  const freeFightsMonster = auto_baseballFreefightMonster();

  if (
    zoneMonsters.some(
      ([mon]) =>
        mon === freeFightsMonster || isSniffed(mon, $item`Baseball Diamond`),
    )
  ) {
    return false;
  }

  const team = auto_baseballRecruits();
  if (team.length === 0) {
    return false;
  }

  const assignments = auto_baseballBuildAssignments(team);

  return (
    assignments.some((assignment) =>
      zoneMonsters.some(([mon]) => mon === assignment.finisherMonster),
    ) && isSoftBlockInPlace("baseballDiamond")
  );
}
