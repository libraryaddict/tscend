import { ComponentSetting } from "../types/types";

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

async function callMafia(functions: FunctionCall[]): Promise<unknown[]> {
  const response = await fetch("/KoLmafia/jsonApi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      body: JSON.stringify({ functions }),
      pwd,
    }),
  });

  if (!response.ok) {
    throw `HTTP ${response.status}`;
  }

  const json = await response.json();

  if ("error" in json) {
    throw json.error;
  }

  return json.functions ?? [];
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
