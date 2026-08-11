import {
  abort,
  bjornifyFamiliar,
  cliExecute,
  containsText,
  create,
  equippedItem,
  Familiar,
  getCampground,
  getCounters,
  getProperty,
  handlingChoice,
  haveEffect,
  haveFamiliar,
  inHardcore,
  isUnrestricted,
  itemAmount,
  lastChoice,
  Monster,
  myAdventures,
  myBjornedFamiliar,
  myDaycount,
  myFamiliar,
  myHash,
  myLevel,
  myPath,
  Phylum,
  print,
  splitString,
  storageAmount,
  toInt,
  toMonster,
  userConfirm,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $paths,
  $phylum,
  $slot,
  DNALab,
  get,
  set,
} from "libram";

import { canPull, pullXWhenHaveY } from "../../auto_acquire";
import { autoAdv } from "../../auto_adventure";
import { main as handleChoiceAdv } from "../../auto_choice_adv";
import { fullness_left, inebriety_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar$1,
} from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_can_equip,
  auto_is_valid,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  internalQuestStatus,
} from "../../auto_util";
import {
  QuestTask,
  registerQuestTask,
  runQuestTask,
} from "../../engine/engine";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { in_robot } from "../../paths/2021/you_robot";
import { bridgeGoal } from "../../quests/level_09";
import { ns_crowd3 } from "../../quests/level_13";
import { elementalPlanes_access } from "../other/elementalPlanes";

//	This is meant for items that have a date of 2014.
//	Handling: Bjorn, Little Geneticist DNA-Splicing Lab, Xi-Receiver Unit
//

//Defined in autoscend/iotms/mr2014.ash
export function handleBjornify(fam: Familiar): boolean {
  if (inHardcore()) {
    return false;
  }

  if (equippedItem($slot`back`) !== $item`Buddy Bjorn`) {
    return false;
  }

  if (myBjornedFamiliar() === fam) {
    return true;
  }

  if (!canChangeFamiliar() && fam === myFamiliar()) {
    return false;
  }

  if (haveFamiliar(fam)) {
    bjornifyFamiliar(fam);
  } else {
    if (haveFamiliar($familiar`El Vibrato Megadrone`)) {
      bjornifyFamiliar($familiar`El Vibrato Megadrone`);
    } else {
      if (
        myFamiliar() !== $familiar`Grimstone Golem` &&
        haveFamiliar($familiar`Grimstone Golem`)
      ) {
        bjornifyFamiliar($familiar`Grimstone Golem`);
      } else if (haveFamiliar($familiar`Adorable Seal Larva`)) {
        bjornifyFamiliar($familiar`Adorable Seal Larva`);
      } else {
        return false;
      }
    }
  }
  return true;
}

export function considerGrimstoneGolem(bjornCrown: boolean): boolean {
  if (!haveFamiliar($familiar`Grimstone Golem`)) {
    return false;
  }
  if (!auto_is_valid($item`grimstone mask`)) {
    return false;
  }

  if (bjornCrown && get("_grimstoneMaskDropsCrown") !== 0) {
    return false;
  }

  if (
    get("desertExploration") >= 70 &&
    get("chasmBridgeProgress") >= bridgeGoal() - 1
  ) {
    return false;
  }

  if (get("chasmBridgeProgress") >= bridgeGoal() - 1) {
    if (!get("auto_grimstoneOrnateDowsingRod", false)) {
      return false;
    }
    if (!auto_is_valid($item`grimstone mask`)) {
      return false;
    }
    if (possessEquipment($item`ornate dowsing rod`)) {
      return false;
    }
  }

  if (get("desertExploration") >= 70) {
    if (!get("auto_grimstoneFancyOilPainting", false)) {
      return false;
    }
  }

  return true;
}

export function dna_startAcquire(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (getProperty("auto_day1_dna") === "finished" || myDaycount() !== 1) {
    return false;
  }
  if (haveEffect($effect`Human-Weird Thing Hybrid`) > 9999) {
    return false;
  }
  if (itemAmount($item`DNA extraction syringe`) === 0) {
    return false;
  }

  if (getProperty("dnaSyringe") === $phylum`weird`.toString()) {
    cliExecute("camp dnainject");
  } else {
    if (!canChangeToFamiliar($familiar`Machine Elf`)) {
      const bjorn: Familiar = myBjornedFamiliar();
      if (bjorn === $familiar`Machine Elf`) {
        handleBjornify($familiar`Grinning Turtle`);
      }
      handleFamiliar$1($familiar`Machine Elf`);
      autoAdv($location`The Deep Machine Tunnels`);
      if (bjorn === $familiar`Machine Elf`) {
        handleBjornify(bjorn);
      }
      cliExecute("camp dnainject");
    } else if (elementalPlanes_access($element`sleaze`)) {
      if ($location`Sloppy Seconds Diner`.turnsSpent === 0) {
        autoAdv($location`Sloppy Seconds Diner`);
      }
      autoAdv($location`Sloppy Seconds Diner`);
      cliExecute("camp dnainject");
    }
  }
  set("auto_day1_dna", "finished");
  if (haveEffect($effect`Human-Weird Thing Hybrid`) !== 2147483647) {
    auto_log_warning(
      "DNA Hybridization failed, perhaps it was due to ML which is annoying us right now.",
      "red",
    );
  }
  return true;
}

export function dna_generic(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (getProperty("dnaSyringe") === $phylum.none.toString()) {
    return false;
  }

  let potion: Phylum[];

  if (in_heavyrains()) {
    switch (myDaycount()) {
      case 1:
        potion = [$phylum`construct`, $phylum`fish`];
        break;
      case 2:
        potion = [$phylum`fish`, $phylum`constellation`, $phylum`dude`];
        break;
      case 3:
        potion = [$phylum`construct`, $phylum`humanoid`, $phylum`dude`];
        break;
      default:
        potion = [$phylum`humanoid`, $phylum`construct`, $phylum`dude`];
        break;
    }
  } else {
    switch (myDaycount()) {
      case 1:
        potion = [$phylum`construct`, $phylum`fish`];
        break;
      case 2:
        potion = [$phylum`fish`, $phylum`constellation`, $phylum`dude`];
        break;
      case 3:
        potion = [$phylum`construct`, $phylum`humanoid`, $phylum`dude`];
        break;
      default:
        potion = [$phylum`humanoid`, $phylum`construct`, $phylum`dude`];
        break;
    }
  }

  let i: number = 0;
  for (const phy of potion) {
    if (
      getProperty("dnaSyringe") === phy.toString() &&
      get("_dnaPotionsMade") === i
    ) {
      cliExecute("camp dnapotion");
    }
    i = i + 1;
  }

  return false;
}

export function dna_sorceressTest(): boolean {
  // FIXME: Can we do this earlier? This isn't even all that useful, to be fair.
  // When is the last time we encounter each of these types?
  if (!DNALab.installed()) {
    return false;
  }
  if (getProperty("dnaSyringe") === $phylum.none.toString()) {
    return false;
  }
  if (myLevel() < 13) {
    return false;
  }
  if (get("_dnaPotionsMade") >= 3) {
    return false;
  }
  if (toInt(getProperty("choiceAdventure1003")) < 3) {
    return false;
  }
  if (getProperty("nsChallenge2") === "" && get("telescopeUpgrades") >= 2) {
    ns_crowd3();
  }

  if (
    getProperty("dnaSyringe") === $phylum`plant`.toString() &&
    getProperty("nsChallenge2") === $element`cold`.toString() &&
    itemAmount($item`Gene Tonic: Plant`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    getProperty("dnaSyringe") === $phylum`demon`.toString() &&
    getProperty("nsChallenge2") === $element`hot`.toString() &&
    itemAmount($item`Gene Tonic: Demon`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    getProperty("dnaSyringe") === $phylum`slime`.toString() &&
    getProperty("nsChallenge2") === $element`sleaze`.toString() &&
    itemAmount($item`Gene Tonic: Slime`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    getProperty("dnaSyringe") === $phylum`undead`.toString() &&
    getProperty("nsChallenge2") === $element`spooky`.toString() &&
    itemAmount($item`Gene Tonic: Undead`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    getProperty("dnaSyringe") === $phylum`hobo`.toString() &&
    getProperty("nsChallenge2") === $element`stench`.toString() &&
    itemAmount($item`Gene Tonic: Hobo`) === 0
  ) {
    cliExecute("camp dnainject");
  }

  return false;
}

export function dna_bedtime(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (getProperty("dnaSyringe") === $phylum.none.toString()) {
    return false;
  }
  if ($item`Little Geneticist DNA-Splicing Lab`.toString() in getCampground()) {
    let potionsMade: number = get("_dnaPotionsMade");
    while (potionsMade < 3) {
      cliExecute("camp dnapotion");
      potionsMade += 1;
    }
  }
  return false;
}

export function LX_ornateDowsingRod(
  doing_desert_now: boolean = false,
): boolean {
  if (!get("auto_grimstoneOrnateDowsingRod", false)) {
    return false;
  }
  if (
    get("desertExploration") >= 100 ||
    internalQuestStatus("questL11Desert") > 0
  ) {
    // don't need a dowsing rod if we've finished the desert.
    return false;
  }
  if (!auto_is_valid($item`grimstone mask`)) {
    return false;
  }
  if (!auto_can_equip($item`ornate dowsing rod`) && !in_robot()) {
    return false;
  }
  if (possessEquipment($item`ornate dowsing rod`)) {
    return false;
  }
  if (possessEquipment($item`UV-resistant compass`)) {
    return false; //already chose the other off-hand
  }
  if (inHardcore()) {
    //will we be able to pull at any point in the run. not just right now (we might be out of pulls today)
    if (!canChangeToFamiliar($familiar`Grimstone Golem`)) {
      //no golem, or not allowed in path
      set("auto_grimstoneOrnateDowsingRod", false);
      return false;
    }
  }
  //because it requires continuous adventures in the same day, then we want to do pre do this before we even get to the desert.
  //but we do not want to do it too early either. so we wait until we are at least day 2 and level 7 to get the dowsing rod.
  //unless we are doing desert now. in which case we ignore this limitation and do it now
  if (!doing_desert_now && (myLevel() < 8 || myDaycount() < 2)) {
    return false;
  }

  if (
    itemAmount($item`grimstone mask`) === 0 &&
    !canChangeToFamiliar($familiar`Grimstone Golem`) &&
    canPull($item`grimstone mask`)
  ) {
    if (
      canPull($item`Shore Inc. Ship Trip Scrip`) &&
      storageAmount($item`Shore Inc. Ship Trip Scrip`) > 2
    ) {
      //since drum machine and killing jar get pulled it's not useful to explore faster than compass just to need more fights gathering pages anyway
      //not worth spending the 5 adv to acquire rod in addition to the pull if Trip Scrip aren't in short supply
      return false;
    }
    // if(canChangeToFamiliar($familiar[Melodramedary]))
    // {
    // 	//with Melodramedary, drum machine, killing jar and no Scrip pull, pulling the mask saves 2 turns compared to vacationing for Scrip? is that good enough?
    // }
    pullXWhenHaveY($item`grimstone mask`, 1, 0); //pull the mask if you do not have it and cannot use the golem
  }
  if (itemAmount($item`grimstone mask`) === 0) {
    return false;
  }

  if (myAdventures() <= 6) {
    auto_log_info(
      `I need at least 6 adv to get [Ornate Dowsing Rod] and I only have ${myAdventures()}`,
      "blue",
    );
    if (doing_desert_now) {
      if (fullness_left() + inebriety_left() > 0) {
        abort(
          "I am trying to do desert now so I cannot delay getting [Ornate Dowsing Rod]. I still have stomch and and liver left. Eat and drink until at least 6 adv and then run me again",
        );
      }
      if (isAboutToPowerlevel()) {
        auto_log_info(
          "I have nothing else to do except the desert. So I am ending the day early",
          "blue",
        );
        set("_auto_doneToday", true);
        return true; //want to restart the loop so it can properly exit it and do bedtime.
      }
    }
    return false;
  }

  auto_log_info("Acquiring a Dowsing Rod!", "blue");
  // use() aborts the whole script with "Unsupported choice adventure #829"
  // since this redirects straight into choice.php; visitUrl() bypasses that and
  // lets the real choice dispatcher handle it instead.
  const maskText = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`grimstone mask`.id}`,
  );
  if (handlingChoice()) {
    handleChoiceAdv(lastChoice(), maskText);
  }

  while (itemAmount($item`odd silver coin`) < 1) {
    autoAdv($location`The Prince's Balcony`);
  }
  while (itemAmount($item`odd silver coin`) < 2) {
    autoAdv($location`The Prince's Dance Floor`);
  }
  while (itemAmount($item`odd silver coin`) < 3) {
    autoAdv($location`The Prince's Lounge`);
  }
  while (itemAmount($item`odd silver coin`) < 4) {
    autoAdv($location`The Prince's Kitchen`);
  }
  while (itemAmount($item`odd silver coin`) < 5) {
    autoAdv($location`The Prince's Restroom`);
  }

  if (create(1, $item`ornate dowsing rod`)) {
    return true;
  }
  if (itemAmount($item`ornate dowsing rod`) === 0) {
    abort(
      "Failed to craft [Ornate Dowsing Rod]. craft it manually and run me again",
    );
  }
  return false;
}

registerQuestTask({
  name: "LX_ornateDowsingRod",
  completed: () =>
    !$paths`Legacy of Loathing, Quantum Terrarium`.includes(myPath()) ||
    !get("auto_grimstoneOrnateDowsingRod", false) ||
    !auto_is_valid($item`grimstone mask`) ||
    possessEquipment($item`ornate dowsing rod`) ||
    possessEquipment($item`UV-resistant compass`) ||
    get("desertExploration") >= 100 ||
    internalQuestStatus("questL11Desert") > 0,
  ready: () => true,
  do: () => LX_ornateDowsingRod(),
});

function fancyOilPaintingDo(): boolean {
  auto_log_info("Acquiring a Fancy Oil Painting!", "blue");
  // use() aborts the whole script with "Unsupported choice adventure #829"
  // since this redirects straight into choice.php; visitUrl() bypasses that and
  // lets the real choice dispatcher handle it instead.
  const maskText = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`grimstone mask`.id}`,
  );
  if (handlingChoice()) {
    handleChoiceAdv(lastChoice(), maskText);
  }

  while (itemAmount($item`odd silver coin`) < 1) {
    autoAdv($location`The Prince's Balcony`);
  }
  while (itemAmount($item`odd silver coin`) < 2) {
    autoAdv($location`The Prince's Dance Floor`);
  }
  while (itemAmount($item`odd silver coin`) < 3) {
    autoAdv($location`The Prince's Lounge`);
  }
  while (itemAmount($item`odd silver coin`) < 4) {
    autoAdv($location`The Prince's Kitchen`);
  }
  cliExecute("make fancy oil painting");
  set("auto_grimstoneFancyOilPainting", false);
  return true;
}

const fancyOilPaintingTask: QuestTask = registerQuestTask({
  name: "fancyOilPainting",
  completed: () =>
    !get("auto_grimstoneFancyOilPainting", false) ||
    !auto_is_valid($item`grimstone mask`) ||
    !auto_is_valid($item`fancy oil painting`) ||
    get("chasmBridgeProgress") >= bridgeGoal(),
  ready: () =>
    get("chasmBridgeProgress") < bridgeGoal() &&
    myAdventures() > 4 &&
    itemAmount($item`grimstone mask`) > 0 &&
    getCounters("", 0, 6) === "",
  do: fancyOilPaintingDo,
  locations: $locations`The Prince's Balcony, The Prince's Dance Floor, The Prince's Lounge, The Prince's Kitchen`,
});

export function fancyOilPainting(): boolean {
  return runQuestTask(fancyOilPaintingTask);
}

const $_f_importantMonsters: Monster[] = Monster.get([
  // L4:
  "beanbat",
  // L5:
  "Knob Goblin Harem Girl",
  // L7:
  "dirty old lihc",
  // L8:
  "dairy goat",
  // L9:
  "bearpig topiary animal",
  "elephant (meatcar?) topiary animal",
  "spider (duck?) topiary animal",
  // L10:
  "Quiet Healer",
  "Burly Sidekick",
  // L11:
  // Hidden City:
  "baa-relief sheep",
  "pygmy bowler",
  "pygmy shaman",
  "pygmy janitor",
  "pygmy witch accountant",
  "pygmy witch surgeon",
  // Spookyraven:
  "animated ornate nightstand",
  "elegant animated nightstand",
  "cabinet of Dr. Limpieza",
  "possessed wine rack",
  "monstrous boiler",
  "writing desk",
  "chalkdust wraith",
  "banshee librarian",
  // Palindome:
  "whitesnake",
  "white lion",
  // Zeppelin:
  "man with the red buttons",
  "red butler",
  "red skeleton",
  // Desert:
  "blur",
  "tomb rat",
  // L12:
  "batwinged gremlin (tool)",
  "erudite gremlin (tool)",
  "spider gremlin (tool)",
  "vegetable gremlin (tool)",
]);

function icehouseMonster(): Monster {
  visitUrl("museum.php?action=icehouse");
  if (!containsText(getProperty("banishedMonsters"), "ice house")) {
    return $monster.none;
  } else {
    const banishMap: Map<number, string> = new Map(
      splitString(getProperty("banishedMonsters"), ":").map((_v, _i) => [
        _i,
        _v,
      ]),
    );
    for (let i: number = 0; i < banishMap.size; i++) {
      if ((banishMap.get(i) ?? "") === "ice house") {
        return toMonster(banishMap.get(i - 1) ?? "");
      }
    }
  }
  return $monster.none;
}

export function icehouseUserErrorProtection(): boolean {
  if (icehouseMonster() === $monster.none) {
    return true;
  } else if ($_f_importantMonsters.includes(icehouseMonster())) {
    if (
      userConfirm(
        `You have a ${icehouseMonster().toString()} frozen in your icehouse. Autoscend thinks it might cause problems, do you want us to melt it? Will default to 'Yes' in 15 seconds.`,
        15000,
        true,
      )
    ) {
      visitUrl("museum.php?action=icehouse");
      auto_runChoice(1);
      return true;
    } else {
      print("If autoscend runs into problems, it's on you!");
      return false;
    }
  } else {
    return true;
  }
}
