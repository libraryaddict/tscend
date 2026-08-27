import {
  itemAmount,
  knollAvailable,
  mpCost,
  myClass,
  myMp,
  useSkill,
} from "kolmafia";
import { $class, $effect, $item, $skill } from "libram";

import { auto_buyUpTo } from "../../auto_acquire";
import { buffMaintain$2 } from "../../auto_buff";
import { possessEquipment } from "../../auto_equipment";
import { auto_have_skill, auto_log_warning, autoCraft } from "../../auto_util";

//	This is meant for items that have a date of 2013

//Defined in autoscend/iotms/mr2013.ash
export function makeStartingSmiths(): void {
  if (!auto_have_skill($skill`Summon Smithsness`)) {
    return;
  }

  if (itemAmount($item`lump of Brituminous coal`) === 0) {
    if (myMp() < 3 * mpCost($skill`Summon Smithsness`)) {
      auto_log_warning(
        "You don't have enough MP for initialization, it might be ok but probably not.",
        "red",
      );
    }
    useSkill(3, $skill`Summon Smithsness`);
  }

  if (knollAvailable()) {
    auto_buyUpTo(1, $item`maiden wig`);
  }

  switch (myClass()) {
    case $class`Seal Clubber`:
      if (!possessEquipment($item`Meat Tenderizer is Murder`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`seal-clubbing club`,
        );
      }
      if (
        !possessEquipment($item`Vicar's Tutu`) &&
        itemAmount($item`lump of Brituminous coal`) > 0 &&
        knollAvailable()
      ) {
        auto_buyUpTo(1, $item`frilly skirt`);
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`frilly skirt`,
        );
      }
      break;
    case $class`Turtle Tamer`:
      if (!possessEquipment($item`Work is a Four Letter Sword`)) {
        auto_buyUpTo(1, $item`sword hilt`);
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`sword hilt`,
        );
      }
      if (!possessEquipment($item`Ouija Board, Ouija Board`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`turtle totem`,
        );
      }
      break;
    case $class`Sauceror`:
      if (!possessEquipment($item`Saucepanic`)) {
        autoCraft("smith", 1, $item`lump of Brituminous coal`, $item`saucepan`);
      }
      if (
        !possessEquipment($item`A Light that Never Goes Out`) &&
        itemAmount($item`lump of Brituminous coal`) > 0
      ) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`third-hand lantern`,
        );
      }
      break;
    case $class`Pastamancer`:
      if (!possessEquipment($item`Hand that Rocks the Ladle`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`pasta spoon`,
        );
      }
      break;
    case $class`Disco Bandit`:
      if (!possessEquipment($item`Frankly Mr. Shank`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`disco ball`,
        );
      }
      break;
    case $class`Accordion Thief`:
      if (!possessEquipment($item`Shakespeare's Sister's Accordion`)) {
        autoCraft(
          "smith",
          1,
          $item`lump of Brituminous coal`,
          $item`stolen accordion`,
        );
      }
      break;
  }

  if (
    knollAvailable() &&
    !possessEquipment($item`Hairpiece On Fire`) &&
    itemAmount($item`lump of Brituminous coal`) > 0
  ) {
    autoCraft("smith", 1, $item`lump of Brituminous coal`, $item`maiden wig`);
  }
  buffMaintain$2($effect`Merry Smithsness`, 0, 1, 10);
}
