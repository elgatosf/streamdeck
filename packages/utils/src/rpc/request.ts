import type { JsonObject, JsonValue } from "../json.js";

/**
 * Request options.
 */
export type RpcRequestOptions = {
	/**
	 * Name of the method to be invoked.
	 */
	method: string;

	/**
	 * Parameters to be used during the invocation of the method.
	 */
	params?: RpcRequestParameters;

	/**
	 * Timeout duration in milliseconds; defaults to `5000` (5s).
	 */
	timeout?: number;
};

/**
 * Parameters that can be sent with a request.
 */
export type RpcRequestParameters = JsonObject | JsonValue[] | undefined;
