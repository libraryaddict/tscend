import { write } from "kolmafia";

import { initializeSettings } from "../../kolmafia/src/autoscend";
import { auto_settings } from "../../kolmafia/src/autoscend/auto_settings";
import { infoPage } from "./pages/info";
import { settingsPage } from "./pages/settings";
import { trackedPage } from "./pages/tracked";
import { generateHTML } from "./relayUtils";

export function main(): void {
  auto_settings();
  initializeSettings(true);

  write(generateHTML([settingsPage(), trackedPage(), infoPage()]));
}
