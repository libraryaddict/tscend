import React from "react";

import { RunInfoData } from "../types/types";
import TopBarButton from "./topBarButton";

function RunInfo({
  data,
  onRefresh,
}: {
  data: RunInfoData;
  onRefresh: () => void;
}): React.JSX.Element {
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
        <span>Turns</span>
      </div>
      <div className="locationsColumns">
        {data.locations.map((loc) => (
          <div className="locationRow" key={loc.name}>
            <span className="locationName">{loc.name}</span>
            <span className="locationTurns">{loc.turns}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunInfo;
