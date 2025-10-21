import type {
	DialDown,
	DialRotate,
	DialUp,
	DidReceiveResources,
	KeyDown,
	KeyUp,
	Manifest,
	TitleParametersDidChange,
	TouchTap,
	WillAppear,
	WillDisappear,
} from "../../api";
import type { IDisposable } from "../../common/disposable";
import { ActionEvent } from "../../common/events";
import type { JsonObject } from "../../common/json";
import { Lazy } from "../../common/lazy";
import { connection } from "../connection";
import {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveResourcesEvent,
	KeyDownEvent,
	KeyUpEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent,
} from "../events";
import { getManifest } from "../manifest";
import { onDidReceiveSettings } from "../settings";
import { ui } from "../ui";
import { Action } from "./action";
import { ActionContext } from "./context";
import { DialAction } from "./dial";
import { KeyAction } from "./key";
import type { SingletonAction } from "./singleton-action";
import { actionStore, ReadOnlyActionStore } from "./store";

const manifest = new Lazy<Manifest | null>(() => getManifest());

/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
class ActionService extends ReadOnlyActionStore {
	/**
	 * Initializes a new instance of the {@link ActionService} class.
	 */
	constructor() {
		super();

		// Adds the action to the store.
		connection.prependListener("willAppear", (ev) => {
			const action = ev.payload.controller === "Encoder" ? new DialAction(ev) : new KeyAction(ev);
			actionStore.set(action);
		});

		// Remove the action from the store.
		connection.prependListener("willDisappear", (ev) => actionStore.delete(ev.context));
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck +).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialDown<T extends JsonObject = JsonObject>(listener: (ev: DialDownEvent<T>) => void): IDisposable {
		return connection.disposableOn("dialDown", (ev: DialDown<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isDial()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck +).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialRotate<T extends JsonObject = JsonObject>(listener: (ev: DialRotateEvent<T>) => void): IDisposable {
		return connection.disposableOn("dialRotate", (ev: DialRotate<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isDial()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck +).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDialUp<T extends JsonObject = JsonObject>(listener: (ev: DialUpEvent<T>) => void): IDisposable {
		return connection.disposableOn("dialUp", (ev: DialUp<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isDial()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the resources were updated within the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidReceiveResources<T extends JsonObject = JsonObject>(
		listener: (ev: DidReceiveResourcesEvent<T>) => void,
	): IDisposable {
		return connection.disposableOn("didReceiveResources", (ev: DidReceiveResources<T>) => {
			// When the id is defined, the resources were request, so we don't propagate the event.
			if (ev.id !== undefined) {
				return;
			}

			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user presses a action down.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onKeyDown<T extends JsonObject = JsonObject>(listener: (ev: KeyDownEvent<T>) => void): IDisposable {
		return connection.disposableOn("keyDown", (ev: KeyDown<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isKey()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user releases a pressed action.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onKeyUp<T extends JsonObject = JsonObject>(listener: (ev: KeyUpEvent<T>) => void): IDisposable {
		return connection.disposableOn("keyUp", (ev: KeyUp<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isKey()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. See also {@link Action.setTitle}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onTitleParametersDidChange<T extends JsonObject = JsonObject>(
		listener: (ev: TitleParametersDidChangeEvent<T>) => void,
	): IDisposable {
		return connection.disposableOn("titleParametersDidChange", (ev: TitleParametersDidChange<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck +).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onTouchTap<T extends JsonObject = JsonObject>(listener: (ev: TouchTapEvent<T>) => void): IDisposable {
		return connection.disposableOn("touchTap", (ev: TouchTap<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action?.isDial()) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onWillAppear<T extends JsonObject = JsonObject>(listener: (ev: WillAppearEvent<T>) => void): IDisposable {
		return connection.disposableOn("willAppear", (ev: WillAppear<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onWillDisappear<T extends JsonObject = JsonObject>(
		listener: (ev: WillDisappearEvent<T>) => void,
	): IDisposable {
		return connection.disposableOn("willDisappear", (ev: WillDisappear<T>) =>
			listener(new ActionEvent(new ActionContext(ev), ev)),
		);
	}

	/**
	 * Registers the action with the Stream Deck, routing all events associated with the {@link SingletonAction.manifestId} to the specified {@link action}.
	 * @param action The action to register.
	 * @example
	 * ＠action({ UUID: "com.elgato.test.action" })
	 * class MyCustomAction extends SingletonAction {
	 *     export function onKeyDown(ev: KeyDownEvent) {
	 *         // Do some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.actions.registerAction(new MyCustomAction());
	 */
	public registerAction<TAction extends SingletonAction<TSettings>, TSettings extends JsonObject = JsonObject>(
		action: TAction,
	): void {
		if (action.manifestId === undefined) {
			throw new Error("The action's manifestId cannot be undefined.");
		}

		if (manifest.value !== null && !manifest.value.Actions.some((a) => a.UUID === action.manifestId)) {
			throw new Error(`The action's manifestId was not found within the manifest: ${action.manifestId}`);
		}

		// Routes an event to the action, when the applicable listener is defined on the action.
		const { manifestId } = action;
		const route = <TEventArgs extends RoutingEvent<TSettings>>(
			fn: (listener: (ev: TEventArgs) => void) => IDisposable,
			listener: ((ev: TEventArgs) => Promise<void> | void) | undefined,
		): void => {
			const boundedListener = listener?.bind(action);
			if (boundedListener === undefined) {
				return;
			}

			fn.bind(action)(async (ev) => {
				if (ev.action.manifestId == manifestId) {
					await boundedListener(ev);
				}
			});
		};

		// Route each of the action events.
		route(this.onDialDown, action.onDialDown);
		route(this.onDialUp, action.onDialUp);
		route(this.onDialRotate, action.onDialRotate);
		route(ui.onSendToPlugin, action.onSendToPlugin);
		route(this.onDidReceiveResources, action.onDidReceiveResources);
		route(onDidReceiveSettings, action.onDidReceiveSettings);
		route(this.onKeyDown, action.onKeyDown);
		route(this.onKeyUp, action.onKeyUp);
		route(ui.onDidAppear, action.onPropertyInspectorDidAppear);
		route(ui.onDidDisappear, action.onPropertyInspectorDidDisappear);
		route(this.onTitleParametersDidChange, action.onTitleParametersDidChange);
		route(this.onTouchTap, action.onTouchTap);
		route(this.onWillAppear, action.onWillAppear);
		route(this.onWillDisappear, action.onWillDisappear);
	}
}

/**
 * Service for interacting with Stream Deck actions.
 */
export const actionService = new ActionService();

export { type ActionService };

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends JsonObject> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T> | ActionContext;
};
