import { type Layout as LayoutJsonSchema } from "./layout";

export { DeviceType } from "./device-type";
export * from "./layout";
export * from "./manifest/latest";

/**
 * Defines the structure of a custom layout file.
 */
export type Layout = Omit<LayoutJsonSchema, "$schema">;
