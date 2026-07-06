import { Effect, Element, Familiar, Item, Location, Monster, Skill, Slot, Stat, abort, cliExecute, containsText, equip, equippedItem, getProperty, haveEffect, haveEquipped, haveFamiliar, inHardcore, isUnrestricted, itemAmount, min, myAdventures, myDaycount, myHp, myLevel, myMeat, myPrimestat, npcPrice, runChoice, setProperty, splitString, toBoolean, toInt, toLowerCase, toStat, useSkill, visitUrl } from "kolmafia";
import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv$2, autoAdvBypass$2, CombatMacro } from "../auto_adventure";
import { possessEquipment } from "../auto_equipment";
import { canChangeToFamiliar, handleFamiliar$1, pathHasFamiliar } from "../auto_familiar";
import { auto_autosell, auto_get_campground, auto_is_valid, auto_is_valid$2, auto_log_error, auto_log_info, auto_log_warning, canYellowRay$1, handleTracker$1, internalQuestStatus, organsFull, wrap_item } from "../auto_util";
import { elementalPlanes_access } from "./elementalPlanes";
import { auto_sourceTerminalEducate } from "./mr2016";
import { auto_haveTrainSet } from "./mr2022";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { is_boris } from "../paths/avatar_of_boris";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { is_pete } from "../paths/avatar_of_sneaky_pete";
import { in_awol } from "../paths/avatar_of_west_of_loathing";
import { inAftercore } from "../paths/casual";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_heavyrains } from "../paths/heavy_rains";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { in_lta } from "../paths/license_to_adventure";
import { in_nuclear } from "../paths/nuclear_autumn";
import { in_ocrs } from "../paths/one_crazy_random_summer";
import { in_theSource } from "../paths/the_source";
import { in_wotsf } from "../paths/way_of_the_surprising_fist";
import { needOre } from "../quests/level_08";
import { towerKeyCount } from "../quests/level_13";

//	This is meant for items that have a date of 2015
//	Handling: shrine to the Barrel God, Chateau Mantegna Room Key, Deck of Every Card
//

//Defined in autoscend/iotms/mr2015.ash
function auto_haveLovebugs(): boolean
{
	return toBoolean(getProperty("lovebugsUnlocked")) && auto_is_valid$2(Skill.get("Summon Love Stinkbug"));
}

function mayo_acquireMayo(it: Item): boolean
{
	if (!isUnrestricted(Item.get("portable Mayo Clinic")))
	{
		return false;
	}
	if (!(auto_get_campground().has(Item.get("portable Mayo Clinic"))))
	{
		return false;
	}
	return true;
}

export function auto_barrelPrayers(): boolean
{
	if (!isUnrestricted(Item.get("shrine to the Barrel god")))
	{
		return false;
	}
	if (toBoolean(getProperty("_barrelPrayer")))
	{
		return false;
	}
	if (!toBoolean(getProperty("barrelShrineUnlocked")))
	{
		const temp: string = visitUrl("da.php");
		if (!toBoolean(getProperty("barrelShrineUnlocked")))
		{
			return false;
		}
	}
	if (inAftercore())
	{
		return false;
	}

	let prayers: Map<string, boolean> = new Map();

	if (in_lta())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Protection", true], ["Vigor", true]]);		break;
		case 2:		prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (in_nuclear())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Vigor", true], ["Glamour", true]]);		break;
		case 2:		prayers = new Map([["Vigor", true], ["Glamour", true]]);		break;
		case 3:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (in_theSource())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);		break;
		case 2:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (in_awol())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);		break;
		case 2:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (is_boris())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["none", true]]);		break;
		case 2:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (is_pete())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);		break;
		case 2:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (is_jarlsberg())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);		break;
		case 2:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (in_wotsf())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["none", true]]);		break;
		case 2:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (in_heavyrains())
	{
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 2:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Glamour", true], ["Vigor", true]]);		break;
		}
	}
	else if (isActuallyEd())
	{
		if (elementalPlanes_access(Element.get("spooky")) && toInt(getProperty("edPoints")) >= 2)
		{
			switch (myDaycount())
			{
			case 1:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			case 2:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			case 3:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			case 4:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			}
		}
		else {
			switch (myDaycount())
			{
			case 1:			prayers = new Map([["Glamour", true], ["Vigor", true], ["Protection", true]]);			break;
			case 2:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			case 3:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			case 4:			prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);			break;
			}
		}
	}
	else {
		switch (myDaycount())
		{
		case 1:		prayers = new Map([["Glamour", true], ["Protection", true], ["Vigor", true]]);		break;
		case 2:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 3:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		case 4:		prayers = new Map([["Protection", true], ["Glamour", true], ["Vigor", true]]);		break;
		}
	}

	for (const prayer of prayers.keys())
	{
		if (prayer === "none")
		{
			return false;
		}
		if (!toBoolean(getProperty(`prayedFor${prayer}`)))
		{
			const buff: boolean = cliExecute(`barrelprayer ${prayer}`);
			return true;
		}
	}

	return false;
}


export function auto_mayoItems(): boolean
{
	if (!isUnrestricted(Item.get("portable Mayo Clinic")))
	{
		return false;
	}
	if (toBoolean(getProperty("_mayoDeviceRented")))
	{
		return false;
	}
	if (inAftercore())
	{
		return false;
	}
	if (!(auto_get_campground().has(Item.get("portable Mayo Clinic"))))
	{
		return false;
	}
	if (myMeat() < 10000)
	{
		return false;
	}

	let haveYR: boolean = false;
	if (haveFamiliar(Familiar.get("Crimbo Shrub")))
	{
		haveYR = true;
	}

	let mayos: Map<Item, boolean> = new Map();
	if (is_boris())
	{
		switch (myDaycount())
		{
		case 1:		mayos = new Map([[Item.get("tomayohawk-style reflex hammer"), true]]);		break;
		case 2:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		case 3:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		case 4:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		}
	}
	else if (in_heavyrains() && !inHardcore())
	{
		switch (myDaycount())
		{
		case 1:		mayos = new Map([[Item.none, true]]);		break;
		case 2:		mayos = new Map([[Item.get("miracle whip"), true]]);		break;
		case 3:		mayos = new Map([[Item.get("sphygmayomanometer"), true]]);		break;
		case 4:		mayos = new Map([[Item.get("sphygmayomanometer"), true]]);		break;
		}
	}
	else if (in_gnoob())
	{
		switch (myDaycount())
		{
		default:		mayos = new Map([[Item.none, true]]);		break;
		}
	}
	else if (in_lta())
	{
		switch (myDaycount())
		{
		default:		mayos = new Map([[Item.none, true]]);		break;
		}
	}
	else {
		switch (myDaycount())
		{
		case 1:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		case 2:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		case 3:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		case 4:		mayos = new Map([[Item.get("mayo lance"), true]]);		break;
		}
	}

	for (const mayo of mayos.keys())
	{
		if (mayo === Item.get("mayo lance"))
		{
			if (haveFamiliar(Familiar.get("Crimbo Shrub")))
			{
				continue;
			}
			if (haveFamiliar(Familiar.get("Intergnat")))
			{
				continue;
			}
		}
		if (mayo === Item.none)
		{
			return false;
		}
		if (itemAmount(mayo) === 0)
		{
			auto_buyUpTo(1, mayo);
			return true;
		}
	}

	return false;
}




export function chateaumantegna_available(): boolean
{
	const chateau_key: Item = wrap_item(Item.get("Chateau Mantegna room key"));
	if (!in_lol() && toBoolean(getProperty("chateauAvailable")) && isUnrestricted(chateau_key))
	{
		return true;
	}
	if (in_lol() && toBoolean(getProperty("replicaChateauAvailable")) && isUnrestricted(chateau_key))
	{
		return true;
	}
	return false;
}

export function chateaumantegna_useDesk(): void
{
	if (chateaumantegna_available())
	{
		const chateau: string = visitUrl("place.php?whichplace=chateau");
		if (containsText(chateau, "chateau_desk1"))
		{
			visitUrl("place.php?whichplace=chateau&action=chateau_desk1");
		}
		else if (containsText(chateau, "chateau_desk2"))
		{
			visitUrl("place.php?whichplace=chateau&action=chateau_desk2");
		}
		else if (containsText(chateau, "chateau_desk3"))
		{
			visitUrl("place.php?whichplace=chateau&action=chateau_desk3");
		}
	}
}

export function chateaumantegna_havePainting(): boolean
{
	if (chateaumantegna_available() && !containsText(visitUrl("place.php?whichplace=chateau"), "chateau_paintingnone"))
	{
		return !toBoolean(getProperty("_chateauMonsterFought"));
	}
	return false;
}



export function chateaumantegna_usePainting(option?: CombatMacro): boolean
{
	if (!chateaumantegna_available())
	{
		return false;
	}
	if (toBoolean(getProperty("_chateauMonsterFought")))
	{
		return false;
	}

	if (getProperty("chateauMonster") === Monster.get("lobsterfrogman").toString())
	{
		if (itemAmount(Item.get("barrel of gunpowder")) >= 5)
		{
			return false;
		}
		if (getProperty("sidequestLighthouseCompleted") !== "none")
		{
			return false;
		}
	}
	if (getProperty("chateauMonster") === Monster.get("Bram the Stoker").toString())
	{
		if (haveEquipped(Item.get("Bram's choker")) || itemAmount(Item.get("Bram's choker")) > 0)
		{
			return false;
		}
	}
	if (getProperty("chateauMonster") === Monster.get("mountain man").toString())
	{
		if (!needOre())
		{
			return false;
		}
	}
	if (chateaumantegna_available())
	{
		return autoAdvBypass$2("place.php?whichplace=chateau&action=chateau_painting", Location.get("Noob Cave"), option);
	}
	return false;
}

export function chateaumantegna_decorations(): Map<Item, boolean>
{
	const retval: Map<Item, boolean> = new Map();
	if (!chateaumantegna_available())
	{
		return retval;
	}
	const chateau: string = toLowerCase(visitUrl("place.php?whichplace=chateau"));
	if (containsText(chateau, "electric muscle stimulator"))
	{
		retval.set(Item.get("electric muscle stimulator"), true);
	}
	else if (containsText(chateau, "foreign language tapes"))
	{
		retval.set(Item.get("foreign language tapes"), true);
	}
	else if (containsText(chateau, "bowl of potpourri"))
	{
		retval.set(Item.get("bowl of potpourri"), true);
	}
	if (containsText(chateau, "antler chandelier"))
	{
		retval.set(Item.get("antler chandelier"), true);
	}
	else if (containsText(chateau, "artificial skylight"))
	{
		retval.set(Item.get("artificial skylight"), true);
	}
	else if (containsText(chateau, "ceiling fan"))
	{
		retval.set(Item.get("ceiling fan"), true);
	}
	if (containsText(chateau, "continental juice bar"))
	{
		retval.set(Item.get("continental juice bar"), true);
	}
	else if (containsText(chateau, "fancy stationery set"))
	{
		retval.set(Item.get("fancy stationery set"), true);
	}
	else if (containsText(chateau, "swiss piggy bank"))
	{
		retval.set(Item.get("Swiss piggy bank"), true);
	}
	return retval;
}

function chateaumantegna_buyStuff(toBuy: Item): void
{
	if (!chateaumantegna_available())
	{
		return;
	}

	if (toBuy === Item.get("electric muscle stimulator") && myMeat() >= 500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=411&quantity=1", true);
	}
	if (toBuy === Item.get("foreign language tapes") && myMeat() >= 500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=412&quantity=1", true);
	}
	if (toBuy === Item.get("bowl of potpourri") && myMeat() >= 500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=413&quantity=1", true);
	}

	if (toBuy === Item.get("antler chandelier") && myMeat() >= 1500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=415&quantity=1", true);
	}
	if (toBuy === Item.get("artificial skylight") && myMeat() >= 1500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=416&quantity=1", true);
	}
	if (toBuy === Item.get("ceiling fan") && myMeat() >= 1500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=414&quantity=1", true);
	}

	if (toBuy === Item.get("continental juice bar") && myMeat() >= 2500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=418&quantity=1", true);
	}
	if (toBuy === Item.get("fancy calligraphy pen") && myMeat() >= 2500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=419&quantity=1", true);
	}
	if (toBuy === Item.get("Swiss piggy bank") && myMeat() >= 2500)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=417&quantity=1", true);
	}

	if (toBuy === Item.get("alpine watercolor set") && myMeat() >= 5000)
	{
		visitUrl("shop.php?pwd=&whichshop=chateau&action=buyitem&whichrow=420&quantity=1", true);
	}
}


export function chateaumantegna_nightstandSet(): boolean
{
	if (!chateaumantegna_available())
	{
		return false;
	}

	let myStat: Stat = myPrimestat();
	if (myStat === Stat.none)
	{
		return false;
	}
	if (inAftercore())
	{
		return false;
	}
	if (myLevel() >= 13)
	{
		if (toInt(getProperty("nsContestants2")) === -1)
		{
			myStat = toStat(getProperty("nsChallenge1"));
		}
		else {
			return false;
		}
	}


	const furniture: Map<Item, boolean> = chateaumantegna_decorations();
	let need: Item = Item.none;
	if (myStat === Stat.get("Muscle"))
	{
		need = Item.get("electric muscle stimulator");
	}
	else if (myStat === Stat.get("Mysticality"))
	{
		need = Item.get("foreign language tapes");
	}
	else if (myStat === Stat.get("Moxie"))
	{
		need = Item.get("bowl of potpourri");
	}

	if (need === Item.none)
	{
		//If we do not have a telescope, this can happen.
		return false;
	}
	if ((furniture.get(need) ?? furniture.set(need, false).get(need)))
	{
		return false;
	}
	if (myMeat() < npcPrice(need))
	{
		return false;
	}
	auto_log_info("We have the wrong Chateau Nightstand item, replacing.", "blue");
	chateaumantegna_buyStuff(need);
	return true;
}

export function chateauPainting(): boolean
{
	let paintingLevel: number = 8;
	if (in_ocrs())
	{
		paintingLevel = 9;
	}
	if (myLevel() >= paintingLevel && chateaumantegna_havePainting() && !toBoolean(getProperty("chateauMonsterFought")) && isActuallyEd() && myDaycount() <= 3)
	{
		if (canYellowRay$1())
		{
			auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Digitize"));
			if (chateaumantegna_usePainting())
			{
				return true;
			}
		}
	}

	if (organsFull() && myAdventures() < 10 && chateaumantegna_havePainting() && !toBoolean(getProperty("chateauMonsterFought")) && myDaycount() === 1 && !isActuallyEd())
	{
		auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Digitize"));
		if (chateaumantegna_usePainting())
		{
			return true;
		}
	}
	if (myLevel() >= 8 && chateaumantegna_havePainting() && !toBoolean(getProperty("chateauMonsterFought")) && myDaycount() === 2 && !isActuallyEd())
	{
		auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Digitize"));
		if (chateaumantegna_usePainting())
		{
			return true;
		}
	}
	return false;
}


function deck_available(): boolean
{
	const deck: Item = wrap_item(Item.get("Deck of Every Card"));
	return itemAmount(deck) > 0 && isUnrestricted(deck) && auto_is_valid(deck);
}

function deck_draws_left(): number
{
	if (!deck_available())
	{
		return 0;
	}
	if (myHp() === 0)
	{
		return 0;
	}
	return 15 - toInt(getProperty("_deckCardsDrawn"));
}


function deck_draw(): boolean
{
	if (!deck_available())
	{
		return false;
	}
	if (deck_draws_left() <= 0)
	{
		return false;
	}
	if (myHp() === 0)
	{
		return false;
	}
	const deck: Item = wrap_item(Item.get("Deck of Every Card"));
	let page: string = visitUrl(`inv_use.php?pwd=&which=3&whichitem=${toInt(deck)}`);
	page = visitUrl("choice.php?pwd=&whichchoice=1085&option=1", true);
	return true;
}

let $_deck_cheat_cards: Map<string, number> | undefined;

function deck_cheat(cheat: string): boolean
{
	if (!deck_available())
	{
		return false;
	}
	if (deck_draws_left() <= 0)
	{
		return false;
	}
	if (myHp() === 0)
	{
		return false;
	}
	cheat = toLowerCase(cheat);
	$_deck_cheat_cards ??= new Map();
	$_deck_cheat_cards.set("x of clubs", 1);
	$_deck_cheat_cards.set("x of hearts", 2);
	$_deck_cheat_cards.set("x of diamonds", 3);
	$_deck_cheat_cards.set("x of spades", 4);
	$_deck_cheat_cards.set("x of cups", 5);
	$_deck_cheat_cards.set("x of wands", 6);
	$_deck_cheat_cards.set("x of swords", 7);
	$_deck_cheat_cards.set("x of coins", 8);
	$_deck_cheat_cards.set("xiii - death", 9);
	$_deck_cheat_cards.set("goblin sapper", 10);

	$_deck_cheat_cards.set("the hive", 11);
	$_deck_cheat_cards.set("hunky fireman card", 12);
	$_deck_cheat_cards.set("v - the hierophant", 13);
	$_deck_cheat_cards.set("xviii - the moon", 14);
	$_deck_cheat_cards.set("werewolf", 15);
	$_deck_cheat_cards.set("xv - the devil", 16);
	$_deck_cheat_cards.set("fire elemental", 17);
	$_deck_cheat_cards.set("slimer trading card", 18);
	$_deck_cheat_cards.set("vii - the chariot", 19);
	$_deck_cheat_cards.set("ii - the high priestess", 20);


	$_deck_cheat_cards.set("xii - the hanged man", 21);
	$_deck_cheat_cards.set("plantable greeting card", 22);
	$_deck_cheat_cards.set("pirate birthday card", 23);
	$_deck_cheat_cards.set("xiv - temperance", 24);
	$_deck_cheat_cards.set("unstable portal", 25);
	$_deck_cheat_cards.set("xvii - the star", 26);
	$_deck_cheat_cards.set("suit warehouse discount card", 27);
	$_deck_cheat_cards.set("christmas card", 28);
	$_deck_cheat_cards.set("go fish", 29);
	$_deck_cheat_cards.set("aquarius horoscope", 30);

	$_deck_cheat_cards.set("plains", 31);
	$_deck_cheat_cards.set("swamp", 32);
	$_deck_cheat_cards.set("mountain", 33);
	$_deck_cheat_cards.set("forest", 34);
	$_deck_cheat_cards.set("island", 35);
	$_deck_cheat_cards.set("healing salve", 36);
	$_deck_cheat_cards.set("dark ritual", 37);
	$_deck_cheat_cards.set("lightning bolt", 38);
	$_deck_cheat_cards.set("giant growth", 39);
	$_deck_cheat_cards.set("ancestral recall", 40);

	$_deck_cheat_cards.set("gift card", 41);
	$_deck_cheat_cards.set("x of papayas", 42);
	$_deck_cheat_cards.set("x of salads", 43);
	$_deck_cheat_cards.set("ix - the hermit", 44);
	$_deck_cheat_cards.set("iv - the emperor", 45);
	$_deck_cheat_cards.set("green card", 46);
	$_deck_cheat_cards.set("xvi - the tower", 47);
	$_deck_cheat_cards.set("the race card", 48);
	$_deck_cheat_cards.set("0 - the fool", 49);
	$_deck_cheat_cards.set("I - the magician", 50);

	$_deck_cheat_cards.set("xi - strength", 51);
	$_deck_cheat_cards.set("lead pipe", 52);
	$_deck_cheat_cards.set("rope", 53);
	$_deck_cheat_cards.set("wrench", 54);
	$_deck_cheat_cards.set("candlestick", 55);
	$_deck_cheat_cards.set("knife", 56);
	$_deck_cheat_cards.set("revolver", 57);
	$_deck_cheat_cards.set("1952 mickey mantle", 58);
	$_deck_cheat_cards.set("spare tire", 59);
	$_deck_cheat_cards.set("extra tank", 60);

	$_deck_cheat_cards.set("sheep", 61);
	$_deck_cheat_cards.set("year of plenty", 62);
	$_deck_cheat_cards.set("mine", 63);
	$_deck_cheat_cards.set("laboratory", 64);
	$_deck_cheat_cards.set("x of kumquats", 65);
	$_deck_cheat_cards.set("professor plum", 66);
	$_deck_cheat_cards.set("x - the wheel of fortune", 67);
	$_deck_cheat_cards.set("xxi - the world", 68);
	$_deck_cheat_cards.set("vi - the lovers", 69);
	$_deck_cheat_cards.set("iii - the empress", 70);

	$_deck_cheat_cards.set("pvp", 1);
	$_deck_cheat_cards.set("fites", 1);
	$_deck_cheat_cards.set("spade", 4);
	$_deck_cheat_cards.set("white mana", 31);
	$_deck_cheat_cards.set("black mana", 32);
	$_deck_cheat_cards.set("red mana", 33);
	$_deck_cheat_cards.set("green mana", 34);
	$_deck_cheat_cards.set("blue mana", 35);
	$_deck_cheat_cards.set("key", 47);
	$_deck_cheat_cards.set("tower", 47);
	$_deck_cheat_cards.set("init", 48);
	$_deck_cheat_cards.set("moxie buff", 49);
	$_deck_cheat_cards.set("myst buff", 50);
	$_deck_cheat_cards.set("mysticality buff", 50);
	$_deck_cheat_cards.set("meat", 58);
	$_deck_cheat_cards.set("muscle buff", 51);
	$_deck_cheat_cards.set("stone wool", 61);
	$_deck_cheat_cards.set("ore", 63);
	$_deck_cheat_cards.set("items", 67);
	$_deck_cheat_cards.set("muscle stat", 68);
	$_deck_cheat_cards.set("moxie stat", 69);
	$_deck_cheat_cards.set("myst stat", 70);
	$_deck_cheat_cards.set("mysticality stat", 70);

	const card: number = ($_deck_cheat_cards.get(cheat) ?? $_deck_cheat_cards.set(cheat, 0).get(cheat));

	const cheated: Map<number, string> = new Map(splitString(getProperty("_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]));
	for (const [idx, cheat_1] of cheated)
	{
		if (toInt(cheat_1) === card)
		{
			auto_log_warning("Already cheated this card, failing gracefully.", "red");
			return false;
		}
	}

	const deck: Item = wrap_item(Item.get("Deck of Every Card"));
	const page: string = visitUrl(`inv_use.php?cheat=1&pwd=&whichitem=${toInt(deck)}`);
	// Check that a valid card was selected, otherwise this wastes 5 draws.
	if (card !== 0)
	{
		let page_1: string = visitUrl(`choice.php?pwd=&option=1&whichchoice=1086&which=${card}`, true);
		page_1 = visitUrl("choice.php?pwd=&whichchoice=1085&option=1", true);
		if (containsText(page_1, "Combat"))
		{
			// Can we resolve this combat here? Should we?
			// Do we need to accept a combat filter?
		}

		handleTracker$1(deck.toString(), cheat, "auto_otherstuff");
		// If mafia is not tracking cheats, we can track them here.
		let found: boolean = false;
		const cheated_1: Map<number, string> = new Map(splitString(getProperty("_deckCardsCheated"), ",").map((_v, _i) => [_i, _v]));
		for (const [idx, cheat_1] of cheated_1)
		{
			if (toInt(cheat_1) === card)
			{
				found = true;
			}
		}
		if (!found)
		{
			if (getProperty("_deckCardsCheated") === "")
			{
				setProperty("_deckCardsCheated", card.toString());
			}
			else {
				setProperty("_deckCardsCheated", `${getProperty("_deckCardsCheated")},${card}`);
			}
		}
		return true;
	}
	return false;
}


export function deck_useScheme(action: string): boolean
{
	if (!deck_available())
	{
		return false;
	}
	if (deck_draws_left() < 15)
	{
		return false;
	}
	if (myHp() === 0)
	{
		return false;
	}

	let cards: Map<string, boolean> = new Map();

	if (action === "farming")
	{
		cards = new Map([["Ancestral Recall", true], ["Island", true], ["1952 Mickey Mantle", true]]);
	}
	else if (action === "turns")
	{
		cards = new Map([["Ancestral Recall", true], ["Island", true]]);
		if (needOre())
		{
			cards = new Map([["Ancestral Recall", true], ["Island", true], ["Mine", true]]);
		}
	}
	else {
		// First priority is grab a key if we need one.
		const missingHeroKeys: number = 3 - towerKeyCount();
		if (missingHeroKeys > 0)
		{
			cards.set("key", true);
		}
		// Next priority is ore, only if we don't have a train set installed
		if (!auto_haveTrainSet() && needOre())
		{
			cards.set("ore", true);
		}
		// Stats are higher priority early on in LoL where we're never gonna need stone wool day1
		if (in_lol() && myLevel() < 4)
		{
			const mainstat: string = toLowerCase(myPrimestat().toString());
			cards.set(`${mainstat} stat`, true);
		}
		// Stone wool
		if (cards.size < 3 && internalQuestStatus("questL11Worship") < 2 && itemAmount(Item.get("stone wool")) < 2)
		{
			cards.set("stone wool", true);
		}
		// Meat
	  if (cards.size < 3 && myMeat() < 10000 && !in_wotsf()) {
			cards.set("1952 Mickey Mantle", true);
		}
		if (cards.size < 3 && myLevel() < 11)
		{
			const mainstat: string = toLowerCase(myPrimestat().toString());
			cards.set(`${mainstat} stat`, true);
		}
	}

	if (cards.size < 3)
	{
		cards.set("ancestral recall", true);
	}
	if (cards.size < 3)
	{
		cards.set("blue mana", true);
	}

	if (cards.size === 0)
	{
		return false;
	}

	let count_1: number = 0;
	for (const card of cards.keys())
	{
		if (possessEquipment(Item.get("bass clarinet")) || possessEquipment(Item.get("fish hatchet")) || possessEquipment(Item.get("dented scepter")))
		{
			if (["Candlestick", "Knight", "Lead Pipe", "Revolver", "Rope", "Wrench"].includes(card))
			{
				continue;
			}
		}

		if (card === "key")
		{
			if (towerKeyCount() >= 3)
			{
				continue;
			}
		}
		if (card === "ore")
		{
			if (!needOre())
			{
				continue;
			}
		}
		if (in_theSource() && card === `${myPrimestat()} stat`)
		{
			continue;
		}
		if (in_wotsf() && ["Candlestick", "Knife", "Lead Pipe", "Revolver", "Rope", "Wrench"].includes(card))
		{
			continue;
		}
		if (card === "1952 Mickey Mantle" && (myMeat() >= 20000 || in_wotsf()))
		{
			continue;
		}
		if (count_1 >= 3)
		{
			break;
		}
		if (deck_cheat(card))
		{
			count_1 += 1;
		}
		else {
			auto_log_error("Could not draw card for some reason, we may be stuck in a choice adventure.");
			abort("Failure when drawing cards, if any were drawn, the rest will NOT be drawn. Draw them and resume.");
		}
	}

	if (action === "" && myMeat() < 10000)
	{
		auto_autosell(min(1, itemAmount(Item.get("1952 Mickey Mantle card"))), Item.get("1952 Mickey Mantle card"));
	}

	if (action === "farming" || action === "turns")
	{
		let count_2: number = itemAmount(Item.get("blue mana"));
		while (count_2 > 0 && toInt(getProperty("_ancestralRecallCasts")) < 10)
		{
			useSkill(1, Skill.get("Ancestral Recall"));
			count_2 -= 1;
		}
	}

	return true;
}

export function adjustEdHat(goal: string): boolean
{
	if (!possessEquipment(Item.get("The Crown of Ed the Undying")))
	{
		return false;
	}
	let option: number = -1;
	goal = toLowerCase(goal);
	if ((goal === "muscle" || goal === "bear") && getProperty("edPiece") !== "bear")
	{
		option = 1;
	}
	else if ((goal === "myst" || goal === "mysticality" || goal === "owl") && getProperty("edPiece") !== "owl")
	{
		option = 2;
	}
	else if ((goal === "moxie" || goal === "puma") && getProperty("edPiece") !== "puma")
	{
		option = 3;
	}
	else if ((goal === "ml" || goal === "hyena") && getProperty("edPiece") !== "hyena")
	{
		option = 4;
	}
	else if ((goal === "meat" || goal === "item" || goal === "items" || goal === "drops" || goal === "mouse") && getProperty("edPiece") !== "mouse")
	{
		option = 5;
	}
	else if ((goal === "regen" || goal === "regenerate" || goal === "miss" || goal === "dodge" || goal === "weasel") && getProperty("edPiece") !== "weasel")
	{
		option = 6;
	}
	else if ((goal === "breathe" || goal === "underwater" || goal === "fish") && getProperty("edPiece") !== "fish")
	{
		option = 7;
	}

	const oldHat: Item = equippedItem(Slot.get("hat"));

	if (option !== -1)
	{
		if (oldHat !== Item.get("The Crown of Ed the Undying"))
		{
			equip(Slot.get("hat"), Item.get("The Crown of Ed the Undying"));
		}
		visitUrl("inventory.php?action=activateedhat");
		visitUrl(`choice.php?pwd=&whichchoice=1063&option=${option}`, true);
		if (oldHat !== Item.get("The Crown of Ed the Undying"))
		{
			equip(Slot.get("hat"), oldHat);
		}
		return true;
	}
	return false;
}

export function resolveSixthDMT(): boolean
{
	// In the Deep Machine Tunnels the sixth and every 50th visit after that in a single ascension will be a noncombat. This prepares for it and executes it.
	if (in_koe())
	{
		return false;
	}
	if (!canChangeToFamiliar(Familiar.get("Machine Elf")))
	{
		return false;
	}
	if ((Location.get("The Deep Machine Tunnels")).turnsSpent !== 5)
	{
	// need to figure out the exact schedule for 2nd and later occurences then add it here.
		return false;
	}

	handleFamiliar$1(Familiar.get("Machine Elf"));
	return autoAdv$2(Location.get("The Deep Machine Tunnels"));
}

export function doghouseChoiceHandler(choice: number): void
{
	if (choice === 1106)
	{ // Wooof! Wooooooof! (Ghost Dog)
		if (inHardcore() && haveEffect(Effect.get("Adventurer's Best Friendship")) > 120 || haveEffect(Effect.get("Adventurer's Best Friendship")) > 30 && pathHasFamiliar())
		{
			runChoice(3); // ghost dog chow
		}
		else {
			runChoice(2); // 30 turns of adventurer's best friendship
		}
	}
	else if (choice === 1107)
	{ // Playing Fetch (Ghost Dog)
		runChoice(1); // get tennis ball
	}
	else if (choice === 1108)
	{ // Your Dog Found Something Again (Ghost Dog)
		runChoice(3); // get other stuff as recommended by ASS
	}
	else {
		abort("unhandled choice in doghouseChoiceHandler");
	}
}