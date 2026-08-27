import {
  cliExecute,
  getCounters,
  handlingChoice,
  itemAmount,
  lastChoice,
  myAdventures,
  myHash,
  myPath,
  visitUrl,
} from "kolmafia";
import { $item, $location, $locations, $paths, get, set } from "libram";

import { XiReceiver } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { handleChoiceAdv } from "../../auto_choice_adv";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_log_info,
  internalQuestStatus,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { bridgeGoal } from "../../quests/level_09";

function fancyOilPaintingDo(): boolean {
  auto_log_info("Acquiring a Fancy Oil Painting!", "blue");
  // use() aborts the whole script with "Unsupported choice adventure #829"
  // since this redirects straight into choice.php; visitUrl() bypasses that and
  // lets the real choice dispatcher handle it instead.
  const maskText = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`grimstone mask`.id}`,
  );
  if (handlingChoice()) {
    handleChoiceAdv(lastChoice(), maskText);
  }

  while (itemAmount($item`odd silver coin`) < 1) {
    autoAdv($location`The Prince's Balcony`);
  }
  while (itemAmount($item`odd silver coin`) < 2) {
    autoAdv($location`The Prince's Dance Floor`);
  }
  while (itemAmount($item`odd silver coin`) < 3) {
    autoAdv($location`The Prince's Lounge`);
  }
  while (itemAmount($item`odd silver coin`) < 4) {
    autoAdv($location`The Prince's Kitchen`);
  }
  cliExecute("make fancy oil painting");
  set("auto_grimstoneFancyOilPainting", false);
  return true;
}

const fancyOilPaintingTask: QuestTask = registerQuestTask({
  name: "fancyOilPainting",
  completed: () =>
    !get("auto_grimstoneFancyOilPainting", false) ||
    !auto_is_valid($item`grimstone mask`) ||
    !auto_is_valid($item`fancy oil painting`) ||
    get("chasmBridgeProgress") >= bridgeGoal(),
  ready: () =>
    get("chasmBridgeProgress") < bridgeGoal() &&
    myAdventures() > 4 &&
    itemAmount($item`grimstone mask`) > 0 &&
    getCounters("", 0, 6) === "",
  do: fancyOilPaintingDo,
  locations: $locations`The Prince's Balcony, The Prince's Dance Floor, The Prince's Lounge, The Prince's Kitchen`,
});

export function fancyOilPainting(): boolean {
  return runQuestTask(fancyOilPaintingTask);
}

registerQuestTask({
  name: "LX_ornateDowsingRod",
  completed: () =>
    !$paths`Legacy of Loathing, Quantum Terrarium`.includes(myPath()) ||
    !get("auto_grimstoneOrnateDowsingRod", false) ||
    !auto_is_valid($item`grimstone mask`) ||
    possessEquipment($item`ornate dowsing rod`) ||
    possessEquipment($item`UV-resistant compass`) ||
    get("desertExploration") >= 100 ||
    internalQuestStatus("questL11Desert") > 0,
  ready: () => true,
  do: () => XiReceiver.LX_ornateDowsingRod(),
});
