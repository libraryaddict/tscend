import {
  abort,
  availableAmount,
  canEat,
  canEquip,
  cliExecute,
  containsText,
  equip,
  equippedItem,
  Familiar,
  familiarEquippedEquipment,
  familiarWeight,
  getAutumnatonLocations,
  getLocketMonsters,
  getProperty,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  haveSkill,
  inebrietyLimit,
  Item,
  itemAmount,
  itemDropModifier,
  Location,
  max,
  min,
  Monster,
  monsterLevelAdjustment,
  myAscensions,
  myFamiliar,
  myInebriety,
  myLevel,
  myLocation,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  retrieveItem,
  round,
  runChoice,
  setProperty,
  splitString,
  toBoolean,
  toFamiliar,
  toInt,
  toLocation,
  toMonster,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $familiars,
  $item,
  $location,
  $skill,
  $slot,
  $stat,
} from "libram";

import { autoAdv, autoAdvBypass } from "../auto_adventure";
import { auto_canDrink, spleen_left } from "../auto_consume";
import {
  addToMaximize,
  autoEquip,
  autoEquip$1,
  possessEquipment,
} from "../auto_equipment";
import {
  auto_have_familiar,
  handleFamiliar$1,
  is100FamRun,
  pathAllowsChangingFamiliar,
} from "../auto_familiar";
import { disregardInstantKarma, isAboutToPowerlevel } from "../auto_powerlevel";
import {
  auto_can_equip,
  auto_get_campground,
  auto_is_valid,
  auto_is_valid$1,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning$1,
  handleTracker,
  handleTracker$1,
  hasTorso,
  internalQuestStatus,
  meatReserve,
  wrap_item,
} from "../auto_util";
import { zone_available, zone_needItem } from "../auto_zone";
import { generic_t } from "../autoscend_record";
import { auto_useSkill, canUse, useItem } from "../combat/auto_combat_util";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { is_professor } from "../paths/wereprofessor";
import { L8_trapperTalk, needOre } from "../quests/level_08";
import {
  fastenerCount,
  hedgeTrimmersNeeded,
  L9_twinPeak,
  lumberCount,
} from "../quests/level_09";
import { needStarKey } from "../quests/level_13";
import { have_fireworks_shop } from "./mr2021";
import { auto_neededShadowBricks } from "./mr2023";

// This is meant for items that have a date of 2022

//Defined in autoscend/iotms/mr2022.ash
export function auto_haveCursedMagnifyingGlass(): boolean {
  if (
    possessEquipment($item`cursed magnifying glass`) &&
    auto_can_equip($item`cursed magnifying glass`)
  ) {
    return true;
  }
  return false;
}

export function auto_voidMonster(): boolean {
  return auto_voidMonster$1(Location.none);
}

export function auto_voidMonster$1(loc: Location): boolean {
  // Cursed Magnifying Glass gives a void monster combat every 13 turns. The first 5 are free fights
  // _voidFreeFights counts up from 0 and stays at 5 once all free fights are completed for the day
  if (!auto_haveCursedMagnifyingGlass()) {
    return false;
  }

  if (is_professor()) {
    return false; //can't beat the void guys as a professor
  }
  // return false if we've fought the 5 free void monsters already today or we're still charging up the counter
  if (
    toInt(getProperty("_voidFreeFights")) >= 5 ||
    toInt(getProperty("cursedMagnifyingGlassCount")) !== 13
  ) {
    return false;
  }

  if (loc === Location.none) {
    return true;
  }

  if (autoEquip$1($item`cursed magnifying glass`)) {
    setProperty("auto_nextEncounter", "void guy"); //which of the 3 is random, but they're all same phylum and free under same conditions
    return autoAdv(loc);
  }
  setProperty("auto_nextEncounter", "");
  return false;
}

export function auto_haveCosmicBowlingBall(): boolean {
  // ensure we not only own one but it's in allowed in path and also in inventory for us to do stuff with.
  return (
    toBoolean(getProperty("hasCosmicBowlingBall")) &&
    auto_is_valid($item`cosmic bowling ball`) &&
    availableAmount($item`cosmic bowling ball`) > 0
  );
}

export function auto_bowlingBallCombatString(
  place: Location,
  speculation: boolean,
): string {
  if (!auto_haveCosmicBowlingBall()) {
    return "";
  }

  if (is_professor()) {
    return ""; //Handle specially in WereProf Combat file
  }

  if (
    place === $location`The Hidden Bowling Alley` &&
    toInt(getProperty("auto_bowledAtAlley")) !== myAscensions()
  ) {
    if (!speculation) {
      setProperty("auto_bowledAtAlley", myAscensions().toString());
      auto_log_info$1(
        "Cosmic Bowling Ball used at Hidden Bowling Alley to advance quest.",
      );
    }
    return useItem($item`cosmic bowling ball`, !speculation);
  }
  // determine if we want more stats
  if (canUse($skill`Bowl Sideways`)) {
    // increase stats if we are power leveling
    if (isAboutToPowerlevel()) {
      return auto_useSkill($skill`Bowl Sideways`, !speculation);
    }
    // increase stats if we are farming Ka as Ed
    if (toBoolean(getProperty("_auto_farmingKaAsEd"))) {
      return auto_useSkill($skill`Bowl Sideways`, !speculation);
    }
  }
  // determine if we want more item or meat bonus
  if (canUse($skill`Bowl Straight Up`)) {
    // increase item bonus if not item capped in current zone
    const itemNeed: generic_t = zone_needItem(place);
    if (itemNeed._boolean) {
      if (itemDropModifier() < itemNeed._float) {
        return auto_useSkill($skill`Bowl Straight Up`, !speculation);
      }
    }
    // increase meat bonus if doing nuns
    if (place === $location`The Themthar Hills`) {
      return auto_useSkill($skill`Bowl Straight Up`, !speculation);
    }
  }

  return "";
}

export function auto_haveCombatLoversLocket(): boolean {
  return (
    possessEquipment($item`combat lover's locket`) &&
    auto_is_valid($item`combat lover's locket`)
  );
}

function auto_CombatLoversLocketCharges(): number {
  // can fight up to 3 unique monsters by reminiscing with the locket
  if (!auto_haveCombatLoversLocket()) {
    return 0;
  }

  const locketMonstersFought: string = getProperty("_locketMonstersFought");
  // check if we haven't found any yet
  if (locketMonstersFought === "") {
    return 3;
  }

  return 3 - splitString(locketMonstersFought, ",").length;
}

function auto_haveReminiscedMonster(mon: Monster): boolean {
  const idList: Map<number, string> = new Map(
    splitString(getProperty("_locketMonstersFought"), ",").map((_v, _i) => [
      _i,
      _v,
    ]),
  );
  for (const [, id] of idList) {
    if (toMonster(id) === mon) {
      return true;
    }
  }
  return false;
}

export function auto_monsterInLocket(mon: Monster): boolean {
  const captured: Map<Monster, boolean> = new Map(
    Object.entries(getLocketMonsters()).map(([_k, _v]) => [
      Monster.get(_k),
      _v,
    ]),
  );
  return captured.has(mon);
}

export function auto_fightLocketMonster(
  mon: Monster,
  speculative: boolean,
): boolean {
  if (auto_CombatLoversLocketCharges() < 1) {
    return false;
  }

  if (!auto_monsterInLocket(mon)) {
    return false;
  }

  if (auto_haveReminiscedMonster(mon)) {
    return false;
  }

  if (speculative) {
    return true;
  }

  auto_log_info(`Using locket to summon ${mon.name}`, "blue");
  const pages: Map<number, string> = new Map();
  pages.set(0, "inventory.php?reminisce=1");
  pages.set(1, `choice.php?whichchoice=1463&pwd&option=1&mid=${mon.id}`);
  if (autoAdvBypass(1, pages, $location`Noob Cave`)) {
    handleTracker$1(
      mon.toString(),
      $item`combat lover's locket`.toString(),
      "auto_copies",
    );
  }

  if (!auto_haveReminiscedMonster(mon)) {
    auto_log_error(
      `Attempted to fight ${mon.name} by reminiscing with Combat Lover's Locket, but failed.`,
    );
    return false;
  }

  return true;
}

export function auto_haveGreyGoose(): boolean {
  if (auto_have_familiar($familiar`Grey Goose`)) {
    return true;
  }
  return false;
}

export function gooseExpectedDrones(): number {
  if (!auto_haveGreyGoose()) {
    return 0;
  }
  const gooseWeight: number = familiarWeight($familiar`Grey Goose`);
  if (gooseWeight < 5) {
    return 0;
  }
  return gooseWeight - 5;
}

export function dronesOut(): boolean {
  //want a function to override the task order if we have drones out so as not to waste them
  if (!auto_haveGreyGoose()) {
    return false;
  }
  if (toInt(getProperty("gooseDronesRemaining")) > 0) {
    return true;
  }
  return false;
}

export function prioritizeGoose(): void {
  //prioritize Goose only if we still have things to get
  if (!auto_haveGreyGoose()) {
    return;
  }
  if (
    (internalQuestStatus("questL04Bat") <= 1 && gooseExpectedDrones() < 1) ||
    (itemAmount($item`stone wool`) === 0 &&
      haveEffect($effect`Stone-Faced`) === 0 &&
      internalQuestStatus("questL11Worship") <= 2 &&
      gooseExpectedDrones() < 1) ||
    (internalQuestStatus("questL08Trapper") <= 1 &&
      gooseExpectedDrones() < 1) ||
    (internalQuestStatus("questL09Topping") >= 2 &&
      internalQuestStatus("questL09Topping") <= 3 &&
      toInt(getProperty("twinPeakProgress")) < 15 &&
      gooseExpectedDrones() < 2) ||
    (needStarKey() &&
      itemAmount($item`star`) < 7 &&
      itemAmount($item`line`) < 6 &&
      gooseExpectedDrones() < 4) ||
    (internalQuestStatus("questL11Ron") < 5 && gooseExpectedDrones() < 2) ||
    (toInt(getProperty("hiddenBowlingAlleyProgress")) +
      itemAmount($item`bowling ball`) <
      5 &&
      gooseExpectedDrones() < 2) ||
    (itemAmount($item`crumbling wooden wheel`) +
      itemAmount($item`tomb ratchet`) <
      9 &&
      itemAmount($item`tangle of rat tails`) > 0 &&
      gooseExpectedDrones() < 3)
  ) {
    setProperty("auto_prioritizeGoose", true.toString());
    return;
  }
  setProperty("auto_prioritizeGoose", false.toString());
}

export function auto_haveMaydayContract(): boolean {
  if (
    toBoolean(getProperty("hasMaydayContract")) &&
    auto_is_valid($item`gaffer's tape`)
  ) {
    // use a potion to check mayday is allowed as auto_is_valid can return false for equipment & consumables in certain paths
    return true;
  }
  return false;
}

export function auto_canUseJuneCleaver(): boolean {
  if (
    possessEquipment($item`June cleaver`) &&
    canEquip($item`June cleaver`) &&
    auto_is_valid($item`June cleaver`)
  ) {
    return true;
  }
  return false;
}

export function auto_juneCleaverAdventure(): boolean {
  if (
    !auto_canUseJuneCleaver() ||
    toInt(getProperty("_juneCleaverFightsLeft")) > 0
  ) {
    return false;
  }

  if (autoEquip($slot`weapon`, $item`June cleaver`)) {
    let cleaverLoc: Location = $location`The Dire Warren`;
    if (in_koe()) {
      cleaverLoc = $location`Cobb's Knob Treasury`; // arbitrarily picked always accessible location
    }
    return autoAdv(cleaverLoc);
  }
  return false;
}

export function juneCleaverChoiceHandler(choice: number): void {
  switch (choice) {
    case 1467: // Poetic Justice
      if (
        haveSkill($skill`Tongue of the Walrus`) ||
        itemAmount($item`personal massager`) > 0
      ) {
        runChoice(3); // +5 adventures, get beaten up
      } else if (
        (myPrimestat() === $stat`Mysticality` &&
          (myLevel() < 13 || disregardInstantKarma())) ||
        (myPrimestat() === $stat`Moxie` &&
          myLevel() > 12 &&
          disregardInstantKarma() === false)
      ) {
        runChoice(2); // 137 myst substat
      } else {
        runChoice(1); // 250 moxie substat
      }
      break;
    case 1468: // Aunts not Ants
      if (
        (myPrimestat() === $stat`Moxie` &&
          (myLevel() < 13 || disregardInstantKarma())) ||
        (myPrimestat() === $stat`Muscle` &&
          myLevel() > 12 &&
          disregardInstantKarma() === false)
      ) {
        runChoice(1); // 150 moxie substat
      } else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
        runChoice(4); // skip
      } else {
        runChoice(2); // 250 muscle substat
      }
      break;
    case 1469: // Beware of Alligators
      if (myMeat() < meatReserve()) {
        runChoice(3); // 1500 meat
      } else if (
        auto_canDrink($item`Dad's brandy`) &&
        myInebriety() < inebrietyLimit()
      ) {
        runChoice(2); // size 1 awesome booze
      } else {
        runChoice(3); // 1500 meat
      }
      break;
    case 1470: // Teacher's Pet
      if (
        canEquip($item`teacher's pen`) &&
        availableAmount($item`teacher's pen`) < 1
      ) {
        runChoice(2); // accessory, +2 fam exp, +3 stats per fight
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(3);
      } else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
        runChoice(4); // skip
      } else {
        runChoice(2); // accessory, +2 fam exp, +3 stats per fight
      }
      break;
    case 1471: // Lost and Found
      if (
        getProperty("sidequestNunsCompleted") === "none" &&
        getProperty("auto_skipNuns") === "false" &&
        itemAmount($item`savings bond`) === 0
      ) {
        runChoice(1); // potion, 30 turns of 50% meat
      } else if (
        myPrimestat() === $stat`Mysticality` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(3); // 250 myst substat
      } else {
        runChoice(1); // potion, 30 turns of 50% meat
      }
      break;
    case 1472: // Summer Days
      runChoice(1); // potion, -5 combat rate, 30 turns

      break;
    case 1473: // Bath Time
      if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(1); // 250 muscle substat
      } else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
        runChoice(4); // skip
      } else {
        runChoice(3); // effect, 30 turns of +3 hot res, +50% init
      }
      break;
    case 1474: // Delicious Sprouts
      if (
        canEat() &&
        myLevel() < 13 &&
        have_fireworks_shop() &&
        auto_is_valid($item`red rocket`) &&
        !in_darkGyffte() &&
        !is_jarlsberg() &&
        !in_tcrs() &&
        auto_is_valid(
          //paths that can eat but can't eat guilty sprouts/won't get the stats from it anyway
          $item`guilty sprout`,
        ) &&
        itemAmount($item`guilty sprout`) === 0
      ) {
        // guilty sprout is level 8+ good size 1 food but it gives big stats, would want to use a red rocket
        runChoice(2);
      }
      if (
        myPrimestat() === $stat`Mysticality` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(1); // 250 myst substat
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(3); // 138 muscle substat
      } else {
        runChoice(2); // guilty sprout is level 8+ good size 1 food but it gives big stats
      }
      break;
    case 1475: // Hypnotic Master
      if (availableAmount($item`mother's necklace`) < 1) {
        runChoice(1); // 3 RO adventures, 5 free rests (doesn't even need to be equipped), never fumble
      } else if (
        myPrimestat() === $stat`Muscle` &&
        (myLevel() < 13 || disregardInstantKarma())
      ) {
        runChoice(2); // 250 muscle substat
      } else {
        runChoice(1); // autosells for 1000 meat
      }
      break;
    default:
      abort("unhandled choice in juneCleaverChoiceHandler");
  }
}

export function canUseSweatpants(): boolean {
  if (
    possessEquipment($item`designer sweatpants`) &&
    canEquip($item`designer sweatpants`) &&
    auto_is_valid($item`designer sweatpants`)
  ) {
    return true;
  }
  return false;
}

export function getSweat(): number {
  return toInt(getProperty("sweat"));
}

export function sweatpantsPreAdventure(): void {
  if (!canUseSweatpants()) {
    return;
  }
  if (in_small()) {
    return; // small can't clean organs
  }

  if (
    myLocation() === $location`A Mob of Zeppelin Protesters` &&
    equippedItem($slot`pants`) !== $item`lynyrdskin breeches`
  ) {
    return; //want to keep all the sleaze damage bonus in this location
  }

  const sweat: number = getSweat();
  const liverCleaned: number = toInt(getProperty("_sweatOutSomeBoozeUsed"));

  if (sweat >= 25 && liverCleaned < 3 && myInebriety() > 0) {
    if (
      myLocation() === $location`The Haunted Billiards Room` &&
      myInebriety() <= 10
    ) {
      //want to keep inebriety for pool skill
    } else {
      useSkill($skill`Sweat Out Some Booze`);
    }
  }

  if (sweat >= 95) {
    if (
      toBoolean(getProperty("auto_pvpEnable")) &&
      spleen_left() >= 4 * (1 + itemAmount($item`sweat-ade`))
    ) {
      // Our player participates in PVP, let's give them a low-effort spleen item to end the day with, if there's still room.
      useSkill($skill`Make Sweat-Ade`);
    } else if (myMp() < myMaxmp()) {
      // This is just opportunistic use of sweat. This skill should be used in auto_restore.ash.
      useSkill($skill`Sip Some Sweat`);
    }
  }
}

export function auto_hasStillSuit(): boolean {
  return (
    possessEquipment($item`tiny stillsuit`) &&
    auto_is_valid($item`tiny stillsuit`)
  );
}

export function auto_expectedStillsuitAdvs(): number {
  if (!auto_hasStillSuit()) {
    return 0;
  }
  const sweat: number = toInt(getProperty("familiarSweat"));
  // can't consume until at least 10 sweat has been accumulated
  if (sweat < 10) {
    return 0;
  }

  return round(sweat ** 0.4);
}

export function utilizeStillsuit(): void {
  //called at the end of pre adv to make sure stillsuit is at least kept equipped on a familiar in the terrarium
  if (!auto_hasStillSuit()) {
    return;
  }
  //if there is a tiny stillsuit in inventory then unless there was a tracking error it is not worn by any familiar
  if (!pathAllowsChangingFamiliar()) {
    return;
  }
  //make sure all this nice familiar sweat doesn't go uncollected when current familiar is wearing something else
  if (familiarEquippedEquipment(myFamiliar()) === $item`tiny stillsuit`) {
    return;
  }

  function sweetestSweatFamiliar(): Familiar {
    const currentFamiliar: Familiar = myFamiliar();
    //todo better choice of best familiar effects
    for (const sweetSweatFamiliar of $familiars`Grinning Turtle, Grouper Groupie, Star Starfish, Cat Burglar, Slimeling, Sleazy Gravy Fairy`) {
      //these give item and sleaze
      if (
        haveFamiliar(sweetSweatFamiliar) &&
        auto_is_valid$1(sweetSweatFamiliar) &&
        sweetSweatFamiliar !== currentFamiliar
      ) {
        return sweetSweatFamiliar;
      }
    }
    for (const commonFamiliar of $familiars`Baby Gravy Fairy, Smiling Rat, Mosquito, Reassembled Blackbird`) {
      //default fall back, you probably have one of these
      if (
        haveFamiliar(commonFamiliar) &&
        auto_is_valid$1(commonFamiliar) &&
        commonFamiliar !== currentFamiliar
      ) {
        return commonFamiliar;
      }
    }
    for (const anyFamiliar of $familiars.all()) {
      //if all else failed just pick any available familiar that can wear equipment
      if (
        haveFamiliar(anyFamiliar) &&
        auto_is_valid$1(anyFamiliar) &&
        anyFamiliar !== currentFamiliar &&
        !$familiars`Comma Chameleon, Mad Hatrack, Fancypants Scarecrow, Disembodied Hand, Ghost of Crimbo Carols, Ghost of Crimbo Cheer, Ghost of Crimbo Commerce`.includes(
          anyFamiliar,
        )
      ) {
        return anyFamiliar;
      }
    }
    return Familiar.none;
  }
  const chosenStillsuitFamiliar: Familiar = sweetestSweatFamiliar();
  if (
    familiarEquippedEquipment(chosenStillsuitFamiliar) !== $item`tiny stillsuit`
  ) {
    if (itemAmount($item`tiny stillsuit`) === 0) {
      retrieveItem($item`tiny stillsuit`);
    }
    if (itemAmount($item`tiny stillsuit`) > 0) {
      equip(chosenStillsuitFamiliar, $item`tiny stillsuit`);
    } else {
      auto_log_warning$1(
        "Failed to recover tiny stillsuit from the familiar mafia thinks is wearing it",
      );
    }
    if (is100FamRun()) {
      handleFamiliar$1(toFamiliar(getProperty("auto_100familiar"))); //just make extra sure this didnt break 100 familiar runs but familiar should not have been swapped
    }
  }
}

export function auto_hasParka(): boolean {
  const parka: Item = wrap_item($item`Jurassic Parka`);
  return possessEquipment(parka) && auto_is_valid(parka);
}

export function auto_configureParka(tag: string): boolean {
  if (!auto_hasParka() || !hasTorso()) {
    return false;
  }
  // store the requested setting in a property so we can handle them later
  setProperty("auto_parkaSetting", tag);
  // cut down potential server hits by telling the maximizer to not consider it.
  addToMaximize(`-equip ${wrap_item($item`Jurassic Parka`).toString()}`);
  return true;
}

export function auto_handleParka(): boolean {
  if (!auto_hasParka() || !hasTorso()) {
    return false;
  }
  const dino: string = getProperty("auto_parkaSetting");
  let tempDino: string = dino;
  if (dino === "") {
    if (getProperty("parkaMode") === "") {
      // if currently configured for stats and have been getting beaten up, change to stun
      tempDino = "kachungasaur";
    } else {
      return false;
    }
  }
  if (
    !containsText(
      "kachungasaur | cold | hp | meat | dilophosaur | stench | acid | ghostasaurus | spooky | mp | dr | spikolodon | sleaze | ml | spikes | pterodactyl | hot | init | nc",
      dino,
    )
  ) {
    return false;
  }
  if (dino === "cold" || dino === "meat" || dino === "hp") {
    tempDino = "kachungasaur";
  } else if (dino === "stench" || dino === "acid") {
    tempDino = "dilophosaur";
  } else if (dino === "spooky" || dino === "mp" || dino === "dr") {
    tempDino = "ghostsaurus";
  } else if (dino === "sleaze" || dino === "ml" || dino === "spikes") {
    tempDino = "spikolodon";
  } else if (dino === "hot" || dino === "init" || dino === "nc") {
    tempDino = "pterodactyl";
  }
  // avoid uselessly reconfiguring the parka
  if (getProperty("parkaMode") !== tempDino) {
    cliExecute(`parka ${tempDino}`);
  }
  const parka: Item = wrap_item($item`Jurassic Parka`);
  equip(parka); // already configured, just equip

  return getProperty("parkaMode") === tempDino && haveEquipped(parka);
}

export function auto_ParkaSpikeForcesLeft(): number {
  if (!auto_hasParka()) {
    return 0;
  }
  const spike_uses: number = toInt(getProperty("_spikolodonSpikeUses"));
  return 5 - spike_uses;
}

export function auto_hasAutumnaton(): boolean {
  return (
    toBoolean(getProperty("hasAutumnaton")) &&
    auto_is_valid($item`autumn-aton`) &&
    !in_pokefam()
  );
}
// only valid when autumnaton is not currently out on a quest
export function auto_autumnatonCanAdv(canAdventureInloc: Location): boolean {
  if (!auto_hasAutumnaton()) {
    return false;
  }

  if (
    canAdventureInloc === $location`8-Bit Realm` &&
    possessEquipment($item`continuum transfunctioner`) &&
    auto_is_valid($item`continuum transfunctioner`)
  ) {
    equip($item`continuum transfunctioner`);
  }

  for (const [, loc] of getAutumnatonLocations().entries()) {
    if (loc === canAdventureInloc) {
      return true;
    }
  }
  return false;
}

function auto_autumnatonReadyToQuest(): boolean {
  if (!auto_hasAutumnaton()) {
    return false;
  }

  return itemAmount($item`autumn-aton`) !== 0;
}

export function auto_autumnatonQuestingIn(): Location {
  return toLocation(getProperty("autumnatonQuestLocation"));
}

function auto_autumnatonCheckForUpgrade(upgrade: string): boolean {
  const currentUpgrades: string = getProperty("autumnatonUpgrades");
  if (containsText(currentUpgrades, upgrade)) {
    return true;
  }
  return false;
}

function auto_sendAutumnaton(loc: Location): boolean {
  if (auto_autumnatonCanAdv(loc)) {
    cliExecute(`autumnaton send ${loc}`);
    handleTracker(`Autumnaton sent to ${loc}`, "auto_otherstuff");
    return true;
  }
  return false;
}

export function auto_autumnatonQuest(): boolean {
  if (!auto_autumnatonReadyToQuest()) {
    return false;
  }
  // complete any pending upgrades if haven't checked since last return
  // both of these props reset to 0 at start of day or new life due to "_" at start of them
  const completedQuestsToday: number = toInt(getProperty("_autumnatonQuests"));
  const lastQuestUpgradesChecked: number = toInt(
    getProperty("_auto_lastAutumnatonUpgrade"),
  );
  if (completedQuestsToday > lastQuestUpgradesChecked) {
    try {
      cliExecute("autumnaton upgrade");
    } catch {}
    setProperty("_auto_lastAutumnatonUpgrade", completedQuestsToday.toString());
  }
  // prioritize getting important upgrades
  if (!auto_autumnatonCheckForUpgrade("leftarm1")) {
    if (auto_sendAutumnaton($location`The Haunted Pantry`)) {
      return false;
    } else {
      abort(
        "Haunted pantry should always be available for autumnaton, but autoscend determined it is not. Report issue.",
      );
    }
  }

  if (!auto_autumnatonCheckForUpgrade("leftleg1")) {
    // some bat zones may not be adventured in, so try them all
    if (auto_sendAutumnaton($location`Guano Junction`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Batrat and Ratbat Burrow`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Beanbat Chamber`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`Cobb's Knob Harem`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`Noob Cave`)) {
      return false;
    }
  }

  if (!auto_autumnatonCheckForUpgrade("rightleg1")) {
    if (auto_sendAutumnaton($location`The Haunted Library`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Neverending Party`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Haunted Kitchen`)) {
      return false;
    }
  }

  if (!auto_autumnatonCheckForUpgrade("rightarm1")) {
    if (auto_sendAutumnaton($location`The Overgrown Lot`)) {
      return false;
    }
  }
  // should we go regardless of if we have arm upgrades?
  if (
    auto_autumnatonCheckForUpgrade("leftarm1") &&
    auto_autumnatonCheckForUpgrade("rightarm1") &&
    itemAmount($item`barrel of gunpowder`) < 5 &&
    getProperty("sidequestLighthouseCompleted") === "none" &&
    !in_koe()
  ) {
    const targetLocation: Location = $location`Sonofa Beach`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      return autoAdv(targetLocation);
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }
  // acquire items to help quests
  if (fastenerCount() < 30 && lumberCount() < 30) {
    const targetLocation: Location = $location`The Smut Orc Logging Camp`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      return autoAdv(targetLocation);
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }

  if (hedgeTrimmersNeeded() > 0) {
    const targetLocation: Location = $location`Twin Peak`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      // twin peak requires NC setup, call function instead of directly adventuring there
      return L9_twinPeak();
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }
  // acquire more shadow bricks
  if (auto_neededShadowBricks() > 0) {
    const ingress: string = getProperty("shadowRiftIngress");
    if (["cemetery", "hiddencity", "pyramid"].includes(ingress)) {
      if (auto_sendAutumnaton($location`Shadow Rift`)) {
        return false;
      }
    }
  }
  // a location of last resort for those without shadow rifts
  if (getProperty("shadowRiftIngress") === "") {
    //Cookbookbat materials if you have a Cookbookbat and Autumn Fest Ale+stone wool or Autumn Leaves
    if (
      itemAmount($item`stone wool`) === 0 &&
      toInt(getProperty("lastTempleAdventures")) < myAscensions()
    ) {
      if (auto_sendAutumnaton($location`The Hidden Temple`)) {
        return false;
      }
    } else {
      if (auto_sendAutumnaton($location`The Outskirts of Cobb's Knob`)) {
        return false;
      }
    }
  }

  return false;
}

export function auto_hasSpeakEasy(): boolean {
  return (
    auto_is_valid($item`deed to Oliver's Place`) &&
    toBoolean(getProperty("ownsSpeakeasy"))
  );
}

export function auto_remainingSpeakeasyFreeFights(): number {
  if (!auto_hasSpeakEasy()) {
    return 0;
  }
  return max(3 - toInt(getProperty("_speakeasyFreeFights")), 0);
}

export function speakeasyCombat(): boolean {
  if (!auto_hasSpeakEasy()) {
    return false;
  }

  if (auto_remainingSpeakeasyFreeFights() > 0) {
    return autoAdv($location`An Unusually Quiet Barroom Brawl`);
  }
  return false;
}

export function auto_haveTrainSet(): boolean {
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

export function auto_checkTrainSet(): void {
  const lastTrainsetConfiguration: number = toInt(
    getProperty("lastTrainsetConfiguration"),
  );
  const trainsetPosition: number = toInt(getProperty("trainsetPosition"));
  const trainsetConfiguration: string = getProperty("trainsetConfiguration");
  if (!auto_haveTrainSet()) {
    return;
  }
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
  } else if (fastenerCount() < 30 || lumberCount() < 30) {
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
    (monsterLevelAdjustment() > toInt(getProperty("auto_MLSafetyLimit")) &&
      getProperty("auto_MLSafetyLimit") !== "") ||
    toInt(getProperty("auto_MLSafetyLimit")) === -1 ||
    in_plumber()
  ) {
    eight = 9; //cold res, stench dmg
  }
  const turnsSinceTSConfigured: number = min(
    trainsetPosition - lastTrainsetConfiguration,
    40,
  );
  const expectedConfig: string = `${stationInts.get(one) ?? stationInts.set(one, "").get(one)},${stationInts.get(two) ?? stationInts.set(two, "").get(two)},${stationInts.get(three) ?? stationInts.set(three, "").get(three)},${stationInts.get(four) ?? stationInts.set(four, "").get(four)},${stationInts.get(five) ?? stationInts.set(five, "").get(five)},${stationInts.get(six) ?? stationInts.set(six, "").get(six)},${stationInts.get(seven) ?? stationInts.set(seven, "").get(seven)},${stationInts.get(eight) ?? stationInts.set(eight, "").get(eight)}`;

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
