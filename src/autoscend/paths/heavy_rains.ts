import { Class, Effect, Element, Familiar, Item, Location, Monster, Path, Skill, Slot, abort, cliExecute, containsText, equip, getProperty, haveEffect, haveSkill, inebrietyLimit, itemAmount, lastMonster, max, min, monsterFactoidsAvailable, myClass, myInebriety, myLightning, myPath, myRain, myThunder, numericModifier, runChoice, setProperty, toBoolean, toInt, useFamiliar, useSkill, visitUrl } from "kolmafia";
import { acquireOrPull, auto_buyUpTo, pullXWhenHaveY } from "../auto_acquire";
import { autoAdvBypass, autoAdvBypass$1 } from "../auto_adventure";
import { buffMaintain$4 } from "../auto_buff";
import { addToMaximize, autoEquip, equipMaximizedGear, possessEquipment } from "../auto_equipment";
import { canChangeToFamiliar } from "../auto_familiar";
import { acquireHP, acquireMP$1 } from "../auto_restore";
import { auto_have_skill, auto_log_info, effectAblativeArmor, executeFlavour, handleTracker$1, internalQuestStatus, runChoice$1, setFlavour } from "../auto_util";
import { inAftercore } from "./casual";

//Defined in autoscend/paths/heavy_rains.ash
export function in_heavyrains(): boolean
{
	return myPath() === Path.get("Heavy Rains");
}

export function heavyrains_initializeSettings(): void
{
	if (in_heavyrains())
	{
		//Rain Man (Heavy Rains) Related settings
		setProperty("auto_holeinthesky", false.toString());
		setProperty("auto_mountainmen", "");
		setProperty("auto_ninjasnowmanassassin", false.toString()); //are we done with ninja snowman assassins
		setProperty("auto_orcishfratboyspy", "");
		setProperty("auto_warhippyspy", "");

		setProperty("auto_lastthunder", "100");
		setProperty("auto_lastthunderturn", "0");

		setProperty("auto_wandOfNagamar", false.toString());
		setProperty("auto_writingDeskSummon", true.toString());

		setProperty("auto_day1_desk", "");
		setProperty("auto_day1_skills", "");
	}
}


export function heavyrains_initializeDay(day: number): void
{
	if (in_heavyrains())
	{
		if (day === 1 && getProperty("auto_day1_skills") !== "finished")
		{
			setProperty("choiceAdventure967", "1");
			setProperty("choiceAdventure968", "1");
			setProperty("choiceAdventure969", "3");

			if (itemAmount(Item.get("thunder thigh")) > 0)
			{ //Thunder Clap, Thunder Bird, Thunder Strike
				visitUrl("inv_use.php?which=3&whichitem=7648&pwd");
				visitUrl("choice.php?pwd&whichchoice=967&option=1", true);
				if (itemAmount(Item.get("thunder thigh")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=967&option=3", true);
				}
				if (itemAmount(Item.get("thunder thigh")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=967&option=5", true);
				}
				setProperty("choiceAdventure967", "7");
			}

			if (itemAmount(Item.get("aquaconda brain")) > 0)
			{ // Rain Man, Make it Rain, Rain Dance
				visitUrl("inv_use.php?which=3&whichitem=7647&pwd");
				visitUrl("choice.php?pwd&whichchoice=968&option=1", true);
				if (itemAmount(Item.get("aquaconda brain")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=968&option=3", true);
				}
				if (itemAmount(Item.get("aquaconda brain")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=968&option=4", true);
				}
				setProperty("choiceAdventure968", "2");
			}

			if (itemAmount(Item.get("lightning milk")) > 0)
			{ // Ball Lightning, Lightning Strike, Riding the Lightning
				visitUrl("inv_use.php?which=3&whichitem=7646&pwd");
				visitUrl("choice.php?pwd&whichchoice=969&option=3", true);
				if (itemAmount(Item.get("lightning milk")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=969&option=1", true);
				}
				if (itemAmount(Item.get("lightning milk")) > 0) {
					visitUrl("choice.php?pwd&whichchoice=969&option=7", true);
				}
				setProperty("choiceAdventure969", "2");
			}

			if (itemAmount(Item.get("miniature life preserver")) === 0)
			{
				auto_buyUpTo(1, Item.get("miniature life preserver"));
			}
			setProperty("auto_day1_skills", "finished");
			visitUrl("main.php");
		}
	}
}

export function heavyrains_doBedtime(): void
{
	if (myInebriety() > inebrietyLimit())
	{
		while (haveSkill(Skill.get("Rain Dance")) && myRain() >= 10)
		{
			useSkill(1, Skill.get("Rain Dance"));
		}
		while (haveSkill(Skill.get("Thunderheart")) && myThunder() >= 20)
		{
			useSkill(1, Skill.get("Thunderheart"));
		}
		while (haveSkill(Skill.get("Clean-Hair Lightning")) && myLightning() >= 10)
		{
			useSkill(1, Skill.get("Clean-Hair Lightning"));
		}
	}
}

export function heavyrains_buySkills(): boolean
{
	if (!in_heavyrains())
	{
		return false;
	}
	else {
		if (itemAmount(Item.get("thunder thigh")) > 0)
		{
			auto_log_info("Trying to use a thunder thigh", "blue");
			const page: string = visitUrl("inv_use.php?which=3&whichitem=7648&pwd");
			let skillChoice: number = 8;
			if (!haveSkill(Skill.get("Thunder Down Underwear"))) {
				skillChoice = 6;
			}
			if (!haveSkill(Skill.get("Thundercloud"))) {
				skillChoice = 2;
			}
			if (!haveSkill(Skill.get("Thunderheart"))) {
				skillChoice = 4;
			}
			if (!haveSkill(Skill.get("Thunder Thighs"))) {
				skillChoice = 7;
			}
			if (!haveSkill(Skill.get("Thunderstrike"))) {
				skillChoice = 5;
			}
			if (!haveSkill(Skill.get("Thunder Bird"))) {
				skillChoice = 3;
			}
			if (!haveSkill(Skill.get("Thunder Clap"))) {
				skillChoice = 1;
			}

			setProperty("choiceAdventure967", skillChoice.toString());
			runChoice$1(page);
			visitUrl("main.php");
			return true;
		}

		if (itemAmount(Item.get("aquaconda brain")) > 0)
		{
			auto_log_info("Trying to use a aquaconda brain", "blue");
			const page: string = visitUrl("inv_use.php?which=3&whichitem=7647&pwd");
			let skillChoice: number = 8;
			if (!haveSkill(Skill.get("Rain Delay"))) {
				skillChoice = 7;
			}
			if (!haveSkill(Skill.get("Rain Coat"))) {
				skillChoice = 6;
			}
			if (!haveSkill(Skill.get("Rainbow"))) {
				skillChoice = 5;
			}
			if (!haveSkill(Skill.get("Rainy Day"))) {
				skillChoice = 2;
			}
			if (!haveSkill(Skill.get("Rain Dance"))) {
				skillChoice = 4;
			}
			if (!haveSkill(Skill.get("Make it Rain"))) {
				skillChoice = 3;
			}
			if (!haveSkill(Skill.get("Rain Man"))) {
				skillChoice = 1;
			}

			setProperty("choiceAdventure968", skillChoice.toString());
			runChoice$1(page);
			visitUrl("main.php");
			return true;
		}

		if (itemAmount(Item.get("lightning milk")) > 0)
		{
			auto_log_info("Trying to use a lightning milk", "blue");
			const page: string = visitUrl("inv_use.php?which=3&whichitem=7646&pwd");
			let skillChoice: number = 8;
			if (toBoolean(getProperty("_fireworksShop")) && !haveSkill(Skill.get("Ball Lightning"))) {
				skillChoice = 3;
			}
			if (!haveSkill(Skill.get("Lightning Rod"))) {
				skillChoice = 6;
			}
			if (!haveSkill(Skill.get("[16025]Lightning Bolt"))) {
				skillChoice = 5;
			}
			if (!haveSkill(Skill.get("Sheet Lightning"))) {
				skillChoice = 4;
			}
			if (!haveSkill(Skill.get("Clean-Hair Lightning"))) {
				skillChoice = 2;
			}
			if (!haveSkill(Skill.get("Riding the Lightning"))) {
				skillChoice = 7;
			}
			if (!haveSkill(Skill.get("Lightning Strike"))) {
				skillChoice = 1;
			}
			if (!toBoolean(getProperty("_fireworksShop")) && !haveSkill(Skill.get("Ball Lightning"))) {
				skillChoice = 3;
			}

			setProperty("choiceAdventure969", skillChoice.toString());
			runChoice$1(page);
			visitUrl("main.php");
			return true;
		}
	}
	return false;
}

function canRainManSummon(target: Monster): boolean
{
	if (!haveSkill(Skill.get("Rain Man")) || myRain() < 50)
	{
		return false;
	}
	// Can only rain man summon copyable monsters
	if (!target.copyable || target.id < 0)
	{
		return false;
	}
	// Can summon any monster with available factoids
	if (monsterFactoidsAvailable(target, false) > 0)
	{
		return true;
	}
	// Check the page text
	auto_log_info(`${target} factoids unavailable, checking Rain Man if summon is possible`, "blue");
	const page: string = visitUrl("runskillz.php?pwd&action=Skillz&whichskill=16011&quantity=1");
	// Escape
	runChoice(2);

	return containsText(page, `<option value=${target.id}>`);
}

export function rainManSummon(target: Monster, speculative: boolean): boolean
{
	const canSummon: boolean = canRainManSummon(target);
	if (!canSummon || speculative)
	{
		return canSummon;
	}
	//use the rainman to summon a monster
	auto_log_info(`Rain Man will summon: ${target}`, "blue");
	const pages: Map<number, string> = new Map();
	pages.set(0, "runskillz.php?pwd&action=Skillz&whichskill=16011&quantity=1");
	pages.set(1, `choice.php?pwd&whichchoice=970&whichmonster=${target.id}&option=1&choice2=and+Fight%21`);
	// autoAdvBypass will escape from the choice and return false if the monster cannot be fought
	if (autoAdvBypass(0, pages, Location.get("Noob Cave"), null))
	{
		handleTracker$1(target.toString(), Skill.get("Rain Man").toString(), "auto_copies");
		return true;
	}
	return false;
}

export function L13_heavyrains_towerFinal(): boolean
{
	//Prepare for and defeat the final boss for Heavy Rains run. Which has special rules for engagement.
	if (internalQuestStatus("questL13Final") !== 11)
	{
		return false;
	}
	//use a damage dealing familiar
	if (canChangeToFamiliar(Familiar.get("Warbear Drone")))
	{ //old event item. still farmable. up to 6 attacks per round
		useFamiliar(Familiar.get("Warbear Drone"));
		//TODO does rain king stripping at begining of combat remove familiar equipment? if yes remove the part below
		pullXWhenHaveY(Item.get("warbear drone codes"), 1, 0);
		if (possessEquipment(Item.get("warbear drone codes")))
		{
			equip(Item.get("warbear drone codes"));
		}
	}
	else if (canChangeToFamiliar(Familiar.get("Sludgepuppy")))
	{ //IOTM derivative, infinitely farmable. attacks 3 times per round
		useFamiliar(Familiar.get("Sludgepuppy"));
	}
	else if (canChangeToFamiliar(Familiar.get("Imitation Crab")))
	{ //cheap, easily acquired. attacks 2 times per round
		useFamiliar(Familiar.get("Imitation Crab"));
	}
	else if (canChangeToFamiliar(Familiar.get("Angry Goat")))
	{ //super cheap. high chance to attack each round.
		useFamiliar(Familiar.get("Angry Goat"));
	}
	//buff up before the boss
	buffMaintain$4(Effect.get("Benetton's Medley of Diversity")); //15 prismatic weapon dmg.
	buffMaintain$4(Effect.get("Dirge of Dreadfulness (Remastered)")); //36 spooky spell & weapon dmg
	buffMaintain$4(Effect.get("Dirge of Dreadfulness")); //12 spooky weapon dmg
	buffMaintain$4(Effect.get("Boner Battalion")); //32-33 sleaze and spooky passive dmg
	buffMaintain$4(Effect.get("Frigidalmatian")); //40 (due to cap) cold passive dmg
	effectAblativeArmor(true); //Unimportant effects protect your important one from being removed.
	//Calculate melee/ranged damage. Each element is capped at 40. assume you will be able to deal 40 physical damage.
	cliExecute("outfit Birthday Suit"); //Need to get naked so we can check our stats properly.
	addToMaximize("1000prismatic damage, +weapon, +offhand");
	equipMaximizedGear();

	let hot_dmg: number = toInt(min(40, numericModifier("hot damage")));
	let cold_dmg: number = toInt(min(40, numericModifier("cold damage")));
	let stench_dmg: number = toInt(min(40, numericModifier("stench damage")));
	let sleaze_dmg: number = toInt(min(40, numericModifier("sleaze damage")));
	let spooky_dmg: number = toInt(min(40, numericModifier("spooky damage")));
	if (auto_have_skill(Skill.get("Cold Shoulder")))
	{
		cold_dmg = min(40, 5 + cold_dmg);
	}
	//lunging thrust smack as a seal clubber with a club triples elemental damage. this applies to damage that does not come from weapon, excluding cold shoulder.
	let want_club: boolean = false;
	if (myClass() === Class.get("Seal Clubber") && auto_have_skill(Skill.get("Lunging Thrust-Smack")))
	{
		addToMaximize("prismatic damage, +weapon, +offhand, +club");
		equipMaximizedGear();
		const club_hot_dmg: number = toInt(min(40, 3 * numericModifier("hot damage")));
		let club_cold_dmg: number = toInt(min(40, 3 * numericModifier("cold damage")));
		const club_stench_dmg: number = toInt(min(40, 3 * numericModifier("stench damage")));
		const club_sleaze_dmg: number = toInt(min(40, 3 * numericModifier("sleaze damage")));
		const club_spooky_dmg: number = toInt(min(40, 3 * numericModifier("spooky damage")));

		if (auto_have_skill(Skill.get("Cold Shoulder")))
		{
			club_cold_dmg = min(40, 5 + club_cold_dmg);
		}

		if (hot_dmg + cold_dmg + stench_dmg + sleaze_dmg + spooky_dmg < club_hot_dmg + club_cold_dmg + club_stench_dmg + club_sleaze_dmg + club_spooky_dmg)
		{
			want_club = true;
			hot_dmg = club_hot_dmg;
			cold_dmg = club_cold_dmg;
			stench_dmg = club_stench_dmg;
			sleaze_dmg = club_sleaze_dmg;
			spooky_dmg = club_spooky_dmg;
		}
	}

	const attack_dmg: number = 40 + min(40, hot_dmg) + min(40, cold_dmg) + min(40, stench_dmg) + min(40, sleaze_dmg) + min(40, spooky_dmg);
	//check magic damage
	let spell_extra_element: boolean = false;
	if (itemAmount(Item.get("Rain-Doh green lantern")) > 0 || itemAmount(Item.get("meteorb")) > 0 || itemAmount(Item.get("snow mobile")) > 0)
	{
		spell_extra_element = true;
	}
	else { for (const it of Item.get(["Rain-Doh green lantern", "meteorb", "snow mobile"]))
	{
		if (acquireOrPull(it))
		{
			spell_extra_element = true;
			break;
		}
	} }

	let spell_dmg: number = 0;
	let best_spell: string = "";
	if (auto_have_skill(Skill.get("Saucestorm")))
	{
		if (80 > spell_dmg)
		{
			best_spell = "saucestorm";
			spell_dmg = max(80, spell_dmg);
		}
		//IIRC hot and cold extra elements don't work for saucestorm, so only want green lantern. TODO verify
		if (itemAmount(Item.get("Rain-Doh green lantern")) > 0 && 120 > spell_dmg)
		{
			best_spell = "saucestorm";
			spell_dmg = max(120, spell_dmg);
		}
	}
	if (auto_have_skill(Skill.get("Weapon of the Pastalord")) && auto_have_skill(Skill.get("Flavour of Magic")))
	{
		if (80 > spell_dmg)
		{
			best_spell = "weapon_of_the_pastalord";
			spell_dmg = max(80, spell_dmg);
		}
		if (spell_extra_element && 120 > spell_dmg)
		{
			best_spell = "weapon_of_the_pastalord";
			spell_dmg = max(120, spell_dmg);
		}
	}
	if (auto_have_skill(Skill.get("Turtleini")))
	{
		if (120 > spell_dmg)
		{
			best_spell = "turtleini";
			spell_dmg = max(120, spell_dmg);
		}
		if (spell_extra_element && 160 > spell_dmg)
		{
			//how does [Turtleini] get affected by extra elements? I am guessing it increases it to 160. TODO verify
			best_spell = "turtleini";
			spell_dmg = max(160, spell_dmg);
		}
	}

	let plan_on_spells: boolean = false;
	if (attack_dmg < spell_dmg)
	{
		plan_on_spells = true;
	}
	//final dressup for the boss
	if (plan_on_spells)
	{
		setProperty("auto_rain_king_combat", best_spell);
		setFlavour(Element.get("sleaze")); //a safe element that does not conflict with offhand items.
		executeFlavour();
		if (spell_extra_element)
		{
			addToMaximize("spell damage percent, +weapon");
			if (itemAmount(Item.get("Rain-Doh green lantern")) > 0)
			{
				autoEquip(Slot.get("off-hand"), Item.get("Rain-Doh green lantern"));
			}
			else if (itemAmount(Item.get("meteorb")) > 0)
			{
				autoEquip(Slot.get("off-hand"), Item.get("meteorb"));
			}
			else if (itemAmount(Item.get("snow mobile")) > 0)
			{
				autoEquip(Slot.get("off-hand"), Item.get("snow mobile"));
			}
		}
		else {
			addToMaximize("spell damage percent, +weapon, +offhand");
		}
	}
	else {
		setProperty("auto_rain_king_combat", "attack");
		if (want_club)
		{
			addToMaximize("prismatic damage, +weapon, +offhand, +club");
		}
		else {
			addToMaximize("prismatic damage, +weapon, +offhand");
		}
	}
	//Rain King strips all equipment other than weapon and offhand.
	//Stripped equipment can only provide you with -ML which is applied before the stripping
	auto_buyUpTo(3, Item.get("water wings for babies"));
	addToMaximize("-ml, -weapon, -offhand");
	equipMaximizedGear();
	//Fight!
	//auto_disableAdventureHandling because we don't want maximize, switch familiar, change buffs, or anything else that might break our specific prepwork.
	acquireHP();
	acquireMP$1(200);
	setProperty("auto_disableAdventureHandling", true.toString());
	autoAdvBypass$1("place.php?whichplace=nstower&action=ns_10_sorcfight", Location.get("Noob Cave"));
	setProperty("auto_disableAdventureHandling", false.toString());
	if (lastMonster() !== Monster.get("The Rain King"))
	{
		abort("Failed to start the battle with The Rain King");
	}
	if (haveEffect(Effect.get("Beaten Up")) > 0)
	{
		abort("The Rain King beat me up! please finish him off manually");
	}
	if (toBoolean(getProperty("auto_stayInRun")))
	{
		abort("User wanted to stay in run (auto_stayInRun), we are done.");
	}
	else {
		visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
		if (inAftercore())
		{
			abort("All done. King Ralph has been freed");
		}
		abort("Tried to break prism but failed");
	}
	abort("How did I reach this line? I should have fought [The Rain King]");
	return false;
}