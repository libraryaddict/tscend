import type {
  RelayPage,
  RelaySetting,
  RunInfoData,
  TrackingSection,
} from "../../../shared/src/relayTypes";

export type {
  RelayComponent,
  RelayGroup,
  RelayHtml,
  RelayInterrupt,
  RelayPage,
  RunInfoData,
  TrackingEvent,
  TrackingSection,
} from "../../../shared/src/relayTypes";

type SettingValidator = (value: string, objects: object) => boolean;

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
  possibleValues: ComponentDropdown[];
  allowDuplicateTags: boolean;
  tagsSeperator: string;
  minTags: string;
  maxTags: string;
}

export interface ComponentTracking {
  type: "tracking";
  sections: TrackingSection[];
}

export interface ComponentRunInfo {
  type: "runinfo";
  data: RunInfoData;
}

declare global {
  function getData(callback: (pages: RelayPage[]) => void): void;
  let pwd: string;
  const sessionName: string;
}
