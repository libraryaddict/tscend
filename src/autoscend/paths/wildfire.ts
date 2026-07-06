import {
  abort,
  containsText,
  equip,
  equippedItem,
  getCounters,
  getProperty,
  haveEquipped,
  inHardcore,
  Item,
  itemAmount,
  Location,
  mpCost,
  myAdventures,
  myAscensions,
  myLevel,
  myMeat,
  myMp,
  myPath,
  myWildfireWater,
  npcPrice,
  runChoice,
  setProperty,
  toBoolean,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $element, $item, $location, $path, $skill, $slot } from "libram";

import { auto_advToReserve } from "../../autoscend";
import { auto_buyUpTo, pull_meat } from "../auto_acquire";
import { autoAdv$2 } from "../auto_adventure";
import { inebriety_left, stomach_left } from "../auto_consume";
import { autoEquip, possessOutfit$1 } from "../auto_equipment";
import { acquireHP, acquireMP$1 } from "../auto_restore";
import {
  auto_log_info$1,
  auto_log_warning$1,
  doNumberology,
  doNumberology$2,
  inKnollSign,
  internalQuestStatus,
  isDesertAvailable,
  setFlavour,
} from "../auto_util";
import { zone_available } from "../auto_zone";
import { auto_saberChargesAvailable } from "../iotms/mr2019";
import {
  auto_canExtinguisherBeRefilled,
  auto_fireExtinguisherCharges,
  auto_haveFireExtinguisher,
} from "../iotms/mr2021";
import {
  LX_spookyravenManorFirstFloor,
  LX_unlockHauntedBilliardsRoom,
} from "../quests/level_11";
import { auto_warSide, haveWarOutfit$1 } from "../quests/level_12";

//Defined in autoscend/paths/wildfire.ash
export function in_wildfire(): boolean {
  return myPath() === $path`Wildfire`;
}

export function wildfire_initializeSettings(): void {
  if (!in_wildfire()) {
    return;
  }
  setProperty("auto_wandOfNagamar", false.toString()); //wand not used in this path
  setProperty("auto_getBeehive", true.toString()); //fire cannot be reduced from 5 in tower making the fight too difficult without beehive
}

export function wildfire_groar_check(): boolean {
  //Prepare to fight [Groar, Except Hot] in wildfire path. Also check if we are ready for the fight.
  //Return true if we are not ready and should delay this fight
  //[Mist-Shrouded Peak] cannot reduced fire level from 5. Take 20-25% maxHP hot passive dmg per round. always lose initiative
  if (!in_wildfire()) {
    return false; //since we are not in wildfire, we are considered "ready" so we do not block the quest in other paths
  }
  if (myLevel() < 13) {
    return true; //we want to delay this until we are level 13. The more stats we have the easier the fight is.
  }
  if (!acquireHP() || !acquireMP$1(150)) {
    return true; //killing groar requires lots of MP and full HP.
  }
  setFlavour($element`sleaze`); //deal extra damage against hot opponent

  return false;
}

export function wildfire_warboss_check(): boolean {
  //Prepare to fight [The Big Ignatowicz] or [The Man on Fire] in wildfire path. Also check if we are ready for the fight.
  //Return true if we are not ready and should delay this fight
  //[The Hippy Camp] and [The Orcish Frat House] cannot reduced fire level from 5. Take 20-25% maxHP hot passive dmg per round. always lose initiative
  if (!in_wildfire()) {
    return false; //since we are not in wildfire, we are considered "ready" so we do not block the quest in other paths
  }
  if (!acquireHP() || !acquireMP$1(150)) {
    return true; //killing warboss requires lots of MP and full HP.
  }
  setFlavour($element`sleaze`); //deal extra damage against hot opponent

  return false;
}

export function LX_wildfire_calculateTheUniverse(): boolean {
  //in wildfire calculate the universe always summons in a fire 5 zone which 100% burns all dropped items. unless conditional drops
  //yellow ray items still burn up. the only exception is [use the force] because it brings you to a noncombat to give you the items
  if (!in_wildfire()) {
    return false;
  }
  if (myMp() < mpCost($skill`Calculate the Universe`)) {
    return false;
  }

  if (
    !possessOutfit$1("Frat Warrior Fatigues") &&
    auto_warSide() === "fratboy" &&
    auto_saberChargesAvailable() > 0
  ) {
    if (doNumberology$2("battlefield", false) !== -1) {
      autoEquip($slot`weapon`, $item`Fourth of May Cosplay Saber`);
      return doNumberology("battlefield") !== -1;
    }
    return false; //we want 151 and can get it in general. but not right now. so save it for later
  }

  doNumberology("adventures3");
  return false; //we do not want to restart the loop as all we're doing is generating 3 adventures
}

function wildfire_rainbarrel(): void {
  //collect rainwater from barrel daily
  if (!in_wildfire()) {
    return;
  }
  if (toBoolean(getProperty("_wildfireBarrelHarvested"))) {
    return; //already collected today
  }
  visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_rainbarrel");
}

function wildfire_refillExtinguiser(): void {
  //refill fire extinguisher if needed. Can only refill once per day
  if (!in_wildfire()) {
    return;
  }
  if (!auto_canExtinguisherBeRefilled()) {
    return; //already refilled today
  }
  if (auto_fireExtinguisherCharges() >= 20) {
    return; //biggest skill uses 20 charge. No need to charge if we still have at least that much
  }
  //need extinguisher equiped for it to be refilled
  let old: Item = Item.none;
  if (!haveEquipped($item`industrial fire extinguisher`)) {
    old = equippedItem($slot`weapon`);
    equip($slot`weapon`, $item`industrial fire extinguisher`);
  }

  auto_log_info$1(
    "Refilling Industrial Fire Extinguisher with Fire Captain Hagnk.",
  );
  visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_captain");
  runChoice(3);
  //equip prior weapon
  if (old !== Item.none) {
    equip($slot`weapon`, old);
  }
}

function wildfire_water_cost(target: string): number {
  //return the cost in water to perform watering operations.
  if (!in_wildfire()) {
    return 0;
  }
  if (!["dust", "frack", "sprinkle", "hose"].includes(target)) {
    abort(
      "an invalid target was passed to int wildfire_water_cost(string target)",
    );
  }
  let count_1: number = 0;
  const dusted: boolean = toBoolean(getProperty("wildfireDusted"));
  const fracked: boolean = toBoolean(getProperty("wildfireFracked"));
  const sprinkled: boolean = toBoolean(getProperty("wildfireSprinkled"));
  switch (target) {
    case "hose":
      //how much does having cpt hangk send firefighers to hose down an area cost.
      return 10 + 10 * toInt(getProperty("_captainHagnkUsed"));
    case "dust":
      if (dusted) {
        return 0;
      }
      if (fracked) {
        count_1++;
      }
      if (sprinkled) {
        count_1++;
      }
      break;
    case "frack":
      if (fracked) {
        return 0;
      }
      if (dusted) {
        count_1++;
      }
      if (sprinkled) {
        count_1++;
      }
      break;
    case "sprinkle":
      if (sprinkled) {
        return 0;
      }
      if (dusted) {
        count_1++;
      }
      if (fracked) {
        count_1++;
      }
      break;
  }
  return 1000 + count_1 * 1000;
}

function LX_wildfire_grease_pump(): boolean {
  if (!in_wildfire()) {
    return false;
  }
  if (toBoolean(getProperty("wildfirePumpGreased"))) {
    return false; //already greased
  }
  if (
    itemAmount($item`pump grease`) === 0 &&
    npcPrice($item`pump grease`) === 0
  ) {
    abort(
      "We are showing you did not grease the pump & do not have [pump grease] & cannot buy pump grease. Something is wrong. please fix it",
    );
  }

  if (itemAmount($item`pump grease`) === 0) {
    //buy the grease
    pull_meat(npcPrice($item`pump grease`));
    if (myMeat() >= npcPrice($item`pump grease`)) {
      auto_buyUpTo(1, $item`pump grease`);
    } else {
      if (toInt(getProperty("lastSecondFloorUnlock")) < myAscensions()) {
        return false; //go do other stuff until spookyraven second floor is unlocked
      }
      return autoAdv$2($location`The Haunted Bedroom`); //get enough meat to grease the pump
    }
  }

  if (itemAmount($item`pump grease`) > 0) {
    //use the grease
    use(1, $item`pump grease`);
    if (!toBoolean(getProperty("wildfirePumpGreased"))) {
      abort(
        "Failed to use [pump grease] or mafia is tracking it incorrectly. please resolve the issue and run me again",
      );
    }
    return true;
  }
  return false;
}

function LX_wildfire_pump(target: number): boolean {
  //use the pump until we reach target water or run low on adv
  //returns true if adv were spent. regardless of whether target was reached or not
  if (!in_wildfire()) {
    return false;
  }
  visitUrl("charpane.php"); //r20946 must refresh charpane to update water
  if (target <= myWildfireWater()) {
    return false; //already done
  }

  auto_log_info$1(`Attempting to pump water until we have ${target}`);
  const start_water: number = myWildfireWater();
  const start_adv: number = myAdventures();
  while (target > myWildfireWater() && getCounters("", 0, 0) === "") {
    //r25706. clicking in browser works properly. but visit url causes a desync on water quantity. and there is no mafia command to pump water while keeping water level synced. As such we must visit charpane.php after pumping water to update our water value.
    const start_adv_1: number = myAdventures();
    visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_oldpump");
    visitUrl("charpane.php");
    if (start_adv_1 === myAdventures()) {
      abort(
        "Tried to pump water but our adv count did not change. what went wrong?",
      );
    }
    if (start_water === myWildfireWater()) {
      abort("Mafia failed to update your water level after pumping water");
    }
    const completely_full: boolean = stomach_left() < 1 && inebriety_left() < 1;
    let adv_target: number = auto_advToReserve();
    if (!completely_full) {
      adv_target++;
    }
    if (myAdventures() <= adv_target) {
      break; //we are done for the day
    }
  }
  return start_adv !== myAdventures();
}

function LX_wildfire_dust(): boolean {
  //cropdusting is a priority.
  if (!in_wildfire()) {
    return false;
  }
  if (toBoolean(getProperty("wildfireDusted"))) {
    return false; //already done
  }
  //pump water. restart loop if adv were spent
  const retval: boolean = LX_wildfire_pump(wildfire_water_cost("dust"));

  if (wildfire_water_cost("dust") <= myWildfireWater()) {
    auto_log_info$1("Dusting with Cropduster Dusty");
    visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_cropster");
    runChoice(1);
    if (!toBoolean(getProperty("wildfireDusted"))) {
      abort(
        "Mysteriously failed to Dust with Cropduster Dusty. fix it and run me again",
      );
    }
  }
  return retval;
}

function LX_wildfire_frack(): boolean {
  //cropdusting is a priority.
  if (!in_wildfire()) {
    return false;
  }
  if (toBoolean(getProperty("wildfireFracked"))) {
    return false; //already done
  }
  //pump water. restart loop if adv were spent
  const retval: boolean = LX_wildfire_pump(wildfire_water_cost("frack"));

  if (wildfire_water_cost("frack") <= myWildfireWater()) {
    auto_log_info$1("Fracking with Fracker Dan");
    visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_fracker");
    runChoice(1);
    if (!toBoolean(getProperty("wildfireFracked"))) {
      abort(
        "Mysteriously failed to Frack with Fracker Dan. fix it and run me again",
      );
    }
  }
  return retval;
}

function LX_wildfire_hose_once(place: Location): boolean {
  if (!in_wildfire()) {
    return false;
  }
  if (place.fireLevel === 0) {
    auto_log_warning$1(
      `I can not Hose down [${place}] with fire captain hangk as it is already at fire level 0`,
    );
    return false;
  }
  let retval: boolean = false;

  const start_level: number = place.fireLevel;
  if (wildfire_water_cost("hose") <= myWildfireWater()) {
    auto_log_info$1(`Hosing down [${place}]`);
    visitUrl("place.php?whichplace=wildfire_camp&action=wildfire_captain");
    visitUrl(`choice.php?option=1&whichchoice=1451&pwd=&zid=${place.id}`);
    if (start_level - 1 === place.fireLevel) {
      retval = true; //success
    } else {
      abort(
        `Mysteriously failed to Hose down [${place}] with fire captain hangk. fix it and run me again`,
      );
    }
  } else {
    abort(
      `LX_wildfire_hose_once() did not have enough water to Hose down [${place}]. Report and run me again`,
    );
  }

  return retval;
}

function LX_wildfire_hose(place: Location, target_fire: number): boolean {
  //have cpt hangk send water hosers to hose loc down until fire level reaches target_fire
  //only return true if the loop needs to be restarted. which only occurs if we adv were spent on pumping water
  if (!in_wildfire()) {
    return false;
  }
  if (!zone_available(place)) {
    return false;
  }
  if (place.fireLevel <= target_fire) {
    return false; //already done
  }
  auto_log_info$1(
    `Trying to hose down [${place}] from fire level ${place.fireLevel} to fire level ${target_fire}`,
  );

  const water_offset: number[] = [0, 0, 10, 30, 60, 100]; //an array of the extra costs of hosing due to price increase.
  const hoses_needed: number = place.fireLevel - target_fire;
  let water_needed: number = wildfire_water_cost("hose");
  water_needed =
    (water_offset[hoses_needed] ??= 0) + water_needed * hoses_needed;
  //pump water. restart loop if adv were spent
  const retval: boolean = LX_wildfire_pump(water_needed);

  for (let i: number = 0; i < 5; i++) {
    //loop a max of 5 times. the max number of times fire can be reduced
    if (place.fireLevel > target_fire) {
      //we are not done
      if (!LX_wildfire_hose_once(place)) {
        //attempt to hose. if it fails do below
        break; //hosing failed so stop the loop. LX_wildfire_hose_once should print an explanation on why it failed
      }
    } else {
      //we are done
      break;
    }
  }
  return retval; //we only return true during water pumping if adv was used
}

function LX_wildfire_hose$1(place: Location): boolean {
  return LX_wildfire_hose(place, 2);
}

function LX_wildfire_water(): boolean {
  //use water in a variety of ways to reduce fire levels. putting it in pre-adv is problematic since we need to spend adventures here
  //individual location watering first
  //for stone wool. needed at level 11 but we acquire it early using [Baa'baa'bu'ran]. Skip if we've somehow already progressed past that stage
  if (internalQuestStatus("questL11Worship") < 3) {
    if (LX_wildfire_hose$1($location`The Hidden Temple`)) {
      return true;
    }
  }

  if (!isDesertAvailable() && !inKnollSign()) {
    //knoll sign does not need to farm components for bitchin meatcar
    if (LX_wildfire_hose$1($location`The Degrassi Knoll Garage`)) {
      return true;
    }
  }

  if (
    toBoolean(getProperty("auto_getSteelOrgan")) &&
    getProperty(
      //we want steel margarita
      "questM10Azazel",
    ) !== "finished" &&
    internalQuestStatus(
      //we do not yet have it
      "questM10Azazel",
    ) > -1
  ) {
    //can not hose these until quest is started
    if (LX_wildfire_hose$1($location`The Laugh Floor`)) {
      //need [imp air]
      return true;
    }
    if (LX_wildfire_hose$1($location`Infernal Rackets Backstage`)) {
      //need [bus pass]
      return true;
    }
  }

  if (myLevel() > 10 && zone_available($location`The Hidden Bowling Alley`)) {
    LX_wildfire_hose$1($location`The Hidden Bowling Alley`); //part of level 11 quest. potentially might want to go after NC instead
  }

  if (
    inHardcore() &&
    !haveWarOutfit$1() &&
    internalQuestStatus("questL12War") === 0
  ) {
    //we need war outfit
    abort(
      "Due to tracking issues you need to manually acquire the necessary war outfit and run me again",
    );
    // below is code for automation that is not functional due to mafia not tracking fire levels correctly. When fixed upstream remove the the abort and uncomment the code
    //  https://github.com/loathers/autoscend/issues/892#issuecomment-934059485
    //		if(auto_warSide()==="fratboy")
    //		{
    //			LX_wildfire_hose($location[Wartime Frat House (Hippy Disguise)]);
    //		}
    //		else
    //		{
    //			LX_wildfire_hose($location[Wartime Hippy Camp (Frat Disguise)]);
    //		}
  }
  //mass watering. waters all areas of a certain type (outdoor, indoor, underground) reducing fire from 5 to 2
  if (toBoolean(getProperty("wildfirePumpGreased"))) {
    //only pump and mass water if you greased the pump
    if (LX_wildfire_dust()) {
      return true;
    }
    if (myLevel() > 3) {
      if (LX_wildfire_frack()) {
        return true;
      }
    }
  }

  return false;
}

function LX_wildfire_spookyravenManorFirstFloor(): boolean {
  //in hardcore we need to reach the 2nd floor ASAP.
  if (!in_wildfire() || !inHardcore()) {
    return false;
  }

  if (myLevel() > 1) {
    //force ignoring the delay for 9 hot & 9 stench res setting so we can get through the kitchen
    if (LX_unlockHauntedBilliardsRoom(false)) {
      return true;
    }
  }
  //hand chalk does not burn up so fire level is not an issue there.
  const doing_haunted_library: boolean =
    internalQuestStatus("questM20Necklace") === 3;
  if (
    !auto_haveFireExtinguisher() &&
    doing_haunted_library &&
    containsText(getProperty("auto_beatenUpLocations"), "The Haunted Library")
  ) {
    LX_wildfire_hose($location`The Haunted Library`, 3); //to make combat easier
  }
  if (LX_spookyravenManorFirstFloor()) {
    return true;
  }

  return false;
}

export function LA_wildfire(): boolean {
  if (!in_wildfire()) {
    return false;
  }

  wildfire_rainbarrel(); //collect rainwater from barrel daily
  wildfire_refillExtinguiser(); //refill extinguisher once per day
  if (LX_wildfire_grease_pump()) {
    //improves pump water from 30/adv to 50/adv
    return true;
  }
  if (LX_wildfire_water()) {
    //use water to reduce fire levels.
    return true;
  }
  if (LX_wildfire_spookyravenManorFirstFloor()) {
    //in hardcore we need to reach the 2nd floor ASAP.
    return true;
  }

  return false;
}
