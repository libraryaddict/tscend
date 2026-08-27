import {
  availableAmount,
  equip,
  equippedItem,
  haveEquipped,
  Item,
  itemAmount,
  Slot,
} from "kolmafia";
import { $item, $items, $modifier, EternityCodpiece } from "libram";

import { auto_is_valid, auto_log_debug } from "../../auto_util";
import { maximizer } from "../../utils/maximizer";

// This is meant for items that have a date of 2026
export function haveEternityCodpiece(): boolean {
  if (
    auto_is_valid($item`The Eternity Codpiece`) &&
    availableAmount($item`The Eternity Codpiece`) > 0
  ) {
    return true;
  }
  return false;
}

export function isInEternityCodpiece(it: Item): boolean {
  return EternityCodpiece.currentGems().includes(it);
}

const CODPIECE_MANAGED_GEMS: Item[] = $items`blood cubic zirconia, Baseball Diamond, Heartstone, Peridot of Peril`;

// Prefer a spare Heartstone that isn't wanted for stealing a heart this pass over a massive gemstone.
function auto_codpieceFillerItem(): Item {
  return (
    [
      // If for some reason, you have a gem, then you'd doubtlessly prioritize it whenever we need more than a little meat
      ...(maximizer.getWeight($modifier`Meat Drop`) > 1
        ? [$item`incredibly dense meat gem`]
        : []),
      ...$items`Heartstone, massive gemstone, incredibly dense meat gem`, // TODO Fallback to the possible gems instead of assuming they have the gems available
    ].find(
      (i) =>
        (maximizer.getBonus(i) <= 0 || !CODPIECE_MANAGED_GEMS.includes(i)) &&
        itemAmount(i) > 0,
    ) ?? $item.none
  );
}

// These gems compete for the same slot, so scoring them individually only lets the
// maximizer pick one. Folding their scores into the codpiece's instead reflects the
// true value of wearing all of them at once via its five gem slots.
export function codpieceRegisterSlotContainer(): void {
  maximizer.registerSlotContainer({
    name: () => "The Eternity Codpiece",
    containerHolder: () => $item`The Eternity Codpiece`,
    holdableItems: () => (haveEternityCodpiece() ? CODPIECE_MANAGED_GEMS : []),
    slots: () => EternityCodpiece.SLOTS,
  });
}

export function codpieceReconcileGem(gem: Item): void {
  if (!CODPIECE_MANAGED_GEMS.includes(gem)) {
    return;
  }

  const wanted: boolean = maximizer.wantsItem(gem) || gem === $item`Heartstone`; // <3 the stone
  const codpieceWorn: boolean = haveEquipped($item`The Eternity Codpiece`);
  const inCodpiece: boolean = isInEternityCodpiece(gem);
  const slots: readonly Slot[] = EternityCodpiece.SLOTS;

  // If we want to wear this and it's not already socketed or worn elsewhere
  if (wanted && codpieceWorn && !inCodpiece && !haveEquipped(gem)) {
    // Find the first slot that is unused, or not special
    const emptySlot = slots.find((s) => equippedItem(s) === $item.none);
    const backfillSlot = [...slots]
      .reverse()
      .find(
        (s) =>
          maximizer.getBonus(equippedItem(s)) <= 0 &&
          !maximizer.willEquip(equippedItem(s)),
      );
    const target = emptySlot ?? backfillSlot;
    // If no slot
    if (!target) {
      return;
    }

    auto_log_debug(`Slotting ${gem} into ${target}`);
    equip(target, gem);
    return;
  }

  // If it's socketed but no longer wanted, free the slot back up, whether or not
  // the codpiece is still worn, so a still-wanted gem can backfill it later.
  if (!wanted && inCodpiece) {
    const idx = slots.findIndex((s) => equippedItem(s) === gem);
    if (idx === -1) {
      return;
    }

    const filler = auto_codpieceFillerItem();

    // Baseball Diamond is always ejected
    // Since holding it idle isn't worth the slot either way.
    if (
      gem !== $item`Baseball Diamond` &&
      (filler === $item.none || filler === equippedItem(slots[idx]))
    ) {
      return;
    }

    auto_log_debug(
      `Ejecting ${gem} from ${slots[idx]} and replacing it with ${filler}`,
    );
    equip(slots[idx], filler);
  }
}

// Backfills any remaining empty codpiece slots.
export function codpieceFillEmptySlots(): void {
  if (!haveEquipped($item`The Eternity Codpiece`)) {
    return;
  }

  for (const slot of EternityCodpiece.SLOTS) {
    if (equippedItem(slot) !== $item.none) {
      continue;
    }
    const filler = auto_codpieceFillerItem();
    if (filler === $item.none) {
      return;
    }
    equip(slot, filler);
  }
}
