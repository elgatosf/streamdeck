import { EventEmitter, type IDisposable } from "@elgato/utils";
import type { ZodType } from "zod";
import { z } from "zod/mini";

import * as JsonRpc from "../json-rpc/index.js";
import { InvalidParametersError } from "./invalid-parameters-error.js";
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
	public add(method: string, handler: MethodHandler<JsonRpc.Parameters>): IDisposable;
	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @param paramsSchema Schema responsible for parsing the parameters.
	 * @returns Disposable used to remove the handler.
	 */
	public add<TParametersSchema extends JsonRpc.Parameters>(
		method: string,
		handler: MethodHandler<TParametersSchema>,
		paramsSchema: z.ZodMiniType<TParametersSchema, TParametersSchema> | ZodType<TParametersSchema, TParametersSchema>,
	): IDisposable;
	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @param paramsSchema Schema responsible for parsing the parameters.
	 * @returns Disposable used to remove the handler.
	 */
	public add<TParams extends JsonRpc.Parameters>(
		method: string,
		handler: MethodHandler<TParams>,
		paramsSchema?: z.ZodMiniType<TParams, TParams> | ZodType<TParams, TParams>,
	): IDisposable {
		if (!paramsSchema) {
			return this.#methods.disposableOn(method, handler);
		}

		return this.#methods.disposableOn(method, (params, res, next) => {
			if (z.validate(paramsSchema, params)) {
				return handler(params, res, next);
			} else {
				throw new InvalidParametersError(params);
			}
		});
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
			await responseHandler.error({
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

		let result: JsonRpc.Result | void;
		try {
			// Execute the method handler-chain, and set the result.
			result = await next(methods)();
		} catch (err) {
			// Respond with the error.
			if (err instanceof InvalidParametersError) {
				await responseHandler.error({
					code: err.code,
					data: err.params,
					message: err.message,
				});
			} else {
				const data = this.#serializeError(err);
				await responseHandler.error({
					code: JsonRpc.ErrorCode.InternalError,
					...(data === undefined ? {} : { data }),
					message: err instanceof Error ? err.message : err instanceof Object ? err.toString() : "Unknown error",
				});
			}

			return;
		}

		// Finally, when we can, respond with the result.
		if (responseHandler.canRespond) {
			await responseHandler.success(result ?? null);
		}
	}

	/**
	 * Converts a thrown value to JSON-compatible error data when possible.
	 * @param error Thrown value.
	 * @returns JSON-compatible error data, or undefined when the value cannot be serialized.
	 */
	#serializeError(error: unknown): JsonRpc.Error["data"] {
		try {
			const value = JSON.stringify(error);
			return value === undefined ? undefined : JSON.parse(value);
		} catch {
			return undefined;
		}
	}
}

/**
 * Event map for methods registered with a dispatcher.
 */
interface DispatcherEventMap {
	[method: string]: [...Parameters<MethodHandler<JsonRpc.Parameters>>];
}
