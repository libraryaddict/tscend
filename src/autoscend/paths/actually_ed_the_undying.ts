import {
  abort,
  autosell,
  buy,
  ceil,
  cliExecute,
  closetAmount,
  containsText,
  council,
  equippedAmount,
  getProperty,
  haveServant,
  haveSkill,
  hippyStoneBroken,
  itemAmount,
  Location,
  max,
  min,
  mpCost,
  myAdventures,
  myAscensions,
  myDaycount,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  myServant,
  mySessionAdv,
  mySpleenUse,
  myTurncount,
  putCloset,
  removeProperty,
  runChoice,
  Servant,
  setProperty,
  Skill,
  spleenLimit,
  takeCloset,
  toBoolean,
  toInt,
  toLowerCase,
  use,
  useServant,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $element,
  $item,
  $items,
  $location,
  $locations,
  $path,
  $servant,
  $skill,
  $skills,
  $slot,
} from "libram";

import {
  acquireHermitItem,
  auto_buyUpTo,
  pullXWhenHaveY,
} from "../auto_acquire";
import { autoAdv$2, autoAdvBypass$1 } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import { autoChew, spleen_left } from "../auto_consume";
import {
  addToMaximize,
  autoEquip,
  autoEquip$1,
  equipBaseline,
  possessEquipment,
} from "../auto_equipment";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import {
  __cure_bad_stuff,
  doFreeRest,
  haveAnyIotmAlternativeRestSiteAvailable,
} from "../auto_restore";
import {
  auto_autosell,
  auto_change_mcd,
  auto_log_debug,
  auto_log_info,
  auto_log_info$1,
  backupSetting,
  internalQuestStatus,
  ovenHandle,
} from "../auto_util";
import {
  elementalPlanes_access,
  elementalPlanes_takeJob,
} from "../iotms/elementalPlanes";
import { adjustEdHat } from "../iotms/mr2015";
import {
  neverendingPartyAvailable,
  neverendingPartyCombat,
} from "../iotms/mr2018";
import { auto_campawayAvailable } from "../iotms/mr2019";
import {
  auto_remainingSpeakeasyFreeFights,
  speakeasyCombat,
} from "../iotms/mr2022";
import { tootGetMeat } from "../quests/level_01";
import { L2_mosquito } from "../quests/level_02";
import { L3_tavern } from "../quests/level_03";
import { L4_batCave } from "../quests/level_04";
import {
  L5_getEncryptionKey,
  L5_goblinKing,
  L5_haremOutfit,
} from "../quests/level_05";
import { L8_trapperQuest } from "../quests/level_08";
import { L9_chasmBuild } from "../quests/level_09";
import {
  L10_airship,
  L10_basement,
  L10_ground,
  L10_plantThatBean,
  L10_topFloor,
} from "../quests/level_10";
import {
  L11_blackMarket,
  L11_forgedDocuments,
  L11_hiddenCity,
  L11_hiddenCityZones,
  L11_mauriceSpookyraven,
  L11_mcmuffinDiary,
  L11_palindome,
  L11_shenStartQuest,
  L11_talismanOfNam,
  L11_unlockHiddenCity,
  LX_spookyravenManorSecondFloor,
  LX_unlockHauntedBilliardsRoom,
  LX_unlockHauntedLibrary,
  LX_unlockHiddenTemple,
  LX_unlockManorSecondFloor,
} from "../quests/level_11";
import { L12_islandWar } from "../quests/level_12";
import { LX_islandAccess } from "../quests/level_any";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/actually_ed_the_undying.ash
export function isActuallyEd(): boolean {
  return myPath() === $path`Actually Ed the Undying`;
}

function ed_spleen_limit(): number {
  let limit: number = 5;
  for (const sk of $skills`Extra Spleen, Another Extra Spleen, Yet Another Extra Spleen, Still Another Extra Spleen, Just One More Extra Spleen, Okay Seriously\, This is the Last Spleen`) {
    if (haveSkill(sk)) {
      limit += 5;
    }
  }
  return limit;
}

export function ed_initializeSettings(): void {
  if (isActuallyEd()) {
    setProperty("auto_day1_dna", "finished");
    setProperty("auto_getBeehive", false.toString());
    setProperty("auto_getStarKey", false.toString());
    setProperty("auto_grimstoneFancyOilPainting", false.toString());
    setProperty("auto_holeinthesky", false.toString());
    setProperty("auto_lashes", "");
    setProperty("auto_needLegs", false.toString());
    setProperty("auto_renenutet", "");
    setProperty("auto_servantChoice", "");
    setProperty("auto_wandOfNagamar", false.toString());

    setProperty("auto_edSkills", (-1).toString());
    setProperty("auto_chasmBusted", false.toString());
    setProperty("auto_renenutetBought", (0).toString());

    setProperty("auto_edCombatCount", (0).toString());
    setProperty("auto_edCombatRoundCount", (0).toString());

    setProperty("desertExploration", (100).toString());
    setProperty(
      "nsTowerDoorKeysUsed",
      "Boris's key,Jarlsberg's key,Sneaky Pete's key,Richard's star key,skeleton key,digital key",
    );
    setProperty("auto_edServantBugCount", (0).toString());
  }
}

export function ed_initializeSession(): void {
  if (isActuallyEd()) {
    // the following settings will affect combat automation
    // see edUnderworldChoiceHandler() for where and how they are used.
    backupSetting("choiceAdventure1023", "");
    backupSetting("choiceAdventure1024", "");
    backupSetting("edDefeatAbort", "3");
  }
}

export function ed_terminateSession(): void {
  if (isActuallyEd()) {
    // do nothing.
  }
}

export function ed_initializeDay(day: number): void {
  if (!isActuallyEd()) {
    return;
  }

  setProperty("auto_renenutetBought", (0).toString());

  if (!toBoolean(getProperty("breakfastCompleted")) && day !== 1) {
    cliExecute("breakfast");
  }

  if (day === 1) {
    if (toInt(getProperty("auto_day_init")) < 1) {
      if (itemAmount($item`transmission from planet Xi`) > 0) {
        use(1, $item`transmission from planet Xi`);
      }
      if (itemAmount($item`Xiblaxian holo-wrist-puter simcode`) > 0) {
        use(1, $item`Xiblaxian holo-wrist-puter simcode`);
      }
      tootGetMeat();
      equipBaseline();
    }
  } else if (day === 2) {
    equipBaseline();
    ovenHandle();

    if (toInt(getProperty("auto_day_init")) < 2) {
      if (itemAmount($item`gym membership card`) > 0) {
        use(1, $item`gym membership card`);
      }

      if (itemAmount($item`seal tooth`) === 0) {
        acquireHermitItem($item`seal tooth`);
      }
      pullXWhenHaveY($item`Hand in Glove`, 1, 0);
      pullXWhenHaveY($item`blackberry galoshes`, 1, 0);
    }
  }
  // ed overrides normal day initialization
  setProperty("auto_day_init", day.toString());
}

function L13_ed_towerHandler(): boolean {
  if (!isActuallyEd()) {
    return false;
  }

  council(); //Visit prior to checking the quest status to ensure we have correct quest status

  if (
    internalQuestStatus("questL13Final") < 0 ||
    internalQuestStatus("questL13Final") > 11
  ) {
    return false;
  }
  if (itemAmount($item`Thwaitgold scarab beetle statuette`) > 0) {
    council();
    return true;
  }

  if (
    containsText(visitUrl("place.php?whichplace=nstower"), "ns_10_sorcfight")
  ) {
    auto_log_info("We found the jerkwad!! Revenge!!!!!", "blue");

    const page: string = "place.php?whichplace=nstower&action=ns_10_sorcfight";
    autoAdvBypass$1(page, $location`Noob Cave`);

    if (itemAmount($item`Thwaitgold scarab beetle statuette`) > 0) {
      council();
    }
    return true;
  }
  return false;
}

function L13_ed_councilWarehouse(): boolean {
  if (!isActuallyEd()) {
    return false;
  }
  if (internalQuestStatus("questL13Warehouse") !== 0) {
    return false;
  }

  if (itemAmount($item`[7965]Holy MacGuffin`) === 0) {
    autoAdv$2($location`The Secret Council Warehouse`);
  } else {
    //Complete: Should not get here though.
    abort(
      "Tried to adventure in the Council Warehouse after finding theMcMuffin.",
    );
    return false;
  }
  while (
    itemAmount($item`warehouse map page`) > 0 &&
    itemAmount($item`warehouse inventory page`) > 0
  ) {
    use(
      itemAmount($item`warehouse inventory page`),
      $item`warehouse inventory page`,
    );
  }
  if (getProperty("lastEncounter") === "You Found It!") {
    council();
    auto_log_info("McMuffin is found!", "blue");
    auto_log_info(`Ed Combats: ${getProperty("auto_edCombatCount")}`, "blue");
    auto_log_info(
      `Ed Combat Rounds: ${getProperty("auto_edCombatRoundCount")}`,
      "blue",
    );

    cliExecute("refresh quests");
    if (internalQuestStatus("questL13Warehouse") > 0) {
      abort(
        "The holy macguffin has been found. Once you replace it you will have to choose a regular class to switch to and end your hiatus as the Undying Ed. Choose wisely or your face will melt off or something.",
      );
    }
  }
  return true;
}

export function handleServant(who: Servant): boolean {
  if (!isActuallyEd()) {
    return false;
  }
  if (who === Servant.none) {
    //use_servant($servant[none]);
    return false;
  }
  if (!haveServant(who)) {
    if (myServant() === Servant.none) {
      //might have encounted bug in KoL. Try to work around it
      //bug happens when level 7 or great scribe is active when logged out of KoL
      //symptom is active servant is $servant[none] and can't change it
      //priest is always unlocked prior to scribe. Try to switch to priest to clear bug
      //clear error
      cliExecute("/servant priest");
      //refresh mafia's servant info
      visitUrl("place.php?whichplace=edbase&action=edbase_door");
      if (!haveServant(who)) {
        //cleared bug. Must actually not have requested servant
        return false;
      }
    } else {
      return false;
    }
  }
  if (myServant() !== who) {
    return useServant(who);
  }
  return true;
}

function handleServant$1(name: string): boolean {
  if (!isActuallyEd()) {
    return false;
  }
  name = toLowerCase(name);
  if (name === "priest" || name === "ka") {
    return handleServant($servant`Priest`);
  }
  if (name === "maid" || name === "meat") {
    return handleServant($servant`Maid`);
  }
  if (
    name === "belly-dancer" ||
    name === "belly" ||
    name === "dancer" ||
    name === "bellydancer" ||
    name === "pickpocket" ||
    name === "steal"
  ) {
    return handleServant($servant`Belly-Dancer`);
  }
  if (name === "cat" || name === "item" || name === "itemdrop") {
    return handleServant($servant`Cat`);
  }
  if (name === "bodyguard" || name === "block") {
    return handleServant($servant`Bodyguard`);
  }
  if (name === "scribe" || name === "stats" || name === "stat") {
    return handleServant($servant`Scribe`);
  }
  if (name === "assassin" || name === "stagger") {
    return handleServant($servant`Assassin`);
  }
  if (name === "none") {
    return handleServant(Servant.none);
  }
  return false;
}

export function ed_doResting(): boolean {
  if (isActuallyEd()) {
    const maxBuff: number = 675 - myTurncount();
    while (haveAnyIotmAlternativeRestSiteAvailable() && doFreeRest()) {
      buffMaintain$3($effect`Purr of the Feline`, 30, 3, maxBuff);
      buffMaintain$3($effect`Hide of Sobek`, 30, 3, maxBuff);
      buffMaintain$3($effect`Bounty of Renenutet`, 30, 3, maxBuff);
      buffMaintain$3($effect`Prayer of Seshat`, 15, 3, maxBuff);
      buffMaintain$3($effect`Wisdom of Thoth`, 15, 3, maxBuff);
      buffMaintain$3($effect`Power of Heka`, 15, 3, maxBuff);
    }
    return true;
  }
  return false;
}

function ed_buySkills(): boolean {
  if (!isActuallyEd()) {
    return false;
  }
  if (myLevel() <= toInt(getProperty("auto_edSkills"))) {
    return false;
  }
  let possEdPoints: number = 0;

  let page: string = visitUrl("place.php?whichplace=edbase&action=edbase_book");
  const my_skillPoints: AshMatcher = new AshMatcher(
    "You may memorize (\\d+) more page",
    page,
  );
  if (my_skillPoints.find()) {
    let skillPoints: number = toInt(my_skillPoints.group(1));
    auto_log_info$1(`Skill points found: ${skillPoints}`);
    possEdPoints = skillPoints - 1;
    if (
      haveSkill($skill`Bounty of Renenutet`) &&
      haveSkill($skill`Wrath of Ra`) &&
      haveSkill($skill`Curse of Stench`)
    ) {
      skillPoints = 0;
    }
    while (skillPoints > 0) {
      skillPoints = skillPoints - 1;
      let skillid: number = 20;
      if (!haveSkill($skill`Curse of Vacation`)) {
        skillid = 19;
      }
      if (!haveSkill($skill`Curse of Fortune`)) {
        skillid = 18;
      }
      if (!haveSkill($skill`Curse of Heredity`)) {
        skillid = 17;
      }
      if (!haveSkill($skill`Curse of Yuck`)) {
        skillid = 16;
      }
      if (!haveSkill($skill`Curse of Indecision`)) {
        skillid = 15;
      }
      if (!haveSkill($skill`Curse of the Marshmallow`)) {
        skillid = 14;
      }
      if (!haveSkill($skill`Wrath of Ra`)) {
        skillid = 13;
      }
      if (!haveSkill($skill`Bounty of Renenutet`)) {
        skillid = 6;
      }
      if (!haveSkill($skill`Shelter of Shed`)) {
        skillid = 5;
      }
      if (!haveSkill($skill`Blessing of Serqet`)) {
        skillid = 4;
      }
      if (!haveSkill($skill`Hide of Sobek`)) {
        skillid = 3;
      }
      if (!haveSkill($skill`Power of Heka`)) {
        skillid = 2;
      }
      if (!haveSkill($skill`Lash of the Cobra`)) {
        skillid = 12;
      }
      if (!haveSkill($skill`Purr of the Feline`)) {
        skillid = 11;
      }
      if (!haveSkill($skill`Storm of the Scarab`)) {
        skillid = 10;
      }
      if (!haveSkill($skill`Roar of the Lion`)) {
        skillid = 9;
      }
      if (!haveSkill($skill`Howl of the Jackal`)) {
        skillid = 8;
      }
      if (!haveSkill($skill`Wisdom of Thoth`)) {
        skillid = 1;
      }
      if (!haveSkill($skill`Fist of the Mummy`)) {
        skillid = 7;
      }
      if (!haveSkill($skill`Prayer of Seshat`)) {
        skillid = 0;
      }

      visitUrl(`choice.php?pwd&skillid=${skillid}&option=1&whichchoice=1051`);
    }
  }

  page = visitUrl("place.php?whichplace=edbase&action=edbase_door");
  const my_imbuePoints: AshMatcher = new AshMatcher(
    "Impart Wisdom unto Current Servant ..100xp, (\\d+) remain.",
    page,
  );
  let imbuePoints: number = 0;
  if (my_imbuePoints.find()) {
    imbuePoints = toInt(my_imbuePoints.group(1));
    auto_log_info$1(`Imbuement points found: ${imbuePoints}`);
  }
  possEdPoints += imbuePoints;

  if (possEdPoints > toInt(getProperty("edPoints"))) {
    setProperty("edPoints", possEdPoints.toString());
  }

  page = visitUrl("place.php?whichplace=edbase&action=edbase_door");
  const my_servantPoints: AshMatcher = new AshMatcher(
    "You may release (\\d+) more servant",
    page,
  );
  if (my_servantPoints.find()) {
    let servantPoints: number = toInt(my_servantPoints.group(1));
    auto_log_info$1(`Servants points found: ${servantPoints}`);
    while (servantPoints > 0) {
      servantPoints -= 1;
      let sid: number = -1;
      if (!haveServant($servant`Assassin`)) {
        sid = 7;
      }
      if (!haveServant($servant`Bodyguard`)) {
        sid = 4;
      }
      if (!haveServant($servant`Belly-Dancer`)) {
        sid = 2;
      }
      if (!haveServant($servant`Scribe`)) {
        sid = 5;
      }
      if (!haveServant($servant`Maid`)) {
        sid = 3;
        if (
          myLevel() >= 9 &&
          imbuePoints > 4 &&
          !haveServant($servant`Scribe`)
        ) {
          //If we are at the third servant and have enough imbues, get the Scribe instead.
          sid = 5;
        }
      }
      if (!haveServant($servant`Cat`)) {
        sid = 1;
      }
      if (!haveServant($servant`Priest`)) {
        sid = 6;
      }
      if (sid !== -1) {
        visitUrl(`choice.php?whichchoice=1053&option=3&pwd&sid=${sid}`);
      }
    }
  }

  if (imbuePoints > 0 && myLevel() >= 3) {
    visitUrl("charsheet.php");

    const current: Servant = myServant();
    while (imbuePoints > 0) {
      let tryImbue: Servant = Servant.none;
      if (haveServant($servant`Priest`) && $servant`Priest`.experience < 81) {
        tryImbue = $servant`Priest`;
      } else if (haveServant($servant`Cat`) && $servant`Cat`.experience < 199) {
        tryImbue = $servant`Cat`;
      } else if (
        haveServant($servant`Maid`) &&
        $servant`Maid`.experience < 199
      ) {
        tryImbue = $servant`Maid`;
      } else if (
        haveServant($servant`Belly-Dancer`) &&
        $servant`Belly-Dancer`.experience < 341
      ) {
        tryImbue = $servant`Belly-Dancer`;
      } else if (
        haveServant($servant`Scribe`) &&
        $servant`Scribe`.experience < 99
      ) {
        tryImbue = $servant`Scribe`;
      } else if (
        haveServant($servant`Maid`) &&
        $servant`Maid`.experience < 441 &&
        myLevel() >= 12
      ) {
        tryImbue = $servant`Maid`;
      } else if (
        haveServant($servant`Cat`) &&
        $servant`Cat`.experience < 441 &&
        myLevel() >= 12
      ) {
        tryImbue = $servant`Cat`;
      } else if (
        haveServant($servant`Scribe`) &&
        $servant`Scribe`.experience < 441 &&
        myLevel() >= 12
      ) {
        tryImbue = $servant`Scribe`;
      } else {
        if (myLevel() >= 9 && myLevel() <= 12) {
          // got scribe early. Imbue to level 21 for passive stat gain
          if (
            haveServant($servant`Scribe`) &&
            $servant`Scribe`.experience < 441
          ) {
            tryImbue = $servant`Scribe`;
          }
        }
      }

      if (tryImbue !== Servant.none) {
        if (handleServant(tryImbue)) {
          auto_log_info(
            `Trying to imbue ${tryImbue} with glorious wisdom!!`,
            "green",
          );
          visitUrl("choice.php?whichchoice=1053&option=5&pwd=");
        }
      }
      imbuePoints = imbuePoints - 1;
    }
    handleServant(current);
  }

  setProperty("auto_edSkills", myLevel().toString());
  return true;
}

export function ed_eatStuff(): boolean {
  if (!isActuallyEd()) {
    return false;
  }
  // fill up on Mummified Beef Haunches as they are Ed's main source of turn-gen
  const canEat_1: number = min(
    spleen_left() / 5,
    itemAmount($item`mummified beef haunch`),
  );
  if (canEat_1 > 0 && autoChew(canEat_1, $item`mummified beef haunch`)) {
    return true;
  }
  return false;
}

function ed_nextUpgrade(): Skill {
  const coins: number = itemAmount($item`Ka coin`);
  const canEat_1: number = (spleenLimit() - mySpleenUse()) / 5;

  if (
    !haveSkill($skill`Upgraded Legs`) &&
    toBoolean(getProperty("auto_needLegs"))
  ) {
    return $skill`Upgraded Legs`; // 10 Ka
  } else if (!haveSkill($skill`Extra Spleen`) && canEat_1 < 1) {
    return $skill`Extra Spleen`; // 5 Ka
  } else if (!haveSkill($skill`Another Extra Spleen`) && canEat_1 < 1) {
    return $skill`Another Extra Spleen`; // 10 Ka
  } else if (!haveSkill($skill`Replacement Liver`)) {
    return $skill`Replacement Liver`; // 30 Ka
  } else if (!haveSkill($skill`Upgraded Legs`)) {
    return $skill`Upgraded Legs`; // 10 Ka
  } else if (!haveSkill($skill`More Legs`)) {
    return $skill`More Legs`; // 20 Ka
  } else if (
    !haveSkill($skill`Yet Another Extra Spleen`) &&
    haveSkill($skill`Another Extra Spleen`)
  ) {
    return $skill`Yet Another Extra Spleen`; // 15 Ka
  } else if (!haveSkill($skill`Still Another Extra Spleen`)) {
    return $skill`Still Another Extra Spleen`; // 20 Ka
  } else if (!haveSkill($skill`Just One More Extra Spleen`)) {
    return $skill`Just One More Extra Spleen`; // 25 Ka
  } else if (!haveSkill($skill`Replacement Stomach`)) {
    return $skill`Replacement Stomach`; // 30 Ka
  } else if (!haveSkill($skill`Elemental Wards`)) {
    return $skill`Elemental Wards`; // 10 Ka
  } else if (!haveSkill($skill`Okay Seriously\, This is the Last Spleen`)) {
    return $skill`Okay Seriously\, This is the Last Spleen`; // 30 Ka
  } else if (
    !possessEquipment($item`The Crown of Ed the Undying`) &&
    !haveSkill($skill`Tougher Skin`)
  ) {
    return $skill`Tougher Skin`; // 10 Ka
  } else if (!haveSkill($skill`More Elemental Wards`)) {
    return $skill`More Elemental Wards`; // 20 Ka
  } else if (!haveSkill($skill`Even More Elemental Wards`)) {
    return $skill`Even More Elemental Wards`; // 30 Ka
  } else if (!haveSkill($skill`Healing Scarabs`) && myDaycount() >= 2) {
    return $skill`Healing Scarabs`; // 10 Ka
  } else if (
    !haveSkill($skill`Tougher Skin`) &&
    myDaycount() >= 2 &&
    coins >= 50
  ) {
    return $skill`Tougher Skin`; // 10 Ka
  } else if (
    !haveSkill($skill`Armor Plating`) &&
    myDaycount() >= 2 &&
    coins >= 50
  ) {
    return $skill`Armor Plating`; // 10 Ka
  } else if (
    !haveSkill($skill`Upgraded Spine`) &&
    myDaycount() >= 2 &&
    coins >= 50
  ) {
    return $skill`Upgraded Spine`; // 20 Ka
  } else if (
    !haveSkill($skill`Upgraded Arms`) &&
    myDaycount() >= 2 &&
    coins >= 50
  ) {
    return $skill`Upgraded Arms`; // 20 Ka
  } else if (
    !haveSkill($skill`Arm Blade`) &&
    myDaycount() >= 4 &&
    coins >= 100
  ) {
    return $skill`Arm Blade`; // 20 Ka
  } else if (
    !haveSkill($skill`Bone Spikes`) &&
    myDaycount() >= 4 &&
    coins >= 100
  ) {
    return $skill`Bone Spikes`; // 20 Ka
  }
  return Skill.none;
}

let $_ed_KaCost_kaNeeded: Map<Skill, number> | undefined;

function ed_KaCost(upgrade: Skill): number {
  $_ed_KaCost_kaNeeded ??= new Map([
    [$skill`Extra Spleen`, 5],
    [$skill`Another Extra Spleen`, 10],
    [$skill`Upgraded Legs`, 10],
    [$skill`Tougher Skin`, 10],
    [$skill`Armor Plating`, 10],
    [$skill`Healing Scarabs`, 10],
    [$skill`Elemental Wards`, 10],
    [$skill`Yet Another Extra Spleen`, 15],
    [$skill`Still Another Extra Spleen`, 20],
    [$skill`More Legs`, 20],
    [$skill`Upgraded Arms`, 20],
    [$skill`Upgraded Spine`, 20],
    [$skill`Bone Spikes`, 20],
    [$skill`Arm Blade`, 20],
    [$skill`More Elemental Wards`, 20],
    [$skill`Just One More Extra Spleen`, 25],
    [$skill`Replacement Stomach`, 30],
    [$skill`Replacement Liver`, 30],
    [$skill`Okay Seriously\, This is the Last Spleen`, 30],
    [$skill`Even More Elemental Wards`, 30],
  ]);
  if ($_ed_KaCost_kaNeeded.has(upgrade)) {
    return (
      $_ed_KaCost_kaNeeded.get(upgrade) ??
      $_ed_KaCost_kaNeeded.set(upgrade, 0).get(upgrade)
    );
  } else {
    return -1;
  }
}

export function ed_needShop(): boolean {
  if (!isActuallyEd()) {
    return false;
  }

  if (
    haveSkill($skill`Upgraded Legs`) &&
    toBoolean(getProperty("auto_needLegs"))
  ) {
    setProperty("auto_needLegs", false.toString());
  }

  const coins: number = itemAmount($item`Ka coin`);

  if (
    toBoolean(getProperty("auto_needLegs")) &&
    coins >= ed_KaCost($skill`Upgraded Legs`)
  ) {
    auto_log_info$1(
      "Ed needs legs (and can afford them)! UNDYING for a free trip to the Underworld!",
    );
    return true;
  }
  // check if we need mummified beef haunches
  let canEat_1: number = (spleenLimit() - mySpleenUse()) / 5;
  canEat_1 = max(0, canEat_1 - itemAmount($item`mummified beef haunch`));
  if (canEat_1 > 0 && coins >= 15) {
    auto_log_info$1(
      "Ed needs beef haunches (and can afford them)! UNDYING for a free trip to the Underworld!",
    );
    return true;
  }
  // check if we need emergency MP
  if (coins >= 1 && myMp() < mpCost($skill`Storm of the Scarab`)) {
    if (
      itemAmount($item`holy spring water`) < 1 &&
      itemAmount($item`spirit beer`) < 1 &&
      itemAmount($item`sacramental wine`) < 1
    ) {
      auto_log_info$1(
        "Ed needs MP restores! UNDYING for a free trip to the Underworld!",
      );
      return true;
    }
  }
  // check if we have skills or consumables to buy
  const nextUpgrade: Skill = ed_nextUpgrade();
  const requiredKa: number = ed_KaCost(nextUpgrade);
  if (canEat_1 < 1 && requiredKa !== -1 && coins >= requiredKa) {
    auto_log_info$1(
      `Ed needs ${nextUpgrade.toString()} (and can afford it)! UNDYING for a free trip to the Underworld!`,
    );
    return true;
  } else if (
    haveSkill($skill`Okay Seriously\, This is the Last Spleen`) &&
    canEat_1 < 1
  ) {
    if (
      itemAmount($item`talisman of Renenutet`) < 1 &&
      toInt(getProperty("auto_renenutetBought")) < 7 &&
      coins >= 7 - toInt(getProperty("auto_renenutetBought"))
    ) {
      auto_log_info$1(
        "Ed needs Talismens of Renenutet! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (itemAmount($item`linen bandages`) < 1 && coins >= 4) {
      auto_log_info$1(
        "Ed needs Linen Bandages! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (
      itemAmount($item`holy spring water`) < 1 &&
      coins >= 1 &&
      myMaxmp() - myMp() > 50
    ) {
      auto_log_info$1(
        "Ed needs Holy Spring Water! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (itemAmount($item`talisman of Horus`) < 1 && coins >= 5) {
      auto_log_info$1(
        "Ed needs Talismens of Horus! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (itemAmount($item`spirit beer`) < 1 && coins >= 30) {
      auto_log_info$1(
        "Ed needs Spirit Beer! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (
      itemAmount($item`soft green echo eyedrop antidote`) +
        itemAmount($item`ancient cure-all`) <
        1 &&
      coins >= 30
    ) {
      auto_log_info$1(
        "Ed needs Ancient Cure-All! UNDYING for a free trip to the Underworld!",
      );
      return true;
    } else if (itemAmount($item`sacramental wine`) < 1 && coins >= 30) {
      auto_log_info$1(
        "Ed needs Sacramental Wine! UNDYING for a free trip to the Underworld!",
      );
      return true;
    }
  }

  return false;
}

function ed_shopping(): boolean {
  let $_ed_skillID_skillIDs: Map<Skill, number> | undefined;

  function ed_skillID(upgrade: Skill): number {
    $_ed_skillID_skillIDs ??= new Map([
      [$skill`Replacement Stomach`, 28],
      [$skill`Replacement Liver`, 29],
      [$skill`Extra Spleen`, 30],
      [$skill`Another Extra Spleen`, 31],
      [$skill`Yet Another Extra Spleen`, 32],
      [$skill`Still Another Extra Spleen`, 33],
      [$skill`Just One More Extra Spleen`, 34],
      [$skill`Okay Seriously\, This is the Last Spleen`, 35],
      [$skill`Upgraded Legs`, 36],
      [$skill`Upgraded Arms`, 37],
      [$skill`Upgraded Spine`, 38],
      [$skill`Tougher Skin`, 39],
      [$skill`Armor Plating`, 40],
      [$skill`Bone Spikes`, 41],
      [$skill`Arm Blade`, 42],
      [$skill`Healing Scarabs`, 43],
      [$skill`Elemental Wards`, 44],
      [$skill`More Elemental Wards`, 45],
      [$skill`Even More Elemental Wards`, 46],
      [$skill`More Legs`, 48],
    ]);
    if ($_ed_skillID_skillIDs.has(upgrade)) {
      return (
        $_ed_skillID_skillIDs.get(upgrade) ??
        $_ed_skillID_skillIDs.set(upgrade, 0).get(upgrade)
      );
    } else {
      return -1;
    }
  }

  auto_log_info("Time to shop!", "red");

  if (toBoolean(getProperty("auto_pvpEnable")) && !hippyStoneBroken()) {
    visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
    visitUrl("place.php?whichplace=edunder&action=edunder_hippy");
    visitUrl("choice.php?pwd&whichchoice=1057&option=1", true);
  }

  let coins: number = itemAmount($item`Ka coin`);
  //Handler for low-powered accounts
  if (
    !haveSkill($skill`Upgraded Legs`) &&
    toBoolean(getProperty("auto_needLegs"))
  ) {
    if (coins >= 10) {
      auto_log_info("Buying Upgraded Legs", "green");
      setProperty("auto_needLegs", false.toString());
      visitUrl("place.php?whichplace=edunder&action=edunder_bodyshop");
      visitUrl("choice.php?pwd&skillid=36&option=1&whichchoice=1052", true);
      visitUrl("choice.php?pwd&option=2&whichchoice=1052", true);
      coins -= 10;
    } else {
      //Prevent other purchases from interrupting us.
      coins = 0;
    }
  }
  // fill spleen with mummified beef haunches.
  let canEat_1: number = (ed_spleen_limit() - mySpleenUse()) / 5;
  canEat_1 -= itemAmount($item`mummified beef haunch`);
  while (coins >= 15 && canEat_1 > 0) {
    visitUrl(
      "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=428",
      true,
    );
    auto_log_info("Buying a mummified beef haunch!", "green");
    coins -= 15;
    canEat_1--;
  }
  // buy emergency MP restores.
  if (
    !toBoolean(getProperty("lovebugsUnlocked")) &&
    coins >= 1 &&
    itemAmount($item`holy spring water`) === 0 &&
    myMp() < mpCost($skill`Storm of the Scarab`)
  ) {
    auto_log_info("Buying Holy Spring Water", "green");
    visitUrl(
      "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=436",
      true,
    );
    coins -= 1;
  }
  // buy skills
  if (canEat_1 < 1) {
    const nextUpgrade: Skill = ed_nextUpgrade();
    const requiredKa: number = ed_KaCost(nextUpgrade);
    if (requiredKa !== -1 && coins >= requiredKa) {
      auto_log_info(
        `Buying ${nextUpgrade.toString()} (${requiredKa.toString()} Ka).`,
        "green",
      );
      const skillBuy: number = ed_skillID(nextUpgrade);
      if (skillBuy !== 0) {
        visitUrl("place.php?whichplace=edunder&action=edunder_bodyshop");
        visitUrl(
          `choice.php?pwd&skillid=${skillBuy}&option=1&whichchoice=1052`,
          true,
        );
        visitUrl("choice.php?pwd&option=2&whichchoice=1052", true);
        coins -= requiredKa;
      }
    } else if (
      haveSkill($skill`Okay Seriously\, This is the Last Spleen`) &&
      canEat_1 < 1
    ) {
      while (
        itemAmount($item`talisman of Renenutet`) < 7 &&
        toInt(getProperty("auto_renenutetBought")) < 7 &&
        coins >= 1
      ) {
        auto_log_info("Buying Talisman of Renenutet", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=439",
          true,
        );
        setProperty(
          "auto_renenutetBought",
          (1 + toInt(getProperty("auto_renenutetBought"))).toString(),
        );
        coins -= 1;
      }
      while (itemAmount($item`linen bandages`) < 8 && coins >= 1) {
        auto_log_info("Buying Linen Bandages", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=429",
          true,
        );
        coins -= 1;
      }
      if (itemAmount($item`holy spring water`) === 0 && coins >= 1) {
        auto_log_info("Buying Holy Spring Water", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=436",
          true,
        );
        coins -= 1;
      }
      while (itemAmount($item`talisman of Horus`) < 2 && coins >= 5) {
        auto_log_info("Buying Talisman of Horus", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=693",
          true,
        );
        coins -= 5;
      }
      if (itemAmount($item`spirit beer`) === 0 && coins >= 30) {
        auto_log_info("Buying Spirit Beer", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=432",
          true,
        );
        coins -= 2;
      }
      if (
        itemAmount($item`soft green echo eyedrop antidote`) +
          itemAmount($item`ancient cure-all`) <
          2 &&
        coins >= 30
      ) {
        auto_log_info("Buying Ancient Cure-all", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=435",
          true,
        );
        coins -= 3;
      }
      if (itemAmount($item`sacramental wine`) === 0 && coins >= 30) {
        auto_log_info("Buying Sacramental Wine", "green");
        visitUrl(
          "shop.php?pwd=&whichshop=edunder_shopshop&action=buyitem&quantity=1&whichrow=433",
          true,
        );
        coins -= 3;
      }
    }
  }
  return true;
}

export function ed_handleAdventureServant(loc: Location): void {
  if (loc === $location`Noob Cave` || !isActuallyEd()) {
    return;
  }
  // the order servants are unlocked is
  // level 3 - Priest (extra Ka)
  // level 6 - Cat (item drops)
  // level 9 - Scribe (stats)
  // level 12 - Maid (meat drops)
  // Default to the Priest as we need Ka to get upgrades and fill spleen (and other miscellanea)
  let myServant_1: Servant = $servant`Priest`;

  if (
    mySpleenUse() === 35 &&
    haveSkill($skill`Even More Elemental Wards`) &&
    myLevel() < 13 &&
    haveServant($servant`Scribe`)
  ) {
    // Ka is less important when we have a full spleen and all the skills we need
    // so default to getting stats if we're not level 13 yet.
    myServant_1 = $servant`Scribe`;
  } else if (myLevel() > 12) {
    if (
      !haveSkill($skill`Gift of the Maid`) &&
      haveServant($servant`Maid`) &&
      getProperty("sidequestNunsCompleted") === "none"
    ) {
      myServant_1 = $servant`Maid`;
    } else if (
      !haveSkill($skill`Gift of the Cat`) &&
      haveServant($servant`Cat`)
    ) {
      myServant_1 = $servant`Cat`;
    }
  }
  // Initial Ka farming to get Spleen & Legs upgrades.
  if (
    $locations`The Hippy Camp, The Neverending Party, The Secret Government Laboratory, The SMOOCH Army HQ, VYKEA`.includes(
      loc,
    ) &&
    myDaycount() === 1
  ) {
    myServant_1 = $servant`Priest`;
  }
  // Locations where item drop is required for quest furthering purposes but we don't want to miss out on Ka if needed.
  if (
    $locations`The Goatlet, The eXtreme Slope, The Batrat and Ratbat Burrow, Cobb's Knob Harem, Twin Peak, The Black Forest, The Hidden Bowling Alley, The Copperhead Club, A Mob of Zeppelin Protesters, The Red Zeppelin`.includes(
      loc,
    )
  ) {
    if (mySpleenUse() === 35 && haveSkill($skill`Even More Elemental Wards`)) {
      myServant_1 = $servant`Cat`;
    }
  }
  // Locations where item drop is required for quest furthering purposes and we won't get Ka regardless
  if (
    $locations`The Defiled Nook, Oil Peak, A-Boo Peak, The Haunted Laundry Room, The Haunted Wine Cellar`.includes(
      loc,
    )
  ) {
    myServant_1 = $servant`Cat`;
  }
  // Locations where we won't get Ka and don't need item drop.
  if (
    $locations`The Dark Neck of the Woods, The Dark Heart of the Woods, The Dark Elbow of the Woods, The Defiled Alcove, The Defiled Cranny, The Defiled Niche, The Haunted Kitchen, The Haunted Billiards Room, The Haunted Library, The Haunted Bedroom, The Haunted Ballroom, The Haunted Bathroom, The Haunted Boiler Room`.includes(
      loc,
    )
  ) {
    if (haveServant($servant`Scribe`)) {
      myServant_1 = $servant`Scribe`;
    } else {
      if (haveServant($servant`Cat`)) {
        myServant_1 = $servant`Cat`;
      }
    }
  }
  // Locations where meat drop is required for quest furthering purposes (or just nice to have)
  if (
    $locations`The Themthar Hills, The Filthworm Queen's Chamber`.includes(
      loc,
    ) &&
    haveServant($servant`Maid`)
  ) {
    myServant_1 = $servant`Maid`;
  }
  // Special case for The Penultimate Fantasy Airship as we want to farm some items for quest furthering purposes
  // but it's also an excellent Ka farming zone and we have to spend a bunch of adventures there
  if (loc === $location`The Penultimate Fantasy Airship`) {
    if (
      !possessEquipment($item`Mohawk wig`) ||
      !possessEquipment($item`amulet of extreme plot significance`) ||
      (!possessEquipment($item`titanium assault umbrella`) &&
        !possessEquipment($item`unbreakable umbrella`))
    ) {
      myServant_1 = $servant`Cat`;
    } else if (
      mySpleenUse() === 35 &&
      haveSkill($skill`Even More Elemental Wards`) &&
      myLevel() < 13 &&
      haveServant($servant`Scribe`)
    ) {
      myServant_1 = $servant`Scribe`;
    }
  }

  handleServant(myServant_1);
}

function L1_ed_island(): boolean {
  //reset tracking of Ka farming
  removeProperty("_auto_farmingKaAsEd");

  if (!elementalPlanes_access($element`spooky`)) {
    return false;
  }

  if (!haveSkill($skill`Roar of the Lion`)) {
    // combat handling only uses this so it's essential
    return false;
  }

  const blocker: Skill = $skill`Still Another Extra Spleen`;

  if (myLevel() >= 10 || (myLevel() >= 8 && haveSkill(blocker))) {
    return false;
  }
  if (
    myLevel() >= 3 &&
    myTurncount() >= 2 &&
    !toBoolean(getProperty("controlPanel9"))
  ) {
    visitUrl(
      "place.php?whichplace=airport_spooky_bunker&action=si_controlpanel",
    );
    visitUrl("choice.php?pwd=&whichchoice=986&option=9", true);
  }
  if (
    myLevel() >= 3 &&
    !toBoolean(getProperty("controlPanel9")) &&
    myTurncount() >= 2
  ) {
    abort("Damn control panel is not set, WTF!!!");
  }
  //If we get some other CI quest, this might keep triggering, should we flag this?
  if (
    myHp() > 20 &&
    !possessEquipment($item`gore bucket`) &&
    !possessEquipment($item`encrypted micro-cassette recorder`) &&
    !possessEquipment($item`military-grade fingernail clippers`)
  ) {
    elementalPlanes_takeJob($element`spooky`);
    setProperty("choiceAdventure988", (2).toString());
  }

  if (itemAmount($item`gore bucket`) > 0) {
    autoEquip$1($item`gore bucket`);
  }

  if (itemAmount($item`Personal Ventilation Unit`) > 0) {
    autoEquip($slot`acc2`, $item`Personal Ventilation Unit`);
  }
  if (
    possessEquipment($item`gore bucket`) &&
    toInt(getProperty("goreCollected")) >= 100
  ) {
    visitUrl("place.php?whichplace=airport_spooky&action=airport2_radio");
    visitUrl("choice.php?pwd&whichchoice=984&option=1", true);
  }

  if (myTurncount() <= 1 && myMeat() > 10000) {
    const need: number = min(4, (myMaxmp() - myMp()) / 10);
    auto_buyUpTo(need, $item`Doc Galaktik's Invigorating Tonic`);
    use(need, $item`Doc Galaktik's Invigorating Tonic`);
    cliExecute("auto_post_adv.js");
  }

  buffMaintain$4($effect`Experimental Effect G-9`);
  //track that we are farming Ka as Ed
  setProperty("_auto_farmingKaAsEd", true.toString());
  autoAdv$2($location`The Secret Government Laboratory`);
  if (itemAmount($item`bottle-opener keycard`) > 0) {
    use(1, $item`bottle-opener keycard`);
  }
  setProperty("choiceAdventure988", (1).toString());
  return true;
}

function L1_ed_islandFallback(): boolean {
  //reset tracking of Ka farming
  removeProperty("_auto_farmingKaAsEd");

  if (elementalPlanes_access($element`spooky`)) {
    return false;
  }

  if (
    myLevel() >= 10 ||
    haveSkill($skill`Okay Seriously\, This is the Last Spleen`)
  ) {
    if (spleen_left() < 5 || myAdventures() > 10) {
      return false;
    }
  }
  //track that we are farming Ka as Ed
  setProperty("_auto_farmingKaAsEd", true.toString());
  if (auto_remainingSpeakeasyFreeFights() > 0) {
    return speakeasyCombat();
  }
  if (neverendingPartyAvailable()) {
    return neverendingPartyCombat();
  }
  if (elementalPlanes_access($element`stench`)) {
    return autoAdv$2($location`Pirates of the Garbage Barges`);
  }
  if (elementalPlanes_access($element`cold`)) {
    return autoAdv$2($location`VYKEA`);
  }
  if (elementalPlanes_access($element`hot`)) {
    //Maybe this is a good choice?
    setProperty("choiceAdventure1094", (5).toString());
    autoAdv$2($location`The SMOOCH Army HQ`);
    setProperty("choiceAdventure1094", (2).toString());
    return true;
  }

  if (
    mySessionAdv() === 0 &&
    myMp() >= mpCost($skill`Wisdom of Thoth`) &&
    haveSkill($skill`Wisdom of Thoth`)
  ) {
    // use our free starting 5 mp to get Wisdom of Thoth to increase our max MP
    // as we'll regen some when adventuring at the shore.
    useSkill(1, $skill`Wisdom of Thoth`);
  }

  if (LX_islandAccess()) {
    return true;
  }
  if (toInt(getProperty("lastIslandUnlock")) !== myAscensions()) {
    //somehow island was not unlocked!
    //if we fail to unlock the island at this stage our run will be crippled. normally this does not occur.
    //but if initialization fails or if user played some turns before running autoscend this can happen.
    if (myMeat() < 1900) {
      abort(
        "Island failed to unlock because you do not have enough meat. This is a critical problem for ed pathing. Have at least 1900 meat then run autoscend again",
      );
    }
    if (myAdventures() <= 9) {
      abort(
        "Island failed to unlock because you do not have enough adventures. This is a critical problem for ed pathing. Have at least 10 adv then run autoscend again",
      );
    }
    abort(
      "Island failed to unlock for an unknown reason. This is a critical problem for ed pathing. Please unlock the island then run autoscend again",
    );
  }

  if (myServant() === $servant`Priest` && myServant().experience < 196) {
    // make sure we have a level 15 Priest if possible
    // so we get the extra Ka from Hippies and Goblins.
    buffMaintain$3($effect`Purr of the Feline`, 10, 1, 10);
  }

  if (haveSkill($skill`Upgraded Legs`) || itemAmount($item`Ka coin`) >= 10) {
    auto_change_mcd(11);
    const retVal: boolean = autoAdv$2($location`The Hippy Camp`);
    if (itemAmount($item`filthy corduroys`) > 0) {
      if (closetAmount($item`filthy corduroys`) > 0) {
        autosell(itemAmount($item`filthy corduroys`), $item`filthy corduroys`);
      } else {
        putCloset(itemAmount($item`filthy corduroys`), $item`filthy corduroys`);
      }
    }
    // TODO: Malibu Stacey - move all this to a more central location after refactor
    if (
      itemAmount($item`filthy knitted dread sack`) > 1 &&
      equippedAmount($item`filthy knitted dread sack`) === 0
    ) {
      // keep one for starting the war (and general wearing until we have something better)
      auto_autosell(
        itemAmount($item`filthy knitted dread sack`) - 1,
        $item`filthy knitted dread sack`,
      );
    } else if (
      itemAmount($item`filthy knitted dread sack`) > 0 &&
      equippedAmount($item`filthy knitted dread sack`) === 1
    ) {
      // have one equipped, just sell any others.
      auto_autosell(
        itemAmount($item`filthy knitted dread sack`),
        $item`filthy knitted dread sack`,
      );
    }

    if (
      itemAmount($item`hemp string`) > 1 &&
      equippedAmount($item`hemp string`) === 0
    ) {
      // keep one for the Bonerdagon necklace.
      auto_autosell(itemAmount($item`hemp string`) - 1, $item`hemp string`);
    } else if (
      itemAmount($item`hemp string`) > 0 &&
      equippedAmount($item`hemp string`) === 1
    ) {
      // have one equipped, just sell any others.
      auto_autosell(itemAmount($item`hemp string`), $item`hemp string`);
    }
    // autosell some other useless stuff as we can use the meat to buy MP from doc galaktik.
    // Ed doesn't need any of this stuff as he starts with the Staff of Ed and can use it until the level 11 quest
    for (const it of $items`hippy bongo, filthy pestle, double-barreled sling`) {
      auto_autosell(itemAmount(it), it);
    }

    return retVal;
  }
  setProperty("auto_needLegs", true.toString());
  addToMaximize("-10ml");
  auto_change_mcd(0);
  return autoAdv$2($location`The Outskirts of Cobb's Knob`);
}

export function L9_ed_chasmStart(): boolean {
  if (internalQuestStatus("questL09Topping") < 0) {
    return false;
  }

  if (isActuallyEd() && !toBoolean(getProperty("auto_chasmBusted"))) {
    auto_log_info("It's a troll on a bridge!!!!", "blue");

    const page: string = visitUrl(
      "place.php?whichplace=orc_chasm&action=bridge_done",
    );
    autoAdvBypass$1(
      "place.php?whichplace=orc_chasm&action=bridge_done",
      $location`The Smut Orc Logging Camp`,
    );

    setProperty("auto_chasmBusted", true.toString());
    return true;
  }
  return false;
}

export function ed_DelayNC_DailyDungeon(): boolean {
  //Ed will be doing daily dungeon if auto_forceFatLootToken == true
  //return true if we should delay daily dungeon as Ed because we cannot handle the NCs
  if (!isActuallyEd()) {
    return false;
  }

  const has_pole: boolean = itemAmount($item`eleven-foot pole`) > 0;
  const has_picks: boolean =
    itemAmount($item`Platinum Yendorian Express Card`) > 0 ||
    itemAmount($item`Pick-O-Matic lockpicks`) > 0;
  if (has_pole && has_picks) {
    return false; //will not take any damage from NCs.
  }

  return itemAmount($item`linen bandages`) === 0;
}

function ed_DelayNC(potential_dmg: number): boolean {
  //return true if we should delay NC as ed because it might kill us and cause us to waste an adv on restoring
  if (!isActuallyEd()) {
    return false;
  }
  if (myHp() > potential_dmg) {
    return false; //not enough dmg to kill us
  }
  if (isAboutToPowerlevel()) {
    return false; //take the risk if we have nothing left to do.
  }
  //if we have no restorers then return true to delay
  return itemAmount($item`linen bandages`) === 0;
}

export function ed_DelayNC$1(potential_dmg_percent: number): boolean {
  const multi: number = 0.01 * potential_dmg_percent;
  const potential_dmg: number = ceil(multi * myMaxhp());
  return ed_DelayNC(potential_dmg);
}

function edUnderworldAdv(): boolean {
  //This function is used to spend 1 adv "resting" as ed by entering the underworld via the gate at his pyramid, shopping, then leaving.
  //Does not check our current HP to see if it should run. only call it if necessary.
  if (!isActuallyEd()) {
    abort("edUnderworldAdv() should not have been called as not ed.");
  }
  if (myAdventures() === 0) {
    abort(
      "Tried to spend 1 adv as ed visiting the underworld when we have no adv left",
    );
  }
  auto_log_info("Visiting the underworld via the pyramid gate", "blue");
  const initial_turncount: number = myTurncount();

  visitUrl("place.php?whichplace=edbase&action=edbase_portal"); //click on portal in base
  runChoice(1); //Enter the Underworld
  runChoice(1); //Need to click through another window
  ed_shopping(); //Shop while there
  visitUrl("place.php?whichplace=edunder&action=edunder_leave"); //click on portal in underworld
  runChoice(1); //Exit the Underworld

  return myTurncount() === 1 + initial_turncount;
}

export function edAcquireHP(): boolean {
  //Ed only needs 1 HP to adventure. goal = my_maxhp() is exceptionally wasteful for ed as it will burn all his linen bandages and then all his Ka replacing his linen bandages.
  if (!isActuallyEd()) {
    return false;
  }
  if (myHp() > 0) {
    return true; // Ed doesn't need to heal outside of combat unless on 0 hp
  }
  for (const it of $items`linen bandages, cotton bandages, silk bandages`) {
    if (itemAmount(it) > 0) {
      use(1, $item`linen bandages`);
      break;
    }
  }
  if (myHp() === 0) {
    //could not restore via items
    edUnderworldAdv();
  }
  if (myHp() === 0) {
    abort("Ed somehow failed to restore HP and can not continue"); //prevent infinite loop of failing to adventure due to 0 HP.
  }
  return true;
}

export function edAcquireHP$1(goal: number): boolean {
  //function forces Ed to heal to a goal HP. Based on acquireHP function
  const isMax: boolean = goal === myMaxhp();

  __cure_bad_stuff();

  if (isMax) {
    goal = myMaxhp(); //in case max rose after curing the bad stuff
  } else if (goal > myMaxhp()) {
    return false;
  }

  while (
    myHp() < goal &&
    myHp() < myMaxhp() &&
    itemAmount($item`linen bandages`) > 0
  ) {
    use(1, $item`linen bandages`);
  }

  return myHp() >= goal;
}

export function LM_edTheUndying(): boolean {
  if (!isActuallyEd()) {
    return false;
  }

  ed_buySkills();

  if (getProperty("edPiece") !== "hyena") {
    if (elementalPlanes_access($element`spooky`) || myLevel() >= 5) {
      adjustEdHat("ml");
    } else {
      adjustEdHat("myst");
    }
  }

  if (auto_campawayAvailable()) {
    // keep enough firewood on hand to fill stomach and liver with campfire food
    if (
      !possessEquipment($item`whittled tiara`) &&
      itemAmount($item`stick of firewood`) > 14
    ) {
      buy($coinmaster`Your Campfire`, 1, $item`whittled tiara`);
    }
    if (
      !possessEquipment($item`whittled shorts`) &&
      itemAmount($item`stick of firewood`) > 14
    ) {
      buy($coinmaster`Your Campfire`, 1, $item`whittled shorts`);
    }
    if (
      !possessEquipment($item`whittled owl figurine`) &&
      itemAmount($item`stick of firewood`) > 19
    ) {
      buy($coinmaster`Your Campfire`, 1, $item`whittled owl figurine`);
    }
  }

  if (itemAmount($item`seal tooth`) === 0 && myMeat() > 2500) {
    // people with lots of IotMs are too survivable and kill stuff when trying to UNDYING
    // if they have to use Mild Curse.
    acquireHermitItem($item`seal tooth`);
  }

  if (L1_ed_island() || L1_ed_islandFallback()) {
    return true;
  }

  if (L5_getEncryptionKey()) {
    return true;
  }

  if (LX_islandAccess()) {
    return true;
  }

  if (closetAmount($item`filthy corduroys`) > 0) {
    takeCloset(closetAmount($item`filthy corduroys`), $item`filthy corduroys`);
  }

  if (!toBoolean(getProperty("breakfastCompleted"))) {
    cliExecute("breakfast");
  }

  if (itemAmount($item`seal tooth`) === 0) {
    acquireHermitItem($item`seal tooth`);
  }

  if (myLevel() >= 9) {
    if (haveAnyIotmAlternativeRestSiteAvailable() && doFreeRest()) {
      cliExecute("scripts/autoscend/auto_post_adv.js");
      return true;
    }
  }
  // we should open the manor second floor sooner rather than later as starting the level 11 quest
  // ruins our pool skill and having delay burning zones open is nice.
  if (myLevel() < 11) {
    if (
      LX_unlockManorSecondFloor() ||
      LX_unlockHauntedLibrary() ||
      LX_unlockHauntedBilliardsRoom(true)
    ) {
      return true;
    }
  }
  // as we do hippy side, the war is a 2 Ka quest (excluding sidequests but that shouldn't matter)
  if (L12_islandWar()) {
    return true;
  }
  // start the macguffin quest, conveniently the black forest is a 1.4 Ka zone.
  if (
    L11_blackMarket() ||
    L11_forgedDocuments() ||
    L11_mcmuffinDiary() ||
    L11_shenStartQuest()
  ) {
    return true;
  }
  // The hidden city is mostly 2 Ka monsters so do it ASAP.
  if (L11_unlockHiddenCity() || L11_hiddenCityZones() || L11_hiddenCity()) {
    return true;
  }
  // Airship is 1.5 Ka or 1.8 Ka with the construct banished so third highest priorty after the war
  // Castle zones are all 1 Ka so may as well finish it off
  if (
    L10_plantThatBean() ||
    L10_airship() ||
    L10_basement() ||
    L10_ground() ||
    L10_topFloor()
  ) {
    return true;
  }
  // If we didn't get the Spookyraven unlock done before level 11, do it now since airship is done and we want more delay zones open
  if (
    LX_unlockManorSecondFloor() ||
    LX_unlockHauntedLibrary() ||
    LX_unlockHauntedBilliardsRoom(true)
  ) {
    return true;
  }
  // Smut Orcs are 1 Ka so build the bridge.
  if (L9_ed_chasmStart() || L9_chasmBuild()) {
    return true;
  }
  // L8 quest is all 1 Ka zones for Ed (unlikely to survive Ninja Snowmen Assassins so they don't count)
  if (L8_trapperQuest()) {
    return true;
  }
  // Goblins are 1 Ka and the rewards are useful
  if (L5_haremOutfit() || L5_goblinKing()) {
    return true;
  }
  // Bats are 1 Ka and the rewards are useful
  if (L4_batCave()) {
    return true;
  }
  // need to do L2 quest to unlock the L3. 0.83 Ka zone or 1/1.25/1.67 with 1/2/3 banishes
  if (L2_mosquito() || LX_unlockHiddenTemple()) {
    return true;
  }
  // should probably complete the tavern for drinking purposes (and rats are 1 Ka).
  if (L3_tavern()) {
    return true;
  }
  // Copperhead Club & Mob of Zeppelin Protestors are 2 Ka zones (with a banish use) but we want to delay them so we can semi-rare Copperhead
  if (
    LX_spookyravenManorSecondFloor() ||
    L11_mauriceSpookyraven() ||
    L11_talismanOfNam() ||
    L11_palindome()
  ) {
    return true;
  }
  // Crush the jackass adventurer!
  if (L13_ed_towerHandler()) {
    return true;
  }
  // Back to square frigging one, I guess.
  if (L13_ed_councilWarehouse()) {
    return true;
  }
  return false;
}

export function edUnderworldChoiceHandler(choice: number): void {
  auto_log_debug(`edUnderworldChoiceHandler Running choice ${choice}`, "blue");
  if (choice === 1023) {
    // Like a Bat Into Hell
    runChoice(1); // Enter the Underworld
    auto_log_info(
      `Ed died in combat ${toInt(getProperty("_edDefeats"))} time(s)`,
      "blue",
    );
    ed_shopping(); // "free" trip to the Underworld, may as well go shopping!
    visitUrl("place.php?whichplace=edunder&action=edunder_leave");
  } else if (choice === 1024) {
    // Like a Bat out of Hell
    if (
      toInt(getProperty("_edDefeats")) < toInt(getProperty("edDefeatAbort"))
    ) {
      // resurrecting is still free.
      runChoice(1, false); // UNDYING!
    } else {
      // resurrecting will cost Ka
      runChoice(2); // Accept the cold embrace of death (Return to the Pyramid)
      auto_log_info$1("Ed died in combat for reals!");
      setProperty(
        "auto_beatenUpCount",
        (toInt(getProperty("auto_beatenUpCount")) + 1).toString(),
      );
    }
  } else {
    abort("unhandled choice in edUnderworldChoiceHandler");
  }
}
