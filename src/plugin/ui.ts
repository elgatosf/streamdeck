import type { IDisposable } from "@elgato/utils";

import type { DidReceivePropertyInspectorMessage } from "../api/index.js";
import { ActionWithoutPayloadEvent } from "../common/events/action-event.js";
import type { JsonObject, JsonValue } from "../common/json.js";
import type { DialAction, KeyAction } from "./actions/index.js";
import { actionStore } from "./actions/store.js";
import { connection } from "./connection.js";
import {
	type PropertyInspectorDidAppearEvent,
	type PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
} from "./events/index.js";

/**
 * Controller capable of sending/receiving payloads with the property inspector, and listening for events.
 */
class UIController {
	/**
	 * Action associated with the current property inspector.
	 */
	#action: DialAction | KeyAction | undefined;

	/**
	 * To overcome event races, the debounce counter keeps track of appear vs disappear events, ensuring
	 * we only clear the current ui when an equal number of matching disappear events occur.
	 */
	#appearanceStackCount = 0;

	/**
	 * Initializes a new instance of the {@link UIController} class.
	 */
	constructor() {
		// Track the action for the current property inspector.
		this.onDidAppear((ev) => {
			if (this.#isCurrent(ev.action)) {
				this.#appearanceStackCount++;
			} else {
				this.#appearanceStackCount = 1;
				this.#action = ev.action;
			}
		});

		this.onDidDisappear((ev) => {
			if (this.#isCurrent(ev.action)) {
				this.#appearanceStackCount--;
				if (this.#appearanceStackCount <= 0) {
					this.#action = undefined;
				}
			}
		});
	}

	/**
	 * Gets the action associated with the current property.
	 * @returns The action; otherwise `undefined` when a property inspector is not visible.
	 */
	public get action(): DialAction | KeyAction | undefined {
		return this.#action;
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user
	 * selected an action in the Stream Deck application..
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidAppear<T extends JsonObject = JsonObject>(
		listener: (ev: PropertyInspectorDidAppearEvent<T>) => void,
	): IDisposable {
		return connection.disposableOn("propertyInspectorDidAppear", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionWithoutPayloadEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when the property inspector associated with the action disappears, i.e. the user unselected
	 * the action in the Stream Deck application.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidDisappear<T extends JsonObject = JsonObject>(
		listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void,
	): IDisposable {
		return connection.disposableOn("propertyInspectorDidDisappear", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionWithoutPayloadEvent(action, ev));
			}
		});
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onSendToPlugin<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		listener: (ev: SendToPluginEvent<TPayload, TSettings>) => void,
	): IDisposable {
		return connection.disposableOn("sendToPlugin", (ev) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(
					new SendToPluginEvent<TPayload, TSettings>(action, ev as DidReceivePropertyInspectorMessage<TPayload>),
				);
			}
		});
	}

	/**
	 * Sends the payload to the property inspector; the payload is only sent when the property inspector
	 * is visible for an action provided by this plugin.
	 * @param payload Payload to send.
	 */
	public async sendToPropertyInspector(payload: JsonValue): Promise<void> {
		if (this.#action) {
			await connection.send({
				event: "sendToPropertyInspector",
				context: this.#action.id,
				payload,
			});
		}
	}

	/**
	 * Determines whether the specified action is the action for the current property inspector.
	 * @param action Action to check against.
	 * @returns `true` when the actions are the same.
	 */
	#isCurrent(action: DialAction | KeyAction): boolean {
		return (
			this.#action?.id === action.id &&
			this.#action?.manifestId === action.manifestId &&
			this.#action?.device?.id === action.device.id
		);
	}
}

export const ui = new UIController();
export { type UIController };
