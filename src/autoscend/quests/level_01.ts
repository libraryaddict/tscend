import {
  abort,
  canInteract,
  cliExecute,
  council,
  getProperty,
  itemAmount,
  min,
  use,
  visitUrl,
} from "kolmafia";
import { $item } from "libram";

import { auto_autosell } from "../auto_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";

//Defined in autoscend/quests/level_01.ash
export function tootOriole(): void {
  // Toot Oriole must be visited each ascension to unlock other quests from the council
  if (getProperty("questM05Toot") === "finished") {
    return;
  }
  // do quest
  visitUrl("tutorial.php?action=toot");
  if (isActuallyEd()) {
    use(
      itemAmount($item`letter to Ed the Undying`),
      $item`letter to Ed the Undying`,
    );
  } else {
    use(
      itemAmount($item`letter from King Ralph XI`),
      $item`letter from King Ralph XI`,
    );
  }
  // finishing toot quest is not correctly noticed by mafia. r20655 has workaround of correcting this by refreshing quests
  cliExecute("refresh quests");

  if (getProperty("questM05Toot") === "finished") {
    use(itemAmount($item`pork elf goodies sack`), $item`pork elf goodies sack`);
    council();
  } else {
    abort(
      "Failed to finish the Toot Oriole quest. This prevents us from getting other quests from council",
    );
  }
}

export function tootGetMeat(): void {
  if (canInteract() || in_wotsf()) {
    // avoid selling gems in casual and way of the surprising fist
    return;
  }
  auto_autosell(min(5, itemAmount($item`hamethyst`)), $item`hamethyst`);
  auto_autosell(min(5, itemAmount($item`baconstone`)), $item`baconstone`);
  auto_autosell(min(5, itemAmount($item`porquoise`)), $item`porquoise`);
}
