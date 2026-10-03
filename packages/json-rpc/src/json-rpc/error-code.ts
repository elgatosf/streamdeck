/**
 * Error codes reserved by JSON-RPC 2.0. [Learn more](https://www.jsonrpc.org/specification#error_object).
 */
export const ErrorCode = {
	/**
	 * Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.
	 */
	ParseError: -32700,

	/**
	 * 	The JSON sent is not a valid Request object.
	 */
	InvalidRequest: -32600,

	/**
	 * 	The method does not exist / is not available.
	 */
	MethodNotFound: -32601,

	/**
	 * Invalid method parameter(s).
	 */
	InvalidParams: -32602,

	/**
	 * Internal JSON-RPC error.
	 */
	InternalError: -32603,
} as const;

/**
 * Error codes reserved by JSON-RPC 2.0. [Learn more](https://www.jsonrpc.org/specification#error_object).
 */
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
