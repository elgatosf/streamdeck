/* eslint-disable jsdoc/check-tag-names */
import { DeviceType } from "./enums";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest = {
	/**
	 * JSON schema responsible for describing the manifest's data format and validation.
	 */
	$schema?: string;

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
		 *
		 * **Examples**
		 * - `false`.
		 *   1. State: ONE
		 *   2. Action activated (e.g. press).
		 *   3. State: TWO
		 *   4. Action activated.
		 *   5. State: ONE
		 * - `true`.
		 *   1. State: ONE
		 *   2. Action activated (e.g. press).
		 *   3. State: ONE **<-- Does not change**.
		 *   4. Action activated.
		 *   5. State: ONE
		 * @example
		 * false
		 */
		DisableAutomaticStates?: boolean;

		/**
		 * Determines whether Stream Deck should cache images associated with the plugin, and its actions. Default is `false`.
		 * @example
		 * false
		 */
		DisableCaching?: boolean;

		/**
		 * Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
		 */
		Encoder?: {
			/**
			 * Path to the image, with the **file extension omitted**, that will be displayed in the Stream Deck application in the circular canvas that represents the dial of the
			 * action. The image must fulfill the following style guidelines.
			 * - Be in .PNG or .SVG format.
			 * - Be provided in two sizes, 72x72 px and 144x144 px (@2x).
			 *
			 * **NB.** This can be overridden by the user in the Stream Deck application.
			 *
			 * **Examples:**
			 * - assets/actions/mute/encoder-icon
			 * - imgs/join-voice-chat-encoder
			 */
			Icon?: ImageFilePathWithoutExtension;

			/**
			 * Background color to display in the Stream Deck application when the action is part of a dial stack, and is the current action. Represented as a hexadecimal value.
			 *
			 * **Examples:**
			 * - #d60270
			 * - #1f1f1
			 * - #0038a8
			 * @pattern
			 * ^#(?:[0-9a-fA-F]{3}){1,2}$
			 */
			StackColor?: string;

			/**
			 * Descriptions that define the interaction of the action when it is associated with a dial / touchscreen on the Stream Deck+. This information is shown to the user.
			 *
			 * **Examples:**
			 * - "Adjust volume"
			 * - "Play / Pause"
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
			 * Path to the image, with the **file extension omitted**, that will be displayed on the touchscreen behind the action's layout. The image must fulfill the following style
			 * guidelines.
			 * - Be in .PNG or .SVG format.
			 * - Be provided in two sizes, 200x100 px and 400x200 px (@2x).
			 *
			 * **NB.** This can be overridden by the user in the Stream Deck application
			 *
			 * **Examples:**
			 * - assets/backgrounds/main
			 * - imgs/bright-blue-bg
			 */
			background?: ImageFilePathWithoutExtension;

			/**
			 * Name of a pre-defined layout, or the path to a JSON file that details a custom layout and its components, to be rendered on the action's touchscreen canvas.
			 *
			 * **Pre-defined Layouts:**
			 * - `$X1`, layout with the title at the top and the icon beneath it in the center.
			 * - `$A0`, layout with the title at the top and a full-width image canvas beneath it in the center.
			 * - `$A1`, layout with the title at the top, the icon on the left, and text value on the right.
			 * - `$B1`, layout with the title at the top, the icon on the left, and a text value on the right with a progress bar beneath it.
			 * - `$B2`, layout with the title at the top, the icon on the left, and a text value on the right with a gradient progress bar beneath it.
			 * - `$C1`, layout with the title at the top, and two rows that display an icon on the left and progress bar on the right (i.e. a double progress bar layout).
			 *
			 * **Examples:**
			 * - $A1
			 * - layouts/my-custom-layout.json
			 *
			 * **Related:**
			 * - Change the current layout of an action instance.
			 *
			 * `streamDeck.setFeedbackLayout(context, layout)`
			 *
			 * - Update an action instance's current layout values, e.g. title text.
			 *
			 * `streamDeck.setFeedback(context, feedback)`
			 * @examples
			 * [ "$X1", "$A0", "$A1", "$B1", "$B2", "$C1" ]
			 * @pattern
			 * (^(\$[AB][12])|(\$[XC]1))$|(^(?!\/).+\.[Jj][Ss][Oo][Nn]$)
			 */
			layout?: FilePath<"json"> | "$A0" | "$A1" | "$B1" | "$B2" | "$C1" | "$X1";
		};

		/**
		 * Path to the image, with the **file extension omitted**, that will be displayed next to the action in the Stream Deck application's action list. The image must adhere to
		 * the following style guidelines.
		 * - Be in .PNG or .SVG format.
		 * - Be provided in two sizes, 20x20 px and 40x40 px (@2x).
		 * - Be monochromatic, with foreground color of #EFEFEF and a transparent background.
		 *
		 * **Examples:**
		 * - assets/counter
		 * - imgs/actions/mute
		 */
		Icon: ImageFilePathWithoutExtension;

		/**
		 * Name of the action; this is displayed to the user in the actions list, and is used throughout the Stream Deck application to visually identify the action.
		 */
		Name: string;

		/**
		 * Optional path to the HTML file that represents the property inspector for this action; this is displayed to the user in the Stream Deck application when they add the
		 * action, allowing them to configure the action's settings. When `undefined`, the manifest's top-level `PropertyInspectorPath` is used, otherwise none. **NB.** Path should be
		 * relative to the root of the plugin's folder, with no leading slash.
		 *
		 * **Examples:**
		 * - mute.html
		 * - actions/join-voice-chat/settings.html
		 *
		 * **Related:**
		 * - Send messages **to** the property inspector.
		 *
		 * `streamDeck.sendToPropertyInspector(context, payload)`
		 *
		 * - Receive messages **from** the property inspector.
		 *
		 * `streamDeck.on("sendToPlugin", data => ...)`
		 */
		PropertyInspectorPath?: HtmlFilePath;

		/**
		 * States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
		 * **NB.** Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`.
		 *
		 * **Related:**
		 * - Change the state of an action.
		 *
		 * `streamDeck.setState(context, state)`
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
		 * enabling you to identify the source of the event. **NB.** This must be unique, and should be prefixed with the plugin's UUID.
		 *
		 * **Examples:**
		 * - com.elgato.wavelink.toggle-mute
		 * - com.elgato.discord.join-voice
		 * - tv.twitch.studio.go-live
		 */
		UUID: string;

		/**
		 * Determines whether the title field is available to the user when viewing the action's property inspector. Setting this to `False` will disable the user from specifying a
		 * title, thus allowing the plugin to have exclusive access via `streamDeck.setTitle(context, title, state, target)`. Default is `true`, i.e. the title field is enabled.
		 *
		 * **Related:**
		 * - Set action's title.
		 *
		 * `streamDeck.setTitle(context, title, state, target)`
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
	 *
	 * **Related:**
	 * - Monitor when an application **launches**.
	 *
	 * `streamDeck.on("applicationDidLaunch", listener)`
	 *
	 * - Monitor when an application **terminates**.
	 *
	 * `streamDeck.on("applicationDidTerminate", listener)`
	 */
	ApplicationsToMonitor?: {
		/**
		 * Collection of applications to monitor on macOS.
		 *
		 * **Examples:**
		 * - com.apple.mail
		 */
		mac?: string[];

		/**
		 * Collection of applications to monitor on Windows.
		 *
		 * **Examples:**
		 * - Notepad.exe
		 */
		windows?: string;
	};

	/**
	 * Author's name that will be displayed on the plugin's product page on the Marketplace, e.g. "Elgato".
	 */
	Author: string;

	/**
	 * Defines the actions list group, providing a natural grouping of the plugin's actions with the Stream Deck application's action list. **NB.** This should be distinctive and
	 * synonymous with your plugin, and it is therefore recommended that this be the same value as the plugin's `Name` field. When `undefined`, the actions will be available under
	 * the "Custom" group.
	 */
	Category?: string;

	/**
	 * Path to the image, with the **file extension omitted**, that will be displayed next to the action list group within the Stream Deck application. The icon should accurately represent
	 * the plugin, and enable users to quickly identify the plugin. The icon must adhere to the following style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 28x28 px and 56x56 px (@2x).
	 * - Be monochromatic, with foreground color of #DFDFDF and a transparent background.
	 *
	 * **Examples**:
	 * - assets/category-icon
	 * - imgs/category
	 */
	CategoryIcon?: ImageFilePathWithoutExtension;

	/**
	 * Path to the plugin's main entry point; this is executed when the Stream Deck application starts the plugin.
	 *
	 * **Examples**:
	 * - index.js
	 * - Counter
	 * - Counter.exe
	 */
	CodePath: string;

	/**
	 * Path to the plugin's entry point specific to macOS; this is executed when the Stream Deck application starts the plugin on macOS.
	 *
	 * **Examples**:
	 * - index.js
	 * - Counter
	 * ```
	 */
	CodePathMac?: string;

	/**
	 * Path to the plugin's entry point specific to Windows; this is executed when the Stream Deck application starts the plugin on Windows.
	 *
	 * Examples:
	 * - index.js
	 * - Counter.exe
	 */
	CodePathWin?: string;

	/**
	 * Size of a window (`[width, height]`) opened when calling `window.open()` from the property inspector. Default value is `[500, 650]`.
	 * @example
	 * [500, 650]
	 */
	DefaultWindowSize?: [number, number];

	/**
	 * Description of the plugin, and the functionality it provides, that will be displayed on the plugin's product page on the Marketplace.
	 */
	Description: string;

	/**
	 * Path to the image, with the **file extension omitted**, that will be displayed on the Marketplace. The icon should accurately represent the plugin, stand out, and enable users
	 * to quickly identify the plugin. The icon must adhere to the following style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 288x288 px and 512x512 px (@2x).
	 *
	 * **Examples**:
	 * assets/plugin-icon
	 * imgs/plugin
	 */
	Icon: ImageFilePathWithoutExtension;

	/**
	 * Name of the plugin, e.g. "Wave Link", "Camera Hub", "Control Center", etc.
	 */
	Name: string;

	/**
	 * Collection of operating systems, and their minimum required versions, that the plugin supports.
	 */
	OS: [OS, OS?];

	/**
	 * Collection of pre-defined profiles that are distributed with this plugin. Upon installation of the plugin, the user will be prompted to install the profiles. Once installed,
	 * the plugin can switch any of the pre-defined profiles. **NB.** It is not yet possible to switch to a user-defined profile.
	 *
	 * **Related:**
	 * - Switch to a pre-defined plugin profile.
	 *
	 * `streamDeck.switchToProfile(name, device)`
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
		 * Path to the `.streamDeckProfile`, with the **file extension omitted**, that contains the profiles layout and action settings.
		 *
		 * **Examples:**
		 * - assets/main-profile
		 * - profiles/super-cool-profile
		 */
		Name: string;

		/**
		 * Determines whether the profile is read-only, or if the user is able to customize it within the Stream Deck application. Default value is `false`.
		 */
		Readonly?: boolean;
	}[];

	/**
	 * Optional path to the HTML file that represents the property inspector for all actions; this is displayed to the user in the Stream Deck application when they add an action,
	 * allowing them to configure the action's settings. **NB.** Path should be relative to the root of the plugin's folder, with no leading slash.
	 *
	 *  **Examples:**
	 * - mute.html
	 * - actions/join-voice-chat/settings.html
	 *
	 * **Related:**
	 * - Send messages **to** the property inspector.
	 *
	 * `streamDeck.sendToPropertyInspector(context, payload)`
	 *
	 * - Receive messages **from** the property inspector.
	 *
	 * `streamDeck.on("sendToPlugin", data => ...)`
	 */
	PropertyInspectorPath?: HtmlFilePath;

	/**
	 * Preferred SDK version; this should _currently_ always be 2.
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
	 *
	 * **Examples**:
	 * - https://elgato.com
	 * - https://corsair.com
	 */
	URL?: string;

	/**
	 * Unique identifier used to identify the plugin, represented in reverse-DNS format.
	 *
	 * Examples:
	 * - com.elgato.wave-link
	 * - com.philips.hue
	 * - tv.twitch.studio
	 */
	UUID?: `${string}.${string}.${string}`;

	/**
	 * Version of the plugin, represented as a {@link https://semver.org semantic version}. **NB.** pre-release values are not currently supported.
	 *
	 * **Examples:**
	 * - 1.0.3 ✅
	 * - 0.0.99 ✅
	 * - 2.1.9-beta1 ❌
	 * @example
	 * "1.0.0"
	 */
	Version: string;
};

/**
 * Defines the controller type the action is applicable to. A **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a
 * pedal on the Stream Deck Pedal, whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck+.
 */
type Controller = "Encoder" | "Keypad";

/**
 * File path that represents an HTML file relative to the plugin's manifest.
 * @pattern
 * ^(?!\/).+\.[Hh][Tt][Mm][Ll]?$
 */
type HtmlFilePath = FilePath<"htm" | "html">;

/**
 * File path that represents an image file relative to the plugin's manifest.
 * @pattern
 * ^(?!\/).+(?<!\.([Pp][Nn][Gg]|[Ss][Vv][Gg]))$
 */
type ImageFilePathWithoutExtension = string;

/**
 * File path, relative to the manifest's location.
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
	 * Default font-family to be used when rendering the title of this state. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	FontFamily?: string;

	/**
	 * Default font-size to be used when rendering the title of this state. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	FontSize?: number;

	/**
	 * Default font-style to be used when rendering the title of this state. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	FontStyle?: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";

	/**
	 * Determines whether the title associated with this state is underlined by default. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	FontUnderline?: boolean;

	/**
	 * Path to the image, with the **file extension omitted**, that will be displayed on the Stream Deck when this action's state is active. The image must adhere to the following
	 * style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 72x72 px and 144x144 px (@2x).
	 *
	 * **NB.** This can be overridden by the user in the Stream Deck application.
	 *
	 * **Examples:**
	 * - assets/counter-key
	 * - assets/icons/mute
	 */
	Image: ImageFilePathWithoutExtension;

	/**
	 * Path to the image, with the **file extension omitted**, that will be displayed when the action is being viewed as part of a multi-action. The image must adhere to the following
	 * style guidelines.
	 * - Be in .PNG or .SVG format.
	 * - Be provided in two sizes, 72x72 px and 144x144 px (@2x).
	 *
	 * **NB.** This can be overridden by the user in the Stream Deck application.
	 *
	 * **Examples:**
	 * - assets/counter-key
	 * - assets/icons/mute
	 */
	MultiActionImage?: ImageFilePathWithoutExtension;

	/**
	 * Name of the state; when multiple states are defined this value is shown to the user when the action is being added to a multi-action. The user is then able to specify which
	 * state they would like to activate as part of the multi-action.
	 */
	Name?: string;

	/**
	 * Determines whether the title should be shown. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	ShowTitle?: boolean;

	/**
	 * Default title to be shown when the action is added to the Stream Deck.
	 *
	 * **Related:**
	 * - Set action's title.
	 *
	 * `streamDeck.setTitle(context, title, state, target)`
	 */
	Title?: string;

	/**
	 * Default title alignment to be used when rendering the title of this state. **NB.** This can be overridden by the user in the Stream Deck application.
	 */
	TitleAlignment?: "bottom" | "middle" | "top";

	/**
	 * Default title color to be used when rendering the title of this state, represented a hexadecimal value. **NB.** This can be overridden by the user in the Stream Deck
	 * application.
	 *
	 * **Examples:**
	 * - #5bcefa
	 * - #f5a9b8
	 * - #FFFFFF
	 * @pattern
	 * ^#(?:[0-9a-fA-F]{3}){1,2}$
	 */
	TitleColor?: string;
};
