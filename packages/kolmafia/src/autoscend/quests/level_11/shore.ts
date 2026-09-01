import { council, itemAmount, myAdventures, myMeat, use } from "kolmafia";
import { $item, $items, set } from "libram";

import { LX_doVacation } from "../../../autoscend";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_abort,
  auto_log_info,
  internalQuestStatus,
} from "../../auto_util";
import { QuestTask, registerQuestTask } from "../../engine/engine";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_wereprof, is_professor } from "../../paths/2024/wereprofessor";

function L11_mcmuffinDiaryDo(): boolean {
  if (in_koe() && itemAmount($item`forged identification documents`) > 0) {
    council(); // Shore doesn't exist in Exploathing so we acquire diary from the council
  }
  if (itemAmount($item`your father's MacGuffin diary`) > 0) {
    use(
      itemAmount($item`your father's MacGuffin diary`),
      $item`your father's MacGuffin diary`,
    );
    return true;
  }
  if (itemAmount($item`copy of a jerk adventurer's father's diary`) > 0) {
    use(
      itemAmount($item`copy of a jerk adventurer's father's diary`),
      $item`copy of a jerk adventurer's father's diary`,
    );
    return true;
  }
  if (
    myAdventures() < 4 ||
    myMeat() < 500 ||
    itemAmount($item`forged identification documents`) === 0
  ) {
    if (isAboutToPowerlevel()) {
      auto_abort("Could not vacation at the shore to find your fathers diary!");
    }
    return false;
  }

  auto_log_info("Getting the McMuffin Diary", "blue");
  set("auto_considerCCSCShore", false);
  LX_doVacation();
  set("auto_considerCCSCShore", true);
  for (const diary of $items`your father's MacGuffin diary, copy of a jerk adventurer's father's diary`) {
    if (itemAmount(diary) > 0) {
      use(itemAmount(diary), diary);
      return true;
    }
  }
  return false;
}

export const L11_mcmuffinDiaryTask: QuestTask = registerQuestTask({
  name: "L11_mcmuffinDiary",
  completed: () => internalQuestStatus("questL11MacGuffin") > 1,
  ready: () =>
    internalQuestStatus("questL11MacGuffin") === 1 &&
    internalQuestStatus("questL11Black") >= 2 &&
    (!in_wereprof() || is_professor()),
  do: L11_mcmuffinDiaryDo,
});
