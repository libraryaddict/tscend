import { visitUrl, wait } from "kolmafia";
import { $item, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid, auto_log_info, auto_runChoice } from "../../auto_util";

export function getGuzzlrCocktailSet(): boolean {
  if (
    possessEquipment($item`Guzzlr tablet`) &&
    auto_is_valid($item`Guzzlr tablet`) &&
    !get("auto_skipGuzzlrCocktailSet", false)
  ) {
    if (
      get("guzzlrGoldDeliveries") >= 5 &&
      get("questGuzzlr") === "unstarted" &&
      get("_guzzlrPlatinumDeliveries") === 0 &&
      !get("_guzzlrQuestAbandoned")
    ) {
      auto_log_info(
        "Getting a Guzzlr Cocktail Set (for all the good it will do).",
      );
      visitUrl("inventory.php?tap=guzzlr", false);
      auto_runChoice(4); // take platinum quest
      wait(1); // mafia's tracking breaks occasionally if you go too fast.
      visitUrl("inventory.php?tap=guzzlr", false);
      auto_runChoice(1); // abandon
      auto_runChoice(5); // leave the choice.
      return true; // ponder on what else you could've spent the Mr. Accessory on instead.
    }
  }
  return false;
}
