import {
  abort,
  availableAmount,
  cliExecute,
  containsText,
  council,
  equip,
  equippedAmount,
  getProperty,
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
  runChoice,
  setProperty,
  toBoolean,
  toInt,
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
} from "libram";

import { auto_buyUpTo, canPull$1, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$1, autoAdv$2 } from "../auto_adventure";
import { buffMaintain$4 } from "../auto_buff";
import { autoEquip$1, possessEquipment } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_reserveUndergroundAdventures,
  canBurnDelay,
} from "../auto_routing";
import {
  auto_can_equip,
  auto_forceNextNoncombat,
  auto_is_valid,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  fightScienceTentacle,
  internalQuestStatus,
} from "../auto_util";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { auto_sourceTerminalEducate } from "../iotms/mr2016";
import { auto_changeSnapperPhylum } from "../iotms/mr2019";
import { auto_canHabitat } from "../iotms/mr2023";
import { auto_haveSpringShoes } from "../iotms/mr2024";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { is_boris } from "../paths/avatar_of_boris";
import { bat_formBats$1 } from "../paths/dark_gyffte";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { lar_repeat } from "../paths/live_ascend_repeat";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { L4_batCave } from "./level_04";
import { shenShouldDelayZone, shenSnakeLocations } from "./level_11";
import { LX_buyStarKeyParts, needStarKey } from "./level_13";

//Defined in autoscend/quests/level_10.ash
export function L10_plantThatBean(): boolean {
  if (internalQuestStatus("questL10Garbage") !== 0) {
    return false;
  }

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
    setProperty("questL10Garbage", "step1");
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
      return autoAdv$2($location`The Beanbat Chamber`);
    }
  }
  return false;
}

export function L10_airship(): boolean {
  if (
    internalQuestStatus("questL10Garbage") < 1 ||
    internalQuestStatus("questL10Garbage") > 6
  ) {
    return false;
  }

  if (myTurncount() === toInt(getProperty("_LAR_skipNC178"))) {
    auto_log_info$1(
      "In LAR path NC178 is forced to reoccur if we skip it. Go do something else.",
    );
    return false;
  }

  if (
    isBanished($phylum`dude`) &&
    !possessEquipment($item`amulet of extreme plot significance`)
  ) {
    setProperty("screechDelay", "dude");
    return false; //Probably should delay the Airship to try for a Quiet Healer
  }

  auto_log_info("The Penultimate Fantasy Airship - unlocking Castle.", "blue");
  if (myMp() > 60 || considerGrimstoneGolem(true)) {
    handleBjornify($familiar`Grimstone Golem`);
  }

  if (
    myDaycount() === 1 &&
    toInt(getProperty("_hipsterAdv")) < 7 &&
    isUnrestricted($familiar`Artistic Goth Kid`) &&
    auto_have_familiar($familiar`Artistic Goth Kid`)
  ) {
    auto_log_info(`Hipster Adv: ${getProperty("_hipsterAdv")}`, "blue");
    handleFamiliar$1($familiar`Artistic Goth Kid`);
  }

  if ($location`The Penultimate Fantasy Airship`.turnsSpent < 10) {
    bat_formBats$1();
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

  if (auto_canHabitat() && toInt(getProperty("breathitinCharges")) < 1) {
    // save turns in the airship with inherently free combats.
    setProperty("auto_habitatMonster", $monster`Eldritch Tentacle`.toString());
    if (fightScienceTentacle()) {
      return true;
    } else {
      setProperty("auto_habitatMonster", "");
    }
  }

  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    auto_changeSnapperPhylum($phylum`dude`);
  }
  autoAdv$2($location`The Penultimate Fantasy Airship`);
  return true;
}

export function castleBasementChoiceHandler(choice: number): void {
  if (choice === 669) {
    // The Fast and the Furry-ous (The Castle in the Clouds in the Sky (Basement))
    runChoice(1); // if umbrella equipped finish quest. without, go to Out in the Open Source (#671)
  } else if (choice === 670) {
    // You Don't Mess Around with Gym (The Castle in the Clouds in the Sky (Basement))
    if (
      internalQuestStatus("questL10Garbage") < 8 &&
      equippedAmount($item`amulet of extreme plot significance`) > 0
    ) {
      runChoice(4); // with amulet equipped, open the ground floor
    } else {
      runChoice(1); // with no amulet, grab the dumbbell. will skip if already have dumbbell
    }
  } else if (choice === 671) {
    // Out in the Open Source (The Castle in the Clouds in the Sky (Basement))
    if (itemAmount($item`massive dumbbell`) > 0) {
      runChoice(1); // with dumbbell, open the ground floor
    } else {
      runChoice(4); // without dumbbell, go to You Don't Mess Around with Gym (#670)
    }
  } else {
    abort("unhandled choice in castleBasementChoiceHandler");
  }
}

export function L10_basement(): boolean {
  if (internalQuestStatus("questL10Garbage") !== 7) {
    return false;
  }

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

  auto_log_info("Castle (Basement) - Unlocking Ground Floor.", "blue");

  if (!inHardcore()) {
    const amulet: Item = $item`amulet of extreme plot significance`;
    if (
      !possessEquipment(amulet) &&
      auto_can_equip(amulet) &&
      canPull$1(amulet)
    ) {
      pullXWhenHaveY(amulet, 1, 0);
    }

    if (!possessEquipment(amulet)) {
      //only consider umbrella if getting amulet fails somehow
      const umbrella: Item = $item`titanium assault umbrella`;
      if (
        !possessEquipment(umbrella) &&
        auto_can_equip(umbrella) &&
        canPull$1(umbrella) &&
        !possessEquipment($item`unbreakable umbrella`)
      ) {
        pullXWhenHaveY(umbrella, 1, 0);
      }
    }
  }

  if (myPrimestat() === $stat`Muscle`) {
    auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
    buffMaintain$4($effect`Go Get 'Em, Tiger!`);
  }
  auto_buyUpTo(1, $item`hair spray`);
  buffMaintain$4($effect`Butt-Rock Hair`);

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
    myDaycount() < toInt(getProperty("auto_runDayCount")) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  if (!autoEquip$1($item`amulet of extreme plot significance`)) {
    if (!autoEquip$1($item`unbreakable umbrella`)) {
      autoEquip$1($item`titanium assault umbrella`);
    }
  }
  autoAdv$1(1, $location`The Castle in the Clouds in the Sky (Basement)`);

  return true;
}

export function L10_ground(): boolean {
  if (internalQuestStatus("questL10Garbage") !== 8) {
    return false;
  }

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

  return autoAdv$2(
    $location`The Castle in the Clouds in the Sky (Ground Floor)`,
  );
}

export function L10_topFloor(): boolean {
  if (
    internalQuestStatus("questL10Garbage") < 9 ||
    internalQuestStatus("questL10Garbage") > 10
  ) {
    return false;
  }

  if (
    possessEquipment($item`Mohawk wig`) &&
    !auto_can_equip($item`Mohawk wig`)
  ) {
    return false;
  }

  if (
    shenShouldDelayZone(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    )
  ) {
    auto_log_debug$1("Delaying Castle (Top Floor) in case of Shen.");
    return false;
  }

  auto_log_info("Castle (Top Floor) - Finishing L10 Quest.", "blue");

  if (
    !possessEquipment($item`Mohawk wig`) &&
    auto_can_equip($item`Mohawk wig`) &&
    canPull$1($item`Mohawk wig`)
  ) {
    pullXWhenHaveY($item`Mohawk wig`, 1, 0);
  }

  const NCForced: boolean = auto_forceNextNoncombat(
    $location`The Castle in the Clouds in the Sky (Top Floor)`,
  );
  // delay if we are out of NC forcers and haven't run out of things to do
  if (
    !NCForced &&
    myDaycount() < toInt(getProperty("auto_runDayCount")) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }
  autoEquip$1($item`Mohawk wig`);
  autoAdv$1(1, $location`The Castle in the Clouds in the Sky (Top Floor)`);

  if (internalQuestStatus("questL10Garbage") > 9) {
    council();
    if (in_koe()) {
      cliExecute("refresh quests");
    }
  }

  return true;
}

export function castleTopFloorChoiceHandler(choice: number): void {
  if (choice === 675) {
    // Melon Collie and the Infinite Lameness (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      itemAmount($item`drum 'n' bass 'n' drum 'n' bass record`) > 0
    ) {
      runChoice(2); // if quest not done and have the record, complete the quest
    } else if (in_koe() && itemAmount($item`model airship`) === 0) {
      runChoice(1); // if we're in koe we only want to go to Copper Feel if we can complete the quest, so fight a goth giant otherwise
    } else {
      runChoice(4); // moves to Copper Feel (#677) in all other scenarios
    }
  } else if (choice === 676) {
    // Flavor of a Raver (The Castle in the Clouds in the Sky (Top Floor))
    if (
      equippedAmount($item`Mohawk wig`) > 0 ||
      internalQuestStatus("questL10Garbage") >= 10
    ) {
      runChoice(4); // if quest not done and have mohawk wig on, or quest is done, move to Yeah, You're for Me (#678)
    } else {
      runChoice(3); // if no mohawk wig and quest not done, grab the drum n bass record. will skip if already have record
    }
  } else if (choice === 677) {
    // Copper Feel (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      itemAmount($item`model airship`) > 0
    ) {
      runChoice(1); // if quest not done and have model airship, complete quest
    } else if (
      (internalQuestStatus("questL10Garbage") < 10 &&
        itemAmount($item`drum 'n' bass 'n' drum 'n' bass record`) > 0) ||
      in_koe()
    ) {
      runChoice(4); // if quest not done and have the record, move to Melon Collie (#675). HITS is open in KoE so no need to grab rocket
    } else {
      runChoice(2); // grab steam-powered rocket ship. will skip if already have rocket
    }
  } else if (choice === 678) {
    // Yeah, You're for Me, Punk Rock Giant (The Castle in the Clouds in the Sky (Top Floor))
    if (
      internalQuestStatus("questL10Garbage") < 10 &&
      equippedAmount($item`Mohawk wig`) > 0
    ) {
      runChoice(1); // if quest not done and mohawk wig equipped, finish quest
    } else if (internalQuestStatus("questL10Garbage") < 10) {
      runChoice(4); // if wig not equipped and quest not done, go to Flavor of a Raver (#676)
    } else {
      runChoice(3); // if quest is done, go to Copper Feel (#677) to get rocket ship or skip
    }
  } else if (choice === 679) {
    // Keep On Turnin' the Wheel in the Sky (The Castle in the Clouds in the Sky (Top Floor))
    if (isActuallyEd()) {
      runChoice(2); // ed advances via choice 2
    } else {
      runChoice(1); // everyone else advances via choice 1
    }
  } else if (choice === 680) {
    // Are you a Man or a Mouse? (The Castle in the Clouds in the Sky (Top Floor))
    runChoice(1); // go to finish quest the long way
  } else {
    abort("unhandled choice in castleTopFloorChoiceHandler");
  }
}

export function L10_holeInTheSkyUnlock(): boolean {
  if (internalQuestStatus("questL10Garbage") < 11) {
    //top floor opens at step9. but we want to finish the giant trash quest first before we do hole in the sky.
    return false;
  }
  if (!toBoolean(getProperty("auto_holeinthesky"))) {
    return false;
  }
  if (itemAmount($item`steam-powered model rocketship`) > 0) {
    setProperty("auto_holeinthesky", false.toString());
    return false;
  }
  LX_buyStarKeyParts();
  const day: number = toInt(getProperty("shenInitiationDay"));
  const shenLocs: Location[] = shenSnakeLocations(day, 0);
  if (!needStarKey() && !shenLocs.includes($location`The Hole in the Sky`)) {
    // we force auto_holeinthesky to true in L11_shenCopperhead() as Ed if Shen sends us to the Hole in the Sky
    // as otherwise the zone isn't required at all for Ed.
    // Should also handle situations where the player manually got the star key before unlocking Shen.
    // or can buy the star key ingredients out of ronin.
    setProperty("auto_holeinthesky", false.toString());
    return false;
  }

  if (
    shenShouldDelayZone(
      $location`The Castle in the Clouds in the Sky (Top Floor)`,
    )
  ) {
    auto_log_debug$1("Delaying unlocking Hole in the Sky in case of Shen.");
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
    myDaycount() < toInt(getProperty("auto_runDayCount")) &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }

  autoAdv$1(1, $location`The Castle in the Clouds in the Sky (Top Floor)`);

  return true;
}

export function L10_rainOnThePlains(): boolean {
  if (
    L10_plantThatBean() ||
    L10_airship() ||
    L10_basement() ||
    L10_ground() ||
    L10_topFloor() ||
    L10_holeInTheSkyUnlock()
  ) {
    return true;
  }
  return false;
}

export function L10_needUmbrella(): boolean {
  for (const it of $items`titanium assault umbrella, unbreakable umbrella`) {
    if (auto_is_valid(it) && availableAmount(it) > 0) {
      return false;
    }
  }
  return true;
}
