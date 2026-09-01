import { $familiar } from "libram";

import { auto_have_familiar } from "../../helpers/auto_familiar";

export function haveCoolerYeti(): boolean {
  if (auto_have_familiar($familiar`Cooler Yeti`)) {
    return true;
  }
  return false;
}
