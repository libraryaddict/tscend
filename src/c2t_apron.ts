import { Item, Stat, abort, cliExecute, containsText, fullnessLimit, getProperty, itemAmount, myFullness, myHash, myPrimestat, print, splitString, toLowerCase, visitUrl } from "kolmafia";
import { AshMatcher } from "./autoscend/utils/kolmafiaUtils";

//c2t apron
//c2t
//deals with the black and white apron meal kit
//simply selects meal based on stat and selects all the extra ingredients that are available
//cli flag
let c2t_apron_cli: boolean = false;
//eats a meal kit with a provided stat
export function c2t_apron$1(): boolean { return c2t_apron(myPrimestat()); }
//CLI handling
function main$c2t_apron(...stat_select: string[]): void {
	c2t_apron_cli = true;

	if (stat_select.length === 0)
		{ c2t_apron$1(); }
	else { switch (toLowerCase((stat_select[0] ??= ""))) {
		default:
			c2t_apron_error(`"${(stat_select[0] ??= "")}" is not a valid stat`);
			break;
		case "mus":
		case "musc":
		case "muscle":
			c2t_apron(Stat.get("Muscle"));
			break;
		case "mys":
		case "myst":
		case "mysticality":
			c2t_apron(Stat.get("Mysticality"));
			break;
		case "mox":
		case "moxie":
			c2t_apron(Stat.get("Moxie"));
			break;
	} }
}

//returns true on success
function c2t_apron(select: Stat): boolean {
	let meal: number = 0;
	let kit: Item = Item.get("Black and White Apron Meal Kit");
	let page: string;
	let mat: AshMatcher;
	let sendit: string = "";
	let start_1: number = myFullness();
	let startKits: number = itemAmount(kit);
	let allowlist: Map<string, boolean> = new Map();

	switch (select) {
		default:
			return c2t_apron_error(`"${select}" is not a valid stat`);
		case Stat.get("Muscle"):
			meal = 0;
			break;
		case Stat.get("Mysticality"):
			meal = 1;
			break;
		case Stat.get("Moxie"):
			meal = 2;
			break;
	}
	if (itemAmount(kit) === 0)
		{ return c2t_apron_error(`no ${kit} on hand`); }
	if (myFullness() + 3 > fullnessLimit())
		{ return c2t_apron_error(`too full to eat a ${kit}`); }

	page = visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=${kit.id}`, false, true);
	mat = new AshMatcher(`name="ingredients${meal}\\[\\]"\\s+value="(\\d+)"\\s+data-has="(\\d)"`, page);
	allowlist = c2t_apron_allowlist();

	sendit = `choice.php?pwd&whichchoice=1518&option=1&meal=${meal}`;
	while (mat.find())
		{ if (mat.group(2) === "1" && allowlist.has(mat.group(1)))
			{ sendit += `&ingredients${meal}[]=${mat.group(1)}`; } }

	page = visitUrl(sendit, true, false);

	cliExecute("refresh inv");

	if (start_1 < myFullness() || startKits > itemAmount(kit) || containsText(page, "<br>You cook and quickly consume your"))
	{
		return true;
	}
	return c2t_apron_error(`did not eat the ${kit}`);
}

//map of ingredients on the allowlist
function c2t_apron_allowlist(): Map<string, boolean> {
	let out: Map<string, boolean> = new Map();
	let split: Map<number, string> = new Map();

	if (getProperty("c2t_apron_allowlist") !== "")
		{ split = new Map(splitString(getProperty("c2t_apron_allowlist"), ",").map((_v, _i) => [_i, _v])); }

	for (let [i, x] of split)
		{ out.set(x, true); }

	return out;
}

//errors
function c2t_apron_error(msg: string): boolean {
	let out: string = `c2t_apron error: ${msg}`;

	if (c2t_apron_cli)
		{ abort(out); }

	print(out, "red");
	return false;
}
