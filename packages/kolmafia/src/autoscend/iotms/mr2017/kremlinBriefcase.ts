import {
  containsText,
  Effect,
  haveEffect,
  isUnrestricted,
  itemAmount,
  myAscensions,
  myDaycount,
  splitString,
  toEffect,
  toInt,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $item, get, set } from "libram";

import { possessEquipment } from "../../auto_equipment";
import {
  auto_abort,
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
} from "../../auto_util";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function kgbWasteClicks(): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!auto_is_valid($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (get("_kgbClicksUsed") >= 22) {
    return false;
  }

  auto_log_info("kgbWasteClicks() will now use up remaining KGB clicks");
  let clicked: number = 0;
  while (kgbDiscovery() && clicked < 10) {
    clicked++;
  }
  // Yes, this will not be pleasant if we matched our number and each page click changes the buttons.
  while (get("_kgbClicksUsed") < 22 && clicked < 9) {
    const start_1: number = clicked;
    for (const ef of $effects`Items Are Forever, A View to Some Meat, Light!, The Spy Who Loved XP, Initiative and Let Die, The Living Hitpoints, License to Punch, Goldentongue, Thunderspell`) {
      if (containsText(get("auto_kgbTracker"), `:${toInt(ef)}`)) {
        kgbTryEffect(ef);
        clicked++;
        if ($effects`Items Are Forever, A View to Some Meat`.includes(ef)) {
          if (haveEffect(ef) < 150) {
            break;
          }
        }
        if (ef === $effect`Light!`) {
          break;
        }
      }
    }
    if (start_1 === clicked) {
      auto_log_warning(
        "kgbWasteClicks() was unable to spend your remaining KGB clicks on buffs for some reason. Please spend them manually",
      );
      break; //prevent infinite loop
    }
  }

  return clicked > 0;
}

function kgbTryEffect(ef: Effect): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!isUnrestricted($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (get("_kgbClicksUsed") >= 22) {
    return false;
  }

  if (get("auto_kgbTracker") === "") {
    set("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  let tracker: Map<number, string> = new Map(
    splitString(get("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );
  if (tracker.size < 13 || toInt(tracker.get(0) ?? "") !== myAscensions()) {
    set("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  tracker = new Map(
    splitString(get("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );

  for (let i: number = 1; i < 13; i++) {
    if (toEffect(tracker.get(i) ?? "") === ef) {
      const button: number = (i + 1) / 2;
      visitUrl(`place.php?whichplace=kgb&action=kgb_tab${button}`, false);
      return true;
    }
  }
  return true;
}

function kgbDiscovery(): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!isUnrestricted($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (get("_kgbClicksUsed") >= 22) {
    return false;
  }

  if (get("auto_kgbTracker") === "") {
    set("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  let tracker: Map<number, string> = new Map(
    splitString(get("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );
  if (tracker.size < 13 || toInt(tracker.get(0) ?? "") !== myAscensions()) {
    set("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  tracker = new Map(
    splitString(get("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );

  const page: string = visitUrl("place.php?whichplace=kgb", false);
  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    const id: number = toInt(tabCount.group(1));
    const height: number = toInt(tabCount.group(2));
    const index: number = (id - 1) * 2 + height;
    if (toInt(tracker.get(index) ?? "") === 0) {
      auto_log_info(`We do not know ${id} of height: ${height}`, "green");
      const curEff: number[] = [];
      for (let i: number = 2296; i <= 2306; i++) {
        curEff[i - 2296] = haveEffect(toEffect(i));
      }
      visitUrl(`place.php?whichplace=kgb&action=kgb_tab${id}`, false);
      for (let i: number = 2296; i <= 2306; i++) {
        if (haveEffect(toEffect(i)) !== (curEff[i - 2296] ??= 0)) {
          if (haveEffect(toEffect(i)) === (curEff[i - 2296] ??= 0) + 100) {
            auto_log_info("It contains random!", "green");
            tracker.set(index, (1).toString());
          } else {
            auto_log_info(`It contains ${toEffect(i)}!`, "green");
            tracker.set(index, i.toString());
          }
        }
      }
      let newTracker: string = myAscensions().toString();
      for (let i: number = 1; i < 13; i++) {
        newTracker += `:${tracker.get(i) ?? ""}`;
      }
      set("auto_kgbTracker", newTracker);
      return true;
    }
  }
  return false;
}

function kgb_tabCount(page: string): number {
  let count_1: number = 0;
  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    count_1++;
  }
  return count_1;
}

function kgb_tabHeight(page: string): number {
  let height: number = 0;

  let printTabs: boolean = false;
  const ring_matcher: AshMatcher = new AshMatcher("lightrings(\\d+)", page);
  if (ring_matcher.find()) {
    const image: number = toInt(ring_matcher.group(1));
    auto_log_info(`Found rings of value ${image}`, "blue");
    printTabs = true;
  }

  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    height += toInt(tabCount.group(2));
    if (printTabs) {
      const id: number = toInt(tabCount.group(1));
      const height_1: number = toInt(tabCount.group(2));
      auto_log_info(`Tab ${id} with height of ${height_1}`, "green");
    }
  }

  return height;
}

export function kgbSetup(): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!auto_is_valid($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }

  if (get("_auto_kgbSetup", false)) {
    return false;
  }

  if (myDaycount() !== 1) {
    return false;
  }

  set("_auto_kgbSetup", true);

  let page: string = visitUrl("place.php?whichplace=kgb");
  if (
    containsText(page, "kgb_drawer") ||
    containsText(page, "kgb_crank") ||
    containsText(page, "kgb_button")
  ) {
    return false;
  }

  if (!containsText(page, "kgb_button")) {
    kgbDial(1, -1, 6);
    kgbDial(2, -1, 6);
    kgbDial(3, -1, 6);
    kgbDial(4, -1, 6);
    kgbDial(5, -1, 6);
    kgbDial(6, -1, 6);
    visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    //Crank extruded.
    if (!containsText(page, "kgb_crank")) {
      auto_abort("Failed to unlock kgb_crank");
    }
    visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    for (let i: number = 0; i < 11; i++) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_crank", false);
    }
    if (!containsText(page, "...........")) {
      auto_abort("11 cranks failed");
    }
    visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);

    visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    if (!containsText(page, "kgb_dispenser")) {
      auto_abort("Failed to unlock kgb_dispenser");
    }
    //Martini Hose extruded.

    visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    kgbDial(1, -1, 3);
    kgbDial(2, -1, 3);
    kgbDial(3, -1, 3);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    if (!containsText(page, "kgb_drawer2")) {
      auto_abort("Failed to unlock kgb_drawer2");
    }
    visitUrl("place.php?whichplace=kgb&action=kgb_drawer2", false);

    kgbDial(4, -1, 2);
    kgbDial(5, -1, 2);
    kgbDial(6, -1, 2);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    if (!containsText(page, "kgb_drawer1")) {
      auto_abort("Failed to unlock kgb_drawer1");
    }
    visitUrl("place.php?whichplace=kgb&action=kgb_drawer1", false);

    kgbDial(1, -1, 7);
    kgbDial(2, -1, 9);
    kgbDial(3, -1, 8);
    kgbDial(4, -1, 8);
    kgbDial(5, -1, 9);
    kgbDial(6, -1, 7);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
  }
  if (!containsText(page, "kgb_button")) {
    auto_abort("Failed to unlock kgb_button");
  }

  let button: number = -1;
  page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
  for (let i: number = 1; i <= 6; i++) {
    auto_log_info(`Hitting tab modification button: ${i}`, "blue");
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_button${i}`, false);

    const count_1: number = kgb_tabCount(page);
    const height: number = kgb_tabHeight(page);

    if (count_1 >= 3) {
      button = i;
      i--;
    }

    if (height >= 11) {
      break;
    }
  }
  set("auto_kgbAscension", myAscensions());
  set("auto_kgbButton100", button);

  if (!kgb_getMartini(page)) {
    auto_log_warning("Failed to get martini", "red");
  }

  return true;
}

export function kgb_getMartini(
  page: string = "",
  dontCare: boolean = false,
): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!auto_is_valid($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (get("_kgbDispenserUses") >= 3) {
    return false;
  }

  if (!get("_auto_kgbSetup", false)) {
    kgbSetup();
  }

  if (get("auto_kgbAscension", 0) !== myAscensions()) {
    if (!dontCare) {
      auto_log_info(
        "We did not initialize the briefcase this ascension, we do not care",
        "red",
      );
      dontCare = true;
    }
  }

  if (page === "") {
    page = visitUrl("place.php?whichplace=kgb");
  }

  if (!get("_kgbOpened", false)) {
    let flipped: boolean = false;
    if (containsText(page, "handledown")) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
      flipped = true;
    }
    for (let i: number = 0; i < 11; i++) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_crank", false);
      if (containsText(page, "Nothing seems to happen")) {
        break;
      }
    }
    if (!containsText(page, "...........")) {
      auto_log_warning("Cranking did not work, uh oh!", "red");
    } else {
      visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
      visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
      auto_log_info("Crank power!!", "green");
    }

    if (flipped) {
      visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    }

    if (!get("_kgbRightDrawerUsed")) {
      visitUrl("place.php?whichplace=kgb&action=kgb_drawer1", false);
    }
    if (!get("_kgbLeftDrawerUsed")) {
      visitUrl("place.php?whichplace=kgb&action=kgb_drawer2", false);
    }
    if (!get("_kgbOpened")) {
      visitUrl("place.php?whichplace=kgb&action=kgb_daily", false);
    }
  }
  if (get("_kgbDispenserUses") >= 3) {
    return false;
  }

  const button: number = get("auto_kgbButton100", 0);

  while (get("_kgbDispenserUses") < 3 && get("_kgbClicksUsed") < 22) {
    const served: number = get("_kgbDispenserUses");
    const have: number = itemAmount($item`splendid martini`);
    page = visitUrl("place.php?whichplace=kgb&action=kgb_dispenser", false);
    if (containsText(page, "Nothing happens.")) {
      set("_kgbDispenserUses", 3);
      auto_log_warning("The martini dispenser is empty, weird.", "red");
      return true;
    }
    if (kgb_tabHeight(page) < 11 && !dontCare) {
      auto_log_info(
        "Did we accidentally solve a puzzle? Gonna assume so...",
        "green",
      );
      auto_log_info(`Hitting tab modification button: ${button}`, "blue");
      const oldClicks: number = get("_kgbClicksUsed");
      page = visitUrl(
        `place.php?whichplace=kgb&action=kgb_button${button}`,
        false,
      );
      const newClicks: number = get("_kgbClicksUsed");
      if (newClicks === oldClicks) {
        auto_log_info(
          "_kgbClicksUsed appears to not be tracking, please let the spies in.",
          "red",
        );
        set("_kgbClicksUsed", newClicks + 1);
      }
      if (kgb_tabHeight(page) < 11) {
        if (button === 0) {
          auto_abort(
            "Cannot seem to recover situation regarding splendid martinis",
          );
        }
        auto_log_info("Trying to restore tabs", "green");
        continue;
      }
    }
    if (have === itemAmount($item`splendid martini`) && !dontCare) {
      auto_abort("Failed to get a splendid martini and we cared about it");
    }
    set("_kgbDispenserUses", served + 1);
  }
  return true;
}

function kgbDial(dial: number, curVal: number, target: number): boolean {
  if (!possessEquipment($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }
  if (!auto_is_valid($item`Kremlin's Greatest Briefcase`)) {
    return false;
  }

  if (curVal === target) {
    return true;
  }

  while (curVal !== target) {
    const page: string = visitUrl(
      `place.php?whichplace=kgb&action=kgb_dial${dial}`,
      false,
    );
    const dials: Map<number, number> = new Map();
    const dial_matcher: AshMatcher = new AshMatcher(
      'title="Weird Character (.)',
      page,
    );
    let count_1: number = 1;
    while (dial_matcher.find()) {
      const temp: string = dial_matcher.group(1);
      if (temp === "a") {
        dials.set(count_1, 10);
      } else {
        dials.set(count_1, toInt(dial_matcher.group(1)));
      }
      count_1++;
    }
    curVal = dials.get(dial) ?? 0;
    auto_log_info(`Clicking ${dial} and now: ${curVal}`, "blue");
  }
  return true;
}
