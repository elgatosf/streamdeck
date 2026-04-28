import * as z from "zod";

import type { AssistantTool } from "./tool.js";

/**
 * Provides context associated with an action, allowing the Elgato assistant to interact with it.
 */
export interface AssistantActionContext {
	/**
	 * Schema that defines the structure of settings associated with an instance of the action.
	 */
	settingsSchema: z.ZodType | (() => Promise<z.ZodType>) | (() => z.ZodType);

	/**
	 * Identifies tools associated with the action; allows for populating the action's settings.
	 */
	tools?: AssistantTool[];
}
