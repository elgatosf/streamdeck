import type { JsonObject, JsonValue } from "../../common/json";
import { type MessageResponder } from "../../common/messaging";
import type { SingletonAction } from "../actions/singleton-action";
import type { MessageHandler, MessageRequest } from "./message";
import { router } from "./router";

/**
 * Register the function as a request route. Fetch requests from the property inspector to the specified path will be routed to the function when sent from a property inspector
 * associated with this action type.
 * @param path Path of the request.
 * @returns The decorator factory.
 */
export function route<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject, TResult extends ReturnType<MessageHandler<TBody, TSettings>> = undefined>(
	path: string
): (target: MessageHandler<TBody, TSettings>, context: ClassMethodDecoratorContext<SingletonAction>) => OptionalParameterMessageHandler<TBody, TSettings, TResult> | void {
	return function (target: MessageHandler<TBody, TSettings>, context: ClassMethodDecoratorContext<SingletonAction>): void {
		context.addInitializer(function () {
			router.route(path, target.bind(this), {
				filter: (source) => source.manifestId === this.manifestId
			});
		});
	};
}

/**
 * Wraps {@link MessageHandler} to provide scoped request, with a dynamic return type.
 * @param request Request received from the property inspector.
 * @param responder Responder responsible for responding to the request.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 * @template TResult The type of the result of the request handler.
 */
type OptionalParameterMessageHandler<TBody extends JsonValue, TSettings extends JsonObject, TResult> = (
	request?: MessageRequest<TBody, TSettings>,
	responder?: MessageResponder
) => TResult;
