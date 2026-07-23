import {
  availableAmount,
  cliExecute,
  craft,
  creatableAmount,
  create,
  Effect,
  getMonsters,
  getProperty,
  haveEffect,
  haveSkill,
  hpCost,
  isAccessible,
  Item,
  itemAmount,
  Location,
  min,
  Monster,
  monsterPhylum,
  mpCost,
  myAdventures,
  myBasestat,
  myClass,
  myHash,
  myHp,
  myLevel,
  myLocation,
  myPath,
  sell,
  setProperty,
  Skill,
  toInt,
  toSkill,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $item,
  $items,
  $path,
  $phylum,
  $skill,
  $skills,
  $stat,
} from "libram";

import { auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import {
  autoChew,
  autoDrink,
  autoEat,
  fullness_left,
  inebriety_left,
  spleen_left,
} from "../auto_consume";
import { possessOutfit } from "../auto_equipment";
import {
  auto_banishesUsedAt,
  auto_have_skill,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_wantToBanish,
  banishedMonsters,
  isFreeMonster,
  total_items,
} from "../auto_util";
import { auto_warSide } from "../quests/level_12";

//Defined in autoscend/paths/dark_gyffte.ash
export function in_darkGyffte(): boolean {
  return myPath() === $path`Dark Gyffte`;
}

export function bat_initializeSettings(): void {
  if (in_darkGyffte()) {
    setProperty("auto_getSteelOrgan", false.toString());
    setProperty("auto_grimstoneFancyOilPainting", false.toString());
    setProperty("auto_paranoia", (10).toString());
    setProperty("auto_wandOfNagamar", false.toString());
    setProperty("auto_bat_desiredForm", "");
  }
}
// The following functions set the desired form.
// The pre-adventure handler adjusts our actual form to match.
// This is done to avoid getting stuck in an incorrect form,
// or wasting HP switching back and forth.

export function bat_wantHowl(loc: Location): boolean {
  if (!auto_have_skill($skill`Baleful Howl`)) {
    return false;
  }
  if (auto_banishesUsedAt(loc).has("baleful howl")) {
    return false;
  }
  if (toInt(getProperty("_balefulHowlUses")) >= 10) {
    return false;
  }
  if (myHp() <= hpCost($skill`Baleful Howl`)) {
    // DG doesn't heal in pre-adv, so current HP is how much we will have when we adv
    return false;
  }
  const banished: Map<Monster, number> = banishedMonsters();
  const monsters: Map<number, Monster> = new Map(
    getMonsters(loc).map((_v, _i) => [_i, _v]),
  );
  for (const i of monsters.keys()) {
    if (
      !banished.has(monsters.get(i) ?? monsters.set(i, Monster.none).get(i)) &&
      auto_wantToBanish(
        monsters.get(i) ?? monsters.set(i, Monster.none).get(i),
        loc,
      )
    ) {
      return true;
    }
  }
  return false;
}

export function bat_formNone(): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  if (getProperty("auto_bat_desiredForm") !== "") {
    setProperty("auto_bat_desiredForm", "");
  }
  return true;
}

export function bat_formWolf(speculative: boolean): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  setProperty("auto_bat_desiredForm", "wolf");
  return bat_switchForm($effect`Wolf Form`, speculative);
}

export function bat_formMist(speculative: boolean = false): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  setProperty("auto_bat_desiredForm", "mist");
  return bat_switchForm($effect`Mist Form`, speculative);
}

export function bat_formBats(speculative: boolean = false): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  setProperty("auto_bat_desiredForm", "bats");
  return bat_switchForm($effect`Bats Form`, speculative);
}

function bat_clearForms(): void {
  for (const ef of $effects`Wolf Form, Mist Form, Bats Form`) {
    if (0 !== haveEffect(ef)) {
      useSkill(toSkill(ef));
    }
  }
}

function bat_switchForm(form: Effect, speculative: boolean = false): boolean {
  if (0 !== haveEffect(form)) {
    return true;
  }
  if (!haveSkill(toSkill(form))) {
    if (!speculative) {
      bat_clearForms();
    }
    return false;
  }
  if (myHp() <= 10) {
    if (!speculative) {
      auto_log_warning(
        `We don't have enough HP to switch form to ${form}!`,
        "red",
      );
    }
    return false;
  }
  if (speculative) {
    return true;
  }
  return useSkill(1, toSkill(form));
}

export function bat_formPreAdventure(): boolean {
  if (!in_darkGyffte()) {
    return false;
  }

  const desiredForm: string = getProperty("auto_bat_desiredForm");
  switch (desiredForm) {
    case "wolf":
      return bat_switchForm($effect`Wolf Form`);
    case "mist":
      return bat_switchForm($effect`Mist Form`);
    case "bats":
      return bat_switchForm($effect`Bats Form`);
    case "":
      bat_clearForms();
      return true;
    default:
      auto_log_error(
        `auto_bat_desiredForm was set to bad value: '${desiredForm}'. Should be '', 'wolf', 'mist', or 'bats'.`,
      );
      setProperty("auto_bat_desiredForm", "");
      return false;
  }
}

export function bat_initializeSession(): void {
  if (in_darkGyffte()) {
    setProperty("auto_mpAutoRecovery", getProperty("mpAutoRecovery"));
    setProperty(
      "auto_mpAutoRecoveryTarget",
      getProperty("mpAutoRecoveryTarget"),
    );
    setProperty("mpAutoRecovery", (-0.05).toString());
    setProperty("mpAutoRecoveryTarget", (0.0).toString());
  }
}

export function bat_terminateSession(): void {
  if (in_darkGyffte()) {
    setProperty("mpAutoRecovery", getProperty("auto_mpAutoRecovery"));
    setProperty("auto_mpAutoRecovery", (0.0).toString());
    setProperty(
      "mpAutoRecoveryTarget",
      getProperty("auto_mpAutoRecoveryTarget"),
    );
    setProperty("auto_mpAutoRecoveryTarget", (0.0).toString());
  }
}

export function bat_initializeDay(day: number): void {
  if (!in_darkGyffte()) {
    return;
  }

  if (toInt(getProperty("auto_day_init")) < day) {
    setProperty("_auto_bat_bloodBank", (0).toString()); // 0: no blood yet, 1: base blood, 2: intimidating blood
    setProperty("auto_bat_ensorcels", (0).toString());
    setProperty("auto_bat_soulmonster", "");
    bat_tryBloodBank();
    if (bat_shouldPickSkills(20)) {
      bat_reallyPickSkills(20);
    }
  }
}

function bat_maxHPCost(sk: Skill): number {
  switch (sk) {
    case $skill`Baleful Howl`:
    case $skill`Intimidating Aura`:
    case $skill`Mist Form`:
    case $skill`Sharp Eyes`:
      return 30;
    case $skill`Madness of Untold Aeons`:
      return 25;
    case $skill`Crush`:
    case $skill`Wolf Form`:
    case $skill`Blood Spike`:
    case $skill`Blood Cloak`:
    case $skill`Macabre Cunning`:
    case $skill`Piercing Gaze`:
    case $skill`Ensorcel`:
    case $skill`Flock of Bats Form`:
      return 20;
    case $skill`Ceaseless Snarl`:
    case $skill`Preternatural Strength`:
    case $skill`Blood Chains`:
    case $skill`Sanguine Magnetism`:
    case $skill`Perceive Soul`:
    case $skill`Sinister Charm`:
    case $skill`Batlike Reflexes`:
    case $skill`Spot Weakness`:
      return 15;
    case $skill`Savage Bite`:
    case $skill`[24017]Ferocity`:
    case $skill`Chill of the Tomb`:
    case $skill`Spectral Awareness`:
      return 10;
    case $skill`Flesh Scent`:
    case $skill`Hypnotic Eyes`:
      return 5;
    default:
      return 0;
  }
}

function bat_baseHP(): number {
  return (
    20 * min(23, toInt(getProperty("darkGyfftePoints"))) +
    myBasestat($stat`Muscle`) +
    20
  );
}

function bat_remainingBaseHP(): number {
  let baseHP: number = bat_baseHP();
  for (const sk of $skills.all()) {
    // important that this uses have_skill and not auto_have_skill, as auto_have_skill would
    // report incorrectly if any form intrinsics are active
    if (haveSkill(sk)) {
      baseHP -= bat_maxHPCost(sk);
    }
  }
  return baseHP;
}

function bat_desiredSkills(hpLeft: number): Map<Skill, boolean> {
  const requirements: Map<Skill, boolean> = new Map();
  return bat_desiredSkills$1(hpLeft, requirements);
}

function bat_desiredSkills$1(
  hpLeft: number,
  forcedPicks: Map<Skill, boolean>,
): Map<Skill, boolean> {
  let costSoFar: number = 0;
  const baseHP: number = bat_baseHP();
  const picks: Map<Skill, boolean> = new Map();

  if (getProperty("_auto_bat_bloodBank") !== "2") {
    forcedPicks.set($skill`Intimidating Aura`, true);
  }

  function addPick(sk: Skill): boolean {
    if (picks.has(sk)) {
      return true;
    }
    if (baseHP - costSoFar - bat_maxHPCost(sk) < hpLeft) {
      return false;
    }
    costSoFar += bat_maxHPCost(sk);
    picks.set(sk, true);
    return true;
  }
  for (const sk of forcedPicks.keys()) {
    addPick(sk);
  }
  for (const sk of Skill.get([
    "Chill of the Tomb",
    "Blood Chains",
    "Madness of Untold Aeons",
    "Sinister Charm",
    "Blood Cloak",
    "Baleful Howl",
    "Perceive Soul",
    "Hypnotic Eyes",
    "Ensorcel",
    "Sharp Eyes",
    "Batlike Reflexes",
    "Ceaseless Snarl",
    "Flock of Bats Form",
    "Mist Form",
    "Sanguine Magnetism",
    "Macabre Cunning",
    "[24017]Ferocity",
    "Flesh Scent",
    "Wolf Form",
    "Spot Weakness",
    "Preternatural Strength",
    "Savage Bite",
    "Intimidating Aura",
    "Spectral Awareness",
    "Piercing Gaze",
    "Blood Spike",
  ])) {
    addPick(sk);
  }
  return picks;
}

export function bat_reallyPickSkills(hpLeft: number): void {
  const requiredSkills: Map<Skill, boolean> = new Map();
  bat_reallyPickSkills$1(hpLeft, requiredSkills);
}

export function bat_reallyPickSkills$1(
  hpLeft: number,
  requiredSkills: Map<Skill, boolean>,
): void {
  // Why Astral Spirit? When entering a DG run, before exiting the initial
  // noncombat and Torpor, that's what KoLmafia thinks you are.
  if (!in_darkGyffte() && myClass().toString() !== "Astral Spirit") {
    return;
  }
  // Confirm that we're in Torpor
  visitUrl("campground.php?action=coffin");

  const picks: Map<Skill, boolean> = bat_desiredSkills$1(
    hpLeft,
    requiredSkills,
  );
  let url: string = `choice.php?whichchoice=1342&option=2&pwd=${myHash()}`;
  for (const [sk] of picks) {
    url += "&sk[]=";
    url += (toInt(sk) - 24000).toString();
  }
  visitUrl(url);
  visitUrl(`choice.php?whichchoice=1342&option=1&pwd=${myHash()}`);
  // FIXME: Check that our skill-setting succeeded.
}

function bat_shouldPickSkills(hpLeft: number): boolean {
  const picks: Map<Skill, boolean> = bat_desiredSkills(hpLeft);

  for (const sk of $skills.all()) {
    if (bat_maxHPCost(sk) === 0) {
      continue;
    }

    if (picks.has(sk) !== haveSkill(sk)) {
      auto_log_info(
        `We'd like to make a skill change for ${sk.toString()}, which we ${picks.has(sk) ? "want" : "don't want"} but ${haveSkill(sk) ? "have" : "don't have"}`,
        "blue",
      );
      return true;
    }
  }

  return false;
}

function bat_haveEnsorcelee(): boolean {
  // checks if you have a current Ensorceled Monster
  if (!auto_have_skill($skill`Ensorcel`)) {
    //in case mafia doesn't clear ensorcelee property when you change skills and drop Ensorcel.
    return false;
  }

  return getProperty("ensorcelee") !== "";
}

export function bat_shouldEnsorcel(m: Monster): boolean {
  if (!in_darkGyffte() || !auto_have_skill($skill`Ensorcel`)) {
    return false;
  }
  // until we have a way to tell what we already have as an ensorcelee, just ensorcel goblins
  // to help avoid getting beaten up...
  if (
    monsterPhylum(m) === $phylum`goblin` &&
    !isFreeMonster(m, myLocation()) &&
    !bat_haveEnsorcelee()
  ) {
    //stop wasting additional Ensorcel casts once we already have an Ensorcelee
    return true;
  }
  //TODO code for getting other types of monster (beasts / bugs presumably) where appropriate.

  return false;
}

function bat_creatable_amount(desired: Item): number {
  if (!in_darkGyffte()) {
    return 0;
  }
  if (itemAmount($item`blood bag`) === 0) {
    return 0;
  }

  switch (desired) {
    case $item`bloodstick`:
      if (itemAmount($item`wad of dough`) === 0) {
        pullXWhenHaveY($item`wad of dough`, 1, 0);
      }
      if (itemAmount($item`wad of dough`) === 0) {
        auto_buyUpTo(1, $item`wad of dough`);
      }
      return creatableAmount(desired);
    case $item`blood snowcone`:
      if (itemAmount($item`plain snowcone`) === 0) {
        pullXWhenHaveY($item`plain snowcone`, 1, 0);
      }
      if (itemAmount($item`plain snowcone`) === 0) {
        auto_buyUpTo(1, $item`plain snowcone`);
      }
      return creatableAmount(desired);
    case $item`blood roll-up`:
      if (itemAmount($item`blackberry`) === 0) {
        pullXWhenHaveY($item`blackberry`, 1, 0);
      }
      return creatableAmount(desired);
    case $item`bottle of Sanguiovese`:
      if (itemAmount($item`fermenting powder`) === 0) {
        pullXWhenHaveY($item`fermenting powder`, 1, 0);
      }
      return creatableAmount(desired);
    case $item`mulled blood`:
      if (itemAmount($item`spices`) === 0) {
        pullXWhenHaveY($item`spices`, 1, 0);
      }
      return creatableAmount(desired);
    case $item`Red Russian`:
      if (itemAmount($item`glass of goat's milk`) === 0) {
        pullXWhenHaveY($item`glass of goat's milk`, 1, 0);
      }
      return creatableAmount(desired);
    case $item`actual blood sausage`:
      for (const it of $items`batgut, ratgut`) {
        if (itemAmount(it) === 0) {
          if (pullXWhenHaveY(it, 1, 0)) {
            break;
          }
        }
      }
      return min(
        itemAmount($item`blood bag`),
        total_items(
          new Map([
            [$item`batgut`, true],
            [$item`ratgut`, true],
          ]),
        ),
      );
    case $item`blood-soaked sponge cake`:
      for (const it of $items`gauze garter, filthy poultice`) {
        if (itemAmount(it) === 0) {
          if (pullXWhenHaveY(it, 1, 0)) {
            break;
          }
        }
      }
      return min(
        itemAmount($item`blood bag`),
        total_items(
          new Map([
            [$item`gauze garter`, true],
            [$item`filthy poultice`, true],
          ]),
        ),
      );
    case $item`dusty bottle of blood`:
      for (const it of $items`dusty bottle of Merlot, dusty bottle of Port, dusty bottle of Pinot Noir, dusty bottle of Zinfandel, dusty bottle of Marsala, dusty bottle of Muscat`) {
        if (itemAmount(it) === 0) {
          if (pullXWhenHaveY(it, 1, 0)) {
            break;
          }
        }
      }
      return min(
        itemAmount($item`blood bag`),
        total_items(
          new Map([
            [$item`dusty bottle of Merlot`, true],
            [$item`dusty bottle of Port`, true],
            [$item`dusty bottle of Pinot Noir`, true],
            [$item`dusty bottle of Zinfandel`, true],
            [$item`dusty bottle of Marsala`, true],
            [$item`dusty bottle of Muscat`, true],
          ]),
        ),
      );
    case $item`vampagne`:
      for (const it of $items`carbonated soy milk, Monstar energy beverage`) {
        if (itemAmount(it) === 0) {
          if (pullXWhenHaveY(it, 1, 0)) {
            break;
          }
        }
      }
      return min(
        itemAmount($item`blood bag`),
        total_items(
          new Map([
            [$item`carbonated soy milk`, true],
            [$item`Monstar energy beverage`, true],
          ]),
        ),
      );
  }
  auto_log_warning(`Hmm, ${desired} isn't a Vampyre consumable`, "red");
  return 0;
}

function bat_multicraft(mode: string, options: Map<Item, boolean>): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  if (itemAmount($item`blood bag`) === 0) {
    return false;
  }

  for (const ingredient of options.keys()) {
    if (itemAmount(ingredient) > 0) {
      if (craft(mode, 1, $item`blood bag`, ingredient) > 0) {
        return true;
      }
    }
  }

  return false;
}

function bat_cook(desired: Item): boolean {
  if (!in_darkGyffte()) {
    return false;
  }
  if (itemAmount($item`blood bag`) === 0) {
    return false;
  }

  switch (desired) {
    case $item`bloodstick`:
    case $item`blood snowcone`:
    case $item`blood roll-up`:
    case $item`bottle of Sanguiovese`:
    case $item`mulled blood`:
    case $item`Red Russian`:
      return create(1, desired);
    case $item`actual blood sausage`:
      return bat_multicraft(
        "cook",
        new Map([
          [$item`batgut`, true],
          [$item`ratgut`, true],
        ]),
      );
    case $item`blood-soaked sponge cake`:
      return bat_multicraft(
        "cook",
        new Map([
          [$item`filthy poultice`, true],
          [$item`gauze garter`, true],
        ]),
      );
    case $item`dusty bottle of blood`:
      return bat_multicraft(
        "cocktail",
        new Map([
          [$item`dusty bottle of Merlot`, true],
          [$item`dusty bottle of Port`, true],
          [$item`dusty bottle of Pinot Noir`, true],
          [$item`dusty bottle of Zinfandel`, true],
          [$item`dusty bottle of Marsala`, true],
          [$item`dusty bottle of Muscat`, true],
        ]),
      );
    case $item`vampagne`:
      return bat_multicraft(
        "cocktail",
        new Map([
          [$item`carbonated soy milk`, true],
          [$item`Monstar energy beverage`, true],
        ]),
      );
  }
  auto_log_warning(`Hmm, ${desired} isn't a Vampyre consumable`, "red");
  return false;
}

export function bat_consumption(): boolean {
  if (!in_darkGyffte()) {
    return false;
  }

  if (
    possessOutfit("War Hippy Fatigues") &&
    isAccessible($coinmaster`Dimemaster`)
  ) {
    sell(
      $item`PADL Phone`.buyer,
      itemAmount($item`PADL Phone`),
      $item`PADL Phone`,
    );
    sell(
      $item`red class ring`.buyer,
      itemAmount($item`red class ring`),
      $item`red class ring`,
    );
    sell(
      $item`blue class ring`.buyer,
      itemAmount($item`blue class ring`),
      $item`blue class ring`,
    );
    sell(
      $item`white class ring`.buyer,
      itemAmount($item`white class ring`),
      $item`white class ring`,
    );
  }
  if (
    possessOutfit("Frat Warrior Fatigues") &&
    isAccessible($coinmaster`Quartersmaster`)
  ) {
    sell(
      $item`pink clay bead`.buyer,
      itemAmount($item`pink clay bead`),
      $item`pink clay bead`,
    );
    sell(
      $item`purple clay bead`.buyer,
      itemAmount($item`purple clay bead`),
      $item`purple clay bead`,
    );
    sell(
      $item`green clay bead`.buyer,
      itemAmount($item`green clay bead`),
      $item`green clay bead`,
    );
    sell(
      $item`communications windchimes`.buyer,
      itemAmount($item`communications windchimes`),
      $item`communications windchimes`,
    );
  }

  function consume_first(its: Map<Item, boolean>): boolean {
    for (const it of its.keys()) {
      if (availableAmount(it) === 0) {
        //try to pull it if we don't have any on hand. Preferable to crafting when possible
        pullXWhenHaveY(it, 1, 0);
      }
      if (availableAmount(it) > 0 || bat_creatable_amount(it) > 0) {
        if (availableAmount(it) === 0) {
          bat_cook(it);
        }
        if (it.fullness > 0) {
          autoEat(1, it);
        } else if (it.inebriety > 0) {
          autoDrink(1, it);
        } else if (it.spleen > 0) {
          autoChew(1, it);
        } else {
          auto_log_warning(
            `Woah, I made a ${it} to consume, but you can't consume that?`,
            "red",
          );
          return false;
        }
        return true;
      }
    }
    return false;
  }
  //buy best consumable mats from NPC if we can
  if (auto_warSide() === "fratboy") {
    if (
      fullness_left() > 0 &&
      itemAmount($item`gauze garter`) === 0 &&
      $coinmaster`Quartersmaster`.availableTokens >= 2
    ) {
      cliExecute("make 1 gauze garter");
    }
    if (
      inebriety_left() > 0 &&
      itemAmount($item`Monstar energy beverage`) === 0 &&
      $coinmaster`Quartersmaster`.availableTokens >= 3
    ) {
      cliExecute("make 1 monstar energy beverage");
    }
  } else {
    if (
      fullness_left() > 0 &&
      itemAmount($item`filthy poultice`) === 0 &&
      $coinmaster`Dimemaster`.availableTokens >= 2
    ) {
      cliExecute("make 1 filthy poultice");
    }
    if (
      inebriety_left() > 0 &&
      itemAmount($item`carbonated soy milk`) === 0 &&
      $coinmaster`Dimemaster`.availableTokens >= 3
    ) {
      cliExecute("make 1 carbonated soy milk");
    }
  }

  if (fullness_left() > 0) {
    pullXWhenHaveY($item`dieting pill`, 1, 0);
  }

  if (
    myLevel() >= 7 &&
    spleen_left() >= 3 &&
    fullness_left() >= 2 &&
    itemAmount($item`dieting pill`) > 0 &&
    (itemAmount($item`blood-soaked sponge cake`) > 0 ||
      bat_creatable_amount($item`blood-soaked sponge cake`) > 0)
  ) {
    if (itemAmount($item`blood-soaked sponge cake`) === 0) {
      bat_cook($item`blood-soaked sponge cake`);
    }
    if (itemAmount($item`blood-soaked sponge cake`) > 0) {
      autoChew(1, $item`dieting pill`);
      autoEat(1, $item`blood-soaked sponge cake`);
      return true;
    }
  }
  // attempt to fill organs with best consumables all the time, don't wait to be at low adventure count
  if (inebriety_left() > 0) {
    if (consume_first(new Map([[$item`vampagne`, true]]))) {
      return true;
    }
  }
  if (fullness_left() > 0) {
    if (consume_first(new Map([[$item`blood-soaked sponge cake`, true]]))) {
      return true;
    }
  }

  if (myAdventures() <= 8) {
    // if both organs have space, prioritize high value items instead of the usual booze before food algorithm
    // don't auto consume bottle of Sanguiovese or bloodstick unless we're down to one adventure
    if (inebriety_left() > 0 && fullness_left() > 0) {
      if (
        consume_first(
          new Map([
            [$item`vampagne`, true],
            [$item`blood-soaked sponge cake`, true],
            [$item`dusty bottle of blood`, true],
            [$item`blood roll-up`, true],
            [$item`Red Russian`, true],
            [$item`blood snowcone`, true],
            [$item`mulled blood`, true],
            [$item`actual blood sausage`, true],
          ]),
        )
      ) {
        return true;
      }
    } else if (inebriety_left() > 0) {
      if (
        consume_first(
          new Map([
            [$item`vampagne`, true],
            [$item`dusty bottle of blood`, true],
            [$item`Red Russian`, true],
            [$item`mulled blood`, true],
          ]),
        )
      ) {
        return true;
      }
    } else if (fullness_left() > 0) {
      if (
        consume_first(
          new Map([
            [$item`blood-soaked sponge cake`, true],
            [$item`blood roll-up`, true],
            [$item`blood snowcone`, true],
            [$item`actual blood sausage`, true],
          ]),
        )
      ) {
        return true;
      }
    }
  }

  if (myAdventures() <= 1) {
    if (fullness_left() > 0) {
      if (consume_first(new Map([[$item`bloodstick`, true]]))) {
        return true;
      }
    }
    if (inebriety_left() > 0) {
      if (consume_first(new Map([[$item`bottle of Sanguiovese`, true]]))) {
        return true;
      }
    }
  }

  return true;
}

export function bat_skillValid(sk: Skill): boolean {
  if (
    $skills`Savage Bite, Crush, Baleful Howl, Ceaseless Snarl`.includes(sk) &&
    haveEffect($effect`Bats Form`) + haveEffect($effect`Mist Form`) > 0
  ) {
    return false;
  }

  if (
    $skills`Blood Spike, Blood Chains, Chill of the Tomb, Blood Cloak`.includes(
      sk,
    ) &&
    haveEffect($effect`Wolf Form`) + haveEffect($effect`Bats Form`) > 0
  ) {
    return false;
  }

  if (
    $skills`Piercing Gaze, Perceive Soul, Ensorcel, Spectral Awareness`.includes(
      sk,
    ) &&
    haveEffect($effect`Wolf Form`) + haveEffect($effect`Mist Form`) > 0
  ) {
    return false;
  }

  if (mpCost(sk) > 0 && in_darkGyffte()) {
    return false;
  }

  return true;
}

function bat_tryBloodBank(): boolean {
  const bloodBank: number = toInt(getProperty("_auto_bat_bloodBank"));
  if (
    bloodBank === 0 ||
    (bloodBank === 1 && haveSkill($skill`Intimidating Aura`))
  ) {
    visitUrl("place.php?whichplace=town_right&action=town_bloodbank");
    setProperty(
      "_auto_bat_bloodBank",
      haveSkill($skill`Intimidating Aura`) ? (2).toString() : (1).toString(),
    );
    return true;
  }

  return false;
}

export function LM_batpath(): boolean {
  if (!in_darkGyffte()) {
    return false;
  }

  if (bat_remainingBaseHP() >= 70 && bat_shouldPickSkills(20)) {
    auto_log_info("Let's swap out some skills", "blue");
    bat_reallyPickSkills(20);
    return true;
  }
  bat_tryBloodBank();
  return false;
}
