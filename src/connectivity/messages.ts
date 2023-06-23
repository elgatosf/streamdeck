/**
 * Represents an event that is emitted from, or sent to, the Stream Deck.
 */
export type Message<TEvent> = {
	/**
	 * Name of the event used to identify what occurred, or what is being requested.
	 */
	readonly event: TEvent;
};

/**
 * Provides information for a message relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type ActionMessage<TEvent> = Message<TEvent> & {
	/**
	 * Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
	 */
	readonly action: string;

	/**
	 * Identifies the instance of an action that caused the message, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
	 * request settings associated with the action instance, etc.
	 */
	readonly context: string;

	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
	 */
	readonly device: string;
};

/**
 * Provides information for a message relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type ActionMessageWithPayload<TEvent, TSettings, TPayload> = ActionMessage<TEvent> & {
	/**
	 * Additional information about the action and event that occurred.
	 */
	readonly payload: TPayload & {
		/**
		 * Coordinates that identify the location of the action.
		 */
		readonly coordinates: Coordinates;

		/**
		 * Settings associated with the action instance.
		 */
		readonly settings: Partial<TSettings>;
	};
};

/**
 * Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the property inspector.
 */
export type DidReceiveSettings<TSettings = unknown> = ActionMessageWithPayload<
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
export type DidReceiveGlobalSettings<TSettings = unknown> = Message<"didReceiveGlobalSettings"> & {
	/**
	 * Additional information about the event that occurred.
	 */
	readonly payload: {
		/**
		 * Global settings associated with this plugin.
		 */
		readonly settings: Partial<TSettings>;
	};
};

/**
 * Occurs when the user taps the touchscreen (Stream Deck+).
 */
export type TouchTap<TSettings = unknown> = ActionMessageWithPayload<
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
export type DialDown<TSettings = unknown> = ActionMessageWithPayload<
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
export type DialUp<TSettings = unknown> = ActionMessageWithPayload<"dialUp", TSettings, DialDown<TSettings>["payload"]>;

/**
 * Occurs when the user rotates a dial (Stream Deck+).
 */
export type DialRotate<TSettings = unknown> = ActionMessageWithPayload<
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
export type KeyDown<TSettings = unknown> = ActionMessageWithPayload<
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
export type KeyUp<TSettings = unknown> = ActionMessageWithPayload<"keyUp", TSettings, KeyDown<TSettings>["payload"]>;

/**
 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
 * page". An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillAppear<TSettings = unknown> = ActionMessageWithPayload<
	"willAppear",
	TSettings,
	{
		/**
		 * Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
		 * or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
		 */
		readonly controller: Controller;

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
export type WillDisappear<TSettings = unknown> = ActionMessageWithPayload<"willDisappear", TSettings, WillAppear<TSettings>["payload"]>;

/**
 * Occurs when the user updates an action's title settings in the Stream Deck application.
 */
export type TitleParametersDidChange<TSettings = unknown> = ActionMessageWithPayload<
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
export type DeviceDidConnect = Message<"deviceDidConnect"> & {
	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
	 */
	readonly device: string;

	/**
	 * Information about the newly connected device.
	 */
	readonly deviceInfo: DeviceInfo;
};

/**
 * Occurs when a Stream Deck device is disconnected. Also see {@link DeviceDidConnect}.
 */
export type DeviceDidDisconnect = Message<"deviceDidDisconnect"> & {
	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
	 */
	readonly device: string;
};

/**
 * Provides information about a monitored application. See {@link ApplicationDidLaunch} and {@link ApplicationDidTerminate}.
 */
type ApplicationMessage<TEvent> = Message<TEvent> & {
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
export type ApplicationDidLaunch = ApplicationMessage<"applicationDidLaunch">;

/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. Also see
 * {@link ApplicationDidLaunch}.
 */
export type ApplicationDidTerminate = ApplicationMessage<"applicationDidTerminate">;

/**
 * Occurs when the computer wakes up.
 */
export type SystemDidWakeUp = Message<"systemDidWakeUp">;

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link PropertyInspectorDidDisappear}.
 */
export type PropertyInspectorDidAppear = ActionMessage<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link PropertyInspectorDidAppear}.
 */
export type PropertyInspectorDidDisappear = ActionMessage<"propertyInspectorDidDisappear">;

/**
 * Occurs when a message was sent to the plugin _from_ the property inspector.
 */
export type SendToPlugin<TPayload extends object = object> = Omit<ActionMessage<"sendToPlugin">, "device"> & {
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
 * Provides information for a device.
 */
export type DeviceInfo = {
	/**
	 * Name of the device, as specified by the user in the Stream Deck application.
	 */
	readonly name: string;

	/**
	 * Number of action slots available to the device. NB. The size denotes keys only.
	 */
	readonly size: Size;

	/**
	 * Type of the device that was connected, e.g. Stream Deck+, Stream Deck Pedal, etc. See {@link DeviceType}.
	 */
	readonly type: DeviceType;
};

/**
 * Possible states an action can be in. This only applies to actions that have multiple states defined in the plugin's manifest.json file.
 */
export type State = 0 | 1;

/**
 * Size of the Stream Deck device.
 */
export type Size = {
	/**
	 * Number of columns available on the Stream Deck device.
	 */
	readonly columns: number;

	/**
	 * Number of rows available on the Stream Deck device.
	 */
	readonly rows: number;
};

/**
 * Stream Deck devices.
 */
export enum DeviceType {
	/**
	 * Stream Deck, comprising of 15 buttons in a 5x3 layout.
	 */
	StreamDeck = 0,

	/**
	 * Stream Deck Mini, comprising of 6 buttons in a 3x2 layout.
	 */
	StreamDeckMini = 1,

	/**
	 * Stream Deck XL, comprising of 32 buttons in an 8x4 layout.
	 */
	StreamDeckXL = 2,

	/**
	 * Stream Deck Mobile for iOS and Android.
	 */
	StreamDeckMobile = 3,

	/**
	 * Corsair G Keys, buttons available on selected Corsair keyboards.
	 */
	CorsairGKeys = 4,

	/**
	 * Stream Deck Pedal.
	 */
	StreamDeckPedal = 5,

	/**
	 * Corsair Voyager laptop, comprising 10 buttons in a horizontal line above the keyboard.
	 */
	CorsairVoyager = 6,

	/**
	 * Stream Deck+, comprising of 8 buttons in a 4x2 layout and 4 dials with accompanying touch screen.
	 */
	StreamDeckPlus = 7
}

/**
 * s sent to the plugin, from the Stream Deck.
 */
export type InboundMessages<TSettings = unknown> =
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

/**
 * s sent from the plugin, to the Stream Deck.
 */
export type OutboundMessages =
	| "getGlobalSettings"
	| "getSettings"
	| "logMessage"
	| "openUrl"
	| "sendToPropertyInspector"
	| "setFeedback"
	| "setFeedbackLayout"
	| "setGlobalSettings"
	| "setImage"
	| "setSettings"
	| "setState"
	| "setTitle"
	| "showAlert"
	| "showOk"
	| "switchToProfile";
