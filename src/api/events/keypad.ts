import type { JsonObject } from "../../common/json";
import type { ActionEventMessage, MultiActionPayload, SingleActionPayload, State } from "./action";
import type { DialDown, DialUp } from "./encoder";

/**
 * Occurs when the user presses a action down. See also {@link KeyUp}.
 *
 * NB: For dials / touchscreens see {@link DialDown}.
 */
export type KeyDown<TSettings extends JsonObject> = ActionEventMessage<"keyDown", SingleActionPayload<TSettings, "Keypad"> | KeyGestureMultiActionPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed action. See also {@link KeyDown}.
 *
 * NB: For dials / touchscreens see {@link DialUp}.
 */
export type KeyUp<TSettings extends JsonObject> = ActionEventMessage<"keyUp", SingleActionPayload<TSettings, "Keypad"> | KeyGestureMultiActionPayload<TSettings>>;

/**
 * Additional information about the action and event that occurred as part of a multi-action event.
 */
type KeyGestureMultiActionPayload<TSettings extends JsonObject> = MultiActionPayload<TSettings> & {
	/**
	 * Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
	 * part of a multi-action.
	 */
	readonly userDesiredState: State;
};
