import {
  appearanceRates,
  canAdventure,
  currentRound,
  haveEffect,
  itemAmount,
  Location,
  Monster,
  Skill,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  get,
  LegendarySealClubbingClub,
  set,
} from "libram";
import { BadlyRomanticArrow } from "libram/dist/resources/2011/ObtuseAngel";

import {
  AutoLeprecondo,
  Bofa,
  L11_HiddenCity,
  Roman,
  SealClubbingClub,
  SwordOfSwords,
} from "../../../types";
import { auto_canChew, autoChew, spleen_left } from "../../auto_consume";
import { addBonusToMaximize, autoEquip } from "../../auto_equipment";
import { solveDelayZone } from "../../auto_routing";
import { zone_delay } from "../../auto_zone";
import { autoAdv } from "../../executors/auto_adventure";
import { handleFamiliar$1 } from "../../helpers/auto_familiar";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_small } from "../../paths/2023/small";
import { auto_lobsterCopiesReserved } from "../../quests/level_12";
import { auto_log_info } from "../../utils/auto_log";
import {
  auto_copiesStillNeeded,
  auto_copyRequiredZone,
  auto_getMonsters,
  auto_is_valid$2,
  auto_shouldCopySomeMore,
  instakillable,
  isFreeMonster,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";
import { auto_canUse, replaceMonsterCombatString } from "../auto_combat_util";

// Barrels sit on the war's critical path and the beach often waits on a combat forcer, so
// lobsterfrogman keeps first call on our copies and everything else spends only the surplus.
function copiesAreSpokenFor(enemy: Monster): boolean {
  const lobster: Monster = $monster`lobsterfrogman`;
  if (enemy === lobster) {
    return false;
  }
  const reserved: number = auto_lobsterCopiesReserved();

  return reserved > 0 && auto_copiesObtainable(lobster) <= reserved;
}

// Only one chained fight can be queued at a time
function chainedFightPending(): boolean {
  return (
    get("_chainedPurpleCandleMonster") !== $monster.none ||
    AutoLeprecondo.chainedAfterimageMonster() !== $monster.none
  );
}

// Chains the fight immediately, so it lands wherever we already are.
export function getCopier(
  enemy: Monster,
  inCombat: boolean = currentRound() > 0,
): Skill {
  if (!enemy.copyable || chainedFightPending()) {
    return $skill.none;
  }
  if (
    haveEffect($effect`Everything Looks Purple`) === 0 &&
    ((!inCombat &&
      Roman.haveRoman() &&
      maximizer.slotAvailable($slot`off-hand`)) ||
      auto_canUse($skill`Blow the Purple Candle!`))
  ) {
    return $skill`Blow the Purple Candle!`;
  }
  // the candle's cooldown runs whether we use it or not, so holding it back only loses uses
  if (copiesAreSpokenFor(enemy)) {
    return $skill.none;
  }
  if (spareTraceUses() > 0 || (!inCombat && chewableTraces() > 0)) {
    return $skill`Create an Afterimage`;
  }
  return $skill.none;
}

// Unlike a copier, this queues a delayed wanderer instead of an immediate fight.
export function getWandererCreator(
  enemy: Monster,
  inCombat: boolean = currentRound() > 0,
): Skill {
  if (!enemy.copyable || copiesAreSpokenFor(enemy)) {
    return $skill.none;
  }
  if (
    instakillable(enemy) &&
    SealClubbingClub.clubIntoNextWeekTimesRemaining() > 0 &&
    (get("clubEmNextWeekMonster") === $monster.none ||
      SealClubbingClub.isOverdueClubIntoNextWeek()) &&
    (!inCombat || auto_canUse($skill`Club 'Em Into Next Week`, true, inCombat))
  ) {
    return $skill`Club 'Em Into Next Week`;
  }
  // The Angel's wanderer arrives on its own schedule wherever we happen to be, so it cannot
  // be steered into the one zone a copy of this monster would count in.
  if (auto_copyRequiredZone(enemy) !== $location.none) {
    return $skill.none;
  }
  // Wink at / Fire a badly romantic arrow are the same Obtuse Angel skill at
  // different familiar weights, sharing one daily use and one queued monster.
  if (get("romanticTarget") === $monster.none) {
    if (auto_canUse($skill`Fire a badly romantic arrow`, true, inCombat)) {
      return $skill`Fire a badly romantic arrow`;
    }
    if (auto_canUse($skill`Wink at`, true, inCombat)) {
      return $skill`Wink at`;
    }
  }
  return $skill.none;
}

// Traces cannot be chewed mid-fight, so every charge the chain will spend has to be banked before we
// walk in, rather than one at a time as each copy comes up.
function bankTracesForChain(target: Monster): void {
  if (copiesAreSpokenFor(target)) {
    return;
  }

  const wanted: number =
    (auto_copiesStillNeeded(target) ?? 1) - copiesWithoutTraces(target);

  while (spareTraceUses() < wanted && chewableTraces() > 0) {
    if (!autoChew(1, $item`phosphor traces`)) {
      break;
    }
  }
}

export function adjustForCopyIfPossible(target: Monster): boolean {
  const copier: Skill = getCopier(target, false);
  if (copier === $skill.none) {
    return false;
  }

  bankTracesForChain(target);

  if (copier === $skill`Blow the Purple Candle!`) {
    return autoEquip($item`Roman Candelabra`);
  }
  return true;
}

export function adjustForWandererCreatorIfPossible(target: Monster): boolean {
  const wanderer: Skill = getWandererCreator(target, false);
  if (wanderer === $skill`Club 'Em Into Next Week`) {
    addBonusToMaximize($item`legendary seal-clubbing club`, 800);
    return true;
  }
  if (
    wanderer === $skill`Fire a badly romantic arrow` ||
    wanderer === $skill`Wink at`
  ) {
    handleFamiliar$1($familiar`Obtuse Angel`);
  }
  return false;
}

// Which duplicator to spend on this monster, if any. A wanderer beats chaining the fight here,
// because we redeem it in a zone that owes us delay.
export function getCopySource(enemy: Monster, loc: Location): Skill {
  function firstUsable(...sources: Skill[]): Skill {
    return sources.find((source) => auto_canUse(source)) ?? $skill.none;
  }

  const wanderer: Skill = auto_wantToCreateWanderer(loc, enemy)
    ? getWandererCreator(enemy)
    : $skill.none;
  const copier: Skill = auto_wantToCopy(enemy, loc)
    ? getCopier(enemy)
    : $skill.none;

  // a copy pinned to its own zone is redeemed there, so it burns no delay and the wanderer slot
  // is better spent on a monster we can drag somewhere useful
  if (auto_copyRequiredZone(enemy) !== $location.none) {
    return firstUsable(copier, wanderer);
  }

  // chaining only pays where we wanted to spend the turns anyway, so elsewhere it is a fallback
  // for when we cannot bank a wanderer at all
  const canDelay = zone_delay(loc).shouldDelay;

  // Prioritize a copier first if possible
  if (canDelay && auto_canUse(copier)) {
    return copier;
  }

  const chainAllowed = canDelay || auto_wandererFightsLeft(enemy) === 0;

  return firstUsable(wanderer, chainAllowed ? copier : $skill.none);
}

export function auto_wantToCopy(enemy: Monster, loc?: Location): boolean {
  if (!enemy.copyable || SwordOfSwords.swordIsTracking(enemy)) {
    return false;
  }

  return (
    auto_getMonsters("copy", loc).includes(enemy) &&
    auto_shouldCopySomeMore(enemy)
  );
}

export function auto_wantToCreateWanderer(
  loc: Location,
  enemy: Monster,
): boolean {
  if (!instakillable(enemy) || SwordOfSwords.swordIsTracking(enemy)) {
    return false;
  }

  // Any wanderer will do, we replace it with a Pygmy Bowler when we redeem it
  return (
    L11_HiddenCity.L11_wantsPygmyBowlerWandererHunt() ||
    auto_wantToCopy(enemy, loc)
  );
}

export function auto_copierFightsLeft(mon: Monster): number {
  let fights: number = 0;

  if (get("_chainedPurpleCandleMonster") === mon) {
    fights++;
  }

  if (AutoLeprecondo.chainedAfterimageMonster() === mon) {
    fights++;
  }

  return fights;
}

function spareTraceUses(): number {
  return AutoLeprecondo.tracesUsesLeft() - AutoLeprecondo.getReservedTraces();
}

function chewableTraces(): number {
  if (
    isActuallyEd() ||
    in_small() ||
    !auto_canChew($item`phosphor traces`) ||
    !auto_is_valid$2($skill`Create an Afterimage`)
  ) {
    return 0;
  }

  return Math.min(
    itemAmount($item`phosphor traces`),
    Math.floor(spleen_left() / $item`phosphor traces`.spleen),
  );
}

function copiesWithoutTraces(enemy: Monster): number {
  let copies: number = 0;

  if (Roman.haveRoman() && haveEffect($effect`Everything Looks Purple`) === 0) {
    copies++;
  }

  const clubEmMonster: Monster =
    LegendarySealClubbingClub.turnsUntilNextWeekFight() >= 0
      ? get("clubEmNextWeekMonster")
      : $monster.none;
  if (
    instakillable(enemy) &&
    (clubEmMonster === $monster.none || clubEmMonster === enemy)
  ) {
    const clubs = SealClubbingClub.clubIntoNextWeekTimesRemaining();

    copies += clubs;
  }

  if (Bofa.habitatTarget(enemy)) {
    copies += 5;
  }

  return copies;
}

// Extra fights of this monster we could still create, on top of anything already banked. Every copy
// we redeem can be re-copied, so each charge is worth one more fight.
export function auto_copiesObtainable(enemy: Monster): number {
  if (!enemy.copyable) {
    return 0;
  }

  return (
    copiesWithoutTraces(enemy) +
    Math.max(0, spareTraceUses() + chewableTraces())
  );
}

export function auto_wandererFightsLeft(mon: Monster): number {
  let fights = 0;

  if (Bofa.habitatMonster() === mon) {
    fights += Bofa.habitatFightsLeft();
  }
  if (
    LegendarySealClubbingClub.clubIntoNextWeekMonster() === mon &&
    LegendarySealClubbingClub.turnsUntilNextWeekFight() >= 0
  ) {
    fights++;
  }

  if (BadlyRomanticArrow.copiedMonster() === mon) fights++;

  return fights;
}

// The overdue fight will happen regardless, so this should be prioritized
// before it overwrites something else we wanted to burn delay with.
export function burnDelayWithClubEmIntoNextWeek(): boolean {
  if (!SealClubbingClub.isOverdueClubIntoNextWeek()) {
    return false;
  }

  const clubEmMonster: Monster = get("clubEmNextWeekMonster");
  const requiredZone: Location = auto_copyRequiredZone(clubEmMonster);
  let clubEmZone: Location;

  if (
    L11_HiddenCity.L11_wantsPygmyBowlerWandererHunt() &&
    replaceMonsterCombatString(clubEmMonster) !== undefined &&
    handleFamiliar$1($familiar`Sword of S Words`)
  ) {
    clubEmZone = $location`The Hidden Bowling Alley`;
  } else if (requiredZone !== $location.none && canAdventure(requiredZone)) {
    // the copy only counts here, so this fight is worth more than the delay we give up
    clubEmZone = requiredZone;
  } else {
    clubEmZone = solveDelayZone(
      isFreeMonster(clubEmMonster) && get("breathitinCharges") > 0
        ? ["outdoor"]
        : [],
    );
  }
  if (clubEmZone === $location.none) {
    // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
    // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
    clubEmZone = $location`Noob Cave`;
  }
  auto_log_info(
    `Fighting a ${clubEmMonster} in ${clubEmZone.toString()} to burn delay!`,
    "green",
  );
  set("auto_nextEncounter", clubEmMonster.toString());
  if (autoAdv(clubEmZone)) {
    return true;
  }
  set("auto_nextEncounter", "");
  return false;
}

export function auto_zoneCopyableMonsters(loc: Location): [Monster, number][] {
  return Object.entries(appearanceRates(loc))
    .map(([_k, _v]) => [Monster.get(_k), _v] as [Monster, number])
    .filter(([mon, rate]) => rate > 0 && mon.id > 0 && mon.copyable);
}
