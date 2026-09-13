import { myPath } from "kolmafia";
import { $path } from "libram";
// community service is no longer supported

export function in_community(): boolean {
  return myPath() === $path`Community Service`;
}
