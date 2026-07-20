import {
  abort,
  canInteract,
  cliExecute,
  containsText,
  creatableAmount,
  getProperty,
  haveSkill,
  isNpcItem,
  isTradeable,
  Item,
  itemAmount,
  max,
  min,
  myAbsorbs,
  myAdventures,
  myDaycount,
  myLevel,
  myMeat,
  myPath,
  npcPrice,
  retrieveItem,
  Skill,
  stringModifier,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, $items, $path, $skill, $skills } from "libram";

import { auto_advToReserve } from "../../autoscend";
import { auto_buyUpTo, auto_mall_price } from "../auto_acquire";
import {
  auto_have_skill,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  internalQuestStatus,
} from "../auto_util";
import { isSpeakeasyDrink } from "../iotms/clan";
import { isClipartItem } from "../iotms/mr2011";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/gelatinous_noob.ash
export function in_gnoob(): boolean {
  return myPath() === $path`Gelatinous Noob`;
}

export function gnoob_startAscension(page: string): void {
  if (containsText(page, "Welcome to the Kingdom, Gelatinous Noob")) {
    auto_log_info("Starting a new run as Gelatinous Noob", "blue");
    const my_skillPoints: AshMatcher = new AshMatcher(
      'You can pick <span class="num">(\\d+)</span> more skill',
      page,
    );
    if (my_skillPoints.find()) {
      let skillPoints: number = toInt(my_skillPoints.group(1));
      auto_log_info(`Found ${skillPoints} skillpoints`, "blue");
      const skills: number[] = [
        50, 49, 48, 47, 46, 55, 45, 70, 60, 69, 30, 29, 95, 54, 105, 75, 35, 10,
        20, 68, 53, 52, 51, 44, 43, 42, 85, 83, 93, 34, 58, 28, 57, 84, 8, 56,
        6, 18, 17, 37, 7, 9, 67, 59, 39, 74, 73, 72, 40, 66, 77, 78, 38,
      ];

      let goal: string = "";
      for (const idx of skills) {
        if (containsText(page, `name="skills[]" value="${idx}"`)) {
          goal += `&skills[]=${idx}`;
          skillPoints--;
        }
        if (skillPoints === 0) {
          break;
        }
      }

      visitUrl(`choice.php?pwd=&option=1&whichchoice=1230${goal}`);
    }
  }
}

function gnoobAbsorbCost(it: Item): number {
  //estimates the cost of absorbing an item as a gnoob for the specific purpose of sorting which item we prefer to use.
  //this uses the price we have to pay to acquire it rather than the market value of an item.
  //do not check if we already have the item here. as that could result in multiple items of price 0 and not knowing which is better.

  let retval: number = 999999;
  if (isNpcItem(it)) {
    retval = npcPrice(it);
  }
  if (isTradeable(it)) {
    const mall_price: number = auto_mall_price(it);
    if (retval > 0) {
      retval = min(retval, mall_price);
    } else {
      retval = mall_price;
    }
  }

  if (!canInteract()) {
    //do not have unrestricted mall access. meaning ronin or hardcore
    if (
      auto_have_skill($skill`Summon Clip Art`) &&
      toInt(getProperty("_clipartSummons")) < 3 &&
      isClipartItem(it)
    ) {
      retval = 18; //the price to acquire it is only 2 MP which we can highball as 18 meat at galaktik pricing.
    }
    if (itemAmount(it) > 0 && retval < 20000) {
      retval = 0; //set item price to 0 since we have it and it is not unreasonably expensive
    }
  }

  if (retval === 999999) {
    auto_log_debug$1(
      `gnoobAbsorbCost tried to find absorb price of the item [${it}] and could not find a means to acquire it. Returned a massively high price to prevent errors. This should get fixed`,
    );
  }
  if (retval < 0) {
    retval = 999999;
    auto_log_debug$1(
      `gnoobAbsorbCost tried to find absorb price of the item [${it}] and somehow got a result lower than 0. Which is probably indicative of the item being incorrectly listed as tradeable. Returned a massively high price to prevent errors.`,
    );
  }

  return retval;
}

function gnoob_buySkills(): void {
  //Need to consider skill orders, how to handle when we have starting skills.

  const blacklist: Map<Item, boolean> = new Map();

  if (itemAmount($item`Pick-O-Matic lockpicks`) === 1) {
    blacklist.set($item`Pick-O-Matic lockpicks`, true); //do not absorb our last lockpick. could have more than 1 in postronin
  }
  if (
    internalQuestStatus("questL10Garbage") < 2 &&
    itemAmount($item`enchanted bean`) === 1
  ) {
    blacklist.set($item`enchanted bean`, true); //need to keep our only enchanted bean to be planted
  }

  let available: Map<Item, string> = gnoob_lister();
  const starting_absorb_count: number = myAbsorbs();
  let earlyTerm: number =
    max(
      5,
      toInt(getProperty("_noobSkillCount")) +
        (myDaycount() - 1) * min(myLevel() + 2, 15),
    ) +
    toInt(getProperty("noobPoints")) +
    2;

  for (const sk of $skills`Large Intestine, Small Intestine, Stomach-Like Thing, Rudimentary Alimentary Canal, Central Hypothalamus, Arrogance, Sense of Pride, Sense of Purpose, Retractable Toes, Bendable Knees, Ink Gland, Anger Glands, Basic Self-Worth, Work Ethic, Visual Cortex, Saccade Reflex, Frown Muscles, Powerful Vocal Chords, Optic Nerves, Right Eyeball, Left Eyeball, Thumbs, Index Fingers, Middle Fingers, Ring Fingers, Pinky Fingers, Hot Headedness, Sunglasses, Sense of Sarcasm, Beating Human Heart, Oversized Right Kidney, Anterior Cruciate Ligaments, Achilles Tendons, Kneecaps, Ankle Joints, Hamstrings, Pathological Greed, Sense of Entitlement, Business Acumen, Financial Ambition, The Concept of Property, Bravery Gland, Subcutaneous Fat, Adrenal Gland, Nasal Septum, Hyperactive Amygdala, Nasal Lamina Propria, Right Eyelid, Pinchable Nose, Left Eyelid, Nose Hair, Overalls, Rigid Rib Cage, Rigid Headbone`) {
    if (haveSkill(sk)) {
      continue; //no need to do anything for a skill you already have. do not decrement earlyTerm either.
    }
    earlyTerm--;
    if (earlyTerm <= 0) {
      auto_log_debug$1(
        "gnoob_buySkills checked too many skills without getting any. terminating loop early",
      );
      break;
    }
    if (gnoob_absorbsLeft() <= 0) {
      break;
    }

    let possible: Map<number, Item> = new Map();
    for (const it of available.keys()) {
      if (
        !(blacklist.get(it) ?? blacklist.set(it, false).get(it)) &&
        it.noobSkill === sk
      ) {
        possible.set(possible.size, it);
      }
    }
    const bound: number = possible.size;
    if (bound === 0) {
      //we do not have any item that could get us the desired skill
      continue;
    }

    possible = new Map(
      [...possible.entries()]
        .map(([index, value]) => {
          return { _k: index, _v: value, _expr: gnoobAbsorbCost(value) };
        })
        .sort((_a, _b) =>
          _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
        )
        .map((e) => [e._k, e._v]),
    );

    auto_log_info(`Trying to acquire skill ${sk} and considering: `, "green");
    for (let i: number = 0; i < bound; i++) {
      auto_log_info(
        `${possible.get(i) ?? possible.set(i, Item.none).get(i)}: ${gnoobAbsorbCost(possible.get(i) ?? possible.set(i, Item.none).get(i))} meat`,
        "blue",
      );
    }
    //get the skill
    for (let i: number = 0; i < bound && !haveSkill(sk); i++) {
      if (
        itemAmount(possible.get(i) ?? possible.set(i, Item.none).get(i)) === 0
      ) {
        retrieveItem(1, possible.get(i) ?? possible.set(i, Item.none).get(i));
        if (
          itemAmount(possible.get(i) ?? possible.set(i, Item.none).get(i)) === 0
        ) {
          auto_log_info$1(
            `Failed to acquire [${possible.get(i) ?? possible.set(i, Item.none).get(i)}] for gnoob_buySkills`,
          );
          continue;
        }
      }
      cliExecute(
        `absorb ${possible.get(i) ?? possible.set(i, Item.none).get(i)}`,
      );
      if (starting_absorb_count === myAbsorbs()) {
        abort(
          `Tried and failed to absorb [${possible.get(i) ?? possible.set(i, Item.none).get(i)}]. this should not have happened and needs to be fixed`,
        );
      } else {
        available = gnoob_lister(); //recheck item availability now that one was consumed. necessary for tome handling and NPC stores.
      }
    }
  }
  //absorb potted cactus for adventures
  if (
    gnoob_absorbsLeft() > 0 &&
    myAdventures() <= 1 + auto_advToReserve() &&
    myLevel() >= 12
  ) {
    auto_buyUpTo(1, $item`potted cactus`);
    if (itemAmount($item`potted cactus`) > 0) {
      cliExecute("absorb Potted Cactus");
    }
  }
}

function gnoob_lister(goal: string = ""): Map<Item, string> {
  const retval: Map<Item, string> = new Map();
  for (const it of $items.all()) {
    let canGet: boolean = itemAmount(it) > 0 || creatableAmount(it) > 0;
    if (npcPrice(it) > 0 && myMeat() >= npcPrice(it)) {
      canGet = true;
    }
    if (isSpeakeasyDrink(it)) {
      //speakeasy drinks are instantly drank which does not work for gnoob
      canGet = false;
    }
    if (canGet && it.noobSkill !== Skill.none && !haveSkill(it.noobSkill)) {
      let result_1: string = stringModifier(
        it.noobSkill.toString(),
        "Modifiers",
      );
      if (
        $skills`Anger Glands, Bendable Knees, Frown Muscles, Ink Gland, Powerful Vocal Chords, Retractable Toes`.includes(
          it.noobSkill,
        )
      ) {
        result_1 = "Combat Rate";
      }
      if (containsText(result_1, goal)) {
        retval.set(it, result_1);
      }
    }
  }
  return retval;
}

function gnoob_absorbsLeft(): number {
  if (!in_gnoob()) {
    return 0;
  }
  const absorbs: number = min(myLevel() + 2, 15);
  return absorbs - myAbsorbs();
}

export function LM_gnoob(): boolean {
  if (!in_gnoob()) {
    return false;
  }
  gnoob_buySkills();
  return false;
}
