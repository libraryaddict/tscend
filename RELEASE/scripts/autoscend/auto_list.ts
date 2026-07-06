import { Effect, Familiar, Item, Location, Modifier, abort, numericModifier } from "kolmafia";
import { auto_log_info } from "./auto_util";

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
export function List(): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = new Map();
	return retval;
}

// Explicit Constructors (from map boolean[type])
export function List$2(data: Map<Familiar, boolean>): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = new Map();
	let index: number = 0;

	for (let el of data.keys())
	{
		retval.set(index, el);
		index = index + 1;
	}
	return retval;
}

// Explicit Constructors (from map type[int])
export function List$6(data: Map<number, Familiar>): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = new Map();
	//To handle constants if they are passed by const
	let temp: Map<number, Familiar> = new Map();
	for (let [idx, el] of data)
	{
		temp.set(idx, el);
	}
	temp = new Map(
		[...temp.entries()]
			.sort((a, b) => a[0] - b[0])
	);

	let index: number = 0;
	for (let [idx, el] of temp)
	{
		retval.set(index, el);
		index = index + 1;
	}

	return retval;
}

// Searching
export function ListFind$2(list: Map<number, Familiar>, what: Familiar): number
{
	return ListFind$3(list, what, 0);
}

export function ListFind$3(list: Map<number, Familiar>, what: Familiar, idx: number): number
{
	if (idx < 0)
	{
		abort(`Attempted index out of bounds: ${idx}`);
	}
	let retval: Map<number, Familiar> = List$6(list);
	let at: number = idx;
	while (at < retval.size)
	{
		if (what === (retval.get(at) ?? retval.set(at, Familiar.none).get(at)))
		{
			return at;
		}
		at = at + 1;
	}
	return -1;
}


// Removal element/index
export function ListRemove$2(list: Map<number, Familiar>, what: Familiar): Map<number, Familiar>
{
	return ListRemove$3(list, what, 0);
}

export function ListRemove$3(list: Map<number, Familiar>, what: Familiar, idx: number): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = List$6(list);
	for (let [at, el] of retval)
	{
		if (el === what && at >= idx)
		{
			retval.delete(at);
		}
	}
	return List$6(retval);
}

export function ListErase$1(list: Map<number, Familiar>, index: number): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = List$6(list);
	retval.delete(index);
	return List$6(retval);
}

// Insertion head/tail/at/inorder
export function ListInsertFront$1(list: Map<number, Familiar>, what: Familiar): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = List$6(list);
	retval.set(-1, what);
	return List$6(retval);
}

export function ListInsert$1(list: Map<number, Familiar>, what: Familiar): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = List$6(list);
	retval.set(retval.size, what);
	return List$6(retval);
}

export function ListInsertAt$1(list: Map<number, Familiar>, what: Familiar, idx: number): Map<number, Familiar>
{
	if (idx < 0 || idx >= list.size)
	{
		abort(`List index ${idx} out of bounds: ${list.size}`);
	}
	let retval: Map<number, Familiar> = List$6(list);
	let shift: number = retval.size;
	while (shift > idx)
	{
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Familiar.none).get(shift - 1)));
		shift = shift - 1;
	}
	retval.set(idx, what);
	return retval;
}

export function ListInsertInorder$1(list: Map<number, Familiar>, what: Familiar): Map<number, Familiar>
{
	let retval: Map<number, Familiar> = List$6(list);
	if (what.toString() < (retval.get(0) ?? retval.set(0, Familiar.none).get(0)).toString())
	{
		return ListInsertAt$1(list, what, 0);
	}
	let shift: number = retval.size;
	while (shift > 0)
	{
		if (what.toString() > (retval.get(shift - 1) ?? retval.set(shift - 1, Familiar.none).get(shift - 1)).toString())
		{
			retval.set(shift, what);
			return retval;
		}
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Familiar.none).get(shift - 1)));
		shift = shift - 1;
	}
	if (shift === 0)
	{
		abort("Inorder Insertion Failure");
	}
	return retval;
}

// Printer
export function ListOutput$1(list: Map<number, Familiar>): string
{
	let retval: string = "";
	if (list.size > 0)
	{
		retval = (list.get(0) ?? list.set(0, Familiar.none).get(0)).toString();
		let index: number = 1;
		while (index < list.size)
		{
			retval = `${retval}, ${(list.get(index) ?? list.set(index, Familiar.none).get(index)).toString()}`;
			index = index + 1;
		}
	}

	return retval;
}


export function main$auto_list(): void
{
	let test: Map<Familiar, boolean> = new Map([[Familiar.get("Slimeling"), true], [Familiar.get("Puck Man"), true], [Familiar.get("Baby Gravy Fairy"), true], [Familiar.get("Intergnat"), true], [Familiar.get("Mosquito"), true]]);
	let list: Map<number, Familiar> = List$2(test);

	auto_log_info("First list", "green");
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Deleting Baby Gravy Fairy, (2)", "green");
	list = ListRemove$2(list, Familiar.get("Baby Gravy Fairy"));
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Deleting Element 1 (Puck Man)", "green");
	list = ListErase$1(list, 1);
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting at Front (Exotic Parrot)", "green");
	list = ListInsertFront$1(list, Familiar.get("Exotic Parrot"));
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting at End (Leprechaun)", "green");
	list = ListInsert$1(list, Familiar.get("Leprechaun"));
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting at 2 (Artistic Goth Kid)", "green");
	list = ListInsertAt$1(list, Familiar.get("Artistic Goth Kid"), 2);
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting at 0 (Artistic Goth Kid)", "green");
	list = ListInsertAt$1(list, Familiar.get("Artistic Goth Kid"), 0);
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting inorder weirdness (Bulky Buddy Box)", "green");
	list = ListInsertInorder$1(list, Familiar.get("Bulky Buddy Box"));
	auto_log_info(ListOutput$1(list), "blue");

	auto_log_info("Inserting inorder weirdness (Xiblaxian Holo-Companion)", "green");
	list = ListInsertInorder$1(list, Familiar.get("Xiblaxian Holo-Companion"));
	auto_log_info(ListOutput$1(list), "blue");

	let index: number = 0;
	while (index < list.size)
	{
		auto_log_info(`${index}: ${(list.get(index) ?? list.set(index, Familiar.none).get(index))}: ${ListFind$2(list, (list.get(index) ?? list.set(index, Familiar.none).get(index)))}`, "blue");
		index = index + 1;
	}
	auto_log_info(`${3}: ${(list.get(3) ?? list.set(3, Familiar.none).get(3))}: ${ListFind$3(list, (list.get(3) ?? list.set(3, Familiar.none).get(3)), 1)}`, "blue");
	auto_log_info(`${3}: ${(list.get(3) ?? list.set(3, Familiar.none).get(3))}: ${ListFind$3(list, (list.get(3) ?? list.set(3, Familiar.none).get(3)), 2)}`, "blue");
	auto_log_info(`${3}: ${(list.get(3) ?? list.set(3, Familiar.none).get(3))}: ${ListFind$3(list, (list.get(3) ?? list.set(3, Familiar.none).get(3)), 3)}`, "blue");
	auto_log_info(`${3}: ${(list.get(3) ?? list.set(3, Familiar.none).get(3))}: ${ListFind$3(list, (list.get(3) ?? list.set(3, Familiar.none).get(3)), 4)}`, "blue");
}
// start of int[int]

export function intList(): Map<number, number>
{
	let retval: Map<number, number> = new Map();
	return retval;
}

export function List$3(data: Map<number, boolean>): Map<number, number>
{
	let retval: Map<number, number> = new Map();
	let index: number = 0;

	for (let el of data.keys())
	{
		retval.set(index, el);
		index = index + 1;
	}
	return retval;
}

export function List$7(data: Map<number, number>): Map<number, number>
{
	let retval: Map<number, number> = new Map();

	let temp: Map<number, number> = new Map();
	for (let [idx, el] of data)
	{
		temp.set(idx, el);
	}
	temp = new Map(
		[...temp.entries()]
			.sort((a, b) => a[0] - b[0])
	);

	let index: number = 0;
	for (let [idx, el] of temp)
	{
		retval.set(index, el);
		index = index + 1;
	}

	return retval;
}

export function ListFind$4(list: Map<number, number>, what: number): number
{
	return ListFind$5(list, what, 0);
}

export function ListFind$5(list: Map<number, number>, what: number, idx: number): number
{
	if (idx < 0)
	{
		abort(`Attempted index out of bounds: ${idx}`);
	}
	let retval: Map<number, number> = List$7(list);
	let at: number = idx;
	while (at < retval.size)
	{
		if (what === (retval.get(at) ?? retval.set(at, 0).get(at)))
		{
			return at;
		}
		at = at + 1;
	}
	return -1;
}


export function ListRemove$4(list: Map<number, number>, what: number): Map<number, number>
{
	return ListRemove$5(list, what, 0);
}

export function ListRemove$5(list: Map<number, number>, what: number, idx: number): Map<number, number>
{
	let retval: Map<number, number> = List$7(list);
	for (let [at, el] of retval)
	{
		if (el === what && at >= idx)
		{
			retval.delete(at);
		}
	}
	return List$7(retval);
}

export function ListErase$2(list: Map<number, number>, index: number): Map<number, number>
{
	let retval: Map<number, number> = List$7(list);
	retval.delete(index);
	return List$7(retval);
}

export function ListInsertFront$2(list: Map<number, number>, what: number): Map<number, number>
{
	let retval: Map<number, number> = List$7(list);
	retval.set(-1, what);
	return List$7(retval);
}

export function ListInsert$2(list: Map<number, number>, what: number): Map<number, number>
{
	let retval: Map<number, number> = List$7(list);
	retval.set(retval.size, what);
	return List$7(retval);
}

export function ListInsertAt$2(list: Map<number, number>, what: number, idx: number): Map<number, number>
{
	if (idx < 0 || idx >= list.size)
	{
		abort(`List index ${idx} out of bounds: ${list.size}`);
	}
	let retval: Map<number, number> = List$7(list);
	let shift: number = retval.size;
	while (shift > idx)
	{
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, 0).get(shift - 1)));
		shift = shift - 1;
	}
	retval.set(idx, what);
	return retval;
}

export function ListInsertInorder$2(list: Map<number, number>, what: number): Map<number, number>
{
	let retval: Map<number, number> = List$7(list);
	if (what.toString() < (retval.get(0) ?? retval.set(0, 0).get(0)).toString())
	{
		return ListInsertAt$2(list, what, 0);
	}
	let shift: number = retval.size;
	while (shift > 0)
	{
		if (what.toString() > (retval.get(shift - 1) ?? retval.set(shift - 1, 0).get(shift - 1)).toString())
		{
			retval.set(shift, what);
			return retval;
		}
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, 0).get(shift - 1)));
		shift = shift - 1;
	}
	if (shift === 0)
	{
		abort("Inorder Insertion Failure");
	}
	return retval;
}

export function ListOutput$2(list: Map<number, number>): string
{
	let retval: string = "";
	if (list.size > 0)
	{
		retval = (list.get(0) ?? list.set(0, 0).get(0)).toString();
		let index: number = 1;
		while (index < list.size)
		{
			retval = `${retval}, ${(list.get(index) ?? list.set(index, 0).get(index)).toString()}`;
			index = index + 1;
		}
	}

	return retval;
}
//End of int[int]
//start of item[int]

export function itemList(): Map<number, Item>
{
	let retval: Map<number, Item> = new Map();
	return retval;
}

export function List$4(data: Map<Item, boolean>): Map<number, Item>
{
	let retval: Map<number, Item> = new Map();
	let index: number = 0;

	for (let el of data.keys())
	{
		retval.set(index, el);
		index = index + 1;
	}
	return retval;
}

export function List$8(data: Map<number, Item>): Map<number, Item>
{
	let retval: Map<number, Item> = new Map();

	let temp: Map<number, Item> = new Map();
	for (let [idx, el] of data)
	{
		temp.set(idx, el);
	}
	temp = new Map(
		[...temp.entries()]
			.sort((a, b) => a[0] - b[0])
	);

	let index: number = 0;
	for (let [idx, el] of temp)
	{
		retval.set(index, el);
		index = index + 1;
	}

	return retval;
}

export function ListFind$6(list: Map<number, Item>, what: Item): number
{
	return ListFind$7(list, what, 0);
}

export function ListFind$7(list: Map<number, Item>, what: Item, idx: number): number
{
	if (idx < 0)
	{
		abort(`Attempted index out of bounds: ${idx}`);
	}
	let retval: Map<number, Item> = List$8(list);
	let at: number = idx;
	while (at < retval.size)
	{
		if (what === (retval.get(at) ?? retval.set(at, Item.none).get(at)))
		{
			return at;
		}
		at = at + 1;
	}
	return -1;
}


export function ListRemove$6(list: Map<number, Item>, what: Item): Map<number, Item>
{
	return ListRemove$7(list, what, 0);
}

export function ListRemove$7(list: Map<number, Item>, what: Item, idx: number): Map<number, Item>
{
	let retval: Map<number, Item> = List$8(list);
	for (let [at, el] of retval)
	{
		if (el === what && at >= idx)
		{
			retval.delete(at);
		}
	}
	return List$8(retval);
}

export function ListErase$3(list: Map<number, Item>, index: number): Map<number, Item>
{
	let retval: Map<number, Item> = List$8(list);
	retval.delete(index);
	return List$8(retval);
}

export function ListInsertFront$3(list: Map<number, Item>, what: Item): Map<number, Item>
{
	let retval: Map<number, Item> = List$8(list);
	retval.set(-1, what);
	return List$8(retval);
}

export function ListInsert$3(list: Map<number, Item>, what: Item): Map<number, Item>
{
	let retval: Map<number, Item> = List$8(list);
	retval.set(retval.size, what);
	return List$8(retval);
}

export function ListInsertAt$3(list: Map<number, Item>, what: Item, idx: number): Map<number, Item>
{
	if (idx < 0 || idx >= list.size)
	{
		abort(`List index ${idx} out of bounds: ${list.size}`);
	}
	let retval: Map<number, Item> = List$8(list);
	let shift: number = retval.size;
	while (shift > idx)
	{
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Item.none).get(shift - 1)));
		shift = shift - 1;
	}
	retval.set(idx, what);
	return retval;
}

export function ListInsertInorder$3(list: Map<number, Item>, what: Item): Map<number, Item>
{
	let retval: Map<number, Item> = List$8(list);
	if (what.toString() < (retval.get(0) ?? retval.set(0, Item.none).get(0)).toString())
	{
		return ListInsertAt$3(list, what, 0);
	}
	let shift: number = retval.size;
	while (shift > 0)
	{
		if (what.toString() > (retval.get(shift - 1) ?? retval.set(shift - 1, Item.none).get(shift - 1)).toString())
		{
			retval.set(shift, what);
			return retval;
		}
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Item.none).get(shift - 1)));
		shift = shift - 1;
	}
	if (shift === 0)
	{
		abort("Inorder Insertion Failure");
	}
	return retval;
}

export function ListOutput$3(list: Map<number, Item>): string
{
	let retval: string = "";
	if (list.size > 0)
	{
		retval = (list.get(0) ?? list.set(0, Item.none).get(0)).toString();
		let index: number = 1;
		while (index < list.size)
		{
			retval = `${retval}, ${(list.get(index) ?? list.set(index, Item.none).get(index)).toString()}`;
			index = index + 1;
		}
	}

	return retval;
}
//end of item[int]
//start of effect[int]

export function effectList(): Map<number, Effect>
{
	let retval: Map<number, Effect> = new Map();
	return retval;
}

export function List$1(data: Map<Effect, boolean>): Map<number, Effect>
{
	let retval: Map<number, Effect> = new Map();
	let index: number = 0;

	for (let el of data.keys())
	{
		retval.set(index, el);
		index = index + 1;
	}
	return retval;
}

export function List$5(data: Map<number, Effect>): Map<number, Effect>
{
	let retval: Map<number, Effect> = new Map();

	let temp: Map<number, Effect> = new Map();
	for (let [idx, el] of data)
	{
		temp.set(idx, el);
	}
	temp = new Map(
		[...temp.entries()]
			.sort((a, b) => a[0] - b[0])
	);

	let index: number = 0;
	for (let [idx, el] of temp)
	{
		retval.set(index, el);
		index = index + 1;
	}

	return retval;
}

export function ListFind(list: Map<number, Effect>, what: Effect): number
{
	return ListFind$1(list, what, 0);
}

export function ListFind$1(list: Map<number, Effect>, what: Effect, idx: number): number
{
	if (idx < 0)
	{
		abort(`Attempted index out of bounds: ${idx}`);
	}
	let retval: Map<number, Effect> = List$5(list);
	let at: number = idx;
	while (at < retval.size)
	{
		if (what === (retval.get(at) ?? retval.set(at, Effect.none).get(at)))
		{
			return at;
		}
		at = at + 1;
	}
	return -1;
}


export function ListRemove(list: Map<number, Effect>, what: Effect): Map<number, Effect>
{
	return ListRemove$1(list, what, 0);
}

export function ListRemove$1(list: Map<number, Effect>, what: Effect, idx: number): Map<number, Effect>
{
	let retval: Map<number, Effect> = List$5(list);
	for (let [at, el] of retval)
	{
		if (el === what && at >= idx)
		{
			retval.delete(at);
		}
	}
	return List$5(retval);
}

export function ListErase(list: Map<number, Effect>, index: number): Map<number, Effect>
{
	let retval: Map<number, Effect> = List$5(list);
	retval.delete(index);
	return List$5(retval);
}

export function ListInsertFront(list: Map<number, Effect>, what: Effect): Map<number, Effect>
{
	let retval: Map<number, Effect> = List$5(list);
	retval.set(-1, what);
	return List$5(retval);
}

export function ListInsert(list: Map<number, Effect>, what: Effect): Map<number, Effect>
{
	let retval: Map<number, Effect> = List$5(list);
	retval.set(retval.size, what);
	return List$5(retval);
}

export function ListInsertAt(list: Map<number, Effect>, what: Effect, idx: number): Map<number, Effect>
{
	if (idx < 0 || idx >= list.size)
	{
		abort(`List index ${idx} out of bounds: ${list.size}`);
	}
	let retval: Map<number, Effect> = List$5(list);
	let shift: number = retval.size;
	while (shift > idx)
	{
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Effect.none).get(shift - 1)));
		shift = shift - 1;
	}
	retval.set(idx, what);
	return retval;
}

export function ListInsertInorder(list: Map<number, Effect>, what: Effect): Map<number, Effect>
{
	let retval: Map<number, Effect> = List$5(list);
	if (what.toString() < (retval.get(0) ?? retval.set(0, Effect.none).get(0)).toString())
	{
		return ListInsertAt(list, what, 0);
	}
	let shift: number = retval.size;
	while (shift > 0)
	{
		if (what.toString() > (retval.get(shift - 1) ?? retval.set(shift - 1, Effect.none).get(shift - 1)).toString())
		{
			retval.set(shift, what);
			return retval;
		}
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Effect.none).get(shift - 1)));
		shift = shift - 1;
	}
	if (shift === 0)
	{
		abort("Inorder Insertion Failure");
	}
	return retval;
}

export function ListOutput(list: Map<number, Effect>): string
{
	let retval: string = "";
	if (list.size > 0)
	{
		retval = (list.get(0) ?? list.set(0, Effect.none).get(0)).toString();
		let index: number = 1;
		while (index < list.size)
		{
			retval = `${retval}, ${(list.get(index) ?? list.set(index, Effect.none).get(index)).toString()}`;
			index = index + 1;
		}
	}

	return retval;
}
//end of effect[int]
//start of location[int]

export function locationList(): Map<number, Location>
{
	let retval: Map<number, Location> = new Map();
	return retval;
}

export function List$9(data: Map<Location, boolean>): Map<number, Location>
{
	let retval: Map<number, Location> = new Map();
	let index: number = 0;

	for (let el of data.keys())
	{
		retval.set(index, el);
		index = index + 1;
	}
	return retval;
}

export function List$10(data: Map<number, Location>): Map<number, Location>
{
	let retval: Map<number, Location> = new Map();

	let temp: Map<number, Location> = new Map();
	for (let [idx, el] of data)
	{
		temp.set(idx, el);
	}
	temp = new Map(
		[...temp.entries()]
			.sort((a, b) => a[0] - b[0])
	);

	let index: number = 0;
	for (let [idx, el] of temp)
	{
		retval.set(index, el);
		index = index + 1;
	}

	return retval;
}

export function ListFind$8(list: Map<number, Location>, what: Location): number
{
	return ListFind$9(list, what, 0);
}

export function ListFind$9(list: Map<number, Location>, what: Location, idx: number): number
{
	if (idx < 0)
	{
		abort(`Attempted index out of bounds: ${idx}`);
	}
	let retval: Map<number, Location> = List$10(list);
	let at: number = idx;
	while (at < retval.size)
	{
		if (what === (retval.get(at) ?? retval.set(at, Location.none).get(at)))
		{
			return at;
		}
		at = at + 1;
	}
	return -1;
}


export function ListRemove$8(list: Map<number, Location>, what: Location): Map<number, Location>
{
	return ListRemove$9(list, what, 0);
}

export function ListRemove$9(list: Map<number, Location>, what: Location, idx: number): Map<number, Location>
{
	let retval: Map<number, Location> = List$10(list);
	for (let [at, el] of retval)
	{
		if (el === what && at >= idx)
		{
			retval.delete(at);
		}
	}
	return List$10(retval);
}

export function ListErase$4(list: Map<number, Location>, index: number): Map<number, Location>
{
	let retval: Map<number, Location> = List$10(list);
	retval.delete(index);
	return List$10(retval);
}

export function ListInsertFront$4(list: Map<number, Location>, what: Location): Map<number, Location>
{
	let retval: Map<number, Location> = List$10(list);
	retval.set(-1, what);
	return List$10(retval);
}

export function ListInsert$4(list: Map<number, Location>, what: Location): Map<number, Location>
{
	let retval: Map<number, Location> = List$10(list);
	retval.set(retval.size, what);
	return List$10(retval);
}

export function ListInsertAt$4(list: Map<number, Location>, what: Location, idx: number): Map<number, Location>
{
	if (idx < 0 || idx >= list.size)
	{
		abort(`List index ${idx} out of bounds: ${list.size}`);
	}
	let retval: Map<number, Location> = List$10(list);
	let shift: number = retval.size;
	while (shift > idx)
	{
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Location.none).get(shift - 1)));
		shift = shift - 1;
	}
	retval.set(idx, what);
	return retval;
}

export function ListInsertInorder$4(list: Map<number, Location>, what: Location): Map<number, Location>
{
	let retval: Map<number, Location> = List$10(list);
	if (what.toString() < (retval.get(0) ?? retval.set(0, Location.none).get(0)).toString())
	{
		return ListInsertAt$4(list, what, 0);
	}
	let shift: number = retval.size;
	while (shift > 0)
	{
		if (what.toString() > (retval.get(shift - 1) ?? retval.set(shift - 1, Location.none).get(shift - 1)).toString())
		{
			retval.set(shift, what);
			return retval;
		}
		retval.set(shift, (retval.get(shift - 1) ?? retval.set(shift - 1, Location.none).get(shift - 1)));
		shift = shift - 1;
	}
	if (shift === 0)
	{
		abort("Inorder Insertion Failure");
	}
	return retval;
}

export function ListOutput$4(list: Map<number, Location>): string
{
	let retval: string = "";
	if (list.size > 0)
	{
		retval = (list.get(0) ?? list.set(0, Location.none).get(0)).toString();
		let index: number = 1;
		while (index < list.size)
		{
			retval = `${retval}, ${(list.get(index) ?? list.set(index, Location.none).get(index)).toString()}`;
			index = index + 1;
		}
	}

	return retval;
}
// Sorting.
// Uses boolean[TYPE] to allow use on Mafia list types eg $items[]

// Handy sorts of lists
export function auto_sortedByModifier(map: Map<Item, number>, m: Modifier): Map<number, Item>
{
	return auto_sortedByModifier$1(map, m, true);
}

export function auto_sortedByModifier$1(map: Map<Item, number>, m: Modifier, high_to_low: boolean): Map<number, Item>
{
	let ranked_list: Map<number, Item> = new Map();
	for (let entry of map.keys())
	{
		ranked_list.set(ranked_list.size, entry);
	}
	// Sort
	let sign: number = (high_to_low ? -1 : 1);
	ranked_list = new Map(
		[...ranked_list.entries()]
			.map(([index, value]) => {
				return { _k: index, _v: value, _expr: sign * numericModifier(value, m) };
			})
			.sort((_a, _b) => _a._expr < _b._expr ? -1 : (_a._expr > _b._expr ? 1 : 0))
			.map(e => [e._k, e._v])
	);
	return ranked_list;
}

export function auto_sortedByModifier$2(map: Map<Item, boolean>, m: Modifier): Map<number, Item>
{
	return auto_sortedByModifier$3(map, m, true);
}

export function auto_sortedByModifier$3(map: Map<Item, boolean>, m: Modifier, high_to_low: boolean): Map<number, Item>
{
	let int_map: Map<Item, number> = new Map();
	for (let entry of map.keys())
	{
		int_map.set(entry, (int_map.get(entry) ?? 0) + 1);
	}
	return auto_sortedByModifier$1(int_map, m, high_to_low);
}

export function auto_sortedByModifier$4(map: Map<Effect, number>, m: Modifier): Map<number, Effect>
{
	return auto_sortedByModifier$5(map, m, true);
}

export function auto_sortedByModifier$5(map: Map<Effect, number>, m: Modifier, high_to_low: boolean): Map<number, Effect>
{
	let ranked_list: Map<number, Effect> = new Map();
	for (let entry of map.keys())
	{
		ranked_list.set(ranked_list.size, entry);
	}
	// Sort
	let sign: number = (high_to_low ? -1 : 1);
	ranked_list = new Map(
		[...ranked_list.entries()]
			.map(([index, value]) => {
				return { _k: index, _v: value, _expr: sign * numericModifier(value, m) };
			})
			.sort((_a, _b) => _a._expr < _b._expr ? -1 : (_a._expr > _b._expr ? 1 : 0))
			.map(e => [e._k, e._v])
	);
	return ranked_list;
}

export function auto_sortedByModifier$6(map: Map<Effect, boolean>, m: Modifier): Map<number, Effect>
{
	return auto_sortedByModifier$7(map, m, true);
}

export function auto_sortedByModifier$7(map: Map<Effect, boolean>, m: Modifier, high_to_low: boolean): Map<number, Effect>
{
	let int_map: Map<Effect, number> = new Map();
	for (let entry of map.keys())
	{
		int_map.set(entry, (int_map.get(entry) ?? 0) + 1);
	}
	return auto_sortedByModifier$5(int_map, m, high_to_low);
}//end of location[int]
