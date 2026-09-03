import {
  availableChoiceOptions,
  blackMarketAvailable,
  council,
  creatableAmount,
  create,
  isBanished,
  Item,
  itemAmount,
  myAdventures,
  myDaycount,
  myFamiliar,
  myMeat,
  npcPrice,
  turnsUntilForcedNoncombat,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $familiars,
  $item,
  $location,
  $modifier,
  $monster,
  $phylum,
  $slot,
  get,
  have,
  set,
} from "libram";

import { GreyGoose } from "../../../types";
import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { QuestTask, runQuestTask } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv, autoAdvBypass } from "../../executors/auto_adventure";
import {
  auto_buyUpTo,
  canPull,
  pullXWhenHaveY,
} from "../../helpers/auto_acquire";
import {
  canChangeToFamiliar,
  handleFamiliar$1,
  pathAllowsChangingFamiliar,
} from "../../helpers/auto_familiar";
import { in_bhy } from "../../paths/2011/bees_hate_you";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import {
  in_quantumTerrarium,
  qt_FamiliarSwap,
} from "../../paths/2021/quantum_terrarium";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import {
  in_wereprof,
  is_professor,
  is_werewolf,
} from "../../paths/2024/wereprofessor";
import {
  auto_abort,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  auto_can_equip,
  auto_forceNextNoncombatIfWorthIt,
  auto_is_valid,
  auto_runChoice,
  auto_shouldDelayForForcedNonCombat,
  internalQuestStatus,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";

export function blackForestChoiceHandler(choice: number): void {
  if (choice === 923) {
    // All Over the Map (The Black Forest)
    if (5 in availableChoiceOptions()) {
      // only available with Candy Cane Sword Cane equipped
      auto_runChoice(5); // +8 exploration
      auto_runChoice(1); // go to You Found Your Thrill (#924)
    } else {
      auto_runChoice(1); // go to You Found Your Thrill (#924)
    }
  } else if (choice === 924) {
    if (get("auto_getBeehive", false) && myAdventures() > 3) {
      auto_runChoice(3); // go to Bee Persistent (#1018)
    } else if (
      auto_is_valid($item`blackberry galoshes`) &&
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      auto_runChoice(2); // go to The Blackberry Cobbler (#928)
    } else {
      auto_runChoice(1); // Attack the bushes (fight blackberry bush)
    }
  } else if (choice === 925) {
    // The Blackest Smith (The Black Forest)
    auto_runChoice(5); // skip
  } else if (choice === 926) {
    // Be Mine (The Black Forest)
    auto_runChoice(4); // skip
  } else if (choice === 927) {
    // Sunday Black Sunday (The Black Forest)
    auto_runChoice(3); // skip
  } else if (choice === 928) {
    if (
      !possessEquipment($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) >= 3 &&
      !in_darkGyffte()
    ) {
      auto_runChoice(4); // get Blackberry Galoshes
    } else {
      auto_runChoice(5); // skip
    }
  } else if (choice === 1018) {
    // Bee Persistent (The Black Forest)
    if (get("auto_getBeehive", false) && myAdventures() > 2) {
      auto_runChoice(1); // go to Bee Rewarded (#1019)
    } else {
      auto_runChoice(2); // skip
    }
  } else if (choice === 1019) {
    // Bee Rewarded (The Black Forest)
    if (get("auto_getBeehive", false)) {
      auto_runChoice(1); // get the beehive
    } else {
      auto_runChoice(2); // skip
    }
  } else {
    auto_abort("unhandled choice in blackForestChoiceHandler");
  }
}

function L11_blackMarketDo(): boolean {
  if (isBanished($phylum`beast`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "beast");
    return false; // Can't get the reassembled blackbird if beasts are banished
  }

  if (in_quantumTerrarium()) {
    //swap to the blackbird or crow if we can
    if (
      !$familiars`Reassembled Blackbird, Reconstituted Crow`.includes(
        myFamiliar(),
      )
    ) {
      qt_FamiliarSwap($familiar`Reassembled Blackbird`);
      qt_FamiliarSwap($familiar`Reconstituted Crow`);
    }
  }

  if ($location`The Black Forest`.turnsSpent > 12 && !in_avantGuard()) {
    auto_log_warning(
      "We have spent a bit many adventures in The Black Forest... manually checking",
      "red",
    );
    visitUrl("place.php?whichplace=woods");
    visitUrl("woods.php");
    if ($location`The Black Forest`.turnsSpent > 30) {
      auto_abort(
        'We have spent too many turns in The Black Forest and haven\'t found The Black Market. Something is wrong. (try "refresh quests" on the cli)',
      );
    }
  }

  auto_log_info(
    `Must find the Black Market: ${get("blackForestProgress")}`,
    "blue",
  );
  if (
    internalQuestStatus("questL11Black") === 0 &&
    itemAmount($item`black map`) === 0
  ) {
    council();
    const galoshes: Item = $item`blackberry galoshes`;
    if (
      !possessEquipment(galoshes) &&
      auto_can_equip(galoshes) &&
      canPull(galoshes)
    ) {
      pullXWhenHaveY(galoshes, 1, 0);
    }
  }

  if (itemAmount($item`beehive`) > 0) {
    set("auto_getBeehive", false);
  }

  autoEquipToSlot($slot`acc3`, $item`blackberry galoshes`);
  //If we want the Beehive, and don\'t have enough adventures, this is dangerous.
  if (get("auto_getBeehive", false) && myAdventures() < 3) {
    return false;
  }
  if (
    itemAmount($item`reassembled blackbird`) > 0 &&
    GreyGoose.haveGreyGoose() &&
    !possessEquipment($item`blackberry galoshes`) &&
    itemAmount($item`blackberry`) < 2 &&
    !in_darkGyffte()
  ) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at a blackberry bush.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  if (
    turnsUntilForcedNoncombat($location`The Black Forest`) <= 0 &&
    willFightBlackberryBush() &&
    get("auto_nextEncounter") === $monster.none
  ) {
    set("auto_nextEncounter", $monster`blackberry bush`);

    if (
      !possessEquipment($item`blackberry galoshes`) &&
      auto_is_valid($item`blackberry galoshes`) &&
      itemAmount($item`blackberry`) < 3
    ) {
      maximizer.weight($modifier`Item Drop`, 15, true);
    }
  }

  const advSpent: boolean = autoAdv($location`The Black Forest`);
  //For people with autoCraft set to false for some reason
  if (
    itemAmount($item`reassembled blackbird`) === 0 &&
    creatableAmount($item`reassembled blackbird`) > 0
  ) {
    create(1, $item`reassembled blackbird`);
  }
  if (advSpent) {
    return true;
  }
  return false;
}

function willFightBlackberryBush(): boolean {
  // If we would fight the blackberry push
  return (
    auto_is_valid($item`blackberry galoshes`) &&
    possessEquipment($item`blackberry galoshes`) &&
    (!have($item`beehive`) || myAdventures() > 3)
  );
}

export const L11_blackMarketTask: QuestTask = registerQuestTask({
  name: "L11_blackMarket",
  completed: () =>
    internalQuestStatus("questL11Black") > 1 || blackMarketAvailable(),
  ready: () =>
    internalQuestStatus("questL11Black") >= 0 &&
    !(
      possessEquipment($item`blackberry galoshes`) &&
      !auto_can_equip($item`blackberry galoshes`) &&
      !isAboutToPowerlevel()
    ),
  do: L11_blackMarketDo,
  locations: $location`The Black Forest`,
  desiredEncounters: () => [
    {
      item: $item`black map`,
      needAmount:
        internalQuestStatus("questL11Black") > 1 ||
        blackMarketAvailable() ||
        itemAmount($item`black map`) > 0
          ? 0
          : 1,
    },
    {
      item: $item`blackberry`,
      needAmount:
        possessEquipment($item`blackberry galoshes`) ||
        !auto_can_equip($item`blackberry galoshes`)
          ? 0
          : 3 - itemAmount($item`blackberry`),
    },
    {
      item: !in_bhy() ? $item`broken wings` : $item`busted wings`,
      needAmount:
        (pathAllowsChangingFamiliar() ? 1 : 0) -
        (itemAmount(!in_bhy() ? $item`broken wings` : $item`busted wings`) +
          (canChangeToFamiliar(
            !in_bhy()
              ? $familiar`Reassembled Blackbird`
              : $familiar`Reconstituted Crow`,
          )
            ? 1
            : 0)),
    },
    {
      item: !in_bhy() ? $item`sunken eyes` : $item`bird brain`,
      needAmount:
        (pathAllowsChangingFamiliar() ? 1 : 0) -
        (itemAmount(!in_bhy() ? $item`sunken eyes` : $item`bird brain`) +
          (canChangeToFamiliar(
            !in_bhy()
              ? $familiar`Reassembled Blackbird`
              : $familiar`Reconstituted Crow`,
          )
            ? 1
            : 0)),
    },
  ],
});

export function L11_blackMarket(): boolean {
  return runQuestTask(L11_blackMarketTask);
}

function L11_getBeehiveDo(): boolean {
  if (
    internalQuestStatus("questL13Final") >= 7 ||
    itemAmount($item`beehive`) > 0
  ) {
    auto_log_info(
      "Nevermind, wall of skin already defeated (or we already have a beehiven). We do not need a beehive. Bloop.",
      "blue",
    );
    set("auto_getBeehive", false);
    return false;
  }

  // If we're forcing a NC and it's not ready yet
  if (auto_shouldDelayForForcedNonCombat($location`The Black Forest`)) {
    return false;
  }

  auto_log_info("Must find a beehive!", "blue");

  const NCForced: boolean = auto_forceNextNoncombatIfWorthIt(
    $location`The Black Forest`,
  );
  // Bail if the NC forcer isn't armed yet
  if (
    !NCForced &&
    auto_shouldDelayForForcedNonCombat($location`The Black Forest`)
  ) {
    return false;
  }
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < get("auto_runDayCount", 0) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  const advSpent: boolean = autoAdv($location`The Black Forest`);
  if (itemAmount($item`beehive`) > 0) {
    set("auto_getBeehive", false);
  }
  return advSpent;
}

export const L11_getBeehiveTask: QuestTask = registerQuestTask({
  name: "L11_getBeehive",
  completed: () =>
    internalQuestStatus("questL13Final") >= 7 || itemAmount($item`beehive`) > 0,
  ready: () => blackMarketAvailable() && get("auto_getBeehive", false),
  do: L11_getBeehiveDo,
  locations: $location`The Black Forest`,
  desiredEncounters: () => [
    {
      item: $item`blackberry`,
      needAmount:
        possessEquipment($item`blackberry galoshes`) ||
        !auto_can_equip($item`blackberry galoshes`)
          ? 0
          : 3 - itemAmount($item`blackberry`),
    },
  ],
  forcedNonCombats: () => [
    { turnsRequiredForSetup: 0, combatRateControlled: false },
  ],
});

export function L11_getBeehive(): boolean {
  return runQuestTask(L11_getBeehiveTask);
}

function L11_forgedDocumentsDo(): boolean {
  if (
    !in_wotsf() &&
    myMeat() < npcPrice($item`forged identification documents`)
  ) {
    if (isAboutToPowerlevel()) {
      auto_abort(
        "Could not afford to buy Forged Identification Documents, can not steal identities!",
      );
    }
    return false;
  }

  auto_log_info("Getting the McMuffin Book", "blue");
  if (in_wotsf()) {
    // TODO: move this to WotSF path file if one is ever created.
    const pages: Map<number, string> = new Map();
    pages.set(0, "shop.php?whichshop=blackmarket");
    pages.set(1, "shop.php?whichshop=blackmarket&action=fightbmguy");
    return autoAdvBypass(0, pages, $location`Noob Cave`);
  }
  if (is_werewolf()) {
    return false; // can't access shops as a werewolf
  }
  auto_buyUpTo(1, $item`forged identification documents`);
  if (itemAmount($item`forged identification documents`) > 0) {
    return true;
  }
  auto_log_warning(
    "Could not buy Forged Identification Documents, can't get booze now!",
    "red",
  );
  return false;
}

export const L11_forgedDocumentsTask: QuestTask = registerQuestTask({
  name: "L11_forgedDocuments",
  completed: () =>
    internalQuestStatus("questL11Black") > 2 ||
    itemAmount($item`forged identification documents`) > 0,
  ready: () =>
    internalQuestStatus("questL11Black") >= 0 &&
    blackMarketAvailable() &&
    (!in_wereprof() || is_professor()),
  do: L11_forgedDocumentsDo,
});
