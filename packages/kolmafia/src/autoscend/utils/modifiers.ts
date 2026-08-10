export const MAXIMIZER_MODIFIERS = [
  "All Resistance",
  "Tie",
  "Club",
  "Effective",
  "Melee",
  "Plumber",
  "Mainstat",
  "Dump",
  "Beeosity",
  "Elemental Damage",
  "HP Regen",
  "1 Handed",
  "2 Handed",
  "3 Handed",
  "Fumble",
] as const;

export type MaximizerModifier = (typeof MAXIMIZER_MODIFIERS)[number];

export const MAXIMIZER_ALIASES: Record<MaximizerModifier | string, string> = {
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
