import { abort, bjornifyFamiliar, cliExecute, containsText, create, Effect, Element, equippedItem, Familiar, getCampground, getCounters, getProperty, haveEffect, haveFamiliar, inHardcore, isUnrestricted, Item, itemAmount, Location, Monster, myAdventures, myBjornedFamiliar, myDaycount, myFamiliar, myLevel, Phylum, print, runChoice, setProperty, Slot, splitString, storageAmount, toBoolean, toInt, toMonster, use, userConfirm, visitUrl } from "kolmafia";
import { canPull$1, pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$1, autoAdv$2 } from "../auto_adventure";
import { fullness_left, inebriety_left } from "../auto_consume";
import { possessEquipment } from "../auto_equipment";
import { canChangeFamiliar, canChangeToFamiliar, handleFamiliar$1 } from "../auto_familiar";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { auto_can_equip, auto_is_valid, auto_log_info, auto_log_warning, internalQuestStatus } from "../auto_util";
import { elementalPlanes_access } from "./elementalPlanes";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_robot } from "../paths/you_robot";
import { bridgeGoal } from "../quests/level_09";
import { ns_crowd3 } from "../quests/level_13";

//	This is meant for items that have a date of 2014.
//	Handling: Bjorn, Little Geneticist DNA-Splicing Lab, Xi-Receiver Unit
//

//Defined in autoscend/iotms/mr2014.ash
export function handleBjornify(fam: Familiar): boolean
{
	if (inHardcore())
	{
		return false;
	}

	if (equippedItem(Slot.get("back")) !== Item.get("Buddy Bjorn"))
	{
		return false;
	}

	if (myBjornedFamiliar() === fam)
	{
		return true;
	}

	if (!canChangeFamiliar() && fam === myFamiliar())
	{
		return false;
	}

	if (haveFamiliar(fam))
	{
		bjornifyFamiliar(fam);
	}
	else {
		if (haveFamiliar(Familiar.get("El Vibrato Megadrone")))
		{
			bjornifyFamiliar(Familiar.get("El Vibrato Megadrone"));
		}
		else {
			if (myFamiliar() !== Familiar.get("Grimstone Golem") && haveFamiliar(Familiar.get("Grimstone Golem")))
			{
				bjornifyFamiliar(Familiar.get("Grimstone Golem"));
			}
			else if (haveFamiliar(Familiar.get("Adorable Seal Larva")))
			{
				bjornifyFamiliar(Familiar.get("Adorable Seal Larva"));
			}
			else {
				return false;
			}
		}
	}
	return true;
}

export function considerGrimstoneGolem(bjornCrown: boolean): boolean
{
	if (!haveFamiliar(Familiar.get("Grimstone Golem")))
	{
		return false;
	}
	if (!auto_is_valid(Item.get("grimstone mask")))
	{
		return false;
	}

	if (bjornCrown && toInt(getProperty("_grimstoneMaskDropsCrown")) !== 0)
	{
		return false;
	}

	if (toInt(getProperty("desertExploration")) >= 70 && toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal() - 1)
	{
		return false;
	}

	if (toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal() - 1)
	{
		if (!toBoolean(getProperty("auto_grimstoneOrnateDowsingRod")))
		{
			return false;
		}
		if (!auto_is_valid(Item.get("grimstone mask")))
		{
			return false;
		}
		if (possessEquipment(Item.get("ornate dowsing rod")))
		{
			return false;
		}
	}

	if (toInt(getProperty("desertExploration")) >= 70)
	{
		if (!toBoolean(getProperty("auto_grimstoneFancyOilPainting")))
		{
			return false;
		}
	}

	return true;
}

export function dna_startAcquire(): boolean
{
	if (!isUnrestricted(Item.get("Little Geneticist DNA-Splicing Lab")))
	{
		return false;
	}
	if (getProperty("auto_day1_dna") === "finished" || myDaycount() !== 1)
	{
		return false;
	}
	if (haveEffect(Effect.get("Human-Weird Thing Hybrid")) === 2147483647)
	{
		return false;
	}
	if (itemAmount(Item.get("DNA extraction syringe")) === 0)
	{
		return false;
	}

	if (getProperty("dnaSyringe") === Phylum.get("weird").toString())
	{
		cliExecute("camp dnainject");
	}
	else {
		if (!canChangeToFamiliar(Familiar.get("Machine Elf")))
		{
			const bjorn: Familiar = myBjornedFamiliar();
			if (bjorn === Familiar.get("Machine Elf"))
			{
				handleBjornify(Familiar.get("Grinning Turtle"));
			}
			handleFamiliar$1(Familiar.get("Machine Elf"));
			autoAdv$1(1, Location.get("The Deep Machine Tunnels"));
			if (bjorn === Familiar.get("Machine Elf"))
			{
				handleBjornify(bjorn);
			}
			cliExecute("camp dnainject");
		}
		else if (elementalPlanes_access(Element.get("sleaze")))
		{
			if ((Location.get("Sloppy Seconds Diner")).turnsSpent === 0)
			{
				autoAdv$1(1, Location.get("Sloppy Seconds Diner"));
			}
			autoAdv$1(1, Location.get("Sloppy Seconds Diner"));
			cliExecute("camp dnainject");
		}
	}
	setProperty("auto_day1_dna", "finished");
	if (haveEffect(Effect.get("Human-Weird Thing Hybrid")) !== 2147483647)
	{
		auto_log_warning("DNA Hybridization failed, perhaps it was due to ML which is annoying us right now.", "red");
	}
	return true;
}

export function dna_generic(): boolean
{
	if (!isUnrestricted(Item.get("Little Geneticist DNA-Splicing Lab")))
	{
		return false;
	}
	if (getProperty("dnaSyringe") === Phylum.none.toString())
	{
		return false;
	}

	let potion: Map<Phylum, boolean> = new Map();

	if (in_heavyrains())
	{
		switch (myDaycount())
		{
		case 1:		potion = new Map([[Phylum.get("construct"), true], [Phylum.get("construct"), true], [Phylum.get("fish"), true]]);		break;
		case 2:		potion = new Map([[Phylum.get("fish"), true], [Phylum.get("constellation"), true], [Phylum.get("dude"), true]]);		break;
		case 3:		potion = new Map([[Phylum.get("construct"), true], [Phylum.get("humanoid"), true], [Phylum.get("dude"), true]]);		break;
		default:		potion = new Map([[Phylum.get("humanoid"), true], [Phylum.get("construct"), true], [Phylum.get("dude"), true]]);		break;
		}
	}
	else {
		switch (myDaycount())
		{
		case 1:		potion = new Map([[Phylum.get("construct"), true], [Phylum.get("construct"), true], [Phylum.get("fish"), true]]);		break;
		case 2:		potion = new Map([[Phylum.get("fish"), true], [Phylum.get("constellation"), true], [Phylum.get("dude"), true]]);		break;
		case 3:		potion = new Map([[Phylum.get("construct"), true], [Phylum.get("humanoid"), true], [Phylum.get("dude"), true]]);		break;
		default:		potion = new Map([[Phylum.get("humanoid"), true], [Phylum.get("construct"), true], [Phylum.get("dude"), true]]);		break;
		}
	}

	let i: number = 0;
	for (const phy of potion.keys())
	{
		if (getProperty("dnaSyringe") === phy.toString() && toInt(getProperty("_dnaPotionsMade")) === i)
		{
			cliExecute("camp dnapotion");
		}
		i = i + 1;
	}


	return false;
}


export function dna_sorceressTest(): boolean
{
	// FIXME: Can we do this earlier? This isn't even all that useful, to be fair.
	// When is the last time we encounter each of these types?
	if (!isUnrestricted(Item.get("Little Geneticist DNA-Splicing Lab")))
	{
		return false;
	}
	if (getProperty("dnaSyringe") === Phylum.none.toString())
	{
		return false;
	}
	if (myLevel() < 13)
	{
		return false;
	}
	if (toInt(getProperty("_dnaPotionsMade")) >= 3)
	{
		return false;
	}
	if (toInt(getProperty("choiceAdventure1003")) < 3)
	{
		return false;
	}
	if (getProperty("nsChallenge2") === "" && toInt(getProperty("telescopeUpgrades")) >= 2)
	{
		ns_crowd3();
	}

	if (getProperty("dnaSyringe") === Phylum.get("plant").toString() && getProperty("nsChallenge2") === Element.get("cold").toString() && itemAmount(Item.get("Gene Tonic: Plant")) === 0)
	{
		const temp: boolean = cliExecute("camp dnainject");
	}
	else if (getProperty("dnaSyringe") === Phylum.get("demon").toString() && getProperty("nsChallenge2") === Element.get("hot").toString() && itemAmount(Item.get("Gene Tonic: Demon")) === 0)
	{
		const temp: boolean = cliExecute("camp dnainject");
	}
	else if (getProperty("dnaSyringe") === Phylum.get("slime").toString() && getProperty("nsChallenge2") === Element.get("sleaze").toString() && itemAmount(Item.get("Gene Tonic: Slime")) === 0)
	{
		const temp: boolean = cliExecute("camp dnainject");
	}
	else if (getProperty("dnaSyringe") === Phylum.get("undead").toString() && getProperty("nsChallenge2") === Element.get("spooky").toString() && itemAmount(Item.get("Gene Tonic: Undead")) === 0)
	{
		const temp: boolean = cliExecute("camp dnainject");
	}
	else if (getProperty("dnaSyringe") === Phylum.get("hobo").toString() && getProperty("nsChallenge2") === Element.get("stench").toString() && itemAmount(Item.get("Gene Tonic: Hobo")) === 0)
	{
		const temp: boolean = cliExecute("camp dnainject");
	}

	return false;
}

export function dna_bedtime(): boolean
{
	if (!isUnrestricted(Item.get("Little Geneticist DNA-Splicing Lab")))
	{
		return false;
	}
	if (getProperty("dnaSyringe") === Phylum.none.toString())
	{
		return false;
	}
	if ((Item.get("Little Geneticist DNA-Splicing Lab").toString()) in getCampground())
	{
		let potionsMade: number = toInt(getProperty("_dnaPotionsMade"));
		while (potionsMade < 3)
		{
			const temp: boolean = cliExecute("camp dnapotion");
			potionsMade += 1;
		}
	}
	return false;
}

export function LX_ornateDowsingRod$1(doing_desert_now: boolean): boolean
{
	if (!toBoolean(getProperty("auto_grimstoneOrnateDowsingRod")))
	{
		return false;
	}
	if (toInt(getProperty("desertExploration")) >= 100 || internalQuestStatus("questL11Desert") > 0)
	{
		// don't need a dowsing rod if we've finished the desert.
		return false;
	}
	if (!auto_is_valid(Item.get("grimstone mask")))
	{
		return false;
	}
	if (!auto_can_equip(Item.get("ornate dowsing rod")) && !in_robot())
	{
		return false;
	}
	if (possessEquipment(Item.get("ornate dowsing rod")))
	{
		return false;
	}
	if (possessEquipment(Item.get("UV-resistant compass")))
	{
		return false; //already chose the other off-hand
	}
	if (inHardcore())
	{ //will we be able to pull at any point in the run. not just right now (we might be out of pulls today)
		if (!canChangeToFamiliar(Familiar.get("Grimstone Golem")))
		{ //no golem, or not allowed in path
			setProperty("auto_grimstoneOrnateDowsingRod", false.toString());
			return false;
		}
	}
	//because it requires continuous adventures in the same day, then we want to do pre do this before we even get to the desert.
	//but we do not want to do it too early either. so we wait until we are at least day 2 and level 7 to get the dowsing rod.
	//unless we are doing desert now. in which case we ignore this limitation and do it now
	if (!doing_desert_now && (myLevel() < 8 || myDaycount() < 2))
	{
		return false;
	}

	if (itemAmount(Item.get("grimstone mask")) === 0 && !canChangeToFamiliar(Familiar.get("Grimstone Golem")) && canPull$1(Item.get("grimstone mask")))
	{
		if (canPull$1(Item.get("Shore Inc. Ship Trip Scrip")) && storageAmount(Item.get("Shore Inc. Ship Trip Scrip")) > 2)
		{
			//since drum machine and killing jar get pulled it's not useful to explore faster than compass just to need more fights gathering pages anyway
			//not worth spending the 5 adv to acquire rod in addition to the pull if Trip Scrip aren't in short supply
			return false;
		}
		// if(canChangeToFamiliar($familiar[Melodramedary]))
		// {
		// 	//with Melodramedary, drum machine, killing jar and no Scrip pull, pulling the mask saves 2 turns compared to vacationing for Scrip? is that good enough?
		// }
		pullXWhenHaveY(Item.get("grimstone mask"), 1, 0); //pull the mask if you do not have it and cannot use the golem
	}
	if (itemAmount(Item.get("grimstone mask")) === 0)
	{
		return false;
	}

	if (myAdventures() <= 6)
	{
		auto_log_info(`I need at least 6 adv to get [Ornate Dowsing Rod] and I only have ${myAdventures()}`, "blue");
		if (doing_desert_now)
		{
			if (fullness_left() + inebriety_left() > 0)
			{
				abort("I am trying to do desert now so I cannot delay getting [Ornate Dowsing Rod]. I still have stomch and and liver left. Eat and drink until at least 6 adv and then run me again");
			}
			if (isAboutToPowerlevel())
			{
				auto_log_info("I have nothing else to do except the desert. So I am ending the day early", "blue");
				setProperty("_auto_doneToday", true.toString());
				return true; //want to restart the loop so it can properly exit it and do bedtime.
			}
		}
		return false;
	}

	auto_log_info("Acquiring a Dowsing Rod!", "blue");
	use(1, Item.get("grimstone mask"));

	while (itemAmount(Item.get("odd silver coin")) < 1)
	{
		autoAdv$2(Location.get("The Prince's Balcony"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 2)
	{
		autoAdv$2(Location.get("The Prince's Dance Floor"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 3)
	{
		autoAdv$2(Location.get("The Prince's Lounge"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 4)
	{
		autoAdv$2(Location.get("The Prince's Kitchen"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 5)
	{
		autoAdv$2(Location.get("The Prince's Restroom"));
	}

	if (create(1, Item.get("ornate dowsing rod")))
	{
		return true;
	}
	if (itemAmount(Item.get("ornate dowsing rod")) === 0)
	{
		abort("Failed to craft [Ornate Dowsing Rod]. craft it manually and run me again");
	}
	return false;
}

export function LX_ornateDowsingRod(): boolean
{
	return LX_ornateDowsingRod$1(false);
}

export function fancyOilPainting(): boolean
{
	if (toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal())
	{
		return false;
	}
	if (myAdventures() <= 4)
	{
		return false;
	}
	if (!auto_is_valid(Item.get("grimstone mask")) || !auto_is_valid(Item.get("fancy oil painting")))
	{
		return false;
	}
	if (itemAmount(Item.get("grimstone mask")) === 0)
	{
		return false;
	}
	if (!toBoolean(getProperty("auto_grimstoneFancyOilPainting")))
	{
		return false;
	}
	if (getCounters("", 0, 6) !== "")
	{
		return false;
	}
	auto_log_info("Acquiring a Fancy Oil Painting!", "blue");
	use(1, Item.get("grimstone mask"));

	while (itemAmount(Item.get("odd silver coin")) < 1)
	{
		autoAdv$1(1, Location.get("The Prince's Balcony"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 2)
	{
		autoAdv$1(1, Location.get("The Prince's Dance Floor"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 3)
	{
		autoAdv$1(1, Location.get("The Prince's Lounge"));
	}
	while (itemAmount(Item.get("odd silver coin")) < 4)
	{
		autoAdv$1(1, Location.get("The Prince's Kitchen"));
	}
	cliExecute("make fancy oil painting");
	setProperty("auto_grimstoneFancyOilPainting", false.toString());
	return true;
}

function turkeyBooze(): number
{
	return toInt(getProperty("_turkeyBooze"));
}

function amountTurkeyBooze(): number
{
	if (isUnrestricted(Item.get("fist turkey outline")))
	{
		return itemAmount(Item.get("Agitated Turkey")) + itemAmount(Item.get("Ambitious Turkey")) + itemAmount(Item.get("Friendly Turkey"));
	}
	return 0;
}

let $_f_importantMonsters: Monster[] | undefined;
$_f_importantMonsters ??= Monster.get([
	// L4:
	"beanbat",
	// L5:
	"Knob Goblin Harem Girl",
	// L7:
	"dirty old lihc",
	// L8:
	"dairy goat",
	// L9:
	"bearpig topiary animal",
	"elephant (meatcar?) topiary animal",
	"spider (duck?) topiary animal",
	// L10:
	"Quiet Healer",
	"Burly Sidekick",
	// L11:
	// Hidden City:
	"baa-relief sheep",
	"pygmy bowler",
	"pygmy shaman",
	"pygmy janitor",
	"pygmy witch accountant",
	"pygmy witch surgeon",
	// Spookyraven:
	"animated ornate nightstand",
	"elegant animated nightstand",
	"cabinet of Dr. Limpieza",
	"possessed wine rack",
	"monstrous boiler",
	"writing desk",
	"chalkdust wraith",
	"banshee librarian",
	// Palindome:
	"whitesnake",
	"white lion",
	// Zeppelin:
	"man with the red buttons",
	"red butler",
	"red skeleton",
	// Desert:
	"blur",
	"tomb rat",
	// L12:
	"batwinged gremlin (tool)",
	"erudite gremlin (tool)",
	"spider gremlin (tool)",
	"vegetable gremlin (tool)"]);

function icehouseMonster(): Monster
{
	visitUrl("museum.php?action=icehouse");
	if (!containsText(getProperty("banishedMonsters"), "ice house"))
	{
		return Monster.none;
	}
	else {
		const banishMap: Map<number, string> = new Map(splitString(getProperty("banishedMonsters"), ":").map((_v, _i) => [_i, _v]));
		for (let i: number = 0; i < banishMap.size; i++)
		{
			if ((banishMap.get(i) ?? banishMap.set(i, "").get(i)) === "ice house")
			{
				return toMonster((banishMap.get(i - 1) ?? banishMap.set(i - 1, "").get(i - 1)));
			}
		}
	}
	return Monster.none;
}

export function icehouseUserErrorProtection(): boolean
{
	if (icehouseMonster() === Monster.none)
	{
		return true;
	}
	else if ($_f_importantMonsters.includes(icehouseMonster()))
	{
		if (userConfirm(`You have a ${icehouseMonster().toString()} frozen in your icehouse. Autoscend thinks it might cause problems, do you want us to melt it? Will default to 'Yes' in 15 seconds.`, 15000, true))
		{
			visitUrl("museum.php?action=icehouse");
			runChoice(1);
			return true;
		}
		else {
			print("If autoscend runs into problems, it's on you!");
			return false;
		}
	}
	else {
		return true;
	}
}