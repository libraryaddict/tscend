import { myAscensions, write } from "kolmafia";
import { get, set } from "libram";

import {
  auto_settings,
  auto_settingsApplyResets,
} from "../../kolmafia/src/autoscend/auto_settings";
import { infoPage } from "./pages/info";
import { settingsPage } from "./pages/settings";
import { trackedPage } from "./pages/tracked";
import { generateHTML } from "./relayUtils";

// Path-specific initialization is left to the script, which would otherwise link the
// entire quest engine into this relay bundle.
function applyAscensionResets(): void {
  const ascension = myAscensions();

  if (
    ascension === get("auto_doneInitialize", 0) ||
    ascension === get("auto_doneRelayInitialize", 0)
  ) {
    return;
  }

  auto_settingsApplyResets("day", "ascend");
  set("auto_doneRelayInitialize", ascension);
}

export function main(): void {
  auto_settings();
  applyAscensionResets();

  write(generateHTML([settingsPage(), trackedPage(), infoPage()]));
}
