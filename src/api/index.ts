import type * as schemas from "@elgato/schemas/streamdeck/plugins";

export * from "./command";
export * from "./device";
export * from "./events";
export * from "./i18n";
export * from "./layout";
export * from "./registration";
export * from "./target";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest = Omit<schemas.Manifest, "$schema">;
