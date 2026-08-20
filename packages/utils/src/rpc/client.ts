import type { JsonValue } from "../json.js";
import { JsonRpcErrorCode } from "./json-rpc/error.js";
import type { JsonRpcRequest } from "./json-rpc/request.js";
import { JsonRpcResponse } from "./json-rpc/response.js";
import { type RpcRequestOptions, type RpcRequestParameters } from "./request.js";
import { type RpcErrorResponse, type RpcResponse, type RpcResponseResult } from "./response.js";
import type { RpcSender } from "./sender.js";

/**
 * Client capable of sending requests to, and receiving responses from, a server.
 */
export class RpcClient {
	/**
	 * The timeout, in milliseconds, used when the request does not have a timeout specified; default 30 seconds.
	 */
	static readonly #DEFAULT_TIMEOUT = 30000;

	/**
	 * The client's options.
	 */
	readonly #options: Required<RpcClientOptions>;

	/**
	 * Function responsible for sending requests.
	 */
	readonly #send: RpcSender;

	/**
	 * Requests with pending responses.
	 */
	readonly #requests = new Map<string, (res: RpcResponse) => void>();

	/**
	 * Initializes a new instance of the {@link RpcClient} class.
	 * @param send Function responsible for sending requests.
	 * @param options Client options.
	 */
	constructor(send: RpcSender, options?: RpcClientOptions) {
		this.#send = send;
		this.#options = {
			...{ error: (): void => {} },
			...options,
		};
	}

	/**
	 * Sends a notification to the RPC server.
	 * @param request The request.
	 */
	public async notify(request: RpcRequestOptions): Promise<void>;
	/**
	 * Sends a notification to the RPC server.
	 * @param method Name of the method to invoke.
	 * @param params Parameters to be used during the invocation of the method.
	 */
	public async notify(method: string, params?: RpcRequestParameters): Promise<void>;
	/**
	 * Sends a notification to the RPC server.
	 * @param methodOrRequest The method name, or the request.
	 * @param params Parameters to be used during the invocation of the method.
	 */
	public async notify(methodOrRequest: RpcRequestOptions | string, params?: RpcRequestParameters): Promise<void> {
		if (typeof methodOrRequest === "string") {
			await this.#send({
				jsonrpc: "2.0",
				method: methodOrRequest,
				params,
			} satisfies JsonRpcRequest);
		} else {
			await this.#send({
				jsonrpc: "2.0",
				method: methodOrRequest.method,
				params: methodOrRequest.params,
			} satisfies JsonRpcRequest);
		}
	}

	/**
	 * Attempts to process the specified value as a response from a server.
	 * @param value Value to process.
	 * @returns `true` when the client was able to process the value as a response; otherwise `false`.
	 */
	public async receive(value: JsonValue): Promise<boolean> {
		const { success, data: response } = JsonRpcResponse.safeParse(value);
		if (!success) {
			return false;
		}

		if ("result" in response) {
			this.#resolve(response.id, {
				ok: true,
				result: response.result,
			});
		} else {
			const err: RpcErrorResponse = {
				ok: false,
				error: response.error,
			};

			if (response.id === undefined) {
				this.#options.error(err);
			} else {
				this.#resolve(response.id, err);
			}
		}

		return true;
	}

	/**
	 * Sends the request to the RPC server.
	 * @param request The request.
	 * @returns The response.
	 */
	public async request<TResult extends RpcResponseResult>(request: RpcRequestOptions): Promise<RpcResponse<TResult>>;
	/**
	 * Sends the request to the RPC server.
	 * @param method Name of the method to invoke.
	 * @param params Parameters to be used during the invocation of the method.
	 * @returns The response.
	 */
	public async request<TResult extends RpcResponseResult>(
		method: string,
		params?: RpcRequestParameters,
	): Promise<RpcResponse<TResult>>;
	/**
	 * Sends the request to the RPC server.
	 * @param methodOrRequest The method name, or the request.
	 * @param params Parameters to be used during the invocation of the method.
	 * @returns The response.
	 */
	public async request<TResult extends RpcResponseResult>(
		methodOrRequest: RpcRequestOptions | string,
		params?: RpcRequestParameters,
	): Promise<RpcResponse<TResult>> {
		if (typeof methodOrRequest === "string") {
			return this.#sendRequest({
				method: methodOrRequest,
				params,
			});
		} else {
			return this.#sendRequest(methodOrRequest);
		}
	}

	/**
	 * Resolves pending requests.
	 * @param id The request identifier.
	 * @param response The response.
	 */
	#resolve(id: string, response: RpcResponse): void {
		// Get the handler
		const handler = this.#requests.get(id);
		this.#requests.delete(id);

		// Provide the result or error to the handler.
		if (handler) {
			handler(response);
		}
	}

	/**
	 * Sends the request to the RPC server.
	 * @param request The request.
	 * @returns The response.
	 */
	async #sendRequest<TResult extends RpcResponseResult = null>(
		request: RpcRequestOptions,
	): Promise<RpcResponse<TResult>> {
		const id = crypto.randomUUID();
		const { method, params, timeout = RpcClient.#DEFAULT_TIMEOUT } = request;

		// Initialize the response handler.
		const response = new Promise<RpcResponse<TResult>>((resolve) => {
			this.#requests.set(id, (res) => {
				clearTimeout(timeoutMonitor);
				resolve(res as RpcResponse<TResult>);
			});
		});

		// Start the timeout, and send the request.
		const timeoutMonitor = setTimeout(() => {
			this.#resolve(id, {
				ok: false,
				error: {
					code: JsonRpcErrorCode.InternalError,
					message: "The request timed out.",
				},
			});
		}, timeout);

		await this.#send({ jsonrpc: "2.0", method, params, id } satisfies JsonRpcRequest);
		return response;
	}
}

/**
 * Options for an RPC client.
 */
export type RpcClientOptions = {
	/**
	 * Function invoked when an error response was received that was not associated with a request.
	 * @param response The response.
	 */
	error?: (response: RpcErrorResponse) => void;
};
