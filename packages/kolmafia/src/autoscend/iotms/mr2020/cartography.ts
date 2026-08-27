import {
  equippedAmount,
  handlingChoice,
  haveEffect,
  haveEquipped,
  haveSkill,
  itemAmount,
  lastChoice,
  Location,
  max,
  Monster,
  myId,
  myLocation,
  numericModifier,
  squareRoot,
  toInt,
  toMonster,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $modifier,
  $monster,
  $skill,
  get,
} from "libram";

import { handleChoiceAdv } from "../../auto_choice_adv";
import {
  auto_abort,
  auto_is_valid$2,
  auto_log_info,
  auto_log_warning,
  auto_runChoice,
  currentPoolSkill,
  handleTracker,
  internalQuestStatus,
  poolSkillPracticeGains,
  zoneRank,
} from "../../auto_util";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function canMapTheMonsters(): boolean {
  if (
    haveSkill($skill`Map the Monsters`) &&
    auto_is_valid$2($skill`Map the Monsters`)
  ) {
    return get("_monstersMapped") < 3;
  }
  return false;
}

export function mapTheMonsters(): boolean {
  if (get("mappingMonsters")) {
    auto_log_warning(
      "Trying to cast map the monsters but we already have an unused cast pending, skipping.",
      "red",
    );
    return true;
  }
  if (canMapTheMonsters()) {
    // visitUrl, not useSkill: useSkill aborts on the choice.php redirect (#1435)
    const mapText = visitUrl(
      `runskillz.php?action=Skillz&whichskill=${toInt($skill`Map the Monsters`)}&quantity=1&targetplayer=${myId()}&pwd`,
    );
    if (handlingChoice()) {
      handleChoiceAdv(lastChoice(), mapText);
    }
    return true;
  }
  return false;
}

function auto_monsterToMap(loc: Location, page: string): Monster {
  const mons: AshMatcher = new AshMatcher(
    'heyscriptswhatsupwinkwink" value="(\\d+)',
    page,
  );
  const monOpts: Map<number, Monster> = new Map();
  let i: number = 0;
  let bestmon: number = 0;
  while (mons.find()) {
    //record the possible monsters and identify the best one to target
    monOpts.set(i, toMonster(toInt(mons.group(1))));
    if (
      zoneRank(monOpts.get(i) ?? $monster.none, loc) <=
      zoneRank(monOpts.get(bestmon) ?? $monster.none, loc)
    ) {
      bestmon = i;
    }
    i += 1;
  }
  return monOpts.get(bestmon) ?? $monster.none;
}

export function cartographyChoiceHandler(choice: number, page: string): void {
  auto_log_info(`cartographyChoiceHandler Running choice ${choice}`, "blue");
  if (choice === 1425) {
    if (itemAmount($item`Orcish frat-paddle`) > 0) {
      auto_runChoice(1); // choosing baseball cap + cargo shorts to complete outfit
    } else if (itemAmount($item`Orcish baseball cap`) > 0) {
      auto_runChoice(2); // choosing frat-paddle + cargo shorts to complete outfit
    } else if (itemAmount($item`Orcish cargo shorts`) > 0) {
      auto_runChoice(3); // choosing frat-paddle + baseball cap to complete outfit
    } else {
      auto_runChoice(4); // if you have each outfit piece, just fight the orcs
    }
  } else if (choice === 1427) {
    // The Hidden Junction (Guano Junction)
    auto_runChoice(1); // fight the screambat.
  } else if (choice === 1428) {
    // Your Neck of the Woods (The Dark Neck of the Woods)
    auto_runChoice(2); // skip first 2 quest non-combats
  } else if (choice === 1429) {
    // No Nook Unknown (The Defiled Nook)
    auto_runChoice(1); // acquire 2 evil eyes
  } else if (choice === 1430) {
    // Ghostly Memories (A-boo Peak)
    auto_runChoice(1); // If we are adventuring in the peak we are trying to clear the peak, go to the horror
  } else if (choice === 1431) {
    // Here There Be Giants (Cartography)
    if (internalQuestStatus("questL10Garbage") === 9) {
      if (itemAmount($item`model airship`) > 0) {
        auto_runChoice(1); // go to steampunk choice to complete the quest
      } else if (haveEquipped($item`Mohawk wig`)) {
        auto_runChoice(4); // go to the punk rock choice to complete the quest
      } else {
        auto_runChoice(3); // go to the raver choice to get the record?
      }
    } else {
      auto_runChoice(1); // go to steampunk choice to open the hole in the sky.
    }
  } else if (choice === 1432) {
    // Mob Maptality (A Mob of Zeppelin Protesters)
    const fire_protestors: number =
      itemAmount($item`Flamin' Whatshisname`) > 0 ? 10 : 3;
    const sleaze_amount: number =
      numericModifier($modifier`Sleaze Damage`) +
      numericModifier($modifier`Sleaze Spell Damage`);
    const sleaze_protestors: number = squareRoot(sleaze_amount);
    let lynyrd_protestors: number = haveEffect($effect`Musky`) > 0 ? 6 : 3;
    for (const it of $items`lynyrdskin cap, lynyrdskin tunic, lynyrdskin breeches`) {
      if (equippedAmount(it) > 0) {
        lynyrd_protestors += 5;
      }
    }
    const best_protestors: number = max(
      fire_protestors,
      max(sleaze_protestors, lynyrd_protestors),
    );
    if (best_protestors === lynyrd_protestors) {
      auto_runChoice(2);
    } else if (best_protestors === sleaze_protestors) {
      auto_runChoice(1);
    } else if (best_protestors === fire_protestors) {
      auto_runChoice(3);
    }
  } else if (choice === 1433) {
    // Sneaky, Sneaky (The Hippy Camp (Verge of War))
    auto_runChoice(3); // start the war
  } else if (choice === 1434) {
    // Sneaky, Sneaky (Orcish Frat House (Verge of War))
    auto_runChoice(2); // start the war
  } else if (choice === 1435) {
    // Leading Yourself Right to Them (Map the Monsters)
    const enemy: Monster = auto_monsterToMap(myLocation(), page);
    if (enemy !== $monster.none) {
      handleTracker({
        what: $skill`Map the Monsters`,
        location: myLocation(),
        detail: enemy.toString(),
        property: "auto_mapperidot",
      });
      auto_runChoice(1, `heyscriptswhatsupwinkwink=${toInt(enemy)}`);
    } else {
      auto_abort(
        "trying to map a monster but don't know which monster to map!",
      );
    }
  } else if (choice === 1436) {
    // Billiards Room Options (The Haunted Billiards Room)
    if (poolSkillPracticeGains() === 1 || currentPoolSkill() > 15) {
      auto_runChoice(2); //try to win the key. on failure still gain 1 pool skill
    } else {
      auto_runChoice(1); //acquire the pool cue
    }
  } else {
    auto_abort("unhandled choice in cartographyChoiceHandler");
  }
}
