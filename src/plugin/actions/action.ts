import type { ActionIdentifier, FeedbackPayload, PayloadObject, SetImage, SetTitle, SetTriggerDescription, State } from "../../api";
import type { StreamDeckConnection } from "../connectivity/connection";
import { getSettings } from "../settings/provider";
import type { UIClient } from "../ui";
import type { SingletonAction } from "./singleton-action";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export class Action<T extends PayloadObject<T> = object> {
	/**
	 * Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	public readonly id: string;

	/**
	 * Unique identifier (UUID) of the action as defined within the plugin's manifest's actions collection.
	 */
	public readonly manifestId: string;

	/**
	 * Initializes a new instance of the {@see Action} class.
	 * @param connection Connection with Stream Deck.
	 * @param source Source of the action.
	 */
	constructor(
		private readonly connection: StreamDeckConnection,
		source: ActionIdentifier
	) {
		this.id = source.context;
		this.manifestId = source.action;
	}

	/**
	 * Gets the settings associated this action instance. See also {@link Action.setSettings}.
	 * @template U The type of settings associated with the action.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<U extends PayloadObject<U> = T>(): Promise<U> {
		return getSettings<U>(this.connection, this.id);
	}

	/**
	 * Sends the {@link payload} to the current property inspector associated with this action instance. The plugin can also receive information from the property inspector via
	 * {@link UIClient.onSendToPlugin} and {@link SingletonAction.onSendToPlugin} allowing for bi-directional communication.
	 * @template T The type of the payload received from the property inspector.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
	 */
	public sendToPropertyInspector<T extends PayloadObject<T> = object>(payload: T): Promise<void> {
		return this.connection.send({
			event: "sendToPropertyInspector",
			context: this.id,
			payload
		});
	}

	/**
	 * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be updated. Layouts are a powerful way to provide dynamic information
	 * to users, and can be assigned in the manifest, or dynamically via {@link Action.setFeedbackLayout}.
	 *
	 * The {@link feedback} payload defines which items within the layout will be updated, and are identified by their property name (defined as the `key` in the layout's definition).
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
	 * action.setFeedback(ctx, {
	 *  // "text_item" matches a "key" within the layout's JSON file.
	 *   text_item: "Some new value"
	 * })
	 * ```
	 *
	 * Alternatively, more information can be updated.
	 * ```
	 * action.setFeedback(ctx, {
	 *   text_item: { // <-- "text_item" matches a "key" within the layout's JSON file.
	 *     value: "Some new value",
	 *     alignment: "center"
	 *   }
	 * });
	 * ```
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
	 */
	public setFeedback(feedback: FeedbackPayload): Promise<void> {
		return this.connection.send({
			event: "setFeedback",
			context: this.id,
			payload: feedback
		});
	}

	/**
	 * Sets the layout associated with this action instance. The layout must be either a built-in layout identifier, or path to a local layout JSON file within the plugin's folder.
	 * Use in conjunction with {@link Action.setFeedback} to update the layout's current items' settings.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(layout: string): Promise<void> {
		return this.connection.send({
			event: "setFeedbackLayout",
			context: this.id,
			payload: {
				layout
			}
		});
	}

	/**
	 * Sets the {@link image} to be display for this action instance.
	 *
	 * NB: The image can only be set by the plugin when the the user has not specified a custom image.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `undefined`, the image from the manifest will be used.
	 * @param options Additional options that define where and how the image should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
	 */
	public setImage(image?: string, options?: ImageOptions): Promise<void> {
		return this.connection.send({
			event: "setImage",
			context: this.id,
			payload: {
				image,
				...options
			}
		});
	}

	/**
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	public setSettings(settings: T): Promise<void> {
		return this.connection.send({
			event: "setSettings",
			context: this.id,
			payload: settings
		});
	}

	/**
	 * Sets the current {@link state} of this action instance; only applies to actions that have multiple states defined within the manifest.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(state: State): Promise<void> {
		return this.connection.send({
			event: "setState",
			context: this.id,
			payload: {
				state
			}
		});
	}

	/**
	 * Sets the {@link title} displayed for this action instance. See also {@link SingletonAction.onTitleParametersDidChange}.
	 *
	 * NB: The title can only be set by the plugin when the the user has not specified a custom title.
	 * @param title Title to display; when `undefined` the title within the manifest will be used.
	 * @param options Additional options that define where and how the title should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
	 */
	public setTitle(title?: string, options?: TitleOptions): Promise<void> {
		return this.connection.send({
			event: "setTitle",
			context: this.id,
			payload: {
				title,
				...options
			}
		});
	}

	/**
	 * Sets the trigger (interaction) {@link descriptions} associated with this action instance. Descriptions are shown within the Stream Deck application, and informs the user what
	 * will happen when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part
	 * of the manifest.
	 *
	 * NB: Applies to encoders (dials / touchscreens) found on Stream Deck+ devices.
	 * @param descriptions Descriptions that detail the action's interaction.
	 * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
	 */
	public setTriggerDescription(descriptions?: TriggerDescriptionOptions): Promise<void> {
		return this.connection.send({
			event: "setTriggerDescription",
			context: this.id,
			payload: descriptions || {}
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return this.connection.send({
			event: "showAlert",
			context: this.id
		});
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on this action instance. Used to provide visual feedback when an action successfully
	 * executed.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(): Promise<void> {
		return this.connection.send({
			event: "showOk",
			context: this.id
		});
	}
}

/**
 * Options that define how to render an image associated with an action.
 */
export type ImageOptions = Omit<SetImage["payload"], "image">;

/**
 * Options that define how to render a title associated with an action.
 */
export type TitleOptions = Omit<SetTitle["payload"], "title">;

/**
 * Options that define the trigger descriptions associated with an action.
 */
export type TriggerDescriptionOptions = SetTriggerDescription["payload"];
