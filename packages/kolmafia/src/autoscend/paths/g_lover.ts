import {
  cliExecute,
  containsText,
  Effect,
  haveSkill,
  Item,
  itemAmount,
  myHp,
  myMaxhp,
  myMp,
  myPath,
  putCloset,
  toItem,
  useSkill,
} from "kolmafia";
import { $effects, $item, $items, $path, $skill, get, set } from "libram";
//Defined in autoscend/paths/g_lover.ash
export function in_glover(): boolean {
  return myPath() === $path`G-Lover`;
}

export function glover_initializeDay(day: number): void {
  if (!in_glover()) {
    return;
  }
}

export function glover_initializeSettings(): void {
  if (in_glover()) {
    set("auto_getBeehive", true);
    set("auto_getBoningKnife", true);
    set("auto_dakotaFanning", true);
    set("auto_ignoreFlyer", true);
    set("gnasirProgress", get("gnasirProgress") | 16);
    //Buy Crude Oil Congealer and um... A-Boo Glues.
    if (
      itemAmount($item`crude oil congealer`) === 0 &&
      itemAmount($item`G`) > 0
    ) {
      cliExecute(`make ${$item`crude oil congealer`}`);
    }
    while (itemAmount($item`A-Boo glue`) < 3 && itemAmount($item`G`) > 0) {
      cliExecute(`make ${$item`A-Boo glue`}`);
    }
  }
}

export function glover_usable(it: string): boolean {
  if (!in_glover()) {
    return true;
  }
  if (containsText(it, "g")) {
    return true;
  }
  if (containsText(it, "G")) {
    return true;
  }
  const checkItem: Item = toItem(it);
  if (
    checkItem !== Item.none &&
    Item.get([
      "SpinMaster&trade; lathe", // it works since there's no "use" link
      "&quot;I Voted!&quot; sticker", // free fights still work for I voted! sticker
      "ninja carabiner",
      "ninja crampons",
      "ninja rope",
      "eXtreme scarf",
      "snowboarder pants",
      "eXtreme mittens",
      "linoleum ore",
      "chrome ore",
      "asbestos ore",
      "loadstone",
      "amulet of extreme plot significance",
      "titanium assault umbrella",
      "antique machete",
      "half-size scalpel",
      "head mirror",
      "wet stew",
      "UV-resistant compass",
      "Talisman o' Namsilat",
      "unstable fulminate",
      "Orcish baseball cap",
      "Orcish frat-paddle",
      "filthy knitted dread sack",
      "filthy corduroys",
      "continuum transfunctioner",
      "beer helmet",
      "distressed denim pants",
      "reinforced beaded headband",
      "bullet-proof corduroys",
    ]).includes(checkItem)
  ) {
    // these are all used for quest furthering porpoises so they still "work" even though they don't contain G's
    return true;
  }
  return false;
}

export function glover_usable$1(eff: Effect): boolean {
  if (!in_glover()) {
    return true;
  }
  if ($effects`Stone-Faced`.includes(eff)) {
    return true; //explicit exceptions that work in glover despite not having G in the name
  }
  return glover_usable(eff.toString());
}

export function LM_glover(): boolean {
  if (!in_glover()) {
    return false;
  }
  for (const it of $items`chaos butterfly, cornucopia, disassembled clover, filthy poultice, metal meteoroid, Oil of Parrrlay, pec oil, Polysniff Perfume, smut orc keepsake box, sonar-in-a-biscuit, T.U.R.D.S. Key, 11-leaf clover, tonic djinn, turtle wax`) {
    if (itemAmount(it) > 0) {
      putCloset(itemAmount(it), it);
    }
  }

  if (
    myMaxhp() - myHp() > 40 &&
    haveSkill($skill`Tongue of the Walrus`) &&
    myMp() > 100
  ) {
    useSkill(1, $skill`Tongue of the Walrus`);
  }

  return false;
}
