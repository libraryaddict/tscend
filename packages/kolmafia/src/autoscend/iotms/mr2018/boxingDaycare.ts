import {
  Effect,
  isUnrestricted,
  myPrimestat,
  random,
  Stat,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $stat, get, set } from "libram";

import { auto_abort } from "../../auto_util";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";

export function fightClubNap(): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareNap")) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  visitUrl("choice.php?pwd=&whichchoice=1334&option=1");

  if (!get("_daycareNap")) {
    auto_abort("fightClubtracking failed");
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}

export function fightClubSpa(): boolean {
  let option: number = 4;
  let st: Stat = myPrimestat();
  if (in_plumber()) {
    // We deal 250% of our Moxie, so if our Muscle is too high we... die.
    st = $stat`Moxie`;
  }
  switch (st) {
    case $stat`Muscle`:
      option = 1;
      break;
    case $stat`Mysticality`:
      option = 3;
      break;
    case $stat`Moxie`:
      option = 2;
      break;
  }
  return fightClubSpa$2(option);
}

export function fightClubSpa$1(eff: Effect): boolean {
  let option: number = 0;

  switch (eff) {
    case $effect`Muddled`:
      option = 1;
      break;
    case $effect`Ten out of Ten`:
      option = 2;
      break;
    case $effect`Uncucumbered`:
      option = 3;
      break;
    case $effect`Flagrantly Fragrant`:
      option = 4;
      break;
  }

  if (option === 0) {
    return false;
  }
  return fightClubSpa$2(option);
}

function fightClubSpa$2(option: number): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareSpa")) {
    return false;
  }
  if (option === 0) {
    option = 1 + random(4);
  }
  if (option < 1 || option > 4) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  visitUrl("choice.php?pwd=&whichchoice=1334&option=2");
  visitUrl(`choice.php?pwd=&whichchoice=1335&option=${option}`);

  if (!get("_daycareSpa")) {
    auto_abort("fightClubtracking failed");
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}

export function fightClubStats(): boolean {
  if (!isUnrestricted($item`Boxing Day care package`)) {
    return false;
  }
  if (!get("daycareOpen")) {
    return false;
  }
  if (get("_daycareGymScavenges") > 0) {
    return false;
  }

  visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_boxingdaycare",
    false,
  );
  // Enter the Boxing Daycare
  visitUrl("choice.php?pwd=&whichchoice=1334&option=3");
  // Scavenge for gym equipment
  visitUrl("choice.php?pwd=&whichchoice=1336&option=2");

  if (get("_daycareGymScavenges") !== 1) {
    // Seems like we can't trust KoLmafia to set this for us
    // auto_abort("fightClubtracking failed");
    set("_daycareGymScavenges", 1);
  }
  //Do I need to leave as well, I think I do...
  visitUrl("choice.php?pwd=&whichchoice=1334&option=4");

  return true;
}
