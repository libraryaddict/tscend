import {
  beretBuskingEffects,
  containsText,
  Effect,
  equippedAmount,
  getPower,
  haveEquipped,
  Item,
  myLocation,
  myPrimestat,
  numericModifier,
  Slot,
  splitString,
  toFloat,
  toInt,
  toSlot,
  useFamiliar,
  useSkill,
} from "kolmafia";
import { $effect, $familiar, $item, $items, $skill, $slot, get } from "libram";

import {
  autoForceEquip,
  autoForceEquip$2,
  possessEquipment,
  powerMultipliers,
} from "../../auto_equipment";
import { auto_have_familiar } from "../../auto_familiar";
import { auto_is_valid, handleTracker } from "../../auto_util";
import { in_hattrick } from "../../paths/2025/hattrick";

function auto_havePrismaticBeret(): boolean {
  const pb: Item = $item`prismatic beret`;
  return auto_is_valid(pb) && possessEquipment(pb);
}

export function canBusk(): boolean {
  if (get("_beretBuskingUses") < 5) {
    return true;
  }
  return false;
}

function beretPower(
  allHats: Map<number, Item>,
  allShirts: Map<number, Item>,
  allPants: Map<number, Item>,
): Map<string, number> {
  const multipliers: Map<Slot, number> = powerMultipliers();
  const hatPowers: Map<number, number> = new Map();
  hatPowers.set(0, 0);
  const pantPowers: Map<number, number> = new Map();
  pantPowers.set(0, 0);
  const shirtPowers: Map<number, number> = new Map();
  shirtPowers.set(0, 0);
  const powers: Map<string, number> = new Map();
  //possible power calculations
  if (!in_hattrick()) {
    if (auto_have_familiar($familiar`Mad Hatrack`)) {
      //prismatic beret on the hatrack and another hat on you
      for (const [, h] of allHats) {
        hatPowers.set(
          hatPowers.size,
          getPower(h) * (multipliers.get($slot`hat`) ?? 0),
        );
      }
    } else {
      hatPowers.set(
        0,
        getPower($item`prismatic beret`) * (multipliers.get($slot`hat`) ?? 0),
      );
    }
  } else {
    for (const [, h] of allHats) {
      if (equippedAmount(h) >= 1) {
        hatPowers.set(
          0,
          (hatPowers.get(0) ?? 0) +
            getPower(h) * (multipliers.get($slot`hat`) ?? 0),
        );
      }
    }
  }
  for (const [, p] of allPants) {
    pantPowers.set(
      pantPowers.size,
      getPower(p) * (multipliers.get($slot`pants`) ?? 0),
    );
  }
  for (const [, s] of allShirts) {
    shirtPowers.set(shirtPowers.size, getPower(s));
  }
  for (const [, hp] of hatPowers) {
    for (const [, pp] of pantPowers) {
      for (const [, sp] of shirtPowers) {
        const concat: string = `${auto_have_familiar($familiar`Mad Hatrack`) ? `${(hp / (multipliers.get($slot`hat`) ?? 0)).toString()},` : ""}${(pp / (multipliers.get($slot`pants`) ?? 0)).toString()},${sp.toString()}`;
        powers.set(concat, hp + pp + sp);
      }
    }
  }
  return powers;
}

function bestBusk(
  powers: Map<string, number>,
  effectMultiplier: string,
): string {
  //effectMultiplier string should be in format of "modifier1:float;modifier2:float;..." if multiple modifiers
  //if single modifier, does not need a multiplier
  //Do not use an ending ; for effectMultiplier
  if (!auto_havePrismaticBeret()) {
    return (0).toString();
  }
  const busksUsed: number = get("_beretBuskingUses");
  let highScore: number = 0.0;
  let highScoreString: string = "";
  let effMulti: Map<string, number> = new Map();
  let numMod: Map<number, string>;
  if (effectMultiplier === "") {
    //based on default maximizer string
    effMulti = new Map([
      ["item drop", 5],
      ["meat drop", 1],
      ["initiative", 0.5],
      ["damage absorption", 0.1],
      ["damage resistance", 1],
      ["Cold Resistance", 0.5],
      ["Hot Resistance", 0.5],
      ["Sleaze Resistance", 0.5],
      ["Stench Resistance", 0.5],
      ["Spooky Resistance", 0.5],
      [myPrimestat().toString(), 1.5],
      ["-fumble", 0],
      ["hp", 0.4],
      ["mp", 0.2],
      ["mp regen", 3],
      ["familiar weight", 2],
      ["familiar experience", 5],
    ]);
  } else {
    if (containsText(effectMultiplier, ";")) {
      //split effectMultiplier into multiple effects if needed
      for (const [, str] of splitString(effectMultiplier, ";").entries()) {
        numMod = new Map(splitString(str, ":").map((_v, _i) => [_i, _v]));
        effMulti.set(numMod.get(1) ?? "", toFloat(numMod.get(0) ?? ""));
      }
    } else if (containsText(effectMultiplier, ":")) {
      numMod = new Map(
        splitString(effectMultiplier, ":").map((_v, _i) => [_i, _v]),
      );
      effMulti.set(numMod.get(1) ?? "", toFloat(numMod.get(0) ?? ""));
    } else {
      effMulti.set(effectMultiplier, 5.0);
    }
  }
  for (const [powerstring, power] of powers) {
    //Evaluate all power combinations calculated in beretPower to find the highest scoring one after multiplier is applied
    let score: number = 0.0;
    const buskingEffects: Map<Effect, number> = new Map(
      Object.entries(beretBuskingEffects(toInt(power), busksUsed)).map(
        ([_k, _v]) => [Effect.get(_k), _v],
      ),
    );
    for (const [eff] of buskingEffects) {
      if (eff !== $effect.none) {
        for (const [mod, multi] of effMulti) {
          score += numericModifier(eff, mod) * multi;
        }
      }
    }
    if (score > highScore) {
      highScore = score;
      highScoreString = powerstring;
    }
  }
  if (highScore > 0) {
    return highScoreString;
  }
  return "";
}

export function beretBusk(effectMultiplier: string): boolean {
  if (!auto_havePrismaticBeret() || !canBusk()) {
    return false;
  }
  const multipliers: Map<Slot, number> = powerMultipliers();
  const allHats: Map<number, Item> = new Map();
  const allShirts: Map<number, Item> = new Map();
  const allPants: Map<number, Item> = new Map();
  const bestBuskHROffset: number = auto_have_familiar($familiar`Mad Hatrack`)
    ? 0
    : 1;
  let buskPower: number = 0;
  for (const it of $items.all()) {
    //only record items we have
    if (possessEquipment(it)) {
      switch (toSlot(it)) {
        case $slot`hat`:
          allHats.set(allHats.size, it);
          break;
        case $slot`shirt`:
          allShirts.set(allShirts.size, it);
          break;
        case $slot`pants`:
          allPants.set(allPants.size, it);
          break;
        default:
          continue;
      }
    }
  }
  const powers: Map<string, number> = beretPower(allHats, allShirts, allPants);
  const bestBuskPowers: string = bestBusk(powers, effectMultiplier);
  if (bestBuskPowers === "") {
    return false;
  }
  const bestBuskPowersSplit: Map<number, string> = new Map(
    splitString(bestBuskPowers, ",").map((_v, _i) => [_i, _v]),
  );
  if (!in_hattrick()) {
    if (auto_have_familiar($familiar`Mad Hatrack`)) {
      for (const [, hat] of allHats) {
        if (
          getPower(hat) === toInt(bestBuskPowersSplit.get(0) ?? "") &&
          hat !== $item`prismatic beret`
        ) {
          //equip the hat and put the beret on the Hatrack to be able to busk
          autoForceEquip$2(hat, true);
          buskPower += getPower(hat) * (multipliers.get($slot`hat`) ?? 0);
          if (useFamiliar($familiar`Mad Hatrack`)) {
            //Force the beret to the Hatrack if we were able to use the Hatrack.
            autoForceEquip($slot`familiar`, $item`prismatic beret`, true);
          }
          break;
        } else if (hat === $item`prismatic beret`) {
          //don't equip the beret yet, in case there is another 10 power hat to wear
          continue;
        }
      }
    }
    if (!haveEquipped($item`prismatic beret`)) {
      //equip the beret if it is not equipped anywhere else
      autoForceEquip($slot`hat`, $item`prismatic beret`, true);
      buskPower +=
        getPower($item`prismatic beret`) * (multipliers.get($slot`hat`) ?? 0);
    }
  } else {
    //get the power of all hats equipped in Hat Trick
    for (const [, h] of allHats) {
      if (equippedAmount(h) > 0) {
        buskPower += getPower(h) * (multipliers.get($slot`hat`) ?? 0);
      }
    }
  }
  if (allPants.size > 0) {
    //only check if we have pants available
    if (toInt(bestBuskPowersSplit.get(1 - bestBuskHROffset) ?? "") === 0) {
      autoForceEquip($slot`pants`, $item.none, true);
    } else {
      for (const [, pant] of allPants) {
        if (
          getPower(pant) ===
          toInt(bestBuskPowersSplit.get(1 - bestBuskHROffset) ?? "")
        ) {
          autoForceEquip$2(pant, true);
          buskPower += getPower(pant) * (multipliers.get($slot`pants`) ?? 0);
          break;
        }
      }
    }
  }
  if (allShirts.size > 0) {
    //only check if we have shirts available
    if (toInt(bestBuskPowersSplit.get(2 - bestBuskHROffset) ?? "") === 0) {
      autoForceEquip($slot`shirt`, $item.none, true);
    } else {
      for (const [, shirt] of allShirts) {
        if (
          getPower(shirt) ===
          toInt(bestBuskPowersSplit.get(2 - bestBuskHROffset) ?? "")
        ) {
          autoForceEquip$2(shirt, true);
          buskPower += getPower(shirt);
          break;
        }
      }
    }
  }

  if (useSkill(1, $skill`Beret Busking`)) {
    handleTracker({
      what: $item`prismatic beret`,
      location: myLocation(),
      detail: `Beret busk ${get("_beretBuskingUses")} at ${buskPower} power`,
      property: "auto_otherstuff",
    });
    return true;
  }

  return false;
}
