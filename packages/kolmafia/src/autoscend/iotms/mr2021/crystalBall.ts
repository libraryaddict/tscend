import {
  appearanceRates,
  getMonsters,
  haveEffect,
  isBanished,
  Item,
  Location,
  Monster,
  monsterPhylum,
  splitString,
  toLocation,
  toMonster,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $locations,
  $monster,
  get,
  set,
} from "libram";

import { possessEquipment } from "../../auto_equipment";
import { pathHasFamiliar } from "../../auto_familiar";
import {
  auto_combat_appearance_rates,
  auto_is_valid,
  auto_queueIgnore,
  auto_wantToBanish,
  auto_wantToBanish$1,
  auto_wantToReplace,
  auto_wantToSniff,
  auto_wantToYellowRay,
  safeGet,
  wrap_item,
} from "../../auto_util";
import { isSniffed$1 } from "../../combat/auto_combat_util";
import { maximizer } from "../../utils/maximizer";

// This is meant for items that have a date of 2021

//Defined in autoscend/iotms/mr2021.ash
export function haveCrystalBall(): boolean {
  const crystal_ball: Item = wrap_item($item`miniature crystal ball`);
  return (
    possessEquipment(crystal_ball) &&
    auto_is_valid(crystal_ball) &&
    pathHasFamiliar()
  );
}

function crystalBallMonster(loc: Location): Monster {
  // returns a monster if the crystal ball predicts one in the location

  const crystalBallPredictions: Map<number, string> = new Map(
    splitString(get("crystalBallPredictions"), "[|]").map((_v, _i) => [_i, _v]),
  );
  if ((crystalBallPredictions.get(0) ?? "") === "") {
    return $monster.none; // no prediction
  }
  for (const i of crystalBallPredictions.keys()) {
    const thisPrediction: Map<number, string> = new Map(
      splitString(crystalBallPredictions.get(i) ?? "", ":").map((_v, _i) => [
        _i,
        _v,
      ]),
    ); // turn:location:monster
    // turn: thisPrediction[0].to_int() is useless unless mafia fails to update the property
    if (toLocation(thisPrediction.get(1) ?? "") !== loc) {
      continue;
    }
    return toMonster(thisPrediction.get(2) ?? "");
  }
  return $monster.none; // no prediction in the location
}

function auto_allowCrystalBall(
  predicted_monster: Monster,
  loc: Location,
): boolean {
  // blacklisted locations
  if (
    $locations`Next to that Barrel with Something Burning in it, Out by that Rusted-Out Car, Over Where the Old Tires Are, Near an Abandoned Refrigerator`.includes(
      loc,
    )
  ) {
    //predictions can't tell tool gremlins apart from non tool gremlins
    return false;
  }
  // allowed elsewhere if no prediction
  if (predicted_monster === $monster.none) {
    return true;
  }
  // next monster forced by mapping overrides any prediction so no need to forbid equipping crystal ball
  if (get("mappingMonsters")) {
    return true;
  }
  // next monster forced by clover so no need to forbid equipping crystal ball
  if (haveEffect($effect`Lucky!`) > 0) {
    if (loc === $location`The Hidden Temple`) {
      // the only lucky adventure with a fight that could use the chance of item drop bonus
      return true;
    }
  }
  //if already forced by something else, no need to handle your ball
  //pre_adv, or simulatePreAdvForCrystalBall, handles this as it already tracks burningDelay and forced encounters

  if (
    isBanished(predicted_monster) ||
    auto_wantToReplace(predicted_monster, loc) ||
    auto_wantToBanish(predicted_monster, loc) ||
    auto_wantToBanish$1(monsterPhylum(predicted_monster), loc)
  ) {
    // next prediction is unwanted, do not allow
    return false;
  }

  return true;
}

export function forceHandleCrystalBall(loc: Location): boolean {
  //full support would need changing how autoscend chooses tasks to move between zones and reset predictions
  //instead just allow it to make unwanted monsters less likely and confirm wanted monsters

  const predicted_monster: Monster = crystalBallMonster(loc);

  let shouldForceEquip: boolean = false;
  if (predicted_monster !== $monster.none) {
    if (
      (auto_wantToSniff(predicted_monster, loc) ||
        isSniffed$1(
          //sniff targets are wanted monsters TODO it's not exhaustive, neither is careAboutDrops()
          predicted_monster,
        ) ||
        Monster.get([
          //ball will likely be forbidden before getting to last monster, but last wanted one isn't sniff target
          "monstrous boiler",
          "beanbat",
        ]).includes(predicted_monster)) &&
      (auto_combat_appearance_rates(
        //some wanted monsters are not sniff targets
        loc,
        false,
      ).get(predicted_monster) ?? 0.0) < 100
    ) {
      //other monsters possible
      shouldForceEquip = true; // should not waste the prediction entered in queue
    }
  }

  const crystal_ball: Item = wrap_item($item`miniature crystal ball`);
  if (shouldForceEquip) {
    maximizer.equip(crystal_ball);
    set("auto_nextEncounter", predicted_monster);
    return true; //handled
  } else if (!auto_allowCrystalBall(predicted_monster, loc)) {
    maximizer.exclude(crystal_ball);
    return true; //handled
  }
  //equipping the crystal ball can't hurt but it is neither forced nor forbidden
  //pre_adv will consider giving it a maximizer bonus after checking if monster queue control is wanted
  //removeFromMaximize(`-equip {crystal_ball.to_string()}`);	//this should already get reset after every loop or maximizer simulation
  return false;
}

export function simulatePreAdvForCrystalBall(place: Location): void {
  // used only when simulating maximizer equipment
  // replicates most of pre_adv monster queue checks in order to know if miniature crystal ball will be allowed

  let considerCrystalBallBonus: boolean = false;
  if (
    !auto_queueIgnore() &&
    safeGet("auto_nextEncounter") === $monster.none &&
    !forceHandleCrystalBall(place)
  ) {
    //equipping the crystal ball can't hurt but it is neither forced nor forbidden
    //will consider giving it a maximizer bonus after checking if monster queue control is wanted
    considerCrystalBallBonus = true;
  }

  const possible_monsters: Map<number, Monster> = new Map();
  if (safeGet("auto_nextEncounter") !== $monster.none) {
    //next monster is forced by zone mechanics or by now locked-in miniature crystal ball
    possible_monsters.set(
      possible_monsters.size,
      safeGet("auto_nextEncounter"),
    );
  } else {
    for (const [, mon] of getMonsters(place).entries()) {
      if ((appearanceRates(place)[mon.toString()] ??= 0.0) > 0) {
        possible_monsters.set(possible_monsters.size, mon);
      }
    }
  }

  let zoneHasUnwantedMonsters: boolean = false;
  let zoneHasWantedMonsters: boolean = false;
  if (!auto_queueIgnore()) {
    //next encounter is a monster from the zone
    for (const [, mon] of possible_monsters) {
      if (auto_wantToYellowRay(mon, place)) {
        zoneHasWantedMonsters = true;
      }
      if (auto_wantToBanish(mon, place)) {
        zoneHasUnwantedMonsters = true;
      }
      if (auto_wantToReplace(mon, place)) {
        zoneHasUnwantedMonsters = true;
      }
      if (auto_wantToSniff(mon, place)) {
        zoneHasWantedMonsters = true;
      }
    }
  }
  if (considerCrystalBallBonus) {
    //give miniature crystal ball a maximizer bonus only if the location has monsters to avoid or target
    const crystalBallMaximizerBonus: number =
      0 +
      (zoneHasUnwantedMonsters ? 300 : 0) +
      (zoneHasWantedMonsters ? 300 : 0);
    if (crystalBallMaximizerBonus !== 0) {
      const crystal_ball: Item = wrap_item($item`miniature crystal ball`);
      maximizer.bonus(crystal_ball, crystalBallMaximizerBonus);
    }
  }
}
