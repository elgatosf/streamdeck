import { State } from "./connectivity/messages";
import { FeedbackPayload } from "./layouts";

/**
 * Provides methods for controlling and updating Stream Deck actions, e.g. {@link ActionController.getSettings} {@link ActionController.setImage}, {@link ActionController.setTitle}, etc.
 */
export type ActionController = {
	/**
	 * Gets the settings associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction
	 * with {@link ActionController.setSettings}.
	 * @param context Unique identifier of the action instance whose settings are being requested.
	 * @returns Promise containing the action instance's settings.
	 */
	getSettings<T = unknown>(context: string): Promise<Partial<T>>;

	/**
	 * Sends the `payload` to the current property inspector associated with an instance of an action, as identified by the `context`. The plugin can also receive information from
	 * the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the `payload` is only received by the property inspector when it
	 * is associated with the specified `context`.
	 * @param context Unique identifier of the action instance whose property inspector will receive the `payload`.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the `payload` to the property inspector has been sent to Stream Deck.
	 */
	sendToPropertyInspector(context: string, payload: unknown): Promise<void>;

	/**
	 * Sets the feedback of a layout associated with an action instance, as identified by the `context`, allowing for visual items to be updated. Layouts are defined in the manifest,
	 * or dynamically via {@link ActionController.setFeedbackLayout}. Layouts are a powerful way to provide dynamic information to users; when updating feedback, the `feedback` object
	 * should contain properties that correlate with the items `key`, as defined in the layout's JSON file. Property values can be an `object`, used to update multiple properties of
	 * a layout item, or a `number` or `string` to update the `value` of the layout item.
	 * `number` or `string` may be provided to update the `value` associated with the layout item.
	 * @param context Unique identifier of the action instance whose feedback will be updated.
	 * @param feedback Object containing information about the feedback used to update the current layout of an action instance.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 */
	setFeedback(context: string, feedback: FeedbackPayload): Promise<void>;

	/**
	 * Sets the layout associated with an action instance, as identified by the `context`. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder.
	 * Use in conjunction with {@link ActionController.setFeedback} to update the layouts current settings once it has been changed.
	 * @param context Unique identifier of the action instance whose layout will be updated.
	 * @param layout New layout being assigned to the action instance.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	setFeedbackLayout(context: string, layout: string): Promise<void>;

	/**
	 * Sets the `image` displayed for an instance of an action, as identified by the `context`.
	 * @param context Unique identifier of the action instance whose image will be updated.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param state Action state the request applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `image` has been sent to Stream Deck.
	 */
	setImage(context: string, image: string, state?: State, target?: Target): Promise<void>;

	/**
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc.
	 * Use in conjunction with {@link ActionController.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the `settings` are sent to Stream Deck.
	 */
	setSettings(context: string, settings: unknown): Promise<void>;

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.json file.
	 * @param context Unique identifier of the action instance who state will be set.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	setState(context: string, state: State): Promise<void>;

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `title` has been sent to Stream Deck.
	 */
	setTitle(context: string, title?: string, state?: State, target?: Target): Promise<void>;

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the `context`. Used to provide visual feedback
	 * when an action failed.
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	showAlert(context: string): Promise<void>;

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an
	 * action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	showOk(context: string): Promise<void>;
};

/**
 * Provides a contextualized instance of `ActionController`, allowing for direct communication with an instance of an action.
 */
export class ContextualizedActionController {
	/**
	 * Initializes a new instance of the `ContextualizedActionController` class.
	 * @param controller Controller capable of updating the action.
	 * @param context Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	constructor(private readonly controller: ActionController, public readonly context: string) {}

	/**
	 * Gets the settings associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction
	 * with {@link ContextualizedActionController.setSettings}.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<T = unknown>(): Promise<Partial<T>> {
		return this.controller.getSettings<T>(this.context);
	}

	/**
	 * Sends the `payload` to the current property inspector associated with an instance of an action, as identified by the `context`. The plugin can also receive information from
	 * the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the `payload` is only received by the property inspector when it
	 * is associated with the specified `context`.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the `payload` to the property inspector has been sent to Stream Deck.
	 */
	public sendToPropertyInspector(payload: unknown): Promise<void> {
		return this.controller.sendToPropertyInspector(this.context, payload);
	}

	/**
	 * Sets the feedback of a layout associated with an action instance, as identified by the `context`, allowing for visual items to be updated. Layouts are defined in the manifest,
	 * or dynamically via {@link ContextualizedActionController.setFeedbackLayout}. Layouts are a powerful way to provide dynamic information to users; when updating feedback, the `feedback` object
	 * should contain properties that correlate with the items `key`, as defined in the layout's JSON file. Property values can be an `object`, used to update multiple properties of
	 * a layout item, or a `number` or `string` to update the `value` of the layout item.
	 * `number` or `string` may be provided to update the `value` associated with the layout item.
	 * @param feedback Object containing information about the feedback used to update the current layout of an action instance.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 */
	public setFeedback(feedback: FeedbackPayload): Promise<void> {
		return this.controller.setFeedback(this.context, feedback);
	}

	/**
	 * Sets the layout associated with an action instance, as identified by the `context`. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder.
	 * Use in conjunction with {@link ContextualizedActionController.setFeedback} to update the layouts current settings once it has been changed.
	 * @param layout New layout being assigned to the action instance.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(layout: string): Promise<void> {
		return this.controller.setFeedbackLayout(this.context, layout);
	}

	/**
	 * Sets the `image` displayed for an instance of an action, as identified by the `context`.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param state Action state the request applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `image` has been sent to Stream Deck.
	 */
	public setImage(image: string, state: State | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.controller.setImage(this.context, image, state, target);
	}

	/**
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc.
	 * Use in conjunction with {@link ContextualizedActionController.getSettings}.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the `settings` are sent to Stream Deck.
	 */
	public setSettings(settings: unknown): Promise<void> {
		return this.controller.setSettings(this.context, settings);
	}

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.json file.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(state: State): Promise<void> {
		return this.controller.setState(this.context, state);
	}

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `title` has been sent to Stream Deck.
	 */
	public setTitle(title?: string, state: State | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.controller.setTitle(this.context, title, state, target);
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the `context`. Used to provide visual feedback
	 * when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return this.controller.showAlert(this.context);
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an
	 * action successfully executed.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(): Promise<void> {
		return this.controller.showOk(this.context);
	}
}

/**
 * Defines the target of a request, i.e. whether the request should update the Stream Deck hardware, Stream Deck software (application), or both, when calling `setImage` and `setState`.
 */
export enum Target {
	/**
	 * Hardware and software should be updated as part of the request.
	 */
	HardwareAndSoftware = 0,

	/**
	 * Hardware only should be updated as part of the request.
	 */
	Hardware = 1,

	/**
	 * Software only should be updated as part of the request.
	 */
	Software = 2
}
