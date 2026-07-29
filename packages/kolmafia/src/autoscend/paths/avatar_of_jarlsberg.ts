import {
  create,
  getProperty,
  haveSkill,
  itemAmount,
  mpCost,
  myCompanion,
  myLevel,
  myMp,
  myPath,
  setProperty,
  toBoolean,
  toInt,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $item, $path, $skill, $skills } from "libram";

import { auto_have_skill, auto_log_info } from "../auto_util";
import { QuestTask, registerQuestTask } from "../engine/engine";
import { AshMatcher } from "../utils/kolmafiaUtils";
import { avatarStandardInitializeDay } from "./avatar_of_boris";

//Defined in autoscend/paths/avatar_of_jarlsberg.ash
export function is_jarlsberg(): boolean {
  return myPath() === $path`Avatar of Jarlsberg`;
}

export function jarlsberg_initializeSettings(): void {
  if (is_jarlsberg()) {
    auto_log_info("Initializing Avatar of Jarlsberg settings", "blue");
    setProperty("auto_wandOfNagamar", false.toString());
  }
}

export function jarlsberg_initializeDay(day: number): void {
  if (!is_jarlsberg()) {
    return;
  }
  avatarStandardInitializeDay(day);
}

export function jarlsberg_buySkills(): void {
  //Not certain of Skill Priority Order. Current is a good start, will see how it goes.
  if (!is_jarlsberg()) {
    return;
  }
  if (myLevel() <= toInt(getProperty("_auto_jarlsbergSkills"))) {
    return;
  }
  if (toBoolean(getProperty("_auto_completedJarlsbergSkillTree"))) {
    //Prevent us from running through the full list of skills checks more than once per day if we already have all skills
    return;
  }

  const page: string = visitUrl("da.php?place=gate2");
  const my_skillPoints: AshMatcher = new AshMatcher("(\\d+) skill point", page);
  if (my_skillPoints.find()) {
    let skillPoints: number = toInt(my_skillPoints.group(1));
    auto_log_info(`Skill points found: ${skillPoints}`);

    while (skillPoints > 0) {
      skillPoints = skillPoints - 1;
      let skillid: number = 0;
      //skills are listed in reverse order. from last to first to buy..

      for (const sk of $skills`Radish Horse, Working Lunch, Gristlesphere, Oilsphere, Coffeesphere, Chocolatesphere, Cream Puff, Blend, Nightcap, Conjure Cream, Early Riser, Fry, Conjure Dough, Lunch Like a King, Slice, Conjure Cheese, Egg Man, Conjure Eggs, Food Coma, Chop, Grill, Best Served Cold, Never Late for Dinner, Conjure Meat Product, Conjure Vegetables, Hippotatomous, Conjure Potato, Bake, Freeze, Conjure Fruit, The Most Important Meal, Boil`) {
        if (!haveSkill(sk)) {
          skillid = toInt(sk);
        }
      }

      if (skillid !== 0) {
        visitUrl(`jarlskills.php?action=getskill&getskid=${skillid}`);
      } else {
        setProperty("_auto_completedJarlsbergSkillTree", true.toString());
        return;
      }
    }
  }

  setProperty("_auto_jarlsbergSkills", myLevel().toString());
}

function LM_jarlsbergDo(): boolean {
  jarlsberg_buySkills();
  // Use egg man for drops
  if (
    auto_have_skill($skill`Egg Man`) &&
    mpCost($skill`Egg Man`) <= myMp() &&
    itemAmount($item`cosmic egg`) > 0 &&
    myCompanion() === ""
  ) {
    useSkill(1, $skill`Egg Man`);
  }

  if (!toBoolean(getProperty("_cosmicSixPackConjured"))) {
    create(1, $item`cosmic six-pack`);
  }

  return false;
}

export const LM_jarlsbergTask: QuestTask = registerQuestTask({
  name: "LM_jarlsberg",
  //this function is called early once every loop of doTasks() in autoscend.ash
  //if something in this function returns true then it will restart the loop and get called again.
  completed: () => !is_jarlsberg(),
  ready: () => true,
  do: LM_jarlsbergDo,
});
