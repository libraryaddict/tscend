import { cliExecute, itemAmount, myFamiliar } from "kolmafia";
import { $familiar, $item, get } from "libram";

import { auto_have_familiar } from "../../auto_familiar";
import { auto_abort, auto_log_debug } from "../../auto_util";

function auto_haveJillOfAllTrades(): boolean {
  if (auto_have_familiar($familiar`Jill-of-All-Trades`)) {
    return true;
  }
  return false;
}

function getParsedCandleMode(): string {
  // returns candle mode which matches our familiar categories
  switch (get("ledCandleMode")) {
    case "disco":
      return "item";
    case "ultraviolet":
      return "meat";
    case "reading":
      return "stat";
    case "red":
      return "boss";
    default:
      return "unknown";
  }
}

export function handleJillOfAllTrades(): void {
  if (!auto_haveJillOfAllTrades() || itemAmount($item`LED candle`) === 0) {
    return;
  }
  // only bother to configure candle if Jill is equiped
  if (myFamiliar() !== $familiar`Jill-of-All-Trades`) {
    return;
  }

  const currentMode: string = getParsedCandleMode();
  // want to configure jill to have bonus of whatever fam type we last looked up
  const desiredCandleMode: string = get("auto_lastFamiliarLookupType");

  auto_log_debug(
    `Jill current mode: ${currentMode} and desired is ${desiredCandleMode}`,
  );
  if (currentMode === desiredCandleMode) {
    return;
  }

  switch (desiredCandleMode) {
    case "item":
    case "regen":
    case "init":
    case "gremlin":
    case "gremlins":
    case "yellowray":
      cliExecute("jillcandle item");
      break;
    case "meat":
      cliExecute("jillcandle meat");
      break;
    case "stat":
    case "drop":
      cliExecute("jillcandle stat");
      break;
    case "boss":
      cliExecute("jillcandle attack");
      break;
    default:
      auto_abort(
        "tried to configure Jill's LED Candle with a non-supported type",
      );
  }

  return;
}
