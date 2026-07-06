import {
  abort,
  containsText,
  getProperty,
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
  toInt,
  toMonster,
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
} from "libram";

import {
  auto_have_skill,
  effectiveDropChance,
  handleTracker$1,
  isFreeMonster,
} from "../auto_util";
import { auto_backupTarget } from "../iotms/mr2021";
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
} from "../iotms/mr2023";
import { auto_talkToSomeFish } from "../iotms/mr2025";
import { in_amw } from "../paths/adventurer_meats_world";
import { ag_is_bodyguard, in_avantGuard } from "../paths/avant_guard";
import { inAftercore } from "../paths/casual";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_plumber } from "../paths/path_of_the_plumber";
import { amw_wanttoPP } from "./auto_combat_adventurer_meats_world";
import { auto_combatBHYStage1 } from "./auto_combat_bees_hate_you";
import { auto_combatDisguisesStage1 } from "./auto_combat_disguises_delimit";
import { auto_combatFallOfTheDinosaursStage1 } from "./auto_combat_fall_of_the_dinosaurs";
import { auto_combatHeavyRainsStage1 } from "./auto_combat_heavy_rains";
import { auto_combatExploathingStage1 } from "./auto_combat_kingdom_of_exploathing";
import { auto_combat_nanorhinoBuff } from "./auto_combat_mr2012";
import { auto_combatPeteStage1 } from "./auto_combat_pete";
import { auto_combatTheSourceStage1 } from "./auto_combat_the_source";
import {
  canSurvive$1,
  canUse$1,
  canUse$2,
  canUse$4,
  combat_status_add,
  combat_status_check,
  markAsUsed$1,
  useItems$1,
  useSkill$1,
  useSkill$2,
} from "./auto_combat_util";
import { auto_combatWereProfessorStage1 } from "./auto_combat_wereprofessor";
import { auto_combatWildfireStage1 } from "./auto_combat_wildfire";

//defined in /autoscend/combat/auto_combat_default_stage1.ash
export function auto_combatDefaultStage1(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
  let retval: string = "";
  // Path = Heavy Rains
  retval = auto_combatHeavyRainsStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = The Source
  retval = auto_combatTheSourceStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Kingdom of Exploathing
  retval = auto_combatExploathingStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Avatar of Sneaky Pete
  retval = auto_combatPeteStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Bees Hate You
  retval = auto_combatBHYStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Disguises Delimit
  retval = auto_combatDisguisesStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = wildfire
  retval = auto_combatWildfireStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Fall of the Dinosaurs
  retval = auto_combatFallOfTheDinosaursStage1(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = WereProfessor
  retval = auto_combatWereProfessorStage1(round_1, enemy, text);
  if (retval !== "") {
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
    handleTracker$1(
      enemy.toString(),
      $item`waffle`.toString(),
      "auto_replaces",
    );
    return useItems$1($item`waffle`, Item.none);
  }

  if (enemy === $monster`Your Shadow`) {
    if (in_amw() && canUse$1($skill`Chew the Fat`, false)) {
      return useSkill$1($skill`Chew the Fat`, false);
    }
    if (in_plumber()) {
      if (itemAmount($item`super deluxe mushroom`) > 0) {
        return `item ${$item`super deluxe mushroom`}`;
      }
      abort(
        "Oh no, I don't have any super deluxe mushrooms to deal with this shadow plumber :(",
      );
    }
    const ambi: boolean = auto_have_skill($skill`Ambidextrous Funkslinging`);
    let hand_1: Item = Item.none;
    let hand_2: Item = Item.none;
    const icup: Item = $item`Rain-Doh indigo cup`; //restore 20% of max HP. only once per combat
    if (canUse$4(icup)) {
      if (myMaxhp() > 500 && hand_1 === Item.none) {
        markAsUsed$1(icup);
        hand_1 = icup;
      } else if (ambi && myMaxhp() > 250 && hand_1 === Item.none) {
        markAsUsed$1(icup);
        hand_1 = icup;
      }
    }
    //items which can be used multiple times per combat
    for (const it of $items`gauze garter, filthy poultice, red pixel potion`) {
      if (hand_1 === Item.none && itemAmount(it) > 0) {
        hand_1 = it;
      }
      if (hand_2 === Item.none) {
        if (itemAmount(it) > 1) {
          hand_2 = it;
        } else if (itemAmount(it) > 0 && hand_1 !== it) {
          hand_2 = it;
        }
      }
    }

    if (ambi && hand_1 !== Item.none && hand_2 !== Item.none) {
      return `item ${hand_1}, ${hand_2}`;
    }
    if (hand_1 !== Item.none) {
      return `item ${hand_1}`;
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
    if (canUse$2($skill`Make it Rain`)) {
      return useSkill$2($skill`Make it Rain`);
    }
  }

  if (enemy === $monster`wall of skin`) {
    if (itemAmount($item`beehive`) > 0) {
      return `item ${$item`beehive`}`;
    }

    if (canUse$2($skill`Shell Up`) && round_1 >= 3) {
      return useSkill$2($skill`Shell Up`);
    }

    if (canUse$2($skill`Sauceshell`) && round_1 >= 4) {
      return useSkill$2($skill`Sauceshell`);
    }

    if (canUse$1($skill`Belch The Rainbow`, false)) {
      return useSkill$1($skill`Belch The Rainbow`, false);
    }

    if (canUse$1($skill`Kneebutt`, false)) {
      return useSkill$1($skill`Kneebutt`, false);
    }
    if (canUse$1($skill`Headbutt`, false)) {
      return useSkill$1($skill`Headbutt`, false);
    }
    return "attack with weapon";
  }

  if (enemy === $monster`wall of bones`) {
    if (itemAmount($item`electric boning knife`) > 0) {
      return `item ${$item`electric boning knife`}`;
    }
    if (myHp() * 4 < myMaxhp() && haveEffect($effect`Takin' It Greasy`) > 0) {
      return useSkill$1($skill`Unleash the Greash`, false);
    }

    if (
      canUse$1($skill`Surprisingly Sweet Slash`, true) &&
      auto_remainingCandyCaneSlashes() > 0
    ) {
      return useSkill$1($skill`Surprisingly Sweet Slash`, true);
    }

    if (canUse$1($skill`Garbage Nova`, false)) {
      return useSkill$1($skill`Garbage Nova`, false);
    }

    if (canUse$1($skill`Saucegeyser`, false)) {
      return useSkill$2($skill`Saucegeyser`);
    }
  }
  //nanorhino familiar buff acquisition. Must be the first action taken in combat.
  //done after puzzle bosses. if puzzle bosses get a random buff that is ok, we would rather beat the puzzle boss.
  retval = auto_combat_nanorhinoBuff(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  //pickpocket. do this after puzzle bosses but before escapes/instakills
  const ableToPickpocket: boolean =
    $classes`Accordion Thief, Avatar of Sneaky Pete, Disco Bandit, Gelatinous Noob`.includes(
      myClass(),
    ) ||
    haveEffect($effect`Riboflavin'`) > 0 ||
    amw_wanttoPP(enemy);
  if (
    !combat_status_check("pickpocket") &&
    ableToPickpocket &&
    containsText(text, 'value="Pick') &&
    canSurvive$1(4.0)
  ) {
    let tryIt: boolean = false;
    for (const [i, drop] of itemDropsArray(enemy).entries()) {
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
        if (auto_have_skill($skill`Sticky Fingers`) && canSurvive$1(8.0)) {
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
      const attemptSteal: string = steal();
      return "pickpocket";
    }
  }

  if (
    auto_canCircadianRhythm() &&
    (auto_circadianRhythmTarget(enemy) ||
      auto_circadianRhythmTarget$1(monsterPhylum(enemy))) &&
    canUse$2($skill`Recall Facts: %phylum Circadian Rhythms`) &&
    !ag_is_bodyguard()
  ) {
    handleTracker$1(
      $skill`Recall Facts: %phylum Circadian Rhythms`.toString(),
      monsterPhylum(enemy).toString(),
      "auto_otherstuff",
    );
    return useSkill$2($skill`Recall Facts: %phylum Circadian Rhythms`);
  }

  if (
    auto_canHabitat() &&
    auto_habitatTarget(enemy) &&
    canUse$2($skill`Recall Facts: Monster Habitats`) &&
    !ag_is_bodyguard()
  ) {
    handleTracker$1(
      $skill`Recall Facts: Monster Habitats`.toString(),
      enemy.toString(),
      "auto_copies",
    );
    return useSkill$2($skill`Recall Facts: Monster Habitats`);
  }

  if (
    auto_canRWBBlast() &&
    auto_RWBBlastTarget(enemy) &&
    canUse$2($skill`%fn, fire a Red, White and Blue Blast`)
  ) {
    handleTracker$1(
      $skill`%fn, fire a Red, White and Blue Blast`.toString(),
      enemy.toString(),
      "auto_copies",
    );
    return useSkill$2($skill`%fn, fire a Red, White and Blue Blast`);
  }

  const backedUpMonster: Monster = toMonster(
    getProperty("lastCopyableMonster"),
  );
  // reserve last 2 advs for end of day free fights
  const reserveAdvsForFreeFights: boolean =
    myAdventures() < 3 && !isFreeMonster(backedUpMonster);
  if (
    auto_backupTarget() &&
    enemy !== backedUpMonster &&
    canUse$2($skill`Back-Up to your Last Enemy`) &&
    !reserveAdvsForFreeFights
  ) {
    handleTracker$1(
      enemy.toString(),
      $skill`Back-Up to your Last Enemy`.toString(),
      "auto_replaces",
    );
    handleTracker$1(
      backedUpMonster.toString(),
      $skill`Back-Up to your Last Enemy`.toString(),
      "auto_copies",
    );
    return useSkill$2($skill`Back-Up to your Last Enemy`);
  }
  //saber copy (iotm) is different from other copies in that it comes with a free escape
  //technically it is an ender. but one that should be run before duplications.
  //2023 update: no longer saber copy blooper due to 8-bit realm changes. Leaving commented so there is an example of how to saber copy
  //if(canUse($skill[Use the Force]) && (auto_saberChargesAvailable() > 0) && (enemy !== auto_saberCurrentMonster()))
  //{
  //	if(enemy===$monster[Blooper] && needDigitalKey())
  //	{
  //		handleTracker(enemy, $skill[Use the Force], "auto_copies");
  //		return auto_combatSaberCopy();
  //	}
  //}
  //[Melodramedary] familiar skill which turns monster into a group of 2. Should be done before deleveling.
  if (
    $monsters`pygmy bowler, bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, red butler`.includes(
      enemy,
    ) &&
    canUse$2($skill`%fn, spit on them!`)
  ) {
    handleTracker$1(
      $skill`%fn, spit on them!`.toString(),
      enemy.toString(),
      "auto_otherstuff",
    );
    return useSkill$1($skill`%fn, spit on them!`, true);
  }
  //[Patriotic Eagle] familiar skill that gives a useful buff
  if (canUse$2($skill`%fn, let's pledge allegiance to a Zone`)) {
    auto_getCitizenZone(myLocation(), true);
    return useSkill$1($skill`%fn, let's pledge allegiance to a Zone`, true);
  }
  //duplicate turns the enemy from a single enemy into a mob containing 2 copies of this enemy. Doubling their stats and doubling their drops
  if (
    canUse$2($skill`Duplicate`) &&
    toInt(getProperty("_sourceTerminalDuplicateUses")) === 0 &&
    !inAftercore() &&
    !in_nuclear()
  ) {
    if ($monsters`dairy goat`.includes(enemy)) {
      return useSkill$2($skill`Duplicate`);
    }
  }
  //convert enemy into a scaling fish monster
  if (
    auto_talkToSomeFish(myLocation(), enemy) &&
    auto_have_skill($skill`Sea *dent: Talk to Some Fish`)
  ) {
    handleTracker$1(
      enemy.toString(),
      $skill`Sea *dent: Talk to Some Fish`.toString(),
      "auto_otherstuff",
    );
    return useSkill$2($skill`Sea *dent: Talk to Some Fish`);
  }
  //these special conditions make it impossible to do anything but attack with weapon.
  if (haveEffect($effect`Temporary Amnesia`) > 0) {
    return "attack with weapon";
  }
  if (haveEquipped($item`Drunkula's wineglass`)) {
    return "attack with weapon";
  }

  return "";
}
