import {
  ComponentSetting,
  ComponentTracking,
  RelayPage,
  TrackingEvent,
  TrackingSection,
} from "../types/types";
import { collectSettings } from "./settingSearch";

export function addNotification(notification: string) {
  const ele = document.createElement("div");
  ele.className = "notification";
  ele.addEventListener("animationend", () => ele.remove());
  ele.innerText = notification;

  const container = document.getElementById("notificationsContainer");

  if (!container) {
    return;
  }

  container.appendChild(ele);
}

interface FunctionCall {
  name: string;
  args: unknown[];
}

interface JsonApiRequest {
  properties?: string[];
  functions?: FunctionCall[];
}

interface JsonApiResponse {
  properties?: string[];
  functions?: unknown[];
}

async function callJsonApi(request: JsonApiRequest): Promise<JsonApiResponse> {
  const response = await fetch("/KoLmafia/jsonApi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      body: JSON.stringify(request),
      pwd,
    }),
  });

  if (!response.ok) {
    addNotification(`HTTP Request Failed.`);
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();

  if ("error" in json) {
    throw json.error;
  }

  return json;
}

async function callMafia(functions: FunctionCall[]): Promise<unknown[]> {
  const result = await callJsonApi({ functions });

  return result.functions ?? [];
}

async function callProperties(properties: string[]): Promise<string[]> {
  if (properties.length === 0) {
    return [];
  }

  const result = await callJsonApi({ properties });

  return result.properties ?? [];
}

function fallbackValue(setting: ComponentSetting): string {
  if (setting.default !== undefined) {
    return setting.default;
  }

  if (setting.type === "dropdown" || setting.type === "tags") {
    return setting.dropdown?.[0]?.value ?? "";
  }

  if (setting.type === "boolean") {
    return "false";
  }

  return "";
}

export async function hydrateSettingValues(pages: RelayPage[]): Promise<void> {
  const settings = pages.flatMap((page) => collectSettings(page.components));
  const values = await callProperties(settings.map((s) => s.preference));

  settings.forEach((setting, index) => {
    setting.value = values[index] ?? fallbackValue(setting);
    setting.previousValue = setting.value;

    if (setting.validate) {
      setting.validate = new Function(
        `return (${setting.validate as unknown as string})`,
      )();
    }
  });
}

function entityDecode(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;

  return textarea.value;
}

function splitUnescaped(input: string, delimiter: string): string[] {
  return input.split(new RegExp(`(?<!\\\\)${delimiter}`));
}

function parseTrackingEvents(raw: string): TrackingEvent[] {
  const events: TrackingEvent[] = [];

  if (raw === "") {
    return events;
  }

  for (let entry of splitUnescaped(raw, ", ")) {
    if (entry === "") {
      continue;
    }

    entry = entry.replace(/^\(|\)$/g, "");

    const fields = splitUnescaped(entry, ":").map((field) =>
      entityDecode(field.trim().replace(/\\([,:])/g, "$1")),
    );
    const day = parseInt(fields[0], 10) || 0;
    const values = fields.slice(1);

    const last = events[events.length - 1];

    if (
      last &&
      last.day === day &&
      last.values.join(":") === values.join(":")
    ) {
      last.count++;
    } else {
      events.push({ day, values, count: 1 });
    }
  }

  return events;
}

export async function refreshTrackingSections(
  sections: TrackingSection[],
): Promise<TrackingSection[]> {
  const tracked = sections.filter((s) => s.property);
  const values = await callProperties(tracked.map((s) => s.property as string));
  const valueByProperty = new Map(
    tracked.map((s, i) => [s.property, values[i]]),
  );

  return sections.map((section) => {
    if (!section.property || !valueByProperty.has(section.property)) {
      return section;
    }

    const raw = valueByProperty.get(section.property) ?? "";

    return section.text !== undefined
      ? { ...section, text: raw }
      : { ...section, events: parseTrackingEvents(raw) };
  });
}

export async function hydrateTrackingSections(
  pages: RelayPage[],
): Promise<void> {
  for (const page of pages) {
    for (const component of page.components) {
      if (component.type !== "tracking") {
        continue;
      }

      const tracking = component as ComponentTracking;
      tracking.sections = await refreshTrackingSections(tracking.sections);
    }
  }
}

export async function setProperties(
  properties: [string, string][],
): Promise<void> {
  await callMafia(
    properties.map(([preference, value]) => ({
      name: "setProperty",
      args: [preference, value],
    })),
  );
}

export async function saveSettings(
  properties: ComponentSetting[],
): Promise<string[]> {
  const changed = properties.filter((p) => p.previousValue !== p.value);

  if (changed.length === 0) {
    return ["No settings were modified."];
  }

  const notifications = changed.map(
    (p) =>
      `${p.preference} changed from \`${p.previousValue}\` to \`${p.value}\``,
  );

  await setProperties(changed.map((p) => [p.preference, p.value.trim()]));

  for (const p of changed) {
    p.previousValue = p.value;
  }

  return notifications;
}
