import { haveSkill } from "kolmafia";
import { $item, $skill, get } from "libram";

import { auto_is_valid, auto_is_valid$2 } from "../../auto_util";

function auto_hasMeteorLore(): boolean {
  return (
    haveSkill($skill`Meteor Lore`) &&
    auto_is_valid($item`Pocket Meteor Guide`) &&
    auto_is_valid$2($skill`Meteor Lore`)
  );
}

function auto_macroMeteoritesUsed(): number {
  return get("_macrometeoriteUses");
}

export function macrometeoritesAvailable(): number {
  if (!auto_hasMeteorLore()) {
    return 0;
  }

  return 10 - auto_macroMeteoritesUsed();
}
