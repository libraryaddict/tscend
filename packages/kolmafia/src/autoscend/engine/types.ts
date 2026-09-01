import { Item, Monster } from "kolmafia";

export class Delay {
  /**
   * Delay that requires X turns spent here, can't speed it up, eg NC that opens after 5 turns
   * @param amount The amount of turns remaining to be spent in the zone
   */
  static turnsspent(amount: number) {}

  /**
   * Delay that requires a certain monster to be killed, eg icy peak or palindome. A monster listed here, if copyable, could be fought elsewhere if needed
   * @param monster The monster that must be killed
   * @param amount The count of monsters that must be killed
   */
  static kills(monster: Monster | Monster[], amount: number) {
    //
  }

  /**
   *A NC that occurs every X adventures, can be sped up with a NC forcer
   * @param amount How many turns left until we encounter it
   */
  static superlikelyNC(amount: number) {}

  /**
   * A choice that needs to be encountered, can be encountered via -combat
   */
  static choice(details?: {
    /**
     * Requires this amount of turns to elapse after the last delay
     */
    relativePityTurns?: number;
    /**
     * Requires this amount of turns spent in the location
     */
    absolutePityTurns?: number;
  }) {}

  /**
   *
   * @param gatedBehind The criteria needed to fight this boss
   */
  static boss(gatedBehind: Delay) {}

  /**
   *
   * @param item The items required, must not include any items that are effectively just a counter of the monsters fought. Eg, ninja snowman assassins
   */
  static item(item: Item | Item[]) {}
}

export type EstimatedAdventures = {
  /**
   * This task delays this delay to be burned, Delay[] is used when multiple delay are being worked on, eg hidden apartment scheduled NC for accountants
   * A delay must never be at the front of the queue unless we would make absolute progress if we did it, eg, all items required to fight a boss
   */
  delays: (Delay | Delay[])[];
  // This task will likely take this amount of adventures, useful for figuring out the probable progress today
  // This number is average / slightly better than average, and you can get above or below it
  likely: number;
};
