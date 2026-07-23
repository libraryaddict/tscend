import * as React from "react";

import { Validator } from "../../api/settingValidator";
import { ComponentSetting } from "../../types/types";
import Setting from "./setting";

function SettingsTable({
  settings,
  validator,
}: {
  settings: ComponentSetting[];
  validator: Validator;
}): React.JSX.Element | null {
  if (settings.length === 0) {
    return null;
  }

  return (
    <table className="relayTable">
      <tbody>
        {settings.map((setting) => (
          <Setting
            key={setting.preference}
            button={setting}
            validator={validator}
          />
        ))}
      </tbody>
    </table>
  );
}

export default SettingsTable;
