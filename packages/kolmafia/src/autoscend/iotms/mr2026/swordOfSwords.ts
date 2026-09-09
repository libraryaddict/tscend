import {
  canAdventure,
  canEat,
  closetAmount,
  currentRound,
  equippedItem,
  haveEffect,
  haveEquipped,
  Item,
  itemAmount,
  lastMonster,
  Location,
  Monster,
  myDaycount,
  myFamiliar,
  myLevel,
  myLocation,
  numericModifier,
  turnsUntilForcedNoncombat,
  weightAdjustment,
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
  $slot,
  get,
  getKramcoWandererChance,
  have,
  isVoteWandererNow,
  isWandererNow,
  set,
  Wanderer,
} from "libram";

import {
  AutoLeprecondo,
  BaseballDiamond,
  BCZ,
  Kramco,
  Monodent,
  PastaWand,
  Peridot,
  SwordOfSwords,
  TrainSet,
} from "../../../types";
import { fullness_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { isSoftBlockInPlace } from "../../auto_routing";
import { zone_delay } from "../../auto_zone";
import { auto_zoneCopyableMonsters } from "../../combat/wanderers/copier";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../../helpers/auto_familiar";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
} from "../../quests/level_09";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";
import {
  auto_can_equip,
  auto_holdingWantedSniff,
  auto_is_valid,
  auto_locationMonsters,
  auto_queueIgnore,
  auto_roughExpectedTurnsLeftToday,
  auto_wantToFreeKillWithNoDrops,
  auto_wouldSplitSniffFocus,
  canSummonMonster,
  internalQuestStatus,
  isFreeMonster,
  isMeatPoor,
  prepareInstaKillNextCombat,
  summonMonster,
} from "../../utils/auto_util";

const surgeonGear = $items`bloodied surgical dungarees, half-size scalpel, surgical apron, head mirror, surgical mask`;

export function haveSwordFamiliar(): boolean {
  return (
    !in_quantumTerrarium() &&
    pathHasFamiliar() &&
    auto_have_familiar($familiar`Sword of S Words`)
  );
}

export function wantToBladdermax(): boolean {
  return (
    get("auto_attemptToBladdermax") &&
    internalQuestStatus("questL10Garbage") <= 6 &&
    Monodent.haveMonodent() &&
    (itemAmount($item`ink bladder`) > 0 ||
      (canChangeToFamiliar($familiar`Sword of S Words`) &&
        (swordOfSwordSwitchesLeft() > 0 ||
          SwordOfSwords.swordOfSwordsTracking() === $monster`giant squid`)))
  );
}

export function swordOfSwordsKillsLeft(): number {
  return Math.max(0, 100 - get("_swordOfSWordsKills"));
}

export function swordOfSwordSwitchesLeft(): number {
  return 3 - get("_swordOfSWordsMonsterChanged");
}

export function swordOfSwordsTracking(): Monster {
  return get("swordOfSWordsMonster");
}

// The sword already overwrites this monster's drops with its tracked item, so
// copying it or banking a wanderer of it for its own drop is wasted effort.
export function swordIsTracking(mon: Monster): boolean {
  return swordOfSwordsTracking() === mon;
}

export function swordFamiliarWantsMonsterDrops(sMonster: Monster): boolean {
  // Does not determine if we want to be using the familiar right now.
  if (sMonster === $monster.none || !sMonster.copyable) {
    return false;
  }

  const currentlyTracking = swordIsTracking(sMonster);

  // Free kills
  if (
    sMonster === $monster`shadow slab` &&
    auto_is_valid($item`shadow brick`)
  ) {
    // We use 13 a day, subtract the bricks we have on hand and return the total amount of bricks
    const bricksNeeded =
      13 * Math.max(1, get("auto_runDayCount", 0) - (myDaycount() - 1)) -
      (get("_shadowBricksUsed") + itemAmount($item`shadow brick`));

    if (bricksNeeded > 0) {
      return true;
    }
  }

  const lumberMonsters = $monsters`smut orc pipelayer, smut orc jacker`;
  const fastenerMonsters = $monsters`smut orc screwer, smut orc nailer`;

  if (lumberMonsters.includes(sMonster)) {
    // If the 100% drop is still dropping
    if (lumberCount() < bridgeGoal()) {
      return true;
    }
    // Otherwise, if we still need the other one
    if (fastenerCount() < bridgeGoal()) {
      // If we can't switch regardless
      if (swordOfSwordSwitchesLeft() === 0) {
        return true;
        // Otherwise if we're 4 pieces within the goal
      } else if (
        fastenerCount() + 4 >= bridgeGoal() ||
        // If we have only one switch left, but we do expect a fair number of advs more
        (swordOfSwordSwitchesLeft() === 1 &&
          auto_roughExpectedTurnsLeftToday() > 40)
      ) {
        return true;
      }
    }
  } else if (fastenerMonsters.includes(sMonster)) {
    // If the 100% drop is still dropping
    if (fastenerCount() < bridgeGoal()) {
      return true;
    }
    // Otherwise, if we still need the other one
    if (lumberCount() < bridgeGoal()) {
      // If we can't switch regardless
      if (swordOfSwordSwitchesLeft() === 0) {
        return true;
        // Otherwise if we're 4 pieces within the goal
      } else if (
        lumberCount() + 4 >= bridgeGoal() ||
        // If we have only one switch left, but we do expect a fair number of advs more
        (swordOfSwordSwitchesLeft() === 1 &&
          auto_roughExpectedTurnsLeftToday() > 40)
      ) {
        return true;
      }
    }
  }

  // If we're on the last day, then keep farming the smut orc monster even if it'd be optimal to switch. We're unlikely to make too much progress by switching
  if (
    get("auto_runDayCount") === myDaycount() &&
    currentlyTracking &&
    (lumberMonsters.includes(sMonster) ||
      fastenerMonsters.includes(sMonster)) &&
    Math.min(lumberCount(), fastenerCount()) < bridgeGoal()
  ) {
    return true;
  }

  // Crypt
  if (
    $monsters`skeleton astronaut, spiny skelelton, toothy sklelton`.includes(
      sMonster,
    ) &&
    ((currentRound() > 0 && sMonster === lastMonster()) ||
      bluevsred_willEncounterFight(sMonster) ||
      currentlyTracking) &&
    auto_is_valid($item`evil eye`) &&
    get("cyrptNookEvilness") - itemAmount($item`evil eye`) * 3 >
      13 + (!currentlyTracking ? 3 : 0) &&
    !in_koe()
  ) {
    return true;
  }

  // High Peak
  if (
    $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`rusty hedge trimmers`) &&
    hedgeTrimmersNeeded() > 0
  ) {
    return true;
  }

  // Lobster man
  if (
    sMonster === $monster`lobsterfrogman` &&
    auto_gunpowderBarrelsWanted() > (currentlyTracking ? 0 : 3) &&
    (!PastaWand.havePastaWand() ||
      !canEat() ||
      fullness_left() < 1 ||
      !auto_is_valid($item`Tubetto Gelatto`) ||
      swordIsTracking($monster`lobsterfrogman`))
  ) {
    return true;
  }

  // Hidden hospital surgeon gear
  if (
    sMonster === $monster`pygmy witch surgeon` &&
    internalQuestStatus("questL11Doctor") === 0 &&
    surgeonGear.some((gear) => !possessEquipment(gear) && auto_can_equip(gear))
  ) {
    return true;
  }

  // Bowling ball
  if (
    sMonster === $monster`pygmy bowler` &&
    // Opening it will get us to progress of 1, then we subtract 5 from that
    6 -
      Math.max(get("hiddenBowlingAlleyProgress"), 0) -
      (itemAmount($item`bowling ball`) + closetAmount($item`bowling ball`)) >
      0
  ) {
    return true;
  }

  // Ink bladders, a useful underwater free run with the monodent
  if (
    Monodent.haveMonodent() &&
    sMonster === $monster`giant squid` &&
    internalQuestStatus("questL10Garbage") < 7 &&
    bluevsred_willEncounterFight($monster`giant squid`)
  ) {
    const bladders = itemAmount($item`ink bladder`);
    // We switched away, let's call it good enough
    if (swordOfSwordSwitchesLeft() < 3 && bladders > 5 && !currentlyTracking) {
      return false;
    }
    // We're assuming 30 turns to get there
    let turnsLeftInZone =
      30 - $location`The Penultimate Fantasy Airship`.turnsSpent;
    if (have($item`bat wings`)) turnsLeftInZone -= 5;

    let fightsLeft = turnsLeftInZone;

    // Subtract the remaining NCs
    fightsLeft -= 8 - Math.max(2, internalQuestStatus("questL10Garbage"));

    // Return if we still want more bladders
    if (bladders < fightsLeft) {
      return true;
    }
  }

  return false;
}

export function swordFamiliarIsActivelyFarming(): boolean {
  // Returns if the sword familiar is currently set to a monster that we want the drops of
  return swordFamiliarWantsMonsterDrops(swordOfSwordsTracking());
}

export function wantToStartTrackingSwordMonster(enemy: Monster): boolean {
  // Targets the current enemy for future fights - doesn't affect this fight's own drops.
  if (myFamiliar() !== $familiar`Sword of S Words`) {
    return false;
  }
  if (swordOfSwordsKillsLeft() <= 0 || swordOfSwordSwitchesLeft() <= 0) {
    return false;
  }
  if (swordIsTracking(enemy)) {
    return false; // already tracking it
  }
  return swordFamiliarWantsMonsterDrops(enemy);
}

export function preferSwordFamiliar(place: Location) {
  if (!haveSwordFamiliar()) return;
  set("_auto_preferSwordFam", canUseSwordFamiliarHere(place));
}

// Uncopyable monsters we'd rather turn into some fish, where their own drops are worth less than the sword's
function auto_swordFishTarget(loc: Location, mon: Monster): boolean {
  // The lair has nothing copyable, and its delay has to be burnt regardless
  if (
    loc === $location`The Boss Bat's Lair` &&
    mon === $monster`beefy bodyguard bat` &&
    // If we don't need the meat
    !isMeatPoor()
  ) {
    return true;
  }

  return false;
}

// The sword only overwrites the drops of a copyable monster, but the monodent can make some fish of one it can't
function auto_swordCanOverwriteDrops(loc: Location, mon: Monster): boolean {
  if (mon.copyable) {
    return true;
  }
  return Monodent.haveMonodent() && auto_swordFishTarget(loc, mon);
}

// If the sword is carrying drops we want and this is a monster we'd make some fish of to hold them
export function swordWantsToFish(loc: Location, mon: Monster): boolean {
  return (
    auto_swordFishTarget(loc, mon) &&
    ((isFreeMonster($monster`some fish`) && !isFreeMonster(mon)) ||
      (swordOfSwordsKillsLeft() > 0 && swordFamiliarIsActivelyFarming()))
  );
}

export function swordNeedsMonodentHere(place: Location): boolean {
  return auto_locationMonsters(place).some(
    ([mon, rate]) => rate > 0 && swordWantsToFish(place, mon),
  );
}

function canUseSwordFamiliarHere(
  place: Location,
  ignoreDailyBudget: boolean = false,
): boolean {
  const reason = swordFamiliarBlockReason(place, ignoreDailyBudget);
  if (reason !== undefined) {
    return false;
  }
  return true;
}

// These locs are not good sword targets
const noGoodSwordTargetsHere = $locations`The Penultimate Fantasy Airship, A-Boo Peak, Cobb's Knob Harem, Twin Peak, The Black Forest, Whitey's Grove, Guano Junction`;

function shouldBypassDelayAllowGaze(
  loc: Location,
  planToPeridot: boolean = false,
): boolean {
  return (
    noGoodSwordTargetsHere.includes(loc) &&
    BCZ.bczRefractedGaze(planToPeridot, loc)
  );
}

export function swordFamiliarBlockReason(
  place: Location,
  ignoreDailyBudget: boolean,
): string | undefined {
  if (!haveSwordFamiliar()) {
    return "we don't have the sword familiar";
  }
  if (!ignoreDailyBudget && swordOfSwordsKillsLeft() <= 0) {
    return "no kills left today";
  }
  if (
    auto_locationMonsters(place).every(
      ([mon, rate]) => rate <= 0 || !auto_swordCanOverwriteDrops(place, mon),
    )
  ) {
    return "no monster here whose drops we can overwrite";
  }
  if (
    shouldBypassDelayAllowGaze(
      place,
      haveEquipped($item`Peridot of Peril`) && !Peridot.haveUsedPeridot(place),
    )
  ) {
    return "we plan to refracted gaze here";
  }
  if (auto_queueIgnore()) {
    return "queue is being ignored";
  }
  if (
    get("auto_nextEncounter") !== $monster`none` &&
    !auto_wantToFreeKillWithNoDrops(place, get("auto_nextEncounter"))
  ) {
    return `forced encounter ${get("auto_nextEncounter")} is next`;
  }
  // Traces/afterimage bandit chains force the same rematch either way, and fantasy bandit's own drop is conditional (never overwritten), so it's free
  if (AutoLeprecondo.canTracesBandit() && swordFamiliarIsActivelyFarming()) {
    return undefined;
  }
  if (
    swordOfSwordsTracking() !== $monster.none &&
    ([Wanderer.Digitize, Wanderer.Enamorang, Wanderer.Romantic].some((w) =>
      isWandererNow(w),
    ) ||
      (Kramco.haveKramcoSausageOMatic() && getKramcoWandererChance() >= 0.9) ||
      (auto_have_familiar($familiar`Mini-Hipster`) &&
        canChangeToFamiliar($familiar`Mini-Hipster`) &&
        isWandererNow(Wanderer.Familiar)) ||
      (isVoteWandererNow() && possessEquipment($item`"I Voted!" sticker`)))
  ) {
    return "a wanderer is due next turn";
  }

  if (place === $location`The Black Forest`) {
    // If we need to run the black familiar until we have the black fam item
    if (
      turnsUntilForcedNoncombat(place) > 0 &&
      !$items`reassembled blackbird, reconstituted crow`.some((i) => have(i))
    ) {
      return "we need the black familiar";
    }

    // Don't use the sword fam if we need blackberry galoshes
    if (
      auto_is_valid($item`blackberry galoshes`) &&
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) < 3
    ) {
      return "we need to fight blackberry bush";
    }

    // The +combat that our fam gives us, so changing fam doesn't modify a passing score
    const familiarCombatRate = numericModifier(
      myFamiliar(),
      $modifier`Combat Rate`.name,
      weightAdjustment(),
      equippedItem($slot`familiar`),
    );
    const combatRateWithoutFam =
      numericModifier($modifier`Combat Rate`) - familiarCombatRate;

    // Don't run the sword fam if we (may) need another fam for +combat
    if (turnsUntilForcedNoncombat(place) > 0 && combatRateWithoutFam < 5) {
      return "can't run enough +combat in black forest";
    }
  } else if (!zone_delay(place).shouldDelay) {
    if (
      !$locations`The Haunted Kitchen, The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
        place,
      ) &&
      (place !== $location`The Boss Bat's Lair` || place.turnsSpent >= 6)
    ) {
      return "zone has no delay to burn";
    }
  }
  if (swordFamiliarIsActivelyFarming()) {
    return undefined;
  }
  if (!ignoreDailyBudget && swordOfSwordSwitchesLeft() <= 0) {
    return "no target switches left today";
  }
  if (
    !auto_locationMonsters(place).some(
      ([mon, chance]) => chance > 0 && swordFamiliarWantsMonsterDrops(mon),
    )
  ) {
    return "no monster here worth switching our tracked target to";
  }
  return undefined;
}

function auto_swordFamiliarWantsThisMonsterInFuture(
  locs: Location[],
  monsters: Monster[],
): boolean {
  if (!haveSwordFamiliar()) {
    return false;
  }

  // Soft-delay a level's quest-turn-in while we're still farming value.
  if (monsters.includes(swordOfSwordsTracking())) {
    return (
      swordFamiliarIsActivelyFarming() &&
      isSoftBlockInPlace(
        "swordTrackingCurrentTarget",
        `${swordOfSwordsTracking()} is still wanted`,
      )
    );
  }

  // A sword free to retarget can claim this on the turns we already spend here, so we only
  // hold the zone open when it can't: mid-farm, or out of switches/kills for the day
  if (swordIsWillingToSwitchTargets()) {
    return false;
  }

  const gazeZones = locs.filter((loc) => shouldBypassDelayAllowGaze(loc));
  const futureMonsters = (
    gazeZones.length === 0
      ? monsters
      : locs
          .filter((loc) => !gazeZones.includes(loc))
          .flatMap(auto_zoneCopyableMonsters)
          .map(([mon]) => mon)
  ).filter((mon) => swordFamiliarWantsMonsterDrops(mon));

  return (
    futureMonsters.length > 0 &&
    isSoftBlockInPlace(
      "swordTrackingFutureTarget",
      `${futureMonsters.join(", ")} is wanted in the future`,
    )
  );
}

function auto_swordUnavailableShouldDelayZone(locs: Location[]): boolean {
  if (swordFamiliarIsActivelyFarming() || swordIsWillingToSwitchTargets()) {
    return false;
  }
  return (
    locs.some((loc) => canUseSwordFamiliarHere(loc, true)) &&
    isSoftBlockInPlace(
      "swordBurningZone",
      `${locs.filter((l) => canUseSwordFamiliarHere(l)).join(", ")} is a place to use sword, but sword isn't available`,
    )
  );
}

// Soft-delay leaving these zones (a level's quest-turn-in, typically) while the Sword of S Words or Baseball Diamond is still mid-farm on a monster that only appears here.
// TODO This is currently hardcoded, need to switch it to checking against a task's location
export function copierShouldDelayZone(locs: Location[]): boolean {
  if (isAboutToPowerlevel()) return false;
  // A sniff only pays out on turns spent where it landed, so delaying that zone strands the
  // sniff and leaves every zone that wants its own sniff blocked behind it forever.
  if (auto_holdingWantedSniff(locs)) return false;
  if (
    haveEffect($effect`Ultrahydrated`) &&
    $locations`The Oasis, The Arid\, Extra-Dry Desert`.some((l) =>
      locs.includes(l),
    )
  ) {
    return false;
  }

  const zoneMonsters = locs.flatMap(auto_zoneCopyableMonsters);

  if (
    auto_swordUnavailableShouldDelayZone(locs) ||
    auto_swordFamiliarWantsThisMonsterInFuture(
      locs,
      zoneMonsters.map(([mon]) => mon),
    )
  ) {
    return true;
  }

  return (
    BaseballDiamond.baseballShouldDelayZone(zoneMonsters) ||
    auto_wouldSplitSniffFocus(locs)
  );
}

type SummonSwordTarget = {
  monsters: Monster[];
  item: Item;
  predicate?: () => boolean;
};

// Monsters worth spending a spare summon on to bootstrap the sword's first target
const SWORD_SUMMONABLE_TARGETS: SummonSwordTarget[] = [
  {
    monsters: $monsters`shadow slab`,
    item: $item`shadow brick`,
    // No predicate, we can't ensure we can visit
    // TODO In the future, some 'can we defeat this'
    predicate: () => myLevel() >= 5,
  },
  {
    monsters: $monsters`giant squid`,
    item: $item`ink bladder`,
    predicate: () =>
      wantToBladdermax() &&
      itemAmount($item`ink bladder`) === 0 &&
      internalQuestStatus("questL10Garbage") <= 3,
  },
  {
    monsters: $monsters`smut orc pipelayer`,
    item: $item`morningwood plank`,
    // Trainset already covers it, otherwise if we wouldn't be able to adventure there anyways
    predicate: () =>
      !TrainSet.haveTrainSet() &&
      myLevel() < 9 &&
      lumberCount() + 3 < bridgeGoal(),
  },
  {
    monsters: $monsters`smut orc screwer`,
    item: $item`morningwood plank`,
    // Trainset already covers it, otherwise if we wouldn't be able to adventure there anyways
    predicate: () =>
      !TrainSet.haveTrainSet() &&
      myLevel() < 9 &&
      fastenerCount() + 3 < bridgeGoal(),
  },

  {
    monsters: $monsters`toothy sklelton, spiny skelelton`,
    item: $item`evil eye`,
    // If we wouldn't be able to adventure there, and we haven't already decreased the evil somehow
    predicate: () => myLevel() < 7 && get("cyrptNookEvilness") === 50,
  },
];

function auto_summonIsGoodSwordTarget(target: SummonSwordTarget): boolean {
  if (!auto_is_valid(target.item)) return false;

  if (target.predicate !== undefined && !target.predicate()) return false;

  const desiredHits = target.monsters.filter(
    (monster) =>
      bluevsred_willEncounterFight(monster) &&
      swordFamiliarWantsMonsterDrops(monster) &&
      canSummonMonster(monster),
  );

  if (desiredHits.length === 0) return false;

  for (const loc of Location.all()) {
    if (!canAdventure(loc)) continue;

    const monsters = auto_locationMonsters(loc);

    const totalChance = monsters
      .filter(([m, chance]) => desiredHits.includes(m) && chance > 0)
      .map(([, chance]) => chance)
      .reduce((l, r) => l + r, 0);

    // If the total chance ends up being undesirable
    if (totalChance <= 65) continue;

    return false;
  }

  return true;
}

export function swordIsWillingToSwitchTargets(): boolean {
  if (
    !haveSwordFamiliar() ||
    swordFamiliarIsActivelyFarming() ||
    swordOfSwordSwitchesLeft() <= 0 ||
    swordOfSwordsKillsLeft() <= 0
  ) {
    return false;
  }

  return true;
}

export function summonSwordTarget(): boolean {
  if (in_quantumTerrarium() || !swordIsWillingToSwitchTargets()) {
    return false;
  }

  // If we haven't visited the council yet
  if (get("lastCouncilVisit") < Math.min(myLevel(), 13, 3)) {
    return false;
  }

  const target = SWORD_SUMMONABLE_TARGETS.find((target) =>
    auto_summonIsGoodSwordTarget(target),
  );
  if (!target) {
    return false;
  }

  // Some summon methods (e.g. the chest mimic's mimic egg) fight immediately via an
  // item use, bypassing the normal pre_adv familiar switch, so force it right now too.
  if (!handleFamiliar$1($familiar`Sword of S Words`)) {
    return false;
  }

  const targetMonster: Monster = target.monsters.find(
    (m) => bluevsred_willEncounterFight(m) && swordFamiliarWantsMonsterDrops(m),
  )!;

  // Summons fight at a placeholder location, so pre_adv only knows what we're
  // about to fight if we set it here
  set("auto_nextEncounter", targetMonster);
  prepareInstaKillNextCombat(targetMonster, myLocation());

  if (summonMonster(targetMonster)) {
    return true;
  }
  set("auto_nextEncounter", "");
  return false;
}
