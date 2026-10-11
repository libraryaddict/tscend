import {
  heartstoneMiddleLetter,
  Item,
  itemAmount,
  lastChoice,
  Location,
  Monster,
  myLocation,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  get,
  have,
  PeridotOfPeril,
} from "libram";

import {
  ArchSpade,
  BatWings,
  BCZ,
  Monodent,
  SealClubbingClub,
  SwordOfSwords,
} from "../../../types";
import { haveActuallyEquipped, possessEquipment } from "../../auto_equipment";
import { combat_status_check } from "../../combat/auto_combat_util";
import {
  bluevsred_preferFight,
  bluevsred_willEncounterFight,
} from "../../paths/2026/blue_vs_red";
import { auto_spadeDigsWantedForBarrels } from "../../quests/level_12";
import {
  auto_is_valid,
  auto_is_valid$2,
  auto_locationMonsters,
  auto_runChoice,
  auto_wantedDropMonsters,
  handleTracker,
  zoneRank,
} from "../../utils/auto_util";
import { heartstoneShouldStealHeartInCombat } from "../mr2026/heartstone";

export function havePeridot(): boolean {
  const pop: Item = $item`Peridot of Peril`;
  return auto_is_valid(pop) && possessEquipment(pop);
}

export function peridotManuallyDesiredMonsters(): Monster[] {
  // manually specify some favoured monsters
  const desired_monsters: Monster[] = [
    $monster`lobsterfrogman`,
    $monster`white lion`,
    $monster`monstrous boiler`,
    $monster`modern zmobie`,
    $monster`dairy goat`,
    $monster`writing desk`,
    $monster`pygmy bowler`,
    $monster`elegant animated nightstand`,
  ];
  // We never peridot the first monster, we peridot the one we don't have
  if ($items`busted wings, broken wings`.some((i) => have(i))) {
    desired_monsters.push($monster`black adder`);
  } else if ($items`sunken eyes, bird brain`.some((i) => have(i))) {
    desired_monsters.push($monster`black panther`);
  }
  // we sniff the two-star, two-line monster, but we want exactly one star chart
  if (itemAmount($item`star chart`) === 0) {
    desired_monsters.push($monster`Astronomer`);
  }
  // Quest gremlins need IDs because there's multiple
  desired_monsters.push(
    $monster`erudite gremlin (tool)`, // erudite gremlin (tool)
    $monster`batwinged gremlin (tool)`, // batwinged gremlin (tool)
    $monster`vegetable gremlin (tool)`, // vegetable gremlin (tool)
    $monster`spider gremlin (tool)`, // spider gremlin (tool)
  );

  desired_monsters.push($monster`Boss Bat`);

  if (
    get("tscend_familiarChoice") === $familiar`Sword of S Words` &&
    SwordOfSwords.swordIsWillingToSwitchTargets()
  ) {
    const swordMonsters: Monster[] = [];
    const smutMonsters = $monsters`smut orc pipelayer, smut orc jacker, smut orc screwer, smut orc nailer`;

    // If we do not want every smut orc
    if (
      !smutMonsters.every((m) =>
        SwordOfSwords.swordFamiliarWantsMonsterDrops(m),
      )
    ) {
      // Then we will consider peridot'ing a smut orc
      swordMonsters.push(...smutMonsters);
    }

    swordMonsters.push(...$monsters`spiny skelelton, toothy sklelton`);
    swordMonsters.push(
      ...$monsters`bearpig topiary animal, elephant (meatcar?) topiary animal, spider (duck?) topiary animal`,
    );
    swordMonsters.push($monster`shadow slab`);
    swordMonsters.push($monster`pygmy witch surgeon`);

    desired_monsters.push(
      ...swordMonsters.filter((m) =>
        SwordOfSwords.swordFamiliarWantsMonsterDrops(m),
      ),
    );
  }

  return desired_monsters;
}

export function peridotSetZone(loc: Location): boolean {
  // We may want to monodent for some 30% meat
  if (
    Monodent.haveMonodent() &&
    !get("_seadentWaveUsed") &&
    loc === $location`The Themthar Hills`
  ) {
    return true;
  }
  // if true, auto_pre_adv may add a large bonus to maximizer for peridot
  // and peridotChoiceHandler exits the choice (overrides desired monsters)
  // check that setting zone without using an adventure might be useful
  // spade digs and seals clubbed across the battlefield both fetch barrels from whichever zone we adventured in last
  if (loc === $location`Sonofa Beach`) {
    return (
      itemAmount($item`barrel of gunpowder`) +
        ArchSpade.spadeDigsRemaining() +
        SealClubbingClub.sealClubBattlefieldFightsLeft() >=
      5
    );
  }

  if (ArchSpade.spadeDigsRemaining() <= 0) {
    return false;
  }

  const desired_locations: Location[] = [
    $location`The Haunted Kitchen`,
    $location`The Unquiet Garves`,
    $location`The Haunted Ballroom`,
  ];

  const zepFightsNeeded = 6 - get("zeppelinProgress");

  // If we have enough digs to get through the entire thing for free, then do that
  if (
    ArchSpade.spadeDigsRemaining() >= zepFightsNeeded &&
    !itemAmount($item`glark cable`)
  ) {
    desired_locations.push($location`The Red Zeppelin`);
  }

  if (
    (ArchSpade.haveArchaeologistSpade() &&
      ArchSpade.spadeDigsRemaining() > 0 &&
      (BatWings.swoopsRemaining() === 0 ||
        !auto_is_valid$2($skill`Swoop like a Bat`) ||
        ArchSpade.spadeDigsRemaining() > auto_spadeDigsWantedForBarrels())) ||
    !auto_locationMonsters(loc).every(
      ([mon, rate]) => rate <= 0 || bluevsred_willEncounterFight(mon),
    )
  ) {
    desired_locations.push(
      $location`The Hatching Chamber`,
      $location`The Feeding Chamber`,
      $location`The Royal Guard Chamber`,
    );
  }

  if (desired_locations.includes(loc)) {
    return true;
  }
  return false;
}

export function bestMapMonstersTarget(
  loc: Location,
  monsters: Monster[],
  maxScore: number = Infinity,
): Monster {
  const heartstoneWords = haveActuallyEquipped($item`Heartstone`);
  const wantedDrops = auto_wantedDropMonsters(loc);
  let bestmon: Monster = $monster.none;
  let bestScore = maxScore;

  for (const mon of monsters) {
    let score = zoneRank(mon, loc);

    if (!bluevsred_willEncounterFight(mon) && wantedDrops.includes(mon)) {
      score -= 2000;
    } else if (bluevsred_preferFight(mon, loc)) {
      score -= 1000;
    }

    if (
      heartstoneWords &&
      bluevsred_willEncounterFight(mon) &&
      heartstoneMiddleLetter(mon) !== "" &&
      heartstoneShouldStealHeartInCombat(mon)
    ) {
      score -= 0.1;
    }

    if (score < bestScore) {
      bestScore = score;
      bestmon = mon;
    }
  }

  return bestmon;
}

export function peridotChoiceHandler(choice: number, page: string): void {
  if (!havePeridot()) {
    auto_runChoice(2); //should never get here but might as well mitigate
  }

  const loc: Location = myLocation();
  const planToGaze = BCZ.BCZEquipped() && BCZ.bczRefractedGaze(false, loc);
  const offered = [...page.matchAll(/bandersnatch" value="(\d+)/g)].map(
    ([, mons]) => Monster.get(parseInt(mons)),
  );

  const monsters = planToGaze ? BCZ.bczGazeTargets(loc, offered) : offered;
  const desired = peridotManuallyDesiredMonsters();
  const bestmon =
    monsters.find((mon) => desired.includes(mon)) ??
    // A gaze on an allied non-fight is wasted, so any fight beats peacing out
    bestMapMonstersTarget(
      loc,
      monsters,
      planToGaze ? Infinity : zoneRank($monster.none, loc),
    );

  if (bestmon === $monster.none || peridotSetZone(loc)) {
    // still nothing found so just peace out. Or we want to set the zone without using an adventure.
    handleTracker({
      tracker: "monstersMapped",
      source: $item`Peridot of Peril`,
      location: loc,
      detail: "Peace out",
    });
    auto_runChoice(2); // if no match is found, hit the exit choice
    return;
  }

  handleTracker({
    tracker: "monstersMapped",
    source: $item`Peridot of Peril`,
    location: loc,
    monster: bestmon,
  });
  auto_runChoice(1, `bandersnatch=${bestmon.id}`);
}

export function isPeridotMonster(): boolean {
  return combat_status_check("adventureBypass") && lastChoice() === 1557;
}

export function haveUsedPeridot(loc: Location): boolean {
  return PeridotOfPeril.periledToday(loc);
}
