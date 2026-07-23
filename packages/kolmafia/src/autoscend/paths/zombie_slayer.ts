import {
  ceil,
  containsText,
  Familiar,
  floor,
  fullnessLimit,
  haveEffect,
  itemAmount,
  max,
  min,
  mpCost,
  myFullness,
  myHp,
  myId,
  myMaxhp,
  myMeat,
  myMp,
  myPath,
  setProperty,
  toFloat,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $path, $skill } from "libram";

import { autoEat } from "../auto_consume";
import {
  auto_have_skill,
  internalQuestStatus,
  meatReserve,
} from "../auto_util";

// TODO: Visit hermit.php for free (10-leaf) clover _zombieClover
// DONE: buffs
// * Summon Minion (with Summon Horde): Waking the Dead +20% combat - Added to auto_providers.ash & auto_buff.ash
// * Scavenge: Scavengers Scavenging +20% item - added to auto_buff.ash and auto_post_adv.ash
// * Ag-grave-ation: Zomg WTF +30 ml - added to auto_buff.ash & auto_util.ash
// * Disquiet Riot: Disquiet Riot  -20% combat - Added to auto_providers.ash & auto_buff.ash
// * Zombie Chow: Chow Downed +5 Familiar Weight - added to auto_buff.ash and auto_post_adv.ash
// DONE: Banish -  added to auto_combat_util.ash
// TODO - track that it can banish 3 at once
// * Howl of the Alpha: 3 banishes at a time
// TODO: Pickpocket - added to round 4 as a standard thing
// * Smash & Graaagh: 30x day, no mafia pref.
// * ?? Handle like a single use XO Skeleton Hugs and Kisses
// TODO: Bear Hug
// * Force equip both to use on group monsters

//Defined in autoscend/paths/zombie_slayer.ash
export function in_zombieSlayer(): boolean {
  return myPath() === $path`Zombie Slayer`;
}

export function zombieSlayer_initializeSettings(): void {
  if (in_zombieSlayer()) {
    // No Naughty Sorceress so no need for a wand.
    setProperty("auto_wandOfNagamar", false.toString());
  }
}

let last_zombie_fullness: number = -1;
export function zombieSlayer_buySkills(): boolean {
  if (!in_zombieSlayer()) {
    return false;
  }

  if (
    auto_have_skill($skill`Ravenous Pounce`) &&
    auto_have_skill($skill`Howl of the Alpha`) &&
    auto_have_skill($skill`Zombie Maestro`)
  ) {
    return false;
  }
  // Don't check again unless fullness has changed (maybe a hunter brain was eaten)
  if (last_zombie_fullness === myFullness()) {
    return false;
  }

  last_zombie_fullness = myFullness();

  let page: string = visitUrl("campground.php?action=grave");
  const bought: number = 0;

  while (containsText(page, "Focus on Hunger")) {
    page = visitUrl(
      "campground.php?whichtree=Hunger&preaction=zombieskill&value=Focus on Hunger",
    );
  }

  while (containsText(page, "Focus on Anger")) {
    page = visitUrl(
      "campground.php?whichtree=Anger&preaction=zombieskill&value=Focus on Anger",
    );
  }

  while (containsText(page, "Focus on Master")) {
    page = visitUrl(
      "campground.php?whichtree=Master&preaction=zombieskill&value=Focus on Master",
    );
  }

  return bought !== 0;
}

function lureMinions(target: number): boolean {
  if (!in_zombieSlayer() || !auto_have_skill($skill`Lure Minions`)) {
    return false;
  }

  if (myMp() >= target) {
    return true;
  }
  // borrowed from Universal Recovery

  let brains_needed: number =
    fullnessLimit() - myFullness() + ceil(fullnessLimit() / 2);
  function check_brains(brains: number): number {
    if (brains_needed === 0) {
      return brains;
    }
    const temp: number = max(brains - brains_needed, 0);
    brains_needed = max(brains_needed - brains, 0);
    return temp;
  }
  let exchanged: boolean = false;
  function lure(x: number, type_1: number): boolean {
    // type is both choice and number of minions per brain, up to 3.
    // How many times do I do this to reach target?
    x = min(ceil(toFloat(target - myMp()) / type_1), x);
    //if(Verbosity > 2) print("Using "+x+" brains of level "+ type);
    if (x > 0) {
      if (!exchanged) {
        // Start choice adventure first time only
        visitUrl(
          `runskillz.php?action=Skillz&whichskill=12002&pwd&quantity=1&targetplayer=${myId()}`,
        );
      }
      visitUrl(`choice.php?pwd&whichchoice=599&option=${type_1}&quantity=${x}`);
      exchanged = true;
    }
    return myMp() >= target;
  }

  check_brains(itemAmount($item`hunter brain`));
  check_brains(itemAmount($item`boss brain`));
  // Count hunter and boss brains, but do not trade them, so number need not be remembered
  const spare_good: number = check_brains(itemAmount($item`good brain`));
  const spare_decent: number = check_brains(itemAmount($item`decent brain`));
  const spare_crappy: number = check_brains(itemAmount($item`crappy brain`));
  // Reserve them in order from best to worst. Then trade them worst first. Stop once one returns true.
  if (lure(spare_crappy, 1) || lure(spare_decent, 2) || lure(spare_good, 3)) {
  }
  // Finish choice adventure if started
  if (exchanged) {
    visitUrl("choice.php?pwd&whichchoice=599&option=5");
  }

  return myHp() >= target;
}

function summonMinions(target: number, meat_reserve: number): boolean {
  if (!in_zombieSlayer() || !auto_have_skill($skill`Summon Minion`)) {
    return false;
  }

  if (myMp() >= target) {
    return true;
  }
  // borrowed from Universal Recovery

  let x: number = target - myMp();
  // Never use Summon Minion if you have Summon Horde because +20% combats could cause trouble
  if (auto_have_skill($skill`Summon Horde`)) {
    x = ceil(x / 12.0);
    x = min((myMeat() - meat_reserve) / 1000, x);
    //if(Verbosity > 2) print("Summoning a horde "+ x+" times");
    if (x > 0) {
      visitUrl(
        `runskillz.php?action=Skillz&whichskill=12026&pwd&quantity=1&targetplayer=${myId()}`,
      );
      for (
        let cast = 1,
          _last_5 = x,
          _step_5 = 1,
          _up_5 = cast <= _last_5,
          _inc_5 = _up_5 ? Math.abs(_step_5) : -Math.abs(_step_5);
        _up_5 ? cast <= _last_5 : cast >= _last_5;
        cast += _inc_5
      ) {
        visitUrl("choice.php?pwd&whichchoice=601&option=1");
      }
      visitUrl("choice.php?pwd&whichchoice=601&option=2");
    }
  } else {
    x = min((myMeat() - meat_reserve) / 100, x);
    //if(Verbosity > 2) print("Summoning "+x+" minions");
    if (x > 0) {
      visitUrl(
        `runskillz.php?action=Skillz&whichskill=12021&pwd&quantity=1&targetplayer=${myId()}`,
      );
      visitUrl(`choice.php?pwd&whichchoice=600&option=1&quantity=${x}`);
      visitUrl("choice.php?pwd&whichchoice=600&option=2");
    }
  }

  return myHp() >= target;
}

export function zombieSlayer_acquireMP(
  goal: number,
  meat_reserve: number = meatReserve(),
): boolean {
  if (!in_zombieSlayer()) {
    return false;
  }

  if (myMp() >= goal) {
    return true;
  }

  return lureMinions(goal) || summonMinions(goal, meat_reserve);
}

export function zombieSlayer_acquireHP(goal: number): boolean {
  if (!in_zombieSlayer()) {
    return false;
  }

  if (myHp() >= goal) {
    return true;
  }

  let missingHP: number = goal - myHp();
  // Devour Minions if you need at least 4 casts of Bite Minion or if doing the Hidden Apartment Building
  if (auto_have_skill($skill`Devour Minions`)) {
    while (
      (missingHP > floor(myMaxhp() * 0.3) ||
        ((haveEffect($effect`Thrice-Cursed`) > 0 ||
          haveEffect($effect`Twice-Cursed`) > 0 ||
          haveEffect($effect`Once-Cursed`) > 0) &&
          !(
            internalQuestStatus("questL11Curses") > 1 ||
            itemAmount($item`moss-covered stone sphere`) > 0
          ))) &&
      zombieSlayer_acquireMP(mpCost($skill`Devour Minions`))
    ) {
      useSkill(1, $skill`Devour Minions`);
      if (myHp() >= goal) {
        break;
      }
      if (missingHP === goal - myHp()) {
        // Failed
        break;
      }
      missingHP = goal - myHp();
    }
    missingHP = goal - myHp();
  }

  if (auto_have_skill($skill`Bite Minion`)) {
    while (
      missingHP > 0 &&
      zombieSlayer_acquireMP(mpCost($skill`Bite Minion`))
    ) {
      useSkill(1, $skill`Bite Minion`);
      if (myHp() >= goal) {
        break;
      }
      if (missingHP === goal - myHp()) {
        // Failed
        break;
      }
      missingHP = goal - myHp();
    }
  }

  return myHp() >= goal;
}

export function zombieSlayer_usable(fam: Familiar): boolean {
  if (!in_zombieSlayer()) {
    return true;
  }
  return containsText(fam.attributes, "undead");
}

export function LM_zombieSlayer(): boolean {
  //this function is called early once every loop of doTasks() in autoscend.ash
  //if something in this function returns true then it will restart the loop and get called again.

  if (!in_zombieSlayer()) {
    return false;
  }

  while (
    itemAmount($item`hunter brain`) > 0 &&
    myFullness() < fullnessLimit()
  ) {
    autoEat(
      min(itemAmount($item`hunter brain`), fullnessLimit() - myFullness()),
      $item`hunter brain`,
    );
  }

  zombieSlayer_buySkills();

  return false;
}
