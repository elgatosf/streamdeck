import type { JsonValue } from "@elgato/utils";
import type { JSONSchema } from "zod/v4/core";

/**
 * Request from the Elgato assistant for the context associated with an action type.
 */
export interface AssistantActionContextRequest {
	/**
	 * Event type.
	 */
	readonly event: "assistantActionContext";

	/**
	 * Unique identifier of the action as defined within the manifest.
	 */
	readonly action: string;

	/**
	 * Identifies the request.
	 */
	readonly id: string;
}

/**
 * Response to the Elgato assistant with the context associated with an action type.
 */
export interface AssistantActionContextResponse extends AssistantActionContextRequest {
	/**
	 * The context of the action.
	 */
	readonly payload: {
		/**
		 * Schema that defines the structure of settings associated with an instance of the action.
		 */
		readonly settingsSchema: JSONSchema.JSONSchema;

		/**
		 * Tools available to the Elgato assistant that allow for populating an action's settings.
		 */
		readonly tools: {
			/**
			 * Name that identifies the tool; must be unique amongst all tools exposed by the plugin.
			 */
			readonly name: string;

			/**
			 * Describes the purpose of the tool.
			 */
			readonly description: string;

			/**
			 * Schema that represents the tool's input.
			 */
			readonly inputSchema?: JSONSchema.JSONSchema;

			/**
			 * Schema that represents the tool's output.
			 */
			readonly outputSchema: JSONSchema.JSONSchema;
		}[];
	};
}

/**
 * Request from the Elgato assistant to call a tool handled by the plugin.
 */
export interface AssistantToolRequest {
	/**
	 * Event type.
	 */
	readonly event: "assistantTool";

	/**
	 * Session context associated with the event.
	 */
	readonly context: string;

	/**
	 * Identifies the request.
	 */
	readonly id: string;

	/**
	 * Name of the tool being called.
	 */
	readonly name: string;

	/**
	 * The input.
	 */
	readonly payload: JsonValue;
}

/**
 * Response to the Elgato assistant after a tool was called within the plugin.
 */
export interface AssistantToolResponse {
	/**
	 * Event type.
	 */
	readonly event: "assistantTool";

	/**
	 * Session context associated with the event.
	 */
	readonly context: string;

	/**
	 * Identifies the request this response is for.
	 */
	readonly id: string;

	/**
	 * The result of calling the tool.
	 */
	readonly payload: JsonValue;
}
