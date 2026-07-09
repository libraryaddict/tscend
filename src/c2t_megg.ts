import {
  abort,
  append,
  bufferToFile,
  cliExecute,
  containsText,
  equip,
  equippedItem,
  Familiar,
  fileToArray,
  getProperty,
  handlingChoice,
  haveFamiliar,
  Item,
  itemAmount,
  lastChoice,
  Monster,
  myFamiliar,
  nowToInt,
  print,
  setProperty,
  splitString,
  toInt,
  toMonster,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $slot } from "libram";

import { AshMatcher } from "./autoscend/utils/kolmafiaUtils";

//c2t_megg
//c2t
//mimic egg interfaces
//preference containing mimic egg contents
//cli flag
const c2t_megg_CLI: boolean = false;
//globals to be set when a primary functions ran
let c2t_megg_oldFam: Familiar = Familiar.none;
let c2t_megg_oldEq: Item = Item.none;
//donate max eggs on hand of mon
//for random donating max eggs on hand
//returns false only on critical errors
//extract egg
//fight egg
//returns true only if entered combat with it
//same as above, but runs the combat with macro
//function to put into pre-adventure scripts to update list of max donated eggs
//has a speed bump built in to help try to keep the list updated passively and to not hit the server too frequently
//to change the frequency of the time limiter, the preference c2t_megg_timeLimit can be changed from the default of 30 minutes
//attempts to update the list of max donated eggs
//CLI

//returns false only on critical errors

//returns true if egg taken; false on failure
export function c2t_megg_extract(target: Monster): boolean {
  const egg: Item = $item`mimic egg`;
  const mimic: Familiar = $familiar`Chest Mimic`;
  const pref: string = "_mimicEggsObtained";

  c2t_megg_init();
  //maybe don't need to go
  if (!haveFamiliar(mimic)) {
    return c2t_megg_error("no chest mimic detected");
  }
  if (target === Monster.none) {
    return c2t_megg_error("cannot extract none");
  }
  if (toInt(getProperty(pref)) >= 11) {
    return c2t_megg_success("already at max daily extractions");
  }
  if (mimic.experience === 0) {
    c2t_megg_print(
      "chest mimic detected with no experience; refreshing terrarium",
    );
    cliExecute("refresh terrarium");
  }
  if (mimic.experience < 100) {
    return c2t_megg_error("not enough familiar experience");
  }
  //go
  useFamiliar(mimic);
  const page: string = visitUrl(
    "place.php?whichplace=town_right&action=townright_dna",
    false,
    true,
  );
  //choice check
  if (!handlingChoice() || lastChoice() !== 1517) {
    return c2t_megg_error("couldn't enter choice adventure to extract eggs");
  }
  //form check
  if (!c2t_megg_isExtractPage(page)) {
    return c2t_megg_error("couldn't find the extract egg interface");
  }
  //make maxlist
  const maxlist: Map<string, boolean> = c2t_megg_readPage(page);
  c2t_megg_writeFile(maxlist);

  const monstring: string = target.id.toString();
  //is it extractable
  if (!maxlist.has(monstring)) {
    return c2t_megg_error(`${target} not extractable (yet?)`);
  }

  const start_1: number = itemAmount(egg);
  visitUrl(
    `choice.php?pwd&whichchoice=1517&option=2&mid=${monstring}`,
    true,
    true,
  );
  if (start_1 < itemAmount(egg)) {
    return c2t_megg_success(`extracted ${target} egg`);
  }

  return c2t_megg_error(`unknown error extracting ${target}`);
}

//does not actually do the combat
//if macro is an empty string, the combat will be run with mafia's settings

//returns true only if the data file successfully updated
export function c2t_megg_preAdv(): boolean {
  const mimic: Familiar = $familiar`Chest Mimic`;
  const prefLast: string = "_c2t_megg_lastCheck";
  const prefLimit: string = "c2t_megg_timeLimit";
  const last: number = toInt(getProperty(prefLast));
  let limit: number = toInt(getProperty(prefLimit)) * 60000;
  const now: number = nowToInt();
  const dailyMaxed: boolean = toInt(getProperty("_mimicEggsObtained")) >= 11;
  //maybe don't need to go
  if (!haveFamiliar(mimic)) {
    return false;
  }
  if (mimic.experience < 100) {
    return false;
  }
  if (dailyMaxed) {
    return false;
  }
  //30 minutes speed limit to start
  if (limit === 0) {
    limit = 600000;
    setProperty(prefLimit, (30).toString());
  }
  //don't check too often
  if (now - last < limit) {
    return false;
  }
  //go
  c2t_megg_init();
  useFamiliar(mimic);
  const page: string = visitUrl(
    "place.php?whichplace=town_right&action=townright_dna",
    false,
    true,
  );
  //choice check
  if (!handlingChoice() || lastChoice() !== 1517) {
    return c2t_megg_error(
      "could not enter choice adventure to record maxed eggs",
    );
  }
  //form check
  if (!c2t_megg_isExtractPage(page)) {
    return c2t_megg_error(
      "could not find extract interfact to record maxed eggs",
    );
  }
  //read/write
  const maxlist: Map<string, boolean> = c2t_megg_readPage(page);
  c2t_megg_writeFile(maxlist);
  //make sure it actually happened
  if (maxlist.size === 0) {
    return c2t_megg_error(
      "could not read extract interfact to record maxed eggs",
    );
  }
  //update last check
  return c2t_megg_success("pre-adventure success");
}

//returns true only if the data file successfully updated

//for relay overrides

//for error messages and clean exit
function c2t_megg_error(s: string): boolean {
  const msg: string = `c2t_megg error: ${s}`;
  useFamiliar(c2t_megg_oldFam);
  equip($slot`familiar`, c2t_megg_oldEq);

  if (c2t_megg_CLI) {
    abort(msg);
  }

  print(msg, "red");
  return false;
}

//for success messages and clean exit
function c2t_megg_success(s: string): boolean {
  useFamiliar(c2t_megg_oldFam);
  equip($slot`familiar`, c2t_megg_oldEq);
  if (s !== "") {
    c2t_megg_print(s);
  }
  return true;
}

//print
function c2t_megg_print(s: string): void {
  print(`c2t_megg: ${s}`);
}

//prints list of mimic eggs on hand and their quanity as read from item description

//print list of maxed eggs as read from data file

//mafia's xpath won't let me just grab from one form directly without this workaround
function c2t_megg_isExtractPage(page: string): boolean {
  return containsText(
    page,
    'Extract an egg containing the dna of <select name="mid">',
  );
}

//gets list of max eggs from page
function c2t_megg_readPage(page: string): Map<string, boolean> {
  const out: Map<string, boolean> = new Map();
  let m: AshMatcher = new AshMatcher(
    'Extract an egg containing the dna of <select name="mid">(.*)<small>\\(\\d+/11 eggs? spawned today\\)</small>',
    page,
  );
  m.find();
  const part: string = m.group(1);
  m = new AshMatcher('<option value="(\\d+)"\\s*>', part);
  while (m.find()) {
    out.set(m.group(1), true);
  }
  return out;
}

//read/write data file for keeping track of maxed eggs
function c2t_megg_readFile(): Map<string, boolean> {
  const out: Map<string, boolean> = new Map();
  const raw: Map<number, string> = new Map(
    Object.entries(fileToArray("c2t_megg_maxlist.txt")).map(([_k, _v]) => [
      toInt(_k),
      _v,
    ]),
  );
  for (const [, x] of raw) {
    out.set(x, true);
  }
  return out;
}

function c2t_megg_writeFile(list: Map<string, boolean>): boolean {
  const neat: Map<number, boolean> = new Map();
  const prefCount: string = "_c2t_megg_maxlistCount";
  const prefLast: string = "_c2t_megg_lastCheck";
  const size: number = list.size;

  if (size === 0) {
    return false;
  }
  //only write if the list is actually bigger or it's a new day
  if (size <= toInt(getProperty(prefCount))) {
    setProperty(prefLast, nowToInt().toString());
    return false;
  }
  //populate int map to sort by number instead of alpha-numerically, simply for neatness sake
  for (const x of list.keys()) {
    neat.set(toInt(x), true);
  }
  const buf: string = [...neat.keys()].map((s) => String(s)).join("\n");

  if (bufferToFile(buf, "c2t_megg_maxlist.txt")) {
    c2t_megg_print(`maxed egg list updated with ${size} entries`);
    setProperty(prefLast, nowToInt().toString());
    setProperty(prefCount, size.toString());
    return true;
  } else {
    c2t_megg_print("maxed egg list couldn't be written");
    return false;
  }
}

//returns a map of monsters that are maximally donated, as read from the data file
export function c2t_megg_maxed(): Map<Monster, boolean> {
  const out: Map<Monster, boolean> = new Map();
  const maxlist: Map<string, boolean> = c2t_megg_readFile();

  for (const x of maxlist.keys()) {
    out.set(toMonster(x), true);
  }

  return out;
}

//returns a map of the monsters inside the mimic eggs the user has, and how many of each, by parsing the preference containing mimic egg contents
export function c2t_megg_eggs(): Map<Monster, number> {
  const out: Map<Monster, number> = new Map();
  const egg: Item = $item`mimic egg`;
  const prop: string = "mimicEggMonsters";

  if (itemAmount(egg) === 0) {
    return out;
  }

  if (getProperty(prop) === "") {
    cliExecute("refresh inv");
    if (itemAmount(egg) === 0) {
      return out;
    }
    visitUrl(`desc_item.php?whichitem=${egg.descid}`, false, true);
  }

  for (const [, x] of splitString(getProperty(prop), ",").entries()) {
    const split: Map<number, string> = new Map(
      splitString(x, ":").map((_v, _i) => [_i, _v]),
    );
    out.set(
      toMonster(split.get(0) ?? split.set(0, "").get(0)),
      toInt(split.get(1) ?? split.set(1, "").get(1)),
    );
  }
  return out;
}

//init
function c2t_megg_init(): void {
  c2t_megg_oldFam = myFamiliar();
  c2t_megg_oldEq = equippedItem($slot`familiar`);
}
