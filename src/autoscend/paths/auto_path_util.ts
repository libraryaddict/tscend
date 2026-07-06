import {
  getProperty,
  gnomadsAvailable,
  guildStoreAvailable,
  haveSkill,
  itemAmount,
  myClass,
  myLevel,
  myMeat,
  myPath,
  print,
  setProperty,
  toBoolean,
  visitUrl,
} from "kolmafia";
import { $class, $item, $skill } from "libram";

import { initializeSettings } from "../../autoscend";
import { stomach_left } from "../auto_consume";
import { hasTorso$1, hasUsefulShirt, meatReserve } from "../auto_util";
import { auto_bestWarPlan } from "../quests/level_12";
import { in_aosol } from "./avatar_of_shadows_over_loathing";
import { in_tcrs } from "./two_crazy_random_summer";

// Functions designed for general utility in any path

//Defined in autoscend/auto_path_util.ash
export function auto_buySkills(): boolean {
  // This handles skill acquisition for general paths
  //we need 5000 meat for the skill. and want to save an additional 1000 meat above meat reserve since torso awareness is somewhat low priority
  if (
    myMeat() >= meatReserve() + 6000 &&
    gnomadsAvailable() &&
    !hasTorso$1() &&
    hasUsefulShirt() &&
    !in_aosol()
  ) {
    visitUrl("gnomes.php?action=trainskill&whichskill=12");
  } else if (
    myMeat() >= meatReserve() &&
    gnomadsAvailable() &&
    !hasTorso$1() &&
    hasUsefulShirt() &&
    in_aosol()
  ) {
    //we want Torso ASAP if we have a Parka and we're in AoSOL so we reserve meat in the meatReserve function only in AoSOL
    visitUrl("gnomes.php?action=trainskill&whichskill=12");
  }
  if (!guildStoreAvailable()) {
    return false;
  }
  switch (myClass()) {
    case $class`Seal Clubber`:
      if (
        myLevel() >= 1 &&
        myMeat() >= 800 &&
        !haveSkill($skill`Lunge Smack`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (
        myLevel() >= 1 &&
        myMeat() >= 1500 &&
        !haveSkill($skill`Fortitude of the Muskox`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=8", true);
      }
      if (
        myLevel() >= 3 &&
        myMeat() >= 2500 &&
        !haveSkill($skill`Cold Shoulder`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=28", true);
      }
      if (
        myLevel() >= 4 &&
        !haveSkill($skill`Wrath of the Wolverine`) &&
        (myMeat() >= 5500 ||
          (myMeat() >= 3500 && haveSkill($skill`Club Foot`)) ||
          (myMeat() >= 2500 &&
            haveSkill($skill`Batter Up!`) &&
            haveSkill($skill`Ire of the Orca`)))
      ) {
        visitUrl("guild.php?action=buyskill&skillid=29", true);
      }
      if (myLevel() >= 8 && myMeat() >= 8000 && !haveSkill($skill`Club Foot`)) {
        visitUrl("guild.php?action=buyskill&skillid=33", true);
      }
      if (
        myLevel() >= 10 &&
        myMeat() >= 12000 &&
        !haveSkill($skill`Ire of the Orca`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=35", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 12000 &&
        !haveSkill($skill`Batter Up!`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=14", true);
      }
      break;
    case $class`Turtle Tamer`:
      if (
        myLevel() >= 3 &&
        myMeat() >= 1000 &&
        !haveSkill($skill`Amphibian Sympathy`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=14", true);
      }
      if (
        myLevel() >= 2 &&
        myMeat() >= 5000 &&
        !haveSkill($skill`Skin of the Leatherback`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (myLevel() >= 2 && myMeat() >= 1250 && !haveSkill($skill`Headbutt`)) {
        visitUrl("guild.php?action=buyskill&skillid=3", true);
      }
      if (
        myLevel() >= 2 &&
        myMeat() >= 800 &&
        !haveSkill($skill`Blessing of the War Snapper`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=30", true);
      }
      if (
        myLevel() >= 8 &&
        myMeat() >= 3500 &&
        !haveSkill($skill`Empathy of the Newt`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=9", true);
      }
      if (
        myLevel() >= 9 &&
        myMeat() >= 12000 &&
        !haveSkill($skill`Spiky Shell`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=31", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 9000 &&
        !haveSkill($skill`Shieldbutt`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=5", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 9000 &&
        !haveSkill($skill`Butts of Steel`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=34", true);
      }
      if (myLevel() >= 7 && myMeat() >= 13000 && !haveSkill($skill`Kneebutt`)) {
        visitUrl("guild.php?action=buyskill&skillid=15", true);
      }
      if (myLevel() >= 5 && myMeat() >= 11000 && !haveSkill($skill`Shell Up`)) {
        visitUrl("guild.php?action=buyskill&skillid=28", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 17000 &&
        !haveSkill($skill`Blessing of the Storm Tortoise`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=37", true);
      }
      if (
        myLevel() >= 6 &&
        myMeat() >= 17400 &&
        !haveSkill($skill`Spirit Snap`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=32", true);
      }
      break;
    case $class`Pastamancer`:
      if (
        myLevel() >= 1 &&
        myMeat() >= 500 &&
        !haveSkill($skill`Utensil Twist`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=25", true);
      }
      if (
        myLevel() >= 2 &&
        myMeat() >= 1000 &&
        !haveSkill($skill`Entangling Noodles`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 4000 &&
        !haveSkill($skill`Pastamastery`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=6", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 4000 &&
        !haveSkill($skill`Bind Vermincelli`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=29", true);
      }
      if (
        myLevel() >= 9 &&
        myMeat() >= 12500 &&
        !haveSkill($skill`Spirit of Ravioli`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=14", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 15000 &&
        !haveSkill($skill`Leash of Linguini`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=10", true);
      }
      if (
        myLevel() >= 12 &&
        myMeat() >= 25000 &&
        !haveSkill($skill`Cannelloni Cocoon`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=12", true);
      }
      if (
        myLevel() >= 15 &&
        myMeat() >= 32500 &&
        !haveSkill($skill`Bind Spice Ghost`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=39", true);
      }
      break;
    case $class`Sauceror`:
      if (
        myLevel() >= 3 &&
        myMeat() >= 1000 &&
        !haveSkill($skill`Expert Panhandling`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (
        myLevel() >= 4 &&
        myMeat() >= 3000 &&
        !haveSkill($skill`Elemental Saucesphere`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=7", true);
      }
      if (
        myLevel() >= 4 &&
        myMeat() >= 1000 &&
        !haveSkill($skill`Inner Sauce`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=28", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 5000 &&
        !haveSkill($skill`Advanced Saucecrafting`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=6", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 4000 &&
        !haveSkill($skill`Saucestorm`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=5", true);
      }
      if (
        myLevel() >= 6 &&
        myMeat() >= 2500 &&
        !haveSkill($skill`Soul Saucery`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=27", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 20000 &&
        !haveSkill($skill`Saucemaven`) &&
        (stomach_left() >= 4 || in_tcrs())
      ) {
        visitUrl("guild.php?action=buyskill&skillid=39", true);
      }
      if (
        myLevel() >= 12 &&
        myMeat() >= 20000 &&
        !haveSkill($skill`Curse of Weaksauce`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=34", true);
      }
      if (
        myLevel() >= 8 &&
        myMeat() >= 12000 &&
        !haveSkill($skill`Itchy Curse Finger`) &&
        haveSkill($skill`Curse of Weaksauce`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=30", true);
      }
      break;
    case $class`Disco Bandit`:
      if (
        myLevel() >= 2 &&
        myMeat() >= 2100 &&
        !haveSkill($skill`Overdeveloped Sense of Self Preservation`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=10", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 2500 &&
        !haveSkill($skill`Advanced Cocktailcrafting`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=14", true);
      }
      if (
        myLevel() >= 6 &&
        myMeat() >= 2500 &&
        !haveSkill($skill`Nimble Fingers`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (
        myLevel() >= 8 &&
        myMeat() >= 7500 &&
        !haveSkill($skill`Mad Looting Skillz`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=6", true);
      }
      if (
        myLevel() >= 12 &&
        myMeat() >= 500 &&
        !haveSkill($skill`Deft Hands`) &&
        getProperty("sidequestArenaCompleted") === "none"
      ) {
        //safe flyering
        const noStaggerItem: boolean =
          itemAmount($item`beehive`) === 0 &&
          itemAmount($item`Time-Spinner`) === 0;
        const cantStagger: boolean =
          noStaggerItem || !haveSkill($skill`Ambidextrous Funkslinging`);
        if (
          cantStagger &&
          !toBoolean(getProperty("auto_ignoreFlyer")) &&
          auto_bestWarPlan().doArena
        ) {
          //buy Deft hands = first item throw in the fight staggers
          visitUrl("guild.php?action=buyskill&skillid=25", true);
        }
      }
      break;
    case $class`Accordion Thief`:
      if (
        myLevel() >= 1 &&
        myMeat() >= 400 &&
        !haveSkill($skill`The Moxious Madrigal`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=4", true);
      }
      if (
        myLevel() >= 2 &&
        myMeat() >= 1250 &&
        !haveSkill($skill`The Magical Mojomuscular Melody`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=7", true);
      }
      if (
        myLevel() >= 4 &&
        myMeat() >= 3500 &&
        !haveSkill($skill`The Power Ballad of the Arrowsmith`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=8", true);
      }
      if (
        myLevel() >= 5 &&
        myMeat() >= 2000 &&
        !haveSkill($skill`The Polka of Plenty`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=6", true);
      }
      if (
        myLevel() >= 7 &&
        myMeat() >= 7500 &&
        !haveSkill($skill`Fat Leon's Phat Loot Lyric`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=10", true);
      }
      if (
        myLevel() >= 10 &&
        myMeat() >= 12500 &&
        !haveSkill($skill`Thief Among the Honorable`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=38", true);
      }
      if (
        myLevel() >= 11 &&
        myMeat() >= 20000 &&
        !haveSkill($skill`Sticky Fingers`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=39", true);
      }
      if (
        myLevel() >= 12 &&
        myMeat() >= 25000 &&
        !haveSkill($skill`The Ode to Booze`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=14", true);
      }
      if (
        myLevel() >= 13 &&
        myMeat() >= 30000 &&
        !haveSkill($skill`The Sonata of Sneakiness`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=15", true);
      }
      if (
        myLevel() >= 13 &&
        myMeat() >= 30000 &&
        !haveSkill($skill`Master Accordion Master Thief`)
      ) {
        visitUrl("guild.php?action=buyskill&skillid=41", true);
      }
      break;
  }
  return false;
}

export function pathDroppedCheck(): void {
  //detect path drops and reinitialize with settings appropriate for the new path
  //this will also trigger when some paths break ronin
  if (myPath().name === getProperty("auto_doneInitializePath")) {
    return; //our current path is the same one we last initialized as
  }
  if (getProperty("auto_doneInitializePath") === "") {
    //this setting has not been set. this means the run started with an older version of autoscend that did not have this setting
    //a path of none would have returned "None" not "". This is only backwards support and can be deleted in the future.
    return;
  }
  print(
    `Path change detected. You were previously ${getProperty("auto_doneInitializePath")} and are now a ${myPath().name}`,
    "red",
  );
  setProperty("_auto_reinitialize", true.toString());
  initializeSettings();
}
