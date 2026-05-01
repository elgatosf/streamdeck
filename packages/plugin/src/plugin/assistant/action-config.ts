import * as z from "zod";

import type { AssistantMethodDefinition } from "./method-definition.js";

/**
 * Provides context associated with an action, allowing for it to be configured automatically.
 */
export interface AssistantActionConfig {
	/**
	 * Schema that defines the structure of the settings associated with an action.
	 */
	settingsSchema: z.ZodObject | (() => Promise<z.ZodObject>) | (() => z.ZodObject);

	/**
	 * Methods that can be used when automatically configuring an action.
	 */
	methods?: AssistantMethodDefinition[];
}
