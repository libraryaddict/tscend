import { myHash, myName, write } from "kolmafia";

export function main(): void {
  write(JSON.stringify({ name: myName(), hash: myHash() }));
}
