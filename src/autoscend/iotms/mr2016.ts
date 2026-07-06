import {
  abort,
  canEquip,
  cliExecute,
  containsText,
  Effect,
  getCounters,
  getProperty,
  gitExists,
  haveEffect,
  haveSkill,
  inebrietyLimit,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  Monster,
  mpCost,
  myAdventures,
  myClass,
  myDaycount,
  myHash,
  myId,
  myInebriety,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myTurncount,
  replaceString,
  runChoice,
  setProperty,
  Skill,
  splitString,
  stringModifier,
  toBoolean,
  toInt,
  toLocation,
  toLowerCase,
  toMonster,
  totalTurnsPlayed,
  toUpperCase,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $locations,
  $path,
  $skill,
  $slot,
} from "libram";

import { auto_mall_price } from "../auto_acquire";
import { autoAdv$2, autoAdvBypass, CombatMacro } from "../auto_adventure";
import { fullness_left, spleen_left } from "../auto_consume";
import {
  autoForceEquip$1,
  autoForceEquip$3,
  possessEquipment,
} from "../auto_equipment";
import { List$1, List$8, ListFind } from "../auto_list";
import { acquireHP, mp_regen } from "../auto_restore";
import {
  auto_can_equip,
  auto_get_campground,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  handleTracker$1,
  meatReserve,
  trim,
  wrap_item,
} from "../auto_util";
import { zone_available } from "../auto_zone";
import { is_boris } from "../paths/avatar_of_boris";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { inAftercore } from "../paths/casual";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lta } from "../paths/license_to_adventure";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_pokefam } from "../paths/pocket_familiars";
import { is_professor } from "../paths/wereprofessor";
import { startHippyBoatmanSubQuest } from "../quests/level_any";
import {
  startArmorySubQuest,
  startGalaktikSubQuest,
  startMeatsmithSubQuest,
} from "../quests/optional";
import { AshMatcher } from "../utils/kolmafiaUtils";

//	This is meant for items that have a date of 2016.
//	Handling: Witchess Set, Snojo, Source Terminal, Protonic Accelerator Pack
//			Time-Spinner

//Defined in autoscend/iotms/mr2016.ash
function auto_haveJokestersGun(): boolean {
  if (
    possessEquipment($item`The Jokester's gun`) &&
    auto_can_equip($item`The Jokester's gun`)
  ) {
    return true;
  }
  return false;
}

export function auto_jokesterGunFreeKillAvailable(): boolean {
  if (
    !auto_haveJokestersGun() ||
    !auto_is_valid$2($skill`Fire the Jokester's Gun`)
  ) {
    return false;
  }

  return !toBoolean(getProperty("_firedJokestersGun"));
}

export function snojoFightAvailable(): boolean {
  if (!isUnrestricted($item`X-32-F snowman crate`)) {
    return false;
  }
  if (!toBoolean(getProperty("snojoAvailable"))) {
    return false;
  }
  if (in_koe()) {
    return false;
  }
  if (myInebriety() > inebrietyLimit()) {
    return false;
  }

  if (!inAftercore()) {
    const controls: Map<string, number> = new Map();
    controls.set("MUSCLE", 1);
    controls.set("MYSTICALITY", 2);
    controls.set("MOXIE", 3);
    controls.set("Muscle", 1);
    controls.set("Mysticality", 2);
    controls.set("Moxie", 3);
    //List the three desired goals and then a "final" state that we stay in
    const standard: Map<number, string> = new Map();
    standard.set(0, "Moxie");
    standard.set(1, "Mysticality");
    standard.set(2, "Muscle");
    standard.set(3, "Moxie");

    if (
      is_boris() &&
      (possessEquipment($item`Boris's Helm`) ||
        possessEquipment($item`Boris's Helm (askew)`))
    ) {
      standard.set(0, "Muscle");
      standard.set(1, "Mysticality");
      standard.set(2, "Moxie");
      standard.set(3, "Mysticality");
    }
    if (in_lta()) {
      standard.set(0, "Mysticality");
      standard.set(1, "Moxie");
      standard.set(2, "Muscle");
      standard.set(3, "Mysticality");
    }
    if (is_jarlsberg()) {
      standard.set(0, "Mysticality");
      standard.set(1, "Moxie");
      standard.set(2, "Muscle");
      standard.set(3, "Moxie");
    }

    if (
      toInt(
        getProperty(
          `snojo${standard.get(0) ?? standard.set(0, "").get(0)}Wins`,
        ),
      ) < 14 &&
      getProperty("snojoSetting") !==
        toUpperCase(standard.get(0) ?? standard.set(0, "").get(0))
    ) {
      let temp: string = visitUrl(
        "place.php?whichplace=snojo&action=snojo_controller",
      );
      temp = runChoice(
        controls.get(standard.get(0) ?? standard.set(0, "").get(0)) ??
          controls
            .set(standard.get(0) ?? standard.set(0, "").get(0), 0)
            .get(standard.get(0) ?? standard.set(0, "").get(0)),
      );
    }
    if (
      getProperty("snojoSetting") ===
        toUpperCase(standard.get(0) ?? standard.set(0, "").get(0)) &&
      toInt(
        getProperty(
          `snojo${standard.get(0) ?? standard.set(0, "").get(0)}Wins`,
        ),
      ) >= 14 &&
      getProperty("snojoSetting") !==
        toUpperCase(standard.get(1) ?? standard.set(1, "").get(1)) &&
      toInt(
        getProperty(
          `snojo${standard.get(1) ?? standard.set(1, "").get(1)}Wins`,
        ),
      ) < 14
    ) {
      let temp: string = visitUrl(
        "place.php?whichplace=snojo&action=snojo_controller",
      );
      temp = runChoice(
        controls.get(standard.get(1) ?? standard.set(1, "").get(1)) ??
          controls
            .set(standard.get(1) ?? standard.set(1, "").get(1), 0)
            .get(standard.get(1) ?? standard.set(1, "").get(1)),
      );
    }
    if (
      getProperty("snojoSetting") ===
        toUpperCase(standard.get(1) ?? standard.set(1, "").get(1)) &&
      toInt(
        getProperty(
          `snojo${standard.get(1) ?? standard.set(1, "").get(1)}Wins`,
        ),
      ) >= 14 &&
      getProperty("snojoSetting") !==
        toUpperCase(standard.get(2) ?? standard.set(2, "").get(2)) &&
      toInt(
        getProperty(
          `snojo${standard.get(2) ?? standard.set(2, "").get(2)}Wins`,
        ),
      ) < 14
    ) {
      let temp: string = visitUrl(
        "place.php?whichplace=snojo&action=snojo_controller",
      );
      temp = runChoice(
        controls.get(standard.get(2) ?? standard.set(2, "").get(2)) ??
          controls
            .set(standard.get(2) ?? standard.set(2, "").get(2), 0)
            .get(standard.get(2) ?? standard.set(2, "").get(2)),
      );
    }
    if (
      getProperty("snojoSetting") ===
        toUpperCase(standard.get(2) ?? standard.set(2, "").get(2)) &&
      toInt(
        getProperty(
          `snojo${standard.get(2) ?? standard.set(2, "").get(2)}Wins`,
        ),
      ) >= 11 &&
      getProperty("snojoSetting") !==
        toUpperCase(standard.get(3) ?? standard.set(3, "").get(3))
    ) {
      let temp: string = visitUrl(
        "place.php?whichplace=snojo&action=snojo_controller",
      );
      temp = runChoice(
        controls.get(standard.get(3) ?? standard.set(3, "").get(3)) ??
          controls
            .set(standard.get(3) ?? standard.set(3, "").get(3), 0)
            .get(standard.get(3) ?? standard.set(3, "").get(3)),
      );
    }
  }

  if (getProperty("snojoSetting") === "NONE") {
    auto_log_info(
      `Snojo not set, attempting to set to ${myPrimestat()}`,
      "blue",
    );
    visitUrl("place.php?whichplace=snojo&action=snojo_controller");
  }
  return toInt(getProperty("_snojoFreeFights")) < 10;
}

let $_auto_haveSourceTerminal_didCheck: boolean | undefined;

export function auto_haveSourceTerminal(): boolean {
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
      setProperty("auto_haveSourceTerminal", true.toString());
    }
  }

  return auto_get_campground().has($item`Source terminal`);
}

export function isOverdueDigitize(): boolean {
  if (toInt(getProperty("_sourceTerminalDigitizeUses")) === 0) {
    return false;
  }
  if (getCounters("Digitize Monster", 1, 200) === "Digitize Monster") {
    return false;
  }
  if (containsText(getProperty("_tempRelayCounters"), "Digitize Monster")) {
    return false;
  }
  if (getCounters("Digitize Monster", 0, 0) === "Digitize Monster") {
    return true;
  }
  return false;
}

export function auto_sourceTerminalRequest(request: string): boolean {
  //enhance <effect>.enh		[meat|items|init|critical]
  //enquiry <effect>.enq		[familiar|monsters]
  //educate <skill>.edu		[digitize|extract]
  //extrude <item>.ext		[food|booze|goggles]

  auto_log_info(`Source Terminal request: ${request}`, "green");
  //"campground.php?action=terminal&hack=enhance items.enh"
  if (auto_haveSourceTerminal()) {
    if (in_nuclear()) {
      const temp_1: string = visitUrl(
        "place.php?whichplace=falloutshelter&action=vault_term",
      );
    } else {
      const temp_1: string = visitUrl("campground.php?action=terminal");
    }
    //		temp = visit_url("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    const temp: string = visitUrl(
      `choice.php?pwd=&whichchoice=1191&option=1&input=${request}`,
    );
    //		temp = visit_url("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    return true;
  }
  return false;
}

export function auto_sourceTerminalExtrude(request: string): boolean {
  if (!auto_haveSourceTerminal()) {
    return false;
  }
  if (auto_sourceTerminalExtrudeLeft() === 0) {
    return false;
  }
  let actual: string = "";
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

  return auto_sourceTerminalRequest(`extrude -f ${actual}.ext`);
}

function auto_sourceTerminalExtrudeLeft(): number {
  if (auto_haveSourceTerminal()) {
    return 3 - toInt(getProperty("_sourceTerminalExtrudes"));
  }
  return 0;
}

export function auto_sourceTerminalEnhance(request: string): boolean {
  if (!auto_haveSourceTerminal()) {
    return false;
  }
  if (auto_sourceTerminalEnhanceLeft() === 0) {
    return false;
  }
  let actual: string = "";
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

  if (
    containsText(getProperty("sourceTerminalEnhanceKnown"), `${actual}.enh`)
  ) {
    return auto_sourceTerminalRequest(`enhance ${actual}.enh`);
  }
  return false;
}
export function auto_sourceTerminalEnhanceLeft(): number {
  if (auto_haveSourceTerminal()) {
    const used: number = toInt(getProperty("_sourceTerminalEnhanceUses"));

    let total: number = 1;
    if (getProperty("sourceTerminalChips") !== "") {
      const chips: Map<number, string> = new Map(
        splitString(getProperty("sourceTerminalChips"), ",").map((_v, _i) => [
          _i,
          _v,
        ]),
      );
      for (const index of chips.keys()) {
        const chip: string = trim(
          chips.get(index) ?? chips.set(index, "").get(index),
        );
        if (chip === "CRAM" || chip === "SCRAM") {
          total += 1;
        }
      }
    }
    return total - used;
  }
  return 0;
}

function auto_sourceTerminalMissing(): Map<string, number> {
  const status: Map<string, number> = new Map();

  status.set("ASHRAM", 1);
  status.set("CRAM", 1);
  status.set("DIAGRAM", 1);
  status.set("DRAM", 1);
  status.set("GRAM", 10);
  status.set("INGRAM", 1);
  status.set("PRAM", 10);
  status.set("SCRAM", 1);
  status.set("SPAM", 10);
  status.set("TRAM", 1);
  status.set("TRIGRAM", 1);
  status.set("booze.ext", 1);
  status.set("compress.edu", 1);
  status.set("cram.ext", 1);
  status.set("critical.enh", 1);
  status.set("damage.enh", 1);
  status.set("digitize", 3);
  status.set("digitize.edu", 1);
  status.set("dram.ext", 1);
  status.set("duplicate.edu", 1);
  status.set("educate", 2);
  status.set("enhance", 103);
  status.set("enhanceBuff", 100);
  status.set("enhanceUses", 3);
  status.set("enquiry", 250);
  status.set("extract.edu", 1);
  status.set("familiar.enq", 1);
  status.set("familiar.ext", 1);
  status.set("food.ext", 1);
  status.set("goggles.ext", 1);
  status.set("gram.ext", 1);
  status.set("init.enh", 1);
  status.set("items.enh", 1);
  status.set("meat.enh", 1);
  status.set("monsters.enq", 1);
  status.set("mpReduce", 15);
  status.set("portscan.edu", 1);
  status.set("pram.ext", 1);
  status.set("protect.enq", 1);
  status.set("spam.ext", 1);
  status.set("stats.enq", 1);
  status.set("substats.enh", 1);
  status.set("tram.ext", 1);
  status.set("turbo.edu", 1);
  const have: Map<string, number> = auto_sourceTerminalStatus();
  for (const thing of have.keys()) {
    status.set(
      thing,
      (status.get(thing) ?? 0) -
        (have.get(thing) ?? have.set(thing, 0).get(thing)),
    );
  }
  return status;
}

function auto_sourceTerminalStatus(): Map<string, number> {
  const status: Map<string, number> = new Map();
  if (auto_haveSourceTerminal()) {
    let temp: string = visitUrl("campground.php?action=terminal");
    temp = visitUrl("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    temp = visitUrl("choice.php?pwd=&whichchoice=1191&option=1&input=status");
    temp = visitUrl("choice.php?pwd=&whichchoice=1191&option=1&input=ls");

    const ramMatcher: AshMatcher = new AshMatcher(
      "<div>((?:[A-Z]*?)?[RP]AM) (chip(?:s?)) installed([:,]) ((?:\\d+)|(?:\\w))",
      temp,
    );
    while (ramMatcher.find()) {
      if (ramMatcher.group(3) === ",") {
        status.set(ramMatcher.group(1), 1);
      } else {
        status.set(ramMatcher.group(1), toInt(ramMatcher.group(4)));
      }
    }

    const extrude: AshMatcher = new AshMatcher(
      "\\b((?:\\w+?)[.](?:ext|enh|edu|enq))",
      temp,
    );
    while (extrude.find()) {
      status.set(extrude.group(1), 1);
    }
    //		temp = visit_url("choice.php?pwd=&whichchoice=1191&option=1&input=reset");
    status.set(
      "enhanceBuff",
      25 +
        25 * (status.get("INGRAM") ?? status.set("INGRAM", 0).get("INGRAM")) +
        5 * (status.get("PRAM") ?? status.set("PRAM", 0).get("PRAM")),
    );
    status.set(
      "enhanceUses",
      1 +
        (status.get("CRAM") ?? status.set("CRAM", 0).get("CRAM")) +
        (status.get("SCRAM") ?? status.set("SCRAM", 0).get("SCRAM")),
    );
    status.set(
      "enhance",
      (status.get("enhanceBuff") ??
        status.set("enhanceBuff", 0).get("enhanceBuff")) +
        (status.get("enhanceUses") ??
          status.set("enhanceUses", 0).get("enhanceUses")),
    );
    status.set(
      "enquiry",
      50 +
        ((status.get("DIAGRAM") ?? status.set("DIAGRAM", 0).get("DIAGRAM")) +
          1) *
          (status.get("GRAM") ?? status.set("GRAM", 0).get("GRAM")) *
          10,
    );
    status.set(
      "educate",
      1 + (status.get("DRAM") ?? status.set("DRAM", 0).get("DRAM")),
    );
    status.set(
      "digitize",
      1 +
        (status.get("TRIGRAM") ?? status.set("TRIGRAM", 0).get("TRIGRAM")) +
        (status.get("TRAM") ?? status.set("TRAM", 0).get("TRAM")),
    );
    status.set(
      "mpReduce",
      5 * (status.get("ASHRAM") ?? status.set("ASHRAM", 0).get("ASHRAM")) +
        (status.get("SPAM") ?? status.set("SPAM", 0).get("SPAM")),
    );
  }

  return status;
}

export function auto_sourceTerminalEducate(
  first: Skill,
  second: Skill,
): boolean {
  if (!auto_haveSourceTerminal()) {
    return false;
  }
  if (in_pokefam()) {
    return false;
  }
  if (first === Skill.none) {
    first = second;
    second = Skill.none;
  }
  if (!containsText(getProperty("sourceTerminalChips"), "DRAM")) {
    second = Skill.none;
    setProperty("sourceTerminalEducate2", "");
  }

  if (first === Skill.none) {
    return false;
  }

  const firstSkill: string = `${toLowerCase(first.toString())}.edu`;
  const secondSkill: string = `${toLowerCase(second.toString())}.edu`;

  if (
    getProperty("sourceTerminalEducate1") === firstSkill ||
    getProperty("sourceTerminalEducate2") === firstSkill
  ) {
    if (
      getProperty("sourceTerminalEducate1") === secondSkill ||
      getProperty("sourceTerminalEducate2") === secondSkill ||
      secondSkill === "none.edu"
    ) {
      return true;
    }
  }

  auto_sourceTerminalRequest(`educate ${firstSkill}`);
  if (secondSkill !== "none.edu") {
    auto_sourceTerminalRequest(`educate ${secondSkill}`);
  }
  return true;
}

function auto_sourceTerminalEducate$1(first: Skill): boolean {
  return auto_sourceTerminalEducate(first, Skill.none);
}

export function auto_haveWitchess(): boolean {
  if (!isUnrestricted($item`Witchess Set`)) {
    return false;
  }
  return auto_get_campground().has($item`Witchess Set`);
}

function auto_advWitchess(target: string, option?: CombatMacro): boolean {
  if (!auto_haveWitchess()) {
    return false;
  }

  if (myAdventures() === 0) {
    return false;
  }

  const goal: number = auto_advWitchessTargets(target);
  if (goal === 0) {
    return false;
  }

  if (toInt(getProperty("_auto_witchessBattles")) >= 5) {
    return false;
  }

  setProperty(
    "_auto_witchessBattles",
    (toInt(getProperty("_auto_witchessBattles")) + 1).toString(),
  );

  let temp: string = visitUrl("campground.php?action=witchess");
  if (!containsText(temp, "Examine the shrink ray")) {
    setProperty("_auto_witchessBattles", (5).toString());
    return false;
  }
  temp = visitUrl("choice.php?whichchoice=1181&pwd=&option=1");
  const witchessMatcher: AshMatcher = new AshMatcher(
    "You can fight (\\d) more piece(s?) today",
    temp,
  );
  if (witchessMatcher.find()) {
    const consider: number = 5 - toInt(witchessMatcher.group(1)) + 1;
    if (consider > toInt(getProperty("_auto_witchessBattles"))) {
      setProperty("_auto_witchessBattles", consider.toString());
    }
  } else {
    setProperty("_auto_witchessBattles", (5).toString());
    return false;
  }
  temp = visitUrl("choice.php?pwd=&option=2&whichchoice=1182");

  setProperty("auto_nextEncounter", toMonster(goal).toString());
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

  if (toInt(target) == 1942 && myPath() === $path`Teetotaler`) {
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
  if (!auto_haveWitchess()) {
    return false;
  }
  if (myTurncount() < 20) {
    return false;
  }

  if (in_gnoob() || in_lta()) {
    return auto_advWitchess("ml");
  }

  switch (myDaycount()) {
    case 1:
      if (itemAmount($item`Greek fire`) === 0) {
        return auto_advWitchess("ml");
      }
      return auto_advWitchess("booze");
    case 2:
      if (
        getProperty("sidequestNunsCompleted") === "none" &&
        getProperty("auto_skipNuns") === "false" &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
    case 3:
      if (
        getProperty("sidequestNunsCompleted") === "none" &&
        getProperty("auto_skipNuns") === "false" &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
    case 4:
      if (
        getProperty("sidequestNunsCompleted") === "none" &&
        getProperty("auto_skipNuns") === "false" &&
        itemAmount($item`jumping horseradish`) === 0
      ) {
        return auto_advWitchess("meat");
      }
      return auto_advWitchess("booze");
    default:
      return auto_advWitchess("booze");
  }
  return false;
}

function auto_bestBadge(): Item {
  let retval: Item = Item.none;
  for (const it of $items`plastic detective badge, bronze detective badge, silver detective badge, gold detective badge`) {
    if (possessEquipment(it)) {
      retval = it;
    }
  }

  return retval;
}

export function auto_doPrecinct(): boolean {
  if (!isUnrestricted($item`detective school application`)) {
    return false;
  }
  if (!toBoolean(getProperty("hasDetectiveSchool"))) {
    return false;
  }
  if (toInt(getProperty("_detectiveCasesCompleted")) >= 3) {
    return false;
  }
  if (gitExists("Ezandora-Detective-Solver")) {
    //Assume if someone has this installed that they want to use it.
    cliExecute("ash import<Detective Solver.ash> solveAllCases(false);");
    return true;
  }

  if (getProperty("auto_eggDetective") !== "") {
    setProperty("auto_eggDetective", "");
  }

  let page: string = visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_precinct",
  );
  let eggMatcher: AshMatcher = new AshMatcher(
    "You have been on this case for (\\d+) minute(?:s?)",
    page,
  );
  if (!eggMatcher.find()) {
    if (!containsText(page, "The Precinct")) {
      return false;
    }

    let casesLeft: number = 0;
    const precinctMatcher: AshMatcher = new AshMatcher(
      "[(](\\d) more case(?:s?) today[)]",
      page,
    );
    if (precinctMatcher.find()) {
      casesLeft = toInt(precinctMatcher.group(1));
      auto_log_info(`We have ${casesLeft} case(s) leftover!`, "green");
    }

    if (casesLeft === 0) {
      page = visitUrl("wham.php", false);
      if (!containsText(page, "You have been on this case for")) {
        return false;
      }
      auto_log_info("Trying to resume case....", "red");
    }

    page = visitUrl("choice.php?pwd=&whichchoice=1193&option=1");
    eggMatcher = new AshMatcher(
      "You have been on this case for (\\d+) minute(?:s?)",
      page,
    );

    if (!containsText(page, "murdered with an egg")) {
      if (!eggMatcher.find()) {
        auto_log_info(
          `Someone was not murdered with an egg.... that's sad.${page}`,
          "red",
        );
        return false;
      }
    }
    auto_log_info("Murdered with an egg! I love Egg!!", "green");
    page = visitUrl("wham.php", false);
  }

  eggMatcher = new AshMatcher(
    "You have been on this case for (\\d+) minute(?:s?)",
    page,
  );
  if (!eggMatcher.find()) {
    auto_log_info("I can not resolve my case situation....", "red");
    return false;
  }

  while (!containsText(getProperty("auto_eggDetective"), "solved")) {
    let eggData: Map<number, string> = new Map(
      splitString(getProperty("auto_eggDetective"), ",").map((_v, _i) => [
        _i,
        _v,
      ]),
    );
    let i: number = 1;
    while (i <= 9) {
      let visited: boolean = false;
      for (const index of eggData.keys()) {
        const subEgg: Map<number, string> = new Map(
          splitString(
            eggData.get(index) ?? eggData.set(index, "").get(index),
            ":",
          ).map((_v, _i) => [_i, _v]),
        );
        if (toInt(subEgg.get(0) ?? subEgg.set(0, "").get(0)) === i) {
          visited = true;
          break;
        }
      }

      if (!visited) {
        auto_log_info(`Going to visit room: ${i}`, "green");
        page = visitUrl(`wham.php?visit=${i}`, false);
        const personMatcher: AshMatcher = new AshMatcher(
          '<td align=center width=200>(?:\\s+)<img src=["](?:[a-z0-9/_.:]+?)[.]gif["]>(?:\\s+)<br>(?:\\s+)<b>([a-zA-Z ]+?)</b>(?:\\s+?)<br>(?:\\s+?)([a-zA-Z -]+)(?:\\s+?)<p>(?:\\s+?)[(]([a-zA-Z \']+?)[)]',
          page,
        );
        if (personMatcher.find()) {
          const person: string = personMatcher.group(1);
          const job: string = personMatcher.group(2);
          const room: string = personMatcher.group(3);
          auto_log_info(`Found ${personMatcher.group(1)}`, "green");
          auto_log_info(`Found ${personMatcher.group(2)}`, "green");
          auto_log_info(`Found ${personMatcher.group(3)}`, "green");
          let generated: string = `${i}:${room}:${person}:${job}`;
          //Get killer response as well.
          page = visitUrl(`wham.php?ask=killer&visit=${i}`, false);
          const killerMatcher: AshMatcher = new AshMatcher(
            "you (?:ask|say)(?:.*?)<p>(.*?)(\\s*?)<!-- </div> -->",
            page,
          );
          if (killerMatcher.find()) {
            let killerInfo: string = killerMatcher.group(1);
            killerInfo = replaceString(killerInfo, ",", "");
            killerInfo = replaceString(killerInfo, ":", "");
            killerInfo = replaceString(killerInfo, "<p>", "");
            killerInfo = replaceString(killerInfo, "<i>", "");
            killerInfo = replaceString(killerInfo, "</i>", "");

            const nameSplit: Map<number, string> = new Map(
              splitString(person, " ").map((_v, _i) => [_i, _v]),
            );
            for (const index of nameSplit.keys()) {
              killerInfo = replaceString(
                killerInfo,
                nameSplit.get(index) ?? nameSplit.set(index, "").get(index),
                "",
              );
            }
            generated += `:${killerInfo}`;
          } else {
            auto_log_info(`Jerkwad '${person}' won't say anything!`, "blue");
            generated += ":liar";
          }
          setProperty(
            "auto_eggDetective",
            `${generated},${getProperty("auto_eggDetective")}`,
          );
        }
      }
      i += 1;
    }

    eggData = new Map(
      splitString(getProperty("auto_eggDetective"), ",").map((_v, _i) => [
        _i,
        _v,
      ]),
    );
    auto_log_info("Generating goals...", "blue");
    //At this point we\'ve visited every place and queried everyone. Now we need to determine who is identifying a killer.
    //Extract names and jobs
    const personGoals: Map<string, boolean> = new Map();
    const jobGoals: Map<string, boolean> = new Map();
    const locationGoals: Map<string, boolean> = new Map();
    for (const index of eggData.keys()) {
      if ((eggData.get(index) ?? eggData.set(index, "").get(index)) === "") {
        continue;
      }
      const subEgg: Map<number, string> = new Map(
        splitString(
          eggData.get(index) ?? eggData.set(index, "").get(index),
          ":",
        ).map((_v, _i) => [_i, _v]),
      );
      personGoals.set(subEgg.get(2) ?? subEgg.set(2, "").get(2), true);
      jobGoals.set(subEgg.get(3) ?? subEgg.set(3, "").get(3), true);
      locationGoals.set(subEgg.get(1) ?? subEgg.set(1, "").get(1), true);
    }

    auto_log_info("Verifications....", "blue");
    for (const index of eggData.keys()) {
      const subEgg: Map<number, string> = new Map(
        splitString(
          eggData.get(index) ?? eggData.set(index, "").get(index),
          ":",
        ).map((_v, _i) => [_i, _v]),
      );
      if (subEgg.size < 4) {
        continue;
      }
      let isTruth: boolean = true;
      if ((subEgg.get(4) ?? subEgg.set(4, "").get(4)) === "liar") {
        isTruth = false;
      }
      if ((subEgg.get(4) ?? subEgg.set(4, "").get(4)) !== "liar") {
        let hasAnyone: boolean = false;
        const oldValue: string = subEgg.get(4) ?? subEgg.set(4, "").get(4);
        for (const goal of personGoals.keys()) {
          const goalMatcher: AshMatcher = new AshMatcher(
            `\\b${goal}\\b`,
            subEgg.get(4) ?? subEgg.set(4, "").get(4),
          );
          if (goalMatcher.find()) {
            hasAnyone = true;
            subEgg.set(4, goal);
          }
        }
        for (const goal of jobGoals.keys()) {
          const goalMatcher: AshMatcher = new AshMatcher(
            `\\b${goal}\\b`,
            subEgg.get(4) ?? subEgg.set(4, "").get(4),
          );
          if (goalMatcher.find()) {
            hasAnyone = true;
            subEgg.set(4, goal);
          }
        }
        let replaceString_1: string = "liar";
        if (hasAnyone) {
          replaceString_1 = subEgg.get(4) ?? subEgg.set(4, "").get(4);
        }

        let temp: string = getProperty("auto_eggDetective");
        temp = replaceString(temp, oldValue, replaceString_1);
        setProperty("auto_eggDetective", temp);
        eggData = new Map(
          splitString(getProperty("auto_eggDetective"), ",").map((_v, _i) => [
            _i,
            _v,
          ]),
        );
        subEgg.set(4, replaceString_1);
      }
      if ((subEgg.get(4) ?? subEgg.set(4, "").get(4)) !== "liar") {
        auto_log_info(
          `${subEgg.get(2) ?? subEgg.set(2, "").get(2)} is accusing: ${subEgg.get(4) ?? subEgg.set(4, "").get(4)}`,
          "blue",
        );
        //Now we need to determine if they are lying or not.
        const currentLocation: number = toInt(
          subEgg.get(0) ?? subEgg.set(0, "").get(0),
        );
        page = visitUrl(`wham.php?visit=${currentLocation}`, false);

        let otherPerson: number = 1;
        let corrupted: boolean = false;
        const locationName: string = subEgg.get(1) ?? subEgg.set(1, "").get(1);
        while (otherPerson <= 9 && isTruth) {
          if (currentLocation === otherPerson) {
            otherPerson += 1;
            continue;
          }

          let currentEgg: Map<number, string> = new Map();
          for (const index_1 of eggData.keys()) {
            const subEgg_1: Map<number, string> = new Map(
              splitString(
                eggData.get(index_1) ?? eggData.set(index_1, "").get(index_1),
                ":",
              ).map((_v, _i) => [_i, _v]),
            );
            if (
              toInt(subEgg_1.get(0) ?? subEgg_1.set(0, "").get(0)) ===
              otherPerson
            ) {
              currentEgg = subEgg_1;
            }
          }

          page = visitUrl(
            `wham.php?ask=${otherPerson}&visit=${currentLocation}`,
            false,
          );
          const killerMatcher: AshMatcher = new AshMatcher(
            "you (?:ask|say)(?:.*?)<p>(.*?)(\\s*?)<!-- </div> -->",
            page,
          );
          if (killerMatcher.find()) {
            const killerInfo: string = killerMatcher.group(1);
            //We are asking to attach a job to the person. They might not know.
            //We need to look up the particular person.
            let exact: boolean = false;
            let count_1: number = 0;
            for (const goal of jobGoals.keys()) {
              const goalMatcher: AshMatcher = new AshMatcher(
                `\\b${goal}\\b`,
                killerInfo,
              );
              if (goalMatcher.find()) {
                if (
                  goal !== (currentEgg.get(3) ?? currentEgg.set(3, "").get(3))
                ) {
                  auto_log_info(
                    `Asked about ${currentEgg.get(2) ?? currentEgg.set(2, "").get(2)},${currentEgg.get(3) ?? currentEgg.set(3, "").get(3)} and was told: ${goal}`,
                    "red",
                  );
                  count_1 += 1;
                } else {
                  exact = true;
                }
              }
            }
            if (!exact && count_1 !== 0) {
              isTruth = false;
            }

            exact = false;
            count_1 = 0;
            for (const goal of locationGoals.keys()) {
              const goalMatcher: AshMatcher = new AshMatcher(
                `\\b${goal}\\b`,
                killerInfo,
              );
              if (goalMatcher.find()) {
                if (
                  goal !== (currentEgg.get(1) ?? currentEgg.set(1, "").get(1))
                ) {
                  auto_log_info(
                    `Asked about ${currentEgg.get(2) ?? currentEgg.set(2, "").get(2)},${currentEgg.get(1) ?? currentEgg.set(1, "").get(1)} and was told: ${goal}`,
                    "red",
                  );
                  count_1 += 1;
                } else {
                  exact = true;
                }
              }
            }
            if (!exact && count_1 !== 0) {
              if (killerInfo === locationName) {
                if (corrupted) {
                  auto_log_info(
                    "Doubly corrupted possible truth teller. This person is probably correct.",
                    "blue",
                  );
                  return false;
                }
                auto_log_info(
                  "Corrupted truth teller? Going to retry....",
                  "red",
                );
                corrupted = true;
                continue;
              }
              isTruth = false;
            }
          }
          //if still isTruth, we can try the relative questions if so desired.
          //Really, we should check the list of accused and try to uniquify it.

          otherPerson += 1;
          corrupted = false;
        }
      }
      if ((subEgg.get(4) ?? subEgg.set(4, "").get(4)) === "liar") {
        isTruth = false;
      }
      if (isTruth) {
        auto_log_info(
          `${subEgg.get(2) ?? subEgg.set(2, "").get(2)} is accusing: ${subEgg.get(4) ?? subEgg.set(4, "").get(4)} and may be telling the truth!`,
          "blue",
        );
        //Find person they are accusing and do it.

        const currentEgg: Map<number, string> = new Map();
        for (const index_1 of eggData.keys()) {
          const subsubEgg: Map<number, string> = new Map(
            splitString(
              eggData.get(index_1) ?? eggData.set(index_1, "").get(index_1),
              ":",
            ).map((_v, _i) => [_i, _v]),
          );
          if (
            (subsubEgg.get(2) ?? subsubEgg.set(2, "").get(2)) ===
              (subEgg.get(4) ?? subEgg.set(4, "").get(4)) ||
            (subsubEgg.get(3) ?? subsubEgg.set(3, "").get(3)) ===
              (subEgg.get(4) ?? subEgg.set(4, "").get(4))
          ) {
            auto_log_info(
              `Accusation against: ${subsubEgg.get(2) ?? subsubEgg.set(2, "").get(2)}`,
              "blue",
            );
            page = visitUrl(
              `wham.php?visit=${subsubEgg.get(0) ?? subsubEgg.set(0, "").get(0)}`,
              false,
            );

            eggMatcher = new AshMatcher(
              "You have been on this case for (\\d+) minute(?:s?)",
              page,
            );
            if (eggMatcher.find()) {
              auto_log_info(
                `On the case for ${eggMatcher.group(1)} minutes...`,
                "green",
              );
            }

            page = visitUrl(
              `wham.php?visit=${subsubEgg.get(0) ?? subsubEgg.set(0, "").get(0)}&accuse=${subsubEgg.get(0) ?? subsubEgg.set(0, "").get(0)}`,
              false,
            );
            const pensionMatcher: AshMatcher = new AshMatcher(
              "been awarded (\\d+) cop dollars",
              page,
            );
            if (pensionMatcher.find()) {
              auto_log_info(
                `Received a pension of ${pensionMatcher.group(1)} cop dollars.`,
                "green",
              );
            }
            setProperty("auto_eggDetective", "");
            return true;
          }
        }
      }
    }

    setProperty(
      "auto_eggDetective",
      `${getProperty("auto_eggDetective")}solved`,
    );
    return false;
  }

  return true;
}

export function expectGhostReport(): boolean {
  if (totalTurnsPlayed() >= toInt(getProperty("nextParanormalActivity"))) {
    if (totalTurnsPlayed() > toInt(getProperty("nextParanormalActivity"))) {
      const page: string = visitUrl("charpane.php");
      const myGhost: AshMatcher = new AshMatcher(
        '<tr rel="protonquest">(?:.*?)<b>(.*?)</b>',
        page,
      );
      if (myGhost.find()) {
        const goal: Location = toLocation(myGhost.group(1));
        setProperty("ghostLocation", goal.toString());
        setProperty("questPAGhost", "started");
      }
    }
    //<tr rel="protonquest"><td class="small" colspan="2"><div>Investigate the paranormal activity reported at <A class=nounder target=mainpane href=place.php?whichplace=manor1><b>The Haunted Conservatory</b></a>.</div></td></tr>

    if (getProperty("questPAGhost") === "unstarted") {
      return true;
    }
  }
  return false;
}

export function haveGhostReport(): boolean {
  if (getProperty("questPAGhost") === "unstarted") {
    return false;
  }
  if (
    getProperty("questPAGhost") === "started" &&
    getProperty("ghostLocation") !== ""
  ) {
    return true;
  }
  return false;
}

export function LX_ghostBusting(): boolean {
  //a function for busting or killing ghosts associated with [Protonic Accelerator Pack].
  //do not check if we have the IOTM because [Almost-dead_walkie-talkie] gives access to these ghosts without the proton pack.
  if (getProperty("questPAGhost") === "unstarted") {
    if (!expectGhostReport()) {
      return false;
    }
    if (getProperty("questPAGhost") === "unstarted") {
      return false;
    }
  }
  // goal & progress specific reasons to skip busting this turn go below.
  const goal: Location = toLocation(getProperty("ghostLocation"));
  if (goal === Location.none) {
    return false;
  }
  if (
    goal === $location`Inside the Palindome` &&
    !possessEquipment($item`Talisman o' Namsilat`)
  ) {
    return false;
  }
  if (is_professor()) {
    return false;
  }
  //zone unlocks which require no adv spent. ghost will not show up here unless zone is available. no need to skip ghost if zone unavailable.
  startHippyBoatmanSubQuest(); //unlocks $location[The Old Landfill].
  //zone unlocks which require no adv spent. where a ghost can show up even if you did not unlock the zone. if failed to unlock we skip this ghost
  startMeatsmithSubQuest(); //unlocks $location[The Skeleton Store]
  startArmorySubQuest(); //unlocks $location[Madness Bakery]
  startGalaktikSubQuest(); //unlocks $location[The Overgrown Lot]
  if (
    $locations`The Skeleton Store, Madness Bakery, The Overgrown Lot`.includes(
      goal,
    ) &&
    !zone_available(goal)
  ) {
    auto_log_error(
      `Failed to unlock the location [${goal}]. skipping this ghost...`,
    );
    setProperty("questPAGhost", "unstarted");
    setProperty("ghostLocation", "");
    return false;
  }

  if (
    possessEquipment($item`protonic accelerator pack`) &&
    auto_can_equip($item`protonic accelerator pack`)
  ) {
    auto_log_info(`Ghost busting time! At: ${goal}`, "blue");
    autoForceEquip$3($item`protonic accelerator pack`);
  } else {
    //hypothetical future path where pack cannot be equipped. or we used [Almost-dead_walkie-talkie] to get a ghost without the pack
    auto_log_info(
      `We can not bust ghosts. but we can still kill them and get ~100 MP worth of restore items. killing ghost at: ${goal}`,
      "blue",
    );
  }
  if (goal === $location`Inside the Palindome`) {
    autoForceEquip$1($slot`acc3`, $item`Talisman o' Namsilat`);
  }
  acquireHP();
  return autoAdv$2(goal);
}

function timeSpinnerRemaining(): number {
  return timeSpinnerRemaining$1(false);
}

function timeSpinnerRemaining$1(verify: boolean): number {
  //how many time spinner minutes remain to be used.
  if (
    !auto_is_valid($item`Time-Spinner`) ||
    itemAmount($item`Time-Spinner`) === 0
  ) {
    return 0; //time-spinner is not available at all. thus we have 0 minutes to utilize
  }
  let spins_used: number = toInt(getProperty("_timeSpinnerMinutesUsed"));
  if (verify) {
    visitUrl("inv_use.php?pwd=&which=3&whichitem=9104"); //visit time-spinner to update remaining minutes
    const spins_new: number = toInt(getProperty("_timeSpinnerMinutesUsed"));
    if (spins_used !== spins_new) {
      auto_log_warning(
        "Detected and corrected erroneous tracking of _timeSpinnerMinutesUsed",
        "red",
      );
      spins_used = spins_new;
    }
  }
  return 10 - spins_used;
}

function timeSpinnerGet(goal: string): boolean {
  //spend 2 minutes to visit the far future using ezandora's script to get something
  if (timeSpinnerRemaining$1(true) < 2) {
    return false;
  }
  goal = toLowerCase(goal);
  if (
    ![
      "booze",
      "drink",
      "food",
      "memory",
      "history",
      "ears",
      "mall",
      "none",
    ].includes(goal)
  ) {
    return false;
  }

  if (
    ["booze", "drink", "food", "memory", "history", "ears", "mall"].includes(
      goal,
    )
  ) {
    if (toBoolean(getProperty("_timeSpinnerReplicatorUsed"))) {
      return false;
    }
  }

  if (goal === "booze" && toInt(getProperty("timeSpinnerMedals")) < 5) {
    return false;
  }
  if (goal === "drink" && toInt(getProperty("timeSpinnerMedals")) < 5) {
    return false;
  }
  if (goal === "food" && toInt(getProperty("timeSpinnerMedals")) < 15) {
    return false;
  }
  if (goal === "history" && toInt(getProperty("timeSpinnerMedals")) < 10) {
    return false;
  }
  if (goal === "memory" && toInt(getProperty("timeSpinnerMedals")) < 20) {
    return false;
  }

  if (gitExists("Ezandora-Far-Future")) {
    //Required by dependencies
    cliExecute(`FarFuture ${goal}`);
    return true;
  }
  return false;
}
function timeSpinnerConsume(goal: Item): boolean {
  //spend 3 minutes to re-consume a food item
  if (timeSpinnerRemaining$1(true) < 3) {
    return false;
  }
  let available: boolean = false;
  for (const [i, s] of splitString(
    getProperty("_timeSpinnerFoodAvailable"),
    ",",
  ).entries()) {
    if (toInt(goal) === toInt(s)) {
      available = true;
    }
  }
  if (!available) {
    return false; //the item we want to re-consume via time travel is not available currently
  }

  const initial_fullness: number = fullness_left();
  visitUrl("inv_use.php?pwd=&which=3&whichitem=9104");
  visitUrl("choice.php?pwd=&whichchoice=1195&option=2");
  visitUrl(`choice.php?pwd=&whichchoice=1197&option=1&foodid=${toInt(goal)}`);
  return fullness_left() !== initial_fullness;
}

export function timeSpinnerAdventure(option?: CombatMacro): boolean {
  //spend 1 minutes to Adventure Way Back in Time
  if (timeSpinnerRemaining$1(true) < 1) {
    return false;
  }
  const pages: Map<number, string> = new Map();
  pages.set(0, "inv_use.php?pwd=&which=3&whichitem=9104");
  pages.set(1, "choice.php?pwd=&whichchoice=1195&option=3");
  return autoAdvBypass(0, pages, $location`Noob Cave`, option);
}

function canTimeSpinnerMonster(mon: Monster): boolean {
  // Can only time spinner summon copyable monsters
  if (!mon.copyable || mon.id < 0) {
    return false;
  }

  const name: string = mon.toString();
  for (const loc of $locations.all()) {
    if (containsText(loc.combatQueue, name)) {
      return true;
    }
  }
  return false;
}

export function timeSpinnerCombat(goal: Monster): boolean {
  return timeSpinnerCombat$2(goal, null, false);
}

export function timeSpinnerCombat$1(
  goal: Monster,
  speculative: boolean,
): boolean {
  return timeSpinnerCombat$2(goal, null, speculative);
}

function timeSpinnerCombat$2(
  goal: Monster,
  option: CombatMacro,
  speculative: boolean,
): boolean {
  //spend 3 minutes to Travel to a Recent Fight
  if (timeSpinnerRemaining$1(!speculative) < 3) {
    return false;
  }
  if (!canTimeSpinnerMonster(goal)) {
    return false;
  }
  if (speculative) {
    // error checking passed, assume rest will work
    return true;
  }
  auto_log_info(`Using time spinner to summon ${goal.name}`, "blue");
  const pages: Map<number, string> = new Map();
  pages.set(0, "inv_use.php?pwd=&which=3&whichitem=9104");
  pages.set(1, "choice.php?pwd=&whichchoice=1195&option=1");
  pages.set(2, `choice.php?pwd=&whichchoice=1196&option=1&monid=${goal.id}`);
  if (autoAdvBypass(0, pages, $location`Noob Cave`, option)) {
    handleTracker$1(
      goal.toString(),
      $item`Time-Spinner`.toString(),
      "auto_copies",
    );
    return true;
  }
  if (getProperty("lastEncounter") === "Travel to a Recent Fight") {
    visitUrl("choice.php?pwd&whichchoice=1196&option=2");
  } else {
    abort(
      "Time-Spinner combat failed and we were unable to leave the Time-Spinner",
    );
  }
  return false;
}

export function auto_chapeau(): void {
  if (!canEquip($item`no hat`)) {
    //requires 150 Moxie to wear, so will stop at this check alone most of the time, except in BIG! or level 13 moxie class
    return;
  }
  if (!auto_have_skill($skill`Ceci N'Est Pas Un Chapeau`)) {
    return;
  }
  if (myMp() < mpCost($skill`Ceci N'Est Pas Un Chapeau`)) {
    return;
  }
  if (possessEquipment($item`no hat`) || !auto_can_equip($item`no hat`)) {
    return;
  }
  //300 MP cost is high and non sauceror classes that rely on meat for MP may need to check reserve first
  let doGetNoHat: boolean = false;
  if (myMp() >= 100 + mpCost($skill`Ceci N'Est Pas Un Chapeau`)) {
    doGetNoHat = true;
  } else if (
    myMp() >= 32 + mpCost($skill`Ceci N'Est Pas Un Chapeau`) &&
    mp_regen() >= 32
  ) {
    doGetNoHat = true;
  } else {
    const minimumMeat: number =
      meatReserve() + (myClass() === $class`Sauceror` ? 500 : 2000);
    if (myMeat() >= minimumMeat) {
      doGetNoHat = true;
    }
  }

  if (doGetNoHat) {
    useSkill(1, $skill`Ceci N'Est Pas Un Chapeau`);
  }
}

function rethinkingCandyList(): boolean {
  const synthesis: Effect[] = $effects`Synthesis: Hot, Synthesis: Cold, Synthesis: Pungent, Synthesis: Scary, Synthesis: Greasy, Synthesis: Strong, Synthesis: Smart, Synthesis: Cool, Synthesis: Hardy, Synthesis: Energy, Synthesis: Greed, Synthesis: Collection, Synthesis: Movement, Synthesis: Learning, Synthesis: Style`;
  for (const eff of synthesis) {
    auto_log_info(
      `Trying effect: ${eff}: ${stringModifier(eff, "Modifiers")}`,
      "orange",
    );
    rethinkingCandy$1(eff, true);
  }
  return true;
}

export function rethinkingCandy(acquire: Effect): boolean {
  return rethinkingCandy$1(acquire, false);
}

function rethinkingCandy$1(acquire: Effect, simulate: boolean): boolean {
  if (
    (!haveSkill($skill`Sweet Synthesis`) ||
      !auto_is_valid$2($skill`Sweet Synthesis`)) &&
    !simulate
  ) {
    return false;
  }
  if (spleen_left() === 0 && !simulate) {
    return false;
  }

  const synthesisList: Map<Effect, boolean> = new Map([
    [$effect`Synthesis: Hot`, true],
    [$effect`Synthesis: Cold`, true],
    [$effect`Synthesis: Pungent`, true],
    [$effect`Synthesis: Scary`, true],
    [$effect`Synthesis: Greasy`, true],
    [$effect`Synthesis: Strong`, true],
    [$effect`Synthesis: Smart`, true],
    [$effect`Synthesis: Cool`, true],
    [$effect`Synthesis: Hardy`, true],
    [$effect`Synthesis: Energy`, true],
    [$effect`Synthesis: Greed`, true],
    [$effect`Synthesis: Collection`, true],
    [$effect`Synthesis: Movement`, true],
    [$effect`Synthesis: Learning`, true],
    [$effect`Synthesis: Style`, true],
  ]);
  const synthesis: Map<number, Effect> = List$1(synthesisList);

  if (!synthesisList.has(acquire)) {
    return false;
  }

  let maxprice: number = 2500;
  if (toInt(getProperty("auto_maxCandyPrice")) !== 0) {
    maxprice = toInt(getProperty("auto_maxCandyPrice"));
  }

  let simpleList: Map<number, Item> = new Map();
  let complexList: Map<number, Item> = new Map();
  for (const it of $items.all()) {
    if (
      it.candy &&
      itemAmount(it) > 0 &&
      auto_mall_price(it) <= maxprice &&
      it.tradeable
    ) {
      if (it.candyType === "simple") {
        simpleList.set(simpleList.size, it);
      } else if (it.candyType === "complex") {
        complexList.set(complexList.size, it);
      }
    }
  }

  simpleList = new Map(
    [...simpleList.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: auto_mall_price(value) };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  complexList = new Map(
    [...complexList.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: auto_mall_price(value) };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  const simple: Map<number, Item> = List$8(simpleList);
  const complex: Map<number, Item> = List$8(complexList);

  let bestCost: number = 2 * maxprice;
  let bestFirst: Item = Item.none;
  let bestSecond: Item = Item.none;
  if (
    $effects`Synthesis: Hot, Synthesis: Cold, Synthesis: Pungent, Synthesis: Scary, Synthesis: Greasy`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < simple.size; i++) {
      const current: number = toInt(
        simple.get(i) ?? simple.set(i, Item.none).get(i),
      );
      let startNextIndex: number = i + 1;
      if (itemAmount(simple.get(i) ?? simple.set(i, Item.none).get(i)) > 1) {
        startNextIndex = i;
      }
      for (let j: number = startNextIndex; j < simple.size; j++) {
        const sum: number =
          (toInt(simple.get(j) ?? simple.set(j, Item.none).get(j)) + current) %
          5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${simple.get(i) ?? simple.set(i, Item.none).get(i)}, ${simple.get(j) ?? simple.set(j, Item.none).get(j)}`,
              "blue",
            );
          }
          if (
            auto_mall_price(simple.get(i) ?? simple.set(i, Item.none).get(i)) +
              auto_mall_price(
                simple.get(j) ?? simple.set(j, Item.none).get(j),
              ) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(
                simple.get(i) ?? simple.set(i, Item.none).get(i),
              ) +
              auto_mall_price(simple.get(j) ?? simple.set(j, Item.none).get(j));
            bestFirst = simple.get(i) ?? simple.set(i, Item.none).get(i);
            bestSecond = simple.get(j) ?? simple.set(j, Item.none).get(j);
          }
        }
      }
    }
  } else if (
    $effects`Synthesis: Strong, Synthesis: Smart, Synthesis: Cool, Synthesis: Hardy, Synthesis: Energy`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < simple.size; i++) {
      const current: number = toInt(
        simple.get(i) ?? simple.set(i, Item.none).get(i),
      );
      for (let j: number = 0; j < complex.size; j++) {
        const sum: number =
          (toInt(complex.get(j) ?? complex.set(j, Item.none).get(j)) +
            current) %
          5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${simple.get(i) ?? simple.set(i, Item.none).get(i)}, ${complex.get(j) ?? complex.set(j, Item.none).get(j)}`,
              "blue",
            );
          }
          if (
            auto_mall_price(simple.get(i) ?? simple.set(i, Item.none).get(i)) +
              auto_mall_price(
                complex.get(j) ?? complex.set(j, Item.none).get(j),
              ) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(
                simple.get(i) ?? simple.set(i, Item.none).get(i),
              ) +
              auto_mall_price(
                complex.get(j) ?? complex.set(j, Item.none).get(j),
              );
            bestFirst = simple.get(i) ?? simple.set(i, Item.none).get(i);
            bestSecond = complex.get(j) ?? complex.set(j, Item.none).get(j);
          }
        }
      }
    }
  } else if (
    $effects`Synthesis: Greed, Synthesis: Collection, Synthesis: Movement, Synthesis: Learning, Synthesis: Style`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < complex.size; i++) {
      const current: number = toInt(
        complex.get(i) ?? complex.set(i, Item.none).get(i),
      );
      let startNextIndex: number = i + 1;
      if (itemAmount(complex.get(i) ?? complex.set(i, Item.none).get(i)) > 1) {
        startNextIndex = i;
      }
      for (let j: number = startNextIndex; j < complex.size; j++) {
        const sum: number =
          (toInt(complex.get(j) ?? complex.set(j, Item.none).get(j)) +
            current) %
          5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${complex.get(i) ?? complex.set(i, Item.none).get(i)}, ${complex.get(j) ?? complex.set(j, Item.none).get(j)}`,
              "blue",
            );
          }
          if (
            auto_mall_price(
              complex.get(i) ?? complex.set(i, Item.none).get(i),
            ) +
              auto_mall_price(
                complex.get(j) ?? complex.set(j, Item.none).get(j),
              ) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(
                complex.get(i) ?? complex.set(i, Item.none).get(i),
              ) +
              auto_mall_price(
                complex.get(j) ?? complex.set(j, Item.none).get(j),
              );
            bestFirst = complex.get(i) ?? complex.set(i, Item.none).get(i);
            bestSecond = complex.get(j) ?? complex.set(j, Item.none).get(j);
          }
        }
      }
    }
  } else {
    return false;
  }

  if (bestFirst !== Item.none) {
    auto_log_info(
      `Best case: ${bestFirst}, ${bestSecond}: ${bestCost}`,
      "green",
    );
    if (!simulate) {
      const prior: number = haveEffect(acquire);
      let temp: string = visitUrl(
        `runskillz.php?pwd=&targetplayer=${myId()}&quantity=1&whichskill=166`,
      );

      const url: string = `choice.php?whichchoice=1217&option=1&pwd=&a=${toInt(bestFirst)}&b=${toInt(bestSecond)}`;
      temp = visitUrl(url);
      if (haveEffect(acquire) === prior) {
        abort(`Failed to Sweetly Synthesize: ${url}`);
      }
    }
    return true;
  } else if (simulate) {
    auto_log_warning("Could not find a possible candy combination", "red");
  } else {
    return false;
  }
  return false;
}
