import {
  abort,
  containsText,
  getProperty,
  lastMonster,
  Monster,
  splitString,
  toInt,
} from "kolmafia";
import { $skill, set } from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import { in_fotd } from "../paths/fall_of_the_dinosaurs";
import {
  auto_canUse,
  auto_useSkill,
  canSurvive,
  haveUsed,
} from "./auto_combat_util";

//Path specific combat handling for Fall of the Dinosaurs

//defined in /autoscend/combat/auto_combat_fall_of_the-dinosaurs.ash
export function fotd_combat_helper(): void {
  //identify dinosaur that has eaten current monster during Fall of the dinosaur path path
  if (!in_fotd()) {
    return;
  }
  // primitive chicken 			No Meat, 1 in all stats
  // glass-shelled archelon		Reflects spell dmg
  // ghostasaurus					physical dmg reduced to 1, elemental resistance based on monster
  // flatusaurus					elemental dmg
  // spikolodon					stinging dmg to melee attacks
  // high-altitude pterodactyl	avoids all weapon attacks
  // supersonic velociraptor		only have 1 turn to win if win init
  // kachungasaur					300% meat drop, stun resistance based on ML
  // dilophosaur					will always hit

  const dino_list: Map<number, string> = new Map(
    splitString(
      "chicken archelon ghostasaurus flatusaurus spikolodon pterodactyl velociraptor kachungasaur dilophosaur",
      " ",
    ).map((_v, _i) => [_i, _v]),
  );

  for (const d of dino_list.keys()) {
    const dino: string = dino_list.get(d) ?? dino_list.set(d, "").get(d);
    if (lastMonster().randomModifiers.includes(dino)) {
      set("_auto_combatFotdDinosaur", dino);
      break;
    }
  }
}

export function auto_combatFallOfTheDinosaursStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  if (!in_fotd()) {
    return undefined;
  }
  // Only get 1 combat round with Velociraptor

  const dino: string = getProperty("_auto_combatFotdDinosaur");
  if (dino === "velociraptor") {
    return "attack"; // TODO - needs some logic to determine best auto-kill method -whether that be saucestorm, saucegeyser or attack with weapon
  }

  return undefined;
}

export function auto_combatFallOfTheDinosaursStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 5 = kill
  if (!in_fotd()) {
    return undefined;
  }

  const dino: string = getProperty("_auto_combatFotdDinosaur");
  if (dino === "archelon") {
    // reflects damage from spells back to player.
    if (enemy.physicalResistance >= 80 && !haveUsed($skill`Silent Treatment`)) {
      if (auto_canUse($skill`Implode Universe`)) {
        return auto_useSkill($skill`Implode Universe`, true);
      }
      if (auto_canUse($skill`Silent Treatment`)) {
        return auto_useSkill($skill`Silent Treatment`, true);
      }
      abort(
        "Not sure how to handle a physically resistent enemy eaten by a glass-shelled archelon.",
      ); // TODO - work something out here?
    }
    if (canSurvive(1.5) && round_1 < 25) {
      return "attack";
    }
    if (auto_canUse($skill`Implode Universe`)) {
      return auto_useSkill($skill`Implode Universe`, true);
    }
    abort("Not sure how to handle monster eaten by a glass-shelled archelon.");
  }
  if (dino === "pterodactyl") {
    // immune to melee
    if (auto_canUse($skill`Snipe Pterodactyl`, false)) {
      return auto_useSkill($skill`Snipe Pterodactyl`, false);
    }
    if (auto_canUse($skill`Saucegeyser`, false)) {
      return auto_useSkill($skill`Saucegeyser`, false);
    }
    if (auto_canUse($skill`Saucestorm`, false)) {
      return auto_useSkill($skill`Saucestorm`, false);
    }
  }
  if (dino === "spikolodon") {
    // returns stinging damage on melee attacks
    if (auto_canUse($skill`Saucegeyser`, false)) {
      return auto_useSkill($skill`Saucegeyser`, false);
    }
    if (auto_canUse($skill`Saucestorm`, false)) {
      return auto_useSkill($skill`Saucestorm`, false);
    }
  }
  if (dino === "ghostasaurus") {
    // physically immune, ml-scaling elemental resistance
    const dino_difficulty: number = containsText(enemy.attributes, "Scale:")
      ? 0
      : toInt(enemy.baseAttack / 1.8);
    if (dino_difficulty >= 75 && auto_canUse($skill`Silent Treatment`)) {
      return auto_useSkill($skill`Silent Treatment`, true);
    }
    if (auto_canUse($skill`Saucestorm`, false)) {
      return auto_useSkill($skill`Saucestorm`, false);
    }
  }

  return undefined;
}
