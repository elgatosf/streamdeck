import type { IActionContainer } from "./actions/action-container";
import type { StreamDeckConnection } from "./connectivity/connection";
import type * as api from "./connectivity/events";
import { ActionWithoutPayloadEvent, PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent, SendToPluginEvent } from "./events";

/**
 * Client responsible for interacting with the Stream Deck UI (aka property inspector).
 */
export class UIClient {
	/**
	 *
	 * @param connection Underlying connection with the Stream Deck.
	 * @param container Action container capable of resolving Stream Deck actions.
	 */
	constructor(
		private readonly connection: StreamDeckConnection,
		private readonly container: IActionContainer
	) {}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: api.PropertyInspectorDidAppear) =>
			listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidAppear, T>(this.container.resolveAction<T>(ev), ev))
		);
	}

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link UIClient.onPropertyInspectorDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: api.PropertyInspectorDidDisappear) =>
			listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidDisappear, T>(this.container.resolveAction<T>(ev), ev))
		);
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link UIClient.sendToPropertyInspector}.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin<TPayload extends api.PayloadObject<TPayload> = object, TSettings extends api.PayloadObject<TSettings> = object>(
		listener: (ev: SendToPluginEvent<TPayload, TSettings>) => void
	): void {
		this.connection.on("sendToPlugin", (ev: api.SendToPlugin<TPayload>) => listener(new SendToPluginEvent<TPayload, TSettings>(this.container.resolveAction<TSettings>(ev), ev)));
	}

	/**
	 * Sends the {@link payload} to the current property inspector associated with an instance of an action, as identified by the {@link context}. The plugin can also receive information
	 * from the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the {@link payload} is only received by the property inspector
	 * when it is associated with the specified {@link context}.
	 * @param context Unique identifier of the action instance whose property inspector will receive the {@link payload}.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the {@link payload} to the property inspector has been sent to Stream Deck.
	 */
	public sendToPropertyInspector<T extends api.PayloadObject<T> = object>(context: string, payload: T): Promise<void> {
		return this.connection.send({
			event: "sendToPropertyInspector",
			context,
			payload
		});
	}
}
