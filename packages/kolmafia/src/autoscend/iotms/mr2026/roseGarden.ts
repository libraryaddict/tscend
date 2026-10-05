import { itemAmount, Monster, use, visitUrl } from "kolmafia";
import { $item, $monsters, get, set } from "libram";

import {
  auto_canRunBetweenBattleChecks,
  autoAdvBypass,
} from "../../executors/auto_adventure";
import { bluevsred_willEncounterFight } from "../../paths/2026/blue_vs_red";
import { auto_abort, auto_log_info } from "../../utils/auto_log";
import { auto_is_valid, handleTracker } from "../../utils/auto_util";

let haveGarden: boolean | undefined;
const chunkMonsters: Monster[] = $monsters`giant flamingo statue, hollow-eyed angel statue, rose garden gnome`;
let monstersAvailable: Monster[] | undefined = undefined;

export function getChunkMonsters(): Monster[] {
  return chunkMonsters.filter((m) => bluevsred_willEncounterFight(m));
}

export function haveRoseGarden(): boolean {
  // If not checked yet
  if (haveGarden === undefined && auto_canRunBetweenBattleChecks()) {
    haveGarden =
      auto_is_valid($item`black rosebud`) &&
      visitUrl("campground.php").includes(
        "campground.php?action=rosegarden&pwd",
      );
  }

  // Can be undefined if we were occupied
  return haveGarden === true;
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

function updateFights(): void {
  monstersAvailable = getChoiceOptions()
    .map((m) => m.monster)
    .filter((m) => m !== undefined);
}

export function startRoseFight(
  onlyWith: Monster[] | undefined,
  speculative: boolean,
): boolean {
  let available: Monster[];
  if (monstersAvailable === undefined) {
    available = monstersAvailable = getChoiceOptions()
      .map((m) => m.monster)
      .filter((m) => m !== undefined);
  } else {
    available = monstersAvailable;
  }

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
    updateFights();
    return false;
  }

  monstersAvailable = undefined;
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
    freeKillsRemaining() -
    (Math.floor(itemAmount($item`statuary chunk`) / 3) +
      itemAmount($item`partial tombstone`));

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

interface RoseChoice {
  text: string;
  url: string;
  monster?: Monster;
}

function getChoiceOptions(): RoseChoice[] {
  const html = visitUrl("campground.php?action=rosegarden&pwd");
  const choices: RoseChoice[] = [];

  for (const [, form] of html.matchAll(
    /<form action=['"]?choice\.php['"]?([\s\S]*?)<\/form>/g,
  )) {
    const choice: RoseChoice = {
      text: form.match(/type=submit.*?value=['"]([^'"]+)['"]/)?.[1] ?? "",
      url: "choice.php?pwd&",
    };

    for (const [, name, value] of form.matchAll(
      /name=['"]?([^'"]+)['"]?\s+value=['"]([^'"]+)['"]/g,
    )) {
      if (name === "pwd") {
        continue;
      }

      choice.url += `&${name}=${value}`;
    }

    const monsterText = choice.text.match(/^Fight (.+) at position \d+,\d+$/);

    if (monsterText) {
      choice.monster = Monster.get(monsterText[1]);
    }

    choices.push(choice);
  }

  return choices;
}
