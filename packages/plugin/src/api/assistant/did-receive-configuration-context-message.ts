import type { ConfigurationContext } from "./configuration-context.js";
import type { ResponsePayload } from "./response-payload.js";

/**
 * Response that includes the configuration context for an action.
 */
export interface DidReceiveConfigurationContextMessage {
	/**
	 * Event type.
	 */
	readonly event: "didReceiveConfigurationContext";

	/**
	 * Identifies the request the result is associated with.
	 */
	readonly id: string;

	/**
	 * The context of the action.
	 */
	readonly payload: ResponsePayload<ConfigurationContext>;
}
