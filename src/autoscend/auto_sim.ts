import { Familiar, Item, Monster, Skill, getProperty, haveFamiliar, haveSkill, itemAmount, print, toBoolean, toInt, toItem } from "kolmafia";
import { possessEquipment } from "./auto_equipment";
import { auto_haveCombatLoversLocket, auto_monsterInLocket } from "./iotms/mr2022";

//Defined in autoscend/auto_sim.ash
export function printSim(): void
{
	PrintSimRequired();
	printSimSuggested();
	printSimMarginal();
	print();
	print("Note: Recommended to run in aftercore to properly detect everything");
}

function PrintSimRequired(): void
{
	print("Required Things:");

	let sk: Skill = Skill.get("Saucestorm");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Critical for autoscend combat");
	sk = Skill.get("Itchy Curse Finger");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Critical for autoscend combat");
	sk = Skill.get("Curse of Weaksauce");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Critical for autoscend combat");
	sk = Skill.get("Tongue of the Walrus");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Healing skill which cures beaten up");
	sk = Skill.get("Cannelloni Cocoon");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Heals up to 1000 HP for 20 MP. Very cost effective");
}

function printSimSuggested(): void
{
	print();
	print("Suggested Things:");

	let sk: Skill = Skill.get("Transcendent Olfaction");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Significantly increases chance of encountering a monster");
	sk = Skill.get("Stuffed Mortar Shell");
	formattedSimPrint(haveSkill(sk), sk.toString(), "MP efficient and high damage");
	sk = Skill.get("Saucegeyser");
	formattedSimPrint(haveSkill(sk), sk.toString(), "High damage spell. Helpful for bosses");
	sk = Skill.get("Lock Picking");
	formattedSimPrint(haveSkill(sk), sk.toString(), "Out of standard easy key source");

	let fam: Familiar = Familiar.get("Nosy Nose");
	formattedSimPrint(haveFamiliar(fam), fam.toString(), "Familiar with olfaction-lite ability");
	fam = Familiar.get("Gelatinous Cubeling");
	formattedSimPrint(haveFamiliar(fam), fam.toString(), "Familiar which speeds up the daily dungeon");

	let maxedPoolSkill: boolean = toInt(getProperty("poolSharkCount")) >= 25;
	formattedSimPrint(maxedPoolSkill, "Pool Shark", "Lucky! adv which permanently increases your pool skill. It is possible for Mafia to not realize you have maxed this. If you are confident you have, enter the following in the CLI: `set poolSharkCount=25`");
	// if we have combat locket, check if we have used monsters in there
	if (auto_haveCombatLoversLocket())
	{
		let mon: Monster = Monster.get("fantasy bandit");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Fighting 5x in a day will get you a fat loot token");
		mon = Monster.get("screambat");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Lets you break a wall in the Bat Hole");
		mon = Monster.get("lobsterfrogman");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Need 5x for war sidequest");
		mon = Monster.get("Astronomer");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Helpful for star key");
		mon = Monster.get("Skinflute");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Helpful for star key");
		mon = Monster.get("Camel's Toe");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Helpful for star key");
		mon = Monster.get("War Frat Mobile Grill Unit");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Frat warrior war start outfit");
		mon = Monster.get("War Hippy Airborne Commander");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "War hippy war start outfit");
		mon = Monster.get("Baa'baa'bu'ran");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "3x Stone Wool for L12 quest");
		mon = Monster.get("Green Ops Soldier");
		formattedSimPrint(auto_monsterInLocket(mon), `Locket Monster: ${mon.toString()}`, "Get war progress even when copied into other zones, plus smoke bombs");
	}
	// if we have cookbookbat, make sure we have all its recipes
	if (haveFamiliar(Familiar.get("Cookbookbat")))
	{
		let recipes: string[] = ["Boris's beer", "honey bun of Boris", "ratatouille de Jarlsberg", "Jarlsberg's vegetable soup", "Pete's wiley whey bar",
				"St. Pete's sneaky smoothie", "Boris's bread", "roasted vegetable of Jarlsberg", "Pete's rich ricotta", "roasted vegetable focaccia",
				"plain calzone", "baked veggie ricotta casserole"];
		for (let recipe of recipes)
		{
			let haveRecipe: boolean = !toBoolean(getProperty(`unknownRecipe$${toInt(toItem(recipe))}`));
			formattedSimPrint(haveRecipe, `Recipe: ${recipe}`, "Cookbookbat recipes need to be learned, even if you have the familiar");
		}
	}

}

function printSimMarginal(): void
{
	print();
	print("Marginal Things:");

	let fam: Familiar = Familiar.get("Oily Woim");
	formattedSimPrint(haveFamiliar(fam), fam.toString(), "Familiar which provides init");
	fam = Familiar.get("Exotic Parrot");
	formattedSimPrint(haveFamiliar(fam), fam.toString(), "Familiar which provides elemental resistance");
	fam = Familiar.get("Hobo Monkey");
	formattedSimPrint(haveFamiliar(fam), fam.toString(), "Familiar that's a 1.25x leprechaun");

	let it: Item = Item.get("etched hourglass");
	formattedSimPrint(itemAmount(it) > 0, `Potential Pull: ${it.toString()}`, "Extra RO adventures");
	it = Item.get("potato alarm clock");
	formattedSimPrint(itemAmount(it) > 0, `Potential Pull: ${it.toString()}`, "Extra RO adventures");
	it = Item.get("mafia thumb ring");
	formattedSimPrint(possessEquipment(it), `Potential Pull: ${it.toString()}`, "Accessory which generates an adv 4% of combats");
	it = Item.get("numberwang");
	formattedSimPrint(possessEquipment(it), `Potential Pull: ${it.toString()}`, "Good all around accessory");
	it = Item.get("deck of lewd playing cards");
	formattedSimPrint(possessEquipment(it), `Potential Pull: ${it.toString()}`, "Sleaze dmg helps Belch House, Zeppelin Mob, and sometimes tower test");
	it = Item.get("infinite BACON machine");
	formattedSimPrint(itemAmount(it) > 0, `Potential Pull: ${it.toString()}`, "Might make milk for big stats. Poor, for modern standards, yellow ray source");
	it = Item.get("mime army shotglass");
	formattedSimPrint(itemAmount(it) > 0, `Potential Pull: ${it.toString()}`, "Only pulled for Dark Gyffte as every organ space is really good");
}

function formattedSimPrint(have: boolean, name: string, description: string): void
{
	let symbol_1: string = (have ? "✓" : "X");
	print(`${symbol_1} ${name} - ${description}`, (have ? "blue" : "red"));
}