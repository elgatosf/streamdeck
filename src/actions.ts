import { State } from "./connectivity/messages";
import { FeedbackPayload, StreamDeckClient, Target } from "./definitions/client";

/**
 * Provides a contextualized instance of `Action`, allowing for direct communication with an instance of an action.
 */
export class Action {
	/**
	 * Initializes a new instance of the {@see Action} class.
	 * @param client The Stream Deck client.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`).
	 * @param id Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	constructor(private readonly client: StreamDeckClient, public readonly manifestId: string, public readonly id: string) {}

	/**
	 * Gets the settings associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction
	 * with {@link Action.setSettings}.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<T = unknown>(): Promise<Partial<T>> {
		return this.client.getSettings<T>(this.id);
	}

	/**
	 * Sends the `payload` to the current property inspector associated with an instance of an action, as identified by the `context`. The plugin can also receive information from
	 * the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the `payload` is only received by the property inspector when it
	 * is associated with the specified `context`.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the `payload` to the property inspector has been sent to Stream Deck.
	 */
	public sendToPropertyInspector(payload: unknown): Promise<void> {
		return this.client.sendToPropertyInspector(this.id, payload);
	}

	/**
	 * Sets the feedback of a layout associated with an action instance allowing for visual items to be updated. Layouts are a powerful way to provide dynamic information to users,
	 * and can be assigned in the manifest, or dynamically via {@link Action.setFeedbackLayout}.
	 *
	 * The `feedback` payload defines which items within the layout should be updated, and are identified by their property name (defined as the `key` in the layout's definition).
	 * The values can either by a complete new definition, a `string` for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
	 *
	 * For example, given the following custom layout definition saved relatively to the plugin at "layouts/MyCustomLayout.json".
	 * ```
	 * {
	 *   "id": "MyCustomLayout",
	 *   "items": [{
	 *     "key": "text_item", // <-- Key used to identify which item is being updated.
	 *     "type": "text",
	 *     "rect": [16, 10, 136, 24],
	 *     "alignment": "left",
	 *     "value": "Some default value"
	 *   }]
	 * }
	 * ```
	 *
	 * And the layout assigned to an action within the manifest.
	 * ```
	 * {
	 *   "Actions": [{
	 *     "Encoder": {
	 *       "Layout": "layouts/MyCustomLayout.json"
	 *     }
	 *   }]
	 * }
	 * ```
	 *
	 * The layout item's text can be updated dynamically via.
	 * ```
	 * client.setFeedback(ctx, {
	 *  // "text_item" matches a "key" within the layout's JSON file.
	 *   text_item: "Some new value"
	 * })
	 * ```
	 *
	 * Alternatively, more information can be updated.
	 * ```
	 * client.setFeedback(ctx, {
	 *   text_item: { // <-- "text_item" matches a "key" within the layout's JSON file.
	 *     value: "Some new value",
	 *     alignment: "center"
	 *   }
	 * });
	 * ```
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 */
	public setFeedback(feedback: FeedbackPayload): Promise<void> {
		return this.client.setFeedback(this.id, feedback);
	}

	/**
	 * Sets the layout associated with an action instance, as identified by the `context`. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder.
	 * Use in conjunction with {@link Action.setFeedback} to update the layouts current settings once it has been changed.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(layout: string): Promise<void> {
		return this.client.setFeedbackLayout(this.id, layout);
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
		return this.client.setImage(this.id, image, state, target);
	}

	/**
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc.
	 * Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the `settings` are sent to Stream Deck.
	 */
	public setSettings(settings: unknown): Promise<void> {
		return this.client.setSettings(this.id, settings);
	}

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.json file.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(state: State): Promise<void> {
		return this.client.setState(this.id, state);
	}

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `title` has been sent to Stream Deck.
	 */
	public setTitle(title?: string, state: State | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.client.setTitle(this.id, title, state, target);
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the `context`. Used to provide visual feedback
	 * when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return this.client.showAlert(this.id);
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an
	 * action successfully executed.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(): Promise<void> {
		return this.client.showOk(this.id);
	}
}
