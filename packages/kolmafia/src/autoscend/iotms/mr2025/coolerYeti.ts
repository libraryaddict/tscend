import { $familiar } from "libram";

import { auto_have_familiar } from "../../helpers/auto_familiar";

export function haveCoolerYeti(): boolean {
  return auto_have_familiar($familiar`Cooler Yeti`);
}
