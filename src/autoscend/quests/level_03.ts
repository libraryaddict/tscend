import { abort, charAt, containsText, council, Effect, Element, Familiar, getProperty, haveEffect, haveSkill, Item, lastMonster, Location, Monster, monsterLevelAdjustment, myDaycount, myLevel, myMp, numericModifier, setProperty, Skill, stringModifier, toBoolean, visitUrl, wait } from "kolmafia";
import { pullXWhenHaveY } from "../auto_acquire";
import { autoAdv$1, autoAdvBypass$1 } from "../auto_adventure";
import { buffMaintain$3 } from "../auto_buff";
import { addToMaximize, possessEquipment, resetMaximize, simMaximizeWith$1, simValue, simValue$1 } from "../auto_equipment";
import { isAboutToPowerlevel } from "../auto_powerlevel";
import { providePlusCombat$4, providePlusNonCombat$4 } from "../auto_providers";
import { auto_combatModCap, auto_convertDesiredML, auto_log_info, auto_log_warning, auto_MaxMLToCap, auto_setMCDToCap, damageModifier, internalQuestStatus } from "../auto_util";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { auto_beachCombHead } from "../iotms/mr2019";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_glover } from "../paths/g_lover";
import { in_wereprof } from "../paths/wereprofessor";

//Defined in autoscend/quests/level_03.ash
function auto_tavern(): boolean
{
	if (internalQuestStatus("questL03Rat") !== 1)
	{
		return false;
	}

	const temp: string = visitUrl("cellar.php");
	if (containsText(temp, "You should probably talk to the bartender before you go poking around in the cellar."))
	{
		abort("Quest not yet started, talk to Bart Ender and re-run.");
	}

	auto_log_info(`In the tavern! Layout: ${getProperty("tavernLayout")}`, "blue");
	const locations: number[] = [3, 2, 1, 0, 5, 10, 15, 20, 16, 21];
	// infrequent compounding issue, reset maximizer
	resetMaximize();

	let maximized: boolean = false;
	// sleaze is the only one we don't care about
	if (possessEquipment(Item.get("Kremlin's Greatest Briefcase")))
	{
		const mod: string = stringModifier(Item.get("Kremlin's Greatest Briefcase"), "Modifiers");
		if (containsText(mod, "Weapon Damage Percent"))
		{
			let page: string = visitUrl("place.php?whichplace=kgb");
			let flipped: boolean = false;
			if (containsText(page, "handleup"))
			{
				page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
				flipped = true;
			}

			page = visitUrl("place.php?whichplace=kgb&action=kgb_button1", false);
			page = visitUrl("place.php?whichplace=kgb&action=kgb_button1", false);
			if (flipped)
			{
				page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
			}
		}
	}
	// We need 20 each of the elements except sleaze to skip noncombats
	function try_buff_damage(el: Element, ef: Effect): void
	{
		if (numericModifier(damageModifier(el)) < 20.0)
		{
			buffMaintain$3(ef, 20, 1, 1);
		}
	}

	try_buff_damage(Element.get("hot"), Effect.get("Pyromania"));
	try_buff_damage(Element.get("cold"), Effect.get("Frostbeard"));
	try_buff_damage(Element.get("cold"), Effect.get("Song of the North"));
	try_buff_damage(Element.get("stench"), Effect.get("Rotten Memories"));
	try_buff_damage(Element.get("spooky"), Effect.get("Intimidating Mien"));
	try_buff_damage(Element.get("spooky"), Effect.get("Dirge of Dreadfulness (Remastered)"));
	try_buff_damage(Element.get("spooky"), Effect.get("Dirge of Dreadfulness"));
	try_buff_damage(Element.get("spooky"), Effect.get("Snarl of Three Timberwolves"));
	try_buff_damage(Element.get("spooky"), Effect.get("Snarl of the Timberwolf"));

	const max_ml_target: number = 150;

	if (!isActuallyEd() && monsterLevelAdjustment() <= 299)
	{
		auto_MaxMLToCap(auto_convertDesiredML(max_ml_target), true);
	}
	else {
		auto_MaxMLToCap(auto_convertDesiredML(max_ml_target), false);
	}

	for (const element_type of ["Hot", "Cold", "Stench", "Sleaze", "Spooky"])
	{
		if (numericModifier(`${element_type} Damage`) < 20.0)
		{
			if (in_glover() && element_type !== "Stench")
			{ // the only one that works in g-lover
				continue;
			}
			auto_beachCombHead(element_type);
		}
	}

	if (!maximized)
	{
		// Tails are a better time saving investment. Add -combat to ensure sim and real maximizer results match
		simMaximizeWith$1(`80cold damage 20max,80hot damage 20max,80spooky damage 20max,80stench damage 20max,500ml ${auto_convertDesiredML(max_ml_target)}max,-200combat 25max`);
		maximized = true;
	}

	function n_passed(): number
	{ // We pass an elemental damage check if we have 20 damage for that element
		let n: number = 0;
		for (const el of Element.get(["hot", "cold", "spooky", "stench"]))
		{
			if (simValue$1(damageModifier(el)) >= 20.0)
			{
				n++;
			}
		}
		return n; // 4 is success here
	}
	function all_passed(): boolean
	{ // do we pass all of the damage checks?
		return n_passed() >= 4;
	}
	// Consider a pull
	for (const it of Item.get(["17-ball", "rare oboe"]))
	{
		if (!all_passed())
		{
			if (pullXWhenHaveY(it, 1, 0))
			{
				simMaximizeWith$1(`80cold damage 20max,80hot damage 20max,80spooky damage 20max,80stench damage 20max,500ml ${auto_convertDesiredML(max_ml_target)}max,-200combat 25max`);
			}
		}
	}

	const eleChoiceCombos: Map<string, number> = new Map([
		["Cold", 513],
		["Hot", 496],
		["Spooky", 515],
		["Stench", 514]
	]);
	let capped: number = 0;
	for (const [ele, choicenum] of eleChoiceCombos)
	{
		const passed: boolean = simValue(`${ele} Damage`) >= 20.0;
		setProperty(`choiceAdventure${choicenum}`, (passed ? "2" : "1"));
		if (passed)
		{
			++capped;
			//adding a 20min argument does not yield better combinations nor avoid giving value to failed elements
			addToMaximize(`80${ele} Damage 20max`); //only give value to elements that will pass
		}
	}
	addToMaximize(`500ml ${auto_convertDesiredML(max_ml_target)}max`);

	if (capped >= 3)
	{
		providePlusNonCombat$4(auto_combatModCap(), Location.get("Noob Cave"));
	}
	else {
		providePlusCombat$4(20, Location.get("Noob Cave"));
	}

	let tavern_1: string = getProperty("tavernLayout");
	if (tavern_1 === "0000000000000000000000000")
	{
		// visit cellar then refresh layout property
		const temp_1: string = visitUrl("cellar.php");
		tavern_1 = getProperty("tavernLayout");
		if (tavern_1 === "0000000000000000000000000")
		{
			abort("Invalid Tavern Configuration, could not visit cellar and repair. Uh oh...");
		}
	}

	for (const loc of locations)
	{
		if (charAt(tavern_1, loc) === "0")
		{
			const actual: number = loc + 1;
			let needReset: boolean = false;
			setProperty("auto_nonAdvLoc", true.toString());

			if (autoAdvBypass$1(`cellar.php?action=explore&whichspot=${actual}`, Location.get("The Typical Tavern Cellar")))
			{
				return true;
			}

			const page: string = visitUrl("main.php");
			if (containsText(page, "You've already explored that spot."))
			{
				needReset = true;
				auto_log_warning("tavernLayout is not reporting places we've been to.", "red");
			}
			if (containsText(page, "Darkness (5,5)"))
			{
				needReset = true;
				auto_log_warning("tavernLayout is reporting too many places as visited.", "red");
			}

			if (containsText(page, "whichchoice value=") || containsText(page, "whichchoice="))
			{
				auto_log_warning("Tavern handler: You are RL drunk, you should not be here.", "red");
				autoAdv$1(1, Location.get("Noob Cave"));
			}
			if (lastMonster() === Monster.get("crate") || in_wereprof() && !((Location.get("Noob Cave")).turnsSpent < 8))
			{ //want 7 turns of Noob Cave in WereProfessor for Smashed Scientific Equipment
				if (toBoolean(getProperty("auto_newbieOverride")))
				{
					setProperty("auto_newbieOverride", false.toString());
				}
				else {
					abort("We went to the Noob Cave for reals... uh oh");
				}
			}
			if (getProperty("lastEncounter") === "Like a Bat Into Hell")
			{
				abort("Got stuck undying while trying to do the tavern. Must handle manualy and then resume.");
			}

			if (needReset)
			{
				auto_log_warning("We attempted a tavern adventure but the tavern layout was not maintained properly.", "red");
				auto_log_warning("Attempting to reset this issue...", "red");
				setProperty("tavernLayout", "0000100000000000000000000");
				visitUrl("cellar.php");
			}
			return true;
		}
	}
	auto_log_warning("We found no valid location to tavern, something went wrong...", "red");
	auto_log_warning("Attempting to reset this issue...", "red");
	setProperty("tavernLayout", "0000100000000000000000000");
	wait(5);
	return true;
}

export function L3_tavern(): boolean
{
	if (internalQuestStatus("questL03Rat") < 0 || internalQuestStatus("questL03Rat") > 2)
	{
		return false;
	}

	if (internalQuestStatus("questL03Rat") < 1)
	{
		visitUrl("tavern.php?place=barkeep");
	}

	let mpNeed: number = 0;
	if (haveSkill(Skill.get("The Sonata of Sneakiness")) && haveEffect(Effect.get("The Sonata of Sneakiness")) === 0)
	{
		mpNeed = mpNeed + 20;
	}
	if (haveSkill(Skill.get("Smooth Movement")) && haveEffect(Effect.get("Smooth Movements")) === 0)
	{
		mpNeed = mpNeed + 10;
	}

	const enoughElement: boolean = numericModifier("cold damage") >= 20 && numericModifier("hot damage") >= 20 && numericModifier("spooky damage") >= 20 && numericModifier("stench damage") >= 20;

	let delayTavern: boolean = false;

	if (!enoughElement || myMp() < mpNeed)
	{
		if (myDaycount() <= 2 && myLevel() <= 11)
		{
			delayTavern = true;
		}
	}

	if (isAboutToPowerlevel())
	{
		delayTavern = false;
	}

	if (toBoolean(getProperty("auto_forceTavern")))
	{
		delayTavern = false;
	}

	if (delayTavern)
	{
		return false;
	}

	auto_log_info("Doing Tavern", "blue");

	if (myMp() > 60 || considerGrimstoneGolem(true))
	{
		handleBjornify(Familiar.get("Grimstone Golem"));
	}

	auto_setMCDToCap();

	if (auto_tavern())
	{
		return true;
	}

	if (internalQuestStatus("questL03Rat") > 1)
	{
		visitUrl("tavern.php?place=barkeep");
		council();
		return true;
	}
	return false;
}
