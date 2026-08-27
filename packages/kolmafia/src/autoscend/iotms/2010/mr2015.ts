import {
  cliExecute,
  containsText,
  equip,
  equippedItem,
  getProperty,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  min,
  myAdventures,
  myDaycount,
  myHp,
  myLevel,
  myMeat,
  myPrimestat,
  npcPrice,
  splitString,
  Stat,
  toBoolean,
  toInt,
  toLowerCase,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  get,
  set,
} from "libram";

import { auto_buyUpTo } from "../../auto_acquire";
import { autoAdv, autoAdvBypass$1, CombatMacro } from "../../auto_adventure";
import { possessEquipment } from "../../auto_equipment";
import {
  canChangeToFamiliar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../../auto_familiar";
import {
  auto_abort,
  auto_autosell,
  auto_get_campground,
  auto_is_valid,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  canYellowRay,
  handleTracker,
  internalQuestStatus,
  organsFull,
  safeGet,
  wrap_item,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { is_jarlsberg } from "../../paths/2013/avatar_of_jarlsberg";
import { is_pete } from "../../paths/2014/avatar_of_sneaky_pete";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import { in_awol } from "../../paths/2016/avatar_of_west_of_loathing";
import { in_nuclear } from "../../paths/2016/nuclear_autumn";
import { in_theSource } from "../../paths/2016/the_source";
import { in_gnoob } from "../../paths/2017/gelatinous_noob";
import { in_lta } from "../../paths/2017/license_to_adventure";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { inAftercore } from "../../paths/casual";
import { needOre } from "../../quests/level_08";
import { auto_gunpowderBarrelsWanted } from "../../quests/level_12";
import { towerKeyCount } from "../../quests/level_13";
import { TrainSet$$auto_haveTrainSet } from "../2020/mr2022";
import { ElementalPlanes$$elementalPlanes_access } from "../other/elementalPlanes";
import { SourceTerminal$$auto_sourceTerminalEducate } from "./mr2016";

//	This is meant for items that have a date of 2015
//	Handling: shrine to the Barrel God, Chateau Mantegna Room Key, Deck of Every Card
//

//Defined in autoscend/iotms/mr2015.ash

export function BarrelOfPrayer$$auto_barrelPrayers(): boolean {
  if (!isUnrestricted($item`shrine to the Barrel god`)) {
    return false;
  }
  if (get("_barrelPrayer")) {
    return false;
  }
  if (!get("barrelShrineUnlocked")) {
    visitUrl("da.php");
    if (!get("barrelShrineUnlocked")) {
      return false;
    }
  }
  if (inAftercore()) {
    return false;
  }

  let prayers: string[] = [];

  if (in_lta()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Protection", "Vigor"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_nuclear()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Vigor", "Glamour"];
        break;
      case 2:
        prayers = ["Vigor", "Glamour"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (in_theSource()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_awol()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (is_boris()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["none"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (is_pete()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (is_jarlsberg()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor", "Protection"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  } else if (in_wotsf()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["none"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (in_heavyrains()) {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Vigor"];
        break;
      case 2:
        prayers = ["Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Glamour", "Vigor"];
        break;
    }
  } else if (isActuallyEd()) {
    if (
      ElementalPlanes$$elementalPlanes_access($element`spooky`) &&
      get("edPoints") >= 2
    ) {
      switch (myDaycount()) {
        case 1:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 2:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 3:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 4:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
      }
    } else {
      switch (myDaycount()) {
        case 1:
          prayers = ["Glamour", "Vigor", "Protection"];
          break;
        case 2:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 3:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
        case 4:
          prayers = ["Protection", "Glamour", "Vigor"];
          break;
      }
    }
  } else {
    switch (myDaycount()) {
      case 1:
        prayers = ["Glamour", "Protection", "Vigor"];
        break;
      case 2:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 3:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
      case 4:
        prayers = ["Protection", "Glamour", "Vigor"];
        break;
    }
  }

  for (const prayer of prayers) {
    if (prayer === "none") {
      return false;
    }
    if (!toBoolean(getProperty(`prayedFor${prayer}`))) {
      cliExecute(`barrelprayer ${prayer}`);
      return true;
    }
  }

  return false;
}

export function MayoClinic$$auto_mayoItems(): boolean {
  if (!isUnrestricted($item`portable Mayo Clinic`)) {
    return false;
  }
  if (get("_mayoDeviceRented")) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }
  if (!auto_get_campground().has($item`portable Mayo Clinic`)) {
    return false;
  }
  if (myMeat() < 10000) {
    return false;
  }

  let mayos: Item[] = [];
  if (is_boris()) {
    switch (myDaycount()) {
      case 1:
        mayos = $items`tomayohawk-style reflex hammer`;
        break;
      case 2:
      case 3:
      case 4:
        mayos = $items`mayo lance`;
        break;
    }
  } else if (in_heavyrains() && !inHardcore()) {
    switch (myDaycount()) {
      case 1:
        mayos = [$item.none];
        break;
      case 2:
        mayos = $items`miracle whip`;
        break;
      case 3:
      case 4:
        mayos = $items`sphygmayomanometer`;
        break;
    }
  } else if (in_gnoob()) {
    switch (myDaycount()) {
      default:
        mayos = [$item.none];
        break;
    }
  } else if (in_lta()) {
    switch (myDaycount()) {
      default:
        mayos = [$item.none];
        break;
    }
  } else {
    switch (myDaycount()) {
      case 1:
      case 2:
      case 3:
      case 4:
        mayos = $items`mayo lance`;
        break;
    }
  }

  for (const mayo of mayos) {
    if (mayo === $item`mayo lance`) {
      if (haveFamiliar($familiar`Crimbo Shrub`)) {
        continue;
      }
      if (haveFamiliar($familiar`Intergnat`)) {
        continue;
      }
    }
    if (mayo === $item.none) {
      return false;
    }
    if (itemAmount(mayo) === 0) {
      auto_buyUpTo(1, mayo);
      return true;
    }
  }

  return false;
}

export function ChateauMantegna$$chateaumantegna_available(): boolean {
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

export function ChateauMantegna$$chateaumantegna_useDesk(): void {
  if (get("_chateauDeskHarvested")) return;

  if (ChateauMantegna$$chateaumantegna_available()) {
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

export function ChateauMantegna$$chateaumantegna_havePainting(): boolean {
  if (
    ChateauMantegna$$chateaumantegna_available() &&
    !containsText(
      visitUrl("place.php?whichplace=chateau"),
      "chateau_paintingnone",
    )
  ) {
    return !get("_chateauMonsterFought");
  }
  return false;
}

export function ChateauMantegna$$chateaumantegna_usePainting(
  option?: CombatMacro,
): boolean {
  if (!ChateauMantegna$$chateaumantegna_available()) {
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
  if (ChateauMantegna$$chateaumantegna_available()) {
    return autoAdvBypass$1(
      "place.php?whichplace=chateau&action=chateau_painting",
      $location`Noob Cave`,
      option,
    );
  }
  return false;
}

export function ChateauMantegna$$chateaumantegna_decorations(): Item[] {
  const retval: Item[] = [];
  if (!ChateauMantegna$$chateaumantegna_available()) {
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

function ChateauMantegna$$chateaumantegna_buyStuff(toBuy: Item): void {
  if (!ChateauMantegna$$chateaumantegna_available()) {
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

export function ChateauMantegna$$chateaumantegna_nightstandSet(): boolean {
  if (!ChateauMantegna$$chateaumantegna_available()) {
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

  const furniture: Item[] = ChateauMantegna$$chateaumantegna_decorations();
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
  ChateauMantegna$$chateaumantegna_buyStuff(need);
  return true;
}

function ChateauMantegna$$chateauPaintingDo(): boolean {
  let paintingLevel: number = 8;
  if (in_ocrs()) {
    paintingLevel = 9;
  }
  if (
    myLevel() >= paintingLevel &&
    ChateauMantegna$$chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    isActuallyEd() &&
    myDaycount() <= 3
  ) {
    if (canYellowRay()) {
      SourceTerminal$$auto_sourceTerminalEducate(
        $skill`Extract`,
        $skill`Digitize`,
      );
      if (ChateauMantegna$$chateaumantegna_usePainting()) {
        return true;
      }
    }
  }

  if (
    organsFull() &&
    myAdventures() < 10 &&
    ChateauMantegna$$chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    myDaycount() === 1 &&
    !isActuallyEd()
  ) {
    SourceTerminal$$auto_sourceTerminalEducate(
      $skill`Extract`,
      $skill`Digitize`,
    );
    if (ChateauMantegna$$chateaumantegna_usePainting()) {
      return true;
    }
  }
  if (
    myLevel() >= 8 &&
    ChateauMantegna$$chateaumantegna_havePainting() &&
    !get("_chateauMonsterFought", false) &&
    myDaycount() === 2 &&
    !isActuallyEd()
  ) {
    SourceTerminal$$auto_sourceTerminalEducate(
      $skill`Extract`,
      $skill`Digitize`,
    );
    if (ChateauMantegna$$chateaumantegna_usePainting()) {
      return true;
    }
  }
  return false;
}

export const ChateauMantegna$$chateauPaintingTask: QuestTask =
  registerQuestTask({
    name: "chateauPainting",
    completed: () =>
      get("_chateauMonsterFought", false) ||
      !ChateauMantegna$$chateaumantegna_available(),
    ready: () => true,
    do: ChateauMantegna$$chateauPaintingDo,
    desiredEncounters: () => [
      {
        monster: safeGet("chateauMonster"),
        needAmount: get("_chateauMonsterFought") ? 0 : 1,
      },
    ],
  });

export function ChateauMantegna$$chateauPainting(): boolean {
  return runQuestTask(ChateauMantegna$$chateauPaintingTask);
}

function DeckOfEveryCard$$deck_available(): boolean {
  const deck: Item = wrap_item($item`Deck of Every Card`);
  return itemAmount(deck) > 0 && isUnrestricted(deck) && auto_is_valid(deck);
}

function DeckOfEveryCard$$deck_draws_left(): number {
  if (!DeckOfEveryCard$$deck_available()) {
    return 0;
  }
  if (myHp() === 0) {
    return 0;
  }
  return 15 - get("_deckCardsDrawn");
}

let DeckOfEveryCard$$$_deck_cheat_cards: Map<string, number> | undefined;

function DeckOfEveryCard$$deck_cheat(cheat: string): boolean {
  if (!DeckOfEveryCard$$deck_available()) {
    return false;
  }
  if (DeckOfEveryCard$$deck_draws_left() <= 0) {
    return false;
  }
  if (myHp() === 0) {
    return false;
  }
  cheat = toLowerCase(cheat);
  DeckOfEveryCard$$$_deck_cheat_cards ??= new Map();
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of clubs", 1);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of hearts", 2);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of diamonds", 3);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of spades", 4);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of cups", 5);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of wands", 6);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of swords", 7);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of coins", 8);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xiii - death", 9);
  DeckOfEveryCard$$$_deck_cheat_cards.set("goblin sapper", 10);

  DeckOfEveryCard$$$_deck_cheat_cards.set("the hive", 11);
  DeckOfEveryCard$$$_deck_cheat_cards.set("hunky fireman card", 12);
  DeckOfEveryCard$$$_deck_cheat_cards.set("v - the hierophant", 13);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xviii - the moon", 14);
  DeckOfEveryCard$$$_deck_cheat_cards.set("werewolf", 15);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xv - the devil", 16);
  DeckOfEveryCard$$$_deck_cheat_cards.set("fire elemental", 17);
  DeckOfEveryCard$$$_deck_cheat_cards.set("slimer trading card", 18);
  DeckOfEveryCard$$$_deck_cheat_cards.set("vii - the chariot", 19);
  DeckOfEveryCard$$$_deck_cheat_cards.set("ii - the high priestess", 20);

  DeckOfEveryCard$$$_deck_cheat_cards.set("xii - the hanged man", 21);
  DeckOfEveryCard$$$_deck_cheat_cards.set("plantable greeting card", 22);
  DeckOfEveryCard$$$_deck_cheat_cards.set("pirate birthday card", 23);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xiv - temperance", 24);
  DeckOfEveryCard$$$_deck_cheat_cards.set("unstable portal", 25);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xvii - the star", 26);
  DeckOfEveryCard$$$_deck_cheat_cards.set("suit warehouse discount card", 27);
  DeckOfEveryCard$$$_deck_cheat_cards.set("christmas card", 28);
  DeckOfEveryCard$$$_deck_cheat_cards.set("go fish", 29);
  DeckOfEveryCard$$$_deck_cheat_cards.set("aquarius horoscope", 30);

  DeckOfEveryCard$$$_deck_cheat_cards.set("plains", 31);
  DeckOfEveryCard$$$_deck_cheat_cards.set("swamp", 32);
  DeckOfEveryCard$$$_deck_cheat_cards.set("mountain", 33);
  DeckOfEveryCard$$$_deck_cheat_cards.set("forest", 34);
  DeckOfEveryCard$$$_deck_cheat_cards.set("island", 35);
  DeckOfEveryCard$$$_deck_cheat_cards.set("healing salve", 36);
  DeckOfEveryCard$$$_deck_cheat_cards.set("dark ritual", 37);
  DeckOfEveryCard$$$_deck_cheat_cards.set("lightning bolt", 38);
  DeckOfEveryCard$$$_deck_cheat_cards.set("giant growth", 39);
  DeckOfEveryCard$$$_deck_cheat_cards.set("ancestral recall", 40);

  DeckOfEveryCard$$$_deck_cheat_cards.set("gift card", 41);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of papayas", 42);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of salads", 43);
  DeckOfEveryCard$$$_deck_cheat_cards.set("ix - the hermit", 44);
  DeckOfEveryCard$$$_deck_cheat_cards.set("iv - the emperor", 45);
  DeckOfEveryCard$$$_deck_cheat_cards.set("green card", 46);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xvi - the tower", 47);
  DeckOfEveryCard$$$_deck_cheat_cards.set("the race card", 48);
  DeckOfEveryCard$$$_deck_cheat_cards.set("0 - the fool", 49);
  DeckOfEveryCard$$$_deck_cheat_cards.set("I - the magician", 50);

  DeckOfEveryCard$$$_deck_cheat_cards.set("xi - strength", 51);
  DeckOfEveryCard$$$_deck_cheat_cards.set("lead pipe", 52);
  DeckOfEveryCard$$$_deck_cheat_cards.set("rope", 53);
  DeckOfEveryCard$$$_deck_cheat_cards.set("wrench", 54);
  DeckOfEveryCard$$$_deck_cheat_cards.set("candlestick", 55);
  DeckOfEveryCard$$$_deck_cheat_cards.set("knife", 56);
  DeckOfEveryCard$$$_deck_cheat_cards.set("revolver", 57);
  DeckOfEveryCard$$$_deck_cheat_cards.set("1952 mickey mantle", 58);
  DeckOfEveryCard$$$_deck_cheat_cards.set("spare tire", 59);
  DeckOfEveryCard$$$_deck_cheat_cards.set("extra tank", 60);

  DeckOfEveryCard$$$_deck_cheat_cards.set("sheep", 61);
  DeckOfEveryCard$$$_deck_cheat_cards.set("year of plenty", 62);
  DeckOfEveryCard$$$_deck_cheat_cards.set("mine", 63);
  DeckOfEveryCard$$$_deck_cheat_cards.set("laboratory", 64);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x of kumquats", 65);
  DeckOfEveryCard$$$_deck_cheat_cards.set("professor plum", 66);
  DeckOfEveryCard$$$_deck_cheat_cards.set("x - the wheel of fortune", 67);
  DeckOfEveryCard$$$_deck_cheat_cards.set("xxi - the world", 68);
  DeckOfEveryCard$$$_deck_cheat_cards.set("vi - the lovers", 69);
  DeckOfEveryCard$$$_deck_cheat_cards.set("iii - the empress", 70);

  DeckOfEveryCard$$$_deck_cheat_cards.set("pvp", 1);
  DeckOfEveryCard$$$_deck_cheat_cards.set("fites", 1);
  DeckOfEveryCard$$$_deck_cheat_cards.set("spade", 4);
  DeckOfEveryCard$$$_deck_cheat_cards.set("white mana", 31);
  DeckOfEveryCard$$$_deck_cheat_cards.set("black mana", 32);
  DeckOfEveryCard$$$_deck_cheat_cards.set("red mana", 33);
  DeckOfEveryCard$$$_deck_cheat_cards.set("green mana", 34);
  DeckOfEveryCard$$$_deck_cheat_cards.set("blue mana", 35);
  DeckOfEveryCard$$$_deck_cheat_cards.set("key", 47);
  DeckOfEveryCard$$$_deck_cheat_cards.set("tower", 47);
  DeckOfEveryCard$$$_deck_cheat_cards.set("init", 48);
  DeckOfEveryCard$$$_deck_cheat_cards.set("moxie buff", 49);
  DeckOfEveryCard$$$_deck_cheat_cards.set("myst buff", 50);
  DeckOfEveryCard$$$_deck_cheat_cards.set("mysticality buff", 50);
  DeckOfEveryCard$$$_deck_cheat_cards.set("meat", 58);
  DeckOfEveryCard$$$_deck_cheat_cards.set("muscle buff", 51);
  DeckOfEveryCard$$$_deck_cheat_cards.set("stone wool", 61);
  DeckOfEveryCard$$$_deck_cheat_cards.set("ore", 63);
  DeckOfEveryCard$$$_deck_cheat_cards.set("items", 67);
  DeckOfEveryCard$$$_deck_cheat_cards.set("muscle stat", 68);
  DeckOfEveryCard$$$_deck_cheat_cards.set("moxie stat", 69);
  DeckOfEveryCard$$$_deck_cheat_cards.set("myst stat", 70);
  DeckOfEveryCard$$$_deck_cheat_cards.set("mysticality stat", 70);

  const card: number = DeckOfEveryCard$$$_deck_cheat_cards.get(cheat) ?? 0;

  const cheated: Map<number, string> = new Map(
    splitString(get("_auto_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]),
  );
  for (const [, cheat_1] of cheated) {
    if (toInt(cheat_1) === card) {
      auto_log_warning("Already cheated this card, failing gracefully.", "red");
      return false;
    }
  }

  const deck: Item = wrap_item($item`Deck of Every Card`);
  visitUrl(`inv_use.php?cheat=1&pwd=&whichitem=${toInt(deck)}`);
  // Check that a valid card was selected, otherwise this wastes 5 draws.
  if (card !== 0) {
    visitUrl(`choice.php?pwd=&option=1&whichchoice=1086&which=${card}`, true);
    const page_1: string = visitUrl(
      "choice.php?pwd=&whichchoice=1085&option=1",
      true,
    );
    if (containsText(page_1, "Combat")) {
      // Can we resolve this combat here? Should we?
      // Do we need to accept a combat filter?
    }

    handleTracker({
      what: deck,
      detail: cheat,
      property: "auto_otherstuff",
    });
    // If mafia is not tracking cheats, we can track them here.
    let found: boolean = false;
    const cheated_1: Map<number, string> = new Map(
      splitString(get("_auto_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]),
    );
    for (const [, cheat_1] of cheated_1) {
      if (toInt(cheat_1) === card) {
        found = true;
      }
    }
    if (!found) {
      if (get("_auto_deckCardsCheated") === "") {
        set("_auto_deckCardsCheated", card);
      } else {
        set(
          "_auto_deckCardsCheated",
          `${get("_auto_deckCardsCheated")},${card}`,
        );
      }
    }
    return true;
  }
  return false;
}

export function DeckOfEveryCard$$deck_useScheme(action: string): boolean {
  if (!DeckOfEveryCard$$deck_available()) {
    return false;
  }
  if (DeckOfEveryCard$$deck_draws_left() < 15) {
    return false;
  }
  if (myHp() === 0) {
    return false;
  }

  let cards: string[] = [];

  if (action === "farming") {
    cards = ["Ancestral Recall", "Island", "1952 Mickey Mantle"];
  } else if (action === "turns") {
    cards = ["Ancestral Recall", "Island"];
    if (needOre()) {
      cards = ["Ancestral Recall", "Island", "Mine"];
    }
  } else {
    // First priority is grab a key if we need one.
    const missingHeroKeys: number = 3 - towerKeyCount();
    if (missingHeroKeys > 0) {
      cards.push("key");
    }
    // Next priority is ore, only if we don't have a train set installed
    if (!TrainSet$$auto_haveTrainSet() && needOre()) {
      cards.push("ore");
    }
    // Stats are higher priority early on in LoL where we're never gonna need stone wool day1
    if (in_lol() && myLevel() < 4) {
      const mainstat: string = toLowerCase(myPrimestat().toString());
      cards.push(`${mainstat} stat`);
    }
    // Stone wool
    if (
      cards.length < 3 &&
      internalQuestStatus("questL11Worship") < 2 &&
      itemAmount($item`stone wool`) < 2
    ) {
      cards.push("stone wool");
    }
    // Meat
    if (cards.length < 3 && myMeat() < 10000 && !in_wotsf()) {
      cards.push("1952 Mickey Mantle");
    }
    if (cards.length < 3 && myLevel() < 11) {
      const mainstat: string = toLowerCase(myPrimestat().toString());
      if (!cards.includes(`${mainstat} stat`)) {
        cards.push(`${mainstat} stat`);
      }
    }
  }

  if (cards.length < 3) {
    cards.push("ancestral recall");
  }
  if (cards.length < 3) {
    cards.push("blue mana");
  }

  if (cards.length === 0) {
    return false;
  }

  let count_1: number = 0;
  for (const card of cards) {
    if (
      possessEquipment($item`bass clarinet`) ||
      possessEquipment($item`fish hatchet`) ||
      possessEquipment($item`dented scepter`)
    ) {
      if (
        [
          "Candlestick",
          "Knight",
          "Lead Pipe",
          "Revolver",
          "Rope",
          "Wrench",
        ].includes(card)
      ) {
        continue;
      }
    }

    if (card === "key") {
      if (towerKeyCount() >= 3) {
        continue;
      }
    }
    if (card === "ore") {
      if (!needOre()) {
        continue;
      }
    }
    if (in_theSource() && card === `${myPrimestat()} stat`) {
      continue;
    }
    if (
      in_wotsf() &&
      [
        "Candlestick",
        "Knife",
        "Lead Pipe",
        "Revolver",
        "Rope",
        "Wrench",
      ].includes(card)
    ) {
      continue;
    }
    if (card === "1952 Mickey Mantle" && (myMeat() >= 20000 || in_wotsf())) {
      continue;
    }
    if (count_1 >= 3) {
      break;
    }
    if (DeckOfEveryCard$$deck_cheat(card)) {
      count_1 += 1;
    } else {
      auto_log_error(
        "Could not draw card for some reason, we may be stuck in a choice adventure.",
      );
      auto_abort(
        "Failure when drawing cards, if any were drawn, the rest will NOT be drawn. Draw them and resume.",
      );
    }
  }

  if (action === "" && myMeat() < 10000) {
    auto_autosell(
      min(1, itemAmount($item`1952 Mickey Mantle card`)),
      $item`1952 Mickey Mantle card`,
    );
  }

  if (action === "farming" || action === "turns") {
    let count_2: number = itemAmount($item`blue mana`);
    while (count_2 > 0 && get("_ancestralRecallCasts") < 10) {
      useSkill(1, $skill`Ancestral Recall`);
      count_2 -= 1;
    }
  }

  return true;
}

export function CrownOfEd$$adjustEdHat(goal: string): boolean {
  if (!possessEquipment($item`The Crown of Ed the Undying`)) {
    return false;
  }
  let option: number = -1;
  goal = toLowerCase(goal);
  if ((goal === "muscle" || goal === "bear") && get("edPiece") !== "bear") {
    option = 1;
  } else if (
    (goal === "myst" || goal === "mysticality" || goal === "owl") &&
    get("edPiece") !== "owl"
  ) {
    option = 2;
  } else if (
    (goal === "moxie" || goal === "puma") &&
    get("edPiece") !== "puma"
  ) {
    option = 3;
  } else if (
    (goal === "ml" || goal === "hyena") &&
    get("edPiece") !== "hyena"
  ) {
    option = 4;
  } else if (
    (goal === "meat" ||
      goal === "item" ||
      goal === "items" ||
      goal === "drops" ||
      goal === "mouse") &&
    get("edPiece") !== "mouse"
  ) {
    option = 5;
  } else if (
    (goal === "regen" ||
      goal === "regenerate" ||
      goal === "miss" ||
      goal === "dodge" ||
      goal === "weasel") &&
    get("edPiece") !== "weasel"
  ) {
    option = 6;
  } else if (
    (goal === "breathe" || goal === "underwater" || goal === "fish") &&
    get("edPiece") !== "fish"
  ) {
    option = 7;
  }

  const oldHat: Item = equippedItem($slot`hat`);

  if (option !== -1) {
    if (oldHat !== $item`The Crown of Ed the Undying`) {
      equip($slot`hat`, $item`The Crown of Ed the Undying`);
    }
    visitUrl("inventory.php?action=activateedhat");
    visitUrl(`choice.php?pwd=&whichchoice=1063&option=${option}`, true);
    if (oldHat !== $item`The Crown of Ed the Undying`) {
      equip($slot`hat`, oldHat);
    }
    return true;
  }
  return false;
}

function MachineElf$$resolveSixthDMTDo(): boolean {
  handleFamiliar$1($familiar`Machine Elf`);
  return autoAdv($location`The Deep Machine Tunnels`);
}

const MachineElf$$resolveSixthDMTTask: QuestTask = registerQuestTask({
  name: "resolveSixthDMT",
  completed: () =>
    in_koe() ||
    (!canChangeToFamiliar($familiar`Machine Elf`) && !in_quantumTerrarium()) ||
    $location`The Deep Machine Tunnels`.turnsSpent > 5,
  // In the Deep Machine Tunnels the sixth and every 50th visit after that in a single ascension will be a noncombat. This prepares for it and executes it.
  ready: () =>
    !in_koe() &&
    canChangeToFamiliar($familiar`Machine Elf`) &&
    // need to figure out the exact schedule for 2nd and later occurences then add it here.
    $location`The Deep Machine Tunnels`.turnsSpent === 5,
  do: MachineElf$$resolveSixthDMTDo,
  locations: $location`The Deep Machine Tunnels`,
});

export function MachineElf$$resolveSixthDMT(): boolean {
  return runQuestTask(MachineElf$$resolveSixthDMTTask);
}

export function Doghouse$$doghouseChoiceHandler(choice: number): void {
  if (choice === 1106) {
    // Wooof! Wooooooof! (Ghost Dog)
    if (
      (inHardcore() &&
        haveEffect($effect`Adventurer's Best Friendship`) > 120) ||
      (haveEffect($effect`Adventurer's Best Friendship`) > 30 &&
        pathHasFamiliar())
    ) {
      auto_runChoice(3); // ghost dog chow
    } else {
      auto_runChoice(2); // 30 turns of adventurer's best friendship
    }
  } else if (choice === 1107) {
    // Playing Fetch (Ghost Dog)
    auto_runChoice(1); // get tennis ball
  } else if (choice === 1108) {
    // Your Dog Found Something Again (Ghost Dog)
    auto_runChoice(3); // get other stuff as recommended by ASS
  } else {
    auto_abort("unhandled choice in doghouseChoiceHandler");
  }
}
