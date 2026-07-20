import {
  abort,
  bjornifyFamiliar,
  cliExecute,
  Effect,
  equippedItem,
  familiarWeight,
  getProperty,
  guildStoreAvailable,
  haveEffect,
  haveFamiliar,
  inHardcore,
  isUnrestricted,
  Item,
  itemAmount,
  lastChoice,
  lastMonster,
  limitMode,
  min,
  Monster,
  monsterLevelAdjustment,
  mpCost,
  myAdventures,
  myAudience,
  myBasestat,
  myBjornedFamiliar,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myHp,
  myLevel,
  myLightning,
  myLocation,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  myRain,
  myServant,
  mySessionAdv,
  mySoulsauce,
  myThunder,
  myTurncount,
  numericModifier,
  putCloset,
  removeProperty,
  Servant,
  setProperty,
  Skill,
  toBoolean,
  toFloat,
  toInt,
  toMonster,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $monsters,
  $skill,
  $skills,
  $slot,
  $stat,
} from "libram";

import { auto_buyUpTo, buyableMaintain } from "./auto_acquire";
import { autoAdv } from "./auto_adventure";
import { auto_faceCheck, buffMaintain$2 } from "./auto_buff";
import {
  addToMaximize,
  auto_loadEquipped,
  auto_saveEquipped,
  autoOutfit,
  equipMaximizedGear,
  possessEquipment,
  removeFromMaximize,
} from "./auto_equipment";
import { pathHasFamiliar } from "./auto_familiar";
import { acquireHP, acquireMP, uneffect } from "./auto_restore";
import {
  auto_have_skill,
  auto_haveQueuedForcedNonCombat,
  auto_ignoreExperience,
  auto_is_valid,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  auto_remainingShantyTurns,
  handleTracker$1,
  handleTracker$2,
  isGalaktikAvailable,
  meatReserve,
  preferredLibram,
  whatStatSmile,
} from "./auto_util";
import { auto_equipAprilShieldBuff } from "./iotms/mr2025";
import {
  auto_haveArchaeologistSpade,
  auto_spadeDigItem,
  auto_spadeDigsRemaining,
} from "./iotms/mr2026";
import { isActuallyEd } from "./paths/actually_ed_the_undying";
import { amw_canAfford, in_amw } from "./paths/adventurer_meats_world";
import { in_aosol } from "./paths/avatar_of_shadows_over_loathing";
import { awol_walkBuff, in_awol } from "./paths/avatar_of_west_of_loathing";
import { in_bugbear } from "./paths/bugbear_invasion";
import { inAftercore } from "./paths/casual";
import { in_heavyrains } from "./paths/heavy_rains";
import { in_lta } from "./paths/license_to_adventure";
import { in_nuclear } from "./paths/nuclear_autumn";
import { ocrs_postHelper } from "./paths/one_crazy_random_summer";
import { in_theSource } from "./paths/the_source";
import { in_zombieSlayer } from "./paths/zombie_slayer";
import { numPirateInsults } from "./quests/optional";

function auto_beaten_handler(): void {
  if (haveEffect($effect`Beaten Up`) === 0) {
    setProperty("auto_beatenUpLastAdv", false.toString());
    return; //we are not beaten up. nothing to handle
  }
  if (lastChoice() === 1467) {
    auto_log_info$1(
      "Getting beaten up here gave us 5 adventures, that's a win.",
    );
    return;
  }
  setProperty(
    "auto_beatenUpCount",
    (toInt(getProperty("auto_beatenUpCount")) + 1).toString(),
  );
  let loc: string = getProperty("auto_beatenUpLocations");
  if (loc !== "") {
    loc += ",";
  }
  loc += `day:${myDaycount()}:level:${myLevel()}:place:${myLocation()}`;
  setProperty("auto_beatenUpLocations", loc);
  setProperty("auto_beatenUpLastAdv", true.toString());

  buffMaintain$2($effect`They've Got Fleas`);
  if (myLevel() < 11 || getProperty("sidequestJunkyardCompleted") !== "none") {
    //don't risk blocking effect persisting in gremlins quest
    //try to avoid getting beaten up again
    buffMaintain$2($effect`Everything Is Bananas`);
  }

  if (myLocation() === $location`The X-32-F Combat Training Snowman`) {
    auto_log_info(
      "I got beaten up at the snojo, let's not keep going there and dying....",
      "red",
    );
    setProperty("_snojoFreeFights", (10).toString());
  } else if (lastMonster() === $monster`ninja snowman assassin`) {
    auto_log_info(
      "I got beaten up by a [ninja snowman assassin]. disabling ninja route",
      "red",
    );
    setProperty("auto_L8_ninjaAssassinFail", true.toString());
  } else {
    auto_log_warning("I got beaten up", "red");
  }

  if (
    toInt(getProperty("auto_beatenUpCount")) <= 10 &&
    myMp() >= mpCost($skill`Tongue of the Walrus`) &&
    auto_have_skill($skill`Tongue of the Walrus`)
  ) {
    auto_log_info("trying to recover with [Tongue of the Walrus]", "red");
    useSkill(1, $skill`Tongue of the Walrus`);
    if (haveEffect($effect`Beaten Up`) === 0) {
      return;
    } else {
      auto_log_warning$1(
        "Mysteriously failed to recover beaten up with [Tongue of the Walrus]",
      );
    }
  }
}

function auto_post_adventure(): boolean {
  auto_log_debug$1("Running auto_post_adv.js");

  if (limitMode() === "spelunky") {
    return true;
  }

  if (
    [
      "Coyote Ugly",
      "Gutterbound",
      "The Too-Much Booze Blues",
      "What's that smell?",
      "Hey, baby.  Wanna wrestle?",
    ].includes(getProperty("lastEncounter"))
  ) {
    abort(
      `Adventured while drunk and got drunken stupor NC: ${getProperty("lastEncounter")}`,
    );
  }

  setProperty("auto_nextEncounter", "");
  /* This tracks noncombat-forcers like Clara's Bell and stench jelly, which
   * set our noncombat rate to maximum until we encounter a noncombat.
   * Superlikelies do not reset this effect. There's some complexity here -
   * since some noncombats precede a combat encounter (for example, the
   * Cosmetics Wraith in the Haunted Bathroom), and we SHOULD reset the
   * noncombat-forcer in those cases.*/

  if (
    getProperty("auto_forceNonCombatSource") !== "" &&
    !auto_haveQueuedForcedNonCombat()
  ) {
    // possible to get desired NC when preparing spikes/avalanche. Only log usage if NC was actually forced
    if (
      ((getProperty("auto_forceNonCombatSource") !== "jurassic parka" ||
        toBoolean(getProperty("auto_parkaSpikesDeployed"))) &&
        getProperty("auto_forceNonCombatSource") !== "McHugeLarge left ski") ||
      toBoolean(getProperty("auto_avalancheDeployed"))
    ) {
      auto_log_info(
        `Encountered forced noncombat: ${getProperty("lastEncounter")}`,
        "blue",
      );
      handleTracker$2(
        getProperty("auto_forceNonCombatSource"),
        myLocation().toString(),
        getProperty("lastEncounter"),
        "auto_forcedNC",
      );
    }
    setProperty("auto_forceNonCombatSource", "");
    setProperty("auto_forceNonCombatLocation", "");
    setProperty("auto_parkaSpikesDeployed", false.toString());
    setProperty("auto_avalancheDeployed", false.toString());
  }

  if (
    getProperty("auto_instakillSource") !== "" &&
    toBoolean(getProperty("auto_instakillSuccess"))
  ) {
    auto_log_info(
      `Successful instakill with: ${getProperty("auto_instakillSource")}`,
      "blue",
    );
    if (toMonster(getProperty("lastEncounter")) === lastMonster()) {
      //only track the combat part of a combat+NC encounter (like everfull dart perks)
      handleTracker$1(
        getProperty("lastEncounter"),
        getProperty("auto_instakillSource"),
        "auto_instakill",
      );
    }
    setProperty("auto_instakillSource", "");
    setProperty("auto_instakillSuccess", false.toString());
  }

  if (haveEffect($effect`Eldritch Attunement`) > 0) {
    if (lastMonster() !== $monster`Eldritch Tentacle`) {
      auto_log_warning("Expected Tentacle, uh oh!", "red");
      return false;
    }
    auto_log_info("No Tentacle expected this time!", "green");
  }
  //We need to do this early, and even if postAdventure handling is done.
  if (in_theSource()) {
    if (toInt(getProperty("auto_diag_round")) === 0) {
      const last: Monster = lastMonster();
      visitUrl("main.php");
      if (last !== lastMonster()) {
        auto_log_warning(
          "Interrupted battle detected at post combat time",
          "red",
        );
        if (haveEffect($effect`Beaten Up`) > 0) {
          auto_log_warning(
            "Post combat time caused up to be Beaten Up!",
            "red",
          );
          return false;
        }
        autoAdv(myLocation());
        return true;
      }
    }
  }

  if (getProperty("lastEncounter") === "Daily Briefing" && in_lta()) {
    setProperty("_auto_bondBriefing", "started");
  }

  if (
    toInt(getProperty("_villainLairProgress")) < 999 &&
    (getProperty("_villainLairColor") !== "" ||
      toBoolean(getProperty("_villainLairColorChoiceUsed"))) &&
    in_lta() &&
    myLocation() === $location`Super Villain's Lair`
  ) {
    if (itemAmount($item`can of Minions-Be-Gone`) > 0) {
      use(1, $item`can of Minions-Be-Gone`);
    }
  }
  //assuming we're on the orchard sidequest if we're adventuring there
  if (auto_haveArchaeologistSpade() && auto_spadeDigsRemaining() > 0) {
    //the scent glands are the only droppable items in their respective areas, so it's guaranteed from spade
    if (
      myLocation() === $location`The Hatching Chamber` &&
      itemAmount($item`filthworm hatchling scent gland`) === 0
    ) {
      auto_spadeDigItem();
    } else if (
      myLocation() === $location`The Feeding Chamber` &&
      itemAmount($item`filthworm drone scent gland`) === 0
    ) {
      auto_spadeDigItem();
    } else if (
      myLocation() === $location`The Royal Guard Chamber` &&
      itemAmount($item`filthworm royal guard scent gland`) === 0
    ) {
      auto_spadeDigItem();
    } else if (
      myLocation() === $location`Sonofa Beach` &&
      itemAmount($item`barrel of gunpowder`) < 5
    ) {
      //dig until we should have 5 barrels or we're out of digs
      const barrelCount: number = itemAmount($item`barrel of gunpowder`);
      const digsRemaining: number = auto_spadeDigsRemaining();
      for (
        let x = barrelCount + 1,
          _last_6 = min(5, digsRemaining),
          _step_6 = 1,
          _up_6 = x <= _last_6,
          _inc_6 = _up_6 ? Math.abs(_step_6) : -Math.abs(_step_6);
        _up_6 ? x <= _last_6 : x >= _last_6;
        x += _inc_6
      ) {
        auto_spadeDigItem();
      }
    }
  }

  if (
    myLocation() === $location`The Old Landfill` &&
    itemAmount($item`funky junk key`) > 0
  ) {
    // got a key drop, reset the tracking property.
    setProperty("auto_junkspritesencountered", (0).toString());
  }

  if (toBoolean(getProperty("auto_disableAdventureHandling"))) {
    auto_log_info(
      "Postadventure skipped by standard adventure handler.",
      "green",
    );
    return true;
  }

  if (
    !toBoolean(getProperty("_ballInACupUsed")) &&
    itemAmount($item`ball-in-a-cup`) > 0
  ) {
    use(1, $item`ball-in-a-cup`);
  }
  if (
    !toBoolean(getProperty("_setOfJacksUsed")) &&
    itemAmount($item`set of jacks`) > 0
  ) {
    use(1, $item`set of jacks`);
  }
  if (
    !toBoolean(getProperty("_hobbyHorseUsed")) &&
    itemAmount($item`handmade hobby horse`) > 0
  ) {
    use(1, $item`handmade hobby horse`);
  }
  if (
    !toBoolean(getProperty("_creepyVoodooDollUsed")) &&
    itemAmount($item`creepy voodoo doll`) > 0
  ) {
    use(1, $item`creepy voodoo doll`);
  }
  // mayday supply package drops from first combat of the day if you have this IOTM
  if (
    itemAmount($item`MayDay™ supply package`) > 0 &&
    auto_is_valid($item`MayDay™ supply package`)
  ) {
    use(1, $item`MayDay™ supply package`);
  }

  if (
    myLocation() === $location`The Lower Chambers` &&
    itemAmount($item`[2334]Holy MacGuffin`) === 0
  ) {
    auto_log_info("Postadventure skipped by Ed the Undying!", "green");
    return true;
  }

  if (myLocation() === $location`The Invader`) {
    // Just so the "are we beaten up?" check in auto_koe works properly
    auto_log_info("Postadventure skipped for The Invader!", "green");
    return true;
  }

  ocrs_postHelper();
  if (lastMonster().randomModifiers.includes("clingy")) {
    auto_log_info("Postadventure skipped by clingy modifier.", "green");
    return true;
  }
  //save some MP while buffing
  addToMaximize("-1000mana cost, -tie");
  equipMaximizedGear();

  if (haveEffect($effect`Cunctatitis`) > 0) {
    if (myMp() >= 12 && auto_have_skill($skill`Disco Nap`)) {
      useSkill(1, $skill`Disco Nap`);
    } else {
      uneffect($effect`Cunctatitis`);
    }
  }

  if (
    myClass() === $class`Avatar of Jarlsberg` &&
    auto_have_skill($skill`Early Riser`)
  ) {
    for (const sk of $skills`Conjure Cream, Conjure Dough, Conjure Cheese, Conjure Eggs, Conjure Meat Product, Conjure Vegetables, Conjure Potato, Conjure Fruit`) {
      if (
        auto_have_skill(sk) &&
        sk.timescast < sk.dailylimit &&
        myMp() - 40 >= mpCost(sk)
      ) {
        useSkill(1, sk);
      }
    }
  }

  if (myClass() === $class`Avatar of Sneaky Pete`) {
    buffMaintain$2($effect`All Revved Up`, 25, 1, 10);
    buffMaintain$2($effect`Of Course It Looks Great`, 55, 1, 10);
    if (
      auto_have_skill($skill`Throw Party`) &&
      !toBoolean(getProperty("_petePartyThrown"))
    ) {
      let threshold: number = 50;
      if (
        !possessEquipment($item`Sneaky Pete's leather jacket`) &&
        !possessEquipment($item`Sneaky Pete's leather jacket (collar popped)`)
      ) {
        threshold = 30;
      }
      if (myAudience() >= threshold) {
        useSkill(1, $skill`Throw Party`);
      }
    }
    if (
      auto_have_skill($skill`Incite Riot`) &&
      !toBoolean(getProperty("_peteRiotIncited"))
    ) {
      let threshold: number = -50;
      if (
        !possessEquipment($item`Sneaky Pete's leather jacket`) &&
        !possessEquipment($item`Sneaky Pete's leather jacket (collar popped)`)
      ) {
        threshold = -30;
      }
      if (myAudience() <= threshold) {
        useSkill(1, $skill`Incite Riot`);
      }
    }
  }

  if (in_nuclear()) {
    buffMaintain$2($effect`Juiced and Loose`, 35, 1, 1);
    buffMaintain$2($effect`Hardened Sweatshirt`, 35, 1, 1);
    buffMaintain$2($effect`Ear Winds`, 35, 1, 1);
    buffMaintain$2($effect`Magnetized Ears`, 40, 1, 1);
    buffMaintain$2($effect`Impeccable Coiffure`, 75, 1, 1);
    buffMaintain$2($effect`Mind Vision`, 200, 1, 1);

    buffMaintain$2($effect`Juiced and Loose`, 75, 1, 50);
    buffMaintain$2($effect`Hardened Sweatshirt`, 75, 1, 50);
    buffMaintain$2($effect`Bone Springs`, 75, 1, 1);

    if (
      myMeat() > 5000 &&
      (myTurncount() >= 50 ||
        toBoolean(getProperty("falloutShelterChronoUsed")))
    ) {
      buffMaintain$2($effect`Rad-Pro Tected`);
    }
  }

  if (in_zombieSlayer()) {
    buffMaintain$2($effect`Chow Downed`, 15, 1, 1);
    buffMaintain$2($effect`Scavengers Scavenging`, 20, 1, 1);
  }

  if (isActuallyEd()) {
    if ($location`The Shore, Inc. Travel Agency` !== myLocation()) {
      if (myServant() !== Servant.none) {
        buffMaintain$2($effect`Purr of the Feline`, 10, 1, 10);
      }

      buffMaintain$2($effect`Wisdom of Thoth`, 10, 1, 10);

      if (myLevel() < 13) {
        buffMaintain$2($effect`Prayer of Seshat`, 10, 1, 10);
      }

      buffMaintain$2($effect`Power of Heka`, 10, 1, 10);
      buffMaintain$2($effect`Hide of Sobek`, 10, 1, 10);

      if (
        !$locations`The Hippy Camp, The Outskirts of Cobb's Knob, Pirates of the Garbage Barges, The Secret Government Laboratory`.includes(
          myLocation(),
        )
      ) {
        buffMaintain$2($effect`Bounty of Renenutet`, 10, 1, 10);
      }

      for (const ef of $effects`Prayer of Seshat, Wisdom of Thoth, Power of Heka, Hide of Sobek, Bounty of Renenutet`) {
        if (myMp() > 100) {
          buffMaintain$2(ef, 20, 1, 20);
        }
      }
    } else {
      buffMaintain$2($effect`Wisdom of Thoth`, 10, 1, 10);
    }

    if (myMp() + 100 < myMaxmp()) {
      acquireMP(100, myMeat());
    }
    return true;
  }
  if (in_aosol()) {
    if (myClass() === $class`Pig Skinner`) {
      buffMaintain$2($effect`Cheerled`, 30, 1, 10);
      buffMaintain$2($effect`Taped Up`, 20, 1, 10);
      //buffMaintain($effect[Stretched], 10, 1, 10); In Providers
    }
    if (myClass() === $class`Cheese Wizard`) {
      //buffMaintain($effect[Shifted Reality], 25, 1, 10);  In Providers
      buffMaintain$2($effect`Cheddarmored`, 5, 1, 10);
      //buffMaintain($effect[Queso Fustulento], 10, 1, 10); //Only on boss fights
    }
    if (myClass() === $class`Jazz Agent`) {
      buffMaintain$2($effect`Reliable Backup`, 10, 1, 10);
      buffMaintain$2($effect`Soothing Flute`, 15, 1, 10);
      //buffMaintain($effect[Tricky Timpani], 30, 1, 10); //Only on boss fights
    }
  }
  if (in_amw()) {
    // adventurer meats world
    if (itemAmount($item`briefcase`) > 0) {
      use(1, $item`briefcase`); // no need to run more than once because 1/combat
    }
    if (amw_canAfford($skill`Self-Tenderize`)) {
      // not necessary, but cheap
      buffMaintain$2($effect`Tenderized`, 0, 1, 5);
    }
    // Beef Goggles is in providers
    if (amw_canAfford($skill`Meat Puppet`)) {
      // +famwt for our chaun
      buffMaintain$2($effect`Meat Puppet`, 0, 1, 5);
    }
    if (amw_canAfford($skill`Steak Skirt`)) {
      // not necessary, but cheap
      buffMaintain$2($effect`Steak Skirt`, 0, 1, 5);
    }
  }

  const libram: Skill = preferredLibram();

  if (myAdventures() > 20) {
    buffMaintain$2($effect`Merry Smithsness`, 0, 1, 10);
  }
  //Deal with Poison, (should do all of them actually)
  let poisoned: boolean = false;
  for (const poison of $effects`A Little Bit Poisoned, Hardly Poisoned at All, Majorly Poisoned, Really Quite Poisoned, Somewhat Poisoned`) {
    if (haveEffect(poison) > 0) {
      poisoned = true;
      break;
    }
  }
  if (poisoned) {
    if (
      myMp() > 12 &&
      auto_have_skill($skill`Disco Nap`) &&
      auto_have_skill($skill`Adventurer of Leisure`)
    ) {
      useSkill(1, $skill`Disco Nap`);
    } else if (
      isGalaktikAvailable() &&
      auto_is_valid($item`anti-anti-antidote`)
    ) {
      auto_buyUpTo(1, $item`anti-anti-antidote`);
      use(1, $item`anti-anti-antidote`);
    }
  }

  if (haveEffect($effect`Temporary Amnesia`) > 0) {
    if (!uneffect($effect`Temporary Amnesia`)) {
      abort("Could not remove temporary amnesia and now I suckzor.");
    }
  }

  if (myClass() === $class`Turtle Tamer` && guildStoreAvailable()) {
    buffMaintain$2($effect`Eau de Tortue`);
  }

  if (monsterLevelAdjustment() > 140 && !inAftercore()) {
    buffMaintain$2($effect`Butt-Rock Hair`);
    buffMaintain$2($effect`Go Get 'Em, Tiger!`);
  }

  if (in_theSource()) {
    if (
      toInt(getProperty("sourceInterval")) > 0 &&
      toInt(getProperty("sourceInterval")) <= 600 &&
      toInt(getProperty("sourceAgentsDefeated")) >= 9
    ) {
      if (
        haveEffect($effect`Song of Bravado`) === 0 &&
        haveEffect($effect`Song of Sauce`) === 0 &&
        haveEffect($effect`Song of Slowness`) === 0 &&
        haveEffect($effect`Song of the North`) === 0
      ) {
        buffMaintain$2($effect`Song of Starch`, 250, 1, 1);
      }
    }
  }

  if (myClass() === $class`Sauceror`) {
    if (
      myLevel() >= 6 &&
      haveEffect($effect`[1458]Blood Sugar Sauce Magic`) === 0 &&
      auto_have_skill($skill`Blood Sugar Sauce Magic`) &&
      !inHardcore()
    ) {
      useSkill(1, $skill`Blood Sugar Sauce Magic`);
    }

    if ((myLevel() <= 8 && mySoulsauce() >= 92) || mySoulsauce() >= 100) {
      useSkill(1, $skill`Soul Rotation`);
    }
    const missing: number = (myMaxmp() - myMp()) / 15; //soul food restores 15 MP per cast.
    let availableSauce: number = mySoulsauce();
    const minMPexpected: number = myMp() + (availableSauce - 5) * 15; //mp expected after soul food if last 5 soulsauce is saved
    if (
      availableSauce >= 5 &&
      minMPexpected > 100 &&
      minMPexpected > 0.8 * myMaxmp()
    ) {
      availableSauce -= 5; //keep 5 soulsauce for soul bubble if not missing much MP
    }
    const casts: number = min(missing, availableSauce / 5); //soul food costs 5 soulsauce per cast.
    if (casts > 0) {
      useSkill(casts, $skill`Soul Food`);
    }
  }

  if (
    monsterLevelAdjustment() > 120 &&
    myHp() * 10 < myMaxhp() * 8 &&
    myMp() >= 20
  ) {
    acquireHP();
  }

  if (myMaxhp() > 200 && myHp() < 80 && myMp() > 25) {
    acquireHP();
  }

  if (myMaxhp() > 200 && myHp() < 140 && myMp() > 100) {
    acquireHP();
  }

  if (
    auto_have_skill($skill`Thunderheart`) &&
    myThunder() >= 90 &&
    myTurncount() - toInt(getProperty("auto_lastthunderturn")) >= 9
  ) {
    useSkill(1, $skill`Thunderheart`);
  }

  if (in_awol()) {
    const awolDesired: Effect = awol_walkBuff();
    if (awolDesired !== Effect.none) {
      if (!inAftercore()) {
        let awolMP: number = 85;
        if (myClass() === $class`Beanslinger`) {
          awolMP = 95;
        }
        buffMaintain$2(awolDesired, awolMP, 1, 20);
      } else {
        buffMaintain$2(awolDesired, 120, 1, 1);
      }
    }
  }

  if (
    auto_have_skill($skill`Demand Sandwich`) &&
    myMp() > 85 &&
    myLevel() >= 9 &&
    toInt(getProperty("_demandSandwich")) < 3
  ) {
    useSkill(1, $skill`Demand Sandwich`);
  }

  if (auto_have_skill($skill`Summon Smithsness`) && myMp() > 20) {
    useSkill(1, $skill`Summon Smithsness`);
  }
  //everyone wants more initiative
  buffMaintain$2($effect`Springy Fusilli`, 30, 1, 5); //+40 init. 10 MP. 1 MP/adv
  buffMaintain$2($effect`Walberg's Dim Bulb`, 30, 1, 5); //+10 init. 5 MP. 0.5 MP/adv
  if (
    myMaxhp() < 100 ||
    !auto_have_skill(
      //get some durability to avoid dying
      $skill`Cannelloni Cocoon`,
    )
  ) {
    //!cocoon===expensive heal. +durability to save meat even when maxhp > 100
    buffMaintain$2($effect`Ghostly Shell`, 30, 1, 5); //+80 DA. 6 MP. totem based duration
    buffMaintain$2($effect`Astral Shell`, 30, 1, 5); //+80 DA, +1 all res. 10 MP. totem based duration
    buffMaintain$2($effect`Reptilian Fortitude`, 30, 1, 5); //+30HP. 10 MP. totem based duration
  }
  // This is the list of castables that all MP sequences will use.
  const toCast: Skill[] = $skills`Prevent Scurvy and Sobriety, Acquire Rhinestones, Advanced Cocktailcrafting, Advanced Saucecrafting, Communism!, Grab a Cold One, Lunch Break, Pastamastery, Perfect Freeze, Request Sandwich, Spaghetti Breakfast, Summon Alice's Army Cards, Summon Carrot, Summon Confiscated Things, Summon Crimbo Candy, Summon Geeky Gifts, Summon Hilarious Objects, Summon Holiday Fun!, Summon Kokomo Resort Pass, Summon Tasteful Items`;

  const buff_familiar: boolean =
    pathHasFamiliar() && !toBoolean(getProperty("_auto_bad100Familiar"));
  const regen: number =
    (toFloat(numericModifier("MP Regen Min")) +
      toFloat(numericModifier("MP Regen Max"))) /
    2.0;

  if (myMaxmp() < 50) {
    buffMaintain$2($effect`The Magical Mojomuscular Melody`, 3, 1, 5);
    buffMaintain$2($effect`Power Ballad of the Arrowsmith`, 7, 1, 5);
    buffMaintain$2(whatStatSmile(), 15, 1, 10);
    // Only maintain skills in path with familiars
    if (buff_familiar) {
      buffMaintain$2($effect`Leash of Linguini`, 20, 1, 10);
      if (regen > 10.0) {
        buffMaintain$2($effect`Thoughtful Empathy`, 25, 1, 10);
        buffMaintain$2($effect`Empathy`, 25, 1, 10);
      }
    }
    // TODO: 'Get Big' is a pretty good skill
    if (libram !== Skill.none && myMp() - mpCost(libram) > 25) {
      useSkill(1, libram);
    }

    for (const sk of toCast) {
      if (
        isUnrestricted(sk) &&
        auto_have_skill(sk) &&
        myMp() - 40 >= mpCost(sk)
      ) {
        useSkill(1, sk);
      }
    }

    if (regen > 10.0) {
      buffMaintain$2($effect`Rage of the Reindeer`, 30, 1, 10);
    }
    buffMaintain$2($effect`Astral Shell`, 35, 1, 10);
    buffMaintain$2($effect`Elemental Saucesphere`, 30, 1, 10);

    if (myLocation() !== $location`The Broodling Grounds`) {
      buffMaintain$2($effect`Spiky Shell`, 20, 1, 10);
      buffMaintain$2($effect`Scarysauce`, 25, 1, 10);
    }
    buffMaintain$2($effect`Ghostly Shell`, 25, 1, 10);
    buffMaintain$2($effect`Walberg's Dim Bulb`, 35, 1, 10);
    //		buffMaintain($effect[Springy Fusilli], 40, 1, 10);
    buffMaintain$2($effect`Blubbered Up`, 30, 1, 10);
    //		buffMaintain($effect[Tenacity of the Snapper], 30, 1, 10);
    buffMaintain$2($effect`Reptilian Fortitude`, 30, 1, 10);
    if (regen > 10.0) {
      buffMaintain$2($effect`Disco Fever`, 40, 1, 10);
    }
    const preShield: Map<number, Item> = auto_saveEquipped();
    auto_equipAprilShieldBuff(); //get secondary buffs provided by shield when the trivial class skills are used
    buffMaintain$2($effect`Saucemastery`, 25, 1, 4);
    buffMaintain$2($effect`Pasta Oneness`, 25, 1, 4);

    if (regen > 7.5) {
      buffMaintain$2($effect`Seal Clubbing Frenzy`, 10, 3, 4);
      buffMaintain$2($effect`Patience of the Tortoise`, 10, 3, 4);
      buffMaintain$2($effect`Mariachi Mood`, 25, 1, 4);
      buffMaintain$2($effect`Disco State of Mind`, 25, 1, 4);
    }
    auto_loadEquipped(preShield);
  } else if (myMaxmp() < 80) {
    buffMaintain$2($effect`The Magical Mojomuscular Melody`, 3, 1, 5);
    buffMaintain$2($effect`Power Ballad of the Arrowsmith`, 7, 1, 5);
    buffMaintain$2(whatStatSmile(), 20, 1, 10);
    // Only Maintain skills in path with familiars
    if (buff_familiar) {
      buffMaintain$2($effect`Leash of Linguini`, 30, 1, 10);
      if (regen > 10.0) {
        buffMaintain$2($effect`Thoughtful Empathy`, 35, 1, 10);
        buffMaintain$2($effect`Empathy`, 35, 1, 10);
      }
    }

    if (libram !== Skill.none && myMp() - mpCost(libram) > 32) {
      useSkill(1, libram);
    }

    for (const sk of toCast) {
      if (
        isUnrestricted(sk) &&
        auto_have_skill(sk) &&
        myMp() - 50 >= mpCost(sk)
      ) {
        useSkill(1, sk);
      }
    }
    //		buffMaintain($effect[Prayer of Seshat], 5, 1, 10);

    if (regen > 10.0) {
      buffMaintain$2($effect`Rage of the Reindeer`, 40, 1, 10);
    }
    buffMaintain$2($effect`Astral Shell`, 50, 1, 10);
    buffMaintain$2($effect`Elemental Saucesphere`, 40, 1, 10);
    if (myLocation() !== $location`The Broodling Grounds`) {
      buffMaintain$2($effect`Spiky Shell`, 40, 1, 10);
      buffMaintain$2($effect`Scarysauce`, 40, 1, 10);
      //			buffMaintain($effect[Jalape&ntilde;o Saucesphere], 50, 1, 10);
    }
    buffMaintain$2($effect`Ghostly Shell`, 45, 1, 10);
    if (myClass() === $class`Turtle Tamer`) {
      buffMaintain$2($effect`Disdain of the Storm Tortoise`, 60, 1, 10);
    }
    buffMaintain$2($effect`Walberg's Dim Bulb`, 50, 1, 10);
    //		buffMaintain($effect[Springy Fusilli], 60, 1, 10);
    //		buffMaintain($effect[Flimsy Shield of the Pastalord], 70, 1, 10);
    buffMaintain$2($effect`Blubbered Up`, 60, 1, 10);
    //		buffMaintain($effect[Tenacity of the Snapper], 50, 1, 10);
    buffMaintain$2($effect`Reptilian Fortitude`, 50, 1, 10);
    if (regen > 10.0) {
      buffMaintain$2($effect`Disco Fever`, 60, 1, 10);
    }
    const preShield: Map<number, Item> = auto_saveEquipped();
    auto_equipAprilShieldBuff(); //get secondary buffs provided by shield when the trivial class skills are used
    buffMaintain$2($effect`Saucemastery`, 50, 3, 4);
    buffMaintain$2($effect`Pasta Oneness`, 50, 3, 4);
    if (regen > 8.2) {
      buffMaintain$2($effect`Seal Clubbing Frenzy`, 25, 3, 4);
      buffMaintain$2($effect`Patience of the Tortoise`, 25, 3, 4);
      buffMaintain$2($effect`Mariachi Mood`, 50, 3, 4);
      buffMaintain$2($effect`Disco State of Mind`, 50, 3, 4);
    }
    auto_loadEquipped(preShield);
  } else if (myMaxmp() < 170) {
    if (myLevel() < 13) {
      buffMaintain$2(whatStatSmile(), 40, 1, 10);
    }
    // Only maintain in path with familiars
    if (buff_familiar) {
      buffMaintain$2($effect`Leash of Linguini`, 35, 1, 10);
      if (regen > 4.0) {
        buffMaintain$2($effect`Thoughtful Empathy`, 50, 1, 10);
        buffMaintain$2($effect`Empathy`, 50, 1, 10);
      }
    }

    for (const sk of toCast) {
      if (
        isUnrestricted(sk) &&
        auto_have_skill(sk) &&
        myMp() - 90 >= mpCost(sk)
      ) {
        useSkill(1, sk);
      }
    }

    if (libram !== Skill.none && myMp() - mpCost(libram) > 40) {
      useSkill(1, libram);
    }
    //		buffMaintain($effect[Prayer of Seshat], 5, 1, 10);
    buffMaintain$2($effect`Big`, 100, 1, 10);
    buffMaintain$2($effect`Rage of the Reindeer`, 80, 1, 10);
    buffMaintain$2($effect`Astral Shell`, 80, 1, 10);
    buffMaintain$2($effect`Elemental Saucesphere`, 120, 1, 10);
    if (myLocation() !== $location`The Broodling Grounds`) {
      buffMaintain$2($effect`Spiky Shell`, 80, 1, 10);
      buffMaintain$2($effect`Scarysauce`, 120, 1, 10);
      //			buffMaintain($effect[Jalape&ntilde;o Saucesphere], 60, 1, 10);
    }
    buffMaintain$2($effect`Ghostly Shell`, 80, 1, 10);
    if (myClass() === $class`Turtle Tamer`) {
      buffMaintain$2($effect`Disdain of the Storm Tortoise`, 80, 1, 10);
    }
    buffMaintain$2($effect`Walberg's Dim Bulb`, 80, 1, 10);
    buffMaintain$2($effect`Springy Fusilli`, 80, 1, 10);
    //		buffMaintain($effect[Flimsy Shield of the Pastalord], 80, 1, 10);
    buffMaintain$2($effect`Blubbered Up`, 120, 1, 10);
    //		buffMaintain($effect[Tenacity of the Snapper], 80, 1, 10);
    if (regen > 10.0) {
      buffMaintain$2($effect`Reptilian Fortitude`, 150, 1, 10);
      buffMaintain$2($effect`Disco Fever`, 80, 1, 10);
      buffMaintain$2($effect`Seal Clubbing Frenzy`, 50, 5, 4);
      buffMaintain$2($effect`Patience of the Tortoise`, 50, 5, 4);
    }
    //		buffMaintain($effect[Rotten Memories], 100, 1, 10);

    if (libram !== Skill.none && myMp() - mpCost(libram) > 80) {
      useSkill(1, libram);
    }

    if (myMp() > 80) {
      buffMaintain$2($effect`Takin' It Greasy`, 50, 1, 5);
      buffMaintain$2($effect`Intimidating Mien`, 50, 1, 5);
    }

    buffMaintain$2($effect`Polka of Plenty`, 110, 1, 5);
  } else {
    let didOutfit: boolean = false;
    if (
      myBasestat($stat`Mysticality`) >= 200 &&
      myBuffedstat($stat`Mysticality`) >= 200 &&
      inAftercore() &&
      itemAmount($item`Wand of Oscus`) > 0 &&
      itemAmount($item`Oscus's dumpster waders`) > 0 &&
      itemAmount($item`Oscus's pelt`) > 0
    ) {
      cliExecute("outfit save Backup");
      //Using the cli command may not upgrade our stats if our max mp drops
      //Not sure if the ASH command actually handles it properly, we'll see.
      //cli_execute("outfit Vile Vagrant Vestments");
      //outfit does not... damn it.
      if (!autoOutfit("Vile Vagrant Vestments")) {
        auto_log_warning(
          "Could not wear Vile Vagrant Outfit for some raisin",
          "red",
        );
      }
      didOutfit = true;
    }

    if (myMp() > 150 && myMaxhp() > 300 && myHp() < 140) {
      acquireHP();
    }
    if (myMp() > 100 && myMaxhp() > 500 && myHp() < 250) {
      acquireHP();
    }
    if (myMp() > 75 && myMaxhp() > 500 && myHp() < 200) {
      acquireHP();
    }
    if (myMp() > 75 && myMaxhp() > 700 && myHp() < 300) {
      acquireHP();
    }
    if (myMp() > 75 && (myHp() === 0 || myMaxhp() / myHp() > 3)) {
      acquireHP();
    }

    buffMaintain$2($effect`Fat Leon's Phat Loot Lyric`, 250, 1, 10);
    buffMaintain$2($effect`Polka of Plenty`, 150, 1, 5);

    if (myLevel() < 13) {
      buffMaintain$2(whatStatSmile(), 40, 1, 10);
    }
    // Only maintain in path with familiars
    if (buff_familiar) {
      buffMaintain$2($effect`Empathy`, 50, 1, 10);
      buffMaintain$2($effect`Thoughtful Empathy`, 50, 1, 10);
      buffMaintain$2($effect`Leash of Linguini`, 35, 1, 10);
      // only do this one if we don't have another shanty up
      if (auto_remainingShantyTurns() < 1) {
        buffMaintain$2($effect`Only Dogs Love a Drunken Sailor`, 50, 1, 1);
      }
    }

    for (const sk of toCast) {
      if (
        isUnrestricted(sk) &&
        auto_have_skill(sk) &&
        myMp() - 85 >= mpCost(sk)
      ) {
        useSkill(1, sk);
      }
    }

    if (libram !== Skill.none && myMp() - mpCost(libram) > 32) {
      auto_log_info(
        `Mymp: ${myMp()} of ${myMaxmp()} and cost: ${mpCost(libram)}`,
        "blue",
      );
      let temp: boolean = false;
      try {
        //if(use_skill(1, libram)) {}
        temp = useSkill(1, libram);
      } finally {
        if (!temp) {
          auto_log_warning("No longer have enough MP and failed.", "red");
          auto_log_info(
            `Mymp: ${myMp()} of ${myMaxmp()} and cost: ${mpCost(libram)}`,
            "blue",
          );
        }
      }
    }
    //		buffMaintain($effect[Prayer of Seshat], 5, 1, 10);

    buffMaintain$2($effect`Singer's Faithful Ocelot`, 280, 1, 10);

    buffMaintain$2($effect`Big`, 100, 1, 10);
    buffMaintain$2($effect`Rage of the Reindeer`, 80, 1, 10);
    buffMaintain$2($effect`Astral Shell`, 80, 1, 10);
    buffMaintain$2($effect`Elemental Saucesphere`, 120, 1, 10);
    if (myLocation() !== $location`The Broodling Grounds`) {
      buffMaintain$2($effect`Spiky Shell`, 120, 1, 10);
      buffMaintain$2($effect`Scarysauce`, 160, 1, 10);
      buffMaintain$2($effect`Jalapeño Saucesphere`, 225, 1, 10);
    }
    buffMaintain$2($effect`Ghostly Shell`, 80, 1, 10);
    if (regen > 15.0) {
      buffMaintain$2($effect`Disdain of the War Snapper`, 200, 1, 10);
    }
    buffMaintain$2($effect`Walberg's Dim Bulb`, 80, 1, 10);
    buffMaintain$2($effect`Springy Fusilli`, 80, 1, 10);
    if (regen > 15.0) {
      buffMaintain$2($effect`Flimsy Shield of the Pastalord`, 180, 1, 10);
    }
    buffMaintain$2($effect`Blubbered Up`, 200, 1, 10);
    buffMaintain$2($effect`Tenacity of the Snapper`, 200, 1, 10);
    buffMaintain$2($effect`Reptilian Fortitude`, 200, 1, 10);
    if (regen > 20.0) {
      buffMaintain$2($effect`Antibiotic Saucesphere`, 350, 1, 10);
    }
    if (regen > 5.0) {
      buffMaintain$2($effect`Disco Fever`, 120, 1, 10);
    }
    const preShield: Map<number, Item> = auto_saveEquipped();
    auto_equipAprilShieldBuff(); //get secondary buffs provided by shield when the trivial class skills are used
    if (myPrimestat() === $stat`Muscle`) {
      buffMaintain$2($effect`Seal Clubbing Frenzy`, 200, 5, 4);
      buffMaintain$2($effect`Patience of the Tortoise`, 200, 5, 4);
    }
    if (myPrimestat() === $stat`Moxie`) {
      buffMaintain$2($effect`Mariachi Mood`, 200, 5, 4);
      buffMaintain$2($effect`Disco State of Mind`, 200, 5, 4);
    }
    if (myPrimestat() === $stat`Mysticality`) {
      buffMaintain$2($effect`Saucemastery`, 200, 5, 4);
      buffMaintain$2($effect`Pasta Oneness`, 200, 5, 4);
    }
    auto_loadEquipped(preShield);
    if (familiarWeight(myFamiliar()) < 20) {
      buffMaintain$2($effect`Curiosity of Br'er Tarrypin`, 50, 1, 2);
    }
    // Only maintain in path with familiars
    if (pathHasFamiliar() && !toBoolean(getProperty("_auto_bad100Familiar"))) {
      buffMaintain$2($effect`Jingle Jangle Jingle`, 120, 1, 2); //familiar acts more often
    }
    buffMaintain$2($effect`A Few Extra Pounds`, 200, 1, 2);
    if (myClass() === $class`Turtle Tamer`) {
      buffMaintain$2($effect`Boon of the War Snapper`, 200, 1, 5);
      buffMaintain$2($effect`Boon of She-Who-Was`, 200, 1, 5);
      buffMaintain$2($effect`Boon of the Storm Tortoise`, 200, 1, 5);
    }

    buffMaintain$2($effect`Ruthlessly Efficient`, 50, 1, 5);
    buffMaintain$2($effect`Mathematically Precise`, 150, 1, 5);
    //		buffMaintain($effect[Rotten Memories], 150, 1, 10);

    if (inAftercore()) {
      if (auto_have_skill($skill`Summon Rad Libs`) && myMp() > 6) {
        useSkill(3, $skill`Summon Rad Libs`);
      }
      if (auto_have_skill($skill`Summon Geeky Gifts`) && myMp() > 5) {
        useSkill(1, $skill`Summon Geeky Gifts`);
      }
      if (auto_have_skill($skill`Summon Stickers`) && myMp() > 6) {
        useSkill(3, $skill`Summon Stickers`);
      }
      if (auto_have_skill($skill`Summon Sugar Sheets`) && myMp() > 6) {
        useSkill(3, $skill`Summon Sugar Sheets`);
      }
      if (auto_have_skill($skill`Rainbow Gravitation`)) {
        useSkill(3, $skill`Rainbow Gravitation`);
      }
    }

    if (libram !== Skill.none && myMp() - mpCost(libram) > 80) {
      useSkill(1, libram);
    }

    if (myMp() > 80) {
      buffMaintain$2($effect`Takin' It Greasy`, 50, 1, 5);
      buffMaintain$2($effect`Intimidating Mien`, 50, 1, 5);
    }

    if (didOutfit) {
      cliExecute("outfit Backup");
    }
  }
  // Experience and Powerlevelling Section
  if (myLevel() < 13 || toBoolean(getProperty("auto_disregardInstantKarma"))) {
    // +Stat expressions based on mainstat
    if (myPrimestat() === $stat`Muscle`) {
      auto_faceCheck($effect`Patient Smile`);
    }
    if (myPrimestat() === $stat`Moxie`) {
      auto_faceCheck($effect`Knowing Smile`);
    }
    if (myPrimestat() === $stat`Mysticality`) {
      // If Gaze succeeds Smile will fail the check and vice versa
      auto_faceCheck($effect`Inscrutable Gaze`);
      auto_faceCheck($effect`Wry Smile`);
    }
    // Catch-all Expressions in decending order of importance (in case we could not get a stat specific one)
    auto_faceCheck($effect`Inscrutable Gaze`);
    auto_faceCheck($effect`Wry Smile`);
    auto_faceCheck($effect`Patient Smile`);
    auto_faceCheck($effect`Knowing Smile`);

    if (myMeat() > meatReserve() + 5000) {
      //these are only worth it if you have lots of excess meat
      buffMaintain$2($effect`Carol of the Thrills`, 30, 1, 1); //3MP/adv for non ATs. +3 XP/fight
      buffMaintain$2($effect`Aloysius' Antiphon of Aptitude`, 40, 1, 1); //4MP/adv for non ATs. +3 XP/fight split equally 1 per stat.
    }
    // items which give stats
    buffMaintain$2($effect`Scorched Earth`);
    buffMaintain$2($effect`Wisdom of Others`);
    // Only use these if we've got plenty of meat and aren't max level
    // Otherwise we'll autosell them
    if (!auto_ignoreExperience() && myLevel() < 13) {
      for (const it of $items`Azurite, Eye Agate, Lapis Lazuli`) {
        if (itemAmount(it) > 0 && auto_is_valid(it)) {
          use(it, itemAmount(it));
        }
      }
    }
  }

  if (!inAftercore()) {
    if (
      myDaycount() === 1 &&
      myBjornedFamiliar() !== $familiar`Grim Brother` &&
      toInt(getProperty("_grimFairyTaleDropsCrown")) === 0 &&
      haveFamiliar($familiar`Grim Brother`) &&
      equippedItem($slot`back`) === $item`Buddy Bjorn` &&
      myFamiliar() !== $familiar`Grim Brother`
    ) {
      bjornifyFamiliar($familiar`Grim Brother`);
    }
    if (
      myBjornedFamiliar() === $familiar`Grimstone Golem` &&
      toInt(getProperty("_grimstoneMaskDropsCrown")) === 1 &&
      haveFamiliar($familiar`El Vibrato Megadrone`)
    ) {
      bjornifyFamiliar($familiar`El Vibrato Megadrone`);
    }
    if (
      myBjornedFamiliar() === $familiar`Grim Brother` &&
      toInt(getProperty("_grimFairyTaleDropsCrown")) >= 1 &&
      haveFamiliar($familiar`El Vibrato Megadrone`)
    ) {
      bjornifyFamiliar($familiar`El Vibrato Megadrone`);
    }
  }

  if (
    in_bugbear() &&
    itemAmount($item`key-o-tron`) > 0 &&
    myLocation().zone !== "Mothership"
  ) {
    if (
      $monsters`scavenger bugbear, hypodermic bugbear, batbugbear, bugbear scientist, bugaboo, Black Ops Bugbear, Battlesuit Bugbear Type, ancient unspeakable bugbear, trendy bugbear chef`.includes(
        lastMonster(),
      )
    ) {
      use(1, $item`key-o-tron`);
    }
  }

  if (in_heavyrains()) {
    auto_log_info(
      `Post adventure done: Thunder: ${myThunder()} Rain: ${myRain()} Lightning: ${myLightning()}`,
      "green",
    );
  }

  if (
    itemAmount($item`The Big Book of Pirate Insults`) > 0 &&
    (myLocation() === $location`Barrrney's Barrr` ||
      myLocation() === $location`The Obligatory Pirate's Cove`)
  ) {
    auto_log_info(`Have ${numPirateInsults()} insults.`, "green");
  }

  if (myLocation() === $location`The Broodling Grounds`) {
    auto_log_info(
      `Have ${itemAmount($item`hellseal brain`)} brain(s).`,
      "green",
    );
    auto_log_info(`Have ${itemAmount($item`hellseal hide`)} hide(s).`, "green");
    auto_log_info(
      `Have ${itemAmount($item`hellseal sinew`)} sinew(s).`,
      "green",
    );
  }

  if (myLocation() === $location`The Hidden Bowling Alley` && inAftercore()) {
    if (itemAmount($item`bowling ball`) > 0) {
      putCloset(itemAmount($item`bowling ball`), $item`bowling ball`);
    }
  }

  if (myLevel() < 13 && !inAftercore() && myMeat() > 7500) {
    if (itemAmount($item`pulled red taffy`) >= 6) {
      buffMaintain$2($effect`Cinnamon Challenger`, 0, 6, 10);
    }
    if (itemAmount($item`pulled orange taffy`) >= 6) {
      buffMaintain$2($effect`Orange Crusher`, 0, 6, 10);
    }
    if (itemAmount($item`pulled violet taffy`) >= 6) {
      buffMaintain$2($effect`Purple Reign`, 0, 6, 10);
    }

    buffMaintain$2($effect`Gummi-Grin`);
    buffMaintain$2($effect`Strong Resolve`);
    buffMaintain$2($effect`Irresistible Resolve`);
    buffMaintain$2($effect`Brilliant Resolve`);
    buffMaintain$2($effect`From Nantucket`);
    buffMaintain$2($effect`Squatting and Thrusting`);
    buffMaintain$2($effect`You Read The Manual`);
    buyableMaintain(
      $item`hair spray`,
      1,
      200,
      myClass() !== $class`Turtle Tamer`,
    );
    buyableMaintain(
      $item`blood of the Wereseal`,
      1,
      3500,
      monsterLevelAdjustment() > 135,
    );
    buyableMaintain($item`Ben-Gal™ Balm`, 1, 200);
  }

  buyableMaintain(
    $item`turtle pheromones`,
    1,
    800,
    myClass() === $class`Turtle Tamer`,
  );
  //Should we create a separate function to track these? How many are we going to track?
  if (
    lastMonster() === $monster`writing desk` &&
    getProperty("lastEncounter") === $monster`writing desk`.toString() &&
    haveEffect($effect`Beaten Up`) === 0
  ) {
    auto_log_info(
      `Fought ${getProperty("writingDesksDefeated")} writing desks.`,
      "blue",
    );
  }
  if (
    lastMonster() === $monster`modern zmobie` &&
    getProperty("lastEncounter") === $monster`modern zmobie`.toString() &&
    haveEffect($effect`Beaten Up`) === 0
  ) {
    setProperty(
      "auto_modernzmobiecount",
      `${toInt(getProperty("auto_modernzmobiecount")) + 1}`,
    );
    auto_log_info(
      `Fought ${getProperty("auto_modernzmobiecount")} modern zmobies.`,
      "blue",
    );
  }

  auto_beaten_handler();

  if (getProperty("lastEncounter") === "Welcome to the Great Overlook Lodge") {
    setProperty("auto_shinningStarted", true.toString());
  }

  if (haveEffect($effect`Disavowed`) > 0) {
    if (getProperty("_auto_bondBriefing") !== "finished") {
      setProperty("_auto_bondBriefing", "started");
    }
    if (
      auto_have_skill($skill`Disco Nap`) &&
      myMp() > mpCost($skill`Disco Nap`)
    ) {
      auto_log_warning("We have been disavowed...", "red");
      useSkill(1, $skill`Disco Nap`);
    } else {
      abort("We have been disavowed...");
    }
  }
  //Remove the mana cost reduction from maximize statement
  removeFromMaximize("-1000mana cost");
  removeProperty("auto_combatDirective");
  removeProperty("auto_digitizeDirective");
  //try to catch infinite loop where we repeatedly try to do the same thing.
  //works with code found in auto_pre_adv.ash
  if (mySessionAdv() === toInt(getProperty("_auto_inf_session_adv"))) {
    auto_log_debug$1(
      "auto_post_adv.js detected that no adventure was spent since last auto_pre_adv.js",
    );
    //count how many times in a row we went with no adv spent
    setProperty(
      "_auto_inf_counter",
      (toInt(getProperty("_auto_inf_counter")) + 1).toString(),
    );
    //if last monster changed it means we are doing free combats
    if (toMonster(getProperty("_auto_inf_last_monster")) !== lastMonster()) {
      removeProperty("_auto_inf_counter"); //reset counter
    }
    setProperty("_auto_inf_last_monster", lastMonster().toString());

    if (toInt(getProperty("_auto_inf_counter")) >= 30) {
      auto_log_error(
        `no adventure was spent ${getProperty("_auto_inf_counter")} times in a row which suggests we are stuck in an infinite loop. Stopping autoscend`,
      );
      removeProperty("_auto_inf_counter");
      setProperty("auto_interrupt", true.toString());
    } else if (toInt(getProperty("_auto_inf_counter")) > 10) {
      auto_log_warning$1(
        `no adventure was spent ${getProperty("_auto_inf_counter")} times in a row`,
      );
    }
  } else {
    //clear values
    removeProperty("_auto_inf_counter");
  }

  auto_log_info("Post Adventure done, beep.", "purple");
  return true;
}

export function main(): void {
  let ret: boolean = false;
  try {
    ret = auto_post_adventure();
  } finally {
    if (!ret) {
      auto_log_error(
        "Error running auto_post_adv.js, setting auto_interrupt=true",
      );
      setProperty("auto_interrupt", true.toString());
    }
  }
}
