import {
  availableAmount,
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
  auto_runChoice,
  handleCopiedMonster,
  safeGet,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";

//	This is meant for items that have a date of 2012

//Defined in autoscend/iotms/mr2012.ash
export function auto_reagnimatedGetPart(): void {
  if (availableAmount($item`gnomish housemaid's kgnee`) === 0) {
    // The housemaid's kgnee is the equipment that justified using the gnome.
    auto_runChoice(4);
  } else if (availableAmount($item`gnomish coal miner's lung`) === 0) {
    // May as well get the rest of these on subsequent days.
    auto_runChoice(2);
  } else if (availableAmount($item`gnomish athlete's foot`) === 0) {
    auto_runChoice(5);
  } else if (availableAmount($item`gnomish tennis elbow`) === 0) {
    auto_runChoice(3);
  } else if (availableAmount($item`gnomish swimmer's ears`) === 0) {
    auto_runChoice(1);
  } else {
    auto_abort("unhandled choice in auto_reagnimatedGetPart");
  }
}

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
    if (
      haveSkill($skill`Rain Man`) &&
      itemAmount($item`barrel of gunpowder`) < 4
    ) {
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
