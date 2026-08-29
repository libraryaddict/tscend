import {
  Location,
  myAscensions,
  myDaycount,
  myPath,
  myTurncount,
} from "kolmafia";
import { $locations, $path, get } from "libram";

import { autoscend_current_version } from "../../../kolmafia/src/autoscend/utils/migration";
import {
  RelayPage,
  RelayRunInfo,
  RunInfoData,
} from "../../../shared/src/relayTypes";

// Not imported from actually_ed_the_undying.ts, which drags in most of the quest engine.
function isActuallyEd(): boolean {
  return myPath() === $path`Actually Ed the Undying`;
}

export function getRunInfoData(): RunInfoData {
  const tiles = [
    { label: "Ascension", value: `${myAscensions()}` },
    { label: "Day", value: `${myDaycount()}` },
    { label: "Turns Played", value: `${myTurncount()}` },
    { label: "Path", value: myPath().toString() },
    { label: "Autoscend Version", value: autoscend_current_version() },
  ];

  if (isActuallyEd()) {
    tiles.push({
      label: "Combats",
      value: get("auto_edCombatCount").toString(),
    });
    tiles.push({
      label: "Combat Rounds",
      value: get("auto_edCombatRoundCount").toString(),
    });
  }

  const visited: Location[] = $locations
    .all()
    .filter((loc) => loc.turnsSpent > 0)
    .sort((a, b) => b.turnsSpent - a.turnsSpent);

  return {
    tiles,
    locations: visited.map((loc) => ({
      name: loc.toString(),
      turns: loc.turnsSpent,
    })),
  };
}

export function infoPage(): RelayPage {
  return {
    page: "Run Info",
    urlPath: "info",
    components: [{ type: "runinfo", data: getRunInfoData() } as RelayRunInfo],
  };
}
