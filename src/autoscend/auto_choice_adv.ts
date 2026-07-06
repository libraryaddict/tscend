import { abort, availableChoiceOptions, canDrink, canEat, containsText, equippedAmount, getProperty, isWearingOutfit, Item, itemAmount, Location, myLevel, myLocation, myMeat, myPrimestat, myTurncount, runChoice, setProperty, Stat, toBoolean, toInt } from "kolmafia";
import { possessEquipment } from "./auto_equipment";
import { auto_log_debug$1, auto_log_error, auto_log_info$1, auto_log_warning$1, currentPoolSkill, internalQuestStatus, poolSkillPracticeGains } from "./auto_util";
import { auto_reagnimatedGetPart } from "./iotms/mr2012";
import { doghouseChoiceHandler } from "./iotms/mr2015";
import { neverendingPartyChoiceHandler } from "./iotms/mr2018";
import { cartographyChoiceHandler, mushroomGardenChoiceHandler } from "./iotms/mr2020";
import { juneCleaverChoiceHandler } from "./iotms/mr2022";
import { dartChoiceHandler } from "./iotms/mr2024";
import { mobiusChoiceHandler, peridotChoiceHandler } from "./iotms/mr2025";
import { legendaryNoodlesChoiceHandler } from "./iotms/mr2026";
import { edUnderworldChoiceHandler, isActuallyEd } from "./paths/actually_ed_the_undying";
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
import { itznotyerzitzMineChoiceHandler, theeXtremeSlopeChoiceHandler } from "./quests/level_08";
import { castleBasementChoiceHandler, castleTopFloorChoiceHandler, L10_needUmbrella } from "./quests/level_10";
import { blackForestChoiceHandler, hauntedBedroomChoiceHandler, hiddenCityChoiceHandler, hiddenTempleChoiceHandler } from "./quests/level_11";
import { haveWarOutfit$1 } from "./quests/level_12";
import { dailyDungeonChoiceHandler, oldLandfillChoiceHandler } from "./quests/level_any";
import { barrrneysBarrrChoiceHandler, fcleChoiceHandler, piratesCoveChoiceHandler } from "./quests/optional";

function auto_run_choice(choice: number, page: string): boolean
{
	if (robot_choice_adv(choice, page)) { // an override function for You, Robot path.
	return true; }

	auto_log_debug$1("Running auto_choice_adv.js");
	const options: Map<number, string> = new Map(Object.entries(availableChoiceOptions()).map(([_k, _v]) => [toInt(_k), _v]));

	{
		// Yeti Nother Hippy (The eXtreme Slope)
		// Saint Beernard (The eXtreme Slope)
		// Generic Teen Comedy Snowboarding Adventure (The eXtreme Slope)
		// A Flat Miner (Itznotyerzitz Mine)
		// 100% Legal (Itznotyerzitz Mine)
		// See You Next Fall (Itznotyerzitz Mine)
		// Under the Knife (The Sleazy Back Alley)
			// skip
		// The Arrrbitrator (The Obligatory Pirate's Cove)
		// Barrie Me at Sea (The Obligatory Pirate's Cove)
		// Amatearrr Night (The Obligatory Pirate's Cove)
		// Out in the Garden (The Haunted Gallery)
				// fight the snake knight (should non-Ed classes/paths do this too?)
				// ignore the NC & banish it for 10 adv
		// Curtains (The Haunted Ballroom)
			// skip
		// Having a Medicine Ball (The Haunted Bathroom)
				// get mysticality substats
				// go to Bad Medicine is What You Need (#107)
		// Strung-Up Quartet (The Haunted Ballroom)
			// +5% item drops everywhere
		// Bad Medicine is What You Need (The Haunted Bathroom)
			// skip
		// Aww, Craps (The Sleazy Back Alley)
			// skip
		// Dumpster Diving (The Sleazy Back Alley)
				// 11-leaf clover with candy cane sword cane equipped
				// fight a drunken half-orc hobo
		// The Entertainer (The Sleazy Back Alley)
			// skip
		// Malice in Chains (Outskirts of Cobb's Knob)
			// fight a sleeping Knob Goblin guard
		// Please, Hammer (The Sleazy Back Alley)
			// skip
		// Knob Gobin BBQ (Outskirts of Cobb's Knob)
			// fight a Knob Goblin Barbecue Team
		// The Baker's Dilemma (The Haunted Pantry)
			// skip
		// Oh No, Hobo (The Haunted Pantry)
			// fight a drunken half-orc hobo
		// The Singing Tree (Rustling) (The Haunted Pantry)
			// skip
		// Trespasser (The Haunted Pantry)
			// fight a Knob Goblin Assistant Chef
		// When Rocks Attack (Outskirts of Cobb's Knob)
			// skip
		// Ennui is Wasted on the Young (Outskirts of Cobb's Knob)
			// skip
		// At Least It's Not Full Of Trash (The Hidden Temple)
		// No Visible Means of Support (The Hidden Temple)
		// Bait and Switch (The Hippy Camp (Verge of War))
				// use your candy cane sword cane to skip to the war start
				// fight a War Hippy (space) cadet for outfit pieces
		// The Thin Tie-Dyed Line (The Hippy Camp (Verge of War))
				// use your candy cane sword cane to skip to the war start
				// fight a War Hippy drill sergeant for outfit pieces
		// Blockin' Out the Scenery (The Hippy Camp (Verge of War) wearing Frat Boy Ensemble)
			// get 50 mysticality
		// Blockin' Out the Scenery (The Hippy Camp (Verge of War) wearing Frat Warrior Fatigues)
			// starts the war. skips adventure if already started.
		// Catching Some Zetas (Orcish Frat House (Verge of War))
				// use your candy cane sword cane to skip to the war start
				// fight a War Pledge for outfit pieces
		// One Less Room Than In That Movie (Orcish Frat House (Verge of War))
				// use your candy cane sword cane to skip to the war start
				// fight a Frat Warrior drill sergeant for outfit pieces
		// Fratacombs (Orcish Frat House (Verge of War) wearing Filthy Hippy Disguise)
			// get 50 muscle
		// Fratacombs (Orcish Frat House (Verge of War) wearing War Hippy Fatigues)
			// starts the war. skips adventure if already started.
		// Cornered! (McMillicancuddy's Barn)
			// open the pond
		// Cornered Again! (McMillicancuddy's Barn)
			// open the back 40
		// How Many Corners Does this Stupid Barn Have!? (McMillicancuddy's Barn)
			// open the other back 40
		// Turn Your Head and Coffin (The Defiled Alcove)
		// Skull, Skull, Skull (The Defiled Nook)
		// Urning Your Keep (The Defiled Niche)
		// Melvil Dewey Would Be Ashamed (The Haunted Library)
				// NC in LAR path forced to reoccur if we skip it. Go do something else.
			// skip
		// Hammering the Armory (The Penultimate Fantasy Airship)
				// NC in LAR path forced to reoccur if we skip it. Go do something else.
			// skip
		// Random Lack of an Encounter (The Penultimate Fantasy Airship)
				// get the model airship
				// advance immateria quest
				// get titanium umbrella, metallic A, SGEEA and a penultimate fantasy chest
				// fight an opponent
		// That Explains All The Eyepatches (Barrrney's Barrr)
		// Yes, You're a Rock Starrr (Barrrney's Barrr)
		// A Test of Testarrrsterone (Barrrney's Barrr)
		// Note: 187 is the Beer Pong NC and is currently handled differently.
		// The Infiltrationist (Orcish Frat House blueprints)
		// O Cap'm, My Cap'm (The Poop Deck)
			// skip
		// Chatterboxing (The F'c'le)
		// A Shark's Chum (The Haunted Billiards Room, semi-rarely)
				// train pool skill
				// fight hustled spectre for cube of billiard chalk
		// Arboreal Respite (The Spooky Forest)
		// The Road Less Traveled (The Spooky Forest)
		// Tree's Last Stand (The Spooky Forest)
		// Consciousness of a Stream (The Spooky Forest)
		// Through Thicket and Thinnet (The Spooky Forest)
		// O Lith, Mon (The Spooky Forest)
		// Death Rattlin' (The Defiled Cranny)
		// The Haert of Darkness (The Cyrpt)
		// Now's Your Pants! I Mean... Your Chance! (The Sleazy Back Alley)
		// Up In Their Grill (Outskirts of Cobb's Knob)
		// A Sandwich Appears! (The Haunted Pantry)
			// always finish guild task via choice 1
		// More Locker Than Morlock (Itznotyerzitz Mine)
		// Duffel on the Double (The eXtreme Slope)
		// Such Great Heights (The Hidden Temple)
		// The Hidden Heart of the Hidden Temple (The Hidden Temple)
		// Such Great Depths (The Hidden Temple)
		// Fitting In (The Hidden Temple)
		// Confusing Buttons (The Hidden Temple)
		// Unconfusing Buttons (The Hidden Temple)
		// Machines! (Bugbear Mothership Sonar)
		// Autopsy Auturvy (Bugbear Mothership Morgue)
				// choices 1-5, do these change? or get removed?
		// Not Alone In The Dark (Bugbear Mothership Special Ops)
		// The Beginning of the Beginning of the End (Bugbear Mothership Bridge)
		// The Middle of the Beginning of the End (Bugbear Mothership Bridge)
		// The End of the Beginning of the End (Bugbear Mothership Bridge)
		// When visiting the Cake-Shaped Arena with a Reagnimated Gnome
		// Welcome to the Great Overlook Lodge (Twin Peak Part 1)
		// Welcome to the Great Overlook Lodge (Twin Peak Part 2)
			// always advance to next option via choice 1
		// Lost in the Great Overlook Lodge
				// we can't make an oil jar to solve the quest, just adventure until the hotel is burned down
				// and flee the music NC
			// do init if we can
			// do oil jar if we can
			// do pantry search if we can
			// do stench test if we can
			// getting this NC without being able to pick a choice is not ideal
		// Room 237 (Lost in the Great Overlook Lodge)
		// Go Check It Out! (Lost in the Great Overlook Lodge)
		// There's Always Music In the Air (Lost in the Great Overlook Lodge)
		// To Catch a Killer (Lost in the Great Overlook Lodge)
		// He Is the Arm, and He Sounds Like This (Lost in the Great Overlook Lodge)
			// always advance to next option via choice 1
		// Cabin Fever (Twin Peak)
			// finish twin peak quest the long way
		// The Fast and the Furry-ous (The Castle in the Clouds in the Sky (Basement))
		// You Don't Mess Around with Gym (The Castle in the Clouds in the Sky (Basement))
		// Out in the Open Source (The Castle in the Clouds in the Sky (Basement))
		// There's No Ability Like Possibility (Castle in the Clouds in the Sky (Ground Floor))
		// Putting Off Is Off-Putting (Castle in the Clouds in the Sky (Ground Floor))
		// Huzzah! (Castle in the Clouds in the Sky (Ground Floor))
			// always skip via choice 3
		// Melon Collie and the Infinite Lameness (The Castle in the Clouds in the Sky (Top Floor))
		// Flavor of a Raver (The Castle in the Clouds in the Sky (Top Floor))
		// Copper Feel (The Castle in the Clouds in the Sky (Top Floor))
		// Yeah, You're for Me, Punk Rock Giant (The Castle in the Clouds in the Sky (Top Floor))
		// Keep On Turnin' the Wheel in the Sky (The Castle in the Clouds in the Sky (Top Floor))
		// Are you a Man or a Mouse? (The Castle in the Clouds in the Sky (Top Floor))
		// The Final Reward (Daily Dungeon 15th room)
		// The First Chest Isn't the Deepest. (Daily Dungeon 5th room)
		// Second Chest (Daily Dungeon 10th room)
		// I Wanna Be a Door (Daily Dungeon)
		// It's Almost Certainly a Trap (Daily Dungeon)
		// Delirium in the Cafeterium (KOLHS 22nd adventure every day)
		// It's Kind of a Big Deal (BIG!)
			// approach the booth to get big pants
		// The Littlest Identity Crisis (Mini-adventurer initialization)
					// Sauceror is a lep and starfish
					// Turtle Tamer is a volleyball and a starfish at level 5
					// Accordion Thief is a fairy and ghoul whelp, with some free buffs.
				// Turtle Tamer is a decent fallback pick.
		// Saved by the Bell (KOLHS after school)
		// Action Elevator (The Hidden Apartment Building)
		// Earthbound and Down (An Overgrown Shrine (Northwest))
		// Water You Dune (An Overgrown Shrine (Southwest))
		// You, M. D. (The Hidden Hospital)
		// Air Apparent (An Overgrown Shrine (Northeast))
		// Working Holiday (The Hidden Office Building)
		// Fire When Ready (An Overgrown Shrine (Southeast))
		// Life is Like a Cherry of Bowls (The Hidden Bowling Alley)
		// Where Does The Lone Ranger Take His Garbagester? (The Hidden Park)
		// Legend of the Temple in the Hidden City (A Massive Ziggurat)
		// The Shore, Inc. Travel Agency. doing a vacation
				// 2 Shore scrips, all stats, +wdmg
				// muscle stats
				// myst stats
			// if no prime stat we still want moxie
				// moxie stats
		// Once More Unto the Junk (The Old Landfill)
		// The Bathroom of Ten Men (The Old Landfill)
		// The Den of Iquity (The Old Landfill)
		// Let's Workshop This a Little (The Old Landfill)
			//Trick or Treat!
			//A Fun-Size Dilemma
		// The Prince's Ball (In the Restroom)
		// The Prince's Ball (On the Dance Floor)
		// The Prince's Ball (The Kitchen)
		// The Prince's Ball (On the Balcony)
		// The Prince's Ball (The Lounge)
			// pickup odd silver coin
		// We All Wear Masks (Grimstone Mask Choice)
			// choose step mother. we want [Ornate Dowsing Rod]
		// Welcome To Our ool Table (The Haunted Billiards Room).
				// try to win the key. on failure still gain 1 pool skill
				// practice pool skill
		// One Simple Nightstand (The Haunted Bedroom)
		// One Mahogany Nightstand (The Haunted Bedroom)
		// One Ornate Nightstand (The Haunted Bedroom)
		// One Rustic Nightstand (The Haunted Bedroom)
		// One Elegant Nightstand (The Haunted Bedroom)
		// Never Gonna Make You Up (The Haunted Bathroom)
			// fight the cosmetics wraith
		// Off the Rack (The Haunted Bathroom)
			// take the towel
		// Chasin' Babies (Laboratory) (The Haunted Laboratory)
		// Chasin' Babies (Nursery) (The Haunted Nursery)
		// Chasin' Babies (Storage Room) (The Haunted Storage Room)
			// skip
		// Take a Look, it's in a Book! (Rise) (The Haunted Library)
			// skip
		// Take a Look, it's in a Book! (Fall) (The Haunted Library)
				// get the dictionary
				// skip
		// We'll All Be Flat (The Haunted Ballroom)
			// unlock Spookyraven Manor Cellar
		// All Over the Map (The Black Forest)
		// You Found Your Thrill (The Black Forest)
		// The Blackest Smith (The Black Forest)
		// Be Mine (The Black Forest)
		// Sunday Black Sunday (The Black Forest)
		// You Found Your Thrill (The Black Forest)
		// Rainy Fax Dreams on your Wedding Day
			// leave and get your rain back
		// Ed the Undrowning (Heavy Rains)
			// fight Ed in a Heavy Rains run
		// Everything in Moderation (The Typical Tavern Cellar as Ed)
			// turn off the faucet as Ed, complete quest
		// Hot and Cold Dripping Rats (The Typical Tavern Cellar as Ed)
			// choose to not fight a rat
		// Temple of the Legend in the Hidden City (A Massive Ziggurat/Actually Ed the Undying)
		// Bee Persistent (The Black Forest)
		// Bee Rewarded (The Black Forest)
		// Like a Bat Into Hell (Actually Ed the Undying)
		// Like a Bat out of Hell (Actually Ed the Undying)
		// Home on the Free Range (Castle in the Clouds in the Sky (Ground Floor))
			// paths that don't require a boning knife for the tower
				// skip
				// get Electric Boning Knife
		// Now It's Dark (Lost in the Great Overlook Lodge)
			// finish init portion of quest
		// Temporarily Out of Skeletons (The Skeleton Store)
				// Skeleton Store office key
				// fight The former owner of the Skeleton Store
				// get ring of telling skeletons what to do or 300 meat
		// Heart of Madness (Madness Bakery Quest)
				// try to open door or open the door to fight Cake Lord
				// myst stats as best default option
		// Lots of Options (The Overgrown Lot)
				// Use Candy Cane Sword Cane to get all flowers and grass clippings
					// get flowers for doc galaktik quest
					// get 15 moxie substat
				// get flowers for doc galaktik quest
				// get extra booze from map to a hidden booze cache
			// prefer food in boris
				// get booze
				// get food
				// get 15 moxie substat
		// Welcome to the Copperhead Club (The Copperhead Club)
			// approach Shen's table
		// The "Rescue" (post-Cake Lord in Madness Bakery)
			// move to next part of quest
		// Cogito Ergot Sum (post-post-Cake Lord in Madness Bakery)
			// get the no-handed pie and complete quest
		// Wooof! Wooooooof! (Ghost Dog)
		// Playing Fetch (Ghost Dog)
		// Your Dog Found Something Again (Ghost Dog)
		// VYKEA! (VYKEA)
				// get consumables
				// get Wal-Mart gift certificates
				// skip
		// Blue Sideways In Time (Machine Elf)
			// acquire some abstractions
		// Daily Briefing (License to Adventure)
			// visit LI-11 HQ
		// Which Door? (Super Villain's Lair)
				// spend 1000 meat to eliminate 10 minions
				// if can't afford door 1, choose none
		// Granted a Boon (God Lobster)

			let goal: number = 0;
			let search: string = "";
			let glchoice: number = 0;
			switch (choice)
	{
		case 15:
		case 16:
		case 17:
			theeXtremeSlopeChoiceHandler(choice);
			break;
		case 18:
		case 19:
		case 20:
			itznotyerzitzMineChoiceHandler(choice);
			break;
		case 21:
			runChoice(2);
			break;
		case 22:
		case 23:
		case 24:
			piratesCoveChoiceHandler(choice);
			break;
		case 89:
			if (isActuallyEd() && (!possessEquipment(Item.get("serpentine sword")) || !possessEquipment(Item.get("snake shield"))))
			{
				runChoice(2);
			}
			else {
				runChoice(4);
			}
			break;
		case 90:
			runChoice(3);
			break;
		case 105:
			if (myPrimestat() === Stat.get("Mysticality"))
			{
				runChoice(1);
			}
			else {
				runChoice(2);
			}
			break;
		case 106:
			runChoice(3);
			break;
		case 107:
			runChoice(4);
			break;
		case 108:
			runChoice(4);
			break;
		case 109:
			if (options.has(4))
			{
				runChoice(4);
			}
			else {
				runChoice(1);
			}
			break;
		case 110:
			runChoice(4);
			break;
		case 111:
			runChoice(3);
			break;
		case 112:
			runChoice(2);
			break;
		case 113:
			runChoice(2);
			break;
		case 114:
			runChoice(2);
			break;
		case 115:
			runChoice(1);
			break;
		case 116:
			runChoice(4);
			break;
		case 117:
			runChoice(1);
			break;
		case 118:
			runChoice(2);
			break;
		case 120:
			runChoice(4);
			break;
		case 123:
		case 125:
			hiddenTempleChoiceHandler(choice, page);
			break;
		case 139:
			if (options.has(4) && haveWarOutfit$1())
			{
				runChoice(4);
			}
			else {
				runChoice(3);
			}
			break;
		case 140:
			if (options.has(4) && haveWarOutfit$1())
			{
				runChoice(4);
			}
			else {
				runChoice(3);
			}
			break;
		case 141:
			runChoice(1);
			break;
		case 142:
			runChoice(3);
			break;
		case 143:
			if (options.has(4) && haveWarOutfit$1())
			{
				runChoice(4);
			}
			else {
				runChoice(3);
			}
			break;
		case 144:
			if (options.has(4) && haveWarOutfit$1())
			{
				runChoice(4);
			}
			else {
				runChoice(3);
			}
			break;
		case 145:
			runChoice(1);
			break;
		case 146:
			runChoice(3);
			break;
		case 147:
			runChoice(3);
			break;
		case 148:
			runChoice(1);
			break;
		case 149:
			runChoice(2);
			break;
		case 153:
		case 155:
		case 157:
			cyrptChoiceHandler(choice);
			break;
		case 163:
			if (in_lar())
			{
				setProperty("_LAR_skipNC163", myTurncount().toString());
			}
			runChoice(4);
			break;
		case 178:
			if (in_lar())
			{
				setProperty("_LAR_skipNC178", myTurncount().toString());
			}
			runChoice(2);
			break;
		case 182:
			if (itemAmount(Item.get("model airship")) === 0)
			{
				runChoice(4);
			}
			else if (options.has(6))
			{
				runChoice(6);
			}
			else if (options.has(5) && L10_needUmbrella())
			{
				runChoice(5);
			}
			else {
				runChoice(1);
			}
			break;
		case 184:
		case 185:
		case 186:
			barrrneysBarrrChoiceHandler(choice);
			break;
		case 188:
			if (isWearingOutfit("Frat Boy Ensemble"))
			{
				runChoice(1);
			}
			else if (equippedAmount(Item.get("mullet wig")) === 1 && itemAmount(Item.get("briefcase")) > 0)
			{
				runChoice(2);
			}
			else if (equippedAmount(Item.get("frilly skirt")) === 1 && itemAmount(Item.get("hot wing")) > 2)
			{
				runChoice(3);
			}
			else { abort("I tried to infiltrate the orcish frat house without being equipped for the job"); }
			break;
		case 189:
			runChoice(2);
			break;
		case 191:
			fcleChoiceHandler(choice);
			break;
		case 330:
			if (toInt(getProperty("poolSharkCount")) < 25)
			{
				runChoice(1);
			}
			else {
				runChoice(2);
			}
			break;
		case 502:
		case 503:
		case 504:
		case 505:
		case 506:
		case 507:
			spookyForestChoiceHandler(choice);
			break;
		case 523:
		case 527:
			cyrptChoiceHandler(choice);
			break;
		case 542:
		case 543:
		case 544:
			runChoice(1);
			break;
		case 556:
			itznotyerzitzMineChoiceHandler(choice);
			break;
		case 575:
			theeXtremeSlopeChoiceHandler(choice);
			break;
		case 579:
		case 580:
		case 581:
		case 582:
		case 583:
		case 584:
			hiddenTempleChoiceHandler(choice, page);
			break;
		case 588:
			if (!containsText(page, "name=pingvalue size=5 value=2"))
			{
				runChoice(1, "pingvalue=2");
			}
			else if (!containsText(page, "name=whurmvalue size=5 value=4"))
			{
				runChoice(2, "whurmvalue=4");
			}
			else if (!containsText(page, "name=boomchuckvalue size=5 value=8"))
			{
				runChoice(3, "boomchuckvalue=8");
			}
			break;
		case 589:
			if (itemAmount(Item.get("bugbear autopsy tweezers")) > 0)
			{

				for (let i = 1; i <= 5; i++) {
					if (options.has(i))
					{
						runChoice(i);
						break;
					}
				}
			}
			else {
				runChoice(6);
			}
			break;
		case 590:
			if (options.has(2))
			{
				runChoice(2);
			}
			else {
				runChoice(1);
			}
			break;
		case 591:
		case 592:
		case 593:
			runChoice(1);
			break;
		case 597:
			auto_reagnimatedGetPart(choice);
			break;
		case 604:
		case 605:
			runChoice(1);
			break;
		case 606:
			if (in_bhy() || in_glover() && options.has(3) && itemAmount(Item.get("jar of oil")) === 0)
			{

				runChoice(6);
				break;
			}
			if (options.has(4))
			{
				runChoice(4);
				break;
			}
			if (options.has(3) && itemAmount(Item.get("jar of oil")) > 0)
			{
				runChoice(3);
				break;
			}
			if (options.has(2))
			{
				runChoice(2);
				break;
			}
			if (options.has(1))
			{
				runChoice(1);
				break;
			}
			auto_log_warning$1("Got the Twin Peak NC (Lost in the Great Overlook) without able to complete any of the tasks :(");
			break;
		case 607:
		case 608:
		case 609:
		case 610:
		case 616:
			runChoice(1);
			break;
		case 618:
			runChoice(2);
			break;
		case 669:
		case 670:
		case 671:
			castleBasementChoiceHandler(choice);
			break;
		case 672:
		case 673:
		case 674:
			runChoice(3);
			break;
		case 675:
		case 676:
		case 677:
		case 678:
		case 679:
		case 680:
			castleTopFloorChoiceHandler(choice);
			break;
		case 689:
		case 690:
		case 691:
		case 692:
		case 693:
			dailyDungeonChoiceHandler(choice, options);
			break;
		case 700:
			kolhsChoiceHandler(choice);
			break;
		case 763:
			runChoice(1);
			break;
		case 768:
			if (in_quantumTerrarium())
			{
				if (myLocation() === Location.get("The Themthar Hills"))
				{
					runChoice(4);
				}
				else if (myLevel() < 13)
				{
					runChoice(2);
				}
				else {
					runChoice(6);
				}
			}
			else {
				runChoice(2);
			}
			break;
		case 772:
			kolhsChoiceHandler(choice);
			break;
		case 780:
		case 781:
		case 783:
		case 784:
		case 785:
		case 786:
		case 787:
		case 788:
		case 789:
		case 791:
			hiddenCityChoiceHandler(choice);
			break;
		case 793:
			if (options.has(5) && toBoolean(getProperty("auto_considerCCSCShore")))
			{
				runChoice(5);
			}
			else if (myPrimestat() === Stat.get("Muscle"))
			{
				runChoice(1);
			}
			else if (myPrimestat() === Stat.get("Mysticality"))
			{
				runChoice(2);
			}
			else {
				runChoice(3);
			}
			break;
		case 794:
		case 795:
		case 796:
		case 797:
			oldLandfillChoiceHandler(choice);
			break;
		case 804:
			runChoice(2);
			break;
		case 806:
			runChoice(2);
			break;
		case 822:
		case 823:
		case 824:
		case 825:
		case 826:
			runChoice(1);
			break;
		case 829:
			runChoice(1);
			break;
		case 875:
			if (poolSkillPracticeGains() === 1 || currentPoolSkill() > 15)
			{
				runChoice(1);
			}
			else {
				runChoice(2);
			}
			break;
		case 876:
		case 877:
		case 878:
		case 879:
		case 880:
			hauntedBedroomChoiceHandler(choice, options);
			break;
		case 881:
			runChoice(1);
			break;
		case 882:
			runChoice(1);
			break;
		case 884:
		case 885:
		case 886:
			runChoice(6);
			break;
		case 888:
			runChoice(5);
			break;
		case 889:
			if (itemAmount(Item.get("dictionary")) === 0 && toBoolean(getProperty("auto_getDictionary")))
			{
				runChoice(4);
			}
			else {
				runChoice(5);
			}
			break;
		case 921:
			runChoice(1);
			break;
		case 923:
		case 924:
		case 925:
		case 926:
		case 927:
		case 928:
			blackForestChoiceHandler(choice);
			break;
		case 970:
			runChoice(2);
			break;
		case 976:
			runChoice(1);
			break;
		case 1000:
			runChoice(1);
			break;
		case 1001:
			runChoice(2);
			break;
		case 1002:
			hiddenCityChoiceHandler(choice);
			break;
		case 1018:
		case 1019:
			blackForestChoiceHandler(choice);
			break;
		case 1023:
		case 1024:
			edUnderworldChoiceHandler(choice);
			break;
		case 1026:
			if (itemAmount(Item.get("electric boning knife")) > 0 || isActuallyEd() || in_bugbear() || in_pokefam())
			{
				runChoice(3);
			}
			else {
				runChoice(2);
			}
			break;
		case 1056:
			runChoice(1);
			break;
		case 1060:
			if (itemAmount(Item.get("Skeleton Store office key")) === 0)
			{
				runChoice(1);
			}
			else if (internalQuestStatus("questM23Meatsmith") < 1)
			{
				runChoice(4);
			}
			else {
				runChoice(2);
			}
			break;
		case 1061:
			if (internalQuestStatus("questM25Armorer") <= 2)
			{
				runChoice(1);
			}
			else {
				runChoice(5);
			}
			break;
		case 1062:
			if (options.has(6))
			{
				runChoice(6);
				if (options.has(1))
				{
					runChoice(1);
				}
				else {
					runChoice(4);
				}
			}
			if (options.has(1))
			{
				runChoice(1);
			}
			else if (canDrink() && options.has(5))
			{
				runChoice(5);
			}
			else if (canDrink() && !is_boris())
			{
				runChoice(3);
			}
			else if (canEat())
			{
				runChoice(2);
			}
			else {
				runChoice(4);
			}
			break;
		case 1074:
			runChoice(1);
			break;
		case 1082:
			runChoice(1);
			break;
		case 1083:
			runChoice(1);
			break;
		case 1106:
		case 1107:
		case 1108:
			doghouseChoiceHandler(choice);
			break;
		case 1115:
			if (!toBoolean(getProperty("_VYKEACafeteriaRaided")))
			{
				runChoice(1);
			}
			else if (!toBoolean(getProperty("_VYKEALoungeRaided")))
			{
				runChoice(4);
			}
			else {
				runChoice(6);
			}
			break;
		case 1119:
			runChoice(1);
			break;
		case 1258:
			runChoice(2);
			break;
		case 1261:
			if (myMeat() > 1000)
			{
				runChoice(1);
			}
			else {
				runChoice(4);
			}
			break;
		case 1310:			goal = toInt(getProperty("_auto_lobsterChoice"));			search = "I'd like part of your regalia.";
			if (goal === 2)
			{
				search = "I'd like a blessing.";
			}
			else if (goal === 3)
			{
				search = "I'd like some experience.";
			}			glchoice = 0;
			for (const [idx, str] of options)
			{
				if (containsText(str, search))
				{
					glchoice = idx;
				}
			}
			runChoice(glchoice);
			break;
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
			auto_log_info$1("Accepting doctor quest, it's our job!");
			runChoice(1);
			break;
		case 1342: // Torpor (Dark Gyffte)
			bat_reallyPickSkills(20);
			break;
		case 1391: // Rationing out Destruction (Kingdom of Exploathing)
			koe_RationingOutDestruction();
			break;
		case 1393: // The Invader (Kingdom of Exploathing)
			runChoice(1); // fight the invader

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
			if (myPrimestat() === Stat.get("Muscle"))
			{
				runChoice(1); // muscle stats
			}
			else if (myPrimestat() === Stat.get("Mysticality"))
			{
				runChoice(2); // myst stats
			}
			else {
			// if no prime stat we still want moxie
				runChoice(3); // moxie stats
			}
			break;
		case 1494: // Examine S.I.T. Course Certificate (S.I.T Course)
			if (myLevel() < 8)
			{
				runChoice(3); // Cryptobotanist (S.I.T. Course)
			}
			else {
				runChoice(2); // Insectologist (S.I.T. Course)
			}
			break;
		case 1497: // Calling Rufus
			runChoice(2); // get artifact quest

			break;
		case 1500: // Like a Loded Stone
			runChoice(2); // only come here to get shadow waters buff

			break;
		case 1519: // The coffee was *gasp* decaf!
			runChoice(1);
			break;
		case 1520: // Hang On to Yourself
			runChoice(1);
			break;
		case 1521: // Ch-ch-ch-ch-chaaaanges
			runChoice(1);
			break;
		case 1522: // The Antiscientific Method
			runChoice(1);
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
			runChoice(1);
			break;
		case 1599: // Legendary Digestion: if we aren't forcing combat, by default use spleen, else take famxp
			legendaryNoodlesChoiceHandler();
			break;
		default:
			break;
	} }

	return true;
}

export function main(choice: number, page: string): void
{
	let ret: boolean = false;
	try {
		ret = auto_run_choice(choice, page);
	} finally
	{
		if (!ret)
		{
			auto_log_error("Error running auto_choice_adv.js, setting auto_interrupt=true");
			setProperty("auto_interrupt", true.toString());
		}
	}
}
