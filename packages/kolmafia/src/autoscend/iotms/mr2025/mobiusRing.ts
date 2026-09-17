import {
  availableChoiceOptions,
  getProperty,
  haveEffect,
  Item,
  itemAmount,
  myAdventures,
  myBasestat,
  myBuffedstat,
  myClass,
  myDaycount,
  myLevel,
  myMaxhp,
  myParadoxicity,
  myPrimestat,
  setProperty,
  Stat,
  toInt,
  turnsPlayed,
  turnsUntilMobiusNoncombatAvailable,
  use,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $stat, get } from "libram";

import { auto_advToReserve } from "../../../autoscend";
import { auto_canEat } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { in_amw } from "../../paths/2026/adventurer_meats_world";
import {
  auto_is_valid,
  auto_runChoice,
  handleTracker,
  stat_to_substat,
} from "../../utils/auto_util";

export function haveMobiusRing(): boolean {
  const ring: Item = $item`Möbius ring`;
  return auto_is_valid(ring) && possessEquipment(ring);
}

function auto_paradoxicity(): number {
  // we either need to visit the charpane or status.php to update this
  visitUrl("charpane.php", false);
  return myParadoxicity();
}

export function timeIsAStripPossible(): boolean {
  if (!haveMobiusRing()) {
    return false;
  }

  return turnsUntilMobiusNoncombatAvailable() === 0;
}

// List of choices that we explicitly checked for
const gameKnownPref: string = "mobiusRingGameKnown";
// List of choices that we never tried to acknowledge
const scriptKnownPref: string = "mobiusRingScriptKnown";
const choicesScriptKnowsButGameDoesnt = "mobiusRingScriptKnowsGameDoesnt";
const choicesGameKnowsButScriptDoesnt = "mobiusRingGameKnowsScriptDoesnt";

export function mobiusChoiceHandler(choice: number, page: string): void {
  const gameKnownChoices: string[] = getProperty(gameKnownPref)
    .split("|")
    .filter(Boolean);
  const scriptKnownChoices: string[] = getProperty(scriptKnownPref)
    .split("|")
    .filter(Boolean);
  try {
    if (!haveMobiusRing()) {
      auto_runChoice(1); //should never get here but might as well mitigate
    }

    const choices: Map<number, string> = new Map(
      Object.entries(availableChoiceOptions()).map(([_k, _v]) => [
        toInt(_k),
        _v,
      ]),
    );

    const actualChoiceMap: Map<string, number> = new Map();
    for (const [idx, text] of choices) {
      actualChoiceMap.set(text, idx);
    }

    // Add to the list the choices we know
    for (const s of actualChoiceMap.keys()) {
      if (gameKnownChoices.includes(s)) continue;
      gameKnownChoices.push(s);
    }

    const choiceMap = {
      has: (key: string) => {
        // Add to the list the choices we checked
        if (!scriptKnownChoices.includes(key)) {
          scriptKnownChoices.push(key);
        }

        return actualChoiceMap.has(key);
      },
    };

    function mobiusChoice(opt: string): void {
      const num: number = actualChoiceMap.get(opt) ?? 0;
      handleTracker({
        tracker: "iotmsUsed",
        iotm: $item`Möbius ring`,
        detail: opt,
      });
      auto_runChoice(num);
    }

    let pos: string;
    // must... get... meat... (probably temporary)
    if (in_amw()) {
      pos = "Give your past self investment tips";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
      if (myDaycount() > 1) {
        pos = "Hey, free gun!";
        if (choiceMap.has(pos)) {
          mobiusChoice(pos);
          return;
        }
      }
      pos = "Take the long odds on the trifecta";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      } else {
        pos = "Fix the race and also fix the race";
        mobiusChoice(pos);
        return;
      }
    }
    // we want to get +15 paradoxicity for more time cops and the 13-paradoxicity +item effect
    // in a single day, we'll hit the NC maybe 9 times
    // we can't guarantee we'll be able to use the effects, but the items are good
    // taking the long odds would be good if we can definitely remove the effect / handle the HP loss

    if (isAboutToPowerlevel()) {
      // if we're going to powerlevel, we want the +stat%, +stat and direct stat options
      pos = "Bake Susie a cupcake";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
      pos = "Draw a goatee on yourself";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
      switch (myPrimestat()) {
        case $stat`Muscle`:
          pos = "Lift yourself up by your bootstraps";
          if (choiceMap.has(pos)) {
            mobiusChoice(pos);
            return;
          }
          break;
        case $stat`Mysticality`:
          pos = "Mind your own business";
          if (choiceMap.has(pos)) {
            mobiusChoice(pos);
            return;
          }
          break;
        case $stat`Moxie`:
          pos = "Shoot yourself in the foot";
          if (choiceMap.has(pos)) {
            mobiusChoice(pos);
            return;
          }
          break;
      }
    }
    // cupcake is 5-7 adv for 1 full, +1 paradox
    if (auto_canEat($item`Susie's cupcake`)) {
      pos = "Steal a cupcake from young Susie";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
    }
    const shouldFarmParadoxity =
      timeCopFights() <= 6 &&
      myAdventures() - auto_advToReserve() >= 30 &&
      auto_paradoxicity() > 10;

    // first clock per day gives 3 adventures, second gives 2
    if (get("_clocksUsed") < 2) {
      pos = "Go back and set an alarm";
      // Only grab an alarm if we're running low on advs, have fought 5 cops already, or have good paradoxicity
      if (choiceMap.has(pos) && !shouldFarmParadoxity) {
        mobiusChoice(pos);
        if (itemAmount($item`clock`) > 0) {
          use(1, $item`clock`);
        }
        return;
      }
      // gives +15 myst, +30 MP: rarely useful but sets up the clock
      pos = "Go back and take a 20-year-long nap";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
    }
    // 100 turns of +5 fam xp is worth refreshing
    if (
      haveEffect($effect`Lifted by your Bootstraps`) === 0 &&
      (turnsPlayed() < 50 || !shouldFarmParadoxity)
    ) {
      pos = "Let yourself get lifted up by your bootstraps";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
    }

    if (auto_paradoxicity() < 15) {
      // We prioritize our mainstat a bit more, but otherwise we try to raise our lowest stat
      const statChoices: [string, number][] = (
        [
          ["Mind your own business", $stat`Mysticality`],
          ["Lift yourself by your bootstraps", $stat`Muscle`],
          ["Shoot yourself in the foot", $stat`Moxie`],
        ] as [string, Stat][]
      ).map(([choice, stat]) => [
        choice,
        myBasestat(stat_to_substat(stat)) *
          (stat === myClass().primestat ? 0.7 : 1),
      ]);
      statChoices.sort(([, s1], [, s2]) => s1 - s2);
      // take paradox-increasing options without negative effects in approximate utility order
      // some would have been taken earlier, so taking them here implies they're less useful
      for (const str of [
        "Stop your arch-nemesis as a baby",
        "Borrow meat from your future",
        "Hey, free gun!",
        ...statChoices.map(([s]) => s),
        "Draw a goatee on yourself",
        "Go for a nature walk",
        "Steal a cupcake from young Susie",
        "Plant some trees and harvest them in the future",
        "Borrow a cup of sugar from yourself",
        "Steal a club from the past",
        "Go back and take a 20-year-long nap",
        "Plant some seeds in the distant past",
        "Go back and write a best-seller.",
        "Defend yourself",
        "Play Schroedinger's Prank on yourself",
        "Peek in on your future",
        "Give your past self investment tips",
      ]) {
        if (choiceMap.has(str)) {
          mobiusChoice(str);
          return;
        }
      }

      // If we're of sufficient stats that it doesn't matter if we're nerfed by ~30 loss of hp and mus
      if (
        myLevel() >= 13 &&
        myMaxhp() >= 400 &&
        Math.min(myBasestat($stat`Muscle`), myBuffedstat($stat`Muscle`)) >= 100
      ) {
        pos = "Cheeze it, it's the pigs!";
        if (choiceMap.has(pos)) {
          mobiusChoice(pos);
          return;
        }
      }
    }
    // we've done everything we care about, find a loop
    if (auto_canEat($item`Susie's cupcake`)) {
      pos = "Steal a cupcake from young Susie";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
      pos = "Bake Susie a cupcake";
      if (choiceMap.has(pos)) {
        mobiusChoice(pos);
        return;
      }
    }
    // meat is normally useful
    pos = "Borrow meat from your future";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }
    pos = "Repay yourself in the past";
    if (choiceMap.has(pos)) {
      mobiusChoice(pos);
      return;
    }

    auto_runChoice(1);
    return;
  } finally {
    setProperty(gameKnownPref, gameKnownChoices.join("|"));
    setProperty(scriptKnownPref, scriptKnownChoices.join("|"));

    // The bottom two are used for "These may be illegal"
    setProperty(
      choicesGameKnowsButScriptDoesnt,
      gameKnownChoices.filter((c) => !scriptKnownChoices.includes(c)).join("|"),
    );
    setProperty(
      choicesScriptKnowsButGameDoesnt,
      scriptKnownChoices.filter((c) => !gameKnownChoices.includes(c)).join("|"),
    );
  }
}

export function timeCopFights(): number {
  return get("_timeCopsFoughtToday");
}
