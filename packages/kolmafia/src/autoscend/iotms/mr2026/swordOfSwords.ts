import {
  canAdventure,
  canEat,
  closetAmount,
  currentRound,
  haveEquipped,
  Item,
  itemAmount,
  itemDropsArray,
  lastMonster,
  Location,
  Monster,
  myDaycount,
  myFamiliar,
  myLevel,
  useFamiliar,
} from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $monsters,
  get,
  getKramcoWandererChance,
  isVoteWandererNow,
  isWandererNow,
  set,
  Wanderer,
} from "libram";

import {
  AutoLeprecondo,
  BaseballDiamond,
  BatWings,
  BCZ,
  Kramco,
  Monodent,
  PastaWand,
  Peridot,
  SpringShoes,
  TrainSet,
} from "../../../types";
import { fullness_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { isSoftBlockInPlace } from "../../auto_routing";
import {
  auto_is_valid,
  auto_locationMonsters,
  auto_queueIgnore,
  auto_wantToFreeKillWithNoDrops,
  auto_zoneCopyableMonsters,
  canSummonMonster,
  internalQuestStatus,
  isMeatPoor,
  safeGet,
  summonMonster,
} from "../../auto_util";
import { zone_delay } from "../../auto_zone";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
} from "../../quests/level_09";
import { L11_needTombRatchet } from "../../quests/level_11";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";

export function haveSwordFamiliar(): boolean {
  return (
    !in_quantumTerrarium() &&
    pathHasFamiliar() &&
    auto_have_familiar($familiar`Sword of S Words`)
  );
}

export function swordOfSwordsKillsLeft(): number {
  return Math.max(0, 100 - get("_swordOfSWordsKills"));
}

export function swordOfSwordSwitchesLeft(): number {
  return 3 - get("_swordOfSWordsMonsterChanged");
}

export function swordOfSwordsTracking(): Monster {
  return safeGet("swordOfSWordsMonster");
}

export function swordFamiliarWantsMonsterDrops(
  sMonster: Monster,
  chanceToEncounterMonster: number = 0, // The chance we have of encountering the monster, between 0 to 100, 100 is eg, summons or perildot
): boolean {
  // Does not determine if we want to be using the familiar right now.
  if (sMonster === $monster.none || sMonster.boss || !sMonster.copyable) {
    return false;
  }

  const currentlyTracking = swordOfSwordsTracking() === sMonster;
  // Amount of days left in this run, always at least 1
  const daysLeftInRun = Math.max(
    get("auto_runDayCount", 0) + (myDaycount() - 1),
    1,
  );

  // Free kills
  if (
    sMonster === $monster`shadow slab` &&
    auto_is_valid($item`shadow brick`)
  ) {
    // We use 13 a day, subtract the bricks we have on hand and return the total amount of bricks
    const bricksNeeded =
      13 * daysLeftInRun -
      (get("_shadowBricksUsed") + itemAmount($item`shadow brick`));

    if (bricksNeeded > 0) {
      return true;
    }
  }

  // Smut orcs, we still prioritize the other monster if we have no switches left
  if (
    $monsters`smut orc pipelayer, smut orc jacker`.includes(sMonster) &&
    (lumberCount() < bridgeGoal() ||
      (fastenerCount() < bridgeGoal() && swordOfSwordSwitchesLeft() === 0))
  ) {
    return true;
  } else if (
    $monsters`smut orc screwer, smut orc nailer`.includes(sMonster) &&
    (fastenerCount() < bridgeGoal() ||
      (lumberCount() < bridgeGoal() && swordOfSwordSwitchesLeft() === 0))
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

  // Some free runs
  if (
    sMonster === $monster`Green Ops Soldier` &&
    (currentlyTracking || chanceToEncounterMonster >= 100) &&
    !SpringShoes.haveSpringShoes()
  ) {
    // A flat 20, because we don't actually sword this monster as of time of writing
    return itemAmount($item`green smoke bomb`) < 20;
  }

  // Pyamid of ed
  if (
    sMonster === $monster`tomb rat` &&
    currentlyTracking &&
    L11_needTombRatchet()
  ) {
    return true;
  }

  // Aboo peak
  if (
    $monsters`Battlie Knight Ghost, Claybender Sorcerer Ghost, Dusken Raider Ghost, Space Tourist Explorer Ghost, Whatsian Commando Ghost`.includes(
      sMonster,
    ) &&
    auto_is_valid($item`A-Boo clue`) &&
    (1 + itemAmount($item`A-Boo clue`)) * 30 < get("booPeakProgress") - 2 // We don't value this if we'd get the same outcome with a normal fight
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
      swordOfSwordsTracking() === $monster`lobsterfrogman`)
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

  // Bat cave
  if (
    (currentlyTracking || !BatWings.haveBatWings()) &&
    auto_is_valid($item`sonar-in-a-biscuit`) &&
    internalQuestStatus("questL04Bat") + itemAmount($item`sonar-in-a-biscuit`) <
      3 &&
    itemDropsArray(sMonster).some(
      (s) => s.drop === $item`sonar-in-a-biscuit` && s.rate > 0,
    )
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
    // We're assuming 25 turns to get there
    let fightsLeft = 25 - $location`The Penultimate Fantasy Airship`.turnsSpent;
    // Subtract the remaining NCs
    fightsLeft -= 7 - internalQuestStatus("questL10Garbage");

    // Return if we still want more bladders
    if (bladders < fightsLeft) {
      return true;
    }
  }

  return false;
}

export function swordFamiliarIsActivelyFarming(): boolean {
  // Returns if the sword familiar is currently set to a monster that we want the drops of
  return swordFamiliarWantsMonsterDrops(swordOfSwordsTracking(), 100);
}

export function wantToStartTrackingSwordMonster(
  enemy: Monster,
  chance: number = 0,
): boolean {
  // Targets the current enemy for future fights - doesn't affect this fight's own drops.
  if (myFamiliar() !== $familiar`Sword of S Words`) {
    return false;
  }
  if (swordOfSwordsKillsLeft() <= 0 || swordOfSwordSwitchesLeft() <= 0) {
    return false;
  }
  if (swordOfSwordsTracking() === enemy) {
    return false; // already tracking it
  }
  return swordFamiliarWantsMonsterDrops(enemy, chance);
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
  if (mon.copyable && !mon.boss) {
    return true;
  }
  return Monodent.haveMonodent() && auto_swordFishTarget(loc, mon);
}

// If the sword is carrying drops we want and this is a monster we'd make some fish of to hold them
export function swordWantsToFish(loc: Location, mon: Monster): boolean {
  return (
    auto_swordFishTarget(loc, mon) &&
    swordOfSwordsKillsLeft() > 0 &&
    swordFamiliarIsActivelyFarming()
  );
}

export function swordNeedsMonodentHere(place: Location): boolean {
  return auto_locationMonsters(place).some(
    ([mon, rate]) => rate > 0 && swordWantsToFish(place, mon),
  );
}

export function canUseSwordFamiliarHere(
  place: Location,
  ignoreDailyBudget: boolean = false,
): boolean {
  if (!haveSwordFamiliar()) {
    return false;
  }
  if (!ignoreDailyBudget && swordOfSwordsKillsLeft() <= 0) {
    return false;
  }
  // If no drops here
  if (
    auto_locationMonsters(place).every(
      ([mon, rate]) => rate <= 0 || !auto_swordCanOverwriteDrops(place, mon),
    )
  ) {
    return false;
  }
  // If we plan to refracted gaze at this location
  if (
    BCZ.bczRefractedGaze(
      // If we're going to peridot
      haveEquipped($item`Peridot of Peril`) && !Peridot.haveUsedPeridot(place),
    )
  ) {
    return false;
  }
  // We don't want to force the sword for wanderers or forced fights
  if (
    auto_queueIgnore() ||
    (safeGet("auto_nextEncounter") !== $monster`none` &&
      !auto_wantToFreeKillWithNoDrops(place, safeGet("auto_nextEncounter")))
  ) {
    return false;
  }
  // Traces/afterimage bandit chains force the same rematch either way, and fantasy bandit's own drop is conditional (never overwritten), so it's free
  if (AutoLeprecondo.canTracesBandit() && swordFamiliarIsActivelyFarming()) {
    return true;
  }
  // Don't bring the sword out if we're about to hit a wanderer
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
    return false;
  }
  if (
    !zone_delay(place).shouldDelay &&
    !$locations`The Haunted Kitchen, The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
      place,
    )
  ) {
    return false;
  }
  if (swordFamiliarIsActivelyFarming()) {
    return true; // already tracking something useful
  }
  if (!ignoreDailyBudget && swordOfSwordSwitchesLeft() <= 0) {
    return false;
  }
  // Is there anything here worth switching our tracked monster to?
  return auto_locationMonsters(place).some(
    ([mon, chance]) =>
      chance > 0 && swordFamiliarWantsMonsterDrops(mon, chance),
  );
}

function auto_swordFamiliarWantsThisMonsterInFuture(
  monsters: Monster[],
): boolean {
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

  // If the sword wants this target in the future, but is currently not willing to switch targets
  return (
    !swordIsWillingToSwitchTargets() &&
    monsters.some((m) => swordFamiliarWantsMonsterDrops(m)) &&
    isSoftBlockInPlace(
      "swordTrackingFutureTarget",
      `${monsters.filter((m) => swordFamiliarWantsMonsterDrops(m)).join(", ")} is wanted in the future`,
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
  const zoneMonsters = locs.flatMap(auto_zoneCopyableMonsters);
  return (
    auto_swordUnavailableShouldDelayZone(locs) ||
    auto_swordFamiliarWantsThisMonsterInFuture(
      zoneMonsters.map(([mon]) => mon),
    ) ||
    BaseballDiamond.baseballShouldDelayZone(zoneMonsters)
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
      Monodent.haveMonodent() &&
      myLevel() >= 11 &&
      get("auto_attemptToBladdermax"),
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
      swordFamiliarWantsMonsterDrops(monster, 100) &&
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

    // If we don't want a poor chance
    if (
      !desiredHits.some((m) => !swordFamiliarWantsMonsterDrops(m, totalChance))
    ) {
      continue;
    }

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

  if (myFamiliar() !== $familiar`Sword of S Words`) {
    // Some summon methods (e.g. the chest mimic's mimic egg) fight immediately via an
    // item use, bypassing the normal pre_adv familiar switch, so force it right now too.
    if (
      !handleFamiliar$1($familiar`Sword of S Words`) ||
      !useFamiliar($familiar`Sword of S Words`)
    ) {
      return false;
    }
  }

  const targetMonster: Monster = target.monsters.find(
    (m) =>
      bluevsred_willEncounterFight(m) && swordFamiliarWantsMonsterDrops(m, 100),
  )!;

  return summonMonster(targetMonster);
}
