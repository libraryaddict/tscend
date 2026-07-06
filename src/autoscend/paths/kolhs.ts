import { abort, availableChoiceOptions, canInteract, Effect, equip, equippedAmount, Familiar, getProperty, haveEffect, Item, itemAmount, Location, Monster, myAdventures, myAscensions, myInebriety, myLevel, myPath, Path, putCloset, removeProperty, runChoice, setProperty, Slot, toBoolean, toFamiliar, toInt, toLocation, toMonster } from "kolmafia";
import { autoAdv$2 } from "../auto_adventure";
import { auto_autoConsumeOne$1, auto_chewAdventures, autoDrink, stomach_left } from "../auto_consume";
import { addToMaximize, autoEquip$1, autoForceEquip$1, possessEquipment } from "../auto_equipment";
import { LX_freeCombats$1 } from "../auto_powerlevel";
import { auto_log_debug$1, auto_log_info, auto_log_warning } from "../auto_util";
import { monster_to_location, zone_isAvailable } from "../auto_zone";

//Defined in autoscend/paths/kolhs.ash
export function in_kolhs(): boolean
{
	return myPath() === Path.get("KOLHS");
}

export function kolhs_mandatorySchool(): boolean
{
	//true means it is mandatory for you to attend school right now. All non school zones are unavailable. Summoning fights works though
	if (!in_kolhs())
	{
		return false; //not in the path so we are not required to attend school
	}
	return toInt(getProperty("_kolhsAdventures")) < 40;
}

export function kolhs_initializeSettings(): void
{
	if (!in_kolhs())
	{
		return;
	}

	setProperty("kolhs_closetDrink", false.toString());
}

function kolhs_closetDrink(): void
{
	//prevent kolhs issues in postronin (or drop to casual) caused by special drinks by closetting excess amount.
	//this function and related variables are needed because mafia does not track which is the last dropped kolhs combat drink.
	//we can pull leftovers/purchases. and we might have leveled since last combat when it dropped.
	if (!in_kolhs())
	{
		return;
	}
	if (!canInteract())
	{
		return; //we are not in postronin/casual
	}
	if (toBoolean(getProperty("kolhs_closetDrink")))
	{
		return; //already done this ascension
	}
	setProperty("kolhs_closetDrink", true.toString());
	//drink one first if needed so they continue to drop.
	let target: Item = Item.get("can of the cheapest beer");
	if (myLevel() > 8)
	{
		target = Item.get("single swig of vodka");
	}
	else if (myLevel() > 4)
	{
		target = Item.get("bottle of fruity &quot;wine&quot;");
	}
	if (myInebriety() < 10 && itemAmount(target) > 0)
	{
		autoDrink(1, target);
	}
	//closet all the others
	for (const it of Item.get(["single swig of vodka", "bottle of fruity &quot;wine&quot;", "can of the cheapest beer"]))
	{
		const amt: number = itemAmount(it);
		if (amt > 0)
		{
			putCloset(amt, it);
		}
	}
}

export function kolhs_consume(): void
{
	//handles consumption for KOLHS which has special drinking mechanics
	if (!in_kolhs())
	{
		return;
	}
	//KOLHS drinking mechanics is not tracked by mafia and is believed to work as per:
	//3 combat drinks drop at the end of combat, automatically costing 100 meat. not encountered in the school itself.
	//only encountered if you drank the last one that dropped today. and only if inebrity under 10.
	//this means we need to drink them as soon as they drop to allow the next one to drop. Or we end up with empty liver and out of adventures
	//[single swig of vodka] = level 9+. size 2. 2.75 adv/size
	//[bottle of fruity &quot;wine&quot;] = level 5-8. size 2. 2.5 adv/size
	//[can of the cheapest beer] = level 1-4. size 1. 2 adv/size

	if (myInebriety() < 10)
	{ //phase 1. drink these as soon as they drop. no return here because we want to eat too.
		for (const it of Item.get(["single swig of vodka", "bottle of fruity &quot;wine&quot;", "can of the cheapest beer"]))
		{
			if (itemAmount(it) > 0)
			{
				autoDrink(1, it);
			}
		}
	}

	if (stomach_left() > 0)
	{ //phase 2. fill up on food before we finish off liver
		if (myAdventures() < 10)
		{
			auto_autoConsumeOne$1("eat");
			return;
		}
		else {
			return; //if we fail to fill up stomach then do not auto consume booze in kolhs
		}
	}
	if (myAdventures() < 10)
	{ //phase 3. final drinking now that our stomach is full
		//TODO replace it with specific manual handling. autoConsumeOne says it cannot find anything to consume.
		auto_autoConsumeOne$1("drink");
		return;
	}
	//if stomach and liver are full and out of adv then chew size 4 iotm derivate spleen items that give 1.875 adv/size.
	if (auto_chewAdventures())
	{
		return;
	}
}

export function kolhs_preadv(place: Location): void
{
	if (!in_kolhs())
	{
		return;
	}
	//KOLHS path specific zones where hats are forbidden. wearing one fails to adv and causes infinite loop
	if (Location.get(["The Hallowed Halls", "Art Class", "Chemistry Class", "Shop Class"]).includes(place))
	{
		addToMaximize("-hat");
		equip(Slot.get("hat"), Item.none);
	}
	//prepare yearbook camera
	if (place === toLocation(getProperty("_yearbookCameraTargetLocation")) && !toBoolean(getProperty("yearbookCameraPending")))
	{
		if (equippedAmount(Item.get("Yearbook Club Camera")) === 0)
		{
			auto_log_warning(`Tried to adventure in [${place}] to do the yearbook camera quest without a [Yearbook Club Camera] equipped... correcting`, "red");
			autoForceEquip$1(Slot.get("acc2"), Item.get("Yearbook Club Camera"));
			if (equippedAmount(Item.get("Yearbook Club Camera")) === 0)
			{
				abort(`Correction failed, please report this. Manually photograph a [${getProperty("yearbookCameraTarget")}] then run me again`);
			}
		}
	}
}

function LX_kolhs_visitYearbookClub(): boolean
{
	//visit to yearbook club. You start the quest on one day and complete it the next day so no point in multiple visits in one day.
	//if you did not finish the quest then it changes. so you need to revisit every day regardless of completion status.
	//on first visit per ascension you acquire the camera. if you already maxed out camera no point in visiting again
	if (toBoolean(getProperty("_yearbookClubVisitedToday")))
	{
		return false; //already visited today
	}
	if (toInt(getProperty("_kolhsSavedByTheBell")) > 2)
	{
		return false; //we ran out of saved by the bell NC visits. so we cannot reach it today.
	}
	auto_log_info("Visiting the yearbook club", "blue");
	setProperty("_NC772_directive", (3).toString()); //NC772 [saved by the bell] should visit yearbook club
	return autoAdv$2(Location.get("The Hallowed Halls")); //goto NC772
}

function LX_kolhs_yearbookCameraGet(): boolean
{
	//grab the yearbook camera if you have not already done so.
	if (possessEquipment(Item.get("Yearbook Club Camera")))
	{
		return false; //already have the camera
	}
	if (kolhs_mandatorySchool())
	{
		return false; //we have not yet unlocked [saved by the bell] today
	}
	return LX_kolhs_visitYearbookClub(); //grab the camera if you did not get it yet this ascension
}

function LX_kolhs_yearbookCameraQuest(): boolean
{
	//grab a yearbook camera. do sidequest to acquire permanent between ascensions upgrades for it
	if (kolhs_mandatorySchool())
	{
		return false; //we have not yet unlocked [saved by the bell] today
	}

	if (LX_kolhs_yearbookCameraGet()) { //grab the yearbook camera if you have not already done so.
	return true; }
	//do we actually need to do the quest?
	if (toInt(getProperty("yearbookCameraAscensions")) > 20)
	{
		return false; //already maxed out permanent upgrades
	}
	if (myAscensions() === toInt(getProperty("lastYearbookCameraAscension")))
	{
		return false; //already upgraded once this ascension. only one upgrade per ascension can become permanent.
	}
	if (LX_kolhs_visitYearbookClub()) { //start, restart, or finish quest.
	return true; }

	if (toBoolean(getProperty("yearbookCameraPending")))
	{
		return false; //we finished the quest today but must wait until tomorrow to turn it in
	}
	//try to get a photograph
	const target: Monster = toMonster(getProperty("yearbookCameraTarget"));
	let adv_target: Location = Location.none;
	for (const loc of monster_to_location(target).keys())
	{
		if (zone_isAvailable(loc, true))
		{
			adv_target = loc;
			break;
		}
	}
	setProperty("_yearbookCameraTargetLocation", adv_target.toString()); //used by pre_adv to verify camera is actually equipped
	if (adv_target === Location.none)
	{
		return false; //just in case. should not be possible since it picks from reachable locations
	}

	autoEquip$1(Item.get("Yearbook Club Camera"));
	return autoAdv$2(adv_target);

	return false;
}

function LX_kolhs_school(): boolean
{
	//adventure in school. mandatory for first 40 adv to be spent there.
	if (!kolhs_mandatorySchool())
	{
		return false; //done for today
	}

	return autoAdv$2(Location.get("The Hallowed Halls"));
	//TODO specific classes https://kol.coldfront.net/thekolwiki/index.php/KoL_High_School
	//TODO sniff wastoid in hallowed halls
}

export function kolhsChoiceHandler(choice: number): void
{
	auto_log_debug$1("Running kolhsChoiceHandler");
	{
		// Delirium in the Cafeterium (KOLHS 22nd adventure every day)
				// get XP
				// get XP
				// get XP
				// lose HP
		// Saved by the Bell (KOLHS after school)
			//we use directive property. it both tells us what to do, and helps pre-adv do stuff. for example ensure we are not wearing a familiar that is blocking us

			let target: number = 0;
			switch (choice)
	{
		case 700:
			if (haveEffect(Effect.get("Jamming with the Jocks")) > 0)
			{
				runChoice(1);
			}
			else if (haveEffect(Effect.get("Nerd is the Word")) > 0)
			{
				runChoice(2);
			}
			else if (haveEffect(Effect.get("Greaser Lightnin'")) > 0)
			{
				runChoice(3);
			}
			else {
				auto_log_warning("I do not have the necessary intrinsic to gain xp in [Delirium in the Cafeterium]", "red");
				runChoice(3);
			}
			break;
		case 772:			target = toInt(getProperty("_NC772_directive"));
			removeProperty("_NC772_directive"); //remove it now in case we abort

			if (target === 0)
			{
				abort("We are in [saved by the bell] and do not know what to do because _NC772_directive is not valid or set. Leaving will waste this NC so do something manually");
			}
			if ((target) in availableChoiceOptions())
			{
				if (target === 3)
				{ //yearbook club should only be visited once daily
					setProperty("_yearbookClubVisitedToday", true.toString());
				}
				runChoice(target);
			}
			else {
				abort(`We are in [saved by the bell] and do not know what to do. Wanted to press button number ${target} but it mysteriously does not exist. Leaving will waste this NC so do something manually`);
			}
			break;
		default:
			break;
	} }
}

export function LM_kolhs(): boolean
{
	//this function is called early once every loop of doTasks() in autoscend.ash to do things when we are in kolhs
	if (!in_kolhs())
	{
		return false;
	}

	const familiar_target_100: Familiar = toFamiliar(getProperty("auto_100familiar"));
	if (familiar_target_100 !== Familiar.none && familiar_target_100 !== Familiar.get("Steam-Powered Cheerleader"))
	{
		setProperty("auto_100familiar", Familiar.none.toString());
		abort(`Detected an attempted 100% familiar run with [${familiar_target_100}] in KOLHS. [Steam Powered Cheerleader] is the only valid 100% familiar run in KOLHS. 100% familiar run disabled. You can run autoscend again to continue`);
	}

	kolhs_closetDrink(); //in postronin closet extra combat drop drinks to prevent issues

	if (LX_kolhs_school()) { //mandatory for first 40 adv to be spent in school
	return true; }
	if (LX_kolhs_yearbookCameraGet()) { //grab the yearbook camera if you have not already done so.
	return true; }
	if (myLevel() < 9)
	{ //important to rush level 9 for the superior drink drops
		if (LX_freeCombats$1(true)) { return true; }
	}
	if (LX_kolhs_yearbookCameraQuest()) { //gain permanent upgrades to yearbook camera
	return true; }
	//TODO other saved by the bell adventures as needed?

	return false;
}
