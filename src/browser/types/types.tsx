import type {
  RelayPage,
  RelaySetting,
  TrackingSection,
} from "../../shared/relayTypes";

export type {
  RelayComponent,
  RelayComponentType,
  RelayGroup,
  RelayHtml,
  RelayInterrupt,
  RelayPage,
  TrackingEvent,
  TrackingSection,
} from "../../shared/relayTypes";

export type SettingValidator = (value: string, objects: object) => boolean;

export interface ComponentDropdown {
  display: string;
  value: string;
}

export interface ComponentSetting extends Omit<
  RelaySetting,
  "value" | "default" | "validate"
> {
  value: string;
  default: string;
  setValue: (value: string) => void;
  previousValue: string;
  validate: SettingValidator;
  dropdown: ComponentDropdown[];
  allowDuplicateTags: boolean;
  tagsSeperator: string;
  minTags: string;
  maxTags: string;
}

export interface ComponentTracking {
  type: "tracking";
  sections: TrackingSection[];
}

declare global {
  function getData(callback: (pages: RelayPage[]) => void): void;
  const pwd: string;
}
