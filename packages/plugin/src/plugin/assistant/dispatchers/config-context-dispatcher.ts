import z from "zod";

import type { DidReceiveConfigurationContextMessage } from "../../../api/assistant/did-receive-configuration-context-message.js";
import { connection } from "../../connection.js";
import { logger } from "../../logging/index.js";
import type { ConfigContext } from "../config-context.js";

/**
 * Configuration contexts registered by the plugin.
 */
export const configContexts = new Map<string, ConfigContext>();

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
			payload: await getConfigContext(action),
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
				code: -32603,
				message: err instanceof Error ? err.message : "Encountered an unexpected error.",
			},
		});
	}
});

/**
 * Gets the configuration context for the specified action.
 * @param action The action identifier as defined within the manifest.
 * @returns Configuration context associated with the action.
 */
async function getConfigContext(action: string): Promise<DidReceiveConfigurationContextMessage["payload"]> {
	const configContext = configContexts.get(action);

	// Configuration context was not found.
	if (!configContext) {
		logger.warn(`Failed to configure action: "${action}" does not have a configuration context.`);
		return {
			code: -32601,
			message: `Configuration context does not exist for "${action}".`,
		};
	}

	// Construct and return the configuration context.
	const { settingsSchema: settings, methods: tools } = configContext;
	return {
		result: {
			settingsSchema: z.toJSONSchema(typeof settings === "function" ? await settings() : settings),
			methods: tools ?? [],
		},
	};
}
