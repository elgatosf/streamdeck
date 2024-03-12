import type { DidReceivePropertyInspectorMessage, PayloadObject, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../api";
import type { IDisposable } from "../common/disposable";
import { ActionWithoutPayloadEvent } from "../common/events";
import { Action } from "./actions/action";
import { connection } from "./connection";
import { DidReceivePropertyInspectorMessageEvent, PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent } from "./events";

/**
 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link Action.sendToPropertyInspector}.
 * @template TPayload The type of the payload received from the property inspector.
 * @template TSettings The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceivePropertyInspectorMessage<TPayload extends PayloadObject<TPayload> = object, TSettings extends PayloadObject<TSettings> = object>(
	listener: (ev: DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>) => void
): IDisposable {
	return connection.disposableOn("sendToPlugin", (ev: DidReceivePropertyInspectorMessage<TPayload>) =>
		listener(new DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>(new Action<TSettings>(ev), ev))
	);
}

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link onPropertyInspectorDidDisappear}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onPropertyInspectorDidAppear<T extends PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
	return connection.disposableOn("propertyInspectorDidAppear", (ev) => listener(new ActionWithoutPayloadEvent<PropertyInspectorDidAppear, Action<T>, T>(new Action<T>(ev), ev)));
}

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link onPropertyInspectorDidAppear}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onPropertyInspectorDidDisappear<T extends PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
	return connection.disposableOn("propertyInspectorDidDisappear", (ev) =>
		listener(new ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, Action<T>, T>(new Action<T>(ev), ev))
	);
}
