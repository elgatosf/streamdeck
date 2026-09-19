import type * as JsonRpc from "../json-rpc/index.js";

/**
 * A response received from a server.
 */
export type Response =
	| {
			/**
			 * Determines whether the request was successful.
			 */
			readonly ok: false;

			/**
			 * The error that occurred.
			 */
			readonly error: JsonRpc.Error;
	  }
	| {
			/**
			 * Determines whether the request was successful.
			 */
			readonly ok: true;

			/**
			 * Result of the request.
			 */
			readonly result: JsonRpc.Result;
	  };
