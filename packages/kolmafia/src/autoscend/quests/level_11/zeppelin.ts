import {
  buy,
  canEquip,
  create,
  equippedItem,
  haveEffect,
  itemAmount,
  max,
  myClass,
  myDaycount,
  myHp,
  myMeat,
  mySign,
  npcPrice,
  numericModifier,
  squareRoot,
  use,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $modifier,
  $monster,
  $phylum,
  $slots,
  get,
  set,
} from "libram";

import {
  BeachComb,
  CamelSpit,
  CandyCane,
  Cartography,
  GreyGoose,
  Snapper,
} from "../../../types";
import {
  autoEquip,
  equipMaximizedGear,
  equipmentAmount,
  possessEquipment,
} from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { auto_waitForDay2 } from "../../auto_routing";
import { QuestTask, registerQuestTask } from "../../engine/engine";
import {
  autoAdv,
  autoAdvBypass$1,
  autoLuckyAdv,
} from "../../executors/auto_adventure";
import { auto_buyUpTo, pullXWhenHaveY } from "../../helpers/auto_acquire";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import { handleFamiliar$1 } from "../../helpers/auto_familiar";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { bat_formBats } from "../../paths/2019/dark_gyffte";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { is_werewolf } from "../../paths/2024/wereprofessor";
import {
  auto_abort,
  auto_log_debug,
  auto_log_info,
} from "../../utils/auto_log";
import {
  auto_is_valid,
  auto_is_valid$3,
  auto_wishForEffect,
  backupSetting,
  canSniff,
  cloversAvailable,
  internalQuestStatus,
  lastAdventureSpecialNC,
  restoreSetting,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";

function L11_redZeppelin(): boolean {
  if (internalQuestStatus("questL11Shen") < 8 && !isAboutToPowerlevel()) {
    return false;
  }

  if (
    internalQuestStatus("questL11Ron") < 0 ||
    internalQuestStatus("questL11Ron") > 1
  ) {
    return false;
  }

  if (internalQuestStatus("questL11Ron") === 0) {
    return autoAdv($location`A Mob of Zeppelin Protesters`);
  }
  // TODO: create lynyrd skin items

  set("choiceAdventure856", 1);
  if (CandyCane.haveCCSC()) {
    set("choiceAdventure857", 2);
  } else {
    set("choiceAdventure857", 1);
  }
  set("choiceAdventure858", 1);
  buffMaintain$2($effect`Greasy Peasy`);
  buffMaintain$2($effect`Musky`);
  buffMaintain$2($effect`Blood-Gorged`);
  if (!in_wotsf()) {
    pullXWhenHaveY($item`deck of lewd playing cards`, 1, 0);
  }

  if (itemAmount($item`Flamin' Whatshisname`) > 0) {
    backupSetting("choiceAdventure866", (3).toString());
  } else {
    backupSetting("choiceAdventure866", (2).toString());
  }

  if (get("zeppelinProtestors") < 79) {
    maximizer
      .weight($modifier`Sleaze Damage`, 100)
      .weight($modifier`Sleaze Spell Damage`, 100);
    if (auto_is_valid$3($effect`Oiled, Slick`)) {
      BeachComb.beachCombHead("sleaze");
    }
    for (const sl of $slots`acc1, acc2, acc3`) {
      if (
        numericModifier(equippedItem(sl), "sleaze damage") +
          numericModifier(equippedItem(sl), "sleaze spell damage") <
        60
      ) {
        if (
          itemAmount($item`mini kiwi`) >= 2 &&
          equipmentAmount($item`mini kiwi bikini`) < 3 &&
          auto_is_valid($item`mini kiwi bikini`)
        ) {
          create(1, $item`mini kiwi bikini`);
        }
      }
    }
  }

  equipMaximizedGear();

  if (
    auto_is_valid($item`lynyrd snare`) &&
    itemAmount($item`lynyrd snare`) > 0 &&
    get("_lynyrdSnareUses") < 3 &&
    myHp() > 150
  ) {
    return autoAdvBypass$1(
      "inv_use.php?pwd=&whichitem=7204&checked=1",
      $location`A Mob of Zeppelin Protesters`,
    );
  }

  if (get("zeppelinProtestors") < 75 && cloversAvailable() > 0) {
    // "zeppelinProtestors" is number killed so far, so it ends when we hit 80
    if (cloversAvailable() >= 3) {
      if (!in_koe() || myDaycount() > 1) {
        // in koe, if d1 save bend hell for invader
        buffMaintain$2($effect`Bendin' Hell`, 0, 0, 1);
      }
      for (const ef of $effects`Dirty Pear, Fifty Ways to Bereave Your Lover`) {
        // double sleaze dmg, +100 sleaze dmg,
        let target_sleaze: number = 400;
        const current_sleaze: number =
          numericModifier($modifier`Sleaze Damage`) +
          numericModifier($modifier`Sleaze Spell Damage`);
        if (
          possessEquipment($item`candy cane sword cane`) &&
          auto_is_valid($item`candy cane sword cane`)
        ) {
          target_sleaze = 190; // We need so much less sleaze damage with the candy cane sword doubling
        }
        if (current_sleaze < target_sleaze) {
          if (haveEffect(ef) === 0) {
            auto_wishForEffect(ef);
          }
        }
      } // effects
    } // have clovers
    if (in_tcrs()) {
      if (myClass() === $class`Sauceror` && mySign() === "Blender") {
        if (0 === haveEffect($effect`Improprie Tea`)) {
          auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
          use(1, $item`Ben-Gal™ Balm`);
        }
      }
    }
    const fire_protestors: number =
      itemAmount($item`Flamin' Whatshisname`) > 0 ? 10 : 3;
    let sleaze_amount: number =
      numericModifier($modifier`Sleaze Damage`) +
      numericModifier($modifier`Sleaze Spell Damage`);
    if (CandyCane.haveCCSC()) {
      sleaze_amount = sleaze_amount * 2;
    }
    const sleaze_protestors: number = squareRoot(sleaze_amount);
    let lynyrd_protestors: number = haveEffect($effect`Musky`) > 0 ? 6 : 3;
    for (const it of $items`lynyrdskin cap, lynyrdskin tunic, lynyrdskin breeches`) {
      if (possessEquipment(it) && canEquip(it)) {
        lynyrd_protestors += 5;
      }
    }
    auto_log_info(`Hiding in the bushes: ${lynyrd_protestors}`, "blue");
    auto_log_info(`Going to a bench: ${sleaze_protestors}`, "blue");
    auto_log_info(`Heading towards the flames${fire_protestors}`, "blue");
    const best_protestors: number = max(
      fire_protestors,
      max(sleaze_protestors, lynyrd_protestors),
    );
    if (best_protestors >= 10) {
      if (best_protestors === lynyrd_protestors) {
        for (const it of $items`lynyrdskin cap, lynyrdskin tunic, lynyrdskin breeches`) {
          autoEquip(it);
        }
        set("choiceAdventure866", 1);
      } else if (best_protestors === sleaze_protestors) {
        set("choiceAdventure866", 2);
      } else if (best_protestors === fire_protestors) {
        set("choiceAdventure866", 3);
      }
      return autoLuckyAdv($location`A Mob of Zeppelin Protesters`);
    }
  }

  if (get("zeppelinProtestors") < 80 && auto_waitForDay2()) {
    auto_log_debug("Delaying zeppelin protestors waiting for day 2 clovers.");
    return false;
  }

  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    Snapper.changeSnapperPhylum($phylum`dude`);
  }

  const lastProtest: number = get("zeppelinProtestors");
  if (
    canSniff(
      $monster`Blue Oyster cultist`,
      $location`A Mob of Zeppelin Protesters`,
    ) &&
    Cartography.mapTheMonsters()
  ) {
    auto_log_info(
      "Attemping to use Map the Monsters to olfact a Blue Oyster Cultist.",
    );
  }
  const retval: boolean = autoAdv($location`A Mob of Zeppelin Protesters`);
  if (!lastAdventureSpecialNC()) {
    if (lastProtest === get("zeppelinProtestors")) {
      set("zeppelinProtestors", get("zeppelinProtestors") + 1);
    }
  } else {
    set("lastEncounter", "Clear Special NC");
  }
  restoreSetting("choiceAdventure866");
  set("choiceAdventure856", 2);
  set("choiceAdventure857", 2);
  set("choiceAdventure858", 2);
  return retval;
}

function L11_ronCopperhead(): boolean {
  if (
    internalQuestStatus("questL11Ron") < 2 ||
    internalQuestStatus("questL11Ron") > 4
  ) {
    return false;
  }

  if (
    internalQuestStatus("questL11Ron") > 1 &&
    internalQuestStatus("questL11Ron") < 5
  ) {
    if (
      itemAmount($item`Red Zeppelin ticket`) < 1 &&
      !in_wotsf() &&
      !is_werewolf()
    ) {
      // no black market in wotsf, can't access as werewolf
      // use the priceless diamond since we go to the effort of trying to get one in the Copperhead Club
      // and it saves us 4.5k meat.
      if (itemAmount($item`priceless diamond`) > 0) {
        buy($coinmaster`The Black Market`, 1, $item`Red Zeppelin ticket`);
      } else if (myMeat() > npcPrice($item`Red Zeppelin ticket`)) {
        auto_buyUpTo(1, $item`Red Zeppelin ticket`);
      }
    }
    // For Glark Cables. OPTIMAL!
    bat_formBats();
    if (
      canSniff($monster`red butler`, $location`The Red Zeppelin`) &&
      Cartography.mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Red Butler.",
      );
    }
    if (CamelSpit.canCamelSpit()) {
      auto_log_info(
        "Bringing the Camel to spit on a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Melodramedary`);
    }
    if (GreyGoose.haveGreyGoose()) {
      auto_log_info(
        "Bringing the Grey Goose to emit some drones at a Red Butler for glark cables.",
      );
      handleFamiliar$1($familiar`Grey Goose`);
    }
    if (internalQuestStatus("questL11Ron") === 4) {
      set("auto_nextEncounter", 'Ron "The Weasel" Copperhead');
    }
    const retval: boolean = autoAdv($location`The Red Zeppelin`);
    // open red boxes when we get them (not sure if this is the place for this but it'll do for now)
    if (itemAmount($item`red box`) > 0) {
      use(itemAmount($item`red box`), $item`red box`);
    }
    return retval;
  }

  if (internalQuestStatus("questL11Ron") < 5) {
    auto_abort("Ron should be done with but tracking is not complete!");
  }
  // Copperhead Charm (rampant) autocreated successfully
  return false;
}

export const L11_redZeppelinTask: QuestTask = registerQuestTask({
  name: "L11_redZeppelin",
  completed: () => internalQuestStatus("questL11Ron") > 1,
  ready: () => true,
  do: L11_redZeppelin,
  locations: $location`A Mob of Zeppelin Protesters`,
  desiredEncounters: () => [
    {
      item: $item`cigarette lighter`,
      needAmount: auto_is_valid($item`cigarette lighter`)
        ? itemAmount($item`cigarette lighter`) -
          Math.round((80 - get("zeppelinProtestors")) / 3)
        : 0,
    },
    {
      item: $item`lynyrd snare`,
      needAmount: auto_is_valid($item`lynyrd snare`)
        ? 3 - get("_lynyrdSnareUses") - itemAmount($item`lynyrd snare`)
        : 0,
    },
  ],
});

export const L11_ronCopperheadTask: QuestTask = registerQuestTask({
  name: "L11_ronCopperhead",
  completed: () => internalQuestStatus("questL11Ron") > 4,
  ready: () => true,
  do: L11_ronCopperhead,
  locations: $location`The Red Zeppelin`,
  desiredEncounters: () => [
    {
      monster: $monster`Ron "The Weasel" Copperhead`,
      needAmount: internalQuestStatus("questL11Ron") > 4 ? 0 : 1,
    },
    {
      item: $item`glark cable`,
      needAmount: auto_is_valid($item`glark cable`)
        ? Math.min(
            6 - get("zeppelinProgress"),
            5 - (get("_glarkCableUses") + itemAmount($item`glark cable`)),
          )
        : 0,
    },
  ],
});
