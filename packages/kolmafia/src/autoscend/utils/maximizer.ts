import {
  containsText,
  equip,
  equippedItem,
  Familiar,
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
import { $familiar, $item, $skill, $slot } from "libram";

import { auto_abort, auto_log_info } from "../auto_util";
import {
  AllMaximizerModifier,
  MAXIMIZER_ALIASES,
  UnweightMaximizerModifier,
  WeightedMaximizerModifier,
} from "./modifiers";

export type Criterion = Modifier | WeightedMaximizerModifier;

// Implemented by IOTMs that hold several sub-items which should score and
// equip as one (e.g. gems socketed into the Eternity Codpiece). sources() and
// slots() are queried live, so returning [] is how a registrant goes inactive.
export interface SlotContainer {
  name(): string;
  containerHolder(): Item;
  holdableItems(): Item[];
  slots(): readonly Slot[];
}

function criterionName(mod: Criterion | AllMaximizerModifier): string {
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
  private readonly onlySlots = new Set<Slot>();
  private readonly switchFamiliars = new Set<Familiar>();
  private readonly custom = new Set<string>();
  private readonly pendingEquip = new Map<Slot, Item>();
  private readonly pendingBonus = new Map<Item, number>();
  private readonly modes = new Map<Item, Set<string>>();
  private readonly otherRequirements = new Map<AllMaximizerModifier, boolean>();
  private readonly slotContainers: SlotContainer[] = [];

  getWeight(mod: Criterion): number {
    return this.weights.get(criterionName(mod)) ?? 0;
  }

  weight(mod: Criterion, amount: number = 1, add: boolean = false): this {
    const name = criterionName(mod);

    if (this.weights.has(name) && add) {
      auto_log_info(
        `Adding maximizer weight ${name}: ${this.weights.get(name)} + ${amount} = ${this.weights.get(name)! + amount}`,
      );
      this.weights.set(name, (this.weights.get(name) ?? 0) + amount);
    } else {
      if (this.weights.has(name) && this.weights.get(name) !== amount) {
        auto_log_info(
          `Overwriting maximizer weight for ${name}: ${this.weights.get(name)} => ${amount}`,
        );
      }
      this.weights.set(name, amount);
    }

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

  getMax(mod: Criterion): number | undefined {
    return this.maxes.get(criterionName(mod));
  }

  bonus(item: Item, amount: number, add: boolean = false): this {
    if (this.pendingBonus.has(item) && add) {
      auto_log_info(
        `Adding maximizer bonus ${item}: ${this.pendingBonus.get(item)} + ${amount} = ${this.pendingBonus.get(item)! + amount}`,
      );
      this.pendingBonus.set(item, (this.pendingBonus.get(item) ?? 0) + amount);
    } else {
      if (
        this.pendingBonus.has(item) &&
        this.pendingBonus.get(item) !== amount
      ) {
        auto_log_info(
          `Overwriting maximizer bonus for ${item}: ${this.pendingBonus.get(item)} => ${amount}`,
        );
      }
      this.pendingBonus.set(item, amount);
    }
    return this;
  }

  exclude(item: Item): this {
    this.excluded.add(item);

    return this;
  }

  include(item: Item): this {
    this.excluded.delete(item);

    return this;
  }

  cancelEquip(item: Item): this {
    for (const [slot, pending] of this.pendingEquip) {
      if (pending === item) {
        this.pendingEquip.delete(slot);
        break;
      }
    }

    return this;
  }

  excludeSlot(slot: Slot): this {
    this.disabledSlots.add(slot);

    return this;
  }

  requireSlot(slot: Slot): this {
    this.onlySlots.add(slot);

    return this;
  }

  allowSwitch(familiar: Familiar): this {
    this.switchFamiliars.add(familiar);

    return this;
  }

  require(
    modifier: UnweightMaximizerModifier,
    wantsThis: boolean = true,
  ): this {
    this.otherRequirements.set(modifier, wantsThis);

    return this;
  }

  clearWeight(mod: Criterion): this {
    this.weights.delete(criterionName(mod));

    return this;
  }

  clearMin(mod: Criterion): this {
    this.mins.delete(criterionName(mod));

    return this;
  }

  clearMax(mod: Criterion): this {
    this.maxes.delete(criterionName(mod));

    return this;
  }

  // KoLmafia maximizer debug/verbosity directive
  debugDump(): this {
    return this.weight("Dump", 2);
  }

  // bonus() scores every queued mode; equip aborts if more than one is queued
  mode<T extends ModeableItemName>(name: T, value: ModesByItem[T]): this {
    const item = Item.get(name);
    const existing = this.modes.get(item) ?? new Set<string>();
    existing.add(value);
    this.modes.set(item, existing);
    return this;
  }

  hasBonus(item: Item): boolean {
    return this.pendingBonus.has(item);
  }

  getBonus(item: Item): number {
    return this.pendingBonus.get(item) ?? 0;
  }

  clearBonus(item: Item): this {
    this.pendingBonus.delete(item);
    return this;
  }

  // Called once before anything else queues a bonus()/equip()
  registerSlotContainer(container: SlotContainer): this {
    // If not registered yet
    if (this.slotContainers.every((c) => c.name() !== container.name())) {
      this.slotContainers.push(container);
    }
    return this;
  }

  private getOwnableContainer(item: Item): SlotContainer | undefined {
    return this.slotContainers.find((container) =>
      container.holdableItems().includes(item),
    );
  }

  isContainableItem(item: Item): boolean {
    return this.getOwnableContainer(item) !== undefined;
  }

  has(text: Slot | Criterion | UnweightMaximizerModifier | Item): boolean {
    if (text instanceof Slot) {
      return this.onlySlots.has(text) || this.disabledSlots.has(text);
    } else if (text instanceof Item) {
      return (
        this.pendingBonus.has(text) ||
        this.pendingEquip.values().find((a) => a === text) !== undefined
      );
    }

    return (
      this.weights.has(criterionName(text)) ||
      (typeof text === "string" && this.otherRequirements.has(text))
    );
  }

  private raw(fragment: string): this {
    this.custom.add(fragment);
    return this;
  }

  // Escape hatch for maximizer_parser.ts only; do not call from application logic.
  applyRawFallback(fragment: string): this {
    return this.raw(fragment);
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
    copySet(from.onlySlots, this.onlySlots);
    copySet(from.switchFamiliars, this.switchFamiliars);
    copySet(from.custom, this.custom);
    copyMap(from.pendingEquip, this.pendingEquip);
    copyMap(from.pendingBonus, this.pendingBonus);
    copyMap(from.otherRequirements, this.otherRequirements);
    this.slotContainers.length = 0;
    this.slotContainers.push(...from.slotContainers);
    this.modes.clear();
    for (const [item, itemModes] of from.modes) {
      this.modes.set(item, new Set(itemModes));
    }
  }

  wearOutfit(outfitName: string): this {
    for (const item of outfitPieces(outfitName)) {
      this.equip(item);
    }
    return this;
  }

  // toSlot() always resolves accessories to acc1; pick the first slot not already pending
  private firstOpenAccessorySlot(): Slot {
    return (
      [$slot`acc1`, $slot`acc2`, $slot`acc3`].find(
        (accSlot) => this.pending(accSlot) === $item.none,
      ) ?? $slot`acc1`
    );
  }

  private firstOpenContainerSlot(container: SlotContainer): Slot | undefined {
    const slots = container.slots();
    return slots.find((s) => this.pending(s) === $item.none);
  }

  // Contained items (e.g. codpiece gems) have no gear slot of their own; they can
  // only be queued once their container is holderReady, then get parked in one
  // of the container's slots. If the container can't be readied, this returns
  // false and the caller falls back to equipping the item on its own.
  private tryContainerEquip(
    item: Item,
    slot: Slot | undefined,
    holderReady: (holder: Item) => boolean,
  ): boolean {
    if (slot) {
      return false;
    }
    const container = this.getOwnableContainer(item);
    const containerSlot = container && this.firstOpenContainerSlot(container);
    if (
      !container ||
      !containerSlot ||
      !holderReady(container.containerHolder())
    ) {
      return false;
    }
    this.pendingEquip.set(containerSlot, item);
    return true;
  }

  // queues intent to equip; doesn't touch worn equipment until maximize()/simulate() runs
  equip(item: Item, slot?: Slot): boolean {
    if (
      this.tryContainerEquip(
        item,
        slot,
        (holder) => this.willEquip(holder) || this.equip(holder),
      )
    ) {
      return true;
    }
    let targetSlot = slot ?? toSlot(item);
    if (targetSlot === $slot.none) {
      return false;
    }
    if (targetSlot === $slot`acc1` && slot === undefined) {
      targetSlot = this.firstOpenAccessorySlot();
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
    return this.pendingEquip.get(slot) ?? $item.none;
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

  // holder is ready if it was already forceEquip()'d and locked into place
  private isForceLocked(item: Item): boolean {
    return [...this.pendingEquip].some(
      ([slotUsed, pending]) =>
        pending === item && this.disabledSlots.has(slotUsed),
    );
  }

  // equips immediately; unless lock is false, also locks the slot so maximize() won't override it
  forceEquip(item: Item, slot?: Slot, lock: boolean = true): boolean {
    if (item === $item.none) {
      return equip(slot ?? $slot.none, item);
    }

    if (
      this.tryContainerEquip(
        item,
        slot,
        (holder) =>
          this.isForceLocked(holder) ||
          this.forceEquip(holder, undefined, lock),
      )
    ) {
      return true;
    }

    let targetSlot = slot ?? toSlot(item);
    if (targetSlot === $slot.none) {
      return false;
    }
    if (targetSlot === $slot`acc1` && slot === undefined) {
      targetSlot = this.firstOpenAccessorySlot();
    }

    if (
      targetSlot === $slot`off-hand` &&
      weaponHands(equippedItem($slot`weapon`)) > 1
    ) {
      if (lock) {
        this.pendingEquip.delete($slot`weapon`);
      }
      equip($slot`weapon`, $item.none);
    }

    if (!equip(targetSlot, item)) {
      return false;
    }
    if (lock) {
      this.pendingEquip.set(targetSlot, item);
      this.excluded.delete(item);
      if (targetSlot === $slot`off-hand`) {
        this.otherRequirements.set("1 Handed", true);
      }
      this.disabledSlots.add(targetSlot);
    }
    return true;
  }

  toString(): string {
    const terms: string[] = [];

    for (const [name, amount] of this.weights) {
      const displayName = MAXIMIZER_ALIASES[name] ?? name;
      let term = `${amount !== 1 ? `${amount} ` : ""}${displayName}`;
      const min = this.mins.get(name);
      const max = this.maxes.get(name);
      if (min !== undefined) term += ` ${min} min`;
      if (max !== undefined) term += ` ${max} max`;
      terms.push(term);
    }
    for (const item of this.excluded) terms.push(`-"equip ${item}"`);
    for (const slot of this.disabledSlots) terms.push(`-${slot}`);
    for (const slot of this.onlySlots) terms.push(`+${slot}`);
    for (const familiar of this.switchFamiliars) {
      terms.push(`switch ${familiar}`);
    }
    for (const [term, wantsThis] of this.otherRequirements) {
      terms.push(`${wantsThis ? `` : "-"}${MAXIMIZER_ALIASES[term] ?? term}`);
    }
    terms.push(...this.custom);

    const containerHolders = new Set<Item>();
    const containerGems = new Set<Item>();
    for (const container of this.slotContainers) {
      containerHolders.add(container.containerHolder());
      container.holdableItems().forEach((i) => containerGems.add(i));
    }

    // Only gems actually parked in a container's own slots this turn (not merely
    // container-managed) should be withheld from their own "+equip" term below -
    // one that lost the socket race falls back to a real gear slot and still needs it.
    const socketedGems = new Set<Item>();
    for (const container of this.slotContainers) {
      for (const slot of container.slots()) {
        const socketed = this.pending(slot);
        if (socketed !== $item.none) {
          socketedGems.add(socketed);
        }
      }
    }

    const pushBonusTerm = (item: Item, amount: number): void => {
      const itemModes = this.modes.get(item);
      if (!itemModes || itemModes.size === 0) {
        terms.push(`+${amount}"bonus ${item}"`);
        return;
      }
      for (const value of itemModes) {
        terms.push(`+${amount}"bonus ${item} (${value})"`);
      }
    };

    for (const [item, amount] of this.pendingBonus) {
      if (containerHolders.has(item) || containerGems.has(item)) {
        continue;
      }
      pushBonusTerm(item, amount);
    }

    for (const container of this.slotContainers) {
      const target = container.containerHolder();
      const totalBonus = container
        .holdableItems()
        .reduce(
          (sum, source) => sum + (this.pendingBonus.get(source) ?? 0),
          this.pendingBonus.get(target) ?? 0,
        );
      if (totalBonus <= 0) {
        continue;
      }
      pushBonusTerm(target, totalBonus);
    }

    for (const item of this.pendingEquip.values()) {
      if (
        item === $item.none ||
        containerHolders.has(item) ||
        socketedGems.has(item)
      ) {
        continue;
      }
      const itemModes = this.modes.get(item);
      if (!itemModes || itemModes.size === 0) {
        terms.push(`+"equip ${item}"`);
        continue;
      }
      if (itemModes.size > 1) {
        auto_abort(
          `Maximizer: multiple modes queued for ${item} (${[...itemModes].join(", ")}), but equipping can only force one.`,
        );
      }
      terms.push(`+"equip ${item} (${[...itemModes][0]})"`);
    }

    for (const container of this.slotContainers) {
      const target = container.containerHolder();
      const wantsEquip =
        this.willEquip(target) ||
        container.holdableItems().some((source) => this.willEquip(source));
      if (wantsEquip) {
        terms.push(`+"equip ${target}"`);
      }
    }

    return terms.join(", ");
  }

  // equipScope -1 = EQUIP_NOW
  maximize(): boolean {
    maximize(this.toString(), 2500, 0, -1, "equip");
    return true;
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
      if (item === $item.none) {
        continue;
      }
      let slot = toSlot(item);
      if (slot === $slot.none) {
        continue;
      }

      if (slot === $slot`weapon`) {
        if (weaponPicked) {
          if (
            !offhandPicked &&
            haveSkill($skill`Double-Fisted Skull Smashing`) &&
            weaponType(item) ===
              weaponType(result.get($slot`weapon`) ?? $item.none) &&
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
        (result.get($slot`acc1`) ?? $item.none) !== $item.none
      ) {
        slot =
          (result.get($slot`acc2`) ?? $item.none) !== $item.none
            ? $slot`acc3`
            : $slot`acc2`;
      }

      if ((result.get(slot) ?? $item.none) !== $item.none) {
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
