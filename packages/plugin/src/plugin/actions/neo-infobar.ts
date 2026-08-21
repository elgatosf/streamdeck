import type { JsonObject } from "@elgato/utils";

import type { Coordinates, FeedbackPayload, WillAppear } from "../../api/index.js";
import { connection } from "../connection.js";
import { ActionBase } from "./action-base.js";

/**
 * Provides a contextualized instance of an infobar action found on Stream Deck Neo.
 * @template T The type of settings associated with the action.
 */
export class NeoInfobarAction<T extends JsonObject> extends ActionBase<T> {
	/**
	 * Private backing field for the coordinates.
	 */
	readonly #coordinates: Readonly<Coordinates>;

	/**
	 * Initializes a new instance of the {@see NeoInfobarAction} class.
	 * @param source Source of the action.
	 */
	constructor(source: WillAppear<JsonObject>) {
		super(source);

		if (source.payload.controller !== "Neo") {
			throw new Error("Unable to create InfobarAction; source event controller is not 'Infobar'");
		}

		this.#coordinates = Object.freeze(source.payload.coordinates);
	}

	/**
	 * Coordinates of the infobar.
	 * @returns The coordinates.
	 */
	public get coordinates(): Readonly<Coordinates> {
		return this.#coordinates;
	}

	/**
	 * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be
	 * updated. Layouts are a powerful way to provide dynamic information to users, and can be assigned in the manifest,
	 * or dynamically via `setFeedbackLayout`.
	 *
	 * The `feedback` payload defines which items within the layout will be updated, and are identified by their property
	 * name (defined as the `key` in the layout's definition). The values can either be a complete new definition, a `string`
	 * for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 */
	public setFeedback(feedback: FeedbackPayload): Promise<void> {
		return connection.send({
			event: "setFeedback",
			context: this.id,
			payload: feedback,
		});
	}

	/**
	 * Sets the layout associated with this action instance. The layout must be a path to a local layout JSON file within
	 * the plugin's folder. Use in conjunction with `setFeedback` to update the layout's current items' settings.
	 * @param layout Relative path to the layout file.
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
	 * @inheritdoc
	 */
	public override toJSON(): object {
		return {
			...super.toJSON(),
			coordinates: this.coordinates,
		};
	}
}
