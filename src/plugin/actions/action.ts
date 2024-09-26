import type { DidReceiveSettings } from "../../api";
import type { JsonObject } from "../../common/json";
import { connection } from "../connection";
import { ActionContext } from "./context";
import type { DialAction } from "./dial";
import type { KeyAction } from "./key";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export class Action<T extends JsonObject = JsonObject> extends ActionContext {
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
				context: this.id
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
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	public setSettings<U extends JsonObject = T>(settings: U): Promise<void> {
		return connection.send({
			event: "setSettings",
			context: this.id,
			payload: settings
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(): Promise<void> {
		return connection.send({
			event: "showAlert",
			context: this.id
		});
	}
}
