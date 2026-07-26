import React from "react";
import { createRoot } from "react-dom/client";

import {
  hydrateSettingValues,
  hydrateTrackingSections,
} from "./api/apiRequest";
import App from "./app";
import { RelayPage } from "./types/types";

getData((pages: RelayPage[]) => {
  Promise.all([
    hydrateSettingValues(pages),
    hydrateTrackingSections(pages),
  ]).then(() => {
    const container = document.getElementById("root");

    const root = createRoot(container!);
    root.render(<App pages={pages} />);
  });
});
