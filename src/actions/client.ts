import { Manifest } from "..";
import type { SetImage, SetTitle } from "../api/command";
import type * as api from "../api/events";
import type { IDisposable } from "../common/disposable";
import type { StreamDeckConnection } from "../connectivity/connection";
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
import type { Logger } from "../logging";
import type { SettingsClient } from "../settings/client";
import type { UIClient } from "../ui";
import { Action } from "./action";
import type { SingletonAction } from "./singleton-action";

/**
 * Client responsible for interacting with Stream Deck actions.
 */
export class ActionClient {
	/**
	 * Logger scoped to this class.
	 */
	private readonly logger: Logger;

	/**
	 * Initializes a new instance of the {@link ActionClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param manifest Manifest associated with the plugin.
	 * @param settingsClient Client responsible for managing settings.
	 * @param uiClient Client responsible for interacting with the UI / property inspector.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(
		private readonly connection: StreamDeckConnection,
		private readonly manifest: Manifest,
		private readonly settingsClient: SettingsClient,
		private readonly uiClient: UIClient,
		logger: Logger
	) {
		this.logger = logger.createScope("ActionClient");
	}

	/**
	 * Creates an {@link Action} controller capable of interacting with Stream Deck.
	 * @param id The instance identifier of the action to control; identifiers are supplied as part of events emitted by this client, and are accessible via {@link Action.id}.
	 * @returns The {@link Action} controller.
	 */
	public createController<T extends api.PayloadObject<T> = object>(id: string): Omit<Action<T>, "manifestId"> {
		return new Action<T>(this.connection, {
			action: "",
			context: id
		});
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). Also see {@link ActionClient.onDialUp}.
	 *
	 * NB: For other action types see {@link ActionClient.onKeyDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialDown<T extends api.PayloadObject<T> = object>(listener: (ev: DialDownEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("dialDown", (ev: api.DialDown<T>) => listener(new ActionEvent<api.DialDown<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialRotate<T extends api.PayloadObject<T> = object>(listener: (ev: DialRotateEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("dialRotate", (ev: api.DialRotate<T>) => listener(new ActionEvent<api.DialRotate<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). Also see {@link ActionClient.onDialDown}.
	 *
	 * NB: For other action types see {@link ActionClient.onKeyUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialUp<T extends api.PayloadObject<T> = object>(listener: (ev: DialUpEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("dialUp", (ev: api.DialUp<T>) => listener(new ActionEvent<api.DialUp<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when the user presses a action down. Also see {@link ActionClient.onKeyUp}.
	 *
	 * NB: For dials / touchscreens see {@link ActionClient.onDialDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onKeyDown<T extends api.PayloadObject<T> = object>(listener: (ev: KeyDownEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("keyDown", (ev: api.KeyDown<T>) => listener(new ActionEvent<api.KeyDown<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. Also see {@link ActionClient.onKeyDown}.
	 *
	 * NB: For dials / touchscreens see {@link ActionClient.onDialUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onKeyUp<T extends api.PayloadObject<T> = object>(listener: (ev: KeyUpEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("keyUp", (ev: api.KeyUp<T>) => listener(new ActionEvent<api.KeyUp<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link ActionClient.setTitle}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onTitleParametersDidChange<T extends api.PayloadObject<T> = object>(listener: (ev: TitleParametersDidChangeEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("titleParametersDidChange", (ev: api.TitleParametersDidChange<T>) =>
			listener(new ActionEvent<api.TitleParametersDidChange<T>>(new Action<T>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onTouchTap<TSettings extends api.PayloadObject<TSettings> = object>(listener: (ev: TouchTapEvent<TSettings>) => void): IDisposable {
		return this.connection.disposableOn("touchTap", (ev: api.TouchTap<TSettings>) =>
			listener(new ActionEvent<api.TouchTap<TSettings>>(new Action<TSettings>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onWillAppear<T extends api.PayloadObject<T> = object>(listener: (ev: WillAppearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("willAppear", (ev: api.WillAppear<T>) => listener(new ActionEvent<api.WillAppear<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onWillDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: WillDisappearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("willDisappear", (ev: api.WillDisappear<T>) => listener(new ActionEvent<api.WillDisappear<T>>(new Action<T>(this.connection, ev), ev)));
	}

	/**
	 * Registers the action with the Stream Deck, routing all events associated with the {@link SingletonAction.manifestId} to the specified {@link action}.
	 * @param action The action to register.
	 * @example
	 * ＠action({ UUID: "com.elgato.test.action" })
	 * class MyCustomAction extends SingletonAction {
	 *     public onKeyDown(ev: KeyDownEvent) {
	 *         // Do some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.actions.registerAction(new MyCustomAction());
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings extends api.PayloadObject<TSettings> = object>(action: TAction): void {
		if (action.manifestId === undefined) {
			throw new Error("The action's manifestId cannot be undefined.");
		}

		if (!this.manifest.Actions.some((a) => a.UUID === action.manifestId)) {
			this.logger.warn(`Failed to route action: manifestId (UUID) ${action.manifestId} was not found in the manifest.`);
			return;
		}

		const addEventListener = <TClient, TEventArgs extends RoutingEvent<TSettings>>(
			manifestId: string,
			client: TClient,
			eventFn: (client: TClient) => (listener: (ev: TEventArgs) => void) => void,
			listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
		): void => {
			const boundedListener = listener?.bind(action);
			if (boundedListener === undefined) {
				return;
			}

			eventFn(client).bind(client)(async (ev) => {
				if (ev.action.manifestId == manifestId) {
					await boundedListener(ev);
				}
			});
		};

		addEventListener(action.manifestId, this, (emitter) => emitter.onDialDown, action.onDialDown);
		addEventListener(action.manifestId, this, (emitter) => emitter.onDialUp, action.onDialUp);
		addEventListener(action.manifestId, this, (emitter) => emitter.onDialRotate, action.onDialRotate);
		addEventListener(action.manifestId, this, (emitter) => emitter.onKeyDown, action.onKeyDown);
		addEventListener(action.manifestId, this, (emitter) => emitter.onKeyUp, action.onKeyUp);
		addEventListener(action.manifestId, this, (emitter) => emitter.onTitleParametersDidChange, action.onTitleParametersDidChange);
		addEventListener(action.manifestId, this, (emitter) => emitter.onTouchTap, action.onTouchTap);
		addEventListener(action.manifestId, this, (emitter) => emitter.onWillAppear, action.onWillAppear);
		addEventListener(action.manifestId, this, (emitter) => emitter.onWillDisappear, action.onWillDisappear);

		addEventListener(action.manifestId, this.settingsClient, (emitter) => emitter.onDidReceiveSettings, action.onDidReceiveSettings);

		addEventListener(action.manifestId, this.uiClient, (emitter) => emitter.onPropertyInspectorDidAppear, action.onPropertyInspectorDidAppear);
		addEventListener(action.manifestId, this.uiClient, (emitter) => emitter.onPropertyInspectorDidDisappear, action.onPropertyInspectorDidDisappear);
		addEventListener(action.manifestId, this.uiClient, (emitter) => emitter.onSendToPlugin, action.onSendToPlugin);
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
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends api.PayloadObject<T>> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T>;
};
