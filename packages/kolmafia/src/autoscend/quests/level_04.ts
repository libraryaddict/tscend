import {
  canInteract,
  cliExecute,
  council,
  Element,
  getProperty,
  itemAmount,
  toBoolean,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $phylum,
} from "libram";

import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import { autoForceEquip$3 } from "../auto_equipment";
import { handleFamiliar$1 } from "../auto_familiar";
import {
  provideFamExp$2,
  provideMeat$2,
  provideResistances$4,
} from "../auto_providers";
import { auto_reserveUndergroundAdventures } from "../auto_routing";
import {
  auto_badassBelt,
  auto_change_mcd,
  auto_is_valid,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  internalQuestStatus,
} from "../auto_util";
import { zone_available } from "../auto_zone";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { auto_haveGreyGoose } from "../iotms/mr2022";
import { auto_makeMonkeyPawWish$1 } from "../iotms/mr2023";
import { auto_haveBatWings, auto_haveChestMimic } from "../iotms/mr2024";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { bat_formBats } from "../paths/dark_gyffte";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { shenShouldDelayZone } from "./level_11";

//Defined in autoscend/quests/level_04.ash

function provideGuanoStenchResistance(): boolean {
  const resGoal: Map<Element, number> = new Map();
  resGoal.set($element`stench`, 1);
  // try to get the stench res without equipment, but use equipment if we must
  if (
    !provideResistances$4(resGoal, $location`Guano Junction`, false) &&
    !provideResistances$4(resGoal, $location`Guano Junction`, true)
  ) {
    auto_log_warning(
      "I cannae handle the stench of the Guano Junction!",
      "green",
    );
    return false;
  }
  return true;
}

function L4_batWingsBatHoleEntrance(): boolean {
  autoForceEquip$3($item`bat wings`);
  auto_log_info("Wearing bat wings to get a free bat wing", "green");
  handleTracker({
    what: $item`bat wings`,
    location: $location`The Bat Hole Entrance`,
    detail: $item`bat wing`.toString(),
    property: "auto_otherstuff",
  });
  return autoAdv($location`The Bat Hole Entrance`);
}

const L4_batWingsBatHoleEntranceTask: QuestTask = registerQuestTask({
  name: "L4_batWingsBatHoleEntrance",
  completed: () => toBoolean(getProperty("batWingsBatHoleEntrance")),
  ready: () =>
    auto_haveBatWings() && zone_available($location`The Bat Hole Entrance`),
  do: L4_batWingsBatHoleEntrance,
  locations: $location`The Bat Hole Entrance`,
});

function L4_batWingsGuanoJunction(): boolean {
  autoForceEquip$3($item`bat wings`);
  auto_log_info("Wearing bat wings to get a free sonar-in-a-biscuit", "green");
  handleTracker({
    what: $item`bat wings`,
    detail: $item`sonar-in-a-biscuit`.toString(),
    property: "auto_otherstuff",
  });
  return autoAdv($location`Guano Junction`);
}

const L4_batWingsGuanoJunctionTask: QuestTask = registerQuestTask({
  name: "L4_batWingsGuanoJunction",
  completed: () => toBoolean(getProperty("batWingsGuanoJunction")),
  ready: () =>
    auto_haveBatWings() &&
    zone_available($location`Guano Junction`) &&
    provideGuanoStenchResistance(),
  do: L4_batWingsGuanoJunction,
  locations: $location`Guano Junction`,
});

function L4_batWingsBatratBurrow(): boolean {
  autoForceEquip$3($item`bat wings`);
  auto_log_info(
    "Wearing bat wings to get another free sonar-in-a-biscuit",
    "green",
  );
  handleTracker({
    what: $item`bat wings`,
    detail: $item`sonar-in-a-biscuit`.toString(),
    property: "auto_otherstuff",
  });
  return autoAdv($location`The Batrat and Ratbat Burrow`);
}

const L4_batWingsBatratBurrowTask: QuestTask = registerQuestTask({
  name: "L4_batWingsBatratBurrow",
  completed: () => toBoolean(getProperty("batWingsBatratBurrow")),
  ready: () =>
    auto_haveBatWings() &&
    zone_available($location`The Batrat and Ratbat Burrow`),
  do: L4_batWingsBatratBurrow,
  locations: $location`The Batrat and Ratbat Burrow`,
});

function L4_batWingsBeanbatChamber(): boolean {
  autoForceEquip$3($item`bat wings`);
  auto_log_info("Wearing bat wings to get a free enchanted bean", "green");
  handleTracker({
    what: $item`bat wings`,
    detail: $item`enchanted bean`.toString(),
    property: "auto_otherstuff",
  });
  return autoAdv($location`The Beanbat Chamber`);
}

const L4_batWingsBeanbatChamberTask: QuestTask = registerQuestTask({
  name: "L4_batWingsBeanbatChamber",
  completed: () => toBoolean(getProperty("batWingsBeanbatChamber")),
  ready: () =>
    auto_haveBatWings() && zone_available($location`The Beanbat Chamber`),
  do: L4_batWingsBeanbatChamber,
  locations: $location`The Beanbat Chamber`,
});

function L4_trySonarBiscuit(): boolean | undefined {
  if (auto_is_valid($item`sonar-in-a-biscuit`)) {
    if (itemAmount($item`sonar-in-a-biscuit`) === 0 && canInteract()) {
      auto_buyUpTo(1, $item`sonar-in-a-biscuit`);
    }
    if (itemAmount($item`sonar-in-a-biscuit`) === 0) {
      // attempt to monkey wish for sonars
      auto_makeMonkeyPawWish$1($item`sonar-in-a-biscuit`);
    }
    if (itemAmount($item`sonar-in-a-biscuit`) > 0) {
      if (use(1, $item`sonar-in-a-biscuit`)) {
        return true;
      } else {
        auto_log_warning(
          "Failed to use Sonar-In-A-Biscuit for some reason. refreshing inventory and skipping",
          "red",
        );
        visitUrl("place.php?whichplace=bathole");
        cliExecute("refresh inv");
        return false;
      }
    }
  }
  return undefined;
}

function L4_batBeanbatFinal(): boolean {
  if (
    itemAmount($item`enchanted bean`) === 0 &&
    internalQuestStatus("questL10Garbage") < 1 &&
    !isActuallyEd()
  ) {
    return autoAdv($location`The Beanbat Chamber`);
  }
  council();
  if (in_koe()) {
    cliExecute("refresh quests");
  }
  return true;
}

const L4_batBeanbatFinalTask: QuestTask = registerQuestTask({
  name: "L4_batBeanbatFinal",
  completed: () => internalQuestStatus("questL04Bat") > 4,
  ready: () => internalQuestStatus("questL04Bat") >= 4,
  do: L4_batBeanbatFinal,
  locations: $location`The Beanbat Chamber`,
  desiredEncounters: () =>
    [
      {
        item: $item`enchanted bean`,
        needAmount:
          itemAmount($item`enchanted bean`) === 0 &&
          internalQuestStatus("questL10Garbage") < 1 &&
          !isActuallyEd()
            ? 1
            : 0,
      },
    ].filter((a) => a.needAmount > 0),
});

function L4_bossBatLair(): boolean {
  if (auto_reserveUndergroundAdventures() && !in_lol()) {
    return false;
  }

  provideMeat$2(50, $location`The Boss Bat's Lair`, false);
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    if (
      auto_haveGreyGoose() &&
      $location`The Boss Bat's Lair`.turnsSpent >= 4
    ) {
      handleFamiliar$1($familiar`Grey Goose`);
    }
  }
  const batskinBelt: number = itemAmount($item`batskin belt`);
  auto_change_mcd(4); // get the pants from the Boss Bat.
  // Let's whack some free XP on our Chest Mimic (it's a chaun)
  if (auto_haveChestMimic()) {
    handleFamiliar$1($familiar`Chest Mimic`);
    provideFamExp$2(50, $location`The Boss Bat's Lair`, true, false);
  }
  autoAdv($location`The Boss Bat's Lair`);
  // POCKET FAMILIARS remove once mafia tracks this
  if (itemAmount($item`batskin belt`) !== batskinBelt) {
    auto_badassBelt(); // mafia doesn't make this any more even if autoCraft = true for some random reason so lets do it manually.
  }
  // TODO: Mafia currently does not advance the quest tracker when the Plumber boss is defeated.
  // this breaks that infinite loop, while "refresh quests" apparently doesn't. Who knows?
  visitUrl("place.php?whichplace=bathole");
  return true;
}

const L4_bossBatLairTask: QuestTask = registerQuestTask({
  name: "L4_bossBatLair",
  completed: () => internalQuestStatus("questL04Bat") >= 4,
  ready: () => internalQuestStatus("questL04Bat") >= 3,
  do: L4_bossBatLair,
  locations: $location`The Boss Bat's Lair`,
  desiredEncounters: () =>
    [
      {
        monster: $monster`Boss Bat`,
        needAmount: internalQuestStatus("questL04Bat") >= 4 ? 0 : 1,
      },
    ].filter((a) => a.needAmount > 0),
});

function L4_batratBurrowAdvanced(): boolean {
  bat_formBats();
  if (
    itemAmount($item`enchanted bean`) === 0 &&
    internalQuestStatus("questL10Garbage") < 2 &&
    !isActuallyEd()
  ) {
    autoAdv($location`The Beanbat Chamber`);
    return true;
  }
  // prioritize getting replica Mr. A in LoL
  // prioritize boss meat in amw
  if (
    shenShouldDelayZone($location`The Batrat and Ratbat Burrow`) &&
    !in_lol() &&
    !in_amw()
  ) {
    auto_log_debug("Delaying Batrat Burrow in case of Shen.");
    return false;
  }
  if (auto_haveGreyGoose()) {
    handleFamiliar$1($familiar`Grey Goose`);
  }
  autoAdv($location`The Batrat and Ratbat Burrow`);
  return true;
}

const L4_batratBurrowAdvancedTask: QuestTask = registerQuestTask({
  name: "L4_batratBurrowAdvanced",
  completed: () => internalQuestStatus("questL04Bat") >= 3,
  ready: () => internalQuestStatus("questL04Bat") >= 2,
  do: L4_batratBurrowAdvanced,
  locations: $locations`The Beanbat Chamber, The Batrat and Ratbat Burrow`,
  desiredEncounters: () =>
    [
      {
        item: $item`enchanted bean`,
        needAmount:
          itemAmount($item`enchanted bean`) === 0 &&
          internalQuestStatus("questL10Garbage") < 2 &&
          !isActuallyEd()
            ? 1
            : 0,
      },
    ].filter((a) => a.needAmount > 0),
});

function L4_batratBurrow(): boolean {
  // prioritize getting replica Mr. A in LoL
  // prioritize boss meat in amw
  if (
    shenShouldDelayZone($location`The Batrat and Ratbat Burrow`) &&
    !in_lol() &&
    !in_amw()
  ) {
    auto_log_debug("Delaying Batrat Burrow in case of Shen.");
    return false;
  }
  bat_formBats();
  if (auto_haveGreyGoose()) {
    handleFamiliar$1($familiar`Grey Goose`);
  }
  autoAdv($location`The Batrat and Ratbat Burrow`);
  return true;
}

const L4_batratBurrowTask: QuestTask = registerQuestTask({
  name: "L4_batratBurrow",
  completed: () => internalQuestStatus("questL04Bat") >= 2,
  ready: () => internalQuestStatus("questL04Bat") >= 1,
  do: L4_batratBurrow,
  locations: $location`The Batrat and Ratbat Burrow`,
  desiredEncounters: () =>
    [
      {
        monster: $phylum`beast`,
        needAmount: internalQuestStatus("questL04Bat") >= 2 ? 0 : 1,
      },
    ].filter((a) => a.needAmount > 0),
});

function L4_guanoJunction(): boolean {
  if (!provideGuanoStenchResistance()) {
    return false;
  }

  bat_formBats();
  if (auto_haveGreyGoose()) {
    handleFamiliar$1($familiar`Grey Goose`);
  }
  return autoAdv($location`Guano Junction`);
}

const L4_guanoJunctionTask: QuestTask = registerQuestTask({
  name: "L4_guanoJunction",
  completed: () => internalQuestStatus("questL04Bat") >= 1,
  ready: () => true,
  do: L4_guanoJunction,
  locations: $location`Guano Junction`,
  desiredEncounters: () =>
    [
      {
        monster: $phylum`beast`,
        needAmount: internalQuestStatus("questL04Bat") >= 1 ? 0 : 1,
      },
    ].filter((a) => a.needAmount > 0),
});

function L4_batCaveDo(): boolean {
  auto_log_info("In the bat hole!", "blue");

  if (
    runTaskChain([
      L4_batWingsBatHoleEntranceTask,
      L4_batWingsGuanoJunctionTask,
      L4_batWingsBatratBurrowTask,
      L4_batWingsBeanbatChamberTask,
    ])
  ) {
    return true;
  }

  if (considerGrimstoneGolem(true)) {
    handleBjornify($familiar`Grimstone Golem`);
  }
  buffMaintain$2($effect`Fishy Whiskers`);

  const batStatus: number = internalQuestStatus("questL04Bat");
  if (batStatus < 3) {
    const sonarResult = L4_trySonarBiscuit();
    if (sonarResult !== undefined) {
      return sonarResult;
    }
  }

  return runTaskChain([
    L4_batBeanbatFinalTask,
    L4_bossBatLairTask,
    L4_batratBurrowAdvancedTask,
    L4_batratBurrowTask,
    L4_guanoJunctionTask,
  ]);
}

export const L4_batCaveTask: QuestTask = registerQuestTask({
  name: "L4_batCave",
  completed: () => internalQuestStatus("questL04Bat") > 4,
  ready: () => internalQuestStatus("questL04Bat") >= 0,
  do: L4_batCaveDo,
});

export function L4_batCave(): boolean {
  return runQuestTask(L4_batCaveTask);
}
