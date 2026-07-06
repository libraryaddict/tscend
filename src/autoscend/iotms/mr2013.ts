import { Class, Effect, Item, Location, Skill, cliExecute, floristAvailable, getFloristPlants, getProperty, itemAmount, knollAvailable, monsterLevelAdjustment, mpCost, myClass, myDaycount, myLocation, myMp, toInt, useSkill, visitUrl } from "kolmafia";
import { auto_buyUpTo } from "../auto_acquire";
import { buffMaintain$3 } from "../auto_buff";
import { possessEquipment } from "../auto_equipment";
import { autoCraft, auto_have_skill, auto_log_warning } from "../auto_util";
import { is_professor } from "../paths/wereprofessor";

//	This is meant for items that have a date of 2013

//Defined in autoscend/iotms/mr2013.ash
export function makeStartingSmiths(): void
{
	if (!auto_have_skill(Skill.get("Summon Smithsness")))
	{
		return;
	}

	if (itemAmount(Item.get("lump of Brituminous coal")) === 0)
	{
		if (myMp() < 3 * mpCost(Skill.get("Summon Smithsness")))
		{
			auto_log_warning("You don't have enough MP for initialization, it might be ok but probably not.", "red");
		}
		useSkill(3, Skill.get("Summon Smithsness"));
	}

	if (knollAvailable())
	{
		auto_buyUpTo(1, Item.get("maiden wig"));
	}

	switch (myClass())
	{
	case Class.get("Seal Clubber"):
		if (!possessEquipment(Item.get("Meat Tenderizer is Murder")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("seal-clubbing club"));
		}
		if (!possessEquipment(Item.get("Vicar's Tutu")) && itemAmount(Item.get("lump of Brituminous coal")) > 0 && knollAvailable())
		{
			auto_buyUpTo(1, Item.get("frilly skirt"));
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("frilly skirt"));
		}
		break;
	case Class.get("Turtle Tamer"):
		if (!possessEquipment(Item.get("Work is a Four Letter Sword")))
		{
			auto_buyUpTo(1, Item.get("sword hilt"));
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("sword hilt"));
		}
		if (!possessEquipment(Item.get("Ouija Board, Ouija Board")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("turtle totem"));
		}
		break;
	case Class.get("Sauceror"):
		if (!possessEquipment(Item.get("Saucepanic")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("saucepan"));
		}
		if (!possessEquipment(Item.get("A Light that Never Goes Out")) && itemAmount(Item.get("lump of Brituminous coal")) > 0)
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("third-hand lantern"));
		}
		break;
	case Class.get("Pastamancer"):
		if (!possessEquipment(Item.get("Hand that Rocks the Ladle")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("pasta spoon"));
		}
		break;
	case Class.get("Disco Bandit"):
		if (!possessEquipment(Item.get("Frankly Mr. Shank")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("disco ball"));
		}
		break;
	case Class.get("Accordion Thief"):
		if (!possessEquipment(Item.get("Shakespeare's Sister's Accordion")))
		{
			autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("stolen accordion"));
		}
		break;
	}

	if (knollAvailable() && !possessEquipment(Item.get("Hairpiece On Fire")) && itemAmount(Item.get("lump of Brituminous coal")) > 0)
	{
		autoCraft("smith", 1, Item.get("lump of Brituminous coal"), Item.get("maiden wig"));
	}
	buffMaintain$3(Effect.get("Merry Smithsness"), 0, 1, 10);
}

function didWePlantHere(loc: Location): boolean
{
	let places: Map<Location, string[]> = new Map(Object.entries(getFloristPlants()).map(([_k, _v]) => [Location.get(_k), _v]));
	for (let place of places.keys())
	{
		if (loc === place)
		{
			return true;
		}
	}
	return false;
}

function trickMafiaAboutFlorist(): void
{
	// This only works if you actually have the Florist Friar but it isn\'t detected by Mafia
	// This may not be the most optimal way to do it.
	visitUrl("choice.php?whichchoice=720&pwd=&option=4");
	visitUrl("place.php?whichplace=forestvillage&action=fv_friar");
	visitUrl("choice.php?whichchoice=720&pwd=&option=4");
	//We might not need to do this last one...
	visitUrl("choice.php?whichchoice=720&pwd=&option=4");
}

export function oldPeoplePlantStuff(): void
{
	if (!floristAvailable())
	{
		return;
	}

	if (didWePlantHere(myLocation()))
	{
		return;
	}
	let addml: boolean = true;
	if (monsterLevelAdjustment() > toInt(getProperty("auto_MLSafetyLimit")) && getProperty("auto_MLSafetyLimit") !== "" || toInt(getProperty("auto_MLSafetyLimit")) === -1)
	{
		addml = false;
	}
	if (is_professor())
	{
		addml = false;
	}

	if (myLocation() === Location.get("The Outskirts of Cobb's Knob"))
	{
		cliExecute("florist plant rad-ish radish");
		cliExecute("florist plant celery stalker");
	}
	else if (myLocation() === Location.get("The Spooky Forest"))
	{
		cliExecute("florist plant seltzer watercress");
		cliExecute("florist plant lettuce spray");
		cliExecute("florist plant deadly cinnamon");
	}
	else if (myLocation() === Location.get("The Haunted Bathroom"))
	{
		if (addml) {
			cliExecute("florist plant war lily");
		}
		cliExecute("florist plant Impatiens");
		cliExecute("florist plant arctic moss");
	}
	else if (myLocation() === Location.get("The Haunted Ballroom"))
	{
		cliExecute("florist plant stealing magnolia");
		cliExecute("florist plant aloe guv'nor");
		cliExecute("florist plant pitcher plant");
	}
	else if (myLocation() === Location.get("The Defiled Nook"))
	{
		cliExecute("florist plant horn of plenty");
	}
	else if (myLocation() === Location.get("The Defiled Alcove"))
	{
		cliExecute("florist plant shuffle truffle");
	}
	else if (myLocation() === Location.get("The Defiled Niche"))
	{
		cliExecute("florist plant wizard's wig");
	}
	else if (myLocation() === Location.get("The Obligatory Pirate's Cove"))
	{
		if (addml) {
			cliExecute("florist plant rabid dogwood");
		}
		cliExecute("florist plant artichoker");
	}
	else if (myLocation() === Location.get("Barrrney's Barrr") && myClass() !== Class.get("Ed the Undying"))
	{
		cliExecute("florist plant spider plant");
		cliExecute("florist plant red fern");
		cliExecute("florist plant bamboo!");
	}
	else if (myLocation() === Location.get("The Penultimate Fantasy Airship"))
	{
		cliExecute("florist plant rutabeggar");
		cliExecute("florist plant smoke-ra");
		cliExecute("florist plant skunk cabbage");
	}
	else if (myLocation() === Location.get("The Castle in the Clouds in the Sky (Basement)") && myDaycount() === 1)
	{
		if (addml) {
			cliExecute("florist plant blustery puffball");
		}
		cliExecute("florist plant dis lichen");
		cliExecute("florist plant max headshroom");
	}
	else if (myLocation() === Location.get("The Castle in the Clouds in the Sky (Ground Floor)"))
	{
		cliExecute("florist plant canned spinach");
	}
	else if (myLocation() === Location.get("Oil Peak"))
	{
		if (addml) {
			cliExecute("florist plant rabid dogwood");
		}
		cliExecute("florist plant artichoker");
		cliExecute("florist plant celery stalker");
	}
	else if (myLocation() === Location.get("The Haunted Boiler Room"))
	{
		if (addml) {
			cliExecute("florist plant war lily");
		}
		cliExecute("florist plant red fern");
		cliExecute("florist plant arctic moss");
	}
	else if (myLocation() === Location.get("A Massive Ziggurat"))
	{
		cliExecute("florist plant skunk cabbage");
		cliExecute("florist plant deadly cinnamon");
	}
	else if (myLocation() === Location.get("The Arid, Extra-Dry Desert"))
	{
		cliExecute("florist plant rad-ish radish");
		cliExecute("florist plant lettuce spray");
	}
	else if (myLocation() === Location.get("The Hidden Apartment Building"))
	{
		cliExecute("florist plant impatiens");
		cliExecute("florist plant spider plant");
		cliExecute("florist plant pitcher plant");
	}
	else if (myLocation() === Location.get("The Hidden Office Building"))
	{
		cliExecute("florist plant canned spinach");
	}
	else if (myLocation() === Location.get("The Hidden Bowling Alley"))
	{
		cliExecute("florist plant Stealing Magnolia");
	}
	else if (myLocation() === Location.get("The Hidden Hospital"))
	{
		cliExecute("florist plant bamboo!");
		cliExecute("florist plant aloe guv'nor");
	}
	else if (myLocation() === Location.get("The Upper Chamber"))
	{
		if (addml) {
			cliExecute("florist plant Blustery Puffball");
		}
		cliExecute("florist plant Loose Morels");
		cliExecute("florist plant Foul Toadstool");
	}
	else if (myLocation() === Location.get("The Middle Chamber"))
	{
		cliExecute("florist plant Horn of Plenty");
		cliExecute("florist plant max headshroom");
		cliExecute("florist plant Dis Lichen");
	}
	else if (myLocation() === Location.get("The Battlefield (Frat Uniform)"))
	{
		cliExecute("florist plant Seltzer Watercress");
		cliExecute("florist plant Smoke-ra");
		cliExecute("florist plant Rutabeggar");
	}
	else if (myLocation() === Location.get("The Secret Government Laboratory") && myDaycount() === 1)
	{
		cliExecute("florist plant Pitcher Plant");
		cliExecute("florist plant Canned Spinach");
	}
	else if (myLocation() === Location.get("The Hippy Camp") && myDaycount() === 1)
	{
		cliExecute("florist plant Seltzer Watercress");
		cliExecute("florist plant Rad-ish Radish");
	}
	else if (myLocation() === Location.get("Pirates of the Garbage Barges") && myDaycount() === 1)
	{
		cliExecute("florist plant Pitcher Plant");
		cliExecute("florist plant Canned Spinach");
	}
	else if (myLocation() === Location.get("The Battlefield (Hippy Uniform)"))
	{
		cliExecute("florist plant Seltzer Watercress");
		cliExecute("florist plant Smoke-ra");
		cliExecute("florist plant Rutabeggar");
	}
}