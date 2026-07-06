import {
  abort,
  cliExecute,
  council,
  equippedItem,
  Familiar,
  getProperty,
  haveSkill,
  hiddenTempleUnlocked,
  inHardcore,
  Item,
  itemAmount,
  Location,
  myBasestat,
  myDaycount,
  myMp,
  myPrimestat,
  Skill,
  Slot,
  toBoolean,
  toInt,
  toLocation,
  visitUrl,
} from "kolmafia";
import { autoAdv$1, autoAdv$2 } from "../auto_adventure";
import { autoEquip } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_forceNextNoncombat$1,
  auto_log_debug,
  auto_log_info,
  auto_roughExpectedTurnsLeftToday,
  baseNCForcesToday,
  internalQuestStatus,
  isGuildClass,
  turnsUsedByRemainingNCForcesToday,
} from "../auto_util";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { fantasyRealmToken } from "../iotms/mr2018";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_gnoob } from "../paths/gelatinous_noob";

//Defined in autoscend/quests/level_06.ash
export function L6_friarsGetParts_condition_hardcore(): boolean {
  return inHardcore() && isGuildClass();
}

export function L6_friarsGetParts(): boolean {
  if (
    internalQuestStatus("questL06Friar") < 0 ||
    internalQuestStatus("questL06Friar") > 2
  ) {
    return false;
  }
  if (myMp() > 50 || considerGrimstoneGolem(true)) {
    handleBjornify(Familiar.get("Grimstone Golem"));
  }

  if (Location.get("The Dark Heart of the Woods").turnsSpent === 0) {
    visitUrl("friars.php?action=friars&pwd");
    if (isActuallyEd()) {
      // mafia bug doesn't update the quest property when visiting the Friars as Ed
      // see https://kolmafia.us/showthread.php?24912-minor-questL06Friar-isn-t-changed-to-step1-when-talking-to-the-Friars-as-Ed
      // not that it matters at all, the items we need and locations they're in are the same regardless.
      // but we can force it to update from the quest log
      cliExecute("refresh quests");
    }
  }

  if (equippedItem(Slot.get("shirt")) === Item.get("tunac")) {
    autoEquip(Slot.get("shirt"), Item.none);
  }

  if (
    auto_have_familiar(Familiar.get("Space Jellyfish")) &&
    toInt(getProperty("_spaceJellyfishDrops")) < 2
  ) {
    handleFamiliar$1(Familiar.get("Space Jellyfish"));
  }

  if (in_gnoob() && auto_have_familiar(Familiar.get("Robortender"))) {
    if (
      !haveSkill(Skill.get("Frown Muscles")) &&
      itemAmount(Item.get("bottle of novelty hot sauce")) === 0
    ) {
      handleFamiliar$1(Familiar.get("Robortender"));
    }
  }
  // Don't burn all our NC forces early on d1 unless we are running low on turns.
  if (
    myDaycount() === 1 &&
    !isAboutToPowerlevel() &&
    !toBoolean(getProperty("auto_getSteelOrgan"))
  ) {
    const forced_loc: Location = toLocation(
      getProperty("auto_forceNonCombatLocation"),
    );
    const forced_here: boolean = Location.get([
      "The Dark Neck of the Woods",
      "The Dark Elbow of the Woods",
      "The Dark Heart of the Woods",
    ]).includes(forced_loc);
    const running_low_on_turns: boolean =
      auto_roughExpectedTurnsLeftToday() <
      10 + turnsUsedByRemainingNCForcesToday();
    // Probably need to make sure we still have other stuff to do? Softblock?
    // Could probably then make this run every day.
    const total_daily_forces: number = baseNCForcesToday();
    if (!forced_here && total_daily_forces > 0 && !running_low_on_turns) {
      auto_log_debug(
        "Friars: delaying to save NC forces for later today.",
        "blue",
      );
      return false;
    }
  }

  if (itemAmount(Item.get("dodecagram")) === 0) {
    auto_log_info("Getting Dodecagram", "blue");
    const NCForced: boolean = auto_forceNextNoncombat$1(
      Location.get("The Dark Neck of the Woods"),
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < toInt(getProperty("auto_runDayCount")) &&
      !isAboutToPowerlevel() &&
      !toBoolean(getProperty("auto_getSteelOrgan"))
    ) {
      return false;
    }
    return autoAdv$2(Location.get("The Dark Neck of the Woods"));
  }
  if (itemAmount(Item.get("eldritch butterknife")) === 0) {
    auto_log_info("Getting Eldritch Butterknife", "blue");
    const NCForced: boolean = auto_forceNextNoncombat$1(
      Location.get("The Dark Elbow of the Woods"),
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < toInt(getProperty("auto_runDayCount")) &&
      !isAboutToPowerlevel() &&
      !toBoolean(getProperty("auto_getSteelOrgan"))
    ) {
      return false;
    }
    return autoAdv$2(Location.get("The Dark Elbow of the Woods"));
  }
  if (itemAmount(Item.get("box of birthday candles")) === 0) {
    if (
      toBoolean(getProperty("auto_dakotaFanning")) &&
      internalQuestStatus("questM16Temple") < 0
    ) {
      // if we have to do the "Dakota" Fanning quest to unlock the Hidden Temple,
      // delay adventuring in The Dark Heart of the Woods until the quest is started.
      return false;
    }
    auto_log_info("Getting Box of Birthday Candles", "blue");
    const NCForced: boolean = auto_forceNextNoncombat$1(
      Location.get("The Dark Heart of the Woods"),
    );
    // delay if we are out of NC forcers and haven't run out of things to do
    if (
      !NCForced &&
      myDaycount() < toInt(getProperty("auto_runDayCount")) &&
      !isAboutToPowerlevel() &&
      !toBoolean(getProperty("auto_getSteelOrgan"))
    ) {
      return false;
    }
    return autoAdv$2(Location.get("The Dark Heart of the Woods"));
  }

  auto_log_info("Finishing friars", "blue");
  visitUrl("friars.php?action=ritual&pwd");
  council();
  return internalQuestStatus("questL06Friar") > 2;
}

export function L6_dakotaFanning(): boolean {
  if (!toBoolean(getProperty("auto_dakotaFanning")) || hiddenTempleUnlocked()) {
    return false;
  }
  if (internalQuestStatus("questM16Temple") < 0) {
    if (myBasestat(myPrimestat()) < 35) {
      return false;
    }
    visitUrl("place.php?whichplace=woods&action=woods_dakota_anim");
    return true;
  }

  if (itemAmount(Item.get("pellet of plant food")) === 0) {
    autoAdv$1(1, Location.get("The Haunted Conservatory"));
    return true;
  }

  if (itemAmount(Item.get("heavy-duty bendy straw")) === 0) {
    if (getProperty("questL06Friar") !== "finished") {
      autoAdv$1(1, Location.get("The Dark Heart of the Woods"));
    } else {
      autoAdv$1(1, Location.get("Pandamonium Slums"));
    }
    return true;
  }

  if (itemAmount(Item.get("sewing kit")) === 0) {
    if (itemAmount(Item.get("fat loot token")) > 0) {
      cliExecute(`make ${Item.get("sewing kit")}`);
    } else {
      return fantasyRealmToken();
    }
    return true;
  }

  visitUrl("place.php?whichplace=woods&action=woods_dakota");
  if (getProperty("questM16Temple") !== "finished") {
    abort("Could not finish Dakota Fanning quest, aborting.");
  }
  return true;
}
