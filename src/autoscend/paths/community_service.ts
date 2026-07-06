import { myPath, Path } from "kolmafia";

// community service is no longer supported

//Defined in autoscend/paths/community_service.ash
export function in_community(): boolean {
  return myPath() === Path.get("Community Service");
}
