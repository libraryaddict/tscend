import {
  booleanModifier,
  currentMcd,
  equip,
  equippedAmount,
  equippedItem,
  Familiar,
  haveEffect,
  haveSkill,
  Item,
  itemType,
  lastMaximizerSucceeded,
  maximize,
  Modifier,
  myBasestat,
  myFamiliar,
  myLocation,
  numericModifier,
  numericsModifier,
  outfitPieces,
  Slot,
  Stat,
  stringModifier,
  stringsModifier,
  toSlot,
  weaponHands,
  weaponType,
} from "kolmafia";
import { $familiar, $item, $skill, $slot, get, getActiveEffects } from "libram";

import { auto_abort, auto_log_debug, auto_log_info } from "./auto_log";
import {
  AllMaximizerModifier,
  MAXIMIZER_ALIASES,
  UnweightMaximizerModifier,
  WeightedMaximizerModifier,
} from "./modifiers";

export type Criterion = Modifier | WeightedMaximizerModifier;

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

function mapsEqual<K, V>(a: Map<K, V>, b: Map<K, V>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (!b.has(key) || b.get(key) !== value) return false;
  }
  return true;
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function modesEqual(
  a: Map<Item, Set<string>>,
  b: Map<Item, Set<string>>,
): boolean {
  if (a.size !== b.size) return false;
  for (const [item, values] of a) {
    const otherValues = b.get(item);
    if (!otherValues || !setsEqual(values, otherValues)) return false;
  }
  return true;
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
  // items that were forceEquip()'d with lock=true; must still be equipped after maximize()
  private readonly forcedSlots = new Map<Slot, Item>();
  private readonly pendingBonus = new Map<Item, number>();
  private readonly modes = new Map<Item, Set<string>>();
  private readonly otherRequirements = new Map<AllMaximizerModifier, boolean>();

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
        this.forcedSlots.delete(slot);
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

  has(text: Slot | Criterion | UnweightMaximizerModifier | Item): boolean {
    if (text instanceof Slot) {
      return (
        this.onlySlots.has(text) ||
        this.disabledSlots.has(text) ||
        this.forcedSlots.has(text)
      );
    } else if (text instanceof Item) {
      return (
        this.pendingBonus.has(text) ||
        [...this.pendingEquip.values()].includes(text)
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
    copyMap(from.forcedSlots, this.forcedSlots);
    copyMap(from.pendingBonus, this.pendingBonus);
    copyMap(from.otherRequirements, this.otherRequirements);
    this.modes.clear();
    for (const [item, itemModes] of from.modes) {
      this.modes.set(item, new Set(itemModes));
    }
  }

  equals(other: Maximizer): boolean {
    return (
      mapsEqual(this.weights, other.weights) &&
      mapsEqual(this.mins, other.mins) &&
      mapsEqual(this.maxes, other.maxes) &&
      setsEqual(this.excluded, other.excluded) &&
      setsEqual(this.disabledSlots, other.disabledSlots) &&
      setsEqual(this.onlySlots, other.onlySlots) &&
      setsEqual(this.switchFamiliars, other.switchFamiliars) &&
      setsEqual(this.custom, other.custom) &&
      mapsEqual(this.pendingEquip, other.pendingEquip) &&
      mapsEqual(this.forcedSlots, other.forcedSlots) &&
      mapsEqual(this.pendingBonus, other.pendingBonus) &&
      mapsEqual(this.otherRequirements, other.otherRequirements) &&
      modesEqual(this.modes, other.modes)
    );
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

  // queues intent to equip; doesn't touch worn equipment until maximize()/simulate() runs
  equip(item: Item, slot?: Slot): boolean {
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

  // unlike has(), also checks nothing is already queued for this slot
  slotAvailable(slot: Slot): boolean {
    return this.pending(slot) === $item.none && !this.has(slot);
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

  // item === none disables the slot (lock excludes it from maximize() too); otherwise, lock
  // queues the item as a hard requirement for the real maximize() to place, aborting if it
  // doesn't end up equipped, while unlocked is a one-off manual equip outside the maximizer.
  forceEquip(item: Item, slot: Slot, lock: boolean = true): boolean {
    if (item === $item.none) {
      const ok = equip(slot, item);
      if (lock) {
        this.pendingEquip.delete(slot);
        this.forcedSlots.delete(slot);
        this.disabledSlots.add(slot);
      }
      return ok;
    }

    if (!lock) {
      if (
        slot === $slot`off-hand` &&
        weaponHands(equippedItem($slot`weapon`)) > 1
      ) {
        equip($slot`weapon`, $item.none);
      }
      return equip(slot, item);
    }

    this.lockEquip(item, slot);
    return this.maximize();
  }

  // hard requirement for the next maximize(), which is left to the caller to run
  lockEquip(item: Item, slot: Slot): void {
    // equip() drops any conflicting weapon/off-hand pending entry for us
    this.equip(item, slot);
    this.excluded.delete(item);
    this.forcedSlots.set(slot, item);
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
      pushBonusTerm(item, amount);
    }

    for (const item of this.pendingEquip.values()) {
      if (item === $item.none) {
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

    return terms.join(", ");
  }

  // Generated:_spec still holds the last speculation, so an identical one can be skipped
  speculate(): boolean {
    const statement = this.toString();
    const accountState = generateAccountState("speculate");
    if (
      lastSpeculation.statement === statement &&
      lastSpeculation.accountState === accountState
    ) {
      auto_log_debug("Maximizer: skipping speculate(), nothing changed");
      return lastSpeculation.result;
    }

    const result = maximize(statement, true);
    lastSpeculation = { statement, accountState, result };
    return result;
  }

  // equipScope -1 = EQUIP_NOW
  maximize(): boolean {
    lastSpeculation = NO_SPECULATION;
    const accountState = generateAccountState("maximize");
    if (!shouldInvokeMaximizer(this, accountState)) {
      auto_log_debug("Maximizer: skipping maximize(), nothing changed");
      return true;
    }

    maximize(this.toString(), 2500, 0, -1, "equip");

    for (const [slot, item] of this.forcedSlots) {
      // maximize() only takes "equip <item>", so a one-handed weapon can land in the off-hand
      if (slot === $slot`weapon` && equippedItem(slot) !== item) {
        equip(slot, item);
      }
      const lost =
        slot === $slot`weapon`
          ? equippedItem(slot) !== item
          : equippedAmount(item) === 0;
      if (lost) {
        auto_abort(
          `Maximizer: forced item ${item} (slot ${slot}) is no longer equipped after maximize().`,
        );
      }
    }

    lastMaximizerInvocation = {
      maximizer: this.clone(),
      accountState: generateAccountState("maximize"),
    };
    return lastMaximizerSucceeded();
  }

  simulate(): Map<Slot, Item> {
    lastSpeculation = NO_SPECULATION;
    const result = new Map<Slot, Item>();
    let weaponPicked = false;
    let offhandPicked = false;

    // equipScope 0 = SPECULATE_INVENTORY
    for (const entry of maximize(this.toString(), 0, 0, 0, "equip")) {
      const text = entry.display;
      if (text.includes("unequip ")) {
        continue;
      }
      const isKeep = entry.command === "" && text.includes("keep ");
      if (!text.includes("equip ") && !isKeep) {
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

let lastMaximizerInvocation: { maximizer: Maximizer; accountState: string } = {
  maximizer: new Maximizer(),
  accountState: "",
};

const NO_SPECULATION = {
  statement: "",
  accountState: "",
  result: false,
};

let lastSpeculation: {
  statement: string;
  accountState: string;
  result: boolean;
} = NO_SPECULATION;

// anything else that writes Generated:_spec must call this, or speculate() will trust stale data
export function clearSpeculation(): void {
  lastSpeculation = NO_SPECULATION;
}

function generateAccountState(calledBy: string): string {
  return `${calledBy}|${Slot.all()
    .map((s) => `${s}:${equippedItem(s)}`)
    .join(
      ",",
    )}|${get("_concoctionDatabaseRefreshes")}|${currentMcd()}|${getActiveEffects()
    .map((e) => `${e}:${haveEffect(e)}`)
    .join(",")}|${myLocation()}|${Stat.all()
    .map((s) => myBasestat(s))
    // Yes, the modifier thing is dumb, but it's a catchall!
    .join(",")}|${Modifier.all()
    .map((m) => modifierValue(m))
    .join(",")}`;
}

function modifierValue(modifier: Modifier): unknown {
  switch (modifier.type) {
    case "boolean":
      return booleanModifier(modifier);
    case "string":
      return stringModifier(modifier);
    case "multinumeric":
      return numericsModifier(modifier);
    case "multistring":
      return stringsModifier(modifier);
    case "numeric":
      return numericModifier(modifier);
    default:
      return "???";
  }
}

function shouldInvokeMaximizer(
  maximizer: Maximizer,
  accountState: string,
): boolean {
  return (
    lastMaximizerInvocation.accountState !== accountState ||
    !maximizer.equals(lastMaximizerInvocation.maximizer)
  );
}
