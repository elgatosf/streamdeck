import { DeviceType } from "./enums";

export type RegistrationInfo = {
  application: {
    font: string;
    language: string;
    platform: "mac" | "windows";
    platformVersion: string;
    version: string;
  };
  plugin: {
    uuid: string;
    version: string;
  };
  devicePixelRatio: number;
  colors: {
    buttonPressedBackgroundColor: string;
    buttonPressedBorderColor: string;
    buttonPressedTextColor: string;
    disabledColor: string;
    highlightColor: string;
    mouseDownColor: string;
  };
  devices: [
    {
      id: string;
      name: string;
      size: {
        columns: number;
        rows: number;
      };
      type: DeviceType;
    }
  ];
};
