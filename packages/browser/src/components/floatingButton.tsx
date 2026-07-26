import * as React from "react";

function FloatingButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <input
      className="floatingButton"
      type="button"
      value={label}
      onClick={onClick}
    />
  );
}

export default FloatingButton;
