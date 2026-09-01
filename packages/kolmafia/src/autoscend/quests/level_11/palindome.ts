import {
  council,
  creatableAmount,
  create,
  equip,
  equippedAmount,
  inHardcore,
  isBanished,
  itemAmount,
  itemDropModifier,
  myAscensions,
  myMeat,
  myMp,
  numericModifier,
  pullsRemaining,
  random,
  use,
  visitUrl,
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
  $monsters,
  $phylum,
  $skill,
  $slot,
  get,
  set,
} from "libram";

import {
  AugustScepter,
  Bjorn,
  Cartography,
  L11_Shen,
  L11_Zeppelin,
  MonkeyPaw,
  Snapper,
} from "../../../types";
import {
  autoEquipToSlot,
  equipBaseline,
  possessEquipment,
} from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import { provideItem$2, providePlusCombat } from "../../auto_providers";
import { getSniffer, isSniffed } from "../../combat/auto_combat_util";
import {
  DesiredDrop,
  DesiredFights,
  QuestTask,
  runQuestTask,
  runTaskChain,
} from "../../engine/engine";
import { registerQuestTask } from "../../engine/registry";
import { autoAdv, autoAdvBypass } from "../../executors/auto_adventure";
import { pullXWhenHaveY } from "../../helpers/auto_acquire";
import { buffMaintain$2 } from "../../helpers/auto_buff";
import {
  auto_famModifiers$2,
  auto_have_familiar,
  handleFamiliar$1,
} from "../../helpers/auto_familiar";
import { acquireHP } from "../../helpers/auto_restore";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import {
  bat_formBats,
  bat_reallyPickSkills,
} from "../../paths/2019/dark_gyffte";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import { in_aosol } from "../../paths/2023/avatar_of_shadows_over_loathing";
import { in_avantGuard } from "../../paths/2024/avant_guard";
import {
  auto_abort,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
} from "../../utils/auto_log";
import {
  auto_is_valid,
  auto_is_valid$2,
  autoCraft,
  backupSetting,
  canSniff,
  internalQuestStatus,
  isGuildClass,
  restoreSetting,
} from "../../utils/auto_util";

function L11_talismanOfNamDo(): boolean {
  if (
    runTaskChain([
      L11_Shen.L11_shenCopperheadTask,
      L11_Zeppelin.L11_redZeppelinTask,
      L11_Zeppelin.L11_ronCopperheadTask,
    ])
  ) {
    return true;
  }
  if (creatableAmount($item`Talisman o' Namsilat`) > 0) {
    if (create(1, $item`Talisman o' Namsilat`)) {
      return true;
    }
  }

  return false;
}

export const L11_talismanOfNamTask: QuestTask = registerQuestTask({
  name: "L11_talismanOfNam",
  completed: () => itemAmount($item`Talisman o' Namsilat`) > 0,
  ready: () => true,
  do: L11_talismanOfNamDo,
});

function L11_palindomeMakeWetStuntNutStew(): boolean {
  if (
    itemAmount($item`bird rib`) > 0 &&
    itemAmount($item`lion oil`) > 0 &&
    itemAmount($item`wet stew`) === 0
  ) {
    autoCraft("cook", 1, $item`bird rib`, $item`lion oil`);

    if (itemAmount($item`wet stew`) === 0) {
      auto_abort(`Failed to create ${$item`wet stew`}`);
    }
  }

  if (
    itemAmount($item`stunt nuts`) > 0 &&
    itemAmount($item`wet stew`) > 0 &&
    itemAmount($item`wet stunt nut stew`) === 0
  ) {
    autoCraft("cook", 1, $item`wet stew`, $item`stunt nuts`);

    if (itemAmount($item`wet stunt nut stew`) === 0) {
      auto_abort(`Failed to create wet stunt nut stew`);
    }
  }
  return itemAmount($item`wet stunt nut stew`) > 0;
}

//
//	In hardcore, guild-class, the right side of the or doesn't happen properly due us farming the
//	Mega Gem within the if, with pulls, it works fine. Need to fix this. This is bad.
//
function L11_palindomeDoWhiteys(): boolean {
  //After we get the photos
  //First try wishing, then try Whitey's. At 0% item / combat / food drop, this expects to take ~19 turns. At a very achievable 100% item, 10 turns.
  //The alternate route takes 14 turns so always worth trying Whitey's IMO.
  //If we hit this, we should only need to finish the L11 quest so it won't hurt to do everything in provideItem
  //since we will need +item for tomb rats in ~15 turns anyway. Buffs from wishes should still be active
  //since they are 30 turns from monkey paw wishes and 20 turns from pocket/genie wishes.
  if (MonkeyPaw.monkeyPawWishesLeft() > 0) {
    for (const it of $items`lion oil, bird rib`) {
      if (itemAmount(it) > 0) {
        continue;
      }
      MonkeyPaw.makeMonkeyPawWish$1(it);
    }
    if (itemAmount($item`lion oil`) > 0 && itemAmount($item`bird rib`) > 0) {
      return L11_palindomeMakeWetStuntNutStew();
    }
    //wasn't able to make the stew so continue to Whitey's
  }
  // in normal, we delayed until this was all we had to do. In hardcore we do it earlier.
  provideItem$2(300, $location`Whitey's Grove`, !inHardcore());
  set("auto_doWhiteys", true);
  if (itemAmount($item`white page`) > 0) {
    set("choiceAdventure940", 1);
    if (itemAmount($item`bird rib`) > 0) {
      set("choiceAdventure940", 2);
    }

    if (get("lastGuildStoreOpen") < myAscensions()) {
      auto_log_warning(
        "This is probably no longer needed as of r16907. Please remove me",
        "blue",
      );
      auto_log_warning(
        "Going to pretend we have unlocked the Guild because Mafia will assume we need to do that before going to Whitey's Grove and screw up us. We'll fix it afterwards.",
        "red",
      );
    }
    backupSetting("lastGuildStoreOpen", myAscensions().toString());
    const pages: Map<number, string> = new Map();
    pages.set(0, "inv_use.php?pwd&which=3&whichitem=7555");
    pages.set(
      1,
      `choice.php?pwd&whichchoice=940&option=${get("choiceAdventure940")}`,
    );
    if (autoAdvBypass(0, pages, $location`Whitey's Grove`)) {
    }
    restoreSetting("lastGuildStoreOpen");
    return true;
  }
  //Can't do Whitey's Grove if beasts are banished
  if (isBanished($phylum`beast`) && get("screechCombats") > 0) {
    set("_auto_screechDelay", "beast");
    return false; //If new phylum banishers come out, this should be updated.
  }
  providePlusCombat(15, $location`Whitey's Grove`, false);
  // +item is nice to get that food
  bat_formBats();
  AugustScepter.lostStomach(true);
  auto_log_info("Off to the grove for some doofy food!", "blue");
  return autoAdv($location`Whitey's Grove`);
}

function L11_palindomeFightDrAwkward(): boolean {
  if (hasILoveMeVolI()) {
    useILoveMeVolI();
  }
  if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
    equip($slot`acc3`, $item`Talisman o' Namsilat`);
  }

  if (internalQuestStatus("questL11Palindome") < 1) {
    visitUrl("place.php?whichplace=palindome&action=pal_drlabel");
    visitUrl(
      "choice.php?pwd&whichchoice=872&option=1&photo1=2259&photo2=7264&photo3=7263&photo4=7265",
    );
  }

  if (isActuallyEd()) {
    if (internalQuestStatus("questL11MacGuffin") > 2) {
      // Actually Ed finishes this quest when all 3 parts of the staff are returned
      council();
    }
    return true;
  }
  // is step 4 when we got the wet stunt nut stew?
  if (internalQuestStatus("questL11Palindome") < 5) {
    if (itemAmount($item`"2 Love Me, Vol. 2"`) > 0) {
      use(1, $item`"2 Love Me, Vol. 2"`);
      auto_log_info(
        "Oh no, we died from reading a book. I'm going to take a nap.",
        "blue",
      );
      set("_auto_forcePokefamRestore", true);
      acquireHP();
      bat_reallyPickSkills(20);
    }
    if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
      equip($slot`acc3`, $item`Talisman o' Namsilat`);
    }
    visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
    if (!inHardcore() && itemAmount($item`wet stunt nut stew`) === 0) {
      if (
        itemAmount($item`wet stew`) === 0 &&
        itemAmount($item`Mega Gem`) === 0
      ) {
        pullXWhenHaveY($item`wet stew`, 1, 0);
      }
      if (
        itemAmount($item`stunt nuts`) === 0 &&
        itemAmount($item`Mega Gem`) === 0
      ) {
        pullXWhenHaveY($item`stunt nuts`, 1, 0);
      }
    }
    if (inHardcore()) {
      return true;
    }
  }

  if (!possessEquipment($item`Mega Gem`)) {
    if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
      equip($slot`acc3`, $item`Talisman o' Namsilat`);
    }
    visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
  }

  if (!possessEquipment($item`Mega Gem`)) {
    auto_log_warning(
      "No mega gem for us. Well, no raisin to go further here....",
      "red",
    );
    return true;
  }
  autoEquipToSlot($slot`acc2`, $item`Mega Gem`);
  autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
  const palinChoice: number = random(3) + 1;
  set("choiceAdventure131", palinChoice);

  auto_log_info("War sir is raw!!", "blue");

  const pages: Map<number, string> = new Map();
  pages.set(0, "place.php?whichplace=palindome&action=pal_drlabel");
  pages.set(1, `choice.php?pwd&whichchoice=131&option=${palinChoice}`);
  set("auto_nextEncounter", "Dr. Awkward");
  //AoSOL buffs
  if (in_aosol()) {
    buffMaintain$2($effect`Queso Fustulento`, 10, 1, 10);
    buffMaintain$2($effect`Tricky Timpani`, 30, 1, 10);
  }
  autoAdvBypass(0, pages, $location`Noob Cave`);
  return true;
}

function L11_palindomeFightDudes(): boolean {
  if (pullsRemaining() === 0) {
    // used our pulls today before getting to palindrome. Delay until next day or run out of other stuff to do
    if (!isAboutToPowerlevel() && !inHardcore()) {
      auto_log_debug("Delaying palindrome.");
      return false;
    } else {
      if (internalQuestStatus("questL11Palindome") > 2) {
        return runQuestTask(L11_palindomeWhiteysTask); //Initial call to do Whitey's Grove
      }
    }
  }
  if (myMp() > 60 || Bjorn.considerGrimstoneGolem(true)) {
    Bjorn.handleBjornify($familiar`Grimstone Golem`);
  }
  if (internalQuestStatus("questL11Palindome") > 1) {
    if (!get("auto_bruteForcePalindome", false)) {
      auto_log_error("Palindome failure:");
      auto_log_error("You probably just need to get a Mega Gem to fix this.");
      auto_abort(
        "We have made too much progress in the Palindome and should not be here.",
      );
    } else {
      auto_log_error(
        "We need wet stunt nut stew to get the Mega Gem, but I've been told to get it via the mercy adventure.",
      );
      auto_log_error(
        "Set auto_bruteForcePalindome=false to try to get a stunt nut stew",
      );
      auto_log_error(
        "(We typically only set this option in hardcore Kingdom of Exploathing, in which the White Forest isn't available)",
      );
    }
  }

  const dudesToDown: number = L11_palindomeDudesToDown();

  autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
  if (handleFamiliar$1($familiar`Red-Nosed Snapper`)) {
    Snapper.changeSnapperPhylum($phylum`dude`);
  } else if (
    auto_have_familiar($familiar`Nosy Nose`) &&
    auto_is_valid$2($skill`Get a Good Whiff of This Guy`)
  ) {
    let noseDudesOn: boolean = true;
    if (
      itemAmount($item`stunt nuts`) === 0 &&
      itemAmount($item`wet stunt nut stew`) === 0
    ) {
      //may want to use an item familiar first for stunt nuts
      //unfortunately the sniff condition system means if taking the nose later after using different sniffs on a dude it will only be able to whiff on the same dude
      const stuntNutDropModifierWithoutFamiliar: number = Math.trunc(
        itemDropModifier() +
          numericModifier($modifier`Food Drop`) -
          auto_famModifiers$2("Item Drop"),
      );
      if (stuntNutDropModifierWithoutFamiliar < 234) {
        //30% base drop chance
        noseDudesOn = false;
      }
    }
    if (noseDudesOn) {
      const whiffedBob: boolean =
        get("nosyNoseMonster") === $monster`Racecar Bob` ||
        get("nosyNoseMonster") === $monster`Bob Racecar`;
      if (
        isBanished($monster`Flock of Stab-bats`) &&
        isBanished($monster`Taco Cat`) &&
        isBanished($monster`Tan Gnat`) &&
        isBanished($monster`Evil Olive`)
      ) {
        //only dudes left already
        noseDudesOn = false;
      } else if (get("palindomeDudesDefeated") >= dudesToDown) {
        if (dudesToDown >= 10 && whiffedBob) {
          //when looking for photograph of a dog without disposable instant camera
          //the 10th or later dude must be a Bob, keep using the nose if it's tracking Bob
          noseDudesOn = true;
        } else {
          //had enough dudes
          noseDudesOn = false;
        }
      } else if (get("palindomeDudesDefeated") === dudesToDown - 1) {
        if (!whiffedBob) {
          //don't need to start sniffing the last dude
          noseDudesOn = false;
        }
      } else if (
        isSniffed($monster`Racecar Bob`, $skill`Transcendent Olfaction`) ||
        isSniffed($monster`Bob Racecar`, $skill`Transcendent Olfaction`) ||
        isSniffed($monster`Drab Bard`, $skill`Transcendent Olfaction`) ||
        getSniffer($monster`Racecar Bob`, false) ===
          $skill`Transcendent Olfaction` ||
        getSniffer($monster`Bob Racecar`, false) ===
          $skill`Transcendent Olfaction`
      ) {
        //olfaction is or will be used and is probably powerful enough not to need weak nose tracking on
        noseDudesOn = false;
      }
    }
    if (noseDudesOn) {
      handleFamiliar$1($familiar`Nosy Nose`);
    }
  }

  if (
    canSniff($monster`Bob Racecar`, $location`Inside the Palindome`) &&
    Cartography.mapTheMonsters()
  ) {
    auto_log_info("Attemping to use Map the Monsters to olfact a Bob Racecar.");
  }
  const advSpent: boolean = autoAdv($location`Inside the Palindome`);
  if (
    $location`Inside the Palindome`.turnsSpent > 30 &&
    !in_pokefam() &&
    !in_koe() &&
    !in_avantGuard() &&
    auto_is_valid($item`disposable instant camera`)
  ) {
    auto_abort(
      "It appears that we've spent too many turns in the Palindome. If you run me again, I'll try one more time but many I failed finishing the Palindome",
    );
  } else {
    return advSpent;
  }
  return false;
}

function L11_palindomeTotalPhotos(): number {
  return (
    itemAmount($item`photograph of a red nugget`) +
    itemAmount($item`photograph of an ostrich egg`) +
    itemAmount($item`photograph of God`) +
    itemAmount($item`photograph of a dog`)
  );
}

function L11_palindomeDudesToDown(): number {
  //TODO if no camera check if it is better to pull or go get one, than to find 4 more dudes and a Bob
  if (
    internalQuestStatus("questL11Palindome") < 1 &&
    itemAmount($item`photograph of a dog`) === 0 &&
    (itemAmount($item`disposable instant camera`) === 0 ||
      !auto_is_valid($item`disposable instant camera`))
  ) {
    return 10; //if bob can't be photographed need to down more dudes
  }
  return 5;
}

function L11_palindomeReadyToPrepareForDudeHunt(): boolean {
  return (
    L11_palindomeTotalPhotos() === 0 &&
    !possessEquipment($item`Mega Gem`) &&
    (hasILoveMeVolI() || internalQuestStatus("questL11Palindome") >= 1) &&
    (inHardcore() || get("auto_doWhiteys", false)) &&
    itemAmount($item`wet stunt nut stew`) === 0 &&
    (internalQuestStatus("questL11Palindome") >= 3 || isGuildClass()) &&
    !get("auto_bruteForcePalindome", false)
  );
}

function L11_palindomeReadyForDrAwkward(): boolean {
  return (
    ((L11_palindomeTotalPhotos() === 4 && hasILoveMeVolI()) ||
      (L11_palindomeTotalPhotos() === 0 &&
        possessEquipment($item`Mega Gem`))) &&
    (hasILoveMeVolI() || internalQuestStatus("questL11Palindome") >= 1)
  );
}

function L11_palindomeDo(): boolean {
  if (!possessEquipment($item`Talisman o' Namsilat`)) {
    return false;
  }

  if (
    myMeat() <
      (2 -
        (itemAmount($item`photograph of a red nugget`) +
          itemAmount($item`photograph of God`))) *
        500 &&
    internalQuestStatus("questL11Palindome") < 1
  ) {
    auto_log_info("Not enough meat for the Palindome");
    return false;
  }

  if (isBanished($phylum`dude`) && get("screechCombats", 0) > 0) {
    set("_auto_screechDelay", "dude");
    return false; //If new phylum banishers come out, this should be updated.
  }

  if (
    !hasILoveMeVolI() &&
    internalQuestStatus("questL11Palindome") < 1 &&
    get("palindomeDudesDefeated", 0) >= 5
  ) {
    visitUrl("place.php?whichplace=palindome");
  }

  auto_log_info("In the palindome : emodnilap eht nI", "blue");

  if (
    L11_palindomeReadyToPrepareForDudeHunt() &&
    (itemAmount($item`bird rib`) === 0 || itemAmount($item`lion oil`) === 0)
  ) {
    equipBaseline();
    return runQuestTask(L11_palindomeWhiteysTask);
  }

  return runTaskChain([
    L11_palindomeMakeStewTask,
    L11_palindomeTradeStewForMegaGemTask,
    L11_palindomeGetStuntNutsTask,
    L11_palindomeStewErrorTask,
    L11_palindomeFightDrAwkwardTask,
    L11_palindomeFightDudesTask,
  ]);
}

export const L11_palindomeTask: QuestTask = registerQuestTask({
  name: "L11_palindome",
  completed: () => internalQuestStatus("questL11Palindome") > 5,
  ready: () => internalQuestStatus("questL11Palindome") >= 0,
  do: L11_palindomeDo,
  locations: $locations`Whitey's Grove, Inside the Palindome`,
});

const L11_palindomeMakeStewTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeMakeStew",
    completed: () =>
      itemAmount($item`wet stunt nut stew`) > 0 ||
      possessEquipment($item`Mega Gem`),
    ready: () =>
      itemAmount($item`wet stunt nut stew`) === 0 &&
      internalQuestStatus("questL11Palindome") >= 3,
    do: () => L11_palindomeMakeWetStuntNutStew(),
  },
);

const L11_palindomeTradeStewForMegaGemTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeTradeStewForMegaGem",
    completed: () => possessEquipment($item`Mega Gem`),
    ready: () =>
      itemAmount($item`wet stunt nut stew`) > 0 &&
      !possessEquipment($item`Mega Gem`),
    do: () => {
      if (equippedAmount($item`Talisman o' Namsilat`) === 0) {
        equip($slot`acc3`, $item`Talisman o' Namsilat`);
      }
      visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
      return false;
    },
  },
);

const L11_palindomeWhiteysTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeWhiteys",
    completed: () =>
      (itemAmount($item`bird rib`) > 0 && itemAmount($item`lion oil`) > 0) ||
      itemAmount($item`wet stew`) > 0 ||
      itemAmount($item`wet stunt nut stew`) > 0 ||
      possessEquipment($item`Mega Gem`),
    ready: () =>
      itemAmount($item`bird rib`) === 0 || itemAmount($item`lion oil`) === 0,
    do: () => L11_palindomeDoWhiteys(),
    locations: $location`Whitey's Grove`,
    desiredEncounters: () =>
      internalQuestStatus("questL11Palindome") < 5
        ? $items`lion oil, bird rib`
            .filter((it) => itemAmount(it) === 0)
            .map((it) => ({ item: it, needAmount: 1 }))
        : [],
  },
);

const L11_palindomeGetStuntNutsTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeGetStuntNuts",
    completed: () =>
      L11_palindomeTotalPhotos() > 0 ||
      possessEquipment($item`Mega Gem`) ||
      itemAmount($item`wet stunt nut stew`) > 0 ||
      itemAmount($item`stunt nuts`) > 0,
    ready: () =>
      L11_palindomeReadyToPrepareForDudeHunt() &&
      itemAmount($item`bird rib`) > 0 &&
      itemAmount($item`lion oil`) > 0 &&
      itemAmount($item`stunt nuts`) === 0,
    do: () => {
      equipBaseline();
      auto_log_info("We got no nuts!! :O", "Blue");
      autoEquipToSlot($slot`acc3`, $item`Talisman o' Namsilat`);
      return autoAdv($location`Inside the Palindome`);
    },
    locations: $location`Inside the Palindome`,
    desiredEncounters: () => [{ item: $item`stunt nuts`, needAmount: 1 }],
  },
);

const L11_palindomeStewErrorTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeStewError",
    completed: () =>
      L11_palindomeTotalPhotos() > 0 ||
      possessEquipment($item`Mega Gem`) ||
      itemAmount($item`wet stunt nut stew`) > 0,
    ready: () =>
      L11_palindomeReadyToPrepareForDudeHunt() &&
      itemAmount($item`bird rib`) > 0 &&
      itemAmount($item`lion oil`) > 0 &&
      itemAmount($item`stunt nuts`) > 0,
    do: () => {
      auto_abort(
        "Some sort of Wet Stunt Nut Stew error. Try making it yourself?",
      );
      return true;
    },
  },
);

const L11_palindomeFightDrAwkwardTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeFightDrAwkward",
    completed: () => internalQuestStatus("questL11Palindome") > 5,
    ready: () => L11_palindomeReadyForDrAwkward(),
    do: () => L11_palindomeFightDrAwkward(),
  },
);

const L11_palindomeFightDudesTask: QuestTask = registerQuestTask(
  L11_palindomeTask,
  {
    name: "L11_palindomeFightDudes",
    completed: () => internalQuestStatus("questL11Palindome") > 5,
    ready: () => !L11_palindomeReadyForDrAwkward(),
    do: () => L11_palindomeFightDudes(),
    locations: $location`Inside the Palindome`,
    desiredEncounters: () => {
      const desired: (DesiredDrop | DesiredFights)[] = [];
      if (
        L11_palindomeTotalPhotos() < 4 &&
        !possessEquipment($item`Mega Gem`)
      ) {
        desired.push({
          monster: $phylum`dude`,
          needAmount:
            L11_palindomeDudesToDown() - get("palindomeDudesDefeated"),
        });
      }
      if (
        internalQuestStatus("questL11Palindome") < 1 &&
        itemAmount($item`photograph of a dog`) === 0
      ) {
        desired.push({
          monster: $monsters`Racecar Bob, Bob Racecar`,
          needAmount:
            L11_palindomeDudesToDown() - get("palindomeDudesDefeated"),
        });
      }
      if (
        itemAmount($item`stunt nuts`) === 0 &&
        itemAmount($item`wet stunt nut stew`) === 0
      ) {
        desired.push({ item: $item`stunt nuts`, needAmount: 1 });
      }
      return desired;
    },
  },
);

export function L11_palindomeNeedWetStew(): boolean {
  return (
    (itemAmount($item`lion oil`) === 0 || itemAmount($item`bird rib`) === 0) &&
    itemAmount($item`wet stew`) === 0 &&
    itemAmount($item`wet stunt nut stew`) === 0 &&
    !isActuallyEd() &&
    internalQuestStatus("questL11Palindome") < 5
  );
}

function hasILoveMeVolI(): boolean {
  return (
    itemAmount($item`[2258]"I Love Me, Vol. I"`) > 0 ||
    itemAmount($item`[7262]"I Love Me, Vol. I"`) > 0
  );
}

function useILoveMeVolI(): boolean {
  if (itemAmount($item`[2258]"I Love Me, Vol. I"`) > 0) {
    return use(1, $item`[2258]"I Love Me, Vol. I"`);
  } else if (itemAmount($item`[7262]"I Love Me, Vol. I"`) > 0) {
    return use(1, $item`[7262]"I Love Me, Vol. I"`);
  }
  return false;
}
