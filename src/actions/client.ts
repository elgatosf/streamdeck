import type { SetImage, SetTitle } from "../connectivity/commands";
import type { StreamDeckConnection } from "../connectivity/connection";
import type * as api from "../connectivity/events";
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
}

/**
 * Options that define how to render an image associated with an action.
 */
export type ImageOptions = Omit<SetImage["payload"], "image">;

/**
 * Options that define how to render a title associated with an action.
 */
export type TitleOptions = Omit<SetTitle["payload"], "title">;
