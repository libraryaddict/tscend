import { canEquip, mpCost, myClass, myMeat, myMp, useSkill } from "kolmafia";
import { $class, $item, $skill } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { mp_regen } from "../../auto_restore";
import { auto_can_equip, auto_have_skill, meatReserve } from "../../auto_util";

export function chapeau(): void {
  if (!canEquip($item`no hat`)) {
    //requires 150 Moxie to wear, so will stop at this check alone most of the time, except in BIG! or level 13 moxie class
    return;
  }
  if (!auto_have_skill($skill`Ceci N'Est Pas Un Chapeau`)) {
    return;
  }
  if (myMp() < mpCost($skill`Ceci N'Est Pas Un Chapeau`)) {
    return;
  }
  if (possessEquipment($item`no hat`) || !auto_can_equip($item`no hat`)) {
    return;
  }
  //300 MP cost is high and non sauceror classes that rely on meat for MP may need to check reserve first
  let doGetNoHat: boolean = false;
  if (myMp() >= 100 + mpCost($skill`Ceci N'Est Pas Un Chapeau`)) {
    doGetNoHat = true;
  } else if (
    myMp() >= 32 + mpCost($skill`Ceci N'Est Pas Un Chapeau`) &&
    mp_regen() >= 32
  ) {
    doGetNoHat = true;
  } else {
    const minimumMeat: number =
      meatReserve() + (myClass() === $class`Sauceror` ? 500 : 2000);
    if (myMeat() >= minimumMeat) {
      doGetNoHat = true;
    }
  }

  if (doGetNoHat) {
    useSkill(1, $skill`Ceci N'Est Pas Un Chapeau`);
  }
}
