import {
  itemAmount,
  lastChoice,
  myHash,
  myPrimestat,
  random,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, $stat, get } from "libram";

import { equipStatgainIncreasers$1 } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function cheeseWarMachine(
  stats: number,
  it: number,
  eff: number,
  potion: number,
): boolean {
  if (!auto_is_valid($item`Bastille Battalion control rig`)) {
    return false;
  }
  if (itemAmount($item`Bastille Battalion control rig`) === 0) {
    return false;
  }
  if (get("_bastilleGames") !== 0) {
    return false;
  }

  if (stats === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        stats = 2;
        break;
      case $stat`Mysticality`:
        stats = 1;
        break;
      case $stat`Moxie`:
        stats = 3;
        break;
    }
  }
  if (it === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        it = 1;
        break;
      case $stat`Mysticality`:
        it = 2;
        break;
      case $stat`Moxie`:
        it = 3;
        break;
    }
  }

  if (eff === 0) {
    switch (myPrimestat()) {
      case $stat`Muscle`:
        eff = 1;
        break;
      case $stat`Mysticality`:
        eff = 2;
        break;
      case $stat`Moxie`:
        eff = 3;
        break;
    }
  }

  if (potion === 0) {
    potion = 1 + random(3);
  }

  if (stats < 1 || stats > 3) {
    return false;
  }
  if (it < 1 || it > 3) {
    return false;
  }
  if (eff < 1 || eff > 3) {
    return false;
  }
  if (potion < 1 || potion > 3) {
    return false;
  }
  equipStatgainIncreasers$1(myPrimestat(), true);
  const page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=9928`,
    false,
  );

  const first: AshMatcher = new AshMatcher("/bbatt/barb(\\d).png", page);
  if (first.find()) {
    let setting: number = toInt(first.group(1));
    while (setting !== stats) {
      visitUrl(`choice.php?whichchoice=1313&option=1&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const second: AshMatcher = new AshMatcher("/bbatt/bridge(\\d).png", page);
  if (second.find()) {
    let setting: number = toInt(second.group(1));
    while (setting !== it) {
      visitUrl(`choice.php?whichchoice=1313&option=2&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const third: AshMatcher = new AshMatcher("/bbatt/holes(\\d).png", page);
  if (third.find()) {
    let setting: number = toInt(third.group(1));
    while (setting !== eff) {
      visitUrl(`choice.php?whichchoice=1313&option=3&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  const fourth: AshMatcher = new AshMatcher("/bbatt/moat(\\d).png", page);
  if (fourth.find()) {
    let setting: number = toInt(fourth.group(1));
    while (setting !== potion) {
      visitUrl(`choice.php?whichchoice=1313&option=4&pwd=${myHash()}`, false);
      setting++;
      if (setting > 3) {
        setting = 1;
      }
    }
  }

  visitUrl(`choice.php?whichchoice=1313&option=5&pwd=${myHash()}`, false);

  for (let i: number = 0; i < 5; i++) {
    visitUrl(`choice.php?whichchoice=1314&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1319&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1314&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1319&option=3&pwd=${myHash()}`);
    visitUrl(`choice.php?whichchoice=1315&option=3&pwd=${myHash()}`);
    if (lastChoice() === 1316) {
      break;
    }
  }

  visitUrl(`choice.php?whichchoice=1316&option=3&pwd=${myHash()}`);
  return true;
}
