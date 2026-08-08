import {
  getProperty,
  haveEffect,
  haveSkill,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  mpCost,
  myAdventures,
  myLevel,
  myMp,
  myPath,
  toInt,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $location,
  $path,
  $skill,
  get,
  set,
} from "libram";

import { autoAdv } from "../../auto_adventure";
import { itemList, ListInsert } from "../../auto_list";
import { auto_log_info } from "../../auto_util";
import { bridgeGoal } from "../../quests/level_09";
import { AshMatcher } from "../../utils/kolmafiaUtils";

//Defined in autoscend/paths/license_to_adventure.ash
export function in_lta(): boolean {
  return myPath() === $path`License to Adventure`;
}

export function bond_initializeSettings(): void {
  if (in_lta()) {
    set("auto_getBeehive", true);
    set("auto_wandOfNagamar", false);
    set("auto_familiarChoice", "");
  }
}

function bond_buySkills(): boolean {
  if (!in_lta()) {
    return false;
  }
  const page: string = visitUrl(
    "place.php?whichplace=town_right&action=town_bondhq",
    false,
  );
  const bondPoints: AshMatcher = new AshMatcher("You have (\\d+) pound", page);
  let points: number = 0;
  if (bondPoints.find()) {
    points = toInt(bondPoints.group(1));
    auto_log_info(`Found ${points} pound(s) of social capital husks.`, "green");
  }

  while (points > 0) {
    const start_1: number = points;
    if (!get("bondSymbols")) {
      if (points >= 3) {
        auto_log_info("Getting bondSymbols", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=10&w=s");
        points -= 3;
      }
    } else if (!get("bondJetpack")) {
      if (points >= 3) {
        auto_log_info("Getting bondJetpack", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=12&w=s");
        points -= 3;
      }
    } else if (!get("bondMartiniDelivery") && inHardcore()) {
      if (points >= 1) {
        auto_log_info("Getting bondMartiniDelivery", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=9&w=p");
        points -= 1;
      }
    } else if (!get("bondAdv")) {
      if (points >= 1) {
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=1&w=s");
        points -= 1;
      }
    } else if (!get("bondMartiniPlus") && get("bondPoints") >= 2) {
      if (points >= 3) {
        auto_log_info("Getting bondMartiniPlus", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=13&w=p");
        points -= 3;
      }
    } else if (!get("bondMartiniTurn")) {
      if (points >= 1) {
        auto_log_info("Getting bondMartiniTurn", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=1&w=p");
        points -= 1;
      }
    } else if (!get("bondDrunk2")) {
      if (points >= 3) {
        auto_log_info("Getting bondDrunk2", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=11&w=s");
        points -= 3;
      }
    } else if (!get("bondDrunk1")) {
      if (points >= 2) {
        auto_log_info("Getting bondDrunk1", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=8&w=s");
        points -= 2;
      }
    } else if (
      !get("bondBridge") &&
      get("chasmBridgeProgress") < bridgeGoal() - 2
    ) {
      if (points >= 3) {
        auto_log_info("Getting bondBridge", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=14&w=s");
        points -= 3;
      }
    } else if (!get("bondDesert") && get("desertExploration") < 100) {
      if (points >= 5) {
        auto_log_info("Getting bondDesert", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=18&w=s");
        points -= 5;
      }
    } else if (!get("bondMeat")) {
      if (points >= 1) {
        auto_log_info("Getting bondMeat", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=2&w=p");
        points -= 1;
      }
    } else if (!get("bondItem1")) {
      if (points >= 1) {
        auto_log_info("Getting bondItem1", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=3&w=p");
        points -= 1;
      }
    } else if (!get("bondItem2")) {
      if (points >= 2) {
        auto_log_info("Getting bondItem2", "blue");
        visitUrl("choice.php?whichchoice=1259&pwd=&option=1&k=6&w=s");
        points -= 2;
      }
    }
    if (start_1 === points) {
      break;
    }
  }
  return true;
}

export function LM_bond(): boolean {
  if (!in_lta()) {
    return false;
  }

  if (
    itemAmount($item`Victor's Spoils`) > 0 &&
    !get("_victorSpoilsUsed") &&
    myAdventures() < 10
  ) {
    use(1, $item`Victor's Spoils`);
  }

  if (haveEffect($effect`Disavowed`) > 0) {
    if (haveSkill($skill`Disco Nap`) && myMp() > mpCost($skill`Disco Nap`)) {
      useSkill(1, $skill`Disco Nap`);
    }
    set("_auto_bondBriefing", "started");
  }

  if (
    getProperty("_auto_bondBriefing") === "started" &&
    get("_villainLairProgress") >= 999
  ) {
    set("_auto_bondBriefing", "finished");
  }

  if (getProperty("_auto_bondBriefing") === "started") {
    const retval: boolean = autoAdv($location`Super Villain's Lair`);
    if (!retval) {
      set("_auto_bondBriefing", "finished");
      bond_buySkills();
    }
    return retval;
  }

  if (get("_auto_bondLevel", 0) < myLevel()) {
    set("_auto_bondLevel", myLevel());
    bond_buySkills();
  }

  if (getProperty("_auto_bondBriefing") === "finished") {
    return false;
  }

  return false;
}

let bondDrinksCached: Map<number, Item> = new Map();
export function bondDrinks(): Map<number, Item> {
  if (bondDrinksCached.size === 0) {
    bondDrinksCached = itemList();
    for (const it of $items.all()) {
      if (
        it.inebriety > 0 &&
        it.smallimage === "martini.gif" &&
        isUnrestricted(it)
      ) {
        bondDrinksCached = ListInsert(bondDrinksCached, it);
      }
    }
  }
  return bondDrinksCached;
}
