import {
  cliExecute,
  getProperty,
  isUnrestricted,
  myDaycount,
  toBoolean,
  visitUrl,
} from "kolmafia";
import { $element, $item, get } from "libram";

import { ElementalPlanes } from "../../../types";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { is_jarlsberg } from "../../paths/2013/avatar_of_jarlsberg";
import { is_pete } from "../../paths/2014/avatar_of_sneaky_pete";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_awol } from "../../paths/2016/avatar_of_west_of_loathing";
import { in_nuclear } from "../../paths/2016/nuclear_autumn";
import { in_theSource } from "../../paths/2016/the_source";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { inAftercore } from "../../paths/casual";

//	This is meant for items that have a date of 2015
//	Handling: shrine to the Barrel God, Chateau Mantegna Room Key, Deck of Every Card
//

//Defined in autoscend/iotms/mr2015.ash

export function barrelPrayers(): boolean {
  if (!isUnrestricted($item`shrine to the Barrel god`)) {
    return false;
  }
  if (get("_barrelPrayer")) {
    return false;
  }
  if (!get("barrelShrineUnlocked")) {
    visitUrl("da.php");
    if (!get("barrelShrineUnlocked")) {
      return false;
    }
  }
  if (inAftercore()) {
    return false;
  }

  let prayers: string[] = [];

  if (in_lta()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Protection", "Vigor"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_nuclear()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Vigor", "Glamour"];
        break;
      case 2:
        prayers = ["Vigor", "Glamour"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (in_theSource()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_awol()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (is_boris()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["none"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (is_pete()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (is_jarlsberg()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_wotsf()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["none"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (in_heavyrains()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (isActuallyEd()) {
    if (
      ElementalPlanes.elementalPlanes_access($element`spooky`) &&
      get("edPoints") >= 2
    ) {
      switch (myDaycount()) {
        case 1:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 2:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 3:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 4:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
      }
    } else {
      switch (myDaycount()) {
        case 1:
          prayers = ["Glamour", "Vigor", "Protection"];
          break;
        case 2:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 3:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 4:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
      }
    }
  } else {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Protection", "Vigor"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  }

  for (const prayer of prayers) {
    if (prayer === "none") {
      return false;
    }
    if (!toBoolean(getProperty(`prayedFor${prayer}`))) {
      cliExecute(`barrelprayer ${prayer}`);
      return true;
    }
  }

  return false;
}
