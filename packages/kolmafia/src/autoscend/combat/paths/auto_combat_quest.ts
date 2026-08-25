import {
  ceil,
  containsText,
  Item,
  Monster,
  monsterHp,
  monsterLevelAdjustment,
  myClass,
  myFamiliar,
  removeProperty,
  Skill,
} from "kolmafia";
import { $class, $item, $items, $monsters, $skill, get, set } from "libram";

import { CombatMacroReturns } from "../../auto_adventure";
import { isAttackFamiliar } from "../../auto_familiar";
import {
  auto_abort,
  auto_have_skill,
  auto_log_info,
  combatItemDamageMultiplier,
  MLDamageToMonsterMultiplier,
} from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { glover_usable } from "../../paths/2018/g_lover";
import { in_fotd } from "../../paths/2022/fall_of_the_dinosaurs";
import { auto_warSide } from "../../quests/level_12";
import { auto_combatHandler } from "../auto_combat";
import {
  auto_canUse,
  auto_useSkill,
  canSurvive,
  canUse$3,
  combat_status_add,
  combat_status_check,
  findBanisher,
  getStunner,
  haveUsed,
  useItem,
  useItems,
} from "../auto_combat_util";
import { auto_edCombatHandler } from "./auto_combat_ed";

// This file is for quest specific combat handling.
// the junkyard gremlin quest
//defined in /autoscend/combat/auto_combat_quest.ash
export function auto_JunkyardCombatHandler(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
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
    set("auto_gremlinMoly", false);
    removeProperty("_auto_combatState");
  }

  if (
    $monsters`batwinged gremlin (tool), erudite gremlin (tool), spider gremlin (tool), vegetable gremlin (tool)`.includes(
      enemy,
    )
  ) {
    set("auto_gremlinMoly", true);
  }

  if (
    !combat_status_check("gremlinNeedBanish") &&
    !get("auto_gremlinMoly", false) &&
    isActuallyEd()
  ) {
    combat_status_add("gremlinNeedBanish");
  }

  if (in_fotd()) {
    // In Fall of the Dinosaurs just use the magnet without waiting for a message
    if (
      canUse$3($item`molybdenum magnet`) &&
      $monsters`batwinged gremlin (tool), erudite gremlin (tool), spider gremlin (tool), vegetable gremlin (tool)`.includes(
        enemy,
      )
    ) {
      return useItem($item`molybdenum magnet`);
    }
    return auto_combatHandler(round_1, enemy, text);
  }

  if (round_1 >= 28) {
    if (auto_canUse($skill`Storm of the Scarab`, false)) {
      return auto_useSkill($skill`Storm of the Scarab`, false);
    } else if (auto_canUse($skill`Lunging Thrust-Smack`, false)) {
      return auto_useSkill($skill`Lunging Thrust-Smack`, false);
    }
    return "attack";
  }

  if (
    containsText(text, "<!--moly1-->") ||
    containsText(text, "<!--moly2-->") ||
    containsText(text, "<!--moly3-->") ||
    containsText(text, "<!--moly4-->")
  ) {
    return useItem($item`molybdenum magnet`);
  }

  if (auto_canUse($skill`Summon Love Scarabs`)) {
    return auto_useSkill($skill`Summon Love Scarabs`);
  }

  if (auto_canUse($skill`Good Medicine`) && canSurvive(2.1)) {
    return auto_useSkill($skill`Good Medicine`);
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
  let flyerWith: Item = $item.none;

  if (
    myClass() === $class`Disco Bandit` &&
    auto_have_skill($skill`Deft Hands`) &&
    !combat_status_check("(it")
  ) {
    //first item throw in the fight staggers
    staggeringFlyer = true;
  }
  if (auto_have_skill($skill`Ambidextrous Funkslinging`)) {
    if (canUse$3($item`Time-Spinner`)) {
      flyerWith = $item`Time-Spinner`;
      staggeringFlyer = true;
    } else if (canUse$3($item`beehive`)) {
      let canBeehiveGremlin: boolean;
      const beehiveDamage: number = ceil(
        30 * combatItemDamageMultiplier() * MLDamageToMonsterMultiplier(),
      );
      if (get("auto_gremlinMoly", false)) {
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

  if (get("auto_gremlinMoly", false)) {
    //don't ever stun tool gremlins
    stunner = $skill.none;
  }
  if (
    canUse$3(flyer) &&
    get("flyeredML") < 10000 &&
    !get("auto_ignoreFlyer", false)
  ) {
    if (!staggeringFlyer && stunner !== $skill.none && !stunned) {
      combat_status_add("stunned");
      return auto_useSkill(stunner);
    }
    if (isActuallyEd()) {
      set("auto_edStatus", "UNDYING!");
    }
    if (canSurvive(3.0) || stunned || staggeringFlyer) {
      shouldFlyer = true;
    }
    if (shouldFlyer) {
      if (flyerWith !== $item.none) {
        return useItems(flyer, flyerWith);
      } else {
        return useItem(flyer);
      }
    }
  }

  if (!get("auto_gremlinMoly", false)) {
    if (isActuallyEd()) {
      if (get("_edDefeats") >= 2) {
        return findBanisher(round_1, enemy, text);
      } else if (
        canUse$3($item`seal tooth`, false) &&
        get("auto_edStatus") === "UNDYING!"
      ) {
        return useItem($item`seal tooth`, false);
      }
    } else {
      return findBanisher(round_1, enemy, text);
    }
  }

  if (!canSurvive(1.5)) {
    if (!isActuallyEd() || get("_edDefeats") >= 2) {
      auto_abort("I am too weak to safely stasis this gremlin");
    }
  }

  for (const it of $items`seal tooth, spectre scepter, Doc Galaktik's Pungent Unguent`) {
    if (canUse$3(it, false) && glover_usable(it.toString())) {
      return useItem(it, false);
    }
  }

  if (auto_canUse($skill`Toss`, false)) {
    return auto_useSkill($skill`Toss`, false);
  }

  if (auto_canUse($skill`Plague Claws`, false)) {
    return auto_useSkill($skill`Plague Claws`, false);
  }

  return "attack";
}
