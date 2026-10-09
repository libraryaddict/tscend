import {
  availableChoiceExtras,
  Effect,
  itemAmount,
  lastChoice,
  Monster,
  myMeat,
  use,
  visitUrl,
} from "kolmafia";
import { $effect, $item, $monsters, get, have, set } from "libram";

import { autoAdvBypass } from "../../executors/auto_adventure";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";
import { auto_abort, auto_log_info } from "../../utils/auto_log";
import {
  auto_get_campground,
  handleTracker,
  meatReserve,
} from "../../utils/auto_util";

const chunkMonsters: Monster[] = $monsters`giant flamingo statue, hollow-eyed angel statue, rose garden gnome`;
let choicesAvailable: RoseChoice[] | undefined = undefined;

export function getChunkMonsters(): Monster[] {
  return chunkMonsters.filter((m) => bluevsred_willEncounterFight(m));
}

export function haveRoseGarden(): boolean {
  return auto_get_campground().has($item`black garden rose`);
}

export function redeemRoseStuff(): void {
  if (get("_tscend_redeemedRoseGarden")) return;

  for (const choice of getChoiceOptions()) {
    if (!choice.text.startsWith("Take the ")) continue;

    visitUrl(choice.url);

    handleTracker({
      iotm: $item`black garden rose`,
      detail: choice.text.split(" at ")[0],
      tracker: "iotmsUsed",
    });
  }

  set("_tscend_redeemedRoseGarden", true);
}

function updateRoseChoices(): void {
  choicesAvailable = getChoiceOptions();
}

export function startRoseFight(
  onlyWith: Monster[] | undefined,
  speculative: boolean,
): boolean {
  if (choicesAvailable === undefined) {
    updateRoseChoices();
  }

  const available: Monster[] = choicesAvailable!
    .map((m) => m.monster)
    .filter((m) => m !== undefined);

  function getMonsterToFight(): Monster | undefined {
    if (onlyWith !== undefined) {
      return onlyWith.find((m) => available.includes(m));
    }

    return available[0];
  }

  if (getMonsterToFight() === undefined) return false;
  else if (speculative) return true;

  const toFight = getChoiceOptions().find(
    (c) =>
      c.monster && (onlyWith === undefined || onlyWith.includes(c.monster)),
  );

  if (toFight === undefined || toFight.monster === undefined) {
    auto_log_info(
      `Thought we had a monster to fight in the rose garden, except we did not...`,
    );
    updateRoseChoices();
    return false;
  }

  choicesAvailable = undefined;
  set("tscend_nextEncounter", toFight.monster);
  set("tscend_nonAdvLoc", true);
  return autoAdvBypass(
    0,
    new Map([
      [0, "campground.php?action=rosegarden&pwd"],
      [1, toFight.url],
    ]),
  );
}

export function createTombstone() {
  const shouldMake = () =>
    Math.min(
      Math.floor(itemAmount($item`statuary chunk`) / 3),
      freeKillsRemaining() -
        (Math.floor(itemAmount($item`statuary chunk`) / 3) +
          itemAmount($item`partial tombstone`)),
    );

  for (let i = shouldMake(); i > 0; i--) {
    use($item`statuary chunk`, 3);
  }

  if (shouldMake() > 0) {
    auto_abort(
      `Hmm, we're not creating statuary chunks properly, time to abort`,
    );
  }
}

export function freeKillsRemaining(): number {
  return 11 - get("_partialTombstonesUsed");
}

type FountainBuff =
  "stat boost" | "init" | "Lucky!" | "Lucky! and Fam Weight+Exp";
type FountainOption = {
  what: FountainBuff;
  choice: number;
  effect: Effect;
  canAcquire(): boolean;
};
const fountainBuffs: FountainOption[] = [
  {
    what: "stat boost",
    choice: 1,
    effect: $effect`Black Rosacea`,
    canAcquire: () => myMeat() >= meatReserve() + 1,
  },
  {
    what: "init",
    choice: 2,
    effect: $effect`Black Rose Guardin'`,
    canAcquire: () => myMeat() >= meatReserve() + 1000,
  },
  {
    what: "Lucky!",
    choice: 3,
    effect: $effect.none,
    canAcquire: () =>
      !have($effect`Lucky!`) && itemAmount($item`black rose pentacle`) > 0,
  },
  {
    what: "Lucky! and Fam Weight+Exp",
    choice: 3,
    effect: $effect`Black Rosacea`,
    canAcquire: () =>
      !have($effect`Lucky!`) && itemAmount($item`black rose pentacle`) > 0,
  },
];

export function useBloodFountain(
  what: FountainBuff,
  speculate: boolean,
): boolean {
  if (!haveRoseGarden()) return false;

  const buff = fountainBuffs.find((f) => f.what === what);

  if (
    !buff ||
    !buff.canAcquire() ||
    (buff.effect !== $effect.none && have(buff.effect))
  ) {
    return false;
  }

  if (choicesAvailable === undefined) {
    updateRoseChoices();
  }

  const fountain = choicesAvailable!.find((c) =>
    c.text.startsWith(`Drink from the blood fountain`),
  );

  if (!fountain || speculate) {
    return !!fountain;
  }

  choicesAvailable = undefined;
  visitUrl(`"campground.php?action=rosegarden&pwd"`);
  visitUrl(fountain.url);
  // If we cannot acquire, then we must have acquired
  return !buff.canAcquire();
}

interface RoseChoice {
  text: string;
  url: string;
  monster?: Monster;
}

function getChoiceOptions(): RoseChoice[] {
  // Always visit, we always have a reason to want the fresh data
  visitUrl("campground.php?action=rosegarden&pwd");
  const choices: RoseChoice[] = [];

  for (const { decision, extras_joined, label } of Object.values(
    availableChoiceExtras(),
  )) {
    const choice: RoseChoice = {
      text: label,
      url: `choice.php?pwd=&whichchoice=${lastChoice()}&${extras_joined}&option=${decision}`,
    };

    const monsterText = choice.text.match(/^Fight (.+) at position \d+,\d+$/);

    if (monsterText) {
      choice.monster = Monster.get(monsterText[1]);
    }

    choices.push(choice);
  }

  return choices.filter(
    // Filter out any fights that won't be free (or a fight)
    (c) => !c.monster || bluevsred_willEncounterFight(c.monster),
  );
}
