import {
  abort,
  Effect,
  floor,
  getProperty,
  haveEffect,
  haveSkill,
  Item,
  itemAmount,
  min,
  myBuffedstat,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMp,
  myPath,
  numericModifier,
  Path,
  setProperty,
  Skill,
  Stat,
  toInt,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { acquireHermitItem, pullXWhenHaveY } from "../auto_acquire";
import { autoForceEquip$3, equipBaseline } from "../auto_equipment";
import { acquireMP$1 } from "../auto_restore";
import {
  auto_change_mcd,
  auto_have_skill,
  auto_log_info,
  auto_log_info$1,
  ovenHandle,
} from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_boris.ash
export function is_boris(): boolean {
  return myPath() === Path.get("Avatar of Boris");
}

export function borisTrusty(): void {
  //the only time boris wants to take off trusty is if it is bedtime and he wants to wear a halo. Which is unaffected by this
  if (!is_boris()) {
    return;
  }
  autoForceEquip$3(Item.get("Trusty")); //ensure we have trusty equipped
}

export function borisAdjustML(): boolean {
  //set target ML boosts for boris.
  if (!is_boris()) {
    return false;
  }

  if (myBuffedstat(Stat.get("Muscle")) < 30) {
    return auto_change_mcd(0);
  }

  const strong: boolean = auto_have_skill(Skill.get("Barrel Chested"));

  if (!strong) {
    auto_change_mcd(0);
  } else {
    auto_change_mcd(11);
  }
  //Overconfident is an intrinsic +30 ML. By the time you are strong enough to use it it can be turned on and left on
  if (
    strong &&
    myBuffedstat(Stat.get("Muscle")) > 100 &&
    haveSkill(Skill.get("Pep Talk")) &&
    haveEffect(Effect.get("Overconfident")) === 0
  ) {
    useSkill(1, Skill.get("Pep Talk"));
  }

  return true;
}

export function boris_initializeSettings(): void {
  if (is_boris()) {
    auto_log_info("Initializing Avatar of Boris settings", "blue");
    setProperty("auto_borisSkills", (-1).toString());
    setProperty("auto_wandOfNagamar", false.toString());
    // Mafia r16876 does not see the Boris Helms in storage and will not pull them.
    // We have to force the issue.
    let temp: string = visitUrl(
      "storage.php?action=pull&whichitem1=5648&howmany1=1&pwd",
    );
    temp = visitUrl("storage.php?action=pull&whichitem1=5650&howmany1=1&pwd");
  }
}

export function boris_initializeDay(day: number): void {
  if (!is_boris()) {
    return;
  }
  if (day === 2) {
    equipBaseline();
    ovenHandle();

    if (toInt(getProperty("auto_day_init")) < 2) {
      if (itemAmount(Item.get("gym membership card")) > 0) {
        use(1, Item.get("gym membership card"));
      }

      if (itemAmount(Item.get("seal tooth")) === 0) {
        acquireHermitItem(Item.get("seal tooth"));
      }
      while (acquireHermitItem(Item.get("11-leaf clover"))) {}
      pullXWhenHaveY(Item.get("Hand in Glove"), 1, 0);
      pullXWhenHaveY(Item.get("blackberry galoshes"), 1, 0);
    }
  } else if (day === 3) {
    if (toInt(getProperty("auto_day_init")) < 3) {
      while (acquireHermitItem(Item.get("11-leaf clover"))) {}
      setProperty("auto_day_init", (3).toString());
    }
  } else if (day === 4) {
    if (toInt(getProperty("auto_day_init")) < 4) {
      while (acquireHermitItem(Item.get("11-leaf clover"))) {}
      setProperty("auto_day_init", (4).toString());
    }
  }
}

export function boris_buySkills(): void {
  if (!is_boris()) {
    return;
  }
  if (myLevel() <= toInt(getProperty("auto_borisSkills"))) {
    return;
  }
  //if you have these 3 skills then you have all skills
  if (
    haveSkill(Skill.get("Bifurcating Blow")) &&
    haveSkill(Skill.get("Banishing Shout")) &&
    haveSkill(Skill.get("Gourmand"))
  ) {
    return;
  }

  let possBorisPoints: number = 0;

  const page: string = visitUrl("da.php?place=gate1");
  const my_skillPoints: AshMatcher = new AshMatcher(
    "You can learn (\\d+) more skill",
    page,
  );
  if (my_skillPoints.find()) {
    let skillPoints: number = toInt(my_skillPoints.group(1));
    auto_log_info$1(`Skill points found: ${skillPoints}`);
    possBorisPoints = skillPoints - 1;

    while (skillPoints > 0) {
      skillPoints = skillPoints - 1;
      let tree: number = 1;
      //skills are listed in reverse order. from last to first to buy.
      //Correct Boris strat is super easy. get all feasting, then all shouting, then fighting last.
      if (!haveSkill(Skill.get("Bifurcating Blow"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Legendary Impatience"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Song of Cockiness"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Legendary Luck"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Throw Trusty"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Pep Talk"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Sick Pythons"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Broadside"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("[11002]Ferocity"))) {
        tree = 1;
      }
      if (!haveSkill(Skill.get("Cleave"))) {
        tree = 1;
      }

      if (!haveSkill(Skill.get("Banishing Shout"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Song of Battle"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Louder Bellows"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Song of Fortune"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Good Singing Voice"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Song of Solitude"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Big Lungs"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Song of Accompaniment"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Legendary Bravado"))) {
        tree = 2;
      }
      if (!haveSkill(Skill.get("Intimidating Bellow"))) {
        tree = 2;
      }

      if (!haveSkill(Skill.get("Gourmand"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Barrel Chested"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("More to Love"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Hungry Eyes"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Heroic Belch"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Legendary Appetite"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Big Boned"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Song of the Glorious Lunch"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Legendary Girth"))) {
        tree = 3;
      }
      if (!haveSkill(Skill.get("Demand Sandwich"))) {
        tree = 3;
      }

      visitUrl(`da.php?pwd&whichtree=${tree}&action=borisskill`);
    }
  }

  setProperty("auto_borisSkills", myLevel().toString());
}

export function borisDemandSandwich(immediately: boolean): boolean {
  //Boris can summon a sandwich 3 times per day at cost of 5 MP each
  if (!is_boris()) {
    return false;
  }
  if (toInt(getProperty("_demandSandwich")) > 2) {
    //max 3 uses a day
    return false;
  }
  if (myMaxmp() < 5) {
    //can't cast even a single time
    return false;
  }

  function remainingDaily(): number {
    return 3 - toInt(getProperty("_demandSandwich"));
  }
  //if can get best sandwich and is forced to get them all now. use ongoing MP regen to get best sandwich
  if (!immediately && myLevel() > 8) {
    const cast_count: number = min(remainingDaily(), floor(myMp() / 5));
    if (cast_count > 0) {
      return useSkill(cast_count, Skill.get("Demand Sandwich"));
    }
  }
  //if we are forced to get them all right now then we don't care about level nor MP regen. We will restore MP as needed.
  if (immediately) {
    const total_cost: number = remainingDaily() * 5;
    if (myMaxmp() >= total_cost) {
      if (myMp() < total_cost && !acquireMP$1(total_cost)) {
        //can't afford it AND failed to restore
        abort(
          "failed to acquire the MP needed to cast [Demand Sandwich], aborting to prevent diet mishap",
        );
      }
      return useSkill(remainingDaily(), Skill.get("Demand Sandwich"));
    } else {
      while (remainingDaily() > 0) {
        if (acquireMP$1(5)) {
          useSkill(remainingDaily(), Skill.get("Demand Sandwich"));
        } else {
          abort(
            "failed to acquire the MP needed to cast [Demand Sandwich], aborting to prevent diet mishap",
          );
        }
      }
    }
  }

  return false;
}

export function borisWastedMP(): void {
  //Check for wasted MP regeneration and use it up. primarily called towards the end of auto_pre_adv.ash
  //Mostly the MP regen would come from clancy
  if (!is_boris()) {
    return;
  }

  const max_potential_mp_regen: number = numericModifier("MP Regen Max");
  const missing_mp: number = myMaxmp() - myMp();
  let potential_mp_wasted: number = 0;
  if (max_potential_mp_regen > missing_mp) {
    potential_mp_wasted = max_potential_mp_regen - missing_mp;
  }
  //Laugh it off costs 1 MP to cast and gives either 1 or 2 HP randomly.
  while (myHp() < myMaxhp() && potential_mp_wasted > 0) {
    //multi use without risking wastage. Need to loop a few times because we can't predict what we actually roll for healing.
    const missingHP: number = myMaxhp() - myHp();
    let castAmount: number = toInt(min(potential_mp_wasted, missingHP / 2));
    //at exactly 1 HP missing there is a 50% chance of wasting 1 point of HP healed. Better than 100% chance of wasting MP though, so do it.
    //also this prevents an infinite loop at 1HP missing. Keep that in mind if you remove this
    if (missingHP === 1) {
      castAmount = 1;
    }

    potential_mp_wasted = potential_mp_wasted - castAmount;
    useSkill(castAmount, Skill.get("Laugh It Off"));
  }
}

export function borisAcquireHP(goal: number): boolean {
  //boris cannot use the normal acquireHP function until it is modified allow multi using skills.
  //that fix is nontrivial so until such a change is made here is a function that makes boris playable
  if (!is_boris()) {
    return false;
  }
  //Laugh it off costs 1 MP to cast and gives either 1 or 2 HP randomly. it is the primary way to restore HP as boris. MP is restored as normal
  //At the moment HP restore items are simply not used for boris. instead MP restorers are used which are then converted into HP using laugh it off. as stated before this is a bandaid until main restoration function can be fixed to handle multicast. also 99% of the HP you will be restoring in boris would be done via laugh it off anyways.
  while (myHp() < goal) {
    //we need to loop a few times because our MP tank might be too small to allow us to fully heal in one go. also to prevent wasteage we calculate as if we would get max rolls instead of avg rolls on healed amount when multi casting.
    const missingHP: number = goal - myHp();
    let failed_acquireMP: boolean = myMaxmp() < 11;
    let castAmount: number = missingHP / 2;
    if (missingHP === 1) {
      //at 1 HP less than maxHP there is a 50% chance of wasting 1 point of HP healed. a risk worth taking to achieve target HP.
      castAmount = 1; //prevents an infinite loop at 1HP missing. since int 1 divided by 2 = 0
    }
    const mp_desired: number = toInt(min(castAmount, 0.9 * myMaxmp()));
    if (myMp() < mp_desired && myMaxmp() > 10) {
      //if maxMP is too low. do not wastefully try restoring it.
      //I do not have enough MP to cast as many laugh it off as I would like
      if (!acquireMP$1(mp_desired)) {
        //try to acquireMP to target. if we already have it acquireMP will just return true.
        failed_acquireMP = true;
      }
    }
    castAmount = min(myMp(), castAmount); //regardless of MP restore success or failure. we can not spend MP we do not have

    if (myMp() === 0) {
      //if I reached this point with no MP I am done
      break;
    }
    useSkill(castAmount, Skill.get("Laugh It Off")); //multi restore HP
    if (failed_acquireMP) {
      //MP restore failed so we are done.
      break;
    }
    if (goal > myMaxhp()) {
      //just in case to prevent infinite loop
      break;
    }
  }
  return goal >= myHp(); //match acquireHP() function
}

export function LM_boris(): boolean {
  //this function is called early once every loop of doTasks() in autoscend.ash
  //if something in this function returns true then it will restart the loop and get called again.

  if (!is_boris()) {
    return false;
  }

  borisDemandSandwich(false);
  boris_buySkills();

  return false;
}
