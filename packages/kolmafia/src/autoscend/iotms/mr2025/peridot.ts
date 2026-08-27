import {
  Item,
  itemAmount,
  Location,
  Monster,
  myLocation,
  toInt,
} from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $monster,
  $monsters,
  get,
  PeridotOfPeril,
} from "libram";

import { ArchSpade, Monodent, SwordOfSwords } from "../../../types";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_is_valid,
  auto_runChoice,
  handleTracker,
  safeGet,
  zoneRank,
} from "../../auto_util";

export function auto_havePeridot(): boolean {
  const pop: Item = $item`Peridot of Peril`;
  return auto_is_valid(pop) && possessEquipment(pop);
}

export function peridotManuallyDesiredMonsters(): Monster[] {
  // manually specify some favoured monsters
  const desired_monsters: Monster[] = [
    $monster`lobsterfrogman`,
    $monster`black panther`,
    $monster`white lion`,
    $monster`monstrous boiler`,
    $monster`modern zmobie`,
    $monster`dairy goat`,
    $monster`writing desk`,
    $monster`pygmy bowler`,
  ];
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

  if (
    safeGet("auto_familiarChoice") === $familiar`Sword of S Words` &&
    SwordOfSwords.auto_swordIsWillingToSwitchTargets()
  ) {
    const swordMonsters: Monster[] = [];
    const smutMonsters = $monsters`smut orc pipelayer, smut orc jacker, smut orc screwer, smut orc nailer`;

    // If we do not want every smut orc
    if (
      !smutMonsters.every((m) =>
        SwordOfSwords.auto_swordFamiliarWantsMonsterDrops(m, 100),
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

    desired_monsters.push(
      ...swordMonsters.filter((m) =>
        SwordOfSwords.auto_swordFamiliarWantsMonsterDrops(m),
      ),
    );
  }

  return desired_monsters;
}

export function auto_peridotSetZone(loc: Location): boolean {
  // We may want to monodent for some 30% meat
  if (
    Monodent.auto_haveMonodent() &&
    !get("_seadentWaveUsed") &&
    loc === $location`The Themthar Hills`
  ) {
    return true;
  }
  // if true, auto_pre_adv may add a large bonus to maximizer for peridot
  // and peridotChoiceHandler exits the choice (overrides desired monsters)
  // check that setting zone without using an adventure might be useful
  {
    if (!(ArchSpade.auto_spadeDigsRemaining() > 0)) {
      return false;
    }
  }
  // we don't have enough digs to make it through the beach, so we don't merely want to set the zone
  if (
    loc === $location`Sonofa Beach` &&
    ArchSpade.auto_spadeDigsRemaining() < 5
  ) {
    return false;
  }

  const desired_locations: Location[] = [
    $location`Sonofa Beach`,
    $location`The Hatching Chamber`,
    $location`The Feeding Chamber`,
    $location`The Royal Guard Chamber`,
    $location`The Haunted Kitchen`,
    $location`The Unquiet Garves`,
    $location`The Haunted Ballroom`,
  ];

  if (desired_locations.includes(loc)) {
    return true;
  }
  return false;
}

export function peridotChoiceHandler(choice: number, page: string): void {
  if (!auto_havePeridot()) {
    auto_runChoice(2); //should never get here but might as well mitigate
  }

  const loc: Location = myLocation();
  let bestmon: Monster = $monster.none;

  for (const [, mons] of page.matchAll(/bandersnatch" value="(\d+)/g)) {
    // identify the best possible monster to target
    const mon: Monster = Monster.get(toInt(mons));

    // Manual monster specifications
    if (peridotManuallyDesiredMonsters().includes(mon)) {
      bestmon = mon;
      break; // if we've got a force desired monster, don't bother with the rankings any more
    }

    if (
      // Pick first valid monster
      bestmon === $monster.none ||
      zoneRank(mon, loc) < zoneRank(bestmon, loc)
    ) {
      bestmon = mon;
    }
  }

  const popChoice: Monster = bestmon;
  if (bestmon === $monster.none || auto_peridotSetZone(loc)) {
    // still nothing found so just peace out. Or we want to set the zone without using an adventure.
    handleTracker({
      what: $item`Peridot of Peril`,
      location: loc,
      detail: "Peace out",
      property: "auto_mapperidot",
    });
    auto_runChoice(2); // if no match is found, hit the exit choice
    return;
  }

  handleTracker({
    what: $item`Peridot of Peril`,
    location: loc,
    detail: popChoice.toString(),
    property: "auto_mapperidot",
  });
  auto_runChoice(1, `bandersnatch=${toInt(popChoice)}`);
  return;
}

export function haveUsedPeridot(loc: Location): boolean {
  return PeridotOfPeril.periledToday(loc);
}
