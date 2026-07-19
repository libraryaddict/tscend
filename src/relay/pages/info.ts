import {
  entityEncode,
  getProperty,
  Location,
  myAscensions,
  myDaycount,
  myPath,
  myTurncount,
} from "kolmafia";
import { $locations } from "libram";

import { autoscend_current_version } from "../../kolmafia/autoscend/autoscend_migration";
import { isActuallyEd } from "../../kolmafia/autoscend/paths/actually_ed_the_undying";
import { RelayPage } from "../../shared/relayTypes";
import { html } from "../relayUtils";

function infoTile(label: string, value: string) {
  return (
    `<div class="infoTile"><div class="infoTileLabel">${entityEncode(label)}</div>` +
    `<div class="infoTileValue">${entityEncode(value)}</div></div>`
  );
}

export function infoPage(): RelayPage {
  const tiles: string[] = [
    infoTile("Ascension", `${myAscensions()}`),
    infoTile("Day", `${myDaycount()}`),
    infoTile("Turns Played", `${myTurncount()}`),
    infoTile("Path", myPath().toString()),
    infoTile("Autoscend Version", autoscend_current_version()),
  ];

  if (isActuallyEd()) {
    tiles.push(infoTile("Combats", getProperty("auto_edCombatCount")));
    tiles.push(
      infoTile("Combat Rounds", getProperty("auto_edCombatRoundCount")),
    );
  }

  const visited: Location[] = $locations
    .all()
    .filter((loc) => loc.turnsSpent > 0)
    .sort((a, b) => b.turnsSpent - a.turnsSpent);

  const rows = visited
    .map(
      (loc) =>
        `<tr><td>${entityEncode(loc.toString())}</td><td>${loc.turnsSpent}</td></tr>`,
    )
    .join("");

  return {
    page: "Run Info",
    urlPath: "info",
    components: [
      html(`<div class="infoGrid">${tiles.join("")}</div>`),
      html(
        "<h2>Locations Visited</h2>" +
          '<table class="locationsTable"><tr><th>Location</th><th>Turns</th></tr>' +
          `${rows}</table>`,
      ),
    ],
  };
}
