import {
  containsText,
  getCounters,
  isUnrestricted,
  Item,
  Skill,
  splitString,
  toLowerCase,
  visitUrl,
} from "kolmafia";
import { $item, $skill, get, set } from "libram";

import { auto_get_campground, auto_log_info, wrap_item } from "../../auto_util";
import { in_nuclear } from "../../paths/2016/nuclear_autumn";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { in_lol } from "../../paths/2023/legacy_of_loathing";

let $_auto_haveSourceTerminal_didCheck: boolean | undefined;

export function haveSourceTerminal(): boolean {
  const terminal: Item = wrap_item($item`Source terminal`);
  if (!isUnrestricted(terminal) && !in_lol()) {
    return false;
  }
  $_auto_haveSourceTerminal_didCheck ??= false;
  if (in_nuclear() && !$_auto_haveSourceTerminal_didCheck) {
    $_auto_haveSourceTerminal_didCheck = true;
    const temp: string = visitUrl(
      "place.php?whichplace=falloutshelter&action=vault_term",
    );
    if (containsText(temp, "Source Terminal")) {
      set("auto_haveSourceTerminal", true);
    }
  }

  return auto_get_campground().has($item`Source terminal`);
}

export function isOverdueDigitize(): boolean {
  if (get("_sourceTerminalDigitizeUses") === 0) {
    return false;
  }
  if (getCounters("Digitize Monster", 1, 200) === "Digitize Monster") {
    return false;
  }
  if (containsText(get("_tempRelayCounters"), "Digitize Monster")) {
    return false;
  }
  if (getCounters("Digitize Monster", 0, 0) === "Digitize Monster") {
    return true;
  }
  return false;
}

export function sourceTerminalRequest(request: string): boolean {
  //enhance <effect>.enh		[meat|items|init|critical]
  //enquiry <effect>.enq		[familiar|monsters]
  //educate <skill>.edu		[digitize|extract]
  //extrude <item>.ext		[food|booze|goggles]

  auto_log_info(`Source Terminal request: ${request}`, "green");
  //"campground.php?action=terminal&hack=enhance items.enh"
  if (haveSourceTerminal()) {
    if (in_nuclear()) {
      visitUrl("place.php?whichplace=falloutshelter&action=vault_term");
    } else {
      visitUrl("campground.php?action=terminal");
    }
    //		temp = visit_url("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    visitUrl(`choice.php?pwd=&whichchoice=1191&option=1&input=${request}`);
    //		temp = visit_url("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    return true;
  }
  return false;
}

export function sourceTerminalExtrude(request: string): boolean {
  if (!haveSourceTerminal()) {
    return false;
  }
  if (auto_sourceTerminalExtrudeLeft() === 0) {
    return false;
  }
  let actual: string;
  request = toLowerCase(request);
  switch (request) {
    case "food":
    case "food.ext":
    case "browser cookie":
      actual = "food";
      break;
    case "booze":
    case "booze.ext":
    case "hacked gibson":
      actual = "booze";
      break;
    case "goggles":
    case "goggles.ext":
    case "source shades":
      actual = "goggles";
      break;
    default:
      return false;
  }

  return sourceTerminalRequest(`extrude -f ${actual}.ext`);
}

function auto_sourceTerminalExtrudeLeft(): number {
  if (haveSourceTerminal()) {
    return 3 - get("_sourceTerminalExtrudes");
  }
  return 0;
}

export function sourceTerminalEnhance(request: string): boolean {
  if (!haveSourceTerminal()) {
    return false;
  }
  if (sourceTerminalEnhanceLeft() === 0) {
    return false;
  }
  let actual: string;
  switch (request) {
    case "meat":
    case "meat.enh":
      actual = "meat";
      break;
    case "item":
    case "items":
    case "item.enh":
    case "items.enh":
      actual = "items";
      break;
    case "substats":
    case "substats.enh":
    case "stats":
      actual = "substats";
      break;
    case "damage":
    case "damage.enh":
      actual = "damage";
      break;
    case "init":
    case "initiative":
      actual = "init";
      break;
    case "critical":
      actual = "critical";
      break;
    default:
      return false;
  }

  if (containsText(get("sourceTerminalEnhanceKnown"), `${actual}.enh`)) {
    return sourceTerminalRequest(`enhance ${actual}.enh`);
  }
  return false;
}

export function sourceTerminalEnhanceLeft(): number {
  if (haveSourceTerminal()) {
    const used: number = get("_sourceTerminalEnhanceUses");

    let total: number = 1;
    if (get("sourceTerminalChips") !== "") {
      const chips: Map<number, string> = new Map(
        splitString(get("sourceTerminalChips"), ",").map((_v, _i) => [_i, _v]),
      );
      for (const index of chips.keys()) {
        const chip: string = String(chips.get(index) ?? "").trim();
        if (chip === "CRAM" || chip === "SCRAM") {
          total += 1;
        }
      }
    }
    return total - used;
  }
  return 0;
}

export function sourceTerminalEducate(first: Skill, second: Skill): boolean {
  if (!haveSourceTerminal()) {
    return false;
  }
  if (in_pokefam()) {
    return false;
  }
  if (first === $skill.none) {
    first = second;
    second = $skill.none;
  }
  if (!containsText(get("sourceTerminalChips"), "DRAM")) {
    second = $skill.none;
    set("sourceTerminalEducate2", "");
  }

  if (first === $skill.none) {
    return false;
  }

  const firstSkill: string = `${toLowerCase(first.toString())}.edu`;
  const secondSkill: string = `${toLowerCase(second.toString())}.edu`;

  if (
    get("sourceTerminalEducate1") === firstSkill ||
    get("sourceTerminalEducate2") === firstSkill
  ) {
    if (
      get("sourceTerminalEducate1") === secondSkill ||
      get("sourceTerminalEducate2") === secondSkill ||
      secondSkill === "none.edu"
    ) {
      return true;
    }
  }

  sourceTerminalRequest(`educate ${firstSkill}`);
  if (secondSkill !== "none.edu") {
    sourceTerminalRequest(`educate ${secondSkill}`);
  }
  return true;
}
