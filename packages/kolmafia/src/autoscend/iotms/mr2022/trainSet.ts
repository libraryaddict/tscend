import {
  containsText,
  min,
  monsterLevelAdjustment,
  myLevel,
  myPrimestat,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, $stat, get } from "libram";

import {
  auto_get_campground,
  auto_is_valid,
  internalQuestStatus,
} from "../../auto_util";
import { in_plumber } from "../../paths/2020/path_of_the_plumber";
import { L8_trapperTalk, needOre } from "../../quests/level_08";
import { bridgeGoal, fastenerCount, lumberCount } from "../../quests/level_09";

export function haveTrainSet(): boolean {
  return (
    auto_get_campground().has($item`model train set`) &&
    auto_is_valid($item`model train set`)
  ); //check if the model train set is in the campground
}

function auto_modifyTrainSet(
  one: number,
  two: number,
  three: number,
  four: number,
  five: number,
  six: number,
  seven: number,
  eight: number,
): void {
  const page: string = `choice.php?pwd&whichchoice=1485&option=1&slot[0]=${one}&slot[1]=${two}&slot[2]=${three}&slot[3]=${four}&slot[4]=${five}&slot[5]=${six}&slot[6]=${seven}&slot[7]=${eight}`;
  visitUrl(page, true, true);
  visitUrl("main.php");
  return;
}

export function checkTrainSet(): void {
  if (!haveTrainSet()) {
    return;
  }

  const lastTrainsetConfiguration: number = get("lastTrainsetConfiguration");
  const trainsetPosition: number = get("trainsetPosition");
  const trainsetConfiguration: string = get("trainsetConfiguration");

  /* A list of what the station numbers are (thanks Zdrvst for compiling this list for your CS script)
	1: meat
	2: mp regen
	3: all stats
	4: hot res, cold dmg
	5: stench res, spooky dmg
	6: wood, joiners, or stats (orc chasm bridge stuff)
	7: candy
	8: double next stop
	9: cold res, stench dmg
	11: spooky res, sleaze dmg
	12: sleaze res, hot dmg
	13: monster level
	14: mox stats
	15: basic booze
	16: mys stats
	17: mus stats
	18: food drop buff
	19: copy last food drop
	20: ore
	*/
  const stationInts: Map<number, string> = new Map();
  stationInts.set(1, "meat_mine");
  stationInts.set(2, "tower_fizzy");
  stationInts.set(3, "viewing_platform");
  stationInts.set(4, "tower_frozen");
  stationInts.set(5, "spooky_graveyard");
  stationInts.set(6, "logging_mill");
  stationInts.set(7, "candy_factory");
  stationInts.set(8, "coal_hopper");
  stationInts.set(9, "tower_sewage");
  stationInts.set(11, "oil_refinery");
  stationInts.set(12, "oil_bridge");
  stationInts.set(13, "water_bridge");
  stationInts.set(14, "groin_silo");
  stationInts.set(15, "grain_silo");
  stationInts.set(16, "brain_silo");
  stationInts.set(17, "brawn_silo");
  stationInts.set(18, "prawn_silo");
  stationInts.set(19, "trackside_diner");
  stationInts.set(20, "ore_hopper");
  const one: number = 8; //doubler
  let two: number;
  let three: number;
  let four: number;
  if (myLevel() < 11) {
    //check if we need more stats. There is no check for disregard instant karma because
    //if we do check, we will never double lumber mill, which is more beneficial than continuing to double mainstat.
    if (myPrimestat() === $stat`Muscle`) {
      two = 17;
    } else if (myPrimestat() === $stat`Mysticality`) {
      two = 16;
    } else {
      two = 14;
    }
    three = 3; //all stats
    four = 6; //lumber mill
  } else if (fastenerCount() < bridgeGoal() || lumberCount() < bridgeGoal()) {
    //Double lumber mill to clear orc bridge faster
    two = 6; //lumber mill
    if (myPrimestat() === $stat`Muscle`) {
      three = 17;
    } else if (myPrimestat() === $stat`Mysticality`) {
      three = 16;
    } else {
      three = 14;
    }
    four = 3; //all stats
  } else {
    //no need for main stats or bridge parts so lets do resistances and offstats
    two = 11; //spooky res, sleaze dmg
    three = 4; //hot res, cold dmg
    if (myPrimestat() === $stat`Muscle`) {
      four = 14; //Moxie for Muscle peeps
    } else if (myPrimestat() === $stat`Mysticality`) {
      four = 14; //Moxie for Mysticality peeps
    } else {
      four = 17; //Muscle for Moxie peeps
    }
  }
  const five: number = 1; //meat
  const six: number = 2; //mp regen
  let seven: number;
  //Initialize trapper to know whether we have enough ore or not
  const L8Step: number = internalQuestStatus("questL08Trapper");
  if (myLevel() >= 8 && L8Step === 0) {
    L8_trapperTalk();
  }
  if (needOre()) {
    seven = 20; //ore
  } else {
    if (myPrimestat() === $stat`Muscle`) {
      seven = 16; //Mysticality for Muscle peeps
    } else if (myPrimestat() === $stat`Mysticality`) {
      seven = 17; //Muscle for Mysticality peeps
    } else {
      seven = 16; //Mysticality for Moxie peeps
    }
  }
  let eight: number = 13; //monster level
  if (
    (monsterLevelAdjustment() > toInt(get("auto_MLSafetyLimit")) &&
      get("auto_MLSafetyLimit") !== "") ||
    toInt(get("auto_MLSafetyLimit")) === -1 ||
    in_plumber()
  ) {
    eight = 9; //cold res, stench dmg
  }
  const turnsSinceTSConfigured: number = min(
    trainsetPosition - lastTrainsetConfiguration,
    40,
  );
  const expectedConfig: string = `${stationInts.get(one) ?? ""},${stationInts.get(two) ?? ""},${stationInts.get(three) ?? ""},${stationInts.get(four) ?? ""},${stationInts.get(five) ?? ""},${stationInts.get(six) ?? ""},${stationInts.get(seven) ?? ""},${stationInts.get(eight) ?? ""}`;

  let changedTSConfig: boolean;
  if (expectedConfig !== trainsetConfiguration) {
    changedTSConfig = true;
  } else {
    changedTSConfig = false;
  }
  //only check for the page if it has been 0 turns or 40 turns since last configured and the configuration has changed
  if (
    turnsSinceTSConfigured === 0 ||
    (turnsSinceTSConfigured === 40 && changedTSConfig)
  ) {
    const page: string = visitUrl("campground.php?action=workshed"); //once it is available, still double check that we can actually change the config
    if (containsText(page, 'value="Save Train Set Configuration"')) {
      auto_modifyTrainSet(one, two, three, four, five, six, seven, eight);
    }
    return;
  }
}
