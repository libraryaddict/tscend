import {
  abort,
  appearanceRates,
  cliExecute,
  Familiar,
  floor,
  getProperty,
  inebrietyLimit,
  itemAmount,
  Location,
  min,
  myAdventures,
  myBasestat,
  myBjornedFamiliar,
  myClass,
  myInebriety,
  myLevel,
  myMeat,
  myPrimestat,
  myThrall,
  myTurncount,
  print,
  setProperty,
  toBoolean,
  toInt,
  toThrall,
  useSkill,
  wait,
} from "kolmafia";
import {
  $class,
  $element,
  $familiar,
  $item,
  $location,
  $monster,
  $phylum,
  $skill,
  $stat,
  $thrall,
} from "libram";

import { auto_advToReserve } from "../autoscend";
import { autoAdv$1, autoAdv$2 } from "./auto_adventure";
import { inebriety_left, stomach_left } from "./auto_consume";
import { addToMaximize, resetMaximize } from "./auto_equipment";
import {
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
} from "./auto_familiar";
import {
  providePlusNonCombat$1,
  providePlusNonCombat$3,
} from "./auto_providers";
import { doFreeRest, haveFreeRestAvailable } from "./auto_restore";
import {
  auto_combatModCap,
  auto_have_skill,
  auto_log_debug$1,
  auto_log_warning,
  backupSetting,
  evokeEldritchHorror,
  fightScienceTentacle,
  internalQuestStatus,
  loopHandlerDelayAll,
  meatReserve,
  pm_updateThrall,
} from "./auto_util";
import { zone_isAvailable } from "./auto_zone";
import { canUse$2 } from "./combat/auto_combat_util";
import { elementalPlanes_access } from "./iotms/elementalPlanes";
import { handleBjornify } from "./iotms/mr2014";
import { chateaumantegna_available } from "./iotms/mr2015";
import { snojoFightAvailable, timeSpinnerAdventure } from "./iotms/mr2016";
import {
  godLobsterCombat,
  neverendingPartyAvailable,
  neverendingPartyCombat,
  neverendingPartyRemainingFreeFights,
} from "./iotms/mr2018";
import { auto_changeSnapperPhylum } from "./iotms/mr2019";
import {
  auto_canFightPiranhaPlant,
  auto_canTendMushroomGarden,
  auto_mushroomGardenHandler,
  auto_piranhaPlantFightsRemaining,
} from "./iotms/mr2020";
import {
  auto_hasSpeakEasy,
  auto_remainingSpeakeasyFreeFights,
} from "./iotms/mr2022";
import {
  auto_fightFlamingLeaflet,
  auto_haveAugustScepter,
  auto_haveBurningLeaves,
  auto_remainingBurningLeavesFights,
} from "./iotms/mr2023";
import { in_avantGuard } from "./paths/avant_guard";
import { inAftercore } from "./paths/casual";
import { in_koe } from "./paths/kingdom_of_exploathing";
import {
  in_theSource,
  LX_attemptPowerLevelTheSource,
} from "./paths/the_source";
import { is_professor } from "./paths/wereprofessor";
import { in_robot, LX_robot_powerlevel } from "./paths/you_robot";
import { candyBlock, freeCandyFightsLeft } from "./quests/level_any";

//Defined in autoscend/auto_powerlevel.ash
export function isAboutToPowerlevel(): boolean {
  return toInt(getProperty("auto_powerLevelLastLevel")) === myLevel();
}

export function highestScalingZone(): Location {
  if (myAdventures() > 2 && is_professor()) {
    //only give a scaling location as professor if at bedtime
    return Location.none;
  }
  //all scaling zones have monster level = my_buffedstat($stat[moxie]) + monster_level_adjustment() + enemy_value. up to a cap
  //returns the zone with the highest enemy_value which we can adventure in
  if (neverendingPartyAvailable()) {
    //+20 enemy value
    return $location`The Neverending Party`;
  }
  if (elementalPlanes_access($element`cold`)) {
    //+6 (male viking) or +10 (female viking) enemy value
    return $location`VYKEA`;
  }
  if (elementalPlanes_access($element`hot`)) {
    //+1 zone bonus. +15 can appear after 20 fights today. +30 can appear after 40 fights today.
    return $location`The SMOOCH Army HQ`;
  }
  if (elementalPlanes_access($element`stench`)) {
    //+5 enemy value
    return $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`;
  }
  if (elementalPlanes_access($element`spooky`)) {
    //+5 enemy value
    return $location`The Deep Dark Jungle`;
  }
  if (elementalPlanes_access($element`sleaze`)) {
    //+5 enemy value
    return $location`Sloppy Seconds Diner`;
  }
  return Location.none;
}

export function LX_attemptPowerLevel(): boolean {
  if (!isAboutToPowerlevel()) {
    //determined that the softblock on quests waiting for optimal conditions is still on
    auto_log_warning(
      "Hmmm, we need to stop being so feisty about quests...",
      "red",
    );
    setProperty("auto_powerLevelLastLevel", myLevel().toString()); //release softblock until you level up
    setProperty("auto_powerLevelAdvCount", (0).toString());
    return true; //restart the main loop to give those quests a chance to run now that the softblock is released.
  }

  if (in_robot()) {
    return LX_robot_powerlevel(); //leveling works very differently in You, Robot path
  }
  if (myLevel() > 12) {
    return false;
  }

  auto_log_warning(
    "I've run out of stuff to do. Time to powerlevel, I suppose.",
    "red",
  );

  setProperty(
    "auto_powerLevelAdvCount",
    (toInt(getProperty("auto_powerLevelAdvCount")) + 1).toString(),
  );
  setProperty("auto_powerLevelLastAttempted", myTurncount().toString());

  handleFamiliar("stat");
  addToMaximize("100 exp");

  auto_log_warning("I need to powerlevel", "red");
  let delay: number = toInt(getProperty("auto_powerLevelTimer"));
  if (delay === 0) {
    delay = 10;
  }
  wait(delay);

  if (LX_freeCombats$1(true)) {
    return true;
  }

  if (
    chateaumantegna_available() &&
    haveFreeRestAvailable() &&
    !in_theSource()
  ) {
    doFreeRest();
    cliExecute("scripts/autoscend/auto_post_adv.ash");
    loopHandlerDelayAll();
    return true;
  }
  //The Source path specific powerleveling
  LX_attemptPowerLevelTheSource();
  //August Scepter Power Levelling
  if (auto_haveAugustScepter() && toInt(getProperty("_augSkillsCast")) < 5) {
    if (myPrimestat() === $stat`Muscle`) {
      if (
        canUse$2($skill`Aug. 12th: Elephant Day!`) &&
        !toBoolean(getProperty("_aug12Cast"))
      ) {
        useSkill($skill`Aug. 12th: Elephant Day!`);
      }
    }
    if (myPrimestat() === $stat`Mysticality`) {
      if (
        canUse$2($skill`Aug. 11th: Presidential Joke Day!`) &&
        !toBoolean(getProperty("_aug11Cast"))
      ) {
        useSkill($skill`Aug. 11th: Presidential Joke Day!`);
      }
    }
    if (myPrimestat() === $stat`Moxie`) {
      if (
        canUse$2($skill`Aug. 23rd: Ride the Wind Day!`) &&
        !toBoolean(getProperty("_aug23Cast"))
      ) {
        useSkill($skill`Aug. 23rd: Ride the Wind Day!`);
      }
    }
  }
  //scaling damage zones
  //all scaling zones have monster level = my_buffedstat($stat[moxie]) + monster_level_adjustment() + enemy_value. up to a cap
  const scalezone: Location = highestScalingZone();
  if (scalezone === $location`The Neverending Party`) {
    return neverendingPartyCombat();
  }
  if (scalezone !== Location.none) {
    return autoAdv$2(scalezone);
  }
  if (timeSpinnerAdventure()) {
    return true;
  }
  //do not use the scaling zone [The Thinknerd Warehouse] here.
  //it has low stat caps on the scaling, resulting in <30 substats per adv

  if (internalQuestStatus("questM21Dance") > 3) {
    let goal_count: number = 0;
    if (myPrimestat() === $stat`Muscle`) {
      goal_count++;
    }
    if (
      myPrimestat() === $stat`Mysticality` ||
      myBasestat($stat`Mysticality`) < 70
    ) {
      //war outfit requires 70 base mys
      goal_count++;
    }
    if (
      myPrimestat() === $stat`Moxie` ||
      myBasestat($stat`Moxie`) < 70 ||
      toInt(
        //war outfit requires 70 base mox
        getProperty("auto_beatenUpCount"),
      ) > 5
    ) {
      //if we are getting beaten up we should raise moxie
      goal_count++;
    }
    if (myMeat() < meatReserve() + 1000) {
      goal_count++;
    }
    let prefer_bedroom: boolean = false;
    if (goal_count > 1) {
      //for multiple targets then haunted bedroom is best
      prefer_bedroom = true;
    } else if (providePlusNonCombat$1(auto_combatModCap(), true, true) < 15) {
      //only perform the simulation if goal_count is 1
      prefer_bedroom = true; //for one target it depends on your noncombat. bad -combat prefers bedroom. otherwise prefer haunted gallery
    }

    if (prefer_bedroom) {
      if (autoAdv$2($location`The Haunted Bedroom`)) {
        return true;
      }
    } else {
      //do [The Haunted Gallery] instead
      switch (
        myPrimestat() //we only ever do the haunted gallery if the sole stat we want is primestat.
      ) {
        case $stat`Muscle`:
          backupSetting("louvreDesiredGoal", "4"); // get Muscle stats

          break;
        case $stat`Mysticality`:
          backupSetting("louvreDesiredGoal", "5"); // get Myst stats

          break;
        case $stat`Moxie`:
          backupSetting("louvreDesiredGoal", "6"); // get Moxie stats

          break;
      }
      providePlusNonCombat$3(auto_combatModCap(), true);
      if (autoAdv$2($location`The Haunted Gallery`)) {
        return true;
      }
    }
  }
  return false;
}

export function disregardInstantKarma(): boolean {
  //do we want to ignore the instant karma you get for defeating the naughty sorceress at exactly level 13. Used to tweak our XP gains.
  if (inAftercore()) {
    return true;
  }
  if (myLevel() !== 13) {
    //under level 13 we wan to get max XP gains. level 14+ we already missed the insta karma, no need to hold back anymore.
    return true;
  }
  //auto_disregardInstantKarma is a user configured setting
  return toBoolean(getProperty("auto_disregardInstantKarma"));
}

export function auto_freeCombatsRemaining(): number {
  return auto_freeCombatsRemaining$1(false);
}

function auto_freeCombatsRemaining$1(print_remaining_fights: boolean): number {
  if (in_avantGuard()) {
    //may need to revisit after Avant Guard leaves standard
    return 0;
  }

  function logRemainingFights(msg: string): void {
    if (!print_remaining_fights) {
      return;
    }
    print(msg, "red");
  }

  let count_1: number = 0;

  logRemainingFights("Remaining Free Fights:");
  if (!in_koe() && canChangeToFamiliar($familiar`Machine Elf`)) {
    const temp: number = 5 - toInt(getProperty("_machineTunnelsAdv"));
    count_1 += temp;
    logRemainingFights(`Machine Elf = ${temp}`);
  }
  if (snojoFightAvailable()) {
    const temp: number = 10 - toInt(getProperty("_snojoFreeFights"));
    count_1 += temp;
    logRemainingFights(`Snojo = ${temp}`);
  }
  if (canChangeToFamiliar($familiar`God Lobster`) && disregardInstantKarma()) {
    const temp: number = 3 - toInt(getProperty("_godLobsterFights"));
    count_1 += temp;
    logRemainingFights(`God Lobster = ${temp}`);
  }
  if (neverendingPartyRemainingFreeFights() > 0) {
    const temp: number = neverendingPartyRemainingFreeFights();
    count_1 += temp;
    logRemainingFights(`Neverending Party = ${temp}`);
  }
  if (toBoolean(getProperty("_eldritchTentacleFought")) === false) {
    count_1++;
    logRemainingFights("Tent Tentacle = 1");
  }
  if (
    auto_have_skill($skill`Evoke Eldritch Horror`) &&
    toBoolean(getProperty("_eldritchHorrorEvoked")) === false
  ) {
    count_1++;
    logRemainingFights("Evoke Eldritch = 1");
  }

  if (auto_canFightPiranhaPlant()) {
    const temp: number = auto_piranhaPlantFightsRemaining();
    count_1 += temp;
    logRemainingFights(`Piranha Plant Fights = ${temp}`);
  }

  if (auto_canTendMushroomGarden()) {
    count_1++;
    logRemainingFights("Tend to Mushroom Garden = 1"); //Not actually a free fight, but included to ensure carried out at bedtime.
  }

  if (auto_hasSpeakEasy() && auto_remainingSpeakeasyFreeFights() > 0) {
    const temp: number = auto_remainingSpeakeasyFreeFights();
    count_1 += temp;
    logRemainingFights(`Oliver's Place = ${temp}`);
  }

  if (auto_haveBurningLeaves()) {
    const temp: number = min(
      auto_remainingBurningLeavesFights(),
      floor(itemAmount($item`inflammable leaf`) / 11),
    );
    count_1 += temp;
    logRemainingFights(`Burning Leaves = ${temp}`);
  }

  const free_candy: number = freeCandyFightsLeft();
  count_1 += free_candy;
  logRemainingFights(`Trick or Treating = ${free_candy}`);

  return count_1;
}

export function LX_freeCombats(): boolean {
  return LX_freeCombats$1(disregardInstantKarma());
}

export function LX_freeCombats$1(powerlevel: boolean): boolean {
  if (auto_freeCombatsRemaining() === 0) {
    auto_log_debug$1("Could not use free combats because you have none");
    return false;
  }

  if (myInebriety() > inebrietyLimit()) {
    auto_log_debug$1("Could not use free combats because you are overdrunk");
    return false;
  }

  if (myAdventures() === 0) {
    auto_log_warning(
      "Could not use free combats because you are out of adventures",
      "red",
    );
    return false;
  }

  if (myAdventures() < 2) {
    auto_freeCombatsRemaining$1(true); //print remaining free combats.
    auto_log_warning(
      "Too few adventures to safely automate free combats",
      "red",
    );
    auto_log_warning(
      "If we lose your last adv on a free combat the remaining free combats are wasted",
      "red",
    );
    auto_log_warning(
      "This error should only occur if you lost a free fight. If you did not then please report this",
      "red",
    );
    abort(
      "Please perform the remaining free combats manually then run me again",
    );
  }

  auto_log_debug$1(
    `LX_freeCombats active with powerlevel set to ${powerlevel}`,
  );

  resetMaximize();
  if (disregardInstantKarma()) {
    handleFamiliar("stat");
  }

  if (auto_canFightPiranhaPlant() || auto_canTendMushroomGarden()) {
    auto_log_debug$1("LX_freeCombats is calling auto_mushroomGardenHandler()");
    return auto_mushroomGardenHandler();
  }

  if (neverendingPartyRemainingFreeFights() > 0) {
    if (powerlevel) {
      auto_log_debug$1("LX_freeCombats is calling neverendingPartyCombat()");
      if (neverendingPartyCombat()) {
        return true;
      }
    } else {
      auto_log_debug$1("LX_freeCombats is calling neverendingPartyCombat()");
      if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
        auto_changeSnapperPhylum($phylum`dude`);
      }
      if (neverendingPartyCombat()) {
        return true;
      }
    }
  }

  const burrow: Location = $location`The Batrat and Ratbat Burrow`;
  if (
    myClass() === $class`Pastamancer` &&
    toThrall("ver").level > 10 &&
    toInt(getProperty("_legendaryVermincelliFreeRats")) < 3 &&
    zone_isAvailable(burrow, true) &&
    (appearanceRates(burrow)[$monster`screambat`.toString()] ??= 0.0) < 0.01
  ) {
    // first three fights each day with Vermincelli vs rats are guaranteed free. Choosing to go to the burrow, but need it to be available and no screambats.
    pm_updateThrall(burrow, false);
    if (myThrall() === $thrall`Vermincelli`) {
      auto_log_debug$1(
        "LX_freeCombats is adventuring in [The Batrat and Ratbat Burrow] with Vermincelli",
      );
      const adv_done: boolean = autoAdv$1(1, burrow);
      if (adv_done) {
        return true;
      }
    }
  }

  if (
    !in_koe() &&
    toInt(getProperty("_machineTunnelsAdv")) < 5 &&
    canChangeToFamiliar($familiar`Machine Elf`)
  ) {
    auto_log_debug$1(
      "LX_freeCombats is adventuring in [The Deep Machine Tunnels]",
    );

    const bjorn: Familiar = myBjornedFamiliar();
    if (bjorn === $familiar`Machine Elf`) {
      handleBjornify($familiar`Grinning Turtle`);
    }
    const adv_done: boolean = autoAdv$1(1, $location`The Deep Machine Tunnels`);
    if (bjorn === $familiar`Machine Elf`) {
      handleBjornify(bjorn);
    }

    loopHandlerDelayAll();
    if (adv_done) {
      return true;
    }
  }

  if (snojoFightAvailable()) {
    auto_log_debug$1("LX_freeCombats is adventuring in [The Snojo]");
    const adv_done: boolean = autoAdv$1(
      1,
      $location`The X-32-F Combat Training Snowman`,
    );
    loopHandlerDelayAll();
    if (adv_done) {
      return true;
    }
  }

  if (powerlevel) {
    auto_log_debug$1("LX_freeCombats is calling godLobsterCombat()");
    if (godLobsterCombat()) {
      return true;
    }
  }

  if (
    auto_have_skill($skill`Evoke Eldritch Horror`) &&
    toBoolean(getProperty("_eldritchHorrorEvoked")) === false
  ) {
    auto_log_debug$1("LX_freeCombats is calling evokeEldritchHorror()");
    if (evokeEldritchHorror()) {
      return true;
    }
  }

  if (auto_hasSpeakEasy() && auto_remainingSpeakeasyFreeFights() > 0) {
    auto_log_debug$1(
      "LX_freeCombats is adventuring in [An Unusually Quiet Barroom Brawl]",
    );
    const adv_done: boolean = autoAdv$1(
      1,
      $location`An Unusually Quiet Barroom Brawl`,
    );
    if (adv_done) {
      return true;
    }
  }

  auto_log_debug$1("LX_freeCombats is trying to free trick-or-treat.");
  if (candyBlock()) {
    return true;
  }

  if (auto_haveBurningLeaves()) {
    auto_log_debug$1("LX_freeCombats is trying to fight burning leaves.");
    if (auto_fightFlamingLeaflet()) {
      return true;
    }
  }
  // tentacle should be last so it can be backed up, if script wants to
  // see auto_backupTarget()
  if (toBoolean(getProperty("_eldritchTentacleFought")) === false) {
    auto_log_debug$1("LX_freeCombats is calling fightScienceTentacle()");
    if (fightScienceTentacle()) {
      return true;
    }
  }

  if (auto_freeCombatsRemaining() > 0) {
    auto_log_debug$1(
      "I reached the end of LX_freeCombats() but I think the following free combats were not used for some reason:",
    );
    auto_freeCombatsRemaining$1(true); //print remaining free combats.
  }

  return false;
}

export function LX_freeCombatsTask(): boolean {
  if (
    myAdventures() === 1 + auto_advToReserve() &&
    inebriety_left() === 0 &&
    stomach_left() < 1
  ) {
    auto_log_debug$1(
      "Only 1 non reserved adv remains for main loop so doing free combats",
    );
    return LX_freeCombats();
  }
  if (
    in_theSource() &&
    myAdventures() < 10 &&
    inebriety_left() === 0 &&
    stomach_left() < 1
  ) {
    auto_log_debug$1(
      "Less than 10 adv remaining today. We should do free fights now in case any of them get replaced with a non free agent fight",
    );
    return LX_freeCombats();
  }
  return false;
}
