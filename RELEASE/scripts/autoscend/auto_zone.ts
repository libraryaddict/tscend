import { Class, Effect, Element, Familiar, Item, Location, Monster, Skill, Slot, Stat, availableAmount, canAdventure, canadiaAvailable, containsText, equippedItem, fullnessLimit, getLocationMonsters, getMonsters, getProperty, gnomadsAvailable, guildAvailable, haveEffect, haveFamiliar, haveOutfit, haveSkill, inHardcore, isWearingOutfit, itemAmount, itemDrops, itemDropsArray, monsterLevelAdjustment, myAscensions, myClass, myLevel, myPrimestat, toBoolean, toFloat, toInt, toLocation } from "kolmafia";
import { fullness_left, inebriety_left } from "./auto_consume";
import { possessEquipment, possessOutfit$1 } from "./auto_equipment";
import { auto_combat_appearance_rates, auto_haveQueuedForcedNonCombat, auto_log_debug$1, canYellowRay$1, cloversAvailable$1, elemental_resist, internalQuestStatus, isDesertAvailable, isGuildClass } from "./auto_util";
import { generic_t } from "./autoscend_record";
import { expectGhostReport } from "./iotms/mr2016";
import { auto_voteMonster } from "./iotms/mr2018";
import { auto_sausageGoblin } from "./iotms/mr2019";
import { auto_canFightPiranhaPlant, auto_canTendMushroomGarden } from "./iotms/mr2020";
import { auto_haveBatWings } from "./iotms/mr2024";
import { bugbear_BioDataRemaining, in_bugbear } from "./paths/bugbear_invasion";
import { in_koe } from "./paths/kingdom_of_exploathing";
import { kolhs_mandatorySchool } from "./paths/kolhs";
import { in_lta } from "./paths/license_to_adventure";
import { in_lar } from "./paths/live_ascend_repeat";
import { in_plumber } from "./paths/path_of_the_plumber";
import { in_robot } from "./paths/you_robot";
import { L8_forceExtremeInstead } from "./quests/level_08";
import { bridgeGoal } from "./quests/level_09";
import { getShenZonesTurnsSpent, liana_cleared } from "./quests/level_11";
import { need8BitPoints, needStarKey } from "./quests/level_13";
import { LX_doingPirates, LX_unlockThinknerdWarehouse, numPirateInsults } from "./quests/optional";

//All functions should fail if the king is liberated?
//Zone functions come here.

//Defined in autoscend/auto_zone.ash
export function zone_unlock(loc: Location): boolean {

	let unlocked: boolean = false;
	if (loc === Location.get("The Thinknerd Warehouse")) {
		unlocked = LX_unlockThinknerdWarehouse(false);
	} else {
		auto_log_debug$1(`Don't know how to unlock ${loc}`);
		return false;
	}

	if (!unlocked) {
		auto_log_debug$1(`Wasnt able to unlock ${loc}`);
	}

	return unlocked;
}

export function zone_isAvailable(loc: Location, unlockIfPossible: boolean): boolean {

	if (zone_available(loc)) {
		return true;
	}

	if (unlockIfPossible) {
		zone_unlock(loc);
	}

	return zone_available(loc);
}

export function zone_isAvailable$1(loc: Location): boolean
{
	return zone_isAvailable(loc, true);
}

export function zone_delayable(): Map<Location, number>
{
	let retval: Map<Location, number> = new Map();
	for (let loc of Location.get(["Your Mushroom Garden", "Pump Up Muscle", "Pump Up Mysticality", "Pump Up Moxie", "Richard's Hobo Mysticality", "Richard's Hobo Moxie", "Richard's Hobo Muscle", "A Maze of Sewer Tunnels", "Hobopolis Town Square", "Burnbarrel Blvd.", "Exposure Esplanade", "The Heap", "The Ancient Hobo Burial Ground", "The Purple Light District", "The Slime Tube", "Dreadsylvanian Woods", "Dreadsylvanian Village", "Dreadsylvanian Castle", "The Sleazy Back Alley", "The Copperhead Club", "The Skeleton Store", "Madness Bakery", "The Overgrown Lot", "Goat Party", "Pirate Party", "Lemon Party", "The Roulette Tables", "The Poker Room", "An Unusually Quiet Barroom Brawl", "The Haunted Boiler Room", "The Haunted Laundry Room", "The Haunted Wine Cellar", "Summoning Chamber", "The Haunted Pantry", "The Haunted Kitchen", "The Haunted Conservatory", "The Haunted Library", "The Haunted Billiards Room", "The Haunted Bathroom", "The Haunted Bedroom", "The Haunted Gallery", "The Haunted Ballroom", "The Haunted Laboratory", "The Haunted Nursery", "The Haunted Storage Room", "The Degrassi Knoll Restroom", "The Degrassi Knoll Bakery", "The Degrassi Knoll Gym", "The Degrassi Knoll Garage", "The \"Fun\" House", "The Unquiet Garves", "The VERY Unquiet Garves", "Inside the Palindome", "The Bat Hole Entrance", "Guano Junction", "The Batrat and Ratbat Burrow", "The Beanbat Chamber", "The Boss Bat's Lair", "The Outskirts of Cobb's Knob", "Cobb's Knob Barracks", "Cobb's Knob Kitchens", "Cobb's Knob Harem", "Cobb's Knob Treasury", "Throne Room", "Cobb's Knob Laboratory", "The Knob Shaft", "The Knob Shaft (Mining)", "Cobb's Knob Menagerie, Level 1", "Cobb's Knob Menagerie, Level 2", "Cobb's Knob Menagerie, Level 3", "The Cola Wars Battlefield", "Cola Wars Battlefield (Cloaca Uniform)", "Cola Wars Battlefield (Dyspepsi Uniform)", "Tower Ruins", "Fernswarthy's Basement", "The Defiled Nook", "The Defiled Cranny", "The Defiled Alcove", "The Defiled Niche", "Haert of the Cyrpt", "The Penultimate Fantasy Airship", "The Castle in the Clouds in the Sky (Basement)", "The Castle in the Clouds in the Sky (Ground Floor)", "The Castle in the Clouds in the Sky (Top Floor)", "The Hole in the Sky", "Fastest Adventurer Contest", "Strongest Adventurer Contest", "Smartest Adventurer Contest", "Smoothest Adventurer Contest", "A Crowd of (Stat) Adventurers", "Hottest Adventurer Contest", "Coldest Adventurer Contest", "Spookiest Adventurer Contest", "Stinkiest Adventurer Contest", "Sleaziest Adventurer Contest", "A Crowd of (Element) Adventurers", "The Hedge Maze", "Tower Level 1", "Tower Level 2", "Tower Level 3", "Tower Level 4", "Tower Level 5", "The Naughty Sorceress' Chamber", "South of the Border", "The Oasis", "The Arid, Extra-Dry Desert", "The Shore, Inc. Travel Agency", "Kokomo Resort", "The Upper Chamber", "The Middle Chamber", "The Lower Chambers", "Noob Cave", "The Dire Warren", "The Valley of Rof L'm Fao", "The Smut Orc Logging Camp", "The Thinknerd Warehouse", "The Haiku Dungeon", "The Limerick Dungeon", "The Enormous Greater-Than Sign", "The Dungeons of Doom", "The Daily Dungeon", "Itznotyerzitz Mine", "The Goatlet", "Lair of the Ninja Snowmen", "The eXtreme Slope", "Mist-Shrouded Peak", "The Icy Peak", "The Mine Foremens' Office", "Dwarven Factory Warehouse", "Itznotyerzitz Mine (in Disguise)", "A-Boo Peak", "Twin Peak", "Oil Peak", "A Mob of Zeppelin Protesters", "The Red Zeppelin", "The Typical Tavern Cellar", "The Spooky Forest", "The Hidden Temple", "A Barroom Brawl", "Whitey's Grove", "The Road to the White Citadel", "The Black Forest", "The Old Landfill", "The Dark Neck of the Woods", "The Dark Heart of the Woods", "The Dark Elbow of the Woods", "Friar Ceremony Location", "Pandamonium", "Pandamonium Slums", "The Laugh Floor", "Infernal Rackets Backstage", "The Hidden Apartment Building", "The Hidden Hospital", "The Hidden Office Building", "The Hidden Bowling Alley", "The Hidden Park", "An Overgrown Shrine (Northwest)", "An Overgrown Shrine (Southwest)", "An Overgrown Shrine (Northeast)", "An Overgrown Shrine (Southeast)", "A Massive Ziggurat", "The Dripping Trees", "The Dripping Hall", "The Fungus Plains", "Hero's Field", "Vanya's Castle", "Megalo-City", "The Orcish Frat House", "The Orcish Frat House (In Disguise)", "The Hippy Camp", "The Hippy Camp (In Disguise)", "The Hippy Camp (Bombed Back to the Stone Age)", "The Orcish Frat House (Bombed Back to the Stone Age)", "The Obligatory Pirate's Cove", "Barrrney's Barrr", "The F'c'le", "The Poop Deck", "Belowdecks", "Wartime Frat House (Hippy Disguise)", "Wartime Frat House", "Wartime Hippy Camp (Frat Disguise)", "Wartime Hippy Camp", "The Battlefield (Frat Uniform)", "The Battlefield (Hippy Uniform)", "Next to that Barrel with Something Burning in it", "Near an Abandoned Refrigerator", "Over Where the Old Tires Are", "Out by that Rusted-Out Car", "McMillicancuddy's Barn", "McMillicancuddy's Pond", "McMillicancuddy's Back 40", "McMillicancuddy's Other Back 40", "McMillicancuddy's Granary", "McMillicancuddy's Bog", "McMillicancuddy's Family Plot", "McMillicancuddy's Shady Thicket", "The Hatching Chamber", "The Feeding Chamber", "The Royal Guard Chamber", "The Filthworm Queen's Chamber", "The Themthar Hills", "The Junkyard", "McMillicancuddy's Farm", "Sonofa Beach", "The Briny Deeps", "The Brinier Deepers", "The Briniest Deepests", "An Octopus's Garden", "The Wreck of the Edgar Fitzsimmons", "The Marinara Trench", "Anemone Mine", "The Dive Bar", "The Mer-Kin Outpost", "The Coral Corral", "The Caliginous Abyss", "The Skate Park", "Madness Reef", "Anemone Mine (Mining)", "Mer-kin Elementary School", "Mer-kin Library", "Mer-kin Gymnasium", "Mer-kin Colosseum", "Mer-kin Temple", "Mer-kin Temple (Left Door)", "Mer-kin Temple (Center Door)", "Mer-kin Temple (Right Door)", "The Fungal Nethers", "The Broodling Grounds", "The Outer Compound", "The Temple Portico", "Convention Hall Lobby", "Outside the Club", "The Island Barracks", "The Nemesis' Lair", "The Secret Council Warehouse", "Super Villain's Lair", "Medbay", "Waste Processing", "Sonar", "Science Lab", "Morgue", "Special Ops", "Engineering", "Navigation", "Galley", "The Hallowed Halls", "Shop Class", "Chemistry Class", "Art Class", "The Exploaded Battlefield", "The Invader", "The Goo Fields", "The Goo-Choked Fun House", "The Goo-Coated Knob", "The Goo-Spewing Bat Hole", "The Goo-Bedecked Beanstalk", "The Goo-Shrouded Palindome", "The Goo-Girded Garves", "The Goo-Splattered Tower Ruins", "Fight in the Dirt", "Fight in the Tall Grass", "Fight in the Very Tall Grass", "The Bugbear Pen", "The Spooky Gravy Burrow", "Post-Quest Bugbear Pens", "Outskirts of Camp Logging Camp", "Camp Logging Camp", "The Edge of the Swamp", "The Dark and Spooky Swamp", "The Corpse Bog", "The Ruined Wizard Tower", "The Wildlife Sanctuarrrrrgh", "Swamp Beaver Territory", "The Weird Swamp Village", "Thugnderdome", "Heartbreaker's Hotel", "Trick-or-Treating", "Drunken Stupor", "St. Sneaky Pete's Day Stupor", "Bloated and Nauseous", "Poisoned Spleen", "The Yuletide Bonfire", "The Arrrboretum", "The Spectral Pickle Factory", "Generic Summer Holiday Swimming!", "The Cave Before Time", "An Illicit Bohemian Party", "Moonshiners' Woods", "The Roman Forum", "The Post-Mall", "The Rowdy Saloon", "The Spooky Old Abandoned Mine", "Globe Theatre Main Stage", "Globe Theatre Backstage", "12 West Main", "KoL Con Clan Party House", "The Home of The Future", "Spring Bros. Solenoids", "Boltsmann Bearings", "The Primordial Stew", "No Man's And Also No Skeleton's Land", "Axis HQ", "Shadow Rift", "Shadow Rift (Desert Beach)", "Shadow Rift (Forest Village)", "Shadow Rift (Mt. McLargeHuge)", "Shadow Rift (Somewhere Over the Beanstalk)", "Shadow Rift (Spookyraven Manor Third Floor)", "Shadow Rift (The 8-Bit Realm)", "Shadow Rift (The Ancient Buried Pyramid)", "Shadow Rift (The Castle in the Clouds in the Sky)", "Shadow Rift (The Distant Woods)", "Shadow Rift (The Hidden City)", "Shadow Rift (The Misspelled Cemetary)", "Shadow Rift (The Nearby Plains)", "Shadow Rift (The Right Side of the Tracks)", "Lollipop Forest", "Fudge Mountain", "Gingerbread Reef", "The Wreck of the H. M. S. Kringle", "The Impenetrable Kelp-Holly Forest", "Smoldering Bone Spikes", "Smoldering Fingerbones", "A Smoldering Pelvis", "A Smoldering Ribcage", "Easter Island", "St. Patrick's Day Island", "Veterans Day Island", "Thanksgiving Island", "Christmas Island", "Abuela's Cottage (Contested)", "The Embattled Factory", "The Bar At War", "A Cafe Divided", "The Armory Up In Arms", "Crimbo Train (Caboose)", "Crimbo Train (Passenger Car)", "Crimbo Train (Dining Car)", "Crimbo Train (Coal Car)", "Crimbo Train (Locomotive)", "Site Alpha Dormitory", "Site Alpha Greenhouse", "Site Alpha Quarry", "Site Alpha Primary Lab", "The Canadian Wildlife Preserve", "The Cheerless Spire (Level 1)", "The Cheerless Spire (Level 2)", "The Cheerless Spire (Level 3)", "The Cheerless Spire (Level 4)", "The Cheerless Spire (Level 5)", "Your Bung Chakra", "Your Guts Chakra", "Your Liver Chakra", "Your Nipple Chakra", "Your Nose Chakra", "Your Hat Chakra", "Crimbo's Sack", "Crimbo's Boots", "Crimbo's Jelly", "Crimbo's Reindeer", "Crimbo's Beard", "Crimbo's Hat", "The Ruins of the Fully Automated Crimbo Factory", "The Crimbonium Mining Camp", "The Crimbonium Mine", "WarBear Fortress (First Level)", "WarBear Fortress (Second Level)", "WarBear Fortress (Third Level)", "Crimbo Town Toy Factory (2012)", "Elf Alley", "CRIMBCO cubicles", "CRIMBCO WC", "Crimbo Town Toy Factory (2009)", "The Don's Crimbo Compound", "Atomic Crimbo Toy Factory", "Old Crimbo Town Toy Factory", "Sinister Dodecahedron", "Crimbo Town Toy Factory (2007)", "Simple Tool-Making Cave", "Spooky Fright Factory", "Crimborg Collective Factory", "Crimbo Town Toy Factory (2005)", "Market Square, 28 Days Later", "The Mall of Loathing, 28 Days Later", "Wrong Side of the Tracks, 28 Days Later", "The Icy Peak in The Recent Past", "Spectral Salad Factory", "Shivering Timbers", "A Skeleton Invasion!", "The Cannon Museum", "A Swarm of Yeti-Mounted Skeletons", "The Bonewall", "A Massive Flying Battleship", "A Supply Train", "The Bone Star", "Grim Grimacite Site", "A Pile of Old Servers", "The Haunted Sorority House", "Fightin' Fire", "Super-Intense Mega-Grassfire", "Fierce Flying Flames", "Lord Flameface's Castle Entryway", "Lord Flameface's Castle Belfry", "Lord Flameface's Throne Room", "A Stinking Abyssal Portal", "A Scorching Abyssal Portal", "A Terrifying Abyssal Portal", "A Freezing Abyssal Portal", "An Unsettling Abyssal Portal", "A Yawning Abyssal Portal", "The Space Odyssey Discotheque", "The Spirit World", "Some Scattered Smoking Debris", "A Crater Full of Space Beasts", "An Eldritch Fissure", "An Eldritch Horror", "Monorail Work Site", "A Monorail Station", "El Vibrato Island", "The Tunnel of L.O.V.E.", "The Deep Machine Tunnels", "Investigating a Plaintive Telegram", "The Neverending Party", "Mt. Molehill", "[DungeonFAQ - Level 1]", "[DungeonFAQ - Level 2]", "[DungeonFAQ - Level 3]", "The Red Queen's Garden", "The Clumsiness Grove", "The Maelstrom of Lovers", "The Glacier of Jerks", "An Incredibly Strange Place (Bad Trip)", "An Incredibly Strange Place (Mediocre Trip)", "An Incredibly Strange Place (Great Trip)", "The Stately Pleasure Dome", "The Mouldering Mansion", "The Rogue Windmill", "The Primordial Soup", "The Jungles of Ancient Loathing", "Seaside Megalopolis", "Domed City of Ronaldus", "Domed City of Grimacia", "Hamburglaris Shield Generator", "The Landscaper's Lair", "Professor Jacking's Small-O-Fier", "Professor Jacking's Huge-A-Ma-Tron", "Vanya's Castle Foyer", "Vanya's Castle Chapel", "Kegger in the Woods", "The Electric Lemonade Acid Parade", "Neckback Crick", "Anger Man's Level", "Fear Man's Level", "Doubt Man's Level", "Regret Man's Level", "The Nightmare Meatrealm", "A Kitchen Drawer", "A Grocery Bag", "Chinatown Shops", "Triad Factory", "1st Floor, Shiawase-Mitsuhama Building", "2nd Floor, Shiawase-Mitsuhama Building", "3rd Floor, Shiawase-Mitsuhama Building", "Chinatown Tenement", "The Gourd!", "The Tower of Procedurally-Generated Skeletons", "The Old Man's Bathtime Adventures", "The Inner Wolf Gym", "Unleash Your Inner Wolf", "Sweet-Ade Lake", "Eager Rice Burrows", "Gumdrop Forest", "A Deserted Stretch of I-911", "The Prince's Restroom", "The Prince's Dance Floor", "The Prince's Kitchen", "The Prince's Balcony", "The Prince's Lounge", "The Prince's Canapes Table", "Ye Olde Medievale Villagee", "Portal to Terrible Parents", "Rumpelstiltskin's Workshop", "The Fun-Guy Mansion", "Sloppy Seconds Diner", "The Sunken Party Yacht", "The Mansion of Dr. Weirdeaux", "The Secret Government Laboratory", "The Deep Dark Jungle", "Barf Mountain", "Pirates of the Garbage Barges", "The Toxic Teacups", "Uncle Gator's Country Fun-Time Liquid Waste Sluice", "The SMOOCH Army HQ", "The Velvet / Gold Mine", "LavaCo&trade; Lamp Factory", "The Bubblin' Caldera", "The Velvet / Gold Mine (Mining)", "The Ice Hotel", "VYKEA", "The Ice Hole", "The Mines", "The Jungle", "The Ice Caves", "The Temple Ruins", "Hell", "The Snake Pit", "The Spider Hole", "The Ancient Burial Ground", "The Beehive", "The Crashed U. F. O.", "The City of Goooold", "LOLmec's Lair", "Yomama's Throne", "Center Park After Dark", "The Mean Streets", "Warehouse Row", "Gotpork Conservatory of Flowers", "Gotpork Municipal Reservoir", "Gotpork Gardens Cemetery", "Gotpork City Sewers", "Porkham Asylum", "The Old Gotpork Library", "Gotpork Clock, Inc.", "Gotpork Foundry", "Trivial Pursuits, LLC", "JokesterCo", "The X-32-F Combat Training Snowman", "Through the Spacegate", "Gingerbread Civic Center", "Gingerbread Train Station", "Gingerbread Industrial Zone", "Gingerbread Upscale Retail District", "Gingerbread Sewers", "The Bandit Crossroads", "The Towering Mountains", "The Mystic Wood", "The Putrid Swamp", "The Cursed Village", "The Sprawling Cemetery", "The Old Rubee Mine", "The Foreboding Cave", "The Faerie Cyrkle", "The Druidic Campsite", "Near the Witch's House", "The Evil Cathedral", "The Barrow Mounds", "The Cursed Village Thieves' Guild", "The Troll Fortress", "The Labyrinthine Crypt", "The Lair of the Phoenix", "The Dragon's Moor", "Duke Vampire's Chateau", "The Master Thief's Chalet", "The Spider Queen's Lair", "The Archwizard's Tower", "The Ley Nexus", "The Ghoul King's Catacomb", "The Ogre Chieftain's Keep", "Sailing the PirateRealm Seas", "PirateRealm Island", "Battle Island", "Crab Island", "Glass Island", "Dessert Island", "Key Key", "Skull Island", "Isla Gublar", "Cemetery Island", "Jungle Island", "Trash Island", "Prison Island", "Signal Island", "Tiki Island", "Storm Island", "Red Roger's Fortress", "Jack's Hideout", "The Temple", "Cyberzone 1", "Cyberzone 2", "Cyberzone 3", "Degrassi Knoll", "The Road to White Citadel", "The Haunted Kitchen (OLD)", "The Haunted Conservatory (OLD)", "The Haunted Billiards Room (OLD)", "The Haunted Bathroom (OLD)", "The Haunted Bedroom (OLD)", "The Black Forest (OLD)", "The Hidden City", "The Palindome (OLD)", "The Arid, Extra-Dry Desert (Dehydrated)", "The Arid, Extra-Dry Desert (Ultrahydrated)", "OLD The Upper Chamber", "OLD The Middle Chamber", "The Haunted Wine Cellar (Northwest)", "The Haunted Wine Cellar (Northeast)", "The Haunted Wine Cellar (Southwest)", "The Haunted Wine Cellar (Southeast)", "Nemesis Cave", "8-Bit Realm"]))
	{
		let locValue: generic_t = zone_delay(loc);
		if (locValue._boolean && zone_isAvailable$1(loc))
		{
			retval.set(loc, locValue._int);
		}
	}
	return retval;
}
// generic_t is defined in autoscend_record.ash

export function zone_needItem(loc: Location): generic_t
{
	// attempting to list these in descending order in relation to the quest they relate to
	// (so L13 quest stuff first then L12 then L11 and so on).
	let retval: generic_t = new generic_t();
	let value: number = 0.0;
	{ 
		// bonus points cap at +400% item. Equivalent to a 20% item drop
		//already in the other war outfit means only there to start the war
		//already in the other war outfit means only there to start the war
		//Only if we need stone wool manually for some reason.
		//Or via the semi-rare!		(100/50/20 for SR, 25 Sheep)

		let getMilk: boolean = false;
		let milksPerMilk: number = 0;
		let milkUsed: number = 0;
		switch (loc)
	{
	case Location.get("Hero's Field"):
		value = 20.0;
		break;
	case Location.get("The Hole in the Sky"):
		if (itemAmount(Item.get("star")) < 8 || itemAmount(Item.get("line")) < 7) {
			value = 30.0;
		}
		break;
	case Location.get("The Orcish Frat House"):
	case Location.get("The Hippy Camp"):
			value = 5.0;
		break;
	case Location.get("Wartime Frat House"):
		if (!possessOutfit$1("Frat Warrior Fatigues") && !isWearingOutfit("War Hippy Fatigues")) {
			value = 5.0;
		}
		break;
	case Location.get("Wartime Hippy Camp"):
		if (!possessOutfit$1("War Hippy Fatigues") && !isWearingOutfit("Frat Warrior Fatigues")) {
			value = 5.0;
		}
		break;
	case Location.get("The Battlefield (Frat Uniform)"):
	case Location.get("The Battlefield (Hippy Uniform)"):
			value = 5.0;
		break;
	case Location.get("The Hatching Chamber"):
	case Location.get("The Feeding Chamber"):
	case Location.get("The Royal Guard Chamber"):
		value = 10.0;
		break;
	case Location.get("The Oasis"):
		if (haveEffect(Effect.get("Ultrahydrated")) > 0)
		{
			value = 30.0;
		}
		break;
	case Location.get("The Middle Chamber"):
		value = 20.0;
		break;
	case Location.get("The Haunted Library"):
		if (itemAmount(Item.get("killing jar")) < 1 && (toInt(getProperty("gnasirProgress")) & 4) === 0 && toInt(getProperty("desertExploration")) < 100) {
			value = 10.0;
		}
		break;
	case Location.get("The Haunted Laundry Room"):
		value = 5.0 * (1.0 + toFloat(getProperty("auto_cabinetsencountered")));
		break;
	case Location.get("The Haunted Wine Cellar"):
		value = 5.0 * (1.0 + toFloat(getProperty("auto_wineracksencountered")));
		break;
	case Location.get("The Hidden Park"):
		if (toInt(getProperty("hiddenTavernUnlock")) < myAscensions()) {
			value = 20.0;
		}
		break;
	case Location.get("The Hidden Bowling Alley"):
		if (itemAmount(Item.get("bowling ball")) === 0 && toInt(getProperty("hiddenBowlingAlleyProgress")) < 5) {
			value = 40.0;
		}
		break;
	case Location.get("The Hidden Temple"):
		if (haveEffect(Effect.get("Stone-Faced")) === 0) {
			value = 20.0;
		}
		break;
	case Location.get("The Black Forest"):
		if (!possessEquipment(Item.get("blackberry galoshes"))) {
			value = 20.0;
		}
		break;
	case Location.get("Inside the Palindome"):
		if (itemAmount(Item.get("stunt nuts")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0) {
			value = 30.0;
		}
		break;
	case Location.get("Whitey's Grove"):
		if ((itemAmount(Item.get("lion oil")) === 0 || itemAmount(Item.get("bird rib")) === 0) && itemAmount(Item.get("wet stew")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0 && internalQuestStatus("questL11Palindome") < 5)
		{
			value = 25.0;
		}
		break;
	case Location.get("The Copperhead Club"):
	case Location.get("A Mob of Zeppelin Protesters"):
		if (internalQuestStatus("questL11Ron") >= 1) {
			value = 15.0;
		}
		break;
	case Location.get("The Red Zeppelin"):
		value = 30.0;
		break;
	case Location.get("The Penultimate Fantasy Airship"):
		if (!possessEquipment(Item.get("amulet of extreme plot significance")))
		{
			value = 10.0;
		}
		if (!possessEquipment(Item.get("Mohawk wig")))
		{
			value = 10.0;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Basement)"):
		value = 40.0;
		break;
	case Location.get("The Castle in the Clouds in the Sky (Ground Floor)"):
		value = 20.0;
		break;
	case Location.get("The Smut Orc Logging Camp"):
		if (toInt(getProperty("chasmBridgeProgress")) < bridgeGoal())
		{
			value = 10.0;
		}
		break;
	case Location.get("A-Boo Peak"):
		if (toInt(getProperty("auto_aboopending")) === 0)
		{
			value = 15.0;
		}
		break;
	case Location.get("Twin Peak"):
		value = 15.0;
		break;
	case Location.get("Oil Peak"):
		if ((toInt(getProperty("twinPeakProgress")) & 4) === 0 && itemAmount(Item.get("bubblin' crude")) < 12 && itemAmount(Item.get("jar of oil")) < 1) {
			if (monsterLevelAdjustment() > 100) {
				value = 10.0;
			} else if (monsterLevelAdjustment() > 50) {
				value = 30.0;
			} else if (monsterLevelAdjustment() > 20) {
				value = 10.0;
			}
		}
		break;
	case Location.get("The Valley of Rof L'm Fao"):
		if (itemAmount(Item.get("lowercase N")) === 0 && itemAmount(Item.get("ND")) === 0 && itemAmount(Item.get("Wand of Nagamar")) === 0 && toBoolean(getProperty("auto_wandOfNagamar")))
		{
			value = 30.0;
		}
	case Location.get("Itznotyerzitz Mine"):
		if (!possessOutfit$1("Mining Gear") && cloversAvailable$1() === 0)
		{
			value = 10.0;
		}
		break;
	case Location.get("The Goatlet"):		getMilk = (haveSkill(Skill.get("Advanced Saucecrafting")) || myClass() === Class.get("Sauceror") && (guildAvailable() || !toBoolean(getProperty("auto_skipUnlockGuild")))) && fullnessLimit() !== 0;		milksPerMilk = (myClass() === Class.get("Sauceror") ? 3 : 1);		milkUsed = (toBoolean(getProperty("_milkOfMagnesiumUsed")) || fullness_left() === 0 ? 1 : 0);
		if (itemAmount(Item.get("milk of magnesium")) + milksPerMilk * itemAmount(Item.get("glass of goat's milk")) + milkUsed >= 3)
		{
			getMilk = false;
		}
		if (getMilk)
		{
			value = 20.0;
		}
		else {
			value = 40.0;
		}
		break;
	case Location.get("The eXtreme Slope"):
		if (!possessOutfit$1("eXtreme Cold-Weather Gear"))
		{
			value = 10.0;
		}
	case Location.get("The Defiled Nook"):
		
		// Handle for a gravy boat?
if (toInt(getProperty("cyrptNookEvilness")) > 14)
		{
			value = 20.0;
		}
		break;
	case Location.get("The Dark Neck of the Woods"):
	case Location.get("The Dark Heart of the Woods"):
	case Location.get("The Dark Elbow of the Woods"):
	case Location.get("Pandamonium Slums"):
		if (LX_doingPirates() && itemAmount(Item.get("hot wing")) < 3 && internalQuestStatus("questM12Pirate") <= 2)
		{
			value = 30;
		}
		break;
	case Location.get("Cobb's Knob Barracks"):
		if (!haveOutfit("Knob Goblin Elite Guard Uniform"))
		{
			value = 10.0;
		}
		break;
	case Location.get("Cobb's Knob Harem"):
		if (itemAmount(Item.get("Knob Goblin perfume")) === 0)
		{
			value = 25.0;
		}
		if (!possessOutfit$1("Knob Goblin Harem Girl Disguise")) {
			value = 20.0;
		}
		break;
	case Location.get("The Beanbat Chamber"):
		if (itemAmount(Item.get("enchanted bean")) === 0)
		{
			value = 50.0;
		}
		if (internalQuestStatus("questL04Bat") < 3)
		{
			value = 10.0;
		}
		break;
	case Location.get("The Batrat and Ratbat Burrow"):
		if (internalQuestStatus("questL04Bat") < 3)
		{
			value = 15.0;
		}
		break;
	case Location.get("The Bat Hole Entrance"):
	case Location.get("Guano Junction"):
		if (internalQuestStatus("questL04Bat") < 3)
		{
			value = 10.0;
		}
		break;
	case Location.get("The Laugh Floor"):
		if (itemAmount(Item.get("imp air")) < 5)
		{
			value = 15.0;
		}
		break;
	case Location.get("Infernal Rackets Backstage"):
		if (itemAmount(Item.get("bus pass")) < 5)
		{
			value = 15.0;
		}
		break;
	case Location.get("Barrrney's Barrr"):
		if (itemAmount(Item.get("cocktail napkin")) === 0)
		{
			value = 10.0;
		}
		break;
	case Location.get("The F'c'le"):
		if (itemAmount(Item.get("ball polish")) === 0 || itemAmount(Item.get("mizzenmast mop")) === 0 || itemAmount(Item.get("rigging shampoo")) === 0) {
			if (!possessEquipment(Item.get("pirate fledges"))) {
				value = 30.0;
			}
		}
		break;
	case Location.get("The Obligatory Pirate's Cove"):
		if (!possessOutfit$1("Swashbuckling Getup") && !possessEquipment(Item.get("pirate fledges"))) {
			value = 10.0;
		}
	case Location.get("The Old Landfill"):
		value = 5.0 * (1.0 + toFloat(getProperty("auto_junkspritesencountered")));
		break;
	case Location.get("The Deep Machine Tunnels"):
		value = 30.0; //Just a guess.

		break;
	case Location.get("Barf Mountain"):
		retval._float = 15.0;
		break;
	case Location.get("The Velvet / Gold Mine"):
		if (!canYellowRay$1())
		{ //Just a guess
			retval._float = 10.0;
		}
		break;
	case Location.get("The Haunted Pantry"):
		break;
	case Location.get("The Skeleton Store"):
		break;
	case Location.get("The Secret Government Laboratory"):
		break;
	case Location.get("Waste Processing"):
		
	// Bugbear Invasion Locations
if (!possessEquipment(Item.get("bugbear communicator badge")))
		{
			retval._float = 20.0;
		}
		break;
	case Location.get("Science Lab"):
		retval._float = 30.0;
		break;
	case Location.get("Engineering"):
		retval._float = 50.0;
		break;
	case Location.get("Fight in the Dirt"):
		
	// End Bugbear Invasion Locations
	// A Shrunken Adventurer Am I (Small) Locations
value = 50.0;
		break;
	case Location.get("Fight in the Tall Grass"):
		value = 50.0;
		break;
	case Location.get("Fight in the Very Tall Grass"):
		value = 50.0;
		break;
	case Location.get("Shadow Rift (The Ancient Buried Pyramid)"):
	case Location.get("Shadow Rift (The Hidden City)"):
	case Location.get("Shadow Rift (The Misspelled Cemetary)"):
		
	// End A Shrunken Adventurer Am I (Small) Locations
	// Shadow Rifts via cursed payphone or AoSOL path
value = 10.0;
		break;
	default:
		
	// End Shadow Rifts
retval._error = true;
		break;
	} }

	if (expectGhostReport() && loc === toLocation(getProperty("ghostLocation")) && getProperty("questPAGhost") === "started")
	{
		value = 0.0;
	}


	if (value !== 0.0)
	{
		retval._boolean = true;
		retval._float = 10000.0 / value;

		if (in_lar())
		{
			retval._float = 5000.0 / value;
		}
		retval._float -= 100.0;
	}
	return retval;
}

export function zone_needItemBooze(loc: Location): generic_t
{
	// these matching a location case in zone_needItem will be called if the general item bonus could not be reached
	let retval: generic_t = new generic_t();
	let value: number = 0.0;
	switch (loc)
	{
	case Location.get("The Haunted Wine Cellar"):
		value = 5.0 * (1.0 + toFloat(getProperty("auto_wineracksencountered")));
		break;
	default:
		retval._error = true;
		break;
	}

	if (expectGhostReport() && loc === toLocation(getProperty("ghostLocation")) && getProperty("questPAGhost") === "started")
	{
		value = 0.0;
	}


	if (value !== 0.0)
	{
		retval._boolean = true;
		retval._float = 10000.0 / value;

		if (in_lar())
		{
			retval._float = 5000.0 / value;
		}
		retval._float -= 100.0;
	}
	return retval;
}

export function zone_needItemFood(loc: Location): generic_t
{
	// these matching a location case in zone_needItem will be called if the general item bonus could not be reached
	let retval: generic_t = new generic_t();
	let value: number = 0.0;
	{ 
		let getMilk: boolean = false;
		let milksPerMilk: number = 0;
		let milkUsed: number = 0;
		switch (loc)
	{
	case Location.get("The Haunted Laundry Room"):
		value = 5.0 * (1.0 + toFloat(getProperty("auto_cabinetsencountered")));
		break;
	case Location.get("Inside the Palindome"):
		if (itemAmount(Item.get("stunt nuts")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0) {
			value = 30.0;
		}
		break;
	case Location.get("Whitey's Grove"):
		if ((itemAmount(Item.get("lion oil")) === 0 || itemAmount(Item.get("bird rib")) === 0) && itemAmount(Item.get("wet stew")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0 && internalQuestStatus("questL11Palindome") < 5)
		{
			value = 25.0;
		}
		break;
	case Location.get("The Goatlet"):		getMilk = (haveSkill(Skill.get("Advanced Saucecrafting")) || myClass() === Class.get("Sauceror") && (guildAvailable() || !toBoolean(getProperty("auto_skipUnlockGuild")))) && fullnessLimit() !== 0;		milksPerMilk = (myClass() === Class.get("Sauceror") ? 3 : 1);		milkUsed = (toBoolean(getProperty("_milkOfMagnesiumUsed")) || fullness_left() === 0 ? 1 : 0);
		if (itemAmount(Item.get("milk of magnesium")) + milksPerMilk * itemAmount(Item.get("glass of goat's milk")) + milkUsed >= 3)
		{
			getMilk = false;
		}
		if (getMilk)
		{
			value = 20.0;
		}
		else {
			value = 40.0;
		}
		break;
	case Location.get("The Dark Neck of the Woods"):
	case Location.get("The Dark Heart of the Woods"):
	case Location.get("The Dark Elbow of the Woods"):
	case Location.get("Pandamonium Slums"):
		if (LX_doingPirates() && itemAmount(Item.get("hot wing")) < 3 && internalQuestStatus("questM12Pirate") <= 2)
		{
			value = 30;
		}
		break;
	case Location.get("The Haunted Pantry"):
		break;
	case Location.get("The Skeleton Store"):
		break;
	default:
		retval._error = true;
		break;
	} }

	if (expectGhostReport() && loc === toLocation(getProperty("ghostLocation")) && getProperty("questPAGhost") === "started")
	{
		value = 0.0;
	}


	if (value !== 0.0)
	{
		retval._boolean = true;
		retval._float = 10000.0 / value;

		if (in_lar())
		{
			retval._float = 5000.0 / value;
		}
		retval._float -= 100.0;
	}
	return retval;
}

export function zone_combatMod(loc: Location): generic_t
{
	// attempting to list these in descending order in relation to the quest they relate to
	// (so L13 quest stuff first then L12 then L11 and so on).
	let retval: generic_t = new generic_t();
	let delay: generic_t = zone_delay(loc);
	let value: number = 0;
	switch (loc)
	{
	case Location.get("The Orcish Frat House"):
	case Location.get("The Hippy Camp"):
		if (myLevel() >= 9) {
			value = -85;
		}
		break;
	case Location.get("Wartime Frat House"):
	case Location.get("Wartime Hippy Camp"):
		value = -80;
		break;
	case Location.get("Sonofa Beach"):
		
		//when wanderer replacing strategy is about to be used, combat modifier is useless. these are the replaced wanderers
if (auto_voteMonster())
		{ for (let sl of Slot.get(["acc3", "acc2", "acc1"]))
			{ if (getProperty(`_auto_maximize_equip_${sl.toString()}`) === Item.get("&quot;I Voted!&quot; sticker").toString())
				{ value = 0;
					break;
				}
			}
		}
		if (auto_sausageGoblin() && getProperty("_auto_maximize_equip_off-hand") === Item.get("Kramco Sausage-o-Matic&trade;").toString())
		{ value = 0;
			break;
		}
		
		//otherwise if no wanderer replace
value = 90;
		break;
	case Location.get("The Upper Chamber"):
		value = -85;
		break;
	case Location.get("The Haunted Billiards Room"):
		value = -85;
		break;
	case Location.get("The Haunted Gallery"):
		if (delay._int === 0 || !containsText(getProperty("relayCounters"), "Garden Banished"))
		{
			value = -80;
		}
		break;
	case Location.get("The Haunted Bathroom"):
		if (delay._int === 0)
		{
			value = -90;
		}
		break;
	case Location.get("The Haunted Ballroom"):
		if (delay._int === 0 && loc.turnsSpent > 0)
		{
			value = -90;
		}
		break;
	case Location.get("The Hidden Park"):
		value = -85;
		break;
	case Location.get("The Hidden Temple"):
		if (haveEffect(Effect.get("Stone-Faced")) === 0) {
			value = -90;
		}
		break;
	case Location.get("A Mob of Zeppelin Protesters"):
		if (internalQuestStatus("questL11Ron") >= 1) {
			value = -70;
		}
		break;
	case Location.get("The Black Forest"):
		if (internalQuestStatus("questL13Final") < 6) {
			value = 5;
		} else if (internalQuestStatus("questL13Final") === 6) {
			value = -95;
		}
		break;
	case Location.get("Inside the Palindome"):
		if ((itemAmount(Item.get("photograph of a red nugget")) === 0 || itemAmount(Item.get("photograph of an ostrich egg")) === 0 || itemAmount(Item.get("photograph of God")) === 0) && internalQuestStatus("questL11Palindome") <= 2)
		{
			value = -70;
		}
		else if (3 <= internalQuestStatus("questL11Palindome") && internalQuestStatus("questL11Palindome") <= 4)
		{
			value = 25;
		}
		break;
	case Location.get("Whitey's Grove"):
		if ((itemAmount(Item.get("lion oil")) === 0 || itemAmount(Item.get("bird rib")) === 0) && itemAmount(Item.get("wet stew")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0 && internalQuestStatus("questL11Palindome") < 5)
		{
			value = 15;
		}
		break;
	case Location.get("The Penultimate Fantasy Airship"):
		if (delay._int === 0 || auto_haveBatWings() && availableAmount(Item.get("S.O.C.K.")) === 0)
		{
			value = -80;
		}
		else if (in_bugbear() && bugbear_BioDataRemaining(Location.get("Engineering")) > 0)
		{
			// When hunting bugbears, we want normal combats, not NC combats
			value = 10;
		}
		else {
			//Let us not worry about throttling the Airship
			//value = 20;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Basement)"):
	case Location.get("The Castle in the Clouds in the Sky (Ground Floor)"):
	case Location.get("The Castle in the Clouds in the Sky (Top Floor)"):
		value = -95;
		break;
	case Location.get("Twin Peak"):
		value = -85;
		break;
	case Location.get("The eXtreme Slope"):
		value = -95;
		break;
	case Location.get("Itznotyerzitz Mine"):
		if (!possessOutfit$1("Mining Gear") && cloversAvailable$1() === 0) {
			value = -90;
		}
		break;
	case Location.get("Lair of the Ninja Snowmen"):
		if (internalQuestStatus("questL08Trapper") < 3 && !L8_forceExtremeInstead() && itemAmount(Item.get("ninja carabiner")) === 0)
		{
			value = 80;
		}
		break;
	case Location.get("The Dark Neck of the Woods"):
	case Location.get("The Dark Heart of the Woods"):
	case Location.get("The Dark Elbow of the Woods"):
		value = -95;
		break;
	case Location.get("The Defiled Cranny"):
	case Location.get("The Defiled Alcove"):
		value = -85;
		break;
	case Location.get("The Typical Tavern Cellar"):
		
		//We could cut it off early if the Rat Faucet is the last one
		//And marginally if we know the 3rd/6th square are forced events.
		//actual desired value for combat or non combat is decided by level_03.ash based on elemental damage bonus
break;
	case Location.get("The Spooky Forest"):
		if (delay._int === 0)
		{
			value = -85;
		}
		break;
	case Location.get("The Laugh Floor"):
		if (itemAmount(Item.get("Azazel's lollipop")) < 1) {
			value = toInt(15.0);
		}
		break;
	case Location.get("Infernal Rackets Backstage"):
		if (itemAmount(Item.get("Azazel's unicorn")) < 1) {
			value = -70;
		}
		break;
	case Location.get("Barrrney's Barrr"):
		if (numPirateInsults() >= 6) {
			value = -80;
		} else {
			value = 20;
		}
		break;
	case Location.get("The F'c'le"):
		if (!possessEquipment(Item.get("pirate fledges")))
		{
			value = 20;
		}
		break;
	case Location.get("The Poop Deck"):
		value = -80;
		break;
	case Location.get("The Obligatory Pirate's Cove"):
		if (!possessOutfit$1("Swashbuckling Getup")) {
			if (itemAmount(Item.get("The Big Book of Pirate Insults")) > 0 && numPirateInsults() < 3) {
				value = 0; // fights can give both outfit pieces and insults. better not start avoiding fights until first insults learned
			} else {
				value = -60;
			}
		} else if (numPirateInsults() < 8) {
			value = 40;
		}
		break;
	case Location.get("The Knob Shaft"):
		value = 15;
		break;
	case Location.get("South of the Border"):
		value = 50;
		break;
	case Location.get("The Icy Peak"):
		value = 15;
		break;
	case Location.get("Pandamonium Slums"):
		value = 5;
		break;
	case Location.get("The Haunted Pantry"):
		value = 20;
		break;
	case Location.get("Cobb's Knob Treasury"):
		value = 15;
		break;
	case Location.get("The VERY Unquiet Garves"):
		if (itemAmount(Item.get("Wand of Nagamar")) === 0 && internalQuestStatus("questL13Final") === 12 && !in_koe()) {
			value = -100;
		}
		break;
	case Location.get("Super Villain's Lair"):
		if (!toBoolean(getProperty("_villainLairColorChoiceUsed")) || !toBoolean(getProperty("_villainLairDoorChoiceUsed")) || !toBoolean(getProperty("_villainLairSymbologyChoiceUsed")))
		{
			value = -70;
		}
		break;
	case Location.get("Through the Spacegate"):
		value = 5;
		break;
	case Location.get("The Ice Hotel"):
		value = -85;
		break;
	case Location.get("Sonar"):
		
	// Bugbear Invasion Locations
value = -70;
		break;
	case Location.get("Morgue"):
		if (itemAmount(Item.get("bugbear autopsy tweezers")) > 0)
		{
			value = -70;
		}
		break;
	default:
		
	// End Bugbear Invasion Locations
retval._error = true;
		break;
	}

	if (in_lar())
	{
		value = 0;
	}

	if (expectGhostReport() && loc === toLocation(getProperty("ghostLocation")) && getProperty("questPAGhost") === "started")
	{
		value = 0;
	}


	if (value !== 0)
	{
		retval._boolean = true;
		retval._int = value;
	}
	return retval;
}

export function zone_delay(loc: Location): generic_t
{
	let retval: generic_t = new generic_t();
	let value: number = 0;
	let shenZones: Map<Location, number> = getShenZonesTurnsSpent();
	switch (loc)
	{
	case Location.get("The Oasis"):
		
		// Superlikely adventures take priority over all wanderers now.
if (toInt(getProperty("desertExploration")) < 100 && haveEffect(Effect.get("Ultrahydrated")) > 0)
		{
			value = 5 - loc.turnsSpent;
		}
		break;
	case Location.get("The Upper Chamber"):
		value = 5 - loc.turnsSpent;
		break;
	case Location.get("The Middle Chamber"):
		value = 10 - loc.turnsSpent;
		break;
	case Location.get("The Haunted Gallery"):
		value = 5 - loc.turnsSpent;
		break;
	case Location.get("The Haunted Bathroom"):
		value = 5 - loc.turnsSpent;
		break;
	case Location.get("The Haunted Ballroom"):
		value = 5 - loc.turnsSpent;
		break;
	case Location.get("The Hidden Park"):
		if (!possessEquipment(Item.get("antique machete")) && !possessEquipment(Item.get("muculent machete")) && inHardcore())
		{
			value = 6 - loc.turnsSpent;
		}
		break;
	case Location.get("The Hidden Apartment Building"):
		if (internalQuestStatus("questL11Curses") < 2) {
			if (loc.turnsSpent < 9) {
				value = 8 - loc.turnsSpent;
			} else {
				value = 7 - (loc.turnsSpent - 9) % 8;
			}
		}
		break;
	case Location.get("The Hidden Office Building"):
		if (internalQuestStatus("questL11Business") < 2) {
			if (loc.turnsSpent < 6) {
				value = 5 - loc.turnsSpent;
			} else {
				value = 4 - (loc.turnsSpent - 6) % 5;
			}
		}
		break;
	case Location.get("The Spooky Forest"):
		value = 5 - loc.turnsSpent;
		break;
	case Location.get("The Boss Bat's Lair"):
		value = 4 - loc.turnsSpent;
		break;
	case Location.get("The Outskirts of Cobb's Knob"):
		if (internalQuestStatus("questL05Goblin") < 1)
		{
			value = 10 - loc.turnsSpent;
		}
		else {
			retval._error = true;
		}
		break;
	case Location.get("The Penultimate Fantasy Airship"):
		if (getProperty("questL10Garbage") === "step2")
		{
			value = 5 - loc.turnsSpent;
		}
		else if (getProperty("questL10Garbage") === "step3")
		{
			value = 10 - loc.turnsSpent;
		}
		else if (getProperty("questL10Garbage") === "step4")
		{
			value = 15 - loc.turnsSpent;
		}
		else if (getProperty("questL10Garbage") === "step5")
		{
			value = 20 - loc.turnsSpent;
		}
		else if (getProperty("questL10Garbage") === "step6")
		{
			value = 25 - loc.turnsSpent;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Ground Floor)"):
		value = 10 - loc.turnsSpent;
		break;
	case Location.get("The Haunted Pantry"):
		if (isGuildClass() && myPrimestat() === Stat.get("Mysticality") && !toBoolean(getProperty("auto_skipUnlockGuild")))
		{
			value = 5 - loc.turnsSpent;
		}
		break;
	case Location.get("The Sleazy Back Alley"):
		if (isGuildClass() && myPrimestat() === Stat.get("Moxie") && !toBoolean(getProperty("auto_skipUnlockGuild")))
		{
			value = 5 - loc.turnsSpent;
		}
		break;
	case Location.get("The Smut Orc Logging Camp"):
		if (shenZones.has(loc) && toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal())
		{
			value = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
		}
		break;
	case Location.get("The Hole in the Sky"):
		if (shenZones.has(loc) && !needStarKey())
		{
			value = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
		}
		break;
	case Location.get("The Unquiet Garves"):
	case Location.get("The Castle in the Clouds in the Sky (Top Floor)"):
	case Location.get("Lair of the Ninja Snowmen"):
	case Location.get("The Batrat and Ratbat Burrow"):
		if (shenZones.has(loc))
		{
			value = 3 - (loc.turnsSpent - (shenZones.get(loc) ?? shenZones.set(loc, 0).get(loc)));
		}
		break;
	case Location.get("The Copperhead Club"):
		if (internalQuestStatus("questL11Shen") > 0 && internalQuestStatus("questL11Shen") < 8)
		{
			value = 5 - (loc.turnsSpent - toInt(getProperty("auto_lastShenTurn")));
		}
		break;
	case Location.get("The Hallowed Halls"):
	case Location.get("Art Class"):
	case Location.get("Chemistry Class"):
	case Location.get("Shop Class"):
		if (kolhs_mandatorySchool())
		{ //KOLHS path specific delay locations
			value = 40 - toInt(getProperty("_kolhsAdventures")); //shared counter of 40 adv between all 4 zones
		}
		break;
	case Location.get("Vanya's Castle"):
		if (need8BitPoints() && possessEquipment(Item.get("continuum transfunctioner")) && (getProperty("8BitColor") === "black" || getProperty("8BitColor") === ""))
		{
			value = 5 - toInt(getProperty("8BitBonusTurns"));
		}
		break;
	case Location.get("The Fungus Plains"):
		if (need8BitPoints() && possessEquipment(Item.get("continuum transfunctioner")) && getProperty("8BitColor") === "red")
		{
			value = 5 - toInt(getProperty("8BitBonusTurns"));
		}
		break;
	case Location.get("Megalo-City"):
		if (need8BitPoints() && possessEquipment(Item.get("continuum transfunctioner")) && getProperty("8BitColor") === "blue")
		{
			value = 5 - toInt(getProperty("8BitBonusTurns"));
		}
		break;
	case Location.get("Hero's Field"):
		if (need8BitPoints() && possessEquipment(Item.get("continuum transfunctioner")) && getProperty("8BitColor") === "green")
		{
			value = 5 - toInt(getProperty("8BitBonusTurns"));
		}
		break;
	default:
		retval._error = true;
		break;
	}

	if (value > 0)
	{
		retval._boolean = true;
		retval._int = value;
	}
	return retval;
}

export function zone_available(loc: Location): boolean
{
	let retval: boolean = false;

	if (kolhs_mandatorySchool())
	{ //kolhs path specifically blocks non school zones until school is done.
		if (Location.get(["The Hallowed Halls", "Art Class", "Chemistry Class", "Shop Class"]).includes(loc))
		{
			retval = true;
		}
		return retval;
	}

	switch (loc)
	{
	case Location.get("The Copperhead Club"):
	case Location.get("A Mob of Zeppelin Protesters"):
		if (internalQuestStatus("questL11Shen") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Red Zeppelin"):
		if (internalQuestStatus("questL11Ron") >= 2)
		{
			retval = true;
		}
		break;
	case Location.get("Super Villain's Lair"):
		if (in_lta() && toInt(getProperty("_villainLairProgress")) < 999 && getProperty("_auto_bondBriefing") === "started")
		{
			retval = true;
		}
		break;
	case Location.get("South of the Border"):
	case Location.get("The Shore, Inc. Travel Agency"):
		if (isDesertAvailable())
		{
			retval = true;
		}
		break;
	case Location.get("The Arid, Extra-Dry Desert"):
		if (internalQuestStatus("questL11Desert") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Oasis"):
		if ((Location.get("The Arid, Extra-Dry Desert")).turnsSpent > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Upper Chamber"):
		if (internalQuestStatus("questL11Pyramid") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Middle Chamber"):
		retval = toBoolean(getProperty("middleChamberUnlock"));
		break;
	case Location.get("The Lower Chambers"):
		retval = toBoolean(getProperty("lowerChamberUnlock"));
		break;
	case Location.get("The Daily Dungeon"):
		retval = !toBoolean(getProperty("dailyDungeonDone"));
		break;
	case Location.get("The Overgrown Lot"):
		if (internalQuestStatus("questM24Doc") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Skeleton Store"):
		if (internalQuestStatus("questM23Meatsmith") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Madness Bakery"): //can also be unlocked via hypnotic breadcrumbs. which matter in koe and nuclear autumn. but currently not tracked
		if (internalQuestStatus("questM25Armorer") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Deep Machine Tunnels"):
		if (haveFamiliar(Familiar.get("Machine Elf")) || haveEffect(Effect.get("Inside The Snowglobe")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Pantry"):
	case Location.get("The Haunted Kitchen"):
	case Location.get("The Haunted Conservatory"):
		if (internalQuestStatus("questM20Necklace") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Gallery"):
	case Location.get("The Haunted Bathroom"):
	case Location.get("The Haunted Bedroom"):
		if (internalQuestStatus("questM21Dance") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Billiards Room"):
		if (itemAmount(Item.get("Spookyraven billiards room key")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Library"):
		if (itemAmount(Item.get("[7302]Spookyraven library key")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Ballroom"):
		if (internalQuestStatus("questM21Dance") >= 3)
		{
			retval = true;
		}
		break;
	case Location.get("The Haunted Boiler Room"):
	case Location.get("The Haunted Laundry Room"):
	case Location.get("The Haunted Wine Cellar"):
		if (internalQuestStatus("questL11Manor") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("Summoning Chamber"):
		if (internalQuestStatus("questL11Manor") >= 11)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Park"):
	case Location.get("An Overgrown Shrine (Northwest)"):
	case Location.get("An Overgrown Shrine (Southwest)"):
	case Location.get("An Overgrown Shrine (Northeast)"):
	case Location.get("An Overgrown Shrine (Southeast)"):
	case Location.get("A Massive Ziggurat"):
		if (internalQuestStatus("questL11Worship") >= 3)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Apartment Building"):
		if (internalQuestStatus("questL11Curses") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Hospital"):
		if (internalQuestStatus("questL11Doctor") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Office Building"):
		if (internalQuestStatus("questL11Business") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Bowling Alley"):
		if (internalQuestStatus("questL11Spare") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Typical Tavern Cellar"):
		if (internalQuestStatus("questL03Rat") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Spooky Forest"):
		if (internalQuestStatus("questL02Larva") >= 0 || internalQuestStatus("questG02Whitecastle") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Hidden Temple"):
		if (toInt(getProperty("lastTempleUnlock")) === myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("Vanya's Castle"):
	case Location.get("The Fungus Plains"):
	case Location.get("Megalo-City"):
	case Location.get("Hero's Field"):
		if (possessEquipment(Item.get("continuum transfunctioner")) && (internalQuestStatus("questL02Larva") >= 0 || internalQuestStatus("questG02Whitecastle") >= 0))
		{
			retval = true;
		}
		break;
	case Location.get("The Black Forest"):
		if (internalQuestStatus("questL11MacGuffin") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Bat Hole Entrance"):
		if (internalQuestStatus("questL04Bat") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Guano Junction"):
		if (elemental_resist(Element.get("stench")) >= 1 && internalQuestStatus("questL04Bat") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Batrat and Ratbat Burrow"):
		if (internalQuestStatus("questL04Bat") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Beanbat Chamber"):
		if (internalQuestStatus("questL04Bat") >= 2)
		{
			retval = true;
		}
		break;
	case Location.get("The Boss Bat's Lair"):
		if (internalQuestStatus("questL04Bat") === 3)
		{
			retval = true;
		}
		break;
	case Location.get("The VERY Unquiet Garves"):
		if (getProperty("questL07Cyrptic") === "finished")
		{
			retval = true;
		}
		break;
	case Location.get("Whitey's Grove"):
		if (internalQuestStatus("questG02Whitecastle") >= 0 || internalQuestStatus("questL11Palindome") >= 3)
		{
			retval = true;
		}
		break;
	case Location.get("Inside the Palindome"):
		if (possessEquipment(Item.get("Talisman o' Namsilat")))
		{
			retval = true;
		}
		break;
	case Location.get("Noob Cave"):
	case Location.get("The Outskirts of Cobb's Knob"):
		retval = true;
		break;
	case Location.get("Cobb's Knob Barracks"):
	case Location.get("Cobb's Knob Kitchens"):
	case Location.get("Cobb's Knob Harem"):
	case Location.get("Cobb's Knob Treasury"):
	case Location.get("Throne Room"):
		if (internalQuestStatus("questL05Goblin") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Dark Neck of the Woods"):
	case Location.get("The Dark Heart of the Woods"):
	case Location.get("The Dark Elbow of the Woods"):
		if (internalQuestStatus("questL06Friar") >= 0 && getProperty("questL06Friar") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("The Defiled Nook"):
	case Location.get("The Defiled Cranny"):
	case Location.get("The Defiled Alcove"):
	case Location.get("The Defiled Niche"):
		if (internalQuestStatus("questL07Cyrptic") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Pandamonium Slums"):
	case Location.get("The Laugh Floor"):
	case Location.get("Infernal Rackets Backstage"):
		if (internalQuestStatus("questL06Friar") >= 10)
		{
			retval = true;
		}
		break;
	case Location.get("The Obligatory Pirate's Cove"):
		if (toInt(getProperty("lastIslandUnlock")) === myAscensions())
		{
			if (getProperty("questL12War") === "unstarted" || getProperty("questL12War") === "finished")
			{
				retval = true;
			}
		}
		break;
	case Location.get("Barrrney's Barrr"):
		if ((haveOutfit("swashbuckling getup") || possessEquipment(Item.get("pirate fledges"))) && toInt(getProperty("lastIslandUnlock")) === myAscensions())
		{
			if (getProperty("questL12War") === "unstarted" || getProperty("questL12War") === "finished")
			{
				retval = true;
			}
		}
		break;
	case Location.get("The F'c'le"):
		if ((haveOutfit("swashbuckling getup") || possessEquipment(Item.get("pirate fledges"))) && toInt(getProperty("lastIslandUnlock")) === myAscensions() && internalQuestStatus("questM12Pirate") >= 5)
		{
			if (getProperty("questL12War") === "unstarted" || getProperty("questL12War") === "finished")
			{
				retval = true;
			}
		}
		break;
	case Location.get("The Poop Deck"):
		if ((haveOutfit("swashbuckling getup") || possessEquipment(Item.get("pirate fledges"))) && toInt(getProperty("lastIslandUnlock")) === myAscensions() && internalQuestStatus("questM12Pirate") >= 6)
		{
			if (getProperty("questL12War") === "unstarted" || getProperty("questL12War") === "finished")
			{
				retval = true;
			}
		}
		break;
	case Location.get("Belowdecks"):
		if ((haveOutfit("swashbuckling getup") || possessEquipment(Item.get("pirate fledges"))) && toInt(getProperty("lastIslandUnlock")) === myAscensions() && getProperty("questM12Pirate") === "finished")
		{
			if (getProperty("questL12War") === "unstarted" || getProperty("questL12War") === "finished")
			{
				retval = true;
			}
		}
		break;
	case Location.get("The Smut Orc Logging Camp"):
		if (internalQuestStatus("questL09Topping") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("A-Boo Peak"):
	case Location.get("Twin Peak"):
	case Location.get("Oil Peak"):
		if (internalQuestStatus("questL09Topping") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Orcish Frat House"):
	case Location.get("The Hippy Camp"):
		if (toInt(getProperty("lastIslandUnlock")) === myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("The Orcish Frat House (In Disguise)"):
		if (toInt(getProperty("lastIslandUnlock")) === myAscensions() && haveOutfit("Frat Boy Ensemble") && internalQuestStatus("questL12War") !== 0 && internalQuestStatus(
		//mafia always calls location Wartime with L12 quest
		"questL12War") !== 1)
		{ //mafia always calls location Wartime with L12 quest
			retval = true;
		}
		break;
	case Location.get("The Hippy Camp (In Disguise)"):
		if (toInt(getProperty("lastIslandUnlock")) === myAscensions() && haveOutfit("Filthy Hippy Disguise") && internalQuestStatus("questL12War") !== 0 && internalQuestStatus(
		//mafia always calls location Wartime with L12 quest
		"questL12War") !== 1)
		{ //mafia always calls location Wartime with L12 quest
			retval = true;
		}
		break;
	case Location.get("Wartime Hippy Camp (Frat Disguise)"):
		if (internalQuestStatus("questL12War") === 0 && (haveOutfit("frat warrior fatigues") || haveOutfit("frat boy ensemble")))
		{
			retval = true;
		}
		break;
	case Location.get("The Battlefield (Frat Uniform)"):
		if (internalQuestStatus("questL12War") >= 1 && toInt(getProperty("hippiesDefeated")) < 1000 && haveOutfit("frat warrior fatigues") && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("Wartime Frat House (Hippy Disguise)"):
		if (internalQuestStatus("questL12War") === 0 && (haveOutfit("war hippy fatigues") || haveOutfit("filthy hippy disguise")))
		{
			retval = true;
		}
		break;
	case Location.get("The Battlefield (Hippy Uniform)"):
		if (internalQuestStatus("questL12War") >= 1 && toInt(getProperty("fratboysDefeated")) < 1000 && haveOutfit("war hippy fatigues") && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("Next to that Barrel with Something Burning in it"):
	case Location.get("Near an Abandoned Refrigerator"):
	case Location.get("Over Where the Old Tires Are"):
	case Location.get("Out by that Rusted-Out Car"):
		if (internalQuestStatus("questL12War") >= 1 && (getProperty("sidequestJunkyardCompleted") === "none" || toInt(getProperty("flyeredML")) < 10000) && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("Sonofa Beach"):
		if (internalQuestStatus("questL12War") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Themthar Hills"):
		if (internalQuestStatus("questL12War") >= 1 && getProperty("sidequestNunsCompleted") === "none" && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("The Hatching Chamber"):
		if (internalQuestStatus("questL12War") >= 1 && getProperty("sidequestOrchardCompleted") === "none" && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("The Feeding Chamber"):
		if (internalQuestStatus("questL12War") >= 1 && getProperty("sidequestOrchardCompleted") === "none" && haveEffect(Effect.get("Filthworm Larva Stench")) > 0 && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("The Royal Guard Chamber"):
		if (internalQuestStatus("questL12War") >= 1 && getProperty("sidequestOrchardCompleted") === "none" && haveEffect(Effect.get("Filthworm Drone Stench")) > 0 && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("The Filthworm Queen's Chamber"):
		if (internalQuestStatus("questL12War") >= 1 && getProperty("sidequestOrchardCompleted") === "none" && itemAmount(Item.get("heart of the filthworm queen")) === 0 && haveEffect(Effect.get("Filthworm Guard Stench")) > 0 && getProperty("questL12War") !== "finished")
		{
			retval = true;
		}
		break;
	case Location.get("Itznotyerzitz Mine"):
	case Location.get("The Goatlet"):
		if (internalQuestStatus("questL08Trapper") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The eXtreme Slope"):
	case Location.get("Lair of the Ninja Snowmen"):
		if (internalQuestStatus("questL08Trapper") >= 2)
		{
			retval = true;
		}
		break;
	case Location.get("Mist-Shrouded Peak"):
		if (internalQuestStatus("questL08Trapper") >= 3)
		{
			retval = true;
		}
		break;
	case Location.get("The Icy Peak"):
		if (internalQuestStatus("questL08Trapper") >= 6)
		{
			retval = true;
		}
		break;
	case Location.get("The Penultimate Fantasy Airship"):
		if (internalQuestStatus("questL10Garbage") >= 1)
		{
			retval = true;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Basement)"):
		if (itemAmount(Item.get("S.O.C.K.")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Ground Floor)"):
		if (toInt(getProperty("lastCastleGroundUnlock")) === myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("The Castle in the Clouds in the Sky (Top Floor)"):
		if (toInt(getProperty("lastCastleTopUnlock")) === myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("The Hole in the Sky"):
		if (itemAmount(Item.get("steam-powered model rocketship")) > 0 || in_koe())
		{
			retval = true;
		}
		break;
	case Location.get("The Tunnel of L.O.V.E."):
		if (toBoolean(getProperty("loveTunnelAvailable")) && !toBoolean(getProperty("_loveTunnelUsed")))
		{
			retval = true;
		}
		break;
	case Location.get("Fastest Adventurer Contest"):
		if (toInt(getProperty("nsContestants1")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Enormous Greater-Than Sign"):
		if (toInt(getProperty("lastPlusSignUnlock")) < myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("The Dungeons of Doom"):
		if (toInt(getProperty("lastPlusSignUnlock")) === myAscensions())
		{
			retval = true;
		}
		break;
	case Location.get("The Limerick Dungeon"):
	case Location.get("The Sleazy Back Alley"):
	case Location.get("The Haiku Dungeon"):
		retval = true;
		break;
	case Location.get("Smartest Adventurer Contest"):
	case Location.get("Strongest Adventurer Contest"):
	case Location.get("Smoothest Adventurer Contest"):
		if (toInt(getProperty("nsContestants2")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("Coldest Adventurer Contest"):
	case Location.get("Hottest Adventurer Contest"):
	case Location.get("Sleaziest Adventurer Contest"):
	case Location.get("Spookiest Adventurer Contest"):
	case Location.get("Stinkiest Adventurer Contest"):
		if (toInt(getProperty("nsContestants3")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("Tower Level 1"):
		if (getProperty("questL13Final") === "step6")
		{
			retval = true;
		}
		break;
	case Location.get("Tower Level 2"):
		if (getProperty("questL13Final") === "step7")
		{
			retval = true;
		}
		break;
	case Location.get("Tower Level 3"):
		if (getProperty("questL13Final") === "step8")
		{
			retval = true;
		}
		break;
	case Location.get("Tower Level 4"):
		if (getProperty("questL13Final") === "step9")
		{
			retval = true;
		}
		break;
	case Location.get("Tower Level 5"):
		if (getProperty("questL13Final") === "step10")
		{
			retval = true;
		}
		break;
	case Location.get("The Naughty Sorceress' Chamber"):
		if (getProperty("questL13Final") === "step11")
		{
			retval = true;
		}
		break;
	case Location.get("Barf Mountain"):
	case Location.get("Pirates of the Garbage Barges"):
	case Location.get("Uncle Gator's Country Fun-Time Liquid Waste Sluice"):
	case Location.get("The Toxic Teacups"):
		retval = toBoolean(getProperty("stenchAirportAlways")) || toBoolean(getProperty("_stenchAirportToday"));
		break;
	case Location.get("The Fun-Guy Mansion"):
	case Location.get("The Sunken Party Yacht"):
	case Location.get("Sloppy Seconds Diner"):
		retval = toBoolean(getProperty("sleazeAirportAlways")) || toBoolean(getProperty("_sleazeAirportToday"));
		break;
	case Location.get("The Secret Government Laboratory"):
	case Location.get("The Deep Dark Jungle"):
	case Location.get("The Mansion of Dr. Weirdeaux"):
		retval = toBoolean(getProperty("spookyAirportAlways")) || toBoolean(getProperty("_spookyAirportToday"));
		break;
	case Location.get("The Ice Hotel"):
	case Location.get("VYKEA"):
	case Location.get("The Ice Hole"):
		retval = toBoolean(getProperty("coldAirportAlways")) || toBoolean(getProperty("_coldAirportToday"));
		break;
	case Location.get("The SMOOCH Army HQ"):
	case Location.get("LavaCo&trade; Lamp Factory"):
	case Location.get("The Velvet / Gold Mine"):
	case Location.get("The Bubblin' Caldera"):
		retval = toBoolean(getProperty("hotAirportAlways")) || toBoolean(getProperty("_hotAirportToday"));
		break;
	case Location.get("The X-32-F Combat Training Snowman"):
		retval = toBoolean(getProperty("snojoAvailable"));
		break;
	case Location.get("Through the Spacegate"):
		retval = toBoolean(getProperty("spacegateAlways")) || toBoolean(getProperty("_spacegateToday"));
		break;
	case Location.get("The Old Landfill"):
		if (internalQuestStatus("questM19Hippy") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Cobb's Knob Laboratory"):
	case Location.get("The Knob Shaft"):
		if (itemAmount(Item.get("Cobb's Knob lab key")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("Cobb's Knob Menagerie, Level 1"):
	case Location.get("Cobb's Knob Menagerie, Level 2"):
	case Location.get("Cobb's Knob Menagerie, Level 3"):
		if (itemAmount(Item.get("Cobb's Knob Menagerie key")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Red Queen's Garden"):
		if (haveEffect(Effect.get("Down the Rabbit Hole")) > 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Bugbear Pen"):
		if (internalQuestStatus("questM03Bugbear") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("The Spooky Gravy Burrow"):
		
		//May need to be corrected
if (internalQuestStatus("questM03Bugbear") >= 99)
		{
			retval = true;
		}
		break;
	case Location.get("Investigating a Plaintive Telegram"):
		if (itemAmount(Item.get("plaintive telegram")) > 0 && internalQuestStatus("questLTTQuestByWire") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Drunken Stupor"):
		if (inebriety_left() < 0)
		{
			retval = true;
		}
		break;
	case Location.get("Thugnderdome"):
		if (isDesertAvailable())
		{
			retval = gnomadsAvailable();
		}
		break;
	case Location.get("Camp Logging Camp"):
		
	// We go here to get the Logging Hatchet
if (!in_koe() && canadiaAvailable())
		{
			retval = true;
		}
		break;
	case Location.get("The Thinknerd Warehouse"):
		if (internalQuestStatus("questM22Shirt") >= 0)
		{
			retval = true;
		}
		break;
	case Location.get("Gingerbread Upscale Retail District"):
		if (toBoolean(getProperty("gingerRetailUnlocked")))
		{
			retval = toBoolean(getProperty("gingerbreadCityAvailable")) || toBoolean(getProperty("_gingerbreadCityToday"));
		}
		break;
	case Location.get("Gingerbread Sewers"):
		if (toBoolean(getProperty("gingerSewersUnlocked")))
		{
			retval = toBoolean(getProperty("gingerbreadCityAvailable")) || toBoolean(getProperty("_gingerbreadCityToday"));
		}
		break;
	case Location.get("Gingerbread Civic Center"):
	case Location.get("Gingerbread Industrial Zone"):
	case Location.get("Gingerbread Train Station"):
		retval = toBoolean(getProperty("gingerbreadCityAvailable")) || toBoolean(getProperty("_gingerbreadCityToday"));
		break;
	case Location.get("The Bandit Crossroads"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("The Towering Mountains"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("The Mystic Wood"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("The Putrid Swamp"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("The Cursed Village"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("The Sprawling Cemetery"):
		retval = containsText(getProperty("_frAreasUnlocked"), loc.toString());
		break;
	case Location.get("Monorail Work Site"):
		retval = false;
		break;
	case Location.get("Your Mushroom Garden"):
		retval = auto_canFightPiranhaPlant() || auto_canTendMushroomGarden();
		break;
	}
	// compare our result with Mafia's native function, log a warning if theres a difference. Ideally we can see if there are any differences between our code and Mafia's, and if not remove all of ours in favor of Mafia's
	let canAdvRetval: boolean = canAdventure(loc);
	if (canAdvRetval !== retval) {
		auto_log_debug$1(`Uh oh, autoscend and mafia's can_adventure() dont agree on whether we can adventure at ${loc} (autoscend: ${retval}, can_adventure(): ${canAdvRetval}). Will assume location available if either is true.`);
		retval = retval || canAdvRetval;
	}

	return retval;
}

export function zone_difficulty(loc: Location): generic_t
{
	let retval: generic_t = new generic_t();
	//Should we handle when we are expecting a wanderer?

	retval._int = 0;
	retval._monster = Monster.none;

	let mobs: Map<Monster, boolean> = new Map(Object.entries(getLocationMonsters(loc)).map(([_k, _v]) => [Monster.get(_k), _v]));
	if (mobs.size > 0)
	{
		for (let mon of mobs.keys())
		{
			retval._int = mon.baseDefense;
			retval._monster = mon;
			break;
		}
	}

	switch (loc)
	{
	case Location.get("The Shore, Inc. Travel Agency"):
		retval._int = 0;
		break;
	case Location.get("Super Villain's Lair"):
		break;
	case Location.get("South of the Border"):
		break;
	case Location.get("The Arid, Extra-Dry Desert"):
		break;
	case Location.get("The Oasis"):
		if (haveEffect(Effect.get("Ultrahydrated")) === 0)
		{
			retval._int = 0;
		}
		break;
	case Location.get("The Upper Chamber"):
		break;
	case Location.get("The Middle Chamber"):
		break;
	case Location.get("The Lower Chambers"):
		break;
	case Location.get("The Daily Dungeon"):
		break;
	case Location.get("The Overgrown Lot"):
		break;
	case Location.get("The Skeleton Store"):
		break;
	case Location.get("Madness Bakery"):
		break;
	case Location.get("The Deep Machine Tunnels"):
		break;
	case Location.get("The Haunted Pantry"):
		break;
	case Location.get("The Haunted Kitchen"):
		break;
	case Location.get("The Haunted Conservatory"):
		break;
	case Location.get("The Haunted Gallery"):
	case Location.get("The Haunted Bathroom"):
	case Location.get("The Haunted Bedroom"):
		break;
	case Location.get("The Haunted Billiards Room"):
		break;
	case Location.get("The Haunted Library"):
		break;
	case Location.get("The Haunted Ballroom"):
		break;
	case Location.get("The Haunted Boiler Room"):
	case Location.get("The Haunted Laundry Room"):
	case Location.get("The Haunted Wine Cellar"):
		break;
	case Location.get("Summoning Chamber"):
		break;
	case Location.get("The Hidden Park"):
		break;
	case Location.get("An Overgrown Shrine (Northwest)"):
	case Location.get("An Overgrown Shrine (Southwest)"):
	case Location.get("An Overgrown Shrine (Northeast)"):
	case Location.get("An Overgrown Shrine (Southeast)"):
		if (Item.get(["antique machete", "muculent machete"]).includes(equippedItem(Slot.get("weapon"))))
		{
			retval._int = 0;
		}
		break;
	case Location.get("A Massive Ziggurat"):
		break;
	case Location.get("The Hidden Apartment Building"):
		break;
	case Location.get("The Hidden Hospital"):
		break;
	case Location.get("The Hidden Office Building"):
		break;
	case Location.get("The Hidden Bowling Alley"):
		break;
	case Location.get("The Typical Tavern Cellar"):
		break;
	case Location.get("The Spooky Forest"):
		break;
	case Location.get("The Hidden Temple"):
		break;
	case Location.get("The Black Forest"):
		break;
	case Location.get("The Bat Hole Entrance"):
		break;
	case Location.get("Guano Junction"):
		break;
	case Location.get("The Batrat and Ratbat Burrow"):
		break;
	case Location.get("The Beanbat Chamber"):
		break;
	case Location.get("The Boss Bat's Lair"):
		break;
	case Location.get("The VERY Unquiet Garves"):
		break;
	case Location.get("Whitey's Grove"):
		break;
	case Location.get("Inside the Palindome"):
		break;
	case Location.get("Noob Cave"):
	case Location.get("The Outskirts of Cobb's Knob"):
		retval._boolean = true;
		break;
	case Location.get("Cobb's Knob Barracks"):
	case Location.get("Cobb's Knob Kitchens"):
	case Location.get("Cobb's Knob Harem"):
	case Location.get("Cobb's Knob Treasury"):
	case Location.get("Throne Room"):
		break;
	case Location.get("The Dark Neck of the Woods"):
	case Location.get("The Dark Heart of the Woods"):
	case Location.get("The Dark Elbow of the Woods"):
		break;
	case Location.get("The Defiled Nook"):
	case Location.get("The Defiled Cranny"):
	case Location.get("The Defiled Alcove"):
	case Location.get("The Defiled Niche"):
		break;
	case Location.get("Pandamonium Slums"):
	case Location.get("The Laugh Floor"):
	case Location.get("Infernal Rackets Backstage"):
		break;
	case Location.get("The Obligatory Pirate's Cove"):
		break;
	case Location.get("Barrrney's Barrr"):
		break;
	case Location.get("The F'c'le"):
		break;
	case Location.get("The Poop Deck"):
		break;
	case Location.get("Belowdecks"):
		break;
	case Location.get("The Smut Orc Logging Camp"):
		break;
	case Location.get("A-Boo Peak"):
	case Location.get("Twin Peak"):
	case Location.get("Oil Peak"):
		break;
	case Location.get("Wartime Hippy Camp (Frat Disguise)"):
		break;
	case Location.get("The Battlefield (Frat Uniform)"):
		break;
	case Location.get("Next to that Barrel with Something Burning in it"):
	case Location.get("Near an Abandoned Refrigerator"):
	case Location.get("Over Where the Old Tires Are"):
	case Location.get("Out by that Rusted-Out Car"):
		break;
	case Location.get("Sonofa Beach"):
		break;
	case Location.get("The Themthar Hills"):
		break;
	case Location.get("The Hatching Chamber"):
		break;
	case Location.get("The Feeding Chamber"):
		break;
	case Location.get("The Royal Guard Chamber"):
		break;
	case Location.get("The Filthworm Queen's Chamber"):
		break;
	case Location.get("Itznotyerzitz Mine"):
	case Location.get("The Goatlet"):
		break;
	case Location.get("The eXtreme Slope"):
	case Location.get("Lair of the Ninja Snowmen"):
		break;
	case Location.get("Mist-Shrouded Peak"):
		break;
	case Location.get("The Icy Peak"):
		break;
	case Location.get("The Penultimate Fantasy Airship"):
		break;
	case Location.get("The Castle in the Clouds in the Sky (Basement)"):
		break;
	case Location.get("The Castle in the Clouds in the Sky (Ground Floor)"):
		break;
	case Location.get("The Castle in the Clouds in the Sky (Top Floor)"):
		break;
	case Location.get("The Hole in the Sky"):
		break;
	case Location.get("Fastest Adventurer Contest"):
		break;
	case Location.get("The Enormous Greater-Than Sign"):
		break;
	case Location.get("The Dungeons of Doom"):
		break;
	case Location.get("The Limerick Dungeon"):
	case Location.get("The Sleazy Back Alley"):
	case Location.get("The Haiku Dungeon"):
		break;
	case Location.get("Smartest Adventurer Contest"):
	case Location.get("Strongest Adventurer Contest"):
	case Location.get("Smoothest Adventurer Contest"):
		break;
	case Location.get("Coldest Adventurer Contest"):
	case Location.get("Hottest Adventurer Contest"):
	case Location.get("Sleaziest Adventurer Contest"):
	case Location.get("Spookiest Adventurer Contest"):
	case Location.get("Stinkiest Adventurer Contest"):
		break;
	case Location.get("Barf Mountain"):
	case Location.get("Pirates of the Garbage Barges"):
	case Location.get("Uncle Gator's Country Fun-Time Liquid Waste Sluice"):
	case Location.get("The Toxic Teacups"):
		break;
	case Location.get("The Fun-Guy Mansion"):
	case Location.get("The Sunken Party Yacht"):
	case Location.get("Sloppy Seconds Diner"):
		break;
	case Location.get("The Secret Government Laboratory"):
	case Location.get("The Deep Dark Jungle"):
	case Location.get("The Mansion of Dr. Weirdeaux"):
		break;
	case Location.get("The Ice Hotel"):
	case Location.get("VYKEA"):
	case Location.get("The Ice Hole"):
		break;
	case Location.get("The SMOOCH Army HQ"):
	case Location.get("LavaCo&trade; Lamp Factory"):
	case Location.get("The Velvet / Gold Mine"):
	case Location.get("The Bubblin' Caldera"):
		break;
	case Location.get("The X-32-F Combat Training Snowman"):
		break;
	case Location.get("Through the Spacegate"):
		break;
	case Location.get("The Old Landfill"):
		break;
	case Location.get("The Red Queen's Garden"):
		break;
	case Location.get("The Bugbear Pen"):
		break;
	case Location.get("The Spooky Gravy Burrow"):
		break;
	case Location.get("Investigating a Plaintive Telegram"):
		break;
	case Location.get("Drunken Stupor"):
		retval._int = 0;
		break;
	case Location.get("Thugnderdome"):
		break;
	case Location.get("The Thinknerd Warehouse"):
		break;
	case Location.get("Gingerbread Upscale Retail District"):
		break;
	case Location.get("Gingerbread Sewers"):
		break;
	case Location.get("Gingerbread Civic Center"):
	case Location.get("Gingerbread Industrial Zone"):
	case Location.get("Gingerbread Train Station"):
		break;
	case Location.get("Monorail Work Site"):
		break;
	case Location.get("A Maze of Sewer Tunnels"):
		break;
	}
//	This is just to do a mass test.
//	default:
//		abort("Can't find " + loc);
//		break;

	return retval;
}

export function zone_hasLuckyAdventure(loc: Location): boolean
{
	if (Location.get(["Vanya's Castle", "The Fungus Plains", "Megalo-City", "Hero's Field", "A Maze of Sewer Tunnels", "A Mob of Zeppelin Protesters", "A-Boo Peak", "An Octopus's Garden", "Art Class",
	"Cola Wars Battlefield (Cloaca Uniform)", "Cola Wars Battlefield (Dyspepsi Uniform)", "The Cola Wars Battlefield", "Burnbarrel Blvd.", "Camp Logging Camp", "Chemistry Class",
	"Cobb's Knob Barracks", "Cobb's Knob Harem", "Cobb's Knob Kitchens", "Cobb's Knob Laboratory", "Cobb's Knob Menagerie, Level 2", "Cobb's Knob Treasury",
	"Elf Alley", "Exposure Esplanade", "The Orcish Frat House", "The Orcish Frat House (In Disguise)", "Guano Junction", "The Hippy Camp", "The Hippy Camp (In Disguise)", "Itznotyerzitz Mine",
	"Lair of the Ninja Snowmen", "Lemon Party", "Madness Reef", "Oil Peak", "Outskirts of Camp Logging Camp", "Pandamonium Slums", "Shop Class", "South of the Border",
	"The \"Fun\" House", "The Ancient Hobo Burial Ground", "The Batrat and Ratbat Burrow", "The Black Forest", "The Brinier Deepers", "The Briny Deeps", "The Bugbear Pen",
	"The Castle in the Clouds in the Sky (Basement)", "The Castle in the Clouds in the Sky (Ground Floor)", "The Castle in the Clouds in the Sky (Top Floor)",
	"The Copperhead Club", "The Dark Elbow of the Woods", "The Dark Heart of the Woods", "The Dark Neck of the Woods", "The Dive Bar", "The Goatlet", "The Hallowed Halls",
	"The Haunted Ballroom", "The Haunted Billiards Room", "The Haunted Boiler Room", "The Haunted Conservatory", "The Haunted Gallery", "The Haunted Kitchen",
	"The Haunted Library", "The Haunted Pantry", "The Haunted Storage Room", "The Heap", "The Hidden Park", "The Hidden Temple", "The Icy Peak", "The Knob Shaft",
	"The Limerick Dungeon", "The Mer-Kin Outpost", "The Oasis", "The Obligatory Pirate's Cove", "The Outskirts of Cobb's Knob", "The Poker Room", "The Primordial Soup",
	"The Purple Light District", "The Red Zeppelin", "The Roulette Tables", "The Sleazy Back Alley", "The Smut Orc Logging Camp", "The Spectral Pickle Factory",
	"The Spooky Forest", "The Spooky Gravy Burrow", "The Unquiet Garves", "The VERY Unquiet Garves", "The Valley of Rof L'm Fao", "The Wreck of the Edgar Fitzsimmons",
	"Thugnderdome", "Tower Ruins", "Twin Peak", "Vanya's Castle Chapel", "Whitey's Grove", "Ye Olde Medievale Villagee"]).includes(loc))
	{
		return true;
	}
	return false;
}

export function zones_available(): Map<number, Location>
{
	let retval: Map<number, Location> = new Map();
	for (let loc of Location.get(["Your Mushroom Garden", "Pump Up Muscle", "Pump Up Mysticality", "Pump Up Moxie", "Richard's Hobo Mysticality", "Richard's Hobo Moxie", "Richard's Hobo Muscle", "A Maze of Sewer Tunnels", "Hobopolis Town Square", "Burnbarrel Blvd.", "Exposure Esplanade", "The Heap", "The Ancient Hobo Burial Ground", "The Purple Light District", "The Slime Tube", "Dreadsylvanian Woods", "Dreadsylvanian Village", "Dreadsylvanian Castle", "The Sleazy Back Alley", "The Copperhead Club", "The Skeleton Store", "Madness Bakery", "The Overgrown Lot", "Goat Party", "Pirate Party", "Lemon Party", "The Roulette Tables", "The Poker Room", "An Unusually Quiet Barroom Brawl", "The Haunted Boiler Room", "The Haunted Laundry Room", "The Haunted Wine Cellar", "Summoning Chamber", "The Haunted Pantry", "The Haunted Kitchen", "The Haunted Conservatory", "The Haunted Library", "The Haunted Billiards Room", "The Haunted Bathroom", "The Haunted Bedroom", "The Haunted Gallery", "The Haunted Ballroom", "The Haunted Laboratory", "The Haunted Nursery", "The Haunted Storage Room", "The Degrassi Knoll Restroom", "The Degrassi Knoll Bakery", "The Degrassi Knoll Gym", "The Degrassi Knoll Garage", "The \"Fun\" House", "The Unquiet Garves", "The VERY Unquiet Garves", "Inside the Palindome", "The Bat Hole Entrance", "Guano Junction", "The Batrat and Ratbat Burrow", "The Beanbat Chamber", "The Boss Bat's Lair", "The Outskirts of Cobb's Knob", "Cobb's Knob Barracks", "Cobb's Knob Kitchens", "Cobb's Knob Harem", "Cobb's Knob Treasury", "Throne Room", "Cobb's Knob Laboratory", "The Knob Shaft", "The Knob Shaft (Mining)", "Cobb's Knob Menagerie, Level 1", "Cobb's Knob Menagerie, Level 2", "Cobb's Knob Menagerie, Level 3", "The Cola Wars Battlefield", "Cola Wars Battlefield (Cloaca Uniform)", "Cola Wars Battlefield (Dyspepsi Uniform)", "Tower Ruins", "Fernswarthy's Basement", "The Defiled Nook", "The Defiled Cranny", "The Defiled Alcove", "The Defiled Niche", "Haert of the Cyrpt", "The Penultimate Fantasy Airship", "The Castle in the Clouds in the Sky (Basement)", "The Castle in the Clouds in the Sky (Ground Floor)", "The Castle in the Clouds in the Sky (Top Floor)", "The Hole in the Sky", "Fastest Adventurer Contest", "Strongest Adventurer Contest", "Smartest Adventurer Contest", "Smoothest Adventurer Contest", "A Crowd of (Stat) Adventurers", "Hottest Adventurer Contest", "Coldest Adventurer Contest", "Spookiest Adventurer Contest", "Stinkiest Adventurer Contest", "Sleaziest Adventurer Contest", "A Crowd of (Element) Adventurers", "The Hedge Maze", "Tower Level 1", "Tower Level 2", "Tower Level 3", "Tower Level 4", "Tower Level 5", "The Naughty Sorceress' Chamber", "South of the Border", "The Oasis", "The Arid, Extra-Dry Desert", "The Shore, Inc. Travel Agency", "Kokomo Resort", "The Upper Chamber", "The Middle Chamber", "The Lower Chambers", "Noob Cave", "The Dire Warren", "The Valley of Rof L'm Fao", "The Smut Orc Logging Camp", "The Thinknerd Warehouse", "The Haiku Dungeon", "The Limerick Dungeon", "The Enormous Greater-Than Sign", "The Dungeons of Doom", "The Daily Dungeon", "Itznotyerzitz Mine", "The Goatlet", "Lair of the Ninja Snowmen", "The eXtreme Slope", "Mist-Shrouded Peak", "The Icy Peak", "The Mine Foremens' Office", "Dwarven Factory Warehouse", "Itznotyerzitz Mine (in Disguise)", "A-Boo Peak", "Twin Peak", "Oil Peak", "A Mob of Zeppelin Protesters", "The Red Zeppelin", "The Typical Tavern Cellar", "The Spooky Forest", "The Hidden Temple", "A Barroom Brawl", "Whitey's Grove", "The Road to the White Citadel", "The Black Forest", "The Old Landfill", "The Dark Neck of the Woods", "The Dark Heart of the Woods", "The Dark Elbow of the Woods", "Friar Ceremony Location", "Pandamonium", "Pandamonium Slums", "The Laugh Floor", "Infernal Rackets Backstage", "The Hidden Apartment Building", "The Hidden Hospital", "The Hidden Office Building", "The Hidden Bowling Alley", "The Hidden Park", "An Overgrown Shrine (Northwest)", "An Overgrown Shrine (Southwest)", "An Overgrown Shrine (Northeast)", "An Overgrown Shrine (Southeast)", "A Massive Ziggurat", "The Dripping Trees", "The Dripping Hall", "The Fungus Plains", "Hero's Field", "Vanya's Castle", "Megalo-City", "The Orcish Frat House", "The Orcish Frat House (In Disguise)", "The Hippy Camp", "The Hippy Camp (In Disguise)", "The Hippy Camp (Bombed Back to the Stone Age)", "The Orcish Frat House (Bombed Back to the Stone Age)", "The Obligatory Pirate's Cove", "Barrrney's Barrr", "The F'c'le", "The Poop Deck", "Belowdecks", "Wartime Frat House (Hippy Disguise)", "Wartime Frat House", "Wartime Hippy Camp (Frat Disguise)", "Wartime Hippy Camp", "The Battlefield (Frat Uniform)", "The Battlefield (Hippy Uniform)", "Next to that Barrel with Something Burning in it", "Near an Abandoned Refrigerator", "Over Where the Old Tires Are", "Out by that Rusted-Out Car", "McMillicancuddy's Barn", "McMillicancuddy's Pond", "McMillicancuddy's Back 40", "McMillicancuddy's Other Back 40", "McMillicancuddy's Granary", "McMillicancuddy's Bog", "McMillicancuddy's Family Plot", "McMillicancuddy's Shady Thicket", "The Hatching Chamber", "The Feeding Chamber", "The Royal Guard Chamber", "The Filthworm Queen's Chamber", "The Themthar Hills", "The Junkyard", "McMillicancuddy's Farm", "Sonofa Beach", "The Briny Deeps", "The Brinier Deepers", "The Briniest Deepests", "An Octopus's Garden", "The Wreck of the Edgar Fitzsimmons", "The Marinara Trench", "Anemone Mine", "The Dive Bar", "The Mer-Kin Outpost", "The Coral Corral", "The Caliginous Abyss", "The Skate Park", "Madness Reef", "Anemone Mine (Mining)", "Mer-kin Elementary School", "Mer-kin Library", "Mer-kin Gymnasium", "Mer-kin Colosseum", "Mer-kin Temple", "Mer-kin Temple (Left Door)", "Mer-kin Temple (Center Door)", "Mer-kin Temple (Right Door)", "The Fungal Nethers", "The Broodling Grounds", "The Outer Compound", "The Temple Portico", "Convention Hall Lobby", "Outside the Club", "The Island Barracks", "The Nemesis' Lair", "The Secret Council Warehouse", "Super Villain's Lair", "Medbay", "Waste Processing", "Sonar", "Science Lab", "Morgue", "Special Ops", "Engineering", "Navigation", "Galley", "The Hallowed Halls", "Shop Class", "Chemistry Class", "Art Class", "The Exploaded Battlefield", "The Invader", "The Goo Fields", "The Goo-Choked Fun House", "The Goo-Coated Knob", "The Goo-Spewing Bat Hole", "The Goo-Bedecked Beanstalk", "The Goo-Shrouded Palindome", "The Goo-Girded Garves", "The Goo-Splattered Tower Ruins", "Fight in the Dirt", "Fight in the Tall Grass", "Fight in the Very Tall Grass", "The Bugbear Pen", "The Spooky Gravy Burrow", "Post-Quest Bugbear Pens", "Outskirts of Camp Logging Camp", "Camp Logging Camp", "The Edge of the Swamp", "The Dark and Spooky Swamp", "The Corpse Bog", "The Ruined Wizard Tower", "The Wildlife Sanctuarrrrrgh", "Swamp Beaver Territory", "The Weird Swamp Village", "Thugnderdome", "Heartbreaker's Hotel", "Trick-or-Treating", "Drunken Stupor", "St. Sneaky Pete's Day Stupor", "Bloated and Nauseous", "Poisoned Spleen", "The Yuletide Bonfire", "The Arrrboretum", "The Spectral Pickle Factory", "Generic Summer Holiday Swimming!", "The Cave Before Time", "An Illicit Bohemian Party", "Moonshiners' Woods", "The Roman Forum", "The Post-Mall", "The Rowdy Saloon", "The Spooky Old Abandoned Mine", "Globe Theatre Main Stage", "Globe Theatre Backstage", "12 West Main", "KoL Con Clan Party House", "The Home of The Future", "Spring Bros. Solenoids", "Boltsmann Bearings", "The Primordial Stew", "No Man's And Also No Skeleton's Land", "Axis HQ", "Shadow Rift", "Shadow Rift (Desert Beach)", "Shadow Rift (Forest Village)", "Shadow Rift (Mt. McLargeHuge)", "Shadow Rift (Somewhere Over the Beanstalk)", "Shadow Rift (Spookyraven Manor Third Floor)", "Shadow Rift (The 8-Bit Realm)", "Shadow Rift (The Ancient Buried Pyramid)", "Shadow Rift (The Castle in the Clouds in the Sky)", "Shadow Rift (The Distant Woods)", "Shadow Rift (The Hidden City)", "Shadow Rift (The Misspelled Cemetary)", "Shadow Rift (The Nearby Plains)", "Shadow Rift (The Right Side of the Tracks)", "Lollipop Forest", "Fudge Mountain", "Gingerbread Reef", "The Wreck of the H. M. S. Kringle", "The Impenetrable Kelp-Holly Forest", "Smoldering Bone Spikes", "Smoldering Fingerbones", "A Smoldering Pelvis", "A Smoldering Ribcage", "Easter Island", "St. Patrick's Day Island", "Veterans Day Island", "Thanksgiving Island", "Christmas Island", "Abuela's Cottage (Contested)", "The Embattled Factory", "The Bar At War", "A Cafe Divided", "The Armory Up In Arms", "Crimbo Train (Caboose)", "Crimbo Train (Passenger Car)", "Crimbo Train (Dining Car)", "Crimbo Train (Coal Car)", "Crimbo Train (Locomotive)", "Site Alpha Dormitory", "Site Alpha Greenhouse", "Site Alpha Quarry", "Site Alpha Primary Lab", "The Canadian Wildlife Preserve", "The Cheerless Spire (Level 1)", "The Cheerless Spire (Level 2)", "The Cheerless Spire (Level 3)", "The Cheerless Spire (Level 4)", "The Cheerless Spire (Level 5)", "Your Bung Chakra", "Your Guts Chakra", "Your Liver Chakra", "Your Nipple Chakra", "Your Nose Chakra", "Your Hat Chakra", "Crimbo's Sack", "Crimbo's Boots", "Crimbo's Jelly", "Crimbo's Reindeer", "Crimbo's Beard", "Crimbo's Hat", "The Ruins of the Fully Automated Crimbo Factory", "The Crimbonium Mining Camp", "The Crimbonium Mine", "WarBear Fortress (First Level)", "WarBear Fortress (Second Level)", "WarBear Fortress (Third Level)", "Crimbo Town Toy Factory (2012)", "Elf Alley", "CRIMBCO cubicles", "CRIMBCO WC", "Crimbo Town Toy Factory (2009)", "The Don's Crimbo Compound", "Atomic Crimbo Toy Factory", "Old Crimbo Town Toy Factory", "Sinister Dodecahedron", "Crimbo Town Toy Factory (2007)", "Simple Tool-Making Cave", "Spooky Fright Factory", "Crimborg Collective Factory", "Crimbo Town Toy Factory (2005)", "Market Square, 28 Days Later", "The Mall of Loathing, 28 Days Later", "Wrong Side of the Tracks, 28 Days Later", "The Icy Peak in The Recent Past", "Spectral Salad Factory", "Shivering Timbers", "A Skeleton Invasion!", "The Cannon Museum", "A Swarm of Yeti-Mounted Skeletons", "The Bonewall", "A Massive Flying Battleship", "A Supply Train", "The Bone Star", "Grim Grimacite Site", "A Pile of Old Servers", "The Haunted Sorority House", "Fightin' Fire", "Super-Intense Mega-Grassfire", "Fierce Flying Flames", "Lord Flameface's Castle Entryway", "Lord Flameface's Castle Belfry", "Lord Flameface's Throne Room", "A Stinking Abyssal Portal", "A Scorching Abyssal Portal", "A Terrifying Abyssal Portal", "A Freezing Abyssal Portal", "An Unsettling Abyssal Portal", "A Yawning Abyssal Portal", "The Space Odyssey Discotheque", "The Spirit World", "Some Scattered Smoking Debris", "A Crater Full of Space Beasts", "An Eldritch Fissure", "An Eldritch Horror", "Monorail Work Site", "A Monorail Station", "El Vibrato Island", "The Tunnel of L.O.V.E.", "The Deep Machine Tunnels", "Investigating a Plaintive Telegram", "The Neverending Party", "Mt. Molehill", "[DungeonFAQ - Level 1]", "[DungeonFAQ - Level 2]", "[DungeonFAQ - Level 3]", "The Red Queen's Garden", "The Clumsiness Grove", "The Maelstrom of Lovers", "The Glacier of Jerks", "An Incredibly Strange Place (Bad Trip)", "An Incredibly Strange Place (Mediocre Trip)", "An Incredibly Strange Place (Great Trip)", "The Stately Pleasure Dome", "The Mouldering Mansion", "The Rogue Windmill", "The Primordial Soup", "The Jungles of Ancient Loathing", "Seaside Megalopolis", "Domed City of Ronaldus", "Domed City of Grimacia", "Hamburglaris Shield Generator", "The Landscaper's Lair", "Professor Jacking's Small-O-Fier", "Professor Jacking's Huge-A-Ma-Tron", "Vanya's Castle Foyer", "Vanya's Castle Chapel", "Kegger in the Woods", "The Electric Lemonade Acid Parade", "Neckback Crick", "Anger Man's Level", "Fear Man's Level", "Doubt Man's Level", "Regret Man's Level", "The Nightmare Meatrealm", "A Kitchen Drawer", "A Grocery Bag", "Chinatown Shops", "Triad Factory", "1st Floor, Shiawase-Mitsuhama Building", "2nd Floor, Shiawase-Mitsuhama Building", "3rd Floor, Shiawase-Mitsuhama Building", "Chinatown Tenement", "The Gourd!", "The Tower of Procedurally-Generated Skeletons", "The Old Man's Bathtime Adventures", "The Inner Wolf Gym", "Unleash Your Inner Wolf", "Sweet-Ade Lake", "Eager Rice Burrows", "Gumdrop Forest", "A Deserted Stretch of I-911", "The Prince's Restroom", "The Prince's Dance Floor", "The Prince's Kitchen", "The Prince's Balcony", "The Prince's Lounge", "The Prince's Canapes Table", "Ye Olde Medievale Villagee", "Portal to Terrible Parents", "Rumpelstiltskin's Workshop", "The Fun-Guy Mansion", "Sloppy Seconds Diner", "The Sunken Party Yacht", "The Mansion of Dr. Weirdeaux", "The Secret Government Laboratory", "The Deep Dark Jungle", "Barf Mountain", "Pirates of the Garbage Barges", "The Toxic Teacups", "Uncle Gator's Country Fun-Time Liquid Waste Sluice", "The SMOOCH Army HQ", "The Velvet / Gold Mine", "LavaCo&trade; Lamp Factory", "The Bubblin' Caldera", "The Velvet / Gold Mine (Mining)", "The Ice Hotel", "VYKEA", "The Ice Hole", "The Mines", "The Jungle", "The Ice Caves", "The Temple Ruins", "Hell", "The Snake Pit", "The Spider Hole", "The Ancient Burial Ground", "The Beehive", "The Crashed U. F. O.", "The City of Goooold", "LOLmec's Lair", "Yomama's Throne", "Center Park After Dark", "The Mean Streets", "Warehouse Row", "Gotpork Conservatory of Flowers", "Gotpork Municipal Reservoir", "Gotpork Gardens Cemetery", "Gotpork City Sewers", "Porkham Asylum", "The Old Gotpork Library", "Gotpork Clock, Inc.", "Gotpork Foundry", "Trivial Pursuits, LLC", "JokesterCo", "The X-32-F Combat Training Snowman", "Through the Spacegate", "Gingerbread Civic Center", "Gingerbread Train Station", "Gingerbread Industrial Zone", "Gingerbread Upscale Retail District", "Gingerbread Sewers", "The Bandit Crossroads", "The Towering Mountains", "The Mystic Wood", "The Putrid Swamp", "The Cursed Village", "The Sprawling Cemetery", "The Old Rubee Mine", "The Foreboding Cave", "The Faerie Cyrkle", "The Druidic Campsite", "Near the Witch's House", "The Evil Cathedral", "The Barrow Mounds", "The Cursed Village Thieves' Guild", "The Troll Fortress", "The Labyrinthine Crypt", "The Lair of the Phoenix", "The Dragon's Moor", "Duke Vampire's Chateau", "The Master Thief's Chalet", "The Spider Queen's Lair", "The Archwizard's Tower", "The Ley Nexus", "The Ghoul King's Catacomb", "The Ogre Chieftain's Keep", "Sailing the PirateRealm Seas", "PirateRealm Island", "Battle Island", "Crab Island", "Glass Island", "Dessert Island", "Key Key", "Skull Island", "Isla Gublar", "Cemetery Island", "Jungle Island", "Trash Island", "Prison Island", "Signal Island", "Tiki Island", "Storm Island", "Red Roger's Fortress", "Jack's Hideout", "The Temple", "Cyberzone 1", "Cyberzone 2", "Cyberzone 3", "Degrassi Knoll", "The Road to White Citadel", "The Haunted Kitchen (OLD)", "The Haunted Conservatory (OLD)", "The Haunted Billiards Room (OLD)", "The Haunted Bathroom (OLD)", "The Haunted Bedroom (OLD)", "The Black Forest (OLD)", "The Hidden City", "The Palindome (OLD)", "The Arid, Extra-Dry Desert (Dehydrated)", "The Arid, Extra-Dry Desert (Ultrahydrated)", "OLD The Upper Chamber", "OLD The Middle Chamber", "The Haunted Wine Cellar (Northwest)", "The Haunted Wine Cellar (Northeast)", "The Haunted Wine Cellar (Southwest)", "The Haunted Wine Cellar (Southeast)", "Nemesis Cave", "8-Bit Realm"]))
	{
		if (zone_isAvailable(loc, false))
		{
			retval.set(retval.size, loc);
		}
	}
	return retval;
}

export function mobs_available(): Map<number, Monster>
{
	let list: Map<Monster, boolean> = new Map();
	let retval: Map<number, Monster> = new Map();
	for (let [idx, loc] of zones_available())
	{
		for (let [idx_1, mob] of getMonsters(loc).entries())
		{
			list.set(mob, true);
		}
	}
	for (let mob of list.keys())
	{
		retval.set(retval.size, mob);
	}
	return retval;
}

export function drops_available(): Map<number, Item>
{
	let list: Map<Item, boolean> = new Map();
	let retval: Map<number, Item> = new Map();
	for (let [idx, mob] of mobs_available())
	{
		for (let it of Item.get(Object.keys(itemDrops(mob))))
		{
			list.set(it, true);
		}
	}
	for (let it of list.keys())
	{
		retval.set(retval.size, it);
	}
	return retval;
}


export function hugpocket_available(): Map<number, Item>
{
	let list: Map<Item, boolean> = new Map();
	let retval: Map<number, Item> = new Map();
	for (let [idx, mob] of mobs_available())
	{
		for (let [idx_1, drop] of itemDropsArray(mob).entries())
		{
			if (drop.type === "0")
			{
				list.set(drop.drop, true);
			}
			else if (drop.rate > 0 && drop.type !== "n" && drop.type !== "c" && drop.type !== "b")
			{
				list.set(drop.drop, true);
			}
		}
	}
	for (let it of list.keys())
	{
		retval.set(retval.size, it);
	}
	return retval;
}

export function is_ghost_in_zone(loc: Location): boolean
{
	//special location handling
	let totalTurnsSpent: number = 0;
	let delayForNextNoncombat: number = 0;
	if (haveEffect(Effect.get("Lucky!")) > 0)
	{
		return false; //we are grabbing a Lucky! so we will not encounter a ghost unless it is a wandering monster
	}
	{ 
			//forced noncombat of lighting the peak
		//internal tracking by autoscend
			//our next visit to the peak will be The Horror NC adventure
		//special case for [ghost of Elizabeth Spookyraven] which only appears in [the haunted gallery] at the culmination of lights out quest
		//TODO implement doing the quest and then return true when the quest is at the right stage for her to appear
		//special case for King Boo
		//if liana cleared then we can encounter ghost

		let hasMcCluskyFile: boolean = false;
		let cursed: boolean = false;
		//if tracker is 6 we used just the right amount of bowling bowls
		//massive ziggurat
			//[Protector_S._P._E._C._T._R._E.] has 0 phys res and 100% all element res
		//for all other zones

		let apprates: Map<Monster, number> = new Map();
		switch (loc)
	{
	case Location.get("A-Boo Peak"):
		if (toInt(getProperty("booPeakProgress")) === 0 && !toBoolean(getProperty("booPeakLit")))
		{

			return false;
		}
		if (toInt(getProperty("auto_aboopending")) !== 0)
		{

			return false;
		}
		return true;
	case Location.get("The Haunted Gallery"):
		return false;
	case Location.get("Summoning Chamber"):
		return in_plumber();
	case Location.get("The Hidden Hospital"):
		return toInt(getProperty("hiddenHospitalProgress")) > 0 && toInt(getProperty("hiddenHospitalProgress")) < 7;
	case Location.get("The Hidden Office Building"):		hasMcCluskyFile = availableAmount((Item.get("McClusky file (complete)"))) > 0;
		totalTurnsSpent = (Location.get("The Hidden Office Building")).turnsSpent;
		delayForNextNoncombat = 4 - (totalTurnsSpent - 1) % 5;
		if (auto_haveQueuedForcedNonCombat())
		{
			delayForNextNoncombat = 0;
		}
		return hasMcCluskyFile && delayForNextNoncombat === 0;
	case Location.get("The Hidden Apartment Building"):		cursed = haveEffect(Effect.get("Thrice-Cursed")) > 0;
		totalTurnsSpent = (Location.get("The Hidden Apartment Building")).turnsSpent;
		delayForNextNoncombat = 7 - (totalTurnsSpent - 9) % 8;
		if (totalTurnsSpent < 9)
		{
			delayForNextNoncombat = 8 - totalTurnsSpent;
		}
		if (auto_haveQueuedForcedNonCombat())
		{
			delayForNextNoncombat = 0;
		}
		return cursed && delayForNextNoncombat === 0;
	case Location.get("The Hidden Bowling Alley"):
		return toInt(getProperty("hiddenBowlingAlleyProgress")) === 6 && availableAmount((Item.get("bowling ball"))) > 0;
	case Location.get("A Massive Ziggurat"):
		if (in_robot())
		{
			return false;
		}
		return liana_cleared((Location.get("A Massive Ziggurat"))) && availableAmount((Item.get("stone triangle"))) === 4;
		default:		apprates = auto_combat_appearance_rates(loc, true);
		for (let [idx, mob] of getMonsters(loc).entries())
		{
			if ((apprates.get(mob) ?? apprates.set(mob, 0.0).get(mob)) <= 0) { //won't show up because banished or req's not fulfilled
			continue; }
			if (mob.physicalResistance >= 80)
			{
				return true;
			}
		}
	} }

	return false;
}

export function monster_to_location(target: Monster): Map<Location, boolean>
{
	let retval: Map<Location, boolean> = new Map();
	for (let loc of Location.get(["Your Mushroom Garden", "Pump Up Muscle", "Pump Up Mysticality", "Pump Up Moxie", "Richard's Hobo Mysticality", "Richard's Hobo Moxie", "Richard's Hobo Muscle", "A Maze of Sewer Tunnels", "Hobopolis Town Square", "Burnbarrel Blvd.", "Exposure Esplanade", "The Heap", "The Ancient Hobo Burial Ground", "The Purple Light District", "The Slime Tube", "Dreadsylvanian Woods", "Dreadsylvanian Village", "Dreadsylvanian Castle", "The Sleazy Back Alley", "The Copperhead Club", "The Skeleton Store", "Madness Bakery", "The Overgrown Lot", "Goat Party", "Pirate Party", "Lemon Party", "The Roulette Tables", "The Poker Room", "An Unusually Quiet Barroom Brawl", "The Haunted Boiler Room", "The Haunted Laundry Room", "The Haunted Wine Cellar", "Summoning Chamber", "The Haunted Pantry", "The Haunted Kitchen", "The Haunted Conservatory", "The Haunted Library", "The Haunted Billiards Room", "The Haunted Bathroom", "The Haunted Bedroom", "The Haunted Gallery", "The Haunted Ballroom", "The Haunted Laboratory", "The Haunted Nursery", "The Haunted Storage Room", "The Degrassi Knoll Restroom", "The Degrassi Knoll Bakery", "The Degrassi Knoll Gym", "The Degrassi Knoll Garage", "The \"Fun\" House", "The Unquiet Garves", "The VERY Unquiet Garves", "Inside the Palindome", "The Bat Hole Entrance", "Guano Junction", "The Batrat and Ratbat Burrow", "The Beanbat Chamber", "The Boss Bat's Lair", "The Outskirts of Cobb's Knob", "Cobb's Knob Barracks", "Cobb's Knob Kitchens", "Cobb's Knob Harem", "Cobb's Knob Treasury", "Throne Room", "Cobb's Knob Laboratory", "The Knob Shaft", "The Knob Shaft (Mining)", "Cobb's Knob Menagerie, Level 1", "Cobb's Knob Menagerie, Level 2", "Cobb's Knob Menagerie, Level 3", "The Cola Wars Battlefield", "Cola Wars Battlefield (Cloaca Uniform)", "Cola Wars Battlefield (Dyspepsi Uniform)", "Tower Ruins", "Fernswarthy's Basement", "The Defiled Nook", "The Defiled Cranny", "The Defiled Alcove", "The Defiled Niche", "Haert of the Cyrpt", "The Penultimate Fantasy Airship", "The Castle in the Clouds in the Sky (Basement)", "The Castle in the Clouds in the Sky (Ground Floor)", "The Castle in the Clouds in the Sky (Top Floor)", "The Hole in the Sky", "Fastest Adventurer Contest", "Strongest Adventurer Contest", "Smartest Adventurer Contest", "Smoothest Adventurer Contest", "A Crowd of (Stat) Adventurers", "Hottest Adventurer Contest", "Coldest Adventurer Contest", "Spookiest Adventurer Contest", "Stinkiest Adventurer Contest", "Sleaziest Adventurer Contest", "A Crowd of (Element) Adventurers", "The Hedge Maze", "Tower Level 1", "Tower Level 2", "Tower Level 3", "Tower Level 4", "Tower Level 5", "The Naughty Sorceress' Chamber", "South of the Border", "The Oasis", "The Arid, Extra-Dry Desert", "The Shore, Inc. Travel Agency", "Kokomo Resort", "The Upper Chamber", "The Middle Chamber", "The Lower Chambers", "Noob Cave", "The Dire Warren", "The Valley of Rof L'm Fao", "The Smut Orc Logging Camp", "The Thinknerd Warehouse", "The Haiku Dungeon", "The Limerick Dungeon", "The Enormous Greater-Than Sign", "The Dungeons of Doom", "The Daily Dungeon", "Itznotyerzitz Mine", "The Goatlet", "Lair of the Ninja Snowmen", "The eXtreme Slope", "Mist-Shrouded Peak", "The Icy Peak", "The Mine Foremens' Office", "Dwarven Factory Warehouse", "Itznotyerzitz Mine (in Disguise)", "A-Boo Peak", "Twin Peak", "Oil Peak", "A Mob of Zeppelin Protesters", "The Red Zeppelin", "The Typical Tavern Cellar", "The Spooky Forest", "The Hidden Temple", "A Barroom Brawl", "Whitey's Grove", "The Road to the White Citadel", "The Black Forest", "The Old Landfill", "The Dark Neck of the Woods", "The Dark Heart of the Woods", "The Dark Elbow of the Woods", "Friar Ceremony Location", "Pandamonium", "Pandamonium Slums", "The Laugh Floor", "Infernal Rackets Backstage", "The Hidden Apartment Building", "The Hidden Hospital", "The Hidden Office Building", "The Hidden Bowling Alley", "The Hidden Park", "An Overgrown Shrine (Northwest)", "An Overgrown Shrine (Southwest)", "An Overgrown Shrine (Northeast)", "An Overgrown Shrine (Southeast)", "A Massive Ziggurat", "The Dripping Trees", "The Dripping Hall", "The Fungus Plains", "Hero's Field", "Vanya's Castle", "Megalo-City", "The Orcish Frat House", "The Orcish Frat House (In Disguise)", "The Hippy Camp", "The Hippy Camp (In Disguise)", "The Hippy Camp (Bombed Back to the Stone Age)", "The Orcish Frat House (Bombed Back to the Stone Age)", "The Obligatory Pirate's Cove", "Barrrney's Barrr", "The F'c'le", "The Poop Deck", "Belowdecks", "Wartime Frat House (Hippy Disguise)", "Wartime Frat House", "Wartime Hippy Camp (Frat Disguise)", "Wartime Hippy Camp", "The Battlefield (Frat Uniform)", "The Battlefield (Hippy Uniform)", "Next to that Barrel with Something Burning in it", "Near an Abandoned Refrigerator", "Over Where the Old Tires Are", "Out by that Rusted-Out Car", "McMillicancuddy's Barn", "McMillicancuddy's Pond", "McMillicancuddy's Back 40", "McMillicancuddy's Other Back 40", "McMillicancuddy's Granary", "McMillicancuddy's Bog", "McMillicancuddy's Family Plot", "McMillicancuddy's Shady Thicket", "The Hatching Chamber", "The Feeding Chamber", "The Royal Guard Chamber", "The Filthworm Queen's Chamber", "The Themthar Hills", "The Junkyard", "McMillicancuddy's Farm", "Sonofa Beach", "The Briny Deeps", "The Brinier Deepers", "The Briniest Deepests", "An Octopus's Garden", "The Wreck of the Edgar Fitzsimmons", "The Marinara Trench", "Anemone Mine", "The Dive Bar", "The Mer-Kin Outpost", "The Coral Corral", "The Caliginous Abyss", "The Skate Park", "Madness Reef", "Anemone Mine (Mining)", "Mer-kin Elementary School", "Mer-kin Library", "Mer-kin Gymnasium", "Mer-kin Colosseum", "Mer-kin Temple", "Mer-kin Temple (Left Door)", "Mer-kin Temple (Center Door)", "Mer-kin Temple (Right Door)", "The Fungal Nethers", "The Broodling Grounds", "The Outer Compound", "The Temple Portico", "Convention Hall Lobby", "Outside the Club", "The Island Barracks", "The Nemesis' Lair", "The Secret Council Warehouse", "Super Villain's Lair", "Medbay", "Waste Processing", "Sonar", "Science Lab", "Morgue", "Special Ops", "Engineering", "Navigation", "Galley", "The Hallowed Halls", "Shop Class", "Chemistry Class", "Art Class", "The Exploaded Battlefield", "The Invader", "The Goo Fields", "The Goo-Choked Fun House", "The Goo-Coated Knob", "The Goo-Spewing Bat Hole", "The Goo-Bedecked Beanstalk", "The Goo-Shrouded Palindome", "The Goo-Girded Garves", "The Goo-Splattered Tower Ruins", "Fight in the Dirt", "Fight in the Tall Grass", "Fight in the Very Tall Grass", "The Bugbear Pen", "The Spooky Gravy Burrow", "Post-Quest Bugbear Pens", "Outskirts of Camp Logging Camp", "Camp Logging Camp", "The Edge of the Swamp", "The Dark and Spooky Swamp", "The Corpse Bog", "The Ruined Wizard Tower", "The Wildlife Sanctuarrrrrgh", "Swamp Beaver Territory", "The Weird Swamp Village", "Thugnderdome", "Heartbreaker's Hotel", "Trick-or-Treating", "Drunken Stupor", "St. Sneaky Pete's Day Stupor", "Bloated and Nauseous", "Poisoned Spleen", "The Yuletide Bonfire", "The Arrrboretum", "The Spectral Pickle Factory", "Generic Summer Holiday Swimming!", "The Cave Before Time", "An Illicit Bohemian Party", "Moonshiners' Woods", "The Roman Forum", "The Post-Mall", "The Rowdy Saloon", "The Spooky Old Abandoned Mine", "Globe Theatre Main Stage", "Globe Theatre Backstage", "12 West Main", "KoL Con Clan Party House", "The Home of The Future", "Spring Bros. Solenoids", "Boltsmann Bearings", "The Primordial Stew", "No Man's And Also No Skeleton's Land", "Axis HQ", "Shadow Rift", "Shadow Rift (Desert Beach)", "Shadow Rift (Forest Village)", "Shadow Rift (Mt. McLargeHuge)", "Shadow Rift (Somewhere Over the Beanstalk)", "Shadow Rift (Spookyraven Manor Third Floor)", "Shadow Rift (The 8-Bit Realm)", "Shadow Rift (The Ancient Buried Pyramid)", "Shadow Rift (The Castle in the Clouds in the Sky)", "Shadow Rift (The Distant Woods)", "Shadow Rift (The Hidden City)", "Shadow Rift (The Misspelled Cemetary)", "Shadow Rift (The Nearby Plains)", "Shadow Rift (The Right Side of the Tracks)", "Lollipop Forest", "Fudge Mountain", "Gingerbread Reef", "The Wreck of the H. M. S. Kringle", "The Impenetrable Kelp-Holly Forest", "Smoldering Bone Spikes", "Smoldering Fingerbones", "A Smoldering Pelvis", "A Smoldering Ribcage", "Easter Island", "St. Patrick's Day Island", "Veterans Day Island", "Thanksgiving Island", "Christmas Island", "Abuela's Cottage (Contested)", "The Embattled Factory", "The Bar At War", "A Cafe Divided", "The Armory Up In Arms", "Crimbo Train (Caboose)", "Crimbo Train (Passenger Car)", "Crimbo Train (Dining Car)", "Crimbo Train (Coal Car)", "Crimbo Train (Locomotive)", "Site Alpha Dormitory", "Site Alpha Greenhouse", "Site Alpha Quarry", "Site Alpha Primary Lab", "The Canadian Wildlife Preserve", "The Cheerless Spire (Level 1)", "The Cheerless Spire (Level 2)", "The Cheerless Spire (Level 3)", "The Cheerless Spire (Level 4)", "The Cheerless Spire (Level 5)", "Your Bung Chakra", "Your Guts Chakra", "Your Liver Chakra", "Your Nipple Chakra", "Your Nose Chakra", "Your Hat Chakra", "Crimbo's Sack", "Crimbo's Boots", "Crimbo's Jelly", "Crimbo's Reindeer", "Crimbo's Beard", "Crimbo's Hat", "The Ruins of the Fully Automated Crimbo Factory", "The Crimbonium Mining Camp", "The Crimbonium Mine", "WarBear Fortress (First Level)", "WarBear Fortress (Second Level)", "WarBear Fortress (Third Level)", "Crimbo Town Toy Factory (2012)", "Elf Alley", "CRIMBCO cubicles", "CRIMBCO WC", "Crimbo Town Toy Factory (2009)", "The Don's Crimbo Compound", "Atomic Crimbo Toy Factory", "Old Crimbo Town Toy Factory", "Sinister Dodecahedron", "Crimbo Town Toy Factory (2007)", "Simple Tool-Making Cave", "Spooky Fright Factory", "Crimborg Collective Factory", "Crimbo Town Toy Factory (2005)", "Market Square, 28 Days Later", "The Mall of Loathing, 28 Days Later", "Wrong Side of the Tracks, 28 Days Later", "The Icy Peak in The Recent Past", "Spectral Salad Factory", "Shivering Timbers", "A Skeleton Invasion!", "The Cannon Museum", "A Swarm of Yeti-Mounted Skeletons", "The Bonewall", "A Massive Flying Battleship", "A Supply Train", "The Bone Star", "Grim Grimacite Site", "A Pile of Old Servers", "The Haunted Sorority House", "Fightin' Fire", "Super-Intense Mega-Grassfire", "Fierce Flying Flames", "Lord Flameface's Castle Entryway", "Lord Flameface's Castle Belfry", "Lord Flameface's Throne Room", "A Stinking Abyssal Portal", "A Scorching Abyssal Portal", "A Terrifying Abyssal Portal", "A Freezing Abyssal Portal", "An Unsettling Abyssal Portal", "A Yawning Abyssal Portal", "The Space Odyssey Discotheque", "The Spirit World", "Some Scattered Smoking Debris", "A Crater Full of Space Beasts", "An Eldritch Fissure", "An Eldritch Horror", "Monorail Work Site", "A Monorail Station", "El Vibrato Island", "The Tunnel of L.O.V.E.", "The Deep Machine Tunnels", "Investigating a Plaintive Telegram", "The Neverending Party", "Mt. Molehill", "[DungeonFAQ - Level 1]", "[DungeonFAQ - Level 2]", "[DungeonFAQ - Level 3]", "The Red Queen's Garden", "The Clumsiness Grove", "The Maelstrom of Lovers", "The Glacier of Jerks", "An Incredibly Strange Place (Bad Trip)", "An Incredibly Strange Place (Mediocre Trip)", "An Incredibly Strange Place (Great Trip)", "The Stately Pleasure Dome", "The Mouldering Mansion", "The Rogue Windmill", "The Primordial Soup", "The Jungles of Ancient Loathing", "Seaside Megalopolis", "Domed City of Ronaldus", "Domed City of Grimacia", "Hamburglaris Shield Generator", "The Landscaper's Lair", "Professor Jacking's Small-O-Fier", "Professor Jacking's Huge-A-Ma-Tron", "Vanya's Castle Foyer", "Vanya's Castle Chapel", "Kegger in the Woods", "The Electric Lemonade Acid Parade", "Neckback Crick", "Anger Man's Level", "Fear Man's Level", "Doubt Man's Level", "Regret Man's Level", "The Nightmare Meatrealm", "A Kitchen Drawer", "A Grocery Bag", "Chinatown Shops", "Triad Factory", "1st Floor, Shiawase-Mitsuhama Building", "2nd Floor, Shiawase-Mitsuhama Building", "3rd Floor, Shiawase-Mitsuhama Building", "Chinatown Tenement", "The Gourd!", "The Tower of Procedurally-Generated Skeletons", "The Old Man's Bathtime Adventures", "The Inner Wolf Gym", "Unleash Your Inner Wolf", "Sweet-Ade Lake", "Eager Rice Burrows", "Gumdrop Forest", "A Deserted Stretch of I-911", "The Prince's Restroom", "The Prince's Dance Floor", "The Prince's Kitchen", "The Prince's Balcony", "The Prince's Lounge", "The Prince's Canapes Table", "Ye Olde Medievale Villagee", "Portal to Terrible Parents", "Rumpelstiltskin's Workshop", "The Fun-Guy Mansion", "Sloppy Seconds Diner", "The Sunken Party Yacht", "The Mansion of Dr. Weirdeaux", "The Secret Government Laboratory", "The Deep Dark Jungle", "Barf Mountain", "Pirates of the Garbage Barges", "The Toxic Teacups", "Uncle Gator's Country Fun-Time Liquid Waste Sluice", "The SMOOCH Army HQ", "The Velvet / Gold Mine", "LavaCo&trade; Lamp Factory", "The Bubblin' Caldera", "The Velvet / Gold Mine (Mining)", "The Ice Hotel", "VYKEA", "The Ice Hole", "The Mines", "The Jungle", "The Ice Caves", "The Temple Ruins", "Hell", "The Snake Pit", "The Spider Hole", "The Ancient Burial Ground", "The Beehive", "The Crashed U. F. O.", "The City of Goooold", "LOLmec's Lair", "Yomama's Throne", "Center Park After Dark", "The Mean Streets", "Warehouse Row", "Gotpork Conservatory of Flowers", "Gotpork Municipal Reservoir", "Gotpork Gardens Cemetery", "Gotpork City Sewers", "Porkham Asylum", "The Old Gotpork Library", "Gotpork Clock, Inc.", "Gotpork Foundry", "Trivial Pursuits, LLC", "JokesterCo", "The X-32-F Combat Training Snowman", "Through the Spacegate", "Gingerbread Civic Center", "Gingerbread Train Station", "Gingerbread Industrial Zone", "Gingerbread Upscale Retail District", "Gingerbread Sewers", "The Bandit Crossroads", "The Towering Mountains", "The Mystic Wood", "The Putrid Swamp", "The Cursed Village", "The Sprawling Cemetery", "The Old Rubee Mine", "The Foreboding Cave", "The Faerie Cyrkle", "The Druidic Campsite", "Near the Witch's House", "The Evil Cathedral", "The Barrow Mounds", "The Cursed Village Thieves' Guild", "The Troll Fortress", "The Labyrinthine Crypt", "The Lair of the Phoenix", "The Dragon's Moor", "Duke Vampire's Chateau", "The Master Thief's Chalet", "The Spider Queen's Lair", "The Archwizard's Tower", "The Ley Nexus", "The Ghoul King's Catacomb", "The Ogre Chieftain's Keep", "Sailing the PirateRealm Seas", "PirateRealm Island", "Battle Island", "Crab Island", "Glass Island", "Dessert Island", "Key Key", "Skull Island", "Isla Gublar", "Cemetery Island", "Jungle Island", "Trash Island", "Prison Island", "Signal Island", "Tiki Island", "Storm Island", "Red Roger's Fortress", "Jack's Hideout", "The Temple", "Cyberzone 1", "Cyberzone 2", "Cyberzone 3", "Degrassi Knoll", "The Road to White Citadel", "The Haunted Kitchen (OLD)", "The Haunted Conservatory (OLD)", "The Haunted Billiards Room (OLD)", "The Haunted Bathroom (OLD)", "The Haunted Bedroom (OLD)", "The Black Forest (OLD)", "The Hidden City", "The Palindome (OLD)", "The Arid, Extra-Dry Desert (Dehydrated)", "The Arid, Extra-Dry Desert (Ultrahydrated)", "OLD The Upper Chamber", "OLD The Middle Chamber", "The Haunted Wine Cellar (Northwest)", "The Haunted Wine Cellar (Northeast)", "The Haunted Wine Cellar (Southwest)", "The Haunted Wine Cellar (Southeast)", "Nemesis Cave", "8-Bit Realm"]))
	{ //check all locations in the game
		for (let [idx, mon] of getMonsters(loc).entries()) { if (target === mon)
		{
			retval.set(loc, true);
			break;
		} }
	}
	return retval;
}

export function auto_swoopLocations(): Map<Location, boolean>
{
	return new Map([[Location.get("The Hatching Chamber"), true], [Location.get("The Feeding Chamber"), true], [Location.get("The Royal Guard Chamber"), true], [Location.get("The Hidden Temple"), true], [Location.get("The Goatlet"), true]]);
}/*
	case $location[The Oasis]:
	case $location[The Arid\, Extra-Dry Desert]:
	case $location[The Shore\, Inc. Travel Agency]:
	case $location[The Upper Chamber]:
	case $location[The Middle Chamber]:
	case $location[The Lower Chambers]:
	case $location[The Daily Dungeon]:
	case $location[The Skeleton Store]:
	case $location[Madness Bakery]:
	case $location[The Deep Machine Tunnels]:
	case $location[Super Villain\'s Lair]:
	case $location[The Haunted Kitchen]:
	case $location[The Haunted Conservatory]:
	case $location[The Haunted Gallery]:
	case $location[The Haunted Bathroom]:
	case $location[The Haunted Bedroom]:
	case $location[The Haunted Ballroom]:
	case $location[The Haunted Boiler Room]:
	case $location[The Haunted Laundry Room]:
	case $location[The Haunted Wine Cellar]:
	case $location[Summoning Chamber]:
	case $location[The Hidden Park]:
	case $location[The Hidden Apartment Building]:
	case $location[The Hidden Hospital]:
	case $location[The Hidden Office Building]:
	case $location[The Hidden Bowling Alley]:
	case $location[An Overgrown Shrine (Northwest)]:
	case $location[An Overgrown Shrine (Southwest)]:
	case $location[An Overgrown Shrine (Northeast)]:
	case $location[An Overgrown Shrine (Southeast)]:
	case $location[A Massive Ziggurat]:
	case $location[The Typical Tavern Cellar]:
	case $location[The Spooky Forest]:
	case $location[The Hidden Temple]:
	case $location[The Black Forest]:
	case $location[The Beanbat Chamber]:
	case $location[The Bat Hole Entrance]:
	case $location[The Batrat And Ratbat Burrow]:
	case $location[Guano Junction]:
	case $location[The Boss Bat\'s Lair]:
	case $location[The VERY Unquiet Garves]:
	case $location[Inside the Palindome]:
	case $location[The Outskirts of Cobb\'s Knob]:
	case $location[Cobb\'s Knob Harem]:
	case $location[Cobb\'s Knob Treasury]:
	case $location[Throne Room]:
	case $location[The Dark Neck of the Woods]:
	case $location[The Dark Heart of the Woods]:
	case $location[The Dark Elbow of the Woods]:
	case $location[Pandamonium Slums]:
	case $location[The Laugh Floor]:
	case $location[Infernal Rackets Backstage]:
	case $location[The Defiled Nook]:
	case $location[The Defiled Cranny]:
	case $location[The Defiled Alcove]:
	case $location[The Defiled Niche]:
	case $location[Barrrney\'s Barrr]:
	case $location[The F\'c\'le]:
	case $location[The Poop Deck]:
	case $location[Belowdecks]:
	case $location[The Battlefield (Frat Uniform)]:
	case $location[Wartime Hippy Camp (Frat Disguise)]:
	case $location[Next to that Barrel with Something Burning in it]:
	case $location[Near an Abandoned Refrigerator]:
	case $location[Over Where the Old Tires Are]:
	case $location[Out by that Rusted-Out Car]:
	case $location[The Extreme Slope]:
	case $location[Lair of the Ninja Snowmen]:
	case $location[Sonofa Beach]:
	case $location[The Themthar Hills]:
	case $location[The Hatching Chamber]:
	case $location[The Feeding Chamber]:
	case $location[The Royal Guard Chamber]:
	case $location[The Filthworm Queen\'s Chamber]:
	case $location[Noob Cave]:
	case $location[The Smut Orc Logging Camp]:
	case $location[A-Boo Peak]:
	case $location[Twin Peak]:
	case $location[Oil Peak]:
	case $location[Itznotyerzitz Mine]:
	case $location[The Goatlet]:
	case $location[Mist-Shrouded Peak]:
	case $location[The Icy Peak]:
	case $location[The Penultimate Fantasy Airship]:
	case $location[The Castle in the Clouds in the Sky (Basement)]:
	case $location[The Castle in the Clouds in the Sky (Ground Floor)]:
	case $location[The Castle in the Clouds in the Sky (Top Floor)]:
	case $location[The Hole in the Sky]:
	case $location[Fastest Adventurer Contest]:
	case $location[Smartest Adventurer Contest]:
	case $location[Hottest Adventurer Contest]:
	case $location[Barf Mountain]:
	case $location[The Bubblin\' Caldera]:
	case $location[The X-32-F Combat Training Snowman]:
	case $location[Through the Spacegate]:
	case $location[A Maze of Sewer Tunnels]:
	case $location[The Ice Hotel]:
	case $location[Whitey\'s Grove]:
	case $location[Gingerbread Upscale Retail District]:
	case $location[The Haiku Dungeon]:
	case $location[The Limerick Dungeon]:
	case $location[The Skeleton Store]:
	case $location[The Overgrown Lot]:
	case $location[The Secret Government Laboratory]:
	case $location[The Velvet / Gold Mine]:
	case $location[The Copperhead Club]:
	case $location[A Mob Of Zeppelin Protesters]:
	case $location[The Red Zeppelin]:
	case $location[The Bandit Crossroads]:
	case $location[The Towering Mountains]:
	case $location[The Mystic Wood]:
	case $location[The Putrid Swamp]:
	case $location[The Cursed Village]:
	case $location[The Sprawling Cemetary]:
	default:
*/
