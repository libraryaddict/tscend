import { Location, myDaycount, sessionLogs } from "kolmafia";

export interface LocationLogStats {
  adventures: number;
  combats: number;
  noncombats: number;
}

const RUN_START_MARKERS = ["Beginning New Ascension", "Ascend as a"];
const locations: Map<string, Location> = new Map(
  Location.all().map((l) => [l.toString(), l]),
);

function normalizeLocation(name: string, previous: string): string {
  if (name.includes("The Typical Tavern")) return "The Tavern Cellar";
  if (name.includes("The Daily Dungeon")) return "The Daily Dungeon";
  if (name.includes("Tower Level")) return "The Naughty Sorceress' Tower";
  return locations.has(name) ? name : previous;
}

function currentRunLines(): string[] {
  const logs = sessionLogs(myDaycount()).slice().reverse();
  const lines = logs.join("\n").split("\n");
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (RUN_START_MARKERS.some((marker) => lines[i].includes(marker))) {
      start = i;
    }
  }
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (/^\[\d+\] Freeing King Ralph$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end);
}

export function locationLogStats(): Map<string, LocationLogStats> {
  const stats = new Map<string, LocationLogStats>();
  const statsFor = (name: string): LocationLogStats => {
    let entry = stats.get(name);
    if (!entry) {
      entry = { adventures: 0, combats: 0, noncombats: 0 };
      stats.set(name, entry);
    }
    return entry;
  };

  let location = "";
  let previousTurn = -1;
  let free = false;
  let sawEncounter = false;
  let sawRound = false;

  const finishTurn = () => {
    if (location === "") return;
    const entry = statsFor(location);
    if (!free) entry.adventures++;
    if (sawRound) entry.combats++;
    else if (sawEncounter) entry.noncombats++;
  };

  for (const line of currentRunLines()) {
    const turnMatch = /^\[(\d+)\] (.+)$/.exec(line);
    if (turnMatch) {
      finishTurn();
      const turn = parseInt(turnMatch[1]);
      free = turn === previousTurn;
      previousTurn = turn;
      location = normalizeLocation(turnMatch[2].trim(), location);
      sawEncounter = false;
      sawRound = false;
    } else if (line.startsWith("Encounter: ")) {
      sawEncounter = true;
    } else if (/^Round \d+:/.test(line)) {
      sawRound = true;
    }
  }
  finishTurn();

  return stats;
}
