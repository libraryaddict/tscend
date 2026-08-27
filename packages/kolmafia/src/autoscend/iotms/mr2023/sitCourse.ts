import {
  handlingChoice,
  haveSkill,
  Item,
  itemAmount,
  lastChoice,
  myHash,
  myLevel,
  visitUrl,
} from "kolmafia";
import { $skill, get } from "libram";

import { handleChoiceAdv } from "../../auto_choice_adv";
import { auto_is_valid } from "../../auto_util";

let $_auto_haveSITCourse_sitCourse: Item | undefined;

function auto_haveSITCourse(): boolean {
  $_auto_haveSITCourse_sitCourse ??= Item.get(
    "S.I.T. Course Completion Certificate",
  );
  return (
    auto_is_valid($_auto_haveSITCourse_sitCourse) &&
    itemAmount($_auto_haveSITCourse_sitCourse) > 0
  );
}

export function auto_SITCourse(): void {
  if (!auto_haveSITCourse()) {
    return;
  }
  //Get cryptobotanist if under level 8 or switch to insectologist if possible
  if (
    (myLevel() < 8 && !haveSkill($skill`Cryptobotanist`)) ||
    (!get("_sitCourseCompleted") &&
      myLevel() >= 8 &&
      !haveSkill($skill`Insectologist`))
  ) {
    // use() aborts the whole script with "Unsupported choice adventure #1494"
    // since this redirects straight into choice.php; visitUrl() bypasses that and
    // lets the real choice dispatcher handle it instead.
    const sitCourseText = visitUrl(
      `inv_use.php?pwd=${myHash()}&which=3&whichitem=${Item.get("S.I.T. Course Completion Certificate").id}`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), sitCourseText);
    }
    return;
  }
}
