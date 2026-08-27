import {
  equippedItem,
  Familiar,
  fullnessLimit,
  haveEquipped,
  haveFamiliar,
  inHardcore,
  Item,
  itemAmount,
  myAdventures,
  myFullness,
  myLevel,
  myPrimestat,
  numericModifier,
  Skill,
  toInt,
  useFamiliar,
  useSkill,
  weaponHands,
} from "kolmafia";
import { $familiar, $item, $modifier, $skill, $slot, $stat, get } from "libram";

import { fullness_left, inebriety_left } from "../../auto_consume";
import {
  equipRollover,
  is_watch,
  simMaximizeWith,
  simValue,
} from "../../auto_equipment";
import {
  auto_needsGoodFamiliarEquipment,
  findNonRockFamiliarInTerrarium,
  findRockFamiliarInTerrarium,
  is100FamRun,
  isAttackFamiliar,
  pathHasFamiliar,
} from "../../auto_familiar";
import { auto_is_valid, auto_turbo, safeGet, wrap_item } from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";
import { in_small } from "../../paths/2023/small";
import { in_avantGuard } from "../../paths/2024/avant_guard";

let $_auto_haveAugustScepter_scepter: Item | undefined;

export function auto_haveAugustScepter(): boolean {
  $_auto_haveAugustScepter_scepter ??= wrap_item($item`august scepter`);
  if (
    auto_is_valid($_auto_haveAugustScepter_scepter) &&
    (itemAmount($_auto_haveAugustScepter_scepter) > 0 ||
      haveEquipped($_auto_haveAugustScepter_scepter))
  ) {
    return true;
  }
  return false;
}

export function auto_scepterSkills(): void {
  if (!auto_haveAugustScepter()) {
    return;
  }

  if (auto_canUse($skill`Aug. 24th: Waffle Day!`) && !get("_aug24Cast")) {
    useSkill($skill`Aug. 24th: Waffle Day!`); //get some waffles to hopefully change some bad monsters to better ones
  }
  if (
    auto_canUse($skill`Aug. 28th: Race Your Mouse Day!`) &&
    !get("_aug28Cast") &&
    pathHasFamiliar()
  ) {
    const hundred_fam: Familiar = safeGet("auto_100familiar");
    if (
      ((in_avantGuard() && inHardcore()) ||
        (hundred_fam !== $familiar.none &&
          (isAttackFamiliar(hundred_fam) || hundred_fam.block))) &&
      haveFamiliar(findRockFamiliarInTerrarium())
    ) {
      useFamiliar(findRockFamiliarInTerrarium());
      useSkill($skill`Aug. 28th: Race Your Mouse Day!`); //Fam equipment to lower weight of attack familiar or Burly bodyguard (Avant Guard) for Gremlins
    } else if (auto_needsGoodFamiliarEquipment() || in_small()) {
      if (!is100FamRun()) {
        useFamiliar(findNonRockFamiliarInTerrarium()); //equip non-rock fam to ensure we get tiny gold medal
      } else {
        useFamiliar(hundred_fam); // assuming non-rock familiar
      }
      useSkill($skill`Aug. 28th: Race Your Mouse Day!`); //Fam equipment
    }
  }
  //see how much mana cost reduction we can get (up to 3mp)
  simMaximizeWith((m) => m.weight($modifier`Mana Cost`, -1000));

  const manaCostMaximize: number = toInt(simValue($modifier`Mana Cost`));
  if (!auto_turbo()) {
    if (
      manaCostMaximize < 3 &&
      auto_canUse($skill`Aug. 30th: Beach Day!`) &&
      !get("_aug30Cast") &&
      get("_augSkillsCast") < 5
    ) {
      useSkill($skill`Aug. 30th: Beach Day!`); //For -MP (and Rollover Adventures)
    }
  }
}

export function auto_scepterRollover(): void {
  //We don't want the baywatch if our accessory slots are already filled with > 7 adventure items or we if one of the slots is the counterclockwise watch
  const noWatch: boolean =
    (numericModifier(equippedItem($slot`acc1`), "Adventures") >= 7 &&
      numericModifier(equippedItem($slot`acc2`), "Adventures") >= 7 &&
      numericModifier(equippedItem($slot`acc3`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc1`)) &&
      numericModifier(equippedItem($slot`acc1`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc2`)) &&
      numericModifier(equippedItem($slot`acc2`), "Adventures") >= 7) ||
    (is_watch(equippedItem($slot`acc3`)) &&
      numericModifier(equippedItem($slot`acc3`), "Adventures") >= 7);
  if (
    !noWatch &&
    auto_canUse($skill`Aug. 30th: Beach Day!`) &&
    !get("_aug30Cast") &&
    get("_augSkillsCast") < 5
  ) {
    useSkill($skill`Aug. 30th: Beach Day!`); //For Rollover adventures (and -MP)
    equipRollover(true);
  }
  //Get mainstats
  if (get("_augSkillsCast") < 5 && myLevel() < 13) {
    if (
      auto_canUse($skill`Aug. 12th: Elephant Day!`) &&
      !get("_aug12Cast") &&
      myPrimestat() === $stat`Muscle`
    ) {
      useSkill($skill`Aug. 12th: Elephant Day!`); //get muscle stubstats
    }
    if (
      auto_canUse($skill`Aug. 11th: Presidential Joke Day!`) &&
      !get("_aug11Cast") &&
      myPrimestat() === $stat`Mysticality`
    ) {
      useSkill($skill`Aug. 11th: Presidential Joke Day!`); //get mysticality stubstats
    }
    if (
      auto_canUse($skill`Aug. 23rd: Ride the Wind Day!`) &&
      !get("_aug23Cast") &&
      myPrimestat() === $stat`Moxie`
    ) {
      useSkill($skill`Aug. 23rd: Ride the Wind Day!`); //get moxies stubstats
    }
  }
  if (
    auto_canUse(Skill.get("Aug. 13th: Left/Off Hander's Day!")) &&
    !get("_aug13Cast") &&
    get("_augSkillsCast") < 5 &&
    numericModifier(equippedItem($slot`off-hand`), "Adventures") > 0 &&
    weaponHands(equippedItem($slot`off-hand`)) === 0
  ) {
    useSkill(Skill.get("Aug. 13th: Left/Off Hander's Day!")); //bump up the off-hand
  }
  if (
    auto_canUse($skill`Aug. 27th: Just Because Day!`) &&
    !get("_aug27Cast") &&
    get("_augSkillsCast") < 5
  ) {
    useSkill($skill`Aug. 27th: Just Because Day!`); //3 random buffs
  }
}

export function auto_lostStomach(force: boolean): void {
  if (!auto_haveAugustScepter() || in_small() || fullnessLimit() === 0) {
    return;
  }
  //Cast Roller Coaster Day if forced to and fullness is greater than 0 and it's available to cast
  if (
    force &&
    myFullness() > 0 &&
    get("_augSkillsCast") < 5 &&
    !get("_aug16Cast")
  ) {
    useSkill($skill`Aug. 16th: Roller Coaster Day!`);
  }
  //Otherwise leave Roller Coaster Day until near the end of the day and it's available to cast
  if (
    fullness_left() === 0 &&
    inebriety_left() === 0 &&
    myAdventures() < 10 &&
    get("_augSkillsCast") < 5 &&
    !get("_aug16Cast") &&
    !force
  ) {
    useSkill($skill`Aug. 16th: Roller Coaster Day!`);
  }
}
