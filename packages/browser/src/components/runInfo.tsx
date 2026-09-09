import React, { useState } from "react";

import { RunInfoData } from "../types/types";
import TopBarButton from "./topBarButton";

const SORT_FIELDS = {
  turns: "Turns",
  adventures: "Adventures",
  combats: "Fights",
  noncombats: "Non-Combats",
} as const;

type SortField = keyof typeof SORT_FIELDS;

function RunInfo({
  data,
  onRefresh,
}: {
  data: RunInfoData;
  onRefresh: () => void;
}): React.JSX.Element {
  const [sortField, setSortField] = useState<SortField>("turns");

  const locations = data.locations
    .filter((loc) => loc[sortField] > 0)
    .sort(
      (a, b) => b[sortField] - a[sortField] || a.name.localeCompare(b.name),
    );

  return (
    <div className="runInfo">
      <TopBarButton label="Refresh" onClick={onRefresh} />
      <div className="infoGrid">
        {data.tiles.map((tile) => (
          <div className="infoTile" key={tile.label}>
            <div className="infoTileLabel">{tile.label}</div>
            <div className="infoTileValue">{tile.value}</div>
          </div>
        ))}
      </div>
      <h2>Locations Visited</h2>
      <div className="locationsHeaderRow">
        <span>Location</span>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
        >
          {Object.entries(SORT_FIELDS).map(([field, label]) => (
            <option key={field} value={field}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="locationsColumns">
        {locations.map((loc) => (
          <div className="locationRow" key={loc.name}>
            <span className="locationName">{loc.name}</span>
            <span className="locationTurns">{loc[sortField]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunInfo;
