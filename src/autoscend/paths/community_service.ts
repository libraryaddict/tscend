import { myPath } from "kolmafia";
import { $path } from "libram";
// community service is no longer supported

//Defined in autoscend/paths/community_service.ash
export function in_community(): boolean {
  return myPath() === $path`Community Service`;
}
