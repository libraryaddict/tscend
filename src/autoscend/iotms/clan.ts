import {
  abort,
  buyUsingStorage,
  canFaxbot,
  cliExecute,
  containsText,
  Effect,
  faxbot,
  getClanId,
  getClanLounge,
  getClanName,
  getPlayerId,
  getPlayerName,
  getProperty,
  haveEffect,
  historicalPrice,
  isOnline,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  min,
  Monster,
  myDaycount,
  myMeat,
  myPath,
  npcPrice,
  Path,
  setProperty,
  splitString,
  storageAmount,
  toBoolean,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import { autoAdvBypass$2, CombatMacro } from "../auto_adventure";
import { fullness_left, inebriety_left } from "../auto_consume";
import { possessEquipment } from "../auto_equipment";
import {
  auto_interruptCheck$1,
  auto_log_debug,
  auto_log_debug$1,
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  handleTracker,
  handleTracker$1,
  trim,
} from "../auto_util";
import { is_boris } from "../paths/avatar_of_boris";
import { is_jarlsberg } from "../paths/avatar_of_jarlsberg";
import { is_pete } from "../paths/avatar_of_sneaky_pete";
import { inAftercore } from "../paths/casual";
import { in_glover } from "../paths/g_lover";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/iotms/clan.ash
export function auto_get_clan_lounge(): Map<Item, number> {
  const retval: Map<Item, number> = new Map();
  for (const [it, val] of Object.entries(getClanLounge()).map(
    ([_k, _v]) => [Item.get(_k), _v] as [Item, number],
  )) {
    if (isUnrestricted(it)) {
      retval.set(it, val);
    }
  }
  return retval;
}

function handleFaxMonster(enemy: Monster): boolean {
  return handleFaxMonster$3(enemy, true, null);
}

function handleFaxMonster$1(enemy: Monster, option: CombatMacro): boolean {
  return handleFaxMonster$3(enemy, true, option);
}

export function handleFaxMonster$2(enemy: Monster, fightIt: boolean): boolean {
  return handleFaxMonster$3(enemy, fightIt, null);
}

function handleFaxMonster$3(
  enemy: Monster,
  fightIt: boolean,
  option: CombatMacro,
): boolean {
  if (toBoolean(getProperty("_photocopyUsed"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("deluxe fax machine"))) {
    return false;
  }
  if (is_boris() || is_jarlsberg() || is_pete() || in_glover()) {
    return false;
  }
  if (itemAmount(Item.get("Clan VIP Lounge key")) === 0) {
    return false;
  }
  if (!auto_get_clan_lounge().has(Item.get("deluxe fax machine"))) {
    return false;
  }
  // don't try to fax unfaxable monsters
  if (!canFaxbot(enemy)) {
    return false;
  }

  auto_log_info(`Using fax machine to summon ${enemy.name}`, "blue");

  if (itemAmount(Item.get("photocopied monster")) !== 0) {
    if (getProperty("photocopyMonster") === enemy.toString()) {
      auto_log_info("We already have the copy! Let's jam!", "blue");
      if (fightIt) {
        handleTracker$1(
          enemy.toString(),
          Item.get("deluxe fax machine").toString(),
          "auto_copies",
        );
        return autoAdvBypass$2(
          "inv_use.php?pwd&which=3&whichitem=4873",
          Location.get("Noob Cave"),
          option,
        );
      }
      return true;
    } else {
      auto_log_info(
        "We already have a photocopy and not the one we wanted. Disposing of bad copy.",
        "blue",
      );
      cliExecute("fax send");
    }
  }

  auto_log_info(`Faxing: ${enemy}.`, "green");
  faxbot(enemy);
  for (let i: number = 0; i < 3; i++) {
    //wait 10 seconds before trying to get fax
    wait(10);
    if (checkFax(enemy)) {
      //got correct photocopied monster! Fight it now if desired
      auto_log_info$1(`Sucessfully faxed ${enemy}`);
      if (fightIt) {
        handleTracker$1(
          enemy.toString(),
          Item.get("deluxe fax machine").toString(),
          "auto_copies",
        );
        return autoAdvBypass$2(
          "inv_use.php?pwd&which=3&whichitem=4873",
          Location.get("Noob Cave"),
          option,
        );
      }
      return true;
    }
    auto_interruptCheck$1();
  }

  auto_log_error(
    `Failed to use clan Fax Machine to acquire a photocopied ${enemy}`,
  );
  return false;
}

function checkFax(enemy: Monster): boolean {
  if (itemAmount(Item.get("photocopied monster")) === 0) {
    cliExecute("fax receive");
  }

  if (getProperty("photocopyMonster") === enemy.toString()) {
    return true;
  }

  cliExecute("fax send");
  return false;
}

let $_get_floundry_locations_lastClanCheck: number | undefined;
let $_get_floundry_locations_lastCheck: number | undefined;
let $_get_floundry_locations_lastLiberation: number | undefined;
let $_get_floundry_locations_floundryLocations:
  Map<Location, boolean> | undefined;

export function get_floundry_locations(): Map<Location, boolean> {
  $_get_floundry_locations_lastClanCheck ??= 0;
  $_get_floundry_locations_lastCheck ??= 0;
  $_get_floundry_locations_lastLiberation ??= 0;
  $_get_floundry_locations_floundryLocations ??= new Map();

  let currentLiberation: number = 1;
  if (inAftercore()) {
    currentLiberation = 2;
  }

  if (
    getClanId() === $_get_floundry_locations_lastClanCheck &&
    $_get_floundry_locations_lastCheck === myDaycount() &&
    currentLiberation === $_get_floundry_locations_lastLiberation
  ) {
    return $_get_floundry_locations_floundryLocations;
  }

  if (!auto_get_clan_lounge().has(Item.get("Clan Floundry"))) {
    return $_get_floundry_locations_floundryLocations;
  }

  const page: string = visitUrl("clan_viplounge.php?action=floundry");
  auto_log_info("Generating Floundry Locations for the session...", "blue");

  const place_matcher: AshMatcher = new AshMatcher(
    "(?:carp|cod|trout|bass|hatchetfish|tuna):</b>\\s(.*?)<(?:br|/td)>",
    page,
  );
  while (place_matcher.find()) {
    $_get_floundry_locations_floundryLocations.set(
      toLocation(place_matcher.group(1)),
      true,
    );
  }

  $_get_floundry_locations_lastClanCheck = getClanId();
  $_get_floundry_locations_lastCheck = myDaycount();
  $_get_floundry_locations_lastLiberation = currentLiberation;
  return $_get_floundry_locations_floundryLocations;
}

export function getBAFHID(): number {
  return 90485;
}

function isWhitelistedToClan(clanID: number): boolean {
  const page: string = visitUrl("clan_signup.php");
  const clan_matcher: AshMatcher = new AshMatcher(
    "<option value=(\\d\\d\\d+)>(.*?)</option>",
    page,
  );
  while (clan_matcher.find()) {
    if (toInt(clan_matcher.group(1)) === clanID) {
      //~ auto_log_debug("Found clan " + clanID + " and name: " + clan_matcher.group(2));
      return true;
    }
  }
  return false;
}

export function isWhitelistedToBAFH(): boolean {
  return isWhitelistedToClan(getBAFHID());
}

function whitelistedClanToID(clanName: string): number {
  const page: string = visitUrl("clan_signup.php");
  const clan_matcher: AshMatcher = new AshMatcher(
    "<option value=(\\d\\d\\d+)>(.*?)</option>",
    page,
  );
  let clanID: number = 0;
  while (clan_matcher.find()) {
    if (clan_matcher.group(2) === clanName) {
      clanID = toInt(clan_matcher.group(1));
      auto_log_debug$1(
        `Found clan ${clan_matcher.group(1)} and name: ${clan_matcher.group(2)}`,
      );
      break;
    }
  }
  return clanID;
}

export function canReturnToCurrentClan(): boolean {
  return isWhitelistedToClan(getClanId());
}

function changeClan(clanName: string): number {
  let toClan: number = 0;
  const canReturn: boolean = canReturnToCurrentClan();

  toClan = whitelistedClanToID(clanName);

  if (toClan === 0) {
    auto_log_warning$1(
      "Do not have a whitelist to destination clan, can not change clans.",
    );
    return 0;
  }
  if (!canReturn) {
    auto_log_warning$1(
      "Do not have a whitelist to our own clan, can not change clans.",
    );
    return 0;
  }

  const oldClan: number = getClanId();
  if (toClan === oldClan) {
    auto_log_debug(
      `Already in this clan, no need to try to change (${toClan})`,
      "red",
    );
    return oldClan;
  }

  visitUrl(
    `showclan.php?pwd=&recruiter=1&action=joinclan&apply=Apply+to+this+Clan&confirm=on&whichclan=${toClan}`,
    true,
  );

  if (getClanId() === oldClan) {
    auto_log_error("Clan change failed");
  }
  return getClanId();
}

export function changeClan$1(toClan: number): number {
  //Returns new clan ID (or old one if it failed)

  const oldClan: number = getClanId();
  if (toClan === oldClan) {
    auto_log_debug(
      `Already in this clan, no need to try to change (${toClan})`,
      "red",
    );
    return oldClan;
  }

  let page: string = visitUrl("clan_signup.php");
  if (!containsText(page, `option value=${oldClan}>`)) {
    auto_log_warning$1(
      "Do not have a whitelist to our own clan, can not change clans.",
    );
    return 0;
  }
  if (!containsText(page, `option value=${toClan}>`)) {
    auto_log_warning$1(
      "Do not have a whitelist to destination clan, can not change clans.",
    );
    return 0;
  }

  page = visitUrl(
    `showclan.php?pwd=&recruiter=1&action=joinclan&apply=Apply+to+this+Clan&confirm=on&whichclan=${toClan}`,
    true,
  );

  if (getClanId() === oldClan) {
    auto_log_error("Clan change failed");
  }
  return getClanId();
}

export function changeClan$2(): number {
  //To BAFH
  // to BAFH
  return changeClan$1(getBAFHID());
}

export function hotTubSoaksRemaining(): number {
  // mafia will create popup confirming hottub use if in hidden apartment quest and have a curse
  // don't want to break automation so don't allow hottub use in this condition
  if (toInt(getProperty("hiddenApartmentProgress")) < 7) {
    // apartment not done, check if we have a curse
    let haveCurse: boolean = false;
    for (const eff of Effect.get([
      "Once-Cursed",
      "Thrice-Cursed",
      "Twice-Cursed",
    ])) {
      if (haveEffect(eff) > 0) {
        haveCurse = true;
      }
    }
    if (haveCurse) {
      return 0;
    }
  }

  return 5 - toInt(getProperty("_hotTubSoaks"));
}

export function isHotTubAvailable(): boolean {
  return (
    itemAmount(Item.get("Clan VIP Lounge key")) > 0 &&
    isUnrestricted(Item.get("Clan VIP Lounge key"))
  );
}

export function doHottub(): number {
  //Returns number of usages left.

  if (!(isHotTubAvailable() && hotTubSoaksRemaining() > 0)) {
    return 0;
  }
  cliExecute("hottub");

  return hotTubSoaksRemaining();
}

export function isSpeakeasyDrink(drink_1: Item): boolean {
  return Item.get([
    "glass of &quot;milk&quot;",
    "cup of &quot;tea&quot;",
    "thermos of &quot;whiskey&quot;",
    "Lucky Lindy",
    "Bee's Knees",
    "Sockdollager",
    "Ish Kabibble",
    "Hot Socks",
    "Phonus Balonus",
    "Flivver",
    "Sloppy Jalopy",
  ]).includes(drink_1);
}

export function canDrinkSpeakeasyDrink(drink_1: Item): boolean {
  if (!isSpeakeasyDrink(drink_1)) {
    return false;
  }

  if (itemAmount(Item.get("Clan VIP Lounge key")) === 0) {
    return false;
  }

  if (toInt(getProperty("_speakeasyDrinksDrunk")) >= 3) {
    return false;
  }

  if (!auto_get_clan_lounge().has(Item.get("Clan speakeasy"))) {
    return false;
  }

  if (!auto_get_clan_lounge().has(drink_1)) {
    return false;
  }

  if (myMeat() < npcPrice(drink_1)) {
    return false;
  }

  if (inebriety_left() < 0) {
    return false;
  }

  return true;
}

export function drinkSpeakeasyDrink(drink_1: Item): boolean {
  if (!canDrinkSpeakeasyDrink(drink_1)) {
    return false;
  }

  return cliExecute(`drink 1 ${drink_1}`);
}

function drinkSpeakeasyDrink$1(drink_1: string): boolean {
  if (!auto_get_clan_lounge().has(Item.get("Clan speakeasy"))) {
    return false;
  }

  const realDrink: Item = toItem(drink_1);
  if (realDrink === Item.none) {
    return false;
  }
  return drinkSpeakeasyDrink(realDrink);
}

export function zataraAvailable(): boolean {
  if (itemAmount(Item.get("Clan VIP Lounge key")) === 0) {
    return false;
  }
  if (toBoolean(getProperty("_clanFortuneBuffUsed"))) {
    return false;
  }

  if (!isUnrestricted(Item.get("Clan Carnival Game"))) {
    return false;
  }

  if (!auto_get_clan_lounge().has(Item.get("Clan Carnival Game"))) {
    return false;
  }
  return true;
}

export function zataraSeaside(who: string): boolean {
  if (!zataraAvailable()) {
    return false;
  }

  who = toLowerCase(who);

  let id: number = 0;

  if (
    who === "susie" ||
    who === "familiar" ||
    who === "-1" ||
    who === Effect.get("A Girl Named Sue").toString()
  ) {
    id = -1;
  } else if (
    who === "hagnk" ||
    who === "food" ||
    who === "booze" ||
    who === "item" ||
    who === "-2" ||
    who === Effect.get("There's No N in Love").toString()
  ) {
    id = -2;
  } else if (
    who === "meatsmith" ||
    who === "gear" ||
    who === "meat" ||
    who === "-3" ||
    who === Effect.get("Meet the Meat").toString()
  ) {
    id = -3;
  } else if (
    who === "gunther" ||
    who === "muscle" ||
    who === "hp" ||
    who === "-4" ||
    who === Effect.get("Gunther Than Thou").toString()
  ) {
    id = -4;
  } else if (
    who === "gorgonzola" ||
    who === "myst" ||
    who === "mysticality" ||
    who === "mp" ||
    who === "-5" ||
    who === Effect.get("Everybody Calls Him Gorgon").toString()
  ) {
    id = -5;
  } else if (
    who === "shifty" ||
    who === "moxie" ||
    who === "init" ||
    who === "-6" ||
    who === Effect.get("They Call Him Shifty Because...").toString()
  ) {
    id = -6;
  }

  if (id === 0) {
    return false;
  }

  let temp: string = visitUrl("clan_viplounge.php?preaction=lovetester", false);
  temp = visitUrl(`choice.php?pwd=&whichchoice=1278&option=1&which=${id}`);
  setProperty("_clanFortuneBuffUsed", true.toString());
  return true;
}

export function zataraClanmate(): boolean {
  if (itemAmount(Item.get("Clan VIP Lounge key")) === 0) {
    return false;
  }

  if (!isUnrestricted(Item.get("Clan Carnival Game"))) {
    return false;
  }

  if (!auto_get_clan_lounge().has(Item.get("Clan Carnival Game"))) {
    return false;
  }

  if (toInt(getProperty("_clanFortuneConsultUses")) >= 3) {
    return false;
  }
  //	string page = visit_url("clan_viplounge.php");
  //	if(!contains_text(page, "lovetester"))
  //	{
  //		set_property("_clanFortuneConsultUses", 3);
  //		return false;
  //	}
  //	set_property("_clanFortuneConsultUses", get_property("_clanFortuneConsultUses").to_int() + 1);

  let attempts: number = 0;
  let player: number = 3690803;
  const consultOverrideName: string = getProperty("auto_consultChoice");
  let name: string = getPlayerName(player);
  if (consultOverrideName !== "") {
    name = consultOverrideName;
    player = toInt(getPlayerId(consultOverrideName));
  }

  if (!isOnline(name)) {
    // consult will not return in reasonable timeframe
    return false;
  }

  const oldClan: number = getClanId();
  let clanName: string = getProperty("auto_consultClan");
  if (clanName !== "") {
    changeClan(clanName);
  } else {
    clanName = "Bonus Adventures from Hell";
    changeClan$2();
  }
  if (getClanName() !== clanName) {
    setProperty("_clanFortuneConsultUses", (42069).toString());
    return false;
  }

  let needWait: boolean = true;

  while (attempts < 5) {
    let temp: string = visitUrl(
      "clan_viplounge.php?preaction=lovetester",
      false,
    );
    let choices: string = "&q1=pizza&q2=batman&q3=thick";
    if (
      toBoolean(getProperty("auto_optimizeConsultsInRun")) &&
      myPath() !== Path.none
    ) {
      choices = "&q1=cake&q2=wonderwoman&q3=thick";
    }
    temp = visitUrl(
      `choice.php?pwd=&whichchoice=1278&option=1&which=1&whichid=${player}${choices}`,
    );

    if (
      containsText(
        temp,
        "You can't consult Madame Zatara about your relationship with anyone else today.",
      )
    ) {
      auto_log_warning("No consults left today. Uh oh", "red");
      setProperty("_clanFortuneConsultUses", (3).toString());
      needWait = false;
      break;
    }
    if (
      containsText(
        temp,
        `You enter your answers and wait for ${name} to answer, so you can get your results!`,
      )
    ) {
      auto_log_info("And now we play the waiting game...", "green");
      break;
    }
    if (
      containsText(temp, `You're already waiting on your results with ${name}.`)
    ) {
      auto_log_info("Results pending from prior request...", "blue");
    } else if (
      containsText(
        temp,
        "You can only consult Madame Zatara about someone in your clan.",
      )
    ) {
      auto_log_info(`${name} is not in the clan... waiting...`, "blue");
    }

    attempts++;
    wait(5);
  }

  changeClan$1(oldClan);
  if (needWait) {
    wait(10);
  }
  return true;
}

let $_eatFancyDog_dogFull: Map<string, number> | undefined;
let $_eatFancyDog_dogReq: Map<string, Item> | undefined;
let $_eatFancyDog_dogAmt: Map<string, number> | undefined;
let $_eatFancyDog_dogID: Map<string, number> | undefined;

function eatFancyDog(dog: string): boolean {
  if (itemAmount(Item.get("Clan VIP Lounge key")) === 0) {
    return false;
  }
  if (toBoolean(getProperty("_fancyHotDogEaten")) && dog !== "basic hot dog") {
    return false;
  }

  if (!auto_get_clan_lounge().has(Item.get("Clan hot dog stand"))) {
    return false;
  }

  dog = toLowerCase(dog);

  $_eatFancyDog_dogFull ??= new Map();
  $_eatFancyDog_dogReq ??= new Map();
  $_eatFancyDog_dogAmt ??= new Map();
  $_eatFancyDog_dogID ??= new Map();
  $_eatFancyDog_dogFull.set("basic hot dog", 1);
  $_eatFancyDog_dogFull.set("savage macho dog", 2);
  $_eatFancyDog_dogFull.set("one with everything", 2);
  $_eatFancyDog_dogFull.set("sly dog", 2);
  $_eatFancyDog_dogFull.set("devil dog", 3);
  $_eatFancyDog_dogFull.set("chilly dog", 3);
  $_eatFancyDog_dogFull.set("ghost dog", 3);
  $_eatFancyDog_dogFull.set("junkyard dog", 3);
  $_eatFancyDog_dogFull.set("wet dog", 3);
  $_eatFancyDog_dogFull.set("optimal dog", 1);
  $_eatFancyDog_dogFull.set("sleeping dog", 2);
  $_eatFancyDog_dogFull.set("video games hot dog", 3);

  $_eatFancyDog_dogReq.set("basic hot dog", Item.none);
  $_eatFancyDog_dogReq.set("savage macho dog", Item.get("furry fur"));
  $_eatFancyDog_dogReq.set("one with everything", Item.get("cranberries"));
  $_eatFancyDog_dogReq.set("sly dog", Item.get("skeleton bone"));
  $_eatFancyDog_dogReq.set("devil dog", Item.get("hot wad"));
  $_eatFancyDog_dogReq.set("chilly dog", Item.get("cold wad"));
  $_eatFancyDog_dogReq.set("ghost dog", Item.get("spooky wad"));
  $_eatFancyDog_dogReq.set("junkyard dog", Item.get("stench wad"));
  $_eatFancyDog_dogReq.set("wet dog", Item.get("sleaze wad"));
  $_eatFancyDog_dogReq.set("optimal dog", Item.get("tattered scrap of paper"));
  $_eatFancyDog_dogReq.set("sleeping dog", Item.get("gauze hammock"));
  $_eatFancyDog_dogReq.set(
    "video games hot dog",
    Item.get("GameInformPowerDailyPro magazine"),
  );

  $_eatFancyDog_dogAmt.set("basic hot dog", 0);
  $_eatFancyDog_dogAmt.set("savage macho dog", 10);
  $_eatFancyDog_dogAmt.set("one with everything", 10);
  $_eatFancyDog_dogAmt.set("sly dog", 10);
  $_eatFancyDog_dogAmt.set("devil dog", 25);
  $_eatFancyDog_dogAmt.set("chilly dog", 25);
  $_eatFancyDog_dogAmt.set("ghost dog", 25);
  $_eatFancyDog_dogAmt.set("junkyard dog", 25);
  $_eatFancyDog_dogAmt.set("wet dog", 25);
  $_eatFancyDog_dogAmt.set("optimal dog", 25);
  $_eatFancyDog_dogAmt.set("sleeping dog", 10);
  $_eatFancyDog_dogAmt.set("video games hot dog", 3);

  $_eatFancyDog_dogID.set("basic hot dog", 0);
  $_eatFancyDog_dogID.set("savage macho dog", -93);
  $_eatFancyDog_dogID.set("one with everything", -94);
  $_eatFancyDog_dogID.set("sly dog", -95);
  $_eatFancyDog_dogID.set("devil dog", -96);
  $_eatFancyDog_dogID.set("chilly dog", -97);
  $_eatFancyDog_dogID.set("ghost dog", -98);
  $_eatFancyDog_dogID.set("junkyard dog", -99);
  $_eatFancyDog_dogID.set("wet dog", -100);
  $_eatFancyDog_dogID.set("optimal dog", -102);
  $_eatFancyDog_dogID.set("sleeping dog", -101);
  $_eatFancyDog_dogID.set("video games hot dog", -103);

  if (!$_eatFancyDog_dogFull.has(dog)) {
    abort(`Invalid hot dog: ${dog}`);
  }

  const page: string = visitUrl("clan_viplounge.php?action=hotdogstand");
  if (!containsText(page, dog)) {
    return false;
  }

  if (
    fullness_left() <
    ($_eatFancyDog_dogFull.get(dog) ??
      $_eatFancyDog_dogFull.set(dog, 0).get(dog))
  ) {
    return false;
  }

  const need: number =
    ($_eatFancyDog_dogAmt.get(dog) ??
      $_eatFancyDog_dogAmt.set(dog, 0).get(dog)) -
    storageAmount(
      $_eatFancyDog_dogReq.get(dog) ??
        $_eatFancyDog_dogReq.set(dog, Item.none).get(dog),
    );
  if (need > 0) {
    if (
      buyUsingStorage(
        need,
        $_eatFancyDog_dogReq.get(dog) ??
          $_eatFancyDog_dogReq.set(dog, Item.none).get(dog),
        toInt(
          min(
            1.5 *
              historicalPrice(
                $_eatFancyDog_dogReq.get(dog) ??
                  $_eatFancyDog_dogReq.set(dog, Item.none).get(dog),
              ),
            30000,
          ),
        ),
      ) === 0
    ) {
      auto_log_warning(
        `Could not buy ${$_eatFancyDog_dogReq.get(dog) ?? $_eatFancyDog_dogReq.set(dog, Item.none).get(dog)} for a fancy dog. Price may have been manipulated.`,
        "red",
      );
      wait(5);
      return false;
    }
  }

  if (
    storageAmount(
      $_eatFancyDog_dogReq.get(dog) ??
        $_eatFancyDog_dogReq.set(dog, Item.none).get(dog),
    ) <
    ($_eatFancyDog_dogAmt.get(dog) ?? $_eatFancyDog_dogAmt.set(dog, 0).get(dog))
  ) {
    return false;
  }

  visitUrl("clan_viplounge.php?action=hotdogstand");

  if (
    ($_eatFancyDog_dogAmt.get(dog) ??
      $_eatFancyDog_dogAmt.set(dog, 0).get(dog)) > 0
  ) {
    visitUrl(
      `clan_viplounge.php?preaction=hotdogsupply&hagnks=1&whichdog=${$_eatFancyDog_dogID.get(dog) ?? $_eatFancyDog_dogID.set(dog, 0).get(dog)}&quantity=${$_eatFancyDog_dogAmt.get(dog) ?? $_eatFancyDog_dogAmt.set(dog, 0).get(dog)}`,
    );
  }

  visitUrl("clan_viplounge.php?action=hotdogstand");

  cliExecute(`eatsilent 1 ${dog}`);
  handleTracker(dog, "auto_eaten");
  return true;
}

export function auto_floundryUse(): boolean {
  if (!toBoolean(getProperty("_floundryItemUsed"))) {
    for (const it of Item.get(["bass clarinet", "codpiece", "fish hatchet"])) {
      if (possessEquipment(it)) {
        use(1, it);
        return true;
      }
    }
  }
  return false;
}

export function auto_floundryAction(): boolean {
  if (toBoolean(getProperty("_floundryItemCreated"))) {
    return false;
  }
  if (
    !toBoolean(getProperty("_floundryItemGot")) &&
    auto_get_clan_lounge().has(Item.get("Clan Floundry")) &&
    !inAftercore()
  ) {
    if (getProperty("auto_floundryChoice") !== "") {
      const floundryChoice: Map<number, string> = new Map(
        splitString(getProperty("auto_floundryChoice"), ";").map((_v, _i) => [
          _i,
          _v,
        ]),
      );
      const myFloundry: Item = toItem(
        trim(
          floundryChoice.get(min(floundryChoice.size, myDaycount()) - 1) ??
            floundryChoice
              .set(min(floundryChoice.size, myDaycount()) - 1, "")
              .get(min(floundryChoice.size, myDaycount()) - 1),
        ),
      );
      if (auto_floundryAction$1(myFloundry)) {
        if (
          Item.get(["bass clarinet", "codpiece", "fish hatchet"]).includes(
            myFloundry,
          ) &&
          !toBoolean(getProperty("_floundryItemUsed")) &&
          itemAmount(myFloundry) > 0
        ) {
          use(1, myFloundry);
        }
        setProperty("_floundryItemGot", true.toString());
        return true;
      } else {
        auto_log_warning(
          "Could not fish from the Floundry for some raisin.",
          "red",
        );
        return false;
      }
    }
  }
  return false;
}

function auto_floundryAction$1(it: Item): boolean {
  if (toBoolean(getProperty("_floundryItemCreated"))) {
    return false;
  }
  const fish: Map<Item, number> = auto_get_clan_lounge();
  if ((fish.get(it) ?? fish.set(it, 0).get(it)) > 0) {
    const temp: string = visitUrl(
      `clan_viplounge.php?preaction=buyfloundryitem&whichitem=${toInt(it)}`,
    );
    return true;
  }
  return false;
}
