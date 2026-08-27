import { haveEffect, inHardcore } from "kolmafia";
import { $effect } from "libram";

import { pathHasFamiliar } from "../../auto_familiar";
import { auto_abort, auto_runChoice } from "../../auto_util";

export function doghouseChoiceHandler(choice: number): void {
  if (choice === 1106) {
    // Wooof! Wooooooof! (Ghost Dog)
    if (
      (inHardcore() &&
        haveEffect($effect`Adventurer's Best Friendship`) > 120) ||
      (haveEffect($effect`Adventurer's Best Friendship`) > 30 &&
        pathHasFamiliar())
    ) {
      auto_runChoice(3); // ghost dog chow
    } else {
      auto_runChoice(2); // 30 turns of adventurer's best friendship
    }
  } else if (choice === 1107) {
    // Playing Fetch (Ghost Dog)
    auto_runChoice(1); // get tennis ball
  } else if (choice === 1108) {
    // Your Dog Found Something Again (Ghost Dog)
    auto_runChoice(3); // get other stuff as recommended by ASS
  } else {
    auto_abort("unhandled choice in doghouseChoiceHandler");
  }
}
