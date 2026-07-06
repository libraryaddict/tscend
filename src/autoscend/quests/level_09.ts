import {
  abort,
  availableAmount,
  blackMarketAvailable,
  buy,
  canadiaAvailable,
  cliExecute,
  closetAmount,
  Coinmaster,
  containsText,
  council,
  creatableAmount,
  create,
  Effect,
  Element,
  Familiar,
  floor,
  friarsAvailable,
  getProperty,
  haveEffect,
  haveSkill,
  inHardcore,
  Item,
  itemAmount,
  itemDropModifier,
  Location,
  min,
  Monster,
  monsterLevelAdjustment,
  myBjornedFamiliar,
  myHp,
  myLevel,
  myMaxhp,
  myMeat,
  myMp,
  myServant,
  myTurncount,
  npcPrice,
  numericModifier,
  Servant,
  setProperty,
  Skill,
  Slot,
  squareRoot,
  takeCloset,
  toBoolean,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { resetState } from "../../autoscend";
import { auto_buyUpTo } from "../auto_acquire";
import { autoAdv$1, autoAdv$2, autoLuckyAdv$1 } from "../auto_adventure";
import { buffMaintain$3, buffMaintain$4 } from "../auto_buff";
import {
  addToMaximize,
  autoEquip,
  autoEquip$1,
  autoForceEquip$3,
  equipMaximizedGear,
  equipStatgainIncreasers$2,
  possessEquipment,
  resetMaximize,
  simMaximizeWith,
  simValue,
} from "../auto_equipment";
import {
  auto_famModifiers$2,
  auto_have_familiar,
  canChangeFamiliar,
  canChangeToFamiliar,
  handleFamiliar$1,
} from "../auto_familiar";
import { disregardInstantKarma, isAboutToPowerlevel } from "../auto_powerlevel";
import {
  provideInitiative,
  provideItem$2,
  provideResistances,
} from "../auto_providers";
import { acquireFullHP, acquireMP$2, uneffect } from "../auto_restore";
import { auto_waitForDay2 } from "../auto_routing";
import {
  adjustForYellowRayIfPossible,
  auto_convertDesiredML,
  auto_ignoreExperience,
  auto_inRonin,
  auto_is_valid,
  auto_is_valid$3,
  auto_log_debug$1,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_MaxMLToCap,
  autoMaximize$1,
  cloversAvailable$1,
  elemental_resist_value,
  internalQuestStatus,
  isGuildClass,
  loopHandler,
  setFlavour,
} from "../auto_util";
import { canUse$1, canUse$2 } from "../combat/auto_combat_util";
import { considerGrimstoneGolem, handleBjornify } from "../iotms/mr2014";
import { adjustEdHat } from "../iotms/mr2015";
import { asdonBuff$1 } from "../iotms/mr2017";
import { januaryToteAcquire } from "../iotms/mr2018";
import { auto_beachCombHead, auto_canBeachCombHead } from "../iotms/mr2019";
import {
  auto_canCamelSpit,
  auto_canMapTheMonsters,
  auto_mapTheMonsters,
} from "../iotms/mr2020";
import {
  auto_autumnatonCanAdv,
  auto_hasAutumnaton,
  auto_haveGreyGoose,
} from "../iotms/mr2022";
import { auto_makeMonkeyPawWish$1 } from "../iotms/mr2023";
import {
  auto_canLeapBridge,
  auto_haveBatWings,
  auto_haveMayamCalendar,
  auto_haveSeptEmberCenser,
} from "../iotms/mr2024";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_avantGuard } from "../paths/avant_guard";
import { in_bhy } from "../paths/bees_hate_you";
import { bat_formMist$1, in_darkGyffte } from "../paths/dark_gyffte";
import { in_glover } from "../paths/g_lover";
import { in_gnoob } from "../paths/gelatinous_noob";
import { in_koe } from "../paths/kingdom_of_exploathing";
import { kolhs_mandatorySchool } from "../paths/kolhs";
import { in_plumber } from "../paths/path_of_the_plumber";
import { is_professor, is_werewolf } from "../paths/wereprofessor";
import { robot_delay } from "../paths/you_robot";
import { shenShouldDelayZone } from "./level_11";

//Defined in autoscend/quests/level_09.ash
export function LX_loggingHatchet(): boolean {
  if (!canadiaAvailable()) {
    return false;
  }
  if (kolhs_mandatorySchool()) {
    return false; //avoid infinite loop in kolhs. we can not get the hatchet until we finish mandatory school for the day
  }
  if (availableAmount(Item.get("logging hatchet")) > 0) {
    return false;
  }

  if (
    Location.get("Camp Logging Camp").turnsSpent > 0 ||
    Location.get("Camp Logging Camp").combatQueue !== "" ||
    Location.get("Camp Logging Camp").noncombatQueue !== ""
  ) {
    return false;
  }

  auto_log_info("Acquiring the logging hatchet from Camp Logging Camp", "blue");
  autoAdv$1(1, Location.get("Camp Logging Camp"));
  return true;
}

export function L9_leafletQuest(): boolean {
  if (myLevel() < 9) {
    return false;
  }
  if (isActuallyEd() || in_koe()) {
    return false;
  }
  if (
    toBoolean(getProperty("leafletCompleted")) ||
    toBoolean(getProperty("auto_leaflet_done"))
  ) {
    return false;
  }
  //get a [strange leaflet]
  if (closetAmount(Item.get("strange leaflet")) > 0) {
    takeCloset(1, Item.get("strange leaflet"));
  }
  if (availableAmount(Item.get("strange leaflet")) === 0) {
    council();
    if (itemAmount(Item.get("strange leaflet")) === 0) {
      auto_log_debug$1(
        "Tried to grab a [strange leaflet] from the council and it did not work... This needs fixing. skipping for now.",
      );
      return false;
    }
  }

  auto_log_info("Got a leaflet to do", "blue");
  if (disregardInstantKarma() && !auto_ignoreExperience()) {
    //checks a user setting as well as current level
    equipStatgainIncreasers$2();
    cliExecute("leaflet"); //also gain +200 substats for each stat
    if (toBoolean(getProperty("leafletCompleted"))) {
      setProperty("auto_leaflet_done", true.toString());
    }
  } else {
    cliExecute("leaflet nomagic"); //no substat gains
    setProperty("auto_leaflet_done", true.toString()); // we're done here even with no stats
  }

  return toBoolean(getProperty("leafletCompleted"));
}

function L9_chasmMaximizeForNoncombat(): void {
  auto_log_info("Let's assess our scores for blech house", "blue");
  let best: string = "mus";
  const loc: Location = Location.get("The Smut Orc Logging Camp");
  const mustry: string =
    "1000muscle,1000weapon damage,10000weapon damage percent";
  const mystry: string =
    "1000mysticality,1000spell damage,10000 spell damage percent";
  const moxtry: string = "1000moxie,10000sleaze resistance";
  simMaximizeWith(loc, mustry);
  const musmus: number = simValue("Buffed Muscle");
  const musflat: number = simValue("Weapon Damage"); //incorrectly includes 15% weapon power
  const musperc: number = simValue("Weapon Damage Percent");
  const musscore: number = floor(
    squareRoot(((musmus + musflat) / 15) * (1 + musperc / 100)),
  );
  auto_log_info(`Muscle score: ${musscore}`, "blue");
  simMaximizeWith(loc, mystry);
  const mysmys: number = simValue("Buffed Mysticality");
  const mysflat: number = simValue("Spell Damage");
  const mysperc: number = simValue("Spell Damage Percent");
  const mysscore: number = floor(
    squareRoot(((mysmys + mysflat) / 15) * (1 + mysperc / 100)),
  );
  auto_log_info(`Mysticality score: ${mysscore}`, "blue");
  if (mysscore >= musscore) {
    //overwrite equal muscle score if possible because it may be 1 lower than predicted due to the above weapon damage issue
    best = "mys";
  }
  simMaximizeWith(loc, moxtry);
  const moxmox: number = simValue("Buffed Moxie");
  const moxres: number = simValue("Sleaze Resistance");
  const moxscore: number = floor(
    squareRoot((moxmox / 30) * (1 + moxres * 0.69)),
  );
  auto_log_info(`Moxie score: ${moxscore}`, "blue");
  if (moxscore >= mysscore && moxscore >= musscore) {
    best = "mox";
  }
  switch (best) {
    case "mus":
      addToMaximize(mustry);
      setProperty("choiceAdventure1345", (1).toString());
      break;
    case "mys":
      addToMaximize(mystry);
      setProperty("choiceAdventure1345", (2).toString());
      break;
    case "mox":
      addToMaximize(moxtry);
      setProperty("choiceAdventure1345", (3).toString());
      break;
  }
}

export function bridgeGoal(): number {
  return !auto_haveBatWings() ? 30 : 25;
}

export function fastenerCount(): number {
  let base: number = toInt(getProperty("chasmBridgeProgress"));
  base = base + itemAmount(Item.get("thick caulk"));
  base = base + itemAmount(Item.get("long hard screw"));
  base = base + itemAmount(Item.get("messy butt joint"));
  base = base + 5 * itemAmount(Item.get("smut orc keepsake box"));

  return base;
}

export function lumberCount(): number {
  let base: number = toInt(getProperty("chasmBridgeProgress"));
  base = base + itemAmount(Item.get("morningwood plank"));
  base = base + itemAmount(Item.get("raging hardwood plank"));
  base = base + itemAmount(Item.get("weirdwood plank"));
  base = base + 5 * itemAmount(Item.get("smut orc keepsake box"));

  return base;
}

export function finishBuildingSmutOrcBridge(): boolean {
  if (
    internalQuestStatus("questL09Topping") !== 0 ||
    toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal()
  ) {
    return false;
  }
  // use any keepsake boxes we have
  const keepsakeBox: Item = Item.get("smut orc keepsake box");
  if (itemAmount(keepsakeBox) > 0 && auto_is_valid(keepsakeBox)) {
    use(itemAmount(keepsakeBox), keepsakeBox);
  }
  // make sure our progress count is correct before we do anything.
  visitUrl(
    `place.php?whichplace=orc_chasm&action=bridge${toInt(getProperty("chasmBridgeProgress"))}`,
  );
  // finish chasm if we can
  if (auto_canLeapBridge()) {
    autoForceEquip$3(Item.get("bat wings"));
    visitUrl("place.php?whichplace=orc_chasm&action=bridge_jump");
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    return true;
  }
  if (toInt(getProperty("chasmBridgeProgress")) >= 30) {
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    return true;
  }

  return false;
}

export function prepareForSmutOrcs(): void {
  if (lumberCount() >= bridgeGoal() && fastenerCount() >= bridgeGoal()) {
    // must be here for shen snake and quest objective is already done
    // set blech NC and don't bother prepping for the zone
    auto_log_info(
      "Adventuring at Smut Orc Logging Camp when quest is done. Skipping preparing to maximize zone progress.",
      "blue",
    );
    setProperty("choiceAdventure1345", (1).toString());
    return;
  }
  // -Combat is useless here since NC is triggered by killing Orcs...So we kill orcs better!
  // -ML helps us deal more cold damage and trigger the NC faster.
  asdonBuff$1(Effect.get("Driving Intimidatingly"));
  // Check our Load out to see if spells are the best option for Orc-Thumping
  if (isGuildClass()) {
    // This only applies to classes which can use perm'd skills,
    // so let's not waste time and console spam when we're a class or path that can't do any of this.
    let useSpellsInOrcCamp: boolean = false;

    acquireMP$2(32, 0); //pre_adv will always do this later, but waiting for it may fail checks of ability to cast spells here
    if (
      setFlavour(Element.get("cold")) &&
      canUse$2(Skill.get("Stuffed Mortar Shell"))
    ) {
      useSpellsInOrcCamp = true;
    }

    if (
      setFlavour(Element.get("cold")) &&
      canUse$1(Skill.get("Cannelloni Cannon"), false)
    ) {
      useSpellsInOrcCamp = true;
    }

    if (canUse$1(Skill.get("Saucegeyser"), false)) {
      useSpellsInOrcCamp = true;
    }

    if (canUse$1(Skill.get("Saucecicle"), false)) {
      useSpellsInOrcCamp = true;
    }
    // Always Maximize and choose our default Non-Com First, in case we are wrong about the non-com we MAY have some gear still equipped to help us.
    if (useSpellsInOrcCamp === true) {
      auto_log_info("Preparing to Blast Orcs with Cold Spells!", "blue");
      addToMaximize(
        "myst,40spell damage,80spell damage percent,40cold spell damage,-1000 ml",
      );
      buffMaintain$3(Effect.get("Carol of the Hells"), 50, 1, 1);
      buffMaintain$3(Effect.get("Song of Sauce"), 150, 1, 1);

      auto_log_info(
        "If we encounter Blech House when we are not expecting it we will stop.",
        "blue",
      );
      auto_log_info(
        "Currently setup for Myst/Spell Damage, option 2: Blast it down with a spell",
        "blue",
      );
      setProperty("choiceAdventure1345", (0).toString());
    } else {
      auto_log_info("Preparing to Ice-Punch Orcs!", "blue");
      addToMaximize(
        "muscle,40weapon damage,60weapon damage percent,40cold damage,-1000 ml",
      );
      buffMaintain$3(Effect.get("Carol of the Bulls"), 50, 1, 1);
      buffMaintain$3(Effect.get("Song of the North"), 150, 1, 1);

      auto_log_info(
        "If we encounter Blech House when we are not expecting it we will stop.",
        "blue",
      );
      auto_log_info(
        "Currently setup for Muscle/Weapon Damage, option 1: Kick it down",
        "blue",
      );
      setProperty("choiceAdventure1345", (0).toString());
    }
  }
  // This adds a tonne of damage and NC progress
  buffMaintain$4(Effect.get("Triple-Sized"));

  if (toInt(getProperty("smutOrcNoncombatProgress")) === 15) {
    // If we think the non-com will hit NOW we clear maximizer to keep previous settings from carrying forward
    resetMaximize();

    auto_log_info$1("The smut orc noncombat is about to hit...");
    // This is a hardcoded patch for Dark Gyffte
    // TODO: once explicit formulas are spaded, use simulated maximizer
    // to determine best approach.
    L9_chasmMaximizeForNoncombat();
    return;
  }

  if (in_plumber() && possessEquipment(Item.get("frosty button"))) {
    autoEquip$1(Item.get("frosty button"));
  }

  if (inHardcore()) {
    if (in_gnoob() && auto_have_familiar(Familiar.get("Robortender"))) {
      if (
        !haveSkill(Skill.get("Powerful Vocal Chords")) &&
        itemAmount(Item.get("baby oil shooter")) === 0
      ) {
        handleFamiliar$1(Familiar.get("Robortender"));
      }
    }

    if (fastenerCount() < bridgeGoal()) {
      autoEquip$1(Item.get("loadstone"));
    }
    if (lumberCount() < bridgeGoal()) {
      autoEquip$1(Item.get("logging hatchet"));
    }

    return;
  }

  let need: number =
    (bridgeGoal() - toInt(getProperty("chasmBridgeProgress"))) / 5;
  if (need > 0) {
    while (need > 0 && itemAmount(Item.get("snow berries")) >= 2) {
      cliExecute("make 1 snow boards");
      need = need - 1;
      visitUrl(
        `place.php?whichplace=orc_chasm&action=bridge${toInt(getProperty("chasmBridgeProgress"))}`,
      );
    }
  }

  if (toInt(getProperty("chasmBridgeProgress")) < bridgeGoal()) {
    if (fastenerCount() < bridgeGoal()) {
      autoEquip$1(Item.get("loadstone"));
    }
    if (lumberCount() < bridgeGoal()) {
      autoEquip$1(Item.get("logging hatchet"));
    }

    return;
  }
}

export function L9_chasmBuild(): boolean {
  if (
    internalQuestStatus("questL09Topping") !== 0 ||
    toInt(getProperty("chasmBridgeProgress")) >= bridgeGoal()
  ) {
    return false;
  }

  if (finishBuildingSmutOrcBridge()) {
    return true;
  }

  if (
    auto_inRonin() ||
    auto_haveMayamCalendar() ||
    auto_haveSeptEmberCenser()
  ) {
    if (auto_waitForDay2()) {
      auto_log_debug$1("Delaying Logging Camp waiting for day 2.");
      return false;
    }
  }

  if (shenShouldDelayZone(Location.get("The Smut Orc Logging Camp"))) {
    auto_log_debug$1("Delaying Logging Camp in case of Shen.");
    return false;
  }
  if (robot_delay("chasm")) {
    return false; //delay for You, Robot path
  }
  if (
    auto_hasAutumnaton() &&
    !isAboutToPowerlevel() &&
    Location.get("The Smut Orc Logging Camp").turnsSpent > 0 &&
    (fastenerCount() < bridgeGoal() || lumberCount() < bridgeGoal())
  ) {
    // delay zone to allow autumnaton to grab bridge parts
    // unless we have ran out of other stuff to do
    return false;
  }

  if (LX_loggingHatchet()) {
    // turn free, might save some adventures. May as well get it if we can.
    return true;
  }

  auto_log_info("Chasm time", "blue");
  // prepareForSmutOrcs() called in pre-adv
  autoAdv$1(1, Location.get("The Smut Orc Logging Camp"));

  return true;
}

export function L9_aBooPeak(): boolean {
  if (
    internalQuestStatus("questL09Topping") < 2 ||
    internalQuestStatus("questL09Topping") > 3
  ) {
    return false;
  }

  if (containsText(visitUrl("place.php?whichplace=highlands"), "fire1.gif")) {
    return false;
  }

  let clue: Item = Item.get("A-Boo clue");
  if (in_glover()) {
    if (itemAmount(Item.get("A-Boo glue")) > 0 && itemAmount(clue) > 0) {
      use(1, Item.get("A-Boo glue"));
    }
    clue = Item.get("glued A-Boo clue");
  }
  const clueAmt: number = itemAmount(clue);

  if (is_professor() && clueAmt >= 3) {
    return false; // We have clues but we can't survive them so not worth trying when we only have 1 hp
  }

  if (toInt(getProperty("booPeakProgress")) > 90) {
    auto_log_info(
      `A-Boo Peak (initial): ${getProperty("booPeakProgress")}`,
      "blue",
    );

    if (clueAmt < 3) {
      // boo clues have 15% drop
      provideItem$2(567, Location.get("A-Boo Peak"), false);
    }

    return autoAdv$1(1, Location.get("A-Boo Peak"));
  }

  let booCloversOk: boolean = false;
  if (cloversAvailable$1() > 0) {
    if (in_glover()) {
      if (itemAmount(Item.get("A-Boo glue")) > 0) {
        booCloversOk = true;
      }
    } else if (in_bhy()) {
      // bees hate clues, don't waste clovers on them
      booCloversOk = false;
    } else {
      booCloversOk = true;
    }
  }

  if (
    toBoolean(getProperty("auto_abooclover")) &&
    clueAmt >= toInt(getProperty("booPeakProgress")) / 30
  ) {
    // if you get lucky/have enough item drop to get 3 clues while getting to 90% haunted, don't waste a clover getting more.
    auto_log_info$1(
      "We have enough A-boo clues to clear the peak, lets not waste a clover",
    );
    setProperty("auto_abooclover", false.toString());
  }

  auto_log_info(`A-Boo Peak: ${getProperty("booPeakProgress")}`, "blue");
  const clueCheck: boolean =
    clueAmt > 0 || toInt(getProperty("auto_aboopending")) !== 0;
  if (
    toBoolean(getProperty("auto_abooclover")) &&
    toInt(getProperty("booPeakProgress")) >= 30 &&
    booCloversOk
  ) {
    if (autoLuckyAdv$1(Location.get("A-Boo Peak"))) {
      setProperty("auto_abooclover", false.toString());
      return true;
    }
  } else if (clueCheck && toInt(getProperty("booPeakProgress")) > 2) {
    let doThisBoo: boolean = false;

    const priorBjorn: Familiar = myBjornedFamiliar();

    let lihcface: string = "";
    if (
      isActuallyEd() &&
      possessEquipment(Item.get("The Crown of Ed the Undying"))
    ) {
      lihcface = "-equip lihc face";
    }
    let parrot: string =
      ", switch exotic parrot, switch mu, switch trick-or-treating tot";
    if (!canChangeFamiliar() || in_avantGuard()) {
      parrot = "";
    }

    autoMaximize$1(
      `spooky res, cold res, 0.01hp ${lihcface} -equip snow suit${parrot}`,
      0,
      0,
      true,
    );
    let coldResist: number = toInt(simValue("Cold Resistance"));
    let spookyResist: number = toInt(simValue("Spooky Resistance"));
    const hpDifference: number = toInt(
      simValue("Maximum HP") - numericModifier("Maximum HP"),
    );
    let effectiveCurrentHP: number = myHp();
    //	Do we need to manually adjust for the parrot?

    if (
      blackMarketAvailable() &&
      itemAmount(Item.get("can of black paint")) === 0 &&
      haveEffect(Effect.get("Red Door Syndrome")) === 0 &&
      myMeat() >= npcPrice(Item.get("can of black paint")) &&
      !is_werewolf()
    ) {
      auto_buyUpTo(1, Item.get("can of black paint"));
      coldResist += 2;
      spookyResist += 2;
    } else if (
      itemAmount(Item.get("can of black paint")) > 0 &&
      haveEffect(Effect.get("Red Door Syndrome")) === 0
    ) {
      coldResist += 2;
      spookyResist += 2;
    }

    if (0 === haveEffect(Effect.get("Mist Form"))) {
      if (haveSkill(Skill.get("Mist Form"))) {
        coldResist += 4;
        spookyResist += 4;
        effectiveCurrentHP -= 10;
      } else if (
        haveSkill(Skill.get("Spectral Awareness")) &&
        0 === haveEffect(Effect.get("Spectral Awareness"))
      ) {
        coldResist += 2;
        spookyResist += 2;
        effectiveCurrentHP -= 10;
      }
    }

    if (
      itemAmount(Item.get("spooky powder")) > 0 &&
      haveEffect(Effect.get("Spookypants")) === 0
    ) {
      spookyResist = spookyResist + 1;
    }
    if (
      itemAmount(Item.get("ectoplasmic orbs")) > 0 &&
      haveEffect(Effect.get("Balls of Ectoplasm")) === 0
    ) {
      spookyResist = spookyResist + 1;
    }
    if (
      itemAmount(Item.get("black eyedrops")) > 0 &&
      haveEffect(Effect.get("Hyphemariffic")) === 0
    ) {
      spookyResist = spookyResist + 9;
    }
    if (
      itemAmount(Item.get("cold powder")) > 0 &&
      haveEffect(Effect.get("Insulated Trousers")) === 0
    ) {
      coldResist = coldResist + 1;
    }
    if (auto_canBeachCombHead("cold")) {
      coldResist = coldResist + 3;
    }
    if (auto_canBeachCombHead("spooky")) {
      spookyResist = spookyResist + 3;
    }
    //Calculate how much boo peak damage does per unit resistance.
    let estimatedCold: number = toInt(
      (13 + 25 + 50 + 125 + 250) *
        ((100.0 - elemental_resist_value(coldResist)) / 100.0),
    );
    let estimatedSpooky: number = toInt(
      (13 + 25 + 50 + 125 + 250) *
        ((100.0 - elemental_resist_value(spookyResist)) / 100.0),
    );
    auto_log_info(`Current HP: ${myHp()}/${myMaxhp()}`, "blue");
    auto_log_info(
      `Expected cold damage: ${estimatedCold} Expected spooky damage: ${estimatedSpooky}`,
      "blue",
    );
    auto_log_info(
      `Expected Cold Resist: ${coldResist} Expected Spooky Resist: ${spookyResist} Expected HP Difference: ${hpDifference}`,
      "blue",
    );
    let totalDamage: number = estimatedCold + estimatedSpooky;

    if (toInt(getProperty("booPeakProgress")) <= 6) {
      estimatedCold = (estimatedCold * 38) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 38) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    } else if (toInt(getProperty("booPeakProgress")) <= 12) {
      estimatedCold = (estimatedCold * 88) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 88) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    } else if (toInt(getProperty("booPeakProgress")) <= 20) {
      estimatedCold = (estimatedCold * 213) / 463 + 1;
      estimatedSpooky = (estimatedSpooky * 213) / 463 + 1;
      totalDamage = estimatedCold + estimatedSpooky;
    }

    if (toInt(getProperty("booPeakProgress")) <= 20) {
      auto_log_info("Don't need a full A-Boo Clue, adjusting values:", "blue");
      auto_log_info(
        `Expected cold damage: ${estimatedCold} Expected spooky damage: ${estimatedSpooky}`,
        "blue",
      );
      auto_log_info(
        `Expected Cold Resist: ${coldResist} Expected Spooky Resist: ${spookyResist} Expected HP Difference: ${hpDifference}`,
        "blue",
      );
    }

    const considerHP: number = myMaxhp() + hpDifference;

    let mp_need: number = toInt(20 + simValue("Mana Cost"));
    if (myHp() - totalDamage > 50) {
      mp_need = mp_need - 20;
    }

    loopHandler(
      "_auto_lastABooConsider",
      "_auto_lastABooCycleFix",
      "We are in an A-Boo Peak cycle and can't find anything else to do. Aborting. If you have actual other quests left, please report this. Otherwise, complete A-Boo peak manually",
      15,
    );

    if (toInt(getProperty("booPeakProgress")) === 0) {
      doThisBoo = true;
    }
    if (
      min(effectiveCurrentHP, myMaxhp() + hpDifference) > totalDamage &&
      myMp() >= mp_need
    ) {
      doThisBoo = true;
    }
    if (
      considerHP >= totalDamage &&
      myMp() >= mp_need &&
      haveSkill(Skill.get("Cannelloni Cocoon"))
    ) {
      doThisBoo = true;
    }
    //assume min bandage HP resotred to ensure we can heal enough
    if (
      considerHP >= totalDamage &&
      isActuallyEd() &&
      itemAmount(Item.get("linen bandages")) * 20 + myHp() >= totalDamage
    ) {
      doThisBoo = true;
    }
    //do clue if it is one of the last things to do
    if (isAboutToPowerlevel() && myLevel() >= 13) {
      doThisBoo = true;
    }

    if (doThisBoo) {
      buffMaintain$4(Effect.get("Go Get 'Em, Tiger!"));
      bat_formMist$1();
      if (0 === haveEffect(Effect.get("Mist Form"))) {
        buffMaintain$3(Effect.get("Spectral Awareness"), 10, 1, 1);
      }
      addToMaximize(`1000spooky res,1000cold res,10hp${parrot}`);
      adjustEdHat("ml");

      buffMaintain$3(Effect.get("Astral Shell"), 10, 1, 1);
      buffMaintain$3(Effect.get("Elemental Saucesphere"), 10, 1, 1);
      buffMaintain$3(Effect.get("Scariersauce"), 10, 1, 1);
      buffMaintain$3(Effect.get("Scarysauce"), 10, 1, 1);
      buffMaintain$4(Effect.get("Spookypants"));
      buffMaintain$4(Effect.get("Hyphemariffic"));
      buffMaintain$4(Effect.get("Insulated Trousers"));
      buffMaintain$4(Effect.get("Balls of Ectoplasm"));
      buffMaintain$4(Effect.get("Red Door Syndrome"));
      buffMaintain$4(Effect.get("Well-Oiled"));

      if (auto_is_valid$3(Effect.get("Cold as Nice"))) {
        auto_beachCombHead("cold");
      }
      if (auto_is_valid$3(Effect.get("Does It Have a Skull In There??"))) {
        auto_beachCombHead("spooky");
      }

      setProperty("choiceAdventure611", "1");

      if (toInt(getProperty("auto_aboopending")) === 0) {
        if (itemAmount(clue) > 0 && use(1, clue)) {
          setProperty("auto_aboopending", myTurncount().toString());
        }
      }
      if (canChangeToFamiliar(Familiar.get("Trick-or-Treating Tot"))) {
        handleFamiliar$1(Familiar.get("Trick-or-Treating Tot"));
      } else if (canChangeToFamiliar(Familiar.get("Mu"))) {
        handleFamiliar$1(Familiar.get("Mu"));
      } else if (canChangeToFamiliar(Familiar.get("Exotic Parrot"))) {
        handleFamiliar$1(Familiar.get("Exotic Parrot"));
      }
      // When booPeakProgress <= 0, we want to leave this adventure. Can we?
      // I can not figure out how to do this via ASH since the adventure completes itself?
      // However, in mafia, (src/net/sourceforge/kolmafia/session/ChoiceManager.java)
      // upon case 611, if booPeakProgress <= 0, set choiceAdventure611 to 2
      // If lastDecision was 2, revert choiceAdventure611 to 1 (or perhaps unset it?)
      try {
        autoAdv$1(1, Location.get("A-Boo Peak"));
      } finally {
        if (getProperty("lastEncounter") !== "The Horror...") {
          auto_log_warning(
            "Wandering adventure interrupt of A-Boo Peak, refreshing inventory.",
            "red",
          );
          cliExecute("refresh inv");
          if (
            [
              "Battlie Knight Ghost",
              "Claybender Sorcerer Ghost",
              "Dusken Raider Ghost",
              "Space Tourist Explorer Ghost",
              "Whatsian Commando Ghost",
            ].includes(getProperty("lastEncounter"))
          ) {
            //clue usage probably failed somehow
            try {
              use(1, clue); //will not be consumed if a clue is already active
            } catch (e: any) {}
          }
        } else {
          setProperty("auto_aboopending", (0).toString());
        }
      }
      setProperty("_auto_forcePokefamRestore", true.toString());
      acquireFullHP();
      if (
        myHp() * 4 < myMaxhp() &&
        itemAmount(Item.get("scroll of drastic healing")) > 0 &&
        (!isActuallyEd() || !in_darkGyffte())
      ) {
        use(1, Item.get("scroll of drastic healing"));
      }
      handleBjornify(priorBjorn);
      return true;
    }

    auto_log_info("Nevermind, that peak is too scary!", "green");
    resetState();
    handleBjornify(priorBjorn);
  } else {
    if (Location.get("A-Boo Peak").turnsSpent < 10) {
      // boo clues have 15% drop
      provideItem$2(567, Location.get("A-Boo Peak"), false);
    }

    autoAdv$1(1, Location.get("A-Boo Peak"));
    setProperty("auto_aboopending", (0).toString());

    return true;
  }
  return false;
}

export function hedgeTrimmersNeeded(): number {
  const twinPeakProgress: number = toInt(getProperty("twinPeakProgress"));
  const needStench: boolean = (twinPeakProgress & 1) === 0;
  const needFood: boolean = (twinPeakProgress & 2) === 0;
  const needJar: boolean = (twinPeakProgress & 4) === 0;
  const needInit: boolean =
    needStench || needFood || needJar || twinPeakProgress === 7;
  let neededTrimmers: number = -itemAmount(Item.get("rusty hedge trimmers"));
  if (needStench) {
    neededTrimmers++;
  }
  if (needFood) {
    neededTrimmers++;
  }
  if (needJar) {
    neededTrimmers++;
  }
  if (needInit) {
    neededTrimmers++;
  }

  return neededTrimmers;
}
// returns true if can successfully do one of the tasks at the great overlook lodge NC (606)
export function prepareForTwinPeak(speculative: boolean): boolean {
  const progress: number = toInt(getProperty("twinPeakProgress"));
  const needStench: boolean = (progress & 1) === 0;
  const needFood: boolean = (progress & 2) === 0;
  const needJar: boolean = (progress & 4) === 0;
  const needInit: boolean = progress === 7;

  if (needInit) {
    if (
      provideInitiative(40, Location.get("Twin Peak"), true, speculative) >= 40
    ) {
      return true;
    } else {
      //init test shows up last. if we can't do it there is no point in checking rest of function.
      return false;
    }
  }

  if (needJar && itemAmount(Item.get("jar of oil")) >= 1) {
    return true;
  }

  if (needFood) {
    let food_drop: number = itemDropModifier() + numericModifier("Food Drop");
    food_drop -= auto_famModifiers$2("Item Drop");

    if (myServant() === Servant.get("Cat")) {
      food_drop -= numericModifier(
        Familiar.get("Baby Gravy Fairy"),
        "Item Drop",
        Servant.get("Cat").level,
        Item.none,
      );
    }
    if (
      food_drop < 50 &&
      food_drop >= 20 &&
      haveEffect(Effect.get("Brother Flying Burrito's Blessing")) === 0
    ) {
      if (
        friarsAvailable() &&
        !toBoolean(getProperty("friarsBlessingReceived")) &&
        !speculative
      ) {
        cliExecute("friars food");
      }
      if (haveEffect(Effect.get("Brother Flying Burrito's Blessing")) > 0) {
        food_drop = food_drop + 30;
      }
    }
    if (
      food_drop < 50.0 &&
      itemAmount(Item.get("eagle feather")) > 0 &&
      haveEffect(Effect.get("Eagle Eyes")) === 0 &&
      auto_is_valid(Item.get("eagle feather"))
    ) {
      if (!speculative) {
        use(1, Item.get("eagle feather"));
      }
      food_drop = food_drop + 20;
    }
    if (
      food_drop < 50.0 &&
      itemAmount(Item.get("resolution: be happier")) > 0 &&
      haveEffect(Effect.get("Joyful Resolve")) === 0 &&
      auto_is_valid(Item.get("resolution: be happier"))
    ) {
      if (!speculative) {
        buffMaintain$4(Effect.get("Joyful Resolve"));
      }
      food_drop = food_drop + 15;
    }
    if (food_drop >= 50.0) {
      return true;
    }
  }

  if (needStench) {
    const resGoal: Map<Element, number> = new Map();
    resGoal.set(Element.get("stench"), 4);
    // check if we can get enough stench res before we start applying anything
    const resPossible: Map<Element, number> = provideResistances(
      resGoal,
      Location.get("Twin Peak"),
      true,
      true,
      true,
    );
    if (
      (resPossible.get(Element.get("stench")) ??
        resPossible.set(Element.get("stench"), 0).get(Element.get("stench"))) >=
      4
    ) {
      if (!speculative) {
        provideResistances(
          resGoal,
          Location.get("Twin Peak"),
          true,
          true,
          false,
        );
      }
      return true;
    }
  }

  return false;
}

export function L9_twinPeak(): boolean {
  if (
    internalQuestStatus("questL09Topping") < 2 ||
    internalQuestStatus("questL09Topping") > 3
  ) {
    return false;
  }

  if (toInt(getProperty("twinPeakProgress")) >= 15) {
    return false;
  }

  if (
    hedgeTrimmersNeeded() > 0 &&
    auto_autumnatonCanAdv(Location.get("Twin Peak")) &&
    !isAboutToPowerlevel() &&
    (Location.get("Twin Peak").turnsSpent > 0 ||
      toInt(getProperty("twinPeakProgress")) > 0)
  ) {
    // using trimmers doesn't increment turns_spent, so look at quest status also
    // delay zone to allow autumnaton to grab rusty hedge trimmers
    // unless we have ran out of other stuff to do
    return false;
  }
  //main lodge NC. we swap around this value multiple times. initially set to 0 to prevent mistakes.
  setProperty("choiceAdventure606", "0");
  //-combat via combining 2 IOTMs. Needs to be moved to providePlusNonCombat
  if (myMp() > 60 || considerGrimstoneGolem(true)) {
    handleBjornify(Familiar.get("Grimstone Golem"));
  }

  buffMaintain$4(Effect.get("Fishy Whiskers")); //heavy rains specific reduce item drop penalty by 10%
  //BHY specific prevent wandering bees from skipping the burning the hotel down choice and wasting turns
  buffMaintain$4(Effect.get("Float Like a Butterfly, Smell Like a Bee"));

  if (in_bhy()) {
    // we can't make an oil jar to solve the quest, just adventure until the hotel is burned down
    return autoAdv$2(Location.get("Twin Peak"));
  }

  if (!prepareForTwinPeak(true)) {
    auto_log_debug$1(
      "Can't complete any task at the Great Overlook Lodge. Will come back to Twin Peak later",
    );
    return false;
  }

  auto_log_info("Twin Peak", "blue");

  if (
    itemAmount(Item.get("rusty hedge trimmers")) === 0 &&
    Location.get("Twin Peak").turnsSpent === 0 &&
    auto_hasAutumnaton()
  ) {
    // wish for trimmer so we can later send fallbot for the rest
    auto_makeMonkeyPawWish$1(Item.get("rusty hedge trimmers"));
  }

  const starting_trimmers: number = itemAmount(
    Item.get("rusty hedge trimmers"),
  );
  if (starting_trimmers > 0) {
    equipMaximizedGear();
    use(1, Item.get("rusty hedge trimmers"));
    cliExecute("refresh inv");
    if (itemAmount(Item.get("rusty hedge trimmers")) === starting_trimmers) {
      abort("Tried using a rusty hedge trimmer but that didn't seem to work");
    }
    auto_log_info(
      `Hedge trimming situation: ${toInt(getProperty("choiceAdventure606"))}`,
      "green",
    );
    const page: string = visitUrl("main.php");
    if (
      containsText(page, "choice.php") &&
      !containsText(page, "Really Sticking Her Neck Out") &&
      !containsText(page, "It Came from Beneath the Sewer?")
    ) {
      auto_log_info("Inside of a Rusty Hedge Trimmer sequence.", "blue");
    } else {
      auto_log_info("Rusty Hedge Trimmer Sequence completed itself.", "blue");
      return true;
    }
  }

  if (
    toBoolean(getProperty("auto_shinningStarted")) &&
    auto_canCamelSpit() &&
    auto_canMapTheMonsters()
  ) {
    // Shh! You want to get sued?
    if (adjustForYellowRayIfPossible(Monster.get("bearpig topiary animal"))) {
      if (auto_mapTheMonsters()) {
        handleFamiliar$1(Familiar.get("Melodramedary"));
        auto_log_info$1(
          "Attemping to use Map the Monsters to Yellow Ray a Camel Spitted bearpig topiary animal. Yes that is a mouthful but lets hope it works and we get 4 rusty hedge trimmers!",
        );
      }
    } else {
      return false;
    }
  }
  if (auto_haveGreyGoose()) {
    auto_log_info$1(
      "Bringing the Grey Goose to emit some drones to get some hedge trimmers.",
    );
    handleFamiliar$1(Familiar.get("Grey Goose"));
  }
  return autoAdv$2(Location.get("Twin Peak"));
}

export function L9_oilPeak(): boolean {
  if (
    internalQuestStatus("questL09Topping") < 2 ||
    internalQuestStatus("questL09Topping") > 3
  ) {
    return false;
  }

  auto_MaxMLToCap(auto_convertDesiredML(100), false);

  if (
    monsterLevelAdjustment() < 50 &&
    myLevel() < 12 &&
    !isAboutToPowerlevel()
  ) {
    return false;
  }

  if (is_professor()) {
    return false; //can't do Oil Peak as a Professor
  }

  if (containsText(visitUrl("place.php?whichplace=highlands"), "fire3.gif")) {
    const oilProgress: number = toInt(getProperty("twinPeakProgress"));
    const needJar: boolean =
      (oilProgress & 4) === 0 && itemAmount(Item.get("jar of oil")) === 0;
    if (!needJar || in_bhy()) {
      return false;
    } else if (itemAmount(Item.get("bubblin' crude")) >= 12) {
      if (in_glover()) {
        if (itemAmount(Item.get("crude oil congealer")) > 0) {
          use(1, Item.get("crude oil congealer"));
        } else {
          if (itemAmount(Item.get("G")) > 2) {
            buy(Coinmaster.get("G-Mart"), 1, Item.get("crude oil congealer"));
            use(1, Item.get("crude oil congealer"));
          } else {
            return false;
          }
        }
      } else if (
        auto_is_valid(Item.get("bubblin' crude")) &&
        creatableAmount(Item.get("jar of oil")) > 0
      ) {
        create(1, Item.get("jar of oil"));
      }
      if (itemAmount(Item.get("jar of oil")) > 0) {
        return true;
      }
    }
    auto_log_info("Oil Peak is finished but we need more crude!", "blue");
  }

  buffMaintain$4(Effect.get("Fishy Whiskers"));

  auto_MaxMLToCap(auto_convertDesiredML(100), true);

  if (monsterLevelAdjustment() < 50) {
    buffMaintain$4(Effect.get("The Dinsey Look"));
  }
  if (monsterLevelAdjustment() < 60) {
    if (itemAmount(Item.get("dress pants")) > 0) {
      autoEquip(Slot.get("pants"), Item.get("dress pants"));
    } else {
      januaryToteAcquire(Item.get("tinsel tights"));
    }
  }
  // Maximize Asdon usage
  if (
    haveEffect(Effect.get("Driving Recklessly")) === 0 &&
    haveEffect(Effect.get("Driving Wastefully")) === 0
  ) {
    const loc: Location = Location.get("Oil Peak");
    if (
      ((simMaximizeWith(loc, "1000ml 75min") &&
        !simMaximizeWith(loc, "1000ml 100min")) ||
        (simMaximizeWith(loc, "1000ml 25min") &&
          !simMaximizeWith(loc, "1000ml 50min")) ||
        !simMaximizeWith(loc, "1000ml 11min")) &&
      haveEffect(Effect.get("Driving Wastefully")) === 0
    ) {
      asdonBuff$1(Effect.get("Driving Recklessly"));
    } else if (haveEffect(Effect.get("Driving Recklessly")) === 0) {
      asdonBuff$1(Effect.get("Driving Wastefully"));
    }
  }

  addToMaximize(`1000ml ${auto_convertDesiredML(100)}max`);

  auto_log_info(`Oil Peak with ML: ${monsterLevelAdjustment()}`, "blue");

  autoAdv$1(1, Location.get("Oil Peak"));
  if (getProperty("lastEncounter") === "Unimpressed with Pressure") {
    setProperty("oilPeakProgress", (0.0).toString());
    // Brute Force grouping with tavern (if not done) to maximize tangles while we have a high ML.
    auto_log_info(
      "Checking to see if we should do the tavern while we are running high ML.",
      "green",
    );
    setProperty("auto_forceTavern", true.toString());
    // Remove Driving Wastefully if we had it
    if (0 < haveEffect(Effect.get("Driving Wastefully"))) {
      uneffect(Effect.get("Driving Wastefully"));
    }
  }
  return true;
}

export function L9_highLandlord(): boolean {
  if (
    internalQuestStatus("questL09Topping") < 1 ||
    internalQuestStatus("questL09Topping") > 3
  ) {
    return false;
  }
  if (toInt(getProperty("chasmBridgeProgress")) < bridgeGoal()) {
    return false;
  }
  if (isActuallyEd() && !toBoolean(getProperty("auto_chasmBusted"))) {
    return false;
  }

  if (internalQuestStatus("questL09Topping") === 1) {
    auto_log_info(
      "Visiting the Highland Lord's tower <ominous music plays>",
      "blue",
    );
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    setProperty("auto_grimstoneFancyOilPainting", false.toString());
    return true;
  }

  if (L9_aBooPeak()) {
    return true;
  }
  if (L9_oilPeak()) {
    return true;
  }
  if (L9_twinPeak()) {
    return true;
  }

  if (internalQuestStatus("questL09Topping") === 3) {
    auto_log_info(
      "Aw, sweet, dude! You totally lit all the signal fires!",
      "blue",
    );
    visitUrl("place.php?whichplace=highlands&action=highlands_dude");
    council();
    return true;
  }

  return false;
}
