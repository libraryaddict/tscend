import {
  availableAmount,
  availableChoiceOptions,
  buy,
  ceil,
  council,
  eightBitPoints,
  equip,
  floor,
  gnomadsAvailable,
  haveEffect,
  Item,
  itemAmount,
  Location,
  max,
  meatDropModifier,
  min,
  Modifier,
  myFamiliar,
  myMeat,
  myTurncount,
  numericModifier,
  round,
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
import { uneffect } from "../../helpers/auto_restore";
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

export function needDigitalKey(): boolean {
  if (isActuallyEd()) {
    return false;
  }
  if (get("nsTowerDoorKeysUsed").includes("digital key")) {
    return false;
  }
  if (itemAmount($item`digital key`) > 0) {
    return false;
  }

  if (internalQuestStatus("questL13Final") > 5) {
    return false;
  }

  return true;
}

export function need8BitPoints(): boolean {
  if (get("8BitScore") >= 10000) {
    return false;
  }
  return needDigitalKey();
}

export function EightBitScore(): number {
  const score: number = get("8BitScore");
  return score;
}

function prepForMegaloCityDo(): boolean {
  // low DA is punishing here, so if you're a non-guild class get torso and potentially autumn aegis
  if (isGuildClass()) {
    return true; // nothing to do here as guild class
  }
  // If we can buy Torso and should, do that here, ignoring reserve
  if (
    myMeat() >= 6000 &&
    gnomadsAvailable() &&
    !hasTorso() &&
    hasUsefulShirt()
  ) {
    visitUrl("gnomes.php?action=trainskill&whichskill=12");
  }
  // After this consider the aegis
  const aegis: Item = $item`autumnal aegis`;
  if (availableAmount(aegis) > 0 || !auto_is_valid(aegis)) {
    return true; // no point doing anything further here
  }
  if (!isGuildClass() && availableAmount(aegis) === 0) {
    BurningLeaves.makeAutumnalAegis();
  }
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
  ready: () => true,
  do: prepForMegaloCityDo,
});

export function prepForMegaloCity(): boolean {
  return runQuestTask(prepForMegaloCityTask);
}

export function EightBitRealmHandler(): boolean {
  //Spend adventures to get the digital key
  //Preparing for each zone is handled in auto_pre_adv.ash
  let adv_spent: boolean = false;

  const color: string = get("8BitColor");
  if (
    internalQuestStatus("questL02Larva") < 0 &&
    internalQuestStatus("questG02Whitecastle") < 0 &&
    availableAmount($item`continuum transfunctioner`) === 0
  ) {
    // need distant woods and continuum transfunctioner
    return false;
  }
  switch (color) {
    case "black":
      if (EightBitOnCooldown($location`Vanya's Castle`)) {
        return false;
      }
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      adv_spent = autoAdv($location`Vanya's Castle`, undefined, () =>
        EightBitBelowTarget($location`Vanya's Castle`),
      );
      break;
    case "red":
      if (EightBitOnCooldown($location`The Fungus Plains`)) {
        return false;
      }
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      if (meatDropModifier() < 395 && !isSoftBlockInPlace("8bitRealm")) {
        Eagle.getCitizenZone$1("meat");
      }
      adv_spent = autoAdv($location`The Fungus Plains`, undefined, () =>
        EightBitBelowTarget($location`The Fungus Plains`),
      );
      break;
    case "blue":
      if (EightBitOnCooldown($location`Megalo-City`)) {
        return false;
      }
      prepForMegaloCity();
      adv_spent = autoAdv($location`Megalo-City`, undefined, () =>
        EightBitBelowTarget($location`Megalo-City`),
      );
      break;
    case "green":
      if (EightBitOnCooldown($location`Hero's Field`)) {
        return false;
      }
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      adv_spent = autoAdv($location`Hero's Field`, undefined, () =>
        EightBitBelowTarget($location`Hero's Field`),
      );
      break;
    default:
      auto_abort("Property 8BitColor not set to a valid value");
      break;
  }
  auto_log_info(`Current 8bit score: ${EightBitScore()}/10000`);

  return adv_spent;
}

const get8BitFatLootTokenTask: QuestTask = registerQuestTask({
  name: "L13_do8BitRealm",
  completed: () =>
    internalQuestStatus("questL13Final") > 5 || towerKeyCount(false) >= 3,
  ready: () => !EightBitOnCooldown(current8BitLocation().location),
  do: get8BitFatLootTokenDo,
  locations: $locations`Vanya's Castle, The Fungus Plains, Megalo-City, Hero's Field`,
});

export const LX_getDigitalKeyTask: QuestTask = registerQuestTask({
  name: "LX_getDigitalKey",
  completed: () => !needDigitalKey(),
  ready: () =>
    needDigitalKey() && !EightBitOnCooldown(current8BitLocation().location),
  do: LX_getDigitalKeyDo,
  locations: $locations`Vanya's Castle, The Fungus Plains, Megalo-City, Hero's Field`,
});

function get8BitFatLootTokenDo(): boolean {
  //Acquire the [Fat Loot Token] from 8 bit realm
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`);
  // buy fat loot token if you can
  if (EightBitScore() >= 20000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    if (2 in availableChoiceOptions()) {
      auto_runChoice(2);
      return true;
    } else {
      auto_log_warning(
        "Thought we could buy fat loot token in 8-Bit Realm but was unable.",
      );
      auto_log_warning(`Current score = ${EightBitScore()}`);
      return false;
    }
  }

  return EightBitRealmHandler();
}

export function get8BitFatLootToken(): boolean {
  return runQuestTask(get8BitFatLootTokenTask);
}

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

// Every 8-Bit Realm fight scores a base 100, plus up to 300 more that scales linearly to 0 over the
// 1000 points of `modifier` short of `target`, with the total rounded to the nearest 10.
function eightBitFightScore(current: number, target: number): number {
  const bonus = 300 * max(0, min(1, 1 - (target - current) / 1000));
  return round((100 + bonus) / 10) * 10;
}

function eightBitNextScoreMilestone(): number {
  return (floor(EightBitScore() / 10000) + 1) * 10000;
}

// Compares turns needed to reach our next 8-Bit score milestone with vs without the zone's ideal familiar.
// We only want to require the familiar if it actually saves us a whole turn getting there.
function eightBitFamiliarSavesATurn(
  realm: (typeof eightBitLocs)[number],
): boolean {
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

  const remaining = eightBitNextScoreMilestone() - EightBitScore();
  const turnsWithout =
    remaining / eightBitFightScore(withoutFamiliar, realm.target);
  const turnsWith = remaining / eightBitFightScore(withFamiliar, realm.target);

  return ceil(turnsWithout) > ceil(turnsWith);
}

const eightBitLastFailedTurn: Map<Location, number> = new Map();

function current8BitLocation(): EightBitLoc {
  const color = get("8BitColor") || "black";
  const loc = eightBitLocs.find((eight) => eight.color === color);

  if (!loc) auto_abort(`Failed to turn ${color} into an 8 bit loc`);

  return loc;
}

function EightBitOnCooldown(loc: Location): boolean {
  if (!isSoftBlockInPlace("8bitRealm")) {
    return false;
  }
  const lastFailed = eightBitLastFailedTurn.get(loc);
  return lastFailed !== undefined && myTurncount() - lastFailed < 20;
}

// checked via autoAdv's skipAdventureIf, after prep gear is equipped
function EightBitBelowTarget(loc: Location): boolean {
  if (!isSoftBlockInPlace("8bitRealm")) {
    return false;
  }
  const realm = eightBitLocs.find((t) => t.location === loc);
  if (
    realm === undefined ||
    (numericModifier(realm.modifier) >= realm.target &&
      eightBitPoints(loc) >= 400)
  ) {
    return false;
  }
  eightBitLastFailedTurn.set(loc, myTurncount());
  return true;
}

const canUseAnyFamiliar: Map<
  Location,
  { canUseAnyFamiliar: boolean; computed: number }
> = new Map();

export function auto_8BitCapsScoreWithoutFamiliar(place: Location): boolean {
  return canUseAnyFamiliar.get(place)?.canUseAnyFamiliar ?? true;
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

  const cached = canUseAnyFamiliar.get(place);

  if (cached && !cached.canUseAnyFamiliar) {
    if (myTurncount() - cached.computed < 5) {
      return;
    }
    canUseAnyFamiliar.set(place, {
      canUseAnyFamiliar: true,
      computed: myTurncount(),
    });
    auto_log_info(
      `Giving 'any' familiar another shot at ${place}, let's bail out and figure out our equipment again...`,
    );
    set("_autoSkipNextAdventure", true);
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

  canUseAnyFamiliar.set(place, {
    canUseAnyFamiliar: false,
    computed: myTurncount(),
  });
  auto_log_info(
    `We're not capping the target ${realm.modifier} ${realm.target} at ${place} with our ${current}, falling back to the ideal familiar.`,
  );
  set("_autoSkipNextAdventure", true);
}

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
// Compares turns needed to reach our next 8-Bit score milestone with vs without the zone's ideal familiar.
// We only want to require the familiar if it actually saves us a whole turn getting there.
// checked via autoAdv's skipAdventureIf, after prep gear is equipped

export function LX_getDigitalKeyDo(): boolean {
  //Acquire the [Digital Key]

  if (itemAmount($item`digital key`) > 0) {
    if (haveEffect($effect`Consumed by Fear`) > 0) {
      uneffect($effect`Consumed by Fear`);
      council();
    }
    return false;
  }
  if (in_koe()) {
    if (
      itemAmount($item`digital key`) === 0 &&
      internalQuestStatus("questL13Final") === 5
    ) {
      return buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`digital key`);
    } else {
      return false;
    }
  }
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`);
  // buy key if you can
  if (EightBitScore() >= 10000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    auto_runChoice(1);
    if (!needDigitalKey()) {
      return true;
    }
  }

  return EightBitRealmHandler();
}
