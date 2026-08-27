import { $familiar } from "libram";

import { auto_have_familiar } from "../../auto_familiar";

export function auto_haveCoolerYeti(): boolean {
  if (auto_have_familiar($familiar`Cooler Yeti`)) {
    return true;
  }
  return false;
}
