import { EventEmitter, type IDisposable } from "@elgato/utils";

import * as JsonRpc from "../json-rpc/index.js";
import type { MethodHandler } from "./method-handler.js";
import type { Responder } from "./responder.js";

/**
 * Dispatcher responsible for routing inbound requests to their handlers.
 */
export class MethodDispatcher {
	/**
	 * Methods registered with the dispatcher.
	 */
	readonly #methods = new EventEmitter<DispatcherEventMap>();

	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @returns Disposable used to remove the handler.
	 */
	public add(method: string, handler: MethodHandler<JsonRpc.Parameters>): IDisposable {
		return this.#methods.disposableOn(method, handler);
	}

	/**
	 * Dispatches the method, calling all handlers associated with it.
	 *
	 * When no handlers are associated with the method, an error response is sent to the client.
	 * @param method Method name.
	 * @param params Request parameters.
	 * @param responseHandler Response handler.
	 */
	public async dispatch(method: string, params: JsonRpc.Parameters, responseHandler: Responder): Promise<void> {
		const methods = this.#methods.listeners(method);
		if (methods.length > 0) {
			await this.#invoke(methods, params, responseHandler);
		} else {
			responseHandler.error({
				code: JsonRpc.ErrorCode.MethodNotFound,
				message: `No method handlers found for: ${method}`,
			});
		}
	}

	/**
	 * Invokes the specified methods with the request information, and send the result to the response.
	 * @param methods Methods to invoke.
	 * @param params Request parameters.
	 * @param responseHandler Response handler.
	 */
	async #invoke(
		methods: MethodHandler<JsonRpc.Parameters>[],
		params: JsonRpc.Parameters,
		responseHandler: Responder,
	): Promise<void> {
		// `next` function used to chain methods.
		const next = (methods: MethodHandler<JsonRpc.Parameters>[]) => {
			return (): ReturnType<MethodHandler<JsonRpc.Parameters>> => {
				const [curr, ...rest] = methods;
				if (curr === undefined) {
					return null;
				}

				return curr(params, responseHandler, next(rest));
			};
		};

		try {
			// Execute the method handler-chain, and return the result.
			const result = await next(methods)();
			if (responseHandler.canRespond) {
				responseHandler.success(result ?? null);
			}
		} catch (err) {
			// Respond with the error.
			responseHandler.error({
				code: JsonRpc.ErrorCode.InternalError,
				data: JSON.parse(JSON.stringify(err)),
				message: err instanceof Error ? err.message : err instanceof Object ? err.toString() : "Unknown error",
			});
		}
	}
}

/**
 * Event map for methods registered with a dispatcher.
 */
interface DispatcherEventMap {
	[method: string]: [...Parameters<MethodHandler<JsonRpc.Parameters>>];
}
