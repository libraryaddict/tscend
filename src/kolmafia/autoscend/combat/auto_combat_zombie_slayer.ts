import {
  containsText,
  getProperty,
  itemAmount,
  Monster,
  myLevel,
  myLocation,
  toInt,
  toItem,
} from "kolmafia";
import { $item, $location, $monster, $monsters, $skill } from "libram";

import { possessEquipment } from "../auto_equipment";
import {
  auto_have_skill,
  handleTracker$1,
  internalQuestStatus,
} from "../auto_util";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { cyrptEvilBonus } from "../quests/level_07";
import { auto_useSkill, canSurvive, canUse } from "./auto_combat_util";

//Path specific combat handling for Zombie Slayer

function wantBearHug(enemy: Monster): boolean {
  return (
    canUse($skill`Bear Hug`) &&
    toInt(getProperty("_bearHugs")) < 10 &&
    !enemy.boss &&
    !containsText(enemy.attributes, "FREE") &&
    enemy.group > 1
  );
}

function wantKodiakMoment(enemy: Monster): boolean {
  return canUse($skill`Kodiak Moment`) && enemy.physicalResistance >= 80;
}

//defined in /autoscend/combat/auto_combat_zombie_slayer.ash
export function auto_combatZombieSlayerStage3(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 3 = debuff: delevel, stun, curse, damage over time
  if (!in_zombieSlayer()) {
    return "";
  }

  if (canUse($skill`Infectious Bite`) && canSurvive(4.0)) {
    return auto_useSkill($skill`Infectious Bite`);
  }

  if (canUse($skill`Meat Shields`) && enemy.boss && canSurvive(4.0)) {
    return auto_useSkill($skill`Meat Shields`);
  }
  // Just always use Bear-ly Legal for the delevel + meat, unless we want to Bear Hug or Kodiak Moment
  if (
    canUse($skill`Bear-ly Legal`) &&
    !wantBearHug(enemy) &&
    !wantKodiakMoment(enemy)
  ) {
    return auto_useSkill($skill`Bear-ly Legal`);
  }

  return "";
}

export function auto_combatZombieSlayerStage4(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
  if (!in_zombieSlayer()) {
    return "";
  }
  // Basically stolen from Ed's Lash targets
  if (
    canUse($skill`Smash & Graaagh`) &&
    toInt(getProperty("_zombieSmashPocketsUsed")) < 30 &&
    canSurvive(2.0)
  ) {
    let doSmash: boolean = false;

    if (
      enemy === $monster`Big Wheelin' Twins` &&
      !possessEquipment($item`badge of authority`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`mountain man` &&
      itemAmount(toItem(getProperty("trapperOre"))) < 3
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`fishy pirate` &&
      !possessEquipment($item`perfume-soaked bandana`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`garbage tourist` &&
      itemAmount($item`bag of park garbage`) === 0
    ) {
      doSmash = true;
    }
    if (enemy === $monster`dairy goat` && itemAmount($item`goat cheese`) < 3) {
      doSmash = true;
    }
    if (
      enemy === $monster`monstrous boiler` &&
      itemAmount($item`red-hot boilermaker`) < 1 &&
      toInt(getProperty("booPeakProgress")) > 0
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Fitness Giant` &&
      itemAmount($item`pec oil`) < 1 &&
      toInt(getProperty("booPeakProgress")) > 0
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Renaissance Giant` &&
      itemAmount($item`Ye Olde Meade`) < 1
    ) {
      doSmash = true;
    }
    if (
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
        enemy,
      )
    ) {
      doSmash = true;
    }
    if ($monsters`beanbat, bookbat`.includes(enemy)) {
      doSmash = true;
    }
    if (
      enemy === $monster`banshee librarian` &&
      itemAmount($item`killing jar`) < 1 &&
      toInt(getProperty("desertExploration")) < 100 &&
      (toInt(getProperty("gnasirProgress")) & 4) === 0
    ) {
      doSmash = true;
    }
    if (
      (enemy === $monster`toothy sklelton` ||
        enemy === $monster`spiny skelelton`) &&
      toInt(getProperty("cyrptNookEvilness")) > 14 + cyrptEvilBonus(true)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`oil baron` &&
      itemAmount($item`bubblin' crude`) < 12 &&
      itemAmount($item`jar of oil`) === 0
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`blackberry bush` &&
      itemAmount($item`blackberry`) < 3 &&
      !possessEquipment($item`blackberry galoshes`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`pygmy bowler` &&
      toInt(getProperty("_zombieSmashPocketsUsed")) < 26
    ) {
      doSmash = true;
    }
    if (
      $monsters`filthworm drone, filthworm royal guard, larval filthworm`.includes(
        enemy,
      )
    ) {
      doSmash = true;
    }
    if (enemy === $monster`Knob Goblin Madam`) {
      if (itemAmount($item`Knob Goblin perfume`) === 0) {
        doSmash = true;
      }
    }
    if (enemy === $monster`Knob Goblin Harem Girl`) {
      if (
        !possessEquipment($item`Knob Goblin harem veil`) ||
        !possessEquipment($item`Knob Goblin harem pants`)
      ) {
        doSmash = true;
      }
    }
    if (
      (myLocation() === $location`The Hippy Camp` ||
        myLocation() === $location`Wartime Hippy Camp`) &&
      containsText(enemy.toString(), "hippy") &&
      myLevel() >= 12
    ) {
      if (
        !possessEquipment($item`filthy knitted dread sack`) ||
        !possessEquipment($item`filthy corduroys`)
      ) {
        doSmash = true;
      }
    }
    if (myLocation() === $location`Wartime Frat House`) {
      if (
        !possessEquipment($item`beer helmet`) ||
        !possessEquipment($item`bejeweled pledge pin`) ||
        !possessEquipment($item`distressed denim pants`)
      ) {
        doSmash = true;
      }
    }
    if (
      enemy === $monster`dopey 7-Foot Dwarf` &&
      !possessEquipment($item`miner's helmet`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`grumpy 7-Foot Dwarf` &&
      !possessEquipment($item`7-Foot Dwarven mattock`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`sleepy 7-Foot Dwarf` &&
      !possessEquipment($item`miner's pants`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Burly Sidekick` &&
      !possessEquipment($item`Mohawk wig`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Spunky Princess` &&
      !possessEquipment($item`titanium assault umbrella`) &&
      !possessEquipment($item`unbreakable umbrella`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Quiet Healer` &&
      !possessEquipment($item`amulet of extreme plot significance`)
    ) {
      doSmash = true;
    }
    if (
      enemy === $monster`Copperhead Club bartender` &&
      internalQuestStatus("questL11Ron") < 2
    ) {
      doSmash = true;
    }

    if (doSmash) {
      handleTracker$1(
        enemy.toString(),
        $skill`Smash & Graaagh`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Smash & Graaagh`);
    }
  }

  return "";
}

export function auto_combatZombieSlayerStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  if (!in_zombieSlayer()) {
    return "";
  }

  if (wantBearHug(enemy)) {
    return auto_useSkill($skill`Bear Hug`);
  }
  // Spam plague claws if we won't die
  if (
    round_1 < 20 &&
    canSurvive(5.0) &&
    auto_have_skill($skill`Plague Claws`) &&
    enemy.physicalResistance < 80
  ) {
    return auto_useSkill($skill`Plague Claws`);
  }

  if (wantKodiakMoment(enemy)) {
    return auto_useSkill($skill`Kodiak Moment`);
  }

  if (canUse($skill`Bilious Burst`) && enemy.physicalResistance >= 80) {
    return auto_useSkill($skill`Bilious Burst`);
  }

  return "";
}
