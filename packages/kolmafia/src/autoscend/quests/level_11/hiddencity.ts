import {
  availableChoiceOptions,
  council,
  creatableAmount,
  create,
  currentRound,
  haveEffect,
  hiddenTempleUnlocked,
  inHardcore,
  itemAmount,
  lastMonster,
  Location,
  myAdventures,
  myAscensions,
  myDaycount,
  myFamiliar,
  myLevel,
  myMeat,
  numericModifier,
  splitString,
  turnsUntilForcedNoncombat,
  use,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $phylum,
  $skill,
  $slot,
  get,
  have,
  set,
} from "libram";

import { auto_advToReserve } from "../../../autoscend";
import {
  Bofa,
  CamelSpit,
  CandyCane,
  Cartography,
  GreyGoose,
  L11_HiddenTemple,
  MonkeyPaw,
  Peridot,
  SealClubbingClub,
  Snapper,
  SwordOfSwords,
  TearawayPants,
} from "../../../types";
import {
  auto_canDrink,
  autoDrink,
  expectedAdventuresFrom,
  inebriety_left,
} from "../../auto_consume";
import {
  autoEquip,
  autoEquipToSlot,
  autoForceEquip$3,
  possessEquipment,
} from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { provideFamExp$3 } from "../../auto_providers";
import { zone_delay } from "../../auto_zone";
import { replaceMonsterCombatString } from "../../combat/auto_combat_util";
import {
  isAvailable,
  NoncombatForcing,
  QuestTask,
  runQuestTask,
  runTaskChain,
} from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv } from "../../executors/auto_adventure";
import {
  auto_buyUpTo,
  canPull,
  npcStoreDiscountMulti,
  pullXWhenHaveY,
} from "../../helpers/auto_acquire";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import {
  auto_have_familiar,
  handleFamiliar,
  handleFamiliar$1,
  pathHasFamiliar,
} from "../../helpers/auto_familiar";
import { acquireHP, acquireMP, uneffect } from "../../helpers/auto_restore";
import { in_wotsf } from "../../paths/2011/way_of_the_surprising_fist";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import { in_glover } from "../../paths/2018/g_lover";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_tcrs } from "../../paths/2019/two_crazy_random_summer";
import { in_quantumTerrarium } from "../../paths/2021/quantum_terrarium";
import { in_robot } from "../../paths/2021/you_robot";
import { in_aosol } from "../../paths/2023/avatar_of_shadows_over_loathing";
import { in_lol } from "../../paths/2023/legacy_of_loathing";
import { in_small } from "../../paths/2023/small";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import { in_wereprof, is_werewolf } from "../../paths/2024/wereprofessor";
import {
  bluevsred_isBlue,
  bluevsred_willEncounterFight,
  in_bluevsred,
} from "../../paths/2026/blue_vs_red";
import {
  auto_abort,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  auto_can_equip,
  auto_canForceNextNoncombat,
  auto_combat_appearance_rates$1,
  auto_forceNextNoncombatIfWorthIt,
  auto_haveQueuedForcedNonCombat,
  auto_is_valid,
  auto_is_valid$2,
  auto_runChoice,
  auto_shouldDelayForForcedNonCombat,
  auto_wishForEffect,
  canSniff,
  internalQuestStatus,
} from "../../utils/auto_util";
import { maximizer } from "../../utils/maximizer";

function L11_unlockHiddenCityDo(): boolean {
  auto_log_info("Searching for the Hidden City", "blue");
  if (!in_glover() && !in_tcrs()) {
    // BaaBaabaran is the best source of stone wool
    if (runQuestTask(L11_HiddenTemple.LX_killBaaBaaBuranTask)) {
      return true;
    }

    if (
      itemAmount($item`stone wool`) === 0 &&
      haveEffect($effect`Stone-Faced`) === 0
    ) {
      //try to pull stone wool
      pullXWhenHaveY($item`stone wool`, 1, 0);
    }

    buffMaintain$2($effect`Stone-Faced`);
    if (haveEffect($effect`Stone-Faced`) === 0) {
      if (isAboutToPowerlevel()) {
        //we ran out of other quests to do. stop waiting for optimal conditions
        //TODO replace this abort with a function that adventures in the ziggurat for stone wool.
        auto_abort(
          "We need [Stone Wool] to unlock the hidden city and were unable to get it via Lucky!. This scenario is not currently automated. Please manually acquire 2 [Stone Wool] then run autoscend again.",
        );
      } else {
        //go do other things while we keep waiting for semirare
        return false;
      }
    }
  } else if (in_glover()) {
    if (haveEffect($effect`Stone-Faced`) === 0) {
      auto_wishForEffect($effect`Stone-Faced`);
    } else {
      return false;
    }
  }
  return autoAdv($location`The Hidden Temple`);
}

export const L11_unlockHiddenCityTask: QuestTask = registerQuestTask({
  name: "L11_unlockHiddenCity",
  completed: () => internalQuestStatus("questL11Worship") > 2,
  ready: () =>
    hiddenTempleUnlocked() &&
    internalQuestStatus("questL11Worship") >= 0 &&
    myAdventures() - auto_advToReserve() > 3 &&
    myLevel() >= 11, // Choice isn't available until L11
  do: L11_unlockHiddenCityDo,
  locations: $location`The Hidden Temple`,
  reqAdventures: () =>
    hiddenTempleUnlocked() && internalQuestStatus("questL11Worship") >= 0
      ? 3
      : 0,
});

export function liana_cleared(loc: Location): boolean {
  //need to check the combat names due to wanderers
  //we are assuming victory. you could have potentially fought liana without machete and then ran away. but you we are assuming you didn't
  let dense_liana_defeated: number = 0;
  const area_combats_seen: Map<number, string> = new Map(
    splitString(loc.combatQueue, "; ").map((_v, _i) => [_i, _v]),
  );
  for (const [, s] of area_combats_seen) {
    if (s === "dense liana") {
      dense_liana_defeated += 1;
    }
  }
  return dense_liana_defeated > 2;
}

function L11_hiddenTavernUnlock(force: boolean = false): boolean {
  if (!auto_is_valid($item`book of matches`)) {
    return false;
  }

  if (myAscensions() === get("hiddenTavernUnlock")) {
    return true;
  }

  if (force) {
    if (!inHardcore()) {
      pullXWhenHaveY($item`book of matches`, 1, 0);
      if (itemAmount($item`book of matches`) === 0) {
        MonkeyPaw.makeMonkeyPawWish$1($item`book of matches`);
      }
    }
  }

  if (myAscensions() > get("hiddenTavernUnlock")) {
    if (itemAmount($item`book of matches`) > 0) {
      use(1, $item`book of matches`);
      return true;
    }
    return false;
  }
  return true;
}

export function hiddenCityChoiceHandler(choice: number): void {
  if (choice === 780) {
    // Action Elevator (The Hidden Apartment Building)
    if (haveEffect($effect`Thrice-Cursed`) > 0) {
      auto_runChoice(1); // fight the spirit
    } else if (
      4 in availableChoiceOptions() &&
      haveEffect($effect`Thrice-Cursed`) === 0
    ) {
      // Use CCSC to get Cursed +1
      auto_runChoice(4);
      if (haveEffect($effect`Thrice-Cursed`) > 0) {
        auto_runChoice(1); // fight the spirit
      } else {
        auto_runChoice(2); // get cursed
      }
    } else {
      auto_runChoice(2); // get cursed
    }
  } else if (choice === 781) {
    // Earthbound and Down (An Overgrown Shrine (Northwest))
    if (get("hiddenApartmentProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Apartment Building
    } else if (itemAmount($item`moss-covered stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 783) {
    // Water You Dune (An Overgrown Shrine (Southwest))
    if (get("hiddenHospitalProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Hospital
    } else if (itemAmount($item`dripping stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 784) {
    // You, M. D. (The Hidden Hospital)
    auto_runChoice(1); // fight the spirit
  } else if (choice === 785) {
    // Air Apparent (An Overgrown Shrine (Northeast))

    if (get("hiddenOfficeProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Office Building
    } else if (
      itemAmount(
        // either use CCSC + unlock or just unlock based on user sphere presence
        $item`crackling stone sphere`,
      ) > 0
    ) {
      if (4 in availableChoiceOptions()) {
        auto_runChoice(4); // get free meat via CCSC
      }
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 786) {
    // Working Holiday (The Hidden Office Building)
    if (itemAmount($item`McClusky file (complete)`) > 0) {
      auto_runChoice(1); // fight the spirit
    } else if (itemAmount($item`boring binder clip`) === 0) {
      auto_runChoice(2); // get boring binder clip
    } else {
      auto_runChoice(3); // fight an accountant
    }
  } else if (choice === 787) {
    // Fire When Ready (An Overgrown Shrine (Southeast))
    if (get("hiddenBowlingAlleyProgress") === 0) {
      auto_runChoice(1); // unlock the Hidden Bowling Alley
    } else if (itemAmount($item`scorched stone sphere`) > 0) {
      auto_runChoice(2); // get the stone triangle
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 788) {
    // Life is Like a Cherry of Bowls (The Hidden Bowling Alley)
    if (2 in availableChoiceOptions()) {
      auto_runChoice(2); // bowl for stats 4 times then fight the spirit on 5th occurrence
      auto_runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    } else {
      auto_runChoice(1); // bowl for stats 4 times then fight the spirit on 5th occurrence
    }
  } else if (choice === 789) {
    // Where Does The Lone Ranger Take His Garbagester? (The Hidden Park)
    if (get("relocatePygmyJanitor") !== myAscensions()) {
      auto_runChoice(2); // Relocate the Pygmy Janitor to the park
    } else {
      auto_runChoice(1); // Get Hidden City zone items
    }
  } else if (choice === 791) {
    // Legend of the Temple in the Hidden City (A Massive Ziggurat)
    if (itemAmount($item`stone triangle`) === 4) {
      auto_runChoice(1); // fight the Protector Spirit (or replacement)
    } else {
      auto_runChoice(6); // skip
    }
  } else if (choice === 1002) {
    // Temple of the Legend in the Hidden City (A Massive Ziggurat/Actually Ed the Undying)
    if (itemAmount($item`stone triangle`) === 4) {
      auto_runChoice(1); // Put the Ancient Amulet back
    } else {
      auto_runChoice(6); // skip
    }
  } else {
    auto_abort("unhandled choice in hiddenCityChoiceHandler");
  }
}

export const L11_hiddenCityTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCity",
  completed: () =>
    internalQuestStatus("questL11Worship") > 4 ||
    itemAmount($item`[2180]ancient amulet`) > 0 ||
    (isActuallyEd() && itemAmount($item`[7963]ancient amulet`) > 0),
  ready: () => internalQuestStatus("questL11Worship") >= 3,
  do: () => {
    if (
      internalQuestStatus("questL11Curses") > 1 ||
      itemAmount($item`moss-covered stone sphere`) > 0
    ) {
      uneffect($effect`Thrice-Cursed`);
    }
    //can we handle this zone?
    if (!in_pokefam() && !in_darkGyffte() && !in_aosol() && !in_wereprof()) {
      if (!acquireHP()) {
        //try to restore HP to max.
        auto_log_warning(
          "Delaying hidden city because we are unable to restore HP",
        );
        return false; //could not heal HP. we should go do something else first
      }
    }
    if (in_robot() && myLevel() < 13) {
      return false;
    }

    const weapon_ghost_dmg: number = Math.trunc(
      numericModifier($modifier`Hot Damage`) +
        numericModifier($modifier`Cold Damage`) +
        numericModifier($modifier`Stench Damage`) +
        numericModifier($modifier`Sleaze Damage`) +
        numericModifier($modifier`Spooky Damage`),
    );
    if (
      !in_robot() &&
      !in_darkGyffte() &&
      weapon_ghost_dmg < 20 &&
      !acquireMP(
        //we can not rely on melee/ranged weapon to kill the ghost
        30,
        0,
      )
    ) {
      //try getting some MP, relying on a spell to kill them instead. TODO verify we have a spell
      auto_log_warning(
        "We can not reliably kill Specters in hidden city due to a shortage of MP and elemental weapon dmg. Delaying zone",
        "red",
      );
      return false;
    }

    return runTaskChain([
      L11_hiddenApartmentTask,
      L11_hiddenOfficeTask,
      L11_hiddenBowlingAlleyTask,
      L11_hiddenHospitalTask,
      L11_overgrownShrineNorthwestTask,
      L11_overgrownShrineNortheastTask,
      L11_overgrownShrineSouthwestTask,
      L11_overgrownShrineSoutheastTask,
      L11_massiveZigguratTask,
    ]);
  },
  desiredEncounters: () => [
    {
      monster: $monster`pygmy witch accountant`,
      needAmount: L11_missingMcCluskyFiles(),
    },
  ],
});

function L11_hiddenApartmentDo(): boolean {
  auto_log_info("The idden [sic] apartment!", "blue");

  let elevatorAction: boolean =
    !zone_delay($location`The Hidden Apartment Building`).shouldDelay ||
    auto_haveQueuedForcedNonCombat();

  let canDrinkCursedPunch: boolean =
    auto_canDrink($item`Cursed Punch`) &&
    !get("auto_limitConsume", false) &&
    !in_tcrs() &&
    !in_small();
  //todo: in_tcrs check quality and size of cursed punch instead of skipping? if that is possible

  let cursesNeeded: number = 3;
  if (haveEffect($effect`Once-Cursed`) > 0) {
    cursesNeeded = 2;
  }
  if (haveEffect($effect`Twice-Cursed`) > 0) {
    cursesNeeded = 1;
  }
  if (CandyCane.haveCCSC()) {
    cursesNeeded -= 1;
  }
  //able to drink, enough liver?
  if (canDrinkCursedPunch) {
    let inebrietyAllowedForPunch: number = inebriety_left();
    if (in_quantumTerrarium() && myFamiliar() === $familiar`Stooper`) {
      //in QT the limit is lower or else will be overdrunk when Stooper changes
      inebrietyAllowedForPunch -= 1;
    }

    if (
      inebrietyAllowedForPunch <
      cursesNeeded * $item`Cursed Punch`.inebriety
    ) {
      canDrinkCursedPunch = false;
    }
  }

  if (
    !elevatorAction &&
    $location`The Hidden Apartment Building`.turnsSpent <= 4 &&
    auto_canForceNextNoncombat()
  ) {
    //should we try to force the noncombat?
    let shouldForceElevatorAction: boolean = false;

    if (
      haveEffect($effect`Thrice-Cursed`) > 0 ||
      (haveEffect($effect`Twice-Cursed`) > 0 && CandyCane.haveCCSC())
    ) {
      shouldForceElevatorAction = true;
    } else if (canDrinkCursedPunch) {
      if (get("auto_consumeMinAdvPerFill") !== 0) {
        //try to respect user setting for cursed punch while there is apartment delay
        //give it at least +1 adv that it saves fighting a pygmy shaman
        const advPerFillFromCursedPunch: number = Math.trunc(
          (expectedAdventuresFrom($item`Cursed Punch`) + 1) /
            $item`Cursed Punch`.inebriety,
        );
        if (advPerFillFromCursedPunch < get("auto_consumeMinAdvPerFill")) {
          canDrinkCursedPunch = false;
        }
      }
      //can drink and inebriety allows it
      if (canDrinkCursedPunch) {
        const canBuyCursedPunch: boolean =
          myMeat() >= cursesNeeded * 500 * npcStoreDiscountMulti() &&
          !is_werewolf(); //can't buy cursed punch as a werewolf

        if (canBuyCursedPunch) {
          L11_hiddenTavernUnlock(true);

          if (myAscensions() === get("hiddenTavernUnlock")) {
            shouldForceElevatorAction = true;
          }
        }
      }
    }

    if (shouldForceElevatorAction) {
      // If we're forcing a NC and it's not ready yet
      if (
        auto_shouldDelayForForcedNonCombat(
          $location`The Hidden Apartment Building`,
        )
      ) {
        return false;
      }

      elevatorAction = auto_forceNextNoncombatIfWorthIt(
        $location`The Hidden Apartment Building`,
      );
      // Bail if the NC forcer isn't armed yet
      if (
        !elevatorAction &&
        auto_shouldDelayForForcedNonCombat(
          $location`The Hidden Apartment Building`,
        )
      ) {
        return false;
      }
      // delay if we are out of NC forcers and haven't run out of things to do
      if (
        !elevatorAction &&
        myDaycount() < get("auto_runDayCount", 0) &&
        !isAboutToPowerlevel()
      ) {
        return false;
      }
    }
  }

  if (!elevatorAction) {
    auto_log_info(
      `Hidden Apartment Progress: ${get("hiddenApartmentProgress")}`,
      "blue",
    );

    const turnsUntilElevatorAction: number = zone_delay(
      $location`The Hidden Apartment Building`,
    ).delayRemaining;

    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
    ) {
      if (
        haveEffect($effect`Thrice-Cursed`) < turnsUntilElevatorAction + 1 &&
        (auto_combat_appearance_rates$1(
          $location`The Hidden Apartment Building`,
        ).get($monster`pygmy shaman`) ?? 0.0) < 100
      ) {
        handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of shamen. the deleveling can also help survive being cursed
      } else if (
        (auto_combat_appearance_rates$1(
          $location`The Hidden Office Building`,
        ).get($monster`pygmy witch accountant`) ?? 0.0) >= 20 &&
        itemAmount($item`McClusky file (complete)`) === 0
      ) {
        //once done with curses will want witch accountants
        if (
          itemAmount($item`McClusky file (page 4)`) === 0 ||
          get("nosyNoseMonster") === $monster`pygmy witch accountant`
        ) {
          handleFamiliar$1($familiar`Nosy Nose`);
        }
      }
    }
    return autoAdv($location`The Hidden Apartment Building`);
  } else {
    if (haveEffect($effect`Thrice-Cursed`) === 0) {
      //can drink and inebriety allows it
      if (canDrinkCursedPunch) {
        L11_hiddenTavernUnlock(true);
        if (myAscensions() === get("hiddenTavernUnlock") && !is_werewolf()) {
          auto_buyUpTo(cursesNeeded, $item`Cursed Punch`);
          if (itemAmount($item`Cursed Punch`) < cursesNeeded) {
            auto_abort(
              "Could not acquire Cursed Punch, unable to deal with Hidden Apartment Properly",
            );
          }
          autoDrink(cursesNeeded, $item`Cursed Punch`);
        }
      }
    } else {
      set(
        "auto_nextEncounter",
        "ancient protector spirit (The Hidden Apartment Building)",
      );
    }
    auto_log_info(
      `Hidden Apartment Progress: ${get("hiddenApartmentProgress")}`,
      "blue",
    );
    return autoAdv($location`The Hidden Apartment Building`);
  }
}

const L11_hiddenApartmentTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_hiddenApartment",
    completed: () =>
      internalQuestStatus("questL11Curses") > 0 ||
      haveEffect($effect`Ancient Fortitude`) > 0,
    ready: () => internalQuestStatus("questL11Curses") === 0,
    do: L11_hiddenApartmentDo,
    locations: $location`The Hidden Apartment Building`,
    desiredEncounters: () => {
      // Will encounter boss next turn
      if (
        (haveEffect($effect`Thrice-Cursed`) || -1) >
        turnsUntilForcedNoncombat($location`The Hidden Apartment Building`)
      ) {
        return [];
      }
      // If we need to refresh it, or need one more curse
      if (have($effect`Twice-Cursed`) || have($effect`Thrice-Cursed`)) {
        return [{ needAmount: 1, monster: $monster`pygmy shaman` }];
      }
      // If we need 2 more stacks
      if (have($effect`Once-Cursed`)) {
        return [{ needAmount: 2, monster: $monster`pygmy shaman` }];
      }
      return [{ needAmount: 3, monster: $monster`pygmy shaman` }];
    },
    forcedNonCombats: () => {
      if (!zone_delay($location`The Hidden Apartment Building`).shouldDelay) {
        return [];
      }
      // forcing the elevator noncombat is only useful once we're cursed enough for it
      const cursedEnough: boolean =
        haveEffect($effect`Thrice-Cursed`) > 0 ||
        (haveEffect($effect`Twice-Cursed`) > 0 && CandyCane.haveCCSC());
      return [
        {
          turnsRequiredForSetup: cursedEnough ? 0 : -1,
          combatRateControlled: false,
        },
      ];
    },
  },
);

//files are obtained in order
function L11_missingMcCluskyFiles(): number {
  if (
    get("hiddenOfficeProgress") >= 7 ||
    itemAmount($item`McClusky file (complete)`) > 0
  ) {
    return 0;
  } else if (itemAmount($item`McClusky file (page 5)`) > 0) {
    return 0;
  } else if (itemAmount($item`McClusky file (page 4)`) > 0) {
    return 1;
  } else if (itemAmount($item`McClusky file (page 3)`) > 0) {
    return 2;
  } else if (itemAmount($item`McClusky file (page 2)`) > 0) {
    return 3;
  } else if (itemAmount($item`McClusky file (page 1)`) > 0) {
    return 4;
  } else {
    return 5;
  }
}

function L11_hiddenOfficeDo(): boolean {
  auto_log_info("The idden [sic] office!", "blue");

  if (creatableAmount($item`McClusky file (complete)`) > 0) {
    create(1, $item`McClusky file (complete)`);
    if (itemAmount($item`McClusky file (complete)`) === 0) {
      auto_abort("Failed to create $item[McClusky file (complete)]");
    }
  }

  const turnsUntilWorkingHoliday = zone_delay(
    $location`The Hidden Office Building`,
  ).delayRemaining;
  let workingHoliday: boolean =
    turnsUntilWorkingHoliday === 0 || auto_haveQueuedForcedNonCombat();

  if (
    turnsUntilWorkingHoliday > 1 &&
    itemAmount($item`McClusky file (complete)`) > 0 &&
    auto_canForceNextNoncombat()
  ) {
    if (
      auto_forceNextNoncombatIfWorthIt($location`The Hidden Office Building`)
    ) {
      //how many delay turns should this save to be considered?
      workingHoliday = true;
    } else if (
      auto_shouldDelayForForcedNonCombat($location`The Hidden Office Building`)
    ) {
      // Bail if the NC forcer isn't armed yet
      return false;
    } else if (
      myDaycount() < get("auto_runDayCount", 0) &&
      !isAboutToPowerlevel()
    ) {
      // delay if we are out of NC forcers and haven't run out of things to do
      return false;
    }
  }

  if (!workingHoliday && L11_missingMcCluskyFiles() > 0) {
    //need more accountants
    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1(
        $location`The Hidden Office Building`,
      ).get($monster`pygmy witch accountant`) ?? 0.0) < 100
    ) {
      handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
    }
  }

  auto_log_info(
    `Hidden Office Progress: ${get("hiddenOfficeProgress")}`,
    "blue",
  );

  if (
    workingHoliday &&
    itemAmount($item`boring binder clip`) > 0 &&
    L11_missingMcCluskyFiles() > 0 &&
    (auto_combat_appearance_rates$1(
      $location`The Hidden Apartment Building`,
    ).get($monster`pygmy witch accountant`) ?? 0.0) >=
      L11_missingMcCluskyFiles() * 25
  ) {
    //Hidden Apartment unmodified 25% chance of accountant is better if only 1 missingMcCluskyFiles
    //office noncombat is already one guaranteed accountant so with more missingMcCluskyFiles only go Apartment if better rate
    auto_log_info(
      "About to meet the boss in the Hidden Office. Trying to gather missing files in the Apartment instead to save delay.",
      "blue",
    );
    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
    ) {
      handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
    }
    return autoAdv($location`The Hidden Apartment Building`);
  }

  if (workingHoliday && itemAmount($item`McClusky file (complete)`) > 0) {
    set(
      "auto_nextEncounter",
      "ancient protector spirit (The Hidden Office Building)",
    );
  }
  return autoAdv($location`The Hidden Office Building`);
}

const L11_hiddenOfficeTask: QuestTask = registerQuestTask(L11_hiddenCityTask, {
  name: "L11_hiddenOffice",
  completed: () => internalQuestStatus("questL11Business") > 0,
  ready: () =>
    (internalQuestStatus("questL11Curses") > 0 ||
      haveEffect($effect`Ancient Fortitude`) > 0) &&
    myAdventures() + $location`The Hidden Office Building`.turnsSpent >= 11,
  do: L11_hiddenOfficeDo,
  locations: $locations`The Hidden Office Building, The Hidden Apartment Building`,
  forcedNonCombats: () => {
    const { shouldDelay } = zone_delay($location`The Hidden Office Building`);
    if (!shouldDelay) {
      return [];
    }
    return [
      {
        // the noncombat only skips fights once the files are assembled
        turnsRequiredForSetup:
          itemAmount($item`McClusky file (complete)`) > 0 ? 0 : -1,
        combatRateControlled: false,
      } as NoncombatForcing,
    ];
  },
});

// progress is 1 once the alley is opened, and each of the 5 bowls raises it by 1
export function L11_bowlingBallsNeeded(): number {
  return (
    6 -
    Math.max(get("hiddenBowlingAlleyProgress"), 1) -
    itemAmount($item`bowling ball`)
  );
}

function L11_hiddenBowlingAlleyDo(): boolean {
  auto_log_info("The idden [sic] bowling alley!", "blue");
  L11_hiddenTavernUnlock(true);
  if (myAscensions() === get("hiddenTavernUnlock")) {
    if (
      itemAmount($item`Bowl of Scorpions`) === 0 &&
      !is_werewolf() &&
      get("_drunkPygmyBanishes") < 11
    ) {
      //can't access shops as werewolf
      auto_buyUpTo(1, $item`Bowl of Scorpions`);
      if (in_ocrs()) {
        auto_buyUpTo(3, $item`Bowl of Scorpions`);
      }
    }
  }
  if (
    itemAmount($item`bowling ball`) > 0 &&
    get("hiddenBowlingAlleyProgress") === 5
  ) {
    set(
      "auto_nextEncounter",
      "ancient protector spirit (The Hidden Bowling Alley)",
    );
  } else if (
    // If we're not going to bowling ball it
    itemAmount($item`bowling ball`) === 0 &&
    // If we still want to sword some monsters
    L11_wantsPygmyBowlerWandererHunt(true) &&
    // If we're not even ensured of our next fight
    get("auto_nextEncounter") === $monster.none
  ) {
    return false;
  }

  buffMaintain$2($effect`Fishy Whiskers`);
  auto_log_info(
    `Hidden Bowling Alley Progress: ${get("hiddenBowlingAlleyProgress")}`,
    "blue",
  );
  if (
    (!Peridot.havePeridot() ||
      Peridot.haveUsedPeridot($location`The Hidden Bowling Alley`)) &&
    canSniff($monster`pygmy bowler`, $location`The Hidden Bowling Alley`) &&
    itemAmount($item`bowling ball`) < 1 &&
    Cartography.mapTheMonsters()
  ) {
    auto_log_info(
      "Attemping to use Map the Monsters to olfact a Pygmy Bowler.",
    );
  }
  if (
    !get("_auto_thisLoopHandleFamiliar") &&
    CamelSpit.canCamelSpit() &&
    get("hiddenBowlingAlleyProgress") < 2
  ) {
    auto_log_info(
      "Bringing the Camel to spit on a Pygmy Bowler for bowling balls.",
    );
    handleFamiliar$1($familiar`Melodramedary`);
  }
  if (
    !get("_auto_thisLoopHandleFamiliar") &&
    GreyGoose.haveGreyGoose() &&
    get("hiddenBowlingAlleyProgress") < 3
  ) {
    auto_log_info(
      "Bringing the Grey Goose to emit some drones at a Pygmy Bowler for bowling balls.",
    );
    handleFamiliar$1($familiar`Grey Goose`);
  }
  return autoAdv($location`The Hidden Bowling Alley`);
}

export const L11_hiddenBowlingAlleyTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_hiddenBowlingAlley",
    completed: () => internalQuestStatus("questL11Spare") > 0,
    ready: () => true,
    do: L11_hiddenBowlingAlleyDo,
    locations: $location`The Hidden Bowling Alley`,
    desiredEncounters: () => [
      {
        item: $item`bowling ball`,
        needAmount: L11_bowlingBallsNeeded(),
      },
    ],
  },
);

function L11_hiddenHospitalDo(): boolean {
  if (itemAmount($item`dripping stone sphere`) > 0) {
    return true;
  }
  auto_log_info("The idden [sic] ospital!", "blue");

  autoEquip($item`bloodied surgical dungarees`);
  autoEquip($item`half-size scalpel`);
  autoEquip($item`surgical apron`);
  autoEquipToSlot($slot`acc3`, $item`head mirror`);
  autoEquipToSlot($slot`acc2`, $item`surgical mask`);

  let surgeonGearWanted: number = 0;
  for (const it of $items`bloodied surgical dungarees, half-size scalpel, surgical apron, head mirror, surgical mask`) {
    if (!possessEquipment(it) && auto_can_equip(it)) {
      surgeonGearWanted += 1;
    }
  }
  if (surgeonGearWanted > 0) {
    //need more surgeons?
    if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1($location`The Hidden Hospital`).get(
        $monster`pygmy witch surgeon`,
      ) ?? 0.0) < 100
    ) {
      if (
        surgeonGearWanted >= 2 ||
        get("nosyNoseMonster") === $monster`pygmy witch surgeon`
      ) {
        handleFamiliar$1($familiar`Nosy Nose`); //whiff increases chance of witch accountant
      }
    }
  }
  auto_log_info(
    `Hidden Hospital Progress: ${get("hiddenHospitalProgress")}`,
    "blue",
  );
  return autoAdv($location`The Hidden Hospital`);
}

const L11_hiddenHospitalTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_hiddenHospital",
    completed: () => internalQuestStatus("questL11Doctor") > 0,
    ready: () => internalQuestStatus("questL11Doctor") === 0,
    do: L11_hiddenHospitalDo,
    locations: $location`The Hidden Hospital`,
  },
);

const L11_overgrownShrineNorthwestTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_overgrownShrineNorthwest",
    completed: () => itemAmount($item`moss-covered stone sphere`) === 0,
    ready: () => itemAmount($item`moss-covered stone sphere`) > 0,
    do: () => {
      auto_log_info("Getting the stone triangles", "blue");
      return autoAdv($location`An Overgrown Shrine (Northwest)`);
    },
    locations: $location`An Overgrown Shrine (Northwest)`,
  },
);

const L11_overgrownShrineNortheastTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_overgrownShrineNortheast",
    completed: () => get("hiddenOfficeProgress") >= 8,
    ready: () => itemAmount($item`crackling stone sphere`) > 0,
    do: () => {
      auto_log_info("Getting the stone triangles", "blue");
      return autoAdv($location`An Overgrown Shrine (Northeast)`);
    },
    locations: $location`An Overgrown Shrine (Northeast)`,
  },
);

const L11_overgrownShrineSouthwestTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_overgrownShrineSouthwest",
    completed: () => get("hiddenHospitalProgress") >= 8,
    ready: () => itemAmount($item`dripping stone sphere`) > 0,
    do: () => {
      auto_log_info("Getting the stone triangles", "blue");
      return autoAdv($location`An Overgrown Shrine (Southwest)`);
    },
    locations: $location`An Overgrown Shrine (Southwest)`,
  },
);

const L11_overgrownShrineSoutheastTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_overgrownShrineSoutheast",
    completed: () => internalQuestStatus("hiddenBowlingAlleyProgress") >= 8,
    ready: () => itemAmount($item`scorched stone sphere`) > 0,
    do: () => {
      auto_log_info("Getting the stone triangles", "blue");
      return autoAdv($location`An Overgrown Shrine (Southeast)`);
    },
    locations: $location`An Overgrown Shrine (Southeast)`,
  },
);

const L11_massiveZigguratTask: QuestTask = registerQuestTask(
  L11_hiddenCityTask,
  {
    name: "L11_massiveZiggurat",
    completed: () => itemAmount($item`stone triangle`) < 4,
    ready: () => true,
    do: () => {
      auto_log_info("Fighting the out-of-work spirit", "blue");
      acquireHP();
      //AoSOL buffs
      if (in_aosol()) {
        buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
        buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
      }
      set("auto_nextEncounter", "Protector Spectre");
      handleFamiliar("boss");
      const advSpent: boolean = autoAdv($location`A Massive Ziggurat`);
      if (internalQuestStatus("questL11MacGuffin") > 2) {
        // Actually Ed finishes this quest when all 3 parts of the staff are returned
        council();
      }
      return advSpent;
    },
    locations: $location`A Massive Ziggurat`,
    desiredEncounters: () => [
      {
        monster: $monster`Protector Spectre`,
        needAmount: 1,
      },
    ],
  },
);

export function L11_hiddenCity(): boolean {
  return runQuestTask(L11_hiddenCityTask);
}

export function L11_swordWantsBowlingMonster(
  ignoreWillingToSwitch: boolean = false,
): boolean {
  if (!SwordOfSwords.swordFamiliarWantsMonsterDrops($monster`pygmy bowler`)) {
    return false;
  }

  if (SwordOfSwords.swordIsTracking($monster`pygmy bowler`)) {
    return true;
  }

  if (ignoreWillingToSwitch) return true;

  return SwordOfSwords.swordIsWillingToSwitchTargets();
}

export function L11_wantsPygmyBowlerWandererHunt(
  ignoreWillingToSwitch: boolean = false,
): boolean {
  // TODO This needs to be improved on, it was hardcoded hackish, and now I've successfully updated my code enough that it's going to be problematic
  // This hunt is only relevant to the Blue vs. Red strategy.
  if (!bluevsred_isBlue()) return false;

  // Don't hunt a bowler unless the sword currently wants one.
  if (!L11_swordWantsBowlingMonster(ignoreWillingToSwitch)) return false;

  // We need a way to force the bowler encounter.
  if (
    SealClubbingClub.clubIntoNextWeekTimesRemaining() === 0 &&
    get("clubEmNextWeekMonster") === $monster.none
  ) {
    return false;
  }

  // Don't hunt a bowler if our replacement setup can't handle it.
  if (replaceMonsterCombatString($monster`pygmy bowler`) === undefined) {
    return false;
  }

  // Bowling Alley progress increases when we spend a bowling ball, so a ball
  // already in inventory effectively puts us one encounter ahead. Stop once
  // the remaining progress no longer justifies forcing a bowler.
  if (itemAmount($item`bowling ball`) + get("hiddenBowlingAlleyProgress") > 3) {
    return false;
  }

  // There's no reason to hunt a bowler if we can't currently use the alley.
  if (!isAvailable(L11_hiddenBowlingAlleyTask)) return false;

  // Don't spend a wanderer on a bowler we're already going to encounter.
  if (bluevsred_willEncounterFight($monster`pygmy bowler`)) return false;

  // If the caller doesn't want to ignore the sword's switching willingness, and the sword isn't willing to switch
  if (
    !ignoreWillingToSwitch &&
    !SwordOfSwords.swordIsWillingToSwitchTargets()
  ) {
    return false;
  }

  // Don't try to schedule another bowler while we're already fighting one.
  if (currentRound() !== 0 && lastMonster() === $monster`pygmy bowler`) {
    return false;
  }

  return true;
}

export function L11_hiddenCityZonesCanUseMachete(): boolean {
  return (
    !is_boris() &&
    !in_wotsf() &&
    !in_pokefam() &&
    !in_avantGuard() &&
    !(in_bluevsred() && bluevsred_isBlue())
  );
}

function hiddenParkBurningDelay(): boolean {
  return (
    $location`The Hidden Park`.turnsSpent < 7 &&
    L11_hiddenCityZonesCanUseMachete() &&
    !possessEquipment($item`antique machete`) &&
    !possessEquipment($item`muculent machete`) &&
    (inHardcore() || in_lol())
  );
}

function L11_hiddenCityZonesNeedPark(): boolean {
  const needRelocate: boolean = get("relocatePygmyJanitor") !== myAscensions();
  return hiddenParkBurningDelay() || needRelocate;
}

function L11_hiddenCityZonesEquipMachete(): boolean {
  if (!L11_hiddenCityZonesCanUseMachete()) {
    return false; //combats aren't free so no point in equipping a Machete
  }
  if (auto_can_equip($item`antique machete`)) {
    if (possessEquipment($item`antique machete`)) {
      return autoForceEquip$3($item`antique machete`);
    } else if (
      !possessEquipment($item`muculent machete`) &&
      canPull($item`antique machete`)
    ) {
      pullXWhenHaveY($item`antique machete`, 1, 0);
      return autoForceEquip$3($item`antique machete`);
    }
  }
  if (auto_can_equip($item`muculent machete`)) {
    if (
      !possessEquipment($item`muculent machete`) &&
      canPull($item`muculent machete`)
    ) {
      pullXWhenHaveY($item`muculent machete`, 1, 0);
    }
    return autoForceEquip$3($item`muculent machete`);
  }
  return false;
}

function L11_hiddenCityZonesEquipForShrine(): boolean {
  const canUseMachete: boolean = L11_hiddenCityZonesCanUseMachete();
  if (canUseMachete && !L11_hiddenCityZonesEquipMachete()) {
    return false;
  }
  if (!canUseMachete && TearawayPants.haveTearawayPants()) {
    autoForceEquip$3($item`tearaway pants`);
  }
  if (pathHasFamiliar()) {
    maximizer.weight($modifier`Familiar Experience`, 25);

    const noVinesCleared =
      $locations`An Overgrown Shrine (Northwest), An Overgrown Shrine (Southwest), An Overgrown Shrine (Northeast), An Overgrown Shrine (Southeast)`.every(
        (l) => liana_cleared(l),
      );
    provideFamExp$3(25, true, noVinesCleared);
  }
  return true;
}

const L11_hiddenParkTask = registerQuestTask(L11_hiddenCityTask, {
  name: "L11_hiddenPark",
  completed: () => !L11_hiddenCityZonesNeedPark(),
  ready: () => true,
  do: () => {
    const burningDelay = hiddenParkBurningDelay();

    if (
      burningDelay &&
      auto_shouldDelayForForcedNonCombat($location`The Hidden Park`)
    ) {
      return false;
    }
    // only force if we don't need the machete
    const NCForced: boolean =
      burningDelay &&
      auto_forceNextNoncombatIfWorthIt($location`The Haunted Billiards Room`);
    // Bail if the NC forcer isn't armed yet
    if (
      burningDelay &&
      !NCForced &&
      auto_shouldDelayForForcedNonCombat($location`The Hidden Park`)
    ) {
      return false;
    }
    if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
      Snapper.changeSnapperPhylum($phylum`dude`);
    }
    return autoAdv($location`The Hidden Park`);
  },
  locations: $location`The Hidden Park`,
  desiredEncounters: () => [
    {
      item: $item`book of matches`,
      needAmount:
        itemAmount($item`book of matches`) === 0 &&
        myAscensions() < get("hiddenTavernUnlock")
          ? 1
          : 0,
    },
  ],
  forcedNonCombats: () => [
    {
      name: "Where Does The Lone Ranger Take His Garbagester?",
      turnsRequiredForSetup: hiddenParkBurningDelay()
        ? Math.max(0, 7 - $location`The Hidden Park`.turnsSpent)
        : 0,
    },
  ],
});

function L11_hiddenCityZonesDo(): boolean {
  L11_hiddenTavernUnlock();

  if (L11_hiddenCityZonesNeedPark()) {
    return runQuestTask(L11_hiddenParkTask);
  }

  if (get("breathitinCharges") > 0) {
    // Shrines & Ziggurat are outdoor zones with free combats. Let's not waste Breathitin charges.
    return false;
  }

  if (Bofa.habitatFightsLeft() > 0) {
    // Don't waste habitat wanderers clearing dense liana's
    return false;
  }

  return runTaskChain([
    L11_hiddenCityZonesNorthwestTask,
    L11_hiddenCityZonesNortheastTask,
    L11_hiddenCityZonesSouthwestTask,
    L11_hiddenCityZonesSoutheastTask,
    L11_hiddenCityZonesZigguratTask,
  ]);
}

export const L11_hiddenCityZonesTask: QuestTask = registerQuestTask({
  name: "L11_hiddenCityZones",
  completed: () => internalQuestStatus("questL11Worship") > 4,
  ready: () => internalQuestStatus("questL11Worship") >= 3,
  do: L11_hiddenCityZonesDo,
});

function L11_hiddenCityZonesNorthwest(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Northwest)`);
}

const L11_hiddenCityZonesNorthwestTask: QuestTask = registerQuestTask(
  L11_hiddenCityZonesTask,
  {
    name: "L11_hiddenCityZonesNorthwest",
    completed: () => get("hiddenApartmentProgress") > 0,
    ready: () => get("hiddenApartmentProgress") === 0,
    do: L11_hiddenCityZonesNorthwest,
    locations: $location`An Overgrown Shrine (Northwest)`,
    desiredEncounters: () => [
      {
        monster: $monster`ancient protector spirit (The Hidden Apartment Building)`,
        needAmount: get("hiddenApartmentProgress") < 1 ? 1 : 0,
      },
    ],
  },
);

function L11_hiddenCityZonesNortheast(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Northeast)`);
}

const L11_hiddenCityZonesNortheastTask: QuestTask = registerQuestTask(
  L11_hiddenCityZonesTask,
  {
    name: "L11_hiddenCityZonesNortheast",
    completed: () => get("hiddenOfficeProgress") > 0,
    ready: () => get("hiddenOfficeProgress") === 0,
    do: L11_hiddenCityZonesNortheast,
    locations: $location`An Overgrown Shrine (Northeast)`,
    desiredEncounters: () => [
      {
        monster: $monster`ancient protector spirit (The Hidden Office Building)`,
        needAmount: get("hiddenOfficeProgress") < 1 ? 1 : 0,
      },
    ],
  },
);

function L11_hiddenCityZonesSouthwest(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Southwest)`);
}

const L11_hiddenCityZonesSouthwestTask: QuestTask = registerQuestTask(
  L11_hiddenCityZonesTask,
  {
    name: "L11_hiddenCityZonesSouthwest",
    completed: () => get("hiddenHospitalProgress") > 0,
    ready: () => get("hiddenHospitalProgress") === 0,
    do: L11_hiddenCityZonesSouthwest,
    locations: $location`An Overgrown Shrine (Southwest)`,
    desiredEncounters: () => [
      {
        monster: $monster`ancient protector spirit (The Hidden Hospital)`,
        needAmount: get("hiddenHospitalProgress") < 1 ? 1 : 0,
      },
    ],
  },
);

function L11_hiddenCityZonesSoutheast(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  return autoAdv($location`An Overgrown Shrine (Southeast)`);
}

const L11_hiddenCityZonesSoutheastTask: QuestTask = registerQuestTask(
  L11_hiddenCityZonesTask,
  {
    name: "L11_hiddenCityZonesSoutheast",
    completed: () => get("hiddenBowlingAlleyProgress") > 0,
    ready: () => get("hiddenBowlingAlleyProgress") === 0,
    do: L11_hiddenCityZonesSoutheast,
    locations: $location`An Overgrown Shrine (Southeast)`,
    desiredEncounters: () => [
      {
        monster: $monster`ancient protector spirit (The Hidden Bowling Alley)`,
        needAmount: get("hiddenBowlingAlleyProgress") < 1 ? 1 : 0,
      },
    ],
  },
);

function L11_hiddenCityZonesZiggurat(): boolean {
  if (!L11_hiddenCityZonesEquipForShrine()) {
    return false;
  }
  const advSpent: boolean = autoAdv($location`A Massive Ziggurat`);
  if (
    get("lastEncounter") === "Legend of the Temple in the Hidden City" ||
    (isActuallyEd() &&
      get("lastEncounter") === "Temple of the Legend in the Hidden City")
  ) {
    set("auto_openedziggurat", true);
  }
  return advSpent;
}

const L11_hiddenCityZonesZigguratTask: QuestTask = registerQuestTask(
  L11_hiddenCityZonesTask,
  {
    name: "L11_hiddenCityZonesZiggurat",
    completed: () => get("auto_openedziggurat", false),
    ready: () => !get("auto_openedziggurat", false),
    do: L11_hiddenCityZonesZiggurat,
    locations: $location`A Massive Ziggurat`,
    desiredEncounters: () => [
      {
        monster: $monster`Protector Spectre`,
        needAmount: get("auto_openedziggurat") ? 0 : 1,
      },
    ],
  },
);

export function L11_hiddenCityZones(): boolean {
  return runQuestTask(L11_hiddenCityZonesTask);
}
