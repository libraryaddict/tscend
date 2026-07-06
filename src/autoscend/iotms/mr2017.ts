import {
  abort,
  ceil,
  Class,
  cliExecute,
  containsText,
  create,
  Effect,
  Element,
  Familiar,
  fuelCost,
  getFuel,
  getProperty,
  haveEffect,
  haveFamiliar,
  haveSkill,
  isUnrestricted,
  Item,
  itemAmount,
  Location,
  max,
  min,
  Monster,
  myAdventures,
  myAscensions,
  myClass,
  myDaycount,
  myFamiliar,
  myHash,
  myLevel,
  myLocation,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  myTurncount,
  npcPrice,
  Path,
  setProperty,
  Skill,
  splitString,
  Stat,
  toBoolean,
  toEffect,
  toFloat,
  toInt,
  toItem,
  toLowerCase,
  turnsPlayed,
  urlEncode,
  use,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import { autoAdv$2, autoAdvBypass, CombatMacro } from "../auto_adventure";
import { possessEquipment } from "../auto_equipment";
import {
  canChangeFamiliar,
  canChangeToFamiliar,
  lookupFamiliarDatafile,
  pathHasFamiliar,
} from "../auto_familiar";
import {
  auto_get_campground,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
  backupSetting,
  handleTracker$1,
  handleTracker$2,
  internalQuestStatus,
  isGeneralStoreAvailable,
  meatReserve,
  wrap_item,
} from "../auto_util";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { inAftercore } from "../paths/casual";
import { in_darkGyffte } from "../paths/dark_gyffte";
import { glover_usable$1, in_glover } from "../paths/g_lover";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { in_wereprof, is_professor } from "../paths/wereprofessor";
import { AshMatcher } from "../utils/kolmafiaUtils";

//	This is meant for items that have a date of 2017.

function auto_hasMummingTrunk(): boolean {
  if (
    !pathHasFamiliar() ||
    itemAmount(Item.get("mumming trunk")) === 0 ||
    !auto_is_valid(Item.get("mumming trunk"))
  ) {
    return false;
  }
  return true;
}

//Defined in autoscend/iotms/mr2017.ash
export function auto_checkFamiliarMummery(fam: Familiar): boolean {
  if (containsText(getProperty("_mummeryMods"), fam.toString())) {
    return false;
  }
  return true;
}

function mummifyFamiliar(fam: Familiar, bonus: string): boolean {
  if (
    !canChangeToFamiliar(fam) ||
    !auto_hasMummingTrunk() ||
    !auto_checkFamiliarMummery(fam)
  ) {
    return false;
  }

  bonus = toLowerCase(bonus);
  // I don't want to alter CS behaviour so I'm leaving a couple things in that are otherwise irrelevant.
  const last: Familiar = myFamiliar();
  let goal: number = 0;

  switch (bonus) {
    case "1":
    case "meat":
      goal = 1;
      break;
    case "2":
    case "mp":
    case "mp regen":
    case "mpregen":
      goal = 2;
      break;
    case "3":
    case "mus":
    case "muscle":
      goal = 3;
      break;
    case "4":
    case "item":
      goal = 4;
      break;
    case "5":
    case "mysticality":
    case "myst":
      goal = 5;
      break;
    case "6":
    case "hp":
    case "hp regen":
    case "hpregen":
      goal = 6;
      break;
    case "7":
    case "mox":
    case "moxie":
      goal = 7;
      break;
    default:
      return false;
  }

  if (
    containsText(getProperty("_mummeryUses"), goal.toString()) ||
    goal < 1 ||
    goal >= 8
  ) {
    return false;
  }
  // CS will use this.
  if (canChangeFamiliar()) {
    useFamiliar(fam);
  }

  cliExecute(`mummery ${goal}`);
  // CS will use this.
  if (myFamiliar() !== last && canChangeFamiliar()) {
    useFamiliar(last);
  }

  return true;
}
// Will provide the appropriate bonus to an arbitrary familiar.
function mummifyFamiliar$1(fam: Familiar): boolean {
  if (!auto_hasMummingTrunk() || !auto_checkFamiliarMummery(fam)) {
    return false;
  }

  let targetBonus: string = "";

  switch (myFamiliar()) {
    case lookupFamiliarDatafile("meat"):
      targetBonus = "meat";
      break;
    case lookupFamiliarDatafile("item"):
      targetBonus = "item";
      break;
    case lookupFamiliarDatafile("gremlins"):
      targetBonus = "hp";
      break;
    case lookupFamiliarDatafile("regen"):
      targetBonus = "mp";
      break;
    case lookupFamiliarDatafile("stat"):
      targetBonus = myPrimestat().toString();
      break;
  }
  return mummifyFamiliar(fam, targetBonus);
}

export function mummifyFamiliar$2(): boolean {
  return mummifyFamiliar$1(myFamiliar());
}

function pantogramPants(): boolean {
  return pantogramPants$1(myPrimestat(), Element.get("cold"), 1, 2, 1);
}

export function pantogramPants$1(
  st: Stat,
  el: Element,
  hpmp: number,
  meatItemStats: number,
  misc: number,
): boolean {
  if (!auto_is_valid(Item.get("portable pantogram"))) {
    return false;
  }
  if (itemAmount(Item.get("portable pantogram")) === 0) {
    return false;
  }
  if (possessEquipment(Item.get("pantogram pants"))) {
    return false;
  }
  let m: number = 0;
  switch (st) {
    case Stat.get("Muscle"):
      m = 1;
      break;
    case Stat.get("Mysticality"):
      m = 2;
      break;
    case Stat.get("Moxie"):
      m = 3;
      break;
  }

  let e: number = 0;
  switch (el) {
    case Element.get("hot"):
      e = 1;
      break;
    case Element.get("cold"):
      e = 2;
      break;
    case Element.get("spooky"):
      e = 3;
      break;
    case Element.get("sleaze"):
      e = 4;
      break;
    case Element.get("stench"):
      e = 5;
      break;
  }

  if (hpmp < 1 || hpmp > 9) {
    auto_log_warning(
      "Invalid BottomLeft specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }
  if (meatItemStats < 1 || meatItemStats > 12) {
    auto_log_warning(
      "Invalid BottomRight specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }
  if (misc < 1 || misc > 11) {
    auto_log_warning(
      "Invalid BottomMiddle specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }

  let itemId: number = 0;
  let itemQty: number = 0;
  switch (hpmp) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 464;
      itemQty = 1;
      break;
    case 4:
      itemId = 830;
      itemQty = 1;
      break;
    case 5:
      itemId = 2438;
      itemQty = 1;
      break;
    case 6:
      itemId = 1658;
      itemQty = 1;
      break;
    case 7:
      itemId = 5789;
      itemQty = 1;
      break;
    case 8:
      itemId = 8455;
      itemQty = 1;
      break;
    case 9:
      itemId = 705;
      itemQty = 1;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s1: string = `${itemId},${itemQty}`;

  switch (meatItemStats) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 173;
      itemQty = 1;
      break;
    case 4:
      itemId = 706;
      itemQty = 1;
      break;
    case 5:
      itemId = 80;
      itemQty = 1;
      break;
    case 6:
      itemId = 7338;
      itemQty = 1;
      break;
    case 7:
      itemId = 747;
      itemQty = 3;
      break;
    case 8:
      itemId = 559;
      itemQty = 3;
      break;
    case 9:
      itemId = 27;
      itemQty = 3;
      break;
    case 10:
      itemId = 7327;
      itemQty = 5;
      break;
    case 11:
      itemId = 7324;
      itemQty = 5;
      break;
    case 12:
      itemId = 7330;
      itemQty = 5;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s2: string = `${itemId},${itemQty}`;

  switch (misc) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 70;
      itemQty = 1;
      break;
    case 4:
      itemId = 704;
      itemQty = 1;
      break;
    case 5:
      itemId = 865;
      itemQty = 11;
      break;
    case 6:
      itemId = 6851;
      itemQty = 1;
      break;
    case 7:
      itemId = 3495;
      itemQty = 11;
      break;
    case 8:
      itemId = 9008;
      itemQty = 1;
      break;
    case 9:
      itemId = 1907;
      itemQty = 15;
      break;
    case 10:
      itemId = 14;
      itemQty = 99;
      break;
    case 11:
      itemId = 24;
      itemQty = 1;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s3: string = `${itemId},${itemQty}`;

  if (m < 1 || m > 3) {
    auto_log_warning("Invalid stat specifier for pANts. Failing pANts.", "red");
    return false;
  }
  if (e < 1 || e > 5) {
    auto_log_warning(
      "Invalid elemental specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }

  let page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${toInt(Item.get("portable pantogram"))}`,
  );
  //<tr><td style="color: white;" align=center bgcolor=blue><b>Results:</b></td></tr><tr><td style="padding: 5px; border: 1px solid blue;"><center><table><tr><td><span class='guts'>Something went awry.</span></td></tr>

  page = visitUrl(
    `choice.php?pwd=&whichchoice=1270&option=1&m=${m}&e=${e}&s1=${s1}&s2=${s2}&s3=${s3}`,
  );
  return true;
}

export function loveTunnelAcquire(
  enforcer: boolean,
  statItem: Stat,
  engineer: boolean,
  loveEffect: number,
  equivocator: boolean,
  giftItem: number,
): boolean {
  return loveTunnelAcquire$1(
    enforcer,
    statItem,
    engineer,
    loveEffect,
    equivocator,
    giftItem,
    "",
  );
}

function loveTunnelAcquire$1(
  enforcer: boolean,
  statItem: Stat,
  engineer: boolean,
  loveEffect: number,
  equivocator: boolean,
  giftItem: number,
  option: string,
): boolean {
  if (toBoolean(getProperty("_loveTunnelUsed"))) {
    return false;
  }
  if (loveEffect < 0 || loveEffect > 4) {
    return false;
  }
  if (giftItem < 0 || giftItem > 7) {
    return false;
  }
  if (giftItem === 6 && !haveFamiliar(Familiar.get("Space Jellyfish"))) {
    return false;
  }
  if (loveEffect === 2 && !pathHasFamiliar()) {
    loveEffect = 3;
  }
  if (isActuallyEd() && (myMp() < 20 || myTurncount() < 10)) {
    return false;
  }
  if ((in_wereprof() && turnsPlayed() < 50) || is_professor()) {
    return false; //don't try LOV Tunnel if haven't retransformed back to werewolf or is a professor in WereProf
  }

  const temp: string = visitUrl("place.php?whichplace=town_wrong");
  if (!containsText(temp, "townwrong_tunnel")) {
    return false;
  }

  backupSetting("choiceAdventure1222", "1"); // The Tunnel of L.O.V.E.

  if (enforcer) {
    backupSetting("choiceAdventure1223", "1"); // L.O.V. Entrance - Fight Enforcer
  } else {
    backupSetting("choiceAdventure1223", "2"); // L.O.V. Entrance - Skip Enforcer
  }

  let statValue: number = 4;
  if (statItem === Stat.none) {
    if (in_darkGyffte() && possessEquipment(Item.get("vampyric cloake"))) {
      statItem = Stat.get("Muscle");
    } else {
      statItem = myPrimestat();
    }
  }
  switch (statItem) {
    case Stat.get("Muscle"):
      statValue = 1;
      break;
    case Stat.get("Mysticality"):
      statValue = 2;
      break;
    case Stat.get("Moxie"):
      statValue = 3;
      break;
  }

  if (
    !haveSkill(Skill.get("Torso Awareness")) &&
    !haveSkill(Skill.get("Best Dressed")) &&
    statValue === 1
  ) {
    if (
      !(
        possessEquipment(Item.get("protonic accelerator pack")) ||
        possessEquipment(Item.get("vampyric cloake"))
      ) &&
      auto_is_valid(Item.get("LOV Epaulettes"))
    ) {
      statValue = 2;
    } else {
      statValue = 3;
    }
  }

  if (!auto_is_valid(Item.get("LOV Epaulettes")) && statValue === 2) {
    // if myst and in G-Lover
    statValue = 3; // Resistance and Meat seems better than ML
  }

  backupSetting("choiceAdventure1224", statValue.toString()); // L.O.V. Equipment Room
  //1		Cardigan,			LOV Eardigan	Shirt - 25% Muscle Stats, 8-12HP Regen, +25ML, End of Day
  //2		Epaulettes,			LOV Epaulettes	Back  - 25% Myst Stats, 4-6MP Regen, -3MPCombatSkills, End of Day
  //3		Earrings			LOV Earrings	Acc   - 25% Moxie Stats, +3 PrismRes, +50% Meat, End of Day
  //4		Nothing

  if (engineer) {
    backupSetting("choiceAdventure1225", "1"); // L.O.V. Engine Room - Fight Engineer
  } else {
    backupSetting("choiceAdventure1225", "2"); // L.O.V. Engine Room - Skip Engineer
  }

  if (in_glover()) {
    loveEffect = 3; // Item drops seems better than familiar weight
  }

  backupSetting("choiceAdventure1226", loveEffect.toString()); // L.O.V. Emergency Room
  //1	Lovebotamy					+10 stats per fight
  //2	Open Heart Surgery			+10 familiar weight (50 adventures)
  //3	Wandering Eye Surgery		+50% item drops (50 adventures)
  //4	Nothing

  if (equivocator) {
    backupSetting("choiceAdventure1227", "1"); // L.O.V. Elbow Room - Fight Equivocator
  } else {
    backupSetting("choiceAdventure1227", "2"); // L.O.V. Elbow Room - Skip Equivocator
  }

  if (in_glover()) {
    giftItem = 1; // Only item G-Lover can use
  }

  backupSetting("choiceAdventure1228", giftItem.toString());
  //1		Boomerang			LOV Enamorang (combat item) stagger, consumed (15 turn later copy?)
  //2		Toy Dart Gun		LOV Emotionizer (usable self/others)
  //3		Chocolate			LOV Extraterrestrial Chocolate (+3/2/1 advs, independent chocolate?)
  //4		Flowers				LOV Echinacea Bouquet (Spleen). (stats + small hp/mp, 1 toxicity)
  //5		Plush Elephant		LOV Elephant (Shield, DR+10)
  //6		Toast? Only with Space Jellyfish?
  //7		Nothing

  const retval: boolean = autoAdv$2(Location.get("The Tunnel of L.O.V.E."));

  if (itemAmount(Item.get("LOV Extraterrestrial Chocolate")) > 0) {
    use(1, Item.get("LOV Extraterrestrial Chocolate"));
  }
  return retval;
}

export function kgbWasteClicks(): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!auto_is_valid(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (toInt(getProperty("_kgbClicksUsed")) >= 22) {
    return false;
  }

  auto_log_info$1("kgbWasteClicks() will now use up remaining KGB clicks");
  let clicked: number = 0;
  while (kgbDiscovery() && clicked < 10) {
    clicked++;
  }
  // Yes, this will not be pleasant if we matched our number and each page click changes the buttons.
  while (toInt(getProperty("_kgbClicksUsed")) < 22 && clicked < 9) {
    const start_1: number = clicked;
    for (const ef of Effect.get([
      "Items Are Forever",
      "A View to Some Meat",
      "Light!",
      "The Spy Who Loved XP",
      "Initiative and Let Die",
      "The Living Hitpoints",
      "License to Punch",
      "Goldentongue",
      "Thunderspell",
    ])) {
      if (containsText(getProperty("auto_kgbTracker"), `:${toInt(ef)}`)) {
        kgbTryEffect(ef);
        clicked++;
        if (
          Effect.get(["Items Are Forever", "A View to Some Meat"]).includes(ef)
        ) {
          if (haveEffect(ef) < 150) {
            break;
          }
        }
        if (ef === Effect.get("Light!")) {
          break;
        }
      }
    }
    if (start_1 === clicked) {
      auto_log_warning$1(
        "kgbWasteClicks() was unable to spend your remaining KGB clicks on buffs for some reason. Please spend them manually",
      );
      break; //prevent infinite loop
    }
  }

  return clicked > 0;
}

function kgbKnownEffects(): string {
  if (getProperty("auto_kgbTracker") === "") {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  let tracker: Map<number, string> = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );
  if (
    tracker.size < 13 ||
    toInt(tracker.get(0) ?? tracker.set(0, "").get(0)) != myAscensions()
  ) {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  tracker = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );

  let retval: string = "";

  for (let i: number = 1; i < 13; i++) {
    const tabNum: number = (i + 1) / 2;
    const lowHigh: number = (i + 1) % 2;
    const ef: Effect = toEffect(tracker.get(i) ?? tracker.set(i, "").get(i));
    let efname: string = ef.toString();
    if (ef === Effect.get("Light!")) {
      efname = "Random";
    }

    retval += `Tab: ${tabNum} Height: ${lowHigh} with effect: ${efname}<br>`;
  }
  return retval;
}

function kgbTryEffect(ef: Effect): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (toInt(getProperty("_kgbClicksUsed")) >= 22) {
    return false;
  }

  if (getProperty("auto_kgbTracker") === "") {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  let tracker: Map<number, string> = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );
  if (
    tracker.size < 13 ||
    toInt(tracker.get(0) ?? tracker.set(0, "").get(0)) != myAscensions()
  ) {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  tracker = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );

  for (let i: number = 1; i < 13; i++) {
    if (toEffect(tracker.get(i) ?? tracker.set(i, "").get(i)) === ef) {
      const button: number = (i + 1) / 2;
      const page: string = visitUrl(
        `place.php?whichplace=kgb&action=kgb_tab${button}`,
        false,
      );
      return true;
    }
  }
  return true;
}

function kgbDiscovery(): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (toInt(getProperty("_kgbClicksUsed")) >= 22) {
    return false;
  }

  if (getProperty("auto_kgbTracker") === "") {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  let tracker: Map<number, string> = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );
  if (
    tracker.size < 13 ||
    toInt(tracker.get(0) ?? tracker.set(0, "").get(0)) != myAscensions()
  ) {
    setProperty("auto_kgbTracker", `${myAscensions()}:0:0:0:0:0:0:0:0:0:0:0:0`);
  }
  tracker = new Map(
    splitString(getProperty("auto_kgbTracker"), ":").map((_v, _i) => [_i, _v]),
  );

  const page: string = visitUrl("place.php?whichplace=kgb", false);
  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    const id: number = toInt(tabCount.group(1));
    const height: number = toInt(tabCount.group(2));
    const index: number = (id - 1) * 2 + height;
    if (toInt(tracker.get(index) ?? tracker.set(index, "").get(index)) === 0) {
      auto_log_info(`We do not know ${id} of height: ${height}`, "green");
      const curEff: number[] = [];
      for (let i: number = 2296; i <= 2306; i++) {
        curEff[i - 2296] = haveEffect(toEffect(i));
      }
      const page_1: string = visitUrl(
        `place.php?whichplace=kgb&action=kgb_tab${id}`,
        false,
      );
      for (let i: number = 2296; i <= 2306; i++) {
        if (haveEffect(toEffect(i)) !== (curEff[i - 2296] ??= 0)) {
          if (haveEffect(toEffect(i)) === (curEff[i - 2296] ??= 0) + 100) {
            auto_log_info("It contains random!", "green");
            tracker.set(index, (1).toString());
          } else {
            auto_log_info(`It contains ${toEffect(i)}!`, "green");
            tracker.set(index, i.toString());
          }
        }
      }
      let newTracker: string = myAscensions().toString();
      for (let i: number = 1; i < 13; i++) {
        newTracker += `:${tracker.get(i) ?? tracker.set(i, "").get(i)}`;
      }
      setProperty("auto_kgbTracker", newTracker);
      return true;
    }
  }
  return false;
}

function kgb_tabCount(page: string): number {
  let count_1: number = 0;
  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    count_1++;
  }
  return count_1;
}

function kgb_tabHeight(page: string): number {
  let height: number = 0;

  let printTabs: boolean = false;
  const ring_matcher: AshMatcher = new AshMatcher("lightrings(\\d+)", page);
  if (ring_matcher.find()) {
    const image: number = toInt(ring_matcher.group(1));
    auto_log_info(`Found rings of value ${image}`, "blue");
    printTabs = true;
  }

  const tabCount: AshMatcher = new AshMatcher(
    "kgb_tab(\\d)(?:.*?)otherimages/kgb/tab(\\d+).gif",
    page,
  );
  while (tabCount.find()) {
    height += toInt(tabCount.group(2));
    if (printTabs) {
      const id: number = toInt(tabCount.group(1));
      const height_1: number = toInt(tabCount.group(2));
      auto_log_info(`Tab ${id} with height of ${height_1}`, "green");
    }
  }

  return height;
}

export function kgbSetup(): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!auto_is_valid(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }

  if (toBoolean(getProperty("_auto_kgbSetup"))) {
    return false;
  }

  if (myDaycount() !== 1) {
    return false;
  }

  setProperty("_auto_kgbSetup", true.toString());

  let page: string = visitUrl("place.php?whichplace=kgb");
  if (
    containsText(page, "kgb_drawer") ||
    containsText(page, "kgb_crank") ||
    containsText(page, "kgb_button")
  ) {
    return false;
  }

  if (!containsText(page, "kgb_button")) {
    kgbDial(1, -1, 6);
    kgbDial(2, -1, 6);
    kgbDial(3, -1, 6);
    kgbDial(4, -1, 6);
    kgbDial(5, -1, 6);
    kgbDial(6, -1, 6);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    //Crank extruded.
    if (!containsText(page, "kgb_crank")) {
      abort("Failed to unlock kgb_crank");
    }
    page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    for (let i: number = 0; i < 11; i++) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_crank", false);
    }
    if (!containsText(page, "...........")) {
      abort("11 cranks failed");
    }
    page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);

    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    if (!containsText(page, "kgb_dispenser")) {
      abort("Failed to unlock kgb_dispenser");
    }
    //Martini Hose extruded.

    page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    kgbDial(1, -1, 3);
    kgbDial(2, -1, 3);
    kgbDial(3, -1, 3);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
    if (!containsText(page, "kgb_drawer2")) {
      abort("Failed to unlock kgb_drawer2");
    }
    page = visitUrl("place.php?whichplace=kgb&action=kgb_drawer2", false);

    kgbDial(4, -1, 2);
    kgbDial(5, -1, 2);
    kgbDial(6, -1, 2);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${2}`, false);
    if (!containsText(page, "kgb_drawer1")) {
      abort("Failed to unlock kgb_drawer1");
    }
    page = visitUrl("place.php?whichplace=kgb&action=kgb_drawer1", false);

    kgbDial(1, -1, 7);
    kgbDial(2, -1, 9);
    kgbDial(3, -1, 8);
    kgbDial(4, -1, 8);
    kgbDial(5, -1, 9);
    kgbDial(6, -1, 7);
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_actuator${1}`, false);
  }
  if (!containsText(page, "kgb_button")) {
    abort("Failed to unlock kgb_button");
  }

  let button: number = -1;
  page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
  for (let i: number = 1; i <= 6; i++) {
    auto_log_info(`Hitting tab modification button: ${i}`, "blue");
    page = visitUrl(`place.php?whichplace=kgb&action=kgb_button${i}`, false);

    const count_1: number = kgb_tabCount(page);
    const height: number = kgb_tabHeight(page);

    if (count_1 >= 3) {
      button = i;
      i--;
    }

    if (height >= 11) {
      break;
    }
  }
  setProperty("auto_kgbAscension", myAscensions().toString());
  setProperty("auto_kgbButton100", button.toString());

  if (!kgb_getMartini$1(page)) {
    auto_log_warning("Failed to get martini", "red");
  }

  return true;
}

export function kgb_getMartini(): boolean {
  return kgb_getMartini$2("", false);
}

function kgb_getMartini$1(page: string): boolean {
  return kgb_getMartini$2(page, false);
}

function kgb_getMartini$2(page: string, dontCare: boolean): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!auto_is_valid(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (toInt(getProperty("_kgbDispenserUses")) >= 3) {
    return false;
  }

  if (!toBoolean(getProperty("_auto_kgbSetup"))) {
    kgbSetup();
  }

  if (toInt(getProperty("auto_kgbAscension")) !== myAscensions()) {
    if (!dontCare) {
      auto_log_info(
        "We did not initialize the briefcase this ascension, we do not care",
        "red",
      );
      dontCare = true;
    }
  }

  if (page === "") {
    page = visitUrl("place.php?whichplace=kgb");
  }

  if (!toBoolean(getProperty("_kgbDailyStuff"))) {
    let flipped: boolean = false;
    if (containsText(page, "handledown")) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
      flipped = true;
    }
    for (let i: number = 0; i < 11; i++) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_crank", false);
      if (containsText(page, "Nothing seems to happen")) {
        break;
      }
    }
    if (!containsText(page, "...........")) {
      auto_log_warning("Cranking did not work, uh oh!", "red");
    } else {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
      page = visitUrl("place.php?whichplace=kgb&action=kgb_handledown", false);
      auto_log_info("Crank power!!", "green");
    }

    if (flipped) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_handleup", false);
    }

    if (!toBoolean(getProperty("_kgbRightDrawerUsed"))) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_drawer1", false);
    }
    if (!toBoolean(getProperty("_kgbLeftDrawerUsed"))) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_drawer2", false);
    }
    if (!toBoolean(getProperty("_kgbOpened"))) {
      page = visitUrl("place.php?whichplace=kgb&action=kgb_daily", false);
    }
    setProperty("_kgbDailyStuff", true.toString());
  }
  if (toInt(getProperty("_kgbDispenserUses")) >= 3) {
    return false;
  }

  const button: number = toInt(getProperty("auto_kgbButton100"));

  while (
    toInt(getProperty("_kgbDispenserUses")) < 3 &&
    toInt(getProperty("_kgbClicksUsed")) < 22
  ) {
    const served: number = toInt(getProperty("_kgbDispenserUses"));
    const have: number = itemAmount(Item.get("splendid martini"));
    page = visitUrl("place.php?whichplace=kgb&action=kgb_dispenser", false);
    if (containsText(page, "Nothing happens.")) {
      setProperty("_kgbDispenserUses", (3).toString());
      auto_log_warning("The martini dispenser is empty, weird.", "red");
      return true;
    }
    if (kgb_tabHeight(page) < 11 && !dontCare) {
      auto_log_info(
        "Did we accidentally solve a puzzle? Gonna assume so...",
        "green",
      );
      auto_log_info(`Hitting tab modification button: ${button}`, "blue");
      const oldClicks: number = toInt(getProperty("_kgbClicksUsed"));
      page = visitUrl(
        `place.php?whichplace=kgb&action=kgb_button${button}`,
        false,
      );
      const newClicks: number = toInt(getProperty("_kgbClicksUsed"));
      if (newClicks === oldClicks) {
        auto_log_info(
          "_kgbClicksUsed appears to not be tracking, please let the spies in.",
          "red",
        );
        setProperty("_kgbClicksUSed", (newClicks + 1).toString());
      }
      if (kgb_tabHeight(page) < 11) {
        if (button === 0) {
          abort("Cannot seem to recover situation regarding splendid martinis");
        }
        auto_log_info("Trying to restore tabs", "green");
        continue;
      }
    }
    if (have === itemAmount(Item.get("splendid martini")) && !dontCare) {
      abort("Failed to get a splendid martini and we cared about it");
    }
    setProperty("_kgbDispenserUses", (served + 1).toString());
  }
  return true;
}

function kgbDial(dial: number, curVal: number, target: number): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!auto_is_valid(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }

  if (curVal === target) {
    return true;
  }

  while (curVal !== target) {
    const page: string = visitUrl(
      `place.php?whichplace=kgb&action=kgb_dial${dial}`,
      false,
    );
    const dials: Map<number, number> = new Map();
    const dial_matcher: AshMatcher = new AshMatcher(
      'title="Weird Character (.)',
      page,
    );
    let count_1: number = 1;
    while (dial_matcher.find()) {
      const temp: string = dial_matcher.group(1);
      if (temp === "a") {
        dials.set(count_1, 10);
      } else {
        dials.set(count_1, toInt(dial_matcher.group(1)));
      }
      count_1++;
    }
    curVal = dials.get(dial) ?? dials.set(dial, 0).get(dial);
    auto_log_info(`Clicking ${dial} and now: ${curVal}`, "blue");
  }
  return true;
}

function solveKGBMastermind(): boolean {
  if (!possessEquipment(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }
  if (!auto_is_valid(Item.get("Kremlin's Greatest Briefcase"))) {
    return false;
  }

  const page: string = visitUrl("place.php?whichplace=kgb");
  if (containsText(page, "A pair of antennae")) {
    return false;
  }
  if (containsText(page, "kgb_daily")) {
    return false;
  }
  if (containsText(getProperty("_auto_kgbScoresLeft"), "3 0")) {
    if (containsText(getProperty("_auto_kgbScoresRight"), "3 0")) {
      return false;
    }
  }

  if (containsText(page, "kgb_handledown")) {
    const temp: string = visitUrl(
      "place.php?whichplace=kgb&action=kgb_handledown",
    );
  }
  if (!containsText(page, "kgb_handleup")) {
    abort("KGB Handle borken!!");
  }

  let guessString: string = "";
  let clicks: number = 0;
  while (!containsText(page, "A pair of antennae")) {
    const dials: Map<number, number> = new Map();
    let count_1: number = 0;
    const dial_matcher: AshMatcher = new AshMatcher(
      'title="Weird Character (.)',
      page,
    );
    while (dial_matcher.find()) {
      const temp: string = dial_matcher.group(1);
      if (temp === "a") {
        dials.set(count_1, 10);
      } else {
        dials.set(count_1, toInt(dial_matcher.group(1)));
      }
      count_1++;
    }

    auto_log_info(
      `Left side: ${dials.get(0) ?? dials.set(0, 0).get(0)} ${dials.get(1) ?? dials.set(1, 0).get(1)} ${dials.get(2) ?? dials.set(2, 0).get(2)}`,
      "green",
    );
    auto_log_info(
      `Right side: ${dials.get(3) ?? dials.set(3, 0).get(3)} ${dials.get(4) ?? dials.set(4, 0).get(4)} ${dials.get(5) ?? dials.set(5, 0).get(5)}`,
      "green",
    );

    const guess: Map<number, number> = new Map();
    if (guessString === "") {
      guess.set(1, 0);
      guess.set(2, 1);
      guess.set(3, 2);
    } else {
      const digits: Map<number, string> = new Map(
        splitString(guessString, " ").map((_v, _i) => [_i, _v]),
      );
      guess.set(
        1,
        toInt(
          digits.get(digits.size - 3) ??
            digits.set(digits.size - 3, "").get(digits.size - 3),
        ),
      );
      guess.set(
        2,
        toInt(
          digits.get(digits.size - 2) ??
            digits.set(digits.size - 2, "").get(digits.size - 2),
        ),
      );
      guess.set(
        3,
        toInt(
          digits.get(digits.size - 1) ??
            digits.set(digits.size - 1, "").get(digits.size - 1),
        ),
      );
    }

    let prop: string = "_auto_kgbScoresLeft";
    let dialOffset: number = 0;
    const action: string = "1";

    if (containsText(getProperty("_auto_kgbScoresLeft"), "3 0")) {
      prop = "_auto_kgbScoresRight";
      dialOffset = 3;
      const action_1: string = "2";
    }
    //Which one are we doing, if ScoresLeft has 3 0, we are done with it.
    auto_log_info(
      `About to guess: ${guess.get(1) ?? guess.set(1, 0).get(1)}, ${guess.get(2) ?? guess.set(2, 0).get(2)}, ${guess.get(3) ?? guess.set(3, 0).get(3)}`,
      "green",
    );
    for (let i: number = 1; i <= 3; i++) {
      kgbDial(
        dialOffset + i,
        dials.get(dialOffset + i) ??
          dials.set(dialOffset + i, 0).get(dialOffset + i),
        guess.get(i) ?? guess.set(i, 0).get(i),
      );
    }
    //Verify the dials are correct before pushing anything!
    const vDials: Map<number, number> = new Map();
    let vCount: number = 0;
    const vDial_matcher: AshMatcher = new AshMatcher(
      'title="Weird Character (.)',
      page,
    );
    while (vDial_matcher.find()) {
      const temp: string = vDial_matcher.group(1);
      if (temp === "a") {
        vDials.set(vCount, 10);
      } else {
        vDials.set(vCount, toInt(vDial_matcher.group(1)));
      }
      vCount++;
    }

    if (
      (vDials.get(dialOffset + 1) ??
        vDials.set(dialOffset + 1, 0).get(dialOffset + 1)) !==
        (guess.get(1) ?? guess.set(1, 0).get(1)) ||
      (vDials.get(dialOffset + 2) ??
        vDials.set(dialOffset + 2, 0).get(dialOffset + 2)) !==
        (guess.get(2) ?? guess.set(2, 0).get(2)) ||
      (vDials.get(dialOffset + 3) ??
        vDials.set(dialOffset + 3, 0).get(dialOffset + 3)) !==
        (guess.get(3) ?? guess.set(3, 0).get(3))
    ) {
      abort("Dials not set correctly");
    }

    const page_1: string = visitUrl(
      `place.php?whichplace=kgb&action=kgb_actuator${action}`,
      false,
    );
    if (containsText(page_1, "Nothing happens")) {
      auto_log_warning("Out of clicks. Derp.", "red");
      return false;
    }
    let correct: number = 0;
    let blink: number = 0;
    const light_match: AshMatcher = new AshMatcher(
      'kgb_mastermind(\\d)(?:.*?)A light (.*?)"',
      page_1,
    );
    while (light_match.find()) {
      const bulb: number = toInt(light_match.group(1));
      const status: string = light_match.group(2);
      auto_log_info(`Light ${bulb}: ${status}`, "blue");
      if (status === "(on)") {
        correct++;
      }
      if (status === "(blinking)") {
        blink++;
      }
    }
    auto_log_info(`Correct: ${correct} Blinking: ${blink}`, "blue");

    clicks++;

    if (getProperty(prop) === "") {
      setProperty(prop, `${correct} ${blink}`);
    } else {
      setProperty(prop, `${getProperty(prop)} ${correct} ${blink}`);
    }

    guessString = visitUrl(
      `http://cheesellc.com/kol/kgb.php?data=${urlEncode(getProperty(prop))}`,
      false,
    );
    auto_log_info(`Subresult: ${guessString}`, "green");

    if (containsText(guessString, "3 0")) {
      guessString = "";
    }
  }
  auto_log_info(`Clicks used: ${clicks}`, "red");

  return containsText(page, "A pair of antennae");
}

export function getSpaceJelly(): boolean {
  if (!canChangeToFamiliar(Familiar.get("Space Jellyfish"))) {
    return false;
  }
  if (toBoolean(getProperty("_seaJellyHarvested"))) {
    return false;
  }
  if (!haveFamiliar(Familiar.get("Space Jellyfish"))) {
    return false;
  }
  if (myLevel() < 11) {
    return false;
  }
  if (myPath() !== Path.get("Standard")) {
    if (!inAftercore()) {
      return false;
    }
  }

  if (internalQuestStatus("questS01OldGuy") < 0) {
    let temp_1: string = visitUrl("oldman.php");
    temp_1 = visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
  }
  const old: Familiar = myFamiliar();
  useFamiliar(Familiar.get("Space Jellyfish"));
  let temp: string = visitUrl("place.php?whichplace=thesea");
  temp = visitUrl("place.php?whichplace=thesea&action=thesea_left2");
  temp = visitUrl("choice.php?pwd=&whichchoice=1219&option=1");
  useFamiliar(old);
  return true;
}

export function auto_breatheOutsLeft(): number {
  return toInt(getProperty("_hotJellyUses"));
}

function haveAsdonBuff(): boolean {
  for (const eff of Effect.get([
    "Driving Intimidatingly",
    "Driving Obnoxiously",
    "Driving Observantly",
    "Driving Quickly",
    "Driving Recklessly",
    "Driving Safely",
    "Driving Stealthily",
    "Driving Wastefully",
    "Driving Waterproofly",
  ])) {
    if (haveEffect(eff) !== 0) {
      return true;
    }
  }
  return false;
}

function asdonBuff(goal: string): boolean {
  if (
    goal === Effect.get("Driving Obnoxiously").toString() ||
    goal === "combat" ||
    goal === "+combat"
  ) {
    return asdonBuff$1(Effect.get("Driving Obnoxiously"));
  }
  if (
    goal === Effect.get("Driving Stealthily").toString() ||
    goal === "noncombat" ||
    goal === "-combat" ||
    goal === "non-combat"
  ) {
    return asdonBuff$1(Effect.get("Driving Stealthily"));
  }
  if (goal === Effect.get("Driving Wastefully").toString() || goal === "oil") {
    return asdonBuff$1(Effect.get("Driving Wastefully"));
  }
  if (
    goal === Effect.get("Driving Safely").toString() ||
    goal === "resistance" ||
    goal === "absorb" ||
    goal === "res"
  ) {
    return asdonBuff$1(Effect.get("Driving Safely"));
  }
  if (goal === Effect.get("Driving Recklessly").toString() || goal === "ml") {
    return asdonBuff$1(Effect.get("Driving Recklessly"));
  }
  if (
    goal === Effect.get("Driving Intimidatingly").toString() ||
    goal === "-ml"
  ) {
    return asdonBuff$1(Effect.get("Driving Intimidatingly"));
  }
  if (goal === Effect.get("Driving Quickly").toString() || goal === "init") {
    return asdonBuff$1(Effect.get("Driving Quickly"));
  }
  if (
    goal === Effect.get("Driving Observantly").toString() ||
    goal === "drops" ||
    goal === "meat" ||
    goal === "item" ||
    goal === "items" ||
    goal === "booze"
  ) {
    return asdonBuff$1(Effect.get("Driving Observantly"));
  }
  if (
    goal === Effect.get("Driving Waterproofly").toString() ||
    goal === "sea" ||
    goal === "breathe" ||
    goal === "dive" ||
    goal === "diver" ||
    goal === "underwater"
  ) {
    return asdonBuff$1(Effect.get("Driving Waterproofly"));
  }
  return false;
}

export function canAsdonBuff(goal: Effect): boolean {
  if (!auto_get_campground().has(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (
    !Effect.get([
      "Driving Intimidatingly",
      "Driving Obnoxiously",
      "Driving Observantly",
      "Driving Quickly",
      "Driving Recklessly",
      "Driving Safely",
      "Driving Stealthily",
      "Driving Wastefully",
      "Driving Waterproofly",
    ]).includes(goal)
  ) {
    return false;
  }
  if (getFuel() < 37) {
    return false;
  }
  if (
    Effect.get("Driving Wastefully") === goal &&
    toFloat(getProperty("oilPeakProgress")) === 0.0
  ) {
    return false;
  }
  if (haveEffect(goal) > 0) {
    return false;
  }
  return true;
}

export function asdonBuff$1(goal: Effect): boolean {
  if (!canAsdonBuff(goal)) {
    return false;
  }

  let needShrug: boolean = false;
  for (const eff of Effect.get([
    "Driving Intimidatingly",
    "Driving Obnoxiously",
    "Driving Observantly",
    "Driving Quickly",
    "Driving Recklessly",
    "Driving Safely",
    "Driving Stealthily",
    "Driving Wastefully",
    "Driving Waterproofly",
  ])) {
    if (haveEffect(eff) > 0 && eff !== goal) {
      needShrug = true;
    }
  }

  if (needShrug) {
    const temp_1: string = visitUrl("campground.php?pwd=&preaction=undrive");
  }

  let effectNum: number = -1;
  switch (goal) {
    case Effect.get("Driving Intimidatingly"):
      effectNum = 6;
      break;
    case Effect.get("Driving Obnoxiously"):
      effectNum = 0;
      break;
    case Effect.get("Driving Observantly"):
      effectNum = 7;
      break;
    case Effect.get("Driving Quickly"):
      effectNum = 5;
      break;
    case Effect.get("Driving Recklessly"):
      effectNum = 4;
      break;
    case Effect.get("Driving Safely"):
      effectNum = 3;
      break;
    case Effect.get("Driving Stealthily"):
      effectNum = 1;
      break;
    case Effect.get("Driving Wastefully"):
      effectNum = 2;
      break;
    case Effect.get("Driving Waterproofly"):
      effectNum = 8;
      break;
  }
  const temp: string = visitUrl(
    `campground.php?pwd=&preaction=drive&whichdrive=${effectNum}`,
  );

  return true;
}

export function asdonAutoFeed(): boolean {
  return asdonAutoFeed$1(-1);
}

function asdonAutoFeed$1(goal: number): boolean {
  if (myClass() === Class.get("Ed the Undying")) {
    return false;
  }
  if (!auto_get_campground().has(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (getFuel() > 137) {
    return false;
  }
  if (inAftercore()) {
    return false;
  }

  if (goal === -1) {
    goal = 137;
    if (toBoolean(getProperty("_missileLauncherUsed"))) {
      goal = 87;
    }
  }

  let didOnce: boolean = false;
  for (const it of Item.get([
    "a little sump'm sump'm",
    "ancient frozen dinner",
    "antique packet of ketchup",
    "backwoods screwdriver",
    "bag of GORP",
    "ballroom blintz",
    "bean burrito",
    "bilge wine",
    "bottle of laundry sherry",
    "bowl of cottage cheese",
    "black forest ham",
    "cactus fruit",
    "CSA scoutmaster's &quot;water&quot;",
    "enchanted bean burrito",
    "giant heirloom grape tomato",
    "gin and tonic",
    "haggis-wrapped haggis-stuffed haggis",
    "ice-cold Willer",
    "insanely spicy bean burrito",
    "insanely spicy enchanted bean burrito",
    "insanely spicy jumping bean burrito",
    "jumping bean burrito",
    "jungle floor wax",
    "loaf of soda bread",
    "margarita",
    "McLeod's Hard Haggis-Ade",
    "mimosette",
    "Mornington crescent roll",
    "open sauce",
    "pink pony",
    "roll in the hay",
    "screwdriver",
    "slap and tickle",
    "slip 'n' slide",
    "snifter of thoroughly aged brandy",
    "spicy bean burrito",
    "spicy enchanted bean burrito",
    "spicy jumping bean burrito",
    "stolen sushi",
    "strawberry daiquiri",
    "tequila sunrise",
    "tequila sunset",
    "Typical Tavern swill",
    "vodka and tonic",
    "water purification pills",
    "zmobie",
  ])) {
    if (itemAmount(it) > 0) {
      let toFeed: number = min(10, itemAmount(it));
      if (getProperty("auto_ashtonLimit") !== "") {
        const limit: number = toInt(getProperty("auto_ashtonLimit"));
        toFeed = max(0, toFeed - limit);
      }
      asdonFeed(it, toFeed);
      didOnce = true;
    }
    if (getFuel() > goal) {
      break;
    }
  }

  const meat_cutoff: number = max(3500, 2000 + meatReserve());
  const can_buy_dough: boolean = npcPrice(Item.get("wad of dough")) > 0;
  const can_buy_flower: boolean =
    npcPrice(Item.get("all-purpose flower")) > 0 &&
    auto_is_valid(Item.get("all-purpose flower"));
  //Dough prices: Madeline's Baking Supply is 40. other stores 50. flower ~50 meat per dough in batches of ~40.
  //only use flower if direct buying of dough is not available.
  if (
    getFuel() < goal &&
    myMeat() > meat_cutoff &&
    isGeneralStoreAvailable() &&
    !in_koe() &&
    can_buy_flower &&
    !can_buy_dough
  ) {
    let want: number = (goal + 5 - getFuel()) / 6;
    want = min(3 + (myMeat() - meat_cutoff) / 1000, want);
    if (want > 0) {
      //flower drops 35 to 45 wads of dough per use. safeguard against inf loop. assume worst drop to let it run enough times.
      const loop_count: number = ceil(want / 35);
      for (
        let i = 1,
          _last_2 = loop_count,
          _step_2 = 1,
          _up_2 = i <= _last_2,
          _inc_2 = _up_2 ? Math.abs(_step_2) : -Math.abs(_step_2);
        _up_2 ? i <= _last_2 : i >= _last_2;
        i += _inc_2
      ) {
        if (
          myMeat() > meat_cutoff &&
          itemAmount(Item.get("wad of dough")) < want
        ) {
          use(1, Item.get("all-purpose flower")); //mafia will automatically buy it first
        }
      }
      want = min(want, itemAmount(Item.get("wad of dough")));
      create(want, Item.get("loaf of soda bread"));
      asdonFeed(Item.get("loaf of soda bread"), want);
      didOnce = true;
    }
  }

  if (
    getFuel() < goal &&
    myMeat() > meat_cutoff &&
    can_buy_dough &&
    isGeneralStoreAvailable() &&
    !in_koe()
  ) {
    const can_buy: number =
      (myMeat() - meat_cutoff) / npcPrice(Item.get("wad of dough"));
    let want: number = (goal + 5 - getFuel()) / 6;
    want = min(want, can_buy);
    if (want > 0) {
      create(want, Item.get("loaf of soda bread"));
      asdonFeed(Item.get("loaf of soda bread"), want);
      didOnce = true;
    }
  }

  if (didOnce) {
    cliExecute("refresh inv");
  }

  return getFuel() >= goal;
}

function asdonFeed(it: Item, qty: number): boolean {
  if (!auto_get_campground().has(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (!isUnrestricted(Item.get("Asdon Martin keyfob (on ring)"))) {
    return false;
  }
  if (qty < 1 || itemAmount(it) < qty) {
    return false;
  }

  const oldFuel: number = getFuel();
  const temp: string = visitUrl(
    `campground.php?pwd=&action=fuelconvertor&qty=${qty}&iid=${toInt(it)}`,
  );
  const newFuel: number = getFuel();

  auto_log_info(
    `Compressed ${qty} ${it} into sheep, I mean fuel: ${oldFuel} --> ${newFuel}`,
    "green",
  );
  return true;
}

function asdonFeed$1(it: Item): boolean {
  return asdonFeed(it, 1);
}

export function asdonCanMissile(): boolean {
  return (
    auto_get_campground().has(Item.get("Asdon Martin keyfob (on ring)")) &&
    getFuel() >= fuelCost(Skill.get("Asdon Martin: Missile Launcher")) &&
    !toBoolean(getProperty("_missileLauncherUsed"))
  );
}

export function isHorseryAvailable(): boolean {
  return (
    toBoolean(getProperty("horseryAvailable")) &&
    auto_is_valid(Item.get("Horsery contract"))
  );
}

export function horseCost(): number {
  if (toInt(getProperty("_horseryRented")) > 0) {
    return 500;
  }
  return 0;
}

function horseNormalize(horseText: string): string {
  switch (horseText) {
    case "normal horse":
    case "normal":
    case "regen":
    case "init":
      return "normal";
    case "dark horse":
    case "dark":
    case "meat":
    case "-combat":
    case "noncombat":
    case "non-combat":
      return "dark";
    case "crazy horse":
    case "crazy":
    case "hookah":
    case "random":
      return "crazy";
    case "pale horse":
    case "pale":
    case "res":
    case "resistance":
    case "spooky":
    case "damage":
      return "pale";
    case "return":
    case "":
      return "return";
  }

  if (containsText(horseText, "normal horse")) {
    return "normal";
  } else if (containsText(horseText, "dark horse")) {
    return "dark";
  } else if (containsText(horseText, "crazy horse")) {
    return "crazy";
  } else if (containsText(horseText, "pale horse")) {
    return "pale";
  }

  auto_log_warning(
    `Unknown Horsery horse type: '${horseText}'. Should be '', 'normal', 'dark', 'crazy', or 'pale'.`,
    "red",
  );
  return "";
}

function getHorse(type_1: string): boolean {
  if (!toBoolean(getProperty("horseryAvailable"))) {
    return false;
  }
  type_1 = toLowerCase(type_1);
  if (myMeat() < horseCost() && type_1 !== "return") {
    return false;
  }

  let choice: number = -1;
  if (
    horseNormalize(type_1) === "normal" ||
    toInt(getProperty("auto_beatenUpCount")) >= 20
  ) {
    if (getProperty("_horsery") === "normal horse") {
      return false;
    }
    choice = 1;
    setProperty("auto_desiredHorse", "normal");
  } else if (horseNormalize(type_1) === "dark") {
    if (getProperty("_horsery") === "dark horse") {
      return false;
    }
    choice = 2;
    setProperty("auto_desiredHorse", "dark");
  } else if (horseNormalize(type_1) === "crazy") {
    if (containsText(getProperty("_horsery"), "crazy horse")) {
      return false;
    }
    choice = 3;
    setProperty("auto_desiredHorse", "crazy");
  } else if (horseNormalize(type_1) === "pale") {
    if (containsText(getProperty("_horsery"), "pale horse")) {
      return false;
    }
    choice = 4;
    setProperty("auto_desiredHorse", "pale");
  } else if (horseNormalize(type_1) === "return") {
    if (getProperty("_horsery") === "") {
      return false;
    }
    choice = 5;
    setProperty("_horsery", "");
    setProperty("auto_desiredHorse", "return");
  }

  if (choice === -1) {
    return false;
  }
  let temp: string = visitUrl(
    "place.php?whichplace=town_right&action=town_horsery",
  );
  temp = visitUrl(`choice.php?pwd=&whichchoice=1266&option=${choice}`);
  if (choice <= 4) {
    setProperty(
      "_horseryRented",
      (toInt(getProperty("_horseryRented")) + 1).toString(),
    );
  }
  return true;
}

export function horseDefault(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "");
  }
}

export function horseMaintain(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", horseNormalize(getProperty("_horsery")));
  }
}

export function horseNone(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "return");
  }
}

function horseNormal(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "normal");
  }
}

export function horseDark(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "dark");
  }
}

function horseCrazy(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "crazy");
  }
}

function horsePale(): void {
  if (isHorseryAvailable()) {
    setProperty("auto_desiredHorse", "pale");
  }
}

export function horsePreAdventure(): boolean {
  if (!isHorseryAvailable()) {
    return false;
  }

  const desiredHorse: string = getProperty("auto_desiredHorse");
  if (desiredHorse === "") {
    return false;
  }

  if (
    desiredHorse !== "normal" &&
    desiredHorse !== "dark" &&
    desiredHorse !== "crazy" &&
    desiredHorse !== "pale" &&
    desiredHorse !== "return"
  ) {
    auto_log_warning(
      `auto_desiredHorse was set to bad value: '${desiredHorse}'. Should be '', 'normal', 'dark', 'crazy', or 'pale'.`,
      "red",
    );
    setProperty("auto_desiredHorse", "");
    return false;
  }
  return getHorse(desiredHorse);
}

export function auto_haveGenieBottleOrPocketWishes(): boolean {
  const bottle: Item = wrap_item(Item.get("genie bottle"));
  return (
    (itemAmount(bottle) > 0 && auto_is_valid(bottle)) ||
    (itemAmount(Item.get("pocket wish")) > 0 &&
      auto_is_valid(Item.get("pocket wish")))
  );
}

export function auto_wishesAvailable(): number {
  let wishes: number = 0;
  const bottle: Item = wrap_item(Item.get("genie bottle"));
  if (itemAmount(bottle) > 0 && auto_is_valid(bottle)) {
    wishes += 3 - toInt(getProperty("_genieWishesUsed"));
  }
  if (auto_is_valid(Item.get("pocket wish"))) {
    wishes += itemAmount(Item.get("pocket wish"));
  }
  return wishes;
}

export function makeGenieWish(wish: string): boolean {
  const starting_wishes: number = auto_wishesAvailable();
  if (starting_wishes < 1) {
    return false;
  }

  let wish_provider: number = 0;
  const bottle: Item = wrap_item(Item.get("genie bottle"));
  if (
    auto_is_valid(bottle) &&
    itemAmount(bottle) > 0 &&
    toInt(getProperty("_genieWishesUsed")) < 3
  ) {
    wish_provider = toInt(bottle);
  } else if (
    itemAmount(Item.get("pocket wish")) > 0 &&
    auto_is_valid(Item.get("pocket wish"))
  ) {
    wish_provider = toInt(Item.get("pocket wish"));
  }
  if (wish_provider === 0) {
    auto_log_warning(
      "auto_wishesAvailable() thinks I have remaining wishes but makeGenieWish(string wish) was unable to find a valid source for them. wishing failed",
      "red",
    );
    return false;
  }

  let page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${wish_provider}`,
    false,
  );
  page = visitUrl(`choice.php?pwd=&whichchoice=1267&option=1&wish=${wish}`);

  if (auto_wishesAvailable() === starting_wishes) {
    auto_log_warning(`Wish: '${wish}' failed`, "red");
    return false;
  }

  handleTracker$2(
    toItem(wish_provider).toString(),
    myLocation().toString(),
    wish,
    "auto_wishes",
  );
  return true;
}

export function makeGenieWish$1(eff: Effect): boolean {
  if (haveEffect(eff) > 0) {
    return false;
  }
  if (myAdventures() === 0) {
    return false;
  }
  if (!glover_usable$1(eff)) {
    //check if we are in glover and if the effect works in glover. as you can get nonfunctional effects
    return false;
  }

  return makeGenieWish(`to be ${eff}`) || haveEffect(eff) > 0;
}
// Track any failed wishes this run
const failedWishMonsters: Map<Monster, boolean> = new Map();

export function canGenieCombat(mon: Monster): boolean {
  if (!mon.wishable) {
    return false;
  }

  const bottle: Item = wrap_item(Item.get("genie bottle"));
  const haveBottle: boolean = itemAmount(bottle) > 0;
  const bottleWishesLeft: boolean = toInt(getProperty("_genieWishesUsed")) < 3;
  const canUseBottle: boolean =
    haveBottle && bottleWishesLeft && auto_is_valid(bottle);
  const havePocket: boolean = itemAmount(Item.get("pocket wish")) > 0;
  const canUsePocket: boolean =
    havePocket && auto_is_valid(Item.get("pocket wish"));
  if (!canUseBottle && !canUsePocket) {
    return false;
  }
  if (toInt(getProperty("_genieFightsUsed")) >= 3) {
    return false; // max 3 fights per day
  }
  if (myAdventures() === 0) {
    return false; // cannot fight if no adv remaining
  }
  const attr: string = toLowerCase(mon.attributes);
  if (containsText(attr, "nocopy") || containsText(attr, "boss")) {
    return false;
  }
  // Per wiki page these can't be wished. Didn't bother to add other crypt monsters as we don't summon them
  // https://kol.coldfront.net/thekolwiki/index.php/Rubbed_it_the_Right_Way
  if (Monster.get(["fantasy bandit", "modern zmobie"]).includes(mon)) {
    return false;
  }
  if (failedWishMonsters.has(mon)) {
    return false;
  }
  return true;
}

export function makeGenieCombat(mon: Monster, option?: CombatMacro): boolean {
  if (!canGenieCombat(mon)) {
    return false;
  }

  auto_log_info(`Using genie to summon ${mon.name}`, "blue");
  const wish: string = `to fight a ${mon}`;
  const prev_genieFightsUsed: number = toInt(getProperty("_genieFightsUsed"));
  const pages: Map<number, string> = new Map();
  const bottle: Item = wrap_item(Item.get("genie bottle"));
  let wish_provider: number = toInt(bottle);
  if (
    itemAmount(Item.get("pocket wish")) > 0 &&
    auto_is_valid(Item.get("pocket wish"))
  ) {
    wish_provider = toInt(Item.get("pocket wish"));
  }
  pages.set(
    0,
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${wish_provider}`,
  ); //false
  pages.set(
    1,
    `choice.php?pwd=${myHash()}&whichchoice=1267&option=1&wish=${wish}`,
  );
  pages.set(2, "main.php");

  autoAdvBypass(5, pages, Location.get("Noob Cave"), option);

  if (prev_genieFightsUsed === toInt(getProperty("_genieFightsUsed"))) {
    failedWishMonsters.set(mon, true);
    auto_log_warning(`Wish: '${wish}' failed`, "red");
    return false;
  }
  handleTracker$1(
    mon.toString(),
    toItem(wish_provider).toString(),
    "auto_copies",
  );
  handleTracker$2(
    toItem(wish_provider).toString(),
    myLocation().toString(),
    wish,
    "auto_wishes",
  );
  return true;
}

export function makeGeniePocket(): boolean {
  const bottle: Item = wrap_item(Item.get("genie bottle"));
  if (itemAmount(bottle) === 0) {
    return false;
  }
  if (toInt(getProperty("_genieWishesUsed")) >= 3) {
    return false;
  }

  const count_1: number = itemAmount(Item.get("pocket wish"));

  const wish: string = "for more wishes";
  let page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${toInt(bottle)}`,
    false,
  );
  page = visitUrl(
    `choice.php?pwd=${myHash()}&whichchoice=1267&option=1&wish=${wish}`,
  );

  if (count_1 === itemAmount(Item.get("pocket wish"))) {
    return false;
  }

  handleTracker$1(bottle.toString(), "for more wishes", "auto_wishes");
  return true;
}

function spacegateVaccineAvailable(): boolean {
  if (in_koe()) {
    return false;
  }

  if (
    !toBoolean(getProperty("spacegateAlways")) ||
    toBoolean(getProperty("_spacegateToday"))
  ) {
    return false;
  }
  if (!isUnrestricted(Item.get("Spacegate access badge"))) {
    return false;
  }
  if (toBoolean(getProperty("_spacegateVaccine"))) {
    return false;
  }
  return true;
}

function spacegateVaccineAvailable$1(ef: Effect): boolean {
  if (!spacegateVaccineAvailable()) {
    return false;
  }
  switch (ef) {
    case Effect.get("Rainbow Vaccine"):
      return toBoolean(getProperty("spacegateVaccine1"));
    case Effect.get("Broad-Spectrum Vaccine"):
      return toBoolean(getProperty("spacegateVaccine2"));
    case Effect.get("Emotional Vaccine"):
      return toBoolean(getProperty("spacegateVaccine3"));
  }
  abort(`autoscend: bad effect passed to spacegateVaccineAvailable:${ef}`);
  return false;
}

export function spacegateVaccine(ef: Effect): boolean {
  if (!spacegateVaccineAvailable$1(ef)) {
    return false;
  }
  if (haveEffect(ef) > 0) {
    return false;
  }

  let i: number = 0;
  switch (ef) {
    case Effect.get("Rainbow Vaccine"):
      i = 1;
      break;
    case Effect.get("Broad-Spectrum Vaccine"):
      i = 2;
      break;
    case Effect.get("Emotional Vaccine"):
      i = 3;
      break;
  }
  cliExecute(`spacegate vaccine ${i}`);
  return true;
}

function auto_hasMeteorLore(): boolean {
  return (
    haveSkill(Skill.get("Meteor Lore")) &&
    auto_is_valid(Item.get("Pocket Meteor Guide")) &&
    auto_is_valid$2(Skill.get("Meteor Lore"))
  );
}

function auto_meteorShowersUsed(): number {
  return toInt(getProperty("_meteorShowerUses"));
}

function auto_meteorShowersAvailable(): number {
  if (!auto_hasMeteorLore()) {
    return 0;
  }

  return 5 - auto_meteorShowersUsed();
}

function auto_macroMeteoritesUsed(): number {
  return toInt(getProperty("_macrometeoriteUses"));
}

export function auto_macrometeoritesAvailable(): number {
  if (!auto_hasMeteorLore()) {
    return 0;
  }

  return 10 - auto_macroMeteoritesUsed();
}

function auto_meteoriteAdesUsed(): number {
  return toInt(getProperty("_meteoriteAdesUsed"));
}
