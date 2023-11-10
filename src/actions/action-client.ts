import type { SetImage, SetTitle, SetTriggerDescription } from "../connectivity/commands";
import type { StreamDeckConnection } from "../connectivity/connection";
import type * as api from "../connectivity/events";
import type { State } from "../connectivity/events";
import type { FeedbackPayload } from "../connectivity/layouts";
import {
	ActionEvent,
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	KeyDownEvent,
	KeyUpEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../events";
import type { IActionContainer } from "./action-container";
import type { SingletonAction } from "./singleton-action";

/**
 * Client responsible for interacting with Stream Deck actions.
 */
export class ActionClient implements Pick<IActionContainer, "registerAction"> {
	/**
	 * Initializes a new instance of the {@link ActionClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param container Action container capable of resolving Stream Deck actions.
	 */
	constructor(
		private readonly connection: StreamDeckConnection,
		private readonly container: IActionContainer
	) {}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link ActionClient.onKeyDown}. Also see {@link ActionClient.onDialUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown<T extends api.PayloadObject<T> = object>(listener: (ev: DialDownEvent<T>) => void): void {
		this.connection.on("dialDown", (ev: api.DialDown<T>) => listener(new ActionEvent<api.DialDown<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate<T extends api.PayloadObject<T> = object>(listener: (ev: DialRotateEvent<T>) => void): void {
		this.connection.on("dialRotate", (ev: api.DialRotate<T>) => listener(new ActionEvent<api.DialRotate<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link ActionClient.onKeyUp}. Also see {@link ActionClient.onDialDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp<T extends api.PayloadObject<T> = object>(listener: (ev: DialUpEvent<T>) => void): void {
		this.connection.on("dialUp", (ev: api.DialUp<T>) => listener(new ActionEvent<api.DialUp<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link ActionClient.onDialDown}. Also see {@link ActionClient.onKeyUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown<T extends api.PayloadObject<T> = object>(listener: (ev: KeyDownEvent<T>) => void): void {
		this.connection.on("keyDown", (ev: api.KeyDown<T>) => listener(new ActionEvent<api.KeyDown<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link ActionClient.onDialUp}. Also see {@link ActionClient.onKeyDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp<T extends api.PayloadObject<T> = object>(listener: (ev: KeyUpEvent<T>) => void): void {
		this.connection.on("keyUp", (ev: api.KeyUp<T>) => listener(new ActionEvent<api.KeyUp<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link ActionClient.setTitle}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTitleParametersDidChange<T extends api.PayloadObject<T> = object>(listener: (ev: TitleParametersDidChangeEvent<T>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: api.TitleParametersDidChange<T>) =>
			listener(new ActionEvent<api.TitleParametersDidChange<T>>(this.container.resolveAction<T>(ev), ev))
		);
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap<TSettings extends api.PayloadObject<TSettings> = object>(listener: (ev: TouchTapEvent<TSettings>) => void): void {
		this.connection.on("touchTap", (ev: api.TouchTap<TSettings>) => listener(new ActionEvent<api.TouchTap<TSettings>>(this.container.resolveAction<TSettings>(ev), ev)));
	}

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillAppear<T extends api.PayloadObject<T> = object>(listener: (ev: WillAppearEvent<T>) => void): void {
		this.connection.on("willAppear", (ev: api.WillAppear<T>) => listener(new ActionEvent<api.WillAppear<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: WillDisappearEvent<T>) => void): void {
		this.connection.on("willDisappear", (ev: api.WillDisappear<T>) => listener(new ActionEvent<api.WillDisappear<T>>(this.container.resolveAction<T>(ev), ev)));
	}

	/**
	 * @inheritdoc
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings extends api.PayloadObject<TSettings> = object>(action: TAction): void {
		this.container.registerAction<TAction, TSettings>(action);
	}

	/**
	 * Sets the {@link feedback} for the layout associated with an action instance allowing for visual items to be updated. Layouts are a powerful way to provide dynamic information
	 * to users, and can be assigned in the manifest, or dynamically via {@link ActionClient.setFeedbackLayout}.
	 *
	 * The {@link feedback} payload defines which items within the layout should be updated, and are identified by their property name (defined as the `key` in the layout's definition).
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
	 * streamDeck.actions.setFeedback(ctx, {
	 *  // "text_item" matches a "key" within the layout's JSON file.
	 *   text_item: "Some new value"
	 * })
	 * ```
	 *
	 * Alternatively, more information can be updated.
	 * ```
	 * streamDeck.actions.setFeedback(ctx, {
	 *   text_item: { // <-- "text_item" matches a "key" within the layout's JSON file.
	 *     value: "Some new value",
	 *     alignment: "center"
	 *   }
	 * });
	 * ```
	 * @param context Unique identifier of the action instance whose feedback will be updated.
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
	 */
	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		return this.connection.send({
			event: "setFeedback",
			context,
			payload: feedback
		});
	}

	/**
	 * Sets the layout associated with an action instance, as identified by the {@link context}. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder. Use in conjunction with {@link ActionClient.setFeedback} to update the layouts current settings once it has been changed.
	 * @param context Unique identifier of the action instance whose layout will be updated.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		return this.connection.send({
			event: "setFeedbackLayout",
			context,
			payload: {
				layout
			}
		});
	}

	/**
	 * Sets the {@link image} displayed for an instance of an action, as identified by the {@link context}. **NB** This will be ignored if the user has chosen a custom image within
	 * the Stream Deck application.
	 * @param context Unique identifier of the action instance whose image will be updated.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param options Additional options that define where and how the image should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
	 */
	public setImage(context: string, image?: string, options?: ImageOptions): Promise<void> {
		return this.connection.send({
			event: "setImage",
			context,
			payload: {
				image,
				...options
			}
		});
	}

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.
	 * @param context Unique identifier of the action instance who state will be set.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(context: string, state: State): Promise<void> {
		return this.connection.send({
			event: "setState",
			context,
			payload: {
				state
			}
		});
	}

	/**
	 * Sets the {@link title} displayed for an instance of an action, as identified by the {@link context}. See also {@link ActionClient.onTitleParametersDidChange}.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when undefined the title within the manifest will be used. **NB.** the title will only be set if the user has not specified a custom title.
	 * @param options Additional options that define where and how the title should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
	 */
	public setTitle(context: string, title?: string, options?: TitleOptions): Promise<void> {
		return this.connection.send({
			event: "setTitle",
			context,
			payload: {
				title,
				...options
			}
		});
	}

	/**
	 * Sets the trigger (interaction) {@link descriptions} associated with an action. Descriptions are shown within the Stream Deck application, and informs the user what will happen
	 * when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part of the manifest.
	 * **NB** only applies to encoders as part of Stream Deck+ (dials / touchscreens).
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @param descriptions Descriptions that detail the action's interaction.
	 * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
	 */
	public setTriggerDescription(context: string, descriptions?: SetTriggerDescription["payload"]): Promise<void> {
		return this.connection.send({
			event: "setTriggerDescription",
			context,
			payload: descriptions || {}
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the {@link context}. Used to provide visual
	 * feedback when an action failed.
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(context: string): Promise<void> {
		return this.connection.send({
			event: "showAlert",
			context
		});
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the {@link context}. Used to provide visual feedback
	 * when an action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(context: string): Promise<void> {
		return this.connection.send({
			event: "showOk",
			context
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
