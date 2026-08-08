import * as React from "react";

import { Validator } from "../../api/settingValidator";
import { ComponentSetting } from "../../types/types";
import Setting from "./setting";

function SettingsTable({
  settings,
  validator,
  lastSaved: saveVersion,
}: {
  settings: ComponentSetting[];
  validator: Validator;
  lastSaved: number;
}): React.JSX.Element | null {
  if (settings.length === 0) {
    return null;
  }

  return (
    <table className="relayTable">
      <tbody>
        {settings.map((setting) => (
          <Setting
            key={`${setting.preference}-${saveVersion}`}
            button={setting}
            validator={validator}
          />
        ))}
      </tbody>
    </table>
  );
}

export default SettingsTable;
