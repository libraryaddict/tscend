import {
  abort,
  council,
  getProperty,
  haveEffect,
  haveSkill,
  itemAmount,
  myAdventures,
  myClass,
  myDaycount,
  myPrimestat,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $skill,
  $stat,
  get,
  set,
} from "libram";

import { auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import { getMinimumAdventuresToMaintain } from "../auto_consume";
import { autoOutfit, possessEquipment, possessOutfit } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { canBurnDelay } from "../auto_routing";
import {
  adjustForYellowRayIfPossible,
  auto_change_mcd,
  auto_is_valid,
  auto_log_debug,
  auto_log_info,
  internalQuestStatus,
} from "../auto_util";
import { canSurvive } from "../combat/auto_combat_util";
import {
  DesiredDrop,
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { auto_copierShouldDelayZone } from "../iotms/mr2026";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { bat_formBats } from "../paths/dark_gyffte";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_plumber } from "../paths/path_of_the_plumber";
import { robot_delay } from "../paths/you_robot";
import { in_zootomist } from "../paths/zootomist";

// L5 quest progress notes:
// unstarted
// started===acquired [Cobb's Knob map] from council
// step1===used [Cobb's Knob map] with [Knob Goblin encryption key] to unlock internal zones.
// finished===killed the king. you still need to visit council afterwards to get rewarded.

//Defined in autoscend/quests/level_05.ash
function L5_getEncryptionKeyDo(): boolean {
  if (itemAmount($item`11-inch knob sausage`) === 1) {
    visitUrl("guild.php?place=challenge");
    return true;
  }

  if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
    if (
      !haveSkill($skill`Retractable Toes`) &&
      itemAmount($item`cocktail mushroom`) === 0
    ) {
      handleFamiliar$1($familiar`Robortender`);
    }
  }

  auto_log_info("Looking for the knob.", "blue");
  return autoAdv($location`The Outskirts of Cobb's Knob`);
}

export const L5_getEncryptionKeyTask: QuestTask = registerQuestTask({
  name: "L5_getEncryptionKey",
  completed: () =>
    internalQuestStatus("questL05Goblin") > 0 ||
    itemAmount($item`Knob Goblin Encryption Key`) > 0,
  // want to fight goblin king quickly in legacy of loathing to get another replica mr a
  // In LKS, important keys are gated behind here, and we have tonnes of delay
  // in Zootomist it's a valuable levelling zone that drops wishes
  ready: () =>
    itemAmount($item`11-inch knob sausage`) === 1 ||
    in_lol() ||
    in_lowkeysummer() ||
    in_zootomist() ||
    !canBurnDelay($location`The Outskirts of Cobb's Knob`),
  do: L5_getEncryptionKeyDo,
  locations: $location`The Outskirts of Cobb's Knob`,
  desiredEncounters: () =>
    [
      {
        item: $item`Knob Goblin Encryption Key`,
        needAmount: 1 - itemAmount($item`Knob Goblin Encryption Key`),
      },
    ].filter((a) => a.needAmount > 0),
});

export function L5_getEncryptionKey(): boolean {
  return runQuestTask(L5_getEncryptionKeyTask);
}

function L5_findKnobDo(): boolean {
  if (itemAmount($item`Knob Goblin Encryption Key`) === 1) {
    if (itemAmount($item`Cobb's Knob map`) === 0) {
      council();
    }
    use(1, $item`Cobb's Knob map`);
    return true;
  }
  return false;
}

export const L5_findKnobTask: QuestTask = registerQuestTask({
  name: "L5_findKnob",
  completed: () => internalQuestStatus("questL05Goblin") > 0,
  ready: () => internalQuestStatus("questL05Goblin") === 0,
  do: L5_findKnobDo,
});

export function L5_findKnob(): boolean {
  return runQuestTask(L5_findKnobTask);
}

function L5_haremOutfitDo(): boolean {
  // Just pull it if d2
  if (myDaycount() > 1) {
    pullXWhenHaveY($item`Knob Goblin harem veil`, 1, 0);
    pullXWhenHaveY($item`Knob Goblin harem pants`, 1, 0);
  }
  // want to fight goblin king quickly in legacy of loathing to get another replica mr a
  // want to fight quickly in amw for meat
  // check for LoL path so we actually prep for yellow raying
  if (
    !adjustForYellowRayIfPossible($monster`Knob Goblin Harem Girl`) &&
    !in_lol() &&
    !in_amw()
  ) {
    if (!isAboutToPowerlevel()) {
      return false;
    }
  }

  if (in_heavyrains()) {
    buffMaintain$2($effect`Fishy Whiskers`);
  }
  bat_formBats();

  auto_log_info("Looking for some sexy lingerie!", "blue");
  if (autoAdv($location`Cobb's Knob Harem`)) {
    return true;
  }
  return false;
}

export const L5_haremOutfitTask: QuestTask = registerQuestTask({
  name: "L5_haremOutfit",
  completed: () =>
    internalQuestStatus("questL05Goblin") > 1 ||
    possessOutfit("Knob Goblin Harem Girl Disguise"),
  ready: () => internalQuestStatus("questL05Goblin") === 1,
  do: L5_haremOutfitDo,
  locations: $location`Cobb's Knob Harem`,
  desiredEncounters: () => {
    const desired: DesiredDrop[] = [];
    const outfit = $items`Knob Goblin harem veil, Knob Goblin harem pants`;
    if (outfit.every((i) => auto_is_valid(i))) {
      desired.push(
        ...outfit.map((i) => ({
          item: i,
          needAmount: possessEquipment(i) ? 0 : 1,
        })),
      );
    }
    desired.push({
      item: $item`Knob Goblin perfume`,
      needAmount:
        !outfit.every((i) => possessEquipment(i)) &&
        !haveEffect($effect`Knob Goblin Perfume`) &&
        itemAmount($item`Knob Goblin perfume`) === 0
          ? 1
          : 0,
    });

    return desired.filter((a) => a.needAmount > 0);
  },
});

function L5_goblinKingDo(): boolean {
  if (L5_goblinKingDefeated()) {
    return runQuestTask(L5_goblinKingTurnInTask);
  }

  auto_log_info("Death to the gobbo!!", "blue");
  if (!autoOutfit("Knob Goblin Harem Girl Disguise")) {
    abort("Could not put on Knob Goblin Harem Girl Disguise, aborting");
  }
  buffMaintain$2($effect`Knob Goblin Perfume`);
  if (haveEffect($effect`Knob Goblin Perfume`) === 0) {
    let advSpent_1: boolean = autoAdv($location`Cobb's Knob Harem`);
    if (haveEffect($effect`Knob Goblin Perfume`) === 0) {
      advSpent_1 = autoAdv($location`Cobb's Knob Harem`);
    }
    return advSpent_1;
  }

  if (myPrimestat() === $stat`Muscle`) {
    auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
    buffMaintain$2($effect`Go Get 'Em, Tiger!`);
  }
  auto_buyUpTo(1, $item`hair spray`);
  buffMaintain$2($effect`Butt-Rock Hair`);

  if (
    myClass() === $class`Seal Clubber` ||
    myClass() === $class`Turtle Tamer`
  ) {
    auto_buyUpTo(1, $item`blood of the Wereseal`);
    buffMaintain$2($effect`Temporary Lycanthropy`);
  }
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
  }
  // TODO: I died here, maybe we should heal a bit?
  if (!in_plumber()) {
    auto_change_mcd(10); // get the Crown from the Goblin King.
  }
  set("auto_nextEncounter", "Knob Goblin King");
  set("auto_nonAdvLoc", true);
  return autoAdv($location`Throne Room`);
}

function L5_goblinKingDefeated(): boolean {
  return (
    itemAmount($item`Crown of the Goblin King`) > 0 ||
    itemAmount($item`Glass Balls of the Goblin King`) > 0 ||
    itemAmount($item`Codpiece of the Goblin King`) > 0 ||
    getProperty("questL05Goblin") === "finished" ||
    in_plumber() ||
    itemAmount($item`cursed goblin cape`) > 0
  );
}

export const L5_goblinKingTask: QuestTask = registerQuestTask({
  name: "L5_goblinKing",
  completed: () => get("auto_L05CouncilVisited", false),
  ready: () => {
    if (L5_goblinKingDefeated()) {
      return true;
    }
    return (
      internalQuestStatus("questL05Goblin") === 1 &&
      canSurvive(3.0) &&
      myAdventures() >= getMinimumAdventuresToMaintain() + 1 &&
      possessOutfit("Knob Goblin Harem Girl Disguise") &&
      // delay for You, Robot path
      !robot_delay("outfit")
    );
  },
  do: L5_goblinKingDo,
  desiredEncounters: () =>
    [
      {
        monster: $monster`Knob Goblin King`,
        needAmount: internalQuestStatus("questL05Goblin") > 1 ? 0 : 1,
      },
    ].filter((a) => a.needAmount > 0),
});

const L5_goblinKingTurnInTask: QuestTask = registerQuestTask({
  name: "L5_goblinKingTurnIn",
  completed: () => get("auto_L05CouncilVisited", false),
  ready: () => {
    if (!L5_goblinKingDefeated()) {
      return false;
    }
    if (
      auto_copierShouldDelayZone(
        $locations`The Outskirts of Cobb's Knob, Cobb's Knob Harem, Throne Room`,
      )
    ) {
      auto_log_debug(
        "Delaying L5 turn-in - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: () => {
    council();
    set("auto_L05CouncilVisited", true);
  },
});

function L5_slayTheGoblinKingDo(): boolean {
  return runTaskChain([
    L5_getEncryptionKeyTask,
    L5_findKnobTask,
    L5_haremOutfitTask,
    L5_goblinKingTask,
  ]);
}

export const L5_slayTheGoblinKingTask: QuestTask = registerQuestTask({
  name: "L5_slayTheGoblinKing",
  completed: () =>
    internalQuestStatus("questL05Goblin") > 1 &&
    get("auto_L05CouncilVisited", false),
  ready: () => true,
  do: L5_slayTheGoblinKingDo,
});

export function L5_slayTheGoblinKing(): boolean {
  return runQuestTask(L5_slayTheGoblinKingTask);
}
