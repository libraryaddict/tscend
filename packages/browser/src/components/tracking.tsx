import React, { useState } from "react";

import { TrackingEvent, TrackingSection } from "../types/types";
import CollapsibleHeader from "./collapsible";

const ALL_DAYS = 0;

function matches(
  section: TrackingSection,
  event: TrackingEvent,
  day: number,
  search: string,
): boolean {
  if (day !== ALL_DAYS && event.day !== day) {
    return false;
  }

  return (
    !search ||
    [...event.values, section.title ?? "", section.text ?? ""].some((s) =>
      s.toLowerCase().includes(search.toLowerCase()),
    )
  );
}

function groupByDay<T extends { day: number }>(items: T[]): [number, T[]][] {
  const days: [number, T[]][] = [];

  for (const item of items) {
    const last = days[days.length - 1];

    if (last && last[0] === item.day) {
      last[1].push(item);
    } else {
      days.push([item.day, [item]]);
    }
  }

  return days;
}

function alignValues(values: string[], columns: string[]): string[] {
  if (values.length > columns.length) {
    const excess = values.length - columns.length;
    values = [
      values[0],
      values.slice(1, 2 + excess).join(":"),
      ...values.slice(2 + excess),
    ];
  }

  const cells: string[] = new Array<string>(columns.length).fill("");
  cells[0] = values[0] ?? "";

  for (let i = 1; i < values.length; i++) {
    cells[columns.length - values.length + i] = values[i];
  }

  return cells;
}

function countBadge(event: TrackingEvent): React.JSX.Element {
  return event.count > 1 ? (
    <b className="trackingChipCount">×{event.count}</b>
  ) : (
    <></>
  );
}

function TrackingTable({
  columns,
  events,
}: {
  columns: string[];
  events: TrackingEvent[];
}): React.JSX.Element {
  const rows = events.map((event) => ({
    event,
    day: event.day,
    cells: alignValues(event.values, columns),
  }));

  const usedColumns = columns
    .map((_, index) => index)
    .filter((index) => rows.some((row) => row.cells[index] !== ""));

  return (
    <table className="trackingTable">
      <thead>
        <tr>
          {usedColumns.map((index) => (
            <th key={`${columns[index]} ${index}`}>{columns[index]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groupByDay(rows).map(([eventDay, dayRows], dayIndex) => (
          <React.Fragment key={`${eventDay} ${dayIndex}`}>
            <tr className="trackingTableDay">
              <td colSpan={usedColumns.length}>Day {eventDay}</td>
            </tr>
            {dayRows.map(({ event, cells }, index) => (
              <tr
                key={`${event.values.join(":")} ${index}`}
                className={index % 2 === 1 ? "trackingRowEven" : undefined}
              >
                {usedColumns.map((cell, cellIndex) => (
                  <td key={cell}>
                    {cells[cell]}
                    {cellIndex === 0 ? countBadge(event) : <></>}
                  </td>
                ))}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function TrackingChips({
  events,
}: {
  events: TrackingEvent[];
}): React.JSX.Element {
  return (
    <>
      {groupByDay(events).map(([eventDay, dayEvents], index) => (
        <div className="trackingDay" key={`${eventDay} ${index}`}>
          <div className="trackingDayLabel">Day {eventDay}</div>
          <div className="trackingChips">
            {dayEvents.map((event, index) => (
              <span
                className="trackingChip"
                key={`${event.values.join(":")} ${index}`}
              >
                {event.values.join(" : ")}
                {countBadge(event)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function TrackingCard({
  section,
  day,
  search,
}: {
  section: TrackingSection;
  day: number;
  search: string;
}): React.JSX.Element | null {
  const [open, setOpen] = useState(true);

  const events = (section.events ?? []).filter((e) =>
    matches(section, e, day, search),
  );

  const filtering = day !== ALL_DAYS || search !== "";

  if (section.text && filtering) {
    return null;
  }

  if (!section.text && events.length === 0) {
    return null;
  }

  const total = events.reduce((sum, e) => sum + e.count, 0);
  const expanded = filtering || open;

  return (
    <div className="trackingCard">
      <CollapsibleHeader
        expanded={expanded}
        onToggle={() => setOpen(!open)}
        className="trackingCardHeader"
      >
        {section.icon ? <img src={section.icon} alt="" /> : <></>}
        <span className="trackingCardTitle">{section.title}</span>
        {total > 0 ? <span className="trackingCardTotal">{total}</span> : <></>}
      </CollapsibleHeader>
      <div className={`trackingCardBody${expanded ? " open" : ""}`}>
        {section.text ? (
          <div className="trackingText">{section.text}</div>
        ) : section.columns ? (
          <TrackingTable columns={section.columns} events={events} />
        ) : (
          <TrackingChips events={events} />
        )}
      </div>
    </div>
  );
}

function Tracking({
  sections,
}: {
  sections: TrackingSection[];
}): React.JSX.Element {
  const [day, setDay] = useState(ALL_DAYS);
  const [search, setSearch] = useState("");

  const days = [
    ...new Set(sections.flatMap((s) => (s.events ?? []).map((e) => e.day))),
  ].sort((a, b) => a - b);

  const cards = sections
    .map((section, index) => (
      <TrackingCard
        key={`${section.title} ${index}`}
        section={section}
        day={day}
        search={search}
      />
    ))
    .filter((c) => c !== null);

  return (
    <div className="tracking">
      <div className="trackingControls">
        <div className="trackingDayFilter">
          <button
            className={day === ALL_DAYS ? "active" : ""}
            onClick={() => setDay(ALL_DAYS)}
          >
            All days
          </button>
          {days.map((d) => (
            <button
              key={d}
              className={day === d ? "active" : ""}
              onClick={() => setDay(d)}
            >
              Day {d}
            </button>
          ))}
        </div>
        <input
          className="searchInput trackingSearch"
          type="text"
          placeholder="Filter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {sections.length === 0 ? (
        <div className="trackingEmpty">Nothing has been tracked yet.</div>
      ) : (
        <div className="trackingGrid">{cards}</div>
      )}
    </div>
  );
}

export default Tracking;
