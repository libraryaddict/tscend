import {
  abort,
  ceil,
  containsText,
  getProperty,
  Item,
  Monster,
  monsterHp,
  monsterLevelAdjustment,
  myClass,
  myFamiliar,
  removeProperty,
  setProperty,
  Skill,
  toBoolean,
  toInt,
} from "kolmafia";
import { $class, $item, $items, $monsters, $skill } from "libram";

import { isAttackFamiliar } from "../auto_familiar";
import {
  auto_have_skill,
  auto_log_info,
  combatItemDamageMultiplier,
  MLDamageToMonsterMultiplier,
} from "../auto_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_fotd } from "../paths/fall_of_the_dinosaurs";
import { glover_usable } from "../paths/g_lover";
import { auto_warSide } from "../quests/level_12";
import { auto_combatHandler } from "./auto_combat";
import { auto_edCombatHandler } from "./auto_combat_ed";
import {
  canSurvive$1,
  canUse$1,
  canUse$2,
  canUse$3,
  canUse$4,
  combat_status_add,
  combat_status_check,
  findBanisher,
  getStunner,
  haveUsed,
  useItem,
  useItem$1,
  useItems$1,
  useSkill$1,
  useSkill$2,
} from "./auto_combat_util";

// This file is for quest specific combat handling.
// the junkyard gremlin quest
//defined in /autoscend/combat/auto_combat_quest.ash
export function auto_JunkyardCombatHandler(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  if (
    !$monsters`A.M.C. gremlin, batwinged gremlin, batwinged gremlin (tool), erudite gremlin, erudite gremlin (tool), spider gremlin, spider gremlin (tool), vegetable gremlin, vegetable gremlin (tool)`.includes(
      enemy,
    )
  ) {
    if (isActuallyEd()) {
      return auto_edCombatHandler(round_1, enemy, text);
    }
    return auto_combatHandler(round_1, enemy, text);
  }

  auto_log_info(`auto_JunkyardCombatHandler: ${round_1}`, "brown");
  if (round_1 === 0) {
    setProperty("auto_gremlinMoly", false.toString());
    removeProperty("_auto_combatState");
  }

  if (
    $monsters`batwinged gremlin (tool), erudite gremlin (tool), spider gremlin (tool), vegetable gremlin (tool)`.includes(
      enemy,
    )
  ) {
    setProperty("auto_gremlinMoly", true.toString());
  }

  if (
    !combat_status_check("gremlinNeedBanish") &&
    !toBoolean(getProperty("auto_gremlinMoly")) &&
    isActuallyEd()
  ) {
    combat_status_add("gremlinNeedBanish");
  }

  if (in_fotd()) {
    // In Fall of the Dinosaurs just use the magnet without waiting for a message
    if (
      canUse$4($item`molybdenum magnet`) &&
      $monsters`batwinged gremlin (tool), erudite gremlin (tool), spider gremlin (tool), vegetable gremlin (tool)`.includes(
        enemy,
      )
    ) {
      return useItem$1($item`molybdenum magnet`);
    }
    return auto_combatHandler(round_1, enemy, text);
  }

  if (round_1 >= 28) {
    if (canUse$1($skill`Storm of the Scarab`, false)) {
      return useSkill$1($skill`Storm of the Scarab`, false);
    } else if (canUse$1($skill`Lunging Thrust-Smack`, false)) {
      return useSkill$1($skill`Lunging Thrust-Smack`, false);
    }
    return "attack with weapon";
  }

  if (
    containsText(text, "<!--moly1-->") ||
    containsText(text, "<!--moly2-->") ||
    containsText(text, "<!--moly3-->") ||
    containsText(text, "<!--moly4-->")
  ) {
    return useItem$1($item`molybdenum magnet`);
  }

  if (canUse$2($skill`Summon Love Scarabs`)) {
    return useSkill$2($skill`Summon Love Scarabs`);
  }

  if (canUse$2($skill`Good Medicine`) && canSurvive$1(2.1)) {
    return useSkill$2($skill`Good Medicine`);
  }

  let flyer: Item = $item`rock band flyers`;
  if (auto_warSide() === "hippy") {
    flyer = $item`jam band flyers`;
  }
  let stunner: Skill = getStunner(enemy);
  const stunned: boolean = combat_status_check("stunned");
  const gremlinTakesDamage: boolean =
    isAttackFamiliar(myFamiliar()) || monsterHp() < 0.8 * monsterHp(enemy);
  let shouldFlyer: boolean = false;
  let staggeringFlyer: boolean = false;
  let flyerWith: Item = Item.none;

  if (
    myClass() === $class`Disco Bandit` &&
    auto_have_skill($skill`Deft Hands`) &&
    !combat_status_check("(it")
  ) {
    //first item throw in the fight staggers
    staggeringFlyer = true;
  }
  if (auto_have_skill($skill`Ambidextrous Funkslinging`)) {
    if (canUse$4($item`Time-Spinner`)) {
      flyerWith = $item`Time-Spinner`;
      staggeringFlyer = true;
    } else if (canUse$4($item`beehive`)) {
      let canBeehiveGremlin: boolean;
      const beehiveDamage: number = ceil(
        30 * combatItemDamageMultiplier() * MLDamageToMonsterMultiplier(),
      );
      if (toBoolean(getProperty("auto_gremlinMoly"))) {
        //don't kill tool gremlin with beehive
        canBeehiveGremlin =
          !gremlinTakesDamage &&
          monsterHp() > beehiveDamage + 30 - round_1 &&
          canUse$3($item`seal tooth`, false);
      } else {
        //don't miss MP by killing weak monsters with beehive
        canBeehiveGremlin = !(
          monsterHp() <= beehiveDamage &&
          myClass() === $class`Sauceror` &&
          haveUsed($skill`Curse of Weaksauce`)
        );
      }
      if (canBeehiveGremlin) {
        flyerWith = $item`beehive`;
        staggeringFlyer = true;
      }
    }
    if (staggeringFlyer && monsterLevelAdjustment() > 150) {
      //gremlins only, no need to check stunnable
      staggeringFlyer = false;
    }
  }

  if (toBoolean(getProperty("auto_gremlinMoly"))) {
    //don't ever stun tool gremlins
    stunner = Skill.none;
  }
  if (
    canUse$4(flyer) &&
    toInt(getProperty("flyeredML")) < 10000 &&
    !toBoolean(getProperty("auto_ignoreFlyer"))
  ) {
    if (!staggeringFlyer && stunner !== Skill.none && !stunned) {
      combat_status_add("stunned");
      return useSkill$2(stunner);
    }
    if (isActuallyEd()) {
      setProperty("auto_edStatus", "UNDYING!");
    }
    if (canSurvive$1(3.0) || stunned || staggeringFlyer) {
      shouldFlyer = true;
    }
    if (shouldFlyer) {
      if (flyerWith !== Item.none) {
        return useItems$1(flyer, flyerWith);
      } else {
        return useItem$1(flyer);
      }
    }
  }

  if (!toBoolean(getProperty("auto_gremlinMoly"))) {
    if (isActuallyEd()) {
      if (toInt(getProperty("_edDefeats")) >= 2) {
        return findBanisher(round_1, enemy, text);
      } else if (
        canUse$3($item`seal tooth`, false) &&
        getProperty("auto_edStatus") === "UNDYING!"
      ) {
        return useItem($item`seal tooth`, false);
      }
    } else {
      return findBanisher(round_1, enemy, text);
    }
  }

  if (!canSurvive$1(1.5)) {
    if (!isActuallyEd() || toInt(getProperty("_edDefeats")) >= 2) {
      abort("I am too weak to safely stasis this gremlin");
    }
  }

  for (const it of $items`seal tooth, spectre scepter, Doc Galaktik's Pungent Unguent`) {
    if (canUse$3(it, false) && glover_usable(it.toString())) {
      return useItem(it, false);
    }
  }

  if (canUse$1($skill`Toss`, false)) {
    return useSkill$1($skill`Toss`, false);
  }

  if (canUse$1($skill`Plague Claws`, false)) {
    return useSkill$1($skill`Plague Claws`, false);
  }

  return "attack with weapon";
}
