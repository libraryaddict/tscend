import React, { useState } from "react";

import { Validator } from "../../api/settingValidator";
import { ComponentSetting } from "../../types/types";
import BooleanInput from "./booleanInput";
import DropdownInput from "./dropdownInput";
import StringInput from "./stringInput";
import TagsInput from "./tagsInput";

function Setting({
  button,
  validator,
}: {
  button: ComponentSetting;
  validator: Validator;
}): React.JSX.Element {
  const [valid, setValid] = useState(validator.isValid(button));

  button.setValue = (val) => {
    button.value = val;
    validator.updateSetting(button);
  };

  validator.addSetting(button, setValid);

  return (
    <tr className="userPreference" data-name={button.name}>
      <td className="setting">
        {button.name}
        <div className="settingNameHover">{button.preference}</div>
      </td>
      <td className={valid ? "settingInput" : "settingInput invalid-setting"}>
        {button.type === "boolean" ? (
          <BooleanInput button={button} />
        ) : button.type === "dropdown" ? (
          <DropdownInput button={button} />
        ) : button.type === "tags" ? (
          <TagsInput button={button} />
        ) : (
          <StringInput button={button} />
        )}
        {button.invalidReason ? (
          <div className="invalid-reason" hidden={valid}>
            <small>{button.invalidReason}</small>
          </div>
        ) : (
          <></>
        )}

        {button.default !== undefined ? (
          <div className="hoverBox">
            <small className="settingDefaultHover">
              {button.default !== undefined
                ? `Default: ${button.default === "" ? "<Empty>" : button.default}`
                : "Default not set"}
            </small>
          </div>
        ) : (
          <></>
        )}
      </td>
      <td>{button.description}</td>
    </tr>
  );
}

export default Setting;
