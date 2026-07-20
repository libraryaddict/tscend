import { abort, Effect, Item, Modifier, numericModifier } from "kolmafia";

// familiar, int, item, effect, location defined. Define the rest at some point.
//	All lists have the construct type[int] and are 0-indexed, like nature intended.
//	Types: familiar, item
// 	Replace TYPE with types above
//	TYPE[int] TYPEList();							Empty List Construction
//	TYPE[int] List(boolean[TYPE]);					Create from existing map
//	TYPE[int] List(TYPE[int]);						Create from existing int map
//	TYPE[int] ListRemove(TYPE[int], TYPE);			Remove all elements matching what
//	TYPE[int] ListRemove(TYPE[int], TYPE, int);		Remove all elements matching what, starting from index
//	TYPE[int] ListErase(TYPE[int], int);			Remove element at index
//	TYPE[int] ListInsertFront(TYPE[int], TYPE);		Insert at start of list
//	TYPE[int] ListInsert(TYPE[int], TYPE);			Insert at end of list
//	TYPE[int] ListInsertAt(TYPE[int], TYPE, int);	Insert at a given index, push all elements at index forward
//	TYPE[int] ListInsertInorder(TYPE[int], TYPE);	Insert inorder based on string value, assumes invariant
//	int ListFind(TYPE[int], TYPE);					Returns location of element, -1 otherwise
//	int ListFind(TYPE[int], TYPE, int);				Returns location of element, -1 otherwise, starting from index
//	ListOutput(TYPE[int]);							Prints a comma-separated version of the list
// Default Constructors

//Defined in autoscend/auto_list.ash

// Explicit Constructors (from map boolean[type])

// Explicit Constructors (from map type[int])

// Searching

// Removal element/index

// Insertion head/tail/at/inorder

// Printer

// start of int[int]

//End of int[int]
//start of item[int]

export function itemList(): Map<number, Item> {
  const retval: Map<number, Item> = new Map();
  return retval;
}

export function List$8(data: Map<number, Item>): Map<number, Item> {
  const retval: Map<number, Item> = new Map();

  let temp: Map<number, Item> = new Map();
  for (const [idx, el] of data) {
    temp.set(idx, el);
  }
  temp = new Map([...temp.entries()].sort((a, b) => a[0] - b[0]));

  let index: number = 0;
  for (const [, el] of temp) {
    retval.set(index, el);
    index = index + 1;
  }

  return retval;
}

export function ListInsert(
  list: Map<number, Item>,
  what: Item,
): Map<number, Item> {
  const retval: Map<number, Item> = List$8(list);
  retval.set(retval.size, what);
  return List$8(retval);
}

//end of item[int]
//start of effect[int]

export function List$1(data: Map<Effect, boolean>): Map<number, Effect> {
  const retval: Map<number, Effect> = new Map();
  let index: number = 0;

  for (const el of data.keys()) {
    retval.set(index, el);
    index = index + 1;
  }
  return retval;
}

function List$5(data: Map<number, Effect>): Map<number, Effect> {
  const retval: Map<number, Effect> = new Map();

  let temp: Map<number, Effect> = new Map();
  for (const [idx, el] of data) {
    temp.set(idx, el);
  }
  temp = new Map([...temp.entries()].sort((a, b) => a[0] - b[0]));

  let index: number = 0;
  for (const [, el] of temp) {
    retval.set(index, el);
    index = index + 1;
  }

  return retval;
}

export function ListFind(
  list: Map<number, Effect>,
  what: Effect,
  idx: number = 0,
): number {
  if (idx < 0) {
    abort(`Attempted index out of bounds: ${idx}`);
  }
  const retval: Map<number, Effect> = List$5(list);
  let at: number = idx;
  while (at < retval.size) {
    if (what === (retval.get(at) ?? retval.set(at, Effect.none).get(at))) {
      return at;
    }
    at = at + 1;
  }
  return -1;
}

//end of effect[int]
//start of location[int]

// Sorting.
// Uses boolean[TYPE] to allow use on Mafia list types eg $items[]

// Handy sorts of lists
export function auto_sortedByModifier(
  map: Map<Item, number>,
  m: Modifier,
): Map<number, Item> {
  return auto_sortedByModifier$1(map, m, true);
}

function auto_sortedByModifier$1(
  map: Map<Item, number>,
  m: Modifier,
  high_to_low: boolean,
): Map<number, Item> {
  let ranked_list: Map<number, Item> = new Map();
  for (const entry of map.keys()) {
    ranked_list.set(ranked_list.size, entry);
  }
  // Sort
  const sign: number = high_to_low ? -1 : 1;
  ranked_list = new Map(
    [...ranked_list.entries()]
      .map(([index, value]) => {
        return {
          _k: index,
          _v: value,
          _expr: sign * numericModifier(value, m),
        };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  return ranked_list;
}

export function auto_sortedByModifier$3(
  map: Map<Item, boolean>,
  m: Modifier,
  high_to_low: boolean,
): Map<number, Item> {
  const int_map: Map<Item, number> = new Map();
  for (const entry of map.keys()) {
    int_map.set(entry, (int_map.get(entry) ?? 0) + 1);
  }
  return auto_sortedByModifier$1(int_map, m, high_to_low);
}
