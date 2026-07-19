import React, { useEffect, useState } from "react";

import { ComponentDropdown, ComponentSetting } from "../../types/types";

const mapValuesToDisplay = (button: ComponentSetting, values: string[]) => {
  return values.map((v) => {
    const drop = button.dropdown?.find(
      (d) => d.value.toLowerCase() === v.toLowerCase(),
    );

    return drop ?? { display: v, value: v };
  });
};

const stringToColour = (str: string) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let colour = "#";

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }

  return colour;
};

const TagsInput = ({ button }: { button: ComponentSetting }) => {
  const [tags, setTags] = useState(
    mapValuesToDisplay(
      button,
      button.value.split(button.tagsSeperator).filter((s) => s.length > 0),
    ),
  );
  const [showMenu, setShowMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = React.createRef<HTMLInputElement>();
  const searchContainerRef = React.createRef<HTMLDivElement>();
  const inputRef = React.createRef<HTMLDivElement>();
  const [insertIndexAt, setInsertIndexAt] = useState(-1);
  const [draggedItem, setDraggedItem] = useState(-1);
  const [lastInserted, setLastInserted] = useState(-1);
  const [draggedWidth, setDraggedWidth] = useState(0);
  const [draggedHeight, setDraggedHeight] = useState(0);

  const cantRemoveTags =
    !!button.minTags && parseInt(button.minTags) >= tags.length;

  const setValueFromTags = (newTags: ComponentDropdown[]) => {
    button.setValue(newTags.map((t) => t.value).join(button.tagsSeperator));
  };

  const addTag = (tag: ComponentDropdown) => {
    setSearchValue("");
    const newTags = [...tags, tag];
    setTags(newTags);
    setValueFromTags(newTags);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setValueFromTags(newTags);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value !== "") {
      const dropdownValue = button.dropdown?.find(
        (d) =>
          d.display.toLowerCase() === event.currentTarget.value.toLowerCase(),
      );

      if (button.dropdown && !dropdownValue) {
        return;
      }

      const value = dropdownValue
        ? dropdownValue.value
        : event.currentTarget.value;

      if (
        !button.allowDuplicateTags &&
        tags.some((t) => t.value.toLowerCase() === value.toLowerCase())
      ) {
        return;
      }

      addTag(dropdownValue ?? { display: value, value });
    } else if (
      event.key === "Backspace" &&
      tags.length &&
      event.currentTarget.value.length === 0 &&
      !cantRemoveTags
    ) {
      event.preventDefault();
      setLastInserted(-1);
      removeTag(tags.length - 1);
    }
  };

  const options = () => {
    const opts = button.allowDuplicateTags
      ? button.dropdown
      : button.dropdown?.filter((d) => !tags.some((t) => t.value === d.value));

    if (!opts) {
      return [];
    }

    return searchValue
      ? opts.filter((o) =>
          o.display.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : opts;
  };

  useEffect(() => {
    if (showMenu) {
      searchRef.current?.focus();
    }
  }, [showMenu]);

  useEffect(() => {
    const closeMenu = () => {
      if (
        document.activeElement instanceof Node &&
        !searchContainerRef.current?.contains(document.activeElement)
      ) {
        setShowMenu(false);
      }
    };

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  });

  const updateIndexInsert = (e: React.DragEvent) => {
    if (!inputRef.current) {
      return;
    }

    const tag = e.currentTarget;
    let tagId = +(tag.getAttribute("data-key") ?? -10);

    const b = (
      tag.querySelector(".settingTagSingle") as Element
    ).getBoundingClientRect();
    const offset = e.clientX - (b.left + b.width / 2);

    if (offset >= 0) {
      tagId++;
    }

    setInsertIndexAt(tagId);
  };

  const dragEnd = () => {
    if (draggedItem === -1) {
      return;
    }

    if (insertIndexAt - 1 !== draggedItem && insertIndexAt !== draggedItem) {
      const newIndex = insertIndexAt;
      const newTags = [...tags];
      newTags.splice(draggedItem, 1);
      newTags.splice(
        newIndex - (draggedItem < newIndex ? 1 : 0),
        0,
        tags[draggedItem],
      );

      setTags(newTags);
      setValueFromTags(newTags);
      setLastInserted(newIndex - (draggedItem < newIndex ? 1 : 0));
    } else {
      setLastInserted(-1);
    }

    setDraggedItem(-1);
    setInsertIndexAt(-1);
  };

  const atMaxTags = !!button.maxTags && tags.length >= parseInt(button.maxTags);

  return (
    <div className="settingTag" ref={inputRef}>
      {tags.map((tag, index) => (
        <React.Fragment key={`${tag.display} ${tag.value} ${index}`}>
          {draggedItem >= 0 &&
          index === 0 &&
          index === insertIndexAt &&
          insertIndexAt !== draggedItem &&
          draggedItem !== insertIndexAt - 1 ? (
            <div
              className="hintTagDrop"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              style={{
                width: `${draggedWidth}px`,
                height: `${draggedHeight}px`,
              }}
            />
          ) : null}
          {draggedItem === index ? (
            <div
              className="hintTagDrop hintTagDropOriginal"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              style={{
                width: `${draggedWidth}px`,
                height: `${draggedHeight}px`,
                display:
                  insertIndexAt === index || insertIndexAt - 1 === index
                    ? "inline"
                    : "none",
              }}
            />
          ) : null}
          <div
            draggable
            onDragStart={(e) => {
              const ind = index;
              const wid = e.currentTarget.getBoundingClientRect().width - 10;
              const height = e.currentTarget.getBoundingClientRect().height - 2;

              setTimeout(() => {
                setInsertIndexAt(ind);
                setDraggedItem(ind);
                setDraggedWidth(wid);
                setDraggedHeight(height);
              });
            }}
            onDragEnd={() => {
              dragEnd();
            }}
            onDragOver={(e) => {
              e.preventDefault();

              updateIndexInsert(e);
            }}
            data-key={index}
            className={`tagContainer${draggedItem === index ? " hidden" : ""}`}
          >
            <div
              className={`settingTagSingle${
                index === draggedItem ? " draggedItem" : ""
              }${
                lastInserted === index ? " rearrangedTag" : ""
              }${cantRemoveTags ? "" : " settingTagSingleCloseVisible"}`}
              style={{
                backgroundColor: `${stringToColour(
                  `${tag.display} ${tag.value}`,
                )}22`,
              }}
            >
              <span>{tag.display}</span>
              <div
                className={`settingTagClose${cantRemoveTags ? " hidden" : ""}`}
                onClick={() => removeTag(index)}
              >
                &times;
              </div>
            </div>
          </div>
          {draggedItem >= 0 &&
          index + 1 === insertIndexAt &&
          draggedItem + 1 !== insertIndexAt &&
          draggedItem !== insertIndexAt ? (
            <div
              className="tagContainer hintTagDrop"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              style={{
                width: `${draggedWidth}px`,
                height: `${draggedHeight}px`,
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
      <div
        ref={searchContainerRef}
        className={`tagContainer settingTagInput${atMaxTags ? " hidden" : ""}`}
      >
        <input
          type="text"
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={button.placeholderText ?? ""}
          value={searchValue}
          ref={searchRef}
          onFocus={() => setShowMenu(true)}
          onKeyDown={handleKeyDown}
          size={10}
        />

        {button.dropdown && showMenu && options().length > 0 ? (
          <div className="dropdownMenu">
            {options().map((option) => (
              <div
                key={option.value}
                onClick={() => addTag(option)}
                className="dropdownItem"
              >
                {option.display}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TagsInput;
