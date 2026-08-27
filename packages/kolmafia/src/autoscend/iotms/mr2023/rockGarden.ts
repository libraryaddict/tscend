import {
  canInteract,
  handlingChoice,
  Item,
  itemAmount,
  lastChoice,
  Location,
  Monster,
  myHash,
  use,
  visitUrl,
} from "kolmafia";
import { $item, get } from "libram";

import { handleChoiceAdv } from "../../auto_choice_adv";
import {
  auto_get_campground,
  auto_is_valid,
  auto_wantToFreeKillWithNoDrops,
  isFreeMonster,
} from "../../auto_util";

// This is meant for items that have a date of 2023

let $_auto_haveRockGarden_rockGarden: Item | undefined;

//Defined in autoscend/iotms/mr2023.ash
function auto_haveRockGarden(): boolean {
  $_auto_haveRockGarden_rockGarden ??= $item`packet of rock seeds`;
  return (
    auto_is_valid($_auto_haveRockGarden_rockGarden) &&
    auto_get_campground().has($_auto_haveRockGarden_rockGarden)
  );
}

export function rockGardenEnd(): void {
  //broke these out so they aren't handled at the start of everyday but ASAP after numberology
  //while we will probably never get these automatically, should handle them anyway
  if (
    itemAmount($item`molehill mountain`) > 0 &&
    !get("_molehillMountainUsed")
  ) {
    use(1, $item`molehill mountain`);
  }

  if (
    itemAmount($item`strange stalagmite`) > 0 &&
    !get("_strangeStalagmiteUsed")
  ) {
    // use() aborts the whole script with "Unsupported choice adventure #1491"
    // since this redirects straight into choice.php; visitUrl() bypasses that and
    // lets the real choice dispatcher handle it instead.
    const stalagmiteText = visitUrl(
      `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`strange stalagmite`.id}`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), stalagmiteText);
    }
  }
  return;
}

export function pickRocks(): void {
  //Pick rocks everyday
  //If we manage to get a lodestone, will not use it, because it is a one-a-day and user may want to use it in specific places
  if (!auto_haveRockGarden()) {
    return;
  }
  visitUrl("campground.php?action=rgarden1");
  if (get("desertExploration") < 100) {
    visitUrl("campground.php?action=rgarden2");
  }
  visitUrl("campground.php?action=rgarden3");
  return;
}

export function wantToThrowGravel(loc: Location, enemy: Monster): boolean {
  // returns true if we want to use Groveling Gravel. Not intended to exhaustivly list all valid targets.
  // simply enough to use the few gravels we get in run.

  if (itemAmount($item`groveling gravel`) === 0) {
    return false;
  }
  if (!auto_is_valid($item`groveling gravel`)) {
    return false;
  }
  if (isFreeMonster(enemy, loc)) {
    // don't use gravel against inherently free fights
    return false;
  }
  // prevent overuse after breaking ronin or in casual
  if (canInteract()) {
    return false;
  }

  return auto_wantToFreeKillWithNoDrops(loc, enemy);
}
