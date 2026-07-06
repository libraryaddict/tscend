import { abort, append, bufferToFile, cliExecute, containsText, currentRound, equip, equippedItem, Familiar, fileToArray, getProperty, handlingChoice, haveFamiliar, Item, itemAmount, lastChoice, Monster, myFamiliar, myHash, myHp, nowToInt, print, random, replaceString, runCombat, setProperty, Slot, splitString, toBoolean, toBuffer, toInt, toLowerCase, toMonster, useFamiliar, visitUrl, xpath } from "kolmafia";
import { AshMatcher } from "./autoscend/utils/kolmafiaUtils";
import { CombatMacro } from "./autoscend/auto_adventure";

//c2t_megg
//c2t
//mimic egg interfaces
//preference containing mimic egg contents
//cli flag
let c2t_megg_CLI: boolean = false;
//globals to be set when a primary functions ran
let c2t_megg_oldFam: Familiar = Familiar.none;
let c2t_megg_oldEq: Item = Item.none;
//donate max eggs on hand of mon
//for random donating max eggs on hand
//returns false only on critical errors
function c2t_megg_donate$1(): boolean { return c2t_megg_donate(Monster.none); }
//extract egg
//fight egg
//returns true only if entered combat with it
//same as above, but runs the combat with macro
//function to put into pre-adventure scripts to update list of max donated eggs
//has a speed bump built in to help try to keep the list updated passively and to not hit the server too frequently
//to change the frequency of the time limiter, the preference c2t_megg_timeLimit can be changed from the default of 30 minutes
//attempts to update the list of max donated eggs
function c2t_megg_success$1(): boolean { return c2t_megg_success(""); }
//CLI
function main$c2t_megg(...args: string[]): void {
	c2t_megg_CLI = true;
	let split: Map<number, string> = new Map();
	let action: string = ""; let target: string = "";
	let mon: Monster = Monster.none;

	if (args.length === 1) {
		split = new Map(splitString((args[0] ??= ""), " ").map((_v, _i) => [_i, _v]));
		action = toLowerCase((split.get(0) ?? split.set(0, "").get(0)));
	}

	for (let i: number = 1; i <= split.size - 1; i++)
		{ target += (i === 1 ? (split.get(i) ?? split.set(i, "").get(i)) : ` ${(split.get(i) ?? split.set(i, "").get(i))}`); }

	target = toLowerCase(target);
	mon = (target === "random" ? Monster.none : toMonster(target));

	switch (action) {
		default:
			c2t_megg_print(`"${action}" is an invalid command`);
		case "":
		case "help":
			print("available commands for c2t_megg:");
			print("c2t_megg donate [monster] -- used to donate mimic eggs of monster, or random if monster omitted");
			print("c2t_megg eggs -- prints list of eggs on hand and their quantities, as read the preference containing mimic egg contents");
			print("c2t_megg extract <monster> -- used to extract mimic egg of monster from Mimic DNA Bank");
			print("c2t_megg fight <monster> -- enter combat with monster contained in a mimic egg");
			print("c2t_megg maxed -- prints list of monsters that are maxed, as read from the data file");
			print("c2t_megg preadv -- updates the maxed egg list if able, but with time restictions useful for pre-adventure scripts");
			print("c2t_megg update -- updates the maxed egg list if able");
			print("c2t_megg relay <on|off> -- turn the relay cleaner on or off; the cleaner changes monster names to use mafia's names for them and makes the drop-down menus searchable when visiting the Mimic DNA Bank");
			print("c2t_megg help -- displays this list of commands");
			break;
		case "donate":
		case "donegg":
			c2t_megg_donate(mon);
			break;
		case "eggs":
			c2t_megg_printEggs();
			break;
		case "extract":
		case "eggtract":
		case "eggstract":
			c2t_megg_extract(mon);
			break;
		case "fight":
			c2t_megg_fight(mon);
			break;
		case "maxed":
			c2t_megg_printMaxed();
			break;
		case "pre":
		case "preadv":
		case "preadventure":
		case "pre-adventure":
			c2t_megg_preAdv();
			break;
		case "update":
			c2t_megg_update();
			break;
		case "cleaner":
		case "relay":
			switch (target) {
				default:
					c2t_megg_print(`"${target}" is an invalid relay cleaner option`);
					break;
				case "on":
					setProperty("c2t_megg_disableRelayCleaner", false.toString());
					c2t_megg_print("relay cleaner on");
					break;
				case "off":
					setProperty("c2t_megg_disableRelayCleaner", true.toString());
					c2t_megg_print("relay cleaner off");
					break;
			}
			break;
	}
}

//returns false only on critical errors
function c2t_megg_donate(target: Monster): boolean {
	const egg: Item = Item.get("mimic egg");
	const mimic: Familiar = Familiar.get("Chest Mimic");
	const pref: string = "_mimicEggsDonated";
	let page: string = null;
	let maxlist: Map<string, boolean> = new Map();
	let options: Map<number, string> = new Map();
	let monstring: string = "";
	let start_1: number = 0; let needle: number = 0; let size: number = 0;
	let tries: number = 0;
	const MAX_TRIES: number = 4;
	let numForms: number = 0;
	let roundtrip: boolean = false;

	c2t_megg_init();
	maxlist = c2t_megg_readFile();
	monstring = target.id.toString();
	//maybe don't have to go
	if (!haveFamiliar(mimic))
		{ return c2t_megg_error("no chest mimic detected"); }
	if (toInt(getProperty(pref)) >= 3)
		{ return c2t_megg_success("max daily eggs donated already"); }
	if (itemAmount(egg) === 0)
		{ return c2t_megg_success("no eggs on hand to donate"); }
	if (maxlist.has(monstring))
		{ return c2t_megg_success(`${target} eggs already max donated`); }
	//go
	useFamiliar(mimic);
	page = visitUrl("place.php?whichplace=town_right&action=townright_dna", false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1517)
	{
		return c2t_megg_error("couldn't enter choice adventure to donate eggs");
	}
	//forms check
	if (!c2t_megg_isDonatePage(page))
		{ return c2t_megg_error("no donation interface detected; mafia out of sync?"); }
	else { numForms++; }
	if (c2t_megg_isExtractPage(page)) {
		numForms++;
		maxlist = c2t_megg_readPage(page);
		c2t_megg_writeFile(maxlist);
	}
	//some default protection against max egg redundancies for random donate
	if (target === Monster.none && maxlist.size === 0)
	{
		c2t_megg_print("couldn't read max egg list from page or data file, so protecting embezzlers at minimum");
		maxlist.set((Monster.get("Knob Goblin Embezzler")).id.toString(), true);
	}
	//target already max check
	if (maxlist.has(monstring))
		{ return c2t_megg_success(`${target} already max donated`); }
	//do the things
	if (target !== Monster.none) { //not random donation
		do {
			if (!containsText(page, `<option value="${monstring}">`))
				{ //precarious match
				return c2t_megg_success(`no more ${target} eggs left to donate`); }
			c2t_megg_print(`donating egg of ${target}`);
			page = visitUrl(`choice.php?pwd&whichchoice=1517&option=1&mid=${monstring}`, true, true);
		} while (!(itemAmount(egg) === 0 || toInt(getProperty(pref)) >= 3 || ++tries >= MAX_TRIES));
	}
	else { //random donation
	do {
		options = new Map(xpath(page, `//form[@action="choice.php"][${numForms}]/select/option/@value`).map((_v, _i) => [_i, _v]));
		size = options.size;
		needle = (start_1 = (size === 2 ? 1 : random(size - 1) + 1));
		do {
			monstring = (options.get(needle) ?? options.set(needle, "").get(needle));
			if (!(maxlist.has(monstring))) {
				c2t_megg_print(`donating egg of ${toMonster(monstring)}`);
				page = visitUrl(`choice.php?pwd&whichchoice=1517&option=1&mid=${monstring}`, true, true);
				break;
			}
			if (++needle > size - 1)
				{ needle = 1; }
			} while (!(needle === start_1 && (roundtrip = true)));
		if (roundtrip)
			{ return c2t_megg_success("all eggs you have appear to be max donated already"); }
		} while (!(itemAmount(egg) === 0 || toInt(getProperty(pref)) >= 3 || ++tries >= MAX_TRIES)); //just in case logic is off or there is a desync with mafia, don't let this loop infinitely
		}
	//result
	if (toInt(getProperty(pref)) >= 3)
		{ return c2t_megg_success("max daily eggs donated"); }
	if (itemAmount(egg) === 0)
		{ return c2t_megg_success("ran out of eggs to donate"); }
	if (tries >= MAX_TRIES)
		{ return c2t_megg_error(`mafia out of sync? tried to donate ${tries} times without fully succeeding`); }
	//something happened that I didn't think of; or something to do with protection
	c2t_megg_print(`${getProperty(pref)},${itemAmount(egg)},${tries},${monstring},${options.size}`);
	return c2t_megg_error("maximum overfail");
}

//returns true if egg taken; false on failure
export function c2t_megg_extract(target: Monster): boolean {
	const egg: Item = Item.get("mimic egg");
	const mimic: Familiar = Familiar.get("Chest Mimic");
	const pref: string = "_mimicEggsObtained";
	let page: string = null;
	let maxlist: Map<string, boolean> = new Map();
	let monstring: string = "";
	let start_1: number = 0;

	c2t_megg_init();
	//maybe don't need to go
	if (!haveFamiliar(mimic))
		{ return c2t_megg_error("no chest mimic detected"); }
	if (target === Monster.none)
		{ return c2t_megg_error("cannot extract none"); }
	if (toInt(getProperty(pref)) >= 11)
		{ return c2t_megg_success("already at max daily extractions"); }
	if (mimic.experience === 0) {
		c2t_megg_print("chest mimic detected with no experience; refreshing terrarium");
		cliExecute("refresh terrarium");
	}
	if (mimic.experience < 100)
		{ return c2t_megg_error("not enough familiar experience"); }
	//go
	useFamiliar(mimic);
	page = visitUrl("place.php?whichplace=town_right&action=townright_dna", false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1517)
	{
		return c2t_megg_error("couldn't enter choice adventure to extract eggs");
	}
	//form check
	if (!c2t_megg_isExtractPage(page))
		{ return c2t_megg_error("couldn't find the extract egg interface"); }
	//make maxlist
	maxlist = c2t_megg_readPage(page);
	c2t_megg_writeFile(maxlist);
	monstring = target.id.toString();
	//is it extractable
	if (!(maxlist.has(monstring)))
		{ return c2t_megg_error(`${target} not extractable (yet?)`); }

	start_1 = itemAmount(egg);
	page = visitUrl(`choice.php?pwd&whichchoice=1517&option=2&mid=${monstring}`, true, true);
	if (start_1 < itemAmount(egg))
		{ return c2t_megg_success(`extracted ${target} egg`); }

	return c2t_megg_error(`unknown error extracting ${target}`);
}

//does not actually do the combat
function c2t_megg_fight(target: Monster): boolean {
	const egg: Item = Item.get("mimic egg");
	let page: string = null;
	let monstring: string = "";

	c2t_megg_init();
	//maybe don't need to go
	if (itemAmount(egg) === 0)
		{ return c2t_megg_error("no mimic eggs to fight"); }
	if (target === Monster.none)
		{ return c2t_megg_error("cannot fight none"); }
	if (myHp() === 0)
		{ return c2t_megg_error("entering combat with zero HP is an instant loss"); }
	//go
	page = visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`, false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1516)
	{
		return c2t_megg_error("couldn't enter choice adventure to fight eggs");
	}
	//check if available
	monstring = target.id.toString();
	if (!containsText(page, `<option value="${monstring}">`)) {
		visitUrl("main.php", false, true); //don't get stuck in choice
		return c2t_megg_error(`${target} not found to fight`);
	}

	page = visitUrl(`choice.php?pwd&whichchoice=1516&option=1&mid=${monstring}`, true, true);
	return containsText(page, `<!-- MONSTERID: ${monstring} -->`);
}
//if macro is an empty string, the combat will be run with mafia's settings
function c2t_megg_fight$1(target: Monster, macro: CombatMacro): boolean {
	if (!c2t_megg_fight(target))
		{ return false; }
	if (currentRound() > 0)
		{ //make sure autoattack didn't finish combat
		runCombat(macro); }
	return true;
}

//returns true only if the data file successfully updated
export function c2t_megg_preAdv(): boolean {
	const mimic: Familiar = Familiar.get("Chest Mimic");
	const prefLast: string = "_c2t_megg_lastCheck";
	const prefLimit: string = "c2t_megg_timeLimit";
	let maxlist: Map<string, boolean> = new Map();
	let page: string = null;
	const last: number = toInt(getProperty(prefLast));
	let limit: number = toInt(getProperty(prefLimit)) * 60000;
	const now: number = nowToInt();
	const dailyMaxed: boolean = toInt(getProperty("_mimicEggsObtained")) >= 11;
	//maybe don't need to go
	if (!haveFamiliar(mimic))
		{ return false; }
	if (mimic.experience < 100)
		{ return false; }
	if (dailyMaxed)
		{ return false; }
	//30 minutes speed limit to start
	if (limit === 0) {
		limit = 600000;
		setProperty(prefLimit, (30).toString());
	}
	//don't check too often
	if (now - last < limit)
		{ return false; }
	//go
	c2t_megg_init();
	useFamiliar(mimic);
	page = visitUrl("place.php?whichplace=town_right&action=townright_dna", false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1517)
	{
		return c2t_megg_error("could not enter choice adventure to record maxed eggs");
	}
	//form check
	if (!c2t_megg_isExtractPage(page))
		{ return c2t_megg_error("could not find extract interfact to record maxed eggs"); }
	//read/write
	maxlist = c2t_megg_readPage(page);
	c2t_megg_writeFile(maxlist);
	//make sure it actually happened
	if (maxlist.size === 0)
		{ return c2t_megg_error("could not read extract interfact to record maxed eggs"); }
	//update last check
	return c2t_megg_success("pre-adventure success");
}

//returns true only if the data file successfully updated
function c2t_megg_update(): boolean {
	const mimic: Familiar = Familiar.get("Chest Mimic");
	let maxlist: Map<string, boolean> = new Map();
	let page: string = null;
	const dailyMaxed: boolean = toInt(getProperty("_mimicEggsObtained")) >= 11;

	c2t_megg_init();
	//maybe don't need to go
	if (!haveFamiliar(mimic))
		{ return c2t_megg_error("no chest mimic detected"); }
	if (mimic.experience < 100)
		{ return c2t_megg_error("not enough familiar experience"); }
	if (dailyMaxed)
		{ return c2t_megg_error("daily max eggs obtained; can't update list anymore today"); }
	//go
	useFamiliar(mimic);
	page = visitUrl("place.php?whichplace=town_right&action=townright_dna", false, true);
	//choice check
	if (!handlingChoice() || lastChoice() !== 1517)
	{
		return c2t_megg_error("could not enter choice adventure to record maxed eggs");
	}
	//form check
	if (!c2t_megg_isExtractPage(page))
		{ return c2t_megg_error("could not find extract interfact to record maxed eggs"); }
	//read/write
	maxlist = c2t_megg_readPage(page);
	//writeFile has its own (useful) success message
	if (c2t_megg_writeFile(maxlist))
		{ return c2t_megg_success$1(); }
	return c2t_megg_error("failed to update maxed egg list");
}

//for relay overrides
function c2t_megg_relay(page: string): string {
	const buf: string = toBuffer(page);
	let maxlist: Map<string, boolean> = new Map();

	if (c2t_megg_isExtractPage(buf)) {
		maxlist = c2t_megg_readPage(buf);
		c2t_megg_writeFile(maxlist);
	}

	if (toBoolean(getProperty("c2t_megg_disableRelayCleaner")))
		{ return page; }

	if (maxlist.size === 0)
		{ maxlist = c2t_megg_readFile(); }

	let m: AshMatcher = null;
	//use mafia's monster names for disambiguation
	m = new AshMatcher("(<option value=\"(\\d+)\"[^>]*>).+?(?=(\\s\\(\\d+ sam|</opt))", buf);
	while (m.find())
		{ replaceString(buf, m.group(0), `${m.group(1)}${toMonster(m.group(2)).name}`); }
	//disable maxed eggs in donate section
	m = new AshMatcher("(<option value=\"(\\d+)\")(>[^<]+)</option>", buf);
	while (m.find())
		{ if (maxlist.has(m.group(2)))
			{ replaceString(buf, `${m.group(1)}${m.group(3)}`, `${m.group(1)} disabled${m.group(3)} (max)`); } }
	//make select searchable
	replaceString(buf, "</head>", "<script src=\"https://code.jquery.com/jquery-3.7.1.min.js\"></script><link href=\"https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css\" rel=\"stylesheet\" /><script src=\"https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js\"></script><script type=\"text/javascript\">var jQuery_3_7_1 = $.noConflict(true);jQuery_3_7_1(document).ready(function() {jQuery_3_7_1('.searchable-select').select2();});</script></head>");
	replaceString(buf, "<select name=\"mid\">", "<select class=\"searchable-select\" name=\"mid\">");

	return buf;
}

function c2t_megg_relayFight(page: string): string {
	if (toBoolean(getProperty("c2t_megg_disableRelayCleaner")))
		{ return page; }

	const buf: string = toBuffer(page);
	let m: AshMatcher = null;
	//use mafia's monster names for disambiguation
	m = new AshMatcher("(<option value=\"(\\d+)\">).+?(?=</option>)", buf);
	while (m.find())
		{ replaceString(buf, m.group(0), `${m.group(1)}${toMonster(m.group(2)).name}`); }
	//make select searchable
	replaceString(buf, "</head>", "<script src=\"https://code.jquery.com/jquery-3.7.1.min.js\"></script><link href=\"https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css\" rel=\"stylesheet\" /><script src=\"https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js\"></script><script type=\"text/javascript\">var jQuery_3_7_1 = $.noConflict(true);jQuery_3_7_1(document).ready(function() {jQuery_3_7_1('.searchable-select').select2();});</script></head>");
	replaceString(buf, "<select name=\"mid\">", "<select class=\"searchable-select\" name=\"mid\">");

	return buf;
}

//for error messages and clean exit
function c2t_megg_error(s: string): boolean {
	const msg: string = `c2t_megg error: ${s}`;
	useFamiliar(c2t_megg_oldFam);
	equip(Slot.get("familiar"), c2t_megg_oldEq);

	if (c2t_megg_CLI)
		{ abort(msg); }

	print(msg, "red");
	return false;
}

//for success messages and clean exit
function c2t_megg_success(s: string): boolean {
	useFamiliar(c2t_megg_oldFam);
	equip(Slot.get("familiar"), c2t_megg_oldEq);
	if (s !== "")
		{ c2t_megg_print(s); }
	return true;
}

//print
function c2t_megg_print(s: string): void {
	print(`c2t_megg: ${s}`);
}

//prints list of mimic eggs on hand and their quanity as read from item description
function c2t_megg_printEggs(): void {
	const eggs: Map<Monster, number> = c2t_megg_eggs();
	const order: Map<string, Map<string, number>> = new Map();

	for (const [i, x] of eggs)
		{ (order.get(toLowerCase(i.name)) ?? order.set(toLowerCase(i.name), new Map()).get(toLowerCase(i.name))).set(i.name, x); }

	c2t_megg_print("list of eggs on hand:");
	for (const [i, _v0] of order) {
		for (const [j, _v1] of _v0) {
			const x = _v1;
		print(`${j} => ${x}`); }
	}
	c2t_megg_print(`total eggs on hand: ${itemAmount(Item.get("mimic egg"))}`);
}

//print list of maxed eggs as read from data file
function c2t_megg_printMaxed(): void {
	const maxlist: Map<Monster, boolean> = c2t_megg_maxed();
	const order: Map<string, string> = new Map();

	for (const x of maxlist.keys())
		{ order.set(toLowerCase(x.name), x.name); }

	c2t_megg_print("list of maxed eggs:");
	for (const [i, x] of order)
		{ print(`${x}`); }
	c2t_megg_print(`total maxed eggs: ${maxlist.size}`);
}

//mafia's xpath won't let me just grab from one form directly without this workaround
function c2t_megg_isExtractPage(page: string): boolean {
	return containsText(page, "Extract an egg containing the dna of <select name=\"mid\">");
}

function c2t_megg_isDonatePage(page: string): boolean {
	return containsText(page, "Donate the egg of <select name=\"mid\">");
}

function c2t_megg_numForms(page: string): number {
	return toInt(c2t_megg_isDonatePage(page)) + toInt(c2t_megg_isExtractPage(page));
}

//gets list of max eggs from page
function c2t_megg_readPage(page: string): Map<string, boolean> {
	const out: Map<string, boolean> = new Map();
	let m: AshMatcher = null;
	let part: string = "";

	m = new AshMatcher("Extract an egg containing the dna of <select name=\"mid\">(.*)<small>\\(\\d+/11 eggs? spawned today\\)</small>", page);
	m.find();
	part = m.group(1);
	m = new AshMatcher("<option value=\"(\\d+)\"\\s*>", part);
	while (m.find())
		{ out.set(m.group(1), true); }
	return out;
}

//read/write data file for keeping track of maxed eggs
function c2t_megg_readFile(): Map<string, boolean> {
	const out: Map<string, boolean> = new Map();
	let raw: Map<number, string> = new Map();

	raw = new Map(Object.entries(fileToArray("c2t_megg_maxlist.txt")).map(([_k, _v]) => [toInt(_k), _v]));
	for (const [i, x] of raw)
		{ out.set(x, true); }
	return out;
}

function c2t_megg_writeFile(list: Map<string, boolean>): boolean {
	const buf: string = null;
	const neat: Map<number, boolean> = new Map();
	const prefCount: string = "_c2t_megg_maxlistCount";
	const prefLast: string = "_c2t_megg_lastCheck";
	const size: number = list.size;

	if (size === 0)
		{ return false; }
	//only write if the list is actually bigger or it's a new day
	if (size <= toInt(getProperty(prefCount))) {
		setProperty(prefLast, nowToInt().toString());
		return false;
	}
	//populate int map to sort by number instead of alpha-numerically, simply for neatness sake
	for (const x of list.keys())
		{ neat.set(toInt(x), true); }
	for (const x of neat.keys())
		{ append(buf, `${x}\n`); }
	if (bufferToFile(buf, "c2t_megg_maxlist.txt")) {
		c2t_megg_print(`maxed egg list updated with ${size} entries`);
		setProperty(prefLast, nowToInt().toString());
		setProperty(prefCount, size.toString());
		return true;
	}
	else {
		c2t_megg_print("maxed egg list couldn't be written");
		return false;
	}
}

//returns a map of monsters that are maximally donated, as read from the data file
export function c2t_megg_maxed(): Map<Monster, boolean> {
	const out: Map<Monster, boolean> = new Map();
	const maxlist: Map<string, boolean> = c2t_megg_readFile();

	for (const x of maxlist.keys())
		{ out.set(toMonster(x), true); }

	return out;
}

//returns a map of the monsters inside the mimic eggs the user has, and how many of each, by parsing the preference containing mimic egg contents
export function c2t_megg_eggs(): Map<Monster, number> {
	const out: Map<Monster, number> = new Map();
	const egg: Item = Item.get("mimic egg");
	const prop: string = "mimicEggMonsters";
	let split: Map<number, string> = new Map();

	if (itemAmount(egg) === 0)
		{ return out; }

	if (getProperty(prop) === "") {
		cliExecute("refresh inv");
		if (itemAmount(egg) === 0)
			{ return out; }
		visitUrl(`desc_item.php?whichitem=${egg.descid}`, false, true);
	}

	for (const [i, x] of splitString(getProperty(prop), ",").entries()) {
		split = new Map(splitString(x, ":").map((_v, _i) => [_i, _v]));
		out.set(toMonster((split.get(0) ?? split.set(0, "").get(0))), toInt((split.get(1) ?? split.set(1, "").get(1))));
	}
	return out;
}

//init
function c2t_megg_init(): void {
	c2t_megg_oldFam = myFamiliar();
	c2t_megg_oldEq = equippedItem(Slot.get("familiar"));
}
