import * as z from "zod";

import type { AssistantMethodInfo } from "../methods/method-info.js";
import type { AssistantActionInitializationType } from "./initialization-type.js";

/**
 * Provides context associated with an action, allowing for it to be configured automatically.
 */
export interface AssistantActionConfig {
	/**
	 * Allows the action to specify an initialization step is required prior to configuring an instance.
	 *
	 * This is useful in scenarios whereby an action's configuration contains dynamic information,
	 * for example a local app must be running, or the user must first authenticate with an external
	 * service.
	 *
	 * This function is called every time prior to requesting an action's configuration context. It
	 * is solely responsible for indicating how an action _will_ be initialized, not the actual
	 * initialization. If an action does not require initialization, or it is already in a state
	 * where an instance can be configured, `undefined` should be returned.
	 */
	getInitialization?(): AssistantActionInitializationType | Promise<AssistantActionInitializationType>;

	/**
	 * Schema that defines the structure of the settings associated with an action.
	 */
	settingsSchema: z.ZodObject | (() => Promise<z.ZodObject>) | (() => z.ZodObject);

	/**
	 * Methods that can be used when automatically configuring an action.
	 */
	methods?: AssistantMethodInfo[];
}
