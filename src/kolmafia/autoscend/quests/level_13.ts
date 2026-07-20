import {
  abort,
  availableAmount,
  availableChoiceOptions,
  buy,
  canEquip,
  canInteract,
  ceil,
  cliExecute,
  containsText,
  council,
  creatableAmount,
  create,
  Element,
  equip,
  equippedItem,
  Familiar,
  getProperty,
  gnomadsAvailable,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  haveSkill,
  inHardcore,
  Item,
  itemAmount,
  lastChoice,
  lastMonster,
  Location,
  max,
  meatDropModifier,
  min,
  Modifier,
  myAscensions,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myHp,
  myMaxhp,
  myMeat,
  myPrimestat,
  numericModifier,
  propertyExists,
  pullsRemaining,
  removeProperty,
  retrieveItem,
  runChoice,
  setProperty,
  Skill,
  Stat,
  toBoolean,
  toElement,
  toFamiliar,
  toInt,
  toLowerCase,
  toStat,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
  $coinmaster,
  $effect,
  $element,
  $elements,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $skills,
  $slot,
  $slots,
  $stat,
  have,
} from "libram";

import {
  acquireOrPull,
  auto_buyUpTo,
  canPull,
  pullXWhenHaveY,
} from "../auto_acquire";
import { autoAdv, autoAdvBypass$1, autoLuckyAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import {
  addToMaximize,
  autoEquip,
  autoEquipToSlot,
  autoForceEquip,
  autoForceEquip$3,
  equipBaseline,
  equipMaximizedGear,
  possessEquipment,
  resetMaximize,
} from "../auto_equipment";
import {
  auto_have_familiar,
  canChangeFamiliar,
  handleFamiliar,
  handleFamiliar$1,
  isAttackFamiliar,
  lookupFamiliarDatafile,
  preAdvUpdateFamiliar,
} from "../auto_familiar";
import {
  provideInitiative$2,
  provideMeat$1,
  provideResistances$4,
  provideStats$2,
} from "../auto_providers";
import { acquireFullHP, acquireMP, uneffect } from "../auto_restore";
import {
  auto_can_equip,
  auto_equalizeStats,
  auto_getListOfNonDamagingFamiliarEquipment,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$3,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  auto_turbo,
  auto_wishForEffect,
  auto_wishForEffectIfNeeded,
  autoMaximize$1,
  canSummonMonster,
  cloverUsageFinish,
  cloverUsageInit$1,
  cloverUsageRestart,
  hasTorso,
  hasUsefulShirt,
  internalQuestStatus,
  isGuildClass,
  MLDamageToMonsterMultiplier,
  shrugAT,
  summonedMonsterToday,
  summonMonster,
  woods_questStart,
} from "../auto_util";
import { zone_isAvailable } from "../auto_zone";
import { canUse } from "../combat/auto_combat_util";
import { fightClubSpa$1 } from "../iotms/mr2018";
import { auto_beachCombHead } from "../iotms/mr2019";
import { auto_backupUsesLeft, auto_haveBackupCamera } from "../iotms/mr2021";
import { auto_haveGreyGoose } from "../iotms/mr2022";
import {
  auto_getCitizenZone$1,
  auto_makeAutumnalAegis,
  auto_remainingCandyCaneSlashes,
} from "../iotms/mr2023";
import { beretBusk } from "../iotms/mr2025";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { is_boris } from "../paths/avatar_of_boris";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { is_pete } from "../paths/avatar_of_sneaky_pete";
import { in_bhy, L13_bhy_towerFinal } from "../paths/bees_hate_you";
import { in_bugbear } from "../paths/bugbear_invasion";
import { inAftercore } from "../paths/casual";
import { bat_reallyPickSkills$1, in_darkGyffte } from "../paths/dark_gyffte";
import { in_disguises } from "../paths/disguises_delimit";
import { in_heavyrains, L13_heavyrains_towerFinal } from "../paths/heavy_rains";
import {
  in_koe,
  L13_koe_towerNSNagamar,
} from "../paths/kingdom_of_exploathing";
import { in_kolhs } from "../paths/kolhs";
import { in_lol } from "../paths/legacy_of_loathing";
import { lar_repeat } from "../paths/live_ascend_repeat";
import {
  in_lowkeysummer,
  L13_sorceressDoorLowKey,
} from "../paths/low_key_summer";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_small } from "../paths/small";
import { in_theSource } from "../paths/the_source";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { in_wereprof } from "../paths/wereprofessor";
import { in_robot } from "../paths/you_robot";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { in_zootomist } from "../paths/zootomist";
import { shenShouldDelayZone } from "./level_11";
import { auto_warSide, equipWarOutfit } from "./level_12";

//Defined in autoscend/quests/level_13.ash
export function needStarKey(): boolean {
  if (containsText(getProperty("nsTowerDoorKeysUsed"), "star key")) {
    return false;
  }
  if (
    itemAmount($item`Richard's star key`) > 0 ||
    creatableAmount($item`Richard's star key`) > 0
  ) {
    return false;
  }
  return true;
}

export function needDigitalKey(): boolean {
  if (isActuallyEd()) {
    return false;
  }
  if (containsText(getProperty("nsTowerDoorKeysUsed"), "digital key")) {
    return false;
  }
  if (itemAmount($item`digital key`) > 0) {
    return false;
  }

  return true;
}

export function need8BitPoints(): boolean {
  if (toInt(getProperty("8BitScore")) >= 10000) {
    return false;
  }
  return needDigitalKey();
}

export function towerKeyCount(effective: boolean = true): number {
  //Returns how many Hero Keys and Fat Loot tokens we have.
  //effective count (with malware) vs true count.

  if (isActuallyEd()) {
    return 3;
  }

  let tokens: number = itemAmount($item`fat loot token`);
  if (
    itemAmount($item`Boris's key`) > 0 ||
    containsText(
      getProperty("nsTowerDoorKeysUsed"),
      $item`Boris's key`.toString(),
    )
  ) {
    tokens = tokens + 1;
  }
  if (
    itemAmount($item`Jarlsberg's key`) > 0 ||
    containsText(
      getProperty("nsTowerDoorKeysUsed"),
      $item`Jarlsberg's key`.toString(),
    )
  ) {
    tokens = tokens + 1;
  }
  if (
    itemAmount($item`Sneaky Pete's key`) > 0 ||
    containsText(
      getProperty("nsTowerDoorKeysUsed"),
      $item`Sneaky Pete's key`.toString(),
    )
  ) {
    tokens = tokens + 1;
  }
  if (
    effective &&
    itemAmount($item`daily dungeon malware`) > 0 &&
    !toBoolean(getProperty("_dailyDungeonMalwareUsed")) &&
    !toBoolean(getProperty("dailyDungeonDone")) &&
    toInt(getProperty("_lastDailyDungeonRoom")) < 14 &&
    !in_pokefam()
  ) {
    tokens = tokens + 1;
  }
  return tokens;
}

function EightBitScore(): number {
  const score: number = toInt(getProperty("8BitScore"));
  return score;
}

export function prepForMegaloCity(): boolean {
  // low DA is punishing here, so if you're a non-guild class get torso and potentially autumn aegis
  if (isGuildClass()) {
    return true; // nothing to do here as guild class
  }
  // If we can buy Torso and should, do that here, ignoring reserve
  if (
    myMeat() >= 6000 &&
    gnomadsAvailable() &&
    !hasTorso() &&
    hasUsefulShirt()
  ) {
    visitUrl("gnomes.php?action=trainskill&whichskill=12");
  }
  // After this consider the aegis
  const aegis: Item = $item`autumnal aegis`;
  if (availableAmount(aegis) > 0 || !auto_is_valid(aegis)) {
    return true; // no point doing anything further here
  }
  if (!isGuildClass() && availableAmount(aegis) === 0) {
    auto_makeAutumnalAegis();
  }
  if (in_zootomist() && availableAmount(aegis) === 0) {
    pullXWhenHaveY(aegis, 1, 0);
  }
  return availableAmount(aegis) > 0;
}

function EightBitRealmHandler(): boolean {
  //Spend adventures to get the digital key
  //Preparing for each zone is handled in auto_pre_adv.ash
  let adv_spent: boolean = false;

  const color: string = getProperty("8BitColor");
  if (
    internalQuestStatus("questL02Larva") < 0 &&
    internalQuestStatus("questG02Whitecastle") < 0 &&
    availableAmount($item`continuum transfunctioner`) === 0
  ) {
    // need distant woods and continuum transfunctioner
    return false;
  }
  switch (color) {
    case "black":
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      adv_spent = autoAdv($location`Vanya's Castle`);
      break;
    case "red":
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      if (meatDropModifier() < 395) {
        auto_getCitizenZone$1("meat");
      }
      adv_spent = autoAdv($location`The Fungus Plains`);
      break;
    case "blue":
      prepForMegaloCity();
      adv_spent = autoAdv($location`Megalo-City`);
      break;
    case "green":
      // limited buff that is helpful for 3 of 4 8-bit zones
      buffMaintain$2($effect`Shadow Waters`);
      adv_spent = autoAdv($location`Hero's Field`);
      break;
    default:
      abort("Property 8BitColor not set to a valid value");
      break;
  }
  auto_log_info$1(`Current 8bit score: ${EightBitScore()}/10000`);

  return adv_spent;
}

export function get8BitFatLootToken(): boolean {
  //Acquire the [Fat Loot Token] from 8 bit realm
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`);
  // buy fat loot token if you can
  if (EightBitScore() >= 20000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    if (2 in availableChoiceOptions()) {
      runChoice(2);
      return true;
    } else {
      auto_log_warning$1(
        "Thought we could buy fat loot token in 8-Bit Realm but was unable.",
      );
      auto_log_warning$1(`Current score = ${EightBitScore()}`);
      return false;
    }
  }

  return EightBitRealmHandler();
}

export function LX_getDigitalKey(): boolean {
  //Acquire the [Digital Key]

  if (!needDigitalKey()) {
    return false;
  }
  if (itemAmount($item`digital key`) > 0) {
    if (haveEffect($effect`Consumed by Fear`) > 0) {
      uneffect($effect`Consumed by Fear`);
      council();
    }
    return false;
  }
  if (in_koe()) {
    if (
      itemAmount($item`digital key`) === 0 &&
      internalQuestStatus("questL13Final") === 5
    ) {
      return buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`digital key`);
    } else {
      return false;
    }
  }
  // start quest and equip to refresh mafia's prefs
  woods_questStart();
  autoForceEquip($slot`acc3`, $item`continuum transfunctioner`);
  // buy key if you can
  if (EightBitScore() >= 10000) {
    equip($slot`acc3`, $item`continuum transfunctioner`);
    visitUrl("place.php?whichplace=8bit&action=8treasure");
    runChoice(1);
    if (!needDigitalKey()) {
      return true;
    }
  }

  return EightBitRealmHandler();
}

export function LX_buyStarKeyParts(): void {
  if (
    itemAmount($item`Richard's star key`) > 0 ||
    containsText(getProperty("nsTowerDoorKeysUsed"), "Richard's star key")
  ) {
    return; //already have it
  }
  if (!canInteract()) {
    return; //no unrestricted mall access
  }
  auto_buyUpTo(1, $item`star chart`);
  auto_buyUpTo(8, $item`star`);
  auto_buyUpTo(7, $item`line`);
}

export function LX_getStarKey(): boolean {
  if (!toBoolean(getProperty("auto_getStarKey"))) {
    return false;
  }
  //needStarKey() checks if you own or have used the star key
  if (!needStarKey()) {
    setProperty("auto_getStarKey", false.toString());
    return false;
  }

  const hole_in_sky_unreachable: boolean =
    internalQuestStatus("questL10Garbage") < 9;
  const shen_might_request_hole: boolean = shenShouldDelayZone(
    $location`The Hole in the Sky`,
  );
  if (hole_in_sky_unreachable || shen_might_request_hole) {
    return false;
  }
  //kingdom of exploathing does not need rocketship to reach hole in the sky
  if (itemAmount($item`steam-powered model rocketship`) === 0 && !in_koe()) {
    return false;
  }

  LX_buyStarKeyParts();
  // summon Skinflute or Camel's Toe to get both stars and lines. We can copy them into delay zones like the 8-bit realm.
  const copiesNeeded: number = max(
    (8 - itemAmount($item`star`)) / 2,
    (7 - itemAmount($item`line`)) / 2,
  );
  if (
    needStarKey() &&
    itemAmount($item`star`) < 8 &&
    itemAmount($item`line`) < 7 &&
    auto_haveBackupCamera() &&
    auto_backupUsesLeft() >= copiesNeeded
  ) {
    // in case it matters later, summon only the monster we can naturally encounter in this ascension.
    if (
      myAscensions() % 2 === 1 &&
      !summonedMonsterToday($monster`Skinflute`) &&
      canSummonMonster($monster`Skinflute`) &&
      summonMonster($monster`Skinflute`)
    ) {
      return true;
    }
    if (
      myAscensions() % 2 === 0 &&
      !summonedMonsterToday($monster`Camel's Toe`) &&
      canSummonMonster($monster`Camel's Toe`) &&
      summonMonster($monster`Camel's Toe`)
    ) {
      return true;
    }
  }

  const at_tower_door: boolean = internalQuestStatus("questL13Final") === 5;
  if (
    !inHardcore() &&
    at_tower_door &&
    needStarKey() &&
    itemAmount($item`star chart`) === 0 &&
    itemAmount($item`star`) >= 8 &&
    itemAmount($item`line`) >= 7
  ) {
    pullXWhenHaveY($item`star chart`, 1, 0);
  }

  if (
    itemAmount($item`Richard's star key`) === 0 &&
    creatableAmount($item`Richard's star key`) > 0 &&
    !containsText(getProperty("nsTowerDoorKeysUsed"), "Richard's star key")
  ) {
    return create(1, $item`Richard's star key`);
  }
  //if only star chart is missing and you will pull it at tower door, then you are done for now.
  if (
    itemAmount($item`star`) >= 8 &&
    itemAmount($item`line`) >= 7 &&
    !inHardcore() &&
    !at_tower_door
  ) {
    return false;
  }

  if (!zone_isAvailable($location`The Hole in the Sky`)) {
    auto_log_warning(
      "The Hole In The Sky is not available, we have to do something else...",
      "red",
    );
    return false;
  }

  if (auto_have_familiar($familiar`Space Jellyfish`)) {
    handleFamiliar$1($familiar`Space Jellyfish`);
    if (itemAmount($item`star chart`) === 0) {
      setProperty("choiceAdventure1221", (1).toString());
    } else {
      setProperty("choiceAdventure1221", (2 + (myAscensions() % 2)).toString());
    }
  }
  if (auto_haveGreyGoose()) {
    auto_log_info$1(
      "Bringing the Grey Goose to emit some drones at some Constellations.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }
  return autoAdv($location`The Hole in the Sky`);
}

export function beehiveConsider(at_tower: boolean): boolean {
  // returns true if we can kill without a beehive
  let damage_sources: number = 1; // basic hit
  // Familiars
  if (auto_have_familiar($familiar`Glover`)) {
    damage_sources += 11;
  }
  if (auto_have_familiar($familiar`Shorter-Order Cook`)) {
    damage_sources += 6;
  } else if (auto_have_familiar($familiar`Mu`)) {
    damage_sources += 5;
  } else if (auto_have_familiar($familiar`Imitation Crab`)) {
    damage_sources += 4;
  }
  // Combat skill to use
  if (haveSkill($skill`Kneebutt`) || haveSkill($skill`Headbutt`)) {
    damage_sources += 1;
  }
  // Retatiatory skills
  for (const sk of $skills`The Psalm of Pointiness, Spiky Shell, Scarysauce, Jalapeño Saucesphere`) {
    if (haveSkill(sk)) {
      damage_sources += 1;
    }
  }
  // Damage skills
  for (const sk of $skills`Dirge of Dreadfulness, Icy Glare`) {
    if (haveSkill(sk)) {
      damage_sources += 1;
    }
  }
  // Sleaze and stench will be taken care of war gear.
  damage_sources += 2;
  // Now check stuff we get in run.
  // Hot and another retaliation will be taken care of by hot plate (guaranteed from friars)
  if (!at_tower || availableAmount($item`hot plate`) > 0) {
    damage_sources += 2;
  } else {
    // or maybe we just have hot damage already
    if (numericModifier(Modifier.get("Hot Damage")) > 0) {
      damage_sources += 1;
    }
  }
  // Tiny bowler gives familiar damage
  if (availableAmount($item`tiny bowler`) > 0) {
    damage_sources += 1;
  }
  // We can't assume we get this, so don't count it speculatively.
  if (availableAmount($item`hippy protest button`) > 0) {
    damage_sources += 1;
  }
  //~ auto_log_info("Investigating chance of towerkilling wall of skin, need 13 damage, expecting to have "+to_string(damage_sources), "blue");

  if (damage_sources >= 13) {
    setProperty("auto_getBeehive", false.toString());
    return true;
  }
  setProperty("auto_getBeehive", true.toString());
  return false;
}

export function ns_crowd1(): number {
  if (toInt(getProperty("nsContestants1")) !== 0) {
    auto_log_info("Default Test: Initiative", "red");
  }
  return 1;
}

export function ns_crowd2(): Stat {
  if (toInt(getProperty("nsContestants2")) !== 0) {
    auto_log_info(`Off-Stat Test: ${getProperty("nsChallenge1")}`, "red");
  }
  return toStat(getProperty("nsChallenge1"));
}

export function ns_crowd3(): Element {
  if (toInt(getProperty("nsContestants3")) !== 0) {
    auto_log_info(`Elemental Test: ${getProperty("nsChallenge2")}`, "red");
  }
  return toElement(getProperty("nsChallenge2"));
}

export function ns_hedge1(): Element {
  auto_log_info(`Hedge Maze 1: ${getProperty("nsChallenge3")}`, "red");
  return toElement(getProperty("nsChallenge3"));
}

export function ns_hedge2(): Element {
  auto_log_info(`Hedge Maze 2: ${getProperty("nsChallenge4")}`, "red");
  return toElement(getProperty("nsChallenge4"));
}

export function ns_hedge3(): Element {
  auto_log_info(`Hedge Maze 3: ${getProperty("nsChallenge5")}`, "red");
  return toElement(getProperty("nsChallenge5"));
}

export function L13_towerNSContests(): boolean {
  if (
    internalQuestStatus("questL13Final") < 0 ||
    internalQuestStatus("questL13Final") > 3
  ) {
    return false;
  }

  if (
    containsText(visitUrl("place.php?whichplace=nstower"), "ns_02_coronation")
  ) {
    setProperty("choiceAdventure1020", "1");
    setProperty("choiceAdventure1021", "1");
    setProperty("choiceAdventure1022", "1");
    visitUrl("place.php?whichplace=nstower&action=ns_02_coronation");
    visitUrl("choice.php?pwd=&whichchoice=1020&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1021&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1022&option=1", true);
    return true;
  }
  //if you do not have a telescope you need to actually visit the contest booth once to find out what element and offstat is needed
  if (
    getProperty("nsChallenge1") === "none" ||
    getProperty("nsChallenge2") === "none"
  ) {
    visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
  }

  function crowd1Insufficient(): boolean {
    return numericModifier("Initiative") < 400.0;
  }

  let crowd_stat: Stat = ns_crowd2();

  function crowd2Insufficient(): boolean {
    return myBuffedstat(crowd_stat) < 600;
  }

  const challenge: Element = ns_crowd3();
  function crowd3Insufficient(): boolean {
    return (
      numericModifier(`${challenge} Damage`) +
        numericModifier(`${challenge} Spell Damage`) <
      100
    );
  }

  if (
    containsText(visitUrl("place.php?whichplace=nstower"), "ns_01_contestbooth")
  ) {
    if (
      in_wereprof() &&
      toInt(getProperty("wereProfessorTransformTurns")) < 48
    ) {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      visitUrl("choice.php?pwd=&whichchoice=1003&option=5", true); //want as many turns of werewolf as possible at the contest booth so refresh with this choice
      visitUrl("main.php");
    }
    if (toInt(getProperty("nsContestants1")) === -1) {
      resetMaximize();
      if (
        !toBoolean(getProperty("_grimBuff")) &&
        auto_have_familiar($familiar`Grim Brother`)
      ) {
        cliExecute("grim init");
      }
      if (
        toInt(getProperty("telescopeUpgrades")) > 0 &&
        !toBoolean(getProperty("telescopeLookedHigh")) &&
        auto_is_valid$3($effect`Starry-Eyed`)
      ) {
        cliExecute("telescope high");
      }
      switch (ns_crowd1()) {
        case 1:
          acquireMP(160); // only uses free rests or items on hand by default

          autoMaximize$1(`initiative -"equip snow suit"`, 1500, 0, false);
          provideInitiative$2(400, $location`Noob Cave`, true);
          if (
            crowd1Insufficient() &&
            getProperty("sidequestArenaCompleted") === "fratboy"
          ) {
            cliExecute("concert White-boy Angst");
          }
          if (crowd1Insufficient()) {
            auto_wishForEffectIfNeeded($effect`New and Improved`);
          }
          if (crowd1Insufficient()) {
            if (toBoolean(getProperty("auto_secondPlaceOrBust"))) {
              abort(
                "Not enough initiative for the initiative test, aborting since auto_secondPlaceOrBust=true",
              );
            } else {
              auto_log_warning(
                "Not enough initiative for the initiative test, but continuing since auto_secondPlaceOrBust=false",
                "red",
              );
            }
          }
          break;
      }
      // Adjust us to the initiative familiar selected in provideInitiative().
      preAdvUpdateFamiliar(Location.none);

      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      visitUrl("choice.php?pwd=&whichchoice=1003&option=1", true);
      visitUrl("main.php");
    }
    if (toInt(getProperty("nsContestants2")) === -1) {
      resetMaximize();
      if (
        !toBoolean(getProperty("_lyleFavored")) &&
        auto_is_valid$3($effect`Favored by Lyle`)
      ) {
        visitUrl("place.php?whichplace=monorail&action=monorail_lyle");
      }
      acquireMP(150); // only uses free rests or items on hand by default
      if (in_darkGyffte()) {
        if (
          crowd_stat === $stat`Muscle` &&
          !haveSkill($skill`Preternatural Strength`)
        ) {
          const requirements: Map<Skill, boolean> = new Map();
          requirements.set($skill`Preternatural Strength`, true);
          auto_log_info(
            "Torporing, since we want to get Preternatural Strength.",
            "blue",
          );
          bat_reallyPickSkills$1(20, requirements);
        }
        // This could be generalized for stat equalizer potions, but that seems marginal
        if (
          crowd_stat === $stat`Muscle` &&
          haveSkill($skill`Preternatural Strength`)
        ) {
          crowd_stat = $stat`Mysticality`;
        }
        if (crowd_stat === $stat`Moxie` && haveSkill($skill`Sinister Charm`)) {
          crowd_stat = $stat`Mysticality`;
        }
      }
      const statGoal: Map<Stat, number> = new Map();
      statGoal.set(crowd_stat, 600);
      provideStats$2(statGoal, $location`Noob Cave`, true);
      switch (crowd_stat) {
        case $stat`Moxie`:
          autoMaximize$1(`moxie -"equip snow suit"`, 1500, 0, false);
          if (
            haveEffect($effect`Ten out of Ten`) === 0 &&
            auto_is_valid$3($effect`Ten out of Ten`)
          ) {
            if (crowd2Insufficient()) {
              fightClubSpa$1($effect`Ten out of Ten`);
            }
          }
          if (
            in_small() &&
            crowd2Insufficient() &&
            haveEffect($effect`Piratastic`) === 0
          ) {
            auto_wishForEffect($effect`Piratastic`);
          }
          break;
        case $stat`Muscle`:
          autoMaximize$1(`muscle -"equip snow suit"`, 1500, 0, false);
          if (
            haveEffect($effect`Muddled`) === 0 &&
            auto_is_valid$3($effect`Muddled`)
          ) {
            if (crowd2Insufficient()) {
              fightClubSpa$1($effect`Muddled`);
            }
          }
          if (
            in_small() &&
            crowd2Insufficient() &&
            haveEffect($effect`'Roids of the Rhinoceros`) === 0
          ) {
            auto_wishForEffect($effect`'Roids of the Rhinoceros`);
          }
          break;
        case $stat`Mysticality`:
          autoMaximize$1(`myst -"equip snow suit"`, 1500, 0, false);
          if (
            haveEffect($effect`Uncucumbered`) === 0 &&
            auto_is_valid$3($effect`Uncucumbered`)
          ) {
            if (crowd2Insufficient()) {
              fightClubSpa$1($effect`Uncucumbered`);
            }
          }
          if (
            in_small() &&
            crowd2Insufficient() &&
            haveEffect($effect`Happy Trails`) === 0
          ) {
            auto_wishForEffect($effect`Happy Trails`);
          }
          break;
      }

      if (crowd2Insufficient()) {
        auto_equalizeStats();
      }
      if (crowd2Insufficient() && !in_small()) {
        if (!in_small()) {
          auto_wishForEffectIfNeeded($effect`New and Improved`);
        }
      }

      if (crowd2Insufficient()) {
        if (toBoolean(getProperty("auto_secondPlaceOrBust"))) {
          abort(
            `Not enough ${crowd_stat} for the stat test, aborting since auto_secondPlaceOrBust=true`,
          );
        } else {
          auto_log_warning(
            `Not enough ${crowd_stat} for the stat test, but continuing since auto_secondPlaceOrBust=false`,
            "red",
          );
        }
      }
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      visitUrl("choice.php?pwd=&whichchoice=1003&option=2", true);
      visitUrl("main.php");
    }
    if (toInt(getProperty("nsContestants3")) === -1) {
      resetMaximize();
      acquireMP(125); // only uses free rests or items on hand by default

      if (challenge !== Element.none) {
        autoMaximize$1(
          `${challenge} dmg, ${challenge} spell dmg -"equip snow suit"`,
          1500,
          0,
          false,
        );
      }

      beretBusk(
        `5.0:Spell Damage;5.0:${challenge} Damage;5.0:${challenge} Spell Damage`,
      );

      if (crowd3Insufficient()) {
        buffMaintain$2($effect`All Glory To the Toad`);
      }
      if (crowd3Insufficient()) {
        buffMaintain$2($effect`Bendin' Hell`, 120, 1, 1);
      }
      switch (challenge) {
        case $element`cold`:
          if (crowd3Insufficient()) {
            auto_beachCombHead("cold");
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Cold Hard Skin`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Frostbeard`, 15, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Icy Glare`, 10, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Song of the North`, 100, 1, 1);
          }
          break;
        case $element`hot`:
          if (crowd3Insufficient()) {
            auto_beachCombHead("hot");
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Song of Sauce`, 100, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Flamibili Tea`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Flaming Weapon`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Human-Demon Hybrid`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Lit Up`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Fire Inside`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Pyromania`, 15, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Your Fifteen Minutes`, 50, 1, 1);
          }
          break;
        case $element`sleaze`:
          if (crowd3Insufficient()) {
            auto_beachCombHead("sleaze");
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Takin' It Greasy`, 15, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Blood-Gorged`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Greasy Peasy`);
          }
          break;
        case $element`stench`:
          if (crowd3Insufficient()) {
            auto_beachCombHead("stench");
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Drenched With Filth`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Musky`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Stinky Hands`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Stinky Weapon`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Rotten Memories`, 15, 1, 1);
          }
          if (canPull($item`halibut`) && auto_can_equip($item`halibut`)) {
            pullXWhenHaveY($item`halibut`, 1, 0);
            autoMaximize$1(
              `${challenge} dmg, ${challenge} spell dmg -"equip snow suit"`,
              1500,
              0,
              false,
            );
          }
          break;
        case $element`spooky`:
          if (crowd3Insufficient()) {
            auto_beachCombHead("spooky");
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Spooky Hands`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Spooky Weapon`);
          }

          // at this point, an example list of songs is phat loot / polka / celerity / madrigal
          if (crowd3Insufficient()) {
            // specify normal effect to avoid failing the skill check
            shrugAT($effect`Dirge of Dreadfulness`);
            buffMaintain$2($effect`Dirge of Dreadfulness (Remastered)`);
          }
          if (crowd3Insufficient()) {
            shrugAT($effect`Dirge of Dreadfulness`);
            buffMaintain$2($effect`Dirge of Dreadfulness`, 10, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Intimidating Mien`, 15, 1, 1);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Snarl of Three Timberwolves`);
          }
          if (crowd3Insufficient()) {
            buffMaintain$2($effect`Snarl of the Timberwolf`, 10, 1, 1);
          }
          break;
      }

      let score: number = numericModifier(`${challenge} damage`);
      score += numericModifier(`${challenge} spell damage`);
      if (score > 20.0 && score < 85.0) {
        buffMaintain$2($effect`Bendin' Hell`, 100, 1, 1);
      }

      score = numericModifier(`${challenge} damage`);
      score += numericModifier(`${challenge} spell damage`);
      if (score < 80) {
        switch (challenge) {
          case $element`cold`:
            auto_wishForEffect($effect`Staying Frosty`);
            break;
          case $element`hot`:
            auto_wishForEffect($effect`Dragged Through the Coals`);
            break;
          case $element`sleaze`:
            auto_wishForEffect($effect`Fifty Ways to Bereave Your Lover`);
            break;
          case $element`stench`:
            auto_wishForEffect($effect`Sewer-Drenched`);
            break;
          case $element`spooky`:
            auto_wishForEffect($effect`You're Back...`);
            break;
        }
      }
      //Busk one final time to try to be sufficient
      if (crowd3Insufficient()) {
        beretBusk(
          `5.0:Spell Damage;5.0:${challenge} Damage;5.0:${challenge} Spell Damage`,
        );
      }

      if (crowd3Insufficient()) {
        if (toBoolean(getProperty("auto_secondPlaceOrBust"))) {
          abort(
            `Not enough ${challenge} for the elemental test, aborting since auto_secondPlaceOrBust=true`,
          );
        } else {
          auto_log_warning(
            `Not enough ${challenge} for the elemental test, but continuing since auto_secondPlaceOrBust=false`,
            "red",
          );
        }
      }

      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      visitUrl("choice.php?pwd=&whichchoice=1003&option=3", true);
      visitUrl("main.php");
    }

    setProperty("choiceAdventure1003", (4).toString());
    if (
      toInt(getProperty("nsContestants1")) === 0 &&
      toInt(getProperty("nsContestants2")) === 0 &&
      toInt(getProperty("nsContestants3")) === 0
    ) {
      auto_log_info("The NS Challenges are over! Victory is ours!", "blue");
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      visitUrl("choice.php?pwd=&whichchoice=1003&option=4", true);
      visitUrl("main.php");
      if (
        toInt(getProperty("nsContestants1")) !== 0 ||
        toInt(getProperty("nsContestants2")) !== 0 ||
        toInt(getProperty("nsContestants3")) !== 0
      ) {
        if (internalQuestStatus("questL13Final") === 2) {
          if (in_theSource()) {
            //As of r17048, encountering a Source Agent on the Challenge line results in nsContestants being decremented twice.
            //Since we were using Mafia\'s tracking here, we have to compensate for when it fails...
            auto_log_warning(
              "Probably encountered a Source Agent during the NS Contestants and Mafia's tracking fails on this. Let's try to correct it...",
              "red",
            );
            setProperty("questL13Final", "step1");
          } else {
            auto_log_error(
              "Error not recoverable (as not antipicipated) outside of The Source (Source Agents during NS Challenges), aborting.",
            );
            abort("questL13Final error in unexpected path.");
          }
        } else {
          auto_log_error(
            "Unresolvable error: Mafia thinks the NS challenges are complete but something is very wrong.",
          );
          abort("Unknown questL13Final state.");
        }
      }
      return true;
    }
  }

  equipBaseline();

  if (containsText(visitUrl("place.php?whichplace=nstower"), "ns_01_crowd1")) {
    autoAdv($location`Fastest Adventurer Contest`);
    return true;
  }

  if (containsText(visitUrl("place.php?whichplace=nstower"), "ns_01_crowd2")) {
    let toCompete: Location = Location.none;
    switch (getProperty("nsChallenge1")) {
      case "Mysticality":
        toCompete = $location`Smartest Adventurer Contest`;
        break;
      case "Moxie":
        toCompete = $location`Smoothest Adventurer Contest`;
        break;
      case "Muscle":
        toCompete = $location`Strongest Adventurer Contest`;
        break;
    }
    if (toCompete === Location.none) {
      abort("nsChallenge1 is invalid. This is a severe error.");
    }
    autoAdv(toCompete);
    return true;
  }

  if (containsText(visitUrl("place.php?whichplace=nstower"), "ns_01_crowd3")) {
    let toCompete: Location = Location.none;
    switch (getProperty("nsChallenge2")) {
      case "cold":
        toCompete = $location`Coldest Adventurer Contest`;
        break;
      case "hot":
        toCompete = $location`Hottest Adventurer Contest`;
        break;
      case "sleaze":
        toCompete = $location`Sleaziest Adventurer Contest`;
        break;
      case "spooky":
        toCompete = $location`Spookiest Adventurer Contest`;
        break;
      case "stench":
        toCompete = $location`Stinkiest Adventurer Contest`;
        break;
    }
    if (toCompete === Location.none) {
      abort("nsChallenge1 is invalid. This is a severe error.");
    }
    autoAdv(toCompete);
    return true;
  }
  auto_log_info("No challenges left!", "green");
  if (in_pokefam()) {
    if (toInt(getProperty("nsContestants1")) === 0) {
      return false;
    }
    setProperty("nsContestants1", (0).toString());
    setProperty("nsContestants2", (0).toString());
    setProperty("nsContestants3", (0).toString());
    return true;
  }
  return false;
}

function maximize_hedge(): void {
  visitUrl("campground.php?action=telescopelow");

  const first: Element = ns_hedge1();
  const second: Element = ns_hedge2();
  const third: Element = ns_hedge3();
  const resGoal: Map<Element, number> = new Map();
  if (
    first === Element.none ||
    second === Element.none ||
    third === Element.none
  ) {
    for (const ele of $elements`hot, cold, stench, sleaze, spooky`) {
      resGoal.set(ele, 9);
    }
  } else {
    resGoal.set(first, 9);
    resGoal.set(second, 9);
    resGoal.set(third, 9);
  }

  provideResistances$4(resGoal, $location`Noob Cave`, true);
}

export function L13_towerNSHedge(): boolean {
  if (
    internalQuestStatus("questL13Final") === 5 &&
    containsText(visitUrl("place.php?whichplace=nstower"), "hedgemaze")
  ) {
    //If we got beaten up by the last hedgemaze, mafia might set questL13Final to step5 anyway. Fix that.
    setProperty("questL13Final", "step4");
    if (haveEffect($effect`Beaten Up`) > 0 || myHp() < 150) {
      auto_log_error(
        "Hedge maze not solved, the mysteries are still there (correcting step5 -> step4)",
      );
      abort("Heal yourself and try again...");
    }
  }
  if (internalQuestStatus("questL13Final") !== 4) {
    return false;
  }
  // Set this so it aborts if not enough adventures. Otherwise, well, we end up in a loop.
  setProperty("choiceAdventure1004", "3");
  setProperty("choiceAdventure1005", "2"); // 'Allo
  setProperty("choiceAdventure1006", "2"); // One Small Step For Adventurer
  setProperty("choiceAdventure1007", "2"); // Twisty Little Passages, All Hedge
  setProperty("choiceAdventure1008", "2"); // Pooling Your Resources
  setProperty("choiceAdventure1009", "2"); // Gold Ol' 44% Duck
  setProperty("choiceAdventure1010", "2"); // Another Day, Another Fork
  setProperty("choiceAdventure1011", "2"); // Of Mouseholes and Manholes
  setProperty("choiceAdventure1012", "2"); // The Last Temptation
  setProperty("choiceAdventure1013", "1"); // Masel Tov!

  maximize_hedge();
  cliExecute("auto_pre_adv.js");
  setProperty("_auto_forcePokefamRestore", true.toString());
  if (!acquireFullHP()) {
    // couldn't heal so do slow route. May die to fast route
    setProperty("auto_hedge", "slow");
  }
  visitUrl("place.php?whichplace=nstower&action=ns_03_hedgemaze");
  if (getProperty("lastEncounter") === "This Maze is... Mazelike...") {
    runChoice(2);
    abort("May not have enough adventures for the hedge maze. Failing");
  }

  if (getProperty("auto_hedge") === "slow") {
    visitUrl("choice.php?pwd=&whichchoice=1005&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1006&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1007&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1008&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1009&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1010&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1011&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1012&option=1", true);
    visitUrl("choice.php?pwd=&whichchoice=1013&option=1", true);
  } else if (getProperty("auto_hedge") === "fast") {
    visitUrl("choice.php?pwd=&whichchoice=1005&option=2", true);
    visitUrl("choice.php?pwd=&whichchoice=1008&option=2", true);
    visitUrl("choice.php?pwd=&whichchoice=1011&option=2", true);
    visitUrl("choice.php?pwd=&whichchoice=1013&option=1", true);
  } else {
    abort(
      "auto_hedge not set properly (slow/fast), assuming manual handling desired",
    );
  }
  if (haveEffect($effect`Beaten Up`) > 0) {
    abort("Failed the hedge maze, may want to do this manually...");
  }
  return true;
}

export function L13_sorceressDoor(): boolean {
  if (internalQuestStatus("questL13Final") !== 5) {
    return false;
  }

  if (LX_getStarKey() || LX_getDigitalKey()) {
    // should attempt Star Key first as 8-bit zones can be progressed with backups etc.
    return true;
  }
  // Low Key Summer has an entirely different door.
  if (in_lowkeysummer()) {
    return L13_sorceressDoorLowKey();
  }

  const page: string = visitUrl("place.php?whichplace=nstower_door");
  if (containsText(page, "ns_lock6")) {
    if (itemAmount($item`skeleton key`) === 0) {
      cliExecute("make skeleton key");
    }
    if (itemAmount($item`skeleton key`) === 0) {
      abort("Need Skeleton Key for the Sorceress door :(");
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock6");
  }

  if (towerKeyCount() < 3) {
    abort("Do not have enough hero keys");
  }

  if (containsText(page, "ns_lock1")) {
    if (itemAmount($item`Boris's key`) === 0) {
      if (in_koe() && itemAmount($item`fat loot token`) > 0) {
        buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`Boris's key`);
      } else {
        cliExecute("make Boris's Key");
      }
    }
    if (itemAmount($item`Boris's key`) === 0) {
      abort("Need Boris's Key for the Sorceress door :(");
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock1");
  }
  if (containsText(page, "ns_lock2")) {
    if (itemAmount($item`Jarlsberg's key`) === 0) {
      if (in_koe() && itemAmount($item`fat loot token`) > 0) {
        buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`Jarlsberg's key`);
      } else {
        cliExecute("make Jarlsberg's Key");
      }
    }
    if (itemAmount($item`Jarlsberg's key`) === 0) {
      abort("Need Jarlsberg's Key for the Sorceress door :(");
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock2");
  }
  if (containsText(page, "ns_lock3")) {
    if (itemAmount($item`Sneaky Pete's key`) === 0) {
      if (in_koe() && itemAmount($item`fat loot token`) > 0) {
        buy($coinmaster`Cosmic Ray's Bazaar`, 1, $item`Sneaky Pete's key`);
      } else {
        cliExecute("make Sneaky Pete's Key");
      }
    }
    if (itemAmount($item`Sneaky Pete's key`) === 0) {
      abort("Need Sneaky Pete's Key for the Sorceress door :(");
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock3");
  }

  if (containsText(page, "ns_lock4")) {
    if (itemAmount($item`Richard's star key`) === 0) {
      cliExecute("make richard's star key");
    }
    if (itemAmount($item`Richard's star key`) === 0) {
      if (!toBoolean(getProperty("auto_getStarKey"))) {
        abort(
          "Need Richard's Star Key for the Sorceress door. Perhaps set auto_getStarKey=true ?",
        );
      } else {
        abort(
          "Need Richard's Star Key for the Sorceress door, but auto_getStarKey=true so I'm not sure why we haven't gotten it already. :(",
        );
      }
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock4");
  }

  if (containsText(page, "ns_lock5")) {
    if (itemAmount($item`digital key`) === 0) {
      abort("Need Digital Key for the Sorceress door :(");
    }
    visitUrl("place.php?whichplace=nstower_door&action=ns_lock5");
  }

  visitUrl("place.php?whichplace=nstower_door&action=ns_doorknob");
  return true;
}

export function L13_towerNSTower(): boolean {
  if (
    internalQuestStatus("questL13Final") < 6 ||
    internalQuestStatus("questL13Final") > 11
  ) {
    return false;
  }

  auto_log_info("Scaling the mighty NStower...", "green");

  if (L13_towerNSTowerSkin()) {
    return true;
  }
  if (L13_towerNSTowerMeat()) {
    return true;
  }
  if (L13_towerNSTowerBones()) {
    return true;
  }
  if (L13_towerNSTowerMirror()) {
    return true;
  }
  if (L13_towerNSTowerShadow()) {
    return true;
  }

  return false;
}

function L13_towerNSTowerSkin(): boolean {
  if (
    !containsText(visitUrl("place.php?whichplace=nstower"), "ns_05_monster1")
  ) {
    return false;
  }
  auto_log_info("Time to fight the Wall of Skins!", "blue");
  if (
    toLowerCase(getProperty("auto_towerBreak")) === "wall of skin" ||
    toLowerCase(getProperty("auto_towerBreak")) === "wallofskin" ||
    toLowerCase(getProperty("auto_towerBreak")) === "skin" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 1"
  ) {
    abort("auto_towerBreak set to abort here.");
  }
  if (itemAmount($item`beehive`) > 0 || in_pokefam()) {
    return autoAdvBypass$1(
      "place.php?whichplace=nstower&action=ns_05_monster1",
      $location`Tower Level 1`,
    );
  }
  // Can we kill the tower without a beehive?
  beehiveConsider(true);
  if (toBoolean(getProperty("auto_getBeehive"))) {
    return false;
  }

  let damage: number = 2; // base attack damage plus TT attack skill (kneebutt, headbutt)

  let fam_set: boolean = false;
  const fam_damage: Map<Familiar, number> = new Map([
    [$familiar`Glover`, 11],
    [$familiar`Shorter-Order Cook`, 6],
    [$familiar`Mu`, 5],
    [$familiar`Imitation Crab`, 4],
  ]);

  for (const fam of $familiars`Glover, Shorter-Order Cook, Mu, Imitation Crab`) {
    // crab is evergreen, buy one
    if (auto_have_familiar(fam)) {
      handleFamiliar$1(fam);
      useFamiliar(fam);
      damage += fam_damage.get(fam) ?? fam_damage.set(fam, 0).get(fam);
      fam_set = true;
      break;
    }
  }
  if (!fam_set) {
    // just use some trash that does damage that we will have
    for (const fam of $familiars`Angry Goat, MagiMechTech MicroMechaMech, Star Starfish, Mosquito`) {
      if (auto_have_familiar(fam)) {
        handleFamiliar$1(fam);
        useFamiliar(fam);
        break;
      }
    }
  }
  // We've probably got a tiny bowler, that'll help.
  if (availableAmount($item`tiny bowler`) > 0 && canEquip($item`tiny bowler`)) {
    autoEquip($item`tiny bowler`);
    damage += 1; //familiar attack
  }
  // apply skills
  // start by shrugging unnecessary AT skills
  // These ones should be safe to just remove simply
  uneffect($effect`Aloysius' Antiphon of Aptitude`);
  uneffect($effect`Ode to Booze`);
  uneffect($effect`The Sonata of Sneakiness`);
  uneffect($effect`Carlweather's Cantata of Confrontation`);
  uneffect($effect`Cletus's Canticle of Celerity`);
  // TODO: These need to be handled so they're not recast
  uneffect($effect`Ur-Kel's Aria of Annoyance`);
  uneffect($effect`Polka of Plenty`);
  // We want retaliation for light hits, so remove blood bubble if possible
  uneffect($effect`Blood Bubble`);
  // damage skills
  for (const sk of $skills`Dirge of Dreadfulness, Icy Glare`) {
    if (haveSkill(sk)) {
      useSkill(sk);
      damage += 1;
    }
  }
  // Stinging skills
  for (const sk of $skills`The Psalm of Pointiness, Spiky Shell, Scarysauce, Jalapeño Saucesphere`) {
    if (haveSkill(sk)) {
      useSkill(sk);
      damage += 1;
    }
  }
  // Skills took care of cold and spooky damage, hot plate can take care of hot (and sting), guaranteed from level 6
  if (availableAmount($item`hot plate`) > 0 && canEquip($item`hot plate`)) {
    autoForceEquip$3($item`hot plate`);
    damage += 2; // hot damage, sting point
  }
  // sleaze/stench damage from war outfit and acccessory drops
  let acc1_occupied: boolean = false;
  let acc2_occupied: boolean = false;
  // War outfit will occupy acc3
  equipWarOutfit();
  // Frats need stench
  let damage_accs: Item[] = $items`longhaired hippy wig, Lockenstock™ sandals, Gaia beads`;
  if (auto_warSide() === "hippy") {
    // hippies need sleaze
    damage_accs = $items`kick-ass kicks, Jefferson wings, ghost of a necklace`;
  }
  // elemental damage accessory loop
  // Extra stinging accessories
  const stinging_accs: Item[] = $items`hippy protest button, bottle opener belt buckle`;
  for (const it of [...damage_accs, ...stinging_accs]) {
    if (!have(it) || !canEquip(it)) continue;

    if (!acc1_occupied) {
      autoEquipToSlot($slot`acc1`, it);
      acc1_occupied = true;
      damage++;
    } else if (!acc2_occupied) {
      autoEquipToSlot($slot`acc2`, it);
      acc2_occupied = true;
      damage++;
    }
  }

  if (damage < 13) {
    auto_log_info(
      `I'm trying to towerkill the Wall of Skin, but I don't think I've got enough damage sources. I have ${toInt(damage)}`,
      "red",
    );
    setProperty("auto_getBeehive", true.toString());
    auto_log_info(
      "Exiting. Either investigate, or just re-run and we'll get the Beehive.",
      "red",
    );
    abort("Failed at Wall of Skin");
  }
  auto_log_info(
    `I think I have ${damage} points of damage per turn, time to towerkill the Wall of Skin`,
    "blue",
  );
  // Should we be casting shell up here? I do not understand it. If we got this far we should win regardless.

  acquireFullHP();
  autoAdvBypass$1(
    "place.php?whichplace=nstower&action=ns_05_monster1",
    $location`Tower Level 1`,
  );
  if (internalQuestStatus("questL13Final") < 7) {
    setProperty("auto_getBeehive", true.toString());
    auto_log_warning(
      "I probably failed the Wall of Skin, I assume that I tried without a beehive. Well, I'm going back to get it.",
      "red",
    );
  }
  return true;
}

function L13_towerNSTowerMeat(): boolean {
  if (
    !containsText(visitUrl("place.php?whichplace=nstower"), "ns_06_monster2")
  ) {
    return false;
  }
  if (
    toLowerCase(getProperty("auto_towerBreak")) === "wall of meat" ||
    toLowerCase(getProperty("auto_towerBreak")) === "wallofmeat" ||
    toLowerCase(getProperty("auto_towerBreak")) === "meat" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 2"
  ) {
    abort("auto_towerBreak set to abort here.");
  }
  equipBaseline();
  shrugAT($effect`Polka of Plenty`);
  provideMeat$1(526, true, false);
  if (meatDropModifier() < 475) {
    auto_getCitizenZone$1("meat");
  }

  if (in_zombieSlayer()) {
    acquireMP(30, 0);
  }

  acquireFullHP();
  autoAdvBypass$1(
    "place.php?whichplace=nstower&action=ns_06_monster2",
    $location`Noob Cave`,
  );
  return true;
}

function L13_towerNSTowerBones(): boolean {
  if (
    !containsText(visitUrl("place.php?whichplace=nstower"), "ns_07_monster3")
  ) {
    return false;
  }
  if (
    toLowerCase(getProperty("auto_towerBreak")) === "wall of bones" ||
    toLowerCase(getProperty("auto_towerBreak")) === "wallofbones" ||
    toLowerCase(getProperty("auto_towerBreak")) === "bones" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 3"
  ) {
    abort("auto_towerBreak set to abort here.");
  }
  const hundred_fam: Familiar = toFamiliar(getProperty("auto_100familiar"));
  const has_boning_knife: boolean =
    itemAmount($item`electric boning knife`) > 0;

  if (
    has_boning_knife ||
    in_pokefam() ||
    (in_wereprof() &&
      canUse($skill`Slaughter`) &&
      haveEffect($effect`Everything Looks Red`) === 0)
  ) {
    //I have everything I need. just go fight
    return autoAdvBypass$1(
      "place.php?whichplace=nstower&action=ns_07_monster3",
      $location`Noob Cave`,
    );
  }
  //should I grab an electric boning knife?
  if (hundred_fam !== Familiar.none && isAttackFamiliar(hundred_fam)) {
    setProperty("auto_getBoningKnife", true.toString()); //in 100% familiar run with attack familiar we must acquire boning knife
  }
  if (!(haveSkill($skill`Saucegeyser`) || haveSkill($skill`Garbage Nova`))) {
    setProperty("auto_getBoningKnife", true.toString()); //can not towerkill. get boning knife instead
  }
  if (!uneffect($effect`Scariersauce`)) {
    //passive dmg prevents tower kill. we can not uneffect it so get boning knife instead
    setProperty("auto_getBoningKnife", true.toString());
  }

  if (toBoolean(getProperty("auto_getBoningKnife"))) {
    //grab boning knife if we deemed it necessary
    if (
      lar_repeat($location`The Castle in the Clouds in the Sky (Ground Floor)`)
    ) {
      auto_log_info("Backfarming an Electric Boning Knife", "green");
      return autoAdv(
        $location`The Castle in the Clouds in the Sky (Ground Floor)`,
      );
    } else {
      abort(
        "I determined I must get [Electric Boning Knife] to proceed but I can not get one",
      );
    }
  }
  //if we reached this spot we decided that we do not need a boning knife and intend to try to towerkill the wall of bones.
  uneffect($effect`Scarysauce`);
  uneffect($effect`Jalapeño Saucesphere`);
  uneffect($effect`Spiky Shell`);
  if (in_aosol()) {
    uneffect($effect`Queso Fustulento`);
    uneffect($effect`Tricky Timpani`);
  }
  uneffect($effect`Psalm of Pointiness`);
  uneffect($effect`Mayeaugh`);
  uneffect($effect`Feeling Nervous`);

  if (myPrimestat() !== $stat`Mysticality`) {
    auto_equalizeStats(); // uses reagent oil to stabilize stats
  }
  // Clear some AT buffs so we have room. Ur-kel is actively harmful since it increases DR
  uneffect($effect`Ur-Kel's Aria of Annoyance`);
  uneffect($effect`Polka of Plenty`);
  uneffect($effect`The Sonata of Sneakiness`);
  uneffect($effect`Carlweather's Cantata of Confrontation`);
  uneffect($effect`Ode to Booze`);

  acquireMP(150, 0);
  buffMaintain$2($effect`Jackasses' Symphony of Destruction`);
  buffMaintain$2($effect`Stevedave's Shanty of Superiority`);
  buffMaintain$2($effect`Seeing Colors`);
  buffMaintain$2($effect`Glittering Eyelashes`);
  buffMaintain$2($effect`OMG WTF`);
  buffMaintain$2($effect`There Is A Spoon`);
  buffMaintain$2($effect`Song of Sauce`);
  buffMaintain$2($effect`Carol of the Hells`);
  buffMaintain$2($effect`Sauce Monocle`);
  buffMaintain$2($effect`Arched Eyebrow of the Archmage`);
  buffMaintain$2($effect`Rosewater Mark`);
  buffMaintain$2($effect`Black Eyes`);
  buffMaintain$2($effect`Imported Strength`);
  buffMaintain$2($effect`Mystically Oiled`);
  buffMaintain$2($effect`Tomato Power`);
  //~ buffMaintain($effect[Visions of the Deep Dark Deeps]);
  // Maximizer tries to force familiar equipment. and prefers passive dmg a that. Avoid dealing damage from familiar and losing
  if (canChangeFamiliar()) {
    if (haveFamiliar($familiar`Magic Dragonfish`)) {
      useFamiliar($familiar`Magic Dragonfish`); // boosts spell damage
    } else {
      useFamiliar(lookupFamiliarDatafile("gremlins")); //delevel with no damage. fallback to none if unavailable
    }
    setProperty("auto_disableFamiliarChanging", true.toString());
  }
  if (myFamiliar() !== Familiar.none) {
    addToMaximize("-familiar");
    equip($slot`familiar`, Item.none);
    // Try just boosting weight
    for (const [, it] of auto_getListOfNonDamagingFamiliarEquipment()) {
      if (canEquip(myFamiliar(), it)) {
        equip($slot`familiar`, it);
        break;
      }
    }
  }

  if (auto_remainingCandyCaneSlashes() > 0) {
    addToMaximize(`+"equip ${$item`candy cane sword cane`}"`);
  }

  if (possessEquipment($item`big hot pepper`)) {
    addToMaximize(`+"equip ${$item`big hot pepper`}"`);
  }

  for (const lantern of $items`Congressional Medal of Insanity, petrified wood water purifier, petrified wood wizard's pouch`) {
    acquireOrPull(lantern);
    if (possessEquipment(lantern)) {
      addToMaximize(`+"equip ${lantern}"`);
      break; // we only need to pull one megalantern
    }
  }

  addToMaximize("100myst,60spell damage percent,20spell damage,-20ml");
  equipMaximizedGear();
  for (const s of $slots`acc1, acc2, acc3`) {
    if (equippedItem(s) === $item`Hand in Glove`) {
      equip(s, Item.none);
    }
  }

  function saucegeyserDamage(): number {
    const base: number = ceil(
      (numericModifier("Spell Damage Percent") / 100.0) *
        (60 +
          numericModifier("Spell Damage") +
          max(
            numericModifier("Hot Spell Damage"),
            numericModifier("Cold Spell Damage"),
          ) +
          0.4 * myBuffedstat($stat`Mysticality`)),
    );
    let lanterns: number = haveEquipped($item`big hot pepper`) ? 2.0 : 1.0;
    lanterns *= haveEquipped($item`Congressional Medal of Insanity`)
      ? 3.0
      : 1.0; // can be x3 or 4x, we need the minimum
    return MLDamageToMonsterMultiplier() * lanterns * base;
  }

  let wob_hp: number = $monster`wall of bones`.baseHp;
  let rounds: number = 4;
  // Candy cane slash quarters HP for one attack
  if (
    haveEquipped($item`candy cane sword cane`) &&
    auto_remainingCandyCaneSlashes() > 0
  ) {
    wob_hp /= 4;
    rounds--;
  }
  //Wall Of Bones combat uses Unleash The Greash, Garbage Nova, or Saucegeyser
  if (
    !auto_have_skill($skill`Garbage Nova`) &&
    haveEffect($effect`Takin' It Greasy`) === 0
  ) {
    const total_damage: number = saucegeyserDamage() * rounds * 3;
    auto_log_info$1(
      `Wall of bones will have ${wob_hp} hp with ${rounds} rounds to kill.\nSaucegeyser should do ${saucegeyserDamage()} per hit for ${total_damage}`,
    );
    if (total_damage < wob_hp) {
      // 3 is saucegeyser group size
      //counting on Saucegeyser and its damage will be too low
      auto_log_warning(
        "Estimate would fail to towerkill Wall of Bones. Reverting to Boning Knife",
        "red",
      );
      setProperty("auto_getBoningKnife", true.toString());
      return true;
    }
  }

  acquireMP(216, 0);
  acquireFullHP();
  autoAdvBypass$1(
    "place.php?whichplace=nstower&action=ns_07_monster3",
    $location`Noob Cave`,
  );
  if (internalQuestStatus("questL13Final") < 9) {
    auto_log_warning(
      "Failed to towerkill Wall of Bones. Reverting to Boning Knife",
      "red",
    );
    setProperty("auto_getBoningKnife", true.toString());
  }
  return true;
}

function L13_towerNSTowerMirror(): boolean {
  if (
    !containsText(visitUrl("place.php?whichplace=nstower"), "ns_08_monster4")
  ) {
    return false;
  }
  if (
    toLowerCase(getProperty("auto_towerBreak")) === "mirror" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 4"
  ) {
    abort("auto_towerBreak set to abort here.");
  }
  let confidence: boolean = toBoolean(getProperty("auto_confidence"));
  // confidence really just means take the first choice, so necessary in vampyre
  if (in_darkGyffte()) {
    confidence = true;
  }
  const choicenum: string = confidence ? "1" : "2";
  setProperty("choiceAdventure1015", choicenum);
  visitUrl("place.php?whichplace=nstower&action=ns_08_monster4");
  visitUrl(`choice.php?pwd=&whichchoice=1015&option=${choicenum}`, true);
  return true;
}

function L13_towerNSTowerShadow(): boolean {
  if (
    !containsText(visitUrl("place.php?whichplace=nstower"), "ns_09_monster5")
  ) {
    return false;
  }

  if (in_robot()) {
    abort(
      "Robot shadow not currently automated. Pleasae kill your shadow manually then run me again",
    );
  }

  if (
    toLowerCase(getProperty("auto_towerBreak")) === "shadow" ||
    toLowerCase(getProperty("auto_towerBreak")) === "the shadow" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 5"
  ) {
    abort("auto_towerBreak set to abort here.");
  }

  if (in_pokefam()) {
    // challenge shadow to pokefam battle
    autoAdvBypass$1(
      "place.php?whichplace=nstower&action=ns_09_monster5",
      $location`Noob Cave`,
    );
    return true;
  }

  let n_healing_items: number =
    itemAmount($item`gauze garter`) +
    itemAmount($item`filthy poultice`) +
    itemAmount($item`red pixel potion`) +
    itemAmount($item`scented massage oil`);
  if (in_plumber()) {
    n_healing_items = itemAmount($item`super deluxe mushroom`);
    if (n_healing_items < 5) {
      retrieveItem(5, $item`super deluxe mushroom`);
      n_healing_items = itemAmount($item`super deluxe mushroom`);
    }
  }
  if (n_healing_items < 5) {
    const pull_target: number = 5 - n_healing_items; //pull healing items if we have any pulls left because its not like we need pulls for anything else at this point
    const pulled_items: number = 0;
    for (const it of $items`gauze garter, filthy poultice, red pixel potion`) {
      pullXWhenHaveY(it, 1, itemAmount(it));
    }
    // If we're in Kingdom of Exploathing, there's no realm . Let's try clovering for massage oil instead
    if (in_koe()) {
      cloverUsageInit$1();
      autoAdv($location`Cobb's Knob Harem`);
      if (cloverUsageRestart()) {
        autoAdv($location`Cobb's Knob Harem`);
      }
      cloverUsageFinish();
    } else {
      const create_target: number = min(
        creatableAmount($item`red pixel potion`),
        pull_target - pulled_items,
      );
      if (create_target > 0) {
        if (create(create_target, $item`red pixel potion`)) {
          return true;
        }
        abort(
          "I tried to create [red pixel potions] for the shadow and mysteriously failed",
        );
      }
      return autoAdv($location`The Fungus Plains`);
    }
  }

  if (myMaxhp() < 800) {
    buffMaintain$2($effect`Industrial Strength Starch`);
    buffMaintain$2($effect`Truly Gritty`);
    buffMaintain$2($effect`Superheroic`);
    buffMaintain$2($effect`Strong Grip`);
    buffMaintain$2($effect`Spiky Hair`);
  }
  cliExecute("scripts/autoscend/auto_post_adv.js");
  if (!acquireFullHP()) {
    abort("Failed to restore max hp for shadow");
  }

  autoAdvBypass$1(
    "place.php?whichplace=nstower&action=ns_09_monster5",
    $location`Noob Cave`,
  );
  return true;
}

export function L13_towerNSFinal(): boolean {
  if (
    toLowerCase(getProperty("auto_towerBreak")) === "naughty sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "the naughty sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "ns" ||
    toLowerCase(getProperty("auto_towerBreak")) === "sorceress" ||
    toLowerCase(getProperty("auto_towerBreak")) === "level 6" ||
    toLowerCase(getProperty("auto_towerBreak")) === "chamber"
  ) {
    abort("auto_towerBreak set to abort here.");
  }
  //state 11 means ready to fight sorceress. state 12 means lost to her due to lack of wand thus unlocking bear verb orgy
  if (
    internalQuestStatus("questL13Final") < 11 ||
    internalQuestStatus("questL13Final") > 12
  ) {
    return false;
  }
  if (in_robot()) {
    abort(
      "Automatic killing of nautomatic sauceress not implemented. Please kill her manually",
    );
  }
  //wand acquisition function is called before this function, it turns this propery to false once a wand is acquired.
  //it is also false on all paths that don't want a wand. Thus if it is true it means we do want a wand but didn't get one yet.
  if (
    toBoolean(getProperty("auto_wandOfNagamar")) &&
    internalQuestStatus("questL13Final") === 11
  ) {
    auto_log_warning(
      "We do not have a Wand of Nagamar but appear to need one. We must lose to the Sausage first...",
      "red",
    );
  }

  if (in_heavyrains()) {
    return L13_heavyrains_towerFinal();
  }

  if (in_bhy()) {
    return L13_bhy_towerFinal();
  }

  if (in_theSource()) {
    acquireMP(200, 0);
  }

  if (!(
    isActuallyEd() ||
    is_boris() ||
    is_jarlsberg() ||
    is_pete() ||
    in_bhy() ||
    in_bugbear() ||
    in_theSource() ||
    in_wotsf() ||
    in_zombieSlayer() ||
    in_aosol()
  )) {
    //Only if the final boss does not unbuff us...
    cliExecute("scripts/autoscend/auto_post_adv.js");
  }

  if (myClass() === $class`Turtle Tamer`) {
    autoEquip($item`Ouija Board, Ouija Board`);
  }

  if (auto_can_equip($item`Oscus's garbage can lid`)) {
    pullXWhenHaveY($item`Oscus's garbage can lid`, 1, 0);
  }

  autoEquipToSlot($slot`off-hand`, $item`Oscus's garbage can lid`);

  handleFamiliar("boss");

  addToMaximize("10dr,3moxie,0.5da 1000max,-5ml,1.5hp,0item,0meat");
  autoEquipToSlot($slot`acc2`, $item`attorney's badge`);
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
  }
  // AMW buff
  if (in_amw()) {
    buffMaintain$2($effect`Stewing`, 0, 1, 10);
  }

  if (internalQuestStatus("questL13Final") < 13) {
    cliExecute("scripts/autoscend/auto_pre_adv.js");
    setProperty("auto_disableAdventureHandling", true.toString());
    autoAdvBypass$1(
      "place.php?whichplace=nstower&action=ns_10_sorcfight",
      $location`Noob Cave`,
    );
    if (haveEffect($effect`Beaten Up`) > 0) {
      auto_log_warning("Sorceress beat us up. Wahhh.", "red");
      setProperty("auto_disableAdventureHandling", false.toString());
      return true;
    }
    if (lastMonster() === $monster`Naughty Sorceress`) {
      autoAdv($location`Noob Cave`);
      if (haveEffect($effect`Beaten Up`) > 0) {
        auto_log_warning("Blobbage Sorceress beat us up. Wahhh.", "red");
        setProperty("auto_disableAdventureHandling", true.toString());
        return true;
      }
      autoAdv($location`Noob Cave`);
      if (haveEffect($effect`Beaten Up`) > 0) {
        if (getProperty("lastEncounter") === "The Naughty Sorceress (3)") {
          visitUrl("choice.php");
          if (lastChoice() === 1016) {
            runChoice(1);
            setProperty("auto_wandOfNagamar", true.toString());
          } else {
            abort("Expected to start Nagamar side-quest but unable to");
          }
          return true;
        }
        auto_log_warning("We got beat up by a sausage....", "red");
        setProperty("auto_disableAdventureHandling", false.toString());
        return true;
      }
      setProperty("auto_disableAdventureHandling", false.toString());
    }
  }
  // restore ML Safety Limit if this run changed it
  if (propertyExists("auto_MLSafetyLimitBackup")) {
    const MLSafetyLimitBackup: string = getProperty("auto_MLSafetyLimitBackup");
    if (MLSafetyLimitBackup === "empty") {
      setProperty("auto_MLSafetyLimit", "");
    } else {
      setProperty("auto_MLSafetyLimit", MLSafetyLimitBackup);
    }
    removeProperty("auto_MLSafetyLimitBackup");
  }
  // restore disregard karma if this run changed it
  if (propertyExists("auto_disregardInstantKarmaBackup")) {
    setProperty(
      "auto_disregardInstantKarma",
      getProperty("auto_disregardInstantKarmaBackup"),
    );
    removeProperty("auto_disregardInstantKarmaBackup");
  }

  if (auto_turbo()) {
    setProperty("auto_turbo", "false");
  }

  if (toBoolean(getProperty("auto_stayInRun"))) {
    abort("User wanted to stay in run (auto_stayInRun), we are done.");
  }

  if (
    myClass() === $class`Vampyre` &&
    0 < itemAmount($item`Thwaitgold mosquito statuette`)
  ) {
    abort(
      "Freeing the king will result in a path change. Enjoy your immortality.",
    );
  }

  if (
    myClass() === $class`Plumber` &&
    0 < itemAmount($item`Thwaitgold buzzy beetle statuette`)
  ) {
    abort(
      "Freeing the king will lose your extra stomach space. Enjoy the rest of your video game.",
    );
  }

  if (
    $classes`Pig Skinner, Cheese Wizard, Jazz Agent`.includes(myClass()) &&
    0 < itemAmount($item`Thwaitgold anti-moth statuette`)
  ) {
    visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
    return true;
  }

  if (in_lol()) {
    abort(
      "Freeing the king will result in losing all your replica IOTM. Enjoy them while you have them!",
    );
  }

  if (
    in_wereprof() &&
    0 < itemAmount($item`Thwaitgold wolf spider statuette`)
  ) {
    abort(
      "Freeing the king will result in a path change. Go howl at the moon some more if you want.",
    );
  }
  // It is possible to keep your Yearbook Club Camera in KOLHS by having it equipped before breaking the prism
  if (
    in_kolhs() &&
    !haveEquipped($item`Yearbook Club Camera`) &&
    itemAmount($item`Yearbook Club Camera`) > 0
  ) {
    equip($slot`acc3`, $item`Yearbook Club Camera`);
  }

  if (
    !$classes`Seal Clubber, Turtle Tamer, Pastamancer, Sauceror, Disco Bandit, Accordion Thief`.includes(
      myClass(),
    )
  ) {
    abort(
      "Freeing the king will result in a path change and we can barely handle The Sleazy Back Alley. Aborting, run the script again after selecting your aftercore path in order for it to clean up.",
    );
  }

  visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
  if (!inAftercore()) {
    abort(
      `Yeah, so, I'm done. You might be stuck at the shadow, or at the final boss, or just with a king in a prism. I don't know and quite frankly, after the last ${myDaycount()} days, I don't give a damn. That's right, I said it. Bitches.`,
    );
  }
  return true;
}

export function L13_towerNSNagamar(): boolean {
  // the first if check will skip getting a wand if autoscend configuration says we don't want one AND you are not on step12 of the quest
  // if you are on step12 it will override the configuration and proceed to get a wand anyways
  // quest step12 means you fought the sorceress and lost due to not having a wand.
  // autoscend only reaches step12 of the quest if autoscend was incapable of acquiring a wand before the sorceress
  // it then has to fallback to bear verb orgy, which itself cannot be done until step12
  if (in_koe()) {
    return L13_koe_towerNSNagamar();
  }
  if (
    !toBoolean(getProperty("auto_wandOfNagamar")) ||
    internalQuestStatus("questL13Final") < 11 ||
    internalQuestStatus("questL13Final") > 12
  ) {
    return false;
  }
  if (itemAmount($item`Wand of Nagamar`) > 0) {
    setProperty("auto_wandOfNagamar", false.toString());
    return false;
  }

  if (in_disguises() && internalQuestStatus("questL13Final") === 12) {
    cliExecute("refresh quests");
    if (internalQuestStatus("questL13Final") !== 12) {
      abort(
        "In this specific ascension [naughty sorceress (3)] is wearing a mask that makes kol base game fail to advance the quest to step 12. Which means that bear verb orgy is impossible for this specific run. Manually get the [Lucky!] effect then use it to get a [Wand of Nagamar] manually and run me again",
      );
    }
  }

  if (creatableAmount($item`Wand of Nagamar`) === 0 && pullsRemaining() > 0) {
    const haveW: boolean = itemAmount($item`ruby W`) !== 0;
    const haveA: boolean = itemAmount($item`metallic A`) !== 0;
    const haveN: boolean = itemAmount($item`lowercase N`) !== 0;
    const haveD: boolean = itemAmount($item`heavy D`) !== 0;
    if (!haveW || !haveA) {
      if (
        (haveN && haveD) ||
        itemAmount($item`ND`) > 0 ||
        pullsRemaining() > 1
      ) {
        //if no ND, need 2 pulls
        pullXWhenHaveY($item`WA`, 1, 0);
      }
    }
    if ((!haveN || !haveD) && ((haveA && haveW) || itemAmount($item`WA`) > 0)) {
      //if no WA, should not pull
      pullXWhenHaveY($item`ND`, 1, 0);
    }
  }

  if (creatableAmount($item`Wand of Nagamar`) > 0) {
    return create(1, $item`Wand of Nagamar`);
  }
  //hunt for bear verb orgy
  if (
    itemAmount($item`Wand of Nagamar`) === 0 &&
    internalQuestStatus("questL13Final") === 12 &&
    !in_koe()
  ) {
    return autoAdv($location`The VERY Unquiet Garves`);
  }

  if (
    autoLuckyAdv(
      $location`The Castle in the Clouds in the Sky (Basement)`,
      true,
    )
  ) {
    if (creatableAmount($item`Wand of Nagamar`) > 0) {
      return create(1, $item`Wand of Nagamar`);
    } else {
      auto_log_warning(
        "Clovering [The Castle in the Clouds in the Sky (Basement)] for wand parts failed for some reason",
        "red",
      );
    }
  }
  return false;
}

export function L13_towerAscent(): boolean {
  if (
    L13_towerNSContests() ||
    L13_towerNSHedge() ||
    L13_sorceressDoor() ||
    L13_towerNSTower() ||
    L13_towerNSNagamar() ||
    L13_towerNSFinal()
  ) {
    return true;
  }
  return false;
}
