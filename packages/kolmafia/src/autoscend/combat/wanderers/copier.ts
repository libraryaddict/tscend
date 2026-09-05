import {
  appearanceRates,
  canAdventure,
  currentRound,
  haveEffect,
  haveEquipped,
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
import { auto_log_info } from "../../utils/auto_log";
import {
  auto_copyRequiredZone,
  auto_getMonsters,
  auto_is_valid,
  auto_is_valid$2,
  auto_shouldCopySomeMore,
  auto_turbo,
  instakillable,
  isFreeMonster,
} from "../../utils/auto_util";
import { auto_canUse, replaceMonsterCombatString } from "../auto_combat_util";

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
    (Roman.haveRoman() && haveEffect($effect`Everything Looks Purple`) === 0) ||
    (haveEquipped($item`Roman Candelabra`) &&
      auto_canUse($skill`Blow the Purple Candle!`, true, inCombat) &&
      haveEffect($effect`Everything Looks Purple`) === 0)
  ) {
    return $skill`Blow the Purple Candle!`;
  }
  if (get("phosphorTracesUses") > AutoLeprecondo.getReservedTraces()) {
    return $skill`Create an Afterimage`;
  } else if (
    !isActuallyEd() &&
    !in_small() &&
    // Only chew traces if we're in turbo mode
    auto_turbo() &&
    !inCombat &&
    itemAmount($item`phosphor traces`) > 0 &&
    spleen_left() >= $item`phosphor traces`.spleen &&
    auto_canChew($item`phosphor traces`) &&
    auto_is_valid($item`phosphor traces`) &&
    auto_is_valid$2($skill`Create an Afterimage`)
  ) {
    return $skill`Create an Afterimage`;
  }
  return $skill.none;
}

// Unlike a copier, this queues a delayed wanderer instead of an immediate fight.
export function getWandererCreator(
  enemy: Monster,
  inCombat: boolean = currentRound() > 0,
): Skill {
  if (!enemy.copyable) {
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

export function adjustForCopyIfPossible(target: Monster): boolean {
  const copier: Skill = getCopier(target, false);
  if (copier === $skill`Blow the Purple Candle!`) {
    return autoEquip($item`Roman Candelabra`);
  }
  if (
    copier === $skill`Create an Afterimage` &&
    get("phosphorTracesUses") === 0
  ) {
    return autoChew(1, $item`phosphor traces`);
  }
  return false;
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
  const chainAllowed =
    zone_delay(loc).shouldDelay || auto_wandererFightsLeft(enemy) === 0;

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
      isFreeMonster(clubEmMonster) && get("breathitinCharges") > 0,
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
