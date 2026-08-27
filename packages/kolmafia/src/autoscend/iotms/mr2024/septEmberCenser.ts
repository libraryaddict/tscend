import {
  availableAmount,
  buy,
  Element,
  equippedItem,
  Item,
  myBasestat,
  myLevel,
  myPrimestat,
  numericModifier,
  Skill,
  toInt,
  use,
  useSkill,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $item,
  $location,
  $modifier,
  $slot,
  get,
} from "libram";

import { Eagle, McHugeLarge, PrismaticBeret } from "../../../types";
import { equipMaximizedGear, possessEquipment } from "../../auto_equipment";
import { provideResistances } from "../../auto_providers";
import {
  auto_ignoreExperience,
  auto_is_valid,
  auto_log_debug,
  auto_wishForEffectIfNeeded,
  stat_exp_percent,
  stat_to_substat,
  substat_to_level,
} from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_glover } from "../../paths/2018/g_lover";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import { bridgeGoal } from "../../quests/level_09";
import { maximizer } from "../../utils/maximizer";

export function haveSeptEmberCenser(): boolean {
  if (in_koe()) {
    return false; // shop is inaccessible in Kingdom of Exploathing
  }
  if (
    auto_is_valid($item`Sept-Ember Censer`) &&
    availableAmount($item`Sept-Ember Censer`) > 0
  ) {
    return true;
  }
  return false;
}

export function remainingEmbers(): number {
  if (!haveSeptEmberCenser()) {
    return 0;
  }
  if (!get("_septEmberBalanceChecked")) {
    // go to ember shop to check our balance
    use($item`Sept-Ember Censer`);
  }
  return get("availableSeptEmbers");
}

export function goingToMouthwashLevel(): boolean {
  if (!haveSeptEmberCenser()) {
    return false;
  }
  if (auto_ignoreExperience()) {
    return false;
  }
  if (in_glover() || in_bhy() || in_plumber() || in_amw()) {
    return false;
  }
  const disregard_karma: boolean = get("auto_disregardInstantKarma", false);
  // If we have at least 4 embers remaining, don't overlevel, they can be used for something else
  const happy_to_overlevel: boolean = disregard_karma && remainingEmbers() < 4;
  let want_to_mouthwash_level: boolean = myLevel() < 13 || happy_to_overlevel;
  // Even disregarding karma, never level above 15 using mouthwash as a sanity limit
  want_to_mouthwash_level = want_to_mouthwash_level && myLevel() < 15;
  return remainingEmbers() >= 2 && want_to_mouthwash_level;
}

export function buyFromSeptEmberStore(): void {
  if (!haveSeptEmberCenser()) {
    return;
  }
  if (remainingEmbers() === 0) {
    return;
  }
  // mouthwash for leveling
  const mouthwash: Item = $item`Mmm-brr! brand mouthwash`;
  McHugeLarge.openMcLargeHugeSkis(); // make sure our skis are open for cold res
  for (let imw: number = 0; imw < 3; imw++) {
    // We can use up to 3 mouthwash
    if (goingToMouthwashLevel()) {
      // get as much cold res as possible
      const resGoal: Map<Element, number> = new Map();
      resGoal.set($element`cold`, 100);
      // get cold res. Use noob cave as generic place holder
      // get 1 bembershoot to support mouthwash leveling or general quest help
      const bember: Item = $item`bembershoot`;
      if (
        remainingEmbers() % 2 === 1 &&
        !possessEquipment(bember) &&
        auto_is_valid(bember)
      ) {
        buy($coinmaster`Sept-Ember Censer`, 1, bember);
      }

      maximizer.dispose();
      provideResistances(resGoal, $location`Noob Cave`, true, true, false);
      equipMaximizedGear();
      // We could have left-hand if our off-hand is strong enough
      const cold_res_from_oh: number = numericModifier(
        equippedItem($slot`off-hand`),
        $modifier`Cold Resistance`,
      );
      // McHugeLarge outfit off-hand is +3 cold res when whole outfit equipped, but not reported by Mafia with above check
      const using_mchugelarge_oh: boolean =
        equippedItem($slot`off-hand`) === $item`McHugeLarge left pole`;
      if (using_mchugelarge_oh || cold_res_from_oh > 2.9) {
        const lefty: Skill = Skill.get("Aug. 13th: Left/Off Hander's Day!");
        if (auto_canUse(lefty) && !get("_aug13Cast")) {
          useSkill(lefty);
        }
      }

      if (expected_level_after_mouthwash() < 13) {
        // use a wish if really need it
        auto_wishForEffectIfNeeded($effect`Fever From the Flavor`);
      }
      if (expected_level_after_mouthwash() < 13) {
        // get Citizen of Outskirts of Cobb's Knob (+4 prismatic res) if we really need it
        Eagle.getCitizenZone$1("spec");
      }
      if (expected_level_after_mouthwash() < 13) {
        // Beret busk if possible for more cold res
        PrismaticBeret.beretBusk("cold resistance");
      }
      // buy mouthwash and use it
      buy($coinmaster`Sept-Ember Censer`, 1, mouthwash);
      auto_log_debug(
        `Using mouthwash with ${numericModifier($modifier`Cold Resistance`)} cold resistance`,
      );
      use(mouthwash);
    }
  }

  auto_log_debug(
    `Have ${remainingEmbers()} embers(s) to buy from Sept-Ember Censer. Let's spend them!`,
  );
  // get structural ember if can't cross bridge
  let itemConsidering: Item = $item`structural ember`;
  if (
    remainingEmbers() >= 4 &&
    get("chasmBridgeProgress") < bridgeGoal() &&
    !get("_structuralEmberUsed") &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Sept-Ember Censer`, 1, itemConsidering);
    use(itemConsidering);
  }
  // Spend any remaining pairs on Septapus summoning charms
  while (remainingEmbers() >= 2) {
    buy($coinmaster`Sept-Ember Censer`, 1, $item`Septapus summoning charm`);
  }
  // if still have embers, get hat for mp regen
  itemConsidering = $item`hat of remembering`;
  if (
    remainingEmbers() >= 1 &&
    !possessEquipment(itemConsidering) &&
    auto_is_valid(itemConsidering)
  ) {
    buy($coinmaster`Sept-Ember Censer`, 1, itemConsidering);
  }

  return;
}

function expected_mouthwash_main_substat(cold_res: number): number {
  const boost_factor: number = 1 + stat_exp_percent(myPrimestat()) / 100;
  return (boost_factor * 14 * cold_res ** 1.7) / 2;
}

export function expected_level_after_mouthwash(): number {
  return expected_level_after_mouthwash$2(
    1,
    numericModifier($modifier`Cold Resistance`),
  );
}

function expected_level_after_mouthwash$2(
  n_mouthwash: number,
  cold_res: number,
): number {
  const gained_main_substats: number =
    n_mouthwash * expected_mouthwash_main_substat(cold_res);
  const old_main_substats: number = myBasestat(stat_to_substat(myPrimestat()));
  const new_main_substats: number = old_main_substats + gained_main_substats;
  const level: number = substat_to_level(toInt(new_main_substats));
  return level;
}
