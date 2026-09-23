import type * as JsonRpc from "../json-rpc/index.js";
import type { Responder } from "./responder.js";

/**
 * Delegate responsible for handling an inbound request or notification.
 */
export type MethodHandler<TParams extends JsonRpc.Parameters> = (
	params: TParams,
	res: Responder,
	next: () => MethodResult,
) => MethodResult;

/**
 * Result of the invocation of an inbound request or notification.
 */
export type MethodResult = JsonRpc.Result | Promise<JsonRpc.Result | void> | void;
