import {
  haveEffect,
  haveSkill,
  itemAmount,
  lastMonster,
  Monster,
  myLevel,
  toBoolean,
  toInt,
} from "kolmafia";
import { $effect, $item, $monster, $skill, get, set } from "libram";

import {
  auto_abort,
  auto_log_info,
  handleCopiedMonster,
  safeGet,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";

function handleRainDohDo(): boolean {
  const enemy: Monster = safeGet("rainDohMonster");
  auto_log_info(`Black boxing: ${enemy}`, "blue");

  function validate_rainDohBox(): void {
    if (enemy !== $monster`Source Agent` && enemy !== lastMonster()) {
      //general failure detection
      //special exclusion for path The Source where [source agent] might randomly replace our target
      auto_abort(
        `Not sure what exploded. tried to summon copy of ${enemy} but got ${lastMonster()} instead.`,
      );
    }
  }

  if (enemy === $monster`lobsterfrogman`) {
    if (haveSkill($skill`Rain Man`) && auto_gunpowderBarrelsWanted() > 1) {
      set("auto_doCombatCopy", "yes");
    }
    handleCopiedMonster($item`Rain-Doh box full of monster`);
    validate_rainDohBox();
    set("auto_doCombatCopy", "no");
    return true;
  }
  if (enemy === $monster`Skinflute`) {
    const stars: number = itemAmount($item`star`);
    const lines: number = itemAmount($item`line`);

    if (
      stars < 7 &&
      toBoolean(toInt(lines < 6) & toInt(get("_raindohCopiesMade") < 5))
    ) {
      set("auto_doCombatCopy", "yes");
    }
    handleCopiedMonster($item`Rain-Doh box full of monster`);
    validate_rainDohBox();
    set("auto_doCombatCopy", "no");
    return true;
  }
  /*	Should we check for an acceptable monster or just empty the box in that case?
	huge swarm of ghuol whelps, modern zmobie, mountain man
	*/
  //If doesn\'t match a special condition
  if (enemy !== $monster.none) {
    handleCopiedMonster($item`Rain-Doh box full of monster`);
    validate_rainDohBox();
    return true;
  }

  return false;
}

const handleRainDohTask: QuestTask = registerQuestTask({
  name: "handleRainDoh",
  completed: () => false,
  ready: () =>
    itemAmount($item`Rain-Doh box full of monster`) > 0 &&
    myLevel() > 3 &&
    haveEffect($effect`Ultrahydrated`) === 0,
  do: handleRainDohDo,
  desiredEncounters: () =>
    [
      {
        monster: safeGet("rainDohMonster"),
        needAmount: itemAmount($item`Rain-Doh box full of monster`) ? 1 : 0,
      },
    ].filter((a) => a.needAmount),
});

export function handleRainDoh(): boolean {
  return runQuestTask(handleRainDohTask);
}
