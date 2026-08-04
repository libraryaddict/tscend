import { containsText, isUnrestricted, Item, visitUrl } from "kolmafia";
import { $item } from "libram";
//Defined in autoscend/iotms/auto_eudora.ash
function eudora_available(): boolean {
  if (containsText(visitUrl("account.php"), "tab=correspondence")) {
    return true;
  }
  return false;
}

export function eudora_initializeSettings(): Item[] {
  const retval: Item[] = [];
  if (eudora_available()) {
    const eudora_1: string = visitUrl("account.php?tab=correspondence");
    if (
      containsText(eudora_1, "Pen Pal") &&
      isUnrestricted($item`My Own Pen Pal kit`)
    ) {
      retval.push($item`My Own Pen Pal kit`);
    }
    if (
      containsText(eudora_1, "GameInformPowerDailyPro Magazine") &&
      isUnrestricted($item`GameInformPowerDailyPro subscription card`)
    ) {
      retval.push($item`GameInformPowerDailyPro subscription card`);
    }
    if (
      containsText(eudora_1, "Xi Receiver Unit") &&
      isUnrestricted($item`Xi Receiver Unit`)
    ) {
      retval.push($item`Xi Receiver Unit`);
    }
    if (
      containsText(eudora_1, "New-You Club") &&
      isUnrestricted($item`New-You Club Membership Form`)
    ) {
      retval.push($item`New-You Club Membership Form`);
    }
    if (
      containsText(eudora_1, "Our Daily Candles") &&
      isUnrestricted($item`Our Daily Candles™ order form`)
    ) {
      retval.push($item`Our Daily Candles™ order form`);
    }
  }
  return retval;
}
