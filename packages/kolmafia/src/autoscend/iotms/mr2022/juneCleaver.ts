import {
  availableAmount,
  canEat,
  canEquip,
  haveSkill,
  inebrietyLimit,
  itemAmount,
  Location,
  myInebriety,
  myLevel,
  myMeat,
  myPrimestat,
} from "kolmafia";
import { $item, $location, $skill, $slot, $stat, get } from "libram";

import { FireworksShop } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { auto_canDrink } from "../../auto_consume";
import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import { disregardInstantKarma } from "../../auto_powerlevel";
import {
  auto_abort,
  auto_is_valid,
  auto_runChoice,
  meatReserve,
} from "../../auto_util";
import { is_jarlsberg } from "../../paths/2013/avatar_of_jarlsberg";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";

export function canUseJuneCleaver(): boolean {
  if (
    possessEquipment($item`June cleaver`) &&
    canEquip($item`June cleaver`) &&
    auto_is_valid($item`June cleaver`)
  ) {
    return true;
  }
  return false;
}

export function juneCleaverAdventure(): boolean {
  if (!canUseJuneCleaver() || get("_juneCleaverFightsLeft") > 0) {
    return false;
  }

  if (autoEquipToSlot($slot`weapon`, $item`June cleaver`)) {
    let cleaverLoc: Location = $location`The Dire Warren`;
    if (in_koe()) {
      cleaverLoc = $location`Cobb's Knob Treasury`; // arbitrarily picked always accessible location
    }
    return autoAdv(cleaverLoc);
  }
  return false;
}

export function juneCleaverChoiceHandler(choice: number): void {
  switch (choice) {
    case 1467: // Poetic Justice
      if (
        haveSkill($skill`Tongue of the Walrus`) ||
        itemAmount($item`personal massager`) > 0
      ) {
        auto_runChoice(3); // +5 adventures, get beaten up
      } else if (
        (myPrimestat() === $stat`Mysticality` &&
          (myLevel() < 13 || disregardInstantKarma())) ||
        (myPrimestat() === $stat`Moxie` &&
          myLevel() > 12 &&
          disregardInstantKarma() === false)
      ) {
        auto_runChoice(2); // 137 myst substat
      } else {
        auto_runChoice(1); // 250 moxie substat
      }
      break;
    case 1468: // Aunts not Ants
      if (
        (myPrimestat() === $stat`Moxie` &&
          (myLevel() < 13 || disregardInstantKarma())) ||
        (myPrimestat() === $stat`Muscle` &&
          myLevel() > 12 &&
          disregardInstantKarma() === false)
      ) {
        auto_runChoice(1); // 150 moxie substat
      } else if (get("_juneCleaverSkips") < 5) {
        auto_runChoice(4); // skip
      } else {
        auto_runChoice(2); // 250 muscle substat
      }
      break;
    case 1469: // Beware of Alligators
      if (myMeat() < meatReserve()) {
        auto_runChoice(3); // 1500 meat
      } else if (
        auto_canDrink($item`Dad's brandy`) &&
        myInebriety() < inebrietyLimit()
      ) {
        auto_runChoice(2); // size 1 awesome booze
      } else {
        auto_runChoice(3); // 1500 meat
      }
      break;
    case 1470: // Teacher's Pet
      if (
        canEquip($item`teacher's pen`) &&
        availableAmount($item`teacher's pen`) < 1
      ) {
        auto_runChoice(2); // accessory, +2 fam exp, +3 stats per fight
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(3);
      } else if (get("_juneCleaverSkips") < 5) {
        auto_runChoice(4); // skip
      } else {
        auto_runChoice(2); // accessory, +2 fam exp, +3 stats per fight
      }
      break;
    case 1471: // Lost and Found
      if (
        get("sidequestNunsCompleted") === "none" &&
        !get("auto_skipNuns") &&
        itemAmount($item`savings bond`) === 0
      ) {
        auto_runChoice(1); // potion, 30 turns of 50% meat
      } else if (
        myPrimestat() === $stat`Mysticality` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(3); // 250 myst substat
      } else {
        auto_runChoice(1); // potion, 30 turns of 50% meat
      }
      break;
    case 1472: // Summer Days
      auto_runChoice(1); // potion, -5 combat rate, 30 turns

      break;
    case 1473: // Bath Time
      if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(1); // 250 muscle substat
      } else if (get("_juneCleaverSkips") < 5) {
        auto_runChoice(4); // skip
      } else {
        auto_runChoice(3); // effect, 30 turns of +3 hot res, +50% init
      }
      break;
    case 1474: // Delicious Sprouts
      if (
        canEat() &&
        myLevel() < 13 &&
        FireworksShop.have_fireworks_shop() &&
        auto_is_valid($item`red rocket`) &&
        !in_darkGyffte() &&
        !is_jarlsberg() &&
        !in_tcrs() &&
        auto_is_valid(
          //paths that can eat but can't eat guilty sprouts/won't get the stats from it anyway
          $item`guilty sprout`,
        ) &&
        itemAmount($item`guilty sprout`) === 0
      ) {
        // guilty sprout is level 8+ good size 1 food but it gives big stats, would want to use a red rocket
        auto_runChoice(2);
      }
      if (
        myPrimestat() === $stat`Mysticality` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(1); // 250 myst substat
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(3); // 138 muscle substat
      } else {
        auto_runChoice(2); // guilty sprout is level 8+ good size 1 food but it gives big stats
      }
      break;
    case 1475: // Hypnotic Master
      if (availableAmount($item`mother's necklace`) < 1) {
        auto_runChoice(1); // 3 RO adventures, 5 free rests (doesn't even need to be equipped), never fumble
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        auto_runChoice(2); // 250 muscle substat
      } else {
        auto_runChoice(1); // autosells for 1000 meat
      }
      break;
    default:
      auto_abort("unhandled choice in juneCleaverChoiceHandler");
  }
}
