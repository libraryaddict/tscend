import { getLocketMonsters, Monster, splitString, toMonster } from "kolmafia";
import { $item, $location, get } from "libram";

import { autoAdvBypass } from "../../auto_adventure";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_log_error,
  auto_log_info,
  handleTracker,
} from "../../auto_util";

export function haveCombatLoversLocket(): boolean {
  return (
    possessEquipment($item`combat lover's locket`) &&
    auto_is_valid($item`combat lover's locket`)
  );
}

function auto_CombatLoversLocketCharges(): number {
  // can fight up to 3 unique monsters by reminiscing with the locket
  if (!haveCombatLoversLocket()) {
    return 0;
  }

  const locketMonstersFought: string = get("_locketMonstersFought");
  // check if we haven't found any yet
  if (locketMonstersFought === "") {
    return 3;
  }

  return 3 - splitString(locketMonstersFought, ",").length;
}

function auto_haveReminiscedMonster(mon: Monster): boolean {
  const idList: Map<number, string> = new Map(
    splitString(get("_locketMonstersFought"), ",").map((_v, _i) => [_i, _v]),
  );
  for (const [, id] of idList) {
    if (toMonster(id) === mon) {
      return true;
    }
  }
  return false;
}

export function monsterInLocket(mon: Monster): boolean {
  const captured: Monster[] = Object.keys(getLocketMonsters()).map((_k) =>
    Monster.get(_k),
  );
  return captured.includes(mon);
}

export function fightLocketMonster(
  mon: Monster,
  speculative: boolean,
): boolean {
  if (auto_CombatLoversLocketCharges() < 1) {
    return false;
  }

  if (!monsterInLocket(mon)) {
    return false;
  }

  if (auto_haveReminiscedMonster(mon)) {
    return false;
  }

  if (speculative) {
    return true;
  }

  auto_log_info(`Using locket to summon ${mon.name}`, "blue");
  const pages: Map<number, string> = new Map();
  pages.set(0, "inventory.php?reminisce=1");
  pages.set(1, `choice.php?whichchoice=1463&pwd&option=1&mid=${mon.id}`);
  if (autoAdvBypass(1, pages, $location`Noob Cave`)) {
    handleTracker({
      what: mon,
      detail: $item`combat lover's locket`.toString(),
      property: "auto_copies",
    });
  }

  if (!auto_haveReminiscedMonster(mon)) {
    auto_log_error(
      `Attempted to fight ${mon.name} by reminiscing with Combat Lover's Locket, but failed.`,
    );
    return false;
  }

  return true;
}
