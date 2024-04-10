import type { Controller, DeviceType } from "@elgato/schemas/streamdeck/plugins";
import type { JsonObject } from "../../common/json";
import type { DeviceIdentifier } from "./device";
import type { EventIdentifier } from "./index";

/**
 * Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the property inspector.
 */
export type DidReceiveSettings<TSettings extends JsonObject> = ActionEventMessage<"didReceiveSettings", MultiActionPayload<TSettings> | SingleActionPayload<TSettings>>;

/**
 * Occurs when the user updates an action's title settings in the Stream Deck application.
 */
export type TitleParametersDidChange<TSettings extends JsonObject> = ActionEventMessage<
	"titleParametersDidChange",
	Omit<SingleActionPayload<TSettings>, "isInMultiAction"> & {
		/**
		 * Title of the action, as specified by the user or dynamically by the plugin.
		 */
		readonly title: string;

		/**
		 * Defines aesthetic properties that determine how the title should be rendered.
		 */
		readonly titleParameters: {
			/**
			 * Font-family the title will be rendered with.
			 */
			readonly fontFamily: string;

			/**
			 * Font-size the title will be rendered in.
			 */
			readonly fontSize: number;

			/**
			 * Typography of the title.
			 */
			readonly fontStyle: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";

			/**
			 * Determines whether the font should be underlined.
			 */
			readonly fontUnderline: boolean;

			/**
			 * Determines whether the user has opted to show, or hide the title for this action instance.
			 */
			readonly showTitle: boolean;

			/**
			 * Alignment of the title.
			 */
			readonly titleAlignment: "bottom" | "middle" | "top";

			/**
			 * Color of the title, represented as a hexadecimal value.
			 */
			readonly titleColor: string;
		};
	}
>;

/**
 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
 * page". An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillAppear<TSettings extends JsonObject> = ActionEventMessage<"willAppear", MultiActionPayload<TSettings> | SingleActionPayload<TSettings>>;

/**
 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillDisappear<TSettings extends JsonObject> = ActionEventMessage<"willDisappear", MultiActionPayload<TSettings> | SingleActionPayload<TSettings>>;

/**
 * Provide information that identifies an action associated with an event.
 */
export type ActionIdentifier = {
	/**
	 * Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
	 */
	readonly action: string;

	/**
	 * Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
	 * request settings associated with the action instance, etc.
	 */
	readonly context: string;
};

/**
 * Provides information for an event relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type ActionEventMessage<TEvent extends string, TPayload = void> = DeviceIdentifier &
	EventIdentifier<TEvent> &
	(TPayload extends void
		? ActionIdentifier
		: ActionIdentifier & {
				/**
				 * Additional information about the action and event that occurred.
				 */
				readonly payload: TPayload;
		  });

/**
 * Additional information about the action and event that occurred as part of a single-action event.
 */
export type SingleActionPayload<TSettings extends JsonObject, TController extends Controller = Controller> = ActionPayload<TSettings> & {
	/**
	 * Coordinates that identify the location of an action.
	 */
	readonly coordinates: Coordinates;

	/**
	 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
	 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
	 */
	readonly controller: TController;

	/**
	 * Determines whether the action is part of a multi-action.
	 */
	readonly isInMultiAction: false;
};

/**
 * Additional information about the action and event that occurred as part of a multi-action event.
 */
export type MultiActionPayload<TSettings extends JsonObject> = ActionPayload<TSettings> & {
	/**
	 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
	 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
	 *
	 * NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
	 */
	readonly controller: "Keypad";

	/**
	 * Determines whether the action is part of a multi-action.
	 */
	readonly isInMultiAction: true;
};

/**
 * Base payload provided as part of events received, relating to an action.
 */
type ActionPayload<TSettings extends JsonObject> = {
	/**
	 * Settings associated with the action instance.
	 */
	settings: TSettings;

	/**
	 * Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
	 */
	readonly state?: State;
};

/**
 * Coordinates that identify the location of an action.
 */
export type Coordinates = {
	/**
	 * Column the action instance is located in, indexed from 0.
	 */
	readonly column: number;

	/**
	 * Row the action instance is located on, indexed from 0. *NB* When the device is {@link DeviceType.StreamDeckPlus} the row can be 0 for keys (`Keypad`), and will _always_ be 0
	 * for dials (`Encoder`); to differentiate between actions types, cross-check the value of `controller` found on {@link WillAppear.payload}.
	 */
	readonly row: number;
};

/**
 * Possible states an action can be in. This only applies to actions that have multiple states defined in the plugin's manifest.json file.
 */
export type State = 0 | 1;
