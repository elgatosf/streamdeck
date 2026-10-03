import type * as JsonRpc from "./json-rpc/index.js";

/**
 * Options for a JSON-RPC connection.
 */
export interface JsonRpcConnectionOptions {
	/**
	 * Stream responsible for receiving data.
	 */
	inboundStream: ReadableStream<JsonRpc.Request | JsonRpc.Response | string>;

	/**
	 * Stream responsible for sending data.
	 */
	outboundStream: WritableStream<JsonRpc.Request | JsonRpc.Response>;
}
