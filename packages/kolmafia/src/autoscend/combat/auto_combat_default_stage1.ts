import {
  abort,
  containsText,
  haveEffect,
  haveEquipped,
  Item,
  itemAmount,
  itemDropsArray,
  Monster,
  monsterPhylum,
  myAdventures,
  myClass,
  myHp,
  myLocation,
  myMaxhp,
  steal,
  toFloat,
} from "kolmafia";
import {
  $classes,
  $effect,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  get,
} from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import {
  auto_have_skill,
  auto_wantToBanish,
  effectiveDropChance,
  handleTracker,
  isFreeMonster,
  safeGet,
} from "../auto_util";
import { auto_backupTarget } from "../iotms/2020/mr2021";
import {
  auto_canCircadianRhythm,
  auto_canHabitat,
  auto_canRWBBlast,
  auto_circadianRhythmTarget,
  auto_circadianRhythmTarget$1,
  auto_getCitizenZone,
  auto_habitatTarget,
  auto_remainingCandyCaneSlashes,
  auto_RWBBlastTarget,
} from "../iotms/2020/mr2023";
import { auto_talkToSomeFish, auto_tracesTarget } from "../iotms/2020/mr2025";
import { auto_baseballShouldReplaceWithFish } from "../iotms/2020/mr2026";
import { in_nuclear } from "../paths/2016/nuclear_autumn";
import { in_plumber } from "../paths/2020/path_of_the_plumber";
import { ag_is_bodyguard, in_avantGuard } from "../paths/2024/avant_guard";
import { in_amw } from "../paths/2026/adventurer_meats_world";
import { inAftercore } from "../paths/casual";
import {
  auto_canUse,
  auto_shouldHeartstoneStealInstead,
  auto_useSkill,
  canSurvive,
  canUse$3,
  combat_status_add,
  combat_status_check,
  markAsUsed$1,
  useItem,
} from "./auto_combat_util";
import { amw_wanttoPP } from "./paths/auto_combat_adventurer_meats_world";
import { auto_combatBHYStage1 } from "./paths/auto_combat_bees_hate_you";
import { auto_combatDisguisesStage1 } from "./paths/auto_combat_disguises_delimit";
import { auto_combatFallOfTheDinosaursStage1 } from "./paths/auto_combat_fall_of_the_dinosaurs";
import { auto_combatHeavyRainsStage1 } from "./paths/auto_combat_heavy_rains";
import { auto_combatExploathingStage1 } from "./paths/auto_combat_kingdom_of_exploathing";
import { auto_combat_nanorhinoBuff } from "./paths/auto_combat_mr2012";
import { auto_combatPeteStage1 } from "./paths/auto_combat_pete";
import { auto_combatTheSourceStage1 } from "./paths/auto_combat_the_source";
import { auto_combatWereProfessorStage1 } from "./paths/auto_combat_wereprofessor";
import { auto_combatWildfireStage1 } from "./paths/auto_combat_wildfire";

//defined in /autoscend/combat/auto_combat_default_stage1.ash
export function auto_combatDefaultStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  // Path = Heavy Rains
  let retval: CombatMacroReturns = auto_combatHeavyRainsStage1(
    round_1,
    enemy,
    text,
  );
  if (retval !== undefined) {
    return retval;
  }
  // Path = The Source
  retval = auto_combatTheSourceStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = Kingdom of Exploathing
  retval = auto_combatExploathingStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = Avatar of Sneaky Pete
  retval = auto_combatPeteStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = Bees Hate You
  retval = auto_combatBHYStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = Disguises Delimit
  retval = auto_combatDisguisesStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = wildfire
  retval = auto_combatWildfireStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = Fall of the Dinosaurs
  retval = auto_combatFallOfTheDinosaursStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  // Path = WereProfessor
  retval = auto_combatWereProfessorStage1(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  //In Avant Guard, waffle the bodyguard in Themthar Hills ASAP to replace with the Dirty Thieving Brigand
  if (
    in_avantGuard() &&
    ag_is_bodyguard() &&
    itemAmount($item`waffle`) > 0 &&
    myLocation() === $location`The Themthar Hills` &&
    enemy !== $monster`dirty thieving brigand`
  ) {
    handleTracker({
      what: enemy,
      detail: $item`waffle`.toString(),
      property: "auto_replaces",
    });
    return useItem($item`waffle`);
  }

  if (enemy === $monster`Your Shadow`) {
    if (in_amw() && auto_canUse($skill`Chew the Fat`, false)) {
      return auto_useSkill($skill`Chew the Fat`, false);
    }
    if (in_plumber()) {
      if (itemAmount($item`super deluxe mushroom`) > 0) {
        return $item`super deluxe mushroom`;
      }
      abort(
        "Oh no, I don't have any super deluxe mushrooms to deal with this shadow plumber :(",
      );
    }
    const ambi: boolean = auto_have_skill($skill`Ambidextrous Funkslinging`);
    let hand_1: Item = $item.none;
    let hand_2: Item = $item.none;
    const icup: Item = $item`Rain-Doh indigo cup`; //restore 20% of max HP. only once per combat
    if (canUse$3(icup)) {
      if (myMaxhp() > 500 && hand_1 === $item.none) {
        markAsUsed$1(icup);
        hand_1 = icup;
      } else if (ambi && myMaxhp() > 250 && hand_1 === $item.none) {
        markAsUsed$1(icup);
        hand_1 = icup;
      }
    }
    //items which can be used multiple times per combat
    for (const it of $items`gauze garter, filthy poultice, red pixel potion`) {
      if (hand_1 === $item.none && itemAmount(it) > 0) {
        hand_1 = it;
      }
      if (hand_2 === $item.none) {
        if (itemAmount(it) > 1) {
          hand_2 = it;
        } else if (itemAmount(it) > 0 && hand_1 !== it) {
          hand_2 = it;
        }
      }
    }

    if (ambi && hand_1 !== $item.none && hand_2 !== $item.none) {
      return [hand_1, hand_2];
    }
    if (hand_1 !== $item.none) {
      return [hand_1];
    }
    if (itemAmount($item`scented massage oil`) === 0) {
      abort("Uh oh, I ran out of healing items to use against your shadow");
    } else {
      abort(
        "Uh oh, I ran out of simple healing items to use against your shadow. You could win manually with Scented Massage oil though.",
      );
    }
  }

  if (enemy === $monster`wall of meat`) {
    if (auto_canUse($skill`Make it Rain`)) {
      return auto_useSkill($skill`Make it Rain`);
    }
  }

  if (enemy === $monster`wall of skin`) {
    if (itemAmount($item`beehive`) > 0) {
      return $item`beehive`;
    }

    if (auto_canUse($skill`Shell Up`) && round_1 >= 3) {
      return auto_useSkill($skill`Shell Up`);
    }

    if (auto_canUse($skill`Sauceshell`) && round_1 >= 4) {
      return auto_useSkill($skill`Sauceshell`);
    }

    if (auto_canUse($skill`Belch The Rainbow`, false)) {
      return auto_useSkill($skill`Belch The Rainbow`, false);
    }

    if (auto_canUse($skill`Kneebutt`, false)) {
      return auto_useSkill($skill`Kneebutt`, false);
    }
    if (auto_canUse($skill`Headbutt`, false)) {
      return auto_useSkill($skill`Headbutt`, false);
    }
    return "attack";
  }

  if (enemy === $monster`wall of bones`) {
    if (itemAmount($item`electric boning knife`) > 0) {
      return $item`electric boning knife`;
    }
    if (myHp() * 4 < myMaxhp() && haveEffect($effect`Takin' It Greasy`) > 0) {
      return auto_useSkill($skill`Unleash the Greash`, false);
    }

    if (
      auto_canUse($skill`Surprisingly Sweet Slash`, true) &&
      auto_remainingCandyCaneSlashes() > 0
    ) {
      return auto_useSkill($skill`Surprisingly Sweet Slash`, true);
    }

    if (auto_canUse($skill`Garbage Nova`, false)) {
      return auto_useSkill($skill`Garbage Nova`, false);
    }

    if (auto_canUse($skill`Saucegeyser`, false)) {
      return auto_useSkill($skill`Saucegeyser`);
    }
  }
  //nanorhino familiar buff acquisition. Must be the first action taken in combat.
  //done after puzzle bosses. if puzzle bosses get a random buff that is ok, we would rather beat the puzzle boss.
  retval = auto_combat_nanorhinoBuff(round_1, enemy, text);
  if (retval !== undefined) {
    return retval;
  }
  //pickpocket. do this after puzzle bosses but before escapes/instakills
  const ableToPickpocket: boolean =
    $classes`Accordion Thief, Avatar of Sneaky Pete, Disco Bandit, Gelatinous Noob`.includes(
      myClass(),
    ) ||
    haveEffect($effect`Riboflavin'`) > 0 ||
    amw_wanttoPP();
  if (
    !combat_status_check("pickpocket") &&
    ableToPickpocket &&
    containsText(text, 'value="Pick') &&
    canSurvive(4.0)
  ) {
    let tryIt: boolean = false;
    for (const [, drop] of itemDropsArray(enemy).entries()) {
      if (drop.type === "0") {
        tryIt = true;
      }
      if (
        drop.rate > 0 &&
        drop.type !== "n" &&
        drop.type !== "c" &&
        drop.type !== "b"
      ) {
        tryIt = true;
      }
      if (tryIt) {
        if (auto_have_skill($skill`Sticky Fingers`) && canSurvive(8.0)) {
          //free meat, tryIt
        } else if (
          drop.type !== "p" &&
          effectiveDropChance(drop.drop, toFloat(drop.rate)) >= 100
        ) {
          tryIt = false; //don't need to pickpocket if capped drop chance
        }
        if (tryIt) {
          break;
        }
      }
    }
    if (tryIt) {
      combat_status_add("pickpocket");
      steal();
      return "pickpocket";
    }
  }

  if (
    auto_canCircadianRhythm() &&
    (auto_circadianRhythmTarget(enemy) ||
      auto_circadianRhythmTarget$1(monsterPhylum(enemy))) &&
    auto_canUse($skill`Recall Facts: %phylum Circadian Rhythms`) &&
    !ag_is_bodyguard()
  ) {
    handleTracker({
      what: $skill`Recall Facts: %phylum Circadian Rhythms`,
      detail: monsterPhylum(enemy).toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Recall Facts: %phylum Circadian Rhythms`);
  }

  if (
    auto_canHabitat() &&
    auto_habitatTarget(enemy) &&
    auto_canUse($skill`Recall Facts: Monster Habitats`) &&
    !ag_is_bodyguard()
  ) {
    handleTracker({
      what: $skill`Recall Facts: Monster Habitats`,
      detail: enemy.toString(),
      property: "auto_copies",
    });
    return auto_useSkill($skill`Recall Facts: Monster Habitats`);
  }

  if (
    auto_tracesTarget(enemy) &&
    auto_canUse($skill`Create an Afterimage`) &&
    !ag_is_bodyguard()
  ) {
    handleTracker({
      what: $skill`Create an Afterimage`,
      detail: enemy.toString(),
      property: "auto_copies",
    });
    combat_status_add("copied");
    return auto_useSkill($skill`Create an Afterimage`);
  }

  if (
    auto_canRWBBlast() &&
    auto_RWBBlastTarget(enemy) &&
    auto_canUse($skill`%fn, fire a Red, White and Blue Blast`)
  ) {
    handleTracker({
      what: $skill`%fn, fire a Red, White and Blue Blast`,
      detail: enemy.toString(),
      property: "auto_copies",
    });
    return auto_useSkill($skill`%fn, fire a Red, White and Blue Blast`);
  }

  const backedUpMonster: Monster = safeGet("lastCopyableMonster");
  // reserve last 2 advs for end of day free fights
  const reserveAdvsForFreeFights: boolean =
    myAdventures() < 3 && !isFreeMonster(backedUpMonster);
  if (
    auto_backupTarget() &&
    enemy !== backedUpMonster &&
    auto_canUse($skill`Back-Up to your Last Enemy`) &&
    !reserveAdvsForFreeFights
  ) {
    if (auto_shouldHeartstoneStealInstead()) {
      return auto_useSkill($skill`Steal Monster's Heart`);
    }
    handleTracker({
      what: enemy,
      detail: $skill`Back-Up to your Last Enemy`.toString(),
      property: "auto_replaces",
    });
    handleTracker({
      what: backedUpMonster,
      detail: $skill`Back-Up to your Last Enemy`.toString(),
      property: "auto_copies",
    });
    return auto_useSkill($skill`Back-Up to your Last Enemy`);
  }
  //saber copy (iotm) is different from other copies in that it comes with a free escape
  //technically it is an ender. but one that should be run before duplications.
  //2023 update: no longer saber copy blooper due to 8-bit realm changes. Leaving commented so there is an example of how to saber copy
  //if(canUse($skill[Use the Force]) && (auto_saberChargesAvailable() > 0) && (enemy !== auto_saberCurrentMonster()))
  //{
  //	if(enemy===$monster[Blooper] && needDigitalKey())
  //	{
  //		handleTracker({ what: enemy, detail: $skill[Use the Force], property: "auto_copies" });
  //		return auto_combatSaberCopy();
  //	}
  //}
  //[Melodramedary] familiar skill which turns monster into a group of 2. Should be done before deleveling.
  if (
    $monsters`pygmy bowler, bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, red butler`.includes(
      enemy,
    ) &&
    auto_canUse($skill`%fn, spit on them!`)
  ) {
    handleTracker({
      what: $skill`%fn, spit on them!`,
      detail: enemy.toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`%fn, spit on them!`, true);
  }
  //[Patriotic Eagle] familiar skill that gives a useful buff
  if (auto_canUse($skill`%fn, let's pledge allegiance to a Zone`)) {
    auto_getCitizenZone(myLocation(), true);
    return auto_useSkill($skill`%fn, let's pledge allegiance to a Zone`, true);
  }
  //duplicate turns the enemy from a single enemy into a mob containing 2 copies of this enemy. Doubling their stats and doubling their drops
  if (
    auto_canUse($skill`Duplicate`) &&
    get("_sourceTerminalDuplicateUses") === 0 &&
    !inAftercore() &&
    !in_nuclear()
  ) {
    if ($monsters`dairy goat`.includes(enemy)) {
      return auto_useSkill($skill`Duplicate`);
    }
  }
  //convert enemy into a scaling fish monster
  if (
    (auto_talkToSomeFish(myLocation(), enemy) ||
      // I'm too lazy at this time as this should be harmless, but the baseball check has a lot of overlap it feels like with the normal check
      (auto_baseballShouldReplaceWithFish(myLocation(), enemy) &&
        auto_wantToBanish(enemy, myLocation()))) &&
    auto_have_skill($skill`Sea *dent: Talk to Some Fish`)
  ) {
    if (auto_shouldHeartstoneStealInstead()) {
      return auto_useSkill($skill`Steal Monster's Heart`);
    }
    handleTracker({
      what: enemy,
      location: myLocation(),
      detail: $skill`Sea *dent: Talk to Some Fish`.toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Sea *dent: Talk to Some Fish`);
  }
  //these special conditions make it impossible to do anything but attack with weapon.
  if (haveEffect($effect`Temporary Amnesia`) > 0) {
    return "attack";
  }
  if (haveEquipped($item`Drunkula's wineglass`)) {
    return "attack";
  }

  return undefined;
}
