import { entityDecode, getProperty, inHardcore, toInt } from "kolmafia";

import { auto_hasPowerfulGlove } from "../../kolmafia/autoscend/iotms/mr2020";
import { isActuallyEd } from "../../kolmafia/autoscend/paths/actually_ed_the_undying";
import { in_ocrs } from "../../kolmafia/autoscend/paths/one_crazy_random_summer";
import {
  RelayPage,
  RelayTracking,
  TrackingEvent,
  TrackingSection,
} from "../../shared/relayTypes";

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

function parseTrackingEvents(propertyName: string): TrackingEvent[] {
  const events: TrackingEvent[] = [];
  const raw = getProperty(propertyName);

  if (raw === "") {
    return events;
  }

  for (let entry of raw.split(", ")) {
    if (entry === "") {
      continue;
    }

    entry = entry
      .replace(/[()]/g, "")
      .replace(/Asdon Marton:/g, "Asdon Martin -")
      .replace(/CHEAT CODE:/g, "CHEAT CODE -");

    const fields = entry.split(":").map((field) => entityDecode(field.trim()));
    const day = toInt(fields[0]);
    const values = fields.slice(1);

    const last = events[events.length - 1];

    if (
      last &&
      last.day === day &&
      last.values.join(":") === values.join(":")
    ) {
      last.count++;
    } else {
      events.push({ day: day, values: values, count: 1 });
    }
  }

  return events;
}

const trackingConditions: Record<string, () => boolean> = {
  isActuallyEd,
  inOcrs: in_ocrs,
  notHardcore: () => !inHardcore(),
  hasPowerfulGlove: auto_hasPowerfulGlove,
};

function trackedSections(): TrackingSection[] {
  const sections: TrackingSection[] = [];

  for (const entry of Object.values(trackingConfig)) {
    if (entry.condition && !trackingConditions[entry.condition]()) {
      continue;
    }

    const events = parseTrackingEvents(entry.property);

    if (events.length > 0) {
      sections.push({
        title: entry.title,
        icon: entry.icon,
        columns: entry.columns,
        events: events,
      });
    }
  }

  if (getProperty("auto_beatenUpLocations") !== "") {
    sections.push({
      title: "Beaten Up",
      text: getProperty("auto_beatenUpLocations"),
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
