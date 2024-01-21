import type * as api from "../api/events";
import { Action } from "./actions/action";
import type { IDisposable } from "./common/disposable";
import type { StreamDeckConnection } from "./connectivity/connection";
import { ActionWithoutPayloadEvent, PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent, SendToPluginEvent } from "./events";

/**
 * Client responsible for interacting with the Stream Deck UI (aka property inspector).
 */
export class UIClient {
	/**
	 *
	 * @param connection Connection with Stream Deck.
	 */
	constructor(private readonly connection: StreamDeckConnection) {}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onPropertyInspectorDidAppear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("propertyInspectorDidAppear", (ev) =>
			listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidAppear, T>(new Action<T>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onPropertyInspectorDidDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("propertyInspectorDidDisappear", (ev) =>
			listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidDisappear, T>(new Action<T>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link Action.sendToPropertyInspector}.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onSendToPlugin<TPayload extends api.PayloadObject<TPayload> = object, TSettings extends api.PayloadObject<TSettings> = object>(
		listener: (ev: SendToPluginEvent<TPayload, TSettings>) => void
	): IDisposable {
		return this.connection.disposableOn("sendToPlugin", (ev: api.SendToPlugin<TPayload>) =>
			listener(new SendToPluginEvent<TPayload, TSettings>(new Action<TSettings>(this.connection, ev), ev))
		);
	}
}
