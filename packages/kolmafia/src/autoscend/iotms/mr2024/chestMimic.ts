import {
  bufferToFile,
  containsText,
  daycount,
  fileToBuffer,
  handlingChoice,
  Item,
  lastChoice,
  Monster,
  myHash,
  sessionStorage,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, ChestMimic } from "libram";

import { autoAdvBypass } from "../../auto_adventure";
import { auto_have_familiar } from "../../auto_familiar";
import { auto_log_error, handleTracker } from "../../auto_util";

export function haveChestMimic(): boolean {
  if (auto_have_familiar($familiar`Chest Mimic`)) {
    return true;
  }
  return false;
}

function auto_haveMeggEgg(mon: Monster): boolean {
  return ChestMimic.differentiableQuantity(mon) > 0;
}

const mimicFile = `c2t_megg_maxlist.txt`;

function auto_couldMakeMeggEgg(mon: Monster): boolean {
  if (!mon.copyable || mon.boss) return false;

  const buffer = fileToBuffer(mimicFile)
    .split("\n")
    .map((s) => parseInt(s));

  if (buffer.includes(mon.id)) return true;
  if (
    buffer.length > 100 &&
    sessionStorage.getItem(`mimic_checked_${daycount()}`) === "true"
  ) {
    return false;
  }

  for (const newMon of ChestMimic.getReceivableMonsters()) {
    if (buffer.includes(newMon.id)) continue;
    buffer.push(newMon.id);
  }

  bufferToFile(buffer.join("\n"), mimicFile);
  sessionStorage.setItem(`mimic_checked_${daycount()}`, "true");
  return buffer.includes(mon.id);
}

// true when Chest Mimic can't yet produce mon purely because it hasn't reached 100 experience,
// but would be able to once it levels up (rather than mon being unreachable via Chest Mimic at all)
export function chestMimicPendingFor(mon: Monster): boolean {
  if (!haveChestMimic()) return false;
  if (auto_haveMeggEgg(mon)) return false;
  if ($familiar`Chest Mimic`.experience >= 100) return false;
  return auto_couldMakeMeggEgg(mon);
}

export function meggFight(mon: Monster, speculative: boolean): boolean {
  if (!haveChestMimic()) {
    return false;
  }

  if (speculative) {
    if (
      auto_haveMeggEgg(mon) ||
      ($familiar`Chest Mimic`.experience >= 100 && auto_couldMakeMeggEgg(mon))
    ) {
      return true;
    } else {
      return false;
    }
  }
  if (!auto_haveMeggEgg(mon)) {
    if ($familiar`Chest Mimic`.experience >= 100) {
      ChestMimic.receive(mon);
    } else {
      return false;
    }
  }
  if (!auto_haveMeggEgg(mon)) {
    return false;
  }

  if (speculative) {
    return true;
  }
  // From here adapted from c2t_megg_fight
  const egg: Item = $item`mimic egg`;
  //go
  const page: string = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`,
    false,
    true,
  );
  //choice check
  if (!handlingChoice() || lastChoice() !== 1516) {
    auto_log_error("Couldn't enter choice adventure to fight eggs.");
    return false;
  }
  //check if available
  const monstring: string = mon.id.toString();
  if (!containsText(page, `<option value="${monstring}">`)) {
    visitUrl("main.php", false, true); //don't get stuck in choice
    auto_log_error(`${mon} not found to fight`);
    return false;
  }

  if (
    autoAdvBypass(
      0,
      new Map([
        [0, `inv_use.php?pwd=${myHash()}&which=3&whichitem=${egg.id}`],
        [1, `choice.php?pwd&whichchoice=1516&option=1&mid=${monstring}`],
      ]),
    )
  ) {
    handleTracker({
      what: mon,
      detail: $familiar`Chest Mimic`.toString(),
      property: "auto_copies",
    });
    return true;
  }
  return false;
}
