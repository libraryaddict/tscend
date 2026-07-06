import { Item, Location, Monster, Slot, availableAmount, availableChoiceOptions, canInteract, equippedItem, extractItems, getProperty, myLocation, runChoice, setProperty, toBoolean, toInt, toLocation, visitUrl } from "kolmafia";
import { autoAdvBypass } from "../auto_adventure";
import { spleen_left } from "../auto_consume";
import { auto_is_valid, auto_log_error, auto_wantToFreeKillWithNoDrops, handleTracker$1, handleTracker$2, isFreeMonster$1 } from "../auto_util";
import { zone_delay } from "../auto_zone";

// This is meant for items that have a date of 2026

export function auto_haveEternityCodpiece(): boolean
{
	if (auto_is_valid(Item.get("The Eternity Codpiece")) && availableAmount(Item.get("The Eternity Codpiece")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_isInEternityCodpiece(it: Item): boolean
{
	for (let s of Slot.get(["codpiece1", "codpiece2", "codpiece3", "codpiece4", "codpiece5"])) {
		let b = true;
		if (equippedItem(s) === it)
		{
			return true;
		}
	}
	return false;
}

//Defined in autoscend/iotms/mr2026.ash
export function auto_haveLegendarySealClubbingClub(): boolean
{
	if (auto_is_valid(Item.get("legendary seal-clubbing club")) && availableAmount(Item.get("legendary seal-clubbing club")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_clubEmBackInTimesRemaining(): number
{
	if (!auto_haveLegendarySealClubbingClub()) { return 0; }

	return 5 - toInt(getProperty("_clubEmTimeUsed"));
}

export function auto_clubEmAcrossTheBattlefieldsRemaining(): number
{
	if (!auto_haveLegendarySealClubbingClub()) { return 0; }

	return 5 - toInt(getProperty("_clubEmBattlefieldUsed"));
}

export function auto_clubEmIntoNextWeeksRemaining(): number
{
	if (!auto_haveLegendarySealClubbingClub()) { return 0; }

	return 5 - toInt(getProperty("_clubEmNextWeekUsed"));
}

export function wantToClubEmBackInTime(loc: Location, enemy: Monster): boolean
{
	// returns true if we want to use Club Em Back In Time, based off wantToThrowGravel

	if (auto_clubEmBackInTimesRemaining() === 0) { return false; }

	if (isFreeMonster$1(enemy, loc)) { // don't use free kills against inherently free fights
	return false; }

	if (canInteract()) { return false; }

	return auto_wantToFreeKillWithNoDrops(loc, enemy);
}

export function auto_haveHeartstone(): boolean
{
	if (!auto_is_valid(Item.get("Heartstone")))
	{
		return false;
	}
	if (availableAmount(Item.get("Heartstone")) > 0)
	{
		return true;
	}
	if (auto_isInEternityCodpiece(Item.get("Heartstone")))
	{
		return true;
	}
	return false;
}

export function auto_heartstoneBanishRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstoneBanishUnlocked") !== "true") { return 0; }

	return 5 - toInt(getProperty("_heartstoneBanishUsed"));
}

export function auto_heartstoneBuffsRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstoneBuffUnlocked") !== "true") { return 0; }

	return 5 - toInt(getProperty("_heartstoneBuffUsed"));
}

export function auto_heartstoneKillRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstoneKillUnlocked") !== "true") { return 0; }

	return 5 - toInt(getProperty("_heartstoneKillUsed"));
}

export function auto_heartstoneLuckRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstoneLuckUnlocked") !== "true") { return 0; }

	if (toBoolean(getProperty("_heartstoneLuckUsed")))
	{
		return 0;
	}
	return 1;
}

export function auto_heartstonePalsRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstonePalsUnlocked") !== "true") { return 0; }

	return 5 - toInt(getProperty("_heartstonePalsUsed"));
}

export function auto_heartstoneStunRemaining(): number
{
	if (!auto_haveHeartstone()) { return 0; }
	if (getProperty("heartstoneStunUnlocked") !== "true") { return 0; }

	return 5 - toInt(getProperty("_heartstoneStunUsed"));
}

export function auto_haveArchaeologistSpade(): boolean
{
	if (auto_is_valid(Item.get("Archaeologist's Spade")) && availableAmount(Item.get("Archaeologist's Spade")) > 0)
	{
		return true;
	}
	return false;
}

export function auto_spadeDigsRemaining(): number
{
	if (!auto_haveArchaeologistSpade()) { return 0; }

	return 11 - toInt(getProperty("_archSpadeDigs"));
}

export function auto_spadeDigItem(): boolean
{
	let SPADE: Item = Item.get("Archaeologist's Spade");
	let choice_adv_num: number = 1596;
	let choice_num: number = 1;
	let choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
	let use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

	let n_digs: number = auto_spadeDigsRemaining();
	if (n_digs > 0)
	{
		visitUrl(use_url);
		let result_1: string = visitUrl(choice_url);
		let drops: Map<Item, number> = new Map(Object.entries(extractItems(result_1)).map(([_k, _v]) => [Item.get(_k), _v]));
		let my_drop: Item = Item.none;
		let total_items_dropped: number = 0;
		for (let [it, n] of drops)
		{
			my_drop = it;
			total_items_dropped += n;
		}
		if (total_items_dropped !== 1)
		{
			auto_log_error(`Seem to have got ${total_items_dropped} from spade dig nearby, expecting 1.`);
			handleTracker$2(SPADE.toString(), myLocation().toString(), `Dig up something nearby reported ${total_items_dropped} drops`, "auto_otherstuff");
			return total_items_dropped !== 0;
		}
		if (n_digs > auto_spadeDigsRemaining())
		{ // check we actually have fewer digs left now before returning
			handleTracker$2(SPADE.toString(), `Dig up something nearby - ${myLocation()}`, my_drop.toString(), "auto_otherstuff");
			return true;
		}
		handleTracker$1(SPADE.toString(), "FAILED: Dig up something nearby", "auto_otherstuff");
	}
	return false;
}

export function auto_spadeDigAncient(): boolean
{
	let SPADE: Item = Item.get("Archaeologist's Spade");
	let choice_adv_num: number = 1596;
	let choice_num: number = 2;
	let choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
	let use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;
	let n_digs: number = auto_spadeDigsRemaining();
	if (n_digs > 0)
	{
		visitUrl(use_url);
		visitUrl(choice_url);
		if (n_digs > auto_spadeDigsRemaining())
		{ // check we actually have fewer digs left now before returning
			handleTracker$1(SPADE.toString(), "Dig up something ancient", "auto_otherstuff");
			return true;
		}
	}
	return false;
}

export function auto_spadeDigSkeleton(): boolean
{
	let SPADE: Item = Item.get("Archaeologist's Spade");
	let choice_adv_num: number = 1596;
	let choice_num: number = 3;
	let choice_url: string = `choice.php?pwd&whichchoice=${choice_adv_num}&option=${choice_num}`;
	let use_url: string = `inv_use.php?pwd&which=3&whichitem=${SPADE.id}`;

	let n_digs: number = auto_spadeDigsRemaining();
	if (n_digs > 0)
	{
		let pages: Map<number, string> = new Map();
		pages.set(0, use_url);
		pages.set(1, choice_url);
		let loc: Location = myLocation();
		if (autoAdvBypass(0, pages, Location.get("Noob Cave"), null)) {
			handleTracker$1(SPADE.toString(), `Dig up a skeleton - ${loc}`, "auto_otherstuff");
			return true;
		}
		handleTracker$1(SPADE.toString(), "FAILED: Dig up a skeleton", "auto_otherstuff");
	}
	return false;
}

export function auto_wantToSpadeDigSkeleton(loc: Location): boolean {
	// haunted kitchen is the only zone that calls auto_spadeDigSkeleton() and does not call this function
	// (because it's the only non-delay zone currently supported)
	let valid_loc: boolean = spadeDelayZones().has(loc);
	let have_digs: boolean = auto_spadeDigsRemaining() > 0;
	let delay_left: boolean = zone_delay(loc)._boolean;
	let zone_set: boolean = toLocation(getProperty("lastAdventure")) === loc;
	if (valid_loc && have_digs && delay_left && zone_set) {
		return true;
	}
	return false;
}

export function spadeDelayZones(): Map<Location, boolean> {
	let desired_zones: Map<Location, boolean> = new Map();
	desired_zones.set(Location.get("The Unquiet Garves"), true);
	desired_zones.set(Location.get("The Haunted Ballroom"), true);
	return desired_zones;
}

export function auto_burnRemainingSpadeDigs(): boolean
{
	let n_digs: number = auto_spadeDigsRemaining();
	for (let ii: number = 0; ii < n_digs; ii++)
	{
		auto_spadeDigAncient();
	}
	return auto_spadeDigsRemaining() === 0;
}

export function legendaryNoodlesChoiceHandler(): void {
	let target_choice: number = 0;
	// force combats if requested
	if (toBoolean(getProperty("auto_forceCombatWithLegendaryNoodles"))) {
			target_choice = 2;
			setProperty("auto_forceCombatWithLegendaryNoodles", false.toString());
	}
	else if (!toBoolean(
	// or use a spleen instead of a stomach
	getProperty("_legendaryNoodlesSpleen")) && spleen_left() > 0) { target_choice = 1; }
	else {
	// take famxp if nothing else
	target_choice = 4; }
	// sometimes options 1 and 4 aren't available, so fallback to 5 (double food effects) which always is and shouldn't ever? be detrimental
	if ((target_choice) in availableChoiceOptions()) {
		runChoice(target_choice);
	}
	else { runChoice(5); }
}