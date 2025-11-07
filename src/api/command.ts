import type { JsonObject, JsonValue } from "../plugin";
import type { DidReceiveGlobalSettings, DidReceiveSettings, State } from "./events";
import type { FeedbackPayload } from "./layout";
import type { Resources } from "./resources";
import type { Target } from "./target";

/**
 * Command sent to Stream Deck.
 */
type CommandBase<TCommand> = {
	/**
	 * Name of the command, used to identify the request.
	 */
	event: TCommand;
};

/**
 * Command sent to Stream Deck, with payload information.
 */
type CommandBaseWithPayload<TCommand, TPayload> = CommandBase<TCommand> & {
	/**
	 * Additional information supplied as part of the command.
	 */
	payload: TPayload;
};

/**
 * A {@link CommandBase} that is associated with a specific action identified by the context..
 */
type ContextualizedCommand<TCommand> = CommandBase<TCommand> & {
	/**
	 * Defines the context of the command, e.g. which action instance the command is intended for.
	 */
	context: string;
};

/**
 * A {@link CommandBase} that is associated with a specific action identified by the context.
 */
type ContextualizedCommandWithPayload<TCommand, TPayload> = ContextualizedCommand<TCommand> & {
	/**
	 * Additional information supplied as part of the command.
	 */
	payload: TPayload;
};

/**
 * Sets the settings associated with an instance of an action.
 */
export type SetSettings = ContextualizedCommandWithPayload<"setSettings", JsonObject>;

/**
 * Gets the settings associated with an instance of an action. Causes {@link DidReceiveSettings} to be emitted.
 */
export type GetSettings = ContextualizedCommand<"getSettings"> & {
	/**
	 * Optional identifier that can be used to identify the response to this request.
	 */
	id?: string;
};

/**
 * Sets the global settings associated with the plugin.
 */
export type SetGlobalSettings = ContextualizedCommandWithPayload<"setGlobalSettings", JsonObject>;

/**
 * Gets the global settings associated with the plugin. Causes {@link DidReceiveGlobalSettings} to be emitted.
 */
export type GetGlobalSettings = ContextualizedCommand<"getGlobalSettings"> & {
	/**
	 * Optional identifier that can be used to identify the response to this request.
	 */
	id?: string;
};

/**
 * Gets secrets associated with the plugin.
 */
export type GetSecrets = ContextualizedCommand<"getSecrets">;

/**
 * Sets the resources (files) associated with the action; these resources are embedded into the action
 * when it is exported, either individually, or as part of a profile.
 *
 * Available from Stream Deck 7.1.
 */
export type SetResources = ContextualizedCommandWithPayload<"setResources", Resources>;

/**
 * Gets the resources (files) associated with the action; these resources are embedded into the action
 * when it is exported, either individually, or as part of a profile.
 *
 * Available from Stream Deck 7.1.
 */
export type GetResources = ContextualizedCommand<"getResources"> & {
	/**
	 * Optional identifier that can be used to identify the response to this request.
	 */
	id?: string;
};

/**
 * Opens the URL in the user's default browser.
 */
export type OpenUrl = CommandBaseWithPayload<
	"openUrl",
	{
		/**
		 * URL to open.
		 */
		url: string;
	}
>;

/**
 * Logs a message to the file-system.
 */
export type LogMessage = CommandBaseWithPayload<
	"logMessage",
	{
		/**
		 * Message to log.
		 */
		message: string;
	}
>;
/**
 * Sets the title displayed for an instance of an action.
 */
export type SetTitle = ContextualizedCommandWithPayload<
	"setTitle",
	{
		/**
		 * Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
		 */
		state?: State;

		/**
		 * Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
		 */
		target?: Target;

		/**
		 * Title to display; when no title is specified, the title will reset to the title set by the user.
		 */
		title?: string;
	}
>;

/**
 * Sets the image associated with an action instance.
 */
export type SetImage = ContextualizedCommandWithPayload<
	"setImage",
	{
		/**
		 * Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
		 */
		image?: string;

		/**
		 * Action state the command applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
		 */
		state?: State;

		/**
		 * Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
		 */
		target?: Target;
	}
>;

/**
 * Set's the feedback of an existing layout associated with an action instance.
 */
export type SetFeedback = ContextualizedCommandWithPayload<"setFeedback", FeedbackPayload>;

/**
 * Sets the layout associated with an action instance.
 */
export type SetFeedbackLayout = ContextualizedCommandWithPayload<
	"setFeedbackLayout",
	{
		/**
		 * Name of a pre-defined layout, or relative path to a custom one.
		 */
		layout: string;
	}
>;

/**
 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on the action instance. Used to provide visual feedback when an action failed.
 */
export type ShowAlert = ContextualizedCommand<"showAlert">;

/**
 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on the action instance. Used to provide visual feedback when an action successfully executed.
 */
export type ShowOk = ContextualizedCommand<"showOk">;

/**
 * Sets the current state of an action instance.
 */
export type SetState = ContextualizedCommandWithPayload<
	"setState",
	{
		/**
		 * State to set; this be either 0, or 1.
		 */
		state: State;
	}
>;

/**
 * Sets the trigger descriptions associated with an encoder action instance.
 */
export type SetTriggerDescription = ContextualizedCommandWithPayload<
	"setTriggerDescription",
	{
		/**
		 * Touchscreen "long-touch" interaction behavior description; when `undefined`, the description will not be shown.
		 */
		longTouch?: string;

		/**
		 * Dial "push" (press) interaction behavior description; when `undefined`, the description will not be shown.
		 */
		push?: string;

		/**
		 * Dial rotation interaction behavior description; when `undefined`, the description will not be shown.
		 */
		rotate?: string;

		/**
		 * Touchscreen "touch" interaction behavior description; when `undefined`, the description will not be shown.
		 */
		touch?: string;
	}
>;

/**
 * Switches to the profile, as distributed by the plugin, on the specified device.
 *
 * NB: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.
 */
export type SwitchToProfile = ContextualizedCommandWithPayload<
	"switchToProfile",
	{
		/**
		 * Optional page to show when switching to the {@link SwitchToProfile.profile}, indexed from 0. When `undefined`, the page that was previously visible (when switching away
		 * from the profile will be made visible.
		 */
		page?: number;

		/**
		 * Name of the profile to switch to; the name must be identical to the one provided in the manifest.
		 *
		 * When not specified, Stream Deck will switch to the previous profile.
		 */
		profile?: string;
	}
> & {
	/**
	 * Unique identifier of the device where the profile should be set.
	 */
	device: string;
};

/**
 * Sends a message to the property inspector.
 */
export type SendToPropertyInspector<TPayload extends JsonValue = JsonValue> = ContextualizedCommandWithPayload<
	"sendToPropertyInspector",
	TPayload
>;

/**
 * Command sent to Stream Deck, from the plugin.
 */
export type PluginCommand =
	| GetGlobalSettings
	| GetResources
	| GetSecrets
	| GetSettings
	| LogMessage
	| OpenUrl
	| SendToPropertyInspector
	| SetFeedback
	| SetFeedbackLayout
	| SetGlobalSettings
	| SetImage
	| SetResources
	| SetSettings
	| SetState
	| SetTitle
	| SetTriggerDescription
	| ShowAlert
	| ShowOk
	| SwitchToProfile;
