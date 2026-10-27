import {
  Element,
  expectedDamage,
  haveEquipped,
  Location,
  Monster,
  monsterElement,
  myFamiliar,
  myMaxhp,
} from "kolmafia";
import { $element, $familiar, $item, $skill, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_canUse, canSurvive } from "../../combat/auto_combat_util";
import { canChangeToFamiliar } from "../../helpers/auto_familiar";
import { auto_combat_appearance_rates } from "../../utils/auto_util";

type Blessing = {
  received:
    | "_blessingShieldHotReceived"
    | "_blessingShieldColdReceived"
    | "_blessingShieldSpookyReceived"
    | "_blessingShieldStenchReceived"
    | "_blessingShieldSleazeReceived"
    | "_blessingShieldPhysicalReceived";
  minTier: number;
};

const blessings = new Map<Element, Blessing>([
  [$element`hot`, { received: "_blessingShieldHotReceived", minTier: 5 }],
  [$element`cold`, { received: "_blessingShieldColdReceived", minTier: 3 }],
  [$element`spooky`, { received: "_blessingShieldSpookyReceived", minTier: 3 }],
  [$element`stench`, { received: "_blessingShieldStenchReceived", minTier: 5 }],
  [$element`sleaze`, { received: "_blessingShieldSleazeReceived", minTier: 4 }],
  [$element`none`, { received: "_blessingShieldPhysicalReceived", minTier: 3 }],
]);

function protectMeTier(enemy: Monster, tenderizer: boolean): number {
  return (
    1 + Math.floor(Math.sqrt(expectedDamage(enemy) / 9)) + (tenderizer ? 1 : 0)
  );
}

function wantBlessingFrom(enemy: Monster, tenderizer: boolean): boolean {
  const blessing = blessings.get(monsterElement(enemy));

  return (
    blessing !== undefined &&
    !get(blessing.received) &&
    protectMeTier(enemy, tenderizer) >= blessing.minTier
  );
}

export function wantToProtectMe(enemy: Monster): boolean {
  return (
    myFamiliar() === $familiar`Meat Shield Maiden` &&
    auto_canUse($skill`%fn, protect me!`) &&
    wantBlessingFrom(enemy, haveEquipped($item`can of shield tenderizer`)) &&
    // The forced hit lands on top of the monster's normal attack that round
    canSurvive(2.0)
  );
}

export function wantMaidenAt(place: Location): boolean {
  if (!canChangeToFamiliar($familiar`Meat Shield Maiden`)) {
    return false;
  }

  const tenderizer = possessEquipment($item`can of shield tenderizer`);

  return [...auto_combat_appearance_rates(place, true)].some(
    ([mon, rate]) =>
      rate > 0 &&
      wantBlessingFrom(mon, tenderizer) &&
      expectedDamage(mon) * 2 < myMaxhp(),
  );
}
