import {
  getProperty,
  myHash,
  print,
  propertyDefaultValue,
  propertyExists,
  propertyHasDefault,
} from "kolmafia";

import {
  DropdownValue,
  RelayComponent,
  RelayDropdown,
  RelayGroup,
  RelayPage,
  RelaySetting,
  RelayTags,
} from "../shared/relayTypes";
import { RelayHtml } from "../shared/relayTypes";

export function html(data: string): RelayHtml {
  return { type: "html", data: data };
}

function validateComponents(components: RelayComponent[]) {
  for (const component of components) {
    if (component.type === "group") {
      validateComponents((component as RelayGroup).components);
      continue;
    }

    const button = component as RelaySetting;

    if (!button.preference) {
      continue;
    }

    button.name = button.name ?? button.preference;

    if (button.validate) {
      try {
        new Function(`return (${button.validate})`);
      } catch (e) {
        print(
          `Unable to load ${button.name}'s validator '${button.validate}': ${e}`,
        );
        button.validate = undefined;
      }
    }

    if (button.default !== undefined && typeof button.default !== "string") {
      button.default = `${button.default}`;
    }

    if (!button.default && propertyHasDefault(button.preference)) {
      button.default = propertyDefaultValue(button.preference);
    }

    if (button.value !== undefined && typeof button.value !== "string") {
      button.value = `${button.value}`;
    }

    if (button.type === "dropdown" || button.type === "tags") {
      const dropdown = button as RelayDropdown;

      if (dropdown.dropdown && typeof dropdown.dropdown[0] === "string") {
        dropdown.dropdown = (dropdown.dropdown as string[]).map((s) => {
          return { display: s, value: s };
        });
      }
    }

    if (button.type === "tags") {
      const tags = button as RelayTags;
      if (tags.allowDuplicateTags === undefined) {
        tags.allowDuplicateTags = true;
      } else if (typeof tags.allowDuplicateTags === "string") {
        tags.allowDuplicateTags = tags.allowDuplicateTags === "true";
      }

      if (!tags.tagsSeperator) {
        tags.tagsSeperator = ",";
      }
    }

    if (!button.placeholderText) {
      button.placeholderText = button.default ? button.default : "";
    }

    if (button.value !== undefined) {
      continue;
    }

    let val: string;

    if (propertyExists(button.preference)) {
      val = getProperty(button.preference);
    } else if (button.default !== undefined) {
      val = button.default;
    } else if (button.type === "dropdown") {
      const first = (button as RelayDropdown).dropdown?.[0];

      val =
        typeof first === "string"
          ? first
          : ((first as DropdownValue)?.value ?? "");
    } else if (button.type === "boolean") {
      val = "false";
    } else {
      val = "";
    }

    button.value = val;
  }
}

export function generateHTML(pages: RelayPage[]): string {
  pages = pages.filter((p) => p);

  for (const page of pages) {
    page.urlPath = page.urlPath ?? page.page;

    validateComponents(page.components);
  }

  const buffer: string[] = [];

  buffer.push("<!DOCTYPE html>");
  buffer.push("<head>");
  buffer.push('<meta charset="utf-8">');
  buffer.push(
    `<title>${pages.map((p) => p.title).find((t) => t) ?? "Relay"}</title>`,
  );

  buffer.push("<style>");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  buffer.push(`${require("data:react_css")}`);
  buffer.push("</style>");

  buffer.push("</head>");

  buffer.push('<div id="root"></div>');

  buffer.push("<script>");

  buffer.push(
    `let getData = function(callback) {callback(${JSON.stringify(pages).replace(
      /</g,
      "\\u003c",
    )})}`,
  );

  buffer.push(`let pwd = ${JSON.stringify(myHash())};`);

  buffer.push(`document.onclick = (e) => {
    if(e.target.classList.contains('notification')) e.target.remove();
  }`);

  buffer.push("</script>");

  buffer.push("<script>");
  buffer.push(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    `${require("data:react_script")}`.replace(/<\/script/gi, "<\\/script"),
  );
  buffer.push("</script>");

  return buffer.join("\n");
}
