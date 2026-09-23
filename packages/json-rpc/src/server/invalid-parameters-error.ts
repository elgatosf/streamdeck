import type { JsonValue } from "@elgato/utils";

import * as JsonRpc from "../json-rpc/index.js";

/**
 * Error thrown when a method is invoked with invalid parameters.
 */
export class InvalidParametersError extends Error {
	/**
	 * The error code.
	 */
	public readonly code = JsonRpc.ErrorCode.InvalidParams;

	/**
	 * The invalid parameters.
	 */
	public readonly params: JsonValue;

	/**
	 * Initializes a new instance of the {@link InvalidParametersError} class
	 * @param params The parameters.
	 */
	constructor(params: JsonValue) {
		super("Invalid method parameter(s).");
		this.params = params;
	}
}
