import React from "react";

function CollapsibleHeader({
  expanded,
  onToggle,
  className,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  className: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      className={className}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <span className={`chevron${expanded ? " open" : ""}`}>▸</span>
      {children}
    </button>
  );
}

export default CollapsibleHeader;
