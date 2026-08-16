import {
  lastMonster,
  myAdventures,
  myBasestat,
  pullsRemaining,
  turnsPlayed,
} from "kolmafia";
import { $stats } from "libram";

import { auto_abort, auto_log_warning } from "../auto_util";

let monitored: string[] = [];
let repeatsSeen = 0;
let hasAborted = false;

function grabMonitored(): string[] {
  return [
    `Adventures: ${myAdventures()}`,
    `Turns Played: ${turnsPlayed()}`,
    `Last Monster: ${lastMonster()}`,
    ...$stats`SubMuscle, SubMysticality, SubMoxie`.map(
      (s) => `${s}: ${myBasestat(s)}`,
    ),
    ...(pullsRemaining() > 0 ? [`Pulls Left: ${pullsRemaining()}`] : []),
  ];
}

export function checkIfRepeating(
  previous: string[] = grabMonitored(),
): boolean {
  if (monitored.length !== previous.length) return false;

  return monitored.every((str, ind) => previous[ind] === str);
}

export function getRepeats(): number {
  return repeatsSeen;
}

export function abortIfRepeating(limit: number = 100) {
  if (hasAborted) return;

  const thisAdv = grabMonitored();

  // If same length array, and all the objects are the same
  if (checkIfRepeating(thisAdv)) {
    repeatsSeen++;
  } else {
    repeatsSeen = 0;
  }

  monitored = thisAdv;

  if (repeatsSeen < limit) {
    const quart = Math.floor(limit / 4);
    // At 25%, 50% and 75%, print a warning
    if (repeatsSeen > 0 && repeatsSeen % quart === 0) {
      auto_log_warning(
        `Infinite loop detector is at ${repeatsSeen} / ${limit}`,
      );
    }

    return;
  }

  hasAborted = true;
  auto_abort(
    `Our state has unchanged in the last ${limit} times we checked this, which suggests that we are caught in an infinite loop. Stopping autoscend. Our state: ${grabMonitored().join(", ")}`,
  );
}
