import type { JsonObject } from "@elgato/utils";

import type { Coordinates, FeedbackPayload, SetTriggerDescription, WillAppear } from "../../../api/index.js";
import { connection } from "../../connection.js";
import { ActionBase } from "./action-base.js";

/**
 * Provides a contextualized instance of a dial action.
 * @template TSettings The type of settings associated with the action.
 */
export class DialAction<TSettings extends JsonObject> extends ActionBase<TSettings> {
	/**
	 * Private backing field for the coordinates.
	 */
	readonly #coordinates: Readonly<Coordinates>;

	/**
	 * Initializes a new instance of the {@see DialAction} class.
	 * @param source Source of the action.
	 */
	constructor(source: WillAppear<TSettings>) {
		super(source);

		if (source.payload.controller !== "Encoder") {
			throw new Error("Unable to create DialAction; source event is not a Encoder");
		}

		this.#coordinates = Object.freeze(source.payload.coordinates);

		if (this.onDialDown) {
			connection.on(`dialDown:${source.action}:${source.context}`, () => this.onDialDown?.(), {
				signal: this.disposeSignal,
			});
		}

		if (this.onDialRotate) {
			connection.on(
				`dialRotate:${source.action}:${source.context}`,
				({ payload: { pressed, ticks } }) => this.onDialRotate?.({ pressed, ticks }),
				{ signal: this.disposeSignal },
			);
		}

		if (this.onDialUp) {
			connection.on(`dialUp:${source.action}:${source.context}`, () => this.onDialUp?.(), {
				signal: this.disposeSignal,
			});
		}

		if (this.onTouchTap) {
			connection.on(
				`touchTap:${source.action}:${source.context}`,
				(ev) => this.onTouchTap?.({ hold: ev.payload.hold, tapPos: ev.payload.tapPos }),
				{ signal: this.disposeSignal },
			);
		}
	}

	/**
	 * Coordinates of the dial.
	 * @returns The coordinates.
	 */
	public get coordinates(): Readonly<Coordinates> {
		return this.#coordinates;
	}

	/**
	 * Occurs when the user presses the dial.
	 */
	public onDialDown?(): Promise<void> | void;

	/**
	 * Occurs when the user rotates the dial.
	 * @param args Arguments that contain information about the rotation.
	 */
	public onDialRotate?(args: DialRotateArgs): Promise<void> | void;

	/**
	 * Occurs when the user releases the pressed dial.
	 */
	public onDialUp?(): Promise<void> | void;

	/**
	 * Occurs when the user taps the touchscreen.
	 * @param args Arguments that contain information about the tap.
	 */
	public onTouchTap?(args: TouchTapArgs): Promise<void> | void;

	/**
	 * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be updated. Layouts are a powerful way to provide dynamic information
	 * to users, and can be assigned in the manifest, or dynamically via {@link DialAction.setFeedbackLayout}.
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
	 * Use in conjunction with {@link DialAction.setFeedback} to update the layout's current items' settings.
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
	 * Shows a temporary alert (i.e. warning) indicator on the touch strip associated with the action.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return connection.send({
			event: "showAlert",
			context: this.id,
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
export type TriggerDescriptionOptions = SetTriggerDescription["payload"];

/**
 * Arguments provided when the user rotates a dial.
 */
export interface DialRotateArgs {
	/**
	 * Determines whether the dial was pressed whilst the rotation occurred.
	 */
	readonly pressed: boolean;

	/**
	 * Number of ticks the dial was rotated; this can be a positive (clockwise) or negative (counter-clockwise) number.
	 */
	readonly ticks: number;
}

/**
 * Arguments provided when the user taps the touchscreen.
 */
export interface TouchTapArgs {
	/**
	 * Determines whether the tap was considered "held".
	 */
	readonly hold: boolean;

	/**
	 * Coordinates of where the touchscreen tap occurred, relative to the canvas of the action.
	 */
	readonly tapPos: readonly [x: number, y: number];
}
