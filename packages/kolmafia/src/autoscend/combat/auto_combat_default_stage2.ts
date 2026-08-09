import {
  getProperty,
  haveEffect,
  haveEquipped,
  indexOf,
  itemAmount,
  Monster,
  monsterPhylum,
  myAdventures,
  myDaycount,
  myFamiliar,
  myLightning,
  myLocation,
  myMp,
  myTurncount,
  Skill,
  substring,
  toMonster,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $monsters,
  $phylum,
  $skill,
  get,
  set,
} from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import { auto_wantToReserveFreekills } from "../auto_equipment";
import {
  auto_forceFreeRun,
  auto_have_skill,
  auto_is_valid,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_turbo,
  auto_wantToBanish,
  auto_wantToBanish$1,
  auto_wantToFreeRun,
  auto_wantToReplace,
  auto_wantToSniff,
  auto_wantToYellowRay,
  careAboutDrops,
  freeRunCombatAction,
  freeRunCombatStringPreBanish,
  handleTracker,
  instakillable,
  internalQuestStatus,
  isFreeMonster,
  isYellowRayingNextCombat,
  loopHandlerDelayAll,
  wrap_item,
} from "../auto_util";
import { auto_swoopLocations } from "../auto_zone";
import { auto_jokesterGunFreeKillAvailable } from "../iotms/2010/mr2016";
import { auto_chestXraysRemaining } from "../iotms/2010/mr2019";
import { auto_FireExtinguisherCombatSkill } from "../iotms/2020/mr2021";
import {
  auto_dousesRemaining,
  auto_habitatMonster,
  wantToThrowGravel,
} from "../iotms/2020/mr2023";
import { dartELRcd } from "../iotms/2020/mr2024";
import {
  auto_bczRefractedGaze,
  auto_wantToBCZ,
  auto_wantToShrunkenHead,
} from "../iotms/2020/mr2025";
import {
  auto_heartstoneShouldStealHeart,
  auto_sword_of_swords_tracking,
  auto_swordIsWillingToSwitchTargets,
  auto_wantToStartTrackingSwordMonster,
  wantToClubEmBackInTime,
} from "../iotms/2020/mr2026";
import { in_bugbear } from "../paths/2012/bugbear_invasion";
import { ag_is_bodyguard, in_avantGuard } from "../paths/2024/avant_guard";
import { getZooKickInstaKill } from "../paths/2025/zootomist";
import { inAftercore } from "../paths/casual";
import { bridgeGoal } from "../quests/level_09";
import { towerKeyCount } from "../quests/level_13";
import {
  auto_canUse,
  auto_useSkill,
  banisherCombatAction$1,
  banisherCombatString,
  canUse$3,
  combat_status_add,
  combat_status_check,
  getSniffer,
  haveUsed,
  maxRoundsToDouse,
  replaceMonsterCombatString,
  useItem,
  wantToDouse,
  wantToForceDrop,
  yellowRayCombatString,
} from "./auto_combat_util";
import { auto_combatDarkGyffteStage2 } from "./paths/auto_combat_dark_gyffte";

//defined in /autoscend/combat/auto_combat_default_stage2.ash
export function auto_combatDefaultStage2(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  // stage 2 = enders: escape, replace, instakill, yellowray and other actions that instantly end combat
  // Skip if have auto_skipStage2 is set
  if (get("auto_skipStage2", false)) {
    return undefined;
  }
  //If in Avant Guard, want to make sure the enemy is set correctly to the bodyguard
  let guardee: Monster = Monster.none;
  if (in_avantGuard() && ag_is_bodyguard()) {
    guardee = toMonster(
      substring(
        getProperty("lastEncounter"),
        indexOf(
          getProperty("lastEncounter"),
          " acting as the bodyguard to a ",
        ) + 30,
      ),
    );
  }
  //if we want to steal heart in stage 4 then we should delay stage 2 until we do so.
  //we do not want to steal heart now because we should do stage 3 first to stun and/or debuff the enemy first before olfacting.
  if (auto_heartstoneShouldStealHeart(myLocation())) {
    auto_log_debug(
      `Skipping stage 2 of combat for now as we intend to steal the heart of  [${enemy}]`,
    );
    return undefined;
  }
  //if we want to olfact in stage 4 then we should delay stage 2 until we olfact.
  //we do not want to olfact now because we should do stage 3 first to stun and/or debuff the enemy first before olfacting.
  if (
    auto_wantToSniff(enemy, myLocation()) &&
    getSniffer(enemy) !== Skill.none &&
    !ag_is_bodyguard()
  ) {
    auto_log_debug(
      `Skipping stage 2 of combat for now as we intend to olfact [${enemy}]`,
    );
    return undefined;
  }
  if (
    myLocation() === $location`The Daily Dungeon` &&
    itemAmount($item`daily dungeon malware`) > 0 &&
    auto_is_valid($item`daily dungeon malware`) &&
    towerKeyCount(false) < 2 &&
    !get("_dailyDungeonMalwareUsed")
  ) {
    auto_log_debug(
      "Skipping stage 2 of combat for now as we intend to use Daily Dungeon Malware",
    );
    return undefined;
  }
  // Path = dark gyffte
  const retval: CombatMacroReturns = auto_combatDarkGyffteStage2(
    round_1,
    enemy,
    text,
  );
  if (retval !== undefined) {
    return retval;
  }
  //Sword of S Words: lock in the current enemy for future fights' copied drops.
  if (
    !combat_status_check("droptablereplaced") &&
    auto_wantToStartTrackingSwordMonster(enemy, 100) &&
    auto_canUse($skill`%fn, kill a lot of these guys`)
  ) {
    handleTracker({
      what: enemy,
      location: myLocation(),
      detail: `${$familiar`Sword of S Words`.toString()} - ${$skill`%fn, kill a lot of these guys`.toString()}`,
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`%fn, kill a lot of these guys`);
  }
  if (
    myFamiliar() === $familiar`Sword of S Words` &&
    auto_sword_of_swords_tracking() !== Monster.none &&
    enemy.copyable &&
    !enemy.boss
  ) {
    if (
      auto_swordIsWillingToSwitchTargets() &&
      auto_canUse($skill`%fn, stop killing those guys`)
    ) {
      handleTracker({
        what: auto_sword_of_swords_tracking(),
        detail: `${$familiar`Sword of S Words`.toString()} - ${$skill`%fn\, stop killing those guys`.toString()}`,
        property: "auto_otherstuff",
      });
      return auto_useSkill($skill`%fn, stop killing those guys`);
    }

    // As we're replacing the drops, add the flag
    combat_status_add("droptablereplaced");
  }
  //Refracted Gaze sets drop table of monster to EVERYTHING else in zone so YRs are great
  //Monsters might be banished/freeran from/replaced because they are now useful so need to handle that too
  if (
    // we don't want to refract if the monster was from a choice
    !combat_status_check("choiceMonster") &&
    auto_bczRefractedGaze() &&
    !combat_status_check("droptablereplaced") &&
    auto_have_skill($skill`BCZ: Refracted Gaze`)
  ) {
    handleTracker({
      what: enemy,
      location: myLocation(),
      detail: $skill`BCZ: Refracted Gaze`.toString(),
      property: "auto_otherstuff",
    });
    combat_status_add("droptablereplaced");
    combat_status_add("refractedgazed");
    return auto_useSkill($skill`BCZ: Refracted Gaze`);
  }
  //use industrial fire extinguisher zone specific skills
  const extinguisherSkill: CombatMacroReturns =
    auto_FireExtinguisherCombatSkill(myLocation());
  if (
    extinguisherSkill !== undefined &&
    haveEquipped(wrap_item($item`industrial fire extinguisher`)) &&
    enemy !== $monster`screambat`
  ) {
    //below is temp workaround for https://github.com/loathers/autoscend/issues/1011
    handleTracker({
      what: enemy,
      detail: extinguisherSkill.toString(),
      property: "auto_otherstuff",
    });
    return extinguisherSkill;
  }
  //instakill enemies in [The Red Zeppelin]
  if (
    canUse$3($item`glark cable`, true) &&
    myLocation() === $location`The Red Zeppelin` &&
    getProperty("questL11Ron") === "step3" &&
    get("_glarkCableUses") < 5
  ) {
    if (
      $monsters`man with the red buttons, red butler, Red Fox, red skeleton`.includes(
        enemy,
      )
    ) {
      handleTracker({
        what: enemy,
        detail: $item`glark cable`.toString(),
        property: "auto_instakill",
      });
      return useItem($item`glark cable`);
    }
  }
  //instakill enemies in [A Mob Of Zeppelin Protesters]
  if (
    canUse$3($item`cigarette lighter`) &&
    myLocation() === $location`A Mob of Zeppelin Protesters` &&
    getProperty("questL11Ron") === "step1"
  ) {
    handleTracker({
      what: enemy,
      detail: $item`cigarette lighter`.toString(),
      property: "auto_instakill",
    });
    return useItem($item`cigarette lighter`);
  }
  //instakill using [Power Pill] which is iotm familiar derivative
  if (
    get("auto_usePowerPill", false) &&
    get("_powerPillUses") < 20 &&
    instakillable(enemy)
  ) {
    if (itemAmount($item`power pill`) > 0) {
      handleTracker({
        what: enemy,
        detail: $item`power pill`.toString(),
        property: "auto_instakill",
      });
      return $item`power pill`;
    }
  }
  //instakill using [Pair of Stomping Boots] iotm familiar which will produce spleen consumables
  if (
    myFamiliar() === $familiar`Pair of Stomping Boots` &&
    get("_bootStomps") < 7 &&
    instakillable(enemy) &&
    get("bootsCharged")
  ) {
    //neither the below checks nor careAboutDrops are complete enough
    if (
      !$monsters`dairy goat, lobsterfrogman`.includes(enemy) &&
      !careAboutDrops(enemy) &&
      !$locations`The Laugh Floor, Infernal Rackets Backstage`.includes(
        myLocation(),
      ) &&
      auto_canUse($skill`Release the Boots`)
    ) {
      return auto_useSkill($skill`Release the Boots`);
    }
  }
  // Dupe Tomb Rat King drops with pro skateboard
  if (
    enemy === $monster`tomb rat king` &&
    itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      10 &&
    auto_canUse($skill`Do an epic McTwist!`) &&
    !get("_epicMcTwistUsed")
  ) {
    handleTracker({
      what: enemy,
      detail: $skill`Do an epic McTwist!`.toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Do an epic McTwist!`);
  }
  // Dupe Mountain Man drops with pro skateboard on day 1, not in turbo
  if (
    enemy === $monster`mountain man` &&
    myDaycount() === 1 &&
    !auto_turbo() &&
    auto_canUse($skill`Do an epic McTwist!`) &&
    !get("_epicMcTwistUsed")
  ) {
    handleTracker({
      what: enemy,
      detail: $skill`Do an epic McTwist!`.toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Do an epic McTwist!`);
  }

  if (auto_wantToShrunkenHead(enemy)) {
    handleTracker({
      what: $skill`Prepare to reanimate your Foe`,
      detail: enemy.toString(),
      property: "auto_otherstuff",
    });
    return auto_useSkill($skill`Prepare to reanimate your Foe`);
  }
  // yellowray instantly kills the enemy and makes them drop all items they can drop.
  // don't yellow ray if we'll be dousing
  const douse: Skill = $skill`Douse Foe`;
  const isDouseTarget: boolean =
    wantToDouse(enemy) && round_1 < maxRoundsToDouse(enemy) - 1; // dousing can have a low chance of success, so only do it for a while then yellow
  const douseAvailable: boolean =
    auto_canUse(douse, false) && auto_dousesRemaining() > 0;
  const willDouse: boolean = isDouseTarget && douseAvailable;
  // And don't yellow ray if we'll be swooping
  const swoopAvailable: boolean =
    auto_canUse($skill`Swoop like a Bat`, true) &&
    get("_batWingsSwoopUsed") < 11;
  const willSwoop: boolean =
    auto_swoopLocations().includes(myLocation()) && swoopAvailable;

  if (
    ((!combat_status_check("yellowray") &&
      auto_wantToYellowRay(enemy, myLocation())) ||
      combat_status_check("refractedgazed")) &&
    !willDouse &&
    !willSwoop &&
    !isYellowRayingNextCombat()
  ) {
    const combatAction: CombatMacroReturns = yellowRayCombatString(
      enemy,
      true,
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal, knight (Snake)`.includes(
        enemy,
      ),
    );
    if (combatAction !== undefined) {
      combat_status_add("yellowray");
      handleTracker({
        what: enemy,
        detail: combatAction.toString(),
        property: "auto_yellowRays",
      });
      if (
        combatAction ===
        auto_useSkill($skill`Asdon Martin: Missile Launcher`, false)
      ) {
        set("_missileLauncherUsed", true);
      }
      return combatAction;
    } else {
      auto_log_warning("Wanted a yellow ray but we can not find one.", "red");
    }
  }
  //convert enemy into a helpless frog/newt/lizard
  if (get("auto_useCleesh", false)) {
    if (auto_canUse($skill`CLEESH`)) {
      set("auto_useCleesh", false);
      return auto_useSkill($skill`CLEESH`);
    }
  }
  //club em back in time to free kill the enemy but don't get any items
  if (wantToClubEmBackInTime(myLocation(), enemy)) {
    if (auto_canUse($skill`Club 'Em Back in Time`)) {
      handleTracker({
        what: enemy,
        detail: $skill`Club 'Em Back in Time`.toString(),
        property: "auto_instakill",
      });
      return auto_useSkill($skill`Club 'Em Back in Time`);
    }
  }
  //throw gravel to free kill the enemy but don't get any items
  if (wantToThrowGravel(myLocation(), enemy)) {
    handleTracker({
      what: enemy,
      detail: $item`groveling gravel`.toString(),
      property: "auto_instakill",
    });
    return useItem($item`groveling gravel`);
  }
  // Free run before banishing for a few monsters
  if (
    !combat_status_check("banishercheck") &&
    !combat_status_check("droptablereplaced") &&
    auto_wantToBanish(enemy, myLocation())
  ) {
    const freeRunAction: CombatMacroReturns = freeRunCombatStringPreBanish(
      enemy,
      myLocation(),
      true,
    );
    if (freeRunAction !== undefined) {
      handleTracker({
        what: enemy,
        detail: freeRunAction.toString(),
        property: "auto_freeruns",
      });
      return freeRunAction;
    }
  }

  if (
    !combat_status_check("banishercheck") &&
    !combat_status_check("phylumbanishercheck") &&
    !combat_status_check("droptablereplaced") &&
    auto_wantToBanish$1(monsterPhylum(enemy), myLocation()) &&
    auto_habitatMonster() !== enemy
  ) {
    const banishAction: CombatMacroReturns = banisherCombatString(
      monsterPhylum(enemy),
      myLocation(),
      true,
    );
    if (banishAction !== undefined) {
      auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
      combat_status_add("banisher");

      handleTracker({
        what: monsterPhylum(enemy),
        location: myLocation(),
        detail: banishAction.toString(),
        property: "auto_banishes",
      });
      return banishAction;
    }
    //we wanted to banish an enemy and failed. set a property so we do not bother trying in subsequent rounds
    combat_status_add("phylumbanishercheck");
  }
  // Free run in Avant Guard from Bodyguard before banishing for a few monsters
  if (
    !combat_status_check("banishercheck") &&
    !combat_status_check("droptablereplaced") &&
    auto_wantToBanish(guardee, myLocation())
  ) {
    const freeRunAction: CombatMacroReturns = freeRunCombatStringPreBanish(
      enemy,
      myLocation(),
      true,
    );
    if (freeRunAction !== undefined) {
      handleTracker({
        what: enemy,
        detail: freeRunAction.toString(),
        property: "auto_freeruns",
      });

      return freeRunAction;
    }
  }

  if (
    !combat_status_check("banishercheck") &&
    !combat_status_check("phylumbanishercheck") &&
    !combat_status_check("droptablereplaced") &&
    auto_wantToBanish(enemy, myLocation()) &&
    !ag_is_bodyguard()
  ) {
    const banishAction: CombatMacroReturns = banisherCombatAction$1(
      enemy,
      myLocation(),
      true,
    );
    if (banishAction !== undefined) {
      auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
      combat_status_add("banisher");

      handleTracker({
        what: enemy,
        detail: banishAction.toString(),
        property: "auto_banishes",
      });

      return banishAction;
    }
    //we wanted to banish an enemy and failed or banisher did not end combat.
    //set a property so we do not bother trying in subsequent rounds
    combat_status_add("banishercheck");
  }
  // Free run from monsters we want to banish/phylumbanish but are unable to, or monsters on the free run list
  if (
    !combat_status_check("freeruncheck") &&
    !combat_status_check("droptablereplaced") &&
    (auto_wantToFreeRun(enemy, myLocation()) ||
      auto_forceFreeRun(true) ||
      auto_wantToBanish(enemy, myLocation()) ||
      (auto_wantToBanish$1(monsterPhylum(enemy), myLocation()) &&
        auto_habitatMonster() !== enemy) ||
      auto_wantToFreeRun(guardee, myLocation()) ||
      auto_wantToBanish(guardee, myLocation()))
  ) {
    let freeRunAction: CombatMacroReturns = freeRunCombatAction(
      enemy,
      myLocation(),
      true,
    );
    if (freeRunAction !== undefined) {
      if (typeof freeRunAction === "object" && "detail" in freeRunAction) {
        handleTracker({
          what: enemy,
          detail: freeRunAction.detail,
          property: "auto_freeruns",
        });
        freeRunAction = freeRunAction.macro;
      } else {
        handleTracker({
          what: enemy,
          detail: freeRunAction.toString(),
          property: "auto_freeruns",
        });
      }
      return freeRunAction;
    }
    //we wanted to free run an enemy and failed. set a property so we do not bother trying in subsequent rounds
    combat_status_add("freeruncheck");
  }

  if (
    !combat_status_check("replacercheck") &&
    !combat_status_check("droptablereplaced") &&
    auto_wantToReplace(enemy, myLocation())
  ) {
    const combatAction: CombatMacroReturns = replaceMonsterCombatString(
      enemy,
      true,
    );
    if (combatAction !== undefined) {
      combat_status_add("replacer");
      if (combatAction === $skill`CHEAT CODE: Replace Enemy`) {
        handleTracker({
          what: $skill`CHEAT CODE: Replace Enemy`,
          property: "auto_powerfulglove",
        });
      }
      handleTracker({
        what: enemy,
        detail: combatAction.toString(),
        property: "auto_replaces",
      });
      return combatAction;
    } else {
      auto_log_warning("Wanted a replacer but we can not find one.", "red");
    }
    combat_status_add("replacercheck");
  }
  //convert enemy [Tomb rat] into [Tomb rat king]
  if (
    enemy === $monster`tomb rat` &&
    itemAmount($item`tangle of rat tails`) > 0 &&
    itemAmount($item`tomb ratchet`) +
      itemAmount($item`crumbling wooden wheel`) <
      10 &&
    $location`The Middle Chamber`.fireLevel < 3
  ) {
    //wildfire path. ratchets do not burn. king ratchets burn. fire===0 in other paths
    //actually need ratchets
    return $item`tangle of rat tails`;
  }
  // Bugbear Invasion
  if (in_bugbear()) {
    if (
      enemy === $monster`bugbear scientist` &&
      itemAmount($item`quantum nanopolymer spider web`) > 0
    ) {
      return $item`quantum nanopolymer spider web`;
    }
    if (
      enemy === $monster`liquid metal bugbear` &&
      itemAmount($item`drone self-destruct chip`) > 0
    ) {
      return $item`drone self-destruct chip`;
    }
  }
  // Instakill handler
  let couldInstaKill: boolean = true;
  if (
    $monsters`smut orc pipelayer, smut orc jacker, smut orc screwer, smut orc nailer`.includes(
      enemy,
    ) &&
    get("chasmBridgeProgress") < bridgeGoal()
  ) {
    //want to do cold damage in stage3
    if (myAdventures() > 6) {
      couldInstaKill = false;
    }
  } else if ($monsters`lobsterfrogman`.includes(enemy)) {
    if (
      auto_have_skill($skill`Digitize`) &&
      getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString()
    ) {
      couldInstaKill = false;
    }
  } else if (
    $monsters`Racecar Bob, Bob Racecar`.includes(enemy) &&
    itemAmount($item`photograph of a dog`) === 0 &&
    internalQuestStatus("questL11Palindome") < 2
  ) {
    //don't want to instakill if we haven't used the disposable camera yet
    couldInstaKill = false;
  } else if (wantToForceDrop(enemy)) {
    //want drops from this enemy
    couldInstaKill = false;
  } else if ($monsters`dirty thieving brigand`.includes(enemy)) {
    //want meat drops. Free fights cap meat drop to 1k
    couldInstaKill = false;
  }

  if (
    instakillable(enemy) &&
    !isFreeMonster(enemy, myLocation()) &&
    couldInstaKill
  ) {
    const { reserveFreekills, wantFreeKillNowEspecially } =
      auto_wantToReserveFreekills(true);

    if (
      auto_canUse($skill`Darts: Aim for the Bullseye`) &&
      haveEffect($effect`Everything Looks Red`) === 0 &&
      dartELRcd() <= 40
    ) {
      set("auto_instakillSource", "darts bullseye");
      set("auto_instakillSuccess", true);
      loopHandlerDelayAll();
      return auto_useSkill($skill`Darts: Aim for the Bullseye`);
    }

    if (
      auto_canUse($skill`Free-For-All`) &&
      haveEffect($effect`Everything Looks Red`) === 0 &&
      (wantFreeKillNowEspecially || !reserveFreekills) &&
      myMp() > 80
    ) {
      //Only want to cast this when you have mp to spare because it is 50mp
      handleTracker({
        what: enemy,
        detail: $skill`Free-For-All`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return auto_useSkill($skill`Free-For-All`);
    }

    if (
      auto_canUse($skill`Lightning Strike`) &&
      (wantFreeKillNowEspecially || !reserveFreekills || myLightning() >= 60)
    ) {
      handleTracker({
        what: enemy,
        detail: $skill`Lightning Strike`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return auto_useSkill($skill`Lightning Strike`);
    }
    //Depending on the fam used for instakill, it could be a turn free YR, or it could be turn taking and not a YR, but still give ELY.
    const z_kick: Skill = getZooKickInstaKill();
    if (auto_canUse(z_kick)) {
      set("auto_instakillSource", "zootomist kick");
      set("auto_instakillSuccess", true);
      loopHandlerDelayAll();
      return auto_useSkill(z_kick);
    }

    if (auto_canUse($skill`Chest X-Ray`) && auto_chestXraysRemaining() > 0) {
      if (
        wantFreeKillNowEspecially ||
        !reserveFreekills ||
        inAftercore() ||
        myDaycount() >= 3
      ) {
        handleTracker({
          what: enemy,
          detail: $skill`Chest X-Ray`.toString(),
          property: "auto_instakill",
        });
        loopHandlerDelayAll();
        return auto_useSkill($skill`Chest X-Ray`);
      }
    }

    if (
      auto_canUse($skill`Fire the Jokester's Gun`) &&
      auto_jokesterGunFreeKillAvailable() &&
      (wantFreeKillNowEspecially || !reserveFreekills)
    ) {
      handleTracker({
        what: enemy,
        detail: $skill`Fire the Jokester's Gun`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return auto_useSkill($skill`Fire the Jokester's Gun`);
    }

    if (
      auto_wantToBCZ($skill`BCZ: Sweat Bullets`) &&
      (wantFreeKillNowEspecially || !reserveFreekills)
    ) {
      handleTracker({
        what: enemy,
        detail: $skill`BCZ: Sweat Bullets`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return auto_useSkill($skill`BCZ: Sweat Bullets`);
    }

    if (
      auto_canUse($skill`Shattering Punch`) &&
      get("_shatteringPunchUsed") < 3 &&
      !reserveFreekills
    ) {
      if (
        !wantFreeKillNowEspecially &&
        myDaycount() === 1 &&
        myTurncount() < 100 &&
        myMp() < 80
      ) {
        //avoid sudden drain of 3x30 MP just 20 turns after the run starts, there is no mp regen or sauceror mp when using this
      } else {
        handleTracker({
          what: enemy,
          detail: $skill`Shattering Punch`.toString(),
          property: "auto_instakill",
        });
        loopHandlerDelayAll();
        return auto_useSkill($skill`Shattering Punch`);
      }
    }
    if (
      auto_canUse($skill`Gingerbread Mob Hit`) &&
      !get("_gingerbreadMobHitUsed") &&
      !reserveFreekills &&
      myMp() > 50
    ) {
      handleTracker({
        what: enemy,
        detail: $skill`Gingerbread Mob Hit`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return auto_useSkill($skill`Gingerbread Mob Hit`);
    }
    //		Can not use _usedReplicaBatoomerang if we have more than 1 because of the double item use issue...
    //		Sure, we can try to use a second item (if we have it or are forced to buy it... ugh).
    //		if(!combat_status_check("batoomerang") && (item_amount($item[Replica Bat-oomerang]) > 0) && (get_property("_usedReplicaBatoomerang").to_int() < 3))
    //		THIS IS COPIED TO THE ED SECTION, IF IT IS FIXED, FIX IT THERE TOO!
    if (canUse$3($item`replica bat-oomerang`) && !reserveFreekills) {
      if (get("auto_batoomerangDay", 0) !== myDaycount()) {
        set("auto_batoomerangDay", myDaycount());
        set("auto_batoomerangUse", 0);
      }
      if (get("auto_batoomerangUse", 0) < 3) {
        set("auto_batoomerangUse", get("auto_batoomerangUse", 0) + 1);
        handleTracker({
          what: enemy,
          detail: $item`replica bat-oomerang`.toString(),
          property: "auto_instakill",
        });
        loopHandlerDelayAll();
        return useItem($item`replica bat-oomerang`);
      }
    }

    if (
      canUse$3($item`shadow brick`) &&
      get("_shadowBricksUsed") < 13 &&
      !reserveFreekills
    ) {
      handleTracker({
        what: enemy,
        detail: $item`shadow brick`.toString(),
        property: "auto_instakill",
      });
      loopHandlerDelayAll();
      return useItem($item`shadow brick`);
    }
  } // instakills
  //wearing [retro superhero cape] iotm set to vampire slicer mode instakills Undead and reduces evilness in Cyrpt zones.
  if (auto_canUse($skill`Slay the Dead`) && enemy.phylum === $phylum`undead`) {
    return auto_useSkill($skill`Slay the Dead`);
  }
  //autokill duplicated enemies. this still costs a turn
  if (canUse$3($item`exploding cigar`) && haveUsed($skill`Duplicate`)) {
    return useItem($item`exploding cigar`);
  }
  // Slaughter is an instakill, but not free; only use if you have no other options and never when we want free kill
  if (
    auto_canUse($skill`Slaughter`) &&
    haveEffect($effect`Everything Looks Red`) === 0
  ) {
    set("auto_instakillSource", "slaughter");
    set("auto_instakillSuccess", true);
    loopHandlerDelayAll();
    return auto_useSkill($skill`Slaughter`);
  }

  return undefined;
}
