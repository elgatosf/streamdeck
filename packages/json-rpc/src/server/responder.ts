import type * as JsonRpc from "../json-rpc/index.js";

/**
 * Handler responsible for sending responses to a client.
 */
export interface Responder {
	/**
	 * Determines whether the response handler is in a state where it can respond.
	 */
	get canRespond(): boolean;

	/**
	 * Send an error response to the client.
	 * @param error The error.
	 */
	error(error: JsonRpc.Error): Promise<void>;

	/**
	 * Send a success response to the client.
	 * @param result The result.
	 */
	success(result: JsonRpc.Result): Promise<void>;
}
