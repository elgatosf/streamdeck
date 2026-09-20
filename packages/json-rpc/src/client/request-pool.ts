import * as JsonRpc from "../json-rpc/index.js";
import type { Request } from "./request.js";
import type { Response } from "./response.js";

/**
 * Maintains a collection of pending requests.
 */
export class RequestPool {
	/**
	 * Default request timeout in milliseconds; default is 30 seconds.
	 */
	static readonly #DEFAULT_TIMEOUT = 30000;

	/**
	 * Stream responsible for sending data.
	 */
	readonly #outboundStream: WritableStream<JsonRpc.Request>;

	/**
	 * Requests with pending responses.
	 */
	readonly #requests = new Map<JsonRpc.Id, (res: Response) => void>();

	/**
	 * Initializes a new instance of the {@link RequestPool} class.
	 * @param outboundStream Stream responsible for sending data.
	 */
	constructor(outboundStream: WritableStream<JsonRpc.Request>) {
		this.#outboundStream = outboundStream;
	}

	/**
	 * Resolves a pending request associated with the response.
	 * @param response The response used to resolve the request.
	 */
	public resolve(response: JsonRpc.Response): void {
		const { id } = response;

		// TODO: Provide better handling for unidentifiable errors.
		if (id == null) {
			return;
		}

		// Get the pending request.
		const handler = this.#requests.get(id);
		this.#requests.delete(id);

		// Resolve the request.
		if (handler) {
			if ("result" in response) {
				handler({
					ok: true,
					result: response.result,
				});
			} else {
				handler({
					ok: false,
					error: response.error,
				});
			}
		}
	}

	/**
	 * Sends the requests to the outbound stream, and adds it to the request pool. The request can then
	 * later be resolved externally.
	 * @param request Request to send, and add to the pool.
	 * @returns Promise that resolves to the request's response.
	 */
	public async send(request: Request): Promise<Response> {
		const id = crypto.randomUUID();
		const { method, params, timeout = RequestPool.#DEFAULT_TIMEOUT } = request;

		// Initialize the response handler.
		const response = new Promise<Response>((resolve) => {
			this.#requests.set(id, (res) => {
				clearTimeout(timeoutMonitor);
				resolve(res as Response);
			});
		});

		// Start the timeout, and send the request.
		const timeoutMonitor = setTimeout(() => {
			this.resolve({
				jsonrpc: "2.0",
				id,
				error: {
					code: JsonRpc.ErrorCode.InternalError,
					message: "The request timed out.",
				},
			});
		}, timeout);

		await this.#send({ jsonrpc: "2.0", method, params, id });
		return response;
	}

	/**
	 * Sends the JSON-RPC value to the outbound stream.
	 * @param value Value to send.
	 */
	async #send(value: JsonRpc.Request): Promise<void> {
		const writer = this.#outboundStream.getWriter();
		try {
			await writer.write(value);
		} finally {
			writer.releaseLock();
		}
	}
}
