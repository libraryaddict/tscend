import {
  availableAmount,
  itemDropModifier,
  Location,
  myAscensions,
} from "kolmafia";
import { $item, $location, $skill, get, set } from "libram";

import { CombatMacroReturns } from "../../auto_adventure";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { auto_is_valid, auto_log_info } from "../../auto_util";
import { zone_needItem } from "../../auto_zone";
import {
  auto_canUse,
  auto_useSkill,
  useItem,
} from "../../combat/auto_combat_util";
import { is_professor } from "../../paths/2024/wereprofessor";

export function haveCosmicBowlingBall(): boolean {
  // ensure we not only own one but it's in allowed in path and also in inventory for us to do stuff with.
  return (
    get("hasCosmicBowlingBall") &&
    auto_is_valid($item`cosmic bowling ball`) &&
    availableAmount($item`cosmic bowling ball`) > 0
  );
}

export function bowlingBallCombatString(
  place: Location,
  speculation: boolean,
): CombatMacroReturns {
  if (!haveCosmicBowlingBall()) {
    return undefined;
  }

  if (is_professor()) {
    return undefined; //Handle specially in WereProf Combat file
  }

  if (
    place === $location`The Hidden Bowling Alley` &&
    get("auto_bowledAtAlley", 0) !== myAscensions()
  ) {
    if (!speculation) {
      set("auto_bowledAtAlley", myAscensions());
      auto_log_info(
        "Cosmic Bowling Ball used at Hidden Bowling Alley to advance quest.",
      );
    }
    return useItem($item`cosmic bowling ball`, !speculation);
  }
  // determine if we want more stats
  if (auto_canUse($skill`Bowl Sideways`)) {
    // increase stats if we are power leveling
    if (isAboutToPowerlevel()) {
      return auto_useSkill($skill`Bowl Sideways`, !speculation);
    }
    // increase stats if we are farming Ka as Ed
    if (get("_auto_farmingKaAsEd", false)) {
      return auto_useSkill($skill`Bowl Sideways`, !speculation);
    }
  }
  // determine if we want more item or meat bonus
  if (auto_canUse($skill`Bowl Straight Up`)) {
    // increase item bonus if not item capped in current zone
    const { needItem, needScore } = zone_needItem(place);
    if (needItem) {
      if (itemDropModifier() < needScore) {
        return auto_useSkill($skill`Bowl Straight Up`, !speculation);
      }
    }
    // increase meat bonus if doing nuns
    if (place === $location`The Themthar Hills`) {
      return auto_useSkill($skill`Bowl Straight Up`, !speculation);
    }
  }

  return undefined;
}
