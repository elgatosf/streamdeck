import type { Coordinates, FeedbackPayload, SetTriggerDescription, WillAppear } from "../../api/index.js";
import type { JsonObject } from "../../common/json.js";
import type { KeyOf } from "../../common/utils.js";
import { connection } from "../connection.js";
import { Action } from "./action.js";

/**
 * Provides a contextualized instance of a dial action.
 * @template T The type of settings associated with the action.
 */
export class DialAction<T extends JsonObject = JsonObject> extends Action<T> {
	/**
	 * Private backing field for {@link DialAction.coordinates}.
	 */
	readonly #coordinates: Readonly<Coordinates>;

	/**
	 * Initializes a new instance of the {@see DialAction} class.
	 * @param source Source of the action.
	 */
	constructor(source: WillAppear<JsonObject>) {
		super(source);

		if (source.payload.controller !== "Encoder") {
			throw new Error("Unable to create DialAction; source event is not a Encoder");
		}

		this.#coordinates = Object.freeze(source.payload.coordinates);
	}

	/**
	 * Coordinates of the dial.
	 * @returns The coordinates.
	 */
	public get coordinates(): Readonly<Coordinates> {
		return this.#coordinates;
	}

	/**
	 * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be updated. Layouts are a powerful way to provide dynamic information
	 * to users, and can be assigned in the manifest, or dynamically via {@link Action.setFeedbackLayout}.
	 *
	 * The {@link feedback} payload defines which items within the layout will be updated, and are identified by their property name (defined as the `key` in the layout's definition).
	 * The values can either by a complete new definition, a `string` for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
	 */
	public setFeedback(feedback: FeedbackPayload): Promise<void> {
		return connection.send({
			event: "setFeedback",
			context: this.id,
			payload: feedback,
		});
	}

	/**
	 * Sets the layout associated with this action instance. The layout must be either a built-in layout identifier, or path to a local layout JSON file within the plugin's folder.
	 * Use in conjunction with {@link Action.setFeedback} to update the layout's current items' settings.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(layout: string): Promise<void> {
		return connection.send({
			event: "setFeedbackLayout",
			context: this.id,
			payload: {
				layout,
			},
		});
	}

	/**
	 * Sets the {@link image} to be display for this action instance within Stream Deck app.
	 *
	 * NB: The image can only be set by the plugin when the the user has not specified a custom image.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `undefined`, the image from the manifest will be used.
	 * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
	 */
	public setImage(image?: string): Promise<void> {
		return connection.send({
			event: "setImage",
			context: this.id,
			payload: {
				image,
			},
		});
	}

	/**
	 * Sets the {@link title} displayed for this action instance.
	 *
	 * NB: The title can only be set by the plugin when the the user has not specified a custom title.
	 * @param title Title to display.
	 * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
	 */
	public setTitle(title: string): Promise<void> {
		return this.setFeedback({ title });
	}

	/**
	 * Sets the trigger (interaction) {@link descriptions} associated with this action instance. Descriptions are shown within the Stream Deck application, and informs the user what
	 * will happen when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part
	 * of the manifest.
	 *
	 * NB: Applies to encoders (dials / touchscreens) found on Stream Deck + devices.
	 * @param descriptions Descriptions that detail the action's interaction.
	 * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
	 */
	public setTriggerDescription(descriptions?: TriggerDescriptionOptions): Promise<void> {
		return connection.send({
			event: "setTriggerDescription",
			context: this.id,
			payload: descriptions || {},
		});
	}

	/**
	 * @inheritdoc
	 */
	public override toJSON(): object {
		return {
			...super.toJSON(),
			coordinates: this.coordinates,
		};
	}
}

/**
 * Options that define the trigger descriptions associated with an action.
 */
export type TriggerDescriptionOptions = KeyOf<SetTriggerDescription, "payload">;
