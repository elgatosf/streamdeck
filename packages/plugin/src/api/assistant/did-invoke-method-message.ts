import type { JsonObject, JsonPrimitive } from "@elgato/utils";

import type { ResponsePayload } from "./response-payload.js";

/**
 * Response that includes the result of invoking a method handled by the plugin.
 */
export interface DidInvokeMethodMessage {
	/**
	 * Event type.
	 */
	readonly event: "didInvokeMethod";

	/**
	 * Identifies the request the result is associated with.
	 */
	readonly id: string;

	/**
	 * Payload with the result of the method invocation.
	 */
	readonly payload: ResponsePayload<Exclude<JsonPrimitive, undefined> | JsonObject | JsonPrimitive[]>;
}
