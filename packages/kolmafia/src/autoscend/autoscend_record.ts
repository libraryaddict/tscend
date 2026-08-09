import { Item } from "kolmafia";

//From Zlib Stuff
export class kmailObject {
  constructor(
    public id: number = 0, // message id
    public type: string = "", // possible values observed thus far: normal, giftshop
    public fromid: number = 0, // sender\'s playerid (0 for npcs)
    public azunixtime: number = 0, // KoL server\'s unix timestamp
    public message: string = "", // message (not including items/meat)
    public items: Map<Item, number> = new Map(), // items included in the message
    public meat: number = 0, // meat included in the message
    public fromname: string = "", // sender\'s playername
    public localtime: string = "", // your local time according to your KoL account, human-readable string
  ) {}
}
//used in auto_consume.ash
export class ConsumeAction {
  constructor(
    // exactly one of these is non-none
    public it: Item = Item.none,
    public cafeid: number = 0,

    public size: number = 0, // how much of organ is used
    public adventures: number = 0.0, // expected adv from (thing)

    public desirability: number = 0.0, // adv count that will be used for optimization
    // (lower for pulls, higher for buffs/tower keys)

    public organ: number = 0, // AUTO_ORGAN_*
    public howtoget: number = 0, // AUTO_OBTAIN_*
    public data?: ConsumeData, // When this isn't just your everyday item
  ) {}
}

export interface ConsumeData {
  castOde?: boolean; // If we should cast ode for booze, defaults to true. Also controls if we bother equipping items
  prep?: () => boolean; // Tries to prep this, if undefined, doesn't need prepping
  consume?: () => boolean; // Try to consume this item, otherwise consumed as normal. If this is defined, we skip the validity check because it's assumed this item is not normal
  hasOwnTracking?: boolean; // If this is going to track the items consumed itself or not
}
