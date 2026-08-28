import {
  Location,
  monsterLevelAdjustment,
  myBuffedstat,
  toInt,
} from "kolmafia";
import { $item, $location, $monster, $stat, get, set } from "libram";

import {
  AutoSourceTerminal,
  BackupCamera,
  Bofa,
  CursedMagnifyingGlass,
  Kramco,
  VotingBooth,
} from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { solveDelayZone } from "../../auto_routing";
import {
  auto_log_info,
  auto_log_warning,
  isFreeMonster,
  safeGet,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import {
  in_plumber,
  plumber_canDealScalingDamage,
} from "../../paths/2020/path_of_the_plumber";
import { maximizer } from "../../utils/maximizer";
import { burnDelayWithClubEmIntoNextWeek } from "./wandererCreator";

function LX_burnDelayDo(): boolean {
  let voteMonsterAvailable: boolean = VotingBooth.voteMonster(true);
  const digitizeMonsterNext: boolean = AutoSourceTerminal.isOverdueDigitize();
  let sausageGoblinAvailable: boolean = Kramco.sausageGoblin();
  const backupTargetAvailable: boolean = BackupCamera.backupTarget();
  const voidMonsterAvailable: boolean = CursedMagnifyingGlass.voidMonster();
  const habitatingMonsters: boolean = Bofa.habitatMonster() !== $monster.none;
  // if we're a plumber and we're still stuck doing a flat 15 damage per attack
  // then a scaling monster is probably going to be a bad time
  if (in_plumber() && !plumber_canDealScalingDamage()) {
    // unless we can still kill it in one hit, then it should probably be fine?
    const predictedScalerHP: number = toInt(
      0.75 * (myBuffedstat($stat`Muscle`) + monsterLevelAdjustment()),
    );
    if (predictedScalerHP > 15) {
      auto_log_info(
        "Want to burn delay with scaling wanderers, but we can't deal scaling damage yet and it would be too strong :(",
      );
      voteMonsterAvailable = false;
      sausageGoblinAvailable = false;
      maximizer.exclude($item`Kramco Sausage-o-Matic™`);
      maximizer.exclude($item`"I Voted!" sticker`);
    }
  }
  // See the encounter priority flowcharts available at https://i.imgur.com/sdVH4SPh.jpg
  // and https://github.com/loathers/encounter/blob/main/heirarchy.mermaid if adding handling for more stuff

  if (voteMonsterAvailable && !backupTargetAvailable) {
    // Voting monsters are inherently free (the ones we fight anyway).
    // don't fight them if we're going to backup because they will overwrite the monster we want to backup
    const voterZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (voterZone !== $location.none) {
      auto_log_info(
        `Fighting a free ${safeGet("_voteMonster")} in ${voterZone.toString()} to burn delay!`,
        "green",
      );
      set("auto_nextEncounter", safeGet("_voteMonster").toString());
      if (VotingBooth.voteMonster(true, voterZone)) {
        return true;
      }
      set("auto_nextEncounter", "");
    }
  }

  if (digitizeMonsterNext) {
    // Digitize Wanderers will happen regardless so prioritize handling them.
    // hopefully they don't overwrite something we want to backup.
    let digitizeZone: Location = solveDelayZone(
      isFreeMonster(safeGet("_sourceTerminalDigitizeMonster")) &&
        get("breathitinCharges") > 0,
    );
    if (digitizeZone === $location.none) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      digitizeZone = $location`Noob Cave`;
    }
    auto_log_info(
      `Fighting a ${safeGet("_sourceTerminalDigitizeMonster")} in ${digitizeZone.toString()} to burn delay!`,
      "green",
    );
    set(
      "auto_nextEncounter",
      safeGet("_sourceTerminalDigitizeMonster").toString(),
    );
    if (autoAdv(digitizeZone)) {
      return true;
    }
    set("auto_nextEncounter", "");
  }
  if (burnDelayWithClubEmIntoNextWeek()) {
    return true;
  }

  if (backupTargetAvailable) {
    const skipOutdoorZones: boolean =
      isFreeMonster(safeGet("lastCopyableMonster")) &&
      get("breathitinCharges") > 0;
    let backupZone: Location = solveDelayZone(skipOutdoorZones);
    if (backupZone === $location.none && skipOutdoorZones && !in_koe()) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      backupZone = $location`Noob Cave`;
    }

    auto_log_info(
      `Fighting a ${safeGet("lastCopyableMonster")} in ${backupZone.toString()} to burn delay!`,
      "green",
    );
    if (BackupCamera.backupToYourLastEnemy(backupZone)) {
      return true;
    }
  }

  if (sausageGoblinAvailable) {
    // Sausage Goblins are inherently free
    const goblinZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (goblinZone !== $location.none) {
      auto_log_info(
        `Fighting a Sausage Goblin in ${goblinZone.toString()} to burn delay!`,
        "green",
      );
      if (Kramco.sausageGoblin(goblinZone)) {
        return true;
      }
    }
  }

  if (voidMonsterAvailable) {
    // Void monsters are inherently free (the ones we fight anyway).
    const voidZone: Location = solveDelayZone(get("breathitinCharges") > 0);
    if (voidZone !== $location.none) {
      auto_log_info(
        `Fighting a Void monster in ${voidZone.toString()} to burn delay!`,
        "green",
      );
      if (CursedMagnifyingGlass.voidMonster(voidZone)) {
        return true;
      }
    }
  }

  if (habitatingMonsters) {
    const habitatZone: Location = solveDelayZone(
      isFreeMonster(Bofa.habitatMonster()) && get("breathitinCharges") > 0,
    );
    if (habitatZone !== $location.none) {
      auto_log_info(
        `Might be fighting a ${Bofa.habitatMonster()} in ${habitatZone.toString()} to burn delay!`,
        "green",
      );
      if (autoAdv(habitatZone)) {
        return true;
      }
    }
  }

  if (voteMonsterAvailable) {
    auto_log_warning(
      "Had overdue voting monster but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (digitizeMonsterNext) {
    auto_log_warning(
      "Had overdue digitize but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (sausageGoblinAvailable) {
    auto_log_warning(
      "Had overdue sausage but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (voidMonsterAvailable) {
    auto_log_warning(
      "Cursed Magnifying Glass's void monster is next but couldn't find a zone to burn delay",
      "red",
    );
  }
  if (habitatingMonsters) {
    auto_log_warning(
      "Habitating a monster but couldn't find a zone to burn delay",
      "red",
    );
  }
  return false;
}

const LX_burnDelayTask: QuestTask = registerQuestTask({
  name: "LX_burnDelay",
  completed: () => false,
  ready: () => true,
  do: LX_burnDelayDo,
});

export function LX_burnDelay(): boolean {
  return runQuestTask(LX_burnDelayTask);
}
