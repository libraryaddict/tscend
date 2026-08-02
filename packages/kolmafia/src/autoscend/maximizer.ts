import {
  abort,
  containsText,
  equip,
  equippedItem,
  haveSkill,
  Item,
  itemType,
  maximize,
  Modifier,
  myFamiliar,
  outfitPieces,
  Slot,
  toSlot,
  weaponHands,
  weaponType,
} from "kolmafia";
import { $familiar, $skill, $slot } from "libram";

import { MaximizerModifier } from "./utils/modifiers";

type Criterion = Modifier | MaximizerModifier;

function criterionName(mod: Criterion): string {
  return mod instanceof Modifier ? mod.name : mod;
}

type ModesByItem = {
  "backup camera": "ml" | "meat" | "init";
  "Jurassic Parka":
    | "kachungasaur"
    | "dilophosaur"
    | "spikolodon"
    | "ghostasaurus"
    | "pterodactyl";
  "replica Jurassic Parka":
    | "kachungasaur"
    | "dilophosaur"
    | "spikolodon"
    | "ghostasaurus"
    | "pterodactyl";
  "The Crown of Ed the Undying":
    "bear" | "owl" | "puma" | "hyena" | "mouse" | "weasel" | "fish";
  "unbreakable umbrella":
    | "broken"
    | "forward-facing"
    | "bucket style"
    | "pitchfork style"
    | "constantly twirling"
    | "cocoon";
  "Snow Suit": "eyebrows" | "smirk" | "nose" | "goatee" | "hat";
  "unwrapped knock-off retro superhero cape": `${"vampire" | "heck" | "robot"} ${"hold" | "thrill" | "kiss" | "kill"}`;
  "LED candle": "disco" | "ultraviolet" | "reading" | "red light";
};

type ModeableItemName = keyof ModesByItem;

function copyMap<K, V>(from: Map<K, V>, into: Map<K, V>): void {
  into.clear();
  for (const [key, value] of from) into.set(key, value);
}

function copySet<T>(from: Set<T>, into: Set<T>): void {
  into.clear();
  for (const value of from) into.add(value);
}

export class Maximizer {
  private readonly weights = new Map<string, number>();
  private readonly mins = new Map<string, number>();
  private readonly maxes = new Map<string, number>();
  private readonly excluded = new Set<Item>();
  private readonly disabledSlots = new Set<Slot>();
  private forceOneHanded = false;
  private readonly custom = new Set<string>();
  private readonly pendingEquip = new Map<Slot, Item>();
  private readonly pendingBonus = new Map<Item, number>();
  private readonly modes = new Map<Item, Set<string>>();

  // stacks with earlier weight() calls for the same criterion
  weight(mod: Criterion, amount: number = 1): this {
    const name = criterionName(mod);
    this.weights.set(name, (this.weights.get(name) ?? 0) + amount);
    return this;
  }

  min(mod: Criterion, amount: number): this {
    this.mins.set(criterionName(mod), amount);
    return this;
  }

  max(mod: Criterion, amount: number): this {
    this.maxes.set(
      criterionName(mod),
      Math.max(this.maxes.get(criterionName(mod)) ?? amount, amount),
    );
    return this;
  }

  // stacks with earlier bonus() calls for the same item
  bonus(item: Item, amount: number): this {
    this.pendingBonus.set(item, (this.pendingBonus.get(item) ?? 0) + amount);
    return this;
  }

  exclude(item: Item): this {
    this.excluded.add(item);

    return this;
  }

  // bonus() scores every queued mode; equip aborts if more than one is queued
  mode<T extends ModeableItemName>(name: T, value: ModesByItem[T]): this {
    const item = Item.get(name);
    const existing = this.modes.get(item) ?? new Set<string>();
    existing.add(value);
    this.modes.set(item, existing);
    return this;
  }

  has(text: string): boolean {
    return containsText(this.toString(), text);
  }

  raw(fragment: string): this {
    this.custom.add(fragment);
    return this;
  }

  remove(fragment: string): this {
    this.custom.delete(fragment);

    const excludeMatch = /^-"equip (.+)"$/.exec(fragment);
    if (excludeMatch) {
      const name = excludeMatch[1];
      for (const item of this.excluded) {
        if (item.toString() === name) {
          this.excluded.delete(item);
          break;
        }
      }
    }

    const equipMatch = /^\+"equip (.+)"$/.exec(fragment);
    if (equipMatch) {
      const text = equipMatch[1];
      for (const [slot, item] of this.pendingEquip) {
        const name = item.toString();
        if (text === name || text.startsWith(`${name} (`)) {
          this.pendingEquip.delete(slot);
          break;
        }
      }
    }

    return this;
  }

  clone(): Maximizer {
    const copy = new Maximizer();
    copy.restore(this);
    return copy;
  }

  restore(from: Maximizer): void {
    copyMap(from.weights, this.weights);
    copyMap(from.mins, this.mins);
    copyMap(from.maxes, this.maxes);
    copySet(from.excluded, this.excluded);
    copySet(from.disabledSlots, this.disabledSlots);
    this.forceOneHanded = from.forceOneHanded;
    copySet(from.custom, this.custom);
    copyMap(from.pendingEquip, this.pendingEquip);
    copyMap(from.pendingBonus, this.pendingBonus);
    this.modes.clear();
    for (const [item, itemModes] of from.modes)
      this.modes.set(item, new Set(itemModes));
  }

  wearOutfit(outfitName: string): this {
    for (const item of outfitPieces(outfitName)) {
      this.equip(item);
    }
    return this;
  }

  // queues intent to equip; doesn't touch worn equipment until maximize()/simulate() runs
  equip(item: Item, slot?: Slot): boolean {
    const targetSlot = slot ?? toSlot(item);
    if (targetSlot === Slot.none) {
      return false;
    }
    if (targetSlot === $slot`weapon` && weaponHands(item) > 1) {
      this.pendingEquip.delete($slot`off-hand`);
    } else if (
      targetSlot === $slot`off-hand` &&
      weaponHands(this.pending($slot`weapon`)) > 1
    ) {
      this.pendingEquip.delete($slot`weapon`);
    }
    this.pendingEquip.set(targetSlot, item);
    return true;
  }

  pending(slot: Slot): Item {
    return this.pendingEquip.get(slot) ?? Item.none;
  }

  willEquip(item: Item, slot?: Slot): boolean {
    if (slot !== undefined) {
      return this.pending(slot) === item;
    }
    return [...this.pendingEquip.values()].includes(item);
  }
  wantsItem(item: Item): boolean {
    return (this.pendingBonus.get(item) ?? 0) > 0 || this.willEquip(item);
  }

  // equips immediately; unless lock is false, also locks the slot so maximize() won't override it
  forceEquip(item: Item, slot?: Slot, lock: boolean = true): boolean {
    if (item === Item.none) {
      return equip(slot ?? Slot.none, item);
    }
    const targetSlot = slot ?? toSlot(item);
    if (targetSlot === Slot.none) {
      return false;
    }

    if (
      targetSlot === $slot`off-hand` &&
      weaponHands(equippedItem($slot`weapon`)) > 1
    ) {
      if (lock) {
        this.pendingEquip.delete($slot`weapon`);
      }
      equip($slot`weapon`, Item.none);
    }

    if (!equip(targetSlot, item)) {
      return false;
    }
    if (lock) {
      this.pendingEquip.set(targetSlot, item);
      this.excluded.delete(item);
      if (targetSlot === $slot`off-hand`) {
        this.forceOneHanded = true;
      }
      this.disabledSlots.add(targetSlot);
    }
    return true;
  }

  toString(): string {
    const terms: string[] = [];

    for (const [name, amount] of this.weights) terms.push(`${amount}${name}`);
    for (const [name, amount] of this.mins) terms.push(`${name} ${amount}min`);
    for (const [name, amount] of this.maxes) terms.push(`${name} ${amount}max`);
    for (const item of this.excluded) terms.push(`-"equip ${item}"`);
    for (const slot of this.disabledSlots) terms.push(`-${slot}`);
    if (this.forceOneHanded) terms.push("1hand");
    terms.push(...this.custom);

    for (const [item, amount] of this.pendingBonus) {
      const itemModes = this.modes.get(item);
      if (!itemModes || itemModes.size === 0) {
        terms.push(`+${amount}"bonus ${item}"`);
        continue;
      }
      for (const value of itemModes) {
        terms.push(`+${amount}"bonus ${item} (${value})"`);
      }
    }

    for (const item of this.pendingEquip.values()) {
      if (item === Item.none) {
        continue;
      }
      const itemModes = this.modes.get(item);
      if (!itemModes || itemModes.size === 0) {
        terms.push(`+"equip ${item}"`);
        continue;
      }
      if (itemModes.size > 1) {
        abort(
          `Maximizer: multiple modes queued for ${item} (${[...itemModes].join(", ")}), but equipping can only force one.`,
        );
      }
      terms.push(`+"equip ${item} (${[...itemModes][0]})"`);
    }

    return terms.join(",");
  }

  // equipScope -1 = EQUIP_NOW
  maximize(): void {
    maximize(this.toString(), 2500, 0, -1, "equip");
  }

  simulate(): Map<Slot, Item> {
    const result = new Map<Slot, Item>();
    let weaponPicked = false;
    let offhandPicked = false;

    // equipScope 0 = SPECULATE_INVENTORY
    for (const entry of maximize(this.toString(), 0, 0, 0, "equip")) {
      const text = entry.display;
      if (containsText(text, "unequip ")) {
        continue;
      }
      const isKeep = entry.command === "" && containsText(text, "keep ");
      if (!containsText(text, "equip ") && !isKeep) {
        continue;
      }

      const item = entry.item;
      if (item === Item.none) {
        continue;
      }
      let slot = toSlot(item);
      if (slot === Slot.none) {
        continue;
      }

      if (slot === $slot`weapon`) {
        if (weaponPicked) {
          if (
            !offhandPicked &&
            haveSkill($skill`Double-Fisted Skull Smashing`) &&
            weaponType(item) ===
              weaponType(result.get($slot`weapon`) ?? Item.none) &&
            itemType(item) !== "chefstaff"
          ) {
            slot = $slot`off-hand`;
            offhandPicked = true;
          } else if (
            myFamiliar() === $familiar`Disembodied Hand` &&
            weaponHands(item) === 1 &&
            itemType(item) !== "chefstaff" &&
            itemType(item) !== "accordion"
          ) {
            slot = $slot`familiar`;
          } else {
            continue;
          }
        } else {
          weaponPicked = true;
          if (weaponHands(item) > 1) {
            offhandPicked = true;
          }
        }
      } else if (slot === $slot`off-hand`) {
        if (offhandPicked) {
          if (myFamiliar() === $familiar`Left-Hand Man`) {
            slot = $slot`familiar`;
          } else {
            continue;
          }
        } else {
          offhandPicked = true;
        }
      } else if (
        slot === $slot`acc1` &&
        (result.get($slot`acc1`) ?? Item.none) !== Item.none
      ) {
        slot =
          (result.get($slot`acc2`) ?? Item.none) !== Item.none
            ? $slot`acc3`
            : $slot`acc2`;
      }

      if ((result.get(slot) ?? Item.none) !== Item.none) {
        continue;
      }
      result.set(slot, item);
    }

    return result;
  }

  dispose(): void {
    // Disposes this maximizer, called each turn.
    if (maximizer !== this) return;

    maximizer = new Maximizer();
  }
}

export let maximizer: Maximizer = new Maximizer();
