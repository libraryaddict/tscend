export const NON_WEIGHT_MAXIMIZER_MODIFIERS = [
  "Tie",
  "Effective",
  "Melee",
  "Club",
  "Plumber",
  "Beeosity",
  "1 Handed",
  "2 Handed",
  "3 Handed",
  "Fumble",
] as const;

export const WEIGHTED_MAXIMIZER_MODIFIERS = [
  "All Resistance",
  "Melee",
  "Mainstat",
  "Dump",
  "Elemental Damage",
  "HP Regen",
] as const;

export const COMBINED_MAXIMIZER_MODIFIERS = [
  ...NON_WEIGHT_MAXIMIZER_MODIFIERS,
  ...WEIGHTED_MAXIMIZER_MODIFIERS,
] as const;

export type UnweightMaximizerModifier =
  (typeof NON_WEIGHT_MAXIMIZER_MODIFIERS)[number];

export type WeightedMaximizerModifier =
  (typeof WEIGHTED_MAXIMIZER_MODIFIERS)[number];

export type AllMaximizerModifier =
  | (typeof WEIGHTED_MAXIMIZER_MODIFIERS)[number]
  | (typeof NON_WEIGHT_MAXIMIZER_MODIFIERS)[number];

export const MAXIMIZER_ALIASES: Record<AllMaximizerModifier | string, string> =
  {
    "Damage Reduction": "dr",
    "Damage Absorption": "da",
    Initiative: "init",
    "Monster Level": "ml",
    "All Resistance": "all res",
    "Maximum HP": "hp",
    "Maximum MP": "mp",
    "1 Handed": "1hand",
    "2 Handed": "2hand",
    "3 Handed": "3hand",
    Fumble: "fumble",
    "Item Drop": "item drop",
    "Meat Drop": "meat drop",
    Tie: "tie",
  };
