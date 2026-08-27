import { cliExecute, Effect, haveEffect, isUnrestricted } from "kolmafia";
import { $effect, $item, get } from "libram";

import { auto_abort } from "../../auto_util";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";

function spacegateVaccineAvailable(): boolean {
  if (in_koe()) {
    return false;
  }

  if (!get("spacegateAlways") || get("_spacegateToday")) {
    return false;
  }
  if (!isUnrestricted($item`Spacegate access badge`)) {
    return false;
  }
  if (get("_spacegateVaccine")) {
    return false;
  }
  return true;
}

function spacegateVaccineAvailable$1(ef: Effect): boolean {
  if (!spacegateVaccineAvailable()) {
    return false;
  }
  switch (ef) {
    case $effect`Rainbow Vaccine`:
      return get("spacegateVaccine1");
    case $effect`Broad-Spectrum Vaccine`:
      return get("spacegateVaccine2");
    case $effect`Emotional Vaccine`:
      return get("spacegateVaccine3");
  }
  auto_abort(`autoscend: bad effect passed to spacegateVaccineAvailable:${ef}`);
  return false;
}

export function spacegateVaccine(ef: Effect): boolean {
  if (!spacegateVaccineAvailable$1(ef)) {
    return false;
  }
  if (haveEffect(ef) > 0) {
    return false;
  }

  let i: number = 0;
  switch (ef) {
    case $effect`Rainbow Vaccine`:
      i = 1;
      break;
    case $effect`Broad-Spectrum Vaccine`:
      i = 2;
      break;
    case $effect`Emotional Vaccine`:
      i = 3;
      break;
  }
  cliExecute(`spacegate vaccine ${i}`);
  return true;
}
