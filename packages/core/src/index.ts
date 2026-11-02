export { type Controller, type Manifest } from "@elgato/schemas/streamdeck/plugins";

/**
 * Requests (commands) sent to Stream Deck.
 */
export {
	type GetGlobalSettings,
	type GetResources,
	type GetSettings,
	type LogMessage,
	type OpenUrl,
	type PluginCommand,
	type SendToPropertyInspector,
	type SetFeedback,
	type SetFeedbackLayout,
	type SetGlobalSettings,
	type SetImage,
	type SetResources,
	type SetSettings,
	type SetState,
	type SetTitle,
	type SetTriggerDescription,
	type ShowAlert,
	type ShowOk,
	type SwitchToProfile,
} from "./command.js";

/**
 * Events, and responses, sent from Stream Deck.
 */
export {
	type ActionIdentifier,
	type Coordinates,
	type DidReceiveResources,
	type DidReceiveSettings,
	type State,
	type TitleParametersDidChange,
	type WillAppear,
	type WillDisappear,
} from "./events/action.js";
export {
	type DeviceDidChange,
	type DeviceDidConnect,
	type DeviceDidDisconnect,
	type DeviceIdentifier,
} from "./events/device.js";
export { type DialDown, type DialRotate, type DialUp, type TouchTap } from "./events/encoder.js";
export { type EventIdentifier, type PluginEvent, type PluginEventMap } from "./events/events.js";
export { type KeyDown, type KeyUp } from "./events/keypad.js";
export {
	type ApplicationDidLaunch,
	type ApplicationDidTerminate,
	type DidReceiveDeepLink,
	type DidReceiveGlobalSettings,
	type SystemDidWakeUp,
} from "./events/system.js";
export {
	type DidReceivePropertyInspectorMessage,
	type PropertyInspectorDidAppear,
	type PropertyInspectorDidDisappear,
} from "./events/ui.js";

/**
 * Supporting types for events.
 */
export { DeviceType, type DeviceInfo, type Size } from "./device.js";
export { type Resources } from "./resources.js";
export { Target } from "./target.js";

/**
 * Localization.
 */
export { supportedLanguages, type Language } from "./i18n.js";

/**
 * Stream Deck +, Stream Deck + XL, and Stream Deck Neo layouts
 */
export { BarSubType, type Bar, type FeedbackPayload, type GBar, type Pixmap, type Text } from "./layout.js";

/**
 * Registration information
 */
export { type RegistrationInfo } from "./registration/info.js";
export { RegistrationParameter } from "./registration/parameters.js";
export { type ActionInfo, type ConnectElgatoStreamDeckSocketFn } from "./registration/ui.js";
