import { abort, availableAmount, containsText, council, Effect, getProperty, haveOutfit, Item, itemAmount, Location, max, Modifier, Monster, monsterAttack, myBuffedstat, myLevel, myPath, myPrimestat, numericModifier, Path, setProperty, Slot, Stat, toBoolean, toInt, towerDoor } from "kolmafia";
import { LX_burnDelay } from "../../autoscend";
import { autoAdv$1, autoAdv$2 } from "../auto_adventure";
import { buffMaintain$4 } from "../auto_buff";
import { auto_breakfastCounterVisit } from "../auto_consume";
import { auto_getAllEquipabble$1, autoEquip$1, possessEquipment } from "../auto_equipment";
import { LX_attemptPowerLevel, LX_freeCombatsTask } from "../auto_powerlevel";
import { auto_earlyRoutingHandling } from "../auto_routing";
import { auto_log_warning, auto_log_warning$1, internalQuestStatus, LX_summonMonster, woods_questStart } from "../auto_util";
import { zone_isAvailable$1 } from "../auto_zone";
import { canDrinkSpeakeasyDrink } from "../iotms/clan";
import { chateauPainting } from "../iotms/mr2015";
import { catBurglarHeist } from "../iotms/mr2018";
import { LX_unlockPirateRealm } from "../iotms/mr2019";
import { L2_mosquito } from "../quests/level_02";
import { L3_tavern } from "../quests/level_03";
import { L4_batCave } from "../quests/level_04";
import { L5_findKnob, L5_getEncryptionKey, L5_slayTheGoblinKing } from "../quests/level_05";
import { L6_friarsGetParts } from "../quests/level_06";
import { L7_crypt } from "../quests/level_07";
import { L8_trapperQuest } from "../quests/level_08";
import { bridgeGoal, finishBuildingSmutOrcBridge, L9_chasmBuild, L9_highLandlord, L9_leafletQuest, LX_loggingHatchet } from "../quests/level_09";
import { L10_airship, L10_basement, L10_ground, L10_holeInTheSkyUnlock, L10_plantThatBean, L10_topFloor } from "../quests/level_10";
import { L11_aridDesert, L11_blackMarket, L11_defeatEd, L11_forgedDocuments, L11_getBeehive, L11_hiddenCity, L11_hiddenCityZones, L11_mauriceSpookyraven, L11_mcmuffinDiary, L11_palindome, L11_shenCopperhead, L11_shenStartQuest, L11_talismanOfNam, L11_unlockEd, L11_unlockHiddenCity, L11_unlockPyramid, LX_danceWithLadySpookyraven, LX_getLadySpookyravensDancingShoes, LX_getLadySpookyravensFinestGown, LX_getLadySpookyravensPowderPuff, LX_spookyravenManorFirstFloor, LX_spookyravenManorSecondFloor, LX_unlockHauntedBilliardsRoom, LX_unlockHauntedBilliardsRoom$1, LX_unlockHauntedLibrary, LX_unlockHiddenTemple, LX_unlockManorSecondFloor, shenShouldDelayZone } from "../quests/level_11";
import { L12_clearBattlefield, L12_farm, L12_filthworms, L12_finalizeWar, L12_flyerFinish, L12_getOutfit, L12_gremlins, L12_lastDitchFlyer, L12_opportunisticWarStart, L12_orchardFinalize, L12_preOutfit, L12_sonofaBeach, L12_sonofaFinish, L12_sonofaPrefix, L12_startWar, L12_themtharHills } from "../quests/level_12";
import { L13_sorceressDoor, L13_towerNSFinal, L13_towerNSNagamar, L13_towerNSTower } from "../quests/level_13";
import { LX_fatLootToken, LX_hippyBoatman, LX_lockPicking, LX_setWorkshed, LX_unlockDesert, startHippyBoatmanSubQuest } from "../quests/level_any";
import { finishMeatsmithSubQuest, LX_acquireEpicWeapon, LX_galaktikSubQuest, LX_guildUnlock, LX_joinPirateCrew, LX_pirateOutfit, LX_pirateQuest, LX_steelOrgan, LX_unlockKnobMenagerie, numPirateInsults, startArmorySubQuest, startMeatsmithSubQuest } from "../quests/optional";

// These are listed in the order they will be iterated (item id ascending) to make debugging easier.
const lowKeys: Map<Item, Location> = new Map();
lowKeys.set(Item.get("clown car key"), Location.get("The \"Fun\" House"));
lowKeys.set(Item.get("batting cage key"), Location.get("The Bat Hole Entrance"));
lowKeys.set(Item.get("aqu&iacute;"), Location.get("South of the Border"));
lowKeys.set(Item.get("knob labinet key"), Location.get("Cobb's Knob Laboratory"));
lowKeys.set(Item.get("weremoose key"), Location.get("Cobb's Knob Menagerie, Level 2"));
lowKeys.set(Item.get("peg key"), Location.get("The Obligatory Pirate's Cove"));
lowKeys.set(Item.get("kekekey"), Location.get("The Valley of Rof L'm Fao"));
lowKeys.set(Item.get("rabbit's foot key"), Location.get("The Dire Warren"));
lowKeys.set(Item.get("knob shaft skate key"), Location.get("The Knob Shaft"));
lowKeys.set(Item.get("ice key"), Location.get("The Icy Peak"));
lowKeys.set(Item.get("anchovy can key"), Location.get("The Haunted Pantry"));
lowKeys.set(Item.get("cactus key"), Location.get("The Arid, Extra-Dry Desert"));
lowKeys.set(Item.get("f'c'le sh'c'le k'y"), Location.get("The F'c'le"));
lowKeys.set(Item.get("treasure chest key"), Location.get("Belowdecks"));
lowKeys.set(Item.get("demonic key"), Location.get("Pandamonium Slums"));
lowKeys.set(Item.get("key sausage"), Location.get("Cobb's Knob Kitchens"));
lowKeys.set(Item.get("knob treasury key"), Location.get("Cobb's Knob Treasury"));
lowKeys.set(Item.get("scrap metal key"), Location.get("The Old Landfill"));
lowKeys.set(Item.get("black rose key"), Location.get("The Haunted Conservatory"));
lowKeys.set(Item.get("actual skeleton key"), Location.get("The Skeleton Store"));
lowKeys.set(Item.get("music box key"), Location.get("The Haunted Nursery"));
lowKeys.set(Item.get("deep-fried key"), Location.get("Madness Bakery"));
lowKeys.set(Item.get("discarded bike lock key"), Location.get("The Overgrown Lot"));

//Defined in autoscend/paths/low_key_summer.ash
export function in_lowkeysummer(): boolean
{
	return myPath() === Path.get("Low Key Summer");
}

export function lowkey_initializeSettings(): void
{
	if (!in_lowkeysummer())
	{
		return;
	}
	// TODO?
}

function lowkey_needKey(key: Item): boolean
{
	if (internalQuestStatus("questL13Final") !== 5)
	{
		return false;
	}

	return availableAmount(key) === 0 && !containsText(getProperty("nsTowerDoorKeysUsed"), key.toString());
}

function lowkey_keyDelayRemaining(loc: Location): number
{
	if (!in_lowkeysummer())
	{
		return 0;
	}

	return max(11 - loc.turnsSpent, 0);
}

function lowkey_keysRemaining(): number
{
	if (!in_lowkeysummer())
	{
		return 0;
	}

	let found: number = 0;
	for (const key of lowKeys.keys())
	{
		const loc: Location = (lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key));
		if (!lowkey_needKey(key))
		{
			found++;
		}
	}

	return 23 - found;
}

function lowkey_levelNeededToUnlockZone(loc: Location): number
{
	// returns level under which it is normal for the key zones not to be accessible in the path
	switch (loc)
	{
		case Location.get("The Arid, Extra-Dry Desert"):
			return 11;
		case Location.get("Belowdecks"):
			return 11;
		case Location.get("The Valley of Rof L'm Fao"):
			return 9;
		case Location.get("The Icy Peak"):
			return 8;
		case Location.get("The Old Landfill"):
			return 6;
		case Location.get("Cobb's Knob Laboratory"):
			return 5;
		case Location.get("Cobb's Knob Menagerie, Level 2"):
			return 5;
		case Location.get("The Knob Shaft"):
			return 5;
		case Location.get("Cobb's Knob Kitchens"):
			return 5;
		case Location.get("Cobb's Knob Treasury"):
			return 5;
		case Location.get("The Bat Hole Entrance"):
			return 4;
		default:
			return 1;
	}
}
// order is subjective
function lowkey_nextKeyLocation(checkAvailable: boolean): Location
{
	if (!in_lowkeysummer())
	{
		return Location.none;
	}

	for (const key of lowKeys.keys())
	{
		const loc: Location = (lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key));
		if (lowkey_needKey(key))
		{
			if (!checkAvailable || zone_isAvailable$1(loc))
			{
				return (lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key));
			}
		}
	}

	return Location.none;
}

function lowkey_nextKeyLocation$1(): Location
{
	return lowkey_nextKeyLocation(false);
}

function lowkey_nextAvailableKeyLocation(): Location
{
	return lowkey_nextKeyLocation(true);
}

export function lowkey_nextAvailableKeyDelayLocation(): Location
{
	if (!in_lowkeysummer())
	{
		return Location.none;
	}

	for (const key of lowKeys.keys())
	{
		const loc: Location = (lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key));
		if (lowkey_needKey(key) && zone_isAvailable$1(loc) && lowkey_keyDelayRemaining(loc) > 0 && loc.wanderers)
		{
			return loc;
		}
	}

	return Location.none;
}

function lowkey_keyAdv(key: Item): boolean
{
	if (!lowkey_needKey(key))
	{
		return false;
	}

	const loc: Location = (lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key));
	if (!zone_isAvailable$1(loc))
	{
		return false;
	}
	// Pirate equipment
	if (Location.get(["The F'c'le", "Belowdecks"]).includes(loc))
	{
		if (possessEquipment(Item.get("pirate fledges")))
		{
			autoEquip$1(Item.get("pirate fledges"));
		}
		else if (haveOutfit("swashbuckling getup"))
		{
			autoEquip$1(Item.get("eyepatch"));
			autoEquip$1(Item.get("swashbuckling pants"));
			autoEquip$1(Item.get("stuffed shoulder parrot"));
		}
		else {
			// Shouldn't get here due to zone_isAvailable check
			return false;
		}
	}

	return autoAdv$1(1, loc);
}

function lowkey_zoneUnlocks(): boolean
{
	if (startHippyBoatmanSubQuest())
	{
		// opens The Old Landfill for scrap metal key (+20% to all Moxie Gains)
		return true;
	}

	if (startArmorySubQuest())
	{
		// opens Madness Bakery for deep-fried key (+3 sleaze res, +15 sleaze dmg, +30 sleaze spell dmg)
		return true;
	}

	if (startMeatsmithSubQuest() || finishMeatsmithSubQuest()) {
		// opens The Skeleton Store for actual skeleton key (100 DA, 10 DR)
		return true;
	}

	return false;
}

function LX_findHelpfulLowKey(): boolean
{
	if (!in_lowkeysummer())
	{
		return false;
	}

	if (internalQuestStatus("questL13Final") !== 5)
	{
		return false;
	}

	if (lowkey_zoneUnlocks())
	{
		return true;
	}
	// mainstat
	if (myLevel() < 13)
	{
		// needs knob lab access
		if (myPrimestat() === Stat.get("Muscle") && lowkey_keyAdv(Item.get("knob labinet key"))) { return true; }
		// needs accept landfil quest
		if (myPrimestat() === Stat.get("Moxie") && (LX_hippyBoatman() || lowkey_keyAdv(Item.get("scrap metal key")))) { return true; }
		// Needs Pandamonium access
		if (myPrimestat() === Stat.get("Mysticality") && lowkey_keyAdv(Item.get("demonic key"))) { return true; }
	}
	// familiar weight
	if (!possessEquipment(Item.get("black rose key")))
	{
		if (myBuffedstat(Stat.get("Moxie")) < monsterAttack(Monster.get("skeletal cat")))
		{
			//conservatory is available when very underleveled so going there this early can be dangerous
			buffMaintain$4(Effect.get("Vital"));
		}
		if (lowkey_keyAdv(Item.get("black rose key"))) { return true; }
	}
	// -combat. Key sausage needs Cobb's Knob Access
	if (lowkey_keyAdv(Item.get("key sausage"))) { return true; }
	// +item
	// Treasure chest key needs Belowdecks access
	if (lowkey_keyAdv(Item.get("treasure chest key"))) { return true; }
	// +meat. Knob treasury key needs Cobb's Knob Access. Kekekey needs The Valley of Rof L'm Fao access.
	if (lowkey_keyAdv(Item.get("kekekey"))) { return true; }
	if (myPrimestat() !== Stat.get("Mysticality") || possessEquipment(Item.get("demonic key"))) {
		// all these locations unlock at the same time but for a myst class we should only get
		//  the -combat key from Cobb's Knob (above) to speed up the friars before we have the +20% myst xp key
		// +adv. Knob shaft skate key needs Cobb's Knob lab key for access to Knob Shaft
		if (lowkey_keyAdv(Item.get("knob shaft skate key"))) { return true; }
		//will probably get Cobb's Knob lab key here if still missing it
		if (lowkey_keyAdv(Item.get("knob treasury key"))) { return true; }
		// Knob labinet key to unlock Menagerie. needs Cobb's Knob lab key for access to the lab
		if (itemAmount(Item.get("Cobb's Knob Menagerie key")) < 1 && lowkey_keyAdv(Item.get("knob labinet key"))) { return true; }
	}

	if (internalQuestStatus("questL08Trapper") === 1 && itemAmount(Item.get("goat cheese")) < 3) {
		// food drop key for Goatlet
		if (lowkey_keyAdv(Item.get("anchovy can key"))) { return true; }
	}

	if (internalQuestStatus("questL09Topping") > 0 && internalQuestStatus("questL09Topping") < 3) {
		// +ml (before oil peak)
		// F'c'le sh'c'le k'y needs F'c'le access
		if (lowkey_keyAdv(Item.get("f'c'le sh'c'le k'y"))) { return true; }
		// Clown car key needs "Fun" house access, may be delayed for shen
		if (lowkey_keyAdv(Item.get("clown car key"))) { return true; }
		// cold res before aboo. Needs Icy Peak Access
		if (lowkey_keyAdv(Item.get("ice key"))) { return true; }
		// spooky res before aboo. Needs Menagerie access.
		if (lowkey_keyAdv(Item.get("weremoose key"))) { return true; }
	}
	// sleaze damage before red zeppelin
	if (internalQuestStatus("questL11Ron") > -1 && internalQuestStatus("questL11Ron") < 2) {
		if (lowkey_keyAdv(Item.get("deep-fried key"))) { return true; }
		// Clown car key needs "Fun" house access, may be delayed for shen
		if (lowkey_keyAdv(Item.get("clown car key"))) { return true; }
	}
	// cold spell damage before orcs. Ice Key needs The Icy Peak access
	if (internalQuestStatus("questL09Topping") === 0 && toInt(getProperty("chasmBridgeProgress")) < bridgeGoal())
	{
		if (lowkey_keyAdv(Item.get("ice key"))) { return true; }
	}
	// +combat before sonofa or pirate insults. Music Box Key needs Spookyraven Manor third floor access
	if (internalQuestStatus("questM12Pirate") === 4 && numPirateInsults() < 6)
	{
		if (lowkey_keyAdv(Item.get("music box key"))) { return true; }
	}
	//unlocking third floor access and Music Box Key will both be called directly when about to do sonofa

	return false;
}

export function L13_sorceressDoorLowKey(): boolean
{
	if (!in_lowkeysummer())
	{
		return false;
	}

	if (internalQuestStatus("questL13Final") !== 5)
	{
		return false;
	}

	const loc: Location = lowkey_nextAvailableKeyLocation();

	if (loc === Location.none)
	{
		const remaining: number = lowkey_keysRemaining();
		if (remaining > 0)
		{
			auto_log_warning$1("Unable to adventure for remaining low keys");
			let needHigherLevelForKey: boolean = true;
			for (const key of lowKeys.keys())
			{
				if (lowkey_needKey(key))
				{
					auto_log_warning$1(`${(lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key))}: ${key}`);
					if (myLevel() >= lowkey_levelNeededToUnlockZone((lowKeys.get(key) ?? lowKeys.set(key, Location.none).get(key))))
					{
						needHigherLevelForKey = false;
					}
				}
			}
			if (myLevel() < 11 && needHigherLevelForKey)
			{
				return false;
			}
			else {
				abort("Please unlock zones manually and try again.");
			}
		}
		// Unlock door
		council(); // make sure all quests have been handed in or turning the door knob will be blocked.
		if (getProperty("questL11MacGuffin") !== "finished" || getProperty("questL12War") !== "finished")
		{
			// should not start consuming the keys if any quests got held up somehow
			return false;
		}
		if (towerDoor()) {
			return true;
		}
		return false;
	}

	return autoAdv$1(1, loc);
}

export function LX_lowkeySummer(): boolean {

	if (!in_lowkeysummer()) { return false; }
	// Copied out of task order default.dat
	if (LX_freeCombatsTask()) { return true; }
	if (woods_questStart()) { return true; }
	if (LX_unlockPirateRealm()) { return true; }
	if (catBurglarHeist()) { return true; }
	if (auto_breakfastCounterVisit()) { return true; }
	if (chateauPainting()) { return true; }
	if (LX_setWorkshed()) { return true; }
	if (LX_galaktikSubQuest()) { return true; }
	if (L9_leafletQuest()) { return true; }
	if (L5_findKnob()) { return true; }
	if (L12_sonofaPrefix()) { return true; }
	if (LX_burnDelay()) { return true; }
	if (LX_summonMonster()) { return true; }
	// Lock in the Shen zones as soon as we can as it (potentially) unlocks a bunch of stuff.
	if (L11_shenStartQuest()) { return true; }
	// If we have everything to start the war instantly, just do it so we can start flyering.
	if (L12_opportunisticWarStart()) { return true; }
	// Build the Bridge when we have enough parts as we may want to spend daily resources at the peaks.
	if (finishBuildingSmutOrcBridge()) { return true; }
	// Call quest handlers based on current state if applicable
	if (auto_earlyRoutingHandling()) { return true; }
	// Guild access
	if (LX_guildUnlock()) { return true; }
	// Find keys that help us save adventures in quests.
	if (LX_findHelpfulLowKey()) { return true; }
	// Cobb's Knob unlocks a lot of zones which contain generally useful keys for all classes (-combat, +meat, +adv).
	// Also the +20% to all Muscle Gains key unlocks here.
	if (L5_getEncryptionKey() || L5_findKnob()) { return true; }

	if (myLevel() < 12) {
		if (myPrimestat() === Stat.get("Mysticality") && possessEquipment(Item.get("key sausage"))) {
			// Myst classes want access to Pandamonium Slums to find the demonic key (+20% to all Mysticality Gains).
			// Get the -combat key first.
			if (!possessEquipment(Item.get("demonic key")) && myBuffedstat(Stat.get("Moxie")) < monsterAttack(Monster.get("Hellion"))) {
				//starting the level 6 quest as early as possible can be dangerous?
				buffMaintain$4(Effect.get("Vital"));
			}
			if (L6_friarsGetParts()) { return true; }
		}
		else if (myPrimestat() === Stat.get("Muscle") && itemAmount(Item.get("Cobb's Knob lab key")) === 0) {
			// Mus classes want access to the laboratory to find the Knob labinet key (+20% to all Muscle Gains).
			// Have already gone after Key sausage and Knob treasury key by now, if still missing lab key give priority to the Knob
			if (L5_slayTheGoblinKing()) { return true; }
		}
	}
	// Island access for all classes. also farm the +20% to all Moxie Gains key
	// (adventuring will be handled by LX_findHelpfulLowKey() for moxie classes but this'll complete the quest)
	if (LX_hippyBoatman()) { return true; }
	// Desert access, Daily Dungeon and other early random stuff.
	if (LX_loggingHatchet() || LX_unlockDesert() || LX_lockPicking() || LX_fatLootToken()) { return true; }
	// Get the Steel Organ if the user wants it (probably good in this path since turnbloat).
	if (LX_steelOrgan()) { return true; }
	// Get the -combat key before attempting the Friars or the Spooky Forest. Unlocking hidden temple is only a priority for possible rollover lucky lindy since SemiRare no longer exist
	if (possessEquipment(Item.get("key sausage"))) {
		if (L6_friarsGetParts() || L2_mosquito() || LX_unlockHauntedLibrary() || canDrinkSpeakeasyDrink(Item.get("Lucky Lindy")) && LX_unlockHiddenTemple() || LX_getLadySpookyravensDancingShoes() || LX_getLadySpookyravensPowderPuff()) { return true; }
	}
	// If we have the resources to do the Haunted Kitchen in the minimum adventures, we should do it sooner
	// TODO this is bugged because it can exit the path file, but fixing directly can result in resistance provider constantly switching familiars and wasting a ton of time
	if (internalQuestStatus("questM20Necklace") === 0) {
		return LX_unlockHauntedBilliardsRoom(true);
	}

	if (internalQuestStatus("questL12War") > -1) {
		// Don't start the war unless we've acquired the key from Belowdecks first as it gives +item.
		// TODO these aren't the full L12 tasks, could filthworms earlier here if Yellow Ray available
		if (possessEquipment(Item.get("treasure chest key"))) {
			if (L12_preOutfit() || L12_getOutfit() || L12_startWar()) { return true; }
		} else {
			// Make sure Belowdecks is open so we can get the key.
			if (LX_pirateQuest()) { return true; }
		}

		L12_flyerFinish(); // Finish flyers whenever possible.
		// Get the +combat key before attempting Sonofa Beach.
		if (possessEquipment(Item.get("music box key"))) {
			if (L12_sonofaBeach() || L12_sonofaFinish()) { return true; }
		} else {
			// Make sure Spookyraven Third Floor is open so we can get the key.
			if (LX_spookyravenManorFirstFloor() || LX_spookyravenManorSecondFloor()) { return true; }
			if (internalQuestStatus("questL12War") === 1 && getProperty("sidequestLighthouseCompleted") === "none")
			{
				if (lowkey_keyAdv(Item.get("music box key"))) { return true; }
			}
		}
		// Check our meat accessories, grab +meat keys before attempting Themthar Hills if they'll help.
		let n_meat_drop_acc_50plus: number = 0;
		for (const [it, n] of auto_getAllEquipabble$1(Slot.get("acc1"))) {
			if (numericModifier(it, Modifier.get("Meat Drop")) >= 45 || it === Item.get("backup camera")) { // backup camera isn't always meat
				n_meat_drop_acc_50plus += n;
			}
		}
		if (n_meat_drop_acc_50plus >= 2) {
			if (L12_themtharHills()) { return true; }
		} else if (!toBoolean(getProperty("auto_skipNuns")) && (toInt(getProperty("hippiesDefeated")) >= 192 || toBoolean(getProperty("auto_hippyInstead")))) {
			// about to do nuns. Make sure The Valley is open so we can get the Kekekey.
			// opening Cobb's Knob so we can get the treasury key is already done at higher priority
			if (L9_chasmBuild() || L9_highLandlord()) { return true; }
		}
		// Do the rest of the war. Should have the +item key already before we start the war.
		if (L12_gremlins() || L12_filthworms() || L12_orchardFinalize() || L12_farm() || L12_clearBattlefield() || L12_finalizeWar()) { return true; }
	}
	// Start the macguffin quest as we need it to unlock Belowdecks.
	if (L11_blackMarket() || L11_forgedDocuments() || L11_mcmuffinDiary() || L11_getBeehive()) { return true; }
	// Lock in the Shen zones as soon as we can.
	if (L11_shenStartQuest()) { return true; }
	// Shen can still block Clown car key after zones are locked in if we don't chase the Snakeleton here
	if (internalQuestStatus("questG04Nemesis") < 5 && shenShouldDelayZone(Location.get("The Unquiet Garves")) && L11_shenCopperhead()) { return true; }
	// If the +item key is within reach before the Peaks open Belowdecks for it
	if (internalQuestStatus("questL11MacGuffin") >= 2 && LX_pirateQuest()) { return true; }

	if (internalQuestStatus("questL09Topping") > -1) {
		// Get the Sleaze res key before doing the Orcs for better Blech
		if (lowkey_keyAdv(Item.get("deep-fried key"))) { return true; }
		// Get the Cold Damage key before doing the Orcs
		// This gets blocked by the Shen softlock so do it as soon as we feasibly can as one of the +meat keys requires the L9 quest finished.
		if (possessEquipment(Item.get("ice key"))) {
			if (L9_chasmBuild()) { return true; }
		} else {
			// Make sure the Icy Peak is available so we can get the key
			if (L8_trapperQuest()) { return true; }
		}
		// Get the ML keys before doing Oil peak and Spooky Res key before doing Aboo Peak (should have Cold Res key already for the Orc Chasm).
		// Get +item key before the Peaks if questL11MacGuffin already allows it
		if (possessEquipment(Item.get("f'c'le sh'c'le k'y")) && possessEquipment(Item.get("clown car key")) && possessEquipment(Item.get("weremoose key"))) {
			if (L9_highLandlord()) { return true; }
		} else {
			// Make sure the F'c'le is open so we can get the key. Once gathering insults do it on the way to the Peg key before doing it in the barrr
			if (LX_pirateOutfit() || itemAmount(Item.get("The Big Book of Pirate Insults")) > 0 && lowkey_keyAdv(Item.get("peg key")) || LX_joinPirateCrew()) { return true; }
			// Make sure the "Fun" House is open so we can get the key
			if (LX_acquireEpicWeapon()) { return true; }
		}
	}

	if (internalQuestStatus("questL11MacGuffin") > -1) {
		// +item helps with getting fulminate ingredients, Hidden City drops and Copperhead/Zeppelin.
		if (!possessEquipment(Item.get("treasure chest key"))) {
			// Make sure Belowdecks is open so we can get the key.
			if (LX_pirateQuest()) { return true; }
		}
		// open the hidden temple if it hasn't been done yet
		if (LX_unlockHiddenTemple()) { return true; }
		// open the hidden city up.
		if (L11_unlockHiddenCity()) { return true; }
		// Dance with lady spookyraven so we can go murder her undead husband and take the Eye of Ed
		if (LX_spookyravenManorFirstFloor() || LX_spookyravenManorSecondFloor()) { return true; }
		// food drop key before Eye of Ed for the blasting soda
		if (lowkey_keyAdv(Item.get("anchovy can key"))) { return true; }
		// Murder pygmies for the ancient amulet.
		if (L11_hiddenCityZones() || L11_hiddenCity()) { return true; }
		// Finish the other Macguffin zones so we can beat Ed to death repeatedly and waste all his Ka coins.
		if (L11_aridDesert()) { return true; }
		if (possessEquipment(Item.get("treasure chest key"))) {
			if (L11_talismanOfNam() || L11_mauriceSpookyraven() || L11_palindome() || L11_unlockPyramid()) { return true; }
		}
		// should do the tavern before trying to do the pyramid so we can use any tangles we get lucky with.
		// Clown car key for tavern noncombats. needs "Fun" house access
		if (lowkey_keyAdv(Item.get("clown car key"))) { return true; }
		if (internalQuestStatus("questL03Rat") > 2) {
			if (L11_unlockEd() || L11_defeatEd()) { return true; }
		} else {
			setProperty("auto_forceTavern", true.toString());
			if (L3_tavern()) { return true; }
		}
	}
	// Open up the top of the beanstalk.
	if (L10_plantThatBean()) { //tries L4_batCave() itself if it needs to
	return true; }
	// Should have the -combat key long before level 10 but lets just make sure.
	if (possessEquipment(Item.get("key sausage"))) {
		if (L10_airship() || L10_basement() || L10_ground() || L10_topFloor() || L10_holeInTheSkyUnlock()) { return true; }
	} // Make sure Cobb's Knob is open so we can get the key is already done at higher priority
	// Ascend the peak.
	if (L8_trapperQuest()) { return true; }
	// -combat and ML keys help with 2 of these zones but this quest is a monolithic function.
	// TODO: split it up into zones then guard with possession of keys.
	if (L7_crypt()) { return true; }
	// Finish off the Goblin King.
	if (L5_slayTheGoblinKing()) { return true; }
	// Show the Boss bat who's boss.
	if (L4_batCave()) { return true; }
	// Fix that dripping tap.
	// Clown car key for tavern noncombats. needs "Fun" house access, may be delayed for shen
	if (lowkey_keyAdv(Item.get("clown car key"))) { return true; }
	else if (LX_acquireEpicWeapon()) { return true; }
	if (L3_tavern()) { return true; }
	// this quest and these zones are open either from the start or level 4.
	// so lets do this if we have nothing better to do yet.
	if (possessEquipment(Item.get("aqu&iacute;")) && possessEquipment(Item.get("batting cage key"))) {
		if (LX_unlockHauntedBilliardsRoom$1()) { return true; }
	} else {
		if (internalQuestStatus("questM20Necklace") === 0) {
			// hot res for the Haunted Kitchen. aquí needs Desert Beach Access
			if (lowkey_keyAdv(Item.get("aqu&iacute;"))) { return true; }
			// stench res for the Haunted Kitchen
			if (lowkey_keyAdv(Item.get("batting cage key"))) { return true; }
		}
	}
	// open the hidden temple if not already done at higher priority and not still waiting for the -combat key
	if (possessEquipment(Item.get("key sausage")) && LX_unlockHiddenTemple()) { return true; }
	// Spookyraven quest steps that don't need -combat or resists, just monster killin' (or dancing with a ghost for stats).
	if (LX_danceWithLadySpookyraven() || LX_getLadySpookyravensFinestGown() || LX_unlockManorSecondFloor()) { return true; }

	if (L12_clearBattlefield()) { // This is a mess and if it's not last, it screws up the war massively.
	return true; }
	// Stuff we need to do in this path to unlock key zones.
	if (LX_pirateQuest()) { return true; }
	if (LX_acquireEpicWeapon()) { return true; }
	// If literally nothing better to do, go find some of the keys we don't actually care about but have to find anyway.
	const loc: Location = lowkey_nextAvailableKeyLocation();
	if (loc !== Location.none && autoAdv$2(loc)) { return true; }
	// Make sure to unlock Menagerie if it wasn't done while getting Knob labinet key
	if (LX_unlockKnobMenagerie()) { return true; }
	// Make sure to go to war
	if (L12_lastDitchFlyer()) { return true; }
	// unlock the door, climb the tower, commit sorceresscide.
	if (L13_sorceressDoor() || L13_towerNSTower() || L13_towerNSNagamar() || L13_towerNSFinal()) { return true; }

	if (myLevel() < 12)
	{ //level 13 not needed for sorceress access
		if (LX_attemptPowerLevel()) { return true; }
	}


	auto_log_warning("Reached the end of LX_lowkeySummer task without managing to do anything. This should probably never happen.", "red");
	return false;
}