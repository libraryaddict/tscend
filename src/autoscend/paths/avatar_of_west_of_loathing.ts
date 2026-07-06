import {
  cliExecute,
  Effect,
  getProperty,
  haveEffect,
  haveSkill,
  itemAmount,
  myClass,
  myLevel,
  myLocation,
  myPath,
  setProperty,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $class, $effect, $item, $locations, $path, $skill } from "libram";

import { auto_log_info$1, autoCraft } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_west_of_loathing.ash
export function in_awol(): boolean {
  return myPath() === $path`Avatar of West of Loathing`;
}

export function awol_initializeSettings(): boolean {
  if (in_awol()) {
    setProperty("auto_awolLastSkill", (0).toString());
    setProperty("auto_getBeehive", true.toString());
  }
  return false;
}

export function awol_useStuff(): void {
  if (!in_awol()) {
    return;
  }

  if (haveSkill($skill`Patent Medicine`)) {
    if (itemAmount($item`patent invisibility tonic`) < 3) {
      if (
        itemAmount($item`eldritch oil`) > 0 &&
        itemAmount($item`snake oil`) > 0
      ) {
        autoCraft("cook", 1, $item`eldritch oil`, $item`snake oil`);
      }
    }
    if (itemAmount($item`patent avarice tonic`) === 0) {
      if (
        itemAmount($item`unusual oil`) > 0 &&
        itemAmount($item`skin oil`) > 0
      ) {
        autoCraft("cook", 1, $item`unusual oil`, $item`skin oil`);
      }
    }
    if (itemAmount($item`patent aggression tonic`) === 0) {
      if (
        itemAmount($item`unusual oil`) > 0 &&
        itemAmount($item`snake oil`) > 0
      ) {
        autoCraft("cook", 1, $item`unusual oil`, $item`snake oil`);
      }
    }
    if (itemAmount($item`patent preventative tonic`) === 0) {
      if (itemAmount($item`skin oil`) > 0 && itemAmount($item`snake oil`) > 0) {
        autoCraft("cook", 1, $item`skin oil`, $item`snake oil`);
      }
    }
  }

  if (
    itemAmount($item`snake oil`) > 0 &&
    toInt(getProperty("awolMedicine")) < 30 &&
    toInt(getProperty("awolVenom")) < 30
  ) {
    use(1, $item`snake oil`);
  }

  if (
    myClass() === $class`Cow Puncher` &&
    haveEffect($effect`Cowrruption`) < 20
  ) {
    if (itemAmount($item`corrupted marrow`) > 0) {
      use(1, $item`corrupted marrow`);
    }
  }
}

export function awol_walkBuff(): Effect {
  //We have none Walk Buffs
  if (
    !haveSkill($skill`Walk: Leisurely Amble`) &&
    !haveSkill($skill`Walk: Prideful Strut`) &&
    !haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    return Effect.none;
  }
  //If we only have one skill, might as well use that one
  if (
    haveSkill($skill`Walk: Leisurely Amble`) &&
    !haveSkill($skill`Walk: Prideful Strut`) &&
    !haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    return $effect`Leisurely Amblin'`;
  }
  if (
    !haveSkill($skill`Walk: Leisurely Amble`) &&
    haveSkill($skill`Walk: Prideful Strut`) &&
    !haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    return $effect`Prideful Strut`;
  }
  if (
    !haveSkill($skill`Walk: Leisurely Amble`) &&
    !haveSkill($skill`Walk: Prideful Strut`) &&
    haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    return $effect`Cautious Prowl`;
  }

  if (
    haveSkill($skill`Walk: Leisurely Amble`) &&
    haveSkill($skill`Walk: Prideful Strut`) &&
    !haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    if (
      $locations`The Boss Bat's Lair, The Hidden Temple, The Themthar Hills`.includes(
        myLocation(),
      )
    ) {
      return $effect`Leisurely Amblin'`;
    }
    if (myLevel() < 13) {
      return $effect`Prideful Strut`;
    }
    return $effect`Leisurely Amblin'`;
  }

  if (
    haveSkill($skill`Walk: Leisurely Amble`) &&
    !haveSkill($skill`Walk: Prideful Strut`) &&
    haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    if (
      $locations`The Boss Bat's Lair, The Hidden Temple, The Themthar Hills`.includes(
        myLocation(),
      )
    ) {
      return $effect`Leisurely Amblin'`;
    }
    return $effect`Cautious Prowl`;
  }

  if (
    !haveSkill($skill`Walk: Leisurely Amble`) &&
    haveSkill($skill`Walk: Prideful Strut`) &&
    haveSkill($skill`Walk: Cautious Prowl`)
  ) {
    if (myLevel() <= 6) {
      return $effect`Prideful Strut`;
    }
    return $effect`Cautious Prowl`;
  }
  //We have all three skills

  if (
    $locations`The Boss Bat's Lair, The Hidden Temple, The Themthar Hills`.includes(
      myLocation(),
    )
  ) {
    return $effect`Leisurely Amblin'`;
  }
  if (myLevel() <= 6) {
    return $effect`Prideful Strut`;
  }
  return $effect`Cautious Prowl`;
}

export function awol_buySkills(): boolean {
  if (!in_awol()) {
    return false;
  }

  if (toInt(getProperty("auto_awolLastSkill")) === 0) {
    //Catch that Mafia does not see our second/third skillbook at ascension start
    cliExecute("refresh inv");
  }

  if (toInt(getProperty("auto_awolLastSkill")) < myLevel()) {
    setProperty("auto_awolLastSkill", myLevel().toString());
  } else {
    return false;
  }

  if (itemAmount($item`Tales of the West: Cow Punching`) > 0) {
    let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8955");
    //The rest of the book is too filled<br>with jargon for you to be able<br>to understand it.
    const slang: AshMatcher = new AshMatcher(
      "The rest of the book is too filled",
      page,
    );
    const cowSlang: boolean = !slang.find();

    const my_skillPoints: AshMatcher = new AshMatcher(
      "You can learn (\\d+) more skill",
      page,
    );
    if (my_skillPoints.find()) {
      let skillPoints: number = toInt(my_skillPoints.group(1));
      auto_log_info$1(`Cow points found: ${skillPoints}`);
      while (skillPoints > 0) {
        if (myClass() === $class`Cow Puncher`) {
          if (!haveSkill($skill`Rugged Survivalist`)) {
            //restore some HP/MP after combat
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Larger Than Life`)) {
            //+100% maxHP/maxMP
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Cowcall`)) {
            //10MP deal spooky damage
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=1",
              true,
            );
          } else if (!haveSkill($skill`[18008]Hard Drinker`) && cowSlang) {
            //+5 max liver
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`One-Two Punch`)) {
            //3MP two unarmed attacks
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Pistolwhip`)) {
            //3MP damage and stun enemy 1/fight
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Walk: Cautious Prowl`) && cowSlang) {
            //40MP/20adv +50% item drop
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Hogtie`)) {
            //10MP stun for several rounds
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`True Outdoorsperson`)) {
            //+3 all res
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Unleash Cowrruption`) && cowSlang) {
            //yellow ray
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=7",
              true,
            );
          }
        } else {
          if (!haveSkill($skill`[18008]Hard Drinker`) && cowSlang) {
            //+5 max liver
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`Rugged Survivalist`)) {
            //restore some HP/MP after combat
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Walk: Cautious Prowl`) && cowSlang) {
            //40MP/20adv +50% item drop
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Larger Than Life`)) {
            //+100% maxHP/maxMP
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Cowcall`)) {
            //10MP deal spooky damage
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=1",
              true,
            );
          } else if (!haveSkill($skill`One-Two Punch`)) {
            //3MP two unarmed attacks
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Pistolwhip`)) {
            //3MP damage and stun enemy 1/fight
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Hogtie`)) {
            //10MP stun for several rounds
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`True Outdoorsperson`)) {
            //+3 all res
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Unleash Cowrruption`) && cowSlang) {
            //yellow ray
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1177&whichskill=7",
              true,
            );
          }
        }
        skillPoints -= 1;
      }
    }
  }
  if (itemAmount($item`Tales of the West: Beanslinging`) > 0) {
    let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8956");

    const slang: AshMatcher = new AshMatcher(
      "The rest of the book is too filled",
      page,
    );
    const beanSlang: boolean = !slang.find();

    const my_skillPoints: AshMatcher = new AshMatcher(
      "You can learn (\\d+) more skill",
      page,
    );
    if (my_skillPoints.find()) {
      let skillPoints: number = toInt(my_skillPoints.group(1));
      auto_log_info$1(`Bean points found: ${skillPoints}`);
      while (skillPoints > 0) {
        if (myClass() === $class`Beanslinger`) {
          if (!haveSkill($skill`Lavafava`)) {
            //3MP deal minor hot dmg twice
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Walk: Prideful Strut`) && beanSlang) {
            //40MP/20adv +10 stats per fight
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Bean Runner`)) {
            //+75% init
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Canhandle`)) {
            //0MP shake offhand beans for heal or dmg and stagger
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Prodigious Appetite`) && beanSlang) {
            //+5 max stomach
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`Beanstorm`)) {
            //15MP AoE 2 hits high dmg.
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Beanscreen`)) {
            //10MP block 3 next attacks
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`Beancannon`) && beanSlang) {
            //banish
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=7",
              true,
            );
          } else if (!haveSkill($skill`Beanweaver`)) {
            //2x bean enchantment, +2adv +substats bean plates
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Pungent Mung`)) {
            //5MP moderate stench dmg
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=1",
              true,
            );
          }
        } else {
          if (!haveSkill($skill`Prodigious Appetite`) && beanSlang) {
            //+5 max stomach
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`Walk: Prideful Strut`) && beanSlang) {
            //40MP/20adv +10 stats per fight
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Bean Runner`)) {
            //+75% init
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Beanscreen`)) {
            //10MP block 3 next attacks
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`Canhandle`)) {
            //0MP shake offhand beans for heal or dmg and stagger
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Lavafava`)) {
            //3MP deal minor hot dmg twice
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Beanstorm`)) {
            //15MP AoE 2 hits high dmg.
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Beancannon`) && beanSlang) {
            //banish
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=7",
              true,
            );
          } else if (!haveSkill($skill`Beanweaver`)) {
            //2x bean enchantment, +2adv +substats bean plates
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Pungent Mung`)) {
            //5MP moderate stench dmg
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1178&whichskill=1",
              true,
            );
          }
        }
        skillPoints -= 1;
      }
    }
  }
  if (itemAmount($item`Tales of the West: Snake Oiling`) > 0) {
    let page: string = visitUrl("inv_use.php?pwd=&which=3&whichitem=8957");

    const slang: AshMatcher = new AshMatcher(
      "The rest of the book is too filled",
      page,
    );
    const snakeSlang: boolean = !slang.find();

    const my_skillPoints: AshMatcher = new AshMatcher(
      "You can learn (\\d+) more skill",
      page,
    );
    if (my_skillPoints.find()) {
      let skillPoints: number = toInt(my_skillPoints.group(1));
      auto_log_info$1(`Snake points found: ${skillPoints}`);
      while (skillPoints > 0) {
        if (myClass() === $class`Snake Oiler`) {
          if (!haveSkill($skill`Good Medicine`)) {
            //5MP heal and stagger
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Bad Medicine`)) {
            //5MP big debuff
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`Extract Oil`)) {
            //10MP extract oil. 15/day max
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Tolerant Constitution`) && snakeSlang) {
            //+5 spleen
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`Snakewhip`)) {
            //3MP physical dmg + poison
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Patent Medicine`)) {
            //craft oils and tonics.
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Long Con`) && snakeSlang) {
            //sniff monster 5/day
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=7",
              true,
            );
          } else if (!haveSkill($skill`Walk: Leisurely Amble`) && snakeSlang) {
            //40MP/20adv +100% meat drop
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Well-Oiled Guns`)) {
            //all sixgun skills more effective
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Fan Hammer`)) {
            //3 attacks with gun
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=1",
              true,
            );
          }
        } else {
          if (!haveSkill($skill`Tolerant Constitution`) && snakeSlang) {
            //+5 spleen
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=8",
              true,
            );
          } else if (!haveSkill($skill`Long Con`) && snakeSlang) {
            //sniff monster 5/day
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=7",
              true,
            );
          } else if (!haveSkill($skill`Good Medicine`)) {
            //5MP heal and stagger
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=6",
              true,
            );
          } else if (!haveSkill($skill`Snakewhip`)) {
            //3MP physical dmg + poison
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=0",
              true,
            );
          } else if (!haveSkill($skill`Bad Medicine`)) {
            //5MP big debuff
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=3",
              true,
            );
          } else if (!haveSkill($skill`Extract Oil`)) {
            //10MP extract oil. 15/day max
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=2",
              true,
            );
          } else if (!haveSkill($skill`Patent Medicine`)) {
            //craft oils and tonics.
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=4",
              true,
            );
          } else if (!haveSkill($skill`Walk: Leisurely Amble`) && snakeSlang) {
            //40MP/20adv +100% meat drop
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=9",
              true,
            );
          } else if (!haveSkill($skill`Well-Oiled Guns`)) {
            //all sixgun skills more effective
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=5",
              true,
            );
          } else if (!haveSkill($skill`Fan Hammer`)) {
            //3 attacks with gun
            page = visitUrl(
              "choice.php?pwd=&option=1&whichchoice=1179&whichskill=1",
              true,
            );
          }
        }
        skillPoints -= 1;
      }
    }
  }

  return false;
}
