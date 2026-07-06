import { abort, advCost, canEquip, canInteract, chew, Class, cliExecute, creatableAmount, creatableTurns, create, Effect, equippedAmount, Familiar, getProperty, haveEffect, historicalPrice, hpCost, isUnrestricted, Item, itemAmount, lightningCost, Location, meatCost, mpCost, myAdventures, myClass, myHp, myLightning, myLocation, myMeat, myMp, myRain, mySoulsauce, myThunder, npcPrice, rainCost, setLocation, setProperty, Skill, Slot, soulsauceCost, thunderCost, toBoolean, toSkill, toSlot, use, useSkill, visitUrl } from "kolmafia";
import { acquireTotem, auto_buyUpTo } from "./auto_acquire";
import { autoAdv$2 } from "./auto_adventure";
import { isSpleenConsumable } from "./auto_consume";
import { auto_loadEquipped, auto_saveEquipped, autoForceEquip, possessEquipment } from "./auto_equipment";
import { auto_have_familiar, pathHasFamiliar } from "./auto_familiar";
import { uneffect } from "./auto_restore";
import { auto_have_skill, auto_is_valid, auto_log_debug, auto_log_debug$1, auto_log_warning$1, handleTracker, handleTracker$1, meatReserve, shrugAT$1 } from "./auto_util";
import { auto_birdCanSeek, auto_favoriteBirdCanSeek, auto_powerfulGloveCharges, auto_powerfulGloveNoncombat, auto_powerfulGloveStats } from "./iotms/mr2020";
import { auto_haveEmotionChipSkills } from "./iotms/mr2021";
import { auto_availableBrickRift, auto_haveIdolMicrophone } from "./iotms/mr2023";
import { auto_equipAprilShieldBuff, auto_getItemToEquipBCZ, auto_haveBCZ, auto_unequipAprilShieldBuff } from "./iotms/mr2025";
import { ARBSupplyDrop, auto_canARBSupplyDrop } from "./iotms/ttt";
import { in_bhy } from "./paths/bees_hate_you";
import { inAftercore } from "./paths/casual";
import { glover_usable$1 } from "./paths/g_lover";
import { in_heavyrains } from "./paths/heavy_rains";
import { in_tcrs } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";

//Defined in autoscend/auto_buff.ash
function buffMaintain(source: Skill, buff: Effect, mustEquip: Item, mp_min: number, casts: number, turns: number, speculative: boolean): boolean
{
	if (!glover_usable$1(buff))
	{
		return false;
	}

	if (!auto_have_skill(source) || haveEffect(buff) >= turns)
	{
		return false;
	}

	if (myMp() < mp_min || myMp() < casts * mpCost(source))
	{
		return false;
	}
	if (myHp() <= casts * hpCost(source))
	{
		return false;
	}
	if (myAdventures() < casts * advCost(source))
	{
		return false;
	}
	if (myLightning() < casts * lightningCost(source))
	{
		return false;
	}
	if (myRain() < casts * rainCost(source))
	{
		return false;
	}
	if (mySoulsauce() < casts * soulsauceCost(source))
	{
		return false;
	}
	if (myThunder() < casts * thunderCost(source))
	{
		return false;
	}
	if (myMeat() < casts * meatCost(source))
	{
		return false;
	}
	//handling for buffs that must equip something first
	let equip_changed: boolean = false;
	const equipped: Map<number, Item> = auto_saveEquipped();
	const equip_slot: Slot = toSlot(mustEquip);
	if (mustEquip !== Item.none)
	{
		if (!possessEquipment(mustEquip) || !auto_is_valid(
		//we can not wear what we do not have. this checks both inventory and already worn
		mustEquip) || !canEquip(
		//checks path limitations
		mustEquip))
		{ //checks if stats are high enough
			return false; //we can not wear this equipment
		}
		if (!speculative)
		{
			//wear it now before using the buff.
			autoForceEquip(equip_slot, mustEquip, true);
			if (equippedAmount(mustEquip) === 0)
			{
				auto_log_warning$1(`buffMaintain failed to equip [${mustEquip}] for some reason. which is necessary in order to apply [${buff}] using the skill [${source}].`);
				return false;
			}
			equip_changed = true;
		}
	}
	if (!speculative)
	{
		useSkill(casts, source);
	}

	if (equip_changed)
	{
		auto_loadEquipped(equipped); //return equipment to how it was originally
	}
	return true;
}

function buffMaintain$1(source: Item, buff: Effect, uses: number, turns: number, speculative: boolean): boolean
{
	if (in_tcrs())
	{
		auto_log_debug(`We want to use ${source} but are in 2CRS.`, "blue");
		return false;
	}

	if (!glover_usable$1(buff))
	{
		return false;
	}
	if (!auto_is_valid(source))
	{
		return false;
	}

	if (haveEffect(buff) >= turns)
	{
		return false;
	}
	if (itemAmount(source) < uses && !in_wotsf())
	{
		const numToBuy: number = uses - itemAmount(source);
		const meatAvailableToBuy: number = myMeat() - meatReserve();
		// attempt to buy from NPC for meat
		if (npcPrice(source) !== 0 && meatAvailableToBuy > npcPrice(source))
		{
			if (!speculative)
			{
				auto_buyUpTo(numToBuy, source);
			}
			else {
				//if speculating, assume buy works
				return true;
			}
		}
		else if (canInteract() && historicalPrice(
		// attempt to buy in mall
		source) !== 0 && meatAvailableToBuy > historicalPrice(source))
		{
			if (!speculative)
			{
				auto_buyUpTo(numToBuy, source);
			}
			else {
				//if speculating, assume buy works
				return true;
			}
		}
	}
	// Craft if we have free crafts and it's craftable
	if (itemAmount(source) < uses)
	{
		const needed: number = uses - itemAmount(source);
		const n_can_craft: number = creatableAmount(source);
		const turns_to_craft: number = creatableTurns(source, needed, true);
		if (turns_to_craft === 0 && n_can_craft >= needed)
		{
			handleTracker$1("buffMaintain", `${(speculative ? "Speculatively c" : "C")}rafting ${needed.toString()} ${source.toString()}`, "auto_otherstuff");
			if (!speculative)
			{
				create(source, needed);
			}
			else {
				return true;
			}
		}
	}
	if (itemAmount(source) < uses)
	{
		return false;
	}
	if (!speculative)
	{
		if (isSpleenConsumable(source))
		{
			chew(uses, source);
			handleTracker$1(source.toString(), myLocation().toString(), "auto_chewed");
		}
		else {
			use(uses, source);
		}
	}
	return true;
}

export function buffMaintain$2(buff: Effect, mp_min: number, casts: number, turns: number, speculative: boolean): boolean
{
	let useSkill_1: Skill = Skill.none;
	let useItem_1: Item = Item.none;
	let mustEquip: Item = Item.none;

	if (buff === Effect.none)
	{
		return false;
	}

	if (haveEffect(buff) >= turns)
	{
		return false;
	}

	let ret: boolean = false;
	switch (buff)
	{
	case Effect.get("A Few Extra Pounds"):
	//Jalapeno Saucesphere
useSkill_1 = Skill.get("Holiday Weight Gain");	break;
	case Effect.get("A Little Bit Poisoned"):	useSkill_1 = Skill.get("Disco Nap");	break;
	case Effect.get("Acting Jerky"):	useSkill_1 = Skill.get("Act Jerky");	break;
	case Effect.get("Adorable Lookout"):	useItem_1 = Item.get("giraffe-necked turtle");	break;
	case Effect.get("Alacri Tea"):	useItem_1 = Item.get("cuppa Alacri tea");	break;
	case Effect.get("All Fired Up"):	useItem_1 = Item.get("ant agonist");	break;
	case Effect.get("All Glory To the Toad"):	useItem_1 = Item.get("colorful toad");	break;
	case Effect.get("All Revved Up"):	useSkill_1 = Skill.get("Rev Engine");	break;
	case Effect.get("Almost Cool"):	useItem_1 = Item.get("mostly-broken sunglasses");	break;
	case Effect.get("Aloysius' Antiphon of Aptitude"):	useSkill_1 = Skill.get("Aloysius' Antiphon of Aptitude");	break;
	case Effect.get("Amazing"):	useItem_1 = Item.get("pocket maze");	break;
	case Effect.get("Angry"):	useSkill_1 = Skill.get("Anger Glands");	break;
	case Effect.get("Angry like the Wolf"):
		if (auto_have_familiar(Familiar.get("Grim Brother")) && !toBoolean(getProperty("_grimBuff")))
		{
			if (speculative)
			{
				return true;
			}
			visitUrl("choice.php?pwd&whichchoice=835&option=2", true);
			ret = true;
		}		break;
	case Effect.get("Antibiotic Saucesphere"):	useSkill_1 = Skill.get("Antibiotic Saucesphere");	break;
	case Effect.get("Arched Eyebrow of the Archmage"):	useSkill_1 = Skill.get("Arched Eyebrow of the Archmage");	break;
	case Effect.get("Armor-Plated"):	useItem_1 = Item.get("bent scrap metal");	break;
	case Effect.get("Ashen"):	useItem_1 = Item.get("pile of ashes");	break;
	case Effect.get("Ashen Burps"):	useItem_1 = Item.get("ash soda");	break;
	case Effect.get("Astral Shell"):
		if (auto_have_skill(Skill.get("Astral Shell")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Astral Shell");
		}		break;
	case Effect.get("Attracting Snakes"):	useSkill_1 = Skill.get("Attract Snakes");	break;
	case Effect.get("Attractive to Fire Ants"):	useItem_1 = Item.get("fire ant pheromones");	break;
	case Effect.get("Aware of Bees"):
		if (!toBoolean(getProperty("_aug19Cast")))
		{
			useSkill_1 = Skill.get("Aug. 19th: Honey Bee Awareness Day!");
		}		break;
	case Effect.get("Baconstoned"):
		if (itemAmount(Item.get("vial of baconstone juice")) > 0)
		{
			useItem_1 = Item.get("vial of baconstone juice");
		}
		else if (itemAmount(Item.get("flask of baconstone juice")) > 0)
		{
			useItem_1 = Item.get("flask of baconstone juice");
		}
		else {
			useItem_1 = Item.get("jug of baconstone juice");
		}		break;
	case Effect.get("Baited Hook"):	useItem_1 = Item.get("wriggling worm");	break;
	case Effect.get("Balls of Ectoplasm"):	useItem_1 = Item.get("ectoplasmic orbs");	break;
	case Effect.get("Bandersnatched"):	useItem_1 = Item.get("tonic o' Banderas");	break;
	case Effect.get("Barbecue Saucy"):	useItem_1 = Item.get("dollop of barbecue sauce");	break;
	case Effect.get("Be a Mind Master"):	useItem_1 = Item.get("Daily Affirmation: Be a Mind Master");	break;
	case Effect.get("A Beastly Odor"):	useItem_1 = Item.get("The Beast Within&trade; candle");	break;
	case Effect.get("Become Superficially interested"):	useItem_1 = Item.get("Daily Affirmation: Be Superficially interested");	break;
	case Effect.get("Beef Goggles"):	useSkill_1 = Skill.get("Beef Goggles");	break;
	case Effect.get("Bendin' Hell"):	useSkill_1 = Skill.get("Bend Hell");	break;
	case Effect.get("Bent Knees"):	useSkill_1 = Skill.get("Bendable Knees");	break;
	case Effect.get("Benetton's Medley of Diversity"):	useSkill_1 = Skill.get("Benetton's Medley of Diversity");	break;
	case Effect.get("Berry Elemental"):	useItem_1 = Item.get("Tapioc berry");	break;
	case Effect.get("Berry Statistical"):	useItem_1 = Item.get("Snarf berry");	break;
	case Effect.get("Best Pals"):	useSkill_1 = Skill.get("Heartstone: %pals");	break;
	case Effect.get("Bet Your Autumn Dollar"):	useItem_1 = Item.get("autumn dollar");	break;
	case Effect.get("Big"):	useSkill_1 = Skill.get("Get Big");	break;
	case Effect.get("Big Meat Big Prizes"):	useItem_1 = Item.get("Meat-inflating powder");	break;
	case Effect.get("Biologically Shocked"):	useItem_1 = Item.get("glowing syringe");	break;
	case Effect.get("Bitterskin"):	useItem_1 = Item.get("bitter pill");	break;
	case Effect.get("Black Eyes"):	useItem_1 = Item.get("black eye shadow");	break;
	case Effect.get("Black Tongue"):	useItem_1 = Item.get("black snowcone");	break;
	case Effect.get("Blackberry Politeness"):	useItem_1 = Item.get("blackberry polite");	break;
	case Effect.get("Blessing of Serqet"):	useSkill_1 = Skill.get("Blessing of Serqet");	break;
	case Effect.get("Blessing of the Bird"):
		if (auto_birdCanSeek())
		{
			useSkill_1 = Skill.get("Seek out a Bird");
		}		break;
	case Effect.get("Blessing of your favorite Bird"):
		if (auto_favoriteBirdCanSeek())
		{
			useSkill_1 = Skill.get("Visit your Favorite Bird");
		}		break;
	case Effect.get("Blinking Belly"):	useSkill_1 = Skill.get("Firefly Abdomen");	break;
	case Effect.get("Blood-Gorged"):	useItem_1 = Item.get("vial of blood simple syrup");	break;
	case Effect.get("Blood Bond"):	useSkill_1 = Skill.get("Blood Bond");	break;
	case Effect.get("Blood Bubble"):	useSkill_1 = Skill.get("Blood Bubble");	break;
	case Effect.get("Bloodbathed"):
		if (auto_haveBCZ())
		{
			mustEquip = auto_getItemToEquipBCZ();
			useSkill_1 = Skill.get("BCZ: Blood Bath");
		}		break;
	case Effect.get("Bloody Potato Bits"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Bloodstain-Resistant"):	useItem_1 = Item.get("bloodstain stick");	break;
	case Effect.get("Blooper Inked"):	useItem_1 = Item.get("blooper ink");	break;
	case Effect.get("Blubbered Up"):	useSkill_1 = Skill.get("Blubber Up");	break;
	case Effect.get("Blue Swayed"):	useItem_1 = Item.get("pulled blue taffy");	break;
	case Effect.get("Blue Tongue"):	useItem_1 = Item.get("blue snowcone");	break;
	case Effect.get("Bone Springs"):	useSkill_1 = Skill.get("Bone Springs");	break;
	case Effect.get("Boner Battalion"):	useSkill_1 = Skill.get("Summon &quot;Boner Battalion&quot;");	break;
	case Effect.get("Boon of She-Who-Was"):	useSkill_1 = Skill.get("Spirit Boon");	break;
	case Effect.get("Boon of the Storm Tortoise"):	useSkill_1 = Skill.get("Spirit Boon");	break;
	case Effect.get("Boon of the War Snapper"):	useSkill_1 = Skill.get("Spirit Boon");	break;
	case Effect.get("Bounty of Renenutet"):	useSkill_1 = Skill.get("Bounty of Renenutet");	break;
	case Effect.get("Bow-Legged Swagger"):	useSkill_1 = Skill.get("Bow-Legged Swagger");	break;
	case Effect.get("Bram's Bloody Bagatelle"):	useSkill_1 = Skill.get("Bram's Bloody Bagatelle");	break;
	case Effect.get("Brawnee's Anthem of Absorption"):	useSkill_1 = Skill.get("Brawnee's Anthem of Absorption");	break;
	case Effect.get("Brilliant Resolve"):	useItem_1 = Item.get("resolution: be smarter");	break;
	case Effect.get("Brittled"):	useItem_1 = Item.get("pea brittle");	break;
	case Effect.get("Brooding"):	useSkill_1 = Skill.get("Brood");	break;
	case Effect.get("Browbeaten"):	useItem_1 = Item.get("old eyebrow pencil");	break;
	case Effect.get("Burning Hands"):	useItem_1 = Item.get("sticky lava globs");	break;
	case Effect.get("Busy Bein' Delicious"):	useItem_1 = Item.get("Crimbo fudge");	break;
	case Effect.get("Butt-Rock Hair"):	useItem_1 = Item.get("hair spray");	break;
	case Effect.get("Can't Smell Nothin'"):	useItem_1 = Item.get("Dogsgotnonoz pills");	break;
	case Effect.get("Candied Devil"):	useItem_1 = Item.get("deviled candy egg");	break;
	case Effect.get("Car-Charged"):	useItem_1 = Item.get("battery (car)");	break;
	case Effect.get("Carlweather's Cantata of Confrontation"):	useSkill_1 = Skill.get("Carlweather's Cantata of Confrontation");	break;
	case Effect.get("Carol of the Bulls"):	useSkill_1 = Skill.get("Carol of the Bulls");	break;
	case Effect.get("Carol of the Hells"):	useSkill_1 = Skill.get("Carol of the Hells");	break;
	case Effect.get("Carol of the Thrills"):	useSkill_1 = Skill.get("Carol of the Thrills");	break;
	case Effect.get("Cautious Prowl"):	useSkill_1 = Skill.get("Walk: Cautious Prowl");	break;
	case Effect.get("Ceaseless Snarling"):	useSkill_1 = Skill.get("Ceaseless Snarl");	break;
	case Effect.get("Celestial Camouflage"):	useItem_1 = Item.get("celestial squid ink");	break;
	case Effect.get("Celestial Saltiness"):	useItem_1 = Item.get("celestial au jus");	break;
	case Effect.get("Celestial Sheen"):	useItem_1 = Item.get("celestial olive oil");	break;
	case Effect.get("Celestial Vision"):	useItem_1 = Item.get("celestial carrot juice");	break;
	case Effect.get("Cheddarmored"):	useSkill_1 = Skill.get("Cheddarmor");	break;
	case Effect.get("Cheerled"):	useSkill_1 = Skill.get("Cheerlead");	break;
	case Effect.get("Cinnamon Challenger"):	useItem_1 = Item.get("pulled red taffy");	break;
	case Effect.get("Clear Ears, Can't Lose"):	useItem_1 = Item.get("ear candle");	break;
	case Effect.get("Cletus's Canticle of Celerity"):	useSkill_1 = Skill.get("Cletus's Canticle of Celerity");	break;
	case Effect.get("Cloak of Shadows"):	useSkill_1 = Skill.get("Blood Cloak");	break;
	case Effect.get("Cloud of Mosquitos"):
		if (!toBoolean(getProperty("_aug20Cast")))
		{
			useSkill_1 = Skill.get("Aug. 20th: Mosquito Day!");
		}		break;
	case Effect.get("Clyde's Blessing"):	useItem_1 = Item.get("The Legendary Beat");	break;
	case Effect.get("Chalky Hand"):	useItem_1 = Item.get("handful of hand chalk");	break;
	case Effect.get("Chocolatesphere"):	useSkill_1 = Skill.get("Chocolatesphere");	break;
	case Effect.get("Chow Downed"):	useSkill_1 = Skill.get("Zombie Chow");	break;
	case Effect.get("Cranberry Cordiality"):	useItem_1 = Item.get("cranberry cordial");	break;
	case Effect.get("Coffeesphere"):	useSkill_1 = Skill.get("Coffeesphere");	break;
	case Effect.get("Cold Hard Skin"):	useItem_1 = Item.get("frost-rimed seal hide");	break;
	case Effect.get("Confidence of the Votive"):	useItem_1 = Item.get("votive of confidence");	break;
	case Effect.get("Contemptible Emanations"):	useItem_1 = Item.get("cologne of contempt");	break;
	case Effect.get("Covered in the Rainbow"):	useItem_1 = Item.get("rainbow glitter candle");	break;
	case Effect.get("The Cupcake of Wrath"):	useItem_1 = Item.get("green-frosted astral cupcake");	break;
	case Effect.get("Curiosity of Br'er Tarrypin"):
		if (pathHasFamiliar() && auto_have_skill(Skill.get("Curiosity of Br'er Tarrypin")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Curiosity of Br'er Tarrypin");
		}		break;
	case Effect.get("Crunching Leaves"):	useItem_1 = Item.get("autumn leaf");	break;
	case Effect.get("Crunchy Steps"):	useItem_1 = Item.get("crunchy brush");	break;
	case Effect.get("Cyber Resist x2000"):	useItem_1 = Item.get("Synapse Blaster");	break;
	case Effect.get("Dance of the Sugar Fairy"):	useItem_1 = Item.get("sugar fairy");	break;
	case Effect.get("Darkened Meat"):	useSkill_1 = Skill.get("Dark Meat");	break;
	case Effect.get("Destructive Resolve"):	useItem_1 = Item.get("resolution: be feistier");	break;
	case Effect.get("Dexteri Tea"):	useItem_1 = Item.get("cuppa Dexteri tea");	break;
	case Effect.get("Digitally Converted"):	useItem_1 = Item.get("digital underground potion");	break;
	case Effect.get("The Dinsey Look"):	useItem_1 = Item.get("Dinsey face paint");	break;
	case Effect.get("Dirge of Dreadfulness"):	useSkill_1 = Skill.get("Dirge of Dreadfulness");	break;
	case Effect.get("Dirge of Dreadfulness (Remastered)"):
		mustEquip = Item.get("velour vaqueros");
		useSkill_1 = Skill.get("Dirge of Dreadfulness");
		break;
	case Effect.get("Disco Fever"):	useSkill_1 = Skill.get("Disco Fever");	break;
	case Effect.get("Disco Leer"):	useSkill_1 = Skill.get("Disco Leer");	break;
	case Effect.get("Disco over Matter"):
		if (auto_have_skill(Skill.get("Disco Aerobics")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Disco Aerobics");
		}		break;
	case Effect.get("Disco Smirk"):	useSkill_1 = Skill.get("Disco Smirk");	break;
	case Effect.get("Disco State of Mind"):	useSkill_1 = Skill.get("Disco Aerobics");	break;
	case Effect.get("Disdain of She-Who-Was"):	useSkill_1 = Skill.get("Blessing of She-Who-Was");	break;
	case Effect.get("Disdain of the Storm Tortoise"):	useSkill_1 = Skill.get("Blessing of the Storm Tortoise");	break;
	case Effect.get("Disdain of the War Snapper"):	useSkill_1 = Skill.get("Blessing of the War Snapper");	break;
	case Effect.get("Disquiet Riot"):	useSkill_1 = Skill.get("Disquiet Riot");	break;
	case Effect.get("Drenched With Filth"):	useItem_1 = Item.get("concentrated garbage juice");	break;
	case Effect.get("Drescher's Annoying Noise"):	useSkill_1 = Skill.get("Drescher's Annoying Noise");	break;
	case Effect.get("Drunk and Avuncular"):	useItem_1 = Item.get("Drunk Uncles holo-record");	break;
	case Effect.get("Eagle Eyes"):	useItem_1 = Item.get("eagle feather");	break;
	case Effect.get("Ear Winds"):	useSkill_1 = Skill.get("Flappy Ears");	break;
	case Effect.get("Earning Interest"):	useItem_1 = Item.get("savings bond");	break;
	case Effect.get("Eau D'enmity"):	useItem_1 = Item.get("perfume of prejudice");	break;
	case Effect.get("Eau de Tortue"):	useItem_1 = Item.get("turtle pheromones");	break;
	case Effect.get("Egged On"):	useItem_1 = Item.get("robin's egg");	break;
	case Effect.get("El Aroma de Salsa"):	useItem_1 = Item.get("Salsa Caliente&trade; candle");	break;
	case Effect.get("Eldritch Alignment"):	useItem_1 = Item.get("eldritch alignment spray");	break;
	case Effect.get("Elemental Saucesphere"):	useSkill_1 = Skill.get("Elemental Saucesphere");	break;
	case Effect.get("Ellipsoidtined"):
		if (auto_canARBSupplyDrop())
		{
			if (speculative)
			{
				return true;
			}
			ARBSupplyDrop("ellipsoidtine");
			ret = true;
		}		break;
	case Effect.get("Empathy"):
		if (pathHasFamiliar() && auto_have_skill(Skill.get("Empathy of the Newt")) && acquireTotem() && auto_unequipAprilShieldBuff())
		{
			useSkill_1 = Skill.get("Empathy of the Newt");
		}		break;
	case Effect.get("Erudite"):	useItem_1 = Item.get("black sheepskin diploma");	break;
	case Effect.get("Ew, The Humanity"):	useItem_1 = Item.get("Scent of a Human&trade; candle");	break;
	case Effect.get("Expert Oiliness"):	useItem_1 = Item.get("oil of expertise");	break;
	case Effect.get("Experimental Effect G-9"):	useItem_1 = Item.get("experimental serum G-9");	break;
	case Effect.get("Extended Toes"):	useSkill_1 = Skill.get("Retractable Toes");	break;
	case Effect.get("Extra Backbone"):	useItem_1 = Item.get("really thick spine");	break;
	case Effect.get("Extra-Green"):	useItem_1 = Item.get("glob of extra-green chlorophyll");	break;
	case Effect.get("Extreme Muscle Relaxation"):	useItem_1 = Item.get("Mick's IcyVapoHotness Rub");	break;
	case Effect.get("Everything Is Bananas"):	useItem_1 = Item.get("banana candle");	break;
	case Effect.get("Everything Must Go!"):	useItem_1 = Item.get("violent pastilles");	break;
	case Effect.get("Eyes All Black"):	useItem_1 = Item.get("delicious candy");	break;
	case Effect.get("Faboooo"):	useItem_1 = Item.get("Fabiotion");	break;
	case Effect.get("Far Out"):	useItem_1 = Item.get("patchouli incense stick");	break;
	case Effect.get("Fat Leon's Phat Loot Lyric"):	useSkill_1 = Skill.get("Fat Leon's Phat Loot Lyric");	break;
	case Effect.get("Feeling Fancy"):	useItem_1 = Item.get("roasted vegetable focaccia");	break;
	case Effect.get("Feeling Lonely"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Feeling Excited"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Feeling Nervous"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Feeling Peaceful"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Feeling Punchy"):	useItem_1 = Item.get("Punching Potion");	break;
	case Effect.get("Feeling Sneaky"):	useItem_1 = Item.get("trampled ticket stub");	break;
	case Effect.get("Feroci Tea"):	useItem_1 = Item.get("cuppa Feroci tea");	break;
	case Effect.get("Fever From the Flavor"):	useItem_1 = Item.get("bottle of antifreeze");	break;
	case Effect.get("Fireproof Lips"):	useItem_1 = Item.get("SPF 451 lip balm");	break;
	case Effect.get("Fire Inside"):	useItem_1 = Item.get("hot coal");	break;
	case Effect.get("Fishy, Oily"):
		if (in_heavyrains())
		{
			useItem_1 = Item.get("gourmet gourami oil");
		}		break;
	case Effect.get("Fishy Fortification"):	useItem_1 = Item.get("fish-liver oil");	break;
	case Effect.get("Fishy Whiskers"):
		if (in_heavyrains())
		{
			useItem_1 = Item.get("catfish whiskers");
		}		break;
	case Effect.get("Five Sticky Fingers"):	useItem_1 = Item.get("five-fingered fern resin");	break;
	case Effect.get("Flame-Retardant Trousers"):	useItem_1 = Item.get("hot powder");	break;
	case Effect.get("Flaming Weapon"):	useItem_1 = Item.get("hot nuggets");	break;
	case Effect.get("Flamibili Tea"):	useItem_1 = Item.get("cuppa Flamibili tea");	break;
	case Effect.get("Flapper Dancin'"):	useItem_1 = Item.get("flapper fly");	break;
	case Effect.get("Flexibili Tea"):	useItem_1 = Item.get("cuppa Flexibili tea");	break;
	case Effect.get("Flimsy Shield of the Pastalord"):
		useSkill_1 = Skill.get("Shield of the Pastalord");
		if (myClass() === Class.get("Pastamancer"))
		{
			buff = Effect.get("Shield of the Pastalord");
		}
		break;
	case Effect.get("Float Like a Butterfly, Smell Like a Bee"):
		if (in_bhy())
		{
			useItem_1 = Item.get("honeypot");
		}		break;
	case Effect.get("Florid Cheeks"):	useItem_1 = Item.get("henna face paint");	break;
	case Effect.get("Football Eyes"):	useItem_1 = Item.get("black facepaint");	break;
	case Effect.get("Fortunate Resolve"):	useItem_1 = Item.get("resolution: be luckier");	break;
	case Effect.get("Frenzied, Bloody"):	useSkill_1 = Skill.get("Blood Frenzy");	break;
	case Effect.get("Fresh Breath"):
		if (!toBoolean(getProperty("_aug6Cast")))
		{
			useSkill_1 = Skill.get("Aug. 6th: Fresh Breath Day!");
		}		break;
	case Effect.get("Fresh Scent"):	useItem_1 = Item.get("deodorant");	break;
	case Effect.get("Frigidalmatian"):	useSkill_1 = Skill.get("Frigidalmatian");	break;
	case Effect.get("Frog In Your Throat"):	useItem_1 = Item.get("Frogade");	break;
	case Effect.get("From Nantucket"):	useItem_1 = Item.get("Ye Olde Bawdy Limerick");	break;
	case Effect.get("Frost Tea"):	useItem_1 = Item.get("cuppa Frost tea");	break;
	case Effect.get("Frostbeard"):	useSkill_1 = Skill.get("Beardfreeze");	break;
	case Effect.get("Frosty"):	useItem_1 = Item.get("frost flower");	break;
	case Effect.get("Frown"):	useSkill_1 = Skill.get("Frown Muscles");	break;
	case Effect.get("Funky Coal Patina"):	useItem_1 = Item.get("coal dust");	break;
	case Effect.get("Gaffe Free"):	useItem_1 = Item.get("gaffer's tape");	break;
	case Effect.get("Gelded"):	useItem_1 = Item.get("chocolate filthy lucre");	break;
	case Effect.get("Ghostly Shell"):
		if (auto_have_skill(Skill.get("Ghostly Shell")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Ghostly Shell");
		}		break;
	case Effect.get("The Glistening"):	useItem_1 = Item.get("vial of The Glistening");	break;
	case Effect.get("Glittering Eyelashes"):	useItem_1 = Item.get("glittery mascara");	break;
	case Effect.get("Glowing Hands"):	useItem_1 = Item.get("emergency glowstick");	break;
	case Effect.get("Go Get 'Em, Tiger!"):	useItem_1 = Item.get("Ben-Gal&trade; Balm");	break;
	case Effect.get("Good Things Are Coming, You Can Smell It"):	useItem_1 = Item.get("Smoldering Clover&trade; candle");	break;
	case Effect.get("Got Milk"):	useItem_1 = Item.get("milk of magnesium");	break;
	case Effect.get("Gothy"):	useItem_1 = Item.get("spooky eyeliner");	break;
	case Effect.get("Gr8ness"):	useItem_1 = Item.get("potion of temporary gr8ness");	break;
	case Effect.get("Graham Crackling"):	useItem_1 = Item.get("heather graham cracker");	break;
	case Effect.get("Greasy Peasy"):	useItem_1 = Item.get("robot grease");	break;
	case Effect.get("Greedy Resolve"):	useItem_1 = Item.get("resolution: be wealthier");	break;
	case Effect.get("Green Tongue"):	useItem_1 = Item.get("green snowcone");	break;
	case Effect.get("Gristlesphere"):	useSkill_1 = Skill.get("Gristlesphere");	break;
	case Effect.get("Gritty"):	useItem_1 = Item.get("pile of gritty sand");	break;
	case Effect.get("Grumpy and Ornery"):
		if (auto_have_familiar(Familiar.get("Grim Brother")) && !toBoolean(getProperty("_grimBuff")))
		{
			if (speculative)
			{
				return true;
			}
			visitUrl("choice.php?pwd&whichchoice=835&option=3", true);
			ret = true;
		}		break;
	case Effect.get("Gummed Shoes"):	useItem_1 = Item.get("shoe gum");	break;
	case Effect.get("Gummi-Grin"):	useItem_1 = Item.get("gummi turtle");	break;
	case Effect.get("Hairy Palms"):	useItem_1 = Item.get("orcish hand lotion");	break;
	case Effect.get("Ham-Fisted"):	useItem_1 = Item.get("vial of hamethyst juice");	break;
	case Effect.get("Hamming It Up"):	useSkill_1 = Skill.get("Ham It Up");	break;
	case Effect.get("Hardened Fabric"):	useItem_1 = Item.get("fabric hardener");	break;
	case Effect.get("Hardened Sweatshirt"):	useSkill_1 = Skill.get("Magic Sweat");	break;
	case Effect.get("Hardly Poisoned at All"):	useSkill_1 = Skill.get("Disco Nap");	break;
	case Effect.get("Healthy Blue Glow"):	useItem_1 = Item.get("gold star");	break;
	case Effect.get("Hear Me Roar"):
		if (!toBoolean(getProperty("_aug10Cast")))
		{
			useSkill_1 = Skill.get("Aug. 10th: World Lion Day!");
		}		break;
	case Effect.get("Heightened Senses"):	useItem_1 = Item.get("airborne mutagen");	break;
	case Effect.get("Heart of Green"):	useItem_1 = Item.get("green candy heart");	break;
	case Effect.get("Heart of Lavender"):	useItem_1 = Item.get("lavender candy heart");	break;
	case Effect.get("Heart of Orange"):	useItem_1 = Item.get("orange candy heart");	break;
	case Effect.get("Heart of Pink"):	useItem_1 = Item.get("pink candy heart");	break;
	case Effect.get("Heart of White"):	useItem_1 = Item.get("white candy heart");	break;
	case Effect.get("Heart of Yellow"):	useItem_1 = Item.get("yellow candy heart");	break;
	case Effect.get("Hide of Sobek"):	useSkill_1 = Skill.get("Hide of Sobek");	break;
	case Effect.get("Hiding From Seekers"):	useSkill_1 = Skill.get("Hide From Seekers");	break;
	case Effect.get("High Colognic"):	useItem_1 = Item.get("musk turtle");	break;
	case Effect.get("Hippy Antimilitarism"):	useItem_1 = Item.get("mini kiwi antimilitaristic hippy petition");	break;
	case Effect.get("Hippy Stench"):	useItem_1 = Item.get("reodorant");	break;
	case Effect.get("Hot Hands"):	useItem_1 = Item.get("lotion of hotness");	break;
	case Effect.get("How to Scam Tourists"):	useItem_1 = Item.get("How to Avoid Scams");	break;
	case Effect.get("Human-Beast Hybrid"):	useItem_1 = Item.get("Gene Tonic: Beast");	break;
	case Effect.get("Human-Constellation Hybrid"):	useItem_1 = Item.get("Gene Tonic: Constellation");	break;
	case Effect.get("Human-Demon Hybrid"):	useItem_1 = Item.get("Gene Tonic: Demon");	break;
	case Effect.get("Human-Elemental Hybrid"):	useItem_1 = Item.get("Gene Tonic: Elemental");	break;
	case Effect.get("Human-Fish Hybrid"):	useItem_1 = Item.get("Gene Tonic: Fish");	break;
	case Effect.get("Human-Human Hybrid"):	useItem_1 = Item.get("Gene Tonic: Dude");	break;
	case Effect.get("Human-Humanoid Hybrid"):	useItem_1 = Item.get("Gene Tonic: Humanoid");	break;
	case Effect.get("Human-Insect Hybrid"):	useItem_1 = Item.get("Gene Tonic: Insect");	break;
	case Effect.get("Human-Machine Hybrid"):	useItem_1 = Item.get("Gene Tonic: Construct");	break;
	case Effect.get("Human-Mer-kin Hybrid"):	useItem_1 = Item.get("Gene Tonic: Mer-kin");	break;
	case Effect.get("Human-Pirate Hybrid"):	useItem_1 = Item.get("Gene Tonic: Pirate");	break;
	case Effect.get("Hyperoffended"):	useItem_1 = Item.get("donkey flipbook");	break;
	case Effect.get("Hyphemariffic"):	useItem_1 = Item.get("black eyedrops");	break;
	case Effect.get("Icy Glare"):	useSkill_1 = Skill.get("Icy Glare");	break;
	case Effect.get("Impeccable Coiffure"):	useSkill_1 = Skill.get("Self-Combing Hair");	break;
	case Effect.get("Imported Strength"):	useItem_1 = Item.get("imported taffy");	break;
	case Effect.get("Inigo's Incantation of Inspiration"):	useSkill_1 = Skill.get("Inigo's Incantation of Inspiration");	break;
	case Effect.get("Incredibly Healthy"):	useItem_1 = Item.get("mini kiwi illicit antibiotic");	break;
	case Effect.get("Incredibly Hulking"):	useItem_1 = Item.get("Ferrigno's Elixir of Power");	break;
	case Effect.get("Incredibly Well Lit"):
		if (!toBoolean(getProperty("_aug7Cast")))
		{
			useSkill_1 = Skill.get("Aug. 7th: Lighthouse Day!");
		}		break;
	case Effect.get("Industrial Strength Starch"):	useItem_1 = Item.get("industrial strength starch");	break;
	case Effect.get("Ink Cloud"):	useSkill_1 = Skill.get("Ink Gland");	break;
	case Effect.get("Inked Well"):	useSkill_1 = Skill.get("Squid Glands");	break;
	case Effect.get("Inky Camouflage"):	useItem_1 = Item.get("vial of squid ink");	break;
	case Effect.get("Inscrutable Gaze"):	useSkill_1 = Skill.get("Inscrutable Gaze");	break;
	case Effect.get("Insulated Trousers"):	useItem_1 = Item.get("cold powder");	break;
	case Effect.get("Intimidating Mien"):	useSkill_1 = Skill.get("Intimidating Mien");	break;
	case Effect.get("Invisible Avatar"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Irresistible Resolve"):	useItem_1 = Item.get("resolution: be sexier");	break;
	case Effect.get("Jackasses' Symphony of Destruction"):	useSkill_1 = Skill.get("Jackasses' Symphony of Destruction");	break;
	case Effect.get("Jalape&ntilde;o Saucesphere"):	useSkill_1 = Skill.get("Jalape&ntilde;o Saucesphere");	break;
	case Effect.get("Jingle Jangle Jingle"):
		if (auto_have_skill(Skill.get("Jingle Bells")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Jingle Bells");
		}		break;
	case Effect.get("Joyful Resolve"):	useItem_1 = Item.get("resolution: be happier");	break;
	case Effect.get("Juiced and Jacked"):	useItem_1 = Item.get("pumpkin juice");	break;
	case Effect.get("Juiced and Loose"):	useSkill_1 = Skill.get("Steroid Bladder");	break;
	case Effect.get("Leash of Linguini"):
		if (pathHasFamiliar())
		{
			auto_equipAprilShieldBuff(); //+5 turns when April Shower Thoughts Shield is equipped
			useSkill_1 = Skill.get("Leash of Linguini");
		}		break;
	case Effect.get("Leisurely Amblin'"):	useSkill_1 = Skill.get("Walk: Leisurely Amble");	break;
	case Effect.get("Lion in Ambush"):	useItem_1 = Item.get("lion musk");	break;
	case Effect.get("Liquidy Smoky"):	useItem_1 = Item.get("liquid smoke");	break;
	case Effect.get("Lit Up"):	useItem_1 = Item.get("bottle of lighter fluid");	break;
	case Effect.get("Litterbug"):	useItem_1 = Item.get("old candy wrapper");	break;
	case Effect.get("Living Fast"):	useSkill_1 = Skill.get("Live Fast");	break;
	case Effect.get("Locks Like the Raven"):	useItem_1 = Item.get("Black No. 2");	break;
	case Effect.get("Loded"):	useItem_1 = Item.get("lodestone");	break;
	case Effect.get("Lost Stomach"):
		if (!toBoolean(getProperty("_aug16Cast")))
		{
			useSkill_1 = Skill.get("Aug. 16th: Roller Coaster Day!");
		}		break;
	case Effect.get("Loyal as a Rock"):	useItem_1 = Item.get("lump of loyal latite");	break;
	case Effect.get("Loyal Tea"):	useItem_1 = Item.get("cuppa Loyal tea");	break;
	case Effect.get("Lubricating Sauce"):
		if (auto_have_skill(Skill.get("Sauce Contemplation")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Sauce Contemplation");
		}		break;
	case Effect.get("Lucky Struck"):	useItem_1 = Item.get("Lucky Strikes holo-record");	break;
	case Effect.get("Lycanthropy, Eh?"):	useItem_1 = Item.get("weremoose spit");	break;
	case Effect.get("Keep Free Hate in your Heart"):	useItem_1 = Item.get("Daily Affirmation: Keep Free Hate in your Heart");	break;
	case Effect.get("Kindly Resolve"):	useItem_1 = Item.get("resolution: be kinder");	break;
	case Effect.get("Knob Goblin Perfume"):	useItem_1 = Item.get("Knob Goblin perfume");	break;
	case Effect.get("Knowing Smile"):	useSkill_1 = Skill.get("Knowing Smile");	break;
	case Effect.get("Macaroni Coating"):	useSkill_1 = Skill.none;	break;
	case Effect.get("The Magic of LOV"):	useItem_1 = Item.get("LOV Elixir #6");	break;
	case Effect.get("The Magical Mojomuscular Melody"):	useSkill_1 = Skill.get("The Magical Mojomuscular Melody");	break;
	case Effect.get("Magnetized Ears"):	useSkill_1 = Skill.get("Magnetic Ears");	break;
	case Effect.get("Majorly Poisoned"):	useSkill_1 = Skill.get("Disco Nap");	break;
	case Effect.get("Manbait"):	useItem_1 = Item.get("the most dangerous bait");	break;
	case Effect.get("Mariachi Moisture"):
		if (auto_have_skill(Skill.get("Moxie of the Mariachi")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Moxie of the Mariachi");
		}		break;
	case Effect.get("Mariachi Mood"):	useSkill_1 = Skill.get("Moxie of the Mariachi");	break;
	case Effect.get("Marinated"):	useItem_1 = Item.get("bowl of marinade");	break;
	case Effect.get("Materiel Intel"):
		if (auto_canARBSupplyDrop())
		{
			if (speculative)
			{
				return true;
			}
			ARBSupplyDrop("materiel intel");
			ret = true;
		}		break;
	case Effect.get("Mathematically Precise"):
		if (isUnrestricted(Item.get("Crimbot ROM: Mathematical Precision")))
		{
			useSkill_1 = Skill.get("Mathematical Precision");
		}		break;
	case Effect.get("Mayeaugh"):	useItem_1 = Item.get("glob of spoiled mayo");	break;
	case Effect.get("Meat Puppet"):	useSkill_1 = Skill.get("Meat Puppet");	break;
	case Effect.get("Memories of Puppy Love"):	useItem_1 = Item.get("old love note");	break;
	case Effect.get("Merry Smithsness"):	useItem_1 = Item.get("Flaskfull of Hollow");	break;
	case Effect.get("Milk of Familiar Cruelty"):	useSkill_1 = Skill.get("Drink The Milk of %n Cruelty");	break;
	case Effect.get("Milk of Familiar Kindness"):	useSkill_1 = Skill.get("Drink The Milk of %n Kindness");	break;
	case Effect.get("Mind Vision"):	useSkill_1 = Skill.get("Intracranial Eye");	break;
	case Effect.get("Ministrations in the Dark"):	useItem_1 = Item.get("EMD holo-record");	break;
	case Effect.get("Minor Invulnerability"):	useItem_1 = Item.get("scroll of minor invulnerability");	break;
	case Effect.get("Misplaced Rage"):	useItem_1 = Item.get("angry agate");	break;
	case Effect.get("The Moxie of LOV"):	useItem_1 = Item.get("LOV Elixir #9");	break;
	case Effect.get("The Moxious Madrigal"):	useSkill_1 = Skill.get("The Moxious Madrigal");	break;
	case Effect.get("Muffled"):
		if (getProperty("peteMotorbikeMuffler") === "Extra-Quiet Muffler")
		{
			useSkill_1 = Skill.get("Rev Engine");
		}		break;
	case Effect.get("Musk of the Moose"):	useSkill_1 = Skill.get("Musk of the Moose");	break;
	case Effect.get("Musky"):	useItem_1 = Item.get("lynyrd musk");	break;
	case Effect.get("Mutated"):	useItem_1 = Item.get("gremlin mutagen");	break;
	case Effect.get("Mysteriously Handsome"):	useItem_1 = Item.get("handsomeness potion");	break;
	case Effect.get("Mystically Oiled"):	useItem_1 = Item.get("ointment of the occult");	break;
	case Effect.get("Nearly All-Natural"):	useItem_1 = Item.get("bag of grain");	break;
	case Effect.get("Nearly Silent Hunting"):	useSkill_1 = Skill.get("Silent Hunter");	break;
	case Effect.get("Neuroplastici Tea"):	useItem_1 = Item.get("cuppa Neuroplastici tea");	break;
	case Effect.get("Neutered Nostrils"):	useItem_1 = Item.get("Polysniff Perfume");	break;
	case Effect.get("Newt Gets In Your Eyes"):	useItem_1 = Item.get("eyedrops of newt");	break;
	case Effect.get("Nigh-Invincible"):	useItem_1 = Item.get("pixel star");	break;
	case Effect.get("Notably Lovely"):	useItem_1 = Item.get("confiscated love note");	break;
	case Effect.get("Obscuri Tea"):	useItem_1 = Item.get("cuppa Obscuri tea");	break;
	case Effect.get("Ode to Booze"):	shrugAT$1(Effect.get("Ode to Booze"));
												useSkill_1 = Skill.get("The Ode to Booze");												break;
	case Effect.get("The Odour of Magick"):	useItem_1 = Item.get("natural magick candle");	break;
	case Effect.get("Of Course It Looks Great"):	useSkill_1 = Skill.get("Check Hair");	break;
	case Effect.get("Oiled Skin"):	useItem_1 = Item.get("skin oil");	break;
	case Effect.get("Oiled-Up"):	useItem_1 = Item.get("pec oil");	break;
	case Effect.get("Oilsphere"):	useSkill_1 = Skill.get("Oilsphere");	break;
	case Effect.get("Offhand Remarkable"):
		if (!toBoolean(getProperty("_aug13Cast")))
		{
			useSkill_1 = Skill.get("Aug. 13th: Left/Off Hander's Day!");
		}		break;
	case Effect.get("OMG WTF"):	useItem_1 = Item.get("confiscated cell phone");	break;
	case Effect.get("One Very Clear Eye"):	useItem_1 = Item.get("cyclops eyedrops");	break;
	case Effect.get("Only Dogs Love a Drunken Sailor"):	useSkill_1 = Skill.get("Only Dogs Love a Drunken Sailor");	break;
	case Effect.get("Orange Crusher"):	useItem_1 = Item.get("pulled orange taffy");	break;
	case Effect.get("Orange Tongue"):	useItem_1 = Item.get("orange snowcone");	break;
	case Effect.get("Paging Betty"):	useItem_1 = Item.get("Bettie page");	break;
	case Effect.get("Pasta Eyeball"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Pasta Oneness"):	useSkill_1 = Skill.get("Manicotti Meditation");	break;
	case Effect.get("Patent Aggression"):	useItem_1 = Item.get("patent aggression tonic");	break;
	case Effect.get("Patent Alacrity"):	useItem_1 = Item.get("patent alacrity tonic");	break;
	case Effect.get("Patent Avarice"):	useItem_1 = Item.get("patent avarice tonic");	break;
	case Effect.get("Patent Invisibility"):	useItem_1 = Item.get("patent invisibility tonic");	break;
	case Effect.get("Patent Prevention"):	useItem_1 = Item.get("patent preventative tonic");	break;
	case Effect.get("Patent Sallowness"):	useItem_1 = Item.get("patent sallowness tonic");	break;
	case Effect.get("Patience of the Tortoise"):	useSkill_1 = Skill.get("Patience of the Tortoise");	break;
	case Effect.get("Patient Smile"):	useSkill_1 = Skill.get("Patient Smile");	break;
	case Effect.get("Paul's Passionate Pop Song"):	useSkill_1 = Skill.get("Paul's Passionate Pop Song");	break;
	case Effect.get("Penne Fedora"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Peppermint Bite"):	useItem_1 = Item.get("Crimbo peppermint bark");	break;
	case Effect.get("Peppermint Twisted"):	useItem_1 = Item.get("peppermint twist");	break;
	case Effect.get("Perceptive Pressure"):	useItem_1 = Item.get("pressurized potion of perception");	break;
	case Effect.get("Perspicacious Pressure"):	useItem_1 = Item.get("pressurized potion of perspicacity");	break;
	case Effect.get("Phorcefullness"):	useItem_1 = Item.get("philter of phorce");	break;
	case Effect.get("Physicali Tea"):	useItem_1 = Item.get("cuppa Physicali tea");	break;
	case Effect.get("Pill Power"):
		if (itemAmount(Item.get("miniature power pill")) > 0)
		{
			useItem_1 = Item.get("miniature power pill");
		}
		else {
			useItem_1 = Item.get("power pill");
		}		break;
	case Effect.get("Pill Party!"):	useItem_1 = Item.get("pill cup");	break;
	case Effect.get("Pisces in the Skyces"):	useItem_1 = Item.get("tobiko marble soda");	break;
	case Effect.get("Psalm of Pointiness"):	shrugAT$1(Effect.get("Psalm of Pointiness"));
												useSkill_1 = Skill.get("The Psalm of Pointiness");												break;
	case Effect.get("Prayer of Seshat"):	useSkill_1 = Skill.get("Prayer of Seshat");	break;
	case Effect.get("Pride of the Puffin"):	useSkill_1 = Skill.get("Pride of the Puffin");	break;
	case Effect.get("Polar Express"):	useItem_1 = Item.get("Cloaca Cola Polar");	break;
	case Effect.get("Polka of Plenty"):	useSkill_1 = Skill.get("The Polka of Plenty");	break;
	case Effect.get("Polonoia"):	useItem_1 = Item.get("polo trophy");	break;
	case Effect.get("Poppy Performance"):
		if (auto_haveIdolMicrophone())
		{
			if (speculative)
			{
				return true;
			}
			cliExecute("loathingidol pop");
			ret = true;
		}		break;
	case Effect.get("Power, Man"):	useItem_1 = Item.get("Power-Guy 2000 holo-record");	break;
	case Effect.get("Power Ballad of the Arrowsmith"):	useSkill_1 = Skill.get("The Power Ballad of the Arrowsmith");	break;
	case Effect.get("Power of Heka"):	useSkill_1 = Skill.get("Power of Heka");	break;
	case Effect.get("The Power of LOV"):	useItem_1 = Item.get("LOV Elixir #3");	break;
	case Effect.get("Prideful Strut"):	useSkill_1 = Skill.get("Walk: Prideful Strut");	break;
	case Effect.get("Predjudicetidigitation"):	useItem_1 = Item.get("worst candy");	break;
	case Effect.get("Protection from Bad Stuff"):	useItem_1 = Item.get("scroll of Protection from Bad Stuff");	break;
	case Effect.get("Provocative Perkiness"):	useItem_1 = Item.get("libation of liveliness");	break;
	case Effect.get("Puddingskin"):	useItem_1 = Item.get("scroll of Puddingskin");	break;
	case Effect.get("Pulchritudinous Pressure"):	useItem_1 = Item.get("pressurized potion of pulchritude");	break;
	case Effect.get("Punchable Face"):	useSkill_1 = Skill.get("Extremely Punchable Face");	break;
	case Effect.get("Purity of Spirit"):	useItem_1 = Item.get("cold-filtered water");	break;
	case Effect.get("Purr of the Feline"):	useSkill_1 = Skill.get("Purr of the Feline");	break;
	case Effect.get("Purple Reign"):	useItem_1 = Item.get("pulled violet taffy");	break;
	case Effect.get("Purple Tongue"):	useItem_1 = Item.get("purple snowcone");	break;
	case Effect.get("Puzzle Fury"):	useItem_1 = Item.get("37x37x37 puzzle cube");	break;
	case Effect.get("Pyrite Pride"):	useItem_1 = Item.get("pebble of proud pyrite");	break;
	case Effect.get("Pyromania"):	useSkill_1 = Skill.get("Pyromania");	break;
	case Effect.get("Queso Fustulento"):	useSkill_1 = Skill.get("Queso Fustulento");	break;
	case Effect.get("Quiet Desperation"):	useSkill_1 = Skill.get("Quiet Desperation");	break;
	case Effect.get("Quiet Determination"):	useSkill_1 = Skill.get("Quiet Determination");	break;
	case Effect.get("Quiet Judgement"):	useSkill_1 = Skill.get("Quiet Judgement");	break;
	case Effect.get("'Roids of the Rhinoceros"):	useItem_1 = Item.get("bottle of rhinoceros hormones");	break;
	case Effect.get("Rad-Pro Tected"):	useItem_1 = Item.get("Rad-Pro (1 oz.)");	break;
	case Effect.get("Radiating Black Body&trade;"):	useItem_1 = Item.get("Black Body&trade; spray");	break;
	case Effect.get("Rage of the Reindeer"):	useSkill_1 = Skill.get("Rage of the Reindeer");	break;
	case Effect.get("Rainy Soul Miasma"):
		if (itemAmount(Item.get("thin black candle")) > 0)
		{
			useItem_1 = Item.get("thin black candle");
		}
		else if (itemAmount(Item.get("Drizzlers&trade; Black Licorice")) > 0)
		{
			useItem_1 = Item.get("Drizzlers&trade; Black Licorice");
		}		break;
	case Effect.get("Ready to Snap"):	useItem_1 = Item.get("ginger snaps");	break;
	case Effect.get("Really Quite Poisoned"):	useSkill_1 = Skill.get("Disco Nap");	break;
	case Effect.get("Record Hunger"):	useItem_1 = Item.get("The Pigs holo-record");	break;
	case Effect.get("Red Lettered"):	useItem_1 = Item.get("red letter");	break;
	case Effect.get("Red Door Syndrome"):	useItem_1 = Item.get("can of black paint");	break;
	case Effect.get("Red Tongue"):	useItem_1 = Item.get("red snowcone");	break;
	case Effect.get("Reliable Backup"):	useSkill_1 = Skill.get("Call For Backup");	break;
	case Effect.get("Reptilian Fortitude"):
		if (auto_have_skill(Skill.get("Reptilian Fortitude")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Reptilian Fortitude");
		}		break;
	case Effect.get("Romantically Roused"):
		if (auto_haveIdolMicrophone())
		{
			if (speculative)
			{
				return true;
			}
			cliExecute("loathingidol ballad");
			ret = true;
		}		break;
	case Effect.get("A Rose by Any Other Material"):	useItem_1 = Item.get("squeaky toy rose");	break;
	case Effect.get("Rosewater Mark"):	useItem_1 = Item.get("old rosewater cream");	break;
	case Effect.get("Rotten Memories"):	useSkill_1 = Skill.get("Rotten Memories");	break;
	case Effect.get("Ruthlessly Efficient"):
		if (isUnrestricted(Item.get("Crimbot ROM: Ruthless Efficiency")))
		{
			useSkill_1 = Skill.get("Ruthless Efficiency");
		}		break;
	case Effect.get("Salamander In Your Stomach"):	useItem_1 = Item.get("salamander slurry");	break;
	case Effect.get("Saucemastery"):	useSkill_1 = Skill.get("Sauce Contemplation");	break;
	case Effect.get("Sauce Monocle"):	useSkill_1 = Skill.get("Sauce Monocle");	break;
	case Effect.get("Savage Beast Inside"):	useItem_1 = Item.get("jar of &quot;Creole Lady&quot; marrrmalade");	break;
	case Effect.get("Scariersauce"):
		mustEquip = Item.get("velour viscometer");
		useSkill_1 = Skill.get("Scarysauce");
		break;
	case Effect.get("Scarysauce"):	useSkill_1 = Skill.get("Scarysauce");	break;
	case Effect.get("Scavengers Scavenging"):	useSkill_1 = Skill.get("Scavenge");	break;
	case Effect.get("Scowl of the Auk"):	useSkill_1 = Skill.get("Scowl of the Auk");	break;
	case Effect.get("Scorched Earth"):	useItem_1 = Item.get("Napalm In The Morning&trade; candle");	break;
	case Effect.get("Screaming!  SCREAMING!  AAAAAAAH!"):	useSkill_1 = Skill.get("Powerful Vocal Chords");	break;
	case Effect.get("Seal Clubbing Frenzy"):	useSkill_1 = Skill.get("Seal Clubbing Frenzy");	break;
	case Effect.get("Sealed Brain"):	useItem_1 = Item.get("seal-brain elixir");	break;
	case Effect.get("Seeing Colors"):	useItem_1 = Item.get("funky dried mushroom");	break;
	case Effect.get("Sepia Tan"):	useItem_1 = Item.get("old bronzer");	break;
	case Effect.get("Serendipi Tea"):	useItem_1 = Item.get("cuppa Serendipi tea");	break;
	case Effect.get("Serendipity"):
		if (!toBoolean(getProperty("_aug18Cast")))
		{
			useSkill_1 = Skill.get("Aug. 18th: Serendipity Day!");
		}		break;
	case Effect.get("Seriously Mutated"):	useItem_1 = Item.get("extra-potent gremlin mutagen");	break;
	case Effect.get("Shadow Waters"):
		if (itemAmount(Item.get("Rufus's shadow lodestone")) > 0)
		{
			if (speculative)
			{
				return true;
			}
			// lodestone will be consumed for a free NC to get this buff
			// save and restore our location as shadow rifts have a 80% item drop penalty
			// don't want it unless actually going to a shadow rift
			const savedLoc: Location = myLocation();
			setProperty("auto_disableAdventureHandling", true.toString());
			autoAdv$2(auto_availableBrickRift());
			setProperty("auto_disableAdventureHandling", false.toString());
			setLocation(savedLoc);
			ret = true;
		}
		break;
	case Effect.get("Shells of the Damned"):	useItem_1 = Item.get("cyan seashell");	break;
	case Effect.get("Shield of the Pastalord"):
		useSkill_1 = Skill.get("Shield of the Pastalord");
		if (myClass() !== Class.get("Pastamancer"))
		{
			buff = Effect.get("Flimsy Shield of the Pastalord");
		}
		break;
	case Effect.get("Shelter of Shed"):	useSkill_1 = Skill.get("Shelter of Shed");	break;
	case Effect.get("Shifted Reality"):	useSkill_1 = Skill.get("Reality Shift");	break;
	case Effect.get("Shortly Hydrated"):	useItem_1 = Item.get("short glass of water");	break;
	case Effect.get("Shrieking Weasel"):	useItem_1 = Item.get("Shrieking Weasel holo-record");	break;
	case Effect.get("Simmering"):	useSkill_1 = Skill.get("Simmer");	break;
	case Effect.get("Simply Invisible"):	useItem_1 = Item.get("invisibility potion");	break;
	case Effect.get("Simply Irresistible"):	useItem_1 = Item.get("irresistibility potion");	break;
	case Effect.get("Simply Irritable"):	useItem_1 = Item.get("irritability potion");	break;
	case Effect.get("Singer's Faithful Ocelot"):	useSkill_1 = Skill.get("Singer's Faithful Ocelot");	break;
	case Effect.get("Sinuses For Miles"):	useItem_1 = Item.get("Mick's IcyVapoHotness Inhaler");	break;
	case Effect.get("Sleaze-Resistant Trousers"):	useItem_1 = Item.get("sleaze powder");	break;
	case Effect.get("Sleazy Hands"):	useItem_1 = Item.get("lotion of sleaziness");	break;
	case Effect.get("Slightly Larger Than Usual"):	useItem_1 = Item.get("giant giant moth dust");	break;
	case Effect.get("Slinking Noodle Glob"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Slippery as a Seal"):
		if (auto_have_skill(Skill.get("Seal Clubbing Frenzy")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Seal Clubbing Frenzy");
		}		break;
	case Effect.get("Slippery Oiliness"):	useItem_1 = Item.get("oil of slipperiness");	break;
	case Effect.get("Smelly Pants"):	useItem_1 = Item.get("stench powder");	break;
	case Effect.get("Smooth Movements"):	useSkill_1 = Skill.get("Smooth Movement");	break;
	case Effect.get("Snarl of the Timberwolf"):	useSkill_1 = Skill.get("Snarl of the Timberwolf");	break;
	case Effect.get("Snarl of Three Timberwolves"):
		mustEquip = Item.get("velour voulge");
		useSkill_1 = Skill.get("Snarl of the Timberwolf");
		break;
	case Effect.get("Snow Shoes"):	useItem_1 = Item.get("snow cleats");	break;
	case Effect.get("So You Can Work More..."):	useItem_1 = Item.get("baggie of powdered sugar");	break;
	case Effect.get("Soles of Glass"):
		if (auto_have_familiar(Familiar.get("Grim Brother")) && !toBoolean(getProperty("_grimBuff")))
		{
			if (speculative)
			{
				return true;
			}
			visitUrl("choice.php?pwd&whichchoice=835&option=1", true);
			ret = true;
		}		break;
	case Effect.get("Somewhat Poisoned"):	useSkill_1 = Skill.get("Disco Nap");	break;
	case Effect.get("Song of Accompaniment"):	useSkill_1 = Skill.get("Song of Accompaniment");	break;
	case Effect.get("Song of Battle"):	useSkill_1 = Skill.get("Song of Battle");	break;
	case Effect.get("Song of Bravado"):	useSkill_1 = Skill.get("Song of Bravado");	break;
	case Effect.get("Song of Cockiness"):	useSkill_1 = Skill.get("Song of Cockiness");	break;
	case Effect.get("Song of Fortune"):	useSkill_1 = Skill.get("Song of Fortune");	break;
	case Effect.get("Song of the Glorious Lunch"):	useSkill_1 = Skill.get("Song of the Glorious Lunch");	break;
	case Effect.get("Song of the North"):	useSkill_1 = Skill.get("Song of the North");	break;
	case Effect.get("Song of Sauce"):	useSkill_1 = Skill.get("Song of Sauce");	break;
	case Effect.get("Song of Slowness"):	useSkill_1 = Skill.get("Song of Slowness");	break;
	case Effect.get("Song of Solitude"):	useSkill_1 = Skill.get("Song of Solitude");	break;
	case Effect.get("Song of Starch"):	useSkill_1 = Skill.get("Song of Starch");	break;
	case Effect.get("The Sonata of Sneakiness"):	useSkill_1 = Skill.get("The Sonata of Sneakiness");	break;
	case Effect.get("Soothing Flute"):	useSkill_1 = Skill.get("Soothing Flute");	break;
	case Effect.get("Soulerskates"):	useSkill_1 = Skill.get("Soul Rotation");	break;
	case Effect.get("Sour Softshoe"):	useItem_1 = Item.get("pulled yellow taffy");	break;
	case Effect.get("Spectral Awareness"):	useSkill_1 = Skill.get("Spectral Awareness");	break;
	case Effect.get("Spice Haze"):	useSkill_1 = Skill.get("Bind Spice Ghost");	break;
	case Effect.get("Spiky Hair"):	useItem_1 = Item.get("super-spiky hair gel");	break;
	case Effect.get("Spiky Shell"):
		if (auto_have_skill(Skill.get("Spiky Shell")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Spiky Shell");
		}		break;
	case Effect.get("Spirit of the Mountains"):
		if (!toBoolean(getProperty("_aug1Cast")))
		{
			useSkill_1 = Skill.get("Aug. 1st: Mountain Climbing Day!");
		}		break;
	case Effect.get("Spiritually Awake"):	useItem_1 = Item.get("holy spring water");	break;
	case Effect.get("Spiritually Aware"):	useItem_1 = Item.get("spirit beer");	break;
	case Effect.get("Spiritually Awash"):	useItem_1 = Item.get("sacramental wine");	break;
	case Effect.get("Spiro Gyro"):	useItem_1 = Item.get("programmable turtle");	break;
	case Effect.get("Spitting Rhymes"):
		if (auto_haveIdolMicrophone())
		{
			if (speculative)
			{
				return true;
			}
			cliExecute("loathingidol rhyme");
			ret = true;
		}		break;
	case Effect.get("Spooky Hands"):	useItem_1 = Item.get("lotion of spookiness");	break;
	case Effect.get("Spooky Weapon"):	useItem_1 = Item.get("spooky nuggets");	break;
	case Effect.get("Spookypants"):	useItem_1 = Item.get("spooky powder");	break;
	case Effect.get("Springy Fusilli"):	useSkill_1 = Skill.get("Springy Fusilli");	break;
	case Effect.get("Squatting and Thrusting"):	useItem_1 = Item.get("Squat-Thrust Magazine");	break;
	case Effect.get("Stabilizing Oiliness"):	useItem_1 = Item.get("oil of stability");	break;
	case Effect.get("Standard Issue Bravery"):	useItem_1 = Item.get("CSA bravery badge");	break;
	case Effect.get("Steak Skirt"):	useSkill_1 = Skill.get("Steak Skirt");	break;
	case Effect.get("Steely-Eyed Squint"):	useSkill_1 = Skill.get("Steely-Eyed Squint");	break;
	case Effect.get("Steroid Boost"):	useItem_1 = Item.get("Knob Goblin steroids");	break;
	case Effect.get("Stewing"):	useSkill_1 = Skill.get("Stew");	break;
	case Effect.get("Stevedave's Shanty of Superiority"):	useSkill_1 = Skill.get("Stevedave's Shanty of Superiority");	break;
	case Effect.get("Stickler for Promptness"):	useItem_1 = Item.get("potion of punctual companionship");	break;
	case Effect.get("Stinky Hands"):	useItem_1 = Item.get("lotion of stench");	break;
	case Effect.get("Stinky Weapon"):	useItem_1 = Item.get("stench nuggets");	break;
	case Effect.get("Stone-Faced"):	useItem_1 = Item.get("stone wool");	break;
	case Effect.get("Strength of the Tortoise"):
		if (auto_have_skill(Skill.get("Patience of the Tortoise")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Patience of the Tortoise");
		}		break;
	case Effect.get("Stretched"):	useSkill_1 = Skill.get("Stretch");	break;
	case Effect.get("Strong Grip"):	useItem_1 = Item.get("finger exerciser");	break;
	case Effect.get("Strong Resolve"):	useItem_1 = Item.get("resolution: be stronger");	break;
	case Effect.get("Sugar Rush"):
		for (const it of Item.get(["Crimbo fudge", "Crimbo peppermint bark", "Crimbo candied pecan", "breath mint", "Tasty Fun Good rice candy", "that gum you like", "Angry Farmer candy"]))
		{
			if (itemAmount(it) > 0)
			{
				useItem_1 = it;
			}
		}		break;
	case Effect.get("Superdrifting"):	useItem_1 = Item.get("Superdrifter holo-record");	break;
	case Effect.get("Superheroic"):	useItem_1 = Item.get("confiscated comic book");	break;
	case Effect.get("Superhuman Sarcasm"):	useItem_1 = Item.get("serum of sarcasm");	break;
	case Effect.get("Suspicious Gaze"):	useSkill_1 = Skill.get("Suspicious Gaze");	break;
	case Effect.get("Sweat Equity"):
	if (auto_haveBCZ())
		{
			mustEquip = auto_getItemToEquipBCZ();
			useSkill_1 = Skill.get("BCZ: Sweat Equity");
		}		break;
	case Effect.get("Sweet Heart"):	useItem_1 = Item.get("love song of sugary cuteness");	break;
	case Effect.get("Sweet, Nuts"):	useItem_1 = Item.get("Crimbo candied pecan");	break;
	case Effect.get("Sweetbreads Flamb&eacute;"):	useItem_1 = Item.get("Greek fire");	break;
	case Effect.get("Takin' It Greasy"):	useSkill_1 = Skill.get("Grease Up");	break;
	case Effect.get("Tapased Out"):	useItem_1 = Item.get("spinal tapas");	break;
	case Effect.get("Taped Up"):	useSkill_1 = Skill.get("Tape Up");	break;
	case Effect.get("Taunt of Horus"):	useItem_1 = Item.get("talisman of Horus");	break;
	case Effect.get("Temporarily Filtered"):	useItem_1 = Item.get("single-use dust mask");	break;
	case Effect.get("Temporary Lycanthropy"):	useItem_1 = Item.get("blood of the Wereseal");	break;
	case Effect.get("Tenacity of the Snapper"):
		if (auto_have_skill(Skill.get("Tenacity of the Snapper")) && acquireTotem())
		{
			useSkill_1 = Skill.get("Tenacity of the Snapper");
		}		break;
	case Effect.get("Tenderized"):	useSkill_1 = Skill.get("Self-Tenderize");	break;
	case Effect.get("The Grass...  Is Blue..."):	useItem_1 = Item.get("blue grass");	break;
	case Effect.get("There Is A Spoon"):	useItem_1 = Item.get("dented spoon");	break;
	case Effect.get("They've Got Fleas"):	useItem_1 = Item.get("out-of-work circus flea");	break;
	case Effect.get("This Is Where You're a Viking"):	useItem_1 = Item.get("VYKEA woadpaint");	break;
	case Effect.get("Thoughtful Empathy"):
		if (auto_have_skill(Skill.get("Empathy of the Newt")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Empathy of the Newt");
		}		break;
	case Effect.get("Throwing Some Shade"):	useItem_1 = Item.get("shady shades");	break;
	case Effect.get("Ticking Clock"):	useItem_1 = Item.get("cheap wind-up clock");	break;
	case Effect.get("Tingling Insides"):	useItem_1 = Item.get("electric mushroom");	break;
	case Effect.get("Tingly Tongue"):	useItem_1 = Item.get("spare battery");	break;
	case Effect.get("Toad In The Hole"):	useItem_1 = Item.get("anti-anti-antidote");	break;
	case Effect.get("Tomato Power"):	useItem_1 = Item.get("tomato juice of powerful power");	break;
	case Effect.get("Too Shamed"):	useItem_1 = Item.get("shim of shame shale");	break;
	case Effect.get("Tortious"):	useItem_1 = Item.get("mocking turtle");	break;
	case Effect.get("Tricky Timpani"):	useSkill_1 = Skill.get("Tricky Timpani");	break;
	case Effect.get("Triple-Sized"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Truly Gritty"):	useItem_1 = Item.get("true grit");	break;
	case Effect.get("Tubes of Universal Meat"):
		if (auto_have_skill(Skill.get("Manicotti Meditation")))
		{
			mustEquip = Item.get("April Shower Thoughts shield");
			useSkill_1 = Skill.get("Manicotti Meditation");
		}		break;
	case Effect.get("Twangy"):
		if (auto_haveIdolMicrophone())
		{
			if (speculative)
			{
				return true;
			}
			cliExecute("loathingidol country");
			ret = true;
		}		break;
	case Effect.get("Twen Tea"):	useItem_1 = Item.get("cuppa Twen tea");	break;
	case Effect.get("Twinkly Weapon"):	useItem_1 = Item.get("twinkly nuggets");	break;
	case Effect.get("Ultra-Soft Steps"):	useItem_1 = Item.get("ultra-soft ferns");	break;
	case Effect.get("Ultraheart"):	useSkill_1 = Skill.get("Heartstone: %buff");	break;
	case Effect.get("Unmuffled"):
		if (getProperty("peteMotorbikeMuffler") === "Extra-Loud Muffler")
		{
			useSkill_1 = Skill.get("Rev Engine");
		}		break;
	case Effect.get("Unrunnable Face"):	useItem_1 = Item.get("runproof mascara");	break;
	case Effect.get("Unusual Perspective"):	useItem_1 = Item.get("unusual oil");	break;
	case Effect.get("Up To 11"):
		if (auto_haveBCZ())
		{
			mustEquip = auto_getItemToEquipBCZ();
			useSkill_1 = Skill.get("BCZ: Dial it up to 11");
		}		break;
	case Effect.get("Ur-Kel's Aria of Annoyance"):	useSkill_1 = Skill.get("Ur-Kel's Aria of Annoyance");	break;
	case Effect.get("Using Protection"):	useItem_1 = Item.get("orcish rubber");	break;
	case Effect.get("Visions of the Deep Dark Deeps"):	useSkill_1 = Skill.get("Deep Dark Visions");	break;
	case Effect.get("Vital"):	useItem_1 = Item.get("Doc Galaktik's Vitality Serum");	break;
	case Effect.get("Vitali Tea"):	useItem_1 = Item.get("cuppa Vitali tea");	break;
	case Effect.get("Walberg's Dim Bulb"):	useSkill_1 = Skill.get("Walberg's Dim Bulb");	break;
	case Effect.get("Waking the Dead"):
		if (auto_have_skill(Skill.get("Summon Horde")))
		{
			useSkill_1 = Skill.get("Summon Minion");
		}		break;
	case Effect.get("WAKKA WAKKA WAKKA"):	useItem_1 = Item.get("yellow pixel potion");	break;
	case Effect.get("Warm Shoulders"):	useItem_1 = Item.get("shoulder-warming lotion");	break;
	case Effect.get("Wasabi With You"):	useItem_1 = Item.get("wasabi marble soda");	break;
	case Effect.get("Well-Oiled"):	useItem_1 = Item.get("Oil of Parrrlay");	break;
	case Effect.get("Well-Swabbed Ear"):	useItem_1 = Item.get("Swabbie&trade; swab");	break;
	case Effect.get("Wet and Greedy"):	useItem_1 = Item.get("goblin water");	break;
	case Effect.get("Whispering Strands"):	useSkill_1 = Skill.none;	break;
	case Effect.get("Who's Going to Pay This Drunken Sailor?"):	useSkill_1 = Skill.get("Who's Going to Pay This Drunken Sailor?");	break;
	case Effect.get("Wildsun Boon"):
		if (auto_canARBSupplyDrop())
		{
			if (speculative)
			{
				return true;
			}
			ARBSupplyDrop("wsb");
			ret = true;
		}		break;
	case Effect.get("Wisdom of Others"):	useItem_1 = Item.get("filled mosquito");	break;
	case Effect.get("Wisdom of the Autumn Years"):	useItem_1 = Item.get("autumn years wisdom");	break;
	case Effect.get("Wisdom of Thoth"):	useSkill_1 = Skill.get("Wisdom of Thoth");	break;
	case Effect.get("Wit Tea"):	useItem_1 = Item.get("cuppa Wit tea");	break;
	case Effect.get("Wizard Squint"):	useSkill_1 = Skill.get("Wizard Squint");	break;
	case Effect.get("Woad Warrior"):	useItem_1 = Item.get("pygmy pygment");	break;
	case Effect.get("Worth Your Salt"):	useItem_1 = Item.get("salt wages");	break;
	case Effect.get("Wry Smile"):	useSkill_1 = Skill.get("Wry Smile");	break;
	case Effect.get("Yoloswagyoloswag"):	useItem_1 = Item.get("Yolo&trade; chocolates");	break;
	case Effect.get("You Read The Manual"):	useItem_1 = Item.get("O'RLY manual");	break;
	case Effect.get("Your Fifteen Minutes"):	useSkill_1 = Skill.get("Fifteen Minutes of Flame");	break;
	case Effect.get("Zomg WTF"):	useSkill_1 = Skill.get("Ag-grave-ation");	break;
	default:	abort(`Effect (${buff}) is not known to us. Beep.`);	break;
	}

	if (myClass() !== Class.get("Pastamancer"))
	{
		switch (buff)
		{
		case Effect.get("Bloody Potato Bits"):		useSkill_1 = Skill.get("Bind Vampieroghi");		break;
		case Effect.get("Macaroni Coating"):		useSkill_1 = Skill.get("Bind Undead Elbow Macaroni");		break;
		case Effect.get("Pasta Eyeball"):		useSkill_1 = Skill.get("Bind Lasagmbie");		break;
		case Effect.get("Penne Fedora"):		useSkill_1 = Skill.get("Bind Penne Dreadful");		break;
		case Effect.get("Slinking Noodle Glob"):		useSkill_1 = Skill.get("Bind Vermincelli");		break;
		case Effect.get("Spice Haze"):		useSkill_1 = Skill.get("Bind Spice Ghost");		break;
		case Effect.get("Whispering Strands"):		useSkill_1 = Skill.get("Bind Angel Hair Wisp");		break;
		}
	}

	if (myClass() === Class.get("Turtle Tamer"))
	{
		switch (buff)
		{
		case Effect.get("Boon of the War Snapper"):
			useSkill_1 = Skill.get("Spirit Boon");
			if (haveEffect(Effect.get("Glorious Blessing of the War Snapper")) === 0 && haveEffect(Effect.get("Grand Blessing of the War Snapper")) === 0 && haveEffect(Effect.get("Blessing of the War Snapper")) === 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Boon of She-Who-Was"):
			useSkill_1 = Skill.get("Spirit Boon");
			if (haveEffect(Effect.get("Glorious Blessing of She-Who-Was")) === 0 && haveEffect(Effect.get("Grand Blessing of She-Who-Was")) === 0 && haveEffect(Effect.get("Blessing of She-Who-Was")) === 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Boon of the Storm Tortoise"):
			useSkill_1 = Skill.get("Spirit Boon");
			if (haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) === 0 && haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) === 0 && haveEffect(Effect.get("Blessing of the Storm Tortoise")) === 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Disdain of the War Snapper"):
			useSkill_1 = Skill.none;
			if (haveEffect(Effect.get("Glorious Blessing of the War Snapper")) === 0 && haveEffect(Effect.get("Grand Blessing of the War Snapper")) === 0 && haveEffect(Effect.get("Blessing of the War Snapper")) === 0)
			{
				useSkill_1 = Skill.get("Blessing of the War Snapper");
			}
			if (haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) !== 0 || haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) !== 0 || haveEffect(Effect.get("Blessing of the Storm Tortoise")) !== 0)
			{
				useSkill_1 = Skill.none;
			}
			if (haveEffect(Effect.get("Glorious Blessing of She-Who-Was")) !== 0 || haveEffect(Effect.get("Grand Blessing of She-Who-Was")) !== 0 || haveEffect(Effect.get("Blessing of She-Who-Was")) !== 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Disdain of She-Who-Was"):
			useSkill_1 = Skill.none;
			if (haveEffect(Effect.get("Glorious Blessing of She-Who-Was")) === 0 && haveEffect(Effect.get("Grand Blessing of She-Who-Was")) === 0 && haveEffect(Effect.get("Blessing of She-Who-Was")) === 0)
			{
				useSkill_1 = Skill.get("Blessing of She-Who-Was");
			}
			if (haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) !== 0 || haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) !== 0 || haveEffect(Effect.get("Blessing of the Storm Tortoise")) !== 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Disdain of the Storm Tortoise"):
			useSkill_1 = Skill.none;
			if (haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) === 0 && haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) === 0 && haveEffect(Effect.get("Blessing of the Storm Tortoise")) === 0)
			{
				useSkill_1 = Skill.get("Blessing of the Storm Tortoise");
			}
			break;
		}
	}
	else {
		switch (buff)
		{
		case Effect.get("Disdain of She-Who-Was"):
			useSkill_1 = Skill.get("Blessing of She-Who-Was");
			if (haveEffect(Effect.get("Disdain of the War Snapper")) > 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Disdain of the Storm Tortoise"):
			useSkill_1 = Skill.get("Blessing of the Storm Tortoise");
			if (haveEffect(Effect.get("Disdain of She-Who-Was")) > 0 || haveEffect(Effect.get("Disdain of the War Snapper")) > 0)
			{
				useSkill_1 = Skill.none;
			}
			break;
		case Effect.get("Disdain of the War Snapper"):
			useSkill_1 = Skill.get("Blessing of the War Snapper");
			break;
		}
	}

	if (buff === Effect.get("Triple-Sized"))
	{
		if (speculative)
		{
			return auto_powerfulGloveCharges() >= 5;
		}
		else {
			return auto_powerfulGloveStats();
		}
	}

	if (buff === Effect.get("Invisible Avatar"))
	{
		if (speculative)
		{
			return auto_powerfulGloveCharges() >= 5;
		}
		else {
			return auto_powerfulGloveNoncombat();
		}
	}

	if (Effect.get(["Feeling Lonely", "Feeling Excited", "Feeling Nervous", "Feeling Peaceful"]).includes(buff) && auto_haveEmotionChipSkills())
	{
		const feeling: Skill = toSkill(buff);
		//speculate to see if buff will be cast. Return false if it will not be
		if (buffMaintain(feeling, buff, mustEquip, mp_min, casts, turns, true))
		{
			if (speculative)
			{
				return feeling.timescast < feeling.dailylimit;
			}
			else if (feeling.timescast < feeling.dailylimit)
			{
				useSkill_1 = toSkill(buff);
				handleTracker(useSkill_1.toString(), "auto_otherstuff");
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	const falloutEffects: Effect[] = Effect.get(["Drunk and Avuncular", "Lucky Struck", "Ministrations in the Dark", "Power, Man", "Record Hunger", "Shrieking Weasel", "Superdrifting"]);
	if (falloutEffects.includes(buff))
	{
		if (!possessEquipment(Item.get("Wrist-Boy")))
		{
			return false;
		}
		if (Effect.get(["Drunk and Avuncular", "Record Hunger"]).includes(buff))
		{
			if (inAftercore())
			{
				return false;
			}
			if (haveEffect(buff) >= 3)
			{
				return false;
			}
		}
		for (const ef of falloutEffects)
		{
			if (haveEffect(ef) > 0 && ef !== buff)
			{
				uneffect(ef);
			}
		}
	}

	if (useItem_1 !== Item.none)
	{
		return buffMaintain$1(useItem_1, buff, casts, turns, speculative);
	}
	if (useSkill_1 !== Skill.none)
	{
		return buffMaintain(useSkill_1, buff, mustEquip, mp_min, casts, turns, speculative);
	}
	return ret;
}

export function buffMaintain$3(buff: Effect, mp_min: number, casts: number, turns: number): boolean
{
	return buffMaintain$2(buff, mp_min, casts, turns, false);
}

export function buffMaintain$4(buff: Effect): boolean
{
	return buffMaintain$3(buff, 0, 1, 1);
}
// Checks to see if we are already wearing a facial expression before using buffMaintain
//	if an expression is REQUIRED force it using buffMaintain
export function auto_faceCheck(face: Effect): boolean
{
	const FacialExpressions: Effect[] = Effect.get(["Snarl of the Timberwolf", "Scowl of the Auk", "Stiff Upper Lip", "Patient Smile", "Quiet Determination", "Arched Eyebrow of the Archmage", "Wizard Squint", "Quiet Judgement", "Icy Glare", "Wry Smile", "Disco Leer", "Disco Smirk", "Suspicious Gaze", "Knowing Smile", "Quiet Desperation", "Inscrutable Gaze"]);
	let CanEmote: boolean = true;

	for (const FExp of FacialExpressions)
	{
		if (haveEffect(FExp) > 0)
		{
			CanEmote = false;
		}
	}

	if (CanEmote)
	{
		buffMaintain$4(face);
	}
	else {
		auto_log_debug$1(`Can not get ${face} expression as we are already emoting.`);
		return false;
	}

	return true;
}