import {
  abort,
  availableAmount,
  blackMarketAvailable,
  canEquip,
  canInteract,
  ceil,
  cliExecute,
  closetAmount,
  Coinmaster,
  creatableAmount,
  dispensaryAvailable,
  Effect,
  equip,
  equippedItem,
  floor,
  getCampground,
  getDwelling,
  getProperty,
  haveEffect,
  haveSkill,
  hpCost,
  isAccessible,
  isTradeable,
  Item,
  itemAmount,
  max,
  min,
  mpCost,
  myBuffedstat,
  myClass,
  myEffects,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  mySoulsauce,
  npcPrice,
  numericModifier,
  print,
  putCloset,
  retrieveItem,
  sellPrice,
  setProperty,
  Skill,
  splitString,
  Stat,
  takeCloset,
  toBoolean,
  toEffect,
  toFloat,
  toInt,
  toItem,
  toLowerCase,
  toSkill,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $path,
  $skill,
  $slot,
  $stat,
  get,
} from "libram";

import { auto_mall_price } from "./auto_acquire";
import { buffMaintain$4 } from "./auto_buff";
import { equipStatgainIncreasers$1, possessEquipment } from "./auto_equipment";
import { pathHasFamiliar } from "./auto_familiar";
import {
  auto_burnMP,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  isMystGuildStoreAvailable,
  meatReserve,
} from "./auto_util";
import {
  doHottub,
  hotTubSoaksRemaining,
  isHotTubAvailable,
} from "./iotms/clan";
import {
  chateaumantegna_available,
  chateaumantegna_decorations,
  chateaumantegna_nightstandSet,
} from "./iotms/mr2015";
import {
  auto_campawayAvailable,
  auto_sausageBlocked,
  auto_sausageEatEmUp,
  auto_sausageGrind,
} from "./iotms/mr2019";
import {
  auto_canUseJuneCleaver,
  canUseSweatpants,
  getSweat,
} from "./iotms/mr2022";
import {
  auto_haveBurningLeaves,
  auto_haveCincho,
  auto_nextRestOverCinch,
} from "./iotms/mr2023";
import {
  auto_equipAprilShieldBuff,
  auto_haveAprilShowerShield,
  auto_haveCrimboSkeleton,
} from "./iotms/mr2025";
import { auto_elfToiletReady } from "./iotms/mr2026";
import { edAcquireHP, isActuallyEd } from "./paths/actually_ed_the_undying";
import { in_amw } from "./paths/adventurer_meats_world";
import { borisAcquireHP, is_boris } from "./paths/avatar_of_boris";
import {
  auto_cheeseWizardAcquireHP,
  auto_jazzAgentAcquireHP,
  auto_pigSkinnerAcquireHP,
} from "./paths/avatar_of_shadows_over_loathing";
import { bat_reallyPickSkills, in_darkGyffte } from "./paths/dark_gyffte";
import { in_pokefam } from "./paths/pocket_familiars";
import { is_professor } from "./paths/wereprofessor";
import {
  in_zombieSlayer,
  zombieSlayer_acquireHP,
  zombieSlayer_acquireMP,
} from "./paths/zombie_slayer";
import { fileAsMap } from "./utils/kolmafiaUtils";

/**
 * Functions designed to deal with restoring hp/mp, removing status effects, etc.
 *
 * Bulk of the file is in determining what restoration method is optimal to use in a given situation. Restore methods are loaded from data/autoscend_restoration.txt, which can be updated to add new methods as needed. In general it should be as simple as adding a new line to that file with the appropriate values. For edge cases or special methods (e.g. clan hot tub) you may also need to add a bit of extra logic to the __calculate_objective_values function. In extremely rare cases you may need to modify the maximization algorithm itself, see __maximize_restore_options.
 *
 * Current hp/mp sources:
 *  - dwelling (free rests only)
 *  - chateau/campaway camp (free rests only)
 *  - clan hot tub
 *  - hp/mp items listed in autoscend_restoration.txt
 *  - npc purchasable items (meat and coinmasters)
 *  - mall purchasable items (out of ronin)
 */
/**
 * Private Interface
 */
// Loosely maps to autoscend_restoration.txt data, after a little parsing/coercing
class __RestorationMetadata {
  constructor(
    public name: string = "",
    public type: string = "",
    public hpRestored: number = 0.0,
    public restoresVariableHp: string = "",
    public mpRestored: number = 0.0,
    public restoresVariableMp: string = "",
    public softReserveLimit: number = 0,
    public hardReserveLimit: number = 0,
    public removesBeatenUp: boolean = false,
    public removesEffects: Map<Effect, boolean> = new Map(),
    public givesEffects: Map<Effect, boolean> = new Map(),
    public maximaValues: Map<string, number> = new Map(),
  ) {}
}
// Holds values used to determine a restoration option's efficacy
class __RestorationOptimization {
  constructor(
    public metadata: __RestorationMetadata = new __RestorationMetadata(),
    public vars: Map<string, number> = new Map(), // cache, not used for optimization
    public objectiveValues: Map<string, number> = new Map(),
    public constraints: Map<string, boolean> = new Map(), // constraints that much be met, all must be true
  ) {}
}
// Real ugly to_string, probably only enable for debugging

function to_string$1(o: __RestorationOptimization, simple: boolean): string {
  function list_to_string$2(values: Map<string, number>): string {
    let s: string = "{";
    let first: boolean = true;
    for (const [k, v] of values) {
      if (first) {
        first = false;
      } else {
        s += ", ";
      }
      s += `${k}: ${v}`;
    }
    s += "}";
    return s;
  }

  function list_to_string$3(values: Map<string, boolean>): string {
    let s: string = "{";
    let first: boolean = true;
    for (const [k, v] of values) {
      if (first) {
        first = false;
      } else {
        s += ", ";
      }
      s += `${k}: ${v}`;
    }
    s += "}";
    return s;
  }

  if (simple) {
    return `(${o.metadata.name}, hp: ${o.objectiveValues.get("hp_total_restored") ?? o.objectiveValues.set("hp_total_restored", 0.0).get("hp_total_restored")}, mp: ${o.objectiveValues.get("mp_total_restored") ?? o.objectiveValues.set("mp_total_restored", 0.0).get("mp_total_restored")}, negative effects remaining: ${o.objectiveValues.get("negative_status_effects_remaining") ?? o.objectiveValues.set("negative_status_effects_remaining", 0.0).get("negative_status_effects_remaining")})`;
  }

  const vars_str: string = list_to_string$2(o.vars);
  const constraints_str: string = list_to_string$3(o.constraints);
  const objective_values_str: string = list_to_string$2(o.objectiveValues);
  return `__RestorationOptimization(name: ${o.metadata.name}, vars: ${vars_str}, constraints: ${constraints_str}, objective_values: ${objective_values_str})`;
}

function to_string$2(
  optima: Map<number, __RestorationOptimization>,
  simple: boolean,
): string {
  let val: string = "";
  let first: boolean = true;
  for (const [i, o] of optima) {
    if (first) {
      first = false;
    } else {
      val += "; ";
    }
    val += `${i} - ${to_string$1(o, simple)}`;
  }
  return val;
}

function auto_log_restore_debug(s: string, level: number): void {
  //restore debug log is extremely girthy and usually not needed. as such it has its own custom setting for displaying it.
  //0 = no extra debugging. 1 = log the stages and their results 2 = log restorer data dump.
  if (toInt(getProperty("auto_log_level")) < 3) {
    return; //regular debugging is off. so extra debugging is also off.
  }
  if (toInt(getProperty("auto_log_level_restore")) >= level) {
    auto_log_debug$1(s);
  }
}

let $_f___all_negative_effects: Map<Effect, boolean> = new Map();
const $_f___known_restoration_sources: Map<string, __RestorationMetadata> =
  new Map();
const $_f___restore_maximizer_cache: Map<number, __RestorationOptimization> =
  new Map();
// TODO: would be nice to replace this concept with just putting a simple formula in place of the hp/mp fields, e.g. ${my_level}*1.5
// currently custom formulas need to be coded into an if statement
const $_f___RESTORE_ALL: string = "all";
const $_f___RESTORE_HALF: string = "half";
const $_f___RESTORE_SCALING: string = "scaling";
const $_f___HOT_TUB: string = "a relaxing hot tub";
const $_f___NUNS: string = "the nunnery";
/**
 * Parse autoscend_restoration.txt into __known_restoration_sources.
 *
 * Uses an intermediate record for the initial file_to_map, then parses it to make working with __RestorationMetadata friendlier.
 */
let $___init_restoration_metadata_resotration_filename: string | undefined;
let $___init_restoration_metadata_negative_effects_filename: string | undefined;

function __init_restoration_metadata(): void {
  $___init_restoration_metadata_resotration_filename ??=
    "autoscend_restoration.txt";
  $___init_restoration_metadata_negative_effects_filename ??=
    "autoscend_negative_effects.txt";

  function parse_effects(
    name: string,
    effects_list: string,
  ): Map<Effect, boolean> {
    effects_list = toLowerCase(effects_list);
    let parsed_effects: Map<Effect, boolean> = new Map();

    if (effects_list === "all negative") {
      parsed_effects = $_f___all_negative_effects;
    } else if (effects_list !== "none" && effects_list !== "") {
      for (const [, s] of splitString(effects_list, ",").entries()) {
        const e: Effect = toEffect(s);
        if (e !== Effect.none) {
          parsed_effects.set(e, true);
        } else {
          auto_log_warning$1(
            `Unknown effect found parsing restoration metadata: ${name} removes effect: ${s}`,
          );
        }
      }
    }
    return parsed_effects;
  }

  function parse_restored_amount(restored_str: string): number {
    restored_str = toLowerCase(restored_str);
    if (
      restored_str === "all" ||
      restored_str === "half" ||
      restored_str === "scaling"
    ) {
      return 0;
    } else {
      return toFloat(restored_str);
    }
  }

  function parse_restores_variable(restored_str: string): string {
    restored_str = toLowerCase(restored_str);
    if (restored_str === "all") {
      return $_f___RESTORE_ALL;
    } else if (restored_str === "half") {
      return $_f___RESTORE_HALF;
    } else if (restored_str === "scaling") {
      return $_f___RESTORE_SCALING;
    }
    return "";
  }

  function init(): void {
    $_f___all_negative_effects = fileAsMap(
      $___init_restoration_metadata_negative_effects_filename,
      [toEffect, toBoolean],
    );
    //type[idx,name,hp_restored,mp_restored,soft_reserve_limit,hard_reserve_limit,removes_effects,gives_effects]
    const raw_data: Map<
      string,
      Map<
        string,
        Map<
          string,
          Map<
            string,
            Map<string, Map<string, Map<string, Map<string, string>>>>
          >
        >
      >
    > = fileAsMap($___init_restoration_metadata_resotration_filename, [
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
    ]);

    for (const type_1 of ["item", "skill", "clan", "dwelling", "place"]) {
      for (const [, _v0] of raw_data.get(type_1) ??
        raw_data.set(type_1, new Map()).get(type_1)) {
        for (const [name, _v1] of _v0) {
          for (const [hp_restored, _v2] of _v1) {
            for (const [mp_restored, _v3] of _v2) {
              for (const [soft_reserve_limit, _v4] of _v3) {
                for (const [hard_reserve_limit, _v5] of _v4) {
                  for (const [removes_effects, _v6] of _v5) {
                    const gives_effects = _v6;
                    const parsed: __RestorationMetadata =
                      new __RestorationMetadata();
                    parsed.type = type_1;
                    parsed.name = toLowerCase(name);
                    parsed.hpRestored = parse_restored_amount(hp_restored);
                    parsed.restoresVariableHp =
                      parse_restores_variable(hp_restored);
                    parsed.mpRestored = parse_restored_amount(mp_restored);
                    parsed.restoresVariableMp =
                      parse_restores_variable(mp_restored);
                    parsed.softReserveLimit = toInt(soft_reserve_limit);
                    parsed.hardReserveLimit = toInt(hard_reserve_limit);
                    parsed.removesEffects = parse_effects(
                      parsed.name,
                      removes_effects,
                    );
                    parsed.removesBeatenUp = parsed.removesEffects.has(
                      $effect`Beaten Up`,
                    );
                    parsed.givesEffects = parse_effects(
                      parsed.name,
                      gives_effects,
                    );

                    $_f___known_restoration_sources.set(parsed.name, parsed);
                  }
                }
              }
            }
          }
        }
      }
    }
    // add mp restore to nunnery if did as fratboy
    if (getProperty("sidequestNunsCompleted") === "fratboy") {
      (
        $_f___known_restoration_sources.get("the nunnery") ??
        $_f___known_restoration_sources
          .set("the nunnery", new __RestorationMetadata())
          .get("the nunnery")
      ).mpRestored = 1000;
    }

    if (myPath() === $path`Disguises Delimit`) {
      //shadow has double HP in this path so larger reserve needed
      for (const specialname of ["gauze garter", "filthy poultice"]) {
        const parsedSpecial: __RestorationMetadata =
          $_f___known_restoration_sources.get(specialname) ??
          $_f___known_restoration_sources
            .set(specialname, new __RestorationMetadata())
            .get(specialname);
        if (parsedSpecial.hardReserveLimit < 4) {
          continue;
        }
        parsedSpecial.hardReserveLimit += 4; //shallow copy passes edit
      }
    }
  }

  auto_log_info$1("Loading restoration data.");
  init();
  $_f___restore_maximizer_cache.clear();
}

function __restoration_methods(): Map<string, __RestorationMetadata> {
  //Safe way to access __known_restoration_sources, ensuring it is initialized if not already.
  if ($_f___known_restoration_sources.size === 0) {
    __init_restoration_metadata();
  }
  return $_f___known_restoration_sources;
}
// primary attributes we want to sort by (maximize), you probably shouldnt add anything to this
const __PRIMARY_SORT_KEYS: Map<string, boolean> = new Map([
  ["hp_total_restored", true],
  ["mp_total_restored", true],
]);
// values we want to maximize when optimizing
const __MAXIMIZE_KEYS: Map<string, boolean> = new Map([
  ["total_uses_available", true],
  ["hp_per_meat_spent", true],
  ["hp_per_coinmaster_token_spent", true],
  ["hp_per_mp_spent", true],
  ["mp_per_meat_spent", true],
  ["mp_per_coinmaster_token_spent", true],
]);
// values we want to minimize when optimizing
const __MINIMIZE_KEYS: Map<string, boolean> = new Map([
  ["total_uses_needed", true],
  ["hp_total_wasted_goal", true], // candidate for removal
  ["hp_total_short_goal", true],
  ["mp_total_wasted_goal", true], // candidate for removal
  ["mp_total_short_goal", true],
  ["hp_total_wasted_max", true],
  ["hp_total_short_max", true], // candidate for removal
  ["mp_total_wasted_max", true],
  ["mp_total_short_max", true], // candidate for removal
  ["total_mp_used", true],
  ["total_meat_used", true],
  ["total_coinmaster_tokens_used", true],
  ["negative_status_effects_remaining", true],
  ["soft_reserve_limit_uses", true],
]);
// Not used for much, mostly a cache so we dont have to keep recalculating values and print out for debugging
const __VARS_KEYS: Map<string, boolean> = new Map([
  ["hp_goal", true],
  ["hp_starting", true],
  ["hp_max", true],
  ["hp_restored_per_use", true],
  ["hp_uses_needed_for_goal", true],
  ["mp_goal", true],
  ["mp_starting", true],
  ["mp_max", true],
  ["mp_restored_per_use", true],
  ["mp_uses_needed_for_goal", true],
  ["blood_skill_opportunity_casts_goal", true],
  ["blood_skill_opportunity_casts_max", true],
  ["amount_creatable", true],
  ["amount_buyable", true],
  ["meat_per_use", true],
  ["tokens_per_use", true],
  ["total_creatable", true],
  ["total_buyable", true],
  ["reserve_limit_hard", true],
  ["total_uses_remaining", true], // candidate for removal
  ["soft_reserve_limit", true],
  ["hard_reserve_limit", true],
  ["hp_max_restorable", true],
  ["mp_max_restorable", true],
  ["meat_available_to_spend", true],
]);
// values used to constrain or quickly eliminate methods as not options (e.g. skill not available in a path)
const __CONSTRAINT_KEYS: Map<string, boolean> = new Map([
  ["is_ever_useable", true],
  ["is_currently_useable", true],
  ["have_required_resources", true],
  ["restores_needed_resources", true],
  ["meets_hard_reserve_limit", true],
]);
/**
 * This one is very important. Do not change unless you are prepared to test thoroughly.
 *
 * keys and what rank (order) they are processed to determine a restore method's effectiveness compared to another. Each rank can potentially remove inferior options so they arent considered in the next pass. Changing these values can lead to very different results.
 *
 * __RANKED_GOAL_DESCRIPTIONS below should be updated to reflect the intended goal each rank is attempting to achieve.
 */
const __OBJECTIVE_RANKS: Map<string, number> = new Map([
  ["hp_total_restored", 1],
  ["mp_total_restored", 1],
  ["negative_status_effects_remaining", 1],
  ["soft_reserve_limit_uses", 2],
  ["total_coinmaster_tokens_used", 3],
  ["hp_per_coinmaster_token_spent", 3],
  ["mp_per_coinmaster_token_spent", 3],
  ["total_meat_used", 4],
  ["hp_per_meat_spent", 4],
  ["mp_per_meat_spent", 4],
  ["hp_per_mp_spent", 5],
  ["hp_total_short_goal", 6],
  ["mp_total_short_goal", 6],
  ["mp_total_wasted_max", 6],
  ["hp_total_wasted_max", 6],
  ["total_uses_needed", 7],
]);
// describes what each ranking in __OBJECTIVE_RANKS is attempting to optimize for
const __RANKED_GOAL_DESCRIPTIONS: Map<number, string> = new Map([
  [1, "remove negative status effects"],
  [2, "maintain soft reserve limit (keep at least N on hand if possible)"],
  [
    3,
    "try not to spend coinmaster tokens, maximizing hp/mp restored per token spent if we must spend",
  ],
  [
    4,
    "try not to spend meat, maximizing hp/mp restored per meat spent if we must spend",
  ],
  [
    5,
    "try to spend less mp, maximizing hp restored per mp spent if we must spend",
  ],
  [6, "minimize hp/mp shortage to goal and wasted hp/mp over max"],
  [7, "minimize number of uses needed to reach goal"],
]);
/**
 * Precalculate values we will later use to narrow down our restoration options to the most effective and least costly.
 *
 * Most future work adding new restore methods should hopefully just need to add new fields to __MAXIMIZE_KEYS, __MINIMIZE_KEYS or __CONSTRAINT_KEYS and set them appropriately here. It is also important to add new values to __OBJECTIVE_RANKS so they are considered at the right time to be effective. The optimization algorithm itself shouldnt need to be changed.
 *
 * TODO:
 *  - add mana burn potential
 *  - improve blood burn potential calculations
 *  - add april shower
 *  - integrate with https://sourceforge.net/p/kolmafia/code/HEAD/tree/src/data/restores.txt
 */
function __calculate_objective_values(
  hp_goal: number,
  mp_goal: number,
  meat_reserve: number,
  useFreeRests: boolean,
  metadata: __RestorationMetadata,
): __RestorationOptimization {
  const optimization_parameters: __RestorationOptimization =
    new __RestorationOptimization();

  function set_value(name: string, value: number): void {
    if (
      __MAXIMIZE_KEYS.has(name) ||
      __MINIMIZE_KEYS.has(name) ||
      __PRIMARY_SORT_KEYS.has(name)
    ) {
      optimization_parameters.objectiveValues.set(name, value);
    } else if (__VARS_KEYS.has(name)) {
      optimization_parameters.vars.set(name, value);
    } else {
      //we must have [name] defined in one of the above keys or it will not be stored/retrieved.
      abort(
        `void set_value(string name, float value) was asked to store the undefined key = ${name}`,
      );
    }
  }

  function set_value$1(name: string, value: boolean): void {
    if (__CONSTRAINT_KEYS.has(name)) {
      optimization_parameters.constraints.set(name, value);
    } else {
      //we must have [name] defined in one of the above keys or it will not be stored/retrieved.
      abort(
        `void set_value(string name, boolean value) was asked to store the undefined key = ${name}`,
      );
    }
  }

  function get_value(name: string): number {
    if (
      __MAXIMIZE_KEYS.has(name) ||
      __MINIMIZE_KEYS.has(name) ||
      __PRIMARY_SORT_KEYS.has(name)
    ) {
      return (
        optimization_parameters.objectiveValues.get(name) ??
        optimization_parameters.objectiveValues.set(name, 0.0).get(name)
      );
    } else if (__VARS_KEYS.has(name)) {
      return (
        optimization_parameters.vars.get(name) ??
        optimization_parameters.vars.set(name, 0.0).get(name)
      );
    }
    //we must have [name] defined in one of the above keys or it will not be stored/retrieved.
    abort(
      `float get_value(string name) was asked to return the undefined key = ${name}`,
    );
    return 0.0;
  }

  function get_value$1(resource_type: string, name: string): number {
    return get_value(`${resource_type}_${name}`);
  }

  function hp_restored_per_use(): number {
    let restored_amount: number = metadata.hpRestored;
    if (metadata.restoresVariableHp === $_f___RESTORE_ALL) {
      restored_amount = myMaxhp();
    } else if (metadata.restoresVariableHp === $_f___RESTORE_HALF) {
      restored_amount = floor(myMaxhp() / 2);
    }

    if (metadata.type === "dwelling") {
      restored_amount += numericModifier("Bonus Resting HP");
    }

    if (
      metadata.name === "disco nap" &&
      auto_have_skill($skill`Adventurer of Leisure`)
    ) {
      restored_amount = 40;
    }

    return restored_amount;
  }

  function mp_restored_per_use(): number {
    let restored_amount: number = metadata.mpRestored;
    if (metadata.restoresVariableMp === $_f___RESTORE_ALL) {
      restored_amount = myMaxmp();
    } else if (metadata.restoresVariableMp === $_f___RESTORE_HALF) {
      restored_amount = floor(myMaxmp() / 2);
    } else if (metadata.restoresVariableMp === $_f___RESTORE_SCALING) {
      if (metadata.name === "magical mystery juice") {
        restored_amount = myLevel() * 1.5 + 5;
      } else if (metadata.name === "generic mana potion") {
        restored_amount = myLevel() * 2.5;
      }
    }

    if (metadata.type === "dwelling") {
      restored_amount += numericModifier("Bonus Resting MP");
    }

    if (
      metadata.name === "disco nap" &&
      auto_haveAprilShowerShield() &&
      toInt(getProperty("_aprilShowerDiscoNap")) < 5 &&
      myMp() > mpCost($skill`Disco Nap`)
    ) {
      restored_amount = 100 - 20 * toInt(getProperty("_aprilShowerDiscoNap"));
    }

    return restored_amount;
  }

  function uses_needed_to_reach_goal(resource_type: string): number {
    const goal: number = get_value$1(resource_type, "goal");
    const starting: number = get_value$1(resource_type, "starting");
    const per_use: number = get_value$1(resource_type, "restored_per_use");

    if (per_use < 1.0) {
      return 0.0;
    }
    return max(ceil((goal - starting) / per_use), 1.0);
  }

  function total_uses_needed(): number {
    return max(
      get_value$1("hp", "uses_needed_for_goal"),
      get_value$1("mp", "uses_needed_for_goal"),
    );
  }

  function meat_per_use(): number {
    if (metadata.type === "item") {
      const i: Item = toItem(metadata.name);
      if (canInteract() || myMeat() > 20000) {
        //we have unlimited mall access = casual, aftercore, or postronin. or we are just rich with over 20k meat.
        //In either case we want to conserve rare items and consider an item's mall value rather than conserving our current meat stocks.
        //ex: scroll of drastic healing will be considered to be worth its mall price here.
        let price: number = 999999; //do not use items that cannot be bought
        if (isTradeable(i)) {
          //is possible to trade in the mall
          price = min(price, auto_mall_price(i));
        }
        if (npcPrice(i) > 0) {
          //is possible to buy from an NPC store
          price = min(price, npcPrice(i));
        }
        return price;
      } else {
        //mall access is limited, this means pulls are limited too. also meat < 20k so we want to spend items to preserve meat
        //ex: scroll of drastic healing will be considered free. since we spent no meat for it to drop.
        return npcPrice(i); //this will set items that cannot be purchased from an NPC store to free.
      }
    } else if (metadata.type === "skill") {
      let meat_per_mp: number = 9.0; // default to Doc Galaktik's Invigorating Tonic at 90 meat/10 MP
      if (dispensaryAvailable() || blackMarketAvailable()) {
        meat_per_mp = 8.0; // Knob Goblin seltzer or Black cherry soda at 80 meat/10 MP
      }
      if (getProperty("questM24Doc") === "finished") {
        meat_per_mp = 6.0; // Doc Galaktik's Invigorating Tonic reduced to 60 meat/10 MP
      }
      if (auto_have_skill($skill`Five Finger Discount`)) {
        meat_per_mp = meat_per_mp * 0.95; // this isn't quite right for discounted Doc Galaktik but I don't care.
      }
      if (isMystGuildStoreAvailable()) {
        const mmj_cost: number = auto_have_skill($skill`Five Finger Discount`)
          ? 95
          : 100;
        const mmj_mp_restored: number = toInt(myLevel() * 1.5 + 5);
        const mmj_meat_per_mp: number = mmj_cost / mmj_mp_restored;
        meat_per_mp = min(meat_per_mp, mmj_meat_per_mp);
        // at level 6 and above, MMJ is better than all but discounted doc galaktik
        // and at level 8 and above it's better than everything
      }
      if (myClass() === $class`Sauceror` || canInteract()) {
        // your MP cup runneth over
        meat_per_mp = 0;
      }
      const s: Skill = toSkill(metadata.name);
      return mpCost(s) * meat_per_mp;
    } else {
      return 0.0;
    }
  }

  function tokens_per_use(): number {
    if (metadata.type !== "item") {
      return 0.0;
    }
    const i: Item = toItem(metadata.name);
    if (i.seller !== Coinmaster.none) {
      return sellPrice(i.seller, i);
    }
    return 0.0;
  }

  function total_creatable(): number {
    if (metadata.type !== "item") {
      return 0.0;
    }
    return creatableAmount(toItem(metadata.name));
  }

  function total_buyable(): number {
    if (metadata.type !== "item") {
      return 0.0;
    }

    let price_per: number = 0.0;
    let currency_available: number = 0.0;
    const it: Item = toItem(metadata.name);

    const mall_buyable: boolean = canInteract() && isTradeable(it);
    if (mall_buyable || npcPrice(it) > 0) {
      price_per = get_value("meat_per_use");
      currency_available = max(0.0, myMeat() - meat_reserve);
    } else if (get_value("tokens_per_use") > 0.0) {
      price_per = get_value("tokens_per_use");
      currency_available = it.seller.availableTokens;
    }

    if (currency_available === 0) {
      return 0.0;
    }

    return floor(currency_available / price_per);
  }

  function total_uses_available(): number {
    let available: number = 0.0;
    if (metadata.type === "dwelling") {
      available = freeRestsRemaining();
    } else if (metadata.type === "item") {
      available =
        itemAmount(toItem(metadata.name)) +
        get_value("total_buyable") +
        get_value("total_creatable");
    } else if (metadata.type === "skill") {
      const dailyLimit: number = toSkill(metadata.name).dailylimit;
      const mpCost_1: number = mpCost(toSkill(metadata.name));
      if (dailyLimit !== -1 && mpCost_1 > 0) {
        available = min(dailyLimit, floor(get_value("mp_starting") / mpCost_1));
      } else if (dailyLimit !== -1) {
        available = dailyLimit;
      } else {
        available = floor(get_value("mp_starting") / mpCost_1);
      }
    } else if (metadata.name === $_f___HOT_TUB) {
      available = hotTubSoaksRemaining();
    } else if (metadata.name === $_f___NUNS) {
      available = 3 - toInt(getProperty("nunsVisits"));
    }
    return max(0.0, available);
  }

  function total_uses_remaining(): number {
    return max(
      0.0,
      get_value("total_uses_available") - get_value("total_uses_needed"),
    );
  }

  function soft_reserve_limit_uses(): number {
    return max(
      0.0,
      get_value("soft_reserve_limit") - get_value("total_uses_remaining"),
    );
  }

  function max_restorable(resource_type: string): number {
    return (
      get_value("total_uses_needed") *
      get_value$1(resource_type, "restored_per_use")
    );
  }

  function total_wasted(resource_type: string, goal: number): number {
    if (
      (resource_type === "hp" &&
        metadata.restoresVariableHp === $_f___RESTORE_ALL) ||
      (resource_type === "mp" &&
        metadata.restoresVariableMp === $_f___RESTORE_ALL)
    ) {
      return 0.0;
    }
    if (resource_type === "hp" && metadata.type === "skill") {
      // don't consider excess healing from spells as "waste".
      // It would be better to price this in meat terms across all healing but that's not easy to do right now.
      return 0.0;
    }
    return max(
      0.0,
      get_value$1(resource_type, "starting") +
        get_value$1(resource_type, "max_restorable") -
        goal,
    );
  }
  // TODO: doesnt account properly for multiuse situations where we could have more blood skill casts and less waste than this formula suggests
  function blood_skill_opportunity_casts(goal: number): number {
    const bloodBondAvailable: boolean =
      auto_have_skill($skill`Blood Bond`) &&
      pathHasFamiliar() &&
      myMaxhp() >
        hpCost(
          //checks if player can use familiars in this run
          $skill`Blood Bond`,
        ) &&
      goal > (9 - hp_regen()) * 10 &&
      toBoolean(
        // blood bond drains hp after combat, make sure we dont accidentally kill the player
        getProperty("auto_restoreUseBloodBond"),
      );

    const bloodBubbleAvailable: boolean =
      auto_have_skill($skill`Blood Bubble`) &&
      myMaxhp() > hpCost($skill`Blood Bubble`);

    const waste: number = total_wasted("hp", goal);
    const blood_cost: number = hpCost($skill`Blood Bond`);
    if (waste <= blood_cost || !(bloodBubbleAvailable || bloodBondAvailable)) {
      return 0.0;
    }

    let hp_to_burn: number = 0.0;
    if (myHp() > 0) {
      hp_to_burn = min(myHp() - 1, waste);
    }
    return floor(hp_to_burn / blood_cost);
  }

  function blood_adjusted_waste(goal: number): number {
    const casts: number = blood_skill_opportunity_casts(goal);
    const waste: number = total_wasted("hp", goal);
    if (casts < 1) {
      return waste;
    } else {
      return waste - casts * hpCost($skill`Blood Bond`);
    }
  }

  function total_short(resource_type: string, goal: number): number {
    return max(
      0.0,
      goal -
        (get_value$1(resource_type, "starting") +
          get_value$1(resource_type, "max_restorable")),
    );
  }

  function total_mp_used(): number {
    if (metadata.type !== "skill") {
      return -1.0;
    }
    return total_uses_needed() * mpCost(toSkill(metadata.name));
  }

  function total_meat_used(): number {
    if (metadata.type !== "item" && metadata.type !== "skill") {
      return -1.0;
    }
    let needed: number = 0;
    if (metadata.type === "item") {
      const i: Item = toItem(metadata.name);
      needed = max(0.0, total_uses_needed() - itemAmount(i));
    } else if (metadata.type === "skill") {
      needed = total_uses_needed();
    }

    const price: number = get_value("meat_per_use");
    if (price < 0.0) {
      return -1.0;
    }
    return price * needed;
  }

  function meat_available_to_spend(): number {
    return max(0.0, myMeat() - meat_reserve);
  }

  function total_coinmaster_tokens_used(): number {
    if (metadata.type !== "item") {
      return -1.0;
    }
    const i: Item = toItem(metadata.name);

    if (i.seller !== Coinmaster.none) {
      return -1.0;
    }

    const needed: number = max(0.0, total_uses_needed() - itemAmount(i));
    const price: number = sellPrice(i.seller, i);

    return needed * price;
  }

  function negative_status_effects_remaining(): number {
    let negative_effects_active: number = 0;
    for (const [e] of Object.entries(myEffects()).map(
      ([_k, _v]) => [Effect.get(_k), _v] as [Effect, number],
    )) {
      if (
        e !== $effect`Beaten Up` &&
        $_f___all_negative_effects.has(e) &&
        !metadata.removesEffects.has(e)
      ) {
        negative_effects_active++;
      }
    }
    return negative_effects_active;
  }

  function resource_value_per_meat_spent(resource_type: string): number {
    if (get_value("total_meat_used") <= 0.0) {
      return -1.0;
    }

    return (
      get_value$1(resource_type, "total_restored") /
      get_value("total_meat_used")
    );
  }

  function resource_value_per_coinmaster_token_spent(
    resource_type: string,
  ): number {
    if (get_value("total_coinmaster_tokens_used") <= 0.0) {
      return -1.0;
    }

    return (
      get_value$1(resource_type, "total_restored") /
      get_value("total_coinmaster_tokens_used")
    );
  }

  function hp_per_mp_spent(): number {
    if (get_value("total_mp_used") <= 0.0) {
      return -1.0;
    }

    return get_value("hp_total_restored") / get_value("total_mp_used");
  }

  function total_restored(resource_type: string): number {
    let starting: number = get_value$1(resource_type, "starting");
    const goal: number = min(
      get_value$1(resource_type, "max_restorable") + starting,
      get_value$1(resource_type, "max"),
    );

    if (resource_type === "hp" && goal > starting) {
      const blood_cost: number = hpCost($skill`Blood Bond`);
      const casts: number = blood_skill_opportunity_casts(goal);
      if (casts > 0.0) {
        starting = max(starting - casts * blood_cost, 0.0);
      }
    }

    return goal - starting;
  }

  function is_ever_useable(): boolean {
    if (metadata.type === "item") {
      const i: Item = toItem(metadata.name);
      return auto_is_valid(i);
    }
    if (metadata.type === "skill") {
      return auto_is_valid$2(toSkill(metadata.name));
    }
    if (metadata.type === "dwelling") {
      const d: Item = toItem(metadata.name);
      return (
        (d === $item`Chateau Mantegna room key` &&
          chateaumantegna_available()) ||
        (d === $item`Distant Woods Getaway Brochure` &&
          auto_campawayAvailable()) ||
        (d === getDwelling() && !haveAnyIotmAlternativeRestSiteAvailable())
      );
    }
    if (metadata.name === $_f___HOT_TUB) {
      return isHotTubAvailable();
    }
    if (metadata.name === $_f___NUNS) {
      return getProperty("sidequestNunsCompleted") !== "none";
    }
    return true;
  }

  function is_currently_useable(): boolean {
    if (metadata.type === "item") {
      const i: Item = toItem(metadata.name);
      if (i.dailyusesleft === 0) {
        return false;
      }
      const mall_buyable: boolean = canInteract() && auto_mall_price(i) > 0;
      const npc_meat_buyable: boolean = npcPrice(i) > 0;
      const coinmaster_buyable: boolean =
        i.seller !== Coinmaster.none &&
        isAccessible(i.seller) &&
        toBoolean(getProperty("autoSatisfyWithCoinmasters"));

      const can_buy: boolean =
        meat_reserve < myMeat() && (npc_meat_buyable || mall_buyable);
      return availableAmount(i) > 0 || can_buy || coinmaster_buyable;
    }
    if (metadata.type === "skill") {
      return auto_have_skill(toSkill(metadata.name));
    }
    if (metadata.type === "dwelling") {
      return useFreeRests && haveFreeRestAvailable();
    }
    if (metadata.name === $_f___HOT_TUB) {
      return hotTubSoaksRemaining() > 0;
    }
    if (metadata.name === $_f___NUNS) {
      return toInt(getProperty("nunsVisits")) < 3;
    }
    return true;
  }

  function have_required_resources(): boolean {
    //this is used to quickly remove unavailable restorers from consideration before we even do any optimization.
    //for skills, the value of total_uses_available assumes we will not restore_mp to cast. so we overrule it in this function by comparing to our maxmp instead.
    if (metadata.type === "skill") {
      const s: Skill = toSkill(metadata.name);
      if (s.dailylimit !== -1) {
        return s.dailylimit > 0;
      }
      if (myMaxmp() >= mpCost(s)) {
        return true;
      }
    }
    //for everything that is not a skill we trust total_uses_available.
    return get_value("total_uses_available") > 0.0;
  }

  function restores_needed_resources(): boolean {
    if (hp_goal > myHp() && get_value("hp_restored_per_use") === 0) {
      return false;
    }
    if (mp_goal > myMp() && get_value("mp_restored_per_use") === 0) {
      return false;
    }
    return true;
  }

  function meets_hard_reserve_limit(): boolean {
    return get_value("total_uses_remaining") >= get_value("hard_reserve_limit");
  }

  optimization_parameters.metadata = metadata;
  set_value("hp_goal", hp_goal);
  set_value("hp_starting", myHp());
  set_value("hp_max", myMaxhp());
  set_value("hp_restored_per_use", hp_restored_per_use());
  set_value("hp_uses_needed_for_goal", uses_needed_to_reach_goal("hp"));
  set_value("mp_goal", mp_goal);
  set_value("mp_starting", myMp());
  set_value("mp_max", myMaxmp());
  set_value("mp_restored_per_use", mp_restored_per_use());
  set_value("mp_uses_needed_for_goal", uses_needed_to_reach_goal("mp"));
  set_value("meat_per_use", meat_per_use());
  set_value("tokens_per_use", tokens_per_use());
  set_value("total_uses_needed", total_uses_needed());
  set_value("total_buyable", total_buyable());
  set_value("total_creatable", total_creatable());
  set_value("soft_reserve_limit", metadata.softReserveLimit);
  set_value("hard_reserve_limit", metadata.hardReserveLimit);
  set_value("total_uses_available", total_uses_available());
  set_value("total_uses_remaining", total_uses_remaining()); // candidate for removal
  set_value("soft_reserve_limit_uses", soft_reserve_limit_uses());
  set_value("hp_max_restorable", max_restorable("hp"));
  set_value("hp_total_restored", total_restored("hp"));
  set_value("hp_total_wasted_goal", blood_adjusted_waste(hp_goal)); // candidate for removal
  set_value("hp_total_short_goal", total_short("hp", hp_goal));
  set_value("hp_total_wasted_max", blood_adjusted_waste(myMaxhp()));
  set_value("hp_total_short_max", total_short("hp", myMaxhp())); // candidate for removal
  set_value("mp_max_restorable", max_restorable("mp"));
  set_value("mp_total_restored", total_restored("mp"));
  set_value("mp_total_wasted_goal", total_wasted("mp", mp_goal)); // candidate for removal
  set_value("mp_total_short_goal", total_short("mp", mp_goal));
  set_value("mp_total_wasted_max", total_wasted("mp", myMaxmp()));
  set_value("mp_total_short_max", total_short("mp", myMaxmp())); // candidate for removal
  set_value("total_mp_used", total_mp_used());
  set_value("total_meat_used", total_meat_used());
  set_value("meat_available_to_spend", meat_available_to_spend());
  set_value("total_coinmaster_tokens_used", total_coinmaster_tokens_used());
  set_value("hp_per_meat_spent", resource_value_per_meat_spent("hp"));
  set_value(
    "hp_per_coinmaster_token_spent",
    resource_value_per_coinmaster_token_spent("hp"),
  );
  set_value("hp_per_mp_spent", hp_per_mp_spent());
  set_value("mp_per_meat_spent", resource_value_per_meat_spent("mp"));
  set_value(
    "mp_per_coinmaster_token_spent",
    resource_value_per_coinmaster_token_spent("mp"),
  );
  set_value$1("is_ever_useable", is_ever_useable());
  set_value$1("is_currently_useable", is_currently_useable());
  set_value$1("have_required_resources", have_required_resources());
  set_value$1("restores_needed_resources", restores_needed_resources());
  set_value$1("meets_hard_reserve_limit", meets_hard_reserve_limit());
  set_value(
    "blood_skill_opportunity_casts_goal",
    blood_skill_opportunity_casts(hp_goal),
  );
  set_value(
    "blood_skill_opportunity_casts_max",
    blood_skill_opportunity_casts(myMaxhp()),
  );
  set_value(
    "negative_status_effects_remaining",
    negative_status_effects_remaining(),
  );

  return optimization_parameters;
}
/**
 * Given a set of hp/mp goals and restoration options, determine which options are available to us and sort them from best to worst. Returns a set of options that the algorithm has determined are "equivalent" in value. Generally this should lead to an obvious best choice but when options are limited you may get several back.
 *
 * Implements a muli-objective optimization algorithm known as Kung's algorithm (not steps 1 and 2 are mostly handled by __calculate_objective_values above):
 *  1) apply a set of functions to each __RestorationMetadata which measure goals we want to minimize or maximize (e.g. total hp restored, mp cost, etc. see __calculate_objective_values)
 *  2) apply a set of constraint functions to remove any __RestorationMetadata which fail to meet baseline criteria (e.g. inaccessible in this path. see __calculate_objective_values)
 *  3) sort the set of available __RestorationMetadata by primary goals we want to maximize (see __PRIMARY_SORT_KEYS) from largest to smallest
 *  4) For each ranking, process the sorted set of __RestorationMetadata removing any dominated options based on the objective values for that rank until we are down to 1 option or a set of "equivalent" options
 *
 * Each value has a rank associated with it which you will find in the __OBJECTIVE_RANKS map. For step 3, the maximization sort, the value is calculated as a simple weighted sum and makes the algorithm in step 4 more efficient. For step 4, determining dominated options, each rank is its own pass over the set of options. This lets us weed out any options that are grossly outmatched in a category we care more about early on so we dont end up with an option that, say, minimizes mp use but ends up spending all your meat buying items. Each pass narrows down our options until we are left only with options that should be more or less equivalent, sorted from most maximized to least maximized (due to the first maximization sort).
 *
 * For more details on multi-objective optimization take a look at:
 *  https://engineering.purdue.edu/~sudhoff/ee630/Lecture09.pdf
 *  http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.206.4467&rep=rep1&type=pdf
 *  https://www.youtube.com/watch?v=LAC212ZwBB4
 *  https://www.youtube.com/watch?v=xLjfa8NXQD8
 *  https://www.youtube.com/watch?v=Hm2LK4vJzRw
 */
function __maximize_restore_options(
  hp_goal: number,
  mp_goal: number,
  meat_reserve: number,
  useFreeRests: boolean,
): Map<number, __RestorationOptimization> {
  // returns a sublist of p from [start, stop)
  function slice(
    p: Map<number, __RestorationOptimization>,
    start_1: number,
    stop: number,
  ): Map<number, __RestorationOptimization> {
    const subset: Map<number, __RestorationOptimization> = new Map();
    if (start_1 >= 0 && start_1 <= p.size && stop >= 0 && stop <= p.size) {
      let i: number = start_1;
      while (i < stop) {
        subset.set(
          subset.size,
          p.get(i) ?? p.set(i, new __RestorationOptimization()).get(i),
        );
        i++;
      }
    }
    return subset;
  }
  // returns a copy of p
  function copy(
    p: Map<number, __RestorationOptimization>,
  ): Map<number, __RestorationOptimization> {
    return slice(p, 0, p.size);
  }
  // adds all elements in right to left, does not create a new aggregate. left is returned for convenience

  function weighted_sum(
    o: __RestorationOptimization,
    keys: Map<string, boolean>,
    value_ranks: Map<string, number>,
  ): number {
    let sum: number = 0.0;
    for (const [s] of keys) {
      sum +=
        (o.objectiveValues.get(s) ?? o.objectiveValues.set(s, 0.0).get(s)) *
        (value_ranks.get(s) ?? value_ranks.set(s, 0).get(s));
    }
    return sum;
  }
  // return a set of ranks for the given keys (e.g. __OBJECTIVE_RANKS) in ascending order
  function ordered_ranks(weights: Map<string, number>): Map<number, number> {
    let unordered: Map<number, number> = new Map();
    const value_set: Map<number, boolean> = new Map();
    for (const [, w] of weights) {
      if (!value_set.has(w)) {
        value_set.set(w, true);
        unordered.set(unordered.size, w);
      }
    }
    unordered = new Map([...unordered.entries()].sort((a, b) => a[1] - b[1]));
    return unordered;
  }
  /**
   * Returns a set of __RestorationOptimization which are not dominated by any other element in the set. In other words it combines T and B into a single set, removing any elements that are demonstrably worse than another element. Naming conventions come from commonly used symbols in the algorithms implementation, so if they feel weird blame mathemeticians.
   *
   * An element is non dominated for a given set of value keys and weights if:
   *  1. the element is no worse in every category than all other elements
   *  2. the element is better than another element in at least one category
   *
   * For a more indepth explaination of dominance/non-dominance see: https://www.youtube.com/watch?v=xLjfa8NXQD8
   *
   * The values are only considered if they match the current rank. This lets us pass over the set multiple times to weed out bad options in phases.
   *
   * Assumptions:
   *  1. All elements in T are non-dominated by each other
   *  2. All elements in B are non-dominated by each other
   *  3. All elements in T and B have already had their relevant objective valus calculated
   *  4. All keys in `maximize_keys` and `minimize_keys` are present in every element of both T and B
   */
  function non_dominated_set(
    T: Map<number, __RestorationOptimization>,
    B: Map<number, __RestorationOptimization>,
    value_ranks: Map<string, number>,
    rank: number,
    maximize_keys: Map<string, boolean>,
    minimize_keys: Map<string, boolean>,
  ): Map<number, __RestorationOptimization> {
    const M: Map<number, __RestorationOptimization> = new Map();
    const dominated: Map<string, boolean> = new Map();

    let Ti: number = 0;
    let Bi: number;

    while (Ti < T.size) {
      Bi = 0;
      while (Bi < B.size) {
        if (
          dominated.has(
            (B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi))
              .metadata.name,
          )
        ) {
          Bi++;
          continue;
        }

        let T_dominance: number = 0;
        let B_dominance: number = 0;
        for (const [key, r] of value_ranks) {
          if (r === rank) {
            if (
              ((
                T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti)
              ).objectiveValues.get(key) ??
                (
                  T.get(Ti) ??
                  T.set(Ti, new __RestorationOptimization()).get(Ti)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key)) === -1.0 ||
              ((
                B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi)
              ).objectiveValues.get(key) ??
                (
                  B.get(Bi) ??
                  B.set(Bi, new __RestorationOptimization()).get(Bi)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key)) === -1.0
            ) {
              continue; // -1.0 means the key is not applicable to an option, e.g. hp_per_mp_spent on free rests which dont cost mp
            }
            if (
              ((
                T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti)
              ).objectiveValues.get(key) ??
                (
                  T.get(Ti) ??
                  T.set(Ti, new __RestorationOptimization()).get(Ti)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key)) <
              ((
                B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi)
              ).objectiveValues.get(key) ??
                (
                  B.get(Bi) ??
                  B.set(Bi, new __RestorationOptimization()).get(Bi)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key))
            ) {
              if (maximize_keys.has(key)) {
                B_dominance++;
              } else if (minimize_keys.has(key)) {
                T_dominance++;
              }
            } else if (
              ((
                T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti)
              ).objectiveValues.get(key) ??
                (
                  T.get(Ti) ??
                  T.set(Ti, new __RestorationOptimization()).get(Ti)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key)) >
              ((
                B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi)
              ).objectiveValues.get(key) ??
                (
                  B.get(Bi) ??
                  B.set(Bi, new __RestorationOptimization()).get(Bi)
                ).objectiveValues
                  .set(key, 0.0)
                  .get(key))
            ) {
              if (maximize_keys.has(key)) {
                T_dominance++;
              } else if (minimize_keys.has(key)) {
                B_dominance++;
              }
            }
          }
        }

        if (T_dominance > B_dominance) {
          dominated.set(
            (B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi))
              .metadata.name,
            true,
          );
        } else if (B_dominance > T_dominance) {
          dominated.set(
            (T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti))
              .metadata.name,
            true,
          );
          break;
        }
        Bi++;
      }

      if (
        !dominated.has(
          (T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti))
            .metadata.name,
        )
      ) {
        M.set(
          M.size,
          T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti),
        );
      } else {
        auto_log_restore_debug(
          `Removed from consideration: ${to_string$1(T.get(Ti) ?? T.set(Ti, new __RestorationOptimization()).get(Ti), true)}`,
          1,
        );
      }
      Ti++;
    }

    Bi = 0;
    while (Bi < B.size) {
      if (
        !dominated.has(
          (B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi))
            .metadata.name,
        )
      ) {
        M.set(
          M.size,
          B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi),
        );
      } else {
        auto_log_restore_debug(
          `Removed from consideration: ${to_string$1(B.get(Bi) ?? B.set(Bi, new __RestorationOptimization()).get(Bi), true)}`,
          1,
        );
      }
      Bi++;
    }
    return M;
  }

  function ranked_optimization(
    p: Map<number, __RestorationOptimization>,
    value_ranks: Map<string, number>,
    rank: number,
    maximize_keys: Map<string, boolean>,
    minimize_keys: Map<string, boolean>,
  ): Map<number, __RestorationOptimization> {
    if (p.size === 1) {
      return p;
    } else {
      const mid: number = floor(p.size / 2);
      const T: Map<number, __RestorationOptimization> = ranked_optimization(
        slice(p, 0, mid),
        value_ranks,
        rank,
        maximize_keys,
        minimize_keys,
      );
      const B: Map<number, __RestorationOptimization> = ranked_optimization(
        slice(p, mid, p.size),
        value_ranks,
        rank,
        maximize_keys,
        minimize_keys,
      );
      return non_dominated_set(
        T,
        B,
        value_ranks,
        rank,
        maximize_keys,
        minimize_keys,
      );
    }
  }

  function ranked_optimization$1(
    p: Map<number, __RestorationOptimization>,
    value_ranks: Map<string, number>,
    maximize_keys: Map<string, boolean>,
    minimize_keys: Map<string, boolean>,
  ): Map<number, __RestorationOptimization> {
    auto_log_restore_debug(
      `Beginning optimization of ${p.size} restoration options.`,
      1,
    );
    if (p.size === 0) {
      return p;
    }

    let ranked: Map<number, __RestorationOptimization> = copy(p);
    const ranks: Map<number, number> = ordered_ranks(value_ranks);
    auto_log_restore_debug(
      `${ranked.size} options before optimization: ${to_string$2(ranked, false)}`,
      2,
    );
    for (const [, rank] of ranks) {
      const desc: string = __RANKED_GOAL_DESCRIPTIONS.has(rank)
        ? (__RANKED_GOAL_DESCRIPTIONS.get(rank) ??
          __RANKED_GOAL_DESCRIPTIONS.set(rank, "").get(rank))
        : "whoops, someone changed things and didnt update the descriptions. Bad dev.";
      auto_log_restore_debug(
        `Rank ${rank} optimization, prefer to... ${desc}`,
        1,
      );
      if (ranked.size <= 1) {
        break;
      }
      ranked = ranked_optimization(
        ranked,
        value_ranks,
        rank,
        maximize_keys,
        minimize_keys,
      );
    }
    return ranked;
  }

  function partition(
    p: Map<number, __RestorationOptimization>,
    sort_keys: Map<string, boolean>,
    value_ranks: Map<string, number>,
    left_index: number,
    right_index: number,
  ): number {
    const pivot_value: number = toInt(
      weighted_sum(
        p.get(left_index) ??
          p.set(left_index, new __RestorationOptimization()).get(left_index),
        sort_keys,
        value_ranks,
      ),
    );
    let l: number = left_index + 1;
    let r: number = right_index;
    let done: boolean = false;

    while (!done) {
      while (l <= r) {
        if (
          weighted_sum(
            p.get(l) ?? p.set(l, new __RestorationOptimization()).get(l),
            sort_keys,
            value_ranks,
          ) >= pivot_value
        ) {
          l++;
        } else {
          break;
        }
      }

      while (r >= l) {
        if (
          weighted_sum(
            p.get(r) ?? p.set(r, new __RestorationOptimization()).get(r),
            sort_keys,
            value_ranks,
          ) <= pivot_value
        ) {
          r--;
        } else {
          break;
        }
      }

      if (r < l) {
        done = true;
      } else {
        const swap: __RestorationOptimization =
          p.get(l) ?? p.set(l, new __RestorationOptimization()).get(l);
        p.set(l, p.get(r) ?? p.set(r, new __RestorationOptimization()).get(r));
        p.set(r, swap);
      }
    }

    const swap: __RestorationOptimization =
      p.get(left_index) ??
      p.set(left_index, new __RestorationOptimization()).get(left_index);
    p.set(
      left_index,
      p.get(r) ?? p.set(r, new __RestorationOptimization()).get(r),
    );
    p.set(r, swap);

    return r;
  }

  function quick_sort_maximize(
    p: Map<number, __RestorationOptimization>,
    sort_keys: Map<string, boolean>,
    value_ranks: Map<string, number>,
    left_index: number,
    right_index: number,
  ): void {
    if (left_index < right_index) {
      const pivot: number = partition(
        p,
        sort_keys,
        value_ranks,
        left_index,
        right_index,
      );
      quick_sort_maximize(p, sort_keys, value_ranks, left_index, pivot - 1);
      quick_sort_maximize(p, sort_keys, value_ranks, pivot + 1, right_index);
    }
  }

  function quick_sort_maximize$1(
    p: Map<number, __RestorationOptimization>,
    sort_keys: Map<string, boolean>,
    value_ranks: Map<string, number>,
  ): void {
    auto_log_restore_debug(
      `Sorting ${p.size} options by primary objectives.`,
      1,
    );
    if (p.size > 1) {
      quick_sort_maximize(p, sort_keys, value_ranks, 0, p.size - 1);
    }
  }

  function apply_constraints(
    p: Map<number, __RestorationOptimization>,
    constraint_keys: Map<string, boolean>,
  ): Map<number, __RestorationOptimization> {
    const c: number = p.size;
    auto_log_restore_debug(`Applying constraints to ${c} objective values.`, 1);

    const constrained: Map<number, __RestorationOptimization> = new Map();

    for (const [, o] of p) {
      let fail: boolean = false;
      for (const [c_1] of constraint_keys) {
        if (!(
          o.constraints.get(c_1) ?? o.constraints.set(c_1, false).get(c_1)
        )) {
          fail = true;
          break;
        }
      }
      if (!fail) {
        constrained.set(constrained.size, o);
      }
    }

    auto_log_restore_debug(
      `Removed  ${c - constrained.size} restore options from consideration.`,
      1,
    );

    return constrained;
  }

  function calculate_objective_values(): Map<
    number,
    __RestorationOptimization
  > {
    if ($_f___restore_maximizer_cache.size > 0) {
      auto_log_restore_debug(
        "Recalculating cached restore objective values.",
        0,
      );
      for (const [i, o] of $_f___restore_maximizer_cache) {
        const _val = __calculate_objective_values(
          hp_goal,
          mp_goal,
          meat_reserve,
          useFreeRests,
          o.metadata,
        );
        $_f___restore_maximizer_cache.set(i, _val);
      }
    } else {
      auto_log_restore_debug("Calculating restore objective values.", 0);
      for (const [, metadata] of __restoration_methods()) {
        const o: __RestorationOptimization = __calculate_objective_values(
          hp_goal,
          mp_goal,
          meat_reserve,
          useFreeRests,
          metadata,
        );
        if (
          o.constraints.get("is_ever_useable") ??
          o.constraints.set("is_ever_useable", false).get("is_ever_useable")
        ) {
          $_f___restore_maximizer_cache.set(
            $_f___restore_maximizer_cache.size,
            o,
          );
        }
      }
    }

    return $_f___restore_maximizer_cache;
  }

  let optimized: Map<number, __RestorationOptimization> =
    calculate_objective_values();
  optimized = apply_constraints(optimized, __CONSTRAINT_KEYS);
  quick_sort_maximize$1(optimized, __PRIMARY_SORT_KEYS, __OBJECTIVE_RANKS);
  return ranked_optimization$1(
    optimized,
    __OBJECTIVE_RANKS,
    __MAXIMIZE_KEYS,
    __MINIMIZE_KEYS,
  );
}

function __restore(
  resource_type: string,
  goal: number,
  meat_reserve: number,
  useFreeRests: boolean,
): boolean {
  function current_resource(): number {
    if (resource_type === "hp") {
      return myHp();
    } else if (resource_type === "mp") {
      return myMp();
    }
    return -1;
  }

  function max_resource(): number {
    if (resource_type === "hp") {
      return myMaxhp();
    } else if (resource_type === "mp") {
      return myMaxmp();
    }
    return -1;
  }

  function hp_target(): number {
    if (resource_type === "hp") {
      return goal;
    } else {
      return myHp();
    }
  }

  function mp_target(): number {
    if (resource_type === "mp") {
      return goal;
    } else {
      return myMp();
    }
  }

  function pick_blood_skill(final_hp: number): Skill {
    const bloodBondAvailable: boolean =
      auto_have_skill($skill`Blood Bond`) &&
      pathHasFamiliar() &&
      myMaxhp() > hpCost($skill`Blood Bond`) &&
      final_hp > (9 - hp_regen()) * 10 &&
      toBoolean(
        // blood bond drains hp after combat, make sure we dont accidentally kill the player
        getProperty("auto_restoreUseBloodBond"),
      );

    const bloodBubbleAvailable: boolean =
      auto_have_skill($skill`Blood Bubble`) &&
      myMaxhp() > hpCost($skill`Blood Bubble`);

    let blood_skill: Skill = Skill.none;
    if (bloodBondAvailable && bloodBubbleAvailable) {
      if (haveEffect($effect`Blood Bond`) > haveEffect($effect`Blood Bubble`)) {
        blood_skill = $skill`Blood Bubble`;
      } else {
        blood_skill = $skill`Blood Bond`;
      }
    } else if (bloodBondAvailable) {
      blood_skill = $skill`Blood Bond`;
    } else if (bloodBubbleAvailable) {
      blood_skill = $skill`Blood Bubble`;
    }
    return blood_skill;
  }

  function use_opportunity_blood_skills(
    hp_restored_per_use_1: number,
    final_hp: number,
  ): boolean {
    if (
      !auto_have_skill($skill`Blood Bond`) &&
      !auto_have_skill($skill`Blood Bubble`)
    ) {
      return false;
    }
    const restored: number = myHp() + hp_restored_per_use_1;
    const waste: number = min(myHp() - 1, restored - myMaxhp());
    if (waste <= 0) {
      return true;
    }
    // both blood skills we care about cost 30
    const casts_total: number = waste / 30;
    if (casts_total <= 0) {
      return true;
    }
    // ratio should be 1 / the number of turns of that effect per cast
    const skill_ratios: Map<Skill, number> = new Map();
    let total_ratio: number = 0.0;
    if (auto_have_skill($skill`Blood Bubble`)) {
      const bubble_ratio: number = 1.0 / 3.0;
      skill_ratios.set($skill`Blood Bubble`, bubble_ratio);
      total_ratio += bubble_ratio;
    }
    if (auto_have_skill($skill`Blood Bond`)) {
      const bond_ratio: number = 1.0 / 10.0;
      skill_ratios.set($skill`Blood Bond`, bond_ratio);
      total_ratio += bond_ratio;
    }
    let casts_so_far: number = 0;
    const to_cast: Map<Skill, number> = new Map();
    for (const [sk, ratio] of skill_ratios) {
      const times_to_cast: number = floor((casts_total * ratio) / total_ratio);
      to_cast.set(sk, times_to_cast);
      casts_so_far += times_to_cast;
    }
    if (casts_so_far < casts_total) {
      to_cast.set(
        pick_blood_skill(final_hp),
        (to_cast.get(pick_blood_skill(final_hp)) ?? 0) +
          casts_total -
          casts_so_far,
      );
    }
    let success: boolean = true;
    for (const [sk, times] of to_cast) {
      success = toBoolean(toInt(success) & toInt(useSkill(times, sk)));
    }
    return success;
  }

  function use_restore(
    metadata: __RestorationMetadata,
    meat_reserve: number,
    useFreeRests: boolean,
  ): boolean {
    if (metadata.name === "") {
      return false;
    }

    auto_log_info(
      `Using ${metadata.type} ${metadata.name} as restore.`,
      "blue",
    );
    if (metadata.type === "item") {
      const i: Item = toItem(metadata.name);
      return retrieveItem(1, i) && use(1, i);
    }

    if (metadata.type === "dwelling") {
      return doFreeRest();
    }

    if (metadata.name === $_f___HOT_TUB) {
      const pre_soaks: number = hotTubSoaksRemaining();
      return doHottub() === pre_soaks - 1;
    }
    if (metadata.name === $_f___NUNS) {
      const pre_visits: number = toInt(getProperty("nunsVisits"));
      cliExecute("nuns");
      const post_visits: number = toInt(getProperty("nunsVisits"));
      return pre_visits === post_visits - 1;
    }

    if (metadata.type === "skill") {
      const s: Skill = toSkill(metadata.name);
      if (myMp() < mpCost(s) && !acquireMP(mpCost(s), 0, useFreeRests)) {
        auto_log_warning(`Couldnt acquire enough MP to cast ${s}`, "red");
        return false;
      }
      return useSkill(1, s);
    }

    return false;
  }

  function list_to_string(e_list: Map<Effect, boolean>): string {
    let s: string = "[";
    let first: boolean = true;
    for (const e of e_list.keys()) {
      if (first) {
        first = false;
      } else {
        s += ", ";
      }
      s += e.toString();
    }
    s += "]";
    return s;
  }

  function negative_effects(): Map<Effect, boolean> {
    const negative: Map<Effect, boolean> = new Map();
    for (const [e] of Object.entries(myEffects()).map(
      ([_k, _v]) => [Effect.get(_k), _v] as [Effect, number],
    )) {
      if ($_f___all_negative_effects.has(e)) {
        negative.set(e, true);
      }
    }
    return negative;
  }

  function recover_discount_pants(): void {
    for (const discountpants of $items`designer sweatpants, Travoltan trousers`) {
      if (closetAmount(discountpants) > 0) {
        takeCloset(1, discountpants);
      }
    }
  }

  auto_log_info(
    `Target ${resource_type} => ${goal} - Considering restore options at ${myHp()}/${myMaxhp()} HP with ${myMp()}/${myMaxmp()} MP`,
    "blue",
  );
  auto_log_info$1(
    `Active Negative Effects => ${list_to_string(negative_effects())}`,
  );

  while (current_resource() < goal) {
    if (goal > max_resource()) {
      //prevent infinite loop in case maxHP or maxMP dropped below goal
      goal = max_resource();
    }
    const options: Map<number, __RestorationOptimization> =
      __maximize_restore_options(
        hp_target(),
        mp_target(),
        meat_reserve,
        useFreeRests,
      );
    if (options.size === 0) {
      auto_log_error(
        `Target ${resource_type} => ${goal} - couldnt determine an effective restoration mechanism`,
      );
      if (
        toBoolean(getProperty("auto_ignoreRestoreFailure")) ||
        toBoolean(getProperty("_auto_ignoreRestoreFailureToday"))
      ) {
        auto_log_error("Ignoring the error as per user instructions");
        return false;
      }
      print(
        "Aborting due to restore failure... you can override this setting for today by entering in gCLI:",
        "blue",
      );
      print("set _auto_ignoreRestoreFailureToday = true", "blue");
      print(
        "You can override this setting forever by entering in gCLI:",
        "blue",
      );
      print("set auto_ignoreRestoreFailure = true", "blue");
      abort();
    }

    let success: boolean = false;
    for (const [, o] of options) {
      if (
        o.metadata.type === "item" &&
        itemAmount(toItem(o.metadata.name)) === 0
      ) {
        //prevent infinite loop by discount pants when buying from NPC store
        for (const discountpants of $items`designer sweatpants, Travoltan trousers`) {
          if (itemAmount(discountpants) > 0) {
            let mustnotpants: boolean = false;
            cliExecute(`whatif equip ${discountpants}; quiet`);
            if (
              resource_type === "hp" &&
              goal > numericModifier("_spec", "Buffed HP Maximum")
            ) {
              mustnotpants = true;
            }
            if (
              resource_type === "mp" &&
              goal > numericModifier("_spec", "Buffed MP Maximum")
            ) {
              mustnotpants = true;
            }
            if (mustnotpants) {
              auto_log_info$1("Avoiding any discount pants restore loops");
              putCloset(1, discountpants); //yes this was the recommended and only? way to make mafia not auto equip the discount pants
            }
          }
        }
      }
      use_opportunity_blood_skills(
        toInt(
          o.vars.get("hp_restored_per_use") ??
            o.vars.set("hp_restored_per_use", 0.0).get("hp_restored_per_use"),
        ),
        toInt(
          myHp() +
            (o.vars.get("hp_total_restored") ??
              o.vars.set("hp_total_restored", 0.0).get("hp_total_restored")),
        ),
      );
      success = use_restore(o.metadata, meat_reserve, useFreeRests);
      if (success) {
        break;
      } else {
        auto_log_warning$1(
          `Target ${resource_type} => ${goal} option ${o.metadata.name} failed. Trying next option (if available).`,
        );
      }
    }

    if (!success) {
      // did we have exactly one option and fail to cast rest upside down because we have a back item with +HP/MP?
      if (
        options.size === 1 &&
        (
          options.get(0) ??
          options.set(0, new __RestorationOptimization()).get(0)
        ).metadata.name === "rest upside down"
      ) {
        const current_back: Item = equippedItem($slot`back`);
        // do we have less than max minus what the back item provides
        if (
          current_resource() <
          max_resource() -
            numericModifier(current_back, `Maximum ${resource_type}`)
        ) {
          auto_log_info$1("Manually equipping the bat wings");
          equip($item`bat wings`);
          recover_discount_pants();
          success = useSkill(1, $skill`Rest upside down`);
          equip(current_back);
          return success;
        }
      }
      auto_log_warning(
        `Target ${resource_type} => ${goal} - Uh oh. All restore options tried (${options.size}) failed. Sorry.`,
        "red",
      );
      recover_discount_pants();
      return false;
    }
  }
  recover_discount_pants();
  return true;
}

export function __cure_bad_stuff(): void {
  for (const e of $effects`Hardly Poisoned at All, A Little Bit Poisoned, Somewhat Poisoned, Really Quite Poisoned, Majorly Poisoned, Toad In The Hole`) {
    if (haveEffect(e) > 0) {
      uneffect(e);
    }
  }
  // let mafia figure out how to best remove beaten up
  if (haveEffect($effect`Beaten Up`) > 0) {
    auto_log_info$1(
      "Ouch, you got beaten up. Lets get you patched up, if we can.",
    );
    uneffect($effect`Beaten Up`);

    if (haveEffect($effect`Beaten Up`) > 0) {
      auto_log_warning(
        "Well, you're still beaten up, thats probably not great...",
        "red",
      );
    }
  }
}
/**
 * Public Interface
 */

//Restoration (hp/mp) functions
export function invalidateRestoreOptionCache(): void {
  $_f___known_restoration_sources.clear();
  $_f___restore_maximizer_cache.clear();
}

/**
 * Try to acquire up to the mp goal, optionally buying items and using free rests. Will also cure poisoned and beaten up before restoring any mp.
 *
 * returns true if my_mp() >= goal after attempting to restore.
 */
export function acquireMP(
  goal: number,
  meat_reserve: number = meatReserve(),
  useFreeRests: boolean = true,
): boolean {
  //vampyres don't use MP
  if (in_darkGyffte()) {
    return false;
  } else if (in_zombieSlayer()) {
    // zombies have hordes not mp
    return zombieSlayer_acquireMP(goal, meat_reserve);
  }

  const isMax: boolean = goal === myMaxmp();

  __cure_bad_stuff();

  if (isMax) {
    goal = myMaxmp(); //in case max rose after curing the bad stuff
  } else if (goal > myMaxmp()) {
    return false;
  } else if (myMp() >= goal) {
    return true;
  }
  //since we need to restore, lets reduce MP cost of future skills
  buffMaintain$4($effect`The Odour of Magick`);
  buffMaintain$4($effect`Using Protection`);
  //also use items/skills which give free mp regen
  buffMaintain$4($effect`Tingly Tongue`);
  buffMaintain$4($effect`Tingling Insides`);
  buffMaintain$4($effect`Wisdom of the Autumn Years`);
  if (
    auto_equipAprilShieldBuff() &&
    !toBoolean(getProperty("_aprilShowerSimmer"))
  ) {
    //Free mp regen on the first cast of the day with the April Shower Thoughts Shield equipped
    buffMaintain$4($effect`Simmering`);
  }
  // Sausages restore 999MP, this is a pretty arbitrary cutoff but it should reduce pain
  // TODO: move this to general effectiveness method
  if (myMaxmp() - myMp() > 300) {
    if (!auto_sausageBlocked()) {
      if (
        itemAmount($item`magical sausage`) < 1 &&
        toInt(getProperty("_sausagesMade")) < 23
      ) {
        auto_sausageGrind(1);
      }
      auto_sausageEatEmUp(1); //this involve outfit changes which can lower our maxMP to below what goal was. which would cause infinite loop
      goal = min(goal, myMaxmp());
    }
  }
  // 5 Soulsauce restores 15 MP and only has opportunity cost against its other uses as buff or combat stun
  // unless objective value of combat stun exists there is no way to compare to other restore methods so it's always the best if available?
  if (myClass() === $class`Sauceror`) {
    const MPtoRestore: number = goal - myMp();
    let casts: number = ceil(toFloat(MPtoRestore) / 15.0); //soul food restores 15 MP per cast.
    casts = min(casts, mySoulsauce() / 5); //soul food costs 5 soulsauce per cast.
    if (casts > 0) {
      const excessMP: number = myMp() + 15 * casts - myMaxmp(); //if some of the restored MP would be wasted over max
      if (excessMP > 0) {
        //try to burn the excess on buffs
        if (myMp() < excessMP && casts > 1) {
          //can't burn MP we don't have yet
          casts -= 1;
          useSkill(1, $skill`Soul Food`);
        }
        if (myMp() > 0) {
          auto_burnMP(min(excessMP, myMp()));
        }
      }
      useSkill(casts, $skill`Soul Food`);
      if (myMp() >= goal) {
        return true;
      }
    }
  }
  if (
    canUseSweatpants() &&
    (getSweat() >= 95 || myMeat() < meatReserve() + 500)
  ) {
    const MPtoRestore: number = goal - myMp();
    let casts: number = ceil(toFloat(MPtoRestore) / 50.0);
    casts = min(casts, (getSweat() - 90) / 5);
    if (casts > 0) {
      const excessMP: number = myMp() + 50 * casts - myMaxmp(); //if some of the restored MP would be wasted over max
      if (excessMP > 0) {
        //try to burn the excess on buffs
        if (myMp() < excessMP && casts > 1) {
          //can't burn MP we don't have yet
          casts -= 1;
          useSkill(1, $skill`Sip Some Sweat`);
        }
        if (myMp() > 0) {
          auto_burnMP(min(excessMP, myMp()));
        }
      }
      useSkill(casts, $skill`Sip Some Sweat`);
      if (myMp() >= goal) {
        return true;
      }
    }
  }

  __restore("mp", goal, meat_reserve, useFreeRests);
  return myMp() >= goal;
}
/**
 * Try to acquire the smaller of your max HP and 800 HP (useFreeRests: true). Will also cure poisoned and beaten up before restoring any hp.
 *
 * returns true if my_hp() >= min(my_maxhp(), 800) after attempting to restore.
 */
export function acquireHP(): boolean {
  let goal: number = min(myMaxhp(), 800);
  if (myPath() === $path`Disguises Delimit`) {
    // hockey mask deals 75% hp damage at the start of combat so we need to maintain a high percentage of hp
    goal = toInt(myMaxhp() * 0.8);
  }
  if (in_amw()) {
    // limited restores & meat is important, needs lower default
    goal = toInt(myMaxhp() * 0.6);
  }
  return acquireHP$1(goal);
}
/**
 * Try to acquire your max hp (useFreeRests: true). Will also cure poisoned and beaten up before restoring any hp.
 *
 * returns true if my_hp() >= my_maxhp() after attempting to restore.
 */
export function acquireFullHP(): boolean {
  return acquireHP$1(myMaxhp());
}
/**
 * Try to acquire up to the hp goal (useFreeRests: true). Will also cure poisoned and beaten up before restoring any hp.
 *
 * returns true if my_hp() >= goal after attempting to restore.
 */
export function acquireHP$1(goal: number): boolean {
  return acquireHP$2(goal, meatReserve());
}
/**
 * Try to acquire up to the hp goal, optionally buying items (useFreeRests: true). Will also cure poisoned and beaten up before restoring any hp.
 *
 * returns true if my_hp() >= goal after attempting to restore.
 */
function acquireHP$2(goal: number, meat_reserve: number): boolean {
  return acquireHP$3(goal, meat_reserve, true);
}

function acquireHP$3(
  goal: number,
  meat_reserve: number,
  useFreeRests: boolean,
): boolean {
  //Try to acquire up to the hp goal, optionally buying items and using free rests. Will also cure poisoned and beaten up before restoring any hp.
  //returns true if my_hp() >= goal after attempting to restore.

  if (isActuallyEd()) {
    return edAcquireHP();
  }
  //vampyres can only be restored using blood bags, which are too valuable to waste on healing HP.
  //better to make food/drink from them and then rest in your coffin
  if (in_darkGyffte()) {
    if (myHp() === 0) {
      //if currently at 0, can't adventure. Use an adventure to rest in your coffin. Might as well check for skill changes
      bat_reallyPickSkills(20);
      return true;
    }
    return false;
  }
  // HP is irrelevant in Pocket Familiars, this removes the function to restore HP
  // except in the case of A-Boo Peak, meeting Dr. Awkward, and the hedge maze
  if (in_pokefam() && !toBoolean(getProperty("_auto_forcePokefamRestore"))) {
    return false;
  }
  setProperty("_auto_forcePokefamRestore", false.toString());
  //owning a hand in glove breaks maxHP tracking. need to check possession rather than equipped because unequipping it also breaks it. in fact it causes us to get stuck in an infinite loop of trying to restore hp when already at max HP.
  //mafia devs think it is actually a kol bug so they won't fix it. https://kolmafia.us/showthread.php?25214
  if (possessEquipment($item`Hand in Glove`)) {
    const initial_maxHP: number = myMaxhp();
    cliExecute("refresh status");
    if (initial_maxHP === myMaxhp()) {
      auto_log_restore_debug(
        "I just refreshed status because I detected [Hand in Glove]. But it turned out to not have been necessary",
        1,
      );
    } else {
      auto_log_restore_debug(
        "I just refreshed status because I detected [Hand in Glove] and it corrected my maxHP value. This prevented an infinite loop",
        0,
      );
    }
  }

  const isMax: boolean = goal === myMaxhp();

  __cure_bad_stuff();

  if (isMax) {
    goal = myMaxhp(); //in case max rose after curing the bad stuff
  } else if (goal > myMaxhp()) {
    return false;
  } else if (myHp() >= goal * 0.95) {
    return true;
  }

  buffMaintain$4($effect`Extra-Green`);

  if (myClass() === $class`Pig Skinner` && haveSkill($skill`Second Wind`)) {
    return auto_pigSkinnerAcquireHP(toInt(0.7 * goal));
  }
  if (
    myClass() === $class`Cheese Wizard` &&
    haveSkill($skill`Emmental Elemental`)
  ) {
    return auto_cheeseWizardAcquireHP(
      toInt(goal - 0.3 * myBuffedstat($stat`Moxie`)),
    );
  }
  if (myClass() === $class`Jazz Agent` && haveSkill($skill`Grit Teeth`)) {
    return auto_jazzAgentAcquireHP(goal - 60);
  }
  if (is_boris()) {
    return borisAcquireHP(goal);
  }
  if (in_zombieSlayer()) {
    return zombieSlayer_acquireHP(goal);
  }
  if (myClass() === $class`Plumber`) {
    while (
      myHp() < goal &&
      myHp() < myMaxhp() &&
      itemAmount($item`coin`) > 400
    ) {
      retrieveItem(1, $item`super deluxe mushroom`);
      use(1, $item`super deluxe mushroom`);
    }
    if (myHp() <= 10) {
      auto_log_info$1("Spending a turn to heal.");
      visitUrl("place.php?whichplace=mario&action=mush_saveblock");
    }
  } else {
    // Simplifies restoration massively, make that our first choice
    if (haveSkill($skill`Cannelloni Cocoon`)) {
      let coc_tries: number = 0;
      while (goal - myHp() > 20 && coc_tries++ < 3) {
        useSkill($skill`Cannelloni Cocoon`);
      }
    }
    __restore("hp", goal, meat_reserve, useFreeRests);
  }

  return myHp() >= goal;
}
/*
 * Use a rest (can consume adventures if no free rests remain). Also attempts to maximize
 * chateau bonus from resting if possible.
 *
 * TODO: if resting in campaway camp, check if we can/should use a burnt stick to get extra stats
 *
 * returns the number of times rested today (caller will have to work out if it rested or not)
 */
export function doRest(): number {
  if (
    auto_haveCrimboSkeleton() &&
    toInt(getProperty("_knuckleboneRests")) < 5
  ) {
    useFamiliar($familiar`Skeleton of Crimbo Past`);
  }
  // Elf toilet requires campground!

  if (auto_elfToiletReady()) {
    cliExecute("campground rest campground");

    if (!get("_porkElfToiletUsed") || auto_elfToiletReady()) {
      abort(`Expected elf toilet to have been used, but was not.`);
    }
  } else if (chateaumantegna_available()) {
    cliExecute("outfit save Backup");
    chateaumantegna_nightstandSet();

    const restBonus: Map<Item, boolean> = chateaumantegna_decorations();
    let bonus: Stat = Stat.none;
    if (restBonus.has($item`electric muscle stimulator`)) {
      bonus = $stat`Muscle`;
    } else if (restBonus.has($item`foreign language tapes`)) {
      bonus = $stat`Mysticality`;
    } else if (restBonus.has($item`bowl of potpourri`)) {
      bonus = $stat`Moxie`;
    }

    let closet: boolean = false;
    let grab: Item = Item.none;
    let replace_1: Item = Item.none;
    switch (bonus) {
      case $stat`Muscle`:
        replace_1 = equippedItem($slot`off-hand`);
        grab = $item`fake washboard`;
        break;
      case $stat`Mysticality`:
        replace_1 = equippedItem($slot`off-hand`);
        grab = $item`basaltamander buckler`;
        break;
      case $stat`Moxie`:
        replace_1 = equippedItem($slot`weapon`);
        grab = $item`backwoods banjo`;
        break;
    }

    if (
      grab !== Item.none &&
      possessEquipment(grab) &&
      replace_1 !== grab &&
      canEquip(grab)
    ) {
      equip(grab);
    }
    if (
      !possessEquipment(grab) &&
      replace_1 !== grab &&
      closetAmount(grab) > 0 &&
      canEquip(grab)
    ) {
      closet = true;
      takeCloset(1, grab);
      equip(grab);
    }

    equipStatgainIncreasers$1(bonus, true);

    cliExecute("rest chateau");

    if (replace_1 !== grab && replace_1 !== Item.none) {
      equip(replace_1);
    }
    cliExecute("outfit Backup");
    if (closet) {
      if (itemAmount(grab) > 0) {
        putCloset(1, grab);
      }
    }
  } else if (is_professor()) {
    visitUrl("place.php?whichplace=wereprof_cottage&action=wereprof_sleep");
  } else {
    setProperty("restUsingChateau", false.toString());
    cliExecute("rest");
    setProperty("restUsingChateau", true.toString());
  }

  return toInt(getProperty("timesRested"));
}

export function haveFreeRestAvailable(): boolean {
  // save free rests to charge cincho
  if (auto_haveCincho() && auto_nextRestOverCinch()) {
    return false;
  }
  return toInt(getProperty("timesRested")) < totalFreeRests();
}

function freeRestsRemaining(): number {
  // save free rests to charge cincho
  if (auto_haveCincho() && auto_nextRestOverCinch()) {
    return 0;
  }
  return max(0, totalFreeRests() - toInt(getProperty("timesRested")));
}

export function auto_potentialMaxFreeRests(): number {
  // return the number of free rests we could potentially have if we get all the stuff that gives them from IotMs.
  // we can get the count of "intrinsic" free rests e.g perm'd skills & rests you get just from having something available in run
  let potential: number = toInt(numericModifier("Free Rests"));

  if (auto_canUseJuneCleaver() && !possessEquipment($item`mother's necklace`)) {
    potential += 5;
  }
  if (
    auto_haveBurningLeaves() &&
    !($item`forest canopy bed`.toString() in getCampground())
  ) {
    potential += 5;
  }
  // add more old stuff here. I only care about what is in 2023 Standard right now.
  return potential;
}

export function haveAnyIotmAlternativeRestSiteAvailable(): boolean {
  return chateaumantegna_available() || auto_campawayAvailable();
}
/*
 * Try to use a free rest.
 *
 * returns true if a rest was used false if it wasnt (for any reason)
 */
export function doFreeRest(): boolean {
  if (haveFreeRestAvailable()) {
    // burn MP if possible prior to resting
    const restorableMp: number = myMaxmp() - myMp();
    let mpToBurn: number;
    if (chateaumantegna_available() || auto_campawayAvailable()) {
      // will restore at least 100 MP
      mpToBurn = 100 - restorableMp;
    } else if (
      getDwelling() === $item`Frobozz Real-Estate Company Instant House (TM)`
    ) {
      mpToBurn = 40 - restorableMp;
    } else if (getDwelling() === $item`Newbiesport™ tent`) {
      mpToBurn = 10 - restorableMp;
    } else {
      // assume resting on the ground
      mpToBurn = 5 - restorableMp;
    }

    if (mpToBurn > 0) {
      auto_burnMP(mpToBurn);
    }
    // resting and success check
    const hpMp_before: number = myHp() + myMp();
    const rest_count: number = toInt(getProperty("timesRested"));
    const result_1: boolean = doRest() > rest_count;
    const hpMp_after: number = myHp() + myMp();
    const success: boolean = hpMp_after > hpMp_before || result_1;
    return success;
  }
  return false;
}

export function mp_regen(): number {
  return (
    0.5 * (numericModifier("MP Regen Min") + numericModifier("MP Regen Max"))
  );
}

function hp_regen(): number {
  return (
    0.5 * (numericModifier("HP Regen Min") + numericModifier("HP Regen Max"))
  );
}

export function uneffect(toRemove: Effect): boolean {
  if (haveEffect(toRemove) === 0) {
    return true;
  }
  if (
    $effects`Driving Intimidatingly, Driving Obnoxiously, Driving Observantly, Driving Quickly, Driving Recklessly, Driving Safely, Driving Stealthily, Driving Wastefully, Driving Waterproofly`.includes(
      toRemove,
    ) &&
    auto_get_campground().has($item`Asdon Martin keyfob (on ring)`)
  ) {
    visitUrl("campground.php?pwd=&preaction=undrive");
    return true;
  }

  if (cliExecute(`uneffect ${toRemove}`)) {
    //Either we don\'t have the effect or it is shruggable.
    return true;
  }

  if (itemAmount($item`soft green echo eyedrop antidote`) > 0) {
    visitUrl(`uneffect.php?pwd=&using=Yep.&whicheffect=${toInt(toRemove)}`);
    auto_log_info(
      "Effect removed by Soft Green Echo Eyedrop Antidote.",
      "blue",
    );
    return true;
  } else if (itemAmount($item`ancient cure-all`) > 0) {
    visitUrl(`uneffect.php?pwd=&using=Yep.&whicheffect=${toInt(toRemove)}`);
    auto_log_info("Effect removed by Ancient Cure-All.", "blue");
    return true;
  }
  return false;
}
