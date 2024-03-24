import type { JsonObject, JsonValue } from "../../common/json";
import type { MessageRequest as InternalMessageRequest } from "../../common/messaging";
import type { Action } from "../actions/action";

export { ui, type UIController } from "./controller";
export { type PropertyInspector } from "./property-inspector";
export { route } from "./routing";

/**
 * Message request received from the property inspector.
 * @template TBody Body type sent with the request.
 * @template TSettings Settings type associated with the action.
 */
export type MessageRequest<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject> = InternalMessageRequest<Action<TSettings>, TBody>;
