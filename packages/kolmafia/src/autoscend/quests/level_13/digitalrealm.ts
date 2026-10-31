import {
  availableAmount,
  availableChoiceOptions,
  buy,
  eightBitPoints,
  equip,
  gnomadsAvailable,
  itemAmount,
  Location,
  meatDropModifier,
  Modifier,
  myFamiliar,
  myMeat,
  myTurncount,
  numericModifier,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $slot,
  get,
  set,
} from "libram";

import { BurningLeaves, Eagle, Heartstone } from "../../../types";
import { autoForceEquip } from "../../auto_equipment";
import { isSoftBlockInPlace } from "../../auto_routing";
import { QuestTask, runQuestTask, taskLocations } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv } from "../../executors/auto_adventure";
import { pullXWhenHaveY } from "../../helpers/auto_acquire";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import {
  canChangeFamiliar,
  lookupFamiliarDatafile,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "../../helpers/auto_familiar";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_zootomist } from "../../paths/2025/zootomist";
import {
  auto_abort,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  auto_is_valid,
  auto_runChoice,
  hasTorso,
  hasUsefulShirt,
  internalQuestStatus,
  isGuildClass,
  woods_questStart,
} from "../../utils/auto_util";
import { towerKeyCount } from "../level_13";

type EightBitLoc = {
  location: Location;
  modifier: Modifier;
  color: string;
  target: number;
  familiarType?: string;
};

const eightBitLocs: EightBitLoc[] = [
  {
    location: $location`Vanya's Castle`,
    modifier: $modifier`Initiative`,
    color: "black",
    target: 600,
    familiarType: "init",
  },
  {
    location: $location`Hero's Field`,
    modifier: $modifier`Item Drop`,
    color: "green",
    target: 400,
    familiarType: "item",
  },
  {
    location: $location`The Fungus Plains`,
    modifier: $modifier`Meat Drop`,
    color: "red",
    target: 450,
    familiarType: "meat",
  },
  {
    location: $location`Megalo-City`,
    modifier: $modifier`Damage Absorption`,
    color: "blue",
    target: 600,
  },
];

const eightBitZones = $locations`Vanya's Castle, The Fungus Plains, Megalo-City, Hero's Field`;

export function needDigitalKey(): boolean {
  return (
    !isActuallyEd() &&
    !get("nsTowerDoorKeysUsed").includes("digital key") &&
    itemAmount($item`digital key`) === 0 &&
    internalQuestStatus("questL13Final") <= 5
  );
}

export function need8BitPoints(): boolean {
  return get("8BitScore") < 10000 && needDigitalKey();
}

export function current8BitLocation(): EightBitLoc {
  const color = get("8BitColor") || "black";
  const loc = eightBitLocs.find((eight) => eight.color === color);

  if (!loc) auto_abort(`Failed to turn ${color} into an 8 bit loc`);

  return loc;
}

function prepForMegaloCityDo(): boolean {
  // low DA is punishing here, so if you're a non-guild class get torso and potentially autumn aegis
  // If we can buy Torso and should, do that here, ignoring reserve
  if (
    myMeat() >= 6000 &&
    gnomadsAvailable() &&
    !hasTorso() &&
    hasUsefulShirt()
  ) {
    visitUrl("gnomes.php?action=trainskill&whichskill=12");
  }
  const aegis = $item`autumnal aegis`;
  BurningLeaves.makeAutumnalAegis();
  if (in_zootomist() && availableAmount(aegis) === 0) {
    pullXWhenHaveY(aegis, 0);
  }
  return availableAmount(aegis) > 0;
}

const prepForMegaloCityTask: QuestTask = registerQuestTask({
  name: "prepForMegaloCity",
  completed: () =>
    isGuildClass() ||
    availableAmount($item`autumnal aegis`) > 0 ||
    !auto_is_valid($item`autumnal aegis`),
  do: prepForMegaloCityDo,
});

export function prepForMegaloCity(): boolean {
  return runQuestTask(prepForMegaloCityTask);
}

const eightBitLastFailedTurn: Map<Location, number> = new Map();

function EightBitOnCooldown(loc: Location): boolean {
  if (!isSoftBlockInPlace("8bitRealm")) {
    return false;
  }
  const lastFailed = eightBitLastFailedTurn.get(loc);
  return lastFailed !== undefined && myTurncount() - lastFailed < 20;
}

// checked via autoAdv's skipAdventureIf, after prep gear is equipped
function EightBitBelowTarget(realm: EightBitLoc): boolean {
  if (!isSoftBlockInPlace("8bitRealm")) {
    return false;
  }
  if (
    numericModifier(realm.modifier) >= realm.target &&
    eightBitPoints(realm.location) >= 400
  ) {
    return false;
  }
  eightBitLastFailedTurn.set(realm.location, myTurncount());
  return true;
}

// Zone prep is handled in auto_pre_adv
function EightBitRealmHandler(): boolean {
  if (
    internalQuestStatus("questL02Larva") < 0 &&
    internalQuestStatus("questG02Whitecastle") < 0 &&
    availableAmount($item`continuum transfunctioner`) === 0
  ) {
    // need distant woods and continuum transfunctioner
    return false;
  }
  const realm = current8BitLocation();
  const location = realm.location;
  if (EightBitOnCooldown(location)) {
    return false;
  }
  if (location === $location`Megalo-City`) {
    prepForMegaloCity();
  } else {
    // limited buff that is helpful for 3 of 4 8-bit zones
    buffMaintain$2($effect`Shadow Waters`);
    if (
      location === $location`The Fungus Plains` &&
      meatDropModifier() < 395 &&
      !isSoftBlockInPlace("8bitRealm")
    ) {
      Eagle.getCitizenZone$1("meat");
    }
  }
  const adv_spent = autoAdv(location, undefined, () =>
    EightBitBelowTarget(realm),
  );
  auto_log_info(`Current 8bit score: ${get("8BitScore")}/10000`);

  return adv_spent;
}

function get8BitFatLootTokenDo(): boolean {
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`, true);
  // buy fat loot token if you can
  if (get("8BitScore") >= 20000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    if (2 in availableChoiceOptions()) {
      auto_runChoice(2);
      return true;
    }
    auto_log_warning(
      "Thought we could buy fat loot token in 8-Bit Realm but was unable.",
    );
    auto_log_warning(`Current score = ${get("8BitScore")}`);
    return false;
  }

  return EightBitRealmHandler();
}

const get8BitFatLootTokenTask: QuestTask = registerQuestTask({
  name: "L13_do8BitRealm",
  completed: () =>
    internalQuestStatus("questL13Final") > 5 || towerKeyCount(false) >= 3,
  ready: () => !EightBitOnCooldown(current8BitLocation().location),
  do: get8BitFatLootTokenDo,
  locations: eightBitZones,
});

export function get8BitFatLootToken(): boolean {
  return runQuestTask(get8BitFatLootTokenTask);
}

function LX_getDigitalKeyDo(): boolean {
  if (in_koe()) {
    return (
      internalQuestStatus("questL13Final") === 5 &&
      buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`digital key`)
    );
  }
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`, true);
  // buy key if you can
  if (get("8BitScore") >= 10000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    auto_runChoice(1);
    if (!needDigitalKey()) {
      return true;
    }
  }

  return EightBitRealmHandler();
}

export const LX_getDigitalKeyTask: QuestTask = registerQuestTask({
  name: "LX_getDigitalKey",
  completed: () => !needDigitalKey(),
  ready: () => !EightBitOnCooldown(current8BitLocation().location),
  do: LX_getDigitalKeyDo,
  locations: eightBitZones,
});

// A quest that's just meant to allow us to go for 8bit realm when something is good
registerQuestTask(LX_getDigitalKeyTask, {
  name: "L13_do8BitRealmHeartstone",
  completed: () => false,
  ready: () =>
    get("heartstoneLetters").startsWith("GO") &&
    auto_is_valid($item`Heartstone`) &&
    get("8BitScore") < 10000,
  do: () =>
    Heartstone.heartstoneAimingForDairyGoat() &&
    taskLocations(LX_getDigitalKeyTask).some((l) =>
      Heartstone.heartstoneShouldEquipForStealHeart(l),
    ) &&
    runQuestTask(LX_getDigitalKeyTask),
});

// Every 8-Bit Realm fight scores a base 100, plus up to 300 more that scales linearly to 0 over the
// 1000 points of `modifier` short of `target`, with the total rounded to the nearest 10.
function eightBitFightScore(current: number, target: number): number {
  const bonus = 300 * Math.max(0, Math.min(1, 1 - (target - current) / 1000));
  return Math.round((100 + bonus) / 10) * 10;
}

// Compares turns needed to reach our next 8-Bit score milestone with vs without the zone's ideal familiar.
// We only want to require the familiar if it actually saves us a whole turn getting there.
function eightBitFamiliarSavesATurn(realm: EightBitLoc): boolean {
  if (realm.familiarType === undefined) {
    return true;
  }

  const idealFamiliar = lookupFamiliarDatafile(realm.familiarType);
  if (idealFamiliar === $familiar.none) {
    return true;
  }

  const startingFamiliar = myFamiliar();
  useFamiliar($familiar.none);
  const withoutFamiliar = numericModifier(realm.modifier);
  useFamiliar(idealFamiliar);
  const withFamiliar = numericModifier(realm.modifier);
  useFamiliar(startingFamiliar);

  const score = get("8BitScore");
  const remaining = (Math.floor(score / 10000) + 1) * 10000 - score;
  const turnsWithout =
    remaining / eightBitFightScore(withoutFamiliar, realm.target);
  const turnsWith = remaining / eightBitFightScore(withFamiliar, realm.target);

  return Math.ceil(turnsWithout) > Math.ceil(turnsWith);
}

const familiarRequiredSinceTurn: Map<Location, number> = new Map();

export function auto_8BitCapsScoreWithoutFamiliar(place: Location): boolean {
  return !familiarRequiredSinceTurn.has(place);
}

export function auto_8BitCheckCappingScore(place: Location): void {
  if (
    !canChangeFamiliar() ||
    !pathHasFamiliar() ||
    !pathAllowsChangingFamiliar()
  ) {
    return;
  }

  const realm = eightBitLocs.find((t) => t.location === place);
  if (realm === undefined) {
    return;
  }

  const requiredSince = familiarRequiredSinceTurn.get(place);

  if (requiredSince !== undefined) {
    if (myTurncount() - requiredSince < 5) {
      return;
    }
    familiarRequiredSinceTurn.delete(place);
    auto_log_info(
      `Giving 'any' familiar another shot at ${place}, let's bail out and figure out our equipment again...`,
    );
    set("_tscend_skipNextAdventure", true);
    return;
  }

  const current = numericModifier(realm.modifier);
  if (current >= realm.target) {
    auto_log_info(
      `We're capping the target ${realm.modifier} ${realm.target} at ${place} with our ${current} without requiring certain familiars.`,
    );
    return;
  }

  if (!eightBitFamiliarSavesATurn(realm)) {
    auto_log_info(
      `We're not capping the target ${realm.modifier} ${realm.target} at ${place} with our ${current}, but the ideal familiar wouldn't save us a turn towards our next 8bit score milestone, so we won't require it.`,
    );
    return;
  }

  familiarRequiredSinceTurn.set(place, myTurncount());
  auto_log_info(
    `We're not capping the target ${realm.modifier} ${realm.target} at ${place} with our ${current}, falling back to the ideal familiar.`,
  );
  set("_tscend_skipNextAdventure", true);
}
