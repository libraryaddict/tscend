import {
  cliExecute,
  closetAmount,
  containsText,
  council,
  creatableAmount,
  create,
  equip,
  equippedItem,
  Familiar,
  haveEffect,
  inHardcore,
  Item,
  itemAmount,
  monsterLevelAdjustment,
  myAdventures,
  myClass,
  myDaycount,
  myHash,
  myHp,
  myMaxhp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  npcPrice,
  pullsRemaining,
  retrieveItem,
  takeCloset,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $path,
  $slot,
  $slots,
  $stat,
  get,
  set,
} from "libram";

import { auto_advToReserve, LX_doVacation } from "../../../autoscend";
import {
  Bofa,
  Cartography,
  GreyGoose,
  L11_SpookyManor,
  MaydayContract,
  MonkeyPaw,
  XiReceiver,
} from "../../../types";
import {
  autoEquip,
  autoEquipToSlot,
  autoForceEquip$3,
  equipmentAmount,
  possessEquipment,
  possessUnrestricted,
} from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { provideItem$2, providePlusNonCombat } from "../../auto_providers";
import { auto_reserveUndergroundAdventures } from "../../auto_routing";
import { zone_isAvailable } from "../../auto_zone";
import { QuestTask, runQuestTask, runTaskChain } from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv } from "../../executors/auto_adventure";
import { auto_buyUpTo, pullXWhenHaveY } from "../../helpers/auto_acquire";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import {
  canChangeToFamiliar,
  handleFamiliar$1,
} from "../../helpers/auto_familiar";
import { acquireHP, uneffect } from "../../helpers/auto_restore";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_nuclear } from "../../paths/2016/nuclear_autumn";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import {
  in_plumber,
  plumber_equipTool,
} from "../../paths/2020/path_of_the_plumber";
import {
  in_quantumTerrarium,
  qt_FamiliarSwap,
} from "../../paths/2021/quantum_terrarium";
import { robot_delay } from "../../paths/2021/you_robot";
import { in_small } from "../../paths/2023/small";
import { is_professor, is_werewolf } from "../../paths/2024/wereprofessor";
import { bluevsred_isRed, in_bluevsred } from "../../paths/2026/blue_vs_red";
import {
  auto_abort,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  adjustForYellowRayIfPossible,
  auto_can_equip,
  auto_combatModCap,
  auto_is_valid,
  canSniff,
  canSummonMonster,
  canYellowRay,
  getMonsterDrops,
  internalQuestStatus,
  isDropCapped,
  prepareYellowRayNextCombat,
  summonMonster,
} from "../../utils/auto_util";
import { L3_tavern } from "../level_03";

registerQuestTask({
  name: "L11_unlockEd",
  completed: () =>
    get("middleChamberUnlock") &&
    (internalQuestStatus("questL11Pyramid") > 3 || get("pyramidBombUsed")),
  ready: () => true,
  do: () =>
    runTaskChain([L11_unlockUpperChamberTask, L11_unlockMiddleChamberTask]),
});

class desert_buff_record {
  constructor(
    public weapon: Item = $item.none,
    public offhand: Item = $item.none,
    public famEquip: Item = $item.none,
    public fam: Familiar = $familiar.none,
    public progress: number = 0,
  ) {}
}

function desertBuffs(): desert_buff_record {
  const dbr: desert_buff_record = new desert_buff_record();

  dbr.progress = 1;

  const compassValid: boolean = possessUnrestricted(
    $item`UV-resistant compass`,
  );
  const lhmValid: boolean = canChangeToFamiliar($familiar`Left-Hand Man`);
  const meloValid: boolean = canChangeToFamiliar($familiar`Melodramedary`);
  const odrValid: boolean = possessUnrestricted($item`ornate dowsing rod`);
  const knifeValid: boolean = possessUnrestricted($item`survival knife`);

  dbr.fam = $familiar.none;
  dbr.famEquip = $item.none;
  dbr.offhand = $item.none;
  dbr.weapon = $item.none;
  // No contention for weapon so always use survival knife if we have it
  if (knifeValid) {
    dbr.weapon = $item`survival knife`;
    dbr.progress += 2;
  }
  // If we can't use the Ornate dowsing rod
  if (!odrValid) {
    // And we can use the compass
    if (compassValid) {
      // And we have the Left-Hand man but not the Melodramedary
      // Free up our offhand for something useful
      if (lhmValid && !meloValid) {
        dbr.fam = $familiar`Left-Hand Man`;
        dbr.famEquip = $item`UV-resistant compass`;
        dbr.progress += 1;
      } else {
        // Otherwise hold the compass
        dbr.offhand = $item`UV-resistant compass`;
        dbr.progress += 1;
      }
    }
    // If we have the Melodramedary use it!
    if (meloValid) {
      dbr.fam = $familiar`Melodramedary`;
      dbr.progress += 1;
    }
  } else {
    // Otherwise
    // If we have it and a Left-Hand man is our best familiar choice
    // but we have no compass free up our offhand
    if (!compassValid && lhmValid && !meloValid) {
      dbr.fam = $familiar`Left-Hand Man`;
      dbr.famEquip = $item`ornate dowsing rod`;
      dbr.progress += 2;
    } else {
      // Otherwise we can just hold it
      dbr.offhand = $item`ornate dowsing rod`;
      dbr.progress += 2;
    }
    // Melodramedary is better here though
    if (meloValid) {
      dbr.fam = $familiar`Melodramedary`;
      dbr.progress += 1;
    } else if (compassValid && lhmValid) {
      // Otherwise we can give the compass to the Left-Hand man if possible
      dbr.fam = $familiar`Left-Hand Man`;
      dbr.famEquip = $item`UV-resistant compass`;
      dbr.progress += 1;
    }
  }
  // There are some other familiars we might choose if nothing affects progress
  if (dbr.fam === $familiar.none) {
    if (
      get("_hipsterAdv") < 7 &&
      canChangeToFamiliar($familiar`Artistic Goth Kid`)
    ) {
      dbr.fam = $familiar`Artistic Goth Kid`;
    } else if (
      get("_hipsterAdv") < 7 &&
      canChangeToFamiliar($familiar`Mini-Hipster`)
    ) {
      dbr.fam = $familiar`Mini-Hipster`;
    }
  }

  return dbr;
}

function auto_visit_gnasir(): void {
  //Visits gnasir, can change based on path
  if (in_koe()) {
    visitUrl("place.php?whichplace=exploathing_beach&action=expl_gnasir");
  } else {
    visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
  }
}

function L11_getUVCompassDo(): boolean {
  //acquire a [UV-resistant compass] if needed
  pullXWhenHaveY($item`Shore Inc. Ship Trip Scrip`, 1, 0);
  if (itemAmount($item`Shore Inc. Ship Trip Scrip`) === 0) {
    return LX_doVacation();
  }

  if (create(1, $item`UV-resistant compass`)) {
    return true;
  } else {
    cliExecute("refresh inv");
    if (possessEquipment($item`UV-resistant compass`)) {
      return true;
    } else {
      auto_abort(
        "I have the Scrip for it but am failing to buy [UV-resistant compass] for some reason. buy it manually and run me again",
      );
    }
  }

  return false;
}

const L11_getUVCompassTask: QuestTask = registerQuestTask({
  name: "L11_getUVCompass",
  completed: () =>
    //already have a dowsing rod. we do not need a compass.
    (possessEquipment($item`ornate dowsing rod`) &&
      auto_can_equip($item`ornate dowsing rod`)) ||
    //already have compass
    possessEquipment($item`UV-resistant compass`) ||
    //impossible to get compass in this path. [The Shore, Inc] is unavailable
    in_koe(),
  ready: () => auto_can_equip($item`UV-resistant compass`) && !is_werewolf(),
  do: L11_getUVCompassDo,
});

function L11_getUVCompass(): boolean {
  return runQuestTask(L11_getUVCompassTask);
}

export function L11_hasUltrahydrated(): boolean {
  if (
    haveEffect($effect`Ultrahydrated`) > 0 &&
    internalQuestStatus("questL11Desert") < 1
  ) {
    return true;
  }
  return false;
}

function L11_aridDesertDo(): boolean {
  // Fix broken desert tracking. pocket familiars failing as of r19010. plumber as of r20019
  if (in_plumber() || in_pokefam()) {
    visitUrl("place.php?whichplace=desertbeach", false);
  }
  if (get("desertExploration") >= 100) {
    return false; //done exploring
  }

  if (
    MaydayContract.haveMaydayContract() &&
    myDaycount() < 2 &&
    !isAboutToPowerlevel() &&
    auto_is_valid($item`survival knife`)
  ) {
    // if we can get (and use) the survival knife on day 2 and we're on day 1, lets delay until day 2
    // unless we have absolutely nothing else to do.
    // hardcode the paths & classes we know will get the survival knife on day 2 until mafia
    // exposes functions to either allow us to calculate seeds ourselves or just tell us what we will get.
    if (in_small() && $classes`Turtle Tamer, Sauceror`.includes(myClass())) {
      return false;
    }
    if (myPath() === $path`Standard` && myClass() === $class`Pastamancer`) {
      return false;
    }
  }

  if (XiReceiver.LX_ornateDowsingRod(true)) {
    //spend adv trying to get [Ornate Dowsing Rod]. doing_desert_now = true.
    return true;
  }
  if (L11_getUVCompass()) {
    //spend adv trying to get [UV-resistant compass]
    return true;
  }
  if (robot_delay("desert")) {
    return false; //delay for You, Robot path
  }
  if (itemAmount($item`milestone`) > 0) {
    //use milestone if we got one from the rock garden
    use(1, $item`milestone`);
  }

  const dbr: desert_buff_record = desertBuffs();
  let progressPerAdv: number = dbr.progress;
  if (get("bondDesert")) {
    progressPerAdv += 2;
  }
  if (get("peteMotorbikeHeadlight") === "Blacklight Bulb") {
    //TODO verify spelling on this string
    progressPerAdv += 2;
  }

  if (get("auto_gnasirUnlocked", false)) {
    if (L11_SpookyManor.LX_spookyravenManorFirstFloor()) {
      // make sure we've actually done the Haunted Library before we want to hand in a killing jar
      return true;
    }

    if ((get("gnasirProgress") & 2) !== 2) {
      let canBuyPaint: boolean = true;
      if (in_wotsf() || in_nuclear() || is_werewolf()) {
        canBuyPaint = false;
      }

      if (
        itemAmount($item`can of black paint`) > 0 ||
        (myMeat() >= npcPrice($item`can of black paint`) && canBuyPaint)
      ) {
        auto_buyUpTo(1, $item`can of black paint`);
        auto_log_info("Returning the Can of Black Paint", "blue");
        auto_visit_gnasir();
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        visitUrl("choice.php?whichchoice=805&option=2&pwd=");
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          cliExecute("refresh inv");
          if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
            if (itemAmount($item`can of black paint`) === 0) {
              auto_log_warning(
                "Mafia did not track gnasir Can of Black Paint (0x2). Fixing.",
                "red",
              );
              set("gnasirProgress", get("gnasirProgress") | 2);
              return true;
            } else {
              auto_abort(
                "Returned can of black paint but did not return can of black paint.",
              );
            }
          } else {
            if ((get("gnasirProgress") & 2) !== 2) {
              auto_log_warning(
                "Mafia did not track gnasir Can of Black Paint (0x2). Fixing.",
                "red",
              );
              set("gnasirProgress", get("gnasirProgress") | 2);
            }
          }
        }
        use(1, $item`desert sightseeing pamphlet`);
        return true;
      }
    }

    if (
      itemAmount($item`killing jar`) > 0 &&
      (get("gnasirProgress") & 4) !== 4
    ) {
      auto_log_info("Returning the killing jar", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
        cliExecute("refresh inv");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          auto_abort("Returned killing jar but did not return killing jar.");
        } else {
          if ((get("gnasirProgress") & 4) !== 4) {
            auto_log_warning(
              "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
              "red",
            );
            set("gnasirProgress", get("gnasirProgress") | 4);
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    if (
      itemAmount($item`worm-riding manual page`) >= 15 &&
      (get("gnasirProgress") & 8) !== 8
    ) {
      auto_log_info("Returning the worm-riding manual pages", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`worm-riding hooks`) === 0) {
        auto_log_error(
          "We messed up in the Desert, get the Worm-Riding Hooks and use them please.",
        );
        auto_abort(
          "We messed up in the Desert, get the Worm-Riding Hooks and use them please.",
        );
      }
      if (itemAmount($item`worm-riding manual page`) >= 15) {
        auto_log_warning(
          "Mafia doesn't realize that we've returned the worm-riding manual pages... fixing",
          "red",
        );
        cliExecute("refresh all");
        if ((get("gnasirProgress") & 8) !== 8) {
          auto_log_warning(
            "Mafia did not track gnasir Worm-Riding Manual Pages (0x8). Fixing.",
            "red",
          );
          set("gnasirProgress", get("gnasirProgress") | 8);
        }
      }
      return true;
    }

    if (
      itemAmount($item`worm-riding hooks`) > 0 &&
      (get("gnasirProgress") & 16) !== 16
    ) {
      pullXWhenHaveY($item`drum machine`, 1, 0);
      if (itemAmount($item`drum machine`) === 0) {
        MonkeyPaw.makeMonkeyPawWish$1($item`drum machine`);
      }
      if (itemAmount($item`drum machine`) > 0) {
        auto_log_info("Drum machine desert time!", "blue");
        use(1, $item`drum machine`);
        return true;
      }
    }
    // If we have done the Worm-Riding Hooks or the Killing jar, don\'t do this.
    if (
      100 - get("desertExploration") <= 15 &&
      (get("gnasirProgress") & 12) === 0
    ) {
      pullXWhenHaveY($item`killing jar`, 1, 0);
      if (itemAmount($item`killing jar`) > 0) {
        auto_log_info("Secondary killing jar handler", "blue");
        auto_visit_gnasir();
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        visitUrl("choice.php?whichchoice=805&option=2&pwd=");
        visitUrl("choice.php?whichchoice=805&option=1&pwd=");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          cliExecute("refresh inv");
          if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
            auto_abort(
              "Returned killing jar (secondary) but did not return killing jar.",
            );
          } else {
            if ((get("gnasirProgress") & 4) !== 4) {
              auto_log_warning(
                "Mafia did not track gnasir Killing Jar (0x4). Fixing.",
                "red",
              );
              set("gnasirProgress", get("gnasirProgress") | 4);
            }
          }
        }
        use(1, $item`desert sightseeing pamphlet`);
        return true;
      }
    }
  }

  if (
    haveEffect($effect`Ultrahydrated`) > 0 ||
    get("desertExploration") === 0
  ) {
    auto_log_info("Searching for the pyramid", "blue");
    if (in_heavyrains()) {
      autoEquip($item`Thor's Pliers`);
    }

    if (
      possessEquipment($item`reinforced beaded headband`) &&
      possessEquipment($item`bullet-proof corduroys`) &&
      possessEquipment($item`round purple sunglasses`)
    ) {
      for (const it of $items`beer helmet, distressed denim pants, bejeweled pledge pin`) {
        takeCloset(closetAmount(it), it);
      }
    }

    auto_buyUpTo(1, $item`hair spray`);
    buffMaintain$2($effect`Butt-Rock Hair`);
    if (myPrimestat() === $stat`Muscle`) {
      auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
      buffMaintain$2($effect`Go Get 'Em, Tiger!`);
      auto_buyUpTo(1, $item`blood of the Wereseal`);
      buffMaintain$2($effect`Temporary Lycanthropy`);
    }

    if (myMp() > 30 && myHp() < myMaxhp() * 0.5) {
      acquireHP();
    }

    if (
      (inHardcore() || pullsRemaining() === 0) &&
      itemAmount($item`worm-riding hooks`) > 0 &&
      get("desertExploration") <= 100 - 5 * progressPerAdv &&
      (get("gnasirProgress") & 16) !== 16
    ) {
      if (itemAmount($item`drum machine`) > 0) {
        auto_log_info("Found the drums, now we use them!", "blue");
        use(1, $item`drum machine`);
      } else {
        const drumDrop = getMonsterDrops($monster`blur`).find(
          (d) => d.item === $item`drum machine`,
        );
        const dropCapped = drumDrop !== undefined && isDropCapped(drumDrop);
        if (
          ((get("gnasirProgress") & 1) !== 0 ||
            itemAmount($item`stone rose`) > 0 ||
            get("desertExploration") <= 100 - 5 * progressPerAdv) &&
          canSummonMonster($monster`blur`) &&
          (dropCapped || canYellowRay($monster`blur`))
        ) {
          auto_log_info("Summoning the blur to get a drum machine!", "blue");
          if (!dropCapped && !adjustForYellowRayIfPossible($monster`blur`)) {
            prepareYellowRayNextCombat(6);
          }

          if (summonMonster($monster`blur`)) {
            return true;
          }
        }
        auto_log_info("Off to find the drums!", "blue");
        autoAdv($location`The Oasis`);
      }
      return true;
    }

    if (
      (get("gnasirProgress") & 1) !== 1 &&
      zone_isAvailable($location`The Oasis`, false)
    ) {
      // We can turn a stone rose in for 15% progress
      const remaining = 100 - get("desertExploration");
      const pages = itemAmount($item`worm-riding manual page`);
      const oasisTurns = 8 - $location`The Oasis`.turnsSpent;
      let desertExpectedTurns = remaining / progressPerAdv;

      if (pages < 15) {
        // Average pages per successful drop:
        // first drop = 1, later drops = 2.5
        const averagePagesPerDrop = pages === 0 ? 1 : 2.5;

        // Average adventures between successful drops.
        // 25%, 50%, 75%, 100% gives 2.3125 adventures/drop.
        const adventuresPerDrop = 2.3125;

        const adventuresForPages =
          ((15 - pages) / averagePagesPerDrop) * adventuresPerDrop;

        // The progress after the pages
        const progressAfterPages = Math.max(0, remaining - 30);
        desertExpectedTurns = Math.min(
          desertExpectedTurns,
          adventuresForPages + progressAfterPages / progressPerAdv,
        );
      }

      desertExpectedTurns = Math.ceil(desertExpectedTurns * 10) / 10;

      // This logic is a little wrong, it doesn't take into account pages when it says desert would take this long
      const oasisExpectedTurns =
        Math.ceil(
          (oasisTurns + Math.max(0, remaining - 15) / progressPerAdv) * 10,
        ) / 10;

      auto_log_info(
        `Expected turns if hunting in Oasis for a Stone Rose: ${oasisExpectedTurns}`,
      );
      auto_log_info(
        `Expected turns if hunting in Desert: ${desertExpectedTurns}`,
        "brown",
      );
      if (
        itemAmount($item`stone rose`) === 0 &&
        Math.ceil(desertExpectedTurns) > Math.ceil(oasisExpectedTurns)
      ) {
        auto_log_info("Rose is better than Desert.", "blue");
        autoAdv($location`The Oasis`);
        return true;
      }
    }

    if (dbr.fam !== $familiar.none) {
      if (in_quantumTerrarium()) {
        qt_FamiliarSwap(dbr.fam);
      } else {
        handleFamiliar$1(dbr.fam);
      }
    }
    if (dbr.weapon !== $item.none) {
      autoEquipToSlot($slot`weapon`, dbr.weapon);
    }
    if (dbr.offhand !== $item.none) {
      autoEquipToSlot($slot`off-hand`, dbr.offhand);
    }
    if (dbr.famEquip !== $item.none) {
      autoEquipToSlot($slot`familiar`, dbr.famEquip);
    }
    set("choiceAdventure805", 1);
    const need: number = 100 - get("desertExploration");
    auto_log_info(`Need for desert: ${need}`, "blue");
    auto_log_info(
      `Worm riding: ${itemAmount($item`worm-riding manual page`)}`,
      "blue",
    );

    if (
      !get("auto_gnasirUnlocked", false) &&
      $location`The Arid, Extra-Dry Desert`.turnsSpent > 10 &&
      get("desertExploration") > 10
    ) {
      auto_log_info(
        "Did not appear to notice that Gnasir unlocked, assuming so at this point.",
        "green",
      );
      set("auto_gnasirUnlocked", true);
    }

    if (
      get("auto_gnasirUnlocked", false) &&
      itemAmount($item`stone rose`) > 0 &&
      (get("gnasirProgress") & 1) !== 1
    ) {
      auto_log_info("Returning the stone rose", "blue");
      auto_visit_gnasir();
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      visitUrl("choice.php?whichchoice=805&option=2&pwd=");
      visitUrl("choice.php?whichchoice=805&option=1&pwd=");
      if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
        cliExecute("refresh inv");
        if (itemAmount($item`desert sightseeing pamphlet`) === 0) {
          auto_abort("Returned stone rose but did not return stone rose.");
        } else {
          if ((get("gnasirProgress") & 1) !== 1) {
            auto_log_warning(
              "Mafia did not track gnasir Stone Rose (0x1). Fixing.",
              "red",
            );
            set("gnasirProgress", get("gnasirProgress") | 1);
          }
        }
      }
      use(1, $item`desert sightseeing pamphlet`);
      return true;
    }

    autoAdv($location`The Arid, Extra-Dry Desert`);

    if (containsText(get("lastEncounter"), "A Sietch in Time")) {
      auto_log_info(
        "We've found the gnome!! Sightseeing pamphlets for everyone!",
        "green",
      );
      set("auto_gnasirUnlocked", true);
    }

    if (containsText(get("lastEncounter"), "He Got His Just Desserts")) {
      takeCloset(closetAmount($item`beer helmet`), $item`beer helmet`);
      takeCloset(
        closetAmount($item`distressed denim pants`),
        $item`distressed denim pants`,
      );
      takeCloset(
        closetAmount($item`bejeweled pledge pin`),
        $item`bejeweled pledge pin`,
      );
    }
  } else {
    const need: number = 100 - get("desertExploration");
    auto_log_info(
      `Getting some ultrahydrated, I suppose. Desert left: ${need}`,
      "blue",
    );
    if (
      !get("oasisAvailable") &&
      $location`The Arid, Extra-Dry Desert`.turnsSpent > 0
    ) {
      auto_log_info(
        `Oasis doesn't seem to be available, but we've been to the desert. Checking it manually...`,
      );
      visitUrl(`place.php?whichplace=desertbeach`);
    }

    if (!get("oasisAvailable") && haveEffect($effect`Ultrahydrated`) === 0) {
      return autoAdv($location`The Arid, Extra-Dry Desert`);
    }

    if (Bofa.haveBofa() && !isAboutToPowerlevel()) {
      // wait for a monster to give us ultrahydrated
      return false;
    }

    if (!autoAdv($location`The Oasis`)) {
      auto_log_warning(
        "Could not visit the Oasis for some reason, desertExploration may be incorrect.",
        "red",
      );
      const initial: number = get("desertExploration");
      const page: string = visitUrl("place.php?whichplace=desertbeach");
      const desert_matcher = page.match(/title="[(](\d+)% explored[)]"/s);
      if (desert_matcher) {
        const found: number = toInt(desert_matcher[1]);
        if (found !== initial) {
          auto_log_info(
            `Incorrectly had exploration value of ${initial} when it should be at ${found}. This was corrected. Trying to resume.`,
            "blue",
          );
          set("desertExploration", found);
          return true;
        }
        if (!autoAdv($location`The Oasis`)) {
          auto_abort(
            "Tried to adventure in The Oasis but could not. property desertExploration determined to be correct",
          );
        }
      } else {
        auto_abort(
          "Tried to adventure in The Oasis but could not, and could not verify the actual exploration amount of the desert",
        );
      }
    }
  }
  return true;
}

const L11_aridDesertTask: QuestTask = registerQuestTask({
  name: "L11_aridDesert",
  completed: () => internalQuestStatus("questL11Desert") > 0,
  ready: () => internalQuestStatus("questL11Desert") === 0,
  do: L11_aridDesertDo,
  desiredEncounters: () => [
    {
      item: $item`stone rose`,
      needAmount:
        itemAmount($item`stone rose`) === 0 && (get("gnasirProgress") & 1) === 0
          ? 1
          : 0,
    },
    {
      item: $item`worm-riding manual page`,
      needAmount: 15 - itemAmount($item`worm-riding manual page`),
    },
  ],
});

export function L11_aridDesert(): boolean {
  return runQuestTask(L11_aridDesertTask);
}

function L11_unlockPyramidDo(): boolean {
  visitUrl("place.php?whichplace=desertbeach");
  if (
    internalQuestStatus("questL11Desert") < 1 ||
    get("desertExploration") < 100 ||
    internalQuestStatus("questL11Pyramid") > -1
  ) {
    return false;
  }
  if (isActuallyEd()) {
    return false; //ed starts with pyramid unlocked and cannot adventure there
  }
  //get staff of ed if possible. we are only checking the non equipment version of it.
  //the equipment version is actually ed the undying path exclusive
  if (creatableAmount($item`[2325]Staff of Ed`) > 0) {
    create(1, $item`[2325]Staff of Ed`);
  }
  if (itemAmount($item`[2325]Staff of Ed`) === 0) {
    return false;
  }

  auto_log_info("Reveal the pyramid", "blue");
  if (in_koe()) {
    visitUrl("place.php?whichplace=exploathing_beach&action=expl_pyramidpre");
    cliExecute("refresh quests");
  } else {
    visitUrl("place.php?whichplace=desertbeach&action=db_pyramid1");
  }
  //check results of above URL visit
  if (internalQuestStatus("questL11Pyramid") > -1) {
    return true; //unlock successful
  } else {
    //unlock failed
    cliExecute("refresh quests"); //maybe it worked and mafia did not notice?
    if (internalQuestStatus("questL11Pyramid") > -1) {
      return true; //actually unlock did not fail.
    }

    const initial: number = get("desertExploration");
    const page: string = visitUrl("place.php?whichplace=desertbeach");
    const desert_matcher = page.match(/title="[(](\d+)% explored[)]"/s);
    if (desert_matcher) {
      const found: number = toInt(desert_matcher[1]);
      if (found !== initial) {
        auto_log_info(
          `Incorrectly had exploration value of ${initial} when it should be at ${found}. This was corrected. Trying to resume.`,
          "blue",
        );
        set("desertExploration", found);
        return true;
      }
      auto_abort(
        "Tried to open the Pyramid but could not. property desertExploration determined to be correct",
      );
    }
    auto_abort(
      "Tried to open the Pyramid but could not. could not verify the actual exploration amount of the desert",
    );
  }

  return false;
}

export const L11_unlockPyramidTask: QuestTask = registerQuestTask({
  name: "L11_unlockPyramid",
  completed: () => internalQuestStatus("questL11Pyramid") > -1,
  ready: () => true,
  do: L11_unlockPyramidDo,
});

function L11_unlockUpperChamberDo(): boolean {
  if (isActuallyEd()) {
    return true;
  }
  if (auto_reserveUndergroundAdventures()) {
    return false;
  }

  if (internalQuestStatus("questL03Rat") < 2) {
    auto_log_warning(
      "Uh oh, didn't do the tavern and we are at the pyramid....",
      "red",
    );
    // Forcing Tavern.
    set("auto_forceTavern", true);
    if (L3_tavern()) {
      return true;
    }
  }

  return autoAdv($location`The Upper Chamber`);
}

export const L11_unlockUpperChamberTask: QuestTask = registerQuestTask({
  name: "L11_unlockUpperChamber",
  completed: () => get("middleChamberUnlock"),
  ready: () => internalQuestStatus("questL11Pyramid") >= 0,
  do: L11_unlockUpperChamberDo,
  locations: $location`The Upper Chamber`,
});

function L11_unlockMiddleChamberDo(): boolean {
  if (isActuallyEd()) {
    return true;
  }
  if (auto_reserveUndergroundAdventures()) {
    return false;
  }

  if (internalQuestStatus("questL03Rat") < 2) {
    auto_log_warning(
      "Uh oh, didn't do the tavern and we are at the pyramid....",
      "red",
    );
    // Forcing Tavern.
    set("auto_forceTavern", true);
    if (L3_tavern()) {
      return true;
    }
  }

  auto_log_info(
    `In the pyramid (W:${itemAmount($item`crumbling wooden wheel`)}) (R:${itemAmount($item`tomb ratchet`)}) (U:${get("controlRoomUnlock")})`,
    "blue",
  );

  let total: number = itemAmount($item`crumbling wooden wheel`);
  total = total + itemAmount($item`tomb ratchet`);

  if (total >= 10 && myAdventures() >= 4 && get("controlRoomUnlock")) {
    visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
    let x: number = 0;
    while (x < 10) {
      if (itemAmount($item`crumbling wooden wheel`) > 0) {
        visitUrl(
          `choice.php?pwd&whichchoice=929&option=1&choiceform1=Use+a+wheel+on+the+peg&pwd=${myHash()}`,
        );
      } else {
        visitUrl("choice.php?whichchoice=929&option=2&pwd");
      }
      x = x + 1;
      if (x === 3 || x === 7 || x === 10) {
        visitUrl(
          `choice.php?pwd&whichchoice=929&option=5&choiceform5=Head+down+to+the+Lower+Chambers+%281%29&pwd=${myHash()}`,
        );
      }
      if (x === 3 || x === 7) {
        visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
      }
    }
    return true;
  }
  // Crumbling wooden wheels are more consistent for Blue vs. Red
  if (in_bluevsred()) {
    if (!get("controlRoomUnlock")) {
      // Blue team can't fight tomb rats
      if (bluevsred_isRed() && total < 10) {
        provideItem$2(400, $location`The Middle Chamber`, true);
      }
      return autoAdv($location`The Middle Chamber`);
    }
    providePlusNonCombat(
      auto_combatModCap(),
      $location`The Upper Chamber`,
      true,
    );
    return autoAdv($location`The Upper Chamber`);
  }

  if (get("controlRoomUnlock")) {
    if (
      !containsText(get("auto_banishes"), $monster`tomb servant`.toString()) &&
      !containsText(get("auto_banishes"), $monster`tomb asp`.toString()) &&
      get("olfactedMonster") !== $monster`tomb rat`
    ) {
      return autoAdv($location`The Upper Chamber`);
    }
  }

  if (total < 10) {
    // tomb ratchets have 20% drop rate
    provideItem$2(400, $location`The Middle Chamber`, true);
  }

  if (
    canSniff($monster`tomb rat`, $location`The Middle Chamber`) &&
    Cartography.mapTheMonsters()
  ) {
    auto_log_info("Attemping to use Map the Monsters to olfact a Tomb Rat.");
  }

  if (
    GreyGoose.haveGreyGoose() &&
    itemAmount($item`tangle of rat tails`) >= 1
  ) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at some rat kings.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }

  if (
    auto_can_equip($item`pro skateboard`) &&
    equipmentAmount($item`pro skateboard`) > 0 &&
    itemAmount($item`tangle of rat tails`) >= 1 &&
    !get("_epicMcTwistUsed") &&
    !in_pokefam()
  ) {
    auto_log_info("Be like Tony Hawk on a Tomb Rat King!");
    autoEquip($item`pro skateboard`);
  }

  return autoAdv($location`The Middle Chamber`);
}

export const L11_unlockMiddleChamberTask: QuestTask = registerQuestTask({
  name: "L11_unlockMiddleChamber",
  completed: () =>
    internalQuestStatus("questL11Pyramid") > 3 || get("pyramidBombUsed"),
  ready: () =>
    internalQuestStatus("questL11Pyramid") >= 0 && get("middleChamberUnlock"),
  do: L11_unlockMiddleChamberDo,
  locations: $locations`The Upper Chamber, The Middle Chamber`,
  desiredEncounters: () => {
    const remaining: number =
      10 -
      (itemAmount($item`crumbling wooden wheel`) +
        itemAmount($item`tomb ratchet`));
    return [
      { item: $item`crumbling wooden wheel`, needAmount: remaining },
      { item: $item`tomb ratchet`, needAmount: remaining },
    ];
  },
});

function L11_edDefeated(): boolean {
  return (
    itemAmount($item`[2334]Holy MacGuffin`) > 0 ||
    get("questL11Pyramid") === "finished"
  );
}

const L11_edTurnInTask: QuestTask = registerQuestTask({
  name: "L11_edTurnIn",
  completed: () => get("auto_L11CouncilVisited", false),
  ready: () => !get("auto_L11CouncilVisited") && L11_edDefeated(),
  do: () => {
    council();
    set("auto_L11CouncilVisited", true);
    return true;
  },
});

function L11_defeatEdDo(): boolean {
  if (L11_edDefeated()) {
    return runQuestTask(L11_edTurnInTask);
  }

  if (is_professor()) {
    return false; //need to wait until werewolf because can't survive combat long enough as a Prof
  }

  let baseML: number = monsterLevelAdjustment();
  if (in_heavyrains()) {
    baseML = baseML + 60;
  }
  if (baseML > 150) {
    for (const s of $slots`acc1, acc2, acc3`) {
      if (equippedItem(s) === $item`Hand in Glove`) {
        equip(s, $item.none);
      }
    }
    uneffect($effect`Ur-Kel's Aria of Annoyance`);
    if (possessEquipment($item`beer helmet`)) {
      autoEquip($item`beer helmet`);
    }
  }
  if (in_koe()) {
    retrieveItem(1, $item`low-pressure oxygen tank`);
    autoForceEquip$3($item`low-pressure oxygen tank`);
  }

  plumber_equipTool($stat`Moxie`);

  auto_log_info("Time to waste all of Ed's Ka Coins :(", "blue");

  set("auto_nextEncounter", "Ed the Undying");
  set("auto_nonAdvLoc", true);
  autoAdv($location`The Lower Chambers`);
  if (in_pokefam() || in_koe()) {
    cliExecute("refresh inv");
  }

  if (L11_edDefeated()) {
    return runQuestTask(L11_edTurnInTask);
  }
  return true;
}

export const L11_defeatEdTask: QuestTask = registerQuestTask({
  name: "L11_defeatEd",
  completed: () => get("auto_L11CouncilVisited", false),
  ready: () => {
    if (get("auto_L11CouncilVisited", false)) {
      return false;
    }
    if (L11_edDefeated()) {
      return true;
    }
    return (
      internalQuestStatus("questL11Pyramid") === 3 &&
      get("pyramidBombUsed") &&
      myAdventures() - auto_advToReserve() > 7
    );
  },
  do: L11_defeatEdDo,
  locations: $location`The Lower Chambers`,
  desiredEncounters: () => [
    {
      monster: $monster`Ed the Undying`,
      needAmount: 1 - itemAmount($item`[2334]Holy MacGuffin`),
    },
  ],
  reqAdventures: () =>
    internalQuestStatus("questL11Pyramid") === 3 && get("pyramidBombUsed")
      ? 7
      : 0,
});

export function L11_pyramidNeedDrumMachine(): boolean {
  return (
    (get("gnasirProgress") & 16) === 0 &&
    auto_is_valid($item`drum machine`) &&
    !itemAmount($item`drum machine`) &&
    get("questL11Desert") !== "finished"
  );
}

export function L11_pyramidNeedTombRatchet(): boolean {
  return (
    itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      10 && !get("pyramidBombUsed")
  );
}
