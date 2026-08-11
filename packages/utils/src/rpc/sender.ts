import type { JsonRpcRequest } from "./json-rpc/request.js";
import type { JsonRpcResponse } from "./json-rpc/response.js";

/**
 * Function responsible for sending requests and responses
 * @param value Request or response to send.
 */
export type RpcSender = (value: JsonRpcRequest | JsonRpcResponse) => Promise<void>;
