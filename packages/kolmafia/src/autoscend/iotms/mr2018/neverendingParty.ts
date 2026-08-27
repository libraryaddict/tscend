import { Effect, haveEffect, myPrimestat } from "kolmafia";
import { $effect, $item, $location, $slot, $stat, get } from "libram";

import { AutoBoxingDaycare, JanuaryTote } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { autoEquipToSlot } from "../../auto_equipment";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_abort,
  auto_is_valid,
  auto_runChoice,
  hasTorso,
} from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../paths/2015/one_crazy_random_summer";
import { in_disguises } from "../../paths/2018/disguises_delimit";
import { in_glover } from "../../paths/2018/g_lover";

export function neverendingPartyRemainingFreeFights(): number {
  //Returns how many free fights do you have remaining in neverending party?

  if (!neverendingPartyAvailable()) {
    return 0;
  }
  //if path randomizes names then the free fights are not free
  if (in_disguises() || in_ocrs()) {
    return 0;
  }
  //daily pass users do not get free fights
  if (get("_neverendingPartyToday")) {
    return 0;
  }
  //mafia counts how many times you fought there for free, not how many free fights remain.
  return 10 - get("_neverendingPartyFreeTurns");
}

export function neverendingPartyAvailable(): boolean {
  if (!get("neverendingPartyAlways") && !get("_neverendingPartyToday")) {
    // check mafia properties which track access.
    return false;
  }
  if (!auto_is_valid($item`Neverending Party invitation envelope`)) {
    return false;
  }
  if (get("_questPartyFair") === "finished") {
    // Can't adventure if the quest is complete for the day.
    return false;
  }
  return true;
}

export function neverendingPartyCombat(): boolean {
  if (!neverendingPartyAvailable()) {
    return false;
  }

  if (in_glover()) {
    // only non stat effect is valid in G-Lover
    AutoBoxingDaycare.fightClubSpa$1($effect`Flagrantly Fragrant`);
  } else {
    AutoBoxingDaycare.fightClubSpa();
  }
  //May need to actually have 1 adventure left.

  if (
    hasTorso() &&
    JanuaryTote.januaryToteTurnsLeft($item`makeshift garbage shirt`) > 0 &&
    auto_is_valid($item`makeshift garbage shirt`)
  ) {
    JanuaryTote.januaryToteAcquire($item`makeshift garbage shirt`);
    autoEquipToSlot($slot`shirt`, $item`makeshift garbage shirt`);
  }

  return autoAdv($location`The Neverending Party`);
}

export function neverendingPartyChoiceHandler(choice: number): void {
  if (choice === 1322) {
    // The Beginning of the Neverend
    auto_runChoice(2); // No, I'm just here to party (decline quest)
  } else if (choice === 1323) {
    // All Done!
    auto_runChoice(1); // Take your leave (get quest reward)
  } else if (choice === 1324) {
    // It Hasn't Ended, It's Just Paused
    let buff: Effect = $effect.none;
    switch (myPrimestat()) {
      case $stat`Muscle`:
        buff = $effect`Spiced Up`;
        break;
      case $stat`Mysticality`:
        buff = $effect`Tomes of Opportunity`;
        break;
      case $stat`Moxie`:
        buff = $effect`The Best Hair You've Ever Had`;
        break;
    }
    if (in_glover()) {
      // Can't use any of the buffs, may as well fight
      auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
    } else if (buff !== $effect.none && haveEffect(buff) < 9) {
      // Get the +mainstat% buff if we don't have enough turns of it to get us to the next scheduled NC.
      switch (myPrimestat()) {
        case $stat`Muscle`:
          auto_runChoice(2); // Check out the kitchen (go to Gone Kitchin')

          break;
        case $stat`Mysticality`:
          auto_runChoice(1); // Head upstairs (go to A Room With a View... Of a Bed)

          break;
        case $stat`Moxie`:
          auto_runChoice(4); // Investigate the basement (go to Basement Urges)

          break;
        default:
          auto_runChoice(5); // Pick a fight (fight a random monster from the zone)

          break;
      }
    } else if (isAboutToPowerlevel() || isActuallyEd()) {
      // If we're powerlevelling (or farming Ka) grab the +ML buff if we don't have enough turns
      // of it to get us to the next scheduled NC. Otherwise take the combat.
      if (haveEffect($effect`Citronella Armpits`) < 9) {
        auto_runChoice(3); // Go to the back yard (go to Forward to the Back)
      } else {
        auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
      }
    } else {
      auto_runChoice(5); // Pick a fight (fight a random monster from the zone)
    }
  } else if (choice === 1325) {
    // A Room With a View... Of a Bed
    if (myPrimestat() === $stat`Mysticality`) {
      auto_runChoice(2); // Read the tomes (Get Tomes of Opportunity buff. 20 advs of +20% to all Mysticality Gains)
    } else {
      auto_runChoice(1); // Take a quick nap (Full HP & MP restore)
    }
  } else if (choice === 1326) {
    // Gone Kitchin'
    if (myPrimestat() === $stat`Muscle`) {
      auto_runChoice(2); // Check out the muscle spice (Get Spiced Up buff. 20 advs of +20% to all Muscle Gains)
    } else {
      auto_runChoice(1); // Peruse the cookbooks (get some myst substats)
    }
  } else if (choice === 1327) {
    // Forward to the Back
    auto_runChoice(2); // Rub the candle wax under your arms (Get Citronella Armpits buff. 50 advs of +30 to Monster Level)
  } else if (choice === 1328) {
    // Basement Urges
    if (myPrimestat() === $stat`Moxie`) {
      auto_runChoice(2); // Use the hair gel (Get The Best Hair You've Ever Had buff. 20 advs of +20% to all Moxie Gains)
    } else {
      auto_runChoice(1); // Use the workout equipment (get some muscle substats)
    }
  } else {
    auto_abort("unhandled choice in neverendingPartyChoiceHandler");
  }
}
