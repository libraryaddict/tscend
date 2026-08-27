import {
  containsText,
  isUnrestricted,
  Item,
  itemAmount,
  min,
  myHp,
  myLevel,
  myMeat,
  myPrimestat,
  splitString,
  toInt,
  toLowerCase,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $item, $skill, get, set } from "libram";

import { TrainSet } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_abort,
  auto_autosell,
  auto_is_valid,
  auto_log_error,
  auto_log_warning,
  handleTracker,
  internalQuestStatus,
  wrap_item,
} from "../../auto_util";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { in_theSource } from "../../paths/2016/the_source";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { needOre } from "../../quests/level_08";
import { towerKeyCount } from "../../quests/level_13";

function deck_available(): boolean {
  const deck: Item = wrap_item($item`Deck of Every Card`);
  return itemAmount(deck) > 0 && isUnrestricted(deck) && auto_is_valid(deck);
}

function deck_draws_left(): number {
  if (!deck_available()) {
    return 0;
  }
  if (myHp() === 0) {
    return 0;
  }
  return 15 - get("_deckCardsDrawn");
}

let $_deck_cheat_cards: Map<string, number> | undefined;

function deck_cheat(cheat: string): boolean {
  if (!deck_available()) {
    return false;
  }
  if (deck_draws_left() <= 0) {
    return false;
  }
  if (myHp() === 0) {
    return false;
  }
  cheat = toLowerCase(cheat);
  $_deck_cheat_cards ??= new Map();
  $_deck_cheat_cards.set("x of clubs", 1);
  $_deck_cheat_cards.set("x of hearts", 2);
  $_deck_cheat_cards.set("x of diamonds", 3);
  $_deck_cheat_cards.set("x of spades", 4);
  $_deck_cheat_cards.set("x of cups", 5);
  $_deck_cheat_cards.set("x of wands", 6);
  $_deck_cheat_cards.set("x of swords", 7);
  $_deck_cheat_cards.set("x of coins", 8);
  $_deck_cheat_cards.set("xiii - death", 9);
  $_deck_cheat_cards.set("goblin sapper", 10);

  $_deck_cheat_cards.set("the hive", 11);
  $_deck_cheat_cards.set("hunky fireman card", 12);
  $_deck_cheat_cards.set("v - the hierophant", 13);
  $_deck_cheat_cards.set("xviii - the moon", 14);
  $_deck_cheat_cards.set("werewolf", 15);
  $_deck_cheat_cards.set("xv - the devil", 16);
  $_deck_cheat_cards.set("fire elemental", 17);
  $_deck_cheat_cards.set("slimer trading card", 18);
  $_deck_cheat_cards.set("vii - the chariot", 19);
  $_deck_cheat_cards.set("ii - the high priestess", 20);

  $_deck_cheat_cards.set("xii - the hanged man", 21);
  $_deck_cheat_cards.set("plantable greeting card", 22);
  $_deck_cheat_cards.set("pirate birthday card", 23);
  $_deck_cheat_cards.set("xiv - temperance", 24);
  $_deck_cheat_cards.set("unstable portal", 25);
  $_deck_cheat_cards.set("xvii - the star", 26);
  $_deck_cheat_cards.set("suit warehouse discount card", 27);
  $_deck_cheat_cards.set("christmas card", 28);
  $_deck_cheat_cards.set("go fish", 29);
  $_deck_cheat_cards.set("aquarius horoscope", 30);

  $_deck_cheat_cards.set("plains", 31);
  $_deck_cheat_cards.set("swamp", 32);
  $_deck_cheat_cards.set("mountain", 33);
  $_deck_cheat_cards.set("forest", 34);
  $_deck_cheat_cards.set("island", 35);
  $_deck_cheat_cards.set("healing salve", 36);
  $_deck_cheat_cards.set("dark ritual", 37);
  $_deck_cheat_cards.set("lightning bolt", 38);
  $_deck_cheat_cards.set("giant growth", 39);
  $_deck_cheat_cards.set("ancestral recall", 40);

  $_deck_cheat_cards.set("gift card", 41);
  $_deck_cheat_cards.set("x of papayas", 42);
  $_deck_cheat_cards.set("x of salads", 43);
  $_deck_cheat_cards.set("ix - the hermit", 44);
  $_deck_cheat_cards.set("iv - the emperor", 45);
  $_deck_cheat_cards.set("green card", 46);
  $_deck_cheat_cards.set("xvi - the tower", 47);
  $_deck_cheat_cards.set("the race card", 48);
  $_deck_cheat_cards.set("0 - the fool", 49);
  $_deck_cheat_cards.set("I - the magician", 50);

  $_deck_cheat_cards.set("xi - strength", 51);
  $_deck_cheat_cards.set("lead pipe", 52);
  $_deck_cheat_cards.set("rope", 53);
  $_deck_cheat_cards.set("wrench", 54);
  $_deck_cheat_cards.set("candlestick", 55);
  $_deck_cheat_cards.set("knife", 56);
  $_deck_cheat_cards.set("revolver", 57);
  $_deck_cheat_cards.set("1952 mickey mantle", 58);
  $_deck_cheat_cards.set("spare tire", 59);
  $_deck_cheat_cards.set("extra tank", 60);

  $_deck_cheat_cards.set("sheep", 61);
  $_deck_cheat_cards.set("year of plenty", 62);
  $_deck_cheat_cards.set("mine", 63);
  $_deck_cheat_cards.set("laboratory", 64);
  $_deck_cheat_cards.set("x of kumquats", 65);
  $_deck_cheat_cards.set("professor plum", 66);
  $_deck_cheat_cards.set("x - the wheel of fortune", 67);
  $_deck_cheat_cards.set("xxi - the world", 68);
  $_deck_cheat_cards.set("vi - the lovers", 69);
  $_deck_cheat_cards.set("iii - the empress", 70);

  $_deck_cheat_cards.set("pvp", 1);
  $_deck_cheat_cards.set("fites", 1);
  $_deck_cheat_cards.set("spade", 4);
  $_deck_cheat_cards.set("white mana", 31);
  $_deck_cheat_cards.set("black mana", 32);
  $_deck_cheat_cards.set("red mana", 33);
  $_deck_cheat_cards.set("green mana", 34);
  $_deck_cheat_cards.set("blue mana", 35);
  $_deck_cheat_cards.set("key", 47);
  $_deck_cheat_cards.set("tower", 47);
  $_deck_cheat_cards.set("init", 48);
  $_deck_cheat_cards.set("moxie buff", 49);
  $_deck_cheat_cards.set("myst buff", 50);
  $_deck_cheat_cards.set("mysticality buff", 50);
  $_deck_cheat_cards.set("meat", 58);
  $_deck_cheat_cards.set("muscle buff", 51);
  $_deck_cheat_cards.set("stone wool", 61);
  $_deck_cheat_cards.set("ore", 63);
  $_deck_cheat_cards.set("items", 67);
  $_deck_cheat_cards.set("muscle stat", 68);
  $_deck_cheat_cards.set("moxie stat", 69);
  $_deck_cheat_cards.set("myst stat", 70);
  $_deck_cheat_cards.set("mysticality stat", 70);

  const card: number = $_deck_cheat_cards.get(cheat) ?? 0;

  const cheated: Map<number, string> = new Map(
    splitString(get("_auto_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]),
  );
  for (const [, cheat_1] of cheated) {
    if (toInt(cheat_1) === card) {
      auto_log_warning("Already cheated this card, failing gracefully.", "red");
      return false;
    }
  }

  const deck: Item = wrap_item($item`Deck of Every Card`);
  visitUrl(`inv_use.php?cheat=1&pwd=&whichitem=${toInt(deck)}`);
  // Check that a valid card was selected, otherwise this wastes 5 draws.
  if (card !== 0) {
    visitUrl(`choice.php?pwd=&option=1&whichchoice=1086&which=${card}`, true);
    const page_1: string = visitUrl(
      "choice.php?pwd=&whichchoice=1085&option=1",
      true,
    );
    if (containsText(page_1, "Combat")) {
      // Can we resolve this combat here? Should we?
      // Do we need to accept a combat filter?
    }

    handleTracker({
      what: deck,
      detail: cheat,
      property: "auto_otherstuff",
    });
    // If mafia is not tracking cheats, we can track them here.
    let found: boolean = false;
    const cheated_1: Map<number, string> = new Map(
      splitString(get("_auto_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]),
    );
    for (const [, cheat_1] of cheated_1) {
      if (toInt(cheat_1) === card) {
        found = true;
      }
    }
    if (!found) {
      if (get("_auto_deckCardsCheated") === "") {
        set("_auto_deckCardsCheated", card);
      } else {
        set(
          "_auto_deckCardsCheated",
          `${get("_auto_deckCardsCheated")},${card}`,
        );
      }
    }
    return true;
  }
  return false;
}

export function deck_useScheme(action: string): boolean {
  if (!deck_available()) {
    return false;
  }
  if (deck_draws_left() < 15) {
    return false;
  }
  if (myHp() === 0) {
    return false;
  }

  let cards: string[] = [];

  if (action === "farming") {
    cards = ["Ancestral Recall", "Island", "1952 Mickey Mantle"];
  } else if (action === "turns") {
    cards = ["Ancestral Recall", "Island"];
    if (needOre()) {
      cards = ["Ancestral Recall", "Island", "Mine"];
    }
  } else {
    // First priority is grab a key if we need one.
    const missingHeroKeys: number = 3 - towerKeyCount();
    if (missingHeroKeys > 0) {
      cards.push("key");
    }
    // Next priority is ore, only if we don't have a train set installed
    if (!TrainSet.haveTrainSet() && needOre()) {
      cards.push("ore");
    }
    // Stats are higher priority early on in LoL where we're never gonna need stone wool day1
    if (in_lol() && myLevel() < 4) {
      const mainstat: string = toLowerCase(myPrimestat().toString());
      cards.push(`${mainstat} stat`);
    }
    // Stone wool
    if (
      cards.length < 3 &&
      internalQuestStatus("questL11Worship") < 2 &&
      itemAmount($item`stone wool`) < 2
    ) {
      cards.push("stone wool");
    }
    // Meat
    if (cards.length < 3 && myMeat() < 10000 && !in_wotsf()) {
      cards.push("1952 Mickey Mantle");
    }
    if (cards.length < 3 && myLevel() < 11) {
      const mainstat: string = toLowerCase(myPrimestat().toString());
      if (!cards.includes(`${mainstat} stat`)) {
        cards.push(`${mainstat} stat`);
      }
    }
  }

  if (cards.length < 3) {
    cards.push("ancestral recall");
  }
  if (cards.length < 3) {
    cards.push("blue mana");
  }

  if (cards.length === 0) {
    return false;
  }

  let count_1: number = 0;
  for (const card of cards) {
    if (
      possessEquipment($item`bass clarinet`) ||
      possessEquipment($item`fish hatchet`) ||
      possessEquipment($item`dented scepter`)
    ) {
      if (
        [
          "Candlestick",
          "Knight",
          "Lead Pipe",
          "Revolver",
          "Rope",
          "Wrench",
        ].includes(card)
      ) {
        continue;
      }
    }

    if (card === "key") {
      if (towerKeyCount() >= 3) {
        continue;
      }
    }
    if (card === "ore") {
      if (!needOre()) {
        continue;
      }
    }
    if (in_theSource() && card === `${myPrimestat()} stat`) {
      continue;
    }
    if (
      in_wotsf() &&
      [
        "Candlestick",
        "Knife",
        "Lead Pipe",
        "Revolver",
        "Rope",
        "Wrench",
      ].includes(card)
    ) {
      continue;
    }
    if (card === "1952 Mickey Mantle" && (myMeat() >= 20000 || in_wotsf())) {
      continue;
    }
    if (count_1 >= 3) {
      break;
    }
    if (deck_cheat(card)) {
      count_1 += 1;
    } else {
      auto_log_error(
        "Could not draw card for some reason, we may be stuck in a choice adventure.",
      );
      auto_abort(
        "Failure when drawing cards, if any were drawn, the rest will NOT be drawn. Draw them and resume.",
      );
    }
  }

  if (action === "" && myMeat() < 10000) {
    auto_autosell(
      min(1, itemAmount($item`1952 Mickey Mantle card`)),
      $item`1952 Mickey Mantle card`,
    );
  }

  if (action === "farming" || action === "turns") {
    let count_2: number = itemAmount($item`blue mana`);
    while (count_2 > 0 && get("_ancestralRecallCasts") < 10) {
      useSkill(1, $skill`Ancestral Recall`);
      count_2 -= 1;
    }
  }

  return true;
}
