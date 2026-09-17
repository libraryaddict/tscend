import {
  equippedAmount,
  inHardcore,
  isUnrestricted,
  itemAmount,
  myPath,
} from "kolmafia";
import { $item, $path } from "libram";

import {
  RelayPage,
  RelayTracking,
  TrackingSection,
} from "../../../shared/src/relayTypes";

const trackingConfig =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:tracking") as Record<string, TrackingEntry>;

interface TrackingEntry {
  title: string;
  property: string;
  columns?: string[];
  icon?: string;
  condition?: string;
}

// Checked inline rather than imported: the modules these live in drag in most of the
// quest engine.
const trackingConditions: Record<string, () => boolean> = {
  isActuallyEd: () => myPath() === $path`Actually Ed the Undying`,
  inOcrs: () => myPath() === $path`One Crazy Random Summer`,
  notHardcore: () => !inHardcore(),
  hasPowerfulGlove: () =>
    itemAmount($item`Powerful Glove`) +
      equippedAmount($item`Powerful Glove`, true) >
      0 && isUnrestricted($item`mint-in-box Powerful Glove`),
};

export function trackedSections(): TrackingSection[] {
  const sections: TrackingSection[] = [];

  for (const entry of Object.values(trackingConfig)) {
    if (entry.condition && !trackingConditions[entry.condition]()) {
      continue;
    }

    sections.push({
      title: entry.title,
      icon: entry.icon,
      columns: entry.columns,
      property: entry.property,
    });
  }

  return sections;
}

export function trackedPage(): RelayPage {
  return {
    page: "Tracked",
    urlPath: "tracked",
    components: [
      { type: "tracking", sections: trackedSections() } as RelayTracking,
    ],
  };
}
