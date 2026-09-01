import { myDaycount, myPath } from "kolmafia";
import { $path } from "libram";

import {
  auto_abort,
  auto_log_error,
  auto_log_info,
} from "../../utils/auto_log";

//Defined in autoscend/paths/grey_goo.ash
export function in_ggoo(): boolean {
  return myPath() === $path`Grey Goo`;
}

export function LA_grey_goo_tasks(): boolean {
  if (!in_ggoo()) {
    return false;
  }

  auto_log_error(
    "Adventuring in Grey Goo is not currently supported, or necessary. Have fun!",
  );
  if (myDaycount() >= 3) {
    auto_log_info(
      "You made it beyond the dawn of the third day and can now ascend. Congratulations!",
      "blue",
    );
    auto_abort();
  }
  auto_abort(`Please come back in ${3 - myDaycount()} days.`);
  return true;
}
