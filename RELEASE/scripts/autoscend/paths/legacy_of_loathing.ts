import { Coinmaster, Familiar, Item, Path, Skill, abort, availableAmount, buy, containsText, getProperty, haveFamiliar, itemAmount, myPath, setProperty, toLowerCase, use, visitUrl } from "kolmafia";
import { is100FamRun, pathHasFamiliar } from "../auto_familiar";
import { auto_sourceTerminalEducate, auto_sourceTerminalRequest } from "../iotms/mr2016";
import { auto_buyFrom2002MrStore, auto_scepterSkills } from "../iotms/mr2023";

//Defined in autoscend/paths/legacy_of_loathing.ash
export function in_lol(): boolean
{
	return myPath() === Path.get("Legacy of Loathing");
}

export function lol_initializeSettings(): void
{
	if (!in_lol())
	{
		return;
	}
	setProperty("auto_wandOfNagamar", true.toString()); //wand  used in this path
}

export function lol_buyReplicas(): boolean
{
	if (!in_lol())
	{
		return false;
	}

	if (itemAmount(Item.get("replica Mr. Accessory")) === 0)
	{
		return false;
	}

	while (itemAmount(Item.get("replica Mr. Accessory")) > 0)
	{
		let page: string = toLowerCase(visitUrl("shop.php?whichshop=mrreplica"));
		// attempt to buy 2023 IOTMs first as if you one them, they are immediately available
		// then attempt to buy sequentially year by year starting with 2004
		// note with enough progress, can a second option up to year 2012
		if (containsText(page, "cincho"))
		{ //2023
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Cincho de Mayo"));
		}
		if (containsText(page, "2002"))
		{ //2023
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("Replica 2002 Mr. Store Catalog"));
			auto_buyFrom2002MrStore();
		}
		if (containsText(page, "patriotic eagle") && !is100FamRun())
		{ //If this isn't a 100% familiar run, go ahead and get another familiar
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica sleeping patriotic eagle"));
			use(1, Item.get("replica sleeping patriotic eagle")); // put in terrarium
		}
		if (containsText(page, "august scepter"))
		{ //2023
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica august scepter"));
			auto_scepterSkills();
		}
		//End of 2023 "Always Available" IoTMs and starting legacy "one at a time" IoTMs
		if (containsText(page, "<b>2004</b>"))
		{
			if (haveFamiliar(Familiar.get("Jill-O-Lantern")) || haveFamiliar(Familiar.get("Hand Turkey")))
			{
				// already bought one
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica crimbo elfling"));
				use(1, Item.get("replica crimbo elfling")); // put in terrarium
			}
			else if (itemAmount(Item.get("replica Mr. Accessory")) >= 6)
			{
				// buy hand turkey if can get bander t0
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica hand turkey outline"));
				use(1, Item.get("replica hand turkey outline")); // put in terrarium
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Dark Jill-O-Lantern"));
				use(1, Item.get("replica Dark Jill-O-Lantern")); // put in terrarium
			}
		}
		else if (containsText(page, "<b>2005</b>"))
		{
			if (availableAmount(Item.get("replica wax lips")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica wax lips"));
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica miniature gravy-covered maypole"));
			}
		}
		else if (containsText(page, "<b>2006</b>"))
		{
			if (availableAmount(Item.get("replica jewel-eyed wizard hat")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica jewel-eyed wizard hat"));
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Tome of Snowcone Summoning"));
			}
		}
		else if (containsText(page, "<b>2007</b>"))
		{
			if (availableAmount(Item.get("replica navel ring of navel gazing")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica navel ring of navel gazing"));
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica V for Vivala mask"));
			}
		}
		else if (containsText(page, "<b>2008</b>"))
		{
			if (availableAmount(Item.get("replica haiku katana")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica haiku katana"));
			}
			else {
				if (!is100FamRun())
				{ //If this isn't a 100% familiar run, go ahead and get another familiar
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica cotton candy cocoon"));
					use(1, Item.get("replica cotton candy cocoon")); // put in terrarium
				}
				else {
				//This is a 100% familiar run, no need to buy another familiar
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica little box of fireworks"));
				}
			}
		}
		else if (containsText(page, "<b>2009</b>"))
		{

			if (is100FamRun())
			{ //If on a 100% Fam Run, will get sunglasses on the first time around
				if (itemAmount(Item.get("replica Elvish sunglasses")) < 1)
				{
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Elvish sunglasses"));
				}
				else {
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Apathargic Bandersnatch"));
					use(1, Item.get("replica Apathargic Bandersnatch")); // put in terrarium
				}
			}
			else if (!haveFamiliar(Familiar.get("Frumious Bandersnatch")))
			{
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Apathargic Bandersnatch"));
					use(1, Item.get("replica Apathargic Bandersnatch")); // put in terrarium
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica squamous polyp"));
				use(1, Item.get("replica squamous polyp")); // put in terrarium
			}
		}
		else if (containsText(page, "<b>2010</b>"))
		{
			if (availableAmount(Item.get("replica Greatest American Pants")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Greatest American Pants"));
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica organ grinder"));
			}
		}
		else if (containsText(page, "<b>2011</b>"))
		{

			if (is100FamRun())
			{ //If on a 100% Fam Run, will get non-familiars
				if (containsText(page, "replica Operation Patriot Shield"))
				{
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Operation Patriot Shield"));
				}
				else {
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica plastic vampire fangs"));
				}
			}
			else if (!haveFamiliar(Familiar.get("Obtuse Angel")))
			{
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica cute angel"));
					use(1, Item.get("replica cute angel")); // put in terrarium
			}
			else {
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Operation Patriot Shield"));
			}
		}
		else if (containsText(page, "<b>2012</b>"))
		{
			if (itemAmount(Item.get("replica Libram of Resolutions")) === 0)
			{
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Libram of Resolutions"));
				use(1, Item.get("replica Libram of Resolutions")); // get items
			}
			else {
				if (!is100FamRun())
				{ //If this isn't a 100% familiar run, go ahead and get another familiar
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica deactivated nanobots"));
					use(1, Item.get("replica deactivated nanobots")); // put in terrarium
				}
				else {
				//This is a 100% familiar run, no need to buy another familiar
					buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Camp Scout backpack"));
				}
			}
		}
		else if (containsText(page, "<b>2013</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Smith's Tome"));
			use(1, Item.get("replica Smith's Tome")); // get items
		}
		else if (containsText(page, "<b>2014</b>"))
		{
			if (!is100FamRun())
			{ //If this isn't a 100% familiar run, go ahead and get another familiar
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Crimbo sapling"));
				use(1, Item.get("replica Crimbo sapling")); // put in terrarium
			}
			else {
			//This is a 100% familiar run, no need to buy another familiar
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Little Geneticist DNA-Splicing Lab"));
				use(1, Item.get("replica Little Geneticist DNA-Splicing Lab")); // put in workshed
			}
		}
		else if (containsText(page, "<b>2015</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Deck of Every Card"));
		}
		else if (containsText(page, "<b>2016</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Source terminal"));
			use(1, Item.get("replica Source terminal")); // put in campsite
			// initialize
			auto_sourceTerminalEducate(Skill.get("Extract"), Skill.get("Digitize"));
			if (containsText(getProperty("sourceTerminalEnquiryKnown"), "familiar.enq") && pathHasFamiliar())
			{
				auto_sourceTerminalRequest("enquiry familiar.enq");
			}
			else if (containsText(getProperty("sourceTerminalEnquiryKnown"), "stats.enq"))
			{
				auto_sourceTerminalRequest("enquiry stats.enq");
			}
			else if (containsText(getProperty("sourceTerminalEnquiryKnown"), "protect.enq"))
			{
				auto_sourceTerminalRequest("enquiry protect.enq");
			}
		}
		else if (containsText(page, "<b>2017</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica genie bottle"));
		}
		else if (containsText(page, "<b>2018</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica January's Garbage Tote"));
		}
		else if (containsText(page, "<b>2019</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Kramco Sausage-o-Matic&trade;"));
		}
		else if (containsText(page, "<b>2020</b>"))
		{
			if (!is100FamRun())
			{ //If this isn't a 100% familiar run, go ahead and get another familiar
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica baby camelCalf"));
				use(1, Item.get("replica baby camelCalf")); // put in terrarium
			}
			else {
			//This is a 100% familiar run, no need to buy another familiar
				buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Powerful Glove"));
			}
		}
		else if (containsText(page, "<b>2021</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica emotion chip"));
			use(1, Item.get("replica emotion chip")); // learn skills
		}
		else if (containsText(page, "<b>2022</b>"))
		{
			buy(Coinmaster.get("Replica Mr. Store"), 1, Item.get("replica Jurassic Parka"));
		}
		else if (itemAmount(
		//
		Item.get("replica Mr. Accessory")) > 0)
		{
			abort("Didn't buy from replica Mr. Store even though we have a replica Mr. A. Report to devs");
		}
	}

	return true;
}

export function auto_LegacyOfLoathingDailies(): void
{
	if (itemAmount(Item.get("replica Libram of Resolutions")) > 0)
	{
		use(1, Item.get("replica Libram of Resolutions")); // get items
	}

	if (itemAmount(Item.get("replica Smith's Tome")) > 0)
	{
		use(1, Item.get("replica Smith's Tome")); // get items
	}
}

export function auto_ItemToReplica(it: Item): Item
{
	switch (it)
	{
		case Item.get("Mr. Accessory"):
			return Item.get("replica Mr. Accessory");
		case Item.get("crimbo elfling"):
			return Item.get("replica crimbo elfling");
		case Item.get("Dark Jill-O-Lantern"):
			return Item.get("replica Dark Jill-O-Lantern");
		case Item.get("hand turkey outline"):
			return Item.get("replica hand turkey outline");
		case Item.get("miniature gravy-covered maypole"):
			return Item.get("replica miniature gravy-covered maypole");
		case Item.get("pygmy bugbear shaman"):
			return Item.get("replica pygmy bugbear shaman");
		case Item.get("wax lips"):
			return Item.get("replica wax lips");
		case Item.get("jewel-eyed wizard hat"):
			return Item.get("replica jewel-eyed wizard hat");
		case Item.get("plastic pumpkin bucket"):
			return Item.get("replica plastic pumpkin bucket");
		case Item.get("Tome of Snowcone Summoning"):
			return Item.get("replica Tome of Snowcone Summoning");
		case Item.get("bottle-rocket crossbow"):
			return Item.get("replica bottle-rocket crossbow");
		case Item.get("navel ring of navel gazing"):
			return Item.get("replica navel ring of navel gazing");
		case Item.get("V for Vivala mask"):
			return Item.get("replica V for Vivala mask");
		case Item.get("cotton candy cocoon"):
			return Item.get("replica cotton candy cocoon");
		case Item.get("haiku katana"):
			return Item.get("replica haiku katana");
		case Item.get("little box of fireworks"):
			return Item.get("replica little box of fireworks");
		case Item.get("Apathargic Bandersnatch"):
			return Item.get("replica Apathargic Bandersnatch");
		case Item.get("Elvish sunglasses"):
			return Item.get("replica Elvish sunglasses");
		case Item.get("squamous polyp"):
			return Item.get("replica squamous polyp");
		case Item.get("Greatest American Pants"):
			return Item.get("replica Greatest American Pants");
		case Item.get("Juju Mojo Mask"):
			return Item.get("replica Juju Mojo Mask");
		case Item.get("organ grinder"):
			return Item.get("replica organ grinder");
		case Item.get("a cute angel"):
			return Item.get("replica cute angel");
		case Item.get("Operation Patriot Shield"):
			return Item.get("replica Operation Patriot Shield");
		case Item.get("plastic vampire fangs"):
			return Item.get("replica plastic vampire fangs");
		case Item.get("Camp Scout backpack"):
			return Item.get("replica Camp Scout backpack");
		case Item.get("deactivated nanobots"):
			return Item.get("replica deactivated nanobots");
		case Item.get("Libram of Resolutions"):
			return Item.get("replica Libram of Resolutions");
		case Item.get("Order of the Green Thumb Order Form"):
			return Item.get("replica Order of the Green Thumb Order Form");
		case Item.get("over-the-shoulder Folder Holder"):
			return Item.get("replica over-the-shoulder Folder Holder");
		case Item.get("The Smith's Tome"):
			return Item.get("replica Smith's Tome");
		case Item.get("Crimbo sapling"):
			return Item.get("replica Crimbo sapling");
		case Item.get("Little Geneticist DNA-Splicing Lab"):
			return Item.get("replica Little Geneticist DNA-Splicing Lab");
		case Item.get("still grill"):
			return Item.get("replica still grill");
		case Item.get("Chateau Mantegna room key"):
			return Item.get("replica Chateau Mantegna room key");
		case Item.get("Deck of Every Card"):
			return Item.get("replica Deck of Every Card");
		case Item.get("Witchess Set"):
			return Item.get("replica Witchess Set");
		case Item.get("disconnected intergnat"):
			return Item.get("replica disconnected intergnat");
		case Item.get("Source terminal"):
			return Item.get("replica Source terminal");
		case Item.get("yellow puck"):
			return Item.get("replica yellow puck");
		case Item.get("genie bottle"):
			return Item.get("replica genie bottle");
		case Item.get("space planula"):
			return Item.get("replica space planula");
		case Item.get("unpowered Robortender"):
			return Item.get("replica unpowered Robortender");
		case Item.get("God Lobster Egg"):
			return Item.get("replica God Lobster Egg");
		case Item.get("January's Garbage Tote"):
			return Item.get("replica January's Garbage Tote");
		case Item.get("Neverending Party invitation envelope"):
			return Item.get("replica Neverending Party invitation envelope");
		case Item.get("Fourth of May Cosplay Saber"):
			return Item.get("replica Fourth of May Cosplay Saber");
		case Item.get("hewn moon-rune spoon"):
			return Item.get("replica hewn moon-rune spoon");
		case Item.get("Kramco Sausage-o-Matic&trade;"):
			return Item.get("replica Kramco Sausage-o-Matic&trade;");
		case Item.get("baby camelCalf"):
			return Item.get("replica baby camelCalf");
		case Item.get("Cargo Cultist Shorts"):
			return Item.get("replica Cargo Cultist Shorts");
		case Item.get("Powerful Glove"):
			return Item.get("replica Powerful Glove");
		case Item.get("emotion chip"):
			return Item.get("replica emotion chip");
		case Item.get("industrial fire extinguisher"):
			return Item.get("replica industrial fire extinguisher");
		case Item.get("miniature crystal ball"):
			return Item.get("replica miniature crystal ball");
		case Item.get("designer sweatpants"):
			return Item.get("replica designer sweatpants");
		case Item.get("grey gosling"):
			return Item.get("replica grey gosling");
		case Item.get("Jurassic Parka"):
			return Item.get("replica Jurassic Parka");
		case Item.get("Cincho de Mayo"):
			return Item.get("replica Cincho de Mayo");
		case Item.get("2002 Mr. Store Catalog"):
			return Item.get("Replica 2002 Mr. Store Catalog");
		case Item.get("august scepter"):
			return Item.get("replica august scepter");
	}
	return it;
}