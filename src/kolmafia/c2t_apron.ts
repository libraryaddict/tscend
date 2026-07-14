import {
  cliExecute,
  containsText,
  fullnessLimit,
  getProperty,
  Item,
  itemAmount,
  myFullness,
  myHash,
  myPrimestat,
  print,
  splitString,
  Stat,
  visitUrl,
} from "kolmafia";
import { $item, $stat } from "libram";

import { AshMatcher } from "./autoscend/utils/kolmafiaUtils";

//c2t apron
//c2t
//deals with the black and white apron meal kit
//simply selects meal based on stat and selects all the extra ingredients that are available
//cli flag
//eats a meal kit with a provided stat
export function c2t_apron$1(): boolean {
  return c2t_apron(myPrimestat());
}
//CLI handling

//returns true on success
function c2t_apron(select: Stat): boolean {
  let meal: number;
  const kit: Item = $item`Black and White Apron Meal Kit`;
  let page: string;
  const start_1: number = myFullness();
  const startKits: number = itemAmount(kit);

  switch (select) {
    default:
      return c2t_apron_error(`"${select}" is not a valid stat`);
    case $stat`Muscle`:
      meal = 0;
      break;
    case $stat`Mysticality`:
      meal = 1;
      break;
    case $stat`Moxie`:
      meal = 2;
      break;
  }
  if (itemAmount(kit) === 0) {
    return c2t_apron_error(`no ${kit} on hand`);
  }
  if (myFullness() + 3 > fullnessLimit()) {
    return c2t_apron_error(`too full to eat a ${kit}`);
  }

  page = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${kit.id}`,
    false,
    true,
  );

  const mat: AshMatcher = new AshMatcher(
    `name="ingredients${meal}\\[\\]"\\s+value="(\\d+)"\\s+data-has="(\\d)"`,
    page,
  );
  const allowlist: Map<string, boolean> = c2t_apron_allowlist();

  let sendit: string = `choice.php?pwd&whichchoice=1518&option=1&meal=${meal}`;
  while (mat.find()) {
    if (mat.group(2) === "1" && allowlist.has(mat.group(1))) {
      sendit += `&ingredients${meal}[]=${mat.group(1)}`;
    }
  }

  page = visitUrl(sendit, true, false);

  cliExecute("refresh inv");

  if (
    start_1 < myFullness() ||
    startKits > itemAmount(kit) ||
    containsText(page, "<br>You cook and quickly consume your")
  ) {
    return true;
  }
  return c2t_apron_error(`did not eat the ${kit}`);
}

//map of ingredients on the allowlist
function c2t_apron_allowlist(): Map<string, boolean> {
  const out: Map<string, boolean> = new Map();
  let split: Map<number, string> = new Map();

  if (getProperty("c2t_apron_allowlist") !== "") {
    split = new Map(
      splitString(getProperty("c2t_apron_allowlist"), ",").map((_v, _i) => [
        _i,
        _v,
      ]),
    );
  }

  for (const [, x] of split) {
    out.set(x, true);
  }

  return out;
}

//errors
function c2t_apron_error(msg: string): boolean {
  const out: string = `c2t_apron error: ${msg}`;

  print(out, "red");
  return false;
}
