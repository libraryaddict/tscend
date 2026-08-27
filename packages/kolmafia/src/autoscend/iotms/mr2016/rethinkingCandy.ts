import {
  Effect,
  haveEffect,
  haveSkill,
  Item,
  itemAmount,
  myId,
  toInt,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $item, $items, $skill, get } from "libram";

import { auto_mall_price } from "../../auto_acquire";
import { spleen_left } from "../../auto_consume";
import { List$1, List$8, ListFind } from "../../auto_list";
import {
  auto_abort,
  auto_is_valid$2,
  auto_log_info,
  auto_log_warning,
} from "../../auto_util";

export function rethinkingCandy(
  acquire: Effect,
  simulate: boolean = false,
): boolean {
  if (
    (!haveSkill($skill`Sweet Synthesis`) ||
      !auto_is_valid$2($skill`Sweet Synthesis`)) &&
    !simulate
  ) {
    return false;
  }
  if (spleen_left() === 0 && !simulate) {
    return false;
  }

  const synthesisList: Effect[] = [
    $effect`Synthesis: Hot`,
    $effect`Synthesis: Cold`,
    $effect`Synthesis: Pungent`,
    $effect`Synthesis: Scary`,
    $effect`Synthesis: Greasy`,
    $effect`Synthesis: Strong`,
    $effect`Synthesis: Smart`,
    $effect`Synthesis: Cool`,
    $effect`Synthesis: Hardy`,
    $effect`Synthesis: Energy`,
    $effect`Synthesis: Greed`,
    $effect`Synthesis: Collection`,
    $effect`Synthesis: Movement`,
    $effect`Synthesis: Learning`,
    $effect`Synthesis: Style`,
  ];
  const synthesis: Map<number, Effect> = List$1(synthesisList);

  if (!synthesisList.includes(acquire)) {
    return false;
  }

  let maxprice: number = 2500;
  if (get("auto_maxCandyPrice", 0) !== 0) {
    maxprice = get("auto_maxCandyPrice", 0);
  }

  let simpleList: Map<number, Item> = new Map();
  let complexList: Map<number, Item> = new Map();
  for (const it of $items.all()) {
    if (
      it.candy &&
      itemAmount(it) > 0 &&
      auto_mall_price(it) <= maxprice &&
      it.tradeable
    ) {
      if (it.candyType === "simple") {
        simpleList.set(simpleList.size, it);
      } else if (it.candyType === "complex") {
        complexList.set(complexList.size, it);
      }
    }
  }

  simpleList = new Map(
    [...simpleList.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: auto_mall_price(value) };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  complexList = new Map(
    [...complexList.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: auto_mall_price(value) };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  const simple: Map<number, Item> = List$8(simpleList);
  const complex: Map<number, Item> = List$8(complexList);

  let bestCost: number = 2 * maxprice;
  let bestFirst: Item = $item.none;
  let bestSecond: Item = $item.none;
  if (
    $effects`Synthesis: Hot, Synthesis: Cold, Synthesis: Pungent, Synthesis: Scary, Synthesis: Greasy`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < simple.size; i++) {
      const current: number = toInt(simple.get(i) ?? $item.none);
      let startNextIndex: number = i + 1;
      if (itemAmount(simple.get(i) ?? $item.none) > 1) {
        startNextIndex = i;
      }
      for (let j: number = startNextIndex; j < simple.size; j++) {
        const sum: number = (toInt(simple.get(j) ?? $item.none) + current) % 5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${simple.get(i) ?? $item.none}, ${simple.get(j) ?? $item.none}`,
              "blue",
            );
          }
          if (
            auto_mall_price(simple.get(i) ?? $item.none) +
              auto_mall_price(simple.get(j) ?? $item.none) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(simple.get(i) ?? $item.none) +
              auto_mall_price(simple.get(j) ?? $item.none);
            bestFirst = simple.get(i) ?? $item.none;
            bestSecond = simple.get(j) ?? $item.none;
          }
        }
      }
    }
  } else if (
    $effects`Synthesis: Strong, Synthesis: Smart, Synthesis: Cool, Synthesis: Hardy, Synthesis: Energy`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < simple.size; i++) {
      const current: number = toInt(simple.get(i) ?? $item.none);
      for (let j: number = 0; j < complex.size; j++) {
        const sum: number = (toInt(complex.get(j) ?? $item.none) + current) % 5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${simple.get(i) ?? $item.none}, ${complex.get(j) ?? $item.none}`,
              "blue",
            );
          }
          if (
            auto_mall_price(simple.get(i) ?? $item.none) +
              auto_mall_price(complex.get(j) ?? $item.none) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(simple.get(i) ?? $item.none) +
              auto_mall_price(complex.get(j) ?? $item.none);
            bestFirst = simple.get(i) ?? $item.none;
            bestSecond = complex.get(j) ?? $item.none;
          }
        }
      }
    }
  } else if (
    $effects`Synthesis: Greed, Synthesis: Collection, Synthesis: Movement, Synthesis: Learning, Synthesis: Style`.includes(
      acquire,
    )
  ) {
    const goal: number = ListFind(synthesis, acquire) % 5;
    for (let i: number = 0; i < complex.size; i++) {
      const current: number = toInt(complex.get(i) ?? $item.none);
      let startNextIndex: number = i + 1;
      if (itemAmount(complex.get(i) ?? $item.none) > 1) {
        startNextIndex = i;
      }
      for (let j: number = startNextIndex; j < complex.size; j++) {
        const sum: number = (toInt(complex.get(j) ?? $item.none) + current) % 5;
        if (sum === goal) {
          if (simulate) {
            auto_log_info(
              `Possible: ${complex.get(i) ?? $item.none}, ${complex.get(j) ?? $item.none}`,
              "blue",
            );
          }
          if (
            auto_mall_price(complex.get(i) ?? $item.none) +
              auto_mall_price(complex.get(j) ?? $item.none) <
            bestCost
          ) {
            bestCost =
              auto_mall_price(complex.get(i) ?? $item.none) +
              auto_mall_price(complex.get(j) ?? $item.none);
            bestFirst = complex.get(i) ?? $item.none;
            bestSecond = complex.get(j) ?? $item.none;
          }
        }
      }
    }
  } else {
    return false;
  }

  if (bestFirst !== $item.none) {
    auto_log_info(
      `Best case: ${bestFirst}, ${bestSecond}: ${bestCost}`,
      "green",
    );
    if (!simulate) {
      const prior: number = haveEffect(acquire);
      visitUrl(
        `runskillz.php?pwd=&targetplayer=${myId()}&quantity=1&whichskill=166`,
      );

      const url: string = `choice.php?whichchoice=1217&option=1&pwd=&a=${toInt(bestFirst)}&b=${toInt(bestSecond)}`;
      visitUrl(url);
      if (haveEffect(acquire) === prior) {
        auto_abort(`Failed to Sweetly Synthesize: ${url}`);
      }
    }
    return true;
  } else if (simulate) {
    auto_log_warning("Could not find a possible candy combination", "red");
  } else {
    return false;
  }
  return false;
}
