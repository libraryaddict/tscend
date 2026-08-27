import { max } from "kolmafia";
import { $item, $location, get } from "libram";

import { autoAdv } from "../../auto_adventure";
import { auto_is_valid } from "../../auto_util";

export function auto_hasSpeakEasy(): boolean {
  return auto_is_valid($item`deed to Oliver's Place`) && get("ownsSpeakeasy");
}

export function auto_remainingSpeakeasyFreeFights(): number {
  if (!auto_hasSpeakEasy()) {
    return 0;
  }
  return max(3 - get("_speakeasyFreeFights"), 0);
}

export function speakeasyCombat(): boolean {
  if (!auto_hasSpeakEasy()) {
    return false;
  }

  if (auto_remainingSpeakeasyFreeFights() > 0) {
    return autoAdv($location`An Unusually Quiet Barroom Brawl`);
  }
  return false;
}
