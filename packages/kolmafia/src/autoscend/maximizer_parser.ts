import {
  Item,
  Modifier,
  outfitPieces,
  Slot,
  toFamiliar,
  toItem,
  toSlot,
} from "kolmafia";
import { $familiar, $item, $slot } from "libram";

import { auto_log_error } from "./auto_util";
import { Criterion, Maximizer } from "./utils/maximizer";
import { MAXIMIZER_MODIFIERS, MaximizerModifier } from "./utils/modifiers";

// Only place in the codebase allowed to interpret a raw maximizer string;
// everywhere else should build on the Maximizer class directly.

// Frankly I have no idea if this will work, but I'm not sure anyone else is going to use the script, so meh.

function findMaximizerModifier(name: string): MaximizerModifier | undefined {
  const lower = name.trim().toLowerCase();
  return MAXIMIZER_MODIFIERS.find((mod) => mod.toLowerCase() === lower);
}

function resolveCriterion(name: string): Criterion {
  return findMaximizerModifier(name) ?? Modifier.get(name);
}

// splits on commas, respecting quoting so `+"equip Item (mode)"`
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of text) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    }
    if (ch === "," && !inQuotes) {
      tokens.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  tokens.push(current);
  return tokens.map((token) => token.trim()).filter((token) => token !== "");
}

function resolveEquipTarget(text: string): Item {
  const direct = toItem(text);
  if (direct !== $item.none) {
    return direct;
  }
  const modeMatch = /^(.+)\s+\([^)]*\)$/.exec(text);
  if (modeMatch) {
    return toItem(modeMatch[1]);
  }
  return $item.none;
}

function applyTerm(target: Maximizer, token: string): void {
  const equipExclude = /^-"equip (.+)"$/.exec(token);
  if (equipExclude) {
    const item = resolveEquipTarget(equipExclude[1]);
    if (item !== $item.none) {
      target.exclude(item);
      return;
    }
  }

  const equipForce = /^\+"equip (.+)"$/.exec(token);
  if (equipForce) {
    const item = resolveEquipTarget(equipForce[1]);
    if (item !== $item.none) {
      target.equip(item);
      return;
    }
  }

  const bonus = /^\+(\d+(?:\.\d+)?)"bonus (.+)"$/.exec(token);
  if (bonus) {
    const item = resolveEquipTarget(bonus[2]);
    if (item !== $item.none) {
      target.bonus(item, Number(bonus[1]), true);
      return;
    }
  }

  const outfitExclude = /^-outfit\s+(.+)$/i.exec(token);
  if (outfitExclude) {
    for (const item of outfitPieces(outfitExclude[1])) {
      target.exclude(item);
    }
    return;
  }

  const outfitInclude = /^\+?outfit\s+(.+)$/i.exec(token);
  if (outfitInclude) {
    target.wearOutfit(outfitInclude[1]);
    return;
  }

  const switchFamiliar = /^switch\s+(.+)$/i.exec(token);
  if (switchFamiliar) {
    const familiar = toFamiliar(switchFamiliar[1]);
    if (familiar !== $familiar.none) {
      target.allowSwitch(familiar);
      return;
    }
  }

  const signedSlot = /^([+-])\s*(.+)$/.exec(token);
  if (signedSlot) {
    const slot: Slot = toSlot(signedSlot[2]);
    if (slot !== $slot.none) {
      if (signedSlot[1] === "+") {
        target.requireSlot(slot);
      } else {
        target.excludeSlot(slot);
      }
      return;
    }
  }

  if (/^1?hand(ed)?$/i.test(token)) {
    target.require(`1 Handed`);
    return;
  }

  const minMax = /^(.+?)\s+([+-]?\d+(?:\.\d+)?)(min|max)$/i.exec(token);
  if (minMax) {
    const mod = resolveCriterion(minMax[1]);
    const amount = Number(minMax[2]);
    if (minMax[3].toLowerCase() === "min") {
      target.min(mod, amount);
    } else {
      target.max(mod, amount);
    }
    return;
  }

  const dump = /^(?:\d+(?:\.\d+)?\s*)?dump$/i.exec(token);
  if (dump) {
    target.debugDump();
    return;
  }

  const numericWeight = /^([+-]?\d+(?:\.\d+)?)\s*(.+)$/.exec(token);
  if (numericWeight) {
    target.weight(resolveCriterion(numericWeight[2]), Number(numericWeight[1]));
    return;
  }

  if (signedSlot) {
    // sign present but not a recognized slot, treat as a signed boolean criterion
    target.weight(
      resolveCriterion(signedSlot[2]),
      signedSlot[1] === "+" ? 1 : -1,
    );
    return;
  }

  if (token !== "") {
    target.weight(resolveCriterion(token));
    return;
  }
}

export function applyMaximizePreference(target: Maximizer, text: string): void {
  for (const token of tokenize(text)) {
    try {
      applyTerm(target, token);
    } catch {
      auto_log_error(
        `Could not parse maximizer preference term "${token}" - passing it through unchanged.`,
      );
      target.applyRawFallback(token);
    }
  }
}
