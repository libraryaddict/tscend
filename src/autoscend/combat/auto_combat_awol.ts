import {
  containsText,
  getProperty,
  myDaycount,
  myTurncount,
  setProperty,
  toInt,
} from "kolmafia";
import { combat_status_add, combat_status_check } from "./auto_combat_util";

//Path specific combat handling functions for Avatar of West of Loathing

//defined in /autoscend/combat/auto_combat_awol.ash
export function awol_combat_helper(page: string): void {
  //Let us self-contain this so it is quick to remove later.
  if (myDaycount() === 1 && myTurncount() < 10) {
    setProperty("auto_noSnakeOil", (0).toString());
  }

  if (
    containsText(
      page,
      "Your oil extractor is completely clogged up at this point",
    )
  ) {
    setProperty("auto_noSnakeOil", myDaycount().toString());
  }
  if (toInt(getProperty("_oilExtracted")) >= 100) {
    setProperty("auto_noSnakeOil", myDaycount().toString());
  }

  if (
    !combat_status_check("extractSnakeOil") &&
    toInt(getProperty("auto_noSnakeOil")) === myDaycount()
  ) {
    combat_status_add("extractSnakeOil");
  }
}
