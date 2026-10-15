import {
  canAdventure,
  canEat,
  currentRound,
  equippedItem,
  haveEffect,
  haveEquipped,
  itemAmount,
  Location,
  Monster,
  myDaycount,
  myFamiliar,
  myLevel,
  myLocation,
  numericModifier,
  turnsPlayed,
  turnsUntilForcedNoncombat,
  weightAdjustment,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $monsters,
  $slot,
  get,
  have,
  set,
} from "libram";

import {
  AutoLeprecondo,
  BaseballDiamond,
  BCZ,
  DigitalRealm,
  Heartstone,
  L11_HiddenCity,
  L11_Pyramid,
  Monodent,
  PastaWand,
  Peridot,
  RoseGarden,
  TrainSet,
} from "../../../types";
import { fullness_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { isSoftBlockInPlace } from "../../auto_routing";
import { zone_delay } from "../../auto_zone";
import {
  auto_zoneCopyableMonsters,
  nextWanderer,
} from "../../combat/wanderers/copier";
import {
  getEngine,
  getOrCompute,
  isAvailable,
  isComplete,
  runQuestTask,
} from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../../helpers/auto_familiar";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import {
  bluevsred_willEncounterFight,
  in_bluevsred,
} from "../../paths/2026/blue_vs_red";
import { L7_defiledNookTask } from "../../quests/level_07";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  L9_chasmBuildIgnoringMl,
  lumberCount,
  smutOrcColdProgressPerKill,
} from "../../quests/level_09";
import {
  auto_gunpowderBarrelsWanted,
  shouldFarmBattlefieldDrops,
} from "../../quests/level_12";
import { haveEnoughShadowHealingItems } from "../../quests/level_13";
import {
  auto_holdingWantedSniff,
  auto_is_valid,
  auto_isLastDay,
  auto_locationMonsters,
  auto_monsterHasWantedDrop,
  auto_queueIgnore,
  auto_roughExpectedTurnsLeftToday,
  auto_wantedDropMonsters,
  auto_wantToFreeKillWithNoDrops,
  auto_wouldSplitSniffFocus,
  canSummonMonster,
  internalQuestStatus,
  isFreeMonster,
  isMeatPoor,
  prepareInstaKillNextCombat,
  summonMonster,
} from "../../utils/auto_util";

export function haveSwordFamiliar(): boolean {
  return (
    !in_quantumTerrarium() &&
    pathHasFamiliar() &&
    auto_have_familiar($familiar`Sword of S Words`)
  );
}

export function wantToBladdermax(): boolean {
  return (
    get("tscend_attemptToBladdermax") &&
    internalQuestStatus("questL10Garbage") <= 6 &&
    Monodent.haveMonodent() &&
    (itemAmount($item`ink bladder`) > 0 ||
      (canChangeToFamiliar($familiar`Sword of S Words`) &&
        (swordOfSwordSwitchesLeft() > 0 ||
          swordOfSwordsTracking() === $monster`giant squid`)))
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

export function swordIsTracking(mon: Monster): boolean {
  return swordOfSwordsTracking() === mon;
}

export function swordIsWillingToSwitchTargets(): boolean {
  return (
    haveSwordFamiliar() &&
    !swordFamiliarIsActivelyFarming() &&
    swordOfSwordSwitchesLeft() > 0 &&
    swordOfSwordsKillsLeft() > 0
  );
}

interface SwordTarget {
  monsters: Monster[];
  // Only asked about copyable monsters we'll fight or are already tracking
  stillWantsDrops(mon: Monster, tracking: boolean): boolean;
  // Summoning one of these gives the sword its first target
  summon?: {
    // Defaults to the target's monsters
    monsters?: Monster[];
    allowed(mon: Monster): boolean;
  };
  // Going out of our way to fight one of these
  setup?: {
    // Cheap enough for the task's ready check
    worthStarting(): boolean;
    // Fights the target, false if it can't right now
    start(): boolean;
  };
}

const shadowSlabTarget: SwordTarget = {
  monsters: $monsters`shadow slab`,
  stillWantsDrops() {
    if (!auto_is_valid($item`shadow brick`)) {
      return false;
    }
    // We use 13 a day, minus the bricks we've used or have on hand
    const bricksNeeded =
      13 * Math.max(1, get("tscend_runDayCount", 0) - (myDaycount() - 1)) -
      (get("_shadowBricksUsed") + itemAmount($item`shadow brick`));
    return bricksNeeded > 0;
  },
  summon: {
    allowed: () => myLevel() >= 5,
  },
};

// Ink bladders, a useful underwater free run with the monodent
const giantSquidTarget: SwordTarget = {
  monsters: $monsters`giant squid`,
  stillWantsDrops(mon, tracking) {
    if (
      !Monodent.haveMonodent() ||
      !auto_is_valid($item`ink bladder`) ||
      internalQuestStatus("questL10Garbage") >= 7 ||
      !bluevsred_willEncounterFight(mon)
    ) {
      return false;
    }

    const bladders = itemAmount($item`ink bladder`);
    // We switched away, so call it good enough
    if (swordOfSwordSwitchesLeft() < 3 && bladders > 5 && !tracking) {
      return false;
    }

    const turnsSpent = $location`The Penultimate Fantasy Airship`.turnsSpent;
    // We're assuming 30 turns to get there
    const turnsLeftInZone = 30 - turnsSpent - (have($item`bat wings`) ? 5 : 0);
    const ncsLeft = 8 - Math.max(2, internalQuestStatus("questL10Garbage"));
    const fightsLeft = turnsLeftInZone - ncsLeft;

    // If we've been in there and are not tracking, certainly do not need to farm again
    if (turnsSpent > 10 && !tracking) {
      return false;
    }

    return bladders < fightsLeft;
  },
  summon: {
    allowed: () =>
      wantToBladdermax() &&
      itemAmount($item`ink bladder`) === 0 &&
      internalQuestStatus("questL10Garbage") <= 3,
  },
  // Summons the first target that's worth summoning, which isn't always the squid
  setup: {
    worthStarting: () =>
      canSummonMonster($monster`giant squid`) &&
      swordFamiliarWantsMonsterDrops($monster`giant squid`),
    start: () => summonSwordTarget(),
  },
};

const lumberMonsters = $monsters`smut orc pipelayer, smut orc jacker`;
const fastenerMonsters = $monsters`smut orc screwer, smut orc nailer`;

function smutOrcOwnCount(mon: Monster): number {
  return lumberMonsters.includes(mon) ? lumberCount() : fastenerCount();
}

function smutOrcOtherCount(mon: Monster): number {
  return lumberMonsters.includes(mon) ? fastenerCount() : lumberCount();
}

const smutOrcTarget: SwordTarget = {
  monsters: [...lumberMonsters, ...fastenerMonsters],
  stillWantsDrops(mon, tracking) {
    const ownCount = smutOrcOwnCount(mon);
    const otherCount = smutOrcOtherCount(mon);
    const goal = bridgeGoal();

    // At 5 progress per kill, Blech House is only 3 kills away
    if (
      !tracking &&
      smutOrcColdProgressPerKill() >= 5 &&
      Math.min(ownCount, otherCount) + 6 >= goal
    ) {
      return false;
    }

    // If we don't have enough of this monster, keep farming
    if (ownCount < goal) {
      return true;
    }
    // If we do have enough of this monster, and don't need the other monster
    if (otherCount >= goal) {
      return false;
    }

    return (
      // Keep farming if we have no switches left
      swordOfSwordSwitchesLeft() === 0 ||
      // Keep farming if we'd get enough of the other monster, if we have 4 more
      otherCount + 4 >= goal ||
      // Don't switch away if we only have one switch left and still have plenty of turns
      // Or this is the last day and we're tracking
      (swordOfSwordSwitchesLeft() === 1 &&
        auto_roughExpectedTurnsLeftToday() > 40) ||
      // On the last day switching is unlikely to make much more progress
      (tracking && get("tscend_runDayCount") === myDaycount())
    );
  },
  // Trainset already covers it, otherwise we can't adventure there yet
  summon: {
    allowed: (mon) =>
      !TrainSet.haveTrainSet() &&
      myLevel() < 9 &&
      smutOrcOwnCount(mon) + 3 < bridgeGoal(),
  },
  setup: {
    worthStarting: () =>
      Math.min(lumberCount(), fastenerCount()) + 2 < bridgeGoal() &&
      smutOrcTarget.monsters.some((m) => swordFamiliarWantsMonsterDrops(m)),
    start: () => L9_chasmBuildIgnoringMl(),
  },
};

function swordWantsNonChunkSetupMonster(): boolean {
  const chunkMonsters = RoseGarden.getChunkMonsters();
  return swordSetupMonsters().some(
    (m) => !chunkMonsters.includes(m) && swordFamiliarWantsMonsterDrops(m),
  );
}

// Chunks need 3 to make 1 free kill, so past the daily free kills we only want them when nothing better is left
const roseGardenTarget: SwordTarget = {
  get monsters() {
    return RoseGarden.getChunkMonsters();
  },
  stillWantsDrops(_, tracking) {
    if (
      // In BvR we avoid the rose garden unless we're done with sword targets
      (in_bluevsred() && !tracking && swordWantsNonChunkSetupMonster()) ||
      !auto_is_valid($item`partial tombstone`)
    ) {
      return false;
    }

    const availableTombs =
      itemAmount($item`partial tombstone`) +
      Math.floor(itemAmount($item`statuary chunk`) / 3);
    const freeKillsToFarm = RoseGarden.freeKillsRemaining() - availableTombs;

    // If we need 11 kills, or we're farming it atm and can still benefit
    if (freeKillsToFarm >= 11 || (freeKillsToFarm > 0 && tracking)) {
      // This also means if we are not tracking it, a summon-only will only work if we have all 11 kills unavailable
      return true;
    }
    // The above has ruled out if we need some more free kills today, we're now deciding the below:
    // 1. Should we start fighting this?
    // 2. Or, should we keep farming this for tomorrow?
    if (swordOfSwordSwitchesLeft() === 0) {
      // If we can't switch anyways
      return tracking;
    }
    // If we want another target, then we should switch. We already done today's stuff
    if (swordWantsNonChunkSetupMonster()) {
      return false;
    }
    // If we're already tracking, then keep tracking
    if (tracking) {
      return true;
    }
    return RoseGarden.startRoseFight(RoseGarden.getChunkMonsters(), true);
  },
  summon: {
    // We only summon if we don't own the rose garden or it does not have the monster available
    allowed: () =>
      myLevel() >= 3 &&
      (!RoseGarden.haveRoseGarden() ||
        !RoseGarden.startRoseFight(RoseGarden.getChunkMonsters(), true)),
  },
  setup: {
    worthStarting: () =>
      // We only set it up if we're not in blue vs red, or daycount >0
      (!in_bluevsred() || myDaycount() > 1) &&
      auto_is_valid($item`partial tombstone`) &&
      // Need rose garden obviously to start a fight
      RoseGarden.haveRoseGarden() &&
      // Evil eyes come first while the crypt needs them, unless we're overleveled
      (myLevel() >= 11 || get("cyrptNookEvilness") <= 13) &&
      // These free kills are slow to farm, so not on the only day of a 1 day run
      (myDaycount() > 1 || !auto_isLastDay()) &&
      RoseGarden.getChunkMonsters().some((m) =>
        swordFamiliarWantsMonsterDrops(m),
      ) &&
      RoseGarden.startRoseFight(RoseGarden.getChunkMonsters(), true),
    start: () =>
      RoseGarden.startRoseFight(RoseGarden.getChunkMonsters(), false),
  },
};

const cryptNookMonsters = $monsters`spiny skelelton, toothy sklelton`;

const cryptTarget: SwordTarget = {
  monsters: [$monster`skeleton astronaut`, ...cryptNookMonsters],
  stillWantsDrops: (_, tracking) =>
    auto_is_valid($item`evil eye`) &&
    get("cyrptNookEvilness") - itemAmount($item`evil eye`) * 3 >
      13 + (tracking ? 0 : 3) &&
    !in_koe(),
  // We can't adventure there yet, and haven't lowered the evil some other way
  summon: {
    monsters: cryptNookMonsters,
    allowed: () => myLevel() < 7 && get("cyrptNookEvilness") === 50,
  },
  setup: {
    worthStarting: () =>
      cryptNookMonsters.some((m) => swordFamiliarWantsMonsterDrops(m)),
    start: () => runQuestTask(L7_defiledNookTask),
  },
};

const topiaryTarget: SwordTarget = {
  monsters: $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`,
  stillWantsDrops: () =>
    auto_is_valid($item`rusty hedge trimmers`) && hedgeTrimmersNeeded() > 0,
};

const lobsterfrogmanTarget: SwordTarget = {
  monsters: $monsters`lobsterfrogman`,
  stillWantsDrops: (_, tracking) =>
    auto_gunpowderBarrelsWanted() > (tracking ? 0 : 3) &&
    (tracking ||
      !PastaWand.havePastaWand() ||
      !canEat() ||
      fullness_left() < 1 ||
      !auto_is_valid($item`Tubetto Gelatto`)),
};

const bowlingTarget: SwordTarget = {
  monsters: $monsters`pygmy bowler`,
  // Opening it will get us to progress of 1, then we subtract 5 from that
  stillWantsDrops: () =>
    Math.max(get("hiddenBowlingAlleyProgress"), 0) +
      itemAmount($item`bowling ball`) <
    6,
  setup: {
    worthStarting: () =>
      !Peridot.haveUsedPeridot($location`The Hidden Bowling Alley`) &&
      itemAmount($item`bowling ball`) + get("hiddenBowlingAlleyProgress") < 5 &&
      swordFamiliarWantsMonsterDrops($monster`pygmy bowler`),
    start: () =>
      possessEquipment($item`Peridot of Peril`) &&
      // We refuse to try this if we'd get a NC
      bluevsred_willEncounterFight($monster`pygmy bowler`) &&
      isAvailable(L11_HiddenCity.L11_hiddenBowlingAlleyTask) &&
      runQuestTask(L11_HiddenCity.L11_hiddenBowlingAlleyTask),
  },
};

const tombRatTarget: SwordTarget = {
  monsters: $monsters`tomb rat`,
  stillWantsDrops: (mon, tracking) =>
    L11_Pyramid.L11_shouldSwordTombRat() &&
    bluevsred_willEncounterFight(mon) &&
    (tracking ||
      // Kind of pointless to sword the tomb rat if we don't have anywhere to go
      (get("8BitScore") < 9500 &&
        swordIsWillingToSwitchTargets() &&
        !isComplete(DigitalRealm.LX_getDigitalKeyTask))),
};

// Summons and setups are tried in this order
const SWORD_TARGETS: SwordTarget[] = [
  giantSquidTarget,
  smutOrcTarget,
  shadowSlabTarget,
  roseGardenTarget,
  cryptTarget,
  topiaryTarget,
  lobsterfrogmanTarget,
  bowlingTarget,
  tombRatTarget,
];

function swordSetupMonsters(): Monster[] {
  return SWORD_TARGETS.flatMap((target) =>
    target.summon === undefined
      ? []
      : (target.summon.monsters ?? target.monsters),
  );
}

export function swordFamiliarWantsMonsterDrops(sMonster: Monster): boolean {
  return getOrCompute(
    getEngine().getContext().swordWantsDrops(),
    sMonster,
    swordFamiliarWantsMonsterDropsUncached,
  );
}

function swordFamiliarWantsMonsterDropsUncached(sMonster: Monster): boolean {
  // Does not determine if we want to be using the familiar right now.
  if (sMonster === $monster.none || !sMonster.copyable) {
    return false;
  }

  const tracking = swordIsTracking(sMonster);

  if (!tracking && !bluevsred_willEncounterFight(sMonster)) {
    return false;
  }

  const target = SWORD_TARGETS.find((t) => t.monsters.includes(sMonster));
  return target !== undefined && target.stillWantsDrops(sMonster, tracking);
}

export function swordFamiliarIsActivelyFarming(): boolean {
  // Returns if the sword familiar is currently set to a monster that we want the drops of
  return swordFamiliarWantsMonsterDrops(swordOfSwordsTracking());
}

export function wantToStartTrackingSwordMonster(enemy: Monster): boolean {
  // Targets the current enemy for future fights - doesn't affect this fight's own drops.
  if (
    (currentRound() > 0 ||
      !$familiars`Sword of S Words, none`.includes(
        get("tscend_familiarChoice"),
      )) &&
    myFamiliar() !== $familiar`Sword of S Words`
  ) {
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

// The sword overwrites this monster's drops with its tracked item, so copying it or banking a
// wanderer of it for its own drop is wasted effort.
export function swordWillOverwriteDrops(mon: Monster): boolean {
  return swordIsTracking(mon) || wantToStartTrackingSwordMonster(mon);
}

export function preferSwordFamiliar(place: Location) {
  if (!haveSwordFamiliar()) return;
  set("_tscend_preferSwordFam", canUseSwordFamiliarHere(place));
}

function nextFightHasWantedDrops(place: Location): boolean {
  const next = get("tscend_nextEncounter");
  return next !== $monster.none
    ? auto_monsterHasWantedDrop(next)
    : auto_wantedDropMonsters(place).length > 0;
}

export function swordBeatsItemFamiliar(place: Location): boolean {
  return (
    get("_tscend_preferSwordFam", false) && !nextFightHasWantedDrops(place)
  );
}

// Uncopyable monsters we'd rather turn into some fish, where their own drops are worth less than the sword's
function auto_swordFishTarget(loc: Location, mon: Monster): boolean {
  // The lair has nothing copyable, and its delay has to be burnt regardless
  return (
    loc === $location`The Boss Bat's Lair` &&
    mon === $monster`beefy bodyguard bat` &&
    !isMeatPoor()
  );
}

// The sword only overwrites the drops of a copyable monster, but the monodent can make some fish of one it can't
function auto_swordCanOverwriteDrops(loc: Location, mon: Monster): boolean {
  return (
    mon.copyable || (Monodent.haveMonodent() && auto_swordFishTarget(loc, mon))
  );
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
  return swordFamiliarBlockReason(place, ignoreDailyBudget) === undefined;
}

// These locs are not good sword targets
const noGoodSwordTargetsHere = $locations`The Penultimate Fantasy Airship, A-Boo Peak, Cobb's Knob Harem, Twin Peak, The Black Forest, Whitey's Grove, Guano Junction`;

function shouldBypassDelayAllowGaze(
  loc: Location,
  planToPeridot: boolean = false,
): boolean {
  return (
    noGoodSwordTargetsHere.includes(loc) &&
    BCZ.bczRefractedGazeWorthwhile(planToPeridot, loc)
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
  if (Heartstone.heartstoneMayFinishDairyGoatHere(place)) {
    return "we may turn a monster here into a dairy goat we want the drops of";
  }
  if (
    $locations`The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
      place,
    ) &&
    shouldFarmBattlefieldDrops()
  ) {
    return "we need the war drops to redeem for healing items";
  }
  if (
    place === $location`The Fungus Plains` &&
    !in_plumber() &&
    !haveEnoughShadowHealingItems()
  ) {
    return "we need the red pixel drops for healing items";
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
    get("tscend_nextEncounter") !== $monster`none` &&
    nextFightHasWantedDrops(place) &&
    !auto_wantToFreeKillWithNoDrops(place, get("tscend_nextEncounter"))
  ) {
    return `forced encounter ${get("tscend_nextEncounter")} is next`;
  }
  // Traces/afterimage bandit chains force the same rematch either way, and fantasy bandit's own drop is conditional (never overwritten), so it's free
  if (AutoLeprecondo.canTracesBandit() && swordFamiliarIsActivelyFarming()) {
    return undefined;
  }
  const wanderer = nextWanderer(0, false);
  if (swordOfSwordsTracking() !== $monster.none && wanderer !== undefined) {
    return `${wanderer.name} is due next turn`;
  }

  if (place === $location`The Black Forest`) {
    if (
      turnsUntilForcedNoncombat(place) > 0 &&
      !$items`reassembled blackbird, reconstituted crow`.some((i) => have(i))
    ) {
      return "we need the black familiar";
    }

    if (
      auto_is_valid($item`blackberry galoshes`) &&
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) < 3
    ) {
      return "we need to fight blackberry bush";
    }

    const familiarCombatRate = numericModifier(
      myFamiliar(),
      $modifier`Combat Rate`.name,
      weightAdjustment(),
      equippedItem($slot`familiar`),
    );
    const combatRateWithoutFam =
      numericModifier($modifier`Combat Rate`) - familiarCombatRate;

    if (turnsUntilForcedNoncombat(place) > 0 && combatRateWithoutFam < 5) {
      return "can't run enough +combat in black forest";
    }
  } else if (!zone_delay(place).shouldDelay) {
    if (
      !$locations`The Haunted Kitchen, The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
        place,
      ) &&
      (place !== $location`The Boss Bat's Lair` || place.turnsSpent >= 6) &&
      (place !== $location`The Red Zeppelin` ||
        (get("_glarkCableUses") + itemAmount($item`glark cable`) < 5 &&
          (get("tscend_nextEncounter") === $monster.none ||
            !nextFightHasWantedDrops(place))))
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
    get("tscend_nextEncounter") !== $monster.none
      ? !swordFamiliarWantsMonsterDrops(get("tscend_nextEncounter"))
      : !auto_locationMonsters(place).some(
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
      `${locs.filter((l) => canUseSwordFamiliarHere(l, true)).join(", ")} is a place to use sword, but sword isn't available`,
    )
  );
}

// Soft-delay leaving these zones (a level's quest-turn-in, typically) while the Sword of S Words or Baseball Diamond is still mid-farm on a monster that only appears here.
// TODO This is currently hardcoded, need to switch it to checking against a task's location
export function copierShouldDelayZone(locs: Location[]): boolean {
  if (isAboutToPowerlevel()) return false;
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

  // A sniff only pays out on turns spent where it landed, so delaying that zone strands the
  // sniff and leaves every zone that wants its own sniff blocked behind it forever.
  if (auto_holdingWantedSniff(locs)) return false;

  return (
    BaseballDiamond.baseballShouldDelayZone(zoneMonsters) ||
    auto_wouldSplitSniffFocus(locs)
  );
}

function canAdventureSomewhereMostlyFighting(monsters: Monster[]): boolean {
  for (const loc of Location.all()) {
    if (!canAdventure(loc)) {
      continue;
    }

    let totalChance = 0;
    for (const [mon, chance] of auto_locationMonsters(loc)) {
      if (chance > 0 && monsters.includes(mon)) {
        totalChance += chance;
      }
    }

    if (totalChance > 65) {
      return true;
    }
  }

  return false;
}

// The first wanted monster of this target that's worth summoning
function swordSummonMonster(target: SwordTarget): Monster | undefined {
  const summon = target.summon;
  if (summon === undefined) {
    return undefined;
  }

  const wanted = (summon.monsters ?? target.monsters).filter(
    (m) =>
      summon.allowed(m) &&
      bluevsred_willEncounterFight(m) &&
      swordFamiliarWantsMonsterDrops(m) &&
      canSummonMonster(m),
  );

  if (wanted.length === 0) {
    return undefined;
  }

  // Not worth a summon if we can already adventure somewhere that mostly fights them
  if (canAdventureSomewhereMostlyFighting(wanted)) {
    return undefined;
  }

  return wanted[0];
}

function summonSwordTarget(): boolean {
  // If we haven't visited the council yet
  if (get("lastCouncilVisit") < Math.min(myLevel(), 3)) {
    return false;
  }

  for (const target of SWORD_TARGETS) {
    const monster = swordSummonMonster(target);
    if (monster === undefined) {
      continue;
    }

    // Summons fight at a placeholder location, so pre_adv only knows what we're
    // about to fight if we set it here
    set("tscend_nextEncounter", monster);
    prepareInstaKillNextCombat(monster, myLocation());

    if (summonMonster(monster)) {
      return true;
    }
    set("tscend_nextEncounter", "");
    return false;
  }

  return false;
}

function giantSquidNeedsDoingFirst(): boolean {
  if (turnsPlayed() > 1) {
    return false;
  }

  // Only if we do want to track it and have not summoned yet
  return (
    giantSquidTarget.stillWantsDrops($monster`giant squid`, false) &&
    swordOfSwordsTracking() === $monster.none
  );
}

// Highest priority first
function availableSwordSetups(): NonNullable<SwordTarget["setup"]>[] {
  if (giantSquidNeedsDoingFirst()) {
    return [giantSquidTarget.setup!];
  }

  const setups: NonNullable<SwordTarget["setup"]>[] = [];
  for (const target of SWORD_TARGETS) {
    const setup = target.setup;
    if (setup !== undefined && setup.worthStarting()) {
      setups.push(setup);
    }
  }

  // Rose garden goes last while we have a switch to spare
  const rose = roseGardenTarget.setup!;
  if (swordOfSwordSwitchesLeft() > 1) {
    return [
      ...setups.filter((setup) => setup !== rose),
      ...setups.filter((setup) => setup === rose),
    ];
  }

  return setups;
}

registerQuestTask({
  name: "LX_swordFamiliarSetup",
  completed: () => !haveSwordFamiliar(),
  ready: () =>
    swordIsWillingToSwitchTargets() &&
    nextWanderer(0, false) === undefined &&
    (!get("_tscend_thisLoopHandleFamiliar", false) ||
      get("tscend_familiarChoice") === $familiar`Sword of S Words`) &&
    availableSwordSetups().length > 0,
  desiredEncounters: () =>
    // Stop registering a monster as desired once we have started tracking the desired
    swordIsWillingToSwitchTargets()
      ? swordSetupMonsters()
          .filter((monster) => swordFamiliarWantsMonsterDrops(monster))
          .map((monster) => ({ monster, needAmount: 1 }))
      : [],
  do: () => {
    // We're making sure that our familiar choice does not 'stick' on a failed setup
    const priorChoice = get("tscend_familiarChoice");
    const priorHandled = get("_tscend_thisLoopHandleFamiliar", false);
    let started = false;
    try {
      started =
        handleFamiliar$1($familiar`Sword of S Words`) &&
        availableSwordSetups().some((setup) => setup.start());
      return started;
    } finally {
      if (!started) {
        set("tscend_familiarChoice", priorChoice);
        set("_tscend_thisLoopHandleFamiliar", priorHandled);
      }
    }
  },
});
