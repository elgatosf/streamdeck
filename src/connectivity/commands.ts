import { type Target } from "../api/target";
import type { DidReceiveGlobalSettings, DidReceiveSettings } from "./events";
import { State } from "./events";
import type { FeedbackPayload } from "./layouts";

/**
 * Command sent to Stream Deck.
 */
type CommandBase<TCommand, TPayload = void> = TPayload extends void
	? {
			/**
			 * Name of the command, used to identify the request.
			 */
			event: TCommand;
	  }
	: {
			/**
			 * Name of the command, used to identify the request.
			 */
			event: TCommand;

			/**
			 * Additional information supplied as part of the command.
			 */
			payload: TPayload;
	  };

/**
 * A {@link CommandBase} that is associated with a specific context, e.g. action.
 */
export type ContextualizedCommand<TCommand, TPayload = void> = CommandBase<TCommand, TPayload> & {
	/**
	 * Defines the context of the command, e.g. which action instance the command is intended for.
	 */
	context: string;
};

/**
 * Sets the settings associated with an instance of an action.
 */
export type SetSettings = ContextualizedCommand<"setSettings", unknown>;

/**
 * Gets the settings associated with an instance of an action. Causes {@link DidReceiveSettings} to be emitted.
 */
export type GetSettings = ContextualizedCommand<"getSettings">;

/**
 * Sets the global settings associated with the plugin.
 */
export type SetGlobalSettings = ContextualizedCommand<"setGlobalSettings", unknown>;

/**
 * Gets the global settings associated with the plugin. Causes {@link DidReceiveGlobalSettings} to be emitted.
 */
export type GetGlobalSettings = ContextualizedCommand<"getGlobalSettings">;

/**
 * Opens the URL in the user's default browser.
 */
export type OpenUrl = CommandBase<
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
export type LogMessage = CommandBase<
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
export type SetTitle = ContextualizedCommand<
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
export type SetImage = ContextualizedCommand<
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
export type SetFeedback = ContextualizedCommand<"setFeedback", FeedbackPayload>;

/**
 * Sets the layout associated with an action instance.
 */
export type SetFeedbackLayout = ContextualizedCommand<
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
export type SetState = ContextualizedCommand<
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
export type SetTriggerDescription = ContextualizedCommand<
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
export type SwitchToProfile = ContextualizedCommand<
	"switchToProfile",
	{
		/**
		 * Optional page to show when switching to the {@link SwitchToProfile.profile}, indexed from 0. When `undefined`, the page that was previously visible (when switching away
		 * from the profile will be made visible.
		 */
		page?: number;

		/**
		 * Name of the profile to switch to. The name must be identical to the one provided in the manifest.
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
 * Sends the payload to the property inspector.
 */
export type SendToPropertyInspector = ContextualizedCommand<"sendToPropertyInspector", unknown>;

/**
 * Command sent to Stream Deck.
 */
export type Command =
	| GetGlobalSettings
	| GetSettings
	| LogMessage
	| OpenUrl
	| SendToPropertyInspector
	| SetFeedback
	| SetFeedbackLayout
	| SetGlobalSettings
	| SetImage
	| SetSettings
	| SetState
	| SetTitle
	| SetTriggerDescription
	| ShowAlert
	| ShowOk
	| SwitchToProfile;
