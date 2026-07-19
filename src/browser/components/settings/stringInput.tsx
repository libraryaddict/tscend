import * as React from "react";

import { ComponentSetting } from "../../types/types";

function StringInput({
  button,
}: {
  button: ComponentSetting;
}): React.JSX.Element {
  return (
    <input
      className="stringcontainer"
      name={button.name}
      defaultValue={button.value}
      placeholder={button.placeholderText ? button.placeholderText : ""}
      onChange={(e) => button.setValue(e.target.value)}
    />
  );
}

export default StringInput;
