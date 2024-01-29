import type { ActionEventMessage, MultiActionPayload, SingleActionPayload, State } from "./action";
import type { DialDown, DialUp } from "./encoder";
import type { PayloadObject } from "./index";

/**
 * Occurs when the user presses a action down. Also see {@link KeyUp}.
 *
 * NB: For dials / touchscreens see {@link DialDown}.
 */
export type KeyDown<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"keyDown", KeypadPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed action. Also see {@link KeyDown}.
 *
 * NB: For dials / touchscreens see {@link DialUp}.
 */
export type KeyUp<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"keyUp", KeypadPayload<TSettings>>;

/**
 * Additional information about a keypad event that occurred.
 */
type KeypadPayload<TSettings extends PayloadObject<TSettings>> =
	| SingleActionPayload<TSettings, "Keypad">
	| (MultiActionPayload<TSettings> & {
			/**
			 * Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
			 * part of a multi-action.
			 */
			readonly userDesiredState: State;
	  });
