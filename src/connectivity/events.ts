import type { DeviceInfo } from "./device-info";
import { DeviceType } from "./device-info";

/**
 * Represents an event that is emitted by the Stream Deck.
 */
export type EventIdentifier<TEvent> = {
	/**
	 * Name of the event used to identify what occurred.
	 */
	readonly event: TEvent;
};

/**
 * Provide information that identifies a device associated with an event.
 */
export type DeviceIdentifier = {
	/**
	 * Unique identifier of the Stream Deck device that this event is associated with.
	 */
	readonly device: string;
};

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
type ActionEvent<TEvent, TSettings = void, TPayload = void> = DeviceIdentifier &
	EventIdentifier<TEvent> &
	(TPayload extends void
		? ActionIdentifier
		: ActionIdentifier & {
				/**
				 * Additional information about the action and event that occurred.
				 */
				readonly payload: TPayload & {
					/**
					 * Coordinates that identify the location of the action.
					 */
					readonly coordinates?: Coordinates;

					/**
					 * Settings associated with the action instance.
					 */
					settings: TSettings;
				};
		  });

/**
 * Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the property inspector.
 */
export type DidReceiveSettings<TSettings = unknown> = ActionEvent<
	"didReceiveSettings",
	TSettings,
	{
		/**
		 * Determines whether the action is part of a multi-action.
		 */
		readonly isInMultiAction: boolean;
	}
>;

/**
 * Occurs when the plugin receives the global settings from the Stream Deck.
 */
export type DidReceiveGlobalSettings<TSettings = unknown> = EventIdentifier<"didReceiveGlobalSettings"> & {
	/**
	 * Additional information about the event that occurred.
	 */
	readonly payload: {
		/**
		 * Global settings associated with this plugin.
		 */
		readonly settings: TSettings;
	};
};

/**
 * Occurs when the user taps the touchscreen (Stream Deck+).
 */
export type TouchTap<TSettings = unknown> = ActionEvent<
	"touchTap",
	TSettings,
	{
		/**
		 * Determines whether the tap was considered "held".
		 */
		readonly hold: boolean;

		/**
		 * Coordinates of where the touchscreen tap occurred, relative to the canvas of the action.
		 */
		readonly tapPos: [x: number, y: number];
	}
>;

/**
 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link KeyDown}. Also see {@link DialUp}.
 */
export type DialDown<TSettings = unknown> = ActionEvent<
	"dialDown",
	TSettings,
	{
		/**
		 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
		 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
		 */
		readonly controller: Extract<Controller, "Encoder">;
	}
>;

/**
 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link KeyUp}. Also see {@link DialDown}.
 */
export type DialUp<TSettings = unknown> = ActionEvent<"dialUp", TSettings, DialDown<TSettings>["payload"]>;

/**
 * Occurs when the user rotates a dial (Stream Deck+).
 */
export type DialRotate<TSettings = unknown> = ActionEvent<
	"dialRotate",
	TSettings,
	{
		/**
		 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
		 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
		 */
		readonly controller: Extract<Controller, "Encoder">;

		/**
		 * Determines whether the dial was pressed whilst the rotation occurred.
		 */
		readonly pressed: boolean;

		/**
		 * Number of ticks the dial was rotated; this can be a positive (clockwise) or negative (counter-clockwise) number.
		 */
		readonly ticks: number;
	}
>;

/**
 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link DialDown}. Also see {@link KeyUp}.
 */
export type KeyDown<TSettings = unknown> = ActionEvent<
	"keyDown",
	TSettings,
	{
		/**
		 * Determines whether the action is part of a multi-action.
		 */
		readonly isInMultiAction: boolean;

		/**
		 * Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
		 */
		readonly state?: State;

		/**
		 * Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
		 * part of a multi-action.
		 */
		readonly userDesiredState?: State;
	}
>;

/**
 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link DialUp}. Also see {@link KeyDown}.
 */
export type KeyUp<TSettings = unknown> = ActionEvent<"keyUp", TSettings, KeyDown<TSettings>["payload"]>;

/**
 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
 * page". An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillAppear<TSettings = unknown> = ActionEvent<
	"willAppear",
	TSettings,
	{
		/**
		 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
		 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
		 */
		readonly controller?: Controller;

		/**
		 * Determines whether the action is part of a multi-action.
		 */
		readonly isInMultiAction: boolean;

		/**
		 * Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
		 */
		readonly state?: State;
	}
>;

/**
 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillDisappear<TSettings = unknown> = ActionEvent<"willDisappear", TSettings, WillAppear<TSettings>["payload"]>;

/**
 * Occurs when the user updates an action's title settings in the Stream Deck application.
 */
export type TitleParametersDidChange<TSettings = unknown> = ActionEvent<
	"titleParametersDidChange",
	TSettings,
	{
		/**
		 * Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
		 */
		readonly state?: State;

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
 * Occurs when a Stream Deck device is connected. Also see {@link DeviceDidDisconnect}.
 */
export type DeviceDidConnect = DeviceIdentifier &
	EventIdentifier<"deviceDidConnect"> & {
		/**
		 * Information about the newly connected device.
		 */
		readonly deviceInfo: DeviceInfo;
	};

/**
 * Occurs when a Stream Deck device is disconnected. Also see {@link DeviceDidConnect}.
 */
export type DeviceDidDisconnect = DeviceIdentifier & EventIdentifier<"deviceDidDisconnect">;

/**
 * Provides information about a monitored application. See {@link ApplicationDidLaunch} and {@link ApplicationDidTerminate}.
 */
type ApplicationEvent<TEvent> = EventIdentifier<TEvent> & {
	/**
	 * Payload containing information about the application that triggered the event.
	 */
	readonly payload: {
		/**
		 * Name of the application that triggered the event.
		 */
		readonly application: string;
	};
};

/**
 * Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. Also see
 * {@link ApplicationDidTerminate}.
 */
export type ApplicationDidLaunch = ApplicationEvent<"applicationDidLaunch">;

/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. Also see
 * {@link ApplicationDidLaunch}.
 */
export type ApplicationDidTerminate = ApplicationEvent<"applicationDidTerminate">;

/**
 * Occurs when the computer wakes up.
 */
export type SystemDidWakeUp = EventIdentifier<"systemDidWakeUp">;

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link PropertyInspectorDidDisappear}.
 */
export type PropertyInspectorDidAppear = ActionEvent<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link PropertyInspectorDidAppear}.
 */
export type PropertyInspectorDidDisappear = ActionEvent<"propertyInspectorDidDisappear">;

/**
 * Occurs when a message was sent to the plugin _from_ the property inspector.
 */
export type SendToPlugin<TPayload extends object = object> = Omit<ActionEvent<"sendToPlugin">, keyof DeviceIdentifier> & {
	/**
	 * Payload sent to the plugin from the property inspector.
	 */
	readonly payload: TPayload;
};

/**
 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal
 * on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
 */
export type Controller = "Encoder" | "Keypad";

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

/**
 * Events received by the plugin, from the Stream Deck.
 */
export type Event<TSettings = unknown> =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<TSettings>
	| DialRotate<TSettings>
	| DialUp<TSettings>
	| DidReceiveGlobalSettings
	| DidReceiveSettings<TSettings>
	| KeyDown<TSettings>
	| KeyUp<TSettings>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SendToPlugin
	| SystemDidWakeUp
	| TitleParametersDidChange<TSettings>
	| TouchTap<TSettings>
	| WillAppear<TSettings>
	| WillDisappear<TSettings>;
