import {
  appearanceRates,
  cliExecute,
  Familiar,
  floor,
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
  $modifier,
  $monster,
  $phylum,
  $skill,
  $stat,
  $thrall,
  get,
  set,
} from "libram";

import { auto_advToReserve } from "../autoscend";
import { autoAdv } from "./auto_adventure";
import { inebriety_left, stomach_left } from "./auto_consume";
import { resetMaximize } from "./auto_equipment";
import {
  canChangeToFamiliar,
  handleFamiliar,
  handleFamiliar$1,
} from "./auto_familiar";
import {
  providePlusNonCombat$1,
  providePlusNonCombat$3,
} from "./auto_providers";
import { doFreeRest, freeRestsRemaining } from "./auto_restore";
import {
  auto_abort,
  auto_combatModCap,
  auto_have_skill,
  auto_log_debug,
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
import { auto_canUse } from "./combat/auto_combat_util";
import { QuestTask, registerQuestTask, runQuestTask } from "./engine/engine";
import { Bjorn$$handleBjornify } from "./iotms/2010/mr2014";
import { ChateauMantegna$$chateaumantegna_available } from "./iotms/2010/mr2015";
import {
  Snojo$$snojoFightAvailable,
  TimeSpinner$$timeSpinnerAdventure,
} from "./iotms/2010/mr2016";
import {
  GodLobster$$godLobsterCombat,
  NeverendingParty$$neverendingPartyAvailable,
  NeverendingParty$$neverendingPartyCombat,
  NeverendingParty$$neverendingPartyRemainingFreeFights,
} from "./iotms/2010/mr2018";
import { Snapper$$auto_changeSnapperPhylum } from "./iotms/2010/mr2019";
import {
  MushroomGarden$$auto_canFightPiranhaPlant,
  MushroomGarden$$auto_canTendMushroomGarden,
  MushroomGarden$$auto_mushroomGardenHandler,
  MushroomGarden$$auto_piranhaPlantFightsRemaining,
} from "./iotms/2020/mr2020";
import {
  SpeakEasy$$auto_hasSpeakEasy,
  SpeakEasy$$auto_remainingSpeakeasyFreeFights,
} from "./iotms/2020/mr2022";
import {
  AugustScepter$$auto_haveAugustScepter,
  BurningLeaves$$auto_fightFlamingLeaflet,
  BurningLeaves$$auto_haveBurningLeaves,
  BurningLeaves$$auto_remainingBurningLeavesFights,
} from "./iotms/2020/mr2023";
import { ArchaeologistSpade$$auto_haveElfToilet } from "./iotms/2020/mr2026";
import { ElementalPlanes$$elementalPlanes_access } from "./iotms/other/elementalPlanes";
import {
  in_theSource,
  LX_attemptPowerLevelTheSource,
} from "./paths/2016/the_source";
import { in_koe } from "./paths/2019/kingdom_of_exploathing";
import { in_robot, LX_robot_powerlevel } from "./paths/2021/you_robot";
import { in_avantGuard } from "./paths/2024/avant_guard";
import { is_professor } from "./paths/2024/wereprofessor";
import { in_bluevsred } from "./paths/2026/blue_vs_red";
import { inAftercore } from "./paths/casual";
import { candyBlock, freeCandyFightsLeft } from "./quests/level_any";
import { maximizer } from "./utils/maximizer";

//Defined in autoscend/auto_powerlevel.ash
export function isAboutToPowerlevel(): boolean {
  return get("auto_powerLevelLastLevel", 0) === myLevel();
}

export function highestScalingZone(): Location {
  if (myAdventures() > 2 && is_professor()) {
    //only give a scaling location as professor if at bedtime
    return $location.none;
  }
  //all scaling zones have monster level = my_buffedstat($stat[moxie]) + monster_level_adjustment() + enemy_value. up to a cap
  //returns the zone with the highest enemy_value which we can adventure in
  if (NeverendingParty$$neverendingPartyAvailable()) {
    //+20 enemy value
    return $location`The Neverending Party`;
  }
  if (ElementalPlanes$$elementalPlanes_access($element`cold`)) {
    //+6 (male viking) or +10 (female viking) enemy value
    return $location`VYKEA`;
  }
  if (ElementalPlanes$$elementalPlanes_access($element`hot`)) {
    //+1 zone bonus. +15 can appear after 20 fights today. +30 can appear after 40 fights today.
    return $location`The SMOOCH Army HQ`;
  }
  if (ElementalPlanes$$elementalPlanes_access($element`stench`)) {
    //+5 enemy value
    return $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`;
  }
  if (ElementalPlanes$$elementalPlanes_access($element`spooky`)) {
    //+5 enemy value
    return $location`The Deep Dark Jungle`;
  }
  if (ElementalPlanes$$elementalPlanes_access($element`sleaze`)) {
    //+5 enemy value
    return $location`Sloppy Seconds Diner`;
  }
  return $location.none;
}

function LX_attemptPowerLevelDo(): boolean {
  if (!isAboutToPowerlevel()) {
    //determined that the softblock on quests waiting for optimal conditions is still on
    auto_log_warning(
      "Hmmm, we need to stop being so feisty about quests...",
      "red",
    );
    set("auto_powerLevelLastLevel", myLevel()); //release softblock until you level up
    set("auto_powerLevelAdvCount", 0);
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

  set("auto_powerLevelAdvCount", get("auto_powerLevelAdvCount", 0) + 1);
  set("auto_powerLevelLastAttempted", myTurncount());

  handleFamiliar("stat");
  maximizer.weight($modifier`Experience`, 100);

  auto_log_warning("I need to powerlevel", "red");
  let delay: number = get("auto_powerLevelTimer", 0);
  if (delay === 0) {
    delay = 10;
  }
  wait(delay);

  if (LX_freeCombats(true)) {
    return true;
  }

  if (
    ChateauMantegna$$chateaumantegna_available() &&
    // If we have elf toilet, save a rest for it
    (!ArchaeologistSpade$$auto_haveElfToilet() || freeRestsRemaining() > 1) &&
    !in_theSource()
  ) {
    doFreeRest(false);
    cliExecute("scripts/autoscend/auto_post_adv.ash");
    loopHandlerDelayAll();
    return true;
  }
  //The Source path specific powerleveling
  LX_attemptPowerLevelTheSource();
  //August Scepter Power Levelling
  if (AugustScepter$$auto_haveAugustScepter() && get("_augSkillsCast") < 5) {
    if (myPrimestat() === $stat`Muscle`) {
      if (auto_canUse($skill`Aug. 12th: Elephant Day!`) && !get("_aug12Cast")) {
        useSkill($skill`Aug. 12th: Elephant Day!`);
      }
    }
    if (myPrimestat() === $stat`Mysticality`) {
      if (
        auto_canUse($skill`Aug. 11th: Presidential Joke Day!`) &&
        !get("_aug11Cast")
      ) {
        useSkill($skill`Aug. 11th: Presidential Joke Day!`);
      }
    }
    if (myPrimestat() === $stat`Moxie`) {
      if (
        auto_canUse($skill`Aug. 23rd: Ride the Wind Day!`) &&
        !get("_aug23Cast")
      ) {
        useSkill($skill`Aug. 23rd: Ride the Wind Day!`);
      }
    }
  }
  //scaling damage zones
  //all scaling zones have monster level = my_buffedstat($stat[moxie]) + monster_level_adjustment() + enemy_value. up to a cap
  const scalezone: Location = highestScalingZone();
  if (scalezone === $location`The Neverending Party`) {
    return NeverendingParty$$neverendingPartyCombat();
  }
  if (scalezone !== $location.none) {
    return autoAdv(scalezone);
  }
  if (TimeSpinner$$timeSpinnerAdventure()) {
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
      get("auto_beatenUpCount", 0) > 5
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
      if (autoAdv($location`The Haunted Bedroom`)) {
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
      if (autoAdv($location`The Haunted Gallery`)) {
        return true;
      }
    }
  }
  return false;
}

export const LX_attemptPowerLevelTask: QuestTask = registerQuestTask({
  name: "LX_attemptPowerLevel",
  completed: () =>
    myLevel() >= 13 &&
    get("auto_powerLevelLastLevel", 0) >= myLevel() &&
    (!in_robot() ||
      (myLevel() > 12 &&
        myBasestat($stat`Mysticality`) >= 70 &&
        myBasestat($stat`Moxie`) >= 70)),
  ready: () => true,
  do: LX_attemptPowerLevelDo,
  locations: () =>
    [
      highestScalingZone(),
      $location`The Haunted Bedroom`,
      $location`The Haunted Gallery`,
    ].filter((loc) => loc !== $location.none),
});

export function LX_attemptPowerLevel(): boolean {
  return runQuestTask(LX_attemptPowerLevelTask);
}

export function disregardInstantKarma(): boolean {
  //do we want to ignore the instant karma you get for defeating the naughty sorceress at exactly level 13. Used to tweak our XP gains.
  if (inAftercore()) {
    return true;
  }
  if (myLevel() < 13) {
    //under level 13 we want to get max XP gains.
    return true;
  }
  //auto_disregardInstantKarma is a user configured setting
  return get("auto_disregardInstantKarma", false);
}

export function auto_freeCombatsRemaining(
  print_remaining_fights: boolean = false,
): number {
  if (in_avantGuard()) {
    //may need to revisit after Avant Guard leaves standard
    return 0;
  }

  if (in_bluevsred()) {
    // monsters might not be free
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
    const temp: number = 5 - get("_machineTunnelsAdv");
    count_1 += temp;
    logRemainingFights(`Machine Elf = ${temp}`);
  }
  if (Snojo$$snojoFightAvailable()) {
    const temp: number = 10 - get("_snojoFreeFights");
    count_1 += temp;
    logRemainingFights(`Snojo = ${temp}`);
  }
  if (canChangeToFamiliar($familiar`God Lobster`) && disregardInstantKarma()) {
    const temp: number = 3 - get("_godLobsterFights");
    count_1 += temp;
    logRemainingFights(`God Lobster = ${temp}`);
  }
  if (NeverendingParty$$neverendingPartyRemainingFreeFights() > 0) {
    const temp: number =
      NeverendingParty$$neverendingPartyRemainingFreeFights();
    count_1 += temp;
    logRemainingFights(`Neverending Party = ${temp}`);
  }
  if (get("_eldritchTentacleFought") === false) {
    count_1++;
    logRemainingFights("Tent Tentacle = 1");
  }
  if (
    auto_have_skill($skill`Evoke Eldritch Horror`) &&
    get("_eldritchHorrorEvoked") === false
  ) {
    count_1++;
    logRemainingFights("Evoke Eldritch = 1");
  }

  if (MushroomGarden$$auto_canFightPiranhaPlant()) {
    const temp: number = MushroomGarden$$auto_piranhaPlantFightsRemaining();
    count_1 += temp;
    logRemainingFights(`Piranha Plant Fights = ${temp}`);
  }

  if (MushroomGarden$$auto_canTendMushroomGarden()) {
    count_1++;
    logRemainingFights("Tend to Mushroom Garden = 1"); //Not actually a free fight, but included to ensure carried out at bedtime.
  }

  if (
    SpeakEasy$$auto_hasSpeakEasy() &&
    SpeakEasy$$auto_remainingSpeakeasyFreeFights() > 0
  ) {
    const temp: number = SpeakEasy$$auto_remainingSpeakeasyFreeFights();
    count_1 += temp;
    logRemainingFights(`Oliver's Place = ${temp}`);
  }

  if (BurningLeaves$$auto_haveBurningLeaves()) {
    const temp: number = min(
      BurningLeaves$$auto_remainingBurningLeavesFights(),
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

export function LX_freeCombats(
  powerlevel: boolean = disregardInstantKarma(),
): boolean {
  if (auto_freeCombatsRemaining() === 0) {
    auto_log_debug("Could not use free combats because you have none");
    return false;
  }

  if (myInebriety() > inebrietyLimit()) {
    auto_log_debug("Could not use free combats because you are overdrunk");
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
    auto_freeCombatsRemaining(true); //print remaining free combats.
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
    auto_abort(
      "Please perform the remaining free combats manually then run me again",
    );
  }

  auto_log_debug(`LX_freeCombats active with powerlevel set to ${powerlevel}`);

  resetMaximize();
  if (disregardInstantKarma()) {
    handleFamiliar("stat");
  }

  if (
    MushroomGarden$$auto_canFightPiranhaPlant() ||
    MushroomGarden$$auto_canTendMushroomGarden()
  ) {
    auto_log_debug("LX_freeCombats is calling auto_mushroomGardenHandler()");
    return MushroomGarden$$auto_mushroomGardenHandler();
  }

  if (NeverendingParty$$neverendingPartyRemainingFreeFights() > 0) {
    if (powerlevel) {
      auto_log_debug("LX_freeCombats is calling neverendingPartyCombat()");
      if (NeverendingParty$$neverendingPartyCombat()) {
        return true;
      }
    } else {
      auto_log_debug("LX_freeCombats is calling neverendingPartyCombat()");
      if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
        Snapper$$auto_changeSnapperPhylum($phylum`dude`);
      }
      if (NeverendingParty$$neverendingPartyCombat()) {
        return true;
      }
    }
  }

  const burrow: Location = $location`The Batrat and Ratbat Burrow`;
  if (
    myClass() === $class`Pastamancer` &&
    toThrall("ver").level > 10 &&
    get("_legendaryVermincelliFreeRats") < 3 &&
    zone_isAvailable(burrow, true) &&
    (appearanceRates(burrow)[$monster`screambat`.toString()] ??= 0.0) < 0.01
  ) {
    // first three fights each day with Vermincelli vs rats are guaranteed free. Choosing to go to the burrow, but need it to be available and no screambats.
    pm_updateThrall(burrow, false);
    if (myThrall() === $thrall`Vermincelli`) {
      auto_log_debug(
        "LX_freeCombats is adventuring in [The Batrat and Ratbat Burrow] with Vermincelli",
      );
      const adv_done: boolean = autoAdv(burrow);
      if (adv_done) {
        return true;
      }
    }
  }

  if (
    !in_koe() &&
    get("_machineTunnelsAdv") < 5 &&
    canChangeToFamiliar($familiar`Machine Elf`)
  ) {
    auto_log_debug(
      "LX_freeCombats is adventuring in [The Deep Machine Tunnels]",
    );

    const bjorn: Familiar = myBjornedFamiliar();
    if (bjorn === $familiar`Machine Elf`) {
      Bjorn$$handleBjornify($familiar`Grinning Turtle`);
    }
    const adv_done: boolean = autoAdv($location`The Deep Machine Tunnels`);
    if (bjorn === $familiar`Machine Elf`) {
      Bjorn$$handleBjornify(bjorn);
    }

    loopHandlerDelayAll();
    if (adv_done) {
      return true;
    }
  }

  if (Snojo$$snojoFightAvailable()) {
    auto_log_debug("LX_freeCombats is adventuring in [The Snojo]");
    const adv_done: boolean = autoAdv(
      $location`The X-32-F Combat Training Snowman`,
    );
    loopHandlerDelayAll();
    if (adv_done) {
      return true;
    }
  }

  if (powerlevel) {
    auto_log_debug("LX_freeCombats is calling godLobsterCombat()");
    if (GodLobster$$godLobsterCombat()) {
      return true;
    }
  }

  if (
    auto_have_skill($skill`Evoke Eldritch Horror`) &&
    get("_eldritchHorrorEvoked") === false
  ) {
    auto_log_debug("LX_freeCombats is calling evokeEldritchHorror()");
    if (evokeEldritchHorror()) {
      return true;
    }
  }

  if (
    SpeakEasy$$auto_hasSpeakEasy() &&
    SpeakEasy$$auto_remainingSpeakeasyFreeFights() > 0
  ) {
    auto_log_debug(
      "LX_freeCombats is adventuring in [An Unusually Quiet Barroom Brawl]",
    );
    const adv_done: boolean = autoAdv(
      $location`An Unusually Quiet Barroom Brawl`,
    );
    if (adv_done) {
      return true;
    }
  }

  auto_log_debug("LX_freeCombats is trying to free trick-or-treat.");
  if (candyBlock()) {
    return true;
  }

  if (BurningLeaves$$auto_haveBurningLeaves()) {
    auto_log_debug("LX_freeCombats is trying to fight burning leaves.");
    if (BurningLeaves$$auto_fightFlamingLeaflet()) {
      return true;
    }
  }
  // tentacle should be last so it can be backed up, if script wants to
  // see auto_backupTarget()
  if (get("_eldritchTentacleFought") === false) {
    auto_log_debug("LX_freeCombats is calling fightScienceTentacle()");
    if (fightScienceTentacle()) {
      return true;
    }
  }

  if (auto_freeCombatsRemaining() > 0) {
    auto_log_debug(
      "I reached the end of LX_freeCombats() but I think the following free combats were not used for some reason:",
    );
    auto_freeCombatsRemaining(true); //print remaining free combats.
  }

  return false;
}

function LX_freeCombatsTaskDo(): boolean {
  if (myAdventures() === 1 + auto_advToReserve()) {
    auto_log_debug(
      "Only 1 non reserved adv remains for main loop so doing free combats",
    );
  } else {
    auto_log_debug(
      "Less than 10 adv remaining today. We should do free fights now in case any of them get replaced with a non free agent fight",
    );
  }
  return LX_freeCombats();
}

export const LX_freeCombatsTaskTask: QuestTask = registerQuestTask({
  name: "LX_freeCombatsTask",
  completed: () => false,
  ready: () =>
    inebriety_left() === 0 &&
    stomach_left() < 1 &&
    (myAdventures() === 1 + auto_advToReserve() ||
      (in_theSource() && myAdventures() < 10)),
  do: LX_freeCombatsTaskDo,
  desiredEncounters: () => {
    return [
      {
        monster: $monster`Eldritch Tentacle`,
        needAmount:
          (get("_eldritchTentacleFought") ? 0 : 1) +
          (auto_have_skill($skill`Evoke Eldritch Horror`) &&
          get("_eldritchHorrorEvoked")
            ? 0
            : 1),
      },
    ];
  },
});

export function LX_freeCombatsTask(): boolean {
  return runQuestTask(LX_freeCombatsTaskTask);
}
