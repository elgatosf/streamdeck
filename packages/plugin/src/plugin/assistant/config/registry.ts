import z from "zod";

import type { DidReceiveConfigurationContextMessage } from "../../../api/assistant/did-receive-configuration-context-message.js";
import type { InitializationContext } from "../../../api/assistant/initialization-context.js";
import { connection } from "../../connection.js";
import { logger } from "../../logging/index.js";
import type { AssistantActionConfig } from "./action-config.js";
import type { AssistantActionInitializationType } from "./initialization-type.js";

/**
 * Configuration contexts registered by the plugin.
 */
export const actionConfigRegistry = new Map<string, AssistantActionConfig>();

/**
 * Dispatches the request for an action's configuration context.
 */
connection.on("getConfigurationContext", async (ev) => {
	const { action, id } = ev;

	try {
		// Respond with the action's configuration context.
		connection.send({
			event: "didReceiveConfigurationContext",
			id,
			payload: await getConfig(action),
		});
	} catch (err) {
		// An unexpected error occurred, log it and return an error.
		logger.error(
			`Failed to configure action: "${action}" encountered an unexpected error whilst getting its configuration context.`,
			err,
		);

		connection.send({
			event: "didReceiveConfigurationContext",
			id,
			payload: {
				error: {
					code: -32603,
					message: err instanceof Error ? err.message : "Encountered an unexpected error.",
				},
			},
		});
	}
});

/**
 * Gets the configuration context for the specified action.
 * @param action The action identifier as defined within the manifest.
 * @returns Configuration context associated with the action.
 */
async function getConfig(action: string): Promise<DidReceiveConfigurationContextMessage["payload"]> {
	const actionConfig = actionConfigRegistry.get(action);

	// Configuration context was not found.
	if (!actionConfig) {
		logger.warn(`Failed to configure action: "${action}" does not have a configuration context.`);
		return {
			error: {
				code: -32601,
				message: `Configuration context does not exist for "${action}".`,
			},
		};
	}

	// Check if the action requires initialization.
	const init = await actionConfig.getInitialization?.();
	if (init) {
		return {
			result: toInitializationContext(init),
		};
	}

	// Construct and return the configuration context.
	const { settingsSchema: settings, methods: tools } = actionConfig;
	return {
		result: {
			settingsSchema: z.toJSONSchema(typeof settings === "function" ? await settings() : settings),
			methods: tools ?? [],
			status: "configure",
		},
	};
}

/**
 * Transforms a pending initialization result to an initialization context that can be sent to Stream Deck.
 * @param result The result from the plugin.
 * @returns The transformed context.
 */
function toInitializationContext(result: Exclude<AssistantActionInitializationType, undefined>): InitializationContext {
	if (result.type === "method") {
		return {
			status: "initialize",
			initialization: {
				type: "method",
				method: result.method.name,
			},
		};
	}

	return {
		status: "initialize",
		initialization: result,
	};
}
