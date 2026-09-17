interface PreferenceValue {
  preference: string;
  value: string;
}

export interface DropdownValue {
  display?: string;
  value: string;
}

export interface RelayPage {
  urlPath?: string;
  page: string;
  title?: string;
  components: RelayComponent[];
}

type RelayComponentType =
  | "boolean"
  | "dropdown"
  | "string"
  | "html"
  | "interrupt"
  | "tags"
  | "tracking"
  | "runinfo"
  | "group";

export interface RelayComponent {
  type: RelayComponentType;
}

export interface RelayGroup extends RelayComponent {
  type: "group";
  name: string;
  description?: string;
  color?: string;
  collapsed?: boolean;
  components: RelayComponent[];
}

export interface RelayInterrupt extends RelayComponent {
  type: "interrupt";
  name: string;
  notification?: string;
  color?: "warning" | "primary";
  actions: PreferenceValue[];
}

export interface RelayHtml extends RelayComponent {
  type: "html";
  data?: string;
}

export interface RelaySetting extends RelayComponent {
  type: "boolean" | "dropdown" | "string" | "tags";
  name?: string;
  preference: string;
  description: string;
  default?: string;
  value?: string;
  validate?: string;
  invalidReason?: string;
  placeholderText?: string;
  tags: string[];
}

export interface RelayDropdown extends RelaySetting {
  type: "dropdown" | "tags";
  possibleValues?: DropdownValue[] | string[];
}

export interface RelayTags extends RelayDropdown {
  type: "tags";
  allowDuplicateTags?: boolean;
  tagsSeperator?: string;
  minTags?: number;
  maxTags?: number;
}

export interface TrackingEvent {
  day: number;
  values: string[];
  count: number;
}

export interface TrackingSection {
  title: string;
  icon?: string;
  text?: string;
  columns?: string[];
  events?: TrackingEvent[];
  property?: string;
}

export interface RelayTracking extends RelayComponent {
  type: "tracking";
  sections: TrackingSection[];
}

interface RunInfoTile {
  label: string;
  value: string;
}

interface RunInfoLocation {
  name: string;
  turns: number;
  adventures: number;
  combats: number;
  noncombats: number;
}

export interface RunInfoData {
  tiles: RunInfoTile[];
  locations: RunInfoLocation[];
}

export interface RelayRunInfo extends RelayComponent {
  type: "runinfo";
  data: RunInfoData;
}
