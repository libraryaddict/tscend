import { write } from "kolmafia";

import { getRunInfoData } from "./pages/info";

export function main(): void {
  write(JSON.stringify(getRunInfoData()));
}
