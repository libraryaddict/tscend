import {
  Class,
  Familiar,
  getProperty,
  Monster,
  myClass,
  myFamiliar,
  myMp,
  myPrimestat,
  Skill,
  Stat,
  toInt,
} from "kolmafia";
import { auto_have_skill, stunnable } from "../auto_util";
import {
  canSurvive$1,
  canUse$2,
  combat_status_add,
  combat_status_check,
  useSkill$1,
} from "./auto_combat_util";
import { in_glover } from "../paths/g_lover";

//2012 iotm and ioty handling

//defined in /autoscend/combat/auto_combat_mr2012.ash
export function auto_combat_nanorhinoBuff(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  //nanorhino familiar buff acquisition. Must be the first action taken in combat.
  //done after puzzle bosses. if puzzle bosses get a random buff that is ok, we would rather beat the puzzle boss.
  if (
    myFamiliar() !== Familiar.get("Nanorhino") ||
    combat_status_check("nanorhino_buffed")
  ) {
    return "";
  }
  if (toInt(getProperty("_nanorhinoCharge")) < 100) {
    return "";
  }

  let target: Skill = Skill.none;
  let target_mark: boolean = false;

  switch (myPrimestat()) {
    case Stat.get("Muscle"): //get [Nanobrawny]: Muscle +25%, Weapon Damage +10, Regenerate 4-8 HP per Adventure
      if (
        target === Skill.none &&
        in_glover() &&
        canUse$2(Skill.get("Lunge Smack")) &&
        canSurvive$1(4.0)
      ) {
        target = Skill.get("Lunge Smack");
      }
      if (target === Skill.none && canUse$2(Skill.get("Shell Up"))) {
        target = Skill.get("Shell Up"); //6MP. bonus based on blessing. blocks enemy this round even if they are immune to stagger
      }
      if (
        target === Skill.none &&
        stunnable(enemy) &&
        canUse$2(Skill.get("Club Foot")) &&
        myClass() === Class.get("Seal Clubber") &&
        myMp() > 25
      ) {
        target = Skill.get("Club Foot"); //8MP. 3-5 enemy defense debuff. seal clubbers also stuns enemy
      }
      if (target === Skill.none && canSurvive$1(4.0)) {
        //choose the cheapest skill available
        for (const sk of Skill.get([
          "Toss",
          "Clobber",
          "Lunge Smack",
          "Thrust-Smack",
          "Headbutt",
          "Kneebutt",
          "Lunging Thrust-Smack",
          "Club Foot",
          "Shieldbutt",
          "Spirit Snap",
          "Cavalcade of Fury",
          "Northern Explosion",
          "Spectral Snapper",
        ])) {
          if (canUse$2(sk)) {
            target = sk;
          }
        }
      }
      break;
    case Stat.get("Mysticality"): //get [Nanobrainy]: Mysticality +50%, Spell Damage +20, Regenerate 2-4 MP per Adventure
      //TODO
      break;
    case Stat.get("Moxie"): //get [Nanoballsy]: Moxie +25%, +20% Combat Initiative, +30% Pickpocket Chance
      if (
        target === Skill.none &&
        myClass() === Class.get("Disco Bandit") &&
        auto_have_skill(Skill.get("Disco State of Mind")) &&
        auto_have_skill(Skill.get("Flashy Dancer")) &&
        stunnable(enemy)
      ) {
        //disco bandits can stun with a dance. and generally benefit from dancing
        for (const sk of Skill.get([
          "Disco Dance of Doom",
          "Disco Dance II: Electric Boogaloo",
          "Disco Dance 3: Back in the Habit",
        ])) {
          if (canUse$2(sk)) {
            target = sk;
          }
        }
      }
      if (target === Skill.none && canUse$2(Skill.get("Accordion Bash"))) {
        //stunner that deals no damage
        target = Skill.get("Accordion Bash");
        target_mark = true;
      }
      if (!canSurvive$1(4.0)) {
        break; //too risky to continue
      }
      if (target === Skill.none && canUse$2(Skill.get("Cadenza"))) {
        target = Skill.get("Cadenza"); //costs 0MP.
        target_mark = true;
      }
      if (target === Skill.none) {
        //choose the cheapest skill available
        for (const sk of Skill.get([
          "Sing",
          "Suckerpunch",
          "Disco Eye-Poke",
          "Dissonant Riff",
        ])) {
          if (canUse$2(sk)) {
            target = sk;
          }
        }
      }
      break;
  }
  //regardless of whether we found a suitable skill or not, we only want to try once per combat.
  combat_status_add("nanorhino_buffed");
  if (target !== Skill.none) {
    return useSkill$1(target, target_mark);
  }
  return "";
}
