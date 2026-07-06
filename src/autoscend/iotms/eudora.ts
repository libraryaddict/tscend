import { containsText, isUnrestricted, Item, visitUrl } from "kolmafia";
import { $item } from "libram";
//Defined in autoscend/iotms/auto_eudora.ash
function eudora_available(): boolean {
  if (containsText(visitUrl("account.php"), "tab=correspondence")) {
    return true;
  }
  return false;
}

export function eudora_initializeSettings(): Map<Item, boolean> {
  const retval: Map<Item, boolean> = new Map();
  if (eudora_available()) {
    const eudora_1: string = visitUrl("account.php?tab=correspondence");
    if (
      containsText(eudora_1, "Pen Pal") &&
      isUnrestricted($item`My Own Pen Pal kit`)
    ) {
      retval.set($item`My Own Pen Pal kit`, true);
    }
    if (
      containsText(eudora_1, "GameInformPowerDailyPro Magazine") &&
      isUnrestricted($item`GameInformPowerDailyPro subscription card`)
    ) {
      retval.set($item`GameInformPowerDailyPro subscription card`, true);
    }
    if (
      containsText(eudora_1, "Xi Receiver Unit") &&
      isUnrestricted($item`Xi Receiver Unit`)
    ) {
      retval.set($item`Xi Receiver Unit`, true);
    }
    if (
      containsText(eudora_1, "New-You Club") &&
      isUnrestricted($item`New-You Club Membership Form`)
    ) {
      retval.set($item`New-You Club Membership Form`, true);
    }
    if (
      containsText(eudora_1, "Our Daily Candles") &&
      isUnrestricted($item`Our Daily Candles™ order form`)
    ) {
      retval.set($item`Our Daily Candles™ order form`, true);
    }
  }
  return retval;
}
