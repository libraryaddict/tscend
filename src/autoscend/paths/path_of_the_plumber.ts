import {
  abort,
  creatableAmount,
  equippedAmount,
  equippedItem,
  getProperty,
  haveEquipped,
  haveSkill,
  Item,
  itemAmount,
  myBuffedstat,
  myLevel,
  myMaxpp,
  myPath,
  myPrimestat,
  retrieveItem,
  runChoice,
  setProperty,
  Skill,
  Stat,
  toInt,
  toStat,
  visitUrl,
} from "kolmafia";
import { $item, $path, $skill, $slot, $stat, $stats } from "libram";

import { acquireOrPull, canPull$1 } from "../auto_acquire";
import { autoEat, fullness_left, prepare_food_xp_multi } from "../auto_consume";
import {
  autoEquip$1,
  autoForceEquip$3,
  possessEquipment,
} from "../auto_equipment";

//Defined in autoscend/paths/path_of_the_plumber.ash
export function in_plumber(): boolean {
  return myPath() === $path`Path of the Plumber`;
}

export function plumber_initializeSettings(): boolean {
  if (in_plumber()) {
    setProperty("auto_getBeehive", true.toString());
    setProperty("auto_wandOfNagamar", false.toString());
    // TODO: Remove when quest handling is correct.
    setProperty("auto_paranoia", (1).toString());
  }
  return false;
}

function plumber_haveHammer(): boolean {
  return (
    possessEquipment($item`hammer`) || possessEquipment($item`heavy hammer`)
  );
}

function plumber_equippedHammer(): boolean {
  return (
    equippedItem($slot`weapon`) === $item`hammer` ||
    equippedItem($slot`weapon`) === $item`heavy hammer`
  );
}

function plumber_haveFlower(): boolean {
  return (
    possessEquipment($item`[10462]fire flower`) ||
    possessEquipment($item`bonfire flower`)
  );
}

function plumber_equippedFlower(): boolean {
  return (
    equippedItem($slot`weapon`) === $item`[10462]fire flower` ||
    equippedItem($slot`weapon`) === $item`bonfire flower`
  );
}

function plumber_equippedBoots(): boolean {
  return haveEquipped($item`work boots`) || haveEquipped($item`fancy boots`);
}

function plumber_numBadgesBought(): number {
  return (
    toInt(haveSkill($skill`[25001]Hammer Throw`)) +
    toInt(haveSkill($skill`[25002]Ultra Smash`)) +
    toInt(haveSkill($skill`[25003]Juggle Fireballs`)) +
    toInt(haveSkill($skill`[25004]Fireball Barrage`)) +
    toInt(haveSkill($skill`[25005]Spin Jump`)) +
    toInt(haveSkill($skill`[25006]Multi-Bounce`)) +
    toInt(haveSkill($skill`Power Plus`)) +
    toInt(haveSkill($skill`Secret Eye`)) +
    toInt(haveSkill($skill`Lucky Buckle`)) +
    toInt(haveSkill($skill`Rainbow Shield`)) +
    toInt(haveSkill($skill`Lucky Pin`)) +
    toInt(haveSkill($skill`Lucky Brooch`)) +
    toInt(haveSkill($skill`Lucky Insignia`)) +
    toInt(haveSkill($skill`Health Symbol`))
  );
}

function plumber_buySkill(sk: Skill): boolean {
  if (haveSkill(sk)) {
    return false;
  }

  const cost: number = 50 + 25 * plumber_numBadgesBought();
  if (itemAmount($item`coin`) < cost) {
    return false;
  }

  visitUrl("place.php?whichplace=mario&action=mush_badgeshop");

  let idx: number = 0;
  switch (sk) {
    case $skill`[25001]Hammer Throw`:
      idx = 1;
      break;
    case $skill`[25002]Ultra Smash`:
      idx = 2;
      break;
    case $skill`[25003]Juggle Fireballs`:
      idx = 3;
      break;
    case $skill`[25004]Fireball Barrage`:
      idx = 4;
      break;
    case $skill`[25005]Spin Jump`:
      idx = 5;
      break;
    case $skill`[25006]Multi-Bounce`:
      idx = 6;
      break;
    case $skill`Power Plus`:
      idx = 7;
      break;
    case $skill`Secret Eye`:
      idx = 8;
      break;
    case $skill`Lucky Buckle`:
      idx = 9;
      break;
    case $skill`Rainbow Shield`:
      idx = 10;
      break;
    case $skill`Lucky Pin`:
      idx = 11;
      break;
    case $skill`Lucky Brooch`:
      idx = 12;
      break;
    case $skill`Lucky Insignia`:
      idx = 13;
      break;
    case $skill`Health Symbol`:
      idx = 14;
      break;
    default:
      abort("Unrecognized skill");
  }

  runChoice(idx);

  return haveSkill(sk);
}

function plumber_buyEquipment(it: Item): boolean {
  if (possessEquipment(it)) {
    return false;
  }

  const coins: number = itemAmount($item`coin`);

  switch (it) {
    case $item`hammer`:
    case $item`[10462]fire flower`:
      if (coins < 20) {
        return false;
      }
      break;
    case $item`frosty button`:
    case $item`back shell`:
    case $item`spiky back shell`:
    case $item`bony back shell`:
      if (coins < 100) {
        return false;
      }
      break;
    case $item`cape`:
      if (coins < 200) {
        return false;
      }
      break;
    case $item`heavy hammer`:
    case $item`bonfire flower`:
    case $item`fancy boots`:
    case $item`power pants`:
      if (coins < 300) {
        return false;
      }
      break;
    default:
      return false;
  }
  retrieveItem(1, it);
  return true;
}

function plumber_costume(): Stat {
  return toStat(getProperty("plumberCostumeWorn"));
}

function plumber_buyCostume(st: Stat): boolean {
  if (plumber_costume() === st) {
    return false;
  }

  visitUrl("place.php?whichplace=mario&action=mush_costumeshop");

  if (itemAmount($item`coin`) < toInt(getProperty("plumberCostumeCost"))) {
    return false;
  }

  switch (st) {
    case $stat`Muscle`:
      runChoice(1);
      return true;
    case $stat`Mysticality`:
      runChoice(2);
      return true;
    case $stat`Moxie`:
      runChoice(3);
      return true;
  }
  return false;
}

class plumber_buyable {
  constructor(
    public it: Item = Item.none,
    public sk: Skill = Skill.none,
    public costume: Stat = Stat.none,
  ) {}
}

function plumber_buyableItem(it: Item): plumber_buyable {
  const res: plumber_buyable = new plumber_buyable();
  res.it = it;
  return res;
}

function plumber_buyableSkill(sk: Skill): plumber_buyable {
  const res: plumber_buyable = new plumber_buyable();
  res.sk = sk;
  return res;
}

function plumber_buyableCostume(costume: Stat): plumber_buyable {
  const res: plumber_buyable = new plumber_buyable();
  res.costume = costume;
  return res;
}

function plumber_buyableIsNothing(zb: plumber_buyable): boolean {
  return (
    zb.it === Item.none && zb.sk === Skill.none && zb.costume === Stat.none
  );
}

function plumber_nextBuyable(): plumber_buyable {
  if (!haveSkill($skill`Lucky Buckle`)) {
    return plumber_buyableSkill($skill`Lucky Buckle`);
  } else if (!possessEquipment($item`[10462]fire flower`)) {
    return plumber_buyableItem($item`[10462]fire flower`);
  } else if (!haveSkill($skill`Secret Eye`)) {
    return plumber_buyableSkill($skill`Secret Eye`);
  } else if (!haveSkill($skill`[25006]Multi-Bounce`)) {
    return plumber_buyableSkill($skill`[25006]Multi-Bounce`);
  } else if (!haveSkill($skill`Power Plus`)) {
    return plumber_buyableSkill($skill`Power Plus`);
  } else if (!possessEquipment($item`fancy boots`)) {
    return plumber_buyableItem($item`fancy boots`);
  } else if (plumber_costume() !== $stat`Moxie`) {
    return plumber_buyableCostume($stat`Moxie`);
  } else if (!haveSkill($skill`Lucky Pin`)) {
    return plumber_buyableSkill($skill`Lucky Pin`);
  } else if (!haveSkill($skill`Lucky Brooch`)) {
    return plumber_buyableSkill($skill`Lucky Brooch`);
  } else if (!haveSkill($skill`Lucky Insignia`)) {
    return plumber_buyableSkill($skill`Lucky Insignia`);
  } else if (!haveSkill($skill`Rainbow Shield`)) {
    return plumber_buyableSkill($skill`Rainbow Shield`);
  } else if (!haveSkill($skill`[25004]Fireball Barrage`)) {
    return plumber_buyableSkill($skill`[25004]Fireball Barrage`);
  } else if (!possessEquipment($item`frosty button`)) {
    return plumber_buyableItem($item`frosty button`);
  } else if (!haveSkill($skill`Health Symbol`)) {
    return plumber_buyableSkill($skill`Health Symbol`);
  } else if (!haveSkill($skill`[25003]Juggle Fireballs`)) {
    return plumber_buyableSkill($skill`[25003]Juggle Fireballs`);
  } else if (!possessEquipment($item`cape`)) {
    return plumber_buyableItem($item`cape`);
  } else if (!possessEquipment($item`bony back shell`)) {
    return plumber_buyableItem($item`bony back shell`);
  } else if (!possessEquipment($item`bonfire flower`)) {
    return plumber_buyableItem($item`bonfire flower`);
  }

  const nothing: plumber_buyable = new plumber_buyable();
  return nothing;
}

export function plumber_nothingToBuy(): boolean {
  const next: plumber_buyable = plumber_nextBuyable();
  return plumber_buyableIsNothing(next);
}

function plumber_buyStuff(): boolean {
  const next: plumber_buyable = plumber_nextBuyable();
  if (next.sk !== Skill.none) {
    return plumber_buySkill(next.sk);
  } else if (next.it !== Item.none) {
    return plumber_buyEquipment(next.it);
  } else if (next.costume !== Stat.none) {
    return plumber_buyCostume(next.costume);
  } else {
    return false;
  }
}

export function plumber_ppCost(sk: Skill): number {
  switch (sk) {
    case $skill`[25001]Hammer Throw`:
    case $skill`[25003]Juggle Fireballs`:
    case $skill`[25005]Spin Jump`:
      return 1;
    case $skill`[25002]Ultra Smash`:
    case $skill`[25004]Fireball Barrage`:
    case $skill`[25006]Multi-Bounce`:
      return 2;
    default:
      return 0;
  }
}

export function plumber_canDealScalingDamage(): boolean {
  const items_lv1: Map<Stat, Item> = new Map([
    [$stat`Moxie`, $item`work boots`],
    [$stat`Mysticality`, $item`[10462]fire flower`],
    [$stat`Muscle`, $item`hammer`],
  ]);

  const items_lv2: Map<Stat, Item> = new Map([
    [$stat`Moxie`, $item`fancy boots`],
    [$stat`Mysticality`, $item`bonfire flower`],
    [$stat`Muscle`, $item`heavy hammer`],
  ]);
  // These attacks deal scaling damage at level 1.
  const attacks_2pp: Map<Stat, Skill> = new Map([
    [$stat`Moxie`, $skill`[25006]Multi-Bounce`],
    [$stat`Mysticality`, $skill`[25004]Fireball Barrage`],
    [$stat`Muscle`, $skill`[25002]Ultra Smash`],
  ]);
  // These attacks deal scaling damage at level 3.
  const attacks_free: Map<Stat, Skill> = new Map([
    [$stat`Moxie`, $skill`Jump Attack`],
    [$stat`Mysticality`, $skill`Fireball Toss`],
    [$stat`Muscle`, $skill`Hammer Smash`],
  ]);
  // This is a pretty rough guesstimate.
  const expected_scaler_hp: number = myBuffedstat(myPrimestat());

  for (const st of $stats.all()) {
    let level: number = 0;
    if (
      possessEquipment(
        items_lv2.get(st) ?? items_lv2.set(st, Item.none).get(st),
      )
    ) {
      level = 2;
    } else if (
      possessEquipment(
        items_lv1.get(st) ?? items_lv1.set(st, Item.none).get(st),
      )
    ) {
      level = 1;
    } else {
      continue;
    }
    // Discard stats that are wildly lower than our max stat.
    if (expected_scaler_hp >= 2 * myBuffedstat(st)) {
      continue;
    }

    level += toInt(plumber_costume() === st);

    if (
      myMaxpp() >= 2 &&
      haveSkill(attacks_2pp.get(st) ?? attacks_2pp.set(st, Skill.none).get(st))
    ) {
      return true;
    }
    if (
      level >= 3 &&
      haveSkill(
        attacks_free.get(st) ?? attacks_free.set(st, Skill.none).get(st),
      )
    ) {
      return true;
    }
  }

  return false;
}

export function plumber_skillValid(sk: Skill): boolean {
  if (!in_plumber()) {
    return true;
  }

  if (
    Skill.get([
      "Jump Attack",
      "[25005]Spin Jump",
      "[25006]Multi-Bounce",
    ]).includes(sk)
  ) {
    return plumber_equippedBoots();
  } else if (
    Skill.get([
      "Fireball Toss",
      "[25003]Juggle Fireballs",
      "[25004]Fireball Barrage",
    ]).includes(sk)
  ) {
    return plumber_equippedFlower();
  } else if (
    Skill.get([
      "Hammer Smash",
      "[25001]Hammer Throw",
      "[25002]Ultra Smash",
    ]).includes(sk)
  ) {
    return plumber_equippedHammer();
  }

  return true;
}

function plumber_equipTool(st: Stat, forceEquipRightNow: boolean): boolean {
  if (!in_plumber()) {
    return false;
  }

  function equipWithFallback(to_equip: Item, fallback_to_equip: Item): boolean {
    if (possessEquipment(to_equip)) {
      if (forceEquipRightNow) {
        return autoForceEquip$3(to_equip);
      } else {
        return autoEquip$1(to_equip);
      }
    } else if (possessEquipment(fallback_to_equip)) {
      if (forceEquipRightNow) {
        return autoForceEquip$3(fallback_to_equip);
      } else {
        return autoEquip$1(fallback_to_equip);
      }
    } else if (itemAmount($item`coin`) >= 20) {
      // 20 coins to avoid doing clever re-routing? Yes please!
      retrieveItem(1, fallback_to_equip);
      if (forceEquipRightNow) {
        return autoForceEquip$3(fallback_to_equip);
      } else {
        return autoEquip$1(fallback_to_equip);
      }
    }
    return false;
  }

  switch (st) {
    case $stat`Muscle`:
      return equipWithFallback($item`heavy hammer`, $item`hammer`);
    case $stat`Mysticality`:
      return equipWithFallback(
        $item`bonfire flower`,
        $item`[10462]fire flower`,
      );
    case $stat`Moxie`:
      return equipWithFallback($item`fancy boots`, $item`work boots`);
  }
  return false;
}

export function plumber_equipTool$1(st: Stat): boolean {
  return plumber_equipTool(st, false);
}

export function plumber_forceEquipTool(): boolean {
  //just make sure a tool, any tool, is equipped
  for (const it of Item.get([
    "fancy boots",
    "work boots",
    "bonfire flower",
    "[10462]fire flower",
    "heavy hammer",
    "hammer",
  ])) {
    if (equippedAmount(it) > 0) {
      return true;
    }
  }
  //if not equip the moxie accessory as pre_adv does by default, but without waiting for maximizer to equip it
  return plumber_equipTool($stat`Moxie`, true);
}

function plumber_eat_xp(): void {
  //eat stuff for XP.
  if (!in_plumber() || fullness_left() < 1) {
    return;
  }
  if (!prepare_food_xp_multi()) {
    return; //we are not prepared.
  }
  //TODO diabolic pizza oven with pie man was not meant to eat

  const milk: Item = $item`gallon of milk`;
  const got_milk: boolean =
    creatableAmount(milk) > 0 || itemAmount(milk) > 0 || canPull$1(milk);
  if (got_milk && fullness_left() >= 15) {
    acquireOrPull(milk);
    autoEat(1, milk);
  }
}

export function LM_plumber(): boolean {
  //this function is called early once every loop of doTasks() in autoscend.ash
  //if something in this function returns true then it will restart the loop and get called again.
  if (!in_plumber()) {
    return false;
  }
  plumber_buyStuff();
  if (myLevel() < 13) {
    plumber_eat_xp();
  }

  return false;
}
