import { abort, availableAmount, canEat, canEquip, cliExecute, containsText, Effect, equip, equippedItem, Familiar, familiarEquippedEquipment, familiarWeight, getAutumnatonLocations, getLocketMonsters, getProperty, haveEffect, haveEquipped, haveFamiliar, haveSkill, inebrietyLimit, Item, itemAmount, itemDropModifier, Location, max, min, Monster, monsterLevelAdjustment, myAscensions, myFamiliar, myInebriety, myLevel, myLocation, myMaxmp, myMeat, myMp, myPrimestat, retrieveItem, round, runChoice, setProperty, Skill, Slot, splitString, Stat, toBoolean, toFamiliar, toInt, toLocation, toMonster, useSkill, visitUrl } from "kolmafia";
import { autoAdv$1, autoAdv$2, autoAdvBypass } from "../auto_adventure";
import { canDrink$1, spleen_left } from "../auto_consume";
import { addToMaximize, autoEquip, autoEquip$1, possessEquipment } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1, is100FamRun, pathAllowsChangingFamiliar } from "../auto_familiar";
import { disregardInstantKarma, isAboutToPowerlevel } from "../auto_powerlevel";
import { auto_can_equip, auto_get_campground, auto_is_valid, auto_is_valid$1, auto_log_error, auto_log_info, auto_log_info$1, auto_log_warning$1, handleTracker, handleTracker$1, hasTorso$1, internalQuestStatus, meatReserve, wrap_item } from "../auto_util";
import { zone_available, zone_needItem } from "../auto_zone";
import { generic_t } from "../autoscend_record";
import { canUse$2, useItem, useSkill$1 } from "../combat/auto_combat_util";
import { have_fireworks_shop } from "./mr2021";
import { auto_neededShadowBricks } from "./mr2023";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_plumber } from "../paths/path_of_the_plumber";
import { in_pokefam } from "../paths/pocket_familiars";
import { in_small } from "../paths/small";
import { in_tcrs } from "../paths/two_crazy_random_summer";
import { is_professor } from "../paths/wereprofessor";
import { L8_trapperTalk, needOre } from "../quests/level_08";
import { fastenerCount, hedgeTrimmersNeeded, L9_twinPeak, lumberCount } from "../quests/level_09";
import { needStarKey } from "../quests/level_13";

// This is meant for items that have a date of 2022

//Defined in autoscend/iotms/mr2022.ash
export function auto_haveCursedMagnifyingGlass(): boolean
{
	if (possessEquipment(Item.get("cursed magnifying glass")) && auto_can_equip(Item.get("cursed magnifying glass"))) {
		return true;
	}
	return false;
}

export function auto_voidMonster(): boolean
{
	return auto_voidMonster$1(Location.none);
}

export function auto_voidMonster$1(loc: Location): boolean
{
	// Cursed Magnifying Glass gives a void monster combat every 13 turns. The first 5 are free fights
	// _voidFreeFights counts up from 0 and stays at 5 once all free fights are completed for the day
	if (!auto_haveCursedMagnifyingGlass())
	{
		return false;
	}

	if (is_professor())
	{
		return false; //can't beat the void guys as a professor
	}
	// return false if we've fought the 5 free void monsters already today or we're still charging up the counter
	if (toInt(getProperty("_voidFreeFights")) >= 5 || toInt(getProperty("cursedMagnifyingGlassCount")) !== 13)
	{
		return false;
	}

	if (loc === Location.none)
	{
		return true;
	}

	if (autoEquip$1(Item.get("cursed magnifying glass")))
	{
		setProperty("auto_nextEncounter", "void guy"); //which of the 3 is random, but they're all same phylum and free under same conditions
		return autoAdv$2(loc);
	}
	setProperty("auto_nextEncounter", "");
	return false;
}

export function auto_haveCosmicBowlingBall(): boolean
{
	// ensure we not only own one but it's in allowed in path and also in inventory for us to do stuff with.
	return toBoolean(getProperty("hasCosmicBowlingBall")) && auto_is_valid(Item.get("cosmic bowling ball")) && availableAmount(Item.get("cosmic bowling ball")) > 0;
}

export function auto_bowlingBallCombatString(place: Location, speculation: boolean): string
{
	if (!auto_haveCosmicBowlingBall())
	{
		return "";
	}

	if (is_professor())
	{
		return ""; //Handle specially in WereProf Combat file
	}

	if (place === Location.get("The Hidden Bowling Alley") && toInt(getProperty("auto_bowledAtAlley")) !== myAscensions())
	{
		if (!speculation)
		{
			setProperty("auto_bowledAtAlley", myAscensions().toString());
			auto_log_info$1("Cosmic Bowling Ball used at Hidden Bowling Alley to advance quest.");
		}
		return useItem(Item.get("cosmic bowling ball"), !speculation);
	}
	// determine if we want more stats
	if (canUse$2(Skill.get("Bowl Sideways")))
	{
		// increase stats if we are power leveling
		if (isAboutToPowerlevel())
		{
			return useSkill$1(Skill.get("Bowl Sideways"), !speculation);
		}
		// increase stats if we are farming Ka as Ed
		if (toBoolean(getProperty("_auto_farmingKaAsEd")))
		{
			return useSkill$1(Skill.get("Bowl Sideways"), !speculation);
		}
	}
	// determine if we want more item or meat bonus
	if (canUse$2(Skill.get("Bowl Straight Up")))
	{
		// increase item bonus if not item capped in current zone
		const itemNeed: generic_t = zone_needItem(place);
		if (itemNeed._boolean)
		{
			if (itemDropModifier() < itemNeed._float)
			{
				return useSkill$1(Skill.get("Bowl Straight Up"), !speculation);
			}
		}
		// increase meat bonus if doing nuns
		if (place === Location.get("The Themthar Hills"))
		{
			return useSkill$1(Skill.get("Bowl Straight Up"), !speculation);
		}
	}

	return "";
}

export function auto_haveCombatLoversLocket(): boolean
{
	return possessEquipment(Item.get("combat lover's locket")) && auto_is_valid(Item.get("combat lover's locket"));
}

function auto_CombatLoversLocketCharges(): number
{
	// can fight up to 3 unique monsters by reminiscing with the locket
	if (!auto_haveCombatLoversLocket())
	{
		return 0;
	}

	const locketMonstersFought: string = getProperty("_locketMonstersFought");
	// check if we haven't found any yet
	if (locketMonstersFought === "")
	{
		return 3;
	}

	return 3 - splitString(locketMonstersFought, ",").length;
}

function auto_haveReminiscedMonster(mon: Monster): boolean
{
	const idList: Map<number, string> = new Map(splitString(getProperty("_locketMonstersFought"), ",").map((_v, _i) => [_i, _v]));
	for (const [index, id] of idList)
	{
		if (toMonster(id) === mon)
		{
			return true;
		}
	}
	return false;
}

export function auto_monsterInLocket(mon: Monster): boolean
{
	const captured: Map<Monster, boolean> = new Map(Object.entries(getLocketMonsters()).map(([_k, _v]) => [Monster.get(_k), _v]));
	return captured.has(mon);
}

export function auto_fightLocketMonster(mon: Monster, speculative: boolean): boolean
{
	if (auto_CombatLoversLocketCharges() < 1)
	{
		return false;
	}

	if (!auto_monsterInLocket(mon))
	{
		return false;
	}

	if (auto_haveReminiscedMonster(mon))
	{
		return false;
	}

	if (speculative)
	{
		return true;
	}

	auto_log_info(`Using locket to summon ${mon.name}`, "blue");
	const pages: Map<number, string> = new Map();
	pages.set(0, "inventory.php?reminisce=1");
	pages.set(1, `choice.php?whichchoice=1463&pwd&option=1&mid=${mon.id}`);
	if (autoAdvBypass(1, pages, Location.get("Noob Cave"), null))
	{
		handleTracker$1(mon.toString(), Item.get("combat lover's locket").toString(), "auto_copies");
	}

	if (!auto_haveReminiscedMonster(mon))
	{
		auto_log_error(`Attempted to fight ${mon.name} by reminiscing with Combat Lover's Locket, but failed.`);
		return false;
	}

	return true;

}

export function auto_haveGreyGoose(): boolean
{
	if (auto_have_familiar(Familiar.get("Grey Goose")))
	{
		return true;
	}
	return false;
}

export function gooseExpectedDrones(): number
{
	if (!auto_haveGreyGoose()) { return 0; }
	const gooseWeight: number = familiarWeight(Familiar.get("Grey Goose"));
	if (gooseWeight < 5) { return 0; }
	return gooseWeight - 5;
}

export function dronesOut(): boolean
{ //want a function to override the task order if we have drones out so as not to waste them
	if (!auto_haveGreyGoose()) { return false; }
	if (toInt(getProperty("gooseDronesRemaining")) > 0)
	{
		return true;
	}
	return false;
}

export function prioritizeGoose(): void
{ //prioritize Goose only if we still have things to get
	if (!auto_haveGreyGoose()) { return; }
	if (internalQuestStatus("questL04Bat") <= 1 && gooseExpectedDrones() < 1 || itemAmount(Item.get("stone wool")) === 0 && haveEffect(Effect.get("Stone-Faced")) === 0 && internalQuestStatus("questL11Worship") <= 2 && gooseExpectedDrones() < 1 || internalQuestStatus("questL08Trapper") <= 1 && gooseExpectedDrones() < 1 || internalQuestStatus("questL09Topping") >= 2 && internalQuestStatus("questL09Topping") <= 3 && toInt(getProperty("twinPeakProgress")) < 15 && gooseExpectedDrones() < 2 || needStarKey() && (itemAmount(Item.get("star")) < 7 && itemAmount(Item.get("line")) < 6) && gooseExpectedDrones() < 4 || internalQuestStatus("questL11Ron") < 5 && gooseExpectedDrones() < 2 || toInt(getProperty("hiddenBowlingAlleyProgress")) + itemAmount(Item.get("bowling ball")) < 5 && gooseExpectedDrones() < 2 || itemAmount(Item.get("crumbling wooden wheel")) + itemAmount(Item.get("tomb ratchet")) < 9 && itemAmount(Item.get("tangle of rat tails")) > 0 && gooseExpectedDrones() < 3)
	{
		setProperty("auto_prioritizeGoose", true.toString());
		return;
	}
	setProperty("auto_prioritizeGoose", false.toString());
}

export function auto_haveMaydayContract(): boolean
{
	if (toBoolean(getProperty("hasMaydayContract")) && auto_is_valid(Item.get("gaffer's tape")))
	{
	// use a potion to check mayday is allowed as auto_is_valid can return false for equipment & consumables in certain paths
		return true;
	}
	return false;
}

export function auto_canUseJuneCleaver(): boolean {
	if (possessEquipment(Item.get("June cleaver")) && canEquip(Item.get("June cleaver")) && auto_is_valid(Item.get("June cleaver"))) {
		return true;
	}
	return false;
}

export function auto_juneCleaverAdventure(): boolean
{
	if (!auto_canUseJuneCleaver() || toInt(getProperty("_juneCleaverFightsLeft")) > 0)
	{
		return false;
	}

	if (autoEquip(Slot.get("weapon"), Item.get("June cleaver")))
	{
		let cleaverLoc: Location = Location.get("The Dire Warren");
		if (in_koe())
		{
			cleaverLoc = Location.get("Cobb's Knob Treasury"); // arbitrarily picked always accessible location
		}
		return autoAdv$2(cleaverLoc);
	}
	return false;
}

export function juneCleaverChoiceHandler(choice: number): void
{
	switch (choice) {
		case 1467: // Poetic Justice
			if (haveSkill(Skill.get("Tongue of the Walrus")) || itemAmount(Item.get("personal massager")) > 0) {
				runChoice(3); // +5 adventures, get beaten up
			} else if (myPrimestat() === Stat.get("Mysticality") && (myLevel() < 13 || disregardInstantKarma()) || myPrimestat() === Stat.get("Moxie") && myLevel() > 12 && disregardInstantKarma() === false) {
				runChoice(2); // 137 myst substat
			}
			else {
				runChoice(1); // 250 moxie substat
			}
			break;
		case 1468: // Aunts not Ants
			if (myPrimestat() === Stat.get("Moxie") && (myLevel() < 13 || disregardInstantKarma()) || myPrimestat() === Stat.get("Muscle") && myLevel() > 12 && disregardInstantKarma() === false) {
				runChoice(1); // 150 moxie substat
			} else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
				runChoice(4); // skip
			} else {
				runChoice(2); // 250 muscle substat
			}
			break;
		case 1469: // Beware of Alligators
			if (myMeat() < meatReserve()) {
				runChoice(3); // 1500 meat
			} else if (canDrink$1(Item.get("Dad's brandy")) && myInebriety() < inebrietyLimit()) {
				runChoice(2); // size 1 awesome booze
			} else {
				runChoice(3); // 1500 meat
			}
			break;
		case 1470: // Teacher's Pet
			if (canEquip(Item.get("teacher's pen")) && availableAmount(Item.get("teacher's pen")) < 1) {
				runChoice(2); // accessory, +2 fam exp, +3 stats per fight
			} else if (myPrimestat() === Stat.get("Muscle") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(3);
			} else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
				runChoice(4); // skip
			} else {
				runChoice(2); // accessory, +2 fam exp, +3 stats per fight
			}
			break;
		case 1471: // Lost and Found
			if (getProperty("sidequestNunsCompleted") === "none" && getProperty("auto_skipNuns") === "false" && itemAmount(Item.get("savings bond")) === 0) {
				runChoice(1); // potion, 30 turns of 50% meat
			} else if (myPrimestat() === Stat.get("Mysticality") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(3); // 250 myst substat
			} else {
				runChoice(1); // potion, 30 turns of 50% meat
			}
			break;
		case 1472: // Summer Days
			runChoice(1); // potion, -5 combat rate, 30 turns

			break;
		case 1473: // Bath Time
			if (myPrimestat() === Stat.get("Muscle") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(1); // 250 muscle substat
			} else if (toInt(getProperty("_juneCleaverSkips")) < 5) {
				runChoice(4); // skip
			} else {
				runChoice(3); // effect, 30 turns of +3 hot res, +50% init
			}
			break;
		case 1474: // Delicious Sprouts
			if (canEat() && myLevel() < 13 && have_fireworks_shop() && auto_is_valid(Item.get("red rocket")) && !in_darkGyffte() && !is_jarlsberg() && !in_tcrs() && auto_is_valid(
			//paths that can eat but can't eat guilty sprouts/won't get the stats from it anyway
			Item.get("guilty sprout")) && itemAmount(Item.get("guilty sprout")) === 0)
				{ // guilty sprout is level 8+ good size 1 food but it gives big stats, would want to use a red rocket
				runChoice(2); }
			if (myPrimestat() === Stat.get("Mysticality") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(1); // 250 myst substat
			} else if (myPrimestat() === Stat.get("Muscle") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(3); // 138 muscle substat
			} else {
				runChoice(2); // guilty sprout is level 8+ good size 1 food but it gives big stats
			}
			break;
		case 1475: // Hypnotic Master
			if (availableAmount(Item.get("mother's necklace")) < 1) {
				runChoice(1); // 3 RO adventures, 5 free rests (doesn't even need to be equipped), never fumble
			} else if (myPrimestat() === Stat.get("Muscle") && (myLevel() < 13 || disregardInstantKarma())) {
				runChoice(2); // 250 muscle substat
			} else {
				runChoice(1); // autosells for 1000 meat
			}
			break;
		default:
			abort("unhandled choice in juneCleaverChoiceHandler");
	}
}

export function canUseSweatpants(): boolean {
	if (possessEquipment(Item.get("designer sweatpants")) && canEquip(Item.get("designer sweatpants")) && auto_is_valid(Item.get("designer sweatpants"))) {
		return true;
	}
	return false;
}

export function getSweat(): number {
	return toInt(getProperty("sweat"));
}

export function sweatpantsPreAdventure(): void {
	if (!canUseSweatpants()) {
		return;
	}
	if (in_small()) {
		return; // small can't clean organs
	}

	if (myLocation() === Location.get("A Mob of Zeppelin Protesters") && equippedItem(Slot.get("pants")) !== Item.get("lynyrdskin breeches")) {
		return; //want to keep all the sleaze damage bonus in this location
	}

	const sweat: number = getSweat();
	const liverCleaned: number = toInt(getProperty("_sweatOutSomeBoozeUsed"));

	if (sweat >= 25 && liverCleaned < 3 && myInebriety() > 0) {
		if (myLocation() === Location.get("The Haunted Billiards Room") && myInebriety() <= 10) {
			//want to keep inebriety for pool skill
		}
		else {
			useSkill(Skill.get("Sweat Out Some Booze"));
		}
	}

	if (sweat >= 95) {
		if (toBoolean(getProperty("auto_pvpEnable")) && spleen_left() >= 4 * (1 + itemAmount(Item.get("sweat-ade")))) {
			// Our player participates in PVP, let's give them a low-effort spleen item to end the day with, if there's still room.
			useSkill(Skill.get("Make Sweat-Ade"));
		}
		else if (myMp() < myMaxmp()) {
			// This is just opportunistic use of sweat. This skill should be used in auto_restore.ash.
			useSkill(Skill.get("Sip Some Sweat"));
		}
	}
}

export function auto_hasStillSuit(): boolean
{
	return possessEquipment(Item.get("tiny stillsuit")) && auto_is_valid(Item.get("tiny stillsuit"));
}

export function auto_expectedStillsuitAdvs(): number
{
	if (!auto_hasStillSuit()) { return 0; }
	const sweat: number = toInt(getProperty("familiarSweat"));
	// can't consume until at least 10 sweat has been accumulated
	if (sweat < 10) { return 0; }

	return round(sweat ** 0.4);
}

export function utilizeStillsuit(): void {
	//called at the end of pre adv to make sure stillsuit is at least kept equipped on a familiar in the terrarium
	if (!auto_hasStillSuit())
	{
		return;
	}
	//if there is a tiny stillsuit in inventory then unless there was a tracking error it is not worn by any familiar
	if (!pathAllowsChangingFamiliar())
	{
		return;
	}
	//make sure all this nice familiar sweat doesn't go uncollected when current familiar is wearing something else
	if (familiarEquippedEquipment(myFamiliar()) === Item.get("tiny stillsuit"))
	{
		return;
	}

	function sweetestSweatFamiliar(): Familiar
	{
		const currentFamiliar: Familiar = myFamiliar();
		//todo better choice of best familiar effects
		for (const sweetSweatFamiliar of Familiar.get(["Grinning Turtle", "Grouper Groupie", "Star Starfish", "Cat Burglar", "Slimeling", "Sleazy Gravy Fairy"]))
		{ //these give item and sleaze
			if (haveFamiliar(sweetSweatFamiliar) && auto_is_valid$1(sweetSweatFamiliar) && sweetSweatFamiliar !== currentFamiliar)
			{
				return sweetSweatFamiliar;
			}
		}
		for (const commonFamiliar of Familiar.get(["Baby Gravy Fairy", "Smiling Rat", "Mosquito", "Reassembled Blackbird"]))
		{ //default fall back, you probably have one of these
			if (haveFamiliar(commonFamiliar) && auto_is_valid$1(commonFamiliar) && commonFamiliar !== currentFamiliar)
			{
				return commonFamiliar;
			}
		}
		for (const anyFamiliar of Familiar.get(["Mosquito", "Leprechaun", "Levitating Potato", "Angry Goat", "Sabre-Toothed Lime", "Fuzzy Dice", "Spooky Pirate Skeleton", "Barrrnacle", "Howling Balloon Monkey", "Stab Bat", "Grue", "Blood-Faced Volleyball", "Ghuol Whelp", "Baby Gravy Fairy", "Cocoabo", "Star Starfish", "Hovering Sombrero", "Ghost Pickle on a Stick", "Killer Bee", "Whirling Maple Leaf", "Coffee Pixie", "Cheshire Bat", "Jill-O-Lantern", "Hand Turkey", "Crimbo Elf", "Hanukkimbo Dreidl", "Baby Yeti", "Feather Boa Constrictor", "Emo Squid", "Personal Raincloud", "Clockwork Grapefruit", "MagiMechTech MicroMechaMech", "Flaming Gravy Fairy", "Frozen Gravy Fairy", "Stinky Gravy Fairy", "Spooky Gravy Fairy", "Inflatable Dodecapede", "Pygmy Bugbear Shaman", "Doppelshifter", "Attention-Deficit Demon", "Cymbal-Playing Monkey", "Temporal Riftlet", "Sweet Nutcracker", "Pet Rock", "Snowy Owl", "Teddy Bear", "Ninja Pirate Zombie Robot", "Sleazy Gravy Fairy", "Wild Hare", "Wind-up Chattering Teeth", "Spirit Hobo", "Astral Badger", "Comma Chameleon", "Misshapen Animal Skeleton", "Scary Death Orb", "Jitterbug", "Nervous Tick", "Reassembled Blackbird", "Origami Towel Crane", "Ninja Snowflake", "Evil Teddy Bear", "Toothsome Rock", "Ancient Yuletide Troll", "Dandy Lion", "O.A.F.", "Penguin Goodfella", "Jumpsuited Hound Dog", "Green Pixie", "Ragamuffin Imp", "Exotic Parrot", "Wizard Action Figure", "Gluttonous Green Ghost", "Casagnova Gnome", "Hunchbacked Minion", "Crimbo P. R. E. S. S. I. E.", "Bulky Buddy Box", "Teddy Borg", "RoboGoose", "El Vibrato Megadrone", "Mad Hatrack", "Adorable Seal Larva", "Untamed Turtle", "Animated Macaroni Duck", "Pet Cheezling", "Autonomous Disco Ball", "Mariachi Chihuahua", "Hobo Monkey", "Llama Lama", "Cotton Candy Carnie", "Disembodied Hand", "Black Cat", "Uniclops", "Psychedelic Bear", "Baby Mutant Rattlesnake", "Mutant Fire Ant", "Mutant Cactus Bud", "Mutant Gila Monster", "Cuddlefish", "Sugar Fruit Fairy", "Imitation Crab", "Pair of Ragged Claws", "Magic Dragonfish", "Frumious Bandersnatch", "Midget Clownfish", "Syncopated Turtle", "Grinning Turtle", "Purse Rat", "Wereturtle", "Baby Sandworm", "Slimeling", "He-Boulder", "Rock Lobster", "Urchin Urchin", "Grouper Groupie", "Squamous Gibberer", "Dancing Frog", "Chauvinist Pig", "Stocking Mimic", "Snow Angel", "Jack-in-the-Box", "BRICKO chick", "Baby Bugged Bugbear", "Money-Making Goblin", "Floating Eye", "Vampire Bat", "Oyster Bunny", "Egg Benedict", "Bank Piggy", "Worm Doctor", "Snowhitman", "Plastic Grocery Bag", "Underworld Bonsai", "Rogue Program", "Mini-Hipster", "Pottery Barn Owl", "Hippo Ballerina", "Knob Goblin Organ Grinder", "Piano Cat", "Dramatic Hedgehog", "Smiling Rat", "Robot Reindeer", "Holiday Log", "Obtuse Angel", "Reconstituted Crow", "Li'l Xenomorph", "Dataspider", "Pair of Stomping Boots", "Feral Kobold", "Fancypants Scarecrow", "Bloovian Groose", "Blavious Kloop", "Peppermint Rhino", "Tickle-Me Emilio", "Steam-Powered Cheerleader", "Happy Medium", "Artistic Goth Kid", "Flaming Face", "Reagnimated Gnome", "Hovering Skull", "Mini-Skulldozer", "Angry Jung Man", "Unconscious Collective", "Nanorhino", "Oily Woim", "Homemade Robot", "MiniMechaElf", "Gelatinous Cubeling", "Adorable Space Buddy", "Nosy Nose", "Mini-Adventurer", "Mechanical Songbird", "Reanimated Reanimator", "Warbear Drone", "Grimstone Golem", "Grim Brother", "Miniature Sword & Martini Guy", "Putty Buddy", "Twitching Space Critter", "Galloping Grill", "Helix Fossil", "Xiblaxian Holo-Companion", "Baby Z-Rex", "Fist Turkey", "Crimbo Shrub", "Mini-Crimbot", "Topiary Skunk", "Golden Monkey", "Adventurous Spelunker", "Sludgepuppy", "Baby Mayonnaise Wasp", "Puck Man", "Ms. Puck Man", "Lil' Barrel Mimic", "Machine Elf", "Choctopus", "Rockin' Robin", "Restless Cow Skull", "Intergnat", "Software Bug", "Bark Scorpion", "Trick-or-Treating Tot", "Chocolate Lab", "Bad Vibe", "Space Jellyfish", "Optimistic Candle", "Robortender", "Cute Meteor", "XO Skeleton", "Garbage Fire", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "God Lobster", "Cat Burglar", "Party Mouse", "Yule Hound", "Sausage Golem", "Elf Operative", "Plastic Pirate Skull", "Pet Coral", "Pocket Professor", "Red-Nosed Snapper", "Antique Nutcracker", "Piranha Plant", "Left-Hand Man", "Melodramedary", "Ghost of Crimbo Carols", "Ghost of Crimbo Cheer", "Ghost of Crimbo Commerce", "Shorter-Order Cook", "Vampire Vintner", "Arachnelf", "Synthetic Rock", "Grey Goose", "Cookbookbat", "Mini-Trainbot", "Hobo in Sheep's Clothing", "Pixel Rock", "Patriotic Eagle", "Jill-of-All-Trades", "Flaming Leafcutter Ant", "Rigging Snake", "Pet Anchor", "Chest Mimic", "Mini Kiwi", "Proto-Protozoa", "Evolving Organism", "Burly Bodyguard", "Doll Moll", "Emberiza Aureola", "Peace Turkey", "Quantum Entangler", "Golden Pet Rock", "Profane Parrot", "Significant Bit", "Heat Wave", "Cold Cut", "Shame Spiral", "Phantom Limb", "Foul Ball", "Dire Cassava", "Observer", "Cool Cucumber", "Defective Childrens' Stapler", "Glover", "Zapper Bug", "Wet Paper Tiger", "Cooler Yeti", "Baby Skeleton", "Skeleton of Crimbo Past", "Tiny Plastic Santa Claus Skeleton", "Cute Skeletal Dinosaur", "Sword of S Words"]))
		{ //if all else failed just pick any available familiar that can wear equipment
			if (haveFamiliar(anyFamiliar) && auto_is_valid$1(anyFamiliar) && anyFamiliar !== currentFamiliar && !(Familiar.get(["Comma Chameleon", "Mad Hatrack", "Fancypants Scarecrow", "Disembodied Hand", "Ghost of Crimbo Carols", "Ghost of Crimbo Cheer", "Ghost of Crimbo Commerce"]).includes(anyFamiliar)))
			{
				return anyFamiliar;
			}
		}
		return Familiar.none;
	}
	const chosenStillsuitFamiliar: Familiar = sweetestSweatFamiliar();
	if (familiarEquippedEquipment(chosenStillsuitFamiliar) !== Item.get("tiny stillsuit"))
	{
		if (itemAmount(Item.get("tiny stillsuit")) === 0)
		{
			retrieveItem(Item.get("tiny stillsuit"));
		}
		if (itemAmount(Item.get("tiny stillsuit")) > 0)
		{
			equip(chosenStillsuitFamiliar, Item.get("tiny stillsuit"));
		}
		else {
			auto_log_warning$1("Failed to recover tiny stillsuit from the familiar mafia thinks is wearing it");
		}
		if (is100FamRun())
		{
			handleFamiliar$1(toFamiliar(getProperty("auto_100familiar"))); //just make extra sure this didnt break 100 familiar runs but familiar should not have been swapped
		}
	}
}

export function auto_hasParka(): boolean
{
	const parka: Item = wrap_item(Item.get("Jurassic Parka"));
	return possessEquipment(parka) && auto_is_valid(parka);
}

export function auto_configureParka(tag: string): boolean
{
	if (!auto_hasParka() || !hasTorso$1())
	{
		return false;
	}
	// store the requested setting in a property so we can handle them later
	setProperty("auto_parkaSetting", tag);
	// cut down potential server hits by telling the maximizer to not consider it.
	addToMaximize(`-equip ${wrap_item(Item.get("Jurassic Parka")).toString()}`);
	return true;
}

export function auto_handleParka(): boolean
{
	if (!auto_hasParka() || !hasTorso$1())
	{
		return false;
	}
	const dino: string = getProperty("auto_parkaSetting");
	let tempDino: string = dino;
	if (dino === "")
	{
		if (getProperty("parkaMode") === "")
		{
			// if currently configured for stats and have been getting beaten up, change to stun
			tempDino = "kachungasaur";
		}
		else {
			return false;
		}
	}
	if (!containsText("kachungasaur | cold | hp | meat | dilophosaur | stench | acid | ghostasaurus | spooky | mp | dr | spikolodon | sleaze | ml | spikes | pterodactyl | hot | init | nc", dino))
	{
		return false;
	}
	if (dino === "cold" || dino === "meat" || dino === "hp")
	{
		tempDino = "kachungasaur";
	}
	else if (dino === "stench" || dino === "acid")
	{
		tempDino = "dilophosaur";
	}
	else if (dino === "spooky" || dino === "mp" || dino === "dr")
	{
		tempDino = "ghostsaurus";
	}
	else if (dino === "sleaze" || dino === "ml" || dino === "spikes")
	{
		tempDino = "spikolodon";
	}
	else if (dino === "hot" || dino === "init" || dino === "nc")
	{
		tempDino = "pterodactyl";
	}
	// avoid uselessly reconfiguring the parka
	if (getProperty("parkaMode") !== tempDino)
	{
		cliExecute(`parka ${tempDino}`);
	}
	const parka: Item = wrap_item(Item.get("Jurassic Parka"));
	equip(parka); // already configured, just equip

	return getProperty("parkaMode") === tempDino && haveEquipped(parka);
}

export function auto_ParkaSpikeForcesLeft(): number
{
	if (!auto_hasParka())
	{
		return 0;
	}
	const spike_uses: number = toInt(getProperty("_spikolodonSpikeUses"));
	return 5 - spike_uses;
}

export function auto_hasAutumnaton(): boolean
{
	return toBoolean(getProperty("hasAutumnaton")) && auto_is_valid(Item.get("autumn-aton")) && !in_pokefam();
}
// only valid when autumnaton is not currently out on a quest
export function auto_autumnatonCanAdv(canAdventureInloc: Location): boolean
{
	if (!auto_hasAutumnaton())
	{
		return false;
	}

	if (canAdventureInloc === Location.get("8-Bit Realm") && possessEquipment(Item.get("continuum transfunctioner")) && auto_is_valid(Item.get("continuum transfunctioner")))
	{
		equip(Item.get("continuum transfunctioner"));
	}

	for (const [index, loc] of getAutumnatonLocations().entries())
	{
		if (loc === canAdventureInloc)
		{
			return true;
		}
	}
	return false;
}

function auto_autumnatonReadyToQuest(): boolean
{
	if (!auto_hasAutumnaton())
	{
		return false;
	}

	return itemAmount(Item.get("autumn-aton")) !== 0;
}

export function auto_autumnatonQuestingIn(): Location
{
	return toLocation(getProperty("autumnatonQuestLocation"));
}

function auto_autumnatonCheckForUpgrade(upgrade: string): boolean
{
	const currentUpgrades: string = getProperty("autumnatonUpgrades");
	if (containsText(currentUpgrades, upgrade))
	{
		return true;
	}
	return false;
}

function auto_sendAutumnaton(loc: Location): boolean
{
	if (auto_autumnatonCanAdv(loc))
	{
		cliExecute(`autumnaton send ${loc}`);
		handleTracker(`Autumnaton sent to ${loc}`, "auto_otherstuff");
		return true;
	}
	return false;
}

export function auto_autumnatonQuest(): boolean
{
	if (!auto_autumnatonReadyToQuest()) { return false; }
	// complete any pending upgrades if haven't checked since last return
	// both of these props reset to 0 at start of day or new life due to "_" at start of them
	const completedQuestsToday: number = toInt(getProperty("_autumnatonQuests"));
	const lastQuestUpgradesChecked: number = toInt(getProperty("_auto_lastAutumnatonUpgrade"));
	if (completedQuestsToday > lastQuestUpgradesChecked)
	{
		try {
		cliExecute("autumnaton upgrade"); 		} catch (e: any) {}
		setProperty("_auto_lastAutumnatonUpgrade", completedQuestsToday.toString());
	}
	// prioritize getting important upgrades
	if (!auto_autumnatonCheckForUpgrade("leftarm1"))
	{
		if (auto_sendAutumnaton(Location.get("The Haunted Pantry")))
		{
			return false;
		}
		else {
			abort("Haunted pantry should always be available for autumnaton, but autoscend determined it is not. Report issue.");
		}
	}

	if (!auto_autumnatonCheckForUpgrade("leftleg1"))
	{
		// some bat zones may not be adventured in, so try them all
		if (auto_sendAutumnaton(Location.get("Guano Junction"))) { return false; }
		if (auto_sendAutumnaton(Location.get("The Batrat and Ratbat Burrow"))) { return false; }
		if (auto_sendAutumnaton(Location.get("The Beanbat Chamber"))) { return false; }
		if (auto_sendAutumnaton(Location.get("Cobb's Knob Harem"))) { return false; }
		if (auto_sendAutumnaton(Location.get("Noob Cave"))) { return false; }
	}

	if (!auto_autumnatonCheckForUpgrade("rightleg1"))
	{
		if (auto_sendAutumnaton(Location.get("The Haunted Library"))) { return false; }
		if (auto_sendAutumnaton(Location.get("The Neverending Party"))) { return false; }
		if (auto_sendAutumnaton(Location.get("The Haunted Kitchen"))) { return false; }
	}

	if (!auto_autumnatonCheckForUpgrade("rightarm1"))
	{
		if (auto_sendAutumnaton(Location.get("The Overgrown Lot"))) { return false; }
	}
	// should we go regardless of if we have arm upgrades?
	if (auto_autumnatonCheckForUpgrade("leftarm1") && auto_autumnatonCheckForUpgrade("rightarm1") && itemAmount(Item.get("barrel of gunpowder")) < 5 && getProperty("sidequestLighthouseCompleted") === "none" && !in_koe())
	{
		const targetLocation: Location = Location.get("Sonofa Beach");
		if (!auto_autumnatonCanAdv(targetLocation) && zone_available(targetLocation))
		{
			// force one turn in zone to unlock it for bot
			return autoAdv$1(1, targetLocation);
		}
		if (auto_sendAutumnaton(targetLocation)) { return false; }
	}
	// acquire items to help quests
	if (fastenerCount() < 30 && lumberCount() < 30)
	{
		const targetLocation: Location = Location.get("The Smut Orc Logging Camp");
		if (!auto_autumnatonCanAdv(targetLocation) && zone_available(targetLocation))
		{
			// force one turn in zone to unlock it for bot
			return autoAdv$1(1, targetLocation);
		}
		if (auto_sendAutumnaton(targetLocation)) { return false; }
	}

	if (hedgeTrimmersNeeded() > 0)
	{
		const targetLocation: Location = Location.get("Twin Peak");
		if (!auto_autumnatonCanAdv(targetLocation) && zone_available(targetLocation))
		{
			// force one turn in zone to unlock it for bot
			// twin peak requires NC setup, call function instead of directly adventuring there
			return L9_twinPeak();
		}
		if (auto_sendAutumnaton(targetLocation)) { return false; }
	}
	// acquire more shadow bricks
	if (auto_neededShadowBricks() > 0)
	{
		const ingress: string = getProperty("shadowRiftIngress");
		if (["cemetery", "hiddencity", "pyramid"].includes(ingress))
		{
			if (auto_sendAutumnaton(Location.get("Shadow Rift"))) { return false; }
		}
	}
	// a location of last resort for those without shadow rifts
	if (getProperty("shadowRiftIngress") === "")
	{
		//Cookbookbat materials if you have a Cookbookbat and Autumn Fest Ale+stone wool or Autumn Leaves
		if (itemAmount(Item.get("stone wool")) === 0 && toInt(getProperty("lastTempleAdventures")) < myAscensions())
		{
			if (auto_sendAutumnaton(Location.get("The Hidden Temple"))) { return false; }
		}
		else {
			if (auto_sendAutumnaton(Location.get("The Outskirts of Cobb's Knob"))) { return false; }
		}
	}

	return false;
}

export function auto_hasSpeakEasy(): boolean
{
	return auto_is_valid(Item.get("deed to Oliver's Place")) && toBoolean(getProperty("ownsSpeakeasy"));
}

export function auto_remainingSpeakeasyFreeFights(): number
{
	if (!auto_hasSpeakEasy()) { return 0; }
	return max(3 - toInt(getProperty("_speakeasyFreeFights")), 0);
}

export function speakeasyCombat(): boolean
{
	if (!auto_hasSpeakEasy())
	{
		return false;
	}

	if (auto_remainingSpeakeasyFreeFights() > 0)
	{
		return autoAdv$2(Location.get("An Unusually Quiet Barroom Brawl"));
	}
	return false;
}

export function auto_haveTrainSet(): boolean
{
	return auto_get_campground().has(Item.get("model train set")) && auto_is_valid(Item.get("model train set")); //check if the model train set is in the campground
}

function auto_modifyTrainSet(one: number, two: number, three: number, four: number, five: number, six: number, seven: number, eight: number): void
{
	const page: string = `choice.php?pwd&whichchoice=1485&option=1&slot[0]=${one}&slot[1]=${two}&slot[2]=${three}&slot[3]=${four}&slot[4]=${five}&slot[5]=${six}&slot[6]=${seven}&slot[7]=${eight}`;
	visitUrl(page, true, true);
	visitUrl("main.php");
	return;
}

export function auto_checkTrainSet(): void
{
	const lastTrainsetConfiguration: number = toInt(getProperty("lastTrainsetConfiguration"));
	const trainsetPosition: number = toInt(getProperty("trainsetPosition"));
	const trainsetConfiguration: string = getProperty("trainsetConfiguration");
	if (!auto_haveTrainSet()) { return; }
	/* A list of what the station numbers are (thanks Zdrvst for compiling this list for your CS script)
	1: meat
	2: mp regen
	3: all stats
	4: hot res, cold dmg
	5: stench res, spooky dmg
	6: wood, joiners, or stats (orc chasm bridge stuff)
	7: candy
	8: double next stop
	9: cold res, stench dmg
	11: spooky res, sleaze dmg
	12: sleaze res, hot dmg
	13: monster level
	14: mox stats
	15: basic booze
	16: mys stats
	17: mus stats
	18: food drop buff
	19: copy last food drop
	20: ore
	*/
	const stationInts: Map<number, string> = new Map();
	stationInts.set(1, "meat_mine");
	stationInts.set(2, "tower_fizzy");
	stationInts.set(3, "viewing_platform");
	stationInts.set(4, "tower_frozen");
	stationInts.set(5, "spooky_graveyard");
	stationInts.set(6, "logging_mill");
	stationInts.set(7, "candy_factory");
	stationInts.set(8, "coal_hopper");
	stationInts.set(9, "tower_sewage");
	stationInts.set(11, "oil_refinery");
	stationInts.set(12, "oil_bridge");
	stationInts.set(13, "water_bridge");
	stationInts.set(14, "groin_silo");
	stationInts.set(15, "grain_silo");
	stationInts.set(16, "brain_silo");
	stationInts.set(17, "brawn_silo");
	stationInts.set(18, "prawn_silo");
	stationInts.set(19, "trackside_diner");
	stationInts.set(20, "ore_hopper");
	const one: number = 8; //doubler
	let two: number = 0;
	let three: number = 0;
	let four: number = 0;
	if (myLevel() < 11)
	{ //check if we need more stats. There is no check for disregard instant karma because
	//if we do check, we will never double lumber mill, which is more beneficial than continuing to double mainstat.
		if (myPrimestat() === Stat.get("Muscle"))
		{
			two = 17;
		}
		else if (myPrimestat() === Stat.get("Mysticality"))
		{
			two = 16;
		}
		else {
			two = 14;
		}
		three = 3; //all stats
		four = 6; //lumber mill
	}
	else if (fastenerCount() < 30 || lumberCount() < 30)
	{ //Double lumber mill to clear orc bridge faster
		two = 6; //lumber mill
		if (myPrimestat() === Stat.get("Muscle"))
		{
			three = 17;
		}
		else if (myPrimestat() === Stat.get("Mysticality"))
		{
			three = 16;
		}
		else {
			three = 14;
		}
		four = 3; //all stats
	}
	else {
	//no need for main stats or bridge parts so lets do resistances and offstats
		two = 11; //spooky res, sleaze dmg
		three = 4; //hot res, cold dmg
		if (myPrimestat() === Stat.get("Muscle"))
		{
			four = 14; //Moxie for Muscle peeps
		}
		else if (myPrimestat() === Stat.get("Mysticality"))
		{
			four = 14; //Moxie for Mysticality peeps
		}
		else {
			four = 17; //Muscle for Moxie peeps
		}
	}
	const five: number = 1; //meat
	const six: number = 2; //mp regen
	let seven: number = 0;
	//Initialize trapper to know whether we have enough ore or not
	const L8Step: number = internalQuestStatus("questL08Trapper");
	if (myLevel() >= 8 && L8Step === 0) {
		L8_trapperTalk();
	}
	if (needOre()) {
		seven = 20; //ore
	}
	else {
		if (myPrimestat() === Stat.get("Muscle"))
		{
			seven = 16; //Mysticality for Muscle peeps
		}
		else if (myPrimestat() === Stat.get("Mysticality"))
		{
			seven = 17; //Muscle for Mysticality peeps
		}
		else {
			seven = 16; //Mysticality for Moxie peeps
		}
	}
	let eight: number = 13; //monster level
	if (monsterLevelAdjustment() > toInt(getProperty("auto_MLSafetyLimit")) && getProperty("auto_MLSafetyLimit") !== "" || toInt(getProperty("auto_MLSafetyLimit")) === -1 || in_plumber()) {
		eight = 9; //cold res, stench dmg
	}
	const turnsSinceTSConfigured: number = min(trainsetPosition - lastTrainsetConfiguration, 40);
	const expectedConfig: string = `${(stationInts.get(one) ?? stationInts.set(one, "").get(one))},${(stationInts.get(two) ?? stationInts.set(two, "").get(two))},${(stationInts.get(three) ?? stationInts.set(three, "").get(three))},${(stationInts.get(four) ?? stationInts.set(four, "").get(four))},${(stationInts.get(five) ?? stationInts.set(five, "").get(five))},${(stationInts.get(six) ?? stationInts.set(six, "").get(six))},${(stationInts.get(seven) ?? stationInts.set(seven, "").get(seven))},${(stationInts.get(eight) ?? stationInts.set(eight, "").get(eight))}`;

	let changedTSConfig: boolean = false;
	if (expectedConfig !== trainsetConfiguration)
	{
		changedTSConfig = true;
	}
	else {
		changedTSConfig = false;
	}
	//only check for the page if it has been 0 turns or 40 turns since last configured and the configuration has changed
	if (turnsSinceTSConfigured === 0 || turnsSinceTSConfigured === 40 && changedTSConfig)
	{
		const page: string = visitUrl("campground.php?action=workshed"); //once it is available, still double check that we can actually change the config
		if (containsText(page, "value=\"Save Train Set Configuration\"")) {
			auto_modifyTrainSet(one, two, three, four, five, six, seven, eight);
		}
		return;
	}
}