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
      <table className="locationsTable">
        <tbody>
          <tr>
            <th>Location</th>
            <th>Turns</th>
          </tr>
          {data.locations.map((loc) => (
            <tr key={loc.name}>
              <td>{loc.name}</td>
              <td>{loc.turns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RunInfo;
