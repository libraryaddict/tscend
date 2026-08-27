import { Item, Location, Skill } from "kolmafia";
import { $item, $location, $locations, $skill, get } from "libram";

import { Autumnaton, Bofa } from "../../../types";
import { possessEquipment, possessOutfit } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  internalQuestStatus,
  wrap_item,
} from "../../auto_util";
import { in_wildfire } from "../../paths/2021/wildfire";
import { in_wereprof } from "../../paths/2024/wereprofessor";
import { bridgeGoal } from "../../quests/level_09";

export function haveFireExtinguisher(): boolean {
  const exting: Item = wrap_item($item`industrial fire extinguisher`);
  return possessEquipment(exting) && auto_is_valid(exting);
}

export function fireExtinguisherCharges(): number {
  if (!haveFireExtinguisher()) {
    return 0;
  }
  return get("_fireExtinguisherCharge");
}

// returns zone specific skill if in usable zone and hasn't been used yet there this ascension. Otherwise returns empty string
export function FireExtinguisherCombatSkill(
  place: Location,
): Skill | undefined {
  if (
    fireExtinguisherCharges() < 20 ||
    !auto_is_valid$2($skill`Fire Extinguisher: Zone Specific`)
  ) {
    return undefined;
  }

  if (in_wereprof()) {
    return undefined;
  }
  // once per ascension uses
  if (
    $locations`Guano Junction, The Batrat and Ratbat Burrow, The Beanbat Chamber`.includes(
      place,
    ) &&
    !get("fireExtinguisherBatHoleUsed")
  ) {
    //sonar-in-a-biscuits are used before combat, if available. Knock a wall down if any are still standing
    if (internalQuestStatus("questL04Bat") < 3) {
      return $skill`Fire Extinguisher: Zone Specific`;
    }
  }

  if (
    place === $location`Cobb's Knob Harem` &&
    !get("fireExtinguisherHaremUsed") &&
    !possessOutfit("Knob Goblin Harem Girl Disguise")
  ) {
    return $skill`Fire Extinguisher: Zone Specific`;
  }

  if (
    place === $location`The Defiled Niche` &&
    !get("fireExtinguisherCyrptUsed")
  ) {
    return $skill`Fire Extinguisher: Zone Specific`;
  }

  if (
    place === $location`The Smut Orc Logging Camp` &&
    !get("fireExtinguisherChasmUsed") &&
    get("chasmBridgeProgress") < bridgeGoal() &&
    !Autumnaton.hasAutumnaton()
  ) {
    return $skill`Fire Extinguisher: Zone Specific`;
  }

  if (
    place === $location`The Arid, Extra-Dry Desert` &&
    $location`The Arid, Extra-Dry Desert`.turnsSpent > 0 &&
    !get("fireExtinguisherDesertUsed") &&
    !Bofa.haveBofa()
  ) {
    return $skill`Fire Extinguisher: Zone Specific`;
  }

  return undefined;
}

export function canExtinguisherBeRefilled(): boolean {
  return (
    haveFireExtinguisher() && in_wildfire() && !get("_fireExtinguisherRefilled")
  );
}
