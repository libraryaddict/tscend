import {
  containsText,
  isUnrestricted,
  itemAmount,
  myAdventures,
  myDaycount,
  myHash,
  myPath,
  myTurncount,
  toInt,
  toLowerCase,
  toMonster,
  visitUrl,
} from "kolmafia";
import { $item, $location, $path, get, set } from "libram";

import { autoAdvBypass, CombatMacro } from "../../auto_adventure";
import { auto_get_campground } from "../../auto_util";
import { in_gnoob } from "../../paths/2017/gelatinous_noob";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function haveWitchess(): boolean {
  if (!isUnrestricted($item`Witchess Set`)) {
    return false;
  }
  return auto_get_campground().has($item`Witchess Set`);
}

function auto_advWitchess(target: string, option?: CombatMacro): boolean {
  if (!haveWitchess()) {
    return false;
  }

  if (myAdventures() === 0) {
    return false;
  }

  const goal: number = auto_advWitchessTargets(target);
  if (goal === 0) {
    return false;
  }

  if (get("_auto_witchessBattles", 0) >= 5) {
    return false;
  }

  set("_auto_witchessBattles", get("_auto_witchessBattles", 0) + 1);

  let temp: string = visitUrl("campground.php?action=witchess");
  if (!containsText(temp, "Examine the shrink ray")) {
    set("_auto_witchessBattles", 5);
    return false;
  }
  temp = visitUrl("choice.php?whichchoice=1181&pwd=&option=1");
  const witchessMatcher: AshMatcher = new AshMatcher(
    "You can fight (\\d) more piece(s?) today",
    temp,
  );
  if (witchessMatcher.find()) {
    const consider: number = 5 - toInt(witchessMatcher.group(1)) + 1;
    if (consider > get("_auto_witchessBattles", 0)) {
      set("_auto_witchessBattles", consider);
    }
  } else {
    set("_auto_witchessBattles", 5);
    return false;
  }
  visitUrl("choice.php?pwd=&option=2&whichchoice=1182");

  set("auto_nextEncounter", toMonster(goal));
  const pages: Map<number, string> = new Map();
  pages.set(0, "campground.php?action=witchess");
  pages.set(1, "choice.php?whichchoice=1181&pwd=&option=1");
  pages.set(
    2,
    `choice.php?pwd=${myHash()}&whichchoice=1182&option=1&piece=${goal}`,
  );
  // We use 4 to cause pages[2] to use GET.
  return autoAdvBypass(4, pages, $location`Noob Cave`, option);
}

function auto_advWitchessTargets(target: string): number {
  target = toLowerCase(target);
  if (target === "knight" || target === "meat" || target === "food") {
    return 1936;
  }
  if (target === "pawn" || target === "spleen" || target === "init") {
    return 1935;
  }
  if (target === "bishop" || target === "item" || target === "booze") {
    return 1942;
  }
  if (target === "rook" || target === "ml" || target === "stats") {
    return 1938;
  }

  if (toInt(target) === 1942 && myPath() === $path`Teetotaler`) {
    return 1936;
  }

  if (
    target === "ox" ||
    target === "ox-head shield" ||
    target === "shield" ||
    target === "pvp" ||
    target === "hp" ||
    target === "resist" ||
    target === "resistance"
  ) {
    return 1937;
  }

  if (
    target === "king" ||
    target === "dented scepter" ||
    target === "scepter" ||
    target === "club" ||
    target === "muscle" ||
    target === "hpregen"
  ) {
    return 1940;
  }

  if (
    target === "witch" ||
    target === "battle broom" ||
    target === "broom" ||
    target === "myst" ||
    target === "mpregen" ||
    target === "spell"
  ) {
    return 1941;
  }

  if (
    target === "queen" ||
    target === "very pointy crown" ||
    target === "crown" ||
    target === "adv" ||
    target === "moxie" ||
    target === "nc" ||
    target === "noncombat" ||
    target === "non-combat"
  ) {
    return 1939;
  }

  return 0;
}

export function witchessFights(): boolean {
  if (!haveWitchess()) {
    return false;
  }
  if (myTurncount() < 20) {
    return false;
  }

  if (in_gnoob() || in_lta()) {
    return auto_advWitchess("ml");
  }

  switch (myDaycount()) {
    case 1: {
      if (itemAmount($item`Greek fire`) === 0) {
        return auto_advWitchess("ml");
      }
      return auto_advWitchess("booze");
    }
    case 2: {
      if (
        get("sidequestNunsCompleted") === "none" &&
        !get("auto_skipNuns") &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
      // INTENTIONAL LACK OF BREAK
    }
    case 3: {
      if (
        get("sidequestNunsCompleted") === "none" &&
        !get("auto_skipNuns") &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
      // INTENTIONAL LACK OF BREAK
    }
    case 4: {
      if (
        get("sidequestNunsCompleted") === "none" &&
        !get("auto_skipNuns") &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
      return auto_advWitchess("booze");
    }
    default:
      return auto_advWitchess("booze");
  }
  return false;
}
