import {
  containsText,
  Monster,
  print,
  splitString,
  toMonster,
  userConfirm,
  visitUrl,
} from "kolmafia";
import { $item, $monster, get } from "libram";

import { auto_canRunBetweenBattleChecks } from "../../auto_adventure";
import { auto_is_valid, auto_runChoice } from "../../auto_util";

const importantMonsters: Monster[] = Monster.get([
  // L4:
  "beanbat",
  // L5:
  "Knob Goblin Harem Girl",
  // L7:
  "dirty old lihc",
  // L8:
  "dairy goat",
  // L9:
  "bearpig topiary animal",
  "elephant (meatcar?) topiary animal",
  "spider (duck?) topiary animal",
  // L10:
  "Quiet Healer",
  "Burly Sidekick",
  // L11:
  // Hidden City:
  "baa-relief sheep",
  "pygmy bowler",
  "pygmy shaman",
  "pygmy janitor",
  "pygmy witch accountant",
  "pygmy witch surgeon",
  // Spookyraven:
  "animated ornate nightstand",
  "elegant animated nightstand",
  "cabinet of Dr. Limpieza",
  "possessed wine rack",
  "monstrous boiler",
  "writing desk",
  "chalkdust wraith",
  "banshee librarian",
  // Palindome:
  "whitesnake",
  "white lion",
  // Zeppelin:
  "man with the red buttons",
  "red butler",
  "red skeleton",
  // Desert:
  "blur",
  "tomb rat",
  // L12:
  "batwinged gremlin (tool)",
  "erudite gremlin (tool)",
  "spider gremlin (tool)",
  "vegetable gremlin (tool)",
]);

function icehouseMonster(): Monster {
  visitUrl("museum.php?action=icehouse");
  if (!containsText(get("banishedMonsters"), "ice house")) {
    return $monster.none;
  } else {
    const banishMap: Map<number, string> = new Map(
      splitString(get("banishedMonsters"), ":").map((_v, _i) => [_i, _v]),
    );
    for (let i: number = 0; i < banishMap.size; i++) {
      if ((banishMap.get(i) ?? "") === "ice house") {
        return toMonster(banishMap.get(i - 1) ?? "");
      }
    }
  }
  return $monster.none;
}

export function icehouseUserErrorProtection(): boolean {
  if (!auto_is_valid($item`ice house`) || !auto_canRunBetweenBattleChecks()) {
    return true;
  }
  if (icehouseMonster() === $monster.none) {
    return true;
  } else if (importantMonsters.includes(icehouseMonster())) {
    if (
      userConfirm(
        `You have a ${icehouseMonster().toString()} frozen in your icehouse. Autoscend thinks it might cause problems, do you want us to melt it? Will default to 'Yes' in 15 seconds.`,
        15000,
        true,
      )
    ) {
      visitUrl("museum.php?action=icehouse");
      auto_runChoice(1);
      return true;
    } else {
      print("If autoscend runs into problems, it's on you!");
      return false;
    }
  } else {
    return true;
  }
}
