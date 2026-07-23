import {
  buffedHitStat,
  containsText,
  equippedAmount,
  equippedItem,
  expectedDamage,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
  hippyStoneBroken,
  itemAmount,
  itemDrops,
  itemType,
  max,
  Monster,
  monsterDefense,
  monsterElement,
  monsterHp,
  monsterLevelAdjustment,
  monsterPhylum,
  mpCost,
  myBuffedstat,
  myClass,
  myFamiliar,
  myHp,
  myLocation,
  myMaxhp,
  myMp,
  numericModifier,
  setProperty,
  Skill,
  toBoolean,
  toInt,
} from "kolmafia";
import {
  $class,
  $classes,
  $effect,
  $element,
  $elements,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $phylum,
  $skill,
  $skills,
  $slot,
  $stat,
} from "libram";

import { possessEquipment } from "../auto_equipment";
import {
  auto_log_warning,
  auto_wantToSniff,
  handleTracker$1,
  internalQuestStatus,
  isGhost,
  stunnable,
} from "../auto_util";
import { auto_fireExtinguisherCharges } from "../iotms/mr2021";
import {
  auto_autumnatonQuestingIn,
  dronesOut,
  gooseExpectedDrones,
} from "../iotms/mr2022";
import {
  auto_dousesRemaining,
  auto_remainingCandyCaneSlashes,
} from "../iotms/mr2023";
import { auto_canNorthernExplosionFE, auto_wantToBCZ } from "../iotms/mr2025";
import { in_avantGuard } from "../paths/avant_guard";
import { inAftercore } from "../paths/casual";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { in_robot } from "../paths/you_robot";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  lumberCount,
} from "../quests/level_09";
import { needStarKey } from "../quests/level_13";
import { auto_combatMeatGolemStage3 } from "./auto_combat_adventurer_meats_world";
import { auto_combatHeavyRainsStage3 } from "./auto_combat_heavy_rains";
import {
  auto_useSkill,
  canSurvive,
  canUse,
  canUse$3,
  combat_status_add,
  enemyCanBlocksSkills,
  getSniffer,
  getStunner,
  haveUsed,
  isSniffed$1,
  maxRoundsToDouse,
  useItem,
  wantToDouse,
  wantToForceDrop,
} from "./auto_combat_util";
import { auto_combatZombieSlayerStage3 } from "./auto_combat_zombie_slayer";

//defined in /autoscend/combat/auto_combat_default_stage3.ash
export function auto_combatDefaultStage3(
  round_1: number,
  enemy: Monster,
  text: string,
): string {
  // stage 3 = debuff: delevel, stun, curse, damage over time
  // Set to false because instakills are in stage 2 and if we get here, it was not successful
  setProperty("auto_instakillSuccess", false.toString());
  //Unskip stage 2
  if (toBoolean(getProperty("auto_skipStage2"))) {
    setProperty("auto_skipStage2", false.toString());
  }
  //Skip stage 3 if set
  if (toBoolean(getProperty("auto_skipStage3"))) {
    return "";
  }
  // Path = Heavy Rains
  let retval: string = auto_combatHeavyRainsStage3(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = zombie slayer
  retval = auto_combatZombieSlayerStage3(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  // Path = Adventurer Meats World
  retval = auto_combatMeatGolemStage3(round_1, enemy, text);
  if (retval !== "") {
    return retval;
  }
  //delevel (10 + medicine_level)% in avatar of west of loathing path
  if (
    canUse($skill`Bad Medicine`) &&
    myMp() >= 3 * mpCost($skill`Bad Medicine`)
  ) {
    return auto_useSkill($skill`Bad Medicine`);
  }
  //boris specific 3MP skill that delevels by 15%, with an upgrade it delevels 30% and stuns.
  //even without the upgrade it it is worth it. actually without upgrade you need it more due to low skill.
  if (
    canUse($skill`Intimidating Bellow`) &&
    expectedDamage() > 0 &&
    !enemyCanBlocksSkills()
  ) {
    return auto_useSkill($skill`Intimidating Bellow`);
  }
  //if monster level adjustment is over 150 then they are immune to staggers. many deleveling skills also stagger.
  let enemy_la: number = monsterLevelAdjustment();
  //shape of a mole when using Llama lama gong. delevel by 5
  if (
    canUse($skill`Tunnel Downwards`) &&
    haveEffect($effect`Shape of...Mole!`) > 0 &&
    myLocation() === $location`Mt. Molehill`
  ) {
    return auto_useSkill($skill`Tunnel Downwards`);
  }
  //iotm skill that duplicates dropped items
  //prioritize grey goose over xo and extinguisher because the drones last multiple fights until they are consumed
  if (
    canUse($skill`Emit Matter Duplicating Drones`) &&
    myFamiliar() === $familiar`Grey Goose`
  ) {
    let emitDrones: boolean = false;
    const canExtingo: boolean =
      auto_fireExtinguisherCharges() > 30 &&
      canUse($skill`Fire Extinguisher: Polar Vortex`, false);

    const drones: boolean = gooseExpectedDrones() >= 1; //only want to try if we expect any number of drones.
    //dupe a sonar-in-a-biscuit if we're lucky, only want to try it if we need more than 1 biscuit
    if (
      $item`sonar-in-a-biscuit`.toString() in itemDrops(enemy) &&
      itemDrops(enemy).size <= 2 &&
      internalQuestStatus("questL04Bat") <= 1 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe stone wool
    if (
      $item`stone wool`.toString() in itemDrops(enemy) &&
      itemAmount($item`stone wool`) < 2 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe goat cheese
    if (
      enemy === $monster`dairy goat` &&
      !canExtingo &&
      itemAmount($item`goat cheese`) < 3 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe Smut Orc Keepsake
    if (
      enemy === $monster`smut orc pervert` &&
      auto_autumnatonQuestingIn() !== $location`The Smut Orc Logging Camp` &&
      myLocation() === $location`The Smut Orc Logging Camp` &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe some hedge trimmers if we're lucky
    if (
      !canExtingo &&
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
        enemy,
      ) &&
      auto_autumnatonQuestingIn() !== $location`Twin Peak` &&
      hedgeTrimmersNeeded() > 1 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe some stars/lines
    if (
      myLocation() === $location`The Hole in the Sky` &&
      $item`star`.toString() in itemDrops(enemy) &&
      $item`line`.toString() in itemDrops(enemy) &&
      needStarKey() &&
      itemAmount($item`star`) < 8 &&
      itemAmount($item`line`) < 7 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe some blackberries
    if (enemy === $monster`blackberry bush` && drones) {
      emitDrones = true;
    }
    //dupe some glark cables
    if (enemy === $monster`red butler` && drones) {
      emitDrones = true;
    }
    //dupe some bowling balls if we can't use an Industrial Fire Extinguisher
    if (
      !canExtingo &&
      enemy === $monster`pygmy bowler` &&
      toInt(getProperty("hiddenBowlingAlleyProgress")) +
        itemAmount($item`bowling ball`) <
        6 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe tomb ratchets if we're lucky
    if (
      enemy === $monster`tomb rat king` &&
      itemAmount($item`crumbling wooden wheel`) +
        itemAmount($item`tomb ratchet`) <
        10 &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe Cursed Dragon Wishbone and Cursed Bat Paw if in AoSOL
    if (
      $monsters`two-headed shadow bat, shadowboner shadowdagon`.includes(
        enemy,
      ) &&
      drones
    ) {
      emitDrones = true;
    }
    //dupe GROPs
    if (enemy === $monster`Green Ops Soldier` && drones) {
      emitDrones = true;
    }

    if (dronesOut()) {
      //If we have drones out, let's not use the skill again
      emitDrones = false;
    }

    if (emitDrones) {
      handleTracker$1(
        enemy.toString(),
        $skill`Emit Matter Duplicating Drones`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Emit Matter Duplicating Drones`);
    }
  }
  //iotm skill that can be used on any combat round, repeatedly until an item is stolen
  if (
    canUse($skill`Hugs and Kisses!`) &&
    myFamiliar() === $familiar`XO Skeleton` &&
    toInt(getProperty("_xoHugsUsed")) < 11
  ) {
    let forceDrop: boolean = false;
    if (
      $monsters`filthworm drone, filthworm royal guard, larval filthworm`.includes(
        enemy,
      )
    ) {
      forceDrop = true;
    }
    // reserve enough resources to force filthworm drops
    if (toInt(getProperty("_xoHugsUsed")) < 8) {
      // snatch a wig if we're lucky
      if (
        enemy === $monster`Burly Sidekick` &&
        !possessEquipment($item`Mohawk wig`)
      ) {
        forceDrop = true;
      }
      // snatch a hedge trimmer if we're lucky
      if (
        $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
          enemy,
        )
      ) {
        forceDrop = true;
      }
      // snatch a killing jar if we're lucky
      if (
        enemy === $monster`banshee librarian` &&
        0 === itemAmount($item`killing jar`)
      ) {
        forceDrop = true;
      }
      // snatch a sonar-in-a-biscuit if we're lucky
      if (
        $item`sonar-in-a-biscuit`.toString() in itemDrops(enemy) &&
        itemDrops(enemy).size <= 2 &&
        getProperty("questL04Bat") !== "finished"
      ) {
        forceDrop = true;
      }
    }

    if (forceDrop) {
      handleTracker$1(
        enemy.toString(),
        $skill`Hugs and Kisses!`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Hugs and Kisses!`);
    }
  }

  if (
    wantToDouse(enemy) &&
    round_1 <= maxRoundsToDouse(enemy) &&
    !toBoolean(getProperty("_douseFoeSuccess"))
  ) {
    // dousing can have a low chance of success, so only do it for a while
    const douse: Skill = $skill`Douse Foe`;
    const douseAvailable: boolean =
      canUse(douse, false) && auto_dousesRemaining() > 0;
    if (douseAvailable) {
      handleTracker$1(enemy.toString(), douse.toString(), "auto_otherstuff");
      return auto_useSkill(douse);
    }
  }

  if (wantToForceDrop(enemy)) {
    const polarVortexAvailable: boolean =
      canUse($skill`Fire Extinguisher: Polar Vortex`, false) &&
      auto_fireExtinguisherCharges() > 10;
    const mildEvilAvailable: boolean =
      canUse($skill`Perpetrate Mild Evil`, false) &&
      toInt(getProperty("_mildEvilPerpetrated")) < 3;
    const swoopAvailable: boolean =
      canUse($skill`Swoop like a Bat`, true) &&
      toInt(getProperty("_batWingsSwoopUsed")) < 11;
    // mild evil and swoop can only pick pocket. Use them before fire extinguisher
    if (swoopAvailable) {
      handleTracker$1(
        enemy.toString(),
        $skill`Swoop like a Bat`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Swoop like a Bat`);
    }
    if (mildEvilAvailable) {
      handleTracker$1(
        enemy.toString(),
        $skill`Perpetrate Mild Evil`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Perpetrate Mild Evil`);
    }
    if (polarVortexAvailable) {
      handleTracker$1(
        enemy.toString(),
        $skill`Fire Extinguisher: Polar Vortex`.toString(),
        "auto_otherstuff",
      );
      return auto_useSkill($skill`Fire Extinguisher: Polar Vortex`);
    }
  }
  //delevel ~3% per combat round for rest of combat.
  //if sauceror and you kill enemy with a spell you regain up to 50MP. this is the primary source of MP for a sauceror.
  //with itchy curse finger skill it will also stagger on the turn it is cast
  let doWeaksauce: boolean = true;
  if (buffedHitStat() - 20 > monsterDefense()) {
    doWeaksauce = false;
  }
  if (myClass() === $class`Sauceror`) {
    doWeaksauce = true;
  }
  if (enemy === $monster`invader bullet`) {
    doWeaksauce = false;
  }
  if (
    canUse($skill`Curse of Weaksauce`) &&
    haveSkill($skill`Itchy Curse Finger`) &&
    myMp() >= 60 &&
    doWeaksauce
  ) {
    return auto_useSkill($skill`Curse of Weaksauce`);
  }
  //[Eldritch Tentacle] is Immune to Stuns, Staggers, automatic kills and has a 50% resistance to Deleveling
  if (enemy === $monster`Eldritch Tentacle`) {
    enemy_la = 151;
  }

  if (enemy === $monster`invader bullet`) {
    enemy_la = 151;
  }

  if (
    $monsters`Naughty Sorceress, Naughty Sorceress (2)`.includes(enemy) &&
    !toBoolean(getProperty("auto_confidence"))
  ) {
    enemy_la = 151;
  }
  // some dark gyffte boss's are stagger immune
  if (
    $monsters`%alucard%, Jake Norris, Ricardo Belmont, Jayden Belmont, Sharona, Greg Dagreasy, Travis Belmont, Chad Alacarte`.includes(
      enemy,
    )
  ) {
    enemy_la = 151;
  }
  //Default behaviors:
  if (enemy_la <= 150) {
    //enemy has not been rendered immune to staggering from monster level
    if (
      canUse($skill`Curse of Weaksauce`) &&
      haveSkill($skill`Itchy Curse Finger`) &&
      myMp() >= 60 &&
      doWeaksauce
    ) {
      return auto_useSkill($skill`Curse of Weaksauce`);
    }
    //HP reduction if the monster has high HP
    if (monsterHp() > 1500 || enemy.physicalResistance > 90) {
      if (
        canUse($skill`Surprisingly Sweet Slash`) &&
        auto_remainingCandyCaneSlashes() > 1
      ) {
        // reserve a slash for wall of bones
        return auto_useSkill($skill`Surprisingly Sweet Slash`); // 75% less HP
      }
      if (canUse$3($item`autumnic bomb`)) {
        //50% less hp && prismatic damage on hit
        return useItem($item`autumnic bomb`);
      }
    }
    // delevel and 75% less HP if you have a candy cane sword cane
    // Need this separate because want to reserve the Slash in Avant Guard for high HP bodyguards
    if (
      canUse($skill`Surprisingly Sweet Slash`) &&
      !in_avantGuard() &&
      auto_remainingCandyCaneSlashes() > 1
    ) {
      // reserve a slash for wall of bones
      return auto_useSkill($skill`Surprisingly Sweet Slash`);
    }
    //delevel if you have a loofah lei
    if (canUse($skill`Loofah Lei Lasso`)) {
      return auto_useSkill($skill`Loofah Lei Lasso`);
    }

    if ($item`Daily Affirmation: Keep Free Hate in your Heart`.combat) {
      if (
        canUse$3($item`Daily Affirmation: Keep Free Hate in your Heart`) &&
        inAftercore() &&
        hippyStoneBroken() &&
        !toBoolean(getProperty("_affirmationHateUsed"))
      ) {
        return useItem($item`Daily Affirmation: Keep Free Hate in your Heart`);
      }
    }

    if (canUse($skill`Canhandle`)) {
      if (
        $items`Frigid Northern Beans, Heimz Fortified Kidney Beans, Hellfire Spicy Beans, Mixed Garbanzos and Chickpeas, Pork 'n' Pork 'n' Pork 'n' Beans, Shrub's Premium Baked Beans, Tesla's Electroplated Beans, Trader Olaf's Exotic Stinkbeans, World's Blackest-Eyed Peas`.includes(
          equippedItem($slot`off-hand`),
        )
      ) {
        return auto_useSkill($skill`Canhandle`);
      }
    }

    if (
      canUse($skill`Curse of Weaksauce`) &&
      myClass() === $class`Sauceror` &&
      doWeaksauce
    ) {
      //Saucerors use Weaksauce to get MP, but no more MP will be coming if there isn't enough MP left to cast a spell, mortar can not have been launched yet at this point
      //if mp >= 60 Weaksauce has probably been cast above already
      const MPafterWeaksauce: number =
        myMp() - mpCost($skill`Curse of Weaksauce`);
      let canCastAfterWeaksauce: boolean = false;
      for (const sp of $skills`Saucestorm, Stuffed Mortar Shell, Saucegeyser`) {
        if (canUse(sp, false) && MPafterWeaksauce >= mpCost(sp)) {
          canCastAfterWeaksauce = true;
          break;
        }
      }
      if (!canCastAfterWeaksauce) {
        if (
          canUse($skill`Wave of Sauce`, false) &&
          monsterElement(enemy) !== $element`hot` &&
          MPafterWeaksauce >= mpCost($skill`Wave of Sauce`)
        ) {
          canCastAfterWeaksauce = true;
        } else if (
          canUse($skill`Saucecicle`, false) &&
          monsterElement(enemy) !== $element`cold` &&
          MPafterWeaksauce >= mpCost($skill`Saucecicle`)
        ) {
          canCastAfterWeaksauce = true;
        }
      }
      if (canCastAfterWeaksauce) {
        return auto_useSkill($skill`Curse of Weaksauce`);
      }
    }

    if (canUse($skill`Detect Weakness`)) {
      return auto_useSkill($skill`Detect Weakness`);
    }

    if (canUse($skill`Deploy Robo-Handcuffs`)) {
      return auto_useSkill($skill`Deploy Robo-Handcuffs`);
    }

    if (canUse($skill`Pocket Crumbs`)) {
      return auto_useSkill($skill`Pocket Crumbs`);
    }

    if (canUse($skill`Micrometeorite`)) {
      return auto_useSkill($skill`Micrometeorite`);
    }

    if (canUse$3($item`cow poker`)) {
      if (
        $monsters`caugr, moomy, Pharaoh Amoon-Ra Cowtep, pyrobove, spidercow`.includes(
          enemy,
        )
      ) {
        return useItem($item`cow poker`);
      }
    }

    if (canUse$3($item`western-style skinning knife`)) {
      if (
        $monsters`caugr, coal snake, diamondback rattler, frontwinder, grizzled bear, mountain lion`.includes(
          enemy,
        )
      ) {
        return useItem($item`western-style skinning knife`);
      }
    }

    if (
      myLocation() === $location`The Smut Orc Logging Camp` &&
      canSurvive(1.0) &&
      toInt(getProperty("chasmBridgeProgress")) < bridgeGoal()
    ) {
      const coldMortarShell: boolean =
        canUse($skill`Stuffed Mortar Shell`) &&
        haveEffect($effect`Spirit of Peppermint`) !== 0;
      let coldSkillToUse: Skill = Skill.none;
      let coldAttackDamageMultiplier: number = 1;
      if (myClass() === $class`Seal Clubber`) {
        if (canUse($skill`Lunging Thrust-Smack`, false)) {
          coldAttackDamageMultiplier = 3; //triple elemental bonus
        } else if (canUse($skill`Thrust-Smack`, false)) {
          coldAttackDamageMultiplier = 2; //double elemental bonus
        }
      }
      const coldAttackDamage: number = toInt(
        numericModifier("cold damage") * coldAttackDamageMultiplier,
      ); //todo add ML damage multiplier
      // Listed from Most to Least Damaging to hopefully cause Death on the turn when the Shell hits.
      if (
        canUse($skill`Saucegeyser`, false) &&
        numericModifier("Cold Spell Damage") >
          numericModifier("Hot Spell Damage")
      ) {
        //100% chance of cold Saucegeyser
        coldSkillToUse = $skill`Saucegeyser`;
      } else if (canUse($skill`Saucecicle`, false)) {
        coldSkillToUse = $skill`Saucecicle`;
      } else if (
        canUse($skill`Cannelloni Cannon`, false) &&
        haveEffect($effect`Spirit of Peppermint`) !== 0
      ) {
        coldSkillToUse = $skill`Cannelloni Cannon`;
      } else if (
        canUse($skill`Northern Explosion`, false) &&
        !auto_canNorthernExplosionFE()
      ) {
        coldSkillToUse = $skill`Northern Explosion`;
      } else if (
        monsterLevelAdjustment() < -65 &&
        canUse($skill`Saucestorm`, false)
      ) {
        //in extreme case where orcs are reduced to few HP by -ML Saucestorm is better than 50% chance of cold Saucegeyser
        //todo compare actual damage predictions instead
        coldSkillToUse = $skill`Saucestorm`;
      } else if (coldAttackDamage > 3 * max(1, 69 + monsterLevelAdjustment())) {
        //cold bonus weapon attack can also be better than 50% chance of cold Saucegeyser
        //todo compare actual damage predictions instead
        if (myClass() === $class`Seal Clubber`) {
          if (canUse($skill`Lunging Thrust-Smack`, false)) {
            coldSkillToUse = $skill`Lunging Thrust-Smack`; //triple elemental bonus
          } else if (canUse($skill`Thrust-Smack`, false)) {
            coldSkillToUse = $skill`Thrust-Smack`; //double elemental bonus
          } else if (canUse($skill`Lunge Smack`, false)) {
            coldSkillToUse = $skill`Lunge Smack`;
          }
        }
        //other classes default to regular attack later
      } else if (
        canUse($skill`Saucegeyser`, false) &&
        numericModifier("Cold Spell Damage") ===
          numericModifier("Hot Spell Damage")
      ) {
        //equal is 50% chance of cold Saucegeyser. "cold > hot" is used higher in priority. "cold < hot" is 100% hot Saucegeyser and not worth using
        coldSkillToUse = $skill`Saucegeyser`;
      } else if (in_nuclear() && canUse($skill`Throat Refrigerant`, false)) {
        coldSkillToUse = $skill`Throat Refrigerant`;
      }

      let MPreservedForColdSpells: number = coldMortarShell
        ? mpCost($skill`Stuffed Mortar Shell`)
        : 0;
      if (coldSkillToUse !== Skill.none) {
        MPreservedForColdSpells += mpCost(coldSkillToUse);
      }
      // Mating Call has unlimited uses and a small effect so unlike other sniff skills there is no reason not to use it here to balance bridge parts except MP cost
      if (
        canUse($skill`Gallapagosian Mating Call`, false) &&
        myMp() >=
          MPreservedForColdSpells + mpCost($skill`Gallapagosian Mating Call`)
      ) {
        let useMiniSniff: boolean = false;
        const sniffedLumber: boolean =
          isSniffed$1($monster`smut orc pipelayer`) ||
          isSniffed$1($monster`smut orc jacker`);
        const sniffedFastener: boolean =
          isSniffed$1($monster`smut orc screwer`) ||
          isSniffed$1($monster`smut orc nailer`);
        const haveLumberBias: boolean =
          equippedAmount($item`logging hatchet`) > 0 &&
          equippedAmount($item`loadstone`) === 0;
        const haveFastenerBias: boolean =
          equippedAmount($item`loadstone`) > 0 &&
          equippedAmount($item`logging hatchet`) === 0;

        if (
          enemy === $monster`smut orc pipelayer` ||
          enemy === $monster`smut orc jacker`
        ) {
          if (!sniffedLumber) {
            if (fastenerCount() >= 30 && lumberCount() < 29) {
              useMiniSniff = true;
            } else if (haveFastenerBias && fastenerCount() >= lumberCount()) {
              //will get more fastener from Loadstone
              useMiniSniff = true;
            } else if (fastenerCount() > lumberCount() + 2) {
              //have more fastener, try to make up for it
              useMiniSniff = true;
            } else if (
              sniffedFastener &&
              !haveLumberBias &&
              fastenerCount() > lumberCount()
            ) {
              //may have sniffed fastener too hard
              useMiniSniff = true;
            }
          }
        } else if (
          enemy === $monster`smut orc screwer` ||
          enemy === $monster`smut orc nailer`
        ) {
          if (!sniffedFastener) {
            if (lumberCount() >= 30 && fastenerCount() < 29) {
              useMiniSniff = true;
            } else if (haveLumberBias && lumberCount() >= fastenerCount()) {
              //will get more lumber from Logging Hatchet
              useMiniSniff = true;
            } else if (lumberCount() > fastenerCount() + 2) {
              //have more lumber, try to make up for it
              useMiniSniff = true;
            } else if (
              sniffedLumber &&
              !haveFastenerBias &&
              lumberCount() > fastenerCount()
            ) {
              //may have sniffed lumber too hard
              useMiniSniff = true;
            }
          }
        }
        if (useMiniSniff) {
          handleTracker$1(
            enemy.toString(),
            $skill`Gallapagosian Mating Call`.toString(),
            "auto_sniffs",
          );
          return auto_useSkill($skill`Gallapagosian Mating Call`, false);
        }
      }

      if (coldMortarShell) {
        return auto_useSkill($skill`Stuffed Mortar Shell`);
      } else if (coldSkillToUse !== Skill.none) {
        return auto_useSkill(coldSkillToUse, false);
      } else if (
        !in_robot() &&
        $classes`Seal Clubber, Turtle Tamer, Pastamancer, Sauceror, Disco Bandit, Accordion Thief`.includes(
          myClass(),
        )
      ) {
        if (
          coldAttackDamage > 69 + monsterLevelAdjustment() &&
          coldAttackDamage > 0
        ) {
          //if cold damage bonus > their health make sure an attack that uses elemental bonus gets to be used
          if (myClass() === $class`Seal Clubber`) {
            if (canUse($skill`Lunging Thrust-Smack`, false)) {
              return auto_useSkill($skill`Lunging Thrust-Smack`, false); //triple elemental bonus
            } else if (canUse($skill`Thrust-Smack`, false)) {
              return auto_useSkill($skill`Thrust-Smack`, false); //double elemental bonus
            } else if (canUse($skill`Lunge Smack`, false)) {
              return auto_useSkill($skill`Lunge Smack`, false);
            } else {
              return "attack with weapon";
            }
          } else {
            return "attack with weapon";
          }
        } else if (
          monsterLevelAdjustment() <= -25 &&
          canUse($skill`Saucestorm`, false)
        ) {
          //todo check predicted damage instead of arbitrary values
          auto_log_warning(
            "None of the best [cold] skills available against smut orcs but trying weaker alternative in view of the negative monster level.",
            "red",
          );
          return auto_useSkill($skill`Saucestorm`, false);
        } else {
          auto_log_warning(
            "None of our preferred [cold] skills available against smut orcs. Engaging in Fisticuffs.",
            "red",
          );
        }
      }
    }

    if (
      myLocation() === $location`The Haunted Kitchen` &&
      canUse($skill`Become a Cloud of Mist`) &&
      toInt(getProperty("_vampyreCloakeFormUses")) < 10
    ) {
      const hot: number = toInt(numericModifier("Hot Resistance"));
      const stench: number = toInt(numericModifier("Stench Resistance"));

      if (
        ((hot < 9 && hot % 3 !== 0) || (stench < 9 && stench % 3 !== 0)) &&
        canUse($skill`Become a Cloud of Mist`)
      ) {
        return auto_useSkill($skill`Become a Cloud of Mist`);
      }
    }

    if (
      enemy === $monster`dirty thieving brigand` &&
      canUse($skill`Become a Wolf`) &&
      toInt(getProperty("_vampyreCloakeFormUses")) < 10
    ) {
      return auto_useSkill($skill`Become a Wolf`);
    }

    if (canUse($skill`Air Dirty Laundry`)) {
      return auto_useSkill($skill`Air Dirty Laundry`);
    }

    if (canUse($skill`Cowboy Kick`)) {
      return auto_useSkill($skill`Cowboy Kick`);
    }

    if (canUse($skill`Fire Death Ray`)) {
      return auto_useSkill($skill`Fire Death Ray`);
    }

    if (canUse($skill`Ply Reality`)) {
      return auto_useSkill($skill`Ply Reality`);
    }

    if (canUse$3($item`Rain-Doh indigo cup`)) {
      return useItem($item`Rain-Doh indigo cup`);
    }

    if (canUse($skill`Summon Love Mosquito`)) {
      return auto_useSkill($skill`Summon Love Mosquito`);
    }

    if (canUse$3($item`tomayohawk-style reflex hammer`)) {
      return useItem($item`tomayohawk-style reflex hammer`);
    }
    //If you have tearaway pants equipped, use its skill
    if (
      canUse($skill`Tear Away your Pants!`) &&
      ((getProperty("auto_forceNonCombatSource") === "" &&
        !(
          auto_wantToSniff(enemy, myLocation()) &&
          getSniffer(enemy) !== Skill.none
        )) ||
        monsterPhylum() === $phylum`plant`)
    ) {
      return auto_useSkill($skill`Tear Away your Pants!`);
    }
    // skills from Lathe weapons
    // Ebony Epee
    if (canUse($skill`Disarming Thrust`)) {
      return auto_useSkill($skill`Disarming Thrust`);
    }
    // Weeping Willow Wand
    if (canUse($skill`Barrage of Tears`)) {
      return auto_useSkill($skill`Barrage of Tears`);
    }
    // Poison Dart (from beechwood blowgun) is not used here
    // because it does not stagger the enemy like the others

    if (
      canUse($skill`Cadenza`) &&
      itemType(equippedItem($slot`weapon`)) === "accordion"
    ) {
      if (
        $items`Accordion of Jordion, accordionoid rocca, non-Euclidean non-accordion, Shakespeare's Sister's Accordion, zombie accordion`.includes(
          equippedItem($slot`weapon`),
        )
      ) {
        return auto_useSkill($skill`Cadenza`);
      }
    }
    //source terminal iotm specific skill to acquire source essence from enemies
    if (
      canUse($skill`Extract`) &&
      myMp() > mpCost($skill`Extract`) * 3 &&
      itemAmount($item`Source essence`) <= 60 &&
      canSurvive(2.0)
    ) {
      return auto_useSkill($skill`Extract`);
    }

    if (
      canUse($skill`Extract Jelly`) &&
      myMp() > mpCost($skill`Extract Jelly`) * 3 &&
      canSurvive(2.0) &&
      myFamiliar() === $familiar`Space Jellyfish` &&
      toInt(getProperty("_spaceJellyfishDrops")) < 3 &&
      $elements`hot, spooky, stench`.includes(monsterElement(enemy))
    ) {
      return auto_useSkill($skill`Extract Jelly`);
    }

    if (
      canUse($skill`Science! Fight with Medicine`) &&
      myHp() * 2 < myMaxhp()
    ) {
      return auto_useSkill($skill`Science! Fight with Medicine`);
    }
    if (
      canUse($skill`Science! Fight with Rational Thought`) &&
      haveEffect($effect`Rational Thought`) < 10
    ) {
      return auto_useSkill($skill`Science! Fight with Rational Thought`);
    }

    if (canUse$3($item`Time-Spinner`)) {
      return useItem($item`Time-Spinner`);
    }

    if (canUse($skill`Sing Along`)) {
      //15% devel, but no stun.

      if (canSurvive(2.0) && getProperty("boomBoxSong") === "Remainin' Alive") {
        return auto_useSkill($skill`Sing Along`);
      }
      //this is for increasing meat income. gain +25 meat per monster, at the cost of letting it act once. If healing is too costly this can be a net loss of meat. until a full cost calculator is made, limit to under 10 HP damage and no more than 20% of your remaining HP.

      if (
        canSurvive(5.0) &&
        getProperty("boomBoxSong") === "Total Eclipse of Your Meat" &&
        expectedDamage() < 10 &&
        !in_wotsf()
      ) {
        return auto_useSkill($skill`Sing Along`);
      }
      //if doing nuns quest or wall of meat, disregard profit and only check if you can survive using sing along.

      if (
        canSurvive(3.0) &&
        getProperty("boomBoxSong") === "Total Eclipse of Your Meat" &&
        $monsters`dirty thieving brigand, wall of meat`.includes(enemy)
      ) {
        return auto_useSkill($skill`Sing Along`);
      }
    }
  }
  //Default behaviors, multi-staggers when chance is 50% or greater
  if (enemy_la < 100 && stunnable(enemy)) {
    if (canUse$3($item`Rain-Doh blue balls`)) {
      return useItem($item`Rain-Doh blue balls`);
    }

    if (canUse($skill`Summon Love Gnats`)) {
      return auto_useSkill($skill`Summon Love Gnats`);
    }

    if (!(haveEquipped($item`protonic accelerator pack`) && isGhost(enemy))) {
      if (
        canUse($skill`Summon Love Stinkbug`) &&
        haveUsed($skill`Summon Love Gnats`) &&
        !containsText(text, "STUN RESIST")
      ) {
        return auto_useSkill($skill`Summon Love Stinkbug`);
      }
    }
  }
  //weaksauce has probably already been cast in one of several checks above, except when above 150 ML, or without itchy curse finger or mp < 60
  if (
    canUse($skill`Curse of Weaksauce`) &&
    myClass() === $class`Sauceror` &&
    (myMp() >= 32 || haveUsed($skill`Stuffed Mortar Shell`)) &&
    doWeaksauce
  ) {
    return auto_useSkill($skill`Curse of Weaksauce`);
  }
  //turtle tamer specific damage over time
  if (
    myClass() === $class`Turtle Tamer` &&
    canUse($skill`Spirit Snap`) &&
    myMp() > 80
  ) {
    //storm turtle blessings makes spirit snap cause 15/20/25% buffed muscle as DoT for rest of combat
    //must not block stage4 so should not use if it will kill the monster
    if (
      (haveEffect($effect`Blessing of the Storm Tortoise`) > 0 &&
        monsterHp() > 0.15 * myBuffedstat($stat`Muscle`)) ||
      (haveEffect($effect`Grand Blessing of the Storm Tortoise`) > 0 &&
        monsterHp() > 0.2 * myBuffedstat($stat`Muscle`)) ||
      (haveEffect($effect`Glorious Blessing of the Storm Tortoise`) > 0 &&
        monsterHp() > 0.25 * myBuffedstat($stat`Muscle`))
    ) {
      return auto_useSkill($skill`Spirit Snap`);
    }
  }
  // Multi-round stuns
  if (canUse($skill`Thunderstrike`) && enemy_la <= 150 && !canSurvive(5.0)) {
    combat_status_add("stunned");
    return auto_useSkill($skill`Thunderstrike`);
  }

  if (
    enemy_la <= 100 &&
    stunnable(enemy) &&
    (!canSurvive(5.0) || $monsters`Groar`.includes(enemy))
  ) {
    const stunner: Skill = getStunner(enemy);
    if (stunner !== Skill.none) {
      combat_status_add("stunned");
      return auto_useSkill(stunner);
    }
  }
  if (
    auto_wantToBCZ($skill`BCZ: Blood Geyser`) &&
    canUse($skill`BCZ: Blood Geyser`) &&
    enemy_la <= 150 &&
    !canSurvive(5.0)
  ) {
    combat_status_add("stunned");
    return auto_useSkill($skill`BCZ: Blood Geyser`);
  }

  return "";
}
