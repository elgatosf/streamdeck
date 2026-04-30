import type { JsonObject } from "@elgato/utils";

/**
 * Request to invoke a method handled by the plugin.
 */
export interface InvokeMethodMessage {
	/**
	 * Event type.
	 */
	readonly event: "invokeMethod";

	/**
	 * Identifies the request.
	 */
	readonly id: string;

	/**
	 * Payload information that defines the invocation request.
	 */
	readonly payload: {
		/**
		 * Name of the method to invoke.
		 */
		name: string;

		/**
		 * Arguments to be provided when the method is invoked.
		 */
		arguments: JsonObject;
	};
}
