import {
  Familiar,
  haveEffect,
  haveFamiliar,
  inHardcore,
  Item,
  itemAmount,
  lastMonster,
  Monster,
  myFamiliar,
  myHash,
  myLevel,
  toInt,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import { $effect, $familiar, $item, $location, $monster, get } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { canChangeToFamiliar } from "../../auto_familiar";
import {
  auto_is_valid$1,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  internalQuestStatus,
  safeGet,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { hedgeTrimmersNeeded } from "../../quests/level_09";
import { L10_needAmuletOfPlotSignificance } from "../../quests/level_10";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function catBurglarHeistsLeft(): number {
  if (
    !haveFamiliar($familiar`Cat Burglar`) ||
    !auto_is_valid$1($familiar`Cat Burglar`)
  ) {
    return 0;
  }
  const banked_heists: number = get("catBurglarBankHeists");
  let charge: number = get("_catBurglarCharge");
  const heists_complete: number = get("_catBurglarHeistsComplete");
  let heists_left: number = banked_heists - heists_complete;
  charge /= 10;
  while (charge >= 1) {
    heists_left++;
    charge /= 2;
  }
  return heists_left;
}

function catBurglarHeist$1(it: Item): boolean {
  /* Costly to call (requires two familiar swaps and a page load, even on failure)
   * so I recommend calling this only after we fight a monster.
   * Note that the Cat Burglar needs to be the active familiar in combat to heist that monster.
   */
  if (0 === catBurglarHeistsLeft()) {
    return false;
  }

  auto_log_info(`Trying to heist a ${it}`, "blue");
  const backup_familiar: Familiar = myFamiliar();
  try {
    useFamiliar($familiar`Cat Burglar`);

    let page: string = visitUrl("main.php?heist=1");
    const button: AshMatcher = new AshMatcher(
      `name="(st:\\d+:${toInt(it)})"`,
      page,
    );
    if (button.find()) {
      const choice_name: string = button.group(1);
      const url: string = `choice.php?whichchoice=1320&option=1&${choice_name}=${it.toString()}&pwd=${myHash()}`;
      page = visitUrl(url);
      handleTracker({
        what: $familiar`Cat Burglar`,
        detail: it.toString(),
        property: "auto_otherstuff",
      });
      return true;
    }
    auto_log_warning(
      `We don't seem to be able to heist a ${it}. Maybe we didn't fight it with the Cat Burglar?`,
      "red",
    );
    return false;
  } finally {
    useFamiliar(backup_familiar);
  }
}

export function catBurglarHeistDesires(): Map<Monster, Item> {
  /* Note that this is called from auto_pre_adv.ash - WE WILL OVERRIDE FAMILIAR IN
   * PREADVENTURE IF WE NEED THE BURGLE.
   */
  const wannaHeists: Map<Monster, Item> = new Map();

  if (
    !canChangeToFamiliar($familiar`XO Skeleton`) &&
    get("sidequestOrchardCompleted") === "none"
  ) {
    // Can't hugpocket? 1 turn filthworms is still a thing you can do!
    if (
      haveEffect($effect`Filthworm Larva Stench`) === 0 &&
      itemAmount($item`filthworm hatchling scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`larval filthworm`,
        $item`filthworm hatchling scent gland`,
      );
    }
    if (
      haveEffect($effect`Filthworm Drone Stench`) === 0 &&
      itemAmount($item`filthworm drone scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`filthworm drone`,
        $item`filthworm drone scent gland`,
      );
    }
    if (
      haveEffect($effect`Filthworm Guard Stench`) === 0 &&
      itemAmount($item`filthworm royal guard scent gland`) === 0
    ) {
      wannaHeists.set(
        $monster`filthworm royal guard`,
        $item`filthworm royal guard scent gland`,
      );
    }
  }

  const oreGoal: Item = safeGet("trapperOre");
  if (
    oreGoal !== $item.none &&
    itemAmount(oreGoal) < 3 &&
    internalQuestStatus("questL08Trapper") < 2 &&
    inHardcore()
  ) {
    wannaHeists.set($monster`mountain man`, oreGoal);
  }

  if (
    itemAmount($item`killing jar`) === 0 &&
    (get("gnasirProgress") & 4) === 0 &&
    inHardcore()
  ) {
    wannaHeists.set($monster`banshee librarian`, $item`killing jar`);
  }

  if (
    myLevel() >= 11 &&
    !possessEquipment($item`Mega Gem`) &&
    inHardcore() &&
    itemAmount($item`wet stew`) === 0 &&
    itemAmount($item`wet stunt nut stew`) === 0
  ) {
    if (itemAmount($item`bird rib`) === 0) {
      wannaHeists.set($monster`whitesnake`, $item`bird rib`);
    }
    if (itemAmount($item`lion oil`) === 0) {
      wannaHeists.set($monster`white lion`, $item`lion oil`);
    }
  }

  if (
    myLevel() >= 8 &&
    catBurglarHeistsLeft() >= 2 &&
    hedgeTrimmersNeeded() > 0
  ) {
    wannaHeists.set(
      $monster`bearpig topiary animal`,
      $item`rusty hedge trimmers`,
    );
    wannaHeists.set(
      $monster`elephant (meatcar?) topiary animal`,
      $item`rusty hedge trimmers`,
    );
    wannaHeists.set(
      $monster`spider (duck?) topiary animal`,
      $item`rusty hedge trimmers`,
    );
  }

  if (
    get("questL11Shen") === "finished" &&
    internalQuestStatus("questL11Ron") === 1 &&
    catBurglarHeistsLeft() >= 2
  ) {
    wannaHeists.set($monster`Blue Oyster cultist`, $item`cigarette lighter`);
  }
  // 18 is a totally arbitrary cutoff here, but it's probably fine.
  if ($location`The Penultimate Fantasy Airship`.turnsSpent >= 18) {
    if (L10_needAmuletOfPlotSignificance()) {
      wannaHeists.set(
        $monster`Quiet Healer`,
        $item`amulet of extreme plot significance`,
      );
    }
    if (
      !possessEquipment($item`Mohawk wig`) &&
      internalQuestStatus("questL10Garbage") < 10
    ) {
      wannaHeists.set($monster`Burly Sidekick`, $item`Mohawk wig`);
    }
  }

  return wannaHeists;
}

function catBurglarHeistDo(): boolean {
  // We can't know what's burgleable without checking the burgle noncombat,
  // and that's expensive to do repeatedly. So we burgle only if we want
  // to burgle the last monster. This is bad if you're about to leave a zone.
  const wannaHeists: Map<Monster, Item> = catBurglarHeistDesires();

  if (wannaHeists.has(lastMonster())) {
    catBurglarHeist$1(wannaHeists.get(lastMonster()) ?? $item.none);
  }
  // don't return true from this, isn't adventuring.
  return false;
}

export const catBurglarHeistTask: QuestTask = registerQuestTask({
  name: "catBurglarHeist",
  completed: () => false,
  ready: () => catBurglarHeistsLeft() > 0,
  do: catBurglarHeistDo,
});

export function catBurglarHeist(): boolean {
  return runQuestTask(catBurglarHeistTask);
}
