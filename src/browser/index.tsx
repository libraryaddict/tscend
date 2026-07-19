import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import {
  ComponentSetting,
  RelayComponent,
  RelayGroup,
  RelayPage,
} from "./types/types";

function expandComponents(components: RelayComponent[]) {
  for (const component of components) {
    if (component.type === "group") {
      expandComponents((component as RelayGroup).components);
      continue;
    }

    const setting = component as ComponentSetting;

    if (!setting.preference) {
      continue;
    }

    setting.previousValue = setting.value;

    if (setting.validate) {
      setting.validate = new Function(
        `return (${setting.validate as unknown as string})`,
      )();
    }
  }
}

getData((pages: RelayPage[]) => {
  for (const page of pages) {
    expandComponents(page.components);
  }

  const container = document.getElementById("root");

  const root = createRoot(container!);
  root.render(<App pages={pages} />);
});
