import {
  appearanceRates,
  Location,
  Monster,
  monsterLevelAdjustment,
  myBuffedstat,
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
import {
  solveDelayZone,
  solveFreeFightZone,
  solveIndoorDelayZone,
} from "../../auto_routing";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv } from "../../executors/auto_adventure";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import {
  in_plumber,
  plumber_canDealScalingDamage,
} from "../../paths/2020/path_of_the_plumber";
import { auto_log_info, auto_log_warning } from "../../utils/auto_log";
import {
  auto_wantToBanish,
  auto_wantToFreeRun,
  hasFreeRunQueued,
  isFreeMonster,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";
import { burnDelayWithClubEmIntoNextWeek } from "./copier";

function wantToFreeRunEverythingIn(loc: Location): boolean {
  const monsters: Monster[] = Object.entries(appearanceRates(loc))
    .map(([name, rate]) => [Monster.get(name), rate] as [Monster, number])
    .filter(([mon, rate]) => rate > 0 && mon.id > 0)
    .map(([mon]) => mon);
  return (
    monsters.length > 0 &&
    monsters.every(
      (mon) =>
        auto_wantToFreeRun(mon, loc) &&
        // Try avoid doing a banisher
        !auto_wantToBanish(mon, loc),
    )
  );
}

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
    const predictedScalerHP: number = Math.trunc(
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
    const voterZone: Location =
      get("breathitinCharges") > 0 ? solveIndoorDelayZone() : solveDelayZone();
    if (voterZone !== $location.none) {
      auto_log_info(
        `Fighting a free ${get("_voteMonster")} in ${voterZone.toString()} to burn delay!`,
        "green",
      );
      set("auto_nextEncounter", get("_voteMonster").toString());
      if (VotingBooth.voteMonster(true, voterZone)) {
        return true;
      }
      set("auto_nextEncounter", "");
    }
  }

  if (digitizeMonsterNext) {
    // Digitize Wanderers will happen regardless so prioritize handling them.
    // hopefully they don't overwrite something we want to backup.
    let digitizeZone: Location = solveFreeFightZone(
      get("_sourceTerminalDigitizeMonster"),
    );
    if (digitizeZone === $location.none) {
      digitizeZone =
        isFreeMonster(get("_sourceTerminalDigitizeMonster")) &&
        get("breathitinCharges") > 0
          ? solveIndoorDelayZone(get("_sourceTerminalDigitizeMonster"))
          : solveDelayZone(undefined, get("_sourceTerminalDigitizeMonster"));
    }
    if (digitizeZone === $location.none) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      digitizeZone = $location`Noob Cave`;
    }
    auto_log_info(
      `Fighting a ${get("_sourceTerminalDigitizeMonster")} in ${digitizeZone.toString()} to burn delay!`,
      "green",
    );
    set("auto_nextEncounter", get("_sourceTerminalDigitizeMonster").toString());
    if (autoAdv(digitizeZone)) {
      return true;
    }
    set("auto_nextEncounter", "");
  }
  if (burnDelayWithClubEmIntoNextWeek()) {
    return true;
  }

  if (backupTargetAvailable) {
    const skipOutdoors: boolean =
      isFreeMonster(get("lastCopyableMonster")) && get("breathitinCharges") > 0;
    // the backup is a replacer, which a free fight zone will not give a free fight for
    let backupZone: Location = skipOutdoors
      ? solveIndoorDelayZone(get("lastCopyableMonster"))
      : solveDelayZone(undefined, get("lastCopyableMonster"));
    if (backupZone === $location.none && skipOutdoors && !in_koe()) {
      // if the monster is inherently free and we have Breathitin charges, fight it in the Noob Cave since we can't avoid it
      // and we likely want to fight it. Noob Cave is available from turn 0 & is not outdoors so Breathitin won't trigger.
      backupZone = $location`Noob Cave`;
    }

    auto_log_info(
      `Fighting a ${get("lastCopyableMonster")} in ${backupZone.toString()} to burn delay!`,
      "green",
    );
    if (BackupCamera.backupToYourLastEnemy(backupZone)) {
      return true;
    }
  }

  if (sausageGoblinAvailable) {
    // Sausage Goblins are inherently free
    const goblinZone: Location =
      get("breathitinCharges") > 0 ? solveIndoorDelayZone() : solveDelayZone();
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
    const voidZone: Location =
      get("breathitinCharges") > 0 ? solveIndoorDelayZone() : solveDelayZone();
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
    let habitatZone: Location = solveFreeFightZone(Bofa.habitatMonster());
    if (habitatZone === $location.none) {
      habitatZone =
        isFreeMonster(Bofa.habitatMonster()) && get("breathitinCharges") > 0
          ? solveIndoorDelayZone(Bofa.habitatMonster())
          : solveDelayZone(undefined, Bofa.habitatMonster());
    }
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

  const queuedFreeRun = hasFreeRunQueued();
  if (
    queuedFreeRun !== undefined &&
    // Only if we don't believe we're going to encounter a specific monster
    get("auto_nextEncounter") === $monster.none
  ) {
    const freeRunZone: Location = solveDelayZone(wantToFreeRunEverythingIn);
    if (freeRunZone !== $location.none) {
      auto_log_info(
        `Burning delay in ${freeRunZone.toString()} with ${queuedFreeRun.toString()}, we will be freerunning from everything there.`,
        "green",
      );
      if (autoAdv(freeRunZone)) {
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

registerQuestTask({
  name: "LX_burnDelay",
  completed: () => false,
  ready: () => true,
  do: LX_burnDelayDo,
});
