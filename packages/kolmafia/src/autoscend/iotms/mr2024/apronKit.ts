import { gitExists, Item, itemAmount } from "kolmafia";
import { $item, get, set } from "libram";

import { fullness_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { auto_abort, internalQuestStatus } from "../../auto_util";
import { c2t_apron } from "../../utils/c2t_apron";

// This is meant for items that have a date of 2024
// used in consumeBlackAndWhiteApronKit()
// used in chest mimic

//Defined in autoscend/iotms/mr2024.ash
export function consumeBlackAndWhiteApronKit(): boolean {
  const apronKit: Item = $item`Black and White Apron Meal Kit`;
  if (fullness_left() < 3) {
    return false;
  }
  if (itemAmount(apronKit) < 1) {
    return false;
  }

  if (!gitExists("C2Talon-c2t_apron-master")) {
    auto_abort(
      "script c2t_apron didn't install properly. Fix and run autoscend again.",
    );
  }
  // default ingredient allow list. Allow all but:
  // Potentially quest relevant: Blackberry, Bubblin' crude, enchanted bean
  // Extra cold damage: grapefruit
  // 20ml: dill
  let allowList: string =
    "3489,1356,1560,2525,3490,748,1562,1557,1561,3491,\n1122,1559,2094,183,182,2338,237,787,1004,238,328,1005,2583,1006,589,672,2524,304,6724,\n1462,161,158,358,2589,55,302,332,170,2532,187,357,245,242,4956,830,165,1003,8,786,1558,\n246,4,159,209";
  // allow quest items if no longer needed
  if (
    possessEquipment($item`blackberry galoshes`) ||
    itemAmount($item`blackberry`) > 3
  ) {
    allowList += ",2063";
  }
  const oilProgress: number = get("twinPeakProgress");
  if (
    (oilProgress & 4) === 1 ||
    itemAmount($item`jar of oil`) > 0 ||
    itemAmount($item`bubblin' crude`) > 12
  ) {
    allowList += ",5789";
  }
  if (
    itemAmount($item`enchanted bean`) > 1 ||
    internalQuestStatus("questL10Garbage") >= 1
  ) {
    allowList += ",186";
  }
  set("c2t_apron_allowlist", allowList);
  // consume the apron kit using c2t's script
  // this will default to consuming food for our current mainstat
  // https://github.com/C2Talon/c2t_apron
  return c2t_apron();
}
