import {
  abort,
  containsText,
  equippedItem,
  expectedDamage,
  getProperty,
  haveEffect,
  haveEquipped,
  indexOf,
  Item,
  itemAmount,
  Monster,
  monsterAttack,
  monsterDefense,
  monsterHp,
  monsterLevelAdjustment,
  mpCost,
  myAscensions,
  myBuffedstat,
  myDaycount,
  myHp,
  myLevel,
  myLocation,
  myMaxhp,
  myMaxmp,
  myMp,
  removeProperty,
  setProperty,
  Skill,
  substring,
  toBoolean,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  toLowerCase,
  toMonster,
  toSkill,
  weaponType,
} from "kolmafia";
import {
  $effect,
  $element,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $monsters,
  $phylum,
  $skill,
  $slot,
  $stat,
} from "libram";

import { possessEquipment } from "../auto_equipment";
import {
  auto_have_skill,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_wantToBanish,
  auto_wantToFreeRun,
  auto_wantToReplace,
  auto_wantToSniff,
  auto_wantToYellowRay,
  freeRunCombatString,
  handleTracker,
  handleTracker$1,
  instakillable,
  internalQuestStatus,
  isFreeMonster$1,
  isGhost,
  loopHandlerDelayAll,
} from "../auto_util";
import { elementalPlanes_access } from "../iotms/elementalPlanes";
import { auto_spoonCombatSkill } from "../iotms/mr2019";
import {
  auto_backupTarget,
  auto_fireExtinguisherCharges,
  auto_FireExtinguisherCombatString,
} from "../iotms/mr2021";
import { auto_bowlingBallCombatString } from "../iotms/mr2022";
import { dartELRcd, dartSkill } from "../iotms/mr2024";
import { ed_needShop, isActuallyEd } from "../paths/actually_ed_the_undying";
import { cyrptEvilBonus } from "../quests/level_07";
import { fastenerCount, lumberCount } from "../quests/level_09";
import {
  banisherCombatString$1,
  canSurvive$1,
  canUse$1,
  canUse$2,
  canUse$3,
  canUse$4,
  combat_status_add,
  combat_status_check,
  getStunner,
  markAsUsed,
  replaceMonsterCombatString,
  usedCount,
  useItem,
  useItem$1,
  useItems$1,
  useSkill$1,
  useSkill$2,
  wantToForceDrop,
  yellowRayCombatString,
} from "./auto_combat_util";

//Path specific combat handling for Actually Ed the Undying

//defined in /autoscend/combat/auto_combat_ed.ash
export function auto_edCombatHandler(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  if (!isActuallyEd()) {
    abort(
      "Not in Actually Ed the Undying, this combat filter will result in massive suckage.",
    );
  }

  if (round_1 === 0) {
    removeProperty("_auto_combatState");
    if (toInt(getProperty("_edDefeats")) === 0) {
      setProperty(
        "auto_edCombatCount",
        (1 + toInt(getProperty("auto_edCombatCount"))).toString(),
      );
    }
    if (!ed_needShop()) {
      setProperty("auto_edStatus", "dying"); // dying means kill the monster
    } else {
      setProperty("auto_edStatus", "UNDYING!"); //  Undying means ressurect until it's not free any more
    }
    //log some important info.
    //some stuff is redundant to the pre_adventure function print_footer() so it will not be logged here
    auto_log_info(
      `auto_combat initialized fighting [${enemy}]: atk = ${monsterAttack()}. def = ${monsterDefense()}. HP = ${monsterHp()}. LA = ${monsterLevelAdjustment()}`,
      "blue",
    );
  } else {
    setProperty("auto_combatHP", myHp().toString());
  }

  setProperty(
    "auto_edCombatRoundCount",
    (1 + toInt(getProperty("auto_edCombatRoundCount"))).toString(),
  );

  if (
    $locations`The Hippy Camp, The Outskirts of Cobb's Knob, The Spooky Forest`.includes(
      myLocation(),
    )
  ) {
    if (
      myMp() < mpCost($skill`Fist of the Mummy`) &&
      toInt(getProperty("_edDefeats")) < 2
    ) {
      for (const it of $items`holy spring water, spirit beer, sacramental wine`) {
        if (canUse$4(it)) {
          return useItem(it, false);
        }
      }
    }
  }

  if (toInt(getProperty("_edDefeats")) >= 2) {
    setProperty("auto_edStatus", "dying");
  }

  if (round_1 > 60) {
    abort("Somehow got to 60 rounds.... aborting");
  }

  if ($monsters`LOV Enforcer, LOV Engineer, LOV Equivocator`.includes(enemy)) {
    setProperty("auto_edStatus", "dying");
  }

  if (
    auto_backupTarget() &&
    enemy !== toMonster(getProperty("lastCopyableMonster")) &&
    canUse$2($skill`Back-Up to your Last Enemy`)
  ) {
    handleTracker$1(
      enemy.toString(),
      $skill`Back-Up to your Last Enemy`.toString(),
      "auto_replaces",
    );
    handleTracker$1(
      toMonster(getProperty("lastCopyableMonster")).toString(),
      $skill`Back-Up to your Last Enemy`.toString(),
      "auto_copies",
    );
    return useSkill$2($skill`Back-Up to your Last Enemy`);
  }

  if (haveEffect($effect`Temporary Amnesia`) > 0) {
    return "attack with weapon";
  }

  if (canUse$2($skill`Pocket Crumbs`)) {
    return useSkill$2($skill`Pocket Crumbs`);
  }

  if (canUse$2($skill`Micrometeorite`)) {
    return useSkill$2($skill`Micrometeorite`);
  }

  if (canUse$2($skill`Air Dirty Laundry`)) {
    return useSkill$2($skill`Air Dirty Laundry`);
  }

  if (canUse$2($skill`Summon Love Scarabs`)) {
    return useSkill$2($skill`Summon Love Scarabs`);
  }

  if (canUse$4($item`Time-Spinner`)) {
    return useItem$1($item`Time-Spinner`);
  }

  if (canUse$2($skill`Sing Along`)) {
    //ed can easily survive singing along thanks to undying. and healing him is essentially free.
    if (
      getProperty("boomBoxSong") === "Remainin' Alive" ||
      (getProperty("boomBoxSong") === "Total Eclipse of Your Meat" &&
        canSurvive$1(2.0))
    ) {
      return useSkill$2($skill`Sing Along`);
    }
  }
  //iotm back item and the enemies it spawns (free fights) can be killed using special skills to get extra XP and item drops
  if (
    haveEquipped($item`protonic accelerator pack`) &&
    isGhost(enemy) &&
    !combat_status_check("skipGhostbusting")
  ) {
    //shoot ghost 3 times provoking retaliation, then trap ghost skill unlocks which instawins combat.
    const stunner: Skill = getStunner(enemy);
    if (stunner !== Skill.none) {
      combat_status_add("stunned");
      return useSkill$2(stunner);
    }
    //shots_takens tracks how many times we used [shoot ghost] skill this combat. it is reset in combat initialize
    const shots_takens: number = usedCount($skill`Shoot Ghost`);
    if (canUse$1($skill`Shoot Ghost`, false) && shots_takens < 3) {
      const survive_needed: number = 3.05 - toFloat(shots_takens);
      if (canSurvive$1(survive_needed)) {
        markAsUsed($skill`Shoot Ghost`); //needs to be manually done for skills with a use limit that is not 1
        return useSkill$1($skill`Shoot Ghost`, false);
      } else {
        combat_status_add("skipGhostbusting");
      }
    }

    if (canUse$2($skill`Trap Ghost`) && shots_takens === 3) {
      auto_log_info("Busting makes me feel good!!", "green");
      return useSkill$2($skill`Trap Ghost`);
    }
  }
  //use industrial fire extinguisher zone specific skills
  const extinguisherSkill: string =
    auto_FireExtinguisherCombatString(myLocation());
  if (
    extinguisherSkill !== "" &&
    haveEquipped($item`industrial fire extinguisher`)
  ) {
    handleTracker$1(
      enemy.toString(),
      toSkill(substring(extinguisherSkill, 6)).toString(),
      "auto_otherstuff",
    );
    return extinguisherSkill;
  }
  // Instakill handler
  let doInstaKill: boolean = true;
  if ($monsters`lobsterfrogman`.includes(enemy)) {
    if (
      auto_have_skill($skill`Digitize`) &&
      getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString()
    ) {
      doInstaKill = false;
    }
  }

  if (getProperty("auto_edStatus") === "UNDYING!") {
    if (canUse$2($skill`Summon Love Gnats`)) {
      return useSkill$2($skill`Summon Love Gnats`);
    }
  } else if (getProperty("auto_edStatus") === "dying") {
    let doStunner: boolean = true;

    if (monsterLevelAdjustment() > 50 && canSurvive$1(1.15)) {
      doStunner = false;
    }

    if (doStunner) {
      if (canUse$2($skill`Summon Love Gnats`)) {
        return useSkill$2($skill`Summon Love Gnats`);
      }
    }
  } else {
    auto_log_warning("Ed combat state does not exist, winging it....", "red");
  }

  if (canUse$2($skill`Fire Sewage Pistol`)) {
    return useSkill$2($skill`Fire Sewage Pistol`);
  }

  if (enemy === $monster`Protagonist`) {
    setProperty("auto_edStatus", "dying");
  }

  if (
    myLocation() !== $location`The Battlefield (Frat Uniform)` &&
    myLocation() !== $location`The Battlefield (Hippy Uniform)` &&
    !toBoolean(getProperty("auto_ignoreFlyer"))
  ) {
    if (
      canUse$4($item`rock band flyers`) &&
      toInt(getProperty("flyeredML")) < 10000
    ) {
      if (
        toInt(getProperty("_edDefeats")) < 2 &&
        getProperty("auto_edStatus") === "dying"
      ) {
        setProperty("auto_edStatus", "UNDYING!");
        // abuse the ability to flyer the same monster multiple times (optimal!)
      }
      return useItem$1($item`rock band flyers`);
    }
    if (
      canUse$4($item`jam band flyers`) &&
      toInt(getProperty("flyeredML")) < 10000
    ) {
      if (
        toInt(getProperty("_edDefeats")) < 2 &&
        getProperty("auto_edStatus") === "dying"
      ) {
        setProperty("auto_edStatus", "UNDYING!");
        // abuse the ability to flyer the same monster multiple times (optimal!)
      }
      return useItem$1($item`jam band flyers`);
    }
  }

  if (
    canUse$4($item`chaos butterfly`) &&
    !toBoolean(getProperty("chaosButterflyThrown")) &&
    !toBoolean(getProperty("auto_skipL12Farm"))
  ) {
    return useItem$1($item`chaos butterfly`);
  }

  if (
    enemy === $monster`dirty thieving brigand` &&
    canUse$2($skill`Curse of Fortune`)
  ) {
    if (itemAmount($item`Ka coin`) > 0 && myHp() > expectedDamage() + 15) {
      // need to kill the monster without resurrecting to get the bonus meat drop so only use it if we have enough HP to survive a hit
      setProperty("auto_edStatus", "dying");
      return useSkill$2($skill`Curse of Fortune`);
    } else if (
      toInt(getProperty("_edDefeats")) === 0 &&
      myMaxhp() > expectedDamage() + 15
    ) {
      // suicide to get a full heal, maybe we can Curse and kill after resurrection
      setProperty("auto_edStatus", "UNDYING!");
    }
  }

  if (
    canUse$2($skill`Curse of Stench`) &&
    toMonster(getProperty("stenchCursedMonster")) !== enemy &&
    toInt(getProperty("_edDefeats")) < 3
  ) {
    if (auto_wantToSniff(enemy, myLocation())) {
      handleTracker$1(
        enemy.toString(),
        $skill`Curse of Stench`.toString(),
        "auto_sniffs",
      );
      return useSkill$2($skill`Curse of Stench`);
    }
  }

  if (myLocation() === $location`The Secret Council Warehouse`) {
    if (
      canUse$2($skill`Curse of Stench`) &&
      toMonster(getProperty("stenchCursedMonster")) !== enemy &&
      toInt(getProperty("_edDefeats")) < 3
    ) {
      let doStench: boolean = false;
      //	Rememeber, we are looking to see if we have enough of the opposite item here.
      if (enemy === $monster`warehouse guard`) {
        let progress: number = toInt(getProperty("warehouseProgress"));
        progress = progress + 8 * itemAmount($item`warehouse inventory page`);
        if (progress >= 50) {
          doStench = true;
        }
      }

      if (enemy === $monster`warehouse clerk`) {
        let progress: number = toInt(getProperty("warehouseProgress"));
        progress = progress + 8 * itemAmount($item`warehouse map page`);
        if (progress >= 50) {
          doStench = true;
        }
      }
      if (doStench) {
        handleTracker$1(
          enemy.toString(),
          $skill`Curse of Stench`.toString(),
          "auto_sniffs",
        );
        return useSkill$2($skill`Curse of Stench`);
      }
    }
  }

  if (myLocation() === $location`The Smut Orc Logging Camp`) {
    if (
      canUse$2($skill`Curse of Stench`) &&
      toMonster(getProperty("stenchCursedMonster")) !== enemy &&
      toInt(getProperty("_edDefeats")) < 3
    ) {
      let doStench: boolean = false;
      const stenched: string = toLowerCase(getProperty("stenchCursedMonster"));

      if (
        fastenerCount() >= 30 &&
        stenched !== "smut orc pipelayer" &&
        stenched !== "smut orc jacker"
      ) {
        //	Sniff 100% lumber
        if (
          enemy === $monster`smut orc pipelayer` ||
          enemy === $monster`smut orc jacker`
        ) {
          doStench = true;
        }
      }
      if (
        lumberCount() >= 30 &&
        stenched !== "smut orc screwer" &&
        stenched !== "smut orc nailer"
      ) {
        //	Sniff 100% fastener
        if (
          enemy === $monster`smut orc screwer` ||
          enemy === $monster`smut orc nailer`
        ) {
          doStench = true;
        }
      }

      if (doStench) {
        handleTracker$1(
          enemy.toString(),
          $skill`Curse of Stench`.toString(),
          "auto_sniffs",
        );
        return useSkill$2($skill`Curse of Stench`);
      }
    }
  }
  //yellowray instantly kills the enemy and makes them drop all items they can drop.
  if (
    !combat_status_check("yellowray") &&
    auto_wantToYellowRay(enemy, myLocation())
  ) {
    const combatAction: string = yellowRayCombatString(
      enemy,
      true,
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
        enemy,
      ),
    );
    if (combatAction !== "") {
      combat_status_add("yellowray");
      if (indexOf(combatAction, "skill") === 0) {
        handleTracker$1(
          enemy.toString(),
          toSkill(substring(combatAction, 6)).toString(),
          "auto_yellowRays",
        );
      } else if (indexOf(combatAction, "item") === 0) {
        handleTracker$1(
          enemy.toString(),
          toItem(substring(combatAction, 5)).toString(),
          "auto_yellowRays",
        );
      } else {
        auto_log_warning(
          `Unable to track yellow ray behavior: ${combatAction}`,
          "red",
        );
      }
      if (
        combatAction ===
        useSkill$1($skill`Asdon Martin: Missile Launcher`, false)
      ) {
        setProperty("_missileLauncherUsed", true.toString());
      }
      return combatAction;
    } else {
      auto_log_warning("Wanted a yellow ray but we can not find one.", "red");
    }
  }

  if (
    !combat_status_check("banishercheck") &&
    auto_wantToBanish(enemy, myLocation())
  ) {
    const banishAction: string = banisherCombatString$1(
      enemy,
      myLocation(),
      true,
    );
    if (banishAction !== "") {
      auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
      combat_status_add("banisher");
      if (indexOf(banishAction, "skill") === 0) {
        handleTracker$1(
          enemy.toString(),
          toSkill(substring(banishAction, 6)).toString(),
          "auto_banishes",
        );
      } else if (indexOf(banishAction, "item") === 0) {
        if (containsText(banishAction, ", none")) {
          const commapos: number = indexOf(banishAction, ", none");
          handleTracker$1(
            enemy.toString(),
            toItem(substring(banishAction, 5, commapos)).toString(),
            "auto_banishes",
          );
        } else {
          handleTracker$1(
            enemy.toString(),
            toItem(substring(banishAction, 5)).toString(),
            "auto_banishes",
          );
        }
      } else {
        auto_log_warning(
          `Unable to track banisher behavior: ${banishAction}`,
          "red",
        );
      }
      return banishAction;
    }
    //we wanted to banish an enemy and failed. set a property so we do not bother trying in subsequent rounds
    combat_status_add("banishercheck");
  }
  // Free run from monsters we want to banish but are unable to, or monsters on the free run list
  if (
    !combat_status_check("freeruncheck") &&
    (auto_wantToFreeRun(enemy, myLocation()) ||
      auto_wantToBanish(enemy, myLocation()))
  ) {
    let freeRunAction: string = freeRunCombatString(enemy, myLocation(), true);
    if (freeRunAction !== "") {
      if (indexOf(freeRunAction, "runaway familiar") === 0) {
        handleTracker$1(
          enemy.toString(),
          toFamiliar(substring(freeRunAction, 17)).toString(),
          "auto_freeruns",
        );
        freeRunAction = "runaway";
      } else if (indexOf(freeRunAction, "runaway item") === 0) {
        handleTracker$1(
          enemy.toString(),
          toItem(substring(freeRunAction, 13)).toString(),
          "auto_freeruns",
        );
        freeRunAction = "runaway";
      } else if (indexOf(freeRunAction, "skill") === 0) {
        handleTracker$1(
          enemy.toString(),
          toSkill(substring(freeRunAction, 6)).toString(),
          "auto_freeruns",
        );
      } else if (indexOf(freeRunAction, "item") === 0) {
        if (containsText(freeRunAction, ", none")) {
          const commapos: number = indexOf(freeRunAction, ", none");
          handleTracker$1(
            enemy.toString(),
            toItem(substring(freeRunAction, 5, commapos)).toString(),
            "auto_freeruns",
          );
        } else {
          handleTracker$1(
            enemy.toString(),
            toItem(substring(freeRunAction, 5)).toString(),
            "auto_freeruns",
          );
        }
      } else {
        auto_log_warning(
          `Unable to track runaway behavior: ${freeRunAction}`,
          "red",
        );
      }
      return freeRunAction;
    }
    //we wanted to free run an enemy and failed. set a property so we do not bother trying in subsequent rounds
    combat_status_add("freeruncheck");
  }

  if (
    !combat_status_check("replacercheck") &&
    auto_wantToReplace(enemy, myLocation())
  ) {
    const combatAction: string = replaceMonsterCombatString(enemy, true);
    if (combatAction !== "") {
      combat_status_add("replacer");
      if (indexOf(combatAction, "skill") === 0) {
        if (
          toSkill(substring(combatAction, 6)) ===
          $skill`CHEAT CODE: Replace Enemy`
        ) {
          handleTracker(
            $skill`CHEAT CODE: Replace Enemy`.toString(),
            "auto_powerfulglove",
          );
        }
        handleTracker$1(
          enemy.toString(),
          toSkill(substring(combatAction, 6)).toString(),
          "auto_replaces",
        );
      } else if (indexOf(combatAction, "item") === 0) {
        handleTracker$1(
          enemy.toString(),
          toItem(substring(combatAction, 5)).toString(),
          "auto_replaces",
        );
      } else {
        auto_log_warning(
          `Unable to track replacer behavior: ${combatAction}`,
          "red",
        );
      }
      return combatAction;
    } else {
      auto_log_warning("Wanted a replacer but we can not find one.", "red");
    }
    combat_status_add("replacercheck");
  }

  if (
    canUse$4($item`disposable instant camera`) &&
    $monsters`Bob Racecar, Racecar Bob`.includes(enemy)
  ) {
    return useItem$1($item`disposable instant camera`);
  }

  if (
    myLocation() === $location`Oil Peak` &&
    canUse$4($item`Duskwalker syringe`)
  ) {
    const oilProgress: number = toInt(getProperty("twinPeakProgress"));
    let wantCrude: boolean = (oilProgress & 4) === 0;
    if (
      itemAmount($item`bubblin' crude`) > 11 ||
      itemAmount($item`jar of oil`) > 0
    ) {
      wantCrude = false;
    }

    if (wantCrude) {
      return useItem$1($item`Duskwalker syringe`);
    }
  }

  if (
    canUse$4($item`glark cable`) &&
    myLocation() === $location`The Red Zeppelin` &&
    internalQuestStatus("questL11Ron") === 3 &&
    toInt(getProperty("_glarkCableUses")) < 5 &&
    getProperty("auto_edStatus") === "dying"
  ) {
    if (
      $monsters`man with the red buttons, red butler, Red Fox, red skeleton`.includes(
        enemy,
      )
    ) {
      return useItem$1($item`glark cable`);
      // free insta-kill (optimal!)
    }
  }

  if (
    !toBoolean(getProperty("edUsedLash")) &&
    canUse$2($skill`Lash of the Cobra`) &&
    toInt(getProperty("_edLashCount")) < 30
  ) {
    let doLash: boolean = false;
    if (enemy === $monster`shadow slab`) {
      doLash = true;
    }
    if (
      enemy === $monster`Big Wheelin' Twins` &&
      !possessEquipment($item`badge of authority`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`fishy pirate` &&
      !possessEquipment($item`perfume-soaked bandana`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`funky pirate` &&
      !possessEquipment($item`sewage-clogged pistol`) &&
      elementalPlanes_access($element`spooky`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`garbage tourist` &&
      itemAmount($item`bag of park garbage`) === 0
    ) {
      doLash = true;
    }
    if (enemy === $monster`dairy goat` && itemAmount($item`goat cheese`) < 3) {
      doLash = true;
    }
    if (
      enemy === $monster`monstrous boiler` &&
      itemAmount($item`red-hot boilermaker`) < 1 &&
      toInt(getProperty("booPeakProgress")) > 0
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`Fitness Giant` &&
      itemAmount($item`pec oil`) < 1 &&
      toInt(getProperty("booPeakProgress")) > 0
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`Renaissance Giant` &&
      itemAmount($item`Ye Olde Meade`) < 1
    ) {
      doLash = true;
    }
    if (
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
        enemy,
      )
    ) {
      doLash = true;
    }
    if ($monsters`beanbat, bookbat`.includes(enemy)) {
      doLash = true;
    }
    if (
      (enemy === $monster`toothy sklelton` ||
        enemy === $monster`spiny skelelton`) &&
      toInt(getProperty("cyrptNookEvilness")) > 14 + cyrptEvilBonus(true)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`oil baron` &&
      itemAmount($item`bubblin' crude`) < 12 &&
      itemAmount($item`jar of oil`) === 0
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`blackberry bush` &&
      itemAmount($item`blackberry`) < 3 &&
      !possessEquipment($item`blackberry galoshes`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`pygmy bowler` &&
      toInt(getProperty("_edLashCount")) < 26
    ) {
      doLash = true;
    }
    if (
      $monsters`filthworm drone, filthworm royal guard, larval filthworm`.includes(
        enemy,
      )
    ) {
      doLash = true;
    }
    if (enemy === $monster`Knob Goblin Madam`) {
      if (itemAmount($item`Knob Goblin perfume`) === 0) {
        doLash = true;
      }
    }
    if (enemy === $monster`Knob Goblin Harem Girl`) {
      if (
        !possessEquipment($item`Knob Goblin harem veil`) ||
        !possessEquipment($item`Knob Goblin harem pants`)
      ) {
        doLash = true;
      }
    }
    if (
      (myLocation() === $location`The Hippy Camp` ||
        myLocation() === $location`Wartime Hippy Camp`) &&
      containsText(enemy.toString(), "hippy") &&
      myLevel() >= 12
    ) {
      if (
        !possessEquipment($item`filthy knitted dread sack`) ||
        !possessEquipment($item`filthy corduroys`)
      ) {
        if (getProperty("auto_edStatus") !== "dying") {
          doLash = true;
        }
      }
    }
    if (myLocation() === $location`Wartime Frat House`) {
      if (
        !possessEquipment($item`beer helmet`) ||
        !possessEquipment($item`bejeweled pledge pin`) ||
        !possessEquipment($item`distressed denim pants`)
      ) {
        doLash = true;
      }
    }
    if (
      enemy === $monster`dopey 7-Foot Dwarf` &&
      !possessEquipment($item`miner's helmet`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`grumpy 7-Foot Dwarf` &&
      !possessEquipment($item`7-Foot Dwarven mattock`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`sleepy 7-Foot Dwarf` &&
      !possessEquipment($item`miner's pants`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`Burly Sidekick` &&
      !possessEquipment($item`Mohawk wig`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`Spunky Princess` &&
      !possessEquipment($item`titanium assault umbrella`) &&
      !possessEquipment($item`unbreakable umbrella`)
    ) {
      doLash = true;
    }
    if (
      enemy === $monster`Quiet Healer` &&
      !possessEquipment($item`amulet of extreme plot significance`)
    ) {
      doLash = true;
    }
    if (enemy === $monster`warehouse clerk`) {
      let progress: number = toInt(getProperty("warehouseProgress"));
      progress = progress + 8 * itemAmount($item`warehouse inventory page`);
      if (progress < 50) {
        doLash = true;
      }
    }
    if (enemy === $monster`warehouse guard`) {
      let progress: number = toInt(getProperty("warehouseProgress"));
      progress = progress + 8 * itemAmount($item`warehouse map page`);
      if (progress < 50) {
        doLash = true;
      }
    }
    if (
      enemy === $monster`Copperhead Club bartender` &&
      internalQuestStatus("questL11Ron") < 2
    ) {
      doLash = true;
    }

    if (doLash) {
      handleTracker(enemy.toString(), "auto_lashes");
      return useSkill$2($skill`Lash of the Cobra`);
    }
  }

  if (
    !combat_status_check("talismanofrenenutet") &&
    canUse$4($item`talisman of Renenutet`)
  ) {
    let doRenenutet: boolean = false;
    if (
      enemy === $monster`cabinet of Dr. Limpieza` &&
      $location`The Haunted Laundry Room`.turnsSpent > 2
    ) {
      doRenenutet = true;
    }
    if (
      enemy === $monster`possessed wine rack` &&
      $location`The Haunted Wine Cellar`.turnsSpent > 2
    ) {
      doRenenutet = true;
    }
    if (
      enemy === $monster`Baa'baa'bu'ran` &&
      itemAmount($item`stone wool`) < 2
    ) {
      doRenenutet = true;
    }
    if (
      $monsters`mountain man, warehouse clerk, warehouse guard, waiter dressed as a ninja, ninja dressed as a waiter`.includes(
        enemy,
      )
    ) {
      doRenenutet = true;
    }
    if (
      enemy === $monster`Quiet Healer` &&
      !possessEquipment($item`amulet of extreme plot significance`)
    ) {
      doRenenutet = true;
    }
    if (
      enemy === $monster`pygmy janitor` &&
      itemAmount($item`book of matches`) === 0 &&
      toInt(getProperty("hiddenTavernUnlock")) !== myAscensions()
    ) {
      doRenenutet = true;
    }
    if (enemy === $monster`blackberry bush`) {
      if (
        !possessEquipment($item`blackberry galoshes`) &&
        itemAmount($item`blackberry`) < 3
      ) {
        doRenenutet = true;
      }
    }
    if (myLocation() === $location`Wartime Frat House`) {
      if (
        !possessEquipment($item`beer helmet`) ||
        !possessEquipment($item`bejeweled pledge pin`) ||
        !possessEquipment($item`distressed denim pants`)
      ) {
        doRenenutet = true;
      }
    }
    if (
      $monsters`Battlie Knight Ghost, Claybender Sorcerer Ghost, Dusken Raider Ghost, Space Tourist Explorer Ghost, Whatsian Commando Ghost`.includes(
        enemy,
      )
    ) {
      if (
        itemAmount($item`A-Boo clue`) <
        toInt(getProperty("booPeakProgress")) / 30
      ) {
        doRenenutet = true;
      }
    }
    if ($monsters`toothy sklelton, spiny skelelton`.includes(enemy)) {
      if (
        myLocation() === $location`The Defiled Nook` &&
        itemAmount($item`evil eye`) === 0
      ) {
        // lash didn't get it)
        doRenenutet = true;
      }
    }
    if (
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
        enemy,
      )
    ) {
      if (itemAmount($item`rusty hedge trimmers`) === 0) {
        // lash didn't get it
        doRenenutet = true;
      }
    }
    if ($monsters`Blue Oyster cultist`.includes(enemy)) {
      doRenenutet = true;
    }
    if (doRenenutet) {
      if (
        !combat_status_check("curseofindecision") &&
        canUse$2($skill`Curse of Indecision`)
      ) {
        combat_status_add("curseofindecision");
        return useSkill$2($skill`Curse of Indecision`);
      }
      combat_status_add("talismanofrenenutet");
      handleTracker(enemy.toString(), "auto_renenutet");
      setProperty("auto_edStatus", "dying");
      return useItem$1($item`talisman of Renenutet`);
    }
  }

  if (
    canUse$4($item`cigarette lighter`) &&
    myLocation() === $location`A Mob of Zeppelin Protesters` &&
    internalQuestStatus("questL11Ron") === 1 &&
    getProperty("auto_edStatus") === "dying"
  ) {
    return useItem$1($item`cigarette lighter`);
    // insta-kills protestors and removes an additional 5-7 (optimal!)
  }

  if (
    enemy === $monster`pygmy orderlies` &&
    canUse$3($item`short writ of habeas corpus`, false) &&
    haveEffect($effect`Everything Looks Green`) === 0
  ) {
    return useItem$1($item`short writ of habeas corpus`);
  }

  if (
    canUse$2($skill`Darts: Aim for the Bullseye`) &&
    haveEffect($effect`Everything Looks Red`) === 0 &&
    dartELRcd() <= 40
  ) {
    setProperty("auto_instakillSource", "darts bullseye");
    setProperty("auto_instakillSuccess", true.toString());
    loopHandlerDelayAll();
    return useSkill$2($skill`Darts: Aim for the Bullseye`);
  }
  // use cosmic bowling ball iotm
  if (auto_bowlingBallCombatString(myLocation(), true) !== "" && !enemy.boss) {
    return auto_bowlingBallCombatString(myLocation(), false);
  }
  // prep avalanche if requested
  if (
    canUse$2($skill`McHugeLarge Avalanche`) &&
    getProperty("auto_forceNonCombatSource") === "McHugeLarge left ski" &&
    !toBoolean(getProperty("auto_avalancheDeployed"))
  ) {
    setProperty("auto_avalancheDeployed", true.toString());
    return useSkill$2($skill`McHugeLarge Avalanche`);
  }
  // prep parka NC forcing if requested
  if (
    canUse$2($skill`Launch spikolodon spikes`) &&
    getProperty("auto_forceNonCombatSource") === "jurassic parka" &&
    !toBoolean(getProperty("auto_parkaSpikesDeployed"))
  ) {
    setProperty("auto_parkaSpikesDeployed", true.toString());
    return useSkill$2($skill`Launch spikolodon spikes`);
  }

  if (
    instakillable(enemy) &&
    !isFreeMonster$1(enemy, myLocation()) &&
    doInstaKill
  ) {
    if (
      !combat_status_check("batoomerang") &&
      itemAmount($item`replica bat-oomerang`) > 0
    ) {
      if (toInt(getProperty("auto_batoomerangDay")) !== myDaycount()) {
        setProperty("auto_batoomerangDay", myDaycount().toString());
        setProperty("auto_batoomerangUse", (0).toString());
      }
      if (toInt(getProperty("auto_batoomerangUse")) < 3) {
        setProperty(
          "auto_batoomerangUse",
          (toInt(getProperty("auto_batoomerangUse")) + 1).toString(),
        );
        combat_status_add("batoomerang");
        handleTracker$1(
          enemy.toString(),
          $item`replica bat-oomerang`.toString(),
          "auto_instakill",
        );
        loopHandlerDelayAll();
        return `item ${$item`replica bat-oomerang`}`;
      }
    }

    if (
      canUse$4($item`shadow brick`) &&
      toInt(getProperty("_shadowBricksUsed")) < 13
    ) {
      handleTracker$1(
        enemy.toString(),
        $item`shadow brick`.toString(),
        "auto_instakill",
      );
      loopHandlerDelayAll();
      return useItems$1($item`shadow brick`, Item.none);
    }

    if (
      !combat_status_check("jokesterGun") &&
      equippedItem($slot`weapon`) === $item`The Jokester's gun` &&
      !toBoolean(getProperty("_firedJokestersGun")) &&
      auto_have_skill($skill`Fire the Jokester's Gun`)
    ) {
      combat_status_add("jokesterGun");
      handleTracker$1(
        enemy.toString(),
        $skill`Fire the Jokester's Gun`.toString(),
        "auto_instakill",
      );
      loopHandlerDelayAll();
      return `skill${$skill`Fire the Jokester's Gun`}`;
    }

    if (canUse$2($skill`Slay the Dead`) && enemy.phylum === $phylum`undead`) {
      // instakills Undead and reduces evilness in Cyrpt zones.
      return useSkill$2($skill`Slay the Dead`);
    }
  }

  if (getProperty("auto_edStatus") === "UNDYING!") {
    // We're taking a trip to the underworld. Either we want to abuse resurrection or we want to go shopping
    if (myLocation() === $location`The Secret Government Laboratory`) {
      if (
        itemAmount($item`rock band flyers`) === 0 &&
        itemAmount($item`jam band flyers`) === 0
      ) {
        if (
          !combat_status_check("love stinkbug") &&
          toBoolean(getProperty("lovebugsUnlocked"))
        ) {
          combat_status_add("love stinkbug2");
          return `skill ${$skill`Summon Love Stinkbug`}`;
        }
      }
    }

    if (canUse$3($item`seal tooth`, false)) {
      return "use Seal Tooth; repeat; ";
    }

    return "skill Mild Curse; repeat; ";
  }
  //Everfull Dart Holder
  if (
    haveEquipped($item`Everfull Dart Holster`) &&
    toInt(getProperty("_dartsLeft")) > 0
  ) {
    return useSkill$1(dartSkill(), false);
  }
  // Don't risk drop forcing if we've already been beaten up twice
  if (toInt(getProperty("_edDefeats")) < 2) {
    if (wantToForceDrop(enemy)) {
      const polarVortexAvailable: boolean =
        canUse$1($skill`Fire Extinguisher: Polar Vortex`, false) &&
        auto_fireExtinguisherCharges() > 10;
      const mildEvilAvailable: boolean =
        canUse$1($skill`Perpetrate Mild Evil`, false) &&
        toInt(getProperty("_mildEvilPerpetrated")) < 3;
      // mild evil only can pick pocket. Use it before fire extinguisher
      if (mildEvilAvailable) {
        handleTracker$1(
          enemy.toString(),
          $skill`Perpetrate Mild Evil`.toString(),
          "auto_otherstuff",
        );
        return useSkill$2($skill`Perpetrate Mild Evil`);
      }
      if (polarVortexAvailable) {
        handleTracker$1(
          enemy.toString(),
          $skill`Fire Extinguisher: Polar Vortex`.toString(),
          "auto_otherstuff",
        );
        return useSkill$2($skill`Fire Extinguisher: Polar Vortex`);
      }
    }
  }
  // Actually killing stuff starts here
  if (canUse$2(auto_spoonCombatSkill())) {
    return useSkill$2(auto_spoonCombatSkill());
  }

  if (
    myLocation() === $location`The Secret Government Laboratory` &&
    canUse$1($skill`Roar of the Lion`, false)
  ) {
    if (
      canUse$1($skill`Storm of the Scarab`, false) &&
      myBuffedstat($stat`Mysticality`) >= 60
    ) {
      return useSkill$1($skill`Storm of the Scarab`, false);
    }
    return useSkill$1($skill`Roar of the Lion`, false);
  }

  if (
    $locations`Pirates of the Garbage Barges, The SMOOCH Army HQ, VYKEA`.includes(
      myLocation(),
    ) &&
    canUse$1($skill`Storm of the Scarab`, false)
  ) {
    return useSkill$1($skill`Storm of the Scarab`, false);
  }

  if (
    $locations`The Hippy Camp, The Outskirts of Cobb's Knob, The Spooky Forest, The Batrat and Ratbat Burrow, The Boss Bat's Lair, Cobb's Knob Harem`.includes(
      myLocation(),
    ) &&
    canUse$1($skill`Fist of the Mummy`, false)
  ) {
    return useSkill$1($skill`Fist of the Mummy`, false);
  }

  const fightStat: number =
    myBuffedstat(weaponType(equippedItem($slot`weapon`))) - 20;
  if (
    fightStat > monsterDefense() &&
    round_1 < 20 &&
    canSurvive$1(1.1) &&
    getProperty("auto_edStatus") === "UNDYING!"
  ) {
    return "attack with weapon";
  }

  if (canUse$2($skill`Cowboy Kick`)) {
    return useSkill$2($skill`Cowboy Kick`);
  }

  if (canUse$4($item`ice-cold Cloaca Zero`) && myMp() < 15 && myMaxmp() > 200) {
    return useItem$1($item`ice-cold Cloaca Zero`);
  }

  if (
    canUse$1($skill`Storm of the Scarab`, false) &&
    myBuffedstat($stat`Mysticality`) > 35
  ) {
    return useSkill$1($skill`Storm of the Scarab`, false);
  }

  if (enemy.physicalResistance >= 100 || round_1 >= 25 || canSurvive$1(1.25)) {
    if (canUse$1($skill`Fist of the Mummy`, false)) {
      return useSkill$1($skill`Fist of the Mummy`, false);
    }
  }

  if (myMp() < mpCost($skill`Storm of the Scarab`)) {
    for (const it of $items`holy spring water, spirit beer, sacramental wine`) {
      if (canUse$4(it)) {
        return useItem(it, false);
      }
    }
  }

  if (round_1 >= 29) {
    auto_log_error(
      "About to UNDYING too much but have no other combat resolution. Please report this.",
    );
  }

  if (
    fightStat > monsterDefense() &&
    round_1 < 20 &&
    canSurvive$1(1.1) &&
    getProperty("auto_edStatus") === "dying"
  ) {
    auto_log_warning(
      `Attacking with weapon because we don't have enough MP. Expected damage: ${expectedDamage()}, current hp: ${myHp()}`,
      "red",
    );
    return "attack with weapon";
  }

  return useSkill$1($skill`Mild Curse`, false);
}
