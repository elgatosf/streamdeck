import type { Coordinates, State } from "../../api";
import type { JsonObject } from "../../common/json";
import { connection } from "../connection";
import { Action, type ActionType, type CoordinatedActionContext, type ImageOptions, type TitleOptions } from "./action";

/**
 * Provides a contextualized instance of a key action.
 * @template T The type of settings associated with the action.
 */
export class KeyAction<T extends JsonObject = JsonObject> extends Action<T> implements CoordinatedActionContext {
	/**
	 * The action context.
	 */
	readonly #context: CoordinatedActionContext;

	/**
	 * Initializes a new instance of the {@see KeyAction} class.
	 * @param context Action context.
	 */
	constructor(context: CoordinatedActionContext) {
		super(context);
		this.#context = context;
	}

	/**
	 * @inheritdoc
	 */
	public get coordinates(): Coordinates {
		return this.#context.coordinates;
	}

	/**
	 * @inheritdoc
	 */
	protected override get type(): ActionType {
		return "Key";
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
		return connection.send({
			event: "setImage",
			context: this.id,
			payload: {
				image,
				...options
			}
		});
	}

	/**
	 * Sets the current {@link state} of this action instance; only applies to actions that have multiple states defined within the manifest.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(state: State): Promise<void> {
		return connection.send({
			event: "setState",
			context: this.id,
			payload: {
				state
			}
		});
	}

	/**
	 * Sets the {@link title} displayed for this action instance.
	 *
	 * NB: The title can only be set by the plugin when the the user has not specified a custom title.
	 * @param title Title to display; when `undefined` the title within the manifest will be used.
	 * @param options Additional options that define where and how the title should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
	 */
	public setTitle(title?: string, options?: TitleOptions): Promise<void> {
		return connection.send({
			event: "setTitle",
			context: this.id,
			payload: {
				title,
				...options
			}
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return connection.send({
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
		return connection.send({
			event: "showOk",
			context: this.id
		});
	}
}
