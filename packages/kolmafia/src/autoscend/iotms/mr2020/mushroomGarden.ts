import {
  getCampground,
  getProperty,
  itemAmount,
  min,
  toInt,
  use,
} from "kolmafia";
import { $item, $location, get } from "libram";

import { autoAdv } from "../../auto_adventure";
import { auto_abort, auto_is_valid, auto_runChoice } from "../../auto_util";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";

export function auto_canFightPiranhaPlant(): boolean {
  const numMushroomFights: number = in_plumber() ? 5 : 1;
  if (
    auto_is_valid($item`packet of mushroom spores`) &&
    $item`packet of mushroom spores`.toString() in getCampground() &&
    get("_mushroomGardenFights") < numMushroomFights
  ) {
    return true;
  }
  return false;
}

export function auto_canTendMushroomGarden(): boolean {
  if (
    auto_is_valid($item`packet of mushroom spores`) &&
    $item`packet of mushroom spores`.toString() in getCampground() &&
    !get("_mushroomGardenVisited")
  ) {
    return true;
  }
  return false;
}

export function auto_piranhaPlantFightsRemaining(): number {
  if (auto_canFightPiranhaPlant()) {
    const numMushroomFights: number = in_plumber() ? 5 : 1;
    return numMushroomFights - get("_mushroomGardenFights");
  }
  return 0;
}

export function auto_mushroomGardenHandler(): boolean {
  if (auto_piranhaPlantFightsRemaining() > 0) {
    return autoAdv($location`Your Mushroom Garden`);
  } else if (auto_canTendMushroomGarden()) {
    autoAdv($location`Your Mushroom Garden`);
    // TODO: Malibu Stacey - move all this to a more central location after refactor
    use(
      itemAmount($item`colossal free-range mushroom`),
      $item`colossal free-range mushroom`,
    );
    use(
      itemAmount($item`immense free-range mushroom`),
      $item`immense free-range mushroom`,
    );
    use(
      itemAmount($item`giant free-range mushroom`),
      $item`giant free-range mushroom`,
    );
    use(
      itemAmount($item`bulky free-range mushroom`),
      $item`bulky free-range mushroom`,
    );
    use(
      itemAmount($item`plump free-range mushroom`),
      $item`plump free-range mushroom`,
    );
    use(itemAmount($item`free-range mushroom`), $item`free-range mushroom`);
    return true;
  }
  return false;
}

export function mushroomGardenChoiceHandler(choice: number): void {
  if (choice === 1410) {
    const growth: number = get("auto_mushroomGardenGrowth");
    let pick: number = 1;
    if (getProperty("auto_mushroomGardenGrowth") !== "") {
      // limit to growth of 11 for colossal free-range mushroom as any further growth is wasted.
      pick = min(toInt(growth), 11);
    }
    if (get("mushroomGardenCropLevel") >= pick) {
      auto_runChoice(2); // pick the mushroom.
    } else {
      auto_runChoice(1); // fertilise the mushroom
    }
  } else {
    auto_abort("unhandled choice in mushroomGardenChoiceHandler");
  }
}
