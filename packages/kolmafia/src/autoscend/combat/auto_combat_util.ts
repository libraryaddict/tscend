import {
  availableAmount,
  canEquip,
  containsText,
  elementalResistance,
  equippedAmount,
  equippedItem,
  expectedDamage,
  fuelCost,
  getFuel,
  getProperty,
  haveEffect,
  haveEquipped,
  haveSkill,
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
  Monster,
  monsterHp,
  mpCost,
  myAudience,
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
  Phylum,
  rainCost,
  Skill,
  soulsauceCost,
  thunderCost,
  toBoolean,
  toFloat,
  toInt,
  trackedBy,
} from "kolmafia";
import {
  $class,
  $effect,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $skills,
  $slot,
  get,
  set,
} from "libram";

import { CombatMacroReturns } from "../auto_adventure";
import { auto_canDrink, inebriety_left, spleen_left } from "../auto_consume";
import { possessEquipment } from "../auto_equipment";
import {
  auto_famKill,
  auto_have_familiar,
  pathAllowsChangingFamiliar,
} from "../auto_familiar";
import {
  auto_banishesUsedAt,
  auto_can_equip,
  auto_have_skill,
  auto_is_valid,
  auto_is_valid$2,
  auto_log_info,
  auto_wantToBanish,
  auto_wantToBanish$1,
  handleTracker,
  hasShieldEquipped,
  hasTorso,
  isFreeMonster,
  loopHandlerDelayAll,
  wrap_item,
} from "../auto_util";
import {
  asdonCanMissile,
  auto_macrometeoritesAvailable,
} from "../iotms/mr2017";
import {
  auto_combatSaberBanish,
  auto_combatSaberYR,
  auto_reflexHammersRemaining,
  auto_saberChargesAvailable,
} from "../iotms/mr2019";
import {
  auto_hasRetrocape,
  auto_powerfulGloveReplacesAvailable,
} from "../iotms/mr2020";
import {
  auto_canFeelEnvy,
  auto_canFeelHatred,
  auto_fireExtinguisherCharges,
  can_get_battery,
} from "../iotms/mr2021";
import { auto_hasParka, getSweat } from "../iotms/mr2022";
import {
  auto_haveEagle,
  auto_isShadowRiftMonster,
  auto_monkeyPawWishesLeft,
  auto_neededShadowBricks,
} from "../iotms/mr2023";
import { auto_haveRoman } from "../iotms/mr2024";
import {
  auto_canNorthernExplosionFE,
  auto_McLargeHugeSniffsLeft,
  auto_throwLightningRemaining,
} from "../iotms/mr2025";
import { auto_getItemToEquipHeartstone } from "../iotms/mr2026";
import { isActuallyEd } from "../paths/actually_ed_the_undying";
import { in_avantGuard } from "../paths/avant_guard";
import { pete_peelOutRemaining } from "../paths/avatar_of_sneaky_pete";
import { inAftercore } from "../paths/casual";
import { in_glover } from "../paths/g_lover";
import { plumber_ppCost } from "../paths/path_of_the_plumber";
import { in_pokefam } from "../paths/pocket_familiars";
import { is_werewolf } from "../paths/wereprofessor";
import { in_wildfire } from "../paths/wildfire";
import {
  getZooKickBanish,
  getZooKickSniff,
  getZooKickYR,
  in_zootomist,
} from "../paths/zootomist";
import { hedgeTrimmersNeeded } from "../quests/level_09";
import { auto_warSide } from "../quests/level_12";
import { AshMatcher } from "../utils/kolmafiaUtils";
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
  return containsText(
    getProperty("_auto_combatState"),
    `(sk${toInt(sk).toString()})`,
  );
}

export function haveUsed$1(it: Item): boolean {
  return containsText(
    getProperty("_auto_combatState"),
    `(it${toInt(it).toString()})`,
  );
}

export function usedCount(sk: Skill): number {
  const m: AshMatcher = new AshMatcher(
    `(sk${toInt(sk).toString()})`,
    getProperty("_auto_combatState"),
  );
  let count_1: number = 0;
  while (m.find()) {
    ++count_1;
  }
  return count_1;
}

export function markAsUsed(sk: Skill): void {
  set(
    "_auto_combatState",
    `${getProperty("_auto_combatState")}(sk${toInt(sk).toString()})`,
  );
}

export function markAsUsed$1(it: Item): void {
  if (it !== Item.none) {
    set(
      "_auto_combatState",
      `${getProperty("_auto_combatState")}(it${toInt(it).toString()})`,
    );
  }
}

let $_canUse_exclusives: Map<number, $_canUse_SkillSet> | undefined;

export function auto_canUse(
  sk: Skill,
  onlyOnce: boolean = true, // assume onlyOnce unless specified otherwise
  inCombat: boolean = true, //assume we are in combat unless specified otherwise
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

export function isSniffed(enemy: Monster, sk: Skill): boolean {
  let search: string;
  if (sk === $skill`Get a Good Whiff of This Guy`) {
    search = "Nosy Nose";
  } else {
    search = sk.toString();
  }
  const tracked: string[] = trackedBy(enemy);
  for (const n of tracked.keys()) {
    if ((tracked[n] ??= "") === search) {
      return true;
    }
  }
  return false;
}

export function isSniffed$1(enemy: Monster): boolean {
  //checks if the monster enemy is currently sniffed using any of the sniff skills
  for (const sk of $skills`Transcendent Olfaction, Make Friends, Long Con, Perceive Soul, Gallapagosian Mating Call, Monkey Point, Offer Latte to Opponent, Motif, Hunt, McHugeLarge Slash, Left %n Kick, Right %n Kick, Meat Cute`) {
    if (isSniffed(enemy, sk)) {
      return true;
    }
  }
  //nosyNoseMonster is conditional on familiar [Nosy Nose], should it ever return true for this general check?
  return false;
}

export function getSniffer(enemy: Monster, inCombat: boolean = true): Skill {
  //returns the skill we want to use to sniff the enemy
  //sniffers are skills that increase the odds of encountering this same monster again in the current zone.
  if (
    auto_canUse($skill`Transcendent Olfaction`, true, inCombat) &&
    get("_olfactionsUsed") < 3 &&
    !isSniffed(enemy, $skill`Transcendent Olfaction`)
  ) {
    return $skill`Transcendent Olfaction`;
  }
  if (
    auto_canUse($skill`Make Friends`, true, inCombat) &&
    myAudience() >= 20 &&
    !isSniffed(enemy, $skill`Make Friends`)
  ) {
    return $skill`Make Friends`; //avatar of sneaky pete specific skill
  }
  if (
    auto_canUse($skill`Hunt`, true, inCombat) &&
    haveEffect($effect`Everything Looks Red`) === 0 &&
    !isSniffed(enemy, $skill`Hunt`)
  ) {
    return $skill`Hunt`; //WereProfessor Werewolf specific skill
  }
  if (
    auto_canUse($skill`Meat Cute`, true, inCombat) &&
    get("_meatCuteUsed") < 5 &&
    !isSniffed(enemy, $skill`Meat Cute`)
  ) {
    return $skill`Meat Cute`; //Meat Golem specific skill
  }
  if (
    auto_canUse($skill`Long Con`, true, inCombat) &&
    get("_longConUsed") < 5 &&
    !isSniffed(enemy, $skill`Long Con`)
  ) {
    return $skill`Long Con`;
  }
  if (
    auto_canUse($skill`Perceive Soul`, true, inCombat) &&
    !isSniffed(enemy, $skill`Perceive Soul`)
  ) {
    return $skill`Perceive Soul`;
  }
  if (
    auto_canUse($skill`Motif`, true, inCombat) &&
    !isSniffed(enemy, $skill`Motif`) &&
    haveEffect($effect`Everything Looks Blue`) === 0
  ) {
    return $skill`Motif`;
  }
  if (inCombat) {
    if (
      auto_canUse($skill`Monkey Point`, true, inCombat) &&
      !isSniffed(enemy, $skill`Monkey Point`)
    ) {
      return $skill`Monkey Point`;
    }
    if (
      auto_canUse($skill`McHugeLarge Slash`, true, inCombat) &&
      !isSniffed(enemy, $skill`McHugeLarge Slash`) &&
      auto_McLargeHugeSniffsLeft() > 0
    ) {
      return $skill`McHugeLarge Slash`;
    }
  } else {
    if (
      auto_monkeyPawWishesLeft() === 1 &&
      !isSniffed(enemy, $skill`Monkey Point`)
    ) {
      return $skill`Monkey Point`;
    }
    if (
      possessEquipment($item`McHugeLarge left pole`) &&
      !isSniffed(enemy, $skill`McHugeLarge Slash`) &&
      auto_McLargeHugeSniffsLeft() > 0
    ) {
      return $skill`McHugeLarge Slash`;
    }
  }
  if (
    auto_canUse($skill`Gallapagosian Mating Call`, true, inCombat) &&
    !isSniffed(enemy, $skill`Gallapagosian Mating Call`)
  ) {
    return $skill`Gallapagosian Mating Call`;
  }
  if (
    myFamiliar() === $familiar`Nosy Nose` &&
    auto_canUse($skill`Get a Good Whiff of This Guy`) &&
    !isSniffed(enemy, $skill`Get a Good Whiff of This Guy`)
  ) {
    return $skill`Get a Good Whiff of This Guy`;
  }
  if (
    auto_canUse($skill`Offer Latte to Opponent`, true, inCombat) &&
    !get("_latteCopyUsed") &&
    !isSniffed(enemy, $skill`Offer Latte to Opponent`)
  ) {
    return $skill`Offer Latte to Opponent`;
  }
  // Zootomist kicks. We might have to move this depending on what happens with cooldowns
  const z_kick: Skill = getZooKickSniff();
  if (auto_canUse(z_kick)) {
    return z_kick;
  }

  return Skill.none;
}

export function getCopier(enemy: Monster, inCombat: boolean = true): Skill {
  if (
    (auto_haveRoman() && haveEffect($effect`Everything Looks Purple`) === 0) ||
    (haveEquipped($item`Roman Candelabra`) &&
      auto_canUse($skill`Blow the Purple Candle!`, true, inCombat) &&
      haveEffect($effect`Everything Looks Purple`) === 0)
  ) {
    return $skill`Blow the Purple Candle!`;
  }
  if (
    auto_haveEagle() &&
    auto_canUse(
      $skill`%fn, fire a Red, White and Blue Blast`,
      true,
      inCombat,
    ) &&
    !(haveEffect($effect`Everything Looks Red, White and Blue`) > 0) &&
    enemy.copyable
  ) {
    return $skill`%fn, fire a Red, White and Blue Blast`;
  }
  return Skill.none;
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
    (getSweat() > 98 ||
      containsText(getProperty("_auto_combatState"), "last attempt"))
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

  return Skill.none;
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
  damage *= toInt(mult);
  damage += add_1;
  return damage < myHp();
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
      what: enemy,
      detail: banishAction.toString(),
      property: "auto_banishes",
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
  inCombat: boolean = false,
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
    getProperty("peteMotorbikeMuffler") === "Extra-Smelly Muffler" &&
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
    if (
      !containsText(
        getProperty("banishedMonsters"),
        "Spring-Loaded Front Bumper",
      )
    ) {
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
      : possessEquipment(auto_getItemToEquipHeartstone())) &&
    auto_is_valid$2($skill`Heartstone: %banish`) &&
    get("_heartstoneBanishUsed") < 5 &&
    haveEquipped(auto_getItemToEquipHeartstone()) &&
    !used.includes("Heartstone %banish")
  ) {
    return $skill`Heartstone: %banish`;
  }
  if (
    inCombat
      ? auto_have_skill($skill`Reflex Hammer`)
      : auto_reflexHammersRemaining() > 0 &&
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
    auto_canFeelHatred() &&
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
    auto_saberChargesAvailable() > 0 &&
    !used.includes("Saber Force")
  ) {
    // can't use the force on uncopyable monsters
    if (enemy === Monster.none || enemy.copyable) {
      return auto_combatSaberBanish();
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
      getProperty("sidequestJunkyardCompleted") !== "none" &&
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
    (inCombat
      ? auto_have_skill($skill`Sea *dent: Throw a Lightning Bolt`)
      : possessEquipment($item`Monodent of the Sea`)) &&
    auto_throwLightningRemaining() > 0 &&
    !used.includes("Sea *dent: Throw a Lightning Bolt")
  ) {
    return $skill`Sea *dent: Throw a Lightning Bolt`;
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
    get("_beancannonUses", 0) < 5 &&
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
  if (getProperty("sidequestJunkyardCompleted") !== "none") {
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

export function yellowRayCombatString(
  target: Monster,
  inCombat: boolean,
  noForceDrop: boolean,
): CombatMacroReturns {
  if (in_wildfire() && inCombat && myLocation().fireLevel > 2) {
    //high fire level burns yellow ray items. except for saber's [use the force] as it leads to a noncombat
    //we only want special handling if fire level is high. otherwise we can proceed to yellowray as per normal
    if (
      haveEquipped(wrap_item($item`Fourth of May Cosplay Saber`)) &&
      auto_saberChargesAvailable() > 0
    ) {
      // can't use the force on uncopyable monsters
      if (target === Monster.none || (target.copyable && !noForceDrop)) {
        return auto_combatSaberYR();
      }
    } else {
      return undefined;
    }
  }

  if (in_zootomist() && haveEffect($effect`Everything Looks Yellow`) <= 0) {
    const kick: Skill = getZooKickYR();
    if (kick !== Skill.none) {
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
        : auto_hasParka() &&
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
        : auto_haveRoman() &&
          auto_can_equip($item`Roman Candelabra`) &&
          auto_is_valid$2($skill`Blow the Yellow Candle!`)
    ) {
      return $skill`Blow the Yellow Candle!`; //75 Turns
    }
    if (
      inCombat
        ? haveSkill($skill`Unleash the Devil's Kiss`)
        : auto_hasRetrocape() &&
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
      getProperty("peteMotorbikeHeadlight") === "Ultrabright Yellow Bulb" &&
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
      getProperty("shrubGifts") === "yellow"
    ) {
      return $skill`Open a Big Yellow Present`; // 149 turns
    }
  }

  if (asdonCanMissile()) {
    return $skill`Asdon Martin: Missile Launcher`;
  }

  if (auto_canNorthernExplosionFE()) {
    //With April Shower Thoughts Shield
    return $skill`Northern Explosion`;
  }

  if (auto_canFeelEnvy()) {
    return $skill`Feel Envy`;
  }

  const saber: Item = wrap_item($item`Fourth of May Cosplay Saber`);
  if (
    (inCombat ? haveEquipped(saber) : possessEquipment(saber)) &&
    auto_saberChargesAvailable() > 0
  ) {
    // can't use the force on uncopyable monsters
    if (target === Monster.none || (target.copyable && !noForceDrop)) {
      return auto_combatSaberYR();
    }
  }
  // shocking lick doesn't cause everything looks yellow effect and limited only by how many batteries you have. Use all other sources first.
  if (
    inCombat
      ? haveSkill($skill`Shocking Lick`)
      : get("shockingLickCharges") > 0 ||
        can_get_battery($item`battery (9-Volt)`)
  ) {
    return $skill`Shocking Lick`;
  }

  return undefined;
}

export function yellowRayCombatString$1(
  target: Monster,
  inCombat: boolean,
): CombatMacroReturns {
  return yellowRayCombatString(target, inCombat, false);
}

export function replaceMonsterCombatString(
  target: Monster,
  inCombat: boolean = false,
): CombatMacroReturns {
  if (in_pokefam()) {
    return undefined;
  }
  if (
    auto_macrometeoritesAvailable() > 0 &&
    auto_is_valid$2($skill`Macrometeorite`)
  ) {
    return $skill`Macrometeorite`;
  }
  if (
    auto_powerfulGloveReplacesAvailable(inCombat) > 0 &&
    auto_is_valid$2($skill`CHEAT CODE: Replace Enemy`)
  ) {
    return $skill`CHEAT CODE: Replace Enemy`;
  }
  if (
    (inCombat
      ? haveSkill($skill`Exercise Liquidity`)
      : get("auto_exerciseLiquidity", 0) > 0) &&
    auto_is_valid$2($skill`Exercise Liquidity`)
  ) {
    // Mafia doesn't track remaining Exercise Liquidity charges yet, so we track them
    // ourselves: auto_chewLiquidAsset() increments this, and we decrement it here the
    // moment we commit to casting it. Remove once mafia adds official tracking.
    if (inCombat) {
      set(
        "auto_exerciseLiquidity",
        Math.max(0, get("auto_exerciseLiquidity", 0) - 1),
      );
    }
    return $skill`Exercise Liquidity`;
  }
  if (canUse$3($item`waffle`) && !in_avantGuard()) {
    return useItem($item`waffle`);
  }
  return undefined;
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
  | "unstoppable";

export function combat_status_check(mark: CombatStatusType): boolean {
  return containsText(getProperty("_auto_combatState"), mark);
}

export function combat_status_add(mark: CombatStatusType): void {
  let st: string = getProperty("_auto_combatState");
  if (!combat_status_check(mark)) {
    st = `${st}(${mark})`;
  }
  set("_auto_combatState", st);
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
  if (!combat_status_check("yellowray")) {
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
    auto_fireExtinguisherCharges() > 20 ||
    mildEvilAvailable ||
    swoopAvailable
  ) {
    let dropsFromYR: number = 0;
    if (combat_status_check("yellowray")) {
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
      auto_neededShadowBricks() + dropsFromYR > 0
    ) {
      forceDrop = true;
    }

    if (
      enemy === $monster`Baa'baa'bu'ran` &&
      (itemAmount($item`stone wool`) === 0 || toBoolean(dropsFromYR))
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
  if (auto_isShadowRiftMonster(enemy)) {
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
    rounds -= auto_fireExtinguisherCharges();
  }

  return rounds;
}

export function canSurviveShootGhost(enemy: Monster, shots: number): boolean {
  let damage: number;
  switch (enemy) {
    case $monster`the ghost of Oily McBindle`:
      damage = toInt(
        (myMaxhp() * 0.4 * elementalResistance($element`sleaze`)) / 100,
      );
      break;
    case $monster`boneless blobghost`:
      damage = toInt(
        (myMaxhp() * 0.45 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`the ghost of Monsieur Baguelle`:
      damage = toInt(
        (myMaxhp() * 0.5 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`The Headless Horseman`:
      damage = toInt(
        (myMaxhp() * 0.55 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The Icewoman`:
      damage = toInt(
        (myMaxhp() * 0.6 * elementalResistance($element`cold`)) / 100,
      );
      break;
    case $monster`The ghost of Ebenoozer Screege`:
      damage = toInt(
        (myMaxhp() * 0.65 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Lord Montague Spookyraven`:
      damage = toInt(
        (myMaxhp() * 0.7 * elementalResistance($element`stench`)) / 100,
      );
      break;
    case $monster`The ghost of Vanillica "Trashblossom" Gorton`:
      damage = toInt(
        (myMaxhp() * 0.75 * elementalResistance($element`stench`)) / 100,
      );
      break;
    case $monster`The ghost of Sam McGee`:
      damage = toInt(
        (myMaxhp() * 0.8 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`The ghost of Richard Cockingham`:
      damage = toInt(
        (myMaxhp() * 0.85 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Waldo the Carpathian`:
      damage = toInt(
        (myMaxhp() * 0.9 * elementalResistance($element`hot`)) / 100,
      );
      break;
    case $monster`Emily Koops, a spooky lime`:
      damage = toInt(
        (myMaxhp() * 0.95 * elementalResistance($element`spooky`)) / 100,
      );
      break;
    case $monster`The ghost of Jim Unfortunato`:
      damage = toInt((myMaxhp() * elementalResistance($element`sleaze`)) / 100);
      break;
    default:
      damage = toInt(myMaxhp() * 0.3);
  }
  return myHp() > damage * shots;
}

function auto_remainingMildEvilUses(): number {
  if (!haveSkill($skill`Perpetrate Mild Evil`)) {
    return 0;
  }
  return 3 - get("_mildEvilPerpetrated");
}
