import { availableAmount, canEquip, ceil, Effect, equip, Familiar, familiarWeight, getProperty, haveEffect, haveSkill, Item, itemAmount, Location, min, Modifier, Monster, myAscensions, myFamiliar, myLevel, myPath, numericModifier, Path, pullsRemaining, refreshStatus, Skill, Slot, splitString, toBoolean, toFamiliar, toInt, toSlot, use, useFamiliar, visitUrl } from "kolmafia";
import { auto_doTempleSummit } from "../../autoscend";
import { pullXWhenHaveY } from "../auto_acquire";
import { auto_getAllEquipabble$1, possessOutfit$1, simMaximizeWith$1 } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { auto_sortedByModifier } from "../auto_list";
import { provideFamExp, provideFamExp$3 } from "../auto_providers";
import { adjustForYellowRayIfPossible$1, auto_is_valid, auto_is_valid$2, auto_log_info, auto_log_info$1, handleTracker$1, internalQuestStatus, summonMonster } from "../auto_util";
import { yellowRayCombatString$1 } from "../combat/auto_combat_util";
import { speakeasyCombat } from "../iotms/mr2022";
import { auto_doPhoneQuest, auto_fightFlamingLeaflet } from "../iotms/mr2023";
import { auto_AprilPiccoloBoostsLeft, auto_haveMayamCalendar, auto_MayamAllUsed, auto_MayamClaim, auto_MayamIsUsed, auto_playAprilPiccolo } from "../iotms/mr2024";
import { L5_getEncryptionKey } from "../quests/level_05";
import { L7_defiledNook } from "../quests/level_07";
import { LX_killBaaBaaBuran, LX_unlockHauntedBilliardsRoom, LX_unlockHiddenTemple } from "../quests/level_11";
import { candyBlock, candyBlockOutfit, LX_lastChance } from "../quests/level_any";

let $_f_ZOOPART_NONE: number | undefined;
$_f_ZOOPART_NONE ??= 0;
let $_f_ZOOPART_HEAD: number | undefined;
$_f_ZOOPART_HEAD ??= 1;
let $_f_ZOOPART_L_SHOULDER: number | undefined;
$_f_ZOOPART_L_SHOULDER ??= 2;
let $_f_ZOOPART_R_SHOULDER: number | undefined;
$_f_ZOOPART_R_SHOULDER ??= 3;
let $_f_ZOOPART_L_HAND: number | undefined;
$_f_ZOOPART_L_HAND ??= 4;
let $_f_ZOOPART_R_HAND: number | undefined;
$_f_ZOOPART_R_HAND ??= 5;
let $_f_ZOOPART_R_NIPPLE: number | undefined;
$_f_ZOOPART_R_NIPPLE ??= 6;
let $_f_ZOOPART_L_NIPPLE: number | undefined;
$_f_ZOOPART_L_NIPPLE ??= 7;
let $_f_ZOOPART_L_BUTTOCK: number | undefined;
$_f_ZOOPART_L_BUTTOCK ??= 8;
let $_f_ZOOPART_R_BUTTOCK: number | undefined;
$_f_ZOOPART_R_BUTTOCK ??= 9;
let $_f_ZOOPART_L_FOOT: number | undefined;
$_f_ZOOPART_L_FOOT ??= 10;
let $_f_ZOOPART_R_FOOT: number | undefined;
$_f_ZOOPART_R_FOOT ??= 11;

//Defined in autoscend/paths/zootomist.ash
export function in_zootomist(): boolean
{
	return myPath() === Path.get("Z is for Zootomist");
}

function zoo_specimenPreparationsLeft(): number
{
	if (!in_zootomist()) { return 0; }
	const zoo_grafts_allowed: number = min(11, toInt(getProperty("zootomistPoints")) + 1);
	return zoo_grafts_allowed - toInt(getProperty("zootSpecimensPrepared"));
}

function zoo_prepareSpecimen(): boolean
{
	const f: Familiar = myFamiliar();
	if (!in_zootomist()) { return false; }
	if (zoo_specimenPreparationsLeft() > 0)
	{
		visitUrl("place.php?whichplace=graftinglab&action=graftinglab_prep");
		visitUrl("choice.php?pwd=&whichchoice=1555&option=1", true);
		refreshStatus();
		const new_exp: number = f.experience;
		const new_weight: number = familiarWeight(f);
		handleTracker$1(f.toString(), `Specimen prepared to ${f.experience} XP {${new_weight} lb}`, "auto_tracker_path");
		return true;
	}
	return false;
}

export function zoo_startPulls(): void
{
	if (!in_zootomist() || pullsRemaining() === 0) { return; }
	if (!haveSkill(Skill.get("Just the Facts")) && auto_is_valid$2(Skill.get("Just the Facts"))) {
		pullXWhenHaveY(Item.get("book of facts (dog-eared)"), 1, 0);
		if (availableAmount(Item.get("book of facts (dog-eared)")) > 0) { use(Item.get("book of facts (dog-eared)")); }
	}
	if (!haveSkill(Skill.get("Perpetrate Mild Evil")) && auto_is_valid$2(Skill.get("Perpetrate Mild Evil"))) {
		pullXWhenHaveY(Item.get("Pocket Guide to Mild Evil (used)"), 1, 0);
		if (availableAmount(Item.get("Pocket Guide to Mild Evil (used)")) > 0) { use(Item.get("Pocket Guide to Mild Evil (used)")); }
	}
	if (availableAmount(Item.get("iFlail")) === 0 && auto_is_valid(Item.get("iFlail"))) {
		pullXWhenHaveY(Item.get("iFlail"), 1, 0);
	}
}

export function zoo_d2Pulls(): void
{
	if (!in_zootomist() || pullsRemaining() === 0) { return; }
	// Pull enough ML for oil peak, we need a provider function here.
	const ml_target: number = toInt(100.0);
	simMaximizeWith$1("monster level");
	let curr_ml: number = toInt(numericModifier(Modifier.get("Monster Level")));
	// Function to try pulling an ML item, if it improves our ML by at least 10 over best alternative.
	function try_ml_pull(it: Item): number {
		if (!canEquip(it) || availableAmount(it) > 0 || !auto_is_valid(it)) { return 0; }
		const m: Modifier = Modifier.get("Monster Level");
		const s: Slot = toSlot(it);
		const alternatives: Map<Item, number> = auto_getAllEquipabble$1(s);
		const ranked_alternatives: Map<number, Item> = auto_sortedByModifier(alternatives, m);
		const islot: number = (s === Slot.get("acc1") ? 2 : 0); // we want to compare to our third best item for accessories
		const curr_best_in_slot: Item = (ranked_alternatives.size > islot ? (ranked_alternatives.get(islot) ?? ranked_alternatives.set(islot, Item.none).get(islot)) : Item.none);
		const curr_best_mod: number = numericModifier(curr_best_in_slot, m);
		const improvement: number = numericModifier(it, m) - curr_best_mod;
		if (improvement > 10) {
			pullXWhenHaveY(it, 1, 0);
			if (availableAmount(it) > 0) { return improvement; }
		}
		return 0;
	}
	// Good ML boosting items. Vinyl Shield is lower than you might think because it can't be wielded with unstable fulminate.
	for (const it of Item.get(["hairshirt", "hockey stick of furious angry rage", "stainless steel scarf", "porcelain pelerine",
	  "bakelite backpack", "brown pirate pants", "Mer-kin headguard", "vinyl shield", "red shirt", "iFlail"]))
	{
		if (curr_ml >= ml_target) { break; }
		curr_ml += toInt(try_ml_pull(it));
	}
	return;
}

function zoo_graftedToPart(bodyPart: number): Familiar
{
	switch (bodyPart)
	{
		case $_f_ZOOPART_HEAD:
			return toFamiliar(toInt(getProperty("zootGraftedHeadFamiliar")));
		case $_f_ZOOPART_L_SHOULDER:
			return toFamiliar(toInt(getProperty("zootGraftedShoulderLeftFamiliar")));
		case $_f_ZOOPART_R_SHOULDER:
			return toFamiliar(toInt(getProperty("zootGraftedShoulderRightFamiliar")));
		case $_f_ZOOPART_L_HAND:
			return toFamiliar(toInt(getProperty("zootGraftedHandLeftFamiliar")));
		case $_f_ZOOPART_R_HAND:
			return toFamiliar(toInt(getProperty("zootGraftedHandRightFamiliar")));
		case $_f_ZOOPART_R_NIPPLE:
			return toFamiliar(toInt(getProperty("zootGraftedNippleRightFamiliar")));
		case $_f_ZOOPART_L_NIPPLE:
			return toFamiliar(toInt(getProperty("zootGraftedNippleLeftFamiliar")));
		case $_f_ZOOPART_L_BUTTOCK:
			return toFamiliar(toInt(getProperty("zootGraftedButtCheekLeftFamiliar")));
		case $_f_ZOOPART_R_BUTTOCK:
			return toFamiliar(toInt(getProperty("zootGraftedButtCheekRightFamiliar")));
		case $_f_ZOOPART_L_FOOT:
			return toFamiliar(toInt(getProperty("zootGraftedFootLeftFamiliar")));
		case $_f_ZOOPART_R_FOOT:
			return toFamiliar(toInt(getProperty("zootGraftedFootRightFamiliar")));
		default:
			return Familiar.none;
	}
}

function zoo_graftedFams(): Map<number, Familiar>
{
	const fams: Map<number, Familiar> = new Map();
	for (let i: number = 1; i < 12; i++) { fams.set(i, zoo_graftedToPart(i)); }
	return fams;
}

function zoo_graftedIntrinsicFams(): Map<Familiar, boolean>
{
	const fams: Map<Familiar, boolean> = new Map();
	function check(part: number): void
	{
		const f: Familiar = zoo_graftedToPart(part);
		if (f !== Familiar.none) { fams.set(f, true); }
	}
	check($_f_ZOOPART_HEAD);
	check($_f_ZOOPART_L_SHOULDER);
	check($_f_ZOOPART_R_SHOULDER);
	check($_f_ZOOPART_L_BUTTOCK);
	check($_f_ZOOPART_R_BUTTOCK);
	return fams;
}

function zoo_isGrafted(f: Familiar): boolean
{
	if (f === Familiar.none) { return false; }
	for (const [i, fam] of zoo_graftedFams())
	{
		if (fam === f) { return true; }
	}
	return false;
}

function zoo_getBodyPartPriority(): Map<number, number>
{
	let priority: Map<number, number> = new Map();
	if (auto_have_familiar(Familiar.get("Burly Bodyguard")) || zoo_isGrafted(Familiar.get("Burly Bodyguard")))
	{
		priority = new Map([[0, $_f_ZOOPART_L_NIPPLE],
		[1, $_f_ZOOPART_R_NIPPLE],
		[2, $_f_ZOOPART_L_FOOT],
		[3, $_f_ZOOPART_HEAD],
		[4, $_f_ZOOPART_L_HAND],
		[5, $_f_ZOOPART_L_SHOULDER],
		[6, $_f_ZOOPART_R_SHOULDER],
		[7, $_f_ZOOPART_L_BUTTOCK],
		[8, $_f_ZOOPART_R_HAND],
		[9, $_f_ZOOPART_R_BUTTOCK],
		[10, $_f_ZOOPART_R_FOOT]]);
	}
	else {
		priority = new Map([[0, $_f_ZOOPART_L_NIPPLE],
		[1, $_f_ZOOPART_R_NIPPLE],
		[2, $_f_ZOOPART_L_FOOT],
		[3, $_f_ZOOPART_HEAD],
		[4, $_f_ZOOPART_L_HAND],
		[5, $_f_ZOOPART_L_SHOULDER],
		[6, $_f_ZOOPART_R_SHOULDER],
		[7, $_f_ZOOPART_L_BUTTOCK],
		[8, $_f_ZOOPART_R_BUTTOCK],
		[9, $_f_ZOOPART_R_FOOT],
		[10, $_f_ZOOPART_R_HAND]]);
	}
	return priority;
}

function zoo_getBestFam(bodyPart: number): Familiar
{
	return zoo_getBestFam$1(bodyPart, false);
}

function zoo_getBestFam$1(bodyPart: number, verbose: boolean): Familiar
{
	//Identifies the 11 familiars we want based on what we have and stores them in prefs so we only go through the list of fams once
	//Goes through fam attributes of all familiars and filters from there
	const famAttributes: Map<Familiar, string> = new Map();
	//priority, familiar
	const intrinsicFams: Map<Familiar, number> = new Map();
	const punchFams: Map<Familiar, number> = new Map();
	const lbuffFams: Map<Familiar, number> = new Map();
	const rbuffFams: Map<Familiar, number> = new Map();
	const kickFams: Map<Familiar, number> = new Map();
	//Weights for familiar priority. These are based off of our default maximizer statement
	const intrinsicWeights: Map<string, number> = new Map([
		["technological", 100], //20% item drop
		["haseyes", 75], //15% item drop
		["object", 25], //5% item drop
		["hashands", 20], //20% meat drop
		["hasclaws", 20], //20% meat drop
		["bite", 15], //15% meat drop
		["animal", 10], //10% meat drop
		["haswings", 12.5], //50% initiative
		["haslegs", 12.5], //50% initiative
		["fast", 12.5], //50% initiative
		["animatedart", 12.5], //50% initiative
		["robot", 10], //10 DR
		["polygonal", 10], //10 DR
		["hasshell", 10], //10 DR
		["hasbones", 5], //5 DR
		["food", 0.5], //1 stench res
		["hasstinger", 0.5], //1 stench res
		["good", 0.5], //1 spooky res
		["evil", 0.5], //1 spooky res
		["reallyevil", 0.5], //1 spooky res
		["hard", 0.5], //1 sleaze res
		["phallic", 0.5], //1 sleaze res
		["edible", 0.5], //1 sleaze res
		["cute", 0.5], //1 sleaze res
		["mineral", 0.5], //1 hot res
		["swims", 0.5], //1 hot res
		["aquatic", 0.5], //1 hot res
		["vegetable", 0.5], //1 cold res
		["wearsclothes", 0.5], //1 cold res
		["isclothes", 0.5], //1 cold res
		["flies", 1], //never fumble
		["insect", 10], //25 max hp
		["software", 10], //25 max hp
		["person", 8], //20 max hp
		["undead", 8], //20 max hp
		["humanoid", 6], //15 max hp
		["organic", 4], //10 max hp
		["sentient", 2], //5 max hp
		["orb", 5], //25 max mp
		["cold", 15], //10 cold dmg
		["hasbeak", 0], //10 weapon dmg. Won't use in zootomist
		["hot", 15], //10 hot dmg
		["sleaze", 15], //10 sleaze dmg
		["spooky", 15], //10 spooky dmg
		["stench", 15], //10 stench dmg
		["cantalk", 1] //-1mp for skills
	]);
	const lNipWeights: Map<string, number> = new Map([
		["animal", 2.5], //25 hp regen
		["animatedart", 0.5], //50% moxie
		["aquatic", 1], //2 hot res
		["bite", 30], //sleaze dmg
		["cantalk", 37.5], //25% myst
		["cold", 30], //20 cold dmg
		["edible", 20], //20 muscle
		["evil", 0], //10 weapon dmg. Won't use in zootomist
		["fast", 150], //30% item drop
		["flies", 12.5], //50% initiative
		["food", 30], //20 stench dmg
		["good", 5], //50% dmg to skeletons
		["hard", 5], //25% weapon drop
		["hasbeak", 150], //30% food drop
		["hasbones", 2.5], //25% dmg to skeletons
		["hasclaws", 4], //20% crit rate
		["haseyes", 2], //4 spooky res
		["hashands", 15], //15 meat drop
		["haslegs", 10], //50% pant drop
		["hasshell", 20], //20 DR
		["hasstinger", 15], //10 spooky dmg
		["haswings", 20], //20 myst
		["hot", 15], //10 hot dmg
		["hovers", 250], //-5% combat
		["insect", 6.25], //25% init
		["isclothes", 2], //4 cold res
		["object", 40], //100 maxhp
		["organic", 500], //+1 fam exp
		["person", 1], //2 stench res
		["phallic", 10], //10 moxie
		["polygonal", 2], //4 sleaze res
		["reallyevil", 250], //-5 combat
		["robot", 37.5], //25% muscle
		["sentient", 10], //5 fam weight
		["sleaze", 50], //50% booze drop
		["software", 10], //50% max mp
		["stench", 5], //50% dmg to zombies
		["technological", 45], //10-20mp per turn
		["undead", 3], //30 dmg to undead
		["vegetable", 2], //20 familiar dmg
		["wearsclothes", 10] //50% gear drop
	]);
	const rNipWeights: Map<string, number> = new Map([
		["animal", 15], //10 stench dmg
		["animatedart", 1], //2 spooky res
		["aquatic", 10], //10 muscle
		["bite", 0], //weapon dmg. Won't use in zootomist
		["cantalk", 20], //100% max mp
		["cold", 2], //4 hot res
		["cute", 37.5], //25% moxie
		["edible", 150], //30% booze drops
		["evil", 30], //20 spooky dmg
		["fast", 25], //100% initiative
		["flies", 20], //20 moxie
		["food", 250], //50% food drops
		["good", 20], //10 fam weight
		["hard", 75], //50% muscle
		["hasbones", 5], //50% dmg to skeletons
		["hasclaws", 10], //50% weapon drop
		["haseyes", 25], //+5% combat
		["hashands", 75], //15% item drop
		["haslegs", 5], //25% gear drop
		["hasshell", 20], //20 DR
		["hasstinger", 2], //2x crit hit chance
		["haswings", 12.5], //50% init
		["hot", 1], //2 cold res
		["insect", 500], //1 fam exp
		["isclothes", 5], //25% pant drop
		["mineral", 20], //20 DR
		["object", 2], //4 stench res
		["orb", 10], //10 myst
		["organic", 1], //10 fam dmg
		["person", 30], //30% meat drop
		["phallic", 5], //5 pool skill
		["polygonal", 15], //10 sleaze dmg
		["reallyevil", 0], //20 weapon dmg. Won't use in zootomist
		["robot", 30], //20 hot dmg
		["sentient", 75], //50% myst
		["software", 75], //20-30 mp regen
		["spooky", 5], //50 ghost dmg
		["stench", 25], //+5% combat
		["swims", 15], //10 cold dmg
		["technological", 15], //10-20 hp regen
		["undead", 3], //30 dmg to undead
		["vegetable", 1], //2 sleaze res
		["wearsclothes", 50] //50% max hp
	]);
	const footParam: Map<string, string> = new Map([
		["bite", "instakill"],
		["cute", "instakill"],
		["evil", "instakill"],
		["food", "instakill"],
		["hasstinger", "instakill"],
		["object", "instakill"],
		["reallyevil", "instakill"],
		["stench", "instakill"],
		["animatedart", "banish"],
		["hard", "banish"],
		["hasbones", "banish"],
		["haslegs", "banish"],
		["haswings", "banish"],
		["spooky", "banish"],
		["swims", "banish"],
		["vegetable", "banish"],
		["hasbeak", "pp"],
		["hasclaws", "pp"],
		["hashands", "pp"],
		["isclothes", "pp"],
		["polygonal", "pp"],
		["sleaze", "pp"],
		["technological", "pp"],
		["wearsclothes", "pp"],
		["aquatic", "heal"],
		["cold", "heal"],
		["edible", "heal"],
		["good", "heal"],
		["organic", "heal"],
		["person", "heal"],
		["phallic", "heal"],
		["undead", "heal"],
		["animal", "sniff"],
		["haseyes", "sniff"],
		["hot", "sniff"],
		["humanoid", "sniff"],
		["mineral", "sniff"],
		["orb", "sniff"],
		["sentient", "sniff"],
		["software", "sniff"]
	]);
	const footWeights: Map<string, number> = new Map([
		["instakill", 10],
		["banish", 10],
		["pp", 5],
		["heal", 5],
		["sniff", 5]
	]);
	const blacklistFams: Familiar[] = Familiar.get(["Reassembled Blackbird", "Reconstituted Crow", "Homemade Robot"]);
	for (const fam of Familiar.get(["Mosquito", "Leprechaun", "Levitating Potato", "Angry Goat", "Sabre-Toothed Lime", "Fuzzy Dice", "Spooky Pirate Skeleton", "Barrrnacle", "Howling Balloon Monkey", "Stab Bat", "Grue", "Blood-Faced Volleyball", "Ghuol Whelp", "Baby Gravy Fairy", "Cocoabo", "Star Starfish", "Hovering Sombrero", "Ghost Pickle on a Stick", "Killer Bee", "Whirling Maple Leaf", "Coffee Pixie", "Cheshire Bat", "Jill-O-Lantern", "Hand Turkey", "Crimbo Elf", "Hanukkimbo Dreidl", "Baby Yeti", "Feather Boa Constrictor", "Emo Squid", "Personal Raincloud", "Clockwork Grapefruit", "MagiMechTech MicroMechaMech", "Flaming Gravy Fairy", "Frozen Gravy Fairy", "Stinky Gravy Fairy", "Spooky Gravy Fairy", "Inflatable Dodecapede", "Pygmy Bugbear Shaman", "Doppelshifter", "Attention-Deficit Demon", "Cymbal-Playing Monkey", "Temporal Riftlet", "Sweet Nutcracker", "Pet Rock", "Snowy Owl", "Teddy Bear", "Ninja Pirate Zombie Robot", "Sleazy Gravy Fairy", "Wild Hare", "Wind-up Chattering Teeth", "Spirit Hobo", "Astral Badger", "Comma Chameleon", "Misshapen Animal Skeleton", "Scary Death Orb", "Jitterbug", "Nervous Tick", "Reassembled Blackbird", "Origami Towel Crane", "Ninja Snowflake", "Evil Teddy Bear", "Toothsome Rock", "Ancient Yuletide Troll", "Dandy Lion", "O.A.F.", "Penguin Goodfella", "Jumpsuited Hound Dog", "Green Pixie", "Ragamuffin Imp", "Exotic Parrot", "Wizard Action Figure", "Gluttonous Green Ghost", "Casagnova Gnome", "Hunchbacked Minion", "Crimbo P. R. E. S. S. I. E.", "Bulky Buddy Box", "Teddy Borg", "RoboGoose", "El Vibrato Megadrone", "Mad Hatrack", "Adorable Seal Larva", "Untamed Turtle", "Animated Macaroni Duck", "Pet Cheezling", "Autonomous Disco Ball", "Mariachi Chihuahua", "Hobo Monkey", "Llama Lama", "Cotton Candy Carnie", "Disembodied Hand", "Black Cat", "Uniclops", "Psychedelic Bear", "Baby Mutant Rattlesnake", "Mutant Fire Ant", "Mutant Cactus Bud", "Mutant Gila Monster", "Cuddlefish", "Sugar Fruit Fairy", "Imitation Crab", "Pair of Ragged Claws", "Magic Dragonfish", "Frumious Bandersnatch", "Midget Clownfish", "Syncopated Turtle", "Grinning Turtle", "Purse Rat", "Wereturtle", "Baby Sandworm", "Slimeling", "He-Boulder", "Rock Lobster", "Urchin Urchin", "Grouper Groupie", "Squamous Gibberer", "Dancing Frog", "Chauvinist Pig", "Stocking Mimic", "Snow Angel", "Jack-in-the-Box", "BRICKO chick", "Baby Bugged Bugbear", "Money-Making Goblin", "Floating Eye", "Vampire Bat", "Oyster Bunny", "Egg Benedict", "Bank Piggy", "Worm Doctor", "Snowhitman", "Plastic Grocery Bag", "Underworld Bonsai", "Rogue Program", "Mini-Hipster", "Pottery Barn Owl", "Hippo Ballerina", "Knob Goblin Organ Grinder", "Piano Cat", "Dramatic Hedgehog", "Smiling Rat", "Robot Reindeer", "Holiday Log", "Obtuse Angel", "Reconstituted Crow", "Li'l Xenomorph", "Dataspider", "Pair of Stomping Boots", "Feral Kobold", "Fancypants Scarecrow", "Bloovian Groose", "Blavious Kloop", "Peppermint Rhino", "Tickle-Me Emilio", "Steam-Powered Cheerleader", "Happy Medium", "Artistic Goth Kid", "Flaming Face", "Reagnimated Gnome", "Hovering Skull", "Mini-Skulldozer", "Angry Jung Man", "Unconscious Collective", "Nanorhino", "Oily Woim", "Homemade Robot", "MiniMechaElf", "Gelatinous Cubeling", "Adorable Space Buddy", "Nosy Nose", "Mini-Adventurer", "Mechanical Songbird", "Reanimated Reanimator", "Warbear Drone", "Grimstone Golem", "Grim Brother", "Miniature Sword & Martini Guy", "Putty Buddy", "Twitching Space Critter", "Galloping Grill", "Helix Fossil", "Xiblaxian Holo-Companion", "Baby Z-Rex", "Fist Turkey", "Crimbo Shrub", "Mini-Crimbot", "Topiary Skunk", "Golden Monkey", "Adventurous Spelunker", "Sludgepuppy", "Baby Mayonnaise Wasp", "Puck Man", "Ms. Puck Man", "Lil' Barrel Mimic", "Machine Elf", "Choctopus", "Rockin' Robin", "Restless Cow Skull", "Intergnat", "Software Bug", "Bark Scorpion", "Trick-or-Treating Tot", "Chocolate Lab", "Bad Vibe", "Space Jellyfish", "Optimistic Candle", "Robortender", "Cute Meteor", "XO Skeleton", "Garbage Fire", "Globmule", "Bluzzard", "Faux", "Sledgehamster", "Pimpsqueak", "Pillowbug", "Dressage", "Sequestrian", "Carpricorn", "Turpin", "Morphan", "Cycloney", "Peaclock", "Turtive", "Lepardner", "Aiolion", "Waifuton", "Gorillape", "Wendtigo", "Snoutlet", "Ruffalo", "Vaporpoise", "Ghosprey", "Straypler", "Flan", "Mustardigrade", "Ched", "Gazelleton", "Mechamelion", "Bicycle", "Vamprey", "Wullabye", "Nursine", "Cantelope", "Ungulant", "Caramel", "Oppossum", "Amanitee", "Smashmoth", "Vulgure", "Squib", "Trafikoan", "Slotter", "Shudder", "Glamare", "Unspeakachu", "Stooper", "Disgeist", "Bowlet", "Cornbeefadon", "Mu", "God Lobster", "Cat Burglar", "Party Mouse", "Yule Hound", "Sausage Golem", "Elf Operative", "Plastic Pirate Skull", "Pet Coral", "Pocket Professor", "Red-Nosed Snapper", "Antique Nutcracker", "Piranha Plant", "Left-Hand Man", "Melodramedary", "Ghost of Crimbo Carols", "Ghost of Crimbo Cheer", "Ghost of Crimbo Commerce", "Shorter-Order Cook", "Vampire Vintner", "Arachnelf", "Synthetic Rock", "Grey Goose", "Cookbookbat", "Mini-Trainbot", "Hobo in Sheep's Clothing", "Pixel Rock", "Patriotic Eagle", "Jill-of-All-Trades", "Flaming Leafcutter Ant", "Rigging Snake", "Pet Anchor", "Chest Mimic", "Mini Kiwi", "Proto-Protozoa", "Evolving Organism", "Burly Bodyguard", "Doll Moll", "Emberiza Aureola", "Peace Turkey", "Quantum Entangler", "Golden Pet Rock", "Profane Parrot", "Significant Bit", "Heat Wave", "Cold Cut", "Shame Spiral", "Phantom Limb", "Foul Ball", "Dire Cassava", "Observer", "Cool Cucumber", "Defective Childrens' Stapler", "Glover", "Zapper Bug", "Wet Paper Tiger", "Cooler Yeti", "Baby Skeleton", "Skeleton of Crimbo Past", "Tiny Plastic Santa Claus Skeleton", "Cute Skeletal Dinosaur", "Sword of S Words"]))
	{
		//comment out below line and uncomment second below line to see all unrestricted fams
		if (auto_have_familiar(fam) && !(blacklistFams.includes(fam)))
		{
		//if(is_unrestricted(fam))
			famAttributes.set(fam, fam.attributes);
		}
	}
	for (const [fam, attr] of famAttributes)
	{
		const attrs: Map<number, string> = new Map(splitString(attr, "; ").map((_v, _i) => [_i, _v]));
		//buffs
		for (const [k, a] of attrs)
		{
			intrinsicFams.set(fam, (intrinsicFams.get(fam) ?? 0.0) + (intrinsicWeights.get(a) ?? intrinsicWeights.set(a, 0.0).get(a)));
			lbuffFams.set(fam, (lbuffFams.get(fam) ?? 0.0) + (lNipWeights.get(a) ?? lNipWeights.set(a, 0.0).get(a)));
			rbuffFams.set(fam, (rbuffFams.get(fam) ?? 0.0) + (rNipWeights.get(a) ?? rNipWeights.set(a, 0.0).get(a)));
			kickFams.set(fam, (kickFams.get(fam) ?? 0.0) + (footWeights.get((footParam.get(a) ?? footParam.set(a, "").get(a))) ?? footWeights.set((footParam.get(a) ?? footParam.set(a, "").get(a)), 0).get((footParam.get(a) ?? footParam.set(a, "").get(a)))));
		}
	}
	// Function for sorting familiars by their weights
	function sortFams(map: Map<Familiar, number>): Map<number, Familiar>
	{
		// Make an indexed list of the familiars
		let ranked_list: Map<number, Familiar> = new Map();
		for (const entry of map.keys())
		{
			ranked_list.set(ranked_list.size, entry);
		}
		// Sort by their weight, high to low
		ranked_list = new Map(
			[...ranked_list.entries()]
				.map(([index, value]) => {
					return { _k: index, _v: value, _expr: -(map.get(value) ?? map.set(value, 0.0).get(value)) };
				})
				.sort((_a, _b) => _a._expr < _b._expr ? -1 : (_a._expr > _b._expr ? 1 : 0))
				.map(e => [e._k, e._v])
		);
		return ranked_list;
	}

	const used: Map<Familiar, boolean> = new Map();
	const intrinsicFam: Map<number, Familiar> = new Map();
	let lbuffFam: Familiar = zoo_graftedToPart($_f_ZOOPART_L_NIPPLE);
	let rbuffFam: Familiar = zoo_graftedToPart($_f_ZOOPART_R_NIPPLE);
	let lkickFam: Familiar = zoo_graftedToPart($_f_ZOOPART_L_FOOT);
	let rkickFam: Familiar = zoo_graftedToPart($_f_ZOOPART_R_FOOT);
	let lpunchFam: Familiar = zoo_graftedToPart($_f_ZOOPART_L_HAND);
	let rpunchFam: Familiar = zoo_graftedToPart($_f_ZOOPART_R_HAND);

	if (rbuffFam === Familiar.none)
	{
		for (const [i, fam] of sortFams(rbuffFams))
		{
			if (!(used.has(fam)))
			{
				rbuffFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}

	if (lbuffFam === Familiar.none)
	{
		for (const [i, fam] of sortFams(lbuffFams))
		{
			if (!(used.has(fam)))
			{
				lbuffFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}

	if (lkickFam === Familiar.none)
	{
		for (const fam of Familiar.get(["Quantum Entangler", "Foul Ball", "Defective Childrens' Stapler"]))
		{
			if (auto_have_familiar(fam))
			{
				lkickFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}

	if (lkickFam === Familiar.none)
	{
		for (const [i, fam] of sortFams(kickFams))
		{
			if (!(used.has(fam)))
			{
				lkickFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}

	let intrinsic_index: number = 0;
	for (const [i, fam] of sortFams(intrinsicFams))
	{
		// We only need enough to fill our empty graft slots
		if (intrinsicFam.size >= 5 - zoo_graftedIntrinsicFams().size)
		{
			break;
		}
		if (!(used.has(fam)))
		{
			intrinsicFam.set(intrinsic_index++, fam);
			used.set(fam, true); // should probably not add to used if we already have grafts that will prevent this ever being used
		}
	}
	// Right kick banishes (cassava and limb are super-banishes, magimech is OK)
	if (rkickFam === Familiar.none)
	{
		for (const fam of Familiar.get(["Dire Cassava", "Phantom Limb", "MagiMechTech MicroMechaMech"]))
		{
			if (auto_have_familiar(fam))
			{
				rkickFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}
	// Backup right kick options
	if (rkickFam === Familiar.none)
	{
		for (const [i, fam] of sortFams(kickFams))
		{
			if (!(used.has(fam)))
			{
				rkickFam = fam;
				used.set(fam, true);
				break;
			}
		}
	}
	// Punch familiars, hardcoded for now.
	// Barrrnacle can kill everything in-run, so a good default choice
	// Burly bodyguard levels up with AG path progression so can be grafted faster.
	// Cold cut is a pure cold punch, can be useful for certain monsters (smorcs, war boss)
	// volleyball and mosquito and fairyas backups. Everybody needs somebody to punch.
	const punchPotential: Map<number, Familiar> = new Map();
	let ipunch: number = 0;
	for (const fam of Familiar.get(["Barrrnacle", "Cold Cut", "Blood-Faced Volleyball", "Mosquito", "Baby Gravy Fairy"]))
	{
		if (ipunch === 1 && auto_have_familiar(Familiar.get("Burly Bodyguard"))) {
			punchPotential.set(ipunch++, Familiar.get("Burly Bodyguard"));
		}
		punchPotential.set(ipunch++, fam);
	}

	for (let ifam: number = 0; ifam < punchPotential.size; ifam++)
	{
		const fam: Familiar = (punchPotential.get(ifam) ?? punchPotential.set(ifam, Familiar.none).get(ifam));
		if (auto_have_familiar(fam) && !(used.has(fam)))
		{
			if (lpunchFam === Familiar.none)
			{
				lpunchFam = fam;
				used.set(fam, true);
			}
			else if (rpunchFam === Familiar.none)
			{
				rpunchFam = fam;
				used.set(fam, true);
			}
		}
	}

	if (verbose)
	{
		auto_log_info("Best Right nipple fams", "purple");
		auto_log_info(`${rbuffFam}:${(rbuffFams.get(rbuffFam) ?? rbuffFams.set(rbuffFam, 0.0).get(rbuffFam))}`, "purple");
		auto_log_info("Best Left nipple fams", "blue");
		auto_log_info(`${lbuffFam}:${(lbuffFams.get(lbuffFam) ?? lbuffFams.set(lbuffFam, 0.0).get(lbuffFam))}`, "blue");
		auto_log_info("Best Left Foot Fam", "green");
		auto_log_info(`${lkickFam}:${(kickFams.get(lkickFam) ?? kickFams.set(lkickFam, 0.0).get(lkickFam))}`, "green");
		auto_log_info("Best Head, Shoulder, and Butt Fam", "orange");
		if (intrinsicFam.size > 0)
		{
			for (const [i, fam] of intrinsicFam)
			{
				auto_log_info(`${fam}:${(intrinsicFams.get(fam) ?? intrinsicFams.set(fam, 0.0).get(fam))}`, "orange");
			}
		}
		else {
			auto_log_info("All slots occupied", "orange");
		}
		auto_log_info("Best Right Foot Fam", "green");
		auto_log_info(`${rkickFam}:${(kickFams.get(rkickFam) ?? kickFams.set(rkickFam, 0.0).get(rkickFam))}`, "red");
		auto_log_info("Best Left Hand Fam", "red");
		auto_log_info(lpunchFam.toString(), "red");
		auto_log_info("Best Right Hand Fam", "red");
		auto_log_info(rpunchFam.toString(), "red");
	}

	const bestIntrinsicFam: Familiar = (intrinsicFam.get(0) ?? intrinsicFam.set(0, Familiar.none).get(0));
	switch (bodyPart)
	{
		case $_f_ZOOPART_HEAD:
		case $_f_ZOOPART_L_SHOULDER:
		case $_f_ZOOPART_R_SHOULDER:
		case $_f_ZOOPART_L_BUTTOCK:
		case $_f_ZOOPART_R_BUTTOCK:
			return bestIntrinsicFam;
		case $_f_ZOOPART_L_HAND:
			return lpunchFam;
		case $_f_ZOOPART_R_HAND:
			return rpunchFam;
		case $_f_ZOOPART_L_NIPPLE:
			return lbuffFam;
		case $_f_ZOOPART_R_NIPPLE:
			return rbuffFam;
		case $_f_ZOOPART_L_FOOT:
			return lkickFam;
		case $_f_ZOOPART_R_FOOT:
			return rkickFam;
	}
	return Familiar.none;
}

function zoo_getNextPart(): number
{
	if (!in_zootomist() || myLevel() > 11) { return $_f_ZOOPART_NONE; }
	const bpp: Map<number, number> = zoo_getBodyPartPriority();
	for (let ipart: number = 0; ipart < bpp.size; ipart++)
	{
		const part: number = (bpp.get(ipart) ?? bpp.set(ipart, 0).get(ipart));
		if (zoo_graftedToPart(part) === Familiar.none) { return part; }
	}
	return $_f_ZOOPART_NONE;
}

function zoo_getNextFam(): Familiar
{
	if (!in_zootomist() || myLevel() > 11) { return Familiar.none; }
	return zoo_getBestFam$1(zoo_getNextPart(), false);
}

export function zoo_graftFam(): boolean
{
	if (!in_zootomist() || myLevel() >= 13)
	{
		return false;
	}
	/*Body parts are identified by number
	1 = head
	2 = left shoulder
	3 = right shoulder
	4 = left hand
	5 = right hand
	6 = right nipple
	7 = left nipple
	8 = left butt cheek
	9 = right butt cheek
	10 = left foot
	11 = right foot
	Each body part is categorized by what it gives when a familiar is grafted to it.
	intrinsic provides the intrinsic buff and adds to it.
	punch is a combat damage skill
	lbuff is left nipple buff
	rbuff is right nipple buff
	combat is a useful combat skill (yr, olfact, banish)
	*/
	const bodyPartType: Map<number, string> = new Map([
		[$_f_ZOOPART_HEAD, "intrinsic"],
		[$_f_ZOOPART_L_SHOULDER, "intrinsic"],
		[$_f_ZOOPART_R_SHOULDER, "intrinsic"],
		[$_f_ZOOPART_L_HAND, "punch"],
		[$_f_ZOOPART_R_HAND, "punch"],
		[$_f_ZOOPART_L_NIPPLE, "lbuff"],
		[$_f_ZOOPART_R_NIPPLE, "rbuff"],
		[$_f_ZOOPART_L_BUTTOCK, "intrinsic"],
		[$_f_ZOOPART_R_BUTTOCK, "intrinsic"],
		[$_f_ZOOPART_L_FOOT, "kick"],
		[$_f_ZOOPART_R_FOOT, "kick"]
	]);
	const bodyPartName: Map<number, string> = new Map([
		[$_f_ZOOPART_HEAD, "head"],
		[$_f_ZOOPART_L_SHOULDER, "left shoulder"],
		[$_f_ZOOPART_R_SHOULDER, "right shoulder"],
		[$_f_ZOOPART_L_HAND, "left hand"],
		[$_f_ZOOPART_R_HAND, "right hand"],
		[$_f_ZOOPART_L_NIPPLE, "left nipple"],
		[$_f_ZOOPART_R_NIPPLE, "right nipple"],
		[$_f_ZOOPART_L_BUTTOCK, "left butt cheek"],
		[$_f_ZOOPART_R_BUTTOCK, "right butt cheek"],
		[$_f_ZOOPART_L_FOOT, "left foot"],
		[$_f_ZOOPART_R_FOOT, "right foot"]
	]);

	while (zoo_getNextPart() !== $_f_ZOOPART_NONE)
	{
		const p: number = zoo_getNextPart();
		const existing_graft: Familiar = zoo_graftedToPart(p);
		if (existing_graft !== Familiar.none) { continue; }
		const fam: Familiar = zoo_getBestFam$1(p, false);
		handleFamiliar$1(fam);
		const next_graft_weight: number = zoo_nextGraftWeight();
		if (familiarWeight(fam) < next_graft_weight)
		{
			//can only graft if the fam is higher than the level at the last graft
			zoo_boostWeight$1(fam, next_graft_weight);
			return false;
		}
		equip(fam, Item.none); //unequip fam equipment to not lose it, just in case
		visitUrl("place.php?whichplace=graftinglab&action=graftinglab_chamber");
		visitUrl(`choice.php?pwd=&whichchoice=1553&option=1&slot=${p}&fam=${toInt(fam)}`);
		auto_log_info(`Grafting a ${fam} to you`, "blue");
		handleTracker$1(fam.toString(), `Grafted to ${(bodyPartName.get(p) ?? bodyPartName.set(p, "").get(p))}`, "auto_tracker_path");
		refreshStatus();
		return true;
	}

	auto_log_info$1("No more to graft");
	return false;
}

function zoo_nextGraftWeight(): number
{
	return min(myLevel() + 2, 13);
}

function zoo_boostWeight(f: Familiar): boolean
{
	return zoo_boostWeight$1(f, zoo_nextGraftWeight());
}

function zoo_boostWeight$1(f: Familiar, target_weight: number): boolean
{
	if (myFamiliar() !== f)
	{
		useFamiliar(f);
	}
	// We want a fight with the bodyguard before we consider boosting because it superlevels first combat
	if (f === Familiar.get("Burly Bodyguard"))
	{
		if (f.experience === 0)
		{
			return false;
		}
	}

	const experience_needed: number = target_weight * target_weight - f.experience;

	const mayam_exp: number = 100;
	const piccolo_exp: number = 40;
	const specimen_exp: number = 20;

	let mayamavailable: boolean = auto_haveMayamCalendar() && !auto_MayamIsUsed("fur") && !auto_MayamAllUsed();

	provideFamExp(toInt(min(25, experience_needed)), Location.get("The Outskirts of Cobb's Knob"), true, true, false);
	const fight: number = numericModifier("familiar experience") + 1;
	auto_log_info$1(`${f} needs ${experience_needed} experience`);
	auto_log_info$1("To level up your familiar, you should:");
	let amt: number = 0;
	let diff: number = experience_needed - amt;
	while (diff >= 1)
	{
		if (diff >= 100 && mayamavailable)
		{
			auto_log_info$1("Use the Mayam calendar and get fur on the outer ring");
			amt += mayam_exp;
			auto_MayamClaim("fur wood yam clock");
			handleTracker$1(f.toString(), `Mayam fur used to ${f.experience} XP {${familiarWeight(f)} lb}`, "auto_tracker_path");
			mayamavailable = false;
		}
		else if (diff >= 40 && auto_AprilPiccoloBoostsLeft() > 0)
		{
			auto_log_info$1("Play the Apriling Band Piccolo");
			amt += piccolo_exp;
			auto_playAprilPiccolo();
		}
		else if (diff >= 20 && zoo_specimenPreparationsLeft() > 0)
		{
			auto_log_info$1("Try to use the Specimen Preparation Bench");
			amt += specimen_exp;
			zoo_prepareSpecimen();
		}
		else if (diff <= 0)
		{
			return true;
		}
		else {
			const fights_needed: number = ceil(diff / fight);
			auto_log_info$1(`Do ${fights_needed} (preferably free) fights`);
			amt += fight * fights_needed;
		}
		diff = experience_needed - amt;
		auto_log_info$1(`Diff = ${diff}`);
	}
	return false;
}

export function getZooKickYR(): Skill
{
	function isYR$1(fam_id: number): boolean {
		const fam: Familiar = toFamiliar(fam_id);
		return Familiar.get(["Quantum Entangler", "Foul Ball", "Defective Childrens' Stapler"]).includes(fam);
	}
	if (isYR$1(toInt(getProperty("zootGraftedFootLeftFamiliar")))) {
		return Skill.get("Left %n Kick");
	}
	if (isYR$1(toInt(getProperty("zootGraftedFootRightFamiliar")))) {
		return Skill.get("Right %n Kick");
	}
	return Skill.none;
}

function getZooKickFreeKill(): Skill
{ //different than YR. Better than instakill
	function isYR(fam_id: number): boolean {
		const fam: Familiar = toFamiliar(fam_id);
		return Familiar.get(["Quantum Entangler", "Foul Ball", "Defective Childrens' Stapler"]).includes(fam);
	}
	if (isYR(toInt(getProperty("zootGraftedFootLeftFamiliar")))) {
		return Skill.get("Left %n Kick");
	}
	if (isYR(toInt(getProperty("zootGraftedFootRightFamiliar")))) {
		return Skill.get("Right %n Kick");
	}
	return Skill.none;
}

export function getZooKickSniff(): Skill
{
	const haveYR: boolean = yellowRayCombatString$1(Monster.none, false) !== ""; //Could potentially Yellow Ray. We want false because the item might not be bought/equipped
	if (leftKickHasSniff() && (leftKickHasInstaKill() && !haveYR)) {
		return Skill.get("Left %n Kick");
	}
	if (rightKickHasSniff() && (rightKickHasInstaKill() && !haveYR)) {
		return Skill.get("Right %n Kick");
	}
	return Skill.none;
}

export function getZooKickBanish(): Skill
{
	if (haveEffect(Effect.get("Everything Looks Blue")) > 0) { return Skill.none; }
	function isBanish(fam_id: number): boolean {
		const fam: Familiar = toFamiliar(fam_id);
		return Familiar.get(["Dire Cassava", "Phantom Limb", "MagiMechTech MicroMechaMech"]).includes(fam);
	}
	if (isBanish(toInt(getProperty("zootGraftedFootLeftFamiliar")))) {
		return Skill.get("Left %n Kick");
	}
	if (isBanish(toInt(getProperty("zootGraftedFootRightFamiliar")))) {
		return Skill.get("Right %n Kick");
	}
	return Skill.none;
}

function getZooKickPickpocket(): Skill
{
	const haveYR: boolean = yellowRayCombatString$1(Monster.none, false) !== ""; //Could potentially Yellow Ray. We want false because the item might not be bought/equipped
	if (leftKickHasPickpocket() && (leftKickHasInstaKill() && !haveYR) && getZooKickBanish() !== Skill.get("Left %n Kick")) {
		return Skill.get("Left %n Kick");
	}
	if (rightKickHasPickpocket() && (rightKickHasInstaKill() && !haveYR) && getZooKickBanish() !== Skill.get("Right %n Kick")) {
		return Skill.get("Right %n Kick");
	}
	return Skill.none;
}

export function getZooKickInstaKill(): Skill
{
	//Only instakill if we can't yellow ray
	if (yellowRayCombatString$1(Monster.none, false) !== "")
	{ //Could potentially Yellow Ray. We want false because the item might not be bought/equipped
		return Skill.none;
	}
	//uncomment return $skill[kick] and comment return $skill[none] if you want us to auto use your instakill. Not recommended
	if (leftKickHasInstaKill()) {
		//return $skill[left %n kick];
		return Skill.none;
	}
	if (rightKickHasInstaKill()) {
		//return $skill[right %n kick];
		return Skill.none;
	}
	return Skill.none;
}

export function getZooBestPunch(): Skill
{
	return getZooBestPunch$1(Monster.get("fluffy bunny"));
}

export function getZooBestPunch$1(m: Monster): Skill
{
	if (haveSkill(Skill.get("Left %n Punch")))
	{
		return Skill.get("Left %n Punch");
	}
	else {
		return Skill.none;
	}
}

function leftKickHasSniff(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_L_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const sniffs: Map<number, string> = new Map([
		[0, "animal"],
		[1, "haseyes"],
		[2, "hot"],
		[3, "humanoid"],
		[4, "mineral"],
		[5, "orb"],
		[6, "sentient"],
		[7, "software"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, sniff] of sniffs)
		{
			if (sniff === attr)
			{
				return true;
			}
		}
	}
	return false;
}

function leftKickHasPickpocket(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_L_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const pps: Map<number, string> = new Map([
		[0, "hasbeak"],
		[1, "hasclaws"],
		[2, "hashands"],
		[3, "isclothes"],
		[4, "polygonal"],
		[5, "sleaze"],
		[6, "technological"],
		[7, "wearsclothes"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, pp] of pps)
		{
			if (pp === attr)
			{
				return true;
			}
		}
	}
	return false;
}

function leftKickHasInstaKill(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_L_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const instakills: Map<number, string> = new Map([
		[0, "bite"],
		[1, "cute"],
		[2, "evil"],
		[3, "food"],
		[4, "hasstinger"],
		[5, "object"],
		[6, "reallyevil"],
		[7, "stench"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, instakill] of instakills)
		{
			if (instakill === attr)
			{
				return true;
			}
		}
	}
	return false;
}

function rightKickHasSniff(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_R_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const sniffs: Map<number, string> = new Map([
		[0, "animal"],
		[1, "haseyes"],
		[2, "hot"],
		[3, "humanoid"],
		[4, "mineral"],
		[5, "orb"],
		[6, "sentient"],
		[7, "software"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, sniff] of sniffs)
		{
			if (sniff === attr)
			{
				return true;
			}
		}
	}
	return false;
}

function rightKickHasPickpocket(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_R_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const pps: Map<number, string> = new Map([
		[0, "hasbeak"],
		[1, "hasclaws"],
		[2, "hashands"],
		[3, "isclothes"],
		[4, "polygonal"],
		[5, "sleaze"],
		[6, "technological"],
		[7, "wearsclothes"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, pp] of pps)
		{
			if (pp === attr)
			{
				return true;
			}
		}
	}
	return false;
}

function rightKickHasInstaKill(): boolean
{
	const fAttrs: string = zoo_graftedToPart($_f_ZOOPART_R_FOOT).attributes;
	const attrs: Map<number, string> = new Map(splitString(fAttrs, "; ").map((_v, _i) => [_i, _v]));
	const instakills: Map<number, string> = new Map([
		[0, "bite"],
		[1, "cute"],
		[2, "evil"],
		[3, "food"],
		[4, "hasstinger"],
		[5, "object"],
		[6, "reallyevil"],
		[7, "stench"]
	]);
	for (const [i, attr] of attrs)
	{
		for (const [j, instakill] of instakills)
		{
			if (instakill === attr)
			{
				return true;
			}
		}
	}
	return false;
}

export function LX_zootoFight(): boolean
{
	if (!in_zootomist() || myLevel() >= 13)
	{
		return false;
	}

	function additionalFights(): boolean
	{
		if (L5_getEncryptionKey())
		{
			return true;
		}

		if (LX_unlockHauntedBilliardsRoom(false))
		{
			return true;
		}

		if (LX_unlockHiddenTemple())
		{
			return true;
		}
		if (LX_lastChance())
		{ //Should be high enough level by this point to handle these zones
			return true;
		}
		return false;
	}
	// Set our familiar
	handleFamiliar$1(zoo_getNextFam());

	const target_weight: number = zoo_nextGraftWeight();
	const expToLevel: number = target_weight * target_weight - myFamiliar().experience;
	// We want lots of XP
	provideFamExp$3(min(25, expToLevel), true, true);

	if (myLevel() >= 9)
	{ // If we have Mayam, let's get that stone wool and unlock our Mayam.
		if (auto_haveMayamCalendar() && toInt(getProperty("lastTempleAdventures")) < myAscensions())
		{
			if (availableAmount(Item.get("stone wool")) < 2 && internalQuestStatus("questL11Worship") < 0)
			{
				if (LX_killBaaBaaBuran()) { return true; }
			}
			if (auto_doTempleSummit()) { return true; }
		}
	}

	if (myLevel() >= 7)
	{
		if (auto_doPhoneQuest())
		{
			return true;
		}
		// should get wishes in Shadow Rift. If not can't do this

		if (yellowRayCombatString$1(Monster.none, false) !== "")
		{
			if (toBoolean(getProperty("auto_hippyInstead")) && !possessOutfit$1("War Hippy Fatigues"))
			{
				adjustForYellowRayIfPossible$1();
				return summonMonster(Monster.get("War Hippy Airborne Commander"));
			}
			else if (!possessOutfit$1("Frat Warrior Fatigues"))
			{
				adjustForYellowRayIfPossible$1();
				return summonMonster(Monster.get("War Frat Mobile Grill Unit"));
			}
		}
		if (auto_have_familiar(Familiar.get("Jill-of-All-Trades")) && candyBlockOutfit("treat") !== "")
		{
			if (candyBlock())
			{
				return true;
			}
			if (!toBoolean(getProperty("_mapToACandyRichBlockUsed")))
			{
				while (itemAmount(Item.get("map to a candy-rich block")) === 0)
				{
					handleFamiliar$1(Familiar.get("Jill-of-All-Trades"));
					if (L7_defiledNook())
					{ //Need eyes anyway so might as well try to get a couple while getting the map
						return true;
					}
					else {
						additionalFights(); //didn't get a map trying to complete the Nook so doing additional combats
					}
				}
			}
		}
	}
	if (myLevel() >= 5)
	{
		if (speakeasyCombat())
		{
			return true;
		}
		if (auto_fightFlamingLeaflet())
		{
			return true;
		}
	}
	// Do the temple unlock first, so we can get stone wool to reset our mayam
	if (auto_haveMayamCalendar() && myLevel() >= 2)
	{
		if (LX_unlockHiddenTemple())
		{
			return true;
		}
	}

	if (additionalFights())
	{
		return true;
	}

	return false;
}
