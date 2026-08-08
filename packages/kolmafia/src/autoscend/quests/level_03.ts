import {
  abort,
  charAt,
  containsText,
  council,
  Effect,
  Element,
  getProperty,
  haveEffect,
  haveSkill,
  lastMonster,
  Modifier,
  monsterLevelAdjustment,
  myDaycount,
  myLevel,
  myMp,
  numericModifier,
  stringModifier,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $element,
  $elements,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $skill,
  get,
  set,
} from "libram";

import { pullXWhenHaveY } from "../auto_acquire";
import { autoAdv, autoAdvBypass$1 } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import {
  possessEquipment,
  resetMaximize,
  simMaximizeWith,
  simValue,
} from "../auto_equipment";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { providePlusCombat, providePlusNonCombat$2 } from "../auto_providers";
import {
  auto_combatModCap,
  auto_convertDesiredML,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_MaxMLToCap,
  auto_setMCDToCap,
  damageModifier,
  internalQuestStatus,
} from "../auto_util";
import { QuestTask, registerQuestTask, runQuestTask } from "../engine/engine";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/2010/mr2014";
import { auto_beachCombHead } from "../iotms/2010/mr2019";
import { auto_copierShouldDelayZone } from "../iotms/2020/mr2026";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_glover } from "../paths/g_lover";
import { in_wereprof } from "../paths/wereprofessor";
import { Maximizer, maximizer } from "../utils/maximizer";

//Defined in autoscend/quests/level_03.ash
function auto_tavern(): boolean {
  if (internalQuestStatus("questL03Rat") !== 1) {
    return false;
  }

  const temp: string = visitUrl("cellar.php");
  if (
    containsText(
      temp,
      "You should probably talk to the bartender before you go poking around in the cellar.",
    )
  ) {
    abort("Quest not yet started, talk to Bart Ender and re-run.");
  }

  auto_log_info(
    `In the tavern! Layout: ${getProperty("tavernLayout")}`,
    "blue",
  );
  const locations: number[] = [3, 2, 1, 0, 5, 10, 15, 20, 16, 21];
  // infrequent compounding issue, reset maximizer
  resetMaximize();

  // sleaze is the only one we don't care about
  if (possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    const mod: string = stringModifier(
      $item`Kremlin's Greatest Briefcase`,
      "Modifiers",
    );
    if (containsText(mod, "Weapon Damage Percent")) {
      const page: string = visitUrl("place.php?whichplace=kgb");
      let flipped: boolean = false;
      if (containsText(page, "handleup")) {
        visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
        flipped = true;
      }

      visitUrl("place.php?whichplace=kgb&action=kgb_button1", false);
      visitUrl("place.php?whichplace=kgb&action=kgb_button1", false);
      if (flipped) {
        visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
      }
    }
  }
  // We need 20 each of the elements except sleaze to skip noncombats
  function try_buff_damage(el: Element, ef: Effect): void {
    if (numericModifier(damageModifier(el)) < 20.0) {
      buffMaintain$2(ef, 20, 1, 1);
    }
  }

  try_buff_damage($element`hot`, $effect`Pyromania`);
  try_buff_damage($element`cold`, $effect`Frostbeard`);
  try_buff_damage($element`cold`, $effect`Song of the North`);
  try_buff_damage($element`stench`, $effect`Rotten Memories`);
  try_buff_damage($element`spooky`, $effect`Intimidating Mien`);
  try_buff_damage(
    $element`spooky`,
    $effect`Dirge of Dreadfulness (Remastered)`,
  );
  try_buff_damage($element`spooky`, $effect`Dirge of Dreadfulness`);
  try_buff_damage($element`spooky`, $effect`Snarl of Three Timberwolves`);
  try_buff_damage($element`spooky`, $effect`Snarl of the Timberwolf`);

  const max_ml_target: number = 150;

  if (!isActuallyEd() && monsterLevelAdjustment() <= 299) {
    auto_MaxMLToCap(auto_convertDesiredML(max_ml_target), true);
  } else {
    auto_MaxMLToCap(auto_convertDesiredML(max_ml_target), false);
  }

  for (const element_type of ["Hot", "Cold", "Stench", "Sleaze", "Spooky"]) {
    if (numericModifier(`${element_type} Damage`) < 20.0) {
      if (in_glover() && element_type !== "Stench") {
        // the only one that works in g-lover
        continue;
      }
      auto_beachCombHead(element_type);
    }
  }

  // Tails are a better time saving investment. Add -combat to ensure sim and real maximizer results match
  const applyElementAndMlWeights = (m: Maximizer): void => {
    m.weight($modifier`Cold Damage`, 80).max($modifier`Cold Damage`, 20);
    m.weight($modifier`Hot Damage`, 80).max($modifier`Hot Damage`, 20);
    m.weight($modifier`Spooky Damage`, 80).max($modifier`Spooky Damage`, 20);
    m.weight($modifier`Stench Damage`, 80).max($modifier`Stench Damage`, 20);
    m.weight($modifier`Monster Level`, 500).max(
      $modifier`Monster Level`,
      auto_convertDesiredML(max_ml_target),
    );
    m.weight($modifier`Combat Rate`, -200).max($modifier`Combat Rate`, 25);
  };
  simMaximizeWith(applyElementAndMlWeights);

  function n_passed(): number {
    // We pass an elemental damage check if we have 20 damage for that element
    let n: number = 0;
    for (const el of $elements`hot, cold, spooky, stench`) {
      if (simValue(damageModifier(el)) >= 20.0) {
        n++;
      }
    }
    return n; // 4 is success here
  }
  function all_passed(): boolean {
    // do we pass all of the damage checks?
    return n_passed() >= 4;
  }
  // Consider a pull
  for (const it of $items`17-ball, rare oboe`) {
    if (!all_passed()) {
      if (pullXWhenHaveY(it, 1, 0)) {
        simMaximizeWith(applyElementAndMlWeights);
      }
    }
  }

  const eleChoiceCombos: Map<string, number> = new Map([
    ["Cold", 513],
    ["Hot", 496],
    ["Spooky", 515],
    ["Stench", 514],
  ]);
  let capped: number = 0;
  for (const [ele, choicenum] of eleChoiceCombos) {
    const passed: boolean = simValue(Modifier.get(`${ele} Damage`)) >= 20.0;
    set(`choiceAdventure${choicenum}`, passed ? "2" : "1");
    if (passed) {
      ++capped;
      //adding a 20min argument does not yield better combinations nor avoid giving value to failed elements
      //only give value to elements that will pass
      maximizer
        .weight(Modifier.get(`${ele} Damage`), 80)
        .max(Modifier.get(`${ele} Damage`), 20);
    }
  }
  maximizer
    .weight($modifier`Monster Level`, 500)
    .max($modifier`Monster Level`, auto_convertDesiredML(max_ml_target));

  if (capped >= 3) {
    providePlusNonCombat$2(auto_combatModCap(), $location`Noob Cave`);
  } else {
    providePlusCombat(20, $location`Noob Cave`);
  }

  let tavern_1: string = getProperty("tavernLayout");
  if (tavern_1 === "0000000000000000000000000") {
    // visit cellar then refresh layout property
    visitUrl("cellar.php");
    tavern_1 = getProperty("tavernLayout");
    if (tavern_1 === "0000000000000000000000000") {
      abort(
        "Invalid Tavern Configuration, could not visit cellar and repair. Uh oh...",
      );
    }
  }

  for (const loc of locations) {
    if (charAt(tavern_1, loc) === "0") {
      const actual: number = loc + 1;
      let needReset: boolean = false;
      set("auto_nonAdvLoc", true);

      if (
        autoAdvBypass$1(
          `cellar.php?action=explore&whichspot=${actual}`,
          $location`The Typical Tavern Cellar`,
        )
      ) {
        return true;
      }

      const page: string = visitUrl("main.php");
      if (containsText(page, "You've already explored that spot.")) {
        needReset = true;
        auto_log_warning(
          "tavernLayout is not reporting places we've been to.",
          "red",
        );
      }
      if (containsText(page, "Darkness (5,5)")) {
        needReset = true;
        auto_log_warning(
          "tavernLayout is reporting too many places as visited.",
          "red",
        );
      }

      if (
        containsText(page, "whichchoice value=") ||
        containsText(page, "whichchoice=")
      ) {
        auto_log_warning(
          "Tavern handler: You are RL drunk, you should not be here.",
          "red",
        );
        autoAdv($location`Noob Cave`);
      }
      if (
        lastMonster() === $monster`crate` ||
        (in_wereprof() && !($location`Noob Cave`.turnsSpent < 8))
      ) {
        //want 7 turns of Noob Cave in WereProfessor for Smashed Scientific Equipment
        if (get("auto_newbieOverride", false)) {
          set("auto_newbieOverride", false);
        } else {
          abort("We went to the Noob Cave for reals... uh oh");
        }
      }
      if (getProperty("lastEncounter") === "Like a Bat Into Hell") {
        abort(
          "Got stuck undying while trying to do the tavern. Must handle manualy and then resume.",
        );
      }

      if (needReset) {
        auto_log_warning(
          "We attempted a tavern adventure but the tavern layout was not maintained properly.",
          "red",
        );
        auto_log_warning("Attempting to reset this issue...", "red");
        set("tavernLayout", "0000100000000000000000000");
        visitUrl("cellar.php");
      }
      return true;
    }
  }
  auto_log_warning(
    "We found no valid location to tavern, something went wrong...",
    "red",
  );
  auto_log_warning("Attempting to reset this issue...", "red");
  set("tavernLayout", "0000100000000000000000000");
  wait(5);
  return true;
}

function L3_tavernReady(): boolean {
  if (
    internalQuestStatus("questL03Rat") < 0 ||
    get("auto_L03CouncilVisited", false)
  ) {
    return false;
  }

  if (internalQuestStatus("questL03Rat") > 2) {
    return true;
  }

  let mpNeed: number = 0;
  if (
    haveSkill($skill`The Sonata of Sneakiness`) &&
    haveEffect($effect`The Sonata of Sneakiness`) === 0
  ) {
    mpNeed = mpNeed + 20;
  }
  if (
    haveSkill($skill`Smooth Movement`) &&
    haveEffect($effect`Smooth Movements`) === 0
  ) {
    mpNeed = mpNeed + 10;
  }

  const enoughElement: boolean =
    numericModifier($modifier`Cold Damage`) >= 20 &&
    numericModifier($modifier`Hot Damage`) >= 20 &&
    numericModifier($modifier`Spooky Damage`) >= 20 &&
    numericModifier($modifier`Stench Damage`) >= 20;

  let delayTavern: boolean = false;

  if (!enoughElement || myMp() < mpNeed) {
    if (myDaycount() <= 2 && myLevel() <= 11) {
      delayTavern = true;
    }
  }

  if (isAboutToPowerlevel()) {
    delayTavern = false;
  }

  if (get("auto_forceTavern", false)) {
    delayTavern = false;
  }

  return !delayTavern;
}

export const L3_tavernTask: QuestTask = registerQuestTask({
  name: "L3_tavern",
  completed: () =>
    internalQuestStatus("questL03Rat") > 2 &&
    get("auto_L03CouncilVisited", false),
  ready: L3_tavernReady,
  do: () => {
    if (internalQuestStatus("questL03Rat") < 1) {
      visitUrl("tavern.php?place=barkeep");
    }

    auto_log_info("Doing Tavern", "blue");

    if (myMp() > 60 || considerGrimstoneGolem(true)) {
      handleBjornify($familiar`Grimstone Golem`);
    }

    auto_setMCDToCap();

    if (auto_tavern()) {
      return;
    }

    return runQuestTask(L3_tavernFinishTask);
  },
  locations: $location`The Typical Tavern Cellar`,
});

const L3_tavernFinishTask: QuestTask = registerQuestTask({
  name: "L3_tavernFinish",
  completed: () => get("auto_L03CouncilVisited", false),
  ready: () => {
    if (
      internalQuestStatus("questL03Rat") <= 1 ||
      get("auto_L03CouncilVisited", false)
    ) {
      return false;
    }
    if (auto_copierShouldDelayZone($locations`The Typical Tavern Cellar`)) {
      auto_log_debug(
        "Delaying L3 turn-in - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: () => {
    visitUrl("tavern.php?place=barkeep");
    council();
    set("auto_L03CouncilVisited", true);
  },
});

export function L3_tavern(): boolean {
  return runQuestTask(L3_tavernTask);
}
