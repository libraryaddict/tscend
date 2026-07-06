import {
  Class,
  Effect,
  Element,
  Familiar,
  Item,
  Location,
  Monster,
  Phylum,
  Skill,
  Slot,
  Stat,
} from "kolmafia";

//A record is a data structure for storing a fixed number of elements. It is similar to a structure in C language.
//If we want to have a function return a custom data structure we need to first define it before the function.
//To avoid conflict with our unified header (define cross-dependent functions without circular importing) we first define all records here.
//We then import them to the very begining of autoscend_header.ash
//Note that we only do this for cross dependent functions. If a record is only going to be used in a single file, define it inside that file.
//#######################################################################################
// Used in autoscend/quests/level_12.ash
export class WarPlan {
  constructor(
    public doArena: boolean = false,
    public doJunkyard: boolean = false,
    public doLighthouse: boolean = false,
    public doOrchard: boolean = false,
    public doNuns: boolean = false,
    public doFarm: boolean = false,
  ) {}
}
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
//Record from autoscend/auto_zone.ash
export class generic_t {
  constructor(
    public _error: boolean = false,
    public _boolean: boolean = false,
    public _int: number = 0,
    public _float: number = 0.0,
    public _string: string = "",
    public _item: Item = Item.none,
    public _location: Location = Location.none,
    public _class: Class = Class.none,
    public _stat: Stat = Stat.none,
    public _skill: Skill = Skill.none,
    public _effect: Effect = Effect.none,
    public _familiar: Familiar = Familiar.none,
    public _slot: Slot = Slot.none,
    public _monster: Monster = Monster.none,
    public _element: Element = Element.none,
    public _phylum: Phylum = Phylum.none,
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
  ) {}
}
