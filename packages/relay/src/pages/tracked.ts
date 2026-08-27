import { inHardcore } from "kolmafia";

import { isActuallyEd } from "../../../kolmafia/src/autoscend/paths/2015/actually_ed_the_undying";
import { in_ocrs } from "../../../kolmafia/src/autoscend/paths/2015/one_crazy_random_summer";
import { PowerfulGlove } from "../../../kolmafia/src/types";
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

const trackingConditions: Record<string, () => boolean> = {
  isActuallyEd,
  inOcrs: in_ocrs,
  notHardcore: () => !inHardcore(),
  hasPowerfulGlove: PowerfulGlove.hasPowerfulGlove,
};

function trackedSections(): TrackingSection[] {
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
