import {
  abort,
  availableChoiceOptions,
  canDrink,
  canEat,
  containsText,
  equippedAmount,
  getProperty,
  handlingChoice,
  isWearingOutfit,
  itemAmount,
  lastChoice,
  myLevel,
  myLocation,
  myMeat,
  myPrimestat,
  myTurncount,
  runChoice,
  setProperty,
  toBoolean,
  toInt,
} from "kolmafia";
import { $item, $location, $stat, get } from "libram";

import { possessEquipment } from "./auto_equipment";
import {
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  currentPoolSkill,
  internalQuestStatus,
  poolSkillPracticeGains,
} from "./auto_util";
import { auto_reagnimatedGetPart } from "./iotms/mr2012";
import { doghouseChoiceHandler } from "./iotms/mr2015";
import { neverendingPartyChoiceHandler } from "./iotms/mr2018";
import {
  cartographyChoiceHandler,
  mushroomGardenChoiceHandler,
} from "./iotms/mr2020";
import { juneCleaverChoiceHandler } from "./iotms/mr2022";
import { dartChoiceHandler } from "./iotms/mr2024";
import { mobiusChoiceHandler, peridotChoiceHandler } from "./iotms/mr2025";
import { legendaryNoodlesChoiceHandler } from "./iotms/mr2026";
import {
  edUnderworldChoiceHandler,
  isActuallyEd,
} from "./paths/actually_ed_the_undying";
import { is_boris } from "./paths/avatar_of_boris";
import { in_bhy } from "./paths/bees_hate_you";
import { in_bugbear } from "./paths/bugbear_invasion";
import { bat_reallyPickSkills } from "./paths/dark_gyffte";
import { in_glover } from "./paths/g_lover";
import { koe_RationingOutDestruction } from "./paths/kingdom_of_exploathing";
import { kolhsChoiceHandler } from "./paths/kolhs";
import { in_lar } from "./paths/live_ascend_repeat";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_quantumTerrarium } from "./paths/quantum_terrarium";
import { robot_choice_adv } from "./paths/you_robot";
import { spookyForestChoiceHandler } from "./quests/level_02";
import { cyrptChoiceHandler } from "./quests/level_07";
import {
  itznotyerzitzMineChoiceHandler,
  theeXtremeSlopeChoiceHandler,
} from "./quests/level_08";
import {
  castleBasementChoiceHandler,
  castleTopFloorChoiceHandler,
  L10_needUmbrella,
} from "./quests/level_10";
import {
  blackForestChoiceHandler,
  hauntedBedroomChoiceHandler,
  hiddenCityChoiceHandler,
  hiddenTempleChoiceHandler,
} from "./quests/level_11";
import { haveWarOutfit } from "./quests/level_12";
import {
  dailyDungeonChoiceHandler,
  oldLandfillChoiceHandler,
} from "./quests/level_any";
import {
  barrrneysBarrrChoiceHandler,
  fcleChoiceHandler,
  piratesCoveChoiceHandler,
} from "./quests/optional";

const GOAL_AUTOMATED_CHOICES = new Set<number>([
  // Violet Fog
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66,
  67, 68, 69, 70,
  // The Louvre
  904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914,
  // Ronald Safety Shelter Map
  535,
  // Grimace Safety Shelter Map
  536,
  // Interview With You
  546,
  // A Lost Room
  594,
  // A Gracious Maze
  665,
]);

function auto_run_choice(choice: number, page: string): boolean {
  if (robot_choice_adv(choice, page)) {
    // an override function for You, Robot path.
    return true;
  }

  auto_log_debug("Running auto_choice_adv.js");
  const options: Map<number, string> = new Map(
    Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]),
  );

  {
    switch (choice) {
      case 15: // Yeti Nother Hippy (The eXtreme Slope)
      case 16: // Saint Beernard (The eXtreme Slope)
      case 17: // Generic Teen Comedy Snowboarding Adventure (The eXtreme Slope)
        theeXtremeSlopeChoiceHandler(choice);
        break;
      case 18: // A Flat Miner (Itznotyerzitz Mine)
      case 19: // 100% Legal (Itznotyerzitz Mine)
      case 20: // See You Next Fall (Itznotyerzitz Mine)
        itznotyerzitzMineChoiceHandler(choice);
        break;
      case 21: // Under the Knife (The Sleazy Back Alley)
        auto_runChoice(2); // skip
        break;
      case 22: // The Arrrbitrator (The Obligatory Pirate's Cove)
      case 23: // Barrie Me at Sea (The Obligatory Pirate's Cove)
      case 24: // Amatearrr Night (The Obligatory Pirate's Cove)
        piratesCoveChoiceHandler(choice);
        break;
      case 89: // Out in the Garden (The Haunted Gallery)
        if (
          isActuallyEd() &&
          (!possessEquipment($item`serpentine sword`) ||
            !possessEquipment($item`snake shield`))
        ) {
          auto_runChoice(2); // fight the snake knight (should non-Ed classes/paths do this too?)
        } else {
          auto_runChoice(4); // ignore the NC & banish it for 10 adv
        }
        break;
      case 90: // Curtains (The Haunted Ballroom)
        auto_runChoice(3); // skip
        break;
      case 105: // Having a Medicine Ball (The Haunted Bathroom)
        if (myPrimestat() === $stat`Mysticality`) {
          auto_runChoice(1); // get mysticality substats
        } else {
          auto_runChoice(2); // go to Bad Medicine is What You Need (#107)
        }
        break;
      case 106: // Strung-Up Quartet (The Haunted Ballroom)
        auto_runChoice(3); // +5% item drops everywhere
        break;
      case 107: // Bad Medicine is What You Need (The Haunted Bathroom)
        auto_runChoice(4); // skip
        break;
      case 108: // Aww, Craps (The Sleazy Back Alley)
        auto_runChoice(4); // skip
        break;
      case 109: // Dumpster Diving (The Sleazy Back Alley)
        if (options.has(4)) {
          auto_runChoice(4); // 11-leaf clover with candy cane sword cane equipped
        } else {
          auto_runChoice(1); // fight a drunken half-orc hobo
        }
        break;
      case 110: // The Entertainer (The Sleazy Back Alley)
        auto_runChoice(4); // skip
        break;
      case 111: // Malice in Chains (Outskirts of Cobb's Knob)
        auto_runChoice(3); // fight a sleeping Knob Goblin guard
        break;
      case 112: // Please, Hammer (The Sleazy Back Alley)
        auto_runChoice(2); // skip
        break;
      case 113: // Knob Gobin BBQ (Outskirts of Cobb's Knob)
        auto_runChoice(2); // fight a Knob Goblin Barbecue Team
        break;
      case 114: // The Baker's Dilemma (The Haunted Pantry)
        auto_runChoice(2); // skip
        break;
      case 115: // Oh No, Hobo (The Haunted Pantry)
        auto_runChoice(1); // fight a drunken half-orc hobo
        break;
      case 116: // The Singing Tree (Rustling) (The Haunted Pantry)
        auto_runChoice(4); // skip
        break;
      case 117: // Trespasser (The Haunted Pantry)
        auto_runChoice(1); // fight a Knob Goblin Assistant Chef
        break;
      case 118: // When Rocks Attack (Outskirts of Cobb's Knob)
        auto_runChoice(2); // skip
        break;
      case 120: // Ennui is Wasted on the Young (Outskirts of Cobb's Knob)
        auto_runChoice(4); // skip
        break;
      case 123: // At Least It's Not Full Of Trash (The Hidden Temple)
      case 125: // No Visible Means of Support (The Hidden Temple)
        hiddenTempleChoiceHandler(choice, page);
        break;
      case 139: // Bait and Switch (The Hippy Camp (Verge of War))
        if (options.has(4) && haveWarOutfit()) {
          auto_runChoice(4); // use your candy cane sword cane to skip to the war start
        } else {
          auto_runChoice(3); // fight a War Hippy (space) cadet for outfit pieces
        }
        break;
      case 140: // The Thin Tie-Dyed Line (The Hippy Camp (Verge of War))
        if (options.has(4) && haveWarOutfit()) {
          auto_runChoice(4); // use your candy cane sword cane to skip to the war start
        } else {
          auto_runChoice(3); // fight a War Hippy drill sergeant for outfit pieces
        }
        break;
      case 141: // Blockin' Out the Scenery (The Hippy Camp (Verge of War) wearing Frat Boy Ensemble)
        auto_runChoice(1); // get 50 mysticality
        break;
      case 142: // Blockin' Out the Scenery (The Hippy Camp (Verge of War) wearing Frat Warrior Fatigues)
        auto_runChoice(3); // starts the war. skips adventure if already started.
        break;
      case 143: // Catching Some Zetas (Orcish Frat House (Verge of War))
        if (options.has(4) && haveWarOutfit()) {
          auto_runChoice(4); // use your candy cane sword cane to skip to the war start
        } else {
          auto_runChoice(3); // fight a War Pledge for outfit pieces
        }
        break;
      case 144: // One Less Room Than In That Movie (Orcish Frat House (Verge of War))
        if (options.has(4) && haveWarOutfit()) {
          auto_runChoice(4); // use your candy cane sword cane to skip to the war start
        } else {
          auto_runChoice(3); // fight a Frat Warrior drill sergeant for outfit pieces
        }
        break;
      case 145: // Fratacombs (Orcish Frat House (Verge of War) wearing Filthy Hippy Disguise)
        auto_runChoice(1); // get 50 muscle
        break;
      case 146: // Fratacombs (Orcish Frat House (Verge of War) wearing War Hippy Fatigues)
        auto_runChoice(3); // starts the war. skips adventure if already started.
        break;
      case 147: // Cornered! (McMillicancuddy's Barn)
        auto_runChoice(3); // open the pond
        break;
      case 148: // Cornered Again! (McMillicancuddy's Barn)
        auto_runChoice(1); // open the back 40
        break;
      case 149: // How Many Corners Does this Stupid Barn Have!? (McMillicancuddy's Barn)
        auto_runChoice(2); // open the other back 40
        break;
      case 153: // Turn Your Head and Coffin (The Defiled Alcove)
      case 155: // Skull, Skull, Skull (The Defiled Nook)
      case 157: // Urning Your Keep (The Defiled Niche)
        cyrptChoiceHandler(choice);
        break;
      case 163: // Melvil Dewey Would Be Ashamed (The Haunted Library)
        if (in_lar()) {
          setProperty("_LAR_skipNC163", myTurncount().toString()); // NC in LAR path forced to reoccur if we skip it. Go do something else.
        }
        auto_runChoice(4); // skip
        break;
      case 178: // Hammering the Armory (The Penultimate Fantasy Airship)
        if (in_lar()) {
          setProperty("_LAR_skipNC178", myTurncount().toString()); // NC in LAR path forced to reoccur if we skip it. Go do something else.
        }
        auto_runChoice(2); // skip
        break;
      case 182: // Random Lack of an Encounter (The Penultimate Fantasy Airship)
        if (itemAmount($item`model airship`) === 0) {
          auto_runChoice(4); // get the model airship
        } else if (options.has(6)) {
          auto_runChoice(6); // advance immateria quest
        } else if (options.has(5) && L10_needUmbrella()) {
          auto_runChoice(5); // get titanium umbrella, metallic A, SGEEA and a penultimate fantasy chest
        } else {
          auto_runChoice(1); // fight an opponent
        }
        break;
      case 184: // That Explains All The Eyepatches (Barrrney's Barrr)
      case 185: // Yes, You're a Rock Starrr (Barrrney's Barrr)
      case 186: // A Test of Testarrrsterone (Barrrney's Barrr)
        barrrneysBarrrChoiceHandler(choice);
        break;
      // Note: 187 is the Beer Pong NC and is currently handled differently.
      case 188: // The Infiltrationist (Orcish Frat House blueprints)
        if (isWearingOutfit("Frat Boy Ensemble")) {
          auto_runChoice(1);
        } else if (
          equippedAmount($item`mullet wig`) === 1 &&
          itemAmount($item`briefcase`) > 0
        ) {
          auto_runChoice(2);
        } else if (
          equippedAmount($item`frilly skirt`) === 1 &&
          itemAmount($item`hot wing`) > 2
        ) {
          auto_runChoice(3);
        } else {
          abort(
            "I tried to infiltrate the orcish frat house without being equipped for the job",
          );
        }
        break;
      case 189: // O Cap'm, My Cap'm (The Poop Deck)
        auto_runChoice(2); // skip
        break;
      case 191: // Chatterboxing (The F'c'le)
        fcleChoiceHandler(choice);
        break;
      case 330: // A Shark's Chum (The Haunted Billiards Room, semi-rarely)
        if (toInt(getProperty("poolSharkCount")) < 25) {
          auto_runChoice(1); // train pool skill
        } else {
          auto_runChoice(2); // fight hustled spectre for cube of billiard chalk
        }
        break;
      case 502: // Arboreal Respite (The Spooky Forest)
      case 503: // The Road Less Traveled (The Spooky Forest)
      case 504: // Tree's Last Stand (The Spooky Forest)
      case 505: // Consciousness of a Stream (The Spooky Forest)
      case 506: // Through Thicket and Thinnet (The Spooky Forest)
      case 507: // O Lith, Mon (The Spooky Forest)
        spookyForestChoiceHandler(choice);
        break;
      case 523: // Death Rattlin' (The Defiled Cranny)
      case 527: // The Haert of Darkness (The Cyrpt)
        cyrptChoiceHandler(choice);
        break;
      case 542: // Now's Your Pants! I Mean... Your Chance! (The Sleazy Back Alley)
      case 543: // Up In Their Grill (Outskirts of Cobb's Knob)
      case 544: // A Sandwich Appears! (The Haunted Pantry)
        auto_runChoice(1); // always finish guild task via choice 1
        break;
      case 556: // More Locker Than Morlock (Itznotyerzitz Mine)
        itznotyerzitzMineChoiceHandler(choice);
        break;
      case 575: // Duffel on the Double (The eXtreme Slope)
        theeXtremeSlopeChoiceHandler(choice);
        break;
      case 579: // Such Great Heights (The Hidden Temple)
      case 580: // The Hidden Heart of the Hidden Temple (The Hidden Temple)
      case 581: // Such Great Depths (The Hidden Temple)
      case 582: // Fitting In (The Hidden Temple)
      case 583: // Confusing Buttons (The Hidden Temple)
      case 584: // Unconfusing Buttons (The Hidden Temple)
        hiddenTempleChoiceHandler(choice, page);
        break;
      case 588: // Machines! (Bugbear Mothership Sonar)
        if (!containsText(page, "name=pingvalue size=5 value=2")) {
          auto_runChoice(1, "pingvalue=2");
        } else if (!containsText(page, "name=whurmvalue size=5 value=4")) {
          auto_runChoice(2, "whurmvalue=4");
        } else if (!containsText(page, "name=boomchuckvalue size=5 value=8")) {
          auto_runChoice(3, "boomchuckvalue=8");
        }
        break;
      case 589: // Autopsy Auturvy (Bugbear Mothership Morgue)
        if (itemAmount($item`bugbear autopsy tweezers`) > 0) {
          // choices 1-5, do these change? or get removed?
          for (let i = 1; i <= 5; i++) {
            if (options.has(i)) {
              auto_runChoice(i);
              break;
            }
          }
        } else {
          auto_runChoice(6);
        }
        break;
      case 590: // Not Alone In The Dark (Bugbear Mothership Special Ops)
        if (options.has(2)) {
          auto_runChoice(2);
        } else {
          auto_runChoice(1);
        }
        break;
      case 591: // The Beginning of the Beginning of the End (Bugbear Mothership Bridge)
      case 592: // The Middle of the Beginning of the End (Bugbear Mothership Bridge)
      case 593: // The End of the Beginning of the End (Bugbear Mothership Bridge)
        auto_runChoice(1);
        break;
      case 597: // When visiting the Cake-Shaped Arena with a Reagnimated Gnome
        auto_reagnimatedGetPart();
        break;
      case 604: // Welcome to the Great Overlook Lodge (Twin Peak Part 1)
      case 605: // Welcome to the Great Overlook Lodge (Twin Peak Part 2)
        auto_runChoice(1); // always advance to next option via choice 1
        break;
      case 606: // Lost in the Great Overlook Lodge
        if (
          in_bhy() ||
          (in_glover() && options.has(3) && itemAmount($item`jar of oil`) === 0)
        ) {
          // we can't make an oil jar to solve the quest, just adventure until the hotel is burned down
          auto_runChoice(6); // and flee the music NC
          break;
        }
        // do init if we can
        if (options.has(4)) {
          auto_runChoice(4);
          break;
        }
        // do oil jar if we can
        if (options.has(3) && itemAmount($item`jar of oil`) > 0) {
          auto_runChoice(3);
          break;
        }
        // do pantry search if we can
        if (options.has(2)) {
          auto_runChoice(2);
          break;
        }
        // do stench test if we can
        if (options.has(1)) {
          auto_runChoice(1);
          break;
        }
        // getting this NC without being able to pick a choice is not ideal
        auto_log_warning(
          "Got the Twin Peak NC (Lost in the Great Overlook) without able to complete any of the tasks :(",
        );
        break;
      case 607: // Room 237 (Lost in the Great Overlook Lodge)
      case 608: // Go Check It Out! (Lost in the Great Overlook Lodge)
      case 609: // There's Always Music In the Air (Lost in the Great Overlook Lodge)
      case 610: // To Catch a Killer (Lost in the Great Overlook Lodge)
      case 616: // He Is the Arm, and He Sounds Like This (Lost in the Great Overlook Lodge)
        auto_runChoice(1); // always advance to next option via choice 1
        break;
      case 618: // Cabin Fever (Twin Peak)
        auto_runChoice(2); // finish twin peak quest the long way
        break;
      case 669: // The Fast and the Furry-ous (The Castle in the Clouds in the Sky (Basement))
      case 670: // You Don't Mess Around with Gym (The Castle in the Clouds in the Sky (Basement))
      case 671: // Out in the Open Source (The Castle in the Clouds in the Sky (Basement))
        castleBasementChoiceHandler(choice);
        break;
      case 672: // There's No Ability Like Possibility (Castle in the Clouds in the Sky (Ground Floor))
      case 673: // Putting Off Is Off-Putting (Castle in the Clouds in the Sky (Ground Floor))
      case 674: // Huzzah! (Castle in the Clouds in the Sky (Ground Floor))
        auto_runChoice(3); // always skip via choice 3
        break;
      case 675: // Melon Collie and the Infinite Lameness (The Castle in the Clouds in the Sky (Top Floor))
      case 676: // Flavor of a Raver (The Castle in the Clouds in the Sky (Top Floor))
      case 677: // Copper Feel (The Castle in the Clouds in the Sky (Top Floor))
      case 678: // Yeah, You're for Me, Punk Rock Giant (The Castle in the Clouds in the Sky (Top Floor))
      case 679: // Keep On Turnin' the Wheel in the Sky (The Castle in the Clouds in the Sky (Top Floor))
      case 680: // Are you a Man or a Mouse? (The Castle in the Clouds in the Sky (Top Floor))
        castleTopFloorChoiceHandler(choice);
        break;
      case 689: // The Final Reward (Daily Dungeon 15th room)
      case 690: // The First Chest Isn't the Deepest. (Daily Dungeon 5th room)
      case 691: // Second Chest (Daily Dungeon 10th room)
      case 692: // I Wanna Be a Door (Daily Dungeon)
      case 693: // It's Almost Certainly a Trap (Daily Dungeon)
        dailyDungeonChoiceHandler(choice, options);
        break;
      case 700: // Delirium in the Cafeterium (KOLHS 22nd adventure every day)
        kolhsChoiceHandler(choice);
        break;
      case 763: // It's Kind of a Big Deal (BIG!)
        auto_runChoice(1); // approach the booth to get big pants
        break;
      case 768: // The Littlest Identity Crisis (Mini-adventurer initialization)
        if (in_quantumTerrarium()) {
          if (myLocation() === $location`The Themthar Hills`) {
            auto_runChoice(4); // Sauceror is a lep and starfish
          } else if (myLevel() < 13) {
            auto_runChoice(2); // Turtle Tamer is a volleyball and a starfish at level 5
          } else {
            auto_runChoice(6); // Accordion Thief is a fairy and ghoul whelp, with some free buffs.
          }
        } else {
          auto_runChoice(2); // Turtle Tamer is a decent fallback pick.
        }
        break;
      case 772: // Saved by the Bell (KOLHS after school)
        kolhsChoiceHandler(choice);
        break;
      case 780: // Action Elevator (The Hidden Apartment Building)
      case 781: // Earthbound and Down (An Overgrown Shrine (Northwest))
      case 783: // Water You Dune (An Overgrown Shrine (Southwest))
      case 784: // You, M. D. (The Hidden Hospital)
      case 785: // Air Apparent (An Overgrown Shrine (Northeast))
      case 786: // Working Holiday (The Hidden Office Building)
      case 787: // Fire When Ready (An Overgrown Shrine (Southeast))
      case 788: // Life is Like a Cherry of Bowls (The Hidden Bowling Alley)
      case 789: // Where Does The Lone Ranger Take His Garbagester? (The Hidden Park)
      case 791: // Legend of the Temple in the Hidden City (A Massive Ziggurat)
        hiddenCityChoiceHandler(choice);
        break;
      case 793: // The Shore, Inc. Travel Agency. doing a vacation
        if (
          options.has(5) &&
          toBoolean(getProperty("auto_considerCCSCShore"))
        ) {
          auto_runChoice(5); // 2 Shore scrips, all stats, +wdmg
        } else if (myPrimestat() === $stat`Muscle`) {
          auto_runChoice(1); // muscle stats
        } else if (myPrimestat() === $stat`Mysticality`) {
          auto_runChoice(2); // myst stats
        } else {
          // if no prime stat we still want moxie
          auto_runChoice(3); // moxie stats
        }
        break;
      case 794: // Once More Unto the Junk (The Old Landfill)
      case 795: // The Bathroom of Ten Men (The Old Landfill)
      case 796: // The Den of Iquity (The Old Landfill)
      case 797: // Let's Workshop This a Little (The Old Landfill)
        oldLandfillChoiceHandler(choice);
        break;
      case 804:
        auto_runChoice(2); //Trick or Treat!
        break;
      case 806:
        auto_runChoice(2); //A Fun-Size Dilemma
        break;
      case 822: // The Prince's Ball (In the Restroom)
      case 823: // The Prince's Ball (On the Dance Floor)
      case 824: // The Prince's Ball (The Kitchen)
      case 825: // The Prince's Ball (On the Balcony)
      case 826: // The Prince's Ball (The Lounge)
        auto_runChoice(1); // pickup odd silver coin
        break;
      case 829: // We All Wear Masks (Grimstone Mask Choice)
        auto_runChoice(1); // choose step mother. we want [Ornate Dowsing Rod]
        break;
      case 875: // Welcome To Our ool Table (The Haunted Billiards Room).
        if (poolSkillPracticeGains() === 1 || currentPoolSkill() > 15) {
          auto_runChoice(1); // try to win the key. on failure still gain 1 pool skill
        } else {
          auto_runChoice(2); // practice pool skill
        }
        break;
      case 876: // One Simple Nightstand (The Haunted Bedroom)
      case 877: // One Mahogany Nightstand (The Haunted Bedroom)
      case 878: // One Ornate Nightstand (The Haunted Bedroom)
      case 879: // One Rustic Nightstand (The Haunted Bedroom)
      case 880: // One Elegant Nightstand (The Haunted Bedroom)
        hauntedBedroomChoiceHandler(choice, options);
        break;
      case 881: // Never Gonna Make You Up (The Haunted Bathroom)
        auto_runChoice(1); // fight the cosmetics wraith
        break;
      case 882: // Off the Rack (The Haunted Bathroom)
        auto_runChoice(1); // take the towel
        break;
      case 884: // Chasin' Babies (Laboratory) (The Haunted Laboratory)
      case 885: // Chasin' Babies (Nursery) (The Haunted Nursery)
      case 886: // Chasin' Babies (Storage Room) (The Haunted Storage Room)
        auto_runChoice(6); // skip
        break;
      case 888: // Take a Look, it's in a Book! (Rise) (The Haunted Library)
        auto_runChoice(5); // skip
        break;
      case 889: // Take a Look, it's in a Book! (Fall) (The Haunted Library)
        if (
          itemAmount($item`dictionary`) === 0 &&
          toBoolean(getProperty("auto_getDictionary"))
        ) {
          auto_runChoice(4); // get the dictionary
        } else {
          auto_runChoice(5); // skip
        }
        break;
      case 921: // We'll All Be Flat (The Haunted Ballroom)
        auto_runChoice(1); // unlock Spookyraven Manor Cellar
        break;
      case 923: // All Over the Map (The Black Forest)
      case 924: // You Found Your Thrill (The Black Forest)
      case 925: // The Blackest Smith (The Black Forest)
      case 926: // Be Mine (The Black Forest)
      case 927: // Sunday Black Sunday (The Black Forest)
      case 928: // You Found Your Thrill (The Black Forest)
        blackForestChoiceHandler(choice);
        break;
      case 970: // Rainy Fax Dreams on your Wedding Day
        auto_runChoice(2); // leave and get your rain back
        break;
      case 976: // Ed the Undrowning (Heavy Rains)
        auto_runChoice(1); // fight Ed in a Heavy Rains run
        break;
      case 1000: // Everything in Moderation (The Typical Tavern Cellar as Ed)
        auto_runChoice(1); // turn off the faucet as Ed, complete quest
        break;
      case 1001: // Hot and Cold Dripping Rats (The Typical Tavern Cellar as Ed)
        auto_runChoice(2); // choose to not fight a rat
        break;
      case 1002: // Temple of the Legend in the Hidden City (A Massive Ziggurat/Actually Ed the Undying)
        hiddenCityChoiceHandler(choice);
        break;
      case 1018: // Bee Persistent (The Black Forest)
      case 1019: // Bee Rewarded (The Black Forest)
        blackForestChoiceHandler(choice);
        break;
      case 1023: // Like a Bat Into Hell (Actually Ed the Undying)
      case 1024: // Like a Bat out of Hell (Actually Ed the Undying)
        edUnderworldChoiceHandler(choice);
        break;
      case 1026: // Home on the Free Range (Castle in the Clouds in the Sky (Ground Floor))
        if (
          itemAmount($item`electric boning knife`) > 0 ||
          isActuallyEd() ||
          in_bugbear() ||
          in_pokefam() // paths that don't require a boning knife for the tower
        ) {
          auto_runChoice(3); // skip
        } else {
          auto_runChoice(2); // get Electric Boning Knife
        }
        break;
      case 1056: // Now It's Dark (Lost in the Great Overlook Lodge)
        auto_runChoice(1); // finish init portion of quest
        break;
      case 1060: // Temporarily Out of Skeletons (The Skeleton Store)
        if (itemAmount($item`Skeleton Store office key`) === 0) {
          auto_runChoice(1); // Skeleton Store office key
        } else if (internalQuestStatus("questM23Meatsmith") < 1) {
          auto_runChoice(4); // fight The former owner of the Skeleton Store
        } else {
          auto_runChoice(2); // get ring of telling skeletons what to do or 300 meat
        }
        break;
      case 1061: // Heart of Madness (Madness Bakery Quest)
        if (internalQuestStatus("questM25Armorer") <= 2) {
          auto_runChoice(1); // try to open door or open the door to fight Cake Lord
        } else {
          auto_runChoice(5); // myst stats as best default option
        }
        break;
      case 1062: // Lots of Options (The Overgrown Lot)
        if (options.has(6)) {
          auto_runChoice(6); // Use Candy Cane Sword Cane to get all flowers and grass clippings
          if (options.has(1)) {
            auto_runChoice(1); // get flowers for doc galaktik quest
          } else {
            auto_runChoice(4); // get 15 moxie substat
          }
        }
        if (options.has(1)) {
          auto_runChoice(1); // get flowers for doc galaktik quest
        } else if (canDrink() && options.has(5)) {
          auto_runChoice(5); // get extra booze from map to a hidden booze cache
        } else if (canDrink() && !is_boris()) {
          // prefer food in boris
          auto_runChoice(3); // get booze
        } else if (canEat()) {
          auto_runChoice(2); // get food
        } else {
          auto_runChoice(4); // get 15 moxie substat
        }
        break;
      case 1074: // Welcome to the Copperhead Club (The Copperhead Club)
        auto_runChoice(1); // approach Shen's table
        break;
      case 1082: // The "Rescue" (post-Cake Lord in Madness Bakery)
        auto_runChoice(1); // move to next part of quest
        break;
      case 1083: // Cogito Ergot Sum (post-post-Cake Lord in Madness Bakery)
        auto_runChoice(1); // get the no-handed pie and complete quest
        break;
      case 1106: // Wooof! Wooooooof! (Ghost Dog)
      case 1107: // Playing Fetch (Ghost Dog)
      case 1108: // Your Dog Found Something Again (Ghost Dog)
        doghouseChoiceHandler(choice);
        break;
      case 1115: // VYKEA! (VYKEA)
        if (!toBoolean(getProperty("_VYKEACafeteriaRaided"))) {
          auto_runChoice(1); // get consumables
        } else if (!toBoolean(getProperty("_VYKEALoungeRaided"))) {
          auto_runChoice(4); // get Wal-Mart gift certificates
        } else {
          auto_runChoice(6); // skip
        }
        break;
      case 1119: // Blue Sideways In Time (Machine Elf)
        auto_runChoice(1); // acquire some abstractions
        break;
      case 1258: // Daily Briefing (License to Adventure)
        auto_runChoice(2); // visit LI-11 HQ
        break;
      case 1261: // Which Door? (Super Villain's Lair)
        if (myMeat() > 1000) {
          auto_runChoice(1); // spend 1000 meat to eliminate 10 minions
        } else {
          auto_runChoice(4); // if can't afford door 1, choose none
        }
        break;
      case 1310: {
        // Granted a Boon (God Lobster)
        const goal: number = toInt(getProperty("_auto_lobsterChoice"));
        let search: string = "I'd like part of your regalia.";
        if (goal === 2) {
          search = "I'd like a blessing.";
        } else if (goal === 3) {
          search = "I'd like some experience.";
        }
        let glchoice: number = 0;
        for (const [idx, str] of options) {
          if (containsText(str, search)) {
            glchoice = idx;
          }
        }
        auto_runChoice(glchoice);
        break;
      }
      case 1322: // The Beginning of the Neverend (The Neverending Party)
      case 1323: // All Done! (The Neverending Party)
      case 1324: // It Hasn't Ended, It's Just Paused (The Neverending Party)
      case 1325: // A Room With a View... Of a Bed (The Neverending Party)
      case 1326: // Gone Kitchin' (The Neverending Party)
      case 1327: // Forward to the Back (The Neverending Party)
      case 1328: // Basement Urges (The Neverending Party)
        neverendingPartyChoiceHandler(choice);
        break;
      case 1340: // Is There A Doctor In The House? (Lil' Doctor Bag™)
        auto_log_info("Accepting doctor quest, it's our job!");
        auto_runChoice(1);
        break;
      case 1342: // Torpor (Dark Gyffte)
        bat_reallyPickSkills(20);
        break;
      case 1391: // Rationing out Destruction (Kingdom of Exploathing)
        koe_RationingOutDestruction();
        break;
      case 1393: // The Invader (Kingdom of Exploathing)
        auto_runChoice(1); // fight the invader

        break;
      case 1410: // The Mushy Center (Your Mushroom Garden)
        mushroomGardenChoiceHandler(choice);
        break;
      case 1425: // Oh Yeah! (Cartography)
      case 1427: // The Hidden Junction (Cartography)
      case 1428: // Your Neck of the Woods (Cartography)
      case 1429: // No Nook Unknown (Cartography)
      case 1430: // Ghostly Memories (Cartography)
      case 1431: // Here There Be Giants (Cartography)
      case 1432: // Mob Maptality (Cartography)
      case 1433: // Sneaky, Sneaky (The Hippy Camp (Verge of War)) (Cartography)
      case 1434: // Sneaky, Sneaky (Orcish Frat House (Verge of War)) (Cartography)
      case 1435: // Leading Yourself Right to Them (Map the Monsters)
      case 1436: // Billiards Room Options (Cartography)
        cartographyChoiceHandler(choice, page);
        break;
      case 1467: // Poetic Justice (Cleaver)
      case 1468: // Aunts not Ants (Cleaver)
      case 1469: // Beware of Aligator (Cleaver)
      case 1470: // Teacher's Pet (Cleaver)
      case 1471: // Lost and Found (Cleaver)
      case 1472: // Summer Days (Cleaver)
      case 1473: // Bath Time (Cleaver)
      case 1474: // Delicious Sprouts (Cleaver)
      case 1475: // Hypnotic Master (Cleaver)
        juneCleaverChoiceHandler(choice);
        break;
      case 1491: // Strange Stalagmite(s) (Rock Garden)
        if (myPrimestat() === $stat`Muscle`) {
          auto_runChoice(1); // muscle stats
        } else if (myPrimestat() === $stat`Mysticality`) {
          auto_runChoice(2); // myst stats
        } else {
          // if no prime stat we still want moxie
          auto_runChoice(3); // moxie stats
        }
        break;
      case 1494: // Examine S.I.T. Course Certificate (S.I.T Course)
        if (myLevel() < 8) {
          auto_runChoice(3); // Cryptobotanist (S.I.T. Course)
        } else {
          auto_runChoice(2); // Insectologist (S.I.T. Course)
        }
        break;
      case 1497: // Calling Rufus
        auto_runChoice(2); // get artifact quest

        break;
      case 1500: // Like a Loded Stone
        auto_runChoice(2); // only come here to get shadow waters buff

        break;
      case 1519: // The coffee was *gasp* decaf!
        auto_runChoice(1);
        break;
      case 1520: // Hang On to Yourself
        auto_runChoice(1);
        break;
      case 1521: // Ch-ch-ch-ch-chaaaanges
        auto_runChoice(1);
        break;
      case 1522: // The Antiscientific Method
        auto_runChoice(1);
        break;
      case 1525:
        dartChoiceHandler(choice, options);
        break;
      case 1557: // Peering Through Your Peridot (Peridot of Peril zone monster selection choice)
        peridotChoiceHandler(choice, page);
        break;
      case 1562: //Time is a Möbius Strip
        mobiusChoiceHandler(choice, page);
        break;
      case 1566: //Summon a wave
        auto_runChoice(1);
        break;
      case 1599: // Legendary Digestion: if we aren't forcing combat, by default use spleen, else take famxp
        legendaryNoodlesChoiceHandler();
        break;
      default:
        if (handlingChoice() && lastChoice() === choice) {
          if (GOAL_AUTOMATED_CHOICES.has(choice)) {
            runChoice(-1);
          } else {
            auto_runChoice(get(`choiceAdventure${lastChoice()}`, 0));
          }
        }
        break;
    }
  }

  return true;
}

export function main(choice: number, page: string): void {
  let ret: boolean = false;
  try {
    ret = auto_run_choice(choice, page);
  } finally {
    if (!ret) {
      auto_log_error(
        "Error running auto_choice_adv.js, setting auto_interrupt=true",
      );
      setProperty("auto_interrupt", true.toString());
    }
  }
}
