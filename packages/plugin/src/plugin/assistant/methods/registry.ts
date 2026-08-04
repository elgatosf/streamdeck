import z from "zod";

import type { DidInvokeMethodMessage } from "../../../api/assistant/did-invoke-method-message.js";
import type { InvokeMethodMessage } from "../../../api/assistant/invoke-method-message.js";
import { connection } from "../../connection.js";
import { logger } from "../../logging/index.js";
import type { AssistantMethodInput, AssistantMethodOptions, AssistantMethodOutput } from "./options.js";

/**
 * Configuration methods that have been registered by the plugin.
 */
export const methodRegistry = new Map<string, AssistantMethodOptions<AssistantMethodInput, AssistantMethodOutput>>();

/**
 * Dispatches the request to invoke a method exposed by the plugin.
 */
connection.on("invokeMethod", async (ev) => {
	const { id, payload } = ev;

	try {
		// Respond with the result of invoking the method.
		connection.send({
			event: "didInvokeMethod",
			id,
			payload: await invoke(payload),
		});
	} catch (err) {
		// An unexpected error occurred, log it and return an error.
		logger.error(`Failed to invoke method: "${payload.name}" encountered an unexpected error.`, err);

		connection.send({
			event: "didInvokeMethod",
			id,
			payload: {
				error: {
					code: -32603,
					message: err instanceof Error ? err.message : "Encountered an unexpected error",
				},
			},
		});
	}
});

/**
 * Attempts to invoke a registered configuration method.
 * @param payload Payload that contains the method information.
 * @returns The result of invoking the method.
 */
async function invoke(payload: InvokeMethodMessage["payload"]): Promise<DidInvokeMethodMessage["payload"]> {
	const { name, arguments: args } = payload;
	const method = methodRegistry.get(payload.name);

	// Check if the method has been registered.
	if (!method) {
		logger.error(`Failed to invoke method: "${name}" has no function handler.`);
		return {
			error: {
				code: -32601,
				message: `Method does not exist: "${name}"`,
			},
		};
	}

	// When there is no input schema, invoke with the args.
	if (!method.inputSchema) {
		return {
			result: await method.handler(args),
		};
	}

	// Validate the input args.
	const argsParse = z.safeParse(method.inputSchema, args);
	if (!argsParse.success) {
		logger.error(`Failed to invoke method: "${name}" does not accept the provided arguments.`, args);
		return {
			error: {
				code: -32602,
				message: "Invalid method parameter(s).",
			},
		};
	}

	// Invoke and return the result.
	return {
		result: await method.handler(argsParse.data),
	};
}
