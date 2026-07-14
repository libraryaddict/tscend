import {
  canFaxbot,
  cliExecute,
  containsText,
  faxbot,
  getClanId,
  getClanLounge,
  getClanName,
  getPlayerId,
  getPlayerName,
  getProperty,
  haveEffect,
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
  toBoolean,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import { $effect, $effects, $item, $items, $location } from "libram";

import { autoAdvBypass$2, CombatMacro } from "../auto_adventure";
import { inebriety_left } from "../auto_consume";
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

export function handleFaxMonster(
  enemy: Monster,
  fightIt: boolean,
  option?: CombatMacro,
): boolean {
  if (toBoolean(getProperty("_photocopyUsed"))) {
    return false;
  }
  if (!isUnrestricted($item`deluxe fax machine`)) {
    return false;
  }
  if (is_boris() || is_jarlsberg() || is_pete() || in_glover()) {
    return false;
  }
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (!auto_get_clan_lounge().has($item`deluxe fax machine`)) {
    return false;
  }
  // don't try to fax unfaxable monsters
  if (!canFaxbot(enemy)) {
    return false;
  }

  auto_log_info(`Using fax machine to summon ${enemy.name}`, "blue");

  if (itemAmount($item`photocopied monster`) !== 0) {
    if (getProperty("photocopyMonster") === enemy.toString()) {
      auto_log_info("We already have the copy! Let's jam!", "blue");
      if (fightIt) {
        handleTracker$1(
          enemy.toString(),
          $item`deluxe fax machine`.toString(),
          "auto_copies",
        );
        return autoAdvBypass$2(
          "inv_use.php?pwd&which=3&whichitem=4873",
          $location`Noob Cave`,
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
          $item`deluxe fax machine`.toString(),
          "auto_copies",
        );
        return autoAdvBypass$2(
          "inv_use.php?pwd&which=3&whichitem=4873",
          $location`Noob Cave`,
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
  if (itemAmount($item`photocopied monster`) === 0) {
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

  if (!auto_get_clan_lounge().has($item`Clan Floundry`)) {
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
  const canReturn: boolean = canReturnToCurrentClan();

  const toClan: number = whitelistedClanToID(clanName);

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

  const page: string = visitUrl("clan_signup.php");
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

  visitUrl(
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
    for (const eff of $effects`Once-Cursed, Thrice-Cursed, Twice-Cursed`) {
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
    itemAmount($item`Clan VIP Lounge key`) > 0 &&
    isUnrestricted($item`Clan VIP Lounge key`)
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
  return $items`glass of "milk", cup of "tea", thermos of "whiskey", Lucky Lindy, Bee's Knees, Sockdollager, Ish Kabibble, Hot Socks, Phonus Balonus, Flivver, Sloppy Jalopy`.includes(
    drink_1,
  );
}

export function canDrinkSpeakeasyDrink(drink_1: Item): boolean {
  if (!isSpeakeasyDrink(drink_1)) {
    return false;
  }

  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }

  if (toInt(getProperty("_speakeasyDrinksDrunk")) >= 3) {
    return false;
  }

  if (!auto_get_clan_lounge().has($item`Clan speakeasy`)) {
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

export function zataraAvailable(): boolean {
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (toBoolean(getProperty("_clanFortuneBuffUsed"))) {
    return false;
  }

  if (!isUnrestricted($item`Clan Carnival Game`)) {
    return false;
  }

  if (!auto_get_clan_lounge().has($item`Clan Carnival Game`)) {
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
    who === $effect`A Girl Named Sue`.toString()
  ) {
    id = -1;
  } else if (
    who === "hagnk" ||
    who === "food" ||
    who === "booze" ||
    who === "item" ||
    who === "-2" ||
    who === $effect`There's No N in Love`.toString()
  ) {
    id = -2;
  } else if (
    who === "meatsmith" ||
    who === "gear" ||
    who === "meat" ||
    who === "-3" ||
    who === $effect`Meet the Meat`.toString()
  ) {
    id = -3;
  } else if (
    who === "gunther" ||
    who === "muscle" ||
    who === "hp" ||
    who === "-4" ||
    who === $effect`Gunther Than Thou`.toString()
  ) {
    id = -4;
  } else if (
    who === "gorgonzola" ||
    who === "myst" ||
    who === "mysticality" ||
    who === "mp" ||
    who === "-5" ||
    who === $effect`Everybody Calls Him Gorgon`.toString()
  ) {
    id = -5;
  } else if (
    who === "shifty" ||
    who === "moxie" ||
    who === "init" ||
    who === "-6" ||
    who === $effect`They Call Him Shifty Because...`.toString()
  ) {
    id = -6;
  }

  if (id === 0) {
    return false;
  }

  visitUrl("clan_viplounge.php?preaction=lovetester", false);
  visitUrl(`choice.php?pwd=&whichchoice=1278&option=1&which=${id}`);
  setProperty("_clanFortuneBuffUsed", true.toString());
  return true;
}

export function zataraClanmate(): boolean {
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }

  if (!isUnrestricted($item`Clan Carnival Game`)) {
    return false;
  }

  if (!auto_get_clan_lounge().has($item`Clan Carnival Game`)) {
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
    visitUrl("clan_viplounge.php?preaction=lovetester", false);
    let choices: string = "&q1=pizza&q2=batman&q3=thick";
    if (
      toBoolean(getProperty("auto_optimizeConsultsInRun")) &&
      myPath() !== Path.none
    ) {
      choices = "&q1=cake&q2=wonderwoman&q3=thick";
    }
    const temp: string = visitUrl(
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

export function auto_floundryUse(): boolean {
  if (!toBoolean(getProperty("_floundryItemUsed"))) {
    for (const it of $items`bass clarinet, codpiece, fish hatchet`) {
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
    auto_get_clan_lounge().has($item`Clan Floundry`) &&
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
          $items`bass clarinet, codpiece, fish hatchet`.includes(myFloundry) &&
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
    visitUrl(
      `clan_viplounge.php?preaction=buyfloundryitem&whichitem=${toInt(it)}`,
    );
    return true;
  }
  return false;
}
