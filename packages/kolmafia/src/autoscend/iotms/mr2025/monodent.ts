import {
  currentRound,
  equippedItem,
  handlingChoice,
  Item,
  itemAmount,
  lastChoice,
  Location,
  Monster,
  myFamiliar,
  myId,
  myLocation,
  myPath,
  myThrall,
  numericModifier,
  toInt,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $locations,
  $modifier,
  $monster,
  $monsters,
  $path,
  $skill,
  $slot,
  $thrall,
  get,
} from "libram";

import { BCZ, SwordOfSwords } from "../../../types";
import { handleChoiceAdv } from "../../auto_choice_adv";
import { autoForceEquip$2, possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_wantToBanish,
  auto_wantToFreeRun,
  freeRunCombatAction,
  handleTracker,
  isFreeMonster,
  safeGet,
} from "../../auto_util";
import {
  banisherCombatAction$1,
  combat_status_check,
  combatStatusCanDiscardDrops,
} from "../../combat/auto_combat_util";
import { fightingDesiredTaskMonster } from "../../engine/engine";
import { shouldMonodentTheAirship } from "../../quests/level_10";

export function auto_haveMonodent(): boolean {
  const dent: Item = $item`Monodent of the Sea`;
  return auto_is_valid(dent) && possessEquipment(dent);
}

export function auto_waveTheZone(): boolean {
  if (!auto_haveMonodent()) {
    return false;
  }
  //Already Summoned a Wave today
  if (get("_seadentWaveUsed")) {
    return false;
  }

  let waveTheZone: boolean = false;
  //Force the Monodent of the Sea when adventuring in a zone that we might want to Summon a Wave in
  //Get Fishy turns from free fights
  if (
    $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary), Cyberzone 1, Cyberzone 2, Cyberzone 3`.includes(
      myLocation(),
    ) &&
    myPath() === $path`11,037 Leagues Under the Sea`
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  //Get 30% more meat drop. Only useful if weapon slot has < 30% meat drop
  if (
    myLocation() === $location`The Themthar Hills` &&
    numericModifier(equippedItem($slot`weapon`), $modifier`Meat Drop`) < 30.0 &&
    !shouldMonodentTheAirship()
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  if (
    shouldMonodentTheAirship() &&
    myLocation() === $location`The Penultimate Fantasy Airship`
  ) {
    autoForceEquip$2($item`Monodent of the Sea`, true);
    waveTheZone = true;
  }
  if (waveTheZone) {
    // visitUrl, not useSkill: useSkill aborts on the choice.php redirect (#1566)
    const waveText = visitUrl(
      `runskillz.php?action=Skillz&whichskill=${toInt($skill`Sea *dent: Summon a Wave`)}&quantity=1&targetplayer=${myId()}&pwd`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), waveText);
    }
    handleTracker({
      what: $item`Monodent of the Sea`,
      location: myLocation(),
      detail: "Summon a Wave",
      property: "auto_otherstuff",
    });
    return true;
  }
  return false;
}

export function auto_talkToSomeFish(loc: Location, enemy: Monster): boolean {
  if (!auto_isPotentialTalkToSomeFishTarget(loc, enemy)) {
    return false;
  }

  // If we're going to gaze, always talk
  if (BCZ.auto_bczRefractedGaze(false, loc)) {
    return true;
  }

  if (auto_wantToBanish(enemy, loc)) {
    // If we have a banish available, don't replace
    return banisherCombatAction$1(enemy, loc, currentRound() > 0) === undefined;
  }

  // The sword can't overwrite the drops of an uncopyable monster, but it can overwrite a fish's
  if (
    myFamiliar() === $familiar`Sword of S Words` &&
    SwordOfSwords.auto_swordWantsToFish(loc, enemy)
  ) {
    return true;
  }

  // If we're not free running, then don't replace
  if (!auto_wantToFreeRun(enemy, loc)) {
    return false;
  }

  // If we have a free run available, don't replace
  if (freeRunCombatAction(enemy, loc, currentRound() > 0) === undefined) {
    return false;
  }

  return true;
}

// If this target can be considered for 'talk to some fish'
export function auto_isPotentialTalkToSomeFishTarget(
  loc: Location,
  enemy: Monster,
): boolean {
  // returns true if we want to cast Talk to Some Fish. Not intended to exhaustivly list all valid targets
  // also, this is not actually a free fight, but this is a safe listing of targets
  if (!auto_haveMonodent()) {
    return false;
  }
  if (!auto_is_valid$2($skill`Sea *dent: Talk to Some Fish`)) {
    return false;
  }
  // don't try and use the skill if we have already turned them into some fish
  if (enemy === $monster`some fish`) {
    return false;
  }
  // some fish has no meat drop, so this doesn't take familiar meat modifiers into account
  if (loc === $location`The Fungus Plains`) {
    return false;
  }

  // need hippy / frat kills
  if (
    $locations`The Battlefield (Frat Uniform), The Battlefield (Hippy Uniform)`.includes(
      myLocation(),
    )
  ) {
    return false;
  }
  // need the choices
  if (loc === $location`The Haunted Bedroom`) {
    return false;
  }

  // don't avoid inherently free fights
  if (isFreeMonster(enemy, loc)) {
    return false;
  }

  // We progress faster if we fight the black monsters
  if (
    loc === $location`The Black Forest` &&
    $monsters`black adder, black friar, black magic woman, black panther, black widow`.includes(
      enemy,
    )
  ) {
    return false;
  }

  // If we're trying to get those blackberries
  if (
    enemy === $monster`blackberry bush` &&
    itemAmount($item`blackberry`) < 3 &&
    !possessEquipment($item`blackberry galoshes`) &&
    auto_is_valid($item`blackberry galoshes`)
  ) {
    return false;
  }

  // Avoid when we're trying to kill rats for free
  if (
    myThrall() === $thrall`Vermincelli` &&
    myThrall().level >= 11 &&
    enemy.attributes.split(" ").includes("RAT") &&
    get("_legendaryVermincelliFreeRats") < 11
  ) {
    return false;
  }

  // If a task explicitly registered this monster as a desired target
  if (fightingDesiredTaskMonster(enemy)) {
    return false;
  }
  //This is called in stage2 and _chainedPurpleCandleMonster is set in stage 4 so this should only ever show up on the purple candled enemy
  if (safeGet("_chainedPurpleCandleMonster") === enemy) {
    return false;
  }

  // If we did something to the monster and we don't want to undo it
  if (combat_status_check("refractedgazed") || !combatStatusCanDiscardDrops()) {
    return false;
  }

  //bcz has great synergy with talk to some fish to get all the drops in a zone
  if (BCZ.auto_bczRefractedGaze() && BCZ.auto_BCZEquipped()) {
    return true;
  }

  return true;
}

export function auto_throwLightningRemaining(): number {
  if (
    !auto_haveMonodent() ||
    !auto_is_valid$2($skill`Sea *dent: Throw a Lightning Bolt`)
  ) {
    return 0;
  }

  return 11 - get("_seadentLightningUsed");
}
