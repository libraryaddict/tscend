import { equippedItem, Monster, myAudience, myClass } from "kolmafia";
import { $class, $items, $skill, $slot } from "libram";

import { disregardInstantKarma } from "../auto_powerlevel";
import { auto_useSkill, canSurvive$1, canUse } from "./auto_combat_util";

//Path specific combat handling for Avatar of Sneaky Pete

//defined in /autoscend/combat/auto_combat_pete.ash
export function auto_combatPeteStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  //adjust audience love/hate. must be first action done in combat
  //TODO rush to max love, then max hate, then max love again for the consumables
  if (myClass() === $class`Avatar of Sneaky Pete` && canSurvive$1(3.0)) {
    let maxAudience: number = 30;
    if (
      $items`Sneaky Pete's leather jacket, Sneaky Pete's leather jacket (collar popped)`.includes(
        equippedItem($slot`shirt`),
      )
    ) {
      maxAudience = 50;
    }
    if (
      canUse($skill`Mug for the Audience`) &&
      (myAudience() < maxAudience || disregardInstantKarma())
    ) {
      return auto_useSkill($skill`Mug for the Audience`);
    }
  }

  return "";
}
