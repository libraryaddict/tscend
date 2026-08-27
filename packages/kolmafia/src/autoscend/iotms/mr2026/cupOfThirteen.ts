import {
  canDrink,
  cliExecute,
  cupOf13sTier,
  Effect,
  entityDecode,
  heartstoneStringLength,
  historicalPrice,
  Item,
  itemAmount,
  knollAvailable,
  myAdventures,
  myHash,
  myInebriety,
  myMeat,
  Stat,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $items, $stat, get, have } from "libram";

import { PastaWand } from "../../../types";
import { auto_buyUpTo, auto_hermit } from "../../auto_acquire";
import {
  AUTO_OBTAIN_NULL,
  AUTO_ORGAN_LIVER,
  fullness_left,
  inebriety_left,
} from "../../auto_consume";
import {
  auto_is_valid,
  auto_log_warning,
  autoCraft,
  handleTracker,
  internalQuestStatus,
  meatReserve,
} from "../../auto_util";
import { ConsumeAction } from "../../autoscend_record";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { in_small } from "../../paths/2023/small";

class CupOfThirteenData {
  constructor(
    public item: Item,
    public adventures: number,
    public effect: Effect,
    public effectDuration: number,
    public stat: Stat,
    public statAmount: number,
  ) {}
}

interface CupOfThirteenIngredient {
  item: Item;
  data: CupOfThirteenData;
  count: () => number; // How much of this is available
  acquire?: (count: number) => boolean;
}

function getCupOfThirteenData(item: Item): CupOfThirteenData {
  const valuableness = cupOf13sTier(item);
  const adventures = Math.min(valuableness, 1 + (item.id % 5));
  const extraScore = valuableness - adventures;

  const index = heartstoneStringLength(entityDecode(item.name)) % 13;
  let effect: Effect = $effect.none;
  let stat: Stat = $stat.none;

  if (extraScore > 0) {
    switch (index) {
      case 0:
        stat = Stat.get("Muscle");
        break;
      case 1:
        stat = Stat.get("Mysticality");
        break;
      case 2:
        stat = Stat.get("Moxie");
        break;
      default:
        effect = Effect.get(3105 + index);
        break;
    }
  }

  const statAmount = stat !== $stat.none ? extraScore * 50 : 0;
  const effectTurns = effect !== $effect.none ? extraScore * 20 : 0;

  return new CupOfThirteenData(
    item,
    adventures,
    effect,
    effectTurns,
    stat,
    statAmount,
  );
}

function getCupIngredients(): CupOfThirteenIngredient[] {
  const cupOfThirteenIngredients: CupOfThirteenIngredient[] = [];
  // Fill in ingredients
  function addIngredient(
    item: Item,
    count: () => number = () => itemAmount(item),
    acquire?: (count: number) => boolean,
  ): void {
    cupOfThirteenIngredients.push({
      item,
      data: getCupOfThirteenData(item),
      count,
      acquire,
    });
  }

  const pastaReserved = new Map<Item, number>();

  // We always ensure legendary noodles has a chance to be eaten
  // Start with the amount of legendary noodles we have
  let keepReserved = itemAmount($item`legendary noodles`);

  // Reserve 3 more if future noodle summons are available
  if (
    PastaWand.havePastaWand() &&
    get("noodleSummons") === 0 &&
    !get("_legendaryPastaWaveCast")
  ) {
    keepReserved += 3;
  }

  // Don't go above 6 ingredients reserved
  keepReserved = Math.min(
    6,
    keepReserved,
    // Some paths don't allow eating
    fullness_left() +
      (isActuallyEd() || get("_legendaryNoodlesSpleen") ? 0 : 1), // If we're converting a fullness to spleen, add 1
  );

  const noodleDishes = [...PastaWand.legendaryNoodleDishes().keys()];
  // Reserve ingredients first, then start storing what is available to use
  for (const ingred of noodleDishes) {
    const amount = itemAmount(ingred);

    // Reserve as much as needed
    const toReserve = Math.min(keepReserved, amount);
    keepReserved -= toReserve;

    // Add the amount, minus the amount we've reserved
    pastaReserved.set(ingred, amount - toReserve);
  }

  // Hardcoded, maybe in the future?
  for (const ingred of noodleDishes) {
    addIngredient(ingred, () => pastaReserved.get(ingred) ?? 0);
  }

  // Now the ingredients we just don't care about. Not very filled out as its annoying
  for (const item of $items`spoon, jumbo olive, black picnic basket`) {
    addIngredient(item, () => itemAmount(item));
  }

  if (knollAvailable()) {
    // 4 adv turn gen, requires 2 meat smiths so only if knoll
    addIngredient(
      $item`dripping meat staff`,
      () => Math.max(0, Math.floor((myMeat() - meatReserve()) / 400)), // Each staff costs 400~ approx
      (count: number) => {
        return (
          // Gather the ingredients
          auto_buyUpTo(count, $item`big stick`) && // Buy from store
          cliExecute(`make ${count} meat stack`) && // Make some meat stacks
          auto_hermit(count, $item`ketchup`) && // Including from hermit
          autoCraft("smith", count, $item`big stick`, $item`meat stack`) >=
            count && // Smith staffs
          autoCraft("smith", count, $item`basic meat staff`, $item`ketchup`) >=
            count // Smith dripping staffs
        );
      },
    ); // 5 adv turn gen, requires 2 meat smiths so only if knoll & has at least 5 dry noodles. 5 being the magic number to say they're not being as utilized as they could be
    addIngredient(
      $item`starchy staff`,
      () =>
        myMeat() > meatReserve() + 200 && itemAmount($item`dry noodles`) >= 5
          ? 1
          : 0,
      (count: number) => {
        return (
          // Gather the ingredients
          auto_buyUpTo(count, $item`big stick`) && // Buy from store
          cliExecute(`make ${count} meat stack`) && // Make some meat stacks
          autoCraft("smith", count, $item`big stick`, $item`meat stack`) >=
            count && // Smith staffs
          autoCraft(
            "smith",
            count,
            $item`basic meat staff`,
            $item`dry noodles`,
          ) >= count // Smith dripping staffs
        );
      },
    );
  }

  // Some other items you might have lying around?
  addIngredient($item`pristine fish scale`);
  addIngredient($item`yam`);
  addIngredient($item`mini kiwi bikini`, () =>
    // Only available if we're past the protesters and the tower is known not sleaze
    // Sleaze is the only test that doesn't start with "people"
    get("telescope2").startsWith("people") &&
    internalQuestStatus("questL11Ron") >= 2
      ? itemAmount($item`mini kiwi bikini`)
      : 0,
  );

  // Add a few items from the war, but only if the war is over and we have duplicates
  if (get("questL12War") === "finished") {
    for (const it of $items`hippy protest button, Lockenstock™ sandals, didgeridooka, wicker shield, oversized pipe, fire poi, Gaia beads, hippy medical kit, flowing hippy skirt, round green sunglasses`) {
      if (itemAmount(it) <= 1) {
        continue;
      }

      // Always keep 1
      addIngredient(it, () => itemAmount(it) - 1);
    }
  }

  return cupOfThirteenIngredients;
}

export function canDrinkCupOfThirteen(): boolean {
  if (in_tcrs() || in_small() || !canDrink()) return false;
  if (get("auto_limitConsume", false)) return false;

  // Falls back to at least 3 advs remaining, which should mean only when it's trying to get the effect as consume would already skip it for better items.
  const minAdvPerFill = get("auto_consumeMinAdvPerFill", 0) || 3;

  if (cupOfThirteenAdvRemaining() < minAdvPerFill) {
    return false;
  }

  if (!auto_is_valid($item`Cup of 13s`)) return false;

  if (!have($item`Cup of 13s`)) return false;

  return true;
}

export function cupOfThirteenAdvRemaining(): number {
  return get(`_cupOf13sJewels`, 13);
}

function auto_bestCupOfThirteenAction(
  reqEffect: Effect,
): ConsumeAction | undefined {
  // Get all the possible ingredients
  const ingredients: CupOfThirteenIngredient[] = getCupIngredients();
  // Boost these effects up when we're comparing, we prioritize item drop if we don't need meat
  const effectScores: Map<Effect, number> = new Map([
    [$effect`Runneth Over`, 100], // 50% item drop
    [$effect`Runneth On Empty`, myMeat() > meatReserve() + 3000 ? 5 : 200], // 100% meat drop
    [$effect`Runneth a Tight Ship`, 1], // +5 fam exp
    [$effect`Runneth With The Pack`, 3], // +5 fam weight
    [$effect`Runneth Wild`, 0.1], // +100 init
  ]);

  // Cache prices
  const prices = new Map(
    ingredients.map((ingredient) => [
      ingredient.item,
      historicalPrice(ingredient.item),
    ]),
  );

  // How many adventures we can actually make use of. An ingredient's adventures beyond this are worthless for sorting purposes, so once
  // we're close to the cap we stop favoring high-adventure ingredients over ones that score better in other ways.
  const advCap = cupOfThirteenAdvRemaining();

  // Sort them with capped adventures; called again after each pick since the cap shrinks as ingredients are selected
  const sortIngredients = (): void => {
    const usefulAdvs: number = advCap - usedAdvs;

    ingredients.sort((itm1, itm2) => {
      const a = itm1.data;
      const b = itm2.data;
      // Prefer ingredients with more adventures, but only up to what we can still use
      const aAdv = Math.min(a.adventures, usefulAdvs);
      const bAdv = Math.min(b.adventures, usefulAdvs);
      if (aAdv !== bAdv) {
        return bAdv - aAdv;
      }

      // If we're looking for an effect, prefer the one with the longest duration when both of the ingredients has the requested effect
      // We don't care if these are dragged to the bottom
      if (
        reqEffect !== $effect.none &&
        a.effect === reqEffect &&
        a.effect === b.effect &&
        a.effectDuration !== b.effectDuration
      ) {
        return b.effectDuration - a.effectDuration;
      }

      const effScore1 =
        (effectScores.get(a.effect) ?? 0) * (a.effectDuration ?? 0);
      const effScore2 =
        (effectScores.get(b.effect) ?? 0) * (b.effectDuration ?? 0);

      // Prefer the ingredient that gives us the better effects
      if (effScore1 !== effScore2) {
        return effScore2 - effScore1;
      }

      if (a.statAmount !== b.statAmount) {
        // Should add some weight for our lowest stat perhaps?
        return (b.statAmount ?? 0) - (a.statAmount ?? 0);
      }

      // Otherwise prefer the lower mall price
      return prices.get(a.item)! - prices.get(b.item)!;
    });
  };

  const selected: CupOfThirteenIngredient[] = [];
  let usedAdvs = 0;

  // If we require an effect
  if (reqEffect !== $effect.none) {
    sortIngredients();
    // Find an ingredient that we can use
    const effect = ingredients.find(
      (unit) => unit.data.effect === reqEffect && unit.count() > 0,
    );

    // If we can't acquire the effect
    if (!effect) {
      return undefined;
    }

    // Ensure this ingredient is used
    selected.push(effect);
    usedAdvs += effect.data.adventures;
  }

  // Fill out the rest of the ingredients one at a time, re-sorting after each pick so ingredients
  // that would push us past the adv cap lose their priority to ones that don't
  while (selected.length < 3) {
    // Re-sort so ingredients that would push us past the adv cap lose priority to ones that don't
    sortIngredients();
    const next = ingredients.find(
      (ingred) =>
        ingred.count() > selected.filter((sel) => sel === ingred).length,
    );

    if (!next) {
      break;
    }

    selected.push(next);
    usedAdvs += next.data.adventures;
  }

  if (selected.length !== 3) {
    return undefined;
  }

  const action = auto_cupOfThirteenConsumeAction(selected, reqEffect);

  if (action.adventures < get("auto_consumeMinAdvPerFill", 0.0)) {
    return undefined;
  }

  return action;
}

function auto_cupOfThirteenConsumeAction(
  pick: CupOfThirteenIngredient[],
  effect: Effect = $effect.none,
): ConsumeAction {
  // Get the raw adv gain
  const advs: number = Math.min(
    pick.reduce((sum, ing) => sum + ing.data.adventures, 0),
    cupOfThirteenAdvRemaining(),
  );
  // Boost the value if we're looking for this effect
  const value =
    effect !== $effect.none && pick.some((i) => i.data.effect === effect)
      ? 10
      : 0;

  const prep = () => {
    for (const ingredient of pick) {
      // Returns the count of items we don't have
      const need = () =>
        pick.filter((p) => p.item === ingredient.item).length -
        itemAmount(ingredient.item);

      if (need() <= 0) {
        continue;
      }

      // If we can acquire it, try acquire, then if successfully acquired enough
      if (ingredient.acquire && ingredient.acquire(need()) && need() <= 0) {
        continue;
      }

      auto_log_warning(
        `Failed to acquire ${need()} x ${ingredient.item} when trying to gather ingredients for cup of 13`,
      );
      return false;
    }
    return true;
  };

  return new ConsumeAction(
    $item`Cup of 13s`,
    0,
    1,
    advs,
    value + advs,
    AUTO_ORGAN_LIVER,
    AUTO_OBTAIN_NULL,
    {
      castOde: false,
      hasOwnTracking: true,
      consume: () => prep() && auto_mixAndDrinkCupOfThirteen(pick),
      prep,
    },
  );
}

function auto_mixAndDrinkCupOfThirteen(
  pick: CupOfThirteenIngredient[],
): boolean {
  const prevInebriety: number = myInebriety();
  const preAdvs = myAdventures();
  visitUrl(`inventory.php?pwd=${myHash()}&action=cupof13s`);
  visitUrl(
    `choice.php?pwd=${myHash()}&whichchoice=1601&option=1` +
      `&whichitem1=${pick[0].item.id}&whichitem2=${pick[1].item.id}&whichitem3=${pick[2].item.id}`,
  );

  if (prevInebriety === myInebriety()) {
    visitUrl("main.php"); // Ensure we're not 'still in choice'
    auto_log_warning(
      `Failed to consume cup of 13s ingredients: ${pick.map((i) => i.item.name).join(", ")}`,
    );
    cliExecute("refresh inventory");
  }

  handleTracker({
    what: $item`Cup of 13s`,
    detail: `${myAdventures() - preAdvs}Advs`,
    property: "auto_drunken",
  });

  return myInebriety() !== prevInebriety;
}

export function getDrinkCupOfThirteenForEffect(
  effect: Effect,
): ConsumeAction | undefined {
  // Ensure that we only use this if we can actually use this
  if (!canDrinkCupOfThirteen() || inebriety_left() <= 0 || have(effect)) {
    return undefined;
  }

  return auto_bestCupOfThirteenAction(effect);
}

export function cupOfThirteenBestConsumeAction(): ConsumeAction | undefined {
  if (!canDrinkCupOfThirteen()) {
    return undefined;
  }

  const action = auto_bestCupOfThirteenAction($effect.none);

  if (!action) {
    return undefined;
  }

  // If the adv gain is less than what we could possibly gain, we aim for 4+ adv ingreds, so we lower the desirability
  if (
    action.adventures < Math.min(cupOfThirteenAdvRemaining(), 12) &&
    inebriety_left() >= 4
  ) {
    // If we have at least 7 inebriety left, we're probably not going to run out of room on our next drink, so lower the desirability further to avoid drinking at 9 when we could go higher.
    if (inebriety_left() > 6) {
      action.desirability /= 4;
    } else {
      action.desirability /= 2;
    }
  }

  return action;
}
