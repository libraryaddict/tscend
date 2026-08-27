import {
  blackMarketAvailable,
  currentRound,
  floor,
  haveEquipped,
  Item,
  itemAmount,
  lastMonster,
  Location,
  myBasestat,
  myClass,
  myDaycount,
  myFamiliar,
  myLevel,
  myLocation,
  myPrimestat,
  Skill,
  Stat,
  useSkill,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $stat,
  get,
} from "libram";

import {
  AutoEternityCodpiece,
  Monodent,
  Peridot,
  SwordOfSwords,
} from "../../../types";
import { auto_canChew, auto_canDrink, auto_canEat } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  canYellowRay,
  getMonsterDrops,
  handleTracker,
  internalQuestStatus,
  level_to_min_substat,
  safeGet,
  stat_to_substat,
} from "../../auto_util";
import {
  auto_canUse,
  combat_status_check,
} from "../../combat/auto_combat_util";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_zootomist } from "../../paths/2025/zootomist";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import { bridgeGoal, fastenerCount, lumberCount } from "../../quests/level_09";
import { L11_needWetStew } from "../../quests/level_11";
import { needStarKey } from "../../quests/level_13";

export function haveBCZ(): boolean {
  if (
    auto_is_valid($item`blood cubic zirconia`) &&
    possessEquipment($item`blood cubic zirconia`)
  ) {
    return true;
  }
  if (
    AutoEternityCodpiece.haveEternityCodpiece() &&
    AutoEternityCodpiece.isInEternityCodpiece($item`blood cubic zirconia`)
  ) {
    return true;
  }
  return false;
}

export function getItemToEquipBCZ(): Item {
  if (
    AutoEternityCodpiece.haveEternityCodpiece() &&
    AutoEternityCodpiece.isInEternityCodpiece($item`blood cubic zirconia`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (haveBCZ()) {
    return $item`blood cubic zirconia`;
  }
  return $item.none;
}

export function BCZEquipped(): boolean {
  if (
    AutoEternityCodpiece.isInEternityCodpiece($item`blood cubic zirconia`) &&
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

export function wantToBCZ(sk: Skill): boolean {
  if (!haveBCZ() || !auto_is_valid$2(sk) || in_zootomist()) {
    return false;
  }
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

export function bczRefractedGaze(
  planToPeridot: boolean = false,
  location: Location = myLocation(),
): boolean {
  if (!wantToBCZ($skill`BCZ: Refracted Gaze`)) {
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
    (SwordOfSwords.swordFamiliarIsActivelyFarming() ||
      SwordOfSwords.swordOfSwordsTracking() !== $monster.none)
  ) {
    // the sword already overwrites this fight's drop table, so gazing here would be wasted.
    return false;
  }
  planToPeridot =
    Peridot.havePeridot() &&
    !Peridot.haveUsedPeridot(location) &&
    planToPeridot;

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
    ? Monodent.haveMonodent()
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

      // Only worth an adventure if we can grab both the wig and the amulet in one fight
      if (!canYellowRay($monster`Quiet Healer`)) {
        return false;
      }

      if (isSpeculating) return true;

      if (lastMonster() === $monster`some fish` || Monodent.haveMonodent()) {
        return true;
      }

      // The gaze strips the drops off whatever we're fighting, and these two can't be
      // monodented away as their drops are wanted by the airship task
      return !$monsters`Burly Sidekick, Quiet Healer`.includes(lastMonster());
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

export function getBCZItems(): void {
  if (!haveBCZ()) {
    return;
  }

  while (wantToBCZ($skill`BCZ: Craft a Pheromone Cocktail`)) {
    handleTracker({
      what: $item`blood cubic zirconia`,
      detail: $item`pheromone cocktail`.toString(),
      property: "auto_iotm_claim",
    });
    useSkill(1, $skill`BCZ: Craft a Pheromone Cocktail`);
  }
  while (wantToBCZ($skill`BCZ: Prepare Spinal Tapas`)) {
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
export function bczDelevelPlan(
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
export function auto_haveBCZ() {
  throw new Error("Function not implemented.");
}
