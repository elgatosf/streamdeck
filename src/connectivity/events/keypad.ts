import type { ActionEventMessage, Controller, MultiActionPayload, SingleActionPayload, State } from "./action";
import type { DialDown, DialUp } from "./encoder";
import type { PayloadObject } from "./index";

/**
 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link DialDown}. Also see {@link KeyUp}.
 */
export type KeyDown<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"keyDown", KeypadPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link DialUp}. Also see {@link KeyDown}.
 */
export type KeyUp<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"keyUp", KeypadPayload<TSettings>>;

/**
 * Additional information about a keypad event that occurred.
 */
type KeypadPayload<TSettings extends PayloadObject<TSettings>> =
	| SingleActionPayload<TSettings, Controller.Keypad>
	| (MultiActionPayload<TSettings> & {
			/**
			 * Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
			 * part of a multi-action.
			 */
			readonly userDesiredState: State;
	  });
