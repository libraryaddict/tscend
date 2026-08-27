import { haveSkill } from "kolmafia";
import { $skill, get } from "libram";

import { auto_is_valid$2 } from "../../auto_util";

export function haveEmotionChipSkills(): boolean {
  return (
    (auto_is_valid$2($skill`Emotionally Chipped`) &&
      haveSkill($skill`Emotionally Chipped`)) ||
    (auto_is_valid$2($skill`Replica Emotionally Chipped`) &&
      haveSkill($skill`Replica Emotionally Chipped`))
  );
}

export function canFeelEnvy(): boolean {
  // Combat Skill - Forces drops like Spooky Jelly (doesn't insta-kill though, still need to win combat)
  if (!auto_is_valid$2($skill`Feel Envy`)) {
    return false;
  }
  return haveEmotionChipSkills() && get("_feelEnvyUsed") < 3;
}

export function canFeelHatred(): boolean {
  // Combat Skill - 50 turn banish (doesn't cost a turn)
  if (!auto_is_valid$2($skill`Feel Hatred`)) {
    return false;
  }
  return haveEmotionChipSkills() && get("_feelHatredUsed") < 3;
}
