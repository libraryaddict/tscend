import {
  availableAmount,
  heartstoneMiddleLetter,
  Item,
  itemAmount,
  lastMonster,
  Location,
  myFamiliar,
  spleenLimit,
} from "kolmafia";
import { $familiar, $item, $location, $skill, get, have } from "libram";

import { AutoEternityCodpiece, BatWings, CandyCane } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import {
  canChangeToFamiliar,
  pathAllowsChangingFamiliar,
  pathHasFamiliar,
} from "../../auto_familiar";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_locationMonsters,
  internalQuestStatus,
} from "../../auto_util";
import { auto_canUse } from "../../combat/auto_combat_util";
import { getIncompleteQuestTasks, taskLocations } from "../../engine/engine";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { L10_needAmuletOfPlotSignificance } from "../../quests/level_10";
import { L11_needDrumMachine, L11_needWetStew } from "../../quests/level_11";

export function haveHeartstone(): boolean {
  if (!auto_is_valid($item`Heartstone`)) {
    return false;
  }
  if (possessEquipment($item`Heartstone`)) {
    return true;
  }
  return false;
}

export function getItemToEquipHeartstone(): Item {
  if (
    AutoEternityCodpiece.haveEternityCodpiece() &&
    AutoEternityCodpiece.isInEternityCodpiece($item`Heartstone`)
  ) {
    return $item`The Eternity Codpiece`;
  }
  if (haveHeartstone()) {
    return $item`Heartstone`;
  }
  return $item.none;
}

export function heartstoneLuckRemaining(): number {
  if (!haveHeartstone()) {
    return 0;
  }
  if (!get("heartstoneLuckUnlocked")) {
    return 0;
  }

  if (get("_heartstoneLuckUsed")) {
    return 0;
  }
  return 1;
}

function auto_heartstoneWordsToAimFor(): string[] {
  // This function could be better, instead of being greedy
  // It also doesn't consider what we can realistically encounter
  const words: string[] = [];

  // Try to learn these skills, unless we are low karma, then only LUCK
  for (const [prop, word, always] of [
    ["heartstoneBanishUnlocked", "GONE", false],
    ["heartstoneBuffUnlocked", "BUFF", false],
    ["heartstoneKillUnlocked", "KILL", false],
    ["heartstoneLuckUnlocked", "LUCK", true],
    ["heartstonePalsUnlocked", "PALS", false],
    ["heartstoneStunUnlocked", "STUN", false],
  ] as [string, string, boolean][]) {
    if (!always && get("bankedKarma") < 1000) continue;

    if (get(prop) === "false") words.push(word);
  }

  if (L11_needDrumMachine()) words.push("DRUM");

  if (L10_needAmuletOfPlotSignificance()) words.push("PLOT");

  // Copy / YR
  if (auto_is_valid($item`viral video`)) {
    words.push("TAPE");
  }
  // Free run + 30 turn banish
  if (auto_is_valid($item`handful of split pea soup`)) {
    words.push("SOUP");
  }

  if (
    auto_is_valid($item`grim fairy tale`) &&
    !isActuallyEd() &&
    spleenLimit() >= 3
  ) {
    words.push("TALE");
  }

  if (L11_needWetStew()) {
    words.push("STEW");
  }

  // TOMB hasn't performed well, especially when we need 10.

  if (
    itemAmount($item`enchanted bean`) === 0 &&
    internalQuestStatus("questL10Garbage") < 2 &&
    !BatWings.haveBatWings()
  ) {
    words.push("PLOT");
  }

  if (
    !CandyCane.haveCCSC() &&
    !availableAmount($item`eleven-foot pole`) &&
    !canChangeToFamiliar($familiar`Gelatinous Cubeling`)
  ) {
    words.push("POLE");
  }

  if (!have($item`savings bond`) && auto_is_valid($item`savings bond`)) {
    words.push("BOND");
  }

  if (
    !have($item`the most dangerous bait`) &&
    auto_is_valid($item`the most dangerous bait`)
  ) {
    words.push("MOST");
  }

  // Go for +fam if we can
  if (pathHasFamiliar() && !in_avantGuard()) {
    words.push(
      "CUTE",
      "WARM",
      "ROCK",
      "WEEK",
      "GRIN",
      "CHOW",
      "LOVE",
      "WITH",
      "WITH",
      "JIVE",
      "GLOW",
      "BLUE",
      "FOOT",
      "BLUE",
      "FLAG",
    );

    if (pathAllowsChangingFamiliar() && myFamiliar().experience < 350) {
      words.push("SLOW");
    }
  }

  // Some item drop
  words.push(
    "WIDE",
    "BETA",
    "FIVE",
    "FAST",
    "RAVE",
    "GAME",
    "EVER",
    "HAVE",
    "RAIN",
    "SEEN",
    "FOOL",
    "HELD",
  );
  return words;
}

export function heartstoneCurrentWord(): string {
  let currentWord = get("heartstoneLetters").toUpperCase();
  // Ensure its always a word that's less than 4 chars
  currentWord = currentWord.slice(
    currentWord.length - (currentWord.length % 4),
  );
  return currentWord;
}

export function heartstoneShouldStealHeartInCombat(): boolean {
  if (!haveHeartstone() || !auto_canUse($skill`Steal Monster's Heart`)) {
    return false;
  }

  const letter = heartstoneMiddleLetter(lastMonster()).toUpperCase();

  // If we can't steal a heart
  if (letter === "") return false;

  const currentWord = heartstoneCurrentWord();
  const allWords = auto_heartstoneWordsToAimFor();

  // If this letter alone will sastify a word, always take it
  if (allWords.includes(currentWord + letter)) {
    return true;
  }

  const { letterChances } = auto_heartstoneLetterChances();

  let currentWordIsStillOnTrack = false;

  for (const word of allWords) {
    if (!word.startsWith(currentWord)) continue;

    const missingLetters = word.substring(currentWord.length).split("");

    let snipedALetter: boolean = false;
    // We have 100% chance of the current letter, so we don't check it
    if (missingLetters[0] === letter) {
      missingLetters.shift();
      snipedALetter = true;
    }

    const worstChanceOfAnyMissingLetter = missingLetters
      .map((l) => letterChances.get(l) ?? 0)
      .reduce((worst, chance) => Math.min(worst, chance), 1000);

    // Less than 5% chance of ever finding one of the missing letters -> not on track
    if (worstChanceOfAnyMissingLetter <= 5) continue;

    // We sniped the letter, which means if we steal this monster, we'd have progress
    if (snipedALetter) {
      return true;
    }

    currentWordIsStillOnTrack = true;
  }

  // The current word is valid, but, we would lose progress if we stole this letter
  if (currentWordIsStillOnTrack) {
    return false;
  }

  // The current word is a lost cause, return true if there's actually a word.
  return currentWord.length > 0;
}

export function heartstoneShouldEquipForStealHeart(
  location: Location,
): boolean {
  if (location === $location.none || location === $location`Noob Cave`) {
    return false;
  }

  if (!haveHeartstone() || !auto_is_valid$2($skill`Steal Monster's Heart`)) {
    return false;
  }

  const currentWord = heartstoneCurrentWord();
  const allWords = auto_heartstoneWordsToAimFor();

  const { letterChances, currentLocationLetters } =
    auto_heartstoneLetterChances(location);

  // Would fighting here plausibly give us progress towards a target word?
  // Is the current string leading to something?
  let currentWordPossible = false;

  for (const word of allWords) {
    if (!word.startsWith(currentWord)) continue;

    const missingLetters = word.substring(currentWord.length).split("");

    const worstChanceOfAnyMissingLetter = missingLetters
      .map((l) => letterChances.get(l) ?? 0)
      .reduce((worst, chance) => Math.min(worst, chance), 1000);

    // Less than 5% chance of ever finding one of the missing letters -> not achievable
    if (worstChanceOfAnyMissingLetter <= 5) continue;

    // The current word is clearly possible
    currentWordPossible = true;

    // If no letters here to be gained
    if ((currentLocationLetters.get(missingLetters[0]) ?? 0) <= 0) {
      continue;
    }
    // We would gain progress here
    return true;
  }

  // No candidate word we can make progress on here -> only worth it to dump
  // (fill with garbage) an existing word so we can start fresh next time
  return currentWord.length > 0 && !currentWordPossible;
}

/**
 * Compiles the chance of encountering each heartstone letter across every location tied to an incomplete quest task, optionally also tracking the chances specific to a single `location` of interest.
 *
 * This is a bit flawed, as it doesn't yet know what words are going to be more efficient to aim for, could be eyeing a d5 task on d1 for example.
 */
function auto_heartstoneLetterChances(location?: Location): {
  letterChances: Map<string, number>;
  currentLocationLetters: Map<string, number>;
} {
  const allLocations: Location[] = getIncompleteQuestTasks()
    .flatMap((t) => taskLocations(t))
    .filter(
      (l): l is Location =>
        !!l && l !== $location.none && l !== $location`Noob Cave`,
    );

  if (
    location &&
    location !== $location.none &&
    location !== $location`Noob Cave` &&
    !allLocations.includes(location)
  ) {
    allLocations.push(location);
  }

  const currentLocationLetters: Map<string, number> = new Map();
  const letterChances: Map<string, number> = new Map();

  for (const loc of allLocations) {
    if (loc.combatPercent <= 0) continue;

    for (const [monster, chance] of auto_locationMonsters(loc)) {
      if (chance <= 0 || monster.boss) continue;

      const letter = heartstoneMiddleLetter(monster);

      if (letter === "") continue;

      letterChances.set(letter, (letterChances.get(letter) ?? 0) + chance);

      if (loc === location) {
        currentLocationLetters.set(
          letter,
          (currentLocationLetters.get(letter) ?? 0) + chance,
        );
      }
    }
  }

  return { letterChances, currentLocationLetters };
}
