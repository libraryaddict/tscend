import * as kolmafia from "kolmafia";
import {
  Class,
  Effect,
  equippedAmount,
  Familiar,
  getProperty,
  haveEffect,
  haveOutfit,
  Item,
  itemAmount,
  Location,
  Monster,
  monsterLevelAdjustment,
  myAscensions,
  myClass,
  myDaycount,
  myFamiliar,
  myLocation,
  myPath,
  myPrimestat,
  Skill,
  Stat,
  toBoolean,
  toClass,
  toEffect,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  toLocation,
  toMonster,
  toSkill,
  toStat,
} from "kolmafia";
import * as libram from "libram";
import {
  $class,
  $classes,
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $stat,
  get,
} from "libram";

import { fullness_left, inebriety_left, spleen_left } from "../auto_consume";
import { auto_have_familiar } from "../auto_familiar";
import {
  auto_abort,
  auto_have_skill,
  effectiveDropChance,
  internalQuestStatus,
  safeGet,
} from "../auto_util";
import { expectGhostReport } from "../iotms/2010/mr2016";
import { auto_latteDropAvailable } from "../iotms/2010/mr2018";
import { is_pete } from "../paths/2014/avatar_of_sneaky_pete";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_darkGyffte } from "../paths/2019/dark_gyffte";

// Conditionals are formatted as "<condition type>:<data>"
// Multiple conditionals are passed as separate array elements
// Conditionals can be prepended with a ! to indicate that they must be FALSE
// See the registered condition handlers below for valid condition types and a description of their data
interface ConditionHandler {
  check(data: string): boolean;
}

const conditionHandlers: Map<string, ConditionHandler> = new Map();

function registerCondition(type: string, handler: ConditionHandler): void {
  conditionHandlers.set(type, handler);
}

function compare_numbers(
  num1: number,
  num2: number,
  comparison: string,
): boolean {
  switch (comparison) {
    case "=":
    case "==":
      return num1 === num2;
    case ">":
      return num1 > num2;
    case "<":
      return num1 < num2;
    case ">=":
      return num1 >= num2;
    case "<=":
      return num1 <= num2;
    default:
      auto_abort(`"${comparison}" is not a valid comparison operator!`);
  }
  return false;
}

registerCondition("class", {
  // data: The text name of the class, as used by to_class()
  // You must be the given class
  // As a precaution, autoscend aborts if to_class returns $class[none]
  check(data) {
    const req_class: Class = toClass(data);
    if (req_class === $class.none) {
      auto_abort(`"${data}" does not properly convert to a class!`);
    }
    return req_class === myClass();
  },
});

registerCondition("mainstat", {
  // data: The text name of the mainstat, as used by to_stat()
  // Your mainstat must be the given stat
  // As a precaution, autoscend aborts if to_stat returns $stat[none]
  check(data) {
    const req_mainstat: Stat = toStat(data);
    if (req_mainstat === $stat.none) {
      auto_abort(`"${data}" does not properly convert to a stat!`);
    }
    return req_mainstat === myPrimestat();
  },
});

registerCondition("path", {
  // data: The text name of the path, as returned by my_path().name
  // You must be currently on that path
  // No safety checking possible here, so hopefully you don't misspell anything
  check(data) {
    return data === myPath().name;
  },
});

registerCondition("pathid", {
  // data: The int id name of the path, as returned by my_path().id
  // You must be currently on that path
  // As a precaution, autoscend aborts if to_int returns 0
  check(data) {
    const req_pathid: number = toInt(data);
    if (req_pathid === 0) {
      auto_abort(`"${data}" does not properly convert to a path id!`);
    }
    return req_pathid === myPath().id;
  },
});

registerCondition("skill", {
  // data: The text name of the skill, as used by to_skill()
  // You must have the given skill
  // As a precaution, autoscend aborts if to_skill returns $skill[none]
  check(data) {
    const req_skill: Skill = toSkill(data);
    if (req_skill === $skill.none) {
      auto_abort(`"${data}" does not properly convert to a skill!`);
    }
    return auto_have_skill(req_skill);
  },
});

registerCondition("effect", {
  // data: Text name of the effect, as used by to_effect()
  // You must have at least one turn of the given effect
  // As a precaution, autoscend aborts if to_effect returns $effect[none]
  check(data) {
    const req_effect: Effect = toEffect(data);
    if (req_effect === $effect.none) {
      auto_abort(`"${data}" does not properly convert to an effect!`);
    }
    return haveEffect(req_effect) > 0;
  },
});

registerCondition("item", {
  // data: <item name><comparison operator><value>
  // The number of that item you have must compare properly
  // As a precaution, autoscend aborts if to_item returns $item[none]
  check(data) {
    const m5 = data.match(/([^=<>]+)([=<>]+)(.+)/);
    if (!m5) {
      auto_abort(`"${data}" is not a proper item condition format!`);
    }
    const req_item: Item = toItem(m5[1]);
    if (req_item === $item.none) {
      auto_abort(`"${m5[1]}" does not properly convert to an item!`);
    }
    return compare_numbers(
      itemAmount(req_item) + equippedAmount(req_item),
      toInt(m5[3]),
      m5[2],
    );
  },
});

registerCondition("itemdropcapped", {
  // data: <value><equal sign separator><item name>
  // The chance of getting the item at the end of the fight from that base drop rate value must be 100
  // As a precaution, autoscend aborts if to_item returns $item[none]
  check(data) {
    const m7 = data.match(/([^=<>]+)=(.+)/);
    if (!m7) {
      auto_abort(`"${data}" is not a proper item condition format!`);
    }
    const todrop_item: Item = toItem(m7[2]);
    const base_drop_chance: number = toFloat(m7[1]);
    if (todrop_item === $item.none) {
      auto_abort(`"${m7[1]}" does not properly convert to an item!`);
    }
    return effectiveDropChance(todrop_item, base_drop_chance) >= 100;
  },
});

registerCondition("outfit", {
  // data: The outfit name as used by have_outfit
  // You must have the given outfit
  // No safety checking here possible, at least not conveniently
  check(data) {
    return haveOutfit(data);
  },
});

registerCondition("familiar", {
  // data: Text name of the familiar, as used by to_familiar()
  // You must be currently using this familiar
  // As a precaution, autoscend aborts if to_familiar returns $familiar[none]
  // Unless the text is literally "none" (case sensitive)
  check(data) {
    const req_familiar: Familiar = toFamiliar(data);
    if (req_familiar === $familiar.none && data !== "none") {
      auto_abort(`"${data}" does not properly convert to a familiar!`);
    }
    return myFamiliar() === req_familiar;
  },
});

registerCondition("havefamiliar", {
  // data: Text name of the familiar, as used by to_familiar()
  // You must own this familiar, and it must be legal
  // As a precaution, autoscend aborts if to_familiar returns $familiar[none]
  check(data) {
    const havefamiliar: Familiar = toFamiliar(data);
    if (havefamiliar === $familiar.none) {
      auto_abort(`"${data}" does not properly convert to a familiar!`);
    }
    return auto_have_familiar(havefamiliar);
  },
});

registerCondition("loc", {
  // data: Text name of the location, as used by to_location()
  // You must be in this location (if you want to check for elsewhere, temporarily set_location)
  // As a precaution, autoscend aborts if to_location returns $location[none]
  check(data) {
    const req_loc: Location = toLocation(data);
    if (req_loc === $location.none) {
      auto_abort(`"${data}" does not properly convert to a location!`);
    }
    return myLocation() === req_loc;
  },
});

registerCondition("turnsspent", {
  // data: <location><comparison operator><integer value>
  // As a precaution, autoscend aborts if to_location returns $location[none]
  check(data) {
    const m6 = data.match(/([^=<>]+)([=<>]+)(.+)/);
    if (!m6) {
      auto_abort(`"${data}" is not a proper turnsspent condition format!`);
    }
    const loc: Location = toLocation(m6[1]);
    if (loc === $location.none) {
      auto_abort(`"${data}" does not properly convert to a location!`);
    }
    if (!["=", "=="].includes(m6[2])) {
      return compare_numbers(loc.turnsSpent, toInt(m6[3]), m6[2]);
    }
    return loc.turnsSpent === toInt(m6[3]);
  },
});

registerCondition("prop", {
  // data: <propname><comparison operator><value>
  // >/</>=/<= only supported for integer properties!
  check(data) {
    const m2 = data.match(/([^=<>]+)([=<>]+)(.+)/);
    if (!m2) {
      auto_abort(`"${data}" is not a proper prop condition format!`);
    }
    const prop: string = getProperty(m2[1]);
    if (!["=", "=="].includes(m2[2])) {
      return compare_numbers(toInt(prop), toInt(m2[3]), m2[2]);
    }
    return prop === m2[3];
  },
});

registerCondition("prop_boolean", {
  // data: <propname>
  // gets propname and converts to a boolean
  check(data) {
    return toBoolean(getProperty(data));
  },
});

registerCondition("quest", {
  // data: <questpropname><comparison operator><value>
  // like prop, but with > and < and >= and <= and uses internalQuestStatus
  // the value to compare to should always be an integer
  check(data) {
    const m3 = data.match(/([^=<>]+)([=<>]+)(.+)/);
    if (!m3) {
      auto_abort(`"${data}" is not a proper quest condition format!`);
    }
    const quest_state: number = internalQuestStatus(m3[1]);
    const compare_to: number = toInt(m3[3]);
    return compare_numbers(quest_state, compare_to, m3[2]);
  },
});

registerCondition("sniffed", {
  // data: Text name of the monster, as used by to_monster()
  // True if that monster has been sniffed by any olfaction-like
  // As a precaution, autoscend will abort if to_monster returns $monster[none]
  check(data) {
    const check_sniffed: Monster = toMonster(data);
    if (check_sniffed === $monster.none) {
      auto_abort(`"${data}" does not properly convert to a monster!`);
    }
    if (
      haveEffect($effect`On the Trail`) > 0 &&
      safeGet("olfactedMonster") === check_sniffed
    ) {
      return true;
    }
    if (isActuallyEd() && safeGet("stenchCursedMonster") === check_sniffed) {
      return true;
    }
    if (is_pete() && safeGet("makeFriendsMonster") === check_sniffed) {
      return true;
    }
    if (
      $classes`Cow Puncher, Beanslinger, Snake Oiler`.includes(myClass()) &&
      safeGet("longConMonster") === check_sniffed
    ) {
      return true;
    }
    if (in_darkGyffte() && safeGet("auto_bat_soulmonster") === check_sniffed) {
      return true;
    }
    if (safeGet("_gallapagosMonster") === check_sniffed) {
      return true;
    }
    if (safeGet("monkeyPointMonster") === check_sniffed) {
      return true;
    }
    if (safeGet("_latteMonster") === check_sniffed) {
      return true;
    }
    if (safeGet("motifMonster") === check_sniffed) {
      return true;
    }
    return false;
  },
});

registerCondition("expectghostreport", {
  // data: Doesn't matter, but put something so I don't have to support dataless conditions
  // True when you expect a protonic ghost report
  // Pretty much just for the protonic accelerator pack
  check() {
    return expectGhostReport();
  },
});

registerCondition("latte", {
  // data: Doesn't matter, but put something so I don't have to support dataless conditions
  // True when there is a latte unlock available in the area (that you don't have, of course)
  // Pretty much just for the latte
  check() {
    return auto_latteDropAvailable(myLocation());
  },
});

registerCondition("tavern", {
  // data: Doesn't matter, but put something so I don't have to support dataless conditions
  // True if the hidden tavern has been unlocked this ascension
  check() {
    return get("hiddenTavernUnlock") >= myAscensions();
  },
});

registerCondition("sgeea", {
  // data: The number of sgeeas you want to have
  // True if you have at least that many sgeeas at your disposal
  check(data) {
    const sgeeas: number = toInt(data);
    return itemAmount($item`soft green echo eyedrop antidote`) >= sgeeas;
  },
});

registerCondition("day", {
  // data: The day to check for
  // True if we are currently on that day
  check(data) {
    const day: number = toInt(data);
    return myDaycount() === day;
  },
});

registerCondition("ML", {
  check(data) {
    const m4 = data.match(/([=<>]+)(.+)/);
    if (!m4) {
      auto_abort(`"${data}" is not a proper ML condition format!`);
    }
    return compare_numbers(monsterLevelAdjustment(), toInt(m4[2]), m4[1]);
  },
});

registerCondition("consume", {
  // data: eat\drink\chew
  // True if we can eat\drink\chew anything today
  check(data) {
    switch (data) {
      case "eat":
        return fullness_left() > 0;
      case "drink":
        return inebriety_left() > 0;
      case "chew":
        return spleen_left() > 0;
      default:
        auto_abort(`Invalid consume type "consume" found!`);
    }
  },
});

// kolmafia is external to the bundle, so this require() hits the game's real module
// loader fresh each check() instead of the namespace object captured at script load.
declare function require(id: string): typeof kolmafia;

registerCondition("js", {
  // data: A script that must eval to true/false, has libram and kolmafia exposure
  check(data) {
    return new Function(
      "kolmafia",
      "libram",
      `with (kolmafia) { with (libram) { return (${data}) } }`,
    )(require("kolmafia"), libram);
  },
});

// does not account for !, auto_check_conditions does that
function check_condition(cond: string): boolean {
  const m = cond.match(/^(\w+):(.+)$/);
  if (!m) {
    auto_abort(`"${cond}" is not proper condition formatting!`);
  }
  const condition_type: string = m[1];
  const condition_data: string = m[2];
  const handler: ConditionHandler | undefined =
    conditionHandlers.get(condition_type);
  if (!handler) {
    auto_abort(`Invalid condition type "${condition_type}" found!`);
  }
  return handler.check(condition_data);
}

export function auto_check_conditions(conds: string[]): boolean {
  for (const cond of conds) {
    const m = cond.match(/^(!?)(.+)$/);
    if (!m) {
      auto_abort(`"${cond}" is not a proper condition!`);
    }
    const invert: boolean = m[1] === "!";
    const success: boolean = check_condition(m[2]);

    if (success === invert) {
      return false;
    }
  }

  return true;
}
