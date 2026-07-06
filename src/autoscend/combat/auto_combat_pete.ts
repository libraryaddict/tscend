import {
  Class,
  equippedItem,
  Item,
  Monster,
  myAudience,
  myClass,
  Skill,
  Slot,
} from "kolmafia";
import { disregardInstantKarma } from "../auto_powerlevel";
import { canSurvive$1, canUse$2, useSkill$2 } from "./auto_combat_util";

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
  if (myClass() === Class.get("Avatar of Sneaky Pete") && canSurvive$1(3.0)) {
    let maxAudience: number = 30;
    if (
      Item.get([
        "Sneaky Pete's leather jacket",
        "Sneaky Pete's leather jacket (collar popped)",
      ]).includes(equippedItem(Slot.get("shirt")))
    ) {
      maxAudience = 50;
    }
    if (
      canUse$2(Skill.get("Mug for the Audience")) &&
      (myAudience() < maxAudience || disregardInstantKarma())
    ) {
      return useSkill$2(Skill.get("Mug for the Audience"));
    }
  }

  return "";
}
