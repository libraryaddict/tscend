import { abort, availableAmount, canEquip, Class, containsText, Effect, Element, elementalResistance, equippedAmount, equippedItem, expectedDamage, Familiar, fuelCost, getFuel, getProperty, haveEffect, haveEquipped, haveSkill, hpCost, indexOf, isBanished, Item, itemAmount, itemDrops, itemType, lastMonster, lightningCost, Location, meatCost, Monster, monsterHp, monsterPhylum, mpCost, myAudience, myClass, myDaycount, myFamiliar, myFury, myHp, myLevel, myLightning, myLocation, myMaxhp, myMaxmp, myMeat, myMp, myPp, myRain, mySoulsauce, myThunder, Phylum, rainCost, setProperty, Skill, Slot, soulsauceCost, substring, thunderCost, toBoolean, toFloat, toInt, toItem, toSkill, trackedBy } from "kolmafia";
import { canDrink$1, inebriety_left, spleen_left } from "../auto_consume";
import { possessEquipment } from "../auto_equipment";
import { auto_famKill, auto_have_familiar, pathAllowsChangingFamiliar } from "../auto_familiar";
import { hasLeg } from "../auto_monsterparts";
import { auto_banishesUsedAt, auto_can_equip, auto_have_skill, auto_is_valid, auto_is_valid$2, auto_log_info, auto_log_warning, auto_wantToBanish, auto_wantToBanish$1, handleTracker$1, hasShieldEquipped, hasTorso$1, isFreeMonster$1, loopHandlerDelayAll, wrap_item } from "../auto_util";
import { auto_combatHandler } from "./auto_combat";
import { asdonCanMissile, auto_macrometeoritesAvailable } from "../iotms/mr2017";
import { auto_combatSaberBanish, auto_combatSaberYR, auto_reflexHammersRemaining, auto_saberChargesAvailable } from "../iotms/mr2019";
import { auto_hasRetrocape, auto_powerfulGloveReplacesAvailable } from "../iotms/mr2020";
import { auto_canFeelEnvy, auto_canFeelHatred, auto_fireExtinguisherCharges, can_get_battery } from "../iotms/mr2021";
import { auto_hasParka, getSweat } from "../iotms/mr2022";
import { auto_haveEagle, auto_isShadowRiftMonster, auto_monkeyPawWishesLeft, auto_neededShadowBricks, auto_RWBMonster } from "../iotms/mr2023";
import { auto_haveRoman } from "../iotms/mr2024";
import { auto_canNorthernExplosionFE, auto_McLargeHugeSniffsLeft, auto_throwLightningRemaining } from "../iotms/mr2025";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_avantGuard } from "../paths/avant_guard";
import { pete_peelOutRemaining } from "../paths/avatar_of_sneaky_pete";
import { inAftercore } from "../paths/casual";
import { in_glover } from "../paths/g_lover";
import { plumber_ppCost } from "../paths/path_of_the_plumber";
import { in_pokefam } from "../paths/pocket_familiars";
import { is_werewolf } from "../paths/wereprofessor";
import { in_wildfire } from "../paths/wildfire";
import { getZooKickBanish, getZooKickSniff, getZooKickYR, in_zootomist } from "../paths/zootomist";
import { hedgeTrimmersNeeded } from "../quests/level_09";
import { auto_warSide } from "../quests/level_12";
import { AshMatcher } from "../utils/kolmafiaUtils";

class $_canUse_SkillSet {
	constructor(
//this file is utility functions that are only used for combat file.
		// + combat_mana_cost_modifier() (negative value that we would add) is already included by mp_cost()
		public count: number = 0,
		public skills: Map<Skill, boolean> = new Map()
	) {}
}
let $_static_1 = false;

//defined in /autoscend/combat/auto_combat_util.ash
export function defaultRoundLimit(): number
{
	return 25;
}

export function haveUsed(sk: Skill): boolean
{
	return containsText(getProperty("_auto_combatState"), `(sk${toInt(sk).toString()})`);
}

export function haveUsed$1(it: Item): boolean
{
	return containsText(getProperty("_auto_combatState"), `(it${toInt(it).toString()})`);
}

export function usedCount(sk: Skill): number
{
	const m: AshMatcher = new AshMatcher(`(sk${toInt(sk).toString()})`, getProperty("_auto_combatState"));
	let count_1: number = 0;
	while (m.find())
	{
		++count_1;
	}
	return count_1;
}

function usedCount$1(it: Item): number
{
	const m: AshMatcher = new AshMatcher(`(it${toInt(it).toString()})`, getProperty("_auto_combatState"));
	let count_1: number = 0;
	while (m.find())
	{
		++count_1;
	}
	return count_1;
}

export function markAsUsed(sk: Skill): void
{
	setProperty("_auto_combatState", `${getProperty("_auto_combatState")}(sk${toInt(sk).toString()})`);
}

export function markAsUsed$1(it: Item): void
{
	if (it !== Item.none)
	{
		setProperty("_auto_combatState", `${getProperty("_auto_combatState")}(it${toInt(it).toString()})`);
	}
}

let $_canUse_exclusives: Map<number, $_canUse_SkillSet> | undefined;

export function canUse(sk: Skill, onlyOnce: boolean, inCombat: boolean): boolean
{
	if (onlyOnce && haveUsed(sk))
	{
		return false;
	}

	if (!auto_have_skill(sk))
	{
		return false;
	}

	if (inCombat)
	{
		if (myMp() < mpCost(sk) || myHp() <= hpCost(sk) || getFuel() < fuelCost(sk) || myLightning() < lightningCost(sk) || myThunder() < thunderCost(sk) || myRain() < rainCost(sk) || mySoulsauce() < soulsauceCost(sk) || myPp() < plumber_ppCost(sk) || myMeat() < meatCost(sk))
		{
			return false;
		}
	}
	else {
		if (myMaxmp() < mpCost(sk) || myMaxhp() <= hpCost(sk) || getFuel() < fuelCost(sk) || myLightning() < lightningCost(sk) || myThunder() < thunderCost(sk) || myRain() < rainCost(sk) || mySoulsauce() < soulsauceCost(sk) || myMeat() < meatCost(sk))
		{
			return false;
		}
	}

	if (sk === Skill.get("Shieldbutt") && !hasShieldEquipped())
	{
		return false;
	}
	$_canUse_exclusives ??= new Map();
	if (!$_static_1) {

		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(1, new Map([[Skill.get("Curse of Vichyssoise"), true], [Skill.get("Curse of Marinara"), true], [Skill.get("Curse of the Thousand Islands"), true], [Skill.get("Curse of Weaksauce"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(equippedAmount(Item.get("vampyric cloake")), new Map([[Skill.get("Become a Wolf"), true], [Skill.get("Become a Cloud of Mist"), true], [Skill.get("Become a Bat"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(1, new Map([[Skill.get("Shadow Noodles"), true], [Skill.get("Entangling Noodles"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(1, new Map([[Skill.get("Silent Slam"), true], [Skill.get("Silent Squirt"), true], [Skill.get("Silent Slice"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(equippedAmount(wrap_item(Item.get("haiku katana"))), new Map([[Skill.get("The 17 Cuts"), true], [Skill.get("Falling Leaf Whirlwind"), true], [Skill.get("Spring Raindrop Attack"), true], [Skill.get("Summer Siesta"), true], [Skill.get("Winter's Bite Technique"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(equippedAmount(Item.get("bottle-rocket crossbow")) + equippedAmount(Item.get("replica bottle-rocket crossbow")), new Map([[Skill.get("Fire red bottle-rocket"), true], [Skill.get("Fire blue bottle-rocket"), true], [Skill.get("Fire orange bottle-rocket"), true], [Skill.get("Fire purple bottle-rocket"), true], [Skill.get("Fire black bottle-rocket"), true]])));
		$_canUse_exclusives.set($_canUse_exclusives.size, new $_canUse_SkillSet(1, new Map([[Skill.get("Kodiak Moment"), true], [Skill.get("Grizzly Scene"), true], [Skill.get("Bear-Backrub"), true], [Skill.get("Bear-ly Legal"), true], [Skill.get("Bear Hug"), true]])));
		$_static_1 = true;
	}

	for (const [i, set] of $_canUse_exclusives)
	{
		if (set.skills.has(sk))
		{
			let total: number = 0;
			for (const check_1 of set.skills.keys())
			{
				total += usedCount(check_1);
			}
			if (total >= set.count)
			{
				return false;
			}
		}
	}

	return true;
}

export function canUse$1(sk: Skill, onlyOnce: boolean): boolean
{ //assume we are in combat unless specified otherwise
	return canUse(sk, onlyOnce, true);
}

export function canUse$2(sk: Skill): boolean
{ // assume onlyOnce unless specified otherwise
	return canUse$1(sk, true);
}

export function canUse$3(it: Item, onlyOnce: boolean): boolean
{
	if (onlyOnce && haveUsed$1(it))
		{ return false; }

	if (itemAmount(it) === 0)
		{ return false; }

	if (!auto_is_valid(it))
		{ return false; }

	return true;
}

export function canUse$4(it: Item): boolean
{ // assume onlyOnce unless specified otherwise
	return canUse$3(it, true);
}

export function useSkill$1(sk: Skill, mark: boolean): string
{
	if (mark)
		{ markAsUsed(sk); }

	return `skill ${sk.name}`;
}

export function useSkill$2(sk: Skill): string
{
	return useSkill$1(sk, true);
}

export function useItem(it: Item, mark: boolean): string
{
	if (mark)
		{ markAsUsed$1(it); }
	if (auto_have_skill(Skill.get("Ambidextrous Funkslinging")))
		{ //don't double use
		return `item ${it}, none`; }
	return `item ${it}`;
}

export function useItem$1(it: Item): string
{
	return useItem(it, true);
}

function useItems(it1: Item, it2: Item, mark: boolean): string
{
	if (mark)
	{
		markAsUsed$1(it1);
		markAsUsed$1(it2);
	}
	return `item ${it1}, ${it2}`;
}

export function useItems$1(it1: Item, it2: Item): string
{
	return useItems(it1, it2, true);
}

export function isSniffed(enemy: Monster, sk: Skill): boolean
{
	let search: string = "";
	if (sk === Skill.get("Get a Good Whiff of This Guy")) {
		search = "Nosy Nose";
	} else {
		search = sk.toString();
	}
	const tracked: string[] = trackedBy(enemy);
	for (const n of tracked.keys()) {
		if ((tracked[n] ??= "") === search) {
			return true;
		}
	}
	return false;
}

export function isSniffed$1(enemy: Monster): boolean
{
	//checks if the monster enemy is currently sniffed using any of the sniff skills
	for (const sk of Skill.get(["Transcendent Olfaction", "Make Friends", "Long Con", "Perceive Soul", "Gallapagosian Mating Call", "Monkey Point", "Offer Latte to Opponent", "Motif", "Hunt", "McHugeLarge Slash", "Left %n Kick", "Right %n Kick", "Meat Cute"]))
	{
		if (isSniffed(enemy, sk)) { return true; }
	}
	//nosyNoseMonster is conditional on familiar [Nosy Nose], should it ever return true for this general check?
	return false;
}

export function getSniffer(enemy: Monster, inCombat: boolean): Skill
{
	//returns the skill we want to use to sniff the enemy
	//sniffers are skills that increase the odds of encountering this same monster again in the current zone.
	if (canUse(Skill.get("Transcendent Olfaction"), true, inCombat) && toInt(getProperty("_olfactionsUsed")) < 3 && !isSniffed(enemy, Skill.get("Transcendent Olfaction")))
	{
		return Skill.get("Transcendent Olfaction");
	}
	if (canUse(Skill.get("Make Friends"), true, inCombat) && myAudience() >= 20 && !isSniffed(enemy, Skill.get("Make Friends")))
	{
		return Skill.get("Make Friends"); //avatar of sneaky pete specific skill
	}
	if (canUse(Skill.get("Hunt"), true, inCombat) && haveEffect(Effect.get("Everything Looks Red")) === 0 && !isSniffed(enemy, Skill.get("Hunt")))
	{
		return Skill.get("Hunt"); //WereProfessor Werewolf specific skill
	}
	if (canUse(Skill.get("Meat Cute"), true, inCombat) && toInt(getProperty("_meatCuteUsed")) < 5 && !isSniffed(enemy, Skill.get("Meat Cute")))
	{
		return Skill.get("Meat Cute"); //Meat Golem specific skill
	}
	if (canUse(Skill.get("Long Con"), true, inCombat) && toInt(getProperty("_longConUsed")) < 5 && !isSniffed(enemy, Skill.get("Long Con")))
	{
		return Skill.get("Long Con");
	}
	if (canUse(Skill.get("Perceive Soul"), true, inCombat) && !isSniffed(enemy, Skill.get("Perceive Soul")))
	{
		return Skill.get("Perceive Soul");
	}
	if (canUse(Skill.get("Motif"), true, inCombat) && !isSniffed(enemy, Skill.get("Motif")) && haveEffect(Effect.get("Everything Looks Blue")) === 0)
	{
		return Skill.get("Motif");
	}
	if (inCombat)
	{
		if (canUse(Skill.get("Monkey Point"), true, inCombat) && !isSniffed(enemy, Skill.get("Monkey Point")))
		{
			return Skill.get("Monkey Point");
		}
		if (canUse(Skill.get("McHugeLarge Slash"), true, inCombat) && !isSniffed(enemy, Skill.get("McHugeLarge Slash")) && auto_McLargeHugeSniffsLeft() > 0)
		{
			return Skill.get("McHugeLarge Slash");
		}
	}
	else {
		if (auto_monkeyPawWishesLeft() === 1 && !isSniffed(enemy, Skill.get("Monkey Point")))
		{
			return Skill.get("Monkey Point");
		}
		if (possessEquipment(Item.get("McHugeLarge left pole")) && !isSniffed(enemy, Skill.get("McHugeLarge Slash")) && auto_McLargeHugeSniffsLeft() > 0)
		{
			return Skill.get("McHugeLarge Slash");
		}
	}
	if (canUse(Skill.get("Gallapagosian Mating Call"), true, inCombat) && !isSniffed(enemy, Skill.get("Gallapagosian Mating Call")))
	{
		return Skill.get("Gallapagosian Mating Call");
	}
	if (myFamiliar() === Familiar.get("Nosy Nose") && canUse$2(Skill.get("Get a Good Whiff of This Guy")) && !isSniffed(enemy, Skill.get("Get a Good Whiff of This Guy")))
	{
		return Skill.get("Get a Good Whiff of This Guy");
	}
	if (canUse(Skill.get("Offer Latte to Opponent"), true, inCombat) && !toBoolean(getProperty("_latteCopyUsed")) && !isSniffed(enemy, Skill.get("Offer Latte to Opponent")))
	{
		return Skill.get("Offer Latte to Opponent");
	}
	// Zootomist kicks. We might have to move this depending on what happens with cooldowns
	const z_kick: Skill = getZooKickSniff();
	if (canUse$2(z_kick))
	{
		return z_kick;
	}

	return Skill.none;
}

export function getSniffer$1(enemy: Monster): Skill
{
	return getSniffer(enemy, true);
}

function isCopied(enemy: Monster, sk: Skill): boolean
{
	//checks if the monster enemy is currently copied using the specific skill sk
	let retval: boolean = false;
	switch (sk)
	{
		case Skill.get("Blow the Purple Candle!"):
			retval = containsText(getProperty("auto_purple_candled"), enemy.toString());
			break;
		case Skill.get("%fn, fire a Red, White and Blue Blast"):
			retval = auto_RWBMonster() === enemy;
		default:
			abort(`isCopied was asked to check an unidentified skill: ${sk}`);
	}
	return retval;
}

function isCopied$1(enemy: Monster): boolean
{
	//checks if the monster enemy is currently copied using any of the copy skills
	for (const sk of Skill.get(["Blow the Purple Candle!", "%fn, fire a Red, White and Blue Blast"]))
	{
		if (isCopied(enemy, sk)) { return true; }
	}
	return false;
}

export function getCopier(enemy: Monster, inCombat: boolean): Skill
{
	if (auto_haveRoman() && haveEffect(Effect.get("Everything Looks Purple")) === 0 || haveEquipped(Item.get("Roman Candelabra")) && canUse(Skill.get("Blow the Purple Candle!"), true, inCombat) && haveEffect(Effect.get("Everything Looks Purple")) === 0)
	{
		return Skill.get("Blow the Purple Candle!");
	}
	if (auto_haveEagle() && canUse(Skill.get("%fn, fire a Red, White and Blue Blast"), true, inCombat) && !(haveEffect(Effect.get("Everything Looks Red, White and Blue")) > 0) && enemy.copyable)
	{
		return Skill.get("%fn, fire a Red, White and Blue Blast");
	}
	return Skill.none;
}

export function getCopier$1(enemy: Monster): Skill
{
	return getCopier(enemy, true);
}

export function getStunner(enemy: Monster): Skill
{
	if (canUse$2(Skill.get("Blow the Blue Candle!")) && haveEffect(Effect.get("Everything Looks Blue")) === 0)
	{
		return Skill.get("Blow the Blue Candle!"); //20 Turns
	}
	// Class specific
	switch (myClass())
	{
	case Class.get("Seal Clubber"):
		if (canUse$2(Skill.get("Club Foot")) && (myFury() > 0 || hasClubEquipped()))
		{
			return Skill.get("Club Foot");
		}
		break;
	case Class.get("Turtle Tamer"):
		if (canUse$2(Skill.get("Shell Up")))
		{
			//storm turtle blessings makes shell up a multi-round stun, otherwise it's just a (special) stagger
			if (haveEffect(Effect.get("Blessing of the Storm Tortoise")) > 0 || haveEffect(Effect.get("Grand Blessing of the Storm Tortoise")) > 0 || haveEffect(Effect.get("Glorious Blessing of the Storm Tortoise")) > 0)
			{
				return Skill.get("Shell Up");
			}
		}
		break;
	case Class.get("Accordion Thief"):
		if (canUse$2(Skill.get("Accordion Bash")) && itemType(equippedItem(Slot.get("weapon"))) === "accordion")
		{
			return Skill.get("Accordion Bash");
		}
		break;
	case Class.get("Pastamancer"):
		if (canUse$2(Skill.get("Entangling Noodles")))
		{
			return Skill.get("Entangling Noodles");
		}
		break;
	case Class.get("Sauceror"):
		if (canUse$2(Skill.get("Soul Bubble")))
		{
			return Skill.get("Soul Bubble");
		}
		break;
	case Class.get("Avatar of Boris"):
		if (canUse$2(Skill.get("Broadside")))
		{
			return Skill.get("Broadside");
		}
		break;
	case Class.get("Avatar of Sneaky Pete"):
		if (canUse$2(Skill.get("Snap Fingers")))
		{
			return Skill.get("Snap Fingers");
		}
		break;
	case Class.get("Avatar of Jarlsberg"):
		if (canUse$2(Skill.get("Blend")))
		{
			return Skill.get("Blend");
		}
		break;
	case Class.get("Cow Puncher"):
	case Class.get("Beanslinger"):
	case Class.get("Snake Oiler"):
		if (canUse$2(Skill.get("Beanscreen")))
		{
			return Skill.get("Beanscreen");
		}
		if (canUse$2(Skill.get("Hogtie")) && !haveUsed(Skill.get("Beanscreen")) && hasLeg(enemy))
		{
			return Skill.get("Hogtie");
		}
		break;
	case Class.get("Vampyre"):
		if (canUse$2(Skill.get("Blood Chains")) && myHp() > 3 * hpCost(Skill.get("Blood Chains")))
		{
			return Skill.get("Blood Chains");
		}
		break;
	case Class.get("Pig Skinner"):
		if (canUse$2(Skill.get("Noogie")))
		{
			return Skill.get("Noogie");
		}
		break;
	case Class.get("Cheese Wizard"):
		if (canUse$2(Skill.get("Gather Cheese-Chi")))
		{
			return Skill.get("Gather Cheese-Chi");
		}
		break;
	case Class.get("Jazz Agent"):
		if (canUse$1(Skill.get("Drum Roll"), true))
		{
			return Skill.get("Drum Roll");
		}
		break;
	case Class.get("Meat Golem"):
		if (canUse$1(Skill.get("Meat Locker"), true))
		{
			return Skill.get("Meat Locker");
		}
		break;
	}
	// From Designer Sweatpants. Use when have nearly full sweat or when losing combat
	if (canUse$2(Skill.get("Sweat Flood")) && (getSweat() > 98 || containsText(getProperty("_auto_combatState"), "last attempt")))
	{
		return Skill.get("Sweat Flood");
	}
	// Decreases in stun duration the more it's used
	if (canUse$2(Skill.get("Summon Love Gnats")))
	{
		return Skill.get("Summon Love Gnats");
	}
	// Nuclear Autum
	if (canUse$2(Skill.get("Mind Bullets")))
	{
		return Skill.get("Mind Bullets");
	}

	return Skill.none;
}

export function enemyCanBlocksSkills(): boolean
{
	//we want to know if enemy can sometimes block a skill. For such enemies skills should be used only if absolutely necessary
	//for enemies that always block a skill a seperate function should be made... if we ever fight any in run.

	const enemy: Monster = lastMonster();

	if (Monster.get([
	"Bonerdagon",
	"Naughty Sorceress",
	"Naughty Sorceress (2)"]).includes(enemy))
	{
		return true;
	}

	return false;
}

function canSurvive(mult: number, add_1: number): boolean
{
	let damage: number = expectedDamage();
	damage *= toInt(mult);
	damage += add_1;
	return damage < myHp();
}

export function canSurvive$1(mult: number): boolean
{
	return canSurvive(mult, 0);
}

export function hasClubEquipped(): boolean
{
	return itemType(equippedItem(Slot.get("weapon"))) === "club" || itemType(equippedItem(Slot.get("weapon"))) === "sword" && haveEffect(Effect.get("Iron Palms")) > 0;
}

function auto_saberTrickMeteorShowerCombatHandler(round_1: number, enemy: Monster, text: string): string
{
	if (canUse$2(Skill.get("Use the Force")) && auto_saberChargesAvailable() > 0 && auto_have_skill(Skill.get("Meteor Lore")))
	{
		if (canUse$2(Skill.get("Meteor Shower")))
		{
			return useSkill$2(Skill.get("Meteor Shower"));
		}
		else {
			return auto_combatSaberYR();
		}
	}
	abort("Unable to perform saber trick (meteor shower)");
	return "abort"; //must have a return
}

function findPhylumBanisher$1(round_1: number, enemy: Monster, text: string): string
{
	const banishAction: string = banisherCombatString(monsterPhylum(enemy), myLocation(), true);
	if (banishAction !== "")
	{
		auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
		if (indexOf(banishAction, "skill") === 0)
		{
			handleTracker$1(monsterPhylum(enemy).toString(), toSkill(substring(banishAction, 6)).toString(), "auto_banishes");
		}
		else if (indexOf(banishAction, "item") === 0)
		{
			handleTracker$1(monsterPhylum(enemy).toString(), toItem(substring(banishAction, 5)).toString(), "auto_banishes");
		}
		else {
			auto_log_warning(`Unable to track banisher behavior: ${banishAction}`, "red");
		}
		return banishAction;
	}
	return auto_combatHandler(round_1, enemy, text);
}

export function findBanisher(round_1: number, enemy: Monster, text: string): string
{
	const banishAction: string = banisherCombatString$1(enemy, myLocation(), true);
	if (banishAction !== "")
	{
		auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
		if (indexOf(banishAction, "skill") === 0)
		{
			handleTracker$1(enemy.toString(), toSkill(substring(banishAction, 6)).toString(), "auto_banishes");
		}
		else if (indexOf(banishAction, "item") === 0)
		{
			handleTracker$1(enemy.toString(), toItem(substring(banishAction, 5)).toString(), "auto_banishes");
		}
		else {
			auto_log_warning(`Unable to track banisher behavior: ${banishAction}`, "red");
		}
		return banishAction;
	}
	if (canUse$1(Skill.get("Storm of the Scarab"), false))
	{
		return useSkill$1(Skill.get("Storm of the Scarab"), false);
	}
	return auto_combatHandler(round_1, enemy, text);
}

export function banisherCombatString(enemyPhylum: Phylum, loc: Location, inCombat: boolean): string
{
	if (inAftercore())
	{
		return "";
	}

	if (in_pokefam())
	{
		return "";
	}
	//Check that we actually want to banish this thing.
	if (!auto_wantToBanish$1(enemyPhylum, loc))
		{ return ""; }

	if (inCombat)
		{ auto_log_info(`Finding a phylum banisher to use on ${enemyPhylum} at ${loc}`, "green"); }

	if ((inCombat ? myFamiliar() === Familiar.get("Patriotic Eagle") && toInt(getProperty("screechCombats")) === 0 && !in_glover() : !in_avantGuard() && pathAllowsChangingFamiliar() && !auto_famKill(Familiar.get("Patriotic Eagle"), loc) && auto_have_familiar(Familiar.get("Patriotic Eagle")) && toInt(getProperty("screechCombats")) === 0 && !in_glover()))
	{
		return `skill${Skill.get("%fn, Release the Patriotic Screech!")}`;
	}

	return "";
}

export function banisherCombatString$1(enemy: Monster, loc: Location, inCombat: boolean): string
{
	if (inAftercore())
	{
		return "";
	}

	if (in_pokefam())
	{
		return "";
	}
	//If it's already banished, banishing it again isn't going to do much.
	if (isBanished(enemy))
	{
		return "";
	}
	//Check that we actually want to banish this thing.
	if (!auto_wantToBanish(enemy, loc))
		{ return ""; }

	if (inCombat)
		{ auto_log_info(`Finding a banisher to use on ${enemy} at ${loc}`, "green"); }

	let useFree: boolean = true; // use banisher that is a freerun
	if (is_werewolf())
	{
		useFree = false; // werewolves don't run
	}
	//src/net/sourceforge/kolmafia/session/BanishManager.java
	const used: Map<string, boolean> = auto_banishesUsedAt(loc);
	/*	If we have banished anything else in this zone, make sure we do not undo the banishing.
		mad wino:batter up!:378:skeletal sommelier:KGB tranquilizer dart:381
		We are not going to worry about turn costs, it probably only matters for older paths anyway.
		//TODO - find a way to track banishes that have queues and can banish multiple things at once (Banishing Shout and Howl of the Alpha for example)
		Thunder Clap: no limit, no turn limit
		Batter Up!: no limit, no turn limit
		Asdon Martin: Spring-Loaded Front Bumper: no limit
		Curse of Vacation: no limit? No turn limit?
		Walk Away Explosion: no limit, turn limited irrelavant.
		Howl of the Alpha: no limit, no turn limit, can banish up to 3 monsters simultaneously
		Banishing Shout: no turn limit
		Talk About Politics: no turn limit
		KGB Tranquilizer Dart: no turn limit
		Snokebomb: no turn limit
		Louder Than Bomb: item, no turn limit
		Beancannon: item, no turn limit, no limit
		Tennis Ball: item, no turn limit
		anchor bomb: item, 30 turns
		Breathe Out: per hot jelly usage
	*/
	//Spring Kick is at the top because it is not turn ending. If a replacer is used the replaced monster can then have unspeakable things done to it (like another banish)
	if (((inCombat ? auto_have_skill(Skill.get("Spring Kick")) : possessEquipment(Item.get("spring shoes")))) && auto_is_valid$2(Skill.get("Spring Kick")) && !(used.has("Spring Kick")))
	{
		return `skill ${Skill.get("Spring Kick")}`;
	}

	if (auto_have_skill(Skill.get("Peel Out")) && pete_peelOutRemaining() > 0 && getProperty("peteMotorbikeMuffler") === "Extra-Smelly Muffler" && !(used.has("Peel Out")) && useFree)
	{
		return `skill ${Skill.get("Peel Out")}`;
	}

	if (auto_have_skill(Skill.get("Howl of the Alpha")) && myMp() > mpCost(Skill.get("Howl of the Alpha")) && !(used.has("Howl of the Alpha")))
	{
		return `skill ${Skill.get("Howl of the Alpha")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Throw Latte on Opponent")) : possessEquipment(Item.get("latte lovers member's mug")))) && auto_is_valid$2(Skill.get("Throw Latte on Opponent")) && !toBoolean(getProperty("_latteBanishUsed")) && !(used.has("Throw Latte on Opponent")) && useFree)
	{
		return `skill ${Skill.get("Throw Latte on Opponent")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Give Your Opponent the Stinkeye")) : possessEquipment(Item.get("stinky cheese eye")))) && auto_is_valid$2(Skill.get("Give Your Opponent the Stinkeye")) && !toBoolean(getProperty("_stinkyCheeseBanisherUsed")) && myMp() >= mpCost(Skill.get("Give Your Opponent the Stinkeye")) && useFree)
	{
		return `skill ${Skill.get("Give Your Opponent the Stinkeye")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Creepy Grin")) : possessEquipment(Item.get("V for Vivala mask")))) && auto_is_valid$2(Skill.get("Creepy Grin")) && !toBoolean(getProperty("_vmaskBanisherUsed")) && myMp() >= mpCost(Skill.get("Creepy Grin")) && useFree)
	{
		return `skill ${Skill.get("Creepy Grin")}`;
	}

	if (auto_have_skill(Skill.get("Baleful Howl")) && myHp() > hpCost(Skill.get("Baleful Howl")) && toInt(getProperty("_balefulHowlUses")) < 10 && !(used.has("baleful howl")) && useFree)
	{
		loopHandlerDelayAll();
		return `skill ${Skill.get("Baleful Howl")}`;
	}

	if (auto_have_skill(Skill.get("Thunder Clap")) && myThunder() >= thunderCost(Skill.get("Thunder Clap")) && !(used.has("thunder clap")))
	{
		return `skill ${Skill.get("Thunder Clap")}`;
	}
	if (auto_have_skill(Skill.get("Asdon Martin: Spring-Loaded Front Bumper")) && auto_is_valid$2(Skill.get("Asdon Martin: Spring-Loaded Front Bumper")) && getFuel() >= fuelCost(Skill.get("Asdon Martin: Spring-Loaded Front Bumper")) && !(used.has("Spring-Loaded Front Bumper")) && useFree)
	{
		if (!containsText(getProperty("banishedMonsters"), "Spring-Loaded Front Bumper"))
		{
			return `skill ${Skill.get("Asdon Martin: Spring-Loaded Front Bumper")}`;
		}
	}
	if (auto_have_skill(Skill.get("Curse of Vacation")) && myMp() > mpCost(Skill.get("Curse of Vacation")) && !(used.has("curse of vacation")))
	{
		return `skill ${Skill.get("Curse of Vacation")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Show them your ring")) : possessEquipment(Item.get("mafia middle finger ring")))) && auto_is_valid$2(Skill.get("Show them your ring")) && canEquip(Item.get("mafia middle finger ring")) && !toBoolean(getProperty("_mafiaMiddleFingerRingUsed")) && myMp() >= mpCost(Skill.get("Show them your ring")) && useFree)
	{
		return `skill ${Skill.get("Show them your ring")}`;
	}
	if (auto_have_skill(Skill.get("Batter Up!")) && myFury() >= 5 && ((inCombat ? hasClubEquipped() : true)) && auto_is_valid$2(Skill.get("Batter Up!")) && !(used.has("batter up!")))
	{
		return `skill ${Skill.get("Batter Up!")}`;
	}

	if ((inCombat ? auto_have_skill(Skill.get("Mark Your Territory")) && !(used.has("Mark Your Territory")) : auto_is_valid$2(Skill.get("Mark Your Territory")) && (auto_have_skill(Skill.get("Mark Your Territory")) || availableAmount(Item.get("pheromone cocktail")) > 0 && canDrink$1(Item.get("pheromone cocktail")) && inebriety_left() > 1 && !isActuallyEd())))
	{
		return `skill ${Skill.get("Mark Your Territory")}`;
	}

	const z_kick: Skill = getZooKickBanish();
	if (auto_have_skill(z_kick) && myMp() > mpCost(z_kick))
	{
		return `skill ${z_kick}`;
	}

	if (auto_have_skill(Skill.get("Banishing Shout")) && myMp() > mpCost(Skill.get("Banishing Shout")) && !(used.has("banishing shout")))
	{
		return `skill ${Skill.get("Banishing Shout")}`;
	}
	if (auto_have_skill(Skill.get("Walk Away From Explosion")) && myMp() > mpCost(Skill.get("Walk Away From Explosion")) && haveEffect(Effect.get("Bored With Explosions")) === 0 && !(used.has("walk away from explosion")))
	{
		return `skill ${Skill.get("Walk Away From Explosion")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Talk About Politics")) : possessEquipment(Item.get("Pantsgiving")))) && auto_is_valid$2(Skill.get("Talk About Politics")) && toInt(getProperty("_pantsgivingBanish")) < 5 && haveEquipped(Item.get("Pantsgiving")) && !(used.has("pantsgiving")))
	{
		return `skill ${Skill.get("Talk About Politics")}`;
	}
	if ((inCombat ? auto_have_skill(Skill.get("Reflex Hammer")) : auto_reflexHammersRemaining() > 0 && !(used.has("Reflex Hammer")) && useFree))
	{
		return `skill ${Skill.get("Reflex Hammer")}`;
	}
	if (((inCombat ? auto_have_skill(Skill.get("Show your boring familiar pictures")) : possessEquipment(Item.get("familiar scrapbook")))) && auto_is_valid$2(Skill.get("Show your boring familiar pictures")) && (toInt(getProperty("scrapbookCharges")) >= 200 || toInt(getProperty("scrapbookCharges")) >= 100 && myLevel() >= 13) && !(used.has("Show Your Boring Familiar Pictures")) && useFree)
	{
		return `skill ${Skill.get("Show your boring familiar pictures")}`;
	}
	// bowling ball is only in inventory if it is available to use in combat. While on cooldown, it is not in inventory
	if (((inCombat ? auto_have_skill(Skill.get("Bowl a Curveball")) : itemAmount(Item.get("cosmic bowling ball")) > 0)) && auto_is_valid$2(Skill.get("Bowl a Curveball")) && !(used.has("Bowl a Curveball")) && useFree)
	{
		return `skill ${Skill.get("Bowl a Curveball")}`;
	}

	if (auto_canFeelHatred() && auto_is_valid$2(Skill.get("Feel Hatred")) && !(used.has("Feel Hatred")) && useFree)
	{
		return `skill ${Skill.get("Feel Hatred")}`;
	}

	if (auto_have_skill(Skill.get("[7510]Punt")) && !(used.has("Punt")))
	{
		return `skill ${Skill.get("[7510]Punt")}`;
	}

	if (auto_have_skill(Skill.get("Snokebomb")) && auto_is_valid$2(Skill.get("Snokebomb")) && toInt(getProperty("_snokebombUsed")) < 3 && myMp() - 20 >= mpCost(Skill.get("Snokebomb")) && !(used.has("snokebomb")) && useFree)
	{
		return `skill ${Skill.get("Snokebomb")}`;
	}

	if (itemAmount(Item.get("stuffed yam stinkbomb")) > 0 && !(used.has("stuffed yam stinkbomb")) && auto_is_valid(Item.get("stuffed yam stinkbomb")))
	{
		return `item ${Item.get("stuffed yam stinkbomb")}`;
	}

	if ((inCombat ? itemAmount(Item.get("handful of split pea soup")) > 0 && !(used.has("Handful of split pea soup")) && auto_is_valid(Item.get("handful of split pea soup")) && useFree : itemAmount(Item.get("handful of split pea soup")) > 0 || itemAmount(Item.get("whirled peas")) >= 2))
	{
		return `item ${Item.get("handful of split pea soup")}`;
	}

	if (auto_have_skill(Skill.get("[28021]Punt")) && myMp() > mpCost(Skill.get("[28021]Punt")) && !(used.has("Punt")))
	{
		return `skill ${Skill.get("[28021]Punt")}`;
	}

	const saber: Item = wrap_item(Item.get("Fourth of May Cosplay Saber"));
	if (((inCombat ? haveEquipped(saber) : possessEquipment(saber))) && auto_is_valid$2(Skill.get("Use the Force")) && auto_saberChargesAvailable() > 0 && !(used.has("Saber Force")))
	{
		// can't use the force on uncopyable monsters
		if (enemy === Monster.none || enemy.copyable)
		{
			return auto_combatSaberBanish();
		}
	}

	if (((inCombat ? auto_have_skill(Skill.get("KGB tranquilizer dart")) : possessEquipment(Item.get("Kremlin's Greatest Briefcase")))) && auto_is_valid$2(Skill.get("KGB tranquilizer dart")) && toInt(getProperty("_kgbTranquilizerDartUses")) < 3 && myMp() >= mpCost(Skill.get("KGB tranquilizer dart")) && !(used.has("KGB tranquilizer dart")) && useFree)
	{
		let useIt: boolean = true;
		if (getProperty("sidequestJunkyardCompleted") !== "none" && myDaycount() >= 2 && toInt(getProperty("_kgbTranquilizerDartUses")) >= 2)
		{
			useIt = false;
		}

		if (useIt)
		{
			return `skill ${Skill.get("KGB tranquilizer dart")}`;
		}
	}

	if (((inCombat ? auto_have_skill(Skill.get("Monkey Slap")) : possessEquipment(Item.get("cursed monkey's paw")))) && auto_is_valid$2(Skill.get("Monkey Slap")) && toInt(getProperty("_monkeyPawWishesUsed")) === 0 && !(used.has("Monkey Slap")))
	{
		return `skill ${Skill.get("Monkey Slap")}`;
	}

	if (((inCombat ? auto_have_skill(Skill.get("Sea *dent: Throw a Lightning Bolt")) : possessEquipment(Item.get("Monodent of the Sea")))) && auto_throwLightningRemaining() > 0 && !(used.has("Sea *dent: Throw a Lightning Bolt")))
	{
		return `skill ${Skill.get("Sea *dent: Throw a Lightning Bolt")}`;
	}
	//[Nanorhino] familiar specific banish. fairly low priority as it consumes 40 to 50 adv worth of a decent buff.
	if (canUse$2(Skill.get("Unleash Nanites")) && haveEffect(Effect.get("Nanobrawny")) >= 40)
	{
		return `skill ${Skill.get("Unleash Nanites")}`;
	}

	if (auto_have_skill(Skill.get("Beancannon")) && toInt(getProperty("_beancannonUses")) < 5 && myMp() - 20 >= mpCost(Skill.get("Beancannon")) && !(used.has("beancannon")))
	{
		let haveBeans: boolean = false;
		for (const beancan of Item.get(["Frigid Northern Beans", "Heimz Fortified Kidney Beans", "Hellfire Spicy Beans", "Mixed Garbanzos and Chickpeas", "Pork 'n' Pork 'n' Pork 'n' Beans", "Shrub's Premium Baked Beans", "Tesla's Electroplated Beans", "Trader Olaf's Exotic Stinkbeans", "World's Blackest-Eyed Peas"]))
		{
			if ((inCombat ? equippedItem(Slot.get("off-hand")) === beancan : possessEquipment(beancan)))
			{
				haveBeans = true;
				break;
			}
		}
		if (haveBeans)
		{
			return `skill ${Skill.get("Beancannon")}`;
		}
	}

	if (itemAmount(Item.get("human musk")) > 0 && !(used.has("human musk")) && auto_is_valid(Item.get("human musk")) && (toInt(getProperty("_humanMuskUses")) < 3 && useFree))
	{ //first 3 are free
		return `item ${Item.get("human musk")}`;
	}
	// items for which we consume spleen for uses
	if ((inCombat ? auto_have_skill(Skill.get("Breathe Out")) && auto_is_valid$2(Skill.get("Breathe Out")) && myMp() >= mpCost(Skill.get("Breathe Out")) && !(used.has("breathe out")) && useFree : auto_is_valid$2(Skill.get("Breathe Out")) && (auto_have_skill(Skill.get("Breathe Out")) || availableAmount(Item.get("hot jelly")) > 0 && spleen_left() > 1 && !isActuallyEd())))
	{
		return `skill ${Skill.get("Breathe Out")}`;
	}

	if ((inCombat ? auto_have_skill(Skill.get("Punch Out your Foe")) && auto_is_valid$2(Skill.get("Punch Out your Foe")) && myMp() >= mpCost(Skill.get("Punch Out your Foe")) && !(used.has("punch out your foe")) && useFree : auto_is_valid$2(Skill.get("Punch Out your Foe")) && (auto_have_skill(Skill.get("Punch Out your Foe")) || availableAmount(Item.get("scoop of pre-workout powder")) > 0 && spleen_left() > 3 && !isActuallyEd())))
	{
		return `skill ${Skill.get("Punch Out your Foe")}`;
	}
	//We want to limit usage of these much more than the others.
	if (!(Monster.get(["natural spider", "Tan Gnat", "tomb servant", "upgraded ram"]).includes(enemy)))
	{
		return "";
	}

	let keep: number = 1;
	if (getProperty("sidequestJunkyardCompleted") !== "none")
	{
		keep = 0;
	}

	if (itemAmount(Item.get("Louder Than Bomb")) > keep && !(used.has("louder than bomb")) && auto_is_valid(Item.get("Louder Than Bomb")) && useFree)
	{
		return `item ${Item.get("Louder Than Bomb")}`;
	}
	if (itemAmount(Item.get("tennis ball")) > keep && !(used.has("tennis ball")) && auto_is_valid(Item.get("tennis ball")) && useFree)
	{
		return `item ${Item.get("tennis ball")}`;
	}
	if (itemAmount(Item.get("deathchucks")) > keep && !(used.has("deathchucks")) && auto_is_valid(Item.get("deathchucks")) && useFree)
	{
		return `item ${Item.get("deathchucks")}`;
	}
	if (itemAmount(Item.get("divine champagne popper")) > keep && !(used.has("divine champagne popper")) && auto_is_valid(Item.get("divine champagne popper")) && useFree)
	{
		return `item ${Item.get("divine champagne popper")}`;
	}
	if (itemAmount(Item.get("anchor bomb")) > keep && !(used.has("anchor bomb")) && auto_is_valid(Item.get("anchor bomb")) && useFree)
	{
		return `item ${Item.get("anchor bomb")}`;
	}

	return "";
}

export function banisherCombatString$2(enemyPhylum: Phylum, loc: Location): string
{
	return banisherCombatString(enemyPhylum, loc, false);
}

export function banisherCombatString$3(enemy: Monster, loc: Location): string
{
	return banisherCombatString$1(enemy, loc, false);
}

export function yellowRayCombatString(target: Monster, inCombat: boolean, noForceDrop: boolean): string
{
	if (in_wildfire() && inCombat && myLocation().fireLevel > 2)
	{
		//high fire level burns yellow ray items. except for saber's [use the force] as it leads to a noncombat
		//we only want special handling if fire level is high. otherwise we can proceed to yellowray as per normal
		if (haveEquipped(wrap_item(Item.get("Fourth of May Cosplay Saber"))) && auto_saberChargesAvailable() > 0)
		{
			// can't use the force on uncopyable monsters
			if (target === Monster.none || target.copyable && !noForceDrop)
			{
				return auto_combatSaberYR();
			}
		}
		else { return ""; }
	}

	if (in_zootomist() && haveEffect(Effect.get("Everything Looks Yellow")) <= 0)
	{
		const kick: Skill = getZooKickYR();
		if (kick !== Skill.none) { return `skill ${kick}`; }
	}

	const free_monster: boolean = isFreeMonster$1(target, myLocation()) || toInt(getProperty("breathitinCharges")) > 0 && myLocation().environment === "outdoor";

	if (haveEffect(Effect.get("Everything Looks Yellow")) <= 0)
	{

		if (auto_have_skill(Skill.get("Fondeluge")) && myMp() >= mpCost(Skill.get("Fondeluge")))
		{
			return `skill ${Skill.get("Fondeluge")}`; // 50 turns
		}
		if (itemAmount(Item.get("yellowcake bomb")) > 0 && auto_is_valid(Item.get("yellowcake bomb")))
		{
			return `item ${Item.get("yellowcake bomb")}`; // 75 turns + quest item
		}
		if (free_monster && itemAmount(Item.get("yellow rocket")) > 0 && auto_is_valid(Item.get("yellow rocket")))
		{
			return `item ${Item.get("yellow rocket")}`; // 75 turns & 250 meat - better than wasting a freekill on an already free monster
		}
		if ((inCombat ? haveSkill(Skill.get("Spit jurassic acid")) : auto_hasParka() && auto_is_valid$2(Skill.get("Spit jurassic acid")) && hasTorso$1()))
		{
			return `skill ${Skill.get("Spit jurassic acid")}`; //100 Turns and free kill
		}
		if (itemAmount(Item.get("yellow rocket")) > 0 && auto_is_valid(Item.get("yellow rocket")))
		{
			return `item ${Item.get("yellow rocket")}`; // 75 turns & 250 meat
		}
		if (itemAmount(Item.get("spitball")) > 0 && auto_is_valid(Item.get("spitball")))
		{
			return `item ${Item.get("spitball")}`; //100 Turns and free kill
		}
		if ((inCombat ? haveSkill(Skill.get("Blow the Yellow Candle!")) : auto_haveRoman() && auto_can_equip(Item.get("Roman Candelabra")) && auto_is_valid$2(Skill.get("Blow the Yellow Candle!"))))
		{
			return `skill ${Skill.get("Blow the Yellow Candle!")}`; //75 Turns
		}
		if ((inCombat ? haveSkill(Skill.get("Unleash the Devil's Kiss")) : auto_hasRetrocape() && auto_is_valid$2(Skill.get("Unleash the Devil's Kiss"))))
		{
			return `skill ${Skill.get("Unleash the Devil's Kiss")}`; // 99 turns
		}
		if (auto_have_skill(Skill.get("Disintegrate")) && auto_is_valid$2(Skill.get("Disintegrate")) && myMp() >= mpCost(Skill.get("Disintegrate")))
		{
			return `skill ${Skill.get("Disintegrate")}`; // 100 trurns
		}
		if (auto_have_skill(Skill.get("Ball Lightning")) && myLightning() >= lightningCost(Skill.get("Ball Lightning")))
		{
			return `skill ${Skill.get("Ball Lightning")}`; // 99 turns + 5 lightning
		}
		if (auto_have_skill(Skill.get("Wrath of Ra")) && myMp() >= mpCost(Skill.get("Wrath of Ra")))
		{
			return `skill ${Skill.get("Wrath of Ra")}`; // 100 turns
		}
		if (itemAmount(Item.get("mayo lance")) > 0 && auto_is_valid(Item.get("mayo lance")) && toInt(getProperty("mayoLevel")) > 0 && auto_is_valid(Item.get("mayo lance")))
		{
			return `item ${Item.get("mayo lance")}`; // 0 - 145 turns
		}
		if (getProperty("peteMotorbikeHeadlight") === "Ultrabright Yellow Bulb" && auto_have_skill(Skill.get("Flash Headlight")) && myMp() >= mpCost(Skill.get("Flash Headlight")))
		{
			return `skill ${Skill.get("Flash Headlight")}`; // 100 turns
		}
		for (const it of Item.get(["Golden Light", "pumpkin bomb", "unbearable light", "viral video", "micronova"]))
		{
			if (itemAmount(it) > 0 && auto_is_valid(it))
			{
				return `item ${it}`; // ~150 turns
			}
		}
		if (auto_have_skill(Skill.get("Unleash Cowrruption")) && haveEffect(Effect.get("Cowrruption")) >= 30)
		{
			return `skill ${Skill.get("Unleash Cowrruption")}`; // 149 turns
		}
		if (((inCombat ? myFamiliar() === Familiar.get("Crimbo Shrub") : auto_have_familiar(Familiar.get("Crimbo Shrub")))) && auto_is_valid$2(Skill.get("Open a Big Yellow Present")) && getProperty("shrubGifts") === "yellow")
		{
			return `skill ${Skill.get("Open a Big Yellow Present")}`; // 149 turns
		}
	}

	if (asdonCanMissile())
	{
		return `skill ${Skill.get("Asdon Martin: Missile Launcher")}`;
	}

	if (auto_canNorthernExplosionFE())
	{
		//With April Shower Thoughts Shield
		return `skill ${Skill.get("Northern Explosion")}`;
	}

	if (auto_canFeelEnvy())
	{
		return `skill ${Skill.get("Feel Envy")}`;
	}

	const saber: Item = wrap_item(Item.get("Fourth of May Cosplay Saber"));
	if (((inCombat ? haveEquipped(saber) : possessEquipment(saber))) && auto_saberChargesAvailable() > 0)
	{
		// can't use the force on uncopyable monsters
		if (target === Monster.none || target.copyable && !noForceDrop)
		{
			return auto_combatSaberYR();
		}
	}
	// shocking lick doesn't cause everything looks yellow effect and limited only by how many batteries you have. Use all other sources first.
	if ((inCombat ? haveSkill(Skill.get("Shocking Lick")) : toInt(getProperty("shockingLickCharges")) > 0 || can_get_battery(Item.get("battery (9-Volt)"))))
	{
		return `skill ${Skill.get("Shocking Lick")}`;
	}

	return "";
}

export function yellowRayCombatString$1(target: Monster, inCombat: boolean): string
{
	return yellowRayCombatString(target, inCombat, false);
}

function yellowRayCombatString$2(target: Monster): string
{
	return yellowRayCombatString$1(target, false);
}

function yellowRayCombatString$3(): string
{
	return yellowRayCombatString$2(Monster.none);
}

export function replaceMonsterCombatString(target: Monster, inCombat: boolean): string
{
	if (in_pokefam())
	{
		return "";
	}
	if (auto_macrometeoritesAvailable() > 0 && auto_is_valid$2(Skill.get("Macrometeorite")))
	{
		return `skill ${Skill.get("Macrometeorite")}`;
	}
	if (auto_powerfulGloveReplacesAvailable(inCombat) > 0 && auto_is_valid$2(Skill.get("CHEAT CODE: Replace Enemy")))
	{
		return `skill ${Skill.get("CHEAT CODE: Replace Enemy")}`;
	}
	if (canUse$4(Item.get("waffle")) && !in_avantGuard())
	{
		return useItems$1(Item.get("waffle"), Item.none);
	}
	return "";
}

export function replaceMonsterCombatString$1(target: Monster): string
{
	return replaceMonsterCombatString(target, false);
}

function replaceMonsterCombatString$2(): string
{
	return replaceMonsterCombatString$1(Monster.none);
}

export function turns_to_kill(dmg: number): number
{
	//how long will it take us to kill the current enemy if we are able to deal dmg to it each round
	return toFloat(monsterHp()) / dmg;
}

export function combat_status_check(mark: string): boolean
{
	return containsText(getProperty("_auto_combatState"), mark);
}

export function combat_status_add(mark: string): void
{
	let st: string = getProperty("_auto_combatState");
	if (!combat_status_check(mark))
	{
		st = `${st}(${mark})`;
	}
	setProperty("_auto_combatState", st);
}

export function wantToForceDrop(enemy: Monster): boolean
{
	//skills that can be used on any combat round, repeatedly until an item is stolen
	//take into account if a yellow ray has been used. Must have been one that doesn't insta-kill
	const mildEvilAvailable: boolean = canUse$1(Skill.get("Perpetrate Mild Evil"), false) && toInt(getProperty("_mildEvilPerpetrated")) < 3;
	const swoopAvailable: boolean = canUse$1(Skill.get("Swoop like a Bat"), true) && toInt(getProperty("_batWingsSwoopUsed")) < 11;

	let forceDrop: boolean = false;
	//only force 1 scent gland from each filthworm
	if (!combat_status_check("yellowray"))
	{
		if (enemy === Monster.get("larval filthworm") && itemAmount(Item.get("filthworm hatchling scent gland")) < 1)
		{
			forceDrop = true;
		}
		if (enemy === Monster.get("filthworm drone") && itemAmount(Item.get("filthworm drone scent gland")) < 1)
		{
			forceDrop = true;
		}
		if (enemy === Monster.get("filthworm royal guard") && itemAmount(Item.get("filthworm royal guard scent gland")) < 1)
		{
			forceDrop = true;
		}
	}
	// polar vortex/mild evil is more likely to pocket an item the higher the drop rate. Unlike XO which has equal chance for all drops
	// reserve extinguisher 30 charge for filth worms
	if (auto_fireExtinguisherCharges() > 20 || mildEvilAvailable || swoopAvailable)
	{
		let dropsFromYR: number = 0;
		if (combat_status_check("yellowray"))
		{
			dropsFromYR = 1;
		}

		if (Monster.get(["bearpig topiary animal", "elephant (meatcar?) topiary animal", "spider (duck?) topiary animal"]).includes(enemy))
		{
			if (hedgeTrimmersNeeded() + dropsFromYR > 0)
			{
				forceDrop = true;
			}
		}
		// Number of times bowled is 1 less than hiddenBowlingAlleyProgress. Need 5 bowling balls total, 5+1 = 6 needed in this conditional
		if (enemy === Monster.get("pygmy bowler") && toInt(getProperty("hiddenBowlingAlleyProgress")) + itemAmount(Item.get("bowling ball")) + dropsFromYR < 6)
		{
			forceDrop = true;
		}

		if (enemy === Monster.get("dairy goat") && itemAmount(Item.get("goat cheese")) + dropsFromYR < 3)
		{
			forceDrop = true;
		}

		if ((Item.get("shadow brick").toString()) in itemDrops(enemy) && auto_neededShadowBricks() + dropsFromYR > 0)
		{
			forceDrop = true;
		}

		if (enemy === Monster.get("Baa'baa'bu'ran") && (itemAmount(Item.get("stone wool")) === 0 || toBoolean(dropsFromYR)))
		{
			forceDrop = true;
		}
	}

	if (isActuallyEd() && myLocation() === Location.get("The Secret Council Warehouse"))
	{
		const progress: number = toInt(getProperty("warehouseProgress"));
		if (enemy === Monster.get("warehouse guard"))
		{
			const n_pages: number = itemAmount(Item.get("warehouse map page"));
			const progress_with_pages: number = progress + n_pages * 8;
			if (progress_with_pages < 39)
			{ // need 40 to "win", will get +1 for this combat
				forceDrop = true;
			}
		}
		else if (enemy === Monster.get("warehouse clerk"))
		{
			const n_pages: number = itemAmount(Item.get("warehouse inventory page"));
			const progress_with_pages: number = progress + n_pages * 8;
			if (progress_with_pages < 39)
			{ // need 40 to "win", will get +1 for this combat
				forceDrop = true;
			}
		}
	} // ed warehouse

	return forceDrop;
}

export function wantToDouse(enemy: Monster): boolean
{
	switch (enemy)
	{
		case Monster.get("larval filthworm"):
			return itemAmount(Item.get("filthworm hatchling scent gland")) === 0;
		case Monster.get("filthworm drone"):
			return itemAmount(Item.get("filthworm drone scent gland")) === 0;
		case Monster.get("filthworm royal guard"):
			return itemAmount(Item.get("filthworm royal guard scent gland")) === 0;
		case Monster.get("shadow slab"):
			return itemAmount(Item.get("shadow brick")) < 13;
	}
	return false;
}

export function maxRoundsToDouse(enemy: Monster): number
{
	let rounds: number = defaultRoundLimit() - 3;
	if (auto_isShadowRiftMonster(enemy)) { // resist damage, take longer
	rounds -= 3; }
	if (myClass() === Class.get("Disco Bandit")) { // DBs take a while to kill b/c disco momentum and potentially low damage
	rounds -= 3; }
	// save a round for flyering if we're doing that.
	const flyer: Item = (auto_warSide() === "hippy" ? Item.get("jam band flyers") : Item.get("rock band flyers"));
	if (canUse$4(flyer) && toInt(getProperty("flyeredML")) < 10000) { rounds -= 1; }
	// Or pants removal
	if (canUse$2(Skill.get("Tear Away your Pants!"))) { rounds -= 1; }
	if (canUse$2(Skill.get("Perpetrate Mild Evil"))) { // We'll be mild eviling any monsters we douse most likely
	rounds -= auto_remainingMildEvilUses(); }
	if (canUse$2(Skill.get("Swoop like a Bat"))) { // swoopin' em too
	rounds -= 1; }
	if (canUse$2(Skill.get("Fire Extinguisher: Polar Vortex"))) { // and extingo
	rounds -= auto_fireExtinguisherCharges(); }

	return rounds;
}

export function canSurviveShootGhost(enemy: Monster, shots: number): boolean {
	let damage: number = 0;
	switch (enemy)
	{
		case Monster.get("the ghost of Oily McBindle"):
			damage = toInt(myMaxhp() * 0.4 * elementalResistance(Element.get("sleaze")) / 100);
			break;
		case Monster.get("boneless blobghost"):
			damage = toInt(myMaxhp() * 0.45 * elementalResistance(Element.get("spooky")) / 100);
			break;
		case Monster.get("the ghost of Monsieur Baguelle"):
			damage = toInt(myMaxhp() * 0.5 * elementalResistance(Element.get("hot")) / 100);
			break;
		case Monster.get("The Headless Horseman"):
			damage = toInt(myMaxhp() * 0.55 * elementalResistance(Element.get("spooky")) / 100);
			break;
		case Monster.get("The Icewoman"):
			damage = toInt(myMaxhp() * 0.6 * elementalResistance(Element.get("cold")) / 100);
			break;
		case Monster.get("The ghost of Ebenoozer Screege"):
			damage = toInt(myMaxhp() * 0.65 * elementalResistance(Element.get("spooky")) / 100);
			break;
		case Monster.get("The ghost of Lord Montague Spookyraven"):
			damage = toInt(myMaxhp() * 0.7 * elementalResistance(Element.get("stench")) / 100);
			break;
		case Monster.get("The ghost of Vanillica \"Trashblossom\" Gorton"):
			damage = toInt(myMaxhp() * 0.75 * elementalResistance(Element.get("stench")) / 100);
			break;
		case Monster.get("The ghost of Sam McGee"):
			damage = toInt(myMaxhp() * 0.8 * elementalResistance(Element.get("hot")) / 100);
			break;
		case Monster.get("The ghost of Richard Cockingham"):
			damage = toInt(myMaxhp() * 0.85 * elementalResistance(Element.get("spooky")) / 100);
			break;
		case Monster.get("The ghost of Waldo the Carpathian"):
			damage = toInt(myMaxhp() * 0.9 * elementalResistance(Element.get("hot")) / 100);
			break;
		case Monster.get("Emily Koops, a spooky lime"):
			damage = toInt(myMaxhp() * 0.95 * elementalResistance(Element.get("spooky")) / 100);
			break;
		case Monster.get("The ghost of Jim Unfortunato"):
			damage = toInt(myMaxhp() * elementalResistance(Element.get("sleaze")) / 100);
			break;
		default:
			damage = toInt(myMaxhp() * 0.3);
	}
	return myHp() > damage * shots;
}

function auto_remainingMildEvilUses(): number
{
	if (!haveSkill(Skill.get("Perpetrate Mild Evil"))) { return 0; }
	return 3 - toInt(getProperty("_mildEvilPerpetrated"));
}
