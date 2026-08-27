import {
  getProperty,
  inebrietyLimit,
  isUnrestricted,
  myInebriety,
  myPrimestat,
  toInt,
  toUpperCase,
  visitUrl,
} from "kolmafia";
import { $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_log_info, auto_runChoice } from "../../auto_util";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { is_jarlsberg } from "../../paths/2013/avatar_of_jarlsberg";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { inAftercore } from "../../paths/casual";

export function snojoFightAvailable(): boolean {
  if (!isUnrestricted($item`X-32-F snowman crate`)) {
    return false;
  }
  if (!get("snojoAvailable")) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  if (myInebriety() > inebrietyLimit()) {
    return false;
  }

  if (!inAftercore()) {
    const controls: Map<string, number> = new Map();
    controls.set("MUSCLE", 1);
    controls.set("MYSTICALITY", 2);
    controls.set("MOXIE", 3);
    controls.set("Muscle", 1);
    controls.set("Mysticality", 2);
    controls.set("Moxie", 3);
    //List the three desired goals and then a "final" state that we stay in
    const standard: Map<number, string> = new Map();
    standard.set(0, "Moxie");
    standard.set(1, "Mysticality");
    standard.set(2, "Muscle");
    standard.set(3, "Moxie");

    if (
      is_boris() &&
      (possessEquipment($item`Boris's Helm`) ||
        possessEquipment($item`Boris's Helm (askew)`))
    ) {
      standard.set(0, "Muscle");
      standard.set(1, "Mysticality");
      standard.set(2, "Moxie");
      standard.set(3, "Mysticality");
    }
    if (in_lta()) {
      standard.set(0, "Mysticality");
      standard.set(1, "Moxie");
      standard.set(2, "Muscle");
      standard.set(3, "Mysticality");
    }
    if (is_jarlsberg()) {
      standard.set(0, "Mysticality");
      standard.set(1, "Moxie");
      standard.set(2, "Muscle");
      standard.set(3, "Moxie");
    }

    if (
      toInt(getProperty(`snojo${standard.get(0) ?? ""}Wins`)) < 14 &&
      getProperty("snojoSetting") !== toUpperCase(standard.get(0) ?? "")
    ) {
      visitUrl("place.php?whichplace=snojo&action=snojo_controller");
      auto_runChoice(controls.get(standard.get(0) ?? "") ?? 0);
    }
    if (
      getProperty("snojoSetting") === toUpperCase(standard.get(0) ?? "") &&
      toInt(getProperty(`snojo${standard.get(0) ?? ""}Wins`)) >= 14 &&
      getProperty("snojoSetting") !== toUpperCase(standard.get(1) ?? "") &&
      toInt(getProperty(`snojo${standard.get(1) ?? ""}Wins`)) < 14
    ) {
      visitUrl("place.php?whichplace=snojo&action=snojo_controller");
      auto_runChoice(controls.get(standard.get(1) ?? "") ?? 0);
    }
    if (
      getProperty("snojoSetting") === toUpperCase(standard.get(1) ?? "") &&
      toInt(getProperty(`snojo${standard.get(1) ?? ""}Wins`)) >= 14 &&
      getProperty("snojoSetting") !== toUpperCase(standard.get(2) ?? "") &&
      toInt(getProperty(`snojo${standard.get(2) ?? ""}Wins`)) < 14
    ) {
      visitUrl("place.php?whichplace=snojo&action=snojo_controller");
      auto_runChoice(controls.get(standard.get(2) ?? "") ?? 0);
    }
    if (
      getProperty("snojoSetting") === toUpperCase(standard.get(2) ?? "") &&
      toInt(getProperty(`snojo${standard.get(2) ?? ""}Wins`)) >= 11 &&
      getProperty("snojoSetting") !== toUpperCase(standard.get(3) ?? "")
    ) {
      visitUrl("place.php?whichplace=snojo&action=snojo_controller");
      auto_runChoice(controls.get(standard.get(3) ?? "") ?? 0);
    }
  }

  if (getProperty("snojoSetting") === "NONE") {
    auto_log_info(
      `Snojo not set, attempting to set to ${myPrimestat()}`,
      "blue",
    );
    visitUrl("place.php?whichplace=snojo&action=snojo_controller");
  }
  return get("_snojoFreeFights") < 10;
}
