import {
  containsText,
  haveEquipped,
  isUnrestricted,
  Item,
  itemAmount,
  myAdventures,
  myDaycount,
  myLevel,
  myMeat,
  myPrimestat,
  npcPrice,
  Stat,
  toLowerCase,
  visitUrl,
} from "kolmafia";
import { $item, $location, $monster, $skill, $stat, get } from "libram";

import { AutoSourceTerminal } from "../../../types";
import { autoAdvBypass$1, CombatMacro } from "../../auto_adventure";
import {
  auto_log_info,
  canYellowRay,
  organsFull,
  safeGet,
  wrap_item,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { inAftercore } from "../../paths/casual";
import { needOre } from "../../quests/level_08";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";

export function chateaumantegna_available(): boolean {
  const chateau_key: Item = wrap_item($item`Chateau Mantegna room key`);
  if (!in_lol() && get("chateauAvailable") && isUnrestricted(chateau_key)) {
    return true;
  }
  if (
    in_lol() &&
    get("replicaChateauAvailable") &&
    isUnrestricted(chateau_key)
  ) {
    return true;
  }
  return false;
}

export function chateaumantegna_useDesk(): void {
  if (get("_chateauDeskHarvested")) return;

  if (chateaumantegna_available()) {
    const chateau: string = visitUrl("place.php?whichplace=chateau");
    if (containsText(chateau, "chateau_desk1")) {
      visitUrl("place.php?whichplace=chateau&action=chateau_desk1");
    } else if (containsText(chateau, "chateau_desk2")) {
      visitUrl("place.php?whichplace=chateau&action=chateau_desk2");
    } else if (containsText(chateau, "chateau_desk3")) {
      visitUrl("place.php?whichplace=chateau&action=chateau_desk3");
    }
  }
}

export function chateaumantegna_havePainting(): boolean {
  if (
    chateaumantegna_available() &&
    !containsText(
      visitUrl("place.php?whichplace=chateau"),
      "chateau_paintingnone",
    )
  ) {
    return !get("_chateauMonsterFought");
  }
  return false;
}

export function chateaumantegna_usePainting(option?: CombatMacro): boolean {
  if (!chateaumantegna_available()) {
    return false;
  }
  if (get("_chateauMonsterFought")) {
    return false;
  }

  if (safeGet("chateauMonster") === $monster`lobsterfrogman`) {
    if (auto_gunpowderBarrelsWanted() <= 0) {
      return false;
    }
    if (get("sidequestLighthouseCompleted") !== "none") {
      return false;
    }
  }
  if (safeGet("chateauMonster") === $monster`Bram the Stoker`) {
    if (
      haveEquipped($item`Bram's choker`) ||
      itemAmount($item`Bram's choker`) > 0
    ) {
      return false;
    }
  }
  if (safeGet("chateauMonster") === $monster`mountain man`) {
    if (!needOre()) {
      return false;
    }
  }
  if (chateaumantegna_available()) {
    return autoAdvBypass$1(
      "place.php?whichplace=chateau&action=chateau_painting",
      $location`Noob Cave`,
      option,
    );
  }
  return false;
}

export function chateaumantegna_decorations(): Item[] {
  const retval: Item[] = [];
  if (!chateaumantegna_available()) {
    return retval;
  }
  const chateau: string = toLowerCase(visitUrl("place.php?whichplace=chateau"));
  if (containsText(chateau, "electric muscle stimulator")) {
    retval.push($item`electric muscle stimulator`);
  } else if (containsText(chateau, "foreign language tapes")) {
    retval.push($item`foreign language tapes`);
  } else if (containsText(chateau, "bowl of potpourri")) {
    retval.push($item`bowl of potpourri`);
  }
  if (containsText(chateau, "antler chandelier")) {
    retval.push($item`antler chandelier`);
  } else if (containsText(chateau, "artificial skylight")) {
    retval.push($item`artificial skylight`);
  } else if (containsText(chateau, "ceiling fan")) {
    retval.push($item`ceiling fan`);
  }
  if (containsText(chateau, "continental juice bar")) {
    retval.push($item`continental juice bar`);
  } else if (containsText(chateau, "fancy stationery set")) {
    retval.push($item`fancy stationery set`);
  } else if (containsText(chateau, "swiss piggy bank")) {
    retval.push($item`Swiss piggy bank`);
  }
  return retval;
}

function chateaumantegna_buyStuff(toBuy: Item): void {
  if (!chateaumantegna_available()) {
    return;
  }

  if (toBuy === $item`electric muscle stimulator` && myMeat() >= 500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=411&quantity=1",
      true,
    );
  }
  if (toBuy === $item`foreign language tapes` && myMeat() >= 500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=412&quantity=1",
      true,
    );
  }
  if (toBuy === $item`bowl of potpourri` && myMeat() >= 500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=413&quantity=1",
      true,
    );
  }

  if (toBuy === $item`antler chandelier` && myMeat() >= 1500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=415&quantity=1",
      true,
    );
  }
  if (toBuy === $item`artificial skylight` && myMeat() >= 1500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=416&quantity=1",
      true,
    );
  }
  if (toBuy === $item`ceiling fan` && myMeat() >= 1500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=414&quantity=1",
      true,
    );
  }

  if (toBuy === $item`continental juice bar` && myMeat() >= 2500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=418&quantity=1",
      true,
    );
  }
  if (toBuy === $item`fancy calligraphy pen` && myMeat() >= 2500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=419&quantity=1",
      true,
    );
  }
  if (toBuy === $item`Swiss piggy bank` && myMeat() >= 2500) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=417&quantity=1",
      true,
    );
  }

  if (toBuy === $item`alpine watercolor set` && myMeat() >= 5000) {
    visitUrl(
      "shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=420&quantity=1",
      true,
    );
  }
}

export function chateaumantegna_nightstandSet(): boolean {
  if (!chateaumantegna_available()) {
    return false;
  }

  let myStat: Stat = myPrimestat();
  if (myStat === $stat.none) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }
  if (myLevel() >= 13) {
    if (get("nsContestants2") === -1) {
      myStat = safeGet("nsChallenge1");
    } else {
      return false;
    }
  }

  const furniture: Item[] = chateaumantegna_decorations();
  let need: Item = $item.none;
  if (myStat === $stat`Muscle`) {
    need = $item`electric muscle stimulator`;
  } else if (myStat === $stat`Mysticality`) {
    need = $item`foreign language tapes`;
  } else if (myStat === $stat`Moxie`) {
    need = $item`bowl of potpourri`;
  }

  if (need === $item.none) {
    //If we do not have a telescope, this can happen.
    return false;
  }
  if (furniture.includes(need)) {
    return false;
  }
  if (myMeat() < npcPrice(need)) {
    return false;
  }
  auto_log_info(
    "We have the wrong Chateau Nightstand item, replacing.",
    "blue",
  );
  chateaumantegna_buyStuff(need);
  return true;
}

function chateauPaintingDo(): boolean {
  let paintingLevel: number = 8;
  if (in_ocrs()) {
    paintingLevel = 9;
  }
  if (
    myLevel() >= paintingLevel &&
    chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    isActuallyEd() &&
    myDaycount() <= 3
  ) {
    if (canYellowRay()) {
      AutoSourceTerminal.auto_sourceTerminalEducate(
        $skill`Extract`,
        $skill`Digitize`,
      );
      if (chateaumantegna_usePainting()) {
        return true;
      }
    }
  }

  if (
    organsFull() &&
    myAdventures() < 10 &&
    chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    myDaycount() === 1 &&
    !isActuallyEd()
  ) {
    AutoSourceTerminal.auto_sourceTerminalEducate(
      $skill`Extract`,
      $skill`Digitize`,
    );
    if (chateaumantegna_usePainting()) {
      return true;
    }
  }
  if (
    myLevel() >= 8 &&
    chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    myDaycount() === 2 &&
    !isActuallyEd()
  ) {
    AutoSourceTerminal.auto_sourceTerminalEducate(
      $skill`Extract`,
      $skill`Digitize`,
    );
    if (chateaumantegna_usePainting()) {
      return true;
    }
  }
  return false;
}

export const chateauPaintingTask: QuestTask = registerQuestTask({
  name: "chateauPainting",
  completed: () =>
    get("_chateauMonsterFought", false) || !chateaumantegna_available(),
  ready: () => true,
  do: chateauPaintingDo,
  desiredEncounters: () => [
    {
      monster: safeGet("chateauMonster"),
      needAmount: get("_chateauMonsterFought") ? 0 : 1,
    },
  ],
});

export function chateauPainting(): boolean {
  return runQuestTask(chateauPaintingTask);
}
