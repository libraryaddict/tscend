import { Class, Effect, Familiar, Item, Location, Monster, Skill, Slot, Stat, abort, availableChoiceOptions, cliExecute, containsText, council, equippedItem, expectedDamage, floor, getProperty, haveEffect, haveFamiliar, haveSkill, inHardcore, initiativeModifier, isBanished, isUnrestricted, itemAmount, itemType, min, myClass, myDaycount, myFullness, myMaxhp, myMp, myPrimestat, runChoice, setProperty, splitString, toInt, toLowerCase, toMonster, use, useSkill, visitUrl } from "kolmafia";
import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv$1, autoAdv$2 } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import { autoChew, auto_spleenFamiliarAdvItemsPossessed, spleen_left } from "../auto_consume";
import { addToMaximize, autoEquip$1, auto_forceEquipSword, auto_forceEquipSword$1, equipStatgainIncreasers$2, possessEquipment } from "../auto_equipment";
import { auto_have_familiar, handleFamiliar$1 } from "../auto_familiar";
import { provideInitiative$2, provideItem$2 } from "../auto_providers";
import { acquireHP } from "../auto_restore";
import { auto_reserveUndergroundAdventures } from "../auto_routing";
import { auto_MaxMLToCap, auto_badassBelt, auto_change_mcd, auto_combat_appearance_rates$1, auto_convertDesiredML, auto_have_skill, auto_is_valid, auto_is_valid$2, auto_is_valid$3, auto_log_debug$1, auto_log_info, auto_log_info$1, auto_log_warning, auto_turbo, canSniff, internalQuestStatus } from "../auto_util";
import { isSniffed$1 } from "../combat/auto_combat_util";
import { handleBjornify } from "../iotms/mr2014";
import { spacegateVaccine } from "../iotms/mr2017";
import { auto_havePillKeeper } from "../iotms/mr2019";
import { auto_configureRetrocape, auto_hasRetrocape, auto_mapTheMonsters } from "../iotms/mr2020";
import { auto_FireExtinguisherCombatString, auto_backupUsesLeft } from "../iotms/mr2021";
import { auto_haveGreyGoose } from "../iotms/mr2022";
import { auto_habitatFightsLeft, auto_habitatMonster } from "../iotms/mr2023";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { is_pete } from "../paths/avatar_of_sneaky_pete";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { lar_repeat } from "../paths/live_ascend_repeat";
import { is_professor } from "../paths/wereprofessor";
import { in_zombieSlayer } from "../paths/zombie_slayer";

//Defined in autoscend/quests/level_07.ash
export function cyrptChoiceHandler(choice: number): void
{
	if (choice === 153)
	{ // Turn Your Head and Coffin (The Defiled Alcove)
		runChoice(4); // skip
	}
	else if (choice === 155)
	{ // Skull, Skull, Skull (The Defiled Nook)
		if (in_zombieSlayer() && (itemAmount(Item.get("talkative skull")) === 0 || !haveFamiliar(Familiar.get("Hovering Skull"))))
		{
			runChoice(1); // get talkative skull
		}
		else {
			runChoice(5); // skip
		}
	}
	else if (choice === 157)
	{ // Urning Your Keep (The Defiled Niche)
		runChoice(4); // skip
	}
	else if (choice === 523)
	{ // Death Rattlin' (The Defiled Cranny)
		if (in_darkGyffte() && haveSkill(Skill.get("Flock of Bats Form")) && haveSkill(Skill.get("Sharp Eyes")) || auto_turbo())
		{
			let desiredPills: number = (inHardcore() ? 6 : (auto_turbo() ? 3 : 4));
			let dietingPillsUsed: number = 0;
			if (getProperty("auto_chewed") === "")
			{
				dietingPillsUsed = 0;
			}
			else {
				for (const str of splitString(getProperty("auto_chewed"), ","))
				{
					if (containsText(toLowerCase(str), "dieting pill"))
					{
						dietingPillsUsed += 1;
					}
				}
			}
			if (!auto_turbo())
			{
				desiredPills -= myFullness() / 2;
			}
			else {
				desiredPills -= dietingPillsUsed;
			}
			auto_log_info(`We want ${desiredPills} dieting pills and have ${itemAmount(Item.get("dieting pill"))}`, "blue");
			if (itemAmount(Item.get("dieting pill")) < desiredPills)
			{
				runChoice(6); // if meets thresholds, skip to farm more dieting pills in DG
			}
			else if ((5) in availableChoiceOptions())
			{
				runChoice(5); // -11 evil, +50 each substat with Candy Cane Sword Cane
			}
			else {
				runChoice(4); // fight swarm of ghuol whelps
			}
		}
		else if ((5) in availableChoiceOptions())
		{
			runChoice(5); // -11 evil, +50 each substat with Candy Cane Sword Cane
		}
		else {
			runChoice(4); // fight swarm of ghuol whelps
		}
	}
	else if (choice === 527)
	{ // The Haert of Darkness (The Cyrpt)
		runChoice(1); // fight whichever version of the bonerdagon
	}
	else {
		abort("unhandled choice in cyrptChoiceHandler");
	}
}

export function cyrptEvilBonus(inCombat: boolean): number
{
	//returns value of next fight (inCombat: currently) available bonus to evil reduction
	let cyrptBonus: number = (is_pete() && getProperty("peteMotorbikeCowling") === "Ghost Vacuum" ? 1 : 0);
	cyrptBonus += (toInt(getProperty("_nightmareFuelCharges")) > 0 ? 2 : 0);
	if (inCombat)
	{
		cyrptBonus += (equippedItem(Slot.get("back")) === Item.get("unwrapped knock-off retro superhero cape") && auto_is_valid$2(Skill.get("Slay the Dead")) && getProperty("retroCapeSuperhero") === "vampire" && getProperty("retroCapeWashingInstructions") === "kill" && itemType(equippedItem(Slot.get("weapon"))) === "sword" ? 1 : 0);
		cyrptBonus += (equippedItem(Slot.get("hat")) === Item.get("gravy boat") && auto_is_valid(Item.get("gravy boat")) ? 1 : 0);
	}
	else {
		cyrptBonus += (auto_hasRetrocape() && auto_is_valid$2(Skill.get("Slay the Dead")) && auto_forceEquipSword(true) ? 1 : 0);
		cyrptBonus += (possessEquipment(Item.get("gravy boat")) && auto_is_valid(Item.get("gravy boat")) ? 1 : 0);
	}
	return cyrptBonus;
}

export function cyrptEvilBonus$1(): number
{
	return cyrptEvilBonus(false);
}

function useNightmareFuelIfPossible(): void
{
	// chews this when there are no guaranteed uses for spleen
	if (spleen_left() > 0 && itemAmount(Item.get("Nightmare Fuel")) > 0 && !isActuallyEd() && !(auto_havePillKeeper() && spleen_left() >= 3) && spleen_left() > 4 * min(auto_spleenFamiliarAdvItemsPossessed(), floor(spleen_left() / 4)))
	{ // only uses space than can't be filled with adv item
		autoChew(1, Item.get("Nightmare Fuel"));
	}
}

function knockOffCapePrep(): void
{
	if (auto_configureRetrocape("vampire", "kill"))
	{
		if (haveEffect(Effect.get("Iron Palms")) > 0 && auto_have_skill(Skill.get("Iron Palm Technique")))
		{
			//slay the dead needs the sword to count as a sword and not as a club
			useSkill(1, Skill.get("Iron Palm Technique"));
		}
		auto_forceEquipSword$1();
	}
}

function L7_defiledAlcove(): boolean
{
	const evilBonus: number = cyrptEvilBonus$1();

	if (internalQuestStatus("questL07Cyrptic") !== 0 || toInt(getProperty("cyrptAlcoveEvilness")) === 0)
	{
		return false;
	}

	if (toInt(getProperty("cyrptAlcoveEvilness")) > 13 && auto_habitatMonster() === Monster.get("modern zmobie"))
	{
		if (auto_backupUsesLeft() > 0)
		{
			// do something else if we have modern zmobie Habitants & can backup. Don't need to adventure in this zone.
			return false;
		}
		if (toInt(getProperty("cyrptAlcoveEvilness")) <= 13 + auto_habitatFightsLeft() * (cyrptEvilBonus$1() + 5))
		{
			// we have enough Habitants to get to 13 or less evilness. Don't need to adventure in this zone.
			return false;
		}
	}

	if (isActuallyEd() && (!haveSkill(Skill.get("More Legs")) || expectedDamage(Monster.get("modern zmobie")) + 15 > myMaxhp()))
	{
		// Ed needs to be able to survive long enough to do stuff in combat vs a modern zmobie.
		return false;
	}

	if (toInt(getProperty("cyrptAlcoveEvilness")) > 14 + evilBonus)
	{
		provideInitiative$2(850, Location.get("The Defiled Alcove"), true);
		addToMaximize("100initiative 850max");
	}

	autoEquip$1(Item.get("gravy boat"));
	knockOffCapePrep();

	if (toInt(getProperty("cyrptAlcoveEvilness")) >= 16 + evilBonus)
	{
		useNightmareFuelIfPossible();
	}

	auto_log_info(`The Alcove! (${initiativeModifier()})`, "blue");
	if (toInt(getProperty("cyrptAlcoveEvilness")) <= 13)
	{
		setProperty("auto_nextEncounter", "conjoined zmombie");
	}
	return autoAdv$2(Location.get("The Defiled Alcove"));
}

export function L7_defiledNook(): boolean
{
	const evilBonus: number = cyrptEvilBonus$1();
	// current mafia bug causes us to lose track of the amount of Evil Eyes in inventory so adding a refresh here
	cliExecute("refresh inv");
	// in KoE, skeleton astronauts are random encounters that drop Evil Eyes.
	// we might be able to reach the Nook boss without adventuring.

	while (itemAmount(Item.get("evil eye")) > 0 && auto_is_valid(Item.get("evil eye")) && toInt(getProperty("cyrptNookEvilness")) > 13)
	{
		use(1, Item.get("evil eye"));
	}

	const skip_in_koe: boolean = in_koe() && toInt(getProperty("cyrptNookEvilness")) > 13 && getProperty("questL12HippyFrat") !== "finished";

	if (toInt(getProperty("cyrptNookEvilness")) > 0 && lar_repeat(Location.get("The Defiled Nook")) && !skip_in_koe)
	{
		auto_log_info("The Nook!", "blue");
		autoEquip$1(Item.get("gravy boat"));
		knockOffCapePrep();

		if (toInt(getProperty("cyrptNookEvilness")) > 14 + evilBonus && auto_is_valid(Item.get("evil eye")))
		{
			//evil eyes have 20% drop rate
			provideItem$2(400, Location.get("The Defiled Nook"), false);
		}

		if (toInt(getProperty("cyrptNookEvilness")) <= 13)
		{
			setProperty("auto_nextEncounter", "giant skeelton");
		}
		return autoAdv$2(Location.get("The Defiled Nook"));
	}
	else if (skip_in_koe)
	{
		auto_log_debug$1("In Exploathing, skipping Defiled Nook until we get more evil eyes.");
	}
	return false;
}

function L7_defiledNiche(): boolean
{
	const evilBonus: number = cyrptEvilBonus$1();

	if (toInt(getProperty("cyrptNicheEvilness")) > 13 && auto_habitatMonster() === Monster.get("dirty old lihc"))
	{
		if (toInt(getProperty("cyrptNicheEvilness")) <= 13 + auto_habitatFightsLeft() * (cyrptEvilBonus$1() + 3))
		{
			// we have enough Habitants to get to 13 or less evilness. Don't need to adventure in this zone.
			return false;
		}
	}

	if (toInt(getProperty("cyrptNicheEvilness")) > 0 && lar_repeat(Location.get("The Defiled Niche")))
	{
		if (myDaycount() === 1 && toInt(getProperty("_hipsterAdv")) < 7 && isUnrestricted(Familiar.get("Artistic Goth Kid")) && auto_have_familiar(Familiar.get("Artistic Goth Kid")))
		{
			handleFamiliar$1(Familiar.get("Artistic Goth Kid"));
		}
		autoEquip$1(Item.get("gravy boat"));
		// prioritize extinguisher over slay the dead in Defiled Niche if its available and unused in the cyrpt
		if (auto_FireExtinguisherCombatString(Location.get("The Defiled Niche")) === "")
		{
			knockOffCapePrep();
		}

		if (auto_have_familiar(Familiar.get("Space Jellyfish")) && toInt(getProperty("_spaceJellyfishDrops")) < 3)
		{
			handleFamiliar$1(Familiar.get("Space Jellyfish"));
		}
		else if (auto_have_familiar(Familiar.get("Nosy Nose")) && auto_is_valid$2(Skill.get("Get a Good Whiff of This Guy")) && (auto_combat_appearance_rates$1(Location.get("The Defiled Niche")).get(Monster.get("dirty old lihc")) ?? auto_combat_appearance_rates$1(Location.get("The Defiled Niche")).set(Monster.get("dirty old lihc"), 0.0).get(Monster.get("dirty old lihc"))) < 100)
		{
			let nosyOldLihcs: boolean = false;
			if (toInt(getProperty("cyrptNicheEvilness")) > 17 + 2 * evilBonus)
			{
				nosyOldLihcs = true; //several dirty old lihc worth of evilness left so want to whiff dirty old lihc if we meet one
			}
			else if (toMonster(getProperty("nosyNoseMonster")) === Monster.get("dirty old lihc") && toInt(getProperty("cyrptNicheEvilness")) > 14 + evilBonus)
			{
				nosyOldLihcs = true; //familiar whiff skill is increasing chances of dirty old lihc
			}
			if (nosyOldLihcs)
			{
				handleFamiliar$1(Familiar.get("Nosy Nose"));
			}
		}

		if (toInt(getProperty("cyrptNicheEvilness")) >= 16 + evilBonus)
		{
			useNightmareFuelIfPossible();
		}

		auto_log_info("The Niche!", "blue");
		if (canSniff(Monster.get("dirty old lihc"), Location.get("The Defiled Niche")) && toInt(getProperty("cyrptNicheEvilness")) >= 14 + evilBonus && auto_mapTheMonsters())
		{
			auto_log_info$1("Attemping to use Map the Monsters to olfact a Dirty Old Lihc.");
		}
		if (toInt(getProperty("cyrptNicheEvilness")) <= 13)
		{
			setProperty("auto_nextEncounter", "gargantulihc");
		}
		return autoAdv$2(Location.get("The Defiled Niche"));
	}
	return false;
}

function L7_defiledCranny(): boolean
{
	const evilBonus: number = cyrptEvilBonus$1();

	if (toInt(getProperty("cyrptCrannyEvilness")) > 0)
	{
		if (is_professor())
		{ //don't do if we are the Professor. Death Rattlin' = Beaten Up
			return false;
		}
		auto_log_info("The Cranny!", "blue");

		if (myMp() > 60)
		{
			handleBjornify(Familiar.get("Grimstone Golem"));
		}

		autoEquip$1(Item.get("gravy boat"));
		knockOffCapePrep();

		if (auto_is_valid$3(Effect.get("Emotional Vaccine")))
		{
			spacegateVaccine(Effect.get("Emotional Vaccine"));
		}

		if (auto_have_familiar(Familiar.get("Space Jellyfish")) && toInt(getProperty("_spaceJellyfishDrops")) < 3)
		{
			handleFamiliar$1(Familiar.get("Space Jellyfish"));
		}

		if (toInt(getProperty("cyrptCrannyEvilness")) >= 17 + evilBonus)
		{
			useNightmareFuelIfPossible();
		}

		if (in_darkGyffte() && haveSkill(Skill.get("Flock of Bats Form")) && haveSkill(Skill.get("Sharp Eyes")) || auto_turbo())
		{
			let desiredPills: number = (inHardcore() ? 6 : (auto_turbo() ? 3 : 4));
			let dietingPillsUsed: number = 0;
			if (getProperty("auto_chewed") === "")
			{
				dietingPillsUsed = 0;
			}
			else {
				for (const str of splitString(getProperty("auto_chewed"), ","))
				{
					if (containsText(toLowerCase(str), "dieting pill"))
					{
						dietingPillsUsed += 1;
					}
				}
			}
			if (!auto_turbo())
			{
				desiredPills -= myFullness() / 2;
			}
			else {
				desiredPills -= dietingPillsUsed;
			}
			auto_log_info(`We want ${desiredPills} dieting pills and have ${itemAmount(Item.get("dieting pill"))}`, "blue");
			if (itemAmount(Item.get("dieting pill")) < desiredPills)
			{
				//dieting pills have 10% drop rate
				provideItem$2(900, Location.get("The Defiled Cranny"), false);
			}
		}

		auto_MaxMLToCap(auto_convertDesiredML(149), true);

		addToMaximize(`200ml ${auto_convertDesiredML(149)}max`);

		if (toInt(getProperty("cyrptCrannyEvilness")) <= 13)
		{
			setProperty("auto_nextEncounter", "huge ghuol");
		}
		return autoAdv$2(Location.get("The Defiled Cranny"));
	}
	return false;
}

export function L7_crypt(): boolean
{
	if (internalQuestStatus("questL07Cyrptic") !== 0)
	{
		return false;
	}
	if (itemAmount(Item.get("chest of the Bonerdagon")) === 1)
	{
		equipStatgainIncreasers$2();
		use(1, Item.get("chest of the Bonerdagon"));
		return false;
	}
	// make sure quest status is correct before we attempt to adventure.
	visitUrl("crypt.php");
	use(1, Item.get("Evilometer"));

	const evilBonus: number = cyrptEvilBonus$1();

	if (L7_defiledAlcove())
	{
		return true;
	}
	// delay remaining crypt zones for cold medicine cabinet usage unless we have run out of other stuff to do
	// crypt is underground so it will generate breathitins, 5 turns free outside
	// allow adventuring in Alcove (above) since many backup charges get used for modern zmobies
	// not delaying better distributes these charges across days
	if (auto_reserveUndergroundAdventures())
	{
		return false;
	}

	if (L7_defiledNook())
	{
		return true;
	}

	if (L7_defiledNiche())
	{
		return true;
	}

	if (L7_defiledCranny())
	{
		return true;
	}
	// handle crypt boss
	if (toInt(getProperty("cyrptTotalEvilness")) <= 0 || toInt(getProperty("cyrptTotalEvilness")) === 999)
	{
		if (myClass() === Class.get("Seal Clubber") && auto_have_skill(Skill.get("Iron Palm Technique")) && haveEffect(Effect.get("Iron Palms")) === 0)
		{
			//if this was toggled off for retrocape slay the dead it can be toggled back on now
			useSkill(1, Skill.get("Iron Palm Technique"));
		}

		if (myPrimestat() === Stat.get("Muscle"))
		{
			auto_buyUpTo(1, Item.get("Ben-Gal&trade; Balm"));
			buffMaintain$4(Effect.get("Go Get 'Em, Tiger!"));
			auto_buyUpTo(1, Item.get("blood of the Wereseal"));
			buffMaintain$4(Effect.get("Temporary Lycanthropy"));
		}
		//AoSOL buffs
		if (in_aosol())
		{
			buffMaintain$3(Effect.get("Queso Fustulento"), 10, 1, 10);
			buffMaintain$3(Effect.get("Tricky Timpani"), 30, 1, 10);
			if (auto_haveGreyGoose()) {
				handleFamiliar$1(Familiar.get("Grey Goose"));
			}
		}

		acquireHP();
		if (auto_have_familiar(Familiar.get("Machine Elf")))
		{
			handleFamiliar$1(Familiar.get("Machine Elf"));
		}
		auto_change_mcd(10); // get vertebra to make the necklace.
		setProperty("auto_nextEncounter", "Bonerdagon");
		setProperty("auto_nonAdvLoc", true.toString());
		const tryBoner: boolean = autoAdv$1(1, Location.get("Haert of the Cyrpt"));
		council();
		cliExecute("refresh quests");
		if (itemAmount(Item.get("chest of the Bonerdagon")) === 1)
		{
			equipStatgainIncreasers$2();
			use(1, Item.get("chest of the Bonerdagon"));
			auto_badassBelt(); // mafia doesn't make this any more even if autoCraft = true for some random reason so lets do it manually.
		}
		else if (getProperty("questL07Cyrptic") === "finished")
		{
			auto_log_warning("Looks like we don't have the chest of the bonerdagon but KoLmafia marked Cyrpt quest as finished anyway. Probably some weird path shenanigans.", "red");
		}
		else if (!tryBoner)
		{
			auto_log_warning("We tried to kill the Bonerdagon because the cyrpt was defiled but couldn't adventure there and the chest of the bonerdagon is gone so we can't check that. Anyway, we are going to assume the cyrpt is done now.", "red");
		}
		else {
			abort("Failed to kill bonerdagon");
		}
		return true;
	}
	return false;
}

export function L7_override(): boolean
{
	//check if olfaction or banishes are being used for ongoing L7 tasks and give those priority
 	if (internalQuestStatus("questL07Cyrptic") !== 0)
	{
		return false;
	}

	if (toInt(getProperty("cyrptNookEvilness")) <= 14 && toInt(getProperty("cyrptNicheEvilness")) <= 14)
	{
		return false;
	}

	const evilBonus: number = cyrptEvilBonus$1();
	if (toInt(getProperty("cyrptNookEvilness")) > 14 + evilBonus && isBanished(Monster.get("party skelteon")))
	{
		auto_log_info$1("Trying to check on the ongoing Nook before moving on to a different task");
		if (L7_crypt()) { return true; }
	}
	if (toInt(getProperty("cyrptNicheEvilness")) > 14 + evilBonus)
	{
		const lihcbanihced: boolean = isBanished(Monster.get("basic lihc")) || isBanished(Monster.get("senile lihc")) || isBanished(Monster.get("slick lihc"));
		if (lihcbanihced || isSniffed$1(Monster.get("dirty old lihc")))
		{
			auto_log_info$1("Trying to check on the ongoing Niche before moving on to a different task");
			if (L7_crypt()) { return true; }
		}
	}
	return false;
}