import {
  haveEquipped,
  isBanished,
  Location,
  Monster,
  Skill,
  toInt,
} from "kolmafia";
import { $item, $monster, $skill, get, set } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { zone_combatMod, zone_needItem } from "../../auto_zone";
import { auto_canUse } from "../../combat/auto_combat_util";
import {
  auto_is_valid,
  auto_locationMonsters,
  auto_wantToBanish,
  auto_wantToSniff,
} from "../../utils/auto_util";

type Target = { zone: Location; effect: AcornEffect; monster: Monster };
// Uses Mafia's names
type AcornEffect =
  | "BANISH"
  | "SNIFF"
  | "NONCOMBAT_5"
  | "NONCOMBAT_10"
  | "ITEM_DROPS"
  // 10-20 dmg each round
  | "PASSIVE_DMG"
  // Delevel 30%
  | "WEAKEN"
  // +15% stat gains
  | "STAT_GAIN"
  // 10-20% HP dmg each round
  | "PASSIVE_DMG_PERCENT"
  // -40% damage taken
  | "DAMAGE_REDUCTION"
  // +100% all attributes during fights
  | "STAT_BUFF"
  // Sometimes found after fights
  | "SEA_FRUIT"
  // -25% starting HP
  | "MHP_DEBUFF"
  // Sometimes found after fights
  | "FRUIT"
  // 10-20 spooky dmg / round
  | "PASSIVE_DMG_SPOOKY"
  // Monsters are sometimes staggered
  | "ENTANGLE"
  // Sometimes found after fights
  | "BRIDGE_PARTS"
  // 10-20 sleaze dmg / round
  | "PASSIVE_DMG_SLEAZE"
  // 20-30% HP, 10-20% MP / fight, 1k cap
  | "RESTORE"
  // Sea cows appear, 33 max across zones
  | "SEA_COWS"
  // +50% combat initiative
  | "INITIATIVE"
  // Monsters stunned for the first 3 rounds
  | "STUN"
  // -30% underwater pressure
  | "BETTER_DIVER";
type AcornEnv = "indoor" | "outdoor" | "underground" | "underwater";

type AcornSkill = {
  plant: Skill;
  full: Skill;
  effects: Record<AcornEnv, AcornEffect>;
};

const acornSkills: AcornSkill[] = [
  {
    plant: $skill`Irritating Riff`,
    full: $skill`Dissonant Riff`,
    effects: {
      indoor: "PASSIVE_DMG",
      outdoor: "WEAKEN",
      underground: "STAT_GAIN",
      underwater: "PASSIVE_DMG_PERCENT",
    },
  },
  {
    plant: $skill`Badenza`,
    full: $skill`Cadenza`,
    effects: {
      indoor: "DAMAGE_REDUCTION",
      outdoor: "NONCOMBAT_5",
      underground: "STAT_BUFF",
      underwater: "SEA_FRUIT",
    },
  },
  {
    plant: $skill`Accordion Shove`,
    full: $skill`Accordion Bash`,
    effects: {
      indoor: "BANISH",
      outdoor: "MHP_DEBUFF",
      underground: "FRUIT",
      underwater: "NONCOMBAT_10",
    },
  },
  {
    plant: $skill`Chiasso de los Muertos`,
    full: $skill`Concerto de los Muertos`,
    effects: {
      indoor: "PASSIVE_DMG_SPOOKY",
      outdoor: "ENTANGLE",
      underground: "SNIFF",
      underwater: "BANISH",
    },
  },
  {
    plant: $skill`Juvenile Refrain`,
    full: $skill`Bawdy Refrain`,
    effects: {
      indoor: "BRIDGE_PARTS",
      outdoor: "PASSIVE_DMG_SLEAZE",
      underground: "RESTORE",
      underwater: "SEA_COWS",
    },
  },
  {
    plant: $skill`Line of Zydeco`,
    full: $skill`Cone of Zydeco`,
    effects: {
      indoor: "INITIATIVE",
      outdoor: "ITEM_DROPS",
      underground: "STUN",
      underwater: "BETTER_DIVER",
    },
  },
];

// In order of priority
const purposes: {
  effects: AcornEffect[];
  perMonster: boolean;
  wanted: (enemy: Monster, zone: Location) => boolean;
}[] = [
  {
    effects: ["BANISH"],
    perMonster: true,
    wanted: (enemy, zone) =>
      auto_wantToBanish(enemy, zone) && !isBanished(enemy),
  },
  { effects: ["SNIFF"], perMonster: true, wanted: auto_wantToSniff },
  {
    effects: ["NONCOMBAT_5", "NONCOMBAT_10"],
    perMonster: false,
    wanted: (_, zone) => zone_combatMod(zone).desiredModifier < 0,
  },
  {
    effects: ["ITEM_DROPS"],
    perMonster: false,
    wanted: (_, zone) => zone_needItem(zone).needItem,
  },
];

export function haveAcorndion(): boolean {
  return (
    auto_is_valid($item`legendary acorndion`) &&
    possessEquipment($item`legendary acorndion`)
  );
}

function zoneValue(property: string, zone: Location): string | undefined {
  const prefix = `${zone}:`;
  return get(property)
    .split("|")
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);
}

function targets(): Target[] {
  return get("tscend_acorndionTargets")
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [zone, effect, monster] = entry.split(":");
      return {
        zone: Location.get(toInt(zone)),
        effect: effect as AcornEffect,
        monster: Monster.get(toInt(monster)),
      };
    });
}

function plantedEffects(zone: Location): AcornEffect[] {
  return (zoneValue("legendaryAcornsPlanted", zone) ?? "")
    .split(",")
    .filter(Boolean) as AcornEffect[];
}

function activeTargets(zone: Location, effect: AcornEffect): Monster[] {
  const planted = plantedEffects(zone).filter((e) => e === effect).length;
  if (planted === 0) {
    return [];
  }
  return targets()
    .filter((t) => t.zone === zone && t.effect === effect)
    .slice(-planted)
    .map((t) => t.monster);
}

function hasPlant(
  zone: Location,
  effect: AcornEffect,
  monster?: Monster,
): boolean {
  return monster === undefined
    ? plantedEffects(zone).includes(effect)
    : activeTargets(zone, effect).includes(monster);
}

// Planting in a full zone pushes out previous day's plants (if 3 already)
function evictsWantedPlant(zone: Location): boolean {
  const planted = plantedEffects(zone);
  if (planted.length < 3) {
    return false;
  }
  const oldest = planted[0];
  const purpose = purposes.find((p) => p.effects.includes(oldest));
  if (purpose === undefined) {
    return false;
  }
  const monster = purpose.perMonster
    ? activeTargets(zone, oldest)[0]
    : $monster.none;
  return monster !== undefined && purpose.wanted(monster, zone);
}

function canPlantIn(zone: Location): boolean {
  return (
    get("_legendaryAcornsUsed") < 12 &&
    toInt(zoneValue("_legendaryAcornZonesToday", zone) ?? "0") < 3 &&
    !evictsWantedPlant(zone)
  );
}

function acornFor(
  zone: Location,
  effects: AcornEffect[],
): AcornSkill | undefined {
  return acornSkills.find((acorn) =>
    effects.includes(acorn.effects[zone.environment as AcornEnv]),
  );
}

export function plantedBanish(enemy: Monster, zone: Location): boolean {
  return hasPlant(zone, "BANISH", enemy);
}

export function plantedSniff(enemy: Monster, zone: Location): boolean {
  return hasPlant(zone, "SNIFF", enemy);
}

function wantedPlant(enemy: Monster, zone: Location): AcornSkill | undefined {
  for (const { effects, perMonster, wanted } of purposes) {
    const acorn = acornFor(zone, effects);
    if (
      acorn !== undefined &&
      wanted(enemy, zone) &&
      !hasPlant(
        zone,
        acorn.effects[zone.environment as AcornEnv],
        perMonster ? enemy : undefined,
      )
    ) {
      return acorn;
    }
  }
  return undefined;
}

export function wantAcorndionAt(zone: Location): boolean {
  return (
    haveAcorndion() &&
    canPlantIn(zone) &&
    auto_locationMonsters(zone).some(
      ([mon, rate]) => rate > 0 && wantedPlant(mon, zone) !== undefined,
    )
  );
}

export function plantSkill(
  enemy: Monster,
  zone: Location,
): { effect: AcornEffect; cast: Skill } | undefined {
  if (!haveEquipped($item`legendary acorndion`) || !canPlantIn(zone)) {
    return undefined;
  }
  const acorn = wantedPlant(enemy, zone);
  if (acorn === undefined) {
    return undefined;
  }
  const cast = [acorn.full, acorn.plant].find((sk) => auto_canUse(sk));
  return cast === undefined
    ? undefined
    : { effect: acorn.effects[zone.environment as AcornEnv], cast };
}

// Tracking until mafia adds something
export function recordTarget(
  zone: Location,
  effect: AcornEffect,
  enemy: Monster,
): void {
  if (effect !== "BANISH" && effect !== "SNIFF") {
    return;
  }
  const entry = [zone.id, effect, enemy.id].join(":");
  const existing = get("tscend_acorndionTargets");
  set(
    "tscend_acorndionTargets",
    existing === "" ? entry : `${existing},${entry}`,
  );
}
