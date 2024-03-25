import type { JsonObject, JsonValue } from "../../common/json";
import type { MessageRequest as InternalMessageRequest } from "../../common/messaging";
import type { Action } from "../actions/action";

export { ui, type UIController } from "./controller";
export { type PropertyInspector } from "./property-inspector";
export { route } from "./route";

/**
 * Message request received from the property inspector.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 */
export type MessageRequest<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject> = InternalMessageRequest<Action<TSettings>, TBody>;
