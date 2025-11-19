import { randomUUID } from "node:crypto";

import type {
	DidReceiveResources,
	DidReceiveSettings,
	GetResources,
	GetSettings,
	PluginEventMap,
	Resources,
} from "../../api/index.js";
import type { EventArgs } from "../../common/event-emitter.js";
import type { JsonObject } from "../../common/json.js";
import { PromiseCompletionSource } from "../../common/promises.js";
import { connection } from "../connection.js";
import { requiresVersion } from "../validation.js";
import { ActionContext } from "./context.js";
import type { DialAction } from "./dial.js";
import type { KeyAction } from "./key.js";

const REQUEST_TIMEOUT = 15 * 1000; // 15s

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export class Action<T extends JsonObject = JsonObject> extends ActionContext {
	/**
	 * Gets the resources (files) associated with this action; these resources are embedded into the
	 * action when it is exported, either individually, or as part of a profile.
	 *
	 * Available from Stream Deck 7.1.
	 * @returns The resources.
	 */
	public async getResources(): Promise<Resources> {
		requiresVersion(7.1, connection.version, "getResources");

		const res = await this.#fetch("getResources", "didReceiveResources");
		return res.payload.resources;
	}

	/**
	 * Gets the settings associated this action instance.
	 * @template U The type of settings associated with the action.D
	 * @returns Promise containing the action instance's settings.
	 */
	public async getSettings<U extends JsonObject = T>(): Promise<U> {
		const res = await this.#fetch("getSettings", "didReceiveSettings");
		return res.payload.settings as U;
	}

	/**
	 * Determines whether this instance is a dial.
	 * @returns `true` when this instance is a dial; otherwise `false`.
	 */
	public isDial(): this is DialAction {
		return this.controllerType === "Encoder";
	}

	/**
	 * Determines whether this instance is a key.
	 * @returns `true` when this instance is a key; otherwise `false`.
	 */
	public isKey(): this is KeyAction {
		return this.controllerType === "Keypad";
	}

	/**
	 * Sets the resources (files) associated with this action; these resources are embedded into the
	 * action when it is exported, either individually, or as part of a profile.
	 *
	 * Available from Stream Deck 7.1.
	 * @example
	 * action.setResources({
	 *   fileOne: "c:\\hello-world.txt",
	 *   anotherFile: "c:\\icon.png"
	 * });
	 * @param resources The resources as a map of file paths.
	 * @returns `Promise` resolved when the resources are saved to Stream Deck.
	 */
	public setResources(resources: Resources): Promise<void> {
		requiresVersion(7.1, connection.version, "setResources");

		return connection.send({
			event: "setResources",
			context: this.id,
			payload: resources,
		});
	}

	/**
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	public setSettings<U extends JsonObject = T>(settings: U): Promise<void> {
		return connection.send({
			event: "setSettings",
			context: this.id,
			payload: settings,
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return connection.send({
			event: "showAlert",
			context: this.id,
		});
	}

	/**
	 * Fetches information from Stream Deck by sending the command, and awaiting the event.
	 * @param command Name of the event (command) to send.
	 * @param event Name of the event to await.
	 * @returns The payload from the received event.
	 */
	async #fetch<TEvent extends DidReceiveEvent>(
		command: GetterEvent,
		event: TEvent,
	): Promise<EventArgs<PluginEventMap, TEvent>[0]> {
		const pcs = new PromiseCompletionSource<EventArgs<PluginEventMap, TEvent>[0]>();

		// Set a timeout to prevent endless awaiting.
		const timeoutId = setTimeout(() => {
			listener.dispose();
			pcs.setException("The request timed out");
		}, REQUEST_TIMEOUT);

		// Listen for an event that can resolve the request.
		const listener = connection.disposableOn(event, (ev): void => {
			// Make sure the received event is for this action.
			if (ev.context == this.id) {
				clearTimeout(timeoutId);
				listener.dispose();
				pcs.setResult(ev);
			}
		});

		// Send the request; specifying an id signifies its a request.
		await connection.send({
			event: command,
			context: this.id,
			id: randomUUID(),
		});

		return pcs.promise;
	}
}

/**
 * Events that represents a request for information from Stream Deck.
 */
type GetterEvent = (GetResources | GetSettings)["event"];

/**
 * Events that represents a response of information from Stream Deck.
 */
type DidReceiveEvent = (DidReceiveResources<JsonObject> | DidReceiveSettings<JsonObject>)["event"];
