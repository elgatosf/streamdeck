import type { DialDown, DialRotate, DialUp, KeyDown, KeyUp, TitleParametersDidChange, TouchTap, WillAppear, WillDisappear } from "../../api";
import type { IDisposable } from "../../common/disposable";
import { ActionEvent } from "../../common/events";
import type { JsonObject } from "../../common/json";
import { connection } from "../connection";
import { devices } from "../devices";
import {
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
import { getManifest } from "../manifest";
import { onDidReceiveSettings } from "../settings";
import { ui } from "../ui";
import { Action, type ActionContext } from "./action";
import type { SingletonAction } from "./singleton-action";
import { actionStore } from "./store";

const manifest = getManifest();

/**
 * Occurs when the user presses a dial (Stream Deck +). See also {@link onDialUp}.
 *
 * NB: For other action types see {@link onKeyDown}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDialDown<T extends JsonObject = JsonObject>(listener: (ev: DialDownEvent<T>) => void): IDisposable {
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
export function onDialRotate<T extends JsonObject = JsonObject>(listener: (ev: DialRotateEvent<T>) => void): IDisposable {
	return connection.disposableOn("dialRotate", (ev: DialRotate<T>) => {
		const action = actionStore.getActionById(ev.context);
		if (action?.isDial()) {
			listener(new ActionEvent(action, ev));
		}
	});
}

/**
 * Occurs when the user releases a pressed dial (Stream Deck +). See also {@link onDialDown}.
 *
 * NB: For other action types see {@link onKeyUp}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDialUp<T extends JsonObject = JsonObject>(listener: (ev: DialUpEvent<T>) => void): IDisposable {
	return connection.disposableOn("dialUp", (ev: DialUp<T>) => {
		const action = actionStore.getActionById(ev.context);
		if (action?.isDial()) {
			listener(new ActionEvent(action, ev));
		}
	});
}

/**
 * Occurs when the user presses a action down. See also {@link onKeyUp}.
 *
 * NB: For dials / touchscreens see {@link onDialDown}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onKeyDown<T extends JsonObject = JsonObject>(listener: (ev: KeyDownEvent<T>) => void): IDisposable {
	return connection.disposableOn("keyDown", (ev: KeyDown<T>) => {
		const action = actionStore.getActionById(ev.context);
		if (action?.isKey() || action?.isMultiActionKey()) {
			listener(new ActionEvent(action, ev));
		}
	});
}

/**
 * Occurs when the user releases a pressed action. See also {@link onKeyDown}.
 *
 * NB: For dials / touchscreens see {@link onDialUp}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onKeyUp<T extends JsonObject = JsonObject>(listener: (ev: KeyUpEvent<T>) => void): IDisposable {
	return connection.disposableOn("keyUp", (ev: KeyUp<T>) => {
		const action = actionStore.getActionById(ev.context);
		if (action?.isKey() || action?.isMultiActionKey()) {
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
export function onTitleParametersDidChange<T extends JsonObject = JsonObject>(listener: (ev: TitleParametersDidChangeEvent<T>) => void): IDisposable {
	return connection.disposableOn("titleParametersDidChange", (ev: TitleParametersDidChange<T>) => {
		const action = actionStore.getActionById(ev.context);
		if (action?.isKey()) {
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
export function onTouchTap<T extends JsonObject = JsonObject>(listener: (ev: TouchTapEvent<T>) => void): IDisposable {
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
export function onWillAppear<T extends JsonObject = JsonObject>(listener: (ev: WillAppearEvent<T>) => void): IDisposable {
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
export function onWillDisappear<T extends JsonObject = JsonObject>(listener: (ev: WillDisappearEvent<T>) => void): IDisposable {
	return connection.disposableOn("willDisappear", (ev: WillDisappear<T>) => {
		const device = devices.getDeviceById(ev.device);
		if (device) {
			listener(
				new ActionEvent(
					{
						device,
						id: ev.context,
						manifestId: ev.action
					},
					ev
				)
			);
		}
	});
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
export function registerAction<TAction extends SingletonAction<TSettings>, TSettings extends JsonObject = JsonObject>(action: TAction): void {
	if (action.manifestId === undefined) {
		throw new Error("The action's manifestId cannot be undefined.");
	}

	if (!manifest.Actions.some((a) => a.UUID === action.manifestId)) {
		throw new Error(`The action's manifestId was not found within the manifest: ${action.manifestId}`);
	}

	// Routes an event to the action, when the applicable listener is defined on the action.
	const { manifestId } = action;
	const route = <TEventArgs extends RoutingEvent<TSettings>>(
		fn: (listener: (ev: TEventArgs) => void) => IDisposable,
		listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
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
	route(onDialDown, action.onDialDown);
	route(onDialUp, action.onDialUp);
	route(onDialRotate, action.onDialRotate);
	route(ui.onSendToPlugin, action.onSendToPlugin);
	route(onDidReceiveSettings, action.onDidReceiveSettings);
	route(onKeyDown, action.onKeyDown);
	route(onKeyUp, action.onKeyUp);
	route(ui.onDidAppear, action.onPropertyInspectorDidAppear);
	route(ui.onDidDisappear, action.onPropertyInspectorDidDisappear);
	route(onTitleParametersDidChange, action.onTitleParametersDidChange);
	route(onTouchTap, action.onTouchTap);
	route(onWillAppear, action.onWillAppear);
	route(onWillDisappear, action.onWillDisappear);
}

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends JsonObject> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T> | ActionContext;
};
