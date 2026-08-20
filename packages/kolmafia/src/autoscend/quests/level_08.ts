import {
  abort,
  availableAmount,
  canInteract,
  cliExecute,
  containsText,
  council,
  Element,
  equip,
  expectedDamage,
  fullnessLimit,
  haveEffect,
  haveEquipped,
  haveSkill,
  isWearingOutfit,
  Item,
  itemAmount,
  jumpChance,
  myAdventures,
  myDaycount,
  myLevel,
  myMaxhp,
  myPath,
  mySessionAdv,
  numericModifier,
  outfit,
  print,
  random,
  splitString,
  substring,
  toInt,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $skill,
  $slot,
  get,
  set,
} from "libram";

import { canPull, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv, autoLuckyAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import {
  autoForceEquip,
  autoOutfit,
  equipMaximizedGear,
  possessEquipment,
  possessOutfit,
} from "../auto_equipment";
import { handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  provideFamExp$2,
  providePlusCombat,
  provideResistances$4,
} from "../auto_providers";
import { acquireHP$3 } from "../auto_restore";
import { auto_waitForDay2 } from "../auto_routing";
import {
  auto_canForceNextCombat,
  auto_combatModCap,
  auto_forceNextCombat$1,
  auto_forceNextNoncombat,
  auto_have_skill,
  auto_haveCombatForceSource,
  auto_haveQueuedForcedCombat,
  auto_inRonin,
  auto_is_valid,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  auto_summonMountainMan,
  auto_summonMountainManIsDelaying,
  canSniff,
  cloversAvailable,
  internalQuestStatus,
  safeGet,
} from "../auto_util";
import { isSniffed$1 } from "../combat/auto_combat_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
  runTaskChain,
} from "../engine/engine";
import { adjustEdHat } from "../iotms/2010/mr2015";
import { auto_sourceTerminalEducate } from "../iotms/2010/mr2016";
import { auto_mapTheMonsters } from "../iotms/2020/mr2020";
import { auto_haveGreyGoose, auto_haveTrainSet } from "../iotms/2020/mr2022";
import { auto_getCitizenZone, auto_lostStomach } from "../iotms/2020/mr2023";
import {
  auto_haveChestMimic,
  auto_haveMayamCalendar,
} from "../iotms/2020/mr2024";
import {
  auto_canEquipAllMcHugeLarge,
  auto_equipAllMcHugeLarge,
  auto_haveMcHugeLargeSkis,
} from "../iotms/2020/mr2025";
import { auto_copierShouldDelayZone } from "../iotms/2020/mr2026";
import { elementalPlanes_access } from "../iotms/other/elementalPlanes";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_plumber } from "../paths/2020/path_of_the_plumber";
import { wildfire_groar_check } from "../paths/2021/wildfire";
import { robot_delay } from "../paths/2021/you_robot";
import { in_aosol } from "../paths/2023/avatar_of_shadows_over_loathing";
import { is_professor } from "../paths/2024/wereprofessor";
import { L8_slopeCasual } from "../paths/casual";
import { checkIfRepeating, getRepeats } from "../utils/infiniteAdvDetector";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { maximizer } from "../utils/maximizer";
import { L7_override } from "./level_07";
import { shenShouldDelayZone } from "./level_11";

//Defined in autoscend/quests/level_08.ash
export function needOre(): boolean {
  // Determines if we need ore for the trapper or not.

  if (internalQuestStatus("questL08Trapper") > 2) {
    return false;
  }
  const oreGoal: Item = safeGet("trapperOre");
  if (itemAmount(oreGoal) >= 3) {
    return false;
  }
  if (
    itemAmount($item`asbestos ore`) >= 3 &&
    itemAmount($item`linoleum ore`) >= 3 &&
    itemAmount($item`chrome ore`) >= 3
  ) {
    return false;
  }
  return true;
}

function getCellToMine(oreGoal: Item): number {
  // the mine is an 8*7 grid starting at 0,0 in the top left and each cell has an incrementing identifier starting at 0.
  // however all of row 0, column 0 and column 7 cannot be mined (so it's really a 6*6 grid with really confusing cell ids).
  // hence to translate from the grid to the cell we multiply the row by 8 and add the column
  // e.g. 4,6 becomes 4 + (6 * 8) = 52
  // trapper ores are predominantly found in the top 3 rows (1-3) and occasionally the 4th row.
  // See https://kol.coldfront.net/thekolwiki/index.php/Inside_of_Itznotyerzitz_Mine
  // the information we need is spread between the page (unmined sparkling cells) and the mineLayout1 property (what we got when mined the cell).

  if (!isWearingOutfit("Mining Gear")) {
    return 0;
  }

  function parseMineLayout(): Map<number, Item> {
    const minedCells: Map<number, Item> = new Map();
    const mineLayout: string = get("mineLayout1");
    if (mineLayout !== "") {
      for (const [, str] of splitString(
        substring(mineLayout, 1),
        "#",
      ).entries()) {
        if (containsText(str, "asbestos ore")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`asbestos ore`);
        } else if (containsText(str, "chrome ore")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`chrome ore`);
        } else if (containsText(str, "linoleum ore")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`linoleum ore`);
        } else if (containsText(str, "loadstone")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`loadstone`);
        } else if (containsText(str, "lump of diamond")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`lump of diamond`);
        } else if (containsText(str, "meat stack")) {
          minedCells.set(toInt(substring(str, 0, 2)), $item`meat stack`);
        } else if (containsText(str, "stone of eXtreme power")) {
          minedCells.set(
            toInt(substring(str, 0, 2)),
            $item`stone of eXtreme power`,
          );
        }
      }
    }
    return minedCells;
  }

  function findSparklingCells(minePage: string): Map<number, number> {
    const sparkles: Map<number, number> = new Map();
    const mrSparkle: AshMatcher = new AshMatcher(
      "title='Promising Chunk of Wall \\((\\d),(\\d)\\)",
      minePage,
    );
    while (mrSparkle.find()) {
      const sparkleCell: number =
        toInt(mrSparkle.group(1)) + toInt(mrSparkle.group(2)) * 8;
      sparkles.set(sparkleCell, 1); // don't actually care about the value. Just want the cells as keys so we can use contains
    }
    return sparkles;
  }

  function getOrthogonals(cell: number): number[] {
    // starting at the cell above, going clockwise
    const orthogonals: number[] = [];
    orthogonals[0] = cell - 8;
    orthogonals[1] = cell + 1;
    orthogonals[2] = cell + 8;
    orthogonals[3] = cell - 1;
    return orthogonals;
  }

  function canMine(cellToCheck: number, rowLimit: number): boolean {
    // this is basically bounds checking for cells
    // set rowLimit = 6 to not care about rows (there is no row 7)
    const column: number = cellToCheck % 8;
    if (column < 1 || column > 6) {
      return false;
    }
    const row: number = cellToCheck / 8;
    if (row < 1 || row > 6 || row > rowLimit) {
      return false;
    }
    return true;
  }

  function isInSideColumn(cellToCheck: number): boolean {
    const column: number = cellToCheck % 8;
    if (column === 1 || column === 6) {
      return true;
    }
    return false;
  }
  // - Simplest case, a fresh mine cavern
  const mineLayout: string = visitUrl("mining.php?mine=1");
  if (get("auto_minedCells") === "") {
    // pick a random column to start between 2-5
    return 50 + random(4); // using 50 as we're in row 6 to start and random returns from 0 to range-1. Hence 6 * 8 + 2
  }
  // - If we have started mining a cavern, lets continue mining the same column upwards until row 3
  const previously_mined: Map<number, string> = new Map(
    splitString(get("auto_minedCells"), ",").map((_v, _i) => [_i, _v]),
  );
  const num_prev_mined: number = previously_mined.size;
  const lastCell: number = toInt(
    previously_mined.get(num_prev_mined - 1) ?? "",
  );
  if (num_prev_mined < 4 && lastCell > 32 && lastCell < 55) {
    // mine the square directly above it
    return lastCell - 8;
  }
  // - If we've got to row 3 or above, start searching for ores.
  const minedCells: Map<number, Item> = parseMineLayout();
  const oreSeen: Map<number, number> = new Map();
  for (const [oreCell, oreType] of minedCells) {
    if (oreType === oreGoal) {
      oreSeen.set(oreCell, 1); // value doesn't matter, just want to count and iterate the keys
    }
  }
  const sparklingCells: Map<number, number> = findSparklingCells(mineLayout);
  const potentialCells: Map<number, number> = new Map();
  let potentialCount: number = 0;
  if (oreSeen.size === 0) {
    // - Not found any ore that we're looking for yet
    if (lastCell > 24 && lastCell < 31) {
      // get to row 2 as our probability of hitting ore we're looking for is higher.
      return lastCell - 8;
    }
    // find all the sparkling tiles in the top n rows
    // start from the top 2, if we haven't found any there,
    // increase the search space by 1 row and check again until we max out at the 4th row
    // avoid columns 1 and 6 as they limit the search space since we can't mine column 0 or 7.
    // unless we run into a situation where we've mined all the other sparkling cells.
    let rowLimit: number = 2;
    let avoidSides: boolean = true;
    while (potentialCells.size === 0 && rowLimit < 5) {
      for (const sparkleCell of sparklingCells.keys()) {
        if (canMine(sparkleCell, rowLimit)) {
          if (!isInSideColumn(sparkleCell) || !avoidSides) {
            potentialCells.set(potentialCount, sparkleCell);
            potentialCount++;
          }
        }
      }
      rowLimit++;
      if (avoidSides && rowLimit === 5 && potentialCells.size === 0) {
        avoidSides = false;
        rowLimit = 2;
      }
    }
  } else {
    // - Found at least one ore that we're looking for!
    // search orthogonally from the cells we found our required ore in as ore is always contiguous
    // limit our search to the top 3 rows to begin, if we don't find any cells that meet the criteria
    // increase the limit to the top 4 rows and check again.
    let rowLimit: number = 3;
    while (potentialCells.size === 0 && rowLimit < 5) {
      for (const oreCell of oreSeen.keys()) {
        const orthogonals: number[] = getOrthogonals(oreCell);
        for (const [, orthoCell] of orthogonals.entries()) {
          if (canMine(orthoCell, rowLimit) && sparklingCells.has(orthoCell)) {
            potentialCells.set(potentialCount, orthoCell);
            potentialCount++;
          }
        }
      }
      rowLimit++;
    }
    if (potentialCells.size === 0) {
      // we could be in a situation where the loadstone replaced one of our ores and we still need 1 or 2 ores
      // but have exhausted all the twinkling cells adjacent to the ores we've found
      // first lets find the loadstone cell
      let loadstoneCell: number = 0;
      for (const [oreCell, oreType] of minedCells) {
        if (oreType === $item`loadstone`) {
          loadstoneCell = oreCell;
        }
      }
      // now add all twinkling cells adjacent to the loadstone in the top 4 rows to the potential cells
      const orthogonals: number[] = getOrthogonals(loadstoneCell);
      for (const [, orthoCell] of orthogonals.entries()) {
        if (canMine(orthoCell, 4) && sparklingCells.has(orthoCell)) {
          potentialCells.set(potentialCount, orthoCell);
          potentialCount++;
        }
      }
    }
  }
  const numPotentials: number = potentialCells.size;
  // only found one potential, just return it
  if (numPotentials === 1) {
    return potentialCells.get(0) ?? 0;
  } else if (numPotentials === 0) {
    abort(
      "Glitch in the matrix. Please report this to the dev team (preferably with a log and screenshot of your mine",
    );
  }
  // found 2 or more potentials, return a random one of them
  return potentialCells.get(random(numPotentials)) ?? 0;
}

function L8_getGoatCheese(): boolean {
  if (internalQuestStatus("questL08Trapper") !== 1) {
    // step1 = we spoke to trapper to unlock goatlet
    return false;
  }

  if (itemAmount($item`goat cheese`) >= 3) {
    return false;
  }
  // If we only need one and goats aren't already sniffed, just pull it.
  if (
    auto_inRonin() &&
    itemAmount($item`goat cheese`) === 2 &&
    !isSniffed$1($monster`dairy goat`)
  ) {
    pullXWhenHaveY($item`goat cheese`, 1, itemAmount($item`goat cheese`));
  } else if (auto_inRonin() && myDaycount() > 1) {
    // or on day 2+ just pull anyway, we have loads of pulls
    pullXWhenHaveY($item`goat cheese`, 1, itemAmount($item`goat cheese`));
  }
  // If we have enough now, just stop here.
  if (itemAmount($item`goat cheese`) >= 3) {
    return false;
  }
  // Condider softblocking until day 2 for Mayam
  if (auto_haveMayamCalendar() && itemAmount($item`goat cheese`) === 2) {
    if (auto_waitForDay2()) {
      auto_log_debug("Delaying Goatlet waiting for day 2.");
      return false;
    }
  }
  // Actually adventure for cheese
  auto_log_info("Yay for goat cheese!", "blue");
  if (get("_sourceTerminalDuplicateUses") === 0) {
    auto_sourceTerminalEducate($skill`Extract`, $skill`Duplicate`);
  }
  if (auto_haveGreyGoose() && itemAmount($item`goat cheese`) <= 1) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at a Dairy Goat for cheese, Gromit.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }
  if (
    canSniff($monster`dairy goat`, $location`The Goatlet`) &&
    auto_mapTheMonsters()
  ) {
    auto_log_info("Attemping to use Map the Monsters to olfact a Dairy Goat.");
  }
  auto_lostStomach(true);

  const retval: boolean = autoAdv($location`The Goatlet`);
  auto_sourceTerminalEducate($skill`Extract`, $skill`Portscan`);
  return retval;
}

function L8_mountainManSummonDo(): boolean {
  if (internalQuestStatus("questL08Trapper") < 1 && myLevel() >= 8) {
    L8_trapperTalk();
  }
  if (internalQuestStatus("questL08Trapper") !== 1) {
    // step1 = we spoke to trapper to learn what ores he wants
    return false;
  }
  const oreGoal: Item = safeGet("trapperOre");
  if (itemAmount(oreGoal) >= 3) {
    return false;
  }
  return auto_summonMountainMan();
}

export const L8_mountainManSummonTask: QuestTask = registerQuestTask({
  name: "L8_mountainManSummon",
  completed: () =>
    itemAmount(safeGet("trapperOre")) >= 3 ||
    internalQuestStatus("questL08Trapper") > 1,
  ready: () => true,
  do: L8_mountainManSummonDo,
  desiredEncounters: () => [
    {
      item: safeGet("trapperOre"),
      needAmount: 3 - itemAmount(safeGet("trapperOre")),
    },
  ],
});

export function L8_mountainManSummon(): boolean {
  return runQuestTask(L8_mountainManSummonTask);
}

export function L8_mineOreWorthBurningLuckOn(): boolean {
  if (internalQuestStatus("questL08Trapper") !== 1) {
    return false;
  }
  const oreGoal: Item = safeGet("trapperOre");
  if (itemAmount(oreGoal) >= 3) {
    return false;
  }
  if (
    !get("_chateauMonsterFought") &&
    safeGet("chateauMonster") === $monster`mountain man`
  ) {
    return false;
  }
  if (auto_haveTrainSet()) {
    return false;
  }
  return true;
}

const L8_getGoatCheeseTask: QuestTask = registerQuestTask({
  name: "L8_getGoatCheese",
  completed: () => !L8_wantsGoatCheese(),
  ready: () => true,
  do: L8_getGoatCheese,
  locations: $location`The Goatlet`,
  desiredEncounters: () => [
    {
      item: $item`goat cheese`,
      needAmount: 3 - itemAmount($item`goat cheese`),
    },
    {
      item: $item`glass of goat's milk`,
      needAmount:
        auto_is_valid($item`milk of magnesium`) &&
        (auto_have_skill($skill`Advanced Saucecrafting`) ||
          itemAmount($item`scrumptious reagent`) > 0)
          ? 1 - itemAmount($item`glass of goat's milk`)
          : 0,
    },
  ],
});

function L8_getMineOres(): boolean {
  if (internalQuestStatus("questL08Trapper") !== 1) {
    // step1 = we spoke to trapper to learn what ores he wants
    return false;
  }

  const oreGoal: Item = safeGet("trapperOre");

  if (itemAmount(oreGoal) >= 3) {
    return false;
  }

  if (safeGet("chateauMonster") === $monster`mountain man`) {
    // apparently this is a thing some people do. Lets add the most basic of support.
    return false;
  }

  if (L8_mountainManSummon()) {
    return true;
  }

  // in softcore we want to pull an ore
  if (canPull(oreGoal)) {
    pullXWhenHaveY(oreGoal, 1, itemAmount(oreGoal));
    if (itemAmount(oreGoal) === 3) {
      return true; // pulled successfully the last ore
    }
  }

  if (auto_haveTrainSet() && itemAmount(oreGoal) < 3) {
    return false; //will get ore organically through the train set so no need to adventure for it
  }

  if (auto_summonMountainManIsDelaying()) {
    // mountain man summon is deliberately waiting (e.g. to fill out the baseball diamond), don't burn a clover here
    return false;
  }

  // try to clover for the ore
  if (autoLuckyAdv($location`Itznotyerzitz Mine`)) {
    return true;
  }

  if (isAboutToPowerlevel()) {
    if (!possessOutfit("Mining Gear")) {
      auto_log_info("Getting Mining Gear.", "blue");
      return autoAdv($location`Itznotyerzitz Mine`);
    } else if (possessOutfit("Mining Gear", true)) {
      equipMaximizedGear();
      outfit("Mining Gear");
      acquireHP$3(1);
      auto_log_info("Mining in Itznotyerzitz Mine for Trapper ore", "blue");
      const cell: number = getCellToMine(oreGoal);
      if (cell !== 0) {
        set("auto_minedCells", `${get("auto_minedCells")}${cell.toString()},`);
        visitUrl(`mining.php?mine=1&which=${cell.toString()}&pwd`);
        return true;
      }
    }
  }

  return false;
}

export function L8_wantsGoatCheese(): boolean {
  return (
    itemAmount($item`goat cheese`) < 3 &&
    internalQuestStatus("questL08Trapper") <= 1
  );
}

const L8_getMineOresTask: QuestTask = registerQuestTask({
  name: "L8_getMineOres",
  completed: () =>
    itemAmount(safeGet("trapperOre")) >= 3 ||
    internalQuestStatus("questL08Trapper") > 1,
  ready: () => true,
  do: L8_getMineOres,
  locations: $location`Itznotyerzitz Mine`,
  desiredEncounters: () => [
    {
      item: safeGet("trapperOre"),
      needAmount: 3 - itemAmount(safeGet("trapperOre")),
    },
    ...(!possessOutfit("Mining Gear") && cloversAvailable() === 0
      ? $items`miner's helmet, 7-Foot Dwarven mattock, miner's pants`
          .filter((piece) => itemAmount(piece) === 0)
          .map((piece) => ({ item: piece, needAmount: 1 }))
      : []),
  ],
});

export function itznotyerzitzMineChoiceHandler(choice: number): void {
  auto_log_info(
    `itznotyerzitzMineChoiceHandler Running choice ${choice}`,
    "blue",
  );
  if (choice === 18) {
    // A Flat Miner
    if (possessEquipment($item`miner's pants`)) {
      if (possessEquipment($item`7-Foot Dwarven mattock`)) {
        auto_runChoice(3); // get 100 Meat.
      } else {
        auto_runChoice(2); // get 7-Foot Dwarven mattock
      }
    } else {
      auto_runChoice(1); // get miner's pants
    }
  } else if (choice === 19) {
    // 100% Legal
    if (possessEquipment($item`miner's helmet`)) {
      if (possessEquipment($item`miner's pants`)) {
        auto_runChoice(3); // get 100 Meat.
      } else {
        auto_runChoice(2); // get miner's pants
      }
    } else {
      auto_runChoice(1); // get miner's helmet
    }
  } else if (choice === 20) {
    // See You Next Fall
    if (possessEquipment($item`miner's helmet`)) {
      if (possessEquipment($item`7-Foot Dwarven mattock`)) {
        auto_runChoice(3); // get 100 Meat.
      } else {
        auto_runChoice(2); // get 7-Foot Dwarven mattock
      }
    } else {
      auto_runChoice(1); // get miner's helmet
    }
  } else if (choice === 556) {
    // More Locker Than Morlock
    if (!possessOutfit("Mining Gear")) {
      auto_runChoice(1); // get an outfit piece
    } else {
      auto_runChoice(2); // skip
    }
  } else {
    abort("unhandled choice in itznotyerzitzMineChoiceHandler");
  }
}

function L8_trapperExtreme(): boolean {
  if (internalQuestStatus("questL08Trapper") !== 2) {
    return false;
  }
  if (L8_trapperPeak()) {
    // try to unlock peak
    return true; //successfully finished this part of the quest
  }
  // First choice is the MtLargeHuge IOTM equipment
  if (auto_haveMcHugeLargeSkis()) {
    auto_equipAllMcHugeLarge();
    // plumber literally wont let you adventure if you have no way to fight in plumber.
    if (in_plumber()) {
      autoForceEquip($slot`acc3`, $item`work boots`);
    }
  } else if (
    possessOutfit(
      // we should equip the extreme outfit if we have it
      "eXtreme Cold-Weather Gear",
      true,
    )
  ) {
    // own and can equip
    autoOutfit("eXtreme Cold-Weather Gear");
  } else if (possessOutfit("eXtreme Cold-Weather Gear")) {
    // just own. thanks to else can not equip
    auto_log_warning(
      "I can not wear the eXtreme Gear, I'm just not awesome enough :(",
      "red",
    );
    return false;
  }
  // We don't need to force the first NC, it''s superlikely. The other two we can.
  const currentExtremity: number = get("currentExtremity");
  if (currentExtremity === 1 || currentExtremity === 2) {
    const NCForced: boolean = auto_forceNextNoncombat(
      $location`The eXtreme Slope`,
    );
    auto_log_info(
      `Trying to force NC at extreme slope: ${NCForced.toString()}`,
      "blue",
    );
  }
  // try to get extreme points
  auto_log_info("Penguin Tony Hawk time. Extreme!! SSX Tricky!!", "blue");
  return autoAdv($location`The eXtreme Slope`);
}

export function theeXtremeSlopeChoiceHandler(choice: number): void {
  auto_log_info(
    `theeXtremeSlopeChoiceHandler Running choice ${choice}`,
    "blue",
  );
  if (choice === 15) {
    // Yeti Nother Hippy
    if (possessEquipment($item`eXtreme mittens`)) {
      if (possessEquipment($item`eXtreme scarf`)) {
        auto_runChoice(3); // get 200 Meat.
      } else {
        auto_runChoice(2); // get eXtreme scarf
      }
    } else {
      auto_runChoice(1); // get eXtreme mittens
    }
  } else if (choice === 16) {
    // Saint Beernard
    if (possessEquipment($item`snowboarder pants`)) {
      if (possessEquipment($item`eXtreme scarf`)) {
        auto_runChoice(3); // get 200 Meat.
      } else {
        auto_runChoice(2); // get eXtreme scarf
      }
    } else {
      auto_runChoice(1); // get snowboarder pants
    }
  } else if (choice === 17) {
    // Generic Teen Comedy Snowboarding Adventure
    if (possessEquipment($item`eXtreme mittens`)) {
      if (possessEquipment($item`snowboarder pants`)) {
        auto_runChoice(3); // get 200 Meat.
      } else {
        auto_runChoice(2); // get snowboarder pants
      }
    } else {
      auto_runChoice(1); // get eXtreme mittens
    }
  } else if (choice === 575) {
    // Duffel on the Double
    if (haveEquipped($item`candy cane sword cane`)) {
      auto_runChoice(5); // get mittens and pants and lucky pill
    } else if (!possessOutfit("eXtreme Cold-Weather Gear")) {
      auto_runChoice(1); // get an outfit piece
    } else {
      if (isActuallyEd()) {
        // add other paths which don't want to waste spleen (if any) here.
        auto_runChoice(3); // skip
      } else {
        auto_runChoice(4); // Lucky Pill. (Clover for 1 spleen, worth?)
      }
    }
  } else {
    abort("unhandled choice in theeXtremeSlopeChoiceHandler");
  }
}

function L8_trapperNinjaLairDo(): boolean {
  // adventure in the lair of the ninja snowmen to find and fight ninja snowman assassins.
  // ~~usually this would only occur in hardcore~~
  // UPDATE: as of the May '26 IOTM we like ninja lair, so this should be typical with that IOTM.
  if (L8_trapperTalk()) {
    // try to unlock lair (sometimes necessary if called from L11 Shen)
    return true;
  }
  if (internalQuestStatus("questL08Trapper") !== 2) {
    return false;
  }
  if (L8_trapperPeak()) {
    // try to unlock peak
    return true; // successfully finished this part of the quest
  }
  if (get("auto_L8_extremeInstead", false)) {
    // we want to do extreme path instead
    return false;
  }
  if (get("auto_L8_ninjaAssassinFail", false)) {
    // we cannot survive against assassins
    set("auto_L8_extremeInstead", true);
    return false;
  }
  // we must use two variables because there are too many special cases. maybe we can survive assassins but not encounter them due to +combat being too low. Copiers and pulls complicate matters. We could copy an assassin even if we cannot encounter it in the lair
  //check if we can survive a hit or get the jump on NSA
  if (
    myMaxhp() <= expectedDamage($monster`ninja snowman assassin`) * 1.2 &&
    jumpChance($monster`ninja snowman assassin`) < 100
  ) {
    if (isAboutToPowerlevel()) {
      //if we can't survive and we are powerleveling, do extreme path
      set("auto_L8_ninjaAssassinFail", true);
      return true;
    } else {
      auto_log_warning(
        "Can't survive against ninja snowman assassin. Will delay and try again later",
        "red",
      );
      return false;
    }
  }

  if (
    haveEffect($effect`Thrice-Cursed`) > 0 ||
    haveEffect($effect`Twice-Cursed`) > 0 ||
    haveEffect($effect`Once-Cursed`) > 0
  ) {
    return false;
  }

  if (shenShouldDelayZone($location`Lair of the Ninja Snowmen`)) {
    auto_log_debug("Delaying Lair of the Ninja Snowmen in case of Shen.");
    return false;
  }
  // can we provide enough combat bonus to encounter snowman assassins, or force them?
  let CForced: boolean;
  if (auto_haveQueuedForcedCombat()) {
    CForced = true;
    auto_log_info(
      "Not trying to force combat again at Lair of the Ninja Showmen because we already have a forced combat queued",
    );
  } else {
    CForced = auto_forceNextCombat$1($location`Lair of the Ninja Snowmen`);
    auto_log_info(
      `Trying to force combat at Lair of the Ninja Snowmen: ${CForced.toString()}`,
      "blue",
    );
  }
  if (
    !CForced &&
    providePlusCombat(
      auto_combatModCap(),
      $location`Lair of the Ninja Snowmen`,
      true,
      true,
    ) <= 0.0
  ) {
    // ninja snowman does not show up if +combat is not greater than 0
    if (isAboutToPowerlevel()) {
      auto_log_info(
        `Something is keeping us from getting a suitable combat rate for ninja snowman assassin. we can only reach: ${numericModifier($modifier`Combat Rate`)}. Switching to extreme slope route`,
        "red",
      );
      set("auto_L8_extremeInstead", true);
      return true;
    } else {
      auto_log_warning(
        `Something is keeping us from getting a suitable combat rate for ninja snowman assassin. we can only reach: ${numericModifier($modifier`Combat Rate`)}. Will delay and try again later`,
        "red",
      );
    }
    return false;
  }
  // buff
  if (isActuallyEd() && !elementalPlanes_access(Element.get("spooky"))) {
    adjustEdHat("myst");
  }

  auto_getCitizenZone($location`Lair of the Ninja Snowmen`, false); //since we want to adventure in the Lair anyway

  if (autoAdv($location`Lair of the Ninja Snowmen`)) {
    return true;
  }
  auto_log_warning(
    "Mysteriously failed to adventure in [Lair of the Ninja Snowmen]",
    "red",
  );
  return false;
}

const L8_trapperNinjaLairTask: QuestTask = registerQuestTask({
  name: "L8_trapperNinjaLair",
  completed: () => internalQuestStatus("questL08Trapper") > 2,
  ready: () => true,
  do: L8_trapperNinjaLairDo,
  locations: $location`Lair of the Ninja Snowmen`,
  desiredEncounters: () =>
    $items`ninja carabiner, ninja crampons, ninja rope`.map((i) => ({
      item: i,
      needAmount: 1 - itemAmount(i),
    })),
});

export function L8_trapperNinjaLair(): boolean {
  return runQuestTask(L8_trapperNinjaLairTask);
}

function L8_trapperGroarDo(): boolean {
  // do the peak portion of L8 trapper quest.
  if (get("_auto_skip_L8_trapperGroar", false)) {
    auto_log_warning(
      "Skipping L8_trapperGroar() today as per _auto_skip_L8_trapperGroar",
    );
    return false;
  }
  // error catching for if we are actually on step5 and mafia did not notice.
  if (
    itemAmount($item`Groar's fur`) > 0 ||
    itemAmount($item`winged yeti fur`) > 0 ||
    itemAmount($item`cursed blanket`) > 0
  ) {
    auto_log_info(
      `Quest tracking error detected. Mafia thinks we are in step4 of questL08Trapper but we are in fact in step5. Correcting. Current Path = ${myPath().name}`,
      "red",
    );
    set("questL08Trapper", "step5");
    return true;
  }

  if (wildfire_groar_check()) {
    return false;
  }
  if (is_professor()) {
    return false; //don't try for Groar as Professor
  }
  // we need 5 cold res to be allowed to adventure in [Mist-shrouded Peak]
  const resGoal: Map<Element, number> = new Map();
  resGoal.set($element`cold`, 5);
  // try getting resistance without equipment before bothering to change gear

  let retval: boolean = false;
  const initial_adv: number = mySessionAdv();
  if (
    provideResistances$4(resGoal, $location`Mist-Shrouded Peak`, false) ||
    provideResistances$4(resGoal, $location`Mist-Shrouded Peak`, true)
  ) {
    auto_log_info("Time to take out Gargle, sure, Gargle (Groar)", "blue");
    equipMaximizedGear();
    //AoSOL buffs
    if (in_aosol()) {
      buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
      buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    }
    if ($location`Mist-Shrouded Peak`.turnsSpent >= 3) {
      //does not account for possible defeats
      set("auto_nextEncounter", "Groar");
    } else {
      set("auto_nextEncounter", "panicking Knott Yeti");
    }
    set("auto_nonAdvLoc", true);
    // Let's whack some free XP on our Chest Mimic (it's a chaun)
    if (
      auto_haveChestMimic() &&
      maximizer.getWeight($modifier`Meat Drop`) > 0.1
    ) {
      handleFamiliar$1($familiar`Chest Mimic`);
      provideFamExp$2(50, $location`Mist-Shrouded Peak`, true, false);
    }

    retval = autoAdv($location`Mist-Shrouded Peak`);
  }
  if (retval && initial_adv === mySessionAdv()) {
    //several inf loops can occur here
    auto_log_debug(
      "Adventured without spending an adv in [Mist-shrouded Peak]. Checking for problems",
      "blue",
    );

    const initial_step: number = internalQuestStatus("questL08Trapper");
    cliExecute("refresh quests");
    const current_step: number = internalQuestStatus("questL08Trapper");
    const track_error: boolean = initial_step !== current_step;

    if (track_error) {
      //quest tracking was wrong and fixed.
      if (current_step > 4) {
        //boss is actually dead now
        // if boss is dead [Mist-shrouded Peak] becomes [The Icy Peak].
        // common tracking issue which casue inf loop. already fixed by the quest refresh.
        auto_log_warning(
          "questL08Trapper value was incorrect. Boss is already dead. This has been fixed to prevent inf loop",
          "blue",
        );
      } else {
        auto_log_warning(
          "questL08Trapper value was incorrect. This has been fixed",
          "blue",
        );
      }
    } else {
      auto_log_debug(
        "questL08Trapper value was correct despite oddity with adv spent",
      );
    }

    if (current_step === 3 || current_step === 4) {
      // boss is still alive yet no adv was spent. most likely scenario is that our cold res was too low. maybe free combat?
      if (checkIfRepeating() && getRepeats() > 5) {
        print(
          "We are stuck trying to adventure in [Mist-shrouded Peak] and failing repeatedly",
          "red",
        );
        print(
          "Probably a problem with cold res. Please report this issue.",
          "red",
        );
        print("Finish the peak yourself then run autoscend again", "red");
        print(
          "If you wish to have autoscend ignore this and go do other stuff then enter in gCLI:",
          "red",
        );
        print("set _auto_skip_L8_trapperGroar = true", "red");
        abort();
      }
    }
  }
  return retval;
}

export const L8_trapperGroarTask: QuestTask = registerQuestTask({
  name: "L8_trapperGroar",
  completed: () => internalQuestStatus("questL08Trapper") > 4,
  // peak not yet unlocked or we are done with groar
  ready: () => internalQuestStatus("questL08Trapper") >= 3,
  do: L8_trapperGroarDo,
  locations: $location`Mist-Shrouded Peak`,
  desiredEncounters: () => [
    {
      monster: $monster`Groar`,
      needAmount: internalQuestStatus("questL08Trapper") > 4 ? 0 : 1,
    },
  ],
});

export function L8_trapperGroar(): boolean {
  return runQuestTask(L8_trapperGroarTask);
}

export function ninjaItemsRemaining(): number {
  let items_remaining: number = 3;
  if (itemAmount($item`ninja carabiner`) > 0) {
    items_remaining -= 1;
  }
  if (itemAmount($item`ninja crampons`) > 0) {
    items_remaining -= 1;
  }
  if (itemAmount($item`ninja rope`) > 0) {
    items_remaining -= 1;
  }
  return items_remaining;
}

function L8_trapperPeakDo(): boolean {
  // unlock the peak in the trapper quest
  // unlock peak using ninja climbing gear
  if (ninjaItemsRemaining() < 1) {
    const resGoal: Map<Element, number> = new Map();
    resGoal.set($element`cold`, 5);
    if (provideResistances$4(resGoal, $location`Mist-Shrouded Peak`, true)) {
      equipMaximizedGear();
      visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak"); // unlock peak. advancing to step 4.
      set("auto_ninjasnowmanassassin", true); // heavy rains. are we done copying them
    } else {
      // TODO get outfit
      // TODO does TCRS have a problem with the outfit still not being enough? look into it
      return false; // we are unable to provide 5 cold res
    }

    if (internalQuestStatus("questL08Trapper") === 3) {
      return true; // successfully unlocked peak
    } else {
      abort("Mysteriously failed to climb the slope using ninja climbing gear");
    }
  }
  // unlock peak using extremeness
  if (get("currentExtremity") >= 3) {
    if (auto_haveMcHugeLargeSkis()) {
      equip($slot`back`, $item`McHugeLarge duffel bag`);
      equip($slot`weapon`, $item`McHugeLarge right pole`);
      equip($slot`off-hand`, $item`McHugeLarge left pole`);
      equip($slot`acc1`, $item`McHugeLarge left ski`);
      equip($slot`acc2`, $item`McHugeLarge right ski`);
      visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak");
      return true;
    }
    // TODO: There are some reports of this breaking in TCRS, when cold-weather
    // gear is not sufficient to have 5 cold resistance. Use a maximizer statement?
    if (outfit("eXtreme Cold-Weather Gear")) {
      visitUrl("place.php?whichplace=mclargehuge&action=cloudypeak");
      return true;
    }
  }

  return false;
}

const L8_trapperPeakTask: QuestTask = registerQuestTask({
  name: "L8_trapperPeak",
  completed: () => internalQuestStatus("questL08Trapper") > 2,
  ready: () => internalQuestStatus("questL08Trapper") === 2,
  do: L8_trapperPeakDo,
});

export function L8_trapperPeak(): boolean {
  return runQuestTask(L8_trapperPeakTask);
}

export function L8_forceExtremeInstead(): boolean {
  // If for some reason we've already got 2 ninja items, no need to get forcey
  if (availableAmount($item`ninja crampons`) > 0) {
    return false;
  }
  // Set the variable if we're doing McHugeLarge items and aren't already forcing combats for lair
  if (
    auto_canEquipAllMcHugeLarge() &&
    !auto_haveQueuedForcedCombat() &&
    !auto_canForceNextCombat() &&
    (!auto_haveCombatForceSource() || isAboutToPowerlevel())
  ) {
    set("auto_L8_extremeInstead", true);
  }
  return get("auto_L8_extremeInstead", false);
}

function L8_trapperSlopeDo(): boolean {
  // climb the slope and reach the peak in L8 trapper quest. either via ninja snowmen lair or via the extreme slope

  if (canInteract()) {
    // casual and postronin special handling
    return L8_slopeCasual(); // mallbuy everything. or go do something else if too poor to do so
  }
  if (L8_trapperPeak()) {
    // try to finish step2 of the quest.
    return true;
  }
  // hardcore handling
  if (robot_delay("outfit")) {
    return false; // delay for You, Robot path
  }
  // similar if statements exist in the L11 quest file (shen)
  // We want to go ninja lair if we can force the NSAs
  if (auto_canForceNextCombat() || auto_haveQueuedForcedCombat()) {
    if (L8_trapperNinjaLair()) {
      return true;
    }
  }
  if (
    auto_haveCombatForceSource() &&
    !isAboutToPowerlevel() &&
    !get("auto_L8_extremeInstead", false)
  ) {
    return false; // we want to wait until we can force combats if we have a force source, unless we've decided to go extreme or have totally run out of tasks
  }
  // Checks for McHugeLarge skis
  if (L8_forceExtremeInstead()) {
    if (L8_trapperExtreme()) {
      // try to climb slope via extreme path
      return true;
    }
  }
  if (get("auto_L8_extremeInstead", false)) {
    // we decided we do not want to adventure in the ninja lair
    if (L8_trapperExtreme()) {
      // try to climb slope via extreme path
      return true;
    }
  }
  if (L8_trapperNinjaLair()) {
    // try to climb slope via ninja path
    return true;
  }

  return false;
}

export const L8_trapperSlopeTask: QuestTask = registerQuestTask({
  name: "L8_trapperSlope",
  completed: () => internalQuestStatus("questL08Trapper") > 2,
  // climbing the slope is step2 of the quest. when you unlock the peak it advances to step3
  ready: () => internalQuestStatus("questL08Trapper") === 2,
  do: L8_trapperSlopeDo,
  locations: $location`The eXtreme Slope`,
  desiredEncounters: () =>
    !possessOutfit("eXtreme Cold-Weather Gear") &&
    $items`eXtreme scarf, snowboarder pants, eXtreme mittens`.every((e) =>
      auto_is_valid(e),
    )
      ? $items`eXtreme scarf, snowboarder pants, eXtreme mittens`
          .filter((piece) => itemAmount(piece) === 0)
          .map((piece) => ({ item: piece, needAmount: 1 }))
      : [],
});

export function L8_trapperSlope(): boolean {
  return runQuestTask(L8_trapperSlopeTask);
}

function L8_trapperTalkDo(): boolean {
  // talk to the trapper to advance the L8 quest.
  const initial_step: number = internalQuestStatus("questL08Trapper");

  if (initial_step === 0) {
    // step0===quest started. we do not know what ores we need yet.
    auto_log_info(
      "Talking to the trapper to find out what kind of Ore he wants",
      "blue",
    );
    visitUrl("place.php?whichplace=mclargehuge&action=trappercabin"); // talk to the trapper to advance quest
  }
  if (initial_step === 1) {
    // step1===we know what ore to get. so go get ore and cheese
    if (
      itemAmount(safeGet("trapperOre")) >= 3 &&
      itemAmount($item`goat cheese`) >= 3
    ) {
      // turn in ore and cheese to advance from step1 to step2
      auto_log_info(
        `Giving Trapper goat cheese and ${safeGet("trapperOre")}`,
        "blue",
      );
      visitUrl("place.php?whichplace=mclargehuge&action=trappercabin"); // talk to the trapper to advance quest
    } else {
      return false; // not enough cheese or ore yet. go get them
    }
  }
  // error checking
  if (initial_step === internalQuestStatus("questL08Trapper")) {
    // we failed to advance. try refreshing quests
    auto_log_info(
      `we visited trapper but failed to advance the quest from step${initial_step}. Refreshing quests`,
      "red",
    );
    cliExecute("refresh quests");
  }
  if (initial_step === internalQuestStatus("questL08Trapper")) {
    // refreshing quests did not solve the problem
    abort(
      "We were unable to advance the quest when talking to the trapper for some reason",
    );
  }
  return true;
}

const L8_trapperTalkTask: QuestTask = registerQuestTask({
  name: "L8_trapperTalk",
  completed: () => internalQuestStatus("questL08Trapper") > 1,
  // only need to talk to trapper at steps 0 and 1
  ready: () => [0, 1].includes(internalQuestStatus("questL08Trapper")),
  do: L8_trapperTalkDo,
});

const L8_trapperFinishTask: QuestTask = registerQuestTask({
  name: "L8_trapperFinish",
  completed: () => internalQuestStatus("questL08Trapper") > 5,
  ready: () => {
    if (internalQuestStatus("questL08Trapper") !== 5) {
      return false;
    }
    if (
      auto_copierShouldDelayZone(
        $locations`The Goatlet, Itznotyerzitz Mine, Lair of the Ninja Snowmen, Mist-Shrouded Peak, The eXtreme Slope`,
      )
    ) {
      auto_log_debug(
        "Delaying L8 turn-in - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: () => {
    visitUrl("place.php?whichplace=mclargehuge&action=trappercabin");
    council();
  },
});

export function L8_trapperTalk(): boolean {
  return runQuestTask(L8_trapperTalkTask);
}

function L8_trapperQuestDo(): boolean {
  // do the entire L8 trapper quest

  if (L8_trapperTalk()) {
    return true;
  }
  //at end of day last chance to get milk could be more valuable for characters with a stomach than not cancelling banishes used in L7
  if (
    myAdventures() < 7 &&
    !get("_milkOfMagnesiumUsed") &&
    fullnessLimit() !== 0 &&
    haveSkill($skill`Advanced Saucecrafting`) &&
    L8_getGoatCheese()
  ) {
    return true;
  } else if (L7_override()) {
    //if any olfaction or banishes used in an earlier area finish there first
    return true;
  }

  return runTaskChain([
    L8_getGoatCheeseTask,
    L8_getMineOresTask,
    L8_trapperSlopeTask,
    L8_trapperGroarTask,
    L8_trapperFinishTask,
  ]);
}

export const L8_trapperQuestTask: QuestTask = registerQuestTask({
  name: "L8_trapperQuest",
  completed: () => internalQuestStatus("questL08Trapper") > 5,
  ready: () => internalQuestStatus("questL08Trapper") >= 0,
  do: L8_trapperQuestDo,
});

export function L8_trapperQuest(): boolean {
  return runQuestTask(L8_trapperQuestTask);
}
