import {
  ceil,
  getProperty,
  haveEffect,
  haveEquipped,
  Item,
  itemAmount,
  Monster,
  monsterElement,
  monsterHp,
  monsterLevelAdjustment,
  monsterPhylum,
  myAdventures,
  myClass,
  myFamiliar,
  myLocation,
  myMaxmp,
  myMp,
  setProperty,
  Skill,
  toBoolean,
  toInt,
  toPhylum,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $monsters,
  $skill,
} from "libram";

import { fullness_left } from "../auto_consume";
import { is100FamRun } from "../auto_familiar";
import {
  auto_have_skill,
  auto_log_warning,
  auto_wantToCopy,
  auto_wantToSniff,
  combatItemDamageMultiplier,
  handleTracker$1,
  internalQuestStatus,
  isGhost,
  MLDamageToMonsterMultiplier,
  stunnable,
} from "../auto_util";
import { auto_bowlingBallCombatString } from "../iotms/mr2022";
import { shouldCinchoConfetti } from "../iotms/mr2023";
import { ag_is_bodyguard } from "../paths/avant_guard";
import { inAftercore } from "../paths/casual";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_zombieSlayer } from "../paths/zombie_slayer";
import { auto_warSide } from "../quests/level_12";
import { towerKeyCount$1 } from "../quests/level_13";
import { numPirateInsults } from "../quests/optional";
import { auto_combatLicenseToAdventureStage4 } from "./auto_combat_license_to_adventure";
import { auto_combatTheSourceStage4 } from "./auto_combat_the_source";
import {
  canSurvive$1,
  canUse$2,
  canUse$4,
  combat_status_add,
  combat_status_check,
  getCopier$1,
  getSniffer$1,
  getStunner,
  haveUsed,
  haveUsed$1,
  isSniffed,
  markAsUsed$1,
  useItem$1,
  useItems$1,
  useSkill$2,
} from "./auto_combat_util";
import { auto_combatWereProfessorStage4 } from "./auto_combat_wereprofessor";
import { auto_combatZombieSlayerStage4 } from "./auto_combat_zombie_slayer";

//defined in /autoscend/combat/auto_combat_default_stage4.ash
export function auto_combatDefaultStage4(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
  let retval: string = "";
  //Unskip stage 3
  if (toBoolean(getProperty("auto_skipStage3"))) {
    setProperty("auto_skipStage3", false.toString());
  }
  // Path = The Source
  retval = auto_combatTheSourceStage4(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = license to adventure
  retval = auto_combatLicenseToAdventureStage4(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = The Source
  retval = auto_combatZombieSlayerStage4(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = WereProfessor
  retval = auto_combatWereProfessorStage4(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Skip if have drones out
  if (toBoolean(getProperty("auto_skipStage4"))) {
    return "";
  }
  //sniffers are skills that increase the odds of encountering this same monster again in the current zone.
  if (auto_wantToSniff(enemy, myLocation()) && !ag_is_bodyguard()) {
    const sniffer: Skill = getSniffer$1(enemy);
    if (sniffer !== Skill.none) {
      if (sniffer === $skill`Perceive Soul`) {
        //mafia does not track the target of this skill so we must do so.
        setProperty("auto_bat_soulmonster", enemy.toString());
      }
      handleTracker$1(enemy.toString(), sniffer.toString(), "auto_sniffs");
      combat_status_add("sniffed");
      return useSkill$2(sniffer);
    }
  }

  if (
    enemy === $monster`animated ornate nightstand` &&
    myFamiliar() === $familiar`Nosy Nose` &&
    !is100FamRun() &&
    canUse$2($skill`Get a Good Whiff of This Guy`) &&
    !isSniffed(enemy, $skill`Get a Good Whiff of This Guy`)
  ) {
    //this is a special case, if Nosy Nose is used in the bedroom in a non 100 fam run it is to whiff this monster
    //and use only this sniffer because the elegant monster must be found next and this one gets turned off easily by using a different familiar
    handleTracker$1(
      enemy.toString(),
      $skill`Get a Good Whiff of This Guy`.toString(),
      "auto_sniffs",
    );
    return useSkill$2($skill`Get a Good Whiff of This Guy`);
  }
  //TODO auto_doCombatCopy property is silly. get rid of it
  if (
    !haveUsed$1($item`Rain-Doh black box`) &&
    !in_heavyrains() &&
    toInt(getProperty("_raindohCopiesMade")) < 5 &&
    !ag_is_bodyguard()
  ) {
    if (
      enemy === $monster`modern zmobie` &&
      toInt(getProperty("auto_modernzmobiecount")) < 3
    ) {
      setProperty("auto_doCombatCopy", "yes");
    }
  }
  if (
    canUse$4($item`Rain-Doh black box`) &&
    getProperty("auto_doCombatCopy") === "yes" &&
    enemy !== $monster`gourmet gourami` &&
    !ag_is_bodyguard()
  ) {
    setProperty("auto_doCombatCopy", "no");
    markAsUsed$1($item`Rain-Doh black box`); // mark even if not used so we don't spam the error message
    if (toInt(getProperty("_raindohCopiesMade")) < 5) {
      handleTracker$1(
        enemy.toString(),
        $item`Rain-Doh black box`.toString(),
        "auto_copies",
      );
      return `item ${$item`Rain-Doh black box`}`;
    }
    auto_log_warning(
      "Can not issue copy directive because we have no copies left",
      "red",
    );
  }
  if (getProperty("auto_doCombatCopy") === "yes") {
    setProperty("auto_doCombatCopy", "no");
  }
  //get 1 additional [fat loot token] per day
  if (myLocation() === $location`The Daily Dungeon`) {
    // If we are in The Daily Dungeon, assume we get 1 token, so only if we need more than 1.
    if (
      towerKeyCount$1(false) < 2 &&
      !toBoolean(getProperty("_dailyDungeonMalwareUsed")) &&
      itemAmount($item`daily dungeon malware`) > 0
    ) {
      if (
        $monsters`apathetic lizardman, dairy ooze, dodecapede, giant giant moth, mayonnaise wasp, pencil golem, sabre-toothed lime, tonic water elemental, vampire clam`.includes(
          enemy,
        )
      ) {
        return `item ${$item`daily dungeon malware`}`;
      }
    }
  }
  //iotm monster copier that works by creating wandering copies of the targetted monster
  if (
    canUse$2($skill`Digitize`) &&
    toInt(getProperty("_sourceTerminalDigitizeUses")) === 0 &&
    !inAftercore()
  ) {
    if ($monsters`lobsterfrogman`.includes(enemy)) {
      if (getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString()) {
        handleTracker$1(
          enemy.toString(),
          $skill`Digitize`.toString(),
          "auto_copies",
        );
        return useSkill$2($skill`Digitize`);
      }
    }
  }
  if (
    canUse$2($skill`Digitize`) &&
    toInt(getProperty("_sourceTerminalDigitizeUses")) < 3 &&
    !inAftercore()
  ) {
    if (getProperty("auto_digitizeDirective") === enemy.toString()) {
      if (getProperty("_sourceTerminalDigitizeMonster") !== enemy.toString()) {
        handleTracker$1(
          enemy.toString(),
          $skill`Digitize`.toString(),
          "auto_copies",
        );
        return useSkill$2($skill`Digitize`);
      }
    }
  }
  //iotm monster duplicator that creates a chained fight of the current monster
  if (auto_wantToCopy(enemy, myLocation()) && !ag_is_bodyguard()) {
    const copier: Skill = getCopier$1(enemy);
    if (copier !== Skill.none && canUse$2(copier)) {
      if (copier === $skill`Blow the Purple Candle!`) {
        //mafia does not track the target of this skill so we must do so.
        setProperty("auto_purple_candled", enemy.toString());
      }
      handleTracker$1(enemy.toString(), copier.toString(), "auto_copies");
      combat_status_add("copied");
      return useSkill$2(copier);
    }
  }
  //accordion thief mechanic. unlike pickpocket it can be done at any round
  if (
    canUse$2($skill`Steal Accordion`) &&
    myClass() === $class`Accordion Thief` &&
    canSurvive$1(2.0)
  ) {
    return useSkill$2($skill`Steal Accordion`);
  }
  //in [The Deep Machine Tunnels] will stagger enemy and grants another abstraction
  if (
    canUse$4($item`abstraction: sensation`) &&
    enemy === $monster`Performer of Actions`
  ) {
    //	Change +100% Moxie to +100% Init
    return useItem$1($item`abstraction: sensation`);
  }
  if (
    canUse$4($item`abstraction: thought`) &&
    enemy === $monster`Perceiver of Sensations`
  ) {
    // Change +100% Myst to +100% Items
    return useItem$1($item`abstraction: thought`);
  }
  if (
    canUse$4($item`abstraction: action`) &&
    enemy === $monster`Thinker of Thoughts`
  ) {
    // Change +100% Muscle to +10 Familiar Weight
    return useItem$1($item`abstraction: action`);
  }
  //these loofah skills stagger and provide MP, meat, or XP
  if (monsterLevelAdjustment() <= 150) {
    if (canUse$2($skill`Loofah Leglifts`)) {
      return useSkill$2($skill`Loofah Leglifts`);
    }
    if (canUse$2($skill`Loofah Hosenzittern`)) {
      return useSkill$2($skill`Loofah Hosenzittern`);
    }
    if (canUse$2($skill`Loofah Head-Scratch`)) {
      return useSkill$2($skill`Loofah Head-Scratch`);
    }
  }
  //stocking mimic can produce meat until round 10.
  if (
    myFamiliar() === $familiar`Stocking Mimic` &&
    round_1 < 12 &&
    canSurvive$1(1.5)
  ) {
    if (itemAmount($item`seal tooth`) > 0) {
      return `item ${$item`seal tooth`}`;
    }
  }
  //winking is a monster copier familiar skill. they share a daily counter
  let wink_skill: Skill = Skill.none;
  if (canUse$2($skill`Wink at`)) {
    wink_skill = $skill`Wink at`;
  }
  if (canUse$2($skill`Fire a badly romantic arrow`)) {
    wink_skill = $skill`Fire a badly romantic arrow`;
  }
  if (wink_skill !== Skill.none) {
    //we can wink / romatic arrow
    if ($monsters`lobsterfrogman, modern zmobie`.includes(enemy)) {
      return useSkill$2(wink_skill);
    }
  }
  //insults are used as part of the pirates quest
  if (
    canUse$4($item`The Big Book of Pirate Insults`) &&
    numPirateInsults() < 8 &&
    internalQuestStatus("questM12Pirate") < 5
  ) {
    // this should only be applicable in Low-Key Summer (for now)
    if (
      $locations`Barrrney's Barrr, The Obligatory Pirate's Cove`.includes(
        myLocation(),
      )
    ) {
      return useItem$1($item`The Big Book of Pirate Insults`);
    }
  }
  //cocktail napkin can banish clingy pirates (only them and no other monster). this accelerates the pirates quest
  if (itemAmount($item`cocktail napkin`) > 0) {
    if (
      $monsters`clingy pirate (female), clingy pirate (male)`.includes(enemy)
    ) {
      return `item ${$item`cocktail napkin`}`;
    }
  }
  //this completes the quest Advertise for the Mysterious Island Arena which is a sidequest which accelerates the L12 frat-hippy war quest
  //kol tracks each band flyering separately. mafia tracks them in a singular property as it assumes the player will not flyer for the wrong band. make sure to only flyer for the side we want to flyer for
  let flyer: Item = $item`rock band flyers`;
  if (auto_warSide() === "hippy") {
    flyer = $item`jam band flyers`;
  }
  if (
    canUse$4(flyer) &&
    toInt(getProperty("flyeredML")) < 10000 &&
    myLocation() !== $location`The Battlefield (Frat Uniform)` &&
    myLocation() !== $location`The Battlefield (Hippy Uniform)` &&
    !toBoolean(getProperty("auto_ignoreFlyer"))
  ) {
    let shouldFlyer: boolean = false;
    let staggeringFlyer: boolean = false;
    let flyerWith: Item = Item.none;
    if (
      myClass() === $class`Disco Bandit` &&
      auto_have_skill($skill`Deft Hands`) &&
      !combat_status_check("(it")
    ) {
      //first item throw in the fight staggers
      staggeringFlyer = true;
    }
    if (auto_have_skill($skill`Ambidextrous Funkslinging`)) {
      if (canUse$4($item`Time-Spinner`)) {
        flyerWith = $item`Time-Spinner`;
        staggeringFlyer = true;
      } else if (canUse$4($item`beehive`)) {
        if (
          myClass() === $class`Sauceror` &&
          haveUsed($skill`Curse of Weaksauce`)
        ) {
          //don't miss MP by killing weak monsters with beehive
          const beehiveDamage: number = ceil(
            30 * combatItemDamageMultiplier() * MLDamageToMonsterMultiplier(),
          );
          if (monsterHp() > beehiveDamage) {
            flyerWith = $item`beehive`;
            staggeringFlyer = true;
          }
        } else {
          flyerWith = $item`beehive`;
          staggeringFlyer = true;
        }
      }
    }
    if (
      staggeringFlyer &&
      (!stunnable(enemy) || monsterLevelAdjustment() > 150)
    ) {
      staggeringFlyer = false;
    }
    let stunned: boolean = false;
    if (!staggeringFlyer && stunnable(enemy)) {
      const stunner: Skill = getStunner(enemy);
      stunned = combat_status_check("stunned");
      if (stunner !== Skill.none && !stunned) {
        combat_status_add("stunned");
        return useSkill$2(stunner);
      }
    }
    if (canSurvive$1(3.0) || stunned || staggeringFlyer) {
      shouldFlyer = true;
    }
    if (shouldFlyer) {
      if (flyerWith !== Item.none) {
        return useItems$1(flyer, flyerWith);
      } else {
        return useItem$1(flyer);
      }
    }
  }
  //chaos butterfly if thrown in combat once per ascension will accelerate the dooks farm sidequest for the frat-hippy war.
  if (
    canUse$4($item`chaos butterfly`) &&
    !toBoolean(getProperty("chaosButterflyThrown")) &&
    !toBoolean(getProperty("auto_skipL12Farm"))
  ) {
    if (
      canUse$4($item`Time-Spinner`) &&
      auto_have_skill($skill`Ambidextrous Funkslinging`)
    ) {
      return useItems$1($item`chaos butterfly`, $item`Time-Spinner`);
    }
    return useItem$1($item`chaos butterfly`);
  }
  //accelerate palindrome quest
  if (canUse$4($item`disposable instant camera`)) {
    if ($monsters`Bob Racecar, Racecar Bob`.includes(enemy)) {
      return useItem$1($item`disposable instant camera`);
    }
  }
  //accelerate oil peak in highlands quest
  if (itemAmount($item`Duskwalker syringe`) > 0) {
    if (
      $monsters`oil baron, oil cartel, oil slick, oil tycoon`.includes(enemy)
    ) {
      return `item ${$item`Duskwalker syringe`}`;
    }
  }
  //used by [Little Geneticist DNA-Splicing Lab] iotm
  if (
    canUse$4($item`DNA extraction syringe`) &&
    monsterLevelAdjustment() < 150
  ) {
    if (monsterPhylum(enemy) !== toPhylum(getProperty("dnaSyringe"))) {
      return useItem$1($item`DNA extraction syringe`);
    }
  }
  //use latte iotm to restore 50% of max MP
  if (
    !in_plumber() &&
    !in_darkGyffte() &&
    !in_zombieSlayer() &&
    canUse$2(
      //paths that do not use MP
      $skill`Gulp Latte`,
    ) &&
    myMp() * 2 < myMaxmp()
  ) {
    //gulp latte restores 50% of your MP. do not waste it.
    return useSkill$2($skill`Gulp Latte`);
  }
  //use haiku katana's HP and MP restore skill
  if (
    !in_plumber() &&
    !in_darkGyffte() &&
    !in_zombieSlayer() &&
    canUse$2(
      //paths that do not use MP
      $skill`Spring Raindrop Attack`,
    ) &&
    myMp() < 0.9 * myMaxmp()
  ) {
    return useSkill$2($skill`Spring Raindrop Attack`);
  }
  //stinkbug physically resistant monsters
  if (!(haveEquipped($item`protonic accelerator pack`) && isGhost(enemy))) {
    if (
      canUse$2($skill`Summon Love Stinkbug`) &&
      enemy.physicalResistance >= 100 &&
      monsterElement(enemy) !== $element`stench`
    ) {
      return useSkill$2($skill`Summon Love Stinkbug`);
    }
  }
  // use red rocket from Clan VIP Lounge to get 5x stats from next food item consumed. Does not stagger on use
  if (
    fullness_left() > 0 &&
    canUse$4($item`red rocket`) &&
    haveEffect($effect`Everything Looks Red`) <= 0 &&
    haveEffect($effect`Ready to Eat`) <= 0 &&
    canSurvive$1(5.0) &&
    myAdventures() < 100
  ) {
    if (in_plumber()) {
      return useItem$1($item`red rocket`);
    }
    //use if next food is large in size. Currently autoConsume doesn't analyze stat gain, which would be better
    //disabled until fix: https://github.com/loathers/autoscend/issues/1053
    //item simulationOutput = auto_autoConsumeOneSimulation("eat");
    //if (simulationOutput != $item[none] && simulationOutput.fullness > 3)
    //{
    return useItem$1($item`red rocket`);
    //}
  }
  // use cosmic bowling ball iotm
  if (auto_bowlingBallCombatString(myLocation(), true) !== "" && !enemy.boss) {
    return auto_bowlingBallCombatString(myLocation(), false);
  }
  // prep avalanche if requested
  if (
    canUse$2($skill`McHugeLarge Avalanche`) &&
    getProperty("auto_forceNonCombatSource") === "McHugeLarge left ski" &&
    !toBoolean(getProperty("auto_avalancheDeployed"))
  ) {
    setProperty("auto_avalancheDeployed", true.toString());
    return useSkill$2($skill`McHugeLarge Avalanche`);
  }
  // prep parka NC forcing if requested
  if (
    canUse$2($skill`Launch spikolodon spikes`) &&
    getProperty("auto_forceNonCombatSource") === "jurassic parka" &&
    !toBoolean(getProperty("auto_parkaSpikesDeployed"))
  ) {
    setProperty("auto_parkaSpikesDeployed", true.toString());
    return useSkill$2($skill`Launch spikolodon spikes`);
  }
  // get extra combat stats
  if (shouldCinchoConfetti() && canSurvive$1(5.0)) {
    return useSkill$2($skill`Cincho: Confetti Extravaganza`);
  }

  return "";
}
