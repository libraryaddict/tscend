import { Class, Coinmaster, Effect, Familiar, Item, Location, Monster, Skill, Slot, Stat, abort, availablePocket, buy, cliExecute, cliExecuteOutput, containsText, equip, equippedAmount, equippedItem, getCampground, getProperty, haveEffect, haveEquipped, haveSkill, itemAmount, max, min, monsterPockets, myClass, myHash, myLevel, myLocation, myPrimestat, numericModifier, pickPocket, pickedPockets, pocketMonster, runChoice, setProperty, splitString, squareRoot, toBoolean, toEffect, toInt, toItem, toMonster, toStat, use, useSkill, visitUrl, wait } from "kolmafia";
import { autoAdv$2, autoAdvBypass } from "../auto_adventure";
import { addToMaximize, autoEquip, getMaximizeSlotPref, possessEquipment } from "../auto_equipment";
import { canChangeToFamiliar } from "../auto_familiar";
import { auto_have_skill, auto_is_valid, auto_is_valid$1, auto_is_valid$2, auto_log_error, auto_log_info, auto_log_info$1, auto_log_warning, currentPoolSkill, handleTracker, handleTracker$1, internalQuestStatus, poolSkillPracticeGains, wrap_item, zoneRank$1 } from "../auto_util";
import { in_plumber, plumber_nothingToBuy } from "../paths/path_of_the_plumber";
import { AshMatcher } from "../utils/kolmafiaUtils";

// This is meant for items that have a date of 2020

//Defined in autoscend/iotms/mr2020.ash
function auto_haveBirdADayCalendar(): boolean {
	return itemAmount(Item.get("Bird-a-Day calendar")) > 0 && auto_is_valid(Item.get("Bird-a-Day calendar"));
}

export function auto_birdOfTheDay(): boolean {
	if (auto_haveBirdADayCalendar() && getProperty("_birdOfTheDay") === "") {
		auto_log_info$1("What a beautiful morning! What's today's bird?");
		return use(1, Item.get("Bird-a-Day calendar"));
	}
	return false;
}

function auto_birdIsValid(): boolean
{
	// can't seek a bird if you can't use or don't own the calendar
	if (!auto_haveBirdADayCalendar()) {
		return false;
	}
	// don't want to overwrite favorite bird automatically
	// however, if they already overwrote favorite bird manually today
	// and we somehow have enough mp to continue casting
	// it might as well be an option
	// hence == 0 and not <= 0
	if (auto_birdsLeftToday() === 0)
	{
		return false;
	}

	if (!toBoolean(getProperty("_canSeekBirds")))
	{
		use(1, Item.get("Bird-a-Day calendar"));
	}

	return true;
}

export function auto_birdModifier(mod: string): number
{
	if (!auto_birdIsValid())
	{
		return 0;
	}

	return numericModifier(Effect.get("Blessing of the Bird"), mod);
}

export function auto_favoriteBirdModifier(mod: string): number
{
	return numericModifier(Effect.get("Blessing of your favorite Bird"), mod);
}

function auto_birdsSought(): number
{
	return toInt(getProperty("_birdsSoughtToday"));
}

function auto_birdsLeftToday(): number
{
	return 6 - auto_birdsSought();
}

export function auto_birdCanSeek(): boolean
{
	if (!auto_birdIsValid())
	{
		return false;
	}

	return auto_have_skill(Skill.get("Seek out a Bird"));
}

export function auto_favoriteBirdCanSeek(): boolean
{
	// can't seek out your favorite if you already did today
	if (toBoolean(getProperty("_favoriteBirdVisited")))
	{
		return false;
	}

	return auto_have_skill(Skill.get("Visit your Favorite Bird"));
}

export function auto_hasPowerfulGlove(): boolean
{
	return possessEquipment(Item.get("Powerful Glove")) && auto_is_valid(Item.get("mint-in-box Powerful Glove"));
}

export function auto_powerfulGloveCharges(): number
{
	if (!auto_hasPowerfulGlove()) { return 0; }
	return 100 - toInt(getProperty("_powerfulGloveBatteryPowerUsed"));
}

function auto_powerfulGloveNoncombatSkill(sk: Skill): boolean
{
	if (!auto_hasPowerfulGlove() || !auto_is_valid$2(sk)) { return false; }

	if (auto_powerfulGloveCharges() < 5) { return false; }

	let old: Item = Item.none;
	if (!haveEquipped(Item.get("Powerful Glove")))
	{
		old = equippedItem(Slot.get("acc3"));
		equip(Slot.get("acc3"), Item.get("Powerful Glove"));
	}

	const ret: boolean = useSkill(1, sk);

	if (old !== Item.none)
	{
		equip(Slot.get("acc3"), old);
	}

	if (ret)
	{
		handleTracker(sk.toString(), "auto_powerfulglove");
	}
	else {
		// if we fail to cast a skill, odds are something has gone wrong with
		// mafia's tracking. Let's check to make sure, then make sure we stop
		// attempting to use more cheats in vain if so.
		const page: string = visitUrl("desc_item.php?whichitem=991142661");
		if (containsText(page, "The Glove's battery is fully depleted."))
		{
			auto_log_error("Mafia's Powerful Glove battery tracking was wrong, correcting.");
			setProperty("_powerfulGloveBatteryPowerUsed", (100).toString());
		}
	}

	return ret;
}
// Returns if replaces are available, optionally only if the Powerful Glove is equipped
export function auto_powerfulGloveReplacesAvailable(inCombat: boolean): number
{
	if (!auto_hasPowerfulGlove()) { return 0; }

	if (inCombat && !haveEquipped(Item.get("Powerful Glove"))) { return 0; }

	return toInt((auto_powerfulGloveCharges() / 10));
}
// Returns if replaces are available if the Powerful Glove was equipped
function auto_powerfulGloveReplacesAvailable$1(): number
{
	return auto_powerfulGloveReplacesAvailable(false);
}

export function auto_powerfulGloveNoncombat(): boolean
{
	if (0 < haveEffect(Effect.get("Invisible Avatar"))) { return false; }

	return auto_powerfulGloveNoncombatSkill(Skill.get("CHEAT CODE: Invisible Avatar"));
}

export function auto_powerfulGloveStats(): boolean
{
	return auto_powerfulGloveNoncombatSkill(Skill.get("CHEAT CODE: Triple Size"));
}

function auto_wantToEquipPowerfulGlove(): boolean
{
	if (!auto_hasPowerfulGlove()) { return false; }

	if (in_plumber() && !plumber_nothingToBuy()) { return true; }

	return false;
}

function auto_willEquipPowerfulGlove(): boolean
{
	for (const s of Slot.get(["acc1", "acc2", "acc3"]))
	{
		const pref: string = getMaximizeSlotPref(s);
		const toEquip: string = getProperty(pref);
		if (toEquip === Item.get("Powerful Glove").toString())
		{
			return true;
		}
	}

	return false;
}

export function auto_forceEquipPowerfulGlove(): boolean
{
	if (!auto_hasPowerfulGlove()) { return false; }

	if (auto_willEquipPowerfulGlove())
	{
		return true;
	}

	return autoEquip(Slot.get("acc3"), Item.get("Powerful Glove"));
}

export function auto_burnPowerfulGloveCharges(): void
{
	while (auto_is_valid$2(Skill.get("CHEAT CODE: Triple Size")) && auto_hasPowerfulGlove() && auto_powerfulGloveCharges() >= 5)
	{
		if (equippedAmount(Item.get("Powerful Glove")) === 0)
		{
			equip(Item.get("Powerful Glove")); //equip it to prevent use command from doing 20 cycles of equip, use skill, unequip.
		}
		auto_powerfulGloveStats();
	}
}

export function auto_canFightPiranhaPlant(): boolean
{
	const numMushroomFights: number = (in_plumber() ? 5 : 1);
	if (auto_is_valid(Item.get("packet of mushroom spores")) && (Item.get("packet of mushroom spores").toString()) in getCampground() && toInt(getProperty("_mushroomGardenFights")) < numMushroomFights)
	{
		return true;
	}
	return false;
}

export function auto_canTendMushroomGarden(): boolean
{
	if (auto_is_valid(Item.get("packet of mushroom spores")) && (Item.get("packet of mushroom spores").toString()) in getCampground() && !toBoolean(getProperty("_mushroomGardenVisited")))
	{
		return true;
	}
	return false;
}

export function auto_piranhaPlantFightsRemaining(): number
{
	if (auto_canFightPiranhaPlant())
	{
		const numMushroomFights: number = (in_plumber() ? 5 : 1);
		return numMushroomFights - toInt(getProperty("_mushroomGardenFights"));
	}
	return 0;
}

export function auto_mushroomGardenHandler(): boolean
{
	if (auto_piranhaPlantFightsRemaining() > 0)
	{
		return autoAdv$2(Location.get("Your Mushroom Garden"));
	}
	else if (auto_canTendMushroomGarden())
	{
		autoAdv$2(Location.get("Your Mushroom Garden"));
		// TODO: Malibu Stacey - move all this to a more central location after refactor
		use(itemAmount(Item.get("colossal free-range mushroom")), Item.get("colossal free-range mushroom"));
		use(itemAmount(Item.get("immense free-range mushroom")), Item.get("immense free-range mushroom"));
		use(itemAmount(Item.get("giant free-range mushroom")), Item.get("giant free-range mushroom"));
		use(itemAmount(Item.get("bulky free-range mushroom")), Item.get("bulky free-range mushroom"));
		use(itemAmount(Item.get("plump free-range mushroom")), Item.get("plump free-range mushroom"));
		use(itemAmount(Item.get("free-range mushroom")), Item.get("free-range mushroom"));
		return true;
	}
	return false;
}

export function mushroomGardenChoiceHandler(choice: number): void
{
	if (choice === 1410)
	{
		const growth: string = getProperty("auto_mushroomGardenGrowth");
		let pick: number = 1;
		if (growth !== "")
		{
			// limit to growth of 11 for colossal free-range mushroom as any further growth is wasted.
			pick = min(toInt(growth), 11);
		}
		if (toInt(getProperty("mushroomGardenCropLevel")) >= pick)
		{
			runChoice(2); // pick the mushroom.
		}
		else {
			runChoice(1); // fertilise the mushroom
		}
	}
	else {
		abort("unhandled choice in mushroomGardenChoiceHandler");
	}
}

export function auto_getGuzzlrCocktailSet(): boolean
{
	if (possessEquipment(Item.get("Guzzlr tablet")) && auto_is_valid(Item.get("Guzzlr tablet")) && !toBoolean(getProperty("auto_skipGuzzlrCocktailSet")))
	{
		if (toInt(getProperty("guzzlrGoldDeliveries")) >= 5 && getProperty("questGuzzlr") === "unstarted" && toInt(getProperty("_guzzlrPlatinumDeliveries")) === 0 && !toBoolean(getProperty("_guzzlrQuestAbandoned")))
		{
			auto_log_info$1("Getting a Guzzlr Cocktail Set (for all the good it will do).");
			visitUrl("inventory.php?tap=guzzlr", false);
			runChoice(4); // take platinum quest
			wait(1); // mafia's tracking breaks occasionally if you go too fast.
			visitUrl("inventory.php?tap=guzzlr", false);
			runChoice(1); // abandon
			runChoice(5); // leave the choice.
			return true; // ponder on what else you could've spent the Mr. Accessory on instead.
		}
	}
	return false;
}

export function auto_canCamelSpit(): boolean
{
	return canChangeToFamiliar(Familiar.get("Melodramedary")) && toInt(getProperty("camelSpit")) === 100;
}

function auto_latheHardwood(toLathe: Item): boolean
{
	// can't lathe if lathe is out of standard (or otherwise unusable)
	if (!auto_is_valid(Item.get("SpinMaster&trade; lathe")))
		{ return false; }
	// can't lathe... without a lathe
	if (itemAmount(Item.get("SpinMaster&trade; lathe")) < 1)
		{ return false; }
	// if breakfast hasn't run and you haven't grabbed it manually, we won't
	// see the scrap if we don't go grab it ourself. So do that, if needed.
	if (!toBoolean(getProperty("_spinmasterLatheVisited")))
		{ visitUrl("shop.php?whichshop=lathe"); }
	// can't lathe without hardwood
	if (itemAmount(Item.get("flimsy hardwood scraps")) < 1)
		{ return false; }
	// can't lathe things that aren't made of hardwood
	if (!(Item.get([
		"beechwood blowgun",
		"birch battery",
		"ebony epee",
		"maple magnet",
		"weeping willow wand"
		]).includes(toLathe)))
		{ return false; }

	return buy(Coinmaster.get("Your SpinMaster&trade; lathe"), 1, toLathe);
}

export function auto_latheAppropriateWeapon(): boolean
{
	let toLathe: Item = Item.none;

	switch (myPrimestat())
	{
		case Stat.get("Muscle"):
			toLathe = Item.get("ebony epee");
			break;
		case Stat.get("Mysticality"):
			toLathe = Item.get("weeping willow wand");
			break;
		case Stat.get("Moxie"):
			toLathe = Item.get("beechwood blowgun");
			break;
	}

	switch (myClass())
	{
		case Class.get("Plumber"):

		// autoscend likes Plumber to go for moxie, so let's make sure it
		// does even if another stat is ahead at the start of the day.
toLathe = Item.get("beechwood blowgun");
			break;
	}
		// If any future classes also have a variable mainstat, specify the desired item here
	// don't want to accidentally use a second scrap in casual or something
	if (possessEquipment(toLathe))
		{ return false; }

	return auto_latheHardwood(toLathe);
}

function auto_hasCargoShorts(): boolean
{
	return possessEquipment(wrap_item(Item.get("Cargo Cultist Shorts"))) && auto_is_valid(wrap_item(Item.get("Cargo Cultist Shorts")));
}

function auto_cargoShortsCanOpenPocket(): boolean
{
	if (!auto_hasCargoShorts())
		{ return false; }

	return !toBoolean(getProperty("_cargoPocketEmptied"));
}

function auto_cargoShortsCanOpenPocket$1(pocket: number): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }

	if (pocket <= 0 || pocket > 666)
		{ return false; }

	const picked: Map<number, boolean> = new Map(Object.entries(pickedPockets()).map(([_k, _v]) => [toInt(_k), _v]));
	if ((picked.get(pocket) ?? picked.set(pocket, false).get(pocket)))
		{ return false; }

	return true;
}

function auto_cargoShortsCanOpenPocket$2(i: Item): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }

	return availablePocket(i) !== 0;
}

function auto_cargoShortsCanOpenPocket$3(m: Monster): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }

	return availablePocket(m) !== 0;
}

function auto_cargoShortsCanOpenPocket$4(e: Effect): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }

	return availablePocket(e) !== 0;
}

function auto_cargoShortsCanOpenPocket$5(s: Stat): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }

	return availablePocket(s) !== 0;
}

function auto_cargoShortsCanOpenPocket$6(s: string): boolean
{
	if (!auto_cargoShortsCanOpenPocket())
		{ return false; }
	// to_int errors if not an int, check with regex first
	const m: AshMatcher = new AshMatcher("^d+$", s);
	if (m.find())
		{ return auto_cargoShortsCanOpenPocket$1(toInt(s)); }
	else if (toItem(s) !== Item.none)
		{ return auto_cargoShortsCanOpenPocket$2(toItem(s)); }
	else if (toMonster(s) !== Monster.none)
		{ return auto_cargoShortsCanOpenPocket$3(toMonster(s)); }
	else if (toEffect(s) !== Effect.none)
		{ return auto_cargoShortsCanOpenPocket$4(toEffect(s)); }
	else if (toStat(s) !== Stat.none)
		{ return auto_cargoShortsCanOpenPocket$5(toStat(s)); }

	return false;
}

export function auto_cargoShortsOpenPocket(pocket: number): boolean
{
	if (!auto_cargoShortsCanOpenPocket$1(pocket))
		{ return false; }

	if ((pocket) in monsterPockets())
	{
		return auto_cargoShortsOpenPocket$5(pocketMonster(pocket).toString());
	}
	return pickPocket(pocket);
}

function auto_cargoShortsOpenPocket$1(i: Item): boolean
{
	if (!auto_cargoShortsCanOpenPocket$2(i))
		{ return false; }

	return pickPocket(availablePocket(i));
}

export function auto_cargoShortsOpenPocket$2(m: Monster, speculative: boolean): boolean
{
	if (!auto_cargoShortsCanOpenPocket$3(m))
		{ return false; }

	if (speculative)
		{ return true; }

	auto_log_info(`Using cargo shorts to summon ${m.name}`, "blue");
	const pages: Map<number, string> = new Map();
	pages.set(0, "inventory.php?action=pocket");
	pages.set(1, `choice.php?pwd=${myHash()}&whichchoice=1420&option=1&pocket=${availablePocket(m)}`);
	if (autoAdvBypass(0, pages, Location.get("Noob Cave"), null))
	{
		handleTracker$1(m.toString(), wrap_item(Item.get("Cargo Cultist Shorts")).toString(), "auto_copies");
		return true;
	}
	return false;
}

function auto_cargoShortsOpenPocket$3(e: Effect): boolean
{
	if (!auto_cargoShortsCanOpenPocket$4(e))
		{ return false; }

	return pickPocket(availablePocket(e));
}

function auto_cargoShortsOpenPocket$4(s: Stat): boolean
{
	if (!auto_cargoShortsCanOpenPocket$5(s))
		{ return false; }

	return pickPocket(availablePocket(s));
}

function auto_cargoShortsOpenPocket$5(s: string): boolean
{
	if (!auto_cargoShortsCanOpenPocket$6(s))
		{ return false; }
	// to_int errors if not an int, check with regex first
	const m: AshMatcher = new AshMatcher("^d+$", s);
	if (m.find())
		{ return auto_cargoShortsOpenPocket(toInt(s)); }
	else if (toItem(s) !== Item.none)
		{ return auto_cargoShortsOpenPocket$1(toItem(s)); }
	else if (toMonster(s) !== Monster.none)
		{ return auto_cargoShortsOpenPocket$2(toMonster(s), false); }
	else if (toEffect(s) !== Effect.none)
		{ return auto_cargoShortsOpenPocket$3(toEffect(s)); }
	else if (toStat(s) !== Stat.none)
		{ return auto_cargoShortsOpenPocket$4(toStat(s)); }

	return false;
}

export function auto_canMapTheMonsters(): boolean
{
	if (haveSkill(Skill.get("Map the Monsters")) && auto_is_valid$2(Skill.get("Map the Monsters")))
	{
		return toInt(getProperty("_monstersMapped")) < 3;
	}
	return false;
}

export function auto_mapTheMonsters(): boolean
{
	if (toBoolean(getProperty("mappingMonsters")))
	{
		auto_log_warning("Trying to cast map the monsters but we already have an unused cast pending, skipping.", "red");
		return true;
	}
	if (auto_canMapTheMonsters())
	{
		return useSkill(1, Skill.get("Map the Monsters"));
	}
	return false;
}

function auto_monsterToMap(loc: Location, page: string): Monster
{
	const mons: AshMatcher = new AshMatcher("heyscriptswhatsupwinkwink\" value=\"(\\d+)", page);
	const monOpts: Map<number, Monster> = new Map();
	let i: number = 0;
	let bestmon: number = 0;
	while (mons.find())
	{
		//record the possible monsters and identify the best one to target
		monOpts.set(i, toMonster(toInt(mons.group(1))));
		if (zoneRank$1((monOpts.get(i) ?? monOpts.set(i, Monster.none).get(i)), loc) <= zoneRank$1((monOpts.get(bestmon) ?? monOpts.set(bestmon, Monster.none).get(bestmon)), loc))
		{
			bestmon = i;
		}
		i += 1;
	}
	return (monOpts.get(bestmon) ?? monOpts.set(bestmon, Monster.none).get(bestmon));
}

export function cartographyChoiceHandler(choice: number, page: string): void
{
	auto_log_info(`cartographyChoiceHandler Running choice ${choice}`, "blue");
	if (choice === 1425)
	{
		if (itemAmount(Item.get("Orcish frat-paddle")) > 0)
		{
			runChoice(1); // choosing baseball cap + cargo shorts to complete outfit
		}
		else if (itemAmount(Item.get("Orcish baseball cap")) > 0)
		{
			runChoice(2); // choosing frat-paddle + cargo shorts to complete outfit
		}
		else if (itemAmount(Item.get("Orcish cargo shorts")) > 0)
		{
			runChoice(3); // choosing frat-paddle + baseball cap to complete outfit
		}
		else if (itemAmount(Item.get("Orcish frat-paddle")) > 0 && itemAmount(Item.get("Orcish baseball cap")) > 0 && itemAmount(Item.get("Orcish cargo shorts")) > 0)
		{
			runChoice(4); // if you have each outfit piece, just fight the orcs
		}
		else {
			runChoice(1); // if nothing, just grab the first option. could consider opt 4 and YR?
		}
	}
	else if (choice === 1427)
	{ // The Hidden Junction (Guano Junction)
		runChoice(1); // fight the screambat.
	}
	else if (choice === 1428)
	{ // Your Neck of the Woods (The Dark Neck of the Woods)
		runChoice(2); // skip first 2 quest non-combats
	}
	else if (choice === 1429)
	{ // No Nook Unknown (The Defiled Nook)
		runChoice(1); // acquire 2 evil eyes
	}
	else if (choice === 1430)
	{ // Ghostly Memories (A-boo Peak)
		runChoice(1); // If we are adventuring in the peak we are trying to clear the peak, go to the horror
	}
	else if (choice === 1431)
	{ // Here There Be Giants (Cartography)
		if (internalQuestStatus("questL10Garbage") === 9)
		{
			if (itemAmount(Item.get("model airship")) > 0)
			{
				runChoice(1); // go to steampunk choice to complete the quest
			}
			else if (haveEquipped(Item.get("Mohawk wig")))
			{
				runChoice(4); // go to the punk rock choice to complete the quest
			}
			else {
				runChoice(3); // go to the raver choice to get the record?
			}
		}
		else {
			runChoice(1); // go to steampunk choice to open the hole in the sky.
		}
	}
	else if (choice === 1432)
	{ // Mob Maptality (A Mob of Zeppelin Protesters)
		const fire_protestors: number = (itemAmount(Item.get("Flamin' Whatshisname")) > 0 ? 10 : 3);
		const sleaze_amount: number = numericModifier("sleaze damage") + numericModifier("sleaze spell damage");
		const sleaze_protestors: number = squareRoot(sleaze_amount);
		let lynyrd_protestors: number = (haveEffect(Effect.get("Musky")) > 0 ? 6 : 3);
		for (const it of Item.get(["lynyrdskin cap", "lynyrdskin tunic", "lynyrdskin breeches"]))
		{
			if (equippedAmount(it) > 0)
			{
				lynyrd_protestors += 5;
			}
		}
		const best_protestors: number = max(fire_protestors, max(sleaze_protestors, lynyrd_protestors));
		if (best_protestors === lynyrd_protestors)
		{
			runChoice(2);
		}
		else if (best_protestors === sleaze_protestors)
		{
			runChoice(1);
		}
		else if (best_protestors === fire_protestors)
		{
			runChoice(3);
		}
	}
	else if (choice === 1433)
	{ // Sneaky, Sneaky (The Hippy Camp (Verge of War))
		runChoice(3); // start the war
	}
	else if (choice === 1434)
	{ // Sneaky, Sneaky (Orcish Frat House (Verge of War))
		runChoice(2); // start the war
	}
	else if (choice === 1435)
	{ // Leading Yourself Right to Them (Map the Monsters)
		const enemy: Monster = auto_monsterToMap(myLocation(), page);
		if (enemy !== Monster.none)
		{
			handleTracker$1(Skill.get("Map the Monsters").toString(), enemy.toString(), "auto_mapperidot");
			runChoice(1, `heyscriptswhatsupwinkwink=${toInt(enemy)}`);
		}
		else {
			abort("trying to map a monster but don't know which monster to map!");
		}
	}
	else if (choice === 1436)
	{ // Billiards Room Options (The Haunted Billiards Room)
		if (poolSkillPracticeGains() === 1 || currentPoolSkill() > 15)
		{
			runChoice(2); //try to win the key. on failure still gain 1 pool skill
		}
		else {
			runChoice(1); //acquire the pool cue
		}
	}
	else {
		abort("unhandled choice in cartographyChoiceHandler");
	}
}

export function auto_hasRetrocape(): boolean
{
	return possessEquipment(Item.get("unwrapped knock-off retro superhero cape")) && auto_is_valid(Item.get("unwrapped knock-off retro superhero cape"));
}

export function auto_configureRetrocape(hero: string, tag: string): boolean
{
	if (!auto_hasRetrocape())
	{
		return false;
	}
	// store the requested settings in a property so we can handle them later
	const settings: string = `${hero},${tag}`;
	setProperty("auto_retrocapeSettings", settings);
	// cut down potential server hits by telling the maximizer to not consider it.
	addToMaximize("-equip unwrapped knock-off retro superhero cape");
	return true;
}

export function auto_handleRetrocape(): boolean
{
	if (!auto_hasRetrocape())
	{
		return false;
	}

	let settingsProperty: string = getProperty("auto_retrocapeSettings");
	if (settingsProperty === "")
	{
		const capeConfiguration: string = getProperty("retroCapeWashingInstructions");
		const beatenUpCount: number = toInt(getProperty("auto_beatenUpCount"));
		if (capeConfiguration === "thrill" && beatenUpCount >= 5)
		{
			// if currently configured for stats and have been getting beaten up, change to stun
			settingsProperty = "heck,hold";
		}
		else {
			return false;
		}
	}

	const settings: Map<number, string> = new Map(splitString(settingsProperty, ",").map((_v, _i) => [_i, _v]));
	if (settings.size !== 2)
	{
		return false;
	}

	const hero: string = (settings.get(0) ?? settings.set(0, "").get(0));
	const tag: string = (settings.get(1) ?? settings.set(1, "").get(1));

	if (hero !== "muscle" && hero !== "mysticality" && hero !== "moxie" && hero !== "vampire" && hero !== "heck" && hero !== "robot")
	{
		return false;
	}
	if (tag !== "hold" && tag !== "thrill" && tag !== "kiss" && tag !== "kill")
	{
		return false;
	}
	let tempHero: string = hero;
	if (hero === "muscle")
	{
		tempHero = "vampire";
	}
	if (hero === "mysticality")
	{
		tempHero = "heck";
	}
	if (hero === "moxie")
	{
		tempHero = "robot";
	}
	// avoid uselessly reconfiguring the cape
	if (getProperty("retroCapeSuperhero") !== tempHero || getProperty("retroCapeWashingInstructions") !== tag)
	{
		// retrocape [muscle | mysticality | moxie | vampire | heck | robot] [hold | thrill | kiss | kill]
		cliExecute(`retrocape ${tempHero} ${tag}`); // configures and equips
	}
	else {
		equip(Item.get("unwrapped knock-off retro superhero cape")); // already configured, just equip
	}
	return getProperty("retroCapeSuperhero") === tempHero && getProperty("retroCapeWashingInstructions") === tag && haveEquipped(Item.get("unwrapped knock-off retro superhero cape"));
}

export function auto_buyCrimboCommerceMallItem(): boolean
{
	if (!auto_is_valid$1(Familiar.get("Ghost of Crimbo Commerce")))
	{
		return false;
	}

	const ghostItemString: string = getProperty("commerceGhostItem");
	if (ghostItemString === "")
	{
		// haven't triggered the greedy ghost message at least once yet.
		return false;
	}

	if (getProperty("auto_boughtCommerceGhostItem") === ghostItemString)
	{
		// already bought the item.
		return false;
	}

	auto_log_info$1(`Commerce Ghost wants us to buy a ${ghostItemString} which will give us roughly ${myLevel() * 25} substats in the next combat with it.`);

	const output: string = cliExecuteOutput(`buy from mall [${toInt(toItem(ghostItemString))}]`);
	if (!containsText(output, "Purchases complete."))
	{
		abort(`Something went wrong buying ${ghostItemString} from the mall.`);
	}
	else {
		setProperty("auto_boughtCommerceGhostItem", ghostItemString);
	}
	return true;
}
