import { $familiar, get } from "libram";

import { canChangeToFamiliar } from "../../auto_familiar";

export function auto_canCamelSpit(): boolean {
  return (
    canChangeToFamiliar($familiar`Melodramedary`) && get("camelSpit") === 100
  );
}
