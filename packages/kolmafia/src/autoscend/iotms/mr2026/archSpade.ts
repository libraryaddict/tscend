import {
  availableAmount,
  canEat,
  cliExecute,
  extractItems,
  fullnessLimit,
  haveCampground,
  Item,
  Location,
  myFullness,
  myLocation,
  visitUrl,
} from "kolmafia";
import { $item, $location, get } from "libram";

import { auto_unreservedAdvRemaining } from "../../../autoscend";
import { autoAdvBypass } from "../../auto_adventure";
import { haveFreeRestAvailable } from "../../auto_restore";
import {
  auto_abort,
  auto_get_campground,
  auto_is_valid,
  auto_log_error,
  handleTracker,
  safeGet,
  set_next_fight_is_free,
} from "../../auto_util";
import { zone_delay } from "../../auto_zone";
import { in_small } from "../../paths/2023/small";
import { is_werewolf } from "../../paths/2024/wereprofessor";

export function auto_haveElfToilet(): boolean {
  return (
    auto_is_valid($item`Archaeologist's Spade`) &&
    !is_werewolf() && // Werewolf doesn't have campground?
    !in_small() &&
    canEat() &&
    fullnessLimit() > 1 &&
    haveCampground() &&
    // Coerce to a boolean
    !!auto_get_campground().get($item`Pork Elf toilet`)
  );
}

export function auto_elfToiletReady(freeOnly: boolean = true): boolean {
  return (
    auto_haveElfToilet() &&
    myFullness() > 1 &&
    !get("_porkElfToiletUsed") &&
    (haveFreeRestAvailable() || (!freeOnly && auto_unreservedAdvRemaining()))
  );
}

export function auto_useElfToilet(): boolean {
  // Elf toilet requires campground, but takes priority over any other rest site while it's ready.
  cliExecute("campground rest campground");

  if (!get("_porkElfToiletUsed") || auto_elfToiletReady()) {
    auto_abort(`Expected elf toilet to have been used, but was not.`);
  }

  return true;
}

export function auto_haveArchaeologistSpade(): boolean {
  if (
    auto_is_valid($item`Archaeologist's Spade`) &&
    availableAmount($item`Archaeologist's Spade`) > 0
  ) {
    return true;
  }
  return false;
}

export function auto_spadeDigsRemaining(): number {
  if (!auto_haveArchaeologistSpade()) {
    return 0;
  }

  return 11 - get("_archSpadeDigs");
}

export function auto_spadeDigItem(): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 1;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    visitUrl(use_url);
    const result_1: string = visitUrl(choice_url);
    const drops: Map<Item, number> = new Map(
      Object.entries(extractItems(result_1)).map(([_k, _v]) => [
        Item.get(_k),
        _v,
      ]),
    );
    let my_drop: Item = $item.none;
    let total_items_dropped: number = 0;
    for (const [it, n] of drops) {
      my_drop = it;
      total_items_dropped += n;
    }
    if (total_items_dropped !== 1) {
      auto_log_error(
        `Seem to have got ${total_items_dropped} from spade dig nearby, expecting 1.`,
      );
      handleTracker({
        what: SPADE,
        location: myLocation(),
        detail: `Dig up something nearby reported ${total_items_dropped} drops`,
        property: "auto_otherstuff",
      });
      return total_items_dropped !== 0;
    }
    if (n_digs > auto_spadeDigsRemaining()) {
      // check we actually have fewer digs left now before returning
      handleTracker({
        what: SPADE,
        location: myLocation(),
        detail: `Dig up something nearby - ${my_drop}`,
        property: "auto_otherstuff",
      });
      return true;
    }
    handleTracker({
      what: SPADE,
      location: myLocation(),
      detail: "FAILED: Dig up something nearby",
      property: "auto_otherstuff",
    });
  }
  return false;
}

function auto_spadeDigAncient(): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 2;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;
  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    visitUrl(use_url);
    visitUrl(choice_url);
    if (n_digs > auto_spadeDigsRemaining()) {
      // check we actually have fewer digs left now before returning
      handleTracker({
        what: SPADE,
        location: myLocation(),
        detail: "Dig up something ancient",
        property: "auto_otherstuff",
      });
      return true;
    }
  }
  return false;
}

export function auto_spadeDigSkeleton(place: Location): boolean {
  const SPADE: Item = $item`Archaeologist's Spade`;
  const choice_adv_num: number = 1596;
  const choice_num: number = 3;
  const choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
  const use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

  const n_digs: number = auto_spadeDigsRemaining();
  if (n_digs > 0) {
    const pages: Map<number, string> = new Map();
    pages.set(0, use_url);
    pages.set(1, choice_url);
    const loc: Location = myLocation();
    try {
      set_next_fight_is_free();
      if (autoAdvBypass(0, pages, place)) {
        handleTracker({
          what: SPADE,
          location: loc,
          detail: `Dig up a skeleton`,
          property: "auto_otherstuff",
        });
        return true;
      }
      handleTracker({
        what: SPADE,
        location: loc,
        detail: "FAILED: Dig up a skeleton",
        property: "auto_otherstuff",
      });
    } finally {
      // Reset the flag
      set_next_fight_is_free(false);
    }
  }
  return false;
}

export function auto_wantToSpadeDigSkeleton(loc: Location): boolean {
  // haunted kitchen is the only zone that calls auto_spadeDigSkeleton() and does not call this function
  // (because it's the only non-delay zone currently supported)
  const valid_loc: boolean = spadeDelayZones().includes(loc);
  const have_digs: boolean = auto_spadeDigsRemaining() > 0;
  const delay_left: boolean = zone_delay(loc).shouldDelay;
  const zone_set: boolean = safeGet("lastAdventure") === loc;
  if (valid_loc && have_digs && delay_left && zone_set) {
    return true;
  }
  return false;
}

export function spadeDelayZones(): Location[] {
  return [$location`The Unquiet Garves`, $location`The Haunted Ballroom`];
}

export function auto_burnRemainingSpadeDigs(): boolean {
  const n_digs: number = auto_spadeDigsRemaining();
  for (let ii: number = 0; ii < n_digs; ii++) {
    auto_spadeDigAncient();
  }
  return auto_spadeDigsRemaining() === 0;
}
