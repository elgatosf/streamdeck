import { randomUUID } from "node:crypto";

import type { DidReceiveResources, DidReceiveSettings, Resources } from "../../api/index.js";
import type { JsonObject } from "../../common/json.js";
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
	public getResources(): Promise<Resources> {
		requiresVersion(7.1, connection.version, "getResources");

		return new Promise((resolve, reject) => {
			const id = randomUUID();
			const timeoutId = setTimeout(() => {
				connection.removeListener("didReceiveResources", callback);
				reject("The request timed out");
			}, REQUEST_TIMEOUT);

			const callback = (ev: DidReceiveResources<JsonObject>): void => {
				if (ev.context == this.id && ev.id === id) {
					clearTimeout(timeoutId);
					connection.removeListener("didReceiveResources", callback);
					resolve(ev.payload.resources);
				}
			};

			connection.on("didReceiveResources", callback);
			connection.send({
				event: "getResources",
				context: this.id,
				id,
			});
		});
	}

	/**
	 * Gets the settings associated this action instance.
	 * @template U The type of settings associated with the action.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<U extends JsonObject = T>(): Promise<U> {
		return new Promise((resolve) => {
			const callback = (ev: DidReceiveSettings<U>): void => {
				if (ev.context == this.id) {
					resolve(ev.payload.settings);
					connection.removeListener("didReceiveSettings", callback);
				}
			};

			connection.on("didReceiveSettings", callback);
			connection.send({
				event: "getSettings",
				context: this.id,
				id: randomUUID(),
			});
		});
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
}
