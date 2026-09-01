import {
  availableAmount,
  cliExecute,
  Effect,
  getClanId,
  Item,
  min,
  toLowerCase,
} from "kolmafia";
import { $effect, $item, $items, get, have } from "libram";

import { AutoClan } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import { in_hattrick } from "../../paths/2025/hattrick";
import { auto_log_error } from "../../utils/auto_log";
import { auto_is_valid, handleTracker } from "../../utils/auto_util";

function auto_haveClanPhotoBoothHere(): boolean {
  return AutoClan.get_clan_lounge().has($item`photo booth sized crate`);
}

function auto_haveClanPhotoBooth(): boolean {
  if (availableAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (!auto_is_valid($item`photo booth sized crate`)) {
    return false;
  }
  if (auto_haveClanPhotoBoothHere()) {
    return true;
  }
  return AutoClan.canJumpToAwayClan(); // away clan has it fully stocked
}

function auto_isClanPhotoBoothItem(it: Item): boolean {
  switch (it) {
    case $item`photo booth supply list`:
    case $item`fake arrow-through-the-head`:
    case $item`fake huge beard`:
    case $item`astronaut helmet`:
    case $item`cheap plastic pipe`:
    case $item`oversized monocle on a stick`:
    case $item`giant bow tie`:
    case $item`feather boa`:
    case $item`Sheriff badge`:
    case $item`Sheriff pistol`:
    case $item`Sheriff moustache`:
      return true;
  }
  return false;
}

function auto_thisClanPhotoBoothHasItem(it: Item): boolean {
  // This should work but it's not implemented by Mafia, sounds like it won't be
  //~ return (auto_get_clan_lounge() contains it)
  // Instead just assume our away clan has everything, everyone else has nothing that needs unlocking
  if (AutoClan.isInAwayClan()) {
    return auto_isClanPhotoBoothItem(it);
  }
  switch (it) {
    case $item`photo booth supply list`:
    case $item`fake arrow-through-the-head`:
    case $item`fake huge beard`:
    case $item`astronaut helmet`:
      return true;
  }
  return false;
}

function auto_thisClanPhotoBoothHasItems(its: Item[]): boolean {
  let success: boolean = true;
  for (const it of its) {
    success = success && auto_thisClanPhotoBoothHasItem(it);
  }
  return false;
}

function auto_clanPhotoboothClaimedEverything(): boolean {
  return (
    get("_photoBoothEquipment") >= 3 &&
    auto_remainingClanPhotoBoothEffects() === 0
  );
}

// Claims a single item, assuming we're already wherever we need to be.
function auto_claimClanPhotoBoothItem(it: Item): boolean {
  if (!auto_isClanPhotoBoothItem(it)) {
    return false;
  }
  if (availableAmount(it) > 0) {
    return true;
  }
  if (auto_clanPhotoboothClaimedEverything()) {
    return false;
  }
  cliExecute(`photobooth item ${it.toString()}`);
  handleTracker({
    tracker: "iotmsUsed",
    iotm: "Clan Photo Booth",
    detail: `Claimed ${it}`,
  });
  return availableAmount(it) > 0;
}

function auto_remainingClanPhotoBoothEffects(): number {
  if (!auto_haveClanPhotoBooth()) {
    return 0;
  }
  return 3 - get("_photoBoothEffects");
}

// Claims an effect, assuming we're already wherever we need to be.
function auto_claimClanPhotoBoothEffect(
  ef_string: string,
  n_times: number,
): boolean {
  n_times = min(n_times, auto_remainingClanPhotoBoothEffects());
  if (n_times < 1) {
    return false;
  }

  const west_ef: Effect = $effect`Wild and Westy!`;
  const tower_ef: Effect = $effect`Towering Muscles`;
  const space_ef: Effect = $effect`Spaced Out`;
  const west_string: string = toLowerCase(west_ef.toString());
  const tower_string: string = toLowerCase(tower_ef.toString());
  const space_string: string = toLowerCase(space_ef.toString());

  switch (toLowerCase(ef_string)) {
    case "wild":
    case west_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect wild");
        handleTracker({
          tracker: "iotmsUsed",
          iotm: "Clan Photo Booth",
          detail: `Claimed ${west_ef}`,
        });
      }
      return have(west_ef);
    case "tower":
    case tower_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect tower");
        handleTracker({
          tracker: "iotmsUsed",
          iotm: "Clan Photo Booth",
          detail: `Claimed ${tower_ef}`,
        });
      }
      return have(tower_ef);
    case "space":
    case space_string:
      for (let i: number = 0; i < n_times; i++) {
        cliExecute("photobooth effect space");
        handleTracker({
          tracker: "iotmsUsed",
          iotm: "Clan Photo Booth",
          detail: `Claimed ${space_ef}`,
        });
      }
      return have(space_ef);
  }
  auto_log_error(`Invalid effect string for photo booth ${ef_string}`);
  return false;
}

// Claims the default items and the daily "space" effect together
export function getClanPhotoBoothDefaultItems(): boolean {
  if (!auto_haveClanPhotoBooth()) {
    return false;
  }
  let items_to_claim: Item[];
  if (!in_hattrick()) {
    items_to_claim = $items`fake arrow-through-the-head, astronaut helmet, oversized monocle on a stick`;
  } else {
    items_to_claim = $items`feather boa, astronaut helmet, oversized monocle on a stick`;
  }

  if (auto_clanPhotoboothClaimedEverything()) {
    return items_to_claim.every((i) => possessEquipment(i));
  }

  const needAway =
    !auto_haveClanPhotoBoothHere() ||
    !auto_thisClanPhotoBoothHasItems(items_to_claim);

  const origClanId: number = getClanId();

  try {
    if (needAway && !AutoClan.isInAwayClan() && AutoClan.canJumpToAwayClan()) {
      AutoClan.changeClan(AutoClan.getAwayClanName());
    }

    let success: boolean = true;
    for (const it of items_to_claim) {
      success = success && auto_claimClanPhotoBoothItem(it);
    }
    auto_claimClanPhotoBoothEffect("space", 3);
    return success;
  } finally {
    if (getClanId() !== origClanId) {
      AutoClan.changeClan(origClanId);
    }
  }
}
