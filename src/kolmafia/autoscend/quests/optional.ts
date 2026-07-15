import {
  abort,
  availableAmount,
  Class,
  cliExecute,
  containsText,
  creatableAmount,
  create,
  eatsilent,
  getDwelling,
  getInventory,
  getProperty,
  guildStoreAvailable,
  haveSkill,
  inebrietyLimit,
  inHardcore,
  Item,
  itemAmount,
  knollAvailable,
  Location,
  myAscensions,
  myClass,
  myInebriety,
  myLevel,
  myMeat,
  myPrimestat,
  myTurncount,
  npcPrice,
  outfit,
  outfitPieces,
  runChoice,
  setProperty,
  toBoolean,
  toInt,
  toSlot,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
  $item,
  $items,
  $location,
  $skill,
  $slot,
  $stat,
} from "libram";

import {
  acquireGumItem,
  auto_buyUpTo,
  canPull$1,
  pullXWhenHaveY,
} from "../auto_acquire";
import { autoAdv, autoAdvBypass$1 } from "../auto_adventure";
import {
  autoChew,
  autoDrink,
  fullness_left,
  inebriety_left,
  spleen_left,
} from "../auto_consume";
import {
  addToMaximize,
  autoEquip$1,
  autoForceEquip$3,
  autoOutfit,
  autoStripOutfit,
  possessEquipment,
  possessOutfit,
  possessOutfit$1,
} from "../auto_equipment";
import { provideItem$2 } from "../auto_providers";
import { canBurnDelay } from "../auto_routing";
import {
  auto_can_equip,
  auto_is_valid,
  auto_log_debug,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_log_warning$1,
  backupSetting,
  internalQuestStatus,
  isGuildClass,
  meatReserve,
} from "../auto_util";
import { auto_wishesAvailable, makeGenieWish } from "../iotms/mr2017";
import { januaryToteAcquire } from "../iotms/mr2018";
import { auto_haveTearawayPants } from "../iotms/mr2024";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_ggoo } from "../paths/grey_goo";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_kolhs } from "../paths/kolhs";
import { in_lta } from "../paths/license_to_adventure";
import { in_lowkeysummer } from "../paths/low_key_summer";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_picky } from "../paths/picky";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_wereprof } from "../paths/wereprofessor";
import { in_robot } from "../paths/you_robot";
import { L5_slayTheGoblinKing } from "./level_05";
import { L6_friarsGetParts } from "./level_06";
import { hasSpookyravenLibraryKey, shenShouldDelayZone } from "./level_11";
import { LX_islandAccess } from "./level_any";

// All prototypes for this code described in autoscend_header.ash

//Defined in autoscend/quests/optional.ash
export function LX_unlockThinknerdWarehouse(spend_resources: boolean): boolean {
  //unlocks [The Thinknerd Warehouse], returns true if successful or adv is spent
  //much easier to do if you already have torso awaregness

  if (internalQuestStatus("questM22Shirt") > -1) {
    return false;
  }

  auto_log_debug$1(
    `Trying to unlock [The Thinknerd Warehouse] with spend_resources set to ${spend_resources}`,
  );
  //unlocking is a multi step process. We want to try things in reverse to conserve resources and in case some steps were already complete.

  function useLetter(): boolean {
    if (itemAmount($item`Letter for Melvign the Gnome`) > 0) {
      if (use(1, $item`Letter for Melvign the Gnome`)) {
        auto_log_debug$1("Successfully unlocked the [The Thinknerd Warehouse]");
        return true;
      } else {
        abort(
          "Somehow failed to use [Letter for Melvign the Gnome]... aborting to prevent infinite loops",
        );
      }
    }
    return false;
  }

  let target_shirt: Item = Item.none;
  let hasShirt: boolean = false;
  //one time initial scan of inventory
  for (const it of Item.get(Object.keys(getInventory()))) {
    if (toSlot(it) === $slot`shirt`) {
      target_shirt = it;
      hasShirt = true;
      break;
    }
  }

  function useShirtThenLetter(): boolean {
    if (!hasShirt) {
      return false;
    }
    visitUrl(
      `inv_equip.php?pwd&which=2&action=equip&whichitem=${toInt(target_shirt)}`,
    );
    if (useLetter()) {
      return true;
    }
    auto_log_error(
      `For some reason LX_unlockThinknerdWarehouse failed when trying to use the shirt [${target_shirt}] to get [Letter for Melvign the Gnome] to start the quest`,
    );
    return false;
  }
  function getShirtWhenHaveNone(it: Item): void {
    if (hasShirt) {
      return;
    }
    if (canPull$1(it)) {
      if (pullXWhenHaveY(it, 1, 0)) {
        target_shirt = it;
        hasShirt = true;
      }
    } else if (
      creatableAmount(it) > 0 &&
      (spend_resources || knollAvailable())
    ) {
      if (create(1, it)) {
        target_shirt = it;
        hasShirt = true;
      }
    }
  }
  //if you already had a shirt or a letter, then just unlock the quest now
  if (useLetter()) {
    return true;
  }
  if (useShirtThenLetter()) {
    return true;
  }
  //Try to acquire a shirt.
  //IOTM that does not require a pull
  januaryToteAcquire($item`Letter for Melvign the Gnome`); //no stats and no pull required
  if (useLetter()) {
    return true;
  }
  //TODO, make the following IOTM foldables actually work
  //getShirtWhenHaveNone($item[flaming pink shirt])		//foldable IOTM that requires torso awaregness.
  //getShirtWhenHaveNone($item[origami pasties])			//foldable IOTM that requires torso awaregness.
  //getShirtWhenHaveNone($item[sugar shirt])				//libram summons sugar sheet, multiuse 1 with torso awaregness to get sugar shirt
  //Shirts to pull
  getShirtWhenHaveNone($item`Sneaky Pete's leather jacket`); //useful IOTM shirt with no state requirements to wear
  getShirtWhenHaveNone($item`Sneaky Pete's leather jacket (collar popped)`);
  getShirtWhenHaveNone($item`Professor What T-Shirt`); //you likely have it, no requirements to wear, very cheap in mall
  //Shirts to smith. Will likely cost 1 adv unless in knoll sign.
  getShirtWhenHaveNone($item`white snakeskin duster`); //7 mus req
  getShirtWhenHaveNone($item`clownskin harness`); //15 mus req
  getShirtWhenHaveNone($item`demonskin jacket`); //25 mus req
  getShirtWhenHaveNone($item`gnauga hide vest`); //25 mus req
  getShirtWhenHaveNone($item`tuxedo shirt`); //35 mus req
  getShirtWhenHaveNone($item`yak anorak`); //42 mus req
  getShirtWhenHaveNone($item`hipposkin poncho`); //45 mus req
  getShirtWhenHaveNone($item`lynyrdskin tunic`); //70 mus req
  getShirtWhenHaveNone($item`bat-ass leather jacket`); //77 mus req
  //wish for a shirt
  if (
    spend_resources &&
    auto_wishesAvailable() > 0 &&
    itemAmount($item`blessed rustproof +2 gray dragon scale mail`) === 0
  ) {
    makeGenieWish("for a blessed rustproof +2 gray dragon scale mail");
    target_shirt = $item`blessed rustproof +2 gray dragon scale mail`;
    hasShirt = true;
  }
  //TODO adventure somewhere to acquire shirt
  //if(spend_resources && hasTorso())
  //did we succeeded in getting a shirt? use it and then the letter.
  if (useShirtThenLetter()) {
    return true;
  }
  //sadness, we couldn't unlock this zone.
  auto_log_debug$1("Failed to unlock [The Thinknerd Warehouse]");
  return false;
}

export function LX_steelOrgan_condition_slow(): boolean {
  return (
    !toBoolean(getProperty("auto_slowSteelOrgan")) &&
    toBoolean(getProperty("auto_getSteelOrgan"))
  );
}

export function LX_steelOrgan(): boolean {
  if (!toBoolean(getProperty("auto_getSteelOrgan"))) {
    return false;
  }
  if ($classes`Ed the Undying, Gelatinous Noob, Vampyre`.includes(myClass())) {
    auto_log_info(
      `${myClass()} can not use a Steel Organ, turning off setting.`,
      "blue",
    );
    setProperty("auto_getSteelOrgan", false.toString());
    return false;
  }
  if (in_nuclear() || in_lta()) {
    auto_log_info(
      "You could get a Steel Organ for aftercore, but why? We won't help with this deviant and perverse behavior. Turning off setting.",
      "blue",
    );
    setProperty("auto_getSteelOrgan", false.toString());
    return false;
  }

  if (
    haveSkill($skill`Liver of Steel`) ||
    haveSkill($skill`Stomach of Steel`) ||
    haveSkill($skill`Spleen of Steel`)
  ) {
    auto_log_info("We have a steel organ, turning off the setting.", "blue");
    setProperty("auto_getSteelOrgan", false.toString());
    return false;
  }

  if (internalQuestStatus("questL06Friar") < 3) {
    // can't get to Pandaemonium if we haven't cleansed the taint!
    return L6_friarsGetParts();
  }

  if (getProperty("questM10Azazel") !== "finished") {
    auto_log_info("I am hungry for some steel.", "blue");
  }
  // typically getting steel organ means this is a long run, might as well use all options to get +item as sources refresh each day
  provideItem$2(567, $location`The Laugh Floor`, true);

  if (getProperty("questM10Azazel") === "unstarted") {
    visitUrl("pandamonium.php");
    visitUrl("pandamonium.php?action=moan");
    visitUrl("pandamonium.php?action=infe");
    visitUrl("pandamonium.php?action=sven");
    visitUrl("pandamonium.php?action=sven");
    visitUrl("pandamonium.php?action=beli");
    visitUrl("pandamonium.php?action=mourn");
  }
  if (getProperty("questM10Azazel") === "started") {
    if (
      (!possessEquipment($item`observational glasses`) ||
        itemAmount($item`imp air`) < 5) &&
      itemAmount($item`Azazel's tutu`) === 0
    ) {
      autoAdv($location`The Laugh Floor`);
    } else if (
      (itemAmount($item`Azazel's unicorn`) === 0 ||
        itemAmount($item`bus pass`) < 5) &&
      itemAmount($item`Azazel's tutu`) === 0
    ) {
      let jim: number = 0;
      let flargwurm: number = 0;
      let bognort: number = 0;
      let stinkface: number = 0;
      let need: number = 4;
      if (itemAmount($item`comfy pillow`) > 0) {
        jim = toInt($item`comfy pillow`);
        need -= 1;
      }
      if (itemAmount($item`booze-soaked cherry`) > 0) {
        flargwurm = toInt($item`booze-soaked cherry`);
        need -= 1;
      }
      if (itemAmount($item`giant marshmallow`) > 0) {
        bognort = toInt($item`giant marshmallow`);
        need -= 1;
      }
      if (itemAmount($item`beer-scented teddy bear`) > 0) {
        stinkface = toInt($item`beer-scented teddy bear`);
        need -= 1;
      }
      if (need > 0) {
        let cake: number = itemAmount($item`sponge cake`);
        let paper: number = itemAmount($item`gin-soaked blotter paper`);
        if (jim === 0 && cake > 0) {
          jim = toInt($item`sponge cake`);
          need -= 1;
          cake -= 1;
        }
        if (flargwurm === 0 && cake > 0) {
          flargwurm = toInt($item`sponge cake`);
          need -= 1;
        }
        if (bognort === 0 && paper > 0) {
          bognort = toInt($item`gin-soaked blotter paper`);
          need -= 1;
          paper -= 1;
        }
        if (stinkface === 0 && paper > 0) {
          stinkface = toInt($item`gin-soaked blotter paper`);
          need -= 1;
        }
      }

      if (need === 0 && itemAmount($item`Azazel's unicorn`) === 0) {
        visitUrl("pandamonium.php?action=sven");
        visitUrl(
          `pandamonium.php?action=sven&bandmember=Jim&togive=${jim}&preaction=try`,
        );
        visitUrl("pandamonium.php?action=sven");
        visitUrl(
          `pandamonium.php?action=sven&bandmember=Flargwurm&togive=${flargwurm}&preaction=try`,
        );
        visitUrl("pandamonium.php?action=sven");
        visitUrl(
          `pandamonium.php?action=sven&bandmember=Bognort&togive=${bognort}&preaction=try`,
        );
        visitUrl("pandamonium.php?action=sven");
        visitUrl(
          `pandamonium.php?action=sven&bandmember=Stinkface&togive=${stinkface}&preaction=try`,
        );
        return true;
      }

      autoAdv($location`Infernal Rackets Backstage`);
    } else if (
      itemAmount($item`Azazel's lollipop`) === 0 &&
      itemAmount($item`Azazel's tutu`) === 0
    ) {
      for (const it of $items`hilarious comedy prop, Victor\, the Insult Comic Hellhound Puppet, observational glasses`) {
        if (possessEquipment(it) && auto_can_equip(it)) {
          autoForceEquip$3(it);
          visitUrl(`pandamonium.php?action=mourn&whichitem=${toInt(it)}&pwd=`);
        } else if (availableAmount(it) === 0) {
          abort(`Somehow we do not have ${it} at this point...`);
        }
      }
    } else if (
      itemAmount($item`Azazel's tutu`) === 0 &&
      itemAmount($item`bus pass`) >= 5 &&
      itemAmount($item`imp air`) >= 5
    ) {
      visitUrl("pandamonium.php?action=moan");
    } else if (
      itemAmount($item`Azazel's tutu`) > 0 &&
      itemAmount($item`Azazel's lollipop`) > 0 &&
      itemAmount($item`Azazel's unicorn`) > 0
    ) {
      visitUrl("pandamonium.php?action=temp");
    } else {
      auto_log_warning(
        "Stuck in the Steel Organ quest and can't continue, moving on.",
        "red",
      );
      setProperty("auto_getSteelOrgan", false.toString());
    }
    return true;
  } else if (getProperty("questM10Azazel") === "finished") {
    auto_log_info("Considering Steel Organ consumption.....", "blue");
    if (
      itemAmount($item`steel lasagna`) > 0 &&
      fullness_left() >= $item`steel lasagna`.fullness
    ) {
      eatsilent(1, $item`steel lasagna`);
    }
    const wontBeOverdrunk: boolean =
      inebriety_left() >= $item`steel margarita`.inebriety - 5;
    const notOverdrunk: boolean = myInebriety() <= inebrietyLimit();
    const notSavingForBilliards: boolean =
      hasSpookyravenLibraryKey() ||
      toInt(getProperty("lastSecondFloorUnlock")) === myAscensions() ||
      myInebriety() + $item`steel margarita`.inebriety <= 10 ||
      myInebriety() >= 12;
    const notWaitingKOLHS: boolean = !in_kolhs() || myInebriety() > 9;
    if (
      itemAmount($item`steel margarita`) > 0 &&
      wontBeOverdrunk &&
      notOverdrunk &&
      notSavingForBilliards &&
      notWaitingKOLHS
    ) {
      autoDrink(1, $item`steel margarita`);
    }
    if (
      itemAmount($item`steel-scented air freshener`) > 0 &&
      spleen_left() >= 5
    ) {
      autoChew(1, $item`steel-scented air freshener`);
    }
  }
  return false;
}

export function LX_guildUnlock(): boolean {
  if (!isGuildClass() || guildStoreAvailable()) {
    return false;
  }
  if (in_nuclear() || in_pokefam() || in_robot()) {
    return false;
  }
  if (
    !(in_picky() || in_lowkeysummer()) &&
    toBoolean(getProperty("auto_skipUnlockGuild")) &&
    !(myPrimestat() === $stat`Moxie` && auto_haveTearawayPants())
  ) {
    return false;
  }
  if (in_ggoo() && $classes`Seal Clubber, Turtle Tamer`.includes(myClass())) {
    return false; //muscle classes cannot unlock guild in grey goo
  }

  let pref: string = "";
  let loc: Location = Location.none;
  if (myPrimestat() === $stat`Moxie` && auto_haveTearawayPants()) {
    //Can bypass moxie test if we have the Tearaway Pants
    if (autoForceEquip$3($item`tearaway pants`)) {
      if (internalQuestStatus("questG08Moxie") < 1) {
        visitUrl("guild.php?place=challenge");
      }
      return true;
    }
  }
  switch (myPrimestat()) {
    case $stat`Muscle`:
      pref = "questG09Muscle";
      loc = $location`The Outskirts of Cobb's Knob`;
      break;
    case $stat`Mysticality`:
      pref = "questG07Myst";
      loc = $location`The Haunted Pantry`;
      break;
    case $stat`Moxie`:
      pref = "questG08Moxie";
      if (internalQuestStatus(pref) < 1) {
        loc = $location`The Sleazy Back Alley`;
      }
      break;
  }
  if (loc !== Location.none) {
    if (getProperty(pref) !== "started") {
      visitUrl("guild.php?place=challenge");
    }
    if (internalQuestStatus(pref) < 0) {
      auto_log_warning("Visiting the guild failed to set guild quest.", "red");
      return false;
    }

    if (canBurnDelay(loc)) {
      // All guild unlock choice adventures have a delay of 5 adventures.
      return false;
    }

    auto_log_info("Let's unlock the guild.", "green");

    autoAdv(loc);
    if (internalQuestStatus(pref) === 1) {
      visitUrl("guild.php?place=challenge");
    }
    return true;
  }
  return false;
}

export function startArmorySubQuest(): boolean {
  if (in_koe() || in_nuclear()) {
    //will unlock the zone but does not actually start the quest. also currently not tracked by mafia so we will think the zone is unavailable.
    if (itemAmount($item`hypnotic breadcrumbs`) > 0) {
      return use(1, $item`hypnotic breadcrumbs`);
    }
    return false;
  }

  if (internalQuestStatus("questM25Armorer") === -1) {
    visitUrl("shop.php?whichshop=armory");
    visitUrl("shop.php?whichshop=armory&action=talk");
    visitUrl("choice.php?pwd=&whichchoice=1065&option=1");
    if (internalQuestStatus("questM25Armorer") > -1) {
      return true;
    }
  }
  return false;
}

export function startMeatsmithSubQuest(): boolean {
  if (in_koe()) {
    return false; //quest cannot be started and zone cannot be unlocked.
  }
  if (internalQuestStatus("questM23Meatsmith") !== -1) {
    return false; //quest already started
  }
  if (in_nuclear()) {
    if (itemAmount($item`bone with a price tag on it`) > 0) {
      //will unlock the zone but does not actually start the quest. also currently not tracked by mafia so we will think the zone is unavailable.
      return use(1, $item`bone with a price tag on it`);
    }
    return false;
  }

  visitUrl("shop.php?whichshop=meatsmith");
  visitUrl("shop.php?whichshop=meatsmith&action=talk");
  runChoice(1);
  return internalQuestStatus("questM23Meatsmith") > -1;
}

export function finishMeatsmithSubQuest(): boolean {
  if (internalQuestStatus("questM23Meatsmith") !== 1) {
    return false;
  }
  if (itemAmount($item`check to the Meatsmith`) > 0) {
    visitUrl("shop.php?whichshop=meatsmith");
    runChoice(2);
    return true;
  }
  return false;
}

function considerGalaktikSubQuest(): void {
  //by default we do not do doc galaktik quest. user can manually enable it via gui for this current ascension.
  //this function considers wheather we should automatically enable it for this ascension.

  if (!toBoolean(getProperty("auto_considerGalaktik"))) {
    return; //user must opt in for automatic enabling of galaktik quest when needed
  }
  if (toBoolean(getProperty("auto_doGalaktik"))) {
    return; //already enabled for this ascension
  }
  if (internalQuestStatus("questM24Doc") !== 0) {
    //quest is unstarted or already finished
    return; //we always try to start this quest. if we could not for some reason then there is no point in trying to do it
  }
  if (myTurncount() < 30) {
    return; //give it some turns to see how well we handle things before deciding if galaktik is needed
  }
  if (in_koe()) {
    return; //galaktik is unavailable in kingdom of exploathing
  }
  if (in_darkGyffte() || in_plumber()) {
    return; //these classes cannot use galaktik restorers.
  }
  if (myClass() === $class`Accordion Thief` && myLevel() > 10) {
    return; //AT get guild store access and can use [magical mystery juice] instead
  }
  if ($classes`Pastamancer, Sauceror`.includes(myClass())) {
    return; //Sauceror restores via curse of weaksauce. Pastamancer can use MMJ to restore.
  }

  if (myMeat() < 100) {
    auto_log_info(
      "We are so poor we cannot effectively restore anymore. Enabling Galaktik quest for this ascension",
      "red",
    );
    setProperty("auto_doGalaktik", true.toString());
    return;
  }
  if (myMeat() < meatReserve() + 100) {
    auto_log_info(
      "Our meat reserves are far too low, we still need to save up some for quests. Enabling Galaktik quest for this ascension",
      "red",
    );
    setProperty("auto_doGalaktik", true.toString());
    return;
  }
}

export function startGalaktikSubQuest(): boolean {
  if (internalQuestStatus("questM24Doc") !== -1) {
    return false; //quest already started
  }
  if (in_nuclear() || in_koe()) {
    //will unlock the zone but does not actually start the quest. also currently not tracked by mafia so we will think the zone is unavailable.
    if (itemAmount($item`map to a hidden booze cache`) > 0) {
      return use(1, $item`map to a hidden booze cache`);
    }
    return false;
  }

  visitUrl("shop.php?whichshop=doc");
  visitUrl("shop.php?whichshop=doc&action=talk");
  runChoice(1);
  return internalQuestStatus("questM24Doc") > -1;
}

function finishGalaktikSubQuest(): boolean {
  if (
    itemAmount($item`fraudwort`) >= 3 &&
    itemAmount($item`shysterweed`) >= 3 &&
    itemAmount($item`swindleblossom`) >= 3
  ) {
    const temp: string = visitUrl("shop.php?whichshop=doc");
    if (containsText(temp, "What did you need, again?")) {
      visitUrl("shop.php?whichshop=doc&action=talk");
    }
    runChoice(2);
    if (internalQuestStatus("questM24Doc") > 1) {
      return true;
    }
  }
  return false;
}

export function LX_galaktikSubQuest(): boolean {
  //do doc galaktik optional subquest.
  if (finishGalaktikSubQuest()) {
    //always turn the quest in if possible
    return true;
  }
  considerGalaktikSubQuest(); //if allowed will automatically enable the quest in some cases

  if (internalQuestStatus("questM24Doc") !== 0) {
    //questM24Doc is used by mafia to track progress. step1 means you have the flowers and need to turn them in. 0 means started but incomplete.
    return false;
  }
  if (!toBoolean(getProperty("auto_doGalaktik"))) {
    return false; //by default we do not want to do this quest.
  }
  if (startGalaktikSubQuest()) {
    //always start the quest if available
    return true;
  }

  return autoAdv($location`The Overgrown Lot`);
}

export function LX_doingPirates(): boolean {
  return in_lowkeysummer(); //we are only doing pirates in that path now
}

export function LX_pirateOutfit(): boolean {
  if (toInt(getProperty("lastIslandUnlock")) < myAscensions()) {
    return LX_islandAccess();
  }
  if (in_lowkeysummer() && !inHardcore()) {
    // in_lowkeysummer() means that turns are being spent in the Cove first which makes this worth doing
    // pull book to learn insults ahead of starting beerpong quest. saves at least however many fights on the way to gathering the outfit
    // plus lets you keep trying to gather the outfit while learning insults, can save the pulls for missing pieces that come next
    pullXWhenHaveY($item`The Big Book of Pirate Insults`, 1, 0);
    //want 6 insults to try but learning another finding Cap'm Caronch can still improve chances more
    const preGatheringInsults: boolean =
      itemAmount($item`The Big Book of Pirate Insults`) > 0 &&
      numPirateInsults() < 6;

    if (possessEquipment($item`peg key`) && !preGatheringInsults) {
      // if we have the key and insults, just pull any outfit parts we are still missing
      for (const [, it] of outfitPieces("Swashbuckling Getup").entries()) {
        pullXWhenHaveY(it, 1, 0);
      }
    }
  }
  if (possessOutfit$1("Swashbuckling Getup")) {
    if (
      possessOutfit("Swashbuckling Getup", true) &&
      itemAmount($item`The Big Book of Pirate Insults`) === 0 &&
      myMeat() > npcPrice($item`The Big Book of Pirate Insults`)
    ) {
      auto_buyUpTo(1, $item`The Big Book of Pirate Insults`);
    }
    return false;
  }
  auto_log_info("Searching for a pirate outfit.", "blue");
  return autoAdv($location`The Obligatory Pirate's Cove`);
}

export function piratesCoveChoiceHandler(choice: number): void {
  if (choice === 22) {
    // The Arrrbitrator
    if (possessEquipment($item`eyepatch`)) {
      if (possessEquipment($item`swashbuckling pants`)) {
        runChoice(3); // get 100 Meat.
      } else {
        runChoice(2); // get swashbuckling pants
      }
    } else {
      runChoice(1); // get eyepatch
    }
  } else if (choice === 23) {
    // Barrie Me at Sea
    if (possessEquipment($item`stuffed shoulder parrot`)) {
      if (possessEquipment($item`swashbuckling pants`)) {
        runChoice(3); // get 100 Meat.
      } else {
        runChoice(2); // get swashbuckling pants
      }
    } else {
      runChoice(1); // get stuffed shoulder parrot
    }
  } else if (choice === 24) {
    // Amatearrr Night
    if (possessEquipment($item`stuffed shoulder parrot`)) {
      if (possessEquipment($item`eyepatch`)) {
        runChoice(2); // get 100 Meat.
      } else {
        runChoice(3); // get eyepatch
      }
    } else {
      runChoice(1); // get stuffed shoulder parrot
    }
  } else {
    abort("unhandled choice in piratesCoveChoiceHandler");
  }
}

function beerPong(page: string): string {
  class r {
    constructor(
      public insult: string = "",
      public retort: string = "",
    ) {}
  }

  const insults: Map<number, r> = new Map();
  (insults.get(1) ?? insults.set(1, new r()).get(1)).insult =
    "Arrr, the power of me serve'll flay the skin from yer bones!";
  (insults.get(1) ?? insults.set(1, new r()).get(1)).retort =
    "Obviously neither your tongue nor your wit is sharp enough for the job.";
  (insults.get(2) ?? insults.set(2, new r()).get(2)).insult =
    "Do ye hear that, ye craven blackguard?  It be the sound of yer doom!";
  (insults.get(2) ?? insults.set(2, new r()).get(2)).retort =
    "It can't be any worse than the smell of your breath!";
  (insults.get(3) ?? insults.set(3, new r()).get(3)).insult =
    "Suck on <i>this</i>, ye miserable, pestilent wretch!";
  (insults.get(3) ?? insults.set(3, new r()).get(3)).retort =
    "That reminds me, tell your wife and sister I had a lovely time last night.";
  (insults.get(4) ?? insults.set(4, new r()).get(4)).insult =
    "The streets will run red with yer blood when I'm through with ye!";
  (insults.get(4) ?? insults.set(4, new r()).get(4)).retort =
    "I'd've thought yellow would be more your color.";
  (insults.get(5) ?? insults.set(5, new r()).get(5)).insult =
    "Yer face is as foul as that of a drowned goat!";
  (insults.get(5) ?? insults.set(5, new r()).get(5)).retort =
    "I'm not really comfortable being compared to your girlfriend that way.";
  (insults.get(6) ?? insults.set(6, new r()).get(6)).insult =
    "When I'm through with ye, ye'll be crying like a little girl!";
  (insults.get(6) ?? insults.set(6, new r()).get(6)).retort =
    "It's an honor to learn from such an expert in the field.";
  (insults.get(7) ?? insults.set(7, new r()).get(7)).insult =
    "In all my years I've not seen a more loathsome worm than yerself!";
  (insults.get(7) ?? insults.set(7, new r()).get(7)).retort =
    "Amazing!  How do you manage to shave without using a mirror?";
  (insults.get(8) ?? insults.set(8, new r()).get(8)).insult =
    "Not a single man has faced me and lived to tell the tale!";
  (insults.get(8) ?? insults.set(8, new r()).get(8)).retort =
    "It only seems that way because you haven't learned to count to one.";

  while (!containsText(page, "victory laps")) {
    const old_page: string = page;

    if (!containsText(page, "Insult Beer Pong")) {
      abort("You don't seem to be playing Insult Beer Pong.");
    }

    if (containsText(page, "Phooey")) {
      auto_log_info("Looks like something went wrong and you lost.", "lime");
      return page;
    }

    for (const i of insults.keys()) {
      if (
        containsText(
          page,
          (insults.get(i) ?? insults.set(i, new r()).get(i)).insult,
        )
      ) {
        if (
          containsText(
            page,
            (insults.get(i) ?? insults.set(i, new r()).get(i)).retort,
          )
        ) {
          auto_log_info("Found appropriate retort for insult.", "lime");
          auto_log_debug(
            `Insult: ${(insults.get(i) ?? insults.set(i, new r()).get(i)).insult}`,
            "lime",
          );
          auto_log_debug(
            `Retort: ${(insults.get(i) ?? insults.set(i, new r()).get(i)).retort}`,
            "lime",
          );
          page = visitUrl(`beerpong.php?value=Retort!&response=${i}`);
          break;
        } else {
          auto_log_info(
            "Looks like you needed a retort you haven't learned.",
            "red",
          );
          auto_log_debug(
            `Insult: ${(insults.get(i) ?? insults.set(i, new r()).get(i)).insult}`,
            "lime",
          );
          auto_log_debug(
            `Retort: ${(insults.get(i) ?? insults.set(i, new r()).get(i)).retort}`,
            "lime",
          );
          // Give a bad retort
          page = visitUrl("beerpong.php?value=Retort!&response=9");
          return page;
        }
      }
    }

    if (page === old_page) {
      abort(
        "String not found. There may be an error with one of the insult or retort strings.",
      );
    }
  }

  auto_log_info("You won a thrilling game of Insult Beer Pong!", "lime");
  return page;
}

function tryBeerPong(): string {
  let page: string = visitUrl("adventure.php?snarfblat=157"); //http://127.0.0.1:60081/adventure.php?snarfblat=157
  if (containsText(page, "Arrr You Man Enough?")) {
    page = beerPong(visitUrl("choice.php?pwd&whichchoice=187&option=1"));
  }
  return page;
}

export function numPirateInsults(): number {
  let retval: number = 0;
  let i: number = 1;
  while (i <= 8) {
    if (getProperty(`lastPirateInsult${i}`) === "true") {
      retval = retval + 1;
    }
    i = i + 1;
  }
  return retval;
}

export function LX_joinPirateCrew(): boolean {
  if (toInt(getProperty("lastIslandUnlock")) < myAscensions()) {
    return LX_islandAccess();
  }
  if (internalQuestStatus("questM12Pirate") > 4) {
    return false;
  }
  if (internalQuestStatus("questL12War") === 1) {
    return false;
  }
  if (!possessOutfit("Swashbuckling Getup", true)) {
    auto_log_info(
      "Can not equip, or do not have the Swashbuckling Getup. Delaying.",
      "red",
    );
    return false;
  }
  if (
    itemAmount($item`The Big Book of Pirate Insults`) === 0 &&
    myMeat() > npcPrice($item`The Big Book of Pirate Insults`)
  ) {
    auto_buyUpTo(1, $item`The Big Book of Pirate Insults`);
  }
  if (
    internalQuestStatus("questM12Pirate") === -1 ||
    internalQuestStatus("questM12Pirate") === 1 ||
    internalQuestStatus("questM12Pirate") === 3
  ) {
    auto_log_info("Findin' the Cap'n", "blue");
    autoOutfit("Swashbuckling Getup");
    autoAdv($location`Barrrney's Barrr`); // this returns false on the Cap'n Caronch adventures for some reason.
    return true;
  } else if (internalQuestStatus("questM12Pirate") === 0) {
    auto_log_info("Nasty Booty time!", "red");
    if (
      autoAdvBypass$1(
        "inv_use.php?pwd=&which=3&whichitem=2950",
        $location`Noob Cave`,
      )
    ) {
      return true;
    }
  } else if (internalQuestStatus("questM12Pirate") === 2) {
    auto_log_info("Attempting to infiltrate the frat house", "blue");
    let infiltrationReady: boolean = false;
    if (possessOutfit("Frat Boy Ensemble", true)) {
      auto_log_info(
        "We have the Frat Boy Ensemble, begin infiltration!",
        "blue",
      );
      outfit("Frat Boy Ensemble");
      infiltrationReady = true;
    } else if (
      possessEquipment($item`mullet wig`) &&
      auto_can_equip($item`mullet wig`) &&
      itemAmount($item`briefcase`) > 0
    ) {
      auto_log_info(
        "We have a mullet wig and a briefcase, begin infiltration!",
        "blue",
      );
      autoForceEquip$3($item`mullet wig`);
      infiltrationReady = true;
    } else if (
      possessEquipment($item`frilly skirt`) &&
      auto_can_equip($item`frilly skirt`) &&
      itemAmount($item`hot wing`) > 2
    ) {
      auto_log_info(
        "We have hot wings and a frilly skirt, begin infiltration!",
        "blue",
      );
      autoForceEquip$3($item`frilly skirt`);
      infiltrationReady = true;
    }

    if (!infiltrationReady) {
      function mightGetHotwings(): boolean {
        return (
          internalQuestStatus("questL06Friar") < 2 ||
          (in_lowkeysummer() && !possessEquipment($item`demonic key`))
        );
      }
      const mightCatburgle: boolean =
        (itemAmount($item`hot wing`) > 2 || mightGetHotwings()) &&
        (knollAvailable() || possessEquipment($item`frilly skirt`));

      if (!infiltrationReady && !mightCatburgle) {
        if (itemAmount($item`briefcase`) > 0) {
          // missing only mullet wig and not expecting Catburgle
          if (
            pullXWhenHaveY($item`mullet wig`, 1, 0) &&
            autoForceEquip$3($item`mullet wig`)
          ) {
            infiltrationReady = true;
          }
        }
      }

      if (!infiltrationReady) {
        if (
          itemAmount($item`hot wing`) > 2 &&
          auto_can_equip($item`frilly skirt`)
        ) {
          if (knollAvailable() && myMeat() > npcPrice($item`frilly skirt`)) {
            auto_log_info(
              "We have hot wings but no frilly skirt. Lets go shopping!",
              "blue",
            );
            auto_buyUpTo(1, $item`frilly skirt`);
            autoForceEquip$3($item`frilly skirt`);
            infiltrationReady = true;
          } else {
            //frilly skirt is 25% drop from 1 of 3 gym monsters, try pulling it before spending adventures
            if (
              pullXWhenHaveY($item`frilly skirt`, 1, 0) &&
              autoForceEquip$3($item`frilly skirt`)
            ) {
              infiltrationReady = true;
            } else {
              auto_log_info(
                "We have hot wings but no frilly skirt. Lets go to the gym!",
                "blue",
              );
              if (internalQuestStatus("questM01Untinker") === -1) {
                visitUrl(
                  "place.php?whichplace=forestvillage&preaction=screwquest&action=fv_untinker_quest",
                );
              }
              if (autoAdv($location`The Degrassi Knoll Gym`)) {
                return true;
              }
            }
          }
        } else if (
          possessEquipment($item`mullet wig`) &&
          auto_can_equip($item`mullet wig`)
        ) {
          // easiest to get or wait to get a briefcase
          // todo modify banish list to not banish pygmy headhunters if wanting a briefcase in hardcore?
          if (
            !mightCatburgle &&
            internalQuestStatus("questL04Bat") >= 1 &&
            toInt(getProperty("hiddenOfficeProgress")) >= 6
          ) {
            // briefcase zones already finished and not expecting Catburgle then try to pull it
            if (
              pullXWhenHaveY($item`briefcase`, 1, 0) &&
              autoForceEquip$3($item`mullet wig`)
            ) {
              infiltrationReady = true;
            }
          }
        }
        // else: todo get frat boy ensemble if possible. may not be possible if frat house is (Bombed Back to the Stone Age)
      }
    }

    if (infiltrationReady) {
      if (use(1, $item`Orcish Frat House blueprints`)) {
        return true;
      }
    }
  } else if (internalQuestStatus("questM12Pirate") === 4) {
    if (numPirateInsults() >= 6) {
      // this is held together with duct tape and hopes and dreams.
      // it can and will fail but it will have to do for now.
      auto_log_info("Beer Pong time.", "blue");
      outfit("Swashbuckling Getup"); //do not use autoOutfit since we use visit_url in tryBeerPong which skips maximizer
      backupSetting("choiceAdventure187", "0");
      tryBeerPong();
      return true;
    } else {
      auto_log_info("Insult gathering party.", "blue");
      addToMaximize("-outfit Swashbuckling Getup");
      // If we're wearing the pirate outfit already, autoAdv will fail to adventure
      // in the cove since the zone isn't available unless we remove it (which wouldn't happen until auto_pre_adv runs)
      autoStripOutfit("Swashbuckling Getup");
      if (autoAdv($location`The Obligatory Pirate's Cove`)) {
        return true;
      }
    }
  }
  return false;
}

export function barrrneysBarrrChoiceHandler(choice: number): void {
  auto_log_info(`barrrneysBarrrChoiceHandler Running choice ${choice}`, "blue");
  if (choice === 184) {
    // That Explains All The Eyepatches
    if (myPrimestat() === $stat`Mysticality`) {
      runChoice(3); // get shot of rotgut
    } else {
      runChoice(1); // combat with tipsy pirate
    }
  } else if (choice === 185) {
    // Yes, You're a Rock Starrr
    runChoice(3); // combat with tetchy pirate at 0 drunkenness or stats otherwise
  } else if (choice === 186) {
    // A Test of Testarrrsterone
    if (myPrimestat() === $stat`Moxie`) {
      runChoice(3); // moxie stats
    } else {
      runChoice(1); // stats
    }
  } else {
    abort("unhandled choice in barrrneysBarrrChoiceHandler");
  }
}

function LX_fledglingPirateIsYou(): boolean {
  if (internalQuestStatus("questM12Pirate") !== 5) {
    return false;
  }

  if (possessEquipment($item`pirate fledges`)) {
    return false;
  }

  auto_log_info("F'c'le t'me!", "blue");
  autoOutfit("Swashbuckling Getup");
  return autoAdv($location`The F'c'le`);
}

export function fcleChoiceHandler(choice: number): void {
  if (choice === 191) {
    if (itemAmount($item`valuable trinket`) > 0) {
      runChoice(2);
    } else {
      switch (myPrimestat()) {
        case $stat`Muscle`:
          runChoice(3);
          break;
        case $stat`Mysticality`:
          runChoice(4);
          break;
        case $stat`Moxie`:
          runChoice(1);
          break;
      }
    }
  } else {
    abort("unhandled choice in fcleChoiceHandler");
  }
}

function LX_unlockBelowdecks(): boolean {
  if (
    internalQuestStatus("questM12Pirate") !== 6 ||
    internalQuestStatus("questL11MacGuffin") < 2
  ) {
    return false;
  }

  if (!possessEquipment($item`pirate fledges`)) {
    return false;
  }

  auto_log_info("Swordfish? Every password was swordfish!", "blue");
  autoEquip$1($item`pirate fledges`);
  return autoAdv($location`The Poop Deck`);
}

export function LX_pirateQuest(): boolean {
  if (
    LX_pirateOutfit() ||
    LX_joinPirateCrew() ||
    LX_fledglingPirateIsYou() ||
    LX_unlockBelowdecks()
  ) {
    return true;
  }
  return false;
}

export function LX_unlockKnobMenagerie(): boolean {
  if (itemAmount($item`Cobb's Knob Menagerie key`) > 0) {
    if (itemAmount($item`Cobb's Knob lab key`) > 0) {
      return false; //already unlocked
    } else {
      //if Menagerie key was somehow obtained outside of the lab, lab key is also needed to access Menagerie
      //lab key should be obtained during the level 5 quest or ultimately from the king
      if (L5_slayTheGoblinKing()) {
        return true;
      }
      auto_log_warning$1(
        "Unable to finish the King of Cobb's Knob Quest yet to obtain the Cobb's Knob lab key, so can't unlock the Menagerie.",
      );
      return false;
    }
  }
  if (itemAmount($item`Cobb's Knob lab key`) === 0) {
    return false; //can't adventure in the lab for the Menagerie key
  }
  if (
    in_lowkeysummer() &&
    $location`Cobb's Knob Laboratory`.turnsSpent === 13
  ) {
    //should probably have already gotten the key on the way to getting the path key
    //if backtracking to unlock the menagerie refresh once to double check
    cliExecute("refresh inv");
    if (itemAmount($item`Cobb's Knob Menagerie key`) > 0) {
      return false; //already unlocked
    }
  }
  if ($location`Cobb's Knob Laboratory`.turnsSpent > 20) {
    cliExecute("refresh inv");
    if (itemAmount($item`Cobb's Knob Menagerie key`) === 0) {
      abort(
        "Have been spending too many adventures in Cobb's Knob Laboratory trying to get Menagerie key. Either very bad luck or something wrong is going on.",
      );
    }
  }
  auto_log_info("Looking for the Cobb's Knob Menagerie key.", "blue");
  return autoAdv($location`Cobb's Knob Laboratory`);
}

const $_f_epicWeapons: Map<Class, Item> = new Map([
  [$class`Seal Clubber`, $item`Hammer of Smiting`],
  [$class`Turtle Tamer`, $item`Chelonian Morningstar`],
  [$class`Pastamancer`, $item`Greek Pasta Spoon of Peril`],
  [$class`Sauceror`, $item`17-alarm Saucepan`],
  [$class`Disco Bandit`, $item`Shagadelic Disco Banjo`],
  [$class`Accordion Thief`, $item`Squeezebox of the Ages`],
]); // usage: item epicWeapon = epicWeapons[my_class()];

const $_f_starterWeapons: Map<Class, Item> = new Map([
  [$class`Seal Clubber`, $item`seal-clubbing club`],
  [$class`Turtle Tamer`, $item`turtle totem`],
  [$class`Pastamancer`, $item`pasta spoon`],
  [$class`Sauceror`, $item`saucepan`],
  [$class`Disco Bandit`, $item`disco ball`],
  [$class`Accordion Thief`, $item`stolen accordion`],
]); // usage: item starterWeapon = starterWeapons[my_class()];

function tomb_already_found(): boolean {
  //the tomb only appears once when adv in the unquiet garves. afterwards it appears on the map instead
  const page: string = visitUrl("place.php?whichplace=cemetery");
  return containsText(page, "place.php?whichplace=cemetery&action=cem_advtomb");
}

export function LX_acquireEpicWeapon(): boolean {
  if (internalQuestStatus("questG04Nemesis") > 4) {
    return false; // already done with this part
  }
  if (!isGuildClass() || !guildStoreAvailable()) {
    return false; // no guild access. can't start this quest
  }
  if (internalQuestStatus("questG04Nemesis") < 0) {
    visitUrl("guild.php?place=scg"); // start quest
    visitUrl("guild.php?place=scg"); // No really, start the quest.
    cliExecute("refresh quests"); // fixes buggy tracking. confirmed still in mafia r20143
    if (internalQuestStatus("questG04Nemesis") < 0) {
      abort(
        "Failed to start Nemesis quest. Please start it manually then run me again",
      );
    }
  }

  if (
    itemAmount(
      $_f_epicWeapons.get(myClass()) ??
        $_f_epicWeapons.set(myClass(), Item.none).get(myClass()),
    ) > 0
  ) {
    return false;
  }

  if (internalQuestStatus("questG04Nemesis") === 4) {
    visitUrl("guild.php?place=scg");
    return true;
  }

  if (shenShouldDelayZone($location`The Unquiet Garves`)) {
    auto_log_debug$1("Delaying The Unquiet Garves in case of Shen.");
    return false;
  }

  if (
    itemAmount(
      $_f_starterWeapons.get(myClass()) ??
        $_f_starterWeapons.set(myClass(), Item.none).get(myClass()),
    ) === 0
  ) {
    // make sure we have a starter weapon for the swap.
    acquireGumItem(
      $_f_starterWeapons.get(myClass()) ??
        $_f_starterWeapons.set(myClass(), Item.none).get(myClass()),
    );
  }

  addToMaximize(
    `-equip ${($_f_starterWeapons.get(myClass()) ?? $_f_starterWeapons.set(myClass(), Item.none).get(myClass())).toString()}`,
  );
  if (tomb_already_found()) {
    return autoAdvBypass$1("place.php?whichplace=cemetery&action=cem_advtomb");
  }

  return autoAdv($location`The Unquiet Garves`);
}
// TODO: Add the rest of the Nemesis quest with a flag to enable doing it in-run?

export function houseUpgrade(): void {
  //function for upgrading your dwelling.
  if (
    isActuallyEd() ||
    in_darkGyffte() ||
    in_nuclear() ||
    in_wereprof() ||
    in_robot() ||
    in_amw()
  ) {
    return; //paths where dwelling is locked
  }
  //if you have no dwelling get_dwelling() returns $item[big rock]
  if (
    itemAmount($item`Newbiesport™ tent`) > 0 &&
    auto_is_valid($item`Newbiesport™ tent`) &&
    getDwelling() === $item`big rock`
  ) {
    use(1, $item`Newbiesport™ tent`);
  }
  if (
    (getDwelling() === $item`big rock` ||
      getDwelling() === $item`Newbiesport™ tent`) &&
    itemAmount($item`Frobozz Real-Estate Company Instant House (TM)`) > 0 &&
    auto_is_valid($item`Frobozz Real-Estate Company Instant House (TM)`)
  ) {
    use(1, $item`Frobozz Real-Estate Company Instant House (TM)`);
  }
}
