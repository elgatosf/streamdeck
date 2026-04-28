import type { JsonValue } from "@elgato/utils";
import z from "zod";

import type { AssistantActionContextRequest, AssistantToolRequest } from "../../api/assistant.js";
import { connection } from "../connection.js";
import { logger } from "../logging/index.js";
import type { AssistantActionContext } from "./action-context.js";
import type { AssistantTool } from "./tool.js";

export const actionContexts = new Map<string, AssistantActionContext>();
export const tools = new Map<string, AssistantTool>();

/**
 * Handles the dispatch of the assistant requesting contexts associated with actions.
 */
connection.on("assistantActionContext", async (ev: AssistantActionContextRequest) => {
	const { event, action, id } = ev;
	const context = actionContexts.get(action);

	if (!context) {
		throw new Error(`Assistant requested the context of an unsupported action: ${action}`);
	}

	const { settingsSchema, tools } = context;
	connection.send({
		event,
		action,
		id,
		payload: {
			settingsSchema: z.toJSONSchema(typeof settingsSchema === "function" ? await settingsSchema() : settingsSchema),
			tools: tools ?? [],
		},
	});
});

/**
 * Handles the dispatch of the assistant calling tool handled by the plugin.
 */
connection.on("assistantTool", async (ev: AssistantToolRequest) => {
	const { event, name, id, context } = ev;

	let result: JsonValue = undefined;
	const tool = tools.get(name);

	// Attempt to call the tool's handler; otherwise log an error.
	if (tool) {
		result = (await tool.handler(ev.payload)) as JsonValue;
	} else {
		logger.warn(`Assistant tool request received for an unhandled tool: ${name}`);
	}

	connection.send({
		event,
		id,
		context,
		payload: result,
	});
});
