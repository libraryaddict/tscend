import {
  abort,
  advCost,
  canEquip,
  canInteract,
  chew,
  cliExecute,
  creatableAmount,
  creatableTurns,
  create,
  Effect,
  equippedAmount,
  getProperty,
  haveEffect,
  historicalPrice,
  hpCost,
  isUnrestricted,
  Item,
  itemAmount,
  lightningCost,
  Location,
  meatCost,
  mpCost,
  myAdventures,
  myClass,
  myHp,
  myLightning,
  myLocation,
  myMeat,
  myMp,
  myRain,
  mySoulsauce,
  myThunder,
  npcPrice,
  rainCost,
  setLocation,
  setProperty,
  Skill,
  Slot,
  soulsauceCost,
  thunderCost,
  toBoolean,
  toSkill,
  toSlot,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $skill,
} from "libram";

import { acquireTotem, auto_buyUpTo } from "./auto_acquire";
import { autoAdv$2 } from "./auto_adventure";
import { isSpleenConsumable } from "./auto_consume";
import {
  auto_loadEquipped,
  auto_saveEquipped,
  autoForceEquip,
  possessEquipment,
} from "./auto_equipment";
import { auto_have_familiar, pathHasFamiliar } from "./auto_familiar";
import { uneffect } from "./auto_restore";
import {
  auto_have_skill,
  auto_is_valid,
  auto_log_debug,
  auto_log_debug$1,
  auto_log_warning$1,
  handleTracker,
  handleTracker$1,
  meatReserve,
  shrugAT,
} from "./auto_util";
import {
  auto_birdCanSeek,
  auto_favoriteBirdCanSeek,
  auto_powerfulGloveCharges,
  auto_powerfulGloveNoncombat,
  auto_powerfulGloveStats,
} from "./iotms/mr2020";
import { auto_haveEmotionChipSkills } from "./iotms/mr2021";
import {
  auto_availableBrickRift,
  auto_haveIdolMicrophone,
} from "./iotms/mr2023";
import {
  auto_equipAprilShieldBuff,
  auto_getItemToEquipBCZ,
  auto_haveBCZ,
  auto_unequipAprilShieldBuff,
} from "./iotms/mr2025";
import { ARBSupplyDrop, auto_canARBSupplyDrop } from "./iotms/ttt";
import { in_bhy } from "./paths/bees_hate_you";
import { inAftercore } from "./paths/casual";
import { glover_usable$1 } from "./paths/g_lover";
import { in_heavyrains } from "./paths/heavy_rains";
import { in_tcrs } from "./paths/two_crazy_random_summer";
import { in_wotsf } from "./paths/way_of_the_surprising_fist";

//Defined in autoscend/auto_buff.ash
function buffMaintain(
  source: Skill,
  buff: Effect,
  mustEquip: Item,
  mp_min: number,
  casts: number,
  turns: number,
  speculative: boolean,
): boolean {
  if (!glover_usable$1(buff)) {
    return false;
  }

  if (!auto_have_skill(source) || haveEffect(buff) >= turns) {
    return false;
  }

  if (myMp() < mp_min || myMp() < casts * mpCost(source)) {
    return false;
  }
  if (myHp() <= casts * hpCost(source)) {
    return false;
  }
  if (myAdventures() < casts * advCost(source)) {
    return false;
  }
  if (myLightning() < casts * lightningCost(source)) {
    return false;
  }
  if (myRain() < casts * rainCost(source)) {
    return false;
  }
  if (mySoulsauce() < casts * soulsauceCost(source)) {
    return false;
  }
  if (myThunder() < casts * thunderCost(source)) {
    return false;
  }
  if (myMeat() < casts * meatCost(source)) {
    return false;
  }
  //handling for buffs that must equip something first
  let equip_changed: boolean = false;
  const equipped: Map<number, Item> = auto_saveEquipped();
  const equip_slot: Slot = toSlot(mustEquip);
  if (mustEquip !== Item.none) {
    if (
      !possessEquipment(mustEquip) ||
      !auto_is_valid(
        //we can not wear what we do not have. this checks both inventory and already worn
        mustEquip,
      ) ||
      !canEquip(
        //checks path limitations
        mustEquip,
      )
    ) {
      //checks if stats are high enough
      return false; //we can not wear this equipment
    }
    if (!speculative) {
      //wear it now before using the buff.
      autoForceEquip(equip_slot, mustEquip, true);
      if (equippedAmount(mustEquip) === 0) {
        auto_log_warning$1(
          `buffMaintain failed to equip [${mustEquip}] for some reason. which is necessary in order to apply [${buff}] using the skill [${source}].`,
        );
        return false;
      }
      equip_changed = true;
    }
  }
  if (!speculative) {
    useSkill(casts, source);
  }

  if (equip_changed) {
    auto_loadEquipped(equipped); //return equipment to how it was originally
  }
  return true;
}

function buffMaintain$1(
  source: Item,
  buff: Effect,
  uses: number,
  turns: number,
  speculative: boolean,
): boolean {
  if (in_tcrs()) {
    auto_log_debug(`We want to use ${source} but are in 2CRS.`, "blue");
    return false;
  }

  if (!glover_usable$1(buff)) {
    return false;
  }
  if (!auto_is_valid(source)) {
    return false;
  }

  if (haveEffect(buff) >= turns) {
    return false;
  }
  if (itemAmount(source) < uses && !in_wotsf()) {
    const numToBuy: number = uses - itemAmount(source);
    const meatAvailableToBuy: number = myMeat() - meatReserve();
    // attempt to buy from NPC for meat
    if (npcPrice(source) !== 0 && meatAvailableToBuy > npcPrice(source)) {
      if (!speculative) {
        auto_buyUpTo(numToBuy, source);
      } else {
        //if speculating, assume buy works
        return true;
      }
    } else if (
      canInteract() &&
      historicalPrice(
        // attempt to buy in mall
        source,
      ) !== 0 &&
      meatAvailableToBuy > historicalPrice(source)
    ) {
      if (!speculative) {
        auto_buyUpTo(numToBuy, source);
      } else {
        //if speculating, assume buy works
        return true;
      }
    }
  }
  // Craft if we have free crafts and it's craftable
  if (itemAmount(source) < uses) {
    const needed: number = uses - itemAmount(source);
    const n_can_craft: number = creatableAmount(source);
    const turns_to_craft: number = creatableTurns(source, needed, true);
    if (turns_to_craft === 0 && n_can_craft >= needed) {
      handleTracker$1(
        "buffMaintain",
        `${speculative ? "Speculatively c" : "C"}rafting ${needed.toString()} ${source.toString()}`,
        "auto_otherstuff",
      );
      if (!speculative) {
        create(source, needed);
      } else {
        return true;
      }
    }
  }
  if (itemAmount(source) < uses) {
    return false;
  }
  if (!speculative) {
    if (isSpleenConsumable(source)) {
      chew(uses, source);
      handleTracker$1(
        source.toString(),
        myLocation().toString(),
        "auto_chewed",
      );
    } else {
      use(uses, source);
    }
  }
  return true;
}

export function buffMaintain$2(
  buff: Effect,
  mp_min: number,
  casts: number,
  turns: number,
  speculative: boolean,
): boolean {
  let useSkill_1: Skill = Skill.none;
  let useItem_1: Item = Item.none;
  let mustEquip: Item = Item.none;

  if (buff === Effect.none) {
    return false;
  }

  if (haveEffect(buff) >= turns) {
    return false;
  }

  let ret: boolean = false;
  switch (buff) {
    case $effect`A Few Extra Pounds`:
      //Jalapeno Saucesphere
      useSkill_1 = $skill`Holiday Weight Gain`;
      break;
    case $effect`A Little Bit Poisoned`:
      useSkill_1 = $skill`Disco Nap`;
      break;
    case $effect`Acting Jerky`:
      useSkill_1 = $skill`Act Jerky`;
      break;
    case $effect`Adorable Lookout`:
      useItem_1 = $item`giraffe-necked turtle`;
      break;
    case $effect`Alacri Tea`:
      useItem_1 = $item`cuppa Alacri tea`;
      break;
    case $effect`All Fired Up`:
      useItem_1 = $item`ant agonist`;
      break;
    case $effect`All Glory To the Toad`:
      useItem_1 = $item`colorful toad`;
      break;
    case $effect`All Revved Up`:
      useSkill_1 = $skill`Rev Engine`;
      break;
    case $effect`Almost Cool`:
      useItem_1 = $item`mostly-broken sunglasses`;
      break;
    case $effect`Aloysius' Antiphon of Aptitude`:
      useSkill_1 = $skill`Aloysius' Antiphon of Aptitude`;
      break;
    case $effect`Amazing`:
      useItem_1 = $item`pocket maze`;
      break;
    case $effect`Angry`:
      useSkill_1 = $skill`Anger Glands`;
      break;
    case $effect`Angry like the Wolf`:
      if (
        auto_have_familiar($familiar`Grim Brother`) &&
        !toBoolean(getProperty("_grimBuff"))
      ) {
        if (speculative) {
          return true;
        }
        visitUrl("choice.php?pwd&whichchoice=835&option=2", true);
        ret = true;
      }
      break;
    case $effect`Antibiotic Saucesphere`:
      useSkill_1 = $skill`Antibiotic Saucesphere`;
      break;
    case $effect`Arched Eyebrow of the Archmage`:
      useSkill_1 = $skill`Arched Eyebrow of the Archmage`;
      break;
    case $effect`Armor-Plated`:
      useItem_1 = $item`bent scrap metal`;
      break;
    case $effect`Ashen`:
      useItem_1 = $item`pile of ashes`;
      break;
    case $effect`Ashen Burps`:
      useItem_1 = $item`ash soda`;
      break;
    case $effect`Astral Shell`:
      if (auto_have_skill($skill`Astral Shell`) && acquireTotem()) {
        useSkill_1 = $skill`Astral Shell`;
      }
      break;
    case $effect`Attracting Snakes`:
      useSkill_1 = $skill`Attract Snakes`;
      break;
    case $effect`Attractive to Fire Ants`:
      useItem_1 = $item`fire ant pheromones`;
      break;
    case $effect`Aware of Bees`:
      if (!toBoolean(getProperty("_aug19Cast"))) {
        useSkill_1 = $skill`Aug. 19th: Honey Bee Awareness Day!`;
      }
      break;
    case $effect`Baconstoned`:
      if (itemAmount($item`vial of baconstone juice`) > 0) {
        useItem_1 = $item`vial of baconstone juice`;
      } else if (itemAmount($item`flask of baconstone juice`) > 0) {
        useItem_1 = $item`flask of baconstone juice`;
      } else {
        useItem_1 = $item`jug of baconstone juice`;
      }
      break;
    case $effect`Baited Hook`:
      useItem_1 = $item`wriggling worm`;
      break;
    case $effect`Balls of Ectoplasm`:
      useItem_1 = $item`ectoplasmic orbs`;
      break;
    case $effect`Bandersnatched`:
      useItem_1 = $item`tonic o' Banderas`;
      break;
    case $effect`Barbecue Saucy`:
      useItem_1 = $item`dollop of barbecue sauce`;
      break;
    case $effect`Be a Mind Master`:
      useItem_1 = $item`Daily Affirmation: Be a Mind Master`;
      break;
    case $effect`A Beastly Odor`:
      useItem_1 = $item`The Beast Within™ candle`;
      break;
    case $effect`Become Superficially interested`:
      useItem_1 = $item`Daily Affirmation: Be Superficially interested`;
      break;
    case $effect`Beef Goggles`:
      useSkill_1 = $skill`Beef Goggles`;
      break;
    case $effect`Bendin' Hell`:
      useSkill_1 = $skill`Bend Hell`;
      break;
    case $effect`Bent Knees`:
      useSkill_1 = $skill`Bendable Knees`;
      break;
    case $effect`Benetton's Medley of Diversity`:
      useSkill_1 = $skill`Benetton's Medley of Diversity`;
      break;
    case $effect`Berry Elemental`:
      useItem_1 = $item`Tapioc berry`;
      break;
    case $effect`Berry Statistical`:
      useItem_1 = $item`Snarf berry`;
      break;
    case $effect`Best Pals`:
      useSkill_1 = $skill`Heartstone: %pals`;
      break;
    case $effect`Bet Your Autumn Dollar`:
      useItem_1 = $item`autumn dollar`;
      break;
    case $effect`Big`:
      useSkill_1 = $skill`Get Big`;
      break;
    case $effect`Big Meat Big Prizes`:
      useItem_1 = $item`Meat-inflating powder`;
      break;
    case $effect`Biologically Shocked`:
      useItem_1 = $item`glowing syringe`;
      break;
    case $effect`Bitterskin`:
      useItem_1 = $item`bitter pill`;
      break;
    case $effect`Black Eyes`:
      useItem_1 = $item`black eye shadow`;
      break;
    case $effect`Black Tongue`:
      useItem_1 = $item`black snowcone`;
      break;
    case $effect`Blackberry Politeness`:
      useItem_1 = $item`blackberry polite`;
      break;
    case $effect`Blessing of Serqet`:
      useSkill_1 = $skill`Blessing of Serqet`;
      break;
    case $effect`Blessing of the Bird`:
      if (auto_birdCanSeek()) {
        useSkill_1 = $skill`Seek out a Bird`;
      }
      break;
    case $effect`Blessing of your favorite Bird`:
      if (auto_favoriteBirdCanSeek()) {
        useSkill_1 = $skill`Visit your Favorite Bird`;
      }
      break;
    case $effect`Blinking Belly`:
      useSkill_1 = $skill`Firefly Abdomen`;
      break;
    case $effect`Blood-Gorged`:
      useItem_1 = $item`vial of blood simple syrup`;
      break;
    case $effect`Blood Bond`:
      useSkill_1 = $skill`Blood Bond`;
      break;
    case $effect`Blood Bubble`:
      useSkill_1 = $skill`Blood Bubble`;
      break;
    case $effect`Bloodbathed`:
      if (auto_haveBCZ()) {
        mustEquip = auto_getItemToEquipBCZ();
        useSkill_1 = $skill`BCZ: Blood Bath`;
      }
      break;
    case $effect`Bloody Potato Bits`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Bloodstain-Resistant`:
      useItem_1 = $item`bloodstain stick`;
      break;
    case $effect`Blooper Inked`:
      useItem_1 = $item`blooper ink`;
      break;
    case $effect`Blubbered Up`:
      useSkill_1 = $skill`Blubber Up`;
      break;
    case $effect`Blue Swayed`:
      useItem_1 = $item`pulled blue taffy`;
      break;
    case $effect`Blue Tongue`:
      useItem_1 = $item`blue snowcone`;
      break;
    case $effect`Bone Springs`:
      useSkill_1 = $skill`Bone Springs`;
      break;
    case $effect`Boner Battalion`:
      useSkill_1 = $skill`Summon "Boner Battalion"`;
      break;
    case $effect`Boon of She-Who-Was`:
      useSkill_1 = $skill`Spirit Boon`;
      break;
    case $effect`Boon of the Storm Tortoise`:
      useSkill_1 = $skill`Spirit Boon`;
      break;
    case $effect`Boon of the War Snapper`:
      useSkill_1 = $skill`Spirit Boon`;
      break;
    case $effect`Bounty of Renenutet`:
      useSkill_1 = $skill`Bounty of Renenutet`;
      break;
    case $effect`Bow-Legged Swagger`:
      useSkill_1 = $skill`Bow-Legged Swagger`;
      break;
    case $effect`Bram's Bloody Bagatelle`:
      useSkill_1 = $skill`Bram's Bloody Bagatelle`;
      break;
    case $effect`Brawnee's Anthem of Absorption`:
      useSkill_1 = $skill`Brawnee's Anthem of Absorption`;
      break;
    case $effect`Brilliant Resolve`:
      useItem_1 = $item`resolution: be smarter`;
      break;
    case $effect`Brittled`:
      useItem_1 = $item`pea brittle`;
      break;
    case $effect`Brooding`:
      useSkill_1 = $skill`Brood`;
      break;
    case $effect`Browbeaten`:
      useItem_1 = $item`old eyebrow pencil`;
      break;
    case $effect`Burning Hands`:
      useItem_1 = $item`sticky lava globs`;
      break;
    case $effect`Busy Bein' Delicious`:
      useItem_1 = $item`Crimbo fudge`;
      break;
    case $effect`Butt-Rock Hair`:
      useItem_1 = $item`hair spray`;
      break;
    case $effect`Can't Smell Nothin'`:
      useItem_1 = $item`Dogsgotnonoz pills`;
      break;
    case $effect`Candied Devil`:
      useItem_1 = $item`deviled candy egg`;
      break;
    case $effect`Car-Charged`:
      useItem_1 = $item`battery (car)`;
      break;
    case $effect`Carlweather's Cantata of Confrontation`:
      useSkill_1 = $skill`Carlweather's Cantata of Confrontation`;
      break;
    case $effect`Carol of the Bulls`:
      useSkill_1 = $skill`Carol of the Bulls`;
      break;
    case $effect`Carol of the Hells`:
      useSkill_1 = $skill`Carol of the Hells`;
      break;
    case $effect`Carol of the Thrills`:
      useSkill_1 = $skill`Carol of the Thrills`;
      break;
    case $effect`Cautious Prowl`:
      useSkill_1 = $skill`Walk: Cautious Prowl`;
      break;
    case $effect`Ceaseless Snarling`:
      useSkill_1 = $skill`Ceaseless Snarl`;
      break;
    case $effect`Celestial Camouflage`:
      useItem_1 = $item`celestial squid ink`;
      break;
    case $effect`Celestial Saltiness`:
      useItem_1 = $item`celestial au jus`;
      break;
    case $effect`Celestial Sheen`:
      useItem_1 = $item`celestial olive oil`;
      break;
    case $effect`Celestial Vision`:
      useItem_1 = $item`celestial carrot juice`;
      break;
    case $effect`Cheddarmored`:
      useSkill_1 = $skill`Cheddarmor`;
      break;
    case $effect`Cheerled`:
      useSkill_1 = $skill`Cheerlead`;
      break;
    case $effect`Cinnamon Challenger`:
      useItem_1 = $item`pulled red taffy`;
      break;
    case $effect`Clear Ears, Can't Lose`:
      useItem_1 = $item`ear candle`;
      break;
    case $effect`Cletus's Canticle of Celerity`:
      useSkill_1 = $skill`Cletus's Canticle of Celerity`;
      break;
    case $effect`Cloak of Shadows`:
      useSkill_1 = $skill`Blood Cloak`;
      break;
    case $effect`Cloud of Mosquitos`:
      if (!toBoolean(getProperty("_aug20Cast"))) {
        useSkill_1 = $skill`Aug. 20th: Mosquito Day!`;
      }
      break;
    case $effect`Clyde's Blessing`:
      useItem_1 = $item`The Legendary Beat`;
      break;
    case $effect`Chalky Hand`:
      useItem_1 = $item`handful of hand chalk`;
      break;
    case $effect`Chocolatesphere`:
      useSkill_1 = $skill`Chocolatesphere`;
      break;
    case $effect`Chow Downed`:
      useSkill_1 = $skill`Zombie Chow`;
      break;
    case $effect`Cranberry Cordiality`:
      useItem_1 = $item`cranberry cordial`;
      break;
    case $effect`Coffeesphere`:
      useSkill_1 = $skill`Coffeesphere`;
      break;
    case $effect`Cold Hard Skin`:
      useItem_1 = $item`frost-rimed seal hide`;
      break;
    case $effect`Confidence of the Votive`:
      useItem_1 = $item`votive of confidence`;
      break;
    case $effect`Contemptible Emanations`:
      useItem_1 = $item`cologne of contempt`;
      break;
    case $effect`Covered in the Rainbow`:
      useItem_1 = $item`rainbow glitter candle`;
      break;
    case $effect`The Cupcake of Wrath`:
      useItem_1 = $item`green-frosted astral cupcake`;
      break;
    case $effect`Curiosity of Br'er Tarrypin`:
      if (
        pathHasFamiliar() &&
        auto_have_skill($skill`Curiosity of Br'er Tarrypin`) &&
        acquireTotem()
      ) {
        useSkill_1 = $skill`Curiosity of Br'er Tarrypin`;
      }
      break;
    case $effect`Crunching Leaves`:
      useItem_1 = $item`autumn leaf`;
      break;
    case $effect`Crunchy Steps`:
      useItem_1 = $item`crunchy brush`;
      break;
    case $effect`Cyber Resist x2000`:
      useItem_1 = $item`Synapse Blaster`;
      break;
    case $effect`Dance of the Sugar Fairy`:
      useItem_1 = $item`sugar fairy`;
      break;
    case $effect`Darkened Meat`:
      useSkill_1 = $skill`Dark Meat`;
      break;
    case $effect`Destructive Resolve`:
      useItem_1 = $item`resolution: be feistier`;
      break;
    case $effect`Dexteri Tea`:
      useItem_1 = $item`cuppa Dexteri tea`;
      break;
    case $effect`Digitally Converted`:
      useItem_1 = $item`digital underground potion`;
      break;
    case $effect`The Dinsey Look`:
      useItem_1 = $item`Dinsey face paint`;
      break;
    case $effect`Dirge of Dreadfulness`:
      useSkill_1 = $skill`Dirge of Dreadfulness`;
      break;
    case $effect`Dirge of Dreadfulness (Remastered)`:
      mustEquip = $item`velour vaqueros`;
      useSkill_1 = $skill`Dirge of Dreadfulness`;
      break;
    case $effect`Disco Fever`:
      useSkill_1 = $skill`Disco Fever`;
      break;
    case $effect`Disco Leer`:
      useSkill_1 = $skill`Disco Leer`;
      break;
    case $effect`Disco over Matter`:
      if (auto_have_skill($skill`Disco Aerobics`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Disco Aerobics`;
      }
      break;
    case $effect`Disco Smirk`:
      useSkill_1 = $skill`Disco Smirk`;
      break;
    case $effect`Disco State of Mind`:
      useSkill_1 = $skill`Disco Aerobics`;
      break;
    case $effect`Disdain of She-Who-Was`:
      useSkill_1 = $skill`Blessing of She-Who-Was`;
      break;
    case $effect`Disdain of the Storm Tortoise`:
      useSkill_1 = $skill`Blessing of the Storm Tortoise`;
      break;
    case $effect`Disdain of the War Snapper`:
      useSkill_1 = $skill`Blessing of the War Snapper`;
      break;
    case $effect`Disquiet Riot`:
      useSkill_1 = $skill`Disquiet Riot`;
      break;
    case $effect`Drenched With Filth`:
      useItem_1 = $item`concentrated garbage juice`;
      break;
    case $effect`Drescher's Annoying Noise`:
      useSkill_1 = $skill`Drescher's Annoying Noise`;
      break;
    case $effect`Drunk and Avuncular`:
      useItem_1 = $item`Drunk Uncles holo-record`;
      break;
    case $effect`Eagle Eyes`:
      useItem_1 = $item`eagle feather`;
      break;
    case $effect`Ear Winds`:
      useSkill_1 = $skill`Flappy Ears`;
      break;
    case $effect`Earning Interest`:
      useItem_1 = $item`savings bond`;
      break;
    case $effect`Eau D'enmity`:
      useItem_1 = $item`perfume of prejudice`;
      break;
    case $effect`Eau de Tortue`:
      useItem_1 = $item`turtle pheromones`;
      break;
    case $effect`Egged On`:
      useItem_1 = $item`robin's egg`;
      break;
    case $effect`El Aroma de Salsa`:
      useItem_1 = $item`Salsa Caliente™ candle`;
      break;
    case $effect`Eldritch Alignment`:
      useItem_1 = $item`eldritch alignment spray`;
      break;
    case $effect`Elemental Saucesphere`:
      useSkill_1 = $skill`Elemental Saucesphere`;
      break;
    case $effect`Ellipsoidtined`:
      if (auto_canARBSupplyDrop()) {
        if (speculative) {
          return true;
        }
        ARBSupplyDrop("ellipsoidtine");
        ret = true;
      }
      break;
    case $effect`Empathy`:
      if (
        pathHasFamiliar() &&
        auto_have_skill($skill`Empathy of the Newt`) &&
        acquireTotem() &&
        auto_unequipAprilShieldBuff()
      ) {
        useSkill_1 = $skill`Empathy of the Newt`;
      }
      break;
    case $effect`Erudite`:
      useItem_1 = $item`black sheepskin diploma`;
      break;
    case $effect`Ew, The Humanity`:
      useItem_1 = $item`Scent of a Human™ candle`;
      break;
    case $effect`Expert Oiliness`:
      useItem_1 = $item`oil of expertise`;
      break;
    case $effect`Experimental Effect G-9`:
      useItem_1 = $item`experimental serum G-9`;
      break;
    case $effect`Extended Toes`:
      useSkill_1 = $skill`Retractable Toes`;
      break;
    case $effect`Extra Backbone`:
      useItem_1 = $item`really thick spine`;
      break;
    case $effect`Extra-Green`:
      useItem_1 = $item`glob of extra-green chlorophyll`;
      break;
    case $effect`Extreme Muscle Relaxation`:
      useItem_1 = $item`Mick's IcyVapoHotness Rub`;
      break;
    case $effect`Everything Is Bananas`:
      useItem_1 = $item`banana candle`;
      break;
    case $effect`Everything Must Go!`:
      useItem_1 = $item`violent pastilles`;
      break;
    case $effect`Eyes All Black`:
      useItem_1 = $item`delicious candy`;
      break;
    case $effect`Faboooo`:
      useItem_1 = $item`Fabiotion`;
      break;
    case $effect`Far Out`:
      useItem_1 = $item`patchouli incense stick`;
      break;
    case $effect`Fat Leon's Phat Loot Lyric`:
      useSkill_1 = $skill`Fat Leon's Phat Loot Lyric`;
      break;
    case $effect`Feeling Fancy`:
      useItem_1 = $item`roasted vegetable focaccia`;
      break;
    case $effect`Feeling Lonely`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Feeling Excited`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Feeling Nervous`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Feeling Peaceful`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Feeling Punchy`:
      useItem_1 = $item`Punching Potion`;
      break;
    case $effect`Feeling Sneaky`:
      useItem_1 = $item`trampled ticket stub`;
      break;
    case $effect`Feroci Tea`:
      useItem_1 = $item`cuppa Feroci tea`;
      break;
    case $effect`Fever From the Flavor`:
      useItem_1 = $item`bottle of antifreeze`;
      break;
    case $effect`Fireproof Lips`:
      useItem_1 = $item`SPF 451 lip balm`;
      break;
    case $effect`Fire Inside`:
      useItem_1 = $item`hot coal`;
      break;
    case $effect`Fishy, Oily`:
      if (in_heavyrains()) {
        useItem_1 = $item`gourmet gourami oil`;
      }
      break;
    case $effect`Fishy Fortification`:
      useItem_1 = $item`fish-liver oil`;
      break;
    case $effect`Fishy Whiskers`:
      if (in_heavyrains()) {
        useItem_1 = $item`catfish whiskers`;
      }
      break;
    case $effect`Five Sticky Fingers`:
      useItem_1 = $item`five-fingered fern resin`;
      break;
    case $effect`Flame-Retardant Trousers`:
      useItem_1 = $item`hot powder`;
      break;
    case $effect`Flaming Weapon`:
      useItem_1 = $item`hot nuggets`;
      break;
    case $effect`Flamibili Tea`:
      useItem_1 = $item`cuppa Flamibili tea`;
      break;
    case $effect`Flapper Dancin'`:
      useItem_1 = $item`flapper fly`;
      break;
    case $effect`Flexibili Tea`:
      useItem_1 = $item`cuppa Flexibili tea`;
      break;
    case $effect`Flimsy Shield of the Pastalord`:
      useSkill_1 = $skill`Shield of the Pastalord`;
      if (myClass() === $class`Pastamancer`) {
        buff = $effect`Shield of the Pastalord`;
      }
      break;
    case $effect`Float Like a Butterfly, Smell Like a Bee`:
      if (in_bhy()) {
        useItem_1 = $item`honeypot`;
      }
      break;
    case $effect`Florid Cheeks`:
      useItem_1 = $item`henna face paint`;
      break;
    case $effect`Football Eyes`:
      useItem_1 = $item`black facepaint`;
      break;
    case $effect`Fortunate Resolve`:
      useItem_1 = $item`resolution: be luckier`;
      break;
    case $effect`Frenzied, Bloody`:
      useSkill_1 = $skill`Blood Frenzy`;
      break;
    case $effect`Fresh Breath`:
      if (!toBoolean(getProperty("_aug6Cast"))) {
        useSkill_1 = $skill`Aug. 6th: Fresh Breath Day!`;
      }
      break;
    case $effect`Fresh Scent`:
      useItem_1 = $item`deodorant`;
      break;
    case $effect`Frigidalmatian`:
      useSkill_1 = $skill`Frigidalmatian`;
      break;
    case $effect`Frog In Your Throat`:
      useItem_1 = $item`Frogade`;
      break;
    case $effect`From Nantucket`:
      useItem_1 = $item`Ye Olde Bawdy Limerick`;
      break;
    case $effect`Frost Tea`:
      useItem_1 = $item`cuppa Frost tea`;
      break;
    case $effect`Frostbeard`:
      useSkill_1 = $skill`Beardfreeze`;
      break;
    case $effect`Frosty`:
      useItem_1 = $item`frost flower`;
      break;
    case $effect`Frown`:
      useSkill_1 = $skill`Frown Muscles`;
      break;
    case $effect`Funky Coal Patina`:
      useItem_1 = $item`coal dust`;
      break;
    case $effect`Gaffe Free`:
      useItem_1 = $item`gaffer's tape`;
      break;
    case $effect`Gelded`:
      useItem_1 = $item`chocolate filthy lucre`;
      break;
    case $effect`Ghostly Shell`:
      if (auto_have_skill($skill`Ghostly Shell`) && acquireTotem()) {
        useSkill_1 = $skill`Ghostly Shell`;
      }
      break;
    case $effect`The Glistening`:
      useItem_1 = $item`vial of The Glistening`;
      break;
    case $effect`Glittering Eyelashes`:
      useItem_1 = $item`glittery mascara`;
      break;
    case $effect`Glowing Hands`:
      useItem_1 = $item`emergency glowstick`;
      break;
    case $effect`Go Get 'Em, Tiger!`:
      useItem_1 = $item`Ben-Gal™ Balm`;
      break;
    case $effect`Good Things Are Coming, You Can Smell It`:
      useItem_1 = $item`Smoldering Clover™ candle`;
      break;
    case $effect`Got Milk`:
      useItem_1 = $item`milk of magnesium`;
      break;
    case $effect`Gothy`:
      useItem_1 = $item`spooky eyeliner`;
      break;
    case $effect`Gr8ness`:
      useItem_1 = $item`potion of temporary gr8ness`;
      break;
    case $effect`Graham Crackling`:
      useItem_1 = $item`heather graham cracker`;
      break;
    case $effect`Greasy Peasy`:
      useItem_1 = $item`robot grease`;
      break;
    case $effect`Greedy Resolve`:
      useItem_1 = $item`resolution: be wealthier`;
      break;
    case $effect`Green Tongue`:
      useItem_1 = $item`green snowcone`;
      break;
    case $effect`Gristlesphere`:
      useSkill_1 = $skill`Gristlesphere`;
      break;
    case $effect`Gritty`:
      useItem_1 = $item`pile of gritty sand`;
      break;
    case $effect`Grumpy and Ornery`:
      if (
        auto_have_familiar($familiar`Grim Brother`) &&
        !toBoolean(getProperty("_grimBuff"))
      ) {
        if (speculative) {
          return true;
        }
        visitUrl("choice.php?pwd&whichchoice=835&option=3", true);
        ret = true;
      }
      break;
    case $effect`Gummed Shoes`:
      useItem_1 = $item`shoe gum`;
      break;
    case $effect`Gummi-Grin`:
      useItem_1 = $item`gummi turtle`;
      break;
    case $effect`Hairy Palms`:
      useItem_1 = $item`orcish hand lotion`;
      break;
    case $effect`Ham-Fisted`:
      useItem_1 = $item`vial of hamethyst juice`;
      break;
    case $effect`Hamming It Up`:
      useSkill_1 = $skill`Ham It Up`;
      break;
    case $effect`Hardened Fabric`:
      useItem_1 = $item`fabric hardener`;
      break;
    case $effect`Hardened Sweatshirt`:
      useSkill_1 = $skill`Magic Sweat`;
      break;
    case $effect`Hardly Poisoned at All`:
      useSkill_1 = $skill`Disco Nap`;
      break;
    case $effect`Healthy Blue Glow`:
      useItem_1 = $item`gold star`;
      break;
    case $effect`Hear Me Roar`:
      if (!toBoolean(getProperty("_aug10Cast"))) {
        useSkill_1 = $skill`Aug. 10th: World Lion Day!`;
      }
      break;
    case $effect`Heightened Senses`:
      useItem_1 = $item`airborne mutagen`;
      break;
    case $effect`Heart of Green`:
      useItem_1 = $item`green candy heart`;
      break;
    case $effect`Heart of Lavender`:
      useItem_1 = $item`lavender candy heart`;
      break;
    case $effect`Heart of Orange`:
      useItem_1 = $item`orange candy heart`;
      break;
    case $effect`Heart of Pink`:
      useItem_1 = $item`pink candy heart`;
      break;
    case $effect`Heart of White`:
      useItem_1 = $item`white candy heart`;
      break;
    case $effect`Heart of Yellow`:
      useItem_1 = $item`yellow candy heart`;
      break;
    case $effect`Hide of Sobek`:
      useSkill_1 = $skill`Hide of Sobek`;
      break;
    case $effect`Hiding From Seekers`:
      useSkill_1 = $skill`Hide From Seekers`;
      break;
    case $effect`High Colognic`:
      useItem_1 = $item`musk turtle`;
      break;
    case $effect`Hippy Antimilitarism`:
      useItem_1 = $item`mini kiwi antimilitaristic hippy petition`;
      break;
    case $effect`Hippy Stench`:
      useItem_1 = $item`reodorant`;
      break;
    case $effect`Hot Hands`:
      useItem_1 = $item`lotion of hotness`;
      break;
    case $effect`How to Scam Tourists`:
      useItem_1 = $item`How to Avoid Scams`;
      break;
    case $effect`Human-Beast Hybrid`:
      useItem_1 = $item`Gene Tonic: Beast`;
      break;
    case $effect`Human-Constellation Hybrid`:
      useItem_1 = $item`Gene Tonic: Constellation`;
      break;
    case $effect`Human-Demon Hybrid`:
      useItem_1 = $item`Gene Tonic: Demon`;
      break;
    case $effect`Human-Elemental Hybrid`:
      useItem_1 = $item`Gene Tonic: Elemental`;
      break;
    case $effect`Human-Fish Hybrid`:
      useItem_1 = $item`Gene Tonic: Fish`;
      break;
    case $effect`Human-Human Hybrid`:
      useItem_1 = $item`Gene Tonic: Dude`;
      break;
    case $effect`Human-Humanoid Hybrid`:
      useItem_1 = $item`Gene Tonic: Humanoid`;
      break;
    case $effect`Human-Insect Hybrid`:
      useItem_1 = $item`Gene Tonic: Insect`;
      break;
    case $effect`Human-Machine Hybrid`:
      useItem_1 = $item`Gene Tonic: Construct`;
      break;
    case $effect`Human-Mer-kin Hybrid`:
      useItem_1 = $item`Gene Tonic: Mer-kin`;
      break;
    case $effect`Human-Pirate Hybrid`:
      useItem_1 = $item`Gene Tonic: Pirate`;
      break;
    case $effect`Hyperoffended`:
      useItem_1 = $item`donkey flipbook`;
      break;
    case $effect`Hyphemariffic`:
      useItem_1 = $item`black eyedrops`;
      break;
    case $effect`Icy Glare`:
      useSkill_1 = $skill`Icy Glare`;
      break;
    case $effect`Impeccable Coiffure`:
      useSkill_1 = $skill`Self-Combing Hair`;
      break;
    case $effect`Imported Strength`:
      useItem_1 = $item`imported taffy`;
      break;
    case $effect`Inigo's Incantation of Inspiration`:
      useSkill_1 = $skill`Inigo's Incantation of Inspiration`;
      break;
    case $effect`Incredibly Healthy`:
      useItem_1 = $item`mini kiwi illicit antibiotic`;
      break;
    case $effect`Incredibly Hulking`:
      useItem_1 = $item`Ferrigno's Elixir of Power`;
      break;
    case $effect`Incredibly Well Lit`:
      if (!toBoolean(getProperty("_aug7Cast"))) {
        useSkill_1 = $skill`Aug. 7th: Lighthouse Day!`;
      }
      break;
    case $effect`Industrial Strength Starch`:
      useItem_1 = $item`industrial strength starch`;
      break;
    case $effect`Ink Cloud`:
      useSkill_1 = $skill`Ink Gland`;
      break;
    case $effect`Inked Well`:
      useSkill_1 = $skill`Squid Glands`;
      break;
    case $effect`Inky Camouflage`:
      useItem_1 = $item`vial of squid ink`;
      break;
    case $effect`Inscrutable Gaze`:
      useSkill_1 = $skill`Inscrutable Gaze`;
      break;
    case $effect`Insulated Trousers`:
      useItem_1 = $item`cold powder`;
      break;
    case $effect`Intimidating Mien`:
      useSkill_1 = $skill`Intimidating Mien`;
      break;
    case $effect`Invisible Avatar`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Irresistible Resolve`:
      useItem_1 = $item`resolution: be sexier`;
      break;
    case $effect`Jackasses' Symphony of Destruction`:
      useSkill_1 = $skill`Jackasses' Symphony of Destruction`;
      break;
    case $effect`Jalapeño Saucesphere`:
      useSkill_1 = $skill`Jalapeño Saucesphere`;
      break;
    case $effect`Jingle Jangle Jingle`:
      if (auto_have_skill($skill`Jingle Bells`) && acquireTotem()) {
        useSkill_1 = $skill`Jingle Bells`;
      }
      break;
    case $effect`Joyful Resolve`:
      useItem_1 = $item`resolution: be happier`;
      break;
    case $effect`Juiced and Jacked`:
      useItem_1 = $item`pumpkin juice`;
      break;
    case $effect`Juiced and Loose`:
      useSkill_1 = $skill`Steroid Bladder`;
      break;
    case $effect`Leash of Linguini`:
      if (pathHasFamiliar()) {
        auto_equipAprilShieldBuff(); //+5 turns when April Shower Thoughts Shield is equipped
        useSkill_1 = $skill`Leash of Linguini`;
      }
      break;
    case $effect`Leisurely Amblin'`:
      useSkill_1 = $skill`Walk: Leisurely Amble`;
      break;
    case $effect`Lion in Ambush`:
      useItem_1 = $item`lion musk`;
      break;
    case $effect`Liquidy Smoky`:
      useItem_1 = $item`liquid smoke`;
      break;
    case $effect`Lit Up`:
      useItem_1 = $item`bottle of lighter fluid`;
      break;
    case $effect`Litterbug`:
      useItem_1 = $item`old candy wrapper`;
      break;
    case $effect`Living Fast`:
      useSkill_1 = $skill`Live Fast`;
      break;
    case $effect`Locks Like the Raven`:
      useItem_1 = $item`Black No. 2`;
      break;
    case $effect`Loded`:
      useItem_1 = $item`lodestone`;
      break;
    case $effect`Lost Stomach`:
      if (!toBoolean(getProperty("_aug16Cast"))) {
        useSkill_1 = $skill`Aug. 16th: Roller Coaster Day!`;
      }
      break;
    case $effect`Loyal as a Rock`:
      useItem_1 = $item`lump of loyal latite`;
      break;
    case $effect`Loyal Tea`:
      useItem_1 = $item`cuppa Loyal tea`;
      break;
    case $effect`Lubricating Sauce`:
      if (auto_have_skill($skill`Sauce Contemplation`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Sauce Contemplation`;
      }
      break;
    case $effect`Lucky Struck`:
      useItem_1 = $item`Lucky Strikes holo-record`;
      break;
    case $effect`Lycanthropy, Eh?`:
      useItem_1 = $item`weremoose spit`;
      break;
    case $effect`Keep Free Hate in your Heart`:
      useItem_1 = $item`Daily Affirmation: Keep Free Hate in your Heart`;
      break;
    case $effect`Kindly Resolve`:
      useItem_1 = $item`resolution: be kinder`;
      break;
    case $effect`Knob Goblin Perfume`:
      useItem_1 = $item`Knob Goblin perfume`;
      break;
    case $effect`Knowing Smile`:
      useSkill_1 = $skill`Knowing Smile`;
      break;
    case $effect`Macaroni Coating`:
      useSkill_1 = Skill.none;
      break;
    case $effect`The Magic of LOV`:
      useItem_1 = $item`LOV Elixir #6`;
      break;
    case $effect`The Magical Mojomuscular Melody`:
      useSkill_1 = $skill`The Magical Mojomuscular Melody`;
      break;
    case $effect`Magnetized Ears`:
      useSkill_1 = $skill`Magnetic Ears`;
      break;
    case $effect`Majorly Poisoned`:
      useSkill_1 = $skill`Disco Nap`;
      break;
    case $effect`Manbait`:
      useItem_1 = $item`the most dangerous bait`;
      break;
    case $effect`Mariachi Moisture`:
      if (auto_have_skill($skill`Moxie of the Mariachi`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Moxie of the Mariachi`;
      }
      break;
    case $effect`Mariachi Mood`:
      useSkill_1 = $skill`Moxie of the Mariachi`;
      break;
    case $effect`Marinated`:
      useItem_1 = $item`bowl of marinade`;
      break;
    case $effect`Materiel Intel`:
      if (auto_canARBSupplyDrop()) {
        if (speculative) {
          return true;
        }
        ARBSupplyDrop("materiel intel");
        ret = true;
      }
      break;
    case $effect`Mathematically Precise`:
      if (isUnrestricted($item`Crimbot ROM: Mathematical Precision`)) {
        useSkill_1 = $skill`Mathematical Precision`;
      }
      break;
    case $effect`Mayeaugh`:
      useItem_1 = $item`glob of spoiled mayo`;
      break;
    case $effect`Meat Puppet`:
      useSkill_1 = $skill`Meat Puppet`;
      break;
    case $effect`Memories of Puppy Love`:
      useItem_1 = $item`old love note`;
      break;
    case $effect`Merry Smithsness`:
      useItem_1 = $item`Flaskfull of Hollow`;
      break;
    case $effect`Milk of Familiar Cruelty`:
      useSkill_1 = $skill`Drink The Milk of %n Cruelty`;
      break;
    case $effect`Milk of Familiar Kindness`:
      useSkill_1 = $skill`Drink The Milk of %n Kindness`;
      break;
    case $effect`Mind Vision`:
      useSkill_1 = $skill`Intracranial Eye`;
      break;
    case $effect`Ministrations in the Dark`:
      useItem_1 = $item`EMD holo-record`;
      break;
    case $effect`Minor Invulnerability`:
      useItem_1 = $item`scroll of minor invulnerability`;
      break;
    case $effect`Misplaced Rage`:
      useItem_1 = $item`angry agate`;
      break;
    case $effect`The Moxie of LOV`:
      useItem_1 = $item`LOV Elixir #9`;
      break;
    case $effect`The Moxious Madrigal`:
      useSkill_1 = $skill`The Moxious Madrigal`;
      break;
    case $effect`Muffled`:
      if (getProperty("peteMotorbikeMuffler") === "Extra-Quiet Muffler") {
        useSkill_1 = $skill`Rev Engine`;
      }
      break;
    case $effect`Musk of the Moose`:
      useSkill_1 = $skill`Musk of the Moose`;
      break;
    case $effect`Musky`:
      useItem_1 = $item`lynyrd musk`;
      break;
    case $effect`Mutated`:
      useItem_1 = $item`gremlin mutagen`;
      break;
    case $effect`Mysteriously Handsome`:
      useItem_1 = $item`handsomeness potion`;
      break;
    case $effect`Mystically Oiled`:
      useItem_1 = $item`ointment of the occult`;
      break;
    case $effect`Nearly All-Natural`:
      useItem_1 = $item`bag of grain`;
      break;
    case $effect`Nearly Silent Hunting`:
      useSkill_1 = $skill`Silent Hunter`;
      break;
    case $effect`Neuroplastici Tea`:
      useItem_1 = $item`cuppa Neuroplastici tea`;
      break;
    case $effect`Neutered Nostrils`:
      useItem_1 = $item`Polysniff Perfume`;
      break;
    case $effect`Newt Gets In Your Eyes`:
      useItem_1 = $item`eyedrops of newt`;
      break;
    case $effect`Nigh-Invincible`:
      useItem_1 = $item`pixel star`;
      break;
    case $effect`Notably Lovely`:
      useItem_1 = $item`confiscated love note`;
      break;
    case $effect`Obscuri Tea`:
      useItem_1 = $item`cuppa Obscuri tea`;
      break;
    case $effect`Ode to Booze`:
      shrugAT($effect`Ode to Booze`);
      useSkill_1 = $skill`The Ode to Booze`;
      break;
    case $effect`The Odour of Magick`:
      useItem_1 = $item`natural magick candle`;
      break;
    case $effect`Of Course It Looks Great`:
      useSkill_1 = $skill`Check Hair`;
      break;
    case $effect`Oiled Skin`:
      useItem_1 = $item`skin oil`;
      break;
    case $effect`Oiled-Up`:
      useItem_1 = $item`pec oil`;
      break;
    case $effect`Oilsphere`:
      useSkill_1 = $skill`Oilsphere`;
      break;
    case $effect`Offhand Remarkable`:
      if (!toBoolean(getProperty("_aug13Cast"))) {
        useSkill_1 = Skill.get("Aug. 13th: Left/Off Hander's Day!");
      }
      break;
    case $effect`OMG WTF`:
      useItem_1 = $item`confiscated cell phone`;
      break;
    case $effect`One Very Clear Eye`:
      useItem_1 = $item`cyclops eyedrops`;
      break;
    case $effect`Only Dogs Love a Drunken Sailor`:
      useSkill_1 = $skill`Only Dogs Love a Drunken Sailor`;
      break;
    case $effect`Orange Crusher`:
      useItem_1 = $item`pulled orange taffy`;
      break;
    case $effect`Orange Tongue`:
      useItem_1 = $item`orange snowcone`;
      break;
    case $effect`Paging Betty`:
      useItem_1 = $item`Bettie page`;
      break;
    case $effect`Pasta Eyeball`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Pasta Oneness`:
      useSkill_1 = $skill`Manicotti Meditation`;
      break;
    case $effect`Patent Aggression`:
      useItem_1 = $item`patent aggression tonic`;
      break;
    case $effect`Patent Alacrity`:
      useItem_1 = $item`patent alacrity tonic`;
      break;
    case $effect`Patent Avarice`:
      useItem_1 = $item`patent avarice tonic`;
      break;
    case $effect`Patent Invisibility`:
      useItem_1 = $item`patent invisibility tonic`;
      break;
    case $effect`Patent Prevention`:
      useItem_1 = $item`patent preventative tonic`;
      break;
    case $effect`Patent Sallowness`:
      useItem_1 = $item`patent sallowness tonic`;
      break;
    case $effect`Patience of the Tortoise`:
      useSkill_1 = $skill`Patience of the Tortoise`;
      break;
    case $effect`Patient Smile`:
      useSkill_1 = $skill`Patient Smile`;
      break;
    case $effect`Paul's Passionate Pop Song`:
      useSkill_1 = $skill`Paul's Passionate Pop Song`;
      break;
    case $effect`Penne Fedora`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Peppermint Bite`:
      useItem_1 = $item`Crimbo peppermint bark`;
      break;
    case $effect`Peppermint Twisted`:
      useItem_1 = $item`peppermint twist`;
      break;
    case $effect`Perceptive Pressure`:
      useItem_1 = $item`pressurized potion of perception`;
      break;
    case $effect`Perspicacious Pressure`:
      useItem_1 = $item`pressurized potion of perspicacity`;
      break;
    case $effect`Phorcefullness`:
      useItem_1 = $item`philter of phorce`;
      break;
    case $effect`Physicali Tea`:
      useItem_1 = $item`cuppa Physicali tea`;
      break;
    case $effect`Pill Power`:
      if (itemAmount($item`miniature power pill`) > 0) {
        useItem_1 = $item`miniature power pill`;
      } else {
        useItem_1 = $item`power pill`;
      }
      break;
    case $effect`Pill Party!`:
      useItem_1 = $item`pill cup`;
      break;
    case $effect`Pisces in the Skyces`:
      useItem_1 = $item`tobiko marble soda`;
      break;
    case $effect`Psalm of Pointiness`:
      shrugAT($effect`Psalm of Pointiness`);
      useSkill_1 = $skill`The Psalm of Pointiness`;
      break;
    case $effect`Prayer of Seshat`:
      useSkill_1 = $skill`Prayer of Seshat`;
      break;
    case $effect`Pride of the Puffin`:
      useSkill_1 = $skill`Pride of the Puffin`;
      break;
    case $effect`Polar Express`:
      useItem_1 = $item`Cloaca Cola Polar`;
      break;
    case $effect`Polka of Plenty`:
      useSkill_1 = $skill`The Polka of Plenty`;
      break;
    case $effect`Polonoia`:
      useItem_1 = $item`polo trophy`;
      break;
    case $effect`Poppy Performance`:
      if (auto_haveIdolMicrophone()) {
        if (speculative) {
          return true;
        }
        cliExecute("loathingidol pop");
        ret = true;
      }
      break;
    case $effect`Power, Man`:
      useItem_1 = $item`Power-Guy 2000 holo-record`;
      break;
    case $effect`Power Ballad of the Arrowsmith`:
      useSkill_1 = $skill`The Power Ballad of the Arrowsmith`;
      break;
    case $effect`Power of Heka`:
      useSkill_1 = $skill`Power of Heka`;
      break;
    case $effect`The Power of LOV`:
      useItem_1 = $item`LOV Elixir #3`;
      break;
    case $effect`Prideful Strut`:
      useSkill_1 = $skill`Walk: Prideful Strut`;
      break;
    case $effect`Predjudicetidigitation`:
      useItem_1 = $item`worst candy`;
      break;
    case $effect`Protection from Bad Stuff`:
      useItem_1 = $item`scroll of Protection from Bad Stuff`;
      break;
    case $effect`Provocative Perkiness`:
      useItem_1 = $item`libation of liveliness`;
      break;
    case $effect`Puddingskin`:
      useItem_1 = $item`scroll of Puddingskin`;
      break;
    case $effect`Pulchritudinous Pressure`:
      useItem_1 = $item`pressurized potion of pulchritude`;
      break;
    case $effect`Punchable Face`:
      useSkill_1 = $skill`Extremely Punchable Face`;
      break;
    case $effect`Purity of Spirit`:
      useItem_1 = $item`cold-filtered water`;
      break;
    case $effect`Purr of the Feline`:
      useSkill_1 = $skill`Purr of the Feline`;
      break;
    case $effect`Purple Reign`:
      useItem_1 = $item`pulled violet taffy`;
      break;
    case $effect`Purple Tongue`:
      useItem_1 = $item`purple snowcone`;
      break;
    case $effect`Puzzle Fury`:
      useItem_1 = $item`37x37x37 puzzle cube`;
      break;
    case $effect`Pyrite Pride`:
      useItem_1 = $item`pebble of proud pyrite`;
      break;
    case $effect`Pyromania`:
      useSkill_1 = $skill`Pyromania`;
      break;
    case $effect`Queso Fustulento`:
      useSkill_1 = $skill`Queso Fustulento`;
      break;
    case $effect`Quiet Desperation`:
      useSkill_1 = $skill`Quiet Desperation`;
      break;
    case $effect`Quiet Determination`:
      useSkill_1 = $skill`Quiet Determination`;
      break;
    case $effect`Quiet Judgement`:
      useSkill_1 = $skill`Quiet Judgement`;
      break;
    case $effect`'Roids of the Rhinoceros`:
      useItem_1 = $item`bottle of rhinoceros hormones`;
      break;
    case $effect`Rad-Pro Tected`:
      useItem_1 = $item`Rad-Pro (1 oz.)`;
      break;
    case $effect`Radiating Black Body™`:
      useItem_1 = $item`Black Body™ spray`;
      break;
    case $effect`Rage of the Reindeer`:
      useSkill_1 = $skill`Rage of the Reindeer`;
      break;
    case $effect`Rainy Soul Miasma`:
      if (itemAmount($item`thin black candle`) > 0) {
        useItem_1 = $item`thin black candle`;
      } else if (itemAmount($item`Drizzlers™ Black Licorice`) > 0) {
        useItem_1 = $item`Drizzlers™ Black Licorice`;
      }
      break;
    case $effect`Ready to Snap`:
      useItem_1 = $item`ginger snaps`;
      break;
    case $effect`Really Quite Poisoned`:
      useSkill_1 = $skill`Disco Nap`;
      break;
    case $effect`Record Hunger`:
      useItem_1 = $item`The Pigs holo-record`;
      break;
    case $effect`Red Lettered`:
      useItem_1 = $item`red letter`;
      break;
    case $effect`Red Door Syndrome`:
      useItem_1 = $item`can of black paint`;
      break;
    case $effect`Red Tongue`:
      useItem_1 = $item`red snowcone`;
      break;
    case $effect`Reliable Backup`:
      useSkill_1 = $skill`Call For Backup`;
      break;
    case $effect`Reptilian Fortitude`:
      if (auto_have_skill($skill`Reptilian Fortitude`) && acquireTotem()) {
        useSkill_1 = $skill`Reptilian Fortitude`;
      }
      break;
    case $effect`Romantically Roused`:
      if (auto_haveIdolMicrophone()) {
        if (speculative) {
          return true;
        }
        cliExecute("loathingidol ballad");
        ret = true;
      }
      break;
    case $effect`A Rose by Any Other Material`:
      useItem_1 = $item`squeaky toy rose`;
      break;
    case $effect`Rosewater Mark`:
      useItem_1 = $item`old rosewater cream`;
      break;
    case $effect`Rotten Memories`:
      useSkill_1 = $skill`Rotten Memories`;
      break;
    case $effect`Ruthlessly Efficient`:
      if (isUnrestricted($item`Crimbot ROM: Ruthless Efficiency`)) {
        useSkill_1 = $skill`Ruthless Efficiency`;
      }
      break;
    case $effect`Salamander In Your Stomach`:
      useItem_1 = $item`salamander slurry`;
      break;
    case $effect`Saucemastery`:
      useSkill_1 = $skill`Sauce Contemplation`;
      break;
    case $effect`Sauce Monocle`:
      useSkill_1 = $skill`Sauce Monocle`;
      break;
    case $effect`Savage Beast Inside`:
      useItem_1 = $item`jar of "Creole Lady" marrrmalade`;
      break;
    case $effect`Scariersauce`:
      mustEquip = $item`velour viscometer`;
      useSkill_1 = $skill`Scarysauce`;
      break;
    case $effect`Scarysauce`:
      useSkill_1 = $skill`Scarysauce`;
      break;
    case $effect`Scavengers Scavenging`:
      useSkill_1 = $skill`Scavenge`;
      break;
    case $effect`Scowl of the Auk`:
      useSkill_1 = $skill`Scowl of the Auk`;
      break;
    case $effect`Scorched Earth`:
      useItem_1 = $item`Napalm In The Morning™ candle`;
      break;
    case $effect`Screaming!  SCREAMING!  AAAAAAAH!`:
      useSkill_1 = $skill`Powerful Vocal Chords`;
      break;
    case $effect`Seal Clubbing Frenzy`:
      useSkill_1 = $skill`Seal Clubbing Frenzy`;
      break;
    case $effect`Sealed Brain`:
      useItem_1 = $item`seal-brain elixir`;
      break;
    case $effect`Seeing Colors`:
      useItem_1 = $item`funky dried mushroom`;
      break;
    case $effect`Sepia Tan`:
      useItem_1 = $item`old bronzer`;
      break;
    case $effect`Serendipi Tea`:
      useItem_1 = $item`cuppa Serendipi tea`;
      break;
    case $effect`Serendipity`:
      if (!toBoolean(getProperty("_aug18Cast"))) {
        useSkill_1 = $skill`Aug. 18th: Serendipity Day!`;
      }
      break;
    case $effect`Seriously Mutated`:
      useItem_1 = $item`extra-potent gremlin mutagen`;
      break;
    case $effect`Shadow Waters`:
      if (itemAmount($item`Rufus's shadow lodestone`) > 0) {
        if (speculative) {
          return true;
        }
        // lodestone will be consumed for a free NC to get this buff
        // save and restore our location as shadow rifts have a 80% item drop penalty
        // don't want it unless actually going to a shadow rift
        const savedLoc: Location = myLocation();
        setProperty("auto_disableAdventureHandling", true.toString());
        autoAdv$2(auto_availableBrickRift());
        setProperty("auto_disableAdventureHandling", false.toString());
        setLocation(savedLoc);
        ret = true;
      }
      break;
    case $effect`Shells of the Damned`:
      useItem_1 = $item`cyan seashell`;
      break;
    case $effect`Shield of the Pastalord`:
      useSkill_1 = $skill`Shield of the Pastalord`;
      if (myClass() !== $class`Pastamancer`) {
        buff = $effect`Flimsy Shield of the Pastalord`;
      }
      break;
    case $effect`Shelter of Shed`:
      useSkill_1 = $skill`Shelter of Shed`;
      break;
    case $effect`Shifted Reality`:
      useSkill_1 = $skill`Reality Shift`;
      break;
    case $effect`Shortly Hydrated`:
      useItem_1 = $item`short glass of water`;
      break;
    case $effect`Shrieking Weasel`:
      useItem_1 = $item`Shrieking Weasel holo-record`;
      break;
    case $effect`Simmering`:
      useSkill_1 = $skill`Simmer`;
      break;
    case $effect`Simply Invisible`:
      useItem_1 = $item`invisibility potion`;
      break;
    case $effect`Simply Irresistible`:
      useItem_1 = $item`irresistibility potion`;
      break;
    case $effect`Simply Irritable`:
      useItem_1 = $item`irritability potion`;
      break;
    case $effect`Singer's Faithful Ocelot`:
      useSkill_1 = $skill`Singer's Faithful Ocelot`;
      break;
    case $effect`Sinuses For Miles`:
      useItem_1 = $item`Mick's IcyVapoHotness Inhaler`;
      break;
    case $effect`Sleaze-Resistant Trousers`:
      useItem_1 = $item`sleaze powder`;
      break;
    case $effect`Sleazy Hands`:
      useItem_1 = $item`lotion of sleaziness`;
      break;
    case $effect`Slightly Larger Than Usual`:
      useItem_1 = $item`giant giant moth dust`;
      break;
    case $effect`Slinking Noodle Glob`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Slippery as a Seal`:
      if (auto_have_skill($skill`Seal Clubbing Frenzy`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Seal Clubbing Frenzy`;
      }
      break;
    case $effect`Slippery Oiliness`:
      useItem_1 = $item`oil of slipperiness`;
      break;
    case $effect`Smelly Pants`:
      useItem_1 = $item`stench powder`;
      break;
    case $effect`Smooth Movements`:
      useSkill_1 = $skill`Smooth Movement`;
      break;
    case $effect`Snarl of the Timberwolf`:
      useSkill_1 = $skill`Snarl of the Timberwolf`;
      break;
    case $effect`Snarl of Three Timberwolves`:
      mustEquip = $item`velour voulge`;
      useSkill_1 = $skill`Snarl of the Timberwolf`;
      break;
    case $effect`Snow Shoes`:
      useItem_1 = $item`snow cleats`;
      break;
    case $effect`So You Can Work More...`:
      useItem_1 = $item`baggie of powdered sugar`;
      break;
    case $effect`Soles of Glass`:
      if (
        auto_have_familiar($familiar`Grim Brother`) &&
        !toBoolean(getProperty("_grimBuff"))
      ) {
        if (speculative) {
          return true;
        }
        visitUrl("choice.php?pwd&whichchoice=835&option=1", true);
        ret = true;
      }
      break;
    case $effect`Somewhat Poisoned`:
      useSkill_1 = $skill`Disco Nap`;
      break;
    case $effect`Song of Accompaniment`:
      useSkill_1 = $skill`Song of Accompaniment`;
      break;
    case $effect`Song of Battle`:
      useSkill_1 = $skill`Song of Battle`;
      break;
    case $effect`Song of Bravado`:
      useSkill_1 = $skill`Song of Bravado`;
      break;
    case $effect`Song of Cockiness`:
      useSkill_1 = $skill`Song of Cockiness`;
      break;
    case $effect`Song of Fortune`:
      useSkill_1 = $skill`Song of Fortune`;
      break;
    case $effect`Song of the Glorious Lunch`:
      useSkill_1 = $skill`Song of the Glorious Lunch`;
      break;
    case $effect`Song of the North`:
      useSkill_1 = $skill`Song of the North`;
      break;
    case $effect`Song of Sauce`:
      useSkill_1 = $skill`Song of Sauce`;
      break;
    case $effect`Song of Slowness`:
      useSkill_1 = $skill`Song of Slowness`;
      break;
    case $effect`Song of Solitude`:
      useSkill_1 = $skill`Song of Solitude`;
      break;
    case $effect`Song of Starch`:
      useSkill_1 = $skill`Song of Starch`;
      break;
    case $effect`The Sonata of Sneakiness`:
      useSkill_1 = $skill`The Sonata of Sneakiness`;
      break;
    case $effect`Soothing Flute`:
      useSkill_1 = $skill`Soothing Flute`;
      break;
    case $effect`Soulerskates`:
      useSkill_1 = $skill`Soul Rotation`;
      break;
    case $effect`Sour Softshoe`:
      useItem_1 = $item`pulled yellow taffy`;
      break;
    case $effect`Spectral Awareness`:
      useSkill_1 = $skill`Spectral Awareness`;
      break;
    case $effect`Spice Haze`:
      useSkill_1 = $skill`Bind Spice Ghost`;
      break;
    case $effect`Spiky Hair`:
      useItem_1 = $item`super-spiky hair gel`;
      break;
    case $effect`Spiky Shell`:
      if (auto_have_skill($skill`Spiky Shell`) && acquireTotem()) {
        useSkill_1 = $skill`Spiky Shell`;
      }
      break;
    case $effect`Spirit of the Mountains`:
      if (!toBoolean(getProperty("_aug1Cast"))) {
        useSkill_1 = $skill`Aug. 1st: Mountain Climbing Day!`;
      }
      break;
    case $effect`Spiritually Awake`:
      useItem_1 = $item`holy spring water`;
      break;
    case $effect`Spiritually Aware`:
      useItem_1 = $item`spirit beer`;
      break;
    case $effect`Spiritually Awash`:
      useItem_1 = $item`sacramental wine`;
      break;
    case $effect`Spiro Gyro`:
      useItem_1 = $item`programmable turtle`;
      break;
    case $effect`Spitting Rhymes`:
      if (auto_haveIdolMicrophone()) {
        if (speculative) {
          return true;
        }
        cliExecute("loathingidol rhyme");
        ret = true;
      }
      break;
    case $effect`Spooky Hands`:
      useItem_1 = $item`lotion of spookiness`;
      break;
    case $effect`Spooky Weapon`:
      useItem_1 = $item`spooky nuggets`;
      break;
    case $effect`Spookypants`:
      useItem_1 = $item`spooky powder`;
      break;
    case $effect`Springy Fusilli`:
      useSkill_1 = $skill`Springy Fusilli`;
      break;
    case $effect`Squatting and Thrusting`:
      useItem_1 = $item`Squat-Thrust Magazine`;
      break;
    case $effect`Stabilizing Oiliness`:
      useItem_1 = $item`oil of stability`;
      break;
    case $effect`Standard Issue Bravery`:
      useItem_1 = $item`CSA bravery badge`;
      break;
    case $effect`Steak Skirt`:
      useSkill_1 = $skill`Steak Skirt`;
      break;
    case $effect`Steely-Eyed Squint`:
      useSkill_1 = $skill`Steely-Eyed Squint`;
      break;
    case $effect`Steroid Boost`:
      useItem_1 = $item`Knob Goblin steroids`;
      break;
    case $effect`Stewing`:
      useSkill_1 = $skill`Stew`;
      break;
    case $effect`Stevedave's Shanty of Superiority`:
      useSkill_1 = $skill`Stevedave's Shanty of Superiority`;
      break;
    case $effect`Stickler for Promptness`:
      useItem_1 = $item`potion of punctual companionship`;
      break;
    case $effect`Stinky Hands`:
      useItem_1 = $item`lotion of stench`;
      break;
    case $effect`Stinky Weapon`:
      useItem_1 = $item`stench nuggets`;
      break;
    case $effect`Stone-Faced`:
      useItem_1 = $item`stone wool`;
      break;
    case $effect`Strength of the Tortoise`:
      if (auto_have_skill($skill`Patience of the Tortoise`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Patience of the Tortoise`;
      }
      break;
    case $effect`Stretched`:
      useSkill_1 = $skill`Stretch`;
      break;
    case $effect`Strong Grip`:
      useItem_1 = $item`finger exerciser`;
      break;
    case $effect`Strong Resolve`:
      useItem_1 = $item`resolution: be stronger`;
      break;
    case $effect`Sugar Rush`:
      for (const it of $items`Crimbo fudge, Crimbo peppermint bark, Crimbo candied pecan, breath mint, Tasty Fun Good rice candy, that gum you like, Angry Farmer candy`) {
        if (itemAmount(it) > 0) {
          useItem_1 = it;
        }
      }
      break;
    case $effect`Superdrifting`:
      useItem_1 = $item`Superdrifter holo-record`;
      break;
    case $effect`Superheroic`:
      useItem_1 = $item`confiscated comic book`;
      break;
    case $effect`Superhuman Sarcasm`:
      useItem_1 = $item`serum of sarcasm`;
      break;
    case $effect`Suspicious Gaze`:
      useSkill_1 = $skill`Suspicious Gaze`;
      break;
    case $effect`Sweat Equity`:
      if (auto_haveBCZ()) {
        mustEquip = auto_getItemToEquipBCZ();
        useSkill_1 = $skill`BCZ: Sweat Equity`;
      }
      break;
    case $effect`Sweet Heart`:
      useItem_1 = $item`love song of sugary cuteness`;
      break;
    case $effect`Sweet, Nuts`:
      useItem_1 = $item`Crimbo candied pecan`;
      break;
    case $effect`Sweetbreads Flambé`:
      useItem_1 = $item`Greek fire`;
      break;
    case $effect`Takin' It Greasy`:
      useSkill_1 = $skill`Grease Up`;
      break;
    case $effect`Tapased Out`:
      useItem_1 = $item`spinal tapas`;
      break;
    case $effect`Taped Up`:
      useSkill_1 = $skill`Tape Up`;
      break;
    case $effect`Taunt of Horus`:
      useItem_1 = $item`talisman of Horus`;
      break;
    case $effect`Temporarily Filtered`:
      useItem_1 = $item`single-use dust mask`;
      break;
    case $effect`Temporary Lycanthropy`:
      useItem_1 = $item`blood of the Wereseal`;
      break;
    case $effect`Tenacity of the Snapper`:
      if (auto_have_skill($skill`Tenacity of the Snapper`) && acquireTotem()) {
        useSkill_1 = $skill`Tenacity of the Snapper`;
      }
      break;
    case $effect`Tenderized`:
      useSkill_1 = $skill`Self-Tenderize`;
      break;
    case $effect`The Grass...  Is Blue...`:
      useItem_1 = $item`blue grass`;
      break;
    case $effect`There Is A Spoon`:
      useItem_1 = $item`dented spoon`;
      break;
    case $effect`They've Got Fleas`:
      useItem_1 = $item`out-of-work circus flea`;
      break;
    case $effect`This Is Where You're a Viking`:
      useItem_1 = $item`VYKEA woadpaint`;
      break;
    case $effect`Thoughtful Empathy`:
      if (auto_have_skill($skill`Empathy of the Newt`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Empathy of the Newt`;
      }
      break;
    case $effect`Throwing Some Shade`:
      useItem_1 = $item`shady shades`;
      break;
    case $effect`Ticking Clock`:
      useItem_1 = $item`cheap wind-up clock`;
      break;
    case $effect`Tingling Insides`:
      useItem_1 = $item`electric mushroom`;
      break;
    case $effect`Tingly Tongue`:
      useItem_1 = $item`spare battery`;
      break;
    case $effect`Toad In The Hole`:
      useItem_1 = $item`anti-anti-antidote`;
      break;
    case $effect`Tomato Power`:
      useItem_1 = $item`tomato juice of powerful power`;
      break;
    case $effect`Too Shamed`:
      useItem_1 = $item`shim of shame shale`;
      break;
    case $effect`Tortious`:
      useItem_1 = $item`mocking turtle`;
      break;
    case $effect`Tricky Timpani`:
      useSkill_1 = $skill`Tricky Timpani`;
      break;
    case $effect`Triple-Sized`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Truly Gritty`:
      useItem_1 = $item`true grit`;
      break;
    case $effect`Tubes of Universal Meat`:
      if (auto_have_skill($skill`Manicotti Meditation`)) {
        mustEquip = $item`April Shower Thoughts shield`;
        useSkill_1 = $skill`Manicotti Meditation`;
      }
      break;
    case $effect`Twangy`:
      if (auto_haveIdolMicrophone()) {
        if (speculative) {
          return true;
        }
        cliExecute("loathingidol country");
        ret = true;
      }
      break;
    case $effect`Twen Tea`:
      useItem_1 = $item`cuppa Twen tea`;
      break;
    case $effect`Twinkly Weapon`:
      useItem_1 = $item`twinkly nuggets`;
      break;
    case $effect`Ultra-Soft Steps`:
      useItem_1 = $item`ultra-soft ferns`;
      break;
    case $effect`Ultraheart`:
      useSkill_1 = $skill`Heartstone: %buff`;
      break;
    case $effect`Unmuffled`:
      if (getProperty("peteMotorbikeMuffler") === "Extra-Loud Muffler") {
        useSkill_1 = $skill`Rev Engine`;
      }
      break;
    case $effect`Unrunnable Face`:
      useItem_1 = $item`runproof mascara`;
      break;
    case $effect`Unusual Perspective`:
      useItem_1 = $item`unusual oil`;
      break;
    case $effect`Up To 11`:
      if (auto_haveBCZ()) {
        mustEquip = auto_getItemToEquipBCZ();
        useSkill_1 = $skill`BCZ: Dial it up to 11`;
      }
      break;
    case $effect`Ur-Kel's Aria of Annoyance`:
      useSkill_1 = $skill`Ur-Kel's Aria of Annoyance`;
      break;
    case $effect`Using Protection`:
      useItem_1 = $item`orcish rubber`;
      break;
    case $effect`Visions of the Deep Dark Deeps`:
      useSkill_1 = $skill`Deep Dark Visions`;
      break;
    case $effect`Vital`:
      useItem_1 = $item`Doc Galaktik's Vitality Serum`;
      break;
    case $effect`Vitali Tea`:
      useItem_1 = $item`cuppa Vitali tea`;
      break;
    case $effect`Walberg's Dim Bulb`:
      useSkill_1 = $skill`Walberg's Dim Bulb`;
      break;
    case $effect`Waking the Dead`:
      if (auto_have_skill($skill`Summon Horde`)) {
        useSkill_1 = $skill`Summon Minion`;
      }
      break;
    case $effect`WAKKA WAKKA WAKKA`:
      useItem_1 = $item`yellow pixel potion`;
      break;
    case $effect`Warm Shoulders`:
      useItem_1 = $item`shoulder-warming lotion`;
      break;
    case $effect`Wasabi With You`:
      useItem_1 = $item`wasabi marble soda`;
      break;
    case $effect`Well-Oiled`:
      useItem_1 = $item`Oil of Parrrlay`;
      break;
    case $effect`Well-Swabbed Ear`:
      useItem_1 = $item`Swabbie™ swab`;
      break;
    case $effect`Wet and Greedy`:
      useItem_1 = $item`goblin water`;
      break;
    case $effect`Whispering Strands`:
      useSkill_1 = Skill.none;
      break;
    case $effect`Who's Going to Pay This Drunken Sailor?`:
      useSkill_1 = $skill`Who's Going to Pay This Drunken Sailor?`;
      break;
    case $effect`Wildsun Boon`:
      if (auto_canARBSupplyDrop()) {
        if (speculative) {
          return true;
        }
        ARBSupplyDrop("wsb");
        ret = true;
      }
      break;
    case $effect`Wisdom of Others`:
      useItem_1 = $item`filled mosquito`;
      break;
    case $effect`Wisdom of the Autumn Years`:
      useItem_1 = $item`autumn years wisdom`;
      break;
    case $effect`Wisdom of Thoth`:
      useSkill_1 = $skill`Wisdom of Thoth`;
      break;
    case $effect`Wit Tea`:
      useItem_1 = $item`cuppa Wit tea`;
      break;
    case $effect`Wizard Squint`:
      useSkill_1 = $skill`Wizard Squint`;
      break;
    case $effect`Woad Warrior`:
      useItem_1 = $item`pygmy pygment`;
      break;
    case $effect`Worth Your Salt`:
      useItem_1 = $item`salt wages`;
      break;
    case $effect`Wry Smile`:
      useSkill_1 = $skill`Wry Smile`;
      break;
    case $effect`Yoloswagyoloswag`:
      useItem_1 = $item`Yolo™ chocolates`;
      break;
    case $effect`You Read The Manual`:
      useItem_1 = $item`O'RLY manual`;
      break;
    case $effect`Your Fifteen Minutes`:
      useSkill_1 = $skill`Fifteen Minutes of Flame`;
      break;
    case $effect`Zomg WTF`:
      useSkill_1 = $skill`Ag-grave-ation`;
      break;
    default:
      abort(`Effect (${buff}) is not known to us. Beep.`);
      break;
  }

  if (myClass() !== $class`Pastamancer`) {
    switch (buff) {
      case $effect`Bloody Potato Bits`:
        useSkill_1 = $skill`Bind Vampieroghi`;
        break;
      case $effect`Macaroni Coating`:
        useSkill_1 = $skill`Bind Undead Elbow Macaroni`;
        break;
      case $effect`Pasta Eyeball`:
        useSkill_1 = $skill`Bind Lasagmbie`;
        break;
      case $effect`Penne Fedora`:
        useSkill_1 = $skill`Bind Penne Dreadful`;
        break;
      case $effect`Slinking Noodle Glob`:
        useSkill_1 = $skill`Bind Vermincelli`;
        break;
      case $effect`Spice Haze`:
        useSkill_1 = $skill`Bind Spice Ghost`;
        break;
      case $effect`Whispering Strands`:
        useSkill_1 = $skill`Bind Angel Hair Wisp`;
        break;
    }
  }

  if (myClass() === $class`Turtle Tamer`) {
    switch (buff) {
      case $effect`Boon of the War Snapper`:
        useSkill_1 = $skill`Spirit Boon`;
        if (
          haveEffect($effect`Glorious Blessing of the War Snapper`) === 0 &&
          haveEffect($effect`Grand Blessing of the War Snapper`) === 0 &&
          haveEffect($effect`Blessing of the War Snapper`) === 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Boon of She-Who-Was`:
        useSkill_1 = $skill`Spirit Boon`;
        if (
          haveEffect($effect`Glorious Blessing of She-Who-Was`) === 0 &&
          haveEffect($effect`Grand Blessing of She-Who-Was`) === 0 &&
          haveEffect($effect`Blessing of She-Who-Was`) === 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Boon of the Storm Tortoise`:
        useSkill_1 = $skill`Spirit Boon`;
        if (
          haveEffect($effect`Glorious Blessing of the Storm Tortoise`) === 0 &&
          haveEffect($effect`Grand Blessing of the Storm Tortoise`) === 0 &&
          haveEffect($effect`Blessing of the Storm Tortoise`) === 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Disdain of the War Snapper`:
        useSkill_1 = Skill.none;
        if (
          haveEffect($effect`Glorious Blessing of the War Snapper`) === 0 &&
          haveEffect($effect`Grand Blessing of the War Snapper`) === 0 &&
          haveEffect($effect`Blessing of the War Snapper`) === 0
        ) {
          useSkill_1 = $skill`Blessing of the War Snapper`;
        }
        if (
          haveEffect($effect`Glorious Blessing of the Storm Tortoise`) !== 0 ||
          haveEffect($effect`Grand Blessing of the Storm Tortoise`) !== 0 ||
          haveEffect($effect`Blessing of the Storm Tortoise`) !== 0
        ) {
          useSkill_1 = Skill.none;
        }
        if (
          haveEffect($effect`Glorious Blessing of She-Who-Was`) !== 0 ||
          haveEffect($effect`Grand Blessing of She-Who-Was`) !== 0 ||
          haveEffect($effect`Blessing of She-Who-Was`) !== 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Disdain of She-Who-Was`:
        useSkill_1 = Skill.none;
        if (
          haveEffect($effect`Glorious Blessing of She-Who-Was`) === 0 &&
          haveEffect($effect`Grand Blessing of She-Who-Was`) === 0 &&
          haveEffect($effect`Blessing of She-Who-Was`) === 0
        ) {
          useSkill_1 = $skill`Blessing of She-Who-Was`;
        }
        if (
          haveEffect($effect`Glorious Blessing of the Storm Tortoise`) !== 0 ||
          haveEffect($effect`Grand Blessing of the Storm Tortoise`) !== 0 ||
          haveEffect($effect`Blessing of the Storm Tortoise`) !== 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Disdain of the Storm Tortoise`:
        useSkill_1 = Skill.none;
        if (
          haveEffect($effect`Glorious Blessing of the Storm Tortoise`) === 0 &&
          haveEffect($effect`Grand Blessing of the Storm Tortoise`) === 0 &&
          haveEffect($effect`Blessing of the Storm Tortoise`) === 0
        ) {
          useSkill_1 = $skill`Blessing of the Storm Tortoise`;
        }
        break;
    }
  } else {
    switch (buff) {
      case $effect`Disdain of She-Who-Was`:
        useSkill_1 = $skill`Blessing of She-Who-Was`;
        if (haveEffect($effect`Disdain of the War Snapper`) > 0) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Disdain of the Storm Tortoise`:
        useSkill_1 = $skill`Blessing of the Storm Tortoise`;
        if (
          haveEffect($effect`Disdain of She-Who-Was`) > 0 ||
          haveEffect($effect`Disdain of the War Snapper`) > 0
        ) {
          useSkill_1 = Skill.none;
        }
        break;
      case $effect`Disdain of the War Snapper`:
        useSkill_1 = $skill`Blessing of the War Snapper`;
        break;
    }
  }

  if (buff === $effect`Triple-Sized`) {
    if (speculative) {
      return auto_powerfulGloveCharges() >= 5;
    } else {
      return auto_powerfulGloveStats();
    }
  }

  if (buff === $effect`Invisible Avatar`) {
    if (speculative) {
      return auto_powerfulGloveCharges() >= 5;
    } else {
      return auto_powerfulGloveNoncombat();
    }
  }

  if (
    $effects`Feeling Lonely, Feeling Excited, Feeling Nervous, Feeling Peaceful`.includes(
      buff,
    ) &&
    auto_haveEmotionChipSkills()
  ) {
    const feeling: Skill = toSkill(buff);
    //speculate to see if buff will be cast. Return false if it will not be
    if (buffMaintain(feeling, buff, mustEquip, mp_min, casts, turns, true)) {
      if (speculative) {
        return feeling.timescast < feeling.dailylimit;
      } else if (feeling.timescast < feeling.dailylimit) {
        useSkill_1 = toSkill(buff);
        handleTracker(useSkill_1.toString(), "auto_otherstuff");
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  const falloutEffects: Effect[] = $effects`Drunk and Avuncular, Lucky Struck, Ministrations in the Dark, Power\, Man, Record Hunger, Shrieking Weasel, Superdrifting`;
  if (falloutEffects.includes(buff)) {
    if (!possessEquipment($item`Wrist-Boy`)) {
      return false;
    }
    if ($effects`Drunk and Avuncular, Record Hunger`.includes(buff)) {
      if (inAftercore()) {
        return false;
      }
      if (haveEffect(buff) >= 3) {
        return false;
      }
    }
    for (const ef of falloutEffects) {
      if (haveEffect(ef) > 0 && ef !== buff) {
        uneffect(ef);
      }
    }
  }

  if (useItem_1 !== Item.none) {
    return buffMaintain$1(useItem_1, buff, casts, turns, speculative);
  }
  if (useSkill_1 !== Skill.none) {
    return buffMaintain(
      useSkill_1,
      buff,
      mustEquip,
      mp_min,
      casts,
      turns,
      speculative,
    );
  }
  return ret;
}

export function buffMaintain$3(
  buff: Effect,
  mp_min: number,
  casts: number,
  turns: number,
): boolean {
  return buffMaintain$2(buff, mp_min, casts, turns, false);
}

export function buffMaintain$4(buff: Effect): boolean {
  return buffMaintain$3(buff, 0, 1, 1);
}
// Checks to see if we are already wearing a facial expression before using buffMaintain
//	if an expression is REQUIRED force it using buffMaintain
export function auto_faceCheck(face: Effect): boolean {
  const FacialExpressions: Effect[] = $effects`Snarl of the Timberwolf, Scowl of the Auk, Stiff Upper Lip, Patient Smile, Quiet Determination, Arched Eyebrow of the Archmage, Wizard Squint, Quiet Judgement, Icy Glare, Wry Smile, Disco Leer, Disco Smirk, Suspicious Gaze, Knowing Smile, Quiet Desperation, Inscrutable Gaze`;
  let CanEmote: boolean = true;

  for (const FExp of FacialExpressions) {
    if (haveEffect(FExp) > 0) {
      CanEmote = false;
    }
  }

  if (CanEmote) {
    buffMaintain$4(face);
  } else {
    auto_log_debug$1(
      `Can not get ${face} expression as we are already emoting.`,
    );
    return false;
  }

  return true;
}
