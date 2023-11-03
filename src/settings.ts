import { StreamDeckConnection } from "./connectivity/connection";
import type { DidReceiveGlobalSettings, PayloadObject } from "./connectivity/events";
import { DidReceiveGlobalSettingsEvent } from "./events";

/**
 * Provides management of settings associated with the Stream Deck plugin.
 */
export class SettingsClient {
	/**
	 * Initializes a new instance of the {@link SettingsClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 */
	constructor(private readonly connection: StreamDeckConnection) {}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link SettingsClient.setGlobalSettings}.
	 * @template T The type of global settings associated with the plugin.
	 * @returns Promise containing the plugin's global settings.
	 */
	public getGlobalSettings<T extends PayloadObject<T> = object>(): Promise<T> {
		return new Promise((resolve) => {
			this.connection.once("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
			this.connection.send({
				event: "getGlobalSettings",
				context: this.connection.registrationParameters.pluginUUID
			});
		});
	}

	/**
	 * Occurs when the global settings are requested using {@link SettingsClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveGlobalSettings<T extends PayloadObject<T> = object>(listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => listener(new DidReceiveGlobalSettingsEvent(ev)));
	}

	/**
	 * Sets the global {@link settings} associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely. Use in
	 * conjunction with {@link SettingsClient.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
	 * @example
	 * streamDeck.settings.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	public setGlobalSettings<T>(settings: T): Promise<void> {
		return this.connection.send({
			event: "setGlobalSettings",
			context: this.connection.registrationParameters.pluginUUID,
			payload: settings
		});
	}
}
