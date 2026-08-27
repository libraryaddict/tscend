import { $familiar, get } from "libram";

import { canChangeToFamiliar } from "../../auto_familiar";

export function canCamelSpit(): boolean {
  return (
    canChangeToFamiliar($familiar`Melodramedary`) && get("camelSpit") === 100
  );
}
