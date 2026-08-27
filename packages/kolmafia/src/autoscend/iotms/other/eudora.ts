import { entityEncode, isUnrestricted, Item, visitUrl } from "kolmafia";
import { $item } from "libram";

//Defined in autoscend/iotms/auto_eudora.ash

type AutoEudora$$Eudora = {
  kolName: string;
  mafiaName?: string;
  item: Item;
};

const AutoEudora$$eudoras: AutoEudora$$Eudora[] = [
  {
    kolName: "Pen Pal",
    mafiaName: "Penpal",
    item: $item`My Own Pen Pal kit`,
  },
  {
    kolName: "GameInformPowerDailyPro Magazine",
    item: $item`GameInformPowerDailyPro subscription card`,
  },
  {
    kolName: "Xi Receiver Unit",
    item: $item`Xi Receiver Unit`,
  },
  {
    kolName: "New-You Club",
    item: $item`New-You Club Membership Form`,
  },
  {
    kolName: "Our Daily Candles",
    item: $item`Our Daily Candles™ order form`,
  },
  {
    kolName: "Black & White Apron",
    item: $item`Black and White Apron Enrollment Form`,
  },
];

export function AutoEudora$$eudora_initializeSettings(): Item[] {
  const retval: Item[] = [];

  const eudoraPage = visitUrl("account.php?tab=correspondence");

  for (const eudora of AutoEudora$$eudoras) {
    if (
      !eudoraPage.includes(`">${entityEncode(eudora.kolName)}</option>`) ||
      !isUnrestricted(eudora.item)
    ) {
      continue;
    }

    retval.push(eudora.item);
  }

  return retval;
}
