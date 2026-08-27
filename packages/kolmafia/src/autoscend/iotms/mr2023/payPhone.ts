import {
  canAdventure,
  expectedDamage,
  getLocationMonsters,
  handlingChoice,
  haveEffect,
  itemAmount,
  itemFact,
  lastChoice,
  Location,
  max,
  Monster,
  myHash,
  myMaxhp,
  myPokeFam,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $locations,
  $monster,
  $monsters,
  get,
} from "libram";

import { Bofa } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { handleChoiceAdv } from "../../auto_choice_adv";
import {
  auto_abort,
  auto_canForceNextNoncombat,
  auto_forceNextNoncombatIfWorthIt,
  auto_haveQueuedForcedNonCombat,
  auto_is_valid,
  backupSetting,
  isFreeMonster,
} from "../../auto_util";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { in_avantGuard } from "../../paths/2024/avant_guard";

export function havePayPhone(): boolean {
  return (
    auto_is_valid($item`closed-circuit pay phone`) &&
    itemAmount($item`closed-circuit pay phone`) > 0
  );
}

export function allRifts(): Location[] {
  return $locations`Shadow Rift (Desert Beach), Shadow Rift (Forest Village), Shadow Rift (Mt. McLargeHuge), Shadow Rift (Somewhere Over the Beanstalk), Shadow Rift (Spookyraven Manor Third Floor), Shadow Rift (The 8-Bit Realm), Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Castle in the Clouds in the Sky), Shadow Rift (The Distant Woods), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary), Shadow Rift (The Nearby Plains), Shadow Rift (The Right Side of the Tracks)`;
}

export function availableBrickRift(): Location {
  if (!havePayPhone()) {
    return $location.none;
  }

  if (in_avantGuard() && !auto_haveQueuedForcedNonCombat()) {
    //if no NC forced, don't adventure in zone
    return $location.none;
  }

  const riftsWithBricks: Location[] = $locations`Shadow Rift (The Ancient Buried Pyramid), Shadow Rift (The Hidden City), Shadow Rift (The Misspelled Cemetary)`;
  const riftsWithWishes: Location[] = auto_riftsWithWishes();
  // First loop checks for bricks and wishes if we have BoFA
  if (Bofa.haveBofa() && Bofa.wishFactsLeft() > 0) {
    for (const loc of riftsWithBricks) {
      if (riftsWithWishes.includes(loc) && canAdventure(loc)) {
        return loc;
      }
    }
  }
  // Then ignore wishes
  for (const loc of riftsWithBricks) {
    if (canAdventure(loc)) {
      return loc;
    }
  }
  return $location.none;
}

function auto_riftsWithWishes(): Location[] {
  const out: Location[] = [];
  for (const loc of allRifts()) {
    for (const m of Monster.get(Object.keys(getLocationMonsters(loc)))) {
      if (itemFact(m) === $item`pocket wish`) {
        out.push(loc);
        break;
      }
    }
  }
  return out;
}

export function neededShadowBricks(): number {
  if (!havePayPhone() || in_avantGuard()) {
    return 0;
  }

  const currentBricks: number = itemAmount($item`shadow brick`);
  const bricksUsedToday: number = get("_shadowBricksUsed");
  return max(0, 13 - currentBricks - bricksUsedToday);
}

function auto_getPhoneQuest(): boolean {
  if (!havePayPhone()) {
    return false;
  }

  if (get("questRufus") !== "unstarted") {
    // already started quest
    return true;
  }
  // get artifact quest
  // use() aborts the whole script with "Unsupported choice adventure #1497"
  // since this redirects straight into choice.php; visitUrl() bypasses that and
  // lets the real choice dispatcher handle it instead.
  const phoneText = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`closed-circuit pay phone`.id}`,
  );
  if (handlingChoice()) {
    handleChoiceAdv(lastChoice(), phoneText);
  }

  return get("questRufus") !== "unstarted";
}

export function doPhoneQuest(): boolean {
  if (!havePayPhone()) {
    return false;
  }
  // only accept and do quest if we can get bricks or force a noncombat
  if (
    availableBrickRift() === $location.none ||
    !auto_canForceNextNoncombat()
  ) {
    return false;
  }
  // already finished phone quest today
  if (
    get("_shadowAffinityToday") &&
    haveEffect($effect`Shadow Affinity`) === 0 &&
    get("questRufus") === "unstarted"
  ) {
    return false;
  }
  // not high enough level yet. Survive at least 2 hits
  if (myMaxhp() <= expectedDamage($monster`shadow slab`) * 2) {
    return false;
  }
  // in pokefam, we want at least 2 level 5s
  if (in_pokefam()) {
    // mafia can lose track of the team, so visit famteam so we're up to date
    visitUrl("famteam.php");
    const pokelevel1: number = myPokeFam(0).pokeLevel;
    const pokelevel2: number = myPokeFam(1).pokeLevel;
    const pokelevel3: number = myPokeFam(2).pokeLevel;
    let numFives: number = 0;
    if (pokelevel1 === 5) {
      numFives++;
    }
    if (pokelevel2 === 5) {
      numFives++;
    }
    if (pokelevel3 === 5) {
      numFives++;
    }
    if (numFives < 2) {
      return false;
    }
  }
  // don't start quest if fights will already be free... unless we already have shadow affinity
  if (
    isFreeMonster($monster`shadow slab`, availableBrickRift()) &&
    haveEffect($effect`Shadow Affinity`) === 0
  ) {
    return false;
  }
  // get quest
  if (!auto_getPhoneQuest()) {
    auto_abort("Failed to get Rufus quest from cursed phone.");
  }
  // finish quest
  if (get("questRufus") === "step1") {
    // use() aborts the whole script with "Unsupported choice adventure #1500"
    // since this redirects straight into choice.php; visitUrl() bypasses that and
    // lets the real choice dispatcher handle it instead.
    const phoneText = visitUrl(
      `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`closed-circuit pay phone`.id}`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), phoneText);
    }
    if (get("questRufus") !== "unstarted") {
      auto_abort("Failed to finish Rufus quest from cursed phone.");
    }
    return true;
  }
  //Force a non combat instead of adventuring there to save turns, especially in AG
  if (auto_haveQueuedForcedNonCombat()) {
    return autoAdv(availableBrickRift());
  }

  if (auto_canForceNextNoncombat() && in_avantGuard()) {
    //in avant guard, want to avoid adventuring here unless you can force an NC
    return auto_forceNextNoncombatIfWorthIt(availableBrickRift());
  }

  backupSetting("shadowLabyrinthGoal", "browser"); // use mafia's automation handling for the Shadow Rift NC.
  return autoAdv(availableBrickRift());
}

export function isShadowRiftMonster(m: Monster): boolean {
  const reg: Monster[] = $monsters`shadow bat, shadow cow, shadow devil, shadow guy, shadow hexagon, shadow orb, shadow prism, shadow slab, shadow snake, shadow spider, shadow stalk, shadow tree`;
  const boss: Monster[] = $monsters`shadow cauldron, shadow matrix, shadow orrery, shadow scythe, shadow spire, shadow tongue`;
  return reg.includes(m) || boss.includes(m);
}
