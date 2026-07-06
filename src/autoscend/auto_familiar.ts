import { Familiar, Item, Location, Monster, Slot, abort, availableAmount, equip, equippedItem, familiarEquippedEquipment, familiarWeight, floor, getMonsters, getProperty, haveFamiliar, inHardcore, inTerrarium, isInteger, itemAmount, monsterHp, myAscensions, myBjornedFamiliar, myEnthronedFamiliar, myFamiliar, myLevel, myMaxmp, myMeat, myMp, numericModifier, runChoice, setProperty, splitString, toBoolean, toFamiliar, toInt, useFamiliar, visitUrl, weightAdjustment } from "kolmafia";
import { auto_spleenFamiliarAdvItemsPossessed, spleen_left } from "./auto_consume";
import { autoEquip, autoEquip$1, possessEquipment, possessOutfit$1 } from "./auto_equipment";
import { auto_check_conditions, auto_combat_appearance_rates, auto_combat_appearance_rates$1, auto_is_valid$1, auto_log_debug$1, auto_log_error, auto_log_info$1, auto_turbo, internalQuestStatus, trim } from "./auto_util";
import { fileAsMap } from "./utils/kolmafiaUtils";
import { considerGrimstoneGolem } from "./iotms/mr2014";
import { auto_checkFamiliarMummery, mummifyFamiliar$2 } from "./iotms/mr2017";
import { catBurglarHeistDesires, catBurglarHeistsLeft } from "./iotms/mr2018";
import { auto_hasStillSuit, auto_haveGreyGoose } from "./iotms/mr2022";
import { auto_availableBrickRift, auto_forceEagle, auto_handleJillOfAllTrades, auto_haveCCSC } from "./iotms/mr2023";
import { auto_haveCupidBow } from "./iotms/mr2025";
import { isActuallyEd } from "./paths/actually_ed_the_undying";
import { amw_wantMeat, in_amw } from "./paths/adventurer_meats_world";
import { in_avantGuard } from "./paths/avant_guard";
import { is_boris } from "./paths/avatar_of_boris";
import { is_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { is_pete } from "./paths/avatar_of_sneaky_pete";
import { in_bhy } from "./paths/bees_hate_you";
import { in_darkGyffte } from "./paths/dark_gyffte";
import { in_heavyrains } from "./paths/heavy_rains";
import { kolhs_mandatorySchool } from "./paths/kolhs";
import { in_lta } from "./paths/license_to_adventure";
import { in_lowkeysummer } from "./paths/low_key_summer";
import { in_pokefam } from "./paths/pocket_familiars";
import { in_quantumTerrarium } from "./paths/quantum_terrarium";
import { in_robot } from "./paths/you_robot";
import { AshMatcher } from "./utils/kolmafiaUtils";

//Defined in autoscend/auto_familiar.ash
export function is100FamRun(): boolean
{
	// answers the question of "is this a 100% familiar run"

	if (toFamiliar(getProperty("auto_100familiar")) === Familiar.none)
	{
		return false;
	}
	// if you reached this line, then it means that auto_100familiar is set to some specific familiar.
	return true;
}

export function doNotBuffFamiliar100Run(): boolean
{
	//indicates that we are in a 100% familiar run with a familiar that should not be buffed. Either because it hinders you or is useless.
	//this list was last updated after ghost of crimbo commerce familiar was added.
	if (!is100FamRun())
	{
		return false;
	}
	const hundred_fam: Familiar = toFamiliar(getProperty("auto_100familiar"));
	//these familiars always harm you and never aid you
	if (Familiar.get(["Black Cat", "O.A.F."]).includes(hundred_fam))
	{
		return true;
	}
	//these familiars sometimes harm you and sometimes attack the enemy
	if (Familiar.get(["Fuzzy Dice", "Stab Bat", "Killer Bee", "Scary Death Orb", "RoboGoose"]).includes(hundred_fam))
	{
		return true;
	}
	//these familiars do not actively hinder you. insead they simply do nothing. should not be buffed to save on MP.
	if (Familiar.get(["Pet Rock", "Toothsome Rock", "Bulky Buddy Box", "Holiday Log", "Homemade Robot", "Software Bug", "Bad Vibe", "Pet Coral"]).includes(hundred_fam))
	{
		return true;
	}

	return false;
}

export function isAttackFamiliar(fam: Familiar): boolean
{
	//is the familiar called fam able to deal damage to the enemy
	if (fam.physicalDamage || fam.elementalDamage)
	{
		return true;
	}
	//these familiars vary by configuration. TODO actually check their configuration
	if (Familiar.get(["Mini-Crimbot",
	"El Vibrato Megadrone",
	"Reanimated Reanimator",
	"Comma Chameleon",
	"Mad Hatrack",
	"Fancypants Scarecrow"]).includes(fam))
	{
		return true;
	}
	if (fam === Familiar.get("Mini-Adventurer"))
	{
		const miniAdvClass: number = toInt(getProperty("miniAdvClass"));
		if (miniAdvClass === 1 || miniAdvClass === 2 && myLevel() >= 5 || miniAdvClass === 3 && myLevel() >= 15 || miniAdvClass === 4 && myLevel() >= 5 || miniAdvClass === 5 && myLevel() >= 10)
		{ //disco bandit
		//seal clubber
		//turtle tamer
		//pastamancer
		//sauceror
			return true;
		}
		return false;
	}
	if (fam === Familiar.get("Reagnimated Gnome"))
	{
		//can be an attack familiar with this part equipped
		//todo: is it possible to know if it will be equipped after this check?
		if (possessEquipment(Item.get("gnomish athlete's foot")))
		{
			return true;
		}
		//but not if the part is not even owned
		return false;
	}

	if (Familiar.get(["Doppelshifter", //random familiar every fight. can be an attack familiar
	"Dandy Lion" //attacks if you equip a whip.
	]).includes(fam))
	{
		return true;
	}

	return false;
}

export function auto_famKill(fam: Familiar, place: Location): boolean
{
	if (!isAttackFamiliar(fam))
	{
		return false;
	}

	const passiveDamage: number = toInt(numericModifier("Damage Aura") + numericModifier("Sporadic Damage Aura ") + numericModifier("Thorns") + numericModifier("Sporadic Thorns"));

	for (const [mon, freq] of auto_combat_appearance_rates$1(place))
	{
		if (freq <= 0) { continue; }
		//Mafia doesn't output the expected damage of the familiar so going with the highest possible for most users (NPZR)
		if (mon !== Monster.none && monsterHp(mon) < floor(1.5 * (auto_famWeight$1(fam) + 3)) + passiveDamage)
		{
			return true;
		}
	}
	return false;
}

export function pathHasFamiliar(): boolean
{ // check for cases where the path bans traditional familiars.
	if (is_boris() || is_jarlsberg() || is_pete() || isActuallyEd() || in_darkGyffte() || in_lta() || in_pokefam())
	{
		return false;
	}
	//You, Robot has familiars... but only if your head attachment is set to birdcage.
	if (in_robot() && toInt(getProperty("youRobotTop")) !== 2)
	{
		return false; //our top is not currently set to birdcage so familiars are disabled.
	}

	return true;
}

export function pathAllowsChangingFamiliar(): boolean
{
		if (!pathHasFamiliar())
		{
			return false;
		}
		// path check for case(s) where Path has familiars but forces you to use one of its choice
		if (in_quantumTerrarium())
		{
			return false;
		}

	return true;
}

export function auto_have_familiar(fam: Familiar): boolean
{
	if (!pathHasFamiliar())
	{
		return false;
	}
	if (!auto_is_valid$1(fam))
	{
		return false;
	}
	//handle blacklisting of familiars by users
	const blacklist: Map<Familiar, number> = new Map();
	if (getProperty("auto_blacklistFamiliar") !== "")
	{
		const noFams: Map<number, string> = new Map(splitString(getProperty("auto_blacklistFamiliar"), ";").map((_v, _i) => [_i, _v]));
		for (const [index, fam_1] of noFams)
		{
			blacklist.set(toFamiliar(trim(fam_1)), 1);
		}
	}
	if (blacklist.has(fam))
	{
		return false;
	}

	return haveFamiliar(fam);
}

export function canChangeFamiliar(): boolean
{
	// answers the question "am I allowed to change familiar?" in the general sense

	if (!pathHasFamiliar() || !pathAllowsChangingFamiliar())
	{
		return false;
	}

	if (is100FamRun())
	{
		return false;
	}

	if (toBoolean(getProperty("auto_disableFamiliarChanging")))
	{
		return false;
	}

	return true;
}

export function canChangeToFamiliar(target: Familiar): boolean
{
	// answers the question of "am I allowed to change familiar to a familiar named target"

	if (myFamiliar() === target)
	{
		return true;
	}

	if (toBoolean(getProperty("auto_disableFamiliarChanging")))
	{
		return false;
	}
	// if you don't have a familiar, you can't change to it.
	if (!auto_have_familiar(target))
	{
		return false;
	}
	// if this path doesn't allow this familiar, you can't change to it
	if (!auto_is_valid$1(target))
	{
		return false;
	}
	// You are allowed to change to a familiar if it is also the goal of the current 100% run.
	if (toFamiliar(getProperty("auto_100familiar")) === target)
	{
		return true;
	}
	//kolhs specific check that needs to go here specifically. can not take familiars >10 lbs base weight into school zone.
	if (kolhs_mandatorySchool() || getProperty(
	//we are in kolhs and are adventuring in a school zone
	"_NC772_directive") !== "")
	{ //we are in kolhs and doing saved by the bell NC
		if (target !== Familiar.get("Steam-Powered Cheerleader") && familiarWeight(
		//sole exception to the rule
		target) > 10)
		{
			return false;
		}
	}
	// Avant Guard specific allowance of familiars for non-adv.php zones
	if (in_avantGuard())
	{
		if (Familiar.get("Burly Bodyguard") === target)
		{
			return true; // always allowed
		}
		else if (toBoolean(getProperty("auto_nonAdvLoc")))
		{
			if (Familiar.get("Gelatinous Cubeling") === target && inHardcore())
			{
				return true; // don't need Gel Cube in Normal
			}
			else if (Familiar.get(["Cookbookbat", "Mini Kiwi"]).includes(target))
			{
				return true; // might be worth farming some of these drops if we can?
			}
		}
		return false;
	}
	// Don't allow switching to a target of none.
	if (target === Familiar.none)
	{
		return false;
	}
	// You are allowed to use your /current/ familiar in Quantum Terrarium runs.
	if (target === myFamiliar() && in_quantumTerrarium())
	{
		return true;
	}
	// check path limitations, as well as 100% runs for a different familiar than target
	if (!canChangeFamiliar())
	{
		return false;
	}
	// If target is in the Crown of Thrones or Buddy Bjorn, we can't switch to it either.
	if (target === myEnthronedFamiliar() || target === myBjornedFamiliar())
	{
		return false;
	}
	// if you reached this point, then auto_100familiar must not be set to anything, you are allowed to change familiar.
	return true;
}

let $_findNonRockFamiliarInTerrarium_blacklistFamiliars: Familiar[] | undefined;

export function findNonRockFamiliarInTerrarium(): Familiar
{
	$_findNonRockFamiliarInTerrarium_blacklistFamiliars ??= Familiar.get(["Pet Rock",
		"Toothsome Rock",
		"Bulky Buddy Box",
		"Holiday Log",
		"Software Bug",
		"Bad Vibe",
		"Pet Coral",
		"Synthetic Rock",
		"Pixel Rock"]);

	for (const fam of Familiar.get(["Mosquito", "Leprechaun", "Levitating Potato", "Angry Goat", "Sabre-Toothed Lime", "Fuzzy Dice", "Spooky Pirate Skeleton", "Barrrnacle", "Howling Balloon Monkey", "Stab Bat", "Grue", "Blood-Faced Volleyball", "Ghuol Whelp", "Baby Gravy Fairy", "Cocoabo", "Star Starfish", "Hovering Sombrero", "Ghost Pickle on a Stick", "Killer Bee", "Whirling Maple Leaf", "Coffee Pixie", "Cheshire Bat", "Jill-O-Lantern", "Hand Turkey", "Crimbo Elf", "Hanukkimbo Dreidl", "Baby Yeti", "Feather Boa Constrictor", "Emo Squid", "Personal Raincloud", "Clockwork Grapefruit", "MagiMechTech MicroMechaMech", "Flaming Gravy Fairy", "Frozen Gravy Fairy", "Stinky Gravy Fairy", "Spooky Gravy Fairy", "Inflatable Dodecapede", "Pygmy Bugbear Shaman", "Doppelshifter", "Attention-Deficit Demon", "Cymbal-Playing Monkey", "Temporal Riftlet", "Sweet Nutcracker", "Pet Rock", "Snowy Owl", "Teddy Bear", "Ninja Pirate Zombie Robot", "Sleazy Gravy Fairy", "Wild Hare", "Wind-up Chattering Teeth", "Spirit Hobo", "Astral Badger", "Comma Chameleon", "Misshapen Animal Skeleton", "Scary Death Orb", "Jitterbug", "Nervous Tick", "Reassembled Blackbird", "Origami Towel Crane", "Ninja Snowflake", "Evil Teddy Bear", "Toothsome Rock", "Ancient Yuletide Troll", "Dandy Lion", "O.A.F.", "Penguin Goodfella", "Jumpsuited Hound Dog", "Green Pixie", "Ragamuffin Imp", "Exotic Parrot", "Wizard Action Figure", "Gluttonous Green Ghost", "Casagnova Gnome", "Hunchbacked Minion", "Crimbo P. R. E. S. S. I. E.", "Bulky Buddy Box", "Teddy Borg", "RoboGoose", "El Vibrato Megadrone", "Mad Hatrack", "Adorable Seal Larva", "Untamed Turtle", "Animated Macaroni Duck", "Pet Cheezling", "Autonomous Disco Ball", "Mariachi Chihuahua", "Hobo Monkey", "Llama Lama", "Cotton Candy Carnie", "Disembodied Hand", "Black Cat", "Uniclops", "Psychedelic Bear", "Baby Mutant Rattlesnake", "Mutant Fire Ant", "Mutant Cactus Bud", "Mutant Gila Monster", "Cuddlefish", "Sugar Fruit Fairy", "Imitation Crab", "Pair of Ragged Claws", "Magic Dragonfish", "Frumious Bandersnatch", "Midget Clownfish", "Syncopated Turtle", "Grinning Turtle", "Purse Rat", "Wereturtle", "Baby Sandworm", "Slimeling", "He-Boulder", "Rock Lobster", "Urchin Urchin", "Grouper Groupie", "Squamous Gibberer", "Dancing Frog", "Chauvinist Pig", "Stocking Mimic", "Snow Angel", "Jack-in-the-Box", "BRICKO chick", "Baby Bugged Bugbear", "Money-Making Goblin", "Floating Eye", "Vampire Bat", "Oyster Bunny", "Egg Benedict", "Bank Piggy", "Worm Doctor", "Snowhitman", "Plastic Grocery Bag", "Underworld Bonsai", "Rogue Program", "Mini-Hipster", "Pottery Barn Owl", "Hippo Ballerina", "Knob Goblin Organ Grinder", "Piano Cat", "Dramatic Hedgehog", "Smiling Rat", "Robot Reindeer", "Holiday Log", "Obtuse Angel", "Reconstituted Crow", "Li'l Xenomorph", "Dataspider", "Pair of Stomping Boots", "Feral Kobold", "Fancypants Scarecrow", "Bloovian Groose", "Blavious Kloop", "Peppermint Rhino", "Tickle-Me Emilio", "Steam-Powered Cheerleader", "Happy Medium", "Artistic Goth Kid", "Flaming Face", "Reagnimated Gnome", "Hovering Skull", "Mini-Skulldozer", "Angry Jung Man", "Unconscious Collective", "Nanorhino", "Oily Woim", "Homemade Robot", "MiniMechaElf", "Gelatinous Cubeling", "Adorable Space Buddy", "Nosy Nose", "Mini-Adventurer", "Mechanical Songbird", "Reanimated Reanimator", "Warbear Drone", "Grimstone Golem", "Grim Brother", "Miniature Sword & Martini Guy", "Putty Buddy", "Twitching Space Critter", "Galloping Grill", "Helix Fossil", "Xiblaxian Holo-Companion", "Baby Z-Rex", "Fist Turkey", "Crimbo Shrub", "Mini-Crimbot", "Topiary Skunk", "Golden Monkey", "Adventurous Spelunker", "Sludgepuppy", "Baby Mayonnaise Wasp", "Puck Man", "Ms. Puck Man", "Lil' Barrel Mimic", "Machine Elf", "Choctopus", "Rockin' Robin", "Restless Cow Skull", "Intergnat", "Software Bug", "Bark Scorpion", "Trick-or-Treating Tot", "Chocolate Lab", "Bad Vibe", "Space Jellyfish", "Optimistic Candle", "Robortender", "Cute Meteor", "XO Skeleton", "Garbage Fire", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "God Lobster", "Cat Burglar", "Party Mouse", "Yule Hound", "Sausage Golem", "Elf Operative", "Plastic Pirate Skull", "Pet Coral", "Pocket Professor", "Red-Nosed Snapper", "Antique Nutcracker", "Piranha Plant", "Left-Hand Man", "Melodramedary", "Ghost of Crimbo Carols", "Ghost of Crimbo Cheer", "Ghost of Crimbo Commerce", "Shorter-Order Cook", "Vampire Vintner", "Arachnelf", "Synthetic Rock", "Grey Goose", "Cookbookbat", "Mini-Trainbot", "Hobo in Sheep's Clothing", "Pixel Rock", "Patriotic Eagle", "Jill-of-All-Trades", "Flaming Leafcutter Ant", "Rigging Snake", "Pet Anchor", "Chest Mimic", "Mini Kiwi", "Proto-Protozoa", "Evolving Organism", "Burly Bodyguard", "Doll Moll", "Emberiza Aureola", "Peace Turkey", "Quantum Entangler", "Golden Pet Rock", "Profane Parrot", "Significant Bit", "Heat Wave", "Cold Cut", "Shame Spiral", "Phantom Limb", "Foul Ball", "Dire Cassava", "Observer", "Cool Cucumber", "Defective Childrens' Stapler", "Glover", "Zapper Bug", "Wet Paper Tiger", "Cooler Yeti", "Baby Skeleton", "Skeleton of Crimbo Past", "Tiny Plastic Santa Claus Skeleton", "Cute Skeletal Dinosaur", "Sword of S Words"]))
	{
		if ($_findNonRockFamiliarInTerrarium_blacklistFamiliars.includes(fam))
		{
			continue;
		}
		if (inTerrarium(fam) && haveFamiliar(fam))
		{
			return fam;
		}
	}
	return Familiar.none;
}

let $_findRockFamiliarInTerrarium_petRockFamiliars: Familiar[] | undefined;

export function findRockFamiliarInTerrarium(): Familiar
{
	$_findRockFamiliarInTerrarium_petRockFamiliars ??= Familiar.get(["Pet Rock",
		"Toothsome Rock",
		"Bulky Buddy Box",
		"Holiday Log",
		"Software Bug",
		"Bad Vibe",
		"Pet Coral",
		"Synthetic Rock",
		"Pixel Rock"]);

	for (const fam of Familiar.get(["Mosquito", "Leprechaun", "Levitating Potato", "Angry Goat", "Sabre-Toothed Lime", "Fuzzy Dice", "Spooky Pirate Skeleton", "Barrrnacle", "Howling Balloon Monkey", "Stab Bat", "Grue", "Blood-Faced Volleyball", "Ghuol Whelp", "Baby Gravy Fairy", "Cocoabo", "Star Starfish", "Hovering Sombrero", "Ghost Pickle on a Stick", "Killer Bee", "Whirling Maple Leaf", "Coffee Pixie", "Cheshire Bat", "Jill-O-Lantern", "Hand Turkey", "Crimbo Elf", "Hanukkimbo Dreidl", "Baby Yeti", "Feather Boa Constrictor", "Emo Squid", "Personal Raincloud", "Clockwork Grapefruit", "MagiMechTech MicroMechaMech", "Flaming Gravy Fairy", "Frozen Gravy Fairy", "Stinky Gravy Fairy", "Spooky Gravy Fairy", "Inflatable Dodecapede", "Pygmy Bugbear Shaman", "Doppelshifter", "Attention-Deficit Demon", "Cymbal-Playing Monkey", "Temporal Riftlet", "Sweet Nutcracker", "Pet Rock", "Snowy Owl", "Teddy Bear", "Ninja Pirate Zombie Robot", "Sleazy Gravy Fairy", "Wild Hare", "Wind-up Chattering Teeth", "Spirit Hobo", "Astral Badger", "Comma Chameleon", "Misshapen Animal Skeleton", "Scary Death Orb", "Jitterbug", "Nervous Tick", "Reassembled Blackbird", "Origami Towel Crane", "Ninja Snowflake", "Evil Teddy Bear", "Toothsome Rock", "Ancient Yuletide Troll", "Dandy Lion", "O.A.F.", "Penguin Goodfella", "Jumpsuited Hound Dog", "Green Pixie", "Ragamuffin Imp", "Exotic Parrot", "Wizard Action Figure", "Gluttonous Green Ghost", "Casagnova Gnome", "Hunchbacked Minion", "Crimbo P. R. E. S. S. I. E.", "Bulky Buddy Box", "Teddy Borg", "RoboGoose", "El Vibrato Megadrone", "Mad Hatrack", "Adorable Seal Larva", "Untamed Turtle", "Animated Macaroni Duck", "Pet Cheezling", "Autonomous Disco Ball", "Mariachi Chihuahua", "Hobo Monkey", "Llama Lama", "Cotton Candy Carnie", "Disembodied Hand", "Black Cat", "Uniclops", "Psychedelic Bear", "Baby Mutant Rattlesnake", "Mutant Fire Ant", "Mutant Cactus Bud", "Mutant Gila Monster", "Cuddlefish", "Sugar Fruit Fairy", "Imitation Crab", "Pair of Ragged Claws", "Magic Dragonfish", "Frumious Bandersnatch", "Midget Clownfish", "Syncopated Turtle", "Grinning Turtle", "Purse Rat", "Wereturtle", "Baby Sandworm", "Slimeling", "He-Boulder", "Rock Lobster", "Urchin Urchin", "Grouper Groupie", "Squamous Gibberer", "Dancing Frog", "Chauvinist Pig", "Stocking Mimic", "Snow Angel", "Jack-in-the-Box", "BRICKO chick", "Baby Bugged Bugbear", "Money-Making Goblin", "Floating Eye", "Vampire Bat", "Oyster Bunny", "Egg Benedict", "Bank Piggy", "Worm Doctor", "Snowhitman", "Plastic Grocery Bag", "Underworld Bonsai", "Rogue Program", "Mini-Hipster", "Pottery Barn Owl", "Hippo Ballerina", "Knob Goblin Organ Grinder", "Piano Cat", "Dramatic Hedgehog", "Smiling Rat", "Robot Reindeer", "Holiday Log", "Obtuse Angel", "Reconstituted Crow", "Li'l Xenomorph", "Dataspider", "Pair of Stomping Boots", "Feral Kobold", "Fancypants Scarecrow", "Bloovian Groose", "Blavious Kloop", "Peppermint Rhino", "Tickle-Me Emilio", "Steam-Powered Cheerleader", "Happy Medium", "Artistic Goth Kid", "Flaming Face", "Reagnimated Gnome", "Hovering Skull", "Mini-Skulldozer", "Angry Jung Man", "Unconscious Collective", "Nanorhino", "Oily Woim", "Homemade Robot", "MiniMechaElf", "Gelatinous Cubeling", "Adorable Space Buddy", "Nosy Nose", "Mini-Adventurer", "Mechanical Songbird", "Reanimated Reanimator", "Warbear Drone", "Grimstone Golem", "Grim Brother", "Miniature Sword & Martini Guy", "Putty Buddy", "Twitching Space Critter", "Galloping Grill", "Helix Fossil", "Xiblaxian Holo-Companion", "Baby Z-Rex", "Fist Turkey", "Crimbo Shrub", "Mini-Crimbot", "Topiary Skunk", "Golden Monkey", "Adventurous Spelunker", "Sludgepuppy", "Baby Mayonnaise Wasp", "Puck Man", "Ms. Puck Man", "Lil' Barrel Mimic", "Machine Elf", "Choctopus", "Rockin' Robin", "Restless Cow Skull", "Intergnat", "Software Bug", "Bark Scorpion", "Trick-or-Treating Tot", "Chocolate Lab", "Bad Vibe", "Space Jellyfish", "Optimistic Candle", "Robortender", "Cute Meteor", "XO Skeleton", "Garbage Fire", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "God Lobster", "Cat Burglar", "Party Mouse", "Yule Hound", "Sausage Golem", "Elf Operative", "Plastic Pirate Skull", "Pet Coral", "Pocket Professor", "Red-Nosed Snapper", "Antique Nutcracker", "Piranha Plant", "Left-Hand Man", "Melodramedary", "Ghost of Crimbo Carols", "Ghost of Crimbo Cheer", "Ghost of Crimbo Commerce", "Shorter-Order Cook", "Vampire Vintner", "Arachnelf", "Synthetic Rock", "Grey Goose", "Cookbookbat", "Mini-Trainbot", "Hobo in Sheep's Clothing", "Pixel Rock", "Patriotic Eagle", "Jill-of-All-Trades", "Flaming Leafcutter Ant", "Rigging Snake", "Pet Anchor", "Chest Mimic", "Mini Kiwi", "Proto-Protozoa", "Evolving Organism", "Burly Bodyguard", "Doll Moll", "Emberiza Aureola", "Peace Turkey", "Quantum Entangler", "Golden Pet Rock", "Profane Parrot", "Significant Bit", "Heat Wave", "Cold Cut", "Shame Spiral", "Phantom Limb", "Foul Ball", "Dire Cassava", "Observer", "Cool Cucumber", "Defective Childrens' Stapler", "Glover", "Zapper Bug", "Wet Paper Tiger", "Cooler Yeti", "Baby Skeleton", "Skeleton of Crimbo Past", "Tiny Plastic Santa Claus Skeleton", "Cute Skeletal Dinosaur", "Sword of S Words"]))
	{
		if (inTerrarium(fam) && haveFamiliar(fam) && $_findRockFamiliarInTerrarium_petRockFamiliars.includes(fam))
		{
			return fam;
		}
	}
	return Familiar.none;
}

export function lookupFamiliarDatafile(type_1: string): Familiar
{
	//This function looks through /data/autoscend_familiars.txt for the matching "type" in order and selects the first match whose conditions are met. Said conditions typically include path exclusions and a check to see if that familiar dropped something today.
	//we do not want a fallback here. if no matching familiar is found then do nothing here, a familiar will be automatically set in pre adventure

	auto_log_debug$1(`lookupFamiliarDatafile is checking for type [${type_1}]`);
	// store what type of fam we are looking for
	setProperty("auto_lastFamiliarLookupType", type_1);
	const familiars_text: Map<string, Map<number, Map<string, string>>> = fileAsMap("autoscend_familiars.txt", [String, Number, String, String]);
	if (!familiars_text.size)
	{
		abort("Could not load /data/autoscend_familiars.txt");
	}
	for (const [i, _v0] of (familiars_text.get(type_1) ?? familiars_text.set(type_1, new Map()).get(type_1))) {
		for (const [name, _v1] of _v0) {
			const conds = _v1;
		const thisFamiliar: Familiar = toFamiliar(name);
		if (thisFamiliar === Familiar.none)
		{
			if (name !== "none")
			{
				auto_log_error(`lookupFamiliarDatafile failed to convert string [${name}] to familiar`);
				auto_log_error(`${type_1}; ${i}; ${conds}`);
			}
			continue;
		}
		if (!auto_check_conditions(conds))
			{ //checks for the conditions specified in the data file
			continue; }
		if (!canChangeToFamiliar(thisFamiliar))
			{ //check various things that could prevent us from changing to it
			continue; }
		return thisFamiliar;
		}
	}
	//no suitable familiars found in datafile
	auto_log_debug$1(`Could not find any "${type_1}" type familiars!`);
	return Familiar.none;
}

export function handleFamiliar(type_1: string): boolean
{
	//This function calls familiar lookupFamiliarDatafile(string type) and if a result is found will send it over to handleFamiliar(familiar fam) so it can be set as our target familiar to be used during pre adventure.
	//we do not want a fallback here. if no matching familiar is found then do nothing here, a familiar will be automatically set in pre adventure

	if (toBoolean(getProperty("auto_disableFamiliarChanging")))
	{
		return false; //familiar changing temporarily disabled.
	}
	if (!pathHasFamiliar() || !pathAllowsChangingFamiliar())
	{
		return false;
	}

	const target: Familiar = lookupFamiliarDatafile(type_1);

	if (target !== Familiar.none)
	{
		return handleFamiliar$1(target);
	}
	return false;
}

export function handleFamiliar$1(fam: Familiar): boolean
{
	//This function takes a specific named familiar and sets it as our target familiar. To be changed during pre_adventure.

	if (!pathHasFamiliar() || !pathAllowsChangingFamiliar())
	{
		return false;
	}
	if (fam === Familiar.none)
	{
		return false;
	}
	if (toFamiliar(getProperty("auto_familiarChoice")) === fam)
	{ //this should go after $familiar[none] check
		return true; //desired target is already set as the familiar I will be switching to.
	}
	//[Ms. Puck Man] and [Puck Man] are interchangeable. so interchange them if needed.
	if (fam === Familiar.get("Ms. Puck Man") && !auto_have_familiar(Familiar.get("Ms. Puck Man")) && auto_have_familiar(Familiar.get("Puck Man")))
	{
		fam = Familiar.get("Puck Man");
	}
	if (fam === Familiar.get("Puck Man") && !auto_have_familiar(Familiar.get("Puck Man")) && auto_have_familiar(Familiar.get("Ms. Puck Man")))
	{
		fam = Familiar.get("Ms. Puck Man");
	}

	if (!canChangeToFamiliar(fam))
	{
		return false;
	}
	//bjorning has priority
	if (myBjornedFamiliar() === fam)
	{
		return false;
	}

	setProperty("auto_familiarChoice", fam.toString());
	setProperty("_auto_thisLoopHandleFamiliar", true.toString());
	return true;
}

function autoChooseFamiliar(place: Location): boolean
{
	//if no familiar target was set this loop. then automatically determine which familiar to use

	if (toBoolean(getProperty("auto_disableFamiliarChanging")))
	{
		return false;
	}
	if (!pathHasFamiliar() || !pathAllowsChangingFamiliar())
	{
		return false; //will just error in those paths
	}
	const familiar_target_100: Familiar = toFamiliar(getProperty("auto_100familiar"));
	if (familiar_target_100 !== Familiar.none)
	{
		return handleFamiliar$1(familiar_target_100); //do not break 100 familiar runs
	}
	// Can only use burly bodyguard, except in non-adventure.php zones. In those, we want the Gelatinous Cubeling for Daily Dungeon drops
	if (in_avantGuard())
	{
		if (toBoolean(getProperty("auto_nonAdvLoc")))
		{
			if (wantCubeling())
			{
				return handleFamiliar$1(Familiar.get("Gelatinous Cubeling"));
			}
			else {
				for (const fam of Familiar.get(["Cookbookbat", "Mini Kiwi", "Hobo in Sheep's Clothing"]))
				{
					if (canChangeToFamiliar(fam))
					{
						return handleFamiliar$1(fam);
					}
				}
			}
		}
		return handleFamiliar$1(Familiar.get("Burly Bodyguard"));
	}
	//High priority checks that are too complicated for the datafile
	let famChoice: Familiar = Familiar.none;
	// Blackbird/Crow cut turns in the Black Forest but we only need to equip them
	// if we don't have them in inventory.
	if (Location.get("The Black Forest") === place)
	{
		if (!in_bhy())
		{
			if (itemAmount(Item.get("reassembled blackbird")) === 0 && canChangeToFamiliar(Familiar.get("Reassembled Blackbird")))
			{
				famChoice = Familiar.get("Reassembled Blackbird");
			}
		}
		else {
			if (itemAmount(Item.get("reconstituted crow")) === 0 && canChangeToFamiliar(Familiar.get("Reconstituted Crow")))
			{
				famChoice = Familiar.get("Reconstituted Crow");
			}
		}
	}
	// Gremlins have special familiar handling.
	if (Location.get(["Next to that Barrel with Something Burning in it", "Out by that Rusted-Out Car", "Over Where the Old Tires Are", "Near an Abandoned Refrigerator"]).includes(place)) {
		famChoice = lookupFamiliarDatafile("gremlins");
	}
	// places where item drop is required to help save adventures.
	if (Location.get(["Guano Junction", "The Beanbat Chamber", "Cobb's Knob Harem", "The Goatlet", "Itznotyerzitz Mine",
	"Twin Peak", "The Penultimate Fantasy Airship", "The Hidden Temple", "The Hidden Bowling Alley", "The Haunted Wine Cellar",
	"The Haunted Laundry Room", "The Copperhead Club", "A Mob of Zeppelin Protesters", "Whitey's Grove", "The Oasis", "The Middle Chamber",
	"The Orcish Frat House", "The Hippy Camp", "The Hatching Chamber",
	"The Feeding Chamber", "The Royal Guard Chamber", "The Hole in the Sky", "Hero's Field", "The Degrassi Knoll Garage", "The Old Landfill",
	"The Laugh Floor", "Infernal Rackets Backstage"]).includes(place)) {
		famChoice = lookupFamiliarDatafile("item");
	}
	if (place === Location.get("Inside the Palindome") && itemAmount(Item.get("stunt nuts")) === 0 && itemAmount(Item.get("wet stunt nut stew")) === 0) {
		famChoice = lookupFamiliarDatafile("item");
	}
	if (place === Location.get("The Red Zeppelin") && internalQuestStatus("questL11Ron") < 4) {
		famChoice = lookupFamiliarDatafile("item"); //not useful for Ron Copperhead
	}
	if (place === auto_availableBrickRift()) {
		famChoice = lookupFamiliarDatafile("item"); // get more shadow bricks
	}
	if (Location.get("The Defiled Cranny") === place && auto_turbo() && itemAmount(Item.get("dieting pill")) + toInt(getProperty("auto_dietpills")) < 3)
	{
		famChoice = lookupFamiliarDatafile("item"); // get dieting pills faster if in turbo
	}
	// If we're down to 1 evilness left before the boss in the Nook, it doesn't matter if we get an Evil Eye or not.
	if (Location.get("The Defiled Nook") === place && toInt(getProperty("cyrptNookEvilness")) > 14)
	{
		famChoice = lookupFamiliarDatafile("item");
	}
	// only need +item in the pirates cove if we're faming the outfit (may be farming insults here or getting the key in LKS otherwise)
	if (Location.get("The Obligatory Pirate's Cove") === place && !possessOutfit$1("Swashbuckling Getup")) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// Only need +item in the F'c'le if we're getting the fledges (could still be getting the key in LKS)
	if (Location.get("The F'c'le") === place && internalQuestStatus("questM12Pirate") < 6) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// if we somehow end up in The Valley of Rof L'm Fao might as well try to get N
	if (Location.get("The Valley of Rof L'm Fao") === place && itemAmount(Item.get("lowercase N")) === 0 && itemAmount(Item.get("ND")) === 0 && itemAmount(Item.get("Wand of Nagamar")) === 0 && toBoolean(getProperty("auto_wandOfNagamar"))) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// the D is only individually useful in paths that also visit The Valley of Rof L\'m Fao for N
	// this is only in Low Key Summer for now, but can be in other paths if they get support: Journeyman, Grey You
	if (Location.get("The Castle in the Clouds in the Sky (Basement)") === place && itemAmount(Item.get("heavy D")) === 0 && itemAmount(Item.get("ND")) === 0 && itemAmount(Item.get("Wand of Nagamar")) === 0 && toBoolean(getProperty("auto_wandOfNagamar"))) {
		const wantTheD: boolean = in_lowkeysummer() && (itemAmount(Item.get("lowercase N")) > 0 || (Location.get("The Valley of Rof L'm Fao")).turnsSpent < 11); //!possessEquipment($item[Kekekey])
		if (wantTheD)
		{
			famChoice = lookupFamiliarDatafile("item");
		}
	}
	// The World's Biggest Jerk can send us here so only use +item if we're farming sonars.
	if (Location.get("The Batrat and Ratbat Burrow") === place && internalQuestStatus("questL04Bat") < 3 && auto_haveGreyGoose()) {
		auto_log_info$1("Bringing the Grey Goose to emit some drones at a bat to get Sonar.");
		famChoice = Familiar.get("Grey Goose");
	}
	else if (Location.get("The Batrat and Ratbat Burrow") === place && internalQuestStatus("questL04Bat") < 3) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// only need +item on the extreme slope if we're faming the outfit.
	if (Location.get("The eXtreme Slope") === place && !possessOutfit$1("eXtreme Cold-Weather Gear")) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// only use +item in A-Boo Peak when adventuring (so we don't accidentally override resistance familiars when doing The Horror).
	if (Location.get("A-Boo Peak") === place && toInt(getProperty("auto_aboopending")) === 0) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// only need +item at Oil Peak if we need Bubblin' Crude (TODO: it might be useful in HC for food?).
	if (Location.get("Oil Peak") === place && ((toInt(getProperty("twinPeakProgress")) & 4) === 0 && itemAmount(Item.get("jar of oil")) < 1 && itemAmount(Item.get("bubblin' crude")) < 12)) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// If we have Grey Goose and we're farming bridge parts and Smut Orc Pervert is coming up, we should use the Goose to dupe the Keepsake box
	if (Location.get("The Smut Orc Logging Camp") === place && internalQuestStatus("questL09Topping") < 1 && isInteger((((Location.get("The Smut Orc Logging Camp")).turnsSpent - 1) / 20).toString()) && auto_haveGreyGoose())
	{
		auto_log_info$1("Bringing the Grey Goose to emit some drones at smut orc pervert to dupe a Box.");
		famChoice = Familiar.get("Grey Goose");
	}
	// The World's Biggest Jerk can also send us here so only use +item if we're farming bridge parts.
	if (Location.get("The Smut Orc Logging Camp") === place && internalQuestStatus("questL09Topping") < 1) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// Killing jar saves adventures unlocking the Pyramid.
	if (Location.get("The Haunted Library") === place && itemAmount(Item.get("killing jar")) < 1 && (toInt(getProperty("gnasirProgress")) & 4) === 0 && toInt(getProperty("desertExploration")) < 100) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// +item helps if we still need the book of matches
	if (Location.get("The Hidden Park") === place && toInt(getProperty("hiddenTavernUnlock")) !== myAscensions()) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// only need +item in the war camps if we are farming the outfit.
	if (Location.get(["Wartime Frat House", "Wartime Hippy Camp"]).includes(place)) {
		if (!possessOutfit$1("Frat Warrior Fatigues") || !possessOutfit$1("War Hippy Fatigues")) {
			famChoice = lookupFamiliarDatafile("item");
		}
	}
	// want to ensure we get small gear. Only requires +100 item drop, fam essentially ensures this
	if (Location.get(["Fight in the Dirt", "Fight in the Tall Grass", "Fight in the Very Tall Grass"]).includes(place)) {
		famChoice = lookupFamiliarDatafile("item");
	}
	// places where meat drop is required to help save adventures.
	if (Location.get("The Themthar Hills") === place) {
		famChoice = lookupFamiliarDatafile("meat");
	}
	if (Location.get("The Fungus Plains") === place) {
		famChoice = lookupFamiliarDatafile("meat");
	}
	// places where initiative is required to help save adventures.
	if (Location.get("The Defiled Alcove") === place && toInt(getProperty("cyrptAlcoveEvilness")) > 14)
	{
		famChoice = lookupFamiliarDatafile("init");
	}
	if (Location.get("Vanya's Castle") === place)
	{
		famChoice = lookupFamiliarDatafile("init");
	}

	famChoice = auto_forceEagle(famChoice); // force Patriotic Eagle if we have a >0 combats until we can screech again
	//Gelatinous Cubeling drops items that save turns in the daily dungeon
	if (famChoice === Familiar.none && wantCubeling() && lookupFamiliarDatafile("item") !== Familiar.get("Gelatinous Cubeling"))
	{ // don't farm the drops if this is the best +item familiar we have. We will get them regardless.
		famChoice = Familiar.get("Gelatinous Cubeling");
	}
	//grab spleen consumables early if you do not have enough such items to fill up your spleen. Extras will be handled by "drop" datafile
	//Should take around 10 combats to grab enough on day 1 and on subsequent days you should already have them from previous days.
	if (famChoice === Familiar.none)
	{
		const available_spleen_items_size: number = 4 * auto_spleenFamiliarAdvItemsPossessed();

		if (spleen_left() >= 4 + available_spleen_items_size && haveSpleenFamiliar())
		{
			let spleenFamiliarsAvailable: number = 0;
			for (const fam of Familiar.get(["Baby Sandworm", "Rogue Program", "Pair of Stomping Boots", "Bloovian Groose", "Unconscious Collective", "Grim Brother", "Golden Monkey"]))
			{
				if (canChangeToFamiliar(fam))
				{
					spleenFamiliarsAvailable++;
				}
			}

			if (spleenFamiliarsAvailable > 0)
			{
				const spleen_drops_need: number = (spleen_left() + 3) / 4;
				const bound: number = (spleen_drops_need + spleenFamiliarsAvailable - 1) / spleenFamiliarsAvailable;
				for (const fam of Familiar.get(["Baby Sandworm", "Rogue Program", "Pair of Stomping Boots", "Bloovian Groose", "Unconscious Collective", "Grim Brother", "Golden Monkey"]))
				{
					if (fam.dropsToday < bound && canChangeToFamiliar(fam))
					{
						famChoice = fam;
						break;
					}
				}
			}
		}
	}
	//[grimstone mask] for an [ornate dowsing rod] for the desert. if still needed
	if (famChoice === Familiar.none && canChangeToFamiliar(Familiar.get("Grimstone Golem")) && !possessEquipment(Item.get("ornate dowsing rod")) && itemAmount(Item.get("odd silver coin")) < 5 && itemAmount(Item.get("grimstone mask")) === 0 && (Familiar.get("Grimstone Golem")).dropsToday < 1 && considerGrimstoneGolem(false))
	{
		famChoice = Familiar.get("Grimstone Golem");
	}
	// places where meat drop is desirable due to high meat drop monsters.
	if (Location.get(["The Boss Bat's Lair", "The Icy Peak", "The Filthworm Queen's Chamber", "Cobb's Knob Treasury"]).includes(place)) {
		famChoice = lookupFamiliarDatafile("meat");
	}
	if (place === Location.get("Mist-Shrouded Peak") && place.turnsSpent < 3) {
		famChoice = lookupFamiliarDatafile("meat"); //not useful for Groar
	}
	//if critically low on MP and meat. use restore familiar to avoid going bankrupt
	let poor: boolean = myMeat() < 1000;
	if (internalQuestStatus("questL11MacGuffin") < 2)
	{
		poor = myMeat() < 7000;
	}
	if (famChoice === Familiar.none && myMaxmp() > 50 && myMp() * 5 < myMaxmp() && poor)
	{
		famChoice = lookupFamiliarDatafile("regen");
	}
	//in meatpath, prioritize meat if meat is a constraint
	if (in_amw() && famChoice === Familiar.none && amw_wantMeat())
	{
		famChoice = lookupFamiliarDatafile("meat");
	}
	//select the best familiar that drops items directly. Will prioritize useful items and awesome+ food and drink and then other drops.
	if (famChoice === Familiar.none)
	{
		famChoice = lookupFamiliarDatafile("drop");
	}
	//If a fam was selected that is contrary to the Combat Rate we want, deselect it. Probably won't select it in stat or regen but user should get better free-ish fams if it does
	const famComRate: number = auto_famModifiers$1(famChoice, "Combat Rate");
	const plusCombatInMaximize: boolean = new AshMatcher("(?<!-)200 ?combat", getProperty("auto_maximize_current")).find();
	const minusCombatInMaximize: boolean = new AshMatcher("-200 ?combat", getProperty("auto_maximize_current")).find();
	if (minusCombatInMaximize && famComRate > 0)
	{
		famChoice = Familiar.none;
	}
	else if (plusCombatInMaximize && famComRate < 0)
	{
		famChoice = Familiar.none;
	}
	// Stats from combats makes runs go faster apparently, except in meatpath
	if (famChoice === Familiar.none && !in_amw() && (myLevel() < 13 || toBoolean(getProperty("auto_disregardInstantKarma")))) {
		famChoice = lookupFamiliarDatafile("stat");
	}
	// fallback to regen if nothing else. At worst the player will have something like a Ghuol Whelp or Starfish.
	if (famChoice === Familiar.none) {
		famChoice = lookupFamiliarDatafile("regen");
	}
	// in legacy of loathing, may only have 1 of the 2004 fams
	if (famChoice === Familiar.none) {
		for (const fam of Familiar.get(["Jill-O-Lantern", "Hand Turkey", "Crimbo Elf"]))
		{
			if (canChangeToFamiliar(fam))
			{
				famChoice = fam;
				break;
			}
		}
	}

	return handleFamiliar$1(famChoice);
}

export function haveSpleenFamiliar(): boolean
{
	for (const fam of Familiar.get(["Baby Sandworm", "Rogue Program", "Pair of Stomping Boots", "Bloovian Groose", "Unconscious Collective", "Grim Brother", "Golden Monkey"]))
	{
		if (auto_have_familiar(fam))
		{
			return true;
		}
	}
	return false;
}

export function wantCubeling(): boolean
{
	//do we still want to use a gelatinous cubeling familiar specifically for it to drop the daily dungeon tools
	if (!canChangeToFamiliar(Familiar.get("Gelatinous Cubeling")))
	{
		return false; //can not use it so we do not want it.
	}
	if (toInt(getProperty("cubelingProgress")) > 11)
	{
		return false; //cubeling already dropped tools in this ascension. It cannot drop more until you ascend again.
	}

	const need_lockpicks: boolean = itemAmount(Item.get("Pick-O-Matic lockpicks")) === 0 && itemAmount(Item.get("Platinum Yendorian Express Card")) === 0;
	const need_ring: boolean = !possessEquipment(Item.get("ring of Detect Boring Doors")); //do not try for a second one if you already have one
	const need_pole: boolean = !auto_haveCCSC() && itemAmount(Item.get("eleven-foot pole")) === 0;
	return need_pole || need_ring || need_lockpicks;
}

export function preAdvUpdateFamiliar(place: Location): void
{
	if (toBoolean(getProperty("auto_disableFamiliarChanging")))
	{
		return;
	}
	if (!pathHasFamiliar() || !pathAllowsChangingFamiliar())
	{
		return; //will just error in those paths
	}
	if (is100FamRun())
	{
		handleFamiliar$1(toFamiliar(getProperty("auto_100familiar"))); //do not break 100 familiar runs
	}
	//familiar requirement to adventure in a zone, override everything else.
	if (place === Location.get("The Deep Machine Tunnels"))
	{
		handleFamiliar$1(Familiar.get("Machine Elf"));
	}
	// Can't take familiars with you to FantasyRealm
	if (place === Location.get("The Bandit Crossroads"))
	{
		if (myFamiliar() === Familiar.none) { //avoid mafia error from trying to change none into none.
		return; }
		useFamiliar(Familiar.none);
		return; //no familiar means no equipment, we are done.
	}
	//if familiar not set yet, first check stealing familiar
	if (!toBoolean(getProperty("_auto_thisLoopHandleFamiliar")) && canChangeToFamiliar(Familiar.get("Cat Burglar")) && catBurglarHeistsLeft() > 0)
	{
		//Stealing with familiar. TODO add XO Skelton here too

		const heistDesires: Map<Monster, Item> = catBurglarHeistDesires();
		let wannaHeist: boolean = false;
		const apprates: Map<Monster, number> = auto_combat_appearance_rates(place, true);
		for (const [mon, it] of heistDesires)
		{
			for (const [i, mmon] of getMonsters(place).entries())
			{
				if ((apprates.get(mon) ?? apprates.set(mon, 0.0).get(mon)) <= 0) { //won't show up because banished or req's not fulfilled
				continue; }
				if (mmon === mon)
				{
					auto_log_debug$1(`Using cat burglar because we want to burgle a ${it} from ${mon}`);
					wannaHeist = true;
				}
			}
		}
		if (wannaHeist)
		{
			handleFamiliar$1(Familiar.get("Cat Burglar"));
		}
	}
	//if familiar not set choose a familiar using general logic
	if (!toBoolean(getProperty("_auto_thisLoopHandleFamiliar")))
	{ //check that we didn't already set familiar target this loop
		autoChooseFamiliar(place);
	}

	const famChoice: Familiar = toFamiliar(getProperty("auto_familiarChoice"));
	if (famChoice === Familiar.none)
	{
		if (getProperty("auto_familiarChoice") === "")
		{
			abort("void preAdvUpdateFamiliar failed because property auto_familiarChoice is empty for some reason");
		}
		abort(`void preAdvUpdateFamiliar failed to convert auto_familiarChoice of [${getProperty("auto_familiarChoice")}] into a $familiar`);
	}

	if (famChoice !== myFamiliar() && canChangeToFamiliar(famChoice))
	{
		useFamiliar(famChoice);
	}
	//familiar equipment overrides
	if (in_heavyrains())
	{
		if (famChoice !== Familiar.get("Left-Hand Man"))
		{
			autoEquip(Slot.get("familiar"), Item.get("miniature life preserver"));
		}
	}

	if (myFamiliar() === Familiar.get("Reagnimated Gnome"))
	{
		// This arena visit to obtain gnome familiar equips is turn free and can be done once a day.
		let visitArena: boolean = false;
		for (const it of Item.get(["gnomish swimmer's ears", "gnomish coal miner's lung", "gnomish tennis elbow", "gnomish housemaid's kgnee", "gnomish athlete's foot"]))
		{
			if (availableAmount(it) === 0)
			{
				visitArena = true;
				break;
			}
		}
		// only visit the cake-shaped arena if we need to pickup an equipment.
		if (!toBoolean(getProperty("_auto_gnomeArenaVisited")) && visitArena)
		{
			visitUrl("arena.php");
			runChoice(-1);
			setProperty("_auto_gnomeArenaVisited", "true");
		}
		autoEquip(Slot.get("familiar"), Item.get("gnomish housemaid's kgnee"));
	}

	if (myFamiliar() === Familiar.get("Baby Bugged Bugbear"))
	{
		if (!possessEquipment(Item.get("bugged beanie")))
		{
			// Once per day, if you don't have the Bugged Beanie equipped, in inventory or closet
			// you can get one for free by visiting the arena
			visitUrl("arena.php");
		}
	}

	if (myFamiliar() === Familiar.get("Trick-or-Treating Tot"))
	{
		if (Location.get(["A-Boo Peak", "The Haunted Kitchen"]).includes(place))
		{
			if (equippedItem(Slot.get("familiar")) !== Item.get("li'l candy corn costume"))
			{
				if (itemAmount(Item.get("li'l candy corn costume")) > 0)
				{
					equip(Slot.get("familiar"), Item.get("li'l candy corn costume"));
				}
			}
		}
	}

	if (myFamiliar() === Familiar.get("Jill-of-All-Trades") && possessEquipment(Item.get("LED candle")))
	{
		// maximizer uses whatever mode LED candle is in, won't change it
		// so ensure in correct mode prior to maximizing
		auto_handleJillOfAllTrades();
		autoEquip$1(Item.get("LED candle")); // force maximizer to equip it when we have it.
	}

	if (auto_checkFamiliarMummery(myFamiliar()))
	{
		mummifyFamiliar$2();
	}
}

export function auto_needsGoodFamiliarEquipment(): boolean {
	if (possessEquipment(Item.get("astral pet sweater"))) {
		return false;
	}
	if (auto_hasStillSuit()) {
		return false;
	}
	if (auto_haveCupidBow()) {
		return false;
	}
	return true;
}

function auto_famWeight(fam: Familiar, include_equip: boolean): number
{
	let famEquipWeight: number = 0;
	if (fam === Familiar.none)
	{
		return 0;
	}
	if (!include_equip)
	{
		famEquipWeight = toInt(numericModifier(familiarEquippedEquipment(fam), "Familiar Weight"));
	}
	return familiarWeight(fam) + weightAdjustment() - famEquipWeight;
}

export function auto_famWeight$1(fam: Familiar): number
{
	return auto_famWeight(fam, true);
}

export function auto_famWeight$2(): number
{
	return auto_famWeight(myFamiliar(), true);
}

export function auto_famModifiers(fam: Familiar, mod: string, famEquip: Item): number
{
	if (fam === Familiar.none)
	{
		return 0.0;
	}
	return numericModifier(fam, mod, auto_famWeight(fam, false), famEquip);
}

function auto_famModifiers$1(fam: Familiar, mod: string): number
{
	return numericModifier(fam, mod, auto_famWeight(fam, false), familiarEquippedEquipment(fam));
}

export function auto_famModifiers$2(mod: string): number
{
	const fam: Familiar = myFamiliar();
	return numericModifier(fam, mod, auto_famWeight(fam, false), familiarEquippedEquipment(fam));
}
