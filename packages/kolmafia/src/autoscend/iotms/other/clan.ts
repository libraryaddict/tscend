import {
  canFaxbot,
  cliExecute,
  containsText,
  faxbot,
  getClanId,
  getClanLounge,
  getClanName as AutoClan$$getClanName,
  getPlayerId,
  getPlayerName,
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
  splitString,
  toInt,
  toItem,
  toLocation,
  toLowerCase,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $path,
  Clan,
  get,
  set,
} from "libram";

import { autoAdvBypass$1, CombatMacro } from "../../auto_adventure";
import { inebriety_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_interruptCheck,
  auto_log_debug,
  auto_log_error,
  auto_log_info,
  auto_log_warning,
  handleTracker,
  safeGet,
} from "../../auto_util";
import { is_boris } from "../../paths/2012/avatar_of_boris";
import { is_jarlsberg } from "../../paths/2013/avatar_of_jarlsberg";
import { is_pete } from "../../paths/2014/avatar_of_sneaky_pete";
import { in_glover } from "../../paths/2018/g_lover";
import { inAftercore } from "../../paths/casual";
import { AshMatcher } from "../../utils/kolmafiaUtils";

//Defined in autoscend/iotms/clan.ash
export function AutoClan$$auto_get_clan_lounge(): Map<Item, number> {
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

export function AutoClan$$handleFaxMonster(
  enemy: Monster,
  fightIt: boolean,
  option?: CombatMacro,
): boolean {
  if (get("_photocopyUsed")) {
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
  if (!AutoClan$$auto_get_clan_lounge().has($item`deluxe fax machine`)) {
    return false;
  }
  // don't try to fax unfaxable monsters
  if (!canFaxbot(enemy)) {
    return false;
  }

  auto_log_info(`Using fax machine to summon ${enemy.name}`, "blue");

  if (itemAmount($item`photocopied monster`) !== 0) {
    if (safeGet("photocopyMonster") === enemy) {
      auto_log_info("We already have the copy! Let's jam!", "blue");
      if (fightIt) {
        handleTracker({
          what: enemy,
          detail: $item`deluxe fax machine`.toString(),
          property: "auto_copies",
        });
        return autoAdvBypass$1(
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
    if (AutoClan$$checkFax(enemy)) {
      //got correct photocopied monster! Fight it now if desired
      auto_log_info(`Sucessfully faxed ${enemy}`);
      if (fightIt) {
        handleTracker({
          what: enemy,
          detail: $item`deluxe fax machine`.toString(),
          property: "auto_copies",
        });
        return autoAdvBypass$1(
          "inv_use.php?pwd&which=3&whichitem=4873",
          $location`Noob Cave`,
          option,
        );
      }
      return true;
    }
    auto_interruptCheck();
  }

  auto_log_error(
    `Failed to use clan Fax Machine to acquire a photocopied ${enemy}`,
  );
  return false;
}

function AutoClan$$checkFax(enemy: Monster): boolean {
  if (itemAmount($item`photocopied monster`) === 0) {
    cliExecute("fax receive");
  }

  if (safeGet("photocopyMonster") === enemy) {
    return true;
  }

  cliExecute("fax send");
  return false;
}

let AutoClan$$$_get_floundry_locations_lastClanCheck: number | undefined;
let AutoClan$$$_get_floundry_locations_lastCheck: number | undefined;
let AutoClan$$$_get_floundry_locations_lastLiberation: number | undefined;
let AutoClan$$$_get_floundry_locations_floundryLocations:
  Map<Location, boolean> | undefined;

export function AutoClan$$get_floundry_locations(): Map<Location, boolean> {
  AutoClan$$$_get_floundry_locations_lastClanCheck ??= 0;
  AutoClan$$$_get_floundry_locations_lastCheck ??= 0;
  AutoClan$$$_get_floundry_locations_lastLiberation ??= 0;
  AutoClan$$$_get_floundry_locations_floundryLocations ??= new Map();

  let currentLiberation: number = 1;
  if (inAftercore()) {
    currentLiberation = 2;
  }

  if (
    getClanId() === AutoClan$$$_get_floundry_locations_lastClanCheck &&
    AutoClan$$$_get_floundry_locations_lastCheck === myDaycount() &&
    currentLiberation === AutoClan$$$_get_floundry_locations_lastLiberation
  ) {
    return AutoClan$$$_get_floundry_locations_floundryLocations;
  }

  if (!AutoClan$$auto_get_clan_lounge().has($item`Clan Floundry`)) {
    return AutoClan$$$_get_floundry_locations_floundryLocations;
  }

  const page: string = visitUrl("clan_viplounge.php?action=floundry");
  auto_log_info("Generating Floundry Locations for the session...", "blue");

  const place_matcher: AshMatcher = new AshMatcher(
    "(?:carp|cod|trout|bass|hatchetfish|tuna):</b>\\s(.*?)<(?:br|/td)>",
    page,
  );
  while (place_matcher.find()) {
    AutoClan$$$_get_floundry_locations_floundryLocations.set(
      toLocation(place_matcher.group(1)),
      true,
    );
  }

  AutoClan$$$_get_floundry_locations_lastClanCheck = getClanId();
  AutoClan$$$_get_floundry_locations_lastCheck = myDaycount();
  AutoClan$$$_get_floundry_locations_lastLiberation = currentLiberation;
  return AutoClan$$$_get_floundry_locations_floundryLocations;
}

let AutoClan$$whitelists: Clan[];
let AutoClan$$lastChecked: number = 0;

function AutoClan$$getClans(): Clan[] {
  if (AutoClan$$lastChecked + 60_000 > Date.now()) {
    return AutoClan$$whitelists;
  }

  AutoClan$$whitelists = Clan.getWhitelisted();
  AutoClan$$lastChecked = Date.now();
  return AutoClan$$whitelists;
}

function AutoClan$$normalizeClanName(name: string): string {
  return name.toLowerCase().trim();
}

function AutoClan$$findClan(name: string): Clan | undefined {
  const target: string = AutoClan$$normalizeClanName(name);
  return AutoClan$$getClans().find(
    (c) => AutoClan$$normalizeClanName(c.name) === target,
  );
}

export function AutoClan$$canReturnToCurrentClan(): boolean {
  return AutoClan$$findClan(AutoClan$$getClanName()) !== undefined;
}

// User's auto_clanVIPLounge preference, else The Average Clan if we're
// already there, else Bonus Adventures from Hell.
export function AutoClan$$getAwayClanName(
  preferred: string = get("auto_clanVIPLounge"),
): string {
  // If the clan name does not exist, then fall back to our native defaults
  if (preferred === "") {
    preferred = get("auto_clanVIPLounge");
  }

  preferred = preferred.trim();

  if (preferred !== "auto") {
    return preferred;
  }
  return AutoClan$$getClanName() === "The Average Clan"
    ? "The Average Clan"
    : "Bonus Adventures from Hell";
}

export function AutoClan$$isInAwayClan(): boolean {
  return (
    AutoClan$$normalizeClanName(AutoClan$$getClanName()) ===
    AutoClan$$normalizeClanName(AutoClan$$getAwayClanName())
  );
}

export function AutoClan$$isWhitelistedToAwayClan(): boolean {
  return AutoClan$$findClan(AutoClan$$getAwayClanName()) !== undefined;
}

export function AutoClan$$canJumpToAwayClan(): boolean {
  return (
    AutoClan$$isWhitelistedToAwayClan() && AutoClan$$canReturnToCurrentClan()
  );
}

export function AutoClan$$changeClan(clanIdOrName: string | number): number {
  const canReturn: boolean = AutoClan$$canReturnToCurrentClan();

  const toClan: Clan | undefined =
    typeof clanIdOrName === "number"
      ? AutoClan$$getClans().find((c) => c.id === clanIdOrName)
      : AutoClan$$findClan(clanIdOrName);

  if (!toClan) {
    auto_log_warning(
      "Do not have a whitelist to destination clan, can not change clans.",
    );
    return 0;
  }

  if (!canReturn) {
    auto_log_warning(
      "Do not have a whitelist to our own clan, can not change clans.",
    );
    return 0;
  }

  const oldClan: number = getClanId();
  if (toClan.id === oldClan) {
    auto_log_debug(
      `Already in this clan, no need to try to change (${toClan.name})`,
      "red",
    );
    return oldClan;
  }

  Clan.join(toClan.id);

  if (getClanId() === oldClan) {
    auto_log_error("Clan change failed");
  }
  return getClanId();
}

export function AutoClan$$hotTubSoaksRemaining(): number {
  // mafia will create popup confirming hottub use if in hidden apartment quest and have a curse
  // don't want to break automation so don't allow hottub use in this condition
  if (get("hiddenApartmentProgress") < 7) {
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

  return 5 - get("_hotTubSoaks");
}

export function AutoClan$$isHotTubAvailable(): boolean {
  return (
    itemAmount($item`Clan VIP Lounge key`) > 0 &&
    isUnrestricted($item`Clan VIP Lounge key`)
  );
}

export function AutoClan$$doHottub(): number {
  //Returns number of usages left.

  if (!(
    AutoClan$$isHotTubAvailable() && AutoClan$$hotTubSoaksRemaining() > 0
  )) {
    return 0;
  }
  cliExecute("hottub");

  return AutoClan$$hotTubSoaksRemaining();
}

export function AutoClan$$isSpeakeasyDrink(drink_1: Item): boolean {
  return $items`glass of "milk", cup of "tea", thermos of "whiskey", Lucky Lindy, Bee's Knees, Sockdollager, Ish Kabibble, Hot Socks, Phonus Balonus, Flivver, Sloppy Jalopy`.includes(
    drink_1,
  );
}

export function AutoClan$$canDrinkSpeakeasyDrink(drink_1: Item): boolean {
  if (!AutoClan$$isSpeakeasyDrink(drink_1)) {
    return false;
  }

  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }

  if (get("_speakeasyDrinksDrunk") >= 3) {
    return false;
  }

  if (!AutoClan$$auto_get_clan_lounge().has($item`Clan speakeasy`)) {
    return false;
  }

  if (!AutoClan$$auto_get_clan_lounge().has(drink_1)) {
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

export function AutoClan$$drinkSpeakeasyDrink(drink_1: Item): boolean {
  if (!AutoClan$$canDrinkSpeakeasyDrink(drink_1)) {
    return false;
  }

  return cliExecute(`drink 1 ${drink_1}`);
}

export function AutoClan$$zataraAvailable(): boolean {
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }
  if (get("_clanFortuneBuffUsed")) {
    return false;
  }

  if (!isUnrestricted($item`Clan Carnival Game`)) {
    return false;
  }

  if (!AutoClan$$auto_get_clan_lounge().has($item`Clan Carnival Game`)) {
    return false;
  }
  return true;
}

export function AutoClan$$zataraSeaside(who: string): boolean {
  if (!AutoClan$$zataraAvailable()) {
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
  set("_clanFortuneBuffUsed", true);
  return true;
}

const AutoClan$$knownConsultBots: ReadonlyMap<string, number> = new Map([
  ["OnlyFax", 3690803],
  ["AverageChat", 3095601],
]);

function AutoClan$$getDefaultConsultBot(defaultClan: string): string {
  return AutoClan$$normalizeClanName(defaultClan) === "the average clan"
    ? "AverageChat"
    : "OnlyFax";
}

function AutoClan$$toResolvedPlayer(id: number): {
  player: number;
  name: string;
} {
  return { player: id, name: getPlayerName(id) };
}

function AutoClan$$resolveConsultPlayer(
  requestedPlayer: string,
): { player: number; name: string } | undefined {
  for (const [botName, id] of AutoClan$$knownConsultBots) {
    if (
      botName.toLowerCase() === requestedPlayer.toLowerCase() ||
      id.toString() === requestedPlayer
    ) {
      return { player: id, name: botName };
    }
  }

  if (/^\d+$/.test(requestedPlayer)) {
    return AutoClan$$toResolvedPlayer(parseInt(requestedPlayer));
  }

  const playerId: string = getPlayerId(requestedPlayer);
  return /^\d{2,}$/.test(playerId)
    ? AutoClan$$toResolvedPlayer(parseInt(playerId))
    : undefined;
}

export function AutoClan$$zataraClanmate(): boolean {
  if (itemAmount($item`Clan VIP Lounge key`) === 0) {
    return false;
  }

  if (!isUnrestricted($item`Clan Carnival Game`)) {
    return false;
  }

  if (!AutoClan$$auto_get_clan_lounge().has($item`Clan Carnival Game`)) {
    return false;
  }

  if (get("_clanFortuneConsultUses") >= 3) {
    return false;
  }

  const oldClan: number = getClanId();
  const consultClan: string = AutoClan$$getAwayClanName(
    get("auto_consultClan"),
  );
  const requestedPlayer: string = get(
    "auto_consultChoice",
    AutoClan$$getDefaultConsultBot(consultClan),
  ).trim();

  const resolved = AutoClan$$resolveConsultPlayer(requestedPlayer);
  if (!resolved) {
    return false;
  }
  const { player, name } = resolved;

  if (!isOnline(name)) {
    // consult will not return in reasonable timeframe
    return false;
  }

  AutoClan$$changeClan(consultClan);
  if (
    AutoClan$$getClanName() !== consultClan &&
    getClanId().toString() !== consultClan
  ) {
    set("_clanFortuneConsultUses", 42069);
    return false;
  }

  let needWait: boolean = true;
  let attempts: number = 0;

  while (attempts < 5) {
    visitUrl("clan_viplounge.php?preaction=lovetester", false);
    let choices: string = "&q1=pizza&q2=batman&q3=thick";
    if (get("auto_optimizeConsultsInRun", false) && myPath() !== $path.none) {
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
      set("_clanFortuneConsultUses", 3);
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

  AutoClan$$changeClan(oldClan);
  if (needWait) {
    wait(10);
  }
  return true;
}

export function AutoClan$$auto_floundryUse(): boolean {
  if (!get("_floundryItemUsed")) {
    for (const it of $items`bass clarinet, codpiece, fish hatchet`) {
      if (possessEquipment(it)) {
        use(1, it);
        return true;
      }
    }
  }
  return false;
}

export function AutoClan$$auto_floundryAction(): boolean {
  if (get("_floundryItemCreated")) {
    return false;
  }
  if (
    !get("_floundryItemCreated", false) &&
    AutoClan$$auto_get_clan_lounge().has($item`Clan Floundry`) &&
    !inAftercore()
  ) {
    if (get("auto_floundryChoice") !== "") {
      const floundryChoice: Map<number, string> = new Map(
        splitString(get("auto_floundryChoice"), ";").map((_v, _i) => [_i, _v]),
      );
      const myFloundry: Item = toItem(
        String(
          floundryChoice.get(min(floundryChoice.size, myDaycount()) - 1) ?? "",
        ).trim(),
      );
      if (AutoClan$$auto_floundryAction$1(myFloundry)) {
        if (
          $items`bass clarinet, codpiece, fish hatchet`.includes(myFloundry) &&
          !get("_floundryItemUsed") &&
          itemAmount(myFloundry) > 0
        ) {
          use(1, myFloundry);
        }
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

function AutoClan$$auto_floundryAction$1(it: Item): boolean {
  if (get("_floundryItemCreated")) {
    return false;
  }
  const fish: Map<Item, number> = AutoClan$$auto_get_clan_lounge();
  if ((fish.get(it) ?? 0) > 0) {
    visitUrl(
      `clan_viplounge.php?preaction=buyfloundryitem&whichitem=${toInt(it)}`,
    );
    return true;
  }
  return false;
}
