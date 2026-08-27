import {
  availablePocket,
  Effect,
  Item,
  Monster,
  monsterPockets,
  myHash,
  pickedPockets,
  pickPocket,
  pocketMonster,
  Stat,
  toEffect,
  toInt,
  toItem,
  toMonster,
  toStat,
} from "kolmafia";
import { $effect, $item, $location, $monster, $stat, get } from "libram";

import { autoAdvBypass } from "../../auto_adventure";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_log_info,
  handleTracker,
  wrap_item,
} from "../../auto_util";
import { AshMatcher } from "../../utils/kolmafiaUtils";

function auto_hasCargoShorts(): boolean {
  return (
    possessEquipment(wrap_item($item`Cargo Cultist Shorts`)) &&
    auto_is_valid(wrap_item($item`Cargo Cultist Shorts`))
  );
}

function auto_cargoShortsCanOpenPocket(): boolean {
  if (!auto_hasCargoShorts()) {
    return false;
  }

  return !get("_cargoPocketEmptied");
}

function auto_cargoShortsCanOpenPocket$1(pocket: number): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }

  if (pocket <= 0 || pocket > 666) {
    return false;
  }

  const picked: Map<number, boolean> = new Map(
    Object.entries(pickedPockets()).map(([_k, _v]) => [toInt(_k), _v]),
  );
  if (picked.get(pocket) ?? false) {
    return false;
  }

  return true;
}

function auto_cargoShortsCanOpenPocket$2(i: Item): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }

  return availablePocket(i) !== 0;
}

function auto_cargoShortsCanOpenPocket$3(m: Monster): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }

  return availablePocket(m) !== 0;
}

function auto_cargoShortsCanOpenPocket$4(e: Effect): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }

  return availablePocket(e) !== 0;
}

function auto_cargoShortsCanOpenPocket$5(s: Stat): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }

  return availablePocket(s) !== 0;
}

function auto_cargoShortsCanOpenPocket$6(s: string): boolean {
  if (!auto_cargoShortsCanOpenPocket()) {
    return false;
  }
  // to_int errors if not an int, check with regex first
  const m: AshMatcher = new AshMatcher("^d+$", s);
  if (m.find()) {
    return auto_cargoShortsCanOpenPocket$1(toInt(s));
  } else if (toItem(s) !== $item.none) {
    return auto_cargoShortsCanOpenPocket$2(toItem(s));
  } else if (toMonster(s) !== $monster.none) {
    return auto_cargoShortsCanOpenPocket$3(toMonster(s));
  } else if (toEffect(s) !== $effect.none) {
    return auto_cargoShortsCanOpenPocket$4(toEffect(s));
  } else if (toStat(s) !== $stat.none) {
    return auto_cargoShortsCanOpenPocket$5(toStat(s));
  }

  return false;
}

export function auto_cargoShortsOpenPocket(pocket: number): boolean {
  if (!auto_cargoShortsCanOpenPocket$1(pocket)) {
    return false;
  }

  if (pocket in monsterPockets()) {
    return auto_cargoShortsOpenPocket$5(pocketMonster(pocket).toString());
  }
  return pickPocket(pocket);
}

function auto_cargoShortsOpenPocket$1(i: Item): boolean {
  if (!auto_cargoShortsCanOpenPocket$2(i)) {
    return false;
  }

  return pickPocket(availablePocket(i));
}

export function auto_cargoShortsOpenPocket$2(
  m: Monster,
  speculative: boolean,
): boolean {
  if (!auto_cargoShortsCanOpenPocket$3(m)) {
    return false;
  }

  if (speculative) {
    return true;
  }

  auto_log_info(`Using cargo shorts to summon ${m.name}`, "blue");
  const pages: Map<number, string> = new Map();
  pages.set(0, "inventory.php?action=pocket");
  pages.set(
    1,
    `choice.php?pwd=${myHash()}&whichchoice=1420&option=1&pocket=${availablePocket(m)}`,
  );
  if (autoAdvBypass(0, pages, $location`Noob Cave`)) {
    handleTracker({
      what: m,
      detail: wrap_item($item`Cargo Cultist Shorts`).toString(),
      property: "auto_copies",
    });
    return true;
  }
  return false;
}

function auto_cargoShortsOpenPocket$3(e: Effect): boolean {
  if (!auto_cargoShortsCanOpenPocket$4(e)) {
    return false;
  }

  return pickPocket(availablePocket(e));
}

function auto_cargoShortsOpenPocket$4(s: Stat): boolean {
  if (!auto_cargoShortsCanOpenPocket$5(s)) {
    return false;
  }

  return pickPocket(availablePocket(s));
}

function auto_cargoShortsOpenPocket$5(s: string): boolean {
  if (!auto_cargoShortsCanOpenPocket$6(s)) {
    return false;
  }
  // to_int errors if not an int, check with regex first
  const m: AshMatcher = new AshMatcher("^d+$", s);
  if (m.find()) {
    return auto_cargoShortsOpenPocket(toInt(s));
  } else if (toItem(s) !== $item.none) {
    return auto_cargoShortsOpenPocket$1(toItem(s));
  } else if (toMonster(s) !== $monster.none) {
    return auto_cargoShortsOpenPocket$2(toMonster(s), false);
  } else if (toEffect(s) !== $effect.none) {
    return auto_cargoShortsOpenPocket$3(toEffect(s));
  } else if (toStat(s) !== $stat.none) {
    return auto_cargoShortsOpenPocket$4(toStat(s));
  }

  return false;
}
