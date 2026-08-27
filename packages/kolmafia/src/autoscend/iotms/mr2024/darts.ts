import {
  containsText,
  Skill,
  splitString,
  substring,
  toInt,
  toLowerCase,
  toSkill,
} from "kolmafia";
import { $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid, auto_log_info, auto_runChoice } from "../../auto_util";

export function haveDarts(): boolean {
  if (
    auto_is_valid($item`Everfull Dart Holster`) &&
    possessEquipment($item`Everfull Dart Holster`)
  ) {
    return true;
  }
  return false;
}

export function dartChoiceHandler(
  choice: number,
  options: Map<number, string>,
): void {
  auto_log_info(`dartChoiceHandler Running choice ${choice}`, "blue");

  let dcchoice: number = 0;
  for (const [idx, str] of options) {
    auto_log_info(`choice ${idx} is ${str}`, "blue");
  }
  for (const perk of ["impress", "better", "targeting", "butt"]) {
    //Ranked as 1. Shorter ELR CD, 2. bullseye chance, 3. Butt Awareness, 4. Everything else
    for (const [idx, str] of options) {
      if (containsText(toLowerCase(str), perk)) {
        dcchoice = idx;
        break;
      }
    }
    if (dcchoice !== 0) {
      break;
    }
  }
  if (dcchoice === 0) {
    //if choice is not set, just choose the 1st option
    dcchoice = 1;
  }
  auto_runChoice(dcchoice);
}

export function dartELRcd(): number {
  let cd: number = 50; // base cd is 50 turns
  const perks: Map<number, string> = new Map(
    splitString(toLowerCase(get("everfullDartPerks")), ",").map((_v, _i) => [
      _i,
      _v,
    ]),
  );
  for (const perk of perks.keys()) {
    if (containsText(perks.get(perk) ?? "", "impress")) {
      cd -= 10;
    }
  }
  return cd;
}

export function dartSkill(): Skill {
  const curDartboard: Map<number, string> = new Map(
    splitString(toLowerCase(get("_currentDartboard")), ",").map((_v, _i) => [
      _i,
      _v,
    ]),
  );
  for (const sk of curDartboard.keys()) {
    if (containsText(curDartboard.get(sk) ?? "", "butt")) {
      // get more items
      auto_log_info("Going for the butt", "blue");
      return toSkill(toInt(substring(curDartboard.get(sk) ?? "", 0, 4)));
    } else if (
      containsText(curDartboard.get(sk) ?? "", "torso") ||
      containsText(sk.toString(), "pseudopod")
    ) {
      //get more meat
      auto_log_info("Going for the chest", "blue");
      return toSkill(toInt(substring(curDartboard.get(sk) ?? "", 0, 4)));
    }
  }
  return toSkill(7513); // If there aren't any darts available return the Darts: Throw at %PART1
}

export function dartEleDmg(): boolean {
  const perks: string = toLowerCase(get("everfullDartPerks"));
  if (containsText(perks, "add ")) {
    // Only ele dmg perks have "add " in their perk description so as long as we have 1, we are good
    return true;
  }
  return false;
}
