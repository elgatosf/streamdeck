import { DeviceType } from "./enums";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest = {
	/**
	 * Collection of actions provided by the plugin, and all of their information; this can include actions that are available to user's via the actions list, and actions that are
	 * hidden to the user but available to pre-defined profiles distributed with the plugin (`Manifest.Actions.VisibleInActionsList`).
	 */
	Actions: {
		/**
		 * Defines the controller type the action is applicable to. A **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck
		 * MK.2, or a pedal on the Stream Deck Pedal, whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
		 */
		Controllers?: [Controller, Controller?];

		/**
		 * Determines whether the state of the action should automatically toggle when two states are defined. Default is `false`.
		 * @example
		 * "DisableAutomaticStates": false;
		 * // 1. State: ONE
		 * // 2. Action activated (e.g. press).
		 * // 3. State: TWO
		 * // 4. Action activated.
		 * // 5. State: ONE
		 * @example
		 * "DisableAutomaticStates": true;
		 * // 1. State: ONE
		 * // 2. Action activated (e.g. press).
		 * // 3. State: ONE <-- Does not change
		 * // 4. Action activated.
		 * // 5. State: ONE
		 */
		DisableAutomaticStates?: boolean;

		/**
		 * Determines whether Stream Deck should cache images associated with the plugin, and its actions. Default is `false`.
		 */
		DisableCaching?: boolean;

		/**
		 * Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
		 */
		Encoder?: {
			/**
			 * Path to the image, with the file extension omitted, that will be displayed in the Stream Deck application in the circular canvas that represents the dial of the action.
			 * TODO: Define style guide.
			 */
			Icon?: string;

			/**
			 * Background color to display in the Stream Deck application when the action is part of a dial stack, and is the current action. Represented as a hexadecimal value.
			 * @example
			 * "#d60270"
			 * @example
			 * "#1f1f1f"
			 * @example
			 * "#0038a8"
			 */
			StackColor?: string;

			/**
			 * Descriptions that define the interaction of the action when it is associated with a dial / touchscreen on the Stream Deck+. This information is shown to the user.
			 * @example
			 * "Rotate": "Adjust volume"
			 * @example
			 * "Touch": "Play / Pause"
			 */
			TriggerDescription?: {
				/**
				 * Touchscreen "long-touch" interaction behavior description.
				 */
				LongTouch?: string;

				/**
				 * Dial "push" (press) interaction behavior description.
				 */
				Push?: string;

				/**
				 * Dial rotation interaction behavior description.
				 */
				Rotate?: string;

				/**
				 * Touchscreen "touch" interaction behavior description.
				 */
				Touch?: string;
			};

			/**
			 * Path to the image that will be displayed on the touchscreen behind the action's layout. **NB** This can be overridden by the user in the Stream Deck application.
			 * TODO: Define style guide.
			 */
			background?: string;

			/**
			 * Name of a predefined layout, or the path to a JSON file that details a custom layout and its components, to be rendered on the action's touchscreen canvas. The
			 * layout's component's values can be updated dynamically via `streamDeck.setFeedback`, and the layout can be changed entirely via `streamDeck.setFeedbackLayout`.
			 * - $X1, layout with the title at the top and the icon beneath it in the center.
			 * - $A0, layout with the title at the top and a full-width image canvas beneath it in the center.
			 * - $A1, layout with the title at the top, the icon on the left, and text value on the right.
			 * - $B1, layout with the title at the top, the icon on the left, and a text value on the right with a progress bar beneath it.
			 * - $B2, layout with the title at the top, the icon on the left, and a text value on the right with a gradient progress bar beneath it.
			 * - $C1, layout with the title at the top, and two rows that display an icon on the left and progress bar on the right (i.e. a double progress bar layout).
			 * @example
			 * "$C1"
			 * @example
			 * "Layouts/MyCustomLayout.json"
			 */
			layout?: FilePath<"json"> | "$A0" | "$A1" | "$B1" | "$B2" | "$C1" | "$X1";
		};

		/**
		 * Path to the image, with the file extension omitted, that will be displayed next to the action in the Stream Deck application's action list. The image must adhere to the
		 * following style guidelines.
		 * - Be in .PNG or .SVG format.
		 * - Be provided in two sizes, 20x20 px and 40x40 px (@2x).
		 * - Be monochromatic, with foreground color of #EFEFEF and a transparent background.
		 * @example
		 * // com.elgato.example/
		 * // └─ assets/
		 * //    ├─ counter@2x.png
		 * //    └─ counter.png
		 * "assets/counter"
		 */
		Icon: string;

		/**
		 * Name of the action; this is displayed to the user in the actions list, and is used throughout the Stream Deck application to visually identify the action.
		 */
		Name: string;

		/**
		 * Optional path to the HTML file that represents the property inspector for this action; this is displayed to the user in the Stream Deck application when they add the
		 * action, allowing them to configure the action's settings. The plugin can send messages to the property inspector using `streamDeck.sendToPropertyInspector(context payload)`,
		 * and receive messages from the property inspector using `streamDeck.on("sendToPlugin", (data) => ...`. When undefined, the manifest's top-level `PropertyInspectorPath`
		 * is used, otherwise none. **NB** Path should be relative to the root of the plugin's folder, with no leading slash.
		 * @example
		 * // Plugin sends to property inspector.
		 * streamDeck.sendToPropertyInspector(ctx, {
		 *   message: "Ping"
		 * });
		 * @example
		 * // Property inspector sends to plugin: { message: "Pong" }
		 * streamDeck.on("sendToPlugin", data => {
		 *   // data.payload.message = "Pong"
		 * });
		 */
		PropertyInspectorPath?: FilePath<"html">;

		/**
		 * States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
		 * **NB** Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`; the state can still be set from the plugin
		 * via `streamDeck.setState(context, state)`.
		 */
		States: [State, State?];

		/**
		 * Determines whether the action is available to user's when they are creating multi-actions. Default is `true`.
		 */
		SupportedInMultiActions?: boolean;

		/**
		 * Tooltip shown to the user when they hover over the action within the actions list in the Stream Deck application.
		 */
		Tooltip?: string;

		/**
		 * Unique identifier that identifies the action, represented in reverse-DNS format. This value is supplied by Stream Deck when events are emitted that relate to the action
		 * enabling you to identify the source of the event. **NB** This must be unique, and should be prefixed with the plugin's UUID.
		 * @example
		 * "com.elgato.wavelink.toggle-mute"
		 * @example
		 * "com.elgato.discord.join-voice"
		 * @example
		 * "tv.twitch.studio.go-live"
		 */
		UUID: string;

		/**
		 * Determines whether the title field is available to the user when viewing the action's property inspector. Setting this to `False` will disable the user from specifying a
		 * title, thus allowing the plugin to have exclusive access via `streamDeck.setTitle(context, title, state, target)`. Default is `true`, i.e. the title field is enabled.
		 */
		UserTitleEnabled?: boolean;

		/**
		 * Determines whether the action is available to user's via the actions list in the Stream Deck application. Setting this to `false` allows for the action to be used as
		 * part of pre-defined profiles distributed with the plugins, whilst not being available to users. Default is `true`.
		 */
		VisibleInActionsList?: boolean;
	}[];

	/**
	 * Applications to monitor on Mac and Windows; upon a monitored application being launched or terminated, Stream Deck will notify the plugin.
	 * @example
	 * streamDeck.on("applicationDidLaunch", (data) => {
	 *   // Name of application being monitored, that was launched.
	 *   data.payload.application;
	 * });
	 * @example
	 * streamDeck.on("applicationDidTerminate", (data) => {
	 *   // Name of application being monitored, that was terminated.
	 *   data.payload.application;
	 * });
	 */
	ApplicationsToMonitor?: {
		/**
		 * Collection of applications to monitor on macOS.
		 * @example
		 * [ "com.apple.mail" ]
		 */
		mac?: string[];

		/**
		 * Collection of applications to monitor on Windows.
		 * @example
		 * [ "Notepad.exe" ]
		 */
		windows?: string;
	}[];

	/**
	 * Author's name that will be displayed on the plugin's product page on the Marketplace.
	 * @example
	 * "Elgato"
	 */
	Author: string;

	/**
	 * Defines the actions list group, providing a natural grouping of the plugin's actions with the Stream Deck application's action list. **NB** This should be distinctive and
	 * synonymous with your plugin, and it is therefore recommended that this be the same value as the plugin's `Name` field. When undefined, the actions will be available under the
	 * "Custom" group.
	 */
	Category?: string;

	/**
	 * Path to the image, with the file extension omitted, that will be displayed next to the action list group within the Stream Deck application. The icon should accurately represent
	 * the plugin, and enable users to quickly identify the plugin. The icon must adhere to the following style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 28x28 px and 56x56 px (@2x).
	 * - Be monochromatic, with foreground color of #DFDFDF and a transparent background.
	 * @example
	 * // root/
	 * // └─ assets/
	 * //    ├─ category-icon@2x.png
	 * //    └─ category-icon.png
	 * "assets/category-icon"
	 */
	CategoryIcon?: string;

	/**
	 * Path to the plugin's main entry point; this is executed when the Stream Deck application starts the plugin.
	 * @example
	 * // root/
	 * // └─ plugin.js
	 * "plugin.js"
	 * @example
	 * // root/
	 * // └─ build/
	 * //    └─ MyPlugin.exe
	 * "build/MyPlugin.exe"
	 */
	CodePath: string;

	/**
	 * Path to the plugin's entry point specific to macOS; this is executed when the Stream Deck application starts the plugin on macOS.
	 * @example
	 * // root/
	 * // └─ plugin.js
	 * "plugin.js"
	 * @example
	 * // root/
	 * // └─ build/
	 * //    └─ MyPlugin.exe
	 * "build/MyPlugin.exe"
	 */
	CodePathMac?: string;

	/**
	 * Path to the plugin's entry point specific to Windows; this is executed when the Stream Deck application starts the plugin on Windows.
	 * @example
	 * // root/
	 * // └─ plugin.js
	 * "plugin.js"
	 * @example
	 * // root/
	 * // └─ build/
	 * //    └─ MyPlugin
	 * "build/MyPlugin"
	 */
	CodePathWin?: string;

	/**
	 * Size of a window (`[width, height]`) opened when calling `window.open()` from the property inspector. Default value is `[500, 650]`.
	 */
	DefaultWindowSize?: [number, number];

	/**
	 * Description of the plugin, and the functionality it provides, that will be displayed on the plugin's product page on the Marketplace.
	 */
	Description: string;

	/**
	 * Path to the image, with the file extension omitted, that will be displayed on the Marketplace. The icon should accurately represent the plugin, stand out, and enable users to
	 * quickly identify the plugin. The icon must adhere to the following style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 288x288 px and 512x512 px (@2x).
	 * @example
	 * // root/
	 * // └─ assets/
	 * //    ├─ category-icon@2x.png
	 * //    └─ category-icon.png
	 * "assets/category-icon"
	 */
	Icon: string;

	/**
	 * Name of the plugin.
	 * @example
	 * "Wave Link"
	 * @example
	 * "Camera Hub"
	 * @example
	 * "Control Center"
	 */
	Name: string;

	/**
	 * Collection of operating systems, and their minimum require versions, that the plugin supports.
	 */
	OS: [OS, OS?];

	/**
	 * Collection of pre-defined profiles that are distributed with this plugin. Upon installation of the plugin, the user will be prompted to install the profiles. Once installed,
	 * the plugin can switch any of the pre-defined plugins via `streamDeck.switchToProfile(name, device)`.
	 */
	Profiles: {
		/**
		 * Type of device the profile is applicable too, e.g. Stream Deck+, Stream Deck Pedal, etc.
		 */
		DeviceType: DeviceType;

		/**
		 * Determines whether the Stream Deck application should automatically switch to the profile when it is first installed. Default value is `false`.
		 */
		DontAutoSwitchWhenInstalled?: boolean;

		/**
		 * Path to the `.streamDeckProfile`, with the file extension omitted, that contains the profiles layout and action settings.
		 * @example
		 * // root/
		 * // └─ profiles/
		 * //    └─ SuperCool.streamDeckProfile
		 * "profiles/SuperCool"
		 */
		Name: string;

		/**
		 * Determines whether the profile is read-only, or if the user is able to customize it within the Stream Deck application. Default value is `false`.
		 */
		Readonly?: boolean;
	}[];

	/**
	 * Optional path to the HTML file that represents the property inspector for all actions; this is displayed to the user in the Stream Deck application when they add an action,
	 * allowing them to configure the action's settings. The plugin can send messages to the property inspector using `streamDeck.sendToPropertyInspector(context payload)`, and
	 * receive messages from the property inspector using `streamDeck.on("sendToPlugin", (data) => ...`. **NB** Path should be relative to the root of the plugin's folder, with no
	 * leading slash.
	 * @example
	 * // Plugin sends to property inspector.
	 * streamDeck.sendToPropertyInspector(ctx, {
	 *   message: "Ping"
	 * });
	 * @example
	 * // Property inspector sends to plugin: { message: "Pong" }
	 * streamDeck.on("sendToPlugin", data => {
	 *   // data.payload.message = "Pong"
	 * });
	 */
	PropertyInspectorPath?: FilePath<"html">;

	/**
	 * Preferred SDK version; this should _currently_ always be `2`.
	 */
	SDKVersion: 2;

	/**
	 * Determines the Stream Deck software requirements for this plugin.
	 */
	Software: {
		/**
		 * Minimum version of the Stream Deck application required for this plugin to run.
		 */
		MinimumVersion: `${number}.${number}`;
	};

	/**
	 * Link to the plugin's website.
	 */
	URL?: string;

	/**
	 * Unique identifier used to identify the plugin, represented in reverse-DNS format.
	 * @example
	 * "com.elgato.wavelink"
	 * @example
	 * "com.elgato.discord"
	 * @example
	 * "tv.twitch.studio"
	 */
	UUID?: `${string}.${string}.${string}`;

	/**
	 * Version of the plugin, represented as a {@link https://semver.org semantic version}. **NB** pre-release values are not currently supported
	 * @example
	 * "1.0.3" ✅
	 * @example
	 * "0.0.99" ✅
	 * @example
	 * "2.1.9-beta1" ❌
	 */
	Version: string;
};

/**
 * Defines the controller type the action is applicable to. A **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a
 * pedal on the Stream Deck Pedal, whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
 */
type Controller = "Encoder" | "Keypad";

/**
 * File path, relative to the manifest's location.
 * @example
 * "PropertyInspectors/ToggleMute.html"
 * @example
 * "Actions/Counter/Icon.bmp"
 * @example
 * "Layouts/MyCustomLayout.json"
 */
type FilePath<TExt extends string> = `${string}.${Lowercase<TExt>}`;

/**
 * Operating system that the plugin supports, and the minimum required version needed to run the plugin.
 */
type OS = {
	/**
	 * Minimum version required of the operating system to run the plugin.
	 */
	MinimumVersion: string;

	/**
	 * Operating system supported by the plugin.
	 */
	Platform: "mac" | "windows";
};

/**
 * Defines the state of the action; this includes behavior, iconography, typography, etc.
 */
type State = {
	/**
	 * Default font-family to be used when rendering the title of this state. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	FontFamily?: string;

	/**
	 * Default font-size to be used when rendering the title of this state. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	FontSize?: number;

	/**
	 * Default font-style to be used when rendering the title of this state. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	FontStyle?: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";

	/**
	 * Determines whether the title associated with this state is underlined by default. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	FontUnderline?: boolean;

	/**
	 * Path to the image, with the file extension omitted, that will be displayed on the Stream Deck when this action's state is active. The image must adhere to the following style
	 * guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 72x72 px and 144x144 px (@2x).
	 *
	 * **NB** This can be overridden by the user in the Stream Deck application.
	 * @example
	 * // root/
	 * // └─ assets/
	 * //    ├─ counter-key@2x.png
	 * //    └─ counter-key.png
	 * "assets/counter-key"
	 */
	Image: string;

	/**
	 * Path to the image, with the file extension omitted, that will be displayed when the action is being viewed as part of a multi-action. The image must adhere to the following
	 * style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 72x72 px and 144x144 px (@2x).
	 *
	 * **NB** This can be overridden by the user in the Stream Deck application.
	 * @example
	 * // root/
	 * // └─ assets/
	 * //    ├─ counter-key@2x.png
	 * //    └─ counter-key.png
	 * "assets/counter-key"
	 */
	MultiActionImage?: string;

	/**
	 * Name of the state; when multiple states are defined this value is shown to the user when the action is being added to a multi-action. The user is then able to specify which
	 * state they would like to activate as part of the multi-action.
	 */
	Name?: string;

	/**
	 * Determines whether the title should be shown. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	ShowTitle?: boolean;

	/**
	 * Default title to be shown when the action is added to the Stream Deck.
	 */
	Title?: string;

	/**
	 * Default title alignment to be used when rendering the title of this state. **NB** This can be overridden by the user in the Stream Deck application.
	 */
	TitleAlignment?: "bottom" | "middle" | "top";

	/**
	 * Default title color to be used when rendering the title of this state, represented a hexadecimal value. **NB** This can be overridden by the user in the Stream Deck
	 * application.
	 * @example
	 * "#5bcefa"
	 * @example
	 * "#f5a9b8"
	 * @example
	 * "#fffff"
	 */
	TitleColor?: string;
};
