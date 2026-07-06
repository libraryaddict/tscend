import {
  containsText,
  Familiar,
  getProperty,
  haveOutfit,
  Item,
  itemAmount,
  Monster,
  myAscensions,
  myDaycount,
  myPath,
  Path,
  setProperty,
  toBoolean,
  toInt,
  visitUrl,
} from "kolmafia";
import { pullXWhenHaveY } from "../auto_acquire";
import { possessEquipment } from "../auto_equipment";
import { auto_have_familiar } from "../auto_familiar";
import {
  auto_can_equip,
  auto_is_valid,
  auto_log_info,
  auto_turbo,
  handleTracker$1,
  internalQuestStatus,
  LX_summonMonster,
} from "../auto_util";
import { auto_haveAugustScepter } from "../iotms/mr2023";
import { auto_haveBatWings } from "../iotms/mr2024";
import { L3_tavern } from "../quests/level_03";
import { L5_goblinKing } from "../quests/level_05";
import { L7_crypt } from "../quests/level_07";
import { L8_trapperGroar, needOre } from "../quests/level_08";
import { hedgeTrimmersNeeded } from "../quests/level_09";
import { L11_defeatEd } from "../quests/level_11";
import { needStarKey } from "../quests/level_13";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avant_guard.ash
export function in_avantGuard(): boolean {
  return myPath() === Path.get("Avant Guard");
}

export function ag_initializeSettings(): void {
  if (in_avantGuard()) {
    if (
      !auto_have_familiar(Familiar.get("Burly Bodyguard")) &&
      itemAmount(Item.get("baby bodyguard")) > 0
    ) {
      // Add the familiar to the terrarium since we need it to do anything in this path.
      // No I don't care about that guy who never binds familiars for <reasons>. He can write & maintain his own ascension script.
      visitUrl("inv_familiar.php?pwd=&which=3&whichitem=11631");
    }
    setProperty("auto_skipUnlockGuild", true.toString());
    setProperty("auto_nonAdvLoc", false.toString());
    if (auto_turbo()) {
      setProperty("auto_skipNuns", "true");
    }
  }
}

export function ag_pulls(): void {
  if (in_avantGuard()) {
    if (
      auto_is_valid(Item.get("waffle")) &&
      auto_haveAugustScepter() &&
      !auto_turbo()
    ) {
      //Only want waffles if we can summon them and not going for a 1 day
      pullXWhenHaveY(
        Item.get("waffle"),
        1,
        (myDaycount() - 1) * (3 + (myDaycount() > 1 ? 1 : 0)),
      ); //pull waffles everyday
    }
  }
}

export function ag_bgChat(): void {
  if (!in_avantGuard()) {
    return;
  }

  if (ag_bgToChat() === Monster.none) {
    return;
  }
  // go to page to determine if bodyguard is ready to chat
  const bgChat: string = visitUrl("main.php?talktobg=1", false);
  const title: AshMatcher = new AshMatcher(
    "Chatting with your Burly Bodyguard",
    bgChat,
  );
  if (title.find()) {
    auto_log_info("Trying to chat with your Bodyguard", "blue");
    const mon: Monster = ag_bgToChat();
    const url: string = visitUrl(
      `choice.php?pwd=&whichchoice=1532&option=1&bgid=${mon.id}`,
      true,
    );
    auto_log_info(`Making the next bodyguard a ${mon.toString()}`, "blue");
    handleTracker$1(
      Familiar.get("Burly Bodyguard").toString(),
      mon.toString(),
      "auto_copies",
    );
  }
  return;
}

function ag_bgToChat(): Monster {
  let surgeonGearWanted: number = 0;
  let mon: Monster = Monster.none;

  for (const it of Item.get([
    "bloodied surgical dungarees",
    "half-size scalpel",
    "surgical apron",
    "head mirror",
    "surgical mask",
  ])) {
    if (!possessEquipment(it) && auto_can_equip(it)) {
      surgeonGearWanted += 1;
    }
  }
  if (
    itemAmount(Item.get("wet stunt nut stew")) === 0 &&
    !(internalQuestStatus("questL11Palindome") > 4)
  ) {
    if (itemAmount(Item.get("bird rib")) === 0) {
      mon = Monster.get("whitesnake");
    } else if (itemAmount(Item.get("lion oil")) === 0) {
      mon = Monster.get("white lion");
    }
  } else if (
    needStarKey() &&
    itemAmount(Item.get("star")) < 8 &&
    itemAmount(Item.get("line")) < 7
  ) {
    if (myAscensions() % 2 === 1) {
      mon = Monster.get("Skinflute");
    } else {
      mon = Monster.get("Camel's Toe");
    }
  } else if (needStarKey() && itemAmount(Item.get("star chart")) < 1) {
    mon = Monster.get("Astronomer");
  } else if (
    itemAmount(Item.get("enchanted bean")) === 0 &&
    internalQuestStatus("questL10Garbage") < 2 &&
    !auto_haveBatWings()
  ) {
    mon = Monster.get("beanbat");
  } else if (
    itemAmount(Item.get("molybdenum magnet")) > 0 &&
    getProperty("sidequestJunkyardCompleted") === "none"
  ) {
    if (itemAmount(Item.get("molybdenum hammer")) === 0) {
      mon = Monster.get("batwinged gremlin (tool)");
    }
    if (itemAmount(Item.get("molybdenum crescent wrench")) === 0) {
      mon = Monster.get("erudite gremlin (tool)");
    }
    if (itemAmount(Item.get("molybdenum pliers")) === 0) {
      mon = Monster.get("spider gremlin (tool)");
    }
    if (itemAmount(Item.get("molybdenum screwdriver")) === 0) {
      mon = Monster.get("vegetable gremlin (tool)");
    }
  } else if (
    itemAmount(Item.get("McClusky file (complete)")) === 0 &&
    itemAmount(Item.get("McClusky file (page 5)")) === 0 &&
    toInt(getProperty("hiddenOfficeProgress")) < 6
  ) {
    mon = Monster.get("pygmy witch accountant");
  } else if (
    surgeonGearWanted > 0 &&
    internalQuestStatus("questL11Doctor") < 2
  ) {
    mon = Monster.get("pygmy witch surgeon");
  } else if (needOre()) {
    mon = Monster.get("mountain man");
  } else if (
    itemAmount(Item.get("drum machine")) === 0 &&
    getProperty("questL11Desert") !== "finished"
  ) {
    mon = Monster.get("blur");
  } else if (hedgeTrimmersNeeded() > 0) {
    mon = Monster.get("bearpig topiary animal");
  } else if (
    !possessEquipment(Item.get("unstable fulminate")) &&
    internalQuestStatus("questL11Manor") < 3
  ) {
    if (itemAmount(Item.get("bottle of Chateau de Vinegar")) === 0) {
      mon = Monster.get("possessed wine rack");
    } else if (itemAmount(Item.get("blasting soda")) === 0) {
      mon = Monster.get("cabinet of Dr. Limpieza");
    }
  } else if (
    itemAmount(Item.get("crumbling wooden wheel")) +
      itemAmount(Item.get("tomb ratchet")) <
      10 &&
    !toBoolean(getProperty("pyramidBombUsed"))
  ) {
    mon = Monster.get("tomb rat");
  } else if (
    (!possessEquipment(Item.get("Lord Spookyraven's spectacles")) &&
      internalQuestStatus("questL11Manor") < 2) ||
    (itemAmount(Item.get("disposable instant camera")) === 0 &&
      internalQuestStatus("questL11Palindome") < 1)
  ) {
    mon = Monster.get("animated ornate nightstand");
  } else if (
    !haveOutfit("Knob Goblin Harem Girl Disguise") &&
    getProperty("questL05Goblin") !== "finished"
  ) {
    mon = Monster.get("Knob Goblin Harem Girl");
  } else if (
    itemAmount(Item.get("goat cheese")) < 3 &&
    internalQuestStatus("questL08Trapper") < 2
  ) {
    mon = Monster.get("dairy goat");
  } else if (
    itemAmount(Item.get("bowling ball")) < 5 &&
    internalQuestStatus("hiddenBowlingAlleyProgress") < 5
  ) {
    mon = Monster.get("pygmy bowler");
  } else if (
    internalQuestStatus("questL12War") === 1 &&
    !toBoolean(getProperty("auto_hippyInstead"))
  ) {
    mon = Monster.get("Green Ops Soldier");
  } else if (
    !toBoolean(getProperty("auto_hippyInstead")) &&
    !haveOutfit("frat warrior fatigures") &&
    internalQuestStatus("questL12War") < 1
  ) {
    {
      mon = Monster.get("War Frat 151st Infantryman");
    }
  } else if (
    toBoolean(getProperty("auto_hippyInstead")) &&
    !haveOutfit("war hippy fatigues") &&
    internalQuestStatus("questL12War") < 1
  ) {
    {
      mon = Monster.get("War Hippy Airborne Commander");
    }
  }

  return mon;
}

export function LM_avantGuard(): boolean {
  if (!in_avantGuard()) {
    return false;
  }

  if (
    LX_summonMonster() ||
    L3_tavern() ||
    L5_goblinKing() ||
    L7_crypt() ||
    L8_trapperGroar() ||
    L11_defeatEd()
  ) {
    // functions which spend adventures in non-adv.php locations.
    // Do these with high priority so we get the cubeling drops in HC and/or farm consumables with CBB/Mini Kiwi
    // these require auto_nonAdvLoc to be set appropriately before adventuring.
    // TODO: separate out Bonerdagon handling from L7_crypt()
    return true;
  }

  return false;
}

export function ag_is_bodyguard(): boolean {
  if (containsText(getProperty("lastEncounter"), "bodyguard to")) {
    return true;
  }

  return false;
}
