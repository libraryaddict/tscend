import { canInteract, cliExecute, council, Effect, Element, Familiar, getProperty, Item, itemAmount, Location, toBoolean, use, visitUrl } from "kolmafia";
import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv$2 } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import { autoForceEquip$3 } from "../auto_equipment";
import { handleFamiliar$1 } from "../auto_familiar";
import { provideFamExp$2, provideMeat$2, provideResistances$4 } from "../auto_providers";
import { auto_reserveUndergroundAdventures } from "../auto_routing";
import { auto_badassBelt, auto_change_mcd, auto_is_valid, auto_log_debug$1, auto_log_info, auto_log_warning, handleTracker$1, internalQuestStatus } from "../auto_util";
import { zone_available } from "../auto_zone";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { auto_haveGreyGoose } from "../iotms/mr2022";
import { auto_makeMonkeyPawWish$1 } from "../iotms/mr2023";
import { auto_haveBatWings, auto_haveChestMimic } from "../iotms/mr2024";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_amw } from "../paths/adventurer_meats_world";
import { in_aosol } from "../paths/avatar_of_shadows_over_loathing";
import { bat_formBats$1 } from "../paths/dark_gyffte";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_lol } from "../paths/legacy_of_loathing";
import { shenShouldDelayZone } from "./level_11";

function provideGuanoStenchResistance(): boolean
{
	const resGoal: Map<Element, number> = new Map();
	resGoal.set(Element.get("stench"), 1);
	// try to get the stench res without equipment, but use equipment if we must
	if (!provideResistances$4(resGoal, Location.get("Guano Junction"), false) && !provideResistances$4(resGoal, Location.get("Guano Junction"), true))
	{
		auto_log_warning("I cannae handle the stench of the Guano Junction!", "green");
		return false;
	}
	return true;
}

//Defined in autoscend/quests/level_04.ash
export function L4_batCave(): boolean
{
	if (internalQuestStatus("questL04Bat") < 0 || internalQuestStatus("questL04Bat") > 4)
	{
		return false;
	}

	auto_log_info("In the bat hole!", "blue");

	if (auto_haveBatWings())
	{
		if (!toBoolean(getProperty("batWingsBatHoleEntrance")) && zone_available(Location.get("The Bat Hole Entrance")))
		{
			autoForceEquip$3(Item.get("bat wings"));
			auto_log_info("Wearing bat wings to get a free bat wing", "green");
			handleTracker$1(Item.get("bat wings").toString(), Item.get("bat wing").toString(), "auto_otherstuff");
			return autoAdv$2(Location.get("The Bat Hole Entrance"));
		}
		else if (!toBoolean(getProperty("batWingsGuanoJunction")) && zone_available(Location.get("Guano Junction")) && provideGuanoStenchResistance())
		{
			autoForceEquip$3(Item.get("bat wings"));
			auto_log_info("Wearing bat wings to get a free sonar-in-a-biscuit", "green");
			handleTracker$1(Item.get("bat wings").toString(), Item.get("sonar-in-a-biscuit").toString(), "auto_otherstuff");
			return autoAdv$2(Location.get("Guano Junction"));
		}
		else if (!toBoolean(getProperty("batWingsBatratBurrow")) && zone_available(Location.get("The Batrat and Ratbat Burrow")))
		{
			autoForceEquip$3(Item.get("bat wings"));
			auto_log_info("Wearing bat wings to get another free sonar-in-a-biscuit", "green");
			handleTracker$1(Item.get("bat wings").toString(), Item.get("sonar-in-a-biscuit").toString(), "auto_otherstuff");
			return autoAdv$2(Location.get("The Batrat and Ratbat Burrow"));
		}
		else if (!toBoolean(getProperty("batWingsBeanbatChamber")) && zone_available(Location.get("The Beanbat Chamber")))
		{
			autoForceEquip$3(Item.get("bat wings"));
			auto_log_info("Wearing bat wings to get a free enchanted bean", "green");
			handleTracker$1(Item.get("bat wings").toString(), Item.get("enchanted bean").toString(), "auto_otherstuff");
			return autoAdv$2(Location.get("The Beanbat Chamber"));
		}
	}

	if (considerGrimstoneGolem(true))
	{
		handleBjornify(Familiar.get("Grimstone Golem"));
	}
	buffMaintain$4(Effect.get("Fishy Whiskers"));

	const batStatus: number = internalQuestStatus("questL04Bat");
	if (batStatus < 3)
	{
		if (auto_is_valid(Item.get("sonar-in-a-biscuit")))
		{
			if (itemAmount(Item.get("sonar-in-a-biscuit")) === 0 && canInteract())
			{
				auto_buyUpTo(1, Item.get("sonar-in-a-biscuit"));
			}
			if (itemAmount(Item.get("sonar-in-a-biscuit")) === 0)
			{
				// attempt to monkey wish for sonars
				auto_makeMonkeyPawWish$1(Item.get("sonar-in-a-biscuit"));
			}
			if (itemAmount(Item.get("sonar-in-a-biscuit")) > 0)
			{
				if (use(1, Item.get("sonar-in-a-biscuit")))
				{
					return true;
				}
				else {
					auto_log_warning("Failed to use Sonar-In-A-Biscuit for some reason. refreshing inventory and skipping", "red");
					visitUrl("place.php?whichplace=bathole");
					cliExecute("refresh inv");
					return false;
				}
			}
		}
	}

	if (batStatus >= 4)
	{
		if (itemAmount(Item.get("enchanted bean")) === 0 && internalQuestStatus("questL10Garbage") < 1 && !isActuallyEd())
		{
			return autoAdv$2(Location.get("The Beanbat Chamber"));
		}
		council();
		if (in_koe())
		{
			cliExecute("refresh quests");
		}
		return true;
	}

	if (batStatus >= 3)
	{
		if (auto_reserveUndergroundAdventures() && !in_lol())
		{
			return false;
		}

		provideMeat$2(50, Location.get("The Boss Bat's Lair"), false);
		//AoSOL buffs
		if (in_aosol())
		{
			buffMaintain$3(Effect.get("Queso Fustulento"), 10, 1, 10);
			buffMaintain$3(Effect.get("Tricky Timpani"), 30, 1, 10);
			if (auto_haveGreyGoose() && (Location.get("The Boss Bat's Lair")).turnsSpent >= 4) {
				handleFamiliar$1(Familiar.get("Grey Goose"));
			}
		}
		const batskinBelt: number = itemAmount(Item.get("batskin belt"));
		auto_change_mcd(4); // get the pants from the Boss Bat.
		// Let's whack some free XP on our Chest Mimic (it's a chaun)
		if (auto_haveChestMimic())
		{
			handleFamiliar$1(Familiar.get("Chest Mimic"));
			provideFamExp$2(50, Location.get("The Boss Bat's Lair"), true, false);
		}
		autoAdv$2(Location.get("The Boss Bat's Lair"));
		// POCKET FAMILIARS remove once mafia tracks this
		if (itemAmount(Item.get("batskin belt")) !== batskinBelt)
		{
			auto_badassBelt(); // mafia doesn't make this any more even if autoCraft = true for some random reason so lets do it manually.
		}
		// TODO: Mafia currently does not advance the quest tracker when the Plumber boss is defeated.
		// this breaks that infinite loop, while "refresh quests" apparently doesn't. Who knows?
		visitUrl("place.php?whichplace=bathole");
		return true;
	}
	if (batStatus >= 2)
	{
		bat_formBats$1();
		if (itemAmount(Item.get("enchanted bean")) === 0 && internalQuestStatus("questL10Garbage") < 2 && !isActuallyEd())
		{
			autoAdv$2(Location.get("The Beanbat Chamber"));
			return true;
		}
		// prioritize getting replica Mr. A in LoL
		// prioritize boss meat in amw
		if (shenShouldDelayZone(Location.get("The Batrat and Ratbat Burrow")) && !in_lol() && !in_amw())
		{
			auto_log_debug$1("Delaying Batrat Burrow in case of Shen.");
			return false;
		}
		if (auto_haveGreyGoose()) {
			handleFamiliar$1(Familiar.get("Grey Goose"));
		}
		autoAdv$2(Location.get("The Batrat and Ratbat Burrow"));
		return true;
	}
	if (batStatus >= 1)
	{
		// prioritize getting replica Mr. A in LoL
		// prioritize boss meat in amw
		if (shenShouldDelayZone(Location.get("The Batrat and Ratbat Burrow")) && !in_lol() && !in_amw())
		{
			auto_log_debug$1("Delaying Batrat Burrow in case of Shen.");
			return false;
		}
		bat_formBats$1();
		if (auto_haveGreyGoose()) {
			handleFamiliar$1(Familiar.get("Grey Goose"));
		}
		autoAdv$2(Location.get("The Batrat and Ratbat Burrow"));
		return true;
	}

	if (!provideGuanoStenchResistance())
	{
		return false;
	}

	bat_formBats$1();
	if (auto_haveGreyGoose()) {
		handleFamiliar$1(Familiar.get("Grey Goose"));
	}
	return autoAdv$2(Location.get("Guano Junction"));
}
