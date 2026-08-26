import {
  availableAmount,
  cliExecute,
  containsText,
  council,
  equip,
  equippedAmount,
  haveSkill,
  inHardcore,
  isBanished,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  myDaycount,
  myMp,
  myPrimestat,
  myTurncount,
  toLocation,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $phylum,
  $skill,
  $slot,
  $stat,
  get,
  set,
} from "libram";

import { auto_buyUpTo, canPull, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import { autoEquip, possessEquipment } from "../auto_equipment";
import {
  auto_have_familiar,
  canChangeToFamiliar,
  handleFamiliar$1,
} from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_reserveUndergroundAdventures,
  canBurnDelay,
  isSoftBlockInPlace,
} from "../auto_routing";
import {
  auto_abort,
  auto_can_equip,
  auto_forceNextNoncombat,
  auto_have_skill,
  auto_is_valid,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  auto_shouldDelayForForcedNonCombat,
  fightScienceTentacle,
  internalQuestStatus,
} from "../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/2010/mr2014";
import { auto_sourceTerminalEducate } from "../iotms/2010/mr2016";
import { auto_changeSnapperPhylum } from "../iotms/2010/mr2019";
import { auto_canHabitat } from "../iotms/2020/mr2023";
import { auto_haveSpringShoes } from "../iotms/2020/mr2024";
import { auto_haveMonodent } from "../iotms/2020/mr2025";
import { auto_swordFamiliarWantsMonsterDrops } from "../iotms/2020/mr2026";
import { in_wotsf } from "../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../paths/2012/avatar_of_boris";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_gnoob } from "../paths/2017/gelatinous_noob";
import { lar_repeat } from "../paths/2017/live_ascend_repeat";
import { bat_formBats } from "../paths/2019/dark_gyffte";
import { in_koe } from "../paths/2019/kingdom_of_exploathing";
import { inAftercore } from "../paths/casual";
import { L4_batCave } from "./level_04";
import { shenShouldDelayZone, shenSnakeLocations } from "./level_11";
import { LX_buyStarKeyParts, needStarKey } from "./level_13";

//Defined in autoscend/quests/level_10.ash
function L10_plantThatBeanDo(): boolean {
  auto_log_info(
    "Planting enchanted bean to open the beanstalk and start L10 quest.",
    "blue",
  );
  const page: string = visitUrl("place.php?whichplace=plains");
  if (containsText(page, "place.php?whichplace=beanstalk")) {
    auto_log_warning(
      "I see the beanstalk has already been planted. Fixing questL10Garbage to step1.",
      "blue",
    );
    set("questL10Garbage", "step1");
    return true;
  }
  if (itemAmount($item`enchanted bean`) > 0) {
    if (auto_haveSpringShoes()) {
      // shoes gives stats when planting bean, but must be equipped
      equip($slot`acc3`, $item`spring shoes`); //free stats
    }
    visitUrl("place.php?whichplace=plains&action=garbage_grounds");
    return true;
  } else {
    // make sure we can get an enchanted bean to open the beanstalk with if we can't open it.
    if (L4_batCave()) {
      return true;
    } else {
      auto_log_info(
        "No enchanted bean. Getting one from The Beanbat Chamber.",
        "blue",
      );
      return autoAdv($location`The Beanbat Chamber`);
    }
  }
  return false;
}
const L10_rainOnThePlainsTask: QuestTask = registerQuestTask({
  name: "L10_rainOnThePlains",
  completed: () =>
    itemAmount($item`steam-powered model rocketship`) > 0 &&
    internalQuestStatus("questL10Garbage") >= 11,
  ready: () => true,
  do: L10_rainOnThePlainsDo,
});

export const L10_plantThatBeanTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_plantThatBean",
    completed: () => internalQuestStatus("questL10Garbage") > 0,
    ready: () => internalQuestStatus("questL10Garbage") === 0,
    do: L10_plantThatBeanDo,
    desiredEncounters: () => [
      {
        item: $item`enchanted bean`,
        needAmount: 1 - itemAmount($item`enchanted bean`),
      },
    ],
  },
);

export function L10_plantThatBean(): boolean {
  return runQuestTask(L10_plantThatBeanTask);
}

function L10_airshipDo(): boolean {
  if (myTurncount() === get("_LAR_skipNC178", 0)) {
    auto_log_info(
      "In LAR path NC178 is forced to reoccur if we skip it. Go do something else.",
    );
    return false;
  }

  if (
    isBanished($phylum`dude`) &&
    !possessEquipment($item`amulet of extreme plot significance`)
  ) {
    set("_auto_screechDelay", "dude");
    return false; //Probably should delay the Airship to try for a Quiet Healer
  }

  if (
    // If the sword fam isn't desiring the drops, then it's in a bad state and can be skipped
    canChangeToFamiliar($familiar`Sword of S Words`) &&
    auto_haveMonodent() &&
    (auto_swordFamiliarWantsMonsterDrops($monster`giant squid`, 100) ||
      (!inAftercore() &&
        itemAmount($item`ink bladder`) > 5 &&
        auto_haveMonodent() &&
        get("_seadentWaveUsed") &&
        toLocation(get("_seadentWaveZone")) !==
          $location`The Penultimate Fantasy Airship`)) &&
    get("auto_attemptToBladdermax") &&
    isSoftBlockInPlace(
      "swordTrackingCurrentTarget",
      "ink bladders are not ready",
    )
  ) {
    auto_log_debug(
      "Delaying L10 airship - still farming ink bladders via Giant Squid.",
    );
    return false;
  }

  auto_log_info("The Penultimate Fantasy Airship - unlocking Castle.", "blue");
  if (myMp() > 60 || considerGrimstoneGolem(true)) {
    handleBjornify($familiar`Grimstone Golem`);
  }

  if (
    myDaycount() === 1 &&
    get("_hipsterAdv") < 7 &&
    isUnrestricted($familiar`Artistic Goth Kid`) &&
    auto_have_familiar($familiar`Artistic Goth Kid`)
  ) {
    auto_log_info(`Hipster Adv: ${get("_hipsterAdv")}`, "blue");
    handleFamiliar$1($familiar`Artistic Goth Kid`);
  }

  if ($location`The Penultimate Fantasy Airship`.turnsSpent < 10) {
    bat_formBats();
  }

  if (
    isActuallyEd() &&
    $location`The Penultimate Fantasy Airship`.turnsSpent < 1
  ) {
    // temp workaround for mafia bug.
    // see https://kolmafia.us/showthread.php?24767-Quest-tracking-preferences-change-request(s)&p=156733&viewfull=1#post156733
    // still not fixed as of r19986
    visitUrl("place.php?whichplace=beanstalk");
  }

  if (auto_canHabitat() && get("breathitinCharges") < 1) {
    // save turns in the airship with inherently free combats.
    set("auto_habitatMonster", $monster`Eldritch Tentacle`);
    if (fightScienceTentacle()) {
      return true;
    } else {
      set("auto_habitatMonster", "");
    }
  }

  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    auto_changeSnapperPhylum($phylum`dude`);
  }
  autoAdv($location`The Penultimate Fantasy Airship`);
  return true;
}

export const L10_airshipTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_airship",
    completed: () => internalQuestStatus("questL10Garbage") > 6,
    ready: () => internalQuestStatus("questL10Garbage") >= 1,
    do: L10_airshipDo,
    locations: $location`The Penultimate Fantasy Airship`,
    desiredEncounters: () => [
      {
        item: $item`Mohawk wig`,
        needAmount:
          !auto_have_skill($skill`Comprehensive Cartography`) &&
          auto_can_equip($item`Mohawk wig`) &&
          !possessEquipment($item`Mohawk wig`) &&
          internalQuestStatus("questL10Garbage") <= 10
            ? 1
            : 0,
      },
      {
        item: $item`amulet of extreme plot significance`,
        needAmount:
          auto_can_equip($item`amulet of extreme plot significance`) &&
          !possessEquipment($item`amulet of extreme plot significance`) &&
          internalQuestStatus("questL10Garbage") <= 6
            ? 1
            : 0,
      },
      {
        item: $item`titanium assault umbrella`,
        needAmount:
          auto_can_equip($item`titanium assault umbrella`) &&
          !possessEquipment($item`titanium assault umbrella`) &&
          internalQuestStatus("questL10Garbage") <= 6
            ? 1
            : 0,
      },
    ],
  },
);

export function L10_airship(): boolean {
  return runQuestTask(L10_airshipTask);
}

export function castleBasementChoiceHandler(choice: number): void {
  if (choice === 669) {
    // The Fast and the Furry-ous (The Castle in the Clouds in the Sky (Basement))
    auto_runChoice(1); // if umbrella equipped finish quest. without, go to Out in the Open Source (#671)
  } else if (choice === 670) {
    // You Don't Mess Around with Gym (The Castle in the Clouds in the Sky (Basement))
    if (
      internalQuestStatus("questL10Garbage") < 8 &&
      equippedAmount($item`amulet of extreme plot significance`) > 0
    ) {
      auto_runChoice(4); // with amulet equipped, open the ground floor
    } else {
      auto_runChoice(1); // with no amulet, grab the dumbbell. will skip if already have dumbbell
    }
  } else if (choice === 671) {
    // Out in the Open Source (The Castle in the Clouds in the Sky (Basement))
    if (itemAmount($item`massive dumbbell`) > 0) {
      auto_runChoice(1); // with dumbbell, open the ground floor
    } else {
      auto_runChoice(4); // without dumbbell, go to You Don't Mess Around with Gym (#670)
    }
  } else {
    auto_abort("unhandled choice in castleBasementChoiceHandler");
  }
}

function L10_basementDo(): boolean {
  if (possessEquipment($item`amulet of extreme plot significance`)) {
    if (!auto_can_equip($item`amulet of extreme plot significance`)) {
      return false;
    }
  } else if (
    possessEquipment($item`titanium assault umbrella`) &&
    !in_wotsf() &&
    !is_boris() &&
    !auto_can_equip($item`titanium assault umbrella`)
  ) {
    return false;
  }

  if (auto_reserveUndergroundAdventures()) {
    return false;
  }

  // If we're forcing a NC and it's not ready yet
  if (
    auto_shouldDelayForForcedNonCombat(
      $location`The Castle in the Clouds in the Sky (Basement)`,
    )
  ) {
    return false;
  }

  auto_log_info("Castle (Basement) - Unlocking Ground Floor.", "blue");

  if (!inHardcore()) {
    const amulet: Item = $item`amulet of extreme plot significance`;
    if (
      !possessEquipment(amulet) &&
      auto_can_equip(amulet) &&
      canPull(amulet)
    ) {
      pullXWhenHaveY(amulet, 1, 0);
    }

    if (!possessEquipment(amulet)) {
      //only consider umbrella if getting amulet fails somehow
      const umbrella: Item = $item`titanium assault umbrella`;
      if (
        !possessEquipment(umbrella) &&
        auto_can_equip(umbrella) &&
        canPull(umbrella) &&
        !possessEquipment($item`unbreakable umbrella`)
      ) {
        pullXWhenHaveY(umbrella, 1, 0);
      }
    }
  }

  if (myPrimestat() === $stat`Muscle`) {
    auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
    buffMaintain$2($effect`Go Get 'Em, Tiger!`);
  }
  auto_buyUpTo(1, $item`hair spray`);
  buffMaintain$2($effect`Butt-Rock Hair`);

  if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
    if (
      !haveSkill($skill`Bendable Knees`) &&
      itemAmount($item`bottle of gregnadigne`) === 0
    ) {
      handleFamiliar$1($familiar`Robortender`);
    }
  }

  const NCForced: boolean = auto_forceNextNoncombat(
    $location`The Castle in the Clouds in the Sky (Basement)`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < get("auto_runDayCount", 0) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  if (!autoEquip($item`amulet of extreme plot significance`)) {
    if (!autoEquip($item`unbreakable umbrella`)) {
      autoEquip($item`titanium assault umbrella`);
    }
  }
  autoAdv($location`The Castle in the Clouds in the Sky (Basement)`);

  return true;
}

export const L10_basementTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_basement",
    completed: () => internalQuestStatus("questL10Garbage") > 7,
    ready: () => internalQuestStatus("questL10Garbage") === 7,
    do: L10_basementDo,
    locations: $location`The Castle in the Clouds in the Sky (Basement)`,
  },
);

export function L10_basement(): boolean {
  return runQuestTask(L10_basementTask);
}

function L10_groundDo(): boolean {
  if (
    !lar_repeat($location`The Castle in the Clouds in the Sky (Ground Floor)`)
  ) {
    return false;
  }

  if (
    canBurnDelay($location`The Castle in the Clouds in the Sky (Ground Floor)`)
  ) {
    return false;
  }

  auto_log_info("Castle (Ground Floor) - Unlocking Top Floor.", "blue");

  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);

  if (in_gnoob() && auto_have_familiar($familiar`Robortender`)) {
    if (
      !haveSkill($skill`Bendable Knees`) &&
      itemAmount($item`bottle of gregnadigne`) === 0
    ) {
      handleFamiliar$1($familiar`Robortender`);
    }
  }

  return autoAdv($location`The Castle in the Clouds in the Sky (Ground Floor)`);
}

export const L10_groundTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_ground",
    completed: () => internalQuestStatus("questL10Garbage") > 8,
    ready: () => internalQuestStatus("questL10Garbage") === 8,
    do: L10_groundDo,
    locations: $location`The Castle in the Clouds in the Sky (Ground Floor)`,
  },
);

export function L10_ground(): boolean {
  return runQuestTask(L10_groundTask);
}

function L10_topFloorDo(): boolean {
  if (
    shenShouldDelayZone(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    )
  ) {
    auto_log_debug("Delaying Castle (Top Floor) in case of Shen.");
    return false;
  }

  // If we're forcing a NC and it's not ready yet
  if (
    auto_shouldDelayForForcedNonCombat(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    )
  ) {
    return false;
  }

  auto_log_info("Castle (Top Floor) - Finishing L10 Quest.", "blue");

  if (
    !possessEquipment($item`Mohawk wig`) &&
    auto_can_equip($item`Mohawk wig`) &&
    canPull($item`Mohawk wig`)
  ) {
    pullXWhenHaveY($item`Mohawk wig`, 1, 0);
  }

  const NCForced: boolean = auto_forceNextNoncombat(
    $location`The Castle in the Clouds in the Sky (Top Floor)`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < get("auto_runDayCount", 0) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  autoEquip($item`Mohawk wig`);
  autoAdv($location`The Castle in the Clouds in the Sky (Top Floor)`);

  if (internalQuestStatus("questL10Garbage") > 9) {
    council();
    if (in_koe()) {
      cliExecute("refresh quests");
    }
  }

  return true;
}

export const L10_topFloorTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_topFloor",
    completed: () => internalQuestStatus("questL10Garbage") > 10,
    ready: () =>
      internalQuestStatus("questL10Garbage") >= 9 &&
      (!possessEquipment($item`Mohawk wig`) ||
        auto_can_equip($item`Mohawk wig`)),
    do: L10_topFloorDo,
    locations: $location`The Castle in the Clouds in the Sky (Top Floor)`,
  },
);

export function L10_topFloor(): boolean {
  return runQuestTask(L10_topFloorTask);
}

export function castleTopFloorChoiceHandler(choice: number): void {
  if (choice === 675) {
    // Melon Collie and the Infinite Lameness (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      itemAmount($item`drum 'n' bass 'n' drum 'n' bass record`) > 0
    ) {
      auto_runChoice(2); // if quest not done and have the record, complete the quest
    } else if (in_koe() && itemAmount($item`model airship`) === 0) {
      auto_runChoice(1); // if we're in koe we only want to go to Copper Feel if we can complete the quest, so fight a goth giant otherwise
    } else {
      auto_runChoice(4); // moves to Copper Feel (#677) in all other scenarios
    }
  } else if (choice === 676) {
    // Flavor of a Raver (The Castle in the Clouds in the Sky (Top Floor))
    if (
      equippedAmount($item`Mohawk wig`) > 0 ||
      internalQuestStatus("questL10Garbage") >= 10
    ) {
      auto_runChoice(4); // if quest not done and have mohawk wig on, or quest is done, move to Yeah, You're for Me (#678)
    } else {
      auto_runChoice(3); // if no mohawk wig and quest not done, grab the drum n bass record. will skip if already have record
    }
  } else if (choice === 677) {
    // Copper Feel (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      itemAmount($item`model airship`) > 0
    ) {
      auto_runChoice(1); // if quest not done and have model airship, complete quest
    } else if (
      (internalQuestStatus("questL10Garbage") < 10 &&
        itemAmount($item`drum 'n' bass 'n' drum 'n' bass record`) > 0) ||
      in_koe()
    ) {
      auto_runChoice(4); // if quest not done and have the record, move to Melon Collie (#675). HITS is open in KoE so no need to grab rocket
    } else {
      auto_runChoice(2); // grab steam-powered rocket ship. will skip if already have rocket
    }
  } else if (choice === 678) {
    // Yeah, You're for Me, Punk Rock Giant (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      equippedAmount($item`Mohawk wig`) > 0
    ) {
      auto_runChoice(1); // if quest not done and mohawk wig equipped, finish quest
    } else if (internalQuestStatus("questL10Garbage") < 10) {
      auto_runChoice(4); // if wig not equipped and quest not done, go to Flavor of a Raver (#676)
    } else {
      auto_runChoice(3); // if quest is done, go to Copper Feel (#677) to get rocket ship or skip
    }
  } else if (choice === 679) {
    // Keep On Turnin' the Wheel in the Sky (The Castle in the Clouds in the Sky (Top Floor))
    if (isActuallyEd()) {
      auto_runChoice(2); // ed advances via choice 2
    } else {
      auto_runChoice(1); // everyone else advances via choice 1
    }
  } else if (choice === 680) {
    // Are you a Man or a Mouse? (The Castle in the Clouds in the Sky (Top Floor))
    auto_runChoice(1); // go to finish quest the long way
  } else {
    auto_abort("unhandled choice in castleTopFloorChoiceHandler");
  }
}

function L10_holeInTheSkyUnlockDo(): boolean {
  if (itemAmount($item`steam-powered model rocketship`) > 0) {
    set("auto_holeinthesky", false);
    return false;
  }
  LX_buyStarKeyParts();
  const day: number = get("shenInitiationDay");
  const shenLocs: Location[] = shenSnakeLocations(day, 0);
  if (!needStarKey() && !shenLocs.includes($location`The Hole in the Sky`)) {
    // we force auto_holeinthesky to true in L11_shenCopperhead() as Ed if Shen sends us to the Hole in the Sky
    // as otherwise the zone isn't required at all for Ed.
    // Should also handle situations where the player manually got the star key before unlocking Shen.
    // or can buy the star key ingredients out of ronin.
    set("auto_holeinthesky", false);
    return false;
  }

  if (
    shenShouldDelayZone(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    )
  ) {
    auto_log_debug("Delaying unlocking Hole in the Sky in case of Shen.");
    return false;
  }
  // If we're forcing a NC and it's not ready yet
  if (auto_shouldDelayForForcedNonCombat($location`The Hole in the Sky`)) {
    return false;
  }

  auto_log_info("Castle (Top Floor) - Opening the Hole in the Sky.", "blue");
  // set location "wrong" so that LX_ForceNC can properly direct back to this function (L10_holeInTheSkyUnlock)
  const NCForced: boolean = auto_forceNextNoncombat(
    $location`The Hole in the Sky`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < get("auto_runDayCount", 0) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }

  autoAdv($location`The Castle in the Clouds in the Sky (Top Floor)`);

  return true;
}

export const L10_holeInTheSkyUnlockTask: QuestTask = registerQuestTask(
  L10_rainOnThePlainsTask,
  {
    name: "L10_holeInTheSkyUnlock",
    completed: () => itemAmount($item`steam-powered model rocketship`) > 0,
    // top floor opens at step9. but we want to finish the giant trash quest first before we do hole in the sky.
    ready: () =>
      internalQuestStatus("questL10Garbage") >= 11 &&
      get("auto_holeinthesky", false),
    do: L10_holeInTheSkyUnlockDo,
    locations: $location`The Castle in the Clouds in the Sky (Top Floor)`,
  },
);

export function L10_holeInTheSkyUnlock(): boolean {
  return runQuestTask(L10_holeInTheSkyUnlockTask);
}

function L10_rainOnThePlainsDo(): boolean {
  return runTaskChain([
    L10_plantThatBeanTask,
    L10_airshipTask,
    L10_basementTask,
    L10_groundTask,
    L10_topFloorTask,
    L10_holeInTheSkyUnlockTask,
  ]);
}

export function L10_rainOnThePlains(): boolean {
  return runQuestTask(L10_rainOnThePlainsTask);
}

export function L10_needUmbrella(): boolean {
  for (const it of $items`titanium assault umbrella, unbreakable umbrella`) {
    if (auto_is_valid(it) && availableAmount(it) > 0) {
      return false;
    }
  }
  return true;
}

export function L10_needAmuletOfPlotSignificance(): boolean {
  return (
    auto_is_valid($item`amulet of extreme plot significance`) &&
    !possessEquipment($item`amulet of extreme plot significance`) &&
    internalQuestStatus("questL10Garbage") < 8
  );
}
