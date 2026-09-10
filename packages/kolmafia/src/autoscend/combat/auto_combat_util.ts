import {
  availableAmount,
  booleanModifier,
  bufferToFile,
  canEquip,
  containsText,
  currentRound,
  Element,
  elementalResistance,
  equippedAmount,
  equippedItem,
  expectedDamage,
  fightFollowsChoice,
  fuelCost,
  getFuel,
  haveEffect,
  haveEquipped,
  haveSkill,
  heartstoneMiddleLetter,
  hpCost,
  isBanished,
  Item,
  itemAmount,
  itemDrops,
  itemType,
  lastMonster,
  lightningCost,
  Location,
  meatCost,
  Modifier,
  Monster,
  monsterHp,
  monsterLevelAdjustment,
  mpCost,
  myAudience,
  myBasestat,
  myBuffedstat,
  myClass,
  myDaycount,
  myFamiliar,
  myFury,
  myHp,
  myLevel,
  myLightning,
  myLocation,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPp,
  myRain,
  mySoulsauce,
  myThunder,
  numericModifier,
  Phylum,
  rainCost,
  removeProperty,
  Skill,
  soulsauceCost,
  thunderCost,
  toFloat,
  trackedBy,
  trackIgnoreQueue,
  turnsPlayed,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $elements,
  $familiar,
  $item,
  $items,
  $location,
  $locations,
  $modifier,
  $monster,
  $monsters,
  $skill,
  $skills,
  $slot,
  $slots,
  $stat,
  get,
  getActiveEffects,
  set,
} from "libram";

import {
  AprilShower,
  AutoAsdonMartin,
  Eagle,
  EmotionChip,
  FireExtinguisher,
  Heartstone,
  InterestingCoin,
  LilDoctorBag,
  McHugeLarge,
  MeteorLore,
  MonkeyPaw,
  Monodent,
  Parka,
  PayPhone,
  PowerfulGlove,
  PowerPlant,
  Retrocape,
  Roman,
  Saber,
  Sweatpants,
} from "../../types";
import { auto_canDrink, inebriety_left, spleen_left } from "../auto_consume";
import { getEquippedItems, possessEquipment } from "../auto_equipment";
import { CombatMacroReturns } from "../executors/auto_adventure";
import { acquireOrPull } from "../helpers/auto_acquire";
import {
  auto_famKill,
  auto_have_familiar,
  pathAllowsChangingFamiliar,
} from "../helpers/auto_familiar";
import { pete_peelOutRemaining } from "../paths/2014/avatar_of_sneaky_pete";
import { isActuallyEd } from "../paths/2015/actually_ed_the_undying";
import { in_glover } from "../paths/2018/g_lover";
import { in_pokefam } from "../paths/2018/pocket_familiars";
import { plumber_ppCost } from "../paths/2020/path_of_the_plumber";
import { in_wildfire } from "../paths/2021/wildfire";
import { in_avantGuard } from "../paths/2024/avant_guard";
import { is_werewolf } from "../paths/2024/wereprofessor";
import {
  getZooKickBanish,
  getZooKickSniff,
  getZooKickYR,
  in_zootomist,
} from "../paths/2025/zootomist";
import { inAftercore } from "../paths/casual";
import { hedgeTrimmersNeeded } from "../quests/level_09";
import { auto_warSide } from "../quests/level_12";
import { auto_log_info } from "../utils/auto_log";
import {
  auto_banishesUsedAt,
  auto_can_equip,
  auto_committedSniffs,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_locationMonsters,
  auto_replaceTurnsSaved,
  auto_soleTargetHere,
  auto_wantToBanish,
  auto_wantToBanish$1,
  auto_wantToInstaKill,
  handleTracker,
  hasShieldEquipped,
  hasTorso,
  instakillable,
  isFreeMonster,
  isYellowRayingNextCombat,
  loopHandlerDelayAll,
  wrap_item,
} from "../utils/auto_util";
import { auto_combatHandler } from "./auto_combat";

class $_canUse_SkillSet {
  constructor(
    //this file is utility functions that are only used for combat file.
    // + combat_mana_cost_modifier() (negative value that we would add) is already included by mp_cost()
    public count: number = 0,
    public skills: Skill[] = [],
  ) {}
}
let $_static_1 = false;

//defined in /autoscend/combat/auto_combat_util.ash
export function defaultRoundLimit(): number {
  return 25;
}

export function haveUsed(sk: Skill): boolean {
  return (
    containsText(get("_auto_combatState"), `(sk${sk.id.toString()})`) ||
    get("_auto_combatState").split(";").includes(`sk${sk.id}`)
  );
}

export function haveUsed$1(it: Item): boolean {
  return containsText(get("_auto_combatState"), `(it${it.id.toString()})`);
}

export function usedCount(sk: Skill): number {
  return get("_auto_combatState").split(`(sk${sk.id.toString()})`).length - 1;
}

export function markAsUsed(sk: Skill): void {
  set(
    "_auto_combatState",
    `${get("_auto_combatState")}(sk${sk.id.toString()})`,
  );
}

export function markAsUsed$1(it: Item): void {
  if (it !== $item.none) {
    set(
      "_auto_combatState",
      `${get("_auto_combatState")}(it${it.id.toString()})`,
    );
  }
}

let $_canUse_exclusives: Map<number, $_canUse_SkillSet> | undefined;

export function auto_canUse(
  sk: Skill,
  onlyOnce: boolean = true, // assume onlyOnce unless specified otherwise
  inCombat: boolean = currentRound() > 0, //assume we are in combat unless specified otherwise
): boolean {
  if (onlyOnce && haveUsed(sk)) {
    return false;
  }

  if (!auto_have_skill(sk)) {
    return false;
  }

  if (inCombat) {
    if (
      myMp() < mpCost(sk) ||
      myHp() <= hpCost(sk) ||
      getFuel() < fuelCost(sk) ||
      myLightning() < lightningCost(sk) ||
      myThunder() < thunderCost(sk) ||
      myRain() < rainCost(sk) ||
      mySoulsauce() < soulsauceCost(sk) ||
      myPp() < plumber_ppCost(sk) ||
      myMeat() < meatCost(sk)
    ) {
      return false;
    }
  } else {
    if (
      myMaxmp() < mpCost(sk) ||
      myMaxhp() <= hpCost(sk) ||
      getFuel() < fuelCost(sk) ||
      myLightning() < lightningCost(sk) ||
      myThunder() < thunderCost(sk) ||
      myRain() < rainCost(sk) ||
      mySoulsauce() < soulsauceCost(sk) ||
      myMeat() < meatCost(sk)
    ) {
      return false;
    }
  }

  if (sk === $skill`Shieldbutt` && !hasShieldEquipped()) {
    return false;
  }
  $_canUse_exclusives ??= new Map();
  if (!$_static_1) {
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(1, [
        $skill`Curse of Vichyssoise`,
        $skill`Curse of Marinara`,
        $skill`Curse of the Thousand Islands`,
        $skill`Curse of Weaksauce`,
      ]),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(equippedAmount($item`vampyric cloake`), [
        $skill`Become a Wolf`,
        $skill`Become a Cloud of Mist`,
        $skill`Become a Bat`,
      ]),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(1, [
        $skill`Shadow Noodles`,
        $skill`Entangling Noodles`,
      ]),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(1, [
        $skill`Silent Slam`,
        $skill`Silent Squirt`,
        $skill`Silent Slice`,
      ]),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(equippedAmount(wrap_item($item`haiku katana`)), [
        $skill`The 17 Cuts`,
        $skill`Falling Leaf Whirlwind`,
        $skill`Spring Raindrop Attack`,
        $skill`Summer Siesta`,
        $skill`Winter's Bite Technique`,
      ]),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(
        equippedAmount($item`bottle-rocket crossbow`) +
          equippedAmount($item`replica bottle-rocket crossbow`),
        [
          $skill`Fire red bottle-rocket`,
          $skill`Fire blue bottle-rocket`,
          $skill`Fire orange bottle-rocket`,
          $skill`Fire purple bottle-rocket`,
          $skill`Fire black bottle-rocket`,
        ],
      ),
    );
    $_canUse_exclusives.set(
      $_canUse_exclusives.size,
      new $_canUse_SkillSet(1, [
        $skill`Kodiak Moment`,
        $skill`Grizzly Scene`,
        $skill`Bear-Backrub`,
        $skill`Bear-ly Legal`,
        $skill`Bear Hug`,
      ]),
    );
    $_static_1 = true;
  }

  for (const [, set] of $_canUse_exclusives) {
    if (set.skills.includes(sk)) {
      let total: number = 0;
      for (const check_1 of set.skills) {
        total += usedCount(check_1);
      }
      if (total >= set.count) {
        return false;
      }
    }
  }

  return true;
}

export function canUse$3(
  it: Item,
  onlyOnce: boolean = true, // assume onlyOnce unless specified otherwise
): boolean {
  if (onlyOnce && haveUsed$1(it)) {
    return false;
  }

  if (itemAmount(it) === 0) {
    return false;
  }

  if (!auto_is_valid(it)) {
    return false;
  }

  return true;
}

export function auto_useSkill(
  sk: Skill,
  mark: boolean = true,
): CombatMacroReturns {
  if (mark) {
    markAsUsed(sk);
  }

  return sk;
}

export function useItem(it: Item, mark: boolean = true): Item {
  if (mark) {
    markAsUsed$1(it);
  }
  return it;
}

export function useItems(it1: Item, it2: Item, mark: boolean = true): Item[] {
  if (mark) {
    markAsUsed$1(it1);
    markAsUsed$1(it2);
  }
  return [it1, it2];
}

function sniffSource(sk: Skill | Item): string {
  return sk === $skill`Get a Good Whiff of This Guy`
    ? "Nosy Nose"
    : sk.toString();
}

export function isSniffed(enemy: Monster, sk: Skill | Item): boolean {
  return trackedBy(enemy).includes(sniffSource(sk));
}

export function isSniffed$1(enemy: Monster): boolean {
  return trackedBy(enemy).length > 0;
}

// Sniffs that exempt their target from the adventure queue's 75% re-roll, which is most of
// what a sniff is worth. Mafia tracks the ones already on a monster, we need the rest.
const queueSuppressingSniffs = $skills`Transcendent Olfaction, Long Con, Hunt, Motif, McHugeLarge Slash, Meat Cute`;

// One paid sniff per target: a second charge adds around 10% more encounters, where that same
// charge on a zone with nothing sniffed adds 40%. An uncommitted Nose is free, so it may top up.
function snifferAvailable(
  enemy: Monster,
  sk: Skill,
  committed: string[],
): boolean {
  if (isSniffed(enemy, sk) || committed.includes(sniffSource(sk))) {
    return false;
  }
  if (!isSniffed$1(enemy) || sk === $skill`Get a Good Whiff of This Guy`) {
    return true;
  }
  return queueSuppressingSniffs.includes(sk) && !trackIgnoreQueue(enemy);
}

export function getSniffer(enemy: Monster, inCombat: boolean = true): Skill {
  //returns the skill we want to use to sniff the enemy
  //sniffers are skills that increase the odds of encountering this same monster again in the current zone.
  // Ordered by what each one is worth: the queue exemption first, then extra copies
  const committed = auto_committedSniffs();
  if (
    auto_canUse($skill`Transcendent Olfaction`, true, inCombat) &&
    get("_olfactionsUsed") < 3 &&
    snifferAvailable(enemy, $skill`Transcendent Olfaction`, committed)
  ) {
    return $skill`Transcendent Olfaction`;
  }
  if (
    auto_canUse($skill`Hunt`, true, inCombat) &&
    haveEffect($effect`Everything Looks Red`) === 0 &&
    snifferAvailable(enemy, $skill`Hunt`, committed)
  ) {
    return $skill`Hunt`; //WereProfessor Werewolf specific skill
  }
  if (
    auto_canUse($skill`Meat Cute`, true, inCombat) &&
    get("_meatCuteUsed") < 5 &&
    snifferAvailable(enemy, $skill`Meat Cute`, committed)
  ) {
    return $skill`Meat Cute`; //Meat Golem specific skill
  }
  if (
    auto_canUse($skill`Long Con`, true, inCombat) &&
    get("_longConUsed") < 5 &&
    snifferAvailable(enemy, $skill`Long Con`, committed)
  ) {
    return $skill`Long Con`;
  }
  if (inCombat) {
    if (
      auto_canUse($skill`McHugeLarge Slash`, true, inCombat) &&
      snifferAvailable(enemy, $skill`McHugeLarge Slash`, committed) &&
      McHugeLarge.McLargeHugeSniffsLeft() > 0
    ) {
      return $skill`McHugeLarge Slash`;
    }
  } else if (
    possessEquipment($item`McHugeLarge left pole`) &&
    snifferAvailable(enemy, $skill`McHugeLarge Slash`, committed) &&
    McHugeLarge.McLargeHugeSniffsLeft() > 0
  ) {
    return $skill`McHugeLarge Slash`;
  }
  if (
    auto_canUse($skill`Motif`, true, inCombat) &&
    snifferAvailable(enemy, $skill`Motif`, committed) &&
    haveEffect($effect`Everything Looks Blue`) === 0
  ) {
    return $skill`Motif`;
  }
  if (
    auto_canUse($skill`Make Friends`, true, inCombat) &&
    myAudience() >= 20 &&
    snifferAvailable(enemy, $skill`Make Friends`, committed)
  ) {
    return $skill`Make Friends`; //avatar of sneaky pete specific skill
  }
  if (
    auto_canUse($skill`Perceive Soul`, true, inCombat) &&
    snifferAvailable(enemy, $skill`Perceive Soul`, committed)
  ) {
    return $skill`Perceive Soul`;
  }
  if (inCombat) {
    if (
      auto_canUse($skill`Monkey Point`, true, inCombat) &&
      snifferAvailable(enemy, $skill`Monkey Point`, committed)
    ) {
      return $skill`Monkey Point`;
    }
  } else if (
    MonkeyPaw.monkeyPawWishesLeft() === 1 &&
    snifferAvailable(enemy, $skill`Monkey Point`, committed)
  ) {
    return $skill`Monkey Point`;
  }
  if (
    auto_canUse($skill`Gallapagosian Mating Call`, true, inCombat) &&
    snifferAvailable(enemy, $skill`Gallapagosian Mating Call`, committed)
  ) {
    return $skill`Gallapagosian Mating Call`;
  }
  if (
    myFamiliar() === $familiar`Nosy Nose` &&
    auto_canUse($skill`Get a Good Whiff of This Guy`) &&
    snifferAvailable(enemy, $skill`Get a Good Whiff of This Guy`, committed)
  ) {
    return $skill`Get a Good Whiff of This Guy`;
  }
  if (
    auto_canUse($skill`Offer Latte to Opponent`, true, inCombat) &&
    !get("_latteCopyUsed") &&
    snifferAvailable(enemy, $skill`Offer Latte to Opponent`, committed)
  ) {
    return $skill`Offer Latte to Opponent`;
  }
  // Zootomist kicks. We might have to move this depending on what happens with cooldowns
  const z_kick: Skill = getZooKickSniff();
  if (auto_canUse(z_kick) && snifferAvailable(enemy, z_kick, committed)) {
    return z_kick;
  }
  // Last because it banishes the rest of the zone to guarantee its two fights, which also means
  // it is only safe where nothing else here is wanted.
  if (
    enemy.copyable &&
    Eagle.canRWBBlast() &&
    (!inCombat ||
      auto_canUse($skill`%fn, fire a Red, White and Blue Blast`, true, true)) &&
    auto_soleTargetHere(enemy, myLocation())
  ) {
    return $skill`%fn, fire a Red, White and Blue Blast`;
  }

  return $skill.none;
}

type TrackedMonster = { monster: Monster; source: string; turn: number };

export function getTrackedMonsters(): TrackedMonster[] {
  return get("trackedMonsters")
    .split(":")
    .reduce<Array<{ monster: Monster; source: string; turn: number }>>(
      (result, _, index, parts) => {
        if (index % 3 === 0 && parts[index]) {
          result.push({
            monster: Monster.get(parts[index]),
            source: parts[index + 1],
            turn: Number(parts[index + 2]),
          });
        }
        return result;
      },
      [],
    );
}

export function getStunner(enemy: Monster): Skill {
  if (
    auto_canUse($skill`Blow the Blue Candle!`) &&
    haveEffect($effect`Everything Looks Blue`) === 0
  ) {
    return $skill`Blow the Blue Candle!`; //20 Turns
  }
  // Class specific
  switch (myClass()) {
    case $class`Seal Clubber`:
      if (
        auto_canUse($skill`Club Foot`) &&
        (myFury() > 0 || hasClubEquipped())
      ) {
        return $skill`Club Foot`;
      }
      break;
    case $class`Turtle Tamer`:
      if (auto_canUse($skill`Shell Up`)) {
        //storm turtle blessings makes shell up a multi-round stun, otherwise it's just a (special) stagger
        if (
          haveEffect($effect`Blessing of the Storm Tortoise`) > 0 ||
          haveEffect($effect`Grand Blessing of the Storm Tortoise`) > 0 ||
          haveEffect($effect`Glorious Blessing of the Storm Tortoise`) > 0
        ) {
          return $skill`Shell Up`;
        }
      }
      break;
    case $class`Accordion Thief`:
      if (
        auto_canUse($skill`Accordion Bash`) &&
        itemType(equippedItem($slot`weapon`)) === "accordion"
      ) {
        return $skill`Accordion Bash`;
      }
      break;
    case $class`Pastamancer`:
      if (auto_canUse($skill`Entangling Noodles`)) {
        return $skill`Entangling Noodles`;
      }
      break;
    case $class`Sauceror`:
      if (auto_canUse($skill`Soul Bubble`)) {
        return $skill`Soul Bubble`;
      }
      break;
    case $class`Avatar of Boris`:
      if (auto_canUse($skill`Broadside`)) {
        return $skill`Broadside`;
      }
      break;
    case $class`Avatar of Sneaky Pete`:
      if (auto_canUse($skill`Snap Fingers`)) {
        return $skill`Snap Fingers`;
      }
      break;
    case $class`Avatar of Jarlsberg`:
      if (auto_canUse($skill`Blend`)) {
        return $skill`Blend`;
      }
      break;
    case $class`Cow Puncher`:
    case $class`Beanslinger`:
    case $class`Snake Oiler`:
      if (auto_canUse($skill`Beanscreen`)) {
        return $skill`Beanscreen`;
      }
      if (
        auto_canUse($skill`Hogtie`) &&
        !haveUsed($skill`Beanscreen`) &&
        enemy.parts.includes("leg")
      ) {
        return $skill`Hogtie`;
      }
      break;
    case $class`Vampyre`:
      if (
        auto_canUse($skill`Blood Chains`) &&
        myHp() > 3 * hpCost($skill`Blood Chains`)
      ) {
        return $skill`Blood Chains`;
      }
      break;
    case $class`Pig Skinner`:
      if (auto_canUse($skill`Noogie`)) {
        return $skill`Noogie`;
      }
      break;
    case $class`Cheese Wizard`:
      if (auto_canUse($skill`Gather Cheese-Chi`)) {
        return $skill`Gather Cheese-Chi`;
      }
      break;
    case $class`Jazz Agent`:
      if (auto_canUse($skill`Drum Roll`, true)) {
        return $skill`Drum Roll`;
      }
      break;
    case $class`Meat Golem`:
      if (auto_canUse($skill`Meat Locker`, true)) {
        return $skill`Meat Locker`;
      }
      break;
  }
  // From Designer Sweatpants. Use when have nearly full sweat or when losing combat
  if (
    auto_canUse($skill`Sweat Flood`) &&
    (Sweatpants.getSweat() > 98 ||
      containsText(get("_auto_combatState"), "last attempt"))
  ) {
    return $skill`Sweat Flood`;
  }
  // Decreases in stun duration the more it's used
  if (auto_canUse($skill`Summon Love Gnats`)) {
    return $skill`Summon Love Gnats`;
  }
  // Nuclear Autum
  if (auto_canUse($skill`Mind Bullets`)) {
    return $skill`Mind Bullets`;
  }

  return $skill.none;
}

export function enemyCanBlocksSkills(): boolean {
  //we want to know if enemy can sometimes block a skill. For such enemies skills should be used only if absolutely necessary
  //for enemies that always block a skill a seperate function should be made... if we ever fight any in run.

  const enemy: Monster = lastMonster();

  if (
    $monsters`Bonerdagon, Naughty Sorceress, Naughty Sorceress (2)`.includes(
      enemy,
    )
  ) {
    return true;
  }

  return false;
}

export function canSurvive(mult: number, add_1: number = 0): boolean {
  let damage: number = expectedDamage();

  if (lastMonster() === $monster`wall of meat`) {
    damage = myMaxhp() * 0.17;
  }

  damage *= mult;
  damage += add_1;
  return Math.ceil(damage) < myHp();
}

export function hasClubEquipped(): boolean {
  return (
    itemType(equippedItem($slot`weapon`)) === "club" ||
    (itemType(equippedItem($slot`weapon`)) === "sword" &&
      haveEffect($effect`Iron Palms`) > 0)
  );
}

export function findBanisher(
  round_1: number,
  enemy: Monster,
  text: string,
): CombatMacroReturns {
  const banishAction: CombatMacroReturns = banisherCombatAction$1(
    enemy,
    myLocation(),
    true,
  );
  if (banishAction !== undefined) {
    auto_log_info(`Looking at banishAction: ${banishAction}`, "green");
    handleTracker({
      tracker: "banishes",
      monster: enemy,
      location: myLocation(),
      source: banishAction.toString(),
    });
    return banishAction;
  }
  if (auto_canUse($skill`Storm of the Scarab`, false)) {
    return auto_useSkill($skill`Storm of the Scarab`, false);
  }
  return auto_combatHandler(round_1, enemy, text);
}

export function banisherCombatString(
  enemyPhylum: Phylum,
  loc: Location,
  inCombat: boolean = false,
): CombatMacroReturns {
  if (inAftercore()) {
    return undefined;
  }

  if (in_pokefam()) {
    return undefined;
  }
  //Check that we actually want to banish this thing.
  if (!auto_wantToBanish$1(enemyPhylum, loc)) {
    return undefined;
  }

  if (inCombat) {
    auto_log_info(
      `Finding a phylum banisher to use on ${enemyPhylum} at ${loc}`,
      "green",
    );
  }

  if (
    inCombat
      ? myFamiliar() === $familiar`Patriotic Eagle` &&
        get("screechCombats") === 0 &&
        !in_glover()
      : !in_avantGuard() &&
        pathAllowsChangingFamiliar() &&
        !auto_famKill($familiar`Patriotic Eagle`, loc) &&
        auto_have_familiar($familiar`Patriotic Eagle`) &&
        get("screechCombats") === 0 &&
        !in_glover()
  ) {
    return $skill`%fn, Release the Patriotic Screech!`;
  }

  return undefined;
}

export function banisherCombatAction$1(
  enemy: Monster,
  loc: Location,
  inCombat: boolean = currentRound() > 0,
): CombatMacroReturns {
  if (inAftercore()) {
    return undefined;
  }

  if (in_pokefam()) {
    return undefined;
  }
  //If it's already banished, banishing it again isn't going to do much.
  if (isBanished(enemy)) {
    return undefined;
  }
  //Check that we actually want to banish this thing.
  if (!auto_wantToBanish(enemy, loc)) {
    return undefined;
  }

  if (inCombat) {
    auto_log_info(`Finding a banisher to use on ${enemy} at ${loc}`, "green");
  }

  let useFree: boolean = true; // use banisher that is a freerun
  if (is_werewolf()) {
    useFree = false; // werewolves don't run
  }
  //src/net/sourceforge/kolmafia/session/BanishManager.java
  const used: string[] = auto_banishesUsedAt(loc);
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
  if (
    (inCombat
      ? auto_have_skill($skill`Spring Kick`)
      : possessEquipment($item`spring shoes`)) &&
    auto_is_valid$2($skill`Spring Kick`) &&
    !used.includes("Spring Kick")
  ) {
    return $skill`Spring Kick`;
  }

  if (
    auto_have_skill($skill`Peel Out`) &&
    pete_peelOutRemaining() > 0 &&
    get("peteMotorbikeMuffler") === "Extra-Smelly Muffler" &&
    !used.includes("Peel Out") &&
    useFree
  ) {
    return $skill`Peel Out`;
  }

  if (
    auto_have_skill($skill`Howl of the Alpha`) &&
    myMp() > mpCost($skill`Howl of the Alpha`) &&
    !used.includes("Howl of the Alpha")
  ) {
    return $skill`Howl of the Alpha`;
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Throw Latte on Opponent`)
      : possessEquipment($item`latte lovers member's mug`)) &&
    auto_is_valid$2($skill`Throw Latte on Opponent`) &&
    !get("_latteBanishUsed") &&
    !used.includes("Throw Latte on Opponent") &&
    useFree
  ) {
    return $skill`Throw Latte on Opponent`;
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Give Your Opponent the Stinkeye`)
      : possessEquipment($item`stinky cheese eye`)) &&
    auto_is_valid$2($skill`Give Your Opponent the Stinkeye`) &&
    !get("_stinkyCheeseBanisherUsed") &&
    myMp() >= mpCost($skill`Give Your Opponent the Stinkeye`) &&
    useFree
  ) {
    return $skill`Give Your Opponent the Stinkeye`;
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Creepy Grin`)
      : possessEquipment($item`V for Vivala mask`)) &&
    auto_is_valid$2($skill`Creepy Grin`) &&
    !get("_vmaskBanisherUsed") &&
    myMp() >= mpCost($skill`Creepy Grin`) &&
    useFree
  ) {
    return $skill`Creepy Grin`;
  }

  if (
    auto_have_skill($skill`Baleful Howl`) &&
    myHp() > hpCost($skill`Baleful Howl`) &&
    get("_balefulHowlUses") < 10 &&
    !used.includes("baleful howl") &&
    useFree
  ) {
    loopHandlerDelayAll();
    return $skill`Baleful Howl`;
  }

  if (
    auto_have_skill($skill`Thunder Clap`) &&
    myThunder() >= thunderCost($skill`Thunder Clap`) &&
    !used.includes("thunder clap")
  ) {
    return $skill`Thunder Clap`;
  }
  if (
    auto_have_skill($skill`Asdon Martin: Spring-Loaded Front Bumper`) &&
    auto_is_valid$2($skill`Asdon Martin: Spring-Loaded Front Bumper`) &&
    getFuel() >= fuelCost($skill`Asdon Martin: Spring-Loaded Front Bumper`) &&
    !used.includes("Spring-Loaded Front Bumper") &&
    useFree
  ) {
    if (!containsText(get("banishedMonsters"), "Spring-Loaded Front Bumper")) {
      return $skill`Asdon Martin: Spring-Loaded Front Bumper`;
    }
  }
  if (
    auto_have_skill($skill`Curse of Vacation`) &&
    myMp() > mpCost($skill`Curse of Vacation`) &&
    !used.includes("curse of vacation")
  ) {
    return $skill`Curse of Vacation`;
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Show them your ring`)
      : possessEquipment($item`mafia middle finger ring`)) &&
    auto_is_valid$2($skill`Show them your ring`) &&
    canEquip($item`mafia middle finger ring`) &&
    !get("_mafiaMiddleFingerRingUsed") &&
    myMp() >= mpCost($skill`Show them your ring`) &&
    useFree
  ) {
    return $skill`Show them your ring`;
  }
  if (
    auto_have_skill($skill`Batter Up!`) &&
    myFury() >= 5 &&
    (inCombat ? hasClubEquipped() : true) &&
    auto_is_valid$2($skill`Batter Up!`) &&
    !used.includes("batter up!")
  ) {
    return $skill`Batter Up!`;
  }

  if (
    inCombat
      ? auto_have_skill($skill`Mark Your Territory`) &&
        !used.includes("Mark Your Territory")
      : auto_is_valid$2($skill`Mark Your Territory`) &&
        (auto_have_skill($skill`Mark Your Territory`) ||
          (availableAmount($item`pheromone cocktail`) > 0 &&
            auto_canDrink($item`pheromone cocktail`) &&
            inebriety_left() > 1 &&
            !isActuallyEd()))
  ) {
    return $skill`Mark Your Territory`;
  }

  const z_kick: Skill = getZooKickBanish();
  if (auto_have_skill(z_kick) && myMp() > mpCost(z_kick)) {
    return z_kick;
  }

  if (
    auto_have_skill($skill`Banishing Shout`) &&
    myMp() > mpCost($skill`Banishing Shout`) &&
    !used.includes("banishing shout")
  ) {
    return $skill`Banishing Shout`;
  }
  if (
    auto_have_skill($skill`Walk Away From Explosion`) &&
    myMp() > mpCost($skill`Walk Away From Explosion`) &&
    haveEffect($effect`Bored With Explosions`) === 0 &&
    !used.includes("walk away from explosion")
  ) {
    return $skill`Walk Away From Explosion`;
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Talk About Politics`)
      : possessEquipment($item`Pantsgiving`)) &&
    auto_is_valid$2($skill`Talk About Politics`) &&
    get("_pantsgivingBanish") < 5 &&
    haveEquipped($item`Pantsgiving`) &&
    !used.includes("pantsgiving")
  ) {
    return $skill`Talk About Politics`;
  }
  if (
    get("heartstoneBanishUnlocked") &&
    (inCombat
      ? auto_have_skill($skill`Heartstone: %banish`)
      : possessEquipment(Heartstone.getItemToEquipHeartstone())) &&
    auto_is_valid$2($skill`Heartstone: %banish`) &&
    get("_heartstoneBanishUsed") < 5 &&
    haveEquipped(Heartstone.getItemToEquipHeartstone()) &&
    !used.includes("Heartstone %banish")
  ) {
    return $skill`Heartstone: %banish`;
  }
  if (
    inCombat
      ? auto_have_skill($skill`Reflex Hammer`)
      : LilDoctorBag.reflexHammersRemaining() > 0 &&
        !used.includes("Reflex Hammer") &&
        useFree
  ) {
    return $skill`Reflex Hammer`;
  }
  if (
    (inCombat
      ? auto_have_skill($skill`Show your boring familiar pictures`)
      : possessEquipment($item`familiar scrapbook`)) &&
    auto_is_valid$2($skill`Show your boring familiar pictures`) &&
    (get("scrapbookCharges") >= 200 ||
      (get("scrapbookCharges") >= 100 && myLevel() >= 13)) &&
    !used.includes("Show Your Boring Familiar Pictures") &&
    useFree
  ) {
    return $skill`Show your boring familiar pictures`;
  }
  // bowling ball is only in inventory if it is available to use in combat. While on cooldown, it is not in inventory
  if (
    (inCombat
      ? auto_have_skill($skill`Bowl a Curveball`)
      : itemAmount($item`cosmic bowling ball`) > 0) &&
    auto_is_valid$2($skill`Bowl a Curveball`) &&
    !used.includes("Bowl a Curveball") &&
    useFree
  ) {
    return $skill`Bowl a Curveball`;
  }

  if (
    EmotionChip.canFeelHatred() &&
    auto_is_valid$2($skill`Feel Hatred`) &&
    !used.includes("Feel Hatred") &&
    useFree
  ) {
    return $skill`Feel Hatred`;
  }

  if (auto_have_skill($skill`[7510]Punt`) && !used.includes("Punt")) {
    return $skill`[7510]Punt`;
  }

  if (
    auto_have_skill($skill`Snokebomb`) &&
    auto_is_valid$2($skill`Snokebomb`) &&
    get("_snokebombUsed") < 3 &&
    myMp() - 20 >= mpCost($skill`Snokebomb`) &&
    !used.includes("snokebomb") &&
    useFree
  ) {
    return $skill`Snokebomb`;
  }

  if (
    itemAmount($item`stuffed yam stinkbomb`) > 0 &&
    !used.includes("stuffed yam stinkbomb") &&
    auto_is_valid($item`stuffed yam stinkbomb`)
  ) {
    return $item`stuffed yam stinkbomb`;
  }

  if (
    inCombat
      ? itemAmount($item`handful of split pea soup`) > 0 &&
        !used.includes("Handful of split pea soup") &&
        auto_is_valid($item`handful of split pea soup`) &&
        useFree
      : itemAmount($item`handful of split pea soup`) > 0 ||
        itemAmount($item`whirled peas`) >= 2
  ) {
    return $item`handful of split pea soup`;
  }

  if (
    auto_have_skill($skill`[28021]Punt`) &&
    myMp() > mpCost($skill`[28021]Punt`) &&
    !used.includes("Punt")
  ) {
    return $skill`[28021]Punt`;
  }

  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (
    (inCombat ? haveEquipped(saber) : possessEquipment(saber)) &&
    auto_is_valid$2($skill`Use the Force`) &&
    Saber.saberChargesAvailable() > 0 &&
    !used.includes("Saber Force")
  ) {
    // can't use the force on uncopyable monsters
    if (enemy === $monster.none || enemy.copyable) {
      return Saber.combatSaberBanish();
    }
  }

  if (
    (inCombat
      ? auto_have_skill($skill`KGB tranquilizer dart`)
      : possessEquipment($item`Kremlin's Greatest Briefcase`)) &&
    auto_is_valid$2($skill`KGB tranquilizer dart`) &&
    get("_kgbTranquilizerDartUses") < 3 &&
    myMp() >= mpCost($skill`KGB tranquilizer dart`) &&
    !used.includes("KGB tranquilizer dart") &&
    useFree
  ) {
    let useIt: boolean = true;
    if (
      get("sidequestJunkyardCompleted") !== "none" &&
      myDaycount() >= 2 &&
      get("_kgbTranquilizerDartUses") >= 2
    ) {
      useIt = false;
    }

    if (useIt) {
      return $skill`KGB tranquilizer dart`;
    }
  }

  if (
    (inCombat
      ? auto_have_skill($skill`Monkey Slap`)
      : possessEquipment($item`cursed monkey's paw`)) &&
    auto_is_valid$2($skill`Monkey Slap`) &&
    get("_monkeyPawWishesUsed") === 0 &&
    !used.includes("Monkey Slap")
  ) {
    return $skill`Monkey Slap`;
  }

  if (
    instakillable(enemy) &&
    (inCombat
      ? auto_have_skill($skill`Sea *dent: Throw a Lightning Bolt`)
      : possessEquipment($item`Monodent of the Sea`)) &&
    Monodent.throwLightningRemaining() > 0 &&
    !used.includes("Sea *dent")
  ) {
    return $skill`Sea *dent: Throw a Lightning Bolt`;
  }

  if (
    auto_have_skill($skill`Order a Kneecapping`) &&
    myMp() > mpCost($skill`Order a Kneecapping`) &&
    !get("_kneecappingOrdered", false) &&
    !used.includes("Order a Kneecapping")
  ) {
    return $skill`Order a Kneecapping`;
  }

  //[Nanorhino] familiar specific banish. fairly low priority as it consumes 40 to 50 adv worth of a decent buff.
  if (
    auto_canUse($skill`Unleash Nanites`) &&
    haveEffect($effect`Nanobrawny`) >= 40
  ) {
    return $skill`Unleash Nanites`;
  }

  if (
    auto_have_skill($skill`Beancannon`) &&
    get("_beanCannonUses", 0) < 5 &&
    myMp() - 20 >= mpCost($skill`Beancannon`) &&
    !used.includes("beancannon")
  ) {
    let haveBeans: boolean = false;
    for (const beancan of $items`Frigid Northern Beans, Heimz Fortified Kidney Beans, Hellfire Spicy Beans, Mixed Garbanzos and Chickpeas, Pork 'n' Pork 'n' Pork 'n' Beans, Shrub's Premium Baked Beans, Tesla's Electroplated Beans, Trader Olaf's Exotic Stinkbeans, World's Blackest-Eyed Peas`) {
      if (
        inCombat
          ? equippedItem($slot`off-hand`) === beancan
          : possessEquipment(beancan)
      ) {
        haveBeans = true;
        break;
      }
    }
    if (haveBeans) {
      return $skill`Beancannon`;
    }
  }

  if (
    itemAmount($item`human musk`) > 0 &&
    !used.includes("human musk") &&
    auto_is_valid($item`human musk`) &&
    get("_humanMuskUses") < 3 &&
    useFree
  ) {
    //first 3 are free
    return $item`human musk`;
  }
  // items for which we consume spleen for uses
  if (
    inCombat
      ? auto_have_skill($skill`Breathe Out`) &&
        auto_is_valid$2($skill`Breathe Out`) &&
        myMp() >= mpCost($skill`Breathe Out`) &&
        !used.includes("breathe out") &&
        useFree
      : auto_is_valid$2($skill`Breathe Out`) &&
        (auto_have_skill($skill`Breathe Out`) ||
          (availableAmount($item`hot jelly`) > 0 &&
            spleen_left() > 1 &&
            !isActuallyEd()))
  ) {
    return $skill`Breathe Out`;
  }

  if (
    inCombat
      ? auto_have_skill($skill`Punch Out your Foe`) &&
        auto_is_valid$2($skill`Punch Out your Foe`) &&
        myMp() >= mpCost($skill`Punch Out your Foe`) &&
        !used.includes("punch out your foe") &&
        useFree
      : auto_is_valid$2($skill`Punch Out your Foe`) &&
        (auto_have_skill($skill`Punch Out your Foe`) ||
          (availableAmount($item`scoop of pre-workout powder`) > 0 &&
            spleen_left() > 3 &&
            !isActuallyEd()))
  ) {
    return $skill`Punch Out your Foe`;
  }
  //We want to limit usage of these much more than the others.
  if (
    !$monsters`natural spider, Tan Gnat, tomb servant, upgraded ram`.includes(
      enemy,
    )
  ) {
    return undefined;
  }

  let keep: number = 1;
  if (get("sidequestJunkyardCompleted") !== "none") {
    keep = 0;
  }

  if (
    itemAmount($item`Louder Than Bomb`) > keep &&
    !used.includes("louder than bomb") &&
    auto_is_valid($item`Louder Than Bomb`) &&
    useFree
  ) {
    return $item`Louder Than Bomb`;
  }
  if (
    itemAmount($item`tennis ball`) > keep &&
    !used.includes("tennis ball") &&
    auto_is_valid($item`tennis ball`) &&
    useFree
  ) {
    return $item`tennis ball`;
  }
  if (
    itemAmount($item`deathchucks`) > keep &&
    !used.includes("deathchucks") &&
    auto_is_valid($item`deathchucks`) &&
    useFree
  ) {
    return $item`deathchucks`;
  }
  if (
    itemAmount($item`divine champagne popper`) > keep &&
    !used.includes("divine champagne popper") &&
    auto_is_valid($item`divine champagne popper`) &&
    useFree
  ) {
    return $item`divine champagne popper`;
  }
  if (
    itemAmount($item`anchor bomb`) > keep &&
    !used.includes("anchor bomb") &&
    auto_is_valid($item`anchor bomb`) &&
    useFree
  ) {
    return $item`anchor bomb`;
  }

  return undefined;
}

export function useInstaKill(
  target: Monster,
  inCombat: boolean = true,
): CombatMacroReturns {
  if (!auto_wantToInstaKill(target, myLocation())) {
    return undefined;
  }

  // Preferred over the cudgel, as it doesn't cost us anything and gives a bunch of stats
  if (
    Heartstone.haveHeartstone() &&
    get("heartstoneKillUnlocked") &&
    get("_heartstoneKillUsed") < 5 &&
    (inCombat
      ? auto_canUse($skill`Heartstone: %kill`, true, inCombat)
      : possessEquipment($item`Heartstone`))
  ) {
    return $skill`Heartstone: %kill`;
  }

  if (
    auto_canUse($skill`Carbohydrate Cudgel`, true, inCombat) &&
    (inCombat
      ? itemAmount($item`dry noodles`) > 0
      : acquireOrPull($item`dry noodles`, true))
  ) {
    return $skill`Carbohydrate Cudgel`;
  }

  return undefined;
}

export function yellowRayCombatString(
  target: Monster,
  inCombat: boolean,
  noForceDrop: boolean = false,
): CombatMacroReturns {
  if (in_wildfire() && inCombat && myLocation().fireLevel > 2) {
    //high fire level burns yellow ray items. except for saber's [use the force] as it leads to a noncombat
    //we only want special handling if fire level is high. otherwise we can proceed to yellowray as per normal
    if (
      haveEquipped(wrap_item($item`Fourth of May Cosplay Saber`)) &&
      Saber.saberChargesAvailable() > 0
    ) {
      // can't use the force on uncopyable monsters
      if (target === $monster.none || (target.copyable && !noForceDrop)) {
        return Saber.combatSaberYR();
      }
    } else {
      return undefined;
    }
  }

  if (in_zootomist() && haveEffect($effect`Everything Looks Yellow`) <= 0) {
    const kick: Skill = getZooKickYR();
    if (kick !== $skill.none) {
      return kick;
    }
  }

  const free_monster: boolean =
    isFreeMonster(target, myLocation()) ||
    (get("breathitinCharges") > 0 && myLocation().environment === "outdoor");

  if (haveEffect($effect`Everything Looks Yellow`) <= 0) {
    if (
      auto_have_skill($skill`Fondeluge`) &&
      myMp() >= mpCost($skill`Fondeluge`)
    ) {
      return $skill`Fondeluge`; // 50 turns
    }
    if (
      itemAmount($item`yellowcake bomb`) > 0 &&
      auto_is_valid($item`yellowcake bomb`)
    ) {
      return $item`yellowcake bomb`; // 75 turns + quest item
    }
    if (
      free_monster &&
      itemAmount($item`yellow rocket`) > 0 &&
      auto_is_valid($item`yellow rocket`)
    ) {
      return $item`yellow rocket`; // 75 turns & 250 meat - better than wasting a freekill on an already free monster
    }
    if (
      inCombat
        ? haveSkill($skill`Spit jurassic acid`)
        : Parka.hasParka() &&
          auto_is_valid$2($skill`Spit jurassic acid`) &&
          hasTorso()
    ) {
      return $skill`Spit jurassic acid`; //100 Turns and free kill
    }
    if (
      itemAmount($item`yellow rocket`) > 0 &&
      auto_is_valid($item`yellow rocket`)
    ) {
      return $item`yellow rocket`; // 75 turns & 250 meat
    }
    if (itemAmount($item`spitball`) > 0 && auto_is_valid($item`spitball`)) {
      return $item`spitball`; //100 Turns and free kill
    }
    if (
      inCombat
        ? haveSkill($skill`Blow the Yellow Candle!`)
        : Roman.haveRoman() &&
          auto_can_equip($item`Roman Candelabra`) &&
          auto_is_valid$2($skill`Blow the Yellow Candle!`)
    ) {
      return $skill`Blow the Yellow Candle!`; //75 Turns
    }
    if (
      inCombat
        ? haveSkill($skill`Unleash the Devil's Kiss`)
        : Retrocape.hasRetrocape() &&
          auto_is_valid$2($skill`Unleash the Devil's Kiss`)
    ) {
      return $skill`Unleash the Devil's Kiss`; // 99 turns
    }
    if (
      auto_have_skill($skill`Disintegrate`) &&
      auto_is_valid$2($skill`Disintegrate`) &&
      myMp() >= mpCost($skill`Disintegrate`)
    ) {
      return $skill`Disintegrate`; // 100 trurns
    }
    if (
      auto_have_skill($skill`Ball Lightning`) &&
      myLightning() >= lightningCost($skill`Ball Lightning`)
    ) {
      return $skill`Ball Lightning`; // 99 turns + 5 lightning
    }
    if (
      auto_have_skill($skill`Wrath of Ra`) &&
      myMp() >= mpCost($skill`Wrath of Ra`)
    ) {
      return $skill`Wrath of Ra`; // 100 turns
    }
    if (
      itemAmount($item`mayo lance`) > 0 &&
      auto_is_valid($item`mayo lance`) &&
      get("mayoLevel") > 0 &&
      auto_is_valid($item`mayo lance`)
    ) {
      return $item`mayo lance`; // 0 - 145 turns
    }
    if (
      get("peteMotorbikeHeadlight") === "Ultrabright Yellow Bulb" &&
      auto_have_skill($skill`Flash Headlight`) &&
      myMp() >= mpCost($skill`Flash Headlight`)
    ) {
      return $skill`Flash Headlight`; // 100 turns
    }
    for (const it of $items`Golden Light, pumpkin bomb, unbearable light, viral video, micronova`) {
      if (itemAmount(it) > 0 && auto_is_valid(it)) {
        return it; // ~150 turns
      }
    }
    if (
      auto_have_skill($skill`Unleash Cowrruption`) &&
      haveEffect($effect`Cowrruption`) >= 30
    ) {
      return $skill`Unleash Cowrruption`; // 149 turns
    }
    if (
      (inCombat
        ? myFamiliar() === $familiar`Crimbo Shrub`
        : auto_have_familiar($familiar`Crimbo Shrub`)) &&
      auto_is_valid$2($skill`Open a Big Yellow Present`) &&
      get("shrubGifts") === "yellow"
    ) {
      return $skill`Open a Big Yellow Present`; // 149 turns
    }
  }

  if (AutoAsdonMartin.asdonCanMissile()) {
    return $skill`Asdon Martin: Missile Launcher`;
  }

  if (
    AprilShower.canNorthernExplosionFE() &&
    auto_canUse($skill`Northern Explosion`)
  ) {
    //With April Shower Thoughts Shield
    return $skill`Northern Explosion`;
  }

  if (EmotionChip.canFeelEnvy()) {
    return $skill`Feel Envy`;
  }

  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (
    (inCombat ? haveEquipped(saber) : possessEquipment(saber)) &&
    Saber.saberChargesAvailable() > 0
  ) {
    // can't use the force on uncopyable monsters
    if (target === $monster.none || (target.copyable && !noForceDrop)) {
      return Saber.combatSaberYR();
    }
  }
  // shocking lick doesn't cause everything looks yellow effect and limited only by how many batteries you have. Use all other sources first.
  if (
    inCombat
      ? haveSkill($skill`Shocking Lick`)
      : get("shockingLickCharges") > 0 ||
        PowerPlant.can_get_battery($item`battery (9-Volt)`)
  ) {
    return $skill`Shocking Lick`;
  }

  return undefined;
}

export function replaceMonsterCombatString(
  target: Monster,
  inCombat: boolean = currentRound() > 0,
): CombatMacroReturns {
  if (in_pokefam()) {
    return undefined;
  }
  // We prioritize this skill as the other resources can be used for other stuff
  if (auto_have_skill($skill`Exercise Liquidity`) && inCombat) {
    return $skill`Exercise Liquidity`;
  }
  if (
    MeteorLore.macrometeoritesAvailable() > 0 &&
    auto_is_valid$2($skill`Macrometeorite`)
  ) {
    return $skill`Macrometeorite`;
  }
  if (
    PowerfulGlove.powerfulGloveReplacesAvailable(inCombat) > 0 &&
    auto_is_valid$2($skill`CHEAT CODE: Replace Enemy`)
  ) {
    return $skill`CHEAT CODE: Replace Enemy`;
  }
  if (canUse$3($item`waffle`) && !in_avantGuard()) {
    return useItem($item`waffle`);
  }
  if (
    !inCombat &&
    auto_is_valid$2($skill`Exercise Liquidity`) &&
    (get("exerciseLiquidityCharges", 0) > 0 ||
      // We always speculate here, we prepare elsewhere
      InterestingCoin.chewLiquidAsset(
        auto_replaceTurnsSaved(target, myLocation()),
        false,
        true,
      ))
  ) {
    return $skill`Exercise Liquidity`;
  }

  return undefined;
}

// If we'd end this fight early, whether the drops we'd throw away are ones we'd miss
export function combatStatusCanDiscardDrops(): boolean {
  // We're fine with discarding the sword's drops (not destroying! That's entirely another thing!)
  return (
    !combat_status_check("droptablereplaced") ||
    combat_status_check("droptablereplacedbysword")
  );
}

export function turns_to_kill(dmg: number): number {
  //how long will it take us to kill the current enemy if we are able to deal dmg to it each round
  return toFloat(monsterHp()) / dmg;
}

export type CombatStatusType =
  | "extractSnakeOil"
  | "pickpocket"
  | "choiceMonster"
  | "banishercheck"
  | "phylumbanishercheck"
  | "droptablereplaced"
  | "droptablereplacedbysword"
  | "refractedgazed"
  | "banisher"
  | "yellowray"
  | "freeruncheck"
  | "replacercheck"
  | "replacer"
  | "(it"
  | "sniffed"
  | "copied"
  | "stunned"
  | "skipGhostbusting"
  | "last attempt"
  | "nanorhino_buffed"
  | "gremlinNeedBanish"
  | "cleesh"
  | "curseofindecision"
  | "talismanofrenenutet"
  | "batoomerang"
  | "jokesterGun"
  | "love stinkbug"
  | "love stinkbug2"
  | "unstoppable"
  | "pygmyBowlerHuntGiveUp";

export function combat_status_check(mark: CombatStatusType): boolean {
  return containsText(get("_auto_combatState"), mark);
}

export function combat_status_add(mark: CombatStatusType): void {
  let st: string = get("_auto_combatState");
  if (!combat_status_check(mark)) {
    st = `${st}(${mark})`;
  }
  set("_auto_combatState", st);
}

export function combat_status_remove(mark: CombatStatusType): void {
  const status = get("_auto_combatState").replaceAll(`(${mark})`, "");
  set("_auto_combatState", status);
}

// fightFollowsChoice stays true for the whole fight, so choice monsters are marked here
// rather than in the choice handler, where this reset would wipe the mark.
export function combat_status_reset(): void {
  removeProperty("_auto_combatState");
  if (fightFollowsChoice()) {
    combat_status_add("choiceMonster");
  }
}

export function wantToForceDrop(enemy: Monster): boolean {
  //skills that can be used on any combat round, repeatedly until an item is stolen
  //take into account if a yellow ray has been used. Must have been one that doesn't insta-kill
  const mildEvilAvailable: boolean =
    auto_canUse($skill`Perpetrate Mild Evil`, false) &&
    get("_mildEvilPerpetrated") < 3;
  const swoopAvailable: boolean =
    auto_canUse($skill`Swoop like a Bat`, true) &&
    get("_batWingsSwoopUsed") < 11;

  let forceDrop: boolean = false;
  //only force 1 scent gland from each filthworm
  if (!combat_status_check("yellowray") && !isYellowRayingNextCombat()) {
    if (
      enemy === $monster`larval filthworm` &&
      itemAmount($item`filthworm hatchling scent gland`) < 1
    ) {
      forceDrop = true;
    }
    if (
      enemy === $monster`filthworm drone` &&
      itemAmount($item`filthworm drone scent gland`) < 1
    ) {
      forceDrop = true;
    }
    if (
      enemy === $monster`filthworm royal guard` &&
      itemAmount($item`filthworm royal guard scent gland`) < 1
    ) {
      forceDrop = true;
    }
  }
  // polar vortex/mild evil is more likely to pocket an item the higher the drop rate. Unlike XO which has equal chance for all drops
  // reserve extinguisher 30 charge for filth worms
  if (
    FireExtinguisher.fireExtinguisherCharges() > 20 ||
    mildEvilAvailable ||
    swoopAvailable
  ) {
    let dropsFromYR: number = 0;
    if (combat_status_check("yellowray") || isYellowRayingNextCombat()) {
      dropsFromYR = 1;
    }

    if (
      $monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`.includes(
        enemy,
      )
    ) {
      if (hedgeTrimmersNeeded() + dropsFromYR > 0) {
        forceDrop = true;
      }
    }
    // Number of times bowled is 1 less than hiddenBowlingAlleyProgress. Need 5 bowling balls total, 5+1 = 6 needed in this conditional
    if (
      enemy === $monster`pygmy bowler` &&
      get("hiddenBowlingAlleyProgress") +
        itemAmount($item`bowling ball`) +
        dropsFromYR <
        6
    ) {
      forceDrop = true;
    }

    if (
      enemy === $monster`dairy goat` &&
      itemAmount($item`goat cheese`) + dropsFromYR < 3
    ) {
      forceDrop = true;
    }

    if (
      $item`shadow brick`.toString() in itemDrops(enemy) &&
      PayPhone.neededShadowBricks() + dropsFromYR > 0
    ) {
      forceDrop = true;
    }

    if (
      enemy === $monster`Baa'baa'bu'ran` &&
      (itemAmount($item`stone wool`) === 0 || dropsFromYR > 0)
    ) {
      forceDrop = true;
    }
  }

  if (
    isActuallyEd() &&
    myLocation() === $location`The Secret Council Warehouse`
  ) {
    const progress: number = get("warehouseProgress");
    if (enemy === $monster`warehouse guard`) {
      const n_pages: number = itemAmount($item`warehouse map page`);
      const progress_with_pages: number = progress + n_pages * 8;
      if (progress_with_pages < 39) {
        // need 40 to "win", will get +1 for this combat
        forceDrop = true;
      }
    } else if (enemy === $monster`warehouse clerk`) {
      const n_pages: number = itemAmount($item`warehouse inventory page`);
      const progress_with_pages: number = progress + n_pages * 8;
      if (progress_with_pages < 39) {
        // need 40 to "win", will get +1 for this combat
        forceDrop = true;
      }
    }
  } // ed warehouse

  return forceDrop;
}

export function wantToDouse(enemy: Monster): boolean {
  switch (enemy) {
    case $monster`larval filthworm`:
      return itemAmount($item`filthworm hatchling scent gland`) === 0;
    case $monster`filthworm drone`:
      return itemAmount($item`filthworm drone scent gland`) === 0;
    case $monster`filthworm royal guard`:
      return itemAmount($item`filthworm royal guard scent gland`) === 0;
    case $monster`shadow slab`:
      return itemAmount($item`shadow brick`) < 13;
  }
  return false;
}

export function maxRoundsToDouse(enemy: Monster): number {
  let rounds: number = defaultRoundLimit() - 3;
  if (PayPhone.isShadowRiftMonster(enemy)) {
    // resist damage, take longer
    rounds -= 3;
  }
  if (myClass() === $class`Disco Bandit`) {
    // DBs take a while to kill b/c disco momentum and potentially low damage
    rounds -= 3;
  }
  // save a round for flyering if we're doing that.
  const flyer: Item =
    auto_warSide() === "hippy"
      ? $item`jam band flyers`
      : $item`rock band flyers`;
  if (canUse$3(flyer) && get("flyeredML") < 10000) {
    rounds -= 1;
  }
  // Or pants removal
  if (auto_canUse($skill`Tear Away your Pants!`)) {
    rounds -= 1;
  }
  if (auto_canUse($skill`Perpetrate Mild Evil`)) {
    // We'll be mild eviling any monsters we douse most likely
    rounds -= auto_remainingMildEvilUses();
  }
  if (auto_canUse($skill`Swoop like a Bat`)) {
    // swoopin' em too
    rounds -= 1;
  }
  if (auto_canUse($skill`Fire Extinguisher: Polar Vortex`)) {
    // and extingo
    rounds -= FireExtinguisher.fireExtinguisherCharges();
  }

  return rounds;
}

export function canSurviveShootGhost(enemy: Monster, shots: number): boolean {
  let damage: number;
  switch (enemy) {
    case $monster`the ghost of Oily McBindle`:
      damage = Math.trunc(
        (myMaxhp() * 0.4 * elementalResistance($element`sleaze`)) / 100,
      );
      break;
    case $monster`boneless blobghost`:
      damage = Math.trunc(
        (myMaxhp() * 0.45 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`the ghost of Monsieur Baguelle`:
      damage = Math.trunc(
        (myMaxhp() * 0.5 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`The Headless Horseman`:
      damage = Math.trunc(
        (myMaxhp() * 0.55 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The Icewoman`:
      damage = Math.trunc(
        (myMaxhp() * 0.6 * elementalResistance($element`cold`)) / 100,
      );
      break;
    case $monster`The ghost of Ebenoozer Screege`:
      damage = Math.trunc(
        (myMaxhp() * 0.65 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Lord Montague Spookyraven`:
      damage = Math.trunc(
        (myMaxhp() * 0.7 * elementalResistance($element`stench`)) / 100,
      );
      break;
    case $monster`The ghost of Vanillica "Trashblossom" Gorton`:
      damage = Math.trunc(
        (myMaxhp() * 0.75 * elementalResistance($element`stench`)) / 100,
      );
      break;
    case $monster`The ghost of Sam McGee`:
      damage = Math.trunc(
        (myMaxhp() * 0.8 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`The ghost of Richard Cockingham`:
      damage = Math.trunc(
        (myMaxhp() * 0.85 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Waldo the Carpathian`:
      damage = Math.trunc(
        (myMaxhp() * 0.9 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`Emily Koops, a spooky lime`:
      damage = Math.trunc(
        (myMaxhp() * 0.95 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Jim Unfortunato`:
      damage = Math.trunc(
        (myMaxhp() * elementalResistance($element`sleaze`)) / 100,
      );
      break;
    default:
      damage = Math.trunc(myMaxhp() * 0.3);
  }
  return myHp() > damage * shots;
}

function auto_remainingMildEvilUses(): number {
  if (!haveSkill($skill`Perpetrate Mild Evil`)) {
    return 0;
  }
  return 3 - get("_mildEvilPerpetrated");
}

export function auto_shouldHeartstoneStealInstead(): CombatMacroReturns {
  if (Heartstone.heartstoneShouldStealHeartInCombat()) {
    const word = get("heartstoneLetters");
    return {
      macro: $skill`Steal Monster's Heart`,
      tracker: {
        tracker: "otherStuff",
        event: lastMonster(),
        location: myLocation(),
        detail: `${$skill`Steal Monster's Heart`}: ${Heartstone.heartstoneCurrentWord()}[${heartstoneMiddleLetter(lastMonster())}]`,
      },
      shouldTrack: (page) => {
        if (word !== get("heartstoneLetters")) return true;

        bufferToFile(page, `failed_heartstone_${turnsPlayed()}.txt`);
        return false;
      },
    };
  }

  return undefined;
}

const tunedModifiers: Map<Modifier, Element> = new Map([
  [Modifier.get("All Spells Cast Are Hot"), $element`hot`],
  [Modifier.get("All Spells Cast Are Cold"), $element`cold`],
  [Modifier.get("All Spells Cast Are Stinky"), $element`stench`],
  [Modifier.get("All Spells Cast Are Spooky"), $element`spooky`],
  [Modifier.get("All Spells Cast Are Sleazy"), $element`sleaze`],
]);

function auto_tunedElement(includeEquips: boolean = true): Element | undefined {
  let tuned: Element | undefined = undefined;

  // Only one tuning is active, this goes by order of operations as per wiki
  for (const effect of getActiveEffects()) {
    for (const modifier of tunedModifiers.keys()) {
      if (!booleanModifier(effect, modifier)) continue;

      tuned = tunedModifiers.get(modifier);
    }
  }

  if (!includeEquips) return tuned;

  for (const slot of $slots`hat, weapon, off-hand, back, shirt, pants, acc1, acc2, acc3`) {
    const item = equippedItem(slot);

    if (item === $item.none) continue;

    for (const modifier of tunedModifiers.keys()) {
      if (!booleanModifier(item, modifier)) continue;

      tuned = tunedModifiers.get(modifier);
    }
  }

  return tuned;
}

function getMonsterResistance(
  monster: Monster,
  element: Element | "physical",
): number {
  switch (element) {
    case $element`hot`:
      return monster.hotResistance;
    case $element`cold`:
      return monster.coldResistance;
    case $element`sleaze`:
      return monster.sleazeResistance;
    case $element`spooky`:
      return monster.spookyResistance;
    case $element`stench`:
      return monster.stenchResistance;
    case "physical":
      return monster.physicalResistance;
    default:
      return -1;
  }
}

// Monsters resist ML * 0.4% of damage, capped at 50%. Negative ML is uncapped
// and instead amplifies damage, but only against monsters with no innate resistance.
function damageTaken(innateResistance: number): number {
  const fromML = Math.min(50, monsterLevelAdjustment() * 0.4);
  const resistance = innateResistance !== 0 ? innateResistance : fromML;

  return (100 - resistance) / 100;
}

export function auto_mortarShellCanKillEverything(place: Location): boolean {
  // Returns if mortar can naturally kill everything in the next zone
  const monsters: Monster[] = $locations`Noob Cave, none`.includes(place)
    ? [] // Don't show the above two in our calculations
    : auto_locationMonsters(place).map(([m]) => m);

  // If we know we're encountering something, use that
  if (get("auto_nextEncounter") !== $monster.none) {
    monsters.push(get("auto_nextEncounter"));
  }

  // We don't know, we should be cautious
  if (monsters.length === 0) {
    return false;
  }

  for (const monster of monsters) {
    if (
      monster.attributes.includes("Scale") || // It's a scaling, let's not predict it
      auto_estimatedStuffedMortarDamage(monster, false) <= monster.baseHp // It would probably survive
    ) {
      // No, the mortar will not kill the monster instantly.
      return false;
    }
  }

  // Yes, the mortar will kill all the monsters instantly.
  return true;
}

function getModifier(modifier: Modifier, includeEquips: boolean): number {
  let value = numericModifier(modifier);

  if (!includeEquips) {
    for (const item of getEquippedItems()) {
      value -= numericModifier(item, modifier);
    }
  }

  return value;
}

function getMysticality(includeEquips: boolean): number {
  if (includeEquips) return myBuffedstat($stat`Mysticality`);

  const base = myBasestat($stat`Mysticality`);
  const flat = getModifier($modifier`Mysticality`, includeEquips);
  const percent = getModifier($modifier`Mysticality Percent`, includeEquips);

  const mys = Math.max(1, base + flat + Math.floor((base * percent) / 100));

  if (numericModifier($modifier`Mysticality Limit`) > 0) {
    return Math.min(mys, numericModifier($modifier`Mysticality Limit`));
  }
  return mys;
}

const elementalWeaknesses: Map<Element, Element[]> = new Map([
  [$element`hot`, $elements`spooky, cold`],
  [$element`spooky`, $elements`cold, sleaze`],
  [$element`cold`, $elements`sleaze, stench`],
  [$element`sleaze`, $elements`stench, hot`],
  [$element`stench`, $elements`hot, spooky`],
]);

export function auto_estimatedStuffedMortarDamage(
  monster: Monster,
  includeEquipsInDamage: boolean = true,
): number {
  const size = Math.max(1, Math.min(3, monster.group));
  const baseDamage =
    32 +
    getMysticality(includeEquipsInDamage) / 2 +
    getModifier($modifier`Spell Damage`, includeEquipsInDamage) +
    getModifier($modifier`Sauce Spell Damage`, includeEquipsInDamage);
  const damagePercent = getModifier(
    $modifier`Spell Damage Percent`,
    includeEquipsInDamage,
  );
  const tunedElement = auto_tunedElement(includeEquipsInDamage);

  function getDamage(element: Element): number {
    if (element === monster.defenseElement) return 1;

    let damage =
      baseDamage +
      getModifier(
        Modifier.get(`${element} Spell Damage`),
        includeEquipsInDamage,
      );
    damage *= 1 + damagePercent / 100;
    damage *= size;
    if (elementalWeaknesses.get(element)?.includes(monster.defenseElement)) {
      damage *= 2;
    }
    damage *= damageTaken(
      Math.max(
        monster.elementalResistance,
        getMonsterResistance(monster, element),
      ),
    );

    return damage;
  }

  if (tunedElement) {
    return Math.max(1, getDamage(tunedElement));
  }

  // Otherwise just return the lowest of the possible damages
  // This is the physical
  let lowest = baseDamage * (1 + damagePercent / 100);
  lowest *= size;
  lowest *= damageTaken(monster.physicalResistance);

  for (const ele of $elements`hot, cold, stench, sleaze, spooky`) {
    lowest = Math.min(getDamage(ele), lowest);
  }

  return Math.max(1, lowest);
}
