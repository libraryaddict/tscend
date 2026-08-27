import {
  cliExecute,
  gitExists,
  isUnrestricted,
  Location,
  random,
  totalTurnsPlayed,
  visitUrl,
} from "kolmafia";
import { $item, $location, $slot, get, set } from "libram";

import { autoAdv } from "../../auto_adventure";
import { autoEquipToSlot, possessEquipment } from "../../auto_equipment";
import { safeGet } from "../../auto_util";

export function auto_haveVotingBooth(): boolean {
  // is_unrestricted instead of auto_is_valid as the enchatments are usable in g lover.
  return (
    (get("_voteToday") || get("voteAlways")) &&
    isUnrestricted($item`voter registration form`)
  );
}

export function auto_voteSetup(
  candidate: number,
  first: number,
  second: number,
): boolean {
  if (candidate < 0 || candidate > 2) {
    return false;
  }
  if (first < 0 || first > 4) {
    return false;
  }
  if (second < 0 || second > 4) {
    return false;
  }
  if (first === second && first !== 0) {
    return false;
  }
  if (!auto_haveVotingBooth()) {
    return false;
  }
  if (get("_voteModifier") !== "") {
    return false;
  }
  if (possessEquipment($item`"I Voted!" sticker`)) {
    return false;
  }

  if (gitExists("Ezandora-Voting-Booth")) {
    cliExecute("VotingBooth.ash");
    return true;
  }

  if (candidate === 0) {
    candidate = 1 + random(2);
  }
  while (first === 0 || first === second) {
    first = 1 + random(4);
  }
  while (second === 0 || first === second) {
    second = 1 + random(4);
  }
  //When using random, should we check for negative initiatives?

  visitUrl("place.php?whichplace=town_right&action=townright_vote", false);
  visitUrl(
    `choice.php?whichchoice=1331&pwd=&option=1&g=${candidate}&local[]=${first}&local[]=${second}`,
  );
  return true;
}

export function auto_voteMonster(
  freeMon: boolean = false,
  loc: Location = $location.none,
): boolean {
  if (!auto_haveVotingBooth()) {
    return false;
  }
  if (get("_voteModifier") === "") {
    return false;
  }
  //Some things override this, like a semi-rare?

  if (get("lastVoteMonsterTurn") >= totalTurnsPlayed()) {
    return false;
  }
  if (totalTurnsPlayed() % 11 !== 1) {
    return false;
  }
  // is_unrestricted instead of auto_is_valid as the monsters can be encountered in g-lover
  if (
    !possessEquipment($item`"I Voted!" sticker`) ||
    !isUnrestricted($item`"I Voted!" sticker`)
  ) {
    return false;
  }

  if (freeMon && get("_voteFreeFights") >= 3) {
    return false;
  }

  if (loc === $location.none) {
    return true;
  }

  if (autoEquipToSlot($slot`acc3`, $item`"I Voted!" sticker`)) {
    set("auto_nextEncounter", safeGet("_voteMonster").toString());
    return autoAdv(loc);
  }
  set("auto_nextEncounter", "");
  return false;
}
