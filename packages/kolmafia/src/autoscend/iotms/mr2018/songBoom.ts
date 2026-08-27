import {
  containsText,
  floor,
  itemAmount,
  min,
  myFullness,
  myMeat,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, get } from "libram";

import { PillKeeper } from "../../../types";
import {
  auto_spleenFamiliarAdvItemsPossessed,
  spleen_left,
} from "../../auto_consume";
import {
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
  internalQuestStatus,
} from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_glover } from "../../paths/2018/g_lover";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function songboomSetting(goal: string): boolean {
  let option: number = 6;

  if (
    goal === "eye of the giger" ||
    goal === "spooky" ||
    goal === "nightmare" ||
    goal === $item`Nightmare Fuel`.toString() ||
    goal === "stats"
  ) {
    option = 1;
  } else if (
    goal === "food vibrations" ||
    goal === "food" ||
    goal === "food drops" ||
    goal === $item`Special Seasoning`.toString() ||
    goal === "spell damage" ||
    goal === "adventures" ||
    goal === "adv"
  ) {
    option = 2;
  } else if (
    goal === "remainin' alive" ||
    goal === "dr" ||
    goal === "damage reduction" ||
    goal === $item`Shielding Potion`.toString() ||
    goal === "delevel"
  ) {
    option = 3;
  } else if (
    goal === "these fists were made for punchin'" ||
    goal === "weapon damage" ||
    goal === "prismatic damage" ||
    goal === $item`Punching Potion`.toString() ||
    goal === "prismatic"
  ) {
    option = 4;
  } else if (
    goal === "total eclipse of your meat" ||
    goal === "meat" ||
    goal === "meat drop" ||
    goal === $item`Gathered Meat-Clip`.toString() ||
    goal === "base meat"
  ) {
    option = 5;
  } else if (goal === "silence" || goal === "none" || goal === "") {
    option = 6;
  }

  return songboomSetting$1(option);
}

function songboomSetting$1(option: number): boolean {
  if (!auto_is_valid($item`SongBoom™ BoomBox`)) {
    return false;
  }
  if (itemAmount($item`SongBoom™ BoomBox`) === 0) {
    return false;
  }
  if (get("_boomBoxSongsLeft") === 0) {
    if (option !== 6) {
      // Always allow turning off the song, if that is really something we want to do.
      return false;
    }
  }
  if (option < 0 || option > 6) {
    return false;
  }

  const currentSong: string = get("boomBoxSong");
  if (option === 1 && currentSong === "Eye of the Giger") {
    return false;
  } else if (option === 2 && currentSong === "Food Vibrations") {
    return false;
  } else if (option === 3 && currentSong === "Remainin' Alive") {
    return false;
  } else if (
    option === 4 &&
    currentSong === "These Fists Were Made for Punchin'"
  ) {
    return false;
  } else if (option === 5 && currentSong === "Total Eclipse of Your Meat") {
    return false;
  } else if (option === 6 && currentSong === "") {
    return false;
  }

  let boomsLeft: number = 0;
  let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=9919");
  // Find the number of songs left by matching the number in the "X more times" sentence. Overly flexible to prevent April Fools word salad breakage.
  // \\b(\\d+)\\b matches a whole number (\\d+) that's surrounded by word boundaries (\\b), e.g. a space
  // [^.]* matches any characters except a period (.), any number of times (*), capturing everything up to the end of the sentence
  // \\. matches the literal ending period to only check the top boombox sentence
  const boomMatcher: AshMatcher = new AshMatcher("\\b(\\d+)\\b[^.]*\\.", page);
  if (boomMatcher.find()) {
    boomsLeft = toInt(boomMatcher.group(1));
  } else {
    auto_log_warning("Could not find how many songs we have left...", "red");
    option = 6;
  }

  page = visitUrl(`choice.php?whichchoice=1312&option=${option}`);
  if (containsText(page, "don't want to break this thing")) {
    auto_log_warning("Unable to change BoomBoxen songen!", "red");
    return false;
  }
  if (option !== 6) {
    boomsLeft--;
  }
  auto_log_info(
    `Change successful to ${get("boomBoxSong")}. We have ${boomsLeft} SongBoom BoomBoxen songens left!`,
    "green",
  );
  return true;
}

export function setSongboom(): void {
  if (!auto_is_valid($item`SongBoom™ BoomBox`)) {
    return;
  }
  if (itemAmount($item`SongBoom™ BoomBox`) === 0) {
    return;
  }
  if (get("auto_beatenUpCount", 0) > 5) {
    songboomSetting("dr");
  } else if (
    internalQuestStatus("questL12War") > 0 &&
    internalQuestStatus("questL12War") < 2
  ) {
    // Once we've started the war, we want to be able to micromanage songs
    // for Gremlins and Nuns. Don't break this for them.
  } else if (
    !isActuallyEd() &&
    internalQuestStatus("questL07Cyrptic") < 1 &&
    !(PillKeeper.havePillKeeper() && spleen_left() >= 3) &&
    spleen_left() >
      4 *
        min(auto_spleenFamiliarAdvItemsPossessed(), floor(spleen_left() / 4)) &&
    get("_boomBoxFights") === 10 &&
    get("_boomBoxSongsLeft") > 3
  ) {
    songboomSetting("nightmare");
  } else {
    if (myFullness() === 0 || itemAmount($item`Special Seasoning`) < 4) {
      songboomSetting("food");
    } else {
      if (in_glover() && myMeat() > 10000) {
        songboomSetting("dr");
      } else {
        songboomSetting("meat");
      }
    }
  }
}
