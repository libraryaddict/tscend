import {
  abort,
  buffedHitStat,
  containsText,
  Element,
  equippedItem,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
  hpCost,
  itemAmount,
  itemType,
  Monster,
  monsterDefense,
  monsterElement,
  monsterHp,
  monsterLevelAdjustment,
  monsterPhylum,
  mpCost,
  myClass,
  myFullness,
  myHp,
  myLocation,
  myMaxhp,
  myMp,
  numericModifier,
  Phylum,
  setProperty,
  Skill,
  toBoolean,
  toInt,
  weaponType,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $elements,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $phyla,
  $phylum,
  $skill,
  $skills,
  $slot,
  $stat,
} from "libram";

import {
  auto_have_skill,
  auto_log_info,
  auto_log_warning,
  currentFlavour,
  isGhost,
  stunnable,
} from "../auto_util";
import { zone_combatMod } from "../auto_zone";
import { auto_spoonCombatSkill } from "../iotms/mr2019";
import { auto_haveCosmicBowlingBall } from "../iotms/mr2022";
import { auto_haveDarts, dartSkill } from "../iotms/mr2024";
import { auto_canNorthernExplosionFE } from "../iotms/mr2025";
import { inAftercore } from "../paths/casual";
import { in_glover } from "../paths/g_lover";
import { getZooBestPunch$1 } from "../paths/zootomist";
import { auto_combatMeatGolemStage5 } from "./auto_combat_adventurer_meats_world";
import { auto_combatDisguisesStage5 } from "./auto_combat_disguises_delimit";
import { auto_combatFallOfTheDinosaursStage5 } from "./auto_combat_fall_of_the_dinosaurs";
import { auto_combatGelatinousNoobStage5 } from "./auto_combat_gelatinous_noob";
import { auto_combatHeavyRainsStage5 } from "./auto_combat_heavy_rains";
import { auto_combatPlumberStage5 } from "./auto_combat_plumber";
import {
  auto_useSkill,
  canSurvive$1,
  canSurviveShootGhost,
  canUse,
  canUse$3,
  combat_status_add,
  combat_status_check,
  enemyCanBlocksSkills,
  getStunner,
  hasClubEquipped,
  markAsUsed,
  usedCount,
  useItem,
  useItem$1,
} from "./auto_combat_util";
import { auto_combatWereProfessorStage5 } from "./auto_combat_wereprofessor";
import { auto_combat_robot_stage5 } from "./auto_combat_you_robot";
import { auto_combatZombieSlayerStage5 } from "./auto_combat_zombie_slayer";

//defined in /autoscend/combat/auto_combat_default_stage5.ash
export function auto_combatDefaultStage5(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 5 = kill
  //Unskip stage 4
  if (toBoolean(getProperty("auto_skipStage4"))) {
    setProperty("auto_skipStage4", false.toString());
  }
  // Path = Heavy Rains
  let retval: string = auto_combatHeavyRainsStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = path of the plumber
  retval = auto_combatPlumberStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = disguises delimit
  retval = auto_combatDisguisesStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = gelatinous noob
  retval = auto_combatGelatinousNoobStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = you, robot
  retval = auto_combat_robot_stage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = zombie slayer
  retval = auto_combatZombieSlayerStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = fall of the dinosaurs
  retval = auto_combatFallOfTheDinosaursStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Wereprofessor
  retval = auto_combatWereProfessorStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = adventurer meats world
  retval = auto_combatMeatGolemStage5(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  //with loofah, you can stagger and deal cold or hot damage
  if (canUse($skill`Loofah Stew`) && monsterElement(enemy) !== $element`cold`) {
    return auto_useSkill($skill`Loofah Stew`, false);
  }
  if (canUse($skill`Loofah Lava`) && monsterElement(enemy) !== $element`hot`) {
    return auto_useSkill($skill`Loofah Lava`, false);
  }

  const type_1: Phylum = monsterPhylum(enemy);
  let attackMinor: string = "attack with weapon";
  let attackMajor: string = "attack with weapon";
  let costMinor: number = 0;
  let costMajor: number = 0;

  if (enemy === $monster`LOV Enforcer` && canUse($skill`Saucestorm`, false)) {
    return auto_useSkill($skill`Saucestorm`, false);
  }
  //nemesis quest specific kill methods
  if (myClass() === $class`Seal Clubber`) {
    if (enemy === $monster`hellseal pup`) {
      return auto_useSkill($skill`Clobber`, false);
    }
    if (enemy === $monster`mother hellseal`) {
      if (canUse$3($item`Rain-Doh indigo cup`)) {
        return useItem$1($item`Rain-Doh indigo cup`);
      }
      return auto_useSkill($skill`Lunging Thrust-Smack`, false);
    }
  }
  //nemesis quest tame guard turtle. takes multiple rounds and buffs enemy by 40%. so it should go after stun and delevel
  if (
    enemy === $monster`french guard turtle` &&
    haveEquipped($item`fouet de tortue-dressage`) &&
    myMp() >= mpCost($skill`Apprivoisez la tortue`)
  ) {
    return auto_useSkill($skill`Apprivoisez la tortue`, false);
  }
  //iotm back item and the enemies it spawns (free fights) can be killed using special skills to get extra XP and item drops
  if (
    haveEquipped($item`protonic accelerator pack`) &&
    isGhost(enemy) &&
    !combat_status_check("skipGhostbusting")
  ) {
    //shoot ghost 3 times provoking retaliation, then trap ghost skill unlocks which instawins combat.
    const stunner: Skill = getStunner(enemy);
    if (stunner !== Skill.none) {
      combat_status_add("stunned");
      return auto_useSkill(stunner);
    }
    //shots_takens tracks how many times we used [shoot ghost] skill this combat. it is reset in combat initialize
    const shots_takens: number = usedCount($skill`Shoot Ghost`);
    if (canUse($skill`Shoot Ghost`, false) && shots_takens < 3) {
      const shotsLeft: number = 3 - shots_takens;
      if (canSurviveShootGhost(enemy, shotsLeft)) {
        markAsUsed($skill`Shoot Ghost`); //needs to be manually done for skills with a use limit that is not 1
        return auto_useSkill($skill`Shoot Ghost`, false);
      } else {
        combat_status_add("skipGhostbusting");
      }
    }

    if (canUse($skill`Trap Ghost`) && shots_takens === 3) {
      auto_log_info("Busting makes me feel good!!", "green");
      return auto_useSkill($skill`Trap Ghost`);
    }
  }
  //turtle tamer specific skill
  if (
    myClass() === $class`Turtle Tamer` &&
    canUse($skill`Spirit Snap`) &&
    myMp() > 80
  ) {
    if (haveEffect($effect`Glorious Blessing of the War Snapper`) > 0) {
      return auto_useSkill($skill`Spirit Snap`); //50% buffed muscle physical damage once
    }
    if (
      haveEffect($effect`Glorious Blessing of She-Who-Was`) > 0 &&
      monsterElement(enemy) !== $element`spooky`
    ) {
      return auto_useSkill($skill`Spirit Snap`); //35% buffed muscle spooky damage once
    }
  }
  //8-16 + 0.25*mys damage. hardcap 50. costs 8MP. does NOT benefit from bringing up the rear ability to double damage cap
  //each time used has a 33% chance of dropping a candy. one candy per battle max. TODO track this
  //Cannelloni Cannon is better as it has 16-32 + 0.25*mys damage, is tuneable, and its cap can be boosted with bringing up the rear.
  //TODO write up a function to determine if we want to use this for the free candy. consider sauceror regeneration and candy mixing
  if (canUse($skill`Candyblast`) && myMp() > 60 && inAftercore()) {
    // We can get only one candy and we can detect it, if so desired:
    // "Hey, some of it is even intact afterwards!"
    return auto_useSkill($skill`Candyblast`);
  }

  if (myClass() !== $class`Sauceror` && canUse(auto_spoonCombatSkill())) {
    return auto_useSkill(auto_spoonCombatSkill());
  }

  if (
    auto_haveCosmicBowlingBall() &&
    canUse$3($item`cosmic bowling ball`) &&
    monsterHp() < 100
  ) {
    return useItem$1($item`cosmic bowling ball`);
  }

  if (canUse($skill`Surprisingly Sweet Stab`)) {
    return auto_useSkill($skill`Surprisingly Sweet Stab`);
  }
  //Everfull Dart Holder- use darts if you have them, unless we are against the naughty sorceress (to avoid dart skill bug)
  if (
    haveEquipped($item`Everfull Dart Holster`) &&
    toInt(getProperty("_dartsLeft")) > 0 &&
    !$monsters`Naughty Sorceress, Naughty Sorceress (2)`.includes(enemy)
  ) {
    return auto_useSkill(dartSkill(), false);
  }
  //mortar shell is amazing. it really should not be limited to sauceror only.
  if (
    canUse($skill`Stuffed Mortar Shell`) &&
    myClass() === $class`Sauceror` &&
    canSurvive$1(2.0) &&
    (currentFlavour() !== monsterElement(enemy) ||
      currentFlavour() === Element.none)
  ) {
    setProperty("_auto_combatTracker_MortarRound", round_1.toString());
    return auto_useSkill($skill`Stuffed Mortar Shell`);
  }
  //Roman Candelabra red candle
  if (
    haveEquipped($item`Roman Candelabra`) &&
    haveEffect($effect`Everything Looks Red`) === 0 &&
    !auto_haveDarts()
  ) {
    return auto_useSkill($skill`Blow the Red Candle!`);
  }
  //general killing code
  {
    //let mortar deal the killing blow so we get more MP from the exploding curse of weaksauce

    //mortar was used this combat
    //mortar will hit this round
    //TODO make sure mortar will actually kill it
    //monster is not too scary.
    //avoid killing blow with seal tooth or else 0 MP will be given
    //avoid killing blow with salsaball or else ~2MP will be given
    // If we're fighting a ghost, of course we want to use elemental damage!
    // Mighty axing is better than attacking as it will never fumble and has no mp cost
    // Avoid apathy and cunctatitis by using a ranged attack
    //AoJ spells have a hard DMG cap of 10*(MP Cost) before percentage modifiers are applied.
    //Things that change the MP costs will change said dmg cap.
    //AoJ can **only** attack via spells / items / jiggling
    // Default to curdle if the monster is physically resistant
    // Prefer double damage
    // If physically resistant, fallback to an elemental spell that will do normal damage
    // Prefer double damage
    // If physically resistant, fallback to an elemental spell that will do normal damage
    // Hack for Logging Camp: deprioritize Dark Feast, use Chill of the Tomb aggressively
    // intentionally not setting costMinor or costMajor since they don't cost mp...
    // If we're in a form or something, a beehive is probably better than just attacking

    switch (myClass()) {
      case $class`Seal Clubber`:
        attackMinor = "attack with weapon";
        if (
          canUse($skill`Lunge Smack`, false) &&
          weaponType(equippedItem($slot`weapon`)) === $stat`Muscle`
        ) {
          attackMinor = auto_useSkill($skill`Lunge Smack`, false);
          costMinor = mpCost($skill`Lunge Smack`);
        }
        if (
          canUse($skill`Lunging Thrust-Smack`, false) &&
          weaponType(equippedItem($slot`weapon`)) === $stat`Muscle`
        ) {
          attackMajor = auto_useSkill($skill`Lunging Thrust-Smack`, false);
          costMajor = mpCost($skill`Lunging Thrust-Smack`);
        }
        if (
          buffedHitStat() - 20 < monsterDefense() &&
          canUse($skill`Saucestorm`, false) &&
          !hasClubEquipped()
        ) {
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          costMajor = mpCost($skill`Saucestorm`);
        }
        if (enemy.physicalResistance > 80) {
          for (const sk of $skills`Saucestorm, Saucegeyser`) {
            if (canUse(sk, false)) {
              attackMinor = auto_useSkill(sk, false);
              attackMajor = auto_useSkill(sk, false);
              costMinor = mpCost(sk);
              costMajor = mpCost(sk);
              break;
            }
          }
          if (
            canUse($skill`Northern Explosion`, false) &&
            !auto_canNorthernExplosionFE()
          ) {
            attackMinor = auto_useSkill($skill`Northern Explosion`, false);
            attackMajor = auto_useSkill($skill`Northern Explosion`, false);
            costMinor = mpCost($skill`Northern Explosion`);
            costMajor = mpCost($skill`Northern Explosion`);
          }
        }
        break;
      case $class`Turtle Tamer`:
        attackMinor = "attack with weapon";
        if (myMp() > 150 && canUse($skill`Shieldbutt`, false)) {
          attackMinor = auto_useSkill($skill`Shieldbutt`, false);
          costMinor = mpCost($skill`Shieldbutt`);
        } else if (
          myMp() > 80 &&
          myHp() * 2 < myMaxhp() &&
          canUse($skill`Kneebutt`, false)
        ) {
          attackMinor = auto_useSkill($skill`Kneebutt`, false);
          costMinor = mpCost($skill`Kneebutt`);
        }
        if (
          (round_1 > 15 || myHp() * 2 < myMaxhp()) &&
          canUse($skill`Kneebutt`, false)
        ) {
          attackMajor = auto_useSkill($skill`Kneebutt`, false);
          costMajor = mpCost($skill`Kneebutt`);
        }
        if (canUse($skill`Shieldbutt`, false)) {
          attackMajor = auto_useSkill($skill`Shieldbutt`, false);
          costMajor = mpCost($skill`Shieldbutt`);
        }
        if (
          buffedHitStat() - 20 < monsterDefense() &&
          canUse($skill`Saucestorm`, false)
        ) {
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          costMajor = mpCost($skill`Saucestorm`);
        }
        if (enemy.physicalResistance > 80) {
          for (const sk of $skills`Saucestorm, Saucegeyser`) {
            if (canUse(sk, false)) {
              attackMinor = auto_useSkill(sk, false);
              attackMajor = auto_useSkill(sk, false);
              costMinor = mpCost(sk);
              costMajor = mpCost(sk);
              break;
            }
          }
        }
        break;
      case $class`Pastamancer`:
        if (canUse($skill`Cannelloni Cannon`, false)) {
          attackMinor = auto_useSkill($skill`Cannelloni Cannon`, false);
          costMinor = mpCost($skill`Cannelloni Cannon`);
        }
        if (canUse($skill`Weapon of the Pastalord`, false)) {
          attackMajor = auto_useSkill($skill`Weapon of the Pastalord`);
          costMajor = mpCost($skill`Weapon of the Pastalord`);
        }
        if (canUse($skill`Saucestorm`, false)) {
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          attackMinor = auto_useSkill($skill`Saucestorm`, false);
          costMinor = mpCost($skill`Saucestorm`);
          costMajor = mpCost($skill`Saucestorm`);
        }
        if (
          canUse($skill`Utensil Twist`, false) &&
          itemType(equippedItem($slot`weapon`)) === "utensil"
        ) {
          if (
            equippedItem($slot`weapon`) === $item`Hand that Rocks the Ladle`
          ) {
            attackMajor = auto_useSkill($skill`Utensil Twist`, false);
            attackMinor = auto_useSkill($skill`Utensil Twist`, false);
            costMinor = mpCost($skill`Utensil Twist`);
            costMajor = mpCost($skill`Utensil Twist`);
          } else if (
            enemy.physicalResistance <= 80 &&
            attackMinor !== auto_useSkill($skill`Saucestorm`, false)
          ) {
            attackMinor = auto_useSkill($skill`Utensil Twist`, false);
            costMinor = mpCost($skill`Utensil Twist`);
          }
        }
        if (
          (in_glover() || attackMinor === "attack with weapon") &&
          canUse($skill`Saucegeyser`, false)
        ) {
          attackMinor = auto_useSkill($skill`Saucegeyser`, false);
          costMinor = mpCost($skill`Saucegeyser`);
        }
        break;
      case $class`Sauceror`: {
        if (canUse($skill`Saucegeyser`, false)) {
          attackMinor = auto_useSkill($skill`Saucegeyser`, false);
          attackMajor = auto_useSkill($skill`Saucegeyser`, false);
          costMinor = mpCost($skill`Saucegeyser`);
          costMajor = mpCost($skill`Saucegeyser`);
        } else if (
          canUse($skill`Saucecicle`, false) &&
          monsterElement(enemy) !== $element`cold`
        ) {
          attackMinor = auto_useSkill($skill`Saucecicle`, false);
          attackMajor = auto_useSkill($skill`Saucecicle`, false);
          costMinor = mpCost($skill`Saucecicle`);
          costMajor = mpCost($skill`Saucecicle`);
        } else if (canUse($skill`Saucestorm`, false)) {
          attackMinor = auto_useSkill($skill`Saucestorm`, false);
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          costMinor = mpCost($skill`Saucestorm`);
          costMajor = mpCost($skill`Saucestorm`);
        } else if (
          canUse($skill`Wave of Sauce`, false) &&
          monsterElement(enemy) !== $element`hot`
        ) {
          attackMinor = auto_useSkill($skill`Wave of Sauce`, false);
          attackMajor = auto_useSkill($skill`Wave of Sauce`, false);
          costMinor = mpCost($skill`Wave of Sauce`);
          costMajor = mpCost($skill`Wave of Sauce`);
        } else if (
          canUse($skill`Stream of Sauce`, false) &&
          monsterElement(enemy) !== $element`hot`
        ) {
          attackMinor = auto_useSkill($skill`Stream of Sauce`, false);
          attackMajor = auto_useSkill($skill`Stream of Sauce`, false);
          costMinor = mpCost($skill`Stream of Sauce`);
          costMajor = mpCost($skill`Stream of Sauce`);
        }
        const mortar_round: number = toInt(
          getProperty("_auto_combatTracker_MortarRound"),
        );
        if (
          mortar_round > -1 &&
          mortar_round === round_1 - 1 &&
          canSurvive$1(2.0)
        ) {
          if (monsterHp() > 1 && canUse$3($item`seal tooth`, false)) {
            return useItem($item`seal tooth`, false);
          }
          if (monsterHp() > 15 && canUse($skill`Salsaball`, false)) {
            return auto_useSkill($skill`Salsaball`, false);
          }
        }
        break;
      }
      case $class`Avatar of Boris`: {
        if (
          canUse($skill`Heroic Belch`, false) &&
          enemy.physicalResistance >= 80 &&
          $element`stench` !== monsterElement(enemy)
        ) {
          attackMinor = auto_useSkill($skill`Heroic Belch`);
          attackMajor = auto_useSkill($skill`Heroic Belch`);
          costMinor = mpCost($skill`Heroic Belch`);
          costMajor = mpCost($skill`Heroic Belch`);
        }
        if (canUse($skill`Mighty Axing`, false)) {
          attackMinor = auto_useSkill($skill`Mighty Axing`, false);
          attackMajor = auto_useSkill($skill`Mighty Axing`, false);
          costMinor = mpCost($skill`Mighty Axing`);
          costMajor = mpCost($skill`Mighty Axing`);
        }
        if (canUse($skill`Cleave`, false)) {
          attackMajor = auto_useSkill($skill`Cleave`, false);
          costMajor = mpCost($skill`Cleave`);
        }
        if (
          equippedItem($slot`weapon`) === $item`Trusty` &&
          canUse($skill`Throw Trusty`, false) &&
          $monsters`apathetic lizardman, Procrastination Giant`.includes(enemy)
        ) {
          attackMinor = auto_useSkill($skill`Throw Trusty`, false);
          attackMajor = auto_useSkill($skill`Throw Trusty`, false);
          costMinor = mpCost($skill`Throw Trusty`);
          costMajor = mpCost($skill`Throw Trusty`);
        }
        if (
          canUse($skill`Heroic Belch`, false) &&
          enemy.physicalResistance >= 100 &&
          monsterElement(enemy) !== $element`stench` &&
          myFullness() >= 5
        ) {
          attackMinor = auto_useSkill($skill`Heroic Belch`, false);
          attackMajor = auto_useSkill($skill`Heroic Belch`, false);
          costMinor = mpCost($skill`Heroic Belch`);
          costMajor = mpCost($skill`Heroic Belch`);
        }
        break;
      }
      case $class`Avatar of Jarlsberg`: {
        attackMinor = auto_useSkill($skill`Curdle`, false);
        attackMajor = auto_useSkill($skill`Curdle`, false);
        costMinor = mpCost($skill`Curdle`);
        costMajor = mpCost($skill`Curdle`);
        if (enemy.physicalResistance < 50) {
          if (canUse($skill`Chop`, false)) {
            attackMinor = auto_useSkill($skill`Chop`, false);
            attackMajor = auto_useSkill($skill`Chop`, false);
            costMinor = mpCost($skill`Chop`);
            costMajor = mpCost($skill`Chop`);
          }

          if (canUse($skill`Slice`, false)) {
            attackMajor = auto_useSkill($skill`Slice`, false);
            costMajor = mpCost($skill`Slice`);
          }
        }
        if (
          $elements`cold, spooky`.includes(monsterElement(enemy)) &&
          canUse($skill`Bake`)
        ) {
          attackMinor = auto_useSkill($skill`Bake`);
          attackMajor = auto_useSkill($skill`Bake`);
          costMinor = mpCost($skill`Bake`);
          costMajor = mpCost($skill`Bake`);
        } else if (
          $elements`cold, spooky`.includes(monsterElement(enemy)) &&
          canUse($skill`Boil`, false)
        ) {
          attackMinor = auto_useSkill($skill`Boil`, false);
          attackMajor = auto_useSkill($skill`Boil`, false);
          costMinor = mpCost($skill`Boil`);
          costMajor = mpCost($skill`Boil`);
        } else if (
          $elements`stench, sleaze`.includes(monsterElement(enemy)) &&
          canUse($skill`Freeze`, false)
        ) {
          attackMinor = auto_useSkill($skill`Freeze`, false);
          attackMajor = auto_useSkill($skill`Freeze`, false);
          costMinor = mpCost($skill`Freeze`);
          costMajor = mpCost($skill`Freeze`);
        } else if (enemy.physicalResistance >= 50) {
          if (monsterElement(enemy) !== $element`hot` && canUse($skill`Bake`)) {
            attackMinor = auto_useSkill($skill`Bake`);
            attackMajor = auto_useSkill($skill`Bake`);
            costMinor = mpCost($skill`Bake`);
            costMajor = mpCost($skill`Bake`);
          } else if (
            monsterElement(enemy) !== $element`hot` &&
            canUse($skill`Boil`, false)
          ) {
            attackMinor = auto_useSkill($skill`Boil`, false);
            attackMajor = auto_useSkill($skill`Boil`, false);
            costMinor = mpCost($skill`Boil`);
            costMajor = mpCost($skill`Boil`);
          } else if (
            monsterElement(enemy) !== $element`cold` &&
            canUse($skill`Freeze`, false)
          ) {
            attackMinor = auto_useSkill($skill`Freeze`, false);
            attackMajor = auto_useSkill($skill`Freeze`, false);
            costMinor = mpCost($skill`Freeze`);
            costMajor = mpCost($skill`Freeze`);
          }
        }
        if (
          $elements`hot, stench`.includes(monsterElement(enemy)) &&
          canUse($skill`Fry`, false)
        ) {
          attackMajor = auto_useSkill($skill`Fry`, false);
          costMajor = mpCost($skill`Fry`);
        } else if (
          monsterElement(enemy) !== Element.none &&
          canUse($skill`Grill`, false)
        ) {
          attackMajor = auto_useSkill($skill`Grill`, false);
          costMajor = mpCost($skill`Grill`);
        } else if (enemy.physicalResistance >= 50) {
          if (
            monsterElement(enemy) !== $element`sleaze` &&
            canUse($skill`Fry`, false)
          ) {
            attackMajor = auto_useSkill($skill`Fry`, false);
            costMajor = mpCost($skill`Fry`);
          } else if (canUse($skill`Grill`, false)) {
            attackMajor = auto_useSkill($skill`Grill`, false);
            costMajor = mpCost($skill`Grill`);
          }
        }
        break;
      }
      case $class`Avatar of Sneaky Pete`: {
        if (canUse($skill`Pop Wheelie`, false)) {
          attackMajor = auto_useSkill($skill`Pop Wheelie`, false);
          costMajor = mpCost($skill`Pop Wheelie`);
        }
        if (canUse($skill`Smoke Break`) && enemy.physicalResistance >= 80) {
          attackMinor = auto_useSkill($skill`Smoke Break`);
          attackMajor = auto_useSkill($skill`Smoke Break`);
          costMinor = mpCost($skill`Smoke Break`);
          costMajor = mpCost($skill`Smoke Break`);
        } else if (
          canUse($skill`Flash Headlight`) &&
          enemy.physicalResistance >= 80 &&
          (getProperty("peteMotorbikeHeadlight") === "Party Bulb" ||
            (getProperty("peteMotorbikeHeadlight") === "Blacklight Bulb" &&
              monsterElement(enemy) !== $element`sleaze`))
        ) {
          attackMinor = auto_useSkill($skill`Flash Headlight`);
          attackMajor = auto_useSkill($skill`Flash Headlight`);
          costMinor = mpCost($skill`Flash Headlight`);
          costMajor = mpCost($skill`Flash Headlight`);
        } else if (
          canUse$3($item`firebomb`, false) &&
          enemy.physicalResistance >= 100 &&
          monsterElement(enemy) !== $element`hot`
        ) {
          attackMinor = useItem($item`firebomb`, false);
          attackMajor = useItem($item`firebomb`, false);
          costMinor = 0;
          costMajor = 0;
        }
        break;
      }
      case $class`Accordion Thief`: {
        if (
          canUse($skill`Cadenza`) &&
          itemType(equippedItem($slot`weapon`)) === "accordion" &&
          canSurvive$1(2.0)
        ) {
          if (
            $items`accordion file, alarm accordion, autocalliope, Bal-musette accordion, baritone accordion, Cajun accordion, ghost accordion, peace accordion, pentatonic accordion, pygmy concertinette, Skipper's accordion, Squeezebox of the Ages, The Trickster's Trikitixa`.includes(
              equippedItem($slot`weapon`),
            )
          ) {
            return auto_useSkill($skill`Cadenza`);
          }
        }
        if (
          buffedHitStat() - 20 < monsterDefense() &&
          canUse($skill`Saucestorm`, false)
        ) {
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          costMajor = mpCost($skill`Saucestorm`);
        }
        if (enemy.physicalResistance > 80) {
          for (const sk of $skills`Saucestorm, Saucegeyser`) {
            if (canUse(sk, false)) {
              attackMinor = auto_useSkill(sk, false);
              attackMajor = auto_useSkill(sk, false);
              costMinor = mpCost(sk);
              costMajor = mpCost(sk);
              break;
            }
          }
        }
        break;
      }
      case $class`Disco Bandit`: {
        if (
          auto_have_skill($skill`Disco State of Mind`) &&
          auto_have_skill($skill`Flashy Dancer`) &&
          auto_have_skill($skill`Disco Greed`) &&
          auto_have_skill($skill`Disco Bravado`) &&
          stunnable(enemy) &&
          monsterLevelAdjustment() < 150
        ) {
          const mpRegen: number =
            (numericModifier("MP Regen Min") +
              numericModifier("MP Regen Max")) /
            2;
          let netCost: number = 0;

          for (const dance of $skills`Disco Dance of Doom, Disco Dance II: Electric Boogaloo, Disco Dance 3: Back in the Habit`) {
            netCost += mpCost(dance);
            if (canUse(dance) && mpRegen > netCost * 2) {
              return auto_useSkill(dance);
            }
          }
        }
        if (
          buffedHitStat() - 20 < monsterDefense() &&
          canUse($skill`Saucestorm`, false)
        ) {
          attackMajor = auto_useSkill($skill`Saucestorm`, false);
          costMajor = mpCost($skill`Saucestorm`);
        }
        if (enemy.physicalResistance > 80) {
          for (const sk of $skills`Saucestorm, Saucegeyser`) {
            if (canUse(sk, false)) {
              attackMinor = auto_useSkill(sk, false);
              attackMajor = auto_useSkill(sk, false);
              costMinor = mpCost(sk);
              costMajor = mpCost(sk);
              break;
            }
          }
        }
        break;
      }
      case $class`Cow Puncher`:
      case $class`Beanslinger`:
      case $class`Snake Oiler`:
        if (
          canUse($skill`Extract Oil`) &&
          myHp() > 80 &&
          myMp() >= 3 * mpCost($skill`Extract Oil`)
        ) {
          if (
            $monsters`aggressive grass snake, bacon snake, Batsnake, black adder, Burning Snake of Fire, coal snake, diamondback rattler, frontwinder, Frozen Solid Snake, king snake, licorice snake, mutant rattlesnake, prince snake, sewer snake with a sewer snake in it, Snakeleton, The Snake With Like Ten Heads, tomb asp, Trouser Snake, whitesnake`.includes(
              enemy,
            ) &&
            itemAmount($item`snake oil`) < 4
          ) {
            return auto_useSkill($skill`Extract Oil`);
          } else if (
            $phyla`beast, dude, hippy, humanoid, orc, pirate`.includes(
              type_1,
            ) &&
            itemAmount($item`skin oil`) < 3
          ) {
            return auto_useSkill($skill`Extract Oil`);
          } else if (
            $phyla`bug, construct, constellation, demon, elemental, elf, fish, goblin, hobo, horror, mer-kin, penguin, plant, slime, weird`.includes(
              type_1,
            ) &&
            itemAmount($item`unusual oil`) < 4
          ) {
            return auto_useSkill($skill`Extract Oil`);
          } else if (
            $phyla`undead`.includes(type_1) &&
            itemAmount($item`eldritch oil`) < 5
          ) {
            return auto_useSkill($skill`Extract Oil`);
          }
        }
        if (
          canUse($skill`Good Medicine`) &&
          myMp() >= 3 * mpCost($skill`Good Medicine`)
        ) {
          return auto_useSkill($skill`Good Medicine`);
        }
        if (
          canUse($skill`Lavafava`, false) &&
          enemy.defenseElement !== $element`hot`
        ) {
          attackMajor = auto_useSkill($skill`Lavafava`, false);
          attackMinor = auto_useSkill($skill`Lavafava`, false);
          costMajor = mpCost($skill`Lavafava`);
          costMinor = mpCost($skill`Lavafava`);
        }
        if (canUse($skill`Beanstorm`, false)) {
          attackMajor = auto_useSkill($skill`Beanstorm`, false);
          attackMinor = auto_useSkill($skill`Beanstorm`, false);
          costMajor = mpCost($skill`Beanstorm`);
          costMinor = mpCost($skill`Beanstorm`);
        }
        if (
          canUse($skill`Fan Hammer`, false) &&
          enemy.physicalResistance < 80
        ) {
          attackMajor = auto_useSkill($skill`Fan Hammer`, false);
          attackMinor = auto_useSkill($skill`Fan Hammer`, false);
          costMajor = mpCost($skill`Fan Hammer`);
          costMinor = mpCost($skill`Fan Hammer`);
        }
        if (canUse($skill`Snakewhip`, false) && enemy.physicalResistance < 80) {
          attackMajor = auto_useSkill($skill`Snakewhip`, false);
          attackMinor = auto_useSkill($skill`Snakewhip`, false);
          costMajor = mpCost($skill`Snakewhip`);
          costMinor = mpCost($skill`Snakewhip`);
        }
        if (
          canUse($skill`Pungent Mung`, false) &&
          enemy.defenseElement !== $element`stench`
        ) {
          attackMajor = auto_useSkill($skill`Pungent Mung`, false);
          attackMinor = auto_useSkill($skill`Pungent Mung`, false);
          costMajor = mpCost($skill`Pungent Mung`);
          costMinor = mpCost($skill`Pungent Mung`);
        }
        if (
          canUse($skill`Cowcall`, false) &&
          type_1 !== $phylum`undead` &&
          enemy.defenseElement !== $element`spooky` &&
          (haveEffect($effect`Cowrruption`) >= 60 ||
            myClass() === $class`Cow Puncher`)
        ) {
          attackMajor = auto_useSkill($skill`Cowcall`, false);
          attackMinor = auto_useSkill($skill`Cowcall`, false);
          costMajor = mpCost($skill`Cowcall`);
          costMinor = mpCost($skill`Cowcall`);
        }
        break;
      case $class`Vampyre`:
        for (const sk of $skills`Chill of the Tomb, Blood Spike, Piercing Gaze, Savage Bite`) {
          if (
            sk === $skill`Chill of the Tomb` &&
            monsterElement(enemy) === $element`cold`
          ) {
            continue;
          }
          if (canUse(sk, false) && myHp() > hpCost(sk)) {
            attackMajor = auto_useSkill(sk, false);
            attackMinor = auto_useSkill(sk, false);
            break;
          }
        }
        if (
          myHp() > 0.5 * myMaxhp() &&
          attackMajor === auto_useSkill($skill`Chill of the Tomb`, false) &&
          myLocation() === $location`The Smut Orc Logging Camp`
        ) {
          break;
        }
        if (
          myHp() < myMaxhp() &&
          (monsterHp() <= 30 ||
            (monsterHp() <= 100 && auto_have_skill($skill`Hypnotic Eyes`))) &&
          canUse($skill`Dark Feast`)
        ) {
          return auto_useSkill($skill`Dark Feast`);
        }
        if (
          attackMinor === "attack with weapon" &&
          !haveSkill($skill`Preternatural Strength`) &&
          canUse$3($item`beehive`) &&
          $stat`Moxie` !== weaponType(equippedItem($slot`weapon`))
        ) {
          attackMinor = useItem($item`beehive`, false);
        }
        break;
      case $class`Pig Skinner`:
        attackMinor = "attack with weapon";
        if (canUse($skill`Ball Throw`, true) && enemy.physicalResistance < 80) {
          attackMajor = auto_useSkill($skill`Ball Throw`, true);
          attackMinor = auto_useSkill($skill`Ball Throw`, true);
          costMajor = mpCost($skill`Ball Throw`);
          costMinor = mpCost($skill`Ball Throw`);
        }
        if (
          canUse($skill`Hot Foot`, true) &&
          enemy.defenseElement !== $element`hot` &&
          !enemyCanBlocksSkills()
        ) {
          attackMajor = auto_useSkill($skill`Hot Foot`, true);
          attackMinor = auto_useSkill($skill`Hot Foot`, true);
          costMajor = mpCost($skill`Hot Foot`);
          costMinor = mpCost($skill`Hot Foot`);
        }
        if (
          canUse($skill`Stop Hitting Yourself`, true) &&
          enemy.physicalResistance < 80
        ) {
          attackMajor = auto_useSkill($skill`Stop Hitting Yourself`, true);
          attackMinor = auto_useSkill($skill`Stop Hitting Yourself`, true);
          costMajor = mpCost($skill`Stop Hitting Yourself`);
          costMinor = mpCost($skill`Stop Hitting Yourself`);
        }
        if (myHp() / 0.5 < myMaxhp() && canUse($skill`Second Wind`, true)) {
          attackMajor = auto_useSkill($skill`Second Wind`, true);
          attackMinor = auto_useSkill($skill`Second Wind`, true);
          costMajor = mpCost($skill`Second Wind`);
          costMinor = mpCost($skill`Second Wind`);
        }
        break;
      case $class`Cheese Wizard`:
        attackMinor = "attack with weapon";
        if (canUse($skill`Parmesan Missile`)) {
          attackMajor = auto_useSkill($skill`Parmesan Missile`, false);
          attackMinor = auto_useSkill($skill`Parmesan Missile`, false);
          costMajor = mpCost($skill`Parmesan Missile`);
          costMinor = mpCost($skill`Parmesan Missile`);
        }
        if (canUse($skill`Crack Knuckles`) && enemy.physicalResistance < 80) {
          attackMajor = auto_useSkill($skill`Crack Knuckles`, true);
          attackMinor = auto_useSkill($skill`Crack Knuckles`, true);
          costMajor = mpCost($skill`Crack Knuckles`);
          costMinor = mpCost($skill`Crack Knuckles`);
        }
        if (canUse($skill`Mind Melt`, true)) {
          attackMajor = auto_useSkill($skill`Mind Melt`, true);
          attackMinor = auto_useSkill($skill`Mind Melt`, true);
          costMajor = mpCost($skill`Mind Melt`);
          costMinor = mpCost($skill`Mind Melt`);
        }
        if (
          canUse($skill`Stilton Splatter`, true) &&
          enemy.physicalResistance < 80
        ) {
          attackMajor = auto_useSkill($skill`Stilton Splatter`, true);
          attackMinor = auto_useSkill($skill`Stilton Splatter`, true);
          costMajor = mpCost($skill`Stilton Splatter`);
          costMinor = mpCost($skill`Stilton Splatter`);
        }
        if (
          canUse($skill`Emmental Elemental`, true) &&
          myHp() / 0.7 < myMaxhp()
        ) {
          attackMajor = auto_useSkill($skill`Emmental Elemental`, true);
          attackMinor = auto_useSkill($skill`Emmental Elemental`, true);
          costMajor = mpCost($skill`Emmental Elemental`);
          costMinor = mpCost($skill`Emmental Elemental`);
        }
        break;
      case $class`Jazz Agent`:
        attackMinor = "attack with weapon";
        if (
          canUse($skill`Orchestra Strike`, false) &&
          enemy.physicalResistance < 80
        ) {
          attackMajor = auto_useSkill($skill`Orchestra Strike`, false);
          attackMinor = auto_useSkill($skill`Orchestra Strike`, false);
          costMajor = mpCost($skill`Orchestra Strike`);
          costMinor = mpCost($skill`Orchestra Strike`);
        }
        if (
          canUse($skill`Sax of Violence`, false) &&
          enemy.defenseElement !== $element`sleaze`
        ) {
          attackMajor = auto_useSkill($skill`Sax of Violence`, false);
          attackMinor = auto_useSkill($skill`Sax of Violence`, false);
          costMajor = mpCost($skill`Sax of Violence`);
          costMinor = mpCost($skill`Sax of Violence`);
        }
        if (canUse($skill`Venomous Riff`, true)) {
          attackMajor = auto_useSkill($skill`Venomous Riff`, true);
          attackMinor = auto_useSkill($skill`Venomous Riff`, true);
          costMajor = mpCost($skill`Venomous Riff`);
          costMinor = mpCost($skill`Venomous Riff`);
        }
        if (
          canUse($skill`Knife In The Darkness`, true) &&
          zone_combatMod(myLocation())._int < 0
        ) {
          attackMajor = auto_useSkill($skill`Knife In The Darkness`, true);
          attackMinor = auto_useSkill($skill`Knife In The Darkness`, true);
          costMajor = mpCost($skill`Knife In The Darkness`);
          costMinor = mpCost($skill`Knife In The Darkness`);
        }
        if (
          canUse($skill`Grit Teeth`, false, true) &&
          myHp() < myMaxhp() &&
          combat_status_check("stunned") &&
          round_1 < 5
        ) {
          attackMajor = auto_useSkill($skill`Grit Teeth`, true);
          attackMinor = auto_useSkill($skill`Grit Teeth`, true);
          costMajor = mpCost($skill`Grit Teeth`);
          costMinor = mpCost($skill`Grit Teeth`);
        }
        break;
      case $class`Zootomist`: {
        const punch: Skill = getZooBestPunch$1(enemy);
        if (punch === Skill.none) {
          return "attack with weapon";
        }
        attackMajor = auto_useSkill(punch, false);
        attackMinor = auto_useSkill(punch, false);
        costMajor = mpCost(punch);
        costMinor = mpCost(punch);
        break;
      }
    }
  } // class attack selection

  if ((myHp() * 10) / 3 < myMaxhp()) {
    if (canUse($skill`Thunderstrike`) && monsterLevelAdjustment() <= 150) {
      return auto_useSkill($skill`Thunderstrike`);
    }

    if (
      canUse($skill`Unleash the Greash`) &&
      monsterElement(enemy) !== $element`sleaze` &&
      haveEffect($effect`Takin' It Greasy`) > 100
    ) {
      return auto_useSkill($skill`Unleash the Greash`);
    }
    if (
      canUse($skill`Thousand-Yard Stare`) &&
      monsterElement(enemy) !== $element`spooky` &&
      haveEffect($effect`Intimidating Mien`) > 100
    ) {
      return auto_useSkill($skill`Thousand-Yard Stare`);
    }
    if (
      $monsters`Aquagoblin, Lord Soggyraven, Groar, The Big Wisniewski, The Man`.includes(
        enemy,
      ) &&
      myMp() >= costMajor
    ) {
      return attackMajor;
    }
    if (myClass() === $class`Turtle Tamer` && canUse($skill`Spirit Snap`)) {
      if (
        haveEffect($effect`Blessing of the Storm Tortoise`) > 0 ||
        haveEffect($effect`Grand Blessing of the Storm Tortoise`) > 0 ||
        haveEffect($effect`Glorious Blessing of the Storm Tortoise`) > 0 ||
        haveEffect($effect`Glorious Blessing of the War Snapper`) > 0 ||
        haveEffect($effect`Glorious Blessing of She-Who-Was`) > 0
      ) {
        return auto_useSkill($skill`Spirit Snap`);
      }
    }
    if (
      canUse($skill`Northern Explosion`) &&
      !auto_canNorthernExplosionFE() &&
      myClass() === $class`Seal Clubber` &&
      monsterElement(enemy) !== $element`cold` &&
      (hasClubEquipped() || buffedHitStat() - 20 > monsterDefense())
    ) {
      return auto_useSkill($skill`Northern Explosion`);
    }
    if (!combat_status_check("last attempt") && myMp() >= costMajor) {
      if (canSurvive$1(1.4)) {
        combat_status_add("last attempt");
        auto_log_warning("Uh oh, I'm having trouble in combat.", "red");
      }
      return attackMajor;
    }
    if (canSurvive$1(2.5)) {
      auto_log_warning(
        "Hmmm, I don't really know what to do in this combat but it looks like I'll live.",
        "red",
      );
      if (myMp() >= costMajor) {
        return attackMajor;
      } else if (myMp() >= costMinor) {
        return attackMinor;
      }
      return "attack with weapon";
    }
    if (myLocation() !== $location`The Slime Tube`) {
      abort("Could not handle monster, sorry");
    }
  }
  if (
    monsterLevelAdjustment() > 150 &&
    myMp() >= 45 &&
    canUse($skill`Shell Up`) &&
    myClass() === $class`Turtle Tamer`
  ) {
    return auto_useSkill($skill`Shell Up`);
  }

  if (
    enemy.physicalResistance >= 100 &&
    monsterElement(enemy) !== $element`cold` &&
    canUse($skill`Throat Refrigerant`, false)
  ) {
    return auto_useSkill($skill`Throat Refrigerant`, false);
  }

  if (
    enemy.physicalResistance >= 100 &&
    monsterElement(enemy) !== $element`hot` &&
    canUse($skill`Boiling Tear Ducts`, false)
  ) {
    return auto_useSkill($skill`Boiling Tear Ducts`, false);
  }

  if (
    enemy.physicalResistance >= 100 &&
    monsterElement(enemy) !== $element`sleaze` &&
    canUse($skill`Projectile Salivary Glands`)
  ) {
    return auto_useSkill($skill`Projectile Salivary Glands`);
  }

  if (
    enemy.physicalResistance >= 100 &&
    monsterElement(enemy) !== $element`spooky` &&
    canUse($skill`Translucent Skin`, false)
  ) {
    return auto_useSkill($skill`Translucent Skin`, false);
  }

  if (
    enemy.physicalResistance >= 100 &&
    monsterElement(enemy) !== $element`stench` &&
    canUse($skill`Skunk Glands`, false)
  ) {
    return auto_useSkill($skill`Skunk Glands`, false);
  }
  // final check for physically immune monsters we are planning on simply attacking
  // determine if attacking will deal reasonable damage
  // note preadv *should* ensure we can damage physically immune monsters via a spell or attack
  // this check could be redundant. If preadv worked as intended and we haven't picked a spell yet, attack should deal damage
  if (enemy.physicalResistance >= 80 && attackMinor === "attack with weapon") {
    let m_hot: number = 1;
    let m_cold: number = 1;
    let m_spooky: number = 1;
    let m_sleaze: number = 1;
    let m_stench: number = 1;
    switch (monsterElement(enemy)) {
      case $element`hot`:
        m_hot = 0;
        m_sleaze = 2;
        m_stench = 2;
        break;
      case $element`cold`:
        m_cold = 0;
        m_hot = 2;
        m_spooky = 2;
        break;
      case $element`spooky`:
        m_spooky = 0;
        m_hot = 2;
        m_stench = 2;
        break;
      case $element`sleaze`:
        m_sleaze = 0;
        m_cold = 2;
        m_spooky = 2;
        break;
      case $element`stench`:
        m_stench = 0;
        m_sleaze = 2;
        m_cold = 2;
        break;
    }

    const elementalDamage: number = toInt(
      m_hot * numericModifier("hot damage") +
        m_cold * numericModifier("cold damage") +
        m_spooky * numericModifier("spooky damage") +
        m_sleaze * numericModifier("sleaze damage") +
        m_stench * numericModifier("stench damage"),
    );
    // try to kill within 5 turns
    if (elementalDamage * 5 < monsterHp()) {
      abort(
        "I am fighting a physically immune monster and I do not know how to kill it",
      );
    }
  }
  // Wu Tang the Betrayer is immune to spells and normal attacks, but not Fist skills or Spectral Snapper
  if (enemy === $monster`Wu Tang the Betrayer`) {
    for (const sk of $skills`Spectral Snapper, Stinkpalm, Drunken Baby Style, Zendo Kobushi Kancho, Chilled Monkey Brain Technique, Knuckle Sandwich, Seven-Finger Strike, Flying Fire Fist`) {
      if (canUse(sk, false)) {
        return auto_useSkill(sk, false);
      }
    }
    abort(
      "Wu Tang the Betrayer is immune to spells and normal attacks, and I do not know how to kill him",
    );
  }

  if (
    myLocation() === $location`The X-32-F Combat Training Snowman` &&
    containsText(text, "Cattle Prod") &&
    myMp() >= costMajor
  ) {
    return attackMajor;
  }

  if (
    monsterLevelAdjustment() > 150 &&
    myMp() >= costMajor &&
    attackMajor !== "attack with weapon"
  ) {
    return attackMajor;
  }

  if (
    $monsters`Aquagoblin, Lord Soggyraven, Groar, The Big Wisniewski, The Man`.includes(
      enemy,
    ) &&
    myMp() >= costMajor
  ) {
    return attackMajor;
  }

  if (
    canUse($skill`Lunge Smack`, false) &&
    attackMinor !== "attack with weapon" &&
    weaponType(equippedItem($slot`weapon`)) === $stat`Muscle`
  ) {
    return attackMinor;
  }
  if (myMp() >= costMinor && attackMinor !== "attack with weapon") {
    return attackMinor;
  }

  if (round_1 > 20 && canUse($skill`Saucestorm`, false)) {
    return auto_useSkill($skill`Saucestorm`, false);
  }

  if (
    attackMinor === "attack with weapon" &&
    monsterDefense() > 20 &&
    buffedHitStat() - 20 < monsterDefense() &&
    canUse($skill`Saucestorm`, false)
  ) {
    return auto_useSkill($skill`Saucestorm`, false);
  }

  return attackMinor;
}
