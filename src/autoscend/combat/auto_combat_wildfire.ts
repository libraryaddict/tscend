import {
  abort,
  haveEquipped,
  haveSkill,
  Monster,
  mpCost,
  myClass,
} from "kolmafia";
import { $class, $elements, $item, $monster, $monsters, $skill } from "libram";

import { currentFlavour } from "../auto_util";
import { in_wildfire } from "../paths/wildfire";
import { canUse$1, canUse$2, useSkill$1, useSkill$2 } from "./auto_combat_util";

//Path specific combat handling for wildfire

//defined in /autoscend/combat/auto_combat_wildfire.ash
export function auto_combatWildfireStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  if (!in_wildfire()) {
    return "";
  }
  //always 5 fire bosses. can not be reduced.
  if (
    $monsters`Groar\, Except Hot, The Man on Fire, The Big Ignatowicz`.includes(
      enemy,
    )
  ) {
    if (
      haveEquipped($item`industrial fire extinguisher`) &&
      canUse$2($skill`Curse of Weaksauce`) &&
      haveSkill($skill`Itchy Curse Finger`) &&
      myClass() === $class`Sauceror`
    ) {
      //weaksauce will recover 50 MP. Only use it if you have industrial fire extinguisher equipped to prevent passive damage
      return useSkill$2($skill`Curse of Weaksauce`);
    }
    if (canUse$2($skill`Stuffed Mortar Shell`)) {
      //very cheap for massive damage. tuneable too for extra dmg.
      return useSkill$2($skill`Stuffed Mortar Shell`);
    }
    if (
      $elements`sleaze, stench`.includes(currentFlavour()) &&
      canUse$2($skill`Weapon of the Pastalord`)
    ) {
      //extra dmg dealt
      return useSkill$1($skill`Weapon of the Pastalord`, false);
    }
    if (canUse$1($skill`Saucegeyser`, false)) {
      return useSkill$1($skill`Saucegeyser`, false);
    }
    abort(`We do not know what to do next against [${enemy}].`);
  }
  //always 5 fire. can not be reduced. Does not become hot aligned so there is no elemental dmg boost.
  if ($monster`wall of meat` === enemy) {
    if (canUse$2($skill`Stuffed Mortar Shell`)) {
      return useSkill$2($skill`Stuffed Mortar Shell`);
    }
    if (
      canUse$2($skill`Weapon of the Pastalord`) &&
      mpCost($skill`Weapon of the Pastalord`) < mpCost($skill`Saucegeyser`)
    ) {
      return useSkill$1($skill`Weapon of the Pastalord`, false); //pastamancers can make it cheaper than saucegeyser
    }
    if (canUse$1($skill`Saucegeyser`, false)) {
      return useSkill$1($skill`Saucegeyser`, false);
    }
    abort(`We do not know what to do next against [${enemy}].`);
  }

  return "";
}
