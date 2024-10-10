import type { JsonObject, JsonValue } from "../../common/json";
import type { MessageResponder, UnscopedMessageHandler, UnscopedMessageRequest } from "../../common/messaging";
import type { Action } from "../actions/action";

/**
 * Message request received from the property inspector.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 */
export type MessageRequest<
	TBody extends JsonValue = JsonValue,
	TSettings extends JsonObject = JsonObject,
> = UnscopedMessageRequest<Action<TSettings>, TBody>;

/**
 * Function responsible for handling requests received from the property inspector.
 * @param request Request received from the property inspector
 * @param responder Optional responder capable of sending a response; when no response is sent, a `200` is returned.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 */
export type MessageHandler<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject> = (
	request: MessageRequest<TBody, TSettings>,
	responder: MessageResponder,
) => ReturnType<UnscopedMessageHandler<Action<TSettings>, TBody>>;
