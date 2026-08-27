import { containsText, myMeat, toLowerCase, visitUrl } from "kolmafia";
import { $item, get, set } from "libram";

import { auto_is_valid, auto_log_warning } from "../../auto_util";

export function isHorseryAvailable(): boolean {
  return get("horseryAvailable") && auto_is_valid($item`Horsery contract`);
}

export function horseCost(): number {
  if (get("_auto_horseryRented", 0) > 0) {
    return 500;
  }
  return 0;
}

function horseNormalize(horseText: string): string {
  switch (horseText) {
    case "normal horse":
    case "normal":
    case "regen":
    case "init":
      return "normal";
    case "dark horse":
    case "dark":
    case "meat":
    case "-combat":
    case "noncombat":
    case "non-combat":
      return "dark";
    case "crazy horse":
    case "crazy":
    case "hookah":
    case "random":
      return "crazy";
    case "pale horse":
    case "pale":
    case "res":
    case "resistance":
    case "spooky":
    case "damage":
      return "pale";
    case "return":
    case "":
      return "return";
  }

  if (containsText(horseText, "normal horse")) {
    return "normal";
  } else if (containsText(horseText, "dark horse")) {
    return "dark";
  } else if (containsText(horseText, "crazy horse")) {
    return "crazy";
  } else if (containsText(horseText, "pale horse")) {
    return "pale";
  }

  auto_log_warning(
    `Unknown Horsery horse type: '${horseText}'. Should be '', 'normal', 'dark', 'crazy', or 'pale'.`,
    "red",
  );
  return "";
}

function getHorse(type_1: string): boolean {
  if (!get("horseryAvailable")) {
    return false;
  }
  type_1 = toLowerCase(type_1);
  if (myMeat() < horseCost() && type_1 !== "return") {
    return false;
  }

  let choice: number = -1;
  if (
    horseNormalize(type_1) === "normal" ||
    get("auto_beatenUpCount", 0) >= 20
  ) {
    if (get("_horsery") === "normal horse") {
      return false;
    }
    choice = 1;
    set("auto_desiredHorse", "normal");
  } else if (horseNormalize(type_1) === "dark") {
    if (get("_horsery") === "dark horse") {
      return false;
    }
    choice = 2;
    set("auto_desiredHorse", "dark");
  } else if (horseNormalize(type_1) === "crazy") {
    if (containsText(get("_horsery"), "crazy horse")) {
      return false;
    }
    choice = 3;
    set("auto_desiredHorse", "crazy");
  } else if (horseNormalize(type_1) === "pale") {
    if (containsText(get("_horsery"), "pale horse")) {
      return false;
    }
    choice = 4;
    set("auto_desiredHorse", "pale");
  } else if (horseNormalize(type_1) === "return") {
    if (get("_horsery") === "") {
      return false;
    }
    choice = 5;
    set("_horsery", "");
    set("auto_desiredHorse", "return");
  }

  if (choice === -1) {
    return false;
  }
  visitUrl("place.php?whichplace=town_right&action=town_horsery");
  visitUrl(`choice.php?pwd=&whichchoice=1266&option=${choice}`);
  if (choice <= 4) {
    set("_auto_horseryRented", get("_auto_horseryRented", 0) + 1);
  }
  return true;
}

export function horseDefault(): void {
  if (isHorseryAvailable()) {
    set("auto_desiredHorse", "");
  }
}

export function horseMaintain(): void {
  if (isHorseryAvailable()) {
    set("auto_desiredHorse", horseNormalize(get("_horsery")));
  }
}

export function horseNone(): void {
  if (isHorseryAvailable()) {
    set("auto_desiredHorse", "return");
  }
}

export function horseDark(): void {
  if (isHorseryAvailable()) {
    set("auto_desiredHorse", "dark");
  }
}

export function horsePreAdventure(): boolean {
  if (!isHorseryAvailable()) {
    return false;
  }

  const desiredHorse: string = get("auto_desiredHorse");
  if (desiredHorse === "") {
    return false;
  }

  if (
    desiredHorse !== "normal" &&
    desiredHorse !== "dark" &&
    desiredHorse !== "crazy" &&
    desiredHorse !== "pale" &&
    desiredHorse !== "return"
  ) {
    auto_log_warning(
      `auto_desiredHorse was set to bad value: '${desiredHorse}'. Should be '', 'normal', 'dark', 'crazy', or 'pale'.`,
      "red",
    );
    set("auto_desiredHorse", "");
    return false;
  }
  return getHorse(desiredHorse);
}
