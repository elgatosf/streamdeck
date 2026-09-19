import type * as JsonRpc from "../json-rpc/index.js";

/**
 * A request that can be sent to a server.
 */
export interface Request {
	/**
	 * Name of the method to invoke.
	 */
	method: string;

	/**
	 * Parameters sent with the request.
	 */
	params?: JsonRpc.Parameters;

	/**
	 * Timeout duration in milliseconds; defaults to `5000` (5s).
	 */
	timeout?: number;
}
