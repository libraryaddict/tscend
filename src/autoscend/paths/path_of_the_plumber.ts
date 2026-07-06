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
  Path,
  retrieveItem,
  runChoice,
  setProperty,
  Skill,
  Slot,
  Stat,
  toInt,
  toStat,
  visitUrl,
} from "kolmafia";
import { acquireOrPull, canPull$1 } from "../auto_acquire";
import { autoEat, fullness_left, prepare_food_xp_multi } from "../auto_consume";
import {
  autoEquip$1,
  autoForceEquip$3,
  possessEquipment,
} from "../auto_equipment";

//Defined in autoscend/paths/path_of_the_plumber.ash
export function in_plumber(): boolean {
  return myPath() === Path.get("Path of the Plumber");
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
    possessEquipment(Item.get("hammer")) ||
    possessEquipment(Item.get("heavy hammer"))
  );
}

function plumber_equippedHammer(): boolean {
  return (
    equippedItem(Slot.get("weapon")) === Item.get("hammer") ||
    equippedItem(Slot.get("weapon")) === Item.get("heavy hammer")
  );
}

function plumber_haveFlower(): boolean {
  return (
    possessEquipment(Item.get("[10462]fire flower")) ||
    possessEquipment(Item.get("bonfire flower"))
  );
}

function plumber_equippedFlower(): boolean {
  return (
    equippedItem(Slot.get("weapon")) === Item.get("[10462]fire flower") ||
    equippedItem(Slot.get("weapon")) === Item.get("bonfire flower")
  );
}

function plumber_equippedBoots(): boolean {
  return (
    haveEquipped(Item.get("work boots")) ||
    haveEquipped(Item.get("fancy boots"))
  );
}

function plumber_numBadgesBought(): number {
  return (
    toInt(haveSkill(Skill.get("[25001]Hammer Throw"))) +
    toInt(haveSkill(Skill.get("[25002]Ultra Smash"))) +
    toInt(haveSkill(Skill.get("[25003]Juggle Fireballs"))) +
    toInt(haveSkill(Skill.get("[25004]Fireball Barrage"))) +
    toInt(haveSkill(Skill.get("[25005]Spin Jump"))) +
    toInt(haveSkill(Skill.get("[25006]Multi-Bounce"))) +
    toInt(haveSkill(Skill.get("Power Plus"))) +
    toInt(haveSkill(Skill.get("Secret Eye"))) +
    toInt(haveSkill(Skill.get("Lucky Buckle"))) +
    toInt(haveSkill(Skill.get("Rainbow Shield"))) +
    toInt(haveSkill(Skill.get("Lucky Pin"))) +
    toInt(haveSkill(Skill.get("Lucky Brooch"))) +
    toInt(haveSkill(Skill.get("Lucky Insignia"))) +
    toInt(haveSkill(Skill.get("Health Symbol")))
  );
}

function plumber_buySkill(sk: Skill): boolean {
  if (haveSkill(sk)) {
    return false;
  }

  const cost: number = 50 + 25 * plumber_numBadgesBought();
  if (itemAmount(Item.get("coin")) < cost) {
    return false;
  }

  visitUrl("place.php?whichplace=mario&action=mush_badgeshop");

  let idx: number = 0;
  switch (sk) {
    case Skill.get("[25001]Hammer Throw"):
      idx = 1;
      break;
    case Skill.get("[25002]Ultra Smash"):
      idx = 2;
      break;
    case Skill.get("[25003]Juggle Fireballs"):
      idx = 3;
      break;
    case Skill.get("[25004]Fireball Barrage"):
      idx = 4;
      break;
    case Skill.get("[25005]Spin Jump"):
      idx = 5;
      break;
    case Skill.get("[25006]Multi-Bounce"):
      idx = 6;
      break;
    case Skill.get("Power Plus"):
      idx = 7;
      break;
    case Skill.get("Secret Eye"):
      idx = 8;
      break;
    case Skill.get("Lucky Buckle"):
      idx = 9;
      break;
    case Skill.get("Rainbow Shield"):
      idx = 10;
      break;
    case Skill.get("Lucky Pin"):
      idx = 11;
      break;
    case Skill.get("Lucky Brooch"):
      idx = 12;
      break;
    case Skill.get("Lucky Insignia"):
      idx = 13;
      break;
    case Skill.get("Health Symbol"):
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

  const coins: number = itemAmount(Item.get("coin"));

  switch (it) {
    case Item.get("hammer"):
    case Item.get("[10462]fire flower"):
      if (coins < 20) {
        return false;
      }
      break;
    case Item.get("frosty button"):
    case Item.get("back shell"):
    case Item.get("spiky back shell"):
    case Item.get("bony back shell"):
      if (coins < 100) {
        return false;
      }
      break;
    case Item.get("cape"):
      if (coins < 200) {
        return false;
      }
      break;
    case Item.get("heavy hammer"):
    case Item.get("bonfire flower"):
    case Item.get("fancy boots"):
    case Item.get("power pants"):
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

  if (itemAmount(Item.get("coin")) < toInt(getProperty("plumberCostumeCost"))) {
    return false;
  }

  switch (st) {
    case Stat.get("Muscle"):
      runChoice(1);
      return true;
    case Stat.get("Mysticality"):
      runChoice(2);
      return true;
    case Stat.get("Moxie"):
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
  if (!haveSkill(Skill.get("Lucky Buckle"))) {
    return plumber_buyableSkill(Skill.get("Lucky Buckle"));
  } else if (!possessEquipment(Item.get("[10462]fire flower"))) {
    return plumber_buyableItem(Item.get("[10462]fire flower"));
  } else if (!haveSkill(Skill.get("Secret Eye"))) {
    return plumber_buyableSkill(Skill.get("Secret Eye"));
  } else if (!haveSkill(Skill.get("[25006]Multi-Bounce"))) {
    return plumber_buyableSkill(Skill.get("[25006]Multi-Bounce"));
  } else if (!haveSkill(Skill.get("Power Plus"))) {
    return plumber_buyableSkill(Skill.get("Power Plus"));
  } else if (!possessEquipment(Item.get("fancy boots"))) {
    return plumber_buyableItem(Item.get("fancy boots"));
  } else if (plumber_costume() !== Stat.get("Moxie")) {
    return plumber_buyableCostume(Stat.get("Moxie"));
  } else if (!haveSkill(Skill.get("Lucky Pin"))) {
    return plumber_buyableSkill(Skill.get("Lucky Pin"));
  } else if (!haveSkill(Skill.get("Lucky Brooch"))) {
    return plumber_buyableSkill(Skill.get("Lucky Brooch"));
  } else if (!haveSkill(Skill.get("Lucky Insignia"))) {
    return plumber_buyableSkill(Skill.get("Lucky Insignia"));
  } else if (!haveSkill(Skill.get("Rainbow Shield"))) {
    return plumber_buyableSkill(Skill.get("Rainbow Shield"));
  } else if (!haveSkill(Skill.get("[25004]Fireball Barrage"))) {
    return plumber_buyableSkill(Skill.get("[25004]Fireball Barrage"));
  } else if (!possessEquipment(Item.get("frosty button"))) {
    return plumber_buyableItem(Item.get("frosty button"));
  } else if (!haveSkill(Skill.get("Health Symbol"))) {
    return plumber_buyableSkill(Skill.get("Health Symbol"));
  } else if (!haveSkill(Skill.get("[25003]Juggle Fireballs"))) {
    return plumber_buyableSkill(Skill.get("[25003]Juggle Fireballs"));
  } else if (!possessEquipment(Item.get("cape"))) {
    return plumber_buyableItem(Item.get("cape"));
  } else if (!possessEquipment(Item.get("bony back shell"))) {
    return plumber_buyableItem(Item.get("bony back shell"));
  } else if (!possessEquipment(Item.get("bonfire flower"))) {
    return plumber_buyableItem(Item.get("bonfire flower"));
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
    case Skill.get("[25001]Hammer Throw"):
    case Skill.get("[25003]Juggle Fireballs"):
    case Skill.get("[25005]Spin Jump"):
      return 1;
    case Skill.get("[25002]Ultra Smash"):
    case Skill.get("[25004]Fireball Barrage"):
    case Skill.get("[25006]Multi-Bounce"):
      return 2;
    default:
      return 0;
  }
}

export function plumber_canDealScalingDamage(): boolean {
  const items_lv1: Map<Stat, Item> = new Map([
    [Stat.get("Moxie"), Item.get("work boots")],
    [Stat.get("Mysticality"), Item.get("[10462]fire flower")],
    [Stat.get("Muscle"), Item.get("hammer")],
  ]);

  const items_lv2: Map<Stat, Item> = new Map([
    [Stat.get("Moxie"), Item.get("fancy boots")],
    [Stat.get("Mysticality"), Item.get("bonfire flower")],
    [Stat.get("Muscle"), Item.get("heavy hammer")],
  ]);
  // These attacks deal scaling damage at level 1.
  const attacks_2pp: Map<Stat, Skill> = new Map([
    [Stat.get("Moxie"), Skill.get("[25006]Multi-Bounce")],
    [Stat.get("Mysticality"), Skill.get("[25004]Fireball Barrage")],
    [Stat.get("Muscle"), Skill.get("[25002]Ultra Smash")],
  ]);
  // These attacks deal scaling damage at level 3.
  const attacks_free: Map<Stat, Skill> = new Map([
    [Stat.get("Moxie"), Skill.get("Jump Attack")],
    [Stat.get("Mysticality"), Skill.get("Fireball Toss")],
    [Stat.get("Muscle"), Skill.get("Hammer Smash")],
  ]);
  // This is a pretty rough guesstimate.
  const expected_scaler_hp: number = myBuffedstat(myPrimestat());

  for (const st of Stat.get(["Muscle", "Mysticality", "Moxie"])) {
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
    } else if (itemAmount(Item.get("coin")) >= 20) {
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
    case Stat.get("Muscle"):
      return equipWithFallback(Item.get("heavy hammer"), Item.get("hammer"));
    case Stat.get("Mysticality"):
      return equipWithFallback(
        Item.get("bonfire flower"),
        Item.get("[10462]fire flower"),
      );
    case Stat.get("Moxie"):
      return equipWithFallback(Item.get("fancy boots"), Item.get("work boots"));
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
  return plumber_equipTool(Stat.get("Moxie"), true);
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

  const milk: Item = Item.get("gallon of milk");
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
