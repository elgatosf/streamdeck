import type { DidReceivePropertyInspectorMessage, PayloadObject, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../api";
import type { IDisposable } from "../common/disposable";
import { ActionWithoutPayloadEvent } from "../common/events";
import { Action } from "./actions/action";
import type { StreamDeckConnection } from "./connectivity/connection";
import { DidReceivePropertyInspectorMessageEvent, PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent } from "./events";

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
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link Action.sendToPropertyInspector}.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidReceivePropertyInspectorMessage<TPayload extends PayloadObject<TPayload> = object, TSettings extends PayloadObject<TSettings> = object>(
		listener: (ev: DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>) => void
	): IDisposable {
		return this.connection.disposableOn("sendToPlugin", (ev: DidReceivePropertyInspectorMessage<TPayload>) =>
			listener(new DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>(new Action<TSettings>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onPropertyInspectorDidAppear<T extends PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("propertyInspectorDidAppear", (ev) =>
			listener(new ActionWithoutPayloadEvent<PropertyInspectorDidAppear, Action<T>, T>(new Action<T>(this.connection, ev), ev))
		);
	}

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onPropertyInspectorDidDisappear<T extends PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
		return this.connection.disposableOn("propertyInspectorDidDisappear", (ev) =>
			listener(new ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, Action<T>, T>(new Action<T>(this.connection, ev), ev))
		);
	}
}
