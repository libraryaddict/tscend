import {
  abort,
  availableChoiceOptions,
  cliExecute,
  containsText,
  council,
  equippedItem,
  expectedDamage,
  floor,
  fullnessLimit,
  haveEffect,
  haveFamiliar,
  haveSkill,
  inHardcore,
  initiativeModifier,
  isBanished,
  isUnrestricted,
  itemAmount,
  itemType,
  min,
  myClass,
  myDaycount,
  myFullness,
  myMaxhp,
  myMp,
  myPrimestat,
  spleenLimit,
  splitString,
  toLowerCase,
  use,
  useSkill,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $monster,
  $monsters,
  $skill,
  $slot,
  $stat,
  get,
  have,
  set,
} from "libram";

import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv } from "../auto_adventure";
import { buffMaintain$2 } from "../auto_buff";
import {
  auto_spleenFamiliarAdvItemsPossessed,
  autoChew,
  shouldUseSpleenForLowPriority,
  spleen_left,
} from "../auto_consume";
import {
  auto_forceEquipSword,
  autoEquip,
  equipStatgainIncreasers$2,
  possessEquipment,
} from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { provideInitiative$2, provideItem$2 } from "../auto_providers";
import { acquireHP } from "../auto_restore";
import { auto_reserveUndergroundAdventures } from "../auto_routing";
import {
  auto_badassBelt,
  auto_change_mcd,
  auto_combat_appearance_rates$1,
  auto_convertDesiredML,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_is_valid$3,
  auto_log_debug,
  auto_log_info,
  auto_log_warning,
  auto_MaxMLToCap,
  auto_runChoice,
  auto_turbo,
  auto_wandererFightsLeft,
  canSniff,
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
import { handleBjornify } from "../iotms/2010/mr2014";
import { spacegateVaccine } from "../iotms/2010/mr2017";
import { auto_havePillKeeper } from "../iotms/2010/mr2019";
import {
  auto_configureRetrocape,
  auto_hasRetrocape,
  auto_mapTheMonsters,
} from "../iotms/2020/mr2020";
import {
  auto_backupUsesLeft,
  auto_FireExtinguisherCombatSkill,
} from "../iotms/2020/mr2021";
import { auto_haveGreyGoose } from "../iotms/2020/mr2022";
import {
  auto_copierShouldDelayZone,
  auto_swordFamiliarLikesCurrentTarget,
  auto_swordFamiliarWantsMonsterDrops,
  auto_swordIsWillingToSwitchTargets,
} from "../iotms/2020/mr2026";
import { in_zombieSlayer } from "../paths/2012/zombie_slayer";
import { is_pete } from "../paths/2014/avatar_of_sneaky_pete";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { lar_repeat } from "../paths/2017/live_ascend_repeat";
import { in_darkGyffte } from "../paths/2019/dark_gyffte";
import { in_koe } from "../paths/2019/kingdom_of_exploathing";
import { in_aosol } from "../paths/2023/avatar_of_shadows_over_loathing";
import { in_small } from "../paths/2023/small";
import { is_professor } from "../paths/2024/wereprofessor";
import { maximizer } from "../utils/maximizer";

//Defined in autoscend/quests/level_07.ash
export function cyrptChoiceHandler(choice: number): void {
  if (choice === 153) {
    // Turn Your Head and Coffin (The Defiled Alcove)
    auto_runChoice(4); // skip
  } else if (choice === 155) {
    // Skull, Skull, Skull (The Defiled Nook)
    if (
      in_zombieSlayer() &&
      (itemAmount($item`talkative skull`) === 0 ||
        !haveFamiliar($familiar`Hovering Skull`))
    ) {
      auto_runChoice(1); // get talkative skull
    } else {
      auto_runChoice(5); // skip
    }
  } else if (choice === 157) {
    // Urning Your Keep (The Defiled Niche)
    auto_runChoice(4); // skip
  } else if (choice === 523) {
    // Death Rattlin' (The Defiled Cranny)
    if (
      (in_darkGyffte() &&
        haveSkill($skill`Flock of Bats Form`) &&
        haveSkill($skill`Sharp Eyes`)) ||
      auto_turbo()
    ) {
      let desiredPills: number = inHardcore() ? 6 : auto_turbo() ? 3 : 4;
      let dietingPillsUsed: number = 0;
      if (get("auto_chewed") === "") {
        dietingPillsUsed = 0;
      } else {
        for (const str of splitString(get("auto_chewed"), ",")) {
          if (containsText(toLowerCase(str), "dieting pill")) {
            dietingPillsUsed += 1;
          }
        }
      }
      if (!auto_turbo()) {
        desiredPills -= myFullness() / 2;
      } else {
        desiredPills -= dietingPillsUsed;
      }
      auto_log_info(
        `We want ${desiredPills} dieting pills and have ${itemAmount($item`dieting pill`)}`,
        "blue",
      );
      if (itemAmount($item`dieting pill`) < desiredPills) {
        auto_runChoice(6); // if meets thresholds, skip to farm more dieting pills in DG
      } else if (5 in availableChoiceOptions()) {
        auto_runChoice(5); // -11 evil, +50 each substat with Candy Cane Sword Cane
      } else {
        auto_runChoice(4); // fight swarm of ghuol whelps
      }
    } else if (5 in availableChoiceOptions()) {
      auto_runChoice(5); // -11 evil, +50 each substat with Candy Cane Sword Cane
    } else {
      auto_runChoice(4); // fight swarm of ghuol whelps
    }
  } else if (choice === 527) {
    // The Haert of Darkness (The Cyrpt)
    auto_runChoice(1); // fight whichever version of the bonerdagon
  } else {
    abort("unhandled choice in cyrptChoiceHandler");
  }
}

export function cyrptEvilBonus(inCombat: boolean = false): number {
  //returns value of next fight (inCombat: currently) available bonus to evil reduction
  let cyrptBonus: number =
    is_pete() && get("peteMotorbikeCowling") === "Ghost Vacuum" ? 1 : 0;
  cyrptBonus += get("_nightmareFuelCharges") > 0 ? 2 : 0;
  if (inCombat) {
    cyrptBonus +=
      equippedItem($slot`back`) ===
        $item`unwrapped knock-off retro superhero cape` &&
      auto_is_valid$2($skill`Slay the Dead`) &&
      get("retroCapeSuperhero") === "vampire" &&
      get("retroCapeWashingInstructions") === "kill" &&
      itemType(equippedItem($slot`weapon`)) === "sword"
        ? 1
        : 0;
    cyrptBonus +=
      equippedItem($slot`hat`) === $item`gravy boat` &&
      auto_is_valid($item`gravy boat`)
        ? 1
        : 0;
  } else {
    cyrptBonus +=
      auto_hasRetrocape() &&
      auto_is_valid$2($skill`Slay the Dead`) &&
      auto_forceEquipSword(true)
        ? 1
        : 0;
    cyrptBonus +=
      possessEquipment($item`gravy boat`) && auto_is_valid($item`gravy boat`)
        ? 1
        : 0;
  }
  return cyrptBonus;
}

function useNightmareFuelIfPossible(): void {
  // chews this when there are no guaranteed uses for spleen
  if (
    spleen_left() > 0 &&
    itemAmount($item`Nightmare Fuel`) > 0 &&
    !isActuallyEd() &&
    !(auto_havePillKeeper() && spleen_left() >= 3) &&
    spleen_left() >
      4 * min(auto_spleenFamiliarAdvItemsPossessed(), floor(spleen_left() / 4))
  ) {
    // only uses space than can't be filled with adv item
    autoChew(1, $item`Nightmare Fuel`);
  }
}

function knockOffCapePrep(): void {
  if (auto_configureRetrocape("vampire", "kill")) {
    if (
      haveEffect($effect`Iron Palms`) > 0 &&
      auto_have_skill($skill`Iron Palm Technique`)
    ) {
      //slay the dead needs the sword to count as a sword and not as a club
      useSkill(1, $skill`Iron Palm Technique`);
    }
    auto_forceEquipSword();
  }
}

function L7_reserveUndergroundGate(): boolean {
  // crypt is underground so it will generate breathitins, 5 turns free outside
  // allow adventuring in Alcove (below) since many backup charges get used for modern zmobies
  // not delaying better distributes these charges across days
  if (auto_reserveUndergroundAdventures()) {
    auto_log_debug(
      "Delaying remaining crypt zones for cold medicine cabinet usage.",
    );
    return false;
  }
  return true;
}

function L7_defiledAlcoveDo(): boolean {
  const evilBonus: number = cyrptEvilBonus();

  if (
    internalQuestStatus("questL07Cyrptic") !== 0 ||
    get("cyrptAlcoveEvilness") === 0
  ) {
    return false;
  }

  if (
    get("cyrptAlcoveEvilness") > 13 &&
    auto_wandererFightsLeft($monster`modern zmobie`) > 0
  ) {
    if (auto_backupUsesLeft() > 0) {
      // do something else if we have modern zmobie Habitants & can backup. Don't need to adventure in this zone.
      return false;
    }
    if (
      get("cyrptAlcoveEvilness") <=
      13 +
        auto_wandererFightsLeft($monster`modern zmobie`) *
          (cyrptEvilBonus() + 5)
    ) {
      // we have enough Habitants to get to 13 or less evilness. Don't need to adventure in this zone.
      return false;
    }
  }

  if (
    isActuallyEd() &&
    (!haveSkill($skill`More Legs`) ||
      expectedDamage($monster`modern zmobie`) + 15 > myMaxhp())
  ) {
    // Ed needs to be able to survive long enough to do stuff in combat vs a modern zmobie.
    return false;
  }

  if (get("cyrptAlcoveEvilness") > 14 + evilBonus) {
    provideInitiative$2(850, $location`The Defiled Alcove`, true);
    maximizer
      .weight($modifier`Initiative`, 100)
      .max($modifier`Initiative`, 850);
  }

  autoEquip($item`gravy boat`);
  knockOffCapePrep();

  if (get("cyrptAlcoveEvilness") >= 16 + evilBonus) {
    useNightmareFuelIfPossible();
  }

  auto_log_info(`The Alcove! (${initiativeModifier()})`, "blue");
  if (get("cyrptAlcoveEvilness") <= 13) {
    set("auto_nextEncounter", "conjoined zmombie");
  }
  return autoAdv($location`The Defiled Alcove`);
}

export const L7_cryptTask: QuestTask = registerQuestTask({
  name: "L7_crypt",
  completed: () => get("auto_L07CouncilVisited", false),
  ready: () => internalQuestStatus("questL07Cyrptic") >= 0,
  do: () => {
    if (L7_bonerdagonDefeated()) {
      return runQuestTask(L7_cryptFinishTask);
    }

    // make sure quest status is correct before we attempt to adventure.
    //visitUrl("crypt.php");
    //use(1, $item`Evilometer`);

    cyrptEvilBonus();

    return runTaskChain([
      L7_defiledAlcoveTask,
      L7_defiledNookTask,
      L7_defiledNicheTask,
      L7_defiledCrannyTask,
      L7_bonerdagonTask,
    ]);
  },
});

const L7_defiledAlcoveTask: QuestTask = registerQuestTask(L7_cryptTask, {
  name: "L7_defiledAlcove",
  completed: () => get("cyrptAlcoveEvilness") === 0,
  ready: () => true,
  do: L7_defiledAlcoveDo,
  locations: $location`The Defiled Alcove`,
});

export function L7_defiledAlcove(): boolean {
  return runQuestTask(L7_defiledAlcoveTask);
}

function L7_defiledNookDo(): boolean {
  const evilBonus: number = cyrptEvilBonus();
  // current mafia bug causes us to lose track of the amount of Evil Eyes in inventory so adding a refresh here
  cliExecute("refresh inv");
  // in KoE, skeleton astronauts are random encounters that drop Evil Eyes.
  // we might be able to reach the Nook boss without adventuring.

  while (
    itemAmount($item`evil eye`) > 0 &&
    auto_is_valid($item`evil eye`) &&
    get("cyrptNookEvilness") > 13
  ) {
    use(1, $item`evil eye`);
  }

  const skip_in_koe: boolean =
    in_koe() &&
    get("cyrptNookEvilness") > 13 &&
    get("questL12HippyFrat") !== "finished";

  if (
    get("cyrptNookEvilness") > 0 &&
    lar_repeat($location`The Defiled Nook`) &&
    !skip_in_koe
  ) {
    auto_log_info("The Nook!", "blue");
    autoEquip($item`gravy boat`);
    knockOffCapePrep();

    if (
      get("cyrptNookEvilness") > 14 + evilBonus &&
      auto_is_valid($item`evil eye`)
    ) {
      //evil eyes have 20% drop rate
      provideItem$2(400, $location`The Defiled Nook`, false);
    }

    if (get("cyrptNookEvilness") <= 13) {
      set("auto_nextEncounter", "giant skeelton");
    }
    return autoAdv($location`The Defiled Nook`);
  } else if (skip_in_koe) {
    auto_log_debug(
      "In Exploathing, skipping Defiled Nook until we get more evil eyes.",
    );
  }
  return false;
}

const L7_defiledNookTask: QuestTask = registerQuestTask(L7_cryptTask, {
  name: "L7_defiledNook",
  completed: () => get("cyrptNookEvilness") === 0,
  ready: () => {
    if (!L7_reserveUndergroundGate()) {
      return false;
    }
    if (auto_copierShouldDelayZone($locations`The Defiled Nook`)) {
      auto_log_debug(
        "Delaying L7 nook - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: L7_defiledNookDo,
  locations: $location`The Defiled Nook`,
  desiredEncounters: () => [
    {
      item: $item`evil eye`,
      needAmount: get("cyrptNookEvilness") > 13 ? 1 : 0,
    },
  ],
});

export function L7_defiledNook(): boolean {
  return runQuestTask(L7_defiledNookTask);
}

function L7_defiledNicheDo(): boolean {
  const evilBonus: number = cyrptEvilBonus();

  if (
    get("cyrptNicheEvilness") > 13 &&
    auto_wandererFightsLeft($monster`dirty old lihc`) > 0
  ) {
    if (
      get("cyrptNicheEvilness") <=
      13 +
        auto_wandererFightsLeft($monster`dirty old lihc`) *
          (cyrptEvilBonus() + 3)
    ) {
      // we have enough Habitants to get to 13 or less evilness. Don't need to adventure in this zone.
      return false;
    }
  }

  if (
    get("cyrptNicheEvilness") > 0 &&
    lar_repeat($location`The Defiled Niche`)
  ) {
    if (
      myDaycount() === 1 &&
      get("_hipsterAdv") < 7 &&
      isUnrestricted($familiar`Artistic Goth Kid`) &&
      auto_have_familiar($familiar`Artistic Goth Kid`)
    ) {
      handleFamiliar$1($familiar`Artistic Goth Kid`);
    }
    autoEquip($item`gravy boat`);
    // prioritize extinguisher over slay the dead in Defiled Niche if its available and unused in the cyrpt
    if (
      auto_FireExtinguisherCombatSkill($location`The Defiled Niche`) ===
      undefined
    ) {
      knockOffCapePrep();
    }

    if (
      auto_have_familiar($familiar`Space Jellyfish`) &&
      get("_spaceJellyfishDrops") < 3
    ) {
      handleFamiliar$1($familiar`Space Jellyfish`);
    } else if (
      auto_have_familiar($familiar`Nosy Nose`) &&
      auto_is_valid$2($skill`Get a Good Whiff of This Guy`) &&
      (auto_combat_appearance_rates$1($location`The Defiled Niche`).get(
        $monster`dirty old lihc`,
      ) ?? 0.0) < 100
    ) {
      let nosyOldLihcs: boolean = false;
      if (get("cyrptNicheEvilness") > 17 + 2 * evilBonus) {
        nosyOldLihcs = true; //several dirty old lihc worth of evilness left so want to whiff dirty old lihc if we meet one
      } else if (
        safeGet("nosyNoseMonster") === $monster`dirty old lihc` &&
        get("cyrptNicheEvilness") > 14 + evilBonus
      ) {
        nosyOldLihcs = true; //familiar whiff skill is increasing chances of dirty old lihc
      }
      if (nosyOldLihcs) {
        handleFamiliar$1($familiar`Nosy Nose`);
      }
    }

    if (get("cyrptNicheEvilness") >= 16 + evilBonus) {
      useNightmareFuelIfPossible();
    }

    auto_log_info("The Niche!", "blue");
    if (
      canSniff($monster`dirty old lihc`, $location`The Defiled Niche`) &&
      get("cyrptNicheEvilness") >= 14 + evilBonus &&
      auto_mapTheMonsters()
    ) {
      auto_log_info(
        "Attemping to use Map the Monsters to olfact a Dirty Old Lihc.",
      );
    }
    if (get("cyrptNicheEvilness") <= 13) {
      set("auto_nextEncounter", "gargantulihc");
    }
    return autoAdv($location`The Defiled Niche`);
  }
  return false;
}

const L7_defiledNicheTask: QuestTask = registerQuestTask(L7_cryptTask, {
  name: "L7_defiledNiche",
  completed: () => get("cyrptNicheEvilness") === 0,
  ready: () => {
    if (!L7_reserveUndergroundGate()) {
      return false;
    }
    if (auto_copierShouldDelayZone($locations`The Defiled Niche`)) {
      auto_log_debug(
        "Delaying L7 niche - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: L7_defiledNicheDo,
  locations: $location`The Defiled Niche`,
  desiredEncounters: () => [
    {
      monster: $monster`dirty old lihc`,
      needAmount: Math.round((13 - get("cyrptNicheEvilness")) / 3),
    },
  ],
});

export function L7_defiledNiche(): boolean {
  return runQuestTask(L7_defiledNicheTask);
}

function L7_defiledCrannyDo(): boolean {
  if (get("cyrptCrannyEvilness") <= 0) {
    return false;
  }
  if (is_professor()) {
    //don't do if we are the Professor. Death Rattlin' = Beaten Up
    return false;
  }
  const evilBonus: number = cyrptEvilBonus();
  auto_log_info("The Cranny!", "blue");

  if (myMp() > 60) {
    handleBjornify($familiar`Grimstone Golem`);
  }

  autoEquip($item`gravy boat`);
  knockOffCapePrep();

  if (auto_is_valid$3($effect`Emotional Vaccine`)) {
    spacegateVaccine($effect`Emotional Vaccine`);
  }

  if (
    auto_have_familiar($familiar`Space Jellyfish`) &&
    get("_spaceJellyfishDrops") < 3
  ) {
    handleFamiliar$1($familiar`Space Jellyfish`);
  }

  if (get("cyrptCrannyEvilness") >= 17 + evilBonus) {
    useNightmareFuelIfPossible();
  }

  if (
    (in_darkGyffte() &&
      haveSkill($skill`Flock of Bats Form`) &&
      haveSkill($skill`Sharp Eyes`)) ||
    auto_turbo()
  ) {
    let desiredPills: number = inHardcore() ? 6 : auto_turbo() ? 3 : 4;
    let dietingPillsUsed: number = 0;
    if (get("auto_chewed") === "") {
      dietingPillsUsed = 0;
    } else {
      for (const str of splitString(get("auto_chewed"), ",")) {
        if (containsText(toLowerCase(str), "dieting pill")) {
          dietingPillsUsed += 1;
        }
      }
    }
    if (!auto_turbo()) {
      desiredPills -= myFullness() / 2;
    } else {
      desiredPills -= dietingPillsUsed;
    }
    auto_log_info(
      `We want ${desiredPills} dieting pills and have ${itemAmount($item`dieting pill`)}`,
      "blue",
    );
    if (itemAmount($item`dieting pill`) < desiredPills) {
      //dieting pills have 10% drop rate
      provideItem$2(900, $location`The Defiled Cranny`, false);
    }
  }

  auto_MaxMLToCap(auto_convertDesiredML(149), true);

  maximizer
    .weight($modifier`Monster Level`, 200)
    .max($modifier`Monster Level`, auto_convertDesiredML(149));

  if (get("cyrptCrannyEvilness") <= 13) {
    set("auto_nextEncounter", "huge ghuol");
  }
  return autoAdv($location`The Defiled Cranny`);
}

const L7_defiledCrannyTask: QuestTask = registerQuestTask(L7_cryptTask, {
  name: "L7_defiledCranny",
  completed: () => get("cyrptCrannyEvilness") === 0,
  ready: () => {
    if (!L7_reserveUndergroundGate()) {
      return false;
    }
    if (auto_copierShouldDelayZone($locations`The Defiled Cranny`)) {
      auto_log_debug(
        "Delaying L7 cranny - still farming a copier target in this cluster.",
      );
      return false;
    }
    return true;
  },
  do: L7_defiledCrannyDo,
  locations: $location`The Defiled Cranny`,
  desiredEncounters: () => [
    {
      item: $item`dieting pill`,
      needAmount:
        auto_is_valid($item`dieting pill`) &&
        spleen_left() >= 3 &&
        !isActuallyEd() &&
        !have($item`dieting pill`) &&
        (!get("auto_dontConsumeLegendPizzas", false) ||
          shouldUseSpleenForLowPriority())
          ? 1
          : 0,
    },
  ],
});

export function L7_defiledCranny(): boolean {
  return runQuestTask(L7_defiledCrannyTask);
}

function L7_bonerdagonDefeated(): boolean {
  return (
    itemAmount($item`chest of the Bonerdagon`) === 1 ||
    get("questL07Cyrptic") === "finished"
  );
}

function L7_bonerdagonDo(): boolean {
  if (
    myClass() === $class`Seal Clubber` &&
    auto_have_skill($skill`Iron Palm Technique`) &&
    haveEffect($effect`Iron Palms`) === 0
  ) {
    //if this was toggled off for retrocape slay the dead it can be toggled back on now
    useSkill(1, $skill`Iron Palm Technique`);
  }

  if (myPrimestat() === $stat`Muscle`) {
    auto_buyUpTo(1, $item`Ben-Gal™ Balm`);
    buffMaintain$2($effect`Go Get 'Em, Tiger!`);
    auto_buyUpTo(1, $item`blood of the Wereseal`);
    buffMaintain$2($effect`Temporary Lycanthropy`);
  }
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
    if (auto_haveGreyGoose()) {
      handleFamiliar$1($familiar`Grey Goose`);
    }
  }

  acquireHP();
  if (auto_have_familiar($familiar`Machine Elf`)) {
    handleFamiliar$1($familiar`Machine Elf`);
  }
  auto_change_mcd(10); // get vertebra to make the necklace.
  set("auto_nextEncounter", "Bonerdagon");
  set("auto_nonAdvLoc", true);
  const tryBoner: boolean = autoAdv($location`Haert of the Cyrpt`);
  cliExecute("refresh quests");
  if (L7_bonerdagonDefeated()) {
    return runQuestTask(L7_cryptFinishTask);
  }
  if (!tryBoner) {
    auto_log_warning(
      "We tried to kill the Bonerdagon because the cyrpt was defiled but couldn't adventure there and the chest of the bonerdagon is gone so we can't check that. Anyway, we are going to assume the cyrpt is done now.",
      "red",
    );
    return true;
  }
  abort("Failed to kill bonerdagon");
  return true;
}

const L7_bonerdagonTask: QuestTask = registerQuestTask(L7_cryptTask, {
  name: "L7_bonerdagon",
  completed: L7_bonerdagonDefeated,
  ready: () => {
    if (!L7_reserveUndergroundGate()) {
      return false;
    }
    return get("cyrptTotalEvilness") <= 0 || get("cyrptTotalEvilness") === 999;
  },
  do: L7_bonerdagonDo,
  locations: $location`Haert of the Cyrpt`,
  desiredEncounters: () => [
    {
      monster: $monster`Bonerdagon`,
      needAmount:
        itemAmount($item`chest of the Bonerdagon`) < 1 &&
        get("questL07Cyrptic") !== "finished" &&
        (get("cyrptTotalEvilness") <= 0 || get("cyrptTotalEvilness") === 999)
          ? 1
          : 0,
    },
  ],
});

export function L7_swordWantsCryptMonster(): boolean {
  if (!auto_swordIsWillingToSwitchTargets()) return false;
  if (in_koe()) {
    return false; // don't need more evil eyes
  }

  return (
    !auto_swordFamiliarLikesCurrentTarget() &&
    $monsters`spiny skelelton, toothy sklelton`.some((m) =>
      auto_swordFamiliarWantsMonsterDrops(m),
    )
  );
}

const L7_cryptFinishTask: QuestTask = registerQuestTask({
  name: "L7_cryptFinish",
  completed: () => get("auto_L07CouncilVisited", false),
  ready: () => {
    if (get("auto_L07CouncilVisited", false) || !L7_bonerdagonDefeated()) {
      return false;
    }
    return true;
  },
  do: () => {
    council();
    cliExecute("refresh quests");
    if (itemAmount($item`chest of the Bonerdagon`) === 1) {
      equipStatgainIncreasers$2();
      use(1, $item`chest of the Bonerdagon`);
      auto_badassBelt(); // mafia doesn't make this any more even if autoCraft = true for some random reason so lets do it manually.
    } else {
      auto_log_warning(
        "Looks like we don't have the chest of the bonerdagon but KoLmafia marked Cyrpt quest as finished anyway. Probably some weird path shenanigans.",
        "red",
      );
    }
    set("auto_L07CouncilVisited", true);
  },
});

export function L7_crypt(): boolean {
  return runQuestTask(L7_cryptTask);
}

function L7_overrideDo(): boolean {
  const evilBonus: number = cyrptEvilBonus();
  if (
    get("cyrptNookEvilness") > 14 + evilBonus &&
    isBanished($monster`party skelteon`)
  ) {
    auto_log_info(
      "Trying to check on the ongoing Nook before moving on to a different task",
    );
    if (L7_crypt()) {
      return true;
    }
  }
  if (get("cyrptNicheEvilness") > 14 + evilBonus) {
    const lihcbanihced: boolean =
      isBanished($monster`basic lihc`) ||
      isBanished($monster`senile lihc`) ||
      isBanished($monster`slick lihc`);
    if (lihcbanihced || isSniffed$1($monster`dirty old lihc`)) {
      auto_log_info(
        "Trying to check on the ongoing Niche before moving on to a different task",
      );
      if (L7_crypt()) {
        return true;
      }
    }
  }
  return false;
}

const L7_overrideTask: QuestTask = registerQuestTask({
  name: "L7_override",
  completed: () => internalQuestStatus("questL07Cyrptic") > 0,
  // check if olfaction or banishes are being used for ongoing L7 tasks and give those priority
  ready: () =>
    internalQuestStatus("questL07Cyrptic") === 0 &&
    (get("cyrptNookEvilness") > 14 || get("cyrptNicheEvilness") > 14),
  do: L7_overrideDo,
  locations: $locations`The Defiled Alcove, The Defiled Niche, The Defiled Cranny, The Defiled Nook`,
  desiredEncounters: () => [
    {
      item: $item`evil eye`,
      needAmount: Math.round((13 - get("cyrptNookEvilness")) / 3),
    },
    {
      item: $item`dieting pill`,
      needAmount:
        fullnessLimit() > 3 &&
        spleenLimit() > 3 &&
        !isActuallyEd() &&
        !in_small()
          ? 2 - itemAmount($item`dieting pill`)
          : 0,
    },
  ],
});

export function L7_override(): boolean {
  return runQuestTask(L7_overrideTask);
}
