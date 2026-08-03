import { containsText, myDaycount, myTurncount } from "kolmafia";
import { get, set } from "libram";

import { combat_status_add, combat_status_check } from "./auto_combat_util";

//Path specific combat handling functions for Avatar of West of Loathing

//defined in /autoscend/combat/auto_combat_awol.ash
export function awol_combat_helper(page: string): void {
  //Let us self-contain this so it is quick to remove later.
  if (myDaycount() === 1 && myTurncount() < 10) {
    set("auto_noSnakeOil", 0);
  }

  if (
    containsText(
      page,
      "Your oil extractor is completely clogged up at this point",
    )
  ) {
    set("auto_noSnakeOil", myDaycount());
  }
  if (get("_oilExtracted") >= 100) {
    set("auto_noSnakeOil", myDaycount());
  }

  if (
    !combat_status_check("extractSnakeOil") &&
    get("auto_noSnakeOil", 0) === myDaycount()
  ) {
    combat_status_add("extractSnakeOil");
  }
}
